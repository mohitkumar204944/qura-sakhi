// Version 39.35: the pregnancy walkthrough's fixes (Mohit's Flip5, 29 Oct: "can you do a walkthrough on my phone and advise on
// gaps or bugs", then "proceed" on gaps 1 to 7; MODULE_API section 78). This file checks:
//   1 "Baby moving less? Get help" opens the kick page with Call 112, 108 and 102 under its 2 lines, before the counter;
//   2 bleeding logged inside a pregnancy is never stretched into guessed days, and Today's pregnancy card shows the reviewed
//     "Bleeding in pregnancy" line with Call 112 for 3 days (not later, not on a shared phone, not outside a pregnancy);
//   3 the phone is told: after "marked by mistake" Android's last list has no check-in alarms;
//   4 the parts of her pregnancy that have passed carry no tick ("done") on My plan;
//   5 the stage sheet asks her last period first, filled from her diary, the scan's due date second, and says her week and
//     due date as she enters them (the scan's date wins);
//   6 after a stage change, one ask: no "Tell Sakhi your stage and goals" beside "Your plan has changed", and "See my
//     pregnancy plan" asks her goal;
//   7 "No, I marked it by mistake" brings back the plan she was on (its start, its answers, its check-in), and the mistaken
//     pregnancy plan isn't kept as her last plan; "Yes, it ended" doesn't;
//   8 Hindi at 360 px; 9 no page errors.
// Version 39.36 (Mohit: "fix gaps 8 to 15 too"), checks g8 to g15: My plan's moves line only for version 1; the reveal names
//   the pelvic floor, the checks of her answers and her baby's movements; "My safety answers" by its name, with a ›; the foot
//   line's iron tablets only beside the tablet step; tile labels that hyphenate; a toast clear of a tour card; urgent cards in
//   ink; no "Your day" when My food already holds it.
// Usage: node test/pregwalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'pregwalk'); fs.mkdirSync(SHOTS, { recursive: true });
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

/* ---------- 1 the kick page ---------- */
{
  const a = await open({ seed: { situation: sit(30) }, wait: 1600 });
  for (let i = 0; i < 4 && !(await has(a, '.pg-less')); i++) await settle(a.page, 500);
  await tap(a, '.pg-less');
  const v = await view(a);
  check('1 "Baby moving less? Get help": the kick page\'s 2 lines, then Call 112, 108 and 102, before the counter', (await tels(a, '.ptl-calls')) === '112,108,102' && v.indexOf(K_NOW) >= 0 && v.indexOf(K_TODAY) > v.indexOf(K_NOW) && v.indexOf('Call 112 Call 108 Call 102') > v.indexOf(K_TODAY) && v.indexOf('Call 112 Call 108 Call 102') < v.indexOf('Start counting'), v.slice(0, 700));
  await shot(a, 'kick');
  await done(a);
}

/* ---------- 2 bleeding inside a pregnancy ---------- */
{
  const a = await open({ seed: { situation: sit(30), events: [{ d: ago(2), t: 'start' }] }, wait: 1200 });
  const bd = await a.page.evaluate(() => window.Saathi.cycle.bleedingDays());
  check('2 a start inside her pregnancy with no end: only the day she logged, no guessed days', bd[ago(2)] === 'start' && !bd[ago(1)] && !bd[TODAY] && !bd[iso(TODAY, 1)], bd);
  check('2 Today\'s pregnancy card: the reviewed line with Call 112', (await txt(a, '.pg-bleed')) === BLEED && (await tels(a, '.pg-bleed-call')) === '112');
  await shot(a, 'bleed-today');
  await done(a);
  const old = await open({ seed: { situation: sit(30), events: [{ d: ago(3), t: 'start' }] } });
  check('2 bleeding 3 days ago: the line has gone (it was for the days after)', !(await has(old, '.pg-bleed')));
  await done(old);
  const dsc = await open({ seed: { situation: sit(30), events: [{ d: ago(1), t: 'start' }], settings: { discreet: true } } });
  check('2 never on a shared phone', !(await has(dsc, '.pg-bleed')));
  await done(dsc);
  const np = await open({ seed: { situation: { planning: true, care: 'private' }, events: [{ d: ago(2), t: 'start' }] } });
  const bd2 = await np.page.evaluate(() => window.Saathi.cycle.bleedingDays());
  check('2 outside a pregnancy a period keeps its guessed days, and no line', bd2[ago(1)] === 'bleed' && bd2[iso(TODAY, 2)] === 'bleed' && !(await has(np, '.pg-bleed')), bd2);
  await done(np);
  const before = await open({ seed: { situation: sit(10), events: [{ d: ago(80), t: 'start' }] } });
  check('2 her last period before the pregnancy keeps its days, and no line', (await before.page.evaluate((x) => window.Saathi.cycle.bleedingDays()[x], ago(79))) === 'bleed' && !(await has(before, '.pg-bleed')));
  await done(before);
}

