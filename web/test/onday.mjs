// Version 39.66, plan questions on their day (Mohit, 4 Nov: "proceed with plan questions on their day"; the advice's phase C and the
// minimalist baseline: "Ask less: only what the plan uses, on the day it changes something"):
// - 1 her plan's questions: no "Your day" before Start (how active she is, how she eats, milk, her knees or back, her bedtime and
//   her day wait); the midlife plan still asks its two safety questions (weak bones, chest pain when she walks), and only those;
// - 2 at Start: what waits (dayAsk), with gentle moves for her knees and back meanwhile; an answer she gave before (My food) isn't
//   asked again;
// - 3 Today, one question at a time under her week, on the first day a step uses it: knees or back on a routine day, how she eats
//   and milk on a food step, how active she is with her move, her bedtime on the day her bedtime step joins and her day after it;
//   one tap answers it and her steps follow; never in discreet mode or on a shared phone; a plan from before asks nothing;
// - 4 Hindi at 360 px; no page errors;
// - 5 a default isn't an answer: a new plan still waits for what she hasn't answered, carries her bedtime and her day, and the
//   summary shows her answers from the plan before, with Change (what still waits isn't filled in); My PMOS plan's own page too.
// Usage: node test/onday.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const SHOTS = path.join(root, 'test', 'shots', 'onday'); fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page, n) => page.screenshot({ path: path.join(SHOTS, n + '.png') });
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-04';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.66-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, goals: ['pain', 'track'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* My PMOS plan (Version 39.57's walk), started `startAgo` days ago, with the questions that wait */
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', when: 'dinner' }, o || {});
const pmosP = (startAgo, x) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: true, back: true }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: null, work: null, log: {}, weeks: {}, body: [], doc: 'done', intake: CIK(), dayAsk: ['act', 'food', 'milk', 'lim', 'bed', 'work'] }, x || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const pmosS = (startAgo, x, y) => Object.assign({ dob: '1998-05-01', situation: { care: 'private', pcos: true }, goals: ['pmos'], intake: CIK(), mods: { plan: pmosP(startAgo, x) }, reminders: [planRem(startAgo)] }, y || {});

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const hash = (page) => page.evaluate(() => location.hash);
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods || {}).plan || {})));
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const dq = (page) => page.$$eval('#view .pl-dq [data-pl-dq]', (b) => b.map((x) => x.dataset.plDq)).then((l) => (l.length ? l[0].split(':')[0] : null));
const acts = (page) => page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => ({ id: x.id, kind: x.kind })));
/* her plan's questions, answered with the first choice (No where there is one): the keys each screen asked; the summary's words */
let lastSum = '';
async function answer(page, stopAtSum) {
  lastSum = '';
  const keys = new Set();
  for (let i = 0; i < 14 && /plan-goal/.test(await hash(page)); i++) {
    const ks = await page.evaluate(() => { const v = document.querySelector('#view'); const g = new Map();
      [...v.querySelectorAll('[data-pl-q], [data-pl-m]')].forEach((b) => { const k = (b.dataset.plQ || b.dataset.plM).replace(/:.*/, ''); if (!g.has(k)) g.set(k, []); g.get(k).push(b); });
      for (const [, bs] of g) { if (bs.some((b) => b.classList.contains('on'))) continue; (bs.find((b) => /:(n|no|none)$/.test(b.dataset.plQ || b.dataset.plM || '')) || bs[0]).click(); }
      const w = v.querySelector('[data-pl-when="dinner"]') || v.querySelector('[data-pl-when]'); if (w && !v.querySelector('[data-pl-when].on')) w.click();
      return [...g.keys()]; });
    ks.forEach((k) => keys.add(k)); await settle(page, 300);
    if (!(await has(page, '#pl-in-next'))) { if (await has(page, '#pl-in-make')) { lastSum = await txt(page, '#view'); if (stopAtSum) break; await tap(page, '#pl-in-make'); } else break; } else await tap(page, '#pl-in-next');
    await settle(page, 400);
  }
  return [...keys];
}
const DAYQ = ['act', 'food', 'milk', 'lim', 'bed', 'work'];
const startIt = async (page) => { for (let i = 0; i < 8 && !(await has(page, '#pl-rv-go')); i++) { if (await has(page, '#pl-rv-next')) await tap(page, '#pl-rv-next'); else break; } await tap(page, '#pl-rv-go'); await settle(page, 1200); };

