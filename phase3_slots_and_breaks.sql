-- ============================================================================
-- Phase 3: fixed-length appointment slots + daily break windows
-- ============================================================================
-- Applied as migration: phase3_slots_and_breaks
--
-- Problem before this phase:
--   * A weekly rule was copied to doctor_schedules as ONE slot covering the
--     whole range, so "08:00-16:00" produced a single 8-hour bookable block
--     (whoever booked it consumed the entire day).
--   * There was no concept of appointment length, nor of daily breaks.
--
-- After this phase:
--   * Each rule is split into consecutive slot_minutes cells (default 30).
--   * Up to two daily break windows per rule are excluded from generation.
--   * Blocked dates (doctor_unavailable) continue to be skipped (phase 2).
--   * p_replace (opt-in) clears future unbooked slots in the range first.

-- 1) Availability rules gain a slot length and up to two daily breaks
ALTER TABLE public.doctor_availability
    ADD COLUMN IF NOT EXISTS slot_minutes SMALLINT NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS break_start_1 TIME,
    ADD COLUMN IF NOT EXISTS break_end_1 TIME,
    ADD COLUMN IF NOT EXISTS break_start_2 TIME,
    ADD COLUMN IF NOT EXISTS break_end_2 TIME;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_slot_minutes') THEN
        ALTER TABLE public.doctor_availability
            ADD CONSTRAINT chk_slot_minutes CHECK (slot_minutes BETWEEN 5 AND 480);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_break_1') THEN
        ALTER TABLE public.doctor_availability
            ADD CONSTRAINT chk_break_1 CHECK (break_start_1 IS NULL OR break_end_1 IS NULL OR break_end_1 > break_start_1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_break_2') THEN
        ALTER TABLE public.doctor_availability
            ADD CONSTRAINT chk_break_2 CHECK (break_start_2 IS NULL OR break_end_2 IS NULL OR break_end_2 > break_start_2);
    END IF;
END $$;

-- 2) Drop the old 3-arg signature so the new default-arg version replaces it cleanly
DROP FUNCTION IF EXISTS public.generate_schedule_from_availability(UUID, DATE, DATE);

-- 3) Generation: walk each rule in slot_minutes cells, skipping breaks and blocked dates.
CREATE OR REPLACE FUNCTION public.generate_schedule_from_availability(
    p_doctor_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
    p_replace BOOLEAN DEFAULT false
)
RETURNS TABLE(created_slots INTEGER, skipped_slots INTEGER)
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_date DATE := p_start_date;
    v_dow SMALLINT;
    v_count INTEGER;
    v_created INTEGER := 0;
    v_cell_start TIME;
    v_cell_end TIME;
    r RECORD;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً';
    END IF;

    IF NOT public.is_admin() THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.doctors
            WHERE id = p_doctor_id AND user_id = auth.uid()
        ) THEN
            RAISE EXCEPTION 'غير مصرح: لا تملك صلاحية إدارة مواعيد هذا الطبيب';
        END IF;
    END IF;

    IF p_replace THEN
        DELETE FROM public.doctor_schedules
        WHERE doctor_id = p_doctor_id
          AND available_date BETWEEN p_start_date AND p_end_date
          AND is_booked = false
          AND available_date >= CURRENT_DATE;
    END IF;

    WHILE v_date <= p_end_date LOOP
        -- Skip any date inside a blocked (unavailable) range
        IF NOT EXISTS (
            SELECT 1 FROM public.doctor_unavailable u
            WHERE u.doctor_id = p_doctor_id
              AND v_date BETWEEN u.start_date AND u.end_date
        ) THEN
            v_dow := EXTRACT(DOW FROM v_date);

            FOR r IN
                SELECT start_time, end_time, slot_minutes,
                       break_start_1, break_end_1, break_start_2, break_end_2
                FROM public.doctor_availability
                WHERE doctor_id = p_doctor_id
                  AND day_of_week = v_dow
                  AND is_enabled = true
            LOOP
                v_cell_start := r.start_time;

                LOOP
                    v_cell_end := (v_cell_start + make_interval(mins => r.slot_minutes))::time;
                    EXIT WHEN v_cell_end > r.end_time;

                    -- Skip cells overlapping either break window
                    IF NOT (
                        (r.break_start_1 IS NOT NULL AND r.break_end_1 IS NOT NULL
                            AND v_cell_end > r.break_start_1 AND v_cell_start < r.break_end_1)
                        OR
                        (r.break_start_2 IS NOT NULL AND r.break_end_2 IS NOT NULL
                            AND v_cell_end > r.break_start_2 AND v_cell_start < r.break_end_2)
                    ) THEN
                        INSERT INTO public.doctor_schedules (doctor_id, available_date, start_time, end_time, is_booked)
                        VALUES (p_doctor_id, v_date, v_cell_start, v_cell_end, false)
                        ON CONFLICT (doctor_id, available_date, start_time) DO NOTHING;

                        GET DIAGNOSTICS v_count = ROW_COUNT;
                        v_created := v_created + v_count;
                    END IF;

                    v_cell_start := v_cell_end;
                END LOOP;
            END LOOP;
        END IF;

        v_date := v_date + INTERVAL '1 day';
    END LOOP;

    RETURN QUERY SELECT v_created AS created_slots, 0 AS skipped_slots;
END;
$$;

-- 4) Hardening: authenticated-only
REVOKE EXECUTE ON FUNCTION public.generate_schedule_from_availability(UUID, DATE, DATE, BOOLEAN) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_schedule_from_availability(UUID, DATE, DATE, BOOLEAN) TO authenticated;

-- ============================================================================
-- Verified end-to-end (admin login via REST), rule 08:00-16:00, 30min,
-- breaks 13:00-14:00 and 15:00-16:00:
--   generate #1                        -> 1092 slots (91 days x 12/day)
--   one day                           -> 12 slots:
--     08:00..12:30 (10) then 14:00,14:30 (2); 12:30-13:00 is the last before break
--   generate #2 with p_replace=true    -> 1092 again (idempotent, no duplicates)
-- ============================================================================
