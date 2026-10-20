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
<span class="bg-primary/10 text-primary px-space-sm py-0.5 rounded-full font-label-sm text-label-sm" id="bk-file-no">هوية مريض رقم 9841-KSA</span>
</div>
<div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full">
<span class="material-symbols-outlined text-tertiary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified_user</span>
<span class="font-label-sm text-label-sm text-on-surface">متزامن بالكامل مع منصة صحتي (Sehhaty) ومجلس الضمان الصحي</span>
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
<button class="booking-tab active flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm transition-all duration-200" id="tab-upcoming" onclick="switchBookingTab('upcoming')">
<span class="material-symbols-outlined text-[18px]">event_available</span>
<span>المواعيد القادمة</span>
<span class="bg-primary text-on-primary rounded-full px-2 py-0.5 text-[11px] font-bold mr-1" id="bk-count-upcoming">2</span>
</button>
<button class="booking-tab flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md text-secondary hover:text-on-surface transition-all duration-200" id="tab-past" onclick="switchBookingTab('past')">
<span class="material-symbols-outlined text-[18px]">history</span>
<span>الاستشارات السابقة</span>
<span class="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-[11px] mr-1" id="bk-count-past">8</span>
</button>
<button class="booking-tab col-span-2 sm:col-span-1 flex items-center justify-center gap-space-xs px-space-sm lg:px-space-lg py-2.5 min-h-11 rounded-xl font-label-md text-label-md text-secondary hover:text-on-surface transition-all duration-200" id="tab-cancelled" onclick="switchBookingTab('cancelled')">
<span class="material-symbols-outlined text-[18px]">event_busy</span>
<span>المواعيد الملغاة</span>
<span class="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-[11px] mr-1" id="bk-count-cancelled">1</span>
</button>
</div>
</div>
<!-- Active Tab: Upcoming Content Layout Grid -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-xl" id="view-upcoming">
<div class="hidden xl:col-span-12" id="bk-empty"></div>
<!-- Center & Left: Smart Pass Card & Second Appointment (8 Cols) -->
<div class="xl:col-span-8 flex flex-col gap-space-xl" id="bk-col-main">
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
<span class="font-body-sm text-body-sm text-surface-dim font-mono tracking-wider" id="bk-pass-ref">رمز الحجز: MIA-#89421</span>
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
<span class="font-headline-sm text-headline-sm text-on-surface font-bold" id="bk-pass-doctor">د. طارق المنصور</span>
<span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<span class="font-label-md text-label-md text-primary font-semibold mt-0.5" id="bk-pass-specialty">استشاري أول أمراض القلب والقسطرة التداخلية</span>
<div class="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm mt-1">
<span class="material-symbols-outlined text-[16px] text-outline">domain</span>
<span id="bk-pass-hospital">مستشفى رويال كير الدولي - الخرطوم</span>
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
                        <span id="bk-pass-date">غداً، 15 أكتوبر 2024</span>
                      </div>
<div class="font-body-md text-body-md text-primary font-semibold mt-0.5">
                        <span id="bk-pass-time">10:15 صباحاً</span> <span class="text-secondary font-normal" id="bk-pass-window">(نافذة رقم 3)</span>
</div>
</div>
<div class="bg-surface-container-low p-space-md rounded-2xl">
<div class="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm mb-1">
<span class="material-symbols-outlined text-[18px] text-tertiary">apartment</span>
<span>مقر العيادة والغرفة</span>
</div>
<div class="font-label-lg text-label-lg text-on-surface font-bold">
                        <span id="bk-pass-building">المبنى الرئيسي - البرج الطبي (A)</span>
                      </div>
<div class="font-body-md text-body-md text-secondary mt-0.5">
                        <span id="bk-pass-room">الطابق الثالث • عيادة كشف 304</span>
                      </div>
