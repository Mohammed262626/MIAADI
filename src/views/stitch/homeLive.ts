import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { getDoctorSpecializations, getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow } from "../../lib/supabase";
import { countSpecialties, specialtyKeyOf } from "../../lib/specialties";
import { initials, money, shortRef } from "../../components/ui";
import { NEXT_APPOINTMENT_SKELETON } from "./home";
import { storedCity } from "../../lib/geodata";

type HomeUser = { id?: string; profile?: { full_name?: string | null; role?: string | null } | null } | null;

/* The doctors catalog is a separate chunk; the home page only hands it the
   visitor's chosen filters, so it must not be a static dependency here. */
type DoctorsSeedPatch = Parameters<typeof import("./doctorsLive").seedDoctorsFilters>[0];
function seedDoctorsLater(patch: DoctorsSeedPatch) {
  void import("./doctorsLive").then((m) => m.seedDoctorsFilters(patch));
}

/* ------------------------------ featured doctors ------------------------------ */

const TITLE_PREFIX = /^(استشاري أول|استشارية|استشاري|أخصائية|أخصائي|طبيب|طبيبة)\s+/;

function shortSpecialty(spec: string): string {
  return String(spec || "").trim().replace(TITLE_PREFIX, "");
}

function doctorPhoto(doc: DoctorDirectoryRow): string {
  if (doc.photo_url) {
    return `<img class="h-16 w-16 shrink-0 rounded-full border border-line/60 object-cover" src="${escapeHtml(doc.photo_url)}" alt="${escapeHtml(doc.name)}" loading="lazy"/>`;
  }
  return `<span class="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-line/60 bg-primary text-[19px] font-extrabold text-on-primary">${escapeHtml(initials(doc.name))}</span>`;
}

function nextSlotLabel(doc: DoctorDirectoryRow): string | null {
  const s = doc.available_schedules[0];
  return s ? `${formatRelativeDay(s.available_date)} ${formatTime(s.start_time)}` : null;
}

const RELATIVE_DAYS = [localDateISO(0), localDateISO(1), localDateISO(2)];

/* The hero has room for the full date, but not for a doubled weekday
   ("اليوم، الثلاثاء، 20 أكتوبر"). */
function fullDateLabel(date: string): string {
  return RELATIVE_DAYS.includes(date) ? formatRelativeDay(date) : formatArabicDate(date);
}

function featuredCardHtml(doc: DoctorDirectoryRow, _index: number): string {
  const hasReviews = (doc.reviews_count ?? 0) > 0;
  const rating = hasReviews ? (doc.rating ?? 0).toFixed(1) : "";
  const next = nextSlotLabel(doc);
  const coverage = doc.insurances.length ? doc.insurances.slice(0, 3).join("، ") : "دفع مباشر";
  const ratingHtml = hasReviews
    ? `<span class="flex shrink-0 items-center gap-1 text-[12px] text-on-surface-variant">
          <span class="text-primary material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">star</span>
          <span class="font-semibold tabular-nums text-on-surface">${escapeHtml(rating)}</span>
          <span class="tabular-nums">(${escapeHtml(doc.reviews_count ?? 0)})</span>
        </span>`
    : `<span class="flex shrink-0 items-center gap-1 text-[12px] text-on-surface-variant">
          <span class="material-symbols-outlined text-[14px]" aria-hidden="true">rate_review</span>
          <span>لا تقييمات بعد</span>
        </span>`;
  return `
<article class="press relative flex h-full flex-col justify-between rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors hover:border-primary/40">
  <div>
    <div class="flex items-start gap-4">
      ${doctorPhoto(doc)}
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <span class="max-w-full truncate rounded bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">${escapeHtml(shortSpecialty(doc.specialization))}</span>
          ${ratingHtml}
        </div>
        <h3 class="mt-1.5 truncate text-[17px] font-bold leading-tight text-on-surface"><a class="after:absolute after:inset-0 after:content-['']" href="#doctor/${escapeHtml(doc.id)}">${escapeHtml(doc.name)}</a></h3>
        <p class="mt-0.5 truncate text-[13px] text-on-surface-variant">${escapeHtml(doc.hospital_city || doc.city || "—")}</p>
      </div>
    </div>
    <div class="mt-4 space-y-2 border-y border-line/60 py-3 text-[13px] text-on-surface-variant">
      <p class="flex items-center gap-2">
        <span aria-hidden="true" class="material-symbols-outlined text-[16px] text-outline">apartment</span>
        <span class="truncate">${escapeHtml(doc.hospital_name || "العيادة الخاصة")}</span>
      </p>
      <p class="flex items-center gap-2 text-on-surface">
        <span aria-hidden="true" class="material-symbols-outlined text-[16px] text-primary">schedule</span>
        <span>أقرب موعد: <strong class="font-bold ${next ? "text-primary" : "text-on-surface-variant"}">${next ? escapeHtml(next) : "لا يوجد حالياً"}</strong></span>
      </p>
      <p class="flex items-center gap-2">
        <span aria-hidden="true" class="material-symbols-outlined text-[16px] text-outline">verified_user</span>
        <span class="truncate">تغطية: ${escapeHtml(coverage)}</span>
      </p>
    </div>
  </div>
  <div class="mt-4 flex items-end justify-between gap-3">
    <div class="min-w-0">
      <p class="text-[12px] text-on-surface-variant">رسوم الكشف</p>
      <p class="text-[16px] font-bold tabular-nums text-on-surface">${escapeHtml(money(doc.consultation_fee))}</p>
    </div>
    <button class="press relative z-10 h-10 shrink-0 rounded-lg bg-primary px-5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="button" data-book-doctor="${escapeHtml(doc.id)}">
      احجز موعداً
    </button>
  </div>
</article>`;
}

