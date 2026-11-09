// Contract tests for the Sakhi accounts API: every row of server/SERVER_SPEC.md section 5, run twice, once on the
// in-memory store and once on the real SQL in PGlite, plus the sender's requests and the app/server allowlist match.
// Usage: node server/test/api.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOW, USAGE_TOOLS, SHARE_KEYS, createApi } from '../supabase/functions/sakhi-api/api.js';
import { makeSender } from '../supabase/functions/sakhi-api/send.js';
import { makeStore, makeApi, call, fakeSender, ENV, HANDOFF_ENV, pgliteDb } from './harness.mjs';
import { pincodeSql } from '../scripts/load-pincodes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const results = [];
let prefix = '';
const check = (name, cond, extra) => {
  results.push({ name: prefix + name, pass: !!cond });
  if (!cond) console.log('FAIL', prefix + name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400));
};
const DAY = '2026-10-20';
const B64URL_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const UUID = /^[0-9a-f-]{36}$/;

async function newCtx(kind, opts) {
  const { store, db } = await makeStore(kind);
  return Object.assign({ kind, store, db }, makeApi(store, opts));
}
async function sendCode(ctx, phone, body = {}) { return call(ctx.api, 'POST', 'otp/start', Object.assign({ phone }, body)); }
async function signUp(ctx, phone = '+919876543210', extra = {}) {
  const s = await sendCode(ctx, phone);
  const v = await call(ctx.api, 'POST', 'otp/verify', Object.assign({ challenge: s.json.challenge, code: ctx.send.lastCode(), birth_year: 1994, notice: '2026-10-20', lang: 'en', app: 'test', platform: 'web' }, extra));
  return v.json;
}
/* Read-only views of what the database holds, the same for both stores. */
async function stats(ctx, day = DAY) {
  if (ctx.kind === 'memory') return ctx.store.db.stats.get(day) || {};
  return (await ctx.db.query('select signups, active, wa_sent, sms_sent from sakhi.daily_stats where day = $1::date', [day])).rows[0] || {};
}
async function account(ctx, phone) {
  if (ctx.kind === 'memory') { for (const a of ctx.store.db.accounts.values()) if (a.phone === phone) return a; return null; }
  return (await ctx.db.query('select id::text, phone, birth_year, name, pincode, district, state, email, heard, upd_sms, upd_wa, lang, app_version, last_active_on::text from sakhi.accounts where phone = $1', [phone])).rows[0] || null;
}
async function consents(ctx, id) {
  if (ctx.kind === 'memory') return ctx.store.db.consents.filter((c) => c.account_id === id).map((c) => ({ kind: c.kind, granted: c.granted, notice_version: c.notice_version }));
  return (await ctx.db.query('select kind, granted, notice_version from sakhi.consents where account_id = $1::uuid order by id', [id])).rows;
}
async function challengeCount(ctx) {
  if (ctx.kind === 'memory') return ctx.store.db.challenges.size;
  return (await ctx.db.query('select count(*)::int as n from sakhi.otp_challenges')).rows[0].n;
}
async function sessionCount(ctx, id) {
  if (ctx.kind === 'memory') return [...ctx.store.db.sessions.values()].filter((s) => s.account_id === id).length;
  return (await ctx.db.query('select count(*)::int as n from sakhi.sessions where account_id = $1::uuid', [id])).rows[0].n;
}
/* The doctor-call hand-off (spec section 10.1): what the table holds for each request, the same for both stores. Times in ms. */
async function reqRows(ctx) {
  if (ctx.kind === 'memory') return ctx.store.db.requests.map((r) => ({ ref: r.ref, status: r.status, tries: r.tries, topic: r.topic, data: r.shared_data, error: r.last_error, lead: r.qura_lead_id, next: r.next_try_at, sent: r.sent_at }));
  return (await ctx.db.query('select ref, status, tries, topic, shared_data as data, last_error as error, qura_lead_id as lead, (extract(epoch from next_try_at) * 1000)::float8 as next, (extract(epoch from sent_at) * 1000)::float8 as sent from sakhi.call_requests order by id')).rows;
}
const T0 = Date.parse('2026-10-20T04:30:00Z');   /* the fake clock's start */
/* A request as the app sends it: her topic, the best time, and the two sections she ticked, with the lines she saw */
const SHARE = (over) => Object.assign({
  topic: 'My periods come every 40 days MARKER-TOPIC', best_time: 'evening', lang: 'hi', notice: '2026-10-23.2', shared: ['periods', 'questions'],
  shared_data: { report_lang: 'en', sections: [
    { key: 'periods', title: 'Periods', lines: ['1 Sep 2026: bled 5 days, next came after 40 days', 'MARKER-LINE: 11 Oct 2026: bled 4 days'] },
    { key: 'questions', title: 'Questions for the call', lines: ['Is a 40-day gap normal for me?'] }] }
}, over || {});
/* SHARE's data with one section changed */
const shareSec = (i, over) => { const d = JSON.parse(JSON.stringify(SHARE().shared_data)); Object.assign(d.sections[i], over); return d; };

