/* Loading shape for the schedules editor. It mirrors the saved layout — heading,
   four stats, weekly hours plus the side cards — so opening a doctor's calendar
   fills into the real panel instead of jumping up from one line of text. */
export function scheduleSkeletonHtml(): string {
  const line = "rounded bg-surface-container-high";
  const block = "rounded bg-surface-container";
  const stat = `<div class="bg-surface-container-lowest px-4 py-3"><div class="h-3 w-20 ${block}"></div><div class="mt-1.5 h-5 w-10 ${line}"></div></div>`;
  const dayRow = `<div class="flex items-center gap-2 py-2">
      <div class="h-3 w-12 ${line}"></div>
      <div class="ms-auto flex items-center gap-1.5">
        <div class="h-7 w-20 rounded-md ${block}"></div>
        <div class="h-7 w-20 rounded-md ${block}"></div>
        <div class="h-4 w-8 rounded-full ${block}"></div>
      </div>
    </div>`;
  const sideCard = (rows: number) => `<section class="rounded-xl border border-line bg-surface-container-lowest p-3">
      <div class="h-3.5 w-28 ${line}"></div>
      <div class="mt-2 flex flex-col gap-1.5">${Array.from({ length: rows }, () => `<div class="h-8 rounded-md ${block}"></div>`).join("")}</div>
    </section>`;
  return `<div class="animate-pulse" aria-busy="true">
    <div aria-hidden="true">
      <div class="flex flex-col gap-1"><div class="h-3 w-24 ${block}"></div><div class="h-5 w-44 ${line}"></div></div>
      <div class="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">${stat.repeat(4)}</div>
      <div class="mt-3 grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.5fr_1fr]">
        <section class="rounded-xl border border-line bg-surface-container-lowest p-3">
          <div class="flex flex-wrap items-center justify-between gap-2"><div class="h-4 w-40 ${line}"></div><div class="h-7 w-24 rounded-md ${block}"></div></div>
          <div class="flex flex-col divide-y divide-line">${dayRow.repeat(7)}</div>
          <div class="mt-2 flex items-center gap-2 border-t border-line pt-2"><div class="h-3 w-40 ${block}"></div><div class="ms-auto h-8 w-20 rounded-lg ${block}"></div></div>
        </section>
        <div class="flex flex-col gap-3">${sideCard(1)}${sideCard(4)}${sideCard(2)}</div>
      </div>
    </div>
    <span class="sr-only">جارٍ تحميل الجدول…</span>
  </div>`;
}
