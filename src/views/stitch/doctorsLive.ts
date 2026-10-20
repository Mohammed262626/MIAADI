import { escapeHtml, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow, type DirectorySlot } from "../../lib/supabase";
import { SPECIALTIES, countSpecialties, specialtyKeyOf, type SpecialtyKey } from "../../lib/specialties";
import { initials, money } from "../../components/ui";

type Consult = "clinic" | "video";
type Avail = "any" | "today" | "tomorrow" | "3days" | "7days";
type Gender = "all" | "female" | "male";
type SortKey = "rating" | "earliest" | "price" | "experience";

type Filters = {
  q: string;
  city: string;
  consult: Consult;
  avail: Avail;
  specs: Set<SpecialtyKey>;
  gender: Gender;
  insurance: string;
  maxPrice: number;
  minRating: number;
  sort: SortKey;
};

const AVAIL_WINDOW: Record<Exclude<Avail, "any">, number> = { today: 0, tomorrow: 1, "3days": 3, "7days": 7 };

let ROWS: DoctorDirectoryRow[] = [];

/* patient's existing booked slots — used to flag conflicting chips early */
let BUSY_DOCTOR_DAYS = new Set<string>(); // `${doctorId}|${available_date}`
let BUSY_INTERVALS = new Map<string, { start: number; end: number }[]>(); // date -> booked intervals
let PATIENT_BUSY_READY = false;

async function loadPatientBusy() {
  try {
    const appts = await getPatientAppointments();
    BUSY_DOCTOR_DAYS = new Set();
    BUSY_INTERVALS = new Map();
    for (const a of appts) {
      if (a.status !== "booked") continue;
      const s = a.doctor_schedules as { available_date?: string | null; start_time?: string | null; end_time?: string | null; doctors?: { id?: string } | null } | null;
      if (!s?.available_date || !s.start_time) continue;
      const doctorId = s.doctors?.id;
      if (doctorId) BUSY_DOCTOR_DAYS.add(`${doctorId}|${s.available_date}`);
      const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
      const st = toMin(String(s.start_time));
      const en = s.end_time ? toMin(String(s.end_time)) : st + 30;
      const list = BUSY_INTERVALS.get(s.available_date) || [];
      list.push({ start: st, end: en });
      BUSY_INTERVALS.set(s.available_date, list);
    }
    PATIENT_BUSY_READY = true;
  } catch {
    PATIENT_BUSY_READY = false;
  }
}

function slotConflict(doc: DoctorDirectoryRow, slot: DirectorySlot): "same" | "overlap" | "" {
  if (!PATIENT_BUSY_READY) return "";
  if (BUSY_DOCTOR_DAYS.has(`${doc.id}|${slot.available_date}`)) return "same";
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const st = toMin(slot.start_time);
  const en = slot.end_time ? toMin(slot.end_time) : st + 30;
  return (BUSY_INTERVALS.get(slot.available_date) || []).some((iv) => st < iv.end && iv.start < en) ? "overlap" : "";
}

const CONFLICT_NOTE = { same: "لديك موعد آخر مع نفس الطبيب في هذا اليوم", overlap: "يتعارض مع موعد آخر لديك في نفس التوقيت" } as const;
let DEFAULTS: Filters = emptyFilters();
let visibleCount = 30;

/* Filters handed over from another view (e.g. the home search deck). Consumed once. */
export type DoctorsSeed = {
  q?: string;
  city?: string;
  insurance?: string;
  consult?: Consult;
  avail?: Avail;
  sort?: SortKey;
  specialty?: string;
};
let PENDING_SEED: DoctorsSeed | null = null;
export function seedDoctorsFilters(seed: DoctorsSeed) {
  PENDING_SEED = seed;
}

function emptyFilters(): Filters {
  return { q: "", city: "", consult: "clinic", avail: "any", specs: new Set<SpecialtyKey>(), gender: "all", insurance: "", maxPrice: 8000, minRating: 4.5, sort: "rating" };
}

function daysFromToday(date: string): number {
  const a = new Date(`${localDateISO()}T00:00:00`).getTime();
  const b = new Date(`${date}T00:00:00`).getTime();
  return Math.round((b - a) / 86400000);
}

function earliestDate(doc: DoctorDirectoryRow): string | null {
  return doc.available_schedules.length ? doc.available_schedules[0].available_date : null;
}

