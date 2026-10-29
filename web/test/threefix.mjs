// Version 39.37: the three-plan walkthrough's fixes (Mohit, 29 Oct: "can you do a walkthrough and verify if all three plans
// diary and home works properly", then "fix all 8"; test/threeplans-walk.mjs; MODULE_API section 80). This file checks:
//   1 Cycles' "Next period date" says how late she is, never a range that has passed;
//   2 "Due now" in My pregnancy doesn't hold her day: her daily steps done, her day is full (Today, My plan, the rings);
//   3 one "Tomorrow" line in the check-in's feedback;
//   4 trying for a baby, a long wait for her period starts with the home test (the reviewed "Period late?" words);
//   5 in a pregnancy, Cycles doesn't lead with example cycle numbers and "Add a past period";
//   6 one home for what her records say: Today and Cycles; My plan's row and the Diary's note only when it can't wait;
//   7 on the day her 12 weeks end, the end card without the week's look back;
//   8 one celebration at a time: no petal panel over the check-in's own petal line, a badge with a petal as a short note,
//     and a toast that stays with its screen; 9 no page errors.
// Usage: node test/threefix.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'threefix'); fs.mkdirSync(SHOTS, { recursive: true });
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
const fillLog = (startAgo, upto) => { const l = {}; for (let i = 0; i < upto; i++) if ([0, 2, 3, 5].indexOf(i % 7) >= 0) l[iso(ago(startAgo), i)] = { ci: 1, min: 20 }; return l; };

/* ---------- 1 the next period date when she is late ---------- */
{
  const a = await open({ seed: cycSeed({ events: cyc3([170, 128, 86]) }), hash: 'diary' });   /* 42-day gaps, the last start 86 days ago: late */
  if (await has(a, '[data-tab="tr"]')) await tap(a, '[data-tab="tr"]');
  const r = await txt(a, '.kn-next');
  check('1 Cycles: "Next period date" says how late she is, as Today does', /^Next period date Your period is \d+ days late$/.test(r), r);
  await go(a, 'home');
  const n1 = (r.match(/(\d+) days late/) || [])[1];
  const tv = await view(a);
  check('1 ... the same number as Today', !!n1 && (tv.indexOf('Your period is ' + n1 + ' days late') >= 0 || tv.indexOf(n1 + ' days past your likely range') >= 0), n1);
  await done(a);
  const b = await open({ seed: cycSeed({ events: cyc3([86, 44, 2]) }), hash: 'diary' });
  if (await has(b, '[data-tab="tr"]')) await tap(b, '[data-tab="tr"]');
  check('1 not late: her likely range, as before', /Likely/.test(await txt(b, '.kn-next')) || !(await has(b, '.kn-next')), await txt(b, '.kn-next'));
  await done(b);
}

/* ---------- 2 "Due now" doesn't hold her day ---------- */
{
  const a = await open({ seed: withPlan(10, { intake: IK({ psafeW: 12 }) }, { situation: sit(12) }) });   /* 12 weeks: her pelvic floor starts at 13 */
  const x0 = await acts(a);
  check('2 her steps: her daily steps, then "Due now" last', x0.length >= 3 && x0[x0.length - 1].id === 'pdue', x0.map((x) => x.id));
  const n = await a.page.$$eval('[data-today-act]', (xs) => xs.length);
  for (let i = 0; i < n; i++) { await a.page.$$eval('[data-today-act]', (xs) => { const b = xs.find((x) => !x.closest('.done, .on, [aria-pressed="true"]')); if (b) b.click(); }); await settle(a.page, 400); }
  const dc = await a.page.evaluate(() => window.Saathi.plan.dayCount(null));
  check('2 her daily steps done: her day is full, "Due now" still waiting for her visit', dc && dc.a === dc.n && dc.n === x0.length - 1, dc);
  check('2 Today closes her day (Day complete)', await has(a, '.pl-dc'));
  await go(a, 'plan');
  check('2 My plan: "Your ' + (x0.length - 1) + ' daily steps", all done', new RegExp('Your ' + (x0.length - 1) + ' daily steps All ' + (x0.length - 1) + ' done today').test(await view(a)), (await view(a)).slice(0, 400));
  await done(a);
}