for (const kind of ['memory', 'pglite']) {
  prefix = '[' + kind + '] ';

  /* ---------- requests the API refuses before doing anything ---------- */
  {
    const ctx = await newCtx(kind);
    const pre = await ctx.api(new Request('https://sakhi.test/functions/v1/sakhi-api/v1/me', { method: 'OPTIONS' }));
    check('OPTIONS answers 204 with CORS for the app', pre.status === 204 && pre.headers.get('access-control-allow-origin') === '*' && /authorization/.test(pre.headers.get('access-control-allow-headers')));
    check('unknown path is 404', (await call(ctx.api, 'POST', 'nope', {})).json.error === 'not_found');
    check('wrong method is 405', (await call(ctx.api, 'GET', 'otp/start')).status === 405);
    check('broken JSON is 400 bad_json', (await call(ctx.api, 'POST', 'otp/start', '{phone:')).json.error === 'bad_json');
    check('a JSON array is 400 bad_json', (await call(ctx.api, 'POST', 'otp/start', '[1,2]')).json.error === 'bad_json');
    check('a body over 2 KB is 413', (await call(ctx.api, 'POST', 'otp/start', '{"phone":"+919876543210","x":"' + 'a'.repeat(2100) + '"}')).status === 413);
    const leak = await call(ctx.api, 'POST', 'otp/start', { phone: '+919876543210', events: [{ d: '2026-10-01', t: 'start' }], notes: 'MARKER-NOTE' });
    check('a diary field is refused: 400 field_not_allowed', leak.status === 400 && leak.json.error === 'field_not_allowed');
    const logged = JSON.stringify(ctx.logs);
    check('the log names the refused fields, never their values', /"events"/.test(logged) && /"notes"/.test(logged) && !/MARKER-NOTE|2026-10-01/.test(logged));
    check('refused request sent nothing', ctx.send.outbox.length === 0);
    for (const [b, code] of [[{ phone: '9876543210' }, 'phone_bad'], [{ phone: '+911234567890' }, 'phone_bad'], [{ phone: '+919876543210', channel: 'pigeon' }, 'channel_bad'],
      [{ phone: '+919876543210', lang: 'EN' }, 'lang_bad'], [{ phone: '+919876543210', platform: 'ios' }, 'platform_bad'], [{ phone: '+919876543210', app: '' }, 'app_bad']]) {
      const r = await call(ctx.api, 'POST', 'otp/start', b);
      check('otp/start ' + JSON.stringify(b) + ' is 400 ' + code, r.status === 400 && r.json.error === code, r.json);
    }
  }

  /* ---------- 5.1 sending codes, channels and rate limits ---------- */
  {
    const ctx = await newCtx(kind);
    const a = await sendCode(ctx, '+919876543210');
    check('auto sends on WhatsApp first', a.status === 200 && a.json.channel === 'whatsapp' && UUID.test(a.json.challenge) && a.json.resend_after === 30 && a.json.expires_in === 600, a.json);
    check('the code is 6 digits and went to the right number', /^\d{6}$/.test(ctx.send.lastCode()) && ctx.send.outbox[0].phone === '+919876543210' && ctx.send.outbox[0].channel === 'whatsapp');
    check('the response never contains the code', !JSON.stringify(a.json).includes(ctx.send.lastCode()));
    const sms = await sendCode(ctx, '+919876543210', { channel: 'sms' });
    check('"Send by SMS" works straight after a WhatsApp send', sms.status === 200 && sms.json.channel === 'sms' && ctx.send.outbox[1].channel === 'sms', sms.json);
    const again = await sendCode(ctx, '+919876543210');
    check('a second WhatsApp send within 30 s is 429 with retry_after', again.status === 429 && again.json.error === 'too_many' && again.json.retry_after >= 1 && again.json.retry_after <= 30, again.json);
    ctx.clock.add(31);
    check('after 30 s it can be sent again', (await sendCode(ctx, '+919876543210')).status === 200);
    check('stats count WhatsApp and SMS sends', (await stats(ctx)).wa_sent === 2 && (await stats(ctx)).sms_sent === 1, await stats(ctx));
    ctx.send.fail.whatsapp = true; ctx.clock.add(31);
    const fb = await sendCode(ctx, '+919876543210');
    check('if WhatsApp fails outright, the same request falls back to SMS', fb.status === 200 && fb.json.channel === 'sms', fb.json);
    check('the WhatsApp failure is logged', ctx.logs.some((l) => l.event === 'whatsapp_failed'));
    ctx.send.fail.sms = true; ctx.clock.add(31);
    const before = await challengeCount(ctx);
    const down = await sendCode(ctx, '+919876543210');
    check('both channels down is 502 send_failed and stores no challenge', down.status === 502 && down.json.error === 'send_failed' && (await challengeCount(ctx)) === before, down.json);
  }
  {
    const ctx = await newCtx(kind);
    const phone = '+919811111111';
    let okCount = 0;
    for (let i = 0; i < 5; i++) { if ((await sendCode(ctx, phone)).status === 200) okCount++; ctx.clock.add(31); }
    const sixth = await sendCode(ctx, phone);
    check('5 sends an hour per number, the 6th is 429', okCount === 5 && sixth.status === 429, { okCount, sixth: sixth.json });
    ctx.clock.add(3600);
    let more = 0;
    for (let i = 0; i < 6; i++) { if ((await sendCode(ctx, phone)).status === 200) more++; ctx.clock.add(31); }
    check('10 sends a day per number, then 429 until tomorrow', more === 5, { more });
    let ipOk = 0;
    for (let i = 0; i < 21; i++) if ((await call(ctx.api, 'POST', 'otp/start', { phone: '+91982' + String(2000000 + i) }, { ip: '192.0.2.50' })).status === 200) ipOk++;
    const otherIp = await call(ctx.api, 'POST', 'otp/start', { phone: '+919833333333' }, { ip: '198.51.100.9' });
    check('20 sends an hour per IP; another IP is unaffected', ipOk === 20 && otherIp.status === 200, { ipOk, other: otherIp.json });
  }

  /* ---------- S1 (security audit, 4 Nov): a ceiling on codes across all numbers, and the header that holds her address ---------- */
  {
    const CAP = { SAKHI_OTP_HOUR_MAX: '3', SAKHI_OTP_DAY_MAX: '5', SAKHI_REVIEW_PHONE: '+919000000001', SAKHI_REVIEW_CODE: '480913' };
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, CAP) });
    let ok = 0;
    for (let i = 0; i < 3; i++) if ((await call(ctx.api, 'POST', 'otp/start', { phone: '+91984' + String(1000000 + i) }, { ip: '192.0.2.' + (60 + i) })).status === 200) ok++;
    const fourth = await call(ctx.api, 'POST', 'otp/start', { phone: '+919845555555' }, { ip: '198.51.100.60' });
    check('S1: codes stop at the hourly ceiling across all numbers and connections (429 too_many, with retry_after)', ok === 3 && fourth.status === 429 && fourth.json.error === 'too_many' && fourth.json.retry_after > 0, { ok, fourth: fourth.json });
    check('S1: nothing is sent past the ceiling', ctx.send.outbox.length === 3, ctx.send.outbox.length);
    check('S1: the ceiling is logged, without a number', ctx.logs.some((l) => l.event === 'otp_ceiling' && l.data.window === 'hour' && l.data.max === 3) && !JSON.stringify(ctx.logs).includes('9845555555'));
    const rev = await call(ctx.api, 'POST', 'otp/start', { phone: CAP.SAKHI_REVIEW_PHONE }, { ip: '198.51.100.61' });
    check('S1: Google\'s reviewer still signs in at the ceiling (nothing is sent, so it doesn\'t count)', rev.status === 200 && ctx.send.outbox.length === 3, rev.json);
    ctx.clock.add(3600);
    let ok2 = 0;
    for (let i = 0; i < 3; i++) if ((await call(ctx.api, 'POST', 'otp/start', { phone: '+91985' + String(1000000 + i) }, { ip: '192.0.2.' + (70 + i) })).status === 200) ok2++;
    check('S1: the next hour sends again, up to the daily ceiling (5 in all)', ok2 === 2 && ctx.logs.some((l) => l.event === 'otp_ceiling' && l.data.window === 'day' && l.data.max === 5), { ok2 });
    const dflt = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_OTP_HOUR_MAX: 'lots', SAKHI_OTP_DAY_MAX: '0' }) });
    let okD = 0;
    for (let i = 0; i < 25; i++) if ((await call(dflt.api, 'POST', 'otp/start', { phone: '+91986' + String(1000000 + i) }, { ip: '192.0.2.' + (100 + i) })).status === 200) okD++;
    check('S1: a ceiling secret that isn\'t a positive number falls back to the defaults (300 an hour, 3000 a day)', okD === 25, { okD });

    /* the address header: by default the first x-forwarded-for entry, as before */
    const d = await newCtx(kind);
    let spoof = 0;
    for (let i = 0; i < 21; i++) if ((await call(d.api, 'POST', 'otp/start', { phone: '+91987' + String(1000000 + i) }, { ip: '192.0.2.' + (150 + i) + ', 203.0.113.99' })).status === 200) spoof++;
    check('S1: without SAKHI_IP_HEADER the first x-forwarded-for entry is the key, as before (so a sender who writes their own gets past the IP limit)', spoof === 21, { spoof });
    const shape = d.logs.filter((l) => l.event === 'ip_headers');
    check('S1: the ip_headers log line shows the headers\' shape and never an address', shape.length >= 1 && shape[0].data.xff_parts === 2 && shape[0].data.using === 'default' && /^[0-9a-f]{6}$/.test(shape[0].data.first) && /^[0-9a-f]{6}$/.test(shape[0].data.last) && shape[0].data.cf === '' && !/\d+\.\d+\.\d+\.\d+/.test(JSON.stringify(d.logs)), shape[0]);
    check('S1: in the log, the entry a sender writes changes while the one the platform adds stays (so the check can tell them apart)', new Set(shape.map((l) => l.data.first)).size > 1 && new Set(shape.map((l) => l.data.last)).size === 1, shape.slice(0, 2).map((l) => l.data));
    const quiet = await newCtx(kind);
    for (let i = 0; i < 3; i++) await call(quiet.api, 'POST', 'otp/start', { phone: '+91987' + String(2000000 + i) }, { ip: '192.0.2.' + (180 + i) });
    check('S1: with one x-forwarded-for entry the shape is logged once per instance, not on every request', quiet.logs.filter((l) => l.event === 'ip_headers').length === 1);
    for (const [hdr, mk] of [['x-forwarded-for:last', (i) => ({ ip: '192.0.2.' + (150 + i) + ', 203.0.113.99' })], ['cf-connecting-ip', (i) => ({ ip: '192.0.2.' + (150 + i), headers: { 'cf-connecting-ip': '203.0.113.98' } })], ['x-real-ip', (i) => ({ ip: '192.0.2.' + (150 + i), headers: { 'x-real-ip': '203.0.113.97' } })]]) {
      const c = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_IP_HEADER: hdr }) });
      let n = 0;
      for (let i = 0; i < 21; i++) if ((await call(c.api, 'POST', 'otp/start', { phone: '+91988' + String(1000000 + i) }, mk(i))).status === 200) n++;
      const other = await call(c.api, 'POST', 'otp/start', { phone: '+919889999999' }, hdr === 'x-forwarded-for:last' ? { ip: '192.0.2.200, 198.51.100.77' } : { ip: '192.0.2.200', headers: { [hdr]: '198.51.100.77' } });
      check('S1: SAKHI_IP_HEADER=' + hdr + ' keys the 20-an-hour limit on that header, whatever the sender writes first', n === 20 && other.status === 200, { n, other: other.json });
    }
    const miss = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_IP_HEADER: 'cf-connecting-ip' }) });
    let m = 0;
    for (let i = 0; i < 21; i++) if ((await call(miss.api, 'POST', 'otp/start', { phone: '+91989' + String(1000000 + i) }, { ip: '192.0.2.40' })).status === 200) m++;
    check('S1: when the named header is missing, the limit falls back to x-forwarded-for rather than switching off', m === 20, { m });
    const bad = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_IP_HEADER: 'x-anything' }) });
    await call(bad.api, 'POST', 'otp/start', { phone: '+919890000001' });
    check('S1: an unknown SAKHI_IP_HEADER is logged and ignored', bad.logs.some((l) => l.event === 'ip_header_bad'));
  }

  /* ---------- D3 (database audit, 9 Nov): a refused request writes nothing, and made-up numbers and addresses add only as many
     rows as the ceilings allow ---------- */
  {
    const rateRows = async (c) => (c.kind === 'memory' ? c.store.db.rate.size : (await c.db.query('select count(*)::int as n from sakhi.rate_hits')).rows[0].n);
    /* a sender who writes a new number and a new address on every request (no SAKHI_IP_HEADER, so the first entry is theirs) */
    const fake = (i) => ({ ip: '10.' + Math.floor(i / 250) + '.' + (i % 250) + '.1, 203.0.113.99' });
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_OTP_HOUR_MAX: '5', SAKHI_OTP_DAY_MAX: '8' }) });
    for (let i = 0; i < 40; i++) await call(ctx.api, 'POST', 'otp/start', { phone: '+91970' + String(1000000 + i) }, fake(i));
    const r1 = await rateRows(ctx);
    check('D3: 40 code requests with made-up numbers and addresses write rows only for the 5 the ceiling lets through (4 each, plus the 2 ceilings)', ctx.send.outbox.length === 5 && r1 === 5 * 4 + 2, { sent: ctx.send.outbox.length, r1 });
    for (let i = 40; i < 120; i++) await call(ctx.api, 'POST', 'otp/start', { phone: '+91970' + String(1000000 + i) }, fake(i));
    check('D3: while the ceiling is full, a code request writes nothing at all', (await rateRows(ctx)) === r1, await rateRows(ctx));
    check('D3: the ceiling is logged once, when it fills, not on every refusal', ctx.logs.filter((l) => l.event === 'otp_ceiling' && l.data.window === 'hour').length === 1, ctx.logs.filter((l) => l.event === 'otp_ceiling'));
    ctx.clock.add(3600);
    for (let i = 0; i < 40; i++) await call(ctx.api, 'POST', 'otp/start', { phone: '+91971' + String(1000000 + i) }, fake(500 + i));
    check('D3: across the day the rows stop at the daily ceiling (8 codes)', ctx.send.outbox.length === 8 && (await rateRows(ctx)) <= 8 * 4 + 4, { sent: ctx.send.outbox.length, rows: await rateRows(ctx) });

    /* one real address can't use up the ceiling for everyone */
    const one = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_OTP_HOUR_MAX: '21' }) });
    for (let i = 0; i < 30; i++) await call(one.api, 'POST', 'otp/start', { phone: '+91972' + String(1000000 + i) }, { ip: '198.51.100.30' });
    const her = await call(one.api, 'POST', 'otp/start', { phone: '+919729999999' }, { ip: '198.51.100.31' });
    check('D3: 30 requests from one address count 20 against the ceiling, so a woman elsewhere still gets her code', her.status === 200, her.json);

    /* checking codes: only a live code counts against the address */
    const v = await newCtx(kind);
    const s = await sendCode(v, '+919733333333');
    const code = v.send.lastCode();
    const wrong = code === '000000' ? '111111' : '000000';
    const r2 = await rateRows(v);
    let bad = 0;
    for (let i = 0; i < 30; i++) if ((await call(v.api, 'POST', 'otp/verify', { challenge: '00000000-0000-4000-8000-' + String(i).padStart(12, '0'), code }, fake(i))).json.error === 'challenge_bad') bad++;
    check('D3: code checks with made-up challenges are 400 challenge_bad and write nothing', bad === 30 && (await rateRows(v)) === r2, { bad, rows: await rateRows(v) });
    const chk = await newCtx(kind);
    const empty = await call(chk.api, 'POST', 'otp/verify', {}, { ip: '192.0.2.10, 203.0.113.99' });
    check('D3: DEPLOY.md\'s address check (an empty code check) still logs the headers\' shape, and writes nothing', empty.json.error === 'challenge_bad'
      && chk.logs.some((l) => l.event === 'ip_headers' && l.data.xff_parts === 2) && (await rateRows(chk)) === 0, { empty: empty.json, logs: chk.logs });
    for (let i = 0; i < 4; i++) await call(v.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: wrong }, fake(100 + i));
    const fifth = await call(v.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: wrong }, fake(104));
    const r3 = await rateRows(v);
    check('D3: a live code counts each check against its address, 5 at most', fifth.status === 429 && r3 === r2 + 5, { fifth: fifth.json, r3, r2 });
    for (let i = 0; i < 20; i++) await call(v.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code }, fake(200 + i));
    check('D3: a spent code writes nothing more', (await rateRows(v)) === r3, await rateRows(v));
    v.clock.add(31);
    const s2 = await sendCode(v, '+919733333334');
    const c2 = v.send.lastCode();
    v.clock.add(601);
    const r4 = await rateRows(v);
    let gone = 0;
    for (let i = 0; i < 10; i++) if ((await call(v.api, 'POST', 'otp/verify', { challenge: s2.json.challenge, code: c2, birth_year: 1994, notice: '2026-10-20' }, fake(300 + i))).status === 410) gone++;
    check('D3: checks on an expired code are 410 and write nothing', gone === 10 && (await rateRows(v)) === r4, { gone, rows: await rateRows(v) });
    const s3 = await sendCode(v, '+919733333335');
    const c3 = v.send.lastCode();
    const asks = [];
    for (let i = 0; i < 5; i++) asks.push((await call(v.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, notice: '2026-10-20' }, fake(400 + i))).json.error);
    const late = await call(v.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, birth_year: 1994, notice: '2026-10-20' });
    check('D3: the right code asked about without her birth year counts as a try: the 5th spends it', asks.join() === 'birth_year_needed,birth_year_needed,birth_year_needed,birth_year_needed,too_many' && late.json.error === 'challenge_bad', { asks, late: late.json });

    /* "what helps" reports */
    const u = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_USAGE_DAY_MAX: '4' }) });
    for (let i = 0; i < 10; i++) await call(u.api, 'POST', 'usage', { month: '2026-09', counts: { pelvic: '1' } }, fake(i));
    check('D3: reports that fail their checks write nothing', (await rateRows(u)) === 0, await rateRows(u));
    let kept = 0;
    for (let i = 0; i < 30; i++) if ((await call(u.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '1' } }, fake(i))).status === 204) kept++;
    const reports = u.kind === 'memory' ? u.store.db.usageReports.get('2026-09') : (await u.db.query("select phones from sakhi.usage_reports where month = '2026-09'")).rows[0].phones;
    check('D3: reports stop at the day\'s ceiling, and the rows with it (4 addresses plus the ceiling)', kept === 4 && reports === 4 && (await rateRows(u)) === 5, { kept, reports, rows: await rateRows(u) });
    check('D3: the reports\' ceiling is logged once, when it fills', u.logs.filter((l) => l.event === 'usage_ceiling' && l.data.max === 4).length === 1);
    const dflt = await newCtx(kind, { env: Object.assign({}, ENV, { SAKHI_USAGE_DAY_MAX: 'many' }) });
    let okU = 0;
    for (let i = 0; i < 10; i++) if ((await call(dflt.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '1' } }, fake(i))).status === 204) okU++;
    check('D3: a reports ceiling that isn\'t a positive number falls back to the default (30000 a day)', okU === 10, { okU });
  }

  /* ---------- 5.1a Google Play's reviewer (29 Oct 2026): one number, a fixed code, nothing sent ---------- */
  {
    const REVIEW = { SAKHI_REVIEW_PHONE: '+919000000001', SAKHI_REVIEW_CODE: '480913' };
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, REVIEW) });
    const s = await sendCode(ctx, REVIEW.SAKHI_REVIEW_PHONE);
    check('the reviewer number gets a challenge and nothing is sent', s.status === 200 && s.json.channel === 'sms' && ctx.send.outbox.length === 0, s.json);
    check('no send is counted for the reviewer', !(await stats(ctx)).sms_sent && !(await stats(ctx)).wa_sent, await stats(ctx));
    check('the log notes the reviewer code, never the code itself', ctx.logs.some((l) => l.event === 'review_code') && !JSON.stringify(ctx.logs).includes('480913'));
    const wrong = await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: '123456', birth_year: 1990, notice: '2026-10-20' });
    check('a wrong code is still wrong for the reviewer', wrong.status === 400 && wrong.json.error === 'code_wrong', wrong.json);
    const v = await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: '480913', birth_year: 1990, notice: '2026-10-20', lang: 'en', app: 'test', platform: 'android' });
    check('the fixed code signs the reviewer up', v.status === 200 && v.json.is_new === true && B64URL_TOKEN.test(v.json.token) && v.json.account.phone === REVIEW.SAKHI_REVIEW_PHONE, v.json);
    check('the reviewer is not counted as a signup', !(await stats(ctx)).signups, await stats(ctx));
    check('the reviewer number keeps the 30-second limit', (await sendCode(ctx, REVIEW.SAKHI_REVIEW_PHONE)).status === 429);
    ctx.clock.add(31);
    const s2 = await sendCode(ctx, REVIEW.SAKHI_REVIEW_PHONE);
    const back = await call(ctx.api, 'POST', 'otp/verify', { challenge: s2.json.challenge, code: '480913' });
    check('the fixed code signs the reviewer in again', back.status === 200 && back.json.is_new === false, back.json);
    const other = await sendCode(ctx, '+919876543210');
    check('every other number still gets its own code by WhatsApp', other.status === 200 && other.json.channel === 'whatsapp' && ctx.send.outbox.length === 1 && ctx.send.outbox[0].phone === '+919876543210', other.json);
  }
  for (const [env, why] of [[{ SAKHI_REVIEW_PHONE: '+919000000001', SAKHI_REVIEW_CODE: '123456' }, 'an easy code (123456)'],
    [{ SAKHI_REVIEW_PHONE: '+919000000001', SAKHI_REVIEW_CODE: '777777' }, 'an easy code (777777)'], [{ SAKHI_REVIEW_PHONE: '+919000000001', SAKHI_REVIEW_CODE: '121212' }, 'an easy code (121212)'],
    [{ SAKHI_REVIEW_PHONE: '9000000001', SAKHI_REVIEW_CODE: '480913' }, 'a number without +91'], [{ SAKHI_REVIEW_PHONE: '+919000000001' }, 'no code']]) {
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, env) });
    const s = await sendCode(ctx, '+919000000001');
    check('with ' + why + ' the reviewer route is off and a real code is sent', s.status === 200 && ctx.send.outbox.length === 1 && ctx.logs.some((l) => l.event === 'review_off'), s.json);
  }

  /* ---------- 5.2 checking the code, signing up and signing in ---------- */
  {
    const ctx = await newCtx(kind);
    const s = await sendCode(ctx, '+919876543210');
    const code = ctx.send.lastCode();
    const wrongCode = code === '000000' ? '111111' : '000000';
    check('a challenge that does not exist is 400 challenge_bad', (await call(ctx.api, 'POST', 'otp/verify', { challenge: '00000000-0000-4000-8000-000000000000', code })).json.error === 'challenge_bad');
    check('a code that is not 6 digits is 400 code_bad', (await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: '12345' })).json.error === 'code_bad');
    const lefts = [];
    for (let i = 0; i < 4; i++) lefts.push((await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: wrongCode })).json.tries_left);
    check('wrong codes count down: 4, 3, 2, 1 tries left', lefts.join() === '4,3,2,1', lefts);
    const fifth = await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: wrongCode });
    check('the 5th wrong code is 429 too_many', fifth.status === 429 && fifth.json.error === 'too_many');
    const after = await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code, birth_year: 1994, notice: '2026-10-20' });
    check('after 5 wrong codes even the right one is refused', after.json.error === 'challenge_bad', after.json);

    ctx.clock.add(31);
    const s2 = await sendCode(ctx, '+919876543210');
    const c2 = ctx.send.lastCode();
    ctx.clock.add(601);
    check('a code older than 10 minutes is 410 code_expired', (await call(ctx.api, 'POST', 'otp/verify', { challenge: s2.json.challenge, code: c2, birth_year: 1994, notice: '2026-10-20' })).status === 410);

    const s3 = await sendCode(ctx, '+919876543210');
    const c3 = ctx.send.lastCode();
    const nb = await call(ctx.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, notice: '2026-10-20' });
    check('a new account without a birth year is 400 birth_year_needed', nb.json.error === 'birth_year_needed');
    const u18 = await call(ctx.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, birth_year: 2009, notice: '2026-10-20' });
    check('born 2009 (17 in 2026) is 403 under_18', u18.status === 403 && u18.json.error === 'under_18');
    const nn = await call(ctx.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, birth_year: 1994 });
    check('a new account without the notice version is 400 notice_needed', nn.json.error === 'notice_needed');
    const ok = await call(ctx.api, 'POST', 'otp/verify', { challenge: s3.json.challenge, code: c3, birth_year: 1994, notice: '2026-10-20', lang: 'hi', app: '0.21-demo', platform: 'android' });
    check('those refusals left the code usable; sign-up succeeds', ok.status === 200 && ok.json.is_new === true && B64URL_TOKEN.test(ok.json.token), ok.json);
    check('the account comes back in the app\'s shape and nothing more',
      JSON.stringify(Object.keys(ok.json.account).sort()) === JSON.stringify(['birth_year', 'email', 'heard', 'id', 'name', 'phone', 'pincode', 'upd_sms', 'upd_wa']) && ok.json.account.phone === '+919876543210' && ok.json.account.birth_year === 1994 && ok.json.account.upd_sms === false, ok.json.account);
    const row = await account(ctx, '+919876543210');
    check('the account row keeps language, platform and app version', row && row.lang === 'hi' && row.app_version === '0.21-demo', row);
    check('a terms consent is recorded with the notice version', JSON.stringify(await consents(ctx, row.id)) === JSON.stringify([{ kind: 'terms', granted: true, notice_version: '2026-10-20' }]));
    check('the day\'s signups count is 1', (await stats(ctx)).signups === 1);

    ctx.clock.add(31);
    const back = await signUp(ctx, '+919876543210');
    check('signing in again: is_new false, a fresh token', back.is_new === false && back.token !== ok.json.token);
    check('the same notice version adds no consent row', (await consents(ctx, row.id)).length === 1);
    ctx.clock.add(31);
    await signUp(ctx, '+919876543210', { notice: '2027-01-01' });
    check('a newer notice version adds a terms row', (await consents(ctx, row.id)).length === 2);
    check('signups still 1 after two sign-ins', (await stats(ctx)).signups === 1);

    ctx.clock.add(31);
    const s4 = await sendCode(ctx, '+919800000001');
    const c4 = ctx.send.lastCode();
    const body = { challenge: s4.json.challenge, code: c4, birth_year: 1990, notice: '2026-10-20' };
    const both = await Promise.all([call(ctx.api, 'POST', 'otp/verify', body), call(ctx.api, 'POST', 'otp/verify', body)]);
    check('two taps at once with the same code: exactly one signs in', both.filter((r) => r.status === 200).length === 1 && both.some((r) => r.json.error === 'challenge_bad'), both.map((r) => r.json));
    ctx.clock.add(31);
    const s5 = await sendCode(ctx, '+919800000002');
    check('born 2008 (18 this year) is allowed', (await call(ctx.api, 'POST', 'otp/verify', { challenge: s5.json.challenge, code: ctx.send.lastCode(), birth_year: 2008, notice: '2026-10-20' })).status === 200);
  }

  /* ---------- 5.3-5.7 her account: details, last active, log out, delete ---------- */
  {
    const ctx = await newCtx(kind);
    const me = await signUp(ctx, '+919876543210');
    const id = me.account.id;
    check('no token is 401', (await call(ctx.api, 'GET', 'me')).status === 401);
    check('a made-up token is 401', (await call(ctx.api, 'GET', 'me', undefined, { token: 'A'.repeat(43) })).status === 401);
    const g = await call(ctx.api, 'GET', 'me', undefined, { token: me.token });
    check('GET me returns her account', g.status === 200 && g.json.account.id === id);

    const p1 = await call(ctx.api, 'PATCH', 'me', { name: '  Asha\u0007 ', pincode: '560001', heard: 'fam', upd_sms: true, upd_wa: false, lang: 'hi' }, { token: me.token });
    check('details are saved, the name trimmed and cleaned', p1.status === 200 && p1.json.account.name === 'Asha' && p1.json.account.pincode === '560001' && p1.json.account.heard === 'fam' && p1.json.account.upd_sms === true, p1.json);
    const row = await account(ctx, '+919876543210');
    check('the PIN code fills district and state', row.district === 'Bengaluru Urban' && row.state === 'Karnataka', row);
    check('turning SMS updates on records consent with her notice version',
      JSON.stringify((await consents(ctx, id)).filter((c) => c.kind === 'upd_sms')) === JSON.stringify([{ kind: 'upd_sms', granted: true, notice_version: '2026-10-20' }]));
    await call(ctx.api, 'PATCH', 'me', { upd_sms: true }, { token: me.token });
    check('the same choice again adds no consent row', (await consents(ctx, id)).filter((c) => c.kind === 'upd_sms').length === 1);
    await call(ctx.api, 'PATCH', 'me', { upd_sms: false }, { token: me.token });
    check('turning it off records that too', (await consents(ctx, id)).filter((c) => c.kind === 'upd_sms').map((c) => c.granted).join() === 'true,false');
    const em = await call(ctx.api, 'PATCH', 'me', { email: '  Asha.R@Example.IN ' }, { token: me.token });
    check('an email is saved trimmed and lower-case', em.status === 200 && em.json.account.email === 'asha.r@example.in' && (await account(ctx, '+919876543210')).email === 'asha.r@example.in', em.json);
    const hindiName = await call(ctx.api, 'PATCH', 'me', { name: 'आशा' }, { token: me.token });
    check('a name in Devanagari is a name', hindiName.status === 200 && hindiName.json.account.name === 'आशा', hindiName.json);
    await call(ctx.api, 'PATCH', 'me', { name: 'Asha' }, { token: me.token });
    for (const [b, code] of [[{ name: 'x'.repeat(41) }, 'name_bad'], [{ name: '' }, 'name_bad'], [{ name: ' A ' }, 'name_bad'], [{ name: '1234' }, 'name_bad'], [{ name: null }, 'name_bad'],
      [{ pincode: '012345' }, 'pincode_bad'], [{ pincode: '' }, 'pincode_bad'], [{ email: 'asha@' }, 'email_bad'], [{ email: 'asha@example' }, 'email_bad'], [{ email: 'a b@example.in' }, 'email_bad'],
      [{ email: 'asha@exa..mple.in' }, 'email_bad'], [{ email: 'asha\u0000@example.in' }, 'email_bad'], [{ email: 'a'.repeat(250) + '@x.in' }, 'email_bad'], [{ email: 42 }, 'email_bad'],
      [{ heard: 'tv' }, 'heard_bad'], [{ upd_wa: 'yes' }, 'upd_wa_bad'], [{ lang: 'Hindi' }, 'lang_bad']]) {
      const r = await call(ctx.api, 'PATCH', 'me', b, { token: me.token });
      check('PATCH ' + JSON.stringify(b).slice(0, 40) + ' is 400 ' + code, r.status === 400 && r.json.error === code, r.json);
    }
    check('PATCH with a diary field is refused', (await call(ctx.api, 'PATCH', 'me', { name: 'A', situation: { pregnant: true } }, { token: me.token })).json.error === 'field_not_allowed');
    check('a refused PATCH changed nothing', (await account(ctx, '+919876543210')).name === 'Asha');
    const unknownPin = await call(ctx.api, 'PATCH', 'me', { pincode: '999999' }, { token: me.token });
    check('an unknown PIN code is kept, district left empty', unknownPin.status === 200 && (await account(ctx, '+919876543210')).district === null);
    const kept = await account(ctx, '+919876543210');
    check('refusals left her name, PIN code and email as they were', kept.name === 'Asha' && kept.pincode === '999999' && kept.email === 'asha.r@example.in', kept);
    const cleared = await call(ctx.api, 'PATCH', 'me', { email: '', heard: '' }, { token: me.token });
    check('empty strings clear the email and heard, never the name or PIN code', cleared.json.account.email === null && cleared.json.account.heard === null
      && cleared.json.account.name === 'Asha' && cleared.json.account.pincode === '999999', cleared.json);

    const a1 = await call(ctx.api, 'POST', 'me/active', { app: '0.21-demo', lang: 'hi' }, { token: me.token });
    check('me/active is 204 and sets today', a1.status === 204 && (await account(ctx, '+919876543210')).last_active_on === DAY);
    await call(ctx.api, 'POST', 'me/active', { app: '0.21-demo' }, { token: me.token });
    check('a second visit the same day counts once', (await stats(ctx)).active === 1);
    ctx.clock.add(86400);
    await call(ctx.api, 'POST', 'me/active', {}, { token: me.token });
    check('the next day counts again', (await stats(ctx, '2026-10-21')).active === 1);

    ctx.clock.add(31);
    const second = await signUp(ctx, '+919876543210');
    const lo = await call(ctx.api, 'POST', 'session/logout', undefined, { token: me.token });
    check('log out is 204 and that token stops working', lo.status === 204 && (await call(ctx.api, 'GET', 'me', undefined, { token: me.token })).status === 401);
    check('her other session still works', (await call(ctx.api, 'GET', 'me', undefined, { token: second.token })).status === 200);

    const del = await call(ctx.api, 'DELETE', 'me', undefined, { token: second.token });
    check('DELETE me is 204', del.status === 204);
    check('afterwards every token is 401', (await call(ctx.api, 'GET', 'me', undefined, { token: second.token })).status === 401);
    check('the account, its consents and its sessions are gone', !(await account(ctx, '+919876543210')) && (await consents(ctx, id)).length === 0 && (await sessionCount(ctx, id)) === 0);
  }
  {
    const ctx = await newCtx(kind);
    const me = await signUp(ctx, '+919876543210');
    ctx.clock.add(366 * 86400);
    check('a session unused for over 365 days is 401', (await call(ctx.api, 'GET', 'me', undefined, { token: me.token })).status === 401);
  }

  /* ---------- 5.8 what helps: monthly counts, with no account ---------- */
  {
    const ctx = await newCtx(kind);
    const usageRows = async () => {
      if (ctx.kind === 'memory') return { rows: [...ctx.store.db.usage.entries()].map(([k, n]) => k + '=' + n).sort(), reports: ctx.store.db.usageReports.get('2026-09') || 0 };
      const rows = (await ctx.db.query("select month || '|' || tool || '|' || bucket || '=' || phones as r from sakhi.usage_counts order by 1")).rows.map((x) => x.r);
      return { rows, reports: ((await ctx.db.query("select phones from sakhi.usage_reports where month = '2026-09'")).rows[0] || {}).phones || 0 };
    };
    const ok1 = await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '6+', report: '1', 'preg-plan': '2-5' } });
    check('usage: last month\'s counts, with no token, are 204', ok1.status === 204, ok1);
    await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '6+' } }, { ip: '203.0.113.8' });
    const u = await usageRows();
    check('usage: only monthly totals are kept, per tool and bucket, and how many phones reported', JSON.stringify(u.rows) === JSON.stringify(['2026-09|iron|6+=2', '2026-09|preg-plan|2-5=1', '2026-09|report|1=1']) && u.reports === 2, u);
    const me = await signUp(ctx);
    check('usage: a request that carries an account token is refused, so a report can never be tied to her', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '1' } }, { token: me.token, ip: '203.0.113.9' })).json.error === 'no_token_here');
    check('usage: this month is refused (only last month goes)', (await call(ctx.api, 'POST', 'usage', { month: '2026-10', counts: { iron: '1' } }, { ip: '203.0.113.9' })).json.error === 'month_bad');
    check('usage: an older month is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-08', counts: { iron: '1' } }, { ip: '203.0.113.10' })).json.error === 'month_bad');
    check('usage: a tool off the list is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { loss: '1' } }, { ip: '203.0.113.10' })).json.error === 'counts_bad');
    check('usage: a raw count instead of a bucket is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: 7 } }, { ip: '203.0.113.11' })).json.error === 'counts_bad');
    check('usage: an empty report is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: {} }, { ip: '203.0.113.11' })).json.error === 'counts_bad');
    check('usage: any other field (a phone number, a diary entry) is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '1' }, phone: '+919876543210' }, { ip: '203.0.113.12' })).json.error === 'field_not_allowed'
      && (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { iron: '1' }, situation: { pregnant: true } }, { ip: '203.0.113.12' })).json.error === 'field_not_allowed');
    check('usage: refusals added nothing', JSON.stringify((await usageRows()).rows) === JSON.stringify(u.rows));
    for (let i = 0; i < 2; i++) await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { asha: '1' } }, { ip: '198.51.100.20' });
    check('usage: a fourth report from one connection in a day is refused', (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { asha: '1' } }, { ip: '198.51.100.20' })).status === 204
      && (await call(ctx.api, 'POST', 'usage', { month: '2026-09', counts: { asha: '1' } }, { ip: '198.51.100.20' })).status === 429);
    if (ctx.kind === 'pglite') {
      const cols = (await ctx.db.query("select table_name || '.' || column_name as c from information_schema.columns where table_schema = 'sakhi' and table_name like 'usage%' order by 1")).rows.map((x) => x.c);
      check('usage: its tables hold months, tools, buckets and totals, nothing else', JSON.stringify(cols) === JSON.stringify(['usage_counts.bucket', 'usage_counts.month', 'usage_counts.phones', 'usage_counts.tool', 'usage_reports.month', 'usage_reports.phones']), cols);
      const rl = (await ctx.db.query("select key from sakhi.rate_hits where key like 'usage:ip:%'")).rows.map((x) => x.key.split(':ip:')[1]);
      const others = (await ctx.db.query("select key from sakhi.rate_hits where key like 'otp:ip:%' or key like 'verify:ip:%'")).rows.map((x) => x.key.split(':ip:')[1]);
      check('usage: its rate limit\'s IP hash matches no other limit\'s', rl.length > 0 && rl.every((h) => others.indexOf(h) < 0), { rl, others });
    }
  }

  /* ---------- 10.1 the doctor-call hand-off (Version 33): off until Qura's address and key are set ---------- */
  {
    const off = await newCtx(kind);
    const me = await signUp(off, '+919876543210');
    const g = await call(off.api, 'GET', 'requests', undefined, { token: me.token });
    check('hand-off: off until Qura\'s address and key are set, and GET says so', g.status === 200 && g.json.available === false && JSON.stringify(g.json.requests) === '[]', g.json);
    check('hand-off: off, and GET without a token says so too', JSON.stringify((await call(off.api, 'GET', 'requests')).json) === '{"available":false}');
    const p = await call(off.api, 'POST', 'requests', SHARE(), { token: me.token });
    check('hand-off: while off, a request is 503 handoff_off and nothing is kept or sent', p.status === 503 && p.json.error === 'handoff_off' && (await reqRows(off)).length === 0 && off.send.handoffs.length === 0, p.json);
    for (const [why, extra] of [['a key under 32 characters', { SAKHI_QURA_KEY: 'short-key' }], ['an http address', { SAKHI_QURA_HANDOFF_URL: 'http://qura.test/api/partners/sakhi/v1/call-requests' }]]) {
      const c = await newCtx(kind, { env: Object.assign({}, ENV, HANDOFF_ENV, extra) });
      const m = await signUp(c, '+919876543210');
      check('hand-off: stays off with ' + why, (await call(c.api, 'GET', 'requests', undefined, { token: m.token })).json.available === false);
    }
  }

  /* ---------- 10.1 the hand-off: what is refused, what Qura gets, what stays ---------- */
  {
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, HANDOFF_ENV) });
    const me = await signUp(ctx, '+919876543210');
    await call(ctx.api, 'PATCH', 'me', { name: 'Asha', pincode: '560001' }, { token: me.token });
    check('hand-off: a request needs her login', (await call(ctx.api, 'POST', 'requests', SHARE())).status === 401);
    const anon = await call(ctx.api, 'GET', 'requests');
    check('hand-off: asked without a token, GET says only whether it is on (the Ask screen sends nothing about her)', anon.status === 200 && JSON.stringify(anon.json) === '{"available":true}', anon.json);
    const bad = [
      [{ topic: '' }, 'topic_bad'], [{ topic: '   ' }, 'topic_bad'], [{ topic: 'a'.repeat(121) }, 'topic_bad'], [{ topic: 'one\ntwo' }, 'topic_bad'], [{ topic: 7 }, 'topic_bad'],
      [{ best_time: 'night' }, 'best_time_bad'], [{ lang: 'EN' }, 'lang_bad'], [{ notice: undefined }, 'notice_bad'],
      [{ shared: ['periods', 'diary'] }, 'shared_bad'], [{ shared: ['periods', 'periods'] }, 'shared_bad'], [{ shared: 'periods' }, 'shared_bad'],
      [{ shared_data: null }, 'shared_data_bad'], [{ shared_data: Object.assign(SHARE().shared_data, { events: [] }) }, 'shared_data_bad'],
      [{ shared_data: Object.assign(SHARE().shared_data, { report_lang: 'Hindi' }) }, 'shared_data_bad'],
      [{ shared_data: { report_lang: 'en', sections: [SHARE().shared_data.sections[0]] } }, 'shared_data_bad'],
      [{ shared: ['periods', 'notes'] }, 'shared_data_bad'],
      [{ shared_data: shareSec(0, { lines: ['x'.repeat(301)] }) }, 'shared_data_bad'], [{ shared_data: shareSec(0, { lines: Array(41).fill('x') }) }, 'shared_data_bad'],
      [{ shared_data: shareSec(0, { lines: [] }) }, 'shared_data_bad'], [{ shared_data: shareSec(0, { lines: ['ok', 'tab\there'] }) }, 'shared_data_bad'],
      [{ shared_data: shareSec(0, { title: 'x'.repeat(81) }) }, 'shared_data_bad'], [{ shared_data: shareSec(0, { events: [{ d: '2026-10-01', t: 'start' }] }) }, 'shared_data_bad'],
      [{ shared_data: shareSec(1, { key: 'periods' }) }, 'shared_data_bad']];
    for (const [over, code] of bad) {
      const r = await call(ctx.api, 'POST', 'requests', SHARE(over), { token: me.token });
      check('hand-off: ' + JSON.stringify(over).slice(0, 70) + ' is 400 ' + code, r.status === 400 && r.json.error === code, r.json);
    }
    check('hand-off: any other field (a diary) is refused', (await call(ctx.api, 'POST', 'requests', Object.assign(SHARE(), { events: [{ d: '2026-10-01', t: 'start' }] }), { token: me.token })).json.error === 'field_not_allowed');
    check('hand-off: a body over 32 KB is 413', (await call(ctx.api, 'POST', 'requests', SHARE({ topic: 'x', shared_data: shareSec(0, { lines: Array(40).fill('क'.repeat(300)) }) }), { token: me.token })).status === 413);
    check('hand-off: refusals kept nothing and sent nothing', (await reqRows(ctx)).length === 0 && ctx.send.handoffs.length === 0);

    const r1 = await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token });
    check('hand-off: her request is 201 with a QC- reference, and goes to Qura at once', r1.status === 201 && /^QC-[A-HJ-NP-Z2-9]{6}$/.test(r1.json.ref) && r1.json.status === 'sent', r1.json);
    const h = ctx.send.handoffs[0] || {};
    check('hand-off: Qura gets the spec\'s fields and nothing else', ctx.send.handoffs.length === 1 && JSON.stringify(Object.keys(h)) === JSON.stringify(['ref', 'phone', 'name', 'best_time', 'topic', 'lang', 'asked_at', 'consent', 'shared_data']), h);
    check('hand-off: her number and first name, her topic and best time, when she asked, the notice and the sections she ticked, exactly as she saw them',
      h.ref === r1.json.ref && h.phone === '+919876543210' && h.name === 'Asha' && h.topic === SHARE().topic && h.best_time === 'evening' && h.lang === 'hi' && h.asked_at === '2026-10-20T04:30:00Z'
      && JSON.stringify(h.consent) === JSON.stringify({ notice: '2026-10-23.2', shared: ['periods', 'questions'] }) && JSON.stringify(h.shared_data) === JSON.stringify(SHARE().shared_data), h);
    const rows = await reqRows(ctx);
    check('hand-off: once Qura has it, her topic and what she shared are deleted; the reference, status and Qura\'s lead id stay',
      rows.length === 1 && rows[0].status === 'sent' && rows[0].topic === null && rows[0].data === null && rows[0].lead === 'L-1' && rows[0].tries === 1 && rows[0].next === null && rows[0].sent === T0, rows);
    const g = await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    check('hand-off: GET shows her requests: reference, status and times, nothing else', g.status === 200 && g.json.available === true && g.json.requests.length === 1
      && JSON.stringify(g.json.requests[0]) === JSON.stringify({ ref: r1.json.ref, status: 'sent', created_at: '2026-10-20T04:30:00Z', sent_at: '2026-10-20T04:30:00Z' }), g.json);
    check('hand-off: the log has the reference and the result, never her topic or what she shared', ctx.logs.some((l) => l.event === 'handoff' && l.data.ref === r1.json.ref && l.data.result === 'sent') && !/MARKER/.test(JSON.stringify(ctx.logs)));
    const r2 = await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token });
    check('hand-off: a second request within 10 minutes is 429', r2.status === 429 && r2.json.error === 'too_many', r2.json);
    ctx.clock.add(600);
    const r3 = await call(ctx.api, 'POST', 'requests', SHARE({ shared: [], shared_data: { report_lang: 'en', sections: [] } }), { token: me.token });
    check('hand-off: she can ask for a call and share nothing from her diary', r3.status === 201 && JSON.stringify(ctx.send.handoffs[1].consent.shared) === '[]' && JSON.stringify(ctx.send.handoffs[1].shared_data) === JSON.stringify({ report_lang: 'en', sections: [] }), ctx.send.handoffs[1]);
    ctx.clock.add(600);
    check('hand-off: a third request in a day is fine', (await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token })).status === 201);
    ctx.clock.add(600);
    check('hand-off: a fourth in a day is 429', (await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token })).status === 429);
    const g2 = await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    check('hand-off: GET lists the newest first', g2.json.requests.length === 3 && g2.json.requests[0].created_at === '2026-10-20T04:50:00Z' && g2.json.requests[2].ref === r1.json.ref, g2.json);
    const other = await signUp(ctx, '+919812345678');
    check('hand-off: another woman sees none of her requests', JSON.stringify((await call(ctx.api, 'GET', 'requests', undefined, { token: other.token })).json.requests) === '[]');
    await call(ctx.api, 'DELETE', 'me', undefined, { token: me.token });
    check('hand-off: deleting her account deletes her requests', (await reqRows(ctx)).length === 0);
    if (ctx.kind === 'pglite') {
      const cols = (await ctx.db.query("select column_name as c from information_schema.columns where table_schema = 'sakhi' and table_name = 'call_requests' order by ordinal_position")).rows.map((x) => x.c);
      check('hand-off: its table holds the request and its status, nothing more', JSON.stringify(cols) === JSON.stringify(['id', 'ref', 'account_id', 'best_time', 'lang', 'notice', 'shared', 'topic', 'shared_data', 'status', 'tries', 'next_try_at', 'last_error', 'qura_lead_id', 'created_at', 'sent_at']), cols);
    }
  }

  /* ---------- 10.1 the hand-off when Qura is down: it waits, tries again on a schedule, then sends ---------- */
  {
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, HANDOFF_ENV) });
    const me = await signUp(ctx, '+919876543210');
    Object.assign(ctx.send.qura, { status: 503, data: { error: 'busy MARKER-QURA' } });
    const r = await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token });
    check('hand-off: Qura down (503): she still gets her reference, and the request waits', r.status === 201 && r.json.status === 'queued', r.json);
    let row = (await reqRows(ctx))[0];
    check('hand-off: a waiting request keeps what she shared, and tries again in 2 minutes', row.tries === 1 && row.topic === SHARE().topic && JSON.stringify(row.data) === JSON.stringify(SHARE().shared_data) && row.error === 'http_503' && row.next === T0 + 2 * 60000, row);
    ctx.clock.add(60);
    await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    check('hand-off: not tried again before its time', ctx.send.handoffs.length === 1);
    ctx.clock.add(60);
    await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    row = (await reqRows(ctx))[0];
    check('hand-off: her GET tries it when due; then it waits 10 minutes', ctx.send.handoffs.length === 2 && row.tries === 2 && row.next === T0 + 12 * 60000, row);
    ctx.send.fail.handoff = true;
    ctx.clock.add(600);
    await call(ctx.api, 'POST', 'me/active', {}, { token: me.token });
    row = (await reqRows(ctx))[0];
    check('hand-off: the daily "active" call tries it too; a network error waits 30 minutes', row.tries === 3 && row.status === 'queued' && row.error === 'network' && row.next === T0 + 42 * 60000, row);
    ctx.send.fail.handoff = false; Object.assign(ctx.send.qura, { status: 201, data: { lead_id: 77 } });
    ctx.clock.add(1800);
    const g = await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    row = (await reqRows(ctx))[0];
    check('hand-off: when Qura answers, it is sent and the health details go; a numeric lead id is kept as text', g.json.requests[0].status === 'sent' && row.status === 'sent' && row.lead === '77' && row.topic === null && row.data === null && row.tries === 4 && row.sent === T0 + 42 * 60000, row);
    check('hand-off: every try carried the same reference, so Qura makes one lead', ctx.send.handoffs.length === 3 && new Set(ctx.send.handoffs.map((x) => x.ref)).size === 1);
    check('hand-off: Qura\'s own reply text is never logged', !/MARKER/.test(JSON.stringify(ctx.logs)));
  }

  /* ---------- 10.1 the hand-off gives up: after 24 hours, at once on a refusal, or when nothing ran for a day ---------- */
  {
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, HANDOFF_ENV) });
    const me = await signUp(ctx, '+919876543210');
    ctx.send.qura.status = 500;
    await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token });
    for (let i = 0; i < 8; i++) { ctx.clock.add(3 * 3600); await call(ctx.api, 'GET', 'requests', undefined, { token: me.token }); }
    const row = (await reqRows(ctx))[0];
    check('hand-off: after 24 hours of failures it is marked failed, and her topic and what she shared are deleted', row.status === 'failed' && row.topic === null && row.data === null && row.error === 'http_500' && row.next === null, row);
    check('hand-off: the last try is at 24 hours, never later (8 tries, the waits growing)', ctx.send.handoffs.length === 8, ctx.send.handoffs.length);
    check('hand-off: her GET shows it failed, so the app offers the booking link', (await call(ctx.api, 'GET', 'requests', undefined, { token: me.token })).json.requests[0].status === 'failed');
    const her = await signUp(ctx, '+919812345678');
    ctx.send.qura.status = 400;
    const r4 = await call(ctx.api, 'POST', 'requests', SHARE(), { token: her.token });
    const row4 = (await reqRows(ctx))[1];
    check('hand-off: a refusal from Qura (400) fails at once, with no retry, and the health details go', r4.json.status === 'failed' && row4.status === 'failed' && row4.error === 'http_400' && row4.topic === null && row4.data === null && row4.tries === 1, row4);
    const her3 = await signUp(ctx, '+919811111111');
    Object.assign(ctx.send.qura, { status: 409, data: null });
    check('hand-off: 409 (Qura already has this reference) counts as sent', (await call(ctx.api, 'POST', 'requests', SHARE(), { token: her3.token })).json.status === 'sent');
    for (const st of [408, 429]) {
      const w = await signUp(ctx, st === 408 ? '+919822222222' : '+919833333333');
      ctx.send.qura.status = st;
      check('hand-off: ' + st + ' from Qura waits and tries again', (await call(ctx.api, 'POST', 'requests', SHARE(), { token: w.token })).json.status === 'queued');
    }
  }
  {
    const ctx = await newCtx(kind, { env: Object.assign({}, ENV, HANDOFF_ENV) });
    const me = await signUp(ctx, '+919876543210');
    ctx.send.qura.status = 503;
    await call(ctx.api, 'POST', 'requests', SHARE(), { token: me.token });
    ctx.clock.add(2 * 60);
    const c1 = await ctx.store.claimDueRequests(ctx.clock.now(), 5, null);
    const c2 = await ctx.store.claimDueRequests(ctx.clock.now(), 5, null);
    check('hand-off: a claimed request is not claimed again for a minute, so two calls at once never send it twice', c1.length === 1 && c2.length === 0, { c1: c1.length, c2: c2.length });
    check('hand-off: a claimed request carries her number, and when she asked as a number', c1[0] && c1[0].phone === '+919876543210' && typeof c1[0].created_ms === 'number' && c1[0].created_ms === T0, c1[0]);
    check('hand-off: claiming one reference leaves the others', (await ctx.store.claimDueRequests(ctx.clock.now() + 3600000, 5, 'QC-ZZZZZZ')).length === 0);
    ctx.clock.add(26 * 3600); ctx.send.qura.status = 201;
    await call(ctx.api, 'GET', 'requests', undefined, { token: me.token });
    const row = (await reqRows(ctx))[0];
    check('hand-off: a request nothing tried for over 25 hours fails without being sent late', row.status === 'failed' && row.error === 'expired' && row.topic === null && row.data === null && ctx.send.handoffs.length === 1, row);
  }

  /* ---------- a database failure never leaks details ---------- */
  {
    const { store } = await makeStore(kind);
    const broken = Object.assign({}, store, { findAccountByPhone: async () => { throw new Error('connection refused at 10.0.0.5'); } });
    const ctx = Object.assign({ kind }, makeApi(broken));
    const s = await sendCode(ctx, '+919876543210');
    const r = await call(ctx.api, 'POST', 'otp/verify', { challenge: s.json.challenge, code: ctx.send.lastCode(), birth_year: 1994, notice: '2026-10-20' });
    check('a store failure is 500 server_error with no internals', r.status === 500 && JSON.stringify(r.json) === '{"error":"server_error"}', r.json);
    check('the failure is logged for us', ctx.logs.some((l) => l.event === 'server_error' && /connection refused/.test(l.data.message)));
  }
}

