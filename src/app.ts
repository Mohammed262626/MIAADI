import "./styles/tailwind.css";
import { getCurrentUser, onAuthChange, logoutUser, loginUser, registerPatient, getDoctorsWithSchedules, bookAppointmentRPC, getPatientAppointments, cancelAppointmentRPC, rescheduleAppointmentRPC, getAdminAppointments, getAdminStats, updateAppointmentState, cancelAppointmentClinic, adminRescheduleAppointmentRPC, adminDeleteAppointmentRPC, listDoctors, adminListProfiles, assignUserRole, saveDoctor, deleteDoctor, findDoctorByUser, listDoctorSchedules, createDoctorSchedule, deleteDoctorSchedule, subscribeToRealtimeUpdates, getAvailableSlots, getDoctorAvailability, saveDoctorAvailability, blockDoctorDates, generateDoctorSchedule, listBlockedDates, unblockDoctorDates, purgeExpiredSlots, updatePatientProfile } from "./lib/supabase";
import { localDateISO, escapeHtml, translateAuthError, formatTime, formatArabicDate } from "./lib/format";
import { showToast } from "./components/Toast";
import { mountAuthModal } from "./components/AuthModal";
import { confirmSheet } from "./components/ConfirmDialog";
import { emptyState } from "./components/ui";
import type { Doctor, Slot } from "./components/DoctorCard";
import { renderConfirmView } from "./views/confirm";
import { renderProfileView } from "./views/profile";
import { renderAdminView } from "./views/admin";
import { renderSiteHeader, renderSiteFooter } from "./components/SiteHeader";
import { HOME_MAIN } from "./views/stitch/home";
import { DOCTORS_MAIN } from "./views/stitch/doctors";
import { DOCTORPROFILE_MAIN } from "./views/stitch/doctorProfile";
import { BOOKINGS_MAIN } from "./views/stitch/bookings";
import { PROFILE_MAIN } from "./views/stitch/profile";
import { registerStitchGlobals } from "./views/stitch/interactions";
import { wireHome } from "./views/stitch/homeLive";
import { wireDoctorsLive } from "./views/stitch/doctorsLive";
import { wireDoctorProfile } from "./views/stitch/doctorProfileLive";
import { wireBookings } from "./views/stitch/bookingsLive";
import { wireProfile } from "./views/stitch/profileLive";

// dev-only: force a theme for screenshots (?theme=light|dark)
if (import.meta.env.DEV) {
  const t = new URLSearchParams(location.search).get("theme");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
}

type RouteName = "home" | "doctors" | "doctor" | "confirm" | "appointments" | "profile" | "admin";
type Route = { name: RouteName; param?: string };
type Pending = { scheduleId: string; doctorId: string; slot: Slot; appointmentId?: string };

const state = {
  currentUser: null as Awaited<ReturnType<typeof getCurrentUser>>,
  doctors: [] as Awaited<ReturnType<typeof getDoctorsWithSchedules>>,
  patientAppointments: [] as Awaited<ReturnType<typeof getPatientAppointments>>,
  route: { name: "home" } as Route,
  pending: null as Pending | null,
  // admin
  adminFilters: { status: "all", doctorId: "", dateFrom: localDateISO(), dateTo: localDateISO(), search: "", sortBy: "available_date", sortDir: "desc" },
  adminPage: 0, adminPageSize: 25, adminTotal: 0,
  adminRows: [] as { appointment_id: string; schedule_id: string; patient_name: string; patient_phone: string; doctor_name: string; available_date: string; start_time: string; status: string; doctor_id: string }[],
  adminDoctors: [] as Awaited<ReturnType<typeof listDoctors>>,
  adminAccounts: [] as Awaited<ReturnType<typeof adminListProfiles>>,
  adminSubTab: "appointments" as "appointments" | "management" | "accounts",
  adminManagementDoctor: null as string | null,
  adminDoctorsCache: [] as Awaited<ReturnType<typeof listDoctors>>,
};

const appEl = document.getElementById("app") as HTMLElement;
if (!document.getElementById("toast-container")) {
  const t = document.createElement("div");
  t.id = "toast-container";
  t.className = "fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-[520px]";
  document.body.appendChild(t);
}

let authModal: ReturnType<typeof mountAuthModal> | null = null;

/* ---------------------------------- routing --------------------------------- */

function parseRoute(): Route {
  const raw = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
  const [seg, param] = raw.split("/");
  switch (seg) {
    case "doctors": return { name: "doctors" };
    case "doctor": return param ? { name: "doctor", param } : { name: "doctors" };
    case "confirm": return param ? { name: "confirm", param } : { name: "home" };
    case "appointments": return { name: "appointments" };
    case "profile": return { name: "profile" };
    case "admin": return { name: "admin", param };
    default: return { name: "home" };
  }
}

function findDoctor(id: string | undefined): Doctor | undefined {
  if (!id) return undefined;
  return (state.doctors as unknown as Doctor[]).find((d) => d.id === id);
}

/* ---------------------------------- render ---------------------------------- */

const STATIC_VIEWS: Record<string, string> = {
  home: HOME_MAIN,
  doctors: DOCTORS_MAIN,
  doctor: DOCTORPROFILE_MAIN,
  appointments: BOOKINGS_MAIN,
  profile: PROFILE_MAIN,
};

/* data-path values found in the Stitch desktop designs -> app routes */
const PATH_ROUTES: Record<string, string> = {
  home: "#home",
  "doctors-and-specialties": "#doctors",
  "hospitals-and-centers": "#doctors",
  "my-bookings": "#appointments",
  "instant-consultation": "#doctors",
  profile: "#profile",
  "dashboard-overview": "#admin",
  "appointments-schedule": "#admin/manage",
  "patients-emr": "#admin/manage",
  "prescriptions-reports": "#admin/manage",
  "billing-cchi-claims": "#admin/manage",
  "clinic-settings-availability": "#admin/manage",
};

let revealObserver: IntersectionObserver | null = null;

function wireReveal() {
  const nodes = appEl.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  document.documentElement.classList.add("reveal-ready");
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver?.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  }
  nodes.forEach((n) => revealObserver!.observe(n));
}

