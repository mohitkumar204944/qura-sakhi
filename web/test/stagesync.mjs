// Version 39.48: the switch walk's gaps (Mohit, 30 Oct: "can you do proper thorough check by walkthrough navigating between
// different stages and using different programs ... make sure everything sync properly", then "fix all 5"; the walk is
// test/switch-walk.mjs; MODULE_API section 91). This file checks:
//   1 tracking and trying: the plan for now is offered when her stage moves (Getting ready after "Tracking my periods",
//     Easier periods after "Trying for a baby"), her plan runs on until she chooses, "Keep" keeps it and a pregnancy still asks,
//     and the goals ask waits while the card asks;
//   2 after a pregnancy loss, the goals ask and free check-ups wait 6 weeks;
//   3 "Tracking my periods" after a birth with no period logged: "Log the day your periods came back", never "Updated" first;
//   4 her 6-week check reminder ends after its day, and in a new pregnancy;
//   5 the plan she starts leads her goals (For you follows it while it rests);
//   6 no page errors.
// Usage: node test/stagesync.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'stagesync'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.48-pilot', platform: 'android' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {}, goals: [],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const bridge = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(bridge);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 800);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const ids = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => x.id));
const rems = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => r.id));
const day = async (a, n) => { await a.page.clock.setSystemTime(at('10:00', iso(TODAY, n))); await go(a, 'plan'); await go(a, 'home'); };
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const toasts = (a) => a.page.$$eval('.toast', (xs) => xs.map((x) => x.innerText.replace(/\s+/g, ' ').trim())).catch(() => []);
/* the stage sheet from Today */
async function stageTo(a, pick, o = {}) {
  await go(a, 'home'); await tap(a, '#stage-btn'); await tap(a, '#sheet-root [data-stage="' + pick + '"]');
  if (o.lmp) await a.page.$eval('#st-lmp', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, o.lmp);
  if (o.end) await tap(a, '#sheet-root [data-st-end="' + o.end + '"]');
  await a.page.$eval('#st-save', (el) => el.click()); await settle(a.page, 150);
}
/* her plan's own questions, the reveal's cards, Start */
async function startFlow(a, goal) {
  for (let i = 0; i < 12; i++) {
    if ((await a.page.evaluate(() => location.hash)) === '#plan-reveal') break;
    if (await has(a, '#pl-in-make')) { await tap(a, '#pl-in-make'); continue; }
    if (await has(a, '[data-pl-goal]')) { await tap(a, (await has(a, '[data-pl-goal="' + goal + '"]')) ? '[data-pl-goal="' + goal + '"]' : '[data-pl-goal]'); continue; }
    if ((await has(a, '[data-pl-pnow]')) && !(await has(a, '[data-pl-pnow].on'))) await tap(a, '[data-pl-pnow="n"]');
    if (await has(a, '[data-pl-when]')) { await tap(a, '[data-pl-when="evening"]'); continue; }
    await a.page.evaluate(() => { document.querySelectorAll('#view .chips[role="group"]').forEach((g) => { const c = g.querySelectorAll('[data-pl-q], [data-pl-m]'); if (c.length && !g.querySelector('.on')) c[0].click(); }); }); await settle(a.page, 200);
    if (await has(a, '#pl-in-next')) await tap(a, '#pl-in-next'); else break;
  }
  if ((await a.page.evaluate(() => location.hash)) !== '#plan-reveal') await go(a, 'plan-reveal');
  for (let i = 0; i < 9 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go'); await settle(a.page, 900); await go(a, 'home');
}
const PLAN = (pack, startAgo, o) => Object.assign({ pack: pack, goalKey: pack === 'ttc' ? 'ready' : pack, start: ago(startAgo), started: ago(startAgo), go: true, pv: pack === 'ttc' ? 2 : 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: {}, body: [], intake: { stage: pack === 'ttc' ? 'ttc' : 'cycle', goal: pack === 'ttc' ? 'ready' : pack } }, o || {});
const REM = (startAgo) => ({ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), every: 1, time: '20:00', on: true, doneOn: null });
const FOLIC = { id: 'ttc-folic', mod: 'ttc', kind: 'med', title: { en: 'My folic acid tablet', hi: 'मेरी folic acid की गोली' }, start: ago(9), every: 1, time: '21:00', on: true, doneOn: null };
const periods = (starts) => starts.flatMap((n) => [{ d: ago(n), t: 'start' }, { d: ago(n - 4), t: 'end' }]);
const TTCIK = { at: ago(12), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' };
const trying = (x) => Object.assign({ situation: { planning: true, care: 'private' }, goals: ['ready'], intake: TTCIK, events: periods([66, 38, 10]), mods: { plan: PLAN('ttc', 10, { intake: TTCIK }), ttc: { folic: { has: true, remSet: true } } }, reminders: [REM(10), FOLIC] }, x || {});
const painPlan = (x) => Object.assign({ situation: { care: 'private' }, goals: ['pain'], intake: { goal: 'pain', stage: 'cycle' }, events: periods([66, 38, 10]), mods: { plan: PLAN('pain', 10) }, reminders: [REM(10)] }, x || {});

/* ---------- 1 tracking and trying: the plan for now is offered ---------- */
{
  const a = await open({ seed: trying() });
  await stageTo(a, 'cycle'); await go(a, 'home');
  const sl = await txt(a, '#view section.slot');
  check('1 Getting ready, then "Tracking my periods": "Not trying for a baby now?" leads Sakhi says, with Choose my plan and Keep Getting ready', /^SAKHI SAYS Not trying for a baby now\? Getting ready for a baby is for the months before a pregnancy\. Choose a plan for your periods, or keep this one\. Choose my plan Keep Getting ready for a baby/.test(sl), sl.slice(0, 300));
  check('1 ... her plan runs on until she chooses (her tablet still a step)', (await ids(a)).indexOf('folic') >= 0, await ids(a));
  check('1 ... and the goals ask waits while the card asks (one ask at a time)', !(await has(a, '#ex-go')));
  await a.page.screenshot({ path: path.join(SHOTS, '1-not-trying.png'), fullPage: true });
  await tap(a, '#pl-fit-go');
  check('1 "Choose my plan" opens the plans for her periods', (await a.page.evaluate(() => location.hash)) === '#plan-goal' && await has(a, '[data-pl-goal="pain"]') && !(await has(a, '[data-pl-goal="ready"]')), await a.page.evaluate(() => location.hash));
  await startFlow(a, 'pain');
  const p = (await st(a)).mods.plan;
  check('1 ... Easier periods runs; Getting ready is her last plan; her tablet reminder goes with it', p.pack === 'pain' && (p.past || [])[0] && p.past[0].pack === 'ttc' && (await rems(a)).indexOf('ttc-folic') < 0, [p.pack, (p.past || []).map((x) => x.pack), await rems(a)]);
  check('1 ... and the card has gone', !(await has(a, '#view .pl-fit')));
  await done(a);
  /* "Keep" keeps it, and a pregnancy still asks */
  const b = await open({ seed: trying() });
  await stageTo(b, 'cycle'); await go(b, 'home'); await tap(b, '#pl-fit-keep');
  check('1 "Keep Getting ready": the card goes and her plan stays', !(await has(b, '#view .pl-fit')) && (await st(b)).mods.plan.pack === 'ttc');
  await day(b, 3);
  check('1 ... it isn\'t asked again', !(await has(b, '#view .pl-fit')));
  await stageTo(b, 'preg', { lmp: ago(40) }); await go(b, 'home');
  check('1 ... and a pregnancy still asks "Your plan has changed"', await has(b, '#pl-chg-go'), (await txt(b, '#view section.slot')).slice(0, 200));
  await done(b);
  /* the other way: Easier periods, then "Trying for a baby" */
  const c = await open({ seed: painPlan() });
  await stageTo(c, 'ttc'); await go(c, 'home');
  const sc = await txt(c, '#view section.slot');
  check('1 Easier periods, then "Trying for a baby": "Trying for a baby now?", with See Getting ready and Keep Easier periods', /^SAKHI SAYS Trying for a baby now\? Getting ready for a baby has the steps for these months: your folic acid tablet, your food and your moves\. See Getting ready Keep Easier periods/.test(sc), sc.slice(0, 300));
  check('1 ... while it asks, a plan that doesn\'t fit her stage doesn\'t keep its goal first ("Tell Sakhi")', await c.page.evaluate(() => window.Saathi.plan.misfit()));
  await tap(c, '#pl-fit-go'); await startFlow(c, 'ready');
  const pc = (await st(c)).mods.plan;
  check('1 "See Getting ready": Getting ready (version 2) runs, her folic acid tablet first', pc.pack === 'ttc' && pc.pv === 2 && (await ids(c))[0] === 'folic' && !(await c.page.evaluate(() => window.Saathi.plan.misfit())), [pc.pack, pc.pv, await ids(c)]);
  await done(c);
  /* Hindi at 360 px */
  const h = await open({ seed: painPlan({ lang: 'hi' }) });
  await h.page.evaluate(() => { window.Saathi.state.situation.planning = true; window.Saathi.save(); }); await go(h, 'home');
  const sh = await txt(h, '#view section.slot');
  check('1 Hindi at 360 px: "अब बच्चे की कोशिश कर रही हैं?", its two buttons, no sideways scroll', /अब बच्चे की कोशिश कर रही हैं\?/.test(sh) && /‘गर्भ के लिए तैयारी’ देखें/.test(sh) && /रखें/.test(sh) && await h.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), sh.slice(0, 260));
  await done(h);
  /* a shared phone: plain words */
  const d = await open({ seed: painPlan({ settings: { notify: true, discreet: true } }) });
  await d.page.evaluate(() => { window.Saathi.state.situation.planning = true; window.Saathi.save(); }); await go(d, 'home');
  const sd = await txt(d, '#view section.slot');
  check('1 a shared phone: "A different plan may fit now", no baby words', /A different plan may fit now/.test(sd) && !/baby|Getting ready|folic/i.test(sd), sd.slice(0, 200));
  await done(d);
}

