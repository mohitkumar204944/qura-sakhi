// Version 37: Sakhi as her companion (docs/companion-journey-2026-10-23.md, section 12.1; MODULE_API section 39). This file
// checks the acceptance criteria:
//   1 goal first: joining asks what she wants help with (Version 39.10: up to 3 goals for her stage; her plan's own questions
//     come from Today's offer, after her first log), then what her plan needs, for her goal;
//   2 the reveal (Version 37.1: cards, then "Start my plan"): her goal as the change she wants, what it is made from, her
//     steps, what happens when (never a percentage), the doctor check when her periods skip; Today then shows her steps;
//   3 joining survives a restart;
//   4 the evening check-in: done, partly or not today, what got in the way, what each habit does for her, the week's count,
//     a petal, no "streak", and the day marked on the diary calendar;
//   5 one "Sakhi says" slot on Today, the rest folded under it; no setup card, fold or doctor banner of their own;
//   6 the weekly look-back on a light plan; 7 a fresh start after quiet days (Monday says so); 8 honest results;
//   9 safety moments: the doctor check from day 2, the heavy-bleeding and pain-that-stops-her-day checks on the reveal;
//   10 the tabs (Today, My plan, Diary, Explore) and the Help button, and Explore keeping the old fold's quick answers, voice
//   search and "Ask a Qura doctor"; 11 a shared phone; 12 every sample woman's Today;
//   and: every goal and stage starts the right plan, a woman who joined before Version 37 picks a goal in My plan, "Just
//   keeping track" starts no plan (and joining has no "Just learning" since Version 39.10), Hindi, and no page errors.
// Usage: node test/companion.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join as joinAs } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'companion'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-23';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const SERVER = { api: 'https://api.test.invalid', app: 'test-0.37-pilot', platform: 'android' };
const regular = () => { const out = []; [84, 56, 28].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off', notifyIntro: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* a plan already going: pack, goal and start, with her intake */
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: {}, body: [] }, extra || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(o.cfg || SERVER) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(Object.assign({}, ACCT, o.acct || {}))) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(o.now || '2026-10-23T20:30:00+05:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  if (o.sample) { await page.evaluate((w) => { const S = window.Saathi; S.loadSample(w); S.state.langChosen = true; S.state.settings.toursAuto = false; S.state.fullTour = { st: 'done', d: '2026-10-20' }; S.state.prompts = Object.assign({}, S.state.prompts, { notifyIntro: '2026-10-20' }); S.save(); }, o.sample); await go(page, 'learn'); await go(page, o.hash ? o.hash.slice(1) : 'home'); }
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 400); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 250); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const gos = (page, sel) => page.$$eval(sel, (b) => b.map((x) => x.dataset.go));
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const setPlan = (page, p, intake) => page.evaluate((a) => { const S = window.Saathi; S.state.mods.plan = a[0]; if (a[1]) S.state.intake = a[1]; S.save(); S.render(); }, [p, intake || null]);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
/* Version 39.10: joining (test/join.mjs), then sign-up, "Your Sakhi" (Skip), her first log in Diary, and Today's plan offer,
   which opens her plan's own questions */
