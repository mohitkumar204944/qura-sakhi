// Signup walk against a stand-in server (Playwright routes that follow SERVER_SPEC.md), plus the promise that the diary
// never leaves the phone: every request the page makes is recorded and checked against the allowlist.
// Covers: first run, wrong code, her details (first name and PIN code needed, email optional; the screen comes back after a
// restart and for an older account without them), daily "last active", under 18, offline + "Continue for now", "Just read",
// account page (edit, log out, sign back in, delete), expired session (401), an older diary with no birth year,
// the prototype mode with no server, Hindi, Help during the gate, and a scan of the code for other network calls.
// Usage: node test/signup.mjs [dir]   (dir defaults to this app folder). Screenshots go to test/shots/signup-*.png.
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const shots = path.join(here, 'shots'); fs.mkdirSync(shots, { recursive: true });
const API = 'https://api.sakhi.test';
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const MARK = ['MARKER-NOTE-7731', 'MARKER-CHECKIN-5520', 'MARKER-TOPIC-9043'];
const HEALTH_KEYS = ['events', 'daily', 'notes', 'situation', 'checkins', 'pregnant', 'symptoms', 'dob', 'cycle', 'period', 'mods', 'leads'];
const ALLOWED = {
  'POST otp/start': ['phone', 'channel', 'lang', 'app', 'platform'],
  'POST otp/verify': ['challenge', 'code', 'birth_year', 'notice', 'lang', 'app', 'platform'],
  'PATCH me': ['name', 'pincode', 'email', 'heard', 'upd_sms', 'upd_wa', 'lang'],
  'POST me/active': ['app', 'lang'],
  'POST session/logout': [],
  'DELETE me': []
};

const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond, extra }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); };

/* The stand-in server: what SERVER_SPEC.md says, kept in memory. The code is always 424242. */
function makeServer() {
  const s = { calls: [], accounts: {}, challenges: {}, sessions: {}, down: false, n: 0 };
  s.handle = async (route) => {
    const req = route.request(); const method = req.method(); const url = new URL(req.url());
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'content-type': 'application/json' };
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' });
    if (s.down) return route.abort('internetdisconnected');
    const p = url.pathname.replace(/^\/v1\//, ''); const raw = req.postData() || ''; let body = {}; try { body = raw ? JSON.parse(raw) : {}; } catch (e) { body = { _bad: raw }; }
    const auth = (req.headers().authorization || '').replace(/^Bearer /, '');
    s.calls.push({ key: method + ' ' + p, body, raw, auth, url: req.url() });
    const send = (status, obj) => route.fulfill({ status, headers: cors, body: obj === undefined ? '' : JSON.stringify(obj) });
    if (method === 'POST' && p === 'otp/start') {
      if (!/^\+91[6-9]\d{9}$/.test(body.phone || '')) return send(400, { error: 'phone_bad' });
      const id = 'ch' + (++s.n); s.challenges[id] = { phone: body.phone, tries: 0 }; return send(200, { challenge: id, channel: body.channel === 'sms' ? 'sms' : 'whatsapp', resend_after: 30, expires_in: 600 });
    }
    if (method === 'POST' && p === 'otp/verify') {
      const c = s.challenges[body.challenge]; if (!c) return send(400, { error: 'challenge_bad' });
      if (body.code !== '424242') { c.tries += 1; return send(400, { error: c.tries >= 5 ? 'too_many' : 'code_wrong', tries_left: 5 - c.tries }); }
      delete s.challenges[body.challenge];
      let a = Object.values(s.accounts).find((x) => x.phone === c.phone); const isNew = !a;
      if (!a) { a = { id: 'acc' + (++s.n), phone: c.phone, birth_year: body.birth_year || null, name: null, pincode: null, email: null, heard: null, upd_sms: false, upd_wa: false }; s.accounts[a.id] = a; }
      const tok = 'tok' + (++s.n); s.sessions[tok] = a.id; return send(200, { token: tok, is_new: isNew, account: a });
    }
    const a = s.accounts[s.sessions[auth]];
    if (!a) return send(401, { error: 'unauthorized' });
    if (method === 'PATCH' && p === 'me') {
      if (body.name === '' || body.pincode === '') return send(400, { error: body.name === '' ? 'name_bad' : 'pincode_bad' });   /* needed: never emptied */
      ['name', 'pincode', 'email', 'heard', 'upd_sms', 'upd_wa'].forEach((k) => { if (body[k] !== undefined) a[k] = body[k] === '' ? null : body[k]; }); return send(200, { account: a });
    }
    if (method === 'POST' && p === 'me/active') { a.last_active_app = body.app; return send(204); }
    if (method === 'POST' && p === 'session/logout') { delete s.sessions[auth]; return send(204); }
    if (method === 'DELETE' && p === 'me') { Object.keys(s.sessions).forEach((k) => { if (s.sessions[k] === a.id) delete s.sessions[k]; }); delete s.accounts[a.id]; return send(204); }
    return send(404, { error: 'not_found' });
  };
  return s;
}

