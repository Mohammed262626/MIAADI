import { escapeHtml, formatTime, formatArabicDate, localDateISO, translateAuthError } from "../../lib/format";
import { getAdminAppointments, getDoctorProfile, findDoctorByUser, getDoctorAvailability, updateAppointmentState, cancelAppointmentClinic } from "../../lib/supabase";
import { confirmSheet } from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { initials, money } from "../../components/ui";
import { contentOf, specialtyLabel } from "./specialtyContent";

type Row = {
  appointment_id: string; patient_name: string; patient_phone: string; doctor_name: string;
  doctor_specialization: string; consultation_fee: number; available_date: string;
  start_time: string; end_time: string; status: string; doctor_id: string;
};
type AvRule = { day_of_week: number; start_time: string; end_time: string; is_enabled: boolean };
type User = { id: string; profile?: { full_name?: string; role?: string } | null } | null;
type Filter = "all" | "waiting" | "completed" | "cancelled" | "no_show";

const toMin = (t: string) => { const [h, m] = String(t).split(":"); return Number(h) * 60 + Number(m || 0); };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const plus30 = (t: string) => { const total = toMin(t) + 30; return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0"); };
const fileRef = (id: string) => "MIA-" + String(id || "").replace(/-/g, "").slice(0, 6).toUpperCase();
const isCancelled = (s: string) => String(s).startsWith("cancelled");
const waitText = (mins: number) => (mins <= 0 ? "الآن" : mins < 60 ? `${mins} دقيقة` : `${Math.floor(mins / 60)} س ${mins % 60} د`);

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: "all", label: "الكل", icon: "layers" },
  { key: "waiting", label: "قيد الانتظار", icon: "hourglass_top" },
  { key: "completed", label: "مكتمل", icon: "task_alt" },
  { key: "cancelled", label: "ملغي", icon: "event_busy" },
  { key: "no_show", label: "غياب", icon: "person_off" },
];

function countOf(rows: Row[], f: Filter) {
  if (f === "all") return rows.length;
  if (f === "waiting") return rows.filter((r) => r.status === "booked").length;
  if (f === "cancelled") return rows.filter((r) => isCancelled(r.status)).length;
  return rows.filter((r) => r.status === f).length;
}

function matches(rows: Row[], f: Filter, q: string) {
  const needle = q.trim().toLowerCase();
  return rows.filter((r) => {
    const okFilter = f === "all" ? true : f === "waiting" ? r.status === "booked" : f === "cancelled" ? isCancelled(r.status) : r.status === f;
    if (!okFilter) return false;
    if (!needle) return true;
    return `${r.patient_name} ${r.patient_phone} ${r.doctor_name}`.toLowerCase().includes(needle);
  });
}

