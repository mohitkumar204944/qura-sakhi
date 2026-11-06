// Version 39.43: the PMOS day-1 walk's gaps (Mohit's Flip5 at 360 dp, 30 Oct: "can you do a walkthrough on my phone and check
// gaps", then "fix all 4"; MODULE_API section 86). This file checks:
//   1 a step's line on Today that doesn't fit wraps (Version 39.44: in CSS, whenever the font lands), and one that fits stays one short line;
//   2 the PMOS plan starts day 1 with 3 steps; her bedtime and its wind-down reminder from day 4;
//   3 Sakhi stays upright on the phone (the manifest's portrait);
//   4 My plan's routine row as Today's: its name, and its minutes on the play button;
//   5 Hindi at 360 px; 6 no page errors.
// Usage: node test/phonefit.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'phonefit'); fs.mkdirSync(SHOTS, { recursive: true });
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

const pm = (startAgo) => cycSeed({ mods: { plan: PMOS(startAgo) }, intake: PMOS(startAgo).intake });
const subs = (a) => a.page.$$eval('#view .today-chk', (rs) => rs.map((r) => { const s = r.querySelector('.today-sub'); const tt = r.querySelector('.today-sub-t'); const lh = s ? parseFloat(getComputedStyle(s).lineHeight) || 18 : 18; return { id: r.className.replace(/.*today-(plan-[a-z]+).*/, '$1'), wrap: !!s && s.getBoundingClientRect().height > lh * 1.5, cut: !!(tt && tt.scrollWidth > tt.clientWidth + 1) }; }));   /* wrap: the line took a second line (Version 39.44: in CSS) */

/* ---------- 1 a line that doesn't fit wraps ---------- */
{
  const a = await open({ w: 300, h: 800, seed: pm(5) });   /* narrower than any phone she has: her lines can't fit on one */
  const s3 = await subs(a);
  check('1 300 px: every line that didn\'t fit wraps, and none is cut', s3.some((x) => x.wrap) && !s3.some((x) => x.cut), s3);
  await done(a);
  const b = await open({ w: 390, h: 844, seed: pm(5) });
  const s9 = await subs(b);
  check('1 390 px: no line cut; the ones that fit (her yoga and food) stay one short line (Version 39.72: her walk\'s brisk line wraps)', !s9.some((x) => x.cut) && ['plan-yoga', 'plan-plate'].every((k) => s9.some((x) => x.id === k && !x.wrap)), s9);
  await done(b);
}

/* ---------- 2 day 1 with 3 steps ---------- */
{
  const a = await open({ seed: pm(0) });
  const d1 = await ids(a);
  const w1 = await a.page.evaluate(() => !!window.Saathi.reminders.get('plan-wind'));
  check('2 day 1: yoga, her walk and her food habit (3 steps), no bedtime yet', d1.length === 3 && d1.indexOf('sleep') < 0 && /0 of 3 done today/.test(await view(a)), d1);
  check('2 ... and no wind-down reminder yet', !w1);
  await done(a);
  const b = await open({ seed: pm(3) });
  const d4 = await ids(b);
  check('2 day 4: her bedtime joins (4 steps), with its wind-down reminder', d4.indexOf('sleep') >= 0 && d4.length === 4 && (await b.page.evaluate(() => !!window.Saathi.reminders.get('plan-wind'))), d4);
  await done(b);
}

/* ---------- 3 upright ---------- */
{
  const man = fs.readFileSync(path.join(root, '..', 'android', 'AndroidManifest.xml'), 'utf8');
  const act = (man.match(/<activity[\s\S]*?android:name="\.MainActivity"[\s\S]*?\/>/) || [''])[0];
  check('3 the app\'s activity stays upright (portrait)', /android:screenOrientation="portrait"/.test(act), act.slice(0, 300));
}

/* ---------- 4 My plan's routine row ---------- */
{
  const a = await open({ seed: pm(5), hash: 'plan' });
  const r = await a.page.evaluate(() => { const b = document.querySelector('#view [data-pl-start]'); const row = b && b.closest('.pl-step'); return b ? { btn: b.textContent.trim(), name: row ? row.querySelector('strong').textContent.trim() : '' } : null; });
  await go(a, 'home');
  const tb = await txt(a, '#view .today-plan-yoga [data-today-nav]');
  check('4 My plan: the routine\'s name, and its minutes on the play button, as Today\'s', r && /^\d+ min$/.test(r.btn) && r.btn === tb && !/·/.test(r.name) && r.name.length > 3, { r, tb });
  await done(a);
}

/* ---------- 5 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: Object.assign(pm(5), { lang: 'hi' }) });
  const s = await subs(a);
  check('5 Hindi at 360 px: no line cut on Today, no side scroll', !s.some((x) => x.cut) && (await noScroll(a)), s);
  await go(a, 'plan');
  check('5 Hindi at 360 px: My plan\'s play button "N मिनट"', /^\d+ मिनट$/.test(await txt(a, '#view [data-pl-start]')) && (await noScroll(a)), await txt(a, '#view [data-pl-start]'));
  await shot(a, 'hi-plan');
  await done(a);
}

check('6 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (phonefit)');
process.exit(failed.length ? 1 : 0);
