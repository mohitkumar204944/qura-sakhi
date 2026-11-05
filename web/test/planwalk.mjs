// Version 39.41: the three-plan walk's gaps (Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps properly for
// home my plan and diary for all three stage users", then "fix all 10"; MODULE_API section 84). This file checks:
//   1 Getting ready's 12 weeks: a part that has passed has no tick;
//   2 a routine done without the player counts its minutes once (the check-in's Done, undone by the tick; played, not twice);
//   3 the check-in never asks "Do it now" for "Due now" (it waits for her visit);
//   4 a pregnancy's look back says "Plan week {n} is done";
//   5 "Why these {n} steps?" counts her daily steps;
//   6 "A calm few minutes" without "from week 8";
//   7 getting ready, her period 14 days or more late and no test since: My plan leads with "Period late?", the lesson steps aside;
//   8 "My doctor" in every plan's care team on her doctor's route, and "Call my doctor" on the doctor screen once it is saved;
//   9 the Diary in a pregnancy: its days in one group, no cycle strip on its bleeds;
//   10 a yoga or strength step's minutes on its Start, so its line shows whole; from 37 weeks the pregnancy card's buttons two to a row;
//   11 Hindi at 360 px; 12 no page errors.
// Usage: node test/planwalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'planwalk'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.34-pilot', platform: 'android' };
/* pregnant `w` weeks today (her last period 7w + 3 days ago), with her doctor (or o.care) */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(10), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* her saved answers, and a running My pregnancy (version 2) that started `startAgo` days ago (0: today, her day 1) */
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 10, pnow: null }, o || {});
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (startAgo, o, seed) => Object.assign({}, seed || {}, { mods: Object.assign({ plan: preg(startAgo, o) }, (seed || {}).mods || {}), intake: (o && o.intake) || IK() });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  if (o.bridge) await ctx.addInitScript(bridge({ notify: true }));   /* the Android bridge, as test/notify.mjs fakes it */
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
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
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const ids = async (a) => (await acts(a)).map((x) => x.id);
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());
const LABELS = ['My doctor told me to rest, or not to exercise', 'Marked as a high-risk pregnancy', 'High BP', 'Severe anaemia (Hb under 7)', 'Twins or more', 'Sugar in pregnancy, or diabetes', 'Problems in an earlier pregnancy (bleeding, fits, high BP, loss)', 'Something else', 'Not sure about any of these'];
const S1C = 'In pregnancy: bleeding, leaking water, fever, severe headache or blurred vision, fits, swelling of face or hands, or the baby moving less after 28 weeks';   /* core's s1c, from the reviewed danger list (app.js DANGER) */
const K_TODAY = "Fewer or weaker movements than usual: call your hospital or doctor straight away and get checked today, even if it is the middle of the night. Don't wait until tomorrow, and don't go to sleep on it.";
const K_NOW = 'No movement at all, or the movements have stopped: go to hospital now. Free ambulance 108 or 102.';
const LV_NOW = 'Call 112, or 108 or 102 for a free ambulance, and go to the nearest district hospital or the hospital where you are registered. Do not wait to see if it settles.';
const SIDE = 'From 28 weeks, go to sleep on your side, left or right. A pillow under your belly and between your knees helps.';
const PF_P = 'Doing these in pregnancy lowers the chance of leaking urine late in pregnancy and after the birth.';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* her plan's answers on the next screens, then the reveal's cards to Start */
async function startFromSummary(a) {
  for (let i = 0; i < 4 && !(await has(a, '#pl-in-make')); i++) await tap(a, '#pl-in-next');
  await tap(a, '#pl-in-make'); await settle(a.page, 600);
  if (!/plan-reveal/.test(await a.page.evaluate(() => location.hash))) await go(a, 'plan-reveal');
  for (let i = 0; i < 8 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go'); await settle(a.page, 800);
}

const bridge = (o) => 'window.__calls = []; window.__notify = ' + (o.notify === true) + '; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, ' +
  'canNotify() { return window.__notify; }, askNotify() { __calls.push(["askNotify"]); setTimeout(() => { window.__notify = ' + (o.grant !== false) + '; window.__sakhiNotify && window.__sakhiNotify(' + (o.grant !== false) + '); }, 30); }, ' +
  'canExactAlarms() { return ' + (o.exact === true) + '; }, askExactAlarms() { __calls.push(["askExactAlarms"]); }, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';

const sched = (a) => a.page.evaluate(() => { const s = (window.__calls || []).filter((c) => c[0] === 'schedule'); const last = s.length ? JSON.parse(s[s.length - 1][1]) : null; return { n: s.length, plan: last ? last.filter((x) => /^r-plan-\d/.test(x.id)).length : null }; });
const remIds = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => r.id).join());
const TTCIK = { at: ago(2), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: ['meds'], trying: null, bmi: null, bset: 'std', bdoc: 'meds' };
const TTC = { pack: 'ttc', goalKey: 'ready', start: ago(1), started: ago(1), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: {}, body: [], intake: TTCIK };
const REM = { id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(1), every: 1, time: '20:00', on: true, doneOn: null };
const trying = (x) => Object.assign({ situation: { planning: true, care: 'private' }, intake: TTCIK, mods: { plan: TTC }, reminders: [REM], settings: { notify: true }, goals: ['ready'] }, x || {});
/* the stage sheet: pick a stage, then a last period date (or the mistake/ended answer), then Save */
const stageTo = async (a, st, o) => { await tap(a, '#stage-btn'); await tap(a, '[data-stage="' + st + '"]');
  if (o && o.lmp != null) await a.page.$eval('#st-lmp', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, o.lmp);
  if (o && o.end) await tap(a, '[data-st-end="' + o.end + '"]'); await tap(a, '#st-save'); await settle(a.page, 1200); };
