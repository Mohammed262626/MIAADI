// AUTO-PORTED from Stitch desktop screen: "ملف المستخدم وإعدادات الحساب | Patient Profile"
// (projects/4257345503185534008/screens/ae05954cbc9241389139cdcb4c9e7472)
// Adapted to real data only: fabricated Absher/Nafath/Bupa/dependents/BMI content removed.

export const PROFILE_MAIN = `
<div class="w-full px-margin md:px-margin-desktop py-space-md">

  <!-- Breadcrumb -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
    <nav class="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
      <a class="hover:text-primary transition-colors flex items-center gap-1" href="#home">
        <span class="material-symbols-outlined text-[16px]">home</span>
        <span>الرئيسية</span>
      </a>
      <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_left</span>
      <span class="text-primary font-semibold">الملف الشخصي وإعدادات الحساب</span>
    </nav>
    <div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-space-md py-1.5 rounded-full self-start sm:self-auto">
      <span class="w-2 h-2 rounded-full bg-tertiary"></span>
      <span>بياناتك محمية ومصادق عليها عبر بريدك الإلكتروني</span>
    </div>
  </div>

  <div id="pf-main">

  <!-- Patient Hero Card -->
  <div class="w-full bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm mb-space-lg relative overflow-hidden">
    <div class="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-tertiary-fixed/15 blur-3xl pointer-events-none"></div>
    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
        <div class="relative">
          <div class="w-24 h-24 rounded-2xl bg-primary/10 text-primary font-headline-lg font-bold shadow-sm flex items-center justify-center" id="pf-avatar">م</div>
          <div class="absolute -bottom-2 -left-2 bg-tertiary text-on-tertiary p-1.5 rounded-xl shadow-sm flex items-center justify-center" title="حساب موثق ببريد إلكتروني مؤكد">
            <span class="material-symbols-outlined text-[18px]">verified</span>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center flex-wrap gap-space-xs mb-1">
            <h1 class="font-headline-lg text-headline-lg text-on-surface" id="pf-name-ar">مستخدم ميعادي</h1>
            <span class="bg-primary/10 text-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded-md flex items-center gap-1" id="pf-role-chip">
              <span class="material-symbols-outlined text-[14px]">shield_person</span>
              <span id="pf-role">مريض</span>
            </span>
          </div>
          <div class="flex items-center flex-wrap gap-y-1 gap-x-space-md font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            <div class="flex items-center gap-1">
              <span class="text-secondary font-medium">البريد:</span>
              <span class="font-mono text-on-surface font-semibold" id="pf-email-short" dir="ltr">—</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-secondary font-medium">الجوال:</span>
              <span class="font-mono text-on-surface font-semibold" dir="ltr" id="pf-phone-short">—</span>
            </div>
            <span class="text-outline-variant hidden" id="pf-since-sep">•</span>
            <div class="flex items-center gap-1 hidden" id="pf-since-wrap">
              <span class="text-secondary font-medium">عضو منذ:</span>
              <span class="text-on-surface" id="pf-since">—</span>
            </div>
          </div>
          <div class="flex items-center flex-wrap gap-space-xs" id="pf-stats">
            <div class="flex items-center gap-1.5 bg-surface-container px-space-md py-1.5 rounded-full text-on-surface font-label-md text-label-md">
              <span class="material-symbols-outlined text-[18px] text-primary">calendar_clock</span>
              <span id="pf-stat-upcoming">— مواعيد قادمة</span>
            </div>
            <div class="flex items-center gap-1.5 bg-surface-container px-space-md py-1.5 rounded-full text-on-surface font-label-md text-label-md">
              <span class="material-symbols-outlined text-[18px] text-secondary">task_alt</span>
              <span id="pf-stat-completed">— زيارة مكتملة</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch justify-center gap-space-xs pt-space-md lg:pt-0">
        <button id="pf-edit-btn" class="px-space-lg py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs shadow-sm active:scale-95" type="button">
          <span class="material-symbols-outlined text-[20px]">edit_note</span>
          <span>تحديث البيانات</span>
        </button>
        <button id="pf-logout-btn" class="px-space-lg py-2.5 rounded-full bg-surface-container text-error hover:bg-error-container/30 font-label-lg text-label-lg transition-all flex items-center justify-center gap-space-xs active:scale-95" type="button">
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Tabbed Navigation -->
  <div class="w-full overflow-x-auto no-scrollbar mb-space-lg">
    <div class="flex items-center gap-space-xs p-1.5 bg-surface-container-lowest rounded-2xl shadow-sm min-w-max">
      <button data-pf-tab="info" class="flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all" type="button">
        <span class="material-symbols-outlined text-[18px]">person</span>
        <span>البيانات الشخصية</span>
      </button>
      <button data-pf-tab="aps" class="flex items-center gap-2 px-space-lg py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md text-label-md transition-all" type="button">
        <span class="material-symbols-outlined text-[18px]">event_available</span>
        <span>حجوزاتي</span>
      </button>
      <button data-pf-tab="sec" class="flex items-center gap-2 px-space-lg py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md text-label-md transition-all" type="button">
        <span class="material-symbols-outlined text-[18px]">security</span>
        <span>الأمان والتنبيهات</span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

    <!-- Tab 1: Personal Data -->
    <section id="pf-panel-info" class="lg:col-span-8 flex flex-col gap-space-lg">
      <div class="bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm">
        <div class="flex items-center justify-between pb-space-md mb-space-lg">
          <div class="flex items-center gap-space-xs">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[22px]">fingerprint</span>
            </div>
            <div class="flex flex-col">
              <h2 class="font-headline-sm text-headline-sm text-on-surface">البيانات الأساسية للحساب</h2>
              <span class="font-body-sm text-body-sm text-secondary">الاسم والجوال اللذان يرتبطان بكل حجوزاتك</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-md">
          <label class="block">
            <span class="font-label-sm text-label-sm text-secondary">الاسم الكامل</span>
            <input id="pf-name" type="text" class="mt-1.5 w-full h-12 px-space-md rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary font-label-lg text-label-lg text-on-surface" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-secondary">رقم الجوال</span>
            <input id="pf-phone" type="tel" dir="ltr" placeholder="05xxxxxxxx" class="mt-1.5 w-full h-12 px-space-md rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary font-label-lg text-label-lg text-on-surface text-left tabular-nums" />
          </label>
        </div>
        <button id="pf-save" class="px-space-lg py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center gap-space-xs shadow-sm active:scale-95" type="button">
          <span class="material-symbols-outlined text-[18px]">save</span>
          <span>حفظ التغييرات</span>
        </button>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm">
        <div class="flex items-center gap-space-xs pb-space-md mb-space-lg">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[22px]">contact_phone</span>
          </div>
          <div class="flex flex-col">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">بيانات الاتصال المعتمدة</h2>
            <span class="font-body-sm text-body-sm text-secondary">قنوات استلام تأكيدات الحجوزات وتذكير المواعيد</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div class="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
            <div class="flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-full bg-tertiary-container/15 text-tertiary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px]">alternate_email</span>
              </div>
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-secondary">البريد الإلكتروني</span>
                <span class="font-mono text-label-md font-bold text-on-surface" dir="ltr" id="pf-email">—</span>
              </div>
            </div>
            <span class="bg-surface-container-lowest text-tertiary text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">check_circle</span>موثق
            </span>
          </div>
          <div class="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
            <div class="flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px]">phone_iphone</span>
              </div>
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-secondary">رقم الجوال</span>
                <span class="font-mono text-label-md font-bold text-on-surface" dir="ltr" id="pf-phone-view">—</span>
              </div>
            </div>
            <span class="bg-surface-container-lowest text-secondary text-[11px] font-semibold px-2 py-0.5 rounded-md" id="pf-phone-state">—</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tab 2: My Bookings -->
    <section id="pf-panel-aps" class="lg:col-span-8 flex flex-col gap-space-lg hidden">
      <div class="bg-surface-container-lowest rounded-2xl p-space-lg md:p-space-xl shadow-sm">
        <div class="flex items-center justify-between pb-space-md mb-space-lg">
          <div class="flex items-center gap-space-xs">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[22px]">event_available</span>
            </div>
            <div class="flex flex-col">
              <h2 class="font-headline-sm text-headline-sm text-on-surface">آخر الحجوزات على حسابك</h2>
              <span class="font-body-sm text-body-sm text-secondary" id="pf-aps-sub">جميع الحجوزات المسجلة باسمك في منصة ميعادي</span>
            </div>
          </div>
          <a href="#appointments" class="text-primary hover:text-primary-container font-label-md text-label-md flex items-center gap-1">
            <span>عرض كل الحجوزات</span>
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          </a>
        </div>
        <div id="pf-aps-list" class="flex flex-col gap-space-xs"></div>
      </div>
    </section>

    <!-- Tab 3: Security & Notifications (aside column semantics on lg) -->
    <section id="pf-panel-sec" class="lg:col-span-12 flex flex-col lg:flex-row gap-space-lg hidden">
      <div class="lg:flex-1 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div class="flex items-center justify-between">
          <h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-primary">security</span>
            <span>الأمان وحماية الحساب</span>
          </h3>
          <span class="bg-tertiary-container/15 text-tertiary text-[11px] font-bold px-2 py-0.5 rounded-md">بريد موثق</span>
        </div>
        <div id="pf-sessions" class="flex flex-col gap-space-sm"></div>
        <form id="pf-pass-form" class="hidden flex flex-col gap-space-xs mt-space-xs bg-surface-container-low rounded-xl p-space-md">
          <span class="font-label-sm text-label-sm text-secondary">كلمة مرور جديدة (٦ أحرف على الأقل)</span>
          <input id="pf-pass-new" type="password" dir="ltr" class="w-full h-11 px-space-md rounded-lg border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-on-surface" autocomplete="new-password" />
          <span class="font-label-sm text-label-sm text-secondary">تأكيد كلمة المرور</span>
          <input id="pf-pass-confirm" type="password" dir="ltr" class="w-full h-11 px-space-md rounded-lg border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-on-surface" autocomplete="new-password" />
          <button id="pf-pass-save" class="mt-space-xs h-10 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all" type="submit">تحديث كلمة المرور</button>
        </form>
        <div class="flex items-center justify-between pt-space-xs">
          <button id="pf-pass-btn" class="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1" type="button">
            <span class="material-symbols-outlined text-[16px]">password</span>
            <span>تغيير كلمة المرور</span>
          </button>
        </div>
      </div>
      <div class="lg:w-[380px] bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col">
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-space-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-primary">tune</span>
          <span>تفضيلات التنبيهات</span>
        </h3>
        <div class="flex flex-col gap-space-md mt-space-md">
          <div class="flex items-center justify-between">
            <div class="flex flex-col pr-0">
              <span class="font-label-md text-label-md text-on-surface">تذكير المواعيد</span>
              <span class="font-body-sm text-body-sm text-secondary">تنبيه قبل موعدك على الجوال</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" data-pf-toggle="aps" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md text-on-surface">رسائل SMS للتأكيدات</span>
              <span class="font-body-sm text-body-sm text-secondary">إشعارات تأكيد الحجوزات والجلسات</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" data-pf-toggle="sms" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-label-md text-label-md text-on-surface">العروض والتحديثات</span>
              <span class="font-body-sm text-body-sm text-secondary">أخبار المنصة والتحديثات الجديدة</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" data-pf-toggle="promo" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
          <p class="font-body-sm text-body-sm text-outline text-[11px] mt-space-xs">تُحفظ هذه التفضيلات محلياً على هذا الجهاز في هذه النسخة التجريبية.</p>
        </div>
      </div>
    </section>

  </div>

  <!-- Data Protection Banner -->
  <div id="pf-banner" class="mt-space-xl p-space-lg rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
    <div class="flex items-center gap-space-md">
      <div class="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
        <span class="material-symbols-outlined text-[26px]">gavel</span>
      </div>
      <div class="flex flex-col">
        <span class="font-label-lg text-label-lg text-on-surface font-bold">حماية بياناتك الشخصية</span>
        <p class="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
          بيانات ملفك محفوظة ومشفّرة عبر بنية Supabase، ولا تُستخدم إلا لإدارة مواعيدك وسجلات حجوزك داخل المنصة.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-space-sm shrink-0">
      <div class="px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
        <span class="material-symbols-outlined text-[16px] text-tertiary">check</span>
        <span>وصول مقيد بصلاحيات الحساب</span>
      </div>
      <div class="px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
        <span class="material-symbols-outlined text-[16px] text-primary">lock</span>
        <span>تشفيرTLS 256-bit</span>
      </div>
    </div>
  </div>

  </div><!-- /pf-main -->

  <!-- Logged-out prompt -->
  <div id="pf-guest" class="hidden bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm text-center max-w-lg mx-auto mt-space-xl">
    <div class="w-24 h-24 rounded-3xl bg-primary/10 text-primary grid place-items-center mx-auto mb-space-md">
      <span class="material-symbols-outlined text-[46px]">person</span>
    </div>
    <h1 class="font-headline-lg text-headline-lg font-bold tracking-tight">مرحباً بك في ميعادي</h1>
    <p class="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">سجّل الدخول للوصول إلى ملفك ومواعيدك وبياناتك.</p>
    <button id="pf-open-auth" class="w-full h-12 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all">تسجيل الدخول / إنشاء حساب</button>
  </div>

</div>`;
