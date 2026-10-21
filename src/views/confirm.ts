import { escapeHtml, formatTime, formatArabicDate } from "../lib/format";
import { icon } from "../components/icons";
import { avatar, money, durationMin, shortRef } from "../components/ui";
import { showToast } from "../components/Toast";
import { type Doctor, type Slot } from "../components/DoctorCard";

type User = { profile?: { full_name: string; phone: string } } | null;

export function renderConfirmView(
  root: HTMLElement,
  opts: {
    doctor: Doctor;
    slot: Slot;
    user: User;
    mode?: "book" | "reschedule";
    onConfirm: (p: { patientName: string; patientPhone: string }) => Promise<{ id?: string } | void>;
    onOpenAuth: () => void;
  }
) {
  const { doctor, slot, user } = opts;
  const isResched = opts.mode === "reschedule";
  const mins = durationMin(slot.start_time, slot.end_time);

  const row = (iconName: string, label: string, value: string, mono = false) => `
    <div class="flex items-center gap-3 py-2.5">
      <span class="w-9 h-9 rounded-xl bg-surface-container-low text-on-surface-variant grid place-items-center shrink-0">${icon(iconName, { size: 18 })}</span>
      <span class="text-sm text-on-surface-variant">${escapeHtml(label)}</span>
      <span class="ms-auto font-bold text-sm ${mono ?"tabular-nums" : ""}">${escapeHtml(value)}</span>
    </div>`;

  const name = user?.profile?.full_name || "";
  const phone = user?.profile?.phone || "";

  root.innerHTML = `
  <div class="space-y-4 px-4 pt-3 pb-40">
    <section class="panel p-5 space-y-3">
      <div class="flex items-center gap-3">
        ${avatar(doctor.name, "sm")}
        <div class="flex-1 min-w-0">
          <p class="font-extrabold text-[16px] truncate">${escapeHtml(doctor.name)}</p>
          <p class="text-[12px] text-primary font-bold">${escapeHtml(doctor.specialization)}</p>
        </div>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed/60 text-on-tertiary-fixed-variant text-[11px] font-bold">${icon("event_available", { size: 14, filled: true })}متاح</span>
      </div>
      <div class="divide-y divide-outline-variant/50">
        ${row("calendar_month", "التاريخ", formatArabicDate(slot.available_date))}
        ${row("schedule", "الوقت", `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`, true)}
        ${mins ? row("timer", "المدة", `${mins} دقيقة`, true) : ""}
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-extrabold text-[16px] px-1">بيانات المريض</h2>
      <div class="panel p-4 space-y-3">
        <label class="block">
          <span class="text-xs font-bold text-on-surface-variant">الاسم الكامل</span>
          <input id="cf-name" type="text" value="${escapeHtml(name)}" placeholder="اسم المريض" ${isResched ? "readonly" : ""} class="mt-1.5 w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm ${isResched ?"opacity-70" : ""}" />
        </label>
        <label class="block">
          <span class="text-xs font-bold text-on-surface-variant">رقم الهاتف</span>
          <input id="cf-phone" type="tel" dir="ltr" value="${escapeHtml(phone)}" placeholder="05xxxxxxxx" ${isResched ? "readonly" : ""} class="mt-1.5 w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm text-left ${isResched ?"opacity-70" : ""}" />
        </label>
      </div>
    </section>

    ${
      isResched
        ? `<div class="panel-flat p-4 flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary grid place-items-center shrink-0">${icon("event_repeat", { size: 20 })}</span>
            <p class="text-[12px] text-on-surface-variant">لن تتغيّر أي رسوم — سيُحدَّث موعد الحجز الحالي فقط إلى الوقت الجديد.</p>
          </div>`
        : `<section class="space-y-3">
      <h2 class="font-extrabold text-[16px] px-1">طريقة الدفع</h2>
      <div class="grid grid-cols-2 gap-2">
        <button data-pay="clinic" class="panel p-4 flex flex-col gap-2 text-start ring-2 ring-primary">
          <span class="flex items-center justify-between">${icon("storefront", { size: 22, className: "text-primary" })}<span data-check class="w-5 h-5 rounded-full bg-primary text-on-primary grid place-items-center">${icon("check", { size: 14 })}</span></span>
          <span class="font-bold text-sm">الدفع في العيادة</span>
          <span class="text-[11px] text-on-surface-variant">نقداً أو بالبطاقة عند الوصول</span>
        </button>
        <div class="panel-flat p-4 flex flex-col gap-2 text-start opacity-70">
          <span class="flex items-center justify-between">${icon("credit_card", { size: 22, className: "text-on-surface-variant" })}<span class="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">قريباً</span></span>
          <span class="font-bold text-sm">بطاقة / مدى</span>
          <span class="text-[11px] text-on-surface-variant">دفع إلكتروني آمن</span>
        </div>
      </div>
      <div class="panel-flat p-4 flex items-center gap-3">
        <span class="w-9 h-9 rounded-xl bg-surface-container-lowest text-on-surface-variant grid place-items-center">${icon("verified_user", { size: 18 })}</span>
        <div class="flex-1">
          <p class="text-sm font-bold">التأمين الطبي</p>
          <p class="text-[11px] text-on-surface-variant">التغطية التأمينية قيد الإطلاق</p>
        </div>
        <span class="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">قريباً</span>
      </div>
    </section>`
    }

    <label class="panel-flat p-4 flex items-start gap-3 cursor-pointer">
      <input id="cf-agree" type="checkbox" checked class="mt-0.5 w-5 h-5 rounded-md accent-[#00685F]" />
      <span class="text-[12px] text-on-surface-variant leading-relaxed">${
        isResched
          ? "أؤكد رغبتي في تعديل موعد الحجز الحالي إلى الوقت الجديد المختار."
          : "أوافق على سياسة الحجز والإلغاء وأقرّ بصحة البيانات المُدخلة، وألتزم بالحضور في الموعد المحدد."
      }</span>
    </label>

    ${
      !user
        ? `<div class="panel p-4 flex items-center gap-3 border border-primary/20">
            <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">${icon("login", { size: 20 })}</span>
            <p class="flex-1 text-[12px] text-on-surface-variant">سجّل الدخول لإتمام الحجز ومتابعة مواعيدك.</p>
            <button data-open-auth class="h-10 px-4 rounded-full bg-primary text-on-primary text-sm font-bold shrink-0">دخول</button>
          </div>`
        : ""
    }
  </div>

  <div class="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
    <div class="max-w-[520px] mx-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div class="pointer-events-auto chrome-blur bg-surface-container-lowest/95 border border-outline-variant/50 rounded-[24px] shadow-[0_16px_44px_-16px_rgba(16,24,40,.32)] p-3 flex items-center gap-3">
        ${
          isResched
            ? `<div class="ps-1">
                <p class="text-[11px] text-on-surface-variant">الموعد الجديد</p>
                <p class="font-extrabold text-sm tabular-nums">${escapeHtml(formatTime(slot.start_time))}</p>
              </div>`
            : `<div class="ps-1">
                <p class="text-[11px] text-on-surface-variant">الإجمالي المستحق</p>
                <p class="font-extrabold text-[17px] tabular-nums">${money(doctor.consultation_fee)}</p>
              </div>`
        }
        <button id="cf-submit" class="ms-auto h-12 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
          ${icon(isResched ? "event_repeat" : "check_circle", { size: 19, filled: true })}${isResched ? "تأكيد إعادة الجدولة" : "تأكيد الحجز"}
        </button>
      </div>
    </div>
  </div>`;

  root.querySelector("[data-open-auth]")?.addEventListener("click", () => opts.onOpenAuth());

  const payBtn = root.querySelector('[data-pay="clinic"]') as HTMLElement;
  const agree = root.querySelector("#cf-agree") as HTMLInputElement;
  const submit = root.querySelector("#cf-submit") as HTMLButtonElement;

  const bounce = () => {
    agree.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
      { duration: 220 }
    );
  };
  const requireAgree = () => {
    submit.disabled = !agree.checked;
  };
  agree.addEventListener("change", requireAgree);
  requireAgree();
  void payBtn;

  submit.addEventListener("click", async () => {
    if (!user) {
      showToast("سجّل الدخول لإتمام الحجز", "warning");
      opts.onOpenAuth();
      return;
    }
    const patientName = (root.querySelector("#cf-name") as HTMLInputElement).value.trim();
    const patientPhone = (root.querySelector("#cf-phone") as HTMLInputElement).value.trim();
    if (!isResched && !patientName) {
      showToast("أدخل اسم المريض", "warning");
      (root.querySelector("#cf-name") as HTMLInputElement).focus();
      return;
    }
    if (!isResched && !/^[0-9+\s-]{8,}$/.test(patientPhone)) {
      showToast("أدخل رقم هاتف صحيح", "warning");
      (root.querySelector("#cf-phone") as HTMLInputElement).focus();
      return;
    }
    if (!agree.checked) {
      showToast("يرجى الموافقة على سياسة الحجز", "warning");
      bounce();
      return;
    }
    submit.disabled = true;
    submit.innerHTML = `${icon("progress_activity", { size: 19, className: "animate-spin" })}جارٍ التأكيد…`;
    try {
      const res = await opts.onConfirm({ patientName, patientPhone });
      const ref = shortRef((res && res.id) || slot.id);
      renderSuccess(root, { doctor, slot, patientName, patientPhone, ref, mode: opts.mode });
      showToast(isResched ? "تمت إعادة جدولة موعدك" : "تم تأكيد حجزك بنجاح", "success");
    } catch (e) {
      submit.disabled = !agree.checked;
      submit.innerHTML = `${icon("check_circle", { size: 19, filled: true })}تأكيد الحجز`;
      void e;
    }
  });
}