const startPreg = async (a) => { await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'preg', goal: 'food', pflags: [], pnow: 'n' })); await settle(a.page, 300);
  await go(a, 'plan-reveal'); for (let i = 0; i < 8 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next'); await tap(a, '#pl-rv-go'); await settle(a.page, 1000); };
const BLEED = "Bleeding in pregnancy, or a bad headache with swelling or blurred vision: see a doctor today. Heavy bleeding or fits: call 112 now.";

const cyc3 = (starts) => starts.flatMap((x) => [{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]);
const PMOS = (startAgo, o) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'morning', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], intake: { at: ago(startAgo + 1), stage: 'cycle', goal: 'pmos', gap: 'g45', skips: 'n', dx: 'y', signs: [], act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'morning' } }, o || {});
const cycSeed = (x) => Object.assign({ situation: { care: 'private' }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, events: cyc3([120, 78, 36]) }, x || {});

const tc = (a, sel) => a.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');   /* closed <details> too */
const lg = async (a) => { const s = await st(a); return ((s.mods.plan || {}).log || {})[TODAY] || {}; };
const DOC = '9812345678';
const ttcAt = (startAgo, x) => trying(Object.assign({ mods: { plan: Object.assign({}, TTC, { start: ago(startAgo), started: ago(startAgo) }) } }, x || {}));

/* ---------- 1 Getting ready's 12 weeks ---------- */
{
  const a = await open({ seed: ttcAt(84, { events: cyc3([60, 32, 4]) }), hash: 'plan' });
  const gone = await a.page.$$eval('#view .pl-bpath li.gone', (xs) => xs.length);
  const ticks = await a.page.$$eval('#view .pl-bpath .pl-sdot', (xs) => xs.filter((x) => /✓/.test(x.textContent)).length);
  check('1 week 13: its 3 parts passed, drawn as passed, with no tick', gone === 3 && ticks === 0, { gone, ticks });
  await done(a);
}

