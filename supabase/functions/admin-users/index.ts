// Admin-only account management. Deployed as `admin-users`.
//
// Actions: create | update | password | delete
//
// Why a function: creating/deleting Supabase Auth users needs the Admin API and
// the service-role key, which must never reach the browser. The key stays in
// this function; every call is authenticated with the caller's JWT and then
// checked against their profile role.
//
// Deploy:  supabase functions deploy admin-users
// Secrets: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
//          injected automatically by the Supabase runtime.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const fail = (code: string, status = 400) => json({ error: code }, status);

const ROLES = new Set(["patient", "doctor", "admin"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("method_not_allowed", 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return fail("not_configured", 500);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return fail("unauthorized", 401);

  // Identify the caller from their own JWT (never trust a client-sent id).
  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  const caller = callerData?.user;
  if (callerError || !caller) return fail("unauthorized", 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .maybeSingle();
  if (callerProfile?.role !== "admin") return fail("forbidden", 403);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return fail("invalid_json");
  }

  const action = String(body.action || "");
  const userId = String(body.userId || "").trim();

  if (action === "create") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const role = String(body.role || "patient");

    if (!EMAIL.test(email)) return fail("invalid_email");
    if (password.length < MIN_PASSWORD) return fail("weak_password");
    if (fullName.length < 2) return fail("invalid_name");
    if (!ROLES.has(role)) return fail("invalid_role");

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      const taken = msg.includes("already") || msg.includes("exists") || msg.includes("registered");
      return fail(taken ? "email_taken" : "create_failed", taken ? 409 : 400);
    }

    const id = created.user?.id;
    if (!id) return fail("create_failed", 500);

    // The on_auth_user_created trigger inserts a patient profile. Name/phone can
    // be written with the service role, but `profiles.role` is protected by the
    // guard_profile_role trigger (it requires auth.uid() to be an admin), so the
    // role goes through admin_set_role with the caller's own JWT.
    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", id);
    if (profileError) {
      // Never leave a half-created account behind.
      await admin.auth.admin.deleteUser(id);
      return fail("profile_failed", 400);
    }

    if (role !== "patient") {
      const { error: roleError } = await callerClient.rpc("admin_set_role", {
        p_user_id: id,
        p_role: role,
      });
      if (roleError) {
        await admin.auth.admin.deleteUser(id);
        return fail("profile_failed", 400);
      }
    }

    return json({ user_id: id });
  }

  if (!userId) return fail("missing_user");

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (action === "update") {
    if (!target) return fail("not_found", 404);
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    if (fullName.length < 2) return fail("invalid_name");

    const { error } = await admin
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", userId);
    if (error) return fail("update_failed", 400);

    // Keep auth metadata aligned so future sign-ups/trigger runs stay in sync.
    try {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: fullName, phone },
      });
    } catch {
      /* metadata is secondary — the profile is the source of truth */
    }
    return json({ ok: true });
  }

  if (action === "password") {
    if (!target) return fail("not_found", 404);
    const password = String(body.password || "");
    if (password.length < MIN_PASSWORD) return fail("weak_password");

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return fail("password_failed", 400);
    return json({ ok: true });
  }

  if (action === "delete") {
    if (userId === caller.id) return fail("self_delete", 400);
    if (!target) return fail("not_found", 404);

    if (target.role === "admin") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) return fail("last_admin", 409);
    }

    // Cascades: profile row is removed; doctors.user_id becomes NULL, so the
    // doctor row, calendar and appointments survive an account deletion.
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return fail("delete_failed", 400);
    return json({ ok: true });
  }

  return fail("unknown_action", 400);
});
