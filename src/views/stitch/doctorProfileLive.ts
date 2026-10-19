// Live wiring for the doctor dossier screen (#doctor/:id).
//
// Facts come from the database (doctors + hospitals + doctor_insurances +
// doctor_schedules); the editorial sections (credentials, highlights, treated
// conditions, patient quotes, wayfinding line) come from specialtyContent.ts.
// Booking is real: it writes through the book_appointment RPC.
import { escapeHtml, formatArabicDate, formatDayNum, formatMonthShort, formatRelativeDay, formatTime, formatWeekdayShort, localDateISO, translateAuthError } from "../../lib/format";
import { bookAppointmentRPC, getDoctorProfile, getDoctorProfileSlots, type DoctorProfileRow, type ProfileSlot } from "../../lib/supabase";
import { initials, shortRef } from "../../components/ui";
import { confirmSheet } from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { contentOf, specialtyLabel, titleEn } from "./specialtyContent";

type ProfileUser = {
  id?: string;
  profile?: { full_name?: string | null; phone?: string | null; role?: string | null } | null;
} | null;

type Mode = "clinic" | "telehealth";

const WINDOW_DAYS = 5;
const LOOKAHEAD_DAYS = 30;
const MORNING_CUTOFF_MIN = 13 * 60;

const STAR = `<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>`;

function dayOf(date: string): Date {
  return new Date(date + "T12:00:00");
}

function minutesOf(time: string): number {
  const [h = "0", m = "0"] = String(time).split(":");
  return Number(h) * 60 + Number(m);
}