function featuredLoadingHtml(): string {
  return [0, 1, 2].map(() => `
<div class="rounded-xl border border-line/80 bg-surface-container-lowest p-5">
  <div class="flex items-center gap-4">
    <div class="h-16 w-16 shrink-0 rounded-full bg-surface-container-high"></div>
    <div class="flex-1">
      <div class="h-4 w-2/3 rounded bg-surface-container-high"></div>
      <div class="mt-2 h-3 w-1/2 rounded bg-surface-container"></div>
      <div class="mt-2 h-3 w-3/4 rounded bg-surface-container"></div>
    </div>
  </div>
  <div class="mt-4 h-3 w-3/4 rounded bg-surface-container"></div>
  <div class="mt-5 h-10 rounded-lg bg-surface-container-high"></div>
</div>`).join("");
}

function renderFeaturedDoctors(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const grid = root.querySelector<HTMLElement>("#featured-doctors");
  if (!grid) return;
  grid.setAttribute("aria-busy", "false");
  if (!docs.length) {
    grid.innerHTML = `<div class="rise-in flex flex-col items-center gap-3 rounded-xl bg-surface-container-lowest px-5 py-8 text-center">
      <span aria-hidden="true" class="material-symbols-outlined text-[28px] text-outline">event_busy</span>
      <p class="text-[16px] text-on-surface-variant">لا يوجد أطباء لديهم مواعيد متاحة خلال الأسبوع القادم.</p>
      <a href="#doctors" class="press inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-on-primary">تصفح جميع الأطباء</a>
    </div>`;
    return;
  }
  grid.innerHTML = docs.slice(0, 6)
    .map((doc, i) => `<div class="rise-in h-full" style="animation-delay:${i * 50}ms">${featuredCardHtml(doc, i)}</div>`)
    .join("");
}

/* ------------------------------ real stats + hospitals ------------------------------ */

type HospitalGroup = { name: string; city: string; doctors: number; earliest: string | null };

function collectHospitals(docs: DoctorDirectoryRow[]): HospitalGroup[] {
  const groups = new Map<string, HospitalGroup>();
  docs.forEach((d) => {
    const name = d.hospital_name;
    if (!name) return;
    const g = groups.get(name) || { name, city: d.hospital_city || d.city || "", doctors: 0, earliest: null };
    g.doctors += 1;
    d.available_schedules.forEach((s) => {
      if (!s.available_date) return;
      const key = `${s.available_date} ${s.start_time}`;
      if (!g.earliest || key < g.earliest) g.earliest = key;
    });
    groups.set(name, g);
  });
  return [...groups.values()].sort((a, b) => b.doctors - a.doctors || a.name.localeCompare(b.name, "ar"));
}

