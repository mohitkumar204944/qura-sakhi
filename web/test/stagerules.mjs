// Version 39.65, the stage-change rules (Mohit, 3 Nov: "proceed with the stage-change rules"; docs/personal-companion-advice-2026-11-03.md,
// 4.11; the case: Priya, 22, on My period plan, picks a midlife stage):
// - 1 under 40, "Periods changing after 40" asks what is happening: irregular (Tracking, her goal irregular), stopped, or a mistake;
// - 2 under 40, "My periods have stopped": the POI line with a Qura doctor first and the gynaecologist, a test first if she could be
//   pregnant; her cycle keeps counting and her plan runs on, with the POI card leading Sakhi says, until "My doctor says my periods
//   have stopped";
// - 3 from 40, a period in the last 6 weeks asks whether they stopped since; never from the period she is on;
// - 4 a period after "stopped" asks "Have your periods come back?" (Yes first under 40 within 4 months);
// - 5 Undo on "Updated", "Changed by mistake" for every stage, and a plan started on the mistake (3 days or less) gives way to her
//   earlier plan at its own week;
// - 6 no midlife plan offered under 40; one truth: no next-period countdown in the Diary while her periods change after 40;
// - 7 Hindi at 360 px; no page errors.
// Usage: node test/stagerules.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-03';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.65-demo', platform: 'android' };
/* periods every 28 days, 5 days long; the last started `last` days ago */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
/* on day 3 of a period: it started 2 days ago, and no end is logged yet */
const day3 = () => regular(30).concat([{ d: ago(2), t: 'start' }]);
const ANS = { stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], pain: 'pk', painDays: '23', endo: 'n', pads: 'p23', clots: 'n', tired: 'n', pms: ['mood', 'irr'], pmsLevel: 'little', when: 'dinner' };
const planOf = (g, startAgo, extra) => Object.assign({ pack: g, goalKey: g, start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', intake: Object.assign({ goal: g }, ANS) }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '2004-03-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, goals: ['pain', 'track'], intake: { goal: 'pain', stage: 'cycle' }, events: day3(), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* Priya, 22, on day 3 of a period, in week 2 of My period plan */
const PRIYA = { mods: { plan: planOf('pain', 9) }, reminders: [planRem(9)] };

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
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const sit = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.situation)));
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const stage = async (page, k) => { await go(page, 'home'); await tap(page, '#stage-btn'); await tap(page, '#sheet-root [data-stage="' + k + '"]'); };
const sheetTxt = (page) => txt(page, '#sheet-root');

/* ---------- 1. Under 40, "Periods changing after 40" asks first ---------- */
{
  let a = await open({ seed: PRIYA }); const s0 = await sit(a.page);
  await stage(a.page, 'mid');
  check('1 at 22, "Periods changing after 40" asks what is happening', /This is for women around 40 and older/.test(await sheetTxt(a.page)) && (await a.page.$$('#sheet-root [data-st-age]')).length === 3, await sheetTxt(a.page));
  await tap(a.page, '#sheet-root #st-save');
  check('1 ... Save waits for her answer', await has(a.page, '#sheet-root [data-st-age]') && JSON.stringify(await sit(a.page)) === JSON.stringify(s0));
  await tap(a.page, '#sheet-root [data-st-age="oops"]');
  check('1 "I tapped it by mistake": nothing changes', !(await has(a.page, '#sheet-root .sheet')) && JSON.stringify(await sit(a.page)) === JSON.stringify(s0));
  await stage(a.page, 'mid'); await tap(a.page, '#sheet-root [data-st-age="irr"]');
  check('1 "My periods have become irregular": Tracking is chosen', await has(a.page, '#sheet-root [data-stage="cycle"].on'));
  await tap(a.page, '#sheet-root #st-save'); const x1 = await st(a.page);
  check('1 ... saved on Tracking, with irregular periods as her goal, no midlife', x1.goals[0] === 'irregular' && !x1.situation.midlife && !x1.situation.stopped, [x1.goals, x1.situation]);
  await done(a);
}