/* ---------- 2 a routine done without the player ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(0) }, intake: PMOS(0).intake }), hm: '21:00', hash: 'plan-checkin' });
  const xs = await a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, r: x.r || null, mins: x.mins || null })));
  const yoga = xs.find((x) => x.kind === 'routine'); const mv = xs.find((x) => x.kind === 'minutes');
  const ym = await a.page.evaluate((r) => window.Saathi.plan.routineMins ? window.Saathi.plan.routineMins(r) : null, yoga && yoga.r);
  await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await settle(a.page, 200); await tap(a, '#pl-ci-save');
  const l1 = await lg(a);
  check('2 her yoga marked Done in the check-in counts its minutes, with her walk\'s', yoga && mv && l1.min === mv.mins + l1.tkr[yoga.r] && l1.tkr[yoga.r] >= 5 && l1.rmin === l1.tkr[yoga.r], { l1, yoga, mv, ym });
  await go(a, 'plan');
  check('2 My plan: Active minutes counts both', new RegExp((mv.mins + l1.tkr[yoga.r]) + ' of 50').test(await tc(a, '#view')), (await tc(a, '#view')).match(/\d+ of 50/));
  await go(a, 'home');
  await a.page.evaluate((id) => { const r = [...document.querySelectorAll('[data-today-undo]')].find((b) => b.closest('.today-plan-' + id)); if (r) r.click(); }, yoga.id); await settle(a.page, 400);
  const l2 = await lg(a);
  check('2 a tap on its tick takes back only the yoga\'s minutes', l2.min === mv.mins && !(l2.tkr || {})[yoga.r] && !l2.rmin, l2);
  await done(a);
  const p0 = PMOS(0); p0.log = {}; p0.log[TODAY] = { r: [yoga.r], rmin: 8, min: 8 };
  const b = await open({ seed: cycSeed({ mods: { plan: p0 }, intake: p0.intake }), hm: '21:00', hash: 'plan-checkin' });
  await b.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await settle(b.page, 200); if (await has(b, '#pl-ci-save')) await tap(b, '#pl-ci-save');
  const l3 = await lg(b);
  check('2 played in the player already: her Done adds nothing more', l3.rmin === 8 && !(l3.tkr || {})[yoga.r], l3);
  await done(b);
}

/* ---------- 3, 4, 5 My pregnancy ---------- */
{
  const a = await open({ seed: withPlan(8, {}, { situation: sit(24) }), hm: '21:00', hash: 'plan-checkin' });
  const ids0 = await ids(a);
  const ci = await tc(a, '#view .pl-ci');
  check('3 the check-in: no "Do it now" for Due now (it waits for her visit)', ids0.indexOf('pdue') >= 0 && !/Due now/.test(ci) && /Pelvic floor/.test(ci), { ids0, ci: ci.slice(0, 300) });
  await go(a, 'plan');   /* Today's slot has her 24-week quick check first; My plan holds the look back */
  const rev = (await tc(a, '#view')).match(/(Plan week|Week) \d+ is done/);
  check('4 the look back: "Plan week 1 is done", never a week that reads as her 24 weeks', rev && rev[0] === 'Plan week 1 is done', rev);
  const daily = (await tc(a, '#view')).match(/Your (\d) daily steps/); const why = await txt(a, '#pl-whyall');
  check('5 "Why these 3 steps?" with "Your 3 daily steps"', daily && why === 'Why these ' + daily[1] + ' steps?', { daily: daily && daily[0], why });
  await done(a);
  const c = await open({ seed: cycSeed({ mods: { plan: PMOS(8) }, intake: PMOS(8).intake }) });
  await go(c, 'plan');   /* Version 39.68: the look-back lives on My plan */
  check('4 the PMOS plan keeps "Week 1 is done"', /Week 1 is done/.test(await tc(c, '#view')) && !/Plan week/.test(await tc(c, '#view')));
  await done(c);
}

/* ---------- 6 the calm few minutes ---------- */
{
  const a = await open({ seed: ttcAt(60, { events: cyc3([60, 32, 4]) }), hash: 'plan' });
  const cm = await tc(a, '#view .pl-bcalm');
  check('6 week 9: "A calm few minutes · For the week before your period."', /A calm few minutes\s*For the week before your period\./.test(cm) && !/week 8/.test(cm), cm);
  await done(a);
}

