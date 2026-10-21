// Live wiring for the appointments portal (#appointments).
//
// Everything on the Smart Pass, the "other upcoming visits" list, the past
// visits grid, the cancelled list and the right-hand side widgets is derived
// from the signed-in patient's appointments. Cancelling writes through the
// cancel_appointment RPC; rescheduling hands off to the doctor dossier where a
// new slot can be picked.
import { escapeHtml, formatArabicDate, formatRelativeDay, formatTime, localDateISO, translateAuthError } from "../../lib/format";
import { cancelAppointmentRPC, getPatientAppointments, getReviewedAppointmentIds } from "../../lib/supabase";
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
  return `<div class="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface-container-lowest p-6">
    <span class="material-symbols-outlined text-[24px] text-primary" aria-hidden="true">${escapeHtml(o.icon)}</span>
    <h3 class="text-[16px] font-semibold text-on-surface">${escapeHtml(o.title)}</h3>
    <p class="max-w-[46ch] text-[13px] leading-relaxed text-on-surface-variant">${escapeHtml(o.body)}</p>
    ${o.actionHtml || ""}
  </div>`;
}


function visitDateLine(v: Visit): string {
  const rel = formatRelativeDay(v.date);
  return `${rel === "اليوم" || rel === "غداً" ? rel + "، " : ""}${formatArabicDate(v.date)}`;
}