/* ---------- 1 and 2. Her plan's questions, and what waits at Start ---------- */
{
  let a = await open({ seed: { goals: ['pain'] } });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 600);
  const k1 = await answer(a.page);
  check('1 My period plan: nothing about her day before Start', k1.length > 0 && !k1.some((k) => DAYQ.indexOf(k) >= 0), k1);
  for (let i = 0; i < 8 && !(await has(a.page, '#pl-rv-go')); i++) { if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  await tap(a.page, '#pl-rv-go'); await settle(a.page, 1200);
  const p = await plan(a.page);
  check('2 at Start: how active she is, how she eats, milk and her knees or back wait, with gentle moves meanwhile', p.start && DAYQ.slice(0, 4).every((k) => (p.dayAsk || []).indexOf(k) >= 0) && p.limits && p.limits.knees && p.limits.back && p.level === 0, { dayAsk: p.dayAsk, limits: p.limits, level: p.level });
  await done(a);
  a = await open({ seed: { goals: ['pain'], mods: { food: { type: 'egg', milk: true } } } });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 600); await answer(a.page);
  for (let i = 0; i < 8 && !(await has(a.page, '#pl-rv-go')); i++) { if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  await tap(a.page, '#pl-rv-go'); await settle(a.page, 1200); const p2 = await plan(a.page);
  check('2 ... what My food holds isn\'t asked again', (p2.dayAsk || []).indexOf('food') < 0 && (p2.dayAsk || []).indexOf('milk') < 0 && p2.food === 'egg', { dayAsk: p2.dayAsk, food: p2.food });
  await done(a);
  a = await open({ seed: { dob: '1976-03-01', situation: { care: 'private', midlife: true }, goals: ['hot'], events: regular(20) } });
  await a.page.evaluate(() => window.Saathi.plan.offer('hot')); await settle(a.page, 600);
  const k3 = await answer(a.page);
  check('1 My midlife plan: its two safety questions before Start (weak bones, chest pain), and nothing else about her day', k3.indexOf('mbone') >= 0 && k3.indexOf('mheart') >= 0 && !k3.some((k) => DAYQ.indexOf(k) >= 0), k3);
  await done(a);
}

