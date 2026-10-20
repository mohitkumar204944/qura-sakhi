// Contract tests for the Sakhi accounts API: every row of server/SERVER_SPEC.md section 5, run twice, once on the
// in-memory store and once on the real SQL in PGlite, plus the sender's requests and the app/server allowlist match.
// Usage: node server/test/api.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOW, createApi } from '../supabase/functions/sakhi-api/api.js';
import { makeSender } from '../supabase/functions/sakhi-api/send.js';
import { makeStore, makeApi, call, fakeSender, ENV, pgliteDb } from './harness.mjs';
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
  check('the app\'s SEND list and the server\'s ALLOW list are identical', Object.keys(appSend).length === 6 && JSON.stringify(appSend) === JSON.stringify(serverAllow), { appSend });
}

const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' server checks pass');
process.exit(pass === results.length ? 0 : 1);