/* ---------- 2. Under 40, "My periods have stopped": her doctor first, her cycle keeps counting ---------- */
{
  let a = await open({ seed: PRIYA });
  await stage(a.page, 'meno');
  const sh = await sheetTxt(a.page);
  check('2 at 22, "My periods have stopped": the POI line, a Qura doctor first, the gynaecologist, a test first, and her cycle still counting', /not menopause/.test(sh) && /Ask a Qura doctor/.test(sh) && /See a gynaecologist/.test(sh) && /Take a test first/.test(sh) && /keeps counting your cycle/.test(sh) && (await a.page.$eval('#sheet-root .st-poi .btn', (e) => e.innerText.trim())) === 'Ask a Qura doctor', sh);
  await tap(a.page, '#sheet-root #st-save'); const x = await sit(a.page);
  check('2 ... saved as said, not as stopped: her cycle keeps counting', x.stopAsk === TODAY && !x.stopped && !x.midlife, x);
  const v = await view(a.page);
  check('2 ... Today: her period buttons, no "CYCLE COUNTING IS OFF", her plan runs on', !/CYCLE COUNTING IS OFF/i.test(v) && /Period started|Period ended/.test(v) && /MY PERIOD PLAN/i.test(v), v.slice(0, 400));
  check('2 ... the POI card leads Sakhi says, and no midlife plan is offered', await has(a.page, '#view .pl-m2-poi') && !/My midlife plan may fit now/.test(v), v.slice(0, 600));
  const btn = await a.page.$$eval('#view .pl-m2-poi .btn', (b) => b.map((x) => x.innerText.trim()));
  check('2 ... the card: Ask a Qura doctor, See a gynaecologist, then her doctor\'s answer', btn[0] === 'Ask a Qura doctor' && btn[1] === 'See a gynaecologist' && btn.indexOf('My doctor says my periods have stopped') >= 0, btn);
  await tap(a.page, '#view #pl-m2-poi-stop'); const x2 = await sit(a.page);
  check('2 "My doctor says my periods have stopped": now they count as stopped, from her last period', x2.stopped && x2.midlife && !x2.stopAsk && x2.stoppedOn >= ago(2) && x2.poiOk === TODAY, x2);
  await done(a);
}

/* ---------- 3. From 40, a period in the last 6 weeks asks first ---------- */
{
  let a = await open({ seed: { dob: '1978-03-01', situation: { care: 'private', midlife: true }, goals: ['hot'], intake: {}, events: day3() } });
  await stage(a.page, 'meno');
  check('3 at 48, on day 3 of a period: "You logged a period on ... Have your periods stopped since then?"', /You logged a period on .* Have your periods stopped since then\?/.test(await sheetTxt(a.page)), await sheetTxt(a.page));
  await tap(a.page, '#sheet-root #st-save');
  check('3 ... Save waits for her answer', !(await sit(a.page)).stopped && await has(a.page, '#sheet-root [data-st-last]'));
  await tap(a.page, '#sheet-root [data-st-last="n"]');
  check('3 "No, not yet": "Periods changing after 40" is chosen', await has(a.page, '#sheet-root [data-stage="mid"].on'));
  await tap(a.page, '#sheet-root [data-stage="meno"]'); await tap(a.page, '#sheet-root [data-st-last="y"]'); await tap(a.page, '#sheet-root #st-save'); const x = await sit(a.page);
  check('3 "Yes": stopped, but never from the period she is on (counted from 9 days after its start)', x.stopped && x.stoppedOn >= ago(2 - 9), x);
  await done(a);
}

/* ---------- 4. A period after "stopped" asks first ---------- */
{
  const SUN = { dob: '1972-02-01', situation: { care: 'private', stopped: true, midlife: true, stoppedOn: ago(400) }, goals: ['hot'], intake: {}, events: regular(400) };
  let a = await open({ seed: SUN });
  await tap(a.page, '#view [data-log="start"]');
  const first = await a.page.$eval('#sheet-root .stack .btn', (e) => e.id).catch(() => '');
  check('4 at 54, her bleeding saved: "Your period came. Have your periods come back?", "No" first', /Have your periods come back\?/.test(await sheetTxt(a.page)) && first === 'pb-n', [await sheetTxt(a.page), first]);
  await tap(a.page, '#sheet-root #pb-n');
  check('4 ... "No": the doctor line, as before', /Any bleeding now needs a check with a doctor/.test(await txt(a.page, '#toast-root')) && (await sit(a.page)).stopped);
  await done(a);
  a = await open({ seed: SUN });
  await tap(a.page, '#view [data-log="start"]');
  await tap(a.page, '#sheet-root #pb-y'); const x = await sit(a.page);
  check('4 "Yes, they\'ve come back": her cycle counts again, from 40 as "Periods changing after 40"', !x.stopped && !x.stoppedOn && x.midlife && /counts your cycle again/.test(await txt(a.page, '#toast-root')), x);
  await done(a);
  a = await open({ seed: Object.assign({}, PRIYA, { situation: { care: 'private', stopped: true, midlife: true, stoppedOn: ago(40), poiOk: ago(30) }, events: regular(70) }) });
  await tap(a.page, '#view [data-log="start"]');
  check('4 at 22, 6 weeks after the stop: "Yes" first', (await a.page.$eval('#sheet-root .stack .btn', (e) => e.id).catch(() => '')) === 'pb-y');
  await done(a);
}

