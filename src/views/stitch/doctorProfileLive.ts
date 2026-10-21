// Live wiring for the doctor dossier screen (#doctor/:id).
//
// Facts come from the database (doctors + hospitals + doctor_insurances +
// doctor_schedules); the editorial sections (credentials, highlights, treated
// conditions, patient quotes, wayfinding line) come from specialtyContent.ts.
// Booking is real: it writes through the book_appointment RPC.
import { escapeHtml, formatArabicDate, formatDayNum, formatMonthShort, formatRelativeDay, formatTime, formatWeekdayShort, localDateISO, translateAuthError } from "../../lib/format";
import { bookAppointmentRPC, getDoctorProfile, getDoctorProfileSlots, getDoctorReviews, getReviewableAppointmentId, rescheduleAppointmentRPC, submitDoctorReview, type DoctorProfileRow, type DoctorReview, type ProfileSlot } from "../../lib/supabase";
import { clearRescheduleIntent, getRescheduleIntent } from "../../lib/reschedule";
import { initials, shortRef } from "../../components/ui";
import { confirmSheet } from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { contentOf, specialtyLabel, titleEn } from "./specialtyContent";

type ProfileUser = {
  id?: string;
  profile?: { full_name?: string | null; phone?: string | null; role?: string | null } | null;
} | null;

const WINDOW_DAYS = 5;
const LOOKAHEAD_DAYS = 30;
const MORNING_CUTOFF_MIN = 13 * 60;


function dayOf(date: string): Date {
  return new Date(date + "T12:00:00");
}

function minutesOf(time: string): number {
  const [h = "0", m = "0"] = String(time).split(":");
  return Number(h) * 60 + Number(m);
}

function monthLabel(date: string): string {
  const d = dayOf(date);
  return `${formatMonthShort(date)} ${d.getFullYear()}`;
}

// "+3.1k" style headcount derived from the review volume (decorative, matches
// the reference screen's recovered-cases chip).
function compactCount(n: number): string {
  if (n >= 1000) return `+${(n / 1000).toFixed(1)}k`;
  return `+${n}`;
}

