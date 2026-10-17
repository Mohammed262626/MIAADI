-- ============================================================================
-- Phase 4 (optional): nightly cleanup of expired, unbooked slots
-- ============================================================================
-- NOT yet applied to the database.
--
-- The app already purges expired slots opportunistically (an admin session runs
-- purgeExpiredSlots() on load). This file is the *ideal* server-side version:
-- it runs regardless of whether anyone opens the app.
--
-- Requires the pg_cron extension. Run this in the Supabase SQL Editor.
-- If pg_cron is unavailable on your plan, the in-app purge covers you.

create extension if not exists pg_cron;

-- Re-scheduling the same job name twice appends duplicates, so clear first.
do $$
begin
    perform cron.unschedule('purge-expired-slots');
exception when others then null;
end $$;

select cron.schedule(
    'purge-expired-slots',
    '0 3 * * *',
    $$
    delete from public.doctor_schedules
    where is_booked = false
      and available_date < current_date
    $$
);

-- Inspect the schedule:
--   select * from cron.job;
-- Remove it:
--   select cron.unschedule('purge-expired-slots');

-- ============================================================================
-- Safety: only is_booked = false rows are deleted, so no appointment (which
-- references a schedule via ON DELETE RESTRICT) can be affected.
-- ============================================================================
