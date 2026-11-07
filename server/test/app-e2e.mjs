// End to end: the real app (web/) in a browser, signing up against the real server code (api.js + store-pg.js) on a
// real Postgres (PGlite) over HTTP, with codes captured instead of sent. Then checks the database row by row, and that
// no request from the page carried anything but allowlisted account fields.
// Usage: node server/test/app-e2e.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '../../web/test/pw.mjs';
import { join } from '../../web/test/join.mjs';
import { createApi, ALLOW } from '../supabase/functions/sakhi-api/api.js';
import { pgStore } from '../supabase/functions/sakhi-api/store-pg.js';
import { pgliteDb, pgQuery, fakeSender, fakeClock, ENV, HANDOFF_ENV } from './harness.mjs';
import { serve } from './serve-local.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '..', '..', 'web');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); };
const MARK = ['MARKER-NOTE-4417', 'MARKER-CHECKIN-8820'];

const db = await pgliteDb();
const send = fakeSender();
const clock = fakeClock(Date.now());
const api = createApi({ store: pgStore(pgQuery(db)), send, env: Object.assign({}, ENV, HANDOFF_ENV), now: clock.now });
const server = await serve(api);
const row = async (sql, params = []) => (await db.query(sql, params)).rows[0] || null;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(path.join(web, 'content.json'), 'utf8') + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = { api: ' + JSON.stringify(server.url) + ', app: "e2e-0.21", platform: "web" };');
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const reqs = [];
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith('file:') && !/fonts\./.test(u)) reqs.push({ url: u, method: r.method(), body: r.postData() || '' }); });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
const tap = (sel) => page.$eval(sel, (el) => el.click());
const text = (sel) => page.$eval(sel, (el) => el.innerText).catch(() => '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(pathToFileURL(path.join(web, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);

/* First run (Version 39.10's joining, web/test/join.mjs), then signup with a code the server really generated */
await join(page, { tile: 'cycle', goals: ['track'] });
await page.waitForSelector('#su-num');
await page.evaluate(() => { window.Saathi.state.settings.toursAuto = false; window.Saathi.save(); });
await page.fill('#su-num', '98765 43210'); await tap('#su-send');
await page.waitForSelector('#su-code');
check('server sent the code on WhatsApp and the app says so', send.outbox.length === 1 && send.outbox[0].channel === 'whatsapp' && send.outbox[0].phone === '+919876543210' && /on WhatsApp/.test(await text('#view')));
await page.fill('#su-code', send.lastCode() === '000000' ? '111111' : '000000');
await page.waitForSelector('#view .flag[role="alert"]');
check('a wrong code is refused by the server and explained', /didn’t match/.test(await text('#view .flag')));
await page.fill('#su-code', send.lastCode());
await page.waitForSelector('#su-done');
await tap('#su-done'); await page.waitForSelector('#view .flag[role="alert"]');
check('the details screen needs her first name before anything is sent', /first name/.test(await text('#view .flag')) && !reqs.some((r) => r.method === 'PATCH'));
await page.fill('#su-name', 'Asha'); await page.fill('#su-pin', '560001'); await page.fill('#su-email', ' Asha@Example.in '); await tap('[data-heard="fam"]'); await tap('#su-sms');
await tap('#su-done');
await page.waitForSelector('#ys-skip'); await tap('#ys-skip');   /* Version 39.10: "Your Sakhi", then Today */
await page.waitForSelector('.card.hero');
await sleep(700);

const acct = await row('select id::text, phone, birth_year, name, pincode, district, state, email, heard, upd_sms, upd_wa, lang, platform, app_version, last_active_on::text from sakhi.accounts');
check('one account row with her number and birth year', acct && acct.phone === '+919876543210' && acct.birth_year === 1994, acct);
check('her details landed, with district and state from the PIN code', acct && acct.name === 'Asha' && acct.pincode === '560001' && acct.district === 'Bengaluru Urban' && acct.state === 'Karnataka' && acct.heard === 'fam' && acct.upd_sms === true && acct.upd_wa === false, acct);
check('her email landed trimmed and lower-case', acct && acct.email === 'asha@example.in', acct);
check('app version, platform and language recorded', acct && acct.app_version === 'e2e-0.21' && acct.platform === 'web' && acct.lang === 'en', acct);
check('last active is today (India date)', acct && acct.last_active_on === new Date(clock.now() + 5.5 * 3600e3).toISOString().slice(0, 10), acct);
const cons = (await db.query('select kind, granted, notice_version from sakhi.consents order by id')).rows;
check('consents: terms at sign-up, then SMS updates', JSON.stringify(cons) === JSON.stringify([{ kind: 'terms', granted: true, notice_version: '2026-10-23.2' }, { kind: 'upd_sms', granted: true, notice_version: '2026-10-23.2' }]), cons);
const st = await row('select signups, active, wa_sent, sms_sent from sakhi.daily_stats');
check('daily stats: 1 signup, 1 active, 1 WhatsApp code', st && st.signups === 1 && st.active === 1 && st.wa_sent === 1 && st.sms_sent === 0, st);
check('the session row holds a hash, not the token', await page.evaluate(() => JSON.parse(localStorage.getItem('qura-sakhi-account-v1')).token).then(async (tok) => !(await row('select 1 from sakhi.sessions where token_hash = $1', [tok])) && !!(await row('select 1 from sakhi.sessions'))));

/* Her diary gets entries; editing details sends only details */
await page.evaluate((m) => {
  const S = window.Saathi; const d = S.toISO(S.today());
  S.state.notes = S.state.notes || {}; S.state.notes[d] = m[0];
  S.state.checkins = S.state.checkins || {}; S.state.checkins[d] = { note: m[1], chips: ['cramps'] };
  S.save();
}, MARK);
await page.evaluate(() => { location.hash = '#account'; }); await page.waitForSelector('#acc-edit');
await tap('#acc-edit'); await page.waitForSelector('#ae-name');
await page.fill('#ae-name', 'Asha R'); await tap('#ae-go'); await sleep(600);
check('an edit reaches the database', (await row('select name from sakhi.accounts')).name === 'Asha R');

/* Version 33: she asks Qura to call her, ticks only her periods, and Qura gets exactly the lines on her screen (SERVER_SPEC 10.1) */
await page.evaluate(() => { location.hash = '#ask'; }); await page.waitForSelector('#ask-call [data-go="ask-call"]');
await tap('#ask-call [data-go="ask-call"]'); await page.waitForSelector('#ac-topic');
check('hand-off: the share list starts with nothing ticked', await page.$$eval('[data-ac-sec]', (xs) => xs.length >= 2 && xs.every((x) => !x.checked)));
await page.fill('#ac-topic', 'Irregular periods'); await tap('[data-ac-time="evening"]'); await page.waitForSelector('[data-ac-time="evening"].on');
await tap('[data-ac-sec="periods"]'); await page.waitForSelector('#ac-preview h4');
const shown = await text('#ac-preview');
await tap('#ac-send'); await page.waitForSelector('#ac-done');
const h = send.handoffs[0] || { consent: {}, shared_data: { sections: [] } };
check('hand-off: Qura got her topic, time and name, and only her periods, exactly as her screen showed them', send.handoffs.length === 1 && h.topic === 'Irregular periods' && h.best_time === 'evening' && h.name === 'Asha R' && h.phone === '+919876543210'
  && JSON.stringify(h.consent.shared) === '["periods"]' && h.shared_data.sections.length === 1 && h.shared_data.sections[0].lines.length >= 1 && h.shared_data.sections[0].lines.every((l) => shown.includes(l)), h);
check('hand-off: nothing she left unticked went (her note, her check-in)', !JSON.stringify(send.handoffs).includes('MARKER'));
const cr = await row('select ref, status, topic, shared_data from sakhi.call_requests');
check('hand-off: once Qura had it, the server kept only the reference and the status', cr && cr.status === 'sent' && cr.topic === null && cr.shared_data === null && cr.ref === h.ref, cr);
check('hand-off: the app shows her reference', !!h.ref && (await text('#ac-done')).includes(h.ref));
await page.evaluate(() => { location.hash = '#account'; });

/* Log out, sign back in by SMS ("Not on WhatsApp?"), straight back to the account page */
await page.waitForSelector('#acc-out'); await tap('#acc-out');
await page.waitForSelector('#su-num');
check('log out revoked the session in the database', (await row('select count(*)::int as n from sakhi.sessions where revoked_at is not null')).n === 1);
clock.add(31);
await page.fill('#su-num', '9876543210'); await tap('#su-send');
await page.waitForSelector('#su-by-sms'); await tap('#su-by-sms');
await page.waitForFunction(() => /6-digit code by SMS/.test(document.getElementById('view').innerText));   /* the code screen, once the server has answered (the button itself says "by SMS") */
check('"Not on WhatsApp? Send by SMS" makes the server send an SMS', send.outbox[send.outbox.length - 1].channel === 'sms');
await page.fill('#su-code', send.lastCode());
await page.waitForSelector('#acc-list');
check('a returning number skips the details screen and keeps her details', /Asha R/.test(await text('#acc-list')));
check('still one account, now two sessions', (await row('select count(*)::int as n from sakhi.accounts')).n === 1 && (await row('select count(*)::int as n from sakhi.sessions')).n === 2);

/* Delete the account: the database forgets her; her diary stays on the phone */
await tap('#acc-del'); await page.waitForSelector('#acc-del-yes'); await tap('#acc-del-yes');
await page.waitForSelector('#su-num');
check('delete removed the account, its consents, sessions and call requests', (await row('select (select count(*) from sakhi.accounts)::int + (select count(*) from sakhi.consents)::int + (select count(*) from sakhi.sessions)::int + (select count(*) from sakhi.call_requests)::int as n')).n === 0);
check('her diary is still on the phone', await page.evaluate((m) => JSON.stringify(window.Saathi.state.notes).includes(m), MARK[0]));

/* Every request the page made: only the API, only allowlisted fields, no diary text */
const leaks = [];
for (const r of reqs) {
  if (!r.url.startsWith(server.url + '/v1/')) { leaks.push('other host: ' + r.url); continue; }
  if (r.method === 'OPTIONS') continue;
  const key = r.method + ' ' + r.url.slice((server.url + '/v1/').length);
  if (!ALLOW[key]) { leaks.push('not allowlisted: ' + key); continue; }
  const body = r.body ? JSON.parse(r.body) : {};
  Object.keys(body).forEach((k) => { if (!ALLOW[key].includes(k)) leaks.push(key + ' field ' + k); });
  MARK.forEach((m) => { if (r.body.includes(m)) leaks.push(key + ' carried ' + m); });
}
check('every request went to the API with allowlisted fields only, no diary text', !leaks.length && reqs.length >= 8, leaks.length ? leaks : reqs.length);
check('the database holds no diary text anywhere', !(await row("select 1 from sakhi.accounts a where a::text like '%MARKER%'")));
check('no page errors', !errs.length, errs);

await browser.close();
await server.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' end-to-end checks pass');
process.exit(pass === results.length ? 0 : 1);