/* ---------- 2 after a pregnancy loss, the goals ask and free check-ups wait 6 weeks ---------- */
{
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(60), care: 'private' }, goals: ['food'], intake: { goal: 'food', stage: 'preg' }, mods: { plan: PLAN('preg', 20, { goalKey: 'food', pv: 2, intake: { stage: 'preg', goal: 'food', pflags: [], psafeW: 6, pnow: null } }) }, reminders: [REM(20)] } });
  await stageTo(a, 'cycle', { end: 'ended' }); await go(a, 'home');
  const v1 = await view(a);
  check('2 the day of a loss: no "Tell Sakhi your stage and goals", no free check-ups', !(await has(a, '#ex-go')) && !(await has(a, '#view .screen-home')), v1.slice(0, 400));
  await day(a, 20);
  check('2 ... nor 3 weeks later', !(await has(a, '#ex-go')) && !(await has(a, '#view .screen-home')));
  await go(a, 'plan');
  check('2 ... My plan keeps "Pick a goal when you\'re ready"', /Pick a goal when you’re ready/.test(await view(a)), (await view(a)).slice(0, 200));
  await day(a, 43);
  const f43 = await a.page.$eval('#view section.slot', (x) => (x.children[1] || {}).className || '').catch(() => '');
  check('2 ... after 6 weeks Today asks again: her goals, or a plan for her (one ask at a time, Version 39.42)', (await has(a, '#ex-go')) || /pl-homerec|pl-offer/.test(f43), f43);
  await done(a);
}