const browser = await chromium.launch();
const all = [];   // every request from every page in this run, for the leak check
async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 390, height: 844 }, locale: opts.locale || 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  if (opts.api !== false) await ctx.addInitScript('window.SAKHI_CONFIG = { api: "' + API + '", app: "test-0.20", platform: "web" };');
  if (opts.seed) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(opts.seed)) + '); }');
  const srv = opts.srv || makeServer();
  await ctx.route(API + '/**', srv.handle);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const reqs = [];
  ctx.on('request', (r) => { const u = r.url(); if (u.startsWith('file:') || /fonts\.(googleapis|gstatic)\.com/.test(u) || u.startsWith('data:')) return; const x = { url: u, method: r.method(), body: r.postData() || '', who: opts.name }; reqs.push(x); all.push(x); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (opts.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, srv, reqs, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
const text = (page, sel) => page.$eval(sel, (el) => el.innerText).catch(() => '');
const h1 = (page) => text(page, '#view h1');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function noTours(page) { await page.evaluate(() => { const S = window.Saathi; S.state.settings.toursAuto = false; S.save(); }); }
async function firstRun(page, o = {}) {
  await page.waitForSelector(o.lang === 'hi' ? '[data-ob-lang="hi"]' : '[data-ob-lang="en"]'); await tap(page, o.lang === 'hi' ? '[data-ob-lang="hi"]' : '[data-ob-lang="en"]');
  await page.waitForSelector(o.read ? '#w-browse' : '#w-start'); await tap(page, o.read ? '#w-browse' : '#w-start');
  await page.waitForSelector('[data-ob-dec="1990"]');
  if (o.under18) { await tap(page, '[data-ob-dec="post"]'); return; }
  await tap(page, '[data-ob-dec="1990"]'); await page.waitForSelector('[data-ob-y="1994"]'); await tap(page, '[data-ob-y="1994"]');
  if (o.read) return;
  await page.waitForSelector('[data-ob-st="cycle"]'); await tap(page, '[data-ob-st="cycle"]');
  await page.waitForSelector('[data-ob-lp="7"]'); await tap(page, '[data-ob-lp="7"]');
  await page.waitForSelector('[data-ob-sh="me"]'); await tap(page, '[data-ob-sh="me"]');
}
async function signIn(page, num, o = {}) {
  await page.waitForSelector('#su-num');
  await page.fill('#su-num', num); await tap(page, '#su-send');
  await page.waitForSelector('#su-code');
  await page.fill('#su-code', o.code || '424242');
  if (o.returning) { await page.waitForFunction(() => !document.querySelector('#su-code')); return; }
  await page.waitForSelector('#su-done');
  if (o.fill !== false) { await page.fill('#su-name', o.name || 'Test'); await page.fill('#su-pin', o.pin || '560001'); await tap(page, '#su-done'); }
}
const shot = (page, name) => page.screenshot({ path: path.join(shots, 'signup-' + name + '.png') });

/* ---------- 1. First run, wrong code, optional details, Home ---------- */
{
  const { ctx, page, srv, errs } = await open({ name: 'first' });
  await firstRun(page);
  await page.waitForSelector('#su-num');
  await noTours(page);
  check('1 gate after the first run', /mobile number/i.test(await h1(page)));
  await shot(page, '1-number');
  await page.fill('#su-num', '12345'); await tap(page, '#su-send'); await sleep(150);
  check('1 short number refused on the phone', /10-digit/.test(await text(page, '#view .flag')) && !srv.calls.length);
  await page.fill('#su-num', '+91 98765-43210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code');
  const st = srv.calls.find((c) => c.key === 'POST otp/start');
  check('1 otp/start sends phone in E.164 + lang/app/platform only', st && st.body.phone === '+919876543210' && Object.keys(st.body).sort().join() === 'app,lang,phone,platform', st && st.body);
  check('1 code screen shows the number and a resend countdown', /\+91[ \u00a0]98765[ \u00a0]43210/.test(await text(page, '#view')) && /^New code in 0:[0-3]\d$/.test(await text(page, '#su-resend')) && await page.$eval('#su-resend', (b) => b.disabled));
  check('1 no prototype line when a server is set', !/Prototype: no message/.test(await text(page, '#view')));
  check('1 code came on WhatsApp, SMS one tap away', /on WhatsApp/.test(await text(page, '#view')) && !!(await page.$('#su-by-sms')));
  await shot(page, '2-code');
  await tap(page, '#su-by-sms'); await page.waitForFunction(() => /by SMS/.test(document.getElementById('view').innerText));
  const bySms = srv.calls.filter((c) => c.key === 'POST otp/start').pop();
  check('1 "Send by SMS" asks the server for SMS, same number', bySms && bySms.body.channel === 'sms' && bySms.body.phone === '+919876543210' && !(await page.$('#su-by-sms')), bySms && bySms.body);
  await page.fill('#su-code', '111111'); await page.waitForSelector('#view .flag');
  check('1 wrong code explained', /didn’t match/.test(await text(page, '#view .flag')));
  await page.fill('#su-code', '424242'); await page.waitForSelector('#su-done');
  const vf = srv.calls.filter((c) => c.key === 'POST otp/verify').pop();
  check('1 verify carries birth year 1994 and notice version, nothing else', vf && vf.body.birth_year === 1994 && vf.body.notice === '2026-10-20.2' && Object.keys(vf.body).every((k) => ALLOWED['POST otp/verify'].includes(k)), vf && vf.body);
  check('1 details screen: name and PIN code needed, email optional, no Skip', /Almost done/.test(await h1(page)) && /First name/.test(await text(page, '#view')) && !/First name \(optional\)/.test(await text(page, '#view'))
    && /Email \(optional\)/.test(await text(page, '#view')) && !!(await page.$('#su-email')) && !(await page.$('#su-skip')));
  await shot(page, '3-about');
  await tap(page, '#su-done'); await sleep(150);
  check('1 no first name: asked for it, put in the field, nothing sent', /Enter your first name/.test(await text(page, '#view .flag')) && await page.evaluate(() => document.activeElement && document.activeElement.id === 'su-name') && !srv.calls.some((c) => c.key === 'PATCH me'));
  await page.fill('#su-name', 'Asha'); await tap(page, '#su-done'); await sleep(150);
  check('1 no PIN code: asked for it', /6-digit PIN code/.test(await text(page, '#view .flag')) && !srv.calls.some((c) => c.key === 'PATCH me'));
  await page.fill('#su-pin', '56000'); await tap(page, '[data-heard="fam"]'); await tap(page, '#su-sms');
  await tap(page, '#su-done'); await sleep(150);
  check('1 five-digit PIN code refused', /6-digit PIN code/.test(await text(page, '#view .flag')));
  await page.fill('#su-pin', '560001'); await page.fill('#su-email', 'asha@'); await tap(page, '#su-done'); await sleep(150);
  check('1 an email that isn\'t one is refused', /email doesn’t look right/.test(await text(page, '#view .flag')) && !srv.calls.some((c) => c.key === 'PATCH me'));
  await page.fill('#su-email', ' Asha@Example.IN '); await tap(page, '#su-done');
  await page.waitForSelector('.card.hero');
  await sleep(400);
  const pt = srv.calls.find((c) => c.key === 'PATCH me');
  check('1 details sent with the session token', pt && pt.auth.startsWith('tok') && pt.body.name === 'Asha' && pt.body.pincode === '560001' && pt.body.heard === 'fam' && pt.body.upd_sms === true && pt.body.upd_wa === false, pt && pt.body);
  check('1 the email goes trimmed and lower-case', pt && pt.body.email === 'asha@example.in', pt && pt.body);
  check('1 her details go once, not twice at the same moment', srv.calls.filter((c) => c.key === 'PATCH me').length === 1, srv.calls.map((c) => c.key));
  check('1 Home after signup, no reminder card', !(await page.$('[data-su-go]')));
  check('1 last-active sent once today', srv.calls.filter((c) => c.key === 'POST me/active').length === 1);
  const stores = await page.evaluate(() => ({ diary: localStorage.getItem('qura-saathi-v1') || '', acc: localStorage.getItem('qura-sakhi-account-v1') || '' }));
  check('1 diary storage holds no token or phone', !/tok\d|9876543210|upd_sms/.test(stores.diary));
  check('1 account storage holds no diary', !/"events"|"daily"|"situation"|"notes"/.test(stores.acc) && /9876543210/.test(stores.acc));

  /* ---------- 2. The diary never leaves the phone ---------- */
  await page.evaluate((m) => {
    const S = window.Saathi; const d = S.toISO(S.today());
    S.state.notes = S.state.notes || {}; S.state.notes[d] = m[0];
    S.state.checkins = S.state.checkins || {}; S.state.checkins[d] = { note: m[1], chips: ['cramps', 'heavy'] };
    S.state.daily = S.state.daily || {}; S.state.daily[d] = { pain: ['cramps'], mood: ['low'] };
    S.state.askTopics = [m[2]]; S.save();
  }, MARK);
  await page.evaluate(() => { location.hash = '#account'; }); await page.waitForSelector('#acc-edit');
  check('2 account page shows what Qura keeps', /Asha/.test(await text(page, '#acc-list')) && /560001/.test(await text(page, '#acc-list')) && /asha@example\.in/.test(await text(page, '#acc-list')) && /Friend or family/.test(await text(page, '#acc-list')) && /SMS: on · WhatsApp: off/.test(await text(page, '#acc-list')) && /•••/.test(await text(page, '#acc-list')));
  await shot(page, '4-account');
  await tap(page, '#acc-edit'); await page.waitForSelector('#ae-name');
  const patches = srv.calls.filter((c) => c.key === 'PATCH me').length;
  await page.fill('#ae-name', ''); await tap(page, '#ae-go'); await sleep(200);
  check('2 the first name can\'t be emptied in Edit details', /Enter your first name/.test(await text(page, '#ae-err')) && srv.calls.filter((c) => c.key === 'PATCH me').length === patches && !!(await page.$('#ae-name')));
  await page.fill('#ae-name', 'Asha R'); await page.fill('#ae-email', ''); await tap(page, '#ae-wa'); await tap(page, '#ae-go'); await sleep(500);
  const pt2 = srv.calls.filter((c) => c.key === 'PATCH me').pop();
  check('2 edit sends only the new details', pt2 && pt2.body.name === 'Asha R' && pt2.body.upd_wa === true && pt2.body.email === '', pt2 && pt2.body);
  check('2 account page updated, email cleared', /Asha R/.test(await text(page, '#acc-list')) && /WhatsApp: on/.test(await text(page, '#acc-list')) && !/asha@example/.test(await text(page, '#acc-list')));
  // Next day: the stored "last active" date is yesterday's, so opening the app sends one more ping.
  await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('qura-sakhi-account-v1')); a.activeOn = '2000-01-01'; localStorage.setItem('qura-sakhi-account-v1', JSON.stringify(a)); });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await sleep(600);
  check('2 a new day sends one more last-active', srv.calls.filter((c) => c.key === 'POST me/active').length === 2);
  // Ask form: her number is filled in from the account (it stays on the phone in this prototype).
  await page.evaluate(() => { location.hash = '#ask'; }); await page.waitForSelector('#ask-phone');
  check('2 Ask form prefilled from the account', (await page.$eval('#ask-phone', (i) => i.value)) === '9876543210' && (await page.$eval('#ask-name', (i) => i.value)) === 'Asha R');

  /* ---------- 3. Log out, back in on the same number, then delete ---------- */
  await page.evaluate(() => { location.hash = '#account'; }); await page.waitForSelector('#acc-out');
  const tokBefore = srv.calls.filter((c) => c.key === 'PATCH me').pop().auth;
  await tap(page, '#acc-out'); await page.waitForSelector('#su-num');
  const lo = srv.calls.find((c) => c.key === 'POST session/logout');
  check('3 log out revokes the session on the server', lo && lo.auth === tokBefore && !srv.sessions[tokBefore]);
  check('3 diary kept after log out', await page.evaluate(() => Object.keys(window.Saathi.state.notes || {}).length === 1 && window.Saathi.state.events.length >= 1));
  await signIn(page, '9876543210', { returning: true });
  await page.waitForSelector('#acc-list');   /* back where she was: the account page */
  check('3 returning number skips the details screen', srv.calls.filter((c) => c.key === 'POST otp/verify').length === 3 && Object.keys(srv.accounts).length === 1);
  await page.evaluate(() => { location.hash = '#account'; }); await page.waitForSelector('#acc-del');
  check('3 details came back from the server', /Asha R/.test(await text(page, '#acc-list')));
  await tap(page, '#acc-del'); await page.waitForSelector('#acc-del-yes');
  check('3 delete explains the diary stays', /diary on this phone stays/.test(await text(page, '#acc-box')));
  await tap(page, '#acc-del-yes'); await page.waitForSelector('#su-num');
  check('3 account deleted on the server', srv.calls.some((c) => c.key === 'DELETE me') && !Object.keys(srv.accounts).length);
  check('3 diary kept after account delete', await page.evaluate(() => Object.keys(window.Saathi.state.notes || {}).length === 1));
  check('3 no account left on the phone', await page.evaluate(() => !localStorage.getItem('qura-sakhi-account-v1') && !window.Saathi.account.signedIn()));
  // Help stays open while signed out.
  await page.evaluate(() => { location.hash = '#help'; }); await sleep(200);
  check('3 Help is reachable without an account', /Help/.test(await h1(page)) && !(await page.$('#su-num')));
  check('1-3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. Under 18: no account, nothing sent ---------- */
{
  const { ctx, page, reqs, errs } = await open({ name: 'u18' });
  await firstRun(page, { under18: true });
  await page.waitForSelector('#u18-back');
  await tap(page, '#view [data-go="learn"]'); await sleep(300);
  check('4 under 18 reads without signing up', !(await page.$('#su-num')) && !reqs.length);
  await page.evaluate(() => { location.hash = '#home'; }); await sleep(200);
  check('4 no gate anywhere for under 18', !(await page.$('#su-num')));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. Offline: "Continue for now", the Home reminder, then signing up ---------- */
{
  const srv = makeServer(); srv.down = true;
  const { ctx, page, errs } = await open({ name: 'offline', srv });
  await firstRun(page); await page.waitForSelector('#su-num'); await noTours(page);
  await page.fill('#su-num', '9123456789'); await tap(page, '#su-send'); await page.waitForSelector('#su-later');
  check('5 offline explained with a way on', /Couldn’t reach Qura/.test(await text(page, '#view .flag')));
  await shot(page, '5-offline');
  await tap(page, '#su-later'); await page.waitForSelector('.card.hero');
  check('5 Home keeps a reminder card', /Finish signing up/.test(await text(page, '#view')));
  srv.down = false;
  await tap(page, '#view [data-su-go]'); await signIn(page, '9123456789'); await page.waitForSelector('.card.hero');
  check('5 signed up later, card gone', await page.evaluate(() => window.Saathi.account.signedIn()) && !/Finish signing up/.test(await text(page, '#view')));
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. "Just read": birth year, signup, then the guides ---------- */
{
  const { ctx, page, srv, errs } = await open({ name: 'reader' });
  await firstRun(page, { read: true });
  await page.waitForSelector('#su-num');
  check('6 reader asked the birth year, then the gate', await page.evaluate(() => window.Saathi.state.stage === 'browse' && window.Saathi.state.dob === '1994-07-01'));
  await signIn(page, '9000012345');
  await page.waitForFunction(() => !document.querySelector('#su-done'));
  check('6 reader lands on the guides', await page.evaluate(() => location.hash === '#care'));
  const vf = srv.calls.find((c) => c.key === 'POST otp/verify');
  check('6 reader birth year sent', vf && vf.body.birth_year === 1994);
  await page.evaluate(() => { location.hash = '#home'; }); await sleep(200);
  check('6 readers page links to the account', !!(await page.$('#view [data-go="account"]')));
  await tap(page, '#view [data-go="account"]'); await page.waitForSelector('#acc-list');
  check('6 reader account page opens', /•••/.test(await text(page, '#acc-list')));
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Session ended on the server (401) brings the gate back ---------- */
{
  const { ctx, page, srv, errs } = await open({ name: 'expired' });
  await firstRun(page); await noTours(page); await signIn(page, '9811111111'); await page.waitForSelector('.card.hero');
  srv.sessions = {};
  await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('qura-sakhi-account-v1')); a.activeOn = '2000-01-01'; localStorage.setItem('qura-sakhi-account-v1', JSON.stringify(a)); });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await sleep(600);
  check('7 401 signs her out on the phone', await page.evaluate(() => !window.Saathi.account.signedIn()));
  await page.evaluate(() => { location.hash = '#diary'; }); await sleep(200);
  check('7 gate shows again after 401', !!(await page.$('#su-num')));
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. An older diary with no birth year (e.g. a restored backup) ---------- */
{
  const seed = { lang: 'en', langChosen: true, stage: 'app', dob: null, consent: {}, situation: {}, events: [{ d: '2026-09-28', t: 'start' }], daily: {}, settings: { toursAuto: false } };
  const { ctx, page, srv, errs } = await open({ name: 'nodob', seed });
  await page.waitForSelector('#su-year');
  check('8 asks the birth year when Sakhi never did', !!(await page.$('#su-year')));
  await page.selectOption('#su-year', '2008'); await sleep(150);
  check('8 the year someone may be 17 asks the month', !!(await page.$('#su-month')));
  await page.selectOption('#su-year', 'u18'); await page.fill('#su-num', '9822222222'); await tap(page, '#su-send'); await sleep(200);
  check('8 under 18 here goes to the teen screen, nothing sent', !!(await page.$('#u18-back')) && !srv.calls.length);
  await tap(page, '#u18-back'); await sleep(100);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi);
  await page.waitForSelector('#su-year'); await page.selectOption('#su-year', '1988'); await page.fill('#su-num', '9822222222'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '424242'); await page.waitForSelector('#su-done');
  const vf = srv.calls.find((c) => c.key === 'POST otp/verify');
  check('8 birth year from the field is sent and saved', vf && vf.body.birth_year === 1988 && await page.evaluate(() => window.Saathi.state.dob === '1988-07-01'), vf && vf.body);
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 9. Prototype mode (no server address): code 123456, nothing leaves the phone ---------- */
{
  const { ctx, page, reqs, errs } = await open({ name: 'proto', api: false });
  await firstRun(page); await page.waitForSelector('#su-num'); await noTours(page);
  await page.fill('#su-num', '9876500000'); await tap(page, '#su-send'); await page.waitForSelector('#su-code');
  check('9 prototype says no SMS is sent and gives the code', /Prototype: no message is sent\. The code is 123456\./.test(await text(page, '#view')));
  await page.fill('#su-code', '424242'); await page.waitForSelector('#view .flag[role="alert"]');
  await page.fill('#su-code', '123456'); await page.waitForSelector('#su-done'); await page.fill('#su-name', 'Meera'); await page.fill('#su-pin', '110001'); await tap(page, '#su-done'); await page.waitForSelector('.card.hero');
  check('9 signed in on the stand-in server', await page.evaluate(() => window.Saathi.account.signedIn()));
  check('9 prototype makes no network requests at all', !reqs.length, reqs);
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10. Hindi, and a narrow phone ---------- */
{
  const { ctx, page, errs } = await open({ name: 'hindi', w: 360, locale: 'hi-IN' });
  await firstRun(page, { lang: 'hi' }); await page.waitForSelector('#su-num');
  const tx = await text(page, '#view');
  check('10 Hindi signup screen', /आपका मोबाइल नंबर/.test(tx) && /कोड भेजें/.test(tx) && !/\bsu_|\bacc_/.test(tx));
  check('10 no sideways scroll at 360 px', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await shot(page, '6-hindi-360');
  await page.fill('#su-num', '9876543210'); await tap(page, '#su-send'); await page.waitForSelector('#su-code');
  check('10 Hindi code screen', /कोड डालें/.test(await text(page, '#view')));
  await page.fill('#su-code', '424242'); await page.waitForSelector('#su-done');
  check('10 Hindi details screen fits', /बस हो गया/.test(await text(page, '#view')) && /ईमेल \(वैकल्पिक\)/.test(await text(page, '#view')) && !/पहला नाम \(वैकल्पिक\)/.test(await text(page, '#view')) && await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await tap(page, '#su-done'); await sleep(150);
  check('10 Hindi asks for the first name', /अपना पहला नाम डालें/.test(await text(page, '#view .flag')));
  await shot(page, '7-hindi-about');
  check('10 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 11. Her first name and PIN code are needed: after a restart, and for an older account without them ---------- */
{
  const srv = makeServer();
  const { ctx, page, errs } = await open({ name: 'details', srv });
  await firstRun(page); await page.waitForSelector('#su-num'); await noTours(page);
  await signIn(page, '9833333333', { fill: false });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await page.waitForSelector('#su-done');
  check('11 closing Sakhi on the details screen brings it back', /Almost done/.test(await h1(page)) && await page.evaluate(() => window.Saathi.account.signedIn()));
  await page.evaluate(() => { location.hash = '#diary'; }); await sleep(200);
  check('11 no other screen until her name and PIN code are in', !!(await page.$('#su-done')));
  await page.evaluate(() => { location.hash = '#help'; }); await sleep(200);
  check('11 Help stays open meanwhile', /Help/.test(await h1(page)) && !(await page.$('#su-done')));
  await page.evaluate(() => { location.hash = '#home'; }); await page.waitForSelector('#su-done');
  await page.fill('#su-name', 'Kavya'); await page.fill('#su-pin', '400001'); await tap(page, '#su-done'); await page.waitForSelector('.card.hero');
  check('11 with them in, Home', !(await page.$('#su-done')));
  /* an account Qura already has without them (made before they were needed): signing in asks for them */
  const old = { id: 'old1', phone: '+919844444444', birth_year: 1990, name: null, pincode: null, email: null, heard: null, upd_sms: false, upd_wa: false };
  srv.accounts.old1 = old;
  await page.evaluate(() => { location.hash = '#account'; }); await page.waitForSelector('#acc-out'); await tap(page, '#acc-out');
  await signIn(page, '9844444444', { returning: true });
  await page.waitForSelector('#su-done');
  check('11 an older account without them gets the details screen', /Almost done/.test(await h1(page)));
  await page.fill('#su-name', 'Radha'); await page.fill('#su-pin', '600001'); await tap(page, '#su-done'); await page.waitForSelector('#acc-list, .card.hero'); await sleep(300);
  check('11 and her details reach Qura', old.name === 'Radha' && old.pincode === '600001', old);
  check('11 no page errors', !errs.length, errs);
  await ctx.close();
}

await browser.close();

/* ---------- The leak check over every request this run made ---------- */
const leaks = [];
for (const r of all) {
  if (!r.url.startsWith(API + '/v1/')) { leaks.push('off-API host: ' + r.url); continue; }
  if (r.method === 'OPTIONS') continue;
  const key = r.method + ' ' + r.url.slice((API + '/v1/').length);
  const allow = ALLOWED[key]; if (!allow) { leaks.push('call not in allowlist: ' + key); continue; }
  let body = {}; try { body = r.body ? JSON.parse(r.body) : {}; } catch (e) { leaks.push('unparseable body: ' + key); continue; }
  Object.keys(body).forEach((k) => { if (!allow.includes(k)) leaks.push(key + ' sent field ' + k); });
  MARK.forEach((m) => { if ((r.body + r.url).includes(m)) leaks.push(key + ' carried diary text ' + m); });
  HEALTH_KEYS.forEach((k) => { if (new RegExp('"' + k + '"').test(r.body)) leaks.push(key + ' carried key ' + k); });
}
check('LEAK every request goes to the account server, allowlisted fields only, no diary text', !leaks.length, leaks.slice(0, 10));
check('LEAK the run made the calls it should', ['POST otp/start', 'POST otp/verify', 'PATCH me', 'POST me/active', 'POST session/logout', 'DELETE me'].every((k) => all.some((r) => (r.method + ' ' + r.url.slice((API + '/v1/').length)) === k)));

/* ---------- No other door out in the code ---------- */
const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const mods = fs.readdirSync(path.join(root, 'mods')).filter((f) => f.endsWith('.js'));
const doors = /\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|EventSource|importScripts/g;
const coreDoors = (src('app.js').match(doors) || []).length;
const modDoors = mods.filter((f) => doors.test(src('mods/' + f)) && (doors.lastIndex = 0, true));
check('CODE app.js has exactly two fetch calls (content.json and net)', coreDoors === 2, coreDoors);
check('CODE no module makes network calls', !modDoors.length, modDoors);
check('CODE art.js makes no network calls', !doors.test(src('art.js')));

const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' signup checks pass');
process.exit(pass === results.length ? 0 : 1);
