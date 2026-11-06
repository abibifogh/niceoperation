/* ===========================================================================
   The guide is still one static file. This Worker sits in front of it and
   does three things the file cannot do on its own:

     1. Injects the live driver list into the page before it is sent, so the
        guide stays a single self-contained document with everything inline.
        No fetch from the browser, so the offline promise survives intact.
     2. Counts what guests look at, from one small beacon per visit.
     3. Serves the portal at /admin, behind Cloudflare Access.

   Everything else is handed straight to the static assets.
   =========================================================================== */

import { ADMIN_PAGE } from "./admin-page.js";

/* The beacon accepts these and nothing else. A public endpoint that takes
   arbitrary keys is a public endpoint for filling a database with rubbish. */
const KINDS = ["visit", "place", "route", "interest", "driver", "section"];
const MAX_KEY = 64;
const MAX_BATCH = 40;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/hit") return hit(request, env, ctx);
      if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
        return admin(request, env, url);
      }
      return page(request, env);
    } catch (e) {
      /* A broken database must never take the guide down with it. */
      if (url.pathname.startsWith("/admin") || url.pathname === "/api/hit") {
        return json({ error: String(e && e.message || e) }, 500);
      }
      return env.ASSETS.fetch(request);
    }
  }
};

/* --- the public page ----------------------------------------------------- */

async function page(request, env) {
  const res = await env.ASSETS.fetch(request);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;

  let html = await res.text();
  if (!html.includes("/*__DRIVERS__*/")) return htmlRes(html, res);

  const live = await drivers(env).catch(() => null);
  /* No database yet, or nothing in it: the page keeps whatever is baked in,
     which is how this deploys cleanly before the portal is set up. */
  if (live && live.length) {
    html = html.replace(
      /\/\*__DRIVERS__\*\/[\s\S]*?\/\*__END_DRIVERS__\*\//,
      "/*__DRIVERS__*/" + JSON.stringify(live) + "/*__END_DRIVERS__*/"
    );
  }
  return htmlRes(html, res);
}

function htmlRes(body, from) {
  const h = new Headers(from.headers);
  h.delete("content-length");
  h.set("cache-control", "public, max-age=60");
  return new Response(body, { status: from.status, headers: h });
}

async function drivers(env) {
  if (!env.DB) return null;
  const { results } = await env.DB
    .prepare("SELECT * FROM drivers WHERE live = 1 ORDER BY pos ASC, n ASC")
    .all();
  return (results || []).map(toPublic);
}

/* What the page gets. A driver who asked us not to publish their number does
   not have it in the HTML at all, rather than hidden by CSS. */
function toPublic(r) {
  const via = !!r.via;
  return {
    id: r.id, n: r.n,
    ph: via ? "" : (r.ph || ""), wa: via ? "" : (r.wa || ""),
    car: r.car || "", star: r.star || 2, since: r.since || null,
    runs: parse(r.runs, []), langs: r.langs || "",
    flex: r.flex || "", rates: parse(r.rates, []), via
  };
}
function parse(s, fallback) {
  try { const v = JSON.parse(s); return v == null ? fallback : v; } catch (e) { return fallback; }
}

/* --- the beacon ---------------------------------------------------------- */

async function hit(request, env, ctx) {
  if (request.method !== "POST") return json({ error: "POST only" }, 405);
  /* Same-origin only. Not a security boundary, just a door that is shut. */
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ error: "no" }, 403);
  }
  if (!env.DB) return json({ ok: true, stored: false });

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }
  const rows = Array.isArray(body && body.e) ? body.e.slice(0, MAX_BATCH) : [];
  const day = today();

  const stmts = [];
  const seen = new Set();
  for (const r of rows) {
    const kind = String(r && r.k || "");
    if (KINDS.indexOf(kind) < 0) continue;
    const key = String(r && r.v || "-").slice(0, MAX_KEY);
    const dedupe = kind + "\u0000" + key;
    if (seen.has(dedupe)) continue;      /* one count per thing per visit */
    seen.add(dedupe);
    stmts.push(env.DB.prepare(
      "INSERT INTO events (day, kind, k, n) VALUES (?1, ?2, ?3, 1) " +
      "ON CONFLICT(day, kind, k) DO UPDATE SET n = n + 1"
    ).bind(day, kind, key));
  }
  if (!stmts.length) return json({ ok: true, stored: false });

  const work = ensure(env).then(() => env.DB.batch(stmts));
  if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
  return json({ ok: true, stored: true });
}