const TILE_AGE = { mid: { dec: 1970, y: 1978 }, meno: { dec: 1970, y: 1972 } };
async function signUp(page) {
  await settle(page, 400);
  await page.fill('#su-num', '9876543210'); await tap(page, '#su-send'); await page.fill('#su-code', '123456'); await settle(page, 900);
  if (await has(page, '#su-done')) { await page.fill('#su-name', 'Riya Sharma'); await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); }
  await settle(page, 900);
  if (await has(page, '#ys-skip')) { await tap(page, '#ys-skip'); await settle(page, 400); }
}
async function firstLog(page) { await go(page, 'diary'); await page.waitForSelector('#fl-save, [data-fl-go]'); await tap(page, (await has(page, '#fl-save')) ? '#fl-save' : '[data-fl-go]'); await settle(page, 400); }
async function toOffer(page, tile, goal) {
  await joinAs(page, Object.assign({ tile: tile, goals: [goal], dec: 1990, y: 1999, lp: '24', birth: ago(21), lmp: '2026-06-20' }, TILE_AGE[tile] || {}));
  await signUp(page); await firstLog(page); await go(page, 'home');
  await tap(page, '#pl-off-go');
}
/* her plan's own questions, to its cards (an answer she already gave is kept) */
async function answer(page, ans) {
  for (let i = 0; i < 10; i++) {
    if ((await page.evaluate(() => location.hash)) === '#plan-reveal') return;
    if (await has(page, '#pl-in-make')) { await tap(page, '#pl-in-make'); await settle(page, 400); continue; }
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="' + ((ans || {}).when || 'dinner') + '"]'); continue; }
    if (await has(page, '#pl-in-skip')) { await tap(page, '#pl-in-skip'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); const want = (ans || {})[k]; if (!want && await has(page, '[data-pl-' + kind + '^="' + k + ':"].on')) continue; await tap(page, want ? '[data-pl-' + kind + '="' + k + ':' + want + '"]' : '[data-pl-' + kind + '^="' + k + ':"]'); }
    await tap(page, '#pl-in-next');
  }
}
const LOCAL = { app: '0.37-pilot', platform: 'android' };   /* no server address: the stand-in server, whose code is 123456 */
/* Version 37.1: her plan's cards, from the one on screen to the Start screen; their words */
/* V39.8 review REGRESSIONS-07: each step's reason sits behind "Why?" (a closed details), so its words are read too */
async function revealWords(page) { let w = ''; for (let i = 0; i < 8; i++) { w += '\n' + (await view(page)) + '\n' + (await page.$$eval('#view details.pl-why-d', (xs) => xs.map((x) => x.textContent).join('\n'))); if (await has(page, '#pl-rv-go')) break; await tap(page, '#pl-rv-next'); } return w; }

