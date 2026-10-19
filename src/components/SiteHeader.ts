import { SITE_HEADER, SITE_FOOTER } from "../views/stitch/shell";

const AVATAR_LOGGED_OUT = `<button data-action="open-auth" type="button" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all"><span class="material-symbols-outlined text-[18px]">login</span><span>دخول</span></button>`;

const AVATAR_LOGGED_IN = `<a data-path="profile" href="#profile" title="حسابي" class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></a>`;

const AVATAR_RE =
  /<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">[\s\S]*?<\/div>/;

export function renderSiteHeader(user: unknown): string {
  let inner = SITE_HEADER;
  inner = inner.replace(
    /(<button class="px-space-sm py-space-xs rounded-full[^>]*?)type="button"/g,
    '$1data-action="lang" type="button"'
  );
  inner = inner.replace(AVATAR_RE, user ? AVATAR_LOGGED_IN : AVATAR_LOGGED_OUT);
  return `<header class="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">${inner}</header>`;
}

export function renderSiteFooter(): string {
  return `<footer class="w-full bg-surface-container-lowest mt-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.02)]">${SITE_FOOTER}</footer>`;
}
