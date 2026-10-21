import "./styles/tailwind.css";
import { getCurrentUser, onAuthChange, logoutUser, loginUser, registerPatient, getDoctorsWithSchedules, bookAppointmentRPC, getPatientAppointments, cancelAppointmentRPC, rescheduleAppointmentRPC, getAdminAppointments, getAdminStats, updateAppointmentState, cancelAppointmentClinic, adminRescheduleAppointmentRPC, adminDeleteAppointmentRPC, listDoctors, adminListProfiles, assignUserRole, saveDoctor, deleteDoctor, listHospitals, findDoctorByUser, listDoctorSchedules, createDoctorSchedules, deleteDoctorSchedule, subscribeToRealtimeUpdates, getAvailableSlots, getDoctorAvailability, saveDoctorAvailability, blockDoctorDates, generateDoctorSchedule, listBlockedDates, unblockDoctorDates, purgeExpiredSlots, updatePatientProfile } from "./lib/supabase";
import { localDateISO, escapeHtml, translateAuthError, formatTime, formatArabicDate } from "./lib/format";
import { SPECIALTIES } from "./lib/specialties";
import { detectNearestCity, locationLabel, rememberCity } from "./lib/geodata";
import { showToast } from "./components/Toast";
import { mountAuthModal } from "./components/AuthModal";
import { confirmSheet } from "./components/ConfirmDialog";
import { emptyState } from "./components/ui";
import type { Doctor, Slot } from "./components/DoctorCard";
import { renderConfirmView } from "./views/confirm";
import { fixtureAccounts, fixtureAvailability, fixtureBlocked, fixtureDoctors, fixtureSchedules, mgFixture, mgOpenDoctor } from "./views/adminFixture";
import { renderAdminView } from "./views/admin";
import { renderSiteHeader, renderSiteFooter } from "./components/SiteHeader";
import { HOME_MAIN } from "./views/stitch/home";
import { DOCTORS_MAIN } from "./views/stitch/doctors";
import { HOSPITALS_MAIN } from "./views/stitch/hospitals";
import { DOCTORPROFILE_MAIN } from "./views/stitch/doctorProfile";
import { BOOKINGS_MAIN } from "./views/stitch/bookings";
import { PROFILE_MAIN } from "./views/stitch/profile";
import { registerStitchGlobals } from "./views/stitch/interactions";
import { wireHome } from "./views/stitch/homeLive";
import { wireDoctorsLive } from "./views/stitch/doctorsLive";
import { wireHospitalsLive } from "./views/stitch/hospitalsLive";
import { wireDoctorProfile } from "./views/stitch/doctorProfileLive";
import { wireBookings } from "./views/stitch/bookingsLive";
import { wireProfile } from "./views/stitch/profileLive";

// dev-only: force a theme for screenshots (?theme=light|dark)
if (import.meta.env.DEV) {
  const t = new URLSearchParams(location.search).get("theme");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
}

type RouteName = "home" | "doctors" | "doctor" | "confirm" | "hospitals" | "appointments" | "profile" | "admin";
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
    case "hospitals": return { name: "hospitals" };
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
  hospitals: HOSPITALS_MAIN,
  doctor: DOCTORPROFILE_MAIN,
  appointments: BOOKINGS_MAIN,
  profile: PROFILE_MAIN,
};

/* data-path values found in the Stitch desktop designs -> app routes */
const PATH_ROUTES: Record<string, string> = {
  home: "#home",
  "doctors-and-specialties": "#doctors",
  "hospitals-and-centers": "#hospitals",
  "my-bookings": "#appointments",
  "book-now": "#doctors",
  profile: "#profile",
  "dashboard-overview": "#admin",
  "appointments-schedule": "#admin/manage",
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
  // Staff stay inside the dashboard: the patient catalog, the public doctor
  // dossier, the booking flow and the patient account pages are not for them.
  // The doctor's index is the dashboard, not the consumer landing page.
  if (canAdmin && ["home", "doctors", "doctor", "hospitals", "appointments", "confirm", "profile"].includes(route.name)) {
    location.replace("#admin");
    return;
  }

  if (route.name === "admin") {
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
  if (route.name === "hospitals") void wireHospitalsLive(appEl);
  if (route.name === "doctor" && route.param) void wireDoctorProfile(appEl, route.param, state.currentUser);
  if (route.name === "appointments") void wireBookings(appEl, state.currentUser);
  if (route.name === "profile") void wireProfile(appEl, state.currentUser, {
    onOpenAuth: () => authModal?.open(),
    onLogout: () => logoutToSite(),
    onSave: async ({ fullName, phone }) => {
      try { await updatePatientProfile({ fullName, phone }); state.currentUser = await getCurrentUser(); render(); }
      catch (e) { showToast(translateAuthError(e), "error"); throw e; }
    },
  });
  if (route.name === "admin") {
    void (async () => {
      const [{ DASHBOARD_BODY: body }, { wireDoctorDashboard: wireDb }, { mountAuthModal: mountModal }] = await Promise.all([
        import("./views/stitch/dashboard"),
        import("./views/stitch/dashboardLive"),
        import("./components/AuthModal"),
      ]);
      if (state.route.name !== "admin") return;
      appEl.innerHTML = `${body}<div id="auth-mount"></div>`;
      wireShell();
      authModal = mountModal(appEl.querySelector<HTMLElement>("#auth-mount")!,
        async ({ email, password }) => { const r = await loginUser({ email, password }); state.currentUser = await getCurrentUser(); await refreshAll(); render(); return r as unknown as void; },
        async ({ email, password, fullName, phone }) => { const r = await registerPatient({ email, password, fullName, phone }); state.currentUser = await getCurrentUser(); await refreshAll(); render(); return r as unknown as void; }
      );
      if (!state.currentUser && !new URLSearchParams(location.search).has("fixture")) authModal?.open();
      // Everything the staff account needs happens inside this one page.
      void wireDb(appEl, state.currentUser, {
        renderAppointments: (host) => renderAdminTab(host),
        renderSchedule: (host, doctorId) => renderSchedulePanel(host, doctorId),
        onLogout: () => logoutToSite(),
        initialView: state.route.param === "manage" ? "appointments" : undefined,
      });
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
  }
}

/* --------------------------------- shell ---------------------------------- */

// Document-level drawer listeners only live while the drawer is open; this holds
// the teardown so a re-render can never stack them.
let teardownMobileMenu: (() => void) | null = null;

function wireShell() {
  teardownMobileMenu?.();
  teardownMobileMenu = null;

  appEl.querySelectorAll<HTMLElement>('[data-action="open-auth"]').forEach((b) => b.addEventListener("click", () => authModal?.open()));

  const headRow = appEl.querySelector<HTMLElement>("#db-actions") || appEl.querySelector<HTMLElement>("#header-actions") || appEl.querySelector<HTMLElement>("header > div");
  if (headRow && !document.getElementById("theme-toggle")) {
    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    btn.title = "الوضع الداكن";
    btn.className = "press grid h-10 w-10 shrink-0 place-items-center rounded-lg text-on-surface transition-colors hover:bg-surface-container";
    btn.innerHTML = '<span aria-hidden="true" class="material-symbols-outlined text-[18px]">dark_mode</span>';
    btn.setAttribute("aria-label", "تبديل المظهر الداكن أو الفاتح");
    // Keep the burger as the outermost action (left edge in RTL).
    headRow.insertBefore(btn, headRow.querySelector("#mobile-menu-btn"));
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

  const closeMenu = () => {
    if (!menu) return;
    menu.classList.add("hidden");
    menu.classList.remove("drawer-in");
    if (menuIcon) menuIcon.textContent = "menu";
    menuBtn?.setAttribute("aria-expanded", "false");
    teardownMobileMenu?.();
    teardownMobileMenu = null;
  };

  const openMenu = () => {
    if (!menu) return;
    menu.classList.remove("hidden");
    // Restart the entrance if the drawer is re-opened quickly.
    menu.classList.remove("drawer-in");
    void menu.offsetWidth;
    menu.classList.add("drawer-in");
    if (menuIcon) menuIcon.textContent = "close";
    menuBtn?.setAttribute("aria-expanded", "true");

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeMenu();
      menuBtn?.focus();
    };
    // A tap anywhere outside the drawer dismisses it, like any light-dismiss surface.
    const onOutside = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("#mobile-menu, #mobile-menu-btn")) return;
      closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    teardownMobileMenu = () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  };

  menuBtn?.addEventListener("click", () => {
    if (!menu) return;
    if (menu.classList.contains("hidden")) openMenu();
    else closeMenu();
  });

  menu?.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest("[data-path]")) return;
    closeMenu();
  });

  /* Location chip: explicit opt-in, real browser coordinates, nearest known
     city. No city is ever invented when permission is denied. */
  const locateBtns = appEl.querySelectorAll<HTMLButtonElement>("[data-locate-btn]");
  if (locateBtns.length) {
    const status = appEl.querySelector<HTMLElement>("#locate-status");
    const paintLocations = (label: string, announce = false) => {
      appEl.querySelectorAll<HTMLElement>("[data-locate-label]").forEach((el) => { el.textContent = label; });
      if (announce && status) status.textContent = label;
    };
    locateBtns.forEach((btn) => btn.addEventListener("click", async () => {
      if (btn.dataset.busy === "true") return;
      locateBtns.forEach((b) => { b.dataset.busy = "true"; b.setAttribute("aria-busy", "true"); });
      paintLocations("جارٍ تحديد موقعك…", true);
      try {
        const { city } = await detectNearestCity();
        rememberCity(city);
        paintLocations(locationLabel(city), true);
        showToast(`أقرب مدينة لموقعك: ${city}`, "success");
        window.dispatchEvent(new CustomEvent<string>("miaadi:city-detected", { detail: city }));
        // The home search deck follows the detected city without a full re-render.
        const heroCity = document.querySelector<HTMLSelectElement>("#hero-city");
        if (heroCity && [...heroCity.options].some((o) => o.value === city)) heroCity.value = city;
      } catch {
        paintLocations(locationLabel(), true);
        showToast("تعذّر تحديد موقعك. اسمح بالوصول إلى الموقع من إعدادات المتصفح.", "error");
      } finally {
        locateBtns.forEach((b) => { delete b.dataset.busy; b.removeAttribute("aria-busy"); });
      }
    }));
  }
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