function mapsUrl(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function errorPanel(message: string): string {
  return `<div class="flex flex-col items-center gap-2 py-space-lg text-center">
    <span class="material-symbols-outlined text-[28px] text-secondary">error</span>
    <p class="font-label-md text-label-md text-on-surface-variant">${escapeHtml(message)}</p>
  </div>`;
}

export async function wireDoctorProfile(appEl: HTMLElement, doctorId: string, user: ProfileUser): Promise<void> {
  const el = <T extends HTMLElement = HTMLElement>(id: string): T | null => appEl.querySelector<T>(`#${id}`);
  const setText = (id: string, text: string) => { const n = el(id); if (n) n.textContent = text; };

  let profile: DoctorProfileRow | null = null;
  let slots: ProfileSlot[] = [];
  let reviews: DoctorReview[] = [];
  try {
    profile = await getDoctorProfile(doctorId);
    if (profile) slots = await getDoctorProfileSlots(doctorId, localDateISO(0), localDateISO(LOOKAHEAD_DAYS));
  } catch {
    setText("summary-datetime-display", "تعذّر تحميل بيانات الطبيب");
  }
  if (profile) {
    try { reviews = await getDoctorReviews(profile.id); } catch { reviews = []; }
  }
  if (!profile) {
    const box = el("morning-slots");
    if (box) box.innerHTML = errorPanel("لم يتم العثور على الطبيب المطلوب");
    setText("dp-name", "طبيب غير معروف");
    setText("dp-crumb-name", "طبيب غير معروف");
    return;
  }

  const content = contentOf(profile.specialization);
  const fee = Number(profile.consultation_fee) || 0;

  /* --------------------------- reschedule intent ---------------------------- */

  const mainHost = appEl.querySelector<HTMLElement>("main");
  let rescheduling = getRescheduleIntent();
  if (rescheduling && mainHost) {
    const banner = document.createElement("div");
    banner.id = "dp-reschedule-banner";
    banner.className = "px-margin-desktop pt-space-md";
    banner.innerHTML = `<div class="max-w-7xl mx-auto rounded-xl bg-primary-container text-on-primary-container px-space-md py-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm">
      <span class="material-symbols-outlined text-[20px]">edit_calendar</span>
      <p class="flex-1 font-label-md text-label-md">أنت تُعيد جدولة الموعد <span class="font-bold tabular-nums">${escapeHtml(rescheduling.ref)}</span> — اختر وقتاً جديداً وسيُستبدل الموعد القديم تلقائياً.</p>
      <button type="button" data-cancel-reschedule class="h-9 px-space-md rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold shrink-0">تراجع</button>
    </div>`;
    mainHost.prepend(banner);
    banner.querySelector("[data-cancel-reschedule]")?.addEventListener("click", () => {
      clearRescheduleIntent();
      rescheduling = null;
      banner.remove();
      location.hash = "#appointments";
    });
  }

  /* ------------------------------- static parts ------------------------------ */

  const freeOn = (date: string) => slots.filter((s) => s.available_date === date && !s.is_booked);
  const allOn = (date: string) => slots.filter((s) => s.available_date === date);

  let firstFree = "";
  for (let i = 0; i <= LOOKAHEAD_DAYS; i += 1) {
    const d = localDateISO(i);
    if (freeOn(d).length) { firstFree = d; break; }
  }

  // breadcrumb + identity
  const crumb = el("dp-crumb-spec") as HTMLAnchorElement | null;
  if (crumb) { crumb.textContent = specialtyLabel(profile.specialization); crumb.setAttribute("href", "#doctors"); }
  crumb?.closest("nav")?.querySelector("a")?.setAttribute("href", "#home");
  setText("dp-crumb-name", profile.name);
  setText("dp-title-pill", profile.title || "استشاري");

  const avatar = el("dp-avatar");
  if (avatar) {
    if (profile.photo_url) {
      avatar.className = "w-full h-full";
      avatar.innerHTML = `<img class="w-full h-full object-cover" src="${escapeHtml(profile.photo_url)}" alt="${escapeHtml(profile.name)}"/>`;
    } else {
      avatar.className = "grid h-full w-full place-items-center whitespace-nowrap rounded-xl bg-primary text-[28px] font-bold leading-none text-on-primary";
      avatar.textContent = initials(profile.name);
    }
  }

  const nameEl = el("dp-name");
  if (nameEl) nameEl.textContent = profile.name;
  setText("dp-specialization", profile.specialization);

  // affiliation
  setText("dp-hospital", profile.hospital_name || "استشارة افتراضية عن بُعد");
  const city = profile.hospital_name ? profile.hospital_city || profile.city || "" : "عبر الفيديو";
  const showCity = !!city && !(profile.hospital_name || "").includes(city);
  setText("dp-hospital-city", showCity ? city : "");
  el("dp-city-sep")?.classList.toggle("hidden", !showCity);
  const hospIcon = el("dp-hospital")?.parentElement?.querySelector<HTMLElement>(".material-symbols-outlined");
  if (hospIcon && !profile.hospital_name) hospIcon.textContent = "local_hospital";

  const creds = el("dp-credentials");
  if (creds) {
    creds.innerHTML = content.credentials
      .map((c) => `<span class="rounded-md bg-surface-container-low px-2 py-1 text-[12px] text-on-surface-variant">${escapeHtml(c)}</span>`)
      .join("");
  }

  // metric chips
  const expCell = el("dp-exp-cell");
  if (profile.experience_years) setText("dp-exp", `+${profile.experience_years}`);
  else expCell?.remove();
  if ((profile.reviews_count ?? 0) > 0) {
    setText("dp-rating", profile.rating.toFixed(1));
    setText("dp-reviews-count", `${profile.reviews_count} تقييم`);
  } else {
    setText("dp-rating", "—");
    setText("dp-reviews-count", "لا تقييمات بعد");
  }

  // availability pill
  const availability = el("dp-availability");
  if (availability) {
    if (firstFree === localDateISO(0)) {
      availability.innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary"></span>متاح اليوم للحجز الفوري`;
    } else if (firstFree) {
      availability.innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary"></span>أقرب موعد: ${escapeHtml(formatRelativeDay(firstFree))}`;
    } else {
      availability.innerHTML = `<span class="w-2 h-2 rounded-full bg-secondary"></span>لا تتوفر مواعيد حالياً`;
    }
  }

  // about
  setText("dp-bio-1", profile.about || content.bio);
  const bio2 = el("dp-bio-2");
  if (bio2) {
    if (profile.about) bio2.textContent = content.bio;
    else bio2.remove();
  }

  const highlights = el("dp-highlights");
  if (highlights) {
    highlights.innerHTML = content.highlights
      .map((h) => `<div class="flex items-center gap-space-xs text-on-surface"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span><span class="font-label-md text-label-md">${escapeHtml(h)}</span></div>`)
      .join("");
  }

  setText("dp-services-icon", content.sectionIcon);
  const services = el("dp-services");
  if (services) {
    services.innerHTML = content.services
      .map((s) => `<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
        <div class="p-2 bg-surface-container-lowest rounded-lg text-primary"><span class="material-symbols-outlined text-[22px]">${escapeHtml(s.icon)}</span></div>
        <div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${escapeHtml(s.title)}</h4>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${escapeHtml(s.desc)}</p>
        </div>
      </div>`)
      .join("");
  }

  // location & wayfinding
  el("dp-map-skeleton")?.remove();
  const mapWrap = el("dp-map")?.parentElement;
  const mapLink = el("dp-map-link") as HTMLAnchorElement | null;
  if (profile.hospital_name) {
    const mapEl = el("dp-map");
    if (mapEl) {
      const location = [profile.hospital_name, profile.hospital_address, profile.hospital_city]
        .filter(Boolean)
        .join(", ");
      mapEl.setAttribute("data-location", location);
      mapEl.setAttribute("src", `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`);
    }
    setText("dp-building-name", profile.hospital_name);
    setText("dp-building-line", `${profile.hospital_address || ""}${profile.hospital_address ? "، " : ""}${profile.hospital_city || ""}`);
    if (mapLink) {
      mapLink.setAttribute("href", mapsUrl(`${profile.hospital_name} ${profile.hospital_city || ""}`));
      mapLink.setAttribute("target", "_blank");
      mapLink.setAttribute("rel", "noreferrer");
    }
  } else {
    mapWrap?.remove();
    setText("dp-gate", "استشارة عن بُعد — لا يلزم الحضور");
    setText("dp-building-name", "الاستشارة الافتراضية (فيديو)");
    setText("dp-building-line", "يُرسل رابط الجلسة قبل الموعد على جوالك");
    mapLink?.parentElement?.remove();
  }
  setText("dp-clinic-name", content.clinic.name);
  setText("dp-clinic-line", content.clinic.line);

  // reviews — real rows, each tied to a completed visit
  const doctor = profile;
  const reviewList = el("dp-review-list");
  const formSlot = el("dp-review-form-slot");

  const maskName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "مريض";
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  const starsHtml = (value: number) => {
    const filled = Math.max(1, Math.min(5, Math.round(value)));
    const stars = Array.from({ length: 5 }, (_, i) => {
      const on = i < filled;
      return `<span class="material-symbols-outlined text-[15px] ${on ? "text-warning" : "text-line"}" style="font-variation-settings: 'FILL' ${on ? 1 : 0};" aria-hidden="true">star</span>`;
    }).join("");
    return `<span class="inline-flex items-center gap-0.5" role="img" aria-label="${filled} من 5 نجوم">${stars}</span>`;
  };

  const applyRating = (rating: number, count: number) => {
    el("dp-rating-star")?.classList.toggle("hidden", count === 0);
    if (count > 0) {
      setText("dp-rating", rating.toFixed(1));
      setText("dp-reviews-count", `${count} تقييم`);
      setText("dp-rating-big", `${rating.toFixed(1)} / 5.0`);
    } else {
      setText("dp-rating", "—");
      setText("dp-reviews-count", "لا تقييمات بعد");
      setText("dp-rating-big", "لا تقييمات بعد");
    }
  };

  const emptyReviewsHtml = `<div class="flex flex-col items-center gap-1 rounded-xl border border-dashed border-line bg-surface-container-low/50 px-4 py-8 text-center">
    <span class="material-symbols-outlined text-[26px] text-on-surface-variant/60" aria-hidden="true">reviews</span>
    <p class="mt-1 text-[14px] font-semibold text-on-surface">لا توجد تقييمات بعد</p>
    <p class="max-w-[42ch] text-[12px] text-on-surface-variant">التقييمات تُنشر فقط بعد زيارة مكتملة، وتظهر هنا مباشرة.</p>
  </div>`;

  const reviewCard = (r: DoctorReview) => `<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-space-sm">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md bg-primary/20 text-primary">${escapeHtml(initials(maskName(r.patient_name)))}</div>
        <div class="flex flex-col">
          <span class="font-label-md text-label-md font-semibold text-on-surface">${escapeHtml(maskName(r.patient_name))}</span>
          <span class="font-body-sm text-body-sm text-secondary">زيارة موثّقة · ${escapeHtml(formatArabicDate(r.created_at.slice(0, 10)))}</span>
        </div>
      </div>
      ${starsHtml(r.rating)}
    </div>
    ${r.comment ? `<p class="font-body-md text-body-md text-on-surface leading-relaxed mt-1">"${escapeHtml(r.comment)}"</p>` : ""}
  </div>`;

  const renderReviews = (list: DoctorReview[]) => {
    if (!reviewList) return;
    reviewList.innerHTML = list.length ? list.map(reviewCard).join("") : emptyReviewsHtml;
  };

  applyRating(profile.rating, profile.reviews_count);
  renderReviews(reviews);

  // Review form: only for a signed-in patient whose visit with this doctor is
  // completed and not reviewed yet. The RPC re-validates all of it server-side.
  const mountReviewForm = (appointmentId: string) => {
    if (!formSlot) return;
    formSlot.innerHTML = `<form id="dp-review-form" class="mt-space-md rounded-xl border border-line bg-surface-container-lowest p-space-md" novalidate>
      <div class="flex items-start gap-2">
        <span class="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">verified</span>
        <div>
          <p class="text-[15px] font-bold text-on-surface">قيّم زيارتك</p>
          <p class="mt-0.5 text-[12px] text-on-surface-variant">زيارتك مكتملة ومربوطة بموعدك. يظهر اسمك مختصراً مع كلمة «زيارة موثّقة».</p>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-1" id="dp-star-picker" role="group" aria-label="اختر تقييماً من نجمة إلى خمس نجوم">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" aria-pressed="false" aria-label="${n} من 5" data-star="${n}" class="press grid h-9 w-9 place-items-center rounded-lg text-outline transition-colors hover:bg-surface-container"><span class="material-symbols-outlined text-[24px]" aria-hidden="true">star</span></button>`).join("")}
      </div>
      <label class="sr-only" for="dp-review-comment">تعليقك (اختياري)</label>
      <textarea id="dp-review-comment" rows="3" maxlength="500" placeholder="اكتب عن تجربتك (اختياري)" class="mt-3 w-full rounded-xl border border-line bg-surface-container-lowest p-3 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"></textarea>
      <div class="mt-2 flex items-center justify-between gap-3">
        <span id="dp-review-chars" class="text-[11px] tabular-nums text-on-surface-variant">0/500</span>
        <button type="submit" id="dp-review-submit" class="press inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60" disabled>أضف التقييم</button>
      </div>
      <p id="dp-review-error" class="mt-2 hidden text-[12px] text-error" role="alert"></p>
    </form>`;

    const form = formSlot.querySelector<HTMLFormElement>("#dp-review-form");
    if (!form) return;
    const starButtons = Array.from(form.querySelectorAll<HTMLButtonElement>("[data-star]"));
    const submit = form.querySelector<HTMLButtonElement>("#dp-review-submit");
    const textarea = form.querySelector<HTMLTextAreaElement>("#dp-review-comment");
    const counter = form.querySelector<HTMLElement>("#dp-review-chars");
    const errorBox = form.querySelector<HTMLElement>("#dp-review-error");
    let rating = 0;

    const paintStars = () => {
      starButtons.forEach((b) => {
        const n = Number(b.dataset.star);
        const on = n <= rating;
        b.className = `press grid h-9 w-9 place-items-center rounded-lg transition-colors ${on ? "bg-surface-container text-warning" : "text-outline hover:bg-surface-container"}`;
        const iconEl = b.querySelector<HTMLElement>(".material-symbols-outlined");
        if (iconEl) iconEl.style.fontVariationSettings = `'FILL' ${on ? 1 : 0}`;
        b.setAttribute("aria-pressed", String(n === rating));
      });
      if (submit) submit.disabled = rating === 0;
    };

    starButtons.forEach((b) => b.addEventListener("click", () => {
      rating = Number(b.dataset.star);
      paintStars();
    }));

    textarea?.addEventListener("input", () => {
      if (counter) counter.textContent = `${textarea.value.length}/500`;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!rating || !submit) return;
      errorBox?.classList.add("hidden");
      submit.disabled = true;
      const idleLabel = submit.textContent;
      submit.textContent = "جارٍ الإرسال…";
      try {
        await submitDoctorReview({ appointmentId, rating, comment: textarea?.value || "" });
        showToast("شكراً! تم نشر تقييمك", "success");
        formSlot.innerHTML = `<p class="mt-space-md rounded-xl border border-line bg-surface-container-low px-space-md py-space-sm text-[13px] font-semibold text-tertiary">تم نشر تقييمك — شكراً لك.</p>`;
        try {
          const [fresh, updated] = await Promise.all([getDoctorReviews(doctor.id), getDoctorProfile(doctor.id)]);
          reviews = fresh;
          if (updated) applyRating(updated.rating, updated.reviews_count);
          renderReviews(reviews);
        } catch {
          // the review is saved; the list will refresh on the next visit
        }
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = translateAuthError(err);
          errorBox.classList.remove("hidden");
        }
        if (submit) {
          submit.disabled = false;
          submit.textContent = idleLabel || "أضف التقييم";
        }
      }
    });
  };

  void (async () => {
    try {
      const appointmentId = await getReviewableAppointmentId(doctor.id);
      if (appointmentId) mountReviewForm(appointmentId);
    } catch {
      // eligibility is a nice-to-have; the reviews above are already shown
    }
  })();

  /* ------------------------------ booking engine ----------------------------- */

  let windowStart = 0;
  let selectedDate = "";
  let selected: ProfileSlot | null = null;

  const dateRow = el("date-picker-row");
  const morningRow = el("morning-slots");
  const eveningRow = el("evening-slots");
  const summary = el("summary-datetime-display");
  const priceEl = el("cta-price-amount");
  const cta = el<HTMLButtonElement>("dp-cta");
  const ctaText = el("cta-button-text");

  if (priceEl) priceEl.textContent = fee.toLocaleString("en-US");

  function cellHtml(date: string): string {
    const count = freeOn(date).length;
    const weekday = formatWeekdayShort(date);
    const dayNum = formatDayNum(date);
    if (!count) {
      return `<div class="flex flex-col items-center rounded-lg bg-surface-container-low/60 px-1 py-2.5 text-center text-on-surface-variant">
        <span class="text-[12px]">${escapeHtml(weekday)}</span>
        <span class="mt-0.5 text-[16px] font-semibold">${escapeHtml(dayNum)}</span>
        <span class="mt-1 text-[11px]">مغلق</span>
      </div>`;
    }
    const active = date === selectedDate;
    return `<button class="date-cell flex flex-col items-center rounded-lg px-1 py-2.5 text-center transition-colors ${
 active ?"bg-primary text-on-primary " : "bg-surface-container-low hover:bg-surface-container"
    }" data-dp-date="${date}" type="button">
      <span class="text-[12px] ${active ?"opacity-90" : "text-on-surface-variant"}">${escapeHtml(weekday)}</span>
      <span class="mt-0.5 text-[16px] font-semibold ${active ?"" : "text-on-surface"}">${escapeHtml(dayNum)}</span>
      ${active
        ? `<span class="mt-1 rounded bg-on-primary/20 px-1.5 py-0.5 text-[11px] font-semibold">محدد</span>`
        : `<span class="mt-1 text-[11px] font-medium text-tertiary">${count} متاح</span>`}
    </button>`;
  }

  function renderDateStrip() {
    if (!dateRow) return;
    const first = localDateISO(windowStart);
    setText("dp-month-label", monthLabel(first));
    dateRow.className = "grid grid-cols-5 gap-2";
    dateRow.innerHTML = Array.from({ length: WINDOW_DAYS }, (_, i) => cellHtml(localDateISO(windowStart + i))).join("");
  }

  function slotHtml(s: ProfileSlot): string {
    if (s.is_booked) {
      return `<div class="rounded-lg bg-surface-container px-1 py-2 text-center text-[13px] text-on-surface-variant/70 line-through">${escapeHtml(formatTime(s.start_time))}</div>`;
    }
    const active = selected?.id === s.id;
    return `<button class="time-slot min-h-11 whitespace-nowrap rounded-lg px-1 py-2 text-center text-[13px] transition-colors ${
 active
 ?"flex items-center justify-center gap-1 bg-primary font-semibold text-on-primary"
        : "bg-surface-container-low text-on-surface hover:bg-surface-container"
    }" data-dp-slot="${s.id}" type="button">${active ? `<span class="material-symbols-outlined text-[14px]" aria-hidden="true">check</span>` : ""}<span>${escapeHtml(formatTime(s.start_time))}</span></button>`;
  }

  function renderSlots() {
    const day = selectedDate ? allOn(selectedDate) : [];
    const empty = `<div class="col-span-4 py-2 text-center text-[13px] text-on-surface-variant">لا توجد أوقات متاحة</div>`;
    const morning = day.filter((s) => minutesOf(s.start_time) < MORNING_CUTOFF_MIN);
    const evening = day.filter((s) => minutesOf(s.start_time) >= MORNING_CUTOFF_MIN);
    if (morningRow) morningRow.innerHTML = morning.length ? morning.map(slotHtml).join("") : empty;
    if (eveningRow) eveningRow.innerHTML = evening.length ? evening.map(slotHtml).join("") : empty;
  }

  function renderSummary() {
    if (!summary) return;
    if (!selected) {
      summary.textContent = "لم يتم تحديد موعد بعد";
      return;
    }
    summary.textContent = `${formatArabicDate(selected.available_date)} • ${formatTime(selected.start_time)} • زيارة العيادة`;
  }

  function selectFirstInWindow() {
    const day = Array.from({ length: WINDOW_DAYS }, (_, i) => localDateISO(windowStart + i)).find((d) => freeOn(d).length);
    selectedDate = day || "";
    selected = day ? freeOn(day)[0] || null : null;
  }


  dateRow?.addEventListener("click", (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-dp-date]");
    if (!cell) return;
    selectedDate = cell.dataset.dpDate || "";
    selected = freeOn(selectedDate)[0] || null;
    renderDateStrip();
    renderSlots();
    renderSummary();
  });

  const slotHost = morningRow?.parentElement?.parentElement;
  slotHost?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-dp-slot]");
    if (!btn) return;
    const id = btn.dataset.dpSlot;
    selected = slots.find((s) => s.id === id) || null;
    renderSlots();
    renderSummary();
  });

  el("dp-days-back")?.closest("button")?.addEventListener("click", () => {
    windowStart = Math.max(0, windowStart - WINDOW_DAYS);
    selectFirstInWindow(); renderDateStrip(); renderSlots(); renderSummary();
  });
  el("dp-days-fwd")?.closest("button")?.addEventListener("click", () => {
    windowStart = Math.min(LOOKAHEAD_DAYS - WINDOW_DAYS + 1, windowStart + WINDOW_DAYS);
    selectFirstInWindow(); renderDateStrip(); renderSlots(); renderSummary();
  });

  // insurance pre-check
  const insurers = profile.insurances;
  let insurerIdx = 0;
  const insurerRow = el("insurance-dropdown-area");
  const insurerName = el("dp-insurer-name");
  const insurerChange = el("dp-insurer-change");
  const insuranceToggle = el<HTMLInputElement>("insurance-toggle");
  function renderInsurer() {
    if (!insurers.length) {
      insurerRow?.classList.add("hidden");
      if (insuranceToggle) {
        insuranceToggle.checked = false;
        insuranceToggle.disabled = true;
        insuranceToggle.removeAttribute("onchange");
        insurerRow?.classList.remove("flex");
      }
      return;
    }
    if (insurerName) insurerName.textContent = insurers[insurerIdx];
    if (insurerChange && insurers.length < 2) insurerChange.classList.add("hidden");
  }
  insurerChange?.addEventListener("click", () => {
    if (insurers.length < 2) return;
    insurerIdx = (insurerIdx + 1) % insurers.length;
    renderInsurer();
  });

  // real booking
  function openAuthModal() {
    appEl.querySelector<HTMLElement>('[data-action="open-auth"]')?.click();
  }

  function setCtaLoading(loading: boolean) {
    if (!cta) return;
    cta.disabled = loading;
    cta.classList.toggle("opacity-60", loading);
    if (ctaText) ctaText.textContent = loading ? "جارٍ تأكيد الحجز…" : rescheduling ? "تأكيد الموعد الجديد" : "تأكيد الحجز";
  }

  function showSuccess(ref: string, message = "تم تأكيد الحجز") {
    const block = cta?.closest<HTMLElement>(".mt-space-lg");
    if (!block?.parentElement) return;
    block.parentElement.querySelector("#dp-booking-ok")?.remove();
    const ok = document.createElement("div");
    ok.id = "dp-booking-ok";
    ok.className = "mt-space-md p-space-sm rounded-xl bg-tertiary-fixed/40 flex items-center gap-space-xs font-label-md text-label-md text-on-surface";
    ok.innerHTML = `<span class="material-symbols-outlined text-tertiary">check_circle</span>
      <span class="flex-1">${escapeHtml(message)} — رمز الحجز <span class="font-bold tabular-nums">${escapeHtml(ref)}</span></span>
      <a href="#appointments" class="text-primary font-bold hover:underline shrink-0">عرض مواعيدي</a>`;
    block.parentElement.insertBefore(ok, block);
  }

  cta?.addEventListener("click", async () => {
    if (!selected) { showToast("اختر يوماً ووقتاً متاحاً أولاً", "warning"); return; }
    if (!user) { showToast("سجّل الدخول لإتمام الحجز", "warning"); openAuthModal(); return; }
    const patientName = String(user.profile?.full_name || "").trim();
    const patientPhone = String(user.profile?.phone || "").trim();
    if (!patientName || !patientPhone) {
      showToast("أكمل اسمك ورقم جوالك من صفحة الحساب أولاً", "warning");
      location.hash = "#profile";
      return;
    }
    const isReschedule = !!rescheduling;
    const confirmed = await confirmSheet({
      title: isReschedule ? "تأكيد إعادة الجدولة" : "تأكيد حجز الموعد",
      body: `${profile?.name} — ${formatArabicDate(selected.available_date)} في ${formatTime(selected.start_time)} (زيارة العيادة) • ${fee.toLocaleString("en-US")} ج.س${isReschedule ? ` • الموعد الحالي ${rescheduling?.ref} سيُستبدل` : ""}`,
      confirmLabel: isReschedule ? "تأكيد الموعد الجديد" : "تأكيد الحجز",
      cancelLabel: "تراجع",
      tone: "primary",
      iconName: "event_available",
    });
    if (!confirmed) return;
    setCtaLoading(true);
    try {
      if (isReschedule && rescheduling) {
        await rescheduleAppointmentRPC({ appointmentId: rescheduling.id, newScheduleId: selected.id });
        showToast("تمت إعادة جدولة موعدك", "success");
        showSuccess(rescheduling.ref, "تم تعديل موعدك");
        clearRescheduleIntent();
        rescheduling = null;
        document.getElementById("dp-reschedule-banner")?.remove();
      } else {
        const appointment = (await bookAppointmentRPC({ scheduleId: selected.id, patientName, patientPhone })) as
          | { appointment_id?: string; id?: string }
          | null;
        const ref = shortRef(appointment?.appointment_id || appointment?.id || selected.id);
        showToast(`تم تأكيد حجزك بنجاح — رمز ${ref}`, "success");
        showSuccess(ref);
      }
      slots = await getDoctorProfileSlots(doctorId, localDateISO(0), localDateISO(LOOKAHEAD_DAYS));
      selectFirstInWindow();
      renderDateStrip();
      renderSlots();
      renderSummary();
    } catch (e) {
      showToast(translateAuthError(e), "error");
    } finally {
      setCtaLoading(false);
    }
  });

  if (rescheduling && ctaText) ctaText.textContent = "تأكيد الموعد الجديد";
  renderInsurer();
  selectFirstInWindow();
  renderDateStrip();
  renderSlots();
  renderSummary();

  if (cta) {
    cta.disabled = !firstFree;
    cta.classList.toggle("opacity-60", !firstFree);
  }
  if (!firstFree && ctaText) ctaText.textContent = "لا تتوفر مواعيد";
}