/* ---------- 3 the phone is told ---------- */
{
  const a = await open({ bridge: true, seed: trying(), wait: 1500 });
  const s0 = await sched(a);
  await stageTo(a, 'preg', { lmp: ago(212) }); await startPreg(a);
  const s1 = await sched(a);
  await go(a, 'home'); await stageTo(a, 'ttc', { end: 'mistake' }); await settle(a.page, 1500);
  const s2 = await sched(a);
  check('3 the phone is told each time: her check-in booked, then her pregnancy plan\'s, then Getting ready\'s again', s0.plan > 0 && s1.plan > 0 && s2.n > s1.n && s2.plan > 0, { s0, s1, s2 });
  await done(a);
  const b = await open({ bridge: true, seed: { situation: { planning: true, care: 'private' }, mods: {}, reminders: [], settings: { notify: true } }, wait: 1500 });
  await stageTo(b, 'preg', { lmp: ago(212) }); await startPreg(b);
  const t1 = await sched(b);
  await go(b, 'home'); await stageTo(b, 'ttc', { end: 'mistake' }); await settle(b.page, 1500);
  const t2 = await sched(b);
  check('3 with no plan before it, "marked by mistake" leaves no check-in: Android\'s last list has none', t1.plan > 0 && t2.n > t1.n && t2.plan === 0 && (await remIds(b)) === '', { t1, t2, rem: await remIds(b) });
  await done(b);
}

/* ---------- 4 My plan's "Your pregnancy" ---------- */
{
  const a = await open({ seed: withPlan(20, { intake: IK({ psafeW: 30 }) }, { situation: sit(30) }), hash: 'plan' });
  const li = await a.page.$$eval('#view .pl-path .pl-steps li', (xs) => xs.map((x) => x.className + ':' + x.querySelector('.pl-sdot').textContent));
  check('4 the parts that have passed carry no tick; this part is marked "now"', li.join() === 'gone:,gone:,now:', li);
  await done(a);
}

/* ---------- 5 the stage sheet ---------- */
{
  const a = await open({ seed: { situation: { planning: true, care: 'private' }, events: [{ d: ago(40), t: 'start' }, { d: ago(36), t: 'end' }] } });
  await tap(a, '#stage-btn'); await tap(a, '[data-stage="preg"]');
  const f = await a.page.evaluate(() => { const ins = Array.from(document.querySelectorAll('#sheet-root input[type="date"]')).map((x) => x.id + '=' + x.value); return { ins: ins, note: (document.querySelector('#sheet-root .card p.small') || {}).textContent, is: (document.getElementById('st-preg-is') || {}).textContent }; });
  const due40 = await a.page.evaluate((x) => window.Saathi.fmtD(window.Saathi.addDays(window.Saathi.fromISO(x), 280), { day: 'numeric', month: 'short', year: 'numeric' }), ago(40));
  check('5 her last period first, filled from her diary; the scan\'s due date second; the note in that order', f.ins.join() === 'st-lmp=' + ago(40) + ',st-edd=' && f.note === 'Add the first day of your last period, or the due date on your scan report.', f);
  check('5 what it works out to, before she saves', f.is === '5 weeks pregnant · Due around ' + due40, f.is);
  await a.page.$eval('#st-edd', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, iso(TODAY, 84));
  const is2 = await txt(a, '#st-preg-is');
  check('5 a scan\'s due date wins, as her pregnancy pages count it', /^28 weeks pregnant · Due around /.test(is2), is2);
  await tap(a, '#st-save');
  const s = await st(a);
  check('5 saved: pregnant, the scan\'s date and her diary\'s period', s.situation.pregnant === true && s.situation.scanEdd === iso(TODAY, 84) && s.situation.pregnantSince === ago(40), s.situation);
  await done(a);
}

/* ---------- 6 one ask after a stage change ---------- */
{
  const a = await open({ seed: trying(), wait: 1200 });
  await stageTo(a, 'preg', { lmp: ago(212) });
  const v = await view(a);
  check('6 "Your plan has changed" asks; "Tell Sakhi your stage and goals" waits', /Your plan has changed/.test(v) && !/Tell Sakhi your stage and goals/.test(v) && !(await has(a, '.ex-card')), v.slice(0, 900));
  await tap(a, '#pl-chg-go');
  const g = await a.page.$$eval('[data-pl-goal]', (xs) => xs.map((x) => x.dataset.plGoal).join());
  check('6 "See my pregnancy plan" asks her goal first', /What do you want to work on first\?/.test(await view(a)) && g === 'food,nausea,iron,sleep,mood,track', g);
  await done(a);
}

