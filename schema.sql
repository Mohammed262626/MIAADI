-- ==============================================================================
-- نبض العافية (PulseCare) - السكريبت الكامل لإنشاء قاعدة البيانات على Supabase
-- شغّل هذا السكريبت بالكامل داخل: Supabase Dashboard > SQL Editor > New query
-- ==============================================================================

-- 1. تفعيل الإضافات الأساسية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. جدول البروفايلات (profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. دالة و Trigger لإنشاء البروفايل تلقائياً عند تسجيل المستخدم في auth.users
-- ==============================================================================
-- ملاحظة أمنية: لا يُقرأ الدور من raw_user_meta_data إطلاقاً (يمكن للمستخدم التحكم بها)
-- الدور الافتراضي دائماً 'patient'؛ ترقية الأدوار تتم حصراً عبر admin_set_role (مشرف فقط)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مريض جديد'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'patient'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة و Trigger لتحديث عمود updated_at تلقائياً عند تعديل البروفايل
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 4. جدول الأطباء (doctors)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ربط فريد بين كل طبيب وحساب مصادقة واحد (يُستخدم في سياسات RLS الخاصة بالأطباء)
CREATE UNIQUE INDEX IF NOT EXISTS uq_doctors_user_id ON public.doctors(user_id);

-- ==============================================================================
-- 5. جدول المواعيد المتاحة للأطباء (doctor_schedules)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time),
    CONSTRAINT uq_doctor_schedule UNIQUE (doctor_id, available_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedules_doctor_date 
    ON public.doctor_schedules(doctor_id, available_date, is_booked);

-- ==============================================================================
-- 6. جدول الحجوزات (appointments)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.doctor_schedules(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked' 
        CHECK (status IN ('booked', 'completed', 'cancelled_by_patient', 'cancelled_by_clinic', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_schedule ON public.appointments(schedule_id);

-- ==============================================================================
-- 7. دالة الـ RPC الآمنة لحجز موعد ومنع تداخل السباق (book_appointment)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.book_appointment(
    p_schedule_id UUID,
    p_patient_name TEXT,
    p_patient_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_patient_id UUID;
    v_schedule RECORD;
    v_new_appointment_id UUID;
BEGIN
    -- 1. جلب معرف المستخدم الحالي المصادق عليه
    v_patient_id := (SELECT auth.uid());
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'يجب تسجيل الدخول أولاً لإتمام الحجز (User is not authenticated)';
    END IF;

    -- 2. التحقق من صحة المدخلات
    IF p_patient_name IS NULL OR length(trim(p_patient_name)) = 0 THEN
        RAISE EXCEPTION 'اسم المريض مطلوب';
    END IF;
    IF p_patient_phone IS NULL OR length(trim(p_patient_phone)) = 0 THEN
        RAISE EXCEPTION 'رقم هاتف المريض مطلوب';
    END IF;

    -- 3. قفل سجل الموعد لمنع تداخل الحجوزات (Pessimistic Lock - Race Condition Prevention)
    SELECT * INTO v_schedule
    FROM public.doctor_schedules
    WHERE id = p_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الموعد المحدد غير موجود';
    END IF;

    IF v_schedule.is_booked = true THEN
        RAISE EXCEPTION 'عذراً، هذا الموعد تم حجزه للتو من قبل شخص آخر';
    END IF;

    -- 4. تحديث حالة الموعد المجدول إلى محجوز
    UPDATE public.doctor_schedules
    SET is_booked = true
    WHERE id = p_schedule_id;

    -- 5. إنشاء سجل الحجز في جدول appointments
    INSERT INTO public.appointments (
        schedule_id,
        patient_id,
        patient_name,
        patient_phone,
        status
    )
    VALUES (
        p_schedule_id,
        v_patient_id,
        trim(p_patient_name),
        trim(p_patient_phone),
        'booked'
    )
    RETURNING id INTO v_new_appointment_id;

    -- 6. إرجاع نتيجة الحجز كـ JSON
    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_new_appointment_id,
        'schedule_id', p_schedule_id,
        'message', 'تم تأكيد حجز الموعد بنجاح'
    );
END;
$$;

-- 7.2 دالة إلغاء الموعد الآمنة (cancel_appointment)
CREATE OR REPLACE FUNCTION public.cancel_appointment(
    p_appointment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_patient_id UUID;
    v_schedule_id UUID;
    v_status TEXT;
    v_available_date DATE;
    v_start_time TIME;
BEGIN
    -- التحقق من هوية المستخدم المسجل
    v_patient_id := auth.uid();
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً لإلغاء الموعد';
    END IF;

    -- التحقق من وجود الموعد وملكيته للمريض الحالي وقفل السجل
    SELECT a.schedule_id, a.status, s.available_date, s.start_time
    INTO v_schedule_id, v_status, v_available_date, v_start_time
    FROM public.appointments a
    JOIN public.doctor_schedules s ON a.schedule_id = s.id
    WHERE a.id = p_appointment_id AND a.patient_id = v_patient_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الموعد غير موجود أو لا تملك صلاحية إلغائه';
    END IF;

    IF v_status != 'booked' THEN
        RAISE EXCEPTION 'لا يمكن إلغاء موعد تم إلغاؤه أو إكماله مسبقاً (الحالة الحالية: %)', v_status;
    END IF;

    -- تحديث حالة الحجز إلى ملغي من قِبل المريض
    UPDATE public.appointments
    SET status = 'cancelled_by_patient'
    WHERE id = p_appointment_id;

    -- تحرير الموعد المجدول ليصبح متاحاً للحجز مرة أخرى
    UPDATE public.doctor_schedules
    SET is_booked = false
    WHERE id = v_schedule_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'message', 'تم إلغاء الموعد بنجاح وتحرير الموعد المجدول'
    );
END;
$$;

-- 7.3 دالة إعادة جدولة الموعد الآمنة (reschedule_appointment)
CREATE OR REPLACE FUNCTION public.reschedule_appointment(
    p_appointment_id UUID,
    p_new_schedule_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_patient_id UUID;
    v_old_schedule_id UUID;
    v_status TEXT;
    v_is_new_booked BOOLEAN;
BEGIN
    -- التحقق من هوية المستخدم
    v_patient_id := auth.uid();
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً لإعادة جدولة الموعد';
    END IF;

    -- قفل الحجز القديم والتحقق من ملكيته
    SELECT schedule_id, status
    INTO v_old_schedule_id, v_status
    FROM public.appointments
    WHERE id = p_appointment_id AND patient_id = v_patient_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الموعد الأصلي غير موجود أو لا تملك صلاحية تعديله';
    END IF;

    IF v_status != 'booked' THEN
        RAISE EXCEPTION 'لا يمكن إعادة جدولة موعد غير مؤكد (الحالة الحالية: %)', v_status;
    END IF;

    IF v_old_schedule_id = p_new_schedule_id THEN
        RAISE EXCEPTION 'الموعد الجديد المختار هو نفس الموعد الحالي';
    END IF;

    -- قفل الموعد الجديد للتحقق من أنه غير محجوز
    SELECT is_booked INTO v_is_new_booked
    FROM public.doctor_schedules
    WHERE id = p_new_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الموعد الجديد غير متوفر أو تم حذفه';
    END IF;

    IF v_is_new_booked THEN
        RAISE EXCEPTION 'عذراً، الموعد الجديد المختار محجوز بالفعل';
    END IF;

    -- تحرير الموعد القديم
    UPDATE public.doctor_schedules
    SET is_booked = false
    WHERE id = v_old_schedule_id;

    -- حجز الموعد الجديد
    UPDATE public.doctor_schedules
    SET is_booked = true
    WHERE id = p_new_schedule_id;

    -- تحديث الحجز ليشير إلى الموعد الجديد
    UPDATE public.appointments
    SET schedule_id = p_new_schedule_id
    WHERE id = p_appointment_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'old_schedule_id', v_old_schedule_id,
        'new_schedule_id', p_new_schedule_id,
        'message', 'تمت إعادة جدولة الموعد بنجاح'
    );
END;
$$;

-- ==============================================================================
-- 7.4 دالة إلغاء الحجز من قِبل العيادة (cancel_appointment_clinic)
--     الصلاحية: المشرف أو الطبيب صاحب الجدول فقط — وتحرّر الموعد المجدول
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_appointment_clinic(
    p_appointment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_schedule_id UUID;
    v_status      TEXT;
    v_authorized  BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً';
    END IF;

    SELECT a.schedule_id,
           a.status,
           (public.is_admin() OR EXISTS (
               SELECT 1
               FROM public.doctor_schedules s
               JOIN public.doctors d ON s.doctor_id = d.id
               WHERE s.id = a.schedule_id AND d.user_id = auth.uid()
           ))
    INTO v_schedule_id, v_status, v_authorized
    FROM public.appointments a
    WHERE a.id = p_appointment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الحجز المطلوب غير موجود';
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'غير مصرح: لا تملك صلاحية إلغاء هذا الحجز';
    END IF;

    IF v_status != 'booked' THEN
        RAISE EXCEPTION 'لا يمكن إلغاء حجز ليس بحالة مؤكد (الحالة الحالية: %)', v_status;
    END IF;

    UPDATE public.appointments
    SET status = 'cancelled_by_clinic'
    WHERE id = p_appointment_id;

    UPDATE public.doctor_schedules
    SET is_booked = false
    WHERE id = v_schedule_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'message', 'تم إلغاء الحجز وتحرير الموعد بنجاح'
    );
END;
$$;

-- ==============================================================================
-- 7.5 دالة تحديث حالة الحجز للطبيب/المشرف بأمان (admin_update_appointment_state)
--     الانتقالات المسموحة: booked -> completed / no_show فقط (لا تكتب حالات عشوائية)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_update_appointment_state(
    p_appointment_id UUID,
    p_state TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status     TEXT;
    v_authorized BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً';
    END IF;

    IF p_state NOT IN ('completed', 'no_show') THEN
        RAISE EXCEPTION 'حالة غير مسموح بها: يجب أن تكون completed أو no_show';
    END IF;

    SELECT a.status,
           (public.is_admin() OR EXISTS (
               SELECT 1
               FROM public.doctor_schedules s
               JOIN public.doctors d ON s.doctor_id = d.id
               WHERE s.id = a.schedule_id AND d.user_id = auth.uid()
           ))
    INTO v_status, v_authorized
    FROM public.appointments a
    WHERE a.id = p_appointment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الحجز المطلوب غير موجود';
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'غير مصرح: لا تملك صلاحية تحديث هذا الحجز';
    END IF;

    IF v_status != 'booked' THEN
        RAISE EXCEPTION 'لا يمكن تحديث حجز ليس بحالة مؤكد (الحالة الحالية: %)', v_status;
    END IF;

    UPDATE public.appointments
    SET status = p_state
    WHERE id = p_appointment_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'state', p_state,
        'message', 'تم تحديث حالة الحجز بنجاح'
    );
END;
$$;

-- ==============================================================================
-- 7.6 دالة تعيين الأدوار للمشرف فقط (admin_set_role)
--     تبقى فواصل الحماية: guard_profile_role + فحص is_admin داخل الدالة
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_set_role(
    p_user_id UUID,
    p_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح: صلاحية المشرف مطلوبة لتغيير الأدوار';
    END IF;

    IF p_role NOT IN ('patient', 'doctor', 'admin') THEN
        RAISE EXCEPTION 'دور غير معروف: %', p_role;
    END IF;

    -- منع إزالة صلاحية المشرف عن الحساب الحالي لتجنّب قفل النظام
    IF auth.uid() = p_user_id AND p_role <> 'admin' THEN
        RAISE EXCEPTION 'لا يمكنك تغيير دور حسابك الحالي أثناء بقائك مشرفاً';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'المستخدم المحدد غير موجود';
    END IF;

    UPDATE public.profiles
    SET role = p_role
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'role', p_role,
        'message', 'تم تحديث الدور بنجاح'
    );
END;
$$;

-- ==============================================================================
-- 7.7 دالة عرض حسابات المستخدمين للمشرف فقط (admin_list_profiles)
--     تشمل البريد الإلكتروني من auth.users لتحديد المالك؛ محمية بفحص is_admin
--     تنبيه: auth.users.email من نوع varchar ولا يُحوَّل تلقائياً لنص في RETURN QUERY
--     لذا أُضيفت الصياغة u.email::text ليتطابق نوع العمود مع RETURNS TABLE (TEXT)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: يجب تسجيل الدخول أولاً';
    END IF;

    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح: صلاحية المشرف مطلوبة لعرض الحسابات';
    END IF;

    RETURN QUERY
    SELECT
        p.id AS user_id,
        u.email::text AS email,
        p.full_name,
        p.phone,
        p.role
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at ASC;
END;
$$;

-- ==============================================================================
-- 8. تفعيل سياسات الأمان RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- سياسات profiles
-- دالة مساعدة للتحقق من صلاحية المشرف (SECURITY DEFINER لتجنب التكرار مع RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- قراءة الملف الشخصي: للمالك أو للمشرف فقط (منع تسريب بيانات المرضى)
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Profiles visible to owner and admins" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id OR public.is_admin());

-- تعديل الملف الشخصي: للمالك فقط، ويُمنع تغيير الدور (role) عبر الـ Trigger
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger يمنع تصعيد الصلاحيات (تغيير role) لغير المشرفين
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مسموح بتغيير الدور (role) بدون صلاحية مشرف';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_role ON public.profiles;
CREATE TRIGGER guard_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- سياسات doctors (قراءة للجميع)
DROP POLICY IF EXISTS "Doctors are viewable by all" ON public.doctors;
CREATE POLICY "Doctors are viewable by all" ON public.doctors
    FOR SELECT TO authenticated, anon USING (true);

-- سياسات doctor_schedules (قراءة للجميع)
DROP POLICY IF EXISTS "Schedules are viewable by all" ON public.doctor_schedules;
CREATE POLICY "Schedules are viewable by all" ON public.doctor_schedules
    FOR SELECT TO authenticated, anon USING (true);

-- سياسات appointments (المريض يرى حجوزاته، والطبيب يرى مواعيده، والمشرف يرى الكل)
-- لا توجد سياسة INSERT: الحجز يتم حصراً عبر book_appointment (SECURITY DEFINER) التي تقفل
-- الموعد في معاملة ذرّية؛ منع الإدراج المباشر يغلق أي تجاوز لهذه الضمانة (منع التداخل)
DROP POLICY IF EXISTS "Patients can insert appointments" ON public.appointments;

-- قراءة المواعيد: سياسة واحدة تجمع المريض والطبيب المعني والمشرف (تفادي تعدد السياسات المتساهلة)
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view their scheduled appointments" ON public.appointments;
CREATE POLICY "Appointments visible to patient, doctor, or admin" ON public.appointments
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = patient_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.doctor_schedules s
            JOIN public.doctors d ON s.doctor_id = d.id
            WHERE s.id = appointments.schedule_id AND d.user_id = (SELECT auth.uid())
        )
    );

-- تحديث حالة الحجز (مكتمل / غياب) للطبيب المعني أو المشرف
DROP POLICY IF EXISTS "Doctors and admins can update appointment status" ON public.appointments;
CREATE POLICY "Doctors and admins can update appointment status" ON public.appointments
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.doctor_schedules s
            JOIN public.doctors d ON s.doctor_id = d.id
            WHERE s.id = appointments.schedule_id AND d.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doctor_schedules s
            JOIN public.doctors d ON s.doctor_id = d.id
            WHERE s.id = appointments.schedule_id AND d.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    );

-- إدارة الأطباء: للمشرف فقط (مقسّمة حسب العملية لتفادي تداخل سياسة القراءة العامة)
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can insert doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can update doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can delete doctors" ON public.doctors;
CREATE POLICY "Admins can insert doctors" ON public.doctors
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update doctors" ON public.doctors
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete doctors" ON public.doctors
    FOR DELETE TO authenticated USING (public.is_admin());

-- إدارة المواعيد المتاحة: للطبيب صاحب الجدول أو المشرف (إدراج/حذف فقط)
-- لا توجد سياسة UPDATE: تعديل هوية الموعد أو حقل is_booked يتم حصراً عبر دوال الحجز/الإلغاء
-- الآمنة؛ منع التعديل المباشر يمنع إعادة تحرير موعد محجوز يدوياً (وهو ما يسبب حجزاً مزدوجاً)
DROP POLICY IF EXISTS "Admins and doctors can manage schedules" ON public.doctor_schedules;
DROP POLICY IF EXISTS "Doctors and admins can insert schedules" ON public.doctor_schedules;
DROP POLICY IF EXISTS "Doctors and admins can update schedules" ON public.doctor_schedules;
DROP POLICY IF EXISTS "Doctors and admins can delete schedules" ON public.doctor_schedules;
CREATE POLICY "Doctors and admins can insert schedules" ON public.doctor_schedules
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_schedules.doctor_id AND d.user_id = (SELECT auth.uid()))
        OR public.is_admin()
    );
