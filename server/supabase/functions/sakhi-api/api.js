// Sakhi accounts API: server/SERVER_SPEC.md sections 2-6. Plain JavaScript on web-standard Request, Response and
// crypto.subtle, so the same file runs in Supabase's Deno Edge Function (index.ts) and in Node for the tests.
// Everything outside is passed in: `store` (the database, store-pg.js), `send` (WhatsApp and SMS, send.js), `env`
// (secrets), `now` (the clock) and `log`. Nothing from a woman's diary is ever accepted, stored or logged.

const enc = new TextEncoder();
const PHONE_RE = /^\+91[6-9]\d{9}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LANG_RE = /^[a-z]{2}$/;
const APP_RE = /^[\w.+ -]{1,32}$/;
const NOTICE_RE = /^[\w.-]{1,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;   /* the same check as the app's */
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
/* 5.9 What helps: the tools the app may count. It mirrors USAGE_KEYS in web/app.js (server/test/api.test.mjs checks the two agree). */
export const USAGE_TOOLS = ['today', 'setup', 'search', 'diary', 'checkin', 'report', 'ask', 'access-free', 'access-doctor', 'access-care', 'access-schemes', 'access-online', 'asha', 'iron', 'preg-plan', 'preg-week', 'preg-logs', 'post',
  'contra-mine', 'tools-reminders', 'tools-meds', 'tools-reports', 'journey', 'relief', 'explain', 'screen-mine', 'meno-diary', 'learn', 'joy', 'family'];
const BUCKETS = ['1', '2-5', '6+'];
const HEARD = ['doc', 'fam', 'wa', 'social', 'qura', 'other'];
const CODE_TTL_S = 600;
const RESEND_S = 30;
const MAX_TRIES = 5;
const SESSION_IDLE_DAYS = 365;
const MAX_BODY = 2048;

/* The only fields each call may carry. It mirrors SEND in web/app.js (server/test/api.test.mjs checks the two agree). */
export const ALLOW = {
  'POST otp/start': ['phone', 'channel', 'lang', 'app', 'platform'],
  'POST otp/verify': ['challenge', 'code', 'birth_year', 'notice', 'lang', 'app', 'platform'],
  'GET me': [],
  'PATCH me': ['name', 'pincode', 'email', 'heard', 'upd_sms', 'upd_wa', 'lang'],
  'POST me/active': ['app', 'lang'],
  'POST session/logout': [],
  'DELETE me': [],
  'POST usage': ['month', 'counts']
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Max-Age': '86400'
};

class Fail extends Error {
  constructor(status, code, extra) { super(code); this.status = status; this.code = code; this.extra = extra || {}; }
}
const fail = (status, code, extra) => { throw new Fail(status, code, extra); };
const reply = (status, body) => new Response(body === undefined ? null : JSON.stringify(body),
  { status, headers: Object.assign(body === undefined ? {} : { 'Content-Type': 'application/json' }, CORS) });

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}
const sha256Hex = async (msg) => hex(await crypto.subtle.digest('SHA-256', enc.encode(msg)));
/* Equal-length hex strings compared without an early exit. */
function sameHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
/* 000000-999999 with no bias: 4,294,000,000 is the largest multiple of a million below 2^32. */
function sixDigits() {
  const a = new Uint32Array(1);
  do crypto.getRandomValues(a); while (a[0] >= 4294000000);
  return String(a[0] % 1000000).padStart(6, '0');
}