function renderHomeStats(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const el = root.querySelector<HTMLElement>("#home-stats");
  if (!el) return;
  const hospitals = new Set(docs.map((d) => d.hospital_name).filter(Boolean));
  const cities = new Set(docs.map((d) => d.hospital_city || d.city).filter((c): c is string => Boolean(c)));
  const specs = new Set(docs.map((d) => specialtyKeyOf(d.specialization)).filter(Boolean));
  const items = [
    { value: docs.length, label: "طبيب متاح هذا الأسبوع" },
    { value: hospitals.size, label: "مستشفى ومركز" },
    { value: specs.size, label: "تخصصاً طبياً" },
    { value: cities.size, label: "مدينة في السودان" },
  ];
  el.innerHTML = items.map((item) => `
<div class="p-2">
  <div class="text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold tabular-nums text-white">${item.value}</div>
  <div class="mt-1 text-[13px] text-white/80">${escapeHtml(item.label)}</div>
</div>`).join("");
}

const HOSPITAL_ICONS = ["local_hospital", "domain", "health_and_safety"];

function hospitalCardHtml(h: HospitalGroup, index: number): string {
  const icon = HOSPITAL_ICONS[index % HOSPITAL_ICONS.length];
  let slot = "لا مواعيد خلال أسبوع";
  if (h.earliest) {
    const date = h.earliest.slice(0, 10);
    const time = h.earliest.slice(11);
    slot = `${formatRelativeDay(date)} · ${formatTime(time)}`;
  }
  return `<article class="press relative flex h-full flex-col justify-between rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors hover:border-primary/40">
  <div>
    <div class="mb-4 flex items-center justify-between gap-2">
      <span class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><span aria-hidden="true" class="material-symbols-outlined text-[20px]">${icon}</span></span>
      <span class="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-on-surface">${h.doctors} طبيب</span>
    </div>
    <h3 class="text-[17px] font-bold text-on-surface">${escapeHtml(h.name)}</h3>
    <p class="mt-1 flex items-center gap-1 text-[13px] text-outline">
      <span aria-hidden="true" class="material-symbols-outlined text-[15px]">location_on</span>
      <span class="truncate">${escapeHtml(h.city || "—")}</span>
    </p>
    <div class="mt-3 flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-surface-container-low/50 px-3 py-2">
      <span class="text-[12px] text-on-surface-variant">أقرب موعد شاغر</span>
      <span class="text-[12px] font-bold tabular-nums ${h.earliest ? "text-primary" : "text-on-surface-variant"}">${escapeHtml(slot)}</span>
    </div>
  </div>
  <button type="button" class="press relative z-10 mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary text-[13px] font-semibold text-primary transition-colors hover:bg-primary/5" data-hosp-explore data-hospital="${escapeHtml(h.name)}" data-city="${escapeHtml(h.city)}">استعرض الأطباء</button>
</article>`;
}

function renderHomeHospitals(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const el = root.querySelector<HTMLElement>("#home-hospitals");
  if (!el) return;
  el.setAttribute("aria-busy", "false");
  const groups = collectHospitals(docs).slice(0, 3);
  if (!groups.length) {
    el.closest("section")?.classList.add("hidden");
    return;
  }
  el.innerHTML = groups.map((h, i) => hospitalCardHtml(h, i)).join("");
  el.querySelectorAll<HTMLElement>("[data-hosp-explore]").forEach((btn) => {
    btn.addEventListener("click", () => {
      seedDoctorsLater({ hospital: btn.dataset.hospital || "", city: btn.dataset.city || "" });
      location.hash = "#doctors";
    });
  });
}

/* ------------------------------ specialty counts ------------------------------ */

function renderSpecialtyCounts(root: HTMLElement, specializations: string[] | null) {
  const counts = specializations ? countSpecialties(specializations) : null;
  root.querySelectorAll<HTMLButtonElement>("[data-specialty-link]").forEach((btn) => {
    const key = btn.dataset.specialtyLink || "";
    const badge = btn.querySelector<HTMLElement>(`[data-specialty-count="${key}"]`);
    if (!counts) {
      // Doctor table unreachable: keep tiles navigable instead of claiming "no data".
      if (badge) badge.textContent = "…";
      return;
    }
    const n = counts[key] ?? 0;
    if (badge) badge.textContent = n > 0 ? `${n} طبيب` : "قريباً";
    const off = n === 0;
    btn.disabled = off;
    btn.classList.toggle("opacity-50", off);
    btn.classList.toggle("cursor-not-allowed", off);
  });
}

