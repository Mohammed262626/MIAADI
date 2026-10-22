import { escapeHtml } from "../lib/format";
import { icon } from "./icons";

let dialogSeq = 0;

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
    const id = `confirm-dialog-${++dialogSeq}`;
    const titleId = `${id}-title`;
    const bodyId = `${id}-body`;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const wrap = document.createElement("div");
    wrap.className = "fixed inset-0 z-[70] grid place-items-end sm:place-items-center bg-inverse-surface/50 backdrop-blur-sm";
    wrap.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="${titleId}"${opts.body ? ` aria-describedby="${bodyId}"` : ""} tabindex="-1"
        class="modal-enter w-full sm:max-w-[420px] bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] p-6 pb-[max(24px,env(safe-area-inset-bottom))] space-y-4 focus:outline-none">
        <div class="flex items-start gap-3">
          <span class="w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${
            tone === "danger" ? "bg-error-container text-on-error-container" : "bg-primary-container/15 text-primary"
          }">${icon(opts.iconName || (tone === "danger" ? "warning" : "help"), { size: 22 })}</span>
          <div class="pt-0.5">
            <h3 id="${titleId}" class="font-extrabold text-base">${escapeHtml(opts.title)}</h3>
            ${opts.body ? `<p id="${bodyId}" class="text-sm text-on-surface-variant mt-1 leading-relaxed">${escapeHtml(opts.body)}</p>` : ""}
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button type="button" data-cancel class="flex-1 h-12 rounded-2xl border border-outline-variant font-bold text-sm">${escapeHtml(opts.cancelLabel || "تراجع")}</button>
          <button type="button" data-ok class="flex-1 h-12 rounded-2xl font-bold text-sm ${
            tone === "danger" ? "bg-error text-on-error" : "bg-primary text-on-primary"
          }">${escapeHtml(opts.confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const dialog = wrap.querySelector<HTMLElement>('[role="dialog"]')!;
    const buttons = [...wrap.querySelectorAll<HTMLButtonElement>("button")];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(false); return; }
      if (e.key !== "Tab" || !buttons.length) return;
      // Keep focus inside the dialog while it is open.
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!dialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };

    const close = (v: boolean) => {
      document.removeEventListener("keydown", onKey);
      wrap.remove();
      previouslyFocused?.focus?.({ preventScroll: true });
      resolve(v);
    };

    buttons[0]?.focus();
    document.addEventListener("keydown", onKey);

    wrap.querySelector("[data-cancel]")?.addEventListener("click", () => close(false));
    wrap.querySelector("[data-ok]")?.addEventListener("click", () => close(true));
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close(false);
    });
  });
}
