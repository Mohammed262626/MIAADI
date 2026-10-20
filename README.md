# ميعادي — MIAADI

نظام حجز مواعيد طبية (عربي RTL) — Vite + TypeScript + Tailwind v4 + Supabase.

## التشغيل

```bash
npm install
cp .env.example .env   # ثم املأ المفاتيح من Supabase > Settings > API
npm run dev
```

## الأوامر

| command | purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build → `dist/` |
| `npm run preview` | serve `dist/` |
| `npm run typecheck` | `tsc --noEmit` only |

## النشر (Supabase Hosting)

انسخ محتويات `dist/` إلى استضافة Supabase الثابتة بعد كل `npm run build`.

## البنية

```
src/lib/supabase.ts    كل استدعاءات Supabase (auth + RPCs + جداول)
src/lib/config.ts      قراءة VITE_SUPABASE_* من .env فقط
src/lib/format.ts      تنسيق التاريخ/الوقت + escapeHtml + ترجمة الأخطاء
src/components/        Header, Toast, AuthModal
src/views/             doctors, appointments, admin
src/styles/tailwind.css رموز التصميم (@theme)
docs/backend-contract.md عقد الخادم المجمّد (RPCs + RLS)
scripts/schema.sql     مخطط قاعدة البيانات + سياسات RLS
```

## الأمان

- الحجوزات عبر RPC ذرّية فقط (`book_appointment`) — لا إدراج مباشر في `appointments`
- الدور يُفرض في الخادم (`handle_new_user` + `guard_profile_role`) — الواجهة تخفي فقط
- كل إدراج HTML مُهرَّب عبر `escapeHtml`
- المفاتيح من `.env` فقط (لا localStorage كـمصدر إعداد)