/* ---------- 7 "No, I marked it by mistake" ---------- */
{
  const a = await open({ seed: trying(), wait: 1200 });
  await stageTo(a, 'preg', { lmp: ago(212) }); await startPreg(a);
  const s1 = await st(a);
  check('7 her pregnancy plan started over Getting ready, which is kept for an undo', s1.mods.plan.pack === 'preg' && s1.mods.plan.prevPlan && s1.mods.plan.prevPlan.pack === 'ttc', { pack: s1.mods.plan.pack });
  await go(a, 'home'); await stageTo(a, 'ttc', { end: 'mistake' });
  const s2 = await st(a); const d = s2.mods.plan;
  check('7 marked by mistake: Getting ready is back as it was (its start, its version, its answers) and its check-in rings again', d.pack === 'ttc' && d.start === ago(1) && d.pv === 2 && (d.intake || {}).bdoc === 'meds' && (s2.intake || {}).bdoc === 'meds' && !d.prevPlan && (await remIds(a)).split(',').indexOf('plan') >= 0, { pack: d.pack, start: d.start, ik: d.intake, rem: await remIds(a) });
  check('7 the mistaken pregnancy plan isn\'t kept as her last plan', !(d.past || []).some((x) => x.pack === 'preg'), d.past);
  await go(a, 'home');
  check('7 Today shows Getting ready again', /Getting ready for a baby/i.test(await view(a)));
  await done(a);
  const b = await open({ seed: trying(), wait: 1200 });
  await stageTo(b, 'preg', { lmp: ago(212) }); await go(b, 'home'); await stageTo(b, 'ttc', { end: 'mistake' });
  const db = (await st(b)).mods.plan;
  check('7 marked pregnant but no new plan started: Getting ready simply carries on', db.pack === 'ttc' && db.start === ago(1), { pack: db.pack, start: db.start });
  await done(b);
  const c = await open({ seed: trying(), wait: 1200 });
  await stageTo(c, 'preg', { lmp: ago(60) }); await startPreg(c); await go(c, 'home'); await stageTo(c, 'ttc', { end: 'ended' });
  check('7 "Yes, it ended" (a loss): nothing is brought back', (await st(c)).mods.plan.pack !== 'ttc');
  await done(c);
}

