// Tours. Version 37 (docs/companion-journey-2026-10-23.md, section 9): a new woman meets Sakhi through her plan's reveal and
// one short tip the first time she opens each screen; the full tour no longer runs for her. It still runs once for a diary that
// never had it (Mohit, 20 Oct 2026: "full tour should run for a new user", before Version 37), and "How to use Sakhi" replays
// it: Today, Diary, Explore, Help and Me, the last step on each screen saying "Next: <screen>". Also: Not now and using a lit
// feature stop it, past the day's three tours it still runs, tours switched off keep it from starting, "Show the tours again"
// brings it back, Hindi words, a 360 px phone, the reading-only version, and a shared phone's PIN before Today's tip.
// Version 39.10: after joining and sign-up, "Your Sakhi" offers a 3-step first-day tour (Today, the tabs, Diary) that ends in
// Diary with her first log; Today's own tip is then done, and Diary's waits until that first log is saved.
// Usage: node test/tours.mjs [dir]   (dir defaults to this app folder). Screenshots go to test/shots/tours-*.png.
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const shots = path.join(here, 'shots'); fs.mkdirSync(shots, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');

const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 500)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
/* No server address: the app's stand-in server, code 123456, nothing leaves the page. */
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  if (o.seed) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(o.seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919800000000', name: 'Test', pincode: '560001', activeOn: new Date().toISOString().slice(0, 10) })) + '); }');
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
/* what the tour shows now: screen, heading, count and the main button; null when no tour is up */
const now = (page) => page.evaluate(() => {
  const h = document.querySelector('#tour-root #tour-h'); if (!h) return null;
  const body = document.querySelector('#tour-root #tour-body');
  return { hash: location.hash, h: h.innerText, n: document.querySelector('#tour-root .tour-n').innerText, go: document.querySelector('#tour-next').innerText, p: body ? body.innerText : '' };
});
async function waitTour(page, ms = 4000) { const end = Date.now() + ms; while (Date.now() < end) { const s = await now(page); if (s) return s; await sleep(100); } return null; }
/* press the main button and wait for the next step (or for the tour to end) */
async function next(page) {
  const before = JSON.stringify(await now(page)); await tap(page, '#tour-next');
  const end = Date.now() + 4000;
  while (Date.now() < end) { await sleep(100); const s = await now(page); if (!s) { await sleep(900); const s2 = await now(page); if (!s2) return null; if (JSON.stringify(s2) !== before) return s2; } else if (JSON.stringify(s) !== before) return s; }
  return now(page);
}
const st = (page) => page.evaluate(() => ({ tours: window.Saathi.state.tours, full: window.Saathi.state.fullTour || null }));
const toast = (page) => page.$eval('.toast', (e) => e.innerText).catch(() => '');
const seedApp = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-07-01', consent: { c1: true, c2: true, c4: null }, situation: { stage: 'cycle' }, events: [], daily: {}, notes: {}, settings: {} }, extra || {});