export async function wireDoctorDashboard(appEl: HTMLElement, user: User) {
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
  const role = (user?.profile?.role || "") as string;
  if (!user || (role !== "admin" && role !== "doctor")) return;

  const panel = (sel: string) => appEl.querySelector<HTMLElement>(sel);
  const setText = (sel: string, value: string) => { const el = panel(sel); if (el) el.textContent = value; };

  let filter: Filter = "all";
  let query = "";
  let rows: Row[] = [];
  let live = false;

  setText("#db-sync", "جاري التحديث…");
  host.innerHTML = `<div class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex items-center justify-center gap-space-sm text-secondary font-body-md text-body-md">
    <span class="material-symbols-outlined animate-spin">progress_activity</span> جاري تحميل لوحة العيادة…</div>`;

  const reload = async () => {
    try { await load(); }
    catch (e) {
      showToast(translateAuthError(e), "error");
      host.innerHTML = `<div class="bg-error-container/40 rounded-2xl p-space-xl text-center font-body-md text-body-md text-on-error-container flex flex-col items-center gap-space-sm">
        <span class="material-symbols-outlined text-[36px]">cloud_off</span>
        <span>تعذر تحميل بيانات العيادة — ${escapeHtml(translateAuthError(e))}</span>
      </div>`;
    }
  };

  const load = async () => {
    const today = localDateISO();
    let doctorId: string | null = null;
    if (role === "doctor") {
      try { const d = await findDoctorByUser(user.id); doctorId = d?.id || null; } catch { /* ignore */ }
    }
    const [profile, res, availability] = await Promise.all([
      doctorId ? getDoctorProfile(doctorId).catch(() => null) : Promise.resolve(null),
      getAdminAppointments({ doctorId: doctorId || undefined, dateFrom: today, dateTo: today, page: 0, pageSize: 300, sortBy: "start_time", sortDir: "asc" }),
      doctorId ? (getDoctorAvailability(doctorId).catch(() => []) as Promise<AvRule[]>) : Promise.resolve([] as AvRule[]),
    ]);
    rows = ((res.rows || []) as Row[]).map((r) => ({ ...r, consultation_fee: Number(r.consultation_fee) || 0 }));
    live = true;
    paintShell(profile);
    renderBody(profile, today, availability);
  };

  const paintShell = (profile: Awaited<ReturnType<typeof getDoctorProfile>>) => {
    const displayName = profile?.name || user.profile?.full_name || "مستخدم";
    setText("#db-user-name", displayName);
    const specEl = panel("#db-user-spec");
    if (specEl) { specEl.textContent = profile ? specialtyLabel(profile.specialization) : "مشرف النظام"; specEl.classList.toggle("hidden", false); }
    setText("#db-facility-name", profile ? (profile.hospital_name || (profile.telehealth ? "استشارات عن بُعد" : "بدون موقع مسجّل")) : "جميع العيادات");
    setText("#db-facility-sub", profile ? `${specialtyLabel(profile.specialization)} • ${profile.city || "—"}` : "كل العيادات المسجّلة");
    const badge = panel("#db-nav-tele");
    if (badge) {
      const remaining = rows.filter((r) => r.status === "booked" && toMin(r.start_time) >= nowMin()).length;
      badge.textContent = String(remaining);
      badge.classList.toggle("hidden", remaining === 0);
    }
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

    host.innerHTML = `
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary via-primary-container to-surface-container-highest/20 p-space-lg shadow-sm">
      <div class="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
        <div class="flex flex-col gap-space-xs max-w-3xl">
          <div class="flex flex-wrap items-center gap-space-xs">
            <span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm shadow-sm">
              <span class="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
              <span>${escapeHtml(profile?.hospital_name || (profile?.telehealth ? "استشارات افتراضية عن بُعد" : "جميع العيادات"))}</span>
            </span>
            <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest/80 text-secondary font-label-sm text-label-sm shadow-sm">
              <span class="material-symbols-outlined text-[16px] text-tertiary">verified</span>
              <span>متصل مباشرة بقاعدة بيانات العيادة</span>
            </span>
          </div>
          <h1 class="font-display-lg text-display-lg text-on-primary font-bold tracking-tight mt-space-xs">
            مرحباً، ${escapeHtml(profile?.name || user.profile?.full_name || "مشرف النظام")}
          </h1>
          <p class="font-headline-sm text-headline-sm text-primary-fixed font-medium mt-1">
            ${escapeHtml(profile ? `${profile.title ? profile.title + " " : ""}${specialtyLabel(profile.specialization)}` : "لوحة متابعة العيادات والحجوزات • Clinic Operations")}
          </p>
          <div class="flex flex-wrap items-center gap-space-md pt-space-xs text-on-primary/80 font-body-md text-body-md">
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">calendar_today</span><span>${escapeHtml(formatArabicDate(today))}</span></span>
            <span>•</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">timer</span><span>نسبة إتمام اليوم: <strong class="text-on-primary font-label-md text-label-md">${rate}%</strong></span></span>
            <span>•</span>
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">nest_clock_farsight_analog</span><span>جلسة اليوم: ${escapeHtml(sessionText)}</span></span>
          </div>
        </div>
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-space-sm">
          <button id="db-console" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all" type="button">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">list_alt</span><span>سجل الحجوزات اليومية</span>
          </button>
          <button id="db-manage" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-full bg-primary-container/70 text-on-primary-container font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all" type="button">
            <span class="material-symbols-outlined text-[18px]">tune</span><span>إدارة المواعيد</span>
          </button>
          <button id="db-refresh" class="p-3 rounded-full bg-surface-container-lowest/15 text-on-primary hover:bg-surface-container-lowest/25 transition-all" title="تحديث البيانات" type="button">
            <span class="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[22px]">calendar_month</span></div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
            <span class="material-symbols-outlined text-[14px]">${cancelled + noShow ? "event_busy" : "check"}</span>
            <span>${cancelled + noShow ? `${cancelled + noShow} إلغاء أو غياب` : "لا إلغاءات اليوم"}</span>
          </span>
        </div>
        <div>
          <span class="font-body-sm text-body-sm text-secondary">إجمالي مواعيد اليوم • Today's Agenda</span>
          <div class="flex items-baseline gap-space-xs mt-1">
            <span class="font-display-lg text-display-lg font-bold text-on-surface tabular-nums">${total}</span>
            <span class="font-body-md text-body-md text-secondary">${total ? "مريضاً مسجلاً" : "لا مواعيد اليوم"}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
          <span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span>${morning} صباحاً</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-secondary"></span>${evening} مساءً</span>
        </div>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error"><span class="material-symbols-outlined text-[22px]">airline_seat_recline_normal</span></div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${upcoming.length ? "bg-error-container text-on-error-container" : "bg-surface-container text-secondary"} font-label-sm text-label-sm">
            <span class="w-1.5 h-1.5 rounded-full ${upcoming.length ? "bg-error animate-pulse" : "bg-outline"}"></span>
            <span>${upcoming.length ? "مؤكدة قادمة" : "لا انتظار"}</span>
          </span>
        </div>
        <div>
          <span class="font-body-sm text-body-sm text-secondary">في صالة الانتظار • Waiting Lounge</span>
          <div class="flex items-baseline gap-space-xs mt-1">
            <span class="font-display-lg text-display-lg font-bold text-on-surface tabular-nums">${upcoming.length}</span>
            <span class="font-body-md text-body-md text-secondary">مؤكدة ولم تبدأ بعد</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
          <span class="font-label-sm text-label-sm text-on-surface-variant">أقرب موعد:</span>
          <span class="font-label-sm text-label-sm text-primary font-bold">${next ? `${formatTime(next.start_time)} (بعد ${waitText(toMin(next.start_time) - nowMin())})` : "لا مواعيد متبقية"}</span>
        </div>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary"><span class="material-symbols-outlined text-[22px]">check_circle</span></div>
          <span class="font-label-sm text-label-sm text-secondary font-semibold">نسبة الإنجاز ${rate}%</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="font-body-sm text-body-sm text-secondary">الاستشارات المكتملة • Completed</span>
            <div class="flex items-baseline gap-space-xs mt-1">
              <span class="font-display-lg text-display-lg font-bold text-on-surface tabular-nums">${completed}</span>
              <span class="font-headline-sm text-headline-sm text-secondary">/ ${total}</span>
            </div>
          </div>
          <div class="relative w-12 h-12 flex items-center justify-center">
            <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
              <path class="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="${rate}, 100" stroke-linecap="round" stroke-width="3.5"></path>
            </svg>
            <span class="absolute font-label-sm text-label-sm font-bold text-primary tabular-nums">${rate}%</span>
          </div>
        </div>
        <div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden"><div class="bg-primary h-2 rounded-full" style="width: ${rate}%;"></div></div>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed"><span class="material-symbols-outlined text-[22px]">payments</span></div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm"><span>رسوم العيادة</span></span>
        </div>
        <div>
          <span class="font-body-sm text-body-sm text-secondary">الإيرادات المتوقعة اليوم • Revenue</span>
          <div class="flex items-baseline gap-space-xs mt-1">
            <span class="font-display-lg text-display-lg font-bold text-primary tabular-nums">${revenue.toLocaleString("en-US")}</span>
            <span class="font-label-md text-label-md text-secondary">ج.س (SDG)</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
          <span class="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">shield</span>${escapeHtml(feeNote)}</span>
          <span class="font-label-sm text-label-sm text-secondary">محسوبة من رسوم الأطباء</span>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
      <section class="lg:col-span-8 flex flex-col gap-space-md">
        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div class="flex items-center gap-space-sm">
            <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary"><span class="material-symbols-outlined text-[20px]">view_timeline</span></div>
            <div>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">جدول الحالات والمواعيد المباشرة</h2>
              <p class="font-body-sm text-body-sm text-secondary">سير مواعيد اليوم • Live Patient Stream</p>
            </div>
          </div>
          <div id="db-filters" class="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl overflow-x-auto"></div>
        </div>
        <div id="db-stream" class="flex flex-col gap-space-md"></div>
      </section>

      <aside class="lg:col-span-4 flex flex-col gap-space-md">
        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs">
              <span class="w-2.5 h-2.5 rounded-full ${upcoming.length ? "bg-error animate-ping" : "bg-outline-variant"}"></span>
              <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">صالة الانتظار المباشرة (${upcoming.length})</h3>
            </div>
            <span class="font-label-sm text-label-sm text-secondary">${escapeHtml(profile?.hospital_name || "عن بُعد")}</span>
          </div>
          <p class="font-body-sm text-body-sm text-secondary">المواعيد المؤكدة المتبقية اليوم مرتبة حسب الوقت:</p>
          <div id="db-queue" class="flex flex-col gap-space-xs mt-space-xs"></div>
          <button id="db-queue-all" class="w-full py-2 mt-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors" type="button">عرض كامل سجل الحجوزات</button>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div class="flex items-center gap-space-xs">
            <div class="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[18px]">clinical_notes</span></div>
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">${profile ? "بيانات عيادتك" : "ملخص العيادات"}</h3>
          </div>
          <div id="db-clinic-panel" class="flex flex-col gap-space-xs"></div>
          <button id="db-clinic-edit" class="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-label-sm text-label-sm font-bold transition-all" type="button">${profile ? "إدارة بيانات العيادة والمواعيد" : "فتح سجل الحجوزات"}</button>
        </div>

        ${profile && profile.insurances.length ? `
        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs">
              <div class="w-8 h-8 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary"><span class="material-symbols-outlined text-[18px]">shield</span></div>
              <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">شركات التأمين المرتبطة</h3>
            </div>
            <span class="font-label-sm text-label-sm text-tertiary font-bold tabular-nums">${profile.insurances.length} شركة</span>
          </div>
          <div class="flex flex-wrap gap-space-xs">
            ${profile.insurances.map((n) => `<span class="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">${escapeHtml(n)}</span>`).join("")}
          </div>
          <div class="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span>الرسوم المعتمدة للاستشارة:</span>
            <span class="font-semibold text-primary">${escapeHtml(money(profile.consultation_fee))}</span>
          </div>
        </div>` : ""}

        ${next ? `
        <div class="bg-gradient-to-br from-on-secondary-fixed to-inverse-surface rounded-2xl p-space-md text-on-secondary shadow-sm flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary-fixed text-[20px]">badge</span>
              <span class="font-label-md text-label-md text-primary-fixed font-bold">بطاقة تصريح دخول العيادة الذكية</span>
            </div>
            <span class="font-label-sm text-label-sm text-outline-variant">Smart Pass</span>
          </div>
          <div class="flex items-center justify-between bg-surface-container-lowest/10 rounded-xl p-space-sm">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-bold">${escapeHtml(next.patient_name)}</span>
              <span class="font-body-sm text-body-sm text-secondary-fixed-dim">${escapeHtml(contentOf(next.doctor_specialization).clinic.name)}</span>
            </div>
            <span class="font-label-md text-label-md font-bold text-primary-fixed tabular-nums">${escapeHtml(formatTime(next.start_time))}</span>
          </div>
          <div class="flex items-center justify-between font-label-sm text-label-sm">
            <span dir="ltr" class="font-mono">${escapeHtml(fileRef(next.appointment_id))}</span>
            <span class="text-tertiary-fixed">${toMin(next.start_time) - nowMin() <= 30 ? "نشطة الآن • جاهزة للاستخدام" : "تُصدر قبل الموعد بـ 30 دقيقة"}</span>
          </div>
        </div>` : ""}
      </aside>
    </div>`;

    paintFilters();
    paintStream();
    paintQueue();
    paintClinicPanel(profile);

    const on = (sel: string, ev: string, fn: (e: Event) => void) => { const el = host.querySelector(sel); if (el) el.addEventListener(ev, fn as EventListener); };
    on("#db-console", "click", () => { location.hash = "#admin/manage"; });
    on("#db-manage", "click", () => { location.hash = "#admin/manage"; });
    on("#db-refresh", "click", () => { void reload(); });
    on("#db-queue-all", "click", () => { location.hash = "#admin/manage"; });
    on("#db-clinic-edit", "click", () => { location.hash = "#admin/manage"; });
  };

  const paintFilters = () => {
    const host2 = host.querySelector("#db-filters");
    if (!host2) return;
    host2.innerHTML = FILTERS.map((f) => {
      const active = filter === f.key;
      const n = countOf(rows, f.key);
      return `<button data-filter="${f.key}" class="flex items-center gap-1 px-space-sm py-1 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-all ${
        active ? "bg-surface-container-lowest text-primary font-bold shadow-xs" : "text-secondary hover:text-on-surface"
      }"><span class="material-symbols-outlined text-[15px]">${f.icon}</span><span>${f.label} (${n})</span></button>`;
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

  const cardActions = (r: Row) => {
    if (r.status !== "booked") return "";
    return `<div class="flex flex-wrap items-center gap-space-xs">
      <button data-done="${escapeHtml(r.appointment_id)}" class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all" type="button"><span class="material-symbols-outlined text-[18px]">check</span>تسجيل كمكتمل</button>
      <button data-cancel="${escapeHtml(r.appointment_id)}" class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-error-container/60 hover:text-on-error-container font-label-sm text-label-sm transition-all" type="button"><span class="material-symbols-outlined text-[18px]">event_busy</span>إلغاء</button>
      <a href="tel:${escapeHtml(r.patient_phone)}" class="p-2 rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-all" title="اتصال بالمريض"><span class="material-symbols-outlined text-[20px]">call</span></a>
    </div>`;
  };

  const card = (r: Row) => {
    const kind = kindOf(r);
    const ref = `<span class="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-mono" dir="ltr">${escapeHtml(fileRef(r.appointment_id))}</span>`;
    const phone = `<span class="font-label-sm text-label-sm text-secondary font-mono" dir="ltr">${escapeHtml(r.patient_phone)}</span>`;
    const doctor = `<span class="px-2 py-0.5 rounded-md bg-surface-container-highest text-secondary font-label-sm text-label-sm">${escapeHtml(r.doctor_name)}</span>`;
    const mins = toMin(r.start_time) - nowMin();

    if (kind === "active") {
      return `<div class="relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-md overflow-hidden">
        <div class="absolute top-0 start-0 w-2.5 h-full bg-primary"></div>
        <div class="ps-space-sm flex flex-col gap-space-md">
          <div class="flex flex-wrap items-center justify-between gap-space-sm">
            <div class="flex flex-wrap items-center gap-space-xs">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
                <span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>قيد الكشف الآن • Current Consultation
              </span>
              ${ref}
            </div>
            <div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full">
              <span class="material-symbols-outlined text-primary text-[18px]">timelapse</span>
              <span class="font-label-sm text-label-sm text-on-surface">${range(r)}</span>
              <span class="font-label-sm text-label-sm text-error font-bold">(متبقي ${waitText(toMin(r.start_time) + 30 - nowMin())})</span>
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low/70 rounded-xl p-space-md">
            <div class="flex items-center gap-space-md">
              <span class="w-16 h-16 rounded-2xl bg-surface-container-highest flex-shrink-0 grid place-items-center text-primary font-headline-sm font-bold">${escapeHtml(initials(r.patient_name))}</span>
              <div class="flex flex-col gap-1">
                <div class="flex flex-wrap items-center gap-space-sm">
                  <h3 class="font-headline-md text-headline-md font-bold text-on-surface">${escapeHtml(r.patient_name)}</h3>
                  ${doctor}
                </div>
                <div class="flex flex-wrap items-center gap-space-sm">${phone}<span class="font-label-sm text-label-sm text-secondary">${escapeHtml(specialtyLabel(r.doctor_specialization))}</span></div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <div class="flex flex-wrap items-center gap-space-xs">${cardActions(r)}</div>
            <span class="font-label-sm text-label-sm text-secondary">الرسوم: ${escapeHtml(money(r.consultation_fee))}</span>
          </div>
        </div>
      </div>`;
    }

    const muted = kind === "done" || kind === "cancelled" || kind === "noshow";
    const tag = kind === "waiting"
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"><span class="material-symbols-outlined text-[14px]">schedule</span>التالي بالدور • Scheduled</span>`
      : kind === "pending"
        ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-soft text-warning font-label-sm text-label-sm font-semibold"><span class="material-symbols-outlined text-[14px]">pending_actions</span>بانتظار التسجيل • Pending</span>`
      : kind === "done"
        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm"><span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>تم الكشف وإغلاق الملف • Completed</span>`
        : kind === "cancelled"
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container/60 text-on-error-container font-label-sm text-label-sm"><span class="material-symbols-outlined text-[14px]">event_busy</span>ملغي • Cancelled</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-soft text-warning font-label-sm text-label-sm"><span class="material-symbols-outlined text-[14px]">person_off</span>لم يحضر • No Show</span>`;

    return `<div class="${muted ? "bg-surface-container-low rounded-2xl p-space-md shadow-xs opacity-90" : "bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md"} transition-all flex flex-col gap-space-sm">
      <div class="flex flex-wrap items-center justify-between gap-space-xs">
        <div class="flex flex-wrap items-center gap-space-xs">${tag}${ref}${doctor}</div>
        <span class="font-label-md text-label-md ${kind === "waiting" ? "text-primary font-bold" : kind === "pending" ? "text-warning font-semibold" : "text-secondary"} flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">schedule</span>
          ${range(r)}
          ${kind === "waiting" ? `<span class="text-secondary font-label-sm">(بعد ${waitText(mins)})</span>` : ""}
        </span>
      </div>
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
        <div class="flex items-center gap-space-md">
          <span class="w-12 h-12 rounded-xl ${muted ? "bg-surface-container-highest text-outline" : "bg-surface-container-low text-secondary"} flex-shrink-0 grid place-items-center font-label-lg font-bold">${escapeHtml(initials(r.patient_name))}</span>
          <div>
            <div class="flex flex-wrap items-center gap-space-sm">
              <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">${escapeHtml(r.patient_name)}</h4>
              ${phone}
            </div>
            <p class="font-body-md text-body-md text-secondary mt-0.5">${escapeHtml(specialtyLabel(r.doctor_specialization))} · الرسوم ${escapeHtml(money(r.consultation_fee))}</p>
          </div>
        </div>
        ${cardActions(r)}
      </div>
    </div>`;
  };

  const paintStream = () => {
    const list = host.querySelector("#db-stream");
    if (!list) return;
    const shown = matches(rows, filter, query);
    list.innerHTML = shown.length
      ? shown.map(card).join("")
      : `<div class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col items-center gap-space-sm text-center">
          <span class="material-symbols-outlined text-outline text-[36px]">event_available</span>
          <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">لا توجد مواعيد مطابقة</h3>
          <p class="font-body-md text-body-md text-secondary max-w-[36ch]">${rows.length ? "جرّب تغيير الفلتر أو مسح كلمة البحث." : "لا توجد مواعيد مسجّلة على عيادتك اليوم."}</p>
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
  };

  const paintQueue = () => {
    const list = host.querySelector("#db-queue");
    if (!list) return;
    const upcoming = matches(rows, "waiting", query).filter((r) => toMin(r.start_time) >= nowMin());
    list.innerHTML = upcoming.length
      ? upcoming.map((r, i) => `
        <div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
          <div class="flex items-center gap-space-xs">
            <span class="w-6 h-6 rounded-full ${i === 0 ? "bg-secondary-container text-on-secondary-fixed" : "bg-surface-container-highest text-secondary"} font-label-sm text-label-sm grid place-items-center font-bold">${i + 1}</span>
            <div class="flex flex-col">
              <span class="font-label-md text-label-md font-bold text-on-surface">${escapeHtml(r.patient_name)}</span>
              <span class="font-body-sm text-body-sm text-secondary">${escapeHtml(formatTime(r.start_time))} · بعد ${waitText(toMin(r.start_time) - nowMin())}</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full ${i === 0 ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container text-secondary"} font-label-sm text-label-sm">${i === 0 ? "التالي • جاهز" : "مؤكد"}</span>
        </div>`).join("")
      : `<p class="font-body-sm text-body-sm text-secondary py-space-sm text-center">لا مواعيد مؤكدة متبقية اليوم</p>`;
  };

  const paintClinicPanel = (profile: Awaited<ReturnType<typeof getDoctorProfile>>) => {
    const box = host.querySelector("#db-clinic-panel");
    if (!box) return;
    const item = (label: string, value: string, strong = false) => `
      <div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
        <span class="font-body-sm text-body-sm text-secondary">${escapeHtml(label)}</span>
        <span class="font-label-md text-label-md ${strong ? "text-primary font-bold" : "text-on-surface font-semibold"}">${value}</span>
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
      item("التخصص", escapeHtml(specialtyLabel(profile.specialization))),
      item("الرسوم المعتمدة", escapeHtml(money(profile.consultation_fee)), true),
      item("الموقع", escapeHtml(profile.hospital_name || "استشارات عن بُعد")),
      item("استشارات الفيديو", profile.telehealth ? "متاحة ✓" : "غير متاحة"),
      item("التقييم", `<span class="tabular-nums">${profile.rating ? profile.rating.toFixed(1) : "—"}</span> <span class="text-secondary font-body-sm">(${profile.reviews_count} تقييم)</span>`),
      item("سنوات الخبرة", `<span class="tabular-nums">${profile.experience_years ?? "—"}</span>`),
      item("اللغات", escapeHtml(profile.languages.join(" • ") || "العربية")),
    ].join("");
  };

  const search = panel("#db-search") as HTMLInputElement | null;
  if (search) {
    let t: number | undefined;
    const next = search.cloneNode(true) as HTMLInputElement;
    search.replaceWith(next);
    next.addEventListener("input", () => {
      query = next.value;
      clearTimeout(t);
      t = window.setTimeout(() => { paintStream(); paintQueue(); }, 200);
    });
  }
  const newBooking = panel("#db-new-booking");
  if (newBooking) newBooking.addEventListener("click", () => { location.hash = "#doctors"; });

  try { await reload(); }
  catch (e) { host.innerHTML = `<div class="bg-error-container/40 rounded-2xl p-space-xl text-center font-body-md text-body-md text-on-error-container">${escapeHtml(translateAuthError(e))}</div>`; }
  void live;
}