{
  /* under 40, after she said they stopped (her cycle still counting), a period asks too, Yes first */
  const a = await open({ seed: Object.assign({}, PRIYA, { situation: { care: 'private', stopAsk: ago(30) }, events: regular(32) }) });
  await tap(a.page, '#view [data-log="start"]');
  check('4 at 22, a period after "my periods have stopped" (not yet seen by a doctor): it asks, Yes first', /Have your periods come back\?/.test(await sheetTxt(a.page)) && (await a.page.$eval('#sheet-root .stack .btn', (e) => e.id).catch(() => '')) === 'pb-y');
  await tap(a.page, '#sheet-root #pb-y');
  check('4 ... "Yes": the POI card goes, her cycle counts as before', !(await sit(a.page)).stopAsk && !(await has(a.page, '#view .pl-m2-poi')));
  await done(a);
}

/* ---------- 5. Undo, and "Changed by mistake" ---------- */
{
  let a = await open({ seed: { dob: '1995-03-01', situation: { care: 'private' }, goals: ['pain', 'track'], events: regular(12) } }); const s0 = await sit(a.page);   /* 31: her stage is Tracking */
  await stage(a.page, 'ttc'); await tap(a.page, '#sheet-root #st-save');
  check('5 "Updated" has Undo', /Updated/.test(await txt(a.page, '#toast-root')) && await has(a.page, '#toast-root [data-ta]'));
  await a.page.evaluate(() => { const b = [...document.querySelectorAll('#toast-root [data-ta]')].find((x) => /Undo/.test(x.innerText)); if (b) b.click(); }); await settle(a.page, 400);
  const x1 = await sit(a.page);
  check('5 ... Undo puts her stage back', JSON.stringify(x1) === JSON.stringify(s0) && /Back to “Tracking my periods”/.test(await txt(a.page, '#toast-root')), [x1, s0]);
  await stage(a.page, 'ttc'); await tap(a.page, '#sheet-root #st-save'); await go(a.page, 'home'); await tap(a.page, '#stage-btn');
  check('5 the next days: "Changed by mistake? Back to “Tracking my periods”" in the stage sheet', /Changed by mistake\? Back to “Tracking my periods”/.test(await sheetTxt(a.page)));
  await tap(a.page, '#sheet-root #st-undo');
  check('5 ... it puts her stage back', !(await sit(a.page)).planning);
  await done(a);
  /* a plan she started on the mistake gives way to the plan she had, at its own week */
  const prev = planOf('pain', 12); delete prev.log;
  a = await open({ seed: Object.assign({ dob: '1980-03-01', situation: { care: 'private', midlife: true }, goals: ['hot', 'pain'], events: regular(12), reminders: [planRem(1)] }, {
    mods: { plan: Object.assign(planOf('meno', 1), { goalKey: 'hot', prevPlan: prev }) },
    stageWas: { at: ago(1), st: 'cycle', sit: { care: 'private' }, goals: ['pain', 'track'], focus: null, exAsked: null } }) });
  await go(a.page, 'home'); await tap(a.page, '#stage-btn'); await tap(a.page, '#sheet-root #st-undo');
  const pl = (await st(a.page)).mods.plan;
  check('5 a plan started on the mistake (1 day): her period plan comes back at its own week', pl.pack === 'pain' && pl.start === ago(12) && !(await sit(a.page)).midlife, [pl.pack, pl.start]);
  await done(a);
}

/* ---------- 6. Only a plan that fits her age; one truth ---------- */
{
  let a = await open({ seed: Object.assign({}, PRIYA, { situation: { care: 'private', midlife: true } }) });
  check('6 at 22 with an older "midlife" answer: no "My midlife plan may fit now"', !/My midlife plan may fit now/.test(await view(a.page)));
  await done(a);
  a = await open({ seed: { dob: '1980-03-01', situation: { care: 'private', midlife: true }, goals: ['hot'], events: regular(10) }, hash: '#diary' });
  await a.page.evaluate(() => window.Saathi.openDay && window.Saathi.openDay(window.Saathi.toISO(window.Saathi.today()))); await settle(a.page, 400);
  check('6 at 46, periods changing: the Diary has no next-period countdown, as Today', !/until your next period/.test(await sheetTxt(a.page) + ' ' + await view(a.page)));
  await done(a);
}

/* ---------- 7. Hindi at 360 px ---------- */
{
  const a = await open({ seed: Object.assign({}, PRIYA, { lang: 'hi' }) });
  await stage(a.page, 'mid');
  check('7 Hindi: the question for her age, at 360 px', /40 और उससे ज़्यादा/.test(await sheetTxt(a.page)) && await noScroll(a.page));
  await tap(a.page, '#sheet-root [data-st-age="stop"]');
  check('7 Hindi: the POI line and her doctors', /मेनोपॉज़ नहीं/.test(await sheetTxt(a.page)) && /Qura की डॉक्टर से पूछें/.test(await sheetTxt(a.page)) && await noScroll(a.page));
  await done(a);
}

check('7 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const fails = results.filter((r) => !r.pass).length;
console.log((fails ? '' : 'page errors none | ') + (results.length - fails) + '/' + results.length + ' passed');
process.exit(fails ? 1 : 0);
