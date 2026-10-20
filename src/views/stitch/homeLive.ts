import qrcode from "qrcode-generator";
import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { getDoctorSpecializations, getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow } from "../../lib/supabase";
import { countSpecialties } from "../../lib/specialties";
import { initials, money, shortRef } from "../../components/ui";
import { seedDoctorsFilters } from "./doctorsLive";

type HomeUser = { id?: string; profile?: { full_name?: string | null; role?: string | null } | null } | null;

/* ------------------------------ featured doctors ------------------------------ */

const BADGE_STYLES = [
  "bg-primary-fixed text-on-primary-fixed",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-fixed text-on-tertiary-fixed",
];

const TITLE_PREFIX = /^(استشاري أول|استشارية|استشاري|أخصائية|أخصائي|طبيب|طبيبة)\s+/;

function shortSpecialty(spec: string): string {
  return String(spec || "").trim().replace(TITLE_PREFIX, "");
}

function doctorPhoto(doc: DoctorDirectoryRow): string {
  if (doc.photo_url) {
    return `<img class="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" src="${escapeHtml(doc.photo_url)}" alt="${escapeHtml(doc.name)}" loading="lazy"/>`;
  }
  return `<span class="w-16 h-16 rounded-2xl shrink-0 shadow-sm grid place-items-center bg-primary text-on-primary font-extrabold text-lg">${escapeHtml(initials(doc.name))}</span>`;
}

function nextSlotLabel(doc: DoctorDirectoryRow): string | null {
  const s = doc.available_schedules[0];
  return s ? `${formatRelativeDay(s.available_date)} ${formatTime(s.start_time)}` : null;
}

function featuredCardHtml(doc: DoctorDirectoryRow, index: number): string {
  const badge = BADGE_STYLES[index % BADGE_STYLES.length];
  const rating = doc.rating === null ? "—" : doc.rating.toFixed(1);
  const next = nextSlotLabel(doc);
  const coverage = doc.insurances.length
    ? doc.insurances.slice(0, 3).join("، ")
    : (doc.telehealth ? "استشارة مرئية" : "دفع مباشر");
  return `
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between" data-doctor-card="${escapeHtml(doc.id)}">
  <div>
    <div class="flex items-start gap-space-sm mb-space-sm">
      ${doctorPhoto(doc)}
      <div class="flex flex-col min-w-0 flex-1">
        <div class="flex items-center justify-between gap-1">
          <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-md ${badge} font-bold truncate">${escapeHtml(doc.title || "طبيب")}</span>
          <div class="flex items-center gap-1 text-on-surface font-label-md text-label-md shrink-0">
            <span class="material-symbols-outlined text-[16px] text-[#F59E0B]" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="font-bold tabular-nums">${escapeHtml(rating)}</span>
            <span class="text-secondary text-label-sm tabular-nums">(${escapeHtml(doc.reviews_count ?? 0)})</span>
          </div>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-1">${escapeHtml(doc.name)}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant truncate" title="${escapeHtml(doc.specialization)}">${escapeHtml(shortSpecialty(doc.specialization))}</p>
      </div>
    </div>
    <div class="bg-surface-container-low rounded-2xl p-space-sm mb-space-sm flex flex-col gap-1.5">
      <div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
        <span class="material-symbols-outlined text-[16px] text-primary">apartment</span>
        <span class="truncate">${escapeHtml(doc.hospital_name || (doc.telehealth ? "استشارة مرئية عن بُعد" : "العيادة الخاصة"))}</span>
      </div>
      <div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
        <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
        <span class="truncate">${escapeHtml(doc.hospital_city || doc.city || "—")}</span>
      </div>
      <div class="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm mt-1">
        <span class="material-symbols-outlined text-[16px]">verified</span>
        <span class="truncate">تغطية: ${escapeHtml(coverage)}</span>
      </div>
    </div>
    <div class="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container mb-space-sm">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full ${next ? "bg-tertiary" : "bg-outline"}"></span>
        <span class="font-label-sm text-label-sm text-on-surface">أقرب موعد متاح:</span>
      </div>
      <span class="font-label-sm text-label-sm ${next ? "text-primary" : "text-secondary"} font-bold">${next ? escapeHtml(next) : "لا يوجد حالياً"}</span>
    </div>
  </div>
  <div class="pt-space-xs flex items-center justify-between">
    <div class="flex flex-col">
      <span class="font-label-sm text-label-sm text-secondary">رسوم الكشف:</span>
      <span class="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">${escapeHtml(money(doc.consultation_fee))}</span>
    </div>
    <button class="px-space-md py-2.5 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button" data-book-doctor="${escapeHtml(doc.id)}">
      احجز موعداً
    </button>
  </div>
</div>`;
}

