// Live wiring for the hospitals & centers directory (#hospitals).
//
// Rows come from the real hospitals table. Doctor counts, specialties,
// insurers and the earliest slot are derived from the same doctors directory
// the rest of the app uses, so the page never invents a facility fact.
import { escapeHtml, formatRelativeDay, formatTime } from "../../lib/format";
import { storedCity } from "../../lib/geodata";
import { getDoctorsDirectory, getHospitalsDirectory, type DoctorDirectoryRow, type HospitalRow } from "../../lib/supabase";
import { SPECIALTIES, specialtyKeyOf } from "../../lib/specialties";
import { seedDoctorsFilters } from "./doctorsLive";

type Kind = "" | "hospital" | "center";

type Filters = { q: string; city: string; kind: Kind };

type HospitalStat = HospitalRow & {
  doctors: number;
  specialties: string[];
  earliest: { date: string; time: string } | null;
  insurers: string[];
};

let cityListener: ((e: Event) => void) | null = null;

const KIND_LABEL: Record<string, string> = { hospital: "مستشفى", center: "مركز طبي" };

function kindLabel(kind: string): string {
  return KIND_LABEL[kind] || "مركز طبي";
}

function specialtyLabels(docs: DoctorDirectoryRow[]): string[] {
  const keys = new Set<string>();
  docs.forEach((d) => {
    const key = specialtyKeyOf(d.specialization);
    if (key) keys.add(key);
  });
  return SPECIALTIES.filter((s) => keys.has(s.key)).map((s) => s.label);
}

function earliestSlot(docs: DoctorDirectoryRow[]): HospitalStat["earliest"] {
  let best: { date: string; time: string } | null = null;
  docs.forEach((d) => {
    d.available_schedules.forEach((s) => {
      if (!s.available_date) return;
      const candidate = { date: s.available_date, time: s.start_time };
      if (!best || `${candidate.date} ${candidate.time}` < `${best.date} ${best.time}`) best = candidate;
    });
  });
  return best;
}

function buildStats(hospitals: HospitalRow[], docs: DoctorDirectoryRow[]): HospitalStat[] {
  const byHospital = new Map<string, DoctorDirectoryRow[]>();
  docs.forEach((d) => {
    const name = d.hospital_name;
    if (!name) return;
    const list = byHospital.get(name) || [];
    list.push(d);
    byHospital.set(name, list);
  });

  return hospitals
    .map((h) => {
      const list = byHospital.get(h.name) || [];
      const insurers = [...new Set(list.flatMap((d) => d.insurances))];
      return {
        ...h,
        doctors: list.length,
        specialties: specialtyLabels(list),
        earliest: earliestSlot(list),
        insurers,
      };
    })
    .sort((a, b) => b.doctors - a.doctors || a.name.localeCompare(b.name, "ar"));
}

function mapsUrl(h: HospitalStat): string {
  if (!h.address) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name}، ${h.address}، ${h.city || ""}`)}`;
}

