// Patient appointments portal (#appointments) — flat ticket + row list.
export const BOOKINGS_MAIN = `<div class="mx-auto flex w-full max-w-[1200px] flex-col px-4 py-8 sm:px-6 sm:py-10">

<div class="flex flex-wrap items-end justify-between gap-4">
  <div class="min-w-0">
    <h1 class="text-[24px] font-bold leading-tight text-on-surface">مواعيدي</h1>
    <p class="mt-1 text-[15px] text-on-surface-variant">تذاكر مواعيدك القادمة، وزياراتك السابقة، والملغاة.</p>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <span id="bk-file-no" class="text-[13px] text-on-surface-variant">ملف المريض #—</span>
    <a href="#doctors" class="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container">حجز موعد جديد</a>
  </div>
</div>

<!-- Tabs -->
<div class="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-line" role="tablist" aria-label="تصفية المواعيد">
  <button class="booking-tab -mb-px inline-flex h-11 items-center gap-2 border-b-2 border-primary px-3 text-[14px] font-semibold text-on-surface transition-colors" id="tab-upcoming" type="button" role="tab" aria-selected="true" data-bk-tab="upcoming">
    <span>القادمة</span><span class="text-[12px] tabular-nums text-on-surface-variant" id="bk-count-upcoming">—</span>
  </button>
  <button class="booking-tab -mb-px inline-flex h-11 items-center gap-2 border-b-2 border-transparent px-3 text-[14px] text-on-surface-variant transition-colors hover:text-on-surface" id="tab-past" type="button" role="tab" aria-selected="false" data-bk-tab="past">
    <span>السابقة</span><span class="text-[12px] tabular-nums" id="bk-count-past">—</span>
  </button>
  <button class="booking-tab -mb-px inline-flex h-11 items-center gap-2 border-b-2 border-transparent px-3 text-[14px] text-on-surface-variant transition-colors hover:text-on-surface" id="tab-cancelled" type="button" role="tab" aria-selected="false" data-bk-tab="cancelled">
    <span>الملغاة</span><span class="text-[12px] tabular-nums" id="bk-count-cancelled">—</span>
  </button>
</div>

<!-- Upcoming -->
<div class="mt-6 flex flex-col gap-6" id="view-upcoming">
  <div class="hidden" id="bk-empty"></div>

  <div class="flex flex-col gap-6" id="bk-col-main">
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_288px]" id="bk-pass">

      <!-- ticket stub -->
      <div class="rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div class="grid h-14 w-14 shrink-0 place-items-center whitespace-nowrap rounded-xl bg-primary text-[18px] font-bold leading-none text-on-primary" id="bk-pass-avatar" aria-hidden="true"></div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 class="text-[18px] font-bold text-on-surface" id="bk-pass-doctor">—</h2>
              <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;" aria-label="طبيب موثّق">verified</span>
            </div>
            <p class="mt-0.5 text-[14px] text-primary"><span id="bk-pass-specialty">—</span> <span class="text-on-surface-variant">·</span> <span class="text-[12px] font-medium text-tertiary">مؤكد</span></p>
            <p class="mt-1 flex items-center gap-1 text-[13px] text-on-surface-variant">
              <span class="material-symbols-outlined text-[16px]" aria-hidden="true">domain</span>
              <span id="bk-pass-hospital">—</span>
            </p>
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          <div class="bg-surface-container-lowest p-4">
            <dt class="text-[12px] text-on-surface-variant">تاريخ وتوقيت الكشف</dt>
            <dd class="mt-1 text-[15px] font-semibold text-on-surface"><span id="bk-pass-date">—</span></dd>
            <dd class="mt-0.5 text-[13px] text-on-surface-variant"><span class="tabular-nums text-primary" id="bk-pass-time">—</span> <span id="bk-pass-window"></span></dd>
          </div>
          <div class="bg-surface-container-lowest p-4">
            <dt class="text-[12px] text-on-surface-variant">مقر العيادة والغرفة</dt>
            <dd class="mt-1 text-[15px] font-semibold text-on-surface"><span id="bk-pass-building">—</span></dd>
            <dd class="mt-0.5 text-[13px] text-on-surface-variant"><span id="bk-pass-room">—</span></dd>
          </div>
        </dl>

        <div class="bk-address mt-3 flex flex-col gap-3 rounded-lg bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-container-lowest text-primary">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">location_on</span>
            </span>
            <div class="min-w-0">
              <p class="text-[12px] text-on-surface-variant">عنوان العيادة</p>
              <p class="truncate text-[13px] text-on-surface" id="bk-pass-address">—</p>
            </div>
          </div>
          <button class="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container" id="bk-nav" type="button">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">map</span>الاتجاهات
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div class="flex flex-wrap items-center gap-2">
            <button class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container" id="bk-calendar" type="button">
              <span class="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">calendar_add_on</span>أضف للتقويم
            </button>
            <button class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container" id="bk-directions" type="button">
              <span class="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">map</span>اتجاهات المبنى
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button class="inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface" id="bk-reschedule" type="button">إعادة الجدولة</button>
            <button class="inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] font-medium text-error transition-colors hover:bg-error-container/40" id="bk-cancel" type="button">إلغاء الموعد</button>
          </div>
        </div>
      </div>

      <!-- QR stub -->
      <div class="flex flex-col rounded-xl border border-line bg-surface-container-lowest p-5">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-[12px] text-on-surface-variant">تذكرة الدخول</span>
          <span class="text-[11px] text-on-surface-variant" dir="ltr">SECURE-CHECKIN</span>
        </div>
        <div class="mt-3 flex flex-col items-center">
          <div class="grid place-items-center rounded-lg border border-line p-2" id="bk-pass-qr-wrap">
            <div class="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded bg-surface-container-lowest p-2" id="bk-pass-qr" role="img" aria-label="رمز الاستجابة السريعة لرقم الحجز"></div>
          </div>
          <span class="mt-2 text-[11px] text-on-surface-variant" dir="ltr" id="bk-pass-token">TOKEN: —</span>
          <p class="mt-3 text-center text-[12px] leading-relaxed text-on-surface-variant">امسح الرمز عند بوابة العيادة لتسجيل الوصول دون مراجعة الاستقبال.</p>
          <p class="mt-3 w-full rounded-lg bg-surface-container-low px-3 py-2 text-center text-[12px] text-on-surface-variant" id="bk-pass-paid">—</p>
          <div class="mt-3 flex w-full items-center justify-between gap-2 border-t border-line pt-3">
            <span class="text-[11px] text-on-surface-variant" id="bk-pass-ref">رمز الحجز: —</span>
            <button class="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low" id="bk-share" type="button" title="مشاركة التذكرة" aria-label="مشاركة التذكرة">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- other upcoming -->
    <section aria-labelledby="bk-secondary-title">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="text-[15px] font-semibold text-on-surface" id="bk-secondary-title">مواعيد قادمة أخرى</h2>
        <span class="text-[12px] text-on-surface-variant" id="bk-secondary-note">—</span>
      </div>
      <div class="mt-2 hidden" id="bk-secondary-card"></div>
    </section>
  </div>
</div>

<!-- Past -->
<div class="mt-6 hidden flex-col gap-3" id="view-past">
  <h2 class="text-[15px] font-semibold text-on-surface">سجل الزيارات المكتملة</h2>
  <div class="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest" id="bk-past-list"></div>
</div>

<!-- Cancelled -->
<div class="mt-6 hidden flex-col gap-3" id="view-cancelled">
  <h2 class="text-[15px] font-semibold text-on-surface">المواعيد الملغاة</h2>
  <div class="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest" id="bk-cancelled-list"></div>
</div>

</div>`;