/* ---------- Version 39.36: gaps 8 to 15 ---------- */
{
  const v2 = await open({ seed: withPlan(20, { intake: IK({ psafeW: 16 }) }, { situation: sit(16) }), hash: 'plan' });
  const v1 = await open({ seed: withPlan(20, { pv: 1 }, { situation: sit(16) }), hash: 'plan' });
  check('g8 the "start moves only after your doctor says" line: not beside her own answers (version 2), still on version 1', !(await has(v2, '#view .pl-preg-moves')) && (await has(v1, '#view .pl-preg-moves')));
  const foot2 = await txt(v2, '#view .footnote');
  check('g11 the foot line: no iron tablets beside a plan with no tablet step', foot2 === 'Everyday habits from national guidelines. Any other tablet, herb or medicine: your doctor decides.', foot2);
  const ts = await v2.page.$eval('#view .pl-tiles4 .pl-tile strong', (e) => { const c = getComputedStyle(e); return c.overflowWrap + '|' + (c.hyphens || c.webkitHyphens); });
  check('g12 a tile\'s label breaks between syllables (a hyphen) where it can, and never runs off the tile', ts === 'anywhere|auto', ts);
  await done(v1);
  await go(v2, 'plan-settings');
  check('g10 the settings row opens like the rows beside it (a ›)', await has(v2, '.pl-ps-set .chev'));
  await tap(v2, '.pl-ps-set [data-go="plan-psafe"]');
  check('g10 the page is called "My safety answers"', /^My safety answers Two questions keep your plan safe for you\./.test(await view(v2)), (await view(v2)).slice(0, 80));
  await tap(v2, '[data-pl-pnow="y"]');
  const bg = await v2.page.$eval('.pl-ps-go', (e) => getComputedStyle(e).backgroundImage);
  check('g14 the "Call 112 now" card in ink, not soft pink', bg === 'none' && (await v2.page.$eval('.pl-ps-go', (e) => e.classList.contains('pl-urg'))), bg);
  await v2.page.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<div class="tour-pop" id="fake-tour" style="position:fixed;bottom:80px;left:0;right:0;height:200px"></div>'); window.Saathi.toast('Updated. Today now shows what fits you.'); });
  const top = await v2.page.$eval('.toast', (e) => Math.round(e.getBoundingClientRect().top));
  check('g13 while a tour card is open at the bottom, a toast shows at the top', top < 250, top);
  await done(v2);
  const ir = await open({ seed: withPlan(20, { goalKey: 'iron', intake: IK({ goal: 'iron', psafeW: 16 }) }, { situation: sit(16) }), hash: 'plan' });
  check('g11 ... and her iron goal (her tablet step) keeps the iron tablets line', /the iron tablets your doctor prescribes in pregnancy/.test(await txt(ir, '#view .footnote')));
  await done(ir);
  const rvRows = async (w) => { const a = await open({ seed: { situation: sit(w) } }); await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'preg', goal: 'food', pflags: [], pnow: 'n' })); await settle(a.page, 300);
    await go(a, 'plan-reveal'); for (let i = 0; i < 6 && !/What happens when/.test(await view(a)); i++) await tap(a, '#pl-rv-next');
    const r = await a.page.$$eval('#view .pl-tl li', (xs) => xs.map((x) => x.textContent.trim())); await done(a); return r; };
  const r10 = await rvRows(10), r30 = await rvRows(30);
  check('g9 the reveal at 10 weeks: the weekly look back, the pelvic floor from week 13, the checks at 14 and 28 weeks, the movements from 28', r10.join(' | ') === 'Every week: a short look back at your week | From week 13: your pelvic floor, 1 set a day | At 14 and 28 weeks: a quick check of your 2 safety answers | From 28 weeks: your baby’s movements, in “How did today go?”', r10);
  check('g9 ... and at 30 weeks: the pelvic floor from day 4, no checks left, the movements each evening', r30.join(' | ') === 'Every week: a short look back at your week | From day 4: your pelvic floor, 1 set a day | Each evening: your baby’s movements, in “How did today go?”', r30);
  const fk = await open({ seed: { situation: sit(10), mods: { food: { type: 'egg', milk: true } } } });
  const n3 = await fk.page.evaluate(() => window.Saathi.plan.intake.count({ stage: 'preg', goal: 'food' }));
  await fk.page.evaluate(() => window.Saathi.plan.offer('food')); await settle(fk.page, 600); await tap(fk, '#pl-in-next');
  const sv = await view(fk);
  check('g15 My food holds how she eats: no "Your day" (3 screens), and the summary shows it with Change', n3 === 3 && /Here’s what you told Sakhi/.test(sv) && /Your day Eggs too Change/.test(sv), { n3, sv: sv.slice(0, 300) });
  await tap(fk, '[data-pl-edit="day"]');
  check('g15 Change opens "Your day"', /^Your day/.test(await view(fk)) && (await has(fk, '[data-pl-q="food:egg"].on')));
  await done(fk);
  const fk2 = await open({ seed: { situation: sit(10), mods: { food: { type: 'egg', milk: false } } } });
  await fk2.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'preg', goal: 'food', pflags: [], pnow: 'n' })); await settle(fk2.page, 300);
  const nx = (await st(fk2)).mods.plan.next || {};
  check('g15 the plan uses My food\'s answer', nx.food === 'egg' && (nx.intake || {}).milk === 'n', { food: nx.food, milk: (nx.intake || {}).milk });
  await done(fk2);
  const nf = await open({ seed: { situation: sit(10) } });
  check('g15 with no answer in My food, "Your day" asks (4 screens)', (await nf.page.evaluate(() => window.Saathi.plan.intake.count({ stage: 'preg', goal: 'food' }))) === 4);
  await done(nf);
}

/* ---------- 8 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: { lang: 'hi', situation: { planning: true, care: 'private' }, events: [{ d: ago(40), t: 'start' }, { d: ago(36), t: 'end' }] } });
  await tap(a, '#stage-btn'); await tap(a, '[data-stage="preg"]');
  const t8 = await txt(a, '#sheet-root');
  check('8 Hindi at 360 px: the note in its new order and the line, no side scroll', /पिछले पीरियड का पहला दिन, या स्कैन रिपोर्ट की डिलीवरी तारीख़ दर्ज करें।/.test(t8) && /^5 /.test(await txt(a, '#st-preg-is')) && (await noScroll(a)), t8.slice(0, 400));
  await shot(a, 'hi-stage');
  await done(a);
  const k = await open({ w: 360, seed: { lang: 'hi', situation: sit(30), events: [{ d: ago(1), t: 'start' }] }, wait: 1200 });
  check('8 Hindi at 360 px: the bleeding line on Today', (await has(k, '.pg-bleed')) && !KEYS.test(await txt(k, '.pg-bleed')) && (await noScroll(k)));
  await done(k);
}

check('9 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (pregwalk)');
process.exit(failed.length ? 1 : 0);