function cardHtml(h: HospitalStat): string {
  const specialties = h.specialties.slice(0, 4);
  const extra = h.specialties.length - specialties.length;
  const maps = mapsUrl(h);
  const coverage = h.insurers.length ? h.insurers.slice(0, 2).join("، ") : "دفع مباشر";
  const next = h.earliest;
  return `<article class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-lowest p-4 sm:p-5">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[17px] font-bold leading-tight text-on-surface">${escapeHtml(h.name)}</h2>
        <span class="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">${escapeHtml(kindLabel(h.kind))}</span>
      </div>
      <p class="mt-1 flex items-center gap-1 text-[13px] text-on-surface-variant">
        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">location_on</span>
        <span class="truncate">${escapeHtml(h.city || "—")}${h.address ? ` · ${escapeHtml(h.address)}` : ""}</span>
      </p>
    </div>
    <span class="shrink-0 rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-semibold tabular-nums text-on-surface">${h.doctors > 0 ? `${h.doctors} طبيب` : "لا أطباء متاحون"}</span>
  </div>
  <div class="flex flex-wrap gap-1.5">
    ${specialties.map((label) => `<span class="rounded-md bg-surface-container-low px-2 py-1 text-[11px] text-on-surface-variant">${escapeHtml(label)}</span>`).join("")}
    ${extra > 0 ? `<span class="rounded-md bg-surface-container-low px-2 py-1 text-[11px] text-on-surface-variant">+${extra}</span>` : ""}
  </div>
  <div class="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
    <div class="flex flex-col">
      <span class="text-[11px] text-on-surface-variant">أقرب موعد متاح</span>
      <span class="text-[13px] font-semibold ${next ? "text-primary" : "text-on-surface-variant"}">${next ? `${escapeHtml(formatRelativeDay(next.date))} · ${escapeHtml(formatTime(next.time))}` : "لا مواعيد خلال 7 أيام"}</span>
      <span class="mt-0.5 text-[11px] text-on-surface-variant">تأمين: ${escapeHtml(coverage)}</span>
    </div>
    <div class="flex items-center gap-2">
      ${maps ? `<a class="press inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-surface-container-lowest px-3 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container" href="${escapeHtml(maps)}" rel="noreferrer" target="_blank">
        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">map</span>
        <span>خرائط</span>
      </a>` : ""}
      <button class="press inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container" data-explore data-hospital="${escapeHtml(h.name)}" data-city="${escapeHtml(h.city || "")}" type="button">
        <span>استعرض الأطباء</span>
        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
      </button>
    </div>
  </div>
</article>`;
}

function emptyHtml(): string {
  return `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest px-6 py-12 text-center">
<span class="material-symbols-outlined text-[28px] text-on-surface-variant" aria-hidden="true">search_off</span>
<p class="text-[15px] font-semibold text-on-surface">لا توجد مراكز مطابقة</p>
<p class="max-w-[40ch] text-[13px] text-on-surface-variant">جرّب مدينة أخرى أو امسح كلمة البحث.</p>
<button class="press mt-1 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" data-reset-empty type="button">إعادة تعيين الفلاتر</button>
</div>`;
}

function errorHtml(): string {
  return `<div class="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface-container-lowest p-6">
<span class="material-symbols-outlined text-[24px] text-error" aria-hidden="true">cloud_off</span>
<p class="text-[14px] text-on-surface">تعذّر تحميل المستشفيات والمراكز.</p>
<button class="press inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" data-hosp-retry type="button">إعادة المحاولة</button>
</div>`;
}