CREATE POLICY "Doctors and admins can delete schedules" ON public.doctor_schedules
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_schedules.doctor_id AND d.user_id = (SELECT auth.uid()))
        OR public.is_admin()
    );

-- ==============================================================================
-- 8.1 View مفصل ومريح للمواعيد (appointments_with_details)
-- ==============================================================================
CREATE OR REPLACE VIEW public.appointments_with_details
WITH (security_invoker = true)
AS
SELECT 
    a.id AS appointment_id,
    a.patient_id,
    a.patient_name,
    a.patient_phone,
    a.status,
    a.created_at AS booked_at,
    s.id AS schedule_id,
    s.available_date,
    s.start_time,
    s.end_time,
    d.id AS doctor_id,
    d.name AS doctor_name,
    d.specialization AS doctor_specialization,
    d.consultation_fee
FROM public.appointments a
JOIN public.doctor_schedules s ON a.schedule_id = s.id
JOIN public.doctors d ON s.doctor_id = d.id;

GRANT SELECT ON public.appointments_with_details TO authenticated;

-- ==============================================================================
-- 9. تفعيل ميزة التحديث اللحظي Realtime
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_schedules;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 10. منح الصلاحيات بالأقل صلاحية (Least Privilege) وتحديث كاش الـ API
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- anon: قراءة فقط للجداول العامة (الأطباء ومواعيدهم)
GRANT SELECT ON public.doctors, public.doctor_schedules TO anon;

