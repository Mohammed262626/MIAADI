# Backend Contract — Freeze 2026-10-13

Supabase project: `zneqnijqjwkpcjetgwfe` (url in `.env`)
Schema: `schema.sql` (791 lines) + `phase1_schema.sql` (`doctor_availability`, `doctor_unavailable`, `generate_schedule_from_availability`)
Auth: email/password, `handle_new_user` forces `role='patient'`, `guard_profile_role` blocks role escalation.

**RPCs (SECURITY DEFINER):**
- `book_appointment(p_schedule_id uuid, p_patient_name text, p_patient_phone text)` → appointment (FOR UPDATE lock)
- `cancel_appointment(p_appointment_id uuid)`
- `reschedule_appointment(p_appointment_id uuid, p_new_schedule_id uuid)`
- `cancel_appointment_clinic(p_appointment_id uuid)`
- `admin_update_appointment_state(p_appointment_id uuid, p_state text: completed|no_show)`
- `admin_set_role(p_user_id uuid, p_role text: patient|doctor|admin)`
- `admin_list_profiles()` → profiles with email
- `generate_schedule_from_availability(p_doctor_id uuid, p_start_date date, p_end_date date)`

**Tables / RLS:**
- `profiles` — owner | `is_admin()`
- `doctors` — public SELECT, admin CUD
- `doctor_schedules` — public SELECT, owner|admin INSERT/DELETE, no UPDATE
- `appointments` — no INSERT policy (via RPC), visible patient|doctor|admin
- `appointments_with_details` — `security_invoker=true`, `TO authenticated`
- Realtime: `doctor_schedules`, `appointments`

**Client wrappers** (`supabase-service.js`): `getDoctorsWithSchedules`, `getPatientAppointments`, `getAdminAppointments`, `getAdminStats`, `listDoctorSchedules`, `createDoctorSchedule`, `deleteDoctorSchedule`, `saveDoctor`, `deleteDoctor`, `listDoctors`, `findDoctorByUser` + availability: `blockDoctorDates`, `getDoctorAvailability`, `saveDoctorAvailability`, `getAvailableSlots`, `generateDoctorSchedule`.
