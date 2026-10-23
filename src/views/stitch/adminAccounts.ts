// Admin accounts tab (#admin → الحسابات والأدوار).
//
// Full account management over Supabase Auth users:
//   create  → `admin-users` Edge Function (service-role, email + password)
//   update  → name/phone (Edge Function), role (admin_set_role RPC)
//   delete  → `admin-users` Edge Function (cascades the profile row)
//   read    → admin_list_profiles RPC
//
// The module owns the table, filters and dialogs; every write goes through
// hooks so the DB/function logic stays in one place in app.ts.
import { escapeHtml } from "../../lib/format";
import { initials } from "../../components/ui";
import { showToast } from "../../components/Toast";
import { confirmSheet } from "../../components/ConfirmDialog";
import { accountsSkeletonHtml } from "./adminSkeletons";

export type AdminAccount = { user_id: string; full_name: string; email: string; phone: string; role: string };

export type AdminAccountsHooks = {
  /** The signed-in admin — cannot delete or demote themselves. */
  meId: string;
  /** Fixture preview: render the UI but block every write. */
  readOnly?: boolean;
  load: () => Promise<AdminAccount[]>;
  create: (input: { email: string; password: string; fullName: string; phone: string; role: string }) => Promise<void>;
  update: (account: AdminAccount, patch: { fullName: string; phone: string }) => Promise<void>;
  setRole: (account: AdminAccount, role: string) => Promise<void>;
  resetPassword: (account: AdminAccount, password: string) => Promise<void>;
  /** Confirms + deletes; resolves true when the account is gone. */
  remove: (account: AdminAccount) => Promise<boolean>;
};

const PAGE_SIZE = 25;
const MIN_PASSWORD = 8;

const ROLE_META: Record<string, { label: string; icon: string; cls: string }> = {
  admin: { label: "مشرف", icon: "shield_person", cls: "bg-inverse-surface text-inverse-on-surface" },
  doctor: { label: "طبيب", icon: "stethoscope", cls: "bg-primary/10 text-primary" },
  patient: { label: "مريض", icon: "person", cls: "bg-surface-container-high text-on-surface-variant" },
};

const ERROR_TEXT: Record<string, string> = {
  email_taken: "هذا البريد مسجّل في حساب آخر",
  weak_password: `كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف على الأقل`,
  invalid_email: "صيغة البريد الإلكتروني غير صحيحة",
  invalid_name: "اكتب اسم الحساب",
  invalid_role: "دور غير معروف",
  self_delete: "لا يمكنك حذف حسابك الحالي",
  last_admin: "لا يمكن حذف آخر مشرف في المنصة",
  forbidden: "هذا الحساب لا يملك صلاحية الإدارة",
  unauthorized: "انتهت الجلسة — سجّل الدخول من جديد",
  not_found: "الحساب غير موجود",
  not_configured: "خدمة إدارة الحسابات غير مهيأة على الخادم",
  unknown_action: "طلب غير معروف لخدمة الحسابات",
};

function friendly(e: unknown): string {
  const raw = String((e as { message?: string })?.message || "").trim();
  if (ERROR_TEXT[raw]) return ERROR_TEXT[raw];
  if (/failed to send a request|failed to fetch|networkerror|load failed/i.test(raw)) {
    return "خدمة إدارة الحسابات (admin-users) غير منشورة بعد";
  }
  return raw || "تعذّر تنفيذ العملية";
}

const CONTROL = "h-9 rounded-lg border border-line bg-surface-container-lowest text-[13px] text-on-surface outline-none transition-colors focus:border-primary";
const roleOf = (role: string) => ROLE_META[role] || ROLE_META.patient;

