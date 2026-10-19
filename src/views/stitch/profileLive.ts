// Live wiring for the Stitch desktop profile screen (#profile).
import { escapeHtml, formatArabicDate, formatTime, localDateISO, translateAuthError } from "../../lib/format";
import { getPatientAppointments, updatePassword } from "../../lib/supabase";
import { showToast } from "../../components/Toast";
import { initials, statusPill } from "../../components/ui";

type ProfileUser = {
  id?: string; email?: string; created_at?: string;
  profile?: { full_name?: string; phone?: string; role?: string } | null;
} | null;

type Visit = {
  id: string; status: string; date: string; time: string;
  doctorName: string; specialization: string; hospital: string; fee: number;
};

const ROLE_LABEL: Record<string, string> = { admin: "مشرف النظام", doctor: "طبيب", patient: "مريض" };

export function wireProfile(
  appEl: HTMLElement,
  user: ProfileUser,
  opts: { onOpenAuth: () => void; onLogout: () => void; onSave: (p: { fullName: string; phone: string }) => Promise<void> }
) {
  const el = <T extends HTMLElement>(sel: string) => appEl.querySelector<HTMLElement>(sel) as T | null;
  const role = (user?.profile?.role || "patient") as string;
  const p = user?.profile || {};

  /* ---------- guest view ---------- */
  if (!user) {
    el("#pf-main")?.classList.add("hidden");
    el("#pf-guest")?.classList.remove("hidden");
    el("#pf-open-auth")?.addEventListener("click", () => opts.onOpenAuth());
    return;
  }

  /* ---------- hero ---------- */
  const displayName = (p.full_name || "").trim() || "مستخدم ميعادي";
  if (el("#pf-avatar")) el("#pf-avatar")!.textContent = initials(displayName);
  if (el("#pf-name-ar")) el("#pf-name-ar")!.textContent = displayName;
  if (el("#pf-role")) el("#pf-role")!.textContent = ROLE_LABEL[role] || "مريض";
  if (el("#pf-email-short")) el("#pf-email-short")!.textContent = user.email || "—";
  if (el("#pf-phone-short")) el("#pf-phone-short")!.textContent = p.phone || "—";

  if (user.created_at) {
    const d = new Date(user.created_at);
    if (!Number.isNaN(d.getTime())) {
      const label = d.toLocaleDateString("ar", { month: "long", year: "numeric" });
      el("#pf-since-wrap")?.classList.remove("hidden");
      el("#pf-since-sep")?.classList.remove("hidden");
      if (el("#pf-since")) el("#pf-since")!.textContent = label;
    }
  }

  /* ---------- tabs ---------- */
  const tabs = { info: el("#pf-panel-info"), aps: el("#pf-panel-aps"), sec: el("#pf-panel-sec") };
  const activate = (key: "info" | "aps" | "sec") => {
    (Object.keys(tabs) as (keyof typeof tabs)[]).forEach((k) => tabs[k]?.classList.toggle("hidden", k !== key));
    appEl.querySelectorAll<HTMLElement>("[data-pf-tab]").forEach((b) => {
      const on = b.getAttribute("data-pf-tab") === key;
      b.className = `flex items-center gap-2 px-space-lg py-2.5 rounded-xl font-label-md text-label-md transition-all ${on ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"}`;
    });
  };
  appEl.querySelectorAll<HTMLElement>("[data-pf-tab]").forEach((b) =>
    b.addEventListener("click", () => activate(b.getAttribute("data-pf-tab") as "info" | "aps" | "sec")));
  activate("info");

  /* ---------- personal data tab ---------- */
  const nameInput = el<HTMLInputElement>("#pf-name");
  const phoneInput = el<HTMLInputElement>("#pf-phone");
  if (nameInput) nameInput.value = p.full_name || "";
  if (phoneInput) phoneInput.value = p.phone || "";
  if (el("#pf-email")) el("#pf-email")!.textContent = user.email || "—";
  if (el("#pf-phone-view")) el("#pf-phone-view")!.textContent = p.phone || "—";
  if (el("#pf-phone-state")) el("#pf-phone-state")!.textContent = p.phone ? "محدد" : "غير محدد بعد";

  el("#pf-edit-btn")?.addEventListener("click", () => { activate("info"); nameInput?.scrollIntoView({ behavior: "smooth", block: "center" }); nameInput?.focus(); });
  el("#pf-save")?.addEventListener("click", async () => {
    const fullName = (nameInput?.value || "").trim();
    const phone = (phoneInput?.value || "").trim();
    if (!fullName) { showToast("أدخل الاسم الكامل", "warning"); return; }
    const btn = el<HTMLButtonElement>("#pf-save");
    if (btn) btn.disabled = true;
    try {
      await opts.onSave({ fullName, phone });
      showToast("تم حفظ الملف", "success");
    } catch {
      /* error surfaced by caller */
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  /* ---------- bookings tab ---------- */
  const list = el("#pf-aps-list");
  const renderAps = (visits: Visit[], failed = false) => {
    if (list) el("#pf-aps-sub") && (el("#pf-aps-sub")!.textContent = failed ? "تعذر تحميل الحجوزات" : "جميع الحجوزات المسجلة باسمك في منصة ميعادي");
    if (!list) return;
    if (failed) {
      list.innerHTML = `<div class="bg-error-container/40 rounded-xl p-space-lg text-center font-body-md text-body-md text-on-error-container">تعذر تحميل الحجوزات — حاول مرة أخرى</div>`;
      return;
    }
    if (!visits.length) {
      list.innerHTML = `<div class="bg-surface-container-low rounded-xl p-space-xl text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-space-sm">
          <span class="material-symbols-outlined text-[30px]">event_available</span>
        </div>
        <p class="font-label-lg text-label-lg font-bold text-on-surface">لا توجد حجوزات على هذا الحساب</p>
        <a href="#doctors" class="mt-space-md inline-flex h-11 px-space-lg rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold items-center">تصفح الأطباء</a>
      </div>`;
      return;
    }
    list.innerHTML = visits.map((v) => {
      return `<div class="flex items-center justify-between gap-space-sm p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
        <div class="flex items-center gap-space-sm">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 font-label-md font-bold">${escapeHtml(initials(v.doctorName))}</div>
          <div class="flex flex-col">
            <span class="font-label-md text-label-md text-on-surface font-semibold">${escapeHtml(v.doctorName)}</span>
            <span class="font-body-sm text-[12px] text-secondary">${escapeHtml(v.specialization)}${v.hospital ? ` • ${escapeHtml(v.hospital)}` : ""}</span>
          </div>
        </div>
        <div class="flex items-center gap-space-md">
          <div class="flex flex-col items-end">
            <span class="font-body-sm text-[12px] text-on-surface-variant">${escapeHtml(formatArabicDate(v.date))}</span>
            <span class="font-mono text-[13px] font-semibold text-on-surface tabular-nums" dir="ltr">${escapeHtml(formatTime(v.time))}</span>
          </div>
          ${statusPill(v.status)}
        </div>
      </div>`;
    }).join("");
  };
  renderAps([]);
  {
    (async () => {
      try {
        const rows = (await getPatientAppointments()) as unknown[];
        const today = localDateISO(0);
        const visits: Visit[] = (rows.map((raw) => {
          const r = raw as {
            id: string; status: string;
            doctor_schedules?: { available_date?: string; start_time?: string; doctors?: { name?: string; specialization?: string; consultation_fee?: number | null; hospitals?: { name?: string } | null } | null } | null;
          };
          const sch = r.doctor_schedules || {};
          const doc = sch.doctors || {};
          return {
            id: r.id, status: r.status, date: sch.available_date || "", time: (sch.start_time || "").slice(0, 5),
            doctorName: doc.name || "طبيب", specialization: doc.specialization || "", hospital: doc.hospitals?.name || "",
            fee: Number(doc.consultation_fee) || 0,
          };
        }).filter((v) => v.date));
        el("#pf-stat-upcoming") && (el("#pf-stat-upcoming")!.textContent = `${visits.filter((v) => v.status === "booked" && v.date >= today).length} مواعيد قادمة`);
        el("#pf-stat-completed") && (el("#pf-stat-completed")!.textContent = `${visits.filter((v) => v.status === "completed").length} زيارة مكتملة`);
        el("#pf-aps-sub") && (el("#pf-aps-sub")!.textContent = "جميع الحجوزات المسجلة باسمك في منصة ميعادي");
        renderAps([...visits].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 6));
      } catch {
        renderAps([], true);
      }
    })();
  }

  /* ---------- security tab ---------- */
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const browser = /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "المتصفح";
  const sessions = el("#pf-sessions");
  if (sessions) {
    sessions.innerHTML = `<div class="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-space-xs">
        <span class="material-symbols-outlined text-secondary text-[20px]">laptop_mac</span>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-on-surface font-semibold">جلسة حالية • ${escapeHtml(browser)}</span>
          <span class="text-[11px] text-secondary">هذا الجهاز • آخر دخول الآن</span>
        </div>
      </div>
      <span class="w-2 h-2 rounded-full bg-tertiary"></span>
    </div>`;
  }
  const passForm = el<HTMLFormElement>("#pf-pass-form");
  el("#pf-pass-btn")?.addEventListener("click", () => passForm?.classList.toggle("hidden"));
  passForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = (el<HTMLInputElement>("#pf-pass-new")?.value || "").trim();
    const cf = (el<HTMLInputElement>("#pf-pass-confirm")?.value || "").trim();
    if (pw.length < 6) { showToast("كلمة المرور يجب أن تكون ٦ أحرف على الأقل", "warning"); return; }
    if (pw !== cf) { showToast("كلمتا المرور غير متطابقتين", "warning"); return; }
    try {
      await updatePassword(pw);
      passForm.classList.add("hidden");
      (el<HTMLInputElement>("#pf-pass-new") as HTMLInputElement).value = "";
      (el<HTMLInputElement>("#pf-pass-confirm") as HTMLInputElement).value = "";
      showToast("تم تحديث كلمة المرور", "success");
    } catch (err) {
      showToast(translateAuthError(err), "error");
    }
  });
  el("#pf-logout-btn")?.addEventListener("click", () => opts.onLogout());

  /* ---------- notification toggles (localStorage) ---------- */
  appEl.querySelectorAll<HTMLInputElement>("[data-pf-toggle]").forEach((input) => {
    const key = `miaadi.pf.notif.${input.getAttribute("data-pf-toggle")}`;
    input.checked = localStorage.getItem(key) !== "0";
    input.addEventListener("change", () => {
      localStorage.setItem(key, input.checked ? "1" : "0");
      showToast(input.checked ? "تم تفعيل التنبيه" : "تم إيقاف التنبيه", "info");
    });
  });
}
