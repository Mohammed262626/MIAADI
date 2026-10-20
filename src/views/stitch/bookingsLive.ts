// Live wiring for the appointments portal (#appointments).
//
// Everything on the Smart Pass, the "other upcoming visits" list, the past
// visits grid, the cancelled list and the right-hand side widgets is derived
// from the signed-in patient's appointments. Cancelling writes through the
// cancel_appointment RPC; rescheduling hands off to the doctor dossier where a
// new slot can be picked.
import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO, translateAuthError } from "../../lib/format";
import { cancelAppointmentRPC, getPatientAppointments } from "../../lib/supabase";
import { initials, money, statusMeta } from "../../components/ui";
import { qrSvg } from "../../components/qr";
import { setRescheduleIntent } from "../../lib/reschedule";
import { confirmSheet } from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { contentOf, specialtyLabel } from "./specialtyContent";

type BookingsUser = { id?: string; profile?: { full_name?: string | null; role?: string | null } | null } | null;

type Visit = {
  id: string;
  status: string;
  date: string;
  time: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  fee: number;
};

const OPEN_STATUSES = new Set(["booked", "confirmed", "pending"]);
const CANCELLED_STATUSES = new Set(["cancelled_by_patient", "cancelled_by_clinic", "no_show"]);

function bookingRef(id: string): string {
  const h = String(id || "").replace(/-/g, "").toUpperCase();
  return `MIA-${h.slice(0, 4)}-${h.slice(4, 8)}`;
}

