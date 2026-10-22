import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (client) return client;
  const { url, anonKey } = getSupabaseConfig();
  client = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
export function resetClient(): SupabaseClient { client = null; return getClient(); }

// --- auth
export async function registerPatient(p: { email: string; password: string; fullName: string; phone: string }) {
  const c = getClient();
  const { data, error } = await c.auth.signUp({ email: p.email, password: p.password, options: { data: { full_name: p.fullName, phone: p.phone, role: "patient" } } });
  if (error) throw error; return data;
}
export async function loginUser(p: { email: string; password: string }) {
  const c = getClient(); const { data, error } = await c.auth.signInWithPassword(p);
  if (error) throw error; return data;
}
export function onAuthChange(cb: (event: string, session: unknown) => void) {
  return getClient().auth.onAuthStateChange((event, session) => cb(event, session));
}
export async function logoutUser() { const { error } = await getClient().auth.signOut(); if (error) throw error; }
export async function getCurrentUser() {
  const c = getClient();
  const { data: { user } } = await c.auth.getUser();
  if (!user) return null;
  const { data: profile } = await c.from("profiles").select("id, full_name, phone, role").eq("id", user.id).maybeSingle();
  return { ...user, profile: profile || { full_name: (user.user_metadata as Record<string,string>)?.full_name || "مستخدم", phone: (user.user_metadata as Record<string,string>)?.phone || "", role: (user.user_metadata as Record<string,string>)?.role || "patient" } };
}
export async function updatePatientProfile(p: { fullName: string; phone: string }) {
  const c = getClient(); const { data: { user } } = await c.auth.getUser();
  if (!user) throw new Error("يجب تسجيل الدخول أولاً");
  const { error } = await c.from("profiles").update({ full_name: p.fullName, phone: p.phone, updated_at: new Date().toISOString() }).eq("id", user.id);
  if (error) throw error;
  await c.auth.updateUser({ data: { full_name: p.fullName, phone: p.phone } });
  return { success: true };
}

export async function updatePassword(password: string) {
  const { error } = await getClient().auth.updateUser({ password });
  if (error) throw error;
  return { success: true };
}

// --- doctors & schedules
// Loads doctors plus their free slots inside a rolling window (default 14 days).
// Filtering happens server-side so the catalog stays light as data grows; any
// date outside the window is fetched on demand via getAvailableSlots().
export async function getDoctorsWithSchedules(daysWindow = 14) {
  const c = getClient();
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().split("T")[0];
  const untilStr = new Date(Date.now() - new Date().getTimezoneOffset()*60000 + daysWindow*86400000).toISOString().split("T")[0];
  const { data, error } = await c.from("doctors")
    .select(`id,name,specialization,consultation_fee,doctor_schedules(id,available_date,start_time,end_time,is_booked)`)
    .gte("doctor_schedules.available_date", todayStr)
    .lte("doctor_schedules.available_date", untilStr)
    .eq("doctor_schedules.is_booked", false)
    .order("name");
  if (error) throw error;
  return (data || []).map((d: Record<string, unknown>) => {
    const schedules = ((d.doctor_schedules as unknown[]) || [])
      .filter((s: unknown) => !(s as {is_booked:boolean}).is_booked)
      .sort((a: unknown,b: unknown) => { const A=a as {available_date:string;start_time:string}, B=b as {available_date:string;start_time:string}; return A.available_date===B.available_date ? A.start_time.localeCompare(B.start_time) : A.available_date.localeCompare(B.available_date); });
    return { ...d, available_schedules: schedules };
  });
}
export type DoctorAdminRow = {
  id: string; name: string; name_en: string | null; title: string | null;
  specialization: string; consultation_fee: number; city: string | null;
  gender: string | null; languages: string[]; experience_years: number | null;
  telehealth: boolean; about: string | null; photo_url: string | null;
  user_id: string | null; hospital_id: string | null;
};
export async function listDoctors(): Promise<DoctorAdminRow[]> {
  const { data, error } = await getClient().from("doctors")
    .select("id,name,name_en,title,specialization,consultation_fee,city,gender,languages,experience_years,telehealth,about,photo_url,user_id,hospital_id")
    .order("name");
  if (error) throw error; return (data as DoctorAdminRow[]) || [];
}

