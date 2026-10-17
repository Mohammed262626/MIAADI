import { escapeHtml, formatTime, formatArabicDate, localDateISO } from "../lib/format";
import { showToast } from "../components/Toast";

type Slot = { id:string; available_date:string; start_time:string; end_time:string; is_booked?:boolean };
type Doc = { id:string; name:string; specialization:string; consultation_fee:number; available_schedules: Slot[] };

export function renderDoctorsView(
  root: HTMLElement,
  doctors: Doc[],
  onBook: (scheduleId:string, doctor: Doc, slot: Doc["available_schedules"][number]) => void,
  onSearch: (q:string)=>void,
  onSpec: (v:string)=>void,
  onSort: (v:string)=>void,
  loadDateSlots?: (doctorId: string, date: string) => Promise<Slot[]>,
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
        <div id="book-summary" class="mt-3 space-y-1.5 text-sm"></div>
        <form id="book-form" class="mt-4 space-y-3">
          <input id="book-name" required placeholder="اسم المريض" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <input id="book-phone" required placeholder="رقم الهاتف" dir="ltr" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <div class="flex gap-2">
            <button type="button" data-close-book class="flex-1 py-2.5 rounded-xl border border-line">تعديل</button>
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-teal text-white font-semibold hover:bg-teal-hover">تأكيد الحجز</button>
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
    lastList = list;
    if (!list.length) { grid.innerHTML = `<div class="col-span-full py-12 text-center text-sm text-zinc-500">لا نتائج</div>`; return; }
    // Fetch any explicitly chosen date that is outside the initial window.
    list.forEach(d => {
      const df = dateFilter.get(d.id);
      if (!df || !loadDateSlots) return;
      const k = `${d.id}|${df}`;
      if (extra.has(k) || fetching.has(k)) return;
      fetching.add(k);
      loadDateSlots(d.id, df)
        .then(slots => extra.set(k, slots))
        .catch(() => extra.set(k, []))
        .finally(() => { fetching.delete(k); renderGrid(lastList); });
    });
    grid.innerHTML = list.map(d => {
      const df = dateFilter.get(d.id) || "";
      const key = `${d.id}|${df}`;
      const loading = !!df && !extra.has(key);
      const free = df ? (extra.get(key) || []) : d.available_schedules.filter(s => !s.is_booked);
      const hasToday = free.some(s => s.available_date === TODAY);
      const viewDate = df || (hasToday ? TODAY : (free[0]?.available_date || TODAY));
      const daySlots = free.filter(s => s.available_date === viewDate);
      const next = df ? undefined : free.find(s => s.available_date > viewDate);
      const morning = daySlots.filter(s => isMorning(s.start_time));
      const afternoon = daySlots.filter(s => !isMorning(s.start_time));
      const chip = (s: Slot) => `<button data-book="${escapeHtml(d.id)}:${escapeHtml(s.id)}" class="px-3 py-1.5 rounded-xl border border-line text-xs hover:border-teal hover:text-teal">${escapeHtml(formatTime(s.start_time))}</button>`;
      const group = (title: string, slots: Slot[], hidden: boolean) => hidden ? "" : `
        <div>
          <p class="text-xs font-semibold text-zinc-600 mb-1">${title} <span class="text-zinc-400 font-normal">(${slots.length})</span></p>
          ${slots.length ? `<div class="flex flex-wrap gap-2">${slots.map(chip).join("")}</div>` : `<span class="text-xs text-zinc-400">لا مواعيد</span>`}
        </div>`;
      return `
      <div class="rounded-2xl border border-line bg-paper card p-4 flex flex-col gap-3">
        <div>
          <h3 class="font-bold">${escapeHtml(d.name)}</h3>
          <p class="text-xs text-teal font-semibold">${escapeHtml(d.specialization)} · ${escapeHtml(String(d.consultation_fee))} ر.س</p>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-zinc-600">${viewDate === TODAY ? "مواعيد اليوم" : `مواعيد ${escapeHtml(formatArabicDate(viewDate))}`}</p>
            ${df ? `<button type="button" data-date-clear="${escapeHtml(d.id)}" class="px-2 py-1 rounded-xl border border-line text-xs">أقرب يوم</button>` : ""}
          </div>
          ${loading ? `<p class="text-sm text-zinc-500">جاري تحميل المواعيد…</p>`
            : daySlots.length
              ? group("أوقات الصباح", morning, false) + group("أوقات بعد الظهر", afternoon, false)
              : `<p class="text-xs text-zinc-500">لا مواعيد ${viewDate === TODAY ? "اليوم" : "في هذا اليوم"}${next ? ` — أقرب موعد ${escapeHtml(formatArabicDate(next.available_date))}` : ""}</p>`}
          <div class="flex gap-2 items-center">
            <input type="date" data-date-for="${escapeHtml(d.id)}" value="${escapeHtml(df)}" class="flex-1 px-3 py-2 rounded-xl border border-line bg-white text-sm outline-none focus:border-teal" />
            <span class="text-xs text-zinc-500">(اختر يوماً آخر)</span>
          </div>
        </div>
      </div>`; }).join("");
    grid.querySelectorAll<HTMLButtonElement>("[data-book]").forEach(btn => {
      btn.addEventListener("click", () => {
        const [docId, schId] = (btn.dataset.book || "").split(":");
        const doc = list.find(x=>x.id===docId); const slot = doc?.available_schedules.find(s=>s.id===schId);
        if (!doc || !slot) return;
        pending = { scheduleId: schId, doctor: doc, slot };
        const durationMin = Math.round((new Date(`2000-01-01T${slot.end_time}`).getTime() - new Date(`2000-01-01T${slot.start_time}`).getTime()) / 60000);
        const row = (k: string, v: string) => `<div class="flex justify-between gap-3 text-sm"><span class="text-zinc-500">${k}</span><span class="font-medium">${v}</span></div>`;
        bookSummary.innerHTML =
          row("الطبيب", escapeHtml(doc.name)) +
          row("التخصص", escapeHtml(doc.specialization)) +
          row("التاريخ", escapeHtml(formatArabicDate(slot.available_date))) +
          row("الوقت", `${escapeHtml(formatTime(slot.start_time))} – ${escapeHtml(formatTime(slot.end_time))}`) +
          row("المدة", `${durationMin} دقيقة`) +
          row("الرسوم", `${escapeHtml(String(doc.consultation_fee))} ر.س`);
        const nameEl = root.querySelector("#book-name") as HTMLInputElement;
        const phoneEl = root.querySelector("#book-phone") as HTMLInputElement;
        // prefill from profile if available via global
        const u = (window as unknown as { __pulseUser?: { profile?: { full_name:string; phone:string } } }).__pulseUser;
        if (u?.profile?.full_name) nameEl.value = u.profile.full_name;
        if (u?.profile?.phone) phoneEl.value = u.profile.phone;
        bookDlg.showModal();
      });
    });
    grid.querySelectorAll<HTMLInputElement>("[data-date-for]").forEach(inp => {
      inp.addEventListener("change", () => {
        const id = inp.dataset.dateFor!;
        if (inp.value) dateFilter.set(id, inp.value); else dateFilter.delete(id);
        renderGrid(lastList);
      });
    });
    grid.querySelectorAll<HTMLButtonElement>("[data-date-clear]").forEach(btn => {
      btn.addEventListener("click", () => { dateFilter.delete(btn.dataset.dateClear!); renderGrid(lastList); });
    });
  };
  let lastList: Doc[] = doctors;
  const dateFilter = new Map<string, string>();
  const extra = new Map<string, Slot[]>();
  const fetching = new Set<string>();
  const TODAY = localDateISO();
  const isMorning = (t: string)=> Number(t.slice(0,2)) < 12;
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
