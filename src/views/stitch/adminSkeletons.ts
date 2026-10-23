/* Loading shapes for the admin shell. Each builder mirrors the panel it stands
   in for — header, stat strip, toolbar, rows, pager — so a tab fills in
   instead of changing shape. They live here (not in the shell chunk) because
   the doctors/accounts tabs paint their own skeleton while their data loads. */

const LINE = "rounded bg-surface-container-high";
const BLOCK = "rounded bg-surface-container";

const stat = () => `<div class="bg-surface-container-lowest px-4 py-3"><div class="h-3 w-20 ${BLOCK}"></div><div class="mt-1.5 h-6 w-10 ${LINE}"></div></div>`;
const statsGrid = (cols: string, n: number) => `<div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line ${cols}">${Array.from({ length: n }, stat).join("")}</div>`;
const card = () => `<div class="h-32 rounded-xl border border-line bg-surface-container-lowest"></div>`;
const control = (w: string, h = "h-9") => `<div class="${h} ${w} shrink-0 rounded-lg ${BLOCK}"></div>`;
const tableHead = (widths: string[]) => `<div class="bg-surface-container-low px-3 py-2"><div class="flex items-center gap-6">${widths.map((w) => `<div class="h-3 ${w} ${BLOCK}"></div>`).join("")}</div></div>`;
const pager = (bg: boolean) => `<div class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2${bg ? " bg-surface-container-low" : ""}">
  <div class="h-3 w-24 ${BLOCK}"></div>
  <div class="flex items-center gap-1">${control("w-16", "h-8")}<div class="mx-1 h-3 w-8 ${BLOCK}"></div>${control("w-16", "h-8")}</div>
</div>`;

// Both management tabs open with a breadcrumb, a title and the add button.
const tabHeader = () => `
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <div class="mb-1 flex items-center gap-2"><div class="h-3 w-16 ${BLOCK}"></div><div class="h-3 w-2 ${BLOCK}"></div><div class="h-3 w-24 ${LINE}"></div></div>
      <div class="h-6 w-40 ${LINE}"></div>
      <div class="mt-1.5 h-3 w-72 max-w-full ${BLOCK}"></div>
    </div>
    ${control("w-32", "h-10")}
  </div>`;

const title = () => `<div class="min-w-0"><div class="h-6 w-44 ${LINE}"></div><div class="mt-2 h-3 w-72 max-w-full ${BLOCK}"></div></div>`;

const apptRow = () => `
  <div class="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
    <div class="min-w-0 flex-1"><div class="h-3 w-28 ${LINE}"></div><div class="mt-1.5 h-2.5 w-20 ${BLOCK}"></div></div>
    <div class="hidden h-3 w-24 ${BLOCK} sm:block"></div>
    <div class="hidden h-3 w-20 ${BLOCK} md:block"></div>
    <div class="h-5 w-16 rounded ${BLOCK}"></div>
    <div class="h-7 w-24 rounded-lg ${BLOCK}"></div>
  </div>`;
const doctorRow = () => `
  <div class="flex items-center gap-3 border-b border-line/70 px-3 py-2 last:border-0">
    <div class="h-9 w-9 shrink-0 rounded-lg ${BLOCK}"></div>
    <div class="min-w-0 flex-1"><div class="h-3 w-28 ${LINE}"></div><div class="mt-1.5 h-2.5 w-20 ${BLOCK}"></div></div>
    <div class="hidden h-3 w-24 ${BLOCK} sm:block"></div>
    <div class="hidden h-3 w-16 ${BLOCK} md:block"></div>
    <div class="hidden h-5 w-14 rounded ${BLOCK} lg:block"></div>
    <div class="h-7 w-20 rounded-lg ${BLOCK}"></div>
  </div>`;
const accountRow = () => `
  <div class="flex items-center gap-3 border-b border-line/70 px-3 py-2 last:border-0">
    <div class="h-9 w-9 shrink-0 rounded-lg ${BLOCK}"></div>
    <div class="min-w-0 flex-1"><div class="h-3 w-28 ${LINE}"></div><div class="mt-1.5 h-2.5 w-32 max-w-full ${BLOCK}"></div></div>
    <div class="hidden h-3 w-24 ${BLOCK} sm:block"></div>
    <div class="h-5 w-14 rounded ${BLOCK}"></div>
    <div class="h-7 w-24 rounded-lg ${BLOCK}"></div>
  </div>`;

