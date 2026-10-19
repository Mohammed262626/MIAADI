-- ================================================================================================
-- بيانات السودان التجريبية (Sudan demo data)
-- Applied as Supabase migrations: sudanize_hospitals, seed_sudan_doctors_500, seed_sudan_doctors_500_part2
-- Result: 17 hospitals across 12 Sudanese cities, 500 demo doctors (+ existing 9 = 509),
--         weekly availability, ~98k schedule slots (30 days), insurance links.
-- Deterministic: all values derive from the row number n, so cleanup/reseed is repeatable.
-- ================================================================================================

-- 1) أنظف نقطة: حذف القِدَم السعودي قبل الإعادة (اختياري) — see cleanup_sudan_demo_data.sql

-- 2) المستشفيات الثمانية القديمة (نفس المعرفات) + تسعة جديدة
UPDATE public.hospitals SET name = 'مستشفى رويال كير الدولي', city = 'الخرطوم', address = 'حي أمبات، شارع أمارت' WHERE id = 'b1000000-0000-0000-0000-000000000001';
UPDATE public.hospitals SET name = 'مستشفى د. بلال التخصصي', city = 'أم درمان', address = 'حي مريم، شارع الحرية' WHERE id = 'b1000000-0000-0000-0000-000000000002';
UPDATE public.hospitals SET name = 'عيادات المقرن لطب وتقويم الأسنان', city = 'الخرطوم', address = 'الخرطوم وسط، تقاطع شارع الجامعة' WHERE id = 'b1000000-0000-0000-0000-000000000003';
UPDATE public.hospitals SET name = 'مستشفى الخرطوم بحري التعليمي', city = 'الخرطوم بحري', address = 'حي الحج يوسق، شارع الشرقية' WHERE id = 'b1000000-0000-0000-0000-000000000004';
UPDATE public.hospitals SET name = 'مستشفى الأمل التخصصي', city = 'الخرطوم', address = 'حي سلامة، شارع النيل' WHERE id = 'b1000000-0000-0000-0000-000000000005';
UPDATE public.hospitals SET name = 'مركز الميدان الطبي التخصصي', city = 'الخرطوم', address = 'حي تانياب، شارع الأول' WHERE id = 'b1000000-0000-0000-0000-000000000006';
UPDATE public.hospitals SET name = 'مستشفى السلام لطب العيون والأسنان', city = 'الخرطوم بحري', address = 'حي بشريات، شارع المعبر' WHERE id = 'b1000000-0000-0000-0000-000000000007';
UPDATE public.hospitals SET name = 'مستشفى النور التخصصي', city = 'الخرطوم', address = 'حي جبرة، شارع الرشيد' WHERE id = 'b1000000-0000-0000-0000-000000000008';

INSERT INTO public.hospitals (id, name, city, address) VALUES
('b2000000-0000-0000-0000-000000000001', 'مستشفى البحر الأحمر التخصصي', 'بورتسودان', 'حي الميناء، شارع السوق'),
('b2000000-0000-0000-0000-000000000002', 'مستشفى الجزيرة التخصصي', 'ود مداني', 'شارع الجامعة، حي المطار'),
('b2000000-0000-0000-0000-000000000003', 'مستشفى دار السلام التخصصي', 'نيالا', 'حي المدرسة، شارع السوق'),
('b2000000-0000-0000-0000-000000000004', 'مستشفى الفاشر الدولي', 'الفاشر', 'حي السوق، شارع الطلبة'),
('b2000000-0000-0000-0000-000000000005', 'مستشفى عطبرة الطبي', 'عطبرة', 'شارع الكرامة، حي الحديد'),
('b2000000-0000-0000-0000-000000000006', 'مستشفى كسلا التخصصي', 'كسلا', 'حي توتيل، شارع المطار'),
('b2000000-0000-0000-0000-000000000007', 'مستشفى الرحمة التخصصي', 'الأبيض', 'حي الجمهورية، شارع السوق'),
('b2000000-0000-0000-0000-000000000008', 'مستشفى سنار الطبي', 'سنار', 'حي المرتفعات، شارع القصر'),
('b2000000-0000-0000-0000-000000000009', 'مستشفى دنقلا التخصصي', 'دنقلا', 'حي السوق، شارع النيلة');

