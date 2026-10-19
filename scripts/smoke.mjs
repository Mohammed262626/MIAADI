// Smoke test: headless chrome per route, verifies each page boots without JS errors
// and paints content. Requires: built dist/ + static server on port 4173.
// Usage: npm run build && node scripts/smoke.mjs
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.slice(1);
const DIST = join(ROOT, "dist");
if (!existsSync(DIST)) { console.error("FAIL: dist/ missing — run npm run build first"); process.exit(1); }

const envFile = process.env.SMOKE_ENV || join(ROOT, "scripts", ".smoke.env");
if (!existsSync(envFile)) { console.error(`FAIL: ${envFile} missing — copy scripts/.smoke.env.example and fill it`); process.exit(1); }
const env = Object.fromEntries(readFileSync(envFile, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split("=", 2)));

const API_URL = env.SUPABASE_URL;
const API_KEY = env.SUPABASE_KEY;
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EMAIL = env.SMOKE_EMAIL;
const PASS = env.SMOKE_PASSWORD;
const STAFF_EMAIL = env.SMOKE_STAFF_EMAIL;

const firstDoctor = await (async () => {
  const r = await fetch(`${API_URL}/rest/v1/doctors?select=id&order=id&limit=1`, { headers: { apikey: API_KEY } });
  return (await r.json())?.[0]?.id || "";
})();

const routes = ["home", "doctors", `doctor/${firstDoctor}`, "appointments", "profile", "admin", "admin/manage"];

const probeTpl = `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>probe</title></head><body style="margin:0">
<iframe id="f" style="width:1470px;height:2300px;border:0" src="about:blank"></iframe>
<script>
const q = new URLSearchParams(location.search);
const email = q.get("email"), pass = q.get("pass"), route = q.get("route");
const waitMs = Number(q.get("wait") || "4500");
const F = document.getElementById("f"), D = document.title;
const errs = [];
window.addEventListener("error", (e) => errs.push(String(e.message)));
(async () => {
  const r = await fetch("${API_URL}/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: "${API_KEY}" },
    body: JSON.stringify({ email, password: pass }),
  });
  const session = await r.json();
  if (!session.access_token) { document.title = "AUTH FAIL:" + (session.error_description || session.msg || "unknown").slice(0, 120); return; }
  localStorage.setItem("sb-zneqnijqjwkpcjetgwfe-auth-token", JSON.stringify(session));
  F.src = "/#" + route;
  setTimeout(() => {
    try {
      const d = F.contentDocument;
      const len = (d.body.innerText || "").replace(/\\s+/g, " ").trim().length;
      document.title = ["LEN:" + len, "ROUTE:" + route, "ERRS:" + (errs.length ? errs.join("|").slice(0, 200) : "none")].join(" | ");
    } catch (e) { document.title = "DIAG:" + e.message; }
  }, waitMs);
})();
</script></body></html>`;

const probePath = join(DIST, "__smoke.html");
writeFileSync(probePath, probeTpl);

let failures = 0;
for (const route of routes) {
  const isStaff = route.startsWith("admin");
  const url = `http://localhost:4173/__smoke.html?route=${encodeURIComponent(route)}&email=${encodeURIComponent(isStaff ? STAFF_EMAIL : EMAIL)}&pass=${encodeURIComponent(PASS)}`;
  const out = join(DIST, "__smoke_dom.html");
  const cmd = `& '${CHROME}' --headless=old --disable-gpu --window-size=1470,2400 --virtual-time-budget=15000 --dump-dom '${url}' 2>$null | Out-File '${out}' -Encoding utf8`;
  spawnSync(process.env.SystemRoot + "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", ["-NoProfile", "-Command", cmd], { timeout: 60000 });
  const dom = existsSync(out) ? readFileSync(out, "utf8") : "";
  existsSync(out) && unlinkSync(out);
  const title = (dom.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").replace(/&lt;/g, "<");
  const len = Number(title.match(/LEN:(\d+)/)?.[1] || 0);
  const ok = len > 300 && title.includes("ERRS:none");
  console.log(`${ok ? "PASS" : "FAIL"} ${route} :: ${title.slice(0, 140)}`);
  if (!ok) failures++;
}

unlinkSync(probePath);
console.log(failures ? `SMOKE: ${failures} failing route(s)` : "SMOKE: all routes pass");
process.exit(failures ? 1 : 0);
