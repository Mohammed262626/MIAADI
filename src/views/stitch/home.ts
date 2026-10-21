// Home / landing — ported from the approved Stitch screen
// «صفحة الهبوط المستلهمة | Miaadi Inspired Landing Page» (project
// 4257345503185534008), with its royal-blue palette remapped to the brand teal
// tokens and every unverifiable claim removed (see docs/PRODUCT.md).
// Painted instantly, then wired live in homeLive.ts.

type Specialty = { id: string; ar: string; icon: string; tile: string };

// tile = muted icon-tile colors for the specialty grid. Tinted (500/10) backgrounds
// read on both the light and the dark surface.
const SPECIALTIES: Specialty[] = [
  { id: "cardiology", ar: "القلب والأوعية", icon: "monitor_heart", tile: "bg-rose-500/10 text-rose-600" },
  { id: "dental", ar: "طب الأسنان", icon: "dentistry", tile: "bg-sky-500/10 text-sky-600" },
  { id: "pediatrics", ar: "طب الأطفال", icon: "child_care", tile: "bg-amber-500/10 text-amber-600" },
  { id: "orthopedics", ar: "العظام والمفاصل", icon: "personal_injury", tile: "bg-indigo-500/10 text-indigo-600" },
  { id: "ophthalmology", ar: "طب العيون", icon: "visibility", tile: "bg-teal-500/10 text-teal-700" },
  { id: "dermatology", ar: "الجلدية والليزر", icon: "spa", tile: "bg-pink-500/10 text-pink-600" },
  { id: "ent", ar: "أنف وأذن وحنجرة", icon: "hearing", tile: "bg-blue-500/10 text-blue-600" },
  { id: "internal", ar: "الباطنية", icon: "stethoscope", tile: "bg-orange-500/10 text-orange-600" },
];

const SPECIALTY_TILES = SPECIALTIES.map(
  (s) => `
<button type="button" data-specialty-link="${s.id}" class="press group flex flex-col items-center rounded-xl border border-line/70 bg-surface-container-lowest p-5 text-center transition-colors hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
  <span class="mb-3 grid h-12 w-12 place-items-center rounded-xl ${s.tile} transition-transform group-hover:scale-110" aria-hidden="true">
    <span class="material-symbols-outlined text-[22px]">${s.icon}</span>
  </span>
  <span class="text-[14px] font-bold text-on-surface">${s.ar}</span>
  <span class="mt-1 block text-[12px] tabular-nums text-on-surface-variant" data-specialty-count="${s.id}">…</span>
</button>`
).join("");

// Featured-doctor skeletons match the ported card design (round avatar + lines).
const DOCTOR_SKELETONS = [0, 1, 2]
  .map(
    () => `
<div class="rounded-xl border border-line/80 bg-surface-container-lowest p-5">
  <div class="flex items-center gap-4">
    <div class="h-16 w-16 shrink-0 rounded-full bg-surface-container-high"></div>
    <div class="flex-1">
      <div class="h-4 w-2/3 rounded bg-surface-container-high"></div>
      <div class="mt-2 h-3 w-1/2 rounded bg-surface-container"></div>
      <div class="mt-2 h-3 w-3/4 rounded bg-surface-container"></div>
    </div>
  </div>
  <div class="mt-4 h-3 w-3/4 rounded bg-surface-container"></div>
  <div class="mt-5 h-10 rounded-lg bg-surface-container-high"></div>
</div>`
  )
  .join("");

const HOSPITAL_SKELETONS = [0, 1, 2]
  .map(
    () => `
<div class="rounded-xl border border-line/80 bg-surface-container-lowest p-5" aria-hidden="true">
  <div class="flex items-center justify-between">
    <div class="h-10 w-10 rounded-lg bg-surface-container-high"></div>
    <div class="h-5 w-16 rounded-full bg-surface-container-high"></div>
  </div>
  <div class="mt-4 h-4 w-2/3 rounded bg-surface-container-high"></div>
  <div class="mt-2 h-3 w-1/2 rounded bg-surface-container"></div>
  <div class="mt-5 h-10 rounded-lg bg-surface-container-high"></div>
</div>`
  )
  .join("");

