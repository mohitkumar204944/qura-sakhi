// All three plans, Home and the Diary, lived through (Mohit, 29 Oct: "can you do a walkthrough and verify if all three plans
// diary and home works properly"). One woman per plan joins with a diary, starts her plan through its own screens (her goal,
// the plan's questions, the reveal, Start), then lives day 1, day 8, day 29 and day 85 (she follows it on about 4 days a
// week in between). At each stop: Home, a tick on Today, the evening check-in saved, My plan, and the Diary's Calendar,
// Cycles and Days, on a 390 px phone. Every screen is checked for page errors, string keys left on screen, sideways scroll
// and an empty view, plus the plan's own rules (3 steps or fewer on day 1, 4 at most, the check-in saved). Not pass/fail
// for looks: the screens go to test/shots/threeplans-walk/ (gitignored), to look at.
// Usage: node test/threeplans-walk.mjs
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'threeplans-walk'); fs.mkdirSync(SHOTS, { recursive: true });
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


const flags = []; const notes = [];
const KEYS2 = /\b(plan|preg|pregtools|ttc|food|post|ci|hs|fx|rv|pg|pf|mcp)_[a-z0-9_]{2,}\b/;
const at2 = (day, hm) => new Date(day + 'T' + hm + ':00+05:30');
async function openState(stateObj, now) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(stateObj)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.clock.install({ time: now });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
const stateOf = (a) => a.page.evaluate(() => JSON.parse(localStorage.getItem('qura-saathi-v1')));
const closeTips = (a) => a.page.evaluate(() => { document.querySelectorAll('.tour-pop .tour-btns button, .tour-dim').forEach((b) => { if (/Not now|Later|Close|Skip/i.test(b.textContent || '')) b.click(); }); });
async function look(a, who, tag, where) {
  await settle(a.page, 400); const v = await view(a); const f = [];
  if (!v || v.length < 40) f.push('empty view'); const k = v.match(KEYS2); if (k) f.push('string key "' + k[0] + '"');
  if (!(await noScroll(a))) f.push('scrolls sideways');
  if (a.errs.length) { f.push('errors: ' + a.errs.join(' / ')); a.errs.length = 0; }
  if (f.length) flags.push(who + ' ' + tag + ' ' + where + ': ' + f.join('; '));
  const file = path.join(SHOTS, who + '-' + tag + '-' + where + '.png'); await a.page.screenshot({ path: file, fullPage: true }); return { file, v };
}
/* her plan's own screens: answer what's unanswered with the first choice, then Continue, to the summary and Make my plan */
async function intake(a) {
  for (let i = 0; i < 12; i++) {
    if (await has(a, '#pl-in-make')) { await tap(a, '#pl-in-make'); break; }
    if (await has(a, '[data-pl-when]')) { await tap(a, '[data-pl-when]'); continue; }
    await a.page.evaluate(() => { document.querySelectorAll('#view .chips[role="group"]').forEach((g) => { const c = g.querySelectorAll('[data-pl-q], [data-pl-m]'); if (c.length && !g.querySelector('.on')) c[0].click(); }); });
    if (await has(a, '#pl-in-skip')) { await tap(a, '#pl-in-skip'); continue; }
    await tap(a, '#pl-in-next');
  }
  await settle(a.page, 600);
  if (!/plan-reveal/.test(await a.page.evaluate(() => location.hash))) await go(a, 'plan-reveal');
  for (let i = 0; i < 10 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go'); await settle(a.page, 900);
}
/* the days between stops: she follows her plan on about 4 days a week (a check-in and 20 minutes) */
function fill(s, from, to) { const p = s.mods.plan; p.log = p.log || {}; for (let d = from; d < to; d++) { const k = iso(p.start, d); if ([0, 2, 3, 5].indexOf(d % 7) >= 0 && !p.log[k]) p.log[k] = { ci: 1, min: 20 }; } return s; }
async function stop(who, tag, s, day, startFlow) {
  const a = await openState(s, at2(day, '10:00')); await closeTips(a); const shots = [];
  if (startFlow) { await a.page.evaluate((g) => window.Saathi.plan.offer(g), startFlow); await settle(a.page, 600); await intake(a); await go(a, 'home'); await closeTips(a); }
  const acts0 = await acts(a);
  const d = (await stateOf(a)).mods.plan || {};
  const pday = await a.page.evaluate(() => (window.Saathi.plan.dayCount ? window.Saathi.plan.dayCount(null) : null)).catch(() => null);
  notes.push(who + ' ' + tag + ': plan ' + (d.pack || 'none') + ' v' + (d.pv || 1) + ', started ' + d.start + ', steps today: ' + acts0.map((x) => x.id).join(', '));
  if (tag === 'd1' && acts0.length > 3) flags.push(who + ' d1: ' + acts0.length + ' steps on day 1 (3 or fewer)');
  if (acts0.length > 4) flags.push(who + ' ' + tag + ': ' + acts0.length + ' steps (4 at most)');
  shots.push((await look(a, who, tag, '1-home')).file);
  const n0 = await a.page.$$eval('[data-today-act]', (xs) => xs.length);
  if (n0) { await a.page.$eval('[data-today-act]', (b) => b.click()); await settle(a.page, 500); }
  await a.page.clock.setSystemTime(at2(day, '21:00')); await go(a, 'plan-checkin'); await settle(a.page, 400);
  shots.push((await look(a, who, tag, '2-checkin')).file);
  await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await a.page.$$eval('[data-ci-mv="usual"]', (xs) => xs.forEach((x) => x.click()));
  if (await has(a, '#pl-ci-save')) await tap(a, '#pl-ci-save');
  shots.push((await look(a, who, tag, '3-feedback')).file);
  const s2 = await stateOf(a); const lg = ((s2.mods.plan || {}).log || {})[day] || {};
  if (!lg.ci) flags.push(who + ' ' + tag + ': the check-in did not save');
  await go(a, 'plan'); shots.push((await look(a, who, tag, '4-myplan')).file);
  for (const tb of ['cal', 'tr', 'days']) { await go(a, 'diary'); if (await has(a, '[data-tab="' + tb + '"]')) await tap(a, '[data-tab="' + tb + '"]'); shots.push((await look(a, who, tag, '5-diary-' + tb)).file); }
  await go(a, 'home'); await a.page.clock.setSystemTime(at2(day, '21:30')); await go(a, 'home'); shots.push((await look(a, who, tag, '6-home-night')).file);
  errsAll.push(...a.errs); await a.ctx.close();
  return { s2, shots };
}
const WOMEN = [
  { who: 'priya-pmos', goal: 'pmos', seed: { situation: { care: 'private' }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, events: [[120, 116], [78, 74], [36, 32]].flatMap((p) => [{ d: ago(p[0]), t: 'start' }, { d: ago(p[1]), t: 'end' }]) } },
  { who: 'neha-ready', goal: 'ready', seed: { situation: { planning: true, care: 'private' }, goals: ['ready'], intake: { goal: 'ready', stage: 'ttc' }, events: [[66, 62], [38, 34], [10, 6]].flatMap((p) => [{ d: ago(p[0]), t: 'start' }, { d: ago(p[1]), t: 'end' }]) } },
  { who: 'riya-preg', goal: 'food', seed: { situation: sit(20), goals: ['food'], intake: { goal: 'food', stage: 'preg' }, events: [], mods: { food: { type: 'veg', milk: true } } } }
];
const sheets = [];
for (const w of WOMEN) {
  let s = seedOf(w.seed); let r = await stop(w.who, 'd1', s, TODAY, w.goal); s = r.s2; sheets.push([w.who + '-d1', r.shots]);
  for (const n of [8, 29, 85]) { const day = iso(s.mods.plan.start, n - 1); s = fill(s, 1, n - 1); r = await stop(w.who, 'd' + n, s, day, null); s = r.s2; sheets.push([w.who + '-d' + n, r.shots]); }
}
await browser.close();
fs.writeFileSync(path.join(SHOTS, 'walk.json'), JSON.stringify({ flags, notes, errors: errsAll }, null, 1));
console.log('NOTES\n' + notes.join('\n')); console.log('FLAGS (' + flags.length + ')\n' + flags.join('\n')); console.log('ERRORS ' + errsAll.length);
fs.writeFileSync(path.join(SHOTS, 'sheets.json'), JSON.stringify(sheets));