/* ---------- daily clean-up (real SQL only: it uses the database clock) ---------- */
prefix = '[pglite] ';
{
  const ctx = await newCtx('pglite');
  const me = await signUp(ctx, '+919876543210');
  const db = ctx.db;
  await db.exec(`
    insert into sakhi.otp_challenges (id, phone, channel, code_hash, expires_at, created_at) values ('11111111-1111-4111-8111-111111111111', '+919800000009', 'sms', 'x', now() - interval '2 days', now() - interval '2 days');
    insert into sakhi.rate_hits (key, bucket, hits) values ('old', now() - interval '3 days', 1);
    insert into sakhi.sessions (token_hash, account_id, last_used_on, revoked_at) select 'revoked-old', id, current_date, now() - interval '31 days' from sakhi.accounts limit 1;
    insert into sakhi.sessions (token_hash, account_id, last_used_on) select 'idle-old', id, current_date - 400 from sakhi.accounts limit 1;
    update sakhi.sessions set last_used_on = current_date where token_hash not in ('revoked-old', 'idle-old');   -- her live session, on the real date the clean-up uses
    update sakhi.jobs set ran_at = now() - interval '25 hours';`);
  ctx.clock.add(31);
  await sendCode(ctx, '+919876543210');
  const left = (await db.query("select (select count(*) from sakhi.otp_challenges where id = '11111111-1111-4111-8111-111111111111')::int as c, (select count(*) from sakhi.rate_hits where key = 'old')::int as r, (select count(*) from sakhi.sessions where token_hash in ('revoked-old', 'idle-old'))::int as s, (select ran_at > now() - interval '1 minute' from sakhi.jobs) as ran")).rows[0];
  check('the first code request after 24 h clears old challenges, counters and dead sessions', left.c === 0 && left.r === 0 && left.s === 0 && left.ran === true, left);
  check('her live session survives the clean-up', (await call(ctx.api, 'GET', 'me', undefined, { token: me.token })).status === 200);
  await db.exec("insert into sakhi.otp_challenges (id, phone, channel, code_hash, expires_at, created_at) values ('22222222-2222-4222-8222-222222222222', '+919800000009', 'sms', 'x', now() - interval '2 days', now() - interval '2 days')");
  ctx.clock.add(31);
  await sendCode(ctx, '+919876543210');
  check('it runs at most once a day', (await db.query("select count(*)::int as n from sakhi.otp_challenges where id = '22222222-2222-4222-8222-222222222222'")).rows[0].n === 1);
}

