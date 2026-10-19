-- ============================================================
-- Cleanup: remove the demo/seed data created by the migrations
--   expand_doctors_directory_schema / seed_demo_data /
--   seed_doctor_accounts / seed_demo_vary_bookings
--
-- Run manually (NOT as a migration) when you want a clean slate.
-- It does NOT delete pre-existing accounts (m@m.com,
-- admin@myappo.local, muhasalahsuliman@gmail.com, ...).
-- NOTE: for the 500 Sudanese demo doctors/slots run instead
--       docs/cleanup_sudan_demo_data.sql
-- NOTE: hospitals b1000000-* and insurers c1000000-* were renamed to
--       Sudanese names (sudanize_hospitals / sudanize_insurance_companies)
--       but keep their stable IDs — deleting them is intentional here.
-- ============================================================

-- 0) impersonate an admin (satisfies guard_profile_role)
select set_config(
  'request.jwt.claims',
  json_build_object('sub','34643313-07c4-4840-b6f2-11e6a109eee4','role','authenticated')::text,
  false
);

-- 1) demo appointments + schedules
delete from public.appointments
where schedule_id in (
  select id from public.doctor_schedules
  where doctor_id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009'
);

delete from public.doctor_schedules
where doctor_id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009';

delete from public.doctor_availability
where doctor_id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009';

delete from public.doctor_unavailable
where doctor_id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009';

delete from public.doctor_insurances
where doctor_id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009';

delete from public.doctors
where id between 'd0000000-0000-0000-0000-000000000001' and 'd0000000-0000-0000-0000-000000000009';

delete from public.hospitals
where id between 'b1000000-0000-0000-0000-000000000001' and 'b1000000-0000-0000-0000-000000000008';

delete from public.insurance_companies
where id between 'c1000000-0000-0000-0000-000000000001' and 'c1000000-0000-0000-0000-000000000007';

-- 2) demo doctor auth accounts (profiles cascade via FK)
delete from auth.identities
where user_id between 'e0000000-0000-0000-0000-000000000001' and 'e0000000-0000-0000-0000-000000000009';

delete from auth.users
where id between 'e0000000-0000-0000-0000-000000000001' and 'e0000000-0000-0000-0000-000000000009';

-- 3) revert demo profile edits
update public.profiles set role = 'patient' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 4) note: set_demo_patient_password changed the password of
--    test.booking@temp.local to Miaadi@2026. To fully revert, either
--    restore the old password manually or delete that account.
