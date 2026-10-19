// AUTO-GENERATED from Stitch desktop design: doctorprofile-desktop.html
export const DOCTORPROFILE_MAIN = `<div class="flex flex-col w-full">
<!-- Sticky / Header Bar Sub-Navigation & Breadcrumbs -->
<section class="w-full bg-surface-container-low py-space-sm px-margin-desktop shadow-sm">
<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm">
<nav class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
<a class="hover:text-primary transition-colors flex items-center gap-1" href="#">
<span class="material-symbols-outlined text-[16px]">home</span>
<span>الرئيسية</span>
</a>
<span class="material-symbols-outlined text-[14px]">chevron_left</span>
<a class="hover:text-primary transition-colors" href="#" id="dp-crumb-spec">أمراض القلب والشرايين</a>
<span class="material-symbols-outlined text-[14px]">chevron_left</span>
<span class="text-on-surface font-semibold" id="dp-crumb-name">د. طارق المنصور</span>
</nav>
<div class="flex items-center gap-space-md">
<div class="flex items-center gap-1 bg-surface-container-lowest px-space-md py-1 rounded-full text-secondary font-label-sm text-label-sm shadow-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
<span>مقبول عبر نفاذ الوطني • Nafath Verified</span>
</div>
<button class="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" type="button">
<span class="material-symbols-outlined text-[18px]">share</span>
<span>مشاركة الملف</span>
</button>
</div>
</div>
</section>
<!-- Doctor Hero Profile Header -->
<section class="w-full bg-surface-container-lowest py-space-xl px-margin-desktop shadow-sm relative overflow-hidden">
<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"></div>
<div class="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-tertiary-fixed/15 blur-3xl pointer-events-none"></div>
<div class="max-w-7xl mx-auto relative z-10">
<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-xl">
<!-- Doctor Avatar & Identity -->
<div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
<div class="relative">
<div class="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container">
<div class="w-full h-full grid place-items-center text-[42px] font-extrabold text-on-primary bg-gradient-to-br from-primary-container to-primary" id="dp-avatar" aria-hidden="true"></div>
</div>
<div class="absolute -bottom-2 -right-2 bg-primary text-on-primary rounded-xl p-1.5 shadow-sm flex items-center justify-center" title="استشاري مرخص ومعتمد">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
</div>
<div class="flex flex-col">
<div class="flex flex-wrap items-center gap-space-xs mb-1">
<span class="bg-primary/10 text-primary font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-bold" id="dp-title-pill">
                استشاري أول معتمد • Senior Consultant
              </span>
<span class="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-space-sm py-0.5 rounded-full flex items-center gap-1 font-semibold" id="dp-availability">
<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                متاح اليوم للحجز الفوري
              </span>
</div>
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold" id="dp-name">
              د. طارق المنصور
              <span class="block font-headline-sm text-headline-sm text-secondary font-normal mt-0.5">
                Dr. Tariq Al-Mansoor, MD, FRCP
              </span>
</h1>
<p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl" id="dp-specialization">
              استشاري أمراض القلب والأوعية الدموية والقسطرة القلبية التداخلية
            </p>
<!-- Hospital Affiliation -->
<div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mt-space-sm">
<span class="material-symbols-outlined text-[20px] text-primary">domain</span>
<span class="font-semibold text-on-surface" id="dp-hospital">مستشفى رويال كير الدولي</span>
<span class="text-secondary" id="dp-hospital-city">• الخرطوم | Khartoum</span>
</div>
<!-- Credentials Badges -->
<div class="flex flex-wrap items-center gap-space-xs mt-space-sm" id="dp-credentials">
<span class="bg-surface-container px-space-sm py-1 rounded-md text-on-surface-variant font-label-sm text-label-sm">
                زمالة الكلية الملكية للأطباء (FRCP) - بريطانيا
              </span>
<span class="bg-surface-container px-space-sm py-1 rounded-md text-on-surface-variant font-label-sm text-label-sm">
                البورد السعودي في أمراض القلب التداخلية
              </span>
<span class="bg-surface-container px-space-sm py-1 rounded-md text-on-surface-variant font-label-sm text-label-sm">
                عضو الجمعية الأمريكية للقلب (AHA)
              </span>
</div>
</div>
</div>
<!-- Metric Summary Chips -->
<div class="grid grid-cols-3 gap-space-md w-full lg:w-auto bg-surface-container-low p-space-md rounded-2xl shadow-sm">
<div class="flex flex-col items-center justify-center p-space-sm bg-surface-container-lowest rounded-xl min-w-0 sm:min-w-[100px] text-center shadow-sm">
<div class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-[18px]">history</span>
<span class="font-headline-sm text-headline-sm font-bold" id="dp-exp">+15</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-1">سنة خبرة</span>
<span class="text-[10px] text-secondary">Years Exp.</span>
</div>
<div class="flex flex-col items-center justify-center p-space-sm bg-surface-container-lowest rounded-xl min-w-0 sm:min-w-[100px] text-center shadow-sm">
<div class="flex items-center gap-1 text-tertiary">
<span class="material-symbols-outlined text-[18px]">favorite</span>
<span class="font-headline-sm text-headline-sm font-bold" id="dp-cases">+3.2k</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-1">حالة متعافية</span>
<span class="text-[10px] text-secondary">Recovered</span>
</div>
<div class="flex flex-col items-center justify-center p-space-sm bg-surface-container-lowest rounded-xl min-w-0 sm:min-w-[100px] text-center shadow-sm">
<div class="flex items-center gap-1 text-[#d97706]">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline-sm text-headline-sm font-bold" id="dp-rating">4.9</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-1" id="dp-reviews-count">480 تقييماً</span>
<span class="text-[10px] text-secondary">Patient Rating</span>
</div>
</div>
</div>
</div>
</section>
<!-- Two-Column Desktop Core Content -->
<main class="w-full max-w-7xl mx-auto px-margin-desktop py-space-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- Right Column: Doctor Dossier & Clinical Information (7 Cols on LG) -->
<div class="lg:col-span-7 flex flex-col gap-space-xl">
<!-- 1. About Section -->
<article class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">نبذة عن الطبيب والتخصص</h2>
</div>
<span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">About Doctor</span>
</div>
<p class="font-body-lg text-body-lg text-on-surface leading-relaxed mb-space-md" id="dp-bio-1">
            يُعد الدكتور طارق المنصور أحد أبرز استشاريي أمراض القلب والقسطرة التداخلية في المملكة، مع خبرة تتجاوز خمسة عشر عاماً قضاها في إجراء العمليات التداخلية المعقدة لعلاج انسداد الشرايين التاجية، واستبدال الصمامات بالقسطرة (TAVI)، وتركيب أحدث الدعامات الدوائية الذكية.
          </p>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed" id="dp-bio-2">
            شغل سابقاً منصب رئيس وحدة القسطرة القلبية بمستشفى رويال كير الدولي، وشارك في تدريب عشرات الأطباء ضمن برامج زمالة المجلس الطبي السوداني والبريطانية، مع أكثر من 24 ورقة علمية منشورة في مجلات طبية عالمية محكمة في مجال الذبحة الصدرية واعتلال عضلة القلب الوراثي.
          </p>
<!-- Highlights Pill Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-lg pt-space-md bg-surface-container-low/50 rounded-xl p-space-md" id="dp-highlights">
<div class="flex items-center gap-space-xs text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
<span class="font-label-md text-label-md">إجراء أكثر من 2,400 قسطرة ناجحة</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
<span class="font-label-md text-label-md">بروتوكولات فحص سريرية معتمدة عالمياً</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
<span class="font-label-md text-label-md">متابعة فورية للمؤشرات الحيوية بعد الفحص</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
<span class="font-label-md text-label-md">استشارات متكاملة ثنائية اللغة (عربي / English)</span>
</div>
</div>
</article>
<!-- 2. Sub-specialties & Conditions Treated -->
<article class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-tertiary-fixed-dim/40 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[20px]" id="dp-services-icon">cardiology</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">الحالات المعالجة والخدمات التخصصية</h2>
</div>
<span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Specialties &amp; Services</span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md" id="dp-services">
<!-- Item 1 -->
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all">
<div class="p-2 bg-surface-container-lowest rounded-lg text-primary shadow-sm">
<span class="material-symbols-outlined text-[22px]">vital_signs</span>
</div>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">تخطيط القلب المتقدم (ECG / Echo)</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">تصوير الصدى ثلاثي الأبعاد وتقييم صمامات وبطينات القلب بدقة فائقة.</p>
</div>
</div>
<!-- Item 2 -->
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all">
<div class="p-2 bg-surface-container-lowest rounded-lg text-primary shadow-sm">
<span class="material-symbols-outlined text-[22px]">medical_services</span>
</div>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">القسطرة التداخلية وتركيب الدعامات</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">فتح تضيقات الشرايين التاجية الطارئة والمجدولة بالبالون والدعامات الحيوية.</p>
</div>
</div>
<!-- Item 3 -->
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all">
<div class="p-2 bg-surface-container-lowest rounded-lg text-primary shadow-sm">
<span class="material-symbols-outlined text-[22px]">monitor_heart</span>
</div>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">فحص الجهد ومتابعة هولتر 24/48</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">تشخيص اضطرابات النبض، والخفقان المفاجئ، وأسباب ضيق التنفس عند الإجهاد.</p>
</div>
</div>
<!-- Item 4 -->
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all">
<div class="p-2 bg-surface-container-lowest rounded-lg text-primary shadow-sm">
<span class="material-symbols-outlined text-[22px]">blood_pressure</span>
</div>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">علاج ارتفاع ضغط الدم المقاوم</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">بروتوكولات حديثة لإدارة ارتفاع ضغط الدم الشرياني والوقاية من تصلب الأوعية.</p>
</div>
</div>
</div>
</article>
<!-- 3. Hospital Location & Clinic Wayfinding -->
<article class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[20px]">location_on</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">موقع العيادة ومسار الوصول</h2>
</div>
<span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Location &amp; Access</span>
</div>
<div class="flex flex-col md:flex-row gap-space-lg items-center">
<!-- Static Map Pipeline -->
<div class="w-full md:w-1/2 rounded-xl overflow-hidden shadow-sm h-64 bg-surface-container relative">
<div class="w-full h-full bg-cover bg-center" id="dp-map" data-location="المستشفى، الخرطوم، السودان" style="background-image: linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-container-highest) 60%, var(--color-surface-container-high) 100%)"></div>
<div class="absolute bottom-3 right-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-2 rounded-lg shadow-md flex items-center justify-between">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-primary text-[18px]">near_me</span>
<span class="font-label-sm text-label-sm text-on-surface font-bold" id="dp-gate">بوابة 4 - مواقف كبار الشخصيات والزوار</span>
</div>
<span class="text-[11px] text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded">مواقف متوفرة</span>
</div>
</div>
<!-- Clinic Directions details -->
<div class="w-full md:w-1/2 flex flex-col gap-space-sm">
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-primary text-[20px] mt-0.5">apartment</span>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold" id="dp-building-name">المبنى الرئيسي - المركز التخصصي للقلب</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant" id="dp-building-line">شارع الجامعة، أمبات، الخرطوم</p>
</div>
</div>
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-primary text-[20px] mt-0.5">meeting_room</span>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold" id="dp-clinic-name">الطابق الثالث - عيادة رقم 304</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant" id="dp-clinic-line">المصاعد الرئيسية C • مباشرة أمام صالة استراحة المرضى المراجعين</p>
</div>
</div>
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-primary text-[20px] mt-0.5">local_parking</span>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">مواقف السيارات P2 وخدمة المساعدة</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">خدمة صف السيارات متوفرة مجاناً لمرضى ميعادي عبر إبراز تذكرة الحجز</p>
</div>
</div>
<div class="pt-space-xs mt-space-xs">
<a class="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-label-md text-label-md font-semibold transition-colors" href="#" id="dp-map-link">
<span>فتح الموقع في خرائط Google</span>
<span class="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
</div>
</div>
</article>
<!-- 4. Patient Reviews & Verified Ratings -->
<article class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm">
<div class="flex items-center justify-between mb-space-lg">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">reviews</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">تقييمات المراجعين الموثقة عبر نفاذ</h2>
</div>
<div class="flex items-center gap-1 text-on-surface font-bold text-headline-sm">
<span class="material-symbols-outlined text-[#d97706] text-[20px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span id="dp-rating-big">4.9 / 5.0</span>
</div>
</div>
<!-- Reviews Grid -->
<div class="flex flex-col gap-space-md" id="dp-review-list">
<!-- Review 1 -->
<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-label-md">
                    م. ع
                  </div>
<div class="flex flex-col">
<div class="flex items-center gap-1.5">
<span class="font-label-md text-label-md font-semibold text-on-surface">محمد العتيبي</span>
<span class="inline-flex items-center gap-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[12px]">verified_user</span>
                        حجز مؤكد عبر نفاذ
                      </span>
</div>
<span class="font-body-sm text-body-sm text-secondary">زيارة عيادة • قبل 4 أيام</span>
</div>
</div>
<div class="flex text-[#d97706] text-[16px]">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
</div>
<p class="font-body-md text-body-md text-on-surface leading-relaxed mt-1">
                "الدكتور طارق قمة في الأخلاق والمهنية والتمكن. شرح لي نتائج القسطرة بالتفصيل الدقيق وبأسلوب مريح أزال كل مخاوفي. طاقم العيادة متميز جداً ودقيق في المواعيد."
              </p>
</div>
<!-- Review 2 -->
<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-label-md">
                    ن. خ
                  </div>
<div class="flex flex-col">
<div class="flex items-center gap-1.5">
<span class="font-label-md text-label-md font-semibold text-on-surface">نورة الخالدي</span>
<span class="inline-flex items-center gap-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[12px]">verified_user</span>
                        حجز مؤكد عبر نفاذ
                      </span>
</div>
<span class="font-body-sm text-body-sm text-secondary">استشارة فيديو عن بعد • قبل أسبوع</span>
</div>
</div>
<div class="flex text-[#d97706] text-[16px]">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
</div>
<p class="font-body-md text-body-md text-on-surface leading-relaxed mt-1">
                "استشارة الفيديو كانت ممتازة ومثمرة جداً. راجع معي تخطيط القلب وأجرى تعديلات دقيقة على جرعات دواء الضغط، وتم إرسال الوصفة الطبية فورياً عبر منصة وصفتي."
              </p>
</div>
</div>
<button class="w-full mt-space-md py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1" type="button">
<span id="dp-reviews-more">عرض جميع آراء المراجعين الـ 480</span>
<span class="material-symbols-outlined text-[18px]">expand_more</span>
</button>
</article>
</div>
<!-- Left Column: Booking Engine Box (5 Cols on LG) -->
<aside class="w-full max-w-md mx-auto lg:col-span-5 lg:mx-0 lg:max-w-none flex flex-col gap-space-md">
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-xl relative overflow-hidden">
<!-- Box Header -->
<div class="flex items-center justify-between gap-space-sm pb-space-sm">
<div class="min-w-0 flex-1">
<span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider block">جدول المواعيد المباشر</span>
<h3 class="font-headline-sm sm:font-headline-md text-headline-sm sm:text-headline-md text-on-surface font-bold">احجز استشارتك الطبية</h3>
</div>
<div class="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]">event_available</span>
</div>
</div>
<!-- 1. Consultation Mode Selector Tabs -->
<div class="mt-space-sm">
<label class="font-label-sm text-label-sm text-on-surface-variant font-semibold block mb-2">نوع الاستشارة المطلوبة | Consultation Type</label>
<div class="grid grid-cols-2 gap-space-xs p-1 bg-surface-container-low rounded-2xl" id="consultation-tabs">
<!-- Tab In-Clinic -->
<button class="flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl bg-primary text-on-primary shadow-sm transition-all text-center group" id="btn-in-clinic" onclick="setConsultationMode('clinic')" type="button">
<div class="flex items-center gap-1 font-label-md text-label-md font-bold">
<span class="material-symbols-outlined text-[18px]">local_hospital</span>
<span>زيارة العيادة</span>
</div>
<span class="text-[12px] opacity-90 mt-0.5 font-semibold" id="dp-fee-clinic">3000 ج.س • In-Clinic</span>
</button>
<!-- Tab Telehealth -->
<button class="flex flex-col items-center justify-center py-space-sm px-space-xs rounded-xl bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-center group" id="btn-telehealth" onclick="setConsultationMode('telehealth')" type="button">
<div class="flex items-center gap-1 font-label-md text-label-md font-bold">
<span class="material-symbols-outlined text-[18px]">videocam</span>
<span>استشارة فيديو</span>
</div>
<span class="text-[12px] text-secondary mt-0.5 font-semibold" id="dp-fee-telehealth">2200 ج.س • Video Call</span>
</button>
</div>
</div>
<!-- 2. Interactive Calendar Date Picker -->
<div class="mt-space-md">
<div class="flex items-center justify-between mb-2">
<span class="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
<span id="dp-month-label">أكتوبر 2024 • October</span>
</span>
<div class="flex items-center gap-1">
<button class="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]" id="dp-days-back">chevron_right</span>
</button>
<button class="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]" id="dp-days-fwd">chevron_left</span>
</button>
</div>
</div>
<!-- Date Horizontal Strip / Matrix -->
<div class="grid grid-cols-5 gap-2" id="date-picker-row">
<!-- Day 1 (Mon 14) -->
<button class="date-cell flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-center" onclick="selectDate(this, 'الاثنين 14 أكتوبر 2024')" type="button">
<span class="font-label-sm text-label-sm text-secondary">الإثنين</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">14</span>
<span class="text-[10px] text-tertiary font-bold mt-1">3 متاح</span>
</button>
<!-- Day 2 (Tue 15 - Active) -->
<button class="date-cell active-date flex flex-col items-center py-2.5 px-1 rounded-xl bg-primary text-on-primary shadow-md transition-all text-center" onclick="selectDate(this, 'الثلاثاء 15 أكتوبر 2024')" type="button">
<span class="font-label-sm text-label-sm opacity-90">الثلاثاء</span>
<span class="font-headline-sm text-headline-sm font-bold mt-0.5">15</span>
<span class="text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded-full font-bold mt-1">محدد</span>
</button>
<!-- Day 3 (Wed 16) -->
<button class="date-cell flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-center" onclick="selectDate(this, 'الأربعاء 16 أكتوبر 2024')" type="button">
<span class="font-label-sm text-label-sm text-secondary">الأربعاء</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">16</span>
<span class="text-[10px] text-tertiary font-bold mt-1">5 متاح</span>
</button>
<!-- Day 4 (Thu 17) -->
<button class="date-cell flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-center" onclick="selectDate(this, 'الخميس 17 أكتوبر 2024')" type="button">
<span class="font-label-sm text-label-sm text-secondary">الخميس</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">17</span>
<span class="text-[10px] text-tertiary font-bold mt-1">2 متاح</span>
</button>
<!-- Day 5 (Fri 18 - Inactive/Weekend) -->
<div class="flex flex-col items-center py-2.5 px-1 rounded-xl bg-surface-container-lowest/60 text-secondary-fixed-dim text-center opacity-40 cursor-not-allowed">
<span class="font-label-sm text-label-sm">الجمعة</span>
<span class="font-headline-sm text-headline-sm font-bold mt-0.5">18</span>
<span class="text-[10px] mt-1">مغلق</span>
</div>
</div>
</div>
<!-- 3. Time Slots Hierarchy (Morning & Evening) -->
<div class="mt-space-md">
<!-- Morning Slots -->
<div class="mb-space-sm">
<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold mb-2">
<span class="material-symbols-outlined text-amber-500 text-[18px]">wb_sunny</span>
<span>الفترة الصباحية • Morning Slots</span>
</div>
<div class="grid grid-cols-4 gap-space-xs" id="morning-slots">
<!-- Slot 1 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '09:30 AM')" type="button">
                  09:30 ص
                </button>
<!-- Slot 2 (Selected default) -->
<button class="time-slot selected-slot py-2 px-1 text-center rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all font-bold flex items-center justify-center gap-1" onclick="selectTimeSlot(this, '10:15 AM')" type="button">
<span class="material-symbols-outlined text-[14px]">check</span>
<span>10:15 ص</span>
</button>
<!-- Slot 3 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '11:00 AM')" type="button">
                  11:00 ص
                </button>
<!-- Slot 4 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '11:45 AM')" type="button">
                  11:45 ص
                </button>
</div>
</div>
<!-- Evening Slots -->
<div>
<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold mb-2">
<span class="material-symbols-outlined text-indigo-400 text-[18px]">nights_stay</span>
<span>الفترة المسائية • Evening Slots</span>
</div>
<div class="grid grid-cols-4 gap-space-xs" id="evening-slots">
<!-- Slot 5 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '04:30 PM')" type="button">
                  04:30 م
                </button>
<!-- Slot 6 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '05:15 PM')" type="button">
                  05:15 م
                </button>
<!-- Slot 7 (Booked/Disabled) -->
<div class="py-2 px-1 text-center rounded-xl bg-surface-container text-secondary opacity-40 font-label-md text-label-md cursor-not-allowed line-through">
                  06:00 م
                </div>
<!-- Slot 8 -->
<button class="time-slot py-2 px-1 text-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" onclick="selectTimeSlot(this, '07:30 PM')" type="button">
                  07:30 م
                </button>
</div>
</div>
</div>
<!-- 4. Selected Slot Banner Summary -->
<div class="mt-space-md p-space-sm bg-primary/5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">schedule</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary font-semibold">الموعد المحدد للحجز:</span>
<span class="font-label-md text-label-md font-bold text-on-surface" id="summary-datetime-display">
                  الثلاثاء 15 أكتوبر 2024 • 10:15 صباحاً
                </span>
</div>
</div>
<span class="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full font-bold">مؤكد</span>
</div>
<!-- 5. Insurance Pre-Check Toggle -->
<div class="mt-space-md p-space-sm bg-surface-container-low rounded-2xl flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">التأمين الطبي المعتمد</span>
<span class="text-[11px] text-on-surface-variant">تغطية التعميد المباشر عبر المنظومة</span>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" id="insurance-toggle" onchange="toggleInsuranceDetails()" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<!-- Insurance Selector detail row -->
<div class="flex items-center justify-between pt-1 text-on-surface-variant font-label-sm text-label-sm" id="insurance-dropdown-area">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span id="dp-insurer-name">شيكان للتأمين • الفئة الذهبية</span>
</div>
<button class="text-primary font-bold hover:underline" type="button" id="dp-insurer-change">تغيير</button>
</div>
</div>
<!-- 6. Price Summary & Proceed CTA (inside the booking card) -->
<div class="mt-space-lg pt-space-md border-t border-outline-variant/30 flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<span class="font-body-md text-body-md text-on-surface-variant">إجمالي رسوم الكشف:</span>
<div class="flex items-baseline gap-1">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface" id="cta-price-amount">3000</span>
<span class="font-label-md text-label-md font-semibold text-secondary">ج.س (SDG)</span>
</div>
</div>
<button class="w-full py-3.5 px-space-md bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary rounded-full font-label-lg text-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 group" id="dp-cta" type="button">
<span class="material-symbols-outlined text-[20px] text-on-primary">lock</span>
<span id="cta-button-text">تأكيد الحجز | Confirm Booking</span>
</button>
<!-- Security Assurance Footnote -->
<div class="flex items-center justify-center gap-space-sm text-secondary font-label-sm text-label-sm mt-1">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-tertiary">verified</span>
<span>إلغاء مجاني حتى ساعتين قبل الموعد</span>
</div>
<span>•</span>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">security</span>
<span>دفع إلكتروني آمن ومشفر 100%</span>
</div>
</div>
</div>
</aside>
</div>
</main>
</div>`;