/* ---------- 1. A new woman (Version 39.10): first run, sign-up, "Your Sakhi", then the first-day tour: Today, the tabs, Diary ---------- */
{
  const { ctx, page, errs } = await open();
  await join(page, { name: 'Asha' });
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done'); await page.fill('#su-pin', '560001'); await tap(page, '#su-done');
  await page.waitForSelector('#ys-tour'); await sleep(1200);
  check('1 "Your Sakhi" first, with no tip on top of it', !(await now(page)) && (await page.evaluate(() => location.hash)) === '#your-sakhi');
  await page.screenshot({ path: path.join(shots, 'tours-1-yoursakhi.png') });
  await tap(page, '#ys-tour');
  const seen = []; let s = await waitTour(page);
  check('1 "Show me around" starts the first-day tour on Today', s && s.hash === '#home' && s.n === '1 of 3' && s.h === 'This is your day', s);
  await page.screenshot({ path: path.join(shots, 'tours-1-home.png') });
  for (let k = 0; s && k < 10; k++) { seen.push(s); s = await next(page); }
  check('1 three steps on Today: her day, the tabs, Diary; the last button says "Start my diary"', seen.length === 3 && seen.every((x) => x.hash === '#home') && seen.map((x) => x.h).join('|') === 'This is your day|Your plan and Explore|Your diary starts here' && seen[2].go === 'Start my diary', seen.map((x) => x.hash + ' ' + x.n + ' ' + x.h + ' ' + x.go));
  await sleep(1500);
  check('1 it opens Diary on her first log, and Diary\'s own tip waits for it', (await page.evaluate(() => location.hash)) === '#diary' && !!(await page.$('#fl-card')) && !(await now(page)));
  const after = await st(page);
  check('1 Today\'s own tip is done and the full tour never started', after.tours.home && after.tours.home.st === 'done' && after.full && after.full.st === 'first' && !after.tours.diary, after);
  await page.evaluate(() => { location.hash = '#home'; }); await sleep(1500);
  check('1 no tip on Today again', !(await now(page)));
  check('1 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 1b. One tip the first time she opens each screen (docs/companion-journey-2026-10-23.md, section 9) ---------- */
{
  const done = { st: 'done', d: '2026-10-20' };
  for (const [hash, tours, n, h] of [['#diary', { home: done }, '1 of 3', 'Your calendar'], ['#care', { home: done, diary: done }, '1 of 3', 'Explore'], ['#me', { home: done, diary: done, care: done }, '1 of 3', 'Privacy on a shared phone']]   /* Version 39.2: Me's one Reminders row is on every build, so its tip shows too */) {
    const { ctx, page, errs } = await open({ seed: seedApp({ joined: new Date().toISOString().slice(0, 10), fullTour: { st: 'done', d: '2026-10-20' }, tours }), hash });   /* Version 39.59: tips come in her first week, one a day, so on a day no other tip has shown */
    const s = await waitTour(page);
    check('1b the first time she opens ' + hash + ', its own tip', s && s.hash === hash && s.n === n && s.h === h, s);
    check('1b no page errors (' + hash + ')', !errs.length, errs);
    await ctx.close();
  }
  const { ctx, page, errs } = await open({ seed: seedApp({ fullTour: { st: 'reveal', d: '2026-10-20' }, tours: { home: done } }), hash: '#help' });
  await page.waitForSelector('.doc-card'); await sleep(1500);
  check('1b Help never starts a tip on its own', !(await now(page)));
  check('1b no page errors (#help)', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. A diary that never had the full tour gets it once; Not now stops it, the other screens keep their own tips ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp() });
  const s = await waitTour(page);
  check('2 a diary that never had the full tour gets it once', s && s.n === 'Today · 1 of 2', s);
  await tap(page, '#tour-later'); await sleep(1500);
  const after = await st(page);
  check('2 Not now stops it on Today', !(await now(page)) && (await page.evaluate(() => location.hash)) === '#home' && after.full && after.full.st === 'stopped' && after.tours.home.st === 'off' && !after.tours.diary, after);   /* Version 39.59: a tip put off doesn't come back */
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Using the lit feature stops it there (Diary's "Add for today"; Today has no try-it step since Version 37) ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp() });
  let s = await waitTour(page); s = await next(page);
  check('3 Today\'s last step names Diary', s && s.n === 'Today · 2 of 2' && s.go === 'Next: Diary', s);
  s = await next(page); s = await next(page); s = await next(page);
  check('3 the try-it step on Diary names Explore next', s && s.hash === '#diary' && s.n === 'Diary · 3 of 3' && s.go === 'Next: Explore', s);
  await page.evaluate(() => document.querySelector('#fab').click());
  await sleep(1500);
  const after = await st(page);
  check('3 tapping it ends the tour and keeps her on Diary', !(await now(page)) && (await page.evaluate(() => location.hash)) === '#diary' && after.full.st === 'stopped' && after.tours.diary.st === 'done' && !after.tours.care, after);
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. A woman who used Sakhi before it had the full tour gets it once too (Mohit's phone, 20 Oct); How to use
   Sakhi replays it ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: { home: { st: 'done', d: '2026-10-01' }, diary: { st: 'done', d: '2026-10-01' } } }) });
  const s = await waitTour(page);
  check('4 a woman who has seen tours before gets the full tour once', s && s.n === 'Today · 1 of 2', s);
  await tap(page, '#tour-later'); await sleep(300);
  check('4 Not now ends it for good', (await st(page)).full.st === 'stopped');
  await page.evaluate(() => { location.hash = '#me-help'; }); await page.waitForSelector('[data-tour-full]');
  check('4 How to use Sakhi offers it', /The full tour/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)) && /5 screens, one after another/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  await tap(page, '[data-tour-full]');
  const r = await waitTour(page);
  check('4 the replay starts on Today', r && r.hash === '#home' && r.n === 'Today · 1 of 2', r);
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. "Show the tours again" brings the full tour back on her next Home ---------- */
{
  const all = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: '2026-10-01' }]));
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: all, fullTour: { st: 'done', d: '2026-10-01' } }), hash: '#me-help' });
  await page.waitForSelector('#me-tips');
  check('5 a finished full tour is marked seen', /seen/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  await tap(page, '#me-tips'); await sleep(300);
  check('5 "Show the tours again" clears it', !(await st(page)).full);
  await page.evaluate(() => { location.hash = '#home'; });
  const s = await waitTour(page);
  check('5 and the full tour runs on her next Today', s && s.n === 'Today · 1 of 2', s);
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. Hindi, on a 360 px phone ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ lang: 'hi' }), w: 360, lang: 'hi' });
  let s = await waitTour(page);
  check('6 Hindi count names the screen', s && s.n === 'आज · 2 में से 1', s);
  s = await next(page);
  check('6 Hindi "Next: Diary"', s && s.go === 'आगे: डायरी', s);
  const fit = await page.evaluate(() => { const p = document.querySelector('#tour-root .tour-pop').getBoundingClientRect(); const bs = [...document.querySelectorAll('#tour-root .tour-btns .btn')].map((b) => b.getBoundingClientRect()); return { ok: p.left >= 0 && p.right <= window.innerWidth && bs.every((b) => b.left >= p.left - 1 && b.right <= p.right + 1), sw: document.documentElement.scrollWidth, w: window.innerWidth }; });
  check('6 the card and its buttons fit a 360 px screen', fit.ok && fit.sw <= fit.w, fit);
  await page.screenshot({ path: path.join(shots, 'tours-6-hindi-360.png') });
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Reading-only: no full tour on its own; the replay covers Explore and Help ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ stage: 'browse', situation: {} }), hash: '#help' });
  await page.waitForSelector('[data-tour-full]');
  check('7 a reader\'s full tour has her two screens', /2 screens/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  check('7 it never starts on its own for a reader', !(await st(page)).full);
  await tap(page, '[data-tour-full]');
  const s = await waitTour(page);
  check('7 the reader\'s replay starts on Explore', s && s.hash === '#care' && /^Explore · 1 of/.test(s.n), s);
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. Three tours already today: the full tour still runs (it is her welcome); tours switched off: it doesn't ---------- */
{
  const today = new Date().toISOString().slice(0, 10);
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: { home: { st: 'done', d: today } }, tourDay: { d: today, n: 3 } }) });
  const s = await waitTour(page);
  check('8 past the day\'s three tours, the full tour still runs', s && s.n === 'Today · 1 of 2', s);
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
  const off = await open({ seed: seedApp({ settings: { toursAuto: false } }) });
  await sleep(1800);
  check('8 with tours switched off it never starts on its own', !(await now(off.page)) && !(await st(off.page)).full);
  await off.page.evaluate(() => { location.hash = '#me-help'; }); await off.page.waitForSelector('[data-tour-full]'); await tap(off.page, '[data-tour-full]');
  const r = await waitTour(off.page);
  check('8 but the replay still works', r && r.n === 'Today · 1 of 2', r);
  check('8 no page errors (tours off)', !off.errs.length, off.errs);
  await off.ctx.close();
}

