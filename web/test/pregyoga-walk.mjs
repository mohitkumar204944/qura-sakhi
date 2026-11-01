// Version 39.52's walk (Mohit, 1 Nov: "test first for bugs and gaps"): pregnancy yoga lived through every state, screens and words
// to test/shots/pregyoga-walk/ (a walk, not pass/fail: read its report). The checks are in test/pregyoga.mjs.
// Usage: node test/pregyoga-walk.mjs [dir]
//
// (The helpers below are test/pregyoga.mjs's.) Version 39.52: pregnancy yoga by trimester (Mohit, 1 Nov: "build the pregnancy yoga by trimester", after the walk through a
// prenatal yoga app; the programme design, docs/plans-design-and-build-2026-10-24-programmes.md, section 6; MODULE_API section
// 95). This file checks:
//   1 three routines by her week (first three months to 13 weeks, middle to 27, last from 28), drawn, her bump from 14 weeks;
//     nothing on the back after 13 weeks, nothing on the tummy, no twist, no rising on the toes, no step-ups, no breath held;
//     10 minutes at most; balance at a wall;
//   2 Today on My pregnancy: on days 2 and 5 of her plan week, her three months' yoga in the walk's place (Start), on the green
//     tier only; amber keeps the easy walk, red has no move, a sign that doesn't wait has none; 3 steps or fewer on day 1, 4 at
//     most; the routine changes at 14 and 28 weeks; My plan names it on her walk days too; "Before you start" names it;
//   3 the player: the stop card above Start (the moves' stop signs, Help's "Call 112 now" line, Call 112), drawings only (no 3D
//     figure, which isn't pregnant), "Feeling unwell?" on every move (Call 112, 108, 102; "I feel fine now" goes back, paused;
//     "Stop for today" holds her walk and yoga until she checks her answers again, and "A quick check" leads the next day);
//     10-second rests, none between sides or before resting on her side;
//   4 Moves and calm in a pregnancy: only her three months' yoga (and Calm breath in Wind down); the other routines' pages
//     refuse; why it isn't open (no plan yet, her doctor first, a sign that doesn't wait); never the pregnancy yoga outside one;
//   5 a shared phone: "Yoga", never "Pregnancy yoga"; 6 Hindi at 360 px; 7 no page errors.
// Usage: node test/pregyoga.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'pregyoga-walk'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-01';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.52-pilot', platform: 'android' };
/* pregnant `w` weeks today, with her doctor */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(20), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 20, pnow: null }, o || {});
/* My pregnancy (version 2) started `startAgo` days ago: 0 is her day 1 (a walk day); 2 and 5 are her plan week's yoga days */
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (w, startAgo, o, seed) => Object.assign({ situation: sit(w) }, seed || {}, { mods: Object.assign({ plan: preg(startAgo, Object.assign({ intake: IK({ psafeW: w }) }, o || {})) }, (seed || {}).mods || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, r: x.r || null, title: x.title, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const mv = async (a) => (await acts(a)).find((x) => x.id === 'move') || null;
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());
const SRC = fs.readFileSync(path.join(root, 'mods', 'plan.js'), 'utf8');
const STOP = 'Dizziness, a headache, breathlessness before you start, or a calf that hurts or swells. Stop, rest, and tell your doctor today.';
const NOW = 'Chest pain, fainting, or regular painful tightenings in your tummy.';   /* never "today": these go with Help's "Call 112 now" line */


const REPORT = []; const note = (k, v) => { REPORT.push('## ' + k + '\n' + String(v).replace(/\s+/g, ' ').trim().slice(0, 1400)); };
const flag = (k, v) => REPORT.push('!! ' + k + ': ' + v);
const text = async (a, sel) => (await txt(a, sel || '#view'));
try {
  /* A. green, 20 weeks, a yoga day */
  const a = await open({ seed: withPlan(20, 2), w: 360, h: 800 });
  await go(a, 'home'); note('A1 Today (yoga day)', await text(a)); await shot(a, 'A1-today');
  await a.page.$eval('#view .today-plan-move [data-today-why]', (e) => e.click()); await settle(a.page, 400);
  note('A2 Why sheet', await a.page.evaluate(() => (document.querySelector('.pl-why-sh') || {}).innerText || 'none')); await shot(a, 'A2-why');
  await a.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(a.page, 300);
  await go(a, 'plan'); note('A3 My plan', await text(a)); await shot(a, 'A3-myplan');
  await go(a, 'plan-r-preg2'); await tap(a, '#pl-pstart');
  const st2 = await a.page.evaluate(() => window.Saathi.plan.stepsOf('preg2').map((s) => s.s));
  for (let i = 0; i < st2.length; i++) {
    if (i === 5) { await shot(a, 'A4-cat'); note('A4 cat step', await text(a)); }
    await a.page.clock.runFor((st2[i] + 0.6) * 1000); await sleep(20);
    if (i === 0 && await has(a, '#pl-rest')) { await shot(a, 'A5-rest'); note('A5 rest', await text(a)); }
    if (await has(a, '#pl-skip')) { await a.page.$eval('#pl-skip', (e) => e.click()); await settle(a.page, 200); }
    if (i === st2.length - 2) { await shot(a, 'A6-siderest'); note('A6 side rest step', await text(a)); }
  }
  await settle(a.page, 600); note('A7 done', await text(a)); await shot(a, 'A7-done');
  if (await has(a, '[data-pl-feel="hard"]')) { await tap(a, '[data-pl-feel="hard"]'); note('A8 hard tip', await text(a)); }
  const s = await st(a); note('A9 log today', JSON.stringify(s.mods.plan.log));
  await go(a, 'home'); note('A10 Today after', await text(a));
  await done(a);
  /* the evening check-in: a yoga day not done, and the day before a yoga day */
  const c1 = await open({ seed: withPlan(20, 2), hm: '21:30', w: 360, h: 800 });
  await go(c1, 'plan-checkin'); note('B1 check-in, yoga day, nothing done', await text(c1)); await shot(c1, 'B1-checkin');
  await done(c1);
  const c2 = await open({ seed: withPlan(20, 1), hm: '21:30', w: 360, h: 800 });
  await go(c2, 'plan-checkin'); note('B2 check-in, the day before a yoga day', await text(c2)); await shot(c2, 'B2-checkin-before');
  await done(c2);
  const c3 = await open({ seed: withPlan(20, 1), w: 360, h: 800 });
  await go(c3, 'home'); note('B3 Today, a walk day', await text(c3));
  await done(c3);
  /* C. the first three months, knee pain */
  const k = await open({ seed: withPlan(10, 2, { limits: { knees: true, back: false } }), hash: 'plan-r-preg1', w: 360, h: 800 });
  note('C1 first months intro, knee pain', await text(k)); await shot(k, 'C1-preg1-knees');
  await done(k);
  /* D. the last three months, 37 weeks */
  const d = await open({ seed: withPlan(37, 2), w: 360, h: 800 });
  await go(d, 'home'); note('D1 Today 37 weeks', await text(d)); await shot(d, 'D1-today-37');
  await go(d, 'plan-r-preg3'); note('D2 last months intro', await text(d));
  await done(d);
  /* E. amber; F. no plan; G. version 1 */
  const e = await open({ seed: withPlan(20, 2, { intake: IK({ pflags: ['r_gdm'] }) }), w: 360, h: 800 });
  await go(e, 'home'); note('E1 Today amber (yoga day)', await text(e));
  await go(e, 'plan-moves'); note('E2 Moves amber', await text(e)); await shot(e, 'E2-moves-amber');
  await done(e);
  const f = await open({ seed: { situation: sit(20) }, hash: 'plan-moves', w: 360, h: 800 });
  note('F1 Moves, no plan', await text(f)); await shot(f, 'F1-moves-noplan');
  if (await has(f, '.pl-pylock [data-go]')) { await tap(f, '.pl-pylock [data-go]'); note('F2 after "My pregnancy plan"', (await f.page.evaluate(() => location.hash)) + ' ' + await text(f)); await shot(f, 'F2-after-lock'); }
  await done(f);
  const g = await open({ seed: withPlan(20, 30, { pv: 1 }), hash: 'plan-moves', w: 360, h: 800 });
  note('G1 Moves, version 1', await text(g)); await shot(g, 'G1-moves-v1');
  if (await has(g, '.pl-pylock [data-go]')) { await tap(g, '.pl-pylock [data-go]'); note('G2 after the button (v1)', (await g.page.evaluate(() => location.hash)) + ' ' + await text(g)); await shot(g, 'G2-v1-after'); }
  await go(g, 'home'); note('G3 Today, version 1', await text(g));
  await done(g);
  /* H. the PMOS hub and I. search, pregnant */
  const h = await open({ seed: withPlan(20, 2), hash: 'plan-pmos', w: 360, h: 800 });
  note('H1 PMOS hub, pregnant', (await h.page.evaluate(() => location.hash)) + ' ' + await text(h)); await shot(h, 'H1-pmos-hub');
  await go(h, 'explore');
  const q = await h.page.$('#view input[type="search"], #view input[type="text"]');
  if (q) { await q.fill('yoga'); await settle(h.page, 600); note('I1 search "yoga", pregnant', await text(h)); await shot(h, 'I1-search-yoga'); } else flag('I1', 'no search box on Explore');
  await done(h);
  /* J. dark mode; K. a small phone */
  const j = await open({ seed: withPlan(32, 2, {}, { settings: { theme: 'dark', toursAuto: false } }), hash: 'plan-r-preg3', w: 360, h: 800 });
  await j.page.emulateMedia({ colorScheme: 'dark' }); await settle(j.page, 300); await shot(j, 'J1-dark-intro'); await tap(j, '#pl-pstart'); await shot(j, 'J2-dark-step');
  await tap(j, '#pl-unwell'); await shot(j, 'J3-dark-unwell');
  await done(j);
  const sm = await open({ seed: withPlan(20, 2), hash: 'plan-r-preg2', w: 360, h: 640 });
  await tap(sm, '#pl-pstart'); await shot(sm, 'K1-small-step');
  note('K1 small phone: chip and buttons', JSON.stringify(await sm.page.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; }; return { chip: r('#pl-unwell'), timer: r('.pl-timer'), ctl: r('.pl-ctl'), tabbar: r('.tabbar'), vh: innerHeight }; })));
  await done(sm);
  /* L. a shared phone; M. Hindi */
  const l = await open({ seed: withPlan(20, 2, {}, { settings: { discreet: true } }), w: 360, h: 800 });
  await go(l, 'home'); note('L1 Today discreet', await text(l)); await go(l, 'plan'); note('L2 My plan discreet', await text(l)); await shot(l, 'L2-myplan-discreet');
  await done(l);
  const m = await open({ seed: withPlan(20, 2, {}, { lang: 'hi' }), w: 360, h: 800 });
  await go(m, 'home'); note('M1 Today Hindi', await text(m)); await shot(m, 'M1-today-hi');
  await go(m, 'plan'); note('M2 My plan Hindi', await text(m));
  await done(m);
} catch (e) { flag('crash', String(e && e.stack).slice(0, 600)); }
if (errsAll.length) flag('page errors', errsAll.slice(0, 5).join(' | '));
await browser.close();
fs.writeFileSync(path.join(SHOTS, 'report.md'), REPORT.join('\n\n') + '\n');
console.log('walk done: ' + REPORT.length + ' notes, ' + REPORT.filter((x) => /^!!/.test(x)).length + ' flags -> test/shots/pregyoga-walk/report.md');
