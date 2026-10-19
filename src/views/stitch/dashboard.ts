// AUTO-GENERATED from Stitch desktop design: dashboard-desktop.html
export const DASHBOARD_MAIN = `<div class="flex flex-col w-full gap-space-lg pb-space-xl">
<!-- Live Clinical Hero Header -->
<section class="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary via-primary-container to-surface-container-highest/20 p-space-lg shadow-sm">
<div class="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"></div>
<div class="absolute -bottom-20 start-1/3 w-64 h-64 rounded-full bg-tertiary-fixed/15 blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
<div class="flex flex-col gap-space-xs max-w-3xl">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm shadow-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
<span class="w-2 h-2 rounded-full bg-tertiary-container"></span>
<span>العيادة نشطة الآن • Clinic Active (Suite 304)</span>
</span>
<span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest/80 text-secondary font-label-sm text-label-sm shadow-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">verified</span>
<span>بوابة نفيس NPHIES متصلة 100%</span>
</span>
</div>
<div class="mt-space-xs">
<h1 class="font-display-lg text-display-lg text-on-primary font-bold tracking-tight">
            مرحباً، د. طارق المنصور
          </h1>
<p class="font-headline-sm text-headline-sm text-primary-fixed font-medium mt-1">
            استشاري أمراض القلب والقسطرة التداخلية • Senior Interventional Cardiologist
          </p>
</div>
<div class="flex flex-wrap items-center gap-space-md pt-space-xs text-on-primary/80 font-body-md text-body-md">
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
<span>الثلاثاء، 24 أكتوبر 2024 (21 ربيع الآخر 1446)</span>
</span>
<span>•</span>
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">timer</span>
<span>معدل الالتزام بالمواعيد: <strong class="text-on-primary font-label-md text-label-md">94% في الموعد</strong></span>
</span>
<span>•</span>
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">nest_clock_farsight_analog</span>
<span>جلسة اليوم: 08:30 ص - 03:30 م</span>
</span>
</div>
</div>
<!-- Action Cluster -->
<div class="flex flex-wrap sm:flex-nowrap items-center gap-space-sm">
<button class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all active:scale-98" type="button">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">stethoscope</span>
<span>بدء الكشف الحالي</span>
</button>
<button class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-full bg-primary-container/70 text-on-primary-container font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all active:scale-98" type="button">
<span class="material-symbols-outlined text-[18px]">alarm_add</span>
<span>استدعاء طارئ</span>
</button>
<button class="p-3 rounded-full bg-surface-container-lowest/15 text-on-primary hover:bg-surface-container-lowest/25 transition-all" title="تعديل جدول الدوام والإجازات" type="button">
<span class="material-symbols-outlined text-[20px]">more_time</span>
</button>
</div>
</div>
</section>
<!-- Key Clinical KPIs (4-Column Bento Metrics) -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
<!-- Stat 1: Total Appointments -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[22px]">calendar_month</span>
</div>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
<span>+12% عن الأسبوع الماضي</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">إجمالي مواعيد اليوم • Today's Agenda</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">18</span>
<span class="font-body-md text-body-md text-secondary">مريضاً مسجلاً</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-primary"></span> 12 حضوري عيادة
        </span>
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-secondary"></span> 6 استشارة مرئية
        </span>
</div>
</div>
<!-- Stat 2: In Waiting Room -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
<span class="material-symbols-outlined text-[22px]">airline_seat_recline_normal</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
<span>انتظار حي</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">في صالة الانتظار • In Waiting Lounge</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">4</span>
<span class="font-body-md text-body-md text-secondary">حضروا وسجلوا وصولهم</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-on-surface-variant">متوسط زمن الانتظار:</span>
<span class="font-label-sm text-label-sm text-primary font-bold">8 دقائق (سريع Triage)</span>
</div>
</div>
<!-- Stat 3: Completed Consultations with Ring Progress -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[22px]">check_circle</span>
</div>
<span class="font-label-sm text-label-sm text-secondary font-semibold">نسبة الإنجاز 50%</span>
</div>
<div class="flex items-center justify-between">
<div>
<span class="font-body-sm text-body-sm text-secondary">الاستشارات المكتملة • Completed</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">9</span>
<span class="font-headline-sm text-headline-sm text-secondary">/ 18</span>
</div>
</div>
<div class="relative w-12 h-12 flex items-center justify-center">
<svg class="w-12 h-12 transform -rotate-90" viewbox="0 0 36 36">
<path class="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
<path class="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="50, 100" stroke-linecap="round" stroke-width="3.5"></path>
</svg>
<span class="absolute font-label-sm text-label-sm font-bold text-primary">50%</span>
</div>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
<div class="bg-primary h-2 rounded-full" style="width: 50%;"></div>
</div>
</div>
<!-- Stat 4: Revenue & Insurance Approval -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
<span class="material-symbols-outlined text-[22px]">payments</span>
</div>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
<span>CCHI معتمد</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">مطالبات اليوم المقبولة • Revenue</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-primary">5,850</span>
<span class="font-label-md text-label-md text-secondary">ج.س (SDG)</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">shield</span> 92% شيكان وأتلاف
        </span>
<span class="font-label-sm text-label-sm text-secondary">صفر مطالبات مرفوضة</span>
</div>
</div>
</section>
<!-- Main Content Layout (2/3 Agenda Stream & 1/3 Side Triage / Tools) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<!-- LEFT 8 COLS: Today's Interactive Appointment Stream -->
<section class="lg:col-span-8 flex flex-col gap-space-md">
<!-- Agenda Header & Navigation Filters -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined text-[20px]">view_timeline</span>
</div>
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              جدول الحالات والمواعيد المباشرة
            </h2>
<p class="font-body-sm text-body-sm text-secondary">
              سير المرضى بالعيادة والاستشارات الافتراضية • Live Patient Stream
            </p>
</div>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl overflow-x-auto">
<button class="px-space-sm py-1 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold shadow-xs whitespace-nowrap" type="button">الكل (18)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">العيادة (12)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">عن بعد (6)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">الانتظار (4)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">مكتمل (9)</button>
</div>
</div>
<!-- Live Active Card: CURRENT PATIENT IN CONSULTATION -->
<div class="relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-md overflow-hidden">
<!-- Visual Active Indicator Accent -->
<div class="absolute top-0 start-0 w-2.5 h-full bg-primary"></div>
<div class="ps-space-sm flex flex-col gap-space-md">
<!-- Top Tag Bar -->
<div class="flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
<span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
<span>قيد الكشف الآن • Current Consultation</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[15px]">verified_user</span>
<span>شيكان الذهبي • Sheikan Gold #4492</span>
</span>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full">
<span class="material-symbols-outlined text-primary text-[18px]">timelapse</span>
<span class="font-label-sm text-label-sm text-on-surface">10:15 ص - 10:45 ص</span>
<span class="font-label-sm text-label-sm text-error font-bold">(متبقي 12 دقيقة)</span>
</div>
</div>
<!-- Patient Identity Block -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low/70 rounded-xl p-space-md">
<div class="flex items-center gap-space-md">
<div class="w-16 h-16 rounded-2xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-primary shadow-xs">
<span class="material-symbols-outlined text-[32px]">person</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-sm flex-wrap">
<h3 class="font-headline-md text-headline-md font-bold text-on-surface">
                    عبدالله السالم (Abdullah Al-Salem)
                  </h3>
<span class="px-2 py-0.5 rounded-md bg-surface-container-highest text-secondary font-label-sm text-label-sm">54 سنة • ذكر</span>
<span class="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">ملف: MIA-89421</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-1">
                  تشخيص الحالة: <strong class="text-on-surface font-label-md text-label-md">متابعة ما بعد القسطرة وفحص الضغط الشرياني</strong> (Post-Cath &amp; Hypertension Review)
                </p>
</div>
</div>
<!-- Vitals Snippet -->
<div class="flex items-center gap-space-xs bg-surface-container-lowest p-space-sm rounded-xl shadow-xs self-start md:self-auto">
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">ضغط الدم BP</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">128/82</span>
</div>
<span class="text-outline-variant">|</span>
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">النبض HR</span>
<span class="font-label-lg text-label-lg font-bold text-tertiary">74 bpm</span>
</div>
<span class="text-outline-variant">|</span>
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">الأكسجين SpO2</span>
<span class="font-label-lg text-label-lg font-bold text-primary">98%</span>
</div>
</div>
</div>
<!-- Doctor Quick Action Buttons for Active Patient -->
<div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div class="flex flex-wrap items-center gap-space-xs">
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-xs hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">medical_information</span>
<span>فتح الملف الطبي EMR كامل</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px] text-primary">prescriptions</span>
<span>كتابة وصفة إلكترونية (وصفتي)</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary">ecg_heart</span>
<span>طلب تخطيط قلب فوري ECG</span>
</button>
</div>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-on-surface text-surface-container-lowest font-label-md text-label-md hover:bg-inverse-surface transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">check</span>
<span>إنهاء الكشف وإصدار التقرير</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: NEXT IN WAITING ROOM -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">arrow_forward</span>
<span>التالي بالدور • Next in Queue</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">qr_code_scanner</span>
<span>وصول مؤكد عبر البوابة الذكية Smart Pass</span>
</span>
</div>
<span class="font-label-md text-label-md font-bold text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span>10:45 ص (خلال 12 دقيقة)</span>
</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container-low flex-shrink-0 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[24px]">female</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                  نورة الخالدي (Noura Al-Khaledi)
                </h4>
<span class="text-secondary font-label-sm text-label-sm">42 سنة • ملف: MIA-74190</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-0.5">
                استشارة خفقان وعدم انتظام ضربات القلب (Arrhythmia Consultation) • تأمين أتلاف كلاسيك
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">campaign</span>
<span>مناداة المريضة للعيادة (غرفة 304)</span>
</button>
<button class="p-2 rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-all" title="معاينة الملف" type="button">
<span class="material-symbols-outlined text-[20px]">folder_open</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: TELEHEALTH CONSULTATION (Virtual) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">videocam</span>
<span>استشارة مرئية عن بعد • Telehealth Call</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
<span>المريض متصل وفي غرفة الانتظار الافتراضية</span>
</span>
</div>
<span class="font-label-md text-label-md font-bold text-secondary flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span>11:15 ص (الموعد التالي)</span>
</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-secondary-container flex-shrink-0 flex items-center justify-center text-on-secondary-fixed">
<span class="material-symbols-outlined text-[24px]">video_camera_front</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                  فهد العتيبي (Fahd Al-Otaibi)
                </h4>
<span class="text-secondary font-label-sm text-label-sm">61 سنة • بورتسودان (عن بعد)</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-0.5">
                مراجعة قراءات هولتر ومستوى الكوليسترول • ملف: MIA-62019
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">video_call</span>
<span>دخول المكالمة الطبية</span>
</button>
<button class="p-2 rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-all" title="إرسال تذكير SMS" type="button">
<span class="material-symbols-outlined text-[20px]">sms</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: COMPLETED CONSULTATION -->
<div class="bg-surface-container-low rounded-2xl p-space-md shadow-xs opacity-90 flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
<span>تم الكشف وإغلاق الملف • Completed</span>
</span>
<span class="font-label-sm text-label-sm text-secondary">09:30 ص - 10:00 ص</span>
</div>
<span class="font-label-sm text-label-sm text-tertiary font-semibold">فاتورة وصفتي ومطالبة NPHIES مسددة</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-10 h-10 rounded-xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-outline">
<span class="material-symbols-outlined text-[20px]">check</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-label-lg text-label-lg font-bold text-on-surface">
                  مريم الشريف (Maryam Al-Sharif)
                </h4>
<span class="text-secondary font-body-sm text-body-sm">38 سنة • فحص دهون دوري</span>
</div>
<p class="font-body-sm text-body-sm text-secondary">
                تم صرف العلاج عبر صيدلية الدواء • تقرير منصة صحتي مرسل للمريض بنجاح
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:text-on-surface font-label-sm text-label-sm shadow-xs" type="button">
              عرض ملخص الزيارة
            </button>
<button class="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:text-primary-container font-label-sm text-label-sm shadow-xs" type="button">
              الوصفة الصادرة
            </button>
</div>
</div>
</div>
</section>
<!-- RIGHT 4 COLS: Waiting Room Flow, Fast Clinical Actions, NPHIES Claims -->
<aside class="lg:col-span-4 flex flex-col gap-space-md">
<!-- Live Waiting Room Queue Widget -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
              صالة الانتظار المباشرة (4)
            </h3>
</div>
<span class="font-label-sm text-label-sm text-secondary">طابق 3 • صالة أ</span>
</div>
<p class="font-body-sm text-body-sm text-secondary">
          المرضى الموجودون حالياً بالصالة ومصنفين حسب أولوية الفرز السريع:
        </p>
<div class="flex flex-col gap-space-xs mt-space-xs">
<!-- Queue item 1 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm flex items-center justify-center font-bold">1</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">نورة الخالدي</span>
<span class="font-body-sm text-body-sm text-secondary">وصلت قبل 12 دقيقة</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">عادي • جاهز</span>
</div>
<!-- Queue item 2 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">2</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">سعود بن عبدالعزيز</span>
<span class="font-body-sm text-body-sm text-secondary">وصل قبل 8 دقائق</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">أولوية (ألم صدر)</span>
</div>
<!-- Queue item 3 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">3</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">خلود الشمري</span>
<span class="font-body-sm text-body-sm text-secondary">وصلت قبل 4 دقائق</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">فحص روتيني</span>
</div>
<!-- Queue item 4 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">4</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">ماجد الدوسري</span>
<span class="font-body-sm text-body-sm text-secondary">وصل للتو (0 دقيقة)</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">تسجيل دخول</span>
</div>
</div>
<button class="w-full py-2 mt-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors" type="button">
          عرض شاشة الاستقبال وصالة الانتظار التفاعلية
        </button>
</div>
<!-- Clinical Quick Tools (Action Pad) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
          أدوات الطبيب السريعة • Quick Orders
        </h3>
<p class="font-body-sm text-body-sm text-secondary">
          إصدار فوري معتمد ومربوط مع المنصات الصحية الوطنية:
        </p>
<div class="grid grid-cols-2 gap-space-xs mt-space-xs">
<!-- Action 1 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">prescriptions</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">وصفة وصفتي</span>
<span class="font-body-sm text-body-sm text-secondary">ربط صيدليات المملكة</span>
</button>
<!-- Action 2 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">biotech</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">مختبرات وقسطرة</span>
<span class="font-body-sm text-body-sm text-secondary">طلب تحاليل عاجلة</span>
</button>
<!-- Action 3 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">event_busy</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">إجازة صحتي</span>
<span class="font-body-sm text-body-sm text-secondary">إجازة مرضية معتمدة</span>
</button>
<!-- Action 4 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">transfer_within_a_station</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">إحالة استشارية</span>
<span class="font-body-sm text-body-sm text-secondary">جراحة القلب والصدر</span>
</button>
</div>
</div>
<!-- Live Insurance & CCHI NPHIES Panel -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<div class="w-8 h-8 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[18px]">shield</span>
</div>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
              حالة التأمين CCHI / NPHIES
            </h3>
</div>
<span class="font-label-sm text-label-sm text-tertiary font-bold">نسبة قبول 98.4%</span>
</div>
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
<div class="flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">مطالبات موافق عليها فوراً</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">14 مطالبة</span>
</div>
<span class="material-symbols-outlined text-tertiary text-[24px]">verified</span>
</div>
<div class="grid grid-cols-2 gap-space-xs">
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">قيد المراجعة</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">1 مطالبة</span>
</div>
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">المرفوضة</span>
<span class="font-label-lg text-label-lg font-bold text-tertiary">0 مرفوض</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span>آخر مزامنة عبر السحابة الصحية:</span>
<span class="font-semibold text-primary">الآن مباشرة</span>
</div>
</div>
<!-- Quick Consultation Pass Card Preview -->
<div class="bg-gradient-to-br from-on-secondary-fixed to-inverse-surface rounded-2xl p-space-md text-on-secondary shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-fixed text-[20px]">badge</span>
<span class="font-label-md text-label-md text-primary-fixed font-bold">بطاقة تصريح دخول العيادة الذكية</span>
</div>
<span class="font-label-sm text-label-sm text-outline-variant">Smart Pass</span>
</div>
<p class="font-body-sm text-body-sm text-secondary-fixed-dim">
          يتم إرسال بطاقة دخول مشفرة عبر تطبيق صحتي وApple Wallet لتقليل زمن انتظار الاستقبال.
        </p>
<div class="flex items-center justify-between bg-surface-container-lowest/10 rounded-xl p-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-tertiary-fixed">qr_code_2</span>
<span class="font-label-sm text-label-sm">مسح الرمز عند البوابة رقم 4</span>
</div>
<span class="font-label-sm text-label-sm text-primary-fixed font-semibold">نشط تلقائياً</span>
</div>
</div>
</aside>
</div>
</div>`;

