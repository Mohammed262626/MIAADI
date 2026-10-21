// Not-found page for any unknown hash (#nonsense, stale links, typos).
export const NOTFOUND_MAIN = `<div class="mx-auto flex w-full max-w-[640px] flex-col items-center justify-center px-4 py-20 text-center sm:py-24">
<span class="grid h-16 w-16 place-items-center rounded-2xl bg-primary-container/10 text-primary" aria-hidden="true"><span class="material-symbols-outlined text-[32px]">search_off</span></span>
<p class="mt-5 text-[40px] font-bold leading-none tracking-tight text-primary tabular-nums">404</p>
<h1 class="mt-2 text-[20px] font-bold text-on-surface">لم نجد هذه الصفحة</h1>
<p class="mt-2 max-w-[44ch] text-[14px] leading-7 text-on-surface-variant">الرابط الذي فتحته غير موجود أو ربما تغيّر. يمكنك العودة إلى الرئيسية أو تصفح الأطباء للوصول إلى ما تبحث عنه.</p>
<div class="mt-5 flex flex-wrap items-center justify-center gap-2">
<a href="#home" class="press inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container">العودة إلى الرئيسية</a>
<a href="#doctors" class="press inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface-container-lowest px-5 text-[14px] font-semibold text-on-surface transition-colors hover:bg-surface-container">تصفح الأطباء</a>
</div>
</div>`;