function render() {
  const route = state.route;
  const role = state.currentUser?.profile?.role as string | undefined;
  const canAdmin = role === "admin" || role === "doctor";
  const demoMode = !state.currentUser;
  if (route.name === "admin" && !canAdmin && !demoMode) { location.hash = "#home"; return; }

  if (route.name === "admin" && !route.param) {
    appEl.innerHTML = `<main class="w-full pt-[calc(5rem+env(safe-area-inset-top))] bg-surface min-h-dvh"><div id="admin-boot" class="p-space-xl text-center text-secondary font-body-md text-body-md flex items-center justify-center gap-space-sm"><span class="material-symbols-outlined animate-spin">progress_activity</span> جاري تحميل لوحة العيادة…</div></main><div id="auth-mount"></div>`;
  } else {
    const staticHtml = STATIC_VIEWS[route.name];
    const mainOpen = staticHtml
      ? `<main class="w-full pt-[calc(5rem+env(safe-area-inset-top))] bg-surface min-h-dvh">${staticHtml}</main>`
      : `<main id="main-root" class="w-full pt-[calc(5rem+env(safe-area-inset-top))] bg-surface min-h-dvh"></main>`;
    appEl.innerHTML = `${renderSiteHeader(state.currentUser, route)}${mainOpen}${renderSiteFooter()}<div id="auth-mount"></div>`;
  }

  wireShell();
  wireReveal();
  if (route.name === "home") void wireHome(appEl, state.currentUser);
  if (route.name === "doctors") void wireDoctorsLive(appEl);
  if (route.name === "doctor" && route.param) void wireDoctorProfile(appEl, route.param, state.currentUser);
  if (route.name === "appointments") void wireBookings(appEl, state.currentUser);
  if (route.name === "profile") void wireProfile(appEl, state.currentUser, {
    onOpenAuth: () => authModal?.open(),
    onLogout: async () => {
      try { await logoutUser(); state.currentUser = null; state.patientAppointments = []; showToast("تم تسجيل الخروج", "success"); go("#home"); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    },
    onSave: async ({ fullName, phone }) => {
      try { await updatePatientProfile({ fullName, phone }); state.currentUser = await getCurrentUser(); render(); }
      catch (e) { showToast(translateAuthError(e), "error"); throw e; }
    },
  });
  if (route.name === "admin" && !route.param) {
    void (async () => {
      const [{ DASHBOARD_BODY: body }, { wireDoctorDashboard: wireDb }, { mountAuthModal: mountModal }] = await Promise.all([
        import("./views/stitch/dashboard"),
        import("./views/stitch/dashboardLive"),
        import("./components/AuthModal"),
      ]);
      if (state.route.name !== "admin" || state.route.param) return;
      appEl.innerHTML = `${body}<div id="auth-mount"></div>`;
      wireShell();
      authModal = mountModal(appEl.querySelector<HTMLElement>("#auth-mount")!,
        async ({ email, password }) => { const r = await loginUser({ email, password }); state.currentUser = await getCurrentUser(); await refreshAll(); render(); return r as unknown as void; },
        async ({ email, password, fullName, phone }) => { const r = await registerPatient({ email, password, fullName, phone }); state.currentUser = await getCurrentUser(); await refreshAll(); render(); return r as unknown as void; }
      );
      if (!state.currentUser && !new URLSearchParams(location.search).has("fixture")) authModal?.open();
      void wireDb(appEl, state.currentUser);
    })();
  }

  const authMount = document.getElementById("auth-mount") as HTMLElement;
  authModal = mountAuthModal(authMount,
    async ({ email, password }) => {
      const r = await loginUser({ email, password });
      state.currentUser = await getCurrentUser();
      await refreshAll();
      render();
      return r as unknown as void;
    },
    async ({ email, password, fullName, phone }) => {
      const r = await registerPatient({ email, password, fullName, phone });
      state.currentUser = await getCurrentUser();
      await refreshAll();
      render();
      return r as unknown as void;
    }
  );

  const main = document.getElementById("main-root") as HTMLElement | null;
  switch (route.name) {
    case "confirm": if (main) renderConfirmTab(main, route.param!); break;
    case "profile": if (main) renderProfileTab(main); break;
    case "admin": if (main) void renderAdminTab(main); break;
  }
}

/* --------------------------------- shell ---------------------------------- */

function wireShell() {
  appEl.querySelectorAll<HTMLElement>('[data-action="open-auth"]').forEach((b) => b.addEventListener("click", () => authModal?.open()));

  const headRow = appEl.querySelector<HTMLElement>("#db-actions") || appEl.querySelector<HTMLElement>("header > div");
  if (headRow && !document.getElementById("theme-toggle")) {
    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    btn.title = "الوضع الداكن";
    btn.className = "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-on-surface transition-colors hover:bg-surface-container";
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">dark_mode</span>';
    btn.setAttribute("aria-label", "تبديل المظهر الداكن أو الفاتح");
    headRow.appendChild(btn);
    const paintToggle = (mode: string) => {
      btn.setAttribute("aria-pressed", String(mode === "dark"));
      btn.title = mode === "dark" ? "المظهر الفاتح" : "المظهر الداكن";
      const icon = btn.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = mode === "dark" ? "light_mode" : "dark_mode";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "dark" ? "#101416" : "#00685F");
    };
    paintToggle(document.documentElement.dataset.theme || "light");
    btn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("miaadi.theme", next); } catch {}
      paintToggle(next);
    });
  }

  const menu = appEl.querySelector<HTMLElement>("#mobile-menu");
  const menuIcon = appEl.querySelector<HTMLElement>("#mobile-menu-icon");
  const menuBtn = appEl.querySelector<HTMLButtonElement>("#mobile-menu-btn");
  menuBtn?.addEventListener("click", () => {
    if (!menu) return;
    const nowHidden = menu.classList.toggle("hidden");
    if (menuIcon) menuIcon.textContent = nowHidden ? "menu" : "close";
    menuBtn.setAttribute("aria-expanded", String(!nowHidden));
  });
  menu?.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest("[data-path]")) return;
    menu.classList.add("hidden");
    if (menuIcon) menuIcon.textContent = "menu";
    menuBtn?.setAttribute("aria-expanded", "false");
  });
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const pathEl = target.closest<HTMLElement>("[data-path]");
  if (pathEl) {
    const dest = PATH_ROUTES[pathEl.dataset.path || ""];
    if (dest) {
      e.preventDefault();
      go(dest);
      return;
    }
  }

  const anchor = target.closest<HTMLAnchorElement>('a[href="#"]');
  if (anchor) e.preventDefault();

  const doctorBtn = target.closest<HTMLElement>("[data-book-doctor], [data-doctor-id]");
  if (doctorBtn) {
    const id = doctorBtn.dataset.bookDoctor || doctorBtn.dataset.doctorId;
    if (id) { e.preventDefault(); go(`#doctor/${id}`); return; }
  }

  const heroCta = target.closest<HTMLElement>("[data-hero-cta]");
  if (heroCta) {
    const dest = heroCta.dataset.heroCta;
    e.preventDefault();
    if (!dest || dest === "auth") authModal?.open();
    else go(dest);
    return;
  }

  const clickable = target.closest<HTMLElement>("button, a");
  if (!clickable) return;
  const label = (clickable.textContent || "").replace(/\s+/g, " ").trim();
  if (!label) return;

  if (label.includes("عرض بطاقة الدخول")) { go("#appointments"); return; }
  if (/احجز موعداً/.test(label)) { go("#doctors"); }
}

/* ----------------------------------- views ---------------------------------- */

