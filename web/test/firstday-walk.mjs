// Her first day (docs/first-days-audit-2026-10-24.md): a new woman joins on a 390 px phone the way Mohit's example woman
// would (periods 36 to 45 days apart, some months skipped), and every screen is measured and photographed: words, screens of
// scrolling, controls, any sheet or tip. Also Mohit's own path: an existing diary changes its goal in My plan, then leaves
// the plan screen by the Today tab. Not a pass/fail test: run it before and after a change to compare.
// Usage: node test/firstday-walk.mjs   (screens to test/shots/firstday/, numbers to test/shots/firstday/walk.json)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(here, 'shots', 'firstday'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return false; }, askNotify(){ setTimeout(() => window.__sakhiNotify && window.__sakhiNotify(true), 50); }, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rows = [];
async function run(name, when, steps) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.37-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(when) });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  await settle(600);
  let n = 0;
  const snap = async (label) => {
    n++; const f = name + '-' + String(n).padStart(2, '0') + '-' + label.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const m = await page.evaluate(() => {
      const vis = (el) => !!el && el.getBoundingClientRect().height > 0;
      const sh = document.querySelector('#sheet-root .sheet'); const tour = document.querySelector('#tour-root #tour-h');
      const v = document.querySelector('#view');
      const words = (s) => (String(s || '').trim().match(/\S+/g) || []).length;
      const btns = [...document.querySelectorAll('#view button, #view a[data-go], #view input, #view select, #sheet-root button')].filter(vis).length;
      return { hash: location.hash, h: [...document.querySelectorAll('#view h1, #view h2, #view h3')].slice(0, 4).map((x) => x.innerText.trim()).join(' | '),
        words: words(v ? v.innerText : ''), sheetWords: sh ? words(sh.innerText) : 0, sheet: sh ? sh.innerText.trim().slice(0, 140).replace(/\n+/g, ' / ') : '', tour: tour ? document.querySelector('#tour-root .tour-n').innerText + ' ' + tour.innerText : '',
        screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1), controls: btns, top: (v ? v.innerText : '').trim().slice(0, 160).replace(/\n+/g, ' / ') };
    });
    await page.screenshot({ path: path.join(OUT, f + '.png') });
    if (m.screens > 1.15) await page.screenshot({ path: path.join(OUT, f + '-full.png'), fullPage: true });
    rows.push(Object.assign({ run: name, n, label }, m));
  };
  const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(350); };
  await steps({ page, snap, tap, settle });
  if (errs.length) rows.push({ run: name, n: 99, label: 'ERRORS', top: errs.join(' || ') });
  await ctx.close();
}

/* A. A new woman, the field test's case: periods 36-45 days apart, some months skipped (Mohit's example). Version 39.10: about
   you, her stage, her goals, a few details, who uses the phone, sign-up, "Your Sakhi", the first-day tour, her first log in
   Diary, then Today's plan offer and the plan's own questions */
await run('A', '2026-10-24T10:00:00+05:30', async ({ page, snap, tap, settle }) => {
  await snap('language'); await tap('[data-ob-lang="en"]');
  await snap('hello'); await tap('#w-start');
  await snap('about-you'); await page.fill('#ob-name', 'Riya'); await tap('[data-ob-dec="1990"]'); await snap('about-you-year'); await tap('[data-ob-y="1996"]');
  await snap('stage'); await tap('[data-ob-st="pmos"]');
  await snap('goals'); await tap('[data-ob-goal="irregular"]'); await tap('[data-ob-goal="skin"]'); await snap('goals-picked'); await tap('#ob-next');
  await snap('details'); await tap('[data-ob-lp="more"]'); await tap('[data-ob-lpm="60"]'); await tap('[data-ob-gap="g45"]'); await tap('[data-ob-dx="ns"]'); await snap('details-answered'); await tap('#ob-next');
  await snap('shared-phone'); await tap('[data-ob-sh="me"]'); await settle(600);
  await snap('signup-number'); await page.fill('#su-num', '9876543210'); await tap('#su-send'); await settle(400);
  await snap('signup-code'); await page.fill('#su-code', '123456'); await settle(1200);
  await snap('signup-details'); if (await page.$('#su-done')) { await page.fill('#su-pin', '302001'); await tap('#su-done'); }
  await settle(1200);
  await snap('your-sakhi'); await tap('#ys-tour'); await settle(900);
  for (let k = 0; k < 4 && (await page.$('#tour-root #tour-next')); k++) { await snap('first-day-tour-' + (k + 1)); await tap('#tour-root #tour-next'); await settle(600); }
  await snap('diary-first-log'); await tap('[data-fl-days="5"]'); await tap('[data-fl-sign="d_acne"]'); await snap('first-log-answered'); await tap('#fl-save'); await settle(900);
  await snap('today-plan-offer'); await tap('#pl-off-go');
  await snap('periods-q'); for (const s of ['[data-pl-q="skips:y"]', '[data-pl-m="signs:acne"]']) await tap(s);
  await snap('periods-q-answered'); await tap('#pl-in-next');
  await snap('your-day'); for (const s of ['[data-pl-q="act:0"]', '[data-pl-q="food:veg"]', '[data-pl-m="lim:none"]', '[data-pl-q="bed:late"]', '[data-pl-q="work:day"]']) await tap(s);
  await tap('#pl-in-next');
  await snap('when-move'); await tap('[data-pl-when="dinner"]');
  if (await page.$('#pl-in-skip')) { await snap('body'); await tap('#pl-in-skip'); }   /* Version 39.3: only for a weight goal */
  if (await page.$('#pl-in-make')) { await snap('summary'); await tap('#pl-in-make'); await settle(800); }
  /* Version 37.1: the plan's cards, then the Start screen */
  for (let k = 0; k < 8 && (await page.$('#pl-rv-next')) && !(await page.$('#pl-rv-go')); k++) { await snap('reveal-card-' + (k + 1)); await tap('#pl-rv-next'); }
  await snap(await page.$('#pl-rv-next') ? 'reveal' : 'start-screen');
  if (await page.$('#pl-st-allow')) { await tap('#pl-st-allow'); await settle(800); await snap('start-screen-allowed'); }
  await tap('#pl-rv-go'); await settle(1500);
  await snap('after-start');
  if (await page.$('#nq-yes')) { await tap('#nq-yes'); await settle(800); await snap('after-notify'); }
  await settle(1500); await snap('today-first');
  for (let k = 0; k < 4 && (await page.$('#tour-root #tour-next')); k++) { await tap('#tour-root #tour-next'); await settle(600); await snap('today-tip-' + k); }
  await page.evaluate(() => window.scrollTo(0, 0)); await snap('today-clean');
  /* she taps her first step */
  const step = await page.$('#view .today-card [data-today-act]');
  if (step) { await step.click(); await settle(800); await snap('after-first-done'); }
  /* the evening: 8 pm */
  await page.clock.runFor(10 * 3600 * 1000); await page.evaluate(() => { location.hash = '#diary'; }); await settle(300); await page.evaluate(() => { location.hash = '#home'; }); await settle(900);
  await snap('today-evening');
  if (await page.$('[data-go="plan-checkin"]')) { await tap('[data-go="plan-checkin"]'); await snap('checkin'); }
  await page.evaluate(() => { location.hash = '#plan'; }); await settle(800); await snap('my-plan');
});