const shell = (label: string, body: string) => `<div class="animate-pulse" aria-busy="true"><div aria-hidden="true">${body}</div><span class="sr-only">${label}</span></div>`;

export function overviewSkeletonHtml(): string {
  return shell("جارٍ تحميل لوحة الإدارة…", `
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-end justify-between gap-4">${title()}<div class="h-9 w-28 ${BLOCK}"></div></div>
      <div class="h-28 rounded-xl border border-line bg-surface-container-lowest"></div>
      ${statsGrid("sm:grid-cols-3 lg:grid-cols-6", 6)}
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">${Array.from({ length: 6 }, card).join("")}</div>
    </div>`);
}

export function appointmentsSkeletonHtml(): string {
  return shell("جارٍ تحميل المواعيد…", `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0"><div class="h-6 w-44 ${LINE}"></div><div class="mt-1.5 h-3 w-80 max-w-full ${BLOCK}"></div></div>
      <div class="flex flex-wrap items-center gap-3"><div class="h-3 w-40 ${BLOCK}"></div><div class="h-6 w-16 rounded-md ${BLOCK}"></div></div>
    </div>
    <div class="mt-6 flex flex-col gap-4">
      ${statsGrid("sm:grid-cols-3 lg:grid-cols-6", 6)}
      <div class="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-lowest p-4">
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap items-center gap-0.5 rounded-lg bg-surface-container-low p-1">${["w-8", "w-9", "w-10", "w-8", "w-8"].map((w) => `<div class="h-8 ${w} rounded-md ${BLOCK}"></div>`).join("")}</div>
          <div class="ms-auto">${control("w-32")}</div>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div class="h-9 min-w-0 flex-1 rounded-lg ${BLOCK}"></div>
          ${control("w-32")}<div class="h-3 w-4 shrink-0 ${BLOCK}"></div>${control("w-32")}${control("w-28")}
        </div>
      </div>
      <div class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
        ${tableHead(["w-16", "w-16", "w-20", "w-24", "w-14"])}
        ${Array.from({ length: 6 }, apptRow).join("")}
        ${pager(true)}
      </div>
    </div>`);
}

export function doctorsSkeletonHtml(): string {
  return shell("جارٍ تحميل الأطباء…", `
    ${tabHeader()}
    <div class="flex flex-col gap-3">
      ${statsGrid("sm:grid-cols-3 lg:grid-cols-5", 5)}
      <section class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
        <div class="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <div class="h-9 min-w-0 flex-1 rounded-lg ${BLOCK}"></div>
          <div class="flex flex-wrap items-center gap-2">${control("w-28")}${control("w-32")}${control("w-16")}</div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
          <div class="h-6 w-16 rounded-full ${BLOCK}"></div><div class="h-6 w-20 rounded-full ${BLOCK}"></div><div class="h-6 w-20 rounded-full ${BLOCK}"></div>
          <div class="ms-auto h-3 w-16 ${BLOCK}"></div>
        </div>
        ${tableHead(["w-16", "w-14", "w-16", "w-10", "w-12", "w-12"])}
        ${Array.from({ length: 6 }, doctorRow).join("")}
        ${pager(false)}
      </section>
    </div>`);
}

export function accountsSkeletonHtml(): string {
  return shell("جارٍ تحميل الحسابات…", `
    ${tabHeader()}
    <div class="flex flex-col gap-3">
      ${statsGrid("sm:grid-cols-4", 4)}
      <section class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
        <div class="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <div class="h-9 min-w-0 flex-1 rounded-lg ${BLOCK}"></div>
          ${control("w-16")}
        </div>
        <div class="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
          <div class="h-6 w-14 rounded-full ${BLOCK}"></div><div class="h-6 w-16 rounded-full ${BLOCK}"></div><div class="h-6 w-14 rounded-full ${BLOCK}"></div><div class="h-6 w-14 rounded-full ${BLOCK}"></div>
          <div class="ms-auto h-3 w-16 ${BLOCK}"></div>
        </div>
        ${tableHead(["w-20", "w-16", "w-12", "w-12"])}
        ${Array.from({ length: 6 }, accountRow).join("")}
        ${pager(false)}
      </section>
    </div>`);
}