function renderConfirmTab(main: HTMLElement, scheduleId: string) {
  const pending = state.pending;
  if (!pending || pending.scheduleId !== scheduleId) {
    main.innerHTML = `<div class="px-4 pt-3">${emptyState({
      icon: "link_off",
      title: "لا يوجد حجز قيد التأكيد",
      body: "ابدأ من جديد باختيار الطبيب والموعد المناسب لك.",
      actionHtml: `<a href="#doctors" class="mt-1 h-11 px-5 rounded-lg bg-primary text-on-primary font-bold text-sm grid place-items-center">تصفح الأطباء</a>`,
    })}</div>`;
    return;
  }
  const doctor = findDoctor(pending.doctorId);
  if (!doctor) {
    main.innerHTML = `<div class="px-4 pt-3">${emptyState({ icon: "error", title: "تعذّر تحميل بيانات الطبيب", body: "ارجع وأعد المحاولة." })}</div>`;
    return;
  }
  renderConfirmView(main, {
    doctor,
    slot: pending.slot,
    user: state.currentUser,
    mode: pending.appointmentId ? "reschedule" : "book",
    onOpenAuth: () => authModal?.open(),
    onConfirm: async (p) => {
      try {
        let res: { id?: string } | void;
        if (pending.appointmentId) {
          res = await rescheduleAppointmentRPC({ appointmentId: pending.appointmentId, newScheduleId: pending.scheduleId }) as { id?: string };
          showToast("تمت إعادة الجدولة", "success");
        } else {
          res = await bookAppointmentRPC({ scheduleId: pending.scheduleId, patientName: p.patientName, patientPhone: p.patientPhone }) as { id?: string };
        }
        await Promise.all([refreshDoctors(), refreshAppointments()]);
        state.pending = null;
        return res;
      } catch (e) {
        showToast(translateAuthError(e), "error");
        throw e;
      }
    },
  });
}

function renderProfileTab(main: HTMLElement) {
  const role = state.currentUser?.profile?.role as string | undefined;
  renderProfileView(main, {
    user: state.currentUser as unknown as Parameters<typeof renderProfileView>[1]["user"],
    canAdmin: role === "admin" || role === "doctor",
    onOpenAuth: () => authModal?.open(),
    onAdmin: () => go("#admin"),
    onLogout: async () => {
      try {
        await logoutUser();
        state.currentUser = null;
        state.patientAppointments = [];
        showToast("تم تسجيل الخروج", "success");
        go("#home");
      } catch (e) { showToast(translateAuthError(e), "error"); }
    },
    onSave: async ({ fullName, phone }) => {
      try {
        await updatePatientProfile({ fullName, phone });
        state.currentUser = await getCurrentUser();
        render();
      } catch (e) { showToast(translateAuthError(e), "error"); throw e; }
    },
  });
}

/* ----------------------------------- admin ---------------------------------- */

