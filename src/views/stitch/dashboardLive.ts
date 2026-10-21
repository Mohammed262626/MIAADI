import { escapeHtml, formatTime, formatArabicDate, localDateISO, translateAuthError } from "../../lib/format";
import { getAdminAppointments, getDoctorProfile, findDoctorByUser, getDoctorAvailability, updateAppointmentState, cancelAppointmentClinic, updatePatientProfile, updatePassword } from "../../lib/supabase";
import { confirmSheet } from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { initials, money } from "../../components/ui";
import { specialtyLabel } from "./specialtyContent";

type Row = {
  appointment_id: string; patient_name: string; patient_phone: string; doctor_name: string;
  doctor_specialization: string; consultation_fee: number; available_date: string;
  start_time: string; end_time: string; status: string; doctor_id: string;
};
type AvRule = { day_of_week: number; start_time: string; end_time: string; is_enabled: boolean };
type User = { id: string; email?: string; profile?: { full_name?: string; phone?: string; role?: string } | null } | null;
type Filter = "all" | "waiting" | "completed" | "cancelled" | "no_show";

/* The dashboard is a single page: the sidebar swaps these panels in place and
   never navigates away from #admin. */
export type DashView = "overview" | "appointments" | "schedule" | "account";
export type DashboardHooks = {
  renderAppointments?: (host: HTMLElement) => Promise<void> | void;
  renderSchedule?: (host: HTMLElement, doctorId: string | null) => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
  initialView?: DashView;
};

const toMin = (t: string) => { const [h, m] = String(t).split(":"); return Number(h) * 60 + Number(m || 0); };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const plus30 = (t: string) => { const total = toMin(t) + 30; return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0"); };
const isCancelled = (s: string) => String(s).startsWith("cancelled");
const waitText = (mins: number) => (mins <= 0 ? "الآن" : mins < 60 ? `${mins} دقيقة` : `${Math.floor(mins / 60)} س ${mins % 60} د`);

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: "all", label: "الكل", icon: "layers" },
  { key: "waiting", label: "قيد الانتظار", icon: "hourglass_top" },
  { key: "completed", label: "مكتمل", icon: "task_alt" },
  { key: "cancelled", label: "ملغي", icon: "event_busy" },
  { key: "no_show", label: "غياب", icon: "person_off" },
];

function matches(rows: Row[], f: Filter, q: string) {
  const needle = q.trim().toLowerCase();
  return rows.filter((r) => {
    const okFilter = f === "all" ? true : f === "waiting" ? r.status === "booked" : f === "cancelled" ? isCancelled(r.status) : r.status === f;
    if (!okFilter) return false;
    if (!needle) return true;
    return `${r.patient_name} ${r.patient_phone} ${r.doctor_name}`.toLowerCase().includes(needle);
  });
}

