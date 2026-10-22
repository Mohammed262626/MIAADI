export function localDateISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

/* Search-friendly Arabic: unify the hamza/alef forms, ta marbuta and alef
   maqsura, and drop diacritics and tatweel. People type "احمد" for "أحمد"
   and "صيدليه" for "صيدلية"; matching both ways is what makes search feel
   right without touching the stored data. */
export function normalizeArabic(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064a")
    .replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064a");
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [h, m = "00"] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "م" : "ص";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

const AR = "ar-SA-u-nu-latn";

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(AR, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatWeekdayShort(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString(AR, { weekday: "short" });
}

export function formatDayNum(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString(AR, { day: "numeric" });
}

export function formatMonthShort(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString(AR, { month: "short" });
}

export function formatRelativeDay(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr === localDateISO(0)) return "اليوم";
  if (dateStr === localDateISO(1)) return "غداً";
  if (dateStr === localDateISO(2)) return "بعد غد";
  return formatArabicDate(dateStr);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "\x26amp;", "<": "\x26lt;", ">": "\x26gt;", '"': "\x26quot;", "'": "\x26#39;" } as Record<string, string>)[c]
  );
}

export function translateAuthError(err: unknown): string {
  if (!err) return "حدث خطأ غير متوقع";
  const e = err as { message?: string; error_description?: string; code?: string; error_code?: string };
  const msg = typeof err === "string" ? err : e.message || e.error_description || "";
  const code = e.code || e.error_code || "";
  if (msg.includes("Invalid login credentials") || code === "invalid_credentials") return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  if (msg.includes("Email not confirmed") || code === "email_not_confirmed") return "يرجى تأكيد بريدك الإلكتروني";
  if (msg.includes("User already registered") || msg.includes("already exists") || code === "user_already_exists") return "هذا البريد مسجل مسبقاً";
  if (msg.includes("Password should be at least")) return "كلمة المرور 6 أحرف على الأقل";
  if (msg.includes("over_email_send_rate_limit") || msg.includes("rate limit")) return "تم تجاوز حد الإرسال، حاول لاحقاً";
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) return "فشل الاتصال بالخادم";
  if (msg.includes("JWT expired") || code === "jwt_expired") return "انتهت الجلسة، سجّل الدخول مجدداً";
  if (msg.includes("slot is already booked") || msg.includes("already booked")) return "الموعد حُجز للتو من مريض آخر";
  if (msg.includes("Schedule slot not found")) return "الموعد غير موجود";
  return msg || "حدث خطأ أثناء معالجة الطلب";
}
