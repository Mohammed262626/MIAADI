import { escapeHtml } from "../lib/format";
import { icon } from "./icons";

export function confirmSheet(opts: {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  iconName?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const tone = opts.tone || "danger";
    const wrap = document.createElement("div");
    wrap.className = "fixed inset-0 z-[70] grid place-items-end sm:place-items-center bg-inverse-surface/50 backdrop-blur-sm";
    wrap.innerHTML = `
      <div class="modal-enter w-full sm:max-w-[420px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] p-6 pb-[max(24px,env(safe-area-inset-bottom))] space-y-4">
        <div class="flex items-start gap-3">
          <span class="w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${
            tone === "danger" ? "bg-error-container text-on-error-container" : "bg-primary-container/15 text-primary"
          }">${icon(opts.iconName || (tone === "danger" ? "warning" : "help"), { size: 22 })}</span>
          <div class="pt-0.5">
            <h3 class="font-extrabold text-base">${escapeHtml(opts.title)}</h3>
            ${opts.body ? `<p class="text-sm text-on-surface-variant mt-1 leading-relaxed">${escapeHtml(opts.body)}</p>` : ""}
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button data-cancel class="flex-1 h-12 rounded-2xl border border-outline-variant font-bold text-sm">${escapeHtml(opts.cancelLabel || "تراجع")}</button>
          <button data-ok class="flex-1 h-12 rounded-2xl font-bold text-sm ${
            tone === "danger" ? "bg-error text-on-error" : "bg-primary text-on-primary"
          }">${escapeHtml(opts.confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const close = (v: boolean) => {
      wrap.remove();
      resolve(v);
    };
    wrap.querySelector("[data-cancel]")?.addEventListener("click", () => close(false));
    wrap.querySelector("[data-ok]")?.addEventListener("click", () => close(true));
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close(false);
    });
  });
}
