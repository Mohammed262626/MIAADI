-- ================================================================================================
-- تنظيف بيانات السودان التجريبية (Sudan demo data cleanup)
-- Deletes only the deterministic Sudan ranges applied by seed_sudan_demo_data.sql:
--   doctors  d1000000-0000-0000-0000-00000000000001..500  (d1 hex 0000..01f4)
--   hospitals b2000000-0000-0000-0000-000000000009 (9 new)
-- Better: restores nothing — the original Saudi hospital names are NOT recoverable from here.
-- For full reset use docs/cleanup-demo-data.sql then re-seed from scratch.
-- ================================================================================================

DELETE FROM public.doctor_schedules   WHERE doctor_id BETWEEN 'd1000000-0000-0000-0000-000000000000' AND 'd1000000-0000-0000-0000-ffffffffffff';
DELETE FROM public.doctor_availability WHERE doctor_id BETWEEN 'd1000000-0000-0000-0000-000000000000' AND 'd1000000-0000-0000-0000-ffffffffffff';
DELETE FROM public.doctor_insurances  WHERE doctor_id BETWEEN 'd1000000-0000-0000-0000-000000000000' AND 'd1000000-0000-0000-0000-ffffffffffff';
DELETE FROM public.doctors            WHERE id        BETWEEN 'd1000000-0000-0000-0000-000000000000' AND 'd1000000-0000-0000-0000-ffffffffffff';

DELETE FROM public.hospitals WHERE id BETWEEN 'b2000000-0000-0000-0000-000000000000' AND 'b2000000-0000-0000-0000-ffffffffffff';