/* ------------------------------ hero search deck ------------------------------ */

function fillHeroSelect(sel: HTMLSelectElement | null, values: string[], allLabel: string) {
  if (!sel) return;
  sel.innerHTML = `<option value="">${escapeHtml(allLabel)}</option>` +
    values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
}

function populateHeroFilters(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const cities = [...new Set(docs.map((d) => d.hospital_city || d.city).filter((c): c is string => Boolean(c)))].sort();
  const insurers = [...new Set(docs.flatMap((d) => d.insurances))].sort();
  fillHeroSelect(root.querySelector<HTMLSelectElement>("#hero-city"), cities, "كافة المدن");
  fillHeroSelect(root.querySelector<HTMLSelectElement>("#hero-insurance"), insurers, "كافة شركات التأمين");
  // Follow the city detected from the navbar when it is one of the listed options.
  const citySelect = root.querySelector<HTMLSelectElement>("#hero-city");
  const saved = storedCity();
  if (citySelect && saved && [...citySelect.options].some((o) => o.value === saved)) citySelect.value = saved;
}

function wireHeroControls(root: HTMLElement) {
  root.querySelector<HTMLFormElement>("#hero-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (sel: string) => (root.querySelector(sel) as HTMLInputElement | HTMLSelectElement | null)?.value.trim() || "";
    seedDoctorsLater({
      q: val("#hero-q"),
      city: val("#hero-city"),
      insurance: val("#hero-insurance"),
    });
    location.hash = "#doctors";
  });

  root.querySelectorAll<HTMLElement>("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switch (btn.dataset.quick) {
        case "today": seedDoctorsLater({ avail: "today" }); break;
        case "price": seedDoctorsLater({ sort: "price" }); break;
        default: return;
      }
      location.hash = "#doctors";
    });
  });

  root.querySelectorAll<HTMLElement>("[data-specialty-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const specialty = btn.dataset.specialtyLink;
      if (!specialty) return;
      seedDoctorsLater({ specialty });
      location.hash = "#doctors";
    });
  });
}

/* ---------------------------- next appointment hero ---------------------------- */

type AppointmentRow = {
  id: string;
  status: string;
  doctor_schedules?: {
    available_date?: string; start_time?: string; end_time?: string;
    doctors?: {
      id?: string; name?: string; specialization?: string; telehealth?: boolean;
      hospitals?: { name?: string } | null;
    } | null;
  } | null;
};

function pickNextAppointment(rows: AppointmentRow[]): AppointmentRow | null {
  const today = localDateISO();
  const upcoming = rows
    .filter((a) => a.status === "booked" && (a.doctor_schedules?.available_date || "") >= today)
    .sort((a, b) => {
      const ka = `${a.doctor_schedules?.available_date} ${a.doctor_schedules?.start_time}`;
      const kb = `${b.doctor_schedules?.available_date} ${b.doctor_schedules?.start_time}`;
      return ka.localeCompare(kb);
    });
  return upcoming[0] || null;
}

function heroFailureHtml(): string {
  return `
<div class="rise-in rounded-xl bg-surface-container-low p-4">
  <div class="flex items-start gap-3">
    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-error-container text-on-error-container">
      <span aria-hidden="true" class="material-symbols-outlined text-[22px]">cloud_off</span>
    </span>
    <div class="min-w-0">
      <p class="text-[16px] font-semibold leading-snug text-on-surface">تعذّر تحميل موعدك القادم</p>
      <p class="mt-0.5 text-[14px] leading-relaxed text-on-surface-variant">تحقق من اتصالك بالإنترنت ثم أعد المحاولة.</p>
    </div>
  </div>
  <button type="button" data-retry-appt class="press mt-3 h-11 w-full rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-container">
    إعادة المحاولة
  </button>
</div>`;
}