/* ---------- 3. Today: one question at a time, on its day ---------- */
{
  let a = await open({ seed: pmosS(0) });
  const ac = await acts(a.page); const q1 = await dq(a.page);
  const want = ac.some((x) => x.kind === 'routine') ? 'lim' : (ac.some((x) => x.id === 'food') ? 'food' : 'act');
  check('3 day 1: one question under her week, the one her first step needs', q1 === want && (await a.page.$$('#view .pl-dq')).length === 1, { q1, want, ac });
  await shot(a.page, '1-today-day1');
  const order = []; for (let i = 0; i < 6; i++) { const k = await dq(a.page); if (!k) break; order.push(k); const v = { lim: 'none', food: 'egg', milk: 'n', act: '1', bed: 'b23', work: 'day' }[k]; await tap(a.page, '#view [data-pl-dq="' + k + ':' + v + '"]'); }
  const p = await plan(a.page); const fd = await a.page.evaluate(() => window.Saathi.food && window.Saathi.food.diet());
  check('3 ... each answered in one tap: food, milk and her activity on day 1; her bedtime not yet (from day 4)', order.indexOf('food') >= 0 && order.indexOf('milk') >= 0 && order.indexOf('act') >= 0 && order.indexOf('bed') < 0 && p.food === 'egg' && p.level === 1 && fd && fd.type === 'egg' && !fd.milk && p.dayAsk.join() === 'bed,work', { order, dayAsk: p.dayAsk, food: p.food, level: p.level, fd });
  await done(a);
  a = await open({ seed: pmosS(1, { dayAsk: ['bed', 'work'] }) });
  check('3 plan day 2: no bedtime question yet', !(await dq(a.page)));
  await done(a);
  a = await open({ seed: pmosS(3, { dayAsk: ['bed', 'work'] }) });
  check('3 plan day 4, when her bedtime step joins: "When do you usually go to sleep?"', (await dq(a.page)) === 'bed' && /When do you usually go to sleep\?/.test(await txt(a.page, '#view .pl-dq')));
  await shot(a.page, '2-today-day4-bedtime');
  await tap(a.page, '#view [data-pl-dq="bed:b24"]');
  const a2 = await acts(a.page); const toast = await txt(a.page, '#toast-root');
  check('3 ... the wind-down it brings, named as the Start card names it', /Reminders are on: your 11 pm wind-down\. Nothing shows on the lock screen\./.test(toast) && await a.page.evaluate(() => !!window.Saathi.reminders.get('plan-wind')), toast);
  check('3 ... answered: her bedtime step is there, and her day is asked next', a2.some((x) => x.id === 'sleep') && (await dq(a.page)) === 'work', a2);
  await tap(a.page, '#view [data-pl-dq="work:day"]'); const p3 = await plan(a.page);
  check('3 ... then nothing more to ask', !(await dq(a.page)) && !(p3.dayAsk || []).length && p3.bed === 'b24' && p3.work === 'day', p3.dayAsk);
  await done(a);
  a = await open({ seed: pmosS(0, { dayAsk: ['lim'] }) });
  const ra = await acts(a.page);
  if (ra.some((x) => x.kind === 'routine')) {
    check('3 a routine today: "Any pain in your knees or back?"', (await dq(a.page)) === 'lim');
    await tap(a.page, '#view [data-pl-dq="lim:none"]'); const p4 = await plan(a.page);
    check('3 ... "No": her moves are no longer the gentle ones', p4.limits && !p4.limits.knees && !p4.limits.back);
  } else check('3 no routine today: nothing about her knees or back', !(await dq(a.page)), ra);
  await done(a);
  /* knees, back or both, in one tap (the settings page's four answers) */
  let rn = -1; for (let n = 0; n < 7 && rn < 0; n++) { const b = await open({ seed: pmosS(n, { dayAsk: ['lim'] }) }); if ((await acts(b.page)).some((x) => x.kind === 'routine')) rn = n; await done(b); }
  a = await open({ seed: pmosS(Math.max(rn, 0), { dayAsk: ['lim'] }) });
  const lo = await a.page.$$eval('#view .pl-dq [data-pl-dq]', (b) => b.map((x) => x.dataset.plDq));
  check('3 her knees or back: No, Knees, Back or Both, as My plan\'s settings ask it', rn >= 0 && lo.join() === 'lim:none,lim:knees,lim:back,lim:both', { rn, lo });
  if (rn >= 0) { await tap(a.page, '#view [data-pl-dq="lim:both"]'); const p5 = await plan(a.page); const sk = await a.page.evaluate(() => (window.Saathi.state.intake || {}).lim);
    check('3 ... "Both": gentle moves for both, saved with her answers', p5.limits.knees && p5.limits.back && (p5.intake.lim || []).join() === 'knees,back' && (sk || []).join() === 'knees,back' && !(p5.dayAsk || []).length, { limits: p5.limits, lim: p5.intake.lim, sk }); }
  await done(a);
  a = await open({ seed: pmosS(0, {}, { settings: { discreet: true } }) });
  check('3 discreet mode: no question', !(await has(a.page, '#view .pl-dq')));
  await done(a);
  a = await open({ seed: pmosS(0, {}, { settings: { shared: true } }) });
  if (await has(a.page, '#rest-open')) await tap(a.page, '#rest-open');
  check('3 a shared phone: no question', !(await has(a.page, '#view .pl-dq')));
  await done(a);
  a = await open({ seed: pmosS(0, { dayAsk: undefined, limits: { knees: false, back: false } }) });
  check('3 a plan from before (nothing waits): no question', !(await has(a.page, '#view .pl-dq')));
  await done(a);
}