/* ---------- the requests that go to Meta and AuthKey ---------- */
prefix = '';
{
  const sent = [];
  const okFetch = async (url, init) => { sent.push({ url, init }); return new Response('{"ok":true}', { status: 200 }); };
  const env = { SAKHI_WA_PHONE_ID: '123456789', SAKHI_META_TOKEN: 'meta-token', SAKHI_AUTHKEY_KEY: 'ak-key', SAKHI_AUTHKEY_OTP_SID: '777' };
  const s = makeSender(env, okFetch);
  await s.whatsapp('+919876543210', '424242');
  const wa = sent[0]; const wab = JSON.parse(wa.init.body);
  check('WhatsApp: Meta Cloud API v21.0, phone number ID, bearer token', wa.url === 'https://graph.facebook.com/v21.0/123456789/messages' && wa.init.headers.Authorization === 'Bearer meta-token');
  check('WhatsApp: the `otp` template, English, number with 91, code in body and button', wab.to === '919876543210' && wab.type === 'template' && wab.template.name === 'otp' && wab.template.language.code === 'en'
    && wab.template.components[0].parameters[0].text === '424242' && wab.template.components[1].sub_type === 'url' && wab.template.components[1].parameters[0].text === '424242', wab);
  await s.sms('+919876543210', '424242');
  const sm = sent[1]; const smb = JSON.parse(sm.init.body);
  check('SMS: AuthKey JSON API with Basic key, 10-digit number, template ID and code', sm.url === 'https://console.authkey.io/restapi/requestjson.php' && sm.init.headers.Authorization === 'Basic ak-key'
    && JSON.stringify(smb) === JSON.stringify({ country_code: '91', mobile: '9876543210', sid: '777', otp: '424242' }), smb);
  check('the WhatsApp request is exactly the template call: nothing but the number and the code', JSON.stringify(wab) === JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: '919876543210', type: 'template',
    template: { name: 'otp', language: { code: 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: '424242' }] }, { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: '424242' }] }] } }), wab);
  const bad = makeSender(env, async () => new Response('{"error":{"message":"Recipient not on WhatsApp"}}', { status: 400 }));
  let threw = ''; try { await bad.whatsapp('+919876543210', '1'); } catch (e) { threw = e.message; }
  check('a refused send throws with Meta\'s reason', threw === 'HTTP 400: Recipient not on WhatsApp', threw);
  const fakeToken = 'EAAfake' + 'Q7x'.repeat(30);
  const echo = makeSender(env, async () => new Response(JSON.stringify({ error: { message: 'Malformed access token ' + fakeToken, type: 'OAuthException', code: 190 } }), { status: 401 }));
  let echoed = ''; try { await echo.whatsapp('+919876543210', '1'); } catch (e) { echoed = e.message; }
  check('a refusal that repeats the token never carries it into the logs', echoed === 'HTTP 401 #190: Malformed access token [hidden]' && !echoed.includes('Q7xQ7x'), echoed);
  const ak = makeSender(env, async () => new Response('{"Message":"Invalid authkey","Status":"Error"}', { status: 401 }));
  let akSaid = ''; try { await ak.sms('+919876543210', '1'); } catch (e) { akSaid = e.message; }
  check('an AuthKey refusal keeps its reason', akSaid === 'HTTP 401: Invalid authkey', akSaid);
  let unset = ''; try { await makeSender({}, okFetch).sms('+919876543210', '1'); } catch (e) { unset = e.message; }
  check('a channel with no credentials throws instead of sending', unset === 'SMS is not configured');
  /* Version 33, the doctor-call hand-off (spec section 10.1) */
  const henv = { SAKHI_QURA_HANDOFF_URL: 'https://qura.test/api/partners/sakhi/v1/call-requests', SAKHI_QURA_KEY: 'k'.repeat(40) };
  const hsent = [];
  const hs = makeSender(henv, async (url, init) => { hsent.push({ url, init }); return new Response('{"lead_id":"L-9"}', { status: 201 }); });
  const hr = await hs.handoff({ ref: 'QC-ABCDEF', topic: 'x' });
  check('hand-off: one POST to Qura\'s address with the shared key and the request as JSON, and Qura\'s answer back', hsent.length === 1 && hsent[0].url === henv.SAKHI_QURA_HANDOFF_URL && hsent[0].init.method === 'POST'
    && hsent[0].init.headers['X-Sakhi-Key'] === 'k'.repeat(40) && hsent[0].init.headers['Content-Type'] === 'application/json' && hsent[0].init.body === '{"ref":"QC-ABCDEF","topic":"x"}' && hr.status === 201 && hr.data.lead_id === 'L-9', hr);
  const h5 = await makeSender(henv, async () => new Response('Bad gateway', { status: 502 })).handoff({});
  check('hand-off: a 5xx comes back as a status to try again on, not a throw', h5.status === 502 && h5.data === null, h5);
  let hdown = ''; try { await makeSender(henv, async () => { throw new TypeError('fetch failed'); }).handoff({}); } catch (e) { hdown = e.message; }
  check('hand-off: a network error throws, so the API waits and tries again', hdown === 'fetch failed', hdown);
  let hoff = ''; try { await makeSender({}, okFetch).handoff({}); } catch (e) { hoff = e.message; }
  check('hand-off: with no address or key it throws instead of sending', hoff === 'hand-off is not configured' && sent.length === 2, hoff);
}