async function renderAdminTab(main: HTMLElement) {
  const role = state.currentUser?.profile?.role as string;
  const isDoctor = role === "doctor";
  if (state.adminSubTab !== "appointments") { await renderAdminManagement(main, state.adminSubTab); return; }
  try {
    if (isDoctor) {
      const my = await findDoctorByUser(state.currentUser!.id);
      state.adminManagementDoctor = my?.id || null;
    }
    if (!state.adminDoctors.length) state.adminDoctors = await listDoctors();
    state.adminDoctorsCache = state.adminDoctors;
  } catch { /* ignore */ }
  let stats = { total: 0, booked: 0, completed: 0, cancelled: 0, noShow: 0, today: 0 };
  try { stats = await getAdminStats(); } catch { /* ignore */ }
  try {
    const res = await getAdminAppointments({ statuses: state.adminFilters.status === "all" ? undefined : state.adminFilters.status === "cancelled" ? ["cancelled_by_patient", "cancelled_by_clinic"] : [state.adminFilters.status], doctorId: state.adminFilters.doctorId || undefined, dateFrom: state.adminFilters.dateFrom || undefined, dateTo: state.adminFilters.dateTo || undefined, search: state.adminFilters.search || undefined, page: state.adminPage, pageSize: state.adminPageSize, sortBy: state.adminFilters.sortBy, sortDir: state.adminFilters.sortDir });
    state.adminRows = (res.rows as typeof state.adminRows) || []; state.adminTotal = res.total || 0;
  } catch (e) { showToast(translateAuthError(e), "error"); }

  renderAdminView(main, {
    rows: state.adminRows, total: state.adminTotal, page: state.adminPage, pageSize: state.adminPageSize, stats,
    filters: state.adminFilters, doctors: state.adminDoctors.map((d) => ({ id: d.id, name: d.name })),
    roleLabel: isDoctor ? "حساب طبيب" : "حساب مشرف",
    onFilter: (patch) => { Object.assign(state.adminFilters, patch); state.adminPage = 0; void renderAdminTab(main); },
    onPage: (dir) => { state.adminPage = Math.max(0, state.adminPage + dir); void renderAdminTab(main); },
    onState: async (id, s) => { try { await updateAppointmentState(id, s); showToast("تم التحديث", "success"); await refreshAdminRows(); void renderAdminTab(main); } catch (e) { showToast(translateAuthError(e), "error"); } },
    onClinicCancel: async (id) => { try { await cancelAppointmentClinic(id); showToast("تم الإلغاء وإتاحة الموعد", "success"); await refreshAdminRows(); await refreshDoctors(); } catch (e) { showToast(translateAuthError(e), "error"); } },
    onEdit: (row) => { void openApptEditDialog(row, main); },
    onDelete: async (row) => {
      try { await adminDeleteAppointmentRPC(row.appointment_id); showToast("تم حذف الحجز بنجاح", "success"); await refreshAdminRows(); void renderAdminTab(main); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    },
    onManageTab: (tab) => { state.adminSubTab = tab; if (tab === "appointments") void renderAdminTab(main); else void renderAdminManagement(main, tab); },
    activeSubTab: state.adminSubTab,
  });
}

type AdminRow = (typeof state.adminRows)[number];

async function openApptEditDialog(row: AdminRow, main: HTMLElement) {
  document.getElementById("appt-edit-dialog")?.remove();
  const today = localDateISO();
  const endDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  let free: { id: string; available_date: string; start_time: string; end_time?: string }[] = [];
  try {
    const slots = await getAvailableSlots(row.doctor_id, today, endDate);
    free = (slots as unknown as { id: string; available_date: string; start_time: string }[]).filter((s) => s.id !== row.schedule_id);
  } catch (e) { showToast(translateAuthError(e), "error"); return; }

  const dates = free.length ? [...new Set(free.map((s) => s.available_date))] : [];
  if (!dates.length) { showToast("لا توجد مواعيد متاحة لهذا الطبيب خلال الأسبوعين القادمين", "info"); return; }

  const dlg = document.createElement("dialog");
  dlg.id = "appt-edit-dialog";
  dlg.className = "p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-center min-h-dvh w-full max-w-none";
  dlg.innerHTML = `
  <div class="bg-surface-container-lowest rounded-xl shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] w-full max-w-[440px] p-space-xl mx-4 flex flex-col gap-space-lg">
    <div class="flex items-center gap-space-sm">
      <span class="w-11 h-11 rounded-lg grid place-items-center bg-primary/10 text-primary"><span class="material-symbols-outlined text-[22px]">edit_calendar</span></span>
      <div class="min-w-0">
        <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">تعديل موعد المريض</h3>
        <p class="font-label-sm text-label-sm text-secondary truncate">${escapeHtml(row.patient_name)} • ${escapeHtml(row.doctor_name)}</p>
      </div>
    </div>
    <div class="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-sm font-label-sm text-label-sm">
      <span class="text-secondary whitespace-nowrap">الموعد الحالي:</span>
      <span class="font-bold text-on-surface truncate">${escapeHtml(formatArabicDate(row.available_date))} • ${escapeHtml(formatTime(row.start_time))}</span>
    </div>
    <div class="grid grid-cols-2 gap-space-md">
      <label class="flex flex-col gap-1 font-label-sm text-label-sm text-secondary">التاريخ
        <select id="appt-date" class="px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface outline-none focus:border-primary"></select>
      </label>
      <label class="flex flex-col gap-1 font-label-sm text-label-sm text-secondary">الوقت
        <select id="appt-time" class="px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface outline-none focus:border-primary"></select>
      </label>
    </div>
    <div class="flex items-center justify-end gap-space-sm">
      <button id="appt-cancel" class="px-space-lg py-2.5 rounded-lg border border-line font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">إلغاء</button>
      <button id="appt-save" class="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors">حفظ التعديل</button>
    </div>
  </div>`;
  document.body.appendChild(dlg);
  dlg.showModal();

  const dateSel = dlg.querySelector("#appt-date") as HTMLSelectElement;
  const timeSel = dlg.querySelector("#appt-time") as HTMLSelectElement;
  const fillTimes = () => {
    const day = free.filter((s) => s.available_date === dateSel.value);
    timeSel.innerHTML = day.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(formatTime(s.start_time))}</option>`).join("");
  };
  dateSel.innerHTML = dates.map((d, i) => `<option value="${escapeHtml(d)}">${escapeHtml(formatArabicDate(d))}${i === 0 ? " • أقرب" : ""}</option>`).join("");
  dateSel.value = dates[0];
  fillTimes();
  dateSel.addEventListener("change", fillTimes);

  const closeDlg = () => { dlg.close(); dlg.remove(); };
  dlg.querySelector("#appt-cancel")?.addEventListener("click", closeDlg);
  dlg.querySelector("#appt-save")?.addEventListener("click", async () => {
    const newScheduleId = timeSel.value;
    if (!newScheduleId) return;
    const saveBtn = dlg.querySelector("#appt-save") as HTMLButtonElement;
    saveBtn.disabled = true;
    try {
      await adminRescheduleAppointmentRPC({ appointmentId: row.appointment_id, newScheduleId });
      showToast("تم تعديل موعد المريض بنجاح", "success");
      closeDlg();
      await refreshAdminRows();
      void renderAdminTab(main);
    } catch (e) { showToast(translateAuthError(e), "error"); saveBtn.disabled = false; }
  });
}

async function renderAdminManagement(main: HTMLElement, tab: "management" | "accounts") {
  if (tab === "accounts") {
    try { state.adminAccounts = await adminListProfiles(); } catch (e) { showToast(translateAuthError(e), "error"); }
    const rows = state.adminAccounts as { user_id: string; full_name: string; email: string; phone: string; role: string }[];
    const rolePill = (role: string) => role === "admin"
      ? `<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-bold bg-inverse-surface text-inverse-on-surface"><span class="material-symbols-outlined text-[14px]">shield_person</span>مشرف</span>`
      : role === "doctor"
        ? `<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-bold bg-primary/10 text-primary"><span class="material-symbols-outlined text-[14px]">stethoscope</span>طبيب</span>`
        : `<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-bold bg-surface-container-high text-on-surface-variant"><span class="material-symbols-outlined text-[14px]">person</span>مريض</span>`;
    main.innerHTML = `
      <div class="w-full px-margin-desktop py-space-xl">
        <div class="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
          <div class="flex items-center gap-space-sm text-secondary font-label-md text-label-md">
            <span class="text-on-surface">بوابة الإدارة</span><span>/</span><span class="text-primary font-bold">الحسابات والأدوار</span>
          </div>
          <button data-back class="flex items-center gap-space-xs px-space-md py-2 rounded-lg border border-line font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>رجوع للحجوزات
          </button>
        </div>
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
          <div>
            <div class="mb-space-xs text-[12px] font-medium text-on-surface-variant">إدارة المستخدمين</div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">الحسابات والأدوار
            </h1>
          </div>
          <div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-lg">
            <span class="material-symbols-outlined text-primary text-[20px]">group</span>
            <span class="font-label-sm text-label-sm text-on-surface">إجمالي الحسابات <span class="tabular-nums font-bold">${rows.length}</span></span>
          </div>
        </div>
        <div class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
          <div class="max-sm:hidden overflow-x-auto">
            <table class="w-full font-body-md text-body-md">
              <thead class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"><tr>
                <th class="px-space-lg py-space-md text-right font-semibold">الاسم</th>
                <th class="px-space-lg py-space-md text-right font-semibold">البريد الإلكتروني</th>
                <th class="px-space-lg py-space-md text-right font-semibold">الهاتف</th>
                <th class="px-space-lg py-space-md text-right font-semibold">الدور</th>
                <th class="px-space-lg py-space-md text-center font-semibold">تغيير الدور</th>
              </tr></thead>
              <tbody class="divide-y divide-line">${rows.map((p) => `
                <tr class="hover:bg-surface-container-low/60 transition-colors">
                  <td class="px-space-lg py-space-md font-semibold text-on-surface">${escapeHtml(p.full_name || "—")}</td>
                  <td class="px-space-lg py-space-md tabular-nums text-label-sm text-on-surface-variant" dir="ltr">${escapeHtml(p.email || "")}</td>
                  <td class="px-space-lg py-space-md tabular-nums text-label-sm text-on-surface-variant" dir="ltr">${escapeHtml(p.phone || "—")}</td>
                  <td class="px-space-lg py-space-md">${rolePill(p.role)}</td>
                  <td class="px-space-lg py-space-md text-center"><select data-role-for="${escapeHtml(p.user_id)}" class="px-space-md py-1.5 rounded-xl border border-line bg-surface text-label-sm text-on-surface"><option value="patient" ${p.role === "patient" ? "selected" : ""}>مريض</option><option value="doctor" ${p.role === "doctor" ? "selected" : ""}>طبيب</option><option value="admin" ${p.role === "admin" ? "selected" : ""}>مشرف</option></select></td>
                </tr>`).join("")}</tbody>
            </table>
          </div>
          <div class="sm:hidden flex flex-col gap-space-md p-space-md">${rows.map((p) => `
            <div class="flex flex-col gap-2 rounded-xl border border-line bg-surface-container-low p-space-md">
              <div class="flex items-center justify-between gap-2">
                <span class="font-label-md text-label-md font-bold text-on-surface truncate">${escapeHtml(p.full_name || "—")}</span>
                ${rolePill(p.role)}
              </div>
              <span class="tabular-nums text-label-sm text-on-surface-variant truncate" dir="ltr">${escapeHtml(p.email || "")}</span>
              <span class="tabular-nums text-label-sm text-on-surface-variant" dir="ltr">${escapeHtml(p.phone || "—")}</span>
              <label class="flex items-center gap-2 pt-1 border-t border-line">
                <span class="font-label-sm text-label-sm text-secondary">تغيير الدور</span>
                <select data-role-for="${escapeHtml(p.user_id)}" class="flex-1 px-space-md py-1.5 rounded-xl border border-line bg-surface text-label-sm text-on-surface"><option value="patient" ${p.role === "patient" ? "selected" : ""}>مريض</option><option value="doctor" ${p.role === "doctor" ? "selected" : ""}>طبيب</option><option value="admin" ${p.role === "admin" ? "selected" : ""}>مشرف</option></select>
              </label>
            </div>`).join("")}</div>
        </div>
      </div>`;
    main.querySelector("[data-back]")?.addEventListener("click", () => { state.adminSubTab = "appointments"; render(); });
    main.querySelectorAll<HTMLSelectElement>("[data-role-for]").forEach((sel) => sel.addEventListener("change", async () => {
      const uid = sel.dataset.roleFor!; const prev = sel.value;
      try { await assignUserRole(uid, sel.value); showToast("تم تحديث الدور", "success"); } catch (e) { showToast(translateAuthError(e), "error"); sel.value = prev; }
    }));
    return;
  }

  const docs = state.adminDoctorsCache.length ? state.adminDoctorsCache : await listDoctors();
  state.adminDoctorsCache = docs;
  main.innerHTML = `
    <div class="w-full px-margin-desktop py-space-xl">
      <div class="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
        <div class="flex items-center gap-space-sm text-secondary font-label-md text-label-md">
          <span class="text-on-surface">بوابة الإدارة</span><span>/</span><span class="text-primary font-bold">الأطباء والمواعيد</span>
        </div>
        <button data-back class="flex items-center gap-space-xs px-space-md py-2 rounded-lg border border-line font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>رجوع للحجوزات
        </button>
      </div>
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
        <div>
          <div class="mb-space-xs text-[12px] font-medium text-on-surface-variant">إدارة مقدمي الرعاية</div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">الأطباء والمواعيد
          </h1>
        </div>
        <button id="add-doctor" class="flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-teal-hover transition-colors">
          <span class="material-symbols-outlined text-[20px]">person_add</span>إضافة طبيب
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">${docs.map((d) => `
        <div class="flex flex-col gap-space-md rounded-xl border border-line bg-surface-container-lowest p-space-lg">
          <div class="flex items-start gap-space-sm">
            <span class="w-11 h-11 rounded-lg shrink-0 grid place-items-center bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-[22px]">stethoscope</span>
            </span>
            <div class="min-w-0">
              <h3 class="font-label-lg text-label-lg font-bold text-on-surface truncate">${escapeHtml(d.name)}</h3>
              <p class="font-body-sm text-body-sm text-secondary truncate">${escapeHtml(d.specialization)} · <span class="tabular-nums">${escapeHtml(String(d.consultation_fee))}</span> ج.س</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-auto">
            <button data-manage="${escapeHtml(d.id)}" class="flex-1 flex items-center justify-center gap-1 px-space-sm py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm font-bold hover:bg-primary/20 transition-colors">
              <span class="material-symbols-outlined text-[16px]">calendar_month</span>المواعيد
            </button>
            <button data-edit="${escapeHtml(d.id)}" class="px-space-md py-2 rounded-lg border border-line font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors">تعديل</button>
            <button data-del="${escapeHtml(d.id)}" class="px-space-md py-2 rounded-lg bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error-container transition-colors">حذف</button>
          </div>
        </div>`).join("")}</div>
      <div id="schedules-root" class="${state.adminManagementDoctor ? "" : "hidden"} mt-space-xl"></div>
    </div>
    <dialog id="doctor-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-center min-h-dvh w-full max-w-none">
      <div class="bg-surface-container-lowest rounded-xl shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] w-full max-w-[480px] p-space-xl mx-4">
        <div class="flex items-center gap-space-sm mb-space-lg">
          <span class="w-11 h-11 rounded-lg grid place-items-center bg-primary/10 text-primary"><span class="material-symbols-outlined text-[22px]">stethoscope</span></span>
          <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface" id="doctor-dialog-title">طبيب</h3>
        </div>
        <form id="doctor-form" class="space-y-3">
          <label class="block font-label-sm text-label-sm text-secondary">الاسم
            <input id="doc-name" required placeholder="د. الاسم الكامل" class="mt-1 w-full px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block font-label-sm text-label-sm text-secondary">التخصص
            <input id="doc-spec" required placeholder="التخصص" class="mt-1 w-full px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block font-label-sm text-label-sm text-secondary">رسوم الكشف (ج.س)
            <input id="doc-fee" required type="number" min="0" placeholder="3000" class="mt-1 w-full px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block font-label-sm text-label-sm text-secondary">حساب المستخدم
            <select id="doc-user" class="mt-1 w-full px-space-md py-2.5 rounded-xl border border-line bg-surface text-body-md text-on-surface"><option value="">بدون حساب</option>${(state.adminAccounts as { user_id: string; full_name: string; email: string }[]).map((p) => `<option value="${escapeHtml(p.user_id)}">${escapeHtml(p.full_name)} — ${escapeHtml(p.email)}</option>`).join("")}</select>
          </label>
          <div class="flex gap-2 pt-1">
            <button type="button" data-close-doc class="flex-1 py-3 rounded-lg border border-line font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">إلغاء</button>
            <button type="submit" class="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-teal-hover transition-colors">حفظ</button>
          </div>
        </form>
      </div>
    </dialog>
  `;
  main.querySelector("[data-back]")?.addEventListener("click", () => { state.adminSubTab = "appointments"; render(); });
  const docDlg = main.querySelector("#doctor-dialog") as HTMLDialogElement;
  let editing: string | null = null;
  const openDoc = async (id?: string) => {
    editing = id || null;
    (main.querySelector("#doctor-dialog-title") as HTMLElement).textContent = id ? "تعديل طبيب" : "إضافة طبيب";
    if (id) {
      const d = docs.find((x) => x.id === id)!;
      (main.querySelector("#doc-name") as HTMLInputElement).value = d.name;
      (main.querySelector("#doc-spec") as HTMLInputElement).value = d.specialization;
      (main.querySelector("#doc-fee") as HTMLInputElement).value = String(d.consultation_fee);
      (main.querySelector("#doc-user") as HTMLSelectElement).value = (d as { user_id?: string }).user_id || "";
    } else {
      (main.querySelector("#doctor-form") as HTMLFormElement).reset();
    }
    try { if (!state.adminAccounts.length) state.adminAccounts = await adminListProfiles(); } catch { /* ignore */ }
    docDlg.showModal();
  };
  main.querySelector("#add-doctor")?.addEventListener("click", () => void openDoc());
  main.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((b) => b.addEventListener("click", () => void openDoc(b.dataset.edit!)));
  main.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    const doc = docs.find((x) => x.id === b.dataset.del);
    const ok = await confirmSheet({ title: "حذف الطبيب؟", body: `سيتم حذف ${doc?.name || "الطبيب"} نهائياً.`, confirmLabel: "حذف", tone: "danger" });
    if (!ok) return;
    try { await deleteDoctor(b.dataset.del!); showToast("تم الحذف", "success"); state.adminDoctorsCache = await listDoctors(); void renderAdminManagement(main, "management"); }
    catch (e) { const m = String((e as { message?: string })?.message || ""); if (/23503|foreign key|appointments/i.test(m)) showToast("لا يمكن الحذف — توجد حجوزات", "error"); else showToast(translateAuthError(e), "error"); }
  }));
  main.querySelectorAll<HTMLButtonElement>("[data-manage]").forEach((b) => b.addEventListener("click", async () => { state.adminManagementDoctor = b.dataset.manage!; await renderSchedules(main.querySelector("#schedules-root") as HTMLElement, state.adminManagementDoctor); }));
  main.querySelector("[data-close-doc]")?.addEventListener("click", () => docDlg.close());
  docDlg.addEventListener("click", (e) => { if (e.target === docDlg) docDlg.close(); });
  (main.querySelector("#doctor-form") as HTMLFormElement).addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (main.querySelector("#doc-name") as HTMLInputElement).value.trim();
    const specialization = (main.querySelector("#doc-spec") as HTMLInputElement).value.trim();
    const consultationFee = Number((main.querySelector("#doc-fee") as HTMLInputElement).value);
    const userId = (main.querySelector("#doc-user") as HTMLSelectElement).value || null;
    try { await saveDoctor({ id: editing || undefined, name, specialization, consultationFee, userId }); showToast("تم الحفظ", "success"); docDlg.close(); state.adminDoctorsCache = await listDoctors(); state.adminDoctors = state.adminDoctorsCache; void renderAdminManagement(main, "management"); } catch (err) { showToast(translateAuthError(err), "error"); }
  });
  if (state.adminManagementDoctor) await renderSchedules(main.querySelector("#schedules-root") as HTMLElement, state.adminManagementDoctor);
}

