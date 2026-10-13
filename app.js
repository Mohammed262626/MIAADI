import { getSupabaseConfig, saveSupabaseConfig } from "./config.js";
import {
  getClient,
  resetClient,
  registerPatient,
  loginUser,
  logoutUser,
  getCurrentUser,
  getDoctorsWithSchedules,
  bookAppointmentRPC,
  cancelAppointmentRPC,
  rescheduleAppointmentRPC,
  updatePatientProfile,
  getPatientAppointments,
  updateAppointmentState,
  cancelAppointmentClinic,
  getAdminAppointments,
  getAdminStats,
  assignUserRole,
  adminListProfiles,
  listDoctors,
  listDoctorSchedules,
  createDoctorSchedule,
  deleteDoctorSchedule,
  saveDoctor,
  deleteDoctor,
  findDoctorByUser,
  subscribeToRealtimeUpdates,
  onAuthChange,
  translateAuthError,
  // Doctor availability functions (Phase 4)
  getDoctorAvailability,
  saveDoctorAvailability,
  blockDoctorDates,
  generateDoctorSchedule,
  getAvailableSlots
} from "./supabase-service.js";

// الحالة العامة للتطبيق
const state = {
  currentUser: null,
  doctors: [],
  selectedSpecialization: "all",
  searchQuery: "",
  patientAppointments: [],
  activeTab: "doctors", // 'doctors' | 'appointments'
  sortBy: "default", // 'default' | 'fee-asc' | 'fee-desc'
  selectedSlot: null, // الموعد المحدد للحجز
  appointmentToCancel: null, // الحجز المراد إلغاؤه
  appointmentToReschedule: null, // الحجز المراد إعادة جدولته
  selectedRescheduleSlotId: null, // الموعد الجديد المختار
  isLoading: false,
  //calendar state
  calendar: {
    currentMonth: new Date(),
    selectedDate: null,
    selectedDoctor: null,
    viewMode: 'month', // 'month' | 'week' | 'day'
    threeMonthStart: new Date(),
    threeMonthEnd: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    availableSlotsByDate: {}, // { 'YYYY-MM-DD': [{ start, end, booked }] }
    isLoadingSlots: false
  },
  // حالة لوحة العيادة (فلترة + ترقيم صفحات من الخادم)
  adminFilters: {
    status: "all", // 'all' | 'booked' | 'completed' | 'no_show' | 'cancelled'
    doctorId: "",
    dateFrom: localDateISO(),
    dateTo: localDateISO(),
    search: "",
    sortBy: "available_date",
    sortDir: "desc"
  },
  adminTodayActive: true,
  adminPage: 0,
  adminPageSize: 25,
  adminTotal: 0,
  adminActionBusy: false,
  adminSubTab: "appointments", // 'appointments' | 'management' | 'accounts'
  adminManagementDoctor: null, // معرف الطبيب المحدد لإدارة مواعيده
  editingDoctorId: null, // معرف الطبيب الجاري تعديله (null = إضافة جديدة)
  adminAccountsCache: [],
  adminDoctorsCache: [],
  adminRowsCache: []
};

// تهيئة التطبيق عند اكتمال تحميل المستند
document.addEventListener("DOMContentLoaded", async () => {
  initDarkMode();
  initLucideIcons();
  setupEventListeners();
  initHeroPulse();
  checkConfigBanner();
  
  // الاستماع المباشر لتغيرات الجلسة وتحديث الواجهة تلقائياً (M3 Fix)
  try {
    onAuthChange(async (event, session) => {
      if (session?.user) {
        await loadCurrentUser();
      } else {
        state.currentUser = null;
        renderUserUI();
      }
    });
  } catch (authErr) {
    console.warn("Could not setup onAuthChange listener:", authErr);
  }

  // Event listeners for doctor availability panel
  document.getElementById("save-availability-btn")?.addEventListener("click", async () => {
    const daySun = document.getElementById("day-sun")?.checked;
    const dayMon = document.getElementById("day-mon")?.checked;
    const dayTue = document.getElementById("day-tue")?.checked;
    const dayWed = document.getElementById("day-wed")?.checked;
    const dayThu = document.getElementById("day-thu")?.checked;
    const dayFri = document.getElementById("day-fri")?.checked;
    const daySat = document.getElementById("day-sat")?.checked;
    const timeStart = document.getElementById("time-start")?.value || "09:00";
    const timeEnd = document.getElementById("time-end")?.value || "17:00";
    const reason = document.getElementById("availability-reason")?.value.trim() || "";

    const availableDays = [];
    if (daySun) availableDays.push("sun");
    if (dayMon) availableDays.push("mon");
    if (dayTue) availableDays.push("tue");
    if (dayWed) availableDays.push("wed");
    if (dayThu) availableDays.push("thu");
    if (dayFri) availableDays.push("fri");
    if (daySat) availableDays.push("sat");

    if (availableDays.length === 0) {
      showToast("الرجاء تحديد يوم على الأقل للتوفر", "warning");
      return;
    }

    state.adminActionBusy = true;
    try {
      await saveDoctorAvailability({
        availableDays,
        startTime: timeStart,
        endTime: timeEnd,
        reason: reason || null
      });
      showToast("تم حفظ جدول التوفر بنجاح", "success");
      closeModal("doctor-availability-modal");
      state.adminActionBusy = false;
    } catch (err) {
      console.error("Save availability error:", err);
      showToast(`تعذر saving التوفر: ${err.message}`, "error");
      state.adminActionBusy = false;
    }
  });

  document.getElementById("generate-schedule-btn")?.addEventListener("click", () => {
    if (!state.adminManagementDoctor) {
      showToast("رجاءً حدد طبيباً أولاً من قائمة الإدارة", "warning");
      return;
    }
    generateDoctorSchedule(state.adminManagementDoctor);
  });

  document.getElementById("add-blocked-btn")?.addEventListener("click", async () => {
    const start = document.getElementById("new-blocked-start")?.value;
    const end = document.getElementById("new-blocked-end")?.value;
    if (!start || !end) {
      showToast("الرجاء تحديد تاريخ البداية والنهاية", "warning");
      return;
    }
    state.adminActionBusy = true;
    try {
      await blockDoctorDates(state.adminManagementDoctor, start, end, "إجازة مُعلنة");
      showToast("تم إضافة تاريخ مغلق Successfully", "success");
      document.getElementById("new-blocked-start").value = "";
      document.getElementById("new-blocked-end").value = "";
      loadAdminDashboard();
    } catch (err) {
      console.error("Block dates error:", err);
      showToast(`تعذر إضافة تاريخ مغلق: ${err.message}`, "error");
    } finally {
      state.adminActionBusy = false;
    }
  });
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// إطلاق نبضة الهوية في البانر مرة واحدة عند التحميل (تُحترم إعدادات تقليل الحركة)
function initHeroPulse() {
  const path = document.getElementById("hero-pulse-path");
  if (!path || typeof path.getTotalLength !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const length = Math.ceil(path.getTotalLength());
  path.style.setProperty("--pulse-len", `${length}`);
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  path.classList.add("hero-pulse-run");
}

// مراقبة الاتصال اللحظي Realtime
function setupRealtime() {
  try {
    subscribeToRealtimeUpdates(
      () => {
        showToast("تحديث لحظي: تم تعديل جدول المواعيد", "info");
        fetchDoctors(false);
        if (state.activeTab === "admin") {
          if (state.adminSubTab === "management") loadManagementPanel();
          else loadAdminDashboard();
        }
      },
      () => {
        showToast("تحديث لحظي: تم تحديث سجل الحجوزات", "info");
        if (state.currentUser) {
          fetchPatientAppointments(false);
          if (state.activeTab === "admin") loadAdminDashboard();
        }
      }
    );
  } catch (err) {
    console.warn("Realtime initialization skipped:", err);
  }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
  // التبديل بين التبويبات (الأطباء / حجوزاتي / لوحة الإدارة) للشاشات الكبيرة والموبايل
  document.getElementById("tab-doctors-btn")?.addEventListener("click", () => switchTab("doctors"));
  document.getElementById("tab-appointments-btn")?.addEventListener("click", () => switchTab("appointments"));
  document.getElementById("tab-admin-btn")?.addEventListener("click", () => switchTab("admin"));
  document.getElementById("admin-refresh-btn")?.addEventListener("click", loadAdminDashboard);
  document.getElementById("mobile-tab-doctors")?.addEventListener("click", () => switchTab("doctors"));
  document.getElementById("mobile-tab-appointments")?.addEventListener("click", () => switchTab("appointments"));

  // فلترة وترقيم لوحة العيادة
  document.querySelectorAll("[data-admin-status]").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (state.adminActionBusy) return;
      state.adminFilters.status = chip.dataset.adminStatus;
      state.adminPage = 0;
      loadAdminDashboard();
    });
  });

  document.getElementById("admin-doctor-filter")?.addEventListener("change", (e) => {
    state.adminFilters.doctorId = e.target.value;
    state.adminPage = 0;
    loadAdminDashboard();
  });

  let adminSearchTimer = null;
  document.getElementById("admin-search-input")?.addEventListener("input", (e) => {
    clearTimeout(adminSearchTimer);
    adminSearchTimer = setTimeout(() => {
      state.adminFilters.search = e.target.value.trim();
      state.adminPage = 0;
      loadAdminDashboard();
    }, 350);
  });

  document.getElementById("admin-date-from")?.addEventListener("change", (e) => {
    state.adminFilters.dateFrom = e.target.value;
    state.adminTodayActive = false;
    state.adminPage = 0;
    loadAdminDashboard();
  });

  document.getElementById("admin-date-to")?.addEventListener("change", (e) => {
    state.adminFilters.dateTo = e.target.value;
    state.adminTodayActive = false;
    state.adminPage = 0;
    loadAdminDashboard();
  });

  document.getElementById("admin-today-toggle")?.addEventListener("click", () => {
    state.adminTodayActive = !state.adminTodayActive;
    if (state.adminTodayActive) {
      const today = localDateISO();
      state.adminFilters.dateFrom = today;
      state.adminFilters.dateTo = today;
    } else {
      state.adminFilters.dateFrom = "";
      state.adminFilters.dateTo = "";
    }
    state.adminPage = 0;
    loadAdminDashboard();
  });

  document.getElementById("admin-sort")?.addEventListener("change", (e) => {
    const [sortBy, sortDir] = e.target.value.split("_");
    state.adminFilters.sortBy = sortBy;
    state.adminFilters.sortDir = sortDir;
    state.adminPage = 0;
    loadAdminDashboard();
  });

  document.getElementById("admin-prev-btn")?.addEventListener("click", () => {
    if (state.adminPage > 0) {
      state.adminPage -= 1;
      loadAdminDashboard();
    }
  });

  document.getElementById("admin-next-btn")?.addEventListener("click", () => {
    if ((state.adminPage + 1) * state.adminPageSize >= state.adminTotal) return;
    state.adminPage += 1;
    loadAdminDashboard();
  });

  // نافذة تأكيد إجراءات العيادة (تراجع / تأكيد / إغلاق بالنقر على الخلفية)
  document.getElementById("admin-confirm-cancel")?.addEventListener("click", () => window.closeAdminConfirm());
  document.getElementById("admin-confirm-ok")?.addEventListener("click", confirmAdminAction);
  document.getElementById("admin-confirm-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "admin-confirm-modal") window.closeAdminConfirm();
  });

  // أقسام لوحة العيادة (سجل الحجوزات / الأطباء والمواعيد / الحسابات والأدوار)
  document.getElementById("admin-sub-appointments")?.addEventListener("click", () => {
    switchAdminSub("appointments");
    loadAdminDashboard();
  });
  document.getElementById("admin-sub-management")?.addEventListener("click", () => {
    switchAdminSub("management");
    loadManagementPanel();
  });
  document.getElementById("admin-sub-accounts")?.addEventListener("click", () => {
    switchAdminSub("accounts");
    loadAccountsPanel();
  });
  document.getElementById("add-doctor-btn")?.addEventListener("click", () => window.openDoctorModal(null));
  document.getElementById("close-doctor-btn")?.addEventListener("click", () => closeModal("doctor-modal"));
  document.getElementById("close-doctor-form-btn")?.addEventListener("click", () => closeModal("doctor-modal"));
  document.getElementById("doctor-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "doctor-modal") closeModal("doctor-modal");
  });
  document.getElementById("doctor-form")?.addEventListener("submit", handleSaveDoctor);
  document.getElementById("admin-schedules-back")?.addEventListener("click", () => {
    state.adminManagementDoctor = null;
    document.getElementById("admin-schedules-section")?.classList.add("hidden");
    loadAdminDoctors();
  });

  // إعادة عرض لوحة العيادة عند تجاوز فاصل الجدول/البطاقات
  if (window.matchMedia) {
    const adminBreakpoint = window.matchMedia("(max-width: 639px)");
    adminBreakpoint.addEventListener?.("change", () => {
      if (state.activeTab === "admin") loadAdminDashboard();
    });
  }

  // زر تبديل الوضع الداكن
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleDarkMode);

  // التبديل في نافذة المصادقة (دخول / تسجيل)
  document.getElementById("auth-switch-to-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAuthMode("register");
  });
  document.getElementById("auth-switch-to-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAuthMode("login");
  });

  // أزرار فتح وغلق النوافذ
  document.getElementById("open-auth-btn")?.addEventListener("click", () => {
    clearAuthError();
    openModal("auth-modal");
  });
  document.getElementById("close-auth-btn")?.addEventListener("click", () => {
    clearAuthError();
    closeModal("auth-modal");
  });
  document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

  document.getElementById("close-booking-btn")?.addEventListener("click", () => closeModal("booking-modal"));
  document.getElementById("cancel-booking-btn")?.addEventListener("click", () => closeModal("booking-modal"));

  // نافذة تأكيد الإلغاء
  document.getElementById("close-cancel-btn")?.addEventListener("click", () => closeModal("cancel-modal"));
  document.getElementById("dismiss-cancel-btn")?.addEventListener("click", () => closeModal("cancel-modal"));
  document.getElementById("confirm-cancel-btn")?.addEventListener("click", handleConfirmCancelAppointment);

  // نافذة إعادة الجدولة
  document.getElementById("close-reschedule-btn")?.addEventListener("click", () => closeModal("reschedule-modal"));
  document.getElementById("dismiss-reschedule-btn")?.addEventListener("click", () => closeModal("reschedule-modal"));
  document.getElementById("confirm-reschedule-btn")?.addEventListener("click", handleConfirmRescheduleAppointment);

  // نافذة الملف الشخصي
  document.getElementById("open-profile-btn")?.addEventListener("click", openProfileModal);
  document.getElementById("close-profile-btn")?.addEventListener("click", () => closeModal("profile-modal"));
  document.getElementById("profile-form")?.addEventListener("submit", handleSaveProfile);

  // نافذة إعدادات الاتصال
  document.getElementById("open-settings-btn")?.addEventListener("click", openSettingsModal);
  document.getElementById("close-settings-btn")?.addEventListener("click", () => closeModal("settings-modal"));
  document.getElementById("save-settings-form")?.addEventListener("submit", handleSaveSettings);

  // نماذج الإرسال
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("register-form")?.addEventListener("submit", handleRegister);
  document.getElementById("booking-form")?.addEventListener("submit", handleBookAppointment);

  // شريط البحث والتصفية
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderDoctors();
  });

  document.getElementById("specialization-filter")?.addEventListener("change", (e) => {
    state.selectedSpecialization = e.target.value;
    renderDoctors();
  });

  document.getElementById("sort-filter")?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderDoctors();
  });

  // إغلاق النوافذ المنبثقة بمفتاح Escape (وصولية لوحة المفاتيح)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openDialog = document.querySelector('[role="dialog"]:not(.hidden)');
    if (openDialog && openDialog.id) closeModal(openDialog.id);
  });

  // إغلاق النافذة عند النقر على الخلفية المعتمة خارج المحتوى
  document.querySelectorAll('[role="dialog"]').forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });
}

