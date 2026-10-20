/** Reschedule intent carried from #appointments to the doctor page. */
const KEY = "miaadi:reschedule-id";

export type RescheduleIntent = { id: string; ref: string };

export function setRescheduleIntent(v: RescheduleIntent): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable */ }
}

export function getRescheduleIntent(): RescheduleIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RescheduleIntent>;
    return parsed.id ? { id: parsed.id, ref: String(parsed.ref || "") } : null;
  } catch { return null; }
}

export function clearRescheduleIntent(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