</div>
</div>
</div>
<!-- Live Clinic Proximity & Parking Card -->
<div class="bg-surface-container p-space-md rounded-2xl flex items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm flex-shrink-0">
<span class="material-symbols-outlined text-[26px]">navigation</span>
</div>
<div>
<div class="flex items-center gap-space-xs">
<span class="font-label-md text-label-md text-on-surface font-bold">زمن الوصول المقدر الآن: 12 دقيقة</span>
<span class="bg-tertiary/10 text-tertiary text-[11px] px-2 py-0.5 rounded-full font-bold">حركة السير ممتازة</span>
</div>
<p class="font-body-sm text-body-sm text-secondary mt-0.5">مواقف الزوار الشمالية (P2) متاحة مجاناً لحاملي تذكرة ميعادي.</p>
</div>
</div>
<button class="px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full transition-colors flex items-center gap-1 shadow-sm flex-shrink-0" id="bk-nav">
<span class="material-symbols-outlined text-[16px]">directions_car</span>
<span>الملاحة الحية</span>
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
<!-- High-definition simulated QR Code container with optical markers -->
<div class="p-3 bg-surface-container-lowest rounded-2xl shadow-md my-space-xs flex flex-col items-center justify-center">
<div class="relative w-44 h-44 bg-surface-container-lowest flex items-center justify-center rounded-xl p-2 overflow-hidden">
<!-- Crisp custom SVG medical styled QR pass code -->
<svg class="w-full h-full text-on-surface" fill="currentColor" viewbox="0 0 160 160">
<!-- Position Corner Squares Top-Right -->
<rect fill="none" height="40" rx="4" stroke="currentColor" stroke-width="8" width="40" x="10" y="10"></rect>
<rect fill="currentColor" height="16" rx="2" width="16" x="22" y="22"></rect>
<!-- Position Corner Squares Top-Left -->
<rect fill="none" height="40" rx="4" stroke="currentColor" stroke-width="8" width="40" x="110" y="10"></rect>
<rect fill="currentColor" height="16" rx="2" width="16" x="122" y="22"></rect>
<!-- Position Corner Squares Bottom-Right -->
<rect fill="none" height="40" rx="4" stroke="currentColor" stroke-width="8" width="40" x="10" y="110"></rect>
<rect fill="currentColor" height="16" rx="2" width="16" x="22" y="122"></rect>
<!-- Random authentic-looking matrix cells -->
<rect height="10" width="10" x="60" y="12"></rect>
<rect height="10" width="20" x="76" y="12"></rect>
<rect height="8" width="16" x="60" y="32"></rect>
<rect height="10" width="14" x="84" y="30"></rect>
<rect height="20" width="10" x="60" y="50"></rect>
<rect height="10" width="12" x="78" y="50"></rect>
<rect height="8" width="28" x="18" y="60"></rect>
<rect height="16" width="14" x="12" y="80"></rect>
<rect height="12" width="14" x="36" y="78"></rect>
<rect height="10" width="28" x="115" y="60"></rect>
<rect height="18" width="18" x="130" y="78"></rect>
<rect height="8" width="16" x="105" y="88"></rect>
<!-- Center Hospital Emblem Insignia -->
<circle class="text-primary" cx="80" cy="80" fill="currentColor" r="14"></circle>
<path d="M80 72v16M72 80h16" stroke="#ffffff" stroke-linecap="round" stroke-width="3"></path>
<!-- Bottom Grid blocks -->
<rect height="12" width="12" x="60" y="112"></rect>
<rect height="24" width="10" x="80" y="112"></rect>
<rect height="10" width="20" x="100" y="110"></rect>
<rect height="20" width="16" x="130" y="120"></rect>
<rect height="10" width="14" x="60" y="138"></rect>
<rect height="16" width="16" x="104" y="132"></rect>
</svg>
</div>
<span class="font-mono text-[11px] text-secondary tracking-widest mt-2 uppercase font-semibold" id="bk-pass-token">TOKEN: 49B8-00C7-MIAADI</span>
</div>
<div class="mt-space-xs">
<p class="font-body-sm text-body-sm text-on-surface font-semibold">امسح الرمز لتسجيل الوصول الفوري</p>
<p class="font-body-sm text-body-sm text-secondary">عبر أجهزة الخدمة الذاتية بالعيادة دون مراجعة الاستقبال</p>
</div>
<div class="mt-space-md w-full flex items-center justify-center gap-space-xs bg-surface-container px-space-sm py-1.5 rounded-xl text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
<span id="bk-pass-paid">تم سداد رسوم الاستشارة مسبقاً (0 ج.س - تأمين VIP)</span>
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
<!-- Integrated Live Clinic Map Component (Contextual Awareness) -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">explore</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">الخريطة التفاعلية للمركز الطبي ومواقف السيارات</h3>
</div>
<span class="font-body-sm text-body-sm text-secondary" id="bk-map-address">شارع الجامعة، حي أمبات، الخرطوم</span>
</div>
<div class="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner">
<div class="w-full h-full bg-cover bg-center" id="bk-map-bg" data-location="المستشفى، الخرطوم، السودان" style="background-image: linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-container-highest) 60%, var(--color-surface-container-high) 100%)"></div>
<!-- Floating overlay with transit instruction -->
<div class="absolute bottom-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-md flex items-center gap-space-md text-on-surface">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
<span class="font-label-sm text-label-sm font-bold">البوابة الرئيسية رقم 4</span>
</div>
<span class="text-outline-variant">|</span>
<span class="font-body-sm text-body-sm text-secondary">خدمة إيقاف السيارات (Valet) متوفرة</span>
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
<span class="font-label-sm text-label-sm text-secondary font-mono" id="bk-secondary-note">1 متبقي هذا الشهر</span>
</div>
<!-- Secondary Card (Dental / Pediatric Care) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all" id="bk-secondary-card">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="flex items-start gap-space-md">
<img class="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" data-alt="Saudi female pediatric dentist Dr. Sarah Al-Otaibi with friendly expression wearing clinical scrubs and pediatric dental mirror pin in clean pastel-toned dental pediatric clinic, soft bright lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsqLYbNlf0by4P1tY-d5JLROKckMBUXzM5CWcgYRv0qAAgdRfeg40lpHbL0_YuFJa7h909idZVjCADfKmg0qtG8Kgt10nKXILPl6dWk6JujviLpI_o_jxc4Tkou8ZaNWN5Hpe3UHcn9nJjwo9iAGrRSAOydquzHqTLjzQrxBXVf7jzD02IDekv7lAOiZ_5ydUDNF8GXKdGAUfqkjAu1JcypDvXXfP8YfDsXCsAO6B-IkFMKwp53udf"/>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">د. سارة العتيبي</span>
<span class="bg-secondary-container/40 text-on-secondary-container text-[11px] px-2 py-0.5 rounded-md font-semibold">طب أسنان الأطفال</span>
</div>
<div class="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm mt-1">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span>مركز الميدان الطبي التخصصي - فرع أمبات</span>
</div>
<div class="flex items-center gap-space-md text-on-surface font-label-md text-label-md mt-2 flex-wrap">
<span class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-[16px]">calendar_month</span>
                      24 أكتوبر 2024
                    </span>
