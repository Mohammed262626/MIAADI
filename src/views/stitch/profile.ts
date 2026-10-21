// Patient profile and account settings — flat sections, underline tabs.
export const PROFILE_MAIN = `
<div class="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">

  <div id="pf-main">

    <!-- identity -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 items-start gap-4">
        <div class="relative shrink-0">
          <div class="grid h-16 w-16 place-items-center whitespace-nowrap rounded-xl bg-primary/10 text-[22px] font-bold leading-none text-primary" id="pf-avatar">م</div>
          <span class="absolute -bottom-1 -end-1 grid h-6 w-6 place-items-center rounded-md bg-surface-container-lowest text-tertiary" title="حساب موثق ببريد إلكتروني مؤكد">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">verified</span>
          </span>
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-[24px] font-bold leading-tight text-on-surface" id="pf-name-ar">مستخدم ميعادي</h1>
            <span class="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 text-[12px] text-on-surface-variant" id="pf-role-chip">
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">shield_person</span>
              <span id="pf-role">مريض</span>
            </span>
          </div>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-on-surface-variant">
            <span>البريد: <span class="text-on-surface" id="pf-email-short" dir="ltr">—</span></span>
            <span>الجوال: <span class="text-on-surface tabular-nums" id="pf-phone-short" dir="ltr">—</span></span>
            <span class="hidden" id="pf-since-sep"></span>
            <span class="hidden" id="pf-since-wrap">عضو منذ <span id="pf-since">—</span></span>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-on-surface-variant" id="pf-stats">
            <span id="pf-stat-upcoming">— مواعيد قادمة</span>
            <span class="text-outline-variant" aria-hidden="true">·</span>
            <span id="pf-stat-completed">— زيارة مكتملة</span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button id="pf-edit-btn" class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="button">
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">edit_note</span>
          <span>تحديث البيانات</span>
        </button>
        <button id="pf-logout-btn" class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-error transition-colors hover:bg-error-container/40" type="button">
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>

    <!-- tabs -->
    <div class="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-line">
      <button data-pf-tab="info" class="-mb-px inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-primary px-3 text-[14px] font-semibold text-on-surface transition-colors" type="button">
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
        <span>البيانات الشخصية</span>
      </button>
      <button data-pf-tab="aps" class="-mb-px inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-[14px] text-on-surface-variant transition-colors hover:text-on-surface" type="button">
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">event_available</span>
        <span>حجوزاتي</span>
      </button>
      <button data-pf-tab="sec" class="-mb-px inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-[14px] text-on-surface-variant transition-colors hover:text-on-surface" type="button">
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">security</span>
        <span>الأمان والتنبيهات</span>
      </button>
    </div>

    <div class="mt-6 flex flex-col gap-6">

      <!-- personal data -->
      <section id="pf-panel-info" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6">
          <h2 class="text-[16px] font-semibold text-on-surface">البيانات الأساسية</h2>
          <p class="mt-0.5 text-[13px] text-on-surface-variant">الاسم والجوال اللذان يرتبطان بكل حجوزاتك.</p>
          <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-[12px] text-on-surface-variant">الاسم الكامل</span>
              <input id="pf-name" type="text" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-[14px] text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            </label>
            <label class="block">
              <span class="text-[12px] text-on-surface-variant">رقم الجوال</span>
              <input id="pf-phone" type="tel" dir="ltr" placeholder="05xxxxxxxx" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-left text-[14px] tabular-nums text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            </label>
          </div>
          <button id="pf-save" class="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="button">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">save</span>
            <span>حفظ التغييرات</span>
          </button>
        </div>

        <div class="rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6">
          <h2 class="text-[16px] font-semibold text-on-surface">بيانات الاتصال</h2>
          <p class="mt-0.5 text-[13px] text-on-surface-variant">قنوات استلام تأكيدات الحجوزات وتذكير المواعيد.</p>
          <div class="mt-4 flex flex-col divide-y divide-line">
            <div class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0">
                <p class="text-[12px] text-on-surface-variant">البريد الإلكتروني</p>
                <p class="mt-0.5 truncate text-[14px] font-medium text-on-surface" dir="ltr" id="pf-email">—</p>
              </div>
              <span class="inline-flex shrink-0 items-center gap-1 text-[12px] text-tertiary">
                <span class="material-symbols-outlined text-[14px]" aria-hidden="true">check_circle</span>موثق
              </span>
            </div>
            <div class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0">
                <p class="text-[12px] text-on-surface-variant">رقم الجوال</p>
                <p class="mt-0.5 text-[14px] font-medium tabular-nums text-on-surface" dir="ltr" id="pf-phone-view">—</p>
              </div>
              <span class="shrink-0 text-[12px] text-on-surface-variant" id="pf-phone-state">—</span>
            </div>
          </div>
        </div>
      </section>

      <!-- bookings -->
      <section id="pf-panel-aps" class="hidden rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 class="text-[16px] font-semibold text-on-surface">آخر الحجوزات على حسابك</h2>
            <p class="mt-0.5 text-[13px] text-on-surface-variant" id="pf-aps-sub">جميع الحجوزات المسجلة باسمك في منصة ميعادي.</p>
          </div>
          <a href="#appointments" class="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
            <span>عرض كل الحجوزات</span>
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          </a>
        </div>
        <div id="pf-aps-list" class="mt-3 flex flex-col divide-y divide-line"></div>
      </section>

      <!-- security -->
      <section id="pf-panel-sec" class="hidden flex flex-col gap-6 lg:flex-row">
        <div class="rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6">
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="text-[16px] font-semibold text-on-surface">الأمان وحماية الحساب</h2>
            <span class="text-[12px] text-tertiary">بريد موثق</span>
          </div>
          <div id="pf-sessions" class="mt-3 flex flex-col divide-y divide-line"></div>
          <form id="pf-pass-form" class="mt-4 hidden flex flex-col gap-3 rounded-lg bg-surface-container-low p-4">
            <label class="block">
              <span class="text-[12px] text-on-surface-variant">كلمة مرور جديدة (٦ أحرف على الأقل)</span>
              <input id="pf-pass-new" type="password" dir="ltr" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-[14px] text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" autocomplete="new-password" />
            </label>
            <label class="block">
              <span class="text-[12px] text-on-surface-variant">تأكيد كلمة المرور</span>
              <input id="pf-pass-confirm" type="password" dir="ltr" class="mt-1 h-10 w-full rounded-lg border border-line bg-surface-container-lowest px-3 text-[14px] text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" autocomplete="new-password" />
            </label>
            <button id="pf-pass-save" class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container" type="submit">تحديث كلمة المرور</button>
          </form>
          <button id="pf-pass-btn" class="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline" type="button">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">password</span>
            <span>تغيير كلمة المرور</span>
          </button>
        </div>

        <div class="rounded-xl border border-line bg-surface-container-lowest p-5 sm:p-6 lg:w-[360px] lg:shrink-0">
          <h2 class="text-[16px] font-semibold text-on-surface">تفضيلات التنبيهات</h2>
          <div class="mt-3 flex flex-col divide-y divide-line">
            <div class="flex items-center justify-between gap-3 py-3">
              <div>
                <p class="text-[14px] text-on-surface">تذكير المواعيد</p>
                <p class="mt-0.5 text-[12px] text-on-surface-variant">تنبيه قبل موعدك على الجوال</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" class="peer sr-only" data-pf-toggle="aps" />
                <span class="h-5 w-9 rounded-full bg-surface-container-highest transition-colors peer-checked:bg-primary after:absolute after:start-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface-container-lowest after:transition-transform peer-checked:after:-translate-x-4"></span>
              </label>
            </div>
            <div class="flex items-center justify-between gap-3 py-3">
              <div>
                <p class="text-[14px] text-on-surface">رسائل SMS للتأكيدات</p>
                <p class="mt-0.5 text-[12px] text-on-surface-variant">إشعارات تأكيد الحجوزات والجلسات</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" class="peer sr-only" data-pf-toggle="sms" />
                <span class="h-5 w-9 rounded-full bg-surface-container-highest transition-colors peer-checked:bg-primary after:absolute after:start-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface-container-lowest after:transition-transform peer-checked:after:-translate-x-4"></span>
              </label>
            </div>
            <div class="flex items-center justify-between gap-3 py-3">
              <div>
                <p class="text-[14px] text-on-surface">العروض والتحديثات</p>
                <p class="mt-0.5 text-[12px] text-on-surface-variant">أخبار المنصة والتحديثات الجديدة</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" class="peer sr-only" data-pf-toggle="promo" />
                <span class="h-5 w-9 rounded-full bg-surface-container-highest transition-colors peer-checked:bg-primary after:absolute after:start-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface-container-lowest after:transition-transform peer-checked:after:-translate-x-4"></span>
              </label>
            </div>
          </div>
          <p class="mt-2 text-[12px] text-on-surface-variant">تُحفظ هذه التفضيلات محلياً على هذا الجهاز في هذه النسخة.</p>
        </div>
      </section>

      <!-- data note -->
      <div id="pf-banner" class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">gavel</span>
          <div>
            <p class="text-[14px] font-semibold text-on-surface">حماية بياناتك الشخصية</p>
            <p class="mt-0.5 max-w-[60ch] text-[12px] leading-relaxed text-on-surface-variant">بيانات ملفك محفوظة ومشفّرة، ولا تُستخدم إلا لإدارة مواعيدك وسجلات حجزك داخل المنصة.</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
          <span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[15px] text-tertiary" aria-hidden="true">check</span>وصول مقيد بصلاحيات الحساب</span>
          <span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[15px] text-primary" aria-hidden="true">lock</span>تشفير TLS 256-bit</span>
        </div>
      </div>

    </div>
  </div>

  <!-- logged out -->
  <div id="pf-guest" class="mx-auto mt-10 hidden max-w-md flex flex-col items-start gap-3 rounded-xl border border-line bg-surface-container-lowest p-6">
    <span class="material-symbols-outlined text-[28px] text-primary" aria-hidden="true">person</span>
    <h1 class="text-[20px] font-bold text-on-surface">مرحباً بك في ميعادي</h1>
    <p class="text-[13px] leading-relaxed text-on-surface-variant">سجّل الدخول للوصول إلى ملفك ومواعيدك وبياناتك.</p>
    <button id="pf-open-auth" class="mt-1 inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container">تسجيل الدخول أو إنشاء حساب</button>
  </div>

</div>`;