// فحص وجود المفاتيح وتنبيه المستخدم
function checkConfigBanner() {
  const { anonKey } = getSupabaseConfig();
  const banner = document.getElementById("config-banner");
  if (!banner) return;

  if (!anonKey || anonKey.includes("placeholder")) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

// تبديل واجهة المصادقة
function toggleAuthMode(mode) {
  clearAuthError();
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const title = document.getElementById("auth-modal-title");

  if (mode === "register") {
    loginSection?.classList.add("hidden");
    registerSection?.classList.remove("hidden");
    if (title) title.textContent = "إنشاء حساب مريض جديد";
  } else {
    registerSection?.classList.add("hidden");
    loginSection?.classList.remove("hidden");
    if (title) title.textContent = "تسجيل الدخول إلى حسابك";
  }
}

// عرض رسالة خطأ واضحة داخل نافذة المصادقة
function showAuthError(msg) {
  const box = document.getElementById("auth-inline-error");
  const textEl = document.getElementById("auth-inline-error-text");
  if (box && textEl) {
    textEl.textContent = msg;
    box.classList.remove("hidden");
  }
  showToast(msg, "error");
}

// مسح رسالة الخطأ من نافذة المصادقة
function clearAuthError() {
  const box = document.getElementById("auth-inline-error");
  const textEl = document.getElementById("auth-inline-error-text");
  if (box) box.classList.add("hidden");
  if (textEl) textEl.textContent = "";
}

// تهيئة والتحكم في الوضع الداكن (Dark Mode)
function initDarkMode() {
  const isDark =
    localStorage.getItem("pulsecare_theme") === "dark" ||
    (!("pulsecare_theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  applyDarkMode(isDark);
}

function toggleDarkMode() {
  const isDark = !document.documentElement.classList.contains("dark");
  localStorage.setItem("pulsecare_theme", isDark ? "dark" : "light");
  applyDarkMode(isDark);
}

function applyDarkMode(isDark) {
  const darkIcon = document.getElementById("theme-toggle-dark-icon");
  const lightIcon = document.getElementById("theme-toggle-light-icon");

  if (isDark) {
    document.documentElement.classList.add("dark");
    darkIcon?.classList.add("hidden");
    lightIcon?.classList.remove("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    lightIcon?.classList.add("hidden");
    darkIcon?.classList.remove("hidden");
  }
}

// التبديل بين التبويبات (الأطباء / حجوزاتي / لوحة الإدارة)
function switchTab(tab) {
  state.activeTab = tab;
  const doctorsView = document.getElementById("doctors-view");
  const appointmentsView = document.getElementById("appointments-view");
  const adminView = document.getElementById("admin-view");

  const tabDocBtn = document.getElementById("tab-doctors-btn");
  const tabAppBtn = document.getElementById("tab-appointments-btn");
  const tabAdminBtn = document.getElementById("tab-admin-btn");
  const mobDocBtn = document.getElementById("mobile-tab-doctors");
  const mobAppBtn = document.getElementById("mobile-tab-appointments");

  // إخفاء كل الواجهات
  doctorsView?.classList.add("hidden");
  appointmentsView?.classList.add("hidden");
  adminView?.classList.add("hidden");

  // إعادة ضبط ألوان الأزرار
  [tabDocBtn, tabAppBtn, tabAdminBtn].forEach((btn) => {
    btn?.classList.remove("bg-teal-600", "text-white", "bg-purple-600");
    btn?.classList.add("text-slate-700", "dark:text-slate-300");
  });

  if (tab === "doctors") {
    doctorsView?.classList.remove("hidden");
    tabDocBtn?.classList.add("bg-sage-600", "text-white");
    tabDocBtn?.classList.remove("text-slate-700", "dark:text-slate-300");

    mobDocBtn?.classList.add("text-sage-600", "dark:text-sage-400", "font-bold");
    mobDocBtn?.classList.remove("text-slate-500", "dark:text-slate-400", "opacity-70");
    mobAppBtn?.classList.remove("text-sage-600", "dark:text-sage-400", "font-bold");
    mobAppBtn?.classList.add("text-slate-500", "dark:text-slate-400", "opacity-70");
  } else if (tab === "appointments") {
    if (!state.currentUser) {
      showToast("يرجى تسجيل الدخول أولاً لمشاهدة حجوزاتك", "warning");
      openModal("auth-modal");
      return;
    }
    appointmentsView?.classList.remove("hidden");
    tabAppBtn?.classList.add("bg-sage-600", "text-white");
    tabAppBtn?.classList.remove("text-slate-700", "dark:text-slate-300");

    mobAppBtn?.classList.add("text-sage-600", "dark:text-sage-400", "font-bold");
    mobAppBtn?.classList.remove("text-slate-500", "dark:text-slate-400", "opacity-70");
    mobDocBtn?.classList.remove("text-sage-600", "dark:text-sage-400", "font-bold");
    mobDocBtn?.classList.add("text-slate-500", "dark:text-slate-400", "opacity-70");

    fetchPatientAppointments();
  } else if (tab === "admin") {
    adminView?.classList.remove("hidden");
    tabAdminBtn?.classList.add("bg-purple-600", "text-white");
    tabAdminBtn?.classList.remove("text-slate-700", "dark:text-slate-300");
    configureAdminScope();
    loadAdminDashboard();
  }
}

// تكييف لوحة العيادة حسب دور المستخدم (طبيب = أجندة خاصة / مشرف = لوحة كاملة)
function configureAdminScope() {
  const role = state.currentUser?.profile?.role || "patient";
  const isDoctor = role === "doctor";
  const titleEl = document.getElementById("admin-view-title");
  const subtitleEl = document.getElementById("admin-view-subtitle");
  const doctorFilter = document.getElementById("admin-doctor-filter");
  const appointmentsSubBtn = document.getElementById("admin-sub-appointments");
  const accountsSubBtn = document.getElementById("admin-sub-accounts");
  const managementSubBtn = document.getElementById("admin-sub-management");

  if (titleEl) titleEl.textContent = isDoctor ? "أجندتي الطبية" : "لوحة الإدارة والعيادة";
  if (subtitleEl) {
    subtitleEl.textContent = isDoctor
      ? "تعرض هذه اللوحة مواعيدك الخاصة فقط وتحديث الحالات (مكتمل / غياب / إلغاء)"
      : "متابعة كافة حجوزات المرضى وإدارة الأطباء والمواعيد والحسابات";
  }
  doctorFilter?.classList.toggle("hidden", isDoctor);
  if (appointmentsSubBtn) appointmentsSubBtn.textContent = isDoctor ? "أجندتي" : "سجل الحجوزات";
  managementSubBtn?.classList.toggle("hidden", false);
  accountsSubBtn?.classList.toggle("hidden", isDoctor);
  switchAdminSub("appointments");
}

// التبديل بين أقسام لوحة العيادة (سجل الحجوزات / الأطباء والمواعيد / الحسابات والأدوار)
function switchAdminSub(tab) {
  state.adminSubTab = tab;
  const panels = {
    appointments: "admin-appointments-panel",
    management: "admin-management-panel",
    accounts: "admin-accounts-panel"
  };
  Object.entries(panels).forEach(([key, panelId]) => {
    document.getElementById(panelId)?.classList.toggle("hidden", key !== tab);
  });
  Object.entries({
    appointments: "admin-sub-appointments",
    management: "admin-sub-management",
    accounts: "admin-sub-accounts"
  }).forEach(([key, btnId]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.className = key === tab
      ? "px-4 py-2 rounded-xl text-xs font-bold transition bg-purple-600 text-white shadow-sm whitespace-nowrap"
      : "px-4 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap";
  });
  initLucideIcons();
}

// جلب وعرض بيانات لوحة تحكم العيادة والإدارة (فلترة وترقيم من الخادم)
async function loadAdminDashboard() {
  if (!document.getElementById("admin-appointments-tbody")) return;

  renderAdminChips();
  populateAdminDoctorSelect();
  syncAdminDateInputs();
  syncAdminTodayToggle();
  syncAdminSortSelect();
  renderAdminPagination(true);
  showAdminLoading();

  try {
    const [stats, result] = await Promise.all([
      getAdminStats(),
      getAdminAppointments(buildAdminParams())
    ]);
    const list = result.rows || [];
    state.adminRowsCache = list;
    state.adminTotal = result.total || 0;

    document.getElementById("stat-total-appointments").textContent = stats.total;
    document.getElementById("stat-today-appointments").textContent = stats.today;
    document.getElementById("stat-booked-appointments").textContent = stats.booked;
    document.getElementById("stat-completed-appointments").textContent = stats.completed;
    document.getElementById("stat-cancelled-appointments").textContent = stats.cancelled;
    document.getElementById("stat-noshow-appointments").textContent = stats.noShow;

    renderAdminRows(list);
  } catch (err) {
    console.error("Admin load error:", err);
    renderAdminError(err.message);
  }
  renderAdminPagination();
}

// هل نعرض لوحة العيادة كبطاقات على الشاشات الصغيرة؟
function adminMobileView() {
  return typeof window.matchMedia === "function" && window.matchMedia("(max-width: 639px)").matches;
}

// إظهار/إخفاء الجدول أو قائمة البطاقات حسب حجم الشاشة
function setAdminViewMode() {
  const isMobile = adminMobileView();
  document.getElementById("admin-table-wrap")?.classList.toggle("hidden", isMobile);
  document.getElementById("admin-mobile-list")?.classList.toggle("hidden", !isMobile);
  return isMobile;
}

// مؤشر تحميل يتناسب مع الوضع الحالي (جدول أو بطاقات)
function showAdminLoading() {
  if (setAdminViewMode()) {
    document.getElementById("admin-mobile-list").innerHTML = `
      <div class="flex items-center justify-center gap-2 p-8 text-slate-400 text-sm">
        <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        جاري تحميل سجلات العيادة...
      </div>`;
  } else {
    document.getElementById("admin-appointments-tbody").innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400">
          <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          جاري تحميل سجلات العيادة...
        </td>
      </tr>`;
  }
}

// عرض الحجوزات في القالب الأنسب لحجم الشاشة
function renderAdminRows(list) {
  if (setAdminViewMode()) {
    document.getElementById("admin-mobile-list").innerHTML = list.length
      ? list.map(renderAdminMobileCard).join("")
      : `<div class="p-8 text-center text-slate-400 text-sm">لا توجد حجوزات مطابقة للعرض الحالي</div>`;
    return;
  }
  document.getElementById("admin-appointments-tbody").innerHTML = list.length
    ? list.map(renderAdminRow).join("")
    : `<tr><td colspan="6" class="p-8 text-center text-slate-400">لا توجد حجوزات مطابقة للعرض الحالي</td></tr>`;
}

// رسالة خطأ في القالب النشط
function renderAdminError(message) {
  const safeMessage = escapeHtml(message);
  if (setAdminViewMode()) {
    document.getElementById("admin-mobile-list").innerHTML = `
      <div class="p-8 text-center text-rose-500 text-sm">تعذر جلب سجلات الإدارة: ${safeMessage}</div>`;
  } else {
    document.getElementById("admin-appointments-tbody").innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-rose-500">تعذر جلب سجلات الإدارة: ${safeMessage}</td>
      </tr>`;
  }
}

// بطاقة حجز واحدة (شاشات صغيرة)
function renderAdminMobileCard(app) {
  const actions = app.status === "booked"
    ? `
      <div class="grid grid-cols-3 gap-2 mt-3">
        <button onclick="window.handleAdminStatusChange('${app.appointment_id}', 'completed')" title="حضر واكتمل الكشف" class="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-xs transition">اكتمل</button>
        <button onclick="window.handleAdminStatusChange('${app.appointment_id}', 'no_show')" title="لم يحضر المريض" class="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs transition">لم يحضر</button>
        <button onclick="window.requestClinicCancel('${app.appointment_id}')" title="إلغاء الحجز من العيادة" class="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl font-bold text-xs transition">إلغاء</button>
      </div>`
    : `<p class="text-xs text-slate-400 mt-3">لا توجد إجراءات متاحة لهذا الموعد</p>`;

  return `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-bold text-slate-900 dark:text-white text-sm">${escapeHtml(app.patient_name)}</p>
          <p class="text-xs text-slate-500 font-mono" dir="ltr">${escapeHtml(app.patient_phone)}</p>
        </div>
        ${getStatusBadge(app.status)}
      </div>
      <div class="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <p>الطبيب: <span class="font-semibold">${escapeHtml(app.doctor_name)}</span></p>
        <p>الموعد: <span class="font-semibold">${formatArabicDate(app.available_date)} (${formatTime(app.start_time)})</span></p>
      </div>
      ${actions}
    </div>`;
}

// صف حجز واحد داخل الجدول (شاشات متوسطة فأكبر)
function renderAdminRow(app) {
  return `
    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
      <td class="p-4 font-bold text-slate-900 dark:text-white">${escapeHtml(app.patient_name)}</td>
      <td class="p-4 font-mono text-xs" dir="ltr">${escapeHtml(app.patient_phone)}</td>
      <td class="p-4 font-medium">${escapeHtml(app.doctor_name)}</td>
      <td class="p-4">${formatArabicDate(app.available_date)} (${formatTime(app.start_time)})</td>
      <td class="p-4">${getStatusBadge(app.status)}</td>
      <td class="p-4 text-center">
        ${
          app.status === "booked"
            ? `
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="window.handleAdminStatusChange('${app.appointment_id}', 'completed')" title="حضر واكتمل الكشف" class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg font-bold text-xs transition">
              اكتمل
            </button>
            <button onclick="window.handleAdminStatusChange('${app.appointment_id}', 'no_show')" title="لم يحضر المريض" class="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg font-bold text-xs transition">
              لم يحضر
            </button>
            <button onclick="window.requestClinicCancel('${app.appointment_id}')" title="إلغاء الحجز من العيادة" class="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg font-bold text-xs transition">
              إلغاء العيادة
            </button>
          </div>
        `
            : `<span class="text-xs text-slate-400">-</span>`
        }
      </td>
    </tr>`;
}

// تجميع معاملات الفلترة والترقيم لطلب الخادم
function buildAdminParams() {
  const f = state.adminFilters;
  const statuses = f.status === "cancelled"
    ? ["cancelled_by_patient", "cancelled_by_clinic"]
    : f.status === "all" ? null : [f.status];
  return {
    statuses,
    doctorId: f.doctorId || undefined,
    dateFrom: f.dateFrom || undefined,
    dateTo: f.dateTo || undefined,
    search: f.search || undefined,
    page: state.adminPage,
    pageSize: state.adminPageSize,
    sortBy: f.sortBy,
    sortDir: f.sortDir
  };
}

// إبراز شريحة الحالة المحددة
function renderAdminChips() {
  document.querySelectorAll("[data-admin-status]").forEach((chip) => {
    const active = chip.dataset.adminStatus === state.adminFilters.status;
    chip.className = active
      ? "admin-status-chip px-3 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap bg-purple-600 text-white border-purple-600 shadow-sm"
      : "admin-status-chip px-3 py-1.5 rounded-xl text-xs font-bold border border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap";
  });
}

// ملء قائمة الأطباء في الفلتر بمرة واحدة
function populateAdminDoctorSelect() {
  const sel = document.getElementById("admin-doctor-filter");
  if (!sel || sel.dataset.populated) return;
  const options = state.doctors
    .map((d) => `<option value="${d.id}">${d.name}</option>`)
    .join("");
  sel.innerHTML = `<option value="">كل الأطباء (${state.doctors.length})</option>${options}`;
  sel.value = state.adminFilters.doctorId || "";
  sel.dataset.populated = "1";
}

// مزامنة حقول التاريخ مع حالة الفلترة
function syncAdminDateInputs() {
  const from = document.getElementById("admin-date-from");
  const to = document.getElementById("admin-date-to");
  if (from) from.value = state.adminFilters.dateFrom || "";
  if (to) to.value = state.adminFilters.dateTo || "";
}

// مزامنة حالة زر (اليوم)
function syncAdminTodayToggle() {
  const btn = document.getElementById("admin-today-toggle");
  if (!btn) return;
  btn.className = state.adminTodayActive
    ? "px-4 py-2.5 rounded-xl border border-purple-600 bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
    : "px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 text-xs font-bold transition flex items-center gap-1.5";
}

// مزامنة قائمة الترتيب مع حالة الفلترة
function syncAdminSortSelect() {
  const sel = document.getElementById("admin-sort");
  if (sel) sel.value = `${state.adminFilters.sortBy}_${state.adminFilters.sortDir}`;
}

// تحديث شريط ترقيم الصفحات
function renderAdminPagination(loading) {
  const info = document.getElementById("admin-pagination-info");
  const prev = document.getElementById("admin-prev-btn");
  const next = document.getElementById("admin-next-btn");
  if (!info) return;
  if (loading) {
    info.textContent = "جاري التحميل...";
    prev?.setAttribute("disabled", "disabled");
    next?.setAttribute("disabled", "disabled");
    return;
  }
  const { total, pageSize, adminPage: page } = state;
  if (total === 0) {
    info.textContent = "0 - 0 من 0";
  } else {
    const from = page * pageSize + 1;
    const to = Math.min(total, from + pageSize - 1);
    info.textContent = `${from} - ${to} من ${total}`;
  }
  prev?.toggleAttribute("disabled", page <= 0);
  next?.toggleAttribute("disabled", (page + 1) * pageSize >= total);
}

// تغيير حالة الحجز من لوحة الإدارة (مع تأكيد للغياب وحماية من التكرار)
window.handleAdminStatusChange = async function (appointmentId, status) {
  if (state.adminActionBusy) return;
  if (status === "no_show") {
    window.showAdminConfirm({
      title: "تسجيل غياب المريض",
      message: "سيتم اعتبار هذا الحجز (لم يحضر) ولن يمكن التراجع عنه بعد التأكيد.",
      confirmLabel: "تأكيد الغياب",
      tone: "amber",
      icon: "user-x",
      action: () => runAdminStatusUpdate(appointmentId, status)
    });
    return;
  }
  await runAdminStatusUpdate(appointmentId, status);
};

async function runAdminStatusUpdate(appointmentId, status) {
  state.adminActionBusy = true;
  try {
    await updateAppointmentState(appointmentId, status);
    showToast("تم تحديث حالة الحجز بنجاح", "success");
    loadAdminDashboard();
  } catch (err) {
    console.error("Status update error:", err);
    showToast(`تعذر التحديث: ${err.message}`, "error");
  } finally {
    state.adminActionBusy = false;
  }
}

// طلب إلغاء الحجز من العيادة (يتطلب تأكيداً ويحرّر الموعد)
window.requestClinicCancel = function (appointmentId) {
  if (state.adminActionBusy) return;
  const patientName = state.adminRowsCache.find((a) => a.appointment_id === appointmentId)?.patient_name || "المريض";
  window.showAdminConfirm({
    title: "إلغاء الحجز من العيادة",
    message: `سيتم إلغاء موعد ${patientName} وإتاحة الموعد مجدداً أمام المرضى الآخرين.`,
    confirmLabel: "تأكيد الإلغاء",
    tone: "rose",
    icon: "calendar-x",
    action: async () => {
      state.adminActionBusy = true;
      try {
        await cancelAppointmentClinic(appointmentId);
        showToast("تم إلغاء الحجز وإتاحة الموعد", "success");
        loadAdminDashboard();
      } catch (err) {
        console.error("Clinic cancel error:", err);
        showToast(`تعذر الإلغاء: ${err.message}`, "error");
      } finally {
        state.adminActionBusy = false;
      }
    }
  });
};

// نافذة تأكيد عامة لإجراءات العيادة
window.showAdminConfirm = function ({ title, message, confirmLabel = "تأكيد", tone = "amber", icon = "alert-triangle", action }) {
  const modal = document.getElementById("admin-confirm-modal");
  if (!modal) return;
  document.getElementById("admin-confirm-title").textContent = title;
  document.getElementById("admin-confirm-message").textContent = message;
  document.getElementById("admin-confirm-ok").textContent = confirmLabel;

  const tones = {
    amber: "bg-amber-500 hover:bg-amber-600",
    rose: "bg-rose-500 hover:bg-rose-600",
    purple: "bg-purple-600 hover:bg-purple-700",
    emerald: "bg-emerald-500 hover:bg-emerald-600"
  };
  const iconTones = {
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
    purple: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
  };

  document.getElementById("admin-confirm-ok").className =
    `w-1/2 py-3 ${tones[tone] || tones.amber} text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2`;

  const iconEl = document.getElementById("admin-confirm-icon");
  iconEl.className = `w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${iconTones[tone] || iconTones.amber}`;
  iconEl.innerHTML = `<i data-lucide="${icon}" class="w-6 h-6"></i>`;

  modal.dataset.action = "pending";
  window.adminConfirmAction = action || null;
  openModal("admin-confirm-modal");
  initLucideIcons();
};

window.closeAdminConfirm = function () {
  window.adminConfirmAction = null;
  closeModal("admin-confirm-modal");
};

function confirmAdminAction() {
  const action = window.adminConfirmAction;
  window.closeAdminConfirm();
  if (typeof action === "function") action();
}

// ============================================================================
// لوحة إدارة الأطباء والمواعيد والحسابات (المشرف) + إدارة الطبيب لمواعيده
// ============================================================================

// تحميل لوحة الإدارة حسب الدور: مشرف (أطباء + مواعيد) أو طبيب (مواعيده فقط)
async function loadManagementPanel() {
  const role = state.currentUser?.profile?.role || "patient";
  const isDoctor = role === "doctor";
  const doctorsSection = document.getElementById("admin-doctors-section");
  const schedulesSection = document.getElementById("admin-schedules-section");
  const backBtn = document.getElementById("admin-schedules-back");
  const managerEl = document.getElementById("admin-schedule-manager");

  doctorsSection?.classList.toggle("hidden", isDoctor);
  if (managerEl) managerEl.innerHTML = "";

  try {
    if (isDoctor) {
      backBtn?.classList.add("hidden");
      schedulesSection?.classList.remove("hidden");
      const myDoctor = await findDoctorByUser(state.currentUser.id);
      if (!myDoctor) {
        document.getElementById("admin-schedule-manager").innerHTML = `
          <p class="p-8 text-center text-slate-400 text-sm">لم يُربط حسابك بأي طبيب بعد — راجع إدارة العيادة.</p>`;
        return;
      }
      state.adminManagementDoctor = myDoctor.id;
      document.getElementById("admin-schedules-title").textContent = "إدارة مواعيدي المتاحة";
      await loadSchedulesManager(myDoctor.id);
    } else {
      backBtn?.classList.remove("hidden");
      await loadAdminDoctors();
      if (state.adminManagementDoctor) {
        schedulesSection?.classList.remove("hidden");
        await loadSchedulesManager(state.adminManagementDoctor);
      } else {
        schedulesSection?.classList.add("hidden");
      }
    }
  } catch (err) {
    console.error("Management load error:", err);
    if (managerEl) managerEl.innerHTML = `<p class="p-8 text-center text-rose-500 text-sm">تعذر تحميل اللوحة: ${escapeHtml(err.message)}</p>`;
  }
  initLucideIcons();
}

// قائمة الأطباء مع الحسابات المرتبطة (للمشرف)
async function loadAdminDoctors() {
  const listEl = document.getElementById("admin-doctors-list");
  if (!listEl) return;
  listEl.innerHTML = `
    <div class="col-span-full flex items-center justify-center gap-2 p-8 text-slate-400 text-sm">
      <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      جاري تحميل الأطباء...
    </div>`;
  try {
    const [profiles, doctors] = await Promise.all([adminListProfiles(), listDoctors()]);
    state.adminAccountsCache = profiles;
    state.adminDoctorsCache = doctors;
    listEl.innerHTML = doctors.length
      ? doctors.map((d) => renderManagementDoctorCard(d, profiles)).join("")
      : `<div class="col-span-full p-8 text-center text-slate-400 text-sm">لا يوجد أطباء بعد. أضف أول طبيب من زر (إضافة طبيب).</div>`;
  } catch (err) {
    console.error("Doctors load error:", err);
    listEl.innerHTML = `<div class="col-span-full p-8 text-center text-rose-500 text-sm">تعذر جلب الأطباء: ${escapeHtml(err.message)}</div>`;
  }
}

// بطاقة طبيب واحدة في لوحة الإدارة
function renderManagementDoctorCard(doc, profiles) {
  const linked = profiles.find((p) => p.user_id === doc.user_id);
  const linkLabel = linked
    ? `<span class="font-semibold text-slate-700 dark:text-slate-200">${escapeHtml(linked.full_name || "\u2014")}</span> <span class="font-mono text-xs text-slate-400" dir="ltr">${escapeHtml(linked.email || "")}</span>`
    : `<span class="text-slate-400">\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637</span>`;
  return `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 flex flex-col gap-3">
      <div class="flex items-start justify-between gap-3">
        <div class="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
          ${escapeHtml(doc.name).replace("\u062F. ", "").charAt(0)}
        </div>
        ${doc.user_id
          ? `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">\u0645\u0631\u062A\u0628\u0637</span>`
          : `<span class="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">\u0628\u062F\u0648\u0646 \u062D\u0633\u0627\u0628</span>`}
      </div>
      <div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtml(doc.name)}</h4>
        <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(doc.specialization)} \u00b7 <span class="text-teal-600 dark:text-teal-400 font-bold">${doc.consultation_fee} \u0631.\u0633</span></p>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">\u0627\u0644\u062D\u0633\u0627\u0628: ${linkLabel}</p>
      <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onclick="window.manageDoctorSchedules('${doc.id}')" class="flex-1 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-xs transition">\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F</button>
        <button onclick="window.openDoctorModal('${doc.id}')" class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition">\u062A\u0639\u062F\u064A\u0644</button>
        <button onclick="window.requestDeleteDoctor('${doc.id}')" class="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl font-bold text-xs transition">\u062D\u0630\u0641</button>
      </div>
    </div>`;
}

// فتح إدارة مواعيد طبيب محدد (للمشرف)
window.manageDoctorSchedules = function (doctorId) {
  state.adminManagementDoctor = doctorId;
  const doc = state.adminDoctorsCache.find((d) => d.id === doctorId);
  const name = doc ? doc.name : "طبيب";
  const titleEl = document.getElementById("admin-schedules-title");
  if (titleEl) titleEl.innerHTML = `المواعيد المتاحة — <span class="text-purple-600 dark:text-purple-400">${escapeHtml(name)}</span>`;
  document.getElementById("admin-schedules-section")?.classList.remove("hidden");
  loadSchedulesManager(doctorId);
};

// إدارة المواعيد المتاحة لطبيب (نماذج صغيرة مسطحة بلا تداخل)
async function loadSchedulesManager(doctorId) {
  const managerEl = document.getElementById("admin-schedule-manager");
  if (!managerEl) return;
  managerEl.innerHTML = `
    <div class="flex items-center justify-center gap-2 p-8 text-slate-400 text-sm">
      <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      جاري تحميل المواعيد...
    </div>`;
  try {
    const schedules = await listDoctorSchedules(doctorId);
    managerEl.innerHTML = `
      <form id="schedule-add-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4">
        <div>
          <label for="schedule-date" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">التاريخ</label>
          <input id="schedule-date" type="date" min="${localDateISO()}" required class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
        </div>
        <div>
          <label for="schedule-start" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">البداية</label>
          <input id="schedule-start" type="time" required class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
        </div>
        <div>
          <label for="schedule-end" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">النهاية</label>
          <input id="schedule-end" type="time" required class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
        </div>
        <button type="submit" class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5">
          <i data-lucide="plus" class="w-4 h-4"></i> إضافة موعد
        </button>
      </form>
      <div id="schedule-slots" class="mt-4 space-y-2">${renderScheduleSlots(schedules)}</div>`;
    document.getElementById("schedule-add-form")?.addEventListener("submit", (e) => addScheduleSlot(e, doctorId));
    initLucideIcons();
  } catch (err) {
    console.error("Schedules load error:", err);
    managerEl.innerHTML = `<p class="p-8 text-center text-rose-500 text-sm">تعذر تحميل المواعيد: ${escapeHtml(err.message)}</p>`;
  }
}

// قائمة المواعيد المرتبة (كل طبيب/تاريخ/وقت)
function renderScheduleSlots(schedules) {
  if (!schedules.length) {
    return `<p class="text-center text-slate-400 text-sm py-8">لا توجد مواعيد متاحة مسجلة لهذا الطبيب</p>`;
  }
  const today = localDateISO();
  return schedules
    .map((s) => {
      const locked = s.is_booked;
      const isPast = s.available_date < today;
      return `
        <div class="flex items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold ${s.available_date === today ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-slate-100"}">${formatArabicDate(s.available_date)}</span>
            <span class="text-xs text-slate-500 font-mono" dir="ltr">${formatTime(s.start_time)} - ${formatTime(s.end_time)}</span>
          </div>
          <div class="flex items-center gap-2">
            ${s.is_booked
              ? `<span class="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 font-bold">محجوز</span>`
              : `<span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 font-bold">متاح</span>`}
            ${!locked && !isPast
              ? `<button onclick="window.requestDeleteSchedule('${s.id}')" title="حذف الموعد" class="px-2 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-lg text-xs font-bold transition">حذف</button>`
              : ""}
          </div>
        </div>`;
    })
    .join("");
}

// إضافة موعد متاح (التحقق المحلي قبل الإرسال)
async function addScheduleSlot(e, doctorId) {
  e.preventDefault();
  const date = document.getElementById("schedule-date")?.value || "";
  const start = document.getElementById("schedule-start")?.value || "";
  const end = document.getElementById("schedule-end")?.value || "";
  if (!date || !start || !end) return;
  if (start >= end) {
    showToast("وقت النهاية يجب أن يكون بعد وقت البداية", "warning");
    return;
  }
  try {
    await createDoctorSchedule({ doctorId, availableDate: date, startTime: start, endTime: end });
    showToast("تم إضافة الموعد المتاح بنجاح", "success");
    loadSchedulesManager(doctorId);
  } catch (err) {
    const msg = /unique|23505/i.test(err.message)
      ? "يوجد موعد مكرر لنفس الطبيب والتاريخ والوقت"
      : `تعذر الإضافة: ${err.message}`;
    showToast(msg, "error");
  }
}

// حذف موعد متاح (غير محجوز فقط)
window.requestDeleteSchedule = function (scheduleId) {
  if (state.adminActionBusy) return;
  window.showAdminConfirm({
    title: "حذف الموعد المتاح",
    message: "سيتم حذف هذا الموعد من جدول الطبيب. لا يمكن حذف المواعيد المحجوزة.",
    confirmLabel: "تأكيد الحذف",
    tone: "rose",
    icon: "trash-2",
    action: async () => {
      state.adminActionBusy = true;
      try {
        await deleteDoctorSchedule(scheduleId);
        showToast("تم حذف الموعد المتاح", "success");
        if (state.adminManagementDoctor) loadSchedulesManager(state.adminManagementDoctor);
      } catch (err) {
        console.error("Schedule delete error:", err);
        showToast(`تعذر الحذف: ${err.message}`, "error");
      } finally {
        state.adminActionBusy = false;
      }
    }
  });
};

// حذف طبيب (المشرف) مع رسالة واضحة عند وجود حجوزات
window.requestDeleteDoctor = function (doctorId) {
  if (state.adminActionBusy) return;
  const doc = state.adminDoctorsCache.find((d) => d.id === doctorId);
  const name = doc ? doc.name : "طبيب";
  window.showAdminConfirm({
    title: "حذف الطبيب",
    message: `سيتم حذف ${name} ومواعيده المتاحة. لا يمكن الحذف إذا كانت للمواعيد حجوزات مسجلة.`,
    confirmLabel: "تأكيد الحذف",
    tone: "rose",
    icon: "user-x",
    action: async () => {
      state.adminActionBusy = true;
      try {
        await deleteDoctor(doctorId);
        showToast("تم حذف الطبيب بنجاح", "success");
        if (state.adminManagementDoctor === doctorId) {
          state.adminManagementDoctor = null;
          document.getElementById("admin-schedules-section")?.classList.add("hidden");
        }
        await loadAdminDoctors();
      } catch (err) {
        const msg = /foreign key|23503|appointments|exists/i.test(err.message)
          ? "لا يمكن حذف الطبيب لوجود حجوزات مسجلة لأحد مواعيده"
          : `تعذر الحذف: ${err.message}`;
        showToast(msg, "error");
      } finally {
        state.adminActionBusy = false;
      }
    }
  });
};

// فتح نافذة إضافة / تعديل طبيب (للمشرف)
window.openDoctorModal = async function (doctorId) {
  if (state.adminActionBusy) return;
  const doctor = doctorId ? state.adminDoctorsCache.find((d) => d.id === doctorId) || null : null;
  const profiles = state.adminAccountsCache.length ? state.adminAccountsCache : await adminListProfiles();
  state.adminAccountsCache = profiles;

  const linkedIds = state.adminDoctorsCache
    .filter((d) => d.user_id && d.user_id !== (doctor?.user_id || null))
    .map((d) => d.user_id);

  const options = [`<option value="">بدون حساب مرتبط</option>`].concat(
    profiles
      .filter((p) => !linkedIds.includes(p.user_id))
      .map((p) => `<option value="${p.user_id}" ${p.user_id === doctor?.user_id ? "selected" : ""}>${p.email || p.full_name || p.user_id}</option>`)
  ).join("");

  document.getElementById("doctor-modal-title").textContent = doctor ? "تعديل بيانات الطبيب" : "إضافة طبيب جديد";
  document.getElementById("doctor-name").value = doctor?.name || "";
  document.getElementById("doctor-specialization").value = doctor?.specialization || "";
  document.getElementById("doctor-fee").value = doctor?.consultation_fee ?? "";
  document.getElementById("doctor-link-user").innerHTML = options;
  state.editingDoctorId = doctor?.id || null;

  const errorBox = document.getElementById("doctor-form-error");
  errorBox?.classList.add("hidden");
  openModal("doctor-modal");
};

// حفظ بيانات الطبيب (إضافة أو تعديل)
async function handleSaveDoctor(e) {
  e.preventDefault();
  const errBox = document.getElementById("doctor-form-error");
  const errText = document.getElementById("doctor-form-error-text");
  const name = document.getElementById("doctor-name").value.trim();
  const specialization = document.getElementById("doctor-specialization").value.trim();
  const fee = parseFloat(document.getElementById("doctor-fee").value);
  const userId = document.getElementById("doctor-link-user").value || null;

  const showError = (msg) => {
    if (errText) errText.textContent = msg;
    errBox?.classList.remove("hidden");
  };

  if (!name || !specialization) {
    showError("يرجى إدخال اسم الطبيب والتخصص");
    return;
  }
  if (!fee || fee <= 0) {
    showError("يرجى إدخال رسوم كشف صحيحة أكبر من صفر");
    return;
  }

  const btn = document.getElementById("save-doctor-btn");
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>جاري الحفظ...`;

  try {
    await saveDoctor({ id: state.editingDoctorId, name, specialization, consultationFee: fee, userId });
    showToast("تم حفظ بيانات الطبيب بنجاح", "success");
    closeModal("doctor-modal");
    await loadAdminDoctors();
  } catch (err) {
    console.error("Doctor save error:", err);
    const msg = /unique|23505|uq_doctors_user_id/i.test(err.message)
      ? "هذا الحساب مرتبط بطبيب آخر مسبقاً — اختر حساباً آخر"
      : `تعذر الحفظ: ${err.message}`;
    showToast(msg, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

// ============================================================================
// لوحة الحسابات والأدوار (للمشرف فقط)
// ============================================================================

async function loadAccountsPanel() {
  const container = document.getElementById("admin-accounts-list");
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-center gap-2 p-8 text-slate-400 text-sm">
      <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      جاري تحميل الحسابات...
    </div>`;
  try {
    const profiles = await adminListProfiles();
    state.adminAccountsCache = profiles;
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs text-slate-700 dark:text-slate-300">
          <thead class="text-slate-500 font-semibold">
            <tr>
              <th class="p-3">الاسم</th>
              <th class="p-3">البريد</th>
              <th class="p-3">الهاتف</th>
              <th class="p-3">الدور</th>
              <th class="p-3">تغيير الدور</th>
            </tr>
          </thead>
          <tbody>${profiles.map(renderAccountRow).join("")}</tbody>
        </table>
      </div>`;
  } catch (err) {
    console.error("Accounts load error:", err);
    container.innerHTML = `<p class="p-8 text-center text-rose-500 text-sm">تعذر تحميل الحسابات: ${escapeHtml(err.message)}</p>`;
  }
}

// شارة الدور ملونة بصرامة (معلومة وليست إعلاناً)
function getRoleBadge(role) {
  const map = {
    admin: `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">مشرف</span>`,
    doctor: `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">طبيب</span>`,
    patient: `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">مريض</span>`
  };
  return map[role] || map.patient;
}

function renderAccountRow(p) {
  const isSelf = state.currentUser?.id === p.user_id;
  const roleSelect = `
    <select ${isSelf ? "disabled title=\"لا يمكن تغيير دور حسابك الحالي\"" : ""} onchange="window.adminChangeRole('${p.user_id}', this.value, this)" class="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 ${isSelf ? "opacity-50 cursor-not-allowed" : ""} transition">
      <option value="patient" ${p.role === "patient" ? "selected" : ""}>مريض</option>
      <option value="doctor" ${p.role === "doctor" ? "selected" : ""}>طبيب</option>
      <option value="admin" ${p.role === "admin" ? "selected" : ""}>مشرف</option>
    </select>`;
return `
    <tr class="border-t border-slate-100 dark:border-slate-800">
      <td class="p-3 font-bold text-slate-900 dark:text-white">${escapeHtml(p.full_name || "\u2014")}${isSelf ? ' <span class="text-xs text-teal-600 font-bold">(\u0623\u0646\u062A)</span>' : ""}</td>
      <td class="p-3 font-mono text-xs text-slate-500" dir="ltr">${escapeHtml(p.email || "")}</td>
      <td class="p-3 font-mono text-xs" dir="ltr">${escapeHtml(p.phone || "\u2014")}</td>
      <td class="p-3">${getRoleBadge(p.role)}</td>
      <td class="p-3">${roleSelect}</td>
    </tr>`;
}

// تغيير دور مستخدم من القائمة (يعيد القيمة عند الفشل)
window.adminChangeRole = async function (userId, role, sel) {
  if (sel.disabled || state.adminActionBusy) return;
  const prev = sel.value;
  state.adminActionBusy = true;
  try {
    await assignUserRole(userId, role);
    showToast("تم تحديث دور المستخدم بنجاح", "success");
    loadAccountsPanel();
  } catch (err) {
    console.error("Role change error:", err);
    sel.value = prev;
    showToast(`تعذر تغيير الدور: ${err.message}`, "error");
  } finally {
    state.adminActionBusy = false;
  }
};

// إدارة المستخدم الحالي
async function loadCurrentUser() {
  try {
    const user = await getCurrentUser();
    state.currentUser = user;
    renderUserUI();
  } catch (err) {
    console.error("Error loading user:", err);
    state.currentUser = null;
    renderUserUI();
  }
}

function renderUserUI() {
  const guestNav = document.getElementById("guest-nav");
  const userNav = document.getElementById("user-nav");
  const userNameEl = document.getElementById("user-display-name");
  const userRoleEl = document.getElementById("user-display-role");
  const tabAppBtn = document.getElementById("tab-appointments-btn");
  const tabAdminBtn = document.getElementById("tab-admin-btn");

  if (state.currentUser) {
    guestNav?.classList.add("hidden");
    userNav?.classList.remove("hidden");
    tabAppBtn?.classList.remove("opacity-50");

    const profile = state.currentUser.profile || {};
    const name = profile.full_name || state.currentUser.email?.split("@")[0] || "مريض";
    const role = profile.role || "patient";

    if (userNameEl) userNameEl.textContent = name;
    if (userRoleEl) userRoleEl.textContent = role === "patient" ? "مريض معتمد" : (role === "admin" ? "مدير النظام" : "طبيب معتمد");

    // إظهار تبويب الإدارة للأدمن أو الطبيب
    if (role === "admin" || role === "doctor") {
      tabAdminBtn?.classList.remove("hidden");
    } else {
      tabAdminBtn?.classList.add("hidden");
    }
  } else {
    guestNav?.classList.remove("hidden");
    userNav?.classList.add("hidden");
    tabAppBtn?.classList.add("opacity-50");
    tabAdminBtn?.classList.add("hidden");
  }
  initLucideIcons();
}

// جلب قائمة الأطباء والمواعيد مع Skeleton Loaders جذابة
async function fetchDoctors(showLoading = true) {
  const container = document.getElementById("doctors-container");
  if (showLoading && container) {
    container.innerHTML = `
      ${[1, 2, 3]
        .map(
          () => `
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div class="space-y-2">
                <div class="w-28 h-4 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                <div class="w-20 h-3 rounded-md bg-slate-200 dark:bg-slate-800"></div>
              </div>
            </div>
            <div class="w-16 h-8 rounded-md bg-slate-200 dark:bg-slate-800"></div>
          </div>
          <div class="space-y-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div class="w-24 h-3 rounded-md bg-slate-200 dark:bg-slate-800"></div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
              <div class="h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    `;
  }

  try {
    const doctors = await getDoctorsWithSchedules();
    state.doctors = doctors;
    populateSpecializations(doctors);
    renderDoctors();
  } catch (err) {
    console.error("Fetch doctors error:", err);
    if (container) {
      container.innerHTML = `
        <div class="col-span-full py-12 px-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl text-center">
          <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="alert-circle" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-rose-900 dark:text-rose-300 mb-1">تعذر تحميل بيانات الأطباء</h3>
          <p class="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto mb-4">${err.message || "يرجى التأكد من صحة إعدادات الاتصال بقاعدة البيانات."}</p>
          <button id="retry-fetch-btn" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
            إعادة المحاولة الآن
          </button>
        </div>
      `;
      initLucideIcons();
      document.getElementById("retry-fetch-btn")?.addEventListener("click", () => fetchDoctors(true));
    }
  }
}

function populateSpecializations(doctors) {
  const filterSelect = document.getElementById("specialization-filter");
  if (!filterSelect) return;

  const currentVal = filterSelect.value;
  const specs = Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean)));

  filterSelect.innerHTML = `<option value="all">جميع التخصصات</option>`;
  specs.forEach((spec) => {
    const opt = document.createElement("option");
    opt.value = spec;
    opt.textContent = spec;
    filterSelect.appendChild(opt);
  });

  if (specs.includes(currentVal)) {
    filterSelect.value = currentVal;
  }
}

