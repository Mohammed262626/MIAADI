import { escapeHtml } from "../lib/format";
import { icon } from "../components/icons";
import { avatar } from "../components/ui";
import { showToast } from "../components/Toast";

type User = { email?: string; profile?: { full_name: string; phone: string; role: string } } | null;

export function renderProfileView(
  root: HTMLElement,
  opts: {
    user: User;
    canAdmin: boolean;
    onSave: (p: { fullName: string; phone: string }) => Promise<void>;
    onLogout: () => void;
    onOpenAuth: () => void;
    onAdmin: () => void;
  }
) {
  const { user } = opts;

  if (!user) {
    root.innerHTML = `<div class="px-4 pt-3">
      <div class="panel p-6 text-center space-y-4">
        <span class="mx-auto w-16 h-16 rounded-3xl bg-primary-container/15 text-primary grid place-items-center">${icon("person", { size: 30 })}</span>
        <div>
          <h1 class="text-[20px] font-extrabold tracking-tight">مرحباً بك في ميعادي</h1>
          <p class="text-sm text-on-surface-variant mt-1">سجّل الدخول للوصول إلى ملفك ومواعيدك.</p>
        </div>
        <button data-open-auth class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold">تسجيل الدخول / إنشاء حساب</button>
        <p class="text-[11px] text-on-surface-variant inline-flex items-center gap-1 justify-center">${icon("lock", { size: 13 })}بياناتك محمية بتشفير Supabase</p>
      </div>
    </div>`;
    root.querySelector("[data-open-auth]")?.addEventListener("click", () => opts.onOpenAuth());
    return;
  }

  const p = user.profile || ({} as NonNullable<User>["profile"]);
  const roleLabel = p?.role === "admin" ? "مشرف" : p?.role === "doctor" ? "طبيب" : "مريض";

  const settingRow = (iconName: string, title: string, sub: string, right: string) => `
    <div class="flex items-center gap-3 py-3">
      <span class="w-10 h-10 rounded-2xl bg-surface-container-low text-primary grid place-items-center shrink-0">${icon(iconName, { size: 20 })}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold">${escapeHtml(title)}</p>
        <p class="text-[11px] text-on-surface-variant">${escapeHtml(sub)}</p>
      </div>
      ${right}
    </div>`;

  const toggle = (id: string, on: boolean) =>
    `<button data-toggle="${id}" aria-pressed="${on}" class="relative w-12 h-7 rounded-full transition-colors ${on ? "bg-primary" : "bg-surface-container-high"}">
      <span data-knob class="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all" style="${on ? "inset-inline-start:26px" : "inset-inline-start:4px"}"></span>
    </button>`;

  root.innerHTML = `
  <div class="space-y-4 px-4 pt-3">
    <section class="panel p-5 flex items-center gap-4">
      ${avatar(p?.full_name || "م", "lg")}
      <div class="flex-1 min-w-0">
        <h1 class="text-[19px] font-extrabold tracking-tight truncate">${escapeHtml(p?.full_name || "مستخدم")}</h1>
        <p class="text-[12px] text-on-surface-variant truncate" dir="ltr">${escapeHtml(user.email || "")}</p>
        <span class="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-primary-container/15 text-primary text-[11px] font-bold">${icon("badge", { size: 14 })}${roleLabel}</span>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-extrabold text-[16px] px-1">الملف الشخصي</h2>
      <div class="panel p-4 space-y-3">
        <label class="block">
          <span class="text-xs font-bold text-on-surface-variant">الاسم الكامل</span>
          <input id="pf-name" type="text" value="${escapeHtml(p?.full_name || "")}" class="mt-1.5 w-full h-12 px-4 rounded-2xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm" />
        </label>
        <label class="block">
          <span class="text-xs font-bold text-on-surface-variant">رقم الهاتف</span>
          <input id="pf-phone" type="tel" dir="ltr" value="${escapeHtml(p?.phone || "")}" placeholder="05xxxxxxxx" class="mt-1.5 w-full h-12 px-4 rounded-2xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm text-left" />
        </label>
        <button id="pf-save" class="w-full h-12 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors">حفظ التغييرات</button>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-extrabold text-[16px] px-1">التفضيلات</h2>
      <div class="panel px-4 divide-y divide-outline-variant/50">
        <div class="flex items-center gap-3 py-3">
          <span class="w-10 h-10 rounded-2xl bg-surface-container-low text-primary grid place-items-center shrink-0">${icon("language", { size: 20 })}</span>
          <div class="flex-1">
            <p class="text-sm font-bold">اللغة</p>
            <p class="text-[11px] text-on-surface-variant">لغة واجهة التطبيق</p>
          </div>
          <div class="flex gap-1 p-1 rounded-full bg-surface-container-low text-xs font-bold">
            <span class="h-8 px-3 grid place-items-center rounded-full bg-surface-container-lowest text-primary shadow-sm">العربية</span>
            <span class="h-8 px-3 grid place-items-center rounded-full text-on-surface-variant/60 cursor-not-allowed" aria-disabled="true" title="English — قريباً">EN</span>
          </div>
        </div>
        ${settingRow("notifications", "الإشعارات", "تذكير بالمواعيد", toggle("notif", true))}
        ${settingRow("dark_mode", "المظهر الداكن", "قريباً", `<span class="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">قريباً</span>`)}
      </div>
    </section>

    ${
      opts.canAdmin
        ? `<section class="space-y-3">
            <h2 class="font-extrabold text-[16px] px-1">الإدارة</h2>
            <button data-admin class="panel w-full p-4 flex items-center gap-3 text-start hover:shadow-[0_16px_40px_-20px_rgba(16,24,40,.25)] transition-shadow">
              <span class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center shrink-0">${icon("admin_panel_settings", { size: 20, filled: true })}</span>
              <span class="flex-1">
                <span class="block text-sm font-bold">لوحة الإدارة</span>
                <span class="block text-[11px] text-on-surface-variant">الحجوزات، الأطباء، والحسابات</span>
              </span>
              ${icon("chevron_left", { size: 20, className: "text-on-surface-variant" })}
            </button>
          </section>`
        : ""
    }

    <section class="space-y-3">
      <h2 class="font-extrabold text-[16px] px-1">الدعم</h2>
      <div class="panel px-4 divide-y divide-outline-variant/50">
        ${settingRow("help", "مركز المساعدة", "أسئلة شائعة وطرق التواصل", icon("chevron_left", { size: 20, className: "text-on-surface-variant" }))}
        ${settingRow("privacy_tip", "الخصوصية والشروط", "سياسة الاستخدام والبيانات", icon("chevron_left", { size: 20, className: "text-on-surface-variant" }))}
      </div>
    </section>

    <button data-logout class="w-full h-12 rounded-2xl bg-error-container text-on-error-container font-bold text-sm inline-flex items-center justify-center gap-2">${icon("logout", { size: 18 })}تسجيل الخروج</button>
    <p class="text-center text-[11px] text-on-surface-variant pb-2">ميعادي · الإصدار 1.0</p>
  </div>`;

  root.querySelector("[data-open-auth]")?.addEventListener("click", () => opts.onOpenAuth());
  (root.querySelector("#pf-save") as HTMLButtonElement).addEventListener("click", async () => {
    const fullName = (root.querySelector("#pf-name") as HTMLInputElement).value.trim();
    const phone = (root.querySelector("#pf-phone") as HTMLInputElement).value.trim();
    if (!fullName) {
      showToast("أدخل الاسم الكامل", "warning");
      return;
    }
    try {
      await opts.onSave({ fullName, phone });
      showToast("تم حفظ الملف", "success");
    } catch {
      /* error surfaced by caller */
    }
  });
  root.querySelector("[data-admin]")?.addEventListener("click", () => opts.onAdmin());
  root.querySelector("[data-logout]")?.addEventListener("click", () => opts.onLogout());
  root.querySelectorAll<HTMLButtonElement>("[data-toggle]").forEach((b) =>
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      b.className = `relative w-12 h-7 rounded-full transition-colors ${on ? "bg-primary" : "bg-surface-container-high"}`;
      const knob = b.querySelector("[data-knob]") as HTMLElement;
      knob.style.insetInlineStart = on ? "26px" : "4px";
      showToast(on ? "تم تفعيل الإشعارات" : "تم إيقاف الإشعارات", "info");
    })
  );
}
