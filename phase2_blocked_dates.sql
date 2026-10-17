-- ============================================================================
-- Phase 2: Enforce blocked (unavailable) dates during schedule generation
-- ============================================================================
-- Applied as migration: fix_blocked_dates_and_availability_rpc
--
-- Problem before this phase:
--   * generate_schedule_from_availability never consulted doctor_unavailable,
--     so blocked dates still produced slots (the table was effectively decorative).
--   * The function was declared STABLE although it INSERTs.
--   * search_path was mutable (advisor 0011) and anon had EXECUTE.

-- ----------------------------------------------------------------------------
-- 1. Regenerate slots: skip any date inside a doctor_unavailable range.
--    Pinned search_path, VOLATILE (it writes).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_schedule_from_availability(
    p_doctor_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days')
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

    WHILE v_date <= p_end_date LOOP
        -- Skip any date that falls inside a blocked (unavailable) range
        IF NOT EXISTS (
            SELECT 1 FROM public.doctor_unavailable u
            WHERE u.doctor_id = p_doctor_id
              AND v_date BETWEEN u.start_date AND u.end_date
        ) THEN
            v_dow := EXTRACT(DOW FROM v_date);

            INSERT INTO public.doctor_schedules (doctor_id, available_date, start_time, end_time, is_booked)
            SELECT p_doctor_id, v_date, start_time, end_time, false
            FROM public.doctor_availability
            WHERE doctor_id = p_doctor_id
              AND day_of_week = v_dow
              AND is_enabled = true
            ON CONFLICT (doctor_id, available_date, start_time) DO NOTHING;

            GET DIAGNOSTICS v_count = ROW_COUNT;
            v_created := v_created + v_count;
        END IF;

        v_date := v_date + INTERVAL '1 day';
    END LOOP;

    RETURN QUERY SELECT v_created AS created_slots, 0 AS skipped_slots;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Block a date range: record the leave AND clear future, unbooked slots
--    inside it (single transaction). Returns the number of freed slots.
--    Admin only.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.block_doctor_dates(
    p_doctor_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_reason TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted INTEGER := 0;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً';
    END IF;

    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح: إدارة الإجازات متاحة للمشرف فقط';
    END IF;

    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION 'تاريخ النهاية قبل تاريخ البداية';
    END IF;

    INSERT INTO public.doctor_unavailable (doctor_id, start_date, end_date, reason)
    VALUES (p_doctor_id, p_start_date, p_end_date, COALESCE(NULLIF(p_reason, ''), 'إجازة'));

    DELETE FROM public.doctor_schedules
    WHERE doctor_id = p_doctor_id
      AND available_date BETWEEN p_start_date AND p_end_date
      AND is_booked = false
      AND available_date >= CURRENT_DATE;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Hardening: authenticated-only
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.generate_schedule_from_availability(UUID, DATE, DATE) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.block_doctor_dates(UUID, DATE, DATE, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_schedule_from_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.block_doctor_dates(UUID, DATE, DATE, TEXT) TO authenticated;

-- ============================================================================
-- Verified end-to-end (admin login via REST):
--   generate #1                          -> 91 slots
--   block_doctor_dates (7-day range)     -> deleted 7
--   generate #2 after clearing schedules -> 84 slots, 0 inside the blocked range
-- ============================================================================
