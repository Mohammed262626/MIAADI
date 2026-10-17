import { escapeHtml } from "../lib/format";

type Role = "patient" | "doctor" | "admin";
type User = { profile?: { role: Role; full_name: string } } | null;

export function renderHeader(active: "doctors" | "appointments" | "admin", user: User, badgeCount: number): string {
  const role = user?.profile?.role;
  const showAdmin = role === "admin" || role === "doctor";
  const name = escapeHtml(user?.profile?.full_name || "ضيف");
  return `
  <header class="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
      <a href="#doctors" class="flex items-center gap-3 shrink-0">
        <span class="w-9 h-9 rounded-xl bg-ink text-white grid place-items-center text-sm font-extrabold">ن</span>
        <span class="font-extrabold tracking-tight leading-none">نبض العافية</span>
        <span class="hidden sm:inline text-xs text-zinc-500">حجز مواعيد</span>
      </a>
      <nav class="flex items-center gap-1.5 p-1 rounded-xl bg-paper-soft border border-line">
        <a href="#doctors" class="px-4 py-2 rounded-xl text-sm font-semibold ${active === "doctors" ? "bg-ink text-white" : "text-zinc-600 hover:text-ink"}">الأطباء</a>
        <a href="#appointments" class="px-4 py-2 rounded-xl text-sm font-semibold relative ${active === "appointments" ? "bg-ink text-white" : "text-zinc-600 hover:text-ink"}">حجوزاتي ${badgeCount ? `<span class="absolute -top-1 -left-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-teal text-white text-xs">${badgeCount}</span>` : ""}</a>
        ${showAdmin ? `<a href="#admin" class="px-3 py-2 rounded-xl text-sm font-semibold ${active === "admin" ? "bg-ink text-white" : "text-zinc-600 hover:text-ink"}">الإدارة</a>` : ""}
      </nav>
      <div class="flex items-center gap-2">
        ${user ? `
          <span class="hidden sm:inline text-sm font-semibold">${name}</span>
          <button data-action="logout" class="px-3 py-2 rounded-xl border border-line text-sm hover:bg-paper-soft">خروج</button>
        ` : `<button data-action="open-auth" class="px-4 py-2 rounded-xl bg-ink text-white text-sm font-semibold">دخول</button>`}
      </div>
    </div>
  </header>`;
}
