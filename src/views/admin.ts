import { escapeHtml, formatTime, formatArabicDate, localDateISO } from "../lib/format";
import { statusMeta } from "../components/ui";
import { confirmSheet } from "../components/ConfirmDialog";

type Row = { appointment_id: string; schedule_id: string; patient_name: string; patient_phone: string; doctor_name: string; available_date: string; start_time: string; status: string; doctor_id: string };

type Stats = { total: number; booked: number; completed: number; cancelled: number; noShow: number; today: number };

const STAT_CARDS: { key: keyof Stats; label: string; icon: string; chip: string }[] = [
  { key: "total", label: "إجمالي الحجوزات", icon: "event_note", chip: "bg-primary/10 text-primary" },
  { key: "today", label: "مواعيد اليوم", icon: "today", chip: "bg-tertiary/10 text-tertiary" },
  { key: "booked", label: "مؤكدة قادمة", icon: "event_available", chip: "bg-primary/10 text-primary" },
  { key: "completed", label: "مكتملة", icon: "task_alt", chip: "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant" },
  { key: "cancelled", label: "ملغاة", icon: "event_busy", chip: "bg-error-container/60 text-on-error-container" },
  { key: "noShow", label: "لم يحضر", icon: "person_off", chip: "bg-warning-soft text-warning" },
];

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "booked", label: "مؤكد" },
  { value: "completed", label: "مكتمل" },
  { value: "no_show", label: "غياب" },
  { value: "cancelled", label: "ملغي" },
];

const SUB_TABS: { key: "appointments" | "management" | "accounts"; label: string; icon: string }[] = [
  { key: "appointments", label: "الحجوزات", icon: "event_note" },
  { key: "management", label: "الأطباء والمواعيد", icon: "medical_services" },
  { key: "accounts", label: "الحسابات", icon: "manage_accounts" },
];