/** Hospital options for the admin doctor editor (hospitals are admin-managed). */
export async function listHospitals() {
  const { data, error } = await getClient().from("hospitals").select("id,name,city").order("name");
  if (error) throw error;
  return (data as { id: string; name: string; city: string | null }[]) || [];
}

// --- public directory (rich rows for the home page & catalog)
export type DirectorySlot = { id: string; available_date: string; start_time: string; end_time: string };
export type DoctorDirectoryRow = {
  id: string; name: string; specialization: string; consultation_fee: number;
  title: string | null; gender: string | null; city: string | null;
  rating: number | null; reviews_count: number | null; experience_years: number | null; telehealth: boolean;
  photo_url: string | null; hospital_name: string | null; hospital_city: string | null;
  insurances: string[]; available_schedules: DirectorySlot[];
};


// Short-lived memo for the public directory (see getDoctorsDirectory).
const directoryCache = new Map<string, { at: number; rows: DoctorDirectoryRow[] }>();
const DIRECTORY_TTL_MS = 30_000;

// Doctors joined with hospital, insurers and only their earliest free slots
// (server-capped via the top-slots RPC) inside a window. Doctors with no free
// slot in the window are intentionally omitted from the public catalog.
export async function getDoctorsDirectory(daysWindow = 7, slotsPerDoctor = 9, opts: { fresh?: boolean } = {}): Promise<DoctorDirectoryRow[]> {
  // Navigating between #home / #doctors / #hospitals re-renders the page and
  // would re-fetch the whole directory each time. Keep it for a short window;
  // realtime appointment events invalidate it so slots never go stale.
  const cacheKey = `${daysWindow}:${slotsPerDoctor}`;
  const hit = directoryCache.get(cacheKey);
  if (!opts.fresh && hit && Date.now() - hit.at < DIRECTORY_TTL_MS) return hit.rows;
  const { data, error } = await getClient().rpc("get_doctors_directory_top_slots", {
    p_days_window: daysWindow,
    p_slots_per_doctor: slotsPerDoctor,
  });
  if (error) throw error;
  const rows = (((data as unknown) as Record<string, any>[]) || []).map((r) => {
    const slots = (r.available_schedules || []) as { id: string; available_date: string; start_time: string; end_time: string }[];
    return {
      id: String(r.id), name: String(r.name), specialization: String(r.specialization),
      consultation_fee: Number(r.consultation_fee), title: r.title ?? null, gender: r.gender ?? null,
      city: r.city ?? null, rating: r.rating === null || r.rating === undefined ? null : Number(r.rating),
      reviews_count: r.reviews_count ?? null, experience_years: r.experience_years ?? null,
      telehealth: Boolean(r.telehealth), photo_url: r.photo_url ?? null,
      hospital_name: r.hospital_name ?? null, hospital_city: r.hospital_city ?? null,
      insurances: ((r.insurances || []) as string[]).filter(Boolean),
      available_schedules: slots.map((s) => ({ id: s.id, available_date: s.available_date, start_time: s.start_time, end_time: s.end_time })),
    };
  });
  directoryCache.set(cacheKey, { at: Date.now(), rows });
  return rows;
}

/* Called when realtime appointment events land, so the next render refetches. */
export function invalidateDoctorsDirectory(): void {
  directoryCache.clear();
}

// Lightweight specialization list used to fill the home page specialty tiles.
export async function getDoctorSpecializations(): Promise<string[]> {
  const { data, error } = await getClient().from("doctors").select("specialization");
  if (error) throw error;
  return ((data || []) as { specialization?: string }[]).map((d) => String(d.specialization || ""));
}

// --- doctor profile page (#doctor/:id)
export type DoctorProfileRow = {
  id: string; name: string; name_en: string | null; title: string | null;
  specialization: string; consultation_fee: number; city: string | null; gender: string | null;
  languages: string[]; rating: number; reviews_count: number; experience_years: number | null;
  telehealth: boolean; about: string | null; photo_url: string | null;
  hospital_name: string | null; hospital_city: string | null; hospital_address: string | null;
  insurances: string[];
};
export type ProfileSlot = { id: string; available_date: string; start_time: string; end_time: string; is_booked: boolean };

