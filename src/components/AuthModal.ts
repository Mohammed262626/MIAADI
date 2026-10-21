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
      <span class="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">${icon(opts.iconName, { size: 18 })}</span>
      <input id="${opts.id}" type="${opts.type}" required placeholder="${opts.placeholder}" ${opts.ltr ? 'dir="ltr"' : ""} ${opts.extra || ""}
        class="h-12 w-full rounded-xl border border-line bg-surface-container-lowest ps-11 text-[14px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 ${opts.withToggle ? "pe-11" : "pe-3.5"}" />
      ${opts.withToggle ? `<button type="button" data-toggle-password="${opts.id}" aria-label="إظهار كلمة المرور" aria-pressed="false"
        class="absolute end-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">${icon("visibility", { size: 18 })}</button>` : ""}
    </div>`;




  container.innerHTML = `
  <dialog id="auth-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/40 open:grid min-h-dvh w-full max-w-none place-items-end sm:place-items-center">
    <div class="modal-enter max-h-dvh w-full overflow-y-auto rounded-t-2xl border border-line bg-surface-container-lowest pb-[max(20px,env(safe-area-inset-bottom))] sm:max-w-[860px] sm:rounded-2xl sm:pb-0">
      <div class="grid sm:grid-cols-[300px_minmax(0,1fr)]">

        <aside class="hidden flex-col justify-between bg-primary p-7 text-on-primary sm:flex">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-on-primary/15">${icon("health_and_safety", { size: 24, filled: true })}</span>
              <div>
                <p class="text-[17px] font-bold leading-tight">ميعادي</p>
                <p class="text-[11px] opacity-80">المنصة الصحية الذكية</p>
              </div>
            </div>
            <p class="mt-9 text-[21px] font-bold leading-snug">صحتك تبدأ بموعد.</p>
            <p class="mt-2 max-w-[24ch] text-[13px] leading-6 opacity-85">اختر طبيبك، احجز موعدك، وتابعه من مكان واحد.</p>
            <ul class="mt-8 flex flex-col gap-3.5 text-[13px]">
              <li class="flex items-center gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-on-primary/15">${icon("calendar_month", { size: 18 })}</span>احجز موعدك في دقائق</li>
              <li class="flex items-center gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-on-primary/15">${icon("local_hospital", { size: 18 })}</span>اختر الطبيب والمستشفى المناسبين</li>
              <li class="flex items-center gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-on-primary/15">${icon("event_available", { size: 18 })}</span>تابع حجوزاتك أينما كنت</li>
            </ul>
          </div>
          <div class="mt-10 flex items-center gap-2 text-[11px] opacity-70">
            <span>ميعادي</span><span aria-hidden="true">•</span><span>المنصة الصحية الذكية</span>
          </div>
        </aside>

        <div class="flex flex-col p-6 sm:p-8">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5 sm:hidden">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary">${icon("health_and_safety", { size: 20, filled: true })}</span>
              <div class="min-w-0">
                <p class="text-[15px] font-bold leading-tight text-on-surface">ميعادي</p>
                <p class="text-[11px] text-on-surface-variant">المنصة الصحية الذكية</p>
              </div>
            </div>
            <span class="hidden text-[12px] font-medium text-on-surface-variant sm:block">مرحباً بك في ميعادي</span>
            <button data-close class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low" aria-label="إغلاق">${icon("close", { size: 20 })}</button>
          </div>

          <h2 id="auth-title" class="mt-6 text-[22px] font-bold leading-tight text-on-surface">تسجيل الدخول</h2>
          <p id="auth-subtitle" class="mt-1 text-[13px] text-on-surface-variant">سجّل الدخول لمتابعة حجزك والوصول إلى بياناتك.</p>

          <div class="relative mt-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-container p-1 text-[13px] font-semibold" role="tablist" aria-label="طريقة الدخول">
            <span data-indicator class="absolute bottom-1 top-1 rounded-lg border border-line bg-surface-container-lowest shadow-sm transition-[right,width,left] duration-200 ease-out" style="width: calc(50% - 0.375rem); right: 0.25rem"></span>
            <button data-tab="login" role="tab" aria-selected="true" class="relative z-10 h-9 rounded-lg transition-colors">دخول</button>
            <button data-tab="register" role="tab" aria-selected="false" class="relative z-10 h-9 rounded-lg transition-colors">حساب جديد</button>
          </div>

          <div id="auth-error" class="mb-4 hidden items-start gap-2 rounded-lg border border-error/30 bg-error-container px-3 py-2.5 text-[13px] font-medium text-on-error-container"></div>

          <form id="login-form" class="flex flex-col gap-3" novalidate>
            ${inputShell({ id: "login-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
            ${inputShell({ id: "login-password", type: "password", placeholder: "كلمة المرور", iconName: "lock", withToggle: true, extra: 'autocomplete="current-password"' })}
            <button type="submit" data-submit class="press mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70">
              <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>تسجيل الدخول</span>
            </button>
          </form>

          <form id="register-form" class="hidden flex-col gap-3" novalidate>
            ${inputShell({ id: "reg-name", type: "text", placeholder: "الاسم الكامل", iconName: "person", extra: 'autocomplete="name"' })}
            ${inputShell({ id: "reg-phone", type: "tel", placeholder: "رقم الهاتف — 249+", iconName: "phone", ltr: true, extra: 'inputmode="tel" autocomplete="tel"' })}
            ${inputShell({ id: "reg-email", type: "email", placeholder: "البريد الإلكتروني", iconName: "mail", ltr: true, extra: 'autocomplete="email"' })}
            ${inputShell({ id: "reg-password", type: "password", placeholder: "كلمة المرور", iconName: "lock", withToggle: true, extra: 'minlength="6" autocomplete="new-password"' })}
            <p class="-mt-1 text-[11px] text-on-surface-variant">6 أحرف على الأقل.</p>
            <button type="submit" data-submit class="press mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70">
              <span data-spin class="hidden">${icon("progress_activity", { size: 18 })}</span><span data-label>إنشاء حساب</span>
            </button>
          </form>

          <p class="mt-5 text-center text-[11px] leading-5 text-on-surface-variant">بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
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
  const titleEl = container.querySelector("#auth-title") as HTMLElement;

  const showErr = (e: unknown) => {
    errEl.innerHTML = `${icon("error", { size: 18, filled: true })}<span>${escapeHtml(translateAuthError(e))}</span>`;
    errEl.classList.remove("hidden");
    errEl.classList.remove("auth-shake");
    void errEl.offsetWidth;
    errEl.classList.add("auth-shake");
  };
  const clearErr = () => { errEl.classList.add("hidden"); errEl.classList.remove("auth-shake"); };

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
    titleEl.textContent = tab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد";
    subtitle.textContent = tab === "login" ? "سجّل الدخول لمتابعة حجزك والوصول إلى بياناتك." : "أنشئ حسابك في دقيقة واحدة.";
    const active = tab === "login" ? forms.login : forms.register;
    active.classList.remove("rise-in");
    void active.offsetWidth;
    active.classList.add("rise-in");
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