export function renderAdminView(
  root: HTMLElement,
  opts: {
    rows: Row[]; total: number; page: number; pageSize: number; stats: Stats;
    filters: { status: string; doctorId: string; dateFrom: string; dateTo: string; search: string; sortBy: string; sortDir: string };
    doctors: { id: string; name: string }[];
    roleLabel: string;
    onFilter: (patch: Partial<{ status: string; doctorId: string; dateFrom: string; dateTo: string; search: string; sortBy: string; sortDir: string }>) => void;
    onPage: (dir: 1 | -1) => void;
    onState: (id: string, state: "completed" | "no_show") => Promise<void>;
    onClinicCancel: (id: string) => Promise<void>;
    onEdit: (row: Row) => void;
    onDelete: (row: Row) => Promise<void>;
    onManageTab: (tab: "appointments" | "management" | "accounts") => void;
    activeSubTab: "appointments" | "management" | "accounts";
  }
) {
  const { rows, total, page, pageSize, stats, filters, doctors } = opts;
  const from = total ? page * pageSize + 1 : 0;
  const to = Math.min((page + 1) * pageSize, total);

  root.innerHTML = `
  <div class="w-full px-margin-desktop py-space-xl">
    <div class="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
      <div class="flex items-center gap-space-sm text-secondary font-label-md text-label-md">
        <span class="text-on-surface">بوابة الإدارة</span>
        <span>/</span>
        <span class="text-primary font-bold">إدارة الحجوزات والعيادات</span>
        <span class="mx-space-xs text-outline-variant">•</span>
        <span class="bg-primary/10 text-primary px-space-sm py-0.5 rounded-full font-label-sm text-label-sm">${escapeHtml(opts.roleLabel)}</span>
      </div>
      <div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full">
        <span class="material-symbols-outlined text-tertiary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified_user</span>
        <span class="font-label-sm text-label-sm text-on-surface">متزامن مباشرة مع قاعدة بيانات العيادة</span>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
      <div>
        <div class="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-space-xs">
          <span>ADMIN CONSOLE</span><span>•</span><span>لوحة المتابعة الطبية</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          لوحة الإدارة
          <span class="font-body-lg text-body-lg text-secondary font-normal block lg:inline-block lg:mr-space-sm">| Clinic Operations</span>
        </h1>
      </div>
      <div class="flex items-center bg-surface-container-high/60 p-1.5 rounded-2xl shadow-inner max-w-full overflow-x-auto">
        ${SUB_TABS.map((t) => `<button data-sub="${t.key}" class="flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl font-label-md text-label-md transition-all duration-200 ${
          opts.activeSubTab === t.key ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"
        }">
          <span class="material-symbols-outlined text-[18px]">${t.icon}</span><span>${t.label}</span>
        </button>`).join("")}
      </div>
    </div>

    <div id="admin-sub-root" class="flex flex-col gap-space-lg"></div>
  </div>`;

  root.querySelectorAll<HTMLButtonElement>("[data-sub]").forEach((b) => b.addEventListener("click", () => opts.onManageTab(b.dataset.sub as "appointments" | "management" | "accounts")));
  const subRoot = root.querySelector("#admin-sub-root") as HTMLElement;

  if (opts.activeSubTab !== "appointments") return;

  subRoot.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
      ${STAT_CARDS.map((c) => `
        <div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm flex flex-col gap-space-sm">
          <div class="flex items-center justify-between gap-space-xs">
            <span class="w-9 h-9 rounded-xl ${c.chip} grid place-items-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">${c.icon}</span></span>
            <span class="font-label-sm text-label-sm text-secondary text-left">${escapeHtml(c.label)}</span>
          </div>
          <span class="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">${stats[c.key]}</span>
        </div>`).join("")}
    </div>

    <div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm flex flex-col gap-space-md">
      <div class="flex flex-wrap items-center gap-space-xs">
        ${STATUS_TABS.map((s) => {
          const active = filters.status === s.value;
          return `<button data-status="${s.value}" class="px-space-md py-1.5 rounded-full font-label-sm text-label-sm border transition-all ${
            active ? "bg-primary text-on-primary border-primary shadow-sm" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
          }">${s.label}</button>`;
        }).join("")}
        <select id="admin-doc-filter" class="ms-auto px-space-md py-2 rounded-xl border border-outline-variant bg-surface text-label-md text-on-surface">
          <option value="">كل الأطباء</option>
          ${doctors.map((d) => `<option value="${escapeHtml(d.id)}" ${filters.doctorId === d.id ? "selected" : ""}>${escapeHtml(d.name)}</option>`).join("")}
        </select>
      </div>
      <div class="flex flex-col sm:flex-row gap-space-sm">
        <input id="admin-search" placeholder="بحث باسم المريض أو رقم الجوال" value="${escapeHtml(filters.search)}" class="flex-1 px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" />
        <input id="admin-from" type="date" value="${escapeHtml(filters.dateFrom)}" class="px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface text-body-sm text-on-surface" />
        <span class="self-center font-label-sm text-label-sm text-secondary">إلى</span>
        <input id="admin-to" type="date" value="${escapeHtml(filters.dateTo)}" class="px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface text-body-sm text-on-surface" />
        <select id="admin-sort" class="px-space-md py-2.5 rounded-xl border border-outline-variant bg-surface text-label-md text-on-surface">
          <option value="available_date_desc" ${filters.sortBy === "available_date" && filters.sortDir === "desc" ? "selected" : ""}>الأحدث أولاً</option>
          <option value="available_date_asc" ${filters.sortBy === "available_date" && filters.sortDir === "asc" ? "selected" : ""}>الأقدم أولاً</option>
          <option value="patient_name_asc" ${filters.sortBy === "patient_name" ? "selected" : ""}>اسم المريض</option>
        </select>
      </div>
    </div>

    <div class="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full font-body-md text-body-md">
          <thead class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
            <tr>
              <th class="px-space-lg py-space-md text-right font-semibold">المريض</th>
              <th class="px-space-lg py-space-md text-right font-semibold">الجوال</th>
              <th class="px-space-lg py-space-md text-right font-semibold">الطبيب</th>
              <th class="px-space-lg py-space-md text-right font-semibold">الموعد</th>
              <th class="px-space-lg py-space-md text-right font-semibold">الحالة</th>
              <th class="px-space-lg py-space-md text-center font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody id="admin-tbody" class="divide-y divide-outline-variant/40"></tbody>
        </table>
      </div>
      <div id="admin-mobile" class="hidden flex-col gap-space-md p-space-md"></div>
      <div class="flex items-center justify-between gap-space-md px-space-lg py-space-md bg-surface-container-low border-t border-outline-variant/40">
        <button id="admin-prev" class="px-space-md py-1.5 rounded-full border border-outline-variant font-label-sm text-label-sm text-on-surface hover:bg-surface-container-lowest disabled:opacity-40 transition-all">السابق</button>
        <span class="font-label-sm text-label-sm text-secondary tabular-nums">${from}–${to} من ${total}</span>
        <button id="admin-next" class="px-space-md py-1.5 rounded-full border border-outline-variant font-label-sm text-label-sm text-on-surface hover:bg-surface-container-lowest disabled:opacity-40 transition-all">التالي</button>
      </div>
    </div>`;

  const tbody = subRoot.querySelector("#admin-tbody") as HTMLElement;
  const mobile = subRoot.querySelector("#admin-mobile") as HTMLElement;

  const badge = (s: string) => {
    const m = statusMeta(s);
    return `<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full font-label-sm text-label-sm font-bold ${m.cls}"><span class="w-1.5 h-1.5 rounded-full ${m.dot}"></span>${escapeHtml(m.label)}</span>`;
  };

  const actionsHtml = (r: Row) => r.status === "booked"
    ? `<div class="flex items-center justify-center gap-1.5 flex-wrap">
        <button data-edit="${escapeHtml(r.appointment_id)}" class="px-space-sm py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold hover:bg-primary/20 transition-all">تعديل</button>
        <button data-complete="${escapeHtml(r.appointment_id)}" class="px-space-sm py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-bold hover:bg-tertiary/20 transition-all">اكتمل</button>
        <button data-noshow="${escapeHtml(r.appointment_id)}" class="px-space-sm py-1 rounded-full bg-warning-soft text-warning font-label-sm text-label-sm font-bold hover:brightness-95 transition-all">لم يحضر</button>
        <button data-cancel="${escapeHtml(r.appointment_id)}" class="px-space-sm py-1 rounded-full bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error-container transition-all">إلغاء</button>
      </div>`
    : `<div class="flex items-center justify-center gap-1.5 flex-wrap">
        <button data-delete="${escapeHtml(r.appointment_id)}" class="px-space-sm py-1 rounded-full bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error-container transition-all">حذف</button>
      </div>`;

  const renderRows = () => {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-space-lg py-space-xl text-center font-body-md text-body-md text-secondary">لا توجد نتائج مطابقة للفلاتر الحالية</td></tr>`;
      mobile.innerHTML = `<p class="text-center font-body-md text-body-md text-secondary py-space-lg">لا توجد نتائج مطابقة للفلاتر الحالية</p>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="px-space-lg py-space-md font-semibold text-on-surface">${escapeHtml(r.patient_name)}</td>
        <td class="px-space-lg py-space-md font-mono text-label-sm text-on-surface-variant" dir="ltr">${escapeHtml(r.patient_phone)}</td>
        <td class="px-space-lg py-space-md text-on-surface">${escapeHtml(r.doctor_name)}</td>
        <td class="px-space-lg py-space-md font-label-sm text-label-sm text-on-surface-variant">${escapeHtml(formatArabicDate(r.available_date))} · <span class="tabular-nums">${escapeHtml(formatTime(r.start_time))}</span></td>
        <td class="px-space-lg py-space-md">${badge(r.status)}</td>
        <td class="px-space-lg py-space-md">${actionsHtml(r)}</td>
      </tr>`).join("");

    mobile.innerHTML = rows.map((r) => `
      <div class="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-space-xs">
        <div class="flex items-center justify-between gap-space-sm">
          <span class="font-label-lg text-label-lg text-on-surface font-bold">${escapeHtml(r.patient_name)}</span>
          ${badge(r.status)}
        </div>
        <span class="font-mono text-label-sm text-secondary" dir="ltr">${escapeHtml(r.patient_phone)}</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(r.doctor_name)} · ${escapeHtml(formatArabicDate(r.available_date))} <span class="tabular-nums">${escapeHtml(formatTime(r.start_time))}</span></span>
        ${actionsHtml(r)}
      </div>`).join("");

    subRoot.querySelectorAll<HTMLButtonElement>("[data-complete]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.complete!;
      const row = rows.find((x) => x.appointment_id === id);
      const ok = await confirmSheet({
        title: "تأكيد اكتمال الزيارة",
        body: `تسجيل زيارة ${row?.patient_name || "المريض"} مع ${row?.doctor_name || "الطبيب"} كمكتملة؟`,
        confirmLabel: "تسجيل كمكتملة",
        cancelLabel: "تراجع",
        tone: "primary",
        iconName: "task_alt",
      });
      if (ok) await opts.onState(id, "completed");
    }));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-noshow]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.noshow!;
      const row = rows.find((x) => x.appointment_id === id);
      const ok = await confirmSheet({
        title: "تسجيل عدم حضور",
        body: `تسجيل غياب ${row?.patient_name || "المريض"} عن موعد ${formatArabicDate(row?.available_date || "")}؟ سيتحرر الموعد ولا يمكن التراجع.`,
        confirmLabel: "تسجيل الغياب",
        cancelLabel: "تراجع",
        tone: "danger",
        iconName: "person_off",
      });
      if (ok) await opts.onState(id, "no_show");
    }));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-cancel]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.cancel!;
      const row = rows.find((x) => x.appointment_id === id);
      const ok = await confirmSheet({
        title: "إلغاء الموعد من العيادة",
        body: `إلغاء موعد ${row?.patient_name || "المريض"} وإتاحة الموعد مجدداً للحجز؟`,
        confirmLabel: "تأكيد الإلغاء",
        cancelLabel: "تراجع",
        tone: "danger",
        iconName: "event_busy",
      });
      if (ok) await opts.onClinicCancel(id);
    }));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((b) => b.addEventListener("click", () => {
      const row = rows.find((x) => x.appointment_id === b.dataset.edit!);
      if (row) opts.onEdit(row);
    }));
    subRoot.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.delete!;
      const row = rows.find((x) => x.appointment_id === id);
      const ok = await confirmSheet({
        title: "حذف الحجز نهائياً",
        body: `حذف سجل حجز ${row?.patient_name || "المريض"} (${row?.doctor_name || ""} ${formatArabicDate(row?.available_date || "")}) نهائياً من السجل؟ سيُحرَّر الموعد للحجز مجدداً.`,
        confirmLabel: "حذف نهائي",
        cancelLabel: "تراجع",
        tone: "danger",
        iconName: "delete_forever",
      });
      if (ok && row) await opts.onDelete(row);
    }));
  };
  renderRows();

  const q = <T extends HTMLElement>(sel: string) => subRoot.querySelector(sel) as T;
  const searchEl = q<HTMLInputElement>("#admin-search");
  const fromEl = q<HTMLInputElement>("#admin-from");
  const toEl = q<HTMLInputElement>("#admin-to");
  const docEl = q<HTMLSelectElement>("#admin-doc-filter");
  const sortEl = q<HTMLSelectElement>("#admin-sort");
  let t: number | undefined;
  searchEl.addEventListener("input", () => { clearTimeout(t); t = window.setTimeout(() => opts.onFilter({ search: searchEl.value }), 400); });
  fromEl.addEventListener("change", () => opts.onFilter({ dateFrom: fromEl.value || localDateISO() }));
  toEl.addEventListener("change", () => opts.onFilter({ dateTo: toEl.value || localDateISO() }));
  docEl.addEventListener("change", () => opts.onFilter({ doctorId: docEl.value }));
  sortEl.addEventListener("change", () => {
    const map: Record<string, [string, string]> = { available_date_desc: ["available_date", "desc"], available_date_asc: ["available_date", "asc"], patient_name_asc: ["patient_name", "asc"] };
    const m = map[sortEl.value] || ["available_date", "desc"];
    opts.onFilter({ sortBy: m[0], sortDir: m[1] });
  });
  subRoot.querySelectorAll<HTMLButtonElement>("[data-status]").forEach((b) => b.addEventListener("click", () => opts.onFilter({ status: b.dataset.status! })));
  q<HTMLButtonElement>("#admin-prev").disabled = page === 0;
  q<HTMLButtonElement>("#admin-next").disabled = (page + 1) * pageSize >= total;
  q<HTMLButtonElement>("#admin-prev").addEventListener("click", () => opts.onPage(-1));
  q<HTMLButtonElement>("#admin-next").addEventListener("click", () => opts.onPage(1));

  const syncView = () => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const tableWrap = subRoot.querySelector("table")?.parentElement as HTMLElement | null;
    if (tableWrap) tableWrap.classList.toggle("hidden", isMobile);
    mobile.classList.toggle("hidden", !isMobile);
    mobile.classList.toggle("flex", isMobile);
  };
  syncView();
  window.addEventListener("resize", syncView);
}
