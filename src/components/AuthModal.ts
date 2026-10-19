import { escapeHtml, translateAuthError } from "../lib/format";
import { showToast } from "./Toast";
import { icon } from "./icons";

export function mountAuthModal(
  container: HTMLElement,
  onLogin: (e: { email: string; password: string }) => Promise<void>,
  onRegister: (e: { email: string; password: string; fullName: string; phone: string }) => Promise<void>
) {
  const field = (id: string, type: string, placeholder: string, extra = "") =>
    `<input id="${id}" type="${type}" required placeholder="${placeholder}" ${extra} class="w-full h-12 px-4 rounded-2xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm transition-colors" />`;

  container.innerHTML = `
  <dialog id="auth-dialog" class="p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-end sm:place-items-center min-h-dvh w-full max-w-none">
    <div class="modal-enter bg-surface-container-lowest rounded-t-[28px] sm:rounded-[28px] shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] w-full sm:max-w-[440px] p-6 pb-[max(24px,env(safe-area-inset-bottom))]">
      <div class="flex items-center gap-3 mb-5">
        <span class="w-11 h-11 rounded-2xl bg-primary text-on-primary grid place-items-center">${icon("health_and_safety", { size: 22, filled: true })}</span>
        <div class="flex-1">
          <h2 class="font-extrabold text-lg tracking-tight leading-none">ميعادي</h2>
          <p class="text-xs text-on-surface-variant mt-1" id="auth-subtitle">سجّل الدخول لإتمام حجزك</p>
        </div>
        <button data-close class="w-9 h-9 grid place-items-center rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant" aria-label="إغلاق">${icon("close", { size: 20 })}</button>
      </div>

      <div id="auth-error" class="hidden mb-4 px-3.5 py-3 rounded-2xl bg-error-container text-on-error-container text-sm font-semibold flex items-start gap-2"></div>

      <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-container-low mb-5 text-sm font-bold">
        <button data-tab="login" class="h-10 rounded-xl">دخول</button>
        <button data-tab="register" class="h-10 rounded-xl">حساب جديد</button>
      </div>

      <form id="login-form" class="space-y-3">
        ${field("login-email", "email", "البريد الإلكتروني", 'dir="ltr"')}
        ${field("login-password", "password", "كلمة المرور")}
        <button type="submit" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors">تسجيل الدخول</button>
      </form>

      <form id="register-form" class="hidden space-y-3">
        ${field("reg-name", "text", "الاسم الكامل")}
        ${field("reg-phone", "tel", "رقم الهاتف", 'dir="ltr"')}
        ${field("reg-email", "email", "البريد الإلكتروني", 'dir="ltr"')}
        ${field("reg-password", "password", "كلمة المرور (6 أحرف+)")}
        <button type="submit" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors">إنشاء حساب</button>
      </form>
      <p class="mt-4 text-[11px] text-center text-on-surface-variant">بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
    </div>
  </dialog>`;

  const dlg = container.querySelector("#auth-dialog") as HTMLDialogElement;
  const errEl = container.querySelector("#auth-error") as HTMLElement;
  const tabs = container.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const forms = { login: container.querySelector("#login-form") as HTMLElement, register: container.querySelector("#register-form") as HTMLElement };

  const showErr = (e: unknown) => {
    errEl.innerHTML = `${icon("error", { size: 18, filled: true })}<span>${escapeHtml(translateAuthError(e))}</span>`;
    errEl.classList.remove("hidden");
  };
  const clearErr = () => errEl.classList.add("hidden");

  const setTab = (tab: string) => {
    forms.login.classList.toggle("hidden", tab !== "login");
    forms.register.classList.toggle("hidden", tab !== "register");
    tabs.forEach((b) => {
      const on = b.dataset.tab === tab;
      b.className = `h-10 rounded-xl transition-colors ${on ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`;
    });
    (container.querySelector("#auth-subtitle") as HTMLElement).textContent =
      tab === "login" ? "سجّل الدخول لإتمام حجزك" : "أنشئ حسابك في دقيقة واحدة";
    clearErr();
  };
  tabs.forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab!)));
  setTab("login");
  container.querySelector("[data-close]")?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  (container.querySelector("#login-form") as HTMLFormElement).addEventListener("submit", async (e) => {
    e.preventDefault(); clearErr();
    const email = (container.querySelector("#login-email") as HTMLInputElement).value.trim();
    const password = (container.querySelector("#login-password") as HTMLInputElement).value;
    try { await onLogin({ email, password }); dlg.close(); showToast("تم تسجيل الدخول", "success"); } catch (err) { showErr(err); }
  });
  (container.querySelector("#register-form") as HTMLFormElement).addEventListener("submit", async (e) => {
    e.preventDefault(); clearErr();
    const fullName = (container.querySelector("#reg-name") as HTMLInputElement).value.trim();
    const phone = (container.querySelector("#reg-phone") as HTMLInputElement).value.trim();
    const email = (container.querySelector("#reg-email") as HTMLInputElement).value.trim();
    const password = (container.querySelector("#reg-password") as HTMLInputElement).value;
    try { await onRegister({ email, password, fullName, phone }); dlg.close(); showToast("تم إنشاء الحساب — راجع بريدك إن طُلب التأكيد", "success"); } catch (err) { showErr(err); }
  });

  return { open: () => dlg.showModal(), close: () => dlg.close(), element: dlg, setTab };
}
