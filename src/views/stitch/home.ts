// Home shell — painted instantly, then wired live in homeLive.ts.
// Copy is limited to committed product reality (see docs/PRODUCT.md).

type Specialty = { id: string; ar: string };

const SPECIALTIES: Specialty[] = [
  { id: "cardiology", ar: "القلب والأوعية" },
  { id: "dental", ar: "طب وجراحة الأسنان" },
  { id: "pediatrics", ar: "طب الأطفال وحديثي الولادة" },
  { id: "dermatology", ar: "الجلدية والتجميل والليزر" },
  { id: "orthopedics", ar: "العظام والمفاصل والعمود الفقري" },
  { id: "ophthalmology", ar: "طب وجراحة العيون" },
  { id: "ent", ar: "أنف وأذن وحنجرة" },
  { id: "internal", ar: "الباطنية والجهاز الهضمي" },
];

const STRIPE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  .map((i) => `<span class="h-full flex-1 ${i % 2 === 0 ? "bg-on-surface" : "bg-primary"}"></span>`)
  .join("");

const SPECIALTY_ROWS = SPECIALTIES.map(
  (s) => `
<button type="button" data-specialty-link="${s.id}" class="group -mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-4 rounded-xl px-3 py-3.5 text-start transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  <span class="text-[17px] font-semibold text-on-surface transition-colors group-hover:text-primary">${s.ar}</span>
  <span class="shrink-0 text-[14px] tabular-nums text-on-surface-variant" data-specialty-count="${s.id}">…</span>
</button>`
).join("");

const DOCTOR_SKELETONS = [0, 1, 2]
  .map(
    () => `
<div class="rounded-xl bg-surface-container-lowest p-4 sm:p-5">
  <div class="flex items-start gap-4">
    <div class="h-20 w-20 shrink-0 rounded-xl bg-surface-container-high"></div>
    <div class="flex-1 pt-1">
      <div class="h-4 w-2/3 rounded bg-surface-container-high"></div>
      <div class="mt-2 h-3 w-1/2 rounded bg-surface-container"></div>
      <div class="mt-2 h-3 w-3/4 rounded bg-surface-container"></div>
    </div>
  </div>
  <div class="mt-4 flex items-end justify-between gap-4">
    <div class="h-3 w-32 rounded bg-surface-container"></div>
    <div class="h-11 w-24 rounded-xl bg-surface-container-high"></div>
  </div>
</div>`
  )
  .join("");

// Shared by the paint-time shell and the retry path in homeLive.ts.
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
<div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:px-8 xl:gap-x-16">

<!-- ============ READING COLUMN: MASTHEAD ============ -->
<header class="pb-8 pt-8 lg:col-start-1 lg:row-start-1 lg:pb-12 lg:pt-16" data-reveal>
  <h1 class="max-w-[18ch] text-[clamp(2.5rem,5vw,4.25rem)] font-bold leading-[1.15] text-on-surface">
    احجز موعدك الطبي في الخرطوم
  </h1>
  <p class="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-on-surface-variant">
    أطباء موثّقون في الخرطوم وأم درمان وبورتسودان، ومواعيد تُحدَّث مباشرة من جدول العيادة — تختار، تؤكد، وتدير موعدك بنفسك.
  </p>
  <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
    <a href="#doctors" class="inline-flex min-h-11 items-center gap-1.5 text-[16px] font-semibold text-primary transition-colors hover:text-primary-container">
      تصفح كل الأطباء
      <span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>
    </a>
    <a href="#appointments" class="inline-flex min-h-11 items-center gap-1.5 text-[16px] text-on-surface-variant transition-colors hover:text-on-surface">
      مواعيدي
      <span aria-hidden="true" class="material-symbols-outlined text-[18px]">calendar_month</span>
    </a>
  </div>
</header>

