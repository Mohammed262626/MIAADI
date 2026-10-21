import { escapeHtml } from "../lib/format";
import { icon } from "./icons";

export function initials(name: string): string {
  const cleaned = String(name || "").replace(/^(?:د\.?|دكتور|الدكتور|أ\.?|م\.?)\s+/u, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return parts[0].slice(0, 1) + "\u2009" + parts[1].slice(0, 1);
}

export function avatar(name: string, size: "xs" | "sm" | "md" | "lg" = "md"): string {
  const dims = {
    xs: "w-9 h-9 text-xs rounded-lg",
    sm: "w-11 h-11 text-sm rounded-lg",
    md: "w-14 h-14 text-base rounded-lg",
    lg: "w-[72px] h-[72px] text-2xl rounded-xl",
  }[size];
  return `<span class="inline-grid place-items-center shrink-0 whitespace-nowrap font-extrabold leading-none text-on-primary bg-primary ${dims}">${escapeHtml(initials(name))}</span>`;
}

export function money(fee: number): string {
  const n = Number(fee) || 0;
  return `${n.toLocaleString("en-US")} ج.س`;
}

export function durationMin(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm = 0] = startTime.split(":").map(Number);
  const [eh, em = 0] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function statusMeta(status: string): { label: string; cls: string; dot: string } {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    booked: { label: "مؤكد", cls: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant", dot: "bg-tertiary" },
    completed: { label: "مكتمل", cls: "bg-surface-container-high text-on-surface-variant", dot: "bg-secondary" },
    cancelled_by_patient: { label: "ملغي", cls: "bg-error-container text-on-error-container", dot: "bg-error" },
    cancelled_by_clinic: { label: "ملغي (العيادة)", cls: "bg-error-container text-on-error-container", dot: "bg-error" },
    no_show: { label: "لم يحضر", cls: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
  };
  return map[status] || { label: status, cls: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" };
}

export function statusPill(status: string): string {
  const m = statusMeta(status);
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${m.cls}"><span class="w-1.5 h-1.5 rounded-full ${m.dot}"></span>${escapeHtml(m.label)}</span>`;
}

export function shortRef(id: string): string {
  return String(id || "").replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function sectionTitle(title: string, actionHref?: string, actionLabel?: string): string {
  return `<div class="flex items-center justify-between px-1">
    <h2 class="font-extrabold text-[17px] tracking-tight">${escapeHtml(title)}</h2>
    ${actionHref ? `<a href="${escapeHtml(actionHref)}" class="inline-flex items-center gap-0.5 text-sm font-bold text-primary">${escapeHtml(actionLabel || "الكل")}${icon("chevron_left", { size: 18 })}</a>` : ""}
  </div>`;
}

export function emptyState(o: { icon: string; title: string; body: string; actionHtml?: string }): string {
  return `<div class="panel p-8 text-center flex flex-col items-center gap-3">
    <span class="w-16 h-16 rounded-3xl bg-primary-container/10 text-primary grid place-items-center">${icon(o.icon, { size: 30 })}</span>
    <h3 class="font-extrabold text-base">${escapeHtml(o.title)}</h3>
    <p class="text-sm text-on-surface-variant leading-relaxed max-w-[32ch]">${escapeHtml(o.body)}</p>
    ${o.actionHtml || ""}
  </div>`;
}