function featuredLoadingHtml(): string {
  return [0, 1, 2, 3].map(() => `
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm animate-pulse">
  <div class="flex items-start gap-space-sm mb-space-sm">
    <div class="w-16 h-16 rounded-2xl bg-surface-container-high shrink-0"></div>
    <div class="flex flex-col gap-2 flex-1 pt-1">
      <div class="h-3 w-2/3 rounded-full bg-surface-container-high"></div>
      <div class="h-3 w-1/2 rounded-full bg-surface-container"></div>
    </div>
  </div>
  <div class="h-24 rounded-2xl bg-surface-container-low mb-space-sm"></div>
  <div class="h-4 w-1/2 rounded-full bg-surface-container"></div>
</div>`).join("");
}

function renderFeaturedDoctors(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const grid = root.querySelector<HTMLElement>("#featured-doctors");
  if (!grid) return;
  if (!docs.length) {
    grid.innerHTML = `<div class="col-span-full bg-surface-container-lowest rounded-3xl p-space-lg text-center text-on-surface-variant font-body-md text-body-md flex flex-col items-center gap-space-sm">
      <span class="material-symbols-outlined text-[28px] text-outline">event_busy</span>
      <span>لا يوجد أطباء لديهم مواعيد متاحة خلال الأسبوع القادم.</span>
      <a href="#doctors" class="min-h-11 px-space-lg inline-flex items-center rounded-full bg-primary text-on-primary font-label-md text-label-md">تصفح جميع الأطباء</a>
    </div>`;
    return;
  }
  grid.innerHTML = docs.slice(0, 8).map(featuredCardHtml).join("");
}

/* ------------------------------ specialty counts ------------------------------ */

