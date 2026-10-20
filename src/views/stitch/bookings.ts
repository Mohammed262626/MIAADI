// AUTO-GENERATED from Stitch desktop design: bookings-desktop.html
export const BOOKINGS_MAIN = `<div class="flex flex-col w-full">
<div class="w-full px-margin-desktop py-space-xl">
<!-- Top Action Breadcrumb & Quick Notice -->
<div class="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
<div class="flex items-center gap-space-sm text-secondary font-label-md text-label-md">
<span class="text-on-surface">بوابة المريض الموحدة</span>
<span>/</span>
<span class="text-primary font-bold">إدارة الزيارات وتذكرة الموعد</span>
<span class="mx-space-xs text-outline-variant">•</span>
<span class="bg-primary/10 text-primary px-space-sm py-0.5 rounded-full font-label-sm text-label-sm" id="bk-file-no">ملف المريض #—</span>
</div>
<div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full">
<span class="material-symbols-outlined text-tertiary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified_user</span>
<span class="font-label-sm text-label-sm text-on-surface">حجزك مؤكد ومتزامن مع جدول العيادة</span>
</div>
</div>
<!-- Main Title Banner with Segmented Tabs -->
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
<div>
<div class="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-space-xs">
<span>PORTAL MANAGEMENT</span>
<span>•</span>
<span>لوحة المتابعة الطبية</span>
</div>
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          مواعيدي وسجل الزيارات 
          <span class="font-body-lg text-body-lg text-secondary font-normal block lg:inline-block lg:mr-space-sm">| My Appointments &amp; Medical Visits</span>
</h1>
</div>
<!-- Segmented Status Tabs -->
<div class="grid grid-cols-2 sm:grid-cols-3 gap-1 bg-surface-container-high/60 p-1.5 rounded-2xl shadow-inner">
<button class="booking-tab active flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm transition-all duration-200" id="tab-upcoming" type="button" data-bk-tab="upcoming">
<span class="material-symbols-outlined text-[18px]">event_available</span>
<span>المواعيد القادمة</span>
<span class="bg-primary text-on-primary rounded-full px-2 py-0.5 text-[11px] font-bold mr-1" id="bk-count-upcoming">—</span>
</button>
<button class="booking-tab flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md text-secondary hover:text-on-surface transition-all duration-200" id="tab-past" type="button" data-bk-tab="past">
<span class="material-symbols-outlined text-[18px]">history</span>
<span>الاستشارات السابقة</span>
<span class="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-[11px] mr-1" id="bk-count-past">—</span>
</button>
<button class="booking-tab col-span-2 sm:col-span-1 flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md text-secondary hover:text-on-surface transition-all duration-200" id="tab-cancelled" type="button" data-bk-tab="cancelled">
<span class="material-symbols-outlined text-[18px]">event_busy</span>
<span>المواعيد الملغاة</span>
<span class="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-[11px] mr-1" id="bk-count-cancelled">—</span>
</button>
</div>
</div>
<!-- Active Tab: Upcoming Content Layout Grid -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-xl" id="view-upcoming">
<div class="hidden xl:col-span-12" id="bk-empty"></div>
<!-- Center & Left: Smart Pass Card & Second Appointment (8 Cols) -->
<div class="xl:col-span-12 flex flex-col gap-space-xl" id="bk-col-main">
<!-- SMART PASS: Priority Hero Component -->
<div class="relative bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl shadow-primary/5 transition-all" id="bk-pass">
<!-- Decorative subtle ambient glow -->
<div class="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
<!-- Pass Top Bar (Deep Slate Clinical Elegance) -->
<div class="bg-inverse-surface text-inverse-on-surface px-space-xl py-space-md flex flex-wrap items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined text-[24px]">qr_code_scanner</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-headline-sm tracking-wide font-bold">تذكرة الموعد الذكية</span>
<span class="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">SMART PASS</span>
</div>
<span class="font-body-sm text-body-sm text-surface-dim font-mono tracking-wider" id="bk-pass-ref">رمز الحجز: —</span>
</div>
</div>
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1.5 px-space-md py-1 bg-tertiary-container/30 text-tertiary-fixed font-label-md text-label-md rounded-full shadow-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                مؤكد • Confirmed
              </span>
<button class="w-9 h-9 rounded-full bg-surface-container-highest/20 hover:bg-surface-container-highest/40 flex items-center justify-center text-inverse-on-surface transition-colors" id="bk-share" title="مشاركة التذكرة">
<span class="material-symbols-outlined text-[18px]">share</span>
</button>
</div>
</div>
<!-- Pass Body Content -->
<div class="p-space-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-stretch">
<!-- Doctor & Hospital Dossier (7 Cols) -->
<div class="lg:col-span-7 flex flex-col justify-between">
<div>
<!-- Doctor Card Details -->
<div class="flex items-start gap-space-md mb-space-lg">
<div class="w-20 h-20 rounded-2xl shadow-md flex-shrink-0 grid place-items-center bg-gradient-to-br from-primary-container to-primary text-on-primary font-extrabold text-2xl" id="bk-pass-avatar" aria-hidden="true"></div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold" id="bk-pass-doctor">—</span>
<span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<span class="font-label-md text-label-md text-primary font-semibold mt-0.5" id="bk-pass-specialty">—</span>
<div class="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm mt-1">
<span class="material-symbols-outlined text-[16px] text-outline">domain</span>
<span id="bk-pass-hospital">—</span>
</div>
</div>
</div>
<!-- Date & Location Metrics Bento -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
<div class="bg-surface-container-low p-space-md rounded-2xl">
<div class="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm mb-1">
<span class="material-symbols-outlined text-[18px] text-primary">calendar_clock</span>
<span>تاريخ وتوقيت الكشف</span>
</div>
<div class="font-label-lg text-label-lg text-on-surface font-bold">
                        <span id="bk-pass-date">—</span>
                      </div>
<div class="font-body-md text-body-md text-primary font-semibold mt-0.5">
                        <span id="bk-pass-time">—</span> <span class="text-secondary font-normal" id="bk-pass-window"></span>
</div>
</div>
<div class="bg-surface-container-low p-space-md rounded-2xl">
<div class="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm mb-1">
<span class="material-symbols-outlined text-[18px] text-tertiary">apartment</span>
<span>مقر العيادة والغرفة</span>
</div>
<div class="font-label-lg text-label-lg text-on-surface font-bold">
                        <span id="bk-pass-building">—</span>
                      </div>
<div class="font-body-md text-body-md text-secondary mt-0.5">
                        <span id="bk-pass-room">—</span>
                      </div>
</div>
</div>
</div>
<!-- Clinic Address & Directions -->
<div class="bg-surface-container p-space-md rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm flex-shrink-0">
<span class="material-symbols-outlined text-[26px]">location_on</span>
</div>
<div>
<span class="font-label-md text-label-md text-on-surface font-bold block">عنوان العيادة</span>
<p class="font-body-sm text-body-sm text-secondary mt-0.5" id="bk-pass-address">—</p>
</div>
</div>
<button class="px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full transition-colors flex items-center gap-1 shadow-sm flex-shrink-0" id="bk-nav" type="button">
<span class="material-symbols-outlined text-[16px]">map</span>
<span>الاتجاهات</span>
</button>
</div>
</div>
<!-- Ticket Perforation Visual Line (Visible in Desktop) -->
<div class="hidden lg:flex flex-col items-center justify-between -my-space-xl relative w-0">
<div class="w-6 h-6 bg-surface rounded-full -mt-3 shadow-inner"></div>
<div class="h-full border-r-2 border-dashed border-outline-variant/60 my-2"></div>
<div class="w-6 h-6 bg-surface rounded-full -mb-3 shadow-inner"></div>
</div>
<!-- Pass QR Verification Wing (5 Cols) -->
<div class="lg:col-span-4 lg:pr-space-md flex flex-col items-center justify-between text-center bg-surface-container-low/60 p-space-lg rounded-2xl">
<div class="w-full flex justify-between items-center text-secondary font-label-sm text-label-sm mb-space-sm">
<span>التحقق الرقمي السريع</span>
<span class="font-mono text-primary font-bold">SECURE-CHECKIN</span>
</div>
<!-- Real scannable QR for the appointment reference -->
<div class="p-3 bg-surface-container-lowest rounded-2xl shadow-md my-space-xs flex flex-col items-center justify-center">
<div id="bk-pass-qr" class="relative w-44 h-44 bg-surface-container-lowest flex items-center justify-center rounded-xl p-2 overflow-hidden" role="img" aria-label="رمز الاستجابة السريعة لرقم الحجز"></div>
<span class="font-mono text-[11px] text-secondary tracking-widest mt-2 uppercase font-semibold" id="bk-pass-token">TOKEN: —</span>
</div>
<div class="mt-space-xs">
<p class="font-body-sm text-body-sm text-on-surface font-semibold">امسح الرمز لتسجيل الوصول الفوري</p>
<p class="font-body-sm text-body-sm text-secondary">عبر أجهزة الخدمة الذاتية بالعيادة دون مراجعة الاستقبال</p>
</div>
<div class="mt-space-md w-full flex items-center justify-center gap-space-xs bg-surface-container px-space-sm py-1.5 rounded-xl text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
<span id="bk-pass-paid">—</span>
</div>
</div>
</div>
</div>
<!-- Pass Action Bar -->
<div class="bg-surface-container-low px-space-xl py-space-md flex flex-wrap items-center justify-between gap-space-md">
<!-- Fast Utilities -->
<div class="flex items-center gap-space-sm flex-wrap">
<button class="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-full shadow-sm transition-all" id="bk-calendar">
<span class="material-symbols-outlined text-primary text-[18px]">calendar_add_on</span>
<span>إضافة للتقويم (Calendar)</span>
</button>
<button class="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-full shadow-sm transition-all" id="bk-directions">
<span class="material-symbols-outlined text-tertiary text-[18px]">map</span>
<span>اتجاهات المبنى والعيادة</span>
</button>
</div>
<!-- Booking Management Operations -->
<div class="flex items-center gap-space-sm">
<button class="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-label-md rounded-full transition-all" id="bk-reschedule">
                إعادة الجدولة (Reschedule)
              </button>
<button class="px-space-md py-space-xs hover:bg-error-container/40 text-error font-label-md text-label-md rounded-full transition-all" id="bk-cancel">
                إلغاء الموعد
              </button>
</div>
</div>
</div>
<!-- Secondary Bookings Section (مواعيدك الأخرى) -->
<div>
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<span class="w-2 h-6 bg-primary rounded-full"></span>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">مواعيدك الأخرى القادمة</h3>
</div>
<span class="font-label-sm text-label-sm text-secondary font-mono" id="bk-secondary-note">—</span>
</div>
<!-- Secondary Card (rendered live; see bookingsLive.ts) -->
<div id="bk-secondary-card" class="hidden"></div>
</div>
</div>
</div>
<!-- Hidden View: Past Consultations (Simulated Dynamic Content) -->
<div class="hidden flex-col gap-space-lg" id="view-past">
<div class="bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm">
<h3 class="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">سجل الزيارات الطبية السابقة المنفذة</h3>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md" id="bk-past-list">
<div class="bg-surface-container-low p-space-lg rounded-2xl flex flex-col justify-between">
<div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-space-xs">
<span>12 أغسطس 2024</span>
<span class="text-tertiary font-bold">مكتمل</span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">د. خالد الراجحي</h4>
<p class="font-body-sm text-body-sm text-secondary mt-1">استشاري جراحة العظام والمفاصل</p>
<p class="font-body-sm text-body-sm text-outline mt-space-sm">مستشفى الدكتور سليمان الحبيب - الريان</p>
</div>
<div class="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
<button class="text-primary font-label-sm text-label-sm font-bold hover:underline">عرض التقرير الطبي</button>
<button class="text-secondary font-label-sm text-label-sm hover:underline">حجز مراجعة</button>
</div>
</div>
<div class="bg-surface-container-low p-space-lg rounded-2xl flex flex-col justify-between">
<div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-space-xs">
<span>05 يونيو 2024</span>
<span class="text-tertiary font-bold">مكتمل</span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">د. لمى الزهراني</h4>
<p class="font-body-sm text-body-sm text-secondary mt-1">طب الأسرة والرعاية الوقائية</p>
<p class="font-body-sm text-body-sm text-outline mt-space-sm">زيارة عيادة</p>
</div>
<div class="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
<button class="text-primary font-label-sm text-label-sm font-bold hover:underline">الوصفة الطبية</button>
<button class="text-secondary font-label-sm text-label-sm hover:underline">سجل المكالمة</button>
</div>
</div>
<div class="bg-surface-container-low p-space-lg rounded-2xl flex flex-col justify-between">
<div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-space-xs">
<span>18 مارس 2024</span>
<span class="text-tertiary font-bold">مكتمل</span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">د. عبدالمحسن النعيمي</h4>
<p class="font-body-sm text-body-sm text-secondary mt-1">استشاري طب وجراحة العيون</p>
<p class="font-body-sm text-body-sm text-outline mt-space-sm">مستشفى مغربي للعيون والأسنان</p>
</div>
<div class="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
<button class="text-primary font-label-sm text-label-sm font-bold hover:underline">قياس النظر والتقرير</button>
<button class="text-secondary font-label-sm text-label-sm hover:underline">حجز مراجعة</button>
</div>
</div>
</div>
</div>
</div>
<!-- Hidden View: Cancelled Appointments -->
<div class="hidden flex-col gap-space-lg" id="view-cancelled">
<div class="bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm">
<h3 class="font-headline-md text-headline-md text-on-surface font-bold mb-space-md">المواعيد الملغاة</h3>
<div class="bg-surface-container-low p-space-lg rounded-2xl flex items-center justify-between" id="bk-cancelled-list">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
<span class="material-symbols-outlined text-[24px]">event_busy</span>
</div>
<div>
<span class="font-label-sm text-label-sm text-error font-bold">ألغي في 10 سبتمبر 2024 بناءً على طلب المريض</span>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">د. فهد الشمري • أنف وأذن وحنجرة</h4>
<p class="font-body-sm text-body-sm text-secondary">مستشفى النور التخصصي - الخرطوم</p>
</div>
</div>
<button class="px-space-md py-space-xs bg-primary text-on-primary font-label-md text-label-md rounded-full shadow-sm" onclick="alert('جاري نقلك لصفحة الطبيب لإعادة الحجز')">
            إعادة الحجز الآن
          </button>
</div>
</div>
</div>
</div>
</div>
`;