/* B. Mohit's path: an existing diary with the V35 PMOS plan going; My plan > Change what I work on; then he leaves the
   reveal by the Today tab instead of "Start today" */
await run('B', '2026-10-24T01:20:00+05:30', async ({ page, snap, tap, settle }) => {
  await page.evaluate(() => {
    const S = window.Saathi; const iso = (n) => S.toISO(S.addDays(S.today(), -n));
    localStorage.setItem('qura-sakhi-account-v1', JSON.stringify({ token: 'test', id: 'test', phone: '+919800000000', name: 'Megha', pincode: '302020', activeOn: iso(0) }));
    const st = { lang: 'en', langChosen: true, stage: 'app', dob: '1994-07-01', consent: { c1: iso(5) }, situation: { pcos: true }, goals: ['track', 'pmos'],
      events: [{ d: iso(80), t: 'start' }, { d: iso(75), t: 'end' }, { d: iso(36), t: 'start' }, { d: iso(31), t: 'end' }, { d: iso(4), t: 'spot' }], daily: {}, notes: {}, checkins: {},
      tours: Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: iso(4) }])), fullTour: { st: 'done', d: iso(4) }, settings: { toursAuto: true }, prompts: { notifyIntro: iso(3) },
      mods: { plan: { start: iso(1), level: 0, food: 'veg', region: 'north', focus: 'habits', goal: 'cycles', limits: { knees: false, back: false }, remAt: '18:00', log: {}, weeks: {}, body: [] } } };
    localStorage.setItem('qura-saathi-v1', JSON.stringify(st)); location.reload();
  });
  await page.waitForFunction(() => !!window.Saathi); await settle(1500);
  await snap('today-before');
  await page.evaluate(() => { location.hash = '#plan'; }); await settle(800); await snap('my-plan-old');
  await tap('#pl-chg'); await snap('change-goal');
  await tap('[data-pl-goal="irregular"]'); await snap('periods-q');
  for (const s of ['[data-pl-q="gap:g45"]', '[data-pl-q="skips:y"]', '[data-pl-q="dx:y"]', '[data-pl-m="signs:acne"]']) await tap(s);
  await tap('#pl-in-next'); await snap('your-day');
  for (const s of ['[data-pl-q="act:1"]', '[data-pl-q="food:veg"]', '[data-pl-m="lim:none"]', '[data-pl-q="bed:late"]', '[data-pl-q="work:day"]']) await tap(s);
  if (await page.$('[data-pl-q="remind:20:00"]')) await tap('[data-pl-q="remind:20:00"]');   /* before Version 37.1 only */
  await tap('#pl-in-next'); await tap('[data-pl-when="dinner"]'); if (await page.$('#pl-in-skip')) await tap('#pl-in-skip'); await settle(600);
  if (await page.$('#pl-in-make')) { await snap('summary'); await tap('#pl-in-make'); await settle(600); }
  await snap('reveal');
  await page.evaluate(() => document.querySelector('#tabbar [data-go="home"]').click()); await settle(1500);
  await snap('today-after-leaving-reveal');
  await page.evaluate(() => { const d = document.querySelector('#view details.slot-more'); if (d) d.open = true; }); await settle(300);
  await snap('today-slot-open');
});

fs.writeFileSync(path.join(OUT, 'walk.json'), JSON.stringify(rows, null, 1));
for (const r of rows) console.log([r.run + r.n, r.label, r.hash, 'w' + r.words + (r.sheetWords ? '+' + r.sheetWords : ''), r.screens + 'scr', 'c' + r.controls, r.tour ? 'TOUR ' + r.tour : '', r.sheet ? 'SHEET ' + r.sheet : '', r.h].filter(Boolean).join(' · '));
await browser.close();