/* ---------- 9. A new install of the pilot APK (Mohit, 23 Oct: "can you also confirm if complete tour will run on new
   installs"; Version 37 replaced it with the reveal and one tip a screen): Android, the real server's answers, the pilot build,
   phone reminders not yet allowed. Today's own tip runs on her first Today, nothing interrupts it (not the Version 34 reminders
   question, not "Ask Qura to call you"), and only afterwards does Today ask about reminders, once. How to use Sakhi still has
   the full tour. ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: '0.34-pilot', platform: 'android', care: 'care/' }) + ';');
  await ctx.addInitScript('window.__calls = []; window.__native = ""; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return false; }, askNotify() { __calls.push(["askNotify"]); }, canExactAlarms() { return false; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, setDisguise() {}, isDisguised() { return false; }, saveState(j) { window.__native = j; return true; }, loadState() { return window.__native || ""; } };');
  const hits = [];
  await ctx.route(/^https?:/, (r) => {
    const req = r.request(); const p = new URL(req.url()).pathname.replace(/^.*\/v1\//, ''); const m = req.method(); hits.push(m + ' ' + p);
    const json = (st, b) => r.fulfill({ status: st, contentType: 'application/json', body: b === undefined ? '' : JSON.stringify(b) });
    if (m === 'POST' && p === 'otp/start') return json(200, { challenge: '11111111-1111-4111-8111-111111111111', channel: 'whatsapp', resend_after: 30, expires_in: 600 });
    if (m === 'POST' && p === 'otp/verify') return json(200, { token: 'tok-new-install-0000000000', is_new: true, account: { id: 'a1', phone: '+919876543210', birth_year: 1994, name: null, pincode: null, email: null, heard: null, upd_sms: false, upd_wa: false } });
    if (m === 'PATCH' && p === 'me') return json(200, { account: { id: 'a1', phone: '+919876543210', birth_year: 1994, name: 'Asha', pincode: '560001', email: null, heard: null, upd_sms: false, upd_wa: false } });
    if (m === 'POST' && p === 'me/active') return json(204);
    if (m === 'GET' && p === 'requests') return json(200, { available: true });
    if (/^(care|fonts)/.test(p) || /fonts\.(googleapis|gstatic)/.test(req.url())) return r.abort();
    return json(404, { error: 'not_found' });
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  check('9 a new install opens on the first-run screens, not Today', !(await page.$('.card.hero')) && !!(await page.waitForSelector('[data-ob-lang="en"]')));
  await join(page);
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '424242');
  await page.waitForSelector('#su-done'); await page.fill('#su-name', 'Asha'); await page.fill('#su-pin', '560001'); await tap(page, '#su-done');
  await page.waitForSelector('#ys-tour');
  check('9 signup went through the server: a code, the check, her details', ['POST otp/start', 'POST otp/verify', 'PATCH me'].every((k) => hits.includes(k)), hits);
  await tap(page, '#ys-tour');
  const seen = []; let s = await waitTour(page, 6000);
  check('9 "Show me around": the first-day tour on her first Today, not the full tour', s && s.hash === '#home' && s.n === '1 of 3', s);
  await sleep(1800);   /* she reads it: the reminders question's moment comes and goes while the tour is up */
  for (let k = 0; s && k < 10; k++) { seen.push(s); const sh = await page.$eval('#sheet-root', (e) => e.innerText).catch(() => ''); if (/Get a heads-up|Ring on time/.test(sh)) seen.push({ hash: 'SHEET', n: sh.slice(0, 40) }); s = await next(page); }
  check('9 three steps on Today, with nothing popping up in between', seen.length === 3 && seen.every((x) => x.hash === '#home'), seen.map((x) => x.hash + ' ' + x.n));
  check('9 it wasn\'t asked about reminders during the tour', !(await page.evaluate(() => (window.Saathi.state.prompts || {}).notifyAuto)) && !(await page.evaluate(() => window.__calls.some((c) => c[0] === 'askNotify'))));
  check('9 the full tour didn\'t start', (await st(page)).full.st === 'first');
  await page.waitForSelector('#fl-save'); await tap(page, '#fl-save');   /* the tour ends on her first log; she saves it */
  await sleep(600); await page.evaluate(() => { location.hash = '#home'; }); await sleep(2500);
  const asks = () => page.evaluate(() => window.__calls.filter((c) => c[0] === 'askNotify').length);
  check('9 back on Today afterwards: no tip again, and Android\'s own "Allow" comes once, with no sheet (Version 39.27: reminders on by default)', !(await now(page)) && (await asks()) === 1 && !(await page.$eval('#sheet-root', (e) => e.innerText).catch(() => '')));
  await page.evaluate(() => { location.hash = '#diary'; }); await sleep(600); await page.evaluate(() => { location.hash = '#home'; }); await sleep(2500);
  check('9 and never again', (await asks()) === 1 && !(await now(page)));
  /* How to use Sakhi: the full tour walks Today, Diary, Explore, Help and Me */
  await page.evaluate(() => { location.hash = '#me-help'; }); await page.waitForSelector('[data-tour-full]'); await tap(page, '[data-tour-full]');
  const full = await walk(page);
  const screens = [...new Set(full.map((x) => x.hash))];
  check('9 the replay walks Today, Diary, Explore, Help and Me, 13 steps', JSON.stringify(screens) === JSON.stringify(['#home', '#diary', '#care', '#help', '#me']) && full.length === 13, full.map((x) => x.hash + ' ' + x.n));
  check('9 every count names its screen', full.every((x) => /^(Today|Diary|Explore|Help|Me) · \d of \d$/.test(x.n)), full.map((x) => x.n));
  const lastOf = (h) => full.filter((x) => x.hash === h).pop() || {};
  check('9 the last step on each screen names the next one', ['Next: Diary', 'Next: Explore', 'Next: Help', 'Next: Me'].every((g, i) => lastOf(['#home', '#diary', '#care', '#help'][i]).go === g) && lastOf('#me').go === 'Done', full.map((x) => x.go));
  const me = full.filter((x) => x.hash === '#me').map((x) => x.h);
  check('9 Me points to privacy, reminders and her backup, not "Delete everything"', JSON.stringify(me) === JSON.stringify(['Privacy on a shared phone', 'Reminders', 'Your data and backup']), me);
  check('9 the doctor steps name the free government doctor too', full.some((x) => x.hash === '#care' && /free government doctor/.test(x.p)) && full.some((x) => x.hash === '#help' && /free government doctor/.test(x.p)), full.filter((x) => /care|help/.test(x.hash)).map((x) => x.p));
  check('9 Explore\'s last step points to the Help button', lastOf('#care').h === 'Help, any time', lastOf('#care'));
  const after = await st(page);
  check('9 it ends on Me with a word on replaying it, and the full tour is done', /whole tour/.test(await toast(page)) && (await page.evaluate(() => location.hash)) === '#me' && after.full && after.full.st === 'done', after.full);
  check('9 the pilot build has its full tools: the fertile tool on the trying-for-a-baby page', await page.evaluate(() => { location.hash = '#topic-ttc'; return new Promise((ok) => setTimeout(() => ok([...document.querySelectorAll('[data-go]')].some((x) => x.dataset.go === 'fertile')), 800)); }));
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}

