import { escapeHtml, formatTime, formatArabicDate, localDateISO, translateAuthError } from "../../lib/format";
import { getAdminAppointments, getAdminStats, listDoctors, listHospitals, updatePatientProfile, updatePassword } from "../../lib/supabase";
import { showToast } from "../../components/Toast";
import { initials, money } from "../../components/ui";
import { specialtyLabel } from "./specialtyContent";
import { fixtureDoctors } from "../adminFixture";

type Row = {
  appointment_id: string; patient_name: string; patient_phone: string; doctor_name: string;
  doctor_specialization: string; consultation_fee: number; available_date: string;
  start_time: string; end_time: string; status: string; doctor_id: string;
};
type DoctorRow = { id: string; name: string; specialization: string; consultation_fee?: number };
type Stats = { total: number; booked: number; completed: number; cancelled: number; noShow: number; today: number };
type User = { id: string; email?: string; profile?: { full_name?: string; phone?: string; role?: string } | null } | null;

/* Admin dashboard: one page, the sidebar swaps these panels in place and the
   URL never changes — exactly how the doctor dashboard behaves. */
export type AdminView = "overview" | "appointments" | "doctors" | "schedules" | "accounts" | "account";
export type AdminDashboardHooks = {
  renderAppointments?: (host: HTMLElement) => Promise<void> | void;
  renderDoctors?: (host: HTMLElement, onBack: () => void) => Promise<void> | void;
  renderSchedules?: (host: HTMLElement) => Promise<void> | void;
  renderAccounts?: (host: HTMLElement, onBack: () => void) => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
  initialView?: AdminView;
};

const toMin = (t: string) => { const [h, m] = String(t).split(":"); return Number(h) * 60 + Number(m || 0); };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const isCancelled = (s: string) => String(s).startsWith("cancelled");
const clock = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const EMPTY_STATS: Stats = { total: 0, booked: 0, completed: 0, cancelled: 0, noShow: 0, today: 0 };

/* Dev-only sample data so the shell can be reviewed without a session:
   open /?adminfixture. Never active in a production build. */
function previewData(): { rows: Row[]; doctors: DoctorRow[]; stats: Stats; hospitals: number } | null {
  if (!import.meta.env.DEV) return null;
  if (!new URLSearchParams(location.search).has("adminfixture")) return null;
  const today = localDateISO();
  // Times are anchored around "now" so the preview always has upcoming slots,
  // whatever time of day the shell is reviewed — but never past midnight.
  const totalSlots = 16;
  const base = Math.max(8 * 60, Math.min(nowMin() - 120, 23 * 60 - totalSlots * 20));
  const counts = [4, 3, 2, 3, 1, 3];
  const statuses = ["completed", "booked", "booked", "completed", "cancelled_by_patient", "no_show", "booked", "completed"];
  const patients = ["سارة عبد الله", "محمد الأمين", "عمر إبراهيم", "هدى عثمان", "ريم الطيب", "يوسف علي", "منال حسن"];
  const rows: Row[] = [];
  let slot = 0;
  fixtureDoctors.slice(0, 6).forEach((d, di) => {
    const n = counts[di] ?? 2;
    for (let i = 0; i < n; i += 1) {
      const start = clock(base + slot * 20);
      slot += 1;
      const end = clock(toMin(start) + 30);
      // Anything later than now reads as still-confirmed, so the preview always
      // shows a believable "upcoming" count.
      let status = statuses[(di + i) % statuses.length];
      if (toMin(start) > nowMin()) status = "booked";
      rows.push({
        appointment_id: `fx-appt-${di}-${i}`,
        patient_name: patients[(di + i) % patients.length],
        patient_phone: `+249 9${di} ${String(100 + i)} 0000`,
        doctor_name: d.name,
        doctor_specialization: d.specialization,
        consultation_fee: d.consultation_fee,
        available_date: today,
        start_time: start,
        end_time: end,
        status,
        doctor_id: d.id,
      });
    }
  });
  return {
    rows: rows.sort((a, b) => toMin(a.start_time) - toMin(b.start_time)),
    doctors: fixtureDoctors.map((d) => ({ id: d.id, name: d.name, specialization: d.specialization, consultation_fee: d.consultation_fee })),
    stats: { total: 1240, booked: 96, completed: 980, cancelled: 42, noShow: 12, today: rows.length },
    hospitals: 3,
  };
}

