import { escapeHtml, formatTime, formatArabicDate, localDateISO } from "../lib/format";

type Row = { appointment_id:string; patient_name:string; patient_phone:string; doctor_name:string; available_date:string; start_time:string; status:string; doctor_id:string };

export function renderAdminView(
  root: HTMLElement,
  opts: {
    rows: Row[]; total: number; page:number; pageSize:number; stats:{total:number;booked:number;completed:number;cancelled:number;noShow:number;today:number};
    filters: { status:string; doctorId:string; dateFrom:string; dateTo:string; search:string; sortBy:string; sortDir:string };
    doctors: { id:string; name:string }[];
    onFilter: (patch: Partial<typeof opts.filters>)=>void;
    onPage: (dir: 1|-1)=>void;
    onState: (id:string, state:"completed"|"no_show")=>Promise<void>;
    onClinicCancel: (id:string)=>Promise<void>;
    onManageTab: (tab:"appointments"|"management"|"accounts")=>void;
    activeSubTab: "appointments"|"management"|"accounts";
  }
) {
  const { rows, total, page, pageSize, stats, filters, doctors } = opts;
  const from = total ? page*pageSize+1 : 0, to = Math.min((page+1)*pageSize, total);
  root.innerHTML = `
  <div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-extrabold text-lg">لوحة الإدارة</h2>
      <nav class="flex gap-1 p-1 rounded-xl bg-paper-soft border border-line text-sm">
        <button data-sub="appointments" class="px-3 py-1.5 rounded-xl ${opts.activeSubTab==="appointments"?"bg-ink text-white":"hover:bg-white"}">الحجوزات</button>
        <button data-sub="management" class="px-3 py-1.5 rounded-xl ${opts.activeSubTab==="management"?"bg-ink text-white":"hover:bg-white"}">الأطباء والمواعيد</button>
        <button data-sub="accounts" class="px-3 py-1.5 rounded-xl ${opts.activeSubTab==="accounts"?"bg-ink text-white":"hover:bg-white"}">الحسابات</button>
      </nav>
    </div>
    <div id="admin-sub-root"></div>
  </div>
  <dialog id="admin-confirm" class="p-0 bg-transparent backdrop:bg-ink/60 open:grid place-items-center min-h-dvh w-full max-w-none">
    <div class="bg-paper rounded-2xl border border-line card w-full max-w-[440px] p-6 mx-4">
      <h3 id="admin-confirm-title" class="font-bold"></h3>
      <p id="admin-confirm-msg" class="text-sm text-zinc-600 mt-2"></p>
      <div class="flex gap-2 mt-4">
        <button data-cancel-confirm class="flex-1 py-2.5 rounded-xl border border-line">تراجع</button>
        <button id="admin-confirm-ok" class="flex-1 py-2.5 rounded-xl bg-danger text-white font-semibold">تأكيد</button>
      </div>
    </div>
  </dialog>`;
  root.querySelectorAll<HTMLButtonElement>("[data-sub]").forEach(b=> b.addEventListener("click", ()=> opts.onManageTab(b.dataset.sub as never)));
  const subRoot = root.querySelector("#admin-sub-root") as HTMLElement;
  const confirmDlg = root.querySelector("#admin-confirm") as HTMLDialogElement;
  const confirmTitle = root.querySelector("#admin-confirm-title") as HTMLElement;
  const confirmMsg = root.querySelector("#admin-confirm-msg") as HTMLElement;
  const confirmOk = root.querySelector("#admin-confirm-ok") as HTMLButtonElement;
  let confirmAction: (()=>Promise<void>) | null = null;
  const openConfirm = (title:string, msg:string, label:string, action:()=>Promise<void>) => {
    confirmTitle.textContent = title; confirmMsg.textContent = msg; confirmOk.textContent = label; confirmAction = action; confirmDlg.showModal();
  };
  confirmDlg.querySelector("[data-cancel-confirm]")?.addEventListener("click", ()=> confirmDlg.close());
  confirmDlg.addEventListener("click", e=> { if(e.target===confirmDlg) confirmDlg.close(); });
  confirmOk.addEventListener("click", async ()=> { const a=confirmAction; confirmDlg.close(); if(a) await a(); });

  if (opts.activeSubTab !== "appointments") {
    subRoot.innerHTML = `<div class="rounded-2xl border border-line bg-paper card p-8 text-center text-sm text-zinc-500">هذا القسم يُعرض عبر العرض الحالي — حدّث الصفحة بعد اختيار التبويب</div>`;
    // management/accounts are rendered by the main admin mount in app.ts via separate functions; keep this view minimal
    return { openConfirm };
  }

  subRoot.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      ${[["إجمالي",stats.total],["اليوم",stats.today],["مؤكدة",stats.booked],["مكتملة",stats.completed],["ملغاة",stats.cancelled],["غياب",stats.noShow]].map(([l,v])=>`
        <div class="rounded-2xl border border-line bg-paper card p-4"><div class="text-xs text-zinc-500">${escapeHtml(String(l))}</div><div class="font-bold text-lg">${escapeHtml(String(v))}</div></div>`).join("")}
    </div>
    <div class="rounded-2xl border border-line bg-paper card p-4 space-y-3">
      <div class="flex flex-wrap gap-2 items-center">
        ${["all","booked","completed","no_show","cancelled"].map(s=>{
          const labels:Record<string,string>={all:"الكل",booked:"مؤكد",completed:"مكتمل",no_show:"غياب",cancelled:"ملغي"};
          const active = filters.status===s;
          return `<button data-status="${s}" class="px-3 py-1.5 rounded-xl text-xs font-semibold border ${active?"bg-ink text-white border-ink":"border-line hover:bg-paper-soft"}">${labels[s]}</button>`;
        }).join("")}
        <select id="admin-doc-filter" class="ml-auto px-3 py-2 rounded-xl border border-line bg-white text-sm"><option value="">كل الأطباء</option>${doctors.map(d=>`<option value="${escapeHtml(d.id)}" ${filters.doctorId===d.id?"selected":""}>${escapeHtml(d.name)}</option>`).join("")}</select>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <input id="admin-search" placeholder="بحث بالاسم أو الهاتف" value="${escapeHtml(filters.search)}" class="flex-1 px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <input id="admin-from" type="date" value="${escapeHtml(filters.dateFrom)}" class="px-3 py-2.5 rounded-xl border border-line bg-white text-sm" />
        <span class="self-center text-xs text-zinc-500">إلى</span>
        <input id="admin-to" type="date" value="${escapeHtml(filters.dateTo)}" class="px-3 py-2.5 rounded-xl border border-line bg-white text-sm" />
        <select id="admin-sort" class="px-3 py-2.5 rounded-xl border border-line bg-white text-sm">
          <option value="available_date_desc" ${filters.sortBy==="available_date"&&filters.sortDir==="desc"?"selected":""}>الأحدث</option>
          <option value="available_date_asc" ${filters.sortBy==="available_date"&&filters.sortDir==="asc"?"selected":""}>الأقدم</option>
          <option value="patient_name_asc" ${filters.sortBy==="patient_name"?"selected":""}>اسم المريض</option>
        </select>
      </div>
    </div>
    <div class="rounded-2xl border border-line bg-paper card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-paper-soft text-zinc-500 border-b border-line"><tr><th class="p-3 text-right font-semibold">المريض</th><th class="p-3 text-right font-semibold">الهاتف</th><th class="p-3 text-right font-semibold">الطبيب</th><th class="p-3 text-right font-semibold">الموعد</th><th class="p-3 text-right font-semibold">الحالة</th><th class="p-3 text-center font-semibold">إجراء</th></tr></thead>
          <tbody id="admin-tbody" class="divide-y divide-line"></tbody>
        </table>
      </div>
      <div id="admin-mobile" class="hidden p-3 space-y-3"></div>
      <div class="flex items-center justify-between px-4 py-3 border-t border-line text-sm">
        <button id="admin-prev" class="px-3 py-1.5 rounded-xl border border-line disabled:opacity-40">السابق</button>
        <span class="text-zinc-500">${from}–${to} من ${total}</span>
        <button id="admin-next" class="px-3 py-1.5 rounded-xl border border-line disabled:opacity-40">التالي</button>
      </div>
    </div>`;

  const tbody = subRoot.querySelector("#admin-tbody") as HTMLElement;
  const mobile = subRoot.querySelector("#admin-mobile") as HTMLElement;
  const renderRows = () => {
    const badge = (s:string)=> {
      const m:Record<string,string>={booked:"bg-amber-100 text-amber-800 border-amber-200",completed:"bg-emerald-100 text-emerald-800 border-emerald-200",cancelled_by_patient:"bg-zinc-100 text-zinc-600 border-zinc-200",cancelled_by_clinic:"bg-red-50 text-red-700 border-red-200",no_show:"bg-zinc-100 text-zinc-500 border-zinc-200"};
      const l:Record<string,string>={booked:"مؤكد",completed:"مكتمل",cancelled_by_patient:"ملغي",cancelled_by_clinic:"ملغي (عيادة)",no_show:"لم يحضر",cancelled:"ملغي"};
      return `<span class="px-2 py-1 rounded-full border text-xs ${m[s]||"bg-zinc-100 text-zinc-600 border-zinc-200"}">${escapeHtml(l[s]||s)}</span>`;
    };
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-zinc-500">لا نتائج</td></tr>`; mobile.innerHTML = `<p class="text-center text-sm text-zinc-500 py-6">لا نتائج</p>`; return; }
    tbody.innerHTML = rows.map(r=>`
      <tr class="hover:bg-paper-soft/50">
        <td class="p-3 font-semibold">${escapeHtml(r.patient_name)}</td>
        <td class="p-3 font-mono text-xs" dir="ltr">${escapeHtml(r.patient_phone)}</td>
        <td class="p-3">${escapeHtml(r.doctor_name)}</td>
        <td class="p-3 text-xs">${escapeHtml(formatArabicDate(r.available_date))} · ${escapeHtml(formatTime(r.start_time))}</td>
        <td class="p-3">${badge(r.status)}</td>
        <td class="p-3 text-center">${r.status==="booked" ? `<span class="inline-flex gap-1">
          <button data-complete="${escapeHtml(r.appointment_id)}" class="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">اكتمل</button>
          <button data-noshow="${escapeHtml(r.appointment_id)}" class="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs">لم يحضر</button>
          <button data-cancel="${escapeHtml(r.appointment_id)}" class="px-2.5 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">إلغاء</button>
        </span>` : `<span class="text-xs text-zinc-400">—</span>`}</td>
      </tr>`).join("");
    mobile.innerHTML = rows.map(r=>`
      <div class="rounded-2xl border border-line bg-paper-soft p-3">
        <div class="flex items-center justify-between gap-2"><span class="font-semibold text-sm">${escapeHtml(r.patient_name)}</span>${badge(r.status)}</div>
        <div class="text-xs text-zinc-600 mt-1" dir="ltr">${escapeHtml(r.patient_phone)}</div>
        <div class="text-xs text-zinc-600 mt-2">الطبيب: ${escapeHtml(r.doctor_name)} · ${escapeHtml(formatArabicDate(r.available_date))} ${escapeHtml(formatTime(r.start_time))}</div>
        ${r.status==="booked" ? `<div class="flex gap-1.5 mt-3">
          <button data-complete="${escapeHtml(r.appointment_id)}" class="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">اكتمل</button>
          <button data-noshow="${escapeHtml(r.appointment_id)}" class="flex-1 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs">لم يحضر</button>
          <button data-cancel="${escapeHtml(r.appointment_id)}" class="flex-1 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">إلغاء</button>
        </div>` : ""}
      </div>`).join("");
    subRoot.querySelectorAll<HTMLButtonElement>("[data-complete]").forEach(b=> b.addEventListener("click", ()=> opts.onState(b.dataset.complete!, "completed")));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-noshow]").forEach(b=> b.addEventListener("click", ()=> opts.onState(b.dataset.noshow!, "no_show")));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-cancel]").forEach(b=> b.addEventListener("click", ()=> {
      const id = b.dataset.cancel!; const row = rows.find(x=>x.appointment_id===id);
      openConfirm("إلغاء من العيادة", `إلغاء موعد ${row?.patient_name || "المريض"} وإتاحة الموعد مجدداً؟`, "تأكيد الإلغاء", async ()=> { await opts.onClinicCancel(id); });
    }));
  };
  renderRows();

  const searchEl = subRoot.querySelector("#admin-search") as HTMLInputElement;
  const fromEl = subRoot.querySelector("#admin-from") as HTMLInputElement;
  const toEl = subRoot.querySelector("#admin-to") as HTMLInputElement;
  const docEl = subRoot.querySelector("#admin-doc-filter") as HTMLSelectElement;
  const sortEl = subRoot.querySelector("#admin-sort") as HTMLSelectElement;
  let t: number | undefined;
  searchEl.addEventListener("input", ()=> { clearTimeout(t); t=window.setTimeout(()=> opts.onFilter({ search: searchEl.value }), 400); });
  fromEl.addEventListener("change", ()=> opts.onFilter({ dateFrom: fromEl.value || localDateISO() }));
  toEl.addEventListener("change", ()=> opts.onFilter({ dateTo: toEl.value || localDateISO() }));
  docEl.addEventListener("change", ()=> opts.onFilter({ doctorId: docEl.value }));
  sortEl.addEventListener("change", ()=> {
    const [sortBy, sortDir] = sortEl.value.split("_").length===3 ? [sortEl.value.split("_").slice(0,2).join("_"), sortEl.value.split("_")[2]] : sortEl.value.split("_") as [string,string];
    // mappings: available_date_desc -> available_date desc, etc.
    const map:Record<string,[string,string]>={ available_date_desc:["available_date","desc"], available_date_asc:["available_date","asc"], patient_name_asc:["patient_name","asc"] };
    const m = map[sortEl.value] || ["available_date","desc"];
    opts.onFilter({ sortBy: m[0], sortDir: m[1] });
  });
  subRoot.querySelectorAll<HTMLButtonElement>("[data-status]").forEach(b=> b.addEventListener("click", ()=> opts.onFilter({ status: b.dataset.status! })));
  (subRoot.querySelector("#admin-prev") as HTMLButtonElement).disabled = page===0;
  (subRoot.querySelector("#admin-next") as HTMLButtonElement).disabled = (page+1)*pageSize >= total;
  subRoot.querySelector("#admin-prev")?.addEventListener("click", ()=> opts.onPage(-1));
  subRoot.querySelector("#admin-next")?.addEventListener("click", ()=> opts.onPage(1));

  // responsive switch
  const syncView = () => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const tableWrap = subRoot.querySelector("table")?.parentElement as HTMLElement | null;
    if (tableWrap) tableWrap.classList.toggle("hidden", isMobile);
    mobile.classList.toggle("hidden", !isMobile);
  };
  syncView(); window.addEventListener("resize", syncView);

  return { openConfirm };
}
