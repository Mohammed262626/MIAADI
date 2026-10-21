// AUTO-GENERATED from Stitch desktop design: doctors-desktop.html
export const DOCTORS_MAIN = `<div class="flex flex-col w-full">
<div class="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-8 sm:px-6">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- Right Sidebar (RTL First): Comprehensive Filter Panel (lg:col-span-4 xl:col-span-3) -->
<aside class="hidden lg:col-span-4 xl:col-span-3 lg:flex flex-col gap-space-md max-lg:static lg:sticky lg:top-24 scroll-mt-24 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto" id="filters-aside">
<div class="flex flex-col gap-4 rounded-xl border border-line bg-surface-container-lowest p-4">
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
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
<input class="h-10 w-full rounded-lg border border-line bg-surface-container-lowest pl-3 pr-10 text-[13px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary" id="doc-search" placeholder="ابحث عن طبيب، تخصص، مستشفى..." type="text"/>
</div>
</div>
<!-- Location & City -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">المدينة والفرع</label>
<div class="relative w-full">
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">location_on</span>
<select class="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface-container-lowest pl-3 pr-10 text-start text-[13px] text-on-surface outline-none" id="doc-city">
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
<!-- Availability Quick Chips -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">المواعيد المتاحة</label>
<div class="flex flex-wrap gap-1.5" id="doc-avail">
<button class="inline-flex h-8 items-center gap-1 rounded-md bg-surface-container-highest px-2.5 text-[12px] font-semibold text-on-surface" data-avail="any" type="button">
<span class="material-symbols-outlined text-[14px]">check</span>
<span>الكل (أي موعد)</span>
</button>
<button class="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-avail="today" type="button">
                اليوم
              </button>
<button class="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-avail="tomorrow" type="button">
                غداً
              </button>
<button class="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-avail="3days" type="button">
                خلال 3 أيام
              </button>
<button class="inline-flex h-8 items-center rounded-md px-2.5 text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-avail="7days" type="button">
                خلال 7 أيام
              </button>
</div>
</div>
<!-- Specialty Category -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">التخصص الطبي</label>
<div class="flex max-h-48 flex-col gap-0.5 overflow-y-auto pe-1" id="doc-specs">
<label class="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-surface-container-low">
<div class="flex items-center gap-2">
<input checked="" class="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox"/>
<span class="font-body-sm text-body-sm text-on-surface font-semibold">أمراض القلب والشرايين</span>
</div>
<span class="text-[12px] tabular-nums text-on-surface-variant">34</span>
</label>
</div>
</div>
<!-- Doctor Gender -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">جنس الطبيب</label>
<div class="grid grid-cols-3 gap-0.5 rounded-lg bg-surface-container-low p-0.5 text-center" id="doc-gender">
<button class="h-8 rounded-md border border-line bg-surface-container-lowest text-[12px] font-semibold text-on-surface" data-gender="all" type="button">الكل</button>
<button class="h-8 rounded-md text-[12px] text-on-surface-variant transition-colors hover:text-on-surface" data-gender="female" type="button">طبيبة (أنثى)</button>
<button class="h-8 rounded-md text-[12px] text-on-surface-variant transition-colors hover:text-on-surface" data-gender="male" type="button">طبيب (ذكر)</button>
</div>
</div>
<!-- Insurance Provider Filter -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-md text-label-md text-on-surface font-semibold">شركة التأمين الطبي</label>
<span class="text-tertiary font-label-sm text-label-sm">مباشر CCHI</span>
</div>
<div class="relative w-full">
<select class="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface-container-lowest px-3 text-start text-[13px] text-on-surface outline-none" id="doc-insurance">
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
<button class="flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-line bg-surface-container-lowest text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-rating="0" type="button">
<span class="material-symbols-outlined text-warning text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>الكل</span>
</button>
<button class="flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-line bg-surface-container-lowest text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container" data-rating="4.8" type="button">
<span class="material-symbols-outlined text-warning text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.8+</span>
</button>
<button class="flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-surface-container-highest text-[12px] font-semibold text-on-surface" data-rating="4.5" type="button">
<span class="material-symbols-outlined text-amber-300 text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.5+</span>
</button>
</div>
</div>
</div>
<!-- Trust Mini-Card -->
<div class="flex items-center gap-3 rounded-lg bg-surface-container-low p-3 text-on-surface">
<div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
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
<div class="flex items-center justify-between rounded-lg border border-line bg-surface-container-lowest px-3 py-1.5 lg:hidden" id="filters-bar">
<button class="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[13px] font-semibold text-on-surface" id="filters-toggle" type="button">
<span class="material-symbols-outlined text-[18px]">tune</span>
<span id="filters-toggle-label">فلترة النتائج</span>
<span id="filters-badge" class="hidden min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-on-primary text-[11px] font-bold tabular-nums">0</span>
</button>
<span class="material-symbols-outlined text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
<!-- Results Header Strip -->
<div class="flex flex-col gap-3 pt-1 md:flex-row md:items-end md:justify-between">
<div class="flex flex-col">
<div class="flex items-center gap-2">
<h1 class="text-[24px] font-bold leading-tight text-on-surface">أطباء واستشاريو الخرطوم</h1>
<span class="text-[14px] font-medium tabular-nums text-on-surface-variant" id="doc-count">—</span>
</div>
<p class="mt-1 text-[14px] text-on-surface-variant" id="doc-count-sub">جارٍ تحميل الأطباء…</p>
</div>
<!-- Sort Selector -->
<div class="flex items-center gap-space-sm">
<span class="font-label-sm text-label-sm text-secondary whitespace-nowrap">الترتيب حسب:</span>
<div class="relative">
<select class="h-10 cursor-pointer appearance-none rounded-lg border border-line bg-surface-container-lowest pe-8 ps-3 text-start text-[13px] text-on-surface outline-none" id="doc-sort">
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
<div class="rounded-xl border border-line bg-surface-container-lowest px-6 py-10 text-center text-[13px] text-on-surface-variant">جارٍ تحميل الأطباء…</div>
</div>
<div class="hidden items-center justify-between rounded-xl border border-line bg-surface-container-lowest px-4 py-3" id="doc-pagination"></div>
</main>
</div>
</div>
</div>`;
