// The full tour (Mohit, 20 Oct 2026: "full tour should run for a new user"): her first Home runs one tour through Home,
// Diary, Care, Help and Me; the last step on each screen says "Next: <screen>". Also: Not now and using a lit feature stop it,
// a woman who used Sakhi before gets it once too (his phone didn't, at first), past the day's three tours it still runs, tours
// switched off keep it from starting, "How to use Sakhi" replays it, "Show the tours again" brings it back, Hindi words, a
// 360 px phone, and the reading-only version.
// Usage: node test/tours.mjs [dir]   (dir defaults to this app folder). Screenshots go to test/shots/tours-*.png.
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  return { hash: location.hash, h: h.innerText, n: document.querySelector('#tour-root .tour-n').innerText, go: document.querySelector('#tour-next').innerText };
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

/* ---------- 1. A new woman: first run, signup, then the full tour on her first Home ---------- */
{
  const { ctx, page, errs } = await open();
  for (const s of ['[data-ob-lang="en"]', '#w-start', '[data-ob-dec="1990"]', '[data-ob-y="1994"]', '[data-ob-st="cycle"]', '[data-ob-lp="7"]', '[data-ob-sh="me"]']) { await page.waitForSelector(s); await tap(page, s); }
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done'); await page.fill('#su-name', 'Asha'); await page.fill('#su-pin', '560001'); await tap(page, '#su-done');
  await page.waitForSelector('.card.hero');
  const seen = []; let s = await waitTour(page);
  check('1 the full tour starts on her first Home, on Home\'s own first step', s && s.hash === '#home' && s.n === 'Home · 1 of 3', s);
  await page.screenshot({ path: path.join(shots, 'tours-1-home.png') });
  for (let k = 0; s && k < 20; k++) { seen.push(s); s = await next(page); }
  const screens = [...new Set(seen.map((x) => x.hash))];
  check('1 it walks Home, Diary, Care, Help and Me in turn', JSON.stringify(screens) === JSON.stringify(['#home', '#diary', '#care', '#help', '#me']), screens);
  const lastOf = (h) => seen.filter((x) => x.hash === h).pop();
  check('1 the last step on each screen names the next one', ['Next: Diary', 'Next: Care', 'Next: Help', 'Next: Me'].every((g, i) => lastOf(['#home', '#diary', '#care', '#help'][i]).go === g) && lastOf('#me').go === 'Done', seen.map((x) => x.go));
  check('1 every count names its screen', seen.every((x) => /^(Home|Diary|Care|Help|Me) · \d of \d$/.test(x.n)) && seen.length === 13, seen.map((x) => x.n));
  const after = await st(page);
  check('1 every screen\'s tour is done, and so is the full tour', ['home', 'diary', 'care', 'help', 'me'].every((k) => after.tours[k] && after.tours[k].st === 'done') && after.full && after.full.st === 'done', after);
  check('1 it ends on Me with a word on replaying it', /whole tour/.test(await toast(page)) && (await page.evaluate(() => location.hash)) === '#me');
  await page.evaluate(() => { location.hash = '#home'; }); await sleep(1500);
  check('1 it never runs on its own again', !(await now(page)));
  check('1 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. Not now stops the whole tour; the other screens keep their own tours ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp() });
  const s = await waitTour(page);
  check('2 a new woman\'s seeded diary gets it too', s && s.n === 'Home · 1 of 3', s);
  await tap(page, '#tour-later'); await sleep(1500);
  const after = await st(page);
  check('2 Not now stops it on Home', !(await now(page)) && (await page.evaluate(() => location.hash)) === '#home' && after.full && after.full.st === 'stopped' && after.tours.home.st === 'later' && !after.tours.diary, after);
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Using the lit feature stops it there ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp() });
  let s = await waitTour(page); s = await next(page); s = await next(page);
  check('3 the try-it step on Home', s && s.n === 'Home · 3 of 3' && s.go === 'Next: Diary', s);
  await page.evaluate(() => { const r = document.querySelector('#tour-root .tour-ring'); const el = [...document.querySelectorAll('#view .askbox')].find((x) => x.getBoundingClientRect().width); (el || r).click(); });
  await sleep(1500);
  const after = await st(page);
  check('3 tapping it ends the tour and keeps her on Home', !(await now(page)) && (await page.evaluate(() => location.hash)) === '#home' && after.full.st === 'stopped' && after.tours.home.st === 'done' && !after.tours.diary, after);
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. A woman who used Sakhi before it had the full tour gets it once too (Mohit's phone, 20 Oct); How to use
   Sakhi replays it ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: { home: { st: 'done', d: '2026-10-01' }, diary: { st: 'done', d: '2026-10-01' } } }) });
  const s = await waitTour(page);
  check('4 a woman who has seen tours before gets the full tour once', s && s.n === 'Home · 1 of 3', s);
  await tap(page, '#tour-later'); await sleep(300);
  check('4 Not now ends it for good', (await st(page)).full.st === 'stopped');
  await page.evaluate(() => { location.hash = '#me'; }); await page.waitForSelector('[data-tour-full]');
  check('4 How to use Sakhi offers it', /The full tour/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)) && /5 screens, one after another/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  await tap(page, '[data-tour-full]');
  const r = await waitTour(page);
  check('4 the replay starts on Home', r && r.hash === '#home' && r.n === 'Home · 1 of 3', r);
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. "Show the tours again" brings the full tour back on her next Home ---------- */
{
  const all = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: '2026-10-01' }]));
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: all, fullTour: { st: 'done', d: '2026-10-01' } }), hash: '#me' });
  await page.waitForSelector('#me-tips');
  check('5 a finished full tour is marked seen', /seen/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  await tap(page, '#me-tips'); await sleep(300);
  check('5 "Show the tours again" clears it', !(await st(page)).full);
  await page.evaluate(() => { location.hash = '#home'; });
  const s = await waitTour(page);
  check('5 and the full tour runs on her next Home', s && s.n === 'Home · 1 of 3', s);
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. Hindi, on a 360 px phone ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ lang: 'hi' }), w: 360, lang: 'hi' });
  let s = await waitTour(page);
  check('6 Hindi count names the screen', s && s.n === 'होम · 3 में से 1', s);
  s = await next(page); s = await next(page);
  check('6 Hindi "Next: Diary"', s && s.go === 'आगे: डायरी', s);
  const fit = await page.evaluate(() => { const p = document.querySelector('#tour-root .tour-pop').getBoundingClientRect(); const bs = [...document.querySelectorAll('#tour-root .tour-btns .btn')].map((b) => b.getBoundingClientRect()); return { ok: p.left >= 0 && p.right <= window.innerWidth && bs.every((b) => b.left >= p.left - 1 && b.right <= p.right + 1), sw: document.documentElement.scrollWidth, w: window.innerWidth }; });
  check('6 the card and its buttons fit a 360 px screen', fit.ok && fit.sw <= fit.w, fit);
  await page.screenshot({ path: path.join(shots, 'tours-6-hindi-360.png') });
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Reading-only: no full tour on its own; the replay covers Care and Help ---------- */
{
  const { ctx, page, errs } = await open({ seed: seedApp({ stage: 'browse', situation: {} }), hash: '#help' });
  await page.waitForSelector('[data-tour-full]');
  check('7 a reader\'s full tour has her two screens', /2 screens/.test(await page.$eval('[data-tour-full]', (e) => e.innerText)));
  check('7 it never starts on its own for a reader', !(await st(page)).full);
  await tap(page, '[data-tour-full]');
  const s = await waitTour(page);
  check('7 the reader\'s replay starts on Care', s && s.hash === '#care' && /^Care · 1 of/.test(s.n), s);
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. Three tours already today: the full tour still runs (it is her welcome); tours switched off: it doesn't ---------- */
{
  const today = new Date().toISOString().slice(0, 10);
  const { ctx, page, errs } = await open({ seed: seedApp({ tours: { home: { st: 'done', d: today } }, tourDay: { d: today, n: 3 } }) });
  const s = await waitTour(page);
  check('8 past the day\'s three tours, the full tour still runs', s && s.n === 'Home · 1 of 3', s);
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
  const off = await open({ seed: seedApp({ settings: { toursAuto: false } }) });
  await sleep(1800);
  check('8 with tours switched off it never starts on its own', !(await now(off.page)) && !(await st(off.page)).full);
  await off.page.evaluate(() => { location.hash = '#me'; }); await off.page.waitForSelector('[data-tour-full]'); await tap(off.page, '[data-tour-full]');
  const r = await waitTour(off.page);
  check('8 but the replay still works', r && r.n === 'Home · 1 of 3', r);
  check('8 no page errors (tours off)', !off.errs.length, off.errs);
  await off.ctx.close();
}

await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' tour checks pass');
process.exit(pass === results.length ? 0 : 1);
