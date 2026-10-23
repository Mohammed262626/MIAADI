# Admin account management — Edge Function

The «الحسابات والأدوار» tab does full CRUD over Supabase Auth users. Reading and
role changes use SQL RPCs that already exist (`admin_list_profiles`,
`admin_set_role`), but **create / delete / password reset need the Auth Admin
API**, so they run in one Edge Function: `admin-users`.

```
supabase/functions/admin-users/index.ts
```

| action     | who can call | what it does |
|------------|--------------|--------------|
| `create`   | admin only   | `auth.admin.createUser` (email confirmed) → sets `profiles.full_name / phone / role` |
| `update`   | admin only   | updates `profiles.full_name / phone` (auth metadata kept in sync) |
| `password` | admin only   | `auth.admin.updateUserById({ password })` |
| `delete`   | admin only   | deletes the auth user; guards self-delete and last-admin |

Security notes:

- The service-role key is read from `Deno.env` inside the function; it never
  reaches the browser.
- The caller is identified from their own JWT (`auth.getUser()`), then their
  `profiles.role` is checked — a client-sent user id is never trusted.
- The function returns stable error codes (`email_taken`, `weak_password`,
  `self_delete`, `last_admin`, …) that the UI translates to Arabic.

## Deploy

The function must be deployed once per project. With the Supabase CLI:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase functions deploy admin-users
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected
by the Supabase runtime — no extra secrets are needed.

Without the CLI: create a function named `admin-users` in the dashboard (Edge
Functions → Deploy a new function), paste `index.ts`, and deploy.

Until it is deployed, create/delete/password actions fail with a toast saying
the service isn't published yet; the list, search, filters and inline role
changes keep working through the existing RPCs, and the edit dialog shows the
same "not published" toast when saving.

## Data effects worth knowing

- `profiles.id → auth.users(id) ON DELETE CASCADE` — deleting an account removes
  its profile row.
- `doctors.user_id → auth.users(id) ON DELETE SET NULL` — deleting a **doctor
  account** keeps the doctor row, calendar and appointments; only the link to
  the login is cleared.
- `appointments.patient_id → auth.users(id) ON DELETE CASCADE` — deleting a
  **patient account** removes that patient's appointments. The delete dialog
  warns about this before confirming.