function today() { return new Date().toISOString().slice(0, 10); }

/* --- the portal ---------------------------------------------------------- */

async function admin(request, env, url) {
  const who = await identify(request, env);
  if (!who.ok) {
    return new Response(who.why, {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
    });
  }
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    return new Response(ADMIN_PAGE.replace("__WHO__", esc(who.email)), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
    });
  }
  if (!env.DB) return json({ error: "No database is bound to this Worker yet." }, 503);
  await ensure(env);

  if (url.pathname === "/admin/api/stats") return stats(env, url);
  if (url.pathname === "/admin/api/drivers") {
    if (request.method === "GET") {
      const { results } = await env.DB
        .prepare("SELECT * FROM drivers ORDER BY pos ASC, n ASC").all();
      return json({ drivers: (results || []).map(toAdmin) });
    }
    if (request.method === "POST") return save(request, env, who);
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id") || "";
      await env.DB.prepare("DELETE FROM drivers WHERE id = ?1").bind(id).run();
      return json({ ok: true });
    }
  }
  return json({ error: "not found" }, 404);
}

function toAdmin(r) {
  return {
    id: r.id, n: r.n, ph: r.ph || "", wa: r.wa || "", car: r.car || "",
    runs: parse(r.runs, []), flex: r.flex || "", langs: r.langs || "",
    since: r.since, star: r.star || 2, rates: parse(r.rates, []),
    via: !!r.via, pos: r.pos || 0, live: r.live == null ? 1 : r.live,
    updated: r.updated || ""
  };
}

async function save(request, env, who) {
  let d;
  try { d = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }

  const name = str(d.n, 90);
  if (!name) return json({ error: "A driver needs a name." }, 400);

  const id = str(d.id, 40) || slug(name) + "-" + Math.random().toString(36).slice(2, 6);
  const runs = Array.isArray(d.runs)
    ? d.runs.map(x => str(x, 40)).filter(Boolean).slice(0, 12) : [];
  const rates = Array.isArray(d.rates)
    ? d.rates.map(r => ({ w: str(r && r.w, 60), p: str(r && r.p, 30) }))
             .filter(r => r.w || r.p).slice(0, 8) : [];

  await env.DB.prepare(
    "INSERT INTO drivers (id,n,ph,wa,car,runs,flex,langs,since,star,rates,via,pos,live,updated) " +
    "VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15) " +
    "ON CONFLICT(id) DO UPDATE SET n=?2,ph=?3,wa=?4,car=?5,runs=?6,flex=?7,langs=?8," +
    "since=?9,star=?10,rates=?11,via=?12,pos=?13,live=?14,updated=?15"
  ).bind(
    id, name, str(d.ph, 30), digits(d.wa), str(d.car, 120),
    JSON.stringify(runs), str(d.flex, 900), str(d.langs, 120),
    int(d.since, 1990, 2100), int(d.star, 1, 3) || 2,
    JSON.stringify(rates), d.via ? 1 : 0, int(d.pos, 0, 999) || 0,
    d.live === false ? 0 : 1,
    new Date().toISOString().slice(0, 16).replace("T", " ") + " by " + who.email
  ).run();

  return json({ ok: true, id });
}

function str(v, max) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max); }
function digits(v) { return String(v == null ? "" : v).replace(/\D/g, "").slice(0, 20); }
function int(v, lo, hi) { const n = parseInt(v, 10); return isNaN(n) ? null : Math.min(hi, Math.max(lo, n)); }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "d"; }

/* --- what guests looked at ------------------------------------------------ */

