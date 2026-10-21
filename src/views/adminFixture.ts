// Dev-only sample data for the admin management screens (accounts / providers /
// schedules). Enabled with ?mgfixture=doctors or ?mgfixture=accounts so the
// screens can be reviewed without a signed-in account and without touching the
// database. Never active in a production build.
import { localDateISO } from "../lib/format";

export type MgTab = "management" | "accounts";

export function mgFixture(): MgTab | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(location.search).get("mgfixture");
  if (value === null) return null;
  return value === "accounts" ? "accounts" : "management";
}

/** ?mgdoc=1 pre-selects the first provider so the schedule editor is visible. */
export function mgOpenDoctor(): boolean {
  return import.meta.env.DEV && new URLSearchParams(location.search).has("mgdoc");
}

export const fixtureAccounts = [
  { user_id: "fx-user-1", full_name: "د. طارق المنصور", email: "tariq.almansour@miaadi.sd", phone: "+249 90 123 4567", role: "doctor" },
  { user_id: "fx-user-2", full_name: "د. منى السبيعي", email: "mona.alsubaie@miaadi.sd", phone: "+249 91 234 5678", role: "doctor" },
  { user_id: "fx-user-3", full_name: "سارة عبد الله", email: "sara.abdullah@miaadi.sd", phone: "+249 92 345 6789", role: "patient" },
  { user_id: "fx-user-4", full_name: "محمد الأمين", email: "admin@miaadi.sd", phone: "+249 90 987 6543", role: "admin" },
  { user_id: "fx-user-5", full_name: "عمر إبراهيم", email: "omar.ibrahim@miaadi.sd", phone: "+249 99 876 5432", role: "patient" },
];

export const fixtureDoctors = [
  { id: "fx-doc-1", name: "د. طارق المنصور", specialization: "أمراض القلب والقسطرة التداخلية", consultation_fee: 4500, user_id: "fx-user-1" },
  { id: "fx-doc-2", name: "د. منى السبيعي", specialization: "الجلدية والليزر والحقن التجميلي", consultation_fee: 3500, user_id: "fx-user-2" },
  { id: "fx-doc-3", name: "د. أحمد عثمان", specialization: "طب الأطفال وحديثي الولادة", consultation_fee: 3000, user_id: null },
  { id: "fx-doc-4", name: "د. هدى الفكي", specialization: "النساء والتوليد", consultation_fee: 3800, user_id: null },
  { id: "fx-doc-5", name: "د. خالد بشير", specialization: "العظام والمفاصل", consultation_fee: 4200, user_id: null },
  { id: "fx-doc-6", name: "د. نهى عبد الرحمن", specialization: "طب العيون", consultation_fee: 3200, user_id: null },
  { id: "fx-doc-7", name: "د. عمر الصادق", specialization: "الأنف والأذن والحنجرة", consultation_fee: 3400, user_id: null },
  { id: "fx-doc-8", name: "د. ريم حسبو", specialization: "الطب الباطني", consultation_fee: 3000, user_id: null },
  { id: "fx-doc-9", name: "د. ياسر الطيب", specialization: "المسالك البولية", consultation_fee: 4000, user_id: null },
];

export const fixtureAvailability = [
  { day_of_week: 0, start_time: "09:00:00", end_time: "14:00:00", is_enabled: true, slot_minutes: 30, break_start_1: "12:00:00", break_end_1: "12:30:00", break_start_2: null, break_end_2: null },
  { day_of_week: 1, start_time: "09:00:00", end_time: "14:00:00", is_enabled: true, slot_minutes: 30, break_start_1: "12:00:00", break_end_1: "12:30:00", break_start_2: null, break_end_2: null },
  { day_of_week: 2, start_time: "16:00:00", end_time: "20:00:00", is_enabled: true, slot_minutes: 30, break_start_1: null, break_end_1: null, break_start_2: null, break_end_2: null },
  { day_of_week: 3, start_time: "16:00:00", end_time: "20:00:00", is_enabled: true, slot_minutes: 30, break_start_1: null, break_end_1: null, break_start_2: null, break_end_2: null },
  { day_of_week: 4, start_time: "09:00:00", end_time: "13:00:00", is_enabled: true, slot_minutes: 30, break_start_1: null, break_end_1: null, break_start_2: null, break_end_2: null },
  { day_of_week: 6, start_time: "09:00:00", end_time: "13:00:00", is_enabled: true, slot_minutes: 30, break_start_1: null, break_end_1: null, break_start_2: null, break_end_2: null },
];

export const fixtureBlocked = [
  { id: "fx-block-1", start_date: localDateISO(9), end_date: localDateISO(11), reason: "إجازة قصيرة" },
];

export function fixtureSchedules() {
  const rows: { id: string; available_date: string; start_time: string; end_time: string; is_booked: boolean }[] = [];
  let n = 0;
  for (let day = 1; day <= 5; day += 1) {
    const date = localDateISO(day);
    const weekday = new Date(`${date}T12:00:00`).getDay();
    if (weekday === 5) continue; // Friday, closed
    const startHour = weekday === 2 || weekday === 3 ? 16 : 9;
    for (let i = 0; i < 4; i += 1) {
      const start = `${String(startHour + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
      const endMinutes = startHour * 60 + i * 30 + 30;
      const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
      n += 1;
      rows.push({
        id: `fx-slot-${n}`,
        available_date: date,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
        is_booked: n === 3 || n === 8,
      });
    }
  }
  return rows;
}