/* ---------- the PIN-code loader (government CSV -> sakhi.pincodes) ---------- */
{
  const csv = '\uFEFFCircleName,RegionName,DivisionName,OfficeName,Pincode,OfficeType,Delivery,District,StateName\n'
    + 'Karnataka Circle,Bangalore HQ,Bangalore GPO,Bangalore GPO,560001,H.O,Delivery,BENGALURU URBAN,KARNATAKA\n'
    + 'Karnataka Circle,Bangalore HQ,Bangalore GPO,"Vidhana Soudha, S.O",560001,S.O,Delivery,BENGALURU URBAN,KARNATAKA\n'
    + 'Delhi Circle,Delhi,New Delhi Central,Parliament House S.O,110001,S.O,Delivery,NEW DELHI,DELHI\n'
    + 'Bihar Circle,Patna HQ,Patna,Bad Row,12345,S.O,Delivery,PATNA,BIHAR\n'
    + "Tamil Nadu Circle,Chennai,Chennai City,O'Neil Road S.O,600002,S.O,Delivery,CHENNAI,TAMIL NADU\n";
  const { sql, count } = pincodeSql(csv);
  check('loader: one row per PIN code, bad PIN codes skipped, quoted commas read', count === 3, { count });
  const db2 = await pgliteDb();
  await db2.exec('delete from sakhi.pincodes;');
  await db2.exec(sql);
  const rows = (await db2.query('select pincode, district, state from sakhi.pincodes order by pincode')).rows;
  check('loader: its SQL runs and names come out in title case', JSON.stringify(rows) === JSON.stringify([
    { pincode: '110001', district: 'New Delhi', state: 'Delhi' }, { pincode: '560001', district: 'Bengaluru Urban', state: 'Karnataka' }, { pincode: '600002', district: 'Chennai', state: 'Tamil Nadu' }]), rows);
}