/* ---------- 5. A default isn't an answer ---------- */
{
  /* she moves to My period plan while her knees or back and her activity still wait on My PMOS plan */
  let a = await open({ seed: pmosS(10, { dayAsk: ['act', 'lim'], bed: 'b23', work: 'day' }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 600);
  await answer(a.page);
  check('5 changing plans while answers wait: no summary, her new plan is made (Version 39.68)', !lastSum && /plan-reveal/.test(await hash(a.page)), await hash(a.page));
  await startIt(a.page); let p = await plan(a.page);
  check('5 ... the new plan still waits for her knees or back and her activity, gentle meanwhile', p.goalKey === 'pain' && ['act', 'lim'].every((k) => (p.dayAsk || []).indexOf(k) >= 0) && p.limits.knees && p.limits.back && p.level === 0, { goalKey: p.goalKey, dayAsk: p.dayAsk, limits: p.limits, level: p.level });
  check('5 ... and keeps her bedtime and her day', p.bed === 'b23' && p.work === 'day', { bed: p.bed, work: p.work });
  await done(a);
  /* her activity she answered on the plan before; her knees or back still waits */
  a = await open({ seed: pmosS(10, { dayAsk: ['lim'], level: 1, intake: CIK({ act: 1 }) }, { intake: CIK({ act: 1 }) }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 600);
  await answer(a.page, true);
  check('5 her answer from the plan before: no summary to check it on (Version 39.68), her new plan is made', !lastSum && /plan-reveal/.test(await hash(a.page)), await hash(a.page));
  await done(a);
  a = await open({ seed: pmosS(10, { dayAsk: ['lim'], level: 1, intake: CIK({ act: 1 }) }, { intake: CIK({ act: 1 }) }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 600);
  await answer(a.page); await startIt(a.page); p = await plan(a.page);
  check('5 ... started: her activity carried, her knees or back still waits', p.level === 1 && (p.dayAsk || []).indexOf('act') < 0 && (p.dayAsk || []).indexOf('lim') >= 0, { level: p.level, dayAsk: p.dayAsk });
  await done(a);
  /* My PMOS plan's own page */
  a = await open({ seed: pmosS(10, { dayAsk: ['act', 'lim', 'bed', 'work'] }), hash: '#plan-start' });
  check('5 My PMOS plan\'s page: no answer shown for her activity or her knees or back while they wait', await has(a.page, '[data-pl-f="level"]') && !(await has(a.page, '[data-pl-f="level"].on')) && !(await has(a.page, '[data-pl-f="lim"].on')));
  for (const s2 of ['[data-pl-f="goal"][data-v="cycles"]', '[data-pl-f="level"][data-v="1"]', '[data-pl-f="lim"][data-v="none"]', '[data-pl-f="food"][data-v="veg"]', '[data-pl-f="region"]']) await tap(a.page, s2);
  await tap(a.page, '#pl-go'); p = await plan(a.page);
  check('5 ... answered there, they stop waiting; her bedtime and her day wait on', p.next && (p.next.dayAsk || []).join() === 'bed,work', p.next && p.next.dayAsk);
  await done(a);
}

/* ---------- 4. Hindi at 360 px ---------- */
{
  const a = await open({ seed: Object.assign(pmosS(0), { lang: 'hi' }) });
  await shot(a.page, '3-today-hindi');
  check('4 Hindi: the question in Hindi, at 360 px', await has(a.page, '#view .pl-dq') && !/[a-z]{4,} [a-z]{4,}/.test(await txt(a.page, '#view .pl-dq strong')) && await noScroll(a.page), await txt(a.page, '#view .pl-dq'));
  await done(a);
}

check('4 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const fails = results.filter((r) => !r.pass).length;
console.log((fails ? '' : 'page errors none | ') + (results.length - fails) + '/' + results.length + ' passed');
process.exit(fails ? 1 : 0);
