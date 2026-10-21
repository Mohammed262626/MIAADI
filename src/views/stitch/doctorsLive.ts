import { escapeHtml, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { storedCity } from "../../lib/geodata";
import { getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow, type DirectorySlot } from "../../lib/supabase";
import { SPECIALTIES, countSpecialties, specialtyKeyOf, type SpecialtyKey } from "../../lib/specialties";
import { initials, money } from "../../components/ui";

type Avail = "any" | "today" | "tomorrow" | "3days" | "7days";
type Gender = "all" | "female" | "male";
type SortKey = "rating" | "earliest" | "price" | "experience";

type Filters = {
  q: string;
  city: string;
  hospital: string;
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
/* Updated when the navbar detects the visitor's city while this page is mounted. */
let cityListener: ((e: Event) => void) | null = null;

/* Filters handed over from another view (e.g. the home search deck). Consumed once. */
export type DoctorsSeed = {
  q?: string;
  city?: string;
  insurance?: string;
  avail?: Avail;
  sort?: SortKey;
  specialty?: string;
};
let PENDING_SEED: DoctorsSeed | null = null;
export function seedDoctorsFilters(seed: DoctorsSeed) {
  PENDING_SEED = seed;
}

function emptyFilters(): Filters {
  return { q: "", city: "", hospital: "", avail: "any", specs: new Set<SpecialtyKey>(), gender: "all", insurance: "", maxPrice: 8000, minRating: 0, sort: "rating" };
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
    if (f.hospital && d.hospital_name !== f.hospital) return false;
    // clinic-only product: hide doctors that exist solely for (removed) video consultations
    if (d.telehealth && !d.hospital_name) return false;
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

/* Hospitals available under the current city filter, from real directory data. */
function hospitalOptions(rows: DoctorDirectoryRow[], city: string): string[] {
  return [...new Set(
    rows
      .filter((d) => !city || (d.hospital_city || d.city) === city)
      .map((d) => d.hospital_name)
      .filter((n): n is string => Boolean(n)),
  )].sort();
}

function doctorAvatar(doc: DoctorDirectoryRow): string {
  if (doc.photo_url) {
    return `<img class="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20" src="${escapeHtml(doc.photo_url)}" alt="${escapeHtml(doc.name)}" loading="lazy"/>`;
  }
  return `<span class="grid h-16 w-16 place-items-center whitespace-nowrap rounded-lg bg-primary text-[20px] font-bold leading-none text-on-primary sm:h-20 sm:w-20 sm:text-2xl">${escapeHtml(initials(doc.name))}</span>`;
}

function slotChipLabel(slot: DirectorySlot, firstDate: string): string {
  const t = formatTime(slot.start_time);
  return slot.available_date === firstDate ? t : `${formatRelativeDay(slot.available_date)} ${t}`;
}

function doctorRowHtml(doc: DoctorDirectoryRow): string {
  const first = doc.available_schedules[0] || null;
  const chips = doc.available_schedules.slice(0, 3);
  const today = daysFromToday(first ? first.available_date : "9999-12-31") === 0;
  const hospital = doc.hospital_name || "العيادة الخاصة";
  const coverage = doc.insurances.length ? `مغطى بالتأمين (${doc.insurances.slice(0, 2).join("، ")})` : "دفع مباشر";
  return `
<article class="flex flex-col gap-4 rounded-xl border border-line bg-surface-container-lowest p-4 sm:p-5 xl:flex-row xl:items-center" data-doctor-row="${escapeHtml(doc.id)}">
  <div class="flex min-w-0 flex-1 items-start gap-3">
    <div class="shrink-0">${doctorAvatar(doc)}</div>
    <div class="relative min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 class="text-[17px] font-bold leading-tight text-on-surface"><a href="#doctor/${escapeHtml(doc.id)}" class="after:absolute after:inset-0 after:content-['']">${escapeHtml(doc.name)}</a></h3>
        <span class="text-[12px] text-on-surface-variant">${escapeHtml(doc.title || "طبيب")}</span>
      </div>
      <p class="mt-0.5 text-[13px] font-medium text-primary">${escapeHtml(doc.specialization)}</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
        <span class="inline-flex min-w-0 items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-on-surface-variant" aria-hidden="true">local_hospital</span>
          <span class="truncate">${escapeHtml(hospital)}</span>
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-on-surface-variant" aria-hidden="true">location_on</span>
          <span>${escapeHtml(doc.hospital_city || doc.city || "—")}</span>
        </span>
        ${doc.experience_years ? `<span class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-on-surface-variant" aria-hidden="true">work_history</span>
          <span class="tabular-nums">${escapeHtml(doc.experience_years)}+ سنة خبرة</span>
        </span>` : ""}
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
        ${(doc.reviews_count ?? 0) > 0 ? `<span class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-warning" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">star</span>
          <span class="font-semibold tabular-nums text-on-surface">${(doc.rating ?? 0).toFixed(1)}</span>
          <span class="tabular-nums">(${escapeHtml(doc.reviews_count)} تقييم)</span>
        </span>` : `<span class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]" aria-hidden="true">rate_review</span>
          <span>لا تقييمات بعد</span>
        </span>`}
        <span class="inline-flex min-w-0 items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-tertiary" aria-hidden="true">health_and_safety</span>
          <span class="truncate">${escapeHtml(coverage)}</span>
        </span>
      </div>
    </div>
  </div>

  <div class="flex shrink-0 flex-col gap-2 border-t border-line pt-3 xl:w-[292px] xl:border-s xl:border-t-0 xl:ps-4 xl:pt-0">
    <div class="flex items-center justify-between gap-2 text-[12px] text-on-surface-variant">
      <span>المواعيد · ${first ? escapeHtml(formatRelativeDay(first.available_date)) : "—"}</span>
      <span class="font-medium text-tertiary">${today ? "متاح الآن" : "أقرب موعد"}</span>
    </div>
    <div class="grid grid-cols-3 gap-1.5">
      ${chips.map((s) => {
        const conflict = slotConflict(doc, s);
        return `
      <button class="press relative h-9 rounded-md text-[12px] tabular-nums transition-colors ${conflict ? "border border-error bg-error-container text-on-error-container" : "border border-line bg-surface-container-lowest text-on-surface hover:bg-surface-container"}" data-book-doctor="${escapeHtml(doc.id)}" type="button"${conflict ? ` title="${CONFLICT_NOTE[conflict]}"` : ""}>
        ${escapeHtml(slotChipLabel(s, first!.available_date))}${conflict ? `<span class="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-error text-on-error" title="${CONFLICT_NOTE[conflict]}"><span class="material-symbols-outlined text-[11px]" aria-hidden="true">error</span></span>` : ""}
      </button>`;
      }).join("")}
    </div>
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-baseline gap-1">
        <span class="text-[16px] font-semibold tabular-nums text-on-surface">${escapeHtml(doc.consultation_fee)}</span>
        <span class="text-[12px] text-on-surface-variant">ج.س</span>
      </div>
      <button class="press inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" data-book-doctor="${escapeHtml(doc.id)}" type="button">
        <span>احجز موعداً</span>
        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
      </button>
    </div>
  </div>
</article>`;
}


/* ------------------------------ control painting ------------------------------ */

const CHIP_ACTIVE = "inline-flex h-8 items-center gap-1 rounded-md bg-surface-container-highest px-2.5 text-[12px] font-semibold text-on-surface";
const CHIP_IDLE = "inline-flex h-8 items-center rounded-md px-2.5 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container";
const GENDER_ACTIVE = "h-8 rounded-md border border-line bg-surface-container-lowest text-[12px] font-semibold text-on-surface";
const GENDER_IDLE = "h-8 rounded-md text-[12px] text-on-surface-variant transition-colors hover:text-on-surface";
const RATING_ACTIVE = "flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-surface-container-highest text-[12px] font-semibold text-on-surface";
const RATING_IDLE = "flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-line bg-surface-container-lowest text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container";

function paintSpecialties(root: ParentNode, f: Filters) {
  root.querySelectorAll<HTMLInputElement>("#doc-specs input[data-spec]").forEach((input) => {
    input.checked = f.specs.has(input.dataset.spec as SpecialtyKey);
    input.closest("label")?.classList.toggle("bg-surface-container-low/60", input.checked);
  });
}

function paintControls(root: ParentNode, f: Filters) {
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
  const hospital = root.querySelector<HTMLSelectElement>("#doc-hospital");
  if (hospital) hospital.value = f.hospital;
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
  if (f.hospital) pills.push({ field: "hospital", label: f.hospital });
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
  box.className = "flex flex-wrap items-center gap-2";
  box.innerHTML = `<span class="text-[12px] text-on-surface-variant">الفلاتر النشطة:</span>${pills.map((p) => `
<span class="inline-flex h-7 items-center gap-1 rounded-md bg-surface-container-low ps-2 pe-1 text-[12px] text-on-surface">
${escapeHtml(p.label)}
<button class="material-symbols-outlined grid h-5 w-5 cursor-pointer place-items-center rounded text-[14px] text-on-surface-variant transition-colors hover:bg-error-container/50 hover:text-error" data-clear="${p.field}" type="button" aria-label="إزالة الفلتر">close</button>
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
    : `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest px-6 py-12 text-center">
<span class="material-symbols-outlined text-[28px] text-on-surface-variant" aria-hidden="true">search_off</span>
<p class="text-[15px] font-semibold text-on-surface">لا يوجد أطباء مطابقون</p>
<p class="max-w-[40ch] text-[13px] text-on-surface-variant">جرّب توسيع نطاق البحث أو إعادة تعيين الفلاتر.</p>
<button class="press mt-1 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" data-reset-empty type="button">إعادة تعيين الفلاتر</button>
</div>`;
  const count = root.querySelector<HTMLElement>("#doc-count");
  if (count) count.textContent = `${rows.length} طبيب`;
  const title = root.querySelector<HTMLElement>("#doc-title");
  if (title) title.textContent = f.city ? `أطباء واستشاريو ${f.city}` : "أطباء واستشاريو السودان";
  const sub = root.querySelector<HTMLElement>("#doc-count-sub");
  if (sub) sub.textContent = "المواعيد المعروضة متاحة خلال الأيام السبعة القادمة";
  const pag = root.querySelector<HTMLElement>("#doc-pagination");
  if (pag) {
    pag.className = rows.length > 10 ? "flex items-center justify-between rounded-xl border border-line bg-surface-container-lowest px-4 py-3" : "hidden";
    pag.innerHTML = rows.length > visibleCount
      ? `<span class="text-[13px] tabular-nums text-on-surface-variant">${rows.length - visibleCount} طبيب آخر</span><button id="doc-more" class="press inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="button">عرض المزيد</button>`
      : "";
  }
  activePills(root, f);
}

/* ----------------------------------- wiring ----------------------------------- */

function wireFilterToggle(appEl: HTMLElement) {
  const aside = appEl.querySelector<HTMLElement>("#filters-aside");
  const toggle = appEl.querySelector<HTMLButtonElement>("#filters-toggle");
  const label = appEl.querySelector<HTMLElement>("#filters-toggle-label");
  const chevron = appEl.querySelector<HTMLElement>("#filters-chevron");
  toggle?.addEventListener("click", () => {
    if (!aside) return;
    const nowHidden = aside.classList.toggle("hidden");
    if (nowHidden) {
      aside.classList.remove("drawer-in");
    } else {
      // Restart the entrance when re-opened quickly (same curve as the nav drawer).
      aside.classList.remove("drawer-in");
      void aside.offsetWidth;
      aside.classList.add("drawer-in");
    }
    if (label) label.textContent = nowHidden ? "فلترة النتائج" : "إخفاء الفلاتر";
    chevron?.classList.toggle("rotate-180", !nowHidden);
    if (!nowHidden) aside.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export async function wireDoctorsLive(appEl: HTMLElement) {
  wireFilterToggle(appEl);
  try {
    ROWS = await getDoctorsDirectory(7);
  } catch {
    const list = appEl.querySelector<HTMLElement>("#doc-list");
    if (list) list.innerHTML = `<div class="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface-container-lowest p-6"><span class="material-symbols-outlined text-[24px] text-error" aria-hidden="true">cloud_off</span><p class="text-[14px] text-on-surface">تعذّر تحميل الأطباء.</p><button class="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary" data-path="doctors-and-specialties" type="button">إعادة المحاولة</button></div>`;
    return;
  }

  const f = emptyFilters();
  const hasRatings = ROWS.some((d) => (d.reviews_count ?? 0) > 0);
  appEl.querySelector<HTMLElement>("#doc-rating-group")?.classList.toggle("hidden", !hasRatings);
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
    if (seed.avail) f.avail = seed.avail;
    if (seed.sort) f.sort = seed.sort;
    if (seed.specialty && SPECIALTIES.some((s) => s.key === seed.specialty)) {
      f.specs = new Set([seed.specialty as SpecialtyKey]);
    }
  }

  const cities = [...new Set(ROWS.map((d) => d.hospital_city || d.city).filter((c): c is string => Boolean(c)))].sort();

  // A city detected from the navbar scopes the directory to the nearest doctors,
  // unless the home deck handed over an explicit city.
  const savedCity = storedCity();
  if (!seed?.city && savedCity && cities.includes(savedCity)) f.city = savedCity;

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
    citySelect.innerHTML = `<option value="">كافة المدن</option>${cities.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
  }

  const hospitalSelect = appEl.querySelector<HTMLSelectElement>("#doc-hospital");
  const paintHospitals = () => {
    if (!hospitalSelect) return;
    const names = hospitalOptions(ROWS, f.city);
    if (f.hospital && !names.includes(f.hospital)) f.hospital = "";
    hospitalSelect.innerHTML = `<option value="">كافة المستشفيات</option>${names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")}`;
    hospitalSelect.value = f.hospital;
  };
  paintHospitals();

  const insSelect = appEl.querySelector<HTMLSelectElement>("#doc-insurance");
  if (insSelect) {
    const insurers = [...new Set(ROWS.flatMap((d) => d.insurances))].sort();
    insSelect.innerHTML = `<option value="">كافة شركات التأمين المعتمدة</option>${insurers.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")}`;
  }

  const rerender = () => { visibleCount = 30; render(appEl, f); };

  const resetAll = () => {
    Object.assign(f, { ...DEFAULTS, specs: new Set(DEFAULTS.specs) });
    paintHospitals();
    paintControls(appEl, f);
    rerender();
  };

  // Live update when the navbar detects the visitor's city while this page is open.
  if (cityListener) window.removeEventListener("miaadi:city-detected", cityListener);
  cityListener = (e) => {
    const city = (e as CustomEvent<string>).detail;
    if (!city || !appEl.querySelector("#doc-list")) return;
    f.city = city;
    paintControls(appEl, f);
    rerender();
  };
  window.addEventListener("miaadi:city-detected", cityListener);

  appEl.querySelector("#doc-pagination")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("#doc-more");
    if (!btn) return;
    visibleCount += 30;
    render(appEl, f);
  });

  const search = appEl.querySelector<HTMLInputElement>("#doc-search");
  search?.addEventListener("input", () => { f.q = search.value; rerender(); });
  citySelect?.addEventListener("change", () => { f.city = citySelect.value; paintHospitals(); rerender(); });
  hospitalSelect?.addEventListener("change", () => { f.hospital = hospitalSelect.value; rerender(); });
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

  appEl.querySelectorAll<HTMLElement>("#doc-avail [data-avail]").forEach((b) =>
    b.addEventListener("click", () => { f.avail = b.dataset.avail as Avail; paintControls(appEl, f); rerender(); }));
  appEl.querySelectorAll<HTMLElement>("#doc-gender [data-gender]").forEach((b) =>
    b.addEventListener("click", () => { f.gender = b.dataset.gender as Gender; paintControls(appEl, f); rerender(); }));
  appEl.querySelectorAll<HTMLElement>("#doc-rating [data-rating]").forEach((b) =>
    b.addEventListener("click", () => { f.minRating = Number(b.dataset.rating); paintControls(appEl, f); rerender(); }));

  appEl.querySelector("#reset-filters")?.addEventListener("click", resetAll);

  // The empty state offers the same reset, where the sidebar may be collapsed.
  appEl.querySelector("#doc-list")?.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest("[data-reset-empty]")) return;
    resetAll();
  });

  appEl.querySelector<HTMLElement>("#doc-active")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-clear]");
    if (!btn) return;
    switch (btn.dataset.clear) {
      case "q": f.q = ""; if (search) search.value = ""; break;
      case "city": f.city = ""; paintHospitals(); break;
      case "hospital": f.hospital = ""; break;
      case "avail": f.avail = "any"; break;
      case "specs": f.specs = new Set(DEFAULTS.specs); break;
      case "gender": f.gender = "all"; break;
      case "insurance": f.insurance = ""; break;
      case "rating": f.minRating = 0; break;
      case "price": f.maxPrice = 8000; break;
    }
    paintControls(appEl, f);
    paintHospitals();
    rerender();
  });

  paintControls(appEl, f);
  rerender();
  void loadPatientBusy().then(() => { if (PATIENT_BUSY_READY) rerender(); });
}