function wireFilterToggle(appEl: HTMLElement): void {
  const aside = appEl.querySelector<HTMLElement>("#filters-aside");
  const toggle = appEl.querySelector<HTMLButtonElement>("#filters-toggle");
  if (!toggle || toggle.dataset.hospBound === "1") return;
  toggle.dataset.hospBound = "1";
  const label = appEl.querySelector<HTMLElement>("#filters-toggle-label");
  const chevron = appEl.querySelector<HTMLElement>("#filters-chevron");
  toggle.addEventListener("click", () => {
    if (!aside) return;
    const nowHidden = aside.classList.toggle("hidden");
    if (nowHidden) {
      aside.classList.remove("drawer-in");
    } else {
      aside.classList.remove("drawer-in");
      void aside.offsetWidth;
      aside.classList.add("drawer-in");
    }
    if (label) label.textContent = nowHidden ? "فلترة النتائج" : "إخفاء الفلاتر";
    chevron?.classList.toggle("rotate-180", !nowHidden);
    if (!nowHidden) aside.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export async function wireHospitalsLive(appEl: HTMLElement): Promise<void> {
  wireFilterToggle(appEl);

  const list = appEl.querySelector<HTMLElement>("#hosp-list");
  const search = appEl.querySelector<HTMLInputElement>("#hosp-search");
  const citySelect = appEl.querySelector<HTMLSelectElement>("#hosp-city");
  const kindBox = appEl.querySelector<HTMLElement>("#hosp-kind");
  const title = appEl.querySelector<HTMLElement>("#hosp-title");
  const count = appEl.querySelector<HTMLElement>("#hosp-count");
  const sub = appEl.querySelector<HTMLElement>("#hosp-count-sub");

  if (cityListener) window.removeEventListener("miaadi:city-detected", cityListener);
  cityListener = null;

  let stats: HospitalStat[];
  try {
    const [hospitals, docs] = await Promise.all([getHospitalsDirectory(), getDoctorsDirectory(7)]);
    if (!appEl.querySelector("#hosp-list")) return; // navigated away
    stats = buildStats(hospitals, docs);
  } catch {
    if (list) {
      list.innerHTML = errorHtml();
      list.querySelector<HTMLElement>("[data-hosp-retry]")?.addEventListener("click", () => {
        list.innerHTML = "";
        void wireHospitalsLive(appEl);
      });
    }
    if (sub) sub.textContent = "تعذّر تحميل المراكز.";
    return;
  }

  const cities = [...new Set(stats.map((h) => h.city).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, "ar"));
  const f: Filters = { q: "", city: "", kind: "" };
  const saved = storedCity();
  if (saved && cities.includes(saved)) f.city = saved;

  if (citySelect) {
    citySelect.innerHTML = `<option value="">كافة المدن</option>${cities.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
    citySelect.value = f.city;
  }

  const paintKind = () => {
    kindBox?.querySelectorAll<HTMLButtonElement>("[data-kind]").forEach((b) => {
      const on = (b.dataset.kind || "") === f.kind;
      b.className = `h-8 rounded-md text-[12px] transition-colors ${on ? "border border-line bg-surface-container-lowest font-semibold text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`;
    });
  };

  const render = () => {
    if (!list) return;
    const q = f.q.trim().toLowerCase();
    const shown = stats.filter((h) => {
      if (f.city && h.city !== f.city) return false;
      if (f.kind && h.kind !== f.kind) return false;
      if (q) {
        const hay = `${h.name} ${h.city || ""} ${h.address || ""} ${h.specialties.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.innerHTML = shown.length ? shown.map(cardHtml).join("") : emptyHtml();
    if (count) count.textContent = `${shown.length} مركز`;
    if (title) title.textContent = f.city ? `المستشفيات والمراكز في ${f.city}` : "المستشفيات والمراكز في السودان";
    if (sub) sub.textContent = "المواعيد المعروضة متاحة خلال الأيام السبعة القادمة";
  };

  const resetAll = () => {
    f.q = "";
    f.city = "";
    f.kind = "";
    if (search) search.value = "";
    if (citySelect) citySelect.value = "";
    paintKind();
    render();
  };

  search?.addEventListener("input", () => { f.q = search.value; render(); });
  citySelect?.addEventListener("change", () => { f.city = citySelect.value; render(); });
  kindBox?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-kind]");
    if (!btn) return;
    f.kind = (btn.dataset.kind || "") as Kind;
    paintKind();
    render();
  });

  appEl.querySelector("#reset-filters")?.addEventListener("click", resetAll);
  list?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-reset-empty]")) { resetAll(); return; }
    const explore = target.closest<HTMLElement>("[data-explore]");
    if (!explore) return;
    seedDoctorsFilters({ hospital: explore.dataset.hospital || "", city: explore.dataset.city || "" });
    location.hash = "#doctors";
  });

  cityListener = (e) => {
    const city = (e as CustomEvent<string>).detail;
    if (!city || !appEl.querySelector("#hosp-list")) return;
    f.city = cities.includes(city) ? city : "";
    if (citySelect) citySelect.value = f.city;
    render();
  };
  window.addEventListener("miaadi:city-detected", cityListener);

  paintKind();
  render();
}
