<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>ميعادي — SvelteKit</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="min-h-svh grid place-items-center p-6">
  <section class="w-full max-w-md rounded-3xl bg-surface-container p-7 shadow-lg">
    <div class="flex items-center gap-3">
      <span class="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-on-primary text-lg font-black">م</span>
      <div>
        <h1 class="text-xl font-extrabold leading-tight">ميعادي على SvelteKit</h1>
        <p class="text-sm text-on-surface-variant">المرحلة 0 — تم تجهيز الهيكل</p>
      </div>
    </div>

    <dl class="mt-6 space-y-2 text-sm">
      <div class="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2">
        <dt class="text-on-surface-variant">SSR</dt>
        <dd class="font-bold" dir="ltr">مباشر من الخادم ✓</dd>
      </div>
      <div class="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2">
        <dt class="text-on-surface-variant">وقت التوليد</dt>
        <dd class="font-mono text-xs" dir="ltr">{new Date(data.renderedAt).toLocaleTimeString("en-GB")}</dd>
      </div>
    </dl>

    <p class="mt-5 text-xs leading-relaxed text-on-surface-variant">
      هذه صفحة تحقق مؤقتة من أن SvelteKit و SSR يعملان على Vercel.
      التطبيق الحالي (لوحة الطبيب والإدارة والحجز) ما زال يعمل من فرع
      <code class="font-mono" dir="ltr">master</code> حتى ننقل المسارات واحدًا واحدًا.
    </p>
  </section>
</main>
