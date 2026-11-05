// Version 39.25: insights she can find, and a free plan beside the doctor (Mohit, 27 Oct: "in diary i added past 3 months of
// period dates and i see no insights when is expected ovulation and fertile period when could be next period", "do a proper
// audit", "if user is not on any plan but symptoms show then advise to start a relevant free plan along with doctor advise",
// "go ahead and build it and dont offer free government doctor let it be in explore section"; the audit:
// docs/insights-audit-2026-10-27.md; the mockup: claude.ai/artifact/GkhV6csPv6vqrrQMt34sbw; MODULE_API section 68). This file checks:
//   1 G1, the reason line on Today and the Calendar, from one engine (whyNot): hormones, a guessed start, too few gaps, gaps
//     too far apart; each with its one tap (Me's health, that period's dates, "Add a past period", how Sakhi counts); none
//     when a date shows, in midlife (Today shows no dates there), on a shared phone or in discreet mode;
//   2 G2, "What Sakhi can tell you" on Cycles: the next date, fertile days and what repeats, each with what it needs; one
//     "Add a past period"; gone once nothing is missing;
//   3 G3, on hormones: the pill card (reminder, "Missed a pill?", a Qura doctor, "Change it in Me") in place of dates;
//   4 G4, a guessed start: a "?" on the calendar, "Is 1 Oct your real start?" (Yes counts it, Fix the date opens its dates),
//     and "Is it right?" in My cycles;
//   5 G5, "Period late?" under her cycle without a plan too (not on a shared phone or in discreet mode);
//   6 G6, G7, What your diary shows: "Ask a Qura doctor about this" first, no "Free government doctor" on a week or month
//     card, "Free doctor or hospital" kept on a "today" card, and "And meanwhile, a free plan" with the right 12-week plan
//     while no plan runs (none with a plan, in discreet mode, or in a pregnancy); Start opens that plan's questions;
//   7 English and Hindi at 360 px, and no page errors;
//   8 with a plan running: the reason line in her cycle card, her plan's first step still on the first screen, no second plan.
// Usage: node test/whynot.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'whynot'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.25-pilot', platform: 'android' };
/* periods `gaps` apart (oldest first), the last one `last` days ago, `len` days each */
const periods = (last, gaps, len) => { const out = []; let x = last + gaps.reduce((a, b) => a + b, 0); [0].concat(gaps).forEach((g) => { x -= g; out.push({ d: ago(x), t: 'start' }, { d: ago(x - (len || 5) + 1), t: 'end' }); }); return out; };
const regular = (last, n) => periods(last, Array(n || 2).fill(28));
const planOf = (startAgo) => ({ pack: 'cycle', goalKey: 'irregular', start: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'track' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

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
  await page.clock.install({ time: at('09:30') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const sheet = (page) => page.$eval('#sheet-root', (e) => e.innerText.replace(/\s+/g, ' ')).catch(() => '');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const hashOf = (page) => page.evaluate(() => location.hash.slice(1));
const cycles = async (page) => { await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; }); await go(page, 'diary'); };
const calendar = async (page) => { await page.evaluate(() => { window.Saathi.mem.diaryTab = 'cal'; window.Saathi.mem.calMonth = null; }); await go(page, 'diary'); };
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const whyK = (page) => page.$eval('#view .hero .why-row', (e) => e.dataset.whyK).catch(() => null);

/* ---------- 1 G1: the reason line ---------- */
{
  /* a date shows: no reason line */
  const a = await open();
  check('1 regular cycles: no reason line on Today', !(await has(a.page, '#view .why-row')));
  await calendar(a.page);
  check('1 regular cycles: no reason line on the Calendar', !(await has(a.page, '#view .why-row')));
  await done(a);
}
{
  /* hormones: Sakhi doesn't predict; "Not on it now? Change it" opens Me's health */
  const a = await open({ seed: { situation: { hormones: true, hormonesSince: ago(200) }, events: periods(12, [28, 28]) } });
  const hero = await txt(a.page, '#view .hero');
  check('1 hormones: the reason line', (await whyK(a.page)) === 'hormones' && /You take the pill or another hormone medicine\. Your bleeds follow it, so Sakhi doesn’t predict periods or fertile days\./.test(hero), hero);
  check('1 hormones: no "counts, not a guessed date" note beside it', !/When gaps change a lot/.test(hero));
  await shot(a.page, 'reason-hormones');
  await tap(a.page, '#view .hero [data-why="hormones"]');
  check('1 hormones: "Not on it now? Change it" opens Me’s health', (await hashOf(a.page)) === 'me-health', await hashOf(a.page));
  await calendar(a.page);
  check('1 hormones: the reason line on the Calendar too', await has(a.page, '#view .cal-today .why-row[data-why-k="hormones"]'));
  await done(a);
}
{
  /* too few gaps: one period; then two */
  const a = await open({ seed: { events: periods(10, []) } });
  const hero = await txt(a.page, '#view .hero');
  check('1 one period: "2 more period starts"', (await whyK(a.page)) === 'few' && /2 more period starts and your next period date shows\./.test(hero), hero);
  await tap(a.page, '#view .hero [data-why="few"]');
  check('1 one period: "Add a past period" opens its sheet', await has(a.page, '#sheet-root #ap-save'), await sheet(a.page));
  await done(a);
  const b = await open({ seed: { events: periods(10, [29]) } });
  const h2 = await txt(b.page, '#view .hero');
  check('1 two periods: "1 more period start"', /1 more period start and your next period date shows\./.test(h2), h2);
  await calendar(b.page);
  check('1 two periods: the reason line on the Calendar', await has(b.page, '#view .cal-today .why-row[data-why-k="few"]'));
  await done(b);
}
{
  /* gaps too far apart: counts, not a date; "What this means" opens how Sakhi counts */
  const a = await open({ seed: { events: periods(4, [34, 23]) } });
  const hero = await txt(a.page, '#view .hero');
  check('1 irregular: "vary from 23 to 34 days"', (await whyK(a.page)) === 'irregular' && /Your gaps vary from 23 to 34 days, so Sakhi shows counts, not a date\./.test(hero), hero);
  check('1 irregular: the general note gives way to it', !/When gaps change a lot we show counts/.test(hero));
  await tap(a.page, '#view .hero [data-why="irregular"]');
  check('1 irregular: "What this means" opens What your diary shows', (await hashOf(a.page)) === 'explain', await hashOf(a.page));
  await done(a);
}
{
  /* a guessed start (Mohit's diary: 1 Oct guessed, real starts before it) */
  const ev = [{ d: '2026-08-04', t: 'start' }, { d: '2026-08-08', t: 'end' }, { d: '2026-09-07', t: 'start' }, { d: '2026-09-11', t: 'end' }, { d: '2026-10-01', t: 'start', approx: true }];
  const a = await open({ seed: { events: ev } });
  const hero = await txt(a.page, '#view .hero');
  check('1 a guess: "Your 1 Oct start is a guess"', (await whyK(a.page)) === 'guess' && /Your 1 Oct start is a guess, so it isn’t counted\. One real date and Sakhi can count this gap\./.test(hero), hero);
  check('1 a guess: the old approx note gives way to it', !/Tap the day it really started/.test(hero));
  await shot(a.page, 'reason-guess');
  await tap(a.page, '#view .hero [data-why="guess"]');
  check('1 a guess: "Fix the date" opens that period’s dates', await a.page.$eval('#sheet-root #ed-s', (e) => e.value).catch(() => '') === '2026-10-01', await sheet(a.page));
  await done(a);
}
{
  /* a shared phone and discreet mode: no reason line */
  const a = await open({ seed: { events: periods(10, []), settings: { shared: true } } });
  check('1 a shared phone: no reason line', !(await has(a.page, '#view .why-row')));
  await done(a);
  const b = await open({ seed: { events: periods(10, []), settings: { discreet: true } } });
  check('1 discreet mode: no reason line', !(await has(b.page, '#view .why-row')));
  await done(b);
}

{
  /* midlife (47): Today shows no dates by design, so no reason line and no "What Sakhi can tell you" */
  const a = await open({ seed: { dob: '1979-03-01', events: periods(4, [34, 23]) } });
  check('1 midlife: no reason line on Today', !(await has(a.page, '#view .why-row')));
  await calendar(a.page);
  check('1 midlife: none on the Calendar', !(await has(a.page, '#view .why-row')));
  await cycles(a.page);
  check('2 midlife: no "What Sakhi can tell you"', !(await has(a.page, '#view .kn-card')));
  await done(a);
}

/* ---------- 2 G2: What Sakhi can tell you ---------- */
{
  const a = await open({ seed: { events: periods(10, [29]) } });
  await cycles(a.page);
  const kn = await txt(a.page, '#view .kn-card');
  check('2 one gap: What Sakhi can tell you', /What Sakhi can tell you/.test(kn) && /Next period date Needs 2 regular gaps · you have 1/.test(kn), kn);
  check('2 one gap: fertile days need 6 gaps', /Fertile days and ovulation \(estimate\) Needs 6 regular gaps of 21–35 days · you have 1/.test(kn), kn);
  check('2 one gap: what repeats needs notes on 3 periods', /What repeats for you Notes on 3 periods · 0 so far/.test(kn), kn);
  const adds = await a.page.$$eval('#view #ap-add', (l) => l.map((e) => !!e.closest('.kn-card')));
  check('2 one "Add a past period", in this card', adds.length === 1 && adds[0], adds);
  check('2 the "What repeats" waiting card gives way to it', !(await has(a.page, '#view .pat-card.soft')));
  const order = await a.page.evaluate(() => { const k = document.querySelector('#view .kn-card'), m = document.querySelector('#view .mc-card'); return !!(k && m && (k.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING)); });
  check('2 above My cycles', order);
  await tap(a.page, '#view .kn-card #ap-add');
  check('2 its button opens "Add a past period"', await has(a.page, '#sheet-root #ap-save'));
  await shot(a.page, 'know-en');
  await done(a);
}
{
  /* steady gaps: the next date is in; fertile days still need 6 */
  const a = await open({ seed: { events: regular(10, 3) } });
  await cycles(a.page);
  const kn = await txt(a.page, '#view .kn-card');
  check('2 three gaps: the next date is done', await has(a.page, '#view .kn-next.ok') && /Next period date Likely/.test(kn), kn);
  check('2 three gaps: fertile days need 6', /you have 3/.test(kn) && !(await has(a.page, '#view .kn-fert.ok')), kn);
  await done(a);
}
{
  /* nothing missing: 6 steady gaps and notes on 3 periods */
  const ev = regular(10, 6); const daily = {}; ev.filter((e) => e.t === 'start').slice(-3).forEach((e) => { daily[iso(e.d, -1)] = ['d_cramps']; daily[e.d] = ['d_cramps']; });
  const a = await open({ seed: { events: ev, daily: daily } });
  await cycles(a.page);
  check('2 nothing missing: no card', !(await has(a.page, '#view .kn-card')), await txt(a.page, '#view .kn-card'));
  await done(a);
}

/* ---------- 3 G3: the pill card ---------- */
{
  const a = await open({ seed: { situation: { hormones: true, hormonesSince: ago(200) }, events: periods(12, [28, 28]) } });
  await cycles(a.page);
  const pc = await txt(a.page, '#view .pill-card');
  check('3 the pill card', /Your pill and your bleeds/.test(pc) && /Sakhi doesn’t predict periods or fertile days/.test(pc) && /bleeding between packs, spotting, headaches or mood changes/.test(pc), pc);
  check('3 her reminder and "Missed a pill?"', await has(a.page, '#view .pill-card [data-go="contra-mine"]') && await has(a.page, '#view .pill-card [data-go="contra-missed"]'), pc);
  check('3 a Qura doctor for bleeding between packs', /Bleeding between packs for 3 months, or side effects that worry you\?/.test(pc) && await has(a.page, '#view .pill-card [data-ask]'), pc);
  check('3 no "What Sakhi can tell you" rows', !(await has(a.page, '#view .kn-row')));
  await tap(a.page, '#view .pill-card .pill-chg');
  check('3 "Not on it now? Change it in Me" opens Me’s health', (await hashOf(a.page)) === 'me-health');
  await done(a);
}

/* ---------- 4 G4: a guessed start ---------- */
{
  /* steady gaps once 1 Oct counts (28 and 28 days); Mohit's own dates (34 and 24) would give the next reason, "gaps vary" */
  const ev = [{ d: '2026-08-06', t: 'start' }, { d: '2026-08-10', t: 'end' }, { d: '2026-09-03', t: 'start' }, { d: '2026-09-07', t: 'end' }, { d: '2026-10-01', t: 'start', approx: true }];
  const a = await open({ seed: { events: ev } });
  await calendar(a.page);
  check('4 a "?" on 1 Oct', await has(a.page, '#view .cal [data-day="2026-10-01"].guess .gq'));
  const box = await txt(a.page, '#view .guess-box');
  check('4 "Is 1 Oct your real start?"', /Is 1 Oct your real start\?/.test(box) && /It’s saved as a guess, so it isn’t counted in your gaps\./.test(box), box);
  check('4 no second reason line above it', !(await has(a.page, '#view .cal-today .why-row')));
  await tap(a.page, '#view .guess-box [data-guess-ok]');
  const ap = await a.page.evaluate(() => window.Saathi.state.events.some((e) => e.t === 'start' && e.d === '2026-10-01' && e.approx));
  check('4 "Yes, it’s right" counts the date', !ap && !(await has(a.page, '#view .guess-box')));
  await go(a.page, 'home');
  check('4 then Today has a date, not a reason', !(await has(a.page, '#view .why-row')) && /Likely|days until|next period/i.test(await txt(a.page, '#view .hero')), await txt(a.page, '#view .hero'));
  await done(a);
  const b = await open({ seed: { events: ev } });
  await cycles(b.page);
  check('4 "Is it right?" in My cycles', await has(b.page, '#view .mc-card [data-guess="2026-10-01"]'));
  await tap(b.page, '#view .mc-card [data-guess="2026-10-01"]');
  check('4 it asks', /Is 1 Oct your real start\?/.test(await sheet(b.page)));
  await tap(b.page, '#sheet-root [data-guess-fix]');
  check('4 "Fix the date" opens its dates', await b.page.$eval('#sheet-root #ed-s', (e) => e.value).catch(() => '') === '2026-10-01', await sheet(b.page));
  await done(b);
}

/* ---------- 5 G5: "Period late?" without a plan ---------- */
{
  const a = await open({ seed: { events: regular(40, 3) } });
  check('5 late, no plan: "Period late?" under her cycle', await has(a.page, '#view .hero .hl-late-go'), await txt(a.page, '#view .hero'));
  await shot(a.page, 'late-noplan');
  await done(a);
  const b = await open({ seed: { events: regular(40, 3), settings: { shared: true } } });
  check('5 a shared phone: no "Period late?" row', !(await has(b.page, '#view .hero .hl-late-go')));
  await done(b);
  const c = await open({ seed: { events: regular(40, 3), settings: { discreet: true } } });
  check('5 discreet mode: no "Period late?" row', !(await has(c.page, '#view .hero .hl-late-go')));
  await done(c);
}

/* ---------- 6 G6, G7: a Qura doctor first, and a free plan beside it ---------- */
const longPeriod = () => { const ev = regular(30, 2); ev[ev.length - 1] = { d: ago(20), t: 'end' }; return ev; };   /* the last period lasted 11 days */
{
  const a = await open({ seed: { events: longPeriod() }, hash: 'explain' });
  const card = await txt(a.page, '#view .xp-card.xp-week');
  check('6 a week card: "Ask a Qura doctor about this" first', await a.page.$eval('#view .xp-card.xp-week .xp-acts .btn', (e) => e.hasAttribute('data-ask') && e.classList.contains('primary')).catch(() => false), card);
  check('6 no "Free government doctor" on a card', !(await has(a.page, '#view .xp-card [data-go="access-doctor"]')) && !/Free government doctor/.test(await txt(a.page, '#view')));
  const pair = await txt(a.page, '#view .xp-card.xp-week .xp-plan');
  check('6 "And meanwhile, a free plan": Stronger blood', /And meanwhile, a free plan/i.test(card) && /Stronger blood/.test(pair) && /For more iron and easier heavy periods · 12 weeks/.test(pair), pair);
  await shot(a.page, 'pair-en');
  await tap(a.page, '#view .xp-card.xp-week [data-xp-plan="heavy"]');
  const pi = await a.page.evaluate(() => window.Saathi.mem.planIntake || null);
  check('6 Start opens that plan’s questions', (await hashOf(a.page)) === 'plan-goal' && pi && pi.goal === 'heavy', { h: await hashOf(a.page), pi });
  await done(a);
}
{
  /* pain that stopped her day: Easier periods; two long gaps: My cycle plan, or My PMOS plan when she has PMOS */
  const ev = regular(12, 2); ev.find((e) => e.t === 'start' && e.d === ago(12)).pain = 'pain_3';
  const a = await open({ seed: { events: ev }, hash: 'explain' });
  check('6 pain: Easier periods', /Easier periods/.test(await txt(a.page, '#view .xp-card.xp-month .xp-plan')), await txt(a.page, '#view .xp-card.xp-month'));
  await done(a);
  const b = await open({ seed: { events: periods(5, [48, 50]) }, hash: 'explain' });
  check('6 long gaps: My cycle plan', /My cycle plan/.test(await txt(b.page, '#view .xp-plan')) && await has(b.page, '#view [data-xp-plan="irregular"]'), await txt(b.page, '#view .xp-card'));
  await done(b);
  const c = await open({ seed: { events: periods(5, [48, 50]), situation: { pcos: true } }, hash: 'explain' });
  check('6 long gaps with PMOS: My PMOS plan', /My PMOS plan/.test(await txt(c.page, '#view .xp-plan')) && await has(c.page, '#view [data-xp-plan="pmos"]'), await txt(c.page, '#view .xp-card'));
  await done(c);
}
{
  /* the same pair in Diary's What it shows (Cycles) */
  const a = await open({ seed: { events: longPeriod() } });
  await cycles(a.page);
  check('6 What it shows has the pair too', await has(a.page, '#view .xp-dcard .xp-plan [data-xp-plan="heavy"]'));
  await done(a);
}
{
  /* no pair while a plan runs, or in discreet mode */
  const a = await open({ seed: { events: longPeriod(), mods: { plan: planOf(20) } }, hash: 'explain' });
  check('6 a plan runs: no free plan offered', !(await has(a.page, '#view .xp-plan')) && await has(a.page, '#view .xp-card.xp-week [data-ask]'));
  await done(a);
}
{
  /* a "see a doctor today" card keeps "Free doctor or hospital" and offers no plan */
  const a = await open({ seed: { situation: { deliveredOn: ago(20) }, events: regular(330, 2), checkins: { [TODAY.slice(0, 7)]: { chips: ['stitch'], hot: 'hot_0', note: '', at: ago(1), kind: 'post' } } }, hash: 'explain' });
  const tc = await txt(a.page, '#view .xp-card.xp-today');
  check('6 a today card keeps "Free doctor or hospital" (Care near me, Version 39.68)', await has(a.page, '#view .xp-card.xp-today [data-go="access-care"]') && !(await has(a.page, '#view .xp-card.xp-today .xp-plan')), tc);
  await done(a);
}

/* ---------- 8 with a plan running ---------- */
{
  /* her plan runs: the reason line sits in her cycle card above it, and her plan's first step stays on the first screen at
     360 x 800; her plan is untouched, and What your diary shows has the doctor but never a second plan */
  const cases = [['gaps that vary', { events: periods(4, [34, 23]) }, 'irregular'],
    ['hormones on and a guessed 1 Oct (Mohit’s diary)', { situation: { hormones: true, hormonesSince: ago(200) }, events: [{ d: '2026-08-05', t: 'start' }, { d: '2026-08-09', t: 'end' }, { d: '2026-09-08', t: 'start' }, { d: '2026-09-12', t: 'end' }, { d: '2026-10-01', t: 'start', approx: true }] }, 'hormones']];
  for (const [name, seed, k] of cases) {
    const a = await open({ w: 360, h: 800, seed: Object.assign({ mods: { plan: planOf(20) } }, seed) });
    const run = await a.page.evaluate(() => !!(window.Saathi.plan && window.Saathi.plan.running()));
    const f = await a.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const st = document.querySelector('#view .today-card .today-it'); const w = document.querySelector('#view .hero .why-row');
      return { nav: Math.round(nav), step: st ? Math.round(st.getBoundingClientRect().top) : 9999, why: w ? w.dataset.whyK : null }; });
    check('8 ' + name + ': her plan runs and the reason line is in her cycle card', run && f.why === k, { run, f });
    check('8 ' + name + ': her plan’s first step still starts on the first screen (360 x 800)', f.step < f.nav, f);
    check('8 ' + name + ': one line only (no second "Your start date is a guess" note under it)', !(await has(a.page, '#view .hero .approx-note')));
    await shot(a.page, 'plan-' + k + '-360');
    await go(a.page, 'explain');
    check('8 ' + name + ': no free plan offered beside the doctor', !(await has(a.page, '#view .xp-plan')));
    await done(a);
  }
}