/* ---------- 1–4. Riya joins with periods 36 to 45 days apart, some months skipped (Version 39.10: her goals while joining; her
   plan's own questions after her first log, from Today's offer) ---------- */
{
  const { ctx, page, errs } = await open({ cfg: LOCAL, seed: null });
  for (const s of ['[data-ob-lang="en"]', '#w-start', '[data-ob-dec="1990"]', '[data-ob-y="1999"]', '[data-ob-st="pmos"]']) await tap(page, s);
  let v = await view(page);
  check('1 after her stage: "What would you like help with?", her stage\'s 6 goals, up to 3', /What would you like help with\?/.test(v) && (await page.$$('[data-ob-goal]')).length === 6 && /Pick up to 3/.test(v) && /Irregular or late periods/.test(v), v.slice(0, 300));
  await shot(page, '1-goal');
  await tap(page, '[data-ob-goal="irregular"]'); await tap(page, '#ob-next');
  /* 3. a restart in the middle of joining keeps her answers */
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  check('3 the app restarts mid-way: she is back on her details', /A few things about your periods/.test(await view(page)), (await view(page)).slice(0, 200));
  await tap(page, '#ob-back');
  check('3 ... and her goal is kept', await has(page, '[data-ob-goal="irregular"].on'));
  await tap(page, '#ob-next'); await tap(page, '[data-ob-lp="24"]'); await tap(page, '#ob-next'); await tap(page, '[data-ob-sh="me"]');
  await signUp(page);
  check('1 no plan straight after joining: Today, and her first log first', (await page.evaluate(() => location.hash)) === '#home' && !(await has(page, '#pl-off-go')) && !((await st(page)).mods.plan || {}).next);
  await firstLog(page); await go(page, 'home');
  await tap(page, '#pl-off-go');
  v = await view(page);
  check('1 "Irregular or late periods" asks about her periods: the gap, skipped months, a diagnosis, signs', /About your periods/.test(v) && (await page.$$('[data-pl-q^="gap:"]')).length === 6 && (await has(page, '[data-pl-q="skips:y"]')) && (await has(page, '[data-pl-q="dx:ns"]')) && (await has(page, '[data-pl-m="signs:acne"]')), v.slice(0, 300));
  await tap(page, '#pl-in-next');
  check('1 an unanswered question stops her with a line, not an error', !(await page.$eval('#pl-in-err', (e) => e.hidden)) && /About your periods/.test(await view(page)));
  for (const s of ['[data-pl-q="gap:g45"]', '[data-pl-q="skips:y"]', '[data-pl-q="dx:ns"]', '[data-pl-m="signs:acne"]']) await tap(page, s);
  await tap(page, '#pl-in-next');
  /* Version 39.3: milk, and knees or back (for the moves), join her day */
  check('1 then her day: activity, food, milk, knees or back, sleep and work (Version 37.1: the check-in time moved to the Start screen)', /Your day/.test(await view(page)) && ['act', 'food', 'milk', 'bed', 'work'].join() === (await page.$$eval('[data-pl-q]', (b) => Array.from(new Set(b.map((x) => x.dataset.plQ.replace(/:.*/, '')))).join())) && (await has(page, '[data-pl-m="lim:none"]')) && !(await has(page, '[data-pl-q^="remind:"]')));
  for (const s of ['[data-pl-q="act:0"]', '[data-pl-q="food:veg"]', '[data-pl-m="lim:none"]', '[data-pl-q="bed:late"]', '[data-pl-q="work:day"]']) await tap(page, s);
  await tap(page, '#pl-in-next');
  check('1 "When can you move for 10 minutes?"', /When can you move for 10 minutes\?/.test(await view(page)));
  await tap(page, '[data-pl-when="dinner"]');
  /* Version 39.3 (diet audit F2): her height and weight are asked only when her goal is her weight */
  check('1 no body question when her goal isn\'t her weight', !/Your body \(optional\)/.test(await view(page)) && !(await has(page, '#pl-in-skip')));
  check('1 last, what she told Sakhi, to check', /Here’s what you told Sakhi/.test(await view(page)) && (await has(page, '#pl-in-make')));
  await tap(page, '#pl-in-make'); await settle(page, 600);
  /* 2. the reveal */
  check('2 "Make my plan" opens her plan', (await page.evaluate(() => location.hash)) === '#plan-reveal');
  v = await view(page);
  check('2 the reveal: her first name and her goal as the change she wants', /Your plan is ready, Riya\b/.test(v) && !/Riya Sharma/.test(v) && /Your goal: more regular periods/i.test(v), v.slice(0, 300));
  check('2 what it is made from, in her words, with the sign she ticked', /Made from what you told Sakhi: 36 to 45 days apart · some months skipped · acne that keeps coming back/.test(v), v.slice(0, 300));
  await shot(page, '2-reveal');
  v = await revealWords(page);
  check('2 her steps: walking from 10 minutes, one food change every two weeks, a bedtime', /Walking that grows from 10 minutes a day/.test(v) && /One food change every two weeks, starting with: Half the plate sabzi/.test(v) && /A regular bedtime: midnight/.test(v));
  check('2 what happens when, with no percentage or promise', /What happens when/.test(v) && /Week 4: a look at your first month/.test(v) && /It is different for every woman/.test(v) && !/%|guarantee|cure|fix your/i.test(v));
  check('2 skipped months: one doctor check, and a pregnancy test first if she could be pregnant', /Periods that skip months/.test(v) && /do a pregnancy test first/.test(v));
  check('2 the Start screen: when to start, and the evening check-in time', /When do you want to start\?/.test(v) && (await has(page, '[data-rv-at="20:00"].on')));
  await tap(page, '#pl-rv-go'); await settle(page, 600);
  await page.evaluate(() => { document.getElementById('sheet-root').innerHTML = ''; document.getElementById('tour-root') && (document.getElementById('tour-root').innerHTML = ''); }); await go(page, 'home');
  let s = await st(page);
  check('2 what joining saved: her goal, gap, skipped months and day; the plan; the 8 pm reminder', s.intake.goal === 'irregular' && s.intake.gap === 'g45' && s.intake.skips === 'y' && s.mods.plan.pack === 'cycle' && s.mods.plan.remAt === '20:00' && s.mods.plan.bed === 'late' && s.mods.plan.when === 'dinner' && s.reminders.some((r) => r.id === 'plan' && r.time === '20:00') && JSON.stringify(s.goals) === '["track","irregular"]' && !s.situation.pcos, [s.intake, s.mods.plan.remAt, s.reminders, s.goals]);
  check('2 the full tour did not start on its own (Version 39.10: "Your Sakhi" and its short tour are her welcome)', s.fullTour && s.fullTour.st === 'first');
  const td = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('2 Today: a greeting by name, her plan and day, and her three steps', /Good evening, Riya/.test(td) && /my cycle plan/i.test(td) && /Day 1 · 0 of 3 done today/.test(td) && /Move 10 minutes today/.test(td) && /Half the plate sabzi/.test(td) && /In bed by midnight/.test(td), td);
  await shot(page, '2-today');
  /* 4. the evening check-in */
  check('4 in the evening Today offers "How did today go?"', await has(page, '#view .today-card [data-go="plan-checkin"].primary'));
  await tap(page, '#view .today-card [data-go="plan-checkin"]');
  v = await view(page);
  check('4 the check-in: each step with Done, Partly and Not today', /How did today go\?/.test(v) && (await page.$$('[data-ci]')).length === 9);
  await tap(page, '#pl-ci-save');
  check('4 every step needs an answer', !(await page.$eval('#pl-ci-err', (e) => e.hidden)));
  await tap(page, '[data-ci="move:d"]'); await tap(page, '[data-ci="food:d"]'); await tap(page, '[data-ci="sleep:n"]');
  check('4 a "Not today" asks what got in the way', !(await page.$eval('#pl-ci-bar', (e) => e.hidden)));
  await tap(page, '[data-ci-b="time"]'); await tap(page, '#pl-ci-save');
  v = await view(page);
  check('4 she hears what it does for her, and her count for the day and the week', /helps your body use insulin better/.test(v) && /2 of 3 done today · 1 of 7 days this week/.test(v) && /Split it up/.test(v) && /A petal for your garden/.test(v), v.slice(0, 400));
  check('4 and when Sakhi asks again', /Tomorrow: the same steps. See you at 8 pm./.test(v), v.slice(0, 500));
  check('4 no "streak" anywhere', !/streak/i.test(v));
  await shot(page, '4-feedback');
  s = await st(page); const lg = s.mods.plan.log[TODAY] || {};
  check('4 the day is kept: each answer, the minutes and the food habit', lg.ci === 1 && lg.ck.move === 'd' && lg.ck.sleep === 'n' && lg.min === 10 && lg.plate.half === true && lg.bar === 'time', lg);
  await go(page, 'home');
  const td2 = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('4 Today: checked in, with the day\'s count; the steps leave Today (Version 37.2)', /Checked in today/.test(td2) && /2 of 3 done today/.test(td2) && !/Move 10 minutes today/.test(td2) && !/In bed by midnight/.test(td2), td2);
  await go(page, 'diary'); if (await has(page, '[data-tab="cal"]:not(.on)')) await tap(page, '[data-tab="cal"]');
  check('4 the diary calendar marks the day she followed her plan', (await has(page, '#view .day.today .kd i.hue-plum')) && /Your plan/.test(await view(page)));
  check('1-4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5, 7, 9. Today's one slot, a fresh start, and the doctor check ---------- */
{
  const { ctx, page, errs } = await open({ now: '2026-10-23T10:00:00+05:30' });
  const intake = { stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y' };
  await setPlan(page, planOf('cycle', 'irregular', TODAY), intake); await go(page, 'home');
  check('9 day 1: no doctor-check card on Today (the reveal showed it)', !(await has(page, '#view .pl-sl-doc')));
  await setPlan(page, planOf('cycle', 'irregular', ago(2)), intake); await go(page, 'home');
  check('9 from day 2: Today\'s slot asks "Did you get the doctor check?"', await has(page, '#view .slot .pl-sl-doc'));
  /* after her plan's first 3 days (Version 37.1), the cards that waited fold under it */
  await setPlan(page, planOf('cycle', 'irregular', ago(5)), intake); await go(page, 'home');
  check('5 one card shows in the slot; the rest fold under "More from Sakhi"', (await page.$$eval('#view .slot > .card', (x) => x.length)) === 1 && (await page.$$eval('#view .slot .slot-more .card', (x) => x.length)) >= 1 && /More from Sakhi \(\d+\)/.test(await page.$eval('#view .slot .slot-more summary', (e) => e.innerText)));
  check('5 no setup card, "More for you" fold or doctor banner of their own on Today', !(await has(page, '#view > .setup-card')) && !(await has(page, '#view .home-more')) && !(await has(page, '#view .qura-card')));
  await tap(page, '#pl-doc-yes');
  check('9 "Yes, done" puts it away', !(await has(page, '#view .pl-sl-doc')) && (await st(page)).mods.plan.doc === 'done');
  /* 7. quiet days: a fresh start, small (Monday says so) */
  const log = {}; log[ago(9)] = { ci: 1 }; log[ago(8)] = { min: 10 };
  await setPlan(page, planOf('cycle', 'irregular', ago(10), { doc: 'done', log: log }), intake); await go(page, 'home');
  let sl = await page.$eval('#view .slot', (e) => e.innerText).catch(() => '');
  check('7 after quiet days: "Shall we start again, small?", just today\'s first step, no catching up', /Shall we start again, small\?/.test(sl) && /No catching up needed\. Just today: Walk or move \d+ minutes/.test(sl) && !/streak/i.test(sl), sl);
  await tap(page, '#pl-lapse-not');
  check('7 "Not now" puts it away for today', !(await has(page, '#view .pl-sl-lapse')));
  await ctx.close();
  const m = await open({ now: '2026-10-26T10:00:00+05:30' });
  await setPlan(m.page, planOf('cycle', 'irregular', ago(10), { doc: 'done', log: log }), intake); await go(m.page, 'home');
  check('7 on a Monday: "A new week is a fresh start."', /A new week is a fresh start\./.test(await m.page.$eval('#view .slot', (e) => e.innerText).catch(() => '')));
  check('5/7/9 no page errors', !errs.length && !m.errs.length, errs.concat(m.errs));
  await m.ctx.close();
}

/* ---------- 6, 8. A light plan: the look-back and honest results (period pain) ---------- */
{
  const { ctx, page, errs } = await open({ now: '2026-10-23T10:00:00+05:30' });
  const ev = [{ d: ago(70), t: 'start', pain: 'pain_3' }, { d: ago(65), t: 'end' }, { d: ago(42), t: 'start', pain: 'pain_2' }, { d: ago(37), t: 'end' }, { d: ago(14), t: 'start', pain: 'pain_1' }, { d: ago(9), t: 'end' }];
  await page.evaluate((e) => { const S = window.Saathi; S.state.events = e; S.save(); }, ev);
  const log = {}; [8, 7, 5, 3].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' }, min: 10 }; });
  await setPlan(page, planOf('pain', 'pain', ago(60), { log: log }), { stage: 'cycle', goal: 'pain', pain: 'pk' });
  await go(page, 'plan');
  let v = await view(page);
  /* Version 39.2 (diet audit F11): every plan's results are "My progress" */
  check('8 My plan for period pain: its name, today\'s steps and her progress', /Easier periods/.test(v) && /Today’s steps/.test(v) && /My progress/.test(v), v.slice(0, 300));
  await go(page, 'plan-progress'); v = await view(page);   /* Version 39.5: My plan's "My progress" tile opens every plan's results */
  check('8 results from her own diary: days between periods and painkiller periods, before and since', /Days between periods/.test(v) && /Periods that needed a painkiller/.test(v) && /Before/.test(v) && /Since you started/.test(v), v.slice(0, 400));
  await go(page, 'plan'); v = await view(page);
  check('8 no percentage and no promise', !/%|guarantee|cure/i.test(v));
  await shot(page, '8-light-plan');
  /* 6. the look-back on a light plan counts days, not minutes; what got in the way comes from her check-ins (Version 37.2) */
  log[ago(7)].bar = 'tired'; log[ago(5)].bar = 'tired';
  await setPlan(page, planOf('pain', 'pain', ago(8), { log: log }), { stage: 'cycle', goal: 'pain', pain: 'pk' }); await go(page, 'plan');
  v = await view(page);
  check('6 a new week opens with the look-back: the days she followed her plan, and the week\'s barrier', /Week 1 is done/.test(v) && /You followed your plan on \d of 7 days\./.test(v) && /Too tired on 2 days\./.test(v), v.slice(0, 600));
  await tap(page, '#view .pl-review [data-pl-e="ok"]');
  check('6 her answer brings one tip and "keep going"', /On tired days/.test(await view(page)) && /Next week: keep going/.test(await view(page)));
  /* a period day brings the cramps routine */
  await page.evaluate(() => { const S = window.Saathi; S.state.events.push({ d: '2026-10-23', t: 'start' }); S.save(); }); await go(page, 'home');
  check('8 on a period day her Today brings the 3-minute cramps routine', /For period cramps/.test(await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '')));
  check('6/8 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 9, 2. The reveal's doctor checks for heavy bleeding and for pain that stops her day ---------- */
for (const [goal, ans, re, sel, now] of [['heavy', { pads: 'p12', clots: 'y', tired: 'y' }, /Bleeding this heavy needs a doctor’s check and an Hb test/, '[data-pl-q="pads:p12"]', 'Made from what you told Sakhi: a pad every 1 to 2 hours, or two pads at once · clots · often tired or dizzy'], ['pain', { pain: 'stop', painDays: '23' }, /Pain that stops your day needs a doctor’s check/, '[data-pl-q="pain:stop"]', 'Made from what you told Sakhi: It stops my day · for 2 to 3 days']]) {
  const { ctx, page, errs } = await open({ cfg: LOCAL, seed: null });
  await toOffer(page, 'cycle', goal);
  check('9 ' + goal + ': no warning until she answers', await page.$eval('#pl-in-warn', (e) => e.hidden));
  await tap(page, sel);
  check('9 ' + goal + ': the doctor warning shows on the question itself', !(await page.$eval('#pl-in-warn', (e) => e.hidden)) && re.test(await page.$eval('#pl-in-warn', (e) => e.innerText)));
  await answer(page, ans);
  const w = await revealWords(page);
  check('9 ' + goal + ': the reveal asks for a doctor check', re.test(w) && /Please see a doctor soon/.test(w), w.slice(0, 1200));
  check('2 ' + goal + ': the reveal says back every answer she gave', w.indexOf(now) >= 0, w.slice(0, 300));
  check('9 ' + goal + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- every goal and stage starts the right plan ---------- */
for (const [stage, goal, pack, title, step] of [['cycle', 'pms', 'pms', 'A calmer cycle', /Calm breath/], ['cycle', 'heavy', 'heavy', 'Stronger blood', /iron/i], ['pmos', 'weight', 'cycle', 'My healthy body plan', /Half the plate sabzi/], ['ttc', 'ready', 'ttc', 'Getting ready for a baby', /Your before-pregnancy checklist, once a week/],   /* Version 38: its own plan */
  ['preg', 'nausea', 'preg', 'My pregnancy plan', /For nausea in pregnancy/], ['post', 'pelvic', 'post', 'My recovery plan', /Pelvic floor trainer/], ['mid', 'hot', 'meno', 'My midlife plan', /For hot flushes/]]) {
  const { ctx, page, errs } = await open({ cfg: LOCAL, seed: null });
  await toOffer(page, stage, goal); await answer(page, { dx: 'n' });
  const v = await revealWords(page); await tap(page, '#pl-rv-go'); const s = await st(page);
  check('goal ' + stage + '/' + goal + ': the "' + title + '" plan starts, and its first step shows', s.mods.plan && s.mods.plan.pack === pack && s.mods.plan.goalKey === goal && v.indexOf(title) >= 0 && step.test(v), [s.mods.plan && s.mods.plan.pack, v.slice(0, 600)]);
  check('goal ' + stage + '/' + goal + ': no page errors', !errs.length, errs);
  await ctx.close();
}
for (const [stage, goal] of [['cycle', 'track']]) {
  const { ctx, page, errs } = await open({ cfg: LOCAL, seed: null });
  await joinAs(page, { tile: stage, goals: [goal], dec: 1990, y: 1999, lp: '24' }); await signUp(page);
  await firstLog(page); await go(page, 'home');
  const s = await st(page);
  check((goal || stage) + ': no plan starts, none is offered after her first log, and Today opens (no reveal)', (await page.evaluate(() => location.hash)) === '#home' && !(s.mods.plan && s.mods.plan.start) && !(await has(page, '#pl-off-go')), [s.mods.plan, await page.evaluate(() => location.hash)]);
  await go(page, 'plan');
  check((goal || stage) + ': My plan offers "What do you want to work on?"', /What do you want to work on\?/.test(await view(page)) && (goal !== 'track' || /You’re keeping track/.test(await view(page))));
  check((goal || stage) + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- a woman who joined before Version 37 picks a goal in My plan; and changes it later ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#plan' });
  check('existing woman: My plan opens with "What do you want to work on?"', /What do you want to work on\?/.test(await view(page)) && (await has(page, '[data-pl-pick="pain"]')));
  await tap(page, '[data-pl-pick="pain"]');
  check('existing woman: her goal\'s questions come first (period pain)', /About your period pain/.test(await view(page)));
  await tap(page, '[data-pl-q="pain:pk"]'); await tap(page, '[data-pl-q="painDays:23"]'); await tap(page, '#pl-in-next');
  for (const sel of ['[data-pl-q="act:1"]', '[data-pl-m="lim:none"]', '[data-pl-q="bed:b23"]', '[data-pl-q="work:home"]']) await tap(page, sel);
  await tap(page, '#pl-in-next'); await tap(page, '[data-pl-when="evening"]'); await tap(page, '#pl-in-make');
  check('existing woman: her plan\'s reveal', (await page.evaluate(() => location.hash)) === '#plan-reveal' && /Easier periods/.test(await view(page)));
  await revealWords(page); await tap(page, '[data-rv-at="18:00"]');
  await tap(page, '#pl-rv-go'); await page.evaluate(() => { document.getElementById('sheet-root').innerHTML = ''; });
  let s = await st(page);
  check('existing woman: the plan is on, with a 6 pm reminder', s.mods.plan.pack === 'pain' && s.mods.plan.remAt === '18:00' && s.reminders.some((r) => r.id === 'plan' && r.time === '18:00'));
  await go(page, 'plan'); await tap(page, '#pl-chg');
  check('Change what I work on: the goal screen again', /What do you want to work on first\?/.test(await view(page)));
  check('existing woman: no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10. The tabs and the Help button ---------- */
{
  const { ctx, page, errs } = await open();
  const tabs = await page.$$eval('#tabbar button', (b) => b.map((x) => x.innerText.trim()));
  check('10 four tabs: Today, My plan, Diary, Explore', JSON.stringify(tabs) === '["Today","My plan","Diary","Explore"]', tabs);
  check('10 Help is in the header, not a tab; the language button moved to Me', (await has(page, '#topbar #help-btn')) && !(await has(page, '#topbar [data-langs]')));
  await tap(page, '#help-btn');
  const hs = await page.$eval('#sheet-root', (e) => e.innerText);
  check('10 Help: call 112, see a doctor, when to see a doctor', /Emergency: call 112/.test(hs) && /See a doctor/.test(hs) && /When to see a doctor/.test(hs), hs);
  await tap(page, '#hs-doc');
  check('10 "See a doctor" opens the doctor page', (await page.evaluate(() => location.hash)) === '#ask');
  await tap(page, '#help-btn'); await tap(page, '#hs-guide');
  check('10 "When to see a doctor" opens the safety guide, with a way back', (await page.evaluate(() => location.hash)) === '#help' && (await has(page, '#view .backrow [data-back]')) && /Call 112 now if/.test(await view(page)));
  await go(page, 'care');
  const cv = await view(page);
  check('10 Explore: its heading, search, and Help and safety at the end; no Plans row', /^Explore/.test(cv) && (await has(page, '#care-q')) && (await gos(page, '#view [data-go]')).includes('help') && !(await has(page, '#view .care-plans')));
  check('10 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10b. Explore keeps what Today's old fold had: her stage's quick answers, voice search, and a Qura doctor when
   nothing matches (docs/companion-journey-2026-10-23.md, section 9: "Home fold: remove, to Explore") ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#care', seed: { situation: { pregnant: true, pregnantSince: ago(170) }, events: [] } });
  const qa = await page.$$eval('#view .qa-sec .qa-tile', (b) => b.map((x) => x.innerText.trim()));
  check('10b pregnant: Explore has her questions, Danger signs first', qa[0] === 'Danger signs' && qa.length >= 4 && /Your questions/.test(await view(page)), qa);
  const order = await page.evaluate(() => [...document.querySelectorAll('#view h2')].map((x) => x.innerText));
  /* Version 39.2: the topics heading is "Topics for you" (her stage's topics, then All topics) */
  check('10b her questions come after For you and before the topics', order.indexOf('Your questions') > order.indexOf('For you') && order.indexOf('Your questions') < order.indexOf('Topics for you'), order);
  await tap(page, '#view .qa-sec .qa-tile');
  check('10b one tap opens the answer', /go now, not tomorrow/i.test(await page.$eval('#sheet-root', (e) => e.innerText).catch(() => '')));
  await page.evaluate(() => window.Saathi.closeSheet()); await settle(page);
  check('10b Today has no ask box or quick answers', await (async () => { await go(page, 'home'); return !(await has(page, '#view .qa-sec')) && !(await has(page, '#home-q')); })());
  await go(page, 'care');
  await page.evaluate(() => { window.SakhiAndroid.listen = (l, p) => { window.__heard = [l, p]; setTimeout(() => window.__sakhiHeard('iron tablets'), 20); }; window.Saathi.render(); }); await settle(page);
  check('10b on Android, the search box has Speak', await has(page, '#care-q-mic'));
  await tap(page, '#care-q-mic'); await settle(page, 300);
  check('10b what she says becomes the search', (await page.$eval('#care-q', (e) => e.value)) === 'iron tablets' && (await gos(page, '#view .care-sec [data-go]'))[0] === 'iron', await gos(page, '#view .care-sec [data-go]'));
  await page.fill('#care-q', 'zzqqxx'); await settle(page, 300);
  check('10b nothing matches: ask a Qura doctor about it', /No match/.test(await view(page)) && (await has(page, '#view [data-ask="zzqqxx"]')));
  await page.fill('#care-q', ''); await page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); window.Saathi.render(); }); await settle(page);
  check('10b discreet mode: no quick answers in Explore', !(await has(page, '#view .qa-sec')));
  check('10b no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 11. A shared phone (discreet mode) ---------- */
{
  const { ctx, page, errs } = await open({ seed: { settings: { discreet: true, toursAuto: false } } });
  await setPlan(page, planOf('pms', 'pms', ago(3)), { stage: 'cycle', goal: 'pms', pms: ['mood'] }); await go(page, 'home');
  const td = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('11 discreet: Today says "Today", no name, no plan name', /^Today/.test(td) && !/Riya|calmer|cycle/i.test(td), td);
  await go(page, 'plan-checkin');
  check('11 discreet: the check-in names no health goal', !/calmer|period|PMOS/i.test(await view(page)), (await view(page)).slice(0, 300));
  await go(page, 'plan');
  check('11 discreet: My plan is called "My plan"', /^My plan/.test(await view(page)));
  check('11 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 12. Every sample woman's Today stays short ---------- */
for (const who of ['priya', 'asha', 'meera', 'sunita', 'kamla']) {
  const { ctx, page, errs } = await open({ sample: who });
  const n = await page.$$eval('#view > *', (x) => x.length);
  const vis = await page.$$eval('#view .slot > .card', (x) => x.length);
  check('12 ' + who + ': Today has at most 8 blocks and one card in the slot', n <= 8 && vis <= 1, [n, vis]);
  check('12 ' + who + ': no fold, setup card or doctor banner of their own', !(await has(page, '#view .home-more')) && !(await has(page, '#view > .setup-card')) && !(await has(page, '#view .qura-card')));
  await go(page, 'plan');
  check('12 ' + who + ': My plan opens', /My plan|plan/i.test(await view(page)));
  check('12 ' + who + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- a light plan's one-tap step, and Hindi ---------- */
{
  const { ctx, page, errs } = await open({ now: '2026-10-23T10:00:00+05:30' });
  await setPlan(page, planOf('heavy', 'heavy', ago(2)), { stage: 'cycle', goal: 'heavy', pads: 'p23' });
  await page.evaluate(() => window.Saathi.reminders.upsert({ id: 'plan', mod: 'plan', title: { en: 'Your plan for today', hi: 'आज का आपका प्लान' }, start: '2026-10-20', every: 1, time: '20:00', on: true }));
  await go(page, 'home');
  const td = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('heavy: day 3\'s iron food step from the doctor-reviewed list', /Lemon on your dal/.test(td), td);
  await tap(page, '#view .today-plan-iron [data-today-act]');
  const s = await st(page);
  check('heavy: one tap keeps it and the reminder knows today is done', s.mods.plan.log[TODAY].ck.iron === 'd' && s.reminders.find((r) => r.id === 'plan').doneOn === TODAY);
  await page.evaluate(() => { const S = window.Saathi; S.state.lang = 'hi'; S.save(); });
  const raw = [];
  for (const r of ['home', 'plan', 'plan-checkin', 'plan-reveal']) { await go(page, r); const v = await view(page); const m = v.match(/plan_[a-z0-9_]+|slot_[a-z]+|hs_[a-z0-9]+|today_hi_[a-z]/); if (m) raw.push(r + ': ' + m[0]); }
  await go(page, 'plan');
  check('Hindi: My plan in Hindi', /ख़ून की ताक़त/.test(await view(page)) && /आज के क़दम/.test(await view(page)), (await view(page)).slice(0, 200));
  check('Hindi: no raw string keys', !raw.length, raw);
  await shot(page, 'hi-plan');
  check('heavy/Hindi: no page errors', !errs.length, errs);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'OK: all ') + results.length + ' checks passed  (screenshots: test/shots/companion)');
process.exit(failed.length ? 1 : 0);