-- 3) 500 طبيب تجريبي موزعين على المدن
CREATE TEMP TABLE _rng AS
SELECT * FROM (VALUES
 (1,30,   'b1000000-0000-0000-0000-000000000001'::uuid,'الخرطوم'),
 (31,60,  'b1000000-0000-0000-0000-000000000003'::uuid,'الخرطوم'),
 (61,90,  'b1000000-0000-0000-0000-000000000005'::uuid,'الخرطوم'),
 (91,120, 'b1000000-0000-0000-0000-000000000006'::uuid,'الخرطوم'),
 (121,150,'b1000000-0000-0000-0000-000000000008'::uuid,'الخرطوم'),
 (151,220,'b1000000-0000-0000-0000-000000000002'::uuid,'أم درمان'),
 (221,250,'b1000000-0000-0000-0000-000000000004'::uuid,'الخرطوم بحري'),
 (251,280,'b1000000-0000-0000-0000-000000000007'::uuid,'الخرطوم بحري'),
 (281,320,'b2000000-0000-0000-0000-000000000001'::uuid,'بورتسودان'),
 (321,360,'b2000000-0000-0000-0000-000000000002'::uuid,'ود مداني'),
 (361,390,'b2000000-0000-0000-0000-000000000003'::uuid,'نيالا'),
 (391,415,'b2000000-0000-0000-0000-000000000004'::uuid,'الفاشر'),
 (416,435,'b2000000-0000-0000-0000-000000000005'::uuid,'عطبرة'),
 (436,455,'b2000000-0000-0000-0000-000000000006'::uuid,'كسلا'),
 (456,475,'b2000000-0000-0000-0000-000000000007'::uuid,'الأبيض'),
 (476,490,'b2000000-0000-0000-0000-000000000008'::uuid,'سنار'),
 (491,500,'b2000000-0000-0000-0000-000000000009'::uuid,'دنقلا')
) AS t(n_from, n_to, hospital_id, city);

CREATE TEMP TABLE _last AS SELECT row_number() over () AS i, x.v AS v
FROM unnest(ARRAY['الماحي','الميرغني','البنا','الأمين','الترابي','عبدوله','الشيخ','المصطفى','دفع الله','النور','البشير','عبدالحميد']) x(v);

CREATE TEMP TABLE _fm AS SELECT row_number() over () AS i, x.v AS v
FROM unnest(ARRAY['عبدالرحمن','محمد','أحمد','عثمان','بابكر','عبدالله','أمين','الزين','حسن','إبراهيم','عيسى','يوسف','عز الدين','طه','حسين','خالد','جعفر','الطيب','مختار','الصديق','وليد','أنس','طارق','نصر الدين']) x(v);

CREATE TEMP TABLE _ff AS SELECT row_number() over () AS i, x.v AS v
FROM unnest(ARRAY['عزيزة','أمال','أمنية','مريم','مروة','رنا','أروى','وفاء','سمية','أمل','سلمى','فايزة','هبة','شيماء']) x(v);

CREATE TEMP TABLE _spec AS SELECT row_number() over () AS i, x.v AS v
FROM unnest(ARRAY[
 'أمراض القلب والشرايين','طب وجراحة الأسنان','طب الأطفال وحديثي الولادة','الجلدية والليزر والتجميل',
 'العظام والمفاصل','طب وجراحة العيون','أنف وأذن وحنجرة','الباطنية والجهاز الهضمي']) x(v);

CREATE TEMP TABLE _tl AS SELECT row_number() over () AS i, m, f
FROM (VALUES ('أخصائي','أخصائية'),('أخصائي أول','أخصائية أول'),('استشاري','استشارية'),('استشاري أول','استشارية أول')) x(m,f);

CREATE TEMP TABLE _docs AS
SELECT
  ('d1000000-0000-0000-0000-'::text || lpad(to_hex(n),12,'0'))::uuid AS id,
  n,
  CASE WHEN ((n * 7919) % 10) < 4 THEN 'female' ELSE 'male' END AS gender,
  r.hospital_id, r.city, sp.v AS specialization
FROM generate_series(1,500) n
JOIN _rng r  ON n BETWEEN r.n_from AND r.n_to
JOIN LATERAL (SELECT s.v FROM _spec s WHERE s.i = ((n % 8) + 1) LIMIT 1) sp ON true;

