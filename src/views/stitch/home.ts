// Home shell — painted instantly, then wired live in homeLive.ts.
// Copy is limited to committed product reality (see docs/PRODUCT.md).

// Hero card skeleton — also reused by the retry path in homeLive.ts.
export const NEXT_APPOINTMENT_SKELETON = `<div class="bg-surface-container-lowest rounded-3xl p-space-lg shadow-lg relative overflow-hidden animate-pulse">
<div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
<div class="flex flex-col lg:flex-row items-center justify-between gap-space-lg">
<div class="flex items-center gap-space-md flex-1 w-full">
<div class="w-16 h-16 rounded-2xl bg-surface-container-high shrink-0"></div>
<div class="flex flex-col gap-2 flex-1">
<div class="h-4 w-40 rounded-full bg-surface-container-high"></div>
<div class="h-3 w-64 max-w-full rounded-full bg-surface-container"></div>
</div>
</div>
<div class="h-16 w-full lg:w-72 rounded-2xl bg-surface-container"></div>
</div>
</div>`;

export const FEATURED_DOCTORS_SKELETON = [0, 1, 2, 3].map(() => `
<div class="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm animate-pulse">
<div class="flex items-start gap-space-sm mb-space-sm">
<div class="w-16 h-16 rounded-2xl bg-surface-container-high shrink-0"></div>
<div class="flex flex-col gap-2 flex-1 pt-1">
<div class="h-3 w-2/3 rounded-full bg-surface-container-high"></div>
<div class="h-3 w-1/2 rounded-full bg-surface-container"></div>
</div>
</div>
<div class="h-24 rounded-2xl bg-surface-container-low mb-space-sm"></div>
<div class="h-4 w-1/2 rounded-full bg-surface-container"></div>
</div>`).join("");