export const DASHBOARD_BODY = `<aside class="max-lg:hidden fixed top-0 start-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="flex flex-col"><div class="h-20 px-space-lg flex items-center justify-between"><div class="flex items-center gap-space-sm"><div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm"><span class="material-symbols-outlined text-[24px]">local_hospital</span></div><div class="flex flex-col"><div class="flex items-center gap-space-xs"><span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">ميعادي</span><span class="font-label-sm text-label-sm text-secondary font-medium">| Miaadi</span></div><span class="font-label-sm text-label-sm text-outline">المنصة الصحية الذكية</span></div></div></div><div class="px-space-md py-space-xs"><div class="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"><div class="flex items-center gap-space-sm overflow-hidden"><div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0"><span class="material-symbols-outlined text-[18px]">apartment</span></div><div class="flex flex-col truncate"><span id="db-facility-name" class="font-label-md text-label-md text-on-surface truncate">م. رويال كير الدولي</span><span id="db-facility-sub" class="font-body-sm text-body-sm text-on-surface-variant truncate">عيادة القلب التخصصية</span></div></div><span class="material-symbols-outlined text-outline text-[18px] flex-shrink-0">unfold_more</span></div></div><nav class="flex flex-col gap-space-xs px-space-md mt-space-md" data-active-classes="bg-primary-container text-on-primary-container font-bold rounded-xl"><a aria-current="page" class="flex items-center justify-between px-space-md py-space-sm transition-all group bg-primary-container text-on-primary-container font-bold rounded-xl" data-path="dashboard-overview" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">dashboard</span><span class="font-label-lg text-label-lg">نظرة عامة ولوحة التحكم</span></div></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="appointments-schedule" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">calendar_clock</span><span class="font-label-lg text-label-lg">جدول المواعيد والعيادة</span></div></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="patients-emr" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">clinical_notes</span><span class="font-label-lg text-label-lg">سجلات المرضى (EMR)</span></div></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="telehealth-consultations" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">video_camera_front</span><span class="font-label-lg text-label-lg">الاستشارات الافتراضية</span></div><span id="db-nav-tele" class="px-space-xs py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-semibold">3</span></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="prescriptions-reports" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">prescriptions</span><span class="font-label-lg text-label-lg">الوصفات والتقارير</span></div></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="billing-cchi-claims" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">receipt_long</span><span class="font-label-lg text-label-lg">الفواتير والتأمين CCHI</span></div></a><a class="flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group" data-path="clinic-settings-availability" href="#"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-[20px] transition-colors">tune</span><span class="font-label-lg text-label-lg">الإعدادات وساعات العمل</span></div></a></nav></div><div class="p-space-md flex flex-col gap-space-sm"><div class="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs"><div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-outline">حالة الاتصال والخدمة</span><span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span></div><span class="font-label-md text-label-md text-on-surface font-semibold">بوابة النفيس ومعتمد موصولة</span><span id="db-sync" class="font-body-sm text-body-sm text-on-surface-variant">آخر مزامنة قبل 3 دقائق</span></div><div class="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm"><span class="flex items-center gap-space-xs"><span class="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>معتمد من وزارة الصحة</span><span>v2.4.0</span></div></div></aside><div id="db-backdrop" class="hidden fixed inset-0 z-40 bg-black/40 lg:hidden"></div><div class="pe-0 ps-0 lg:ps-72 flex flex-col min-h-screen"><header class="fixed top-0 start-0 lg:start-72 end-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-lg flex items-center justify-between gap-space-md"><button id="db-menu-btn" class="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors" type="button" aria-label="القائمة"><span class="material-symbols-outlined text-[22px]">menu</span></button><div class="flex-1 max-w-xl"><div class="relative flex items-center"><span class="material-symbols-outlined absolute start-space-md text-outline pointer-events-none text-[20px]">search</span><input class="w-full h-11 ps-11 pe-space-md rounded-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all" id="db-search" placeholder="ابحث في مواعيد اليوم باسم المريض أو رقم الجوال" type="text"/></div></div><div class="flex items-center gap-space-md flex-shrink-0"><div class="flex items-center bg-surface-container-low rounded-full p-1"><button class="px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold bg-surface-container-lowest text-on-surface shadow-sm transition-all" type="button">العربية</button><button class="px-space-sm py-1 rounded-full font-label-sm text-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-all" type="button">EN</button></div><button id="db-new-booking" class="inline-flex items-center gap-space-xs h-10 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all active:scale-98 shadow-sm" type="button"><span class="material-symbols-outlined text-[18px]">add</span><span>حجز موعد جديد</span></button><button class="relative w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[20px]">notifications</span><span id="db-bell-dot" class="absolute top-2 end-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span></button><div class="flex items-center gap-space-sm ps-space-xs cursor-pointer group"><div class="relative"><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div><span class="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-tertiary-container ring-2 ring-surface-container-lowest"></span></div><div class="hidden xl:flex flex-col items-start text-start"><div class="flex items-center gap-space-xs"><span id="db-user-name" class="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">د. طارق المنصور</span><span class="material-symbols-outlined text-outline text-[16px]">expand_more</span></div><span id="db-user-spec" class="font-body-sm text-body-sm text-on-surface-variant">استشاري أمراض وزراعة القلب</span></div></div></div></header><main class="flex-1 pt-20 px-space-lg py-space-md bg-surface"><div id="db-content" class="flex flex-col w-full gap-space-lg pb-space-xl">
<!-- Live Clinical Hero Header -->
<section class="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary via-primary-container to-surface-container-highest/20 p-space-lg shadow-sm">
<div class="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"></div>
<div class="absolute -bottom-20 start-1/3 w-64 h-64 rounded-full bg-tertiary-fixed/15 blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
<div class="flex flex-col gap-space-xs max-w-3xl">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm shadow-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
<span class="w-2 h-2 rounded-full bg-tertiary-container"></span>
<span>العيادة نشطة الآن • Clinic Active (Suite 304)</span>
</span>
<span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest/80 text-secondary font-label-sm text-label-sm shadow-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">verified</span>
<span>بوابة نفيس NPHIES متصلة 100%</span>
</span>
</div>
<div class="mt-space-xs">
<h1 class="font-display-lg text-display-lg text-on-primary font-bold tracking-tight">
            مرحباً، د. طارق المنصور
          </h1>
<p class="font-headline-sm text-headline-sm text-primary-fixed font-medium mt-1">
            استشاري أمراض القلب والقسطرة التداخلية • Senior Interventional Cardiologist
          </p>
</div>
<div class="flex flex-wrap items-center gap-space-md pt-space-xs text-on-primary/80 font-body-md text-body-md">
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
<span>الثلاثاء، 24 أكتوبر 2024 (21 ربيع الآخر 1446)</span>
</span>
<span>•</span>
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">timer</span>
<span>معدل الالتزام بالمواعيد: <strong class="text-on-primary font-label-md text-label-md">94% في الموعد</strong></span>
</span>
<span>•</span>
<span class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">nest_clock_farsight_analog</span>
<span>جلسة اليوم: 08:30 ص - 03:30 م</span>
</span>
</div>
</div>
<!-- Action Cluster -->
<div class="flex flex-wrap sm:flex-nowrap items-center gap-space-sm">
<button class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all active:scale-98" type="button">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">stethoscope</span>
<span>بدء الكشف الحالي</span>
</button>
<button class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-3 rounded-full bg-primary-container/70 text-on-primary-container font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all active:scale-98" type="button">
<span class="material-symbols-outlined text-[18px]">alarm_add</span>
<span>استدعاء طارئ</span>
</button>
<button class="p-3 rounded-full bg-surface-container-lowest/15 text-on-primary hover:bg-surface-container-lowest/25 transition-all" title="تعديل جدول الدوام والإجازات" type="button">
<span class="material-symbols-outlined text-[20px]">more_time</span>
</button>
</div>
</div>
</section>
<!-- Key Clinical KPIs (4-Column Bento Metrics) -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
<!-- Stat 1: Total Appointments -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[22px]">calendar_month</span>
</div>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
<span>+12% عن الأسبوع الماضي</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">إجمالي مواعيد اليوم • Today's Agenda</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">18</span>
<span class="font-body-md text-body-md text-secondary">مريضاً مسجلاً</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-primary"></span> 12 حضوري عيادة
        </span>
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-secondary"></span> 6 استشارة مرئية
        </span>
</div>
</div>
<!-- Stat 2: In Waiting Room -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
<span class="material-symbols-outlined text-[22px]">airline_seat_recline_normal</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
<span>انتظار حي</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">في صالة الانتظار • In Waiting Lounge</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">4</span>
<span class="font-body-md text-body-md text-secondary">حضروا وسجلوا وصولهم</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-on-surface-variant">متوسط زمن الانتظار:</span>
<span class="font-label-sm text-label-sm text-primary font-bold">8 دقائق (سريع Triage)</span>
</div>
</div>
<!-- Stat 3: Completed Consultations with Ring Progress -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[22px]">check_circle</span>
</div>
<span class="font-label-sm text-label-sm text-secondary font-semibold">نسبة الإنجاز 50%</span>
</div>
<div class="flex items-center justify-between">
<div>
<span class="font-body-sm text-body-sm text-secondary">الاستشارات المكتملة • Completed</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-on-surface">9</span>
<span class="font-headline-sm text-headline-sm text-secondary">/ 18</span>
</div>
</div>
<div class="relative w-12 h-12 flex items-center justify-center">
<svg class="w-12 h-12 transform -rotate-90" viewbox="0 0 36 36">
<path class="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
<path class="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="50, 100" stroke-linecap="round" stroke-width="3.5"></path>
</svg>
<span class="absolute font-label-sm text-label-sm font-bold text-primary">50%</span>
</div>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
<div class="bg-primary h-2 rounded-full" style="width: 50%;"></div>
</div>
</div>
<!-- Stat 4: Revenue & Insurance Approval -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div class="flex items-center justify-between">
<div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
<span class="material-symbols-outlined text-[22px]">payments</span>
</div>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
<span>CCHI معتمد</span>
</span>
</div>
<div>
<span class="font-body-sm text-body-sm text-secondary">مطالبات اليوم المقبولة • Revenue</span>
<div class="flex items-baseline gap-space-xs mt-1">
<span class="font-display-lg text-display-lg font-bold text-primary">5,850</span>
<span class="font-label-md text-label-md text-secondary">ج.س (SDG)</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs bg-surface-container-low rounded-xl px-space-sm py-1.5">
<span class="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">shield</span> 92% شيكان وأتلاف
        </span>
<span class="font-label-sm text-label-sm text-secondary">صفر مطالبات مرفوضة</span>
</div>
</div>
</section>
<!-- Main Content Layout (2/3 Agenda Stream & 1/3 Side Triage / Tools) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<!-- LEFT 8 COLS: Today's Interactive Appointment Stream -->
<section class="lg:col-span-8 flex flex-col gap-space-md">
<!-- Agenda Header & Navigation Filters -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined text-[20px]">view_timeline</span>
</div>
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              جدول الحالات والمواعيد المباشرة
            </h2>
<p class="font-body-sm text-body-sm text-secondary">
              سير المرضى بالعيادة والاستشارات الافتراضية • Live Patient Stream
            </p>
</div>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl overflow-x-auto">
<button class="px-space-sm py-1 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold shadow-xs whitespace-nowrap" type="button">الكل (18)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">العيادة (12)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">عن بعد (6)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">الانتظار (4)</button>
<button class="px-space-sm py-1 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap" type="button">مكتمل (9)</button>
</div>
</div>
<!-- Live Active Card: CURRENT PATIENT IN CONSULTATION -->
<div class="relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-md overflow-hidden">
<!-- Visual Active Indicator Accent -->
<div class="absolute top-0 start-0 w-2.5 h-full bg-primary"></div>
<div class="ps-space-sm flex flex-col gap-space-md">
<!-- Top Tag Bar -->
<div class="flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
<span class="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
<span>قيد الكشف الآن • Current Consultation</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[15px]">verified_user</span>
<span>شيكان الذهبي • Sheikan Gold #4492</span>
</span>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full">
<span class="material-symbols-outlined text-primary text-[18px]">timelapse</span>
<span class="font-label-sm text-label-sm text-on-surface">10:15 ص - 10:45 ص</span>
<span class="font-label-sm text-label-sm text-error font-bold">(متبقي 12 دقيقة)</span>
</div>
</div>
<!-- Patient Identity Block -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low/70 rounded-xl p-space-md">
<div class="flex items-center gap-space-md">
<div class="w-16 h-16 rounded-2xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-primary shadow-xs">
<span class="material-symbols-outlined text-[32px]">person</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-sm flex-wrap">
<h3 class="font-headline-md text-headline-md font-bold text-on-surface">
                    عبدالله السالم (Abdullah Al-Salem)
                  </h3>
<span class="px-2 py-0.5 rounded-md bg-surface-container-highest text-secondary font-label-sm text-label-sm">54 سنة • ذكر</span>
<span class="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">ملف: MIA-89421</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-1">
                  تشخيص الحالة: <strong class="text-on-surface font-label-md text-label-md">متابعة ما بعد القسطرة وفحص الضغط الشرياني</strong> (Post-Cath &amp; Hypertension Review)
                </p>
</div>
</div>
<!-- Vitals Snippet -->
<div class="flex items-center gap-space-xs bg-surface-container-lowest p-space-sm rounded-xl shadow-xs self-start md:self-auto">
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">ضغط الدم BP</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">128/82</span>
</div>
<span class="text-outline-variant">|</span>
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">النبض HR</span>
<span class="font-label-lg text-label-lg font-bold text-tertiary">74 bpm</span>
</div>
<span class="text-outline-variant">|</span>
<div class="flex flex-col text-center px-2">
<span class="font-label-sm text-label-sm text-secondary">الأكسجين SpO2</span>
<span class="font-label-lg text-label-lg font-bold text-primary">98%</span>
</div>
</div>
</div>
<!-- Doctor Quick Action Buttons for Active Patient -->
<div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div class="flex flex-wrap items-center gap-space-xs">
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-xs hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">medical_information</span>
<span>فتح الملف الطبي EMR كامل</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px] text-primary">prescriptions</span>
<span>كتابة وصفة إلكترونية (وصفتي)</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary">ecg_heart</span>
<span>طلب تخطيط قلب فوري ECG</span>
</button>
</div>
<button class="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-on-surface text-surface-container-lowest font-label-md text-label-md hover:bg-inverse-surface transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">check</span>
<span>إنهاء الكشف وإصدار التقرير</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: NEXT IN WAITING ROOM -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">arrow_forward</span>
<span>التالي بالدور • Next in Queue</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">qr_code_scanner</span>
<span>وصول مؤكد عبر البوابة الذكية Smart Pass</span>
</span>
</div>
<span class="font-label-md text-label-md font-bold text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span>10:45 ص (خلال 12 دقيقة)</span>
</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container-low flex-shrink-0 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[24px]">female</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                  نورة الخالدي (Noura Al-Khaledi)
                </h4>
<span class="text-secondary font-label-sm text-label-sm">42 سنة • ملف: MIA-74190</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-0.5">
                استشارة خفقان وعدم انتظام ضربات القلب (Arrhythmia Consultation) • تأمين أتلاف كلاسيك
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">campaign</span>
<span>مناداة المريضة للعيادة (غرفة 304)</span>
</button>
<button class="p-2 rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-all" title="معاينة الملف" type="button">
<span class="material-symbols-outlined text-[20px]">folder_open</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: TELEHEALTH CONSULTATION (Virtual) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">videocam</span>
<span>استشارة مرئية عن بعد • Telehealth Call</span>
</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
<span>المريض متصل وفي غرفة الانتظار الافتراضية</span>
</span>
</div>
<span class="font-label-md text-label-md font-bold text-secondary flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span>11:15 ص (الموعد التالي)</span>
</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-secondary-container flex-shrink-0 flex items-center justify-center text-on-secondary-fixed">
<span class="material-symbols-outlined text-[24px]">video_camera_front</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                  فهد العتيبي (Fahd Al-Otaibi)
                </h4>
<span class="text-secondary font-label-sm text-label-sm">61 سنة • بورتسودان (عن بعد)</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-0.5">
                مراجعة قراءات هولتر ومستوى الكوليسترول • ملف: MIA-62019
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="inline-flex items-center gap-1 px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">video_call</span>
<span>دخول المكالمة الطبية</span>
</button>
<button class="p-2 rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-all" title="إرسال تذكير SMS" type="button">
<span class="material-symbols-outlined text-[20px]">sms</span>
</button>
</div>
</div>
</div>
<!-- Schedule Card: COMPLETED CONSULTATION -->
<div class="bg-surface-container-low rounded-2xl p-space-md shadow-xs opacity-90 flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-space-xs">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
<span>تم الكشف وإغلاق الملف • Completed</span>
</span>
<span class="font-label-sm text-label-sm text-secondary">09:30 ص - 10:00 ص</span>
</div>
<span class="font-label-sm text-label-sm text-tertiary font-semibold">فاتورة وصفتي ومطالبة NPHIES مسددة</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-10 h-10 rounded-xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-outline">
<span class="material-symbols-outlined text-[20px]">check</span>
</div>
<div>
<div class="flex items-center gap-space-sm">
<h4 class="font-label-lg text-label-lg font-bold text-on-surface">
                  مريم الشريف (Maryam Al-Sharif)
                </h4>
<span class="text-secondary font-body-sm text-body-sm">38 سنة • فحص دهون دوري</span>
</div>
<p class="font-body-sm text-body-sm text-secondary">
                تم صرف العلاج عبر صيدلية الدواء • تقرير منصة صحتي مرسل للمريض بنجاح
              </p>
</div>
</div>
<div class="flex items-center gap-space-xs">
<button class="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:text-on-surface font-label-sm text-label-sm shadow-xs" type="button">
              عرض ملخص الزيارة
            </button>
<button class="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:text-primary-container font-label-sm text-label-sm shadow-xs" type="button">
              الوصفة الصادرة
            </button>
</div>
</div>
</div>
</section>
<!-- RIGHT 4 COLS: Waiting Room Flow, Fast Clinical Actions, NPHIES Claims -->
<aside class="lg:col-span-4 flex flex-col gap-space-md">
<!-- Live Waiting Room Queue Widget -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
              صالة الانتظار المباشرة (4)
            </h3>
</div>
<span class="font-label-sm text-label-sm text-secondary">طابق 3 • صالة أ</span>
</div>
<p class="font-body-sm text-body-sm text-secondary">
          المرضى الموجودون حالياً بالصالة ومصنفين حسب أولوية الفرز السريع:
        </p>
<div class="flex flex-col gap-space-xs mt-space-xs">
<!-- Queue item 1 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm flex items-center justify-center font-bold">1</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">نورة الخالدي</span>
<span class="font-body-sm text-body-sm text-secondary">وصلت قبل 12 دقيقة</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">عادي • جاهز</span>
</div>
<!-- Queue item 2 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">2</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">سعود بن عبدالعزيز</span>
<span class="font-body-sm text-body-sm text-secondary">وصل قبل 8 دقائق</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">أولوية (ألم صدر)</span>
</div>
<!-- Queue item 3 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">3</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">خلود الشمري</span>
<span class="font-body-sm text-body-sm text-secondary">وصلت قبل 4 دقائق</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">فحص روتيني</span>
</div>
<!-- Queue item 4 -->
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-space-xs">
<span class="w-6 h-6 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">4</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">ماجد الدوسري</span>
<span class="font-body-sm text-body-sm text-secondary">وصل للتو (0 دقيقة)</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">تسجيل دخول</span>
</div>
</div>
<button class="w-full py-2 mt-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors" type="button">
          عرض شاشة الاستقبال وصالة الانتظار التفاعلية
        </button>
</div>
<!-- Clinical Quick Tools (Action Pad) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
          أدوات الطبيب السريعة • Quick Orders
        </h3>
<p class="font-body-sm text-body-sm text-secondary">
          إصدار فوري معتمد ومربوط مع المنصات الصحية الوطنية:
        </p>
<div class="grid grid-cols-2 gap-space-xs mt-space-xs">
<!-- Action 1 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">prescriptions</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">وصفة وصفتي</span>
<span class="font-body-sm text-body-sm text-secondary">ربط صيدليات المملكة</span>
</button>
<!-- Action 2 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">biotech</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">مختبرات وقسطرة</span>
<span class="font-body-sm text-body-sm text-secondary">طلب تحاليل عاجلة</span>
</button>
<!-- Action 3 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">event_busy</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">إجازة صحتي</span>
<span class="font-body-sm text-body-sm text-secondary">إجازة مرضية معتمدة</span>
</button>
<!-- Action 4 -->
<button class="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-start transition-all flex flex-col gap-1 group" type="button">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-[18px]">transfer_within_a_station</span>
</div>
<span class="font-label-md text-label-md font-semibold text-on-surface">إحالة استشارية</span>
<span class="font-body-sm text-body-sm text-secondary">جراحة القلب والصدر</span>
</button>
</div>
</div>
<!-- Live Insurance & CCHI NPHIES Panel -->
<div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<div class="w-8 h-8 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[18px]">shield</span>
</div>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">
              حالة التأمين CCHI / NPHIES
            </h3>
</div>
<span class="font-label-sm text-label-sm text-tertiary font-bold">نسبة قبول 98.4%</span>
</div>
<div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
<div class="flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">مطالبات موافق عليها فوراً</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">14 مطالبة</span>
</div>
<span class="material-symbols-outlined text-tertiary text-[24px]">verified</span>
</div>
<div class="grid grid-cols-2 gap-space-xs">
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">قيد المراجعة</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">1 مطالبة</span>
</div>
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-body-sm text-body-sm text-secondary">المرفوضة</span>
<span class="font-label-lg text-label-lg font-bold text-tertiary">0 مرفوض</span>
</div>
</div>
<div class="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span>آخر مزامنة عبر السحابة الصحية:</span>
<span class="font-semibold text-primary">الآن مباشرة</span>
</div>
</div>
<!-- Quick Consultation Pass Card Preview -->
<div class="bg-gradient-to-br from-on-secondary-fixed to-inverse-surface rounded-2xl p-space-md text-on-secondary shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-fixed text-[20px]">badge</span>
<span class="font-label-md text-label-md text-primary-fixed font-bold">بطاقة تصريح دخول العيادة الذكية</span>
</div>
<span class="font-label-sm text-label-sm text-outline-variant">Smart Pass</span>
</div>
<p class="font-body-sm text-body-sm text-secondary-fixed-dim">
          يتم إرسال بطاقة دخول مشفرة عبر تطبيق صحتي وApple Wallet لتقليل زمن انتظار الاستقبال.
        </p>
<div class="flex items-center justify-between bg-surface-container-lowest/10 rounded-xl p-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-tertiary-fixed">qr_code_2</span>
<span class="font-label-sm text-label-sm">مسح الرمز عند البوابة رقم 4</span>
</div>
<span class="font-label-sm text-label-sm text-primary-fixed font-semibold">نشط تلقائياً</span>
</div>
</div>
</aside>
</div>
</div></main><footer class="w-full bg-surface-container-lowest py-space-md px-space-lg shadow-[0_-1px_4px_rgba(0,0,0,0.02)]"><div class="w-full flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm"><div class="flex items-center gap-space-md"><span>© 2025 منصة ميعادي للرعاية الصحية. جميع الحقوق محفوظة في جمهورية السودان.</span><span class="hidden lg:inline">•</span><span class="hidden lg:inline text-tertiary font-medium">متوافق مع المجلس الطبي السوداني SMC</span></div><div class="flex items-center gap-space-md"><a class="hover:text-primary transition-colors" href="#">سياسة الخصوصية</a><a class="hover:text-primary transition-colors" href="#">شروط الاستخدام</a><a class="hover:text-primary transition-colors" href="#">الدعم الفني الطبي</a></div></div></footer></div>`;