/* ---------- 7 late while getting ready ---------- */
{
  const a = await open({ seed: ttcAt(30, { events: cyc3([101, 73, 45]) }) });   /* 28-day cycles: due 17 days ago */
  check('7 17 days late: the lesson steps aside on Today', !(await has(a, '#view .pl-les')));
  await go(a, 'plan');
  check('7 ... and My plan leads with "Period late?" to the test page', /Period late\?\s*A week or more late and you could be pregnant\? A home test is the first step\./.test(await tc(a, '#view .pl-late')) && (await a.page.$eval('#view .pl-late', (e) => e.dataset.go).catch(() => '')) === 'pregtest');
  await done(a);
  const b = await open({ seed: ttcAt(30, { events: cyc3([101, 73, 45]), mods: { plan: Object.assign({}, TTC, { start: ago(30), started: ago(30) }), pregtest: { tests: [{ d: ago(3), r: 'neg' }] } } }), hash: 'plan' });
  check('7 a test saved since: no row', !(await has(b, '#view .pl-late')));
  await done(b);
  const c = await open({ seed: ttcAt(30, { events: cyc3([86, 58, 30]) }), hash: 'plan' });   /* due 2 days ago */
  check('7 2 days late: no row yet', !(await has(c, '#view .pl-late')));
  await done(c);
}

