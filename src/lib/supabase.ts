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

// --- doctors & schedules
export async function getDoctorsWithSchedules() {
  const c = getClient();
  const { data, error } = await c.from("doctors").select(`id,name,specialization,consultation_fee,doctor_schedules(id,available_date,start_time,end_time,is_booked)`).order("name");
  if (error) throw error;
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().split("T")[0];
  return (data || []).map((d: Record<string, unknown>) => {
    const schedules = ((d.doctor_schedules as unknown[]) || []).filter((s: unknown) => !(s as {is_booked:boolean}).is_booked && (s as {available_date:string}).available_date >= todayStr)
      .sort((a: unknown,b: unknown) => { const A=a as {available_date:string;start_time:string}, B=b as {available_date:string;start_time:string}; return A.available_date===B.available_date ? A.start_time.localeCompare(B.start_time) : A.available_date.localeCompare(B.available_date); });
    return { ...d, available_schedules: schedules };
  });
}
export async function listDoctors() {
  const { data, error } = await getClient().from("doctors").select("id,name,specialization,consultation_fee,user_id").order("name");
  if (error) throw error; return data || [];
}
export async function findDoctorByUser(userId: string) {
  const { data, error } = await getClient().from("doctors").select("id,name,specialization,consultation_fee,user_id").eq("user_id", userId).maybeSingle();
  if (error) throw error; return data || null;
}
export async function saveDoctor(p: { id?: string; name: string; specialization: string; consultationFee: number; userId?: string | null }) {
  const c = getClient();
  const payload = { name: p.name, specialization: p.specialization, consultation_fee: p.consultationFee, user_id: p.userId || null };
  const q = p.id ? c.from("doctors").update(payload).eq("id", p.id).select().single() : c.from("doctors").insert(payload).select().single();
  const { data, error } = await q; if (error) throw error; return data;
}
export async function deleteDoctor(doctorId: string) { const { error } = await getClient().from("doctors").delete().eq("id", doctorId); if (error) throw error; }
export async function listDoctorSchedules(doctorId: string) {
  const { data, error } = await getClient().from("doctor_schedules").select("id,available_date,start_time,end_time,is_booked").eq("doctor_id", doctorId).order("available_date").order("start_time");
  if (error) throw error; return data || [];
}
export async function createDoctorSchedule(p: { doctorId: string; availableDate: string; startTime: string; endTime: string }) {
  const { data, error } = await getClient().from("doctor_schedules").insert({ doctor_id: p.doctorId, available_date: p.availableDate, start_time: p.startTime, end_time: p.endTime }).select().single();
  if (error) throw error; return data;
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
export async function getPatientAppointments() {
  const c = getClient(); const { data: { user } } = await c.auth.getUser(); if (!user) return [];
  const { data, error } = await c.from("appointments").select(`id,schedule_id,patient_id,patient_name,patient_phone,status,doctor_schedules(id,available_date,start_time,end_time,doctors(id,name,specialization,consultation_fee))`).eq("patient_id", user.id).order("id", { ascending: false });
  if (error) throw error; return data || [];
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
// Replace semantics: wipe the doctor's rules then insert the current set.
export async function saveDoctorAvailability(doctorId: string, rules: Record<string,unknown>[]) {
  const c = getClient();
  const { error: delErr } = await c.from("doctor_availability").delete().eq("doctor_id", doctorId);
  if (delErr) throw delErr;
  if (!rules.length) return [];
  const { data, error } = await c.from("doctor_availability").insert(rules);
  if (error) throw error; return data;
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
export async function generateDoctorSchedule(doctorId: string, daysAhead = 90): Promise<{ created: number }> {
  const { data, error } = await getClient().rpc("generate_schedule_from_availability", { p_doctor_id: doctorId, p_start_date: new Date().toISOString().split("T")[0], p_end_date: new Date(Date.now()+daysAhead*86400000).toISOString().split("T")[0] });
  if (error) throw error;
  const row = Array.isArray(data) ? (data[0] as { created_slots?: number } | undefined) : (data as { created_slots?: number } | null);
  return { created: row?.created_slots ?? 0 };
}
export async function getAvailableSlots(doctorId: string, startDate: string, endDate: string) {
  const { data, error } = await getClient().from("doctor_schedules").select("id,available_date,start_time,end_time,is_booked").eq("doctor_id", doctorId).gte("available_date", startDate).lte("available_date", endDate).eq("is_booked", false).order("available_date, start_time");
  if (error) throw error; return data || [];
}