/* ----------------------------------- admin ---------------------------------- */

/* Staff account actions used by the dashboard panels — a doctor never has to
   leave #admin to log out or to manage their own calendar. */
async function logoutToSite() {
  try {
    await logoutUser();
    state.currentUser = null;
    state.patientAppointments = [];
    showToast("تم تسجيل الخروج", "success");
    go("#home");
  } catch (e) { showToast(translateAuthError(e), "error"); }
}

/* «جدولي وساعات العمل» panel: a doctor edits their own calendar, a supervisor
   picks the doctor first. Reuses the real schedules editor. */
async function renderSchedulePanel(host: HTMLElement, doctorId: string | null) {
  if (!state.adminDoctorsCache.length) {
    try { state.adminDoctorsCache = await listDoctors(); } catch { /* ignore */ }
  }
  if (doctorId) { await renderSchedules(host, doctorId); return; }
  const docs = state.adminDoctorsCache;
  host.innerHTML = `
    <div class="flex flex-col gap-space-md">
      <div>
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">جدولي وساعات العمل</h2>
        <p class="mt-1 font-body-md text-body-md text-on-surface-variant">اختر الطبيب لعرض جدول عمله أو تعديله.</p>
      </div>
      ${docs.length
        ? `<div class="grid grid-cols-1 gap-space-sm sm:grid-cols-2 xl:grid-cols-3">${docs.map((d) => `<button type="button" data-sched-doctor="${escapeHtml(d.id)}" class="flex items-center justify-between rounded-xl border border-line bg-surface-container-lowest px-space-md py-3 text-start transition-colors hover:bg-surface-container"><span class="font-label-md text-label-md font-semibold text-on-surface">${escapeHtml(d.name)}</span><span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">chevron_left</span></button>`).join("")}</div>`
        : `<p class="rounded-xl border border-line bg-surface-container-lowest p-space-lg text-center font-body-md text-body-md text-on-surface-variant">لا يوجد أطباء مسجّلون بعد.</p>`}
    </div>`;
  host.querySelectorAll<HTMLElement>("[data-sched-doctor]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.schedDoctor as string;
    host.innerHTML = `<p class="font-body-md text-body-md text-secondary py-space-lg text-center">جاري تحميل الجدول…</p>`;
    void renderSchedules(host, id);
  }));
}

