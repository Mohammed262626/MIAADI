import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO } from "../../lib/format";
import { getDoctorSpecializations, getDoctorsDirectory, getPatientAppointments, type DoctorDirectoryRow } from "../../lib/supabase";
import { countSpecialties } from "../../lib/specialties";
import { initials, money, shortRef } from "../../components/ui";

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
  return `<span class="w-16 h-16 rounded-2xl shrink-0 shadow-sm grid place-items-center bg-gradient-to-br from-primary-container to-primary text-on-primary font-extrabold text-lg">${escapeHtml(initials(doc.name))}</span>`;
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
    <button class="px-space-md py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button" data-book-doctor="${escapeHtml(doc.id)}">
      احجز موعداً
    </button>
  </div>
</div>`;
}

function renderFeaturedDoctors(root: HTMLElement, docs: DoctorDirectoryRow[]) {
  const grid = root.querySelector<HTMLElement>("#featured-doctors");
  if (!grid) return;
  if (!docs.length) {
    grid.innerHTML = `<div class="col-span-full bg-surface-container-lowest rounded-3xl p-space-lg text-center text-on-surface-variant font-body-md text-body-md">لا يوجد أطباء متاحون للحجز حالياً. حدّث الصفحة للمحاولة مرة أخرى.</div>`;
    return;
  }
  grid.innerHTML = docs.slice(0, 8).map(featuredCardHtml).join("");
}

/* ------------------------------ specialty counts ------------------------------ */

function renderSpecialtyCounts(root: HTMLElement, specializations: string[]) {
  const counts = countSpecialties(specializations);
  root.querySelectorAll<HTMLElement>("[data-specialty-count]").forEach((el) => {
    const n = counts[el.dataset.specialtyCount || ""] ?? 0;
    el.textContent = n > 0 ? `${n} طبيب` : "قريباً";
  });
}

/* ---------------------------- next appointment hero ---------------------------- */

const QR_SVG = `<svg class="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 100 100">
<rect height="30" rx="4" width="30" x="0" y="0"></rect><rect fill="white" height="18" rx="2" width="18" x="6" y="6"></rect><rect height="10" rx="1" width="10" x="10" y="10"></rect>
<rect height="30" rx="4" width="30" x="70" y="0"></rect><rect fill="white" height="18" rx="2" width="18" x="76" y="6"></rect><rect height="10" rx="1" width="10" x="80" y="10"></rect>
<rect height="30" rx="4" width="30" x="0" y="70"></rect><rect fill="white" height="18" rx="2" width="18" x="6" y="76"></rect><rect height="10" rx="1" width="10" x="10" y="80"></rect>
<rect height="20" rx="2" width="10" x="40" y="10"></rect><rect height="20" rx="2" width="20" x="40" y="40"></rect><rect height="10" rx="2" width="10" x="70" y="40"></rect>
<rect height="10" rx="2" width="15" x="15" y="40"></rect><rect height="15" rx="2" width="20" x="40" y="70"></rect><rect height="25" rx="2" width="25" x="70" y="70"></rect>
</svg>`;

type AppointmentRow = {
  id: string;
  status: string;
  doctor_schedules?: {
    available_date?: string; start_time?: string; end_time?: string;
    doctors?: { id?: string; name?: string; specialization?: string; hospitals?: { name?: string } | null } | null;
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
    : "تابع مواعيدك، بطاقة الدخول الذكية، وتذكيراتك فور حجزك.";
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
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(title)}</h3>
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
          <span class="text-tertiary font-label-sm text-label-sm flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[14px]">verified</span>
            موافق عليه تأمينياً
          </span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(String(doc.name || "—"))}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(place)}</p>
        <div class="flex items-center gap-space-md mt-2 flex-wrap">
          <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>${escapeHtml(formatRelativeDay(String(sch.available_date || "")))}، ${escapeHtml(formatArabicDate(String(sch.available_date || "")))}</span>
          </div>
          <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span>${escapeHtml(formatTime(String(sch.start_time || "")))} (حضور بالعيادة)</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row items-center gap-space-md bg-surface-container-low rounded-2xl p-space-md shrink-0 justify-between">
      <div class="flex items-center gap-space-md">
        <div class="w-16 h-16 bg-surface-container-lowest p-1.5 rounded-xl flex items-center justify-center shadow-sm">${QR_SVG}</div>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-secondary">رقم بطاقة الوصول الذكية</span>
          <span class="font-headline-sm text-headline-sm text-on-surface font-mono tracking-wider font-bold tabular-nums">${escapeHtml(pass)}</span>
          <span class="font-body-sm text-body-sm text-tertiary">دخول مباشر بدون انتظار الاستقبال</span>
        </div>
      </div>
      <div class="flex items-center gap-space-xs w-full sm:w-auto">
        <button type="button" data-hero-cta="#appointments" class="flex-1 sm:flex-initial px-space-md py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          <span>عرض بطاقة الدخول</span>
        </button>
      </div>
    </div>
  </div>
</div>`;
}

/* ---------------------------------- wiring ---------------------------------- */

export async function wireHome(appEl: HTMLElement, user: HomeUser) {
  const gridEl = appEl.querySelector<HTMLElement>("#featured-doctors");
  if (gridEl) gridEl.innerHTML = `<div class="col-span-full py-space-lg text-center text-on-surface-variant font-body-md text-body-md">جارٍ تحميل الأطباء…</div>`;
  const heroEl = appEl.querySelector<HTMLElement>("#home-next-appointment");
  if (heroEl) heroEl.innerHTML = `<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm text-center text-on-surface-variant font-body-md text-body-md">جارٍ التحميل…</div>`;

  const [specializations, appointments] = await Promise.all([
    getDoctorSpecializations().catch(() => [] as string[]),
    user ? getPatientAppointments().catch(() => [] as unknown[]).then((r) => r as AppointmentRow[]) : Promise.resolve([] as AppointmentRow[]),
  ]);

  renderSpecialtyCounts(appEl, specializations);

  try {
    const docs = await getDoctorsDirectory(7);
    renderFeaturedDoctors(appEl, docs);
  } catch {
    const grid = appEl.querySelector<HTMLElement>("#featured-doctors");
    if (grid) grid.innerHTML = `<div class="col-span-full bg-surface-container-lowest rounded-3xl p-space-lg text-center text-on-surface-variant font-body-md text-body-md">تعذّر تحميل الأطباء. حدّث الصفحة للمحاولة مرة أخرى.</div>`;
  }

  const hero = appEl.querySelector<HTMLElement>("#home-next-appointment");
  if (hero) {
    const next = pickNextAppointment(appointments);
    hero.innerHTML = next ? bookingHeroHtml(next) : emptyHeroHtml(Boolean(user));
    hero.querySelectorAll<HTMLElement>("[data-hero-cta]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dest = btn.dataset.heroCta || "";
        if (dest === "auth") {
          appEl.querySelector<HTMLElement>('[data-action="open-auth"]')?.click();
        } else if (dest) {
          location.hash = dest;
        }
      });
    });
  }
}