INSERT INTO public.doctors
 (id,user_id,name,name_en,specialization,consultation_fee,gender,title,city,rating,reviews_count,experience_years,telehealth,about,photo_url,hospital_id)
SELECT d.id, NULL,
  CASE WHEN d.gender='female'
    THEN (SELECT v FROM _ff WHERE i = ((d.n*97) % 14) + 1)
    ELSE (SELECT v FROM _fm WHERE i = ((d.n*97) % 24) + 1)
  END || ' ' || (SELECT v FROM _last WHERE i = ((d.n*31) % 12) + 1),
  NULL,
  d.specialization,
  200 + ((d.n*37) % 46) * 10,
  d.gender,
  CASE WHEN d.gender='female'
    THEN (SELECT f FROM _tl WHERE i = ((d.n*13) % 4) + 1)
    ELSE (SELECT m FROM _tl WHERE i = ((d.n*13) % 4) + 1)
  END,
  d.city,
  4.3 + ((d.n*13) % 7) * 0.1,
  15 + ((d.n*29) % 380),
  4 + ((d.n*11) % 31),
  (d.n % 5) = 0,
  d.specialization || ' — خبرة ' || (4 + ((d.n*11) % 31)) || ' عامًا في تقييم وعلاج الحالات الاعتيادية والمعقدة بمستشفى ' || d.city || '.',
  NULL,
  d.hospital_id
FROM _docs d;

-- 4) جدول الدوام الأسبوعي (day_of_week: 0=الأحد … 5=الجمعة مغلقة، 6=السبت)
INSERT INTO public.doctor_availability (doctor_id,day_of_week,start_time,end_time,is_enabled,slot_minutes)
SELECT id, dow, time '09:00', time '13:30', true, 30
FROM _docs d, generate_series(0,4) dow
UNION ALL
SELECT id, 6, time '10:00', time '13:00', true, 30
FROM _docs d
UNION ALL
SELECT id, dow, time '17:00', time '20:00', true, 30
FROM _docs d, generate_series(0,4) dow
WHERE (n % 3) <> 0;

-- 5) المواعيد: 14 يومًا للجميع + 15..29 يومًا لنسبة 40% فقط
INSERT INTO public.doctor_schedules (doctor_id, available_date, start_time, end_time, is_booked)
SELECT q.id, q.d, s.start_time, (s.start_time + interval '30 min')::time, false
FROM (
  SELECT d.id, d.n, (current_date + g)::date AS d, extract(isodow FROM (current_date + g))::int AS dowa
  FROM _docs d, generate_series(0,29) g
  WHERE g < 14 OR (g >= 14 AND ((d.n - 1) % 5) < 2)
) q,
LATERAL (
  SELECT (time '09:00' + k * interval '30 min')::time AS start_time FROM generate_series(0,5) k WHERE q.dowa <> 5
  UNION ALL
  SELECT (time '17:00' + k * interval '30 min')::time FROM generate_series(0,4) k WHERE q.dowa NOT IN (5,6)
) s;

-- 6) تأمينات (شركة أساسية + إضافية عند الاختلاف)
INSERT INTO public.doctor_insurances (doctor_id, insurance_id)
SELECT d.id, ('c1000000-0000-0000-0000-'::text || lpad(to_hex(((d.n - 1) % 7) + 1),12,'0'))::uuid
FROM _docs d
UNION ALL
SELECT d.id, ('c1000000-0000-0000-0000-'::text || lpad(to_hex(((d.n * 3) % 7) + 1),12,'0'))::uuid
FROM _docs d
WHERE ((d.n * 3) % 7) <> ((d.n - 1) % 7);

-- 7) الأطباء التسعة الأصليون يتبعون مستشفياتهم؛ الطبيب بلا مستشفى ينضم إلى الخرطوم
UPDATE public.doctors d SET city = h.city FROM public.hospitals h WHERE d.hospital_id = h.id;
UPDATE public.doctors SET city = 'الخرطوم', hospital_id = 'b1000000-0000-0000-0000-000000000001'
 WHERE id = 'd0000000-0000-0000-0000-000000000007' AND hospital_id IS NULL;
