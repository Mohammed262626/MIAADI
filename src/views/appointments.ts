import { escapeHtml, formatTime, formatArabicDate } from "../lib/format";

type Appt = { id:string; status:string; patient_name:string; patient_phone:string; doctor_schedules?: { available_date:string; start_time:string; end_time:string; doctors?: { name:string; specialization:string } } };

function badge(status:string): string {
  const map: Record<string,string> = { booked:"bg-amber-100 text-amber-800 border-amber-200", completed:"bg-emerald-100 text-emerald-800 border-emerald-200", cancelled_by_patient:"bg-zinc-100 text-zinc-600 border-zinc-200", cancelled_by_clinic:"bg-red-50 text-red-700 border-red-200", no_show:"bg-zinc-100 text-zinc-500 border-zinc-200" };
  const label: Record<string,string> = { booked:"مؤكد", completed:"مكتمل", cancelled_by_patient:"ملغي", cancelled_by_clinic:"ملغي (عيادة)", no_show:"لم يحضر" };
  return `<span class="px-2 py-1 rounded-full border text-xs font-semibold ${map[status]||"bg-zinc-100 text-zinc-600 border-zinc-200"}">${escapeHtml(label[status]||status)}</span>`;
}

export function renderAppointmentsView(root: HTMLElement, list: Appt[], onCancel:(id:string)=>void, onReschedule:(id:string)=>void, onShare:(a:Appt)=>void) {
  if (!list.length) {
    root.innerHTML = `<div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 text-center">
      <h2 class="font-bold text-lg">لا حجوزات بعد</h2>
      <p class="text-sm text-zinc-500 mt-2">عند حجز موعد سيظهر هنا، مع إمكانية تعديله أو إلغائه أو مشاركته.</p>
      <a href="#doctors" class="inline-block mt-4 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold">احجز الآن</a>
    </div>`;
    return;
  }
  root.innerHTML = `<div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8"><h2 class="font-bold text-lg mb-4">حجوزاتي</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${list.map(a => {
    const s = a.doctor_schedules; const doc = s?.doctors;
    const isBooked = a.status === "booked";
    return `<div class="rounded-2xl border border-line bg-paper card p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2"><span class="text-xs text-zinc-500">#${escapeHtml(a.id.slice(0,8))}</span>${badge(a.status)}</div>
      <div><h3 class="font-bold">${escapeHtml(doc?.name || "الطبيب")}</h3><p class="text-xs text-teal font-semibold">${escapeHtml(doc?.specialization || "—")}</p></div>
      <div class="rounded-xl bg-paper-soft border border-line p-3 text-xs space-y-1.5">
        <div>${escapeHtml(formatArabicDate(s?.available_date || ""))} · ${escapeHtml(formatTime(s?.start_time || ""))}–${escapeHtml(formatTime(s?.end_time || ""))}</div>
        <div>المريض: <strong>${escapeHtml(a.patient_name)}</strong></div>
        <div dir="ltr" class="text-left">${escapeHtml(a.patient_phone)}</div>
      </div>
      ${isBooked ? `<div class="flex gap-2 flex-wrap">
        <button data-reschedule="${escapeHtml(a.id)}" class="flex-1 py-2 rounded-xl border border-line text-sm">تعديل</button>
        <button data-share="${escapeHtml(a.id)}" class="px-3 py-2 rounded-xl border border-line text-sm">مشاركة</button>
        <button data-cancel="${escapeHtml(a.id)}" class="px-3 py-2 rounded-xl bg-danger text-white text-sm">إلغاء</button>
      </div>` : `<p class="text-xs text-zinc-500 text-center">لا إجراءات</p>`}
    </div>`;
  }).join("")}</div></div>`;
  root.querySelectorAll<HTMLButtonElement>("[data-cancel]").forEach(b=> b.addEventListener("click", ()=> onCancel(b.dataset.cancel!)));
  root.querySelectorAll<HTMLButtonElement>("[data-reschedule]").forEach(b=> b.addEventListener("click", ()=> onReschedule(b.dataset.reschedule!)));
  root.querySelectorAll<HTMLButtonElement>("[data-share]").forEach(b=> b.addEventListener("click", ()=> { const a=list.find(x=>x.id===b.dataset.share); if(a) onShare(a); }));
}