export async function renderAdminAccountsTab(host: HTMLElement, hooks: AdminAccountsHooks): Promise<void> {
  // Accounts skeleton stays up until the RPC returns — same shape as the table
  // it becomes, so the panel does not collapse into a spinner in between.
  host.innerHTML = accountsSkeletonHtml();

  let accounts: AdminAccount[] = [];
  try {
    accounts = await hooks.load();
  } catch (e) {
    host.innerHTML = `<div class="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-container-lowest p-8 text-center">
      <span class="material-symbols-outlined text-[36px] text-error" aria-hidden="true">cloud_off</span>
      <p class="text-[14px] font-semibold text-on-surface">تعذّر تحميل الحسابات</p>
      <p class="text-[12px] text-on-surface-variant">${escapeHtml(friendly(e))}</p>
    </div>`;
    return;
  }

  const ro = !!hooks.readOnly;
  let search = "";
  let roleFilter = "all";
  let page = 0;

  host.innerHTML = `
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 flex items-center gap-2 text-[12px] text-on-surface-variant">
            <span>بوابة الإدارة</span><span aria-hidden="true">/</span><span class="font-semibold text-primary">الحسابات والأدوار</span>
          </div>
          <h1 class="text-[22px] font-bold tracking-tight text-on-surface">الحسابات والأدوار</h1>
          <p class="mt-0.5 text-[13px] text-on-surface-variant">إنشاء الحسابات وتعديل بياناتها وأدوارها — وحذف ما لم يعد مطلوباً.</p>
        </div>
        <div class="flex items-center gap-2">
          ${ro ? `<span class="rounded-lg bg-surface-container px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant">وضع المعاينة — للقراءة فقط</span>` : ""}
          <button type="button" data-add ${ro ? "disabled" : ""} class="press flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-bold text-on-primary transition-colors hover:bg-teal-hover disabled:opacity-40">
            <span class="material-symbols-outlined text-[19px]" aria-hidden="true">person_add</span>إضافة حساب
          </button>
        </div>
      </div>

      <div id="adm-acc-stats" class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"></div>

      <section class="overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
        <div class="flex flex-col gap-2 border-b border-line p-3 lg:flex-row lg:items-center">
          <div class="relative min-w-0 flex-1">
            <span class="material-symbols-outlined pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
            <input id="adm-acc-search" type="search" autocomplete="off" placeholder="ابحث بالاسم أو البريد أو الهاتف…"
              class="${CONTROL} w-full ps-9 pe-2.5" aria-label="بحث في الحسابات" />
          </div>
          <button type="button" data-reset class="press flex h-9 items-center gap-1 self-start rounded-lg px-2.5 text-[12px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:self-auto">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>مسح
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
          <button type="button" data-role="all" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <button type="button" data-role="admin" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <button type="button" data-role="doctor" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <button type="button" data-role="patient" class="press rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"></button>
          <span id="adm-acc-count" class="ms-auto text-[12px] tabular-nums text-on-surface-variant"></span>
        </div>

        <div id="adm-acc-rows"></div>
        <div id="adm-acc-pager"></div>
      </section>
    </div>`;

  const el = <T extends HTMLElement>(sel: string) => host.querySelector(sel) as T;
  const rowsEl = el<HTMLDivElement>("#adm-acc-rows");
  const pagerEl = el<HTMLDivElement>("#adm-acc-pager");
  const statsEl = el<HTMLDivElement>("#adm-acc-stats");
  const countEl = el<HTMLSpanElement>("#adm-acc-count");
  const searchEl = el<HTMLInputElement>("#adm-acc-search");
  const chips = [...host.querySelectorAll<HTMLButtonElement>("[data-role]")];

  const isSelf = (a: AdminAccount) => a.user_id === hooks.meId;

  const rolePill = (a: AdminAccount) => {
    const meta = roleOf(a.role);
    return `<span class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${meta.cls}">
      <span class="material-symbols-outlined text-[13px]" aria-hidden="true">${meta.icon}</span>${escapeHtml(meta.label)}
    </span>`;
  };

  const roleSelect = (a: AdminAccount) => {
    const self = isSelf(a);
    return `<select data-role-for="${escapeHtml(a.user_id)}" ${ro || self ? "disabled" : ""} title="${self ? "لا يمكنك تغيير دورك" : "تغيير الدور"}" aria-label="دور ${escapeHtml(a.full_name || a.email)}"
      class="h-8 rounded-lg border border-line bg-surface px-1.5 text-[12px] text-on-surface disabled:opacity-50">
      ${["patient", "doctor", "admin"].map((r) => `<option value="${r}"${a.role === r ? " selected" : ""}>${escapeHtml(roleOf(r).label)}</option>`).join("")}
    </select>`;
  };

  const actions = (a: AdminAccount) => {
    const self = isSelf(a);
    return `<div class="flex items-center justify-end gap-1">
      ${roleSelect(a)}
      <button type="button" data-edit="${escapeHtml(a.user_id)}" ${ro ? "disabled" : ""} title="تعديل البيانات" aria-label="تعديل ${escapeHtml(a.full_name || a.email)}"
        class="press flex h-8 items-center rounded-lg border border-line px-2 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40">تعديل</button>
      <button type="button" data-del="${escapeHtml(a.user_id)}" ${ro || self ? "disabled" : ""} title="${self ? "لا يمكنك حذف حسابك" : "حذف الحساب"}" aria-label="حذف ${escapeHtml(a.full_name || a.email)}"
        class="press flex h-8 items-center rounded-lg px-2 text-[12px] font-bold text-error transition-colors hover:bg-error-container/40 disabled:opacity-30 disabled:hover:bg-transparent">حذف</button>
    </div>`;
  };

  const tableRow = (a: AdminAccount) => `<tr data-row class="border-t border-line/70 transition-colors hover:bg-surface-container-low/60">
    <td class="px-3 py-2">
      <div class="flex items-center gap-2.5">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">${escapeHtml(initials(a.full_name || a.email || "؟"))}</span>
        <div class="min-w-0">
          <p class="flex items-center gap-1 truncate text-[13px] font-semibold text-on-surface">
            <span class="truncate">${escapeHtml(a.full_name || "—")}</span>
            ${isSelf(a) ? `<span class="rounded bg-surface-container px-1 text-[10px] font-semibold text-on-surface-variant">أنت</span>` : ""}
          </p>
          <p class="truncate text-[11px] text-on-surface-variant" dir="ltr">${escapeHtml(a.email || "")}</p>
        </div>
      </div>
    </td>
    <td class="px-3 py-2 text-[12px] text-on-surface-variant"><span dir="ltr" class="tabular-nums">${escapeHtml(a.phone || "—")}</span></td>
    <td class="px-3 py-2">${rolePill(a)}</td>
    <td class="px-3 py-2">${actions(a)}</td>
  </tr>`;

  const card = (a: AdminAccount) => `<div data-row class="border-t border-line/70 p-3">
    <div class="flex items-start gap-2.5">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">${escapeHtml(initials(a.full_name || a.email || "؟"))}</span>
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-1 text-[13px] font-semibold text-on-surface">
          <span class="truncate">${escapeHtml(a.full_name || "—")}</span>
          ${isSelf(a) ? `<span class="rounded bg-surface-container px-1 text-[10px] font-semibold text-on-surface-variant">أنت</span>` : ""}
        </p>
        <p class="truncate text-[11px] text-on-surface-variant" dir="ltr">${escapeHtml(a.email || "")}</p>
        <p class="mt-0.5 text-[11px] tabular-nums text-on-surface-variant" dir="ltr">${escapeHtml(a.phone || "—")}</p>
      </div>
      ${rolePill(a)}
    </div>
    <div class="mt-2 flex items-center justify-end">${actions(a)}</div>
  </div>`;

  const paint = (animateRows = true) => {
    const q = search.trim().toLowerCase();
    const list = accounts.filter((a) => {
      if (roleFilter !== "all" && a.role !== roleFilter) return false;
      if (!q) return true;
      return [a.full_name, a.email, a.phone].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > pageCount - 1) page = pageCount - 1;
    if (page < 0) page = 0;
    const start = page * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    const counts = {
      all: accounts.length,
      admin: accounts.filter((a) => a.role === "admin").length,
      doctor: accounts.filter((a) => a.role === "doctor").length,
      patient: accounts.filter((a) => a.role === "patient").length,
    };
    const stat = (label: string, value: number) => `<div class="bg-surface-container-lowest px-3 py-2.5">
      <p class="text-[11px] text-on-surface-variant">${escapeHtml(label)}</p>
      <p class="mt-0.5 text-[18px] font-semibold leading-none tabular-nums text-on-surface">${value}</p>
    </div>`;
    statsEl.innerHTML = [
      stat("إجمالي الحسابات", counts.all),
      stat("مشرفون", counts.admin),
      stat("أطباء", counts.doctor),
      stat("مرضى", counts.patient),
    ].join("");

    const chipLabel: Record<string, string> = { all: "الكل", admin: "مشرف", doctor: "طبيب", patient: "مريض" };
    chips.forEach((c) => {
      const value = c.dataset.role || "all";
      const on = value === roleFilter;
      c.textContent = `${chipLabel[value]} · ${counts[value as keyof typeof counts]}`;
      c.classList.toggle("border-primary", on);
      c.classList.toggle("bg-primary", on);
      c.classList.toggle("text-on-primary", on);
      c.classList.toggle("border-line", !on);
      c.classList.toggle("bg-surface-container-lowest", !on);
      c.classList.toggle("text-on-surface-variant", !on);
      c.classList.toggle("hover:bg-surface-container", !on);
      c.setAttribute("aria-pressed", String(on));
    });

    countEl.textContent = list.length === accounts.length ? `${accounts.length} حساب` : `${list.length} من ${accounts.length}`;

    if (!list.length) {
      const noAccounts = !accounts.length;
      rowsEl.innerHTML = `<div class="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
        <span class="material-symbols-outlined text-[30px] text-on-surface-variant/70" aria-hidden="true">person_search</span>
        <p class="text-[14px] font-semibold text-on-surface">${noAccounts ? "لا توجد حسابات بعد" : "لا حساب يطابق الفلاتر"}</p>
        <p class="text-[12px] text-on-surface-variant">${noAccounts ? "ابدأ بإضافة أول حساب من الزر أعلاه." : "جرّب مسح البحث أو اختيار «الكل»."}</p>
        <button type="button" data-reset class="press mt-1 h-9 rounded-lg border border-line px-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">مسح الفلاتر</button>
      </div>`;
      pagerEl.innerHTML = "";
      bindReset();
      return;
    }

    rowsEl.innerHTML = `
      <div class="max-sm:hidden overflow-x-auto">
        <table class="w-full text-start">
          <thead class="bg-surface-container-low text-[11px] text-on-surface-variant">
            <tr>
              <th class="px-3 py-2 text-start font-semibold">الحساب</th>
              <th class="px-3 py-2 text-start font-semibold">الهاتف</th>
              <th class="px-3 py-2 text-start font-semibold">الدور</th>
              <th class="px-3 py-2 text-end font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>${slice.map(tableRow).join("")}</tbody>
        </table>
      </div>
      <div class="sm:hidden">${slice.map(card).join("")}</div>`;

    // Group entrance for the visible page only. Search keystrokes call
    // paint(false): rows must not animate while the user types.
    if (animateRows) {
      rowsEl.querySelectorAll<HTMLElement>("[data-row]").forEach((el, i) => {
        el.classList.add("rise-in");
        el.style.animationDelay = `${Math.min(i, 9) * 30}ms`;
      });
    }

    const to = Math.min(list.length, start + slice.length);
    pagerEl.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2 text-[12px] text-on-surface-variant">
      <span class="tabular-nums">عرض ${start + 1}–${to} من ${list.length}</span>
      <div class="flex items-center gap-1">
        <button type="button" data-page="-1" ${page === 0 ? "disabled" : ""} class="press flex h-8 items-center rounded-lg border border-line px-2.5 font-semibold transition-colors enabled:hover:bg-surface-container disabled:opacity-40">السابق</button>
        <span class="px-1.5 tabular-nums">${page + 1} / ${pageCount}</span>
        <button type="button" data-page="1" ${page >= pageCount - 1 ? "disabled" : ""} class="press flex h-8 items-center rounded-lg border border-line px-2.5 font-semibold transition-colors enabled:hover:bg-surface-container disabled:opacity-40">التالي</button>
      </div>
    </div>`;

    bindRows();
    bindReset();
    pagerEl.querySelectorAll<HTMLButtonElement>("[data-page]").forEach((b) => b.addEventListener("click", () => {
      page = Math.max(0, Math.min(pageCount - 1, page + Number(b.dataset.page)));
      paint();
    }));
  };

  const refresh = async () => {
    try { accounts = await hooks.load(); } catch { /* keep the last good list */ }
    paint();
  };

  /* ---------------------------- create / edit dialog --------------------------- */

  function openAccountDialog(account: AdminAccount | null) {
    document.getElementById("account-dialog")?.remove();
    const dlg = document.createElement("dialog");
    dlg.id = "account-dialog";
    dlg.className = "p-0 bg-transparent backdrop:bg-inverse-surface/50 backdrop:backdrop-blur-sm open:grid place-items-center min-h-dvh w-full max-w-none";
    dlg.innerHTML = `
      <div class="modal-enter mx-4 w-full max-w-[480px] rounded-xl bg-surface-container-lowest p-5 shadow-[0_24px_60px_-20px_rgba(16,24,40,.4)] sm:p-6">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><span class="material-symbols-outlined text-[22px]" aria-hidden="true">${account ? "person" : "person_add"}</span></span>
          <div class="min-w-0">
            <h3 class="text-[16px] font-bold text-on-surface">${account ? "تعديل الحساب" : "إضافة حساب"}</h3>
            <p class="mt-0.5 text-[12px] text-on-surface-variant">${account ? "الاسم والهاتف وكلمة المرور." : "سيستطيع صاحب الحساب الدخول بالبريد وكلمة المرور."}</p>
          </div>
        </div>
        <form id="account-form" class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">الاسم الكامل
            <input id="acc-name" required value="${escapeHtml(account?.full_name || "")}" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">البريد الإلكتروني
            <input id="acc-email" dir="ltr" type="email" required value="${escapeHtml(account?.email || "")}" ${account ? "disabled" : ""} placeholder="name@example.com" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-start text-[13px] text-on-surface outline-none focus:border-primary disabled:opacity-60" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">الهاتف
            <input id="acc-phone" dir="ltr" value="${escapeHtml(account?.phone || "")}" placeholder="09xxxxxxxx" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-start text-[13px] tabular-nums text-on-surface outline-none focus:border-primary" />
          </label>
          <label class="block text-[12px] text-on-surface-variant">الدور
            <select id="acc-role" ${account ? "disabled" : ""} class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2 text-start text-[13px] text-on-surface disabled:opacity-60">
              ${["patient", "doctor", "admin"].map((r) => `<option value="${r}"${(account?.role || "patient") === r ? " selected" : ""}>${escapeHtml(roleOf(r).label)}</option>`).join("")}
            </select>
          </label>
          <label class="block text-[12px] text-on-surface-variant sm:col-span-2">${account ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
            <input id="acc-pass" type="password" autocomplete="new-password" ${account ? "" : "required"} placeholder="${account ? "اتركها فارغة للإبقاء على الحالية" : `‏${MIN_PASSWORD} أحرف على الأقل`}" class="mt-1 h-9 w-full rounded-lg border border-line bg-surface-container-lowest px-2.5 text-[13px] text-on-surface outline-none focus:border-primary" />
          </label>
          ${account ? `<p class="text-[11px] text-on-surface-variant sm:col-span-2">لتغيير الدور استخدم القائمة في صف الحساب — أو غيّر البريد من إعدادات المصادقة.</p>` : `<p class="text-[11px] text-on-surface-variant sm:col-span-2">حساب «طبيب» يُربط بملف الطبيب لاحقاً من تبويب إدارة الأطباء.</p>`}
          <div class="col-span-full flex gap-2 pt-1">
            <button type="button" data-close-acc class="press flex-1 rounded-lg border border-line py-2.5 text-[13px] font-semibold text-on-surface transition-colors hover:bg-surface-container">إلغاء</button>
            <button type="submit" class="press inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-bold text-on-primary transition-colors hover:bg-teal-hover disabled:opacity-50">${account ? "حفظ التعديلات" : "إنشاء الحساب"}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(dlg);
    dlg.showModal();

    const field = (sel: string) => dlg.querySelector(sel) as HTMLInputElement | HTMLSelectElement;
    const close = () => { dlg.close(); dlg.remove(); };
    dlg.querySelector("[data-close-acc]")?.addEventListener("click", close);
    dlg.addEventListener("close", () => dlg.remove());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });

    (dlg.querySelector("#account-form") as HTMLFormElement).addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = field("#acc-name").value.trim();
      const email = field("#acc-email").value.trim().toLowerCase();
      const phone = field("#acc-phone").value.trim();
      const role = field("#acc-role").value;
      const password = field("#acc-pass").value;

      if (fullName.length < 2) { showToast("اكتب اسم الحساب", "error"); return; }
      if (!account && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showToast("صيغة البريد الإلكتروني غير صحيحة", "error"); return; }
      if (!account && password.length < MIN_PASSWORD) { showToast(ERROR_TEXT.weak_password, "error"); return; }
      if (account && password && password.length < MIN_PASSWORD) { showToast(ERROR_TEXT.weak_password, "error"); return; }

      const submit = dlg.querySelector<HTMLButtonElement>('button[type="submit"]');
      const submitLabel = account ? "حفظ التعديلات" : "إنشاء الحساب";
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]" aria-hidden="true">progress_activity</span>جارٍ الحفظ…`;
      }
      try {
        if (account) {
          await hooks.update(account, { fullName, phone });
          if (password) await hooks.resetPassword(account, password);
          showToast(password ? "تم حفظ البيانات وتحديث كلمة المرور" : "تم حفظ البيانات", "success");
        } else {
          await hooks.create({ email, password, fullName, phone, role });
          showToast("تم إنشاء الحساب", "success");
        }
        close();
        await refresh();
      } catch (err) {
        showToast(friendly(err), "error");
        if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
      }
    });
  }

  /* ---------------------------------- wiring ---------------------------------- */

  function bindRows() {
    rowsEl.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((b) => b.addEventListener("click", () => {
      const account = accounts.find((a) => a.user_id === b.dataset.edit);
      if (account) openAccountDialog(account);
    }));

    rowsEl.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      const account = accounts.find((a) => a.user_id === b.dataset.del);
      if (!account) return;
      b.disabled = true;
      try {
        const removed = await hooks.remove(account);
        if (removed) await refresh();
        else b.disabled = false;
      } catch (e) {
        showToast(friendly(e), "error");
        b.disabled = false;
      }
    }));

    rowsEl.querySelectorAll<HTMLSelectElement>("[data-role-for]").forEach((sel) => sel.addEventListener("change", async () => {
      const account = accounts.find((a) => a.user_id === sel.dataset.roleFor);
      if (!account || sel.value === account.role) return;
      const next = sel.value;
      const prev = account.role;
      if (next === "admin" || prev === "admin") {
        const ok = await confirmSheet({
          title: "تغيير دور الحساب؟",
          body: `سيصبح ${account.full_name || account.email} «${roleOf(next).label}».`,
          confirmLabel: "تغيير الدور",
        });
        if (!ok) { sel.value = prev; return; }
      }
      sel.disabled = true;
      try {
        await hooks.setRole(account, next);
        showToast("تم تحديث الدور", "success");
        await refresh();
      } catch (e) {
        showToast(friendly(e), "error");
        sel.value = prev;
        sel.disabled = false;
      }
    }));
  }

  function bindReset() {
    host.querySelectorAll<HTMLButtonElement>("[data-reset]").forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => {
        search = "";
        roleFilter = "all";
        page = 0;
        searchEl.value = "";
        paint();
      });
    });
  }

  host.querySelector("[data-add]")?.addEventListener("click", () => {
    if (!ro) openAccountDialog(null);
  });
  searchEl.addEventListener("input", () => { search = searchEl.value; page = 0; paint(false); });
  chips.forEach((c) => c.addEventListener("click", () => {
    roleFilter = c.dataset.role || "all";
    page = 0;
    paint();
  }));

  paint();
}