const STAT_SKELETON = `
<div class="mx-auto h-9 w-24 rounded bg-white/15" aria-hidden="true"></div>
<div class="mx-auto mt-2 h-3.5 w-24 rounded bg-white/10" aria-hidden="true"></div>`;

// Shared with the retry path in homeLive.ts.
export const NEXT_APPOINTMENT_SKELETON = `
<div class="rounded-xl bg-surface-container-low p-4">
  <div class="flex items-center gap-3">
    <div class="h-10 w-10 shrink-0 rounded-xl bg-surface-container-high"></div>
    <div class="flex-1">
      <div class="h-3.5 w-36 rounded bg-surface-container-high"></div>
      <div class="mt-2 h-3 w-48 rounded bg-surface-container"></div>
    </div>
  </div>
  <div class="mt-3 h-11 rounded-xl bg-surface-container-high"></div>
</div>`;

export const HOME_MAIN = `<div class="w-full">

<!-- ============ HERO (teal panel, abstract shapes) ============ -->
<section class="brand-surface relative overflow-hidden bg-primary pt-12 pb-28 lg:pb-36" data-reveal>
  <div class="hero-shape hero-shape-1 pointer-events-none absolute -bottom-24 -left-24" aria-hidden="true"></div>
  <div class="hero-shape hero-shape-2 pointer-events-none absolute top-10 left-1/3" aria-hidden="true"></div>
  <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-container/70 via-transparent to-transparent" aria-hidden="true"></div>

  <div class="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
      <!-- Editorial column -->
      <div class="flex flex-col items-start gap-6 text-start text-white lg:col-span-7">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium">
          <span class="h-2 w-2 rounded-full bg-white animate-pulse" aria-hidden="true"></span>
          <span>حجز مباشر من جدول العيادة — بلا تعارض في المواعيد</span>
        </div>
        <h1 class="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.2] tracking-tight">
          احجز موعد طبيبك<br />أونلاين وبجدول العيادة نفسه.
        </h1>
        <p class="max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base">
          المواعيد المعروضة متاحة فعلاً في جدول العيادة: تختار، تؤكد، وتدير موعدك بنفسك — دون انتظار في صالة الاستقبال.
        </p>
        <div class="flex flex-wrap items-center gap-4 pt-2">
          <a href="#home-search" class="press inline-flex items-center justify-center rounded-xl bg-surface-container-lowest px-7 py-3.5 text-[15px] font-bold text-on-surface shadow-lg transition-colors hover:bg-surface-container-high">
            احجز موعداً
          </a>
          <a href="#hospitals" class="press inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-white/50 px-6 py-3.5 text-[15px] font-semibold transition-colors hover:border-white hover:bg-white/10">
            <span aria-hidden="true" class="material-symbols-outlined text-[18px]">apartment</span>
            <span>تصفّح المستشفيات والمراكز</span>
          </a>
        </div>
        <div class="flex flex-wrap items-center gap-6 border-t border-white/15 pt-5 text-[12px] text-white/80">
          <span class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-outlined text-[18px]">event_available</span>
            مواعيد من جدول العيادة الفعلي
          </span>
          <span class="flex items-center gap-2">
            <span aria-hidden="true" class="material-symbols-outlined text-[18px]">payments</span>
            بدون دفع إلكتروني مسبق — الدفع في العيادة
          </span>
        </div>
      </div>

      <!-- Live booking slip instead of a stock photo -->
      <div class="relative lg:col-span-5" id="booking-slip">
        <div class="relative z-10 mx-auto flex w-full max-w-md flex-col rounded-2xl border border-line/80 bg-surface-container-lowest p-5 shadow-glow-card sm:p-6">

          <div class="mb-4 flex items-center justify-between gap-3 border-b border-line/60 pb-4">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true"></span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-primary">حجز مباشر</span>
            </div>
            <span class="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[11px] text-on-surface-variant">من جدول العيادة</span>
          </div>

          <div id="home-next-appointment" aria-live="polite">${NEXT_APPOINTMENT_SKELETON}</div>

          <a href="#home-search" class="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container">
            <span aria-hidden="true" class="material-symbols-outlined text-[18px]">search</span>
            <span>ابحث عن موعد جديد</span>
          </a>
          <p class="mt-3 text-center text-[11px] text-outline">تظهر رسوم الكشف قبل التأكيد — الدفع في العيادة</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ FLOATING SEARCH BAR ============ -->
<div class="relative z-30 mx-auto -mt-16 w-full max-w-[1100px] px-4 sm:-mt-14" id="home-search">
  <form id="hero-search" class="clinical-shadow-glow flex flex-col gap-3 rounded-2xl border border-line/80 bg-surface-container-lowest p-3 sm:p-4 md:flex-row md:items-center md:gap-3" autocomplete="off">
    <div class="relative w-full md:w-1/4">
      <label class="sr-only" for="hero-city">المدينة</label>
      <select id="hero-city" class="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface-container-low px-3 text-start text-[14px] font-semibold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <option value="">كافة المدن</option>
      </select>
      <span aria-hidden="true" class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">expand_more</span>
    </div>
    <div class="relative w-full flex-1">
      <label class="sr-only" for="hero-q">ابحث باسم الطبيب أو التخصص</label>
      <input id="hero-q" type="search" placeholder="ابحث باسم الطبيب، التخصص، أو المستشفى…"
        class="h-12 w-full rounded-xl border border-line bg-surface-container-low px-3 text-[14px] text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
      <span aria-hidden="true" class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
    </div>
    <button type="submit" class="press inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-[14px] font-bold text-on-primary transition-colors hover:bg-primary-container md:w-auto">
      <span aria-hidden="true" class="material-symbols-outlined text-[18px]">search</span>
      <span>بحث</span>
    </button>
  </form>
</div>

<!-- ============ HOW IT WORKS ============ -->
<section class="py-20 lg:py-24" aria-labelledby="how-title">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="mx-auto mb-14 max-w-2xl text-center" data-reveal>
      <p class="text-[11px] font-bold uppercase tracking-widest text-primary">كيف يعمل ميعادي</p>
      <h2 id="how-title" class="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-tight text-on-surface">كيف يعمل ميعادي!</h2>
      <p class="mt-4 text-[15px] leading-relaxed text-on-surface-variant">
        اكتشف الأطباء المتاحين، اختر الموعد المناسب من جدول العيادة الفعلي، وأكّد حجزك — كل شيء من مكان واحد.
      </p>
    </div>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
      <div class="group rounded-2xl border border-line/80 bg-surface-container-low p-8 text-center transition-colors hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-soft-card" data-reveal>
        <div class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <span aria-hidden="true" class="material-symbols-outlined text-[26px]">person_search</span>
        </div>
        <span class="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">الخطوة 01</span>
        <h3 class="mb-2 text-[18px] font-bold text-on-surface">ابحث واختر طبيبك</h3>
        <p class="text-[13px] leading-relaxed text-on-surface-variant">
          تصفح الأطباء على ميعادي وفق التخصص والمدينة وشركة التأمين، بكل وضوح لمكان الكشف وسعره.
        </p>
      </div>
      <div class="group rounded-2xl border border-line/80 bg-surface-container-low p-8 text-center transition-colors hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-soft-card" data-reveal>
        <div class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <span aria-hidden="true" class="material-symbols-outlined text-[26px]">event_available</span>
        </div>
        <span class="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">الخطوة 02</span>
        <h3 class="mb-2 text-[18px] font-bold text-on-surface">حدد الموعد المناسب</h3>
        <p class="text-[13px] leading-relaxed text-on-surface-variant">
          المواعيد المعروضة تأتي من جدول العيادة الفعلي لحظة بلحظة؛ اختر التاريخ والساعة التي تناسبك.
        </p>
      </div>
      <div class="group rounded-2xl border border-line/80 bg-surface-container-low p-8 text-center transition-colors hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-soft-card" data-reveal>
        <div class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <span aria-hidden="true" class="material-symbols-outlined text-[26px]">badge</span>
        </div>
        <span class="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">الخطوة 03</span>
        <h3 class="mb-2 text-[18px] font-bold text-on-surface">أكّد الحجز واحصل على تذكرتك</h3>
        <p class="text-[13px] leading-relaxed text-on-surface-variant">
          تأكيد الحجز داخل التطبيق مع رقم مرجع وبطاقة دخول برمز QR لمشاركتها عند الاستقبال.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ============ SPECIALTY TILES ============ -->
<section class="border-y border-line/60 bg-surface-container-low/60 py-16 lg:py-20" aria-labelledby="spec-title">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end" data-reveal>
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-primary">على ميعادي</span>
        <h2 id="spec-title" class="mt-1 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-tight text-on-surface">تصفح التخصصات الطبية المتاحة</h2>
      </div>
      <a href="#doctors" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-colors hover:underline">
        <span>عرض كافة التخصصات</span>
        <span aria-hidden="true" class="material-symbols-outlined text-[14px]">arrow_back</span>
      </a>
    </div>
    <div id="home-specialties" class="grid grid-cols-2 gap-4 sm:grid-cols-4" data-reveal>${SPECIALTY_TILES}
    </div>
  </div>
</section>

<!-- ============ REAL PLATFORM STATS ============ -->
<section class="py-14" data-reveal aria-label="أرقام من المنصة">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="brand-surface rounded-3xl bg-primary px-6 py-10 sm:px-10">
      <div id="home-stats" class="grid grid-cols-2 gap-8 text-center md:grid-cols-4" aria-live="polite">
        <div>${STAT_SKELETON}</div><div>${STAT_SKELETON}</div><div>${STAT_SKELETON}</div><div>${STAT_SKELETON}</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ FEATURED DOCTORS ============ -->
<section class="pb-20" aria-labelledby="docs-title">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end" data-reveal>
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-primary">أطباء على ميعادي</span>
        <h2 id="docs-title" class="mt-1 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-tight text-on-surface">أطباء يبرزون هذا الأسبوع</h2>
        <p class="mt-1 text-[14px] text-on-surface-variant">مواعيد متاحة للحجز المباشر خلال الأسبوع القادم.</p>
      </div>
      <a href="#doctors" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-colors hover:underline">
        استعراض كافة الأطباء
        <span aria-hidden="true" class="material-symbols-outlined text-[14px]">arrow_back</span>
      </a>
    </div>
    <div id="featured-doctors" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">${DOCTOR_SKELETONS}
    </div>
  </div>
</section>

<!-- ============ HOSPITALS & CENTERS ============ -->
<section class="border-t border-line/60 bg-surface-container-low/60 py-16 lg:py-20" aria-labelledby="hosp-title">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end" data-reveal>
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-primary">حجز مباشر</span>
        <h2 id="hosp-title" class="mt-1 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-tight text-on-surface">مستشفيات ومراكز على ميعادي</h2>
        <p class="mt-1 text-[14px] text-on-surface-variant">نعرض المنشآت التي يمكنك الحجز فيها فعلاً — كل بطاقة مشتقّة من أطبائها المتاحين.</p>
      </div>
      <a href="#hospitals" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-colors hover:underline">
        جميع المستشفيات والمراكز
        <span aria-hidden="true" class="material-symbols-outlined text-[14px]">arrow_back</span>
      </a>
    </div>
    <div id="home-hospitals" class="grid grid-cols-1 gap-5 md:grid-cols-3" aria-busy="true">${HOSPITAL_SKELETONS}
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section class="py-16 lg:py-24" aria-labelledby="faq-title">
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <div class="mb-10 text-center" data-reveal>
      <span class="text-[11px] font-bold uppercase tracking-wider text-primary">إجابات واضحة</span>
      <h2 id="faq-title" class="mt-1 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-tight text-on-surface">الأسئلة الشائعة</h2>
      <p class="mt-2 text-[14px] text-on-surface-variant">عن الحجز، الرسوم، وإدارة موعدك.</p>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" data-reveal>
      <details class="group flex h-full flex-col rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors open:border-primary [&_summary::-webkit-details-marker]:hidden">
        <summary class="flex flex-1 cursor-pointer flex-col items-start justify-between gap-3 focus-visible:outline-none">
          <span class="text-[15px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">كيف أحجز موعداً؟</span>
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform group-open:rotate-180">
            <span aria-hidden="true" class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </span>
        </summary>
        <p class="mt-4 border-t border-line/60 pt-4 text-[13px] leading-relaxed text-on-surface-variant">اختر التخصص أو ابحث باسم الطبيب، ثم اختر من المواعيد المتاحة وأكّد الحجز. لا تحتاج إلى مكالمة.</p>
      </details>
      <details class="group flex h-full flex-col rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors open:border-primary [&_summary::-webkit-details-marker]:hidden">
        <summary class="flex flex-1 cursor-pointer flex-col items-start justify-between gap-3 focus-visible:outline-none">
          <span class="text-[15px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">كيف أعرف رسوم الكشف؟</span>
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform group-open:rotate-180">
            <span aria-hidden="true" class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </span>
        </summary>
        <p class="mt-4 border-t border-line/60 pt-4 text-[13px] leading-relaxed text-on-surface-variant">تظهر رسوم الكشف لكل طبيب في بطاقته، وقبل تأكيد الحجز مباشرة. الدفع يتم في العيادة، ولا يوجد دفع إلكتروني مسبق.</p>
      </details>
      <details class="group flex h-full flex-col rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors open:border-primary [&_summary::-webkit-details-marker]:hidden">
        <summary class="flex flex-1 cursor-pointer flex-col items-start justify-between gap-3 focus-visible:outline-none">
          <span class="text-[15px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">كيف أتأكد أن الحجز مؤكد؟</span>
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform group-open:rotate-180">
            <span aria-hidden="true" class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </span>
        </summary>
        <p class="mt-4 border-t border-line/60 pt-4 text-[13px] leading-relaxed text-on-surface-variant">المواعيد تأتي من جدول العيادة نفسه في ميعادي، وتصلك تفاصيل الحجز مع رقم مرجع؛ ظهّر بطاقة الدخول من صفحة مواعيدي فيظهر رمز التحقق.</p>
      </details>
      <details class="group flex h-full flex-col rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors open:border-primary [&_summary::-webkit-details-marker]:hidden">
        <summary class="flex flex-1 cursor-pointer flex-col items-start justify-between gap-3 focus-visible:outline-none">
          <span class="text-[15px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">هل يمكنني إعادة الجدولة أو الإلغاء؟</span>
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform group-open:rotate-180">
            <span aria-hidden="true" class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </span>
        </summary>
        <p class="mt-4 border-t border-line/60 pt-4 text-[13px] leading-relaxed text-on-surface-variant">نعم، من صفحة حجوزاتك: افتح الموعد القادم واختر إعادة الجدولة أو الإلغاء، فيتاح المقعد لمريض آخر.</p>
      </details>
      <details class="group flex h-full flex-col rounded-xl border border-line/80 bg-surface-container-lowest p-5 transition-colors open:border-primary [&_summary::-webkit-details-marker]:hidden">
        <summary class="flex flex-1 cursor-pointer flex-col items-start justify-between gap-3 focus-visible:outline-none">
          <span class="text-[15px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">في أي مدن تعمل المنصة؟</span>
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform group-open:rotate-180">
            <span aria-hidden="true" class="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </span>
        </summary>
        <p class="mt-4 border-t border-line/60 pt-4 text-[13px] leading-relaxed text-on-surface-variant">الخرطوم وأم درمان وبورتسودان وتُضاف مدن جديدة مع انضمام عيادات إليها.</p>
      </details>
    </div>
  </div>
</section>

<!-- ============ CLOSING CTA ============ -->
<section class="pb-20" data-reveal>
  <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
    <img src="/assets/confluence-of-nile-khartoum-001-cropped.jpg" width="1600" height="701"
      alt="ملتقى النيل الأزرق والنيل الأبيض في الخرطوم" loading="lazy" decoding="async"
      class="h-48 w-full rounded-xl object-cover" />
    <div class="brand-surface mt-3 rounded-xl bg-primary px-6 py-10 sm:px-8">
      <h2 class="max-w-[20ch] text-[clamp(1.75rem,2.6vw,2.5rem)] font-bold leading-tight text-on-primary">موعدك القادم يبدأ بخطوة واحدة.</h2>
      <p class="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-on-primary/85">ابحث عن الطبيب المناسب في مدينتك، واختر الوقت الذي يناسبك من المواعيد المتاحة فعلاً.</p>
      <a href="#doctors" class="press cta-invert mt-6 inline-flex h-12 items-center rounded-xl bg-surface-container-lowest px-6 text-[16px] font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
        ابحث عن طبيب
      </a>
    </div>
    <p class="mt-6 text-[13px] text-on-surface-variant">صورة: أرشيف ماتسون، عبر ويكيميديا كومنز.</p>
  </div>
</section>

</div>`;
