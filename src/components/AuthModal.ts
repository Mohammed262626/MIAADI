import { escapeHtml, translateAuthError } from "../lib/format";
import { showToast } from "./Toast";

export function mountAuthModal(container: HTMLElement, onLogin: (e:{email:string;password:string})=>Promise<void>, onRegister: (e:{email:string;password:string;fullName:string;phone:string})=>Promise<void>) {
  container.innerHTML = `
  <dialog id="auth-dialog" class="p-0 bg-transparent backdrop:bg-ink/60 open:grid place-items-center min-h-dvh w-full max-w-none">
    <div class="bg-paper rounded-2xl border border-line card w-full max-w-[440px] p-6 mx-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-lg">الدخول</h2>
        <button data-close class="w-8 h-8 grid place-items-center rounded-xl hover:bg-paper-soft" aria-label="إغلاق">×</button>
      </div>
      <div id="auth-error" class="hidden mb-3 px-3 py-2 rounded-xl bg-danger-soft border border-red-200 text-danger text-sm"></div>
      <div class="flex gap-2 mb-4 text-sm">
        <button data-tab="login" class="flex-1 py-2 rounded-xl bg-ink text-white font-semibold">دخول</button>
        <button data-tab="register" class="flex-1 py-2 rounded-xl border border-line">حساب جديد</button>
      </div>
      <form id="login-form" class="space-y-3">
        <input id="login-email" type="email" required placeholder="البريد" dir="ltr" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <input id="login-password" type="password" required placeholder="كلمة المرور" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <button type="submit" class="w-full py-2.5 rounded-xl bg-ink text-white font-semibold">دخول</button>
      </form>
      <form id="register-form" class="hidden space-y-3">
        <input id="reg-name" type="text" required placeholder="الاسم الكامل" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <input id="reg-phone" type="tel" required placeholder="رقم الهاتف" dir="ltr" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <input id="reg-email" type="email" required placeholder="البريد" dir="ltr" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <input id="reg-password" type="password" required placeholder="كلمة المرور (6+)" class="w-full px-3 py-2.5 rounded-xl border border-line bg-white outline-none focus:border-teal text-sm" />
        <button type="submit" class="w-full py-2.5 rounded-xl bg-ink text-white font-semibold">إنشاء حساب</button>
      </form>
    </div>
  </dialog>`;
  const dlg = container.querySelector("#auth-dialog") as HTMLDialogElement;
  const errEl = container.querySelector("#auth-error") as HTMLElement;
  const showErr = (e: unknown) => { errEl.textContent = escapeHtml(translateAuthError(e)); errEl.classList.remove("hidden"); };
  const clearErr = () => errEl.classList.add("hidden");
  container.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach(b => b.addEventListener("click", () => {
    const tab = b.dataset.tab;
    (container.querySelector("#login-form") as HTMLElement).classList.toggle("hidden", tab !== "login");
    (container.querySelector("#register-form") as HTMLElement).classList.toggle("hidden", tab !== "register");
    b.classList.toggle("bg-ink", true); b.classList.toggle("text-white", true);
    clearErr();
  }));
  // keep first button styled
  (container.querySelector('[data-tab="login"]') as HTMLElement).classList.add("bg-ink","text-white");
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
  return { open: () => dlg.showModal(), close: () => dlg.close(), element: dlg };
}