<span class="flex items-center gap-1 text-secondary">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                      04:00 مساءً
                    </span>
<span class="font-mono text-outline text-[12px]">MIA-#91024</span>
</div>
</div>
</div>
<!-- Quick Action Pills -->
<div class="flex items-center gap-space-sm self-end md:self-center flex-shrink-0">
<button class="px-space-md py-space-xs bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md rounded-full transition-all shadow-sm flex items-center gap-1" onclick="alert('عرض التذكرة الذكية لعيادة الأسنان')">
<span class="material-symbols-outlined text-[16px]">confirmation_number</span>
<span>عرض التذكرة</span>
</button>
<button class="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" onclick="rescheduleBooking('MIA-91024')" title="إعادة الجدولة">
<span class="material-symbols-outlined text-[18px]">edit_calendar</span>
</button>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Patient Documents & Telehealth Quick Services (4 Cols) -->
<div class="xl:col-span-4 flex flex-col gap-space-lg" id="bk-col-side">
<!-- Live Telehealth Waiting Room Card -->
<div class="bg-gradient-to-br from-primary via-primary-container to-surface-tint text-on-primary rounded-3xl p-space-lg shadow-lg relative overflow-hidden">
<div class="absolute -bottom-8 -right-8 w-32 h-32 bg-on-primary/10 rounded-full blur-xl pointer-events-none"></div>
<div class="flex items-center justify-between mb-space-md">
<span class="bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
              خدمة 24/7
            </span>