function emptyHeroHtml(loggedIn: boolean): string {
  const title = loggedIn ? "لا توجد مواعيد قادمة" : "سجّل الدخول لعرض موعدك القادم";
  const body = loggedIn
    ? "اختر طبيبك المناسب واحجز موعدك في أقل من دقيقة."
    : "تابع مواعيدك ورقم مرجع الحجز لمشاركته مع من يرافقك.";
  const cta = loggedIn ? "تصفح الأطباء" : "تسجيل الدخول";
  const icon = loggedIn ? "event_busy" : "login";
  return `
<div class="rise-in rounded-xl bg-surface-container-low p-4">
  <div class="flex items-start gap-3">
    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <span aria-hidden="true" class="material-symbols-outlined text-[22px]">${icon}</span>
    </span>
    <div class="min-w-0">
      <p class="text-[16px] font-semibold leading-snug text-on-surface">${escapeHtml(title)}</p>
      <p class="mt-0.5 text-[14px] leading-relaxed text-on-surface-variant">${escapeHtml(body)}</p>
    </div>
  </div>
  <button type="button" data-hero-cta="${loggedIn ? "#doctors" : "auth"}" class="press mt-3 h-11 w-full rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-container">
    ${escapeHtml(cta)}
  </button>
</div>`;
}

function bookingHeroHtml(appt: AppointmentRow): string {
  const sch = appt.doctor_schedules || {};
  const doc = sch.doctors || {};
  const code = shortRef(appt.id);
  const pass = `MIA-${code.slice(0, 4)}-${code.slice(4, 8)}`;
  const spec = shortSpecialty(String(doc.specialization || ""));
  const place = doc.hospitals?.name ? `${spec} • ${doc.hospitals.name}` : spec;
  const mode = "حضور بالعيادة";
  const when = fullDateLabel(String(sch.available_date || ""));
  const at = formatTime(String(sch.start_time || ""));
  const shareText = [
    "موعدي في ميعادي",
    `الطبيب: ${String(doc.name || "").trim() || "—"}`,
    `التاريخ: ${when}`,
    `الوقت: ${at} (${mode})`,
    `رقم المرجع: ${pass}`,
  ].join("\n");
  return `
<div class="rise-in rounded-xl bg-surface-container-low p-4">
  <div class="flex items-center justify-between gap-3">
    <span class="text-[13px] font-semibold text-tertiary">موعدك القادم</span>
    <span class="text-[13px] tabular-nums text-on-surface-variant">${escapeHtml(pass)}</span>
  </div>
  <p class="mt-2 text-[19px] font-bold leading-tight text-on-surface">${escapeHtml(String(doc.name || "—"))}</p>
  <p class="mt-0.5 text-[14px] text-on-surface-variant">${escapeHtml(place)}</p>
  <div class="mt-3 grid grid-cols-2 gap-2">
    <div class="rounded-xl bg-surface-container-lowest p-2.5">
      <p class="text-[13px] text-on-surface-variant">التاريخ</p>
      <p class="mt-0.5 text-[14px] font-semibold leading-snug text-on-surface">${escapeHtml(when)}</p>
    </div>
    <div class="rounded-xl bg-surface-container-lowest p-2.5">
      <p class="text-[13px] text-on-surface-variant">الوقت</p>
      <p class="mt-0.5 text-[14px] font-semibold tabular-nums text-on-surface">${escapeHtml(at)}</p>
    </div>
  </div>
  <div class="mt-3 flex items-center gap-3 rounded-xl bg-surface-container-lowest p-2.5">
    <div class="h-14 w-14 shrink-0 rounded-md bg-white p-1" role="img" aria-label="رمز الاستجابة السريعة لرقم مرجع الموعد" data-qr-pass="${escapeHtml(pass)}"></div>
    <p class="text-[13px] leading-snug text-on-surface-variant">أظهر هذا الرمز في الاستقبال للتحقق من حجزك.</p>
  </div>
  <div class="mt-3 flex gap-2">
    <button type="button" data-hero-cta="#appointments" class="press h-11 flex-1 rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-container">
      بطاقة الدخول
    </button>
    <a href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener noreferrer" class="press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-high" aria-label="مشاركة تفاصيل الموعد على واتساب" title="مشاركة على واتساب">
      <span aria-hidden="true" class="material-symbols-outlined text-[20px]">chat</span>
    </a>
  </div>
</div>`;
}

/* ---------------------------------- wiring ---------------------------------- */