/* ---------- 8 her doctor in every plan ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(10) }, intake: PMOS(10).intake }), hash: 'plan' });
  check('8 the PMOS plan: "My doctor · Add your doctor’s number" first in her care team', /^My doctor\s*Add your doctor’s number/.test(await tc(a, '#view .pl-care .list')), await tc(a, '#view .pl-care .list'));
  await done(a);
  const b = await open({ seed: ttcAt(10, { events: cyc3([60, 32, 4]), mydoc: { tel: DOC } }), hash: 'plan' });
  check('8 Getting ready, saved: "Call my doctor"', (await b.page.$eval('#view .pl-mydoc', (e) => e.getAttribute('href')).catch(() => '')) === 'tel:' + DOC);
  await go(b, 'ask');
  check('8 the doctor screen, not pregnant, saved: Call my doctor', (await b.page.$eval('#ask-mydoc', (e) => e.getAttribute('href')).catch(() => '')) === 'tel:' + DOC);
  await done(b);
  const c = await open({ seed: cycSeed({ mods: { plan: PMOS(10) }, intake: PMOS(10).intake }), hash: 'ask' });
  check('8 not pregnant, no number: the doctor screen as before', !(await has(c, '#ask-mydoc')) && !(await has(c, '#ask-mydoc-add')));
  await done(c);
  const g = await open({ seed: cycSeed({ situation: { care: 'govt' }, mods: { plan: PMOS(10) }, intake: PMOS(10).intake }), hash: 'plan' });
  check('8 the government route: no doctor\'s row', !(await has(g, '#view .pl-mydoc')));
  await done(g);
}

/* ---------- 9 the Diary in a pregnancy ---------- */
const pEv = [{ d: ago(330), t: 'start' }, { d: ago(326), t: 'end' }, { d: ago(300), t: 'start' }, { d: ago(296), t: 'end' }, { d: ago(80), t: 'start' }, { d: ago(77), t: 'end' }, { d: ago(2), t: 'start' }];
const preg39 = () => sit(39, { pregnantSince: ago(273) });
{
  const a = await open({ seed: { situation: preg39(), events: pEv, daily: { [ago(20)]: ['d_ok'] } }, hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  const pills = await a.page.$$eval('.mc-card .mc-row', (rs) => rs.map((r) => [r.querySelector('strong').textContent, !!r.querySelector('.mc-pills')]));
  check('9 My cycles: no cycle strip under a bleed in the pregnancy, her periods before it keep theirs', pills.length >= 3 && pills[0][1] === false && pills[1][1] === false && pills.some((x) => x[1]), pills);
  await tap(a, '[data-tab="days"]');
  const heads = await a.page.$$eval('.dy-gh', (xs) => xs.map((x) => x.innerText.trim()));
  const pg = await a.page.$$eval('.dy-grp', (gs) => { const g = gs.find((x) => x.querySelector('.dy-gh').innerText.trim() === 'In your pregnancy'); return g ? g.textContent : ''; });
  check('9 Days: one "In your pregnancy" group holds its bleeds and the days between', heads.filter((h) => h === 'In your pregnancy').length === 1 && (pg.match(/Bleeding/g) || []).length >= 2 && /Feeling okay/.test(pg) && !heads.some((h) => /^Bleeding · /.test(h)), { heads, pg: pg.slice(0, 200) });
  await done(a);
  const d = await open({ seed: { situation: preg39(), events: pEv, settings: { discreet: true } }, hash: 'diary' });
  await tap(d, '[data-tab="days"]');
  check('9 a shared phone: the group is "From {date}", no pregnancy word', !(await d.page.$$eval('.dy-gh', (xs) => xs.some((x) => /pregnan/i.test(x.innerText)))) && (await d.page.$$eval('.dy-gh', (xs) => xs.some((x) => /^From /.test(x.innerText.trim())))));
  await done(d);
}

/* ---------- 10 layout ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(0) }, intake: PMOS(0).intake }) });
  const yr = await a.page.evaluate(() => { const r = [...document.querySelectorAll('#view .today-chk')].find((x) => x.querySelector('.today-start')); if (!r) return null; const tt = r.querySelector('.today-sub-t'); return { btn: r.querySelector('.today-start').textContent.trim(), sub: tt ? tt.textContent : '', cut: tt ? tt.scrollWidth > tt.clientWidth + 1 : true, wrap: !!r.querySelector('.today-sub.wrap') }; });
  check('10 her yoga: its minutes on Start (as the wind-down step), and "Before a meal" whole on one line at 390 px', yr && /^\d+ min$/.test(yr.btn) && yr.sub === 'Before a meal' && !yr.cut && !yr.wrap, yr);
  await done(a);
  const b = await open({ seed: { situation: sit(38) } });
  const grid = await b.page.evaluate(() => { const g = document.querySelector('#view .hero .hero-btns2'); if (!g) return null; const bs = [...g.querySelectorAll('.btn')].map((x) => Math.round(x.getBoundingClientRect().top)); return { n: bs.length, rows: new Set(bs).size, tops: bs }; });
  check('10 38 weeks: the card\'s 4 buttons in 2 rows', grid && grid.n === 4 && grid.rows === 2 && (await noScroll(b)), grid);
  await done(b);
  const c = await open({ seed: { situation: sit(36) } });
  check('10 36 weeks: as before', !(await has(c, '#view .hero-btns2')));
  await done(c);
}

/* ---------- 11 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: { lang: 'hi', situation: preg39(), events: pEv }, hash: 'diary' });
  await tap(a, '[data-tab="days"]');
  check('11 Hindi at 360 px: Days\' pregnancy group', (await a.page.$$eval('.dy-gh', (xs) => xs.some((x) => x.innerText.trim() === 'आपकी गर्भावस्था में'))) && (await noScroll(a)));
  await go(a, 'home');
  check('11 Hindi at 360 px: the card\'s buttons, no side scroll', (await has(a, '#view .hero-btns2')) && (await noScroll(a)));
  await shot(a, 'hi-home');
  await done(a);
  const b = await open({ w: 360, seed: Object.assign(withPlan(8, {}, { situation: sit(24) }), { lang: 'hi' }), hash: 'plan' });
  check('11 Hindi at 360 px: "प्लान का हफ़्ता 1 पूरा हुआ"', /प्लान का हफ़्ता 1 पूरा हुआ/.test(await tc(b, '#view')) && (await noScroll(b)));
  await done(b);
}

check('12 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (planwalk)');
process.exit(failed.length ? 1 : 0);
