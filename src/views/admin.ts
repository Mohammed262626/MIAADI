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
  <div class="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-[24px] font-bold leading-tight text-on-surface">لوحة الإدارة</h1>
        <p class="mt-1 text-[15px] text-on-surface-variant">إدارة الحجوزات والأطباء والحسابات، ومتابعة حركة العيادة اليوم.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-[12px] text-on-surface-variant">
        <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-tertiary" aria-hidden="true"></span>متزامن مباشرة مع قاعدة البيانات</span>
        <span class="rounded-md bg-surface-container px-2 py-0.5 text-on-surface">${escapeHtml(opts.roleLabel)}</span>
      </div>
    </div>

    <div class="mt-6 flex gap-2 overflow-x-auto border-b border-line">
      ${SUB_TABS.map((t) => `<button data-sub="${t.key}" class="-mb-px inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-[14px] transition-colors ${
        opts.activeSubTab === t.key ? "border-primary font-semibold text-on-surface" : "border-transparent text-on-surface-variant hover:text-on-surface"
      }">
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">${t.icon}</span><span>${t.label}</span>
      </button>`).join("")}
    </div>

    <div id="admin-sub-root" class="mt-6 flex flex-col gap-4"></div>
  </div>`;


  root.querySelectorAll<HTMLButtonElement>("[data-sub]").forEach((b) => b.addEventListener("click", () => opts.onManageTab(b.dataset.sub as "appointments" | "management" | "accounts")));
  const subRoot = root.querySelector("#admin-sub-root") as HTMLElement;

  if (opts.activeSubTab !== "appointments") return;

  subRoot.innerHTML = `
    <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
      ${STAT_CARDS.map((c) => `<div class="bg-surface-container-lowest px-4 py-3">
        <p class="text-[12px] text-on-surface-variant">${escapeHtml(c.label)}</p>
        <p class="mt-1 text-[24px] font-semibold leading-none tabular-nums text-on-surface">${stats[c.key]}</p>
      </div>`).join("")}
    </div>

    <div class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-lowest p-4">
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex flex-wrap items-center gap-0.5 rounded-lg bg-surface-container-low p-1" role="group" aria-label="تصفية بالحالة">
          ${STATUS_TABS.map((s) => {
            const active = filters.status === s.value;
            return `<button data-status="${s.value}" class="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] transition-colors ${
              active ? "border border-line bg-surface-container-lowest font-semibold text-on-surface" : "border border-transparent text-on-surface-variant hover:text-on-surface"
            }">${s.label}</button>`;
          }).join("")}
        </div>
        <select id="admin-doc-filter" class="ms-auto h-9 rounded-lg border border-line bg-surface-container-lowest px-2 text-[13px] text-on-surface">
          <option value="">كل الأطباء</option>
          ${doctors.map((d) => `<option value="${escapeHtml(d.id)}" ${filters.doctorId === d.id ? "selected" : ""}>${escapeHtml(d.name)}</option>`).join("")}
        </select>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input id="admin-search" placeholder="بحث باسم المريض أو رقم الجوال" value="${escapeHtml(filters.search)}" class="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface-container-lowest px-3 text-[13px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary" />
        <input id="admin-from" type="date" value="${escapeHtml(filters.dateFrom)}" aria-label="من تاريخ" class="h-9 rounded-lg border border-line bg-surface-container-lowest px-2 text-[13px] text-on-surface" />
        <span class="self-center text-[12px] text-on-surface-variant">إلى</span>
        <input id="admin-to" type="date" value="${escapeHtml(filters.dateTo)}" aria-label="إلى تاريخ" class="h-9 rounded-lg border border-line bg-surface-container-lowest px-2 text-[13px] text-on-surface" />
        <select id="admin-sort" class="h-9 rounded-lg border border-line bg-surface-container-lowest px-2 text-[13px] text-on-surface">
          <option value="available_date_desc" ${filters.sortBy === "available_date" && filters.sortDir === "desc" ? "selected" : ""}>الأحدث أولاً</option>
          <option value="available_date_asc" ${filters.sortBy === "available_date" && filters.sortDir === "asc" ? "selected" : ""}>الأقدم أولاً</option>
          <option value="patient_name_asc" ${filters.sortBy === "patient_name" ? "selected" : ""}>اسم المريض</option>
        </select>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
      <div class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead class="bg-surface-container-low text-[12px] text-on-surface-variant">
            <tr>
              <th class="px-4 py-2.5 text-start font-medium">المريض</th>
              <th class="px-4 py-2.5 text-start font-medium">الجوال</th>
              <th class="px-4 py-2.5 text-start font-medium">الطبيب</th>
              <th class="px-4 py-2.5 text-start font-medium">الموعد</th>
              <th class="px-4 py-2.5 text-start font-medium">الحالة</th>
              <th class="px-4 py-2.5 text-end font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody id="admin-tbody" class="divide-y divide-line"></tbody>
        </table>
      </div>
      <div id="admin-mobile" class="hidden flex-col divide-y divide-line"></div>
      <div class="flex items-center justify-between gap-3 border-t border-line bg-surface-container-low px-4 py-2.5">
        <button id="admin-prev" class="inline-flex h-8 items-center rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40">السابق</button>
        <span class="text-[12px] tabular-nums text-on-surface-variant">${from}–${to} من ${total}</span>
        <button id="admin-next" class="inline-flex h-8 items-center rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40">التالي</button>
      </div>
    </div>`;


  const tbody = subRoot.querySelector("#admin-tbody") as HTMLElement;
  const mobile = subRoot.querySelector("#admin-mobile") as HTMLElement;

  const badge = (s: string) => {
    const m = statusMeta(s);
    return `<span class="inline-flex items-center gap-1.5 text-[12px] text-on-surface-variant"><span class="h-1.5 w-1.5 rounded-full ${m.dot}" aria-hidden="true"></span>${escapeHtml(m.label)}</span>`;
  };

  const quietBtn = "inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium transition-colors";
  const actionsHtml = (r: Row) => r.status === "booked"
    ? `<div class="flex flex-wrap items-center justify-end gap-0.5">
        <button data-edit="${escapeHtml(r.appointment_id)}" class="${quietBtn} text-on-surface-variant hover:bg-surface-container hover:text-on-surface">تعديل</button>
        <button data-complete="${escapeHtml(r.appointment_id)}" class="${quietBtn} text-primary hover:bg-primary/10">اكتمل</button>
        <button data-noshow="${escapeHtml(r.appointment_id)}" class="${quietBtn} text-on-surface-variant hover:bg-surface-container">لم يحضر</button>
        <button data-cancel="${escapeHtml(r.appointment_id)}" class="${quietBtn} text-error hover:bg-error-container/40">إلغاء</button>
      </div>`
    : `<div class="flex items-center justify-end gap-0.5">
        <button data-delete="${escapeHtml(r.appointment_id)}" class="${quietBtn} text-error hover:bg-error-container/40">حذف</button>
      </div>`;


  const renderRows = () => {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-10 text-center text-[13px] text-on-surface-variant">لا توجد نتائج مطابقة للفلاتر الحالية</td></tr>`;
      mobile.innerHTML = `<p class="px-4 py-8 text-center text-[13px] text-on-surface-variant">لا توجد نتائج مطابقة للفلاتر الحالية</p>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr class="transition-colors hover:bg-surface-container-low/60">
        <td class="px-4 py-3 font-medium text-on-surface">${escapeHtml(r.patient_name)}</td>
        <td class="px-4 py-3 text-[12px] tabular-nums text-on-surface-variant" dir="ltr">${escapeHtml(r.patient_phone)}</td>
        <td class="px-4 py-3 text-on-surface">${escapeHtml(r.doctor_name)}</td>
        <td class="px-4 py-3 text-[12px] text-on-surface-variant"><span class="tabular-nums">${escapeHtml(formatArabicDate(r.available_date))}</span> · <span class="tabular-nums">${escapeHtml(formatTime(r.start_time))}</span></td>
        <td class="px-4 py-3">${badge(r.status)}</td>
        <td class="px-4 py-3">${actionsHtml(r)}</td>
      </tr>`).join("");

    mobile.innerHTML = rows.map((r) => `
      <div class="flex flex-col gap-2 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-[14px] font-semibold text-on-surface">${escapeHtml(r.patient_name)}</span>
          ${badge(r.status)}
        </div>
        <span class="text-[12px] tabular-nums text-on-surface-variant" dir="ltr">${escapeHtml(r.patient_phone)}</span>
        <span class="text-[12px] text-on-surface-variant">${escapeHtml(r.doctor_name)} · <span class="tabular-nums">${escapeHtml(formatArabicDate(r.available_date))}</span> <span class="tabular-nums">${escapeHtml(formatTime(r.start_time))}</span></span>
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
