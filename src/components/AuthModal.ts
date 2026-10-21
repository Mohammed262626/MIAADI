import { escapeHtml, translateAuthError } from "../lib/format";
import { showToast } from "./Toast";
import { icon } from "./icons";

export function mountAuthModal(
  container: HTMLElement,
  onLogin: (e: { email: string; password: string }) => Promise<void>,
  onRegister: (e: { email: string; password: string; fullName: string; phone: string }) => Promise<void>
) {
  const inputShell = (opts: {
    id: string;
    type: string;
    placeholder: string;
    iconName: string;
    ltr?: boolean;
    extra?: string;
    withToggle?: boolean;
  }) => `
    <div class="relative">
      <span class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant">${icon(opts.iconName, { size: 18 })}</span>
      <input id="${opts.id}" type="${opts.type}" required placeholder="${opts.placeholder}" ${opts.ltr ? 'dir="ltr"' : ""} ${opts.extra || ""}
        class="h-11 w-full rounded-lg border border-line bg-surface-container-lowest ps-10 text-[14px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant hover:border-outline focus:border-primary focus:ring-1 focus:ring-primary ${opts.withToggle ? "pe-10" : "pe-3"}" />
      ${opts.withToggle ? `<button type="button" data-toggle-password="${opts.id}" aria-label="إظهار كلمة المرور" aria-pressed="false"
        class="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">${icon("visibility", { size: 18 })}</button>` : ""}
    </div>`;




  container.innerHTML = `
  <dialog id="auth-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/40 open:grid min-h-dvh w-full max-w-none place-items-end sm:place-items-center">
    <div class="modal-enter max-h-dvh w-full overflow-y-auto rounded-t-2xl border border-line bg-surface-container-lowest pb-[max(20px,env(safe-area-inset-bottom))] sm:max-w-[420px] sm:rounded-2xl sm:pb-0">
      <div class="flex flex-col p-6 sm:p-7">

        <div class="mb-5 flex items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">${icon("health_and_safety", { size: 22, filled: true })}</span>
          <div class="min-w-0 flex-1">
            <h2 class="text-[17px] font-bold leading-tight text-on-surface">ميعادي</h2>
            <p class="mt-0.5 text-[13px] text-on-surface-variant" id="auth-subtitle">سجّل الدخول لإتمام حجزك</p>
          </div>
          <button data-close class="grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low" aria-label="إغلاق">${icon("close", { size: 20 })}</button>
        </div>

        <div class="relative mb-5 grid grid-cols-2 gap-1 rounded-lg bg-surface-container-low p-1 text-[13px] font-semibold" role="tablist" aria-label="طريقة الدخول">
          <span data-indicator class="absolute bottom-1 top-1 rounded-md border border-line bg-surface-container-lowest transition-[right,width,left] duration-200 ease-out" style="width: calc(50% - 0.375rem); right: 0.25rem"></span>
          <button data-tab="login" role="tab" aria-selected="true" class="relative z-10 h-9 rounded-md transition-colors">دخول</button>
          <button data-tab="register" role="tab" aria-selected="false" class="relative z-10 h-9 rounded-md transition-colors">حساب جديد</button>
        </div>

        <div id="auth-error" class="mb-4 hidden flex items-start gap-2 rounded-lg border border-error/30 bg-error-container px-3 py-2.5 text-[13px] font-medium text-on-error-container"></div>

        <form id="login-form" class="flex flex-col gap-3" novalidate>
          ${inputShell({ id: "login-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
          ${inputShell({ id: "login-password", type: "password", placeholder: "كلمة المرور", iconName: "lock", withToggle: true, extra: 'autocomplete="current-password"' })}
          <button type="submit" data-submit class="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70">
            <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>تسجيل الدخول</span>
          </button>
        </form>

        <form id="register-form" class="hidden flex-col gap-3" novalidate>
          ${inputShell({ id: "reg-name", type: "text", placeholder: "الاسم الكامل", iconName: "person", extra: 'autocomplete="name"' })}
          ${inputShell({ id: "reg-phone", type: "tel", placeholder: "رقم الهاتف — 249+", iconName: "phone", ltr: true, extra: 'inputmode="tel" autocomplete="tel"' })}
          ${inputShell({ id: "reg-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
          ${inputShell({ id: "reg-password", type: "password", placeholder: "كلمة المرور (6 أحرف أو أكثر)", iconName: "lock", withToggle: true, extra: 'minlength="6" autocomplete="new-password"' })}
          <button type="submit" data-submit class="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70">
            <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>إنشاء حساب</span>
          </button>
        </form>

        <p class="mt-4 text-center text-[12px] text-on-surface-variant">بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
      </div>
    </div>
  </dialog>`;


  const dlg = container.querySelector("#auth-dialog") as HTMLDialogElement;
  const errEl = container.querySelector("#auth-error") as HTMLElement;
  const tabs = container.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const indicator = container.querySelector<HTMLElement>("[data-indicator]")!;
  const forms = {
    login: container.querySelector("#login-form") as HTMLFormElement,
    register: container.querySelector("#register-form") as HTMLFormElement,
  };
  const subtitle = container.querySelector("#auth-subtitle") as HTMLElement;

  const showErr = (e: unknown) => {
    errEl.innerHTML = `${icon("error", { size: 18, filled: true })}<span>${escapeHtml(translateAuthError(e))}</span>`;
    errEl.classList.remove("hidden");
    errEl.classList.add("modal-enter");
  };
  const clearErr = () => { errEl.classList.add("hidden"); errEl.classList.remove("modal-enter"); };

  const setTab = (tab: string) => {
    forms.login.classList.toggle("hidden", tab !== "login");
    forms.login.classList.toggle("flex", tab === "login");
    forms.register.classList.toggle("hidden", tab !== "register");
    forms.register.classList.toggle("flex", tab === "register");
    tabs.forEach((b) => {
      const on = b.dataset.tab === tab;
      b.setAttribute("aria-selected", String(on));
      b.classList.toggle("text-primary", on);
      b.classList.toggle("text-on-surface-variant", !on);
    });
    indicator.style.right = tab === "login" ? "0.25rem" : "calc(50% + 0.125rem)";
    subtitle.textContent = tab === "login" ? "سجّل الدخول لإتمام حجزك" : "أنشئ حسابك في دقيقة واحدة";
    clearErr();
    const first = (tab === "login" ? container.querySelector("#login-email") : container.querySelector("#reg-name")) as HTMLInputElement | null;
    if (dlg.open) first?.focus({ preventScroll: true });
  };
  tabs.forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab!)));
  setTab("login");
  container.querySelector("[data-close]")?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  /* password visibility */
  container.querySelectorAll<HTMLButtonElement>("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = container.querySelector<HTMLInputElement>(`#${btn.dataset.togglePassword}`)!;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
      btn.innerHTML = icon(show ? "visibility_off" : "visibility", { size: 20 });
    });
  });

  /* submit with real loading feedback */
  const setLoading = (form: HTMLFormElement, loading: boolean, label: string) => {
    const btn = form.querySelector<HTMLButtonElement>("[data-submit]")!;
    const spin = form.querySelector<HTMLElement>("[data-spin]")!;
    const text = form.querySelector<HTMLElement>("[data-label]")!;
    btn.disabled = loading;
    spin.classList.toggle("hidden", !loading);
    spin.classList.toggle("animate-spin", loading);
    text.textContent = loading ? "لحظة من فضلك…" : label;
    form.querySelectorAll<HTMLInputElement>("input").forEach((i) => { i.disabled = loading; });
  };

  forms.login.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!forms.login.reportValidity()) return;
    clearErr();
    const email = (container.querySelector("#login-email") as HTMLInputElement).value.trim();
    const password = (container.querySelector("#login-password") as HTMLInputElement).value;
    setLoading(forms.login, true, "تسجيل الدخول");
    try {
      await onLogin({ email, password });
      dlg.close();
      showToast("تم تسجيل الدخول", "success");
    } catch (err) {
      showErr(err);
    } finally {
      setLoading(forms.login, false, "تسجيل الدخول");
    }
  });

  forms.register.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!forms.register.reportValidity()) return;
    clearErr();
    const fullName = (container.querySelector("#reg-name") as HTMLInputElement).value.trim();
    const phone = (container.querySelector("#reg-phone") as HTMLInputElement).value.trim();
    const email = (container.querySelector("#reg-email") as HTMLInputElement).value.trim();
    const password = (container.querySelector("#reg-password") as HTMLInputElement).value;
    setLoading(forms.register, true, "إنشاء حساب");
    try {
      await onRegister({ email, password, fullName, phone });
      dlg.close();
      showToast("تم إنشاء الحساب — راجع بريدك إن طُلب التأكيد", "success");
    } catch (err) {
      showErr(err);
    } finally {
      setLoading(forms.register, false, "إنشاء حساب");
    }
  });

  return {
    open: () => {
      dlg.showModal();
      clearErr();
      const first = (dlg.querySelector("#login-email") ?? dlg.querySelector("input")) as HTMLInputElement | null;
      first?.focus({ preventScroll: true });
    },
    close: () => dlg.close(),
    element: dlg,
    setTab,
  };
}
