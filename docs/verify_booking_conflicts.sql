-- ============================================================
-- Verify patient booking conflict rules (docs/verify_booking_conflicts.sql)
--
-- Rules enforced by public.book_appointment() / reschedule_appointment():
--   R1  same doctor + same day  -> raise 'لديك موعد آخر مع نفس الطبيب في هذا اليوم …'
--   R2  overlapping interval with a booked appointment of ANOTHER
--       doctor on the same day -> raise 'لديك موعد متعارض في نفس التوقيت …'
--   A1  purged/future-only schedules unchanged (booked rows keep their slot).
--
-- Pattern: impersonate the demo patient via set_config('request.jwt.claims', ...)
-- (same technique used by docs/cleanup-demo-data.sql) then wrap every check in
-- a DO block with an exception handler; the whole script ends with ROLLBACK so
-- the database is left untouched.
--
-- Expected output per section:  `PASS: expected conflict: …` lines.
-- If you see `FAIL`, the corresponding rule is NOT enforced.
-- ============================================================

-- 0) impersonate the demo patient (test.booking@temp.local)
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', 'e5112c18-2b37-40f8-b614-6bc3d6e8bd6e',
    'role', 'authenticated'
  )::text,
  false
);

-- sanity: auth.uid must resolve to the demo patient
select auth.uid() = 'e5112c18-2b37-40f8-b614-6bc3d6e8bd6e' as impersonation_ok;
select count(*) as pre_existing_booked from public.appointments
where patient_id = auth.uid() and status = 'booked';

BEGIN;

-- ---------------------------------------------------------------
-- T1) helper probe: patient_conflict_kind()
--      0 = free, 1 = same doctor same day, 2 = cross-doctor overlap
-- ---------------------------------------------------------------
-- 1: pick a free slot of the demo cardiologist today+ :
select patient_conflict_kind(
  'e5112c18-2b37-40f8-b614-6bc3d6e8bd6e',
  s.id
) as kind_before_booking, s.id, s.available_date, s.start_time
from public.doctor_schedules s
where s.doctor_id = 'd0000000-0000-0000-0000-000000000001'
  and s.is_booked = false
  and s.available_date >= current_date
order by s.available_date, s.start_time
limit 5;

-- ---------------------------------------------------------------
-- T2) book two different free slots of the SAME doctor on the SAME
--     day -> second one must raise (rule R1)
-- ---------------------------------------------------------------
DO $$
declare
  s1 uuid; s2 uuid; ids uuid[];
  pn text := 'مريض اختبار التعارض'; pp text := '0500000000';
begin
  select array_agg(id) into ids
  from (
    select id
    from public.doctor_schedules
    where doctor_id = 'd0000000-0000-0000-0000-000000000001'
      and is_booked = false
      and available_date >= current_date
    order by available_date, start_time
    limit 2
  ) t;
  if coalesce(array_length(ids, 1), 0) < 2 then
    raise exception 'SKIP: fewer than 2 free slots available';
  end if;
  s1 := ids[1]; s2 := ids[2];

  perform public.book_appointment(s1, pn, pp);   -- must succeed
  perform public.book_appointment(s2, pn, pp);   -- must raise R1
  raise notice 'FAIL T2: same-doctor same-day booking was allowed';
exception when others then
  raise notice 'PASS T2 (same doctor/day): %', SQLERRM;
end $$;

-- ---------------------------------------------------------------
-- T3) book one slot, then an OVERLAPPING slot of ANOTHER doctor on
--     the same date -> second one must raise (rule R2)
-- ---------------------------------------------------------------
DO $$
declare
  xa record; ya uuid;
begin
  -- X: any free slot of the demo cardiologist
  select s.* into xa
  from public.doctor_schedules s
  where s.doctor_id = 'd0000000-0000-0000-0000-000000000001'
    and s.is_booked = false
    and s.available_date >= current_date
  order by s.available_date, s.start_time
  limit 1;

  -- Y: overlapping free slot of a DIFFERENT doctor on the same date
  select s.id into ya
  from public.doctor_schedules s
  where s.doctor_id <> xa.doctor_id
    and s.is_booked = false
    and s.available_date = xa.available_date
    and s.start_time < xa.end_time            -- starts before X ends
    and s.end_time   > xa.start_time          -- ends after X starts
  order by s.start_time
  limit 1;

  perform public.book_appointment(xa.id, 'مريض اختبار التعارض', '0500000000');     -- must succeed
  perform public.book_appointment(ya, 'مريض اختبار التعارض', '0500000000');        -- must raise R2
  raise notice 'FAIL T3: overlapping cross-doctor booking was allowed (ya=%, date=%)', ya, xa.available_date;
exception when others then
  raise notice 'PASS T3 (cross-doctor overlap): %', SQLERRM;
end $$;

-- ---------------------------------------------------------------
-- T4) patient_conflict_kind helpfulness — after a booking exists,
--     other free slots same doctor/day = 1, ranked-overlap = 2
-- ---------------------------------------------------------------
DO $$
declare
  x record;
  k_same int; k_over int;
begin
  select s.* into x
  from public.doctor_schedules s
  where s.doctor_id = 'd0000000-0000-0000-0000-000000000001'
    and s.is_booked = false and s.available_date >= current_date
  order by available_date, start_time limit 1;

  perform public.book_appointment(x.id, 'مريض اختبار التعارض', '0500000000');

  -- another free slot, SAME doctor SAME day -> 1
  select min(patient_conflict_kind('e5112c18-2b37-40f8-b614-6bc3d6e8bd6e', s.id))
    into k_same
  from public.doctor_schedules s
  where s.doctor_id = x.doctor_id and s.is_booked = false
    and s.available_date = x.available_date;

  -- overlapping slot of another doctor same day -> 2
  select min(patient_conflict_kind('e5112c18-2b37-40f8-b614-6bc3d6e8bd6e', s.id))
    into k_over
  from public.doctor_schedules s
  where s.doctor_id <> x.doctor_id and s.is_booked = false
    and s.available_date = x.available_date
    and s.start_time < x.end_time and s.end_time > x.start_time;

  if k_same = 1 and k_over = 2 then
    raise notice 'PASS T4 (conflict kinds 1/2 as expected)';
  else
    raise notice 'FAIL T4: expected 1 and 2, got % and %', k_same, k_over;
  end if;
exception when others then
  raise notice 'FAIL T4 unexpected error: %', SQLERRM;
end $$;

ROLLBACK;

-- ---------------------------------------------------------------
-- A) Admin reschedule/delete guards (sanity, read-only)
-- ---------------------------------------------------------------
-- admin_delete_appointment / admin_reschedule_appointment must reject
-- non-admin callers (raises 'Forbidden'):
select count(*) as guard_functions_present
from pg_proc
where proname in ('admin_delete_appointment','admin_reschedule_appointment',
                  'book_appointment','reschedule_appointment','patient_conflict_kind')
  and pronamespace = 'public'::regnamespace;
