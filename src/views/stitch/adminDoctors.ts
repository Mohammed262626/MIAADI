// Admin doctors tab (#admin → إدارة الأطباء).
//
// A dense roster over the doctors table: search, specialty/hospital filters,
// quick chips for the rows that need attention (no account, no hospital) and
// 25-per-page pagination. Opening a doctor swaps the list for the real
// schedules editor inside the same panel, so editing a calendar never leaves
// the tab.
//
// CRUD itself (create/edit dialog, delete) lives in app.ts and is injected
// through `hooks`; this module owns layout, filtering and paging only.
import { escapeHtml } from "../../lib/format";
import { initials, money } from "../../components/ui";
import type { DoctorAdminRow } from "../../lib/supabase";
import { specialtyLabel } from "./specialtyContent";
import { scheduleSkeletonHtml } from "./scheduleSkeleton";
import { doctorsSkeletonHtml } from "./adminSkeletons";

export type AdminHospital = { id: string; name: string; city: string | null };
export type AdminDoctorsContext = { docs: DoctorAdminRow[]; hospitals: AdminHospital[] };

export type AdminDoctorsHooks = {
  /** Full roster, already sorted by name (listDoctors order). */
  load: () => Promise<DoctorAdminRow[]>;
  hospitals: () => Promise<AdminHospital[]>;
  /** Opens the create/edit dialog; call onSaved() after a successful write. */
  edit: (id: string | null, ctx: AdminDoctorsContext, onSaved: () => void) => void;
  /** Confirms and deletes; resolves true when the row is gone. */
  remove: (doc: DoctorAdminRow) => Promise<boolean>;
  /** Renders the schedules editor for one doctor into `host`. `skeleton` is the
      placeholder to keep on screen while the schedule loads (admin shell). */
  schedules: (host: HTMLElement, doctorId: string, skeleton?: string) => Promise<void> | void;
  /** Fixture deep link: open this doctor's schedule right away. */
  initialDoctorId?: string | null;
};

const PAGE_SIZE = 25;

type OnlyFilter = "all" | "no-account" | "no-hospital";

const STAT_LABEL = "text-[11px] text-on-surface-variant";
const STAT_VALUE = "mt-0.5 text-[18px] font-semibold leading-none tabular-nums text-on-surface";
const CONTROL = "h-9 rounded-lg border border-line bg-surface-container-lowest text-[13px] text-on-surface outline-none transition-colors focus:border-primary";

