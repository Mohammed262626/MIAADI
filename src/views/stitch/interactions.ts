/*
 * Interaction layer ported verbatim from the Stitch DESKTOP prototypes
 * (doctor-profile / bookings / doctors-directory inline scripts).
 * The markup keeps its original inline handlers, so these are exposed on
 * `window` exactly like in the prototypes.
 */

let selectedDateString = "الثلاثاء 15 أكتوبر 2024";
let selectedTimeString = "10:15 صباحاً";

const DATE_CELL_IDLE =
  "date-cell flex flex-col items-center rounded-lg bg-surface-container-low px-1 py-2.5 text-center transition-colors hover:bg-surface-container";
const DATE_CELL_ACTIVE =
  "date-cell active-date flex flex-col items-center rounded-lg bg-primary px-1 py-2.5 text-center text-on-primary transition-colors";
const SLOT_IDLE =
  "time-slot rounded-lg bg-surface-container-low px-1 py-2 text-center text-[13px] text-on-surface transition-colors hover:bg-surface-container";
const SLOT_ACTIVE =
  "time-slot selected-slot flex items-center justify-center gap-1 rounded-lg bg-primary px-1 py-2 text-center text-[13px] font-semibold text-on-primary transition-colors";

function updateSummaryDisplay() {
  const summaryElem = document.getElementById("summary-datetime-display");
  if (summaryElem) summaryElem.textContent = `${selectedDateString} • ${selectedTimeString}`;
}

function selectDate(element: HTMLElement, dateStr: string) {
  selectedDateString = dateStr;
  document.querySelectorAll<HTMLElement>(".date-cell").forEach((btn) => {
    btn.className = DATE_CELL_IDLE;
    const badge = btn.querySelector("span:last-child");
    if (badge && badge.textContent === "محدد") {
      badge.className = "text-[11px] text-tertiary font-bold mt-1";
      badge.textContent = "متاح";
    }
  });

  element.className = DATE_CELL_ACTIVE;
  const lastChild = element.querySelector("span:last-child");
  if (lastChild) {
    lastChild.className = "mt-1 rounded bg-on-primary/20 px-1.5 py-0.5 text-[11px] font-semibold";
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
        btn.classList.add("bg-surface-container-lowest", "text-primary");
        btn.classList.remove("text-secondary");
        view.classList.remove("hidden");
        view.classList.add("flex");
      } else {
        btn.classList.remove("bg-surface-container-lowest", "text-primary");
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

export function registerStitchGlobals() {
  Object.assign(window, {
    selectDate,
    selectTimeSlot,
    toggleInsuranceDetails,
    switchBookingTab,
    rescheduleBooking,
  });
}
