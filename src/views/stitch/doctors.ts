// AUTO-GENERATED from Stitch desktop design: doctors-desktop.html
export const DOCTORS_MAIN = `<div class="flex flex-col w-full">
<!-- Page Header Breadcrumb & Context Banner -->
<section class="w-full px-margin-desktop py-space-md bg-surface-container-low">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
<a class="inline-flex items-center min-h-11 lg:min-h-7 px-1 -mx-1 hover:text-primary transition-colors" href="#">الرئيسية</a>
<span class="material-symbols-outlined text-[16px]">chevron_left</span>
<span class="text-on-surface font-semibold">دليل الأطباء والاستشاريين</span>
<span class="mx-space-xs text-outline-variant">|</span>
<span class="text-secondary font-normal tracking-wide">Doctors &amp; Specialists Directory</span>
</div>
<div class="flex items-center gap-space-md">
<div class="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm text-tertiary">
<span class="material-symbols-outlined text-[18px]">verified</span>
<span class="font-label-sm text-label-sm font-semibold">أطباء معتمدون من المجلس الطبي السوداني (SMC)</span>
</div>
</div>
</div>
</section>
<!-- Main Content Layout (Sidebar + Results) -->
<div class="w-full px-margin-desktop py-space-lg">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- Right Sidebar (RTL First): Comprehensive Filter Panel (lg:col-span-4 xl:col-span-3) -->
<aside class="hidden lg:col-span-4 xl:col-span-3 lg:flex flex-col gap-space-md max-lg:static lg:sticky lg:top-24 scroll-mt-24 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto" id="filters-aside">
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-lg">
<!-- Filter Header -->
<div class="flex items-center justify-between pb-space-xs">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">tune</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">فلترة النتائج</h2>
</div>
<button class="inline-flex items-center min-h-11 lg:min-h-7 px-2 -mx-2 rounded-lg text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors" id="reset-filters" type="button">
              إعادة تعيين الكل
            </button>
</div>
<!-- Quick Search -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">البحث بالاسم أو العيادة</label>
<div class="relative w-full">
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input class="w-full pr-10 pl-space-md min-h-11 py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" id="doc-search" placeholder="ابحث عن طبيب، تخصص، مستشفى..." type="text"/>
</div>
</div>
<!-- Location & City -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">المدينة والفرع</label>
<div class="relative w-full">
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">location_on</span>
<select class="w-full pr-10 pl-space-md min-h-11 py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none cursor-pointer" id="doc-city">
<option selected="">الخرطوم (كافة الأحياء والمراكز)</option>
<option>أم درمان</option>
<option>الخرطوم بحري</option>
<option>بورتسودان</option>
<option>ود مداني</option>
<option>نيالا</option>
<option>الفاشر</option>
<option>عطبرة</option>
<option>كسلا</option>
<option>الأبيض</option>
<option>سنار</option>
<option>دنقلا</option>
</select>
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
</div>
<!-- Consultation Type -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">نوع الاستشارة</label>
<div class="grid grid-cols-2 gap-space-xs bg-surface-container-low p-1 rounded-xl" id="doc-consult">
<button class="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-sm text-label-sm transition-all" data-consult="clinic" type="button">
<span class="material-symbols-outlined text-[16px]">apartment</span>
<span>زيارة عيادة</span>
</button>
<button class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-secondary hover:text-on-surface font-label-sm text-label-sm transition-all" data-consult="video" type="button">
<span class="material-symbols-outlined text-[16px]">videocam</span>
<span>استشارة فيديو</span>
</button>
</div>
</div>
<!-- Availability Quick Chips -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">المواعيد المتاحة</label>
<div class="flex flex-wrap gap-1.5" id="doc-avail">
<button class="px-space-md py-1.5 min-h-11 lg:min-h-7 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1" data-avail="any" type="button">
<span class="material-symbols-outlined text-[14px]">check</span>
<span>الكل (أي موعد)</span>
</button>
<button class="px-space-md py-1.5 min-h-11 lg:min-h-7 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors" data-avail="today" type="button">
                اليوم
              </button>
<button class="px-space-md py-1.5 min-h-11 lg:min-h-7 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors" data-avail="tomorrow" type="button">
                غداً
              </button>
<button class="px-space-md py-1.5 min-h-11 lg:min-h-7 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors" data-avail="3days" type="button">
                خلال 3 أيام
              </button>
<button class="px-space-md py-1.5 min-h-11 lg:min-h-7 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors" data-avail="7days" type="button">
                خلال 7 أيام
              </button>
</div>
</div>
<!-- Specialty Category -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">التخصص الطبي</label>
<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1" id="doc-specs">
<label class="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors bg-surface-container-low/60">
<div class="flex items-center gap-2">
<input checked="" class="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox"/>
<span class="font-body-sm text-body-sm text-on-surface font-semibold">أمراض القلب والشرايين</span>
</div>
<span class="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-full">34</span>
</label>
</div>
</div>
<!-- Doctor Gender -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">جنس الطبيب</label>
<div class="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl text-center" id="doc-gender">
<button class="min-h-11 lg:min-h-7 py-1.5 rounded-lg bg-surface-container-lowest font-label-sm text-label-sm text-primary shadow-sm" data-gender="all" type="button">الكل</button>
<button class="min-h-11 lg:min-h-7 py-1.5 rounded-lg font-label-sm text-label-sm text-secondary hover:text-on-surface" data-gender="female" type="button">طبيبة (أنثى)</button>
<button class="min-h-11 lg:min-h-7 py-1.5 rounded-lg font-label-sm text-label-sm text-secondary hover:text-on-surface" data-gender="male" type="button">طبيب (ذكر)</button>
</div>
</div>
<!-- Insurance Provider Filter -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-md text-label-md text-on-surface font-semibold">شركة التأمين الطبي</label>
<span class="text-tertiary font-label-sm text-label-sm">مباشر CCHI</span>
</div>
<div class="relative w-full">
<select class="w-full pr-space-md pl-space-md py-2 min-h-11 lg:min-h-7 bg-surface-container-low rounded-xl text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none cursor-pointer" id="doc-insurance">
<option selected="">كافة شركات التأمين المعتمدة</option>
<option>شيكان للتأمين</option>
<option>أتلاف للتأمين</option>
<option>سلام للتأمين</option>
<option>السودان للتأمين</option>
<option>النيل للتأمين</option>
<option>أعمال للتأمين</option>
<option>الوحدة للتأمين</option>
</select>
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
</div>
<!-- Price Range Slider Indicator -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-md text-label-md text-on-surface font-semibold">سعر الكشفية</label>
<span class="font-label-md text-label-md text-primary font-bold" id="doc-price-label">حتى 8,000 ج.س</span>
</div>
<input class="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer" id="doc-price" max="8000" min="1000" type="range" value="8000"/>
<div class="flex justify-between font-label-sm text-label-sm text-secondary mt-1">
<span>1,000 ج.س</span>
<span>8,000+ ج.س</span>
</div>
</div>
<!-- Minimum Patient Rating -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">تقييم المرضى</label>
<div class="flex items-center gap-2" id="doc-rating">
<button class="flex-1 min-h-11 lg:min-h-7 py-1.5 bg-surface-container-low hover:bg-surface-container rounded-lg flex items-center justify-center gap-1 font-label-sm text-label-sm text-on-surface" data-rating="0" type="button">
<span class="material-symbols-outlined text-warning text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>الكل</span>
</button>
<button class="flex-1 min-h-11 lg:min-h-7 py-1.5 bg-surface-container-low hover:bg-surface-container rounded-lg flex items-center justify-center gap-1 font-label-sm text-label-sm text-on-surface" data-rating="4.8" type="button">
<span class="material-symbols-outlined text-warning text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.8+</span>
</button>
<button class="flex-1 min-h-11 lg:min-h-7 py-1.5 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center gap-1 font-label-sm text-label-sm font-semibold" data-rating="4.5" type="button">
<span class="material-symbols-outlined text-amber-300 text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.5+</span>
</button>
</div>
</div>
</div>
<!-- Trust Mini-Card -->
<div class="bg-primary/5 rounded-2xl p-space-md flex items-center gap-space-sm text-on-surface">
<div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0">
<span class="material-symbols-outlined text-[20px]">shield_with_heart</span>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-primary">ضمان حجز ميعادي</span>
<span class="font-body-sm text-body-sm text-secondary">تأكيد فوري دون انتظار في الاستقبال وإلغاء مجاني قبل 3 ساعات</span>
</div>
</div>
</aside>
<!-- Main Results Column (lg:col-span-8 xl:col-span-9) -->
<main class="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-md">
<!-- Mobile Filter Toggle Bar -->
<div class="lg:hidden bg-surface-container-lowest rounded-2xl px-space-md py-space-xs shadow-sm flex items-center justify-between" id="filters-bar">
<button class="flex items-center gap-space-xs px-space-md py-2 min-h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold" id="filters-toggle" type="button">
<span class="material-symbols-outlined text-[18px]">tune</span>
<span id="filters-toggle-label">فلترة النتائج</span>
<span id="filters-badge" class="hidden min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-on-primary text-[11px] font-bold tabular-nums">0</span>
</button>
<span class="material-symbols-outlined text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
<!-- Results Header Strip -->
<div class="bg-surface-container-lowest rounded-2xl px-space-lg py-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="flex flex-col">
<div class="flex items-center gap-2">
<h1 class="font-headline-md text-headline-md text-on-surface">أطباء واستشاريو الخرطوم</h1>
<span class="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold" id="doc-count">—</span>
</div>
<p class="font-body-sm text-body-sm text-secondary mt-0.5" id="doc-count-sub">جارٍ تحميل الأطباء…</p>
</div>
<!-- Sort Selector -->
<div class="flex items-center gap-space-sm">
<span class="font-label-sm text-label-sm text-secondary whitespace-nowrap">الترتيب حسب:</span>
<div class="relative">
<select class="min-h-11 lg:min-h-7 pr-space-md pl-8 py-2 bg-surface-container-low rounded-xl text-on-surface font-label-md text-label-md appearance-none focus:outline-none cursor-pointer" id="doc-sort">
<option value="rating">الأعلى تقييماً (Top Rated)</option>
<option value="earliest">أقرب موعد متاح (Earliest Slot)</option>
<option value="price">الأقل سعراً (Lowest Price)</option>
<option value="experience">الأكثر خبرة (Years of Experience)</option>
</select>
<span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
</div>
</div>
<!-- Active Filter Pills Strip -->
<div id="doc-active" class="hidden items-center gap-space-xs flex-wrap"></div>
<!-- Doctor Cards Stack -->
<div class="flex flex-col gap-space-md" id="doc-list">
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm text-center text-on-surface-variant font-body-md text-body-md">جارٍ تحميل الأطباء…</div>
</div>
<!-- Pagination Bar -->
<div class="hidden items-center justify-between bg-surface-container-lowest rounded-2xl px-space-lg py-space-md shadow-sm mt-space-sm" id="doc-pagination">
<button class="flex items-center gap-1 px-space-md py-2 rounded-full text-secondary hover:text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
<span>الصفحة السابقة</span>
</button>
<div class="flex items-center gap-1">
<button class="w-10 h-10 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center shadow-sm" type="button">1</button>
<button class="w-10 h-10 rounded-full hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors" type="button">2</button>
<button class="w-10 h-10 rounded-full hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors" type="button">3</button>
<span class="text-secondary px-2">...</span>
<button class="w-10 h-10 rounded-full hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors" type="button">12</button>
</div>
<button class="flex items-center gap-1 px-space-md py-2 rounded-full text-primary hover:text-primary-container font-label-md text-label-md hover:bg-surface-container-low transition-colors font-semibold" type="button">
<span>الصفحة التالية</span>
<span class="material-symbols-outlined text-[18px]">arrow_back</span>
</button>
</div>
<!-- Emergency / Urgent Care Floating Assistant Banner -->
<div class="relative overflow-hidden rounded-2xl bg-surface-container-highest p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm">
<div class="flex items-center gap-space-md relative z-10">
<div class="w-14 h-14 rounded-2xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-md">
<span class="material-symbols-outlined text-[32px]">emergency</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">هل تحتاج رعاية طبية عاجلة أو فورية؟</h4>
<span class="bg-error/10 text-error px-2 py-0.5 rounded font-label-sm text-label-sm font-bold">طوارئ</span>
</div>
<p class="font-body-md text-body-md text-secondary mt-0.5">اتصل مباشرة بخدمة الإسعاف الوطني 999 أو احجز طبيب طوارئ منزلي في الخرطوم خلال 30 دقيقة.</p>
</div>
</div>
<div class="flex items-center gap-space-sm shrink-0 relative z-10">
<a class="px-space-lg py-2.5 rounded-full bg-error text-on-error hover:bg-error/90 font-label-md text-label-md transition-all shadow-sm flex items-center gap-2" href="tel:999">
<span class="material-symbols-outlined text-[18px]">call</span>
<span>اتصال 999</span>
</a>
<button class="px-space-lg py-2.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors" type="button">
              طوارئ العيادات الافتراضية
            </button>
</div>
</div>
</main>
</div>
</div>
</div>`;
