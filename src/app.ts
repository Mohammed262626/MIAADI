import "./styles/tailwind.css";
import { getCurrentUser, onAuthChange, logoutUser, loginUser, registerPatient, getDoctorsWithSchedules, bookAppointmentRPC, getPatientAppointments, cancelAppointmentRPC, rescheduleAppointmentRPC, getAdminAppointments, getAdminStats, updateAppointmentState, cancelAppointmentClinic, listDoctors, adminListProfiles, assignUserRole, saveDoctor, deleteDoctor, findDoctorByUser, listDoctorSchedules, createDoctorSchedule, deleteDoctorSchedule, subscribeToRealtimeUpdates, getAvailableSlots, getDoctorAvailability, saveDoctorAvailability, blockDoctorDates, generateDoctorSchedule } from "./lib/supabase";
import { localDateISO, escapeHtml, translateAuthError, formatTime, formatArabicDate } from "./lib/format";
import { showToast } from "./components/Toast";
import { renderHeader } from "./components/Header";
import { mountAuthModal } from "./components/AuthModal";
import { renderDoctorsView } from "./views/doctors";
import { renderAppointmentsView } from "./views/appointments";
import { renderAdminView } from "./views/admin";

type Tab = "doctors" | "appointments" | "admin";

const state = {
  currentUser: null as Awaited<ReturnType<typeof getCurrentUser>>,
  doctors: [] as Awaited<ReturnType<typeof getDoctorsWithSchedules>>,
  patientAppointments: [] as Awaited<ReturnType<typeof getPatientAppointments>>,
  activeTab: "doctors" as Tab,
  searchQuery: "",
  selectedSpec: "all",
  sortBy: "default" as "default"|"fee-asc"|"fee-desc",
  // admin
  adminFilters: { status:"all", doctorId:"", dateFrom: localDateISO(), dateTo: localDateISO(), search:"", sortBy:"available_date", sortDir:"desc" },
  adminPage: 0, adminPageSize: 25, adminTotal: 0,
  adminRows: [] as { appointment_id:string; patient_name:string; patient_phone:string; doctor_name:string; available_date:string; start_time:string; status:string; doctor_id:string }[],
  adminDoctors: [] as Awaited<ReturnType<typeof listDoctors>>,
  adminAccounts: [] as Awaited<ReturnType<typeof adminListProfiles>>,
  adminSubTab: "appointments" as "appointments"|"management"|"accounts",
  adminManagementDoctor: null as string | null,
  adminDoctorsCache: [] as Awaited<ReturnType<typeof listDoctors>>,
};