export async function wireAdminDashboard(appEl: HTMLElement, user: User, hooks: AdminDashboardHooks = {}) {
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
  const preview = previewData();
  if (!user && preview) user = { id: "admin-fixture", profile: { full_name: "محمد الأمين", role: "admin" } };
  const role = (user?.profile?.role || "") as string;
  // This shell belongs to the admin role only; doctors keep the doctor dashboard.
  if (!user || role !== "admin") return;
  const me = user;

  const panel = (sel: string) => appEl.querySelector<HTMLElement>(sel);
  const setText = (sel: string, value: string) => { const el = panel(sel); if (el) el.textContent = value; };

  let rows: Row[] = [];
  let doctors: DoctorRow[] = [];
  let stats: Stats = { ...EMPTY_STATS };
  let hospitals = 0;
  let busyQuery = "";
  type BusyGroup = { id: string; name: string; specialization: string; total: number; booked: number; completed: number; next: string | null };
  let busyGroups: BusyGroup[] = [];

  const VIEW_KEY = "myappo.admin.view";
  const VIEWS: AdminView[] = ["overview", "appointments", "doctors", "schedules", "accounts", "account"];
  const savedView = (): AdminView | null => {
    try {
      const v = sessionStorage.getItem(VIEW_KEY) as AdminView | null;
      return v && VIEWS.includes(v) ? v : null;
    } catch { return null; }
  };
  let currentView: AdminView = hooks.initialView || savedView() || "overview";
  let reviewPreview = preview;

  setText("#db-sync", "جاري التحديث…");
  host.innerHTML = skeletonHtml("overview");

  const VIEW_HOSTS: Record<AdminView, string> = {
    overview: "#db-content",
    appointments: "#db-view-appointments",
    doctors: "#db-view-doctors",
    schedules: "#db-view-schedules",
    accounts: "#db-view-accounts",
    account: "#db-view-account",
  };
  const NAV_ON = ["bg-surface-container-highest", "text-on-surface", "font-semibold"];
  const NAV_OFF = ["text-on-surface-variant", "hover:bg-surface-container-high", "hover:text-on-surface"];

  function skeletonHtml(view: AdminView): string {
    if (view === "account") return "";
    const line = "rounded bg-surface-container-high";
    const block = "rounded bg-surface-container";
    const stat = () => `<div class="bg-surface-container-lowest p-4"><div class="h-3 w-20 ${block}"></div><div class="mt-3 h-6 w-12 ${line}"></div></div>`;
    const statsGrid = (cols: string, n: number) => `<div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line ${cols}">${Array.from({ length: n }, stat).join("")}</div>`;
    const row = () => `<div class="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"><div class="h-9 w-9 shrink-0 rounded-full ${block}"></div><div class="min-w-0 flex-1"><div class="h-3 w-32 ${line}"></div><div class="mt-2 h-2.5 w-24 ${block}"></div></div><div class="h-6 w-16 ${block}"></div></div>`;
    const title = () => `<div class="min-w-0"><div class="h-6 w-44 ${line}"></div><div class="mt-2 h-3 w-72 max-w-full ${block}"></div></div>`;
    const card = () => `<div class="h-32 rounded-xl border border-line bg-surface-container-lowest"></div>`;
    const bodies: Record<Exclude<AdminView, "account">, string> = {
      overview: `
        <div class="flex flex-wrap items-end justify-between gap-4">${title()}<div class="h-9 w-28 ${block}"></div></div>
        <div class="h-28 rounded-xl border border-line bg-surface-container-lowest"></div>
        ${statsGrid("sm:grid-cols-3 lg:grid-cols-6", 6)}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">${Array.from({ length: 6 }, card).join("")}</div>`,
      appointments: `
        ${title()}
        ${statsGrid("sm:grid-cols-3 lg:grid-cols-6", 6)}
        <div class="flex flex-wrap gap-2">${Array.from({ length: 4 }, () => `<div class="h-8 w-24 rounded-lg ${block}"></div>`).join("")}</div>
        <div class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">${Array.from({ length: 6 }, row).join("")}</div>`,
      doctors: `
        ${title()}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">${Array.from({ length: 6 }, card).join("")}</div>`,
      schedules: `
        ${title()}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">${Array.from({ length: 6 }, () => `<div class="h-14 rounded-xl border border-line bg-surface-container-lowest"></div>`).join("")}</div>`,
      accounts: `
        ${title()}
        <div class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">${Array.from({ length: 6 }, row).join("")}</div>`,
    };
    const labels: Record<Exclude<AdminView, "account">, string> = {
      overview: "جارٍ تحميل لوحة الإدارة…",
      appointments: "جارٍ تحميل المواعيد…",
      doctors: "جارٍ تحميل الأطباء…",
      schedules: "جارٍ تحميل الجدولة…",
      accounts: "جارٍ تحميل الحسابات…",
    };
    return `<div class="animate-pulse" aria-busy="true"><div class="flex flex-col gap-4" aria-hidden="true">${bodies[view]}</div><span class="sr-only">${labels[view]}</span></div>`;
  }

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

  /* The admin's own account: name/phone/password. Professional data does not
     apply here — the admin is not a doctor row. */
  const paintAccountPanel = (target: HTMLElement) => {
    const name = me.profile?.full_name || "";
    const phone = me.profile?.phone || "";
    const email = me.email || "";
    const inputCls = "mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none transition-colors focus:border-primary";
    const permission = (icon: string, label: string, note: string) => `<div class="flex items-start gap-2.5 rounded-lg bg-surface-container-low px-3 py-2.5">
      <span class="material-symbols-outlined mt-0.5 text-[18px] text-primary" aria-hidden="true">${icon}</span>
      <div class="min-w-0"><p class="text-[13px] font-semibold text-on-surface">${escapeHtml(label)}</p><p class="mt-0.5 text-[11px] text-on-surface-variant">${escapeHtml(note)}</p></div>
    </div>`;

    target.innerHTML = `
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-[16px] font-bold text-primary">${escapeHtml(initials(name))}</div>
            <div class="min-w-0">
              <h2 class="truncate text-[18px] font-bold text-on-surface">${escapeHtml(name || "مشرف ميعادي")}</h2>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-[13px]" aria-hidden="true">shield_person</span>مشرف النظام</span>
              </div>
            </div>
          </div>
        </div>

        <section class="rounded-xl border border-line bg-surface-container-lowest p-4">
          <h3 class="text-[14px] font-semibold text-on-surface">بيانات الحساب</h3>
          <div class="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label class="text-[12px] text-on-surface-variant">الاسم الكامل
              <input id="ac-name" type="text" value="${escapeHtml(name)}" class="${inputCls}" />
            </label>
            <label class="text-[12px] text-on-surface-variant">رقم الجوال
              <input id="ac-phone" type="tel" dir="ltr" value="${escapeHtml(phone)}" class="${inputCls} text-left tabular-nums" />
            </label>
            <button id="ac-save" type="button" class="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-primary px-3.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container"><span class="material-symbols-outlined text-[16px]" aria-hidden="true">save</span>حفظ</button>
          </div>
          <div class="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
            <div class="min-w-0">
              <p class="text-[12px] font-medium text-on-surface-variant">البريد الإلكتروني</p>
              <p dir="ltr" class="mt-1 truncate rounded-lg bg-surface-container-low px-2.5 py-2 text-start text-[13px] text-on-surface-variant">${escapeHtml(email || "—")}</p>
              <p class="mt-1 text-[11px] text-on-surface-variant">لا يمكن تغييره من هنا — يُدار من إعدادات المنصة.</p>
            </div>
            <div>
              <div class="grid grid-cols-2 gap-2">
                <label class="text-[12px] text-on-surface-variant">كلمة مرور جديدة
                  <input id="ac-pass" type="password" dir="ltr" autocomplete="new-password" class="${inputCls} text-left" />
                </label>
                <label class="text-[12px] text-on-surface-variant">تأكيد كلمة المرور
                  <input id="ac-pass2" type="password" dir="ltr" autocomplete="new-password" class="${inputCls} text-left" />
                </label>
              </div>
              <button id="ac-pass-save" type="button" class="mt-2 inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container"><span class="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">lock_reset</span>تغيير كلمة المرور</button>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-line bg-surface-container-lowest p-4">
          <h3 class="text-[14px] font-semibold text-on-surface">صلاحيات المشرف</h3>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            ${permission("calendar_clock", "كل المواعيد", "عرض وإدارة حجوزات جميع العيادات وتعديل حالتها.")}
            ${permission("medical_services", "إدارة الأطباء", "إضافة وتعديل ملفات الأطباء وربط حساباتهم.")}
            ${permission("calendar_month", "جدولة الأطباء", "ضبط ساعات العمل والإجازات لكل طبيب.")}
            ${permission("manage_accounts", "الحسابات والأدوار", "منح دور طبيب أو مشرف لأي حساب.")}
          </div>
        </section>
      </div>`;

    const val = (sel: string) => target.querySelector<HTMLInputElement>(sel)?.value || "";
    target.querySelector<HTMLButtonElement>("#ac-save")?.addEventListener("click", async () => {
      const fullName = val("#ac-name").trim();
      const tel = val("#ac-phone").trim();
      if (!fullName) { showToast("اكتب الاسم الكامل", "error"); return; }
      try {
        await updatePatientProfile({ fullName, phone: tel });
        if (me.profile) { me.profile.full_name = fullName; me.profile.phone = tel; }
        setText("#db-user-name", fullName);
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

  const load = async () => {
    const today = localDateISO();
    if (reviewPreview) {
      rows = reviewPreview.rows;
      doctors = reviewPreview.doctors;
      stats = reviewPreview.stats;
      hospitals = reviewPreview.hospitals;
    } else {
      const [statsRes, apptRes, docsRes, hospitalsRes] = await Promise.all([
        getAdminStats().catch(() => ({ ...EMPTY_STATS })),
        getAdminAppointments({ dateFrom: today, dateTo: today, page: 0, pageSize: 300, sortBy: "start_time", sortDir: "asc" }),
        listDoctors().catch(() => [] as DoctorRow[]),
        listHospitals().catch(() => []),
      ]);
      stats = statsRes as Stats;
      rows = ((apptRes.rows || []) as Row[]).map((r) => ({ ...r, consultation_fee: Number(r.consultation_fee) || 0 }));
      doctors = docsRes as DoctorRow[];
      hospitals = hospitalsRes.length;
    }

    // Group today's bookings per doctor — the "busiest today" strip.
    const groups = new Map<string, BusyGroup>();
    rows.forEach((r) => {
      const g = groups.get(r.doctor_id) || {
        id: r.doctor_id,
        name: r.doctor_name,
        specialization: r.doctor_specialization,
        total: 0, booked: 0, completed: 0, next: null,
      };
      g.total += 1;
      if (r.status === "booked") g.booked += 1;
      if (r.status === "completed") g.completed += 1;
      if (r.status === "booked" && toMin(r.start_time) > nowMin() && (!g.next || r.start_time < g.next)) g.next = r.start_time;
      groups.set(r.doctor_id, g);
    });
    busyGroups = [...groups.values()]
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ar"))
      .slice(0, 6);

    setText("#db-user-name", me.profile?.full_name || "مشرف النظام");
    const bell = panel("#db-bell-dot");
    if (bell) bell.classList.add("hidden");
    const now = new Date();
    setText("#db-sync", `آخر تحديث ${formatTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)}`);

    paintBody(today);
  };

  /* Clinic-wide overview: one aggregate day band, six KPIs and the busiest
     doctors today. The search box filters that strip. */
  const paintBody = (today: string) => {
    const total = rows.length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const booked = rows.filter((r) => r.status === "booked");
    const cancelledToday = rows.filter((r) => isCancelled(r.status)).length;
    const noShowToday = rows.filter((r) => r.status === "no_show").length;
    const cancelledAll = cancelledToday + noShowToday;
    const upcoming = booked.filter((r) => toMin(r.start_time) > nowMin());
    const activeDoctors = new Set(rows.map((r) => r.doctor_id)).size;
    const revenue = rows.filter((r) => !isCancelled(r.status)).reduce((sum, r) => sum + (r.consultation_fee || 0), 0);
    const billable = rows.filter((r) => !isCancelled(r.status)).length;

    const times = rows.map((r) => toMin(r.start_time)).sort((a, b) => a - b);
    const dayStart = times[0] ?? 9 * 60;
    const dayEnd = times.length ? Math.max(...rows.map((r) => toMin(r.end_time))) : 17 * 60;
    const daySpan = Math.max(dayEnd - dayStart, 60);
    const nowPct = Math.min(100, Math.max(0, ((nowMin() - dayStart) / daySpan) * 100));
    const sessionText = times.length ? `${clock(dayStart)} - ${clock(dayEnd)}` : "لا مواعيد مجدولة اليوم";

    const finding = total
      ? `${total} موعد اليوم عبر ${activeDoctors} عيادات — ${upcoming.length} مؤكدة قادمة و${completed} مكتملة${cancelledAll ? `، و${cancelledAll} ملغاة أو غياب` : ""}.`
      : "لا مواعيد مسجّلة اليوم في أي عيادة حتى الآن.";

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
      return `<span class="absolute top-0 h-6 rounded-[3px] ${tone}" style="inset-inline-start:${left.toFixed(2)}%;width:calc(${width.toFixed(2)}% - 2px)" title="${escapeHtml(`${formatTime(r.start_time)} · ${r.patient_name} · ${r.doctor_name}`)}"></span>`;
    }).join("");

    const kpi = (label: string, value: string, note: string, icon: string) => `<div class="bg-surface-container-lowest p-4">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[12px] text-on-surface-variant">${escapeHtml(label)}</p>
        <span class="material-symbols-outlined text-[16px] text-primary/80" aria-hidden="true">${icon}</span>
      </div>
      <p class="mt-2 text-[22px] font-semibold leading-none tabular-nums text-on-surface">${escapeHtml(value)}</p>
      <p class="mt-1 text-[11px] text-on-surface-variant">${escapeHtml(note)}</p>
    </div>`;

    host.innerHTML = `
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="min-w-0">
            <h1 class="text-[24px] font-bold leading-tight text-on-surface">لوحة الإدارة</h1>
            <p class="mt-1 max-w-[80ch] text-[15px] leading-relaxed text-on-surface-variant">${escapeHtml(finding)}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-[12px] text-on-surface-variant">
            <span class="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1 text-on-surface"><span class="material-symbols-outlined text-[14px]" aria-hidden="true">shield_person</span>مشرف النظام</span>
            <span class="tabular-nums">${escapeHtml(formatArabicDate(today))}</span>
          </div>
        </div>

        <section class="rounded-xl border border-line bg-surface-container-lowest p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">timeline</span>
              <h2 class="text-[14px] font-semibold text-on-surface">حركة اليوم عبر كل العيادات</h2>
            </div>
            <span class="text-[12px] tabular-nums text-on-surface-variant">${escapeHtml(sessionText)}</span>
          </div>
          <div class="mt-4">
            <div class="relative h-6 overflow-hidden rounded-md bg-surface-container-low">
              ${dayBlocks}
              <span class="absolute top-0 h-6 w-px bg-on-surface" style="inset-inline-start:${nowPct.toFixed(2)}%" aria-hidden="true"></span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] tabular-nums text-on-surface-variant">
              <span>${clock(dayStart)}</span>
              <span class="inline-flex items-center gap-2"><span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>مؤكد</span><span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-on-surface-variant"></span>مكتمل</span><span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-error/50"></span>غياب</span></span>
              <span>${clock(dayEnd)}</span>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          ${kpi("مواعيد اليوم", String(total), `عبر ${activeDoctors} عيادات`, "event_note")}
          ${kpi("مؤكدة قادمة", String(upcoming.length), `${stats.booked} على مستوى المنصة`, "event_available")}
          ${kpi("مكتملة اليوم", String(completed), `${stats.completed} إجمالًا`, "task_alt")}
          ${kpi("ملغاة / غياب", String(cancelledAll), `${stats.cancelled} ملغاة إجمالًا`, "event_busy")}
          ${kpi("إيراد اليوم", money(revenue), `من ${billable} زيارة غير ملغاة`, "payments")}
          ${kpi("أطباء نشطون", String(activeDoctors), `${doctors.length} طبيبًا · ${hospitals} مستشفى`, "stethoscope")}
        </div>

        <section class="flex flex-col gap-3">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 class="text-[16px] font-bold text-on-surface">الأطباء الأكثر حجزًا اليوم</h2>
              <p id="admin-busy-note" class="mt-0.5 text-[12px] text-on-surface-variant"></p>
            </div>
            <button type="button" data-jump="doctors" class="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">
              <span class="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">medical_services</span>إدارة الأطباء
            </button>
          </div>
          <div id="admin-busy" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>
        </section>

        <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" data-jump="appointments" class="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-container-lowest px-4 py-3 text-start transition-colors hover:bg-surface-container">
            <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">calendar_clock</span><span class="text-[13px] font-semibold text-on-surface">كل المواعيد</span></span>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">chevron_left</span>
          </button>
          <button type="button" data-jump="schedules" class="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-container-lowest px-4 py-3 text-start transition-colors hover:bg-surface-container">
            <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">calendar_month</span><span class="text-[13px] font-semibold text-on-surface">جدولة الأطباء</span></span>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">chevron_left</span>
          </button>
          <button type="button" data-jump="accounts" class="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-container-lowest px-4 py-3 text-start transition-colors hover:bg-surface-container">
            <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">manage_accounts</span><span class="text-[13px] font-semibold text-on-surface">الحسابات والأدوار</span></span>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">chevron_left</span>
          </button>
        </section>
      </div>`;

    host.querySelectorAll<HTMLElement>("[data-jump]").forEach((b) => b.addEventListener("click", () => {
      void showView((b.dataset.jump || "overview") as AdminView);
    }));
    paintBusy();
  };

  /* Busy-doctor cards, filtered live by the header search. */
  const paintBusy = () => {
    const box = panel("#admin-busy");
    const note = panel("#admin-busy-note");
    if (!box) return;
    const needle = busyQuery.trim().toLowerCase();
    const list = busyGroups.filter((g) => !needle || `${g.name} ${g.specialization}`.toLowerCase().includes(needle));
    if (note) note.textContent = busyGroups.length
      ? needle ? `${list.length} من ${busyGroups.length} أطباء يطابقون البحث` : `${busyGroups.length} أطباء لديهم حجوزات اليوم`
      : "";
    if (!busyGroups.length) {
      box.innerHTML = `<div class="sm:col-span-2 lg:col-span-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface-container-low/50 px-4 py-10 text-center">
        <span class="material-symbols-outlined text-[28px] text-on-surface-variant/70" aria-hidden="true">event_note</span>
        <p class="text-[14px] font-semibold text-on-surface">لا حجوزات اليوم بعد</p>
        <p class="max-w-[44ch] text-[12px] text-on-surface-variant">عند وصول أول حجز سيظهر الطبيب هنا مع عدد مواعيده.</p>
      </div>`;
      return;
    }
    if (!list.length) {
      box.innerHTML = `<div class="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-line bg-surface-container-low/50 px-4 py-8 text-center text-[13px] text-on-surface-variant">لا طبيب يطابق «${escapeHtml(busyQuery.trim())}».</div>`;
      return;
    }
    const top = Math.max(...list.map((g) => g.total), 1);
    box.innerHTML = list.map((g) => `<article class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-lowest p-4">
      <div class="flex items-start gap-3">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-[13px] font-bold text-primary">${escapeHtml(initials(g.name))}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[14px] font-semibold text-on-surface">${escapeHtml(g.name)}</p>
          <p class="truncate text-[12px] text-on-surface-variant">${escapeHtml(specialtyLabel(g.specialization))}</p>
        </div>
        <span class="shrink-0 rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold tabular-nums text-on-surface">${g.total} مواعيد</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-surface-container" role="img" aria-label="${g.total} مواعيد اليوم">
        <span class="block h-full rounded-full bg-primary" style="width:${Math.round((g.total / top) * 100)}%"></span>
      </div>
      <div class="flex items-center justify-between gap-2 text-[11px] text-on-surface-variant">
        <span class="tabular-nums">${g.completed} مكتملة · ${g.booked} مؤكدة</span>
        <span class="tabular-nums">${g.next ? `التالي ${formatTime(g.next)}` : "لا مواعيد قادمة"}</span>
      </div>
    </article>`).join("");
  };

  const showView = async (view: AdminView) => {
    currentView = view;
    try { sessionStorage.setItem(VIEW_KEY, view); } catch { /* private mode */ }
    paintNav();
    (Object.keys(VIEW_HOSTS) as AdminView[]).forEach((k) => appEl.querySelector<HTMLElement>(VIEW_HOSTS[k])?.classList.toggle("hidden", k !== view));
    // The search filters the overview's doctor strip only.
    const searchWrap = appEl.querySelector<HTMLElement>("#db-search-wrap");
    if (searchWrap) {
      searchWrap.classList.toggle("invisible", view !== "overview");
      searchWrap.classList.toggle("pointer-events-none", view !== "overview");
    }
    const target = appEl.querySelector<HTMLElement>(VIEW_HOSTS[view]);
    if (!target) return;
    try {
      if (view === "overview") {
        target.innerHTML = skeletonHtml("overview");
        await load();
        return;
      }
      target.innerHTML = skeletonHtml(view);
      if (view === "appointments") {
        if (hooks.renderAppointments) await hooks.renderAppointments(target);
        else target.innerHTML = failureHtml("هذا القسم غير متاح في هذه النسخة");
      } else if (view === "doctors") {
        if (hooks.renderDoctors) await hooks.renderDoctors(target, () => { void showView("appointments"); });
        else target.innerHTML = failureHtml("هذا القسم غير متاح في هذه النسخة");
      } else if (view === "schedules") {
        if (hooks.renderSchedules) await hooks.renderSchedules(target);
        else target.innerHTML = failureHtml("هذا القسم غير متاح في هذه النسخة");
      } else if (view === "accounts") {
        if (hooks.renderAccounts) await hooks.renderAccounts(target, () => { void showView("appointments"); });
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
    void showView((el.dataset.view || "overview") as AdminView);
  }));
  appEl.querySelector<HTMLElement>("#db-nav-logout")?.addEventListener("click", () => {
    closeDbDrawer();
    if (hooks.onLogout) void hooks.onLogout();
  });
  const searchEl = panel("#db-search") as HTMLInputElement | null;
  searchEl?.addEventListener("input", () => {
    busyQuery = searchEl.value;
    if (currentView === "overview") paintBusy();
  });
  paintNav();

  try {
    await showView(currentView);
  } catch (e) {
    host.innerHTML = failureHtml(e);
  }
}
