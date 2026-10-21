// Hospitals & medical centers directory (#hospitals).
export const HOSPITALS_MAIN = `<div class="flex flex-col w-full">
<div class="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-8 sm:px-6">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- Filter panel -->
<aside class="hidden lg:col-span-4 xl:col-span-3 lg:flex flex-col gap-space-md max-lg:static lg:sticky lg:top-24 scroll-mt-24 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto" id="filters-aside">
<div class="flex flex-col gap-4 rounded-xl border border-line bg-surface-container-lowest p-4">
<div class="flex items-center justify-between pb-space-xs">
<div class="flex items-center gap-space-xs">
<span aria-hidden="true" class="material-symbols-outlined text-primary text-[22px]">tune</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">فلترة النتائج</h2>
</div>
<button class="inline-flex items-center min-h-11 lg:min-h-7 px-2 -mx-2 rounded-lg text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors" id="reset-filters" type="button">إعادة تعيين الكل</button>
</div>
<!-- Search -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold" for="hosp-search">البحث</label>
<div class="relative w-full">
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
<input class="h-10 w-full rounded-lg border border-line bg-surface-container-lowest pl-3 pr-10 text-[13px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary" id="hosp-search" placeholder="اسم المستشفى، المدينة أو العنوان" type="text"/>
</div>
</div>
<!-- City -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold" for="hosp-city">المدينة</label>
<div class="relative w-full">
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">location_on</span>
<select class="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface-container-lowest pl-3 pr-10 text-start text-[13px] text-on-surface outline-none" id="hosp-city">
<option value="" selected="">كافة المدن</option>
</select>
<span aria-hidden="true" class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
</div>
</div>
<!-- Kind -->
<div class="flex flex-col gap-space-xs">
<label class="font-label-md text-label-md text-on-surface font-semibold">النوع</label>
<div class="grid grid-cols-3 gap-0.5 rounded-lg bg-surface-container-low p-0.5 text-center" id="hosp-kind">
<button class="h-8 rounded-md border border-line bg-surface-container-lowest text-[12px] font-semibold text-on-surface" data-kind="" type="button">الكل</button>
<button class="h-8 rounded-md text-[12px] text-on-surface-variant transition-colors hover:text-on-surface" data-kind="hospital" type="button">مستشفى</button>
<button class="h-8 rounded-md text-[12px] text-on-surface-variant transition-colors hover:text-on-surface" data-kind="center" type="button">مركز طبي</button>
</div>
</div>
</div>
<!-- Honest scope -->
<div class="flex items-center gap-3 rounded-lg bg-surface-container-low p-3 text-on-surface">
<div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
<span aria-hidden="true" class="material-symbols-outlined text-[20px]">local_hospital</span>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-primary">مراكز عليها أطباء في ميعادي</span>
<span class="font-body-sm text-body-sm text-secondary">نعرض فقط المستشفيات والمراكز التي يمكنك حجز موعد فيها — الأسماء والعناوين من بيانات المنصة.</span>
</div>
</div>
</aside>
<!-- Results -->
<main class="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-md">
<div class="flex items-center justify-between rounded-lg border border-line bg-surface-container-lowest px-3 py-1.5 lg:hidden" id="filters-bar">
<button class="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[13px] font-semibold text-on-surface" id="filters-toggle" type="button">
<span aria-hidden="true" class="material-symbols-outlined text-[18px]">tune</span>
<span id="filters-toggle-label">فلترة النتائج</span>
</button>
<span aria-hidden="true" class="material-symbols-outlined text-outline text-[18px] pointer-events-none transition-transform" id="filters-chevron">expand_more</span>
</div>
<div class="flex flex-col gap-3 pt-1 md:flex-row md:items-end md:justify-between">
<div class="flex flex-col">
<div class="flex items-center gap-2">
<h1 class="text-[24px] font-bold leading-tight text-on-surface" id="hosp-title">المستشفيات والمراكز في السودان</h1>
<span class="text-[14px] font-medium tabular-nums text-on-surface-variant" id="hosp-count">…</span>
</div>
<p class="mt-1 text-[14px] text-on-surface-variant" id="hosp-count-sub">جارٍ تحميل المراكز…</p>
</div>
</div>
<!-- Skeleton cards -->
<div class="flex flex-col gap-space-md" id="hosp-list">
${[0, 1, 2, 3].map(() => `<div class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-lowest p-4 sm:p-5" aria-hidden="true">
<div class="flex items-start justify-between gap-3">
<div class="w-full">
<div class="h-4 w-2/5 rounded bg-surface-container-high"></div>
<div class="mt-2 h-3 w-3/5 rounded bg-surface-container"></div>
</div>
<div class="h-6 w-16 shrink-0 rounded-full bg-surface-container-high"></div>
</div>
<div class="flex gap-1.5"><div class="h-6 w-24 rounded-md bg-surface-container"></div><div class="h-6 w-20 rounded-md bg-surface-container"></div><div class="h-6 w-28 rounded-md bg-surface-container"></div></div>
<div class="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3">
<div class="h-3 w-40 rounded bg-surface-container"></div>
<div class="h-9 w-28 rounded-lg bg-surface-container-high"></div>
</div>
</div>`).join("")}
</div>
</main>
</div>
</div>
</div>`;