async function renderSchedules(root: HTMLElement, doctorId: string) {
  root.classList.remove("hidden");
  root.innerHTML = `<p class="font-body-md text-body-md text-secondary py-space-lg text-center">جاري تحميل المواعيد…</p>`;
  type AvRule = { day_of_week: number; start_time: string; end_time: string; is_enabled: boolean; slot_minutes: number | null; break_start_1: string | null; break_end_1: string | null; break_start_2: string | null; break_end_2: string | null };
  type Blocked = { id: string; start_date: string; end_date: string; reason: string | null };
  try {
    const [schedules, availability, blocked] = await Promise.all([
      listDoctorSchedules(doctorId),
      getDoctorAvailability(doctorId).catch(() => []) as Promise<AvRule[]>,
      listBlockedDates(doctorId).catch(() => []) as Promise<Blocked[]>,
    ]);
    const doc = state.adminDoctorsCache.find((d) => d.id === doctorId);
    const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const enabled = availability.filter((r) => r.is_enabled);
    const hasRules = enabled.length > 0;
    const selected = new Set<number>(enabled.map((r) => r.day_of_week));
    const byDay = new Map(enabled.map((r) => [r.day_of_week, r]));
    const first = enabled[0];
    const sharedStart = (first?.start_time || "09:00").slice(0, 5);
    const sharedEnd = (first?.end_time || "14:00").slice(0, 5);
    const slotMinutes = String(first?.slot_minutes ?? 30);
    const pick = (v: string | null | undefined, dflt: string) => (hasRules ? (v || "") : dflt).slice(0, 5);
    const b1s = pick(first?.break_start_1, "13:00"), b1e = pick(first?.break_end_1, "14:00");
    const b2s = pick(first?.break_start_2, "15:00"), b2e = pick(first?.break_end_2, "16:00");

    root.innerHTML = `
      <div class="flex items-center gap-space-sm mb-space-lg">
        <span class="w-11 h-11 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0"><span class="material-symbols-outlined text-[22px]">calendar_month</span></span>
        <div>
          <div class="text-[12px] font-medium text-on-surface-variant">جداول العمل</div>
          <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">مواعيد ${escapeHtml(doc?.name || "الطبيب")}</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
        <section class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
          <h4 class="flex items-center gap-space-xs font-label-lg text-label-lg font-bold text-on-surface mb-space-md">
            <span class="material-symbols-outlined text-[20px] text-primary">schedule</span>أوقات العمل الأسبوعية
          </h4>
          <div id="day-chips" class="flex flex-wrap gap-space-xs">
            ${DAYS.map((d, i) => `<button type="button" data-day="${i}" class="px-space-md py-1.5 rounded-lg border font-label-sm text-label-sm font-bold transition-colors ${selected.has(i) ? "bg-primary text-on-primary border-primary" : "border-line text-on-surface-variant hover:bg-surface-container"}">${d}</button>`).join("")}
          </div>
          <div class="mt-space-md grid grid-cols-2 sm:grid-cols-4 gap-space-sm items-end">
            <label class="font-label-sm text-label-sm text-secondary">من <input id="wk-start" type="time" value="${escapeHtml(sharedStart)}" class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
            <label class="font-label-sm text-label-sm text-secondary">إلى <input id="wk-end" type="time" value="${escapeHtml(sharedEnd)}" class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
            <label class="font-label-sm text-label-sm text-secondary">مدة الموعد
              <select id="wk-slot" class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary">
                ${[15, 20, 30, 45, 60].map((m) => `<option value="${m}"${String(m) === slotMinutes ? " selected" : ""}>${m} دقيقة</option>`).join("")}
              </select>
            </label>
            <p id="av-preview" class="font-label-sm text-label-sm text-secondary self-center"></p>
          </div>
          <div class="mt-space-md grid grid-cols-2 sm:grid-cols-4 gap-space-sm items-end">
            <label class="font-label-sm text-label-sm text-secondary">استراحة 1 من <input id="brk1-start" type="time" value="${escapeHtml(b1s)}" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
            <label class="font-label-sm text-label-sm text-secondary">استراحة 1 إلى <input id="brk1-end" type="time" value="${escapeHtml(b1e)}" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
            <label class="font-label-sm text-label-sm text-secondary">استراحة 2 من <input id="brk2-start" type="time" value="${escapeHtml(b2s)}" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
            <label class="font-label-sm text-label-sm text-secondary">استراحة 2 إلى <input id="brk2-end" type="time" value="${escapeHtml(b2e)}" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
          </div>
          <p class="mt-space-xs font-label-sm text-label-sm text-outline">اترك حقول أي استراحة فارغة لإلغائها.</p>
          <div class="mt-space-md flex flex-wrap items-center gap-space-sm">
            <button id="save-availability" class="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-teal-hover transition-colors"><span class="material-symbols-outlined text-[18px]">save</span>حفظ الأوقات</button>
            <button id="generate-schedule" class="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:brightness-110 transition-colors"><span class="material-symbols-outlined text-[18px]">auto_awesome</span>توليد المواعيد (90 يوماً)</button>
          </div>
          <label class="mt-space-xs flex items-center gap-space-xs font-label-sm text-label-sm text-secondary"><input id="gen-replace" type="checkbox" /> استبدال المواعيد الفارغة القادمة</label>
          <details class="mt-space-md rounded-lg bg-surface-container-low p-space-md">
            <summary class="cursor-pointer font-label-md text-label-md font-bold text-on-surface">تخصيص ساعات مختلفة لبعض الأيام</summary>
            <p class="mt-space-xs font-label-sm text-label-sm text-outline">اترك الحقل فارغاً لاستخدام الوقت المشترك بالأعلى.</p>
            <div class="mt-space-sm space-y-2">
              ${DAYS.map((d, i) => { const r = byDay.get(i); return `
                <div class="grid grid-cols-3 gap-space-sm items-center">
                  <span class="font-label-sm text-label-sm font-bold text-on-surface">${d}</span>
                  <input type="time" data-av-start="${i}" value="${r ? escapeHtml(r.start_time.slice(0, 5)) : ""}" class="px-space-sm py-1.5 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" />
                  <input type="time" data-av-end="${i}" value="${r ? escapeHtml(r.end_time.slice(0, 5)) : ""}" class="px-space-sm py-1.5 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" />
                </div>`; }).join("")}
            </div>
          </details>
        </section>

        <div class="flex flex-col gap-space-lg">
          <section class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
            <h4 class="flex items-center gap-space-xs font-label-lg text-label-lg font-bold text-on-surface">إجازات وأيام مغلقة</h4>
            <p class="mt-space-xs font-label-sm text-label-sm text-outline mb-space-md">إغلاق نطاق يحذف المواعيد الفارغة غير المحجوزة فيه ويمنع توليدها لاحقاً.</p>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-space-sm items-end font-label-sm text-label-sm text-secondary">
              <label>من <input id="block-start" type="date" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <label>إلى <input id="block-end" type="date" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <label>السبب <input id="block-reason" placeholder="إجازة" class="mt-1 w-full px-space-sm py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <button id="add-blocked" class="py-2.5 rounded-lg bg-error text-on-error font-label-md text-label-md font-bold hover:brightness-110 transition-colors">إغلاق التواريخ</button>
            </div>
            <div class="mt-space-md grid gap-space-sm">${blocked.length ? blocked.map((b) => `
              <div class="flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md font-body-sm text-body-sm text-on-surface">
                <span>${escapeHtml(formatArabicDate(b.start_date))}${b.start_date !== b.end_date ? " – " + escapeHtml(formatArabicDate(b.end_date)) : ""} · ${escapeHtml(b.reason || "إجازة")}</span>
                <button data-unblock="${escapeHtml(b.id)}" class="px-space-md py-1.5 rounded-lg border border-line font-label-sm text-label-sm text-on-surface hover:bg-surface-container-lowest transition-colors">إلغاء الإغلاق</button>
              </div>`).join("") : `<p class="font-label-sm text-label-sm text-outline">لا توجد إجازات مسجّلة</p>`}</div>
          </section>

          <details class="rounded-xl border border-line bg-surface-container-lowest p-space-lg">
            <summary class="cursor-pointer font-label-lg text-label-lg font-bold text-on-surface">إضافة موعد ليوم واحد</summary>
            <form id="add-schedule" class="mt-space-md grid grid-cols-1 sm:grid-cols-4 gap-space-sm items-end font-label-sm text-label-sm text-secondary">
              <label>التاريخ <input id="sch-date" type="date" min="${escapeHtml(localDateISO())}" required class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <label>من <input id="sch-start" type="time" required class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <label>إلى <input id="sch-end" type="time" required class="mt-1 w-full px-space-md py-2 rounded-xl border border-line bg-surface text-body-sm text-on-surface outline-none focus:border-primary" /></label>
              <button type="submit" class="py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-teal-hover transition-colors">إضافة</button>
            </form>
          </details>
        </div>
      </div>

      <h4 class="mt-space-xl mb-space-md flex items-center gap-space-xs font-label-lg text-label-lg font-bold text-on-surface">
        <span class="material-symbols-outlined text-[20px] text-primary">event_available</span>المواعيد المتاحة
        <span class="font-body-md text-body-md text-secondary tabular-nums">(${schedules.length})</span>
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-sm">${schedules.length ? schedules.map((s: { id: string; available_date: string; start_time: string; end_time: string; is_booked: boolean }) => `
        <div class="flex items-center justify-between gap-space-sm rounded-lg p-space-md font-body-sm text-body-sm ${s.is_booked ? "bg-warning-soft/60 text-on-surface" : "bg-surface-container-lowest text-on-surface"}">
          <span>${escapeHtml(formatArabicDate(s.available_date))} · <span class="tabular-nums">${escapeHtml(formatTime(s.start_time))}–${escapeHtml(formatTime(s.end_time))}</span> ${s.is_booked ? `<span class="ms-space-xs px-space-sm py-0.5 rounded-lg bg-warning-soft text-warning font-label-sm text-label-sm font-bold">محجوز</span>` : ""}</span>
          ${s.is_booked ? "" : `<button data-del-sch="${escapeHtml(s.id)}" class="px-space-md py-1.5 rounded-lg bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error-container transition-colors">حذف</button>`}
        </div>`).join("") : `<p class="font-body-md text-body-md text-outline">لا مواعيد</p>`}</div>`;

    const startOf = (i: number) => (root.querySelector(`[data-av-start="${i}"]`) as HTMLInputElement).value;
    const endOf = (i: number) => (root.querySelector(`[data-av-end="${i}"]`) as HTMLInputElement).value;
    const val = (sel: string) => (root.querySelector(sel) as HTMLInputElement).value;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
    const shared = () => [val("#wk-start"), val("#wk-end")] as const;
    const breaks = (): [number, number][] => {
      const out: [number, number][] = [];
      const pairs: [string, string][] = [["#brk1-start", "#brk1-end"], ["#brk2-start", "#brk2-end"]];
      pairs.forEach(([a, b]) => { const s = val(a), e = val(b); if (s && e && toMin(e) > toMin(s)) out.push([toMin(s), toMin(e)]); });
      return out;
    };
    const cellsInDay = (i: number): number => {
      const [ss, se] = [startOf(i) || shared()[0], endOf(i) || shared()[1]];
      if (!ss || !se) return 0;
      const slot = Number(val("#wk-slot")) || 30; const bs = breaks();
      let n = 0;
      for (let t = toMin(ss); t + slot <= toMin(se); t += slot) {
        const e = t + slot;
        if (!bs.some(([a, b]) => e > a && t < b)) n++;
      }
      return n;
    };
    const preview = () => {
      const perWeek = [...selected].reduce((sum, i) => sum + cellsInDay(i), 0);
      (root.querySelector("#av-preview") as HTMLElement).textContent = selected.size
        ? `${selected.size} أيام أسبوعياً · ${perWeek} موعداً/أسبوع · ~${Math.round(perWeek * 90 / 7)} لـ90 يوماً`
        : "لم يتم اختيار أي يوم — حدّد الأيام التي يعمل فيها الطبيب";
    };
    const paintChips = () => {
      root.querySelectorAll<HTMLButtonElement>("#day-chips [data-day]").forEach((b) => {
        const on = selected.has(Number(b.dataset.day));
        b.className = `px-space-md py-1.5 rounded-lg border font-label-sm text-label-sm font-bold transition-colors ${on ? "bg-primary text-on-primary border-primary" : "border-line text-on-surface-variant hover:bg-surface-container"}`;
        const i = Number(b.dataset.day);
        const st = root.querySelector(`[data-av-start="${i}"]`) as HTMLInputElement | null;
        const en = root.querySelector(`[data-av-end="${i}"]`) as HTMLInputElement | null;
        if (st) st.disabled = !on; if (en) en.disabled = !on;
      });
      preview();
    };
    root.querySelectorAll<HTMLButtonElement>("#day-chips [data-day]").forEach((b) => b.addEventListener("click", () => {
      const i = Number(b.dataset.day);
      if (selected.has(i)) selected.delete(i); else selected.add(i);
      paintChips();
    }));
    ["#wk-start", "#wk-end", "#brk1-start", "#brk1-end", "#brk2-start", "#brk2-end"].forEach((s) => (root.querySelector(s) as HTMLInputElement).addEventListener("input", preview));
    (root.querySelector("#wk-slot") as HTMLSelectElement).addEventListener("change", preview);
    paintChips();

    (root.querySelector("#save-availability") as HTMLButtonElement).addEventListener("click", async () => {
      const [ss, se] = shared();
      if (selected.size && (!ss || !se)) { showToast("حدّد وقت البداية والنهاية", "warning"); return; }
      const mins = Number(val("#wk-slot")) || 30;
      const rules: Record<string, unknown>[] = [];
      selected.forEach((i) => {
        const st = startOf(i) || ss; const en = endOf(i) || se;
        if (st && en) rules.push({ doctor_id: doctorId, day_of_week: i, start_time: st, end_time: en, is_enabled: true, slot_minutes: mins,
          break_start_1: val("#brk1-start") || null, break_end_1: val("#brk1-end") || null,
          break_start_2: val("#brk2-start") || null, break_end_2: val("#brk2-end") || null });
      });
      try { await saveDoctorAvailability(doctorId, rules); showToast(rules.length ? `تم حفظ ${rules.length} أيام · ${mins} دقيقة للموعد` : "تم مسح الأوقات", "success"); paintChips(); }
      catch (err) { showToast(translateAuthError(err), "error"); }
    });

    (root.querySelector("#generate-schedule") as HTMLButtonElement).addEventListener("click", async () => {
      const replace = (root.querySelector("#gen-replace") as HTMLInputElement).checked;
      if (replace) {
        const ok = await confirmSheet({ title: "إعادة توليد المواعيد؟", body: "سيُحذف كل موعد فارغ غير محجوز في الـ90 يوماً القادمة ثم يُعاد التوليد.", confirmLabel: "توليد", tone: "primary" });
        if (!ok) return;
      }
      try {
        (root.querySelector("#generate-schedule") as HTMLButtonElement).disabled = true;
        const { created } = await generateDoctorSchedule(doctorId, 90, replace);
        showToast(created ? `أُضيف ${created} موعداً` : "لا مواعيد جديدة — تأكد من حفظ الأوقات أولاً", "success");
        await renderSchedules(root, doctorId); await refreshDoctors();
      } catch (err) { showToast(translateAuthError(err), "error"); (root.querySelector("#generate-schedule") as HTMLButtonElement).disabled = false; }
    });

    (root.querySelector("#add-blocked") as HTMLButtonElement).addEventListener("click", async () => {
      const start = (root.querySelector("#block-start") as HTMLInputElement).value;
      const end = (root.querySelector("#block-end") as HTMLInputElement).value || start;
      const reason = (root.querySelector("#block-reason") as HTMLInputElement).value || "إجازة";
      if (!start) { showToast("حدّد تاريخ البداية", "warning"); return; }
      try {
        const { deleted } = await blockDoctorDates(doctorId, start, end, reason);
        showToast(deleted ? `أُغلق النطاق وحُذف ${deleted} موعداً فارغاً` : "أُغلق النطاق", "success");
        await renderSchedules(root, doctorId); await refreshDoctors();
      } catch (err) { showToast(translateAuthError(err), "error"); }
    });
    root.querySelectorAll<HTMLButtonElement>("[data-unblock]").forEach((b) => b.addEventListener("click", async () => {
      const ok = await confirmSheet({ title: "إلغاء إغلاق النطاق؟", body: "لن تعود المواعيد المحذوفة تلقائياً — استخدم زر التوليد.", confirmLabel: "إلغاء الإغلاق", tone: "primary" });
      if (!ok) return;
      try { await unblockDoctorDates(b.dataset.unblock!); showToast("تم إلغاء الإغلاق", "success"); await renderSchedules(root, doctorId); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    }));

    (root.querySelector("#add-schedule") as HTMLFormElement).addEventListener("submit", async (e) => {
      e.preventDefault();
      const availableDate = (root.querySelector("#sch-date") as HTMLInputElement).value;
      const startTime = (root.querySelector("#sch-start") as HTMLInputElement).value;
      const endTime = (root.querySelector("#sch-end") as HTMLInputElement).value;
      try { await createDoctorSchedule({ doctorId, availableDate, startTime, endTime }); showToast("تمت الإضافة", "success"); await renderSchedules(root, doctorId); await refreshDoctors(); } catch (err) { showToast(translateAuthError(err), "error"); }
    });
    root.querySelectorAll<HTMLButtonElement>("[data-del-sch]").forEach((b) => b.addEventListener("click", async () => {
      const ok = await confirmSheet({ title: "حذف هذا الموعد؟", confirmLabel: "حذف", tone: "danger" });
      if (!ok) return;
      try { await deleteDoctorSchedule(b.dataset.delSch!); showToast("تم الحذف", "success"); await renderSchedules(root, doctorId); await refreshDoctors(); } catch (e) { showToast(translateAuthError(e), "error"); }
    }));
  } catch (e) { root.innerHTML = `<p class="text-sm text-red-600">تعذر التحميل: ${escapeHtml(translateAuthError(e))}</p>`; }
}

/* ---------------------------------- helpers --------------------------------- */

function go(hash: string) {
  if (location.hash === hash) { state.route = parseRoute(); render(); }
  else location.hash = hash;
}

async function refreshDoctors() { try { state.doctors = await getDoctorsWithSchedules(); } catch { /* ignore */ } }
async function refreshAppointments() { try { state.patientAppointments = await getPatientAppointments(); } catch { /* ignore */ } }
async function refreshAdminRows() {
  try {
    const res = await getAdminAppointments({ statuses: state.adminFilters.status === "all" ? undefined : state.adminFilters.status === "cancelled" ? ["cancelled_by_patient", "cancelled_by_clinic"] : [state.adminFilters.status], doctorId: state.adminFilters.doctorId || undefined, dateFrom: state.adminFilters.dateFrom || undefined, dateTo: state.adminFilters.dateTo || undefined, search: state.adminFilters.search || undefined, page: state.adminPage, pageSize: state.adminPageSize, sortBy: state.adminFilters.sortBy, sortDir: state.adminFilters.sortDir });
    state.adminRows = res.rows as typeof state.adminRows; state.adminTotal = res.total;
  } catch { /* ignore */ }
}
async function refreshAll() { await Promise.all([refreshDoctors(), refreshAppointments()]); }

async function runHousekeeping() {
  const role = (state.currentUser as { profile?: { role?: string } } | null)?.profile?.role;
  if (role !== "admin") return;
  try { await purgeExpiredSlots(); } catch { /* ignore */ }
}

async function init() {
  registerStitchGlobals();
  // Cap the auth lookup so a stalled request can never hold the first paint.
  state.currentUser = await Promise.race([
    getCurrentUser().catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
  ]);
  state.route = parseRoute();
  appEl.addEventListener("click", handleClick);
  window.addEventListener("hashchange", () => {
    const next = parseRoute();
    if (next.name !== state.route.name || next.param !== state.route.param) {
      state.route = next;
      render();
    }
  });
  try {
    onAuthChange(async (_e, session) => {
      if ((session as { user?: unknown })?.user) state.currentUser = await getCurrentUser();
      else state.currentUser = null;
      await refreshAll();
      void runHousekeeping();
      render();
    });
  } catch { /* ignore */ }
  // Paint the shell and layout immediately; the catalog query can take
  // several seconds and must never leave the viewport blank.
  render();
  void refreshAll();
  void runHousekeeping();
  try { subscribeToRealtimeUpdates(() => void refreshDoctors().then(render), () => void refreshAll().then(render)); } catch { /* ignore */ }
}
void init();
