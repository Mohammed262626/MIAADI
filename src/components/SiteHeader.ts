import { SITE_HEADER, SITE_FOOTER } from "../views/stitch/shell";
import { escapeHtml } from "../lib/format";
import { locationLabel } from "../lib/geodata";

const AVATAR_LOGGED_OUT = `<button data-action="open-auth" type="button" aria-label="دخول" class="press flex items-center gap-space-xs px-space-md py-space-xs min-h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">login</span><span>دخول</span></button>`;

const AVATAR_LOGGED_IN = `<a data-path="profile" href="#profile" title="حسابي" aria-label="حسابي" class="press w-11 h-11 rounded-xl bg-primary flex items-center justify-center"><span aria-hidden="true" class="material-symbols-outlined text-on-primary text-[18px]">person</span></a>`;

const AVATAR_RE =
  /<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">[\s\S]*?<\/div>/;

type NavItem = { key: string; label: string; path: string };

const BASE_NAV: NavItem[] = [
  { key: "home", label: "الرئيسية", path: "home" },
  { key: "doctors", label: "الأطباء والتخصصات", path: "doctors-and-specialties" },
  { key: "hospitals", label: "المستشفيات والمراكز", path: "hospitals-and-centers" },
  { key: "bookings", label: "مواعيدي", path: "my-bookings" },
];

const DESKTOP_IDLE = "press font-label-md text-label-md px-space-md py-space-xs rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors";
const DESKTOP_ACTIVE = "press font-label-md text-label-md px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary-container";
const DRAWER_IDLE = "press min-h-11 py-2.5 px-space-md rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors";
const DRAWER_ACTIVE = "press min-h-11 py-2.5 px-space-md rounded-xl font-label-md text-label-md bg-primary-container text-on-primary-container font-bold";

function activeKey(route?: { name: string } | null): string | null {
  switch (route?.name) {
    case "home": return "home";
    case "doctors":
    case "doctor": return "doctors";
    case "hospitals": return "hospitals";
    case "appointments": return "bookings";
    case "admin": return "admin";
    default: return null;
  }
}

function navItemsFor(user: unknown): NavItem[] {
  const role = (user as { profile?: { role?: string | null } | null } | null)?.profile?.role;
  if (role === "admin" || role === "doctor") {
    // Staff live in the dashboard: no consumer landing entry (it redirects to the
    // dashboard anyway) and no patient bookings portal.
    return [
      ...BASE_NAV.filter((i) => i.key !== "home" && i.key !== "bookings"),
      {
        key: "admin",
        label: role === "admin" ? "لوحة الإدارة" : "لوحتي",
        path: "dashboard-overview",
      },
    ];
  }
  return [...BASE_NAV];
}

function desktopLink(item: NavItem, active: boolean): string {
  const current = active ? ' aria-current="page"' : "";
  return `<a class="${active ? DESKTOP_ACTIVE : DESKTOP_IDLE}" data-path="${item.path}" href="#"${current}>${item.label}</a>`;
}

function drawerLink(item: NavItem, active: boolean): string {
  const current = active ? ' aria-current="page"' : "";
  return `<a class="${active ? DRAWER_ACTIVE : DRAWER_IDLE}" data-path="${item.path}" href="#"${current}>${item.label}</a>`;
}

export function renderSiteHeader(user: unknown, route?: { name: string } | null): string {
  const key = activeKey(route);
  const items = navItemsFor(user);
  let inner = SITE_HEADER
    .replace("__DESKTOP_NAV__", items.map((i) => desktopLink(i, i.key === key)).join(""))
    .replace("__DRAWER_NAV__", items.map((i) => drawerLink(i, i.key === key)).join(""))
    .replaceAll("__LOCATION_LABEL__", escapeHtml(locationLabel()));
  inner = inner.replace(AVATAR_RE, user ? AVATAR_LOGGED_IN : AVATAR_LOGGED_OUT);
  // Staff (doctor/admin) never book or search like a customer, so the primary
  // booking CTA and the city locator stay out of their header entirely.
  const role = (user as { profile?: { role?: string | null } | null } | null)?.profile?.role;
  if (role === "admin" || role === "doctor") {
    inner = inner
      .replace(/<a class="press hidden sm:flex items-center gap-space-xs[^>]*data-path="book-now"[\s\S]*?<\/a>/, "")
      .replace(/<button type="button" data-locate-btn[\s\S]*?<\/button>/g, "")
      // Staff accounts live in the dashboard, so the header avatar opens it too.
      .replace(
        'data-path="profile" href="#profile" title="حسابي" aria-label="حسابي"',
        'data-path="dashboard-overview" href="#admin" title="لوحتي" aria-label="لوحتي"',
      );
  }
  return `<header class="fixed top-0 w-full z-50 pt-[env(safe-area-inset-top)] bg-surface-container-lowest">${inner}</header>`;
}

export function renderSiteFooter(): string {
  return `<footer class="w-full mt-space-xl">${SITE_FOOTER}</footer>`;
}