/* ---------- 3 "Tracking my periods" after a birth, with no period logged ---------- */
{
  const a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(50), breastfeeding: true }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' } } });
  await stageTo(a, 'cycle');
  const ts = await toasts(a);
  check('3 after a birth, "Tracking my periods": "Log the day your periods came back", never "Updated" first', ts.some((x) => /Log the day your periods came back/.test(x)) && !ts.some((x) => /^Updated\./.test(x)), ts);
  check('3 ... the period log opens', /What happened\?/.test(await txt(a, '#sheet-root')), await txt(a, '#sheet-root'));
  await a.page.keyboard.press('Escape'); await settle(a.page, 300); await go(a, 'home');
  check('3 ... closed without a period: she is still after the birth, as Me says', /AFTER BIRTH/.test(await view(a)) && (await a.page.evaluate(() => window.Saathi.stageNow())) === 'post');
  await done(a);
}

/* ---------- 4 her 6-week check reminder ends after its day, and in a new pregnancy ---------- */
{
  const six = (born) => ({ id: 'post-6wk', mod: 'post', title: { en: 'My 6-week check after birth', hi: 'डिलीवरी के बाद मेरी 6 हफ़्ते की जाँच' }, dates: [iso(ago(born), 42)], time: '09:00', on: true });
  const post = (born) => ({ situation: { care: 'private', deliveredOn: ago(born), breastfeeding: true }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, reminders: [six(born)] });
  const a = await open({ seed: post(30) });
  check('4 day 30 after the birth: her 6-week check reminder waits for its day', (await rems(a)).indexOf('post-6wk') >= 0);
  await day(a, 13);   /* day 43 */
  check('4 ... the day after it: it has gone, and Me counts only what rings', (await rems(a)).indexOf('post-6wk') < 0 && !/Reminders 1 on/.test((await go(a, 'me'), await view(a))), [await rems(a)]);
  await done(a);
  const b = await open({ seed: post(30) });
  await stageTo(b, 'preg', { lmp: ago(10) }); await go(b, 'home');
  check('4 pregnant again before day 42: the 6-week check reminder goes', (await rems(b)).indexOf('post-6wk') < 0, await rems(b));
  await done(b);
}

/* ---------- 5 the plan she starts leads her goals ---------- */
{
  const a = await open({ seed: { situation: { care: 'private', pcos: true }, goals: ['pmos', 'irregular'], intake: { goal: 'pmos', stage: 'cycle' }, events: periods([120, 78, 36]), mods: { plan: PLAN('cycle', 9, { goalKey: 'pmos', when: 'dinner' }) }, reminders: [REM(9)] } });
  await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: '0', food: 'veg', milk: 'y', lim: [], bed: 'b24', work: 'day', when: 'evening' })); await settle(a.page, 300);
  await go(a, 'plan-reveal'); for (let i = 0; i < 8 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next'); await tap(a, '#pl-rv-go'); await settle(a.page, 800);
  check('5 she changes her plan to Easier periods: its goal leads her goals', JSON.stringify((await st(a)).goals) === '["pain","pmos","irregular"]', (await st(a)).goals);
  await go(a, 'plan-settings'); await tap(a, '#pl-pause'); await go(a, 'care');
  const fy = await txt(a, '#view'); const i = fy.indexOf('For you');
  check('5 ... and while it rests, For you still follows it (Period pain first, not PMOS)', /^For you Period pain/.test(fy.slice(i)), fy.slice(i, i + 120));
  await done(a);
}

check('6 no page errors', !errsAll.length, errsAll.slice(0, 6));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