<!-- ============ THE FIXED STAGE: BOOKING SLIP ============ -->
<aside class="mt-2 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[calc(100svh-5rem)] lg:self-start lg:py-6">
  <div class="flex h-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest">

    <div class="relative h-[30svh] shrink-0 lg:h-[30%]">
      <img src="/assets/sudan-khartoum-from-air-with-nile-1936.jpg" width="1920" height="1519"
        alt="الخرطوم من الجو سنة ١٩٣٦: النيل يقسم المدينة إلى مربعات" decoding="async"
        class="h-full w-full object-cover photo-drift" />
      <p class="brand-surface absolute inset-x-0 bottom-0 bg-primary px-4 py-2 text-[13px] text-on-primary">
        الخرطوم من الجو، ١٩٣٦ · أرشيف ماتسون
      </p>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
      <div class="flex items-center justify-between gap-3">
        <span class="flex h-2.5 w-28 overflow-hidden rounded-sm" aria-hidden="true">${STRIPE}</span>
        <span class="text-[13px] font-semibold text-primary">حجز مباشر</span>
      </div>

      <form id="hero-search" class="flex flex-col gap-3" autocomplete="off">
        <div class="flex flex-col gap-1.5">
          <label class="text-[13px] font-medium text-on-surface-variant" for="hero-q">الطبيب أو التخصص</label>
          <input id="hero-q" type="search" placeholder="مثال: قلب، أسنان، مستشفى النور…"
            class="h-11 w-full rounded-xl bg-surface-container-low px-3 text-[16px] text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-on-surface-variant" for="hero-city">المدينة</label>
            <select id="hero-city" class="h-11 w-full cursor-pointer rounded-xl bg-surface-container-low px-2 text-[16px] text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="">كل المدن</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-on-surface-variant" for="hero-insurance">التأمين</label>
            <select id="hero-insurance" class="h-11 w-full cursor-pointer rounded-xl bg-surface-container-low px-2 text-[16px] text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="">كل الشركات</option>
            </select>
          </div>
        </div>
        <button type="submit" class="press h-12 w-full rounded-xl bg-primary text-[16px] font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest">
          ابحث عن موعد
        </button>
        <div class="flex flex-wrap gap-2">
          <button type="button" data-quick="today" class="press h-10 rounded-xl bg-surface-container-low px-3 text-[14px] text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            كشف عاجل اليوم
          </button>
          <button type="button" data-quick="price" class="press h-10 rounded-xl bg-surface-container-low px-3 text-[14px] text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            الأقل سعراً
          </button>
        </div>
      </form>

      <div id="home-next-appointment" class="mt-auto" aria-live="polite">${NEXT_APPOINTMENT_SKELETON}
      </div>
    </div>
  </div>
</aside>