<span class="material-symbols-outlined text-[24px] opacity-80">video_camera_front</span>
</div>
<h3 class="font-headline-sm text-headline-sm font-bold mb-space-xs">العيادات الافتراضية والمرئية</h3>
<p class="font-body-sm text-body-sm opacity-90 mb-space-md leading-relaxed">
            هل تحتاج إلى مشورة فورية سريعة قبل موعدك الغد؟ ادخل مباشرة إلى غرفة الاستشارة الافتراضية المعتمدة.
          </p>
<button class="w-full py-space-sm px-space-md bg-surface-container-lowest text-primary hover:bg-surface-bright rounded-full font-label-md text-label-md font-bold transition-all shadow-sm flex items-center justify-center gap-space-xs" onclick="joinTelehealthRoom()">
<span class="material-symbols-outlined text-[20px]">videocam</span>
<span>الانضمام إلى غرفة الانتظار الافتراضية</span>
</button>
</div>
<!-- Sehhatee Official Sick Leaves Integration -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm">
<div class="flex items-center gap-space-sm mb-space-md">
<div class="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">health_and_safety</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">الإجازات المرضية المعتمدة</h3>
<span class="font-label-sm text-label-sm text-secondary">ربط مباشر مع منصة صحتي (Sehhaty)</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-secondary mb-space-md">
            تصدر التقارير والإجازات المرضية فور انتهاء الاستشارة وتُعتمد برقم مرجعي حكومي ومصادقة إلكترونية.
          </p>
<div class="bg-surface-container-low p-space-md rounded-2xl mb-space-md flex items-center justify-between">
<div>
<span class="font-label-sm text-label-sm text-secondary block">آخر إجازة صادرة:</span>
<span class="font-label-md text-label-md text-on-surface font-bold" id="bk-sick-last">3 أيام استراحة (رقم #SL-908)</span>
</div>
<button class="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary flex items-center justify-center shadow-sm" onclick="alert('جاري تنزيل التقرير الطبي المعتمد بصيغة PDF')">
<span class="material-symbols-outlined text-[18px]">download</span>
</button>
</div>
<button class="w-full py-space-xs px-space-md bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded-full transition-all flex items-center justify-center gap-1.5" onclick="requestSickLeave()">
<span class="material-symbols-outlined text-[18px]">assignment_add</span>
<span>طلب تقرير إجازة جديدة</span>
</button>
</div>
<!-- E-Prescriptions & Lab Reports Hub -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-secondary-container/50 text-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]">prescriptions</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">الوصفات والتحاليل</h3>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold cursor-pointer hover:underline" id="bk-rx-count">عرض الكل (6)</span>
</div>
<div class="flex flex-col gap-space-sm">
<!-- Prescription Item 1 -->
<div class="p-space-md bg-surface-container-low rounded-2xl flex items-center justify-between gap-space-sm hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span class="material-symbols-outlined text-[20px]">pill</span>
</div>
<div>
<h4 class="font-label-md text-label-md text-on-surface font-bold">وصفة دوائية: Lipitor 20mg</h4>
<span class="font-body-sm text-body-sm text-secondary" id="bk-rx-doctor">د. طارق المنصور • سارية للصرف</span>
</div>
</div>
<button class="px-space-sm py-1 bg-surface-container-lowest text-primary text-[12px] font-bold rounded-lg shadow-sm hover:bg-primary hover:text-on-primary transition-all" onclick="alert('رمز وصفتي الإلكترونية: WASFATY-8841')">
                وصفتي
              </button>
</div>
<!-- Lab Result Item 2 -->
<div class="p-space-md bg-surface-container-low rounded-2xl flex items-center justify-between gap-space-sm hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-tertiary shadow-sm">
<span class="material-symbols-outlined text-[20px]">biotech</span>
</div>
<div>
<h4 class="font-label-md text-label-md text-on-surface font-bold">فحص وظائف القلب والدهون</h4>
<span class="font-body-sm text-body-sm text-secondary" id="bk-rx-lab-date">نتائج جاهزة • 28 سبتمبر 2024</span>
</div>
</div>
<button class="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm hover:bg-surface-container" onclick="alert('جاري تنزيل نتائج التحاليل المخبرية')">
<span class="material-symbols-outlined text-[16px]">file_download</span>
</button>
</div>
</div>
<!-- Insurance Pre-Authorization Badge -->
<div class="mt-space-md pt-space-md border-t border-surface-container flex items-center justify-between text-secondary font-body-sm text-body-sm">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              <span id="bk-insurance">موافقة التأمين (شيكان للتأمين): مؤكدة</span>
            </span>