async function renderAdminTab(main: HTMLElement) {
  const fxTab = mgFixture();
  if (fxTab) {
    state.adminSubTab = state.adminSubTab === "appointments" ? fxTab : state.adminSubTab;
    await renderAdminManagement(main, state.adminSubTab);
    return;
  }
  const role = state.currentUser?.profile?.role as string;
  const isDoctor = role === "doctor";
  // Doctor sessions never filter by another doctor — and the control is hidden.
  if (isDoctor) state.adminFilters.doctorId = "";
  // Doctor accounts have no business in the admin screens: keep them on bookings.
  if (isDoctor && state.adminSubTab !== "appointments") state.adminSubTab = "appointments";
  if (state.adminSubTab !== "appointments") { await renderAdminManagement(main, state.adminSubTab); return; }
  try {
    if (isDoctor) {
      const my = await findDoctorByUser(state.currentUser!.id);
      state.adminManagementDoctor = my?.id || null;
    }
    if (!isDoctor && !state.adminDoctors.length) state.adminDoctors = await listDoctors();
    if (!isDoctor) state.adminDoctorsCache = state.adminDoctors;
  } catch { /* ignore */ }
  let stats = { total: 0, booked: 0, completed: 0, cancelled: 0, noShow: 0, today: 0 };
  try { stats = await getAdminStats(); } catch { /* ignore */ }
  try {
    const res = await getAdminAppointments({ statuses: state.adminFilters.status === "all" ? undefined : state.adminFilters.status === "cancelled" ? ["cancelled_by_patient", "cancelled_by_clinic"] : [state.adminFilters.status], doctorId: state.adminFilters.doctorId || undefined, dateFrom: state.adminFilters.dateFrom || undefined, dateTo: state.adminFilters.dateTo || undefined, search: state.adminFilters.search || undefined, page: state.adminPage, pageSize: state.adminPageSize, sortBy: state.adminFilters.sortBy, sortDir: state.adminFilters.sortDir });
    state.adminRows = (res.rows as typeof state.adminRows) || []; state.adminTotal = res.total || 0;
  } catch (e) { showToast(translateAuthError(e), "error"); }

  renderAdminView(main, {
    rows: state.adminRows, total: state.adminTotal, page: state.adminPage, pageSize: state.adminPageSize, stats,
    filters: state.adminFilters, doctors: isDoctor ? [] : state.adminDoctors.map((d) => ({ id: d.id, name: d.name })),
    roleLabel: isDoctor ? "حساب طبيب" : "حساب مشرف",
    ...(isDoctor ? { title: "مواعيد عيادتي", subtitle: "متابعة حجوزاتك وأحوالها — كل ما يخص عيادتك في مكان واحد." } : {}),
    showSubTabs: !isDoctor,
    singleDoctor: isDoctor,
    onFilter: (patch) => { Object.assign(state.adminFilters, patch); state.adminPage = 0; void renderAdminTab(main); },
    onPage: (dir) => { state.adminPage = Math.max(0, state.adminPage + dir); void renderAdminTab(main); },
    onState: async (id, s) => { try { await updateAppointmentState(id, s); showToast("تم التحديث", "success"); await refreshAdminRows(); void renderAdminTab(main); } catch (e) { showToast(translateAuthError(e), "error"); } },
    onClinicCancel: async (id) => { try { await cancelAppointmentClinic(id); showToast("تم الإلغاء وإتاحة الموعد", "success"); await refreshAdminRows(); await refreshDoctors(); } catch (e) { showToast(translateAuthError(e), "error"); } },
    onEdit: (row) => { void openApptEditDialog(row, main); },
    onDelete: async (row) => {
      try { await adminDeleteAppointmentRPC(row.appointment_id); showToast("تم حذف الحجز بنجاح", "success"); await refreshAdminRows(); void renderAdminTab(main); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    },
    onManageTab: (tab) => { if (isDoctor && tab !== "appointments") return; state.adminSubTab = tab; if (tab === "appointments") void renderAdminTab(main); else void renderAdminManagement(main, tab); },
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
  // Doctors manage their own calendar from the schedule panel — this screen is admin-only.
  if (state.currentUser?.profile?.role === "doctor") return;
  if (tab === "accounts") {
    try { state.adminAccounts = mgFixture() ? (fixtureAccounts as unknown as typeof state.adminAccounts) : await adminListProfiles(); } catch (e) { showToast(translateAuthError(e), "error"); }
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

  const fixture = mgFixture();
  const docs = fixture
    ? (fixtureDoctors as unknown as typeof state.adminDoctors)
    : state.adminDoctorsCache.length ? state.adminDoctorsCache : await listDoctors();
  if (!fixture) state.adminDoctorsCache = docs;
  let hospitalOptions: { id: string; name: string; city: string | null }[] = [];
  if (!fixture) { try { hospitalOptions = await listHospitals(); } catch { /* the editor still works without the list */ } }
  const specOptions = SPECIALTIES.map((s) => `<option value="${escapeHtml(s.label)}">${escapeHtml(s.label)}</option>`).join("");
  if (fixture && mgOpenDoctor()) state.adminManagementDoctor = fixtureDoctors[0].id;
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
              <h3 class="font-label-lg text-label-lg font-bold text-on-surface truncate"><a href="#doctor/${escapeHtml(d.id)}" class="transition-colors hover:text-primary" title="صفحة الطبيب العامة">${escapeHtml(d.name)}</a></h3>
              <p class="font-body-sm text-body-sm text-secondary truncate">${escapeHtml(d.specialization)} · <span class="tabular-nums">${escapeHtml(String(d.consultation_fee))}</span> ج.س</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-auto">
            <button data-manage="${escapeHtml(d.id)}" class="flex-1 flex items-center justify-center gap-1 px-space-sm py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm font-bold hover:bg-primary/20 transition-colors">
              <span class="material-symbols-outlined text-[16px]">calendar_month</span>المواعيد
            </button>
            <button data-edit="${escapeHtml(d.id)}" class="px-space-md py-2 rounded-lg border border-line font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors">تعديل</button>
            <button data-del="${escapeHtml(d.id)}" class="px-space-md py-2 rounded-lg text-error font-label-sm text-label-sm font-bold hover:bg-error-container/40 transition-colors">حذف</button>
          </div>
        </div>`).join("")}</div>
      <div id="schedules-root" class="${state.adminManagementDoctor ? "" : "hidden"} mt-space-xl"></div>
    </div>
    <dialog id="doctor-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-center min-h-dvh w-full max-w-none">
      <div class="bg-surface-container-lowest rounded-xl shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] w-full max-w-[560px] p-space-xl mx-4 max-h-[88vh] overflow-y-auto">
        <div class="flex items-center gap-space-sm mb-space-lg">
          <span class="w-11 h-11 rounded-lg grid place-items-center bg-primary/10 text-primary"><span class="material-symbols-outlined text-[22px]">stethoscope</span></span>
          <div class="min-w-0">
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface" id="doctor-dialog-title">طبيب</h3>
            <p class="mt-0.5 text-[12px] text-on-surface-variant">البيانات المهنية يُعدّلها مشرف المنصة فقط.</p>
          </div>
        </div>
        <form id="doctor-form" class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label class="block text-[12px] text-on-surface-variant">الاسم (عربي)
            <input id="doc-name" required placeholder="د. الاسم الكامل" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">الاسم بالإنجليزية
            <input id="doc-name-en" dir="ltr" placeholder="Dr. Full Name" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-start text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">المسمى الوظيفي
            <input id="doc-title" placeholder="استشاري" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">التخصص
            <select id="doc-spec" required class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2 text-start text-[13px] text-on-surface"><option value="" selected disabled>اختر التخصص</option>${specOptions}</select>
          </label>
          <label class="block text-[12px] text-on-surface-variant">المدينة
            <input id="doc-city" placeholder="الخرطوم" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">الجنس
            <select id="doc-gender" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2 text-start text-[13px] text-on-surface">
              <option value="">غير محدد</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </label>
          <label class="block text-[12px] text-on-surface-variant">سنوات الخبرة
            <input id="doc-exp" type="number" min="0" inputmode="numeric" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] tabular-nums text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">رسوم الكشف (ج.س)
            <input id="doc-fee" required type="number" min="0" inputmode="numeric" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] tabular-nums text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">اللغات
            <input id="doc-langs" placeholder="العربية، الإنجليزية" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">المستشفى
            <select id="doc-hospital" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2 text-start text-[13px] text-on-surface">
              <option value="">بدون مستشفى</option>
              ${hospitalOptions.map((h) => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)}${h.city ? ` — ${escapeHtml(h.city)}` : ""}</option>`).join("")}
            </select>
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">نبذة عن الطبيب
            <textarea id="doc-about" rows="2" class="mt-1 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 py-2 text-[13px] leading-6 text-on-surface outline-none focus:border-primary"></textarea>
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">رابط الصورة
            <input id="doc-photo" dir="ltr" placeholder="https://…" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-start text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="flex items-center gap-2 text-[12px] font-medium text-on-surface sm:col-span-2">
            <input id="doc-tele" type="checkbox" class="h-4 w-4 accent-primary" />الاستشارة عن بُعد متاحة
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">حساب المستخدم
            <select id="doc-user" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2 text-start text-[13px] text-on-surface"><option value="">بدون حساب</option>${(state.adminAccounts as { user_id: string; full_name: string; email: string }[]).map((p) => `<option value="${escapeHtml(p.user_id)}">${escapeHtml(p.full_name)} — ${escapeHtml(p.email)}</option>`).join("")}</select>
          </label>
          <div class="col-span-full flex gap-2 pt-1">
            <button type="button" data-close-doc class="flex-1 py-2.5 rounded-lg border border-line font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">إلغاء</button>
            <button type="submit" class="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-teal-hover transition-colors">حفظ</button>
          </div>
        </form>
      </div>
    </dialog>
  `;
  main.querySelector("[data-back]")?.addEventListener("click", () => { state.adminSubTab = "appointments"; render(); });
  const docDlg = main.querySelector("#doctor-dialog") as HTMLDialogElement;
  let editing: string | null = null;
  const field = (sel: string) => main.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  const setField = (sel: string, value: string) => { const el = field(sel); if (el) el.value = value; };
  const ensureSpec = (value: string) => {
    const sel = field("#doc-spec") as HTMLSelectElement | null;
    if (!sel || !value || [...sel.options].some((o) => o.value === value)) return;
    sel.append(new Option(value, value));
  };
  const ensureHospital = (id: string, label: string) => {
    const sel = field("#doc-hospital") as HTMLSelectElement | null;
    if (!sel || !id || [...sel.options].some((o) => o.value === id)) return;
    sel.append(new Option(label, id));
  };
  const openDoc = async (id?: string) => {
    editing = id || null;
    (main.querySelector("#doctor-dialog-title") as HTMLElement).textContent = id ? "تعديل طبيب" : "إضافة طبيب";
    (main.querySelector("#doctor-form") as HTMLFormElement).reset();
    try { if (!state.adminAccounts.length) state.adminAccounts = await adminListProfiles(); } catch { /* ignore */ }
    const userSel = field("#doc-user") as HTMLSelectElement | null;
    if (userSel && state.adminAccounts.length) {
      userSel.innerHTML = `<option value="">بدون حساب</option>` + (state.adminAccounts as { user_id: string; full_name: string; email: string }[])
        .map((p) => `<option value="${escapeHtml(p.user_id)}">${escapeHtml(p.full_name)} — ${escapeHtml(p.email)}</option>`).join("");
    }
    if (id) {
      const d = docs.find((x) => x.id === id)!;
      setField("#doc-name", d.name);
      setField("#doc-name-en", d.name_en || "");
      setField("#doc-title", d.title || "");
      ensureSpec(d.specialization);
      setField("#doc-spec", d.specialization);
      setField("#doc-city", d.city || "");
      setField("#doc-gender", d.gender || "");
      setField("#doc-exp", d.experience_years == null ? "" : String(d.experience_years));
      setField("#doc-fee", String(d.consultation_fee));
      setField("#doc-langs", (d.languages || []).join("، "));
      const hospital = hospitalOptions.find((h) => h.id === d.hospital_id);
      ensureHospital(d.hospital_id || "", hospital ? `${hospital.name}${hospital.city ? ` — ${hospital.city}` : ""}` : "المستشفى الحالي");
      setField("#doc-hospital", d.hospital_id || "");
      setField("#doc-about", d.about || "");
      setField("#doc-photo", d.photo_url || "");
      const tele = field("#doc-tele") as HTMLInputElement | null;
      if (tele) tele.checked = !!d.telehealth;
      setField("#doc-user", d.user_id || "");
    }
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
    const name = (field("#doc-name") as HTMLInputElement).value.trim();
    const nameEn = (field("#doc-name-en") as HTMLInputElement).value.trim();
    const title = (field("#doc-title") as HTMLInputElement).value.trim();
    const specialization = (field("#doc-spec") as HTMLSelectElement).value;
    const city = (field("#doc-city") as HTMLInputElement).value.trim();
    const gender = (field("#doc-gender") as HTMLSelectElement).value;
    const expRaw = (field("#doc-exp") as HTMLInputElement).value.trim();
    const consultationFee = Number((field("#doc-fee") as HTMLInputElement).value);
    const languages = (field("#doc-langs") as HTMLInputElement).value.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
    const hospitalId = (field("#doc-hospital") as HTMLSelectElement).value || null;
    const about = (field("#doc-about") as HTMLTextAreaElement).value.trim();
    const photoUrl = (field("#doc-photo") as HTMLInputElement).value.trim();
    const telehealth = (field("#doc-tele") as HTMLInputElement).checked;
    const userId = (field("#doc-user") as HTMLSelectElement).value || null;
    if (!name || !specialization) { showToast("اكتب الاسم والتخصص", "error"); return; }
    try {
      await saveDoctor({ id: editing || undefined, name, nameEn, title, specialization, consultationFee, userId, city, gender, experienceYears: expRaw === "" ? null : Number(expRaw), telehealth, about, languages, photoUrl, hospitalId });
      showToast("تم الحفظ", "success");
      docDlg.close();
      state.adminDoctorsCache = await listDoctors();
      state.adminDoctors = state.adminDoctorsCache;
      void renderAdminManagement(main, "management");
    } catch (err) { showToast(translateAuthError(err), "error"); }
  });
  if (state.adminManagementDoctor) await renderSchedules(main.querySelector("#schedules-root") as HTMLElement, state.adminManagementDoctor);
}

/* ------------------------------ working hours ------------------------------ */

type ShiftDraft = { start: string; end: string; b1s: string; b1e: string; b2s: string; b2e: string };
type DayDraft = { on: boolean; shifts: ShiftDraft[] };
type Sched = { id: string; available_date: string; start_time: string; end_time: string; is_booked: boolean };

const SCHED_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const WEEK_SHORT = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
/* The calendar keeps its month and selected day across panel re-renders. */
let schedMonth = "";
let schedSelected = "";
const monthOf = (iso: string) => iso.slice(0, 7);
const addMonths = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const hhmm = (t: string | null | undefined) => (t || "").slice(0, 5);
const clock = (total: number) => `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const emptyShift = (start = "09:00", end = "14:00"): ShiftDraft => ({ start, end, b1s: "", b1e: "", b2s: "", b2e: "" });
const shiftBreaks = (s: ShiftDraft): [number, number][] => {
  const out: [number, number][] = [];
  if (s.b1s && s.b1e) out.push([toMinutes(s.b1s), toMinutes(s.b1e)]);
  if (s.b2s && s.b2e) out.push([toMinutes(s.b2s), toMinutes(s.b2e)]);
  return out;
};
const shiftIssue = (s: ShiftDraft): string => {
  if (!s.start || !s.end) return "حدّد بداية ونهاية الفترة";
  if (toMinutes(s.end) <= toMinutes(s.start)) return "النهاية يجب أن تكون بعد البداية";
  for (const [a, b] of [[s.b1s, s.b1e], [s.b2s, s.b2e]] as const) {
    if (!!a !== !!b) return "أكمل طرفي الاستراحة أو امسحهما";
    if (a && b) {
      if (toMinutes(b) <= toMinutes(a)) return "نهاية الاستراحة قبل بدايتها";
      if (toMinutes(a) < toMinutes(s.start) || toMinutes(b) > toMinutes(s.end)) return "الاستراحة خارج الفترة";
    }
  }
  const bs = shiftBreaks(s);
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      if (bs[i][0] < bs[j][1] && bs[j][0] < bs[i][1]) return "الاستراحتان متداخلتان";
    }
  }
  return "";
};
const shiftSlots = (s: ShiftDraft, slot: number): number[] => {
  if (!slot || slot < 5 || shiftIssue(s)) return [];
  const bs = shiftBreaks(s);
  const out: number[] = [];
  for (let t = toMinutes(s.start); t + slot <= toMinutes(s.end); t += slot) {
    if (!bs.some(([a, b]) => t + slot > a && t < b)) out.push(t);
  }
  return out;
};
const daySlots = (d: DayDraft, slot: number): number[] => {
  const all = d.shifts.flatMap((s) => shiftSlots(s, slot));
  return [...new Set(all)].sort((a, b) => a - b);
};
const dayIssue = (d: DayDraft): string => {
  if (!d.on) return "";
  if (!d.shifts.length) return "أضف فترة عمل واحدة على الأقل";
  for (const s of d.shifts) { const issue = shiftIssue(s); if (issue) return issue; }
  const ranges = d.shifts.map((s) => [toMinutes(s.start), toMinutes(s.end)] as [number, number]).sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i][0] < ranges[i - 1][1]) return "فترات اليوم متداخلة";
  }
  return "";
};
async function renderSchedules(root: HTMLElement, doctorId: string) {
  root.classList.remove("hidden");
  root.innerHTML = `<p class="py-space-lg text-center font-body-md text-body-md text-secondary">جاري تحميل الجدول…</p>`;
  type AvRule = { day_of_week: number; start_time: string; end_time: string; is_enabled: boolean; slot_minutes: number | null; break_start_1: string | null; break_end_1: string | null; break_start_2: string | null; break_end_2: string | null };
  type Blocked = { id: string; start_date: string; end_date: string; reason: string | null };
  const fixture = mgFixture();
  try {
    let schedules: Sched[];
    let availability: AvRule[];
    let blocked: Blocked[];
    if (fixture) {
      schedules = fixtureSchedules() as unknown as Sched[];
      availability = fixtureAvailability as unknown as AvRule[];
      blocked = fixtureBlocked as unknown as Blocked[];
    } else {
      [schedules, availability, blocked] = await Promise.all([
        listDoctorSchedules(doctorId) as unknown as Promise<Sched[]>,
        getDoctorAvailability(doctorId).catch(() => []) as Promise<AvRule[]>,
        listBlockedDates(doctorId).catch(() => []) as Promise<Blocked[]>,
      ]);
    }

    const today = localDateISO();
    const role = state.currentUser?.profile?.role as string | undefined;
    const isDoctor = role === "doctor";
    const docName = state.adminDoctorsCache.find((d) => d.id === doctorId)?.name || (isDoctor ? state.currentUser?.profile?.full_name : "") || "";
    const heading = isDoctor ? "ساعات عملي" : `مواعيد ${docName || "الطبيب"}`;

    const enabledRules = availability.filter((r) => r.is_enabled);
    const rulesByDay = new Map<number, AvRule[]>();
    enabledRules.forEach((r) => rulesByDay.set(r.day_of_week, [...(rulesByDay.get(r.day_of_week) || []), r]));
    const firstRule = enabledRules[0];
    const slotFromRule = String(firstRule?.slot_minutes ?? 30);

    /* A day can hold several shifts (e.g. 09:00–13:00 and 16:00–20:00), each
       with its own breaks — exactly as stored in doctor_availability. */
    const drafts: DayDraft[] = SCHED_DAYS.map((_, day) => {
      const rules = (rulesByDay.get(day) || []).slice().sort((a, b) => a.start_time.localeCompare(b.start_time));
      return {
        on: rules.length > 0,
        shifts: rules.length
          ? rules.map((r) => ({
            start: hhmm(r.start_time), end: hhmm(r.end_time),
            b1s: hhmm(r.break_start_1), b1e: hhmm(r.break_end_1),
            b2s: hhmm(r.break_start_2), b2e: hhmm(r.break_end_2),
          }))
          : [emptyShift()],
      };
    });

    const weekCapacity = enabledRules.reduce((sum, r) => sum + shiftSlots({
      start: hhmm(r.start_time), end: hhmm(r.end_time),
      b1s: hhmm(r.break_start_1), b1e: hhmm(r.break_end_1),
      b2s: hhmm(r.break_start_2), b2e: hhmm(r.break_end_2),
    }, r.slot_minutes ?? 30).length, 0);
    const upcoming = schedules.filter((s) => !s.is_booked && s.available_date >= today);
    const nearest = upcoming.length ? upcoming.reduce((a, b) => (a.available_date <= b.available_date ? a : b)).available_date : "";

    const stat = (label: string, value: string) => `<div class="bg-surface-container-lowest px-4 py-3">
      <p class="text-[12px] text-on-surface-variant">${escapeHtml(label)}</p>
      <p class="mt-1 text-[19px] font-semibold leading-none tabular-nums text-on-surface">${escapeHtml(value)}</p>
    </div>`;

    root.innerHTML = `
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div class="min-w-0">
          <p class="text-[12px] font-medium text-on-surface-variant">جدولي وساعات العمل</p>
          <h2 class="mt-0.5 text-[19px] font-bold text-on-surface">${escapeHtml(heading)}</h2>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        ${stat("أيام العمل أسبوعياً", String(enabledRules.length ? rulesByDay.size : 0))}
        ${stat("مواعيد الأسبوع", String(weekCapacity))}
        ${stat("مواعيد متاحة قادمة", String(upcoming.length))}
        ${stat("أقرب موعد متاح", nearest ? formatArabicDate(nearest) : "—")}
      </div>

      <div class="mt-3 grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.5fr_1fr]">
        <section class="rounded-xl border border-line bg-surface-container-lowest p-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="flex items-center gap-1.5 text-[14px] font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">schedule</span>أوقات العمل الأسبوعية
            </h3>
            <label class="flex items-center gap-1.5 text-[12px] text-on-surface-variant">مدة الموعد
              <select id="wk-slot" class="h-7 rounded-md border border-line bg-surface-container-lowest px-1.5 text-start text-[12px] text-on-surface">
                ${[15, 20, 30, 45, 60].map((m) => `<option value="${m}"${String(m) === slotFromRule ? " selected" : ""}>${m} د</option>`).join("")}
              </select>
            </label>
          </div>

          <div id="day-rows" class="mt-1 flex flex-col divide-y divide-line"></div>

          <div class="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2">
            <p id="av-preview" class="text-[12px] text-on-surface-variant"></p>
            <button id="apply-all" type="button" class="inline-flex h-7 items-center gap-1 rounded-md border border-line px-2 text-[11px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
              <span class="material-symbols-outlined text-[15px]" aria-hidden="true">content_copy</span>طبّق أول يوم على الباقي
            </button>
            <button id="save-availability" type="button" class="ms-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50">
              <span class="material-symbols-outlined text-[17px]" aria-hidden="true">save</span>حفظ
            </button>
          </div>
        </section>

        <div class="flex flex-col gap-3">
          <section class="rounded-xl border border-line bg-surface-container-lowest p-3">
            <h3 class="flex items-center gap-1.5 text-[14px] font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">auto_awesome</span>توليد المواعيد
            </h3>
            <p class="mt-0.5 text-[11px] text-on-surface-variant">من أوقات العمل المحفوظة، ٩٠ يوماً قادمة.</p>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <select id="gen-mode" class="h-8 min-w-0 flex-1 rounded-md border border-line bg-surface-container-lowest px-1.5 text-start text-[12px] text-on-surface">
                <option value="add">أضف الناقص فقط</option>
                <option value="replace">استبدل الفارغ</option>
              </select>
              <button id="generate-schedule" type="button" class="inline-flex h-8 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 text-[12px] font-semibold text-primary transition-colors hover:bg-primary/20">
                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">event_repeat</span>توليد
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-line bg-surface-container-lowest p-3">
            <h3 class="flex items-center gap-1.5 text-[14px] font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">beach_access</span>إجازات وأيام مغلقة
            </h3>
            <div class="mt-2 grid grid-cols-3 gap-1.5">
              <label class="text-[11px] text-on-surface-variant">من
                <input id="block-start" type="date" min="${today}" class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-start text-[12px] text-on-surface" />
              </label>
              <label class="text-[11px] text-on-surface-variant">إلى
                <input id="block-end" type="date" min="${today}" class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-start text-[12px] text-on-surface" />
              </label>
              <label class="text-[11px] text-on-surface-variant">السبب
                <input id="block-reason" placeholder="إجازة" class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-[12px] text-on-surface" />
              </label>
            </div>
            <button id="add-blocked" type="button" class="mt-2 inline-flex h-8 w-full items-center justify-center gap-1 rounded-md bg-error-container/60 px-3 text-[12px] font-semibold text-on-error-container transition-colors hover:bg-error-container">
              <span class="material-symbols-outlined text-[16px]" aria-hidden="true">lock</span>إغلاق التواريخ
            </button>
            <div class="mt-1 flex flex-col divide-y divide-line">
              ${blocked.length ? blocked.map((b) => `
                <div class="flex items-center justify-between gap-2 py-1.5 text-[12px] text-on-surface">
                  <span class="min-w-0 truncate"><span class="tabular-nums">${escapeHtml(formatArabicDate(b.start_date))}${b.start_date !== b.end_date ? " – " + escapeHtml(formatArabicDate(b.end_date)) : ""}</span> · ${escapeHtml(b.reason || "إجازة")}</span>
                  <button data-unblock="${escapeHtml(b.id)}" type="button" class="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">إلغاء</button>
                </div>`).join("") : `<p class="py-1.5 text-[11px] text-on-surface-variant">لا توجد إجازات مسجّلة.</p>`}
            </div>
          </section>

          <section class="rounded-xl border border-line bg-surface-container-lowest p-3">
            <h3 class="flex items-center gap-1.5 text-[14px] font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">add_task</span>نوبات ليوم واحد
            </h3>
            <form id="add-schedule" class="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
              <label class="col-span-2 text-[11px] text-on-surface-variant sm:col-span-1">التاريخ
                <input id="sch-date" type="date" min="${today}" required class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-start text-[12px] text-on-surface" />
              </label>
              <label class="text-[11px] text-on-surface-variant">من
                <input id="sch-start" type="time" required class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-start text-[12px] text-on-surface" />
              </label>
              <label class="text-[11px] text-on-surface-variant">إلى
                <input id="sch-end" type="time" required class="mt-0.5 h-8 w-full rounded-md border border-line bg-surface-container-lowest px-1 text-start text-[12px] text-on-surface" />
              </label>
              <button type="submit" class="col-span-2 inline-flex h-8 items-center justify-center gap-1 rounded-md border border-line px-2.5 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:col-span-1">
                <span class="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">add</span>إضافة
              </button>
            </form>
            <p class="mt-1 text-[11px] text-on-surface-variant">تُقسَّم الفترة حسب مدة الموعد.</p>
          </section>
        </div>
      </div>

      <section class="mt-3 rounded-xl border border-line bg-surface-container-lowest">
        <div id="slot-panel">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <h3 class="flex items-center gap-1.5 text-[14px] font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">event_available</span>المواعيد المتاحة
            </h3>
            <div class="flex items-center gap-0.5">
              <button data-cal="-1" type="button" aria-label="الشهر السابق" class="grid h-6 w-6 place-items-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"><span class="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span></button>
              <span id="cal-label" class="min-w-[100px] text-center text-[12px] font-semibold text-on-surface"></span>
              <button data-cal="1" type="button" aria-label="الشهر التالي" class="grid h-6 w-6 place-items-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"><span class="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_left</span></button>
            </div>
          </div>

          <div id="cal-grid" class="px-2 pt-2"></div>
          <p id="cal-month" class="px-3 pb-1.5 pt-1 text-[11px] text-on-surface-variant"></p>
          <div id="day-panel"></div>
        </div>
      </section>`;

    const val = (sel: string) => (root.querySelector(sel) as HTMLInputElement | HTMLSelectElement | null)?.value || "";
    const slotNow = () => Number(val("#wk-slot")) || 30;

    let expanded: string | null = null;

    const shiftChip = (day: number, si: number, s: ShiftDraft) => {
      const key = `${day}-${si}`;
      const open = expanded === key;
      return `<button type="button" data-shift="${key}" aria-expanded="${open}" class="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[12px] tabular-nums transition-colors ${open ? "border-primary bg-primary/10 text-primary" : "border-line text-on-surface hover:bg-surface-container-low"}">
        ${escapeHtml(s.start)}–${escapeHtml(s.end)}
        <span data-chip-count="${key}" class="text-[11px] ${open ? "text-primary/70" : "text-on-surface-variant"}">${shiftSlots(s, slotNow()).length}</span>
        ${s.b1s || s.b2s ? `<span class="material-symbols-outlined text-[12px]" aria-hidden="true" title="بها استراحة">free_breakfast</span>` : ""}
      </button>`;
    };

    const shiftEditor = (day: number, si: number, s: ShiftDraft, canRemove: boolean) => {
      const issue = shiftIssue(s);
      return `<div data-strip="${day}-${si}" class="flex flex-wrap items-center gap-1.5 border-s-2 border-primary/50 bg-surface-container-low px-2 py-1.5">
        <input type="time" data-f="${day}-${si}-start" value="${escapeHtml(s.start)}" aria-label="من" class="h-7 w-[76px] rounded-md border border-line bg-surface-container-lowest px-1 text-[12px] tabular-nums text-on-surface" />
        <span class="text-[11px] text-on-surface-variant">–</span>
        <input type="time" data-f="${day}-${si}-end" value="${escapeHtml(s.end)}" aria-label="إلى" class="h-7 w-[76px] rounded-md border border-line bg-surface-container-lowest px-1 text-[12px] tabular-nums text-on-surface" />
        <details class="min-w-0">
          <summary class="cursor-pointer list-none rounded px-1 py-0.5 text-[11px] text-on-surface-variant transition-colors hover:text-on-surface">استراحات${s.b1s || s.b2s ? " •" : ""}</summary>
          <div class="mt-1 flex flex-wrap items-center gap-1">
            <span class="text-[11px] text-on-surface-variant">١</span>
            <input type="time" data-f="${day}-${si}-b1s" value="${escapeHtml(s.b1s)}" aria-label="استراحة ١ من" class="h-7 w-[70px] rounded-md border border-line bg-surface-container-lowest px-1 text-[11px] tabular-nums text-on-surface" />
            <span class="text-[11px] text-on-surface-variant">–</span>
            <input type="time" data-f="${day}-${si}-b1e" value="${escapeHtml(s.b1e)}" aria-label="استراحة ١ إلى" class="h-7 w-[70px] rounded-md border border-line bg-surface-container-lowest px-1 text-[11px] tabular-nums text-on-surface" />
            <span class="ms-1 text-[11px] text-on-surface-variant">٢</span>
            <input type="time" data-f="${day}-${si}-b2s" value="${escapeHtml(s.b2s)}" aria-label="استراحة ٢ من" class="h-7 w-[70px] rounded-md border border-line bg-surface-container-lowest px-1 text-[11px] tabular-nums text-on-surface" />
            <span class="text-[11px] text-on-surface-variant">–</span>
            <input type="time" data-f="${day}-${si}-b2e" value="${escapeHtml(s.b2e)}" aria-label="استراحة ٢ إلى" class="h-7 w-[70px] rounded-md border border-line bg-surface-container-lowest px-1 text-[11px] tabular-nums text-on-surface" />
          </div>
        </details>
        <span data-status class="ms-auto text-[11px] ${issue ? "font-medium text-error" : "text-on-surface-variant"}">${issue ? escapeHtml(issue) : `${shiftSlots(s, slotNow()).length} موعداً`}</span>
        ${canRemove ? `<button type="button" data-del-shift="${day}-${si}" aria-label="حذف الفترة" class="grid h-6 w-6 place-items-center rounded text-on-surface-variant transition-colors hover:bg-error-container/60 hover:text-on-error-container"><span class="material-symbols-outlined text-[15px]" aria-hidden="true">delete</span></button>` : ""}
        <button type="button" data-close-shift class="rounded px-1 text-[11px] text-on-surface-variant transition-colors hover:text-on-surface" aria-label="إغلاق التعديل">تم</button>
      </div>`;
    };

    const renderDayRows = () => {
      const rows = root.querySelector("#day-rows") as HTMLElement;
      rows.innerHTML = drafts.map((d, day) => {
        const openIdx = expanded && expanded.startsWith(`${day}-`) ? Number(expanded.split("-")[1]) : -1;
        const openShift = openIdx >= 0 ? d.shifts[openIdx] : null;
        return `<div class="py-1.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" data-day-toggle="${day}" role="switch" aria-checked="${d.on}" aria-label="${SCHED_DAYS[day]}"
              class="relative h-5 w-9 shrink-0 rounded-full transition-colors ${d.on ? "bg-primary" : "bg-line"}">
              <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${d.on ? "start-0.5" : "end-0.5"}"></span>
            </button>
            <span class="w-14 text-[12px] font-semibold ${d.on ? "text-on-surface" : "text-on-surface-variant"}">${SCHED_DAYS[day]}</span>
            ${d.on
              ? `${d.shifts.map((s, si) => shiftChip(day, si, s)).join("")}
                <button type="button" data-add-shift="${day}" aria-label="إضافة فترة" class="grid h-7 w-7 place-items-center rounded-md border border-dashed border-line text-on-surface-variant transition-colors hover:border-primary hover:text-primary"><span class="material-symbols-outlined text-[15px]" aria-hidden="true">add</span></button>`
              : `<span class="text-[12px] text-on-surface-variant">مغلق</span>`}
          </div>
          ${d.on && openShift ? shiftEditor(day, openIdx, openShift, d.shifts.length > 1) : ""}
        </div>`;
      }).join("");
      preview();
    };

    const paintStrip = (day: number, si: number) => {
      const shift = drafts[day]?.shifts[si];
      if (!shift) return;
      const strip = root.querySelector<HTMLElement>(`[data-strip="${day}-${si}"]`);
      const issue = shiftIssue(shift);
      const status = strip?.querySelector<HTMLElement>("[data-status]");
      if (status) {
        status.textContent = issue || `${shiftSlots(shift, slotNow()).length} موعداً`;
        status.className = `ms-auto text-[11px] ${issue ? "font-medium text-error" : "text-on-surface-variant"}`;
      }
      const chipCount = root.querySelector<HTMLElement>(`[data-chip-count="${day}-${si}"]`);
      if (chipCount) chipCount.textContent = String(shiftSlots(shift, slotNow()).length);
      preview();
    };

    const preview = () => {
      const on = drafts.filter((d) => d.on);
      const total = on.reduce((sum, d) => sum + daySlots(d, slotNow()).length, 0);
      const el = root.querySelector("#av-preview") as HTMLElement | null;
      if (el) el.textContent = on.length ? `${on.length} أيام · ${total} موعداً أسبوعياً` : "لم تُفعّل أي يوم.";
      (root.querySelector("#save-availability") as HTMLButtonElement).disabled = drafts.some((d) => d.on && !!dayIssue(d));
    };

    const dayRows = root.querySelector("#day-rows") as HTMLElement;
    dayRows.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const toggle = t.closest<HTMLElement>("[data-day-toggle]");
      if (toggle) {
        const day = Number(toggle.dataset.dayToggle);
        drafts[day].on = !drafts[day].on;
        if (drafts[day].on && !drafts[day].shifts.length) drafts[day].shifts = [emptyShift()];
        expanded = drafts[day].on ? `${day}-0` : null;
        renderDayRows();
        return;
      }
      const chip = t.closest<HTMLElement>("[data-shift]");
      if (chip) {
        const key = chip.dataset.shift!;
        expanded = expanded === key ? null : key;
        renderDayRows();
        return;
      }
      const add = t.closest<HTMLElement>("[data-add-shift]");
      if (add) {
        const day = Number(add.dataset.addShift);
        const d = drafts[day];
        const last = d.shifts[d.shifts.length - 1];
        const start = last ? clock(Math.min(toMinutes(last.end) + 60, 23 * 60)) : "16:00";
        d.shifts.push(emptyShift(start, clock(Math.min(toMinutes(start) + 120, 23 * 60 + 59))));
        expanded = `${day}-${d.shifts.length - 1}`;
        renderDayRows();
        return;
      }
      const del = t.closest<HTMLElement>("[data-del-shift]");
      if (del) {
        const [day, si] = (del.dataset.delShift || "").split("-").map(Number);
        drafts[day].shifts.splice(si, 1);
        expanded = null;
        renderDayRows();
        return;
      }
      if (t.closest<HTMLElement>("[data-close-shift]")) {
        expanded = null;
        renderDayRows();
      }
    });
    dayRows.addEventListener("input", (e) => {
      const el = e.target as HTMLInputElement;
      const key = el.dataset.f;
      if (!key) return;
      const parts = key.split("-");
      const day = Number(parts[0]), si = Number(parts[1]), field = parts[2];
      const shift = drafts[day]?.shifts[si];
      if (!shift) return;
      if (field === "start" || field === "end" || field === "b1s" || field === "b1e" || field === "b2s" || field === "b2e") shift[field] = el.value;
      paintStrip(day, si);
    });
    (root.querySelector("#wk-slot") as HTMLSelectElement).addEventListener("change", () => { renderDayRows(); });

    (root.querySelector("#apply-all") as HTMLButtonElement).addEventListener("click", () => {
      const source = drafts.find((d) => d.on && d.shifts.length);
      if (!source) { showToast("فعّل يوماً بفترة واحدة على الأقل أولاً", "warning"); return; }
      drafts.forEach((d) => {
        if (!d.on) return;
        d.shifts = source.shifts.map((s) => ({ ...s }));
      });
      expanded = null;
      renderDayRows();
      showToast("نُسخت فترات أول يوم على كل الأيام المفعّلة", "success");
    });

    renderDayRows();

    (root.querySelector("#save-availability") as HTMLButtonElement).addEventListener("click", async () => {
      const bad = drafts.findIndex((d) => d.on && !!dayIssue(d));
      if (bad >= 0) { showToast(`${SCHED_DAYS[bad]}: ${dayIssue(drafts[bad])}`, "warning"); return; }
      const active = drafts.filter((d) => d.on);
      if (active.some((d) => !daySlots(d, slotNow()).length)) { showToast("مدة الموعد أكبر من نطاق بعض الفترات", "warning"); return; }
      if (!active.length) {
        const ok = await confirmSheet({ title: "مسح كل أوقات العمل؟", body: "لن تُولّد مواعيد جديدة حتى تحفظ أوقاتاً.", confirmLabel: "مسح", tone: "danger" });
        if (!ok) return;
      }
      const slot = slotNow();
      const rules: Record<string, unknown>[] = [];
      drafts.forEach((d, day) => {
        if (!d.on) return;
        d.shifts.forEach((s) => rules.push({
          doctor_id: doctorId, day_of_week: day, start_time: s.start, end_time: s.end,
          is_enabled: true, slot_minutes: slot,
          break_start_1: s.b1s || null, break_end_1: s.b1e || null,
          break_start_2: s.b2s || null, break_end_2: s.b2e || null,
        }));
      });
      try {
        await saveDoctorAvailability(doctorId, rules);
        showToast(rules.length ? `حُفظت ${rules.length} فترة عمل · ${slot} دقيقة للموعد` : "مُسحت أوقات العمل", "success");
        await renderSchedules(root, doctorId);
      } catch (err) { showToast(translateAuthError(err), "error"); }
    });

    (root.querySelector("#generate-schedule") as HTMLButtonElement).addEventListener("click", async () => {
      const replace = val("#gen-mode") === "replace";
      if (replace) {
        const ok = await confirmSheet({ title: "استبدال المواعيد الفارغة؟", body: "سيُحذف كل موعد فارغ غير محجوز في الـ٩٠ يوماً القادمة ثم يُعاد توليده من أوقاتك المحفوظة.", confirmLabel: "استبدال", tone: "danger" });
        if (!ok) return;
      }
      const btn = root.querySelector("#generate-schedule") as HTMLButtonElement;
      btn.disabled = true;
      try {
        const { created } = await generateDoctorSchedule(doctorId, 90, replace);
        showToast(created ? `أُضيف ${created} موعداً` : "لا مواعيد جديدة — احفظ الأوقات أولاً", created ? "success" : "info");
        await renderSchedules(root, doctorId);
        await refreshDoctors();
      } catch (err) { showToast(translateAuthError(err), "error"); btn.disabled = false; }
    });

    (root.querySelector("#add-blocked") as HTMLButtonElement).addEventListener("click", async () => {
      const start = val("#block-start");
      const end = val("#block-end") || start;
      const reason = val("#block-reason") || "إجازة";
      if (!start) { showToast("حدّد تاريخ البداية", "warning"); return; }
      if (end < start) { showToast("تاريخ النهاية قبل البداية", "warning"); return; }
      const ok = await confirmSheet({ title: "إغلاق هذه التواريخ؟", body: `سيُحذف كل موعد فارغ غير محجوز بين ${formatArabicDate(start)} و${formatArabicDate(end)}، ولن تُولّد مواعيد فيهما.`, confirmLabel: "إغلاق", tone: "danger" });
      if (!ok) return;
      try {
        const { deleted } = await blockDoctorDates(doctorId, start, end, reason);
        showToast(deleted ? `أُغلق النطاق وحُذف ${deleted} موعداً فارغاً` : "أُغلق النطاق", "success");
        await renderSchedules(root, doctorId);
        await refreshDoctors();
      } catch (err) { showToast(translateAuthError(err), "error"); }
    });

    root.querySelectorAll<HTMLButtonElement>("[data-unblock]").forEach((b) => b.addEventListener("click", async () => {
      const ok = await confirmSheet({ title: "إلغاء إغلاق النطاق؟", body: "لن تعود المواعيد المحذوفة تلقائياً — استخدم التوليد بعد إلغاء الإغلاق.", confirmLabel: "إلغاء الإغلاق", tone: "primary" });
      if (!ok) return;
      try { await unblockDoctorDates(b.dataset.unblock!); showToast("تم إلغاء الإغلاق", "success"); await renderSchedules(root, doctorId); }
      catch (e) { showToast(translateAuthError(e), "error"); }
    }));

    (root.querySelector("#add-schedule") as HTMLFormElement).addEventListener("submit", async (e) => {
      e.preventDefault();
      const date = val("#sch-date"), from = val("#sch-start"), to = val("#sch-end");
      if (!date || !from || !to) { showToast("أكمل التاريخ والفترة", "warning"); return; }
      if (date < localDateISO()) { showToast("لا يمكن إضافة مواعيد في الماضي", "warning"); return; }
      if (toMinutes(to) <= toMinutes(from)) { showToast("وقت النهاية يجب أن يكون بعد البداية", "warning"); return; }
      const dow = new Date(`${date}T12:00:00`).getDay();
      const slot = rulesByDay.get(dow)?.[0]?.slot_minutes ?? slotNow();
      const cells: number[] = [];
      for (let t = toMinutes(from); t + slot <= toMinutes(to); t += slot) cells.push(t);
      if (!cells.length) { showToast(`المدة (${slot} د) لا تتيح أي موعد في هذه الفترة`, "warning"); return; }
      if (cells.length > 60) { showToast("الفترة طويلة — قسّمها على عدة أيام", "warning"); return; }
      const existing = new Set(schedules.filter((s) => s.available_date === date).map((s) => hhmm(s.start_time)));
      const rows = cells.filter((t) => !existing.has(clock(t)))
        .map((t) => ({ doctorId, availableDate: date, startTime: clock(t), endTime: clock(t + slot) }));
      if (!rows.length) { showToast("كل هذه المواعيد موجودة مسبقاً", "info"); return; }
      try {
        await createDoctorSchedules(rows);
        const skipped = cells.length - rows.length;
        showToast(`أُضيف ${rows.length} موعداً${skipped ? ` · ${skipped} موجود مسبقاً` : ""}`, "success");
        await renderSchedules(root, doctorId);
        await refreshDoctors();
      } catch (err) { showToast(translateAuthError(err), "error"); }
    });

    if (!schedMonth) schedMonth = monthOf(today);
    if (!schedSelected) schedSelected = today;
    const slotPanel = root.querySelector("#slot-panel") as HTMLElement;

    const chipHtml = (s: Sched) => {
      const t = formatTime(s.start_time);
      return s.is_booked
        ? `<span class="inline-flex h-7 items-center gap-1 rounded-md bg-warning-soft px-2 text-[12px] font-medium tabular-nums text-warning" title="محجوز">${escapeHtml(t)}<span class="material-symbols-outlined text-[14px]" aria-hidden="true">person</span></span>`
        : `<span class="inline-flex h-7 items-center gap-1 rounded-md border border-line px-2 text-[12px] tabular-nums text-on-surface">
            ${escapeHtml(t)}
            <button type="button" data-del-sch="${escapeHtml(s.id)}" aria-label="حذف موعد ${escapeHtml(t)}" title="حذف" class="grid h-4 w-4 place-items-center rounded text-on-surface-variant transition-colors hover:bg-error-container/60 hover:text-on-error-container"><span class="material-symbols-outlined text-[14px]" aria-hidden="true">close</span></button>
          </span>`;
    };

    const paintSlots = () => {
      const monthIso = schedMonth;
      const [yy, mm] = monthIso.split("-").map(Number);
      const totalDays = new Date(yy, mm, 0).getDate();
      const lead = new Date(yy, mm - 1, 1).getDay();
      const monthSlots = schedules.filter((s) => s.available_date.startsWith(monthIso));
      const monthFree = monthSlots.filter((s) => !s.is_booked).length;

      const label = root.querySelector("#cal-label");
      if (label) label.textContent = new Date(yy, mm - 1, 1).toLocaleDateString("ar-SA-u-nu-latn", { month: "long", year: "numeric" });
      const summary = root.querySelector("#cal-month");
      if (summary) summary.textContent = monthSlots.length ? `${monthFree} متاح · ${monthSlots.length - monthFree} محجوز` : "لا مواعيد مُولّدة في هذا الشهر";

      const thisMonth = monthOf(today);
      root.querySelectorAll<HTMLButtonElement>("[data-cal]").forEach((b) => {
        const dir = Number(b.dataset.cal);
        const target = addMonths(monthIso, dir);
        b.disabled = dir < 0 ? target < thisMonth : target > addMonths(thisMonth, 3);
      });

      const cells: string[] = [];
      for (let i = 0; i < lead; i++) cells.push("<span></span>");
      for (let d = 1; d <= totalDays; d++) {
        const date = `${monthIso}-${String(d).padStart(2, "0")}`;
        const list = schedules.filter((s) => s.available_date === date);
        const freeN = list.filter((s) => !s.is_booked).length;
        const bookedN = list.length - freeN;
        const closed = blocked.some((b) => date >= b.start_date && date <= b.end_date);
        const selected = date === schedSelected;
        const isToday = date === today;
        const ring = selected ? "border-primary bg-primary/10" : isToday ? "border-primary/50" : "border-line";
        cells.push(`<button type="button" data-pick="${date}" aria-pressed="${selected}" aria-label="${escapeHtml(formatArabicDate(date))}${closed ? " مغلق" : list.length ? ` — ${freeN} متاح` : ""}"
          class="flex h-11 flex-col items-center justify-center gap-0.5 rounded-md border text-[12px] tabular-nums transition-colors hover:bg-surface-container-low ${ring} ${selected ? "text-primary" : "text-on-surface"}">
          <span class="leading-none ${selected ? "font-bold" : isToday ? "font-bold text-primary" : "font-medium"}">${d}</span>
          ${closed
            ? `<span class="material-symbols-outlined text-[11px] leading-none text-on-surface-variant" aria-hidden="true">lock</span>`
            : list.length
              ? `<span class="flex items-center gap-0.5 leading-none"><span class="h-1 w-1 rounded-full ${freeN ? "bg-tertiary" : "bg-warning"}"></span><span class="text-[10px] ${selected ? "text-primary/70" : "text-on-surface-variant"}">${freeN || bookedN}</span></span>`
              : `<span class="h-1 w-1 rounded-full bg-line"></span>`}
        </button>`);
      }
      while (cells.length % 7) cells.push("<span></span>");
      const grid = root.querySelector("#cal-grid") as HTMLElement;
      grid.innerHTML = `<div class="grid grid-cols-7 gap-1">
        ${WEEK_SHORT.map((w) => `<span class="pb-0.5 text-center text-[10px] text-on-surface-variant">${w}</span>`).join("")}
        ${cells.join("")}
      </div>`;

      const dayList = schedules.filter((s) => s.available_date === schedSelected).sort((a, b) => a.start_time.localeCompare(b.start_time));
      const dayFree = dayList.filter((s) => !s.is_booked).length;
      const dayPanel = root.querySelector("#day-panel") as HTMLElement;
      dayPanel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
          <p class="text-[12px] font-semibold text-on-surface">${escapeHtml(formatArabicDate(schedSelected))}</p>
          <p class="text-[11px] text-on-surface-variant">${dayList.length ? `${dayFree} متاح · ${dayList.length - dayFree} محجوز` : "لا مواعيد"}</p>
        </div>
        ${dayList.length
          ? `<div class="flex flex-wrap gap-1.5 px-3 pb-3">${dayList.map(chipHtml).join("")}</div>`
          : `<p class="px-3 pb-3 text-[11px] text-on-surface-variant">اختر يوماً فيه مواعيد، أو ولّد من أوقات عملك المحفوظة.</p>`}`;
    };

    slotPanel.addEventListener("click", async (e) => {
      const t = e.target as HTMLElement;
      const cal = t.closest<HTMLButtonElement>("[data-cal]");
      if (cal) {
        if (cal.disabled) return;
        schedMonth = addMonths(schedMonth, Number(cal.dataset.cal));
        if (!schedSelected.startsWith(schedMonth)) schedSelected = `${schedMonth}-01`;
        paintSlots();
        return;
      }
      const pick = t.closest<HTMLButtonElement>("[data-pick]");
      if (pick) {
        schedSelected = pick.dataset.pick!;
        paintSlots();
        return;
      }
      const btn = t.closest<HTMLButtonElement>("[data-del-sch]");
      if (!btn) return;
      const ok = await confirmSheet({ title: "حذف هذا الموعد؟", body: "سيُحذف الموعد الفارغ ويختفي من صفحة الحجز.", confirmLabel: "حذف", tone: "danger" });
      if (!ok) return;
      try { await deleteDoctorSchedule(btn.dataset.delSch!); showToast("تم الحذف", "success"); await renderSchedules(root, doctorId); await refreshDoctors(); }
      catch (err) { showToast(translateAuthError(err), "error"); }
    });
    paintSlots();
  } catch (e) {
    root.innerHTML = `<div class="rounded-xl border border-line bg-surface-container-lowest p-6 text-center text-[13px] text-on-surface-variant">تعذر تحميل الجدول: ${escapeHtml(translateAuthError(e))}</div>`;
  }
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
  // Realtime updates must never yank staff out of the dashboard — a full
  // re-render would drop the schedule editor's unsaved input; on #admin the
  // panels still refresh when visited, so update data silently there.
  const onRealtime = (refresh: () => Promise<unknown>) => {
    if (state.route.name === "admin") { void refresh(); return; }
    void refresh().then(render);
  };
  try { subscribeToRealtimeUpdates(() => onRealtime(refreshDoctors), () => onRealtime(refreshAll)); } catch { /* ignore */ }
}
void init();
