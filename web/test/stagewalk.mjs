// Version 39.42: the tracking-stage walk's gaps (Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps", on vc 72
// at Tracking periods with no plan running, then "fix all 3"; MODULE_API section 85). This file checks:
//   1 one ask on Today just after she set her stage: while Sakhi says offers her a plan, no "Tell Sakhi your stage and goals"
//     beside it (it comes back when no plan is offered; an older diary is still asked once, Version 39.10);
//   2 the finding's free plan reads PMOS as Today and My plan do (her details or her goals): "My PMOS plan", not "My cycle plan";
//   3 My plan with no plan running: "I have PMOS · Suggested" is the PMOS plan's one home (not again under Suggested for you or
//     More plans), and no "Nothing to suggest yet" when the picker holds the suggestion;
//   4 Hindi at 360 px; 5 no page errors.
// Usage: node test/stagewalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'stagewalk'); fs.mkdirSync(SHOTS, { recursive: true });
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

const tc = (a, sel) => a.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
const ASK = 'Tell Sakhi your stage and goals';
/* her gaps 34 and 23 days (they vary by 11), then a period that started 3 days ago */
const vary = () => [[86, 82], [52, 49], [29, 26], [3, null]].flatMap((p) => [{ d: ago(p[0]), t: 'start' }].concat(p[1] ? [{ d: ago(p[1]), t: 'end' }] : []));
const track = (x) => Object.assign({ situation: { care: 'private' }, goals: ['pmos'], events: cyc3([60, 32, 4]) }, x || {});   /* regular gaps: nothing in her diary leads Sakhi says */

/* ---------- 1 one ask on Today ---------- */
{
  const JUST = { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30), exStage: TODAY };   /* she just set her stage in the stage sheet */
  const a = await open({ seed: track({ prompts: JUST }) });
  const first = await a.page.$eval('#view .slot', (s) => { const c = s.querySelector('.slot-h').nextElementSibling; return c ? c.className : ''; }).catch(() => '');   /* the card Sakhi says shows first */
  check('1 just after she set her stage, Sakhi says offers her a plan: no "Tell Sakhi your stage and goals" beside it', /pl-homerec|pl-offer/.test(first) && (await view(a)).indexOf(ASK) < 0, { first, v: (await view(a)).slice(0, 400) });
  await done(a);
  const b = await open({ seed: track({ prompts: Object.assign({}, JUST, { planRec: TODAY }) }) });
  check('1 no plan offered today: the ask comes back', (await view(b)).indexOf(ASK) >= 0);
  await done(b);
  const c = await open({ seed: track({ events: cyc3([120, 78, 36]), prompts: JUST }) });   /* long gaps: her diary's finding leads Sakhi says, the offer waits under More */
  check('1 Sakhi says leads with her diary\'s finding: the ask stays (the offer is not on show)', (await view(c)).indexOf(ASK) >= 0);
  await done(c);
  const sw = await open({ seed: track({ situation: sit(20), prompts: Object.assign({}, JUST, { exStage: undefined }) }) });   /* pregnant, then "Tracking my periods" in the stage sheet */
  await tap(sw, '#stage-btn'); await tap(sw, '[data-stage="cycle"]'); if (await has(sw, '[data-st-end="mistake"]')) await tap(sw, '[data-st-end="mistake"]'); await tap(sw, '#st-save'); await settle(sw.page, 1000);
  check('1 the stage sheet marks the change, so Today asks once', ((await st(sw)).prompts || {}).exStage === TODAY && !((await st(sw)).situation || {}).pregnant, (await st(sw)).prompts);
  await done(sw);
  const o = await open({ seed: track() });   /* an older diary, asked once (Version 39.10), even with a plan offered */
  check('1 an older diary: still asked its stage and goals once, beside the plan offer', (await view(o)).indexOf(ASK) >= 0 && (await has(o, '#view .pl-homerec')));
  await done(o);
}

/* ---------- 2 the finding's free plan ---------- */
for (const [name, goals, want, not] of [['her goal is PMOS', ['pmos'], /PMOS/, /cycle plan/i], ['no PMOS', ['irregular'], /cycle plan/i, /PMOS/]]) {
  const a = await open({ seed: track({ goals: goals, events: vary() }), hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  const pp = await tc(a, '#view .xp-plan');
  check('2 ' + name + ': the finding pairs ' + (goals[0] === 'pmos' ? '"My PMOS plan"' : '"My cycle plan"'), want.test(pp) && !not.test(pp), pp);
  await done(a);
}

/* ---------- 3 My plan with no plan running ---------- */
{
  const a = await open({ seed: track(), hash: 'plan' });
  const pm = await a.page.$$eval('#view [data-go="plan-pmos"]', (xs) => xs.length);
  check('3 "I have PMOS (PCOS) · Suggested" is the PMOS plan\'s one row: not again in Suggested for you or More plans', (await has(a, '#view [data-pl-pick="pmos"] .pl-sugg')) && pm === 0, { pm });
  check('3 ... and no "Nothing to suggest yet"', !/Nothing to suggest yet/.test(await view(a)));
  await done(a);
  const b = await open({ seed: track({ daily: { [ago(36)]: ['cramps'], [ago(78)]: ['cramps'], [ago(120)]: ['cramps'] }, events: cyc3([120, 78, 36]).map((e) => (e.t === 'start' ? Object.assign({ pain: 'pain_3' }, e) : e)) }), hash: 'plan' });
  const recs = await b.page.$$eval('#view .pl-rec', (xs) => xs.map((x) => x.dataset.go));
  check('3 her other suggestions stay (a short tool is not a 12-week plan)', recs.length >= 1 && recs.indexOf('plan-pmos') < 0, recs);
  await done(b);
}

/* ---------- 4 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: track({ lang: 'hi' }) });
  check('4 Hindi at 360 px: Today with the plan offer, no side scroll', (await has(a, '#view .pl-homerec')) && (await noScroll(a)));
  await go(a, 'plan');
  check('4 Hindi at 360 px: My plan\'s picker, no side scroll', (await has(a, '#view [data-pl-pick="pmos"]')) && (await noScroll(a)));
  await shot(a, 'hi-plan');
  await done(a);
}

check('5 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (stagewalk)');
process.exit(failed.length ? 1 : 0);