const appEl = document.getElementById("app") as HTMLElement;
const toastContainer = document.getElementById("toast-container") as HTMLElement;
if (!toastContainer) { const t=document.createElement("div"); t.id="toast-container"; t.className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"; document.body.appendChild(t); }

let authModal: ReturnType<typeof mountAuthModal> | null = null;
let doctorsViewApi: ReturnType<typeof renderDoctorsView> | null = null;

function getTabFromHash(): Tab {
  const h = location.hash.replace("#","") as Tab;
  return h==="appointments"||h==="admin"||h==="doctors" ? h : "doctors";
}

function render() {
  const tab = state.activeTab;
  const role = state.currentUser?.profile?.role as string | undefined;
  const canAdmin = role==="admin" || role==="doctor";
  if (tab==="admin" && !canAdmin) { state.activeTab = "doctors"; location.hash = "#doctors"; return render(); }
  if (tab==="appointments" && !state.currentUser) {
    // prompt login but still show empty state
  }
  const badge = state.patientAppointments.filter(a=>a.status==="booked").length;
  // @ts-ignore expose for prefill
  (window as unknown as Record<string,unknown>).__pulseUser = state.currentUser;

  const headerHtml = renderHeader(tab, state.currentUser as Parameters<typeof renderHeader>[1], badge);
  appEl.innerHTML = `${headerHtml}<main id="main-root"></main><div id="auth-mount"></div>`;

  // header actions
  appEl.querySelector('[data-action="open-auth"]')?.addEventListener("click", ()=> authModal?.open());
  appEl.querySelector('[data-action="logout"]')?.addEventListener("click", async ()=> { try{ await logoutUser(); state.currentUser=null; state.patientAppointments=[]; location.hash="#doctors"; state.activeTab="doctors"; render(); showToast("تم تسجيل الخروج","success"); } catch(e){ showToast(translateAuthError(e),"error"); } });

  // mount auth modal
  const authMount = document.getElementById("auth-mount") as HTMLElement;
  authModal = mountAuthModal(authMount,
    async ({email,password})=> { const r=await loginUser({email,password}); state.currentUser = await getCurrentUser(); state.activeTab="doctors"; location.hash="#doctors"; await refreshAll(); render(); return r as unknown as void; },
    async ({email,password,fullName,phone})=> { const r=await registerPatient({email,password,fullName,phone}); state.currentUser = await getCurrentUser(); await refreshAll(); render(); return r as unknown as void; }
  );

  const main = document.getElementById("main-root") as HTMLElement;
  if (tab==="doctors") renderDoctorsTab(main);
  else if (tab==="appointments") renderAppointmentsTab(main);
  else if (tab==="admin") renderAdminTab(main);
}

type Doc = { id:string; name:string; specialization:string; consultation_fee:number; available_schedules: { id:string; available_date:string; start_time:string; end_time:string }[] };
function filteredDoctors(): Doc[] {
  let list = [...(state.doctors as unknown as Doc[])];
  const q = state.searchQuery.trim().toLowerCase();
  if (q) list = list.filter(d=> d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q));
  if (state.selectedSpec!=="all") list = list.filter(d=> d.specialization===state.selectedSpec);
  if (state.sortBy==="fee-asc") list.sort((a,b)=> a.consultation_fee - b.consultation_fee);
  if (state.sortBy==="fee-desc") list.sort((a,b)=> b.consultation_fee - a.consultation_fee);
  return list;
}

function renderDoctorsTab(main: HTMLElement) {
  doctorsViewApi = renderDoctorsView(main, filteredDoctors(),
    async (scheduleId, _doctor, _slot)=>{
      // read patient inputs from view
      const pending = doctorsViewApi?.getPending();
      const inputs = doctorsViewApi?.getPatientInputs();
      const patientName = inputs?.patientName || "";
      const patientPhone = inputs?.patientPhone || "";
      if (!state.currentUser) { showToast("سجّل الدخول أولاً","warning"); authModal?.open(); return; }
      if (!patientName || !patientPhone) { showToast("أدخل الاسم والهاتف","warning"); return; }
      try {
        await bookAppointmentRPC({ scheduleId, patientName, patientPhone });
        showToast("تم الحجز بنجاح","success");
        doctorsViewApi?.closeBook();
        await refreshDoctors(); await refreshAppointments();
        render();
      } catch (e) { showToast(translateAuthError(e),"error"); }
      void pending;
    },
    (q)=> { state.searchQuery=q; const upd = filteredDoctors(); doctorsViewApi?.update(upd); },
    (v)=> { state.selectedSpec=v; doctorsViewApi?.update(filteredDoctors()); },
    (v)=> { state.sortBy=v as typeof state.sortBy; doctorsViewApi?.update(filteredDoctors()); }
  );
}