-- authenticated: صلاحيات كاملة مع بقاء الحماية عبر RLS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- منع استدعاء دوال الـ SECURITY DEFINER عبر REST بواسطة anon / PUBLIC
REVOKE EXECUTE ON FUNCTION public.book_appointment(uuid, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_appointment(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reschedule_appointment(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_profile_role() FROM anon, PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;

-- دوال الحجز والإلغاء والجدولة تبقى حصرية للمستخدمين المسجلين فقط
GRANT EXECUTE ON FUNCTION public.book_appointment(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_appointment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_appointment(uuid, uuid) TO authenticated;

-- ملاحظة (قرار موثّق): يبقى is_admin() متاحاً لـ authenticated رغم تحذير linter 0029.
-- سبب إلزامي: أكثر من 15 سياسة RLS تستدعي public.is_admin() داخل USING/WITH CHECK،
-- وتُنفَّذ بصلاحيات الدور المُنِفِّذ (authenticated)، فسحب EXECUTE منه يُفشلها
-- بـ "permission denied for function is_admin" (أُثبت باختبار SET ROLE داخل معاملة).
-- لا يستدعيها العميل إطلاقاً؛ خطرها محدود (تكشف فقط هل المستخدم مشرف بنفسه).
-- الحل الجذري المقترح مستقبلاً: نقلها إلى schema خاص غير مُعرَّض عبر PostgREST وإعادة
-- كتابة السياسات لتشير إليه. مرفوض حالياً لكلفته.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_appointment_clinic(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_appointment_state(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

-- حجب دوال العيادة الجديدة عن anon / PUBLIC (أقل صلاحية)
REVOKE EXECUTE ON FUNCTION public.cancel_appointment_clinic(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_appointment_state(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_profiles() FROM anon, PUBLIC;

-- ==============================================================================
-- 11. إضافة بيانات تجريبية أولية (أطباء ومواعيد للأيام القادمة)
-- ==============================================================================
INSERT INTO public.doctors (id, name, specialization, consultation_fee)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'د. أحمد المنصوري', 'طب وجراحة القلب', 250.00),
    ('22222222-2222-2222-2222-222222222222', 'د. سارة الشهري', 'طب الأطفال وحديثي الولادة', 180.00),
    ('33333333-3333-3333-3333-333333333333', 'د. خالد العتيبي', 'طب العيون والليزك', 200.00),
    ('44444444-4444-4444-4444-444444444444', 'د. نورة الغامدي', 'الجلدية والتجميل', 220.00)
ON CONFLICT (id) DO NOTHING;

-- إضافة مواعيد للأطباء للأيام القادمة
INSERT INTO public.doctor_schedules (doctor_id, available_date, start_time, end_time, is_booked)
VALUES
    -- د. أحمد المنصوري
    ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', '09:00:00', '09:30:00', false),
    ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '10:30:00', false),
    ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '2 day', '16:00:00', '16:30:00', false),

    -- د. سارة الشهري
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '1 day', '11:00:00', '11:30:00', false),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '1 day', '12:00:00', '12:30:00', false),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '3 day', '17:00:00', '17:30:00', false),

    -- د. خالد العتيبي
    ('33333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '1 day', '14:00:00', '14:30:00', false),
    ('33333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '2 day', '15:00:00', '15:30:00', false),

    -- د. نورة الغامدي
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE + INTERVAL '1 day', '18:00:00', '18:30:00', false),
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE + INTERVAL '2 day', '19:00:00', '19:30:00', false)
ON CONFLICT DO NOTHING;

-- تحديث كاش الـ API لـ Supabase
NOTIFY pgrst, 'reload schema';
