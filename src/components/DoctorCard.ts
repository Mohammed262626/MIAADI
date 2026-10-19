import { escapeHtml, formatTime, formatRelativeDay } from "../lib/format";
import { icon } from "./icons";
import { avatar, money, ratingInline } from "./ui";

export type Slot = { id: string; available_date: string; start_time: string; end_time: string; is_booked?: boolean };
export type Doctor = { id: string; name: string; specialization: string; consultation_fee: number; available_schedules: Slot[] };

export function nextFreeSlot(doc: Doctor): Slot | null {
  const free = (doc.available_schedules || []).filter((s) => !s.is_booked);
  return free.length ? free[0] : null;
}

export function renderDoctorCard(doc: Doctor, variant: "list" | "rail" = "list"): string {
  const slot = nextFreeSlot(doc);
  const slotLine = slot
    ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary">${icon("event_available", { size: 15 })}أقرب موعد ${escapeHtml(formatRelativeDay(slot.available_date))} · <span class="tabular-nums">${escapeHtml(formatTime(slot.start_time))}</span></span>`
    : `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">${icon("event_busy", { size: 15 })}لا مواعيد قريبة</span>`;

  if (variant === "rail") {
    return `<a href="#doctor/${escapeHtml(doc.id)}" class="panel shrink-0 w-[220px] p-4 flex flex-col gap-3 hover:shadow-[0_16px_40px_-20px_rgba(16,24,40,.25)] transition-shadow">
      <div class="flex items-center gap-3">
        ${avatar(doc.name, "sm")}
        <div class="min-w-0">
          <h3 class="font-extrabold text-[15px] truncate">${escapeHtml(doc.name)}</h3>
          <p class="text-[11px] text-primary font-bold truncate">${escapeHtml(doc.specialization)}</p>
        </div>
      </div>
      <div class="flex items-center justify-between">
        ${ratingInline(doc.id)}
        <span class="text-xs font-extrabold tabular-nums">${money(doc.consultation_fee)}</span>
      </div>
      <div class="border-t border-outline-variant/50 pt-3">${slotLine}</div>
    </a>`;
  }

  return `<a href="#doctor/${escapeHtml(doc.id)}" class="panel p-4 flex gap-3.5 hover:shadow-[0_16px_40px_-20px_rgba(16,24,40,.22)] transition-shadow">
    ${avatar(doc.name, "md")}
    <div class="flex-1 min-w-0 flex flex-col gap-2">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h3 class="font-extrabold text-[16px] truncate">${escapeHtml(doc.name)}</h3>
          <p class="text-[12px] text-primary font-bold truncate">${escapeHtml(doc.specialization)}</p>
        </div>
        ${ratingInline(doc.id)}
      </div>
      <div class="flex items-center gap-2">${slotLine}</div>
      <div class="flex items-center justify-between border-t border-outline-variant/50 pt-3">
        <span class="text-[11px] text-on-surface-variant">رسوم الكشف <span class="font-extrabold text-on-surface tabular-nums">${money(doc.consultation_fee)}</span></span>
        <span class="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-primary text-on-primary text-xs font-bold">احجز ${icon("arrow_back", { size: 16 })}</span>
      </div>
    </div>
  </a>`;
}