function mapsUrl(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function emptyCard(o: { icon: string; title: string; body: string; actionHtml?: string }): string {
  return `<div class="bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm flex flex-col items-center text-center gap-space-sm">
    <span class="w-16 h-16 rounded-3xl bg-primary/10 text-primary grid place-items-center"><span class="material-symbols-outlined text-[32px]">${escapeHtml(o.icon)}</span></span>
    <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(o.title)}</h3>
    <p class="font-body-md text-body-md text-on-surface-variant max-w-[46ch] leading-relaxed">${escapeHtml(o.body)}</p>
    ${o.actionHtml || ""}
  </div>`;
}

function visitDateLine(v: Visit): string {
  const rel = formatRelativeDay(v.date);
  return `${rel === "اليوم" || rel === "غداً" ? rel + "، " : ""}${formatArabicDate(v.date)}`;
}

function loadingSkeletonHtml(): string {
  const bar = "rounded-full bg-surface-container-high";
  return `<div class="w-full flex flex-col xl:flex-row gap-space-xl animate-pulse" aria-hidden="true">
    <div class="xl:w-2/3 w-full">
      <div class="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden">
        <div class="h-16 bg-surface-container-high"></div>
        <div class="p-space-xl flex flex-col gap-space-lg">
          <div class="flex items-center gap-space-md">
            <div class="w-20 h-20 rounded-2xl bg-surface-container-high shrink-0"></div>
            <div class="flex flex-col gap-2 flex-1">
              <div class="h-4 w-2/5 ${bar}"></div>
              <div class="h-3 w-3/5 rounded-full bg-surface-container"></div>
              <div class="h-3 w-2/5 rounded-full bg-surface-container"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div class="h-20 rounded-2xl bg-surface-container-low"></div>
            <div class="h-20 rounded-2xl bg-surface-container-low"></div>
          </div>
          <div class="h-14 rounded-2xl bg-surface-container"></div>
        </div>
      </div>
      <div class="mt-space-xl bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm">
        <div class="h-4 w-1/3 ${bar} mb-space-md"></div>
        <div class="h-20 rounded-2xl bg-surface-container-low"></div>
      </div>
    </div>
    <div class="xl:w-1/3 w-full flex flex-col gap-space-lg">
      <div class="h-56 rounded-3xl bg-surface-container-high"></div>
      <div class="h-40 rounded-3xl bg-surface-container-low"></div>
    </div>
  </div>
  <span class="sr-only">جارٍ تحميل مواعيدك…</span>`;
}

export async function wireBookings(appEl: HTMLElement, user: BookingsUser): Promise<void> {
  const el = <T extends HTMLElement = HTMLElement>(id: string): T | null => appEl.querySelector<T>(`#${id}`);
  const setText = (id: string, text: string) => { const n = el(id); if (n) n.textContent = text; };

  let upcoming: Visit[] = [];
  let past: Visit[] = [];
  let cancelled: Visit[] = [];
  let primary: Visit | null = null;
  let selectedId: string | null = null;

  function switchTab(key: string): void {
    ["upcoming", "past", "cancelled"].forEach((k) => {
      const btn = el(`tab-${k}`);
      const view = el(`view-${k}`);
      const active = k === key;
      if (btn) {
        btn.classList.toggle("bg-surface-container-lowest", active);
        btn.classList.toggle("text-primary", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("text-secondary", !active);
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", String(active));
      }
      if (view) {
        view.classList.toggle("hidden", !active);
        if (k !== "upcoming") view.classList.toggle("flex", active);
      }
    });
  }
  appEl.querySelectorAll<HTMLElement>("[data-bk-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.bkTab || "upcoming"));
  });

  async function fetchVisits(): Promise<void> {
    let rows: unknown[] = [];
    try {
      rows = (await getPatientAppointments()) as unknown[];
    } catch {
      showToast("تعذّر تحميل مواعيدك، حاول مرة أخرى", "error");
    }
    const today = localDateISO(0);
    const all: Visit[] = rows.map((raw) => {
      const r = raw as {
        id: string;
        status: string;
        doctor_schedules?: {
          available_date?: string;
          start_time?: string;
          end_time?: string;
          doctors?: { id?: string; name?: string; specialization?: string; consultation_fee?: number | null; hospitals?: { name?: string } | null } | null;
        } | null;
      };
      const sched = r.doctor_schedules || {};
      const doc = sched.doctors || {};
      return {
        id: r.id,
        status: r.status,
        date: sched.available_date || "",
        time: (sched.start_time || "").slice(0, 5),
        endTime: (sched.end_time || "").slice(0, 5),
        doctorId: doc.id || "",
        doctorName: doc.name || "طبيب",
        specialization: doc.specialization || "",
        hospital: doc.hospitals?.name || "",
        fee: Number(doc.consultation_fee) || 0,
      };
    }).filter((v) => v.date);

    const byDateTime = (a: Visit, b: Visit) => (a.date + a.time).localeCompare(b.date + b.time);
    upcoming = all.filter((v) => OPEN_STATUSES.has(v.status) && v.date >= today).sort(byDateTime);
    past = all.filter((v) => v.status === "completed").sort((a, b) => byDateTime(b, a));
    cancelled = all.filter((v) => CANCELLED_STATUSES.has(v.status)).sort((a, b) => byDateTime(b, a));
    primary = (selectedId && upcoming.find((v) => v.id === selectedId)) || upcoming[0] || null;
    if (!primary) selectedId = null;
  }

  function renderTabs(): void {
    setText("bk-count-upcoming", String(upcoming.length));
    setText("bk-count-past", String(past.length));
    setText("bk-count-cancelled", String(cancelled.length));

    const badge = el("bk-file-no");
    if (badge) {
      if (!user?.id) badge.textContent = "زائر غير مسجّل";
      else badge.textContent = `ملف المريض #${user.id.replace(/-/g, "").slice(-4).toUpperCase()}`;
    }
  }

  function renderPrimary(): void {
    const pass = el("bk-pass");
    const navCard = el("bk-nav")?.closest<HTMLElement>(".rounded-2xl") || null;
    const empty = el("bk-empty");
    const mainCol = el("bk-col-main");

    if (!primary) {
      empty?.classList.remove("hidden");
      mainCol?.classList.add("hidden");
      if (empty) {
        empty.innerHTML = user
          ? emptyCard({
              icon: "event_available",
              title: "لا توجد مواعيد قادمة",
              body: "ليس لديك أي موعد مؤكد حالياً. تصفّح الأطباء المتاحين واختر الوقت الأنسب لك.",
              actionHtml: `<a href="#doctors" class="mt-space-xs h-11 px-space-lg rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold grid place-items-center">تصفح الأطباء</a>`,
            })
          : emptyCard({
              icon: "lock",
              title: "سجّل الدخول لعرض مواعيدك",
              body: "تحتاج إلى تسجيل الدخول لعرض تذاكر مواعيدك وزياراتك السابقة ووصفاتك الطبية.",
              actionHtml: `<button type="button" data-bk-auth class="mt-space-xs h-11 px-space-lg rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold">تسجيل الدخول</button>`,
            });
        empty.querySelector("[data-bk-auth]")?.addEventListener("click", () => appEl.querySelector<HTMLElement>('[data-action="open-auth"]')?.click());
      }
      return;
    }

    empty?.classList.add("hidden");
    mainCol?.classList.remove("hidden");
    pass?.classList.remove("hidden");

    setText("bk-pass-ref", `رمز الحجز: ${bookingRef(primary.id)}`);
    setText("bk-pass-doctor", primary.doctorName);
    setText("bk-pass-specialty", primary.specialization || specialtyLabel(primary.specialization));
    setText("bk-pass-hospital", primary.hospital || "—");

    const avatar = el("bk-pass-avatar");
    if (avatar) avatar.textContent = initials(primary.doctorName);

    setText("bk-pass-date", visitDateLine(primary));
    setText("bk-pass-time", formatTime(primary.time));
    setText("bk-pass-window", "(الحضور قبل الموعد بـ 15 دقيقة)");
    setText("bk-pass-building", primary.hospital || "الاستشارة الافتراضية (فيديو)");
    const clinic = contentOf(primary.specialization).clinic;
    setText("bk-pass-room", primary.hospital ? clinic.name : "يُرسل رابط الجلسة على جوالك قبل الموعد");

    const hex = primary.id.replace(/-/g, "").toUpperCase();
    setText("bk-pass-token", `TOKEN: ${hex.slice(0, 4)}-${hex.slice(4, 8)}-MIAADI`);
    const qr = el("bk-pass-qr");
    if (qr) qr.innerHTML = qrSvg(bookingRef(primary.id));
    setText("bk-pass-paid", `رسوم الاستشارة: ${money(primary.fee)} — الدفع عند الحضور`);

    setText("bk-pass-address", primary.hospital || "—");
    navCard?.classList.toggle("hidden", !primary.hospital);

    renderSecondary();
  }

  function renderSecondary(): void {
    const rest = upcoming.filter((v) => v.id !== primary?.id);
    const card = el("bk-secondary-card");
    const note = el("bk-secondary-note");
    if (!card) return;
    if (!rest.length) {
      note?.closest<HTMLElement>("div")?.classList.add("hidden");
      card.classList.add("hidden");
      return;
    }
    note?.closest<HTMLElement>("div")?.classList.remove("hidden");
    card.classList.remove("hidden");
    if (note) note.textContent = `${rest.length} موعد قادم`;
    card.className = "flex flex-col gap-space-md";
    card.innerHTML = rest
      .map((v) => `<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div class="flex items-start gap-space-md">
            <span class="w-16 h-16 rounded-xl shrink-0 grid place-items-center bg-primary text-on-primary font-extrabold text-xl">${escapeHtml(initials(v.doctorName))}</span>
            <div class="flex flex-col">
              <div class="flex items-center gap-space-xs flex-wrap">
                <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(v.doctorName)}</span>
                <span class="bg-secondary-container/40 text-on-secondary-container text-[11px] px-2 py-0.5 rounded-md font-semibold">${escapeHtml(specialtyLabel(v.specialization))}</span>
              </div>
              <div class="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm mt-1">
                <span class="material-symbols-outlined text-[16px]">location_on</span>
                <span>${escapeHtml(v.hospital || "زيارة عيادة")}</span>
              </div>
              <div class="flex items-center gap-space-md text-on-surface font-label-md text-label-md mt-2 flex-wrap">
                <span class="flex items-center gap-1 text-primary"><span class="material-symbols-outlined text-[16px]">calendar_month</span>${escapeHtml(formatArabicDate(v.date))}</span>
                <span class="flex items-center gap-1 text-secondary"><span class="material-symbols-outlined text-[16px]">schedule</span>${escapeHtml(formatTime(v.time))}</span>
                <span class="font-mono text-outline text-[12px]">${escapeHtml(bookingRef(v.id))}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-space-sm self-end md:self-center flex-shrink-0">
            <button type="button" data-pass-id="${escapeHtml(v.id)}" class="px-space-md py-space-xs bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md rounded-full transition-all shadow-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">confirmation_number</span>
              <span>عرض التذكرة</span>
            </button>
            <button type="button" data-resched-id="${escapeHtml(v.id)}" data-resched-doc="${escapeHtml(v.doctorId)}" class="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" title="إعادة جدولة هذا الموعد">
              <span class="material-symbols-outlined text-[18px]">edit_calendar</span>
            </button>
          </div>
        </div>
      </div>`)
      .join("");
    card.querySelectorAll<HTMLElement>("[data-pass-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedId = btn.dataset.passId || null;
        primary = upcoming.find((v) => v.id === selectedId) || upcoming[0] || null;
        renderPrimary();
        el("bk-pass")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    card.querySelectorAll<HTMLElement>("[data-resched-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const visit = upcoming.find((v) => v.id === btn.dataset.reschedId);
        if (visit) startReschedule(visit);
      });
    });
  }

  function renderPast(): void {
    const list = el("bk-past-list");
    if (!list) return;
    if (!past.length) {
      list.className = "block";
      list.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant text-center py-space-lg">لا توجد زيارات مكتملة في سجلك حتى الآن.</p>`;
      return;
    }
    list.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md";
    list.innerHTML = past
      .map((v) => `<div class="bg-surface-container-low p-space-lg rounded-2xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-space-xs">
            <span>${escapeHtml(formatArabicDate(v.date))}</span>
            <span class="text-tertiary font-bold">مكتمل</span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHtml(v.doctorName)}</h4>
          <p class="font-body-sm text-body-sm text-secondary mt-1">${escapeHtml(specialtyLabel(v.specialization))}</p>
          <p class="font-body-sm text-body-sm text-outline mt-space-sm">${escapeHtml(v.hospital || "زيارة عيادة")}</p>
          <p class="font-body-sm text-body-sm text-outline">${escapeHtml(formatTime(v.time))}</p>
        </div>
        <div class="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
          <span class="text-primary font-label-sm text-label-sm font-bold">${escapeHtml(bookingRef(v.id))}</span>
          <a href="#doctor/${escapeHtml(v.doctorId)}" class="text-secondary font-label-sm text-label-sm hover:underline">حجز مراجعة</a>
        </div>
      </div>`)
      .join("");
  }

  function renderCancelled(): void {
    const list = el("bk-cancelled-list");
    if (!list) return;
    if (!cancelled.length) {
      list.className = "block";
      list.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant text-center py-space-md">لا توجد مواعيد ملغاة.</p>`;
      return;
    }
    list.className = "flex flex-col gap-space-md";
    list.innerHTML = cancelled
      .map((v) => {
        const reason = v.status === "cancelled_by_clinic" ? "ألغي من العيادة" : v.status === "no_show" ? "لم يتم الحضور" : "ألغي بناءً على طلب المريض";
        return `<div class="bg-surface-container-low p-space-lg rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[24px]">${v.status === "no_show" ? "person_off" : "event_busy"}</span>
            </div>
            <div>
              <span class="font-label-sm text-label-sm text-error font-bold">${escapeHtml(reason)} • ${escapeHtml(statusMeta(v.status).label)}</span>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">${escapeHtml(v.doctorName)} • ${escapeHtml(specialtyLabel(v.specialization))}</h4>
              <p class="font-body-sm text-body-sm text-secondary">${escapeHtml(v.hospital || "زيارة عيادة")}</p>
              <p class="font-body-sm text-body-sm text-secondary">كان الموعد: ${escapeHtml(formatArabicDate(v.date))} • ${escapeHtml(formatTime(v.time))}</p>
            </div>
          </div>
          <a href="#doctor/${escapeHtml(v.doctorId)}" class="px-space-md py-space-xs bg-primary text-on-primary font-label-md text-label-md rounded-full shadow-sm self-start md:self-auto">إعادة الحجز الآن</a>
        </div>`;
      })
      .join("");
  }

  async function load(): Promise<void> {
    const empty = el("bk-empty");
    el("bk-col-main")?.classList.add("hidden");
    el("bk-col-side")?.classList.add("hidden");
    if (empty) {
      empty.classList.remove("hidden");
      empty.innerHTML = loadingSkeletonHtml();
    }
    await fetchVisits();
    renderTabs();
    renderPrimary();
    renderPast();
    renderCancelled();
  }

  /* --------------------------------- actions -------------------------------- */

  function bindOnce(node: HTMLElement | null, key: string, handler: () => void): void {
    if (!node || node.dataset.bkBound === key) return;
    node.dataset.bkBound = key;
    node.addEventListener("click", handler);
  }

  bindOnce(el("bk-share"), "share", () => {
    if (!primary) { showToast("لا يوجد موعد لمشاركته", "info"); return; }
    const text = `تذكرة ميعادي — ${primary.doctorName} • ${formatArabicDate(primary.date)} ${formatTime(primary.time)} • ${bookingRef(primary.id)}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) void nav.share({ title: "تذكرة موعد ميعادي الذكية", text, url: location.href }).catch(() => {});
    else { void navigator.clipboard?.writeText(`${text}\n${location.href}`); showToast("تم نسخ تفاصيل التذكرة إلى الحافظة", "success"); }
  });

  bindOnce(el("bk-calendar"), "calendar", () => {
    if (!primary) { showToast("لا يوجد موعد لإضافته", "info"); return; }
    const start = new Date(`${primary.date}T${primary.time || "09:00"}:00`);
    const end = new Date(`${primary.date}T${primary.endTime || primary.time || "09:30"}:00`);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`موعد طبي: ${primary.doctorName}`)}&details=${encodeURIComponent(`${primary.specialization} • رمز الحجز ${bookingRef(primary.id)}`)}&location=${encodeURIComponent(primary.hospital || "العيادة")}&dates=${stamp(start)}/${stamp(end)}`;
    window.open(url, "_blank", "noreferrer");
  });

  bindOnce(el("bk-directions"), "directions", () => {
    if (!primary?.hospital) { showToast("لا يتوفر عنوان لهذا الموعد", "info"); return; }
    window.open(mapsUrl(primary.hospital), "_blank", "noreferrer");
  });
  bindOnce(el("bk-nav"), "nav", () => {
    if (!primary?.hospital) { showToast("لا يتوفر عنوان لهذا الموعد", "info"); return; }
    window.open(mapsUrl(primary.hospital), "_blank", "noreferrer");
  });

  function startReschedule(v: Visit): void {
    if (!v.doctorId) {
      showToast("لا يمكن إعادة جدولة هذا الموعد من هنا — تواصل مع العيادة", "warning");
      return;
    }
    setRescheduleIntent({ id: v.id, ref: bookingRef(v.id) });
    showToast("اختر الوقت الجديد لموعدك من صفحة الطبيب", "info");
    location.hash = `#doctor/${v.doctorId}`;
  }

  bindOnce(el("bk-reschedule"), "reschedule", () => {
    if (!primary) { showToast("لا يوجد موعد لإعادة جدولته", "info"); return; }
    startReschedule(primary);
  });

  bindOnce(el("bk-cancel"), "cancel", async () => {
    if (!primary) { showToast("لا يوجد موعد لإلغائه", "info"); return; }
    const target = primary;
    const ok = await confirmSheet({
      title: "إلغاء الموعد",
      body: `${target.doctorName} • ${formatArabicDate(target.date)} في ${formatTime(target.time)} (${bookingRef(target.id)}). سيتم تحرير الموعد وإبلاغ العيادة فوراً.`,
      confirmLabel: "تأكيد الإلغاء",
      cancelLabel: "تراجع",
      tone: "danger",
      iconName: "event_busy",
    });
    if (!ok) return;
    try {
      await cancelAppointmentRPC(target.id);
      showToast("تم إلغاء الموعد بنجاح", "success");
      await load();
    } catch (e) {
      showToast(translateAuthError(e), "error");
    }
  });

  await load();
}
