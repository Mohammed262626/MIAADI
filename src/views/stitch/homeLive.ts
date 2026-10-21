import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { getDoctorSpecializations, getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow } from "../../lib/supabase";
import { countSpecialties } from "../../lib/specialties";
import { initials, money, shortRef } from "../../components/ui";
import { qrSvg } from "../../components/qr";
import { NEXT_APPOINTMENT_SKELETON } from "./home";
import { seedDoctorsFilters } from "./doctorsLive";
import { storedCity } from "../../lib/geodata";

type HomeUser = { id?: string; profile?: { full_name?: string | null; role?: string | null } | null } | null;

/* ------------------------------ featured doctors ------------------------------ */

const TITLE_PREFIX = /^(استشاري أول|استشارية|استشاري|أخصائية|أخصائي|طبيب|طبيبة)\s+/;

function shortSpecialty(spec: string): string {
  return String(spec || "").trim().replace(TITLE_PREFIX, "");
}

function doctorPhoto(doc: DoctorDirectoryRow): string {
  if (doc.photo_url) {
    return `<img class="h-20 w-20 shrink-0 rounded-xl object-cover" src="${escapeHtml(doc.photo_url)}" alt="${escapeHtml(doc.name)}" loading="lazy"/>`;
  }
  return `<span class="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary text-[22px] font-extrabold text-on-primary">${escapeHtml(initials(doc.name))}</span>`;
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
  const rating = doc.rating === null ? "—" : doc.rating.toFixed(1);
  const next = nextSlotLabel(doc);
  const coverage = doc.insurances.length
    ? doc.insurances.slice(0, 3).join("، ")
    : "دفع مباشر";
  return `
<article class="press relative rounded-xl bg-surface-container-lowest p-4 sm:p-5">
  <div class="flex items-start gap-4">
    ${doctorPhoto(doc)}
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <h3 class="truncate text-[19px] font-bold leading-tight text-on-surface"><a href="#doctor/${escapeHtml(doc.id)}" class="after:absolute after:inset-0 after:content-['']">${escapeHtml(doc.name)}</a></h3>
        <span class="flex shrink-0 items-center gap-1 text-[14px] text-on-surface-variant">
          <span class="text-primary material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">star</span>
          <span class="font-semibold tabular-nums text-on-surface">${escapeHtml(rating)}</span>
          <span class="tabular-nums">(${escapeHtml(doc.reviews_count ?? 0)})</span>
        </span>
      </div>
      <p class="mt-1 truncate text-[15px] text-on-surface-variant" title="${escapeHtml(doc.specialization)}">${escapeHtml(shortSpecialty(doc.specialization))}</p>
      <p class="mt-1 truncate text-[14px] text-on-surface-variant">${escapeHtml(doc.hospital_name || "العيادة الخاصة")} · ${escapeHtml(doc.hospital_city || doc.city || "—")}</p>
    </div>
  </div>
  <div class="mt-4 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <p class="text-[13px] text-on-surface-variant">أقرب موعد متاح</p>
      <p class="mt-0.5 text-[15px] font-semibold ${next ? "text-primary" : "text-on-surface-variant"}">${next ? escapeHtml(next) : "لا يوجد حالياً"}</p>
      <p class="mt-1 truncate text-[13px] text-on-surface-variant">تغطية: ${escapeHtml(coverage)}</p>
    </div>
    <div class="flex shrink-0 items-center gap-3">
      <div class="text-end">
        <p class="text-[13px] text-on-surface-variant">رسوم الكشف</p>
        <p class="text-[17px] font-bold tabular-nums text-on-surface">${escapeHtml(money(doc.consultation_fee))}</p>
      </div>
      <button class="press relative z-10 h-11 rounded-xl bg-primary px-4 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="button" data-book-doctor="${escapeHtml(doc.id)}">
        احجز
      </button>
    </div>
  </div>
</article>`;
}

function featuredLoadingHtml(): string {
  return [0, 1, 2].map(() => `
<div class="rounded-xl bg-surface-container-lowest p-4 sm:p-5">
  <div class="flex items-start gap-4">
    <div class="h-20 w-20 shrink-0 rounded-xl bg-surface-container-high"></div>
    <div class="flex-1 pt-1">
      <div class="h-4 w-2/3 rounded bg-surface-container-high"></div>
      <div class="mt-2 h-3 w-1/2 rounded bg-surface-container"></div>
      <div class="mt-2 h-3 w-3/4 rounded bg-surface-container"></div>
    </div>
  </div>
  <div class="mt-4 flex items-end justify-between gap-4">
    <div class="h-3 w-32 rounded bg-surface-container"></div>
    <div class="h-11 w-24 rounded-xl bg-surface-container-high"></div>
  </div>
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
  grid.innerHTML = docs.slice(0, 5)
    .map((doc, i) => `<div class="rise-in" style="animation-delay:${i * 50}ms">${featuredCardHtml(doc, i)}</div>`)
    .join("");
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
    seedDoctorsFilters({
      q: val("#hero-q"),
      city: val("#hero-city"),
      insurance: val("#hero-insurance"),
    });
    location.hash = "#doctors";
  });

  root.querySelectorAll<HTMLElement>("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switch (btn.dataset.quick) {
        case "today": seedDoctorsFilters({ avail: "today" }); break;
        case "price": seedDoctorsFilters({ sort: "price" }); break;
        default: return;
      }
      location.hash = "#doctors";
    });
  });

  root.querySelectorAll<HTMLElement>("[data-specialty-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const specialty = btn.dataset.specialtyLink;
      if (!specialty) return;
      seedDoctorsFilters({ specialty });
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
    <div class="h-14 w-14 shrink-0 rounded-md bg-white p-1" role="img" aria-label="رمز الاستجابة السريعة لرقم مرجع الموعد">${qrSvg(pass)}</div>
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

async function renderNextAppointment(root: HTMLElement, user: HomeUser, rows: AppointmentRow[] | null) {
  const heroEl = root.querySelector<HTMLElement>("#home-next-appointment");
  if (!heroEl) return;
  if (!user) { heroEl.innerHTML = emptyHeroHtml(false); return; }
  if (rows) {
    const next = pickNextAppointment(rows);
    heroEl.innerHTML = next ? bookingHeroHtml(next) : emptyHeroHtml(true);
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
      } catch {
        renderFeaturedFailure();
      }
    });
  };

  if (directory) {
    populateHeroFilters(appEl, directory);
    renderFeaturedDoctors(appEl, directory);
  } else {
    renderFeaturedFailure();
  }
}
