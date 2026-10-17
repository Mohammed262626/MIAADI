import { escapeHtml, formatTime, formatArabicDate } from "../lib/format";
import { showToast } from "../components/Toast";

type Doc = { id:string; name:string; specialization:string; consultation_fee:number; available_schedules: { id:string; available_date:string; start_time:string; end_time:string }[] };

export function renderDoctorsView(
  root: HTMLElement,
  doctors: Doc[],
  onBook: (scheduleId:string, doctor: Doc, slot: Doc["available_schedules"][number]) => void,
  onSearch: (q:string)=>void,
  onSpec: (v:string)=>void,
  onSort: (v:string)=>void,
) {
  const specs = [...new Set(doctors.map(d=>d.specialization))].sort();
  root.innerHTML = `
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="rounded-2xl border border-line bg-paper card p-6">
        <h1 class="text-[28px] font-extrabold tracking-tight leading-none">احجز موعدك</h1>
        <p class="text-sm text-zinc-500 mt-2">اختر الطبيب والموعد — الحجز ذرّي عبر RPC يمنع التداخل.</p>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input id="q" placeholder="ابحث بالاسم أو التخصص" class="sm:col-span-5 px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <select id="spec" class="sm:col-span-4 px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm">
            <option value="all">كل التخصصات</option>${specs.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("")}
          </select>
          <select id="sort" class="sm:col-span-3 px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm">
            <option value="default">الافتراضي</option><option value="fee-asc">الأقل سعراً</option><option value="fee-desc">الأعلى سعراً</option>
          </select>
        </div>
      </div>
      <div id="doctors-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </div>
    <dialog id="book-dialog" class="p-0 bg-transparent backdrop:bg-ink/60 open:grid place-items-center min-h-dvh w-full max-w-none">
      <div class="bg-paper rounded-2xl border border-line card w-full max-w-[480px] p-6 mx-4">
        <h3 class="font-bold">تأكيد الحجز</h3>
        <p id="book-summary" class="text-sm text-zinc-600 mt-2"></p>
        <form id="book-form" class="mt-4 space-y-3">
          <input id="book-name" required placeholder="اسم المريض" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <input id="book-phone" required placeholder="رقم الهاتف" dir="ltr" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <div class="flex gap-2">
            <button type="button" data-close-book class="flex-1 py-2.5 rounded-xl border border-line">إلغاء</button>
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-teal text-white font-semibold hover:bg-teal-hover">تأكيد</button>
          </div>
        </form>
      </div>
    </dialog>
  `;
  const qEl = root.querySelector("#q") as HTMLInputElement;
  const specEl = root.querySelector("#spec") as HTMLSelectElement;
  const sortEl = root.querySelector("#sort") as HTMLSelectElement;
  let debounce: number | undefined;
  qEl.addEventListener("input", () => { clearTimeout(debounce); debounce = window.setTimeout(()=> onSearch(qEl.value), 250); });
  specEl.addEventListener("change", () => onSpec(specEl.value));
  sortEl.addEventListener("change", () => onSort(sortEl.value));

  const grid = root.querySelector("#doctors-grid") as HTMLElement;
  const bookDlg = root.querySelector("#book-dialog") as HTMLDialogElement;
  const bookSummary = root.querySelector("#book-summary") as HTMLElement;
  const bookForm = root.querySelector("#book-form") as HTMLFormElement;
  let pending: { scheduleId:string; doctor:Doc; slot: Doc["available_schedules"][number] } | null = null;

  const renderGrid = (list: Doc[]) => {
    if (!list.length) { grid.innerHTML = `<div class="col-span-full py-12 text-center text-sm text-zinc-500">لا نتائج</div>`; return; }
    grid.innerHTML = list.map(d => `
      <div class="rounded-2xl border border-line bg-paper card p-4 flex flex-col gap-3">
        <div>
          <h3 class="font-bold">${escapeHtml(d.name)}</h3>
          <p class="text-xs text-teal font-semibold">${escapeHtml(d.specialization)} · ${escapeHtml(String(d.consultation_fee))} ر.س</p>
        </div>
        ${d.available_schedules.length ? `
          <div class="space-y-2">
            <p class="text-xs font-semibold text-zinc-600">مواعيد متاحة</p>
            <div class="flex flex-wrap gap-2">
              ${d.available_schedules.slice(0,8).map(s => `
                <button data-book="${escapeHtml(d.id)}:${escapeHtml(s.id)}" class="px-3 py-1.5 rounded-xl border border-line text-xs hover:border-teal hover:text-teal">
                  ${escapeHtml(formatArabicDate(s.available_date))} · ${escapeHtml(formatTime(s.start_time))}–${escapeHtml(formatTime(s.end_time))}
                </button>`).join("")}
            </div>
            ${d.available_schedules.length > 8 ? `<p class="text-xs text-zinc-500">+${d.available_schedules.length - 8} أخرى — استخدم التاريخ أدناه</p>` : ""}
            <div class="flex gap-2 items-center">
              <input type="date" data-date-for="${escapeHtml(d.id)}" class="flex-1 px-3 py-2 rounded-xl border border-line bg-white text-sm outline-none focus:border-teal" />
              <span class="text-xs text-zinc-500">(اختر يوماً لعرض مواعيده)</span>
            </div>
          </div>` : `<p class="text-xs text-zinc-500">لا مواعيد متاحة حالياً</p>`}
      </div>`).join("");
    grid.querySelectorAll<HTMLButtonElement>("[data-book]").forEach(btn => {
      btn.addEventListener("click", () => {
        const [docId, schId] = (btn.dataset.book || "").split(":");
        const doc = list.find(x=>x.id===docId); const slot = doc?.available_schedules.find(s=>s.id===schId);
        if (!doc || !slot) return;
        pending = { scheduleId: schId, doctor: doc, slot };
        bookSummary.textContent = `${doc.name} — ${formatArabicDate(slot.available_date)} ${formatTime(slot.start_time)}`;
        const nameEl = root.querySelector("#book-name") as HTMLInputElement;
        const phoneEl = root.querySelector("#book-phone") as HTMLInputElement;
        // prefill from profile if available via global
        const u = (window as unknown as { __pulseUser?: { profile?: { full_name:string; phone:string } } }).__pulseUser;
        if (u?.profile?.full_name) nameEl.value = u.profile.full_name;
        if (u?.profile?.phone) phoneEl.value = u.profile.phone;
        bookDlg.showModal();
      });
    });
  };
  renderGrid(doctors);

  root.querySelector("[data-close-book]")?.addEventListener("click", ()=> bookDlg.close());
  bookDlg.addEventListener("click", (e)=> { if (e.target===bookDlg) bookDlg.close(); });
  bookForm.addEventListener("submit", async (e)=> {
    e.preventDefault();
    if (!pending) return;
    const patientName = (root.querySelector("#book-name") as HTMLInputElement).value.trim();
    const patientPhone = (root.querySelector("#book-phone") as HTMLInputElement).value.trim();
    if (!patientName || !patientPhone) { showToast("أدخل الاسم والهاتف", "warning"); return; }
    try {
      await onBook(pending.scheduleId, pending.doctor, pending.slot);
      // onBook handles RPC; we just provided patient data via closure — actually pass through
      // Instead, store and let caller read inputs: do it here
      bookDlg.close();
    } catch {}
  });

  // expose helper for app.ts to read pending booking inputs and perform RPC
  return {
    update: renderGrid,
    getPending: () => pending,
    getPatientInputs: () => ({ patientName: (root.querySelector("#book-name") as HTMLInputElement).value.trim(), patientPhone: (root.querySelector("#book-phone") as HTMLInputElement).value.trim() }),
    closeBook: () => bookDlg.close(),
    setPending: (p: typeof pending) => { pending = p; }
  };
}
