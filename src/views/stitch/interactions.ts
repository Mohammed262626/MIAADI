/*
 * Interaction layer ported verbatim from the Stitch DESKTOP prototypes
 * (doctor-profile / bookings / doctors-directory inline scripts).
 * The markup keeps its original inline handlers, so these are exposed on
 * `window` exactly like in the prototypes.
 */

let currentMode: "clinic" | "telehealth" = "clinic";
let selectedDateString = "الثلاثاء 15 أكتوبر 2024";
let selectedTimeString = "10:15 صباحاً";

const CLINIC_BTN_ACTIVE =
  "flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl bg-primary text-on-primary shadow-sm transition-all text-center group";
const CLINIC_BTN_IDLE =
  "flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-center group";
const DATE_CELL_IDLE =
  "date-cell flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-center";
const DATE_CELL_ACTIVE =
  "date-cell active-date flex flex-col items-center py-2.5 px-1 rounded-xl bg-primary text-on-primary shadow-md transition-all text-center";
const SLOT_IDLE =
  "time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all";
const SLOT_ACTIVE =
  "time-slot selected-slot py-2 px-1 text-center rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all font-bold flex items-center justify-center gap-1";

function updateSummaryDisplay() {
  const summaryElem = document.getElementById("summary-datetime-display");
  if (summaryElem) summaryElem.textContent = `${selectedDateString} • ${selectedTimeString}`;
}

function setConsultationMode(mode: "clinic" | "telehealth") {
  currentMode = mode;
  const clinicBtn = document.getElementById("btn-in-clinic");
  const telehealthBtn = document.getElementById("btn-telehealth");
  const ctaPriceElem = document.getElementById("cta-price-amount");
  const ctaBtnText = document.getElementById("cta-button-text");

  if (mode === "clinic") {
    if (clinicBtn) clinicBtn.className = CLINIC_BTN_ACTIVE;
    if (telehealthBtn) telehealthBtn.className = CLINIC_BTN_IDLE;
    if (ctaPriceElem) ctaPriceElem.textContent = "3000";
    if (ctaBtnText) ctaBtnText.textContent = "متابعة الحجز بالعيادة (3000 ج.س) | Proceed";
  } else {
    if (telehealthBtn) telehealthBtn.className = CLINIC_BTN_ACTIVE;
    if (clinicBtn) clinicBtn.className = CLINIC_BTN_IDLE;
    if (ctaPriceElem) ctaPriceElem.textContent = "2200";
    if (ctaBtnText) ctaBtnText.textContent = "متابعة حجز استشارة الفيديو (2200 ج.س) | Proceed";
  }
}

function selectDate(element: HTMLElement, dateStr: string) {
  selectedDateString = dateStr;
  document.querySelectorAll<HTMLElement>(".date-cell").forEach((btn) => {
    btn.className = DATE_CELL_IDLE;
    const badge = btn.querySelector("span:last-child");
    if (badge && badge.textContent === "محدد") {
      badge.className = "text-[10px] text-tertiary font-bold mt-1";
      badge.textContent = "متاح";
    }
  });

  element.className = DATE_CELL_ACTIVE;
  const lastChild = element.querySelector("span:last-child");
  if (lastChild) {
    lastChild.className = "text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded-full font-bold mt-1";
    lastChild.textContent = "محدد";
  }

  updateSummaryDisplay();
}

function selectTimeSlot(element: HTMLElement) {
  selectedTimeString = (element.textContent || "").trim().replace("check", "").trim();
  document.querySelectorAll<HTMLElement>(".time-slot").forEach((slot) => {
    slot.className = SLOT_IDLE;
    slot.querySelector(".material-symbols-outlined")?.remove();
  });

  element.className = SLOT_ACTIVE;
  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined text-[14px]";
  icon.textContent = "check";
  element.insertBefore(icon, element.firstChild);

  updateSummaryDisplay();
}

function toggleInsuranceDetails() {
  const toggle = document.getElementById("insurance-toggle") as HTMLInputElement | null;
  const area = document.getElementById("insurance-dropdown-area");
  if (area && toggle) {
    area.classList.toggle("hidden", !toggle.checked);
    area.classList.toggle("flex", toggle.checked);
  }
}

function switchBookingTab(tabKey: "upcoming" | "past" | "cancelled") {
  (["upcoming", "past", "cancelled"] as const).forEach((key) => {
    const btn = document.getElementById("tab-" + key);
    const view = document.getElementById("view-" + key);
    if (btn && view) {
      if (key === tabKey) {
        btn.classList.add("bg-surface-container-lowest", "text-primary", "shadow-sm");
        btn.classList.remove("text-secondary");
        view.classList.remove("hidden");
        view.classList.add("flex");
      } else {
        btn.classList.remove("bg-surface-container-lowest", "text-primary", "shadow-sm");
        btn.classList.add("text-secondary");
        view.classList.add("hidden");
        view.classList.remove("flex");
      }
    }
  });
}

function rescheduleBooking(bookingId: string) {
  window.alert("إعادة جدولة الموعد " + bookingId + ": سيتم تحويلك إلى نافذة اختيار الأوقات المتاحة للدكتور.");
}
function joinTelehealthRoom() {
  window.alert("جاري الاتصال الآمن بغرفة الاستشارة المرئية المشفرة لميعادي...");
}
function requestSickLeave() {
  window.alert("جاري التحقق من ربط منصة صحتي (Sehhaty) لتحميل التقرير الصادر...");
}

export function registerStitchGlobals() {
  Object.assign(window, {
    setConsultationMode,
    selectDate,
    selectTimeSlot,
    toggleInsuranceDetails,
    switchBookingTab,
    rescheduleBooking,
    joinTelehealthRoom,
    requestSickLeave,
  });
}
