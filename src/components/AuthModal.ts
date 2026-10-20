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
      <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">${icon(opts.iconName, { size: 20 })}</span>
      <input id="${opts.id}" type="${opts.type}" required placeholder="${opts.placeholder}" ${opts.ltr ? 'dir="ltr"' : ""} ${opts.extra || ""}
        class="w-full h-12 rounded-2xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline
               pr-11 ${opts.withToggle ? "pl-11" : "pl-4"} outline-none transition-all
               hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20" />
      ${opts.withToggle ? `<button type="button" data-toggle-password="${opts.id}" aria-label="إظهار كلمة المرور" aria-pressed="false"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">${icon("visibility", { size: 20 })}</button>` : ""}
    </div>`;

  const benefit = (iconName: string, title: string, sub: string) => `
    <div class="flex items-start gap-space-sm">
      <span class="w-9 h-9 rounded-xl bg-on-primary/10 text-on-primary grid place-items-center shrink-0">${icon(iconName, { size: 20 })}</span>
      <div class="flex flex-col">
        <span class="font-label-md text-label-md font-bold">${title}</span>
        <span class="font-body-sm text-body-sm opacity-80 leading-snug">${sub}</span>
      </div>
    </div>`;

  container.innerHTML = `
  <dialog id="auth-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-end sm:place-items-center min-h-dvh w-full max-w-none">
    <div class="modal-enter bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] w-full sm:max-w-[880px] max-h-dvh overflow-y-auto pb-[max(24px,env(safe-area-inset-bottom))] sm:pb-0">
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_320px]">

        <!-- form column -->
        <div class="p-6 sm:p-8 flex flex-col">
          <div class="flex items-center gap-3 mb-6">
            <span class="w-11 h-11 rounded-2xl bg-primary text-on-primary grid place-items-center sm:hidden">${icon("health_and_safety", { size: 22, filled: true })}</span>
            <div class="flex-1">
              <h2 class="font-extrabold text-lg tracking-tight leading-none">ميعادي</h2>
              <p class="text-xs text-on-surface-variant mt-1" id="auth-subtitle">سجّل الدخول لإتمام حجزك</p>
            </div>
            <button data-close class="w-9 h-9 grid place-items-center rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors" aria-label="إغلاق">${icon("close", { size: 20 })}</button>
          </div>

          <!-- segmented tabs with sliding pill -->
          <div class="relative grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-container-low mb-5 text-sm font-bold" role="tablist" aria-label="طريقة الدخول">
            <span data-indicator class="absolute top-1 bottom-1 rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-300 ease-out" style="width: calc(50% - 0.375rem); right: 0.25rem"></span>
            <button data-tab="login" role="tab" aria-selected="true" class="relative z-10 h-10 rounded-xl transition-colors">دخول</button>
            <button data-tab="register" role="tab" aria-selected="false" class="relative z-10 h-10 rounded-xl transition-colors">حساب جديد</button>
          </div>

          <div id="auth-error" class="hidden mb-4 px-3.5 py-3 rounded-2xl bg-error-container text-on-error-container text-sm font-semibold flex items-start gap-2"></div>

          <form id="login-form" class="flex flex-col gap-3" novalidate>
            ${inputShell({ id: "login-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
            ${inputShell({ id: "login-password", type: "password", placeholder: "كلمة المرور", iconName: "lock", withToggle: true, extra: 'autocomplete="current-password"' })}
            <button type="submit" data-submit class="mt-1 w-full h-12 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>تسجيل الدخول</span>
            </button>
          </form>

          <form id="register-form" class="hidden flex-col gap-3" novalidate>
            ${inputShell({ id: "reg-name", type: "text", placeholder: "الاسم الكامل", iconName: "person", extra: 'autocomplete="name"' })}
            ${inputShell({ id: "reg-phone", type: "tel", placeholder: "رقم الهاتف — 249+", iconName: "phone", ltr: true, extra: 'inputmode="tel" autocomplete="tel"' })}
            ${inputShell({ id: "reg-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
            ${inputShell({ id: "reg-password", type: "password", placeholder: "كلمة المرور (6 أحرف أو أكثر)", iconName: "lock", withToggle: true, extra: 'minlength="6" autocomplete="new-password"' })}
            <button type="submit" data-submit class="mt-1 w-full h-12 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>إنشاء حساب</span>
            </button>
          </form>

          <p class="mt-4 text-[11px] text-center text-on-surface-variant">بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
        </div>

        <!-- brand panel (desktop only) -->
        <div class="hidden sm:flex relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-surface-tint text-on-primary flex-col justify-between p-8">
          <div class="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-on-primary/10 blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-tertiary/20 blur-2xl pointer-events-none"></div>
          <div class="relative flex items-center gap-3">
            <span class="w-11 h-11 rounded-2xl bg-primary-fixed text-on-primary-fixed grid place-items-center shadow-sm">${icon("health_and_safety", { size: 22, filled: true })}</span>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm font-bold leading-none">ميعادي</span>
              <span class="font-label-sm text-label-sm tracking-wider opacity-70 mt-1">MIAADI</span>
            </div>
          </div>
          <div class="relative flex flex-col gap-space-md">
            <h3 class="font-headline-sm text-headline-sm font-bold leading-snug">موعدك القادم يبدأ من هنا</h3>
            ${benefit("event_available", "جدول واحد حقيقي", "حجز مؤكد بلا تعارض مع جدول العيادة")}
            ${benefit("qr_code_2", "تذكرة موعد ذكية", "رمز QR لتسجيل الوصول عند الاستقبال")}
            ${benefit("notifications_active", "تذكير قبل موعدك", "حتى لا تفوتك الزيارة")}
          </div>
          <p class="relative font-body-sm text-body-sm opacity-70">الخرطوم · أم درمان · بورتسودان</p>
        </div>

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
