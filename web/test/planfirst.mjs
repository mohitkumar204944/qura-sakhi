// Version 39.61, phase C (Mohit, 3 Nov: "proceed with phase C"; docs/personal-companion-advice-2026-11-03.md, 4.2 and D1):
// joining that ends with her plan running.
// - 1 "Your Sakhi" leads with "Make my plan" when her goal has a plan (Show me around and "Just my diary for now" stay), and its
//   plan row says "Your plan, from your answers";
// - 2 her plan's questions come straight after it, without her goal again or a summary screen; Back returns to Your Sakhi;
// - 3 one page for her plan (ready, her steps, a doctor card when her version has one, Start), with Change my answers; Start
//   opens Today with her plan running;
// - 4 the free plan in "What your dates show" takes the same short path, with no second "Make my plan";
// - 5 "Just my diary for now": Today offers her plan from the start ("Made from your answers."); after her first log, "…and your
//   first log.";
// - 6 pregnancy keeps "Before you start" among her questions; Hindi at 360 px.
// Usage: node test/planfirst.mjs [web dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'planfirst'); fs.mkdirSync(SHOTS, { recursive: true });
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const results = []; const errsAll = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-11-03';
const iso = (n) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const browser = await chromium.launch();

async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.61-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(D0 + 'T10:00:00+05:30') });
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, errs };
}
const settle = async (page, ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
const has = (page, sel) => page.$(sel).then(Boolean);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.$eval(sel, (e) => e.click()); await settle(page, 400); };
const view = (page) => page.$eval('#view', (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const hash = (page) => page.evaluate(() => location.hash);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* joining as she does it, sign-up included; she stops on "Your Sakhi" */
async function joinTo(page, jo) {
  await join(page, Object.assign({ name: 'Neha' }, jo));
  await page.waitForSelector('#su-num', { timeout: 10000 }); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, #ys-skip', { timeout: 10000 }).catch(() => {});
  if (await has(page, '#su-done')) { await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); }
  await settle(page, 800);
}
/* her plan's questions, answered: in each group the first choice (No where there is one); then Continue */
async function answer(page) {
  const seen = [];
  for (let i = 0; i < 12 && /plan-goal/.test(await hash(page)); i++) {
    seen.push(await page.$eval('#view h1', (e) => e.innerText.trim()).catch(() => ''));
    await page.evaluate(() => { const v = document.querySelector('#view'); const g = new Map();
      [...v.querySelectorAll('[data-pl-q], [data-pl-m]')].forEach((b) => { const k = (b.dataset.plQ || b.dataset.plM).replace(/:.*/, ''); if (!g.has(k)) g.set(k, []); g.get(k).push(b); });
      for (const [, bs] of g) { if (bs.some((b) => b.classList.contains('on'))) continue; (bs.find((b) => /:(n|no|none)$/.test(b.dataset.plQ || b.dataset.plM || '')) || bs[0]).click(); }
      const w = v.querySelector('[data-pl-when="dinner"]') || v.querySelector('[data-pl-when]'); if (w && !v.querySelector('[data-pl-when].on')) w.click(); });
    await settle(page, 300);
    if (!(await has(page, '#pl-in-next'))) { if (await has(page, '#pl-in-make')) await tap(page, '#pl-in-make'); else break; } else await tap(page, '#pl-in-next');
    await settle(page, 400);
  }
  return seen;
}
const onePage = (page) => page.evaluate(() => { const r = document.querySelector('#view .pl-rv'); return r ? { one: r.classList.contains('pl-rv-one'), go: !!r.querySelector('#pl-rv-go'), edit: !!r.querySelector('#pl-rv-edit'), next: !!r.querySelector('#pl-rv-next'), bar: !!r.querySelector('.pl-rv-top'), text: r.innerText.replace(/\s+/g, ' ') } : null; });

/* ---------- 1 to 3: Neha, trying for a baby ---------- */
{
  const a = await open(); const p = a.page;
  await joinTo(p, { tile: 'ttc', goals: ['ready'], dec: 1990, y: 1995, dates: ['2026-08-20', '2026-09-19', '2026-10-19'], dlen: 5, care: 'private' });
  const ys = await view(p); await p.screenshot({ path: path.join(SHOTS, '1-your-sakhi.png'), fullPage: true });
  check('1.1 Your Sakhi leads with "Make my plan · about a minute"; Show me around and "Just my diary for now" stay', /#your-sakhi/.test(await hash(p)) && /Make my plan · about a minute/.test(await p.$eval('#ys-plan', (e) => e.innerText).catch(() => '')) && (await has(p, '#ys-tour')) && /Just my diary for now/.test(await p.$eval('#ys-skip', (e) => e.innerText).catch(() => '')), ys.slice(0, 400));
  check('1.2 its plan row says "Your plan, from your answers" (not "after your first log")', /Your plan, from your answers/.test(ys) && !/after your first log/.test(ys), ys.slice(0, 500));
  await tap(p, '#ys-plan');
  const q1 = await view(p);
  check('2.1 Make my plan opens her plan\'s questions, without her goal again', /#plan-goal/.test(await hash(p)) && !/What do you want to work on first\?/.test(q1), q1.slice(0, 200));
  if (await has(p, '#pl-in-back')) await tap(p, '#pl-in-back');
  check('2.2 Back on her first question returns to Your Sakhi', /#your-sakhi/.test(await hash(p)));
  await tap(p, '#ys-plan');
  const seen = await answer(p);
  check('2.3 no summary screen ("Here\'s what you told Sakhi")', seen.length > 0 && !seen.some((h) => /what you told Sakhi/i.test(h)), seen);
  const rv = await onePage(p); await p.screenshot({ path: path.join(SHOTS, '3-one-page.png'), fullPage: true });
  check('3.1 one page for her plan: ready, her steps and Start, with Change my answers; no Next and no card bar', /#plan-reveal/.test(await hash(p)) && rv && rv.one && rv.go && rv.edit && !rv.next && !rv.bar && /Your plan is ready/.test(rv.text) && /steps/i.test(rv.text) && /When do you want to start\?/.test(rv.text), rv);
  await tap(p, '#pl-rv-go'); await settle(p, 1200);
  check('3.2 Start opens Today with her plan running', /#home/.test(await hash(p)) && await p.evaluate(() => !!(window.Saathi.plan && window.Saathi.plan.running && window.Saathi.plan.running())));
  await done(a);
}

/* ---------- 4: Sana, period pain: her dates show it, so "What your dates show" offers the free plan ---------- */
{
  const a = await open(); const p = a.page;
  await joinTo(p, { tile: 'cycle', goals: ['pain'], dec: 1990, y: 1997, dates: ['2026-08-16', '2026-09-13', '2026-10-11'], dlen: 5, pain: true });
  const xp = await has(p, '#view [data-xp-plan]');
  check('4.1 her dates\' free plan is on Your Sakhi, and there is no second "Make my plan"', xp && !(await has(p, '#ys-plan')));
  if (xp) { await tap(p, '#view [data-xp-plan]'); await answer(p); }
  const rv = await onePage(p);
  check('4.2 it takes the same short path: one page, then Start', rv && rv.one && rv.go && !rv.next, rv);
  await done(a);
}

/* ---------- 5: "Just my diary for now" ---------- */
{
  const a = await open(); const p = a.page;
  await joinTo(p, { tile: 'ttc', goals: ['ready'], dec: 1990, y: 1995, dates: ['2026-08-20', '2026-09-19', '2026-10-19'], dlen: 5 });
  await tap(p, '#ys-skip');
  const tv = await view(p);
  check('5.1 "Just my diary for now" opens Today, which offers her plan from the start: "Made from your answers."', /#home/.test(await hash(p)) && (await has(p, '#pl-off-go')) && /Made from your answers\./.test(tv), tv.slice(0, 500));
  await p.evaluate(() => { const S = window.Saathi; S.state.prompts.firstLog = S.toISO(S.today()); S.saveQuiet(); S.render(); }); await settle(p, 400);
  check('5.2 after her first log: "Made from your answers and your first log."', /Made from your answers and your first log\./.test(await view(p)));
  await done(a);
}

/* ---------- 6: pregnancy keeps "Before you start"; Hindi at 360 px ---------- */
{
  const a = await open(); const p = a.page;
  await joinTo(p, { name: 'Riya', tile: 'preg', goals: ['food'], dec: 2000, y: 2000, lmp: iso(-140) });
  if (await has(p, '#ys-plan')) await tap(p, '#ys-plan');
  const seen = await answer(p);
  check('6.1 pregnancy: "Before you start" stays among her questions, before her first step', seen.some((h) => /Before you start/.test(h)), seen);
  check('6.2 ... and her plan is one page too', !!(await onePage(p) || {}).one);
  await done(a);
}
{
  const a = await open({ lang: 'hi', w: 360, h: 800 }); const p = a.page;
  await joinTo(p, { lang: 'hi', tile: 'ttc', goals: ['ready'], dec: 1990, y: 1995, dates: ['2026-08-20', '2026-09-19', '2026-10-19'], dlen: 5 });
  check('6.3 Hindi at 360 px: Your Sakhi\'s buttons fit', (await has(p, '#ys-plan')) && await noScroll(p));
  await tap(p, '#ys-plan'); await answer(p);
  check('6.4 Hindi at 360 px: her one-page plan has no sideways scroll', !!(await onePage(p) || {}).one && await noScroll(p));
  await p.screenshot({ path: path.join(SHOTS, '6-hindi-one-page.png'), fullPage: true });
  await done(a);
}

console.log('page errors', errsAll.length ? errsAll : 'none');
check('7 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
process.exit(fails.length ? 1 : 0);