// ألوان متناسقة لأفاتارات الأطباء
const doctorAvatarColors = [
  "from-teal-500 to-emerald-600 text-white",
  "from-blue-500 to-indigo-600 text-white",
  "from-cyan-500 to-sky-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white"
];

// عرض بطاقات الأطباء والمواعيد المتاحة المحسنة بالكامل
function renderDoctors() {
  const container = document.getElementById("doctors-container");
  if (!container) return;

  let filtered = state.doctors.filter((doc) => {
    const matchesSpec =
      state.selectedSpecialization === "all" || doc.specialization === state.selectedSpecialization;
    const matchesSearch =
      !state.searchQuery ||
      doc.name.toLowerCase().includes(state.searchQuery) ||
      doc.specialization?.toLowerCase().includes(state.searchQuery);
    return matchesSpec && matchesSearch;
  });

  // الترتيب حسب السعر
  if (state.sortBy === "fee-asc") {
    filtered.sort((a, b) => (Number(a.consultation_fee) || 0) - (Number(b.consultation_fee) || 0));
  } else if (state.sortBy === "fee-desc") {
    filtered.sort((a, b) => (Number(b.consultation_fee) || 0) - (Number(a.consultation_fee) || 0));
  }

  if (filtered.length === 0) {
    // لا يوجد أي أطباء في النظام بعد
    if (state.doctors.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
          <div class="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <i data-lucide="calendar-off" class="w-8 h-8"></i>
          </div>
          <h4 class="text-base font-bold text-slate-800 dark:text-white mb-1">لا يوجد أطباء متاحون حالياً</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">لم تتم إضافة أي أطباء إلى النظام بعد. يرجى المحاولة لاحقاً.</p>
        </div>
      `;
      initLucideIcons();
      return;
    }

    container.innerHTML = `
      <div class="col-span-full py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div class="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h4 class="text-base font-bold text-slate-800 dark:text-white mb-1">لم نجد أطباء مطابقين للبحث</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">جرب كتابة اسم مختلف أو تغيير التخصص في القائمة بالأعلى لتصفح الأطباء الآخرين.</p>
        <button onclick="window.resetDoctorFilters()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition">
          إعادة ضبط التصفية
        </button>
      </div>
    `;
    initLucideIcons();
    return;
  }

  const todayStr = localDateISO();

  container.innerHTML = filtered
    .map((doc, idx) => {
      const schedules = doc.available_schedules || [];
      const hasSchedules = schedules.length > 0;
      const avatarGradient = doctorAvatarColors[idx % doctorAvatarColors.length];
      const hasTodaySlot = schedules.some((s) => s.available_date === todayStr);

      // تجميع المواعيد حسب التاريخ لعرض التقويم المرئي
      const schedulesByDate = {};
      schedules.forEach((sch) => {
        if (!schedulesByDate[sch.available_date]) {
          schedulesByDate[sch.available_date] = [];
        }
        schedulesByDate[sch.available_date].push(sch);
      });

      return `
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-teal-200 dark:hover:border-teal-800/80 transition-all duration-300 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group">
          <div>
            <!-- رأس بطاقة الطبيب -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3.5">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center font-extrabold text-xl shadow-md shadow-slate-900/10">
                  ${doc.name.replace("د. ", "").charAt(0)}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug">${doc.name}</h3>
                  </div>
                  <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    ${doc.specialization || "طبيب عام"}
                  </span>
                </div>
              </div>
              <div class="text-left flex flex-col items-end">
                <span class="text-xs text-slate-400 block font-medium">رسوم الكشف</span>
                <span class="text-base font-extrabold text-teal-600 dark:text-teal-400 leading-tight">${doc.consultation_fee || 0} <span class="text-xs font-normal text-slate-400">ر.س</span></span>
                ${
                  hasTodaySlot
                    ? `<span class="mt-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        متاح اليوم
                      </span>`
                    : ""
                }
              </div>
            </div>

            <!-- قائمة المواعيد المتاحة بتقسيم التقويم المرئي -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"></i>
                  المواعيد المتاحة (${schedules.length})
                </span>
                <span class="text-xs text-slate-400">اختر موعداً للحجز</span>
              </div>

              ${
                hasSchedules
                  ? `
                  <div class="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    ${Object.entries(schedulesByDate)
                      .map(([dateKey, slots]) => {
                        return `
                        <div>
                          <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                            ${formatArabicDate(dateKey)}
                          </div>
                          <div class="grid grid-cols-2 gap-1.5">
                            ${slots
                              .map((sch) => {
                                const timeFormatted = formatTime(sch.start_time);
                                return `
                                <button
                                  onclick="window.selectSlotForBooking('${sch.id}', '${encodeURIComponent(doc.name)}', '${encodeURIComponent(doc.specialization || "")}', '${sch.available_date}', '${sch.start_time}', '${sch.end_time}', ${doc.consultation_fee || 0})"
                                  class="group p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/70 dark:hover:bg-teal-950/50 text-right transition flex items-center justify-between"
                                >
                                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-900 dark:group-hover:text-teal-300">${timeFormatted}</span>
                                  <i data-lucide="chevron-left" class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 transition transform group-hover:-translate-x-0.5"></i>
                                </button>
                              `;
                              })
                              .join("")}
                          </div>
                        </div>
                      `;
                      })
                      .join("")}
                  </div>
                `
                  : `
                  <div class="py-6 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center text-slate-400 text-xs">
                    <i data-lucide="calendar-off" class="w-6 h-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600"></i>
                    لا توجد مواعيد متاحة حالياً لهذا الطبيب.
                  </div>
                `
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  initLucideIcons();
}

// إعادة ضبط حقول البحث والتصفية إلى حالتها الافتراضية
window.resetDoctorFilters = function () {
  const searchInput = document.getElementById("search-input");
  const specSelect = document.getElementById("specialization-filter");

  if (searchInput) searchInput.value = "";
  if (specSelect) specSelect.value = "all";
  state.searchQuery = "";
  state.selectedSpecialization = "all";

  renderDoctors();
};

// تهيئة نافذة الحجز عند اختيار موعد
window.selectSlotForBooking = function (scheduleId, docName, spec, date, startTime, endTime, fee) {
  if (!state.currentUser) {
    showToast("يرجى تسجيل الدخول أو إنشاء حساب أولاً لإتمام الحجز", "warning");
    openModal("auth-modal");
    return;
  }

  const profile = state.currentUser.profile || {};
  state.selectedSlot = {
    scheduleId,
    doctorName: decodeURIComponent(docName),
    specialization: decodeURIComponent(spec),
    date,
    startTime,
    endTime,
    fee
  };

  // تعبئة البيانات في النموذج
  document.getElementById("booking-doctor-name").textContent = state.selectedSlot.doctorName;
  document.getElementById("booking-specialization").textContent = state.selectedSlot.specialization;
  document.getElementById("booking-date-time").textContent = `${formatArabicDate(date)} - الساعة ${formatTime(startTime)}`;
  document.getElementById("booking-fee").textContent = `${fee} ر.س`;

  // تعبئة الاسم ورقم الهاتف تلقائياً من البروفايل
  const nameInput = document.getElementById("booking-patient-name");
  const phoneInput = document.getElementById("booking-patient-phone");

  if (nameInput) nameInput.value = profile.full_name || "";
  if (phoneInput) phoneInput.value = profile.phone || "";

  openModal("booking-modal");
};

// تنفيذ الحجز الآمن عبر دالة الـ RPC
async function handleBookAppointment(e) {
  e.preventDefault();
  if (!state.selectedSlot) return;

  const nameInput = document.getElementById("booking-patient-name");
  const phoneInput = document.getElementById("booking-patient-phone");
  const submitBtn = document.getElementById("confirm-booking-btn");

  const patientName = nameInput.value.trim();
  const patientPhone = phoneInput.value.trim();

  if (!patientName || !patientPhone) {
    showToast("يرجى ملء الاسم ورقم الهاتف للمريض", "error");
    return;
  }

  try {
    setButtonLoading(submitBtn, true, "جاري تأكيد الحجز الآمن...");

    // استدعاء دالة الـ RPC الآمنة: book_appointment
    const result = await bookAppointmentRPC({
      scheduleId: state.selectedSlot.scheduleId,
      patientName: patientName,
      patientPhone: patientPhone
    });

    showToast("تم تأكيد موعدك بنجاح", "success");
    closeModal("booking-modal");
    state.selectedSlot = null;

    // تحديث المواعيد المتاحة المتاحة في عرض الأطباء
    await fetchDoctors(false);

    // نقل المريض مباشرة إلى "حجوزاتي" ليرى موعده الجديد فوراً (يجلب الحجوزات أيضاً)
    if (state.currentUser) {
      switchTab("appointments");
    }
  } catch (err) {
    console.error("Booking error:", err);
    const friendlyMessage = translateAuthError(err);
    showToast(`فشل الحجز: ${friendlyMessage}`, "error");
  } finally {
    setButtonLoading(submitBtn, false, "تأكيد الحجز النهائي");
  }
}

// جلب وعرض حجوزات المريض الحالي
async function fetchPatientAppointments(showLoading = true) {
  const container = document.getElementById("appointments-container");
  if (!container) return;

  if (showLoading) {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${[1, 2]
          .map(
            () => `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse">
            <div class="flex justify-between items-center mb-4">
              <div class="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div class="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div class="w-36 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            <div class="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <div class="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  try {
    const list = await getPatientAppointments();
    state.patientAppointments = list;
    renderPatientAppointments(list);
  } catch (err) {
    console.error("Fetch appointments error:", err);
    container.innerHTML = `
      <div class="p-6 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-3xl text-center text-xs font-semibold">
        تعذر جلب الحجوزات: ${err.message}
      </div>
    `;
  }
}

function renderPatientAppointments(list) {
  const container = document.getElementById("appointments-container");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div class="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="calendar-check" class="w-8 h-8"></i>
        </div>
        <h4 class="text-base font-bold text-slate-800 dark:text-white mb-1">لا توجد لديك حجوزات حالية</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">يمكنك الآن استعراض قائمة الأطباء واختيار موعد مناسب لحجزه فوراً وبأمان.</p>
        <button onclick="document.getElementById('tab-doctors-btn').click()" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2">
          <i data-lucide="stethoscope" class="w-4 h-4"></i>
          استعراض الأطباء المتاحين
        </button>
      </div>
    `;
    initLucideIcons();
    return;
  }

  // تحديث عداد المواعيد القادمة في الـ Tab
  updateAppointmentsBadge(list);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${list
        .map((app) => {
          const schedule = app.doctor_schedules || {};
          const doc = schedule.doctors || {};
          const statusBadge = getStatusBadge(app.status);
          const isBooked = app.status === "booked";

          return `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between mb-3">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">رقم الحجز: #${String(app.id).slice(0, 8)}</span>
                ${statusBadge}
              </div>

              <h4 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtml(doc.name || "الطبيب المختص")}</h4>
              <p class="text-xs text-teal-700 dark:text-teal-400 font-semibold mb-3">${escapeHtml(doc.specialization || "عيادة عامة")}</p>

              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"></i>
                  <span class="font-medium">${formatArabicDate(schedule.available_date)}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"></i>
                  <span>الساعة: <strong>${formatTime(schedule.start_time)}</strong> - <strong>${formatTime(schedule.end_time)}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="user" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"></i>
                  <span>المريض: <strong class="text-slate-800 dark:text-white">${escapeHtml(app.patient_name)}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="phone" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"></i>
                  <span dir="ltr" class="font-medium">${escapeHtml(app.patient_phone)}</span>
                </div>
              </div>
            </div>

            <!-- أزرار الإجراءات للموعد المؤكد -->
            ${
              isBooked
                ? `
                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                  <button 
                    onclick="window.initiateReschedule('${app.id}')"
                    class="flex-1 py-2 px-2.5 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100/80 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <i data-lucide="calendar-sync" class="w-3.5 h-3.5"></i>
                    تعديل
                  </button>
                  <button 
                    onclick="window.shareAppointment('${encodeURIComponent(doc.name || "الطبيب")}', '${encodeURIComponent(doc.specialization || "")}', '${schedule.available_date}', '${schedule.start_time}')"
                    title="مشاركة عبر واتساب"
                    class="py-2 px-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                    مشاركة
                  </button>
                  <button 
                    onclick="window.initiateCancel('${app.id}')"
                    class="py-2 px-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
                    إلغاء
                  </button>
                </div>
              `
                : `
                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">لا توجد إجراءات إضافية لهذا السجل</span>
                </div>
              `
            }
          </div>
        `;
        })
        .join("")}
    </div>
  `;

  initLucideIcons();
}

// مشاركة الموعد عبر WhatsApp أو النسخ إلى الحافظة
window.shareAppointment = function (docName, spec, date, time) {
  const dName = decodeURIComponent(docName);
  const dSpec = decodeURIComponent(spec);
  const msg = `تذكير بموعدي الطبي في نبض العافية:\n- الطبيب: ${dName} (${dSpec})\n- التاريخ: ${formatArabicDate(date)}\n- الوقت: ${formatTime(time)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

// تحديث شارة عدد المواعيد وتفعيل بانر تذكير الموعد القادم (غداً أو اليوم)
function updateAppointmentsBadge(list) {
  const badge = document.getElementById("appointments-badge");
  const mobileBadge = document.getElementById("mobile-appointments-badge");

  const bookedList = (list || []).filter((a) => a.status === "booked");
  const upcomingCount = bookedList.length;

  if (upcomingCount > 0) {
    if (badge) {
      badge.textContent = upcomingCount;
      badge.classList.remove("hidden");
    }
    if (mobileBadge) {
      mobileBadge.textContent = upcomingCount;
      mobileBadge.classList.remove("hidden");
    }
  } else {
    badge?.classList.add("hidden");
    mobileBadge?.classList.add("hidden");
  }

  // فحص تذكير موعد الغد أو اليوم
  checkUpcomingReminderBanner(bookedList);
}

// فحص وجود موعد قريب وعرض شريط التذكير
function checkUpcomingReminderBanner(bookedList) {
  const banner = document.getElementById("upcoming-reminder-banner");
  const textEl = document.getElementById("upcoming-reminder-text");
  if (!banner || !textEl) return;

  const todayStr = localDateISO();
  const tomorrowStr = localDateISO(1);

  const nearApp = bookedList.find((a) => {
    const d = a.doctor_schedules?.available_date;
    return d === todayStr || d === tomorrowStr;
  });

  if (nearApp) {
    const isToday = nearApp.doctor_schedules?.available_date === todayStr;
    const docName = nearApp.doctor_schedules?.doctors?.name || "الطبيب";
    const timeStr = formatTime(nearApp.doctor_schedules?.start_time);
    textEl.textContent = isToday
      ? `تذكير: لديك موعد طبي اليوم مع ${docName} الساعة ${timeStr}!`
      : `تذكير: لديك موعد طبي غداً مع ${docName} الساعة ${timeStr}!`;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

// نافذة بدء إلغاء الموعد
window.initiateCancel = function (appointmentId) {
  const app = state.patientAppointments.find((a) => a.id === appointmentId);
  if (!app) return;

  state.appointmentToCancel = app;
  const schedule = app.doctor_schedules || {};
  const doc = schedule.doctors || {};

  const detailsEl = document.getElementById("cancel-appointment-details");
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div><strong>الطبيب:</strong> ${doc.name || "الطبيب المختص"} (${doc.specialization || ""})</div>
      <div><strong>الموعد:</strong> ${formatArabicDate(schedule.available_date)} - الساعة ${formatTime(schedule.start_time)}</div>
      <div><strong>المريض:</strong> ${app.patient_name}</div>
    `;
  }

  openModal("cancel-modal");
};

// تأكيد تنفيذ الإلغاء عبر دالة RPC
async function handleConfirmCancelAppointment() {
  if (!state.appointmentToCancel) return;

  const btn = document.getElementById("confirm-cancel-btn");
  try {
    setButtonLoading(btn, true, "جاري الإلغاء...");
    await cancelAppointmentRPC(state.appointmentToCancel.id);

    showToast("تم إلغاء الموعد بنجاح، وتحرير الموعد المجدول", "info");
    closeModal("cancel-modal");
    state.appointmentToCancel = null;

    // تحديث القوائم
    await fetchPatientAppointments(false);
    await fetchDoctors(false);
  } catch (err) {
    console.error("Cancel appointment error:", err);
    const friendlyMessage = translateAuthError(err);
    showToast(`تعذر الإلغاء: ${friendlyMessage}`, "error");
  } finally {
    setButtonLoading(btn, false, "نعم، ألغِ الموعد");
  }
}

// نافذة بدء إعادة جدولة الموعد
window.initiateReschedule = function (appointmentId) {
  const app = state.patientAppointments.find((a) => a.id === appointmentId);
  if (!app) return;

  state.appointmentToReschedule = app;
  state.selectedRescheduleSlotId = null;

  const schedule = app.doctor_schedules || {};
  const docId = schedule.doctors?.id;
  const doc = state.doctors.find((d) => d.id === docId) || schedule.doctors || {};

  // عرض تفاصيل الموعد الحالي
  const infoEl = document.getElementById("reschedule-current-info");
  if (infoEl) {
    infoEl.innerHTML = `
      <div><strong>الطبيب:</strong> ${doc.name || "الطبيب"} (${doc.specialization || ""})</div>
      <div><strong>الموعد الحالي:</strong> ${formatArabicDate(schedule.available_date)} - الساعة ${formatTime(schedule.start_time)}</div>
    `;
  }

  // جلب المواعيد المتاحة لهذا الطبيب باستثناء الموعد الحالي
  const availableSlots = (doc.available_schedules || []).filter((s) => s.id !== schedule.id);
  const container = document.getElementById("reschedule-slots-container");
  const confirmBtn = document.getElementById("confirm-reschedule-btn");
  if (confirmBtn) confirmBtn.disabled = true;

  if (!container) return;

  if (availableSlots.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400">
        لا توجد مواعيد أخرى متاحة حالياً لهذا الطبيب. يمكنك إلغاء الحجز وحجز موعد مع طبيب آخر.
      </div>
    `;
  } else {
    container.innerHTML = availableSlots
      .map(
        (slot) => `
        <label class="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 rounded-xl cursor-pointer transition hover:bg-teal-50/40 dark:hover:bg-teal-950/40">
          <div class="flex items-center gap-2.5">
            <input type="radio" name="reschedule_slot" value="${slot.id}" class="accent-teal-600 w-4 h-4" onchange="window.selectRescheduleSlot('${slot.id}')">
            <div>
              <span class="block text-xs font-bold text-slate-800 dark:text-slate-100">${formatArabicDate(slot.available_date)}</span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">الساعة ${formatTime(slot.start_time)} إلى ${formatTime(slot.end_time)}</span>
            </div>
          </div>
          <span class="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">متاح</span>
        </label>
      `
      )
      .join("");
  }

  openModal("reschedule-modal");
};

window.selectRescheduleSlot = function (slotId) {
  state.selectedRescheduleSlotId = slotId;
  const confirmBtn = document.getElementById("confirm-reschedule-btn");
  if (confirmBtn) confirmBtn.disabled = false;
};

// تنفيذ إعادة الجدولة عبر دالة RPC
async function handleConfirmRescheduleAppointment() {
  if (!state.appointmentToReschedule || !state.selectedRescheduleSlotId) {
    showToast("يرجى اختيار موعد بديل أولاً", "warning");
    return;
  }

  const btn = document.getElementById("confirm-reschedule-btn");
  try {
    setButtonLoading(btn, true, "جاري نقل الموعد...");
    await rescheduleAppointmentRPC({
      appointmentId: state.appointmentToReschedule.id,
      newScheduleId: state.selectedRescheduleSlotId
    });

    showToast("تمت إعادة جدولة الموعد بنجاح!", "success");
    closeModal("reschedule-modal");
    state.appointmentToReschedule = null;
    state.selectedRescheduleSlotId = null;

    // تحديث البيانات
    await fetchPatientAppointments(false);
    await fetchDoctors(false);
  } catch (err) {
    console.error("Reschedule appointment error:", err);
    const friendlyMessage = translateAuthError(err);
    showToast(`تعذر تعديل الموعد: ${friendlyMessage}`, "error");
  } finally {
    setButtonLoading(btn, false, "تأكيد الموعد الجديد");
  }
}

// نافذة الملف الشخصي للمريض
function openProfileModal() {
  if (!state.currentUser) return;

  const profile = state.currentUser.profile || {};
  const emailInput = document.getElementById("profile-email");
  const nameInput = document.getElementById("profile-fullname");
  const phoneInput = document.getElementById("profile-phone");

  if (emailInput) emailInput.value = state.currentUser.email || "";
  if (nameInput) nameInput.value = profile.full_name || "";
  if (phoneInput) phoneInput.value = profile.phone || "";

  openModal("profile-modal");
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const nameInput = document.getElementById("profile-fullname");
  const phoneInput = document.getElementById("profile-phone");
  const btn = document.getElementById("save-profile-btn");

  const fullName = nameInput?.value.trim() || "";
  const phone = phoneInput?.value.trim() || "";

  if (!fullName || fullName.length < 3) {
    showToast("يرجى إدخال اسم كامل صحيح (3 أحرف على الأقل)", "warning");
    return;
  }
  if (!phone || phone.length < 8) {
    showToast("يرجى إدخال رقم هاتف صحيح", "warning");
    return;
  }

  try {
    setButtonLoading(btn, true, "جاري الحفظ...");
    await updatePatientProfile({ fullName, phone });
    showToast("تم تحديث بيانات ملفك الشخصي بنجاح!", "success");
    closeModal("profile-modal");

    await loadCurrentUser();
  } catch (err) {
    console.error("Save profile error:", err);
    const friendlyMessage = translateAuthError(err);
    showToast(`تعذر حفظ الملف الشخصي: ${friendlyMessage}`, "error");
  } finally {
    setButtonLoading(btn, false, "حفظ التعديلات");
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "booked":
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">مؤكد</span>`;
    case "completed":
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">مكتمل</span>`;
    case "cancelled_by_patient":
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">ملغي من المريض</span>`;
    case "cancelled_by_clinic":
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">ملغي من العيادة</span>`;
    case "no_show":
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">لم يحضر</span>`;
    default:
      return `<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${status}</span>`;
  }
}

// معالجة تسجيل الدخول
async function handleLogin(e) {
  e.preventDefault();
  clearAuthError();

  const email = document.getElementById("login-email")?.value.trim() || "";
  const password = document.getElementById("login-password")?.value || "";
  const btn = document.getElementById("login-submit-btn");

  if (!email) {
    showAuthError("يرجى إدخال البريد الإلكتروني");
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    showAuthError("يرجى إدخال بريد إلكتروني بصيغة صحيحة (مثال: name@mail.com)");
    return;
  }
  if (!password) {
    showAuthError("يرجى إدخال كلمة المرور");
    return;
  }

  try {
    setButtonLoading(btn, true, "جاري تسجيل الدخول...");
    await loginUser({ email, password });
    
    showToast("تم تسجيل الدخول بنجاح! أهلاً بك.", "success");
    closeModal("auth-modal");
    
    // تفريغ الحقول ومسح الأخطاء
    document.getElementById("login-form")?.reset();
    clearAuthError();

    // تحديث فوري للحالة
    await loadCurrentUser();
    await fetchDoctors(false);
  } catch (err) {
    console.error("Login error:", err);
    const friendlyMessage = translateAuthError(err);
    showAuthError(friendlyMessage);
  } finally {
    setButtonLoading(btn, false, "تسجيل الدخول");
  }
}

// معالجة تسجيل حساب جديد
async function handleRegister(e) {
  e.preventDefault();
  clearAuthError();

  const fullName = document.getElementById("register-fullname")?.value.trim() || "";
  const phone = document.getElementById("register-phone")?.value.trim() || "";
  const email = document.getElementById("register-email")?.value.trim() || "";
  const password = document.getElementById("register-password")?.value || "";
  const btn = document.getElementById("register-submit-btn");

  if (!fullName || fullName.length < 3) {
    showAuthError("يرجى إدخال الاسم الكامل للمريض (3 أحرف على الأقل)");
    return;
  }
  if (!phone || phone.length < 8) {
    showAuthError("يرجى إدخال رقم هاتف صحيح للتواصل (مثال: 05XXXXXXXX)");
    return;
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    showAuthError("يرجى إدخال بريد إلكتروني بصيغة صحيحة");
    return;
  }
  if (password.length < 6) {
    showAuthError("كلمة المرور يجب أن تكون 6 خانات أو أكثر");
    return;
  }

  try {
    setButtonLoading(btn, true, "جاري إنشاء الحساب...");
    const data = await registerPatient({ email, password, fullName, phone });

    // فحص ما إذا تم إنشاء جلسة مباشرة أم يلزم تأكيد البريد
    if (data?.session) {
      showToast("تم إنشاء الحساب وتسجيل الدخول بنجاح!", "success");
      closeModal("auth-modal");
      document.getElementById("register-form")?.reset();
      clearAuthError();
      await loadCurrentUser();
      await fetchDoctors(false);
    } else {
      // يتطلب تأكيد البريد إذا كان مفعلاً في Supabase
      showToast("تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل، أو تسجيل الدخول.", "info");
      toggleAuthMode("login");
      const loginEmailInput = document.getElementById("login-email");
      if (loginEmailInput) loginEmailInput.value = email;
    }
  } catch (err) {
    console.error("Register error:", err);
    const friendlyMessage = translateAuthError(err);
    showAuthError(friendlyMessage);
  } finally {
    setButtonLoading(btn, false, "إنشاء الحساب الآن");
  }
}

// تسجيل الخروج
async function handleLogout() {
  try {
    await logoutUser();
    state.currentUser = null;
    renderUserUI();
    showToast("تم تسجيل الخروج بنجاح", "info");
    switchTab("doctors");
  } catch (err) {
    showToast(`خطأ أثناء الخروج: ${err.message}`, "error");
  }
}

// نافذة إعدادات المفاتيح
function openSettingsModal() {
  const { url, anonKey } = getSupabaseConfig();
  document.getElementById("settings-supabase-url").value = url || "";
  document.getElementById("settings-supabase-key").value = anonKey || "";
  openModal("settings-modal");
}

function handleSaveSettings(e) {
  e.preventDefault();
  const url = document.getElementById("settings-supabase-url").value.trim();
  const key = document.getElementById("settings-supabase-key").value.trim();

  if (!url || !key) {
    showToast("يرجى إدخال الرابط ومفتاح الـ Anon Key", "error");
    return;
  }

  saveSupabaseConfig(url, key);
  resetClient();
  checkConfigBanner();
  closeModal("settings-modal");
  showToast("تم حفظ إعدادات Supabase وتحديث الاتصال بنجاح!", "success");

  // إعادة تحميل البيانات
  loadCurrentUser();
  fetchDoctors(true);
}

// دوال مساعدة للواجهة
let lastFocusedElement = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    lastFocusedElement = document.activeElement;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    const focusable = modal.querySelector(
      'button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }
}

function setButtonLoading(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>${text}`
    : text;
}

function formatArabicDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || "00";
  const ampm = hour >= 12 ? "م" : "ص";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

// تاريخ اليوم بالتوقيت المحلي بصيغة YYYY-MM-DD (بدل التوقيت العالمي UTC)
function localDateISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

// مطوَّرُ الهروب من الرموز HTML (آمنٌ للإدراج في innerHTML / attributes)
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "\x26amp;", "<": "\x26lt;", ">": "\x26gt;", '"': "\x26quot;", "'": "\x26#39;"
  }[c]));
}

// تاريخ اليوم بالتوقيت المحلي بصيغة YYYY-MM-DD (بدل التوقيت العالمي UTC)
function localDateISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

// مطوَّرُ الهروب من الرموز HTML (آمنٌ للإدراج في innerHTML / attributes)
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "\x26amp;", "<": "\x26lt;", ">": "\x26gt;", '"': "\x26quot;", "'": "\x26#39;"
  }[c]));
}

// نظام التنبيهات Toast
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-2xl shadow-lg border text-sm flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 ${
    type === "success"
      ? "bg-emerald-900 text-white border-emerald-700"
      : type === "error"
      ? "bg-rose-900 text-white border-rose-700"
      : type === "warning"
      ? "bg-amber-900 text-white border-amber-700"
      : "bg-slate-900 text-white border-slate-700"
  }`;

  const iconName =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "alert-circle"
      : type === "warning"
      ? "alert-triangle"
      : "info";

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0 toast-icon-pop"></i>
    <span class="flex-1">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