function renderSuccess(
  root: HTMLElement,
  o: { doctor: Doctor; slot: Slot; patientName: string; patientPhone: string; ref: string; mode?: "book" | "reschedule" }
) {
  const isResched = o.mode === "reschedule";
  root.innerHTML = `
  <div class="px-4 pt-6 pb-24">
    <div class="panel p-6 text-center space-y-4 modal-enter">
      <span class="mx-auto w-20 h-20 rounded-full bg-tertiary-fixed text-on-tertiary-fixed grid place-items-center">${icon("check_circle", { size: 44, filled: true })}</span>
      <div>
        <h1 class="text-[22px] font-extrabold tracking-tight">${isResched ? "تمت إعادة الجدولة!" : "تم تأكيد حجزك!"}</h1>
        <p class="text-sm text-on-surface-variant mt-1">${isResched ? "حُدِّث موعدك بنجاح، ويمكنك مراجعته من «مواعيدي»." : "أرسلنا تفاصيل الموعد، ويمكنك متابعته من «مواعيدي»."}</p>
      </div>
      <div class="rounded-xl bg-surface-container-low p-4 text-start space-y-2">
        <div class="flex items-center gap-3">
          ${avatar(o.doctor.name, "sm")}
          <div class="flex-1 min-w-0">
            <p class="font-extrabold text-sm truncate">${escapeHtml(o.doctor.name)}</p>
            <p class="text-[11px] text-primary font-bold">${escapeHtml(o.doctor.specialization)}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p class="text-[10px] text-on-surface-variant">التاريخ</p>
            <p class="text-xs font-bold">${escapeHtml(formatArabicDate(o.slot.available_date))}</p>
          </div>
          <div>
            <p class="text-[10px] text-on-surface-variant">الوقت</p>
            <p class="text-xs font-bold tabular-nums">${escapeHtml(formatTime(o.slot.start_time))}</p>
          </div>
          <div>
            <p class="text-[10px] text-on-surface-variant">المريض</p>
            <p class="text-xs font-bold">${escapeHtml(o.patientName)}</p>
          </div>
          <div>
            <p class="text-[10px] text-on-surface-variant">رمز الحجز</p>
            <p class="text-xs font-bold tabular-nums">${escapeHtml(o.ref)}</p>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <a href="#appointments" class="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold text-sm grid place-items-center">عرض مواعيدي</a>
        <a href="#home" class="flex-1 h-12 rounded-xl border border-outline-variant font-bold text-sm grid place-items-center">الرئيسية</a>
      </div>
    </div>
  </div>`;
}