function loadingSkeletonHtml(): string {
  return `<div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_288px]" aria-hidden="true">
    <div class="h-80 rounded-xl border border-line bg-surface-container-low"></div>
    <div class="h-80 rounded-xl border border-line bg-surface-container-low"></div>
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
  let reviewedIds = new Set<string>();

  function switchTab(key: string): void {
    ["upcoming", "past", "cancelled"].forEach((k) => {
      const btn = el(`tab-${k}`);
      const view = el(`view-${k}`);
      const active = k === key;
      if (btn) {
        btn.classList.toggle("border-primary", active);
        btn.classList.toggle("border-transparent", !active);
        btn.classList.toggle("text-on-surface", active);
        btn.classList.toggle("font-semibold", active);
        btn.classList.toggle("text-on-surface-variant", !active);
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
    if (import.meta.env.DEV && new URLSearchParams(location.search).has("bkfixture")) {
      const mk = (n: number, date: string, time: string, status: string, name: string, spec: string, hospital: string, fee: number): Visit => ({
        id: `fixbk-${n}-0000-0000-00000000000${n}`, status, date, time, endTime: `${time.slice(0, 2)}:30`,
        doctorId: `fixdoc-${n}`, doctorName: name, specialization: spec, hospital, fee,
      });
      upcoming = [
        mk(1, localDateISO(2), "10:30", "booked", "د. طارق المنصور", "قلب وأوعية دموية", "مستشفى النيل التخصصي — الخرطوم", 6000),
        mk(2, localDateISO(9), "16:00", "booked", "د. هدى إبراهيم", "باطنية", "عيادة المريخ — أم درمان", 5000),
      ];
      past = [mk(3, localDateISO(-24), "09:00", "completed", "د. سارة عثمان", "طب الأسرة", "مركز صحي — بحري", 4000)];
      cancelled = [mk(4, localDateISO(-6), "12:00", "cancelled_by_patient", "د. كمال الأمين", "عيون", "مستشفى النور — الخرطوم", 7000)];
      reviewedIds = new Set();
      primary = upcoming[0];
      return;
    }
    let rows: unknown[] = [];
    try {
      rows = (await getPatientAppointments()) as unknown[];
    } catch {
      showToast("تعذّر تحميل مواعيدك، حاول مرة أخرى", "error");
    }
    try {
      reviewedIds = await getReviewedAppointmentIds();
    } catch {
      reviewedIds = new Set();
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
    const navCard = el("bk-nav")?.closest<HTMLElement>(".bk-address") || null;
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
              actionHtml: `<a href="#doctors" class="mt-1 inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container">تصفح الأطباء</a>`,
            })
          : emptyCard({
              icon: "lock",
              title: "سجّل الدخول لعرض مواعيدك",
              body: "تحتاج إلى تسجيل الدخول لعرض تذاكر مواعيدك وزياراتك السابقة ووصفاتك الطبية.",
              actionHtml: `<button type="button" data-bk-auth class="mt-1 inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container">تسجيل الدخول</button>`,
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
    card.className = "mt-2 flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest";
    card.innerHTML = rest
      .map((v) => `<div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-container-high text-[13px] font-semibold text-on-surface">${escapeHtml(initials(v.doctorName))}</span>
          <div class="min-w-0">
            <p class="truncate text-[14px] font-semibold text-on-surface">${escapeHtml(v.doctorName)}</p>
            <p class="mt-0.5 truncate text-[12px] text-on-surface-variant">${escapeHtml(specialtyLabel(v.specialization))} · ${escapeHtml(v.hospital || "زيارة عيادة")}</p>
            <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
              <span class="tabular-nums">${escapeHtml(formatArabicDate(v.date))}</span>
              <span class="tabular-nums">${escapeHtml(formatTime(v.time))}</span>
              <span class="tabular-nums" dir="ltr">${escapeHtml(bookingRef(v.id))}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 self-end sm:self-auto">
          <button type="button" data-pass-id="${escapeHtml(v.id)}" class="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">confirmation_number</span>
            <span>عرض التذكرة</span>
          </button>
          <button type="button" data-resched-id="${escapeHtml(v.id)}" data-resched-doc="${escapeHtml(v.doctorId)}" class="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low" title="إعادة جدولة هذا الموعد" aria-label="إعادة جدولة هذا الموعد">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">edit_calendar</span>
          </button>
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
      list.className = "block px-4 py-6";
      list.innerHTML = `<p class="text-center text-[13px] text-on-surface-variant">لا توجد زيارات مكتملة في سجلك حتى الآن.</p>`;
      return;
    }
    list.className = "flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest";
    list.innerHTML = past
      .map((v) => `<div class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="truncate text-[14px] font-semibold text-on-surface">${escapeHtml(v.doctorName)}</p>
          <p class="mt-0.5 truncate text-[12px] text-on-surface-variant">${escapeHtml(specialtyLabel(v.specialization))} · ${escapeHtml(v.hospital || "زيارة عيادة")}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-[12px] text-on-surface-variant">
          <span class="tabular-nums">${escapeHtml(formatArabicDate(v.date))}</span>
          <span class="tabular-nums">${escapeHtml(formatTime(v.time))}</span>
          <span class="font-medium text-tertiary">مكتمل</span>
          ${reviewedIds.has(v.id)
            ? `<span class="font-medium text-tertiary">تم التقييم</span>`
            : `<a href="#doctor/${escapeHtml(v.doctorId)}" class="press inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container">قيّم الزيارة</a>`}
          <a href="#doctor/${escapeHtml(v.doctorId)}" class="font-medium text-primary hover:underline">حجز مراجعة</a>
        </div>
      </div>`)
      .join("");
  }


  function renderCancelled(): void {
    const list = el("bk-cancelled-list");
    if (!list) return;
    if (!cancelled.length) {
      list.className = "block px-4 py-6";
      list.innerHTML = `<p class="text-center text-[13px] text-on-surface-variant">لا توجد مواعيد ملغاة.</p>`;
      return;
    }
    list.className = "flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest";
    list.innerHTML = cancelled
      .map((v) => {
        const reason = v.status === "cancelled_by_clinic" ? "ألغي من العيادة" : v.status === "no_show" ? "لم يتم الحضور" : "ألغي بناءً على طلب المريض";
        return `<div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="text-[12px] text-error">${escapeHtml(reason)}</p>
            <p class="mt-0.5 truncate text-[14px] font-semibold text-on-surface">${escapeHtml(v.doctorName)} · ${escapeHtml(specialtyLabel(v.specialization))}</p>
            <p class="mt-0.5 text-[12px] text-on-surface-variant">${escapeHtml(v.hospital || "زيارة عيادة")} · <span class="tabular-nums">${escapeHtml(formatArabicDate(v.date))} ${escapeHtml(formatTime(v.time))}</span></p>
          </div>
          <a href="#doctor/${escapeHtml(v.doctorId)}" class="inline-flex h-8 shrink-0 items-center self-start rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container sm:self-auto">إعادة الحجز</a>
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