/* ---------- 7 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: { lang: 'hi', events: periods(10, [29]) } });
  const hero = await txt(a.page, '#view .hero');
  check('7 hi: the reason line', /1 और पीरियड की शुरुआत|एक और पीरियड की शुरुआत/.test(hero) && await noScroll(a.page), hero);
  await cycles(a.page);
  const kn = await txt(a.page, '#view .kn-card');
  check('7 hi: सखी आपको क्या बता सकती है', /सखी आपको क्या बता सकती है/.test(kn) && !/kn_/.test(kn) && await noScroll(a.page), kn);
  await shot(a.page, 'know-hi-360');
  await done(a);
  const b = await open({ w: 360, seed: { lang: 'hi', situation: { hormones: true, hormonesSince: ago(200) }, events: periods(12, [28, 28]) } });
  await cycles(b.page);
  const pc = await txt(b.page, '#view .pill-card');
  check('7 hi: the pill card', /आपकी गोली और आपकी ब्लीडिंग/.test(pc) && !/pill_/.test(pc) && await noScroll(b.page), pc);
  await done(b);
  const c = await open({ w: 360, seed: { lang: 'hi', events: longPeriod() }, hash: 'explain' });
  const xp = await txt(c.page, '#view');
  check('7 hi: the free plan beside the doctor', /और तब तक, एक मुफ़्त प्लान/.test(xp) && !/explain_pair/.test(xp) && await noScroll(c.page), xp.slice(0, 300));
  await shot(c.page, 'pair-hi-360');
  await done(c);
  const d = await open({ w: 360, seed: { events: [{ d: '2026-08-04', t: 'start' }, { d: '2026-08-08', t: 'end' }, { d: '2026-09-07', t: 'start' }, { d: '2026-09-11', t: 'end' }, { d: '2026-10-01', t: 'start', approx: true }] } });
  await calendar(d.page);
  check('7 en 360: the calendar with its guess box fits', await noScroll(d.page));
  await shot(d.page, 'guess-en-360');
  await done(d);
}

check('7 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'ALL PASS ') + results.length + ' checks (whynot)');
process.exit(failed.length ? 1 : 0);