async function stats(env, url) {
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days"), 10) || 30));
  const from = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

  const [visits, top] = await Promise.all([
    env.DB.prepare(
      "SELECT day, n FROM events WHERE kind = 'visit' AND day >= ?1 ORDER BY day ASC"
    ).bind(from).all(),
    env.DB.prepare(
      "SELECT kind, k, SUM(n) AS n FROM events WHERE kind != 'visit' AND day >= ?1 " +
      "GROUP BY kind, k ORDER BY n DESC"
    ).bind(from).all()
  ]);

  const by = {};
  for (const r of (top.results || [])) {
    (by[r.kind] = by[r.kind] || []).push({ k: r.k, n: r.n });
  }
  for (const k in by) by[k] = by[k].slice(0, 25);

  const series = visits.results || [];
  return json({
    days,
    total: series.reduce((s, r) => s + r.n, 0),
    series,
    by
  });
}

/* --- who is asking -------------------------------------------------------- */
/* Cloudflare Access puts a signed token on every request it lets through. We
   verify it here as well, so that a mistake in the Access rules cannot leave
   the portal open: with nothing configured, this refuses everybody. */

let KEYS = null, KEYS_AT = 0;

async function identify(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || "").trim();
  const aud = (env.ACCESS_AUD || "").trim();
  if (!team || !aud) {
    return { ok: false, why: "The portal is not set up yet: this Worker has no ACCESS_TEAM_DOMAIN and ACCESS_AUD. See guide/PORTAL-SETUP.md." };
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, why: "Open this page through the normal address so Cloudflare can sign you in." };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, why: "Sign-in token is malformed." };
  let head, claims;
  try {
    head = JSON.parse(b64(parts[0]));
    claims = JSON.parse(b64(parts[1]));
  } catch (e) { return { ok: false, why: "Sign-in token is unreadable." }; }

  const iss = "https://" + team;
  if (claims.iss !== iss) return { ok: false, why: "Sign-in token is for a different account." };
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (auds.indexOf(aud) < 0) return { ok: false, why: "Sign-in token is for a different application." };
  const now = Math.floor(Date.now() / 1000);
  if (!claims.exp || claims.exp < now) return { ok: false, why: "Sign-in has expired. Reload the page." };

  const key = await publicKey(iss, head.kid);
  if (!key) return { ok: false, why: "Could not check the sign-in token." };
  const sig = bytes(parts[2]);
  const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const good = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
  if (!good) return { ok: false, why: "Sign-in token did not verify." };

  return { ok: true, email: String(claims.email || "signed in") };
}

async function publicKey(iss, kid) {
  if (!KEYS || Date.now() - KEYS_AT > 36e5) {
    const r = await fetch(iss + "/cdn-cgi/access/certs");
    if (!r.ok) return null;
    KEYS = await r.json();
    KEYS_AT = Date.now();
  }
  const jwk = (KEYS.keys || []).filter(k => k.kid === kid)[0];
  if (!jwk) return null;
  return crypto.subtle.importKey(
    "jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
}

function b64(s) {
  return new TextDecoder().decode(bytes(s));
}
function bytes(s) {
  const t = s.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(t + "=".repeat((4 - t.length % 4) % 4));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/* --- plumbing ------------------------------------------------------------- */

let READY = false;
async function ensure(env) {
  if (READY || !env.DB) return;
  await env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS drivers (id TEXT PRIMARY KEY, n TEXT NOT NULL, ph TEXT, " +
      "wa TEXT, car TEXT, runs TEXT, flex TEXT, langs TEXT, since INTEGER, star INTEGER, " +
      "rates TEXT, via INTEGER DEFAULT 0, pos INTEGER DEFAULT 0, live INTEGER DEFAULT 1, updated TEXT)"
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS events (day TEXT NOT NULL, kind TEXT NOT NULL, " +
      "k TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, kind, k))"
    )
  ]);
  READY = true;
}

function json(o, status) {
  return new Response(JSON.stringify(o), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