function renderSpecialtyCounts(root: HTMLElement, specializations: string[]) {
  const counts = countSpecialties(specializations);
  root.querySelectorAll<HTMLButtonElement>("[data-specialty-link]").forEach((btn) => {
    const key = btn.dataset.specialtyLink || "";
    const n = counts[key] ?? 0;
    const badge = btn.querySelector<HTMLElement>(`[data-specialty-count="${key}"]`);
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
        case "video": seedDoctorsFilters({ consult: "video" }); break;
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

function qrSvg(text: string): string {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace("<svg ", '<svg class="w-full h-full" ');
}

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

function emptyHeroHtml(loggedIn: boolean): string {
  const title = loggedIn ? "لا توجد مواعيد قادمة" : "سجّل الدخول لعرض موعدك القادم";
  const body = loggedIn
    ? "اختر طبيبك المناسب واحجز موعدك في أقل من دقيقة."
    : "تابع مواعيدك ورقم مرجع الحجز لمشاركته مع من يرافقك.";
  const cta = loggedIn ? "تصفح الأطباء" : "تسجيل الدخول";
  const icon = loggedIn ? "event_busy" : "login";
  return `
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-lg relative overflow-hidden">
  <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
  <div class="flex flex-col lg:flex-row items-center justify-between gap-space-lg">
    <div class="flex items-center gap-space-md">
      <span class="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <span class="material-symbols-outlined text-[32px]">${icon}</span>
      </span>
      <div class="min-w-0">
        <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(title)}</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(body)}</p>
      </div>
    </div>
    <button type="button" data-hero-cta="${loggedIn ? "#doctors" : "auth"}" class="w-full sm:w-auto px-space-lg py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm shrink-0">
      ${escapeHtml(cta)}
    </button>
  </div>
</div>`;
}

function bookingHeroHtml(appt: AppointmentRow): string {
  const sch = appt.doctor_schedules || {};
  const doc = sch.doctors || {};
  const code = shortRef(appt.id);
  const pass = `MIA-${code.slice(0, 4)}-${code.slice(4, 8)}`;
  const spec = shortSpecialty(String(doc.specialization || ""));
  const place = doc.hospitals?.name ? `${spec} • ${doc.hospitals.name}` : spec;
  const mode = doc.telehealth ? "استشارة مرئية" : "حضور بالعيادة";
  const when = `${formatRelativeDay(String(sch.available_date || ""))}، ${formatArabicDate(String(sch.available_date || ""))}`;
  const at = formatTime(String(sch.start_time || ""));
  const shareText = [
    "موعدي في نبض العافية",
    `الطبيب: ${String(doc.name || "").trim() || "—"}`,
    `التاريخ: ${when}`,
    `الوقت: ${at} (${mode})`,
    `رقم المرجع: ${pass}`,
  ].join("\n");
  return `
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-lg relative overflow-hidden">
  <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
  <div class="flex flex-col lg:flex-row items-stretch justify-between gap-space-lg">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-md flex-1">
      <div class="relative">
        <span class="w-20 h-20 rounded-2xl shadow-sm grid place-items-center bg-gradient-to-br from-primary-container to-primary text-on-primary font-extrabold text-2xl">${escapeHtml(initials(String(doc.name || "")))}</span>
        <span class="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[14px]">
          <span class="material-symbols-outlined text-[14px]">check</span>
        </span>
      </div>
      <div class="flex flex-col min-w-0">
        <div class="inline-flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded-md bg-secondary-container font-label-sm text-label-sm text-on-secondary-container font-bold">موعدك القادم المؤكد</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(String(doc.name || "—"))}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(place)}</p>
        <div class="flex items-center gap-space-md mt-2 flex-wrap">
          <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>${escapeHtml(when)}</span>
          </div>
          <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span>${escapeHtml(at)} (${escapeHtml(mode)})</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row items-center gap-space-md bg-surface-container-low rounded-2xl p-space-md shrink-0 justify-between">
      <div class="flex items-center gap-space-md">
        <div class="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center shadow-sm" role="img" aria-label="رمز الاستجابة السريعة لرقم مرجع الموعد">${qrSvg(pass)}</div>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-secondary">رقم مرجع الموعد</span>
          <span class="font-headline-sm text-headline-sm text-on-surface font-mono tracking-wider font-bold tabular-nums">${escapeHtml(pass)}</span>
          <span class="font-body-sm text-body-sm text-tertiary">احتفظ به لمراجعة موعدك</span>
        </div>
      </div>
      <div class="flex items-center gap-space-xs w-full sm:w-auto">
        <button type="button" data-hero-cta="#appointments" class="flex-1 sm:flex-initial px-space-md py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>عرض بطاقة الدخول</span>
        </button>
        <a href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener noreferrer" class="p-2.5 min-h-11 min-w-11 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors inline-flex items-center justify-center" aria-label="مشاركة تفاصيل الموعد على واتساب" title="مشاركة على واتساب">
          <span class="material-symbols-outlined text-[20px]">chat</span>
        </a>
      </div>
    </div>
  </div>
</div>`;
}

/* ---------------------------------- wiring ---------------------------------- */

export async function wireHome(appEl: HTMLElement, user: HomeUser) {
  const heroEl = appEl.querySelector<HTMLElement>("#home-next-appointment");

  const [specializations, appointments, directory] = await Promise.all([
    getDoctorSpecializations().catch(() => [] as string[]),
    user ? getPatientAppointments().catch(() => [] as unknown[]).then((r) => r as AppointmentRow[]) : Promise.resolve([] as AppointmentRow[]),
    getDoctorsDirectory(7).catch(() => null),
  ]);

  renderSpecialtyCounts(appEl, specializations);
  wireHeroControls(appEl);

  if (heroEl) {
    const next = pickNextAppointment(appointments);
    heroEl.innerHTML = next ? bookingHeroHtml(next) : emptyHeroHtml(Boolean(user));
  }

  const renderFeaturedFailure = () => {
    const grid = appEl.querySelector<HTMLElement>("#featured-doctors");
    if (!grid) return;
    grid.innerHTML = `<div class="col-span-full bg-surface-container-lowest rounded-3xl p-space-lg text-center text-on-surface-variant font-body-md text-body-md flex flex-col items-center gap-space-sm">
      <span>تعذّر تحميل الأطباء.</span>
      <button class="min-h-11 px-space-lg rounded-full bg-primary text-on-primary font-label-md text-label-md" type="button" data-retry-featured>إعادة المحاولة</button>
    </div>`;
    grid.querySelector("[data-retry-featured]")?.addEventListener("click", async () => {
      const gridNow = appEl.querySelector<HTMLElement>("#featured-doctors");
      if (gridNow) gridNow.innerHTML = featuredLoadingHtml();
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