export const HOME_MAIN = `<div class="flex flex-col w-full">
<!-- HERO SECTION WITH INTEGRATED SEARCH -->
<section class="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low/70 via-surface to-surface pb-space-xl">
<!-- Ambient organic medical gradient accents (strictly contained) -->
<div class="absolute -top-24 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute top-48 left-10 w-80 h-80 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div class="w-full px-margin-desktop pt-space-xl max-w-7xl mx-auto flex flex-col items-center">
<div class="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm mb-space-md">
<span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
<span class="font-label-md text-label-md text-primary font-semibold">حجز مواعيد طبية موثوق في السودان</span>
</div>
<div class="text-center max-w-4xl mb-space-lg">
<h1 class="font-display-lg text-[2rem] leading-[2.5rem] sm:text-[2.25rem] sm:leading-[2.9rem] lg:text-[2.75rem] lg:leading-[3.4rem] text-on-surface tracking-tight mb-space-sm">
          احجز موعدك الطبي بكل ثقة وسهولة
        </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          تصفّح الأطباء المتاحين فعلياً في الخرطوم وأم درمان وبورتسودان، واختر الموعد الذي يناسبك — تُحدَّث الجداول لحظياً، ولا يمكن حجز الموعد نفسه مرتين.
        </p>
</div>
<!-- Search Deck -->
<div class="w-full max-w-5xl bg-surface-container-lowest rounded-3xl p-space-md shadow-xl relative z-10">
<form id="hero-search" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm items-center" autocomplete="off">
<!-- Query Field -->
<div class="lg:col-span-5 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-primary/50">
<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[22px]">stethoscope</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary" for="hero-q">التخصص أو الطبيب أو المستشفى</label>
<input id="hero-q" class="bg-transparent h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none placeholder:text-outline truncate" placeholder="مثال: قلب، أسنان، مستشفى النور..." type="search"/>
</div>
</div>
<!-- City Selector -->
<div class="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-primary/50">
<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[22px]">pin_drop</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary" for="hero-city">المدينة</label>
<select id="hero-city" class="bg-transparent appearance-none h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option value="">كافة المدن</option>
</select>
</div>
<span aria-hidden="true" class="material-symbols-outlined text-[20px] text-outline shrink-0">expand_more</span>
</div>
<!-- Insurance Selector -->
<div class="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-primary/50">
<div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[22px]">verified_user</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<label class="font-label-sm text-label-sm text-secondary" for="hero-insurance">شركة التأمين</label>
<select id="hero-insurance" class="bg-transparent appearance-none h-11 w-full font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
<option value="">كافة شركات التأمين</option>
</select>
</div>
<span aria-hidden="true" class="material-symbols-outlined text-[20px] text-outline shrink-0">expand_more</span>
</div>
<!-- Submit Button -->
<div class="lg:col-span-1 flex items-center justify-center h-full">
<button class="w-full h-12 lg:h-14 rounded-2xl bg-primary text-on-primary hover:bg-primary-container press flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest" type="submit" aria-label="ابحث عن طبيب">
<span aria-hidden="true" class="material-symbols-outlined text-[24px]">search</span>
<span class="lg:hidden font-label-md text-label-md">ابحث</span>
</button>
</div>
</form>
<!-- Fast Filter Pills -->
<div class="mt-space-md pt-space-sm flex items-center flex-wrap gap-space-xs">
<span class="font-label-sm text-label-sm text-secondary me-2 w-full sm:w-auto">خيارات سريعة:</span>
<button class="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="button" data-quick="today">
<span aria-hidden="true" class="material-symbols-outlined text-[16px] text-tertiary">today</span>
<span>كشف عاجل اليوم</span>
</button>
<button class="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-space-md py-1.5 min-h-11 lg:min-h-8 rounded-full bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-label-md text-label-md press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="button" data-quick="price">
<span aria-hidden="true" class="material-symbols-outlined text-[16px] text-secondary">payments</span>
<span>الأقل سعراً</span>
</button>
</div>
</div>
</div>
</section>
<!-- UPCOMING APPOINTMENT SLOT (filled live) -->
<section id="home-next-appointment" class="relative w-full px-margin-desktop -mt-6 max-w-7xl mx-auto z-20" aria-live="polite">
${NEXT_APPOINTMENT_SKELETON}
</section>
<!-- MEDICAL SPECIALTIES BENTO GRID (8 TILES) -->
<section class="w-full px-margin-desktop py-space-xl max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<h2 class="font-display-lg text-display-lg text-on-surface font-bold">التخصصات الطبية</h2>
<p class="font-body-md text-body-md text-on-surface-variant">اختر التخصص لتتصفح الأطباء المتاحين فيه</p>
</div>
<a class="inline-flex items-center gap-1.5 min-h-11 py-1 text-primary font-label-md text-label-md group link-arrow" href="#doctors">
<span>عرض جميع الأطباء</span>
<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>
</a>
</div>
<!-- 8 Grid Cards -->
<div id="home-specialties" class="grid grid-cols-2 md:grid-cols-4 gap-space-md">
<button type="button" data-specialty-link="cardiology" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">cardiology</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="cardiology">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">القلب والأوعية</span>
<p class="font-label-sm text-label-sm text-secondary">Cardiology &amp; Vascular</p>
</div>
</button>
<button type="button" data-specialty-link="dental" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">dentistry</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="dental">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب وجراحة الأسنان</span>
<p class="font-label-sm text-label-sm text-secondary">Dental &amp; Oral Care</p>
</div>
</button>
<button type="button" data-specialty-link="pediatrics" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">child_care</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="pediatrics">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب الأطفال وحديثي الولادة</span>
<p class="font-label-sm text-label-sm text-secondary">Pediatrics &amp; Neonatal</p>
</div>
</button>
<button type="button" data-specialty-link="dermatology" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">clean_hands</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="dermatology">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">الجلدية والتجميل والليزر</span>
<p class="font-label-sm text-label-sm text-secondary">Dermatology &amp; Laser</p>
</div>
</button>
<button type="button" data-specialty-link="orthopedics" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">skeleton</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="orthopedics">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">العظام والمفاصل والعمود الفقري</span>
<p class="font-label-sm text-label-sm text-secondary">Orthopedic Surgery</p>
</div>
</button>
<button type="button" data-specialty-link="ophthalmology" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">visibility</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="ophthalmology">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">طب وجراحة العيون</span>
<p class="font-label-sm text-label-sm text-secondary">Ophthalmology</p>
</div>
</button>
<button type="button" data-specialty-link="ent" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">hearing</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="ent">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">أنف وأذن وحنجرة</span>
<p class="font-label-sm text-label-sm text-secondary">ENT Head &amp; Neck</p>
</div>
</button>
<button type="button" data-specialty-link="internal" class="group text-start bg-surface-container-lowest hover:bg-primary-container/10 p-space-md rounded-3xl press shadow-sm hover:shadow-md flex flex-col justify-between h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
<div class="flex items-center justify-between">
<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span aria-hidden="true" class="material-symbols-outlined text-[28px]">vital_signs</span>
</div>
<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary group-hover:bg-surface-container-lowest font-medium" data-specialty-count="internal">…</span>
</div>
<div>
<span role="heading" aria-level="3" class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">الباطنية والجهاز الهضمي</span>
<p class="font-label-sm text-label-sm text-secondary">Internal Medicine</p>
</div>
</button>
</div>
</section>
<!-- AVAILABLE DOCTORS -->
<section class="w-full px-margin-desktop py-space-xl bg-surface-container-low/50">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<h2 class="font-display-lg text-display-lg text-on-surface font-bold">أطباء متاحون للحجز الآن</h2>
<p class="font-body-md text-body-md text-on-surface-variant">الأطباء الذين لديهم مواعيد متاحة فعلياً خلال الأسبوع القادم</p>
</div>
<a class="inline-flex items-center gap-1.5 min-h-11 py-1 text-primary font-label-md text-label-md group link-arrow" href="#doctors">
<span>عرض الجميع</span>
<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>
</a>
</div>
<div id="featured-doctors" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md" aria-busy="true">
${FEATURED_DOCTORS_SKELETON}
</div>
</div>
</section>
<!-- WHY THIS WORKS -->
<section class="w-full px-margin-desktop py-space-xl max-w-7xl mx-auto">
<!-- the brand panel keeps a dark surface in dark mode via .advantage-card (see tailwind.css) -->
<div class="advantage-card bg-primary text-on-primary rounded-3xl p-space-xl relative overflow-hidden shadow-xl">
<div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-container/40 blur-2xl pointer-events-none"></div>
<div class="relative z-10">
<div class="max-w-2xl mb-space-lg">
<h2 class="font-display-lg text-display-lg text-on-primary font-bold mb-space-xs">لماذا تحجز عبر ميعادي؟</h2>
<p class="font-body-md text-body-md text-on-primary/85">
            كل ما تراه في المنصة يأتي مباشرة من جدول العيادة — لا قوائم منفصلة ولا تأكيدات ورقية.
          </p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-x-space-xl gap-y-0">
<div class="flex items-start gap-space-md py-space-md border-b border-on-primary/15">
<span class="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[24px]">lock_clock</span>
</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">حجز بلا تعارض</h3>
<p class="font-body-sm text-body-sm text-on-primary/85">كل عملية حجز تُنفَّذ داخل معاملة واحدة على قاعدة البيانات، فلا يحصل مريضان على الموعد نفسه.</p>
</div>
</div>
<div class="flex items-start gap-space-md py-space-md border-b border-on-primary/15">
<span class="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[24px]">sync</span>
</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">جدول يُحدَّث لحظياً</h3>
<p class="font-body-sm text-body-sm text-on-primary/85">تظهر المواعيد المتاحة والمحجوزة فور تغيّرها، دون تحديث الصفحة — ما تراه هو ما في العيادة.</p>
</div>
</div>
<div class="flex items-start gap-space-md py-space-md border-b border-on-primary/15 md:border-b-0">
<span class="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[24px]">event_repeat</span>
</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">إدارة موعدك بنفسك</h3>
<p class="font-body-sm text-body-sm text-on-primary/85">أعد الجدولة أو ألغِ موعدك في أي وقت من صفحة حجوزاتك، دون اتصال ولا انتظار.</p>
</div>
</div>
<div class="flex items-start gap-space-md py-space-md">
<span class="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span aria-hidden="true" class="material-symbols-outlined text-[24px]">chat</span>
</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-primary font-bold mb-1">تذكير واتساب</h3>
<p class="font-body-sm text-body-sm text-on-primary/85">شارك تفاصيل موعدك على واتساب في نقرة واحدة، ليبقى الموعد واضحاً لك ولمن يرافقك.</p>
</div>
</div>
</div>
</div>
</div>
</section>
</div>`;