function renderAppointmentsTab(main: HTMLElement) {
  if (!state.currentUser) {
    main.innerHTML = `<div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 text-center"><p class="text-sm text-zinc-600">سجّل الدخول لعرض حجوزاتك</p><button data-open-auth class="mt-3 px-4 py-2 rounded-xl bg-ink text-white text-sm">دخول</button></div>`;
    main.querySelector("[data-open-auth]")?.addEventListener("click", ()=> authModal?.open());
    return;
  }
  renderAppointmentsView(main, state.patientAppointments as unknown as Parameters<typeof renderAppointmentsView>[1],
    async (id)=>{
      const a = state.patientAppointments.find(x=> String(x.id)===id) as unknown as { doctor_schedules?: { available_date:string; start_time:string } } | undefined;
      const details = a?.doctor_schedules ? `${escapeHtml(formatArabicDate(a.doctor_schedules.available_date || ""))} ${escapeHtml(formatTime(a.doctor_schedules.start_time || ""))}` : "";
      if (!confirm(`إلغاء الموعد ${details}؟`)) return;
      try { await cancelAppointmentRPC(id); showToast("تم الإلغاء","success"); await refreshAll(); render(); } catch(e){ showToast(translateAuthError(e),"error"); }
    },
    async (id)=>{
      // reschedule: pick new slot via prompt — reuse doctors view slots
      const a = state.patientAppointments.find(x=>x.id===id);
      const docId = (a as unknown as { doctor_schedules?: { doctors?: { id:string } } })?.doctor_schedules?.doctors?.id;
      if (!docId) { showToast("تعذر تحديد الطبيب","error"); return; }
      const date = prompt("أدخل التاريخ الجديد YYYY-MM-DD");
      if (!date) return;
      try {
        const slots = await getAvailableSlots(docId, date, date);
        if (!slots.length) { showToast("لا مواعيد في هذا التاريخ","warning"); return; }
        const choice = prompt(`اختر رقم الموعد:\n${slots.map((s: {id:string;start_time:string;end_time:string},i:number)=>`${i+1}. ${s.start_time}-${s.end_time} (${s.id.slice(0,6)})`).join("\n")}`);
        const idx = parseInt(choice||"",10)-1;
        const slot = slots[idx];
        if (!slot) return;
        await rescheduleAppointmentRPC({ appointmentId:id, newScheduleId: slot.id });
        showToast("تمت إعادة الجدولة","success"); await refreshAll(); render();
      } catch(e){ showToast(translateAuthError(e),"error"); }
    },
    (a)=>{
      const s = a.doctor_schedules as { available_date:string; start_time:string; doctors?: { name:string; specialization:string } } | undefined;
      const docName = s?.doctors?.name || "الطبيب"; const spec = s?.doctors?.specialization || "";
      const msg = `تذكير بموعدي في نبض العافية:\n- الطبيب: ${docName} (${spec})\n- التاريخ: ${formatArabicDate(s?.available_date||"")}\n- الوقت: ${formatTime(s?.start_time||"")}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  );
}

async function renderAdminTab(main: HTMLElement) {
  const role = state.currentUser?.profile?.role as string;
  const isDoctor = role==="doctor";
  // preload admin data
  try {
    if (isDoctor) {
      const my = await findDoctorByUser(state.currentUser!.id);
      state.adminManagementDoctor = my?.id || null;
    }
    if (!state.adminDoctors.length) state.adminDoctors = await listDoctors();
    state.adminDoctorsCache = state.adminDoctors;
  } catch {}
  let stats = { total:0, booked:0, completed:0, cancelled:0, noShow:0, today:0 };
  try { stats = await getAdminStats(); } catch {}
  try {
    const res = await getAdminAppointments({ statuses: state.adminFilters.status==="all"?undefined: state.adminFilters.status==="cancelled"? ["cancelled_by_patient","cancelled_by_clinic"] : [state.adminFilters.status], doctorId: state.adminFilters.doctorId||undefined, dateFrom: state.adminFilters.dateFrom||undefined, dateTo: state.adminFilters.dateTo||undefined, search: state.adminFilters.search||undefined, page: state.adminPage, pageSize: state.adminPageSize, sortBy: state.adminFilters.sortBy, sortDir: state.adminFilters.sortDir });
    state.adminRows = (res.rows as typeof state.adminRows) || []; state.adminTotal = res.total || 0;
  } catch (e) { showToast(translateAuthError(e),"error"); }

  const api = renderAdminView(main, {
    rows: state.adminRows, total: state.adminTotal, page: state.adminPage, pageSize: state.adminPageSize, stats,
    filters: state.adminFilters, doctors: state.adminDoctors.map(d=>({id:d.id,name:d.name})),
    onFilter: (patch)=> { Object.assign(state.adminFilters, patch); state.adminPage=0; renderAdminTab(main); },
    onPage: (dir)=> { state.adminPage = Math.max(0, state.adminPage + dir); renderAdminTab(main); },
    onState: async (id, s)=> { try{ await updateAppointmentState(id,s); showToast("تم التحديث","success"); await refreshAdminRows(); renderAdminTab(main); } catch(e){ showToast(translateAuthError(e),"error"); } },
    onClinicCancel: async (id)=> { await cancelAppointmentClinic(id); showToast("تم الإلغاء وإتاحة الموعد","success"); await refreshAdminRows(); await refreshDoctors(); },
    onManageTab: (tab)=> { state.adminSubTab=tab; if(tab==="appointments") renderAdminTab(main); else renderAdminManagement(main, tab); },
    activeSubTab: state.adminSubTab,
  });
  void api;
}

async function renderAdminManagement(main: HTMLElement, tab: "management"|"accounts") {
  if (tab==="accounts") {
    try { state.adminAccounts = await adminListProfiles(); } catch(e){ showToast(translateAuthError(e),"error"); }
    const rows = state.adminAccounts as { user_id:string; full_name:string; email:string; phone:string; role:string }[];
    main.innerHTML = `
      <div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div class="flex items-center gap-2">
          <button data-back class="px-3 py-2 rounded-xl border border-line text-sm">رجوع للحجوزات</button>
          <h2 class="font-bold">الحسابات والأدوار</h2>
        </div>
        <div class="rounded-2xl border border-line bg-paper card overflow-hidden">
          <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-paper-soft border-b border-line text-zinc-500"><tr><th class="p-3 text-right">الاسم</th><th class="p-3 text-right">البريد</th><th class="p-3 text-right">الهاتف</th><th class="p-3 text-right">الدور</th><th class="p-3">إجراء</th></tr></thead>
          <tbody class="divide-y divide-line">${rows.map(p=>`
            <tr><td class="p-3 font-semibold">${escapeHtml(p.full_name||"—")}</td><td class="p-3 font-mono text-xs" dir="ltr">${escapeHtml(p.email||"")}</td><td class="p-3 font-mono text-xs" dir="ltr">${escapeHtml(p.phone||"—")}</td><td class="p-3"><span class="px-2 py-1 rounded-full border text-xs ${p.role==="admin"?"bg-ink text-white border-ink":p.role==="doctor"?"bg-teal text-white border-teal":"bg-zinc-100 text-zinc-700 border-zinc-200"}">${escapeHtml(p.role)}</span></td>
            <td class="p-3"><select data-role-for="${escapeHtml(p.user_id)}" class="px-2 py-1.5 rounded-xl border border-line bg-white text-xs"><option value="patient" ${p.role==="patient"?"selected":""}>مريض</option><option value="doctor" ${p.role==="doctor"?"selected":""}>طبيب</option><option value="admin" ${p.role==="admin"?"selected":""}>مشرف</option></select></td></tr>`).join("")}</tbody></table></div>
        </div>
      </div>`;
    main.querySelector("[data-back]")?.addEventListener("click", ()=> { state.adminSubTab="appointments"; render(); });
    main.querySelectorAll<HTMLSelectElement>("[data-role-for]").forEach(sel=> sel.addEventListener("change", async ()=>{
      const uid = sel.dataset.roleFor!; const prev = sel.value;
      try { await assignUserRole(uid, sel.value); showToast("تم تحديث الدور","success"); } catch(e){ showToast(translateAuthError(e),"error"); sel.value = prev; }
    }));
    return;
  }
  // management: doctors + schedules
  const docs = state.adminDoctorsCache.length ? state.adminDoctorsCache : await listDoctors().then(d=> state.adminDoctorsCache=d);
  main.innerHTML = `
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex items-center gap-2">
        <button data-back class="px-3 py-2 rounded-xl border border-line text-sm">رجوع للحجوزات</button>
        <h2 class="font-bold">الأطباء والمواعيد</h2>
        <button id="add-doctor" class="mr-auto px-4 py-2 rounded-xl bg-ink text-white text-sm font-semibold">إضافة طبيب</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${docs.map(d=>`
        <div class="rounded-2xl border border-line bg-paper card p-4 flex flex-col gap-3">
          <h3 class="font-bold">${escapeHtml(d.name)}</h3><p class="text-xs text-zinc-500">${escapeHtml(d.specialization)} · ${escapeHtml(String(d.consultation_fee))} ر.س</p>
          <div class="flex gap-2">
            <button data-manage="${escapeHtml(d.id)}" class="flex-1 py-2 rounded-xl border border-line text-xs">المواعيد</button>
            <button data-edit="${escapeHtml(d.id)}" class="px-3 py-2 rounded-xl border border-line text-xs">تعديل</button>
            <button data-del="${escapeHtml(d.id)}" class="px-3 py-2 rounded-xl bg-danger text-white text-xs">حذف</button>
          </div>
        </div>`).join("")}</div>
      <div id="schedules-root" class="${state.adminManagementDoctor ? "" : "hidden"} border-t border-line pt-6"></div>
    </div>
    <dialog id="doctor-dialog" class="p-0 bg-transparent backdrop:bg-ink/60 open:grid place-items-center min-h-dvh w-full max-w-none">
      <div class="bg-paper rounded-2xl border border-line card w-full max-w-[480px] p-6 mx-4">
        <h3 class="font-bold" id="doctor-dialog-title">طبيب</h3>
        <form id="doctor-form" class="mt-4 space-y-3">
          <input id="doc-name" required placeholder="الاسم" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <input id="doc-spec" required placeholder="التخصص" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <input id="doc-fee" required type="number" min="0" placeholder="رسوم الكشف" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
          <select id="doc-user" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white text-sm"><option value="">بدون حساب</option>${(state.adminAccounts as {user_id:string;full_name:string;email:string}[]).map(p=>`<option value="${escapeHtml(p.user_id)}">${escapeHtml(p.full_name)} — ${escapeHtml(p.email)}</option>`).join("")}</select>
          <div class="flex gap-2"><button type="button" data-close-doc class="flex-1 py-2.5 rounded-xl border border-line">إلغاء</button><button type="submit" class="flex-1 py-2.5 rounded-xl bg-ink text-white font-semibold">حفظ</button></div>
        </form>
      </div>
    </dialog>
  `;
  main.querySelector("[data-back]")?.addEventListener("click", ()=> { state.adminSubTab="appointments"; render(); });
  const docDlg = main.querySelector("#doctor-dialog") as HTMLDialogElement;
  let editing: string | null = null;
  const openDoc = async (id?: string) => {
    editing = id || null;
    (main.querySelector("#doctor-dialog-title") as HTMLElement).textContent = id ? "تعديل طبيب" : "إضافة طبيب";
    if (id) { const d = docs.find(x=>x.id===id)!; (main.querySelector("#doc-name") as HTMLInputElement).value=d.name; (main.querySelector("#doc-spec") as HTMLInputElement).value=d.specialization; (main.querySelector("#doc-fee") as HTMLInputElement).value=String(d.consultation_fee); (main.querySelector("#doc-user") as HTMLSelectElement).value=(d as {user_id?:string}).user_id||""; }
    else { (main.querySelector("#doctor-form") as HTMLFormElement).reset(); }
    try { if(!state.adminAccounts.length) state.adminAccounts = await adminListProfiles(); } catch {}
    docDlg.showModal();
  };
  main.querySelector("#add-doctor")?.addEventListener("click", ()=> openDoc());
  main.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach(b=> b.addEventListener("click", ()=> openDoc(b.dataset.edit!)));
  main.querySelectorAll<HTMLButtonElement>("[data-del]").forEach(b=> b.addEventListener("click", async ()=>{
    const doc = docs.find(x=>x.id===b.dataset.del);
    if (!confirm(`حذف ${doc?.name || "الطبيب"}؟`)) return;
    try { await deleteDoctor(b.dataset.del!); showToast("تم الحذف","success"); state.adminDoctorsCache = await listDoctors(); renderAdminManagement(main, "management"); } catch(e){ const m=String((e as {message?:string})?.message||""); if(/23503|foreign key|appointments/i.test(m)) showToast("لا يمكن الحذف — توجد حجوزات","error"); else showToast(translateAuthError(e),"error"); }
  }));
  main.querySelectorAll<HTMLButtonElement>("[data-manage]").forEach(b=> b.addEventListener("click", async ()=> { state.adminManagementDoctor=b.dataset.manage!; await renderSchedules(main.querySelector("#schedules-root") as HTMLElement, state.adminManagementDoctor); }));
  main.querySelector("[data-close-doc]")?.addEventListener("click", ()=> docDlg.close());
  docDlg.addEventListener("click", e=> { if(e.target===docDlg) docDlg.close(); });
  (main.querySelector("#doctor-form") as HTMLFormElement).addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name=(main.querySelector("#doc-name") as HTMLInputElement).value.trim();
    const specialization=(main.querySelector("#doc-spec") as HTMLInputElement).value.trim();
    const consultationFee=Number((main.querySelector("#doc-fee") as HTMLInputElement).value);
    const userId=(main.querySelector("#doc-user") as HTMLSelectElement).value || null;
    try { await saveDoctor({ id: editing||undefined, name, specialization, consultationFee, userId }); showToast("تم الحفظ","success"); docDlg.close(); state.adminDoctorsCache = await listDoctors(); state.adminDoctors = state.adminDoctorsCache; renderAdminManagement(main,"management"); } catch(err){ showToast(translateAuthError(err),"error"); }
  });
  if (state.adminManagementDoctor) await renderSchedules(main.querySelector("#schedules-root") as HTMLElement, state.adminManagementDoctor);
}

async function renderSchedules(root: HTMLElement, doctorId: string) {
  root.classList.remove("hidden");
  root.innerHTML = `<p class="text-sm text-zinc-500 py-4">جاري تحميل المواعيد…</p>`;
  try {
    const schedules = await listDoctorSchedules(doctorId);
    const doc = state.adminDoctorsCache.find(d=>d.id===doctorId);
    const availability = (await getDoctorAvailability(doctorId).catch(()=>[])) as { day_of_week:number; start_time:string; end_time:string; is_enabled:boolean }[];
    const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
    root.innerHTML = `
      <h3 class="font-bold mb-3">مواعيد ${escapeHtml(doc?.name || "الطبيب")}</h3>
      <form id="add-schedule" class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end rounded-2xl border border-line bg-paper-soft p-4">
        <label class="text-xs">التاريخ <input id="sch-date" type="date" min="${escapeHtml(localDateISO())}" required class="mt-1 w-full px-3 py-2 rounded-xl border border-line bg-white text-sm" /></label>
        <label class="text-xs">من <input id="sch-start" type="time" required class="mt-1 w-full px-3 py-2 rounded-xl border border-line bg-white text-sm" /></label>
        <label class="text-xs">إلى <input id="sch-end" type="time" required class="mt-1 w-full px-3 py-2 rounded-xl border border-line bg-white text-sm" /></label>
        <button type="submit" class="py-2.5 rounded-xl bg-teal text-white text-sm font-semibold">إضافة</button>
      </form>
      <details class="mt-4 rounded-2xl border border-line bg-paper-soft p-4">
        <summary class="cursor-pointer text-xs font-bold">التوافر الأسبوعي (قواعد التوليد) وإجازات مغلقة</summary>
        <div class="mt-3 space-y-2">
          ${DAYS.map((day,i)=>{ const rule = availability.find(r=>r.day_of_week===i); return `
            <div class="grid grid-cols-4 gap-2 items-center text-xs">
              <span class="font-semibold">${day}</span>
              <input type="time" data-av-start="${i}" value="${escapeHtml(rule?.start_time || "")}" class="px-2 py-1.5 rounded-xl border border-line bg-white" />
              <input type="time" data-av-end="${i}" value="${escapeHtml(rule?.end_time || "")}" class="px-2 py-1.5 rounded-xl border border-line bg-white" />
              <label class="flex items-center gap-1.5"><input type="checkbox" data-av-en="${i}" ${rule?.is_enabled ? "checked" : (rule ? "" : "checked")} /> مفعّل</label>
            </div>`; }).join("")}
          <button id="save-availability" class="px-4 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold">حفظ التوافر</button>
        </div>
        <hr class="my-3 border-line" />
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end text-xs">
          <label>من <input id="block-start" type="date" required class="mt-1 w-full px-2 py-2 rounded-xl border border-line bg-white" /></label>
          <label>إلى <input id="block-end" type="date" required class="mt-1 w-full px-2 py-2 rounded-xl border border-line bg-white" /></label>
          <label>السبب <input id="block-reason" placeholder="إجازة" class="mt-1 w-full px-2 py-2 rounded-xl border border-line bg-white" /></label>
          <button id="add-blocked" class="py-2.5 rounded-xl bg-danger text-white font-semibold">إغلاق التواريخ</button>
        </div>
        <button id="generate-schedule" class="mt-3 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold">توليد الجدول (90 يوماً)</button>
      </details>
      <div class="mt-4 grid gap-2">${schedules.length ? schedules.map((s: {id:string;available_date:string;start_time:string;end_time:string;is_booked:boolean})=>`
        <div class="flex items-center justify-between gap-3 rounded-xl border ${s.is_booked?"border-amber-200 bg-amber-50":"border-line bg-paper"} p-3 text-sm">
          <span>${escapeHtml(formatArabicDate(s.available_date))} · ${escapeHtml(formatTime(s.start_time))}–${escapeHtml(formatTime(s.end_time))} ${s.is_booked?'<span class="text-amber-700">(محجوز)</span>':""}</span>
          ${s.is_booked ? "" : `<button data-del-sch="${escapeHtml(s.id)}" class="px-3 py-1.5 rounded-xl bg-danger text-white text-xs">حذف</button>`}
        </div>`).join("") : `<p class="text-sm text-zinc-500">لا مواعيد</p>`}</div>`;
    (root.querySelector("#add-schedule") as HTMLFormElement).addEventListener("submit", async (e)=>{
      e.preventDefault();
      const availableDate=(root.querySelector("#sch-date") as HTMLInputElement).value;
      const startTime=(root.querySelector("#sch-start") as HTMLInputElement).value;
      const endTime=(root.querySelector("#sch-end") as HTMLInputElement).value;
      try { await createDoctorSchedule({ doctorId, availableDate, startTime, endTime }); showToast("تمت الإضافة","success"); await renderSchedules(root, doctorId); await refreshDoctors(); } catch(err){ showToast(translateAuthError(err),"error"); }
    });
    root.querySelectorAll<HTMLButtonElement>("[data-del-sch]").forEach(b=> b.addEventListener("click", async ()=>{
      if (!confirm("حذف هذا الموعد؟")) return;
      try { await deleteDoctorSchedule(b.dataset.delSch!); showToast("تم الحذف","success"); await renderSchedules(root, doctorId); await refreshDoctors(); } catch(e){ showToast(translateAuthError(e),"error"); }
    }));
    (root.querySelector("#save-availability") as HTMLButtonElement)?.addEventListener("click", async ()=>{
      const rules: Record<string, unknown>[] = [];
      for (let i=0;i<7;i++){
        const st=(root.querySelector(`[data-av-start="${i}"]`) as HTMLInputElement).value;
        const en=(root.querySelector(`[data-av-end="${i}"]`) as HTMLInputElement).value;
        const en2=(root.querySelector(`[data-av-en="${i}"]`) as HTMLInputElement).checked;
        if (st && en) rules.push({ doctor_id: doctorId, day_of_week:i, start_time: st.length===5?st+":00":st, end_time: en.length===5?en+":00":en, is_enabled: en2 });
      }
      try { await saveDoctorAvailability(doctorId, rules); showToast("تم حفظ التوافر","success"); } catch(err){ showToast(translateAuthError(err),"error"); }
    });
    (root.querySelector("#add-blocked") as HTMLButtonElement)?.addEventListener("click", async ()=>{
      const start=(root.querySelector("#block-start") as HTMLInputElement).value;
      const end=(root.querySelector("#block-end") as HTMLInputElement).value;
      const reason=(root.querySelector("#block-reason") as HTMLInputElement).value || "إجازة مُعلنة";
      if (!start || !end) { showToast("حدد تاريخي البداية والنهاية","warning"); return; }
      try { await blockDoctorDates(doctorId, start, end, reason); showToast("تم إغلاق التواريخ","success"); } catch(err){ showToast(translateAuthError(err),"error"); }
    });
    (root.querySelector("#generate-schedule") as HTMLButtonElement)?.addEventListener("click", async ()=>{
      try { await generateDoctorSchedule(doctorId); showToast("تم توليد الجدول","success"); await renderSchedules(root, doctorId); await refreshDoctors(); } catch(err){ showToast(translateAuthError(err),"error"); }
    });
  } catch (e) { root.innerHTML = `<p class="text-sm text-red-600">تعذر التحميل: ${escapeHtml(translateAuthError(e))}</p>`; }
}

async function refreshDoctors(){ try{ state.doctors = await getDoctorsWithSchedules(); } catch{} }
async function refreshAppointments(){ try{ state.patientAppointments = await getPatientAppointments(); } catch{} }
async function refreshAdminRows(){
  try {
    const res = await getAdminAppointments({ statuses: state.adminFilters.status==="all"?undefined: state.adminFilters.status==="cancelled"? ["cancelled_by_patient","cancelled_by_clinic"]:[state.adminFilters.status], doctorId: state.adminFilters.doctorId||undefined, dateFrom: state.adminFilters.dateFrom||undefined, dateTo: state.adminFilters.dateTo||undefined, search: state.adminFilters.search||undefined, page: state.adminPage, pageSize: state.adminPageSize, sortBy: state.adminFilters.sortBy, sortDir: state.adminFilters.sortDir });
    state.adminRows = res.rows as typeof state.adminRows; state.adminTotal = res.total;
  } catch{}
}
async function refreshAll(){ await Promise.all([refreshDoctors(), refreshAppointments()]); }

async function init() {
  state.currentUser = await getCurrentUser().catch(()=>null);
  state.activeTab = getTabFromHash();
  window.addEventListener("hashchange", ()=> { const t=getTabFromHash(); if(t!==state.activeTab){ state.activeTab=t; render(); } });
  try { onAuthChange(async (_e, session)=> { if ((session as {user?:unknown})?.user) state.currentUser = await getCurrentUser(); else state.currentUser=null; await refreshAll(); render(); }); } catch {}
  await refreshAll();
  render();
  try { subscribeToRealtimeUpdates(()=> refreshDoctors().then(render), ()=> refreshAll().then(render)); } catch {}
}
init();
