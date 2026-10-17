import { escapeHtml } from "../lib/format";

export function showToast(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  const bg = type === "success" ? "bg-emerald-800 border-emerald-700" : type === "error" ? "bg-red-700 border-red-600" : type === "warning" ? "bg-amber-800 border-amber-700" : "bg-ink border-zinc-700";
  el.className = `pointer-events-auto px-4 py-3 rounded-xl text-white text-sm border shadow toast-enter flex items-center gap-2 ${bg}`;
  el.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; el.style.transition = "all 200ms"; setTimeout(() => el.remove(), 200); }, 4000);
}