/* ---------- start-up and the two allowlists ---------- */
{
  let refused = false; try { createApi({ store: {}, send: {}, env: { SAKHI_OTP_PEPPER: 'short', SAKHI_IP_SALT_SEED: 'short' } }); } catch (e) { refused = true; }
  check('the server refuses to start with short or missing secrets', refused);
  const appJs = fs.readFileSync(path.join(here, '..', '..', 'web', 'app.js'), 'utf8');
  const block = (appJs.match(/const SEND = \{([\s\S]*?)\n  \};/) || [])[1] || '';
  const appSend = {};
  for (const m of block.matchAll(/'([A-Z]+ [a-z/]+)': \[([^\]]*)\]/g)) appSend[m[1]] = m[2].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  const serverAllow = Object.assign({}, ALLOW); delete serverAllow['GET me'];
  check('the app\'s SEND list and the server\'s ALLOW list are identical', Object.keys(appSend).length === 9 && JSON.stringify(appSend) === JSON.stringify(serverAllow), { appSend });
  const shareKeys = ((appJs.match(/const SHARE_KEYS = \[([\s\S]*?)\];/) || [])[1] || '').split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  check('the report sections the app can share are the ones the server accepts', shareKeys.length === 7 && JSON.stringify(shareKeys) === JSON.stringify(SHARE_KEYS), shareKeys);
  const keys = ((appJs.match(/const USAGE_KEYS = \[([\s\S]*?)\];/) || [])[1] || '').split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  check('the tools the app counts are the tools the server accepts', keys.length > 20 && JSON.stringify(keys) === JSON.stringify(USAGE_TOOLS), keys);
  check('the counted tools leave out loss, abortion and safety', !USAGE_TOOLS.some((k) => /loss|abortion|safety|intimate|sti/.test(k)));
}

const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' server checks pass');
process.exit(pass === results.length ? 0 : 1);
