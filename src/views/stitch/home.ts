// AUTO-GENERATED from Stitch desktop design: home-desktop.html
export const HOME_MAIN = `<div class="flex flex-col w-full">
<!-- HERO SECTION WITH INTEGRATED SEARCH -->
<section class="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low/70 via-surface to-surface pb-space-xl">
<!-- Ambient organic medical gradient accents (strictly contained) -->
<div class="absolute -top-24 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute top-48 left-10 w-80 h-80 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div class="w-full px-margin-desktop pt-space-xl max-w-7xl mx-auto flex flex-col items-center">
<!-- Status Chip & Accreditations Overline -->
<div class="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm mb-space-md">
<span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
<span class="font-label-md text-label-md text-primary font-semibold">بوابة الرعاية الطبية الوطنية الأولى بالمملكة</span>
<span class="text-outline-variant font-body-sm text-body-sm">|</span>
<span class="font-label-sm text-label-sm text-secondary tracking-wide">Vision 2030 Health Sector Transformation</span>
</div>
<!-- Main Headline with Typographic Depth -->
<div class="text-center max-w-4xl mb-space-lg">
<h1 class="font-display-lg text-display-lg text-on-surface tracking-tight mb-space-xs leading-tight">
          احجز موعدك الطبي بكل ثقة وسهولة
        </h1>
<p class="font-headline-sm text-headline-sm text-primary font-medium mb-space-sm">
          Your Trusted Gateway to Premier Healthcare in Sudan
        </p>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          اختر من بين أكثر من 500 استشاري وطبيب معتمد لدى أفضل المستشفيات والمراكز التخصصية في الخرطوم، أم درمان، وبورتسودان.
        </p>
</div>
<!-- Elevated Multi-Field Search Engine Floating Deck -->
<div class="w-full max-w-5xl bg-surface-container-lowest rounded-3xl p-space-md shadow-xl relative z-10">
<form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm items-center" onsubmit="event.preventDefault();">
<!-- Specialty / Condition Field -->
<div class="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors">
<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary">التخصص الطبي أو العَرَض</label>
<input class="bg-transparent h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none placeholder:text-outline truncate" placeholder="استشاري قلب وقسطرة..." type="text" value="استشاري قلب وقسطرة"/>
</div>
</div>
<!-- Doctor or Hospital Name -->
<div class="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors">
<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined text-[22px]">person_search</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary">اسم الطبيب أو المستشفى</label>
<input class="bg-transparent h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none placeholder:text-outline truncate" placeholder="مستشفى رويال كير الدولي..." type="text"/>
</div>
</div>
<!-- City & Neighborhood Selector -->
<div class="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors">
<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined text-[22px]">pin_drop</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary">المدينة أو الحي</label>
<select class="bg-transparent h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option>الخرطوم - حي أمبات</option>
<option>الخرطوم - حي المقرن</option>
<option>أم درمان - حي أمباجة</option>
<option>بورتسودان - حي الميناء</option>
</select>
</div>
</div>
<!-- Insurance Provider Selector -->
<div class="lg:col-span-2 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors">
<div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
<span class="material-symbols-outlined text-[22px]">verified_user</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary">شركة التأمين</label>
<select class="bg-transparent h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option>شيكان للتأمين</option>
<option>أتلاف للتأمين</option>
<option>سلام للتأمين</option>
<option>السودان للتأمين</option>
<option>دفع نقدي / بدون تأمين</option>
</select>
</div>
</div>
<!-- Submit Button -->
<div class="lg:col-span-1 flex items-center justify-center h-full">
<button class="w-full h-12 lg:h-14 rounded-2xl bg-primary text-on-primary hover:bg-primary-container flex items-center justify-center transition-all shadow-md active:scale-95" type="submit">
<span class="material-symbols-outlined text-[24px]">search</span>
</button>
</div>
</form>
<!-- Fast Filter Pills -->
<div class="mt-space-md pt-space-sm flex items-center flex-wrap gap-space-xs bg-surface-container-lowest">
<span class="font-label-sm text-label-sm text-secondary me-2">خيارات سريعة:</span>
<button class="inline-flex items-center gap-1.5 px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px] text-tertiary">today</span>
<span>كشف عاجل اليوم (Available Today)</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px] text-primary">videocam</span>
<span>استشارة مرئية (Telehealth)</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px] text-secondary">home_health</span>
<span>زيارة منزلية (Home Visit)</span>
</button>
<button class="inline-flex items-center gap-1.5 px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
<span>تغطية تأمينية كاملة 100%</span>
</button>
</div>
</div>
</div>
</section>
<!-- UPCOMING APPOINTMENT SMART PASS WIDGET -->
<section id="home-next-appointment" class="w-full px-margin-desktop -mt-6 max-w-7xl mx-auto z-20">
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-lg relative overflow-hidden">
<!-- Accent Top Edge Strip -->
<div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
<div class="flex flex-col lg:flex-row items-stretch justify-between gap-space-lg">
<!-- Patient Context & Doctor Card -->
<div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-md flex-1">
<div class="relative">
<img class="w-20 h-20 rounded-2xl object-cover shadow-sm" data-alt="Portrait photo of Dr. Tariq Al-Mansoor, a prestigious Saudi male senior cardiologist with salt and pepper beard wearing pristine white medical doctor coat, modern clinical hospital background with soft teal bokeh lighting, professional medical healthcare portrait." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzukdkQW8yghz9sTZUIedwN2SoyDe5lARs_X-pTQtb-o8pUdG5qbe3OhlukboVxXWS5z7gBrI0vsPgFAooZtPzuDGfrqzTKaBM_KGfGHzmbpXBvX7gMTtnp5XHRiwLln514QTQpxtnsrfPiPHyXWYNUmA1sEN-I6r98dhjQAzb1V2Yh6Sad4f-bGJ8Rm9a_iph8_DtETzXiiEcKET8LjcFNJ9XzqdvoqJtOZaqOGLBjM2MwIq8p9nv"/>
<span class="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[14px]">
<span class="material-symbols-outlined text-[14px]">check</span>
</span>
</div>
<div class="flex flex-col min-w-0">
<div class="inline-flex items-center gap-2 mb-1">
<span class="px-2 py-0.5 rounded-md bg-secondary-container font-label-sm text-label-sm text-on-secondary-container font-bold">موعدك القادم المؤكد</span>
<span class="text-tertiary font-label-sm text-label-sm flex items-center gap-0.5">
<span class="material-symbols-outlined text-[14px]">verified</span>
                موافق عليه تأمينياً
              </span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">د. طارق المنصور | Dr. Tariq Al-Mansoor</h3>
<p class="font-body-md text-body-md text-on-surface-variant">استشاري أول أمراض القلب والقسطرة التداخلية • مستشفى رويال كير الدولي</p>
<div class="flex items-center gap-space-md mt-2 flex-wrap">
<div class="flex items-center gap-1 text-primary font-label-md text-label-md">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
<span>غداً، 24 أكتوبر 2025</span>
</div>
<div class="flex items-center gap-1 text-primary font-label-md text-label-md">
<span class="material-symbols-outlined text-[18px]">schedule</span>
<span>10:15 صباحاً (حضور بالعيادة)</span>
</div>
<div class="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span>برج العيادات الخارجية - الطابق 4 - عيادة 412</span>
</div>
</div>
</div>
</div>
<!-- Clinical Smart Pass Ticket Barcode & Micro Interaction Area -->
<div class="flex flex-col sm:flex-row items-center gap-space-md bg-surface-container-low rounded-2xl p-space-md shrink-0 justify-between">
<div class="flex items-center gap-space-md">
<!-- Mock Smart Pass QR Pattern with SVG -->
<div class="w-16 h-16 bg-surface-container-lowest p-1.5 rounded-xl flex items-center justify-center shadow-sm">
<svg class="w-full h-full text-on-surface" fill="currentColor" viewbox="0 0 100 100">
<rect height="30" rx="4" width="30" x="0" y="0"></rect>
<rect fill="white" height="18" rx="2" width="18" x="6" y="6"></rect>
<rect height="10" rx="1" width="10" x="10" y="10"></rect>
<rect height="30" rx="4" width="30" x="70" y="0"></rect>
<rect fill="white" height="18" rx="2" width="18" x="76" y="6"></rect>
<rect height="10" rx="1" width="10" x="80" y="10"></rect>
<rect height="30" rx="4" width="30" x="0" y="70"></rect>
<rect fill="white" height="18" rx="2" width="18" x="6" y="76"></rect>
<rect height="10" rx="1" width="10" x="10" y="80"></rect>
<rect height="20" rx="2" width="10" x="40" y="10"></rect>
<rect height="20" rx="2" width="20" x="40" y="40"></rect>
<rect height="10" rx="2" width="10" x="70" y="40"></rect>
<rect height="10" rx="2" width="15" x="15" y="40"></rect>
<rect height="15" rx="2" width="20" x="40" y="70"></rect>
<rect height="25" rx="2" width="25" x="70" y="70"></rect>
</svg>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">رقم بطاقة الوصول الذكية</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-mono tracking-wider font-bold">MIA-8902-KFSH</span>
<span class="font-body-sm text-body-sm text-tertiary">دخول مباشر بدون انتظار الاستقبال</span>
</div>
</div>
<div class="flex items-center gap-space-xs w-full sm:w-auto">
<button class="flex-1 sm:flex-initial px-space-md py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
<span>عرض بطاقة الدخول</span>
</button>
<button class="p-2.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors" title="إعادة الجدولة أو التفاصيل" type="button">
<span class="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</div>
</div>
</div>
</div>
</section>
<!-- MEDICAL SPECIALTIES BENTO GRID (8 TILES) -->
<section class="w-full px-margin-desktop py-space-xl max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="font-label-md text-label-md text-primary font-bold">استكشف حسب المجال السريري</span>
</div>
<h2 class="font-display-lg text-display-lg text-on-surface font-bold">التخصصات الطبية المميزة</h2>
<p class="font-body-md text-body-md text-on-surface-variant">تصفح الرعاية الطبية الدقيقة والموثوقة وفق أعلى المعايير الصحية العالمية</p>
</div>
<a class="inline-flex items-center gap-1.5 min-h-11 py-1 text-primary font-label-md text-label-md hover:gap-2 transition-all group" href="#">
<span>عرض جميع التخصصات (48 تخصص)</span>
<span class="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
</a>
</div>
<!-- 8 Grid Cards -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-space-md">
<!-- 1. Cardiology -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">cardiology</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="cardiology">18 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">القلب والأوعية</h3>
<p class="font-label-sm text-label-sm text-secondary">Cardiology &amp; Vascular</p>
</div>
</div>
<!-- 2. Dentistry -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">dentistry</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="dental">34 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب وجراحة الأسنان</h3>
<p class="font-label-sm text-label-sm text-secondary">Dental &amp; Oral Care</p>
</div>
</div>
<!-- 3. Pediatrics -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">child_care</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="pediatrics">22 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب الأطفال وحديثي الولادة</h3>
<p class="font-label-sm text-label-sm text-secondary">Pediatrics &amp; Neonatal</p>
</div>
</div>
<!-- 4. Dermatology -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">clean_hands</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="dermatology">29 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">الجلدية والتجميل والليزر</h3>
<p class="font-label-sm text-label-sm text-secondary">Dermatology &amp; Laser</p>
</div>
</div>
<!-- 5. Orthopedics -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">skeleton</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="orthopedics">27 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">العظام والمفاصل والعمود الفقري</h3>
<p class="font-label-sm text-label-sm text-secondary">Orthopedic Surgery</p>
</div>
</div>
<!-- 6. Ophthalmology -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">visibility</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="ophthalmology">15 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب وجراحة العيون</h3>
<p class="font-label-sm text-label-sm text-secondary">Ophthalmology</p>
</div>
</div>
<!-- 7. ENT -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">hearing</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="ent">14 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">أنف وأذن وحنجرة</h3>
<p class="font-label-sm text-label-sm text-secondary">ENT Head &amp; Neck</p>
</div>
</div>
<!-- 8. Internal Medicine -->
<div class="group bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-48">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">vital_signs</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="internal">31 طبيب</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">الباطنية والجهاز الهضمي</h3>
<p class="font-label-sm text-label-sm text-secondary">Internal Medicine</p>
</div>
</div>
</div>
</section>
<!-- TOP RATED DOCTORS (ELITE ROSTER) -->
<section class="w-full px-margin-desktop py-space-xl bg-surface-container-low/50">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span class="font-label-md text-label-md text-tertiary font-bold">نخبة الكفاءات الطبية الاستشارية</span>
</div>
<h2 class="font-display-lg text-display-lg text-on-surface font-bold">أطباء النخبة المتاحون للحجز الفوري</h2>
<p class="font-body-md text-body-md text-on-surface-variant">ممارسون صحيون معتمدون ذوو خبرة سريرية تفوق 15 عاماً في أفضل الصروح الطبية</p>
</div>
<div class="flex items-center gap-space-xs">
<button class="w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-high flex items-center justify-center transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
<button class="w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-high flex items-center justify-center transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
</div>
</div>
<!-- 4 Doctor Cards Grid -->
<div id="featured-doctors" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
<!-- Doctor 1: Dr. Tariq Al-Mansoor -->
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
<div>
<!-- Header with Avatar and Badge -->
<div class="flex items-start gap-space-sm mb-space-sm">
<img class="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" data-alt="Close up professional portrait of Saudi senior male cardiologist Dr. Tariq Al-Mansoor with neat eyeglasses, white lab coat, modern clinical lighting, high resolution medical photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmap2lrg3uA-TFC5it8kD5_UKknwfes96igM270UBl8siMl4aBEf2b5fv19NttxJkeur7L6yMZlsuuMaUbS_pa2KL7nNeAM_DTKespIKGwEYDUFaI5m1Lm3wH62-YA-qAI4Te-VltWBLhYfD_vU1WrU2nW4nSN2_TVuYP-jKNZhe1aE6NHub90LtUyibdytP6yj2C1O7eXeX9eD_i316VoX4crSsktyIoySwniG7vaW3JkPVEucIVE"/>
<div class="flex flex-col min-w-0 flex-1">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-bold">استشاري أول</span>
<div class="flex items-center gap-1 text-on-surface font-label-md text-label-md">
<span class="material-symbols-outlined text-[16px] text-[#F59E0B]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold">4.9</span>
<span class="text-secondary text-label-sm">(340)</span>
</div>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-1">د. طارق المنصور</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">استشاري أمراض القلب والقسطرة</p>
</div>
</div>
<!-- Hospital & Details -->
<div class="bg-surface-container-low rounded-2xl p-space-sm mb-space-sm flex flex-col gap-1.5">
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">apartment</span>
<span class="truncate">مستشفى رويال كير الدولي</span>
</div>
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
<span>الخرطوم - حي المقرن</span>
</div>
<div class="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm mt-1">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span>تغطية: شيكان، أتلاف، سلام للتأمين</span>
</div>
</div>
<!-- Slot Status Pill -->
<div class="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container mb-space-sm">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span class="font-label-sm text-label-sm text-on-surface">أقرب موعد متاح:</span>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold">غداً 10:15 ص</span>
</div>
</div>
<!-- Bottom Price & Booking -->
<div class="pt-space-xs flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">رسوم الكشف:</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">3000 ج.س</span>
</div>
<button class="px-space-md py-2.5 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
              احجز موعداً
            </button>
</div>
</div>
<!-- Doctor 2: Dr. Sarah Al-Otaibi -->
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
<div>
<div class="flex items-start gap-space-sm mb-space-sm">
<img class="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" data-alt="Portrait photo of Dr. Sarah Al-Otaibi, professional Saudi female pediatrician wearing modest medical attire, warm friendly expression, bright cheerful pediatric hospital clinic ambient lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpuRH4BSadrsemYUlRQG60TPIXJUcz7HFS0l30mjt6ontkVms5OYzAuMAze8MuwDrIUqOvuX9xRwmaBEGNyM5czKaPY3ywH-QWAkZifRqBb6BiG8pt0FKCqOAjXah-KMyepBW6tTC4aUKUTl2FS1GJbf07pjFpCRLGVTPTDbrMN2NuQEIw0jtnDlcpOWlT5piiwsxbW9aBebMSUfvxgnGd_OWGH7kGCHNbsDxrlvjEvlj8NZa8rzML"/>
<div class="flex flex-col min-w-0 flex-1">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-bold">استشارية أطفال</span>
<div class="flex items-center gap-1 text-on-surface font-label-md text-label-md">
<span class="material-symbols-outlined text-[16px] text-[#F59E0B]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold">4.9</span>
<span class="text-secondary text-label-sm">(512)</span>
</div>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-1">د. سارة العتيبي</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">استشارية طب الأطفال وحديثي الولادة</p>
</div>
</div>
<div class="bg-surface-container-low rounded-2xl p-space-sm mb-space-sm flex flex-col gap-1.5">
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">apartment</span>
<span class="truncate">مستشفى النور التخصصي</span>
</div>
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
<span>الخرطوم - حي أمبات</span>
</div>
<div class="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm mt-1">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span>تغطية: شيكان، السودان للتأمين</span>
</div>
</div>
<div class="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container mb-space-sm">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span class="font-label-sm text-label-sm text-on-surface">أقرب موعد متاح:</span>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold">اليوم 04:30 م</span>
</div>
</div>
<div class="pt-space-xs flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">رسوم الكشف:</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">2500 ج.س</span>
</div>
<button class="px-space-md py-2.5 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
              احجز موعداً
            </button>
</div>
</div>
<!-- Doctor 3: Dr. Khalid Al-Zahrani -->
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
<div>
<div class="flex items-start gap-space-sm mb-space-sm">
<img class="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" data-alt="Portrait photo of Dr. Khalid Al-Zahrani, Saudi male dental surgeon in contemporary high-end dental suite with subtle medical instruments background, confident professional posture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkJoYLJJPgXDvGSfmpFp2DzMnyi053po9fCaOw9mmUB8nW1vVEFW3O2HyHPPh31Dq8IumEnlGBBdPougvMuUbv74lUY9_sJN7MwHk0sTN5ssDakhWCsgFlRLvpO6umuatsphN9-MJOwsniGOGP-FzmZ_R5L62LezhZj5OB_NjyBZd4ixADW1vdq5RvYLHKMiJV4c1ZVtEfxYrQ03T2pDCv4zOa1luWtYh1Nb-7Aq36rFQReKk7cSCG"/>
<div class="flex flex-col min-w-0 flex-1">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-bold">استشاري جراحة</span>
<div class="flex items-center gap-1 text-on-surface font-label-md text-label-md">
<span class="material-symbols-outlined text-[16px] text-[#F59E0B]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold">4.8</span>
<span class="text-secondary text-label-sm">(289)</span>
</div>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-1">د. خالد الزهراني</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">استشاري جراحة وزراعة الأسنان</p>
</div>
</div>
<div class="bg-surface-container-low rounded-2xl p-space-sm mb-space-sm flex flex-col gap-1.5">
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">apartment</span>
<span class="truncate">مركز ميرال الطبي المتخصص</span>
</div>
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
<span>بورتسودان - حي الميناء</span>
</div>
<div class="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm mt-1">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span>تغطية: كافة شركات التأمين</span>
</div>
</div>
<div class="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container mb-space-sm">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span class="font-label-sm text-label-sm text-on-surface">أقرب موعد متاح:</span>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold">غداً 06:00 م</span>
</div>
</div>
<div class="pt-space-xs flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">رسوم الكشف:</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">2000 ج.س</span>
</div>
<button class="px-space-md py-2.5 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
              احجز موعداً
            </button>
</div>
</div>
<!-- Doctor 4: Dr. Noura Al-Shammary -->
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
<div>
<div class="flex items-start gap-space-sm mb-space-sm">
<img class="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" data-alt="Portrait photo of Dr. Noura Al-Shammary, an accomplished Saudi female dermatologist in clean aesthetic medical clinic, professional doctor coat, elegant natural lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYa-2cfdOYuTGMlssJEEoZmRjwTh9Bik5_0KkCnXdBWJx4cs50PvqjGpGSzSlwFy8LoO0m32hFwlcvrPyf8EqWC3JYikIHmI2_aMmHHkI9HFxntUH5bHgQF-1fbFn3i0YTJle7yinbe_O78yphUr2tE_Qny0sPnL-0lroYH7M4qmInEFxpg26kTsZ7010wVPXk3XwyCJi7PimNZhuPUKzouNY-Vo7hZO5HiICBAab-t8sxmTEp0qM5"/>
<div class="flex flex-col min-w-0 flex-1">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-bold">استشارية جلدية</span>
<div class="flex items-center gap-1 text-on-surface font-label-md text-label-md">
<span class="material-symbols-outlined text-[16px] text-[#F59E0B]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold">4.9</span>
<span class="text-secondary text-label-sm">(460)</span>
</div>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-1">د. نورة الشمري</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">استشارية الأمراض الجلدية والعلاج بالليزر</p>
</div>
</div>
<div class="bg-surface-container-low rounded-2xl p-space-sm mb-space-sm flex flex-col gap-1.5">
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">apartment</span>
<span class="truncate">مستشفى الدكتور سليمان الحبيب</span>
</div>
<div class="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
<span>الخرطوم - حي الجامعة</span>
</div>
<div class="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm mt-1">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span>تغطية: شيكان، أتلاف، النيل للتأمين</span>
</div>
</div>
<div class="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container mb-space-sm">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span class="font-label-sm text-label-sm text-on-surface">أقرب موعد متاح:</span>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold">الأحد 01:00 م</span>
</div>
</div>
<div class="pt-space-xs flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary">رسوم الكشف:</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">2800 ج.س</span>
</div>
<button class="px-space-md py-2.5 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
              احجز موعداً
            </button>
</div>
</div>
</div>
</div>
</section>
<!-- VALUE PROPOSITION / WHY MIAADI (لماذا تختار ميعادي) -->
<section class="w-full px-margin-desktop py-space-xl max-w-7xl mx-auto">
<div class="advantage-card bg-primary text-on-primary rounded-3xl p-space-xl relative overflow-hidden shadow-xl">
<!-- Decorative geometric health grid lines -->
<div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-container/40 blur-2xl pointer-events-none"></div>
<div class="relative z-10">
<div class="max-w-2xl mb-space-lg">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-on-primary/80 mb-1 inline-block">The Miaadi Advantage</span>
<h2 class="font-display-lg text-display-lg text-on-primary font-bold mb-space-xs">لماذا تختار منصة ميعادي لرعايتك الصحية؟</h2>
<p class="font-body-md text-body-md text-on-primary/85">
            صممت المنصة بمعايير وطنية فائقة لتضع المريض في قلب المنظومة العلاجية، موفرة تجربة استشفاء ذكية تلغي أوقات الانتظار الورقية وتمنحك الثقة الكاملة.
          </p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
<!-- Pillar 1 -->
<div class="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-space-md hover:bg-surface-container-lowest/15 transition-colors">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-space-sm shadow-sm">
<span class="material-symbols-outlined text-[26px]">verified</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">اعتماد وزارة الصحة والضمان</h3>
<p class="font-body-sm text-body-sm text-on-primary">
              جميع الأطباء والمستشفيات مرخصون رسميًا، مع ربط مباشر لشبكات التأمين المعتمدة لدى مجلس الضمان الصحي (CCHI).
            </p>
</div>
<!-- Pillar 2 -->
<div class="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-space-md hover:bg-surface-container-lowest/15 transition-colors">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-space-sm shadow-sm">
<span class="material-symbols-outlined text-[26px]">fingerprint</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">ربط فوري وآمن عبر نفاذ</h3>
<p class="font-body-sm text-body-sm text-on-primary">
              تسجيل دخول موحد عبر النفاذ الوطني لحفظ ملفك وسجلك الصحي بأعلى بروتوكولات الأمان السيبراني المعتمدة NCA.
            </p>
</div>
<!-- Pillar 3 -->
<div class="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-space-md hover:bg-surface-container-lowest/15 transition-colors">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-space-sm shadow-sm">
<span class="material-symbols-outlined text-[26px]">airplane_ticket</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">تذكرة ذكية بدون انتظار</h3>
<p class="font-body-sm text-body-sm text-on-primary">
              تصريح دخول رقمي بباركود ذكي للمرور المباشر لعيادة الطبيب وتجاوز طوابير الاستقبال الورقية بالكامل.
            </p>
</div>
<!-- Pillar 4 -->
<div class="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-space-md hover:bg-surface-container-lowest/15 transition-colors">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-space-sm shadow-sm">
<span class="material-symbols-outlined text-[26px]">video_chat</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">عيادات افتراضية 24/7</h3>
<p class="font-body-sm text-body-sm text-on-primary">
              استشارات طبية عالية الدقة صوت وصورة مع نخبة الأطباء من راحة منزلك، مع إصدار الوصفات الطبية الإلكترونية وصرفها فوراً.
            </p>
</div>
</div>
</div>
</div>
</section>
<!-- PREVENTIVE HEALTH & COMPREHENSIVE CHECKUP PACKAGES -->
<section class="w-full px-margin-desktop py-space-xl max-w-7xl mx-auto mb-space-xl">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-primary"></span>
<span class="font-label-md text-label-md text-primary font-bold">الرعاية الاستباقية والوقائية</span>
</div>
<h2 class="font-display-lg text-display-lg text-on-surface font-bold">باقات الفحص الدوري والوقاية الذكية</h2>
<p class="font-body-md text-body-md text-on-surface-variant">استثمر في صحتك وصحة أسرتك بفحوصات دورية شاملة مع تقرير طبي تفاعلي</p>
</div>
<div class="flex items-center gap-2">
<span class="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-bold px-3 py-1 rounded-full">
          خصومات حصرية حتى 40%
        </span>
</div>
</div>
<!-- Packages Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
<!-- Package 1: Silver Comprehensive -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-space-sm">
<span class="px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface font-bold">الفحص الأساسي</span>
<span class="text-tertiary font-label-sm text-label-sm flex items-center gap-1 font-bold">
<span class="material-symbols-outlined text-[16px]">bolt</span>
              نتائج خلال 12 ساعة
            </span>
</div>
<h3 class="font-headline-lg text-headline-lg text-on-surface font-bold mb-1">باقة الوقاية العامة</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">تحليل شامل ومثالي للتحقق من الصحة الحيوية ووظائف الأعضاء الحيوية الأساسية.</p>
<div class="flex items-baseline gap-2 mb-space-md">
<span class="font-display-lg text-display-lg text-primary font-bold">3900 ج.س</span>
<span class="font-body-md text-body-md text-secondary line-through">6500 ج.س</span>
<span class="font-label-sm text-label-sm text-tertiary font-bold">(خصم 40%)</span>
</div>
<!-- Analysis Items -->
<ul class="flex flex-col gap-2.5 mb-space-lg">
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>تحليل صورة الدم الكاملة (CBC 18 مؤشراً)</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>وظائف الكبد والكلى التراكمية</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>مستوى السكر الصائم ومخزون السكر HbA1c</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>معدل الدهون والكوليسترول الكلي والنافع</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>استشارة طبيب عام لقراءة ومناقشة التقرير</span>
</li>
</ul>
</div>
<button class="w-full py-3 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2" type="button">
<span>حجز باقة الفحص</span>
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
</button>
</div>
<!-- Package 2: Gold (Highlighted Cardiovascular & Metabolic) -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
<!-- Featured Tag -->
<div class="absolute top-0 right-0 bg-primary text-on-primary px-4 py-1 rounded-bl-2xl font-label-sm text-label-sm font-bold">
          الأكثر طلباً للرجال والنساء
        </div>
<div>
<div class="flex items-center justify-between mb-space-sm pt-2">
<span class="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">باقة النخبة الشاملة</span>
<span class="text-tertiary font-label-sm text-label-sm flex items-center gap-1 font-bold">
<span class="material-symbols-outlined text-[16px]">home</span>
              سحب عينة مجاني بالمنزل
            </span>
</div>
<h3 class="font-headline-lg text-headline-lg text-on-surface font-bold mb-1">باقة القلب والتمثيل الغذائي المتقدم</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">برنامج تدقيق دقيق لصحة الشرايين والغدد والفيتامينات مع تخطيط قلب متقدم.</p>
<div class="flex items-baseline gap-2 mb-space-md">
<span class="font-display-lg text-display-lg text-primary font-bold">7800 ج.س</span>
<span class="font-body-md text-body-md text-secondary line-through">12,500 ج.س</span>
<span class="font-label-sm text-label-sm text-tertiary font-bold">(وفر 4,700 ج.س)</span>
</div>
<ul class="flex flex-col gap-2.5 mb-space-lg">
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>جميع تحاليل باقة الوقاية الأساسية (32 فحصاً)</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>فحص فيتامين د (D3) ومخزون الحديد وفيتامين B12</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>تحليل الغدة الدرقية النشطة (TSH, Free T4)</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>تخطيط القلب الكهربائي السريري (ECG)</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface font-semibold text-primary">
<span class="material-symbols-outlined text-[18px] text-primary">verified</span>
<span>استشارة استشاري باطنية وقائية حضورية أو عن بعد</span>
</li>
</ul>
</div>
<button class="w-full py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all flex items-center justify-center gap-2 shadow-md active:scale-98" type="button">
<span>احجز الآن مع خدمة المنزل مجاناً</span>
<span class="material-symbols-outlined text-[18px]">arrow_back</span>
</button>
</div>
<!-- Package 3: Platinum Executive -->
<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-space-sm">
<span class="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">الفحص التنفيذي لكبار السن</span>
<span class="text-tertiary font-label-sm text-label-sm flex items-center gap-1 font-bold">
<span class="material-symbols-outlined text-[16px]">concierge</span>
              خدمة VIP خاصة
            </span>
</div>
<h3 class="font-headline-lg text-headline-lg text-on-surface font-bold mb-1">باقة الرعاية التنفيذية المتكاملة</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">كشف تخصصي متعدد المدارس الطبية مع مسح إشعاعي وسونار للمؤشرات الحيوية.</p>
<div class="flex items-baseline gap-2 mb-space-md">
<span class="font-display-lg text-display-lg text-primary font-bold">14,500 ج.س</span>
<span class="font-body-md text-body-md text-secondary line-through">21,000 ج.س</span>
<span class="font-label-sm text-label-sm text-tertiary font-bold">(خصم 31%)</span>
</div>
<ul class="flex flex-col gap-2.5 mb-space-lg">
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>أكثر من 55 مؤشراً مخبرياً دقيقاً ومفصلاً</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>أشعة سينية للصدر وسونار للبطن والحوض</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>فحص كثافة العظام والوقاية من الهشاشة</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>فحص ضغط العين والشبكية</span>
</li>
<li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
<span>ملف صحي شامل ومتابعة مستمرة لمدة عام</span>
</li>
</ul>
</div>
<button class="w-full py-3 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2" type="button">
<span>حجز الباقة التنفيذية</span>
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
</button>
</div>
</div>
</section>
<!-- TELEHEALTH INSTANT CARE BANNER -->
<section class="w-full px-margin-desktop pb-space-xl max-w-7xl mx-auto">
<div class="bg-surface-container-high/60 rounded-3xl p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[32px]">support_agent</span>
</div>
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">تحتاج استشارة فورية الآن؟ طبيب مناوب متوفر حالياً</h4>
<p class="font-body-md text-body-md text-on-surface-variant">ابدأ مكالمة فيديو طبية مع طبيب عام معتمد خلال أقل من 5 دقائق بدون موعد مسبق.</p>
</div>
</div>
<button class="px-space-lg py-3 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all flex items-center gap-2 shrink-0 shadow-sm active:scale-95" type="button">
<span class="material-symbols-outlined text-[20px]">videocam</span>
<span>بدء الاستشارة الفورية الآن</span>
</button>
</div>
</section>
</div>`;