<span class="font-mono text-[11px] text-outline" id="bk-insurance-ref">BUPA-VIP-994</span>
</div>
</div>
<!-- Help Support Box -->
<div class="bg-surface-container-low p-space-md rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-secondary text-[22px]">contact_support</span>
<div>
<span class="font-label-md text-label-md text-on-surface block font-semibold">هل تحتاج مساعدة في موعدك؟</span>
<span class="font-body-sm text-body-sm text-secondary">فريق خدمة المرضى متاح 24 ساعة</span>
</div>
</div>
<button class="px-space-md py-space-xs bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm rounded-full transition-all shadow-sm" onclick="alert('جاري فتح المحادثة الفورية مع المنسق الطبي')">
            محادثة
          </button>
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
<span class="text-tertiary font-bold">مكتمل (مرئي)</span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">د. لمى الزهراني</h4>
<p class="font-body-sm text-body-sm text-secondary mt-1">طب الأسرة والرعاية الوقائية</p>
<p class="font-body-sm text-body-sm text-outline mt-space-sm">استشارة مرئية عن بعد Telehealth</p>
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
<script>
  function switchBookingTab(tabKey) {
    const tabs = ['upcoming', 'past', 'cancelled'];
    tabs.forEach(key => {
      const btn = document.getElementById('tab-' + key);
      const view = document.getElementById('view-' + key);
      if (btn && view) {
        if (key === tabKey) {
          btn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
          btn.classList.remove('text-secondary');
          view.classList.remove('hidden');
          view.classList.add('flex');
        } else {
          btn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
          btn.classList.add('text-secondary');
          view.classList.add('hidden');
          view.classList.remove('flex');
        }
      }
    });
  }

  function addToCalendar() {
    const title = encodeURIComponent("موعد طبي: د. طارق المنصور - استشاري أمراض القلب");
    const details = encodeURIComponent("مستشفى رويال كير الدولي، الطابق الثالث عيادة 304. رمز الحجز MIA-#89421");
    const location = encodeURIComponent("Royal Care International Hospital, Khartoum");
    const googleCalUrl = \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${title}&details=\${details}&location=\${location}&dates=20241015T071500Z/20241015T080000Z\`;
    window.open(googleCalUrl, '_blank');
  }

  function openClinicDirections() {
    window.open('https://maps.google.com/?q=Royal+Care+International+Hospital+Khartoum', '_blank');
  }

  function openMapNavigation() {
    window.open('https://maps.google.com/?q=Royal+Care+International+Hospital+Khartoum', '_blank');
  }

  function rescheduleBooking(bookingId) {
    alert('إعادة جدولة الموعد ' + bookingId + ': سيتم تحويلك إلى نافذة اختيار الأوقات المتاحة للدكتور.');
  }

  function cancelBooking(bookingId) {
    if (confirm('هل أنت متأكد من رغبتك في إلغاء الموعد ' + bookingId + '؟ وفقاً لسياسة الإلغاء، يمكنك الاسترداد بالكامل.')) {
      alert('تم إلغاء الموعد بنجاح وتحديث حالتك.');
      switchBookingTab('cancelled');
    }
  }

  function sharePass() {
    if (navigator.share) {
      navigator.share({
        title: 'تذكرة موعد ميعادي الذكية',
        text: 'تذكرة ميعادي الطبية - د. طارق المنصور - مستشفى رويال كير الدولي',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط التذكرة الذكية للحافظة بنجاح.');
    }
  }

  function joinTelehealthRoom() {
    alert('جاري الاتصال الآمن بغرفة الاستشارة المرئية المشفرة لميعادي...');
  }

  function requestSickLeave() {
    alert('جاري التحقق من ربط منصة صحتي (Sehhaty) لتحميل التقرير الصادر...');
  }
</script>`;