export async function getDoctorProfile(doctorId: string): Promise<DoctorProfileRow | null> {
  const { data, error } = await getClient().from("doctors")
    .select(`id,name,name_en,title,specialization,consultation_fee,city,gender,languages,rating,reviews_count,experience_years,telehealth,about,photo_url,
             hospitals(name,city,address),
             doctor_insurances(insurance_companies(name))`)
    .eq("id", doctorId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = data as Record<string, any>;   // eslint-disable-line @typescript-eslint/no-explicit-any
  const hosp = (r.hospitals || null) as { name?: string; city?: string; address?: string } | null;
  const insurances = ((r.doctor_insurances || []) as { insurance_companies?: { name?: string } }[])
    .map((x) => x.insurance_companies?.name).filter((n): n is string => Boolean(n));
  return {
    id: String(r.id), name: String(r.name), name_en: r.name_en ?? null, title: r.title ?? null,
    specialization: String(r.specialization), consultation_fee: Number(r.consultation_fee),
    city: r.city ?? null, gender: r.gender ?? null, languages: (r.languages || []) as string[],
    rating: r.rating === null || r.rating === undefined ? 0 : Number(r.rating),
    reviews_count: r.reviews_count ?? 0, experience_years: r.experience_years ?? null,
    telehealth: Boolean(r.telehealth), about: r.about ?? null, photo_url: r.photo_url ?? null,
    hospital_name: hosp?.name ?? null, hospital_city: hosp?.city ?? null, hospital_address: hosp?.address ?? null,
    insurances,
  };
}

// Every slot in the window (free and booked) so the profile page can show taken
// times struck through, exactly like the reference screen.
export async function getDoctorProfileSlots(doctorId: string, startDate: string, endDate: string): Promise<ProfileSlot[]> {
  const { data, error } = await getClient().from("doctor_schedules")
    .select("id,available_date,start_time,end_time,is_booked")
    .eq("doctor_id", doctorId).gte("available_date", startDate).lte("available_date", endDate)
    .order("available_date", { ascending: true }).order("start_time", { ascending: true });
  if (error) throw error;
  return (data || []) as ProfileSlot[];
}

export async function findDoctorByUser(userId: string) {
  const { data, error } = await getClient().from("doctors").select("id,name,specialization,consultation_fee,user_id").eq("user_id", userId).maybeSingle();
  if (error) throw error; return data || null;
}
export async function saveDoctor(p: {
  id?: string; name: string; nameEn?: string | null; title?: string | null;
  specialization: string; consultationFee: number; userId?: string | null;
  city?: string | null; gender?: string | null; experienceYears?: number | null;
  telehealth?: boolean; about?: string | null; languages?: string[];
  photoUrl?: string | null; hospitalId?: string | null;
}) {
  const c = getClient();
  const payload = {
    name: p.name, name_en: p.nameEn || null, title: p.title || null,
    specialization: p.specialization, consultation_fee: p.consultationFee,
    user_id: p.userId || null, city: p.city || null, gender: p.gender || null,
    experience_years: p.experienceYears ?? null, telehealth: !!p.telehealth,
    about: p.about || null, languages: p.languages ?? [], photo_url: p.photoUrl || null,
    hospital_id: p.hospitalId || null,
  };
  const q = p.id ? c.from("doctors").update(payload).eq("id", p.id).select().single() : c.from("doctors").insert(payload).select().single();
  const { data, error } = await q; if (error) throw error; return data;
}
export async function deleteDoctor(doctorId: string) { const { error } = await getClient().from("doctors").delete().eq("id", doctorId); if (error) throw error; }
export async function listDoctorSchedules(doctorId: string) {
  const { data, error } = await getClient().from("doctor_schedules").select("id,available_date,start_time,end_time,is_booked").eq("doctor_id", doctorId).order("available_date").order("start_time");
  if (error) throw error; return data || [];
}
/** Insert many slots in one request (a manual shift expands into slot-length cells). */
export async function createDoctorSchedules(rows: { doctorId: string; availableDate: string; startTime: string; endTime: string }[]) {
  if (!rows.length) return;
  const { error } = await getClient().from("doctor_schedules").insert(rows.map((r) => ({ doctor_id: r.doctorId, available_date: r.availableDate, start_time: r.startTime, end_time: r.endTime })));
  if (error) throw error;
}
export async function deleteDoctorSchedule(scheduleId: string) { const { error } = await getClient().from("doctor_schedules").delete().eq("id", scheduleId); if (error) throw error; }

// --- appointments RPCs
export async function bookAppointmentRPC(p: { scheduleId: string; patientName: string; patientPhone: string }) {
  const { data, error } = await getClient().rpc("book_appointment", { p_schedule_id: p.scheduleId, p_patient_name: p.patientName, p_patient_phone: p.patientPhone });
  if (error) throw error; return data;
}
export async function cancelAppointmentRPC(appointmentId: string) {
  const { data, error } = await getClient().rpc("cancel_appointment", { p_appointment_id: appointmentId });
  if (error) throw error; return data;
}
export async function rescheduleAppointmentRPC(p: { appointmentId: string; newScheduleId: string }) {
  const { data, error } = await getClient().rpc("reschedule_appointment", { p_appointment_id: p.appointmentId, p_new_schedule_id: p.newScheduleId });
  if (error) throw error; return data;
}
export async function cancelAppointmentClinic(appointmentId: string) {
  const { data, error } = await getClient().rpc("cancel_appointment_clinic", { p_appointment_id: appointmentId });
  if (error) throw error; return data;
}
export async function updateAppointmentState(appointmentId: string, state: string) {
  const { data, error } = await getClient().rpc("admin_update_appointment_state", { p_appointment_id: appointmentId, p_state: state });
  if (error) throw error; return data;
}
export async function adminRescheduleAppointmentRPC(p: { appointmentId: string; newScheduleId: string }) {
  const { data, error } = await getClient().rpc("admin_reschedule_appointment", { p_appointment_id: p.appointmentId, p_new_schedule_id: p.newScheduleId });
  if (error) throw error; return data;
}
export async function adminDeleteAppointmentRPC(appointmentId: string) {
  const { data, error } = await getClient().rpc("admin_delete_appointment", { p_appointment_id: appointmentId });
  if (error) throw error; return data;
}
export async function getPatientAppointments() {
  const c = getClient(); const { data: { user } } = await c.auth.getUser(); if (!user) return [];
  const { data, error } = await c.from("appointments").select(`id,schedule_id,patient_id,patient_name,patient_phone,status,doctor_schedules(id,available_date,start_time,end_time,doctors(id,name,specialization,consultation_fee,telehealth,hospitals(name)))`).eq("patient_id", user.id).order("id", { ascending: false });
  if (error) throw error; return data || [];
}
// --- hospitals directory (#hospitals)
export type HospitalRow = {
  id: string;
  name: string;
  city: string | null;
  kind: string;
  address: string | null;
};

export async function getHospitalsDirectory(): Promise<HospitalRow[]> {
  const { data, error } = await getClient()
    .from("hospitals")
    .select("id,name,city,kind,address")
    .order("name");
  if (error) throw error;
  return (data || []) as HospitalRow[];
}

// --- reviews (real, appointment-verified rows written through submit_doctor_review)
export type DoctorReview = {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function getDoctorReviews(doctorId: string, limit = 50): Promise<DoctorReview[]> {
  const { data, error } = await getClient()
    .from("doctor_reviews")
    .select("id,appointment_id,doctor_id,patient_id,patient_name,rating,comment,created_at")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as DoctorReview[];
}

// The most recent completed visit with this doctor that has not been reviewed
// yet. Client-side hint only: submit_doctor_review re-checks the same facts.
export async function getReviewableAppointmentId(doctorId: string): Promise<string | null> {
  const c = getClient();
  const { data: { user } } = await c.auth.getUser();
  if (!user) return null;
  const { data: appts, error } = await c.from("appointments")
    .select("id,schedule_id,created_at,doctor_schedules!inner(doctor_id)")
    .eq("patient_id", user.id)
    .eq("status", "completed")
    .eq("doctor_schedules.doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (appts || []).map((a: { id: string }) => a.id);
  if (!ids.length) return null;
  const { data: reviewed, error: reviewError } = await c.from("doctor_reviews")
    .select("appointment_id")
    .in("appointment_id", ids);
  if (reviewError) throw reviewError;
  const done = new Set((reviewed || []).map((r: { appointment_id: string }) => r.appointment_id));
  return ids.find((id: string) => !done.has(id)) || null;
}

export async function getReviewedAppointmentIds(): Promise<Set<string>> {
  const c = getClient();
  const { data: { user } } = await c.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await c.from("doctor_reviews")
    .select("appointment_id")
    .eq("patient_id", user.id);
  if (error) throw error;
  return new Set((data || []).map((r: { appointment_id: string }) => r.appointment_id));
}

export async function submitDoctorReview(p: { appointmentId: string; rating: number; comment: string }) {
  const { data, error } = await getClient().rpc("submit_doctor_review", {
    p_appointment_id: p.appointmentId,
    p_rating: p.rating,
    p_comment: p.comment.trim() || null,
  });
  if (error) throw error;
  return data;
}

export function subscribeToRealtimeUpdates(onSchedule: (p: unknown)=>void, onAppointment: (p: unknown)=>void) {
  const c = getClient();
  const ch = c.channel("medical-booking-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "doctor_schedules" }, (payload) => onSchedule(payload))
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => onAppointment(payload))
    .subscribe();
  return () => { c.removeChannel(ch); };
}

// --- admin
export async function assignUserRole(userId: string, role: string) {
  const { data, error } = await getClient().rpc("admin_set_role", { p_user_id: userId, p_role: role }); if (error) throw error; return data;
}
export async function adminListProfiles() {
  const { data, error } = await getClient().rpc("admin_list_profiles"); if (error) throw error; return data || [];
}
function toSearchPattern(v: string) { const clean = String(v).replace(/[%_*.,\\]/g," ").replace(/\s+/g," ").trim(); return clean ? `*${clean}*` : null; }
// supabase-js builder generics are untyped here (no generated DB types) — flatten to any
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getAdminAppointments(p: { status?: string; statuses?: string[]; doctorId?: string; dateFrom?: string; dateTo?: string; search?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: string } = {}) {
  const c = getClient();
  const allowed = ["available_date","booked_at","doctor_name","patient_name","start_time","status"];
  const col = allowed.includes(p.sortBy || "") ? p.sortBy! : "available_date";
  const asc = p.sortDir === "asc";
  let query: any = c.from("appointments_with_details").select("*", { count: "exact" });
  if (Array.isArray(p.statuses) && p.statuses.length) query = query.in("status", p.statuses);
  else if (p.status) query = query.eq("status", p.status);
  if (p.doctorId) query = query.eq("doctor_id", p.doctorId);
  if (p.dateFrom) query = query.gte("available_date", p.dateFrom);
  if (p.dateTo) query = query.lte("available_date", p.dateTo);
  const s = (p.search || "").trim();
  if (s) { const pat = toSearchPattern(s); if (pat) query = query.or(`patient_name.ilike.${pat},patient_phone.ilike.${pat}`); }
  const page = Math.max(0, p.page || 0), pageSize = p.pageSize || 50;
  const from = page*pageSize, to = from+pageSize-1;
  const { data, count, error } = await query.order(col, { ascending: asc, nullsFirst: false }).range(from, to);
  if (error) throw error; return { rows: (data as unknown[]) || [], total: count ?? 0 };
}
export async function getAdminStats() {
  const c = getClient();
  const today = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().split("T")[0];
  const countOf = async (f: Promise<{count:number|null;error:unknown}>) => { const r = await f as unknown as {count:number|null;error:unknown}; return r.error ? 0 : r.count || 0; };
  const base = () => c.from("appointments_with_details").select("*", { count:"exact", head:true }) as unknown as Promise<{count:number|null;error:unknown}>;
  const [total, booked, completed, cancelled, noShow, todayCount] = await Promise.all([
    countOf(base() as unknown as Promise<{count:number|null;error:unknown}>),
    countOf(c.from("appointments_with_details").select("*",{count:"exact",head:true}).eq("status","booked") as unknown as Promise<{count:number|null;error:unknown}>),
    countOf(c.from("appointments_with_details").select("*",{count:"exact",head:true}).eq("status","completed") as unknown as Promise<{count:number|null;error:unknown}>),
    countOf(c.from("appointments_with_details").select("*",{count:"exact",head:true}).in("status",["cancelled_by_patient","cancelled_by_clinic"]) as unknown as Promise<{count:number|null;error:unknown}>),
    countOf(c.from("appointments_with_details").select("*",{count:"exact",head:true}).eq("status","no_show") as unknown as Promise<{count:number|null;error:unknown}>),
    countOf(c.from("appointments_with_details").select("*",{count:"exact",head:true}).eq("status","booked").gte("available_date",today).lte("available_date",today) as unknown as Promise<{count:number|null;error:unknown}>),
  ]);
  return { total, booked, completed, cancelled, noShow, today: todayCount };
}

// --- availability (phase1)
export async function getDoctorAvailability(doctorId: string) {
  const { data, error } = await getClient().from("doctor_availability").select("*").eq("doctor_id", doctorId).order("day_of_week");
  if (error) throw error; return data || [];
}
// Replace semantics, made safe: insert the new set first, then delete the old
// rows — a failed insert can never leave the doctor with no availability at all.
export async function saveDoctorAvailability(doctorId: string, rules: Record<string,unknown>[]) {
  const c = getClient();
  const { data: old, error: readErr } = await c.from("doctor_availability").select("id").eq("doctor_id", doctorId);
  if (readErr) throw readErr;
  let inserted: unknown[] = [];
  if (rules.length) {
    const { data, error } = await c.from("doctor_availability").insert(rules).select();
    if (error) throw error;
    inserted = (data as unknown[]) || [];
  }
  const ids = ((old as { id: string }[] | null) || []).map((r) => r.id);
  if (ids.length) {
    const { error } = await c.from("doctor_availability").delete().in("id", ids);
    if (error) throw error;
  }
  return inserted;
}
export async function listBlockedDates(doctorId: string) {
  const { data, error } = await getClient().from("doctor_unavailable").select("id,start_date,end_date,reason").eq("doctor_id", doctorId).order("start_date", { ascending: false });
  if (error) throw error; return data || [];
}
export async function unblockDoctorDates(id: string) {
  const { error } = await getClient().from("doctor_unavailable").delete().eq("id", id);
  if (error) throw error;
}
// Records the leave and clears future, unbooked slots inside the range; returns how many were freed.
export async function blockDoctorDates(doctorId: string, startDate: string, endDate: string, reason?: string) {
  const { data, error } = await getClient().rpc("block_doctor_dates", { p_doctor_id: doctorId, p_start_date: startDate, p_end_date: endDate, p_reason: reason ?? null });
  if (error) throw error; return { deleted: typeof data === "number" ? data : 0 } as { deleted: number };
}
export async function generateDoctorSchedule(doctorId: string, daysAhead = 90, replace = false): Promise<{ created: number }> {
  const { data, error } = await getClient().rpc("generate_schedule_from_availability", { p_doctor_id: doctorId, p_start_date: new Date().toISOString().split("T")[0], p_end_date: new Date(Date.now()+daysAhead*86400000).toISOString().split("T")[0], p_replace: replace });
  if (error) throw error;
  const row = Array.isArray(data) ? (data[0] as { created_slots?: number } | undefined) : (data as { created_slots?: number } | null);
  return { created: row?.created_slots ?? 0 };
}
export async function getAvailableSlots(doctorId: string, startDate: string, endDate: string) {
  const { data, error } = await getClient().from("doctor_schedules").select("id,available_date,start_time,end_time,is_booked").eq("doctor_id", doctorId).gte("available_date", startDate).lte("available_date", endDate).eq("is_booked", false).order("available_date, start_time");
  if (error) throw error; return data || [];
}
// Housekeeping: drop unbooked slots whose date has already passed.
// Delegates to the same SQL function the pg_cron job runs daily; rows that are
// still referenced by an appointment (FK) are skipped server-side.
export async function purgeExpiredSlots(): Promise<number> {
  const { data, error } = await getClient().rpc("purge_expired_doctor_slots");
  if (error) throw error;
  const row = Array.isArray(data) ? (data[0] as { deleted?: number } | null) : (data as { deleted?: number } | null);
  return row?.deleted ?? 0;
}