export async function renderAdminDoctorsTab(host: HTMLElement, hooks: AdminDoctorsHooks): Promise<void> {
  // Keep the roster-shaped skeleton on screen for the whole fetch, not a
  // centered spinner that changes the page shape twice on the way in.
  host.innerHTML = doctorsSkeletonHtml();

  let docs: DoctorAdminRow[] = [];
  let hospitals: AdminHospital[] = [];
  try {
    [docs, hospitals] = await Promise.all([hooks.load(), hooks.hospitals().catch(() => [] as AdminHospital[])]);
  } catch (e) {
    host.innerHTML = `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest p-8 text-center">
      <span class="material-symbols-outlined text-[36px] text-error" aria-hidden="true">cloud_off</span>
      <p class="text-[14px] font-semibold text-on-surface">تعذّر تحميل قائمة الأطباء</p>
      <p class="text-[12px] text-on-surface-variant">${escapeHtml(String((e as { message?: string })?.message || ""))}</p>
    </div>`;
    return;
  }

  const hospitalById = new Map(hospitals.map((h) => [h.id, h]));
  let search = "";
  let spec = "";
  let hospital = "";
  let only: OnlyFilter = "all";
  let page = 0;

  host.innerHTML = `
    <div class="flex flex-col gap-3">
      <div id="adm-doc-list" class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 flex items-center gap-2 text-[12px] text-on-surface-variant">
            <span>بوابة الإدارة</span><span aria-hidden="true">/</span><span class="font-semibold text-primary">إدارة الأطباء</span>
          </div>
          <h1 class="text-[22px] font-bold tracking-tight text-on-surface">إدارة الأطباء</h1>
          <p class="mt-0.5 text-[13px] text-on-surface-variant">بيانات الأطباء المهنية وحساباتهم وجداولهم — من مكان واحد.</p>
        </div>
        <button type="button" data-add class="press flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-bold text-on-primary transition-colors hover:bg-teal-hover">
          <span class="material-symbols-outlined text-[19px]" aria-hidden="true">person_add</span>إضافة طبيب
        </button>
      </div>

      <div id="adm-doc-stats" class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"></div>

      <section class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
        <div class="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <div class="relative min-w-0 flex-1">
            <span class="material-symbols-outlined pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
            <input id="adm-doc-search" type="search" autocomplete="off" placeholder="ابحث بالاسم أو التخصص أو المستشفى…"
              class="${CONTROL} w-full ps-9 pe-2.5" aria-label="بحث في الأطباء" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select id="adm-doc-spec" class="${CONTROL} px-2" aria-label="تصفية حسب التخصص"></select>
            <select id="adm-doc-hospital" class="${CONTROL} max-w-[220px] px-2" aria-label="تصفية حسب المستشفى"></select>
            <button type="button" data-reset class="press flex h-9 items-center gap-1 rounded-lg px-2.5 text-[12px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
              <span class="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>مسح
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
          <button type="button" data-only="all" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <button type="button" data-only="no-account" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <button type="button" data-only="no-hospital" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <span id="adm-doc-count" class="ms-auto text-[12px] tabular-nums text-on-surface-variant"></span>
        </div>

        <div id="adm-doc-rows"></div>
        <div id="adm-doc-pager"></div>
      </section>
      </div>

      <section id="adm-doc-schedules" class="hidden">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <button type="button" data-sched-back class="press flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>رجوع للقائمة
          </button>
          <span id="adm-sched-name" class="truncate text-[12px] text-on-surface-variant"></span>
        </div>
        <div id="adm-sched-host"></div>
      </section>
    </div>`;

  const el = <T extends HTMLElement>(sel: string) => host.querySelector(sel) as T;
  const rowsEl = el<HTMLDivElement>("#adm-doc-rows");
  const pagerEl = el<HTMLDivElement>("#adm-doc-pager");
  const statsEl = el<HTMLDivElement>("#adm-doc-stats");
  const countEl = el<HTMLSpanElement>("#adm-doc-count");
  const searchEl = el<HTMLInputElement>("#adm-doc-search");
  const specEl = el<HTMLSelectElement>("#adm-doc-spec");
  const hospitalEl = el<HTMLSelectElement>("#adm-doc-hospital");
  const listSection = el<HTMLElement>("#adm-doc-list");
  const schedSection = el<HTMLElement>("#adm-doc-schedules");
  const schedHost = el<HTMLDivElement>("#adm-sched-host");
  const schedName = el<HTMLSpanElement>("#adm-sched-name");
  const chips = [...host.querySelectorAll<HTMLButtonElement>("[data-only]")];

  const hospitalName = (d: DoctorAdminRow) => (d.hospital_id ? hospitalById.get(d.hospital_id)?.name || "" : "");
  const specLabel = (d: DoctorAdminRow) => specialtyLabel(d.specialization);

  const filtered = () => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (only === "no-account" && d.user_id) return false;
      if (only === "no-hospital" && d.hospital_id) return false;
      if (spec && specLabel(d) !== spec) return false;
      if (hospital && d.hospital_id !== hospital) return false;
      if (!q) return true;
      return [d.name, d.name_en, d.specialization, specLabel(d), d.city, hospitalName(d)]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  };

  const accountPill = (d: DoctorAdminRow) => d.user_id
    ? `<span class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary"><span class="material-symbols-outlined text-[13px]" aria-hidden="true">check</span>مرتبط</span>`
    : `<span class="inline-flex items-center gap-1 rounded-md bg-surface-container px-1.5 py-0.5 text-[11px] font-semibold text-on-surface-variant"><span class="material-symbols-outlined text-[13px]" aria-hidden="true">person_off</span>بدون حساب</span>`;

  const actions = (d: DoctorAdminRow) => `
    <div class="flex items-center justify-end gap-1">
      <button type="button" data-sched="${escapeHtml(d.id)}" title="المواعيد وساعات العمل" aria-label="مواعيد ${escapeHtml(d.name)}"
        class="press grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">calendar_month</span>
      </button>
      <button type="button" data-edit="${escapeHtml(d.id)}" title="تعديل بيانات الطبيب" aria-label="تعديل ${escapeHtml(d.name)}"
        class="press flex h-8 items-center rounded-lg border border-line px-2 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">تعديل</button>
      <button type="button" data-del="${escapeHtml(d.id)}" title="حذف الطبيب" aria-label="حذف ${escapeHtml(d.name)}"
        class="press flex h-8 items-center rounded-lg px-2 text-[12px] font-bold text-error transition-colors hover:bg-error-container/40">حذف</button>
    </div>`;

  const tableRow = (d: DoctorAdminRow) => {
    const h = d.hospital_id ? hospitalById.get(d.hospital_id) : null;
    return `<tr data-row class="border-t border-line/70 transition-colors hover:bg-surface-container-low/60">
      <td class="px-3 py-2">
        <div class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">${escapeHtml(initials(d.name))}</span>
          <div class="min-w-0">
            <a href="#doctor/${escapeHtml(d.id)}" class="flex items-center gap-1 truncate text-[13px] font-semibold text-on-surface transition-colors hover:text-primary" title="الصفحة العامة للطبيب">
              <span class="truncate">${escapeHtml(d.name)}</span>
              ${d.telehealth ? `<span class="material-symbols-outlined shrink-0 text-[13px] text-primary" title="استشارة عن بُعد" aria-label="استشارة عن بُعد">videocam</span>` : ""}
            </a>
            <p class="truncate text-[11px] text-on-surface-variant">${escapeHtml(d.name_en || d.city || "—")}</p>
          </div>
        </div>
      </td>
      <td class="px-3 py-2">
        <p class="truncate text-[13px] text-on-surface">${escapeHtml(specialtyLabel(d.specialization))}</p>
        <p class="truncate text-[11px] text-on-surface-variant">${escapeHtml(d.title || "")}${d.title && d.city ? " · " : ""}${escapeHtml(d.city || "")}</p>
      </td>
      <td class="px-3 py-2">
        ${h ? `<p class="truncate text-[13px] text-on-surface">${escapeHtml(h.name)}</p><p class="truncate text-[11px] text-on-surface-variant">${escapeHtml(h.city || "")}</p>`
          : `<span class="text-[12px] text-on-surface-variant">بدون مستشفى</span>`}
      </td>
      <td class="whitespace-nowrap px-3 py-2 text-[13px] tabular-nums text-on-surface">${escapeHtml(money(d.consultation_fee))}</td>
      <td class="px-3 py-2">${accountPill(d)}</td>
      <td class="px-3 py-2">${actions(d)}</td>
    </tr>`;
  };

  const card = (d: DoctorAdminRow) => {
    const h = d.hospital_id ? hospitalById.get(d.hospital_id) : null;
    return `<div data-row class="border-t border-line/70 p-3">
      <div class="flex items-start gap-2.5">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">${escapeHtml(initials(d.name))}</span>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1 text-[13px] font-semibold text-on-surface">
            <span class="truncate">${escapeHtml(d.name)}</span>
            ${d.telehealth ? `<span class="material-symbols-outlined shrink-0 text-[13px] text-primary" title="استشارة عن بُعد">videocam</span>` : ""}
          </p>
          <p class="truncate text-[11px] text-on-surface-variant">${escapeHtml(specialtyLabel(d.specialization))}${d.city ? ` · ${escapeHtml(d.city)}` : ""}</p>
        </div>
        ${accountPill(d)}
      </div>
      <div class="mt-2 flex items-center justify-between gap-2">
        <div class="min-w-0 text-[11px] text-on-surface-variant">
          <p class="truncate">${h ? escapeHtml(h.name) : "بدون مستشفى"}</p>
          <p class="tabular-nums">${escapeHtml(money(d.consultation_fee))}</p>
        </div>
        ${actions(d)}
      </div>
    </div>`;
  };

  const paint = (animateRows = true) => {
    const list = filtered();
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > pageCount - 1) page = pageCount - 1;
    if (page < 0) page = 0;
    const start = page * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    const linked = docs.filter((d) => d.user_id).length;
    const noHospital = docs.filter((d) => !d.hospital_id).length;
    const remote = docs.filter((d) => d.telehealth).length;
    const stat = (label: string, value: number) => `<div class="bg-surface-container-lowest px-3 py-2.5">
      <p class="${STAT_LABEL}">${escapeHtml(label)}</p><p class="${STAT_VALUE}">${value}</p>
    </div>`;
    statsEl.innerHTML = [
      stat("إجمالي الأطباء", docs.length),
      stat("مرتبط بحساب", linked),
      stat("بدون حساب", docs.length - linked),
      stat("بدون مستشفى", noHospital),
      stat("استشارة عن بُعد", remote),
    ].join("");

    const counts: Record<OnlyFilter, number> = { all: docs.length, "no-account": docs.length - linked, "no-hospital": noHospital };
    const chipLabels: Record<OnlyFilter, string> = { all: "الكل", "no-account": "بدون حساب", "no-hospital": "بدون مستشفى" };
    chips.forEach((c) => {
      const value = (c.dataset.only || "all") as OnlyFilter;
      const on = value === only;
      c.textContent = `${chipLabels[value]} · ${counts[value]}`;
      c.classList.toggle("border-primary", on);
      c.classList.toggle("bg-primary", on);
      c.classList.toggle("text-on-primary", on);
      c.classList.toggle("border-line", !on);
      c.classList.toggle("bg-surface-container-lowest", !on);
      c.classList.toggle("text-on-surface-variant", !on);
      c.classList.toggle("hover:bg-surface-container", !on);
      c.setAttribute("aria-pressed", String(on));
    });

    countEl.textContent = list.length === docs.length ? `${docs.length} طبيب` : `${list.length} من ${docs.length}`;

    if (!list.length) {
      rowsEl.innerHTML = `<div class="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
        <span class="material-symbols-outlined text-[30px] text-on-surface-variant/70" aria-hidden="true">person_search</span>
        <p class="text-[14px] font-semibold text-on-surface">لا طبيب يطابق الفلاتر</p>
        <p class="text-[12px] text-on-surface-variant">جرّب مسح البحث أو اختيار «الكل».</p>
        <button type="button" data-reset class="press mt-1 h-9 rounded-lg border border-line px-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">مسح الفلاتر</button>
      </div>`;
      pagerEl.innerHTML = "";
      bindReset();
      return;
    }

    rowsEl.innerHTML = `
      <div class="max-sm:hidden overflow-x-auto">
        <table class="w-full text-start">
          <thead class="bg-surface-container-low text-[11px] text-on-surface-variant">
            <tr>
              <th class="px-3 py-2 text-start font-semibold">الطبيب</th>
              <th class="px-3 py-2 text-start font-semibold">التخصص</th>
              <th class="px-3 py-2 text-start font-semibold">المستشفى</th>
              <th class="px-3 py-2 text-start font-semibold">الرسوم</th>
              <th class="px-3 py-2 text-start font-semibold">الحساب</th>
              <th class="px-3 py-2 text-end font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>${slice.map(tableRow).join("")}</tbody>
        </table>
      </div>
      <div class="sm:hidden">${slice.map(card).join("")}</div>`;

    // Stagger the visible page; typing in a filter must not animate the list.
    if (animateRows) {
      rowsEl.querySelectorAll<HTMLElement>("[data-row]").forEach((el, i) => {
        el.classList.add("rise-in");
        el.style.animationDelay = `${Math.min(i, 9) * 30}ms`;
      });
    }

    const from = start + 1;
    const to = Math.min(list.length, start + slice.length);
    pagerEl.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2 text-[12px] text-on-surface-variant">
      <span class="tabular-nums">عرض ${from}–${to} من ${list.length}</span>
      <div class="flex items-center gap-1">
        <button type="button" data-page="-1" ${page === 0 ? "disabled" : ""} class="press flex h-8 items-center rounded-lg border border-line px-2.5 font-semibold transition-colors enabled:hover:bg-surface-container disabled:opacity-40">السابق</button>
        <span class="px-1.5 tabular-nums">${page + 1} / ${pageCount}</span>
        <button type="button" data-page="1" ${page >= pageCount - 1 ? "disabled" : ""} class="press flex h-8 items-center rounded-lg border border-line px-2.5 font-semibold transition-colors enabled:hover:bg-surface-container disabled:opacity-40">التالي</button>
      </div>
    </div>`;

    bindRows();
    bindReset();
    pagerEl.querySelectorAll<HTMLButtonElement>("[data-page]").forEach((b) => b.addEventListener("click", () => {
      page = Math.max(0, Math.min(pageCount - 1, page + Number(b.dataset.page)));
      paint();
    }));
  };

  const refresh = async () => {
    try {
      docs = await hooks.load();
    } catch {
      return;
    }
    rebuildFilters();
    paint();
  };

  const openEditor = (id: string | null) => {
    hooks.edit(id, { docs, hospitals }, () => void refresh());
  };

  const openSchedule = async (doc: DoctorAdminRow) => {
    schedName.textContent = `تعديل جدول ${doc.name}`;
    const skeleton = scheduleSkeletonHtml();
    schedHost.innerHTML = skeleton;
    listSection.classList.add("hidden");
    schedSection.classList.remove("hidden");
    try {
      await hooks.schedules(schedHost, doc.id, skeleton);
    } catch (e) {
      schedHost.innerHTML = `<p class="rounded-lg border border-line bg-surface-container-lowest p-4 text-center text-[13px] text-on-surface-variant">تعذّر تحميل الجدول — ${escapeHtml(String((e as { message?: string })?.message || ""))}</p>`;
    }
    schedSection.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const closeSchedule = () => {
    schedHost.innerHTML = "";
    schedSection.classList.add("hidden");
    listSection.classList.remove("hidden");
  };

  function bindRows() {
    rowsEl.querySelectorAll<HTMLButtonElement>("[data-sched]").forEach((b) => b.addEventListener("click", () => {
      const doc = docs.find((d) => d.id === b.dataset.sched);
      if (doc) void openSchedule(doc);
    }));
    rowsEl.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((b) => b.addEventListener("click", () => openEditor(b.dataset.edit || null)));
    rowsEl.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      const doc = docs.find((d) => d.id === b.dataset.del);
      if (!doc) return;
      b.disabled = true;
      const removed = await hooks.remove(doc);
      if (removed) await refresh();
      else b.disabled = false;
    }));
  }

  function bindReset() {
    host.querySelectorAll<HTMLButtonElement>("[data-reset]").forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => {
        search = "";
        spec = "";
        hospital = "";
        only = "all";
        page = 0;
        searchEl.value = "";
        specEl.value = "";
        hospitalEl.value = "";
        paint();
      });
    });
  }

  function rebuildFilters() {
    const specs = [...new Set(docs.map((d) => specLabel(d)))]
      .sort((a, b) => a.localeCompare(b, "ar"));
    const keepSpec = spec;
    specEl.innerHTML = `<option value="">كل التخصصات</option>` + specs
      .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    specEl.value = specs.includes(keepSpec) ? keepSpec : "";
    spec = specEl.value;

    const keepHospital = hospital;
    hospitalEl.innerHTML = `<option value="">كل المستشفيات</option>` + hospitals
      .map((h) => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)}</option>`).join("");
    hospitalEl.value = hospitals.some((h) => h.id === keepHospital) ? keepHospital : "";
    hospital = hospitalEl.value;
  }

  host.querySelector("[data-add]")?.addEventListener("click", () => openEditor(null));
  host.querySelector("[data-sched-back]")?.addEventListener("click", closeSchedule);
  searchEl.addEventListener("input", () => { search = searchEl.value; page = 0; paint(false); });
  specEl.addEventListener("change", () => { spec = specEl.value; page = 0; paint(false); });
  hospitalEl.addEventListener("change", () => { hospital = hospitalEl.value; page = 0; paint(false); });
  chips.forEach((c) => c.addEventListener("click", () => {
    only = (c.dataset.only || "all") as OnlyFilter;
    page = 0;
    paint();
  }));

  rebuildFilters();
  paint();

  if (hooks.initialDoctorId) {
    const doc = docs.find((d) => d.id === hooks.initialDoctorId);
    if (doc) await openSchedule(doc);
  }
}