/* ------------------------------- filter / sort ------------------------------- */

function apply(rows: DoctorDirectoryRow[], f: Filters): DoctorDirectoryRow[] {
  const q = f.q.trim().toLowerCase();
  let out = rows.filter((d) => {
    if (f.city && (d.hospital_city || d.city) !== f.city) return false;
    if (f.consult === "video" && !d.telehealth) return false;
    if (f.consult === "clinic" && d.telehealth && !d.hospital_name) return false;
    if (f.gender !== "all" && d.gender !== f.gender) return false;
    if (d.consultation_fee > f.maxPrice) return false;
    if (f.minRating > 0 && (d.rating ?? 0) < f.minRating) return false;
    if (f.insurance && !d.insurances.includes(f.insurance)) return false;
    if (f.specs.size) {
      const key = specialtyKeyOf(d.specialization);
      if (!key || !f.specs.has(key)) return false;
    }
    if (f.avail !== "any") {
      const first = earliestDate(d);
      if (!first || daysFromToday(first) > AVAIL_WINDOW[f.avail]) return false;
    }
    if (q) {
      const hay = `${d.name} ${d.specialization} ${d.hospital_name || ""} ${d.city || ""} ${d.insurances.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const byEarliest = (d: DoctorDirectoryRow) => earliestDate(d) || "9999-12-31";
  const sorters: Record<SortKey, (a: DoctorDirectoryRow, b: DoctorDirectoryRow) => number> = {
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews_count ?? 0) - (a.reviews_count ?? 0),
    earliest: (a, b) => byEarliest(a).localeCompare(byEarliest(b)),
    price: (a, b) => a.consultation_fee - b.consultation_fee,
    experience: (a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0),
  };
  out = [...out].sort(sorters[f.sort]);
  return out;
}

/* ---------------------------------- markup ---------------------------------- */

function doctorAvatar(doc: DoctorDirectoryRow): string {
  if (doc.photo_url) {
    return `<img class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-sm" src="${escapeHtml(doc.photo_url)}" alt="${escapeHtml(doc.name)}" loading="lazy"/>`;
  }
  return `<span class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-sm grid place-items-center bg-gradient-to-br from-primary-container to-primary text-on-primary font-extrabold text-3xl">${escapeHtml(initials(doc.name))}</span>`;
}

function slotChipLabel(slot: DirectorySlot, firstDate: string): string {
  const t = formatTime(slot.start_time);
  return slot.available_date === firstDate ? t : `${formatRelativeDay(slot.available_date)} ${t}`;
}

function doctorRowHtml(doc: DoctorDirectoryRow): string {
  const first = doc.available_schedules[0] || null;
  const chips = doc.available_schedules.slice(0, 3);
  const today = daysFromToday(first ? first.available_date : "9999-12-31") === 0;
  const hospital = doc.hospital_name || (doc.telehealth ? "استشارة مرئية عن بُعد" : "العيادة الخاصة");
  const coverage = doc.insurances.length ? `مغطى بالتأمين (${doc.insurances.slice(0, 3).join("، ")})` : "دفع مباشر";
  return `
<article class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col xl:flex-row gap-space-lg justify-between" data-doctor-row="${escapeHtml(doc.id)}">
<div class="flex gap-space-md flex-1">
<div class="relative shrink-0">
${doctorAvatar(doc)}
<span class="absolute -bottom-2 -left-2 bg-tertiary text-on-tertiary p-1 rounded-full shadow flex items-center justify-center" title="طبيب مرخص">
<span class="material-symbols-outlined text-[16px]">verified</span>
</span>
</div>
<div class="flex flex-col justify-between flex-1 min-w-0">
<div>
<div class="flex items-center gap-2 flex-wrap mb-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(doc.name)}</h3>
<span class="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">${escapeHtml(doc.title || "طبيب")}</span>
</div>
<p class="font-body-md text-body-md text-primary font-semibold mb-1">${escapeHtml(doc.specialization)}</p>
<div class="flex items-center gap-space-md text-secondary font-body-sm text-body-sm flex-wrap mb-2">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-primary">${doc.hospital_name ? "local_hospital" : "videocam"}</span>
<span>${escapeHtml(hospital)}</span>
</span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
<span>${escapeHtml(doc.hospital_city || doc.city || "—")}</span>
</span>
${doc.experience_years ? `<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-tertiary">work_history</span>
<span>${escapeHtml(doc.experience_years)}+ سنة خبرة</span>
</span>` : ""}
</div>
</div>
<div class="flex items-center gap-space-md pt-2 flex-wrap">
<div class="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg">
<span class="material-symbols-outlined text-warning text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md font-bold tabular-nums">${doc.rating === null ? "—" : doc.rating.toFixed(1)}</span>
<span class="text-secondary font-label-sm text-label-sm mr-1 tabular-nums">(${escapeHtml(doc.reviews_count ?? 0)} مراجع)</span>
</div>
<div class="flex items-center gap-1 text-tertiary font-label-sm text-label-sm bg-tertiary/10 px-2.5 py-1 rounded-lg">
<span class="material-symbols-outlined text-[16px]">health_and_safety</span>
<span>${escapeHtml(coverage)}</span>
</div>
</div>
</div>
</div>
<div class="xl:w-80 flex flex-col justify-between bg-surface-container-low/60 rounded-xl p-space-md shrink-0">
<div class="flex items-center justify-between mb-2">
<span class="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-primary">event_available</span>
<span>المواعيد المتاحة (${first ? escapeHtml(formatRelativeDay(first.available_date)) : "—"}):</span>
</span>
<span class="text-tertiary font-label-sm text-label-sm font-semibold">${today ? "متاح الآن" : "أقرب موعد"}</span>
</div>
<div class="grid grid-cols-3 gap-1.5 mb-space-md">
${chips.map((s) => {
  const conflict = slotConflict(doc, s);
  return `
<button class="relative min-h-11 lg:min-h-8 py-2 rounded-lg font-label-sm text-label-sm text-center shadow-xs transition-colors ${conflict ? "bg-error-container text-on-error-container ring-1 ring-error" : "bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary"}" data-book-doctor="${escapeHtml(doc.id)}" type="button"${conflict ? ` title="${CONFLICT_NOTE[conflict]}"` : ""}>
${escapeHtml(slotChipLabel(s, first!.available_date))}${conflict ? `<span class="absolute -top-1.5 -end-1.5 bg-error text-on-error p-0.5 rounded-full shadow" title="${CONFLICT_NOTE[conflict]}"><span class="material-symbols-outlined text-[12px]">error</span></span>` : ""}
</button>`;
}).join("")}
</div>
<div class="flex items-center justify-between pt-2">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">قيمة الكشفية:</span>
<div class="flex items-baseline gap-1">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface tabular-nums">${escapeHtml(doc.consultation_fee)}</span>
<span class="font-label-sm text-label-sm text-secondary">ج.س</span>
</div>
</div>
<button class="px-space-lg py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-full font-label-md text-label-md transition-all shadow-sm flex items-center gap-1.5" data-book-doctor="${escapeHtml(doc.id)}" type="button">
<span>احجز موعداً</span>
<span class="material-symbols-outlined text-[18px]">arrow_back</span>
</button>
</div>
</div>
</article>`;
}

/* ------------------------------ control painting ------------------------------ */

const CONSULT_ACTIVE = "flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-sm text-label-sm transition-all";
const CONSULT_IDLE = "flex items-center justify-center gap-1.5 py-2 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm transition-all";
const CHIP_ACTIVE = "px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1";
const CHIP_IDLE = "px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors";
const GENDER_ACTIVE = "py-1.5 rounded-lg bg-surface-container-lowest font-label-sm text-label-sm text-primary shadow-sm";
const GENDER_IDLE = "py-1.5 rounded-lg font-label-sm text-label-sm text-secondary hover:text-on-surface";
const RATING_ACTIVE = "flex-1 py-1.5 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center gap-1 font-label-sm text-label-sm font-semibold";
const RATING_IDLE = "flex-1 py-1.5 bg-surface-container-low hover:bg-surface-container rounded-lg flex items-center justify-center gap-1 font-label-sm text-label-sm text-on-surface";

function paintSpecialties(root: ParentNode, f: Filters) {
  root.querySelectorAll<HTMLInputElement>("#doc-specs input[data-spec]").forEach((input) => {
    input.checked = f.specs.has(input.dataset.spec as SpecialtyKey);
    input.closest("label")?.classList.toggle("bg-surface-container-low/60", input.checked);
  });
}

function paintControls(root: ParentNode, f: Filters) {
  root.querySelectorAll<HTMLButtonElement>("#doc-consult [data-consult]").forEach((b) => {
    b.className = b.dataset.consult === f.consult ? CONSULT_ACTIVE : CONSULT_IDLE;
  });
  root.querySelectorAll<HTMLButtonElement>("#doc-avail [data-avail]").forEach((b) => {
    const on = b.dataset.avail === f.avail;
    b.className = on ? CHIP_ACTIVE : CHIP_IDLE;
    b.querySelector(".material-symbols-outlined")?.classList.toggle("hidden", !on);
  });
  root.querySelectorAll<HTMLButtonElement>("#doc-gender [data-gender]").forEach((b) => {
    b.className = b.dataset.gender === f.gender ? GENDER_ACTIVE : GENDER_IDLE;
  });
  root.querySelectorAll<HTMLButtonElement>("#doc-rating [data-rating]").forEach((b) => {
    b.className = Number(b.dataset.rating) === f.minRating ? RATING_ACTIVE : RATING_IDLE;
  });
  const ins = root.querySelector<HTMLSelectElement>("#doc-insurance");
  if (ins) ins.value = f.insurance;
  const city = root.querySelector<HTMLSelectElement>("#doc-city");
  if (city) city.value = f.city;
  const sort = root.querySelector<HTMLSelectElement>("#doc-sort");
  if (sort) sort.value = f.sort;
  const price = root.querySelector<HTMLInputElement>("#doc-price");
  if (price) price.value = String(f.maxPrice);
  const label = root.querySelector<HTMLElement>("#doc-price-label");
  if (label) label.textContent = f.maxPrice >= Number(price?.max || 8000) ? "كافة الأسعار" : `حتى ${f.maxPrice.toLocaleString("en-US")} ج.س`;
  paintSpecialties(root, f);
}

function activePills(root: ParentNode, f: Filters) {
  const box = root.querySelector<HTMLElement>("#doc-active");
  if (!box) return;
  const pills: { field: string; label: string }[] = [];
  if (f.q) pills.push({ field: "q", label: `بحث: ${f.q}` });
  if (f.city) pills.push({ field: "city", label: f.city });
  if (f.consult !== DEFAULTS.consult) pills.push({ field: "consult", label: f.consult === "video" ? "استشارة فيديو" : "زيارة عيادة" });
  if (f.avail !== "any") pills.push({ field: "avail", label: `متاح ${root.querySelector(`#doc-avail [data-avail="${f.avail}"]`)?.textContent?.trim() || f.avail}` });
  const defaultSpecs = DEFAULTS.specs.size;
  if (f.specs.size !== defaultSpecs) pills.push({ field: "specs", label: `${f.specs.size} تخصص` });
  if (f.gender !== "all") pills.push({ field: "gender", label: f.gender === "female" ? "طبيبة (أنثى)" : "طبيب (ذكر)" });
  if (f.insurance) pills.push({ field: "insurance", label: f.insurance });
  if (f.minRating > 0) pills.push({ field: "rating", label: `تقييم ${f.minRating}+` });
  if (f.maxPrice < 8000) pills.push({ field: "price", label: `حتى ${f.maxPrice.toLocaleString("en-US")} ج.س` });
  if (!pills.length) {
    box.className = "hidden items-center gap-space-xs flex-wrap"; box.innerHTML = "";
    const badge = root.querySelector<HTMLElement>("#filters-badge");
    if (badge) badge.className = "hidden min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-on-primary text-[11px] font-bold tabular-nums";
    return;
  }
  const badge = root.querySelector<HTMLElement>("#filters-badge");
  if (badge) {
    badge.textContent = String(pills.length);
    badge.className = "min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-on-primary text-[11px] font-bold tabular-nums";
  }
  box.className = "flex items-center gap-space-xs flex-wrap";
  box.innerHTML = `<span class="font-label-sm text-label-sm text-secondary">الفلاتر النشطة:</span>${pills.map((p) => `
<span class="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low text-on-surface rounded-full font-label-sm text-label-sm">
${escapeHtml(p.label)}
<button class="material-symbols-outlined text-[14px] hover:text-error cursor-pointer grid place-items-center -my-3 -me-2 min-w-11 min-h-11 lg:min-w-6 lg:min-h-6" data-clear="${p.field}" type="button">close</button>
</span>`).join("")}`;
}

/* ----------------------------------- render ----------------------------------- */

function render(root: HTMLElement, f: Filters) {
  const list = root.querySelector<HTMLElement>("#doc-list");
  if (!list) return;
  const rows = apply(ROWS, f);
  const shown = rows.slice(0, visibleCount);
  list.innerHTML = shown.length
    ? shown.map(doctorRowHtml).join("")
    : `<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm text-center flex flex-col items-center gap-2 py-space-xl">
<span class="material-symbols-outlined text-[40px] text-outline">search_off</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">لا يوجد أطباء مطابقون</span>
<span class="font-body-sm text-body-sm text-secondary">جرّب توسيع نطاق البحث أو إعادة تعيين الفلاتر.</span>
</div>`;
  const count = root.querySelector<HTMLElement>("#doc-count");
  if (count) count.textContent = `${rows.length} طبيب`;
  const sub = root.querySelector<HTMLElement>("#doc-count-sub");
  if (sub) sub.textContent = `متاح للحجز الآن • جميعهم موثّقون ومعتمدون`;
  const pag = root.querySelector<HTMLElement>("#doc-pagination");
  if (pag) {
    pag.className = rows.length > 10 ? "flex items-center justify-between bg-surface-container-lowest rounded-2xl px-space-lg py-space-md shadow-sm mt-space-sm" : "hidden items-center justify-between bg-surface-container-lowest rounded-2xl px-space-lg py-space-md shadow-sm mt-space-sm";
    pag.innerHTML = rows.length > visibleCount
      ? `<span class="font-label-sm text-label-sm text-secondary tabular-nums">${rows.length - visibleCount} طبيب آخر</span><button id="doc-more" class="px-space-lg py-2 min-h-11 bg-primary hover:bg-primary-container text-on-primary rounded-full font-label-md text-label-md transition-all shadow-sm" type="button">عرض المزيد</button>`
      : "";
  }
  activePills(root, f);
}

/* ----------------------------------- wiring ----------------------------------- */

function wireFilterToggle(appEl: HTMLElement) {
  const aside = appEl.querySelector<HTMLElement>("#filters-aside");
  const toggle = appEl.querySelector<HTMLButtonElement>("#filters-toggle");
  const label = appEl.querySelector<HTMLElement>("#filters-toggle-label");
  toggle?.addEventListener("click", () => {
    if (!aside) return;
    const nowHidden = aside.classList.toggle("hidden");
    if (label) label.textContent = nowHidden ? "فلترة النتائج" : "إخفاء الفلاتر";
    if (!nowHidden) aside.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export async function wireDoctorsLive(appEl: HTMLElement) {
  wireFilterToggle(appEl);
  try {
    ROWS = await getDoctorsDirectory(7);
  } catch {
    const list = appEl.querySelector<HTMLElement>("#doc-list");
    if (list) list.innerHTML = `<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm text-center text-on-surface-variant font-body-md text-body-md flex flex-col items-center gap-space-sm"><span>تعذّر تحميل الأطباء.</span><button class="min-h-11 px-space-lg rounded-full bg-primary text-on-primary font-label-md text-label-md" data-path="doctors-and-specialties" type="button">إعادة المحاولة</button></div>`;
    return;
  }

  const f = emptyFilters();
  const specs = ROWS.map((d) => d.specialization);
  const counts = countSpecialties(specs);
  DEFAULTS = { ...emptyFilters(), specs: new Set(SPECIALTIES.filter((s) => (counts[s.key] || 0) > 0).map((s) => s.key)) };
  f.specs = new Set(DEFAULTS.specs);

  // Apply any filters handed over from the home page (search deck / quick pills / specialty tiles).
  const seed = PENDING_SEED;
  PENDING_SEED = null;
  if (seed) {
    if (seed.q) f.q = seed.q;
    if (seed.city) f.city = seed.city;
    if (seed.insurance) f.insurance = seed.insurance;
    if (seed.consult) f.consult = seed.consult;
    if (seed.avail) f.avail = seed.avail;
    if (seed.sort) f.sort = seed.sort;
    if (seed.specialty && SPECIALTIES.some((s) => s.key === seed.specialty)) {
      f.specs = new Set([seed.specialty as SpecialtyKey]);
    }
  }

  const specsBox = appEl.querySelector<HTMLElement>("#doc-specs");
  if (specsBox) {
    specsBox.innerHTML = SPECIALTIES.map((sp) => `
<label class="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
<div class="flex items-center gap-2">
<input class="w-4 h-4 rounded text-primary accent-primary cursor-pointer" data-spec="${sp.key}" type="checkbox"${f.specs.has(sp.key) ? " checked" : ""}/>
<span class="font-body-sm text-body-sm text-on-surface">${escapeHtml(sp.label)}</span>
</div>
<span class="font-label-sm text-label-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded-full tabular-nums">${counts[sp.key] || 0}</span>
</label>`).join("");
  }

  const citySelect = appEl.querySelector<HTMLSelectElement>("#doc-city");
  if (citySelect) {
    const cities = [...new Set(ROWS.map((d) => d.hospital_city || d.city).filter((c): c is string => Boolean(c)))].sort();
    citySelect.innerHTML = `<option value="">كافة المدن</option>${cities.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
  }

  const insSelect = appEl.querySelector<HTMLSelectElement>("#doc-insurance");
  if (insSelect) {
    const insurers = [...new Set(ROWS.flatMap((d) => d.insurances))].sort();
    insSelect.innerHTML = `<option value="">كافة شركات التأمين المعتمدة</option>${insurers.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")}`;
  }

  const rerender = () => { visibleCount = 30; render(appEl, f); };

  appEl.querySelector("#doc-pagination")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("#doc-more");
    if (!btn) return;
    visibleCount += 30;
    render(appEl, f);
  });

  const search = appEl.querySelector<HTMLInputElement>("#doc-search");
  search?.addEventListener("input", () => { f.q = search.value; rerender(); });
  citySelect?.addEventListener("change", () => { f.city = citySelect.value; rerender(); });
  insSelect?.addEventListener("change", () => { f.insurance = insSelect.value; rerender(); });
  const sortSelect = appEl.querySelector<HTMLSelectElement>("#doc-sort");
  sortSelect?.addEventListener("change", () => { f.sort = sortSelect.value as SortKey; rerender(); });
  if (search && f.q) search.value = f.q;
  const price = appEl.querySelector<HTMLInputElement>("#doc-price");
  price?.addEventListener("input", () => { f.maxPrice = Number(price.value); rerender(); });

  specsBox?.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const key = input.dataset.spec as SpecialtyKey | undefined;
    if (!key) return;
    if (input.checked) f.specs.add(key); else f.specs.delete(key);
    rerender();
  });

  appEl.querySelectorAll<HTMLElement>("#doc-consult [data-consult]").forEach((b) =>
    b.addEventListener("click", () => { f.consult = b.dataset.consult as Consult; paintControls(appEl, f); rerender(); }));
  appEl.querySelectorAll<HTMLElement>("#doc-avail [data-avail]").forEach((b) =>
    b.addEventListener("click", () => { f.avail = b.dataset.avail as Avail; paintControls(appEl, f); rerender(); }));
  appEl.querySelectorAll<HTMLElement>("#doc-gender [data-gender]").forEach((b) =>
    b.addEventListener("click", () => { f.gender = b.dataset.gender as Gender; paintControls(appEl, f); rerender(); }));
  appEl.querySelectorAll<HTMLElement>("#doc-rating [data-rating]").forEach((b) =>
    b.addEventListener("click", () => { f.minRating = Number(b.dataset.rating); paintControls(appEl, f); rerender(); }));

  appEl.querySelector("#reset-filters")?.addEventListener("click", () => {
    Object.assign(f, { ...DEFAULTS, specs: new Set(DEFAULTS.specs) });
    paintControls(appEl, f);
    rerender();
  });

  appEl.querySelector<HTMLElement>("#doc-active")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-clear]");
    if (!btn) return;
    switch (btn.dataset.clear) {
      case "q": f.q = ""; if (search) search.value = ""; break;
      case "city": f.city = ""; break;
      case "consult": f.consult = DEFAULTS.consult; break;
      case "avail": f.avail = "any"; break;
      case "specs": f.specs = new Set(DEFAULTS.specs); break;
      case "gender": f.gender = "all"; break;
      case "insurance": f.insurance = ""; break;
      case "rating": f.minRating = 0; break;
      case "price": f.maxPrice = 8000; break;
    }
    paintControls(appEl, f);
    rerender();
  });

  paintControls(appEl, f);
  rerender();
  void loadPatientBusy().then(() => { if (PATIENT_BUSY_READY) rerender(); });
}