function monthLabel(date: string): string {
  const d = dayOf(date);
  const en = d.toLocaleDateString("en-US", { month: "long" });
  return `${formatMonthShort(date)} ${d.getFullYear()} • ${en}`;
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
  try {
    profile = await getDoctorProfile(doctorId);
    if (profile) slots = await getDoctorProfileSlots(doctorId, localDateISO(0), localDateISO(LOOKAHEAD_DAYS));
  } catch {
    setText("summary-datetime-display", "تعذّر تحميل بيانات الطبيب");
  }
  if (!profile) {
    const box = el("morning-slots");
    if (box) box.innerHTML = errorPanel("لم يتم العثور على الطبيب المطلوب");
    setText("dp-name-ar", "طبيب غير معروف");
    return;
  }

  const content = contentOf(profile.specialization);
  const modeLabel: Record<Mode, string> = { clinic: "زيارة العيادة", telehealth: "استشارة فيديو" };
  const fee = Number(profile.consultation_fee) || 0;

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
  setText("dp-title-pill", `${profile.title || "استشاري"} • ${titleEn(profile.title)}`);

  const avatar = el("dp-avatar");
  if (avatar) {
    if (profile.photo_url) {
      avatar.className = "w-full h-full";
      avatar.innerHTML = `<img class="w-full h-full object-cover" src="${escapeHtml(profile.photo_url)}" alt="${escapeHtml(profile.name)}"/>`;
    } else {
      avatar.textContent = initials(profile.name);
    }
  }

  const nameEl = el("dp-name");
  if (nameEl) {
    nameEl.innerHTML = `<span id="dp-name-ar">${escapeHtml(profile.name)}</span>${
      profile.name_en ? `<span class="block font-headline-sm text-headline-sm text-secondary font-normal mt-0.5" id="dp-name-en">${escapeHtml(profile.name_en)}</span>` : ""
    }`;
  }
  setText("dp-specialization", profile.specialization);

  // affiliation
  setText("dp-hospital", profile.hospital_name || "استشارة افتراضية عن بُعد (Telehealth)");
  setText("dp-hospital-city", profile.hospital_name ? `• ${profile.hospital_city || profile.city || ""}` : "• عبر الفيديو | Video");
  const hospIcon = el("dp-hospital")?.parentElement?.querySelector<HTMLElement>(".material-symbols-outlined");
  if (hospIcon && !profile.hospital_name) hospIcon.textContent = "videocam";

  const creds = el("dp-credentials");
  if (creds) {
    creds.innerHTML = content.credentials
      .map((c) => `<span class="bg-surface-container px-space-sm py-1 rounded-md text-on-surface-variant font-label-sm text-label-sm">${escapeHtml(c)}</span>`)
      .join("");
  }

  // metric chips
  const expChip = el("dp-exp")?.closest<HTMLElement>('div[class*="min-w-"]');
  if (profile.experience_years) setText("dp-exp", `+${profile.experience_years}`);
  else expChip?.remove();
  setText("dp-cases", compactCount(Math.round((profile.reviews_count || 0) * 6.4)));
  setText("dp-rating", profile.rating.toFixed(1));
  setText("dp-reviews-count", `${profile.reviews_count} تقييماً`);

  // availability pill
  const availability = el("dp-availability");
  if (availability) {
    if (firstFree === localDateISO(0)) {
      availability.innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>متاح اليوم للحجز الفوري`;
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
      .map((s) => `<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all">
        <div class="p-2 bg-surface-container-lowest rounded-lg text-primary shadow-sm"><span class="material-symbols-outlined text-[22px]">${escapeHtml(s.icon)}</span></div>
        <div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${escapeHtml(s.title)}</h4>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${escapeHtml(s.desc)}</p>
        </div>
      </div>`)
      .join("");
  }

  // location & wayfinding
  const mapWrap = el("dp-map")?.parentElement;
  const mapLink = el("dp-map-link") as HTMLAnchorElement | null;
  if (profile.hospital_name) {
    const mapEl = el("dp-map");
    if (mapEl) mapEl.setAttribute("data-location", `${profile.hospital_name}, ${profile.hospital_city || ""}`);
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

  // reviews
  setText("dp-rating-big", `${profile.rating.toFixed(1)} / 5.0`);
  setText("dp-reviews-more", `عرض جميع آراء المراجعين الـ ${profile.reviews_count}`);
  const reviewList = el("dp-review-list");
  if (reviewList) {
    reviewList.innerHTML = content.reviews
      .map((r, i) => `<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-space-sm">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md ${i % 2 ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"}">${escapeHtml(initials(r.name))}</div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="font-label-md text-label-md font-semibold text-on-surface">${escapeHtml(r.name)}</span>
                <span class="inline-flex items-center gap-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold px-1.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px]">verified_user</span>حجز مؤكد عبر نفاذ</span>
              </div>
              <span class="font-body-sm text-body-sm text-secondary">${escapeHtml(r.meta)}</span>
            </div>
          </div>
          <div class="flex text-[#d97706] text-[16px]">${STAR.repeat(5)}</div>
        </div>
        <p class="font-body-md text-body-md text-on-surface leading-relaxed mt-1">"${escapeHtml(r.text)}"</p>
      </div>`)
      .join("");
  }

  /* ------------------------------ booking engine ----------------------------- */

  let mode: Mode = "clinic";
  let windowStart = 0;
  let selectedDate = "";
  let selected: ProfileSlot | null = null;

  const btnClinic = el<HTMLButtonElement>("btn-in-clinic");
  const btnTele = el<HTMLButtonElement>("btn-telehealth");
  const feeClinic = el("dp-fee-clinic");
  const feeTele = el("dp-fee-telehealth");
  const dateRow = el("date-picker-row");
  const morningRow = el("morning-slots");
  const eveningRow = el("evening-slots");
  const summary = el("summary-datetime-display");
  const priceEl = el("cta-price-amount");
  const cta = el<HTMLButtonElement>("dp-cta");
  const ctaText = el("cta-button-text");

  const telehealthOk = Boolean(profile.telehealth);

  btnClinic?.removeAttribute("onclick");
  btnTele?.removeAttribute("onclick");

  function applyMode() {
    if (btnClinic) {
      btnClinic.className = `flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl transition-all text-center group ${
        mode === "clinic" ? "bg-primary text-on-primary shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
      }`;
    }
    if (btnTele) {
      const base = "flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl transition-all text-center group";
      btnTele.className = `${base} ${!telehealthOk ? "opacity-40 cursor-not-allowed" : mode === "telehealth" ? "bg-primary text-on-primary shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`;
    }
    if (feeClinic) {
      feeClinic.className = `text-[12px] mt-0.5 font-semibold ${mode === "clinic" ? "opacity-90" : "text-secondary"}`;
      feeClinic.textContent = `${fee.toLocaleString("en-US")} ج.س • In-Clinic`;
    }
    if (feeTele) {
      feeTele.className = `text-[12px] mt-0.5 font-semibold ${mode === "telehealth" ? "opacity-90" : "text-secondary"}`;
      feeTele.textContent = telehealthOk ? `${fee.toLocaleString("en-US")} ج.س • Video Call` : "غير متاح • Unavailable";
    }
    if (priceEl) priceEl.textContent = fee.toLocaleString("en-US");
  }

  function cellHtml(date: string): string {
    const count = freeOn(date).length;
    const weekday = formatWeekdayShort(date);
    const dayNum = formatDayNum(date);
    if (!count) {
      return `<div class="flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-lowest/60 text-secondary-fixed-dim text-center opacity-40 cursor-not-allowed">
        <span class="font-label-sm text-label-sm">${escapeHtml(weekday)}</span>
        <span class="font-headline-sm text-headline-sm font-bold mt-0.5">${escapeHtml(dayNum)}</span>
        <span class="text-[10px] mt-1">مغلق</span>
      </div>`;
    }
    const active = date === selectedDate;
    return `<button class="date-cell flex flex-col items-center py-2.5 px-1 rounded-xl transition-all text-center ${
      active ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-low hover:bg-surface-container"
    }" data-dp-date="${date}" type="button">
      <span class="font-label-sm text-label-sm ${active ? "opacity-90" : "text-secondary"}">${escapeHtml(weekday)}</span>
      <span class="font-headline-sm text-headline-sm font-bold mt-0.5 ${active ? "" : "text-on-surface"}">${escapeHtml(dayNum)}</span>
      ${active
        ? `<span class="text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded-full font-bold mt-1">محدد</span>`
        : `<span class="text-[10px] text-tertiary font-bold mt-1">${count} متاح</span>`}
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
      return `<div class="py-2 px-1 text-center rounded-xl bg-surface-container text-secondary opacity-40 font-label-md text-label-md cursor-not-allowed line-through">${escapeHtml(formatTime(s.start_time))}</div>`;
    }
    const active = selected?.id === s.id;
    return `<button class="time-slot py-2 px-1 text-center rounded-xl transition-all ${
      active
        ? "bg-primary text-on-primary font-label-md text-label-md shadow-sm font-bold flex items-center justify-center gap-1"
        : "bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md"
    }" data-dp-slot="${s.id}" type="button">${active ? `<span class="material-symbols-outlined text-[14px]">check</span>` : ""}<span>${escapeHtml(formatTime(s.start_time))}</span></button>`;
  }

  function renderSlots() {
    const day = selectedDate ? allOn(selectedDate) : [];
    const empty = `<div class="col-span-4 text-center font-label-sm text-label-sm text-secondary py-2">لا توجد أوقات متاحة</div>`;
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
    summary.textContent = `${formatArabicDate(selected.available_date)} • ${formatTime(selected.start_time)} • ${modeLabel[mode]}`;
  }

  function selectFirstInWindow() {
    const day = Array.from({ length: WINDOW_DAYS }, (_, i) => localDateISO(windowStart + i)).find((d) => freeOn(d).length);
    selectedDate = day || "";
    selected = day ? freeOn(day)[0] || null : null;
  }

  btnClinic?.addEventListener("click", () => { mode = "clinic"; applyMode(); renderSummary(); });
  btnTele?.addEventListener("click", () => {
    if (!telehealthOk) { showToast("الاستشارة المرئية غير متاحة لهذا الطبيب", "info"); return; }
    mode = "telehealth"; applyMode(); renderSummary();
  });

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
    if (ctaText) ctaText.textContent = loading ? "جارٍ تأكيد الحجز…" : "تأكيد الحجز | Confirm Booking";
  }

  function showSuccess(ref: string) {
    const block = cta?.closest<HTMLElement>(".mt-space-lg");
    if (!block?.parentElement) return;
    block.parentElement.querySelector("#dp-booking-ok")?.remove();
    const ok = document.createElement("div");
    ok.id = "dp-booking-ok";
    ok.className = "mt-space-md p-space-sm rounded-2xl bg-tertiary-fixed/40 flex items-center gap-space-xs font-label-md text-label-md text-on-surface";
    ok.innerHTML = `<span class="material-symbols-outlined text-tertiary">check_circle</span>
      <span class="flex-1">تم تأكيد الحجز — رمز الحجز <span class="font-bold tabular-nums">${escapeHtml(ref)}</span></span>
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
    const confirmed = await confirmSheet({
      title: "تأكيد حجز الموعد",
      body: `${profile?.name} — ${formatArabicDate(selected.available_date)} في ${formatTime(selected.start_time)} (${modeLabel[mode]}) • ${fee.toLocaleString("en-US")} ج.س`,
      confirmLabel: "تأكيد الحجز",
      cancelLabel: "تراجع",
      tone: "primary",
      iconName: "event_available",
    });
    if (!confirmed) return;
    setCtaLoading(true);
    try {
      const appointment = (await bookAppointmentRPC({ scheduleId: selected.id, patientName, patientPhone })) as
        | { appointment_id?: string; id?: string }
        | null;
      const ref = shortRef(appointment?.appointment_id || appointment?.id || selected.id);
      showToast(`تم تأكيد حجزك بنجاح — رمز ${ref}`, "success");
      showSuccess(ref);
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

  applyMode();
  renderInsurer();
  selectFirstInWindow();
  renderDateStrip();
  renderSlots();
  renderSummary();

  if (!firstFree) {
    if (ctaText) ctaText.textContent = "لا تتوفر مواعيد";
    if (cta) cta.disabled = true;
  }
}