export async function wireDoctorDashboard(appEl: HTMLElement, user: User, hooks: DashboardHooks = {}) {
  const dbAside = appEl.querySelector<HTMLElement>("aside.fixed");
  const dbBackdrop = appEl.querySelector<HTMLElement>("#db-backdrop");
  const closeDbDrawer = () => { dbAside?.classList.add("max-lg:hidden"); dbBackdrop?.classList.add("hidden"); };
  appEl.querySelector<HTMLButtonElement>("#db-menu-btn")?.addEventListener("click", () => {
    dbAside?.classList.remove("max-lg:hidden");
    dbBackdrop?.classList.remove("hidden");
  });
  dbBackdrop?.addEventListener("click", closeDbDrawer);
  appEl.querySelector("aside.fixed nav")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) closeDbDrawer();
  });

  const host = appEl.querySelector<HTMLElement>("#db-content");
  if (!host) return;
  const fixtureMode = import.meta.env.DEV && new URLSearchParams(location.search).has("fixture");
  if (!user && fixtureMode) user = { id: "fixture", profile: { full_name: "د. طارق المنصور", role: "doctor" } };
  const role = (user?.profile?.role || "") as string;
  if (!user || (role !== "admin" && role !== "doctor")) return;
  const me = user;

  const panel = (sel: string) => appEl.querySelector<HTMLElement>(sel);
  const setText = (sel: string, value: string) => { const el = panel(sel); if (el) el.textContent = value; };

  let filter: Filter = "all";
  let query = "";
  let rows: Row[] = [];
  let live = false;
  let doctorId: string | null = null;
  let docProfile: Awaited<ReturnType<typeof getDoctorProfile>> | null = null;
  let currentView: DashView = hooks.initialView || "overview";

  setText("#db-sync", "جاري التحديث…");
  host.innerHTML = `<div class="flex h-64 items-center justify-center gap-2 rounded-xl border border-line bg-surface-container-lowest text-[14px] text-on-surface-variant">
    <span class="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">progress_activity</span> جاري تحميل لوحة العيادة…</div>`;

  const reload = async () => {
    try { await load(); }
    catch (e) {
      showToast(translateAuthError(e), "error");
      host.innerHTML = `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest p-6 text-center text-[14px] text-on-surface-variant">
        <span class="material-symbols-outlined text-[36px]">cloud_off</span>
        <span>تعذر تحميل بيانات العيادة — ${escapeHtml(translateAuthError(e))}</span>
      </div>`;
    }
  };

  /* One page, four panels — the sidebar swaps content in place and the URL
     never changes. Each panel keeps its own host so switching is instant. */
  const VIEW_HOSTS: Record<DashView, string> = {
    overview: "#db-content",
    appointments: "#db-view-appointments",
    schedule: "#db-view-schedule",
    account: "#db-view-account",
  };
  const NAV_ON = ["bg-surface-container-highest", "text-on-surface", "font-semibold"];
  const NAV_OFF = ["text-on-surface-variant", "hover:bg-surface-container-high", "hover:text-on-surface"];
  const pendingHtml = (label: string) => `<div class="flex h-64 items-center justify-center gap-2 rounded-xl border border-line bg-surface-container-lowest text-[14px] text-on-surface-variant"><span class="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">progress_activity</span> ${escapeHtml(label)}</div>`;
  const failureHtml = (e: unknown) => `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest p-6 text-center text-[14px] text-on-surface-variant"><span class="material-symbols-outlined text-[36px]">cloud_off</span><span>تعذر تحميل هذا القسم — ${escapeHtml(translateAuthError(e))}</span></div>`;

  const paintNav = () => {
    appEl.querySelectorAll<HTMLElement>(".dash-nav").forEach((item) => {
      const on = item.dataset.view === currentView;
      NAV_ON.forEach((c) => item.classList.toggle(c, on));
      NAV_OFF.forEach((c) => item.classList.toggle(c, !on));
      if (on) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  };

  /* Account panel: the doctor's own profile — editable name/phone, password,
     and a logout button, so nothing forces them into the patient pages. */
  const paintAccountPanel = (target: HTMLElement) => {
    const name = me.profile?.full_name || "";
    const phone = me.profile?.phone || "";
    const email = me.email || "";
    const roleLabel = role === "admin" ? "مشرف النظام" : "طبيب";
    const info: [string, string][] = docProfile
      ? [
        ["التخصص", specialtyLabel(docProfile.specialization)],
        ["المدينة", docProfile.city || "—"],
        ["سعر الكشفية", money(docProfile.consultation_fee)],
        ["المستشفى", docProfile.hospital_name || "غير مسجّل"],
      ]
      : [];

    target.innerHTML = `
      <div class="flex flex-col gap-space-lg">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-[18px] font-bold text-primary">${escapeHtml(initials(name))}</div>
            <div class="min-w-0">
              <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">${escapeHtml(name || "مستخدم ميعادي")}</h2>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 text-[12px] text-on-surface-variant"><span class="material-symbols-outlined text-[14px]" aria-hidden="true">shield_person</span>${escapeHtml(roleLabel)}</span>
                ${docProfile && doctorId ? `<a href="#doctor/${escapeHtml(doctorId)}" class="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10" title="كما يراها المرضى">صفحتي العامة<span class="material-symbols-outlined text-[14px]" aria-hidden="true">open_in_new</span></a>` : ""}
              </div>
            </div>
          </div>
          <button id="ac-logout" type="button" class="flex items-center gap-space-xs rounded-lg px-4 py-2.5 font-label-md text-label-md font-bold text-error transition-colors hover:bg-error-container/40"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>تسجيل الخروج</button>
        </div>

        <div class="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
          <section class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
            <h3 class="font-label-lg text-label-lg font-bold text-on-surface">البيانات الأساسية</h3>
            <p class="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">الاسم والجوال المرتبطان بحسابك.</p>
            <div class="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <label class="font-label-sm text-label-sm text-secondary">الاسم الكامل
                <input id="ac-name" type="text" value="${escapeHtml(name)}" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-[14px] text-on-surface outline-none transition-colors focus:border-primary" />
              </label>
              <label class="font-label-sm text-label-sm text-secondary">رقم الجوال
                <input id="ac-phone" type="tel" dir="ltr" value="${escapeHtml(phone)}" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-left text-[14px] tabular-nums text-on-surface outline-none transition-colors focus:border-primary" />
              </label>
            </div>
            <button id="ac-save" type="button" class="mt-space-md flex items-center gap-space-xs rounded-lg bg-primary px-4 py-2.5 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary-container"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">save</span>حفظ التغييرات</button>
          </section>

          <section class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
            <h3 class="font-label-lg text-label-lg font-bold text-on-surface">البريد وكلمة المرور</h3>
            <p class="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">البريد المرتبط بالحساب وكلمة مرور جديدة.</p>
            <span class="mt-space-md block font-label-sm text-label-sm text-secondary">البريد الإلكتروني</span>
            <span dir="ltr" class="mt-1 block truncate rounded-lg border border-line bg-surface-container-low px-3 py-2 text-[13px] text-on-surface-variant">${escapeHtml(email || "—")}</span>
            <div class="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <label class="font-label-sm text-label-sm text-secondary">كلمة مرور جديدة
                <input id="ac-pass" type="password" dir="ltr" autocomplete="new-password" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-left text-[14px] text-on-surface outline-none transition-colors focus:border-primary" />
              </label>
              <label class="font-label-sm text-label-sm text-secondary">تأكيد كلمة المرور
                <input id="ac-pass2" type="password" dir="ltr" autocomplete="new-password" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-left text-[14px] text-on-surface outline-none transition-colors focus:border-primary" />
              </label>
            </div>
            <button id="ac-pass-save" type="button" class="mt-space-md flex items-center gap-space-xs rounded-lg border border-line bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container"><span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">lock_reset</span>تغيير كلمة المرور</button>
          </section>
        </div>

        ${info.length ? `<section class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
          <h3 class="font-label-lg text-label-lg font-bold text-on-surface">البيانات المهنية</h3>
          <p class="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">مسجّلة في دليل ميعادي — تُحدَّث من إدارة المنصة.</p>
          <div class="mt-space-md grid grid-cols-2 gap-space-md sm:grid-cols-4">${info.map(([k, v]) => `<div class="rounded-lg bg-surface-container-low p-3"><span class="block text-[12px] text-on-surface-variant">${escapeHtml(k)}</span><span class="mt-0.5 block font-label-md text-label-md font-semibold text-on-surface">${escapeHtml(v)}</span></div>`).join("")}</div>
        </section>` : ""}
      </div>`;

    const val = (sel: string) => target.querySelector<HTMLInputElement>(sel)?.value || "";
    target.querySelector<HTMLButtonElement>("#ac-logout")?.addEventListener("click", () => { if (hooks.onLogout) void hooks.onLogout(); });
    target.querySelector<HTMLButtonElement>("#ac-save")?.addEventListener("click", async () => {
      const fullName = val("#ac-name").trim();
      const phone = val("#ac-phone").trim();
      if (!fullName) { showToast("اكتب الاسم الكامل", "error"); return; }
      try {
        await updatePatientProfile({ fullName, phone });
        if (me.profile) { me.profile.full_name = fullName; me.profile.phone = phone; }
        setText("#db-user-name", fullName);
        setText("#db-side-name", fullName);
        showToast("تم حفظ البيانات", "success");
      } catch (e) { showToast(translateAuthError(e), "error"); }
    });
    target.querySelector<HTMLButtonElement>("#ac-pass-save")?.addEventListener("click", async () => {
      const pass = val("#ac-pass");
      if (pass.length < 8) { showToast("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error"); return; }
      if (pass !== val("#ac-pass2")) { showToast("كلمتا المرور غير متطابقتين", "error"); return; }
      try {
        await updatePassword(pass);
        const i1 = target.querySelector<HTMLInputElement>("#ac-pass");
        const i2 = target.querySelector<HTMLInputElement>("#ac-pass2");
        if (i1) i1.value = "";
        if (i2) i2.value = "";
        showToast("تم تغيير كلمة المرور", "success");
      } catch (e) { showToast(translateAuthError(e), "error"); }
    });
  };

  const showView = async (view: DashView) => {
    currentView = view;
    paintNav();
    (Object.keys(VIEW_HOSTS) as DashView[]).forEach((k) => appEl.querySelector<HTMLElement>(VIEW_HOSTS[k])?.classList.toggle("hidden", k !== view));
    appEl.querySelector<HTMLElement>("#db-search-wrap")?.classList.toggle("hidden", view !== "overview");
    const target = appEl.querySelector<HTMLElement>(VIEW_HOSTS[view]);
    if (!target) return;
    try {
      if (view === "overview") { await reload(); return; }
      target.innerHTML = pendingHtml(view === "appointments" ? "جاري تحميل المواعيد…" : "جاري تحميل جدول العمل…");
      if (view === "appointments") {
        if (hooks.renderAppointments) await hooks.renderAppointments(target);
        else target.innerHTML = failureHtml("هذا القسم غير متاح في هذه النسخة");
      } else if (view === "schedule") {
        if (hooks.renderSchedule) await hooks.renderSchedule(target, doctorId);
        else target.innerHTML = failureHtml("هذا القسم غير متاح في هذه النسخة");
      } else {
        paintAccountPanel(target);
      }
    } catch (e) {
      target.innerHTML = failureHtml(e);
    }
  };

  appEl.querySelectorAll<HTMLElement>("[data-view]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    closeDbDrawer();
    void showView((el.dataset.view || "overview") as DashView);
  }));
  appEl.querySelector<HTMLElement>("#db-logout")?.addEventListener("click", () => { if (hooks.onLogout) void hooks.onLogout(); });
  paintNav();

  const load = async () => {
    const today = localDateISO();
    if (role === "doctor" && !doctorId) {
      try { const d = await findDoctorByUser(me.id); doctorId = d?.id || null; } catch { /* ignore */ }
    }
    const [profile, res, availability] = await Promise.all([
      doctorId ? getDoctorProfile(doctorId).catch(() => null) : Promise.resolve(null),
      getAdminAppointments({ doctorId: doctorId || undefined, dateFrom: today, dateTo: today, page: 0, pageSize: 300, sortBy: "start_time", sortDir: "asc" }),
      doctorId ? (getDoctorAvailability(doctorId).catch(() => []) as Promise<AvRule[]>) : Promise.resolve([] as AvRule[]),
    ]);
    rows = ((res.rows || []) as Row[]).map((r) => ({ ...r, consultation_fee: Number(r.consultation_fee) || 0 }));
    live = true;
    docProfile = profile;
    paintShell(profile);
    renderBody(profile, today, availability);
  };

  const paintShell = (profile: Awaited<ReturnType<typeof getDoctorProfile>>) => {
    const displayName = profile?.name || me.profile?.full_name || "مستخدم";
    setText("#db-user-name", displayName);
    setText("#db-side-name", displayName);
    setText("#db-side-role", role === "admin" ? "مشرف النظام" : "طبيب");
    const sideAvatar = panel("#db-side-avatar");
    if (sideAvatar) sideAvatar.textContent = initials(displayName);
    const specEl = panel("#db-user-spec");
    if (specEl) { specEl.textContent = profile ? specialtyLabel(profile.specialization) : "مشرف النظام"; specEl.classList.toggle("hidden", false); }
    setText("#db-facility-name", profile ? (profile.hospital_name || "بدون موقع مسجّل") : "جميع العيادات");
    setText("#db-facility-sub", profile ? `${specialtyLabel(profile.specialization)} • ${profile.city || "—"}` : "كل العيادات المسجّلة");
    const bell = panel("#db-bell-dot");
    if (bell) bell.classList.add("hidden");
    const now = new Date();
    setText("#db-sync", `آخر تحديث ${formatTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)}`);
  };

  const renderBody = (profile: Awaited<ReturnType<typeof getDoctorProfile>>, today: string, availability: AvRule[]) => {
    const weekday = new Date(`${today}T00:00:00`).getDay();
    const rule = availability.find((r) => r.is_enabled && r.day_of_week === weekday);
    const times = rows.map((r) => toMin(r.start_time)).sort((a, b) => a - b);
    const sessionText = rule
      ? `${formatTime(rule.start_time)} - ${formatTime(rule.end_time)}`
      : times.length ? `${formatTime(rows[0].start_time)} - ${formatTime(plus30(rows[times.length - 1].start_time))}` : "لا يوجد دوام مجدول اليوم";

    const total = rows.length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const booked = rows.filter((r) => r.status === "booked");
    const cancelled = rows.filter((r) => isCancelled(r.status)).length;
    const noShow = rows.filter((r) => r.status === "no_show").length;
    const morning = rows.filter((r) => toMin(r.start_time) < 13 * 60).length;
    const evening = total - morning;
    const upcoming = booked.filter((r) => toMin(r.start_time) > nowMin());
    const next = upcoming[0];
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const revenue = rows.filter((r) => !isCancelled(r.status)).reduce((sum, r) => sum + (r.consultation_fee || 0), 0);
    const feeNote = profile ? `${profile.insurances.length} شركات تأمين مرتبطة` : `${new Set(rows.map((r) => r.doctor_id)).size} عيادات نشطة اليوم`;

    const dayStart = rule ? toMin(rule.start_time) : (times[0] ?? 9 * 60);
    const dayEnd = rule ? toMin(rule.end_time) : (times.length ? times[times.length - 1] + 30 : 17 * 60);
    const daySpan = Math.max(dayEnd - dayStart, 60);
    const nowPct = ((nowMin() - dayStart) / daySpan) * 100;
    const clock = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const finding = cancelled + noShow
      ? `أُلغي أو لم يحضر ${cancelled + noShow} من مواعيد اليوم، و${upcoming.length} مواعيد ما زالت مؤكدة.`
      : next
        ? `المريض التالي ${next.patient_name} الساعة ${formatTime(next.start_time)} — بعد ${waitText(toMin(next.start_time) - nowMin())}.`
        : total
          ? `انتهت مواعيد اليوم: ${completed} زيارة مكتملة من ${total}.`
          : "لا مواعيد على العيادة اليوم بعد.";
    const dayBlocks = rows.map((r) => {
      const left = ((toMin(r.start_time) - dayStart) / daySpan) * 100;
      const width = Math.max((30 / daySpan) * 100, 1);
      const tone = r.status === "completed"
        ? "bg-on-surface-variant"
        : r.status === "no_show"
          ? "bg-error/50"
          : isCancelled(r.status)
            ? "bg-outline-variant"
            : "bg-primary";
      return `<span class="absolute top-0 h-6 rounded-[3px] ${tone}" style="inset-inline-start:${left.toFixed(2)}%;width:calc(${width.toFixed(2)}% - 2px)" title="${escapeHtml(`${formatTime(r.start_time)} · ${r.patient_name}`)}"></span>`;
    }).join("");

    host.innerHTML = `
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-[24px] font-bold leading-tight text-on-surface">لوحة العيادة</h1>
          <p class="mt-1 max-w-[70ch] text-[15px] leading-relaxed text-on-surface-variant">${escapeHtml(finding)}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="hidden text-[13px] text-on-surface-variant sm:inline">${escapeHtml(formatArabicDate(today))}</span>
        </div>
      </div>

      <section class="rounded-xl border border-line bg-surface-container-lowest px-5 py-4" aria-labelledby="db-day-title">
        <div class="flex items-baseline justify-between gap-3">
          <h2 id="db-day-title" class="text-[15px] font-semibold text-on-surface">يوم العيادة</h2>
          <span class="text-[13px] text-on-surface-variant"><span class="tabular-nums">${escapeHtml(sessionText)}</span> · <span class="tabular-nums">${total}</span> موعد</span>
        </div>
        <div class="relative mt-3 h-6 overflow-hidden rounded bg-surface-container-low">
          ${dayBlocks}
          ${nowPct >= 0 && nowPct <= 100 ? `<span class="absolute -top-1 h-8 w-0.5 bg-error" style="inset-inline-start:${nowPct.toFixed(2)}%" title="الآن"></span>` : ""}
        </div>
        <div class="mt-2 flex items-center justify-between gap-3 text-[12px] text-on-surface-variant">
          <span class="tabular-nums">${escapeHtml(formatTime(clock(dayStart)))}</span>
          <span class="flex flex-wrap items-center gap-3">
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-[2px] bg-primary"></span>مؤكد</span>
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-[2px] bg-on-surface-variant"></span>مكتمل</span>
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-[2px] bg-outline-variant"></span>ملغي</span>
          </span>
          <span class="tabular-nums">${escapeHtml(formatTime(clock(dayEnd)))}</span>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4" aria-label="ملخص اليوم">
        <div class="bg-surface-container-lowest p-4">
          <p class="text-[13px] text-on-surface-variant">مواعيد اليوم</p>
          <p class="mt-1 text-[24px] font-semibold tabular-nums text-on-surface">${total}</p>
          <p class="mt-0.5 text-[12px] text-on-surface-variant">${morning} صباحاً · ${evening} مساءً</p>
        </div>
        <div class="bg-surface-container-lowest p-4">
          <p class="text-[13px] text-on-surface-variant">في الانتظار</p>
          <p class="mt-1 text-[24px] font-semibold tabular-nums text-on-surface">${upcoming.length}</p>
          <p class="mt-0.5 text-[12px] text-on-surface-variant">${next ? `التالية ${escapeHtml(formatTime(next.start_time))}` : "لا مواعيد متبقية"}</p>
        </div>
        <div class="bg-surface-container-lowest p-4">
          <p class="text-[13px] text-on-surface-variant">مكتملة</p>
          <p class="mt-1 text-[24px] font-semibold tabular-nums text-on-surface">${completed}<span class="text-[15px] font-normal text-on-surface-variant"> / ${total}</span></p>
          <p class="mt-0.5 text-[12px] text-on-surface-variant">نسبة الإنجاز <span class="tabular-nums">${rate}%</span></p>
        </div>
        <div class="bg-surface-container-lowest p-4">
          <p class="text-[13px] text-on-surface-variant">الإيرادات المتوقعة</p>
          <p class="mt-1 text-[24px] font-semibold tabular-nums text-on-surface">${revenue.toLocaleString("en-US")}<span class="text-[14px] font-normal text-on-surface-variant"> ج.س</span></p>
          <p class="mt-0.5 text-[12px] text-on-surface-variant"><span class="tabular-nums">${total - cancelled - noShow}</span> زيارة غير ملغاة</p>
        </div>
      </section>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="db-stream-title">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-1">
            <h2 id="db-stream-title" class="text-[15px] font-semibold text-on-surface">سير المواعيد</h2>
            <div id="db-filters" class="flex items-center gap-1"></div>
          </div>
          <div id="db-stream" class="flex flex-col divide-y divide-line"></div>
        </section>

        <aside class="flex flex-col gap-6">
          <section aria-labelledby="db-clinic-title">
            <h2 id="db-clinic-title" class="text-[14px] font-semibold text-on-surface">${profile ? "بيانات العيادة" : "ملخص العيادات"}</h2>
            <div id="db-clinic-panel" class="mt-1 flex flex-col"></div>
            <button id="db-clinic-edit" class="mt-3 h-8 w-full rounded-lg border border-line text-[12px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low" type="button">${profile ? "إدارة ساعات العمل" : "السجل الكامل"}</button>
          </section>
        </aside>
      </div>
    </div>`;


    paintFilters();
    paintStream();
    paintClinicPanel(profile);

    const on = (sel: string, ev: string, fn: (e: Event) => void) => { const el = host.querySelector(sel); if (el) el.addEventListener(ev, fn as EventListener); };
    on("#db-clinic-edit", "click", () => { void showView(profile ? "schedule" : "appointments"); });
  };

  const paintFilters = () => {
    const host2 = host.querySelector("#db-filters");
    if (!host2) return;
    host2.innerHTML = FILTERS.map((f) => {
      const active = filter === f.key;
      return `<button data-filter="${f.key}" class="relative inline-flex h-9 items-center gap-1.5 px-2 text-[13px] transition-colors ${
        active ? "font-semibold text-on-surface" : "text-on-surface-variant hover:text-on-surface"
      }"><span>${f.label}</span>${
        active ? '<span class="absolute inset-x-1 bottom-0 h-0.5 bg-primary"></span>' : ""
      }</button>`;
    }).join("");
    host2.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.filter as Filter; paintFilters(); paintStream(); }));
  };


  const range = (r: Row) => `<span dir="ltr" class="tabular-nums">${escapeHtml(formatTime(r.start_time))}</span> <span class="text-outline">-</span> <span dir="ltr" class="tabular-nums">${escapeHtml(formatTime(plus30(r.start_time)))}</span>`;

  const kindOf = (r: Row) => {
    if (r.status === "completed") return "done";
    if (isCancelled(r.status)) return "cancelled";
    if (r.status === "no_show") return "noshow";
    if (toMin(r.start_time) <= nowMin() && nowMin() < toMin(r.start_time) + 30) return "active";
    if (toMin(r.start_time) + 30 <= nowMin()) return "pending";
    return "waiting";
  };

  const cardActions = (r: Row, primary = false) => {
    if (r.status !== "booked") return "";
    const slotPassed = toMin(r.start_time) + 30 <= nowMin();
    return `<div class="flex items-center gap-1.5">
      <button data-done="${escapeHtml(r.appointment_id)}" class="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${primary ? "bg-primary text-on-primary hover:bg-primary-container" : "border border-line bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"}" type="button"><span class="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>تم</button>
      ${slotPassed ? `<button data-noshow="${escapeHtml(r.appointment_id)}" class="inline-flex h-8 items-center rounded-lg px-2 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-error" type="button" title="المريض لم يحضر">غياب</button>` : ""}
      <button data-cancel="${escapeHtml(r.appointment_id)}" class="inline-flex h-8 items-center rounded-lg px-2 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-error" type="button">إلغاء</button>
      <a href="tel:${escapeHtml(r.patient_phone)}" class="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low" title="اتصال بالمريض"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">call</span></a>
    </div>`;
  };

  const card = (r: Row, primary = false) => {
    const kind = kindOf(r);
    const active = kind === "active";
    const muted = kind === "done" || kind === "cancelled" || kind === "noshow";
    const statusText = kind === "active" ? "الآن" : kind === "waiting" ? "التالي" : kind === "pending" ? "بانتظار التسجيل" : kind === "done" ? "مكتمل" : kind === "cancelled" ? "ملغي" : "لم يحضر";
    const statusTone = kind === "active" ? "text-primary" : kind === "pending" ? "text-warning" : kind === "cancelled" || kind === "noshow" ? "text-error" : "text-on-surface-variant";
    return `<div class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${active ? "border-s-2 border-primary bg-primary/5" : ""}">
      <div class="w-14 shrink-0 text-[14px] font-semibold tabular-nums ${muted ? "text-on-surface-variant" : "text-on-surface"}">${escapeHtml(formatTime(r.start_time))}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate text-[15px] font-semibold ${muted ? "text-on-surface-variant" : "text-on-surface"}">${escapeHtml(r.patient_name)}</p>
          <span class="shrink-0 text-[12px] ${statusTone}">${statusText}</span>
        </div>
        <p class="mt-0.5 truncate text-[13px] text-on-surface-variant">${escapeHtml(specialtyLabel(r.doctor_specialization))} · <span dir="ltr" class="tabular-nums">${escapeHtml(r.patient_phone)}</span></p>
      </div>
      <div class="flex items-center justify-between gap-3 sm:justify-end">
        <span class="text-[14px] tabular-nums ${muted ? "text-on-surface-variant" : "text-on-surface"}">${escapeHtml(money(r.consultation_fee))}</span>
        ${cardActions(r, primary)}
      </div>
    </div>`;
  };


  const paintStream = () => {
    const list = host.querySelector("#db-stream");
    if (!list) return;
    const shown = matches(rows, filter, query);
    const nextId = rows
      .filter((r) => r.status === "booked" && toMin(r.start_time) > nowMin())
      .sort((a, b) => toMin(a.start_time) - toMin(b.start_time))[0]?.appointment_id;
    list.innerHTML = shown.length
      ? shown.map((r) => card(r, r.appointment_id === nextId)).join("")
      : `<div class="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span class="material-symbols-outlined text-[28px] text-on-surface-variant" aria-hidden="true">event_available</span>
          <p class="text-[15px] font-semibold text-on-surface">لا توجد مواعيد مطابقة</p>
          <p class="max-w-[40ch] text-[13px] text-on-surface-variant">${rows.length ? "جرّب تغيير الفلتر أو مسح كلمة البحث." : "لا توجد مواعيد مسجّلة على عيادتك اليوم."}</p>
        </div>`;

    list.querySelectorAll<HTMLButtonElement>("[data-done]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.done!;
      const row = rows.find((r) => r.appointment_id === id);
      const ok = await confirmSheet({ title: "تأكيد اكتمال الزيارة", body: `تسجيل زيارة ${row?.patient_name || "المريض"} كمكتملة؟`, confirmLabel: "تسجيل كمكتملة", cancelLabel: "تراجع", tone: "primary", iconName: "task_alt" });
      if (!ok) return;
      try { await updateAppointmentState(id, "completed"); showToast("تم تسجيل اكتمال الزيارة", "success"); await reload(); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    }));
    list.querySelectorAll<HTMLButtonElement>("[data-cancel]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.cancel!;
      const row = rows.find((r) => r.appointment_id === id);
      const ok = await confirmSheet({ title: "إلغاء الموعد من العيادة", body: `إلغاء موعد ${row?.patient_name || "المريض"} وإتاحة الموعد مجدداً للحجز؟`, confirmLabel: "تأكيد الإلغاء", cancelLabel: "تراجع", tone: "danger", iconName: "event_busy" });
      if (!ok) return;
      try { await cancelAppointmentClinic(id); showToast("تم الإلغاء وإتاحة الموعد", "success"); await reload(); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    }));
    list.querySelectorAll<HTMLButtonElement>("[data-noshow]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.noshow!;
      const row = rows.find((r) => r.appointment_id === id);
      const ok = await confirmSheet({ title: "تسجيل عدم الحضور", body: `تسجيل غياب ${row?.patient_name || "المريض"} عن موعد الساعة ${row ? formatTime(row.start_time) : ""}؟`, confirmLabel: "تسجيل الغياب", cancelLabel: "تراجع", tone: "danger", iconName: "person_off" });
      if (!ok) return;
      try { await updateAppointmentState(id, "no_show"); showToast("تم تسجيل عدم الحضور", "success"); await reload(); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    }));
  };



  const paintClinicPanel = (profile: Awaited<ReturnType<typeof getDoctorProfile>>) => {
    const box = host.querySelector("#db-clinic-panel");
    if (!box) return;
    const item = (label: string, value: string, strong = false) => `
      <div class="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-0">
        <span class="text-[12px] text-on-surface-variant">${escapeHtml(label)}</span>
        <span class="text-[13px] tabular-nums ${strong ? "font-semibold text-on-surface" : "text-on-surface"}">${value}</span>
      </div>`;
    if (!profile) {
      const doctors = new Set(rows.map((r) => r.doctor_id)).size;
      box.innerHTML = [
        item("عدد الأطباء النشطين اليوم", `<span class="tabular-nums">${doctors}</span>`),
        item("إجمالي مواعيد اليوم", `<span class="tabular-nums">${rows.length}</span>`, true),
        item("مكتمل", `<span class="tabular-nums">${rows.filter((r) => r.status === "completed").length}</span>`),
        item("مواعيد قادمة", `<span class="tabular-nums">${rows.filter((r) => r.status === "booked" && toMin(r.start_time) > nowMin()).length}</span>`),
        item("بانتظار التسجيل", `<span class="tabular-nums">${rows.filter((r) => r.status === "booked" && toMin(r.start_time) <= nowMin()).length}</span>`),
      ].join("");
      return;
    }
    box.innerHTML = [
      item("التقييم", `<span class="tabular-nums">${profile.rating ? profile.rating.toFixed(1) : "—"}</span> <span class="text-[12px] text-on-surface-variant">(${profile.reviews_count} تقييم)</span>`),
      item("سنوات الخبرة", `<span class="tabular-nums">${profile.experience_years ?? "—"}</span>`),
      item("اللغات", escapeHtml(profile.languages.join(" · ") || "العربية")),
      item("شركات التأمين", `<span class="tabular-nums">${profile.insurances.length}</span>`),
    ].join("") + (profile.insurances.length
      ? `<ul class="mt-1 flex flex-col divide-y divide-line">${profile.insurances.map((n) => `<li class="flex items-center justify-between gap-2 py-2 text-[13px] text-on-surface"><span class="truncate">${escapeHtml(n)}</span><span class="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">check</span></li>`).join("")}</ul>`
      : "");
  };


  const search = panel("#db-search") as HTMLInputElement | null;
  if (search) {
    let t: number | undefined;
    const next = search.cloneNode(true) as HTMLInputElement;
    search.replaceWith(next);
    next.addEventListener("input", () => {
      query = next.value;
      clearTimeout(t);
      t = window.setTimeout(() => { paintStream(); }, 200);
    });
  }

  // __FIXTURE__ dev-only preview of the dashboard with sample appointments
  if (import.meta.env.DEV && new URLSearchParams(location.search).has("fixture")) {
    const t = new URLSearchParams(location.search).get("theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    const d = localDateISO();
    rows = [
      { appointment_id: "fix-1", patient_name: "أحمد يوسف محمد", patient_phone: "0912345101", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 6000, available_date: d, start_time: "08:30", end_time: "08:30", status: "completed", doctor_id: "fix-doc" },
      { appointment_id: "fix-2", patient_name: "سارة عثمان إدريس", patient_phone: "0912345102", doctor_name: "د. طارق المنصور", doctor_specialization: "باطنية", consultation_fee: 6000, available_date: d, start_time: "09:00", end_time: "09:00", status: "completed", doctor_id: "fix-doc" },
      { appointment_id: "fix-3", patient_name: "محمد علي الطيب", patient_phone: "0912345103", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 5000, available_date: d, start_time: "09:30", end_time: "09:30", status: "cancelled_by_patient", doctor_id: "fix-doc" },
      { appointment_id: "fix-4", patient_name: "هدى إبراهيم عبد الرحمن", patient_phone: "0912345104", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 7000, available_date: d, start_time: "10:00", end_time: "10:00", status: "completed", doctor_id: "fix-doc" },
      { appointment_id: "fix-5", patient_name: "خالد مبارك سليمان", patient_phone: "0912345105", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 5000, available_date: d, start_time: "10:30", end_time: "10:30", status: "no_show", doctor_id: "fix-doc" },
      { appointment_id: "fix-6", patient_name: "عمر الصادق النور", patient_phone: "0912345106", doctor_name: "د. طارق المنصور", doctor_specialization: "باطنية", consultation_fee: 6000, available_date: d, start_time: "11:00", end_time: "11:00", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-7", patient_name: "مريم خالد حسين", patient_phone: "0912345107", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 6000, available_date: d, start_time: "11:30", end_time: "11:30", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-8", patient_name: "كمال الأمين عبد الله", patient_phone: "0912345108", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 7000, available_date: d, start_time: "12:00", end_time: "12:00", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-9", patient_name: "نجلاء موسى عيسى", patient_phone: "0912345109", doctor_name: "د. طارق المنصور", doctor_specialization: "باطنية", consultation_fee: 5000, available_date: d, start_time: "12:30", end_time: "12:30", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-10", patient_name: "ياسر عبد الله بابكر", patient_phone: "0912345110", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 6000, available_date: d, start_time: "13:00", end_time: "13:00", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-11", patient_name: "إسراء يوسف إبراهيم", patient_phone: "0912345111", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 6000, available_date: d, start_time: "16:00", end_time: "16:00", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-12", patient_name: "طه البدوي عثمان", patient_phone: "0912345112", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 7000, available_date: d, start_time: "16:30", end_time: "16:30", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-13", patient_name: "أمل فرح أحمد", patient_phone: "0912345113", doctor_name: "د. طارق المنصور", doctor_specialization: "باطنية", consultation_fee: 5000, available_date: d, start_time: "17:00", end_time: "17:00", status: "booked", doctor_id: "fix-doc" },
      { appointment_id: "fix-14", patient_name: "سامي الترابي علي", patient_phone: "0912345114", doctor_name: "د. طارق المنصور", doctor_specialization: "قلب وأوعية دموية", consultation_fee: 6000, available_date: d, start_time: "17:30", end_time: "17:30", status: "booked", doctor_id: "fix-doc" },
    ];
    renderBody(null, d, []);
    paintStream();
    paintClinicPanel(null);
    return;
  }

  try { await reload(); }
  catch (e) { host.innerHTML = `<div class="rounded-xl border border-line bg-surface-container-lowest p-6 text-center text-[14px] text-on-surface-variant">${escapeHtml(translateAuthError(e))}</div>`; }
  if (currentView !== "overview") void showView(currentView);
  void live;
}