/* "Today" is India's date everywhere. */
const IST_MS = 5.5 * 3600 * 1000;
const indiaDay = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 10);
const indiaYear = (ms) => new Date(ms + IST_MS).getUTCFullYear();
const addDays = (day, n) => new Date(Date.parse(day + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const prevMonth = (mk) => { const y = +mk.slice(0, 4), m = +mk.slice(5, 7); return m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0'); };
const clientIp = (req) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
const short = (e) => String((e && e.message) || e).slice(0, 160);
const str = (v, re) => typeof v === 'string' && re.test(v);

/* What the app may see of an account: the same shape the stand-in server in web/app.js returns. */
const pub = (a) => ({ id: String(a.id), phone: a.phone, birth_year: a.birth_year, name: a.name || null, pincode: a.pincode || null,
  email: a.email || null, heard: a.heard || null, upd_sms: !!a.upd_sms, upd_wa: !!a.upd_wa });

export function createApi({ store, send, env, now = () => Date.now(), log = () => {} }) {
  const pepper = env.SAKHI_OTP_PEPPER;
  const ipSeed = env.SAKHI_IP_SALT_SEED;
  if (!pepper || pepper.length < 32 || !ipSeed || ipSeed.length < 32) throw new Error('SAKHI_OTP_PEPPER and SAKHI_IP_SALT_SEED must each be at least 32 characters');

  const limit = async (key, windowS, max, t) => {
    const r = await store.hit(key, windowS, max, t);
    if (!r.ok) fail(429, 'too_many', { retry_after: r.retryAfter });
  };
  /* The IP only ever appears as a daily HMAC. With no IP header the IP limits are skipped rather than shared by everyone. */
  const ipKey = async (req, t, kind) => { const ip = clientIp(req); return ip ? kind + ':ip:' + await hmacHex(ipSeed, indiaDay(t) + '|' + ip) : null; };

  async function readBody(req, allow, path) {
    if (req.method === 'GET' || req.method === 'DELETE') return {};
    if (+(req.headers.get('content-length') || 0) > MAX_BODY) fail(413, 'too_large');
    const text = await req.text();
    if (enc.encode(text).length > MAX_BODY) fail(413, 'too_large');
    if (!text.trim()) return {};
    let body; try { body = JSON.parse(text); } catch (e) { fail(400, 'bad_json'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'bad_json');
    const extra = Object.keys(body).filter((k) => !allow.includes(k));
    if (extra.length) { log('field_not_allowed', { path, fields: extra.slice(0, 10).map((k) => String(k).slice(0, 40)) }); fail(400, 'field_not_allowed'); }
    return body;
  }
  function checkMeta(b) {
    if (b.lang !== undefined && !str(b.lang, LANG_RE)) fail(400, 'lang_bad');
    if (b.app !== undefined && !str(b.app, APP_RE)) fail(400, 'app_bad');
    if (b.platform !== undefined && b.platform !== 'android' && b.platform !== 'web') fail(400, 'platform_bad');
  }
  async function auth(req, t) {
    const m = /^Bearer ([A-Za-z0-9_-]{20,128})$/.exec(req.headers.get('authorization') || '');
    if (!m) fail(401, 'unauthorized');
    const th = await sha256Hex(m[1]);
    const day = indiaDay(t);
    const acct = await store.sessionAccount(th, addDays(day, -SESSION_IDLE_DAYS));
    if (!acct) fail(401, 'unauthorized');
    return { acct, th, day };
  }

  /* 5.1 Send a code: WhatsApp first ("auto"), or SMS when she asks for it, or when WhatsApp fails outright. */
  async function otpStart(req, b, t) {
    if (!str(b.phone, PHONE_RE)) fail(400, 'phone_bad');
    const channel = b.channel === undefined ? 'auto' : b.channel;
    if (channel !== 'auto' && channel !== 'sms') fail(400, 'channel_bad');
    checkMeta(b);
    await limit('otp:phone:' + b.phone + ':' + channel, RESEND_S, 1, t);
    await limit('otp:phone:' + b.phone + ':h', 3600, 5, t);
    await limit('otp:phone:' + b.phone + ':d', 86400, 10, t);
    const ik = await ipKey(req, t, 'otp');
    if (ik) await limit(ik, 3600, 20, t);
    const id = crypto.randomUUID();
    const code = sixDigits();
    let used = null;
    if (channel === 'auto') { try { await send.whatsapp(b.phone, code); used = 'whatsapp'; } catch (e) { log('whatsapp_failed', { message: short(e) }); } }
    if (!used) { try { await send.sms(b.phone, code); used = 'sms'; } catch (e) { log('sms_failed', { message: short(e) }); fail(502, 'send_failed'); } }
    await store.createChallenge({ id, phone: b.phone, channel: used, codeHash: await hmacHex(pepper, id + ':' + code), expiresAt: new Date(t + CODE_TTL_S * 1000).toISOString() });
    await store.bumpStat(indiaDay(t), used === 'whatsapp' ? 'wa_sent' : 'sms_sent');
    await store.housekeepIfDue(t);
    return reply(200, { challenge: id, channel: used, resend_after: RESEND_S, expires_in: CODE_TTL_S });
  }

  /* 5.2 Check the code; sign up or sign in; one new session. */
  async function otpVerify(req, b, t) {
    const ik = await ipKey(req, t, 'verify');
    if (ik) await limit(ik, 3600, 60, t);
    if (!str(b.challenge, UUID_RE)) fail(400, 'challenge_bad');
    if (!str(b.code, /^\d{6}$/)) fail(400, 'code_bad');
    if (b.birth_year !== undefined && !(Number.isInteger(b.birth_year) && b.birth_year >= 1900 && b.birth_year <= 2100)) fail(400, 'birth_year_bad');
    if (b.notice !== undefined && !str(b.notice, NOTICE_RE)) fail(400, 'notice_bad');
    checkMeta(b);
    const c = await store.getChallenge(b.challenge);
    if (!c || c.used_at) fail(400, 'challenge_bad');
    if (new Date(c.expires_at).getTime() <= t) fail(410, 'code_expired');
    if (!sameHex(await hmacHex(pepper, b.challenge + ':' + b.code), c.code_hash)) {
      const tries = await store.bumpTries(b.challenge);
      if (tries === null) fail(400, 'challenge_bad');
      if (tries >= MAX_TRIES) { await store.useChallenge(b.challenge); fail(429, 'too_many', { retry_after: 0 }); }
      fail(400, 'code_wrong', { tries_left: MAX_TRIES - tries });
    }
    let acct = await store.findAccountByPhone(c.phone);
    /* A new account needs her birth year (18+) and the notice she agreed to; asking again keeps the code usable. */
    if (!acct) {
      if (b.birth_year === undefined) fail(400, 'birth_year_needed');
      if (b.birth_year > indiaYear(t) - 18) fail(403, 'under_18');
      if (b.notice === undefined) fail(400, 'notice_needed');
    }
    if (!(await store.useChallenge(b.challenge))) fail(400, 'challenge_bad');   /* two taps at once: one wins */
    const day = indiaDay(t);
    let isNew = false;
    if (!acct) {
      acct = await store.createAccount({ phone: c.phone, birth_year: b.birth_year, lang: b.lang || null, platform: b.platform || null, app_version: b.app || null });
      await store.addConsent(acct.id, 'terms', true, b.notice);
      await store.bumpStat(day, 'signups');
      isNew = true;
    } else if (b.notice !== undefined) {
      const last = await store.latestConsent(acct.id, 'terms');
      if (!last || last.notice_version !== b.notice) await store.addConsent(acct.id, 'terms', true, b.notice);
    }
    const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
    await store.createSession(await sha256Hex(token), acct.id, day);
    return reply(200, { token, is_new: isNew, account: pub(acct) });
  }

  /* 5.3 Her details. Her first name and PIN code are needed: they can be changed, never emptied. The email is optional and ''
     clears it. Every value is checked before anything is written. */
  async function patchMe(b, acct) {
    const f = {};
    if (b.name !== undefined) {
      if (typeof b.name !== 'string') fail(400, 'name_bad');
      const n = b.name.replace(/[\u0000-\u001f\u007f]/g, '').trim();
      if (n.length < 2 || n.length > 40 || !/\p{L}/u.test(n)) fail(400, 'name_bad');
      f.name = n;
    }
    if (b.pincode !== undefined) {
      if (!str(b.pincode, /^[1-9]\d{5}$/)) fail(400, 'pincode_bad');
      const p = await store.lookupPincode(b.pincode); Object.assign(f, { pincode: b.pincode, district: p ? p.district : null, state: p ? p.state : null });
    }
    if (b.email !== undefined) {
      if (typeof b.email !== 'string' || /[\u0000-\u001f\u007f]/.test(b.email)) fail(400, 'email_bad');
      const e = b.email.trim().toLowerCase();
      if (e && (e.length > 254 || !EMAIL_RE.test(e))) fail(400, 'email_bad');
      f.email = e || null;
    }
    if (b.heard !== undefined) {
      if (b.heard === '') f.heard = null;
      else if (!HEARD.includes(b.heard)) fail(400, 'heard_bad');
      else f.heard = b.heard;
    }
    for (const k of ['upd_sms', 'upd_wa']) if (b[k] !== undefined) { if (typeof b[k] !== 'boolean') fail(400, k + '_bad'); f[k] = b[k]; }
    if (b.lang !== undefined) { if (!str(b.lang, LANG_RE)) fail(400, 'lang_bad'); f.lang = b.lang; }
    const changed = ['upd_sms', 'upd_wa'].filter((k) => f[k] !== undefined && f[k] !== !!acct[k]);
    if (changed.length) {
      const terms = await store.latestConsent(acct.id, 'terms');
      for (const k of changed) await store.addConsent(acct.id, k, f[k], terms ? terms.notice_version : 'unknown');
    }
    const next = Object.keys(f).length ? await store.updateAccount(acct.id, f) : acct;
    return reply(200, { account: pub(next) });
  }

  /* 5.9 What helps (opt-in, Version 30): last month's counts from one phone, each tool as 1, 2-5 or 6+ days. It carries no
     account: a request with a token is refused, so a report can never be tied to her. Only monthly totals are kept, never a
     row per phone. The IP limit uses its own daily hash, which matches no other limit's. */
  async function usage(req, b, t) {
    if (req.headers.get('authorization')) fail(400, 'no_token_here');
    const ip = clientIp(req);
    if (ip) await limit('usage:ip:' + await hmacHex(ipSeed, 'usage|' + indiaDay(t) + '|' + ip), 86400, 3, t);
    if (!str(b.month, MONTH_RE) || b.month !== prevMonth(indiaDay(t).slice(0, 7))) fail(400, 'month_bad');
    const c = b.counts;
    if (!c || typeof c !== 'object' || Array.isArray(c)) fail(400, 'counts_bad');
    const keys = Object.keys(c);
    if (!keys.length || keys.some((k) => !USAGE_TOOLS.includes(k) || !BUCKETS.includes(c[k]))) fail(400, 'counts_bad');
    await store.addUsage(b.month, keys.map((k) => [k, c[k]]));
    return reply(204);
  }

  return async function handle(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    let path = '';
    try {
      /* Route on the last /v1/: Supabase's own address already has one (/functions/v1/sakhi-api/v1/otp/start). */
      const pn = new URL(req.url).pathname;
      const at = pn.lastIndexOf('/v1/');
      path = at < 0 ? '' : pn.slice(at + 4).replace(/\/$/, '');
      const key = req.method + ' ' + path;
      const allow = ALLOW[key];
      if (!allow) {
        const known = Object.keys(ALLOW).some((k) => k.slice(k.indexOf(' ') + 1) === path);
        fail(known ? 405 : 404, known ? 'method_not_allowed' : 'not_found');
      }
      const b = await readBody(req, allow, path);
      const t = now();
      if (key === 'POST otp/start') return await otpStart(req, b, t);
      if (key === 'POST otp/verify') return await otpVerify(req, b, t);
      if (key === 'POST usage') return await usage(req, b, t);
      const { acct, th, day } = await auth(req, t);
      if (key === 'GET me') return reply(200, { account: pub(acct) });
      if (key === 'PATCH me') return await patchMe(b, acct);
      if (key === 'POST me/active') {
        checkMeta(b);
        if (await store.markActive(acct.id, day, b.app || null, b.lang || null)) await store.bumpStat(day, 'active');
        await store.touchSession(th, day);
        return reply(204);
      }
      if (key === 'POST session/logout') { await store.revokeSession(th); return reply(204); }
      if (key === 'DELETE me') { await store.deleteAccount(acct.id); return reply(204); }
      fail(404, 'not_found');
    } catch (e) {
      if (e instanceof Fail) return reply(e.status, Object.assign({ error: e.code }, e.extra));
      log('server_error', { path, message: short(e) });
      return reply(500, { error: 'server_error' });
    }
  };
}