async function paintHeroQr(heroEl: HTMLElement) {
  const box = heroEl.querySelector<HTMLElement>("[data-qr-pass]");
  if (!box) return;
  const pass = box.dataset.qrPass || "";
  try {
    const { qrSvg } = await import("../../components/qr");
    if (box.isConnected) box.innerHTML = qrSvg(pass);
  } catch { /* keep the empty frame */ }
}

async function renderNextAppointment(root: HTMLElement, user: HomeUser, rows: AppointmentRow[] | null) {
  const heroEl = root.querySelector<HTMLElement>("#home-next-appointment");
  if (!heroEl) return;
  if (!user) { heroEl.innerHTML = emptyHeroHtml(false); return; }
  if (rows) {
    const next = pickNextAppointment(rows);
    heroEl.innerHTML = next ? bookingHeroHtml(next) : emptyHeroHtml(true);
    // The QR generator is a booking-flow dependency; keep it out of the entry
    // chunk and paint the card first, then fill the code in.
    if (next) void paintHeroQr(heroEl);
    return;
  }
  heroEl.innerHTML = heroFailureHtml();
  heroEl.querySelector("[data-retry-appt]")?.addEventListener("click", () => {
    heroEl.innerHTML = NEXT_APPOINTMENT_SKELETON;
    getPatientAppointments()
      .catch(() => null)
      .then((r) => void renderNextAppointment(root, user, r as AppointmentRow[] | null));
  });
}

export async function wireHome(appEl: HTMLElement, user: HomeUser) {
  // Signed-out guests have nothing to fetch; signed-in failures surface as a
  // retryable card instead of a fake "لا توجد مواعيد قادمة" state.
  const appointmentsPromise: Promise<AppointmentRow[] | null> = user
    ? getPatientAppointments().catch(() => null).then((r) => r as AppointmentRow[] | null)
    : Promise.resolve([] as AppointmentRow[]);

  const [specializations, directory] = await Promise.all([
    getDoctorSpecializations().catch(() => null),
    getDoctorsDirectory(7).catch(() => null),
  ]);

  renderSpecialtyCounts(appEl, specializations);
  wireHeroControls(appEl);

  await renderNextAppointment(appEl, user, await appointmentsPromise);

  // Stats and the hospitals grid are derived from the same directory rows.
  // Without them there is nothing honest to show, so the sections collapse.
  const hideDerivedSections = () => {
    appEl.querySelector("#home-stats")?.closest("section")?.classList.add("hidden");
    appEl.querySelector("#home-hospitals")?.closest("section")?.classList.add("hidden");
  };

  const renderFeaturedFailure = () => {
    const grid = appEl.querySelector<HTMLElement>("#featured-doctors");
    if (!grid) return;
    grid.innerHTML = `<div class="rise-in flex flex-col items-center gap-3 rounded-xl bg-surface-container-lowest px-5 py-8 text-center">
      <span aria-hidden="true" class="material-symbols-outlined text-[28px] text-outline">cloud_off</span>
      <p class="text-[16px] text-on-surface-variant">تعذّر تحميل الأطباء.</p>
      <button class="press inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-[15px] font-semibold text-on-primary" type="button" data-retry-featured><span aria-hidden="true" class="material-symbols-outlined text-[18px]">refresh</span>إعادة المحاولة</button>
    </div>`;
    grid.setAttribute("aria-busy", "false");
    grid.querySelector("[data-retry-featured]")?.addEventListener("click", async () => {
      const gridNow = appEl.querySelector<HTMLElement>("#featured-doctors");
      if (gridNow) { gridNow.innerHTML = featuredLoadingHtml(); gridNow.setAttribute("aria-busy", "true"); }
      try {
        const rows = await getDoctorsDirectory(7);
        populateHeroFilters(appEl, rows);
        renderFeaturedDoctors(appEl, rows);
        renderHomeStats(appEl, rows);
        renderHomeHospitals(appEl, rows);
      } catch {
        renderFeaturedFailure();
      }
    });
  };

  if (directory) {
    populateHeroFilters(appEl, directory);
    renderFeaturedDoctors(appEl, directory);
    renderHomeStats(appEl, directory);
    renderHomeHospitals(appEl, directory);
  } else {
    hideDerivedSections();
    renderFeaturedFailure();
  }
}
