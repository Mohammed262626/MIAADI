// AUTO-GENERATED from Stitch desktop design: doctorprofile-desktop.html
export const DOCTORPROFILE_MAIN = `<div class="flex flex-col w-full">
<!-- Sub-Navigation & Breadcrumbs -->
<section class="w-full border-b border-line bg-surface">
<div class="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
<nav class="flex items-center gap-0.5 text-[13px] text-on-surface-variant">
<a class="inline-flex h-8 items-center gap-1 rounded px-1 transition-colors hover:text-primary" href="#home">
<span class="material-symbols-outlined text-[15px]" aria-hidden="true">home</span>
<span>الرئيسية</span>
</a>
<span class="material-symbols-outlined text-[14px] text-outline" aria-hidden="true">chevron_left</span>
<a class="inline-flex h-8 items-center px-1 transition-colors hover:text-primary" href="#doctors" id="dp-crumb-spec"><span class="block h-4 w-32 rounded bg-surface-container-high" aria-hidden="true"></span></a>
<span class="material-symbols-outlined text-[14px] text-outline" aria-hidden="true">chevron_left</span>
<span class="font-medium text-on-surface" id="dp-crumb-name"><span class="block h-4 w-24 rounded bg-surface-container-high" aria-hidden="true"></span></span>
</nav>
<button class="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" type="button">
<span class="material-symbols-outlined text-[16px]" aria-hidden="true">share</span>
<span class="hidden sm:inline">مشاركة</span>
</button>
</div>
</section>
<!-- Doctor Hero Profile Header -->
<section class="w-full border-b border-line bg-surface py-8">
<div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
<div class="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
<!-- Doctor Avatar & Identity -->
<div class="flex items-start gap-3 sm:items-center">
<div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container sm:h-24 sm:w-24 md:h-28 md:w-28">
<div class="grid h-full w-full place-items-center whitespace-nowrap rounded-xl bg-surface-container-high text-[28px] font-bold leading-none text-on-primary" id="dp-avatar" aria-hidden="true"></div>
</div>
<div class="flex min-w-0 flex-col">
<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
<span class="text-[13px] font-semibold text-primary" id="dp-title-pill"><span class="block h-4 w-28 rounded bg-surface-container-high" aria-hidden="true"></span></span>
<span class="inline-flex items-center gap-1.5 text-[13px] text-tertiary" id="dp-availability"><span class="block h-4 w-40 rounded bg-surface-container-high" aria-hidden="true"></span></span>
</div>
<h1 class="mt-1 text-[28px] font-bold leading-tight tracking-tight text-on-surface md:text-[32px]" id="dp-name">
<span class="mt-1 block h-8 w-64 max-w-full rounded bg-surface-container-high" aria-hidden="true"></span>
</h1>
<p class="mt-1 max-w-xl text-[14px] text-on-surface-variant" id="dp-specialization">
<span class="block h-4 w-80 max-w-full rounded bg-surface-container" aria-hidden="true"></span>
</p>
<!-- Hospital Affiliation -->
<div class="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-on-surface-variant">
<span class="material-symbols-outlined text-[17px] text-primary" aria-hidden="true">domain</span>
<span class="font-medium text-on-surface" id="dp-hospital"><span class="block h-4 w-40 rounded bg-surface-container-high" aria-hidden="true"></span></span>
<span aria-hidden="true" id="dp-city-sep">·</span>
<span id="dp-hospital-city"><span class="block h-4 w-20 rounded bg-surface-container-high" aria-hidden="true"></span></span>
</div>
<!-- Credentials Badges -->
<div class="mt-3 flex flex-wrap items-center gap-1.5" id="dp-credentials">
<span class="block h-6 w-44 rounded-md bg-surface-container-high" aria-hidden="true"></span>
<span class="block h-6 w-36 rounded-md bg-surface-container-high" aria-hidden="true"></span>
<span class="block h-6 w-40 rounded-md bg-surface-container-high" aria-hidden="true"></span>
</div>
</div>
</div>
<!-- Metric Summary -->
<div class="grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:w-auto">
<div class="bg-surface-container-lowest px-6 py-3 text-center" id="dp-exp-cell">
<p class="text-[22px] font-semibold leading-none tabular-nums text-on-surface" id="dp-exp"><span class="mx-auto block h-6 w-12 rounded bg-surface-container-high" aria-hidden="true"></span></p>
<p class="mt-1 text-[12px] text-on-surface-variant">سنة خبرة</p>
</div>
<div class="bg-surface-container-lowest px-6 py-3 text-center">
<p class="text-[22px] font-semibold leading-none tabular-nums text-on-surface" id="dp-rating"><span class="mx-auto block h-6 w-10 rounded bg-surface-container-high" aria-hidden="true"></span></p>
<p class="mt-1 text-[12px] text-on-surface-variant" id="dp-reviews-count"><span class="mx-auto block h-3 w-16 rounded bg-surface-container" aria-hidden="true"></span></p>
</div>
</div>
</div>
</div>
</section>
<!-- Two-Column Desktop Core Content -->
<main class="w-full max-w-7xl mx-auto px-margin-desktop py-space-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- Right Column: Doctor Dossier & Clinical Information (7 Cols on LG) -->
<div class="order-2 flex flex-col gap-space-xl lg:order-none lg:col-span-7">
<!-- 1. About Section -->
<article class="bg-surface-container-lowest rounded-xl p-space-xl">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
<h2 class="text-[18px] font-bold leading-snug text-on-surface sm:text-[24px]">نبذة عن الطبيب والتخصص</h2>
</div>
</div>
<p class="font-body-lg text-body-lg text-on-surface leading-relaxed mb-space-md" id="dp-bio-1">
<span class="mb-2 block h-4 w-full rounded bg-surface-container-high" aria-hidden="true"></span>
<span class="mb-2 block h-4 w-11/12 rounded bg-surface-container-high" aria-hidden="true"></span>
<span class="block h-4 w-4/5 rounded bg-surface-container-high" aria-hidden="true"></span>
</p>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed" id="dp-bio-2">
<span class="mb-2 block h-3.5 w-full rounded bg-surface-container" aria-hidden="true"></span>
<span class="block h-3.5 w-3/4 rounded bg-surface-container" aria-hidden="true"></span>
</p>
<!-- Highlights Pill Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-lg pt-space-md bg-surface-container-low/50 rounded-xl p-space-md" id="dp-highlights">
<div class="flex items-center gap-space-xs" aria-hidden="true"><span class="h-4 w-4 shrink-0 rounded-full bg-surface-container-high"></span><span class="h-3 w-40 max-w-full rounded bg-surface-container-high"></span></div>
<div class="flex items-center gap-space-xs" aria-hidden="true"><span class="h-4 w-4 shrink-0 rounded-full bg-surface-container-high"></span><span class="h-3 w-44 max-w-full rounded bg-surface-container-high"></span></div>
<div class="flex items-center gap-space-xs" aria-hidden="true"><span class="h-4 w-4 shrink-0 rounded-full bg-surface-container-high"></span><span class="h-3 w-36 max-w-full rounded bg-surface-container-high"></span></div>
<div class="flex items-center gap-space-xs" aria-hidden="true"><span class="h-4 w-4 shrink-0 rounded-full bg-surface-container-high"></span><span class="h-3 w-48 max-w-full rounded bg-surface-container-high"></span></div>
</div>
</article>
<!-- 2. Sub-specialties & Conditions Treated -->
<article class="bg-surface-container-lowest rounded-xl p-space-xl">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-tertiary-fixed-dim/40 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[20px]" id="dp-services-icon" aria-hidden="true">medical_services</span>
</div>
<h2 class="text-[18px] font-bold leading-snug text-on-surface sm:text-[24px]">الخدمات التخصصية</h2>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md" id="dp-services">
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low" aria-hidden="true">
<div class="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2"><div class="h-4 w-3/5 rounded bg-surface-container-high"></div><div class="h-3 w-4/5 rounded bg-surface-container"></div></div>
</div>
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low" aria-hidden="true">
<div class="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2"><div class="h-4 w-2/5 rounded bg-surface-container-high"></div><div class="h-3 w-3/4 rounded bg-surface-container"></div></div>
</div>
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low" aria-hidden="true">
<div class="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2"><div class="h-4 w-1/2 rounded bg-surface-container-high"></div><div class="h-3 w-4/5 rounded bg-surface-container"></div></div>
</div>
<div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low" aria-hidden="true">
<div class="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2"><div class="h-4 w-2/5 rounded bg-surface-container-high"></div><div class="h-3 w-3/5 rounded bg-surface-container"></div></div>
</div>
</div>
</article>
<!-- 3. Hospital Location & Clinic Wayfinding -->
<article class="bg-surface-container-lowest rounded-xl p-space-xl">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[20px]">location_on</span>
</div>
<h2 class="text-[18px] font-bold leading-snug text-on-surface sm:text-[24px]">موقع العيادة</h2>
</div>
</div>
<div class="flex flex-col gap-4">
<!-- Location panel -->
<div class="relative h-56 w-full overflow-hidden rounded-xl border border-line bg-surface-container-low sm:h-60">
<iframe class="h-full w-full border-0" id="dp-map" title="خريطة موقع العيادة" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
<div class="pointer-events-none absolute inset-0 grid place-items-center bg-surface-container-low" id="dp-map-skeleton" aria-hidden="true">
<div class="flex flex-col items-center gap-3">
<span class="material-symbols-outlined text-[32px] text-on-surface-variant/60">location_on</span>
<span class="block h-3 w-40 rounded bg-surface-container-high"></span>
<span class="block h-3 w-24 rounded bg-surface-container"></span>
</div>
</div>
<div class="pointer-events-none absolute right-3 top-3 max-w-[70%]">
<span class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line bg-surface-container-lowest px-2.5 py-1.5 text-[12px] font-medium text-on-surface">
<span class="material-symbols-outlined text-[15px] text-primary" aria-hidden="true">near_me</span>
<span class="truncate" id="dp-gate">موقع العيادة</span>
</span>
</div>
</div>
<!-- Clinic directions -->
<div class="grid gap-4 sm:grid-cols-2">
<div class="flex items-start gap-3">
<span class="material-symbols-outlined mt-0.5 text-[19px] text-primary" aria-hidden="true">apartment</span>
<div class="min-w-0">
<h4 class="text-[14px] font-semibold text-on-surface" id="dp-building-name"><span class="block h-4 w-40 max-w-full rounded bg-surface-container-high" aria-hidden="true"></span></h4>
<p class="mt-0.5 text-[13px] text-on-surface-variant" id="dp-building-line"><span class="block h-3 w-56 max-w-full rounded bg-surface-container" aria-hidden="true"></span></p>
</div>
</div>
<div class="flex items-start gap-3">
<span class="material-symbols-outlined mt-0.5 text-[19px] text-primary" aria-hidden="true">meeting_room</span>
<div class="min-w-0">
<h4 class="text-[14px] font-semibold text-on-surface" id="dp-clinic-name"><span class="block h-4 w-36 max-w-full rounded bg-surface-container-high" aria-hidden="true"></span></h4>
<p class="mt-0.5 text-[13px] text-on-surface-variant" id="dp-clinic-line"><span class="block h-3 w-52 max-w-full rounded bg-surface-container" aria-hidden="true"></span></p>
</div>
</div>
</div>
<a class="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-line bg-surface-container-lowest px-3 text-[12px] font-medium text-on-surface transition-colors hover:bg-surface-container" href="#" id="dp-map-link" target="_blank" rel="noreferrer">
<span>فتح الموقع في خرائط Google</span>
<span class="material-symbols-outlined text-[15px]" aria-hidden="true">open_in_new</span>
</a>
</div>
</article>
<!-- 4. Patient Reviews & Verified Ratings -->
<article class="bg-surface-container-lowest rounded-xl p-space-xl">
<div class="flex items-center justify-between mb-space-lg">
<div class="flex items-center gap-space-sm">
<div class="w-8 h-8 rounded-lg bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">reviews</span>
</div>
<h2 class="text-[18px] font-bold leading-snug text-on-surface sm:text-[24px]">تقييمات المراجعين</h2>
</div>
<div class="flex items-center gap-1 text-on-surface font-bold text-headline-sm">
<span class="material-symbols-outlined text-warning text-[20px]" style="font-variation-settings: 'FILL' 1;" aria-hidden="true" id="dp-rating-star">star</span>
<span id="dp-rating-big"><span class="inline-block h-5 w-20 rounded bg-surface-container-high align-middle" aria-hidden="true"></span></span>
</div>
</div>
<!-- Reviews Grid -->
<div class="flex flex-col gap-space-md" id="dp-review-list">
<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs" aria-hidden="true">
<div class="flex items-center gap-space-sm">
<div class="h-10 w-10 shrink-0 rounded-full bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2">
<div class="h-4 w-32 max-w-full rounded bg-surface-container-high"></div>
<div class="h-3 w-24 max-w-full rounded bg-surface-container"></div>
</div>
</div>
<div class="mt-1 space-y-2">
<div class="h-3 w-full rounded bg-surface-container"></div>
<div class="h-3 w-4/5 rounded bg-surface-container"></div>
</div>
</div>
<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs" aria-hidden="true">
<div class="flex items-center gap-space-sm">
<div class="h-10 w-10 shrink-0 rounded-full bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2">
<div class="h-4 w-32 max-w-full rounded bg-surface-container-high"></div>
<div class="h-3 w-24 max-w-full rounded bg-surface-container"></div>
</div>
</div>
<div class="mt-1 space-y-2">
<div class="h-3 w-11/12 rounded bg-surface-container"></div>
<div class="h-3 w-3/5 rounded bg-surface-container"></div>
</div>
</div>
<div class="p-space-md rounded-xl bg-surface-container-low/70 flex flex-col gap-space-xs" aria-hidden="true">
<div class="flex items-center gap-space-sm">
<div class="h-10 w-10 shrink-0 rounded-full bg-surface-container-high"></div>
<div class="min-w-0 flex-1 space-y-2">
<div class="h-4 w-32 max-w-full rounded bg-surface-container-high"></div>
<div class="h-3 w-24 max-w-full rounded bg-surface-container"></div>
</div>
</div>
<div class="mt-1 space-y-2">
<div class="h-3 w-full rounded bg-surface-container"></div>
<div class="h-3 w-2/3 rounded bg-surface-container"></div>
</div>
</div>
</div>
<div id="dp-review-form-slot"></div>
</article>
</div>
<!-- Left Column: Booking Engine Box (5 Cols on LG) -->
<aside class="order-1 mx-auto flex w-full max-w-md flex-col gap-space-md lg:order-none lg:col-span-5 lg:mx-0 lg:max-w-none">
<div class="relative overflow-hidden rounded-xl border border-line bg-surface-container-lowest p-space-lg">
<!-- Box Header -->
<div class="flex items-center justify-between gap-space-sm pb-space-sm">
<div class="min-w-0 flex-1">
<span class="block text-[12px] font-medium text-on-surface-variant">جدول المواعيد المباشر</span>
<h3 class="font-headline-sm sm:font-headline-md text-headline-sm sm:text-headline-md text-on-surface font-bold">احجز استشارتك الطبية</h3>
</div>
<div class="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]">event_available</span>
</div>
</div>
<!-- 2. Interactive Calendar Date Picker -->
<div class="mt-space-md">
<div class="flex items-center justify-between mb-2">
<span class="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
<span id="dp-month-label"><span class="inline-block h-4 w-28 rounded bg-surface-container-high align-middle" aria-hidden="true"></span></span>
</span>
<div class="flex items-center gap-1">
<button class="w-11 h-11 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]" id="dp-days-back">chevron_right</span>
</button>
<button class="w-11 h-11 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]" id="dp-days-fwd">chevron_left</span>
</button>
</div>
</div>
<!-- Date Horizontal Strip / Matrix -->
<div class="grid grid-cols-5 gap-2" id="date-picker-row">
<div class="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low px-1 py-2.5" aria-hidden="true"><span class="h-3 w-10 rounded bg-surface-container-high"></span><span class="h-5 w-6 rounded bg-surface-container-high"></span><span class="h-3 w-8 rounded bg-surface-container"></span></div>
<div class="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low px-1 py-2.5" aria-hidden="true"><span class="h-3 w-10 rounded bg-surface-container-high"></span><span class="h-5 w-6 rounded bg-surface-container-high"></span><span class="h-3 w-8 rounded bg-surface-container"></span></div>
<div class="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low px-1 py-2.5" aria-hidden="true"><span class="h-3 w-10 rounded bg-surface-container-high"></span><span class="h-5 w-6 rounded bg-surface-container-high"></span><span class="h-3 w-8 rounded bg-surface-container"></span></div>
<div class="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low px-1 py-2.5" aria-hidden="true"><span class="h-3 w-10 rounded bg-surface-container-high"></span><span class="h-5 w-6 rounded bg-surface-container-high"></span><span class="h-3 w-8 rounded bg-surface-container"></span></div>
<div class="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low px-1 py-2.5" aria-hidden="true"><span class="h-3 w-10 rounded bg-surface-container-high"></span><span class="h-5 w-6 rounded bg-surface-container-high"></span><span class="h-3 w-8 rounded bg-surface-container"></span></div>
</div>
</div>
<!-- 3. Time Slots Hierarchy (Morning & Evening) -->
<div class="mt-space-md">
<!-- Morning Slots -->
<div class="mb-space-sm">
<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold mb-2">
<span class="material-symbols-outlined text-warning text-[18px]">wb_sunny</span>
<span>الفترة الصباحية</span>
</div>
<div class="grid grid-cols-4 gap-space-xs" id="morning-slots">
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
</div>
</div>
<!-- Evening Slots -->
<div>
<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold mb-2">
<span class="material-symbols-outlined text-tertiary text-[18px]">nights_stay</span>
<span>الفترة المسائية</span>
</div>
<div class="grid grid-cols-4 gap-space-xs" id="evening-slots">
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
<div class="h-10 rounded-lg bg-surface-container-high" aria-hidden="true"></div>
</div>
</div>
</div>
<!-- 4. Selected Slot Banner Summary -->
<div class="mt-space-md p-space-sm bg-primary/5 rounded-xl flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">schedule</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary font-semibold">الموعد المحدد للحجز:</span>
<span class="font-label-md text-label-md font-bold text-on-surface" id="summary-datetime-display">
<span class="inline-block h-4 w-52 max-w-full rounded bg-surface-container-high align-middle" aria-hidden="true"></span>
</span>
</div>
</div>
</div>
<!-- 5. Insurance Pre-Check Toggle -->
<div class="mt-space-md p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">التأمين الطبي المعتمد</span>
<span class="text-[11px] text-on-surface-variant">تحقق من التغطية عند الحجز</span>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" id="insurance-toggle" onchange="toggleInsuranceDetails()" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-colors peer-checked:bg-primary"></div>
</label>
</div>
<!-- Insurance Selector detail row -->
<div class="flex items-center justify-between pt-1 text-on-surface-variant font-label-sm text-label-sm" id="insurance-dropdown-area">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span id="dp-insurer-name"><span class="inline-block h-3 w-32 rounded bg-surface-container-high align-middle" aria-hidden="true"></span></span>
</div>
<button class="inline-flex items-center min-h-11 px-2 -mx-2 rounded-lg text-primary font-bold hover:underline" type="button" id="dp-insurer-change">تغيير</button>
</div>
</div>
<!-- 6. Price Summary & Proceed CTA (inside the booking card) -->
<div class="mt-space-lg pt-space-md border-t border-outline-variant/30 flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<span class="font-body-md text-body-md text-on-surface-variant">إجمالي رسوم الكشف:</span>
<div class="flex items-baseline gap-1">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface" id="cta-price-amount"><span class="inline-block h-7 w-16 rounded bg-surface-container-high align-middle" aria-hidden="true"></span></span>
<span class="font-label-md text-label-md font-semibold text-secondary">ج.س (SDG)</span>
</div>
</div>
<button class="w-full py-3.5 px-space-md bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary rounded-full font-label-lg text-label-lg font-bold transition-colors flex items-center justify-center gap-2 group opacity-60" id="dp-cta" type="button" disabled>
<span class="material-symbols-outlined text-[20px] text-on-primary">lock</span>
<span id="cta-button-text">تأكيد الحجز</span>
</button>
<!-- Security Assurance Footnote -->
<div class="flex items-center justify-center gap-space-sm text-secondary font-label-sm text-label-sm mt-1">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">payments</span>
<span>الدفع في العيادة عند الحضور</span>
</div>
<span>•</span>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]" aria-hidden="true">receipt_long</span>
<span>لا رسوم على الحجز</span>
</div>
</div>
</div>
</aside>
</div>
</main>
</div>`;
