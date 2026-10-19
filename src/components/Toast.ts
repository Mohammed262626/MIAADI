import { escapeHtml } from "../lib/format";
import { icon } from "./icons";

export function showToast(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const meta = {
    success: { iconName: "check_circle", cls: "bg-tertiary-fixed/90 text-on-tertiary-fixed-variant", ic: "text-tertiary" },
    error: { iconName: "error", cls: "bg-error-container/95 text-on-error-container", ic: "text-error" },
    warning: { iconName: "warning", cls: "bg-[#FFF4E5]/95 text-[#7A4A00]", ic: "text-[#B45309]" },
    info: { iconName: "info", cls: "bg-inverse-surface/95 text-inverse-on-surface", ic: "text-primary-fixed" },
  }[type];
  const el = document.createElement("div");
  el.className = `toast-enter pointer-events-auto w-full px-4 py-3 rounded-2xl shadow-[0_16px_40px_-16px_rgba(16,24,40,.35)] flex items-center gap-2.5 text-sm font-semibold ${meta.cls}`;
  el.setAttribute("role", "status");
  el.innerHTML = `${icon(meta.iconName, { size: 20, filled: true, className: meta.ic })}<span class="flex-1">${escapeHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 220ms, transform 220ms";
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(() => el.remove(), 220);
  }, 3800);
}