/* ---------- 3 one "Tomorrow" line ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(0) }, intake: PMOS(0).intake }), hm: '21:00', hash: 'plan-checkin' });
  await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await settle(a.page, 300); await tap(a, '#pl-ci-save');
  const fb = await txt(a, '#pl-ci-fb');
  const tom = (fb.match(/Tomorrow:/g) || []).length;
  check('3 the feedback says "Tomorrow" once, and when it will see her', tom <= 1 && /See you (tomorrow )?at 8 pm|See you tomorrow at 8 pm/.test(fb), fb);
  await done(a);
}

/* ---------- 4 trying for a baby, a long wait starts with the home test ---------- */
{
  const T = '"A week or more late and you could be pregnant? A home test is the first step."';
  const a = await open({ seed: { situation: { planning: true, care: 'private' }, goals: ['ready'], intake: { goal: 'ready', stage: 'ttc' }, events: cyc3([150, 122, 94]) }, hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  const v = await view(a);
  const i = v.indexOf('A week or more late and you could be pregnant? A home test is the first step.');
  check('4 trying for a baby: the late finding starts with the home test, then the doctor', i >= 0 && v.indexOf('See a doctor this month', i) > i, v.slice(0, 600));
  await done(a);
  const b = await open({ seed: cycSeed({ events: cyc3([150, 122, 94]) }), hash: 'diary' });
  await tap(b, '[data-tab="tr"]');
  check('4 not trying: the finding as it was', !/A home test is the first step/.test((await view(b)).split('What Sakhi can tell you')[0]), T);
  await done(b);
}

/* ---------- 5 Cycles in a pregnancy ---------- */
{
  const a = await open({ seed: { situation: sit(20), events: [] }, hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  const v = await view(a);
  check('5 in a pregnancy, no example cycle numbers and no "Add a past period"', !(await has(a, '#view .ex-card')) && !/Add a past period/.test(v), v.slice(0, 400));
  await done(a);
  const b = await open({ seed: { situation: { care: 'private' }, events: [] }, hash: 'diary' });
  await tap(b, '[data-tab="tr"]');
  check('5 outside a pregnancy, the example card as before', await has(b, '#view .ex-card'));
  await done(b);
}

/* ---------- 6 one home for what her records say ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(5) }, intake: PMOS(5).intake, events: cyc3([86, 44, 2]) }), hash: 'plan' });
  check('6 a signal that can wait: no row on My plan', !(await has(a, '#view .pl-xp')));
  await go(a, 'diary');
  check('6 ... no note on the Diary\'s Calendar', !(await has(a, '#view .xp-banner')));
  await tap(a, '[data-tab="tr"]');
  check('6 ... its card in Cycles, its home', /Your last gap was 42 days|One of your recent gaps was 42 days/.test(await view(a)));
  await go(a, 'home');
  check('6 ... and on Today', /Your last gap was 42 days|One of your recent gaps was 42 days/.test(await view(a)));
  await done(a);
}

/* ---------- 7 the day her 12 weeks end ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(84, { log: fillLog(84, 84) }) }, intake: PMOS(84).intake, events: cyc3([86, 44, 2]) }), wait: 1500 });
  const v = await view(a);
  check('7 day 85: the end card, and not the week\'s look back as well', /Your 12 weeks are done/.test(v) && !/Week 12 is done/.test(v), v.slice(0, 900));
  await done(a);
}

/* ---------- 8 one celebration at a time ---------- */
{
  const a = await open({ seed: cycSeed({ mods: { plan: PMOS(0) }, intake: PMOS(0).intake }), hm: '21:00', hash: 'plan-checkin' });
  await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await settle(a.page, 300); await tap(a, '#pl-ci-save');
  check('8 the check-in says "A petal for your garden" itself: no petal panel over it', /A petal for your garden/.test(await txt(a, '#pl-ci-fb')) && !(await has(a, '.joy-pop')));
  await settle(a.page, 3600);
  const t8 = await txt(a, '#toast-root');
  check('8 the first petal\'s badge: a short note, not a panel over the page', !(await has(a, '.joy-burst')) && /New badge/.test(t8), t8);
  await a.page.evaluate(() => window.Saathi.toast('Well done.')); await settle(a.page, 900); await go(a, 'plan');
  check('8 a toast stays with the screen it was for', (await txt(a, '#toast-root')) === '');
  await a.page.evaluate(() => { window.Saathi.toast('Saved.'); location.hash = 'home'; }); await settle(a.page, 300);
  check('8 ... but a toast for the move she just made still shows', /Saved\./.test(await txt(a, '#toast-root')));
  await done(a);
}

check('9 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (threefix)');
process.exit(failed.length ? 1 : 0);