<!-- ============ SECTIONS ============ -->
<div class="pb-20 pt-10 lg:col-start-1 lg:row-start-2 lg:pt-0">

  <!-- 1 · SPECIALTIES AS A MENU -->
  <section aria-labelledby="spec-title" data-reveal>
    <div class="flex items-end justify-between gap-4 pb-3">
      <div>
        <h2 id="spec-title" class="text-[clamp(1.5rem,2vw,2rem)] font-bold text-on-surface">التخصصات</h2>
        <p class="mt-1 text-[16px] text-on-surface-variant">اختر التخصص لتتصفح الأطباء المتاحين فيه.</p>
      </div>
      <a href="#doctors" class="inline-flex min-h-11 shrink-0 items-center gap-1 text-[16px] font-semibold text-primary transition-colors hover:text-primary-container">
        الكل
        <span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>
      </a>
    </div>
    <div id="home-specialties" class="flex flex-col">${SPECIALTY_ROWS}
    </div>
  </section>

  <!-- 2 · DOCTORS AS A LIST -->
  <section aria-labelledby="docs-title" class="pt-14" data-reveal>
    <div class="flex items-end justify-between gap-4 pb-3">
      <div>
        <h2 id="docs-title" class="text-[clamp(1.5rem,2vw,2rem)] font-bold text-on-surface">أطباء متاحون الآن</h2>
        <p class="mt-1 text-[16px] text-on-surface-variant">لديهم مواعيد فعلية خلال الأسبوع القادم.</p>
      </div>
      <a href="#doctors" class="inline-flex min-h-11 shrink-0 items-center gap-1 text-[16px] font-semibold text-primary transition-colors hover:text-primary-container">
        الجميع
        <span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>
      </a>
    </div>
    <div id="featured-doctors" class="flex flex-col gap-3" aria-busy="true">${DOCTOR_SKELETONS}
    </div>
  </section>

  <!-- 3 · HOW IT WORKS AS AN ITINERARY -->
  <section aria-labelledby="how-title" class="pt-14" data-reveal>
    <h2 id="how-title" class="text-[clamp(1.5rem,2vw,2rem)] font-bold text-on-surface">كيف يعمل ميعادي</h2>
    <ol class="mt-4 overflow-hidden rounded-xl bg-surface-container-lowest">
      <li class="flex gap-4 p-4 sm:p-5">
        <span class="w-8 shrink-0 text-[26px] font-bold leading-none tabular-nums text-primary">١</span>
        <div>
          <h3 class="text-[17px] font-semibold text-on-surface">اختر التخصص أو الطبيب</h3>
          <p class="mt-1 max-w-[52ch] text-[16px] leading-relaxed text-on-surface-variant">تصفح حسب التخصص أو المدينة أو شركة التأمين، أو ابحث باسم الطبيب مباشرة.</p>
        </div>
      </li>
      <li class="flex gap-4 p-4 sm:p-5">
        <span class="w-8 shrink-0 text-[26px] font-bold leading-none tabular-nums text-primary">٢</span>
        <div>
          <h3 class="text-[17px] font-semibold text-on-surface">اختر الموعد المناسب</h3>
          <p class="mt-1 max-w-[52ch] text-[16px] leading-relaxed text-on-surface-variant">المواعيد المعروضة متاحة فعلاً في جدول العيادة، فلا حاجة إلى مكالمة.</p>
        </div>
      </li>
      <li class="flex gap-4 p-4 sm:p-5">
        <span class="w-8 shrink-0 text-[26px] font-bold leading-none tabular-nums text-primary">٣</span>
        <div>
          <h3 class="text-[17px] font-semibold text-on-surface">أكّد واحتفظ برقم المرجع</h3>
          <p class="mt-1 max-w-[52ch] text-[16px] leading-relaxed text-on-surface-variant">يصلك رقم مرجعي تشاركه عند الاستقبال، وتدير موعدك من صفحة حجوزاتك.</p>
        </div>
      </li>
      <li class="flex items-center justify-between gap-4 bg-on-surface p-4 text-surface sm:p-5">
        <p class="text-[17px] font-semibold">النتيجة: موعد مؤكد</p>
        <span class="text-[14px] tabular-nums text-surface/75">أقل من دقيقة</span>
      </li>
    </ol>
  </section>

  <!-- 4 · WHY, AS PLAIN NAMES IN COLUMNS -->
  <section aria-labelledby="why-title" class="pt-14" data-reveal>
    <div class="max-w-[54ch]">
      <h2 id="why-title" class="text-[clamp(1.5rem,2vw,2rem)] font-bold text-on-surface">لماذا تحجز عبر ميعادي</h2>
      <p class="mt-2 text-[16px] leading-relaxed text-on-surface-variant">كل ما تراه في المنصة يأتي مباشرة من جدول العيادة — لا قوائم منفصلة ولا تأكيدات ورقية.</p>
    </div>
    <div class="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <div>
        <h3 class="text-[17px] font-semibold text-on-surface">حجز بلا تعارض</h3>
        <p class="mt-1 max-w-[42ch] text-[16px] leading-relaxed text-on-surface-variant">كل عملية حجز تُنفَّذ داخل معاملة واحدة، فلا يحصل مريضان على الموعد نفسه.</p>
      </div>
      <div>
        <h3 class="text-[17px] font-semibold text-on-surface">جدول يُحدَّث لحظياً</h3>
        <p class="mt-1 max-w-[42ch] text-[16px] leading-relaxed text-on-surface-variant">تظهر المواعيد المتاحة والمحجوزة فور تغيّرها، دون تحديث الصفحة.</p>
      </div>
      <div>
        <h3 class="text-[17px] font-semibold text-on-surface">إدارة موعدك بنفسك</h3>
        <p class="mt-1 max-w-[42ch] text-[16px] leading-relaxed text-on-surface-variant">أعد الجدولة أو ألغِ من صفحة حجوزاتك، دون اتصال ولا انتظار.</p>
      </div>
      <div>
        <h3 class="text-[17px] font-semibold text-on-surface">تذكير واتساب</h3>
        <p class="mt-1 max-w-[42ch] text-[16px] leading-relaxed text-on-surface-variant">شارك تفاصيل موعدك في نقرة واحدة، ليبقى واضحاً لمن يرافقك.</p>
      </div>
    </div>
    <figure class="mt-8">
      <img src="/assets/white-nile-bridge-omdurman-to-khartoum-sudan.jpg" width="1024" height="768"
        alt="جسر النيل الأبيض بين أم درمان والخرطوم" loading="lazy" decoding="async"
        class="h-56 w-full rounded-xl object-cover" />
    </figure>
  </section>

  <!-- 5 · QUESTIONS BESIDE A TALL PHOTOGRAPH -->
  <section aria-labelledby="faq-title" class="pt-14" data-reveal>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
      <div>
        <h2 id="faq-title" class="text-[clamp(1.5rem,2vw,2rem)] font-bold text-on-surface">أسئلة متكررة</h2>
        <div class="mt-4 flex flex-col gap-2">
          <details class="group rounded-xl bg-surface-container-lowest px-4">
            <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-on-surface">
              <span>كيف أحجز موعداً؟</span>
              <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-primary transition-transform group-open:rotate-45">add</span>
            </summary>
            <p class="pb-4 text-[16px] leading-relaxed text-on-surface-variant">اختر التخصص أو ابحث باسم الطبيب، ثم اختر من المواعيد المتاحة وأكّد الحجز. لا تحتاج إلى مكالمة.</p>
          </details>
          <details class="group rounded-xl bg-surface-container-lowest px-4">
            <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-on-surface">
              <span>كيف أعرف رسوم الكشف؟</span>
              <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-primary transition-transform group-open:rotate-45">add</span>
            </summary>
            <p class="pb-4 text-[16px] leading-relaxed text-on-surface-variant">تظهر رسوم الكشف لكل طبيب في بطاقته، وقبل تأكيد الحجز مباشرة.</p>
          </details>
          <details class="group rounded-xl bg-surface-container-lowest px-4">
            <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-on-surface">
              <span>هل يمكنني إعادة الجدولة أو الإلغاء؟</span>
              <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-primary transition-transform group-open:rotate-45">add</span>
            </summary>
            <p class="pb-4 text-[16px] leading-relaxed text-on-surface-variant">نعم، من صفحة حجوزاتك: افتح الموعد القادم واختر إعادة الجدولة أو الإلغاء.</p>
          </details>
          <details class="group rounded-xl bg-surface-container-lowest px-4">
            <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-on-surface">
              <span>ما رقم مرجع الموعد؟</span>
              <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-primary transition-transform group-open:rotate-45">add</span>
            </summary>
            <p class="pb-4 text-[16px] leading-relaxed text-on-surface-variant">رمز مختصر يظهر في بطاقة الدخول، تشاركه عند الاستقبال للتحقق من حجزك.</p>
          </details>
          <details class="group rounded-xl bg-surface-container-lowest px-4">
            <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-on-surface">
              <span>في أي مدن تعمل المنصة؟</span>
              <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-primary transition-transform group-open:rotate-45">add</span>
            </summary>
            <p class="pb-4 text-[16px] leading-relaxed text-on-surface-variant">الخرطوم وأم درمان وبورتسودان، وتُضاف مدن جديدة مع انضمام عيادات إليها.</p>
          </details>
        </div>
      </div>
      <figure class="order-first md:order-none md:h-[440px]">
        <img src="/assets/the-nile-khartoum-bahri.jpg" width="1024" height="768"
          alt="شاطئ جزيرة توتي على النيل، والخُرطوم في الخلف" loading="lazy" decoding="async"
          class="h-56 w-full rounded-xl object-cover md:h-full" />
      </figure>
    </div>
  </section>

  <!-- 6 · ONE SENTENCE, ONE ACTION -->
  <section class="pt-14" data-reveal>
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
    <p class="mt-6 text-[13px] text-on-surface-variant">صور: أرشيف ماتسون، وديفيد ستانلي، عبر ويكيميديا كومنز.</p>
  </section>

</div>
</div>
</div>`;