/* A new install the pilot APK's way, through first-run and sign-up. o.stage (a tile: cycle, ttc, preg), o.sh (who uses the
   phone), o.kitOff (privacy options to untick), o.pin ('set', 'cancel' or 'outside', done when the PIN box shows), o.ys ('tour':
   "Show me around" on "Your Sakhi"; otherwise Skip), o.firstLog (then her first log in Diary). */
async function pilotInstall(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: '0.34-pilot', platform: 'android', care: 'care/' }) + ';');
  await ctx.addInitScript('window.__native = ""; window.SakhiAndroid = { schedule() { return 0; }, cancelAll() {}, canNotify() { return false; }, askNotify() {}, canExactAlarms() { return false; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, setDisguise() {}, isDisguised() { return false; }, saveState(j) { window.__native = j; return true; }, loadState() { return window.__native || ""; } };');
  await ctx.route(/^https?:/, (r) => {
    const req = r.request(); const p = new URL(req.url()).pathname.replace(/^.*\/v1\//, ''); const m = req.method();
    const json = (st, b) => r.fulfill({ status: st, contentType: 'application/json', body: b === undefined ? '' : JSON.stringify(b) });
    if (m === 'POST' && p === 'otp/start') return json(200, { challenge: '11111111-1111-4111-8111-111111111111', channel: 'whatsapp', resend_after: 30, expires_in: 600 });
    if (m === 'POST' && p === 'otp/verify') return json(200, { token: 'tok-new-install-0000000000', is_new: true, account: { id: 'a1', phone: '+919876543210', birth_year: 1994, name: null, pincode: null } });
    if (m === 'PATCH' && p === 'me') return json(200, { account: { id: 'a1', phone: '+919876543210', birth_year: 1994, name: 'Asha', pincode: '560001' } });
    if (m === 'POST' && p === 'me/active') return json(204);
    if (m === 'GET' && p === 'requests') return json(200, { available: true });
    return r.abort();
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const lmp = new Date(Date.now() - 127 * 864e5).toISOString().slice(0, 10);
  await join(page, { tile: o.stage || 'cycle', dec: o.dec, y: o.y, lmp: o.stage === 'preg' ? lmp : undefined, share: o.sh, kitOff: o.kitOff });
  let pinBeforeSignup = false;
  if (o.sh && o.sh !== 'me') { await sleep(800); pinBeforeSignup = !!(await page.$('#pinsheet .key')); }
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '424242');
  await page.waitForSelector('#su-done'); await page.fill('#su-name', 'Asha'); await page.fill('#su-pin', '560001'); await tap(page, '#su-done');
  /* Version 39.10: "Your Sakhi" (not on a shared phone in plain words): o.ys 'tour' starts the first-day tour, else Skip */
  await page.waitForSelector('#ys-tour, .card.hero');
  if (await page.$('#ys-tour')) { await tap(page, o.ys === 'tour' ? '#ys-tour' : '#ys-skip'); if (o.ys !== 'tour') await page.waitForSelector('.card.hero'); }
  if (o.firstLog) { await page.evaluate(() => { location.hash = '#diary'; }); await page.waitForSelector('#fl-save, [data-fl-go]'); await tap(page, (await page.$('#fl-save')) ? '#fl-save' : '[data-fl-go]'); await sleep(500); }
  let pinOnHome = false;
  if (o.sh && o.sh !== 'me') {
    await sleep(700); pinOnHome = !!(await page.$('#pinsheet .key'));
    if (pinOnHome && o.pin === 'set') { for (const d of '12341234') { await page.$eval('#pinsheet [data-k="' + d + '"]', (b) => b.click()); await sleep(60); } }
    if (pinOnHome && o.pin === 'cancel') await tap(page, '#pin-cancel');
    if (pinOnHome && o.pin === 'outside') await page.$eval('#sheet-bg', (b) => b.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  }
  return { ctx, page, errs, pinBeforeSignup, pinOnHome };
}
async function walk(page) { const seen = []; let s = await waitTour(page, 6000); for (let k = 0; s && k < 25; k++) { seen.push(s); s = await next(page); } return seen; }
/* How to use Sakhi replays the full tour: finish any tip that is up, then start it from Me and walk it */
async function replay(page) {
  for (let k = 0; k < 6 && (await now(page)); k++) await next(page);
  await page.evaluate(() => { location.hash = '#me-help'; }); await page.waitForSelector('[data-tour-full]'); await tap(page, '[data-tour-full]');
  return walk(page);
}

/* ---------- 10. A stray tap doesn't end a tip; Back steps back; the full tour stopped part-way is offered again once ---------- */
{
  const T = await pilotInstall({ ys: 'tour' });
  let s = await waitTour(T.page, 6000);
  await T.page.$eval('.tour-dim', (d) => d.click()); await sleep(400);
  check('10 a tap on the dimmed screen does nothing: the tip is still there', JSON.stringify(await now(T.page)) === JSON.stringify(s), await now(T.page));
  s = await next(T.page);
  check('10 on step 2', s && s.n === '2 of 3', s);
  await T.page.evaluate(() => window.__sakhiBack());  await sleep(400);
  check('10 Android Back goes back a step, not out', (await now(T.page)) && (await now(T.page)).n === '1 of 3', await now(T.page));
  await next(T.page); await next(T.page); await next(T.page);
  await T.page.waitForSelector('#fl-save'); await tap(T.page, '#fl-save'); await sleep(400);   /* the first-day tour ends on her first log */
  await T.page.evaluate(() => { location.hash = '#me-help'; }); await T.page.waitForSelector('[data-tour-full]'); await tap(T.page, '[data-tour-full]');
  s = await waitTour(T.page, 5000); await next(T.page); s = await next(T.page);
  check('10 the full tour from How to use Sakhi, into Diary', s && s.hash === '#diary', s);
  await tap(T.page, '#tour-later'); await sleep(500);
  const f = await T.page.evaluate(() => window.Saathi.state.fullTour);
  check('10 "Not now" stops it, remembering where', !(await now(T.page)) && f.st === 'stopped' && f.leg === 1, f);
  await T.page.evaluate(() => { location.hash = '#home'; }); await sleep(2200);
  check('10 not offered again straight away', !/Finish the tour/.test(await toast(T.page)));
  await T.page.evaluate(() => { const S = window.Saathi; S.state.fullTour.at = Date.now() - 11 * 60000; S.save(); location.hash = '#diary'; }); await sleep(500);
  await T.page.evaluate(() => { location.hash = '#home'; }); await sleep(2200);
  check('10 ten minutes later, Today offers to finish it', /Finish the tour\?/.test(await toast(T.page)), await toast(T.page));
  await T.page.$eval('.toast [data-ta="0"]', (b) => b.click());
  const r = await waitTour(T.page, 5000);
  check('10 "Continue the tour" picks up at Diary, where she stopped', r && r.hash === '#diary' && r.n === 'Diary · 1 of 3', r);
  const rest = []; let x = r; for (let k = 0; x && k < 20; k++) { rest.push(x); x = await next(T.page); }
  check('10 and runs to the end', rest.length > 0 && rest[rest.length - 1].hash === '#me' && (await T.page.evaluate(() => window.Saathi.state.fullTour.st)) === 'done', rest.map((y) => y.n));
  check('10 no page errors', !T.errs.length, T.errs);
  await T.ctx.close();
}

/* ---------- 11. Trying for a baby: the full tour includes her own part (Version 39.64: on Explore, at her questions, where they moved
   in Version 37; Mohit, 3 Nov: "Point them at Explore") ---------- */
{
  const T = await pilotInstall({ stage: 'ttc' });
  const seen = await replay(T.page);
  const home = seen.filter((x) => x.hash === '#home'); const ex = seen.filter((x) => x.hash === '#care');
  check('11 trying: Today in its own two steps, then Diary as usual', home.length === 2 && home[1].go === 'Next: Diary' && seen[2] && seen[2].hash === '#diary', home.map((x) => x.n + ' ' + x.h + ' ' + x.go));
  check('11 her own part on Explore: her questions, then her topic', ex.some((x) => x.h === 'Questions for planning a baby') && ex.some((x) => x.h === 'Your trying-for-a-baby tools' && /^In Explore/.test(x.p)), ex.map((x) => x.n + ' ' + x.h));
  await T.ctx.close();
}

/* ---------- 12. Pregnant: Diary's words have no periods in them (Version 39.10: no "here to learn" joining any more) ---------- */
{
  const T = await pilotInstall({ stage: 'preg', firstLog: true });
  const seen = await replay(T.page);
  const diary = seen.filter((x) => x.hash === '#diary').map((x) => x.p);
  check('12 pregnant: Diary\'s steps don\'t talk about periods', diary.length === 3 && !diary.some((p) => /period/i.test(p)) && /symptoms, mood or a note/.test(diary[2]), diary);
  await T.ctx.close();
}

/* ---------- 13. A family phone: the PIN is chosen on her first Today, after sign-up; then Today's own tip ---------- */
{
  for (const how of ['set', 'cancel', 'outside']) {
    const T = await pilotInstall({ sh: 'fam', pin: how });
    check('13 (' + how + ') the PIN box doesn\'t cover the sign-up screen', !T.pinBeforeSignup);
    check('13 (' + how + ') it opens on her first Today', T.pinOnHome);
    const seen = await walk(T.page);
    check('13 (' + how + ') then Today\'s own tip runs, once the PIN box has gone', seen.length === 2 && seen[0].n === '1 of 2' && seen.every((x) => x.hash === '#home'), seen.map((x) => x.n));
    if (how === 'set') {
      check('13 (set) her PIN is kept', !!(await T.page.evaluate(() => window.Saathi.state.settings.pinHash)));
      const full = await replay(T.page);
      check('13 (set) the full tour uses plain words: Diary is Notes', full.length >= 12 && full.some((x) => x.hash === '#diary' && /^Notes · /.test(x.n)), full.map((x) => x.n));
    }
    check('13 (' + how + ') no page errors', !T.errs.length, T.errs);
    await T.ctx.close();
  }
}

await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' tour checks pass');
process.exit(pass === results.length ? 0 : 1);
