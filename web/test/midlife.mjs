// Version 39.51: My midlife plan, version 2, "Cool, calm and strong" (Mohit, 30 Oct: "start with the midlife plan", then
// "proceed building with your recommendations"; advice docs/midlife-plan-advice-2026-10-30.md; mockup
// claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd; MODULE_API section 94). This file checks:
//   1 a new midlife plan is version 2 (version 1 runs on); "Your day" asks about weak bones and chest pain when she walks, with
//     their lines under the answer;
//   2 Today on day 1: Today's skill, her walk and a calcium food (3 steps), the week's chapter as one row; Strength at home on
//     days 2 and 5, never more than 3 steps (4 with the plate for weight);
//   3 her parts in the order her goal needs: hot flushes (Cool and calm, Rest, Strong and steady), sleep (Rest first; the calm
//     chapters without hot flushes in her diary), mood, bones; in her year, her first part's skill and a Learn article a month;
//   4 the chapter page: its part and number, this week's skill, "Why this works", Done (the row goes, the skill stays); every
//     chapter in English and Hindi; the calm chapter's Tele-MANAS and 112; the hot-flush routine from chapter 3;
//   5 the weekly number in the check-in: from day 7, once a week, 0 to 10, saved; none on day 1, none twice a week, none on a
//     shared phone; Rest asks how she slept for every goal;
//   6 one card at a time: periods stopped before 45 (the reviewed line), week 4 (hormone therapy; her hormone medicine's signs
//     with 112; blood tests for aches), week 12 (her checks after 40); none in discreet mode; version 1 offered version 2 once;
//   7 periods stopped before 40: the reviewed POI line and no plan until "My doctor has seen me";
//   8 chest pain when she walks: Gentle start instead of Strength at home, and My plan's card with 112 until her doctor says;
//     weak bones: My plan's card; My plan's parts in her order;
//   9 her results at day 85, in her own numbers; Steady on your feet on Moves and calm for midlife only, and its player;
//  10 Hindi at 360 px;
//  11 the midlife walk's 12 fixes (test/midlife-walk.mjs; Mohit, 31 Oct: "fix all 12"): before 40 the gynaecologist first whatever
//     joining set, with My plan's goals held; Aches and tiredness offered; her bones and heart answers saved through the real
//     questions and in the summary; version 1 to 2 a fresh 12 weeks; before 45 at 40 to 44 a year after her last period; week 4 by
//     her goal; week 12's words; her year's skill line; the sleep goal's chapters fixed for the part; a new plan's own cards; the
//     balance routine's words; no diary setup prompt while the plan runs;
//  12 the phone test's 6 fixes (Mohit, 31 Oct, on his Flip5: "Fix all 6"): midlife now while a plan for her periods runs offers
//     My midlife plan (Keep keeps hers; heavy periods keep theirs); "Your day" holds her last plan's activity and knees; the
//     reveal names her parts, her chapter and her strength days; "Why this works" has its arrow; the check-in names tomorrow's
//     steps when they change; Moves and calm's Today is her plan's own routine;
//  13 the second phone test's 3 gaps (Mohit, 31 Oct: "fix all 3"): "Your last plan" is never a plan changed on the day it
//     started with no day followed; no repeat Strength at home row in version 2, and while her chest-pain answer waits for her
//     doctor, Gentle start in its place (Moves and calm, its search tile, My plan's line) and no sun salutation; her time to move
//     from the plan she is on, with Change to pick again;
//  14 the third phone test's 2 gaps (Mohit, 31 Oct: "fix both"): "Your last plan" is never a plan changed on the day it
//     started, even after a check-in that day, and a same-day copy of her plan goes at once; "Your day" holds her bones and
//     heart answers from the midlife plan she is on ("My doctor says I can do more" shows No and stays hers);
//  15 the fourth phone test's gap (Mohit, 1 Nov: "fix it"): "Your day" fills in only the questions its own screen asks, and her
//     bones and heart answers only from a midlife plan, so a PMOS plan never keeps them;
//  16 the exploratory phone test's 4 gaps (Mohit, 1 Nov: "fix all 4"): the skill's Why? has its chapter's skill as How and the
//     calcium food no How that repeats its subtitle; "How your plan works" names the weekly chapter; her chapter lights My plan;
//     a plan started after today's check-in asks its own tonight;
//  17 the second exploratory phone test's 3 gaps (Mohit, 1 Nov: "fix all 3"): one "Tomorrow" line in the check-in, and "Tomorrow,
//     add" only for steps tomorrow has; no PMOS plan tile while another plan runs; an undone tick is unanswered again ("Not today"
//     only when her own minutes or a routine she played would tick it back);
//  18 the bone-safe stop-gap (Mohit, 1 Nov: "do the stop-gap"): while a midlife plan runs, or at midlife with no plan, no Cycle
//     care yoga and no sun salutation; a midlife woman who kept her PMOS plan, and a 30-year-old, keep them;
//  19 the discreet path cards (Mohit, 1 Nov: "fix the leak in both plans"): on a shared phone no "Your 12 weeks" card on My midlife
//     plan or on Getting ready, as in a pregnancy;
//  20 her parts on the weeks card (Mohit, 1 Nov: "add the parts to that card too"): from week 2 each week's part in her order, the
//     4-week and 8-week checks and her results kept, and none on a shared phone;
//  21 POI while her plan runs (Mohit, 1 Nov: "card and hold"): under 40 with her periods stopped, the gynaecologist card on Today
//     and My plan, her plan and its reminder resting until "My doctor has seen me"; not at 51, not while periods still come; no
//     page errors.
// Usage: node test/midlife.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'midlife'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Kavita Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.51-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* Kavita, 51, periods stopped, on the midlife plan's version 2 with goal g since day 1 = startAgo + 1 days ago */
const ans = (g, a) => Object.assign({ goal: g, stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' }, a || {});
const m2 = (g, startAgo, px, x) => Object.assign({ dob: '1975-03-01', situation: { stopped: true }, intake: { goal: g, stage: 'meno' }, events: regular(400),
  mods: { plan: planOf('meno', g, startAgo, Object.assign({ pv: 2, intake: ans(g, (px || {}).a) }, px || {})) }, reminders: [planRem(startAgo)] }, x || {});

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
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
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const acts = (page) => page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub || '', go: x.go || '' })));
const skillOf = async (page) => (await acts(page)).find((x) => x.id === 'skill') || null;
const answerSteps = async (page) => { await page.$$eval('#view .pl-ci .chips', (gs) => gs.forEach((g) => { const b = g.querySelector('[data-ci$=":d"]'); if (b) b.click(); })); await settle(page, 200); };
const slotText = (page) => txt(page, '#view .pl-sl-m2');
const B = (d) => d - 1;   /* plan day d starts d - 1 days ago */

// ---------- 1 the version and "Your day" ----------
{
  const a = await open({ seed: m2('hot', B(1)) });
  const sp = await a.page.evaluate(() => { const P = window.Saathi.plan.progs; return { latest: (P.spec('meno') || {}).ver, v1: !!P.spec('meno', 1), list: P.list().filter((x) => x.id === 'meno').map((x) => x.ver) }; });
  check('1 a new midlife plan is version 2, and version 1 runs on', sp.latest === 2 && sp.v1, sp);
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'meno', goal: 'hot', iq: 1 }; }); await go(a.page, 'plan-goal');
  const v = await view(a.page);
  check('1 "Your day" asks about weak bones and chest pain when she walks', /Your day/.test(v) && /said your bones are weak/.test(v) && /Chest pain, fainting, or getting very breathless/.test(v), v.slice(0, 600));
  await tap(a.page, '[data-pl-q="mheart:y"]');
  check('1 chest pain when she walks: see a doctor first, an easy walk, 112 for chest pain now', /see your doctor before you do more/.test(await txt(a.page, '#pl-in-warn')) && /call 112/.test(await txt(a.page, '#pl-in-warn')), await txt(a.page, '#pl-in-warn'));
  await tap(a.page, '[data-pl-q="mheart:n"]'); await tap(a.page, '[data-pl-q="mbone:y"]');
  check('1 weak bones: every move bone-safe, ask about a bone scan', /bone-safe, with no jumps/.test(await txt(a.page, '#pl-in-warn')), await txt(a.page, '#pl-in-warn'));
  await done(a);
}

// ---------- 2 Today: day 1 to 3 ----------
{
  let a = await open({ seed: m2('hot', B(1)) });
  let s = await acts(a.page);
  check('2 day 1: Today’s skill, her walk and a calcium food', s.length === 3 && s[0].id === 'skill' && s[1].id === 'move' && s[2].id === 'ca', s);
  check('2 day 1: Today’s skill is the first chapter’s, and opens it', /Today’s skill: notice it, name it/.test(s[0].title) && s[0].go === 'mid-lesson' && /from this week’s chapter/.test(s[0].sub), s[0]);
  check('2 day 1: the week’s chapter is one row under her steps', (await txt(a.page, '#view .pl-m2-les')).includes('What a hot flush is') && (await a.page.$$('#view .pl-m2-les')).length === 1, await txt(a.page, '#view .pl-m2-les'));
  await shot(a.page, 'day1-today'); await done(a);
  a = await open({ seed: m2('hot', B(2)) }); s = await acts(a.page);
  check('2 day 2: Strength at home in place of the food (3 steps)', s.length === 3 && s.some((x) => x.id === 'str' && x.go === 'plan-r-strength') && !s.some((x) => x.id === 'ca'), s); await done(a);
  a = await open({ seed: m2('hot', B(4)) }); s = await acts(a.page);
  check('2 day 4: Today’s skill and her walk only', s.length === 2, s); await done(a);
  let mx = 0; for (const d of [1, 2, 3, 4, 5, 6, 7]) { a = await open({ seed: m2('hot', B(d)) }); mx = Math.max(mx, (await acts(a.page)).length); await done(a); }
  check('2 never more than 3 steps in her first week', mx <= 3, mx);
  a = await open({ seed: m2('weight', B(1)) }); s = await acts(a.page);
  check('2 weight, day 1: the balance routine, her walk and the plate (3 steps)', s.length === 3 && s[0].go === 'plan-r-steady' && s.some((x) => x.id === 'food'), s); await done(a);
  a = await open({ seed: m2('weight', B(2)) }); s = await acts(a.page);
  check('2 weight, day 2: 4 steps at most', s.length <= 4 && s.some((x) => x.id === 'str'), s); await done(a);
}

// ---------- 3 her parts in her goal's order ----------
{
  const sk = async (g, day, px, x) => { const a = await open({ seed: m2(g, B(day), px, x) }); const s = await skillOf(a.page); const les = await txt(a.page, '#view .pl-les'); await done(a); return { s: s, les: les }; };
  let r = await sk('hot', 29);
  check('3 hot flushes, week 5: Rest’s first sleep rule', r.s && /up at the same time/.test(r.s.title) && /This week’s sleep rule/.test(r.s.sub), r);
  r = await sk('hot', 57);
  check('3 hot flushes, week 9: Steady on your feet, the balance routine', r.s && r.s.kind === 'routine' && r.s.go === 'plan-r-steady' && /Steady on your feet/.test(r.s.title), r);
  r = await sk('sleep', 1);
  check('3 sleep, week 1: Rest first', r.s && /up at the same time/.test(r.s.title), r);
  r = await sk('sleep', 29);
  check('3 sleep, week 5, no hot flushes in her diary: the calm chapters', r.s && /notice your mood/.test(r.s.title), r);
  r = await sk('sleep', 29, null, { daily: { [ago(5)]: ['d_hotflush'] } });
  check('3 sleep, week 5, hot flushes in her diary: Cool and calm', r.s && /notice it, name it/.test(r.s.title), r);
  r = await sk('mood', 1);
  check('3 worry or low mood, week 1: the calm chapters', r.s && /notice your mood/.test(r.s.title) && /Mood in midlife/.test(r.les), r);
  r = await sk('bones', 1);
  check('3 bones, week 1: Strong and steady first', r.s && r.s.go === 'plan-r-steady', r);
  r = await sk('bones', 36);
  check('3 bones, week 6: Cool and calm, its second chapter', r.s && /swap the thought/.test(r.s.title), r);
  r = await sk('hot', 95, { keep: true, endSeen: ago(10) });
  check('3 her year (week 14): her first part’s skill, carry on', r.s && /carry on/.test(r.s.title), r);
  check('3 her year: a Learn article this month, not a chapter', /This month’s read/.test(r.les) && /Hormone therapy/.test(r.les), r.les);
}

// ---------- 4 the chapter page ----------
{
  const a = await open({ seed: m2('hot', B(1)) });
  await tap(a.page, '#view .pl-m2-les');
  let v = await view(a.page);
  check('4 the chapter: its title, part and number', /What a hot flush is/.test(v) && /Cool and calm · chapter 1 of 4/i.test(v), v.slice(0, 300));
  check('4 the chapter: this week’s skill, and why this works (folded)', await has(a.page, '#view .mid-skill') && await has(a.page, '#view details.mid-why:not([open])') && /Tap Hot flushes in your diary/.test(v), v.slice(0, 900));
  check('4 the chapter never promises fewer flushes from cooling or breathing', !/(reduce|fewer|stop) (your )?(hot )?flushes/i.test(v.replace(/they don’t stop the flushes/g, '')), v);
  const pads = await a.page.$$eval('#view .mid-les.has-say > .say-b + .mid-p', (ps) => ps.map((p) => parseFloat(getComputedStyle(p).paddingRight)));
  check('4 the speaker never covers a card’s first words', pads.length >= 2 && pads.every((x) => x >= 36), pads);
  await shot(a.page, 'chapter-h1');
  await tap(a.page, '#mid-les-done');
  const s0 = await st(a.page);
  check('4 Done marks it read and goes back to Today', !!((s0.mods.midlife || {}).les || {}).h1 && (await a.page.evaluate(() => location.hash)) === '#home', (s0.mods.midlife || {}));
  check('4 once read, the chapter row goes; Today’s skill stays', !(await has(a.page, '#view .pl-m2-les')) && !!(await skillOf(a.page)), await view(a.page));
  /* every chapter renders */
  const ids = await a.page.evaluate(() => window.Saathi.midlife.lesson.ids());
  const bad = [];
  for (const id of ids) { await a.page.evaluate((x) => { window.Saathi.mem.midLes = x; }, id); await go(a.page, 'mid-lesson'); const vv = await view(a.page); const tt = await a.page.evaluate((x) => window.Saathi.midlife.lesson.title(x), id); if (!vv.includes(tt) || !/This week’s skill/.test(vv)) bad.push(id); }
  check('4 all 16 chapters render, each with its skill', ids.length === 16 && !bad.length, { ids: ids, bad: bad });
  await a.page.evaluate(() => { window.Saathi.mem.midLes = 'q1'; }); await go(a.page, 'mid-lesson');
  check('4 the calm chapter: Tele-MANAS 14416 and 112', await has(a.page, '#view .card.urgent a[href="tel:14416"]') && await has(a.page, '#view .card.urgent a[href="tel:112"]'), await view(a.page));
  await a.page.evaluate(() => { window.Saathi.mem.midLes = 'h3'; }); await go(a.page, 'mid-lesson');
  check('4 chapter 3 opens the hot-flush routine', await has(a.page, '#view [data-go="relief-hot"]'), await view(a.page));
  await a.page.evaluate(() => { window.Saathi.mem.midLes = 'h4'; }); await go(a.page, 'mid-lesson');
  check('4 night sweats: fever, a long cough or weight loss means a doctor and a TB test', /TB test/.test(await view(a.page)) && await has(a.page, '#view .mid-les.warn'), await view(a.page));
  await done(a);
}

// ---------- 5 the weekly number and Rest's sleep question ----------
{
  let a = await open({ seed: m2('hot', B(7)), hash: '#plan-checkin', hm: '20:30' });
  check('5 day 7: the weekly number, 0 to 10, about her goal', await has(a.page, '#view .pl-ci-ms') && (await a.page.$$('#view [data-ci-ms]')).length === 11 && /This week, how much did hot flushes and night sweats get in your way\?/.test(await txt(a.page, '#view .pl-ci-ms')), await txt(a.page, '#view .pl-ci-ms'));
  await answerSteps(a.page); await tap(a.page, '[data-ci-ms="6"]'); await tap(a.page, '#pl-ci-save');
  let s0 = await st(a.page);
  check('5 her number is saved with the day', ((s0.mods.plan.log || {})[TODAY] || {}).ms === 6, (s0.mods.plan.log || {})[TODAY]);
  await shot(a.page, 'checkin-day7'); await done(a);
  a = await open({ seed: m2('hot', B(8), { log: { [ago(1)]: { ci: 1, ms: 6 } } }), hash: '#plan-checkin', hm: '20:30' });
  check('5 once a week: not the day after', !(await has(a.page, '#view .pl-ci-ms')), await view(a.page)); await done(a);
  a = await open({ seed: m2('hot', B(1)), hash: '#plan-checkin', hm: '20:30' });
  check('5 not on day 1', !(await has(a.page, '#view .pl-ci-ms'))); await done(a);
  a = await open({ seed: m2('hot', B(7), null, { settings: { shared: true } }), hash: '#plan-checkin', hm: '20:30' });
  check('5 never on a shared phone', !(await has(a.page, '#view .pl-ci-ms'))); await done(a);
  a = await open({ seed: m2('mood', B(29)), hash: '#plan-checkin', hm: '20:30' });
  check('5 Rest asks how she slept, for the mood goal too', await has(a.page, '#view .pl-ci-slpc'), await view(a.page)); await done(a);
  a = await open({ seed: m2('mood', B(2)), hash: '#plan-checkin', hm: '20:30' });
  check('5 the mood goal’s calm weeks don’t ask', !(await has(a.page, '#view .pl-ci-slpc'))); await done(a);
}

// ---------- 6 one card at a time ----------
{
  let a = await open({ seed: m2('hot', B(1), null, { dob: '1982-03-01' }) });
  check('6 periods stopped before 45: the reviewed line, once', /Your periods stopped before 45/.test(await slotText(a.page)) && /doctors call this early menopause/.test(await slotText(a.page)), await slotText(a.page));
  await tap(a.page, '[data-m2="e45-ok"]');
  check('6 Got it: it goes', !(await has(a.page, '#view .pl-m2-e45')) && !!(await st(a.page)).mods.plan.e45Seen); await done(a);
  a = await open({ seed: m2('hot', B(22)) });
  check('6 week 4: hormone therapy, from an MBBS gynaecologist, and Read more', /Hot flushes still getting in your way\?/.test(await slotText(a.page)) && /hormone therapy, prescribed by an MBBS gynaecologist/.test(await slotText(a.page)) && await has(a.page, '#view .pl-m2-w4 [data-mid-art]'), await slotText(a.page));
  await shot(a.page, 'week4-card'); await done(a);
  a = await open({ seed: m2('hot', B(22), null, { situation: { stopped: true, hormones: true } }) });
  check('6 week 4 on hormone medicine: her doctor’s plan, and 112 for its warning signs', /keep to your doctor’s plan/.test(await slotText(a.page)) && /one calf is swollen/.test(await slotText(a.page)) && await has(a.page, '#view .pl-m2-w4 a[href="tel:112"]'), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('aches', B(22)) });
  check('6 week 4 for aches and tiredness: ask about blood tests', /blood tests you need, often Hb and thyroid/.test(await slotText(a.page)), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('hot', B(78)) });
  check('6 week 12: her checks after 40', /Your checks after 40/.test(await slotText(a.page)) && await has(a.page, '#view .pl-m2-w12 [data-go="meno-bones"]'), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('hot', B(22), null, { settings: { discreet: true } }) });
  check('6 none in discreet mode', !(await has(a.page, '#view .pl-sl-m2'))); await done(a);
  a = await open({ seed: m2('hot', B(9), { pv: 1 }) });
  check('6 version 1: offered the new version once', /Your plan has a new version/.test(await slotText(a.page)), await slotText(a.page));
  await tap(a.page, '[data-m2="mpv2-yes"]');
  check('6 Try it: version 2, with Today’s skill', (await st(a.page)).mods.plan.pv === 2 && !!(await skillOf(a.page)), await acts(a.page)); await done(a);
}

// ---------- 7 periods stopped before 40 ----------
{
  const seed = { dob: '1991-05-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], prompts: { setup: 'off', planCall: ago(3), firstLog: ago(2), planOffer: ago(2) }, events: regular(200) };
  const a = await open({ seed: seed });
  check('7 before 40: see a gynaecologist first, in the reviewed words', /Before a plan: see a gynaecologist/.test(await txt(a.page, '#view .pl-m2-poi')) && /Periods that stop before 40 are not menopause/.test(await txt(a.page, '#view .pl-m2-poi')), await view(a.page));
  check('7 before 40: no plan offered', !(await has(a.page, '#pl-off-go')) && (await a.page.evaluate(() => window.Saathi.plan.packOf())) == null);
  await tap(a.page, '#pl-m2-poi-ok');
  check('7 "My doctor has seen me": the plan is offered', !!(await st(a.page)).situation.poiOk && await has(a.page, '#pl-off-go'), await view(a.page));
  await done(a);
}

// ---------- 8 her heart, her bones, My plan ----------
{
  let a = await open({ seed: m2('hot', B(2), { a: { mheart: 'y' } }) });
  let s = await acts(a.page);
  check('8 chest pain when she walks: Gentle start instead of Strength at home', s.some((x) => x.id === 'str' && x.go === 'plan-r-gentle') && !s.some((x) => x.go === 'plan-r-strength'), s);
  await go(a.page, 'plan');
  check('8 My plan: her walk stays easy, with 112, until her doctor says', await has(a.page, '#view .pl-m2-heart a[href="tel:112"]') && /My doctor says I can do more/.test(await txt(a.page, '#view .pl-m2-heart')), await view(a.page));
  await tap(a.page, '[data-m2="heart-ok"]'); await go(a.page, 'home'); s = await acts(a.page);
  check('8 her doctor said yes: Strength at home', s.some((x) => x.id === 'str' && x.go === 'plan-r-strength') && !(await st(a.page)).mods.plan.intake.mheart.startsWith('y'), s); await done(a);
  a = await open({ seed: m2('hot', B(3), { a: { mbone: 'y' } }), hash: '#plan' });
  check('8 weak bones: My plan’s card and Bones and heart after 40', await has(a.page, '#view .pl-m2-bone [data-go="meno-bones"]'), await view(a.page));
  const rows = await a.page.$$eval('#view .pl-m2path li', (l) => l.map((x) => x.dataset.m2p + ':' + x.innerText.replace(/\s+/g, ' ').trim()));
  check('8 My plan: her 3 parts in her order, then her year', rows.length === 4 && /^h:Cool and calm Weeks 1 to 4/.test(rows[0]) && /^r:Rest Weeks 5 to 8/.test(rows[1]) && /^s:Strong and steady Weeks 9 to 12/.test(rows[2]) && /^k:Your year/.test(rows[3]), rows);
  await shot(a.page, 'myplan'); await done(a);
  a = await open({ seed: m2('bones', B(3)), hash: '#plan' });
  const rows2 = await a.page.$$eval('#view .pl-m2path li', (l) => l.map((x) => x.dataset.m2p));
  check('8 bones: Strong and steady first', rows2.join('') === 'shrk', rows2); await done(a);
}

// ---------- 9 results, moves ----------
{
  const log = {}; const put = (day, o) => { log[ago(84 - day)] = Object.assign({ ci: 1 }, o); };
  put(6, { ms: 8, slp: 'bad' }); put(13, { ms: 6, slp: 'hot' }); put(3, { slp: 'ok' }); put(4, { slp: 'well' });
  put(76, { ms: 5, slp: 'well' }); put(83, { ms: 3, slp: 'ok' }); put(78, { slp: 'well' }); put(80, { slp: 'bad' });
  [1, 5, 8, 12, 15].forEach((d) => { log[ago(84 - d)] = Object.assign(log[ago(84 - d)] || {}, { ck: { str: 'd' } }); });
  let a = await open({ seed: m2('hot', 84, { log: log }), hash: '#plan-end' });
  const r = await txt(a.page, '#view .pl-m2res');
  check('9 day 85: her own numbers, first 2 weeks beside her last 2', /How much hot flushes and night sweats got in your way: 7 of 10 in your first 2 weeks, 4 of 10 in your last 2/.test(r), r);
  check('9 her nights and her strength days', /Nights you slept well or okay: 2 of 4 in your first 2 weeks, 3 of 4 in your last 2/.test(r) && /Strength days: 5/.test(r), r);
  check('9 never "better" or "worse"', !/better|worse|improv/i.test(r), r);
  await done(a);
  a = await open({ seed: m2('hot', B(3)), hash: '#plan-moves' });
  check('9 Steady on your feet on Moves and calm, for midlife', await has(a.page, '#view [data-go="plan-r-steady"]'), await view(a.page));
  await go(a.page, 'plan-r-steady');
  check('9 its player: one leg at the wall', /One leg at the wall/.test(await view(a.page)), (await view(a.page)).slice(0, 300)); await done(a);
  a = await open({ seed: { intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', 3) } }, hash: '#plan-moves' });
  check('9 not for a 30-year-old on the PMOS plan', !(await has(a.page, '#view [data-go="plan-r-steady"]'))); await done(a);
}

// ---------- 10 Hindi at 360 px ----------
{
  let a = await open({ seed: Object.assign(m2('hot', B(1)), { lang: 'hi' }), w: 360, h: 800 });
  check('10 Hindi: Today’s skill in Hindi, no sideways scroll', /आज का अभ्यास: पहचानें और नाम दें/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 400));
  await tap(a.page, '#view .pl-m2-les');
  check('10 Hindi: the chapter, no sideways scroll', /गर्मी का झोंका क्या है/.test(await view(a.page)) && /4 में से अध्याय 1/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 300));
  await shot(a.page, 'chapter-hi-360'); await done(a);
  a = await open({ seed: Object.assign(m2('hot', B(7)), { lang: 'hi' }), w: 360, h: 800, hash: '#plan-checkin', hm: '20:30' });
  check('10 Hindi: the weekly number, no sideways scroll', /हफ़्ते में एक बार/.test(await view(a.page)) && /गर्मी के झोंकों और रात के पसीने ने आपको कितना परेशान किया/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 500));
  await done(a);
  a = await open({ seed: Object.assign(m2('hot', B(22)), { lang: 'hi' }), w: 360, h: 800 });
  check('10 Hindi: week 4’s card', /गर्मी के झोंके अब भी परेशान करते हैं/.test(await view(a.page)) && await noScroll(a.page)); await done(a);
}

// ---------- 11 the midlife walk's 12 fixes ----------
{
  /* her plan's own questions to Start, through the real screens; returns "Here's what you told Sakhi" */
  const startVia = async (page, a0, pick) => {
    await page.evaluate((x) => { window.Saathi.mem.planIntake = x; }, a0); await go(page, 'plan-goal'); let sum = '';
    for (let i = 0; i < 12; i++) {
      if ((await page.evaluate(() => location.hash)) === '#plan-reveal') break;
      if (await has(page, '#pl-in-make')) { sum = await view(page); await tap(page, '#pl-in-make'); continue; }
      if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="evening"]'); continue; }
      for (const [k, v] of Object.entries(pick)) { const one = '[data-pl-q="' + k + ':' + v + '"], [data-pl-m="' + k + ':' + v + '"]'; if ((await has(page, one)) && !(await has(page, '[data-pl-q="' + k + ':' + v + '"].on, [data-pl-m="' + k + ':' + v + '"].on'))) await tap(page, one); }
      if (await has(page, '#pl-in-next')) await tap(page, '#pl-in-next'); else break;
    }
    for (let i = 0; i < 8 && !(await has(page, '#pl-rv-go')); i++) { if (await has(page, '#pl-rv-next')) await tap(page, '#pl-rv-next'); else break; }
    if (await has(page, '#pl-rv-go')) await tap(page, '#pl-rv-go');
    return sum;
  };
  const PICK = { act: '0', lim: 'none', food: 'veg', milk: 'y', mbone: 'n', mheart: 'y' };
  /* 1 before 40: joining set no plan offer */
  const poi = { dob: '1989-05-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], prompts: { firstLog: ago(2) }, events: regular(200) };
  let a = await open({ seed: poi });
  check('11.1 before 40, with no plan offer from joining: the gynaecologist first on Today', /Before a plan: see a gynaecologist/.test(await txt(a.page, '#view .pl-m2-poi')), await view(a.page));
  await go(a.page, 'plan');
  check('11.1 My plan: the same card, and no goals that lead nowhere', await has(a.page, '#view .pl-m2-poi') && !(await has(a.page, '#view [data-pl-pick]')), await view(a.page));
  await tap(a.page, '#pl-m2-poi-ok'); await go(a.page, 'home');
  check('11.1 "My doctor has seen me": her plan is offered', await has(a.page, '#pl-off-go') && !!(await st(a.page)).prompts.planOffer, await view(a.page)); await done(a);
  /* 2 aches and tiredness */
  a = await open({ seed: { dob: '1979-05-01', situation: { stopped: true }, intake: { goal: 'aches', stage: 'meno' }, goals: ['meno', 'aches'], prompts: { setup: 'off', planCall: ago(3), firstLog: ago(2), planOffer: ago(2) }, events: regular(400) } });
  check('11.2 Aches and tiredness: her plan is offered on Today', await has(a.page, '#pl-off-go'), await view(a.page));
  await go(a.page, 'plan');
  check('11.2 and it is in My plan’s goals', await has(a.page, '#view [data-pl-pick="aches"]'), await view(a.page)); await done(a);
  /* 3 her bones and heart answers, through the real questions */
  a = await open({ seed: { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400) } });
  const sum = await startVia(a.page, { stage: 'meno', goal: 'hot', iq: 1 }, Object.assign({}, PICK, { mbone: 'y' }));
  check('11.3 "Here’s what you told Sakhi" shows her weak bones and chest pain when she walks', /Weak bones/.test(sum) && /Chest pain or very breathless when you walk/.test(sum), sum.slice(0, 500));
  let p0 = (await st(a.page)).mods.plan || {};
  check('11.3 her answers are saved with her plan', p0.pack === 'meno' && p0.pv === 2 && (p0.intake || {}).mheart === 'y' && (p0.intake || {}).mbone === 'y', p0.intake);
  await a.page.clock.setSystemTime(at('10:00')); await a.page.evaluate(() => { const d = JSON.parse(localStorage.getItem('qura-saathi-v1')); const p = d.mods.plan; const back = (x, n) => { const t = new Date(x + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() - n); return t.toISOString().slice(0, 10); }; p.start = back(p.start, 1); p.started = p.start; localStorage.setItem('qura-saathi-v1', JSON.stringify(d)); });
  await a.page.reload(); await a.page.waitForFunction(() => !!window.Saathi); await settle(a.page, 600);
  let s1 = await acts(a.page);
  check('11.3 so day 2 has Gentle start, not Strength at home', s1.some((x) => x.id === 'str' && x.go === 'plan-r-gentle'), s1);
  await go(a.page, 'plan');
  check('11.3 and My plan has her walk card and her bones card', await has(a.page, '#view .pl-m2-heart') && await has(a.page, '#view .pl-m2-bone'), await view(a.page)); await done(a);
  /* 4 version 1 to 2: a fresh 12 weeks */
  a = await open({ seed: m2('hot', 40, { pv: 1, log: { [ago(3)]: { ci: 1, min: 15 }, [ago(10)]: { ci: 1, min: 15 } } }) });
  await tap(a.page, '[data-m2="mpv2-yes"]'); p0 = (await st(a.page)).mods.plan;
  const rem = (await st(a.page)).reminders.find((r) => r.id === 'plan') || {};
  check('11.4 Try it: version 2 from today, at the first chapter', p0.pv === 2 && p0.start === TODAY && /notice it, name it/.test(((await skillOf(a.page)) || {}).title || ''), { start: p0.start, skill: await skillOf(a.page) });
  check('11.4 her check-in rings to the new 12 weeks’ end, and what she logged stays', rem.until > iso(TODAY, 80) && Object.keys(p0.log || {}).length >= 1, { until: rem.until, log: Object.keys(p0.log || {}).length }); await done(a);
  /* 5 before 45: at 40 to 44, a year after her last period */
  a = await open({ seed: m2('hot', B(1), null, { dob: '1982-03-01', events: regular(30) }) });
  check('11.5 her last period 30 days ago: no "12 months" line yet', !(await has(a.page, '#view .pl-m2-e45')), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('hot', B(1), null, { dob: '1989-03-01', situation: { stopped: true, poiOk: ago(5) } }) });
  check('11.5 under 40 (her doctor has seen her): no early-menopause card', !(await has(a.page, '#view .pl-m2-e45')), await slotText(a.page)); await done(a);
  /* 6 week 4 by her goal */
  a = await open({ seed: m2('sleep', B(22)) });
  check('11.6 week 4, sleep with no hot flushes and no hormone medicine: no hot-flush card', !(await has(a.page, '#view .pl-m2-w4')), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('sleep', B(22), null, { situation: { stopped: true, hormones: true } }) });
  check('11.6 sleep on hormone medicine: her medicine’s signs, not "Hot flushes still getting in your way?"', /keep to your doctor’s plan/.test(await slotText(a.page)) && !/Hot flushes still/.test(await slotText(a.page)), await slotText(a.page)); await done(a);
  a = await open({ seed: m2('aches', B(22)) });
  check('11.6 aches: the blood tests, and no hormone therapy read', /often Hb and thyroid/.test(await slotText(a.page)) && !(await has(a.page, '#view .pl-m2-w4 [data-mid-art]')), await slotText(a.page)); await done(a);
  /* 7 week 12's words */
  a = await open({ seed: m2('hot', B(78)) });
  check('11.7 week 12: BP, sugar and bones, not the screening the check-ups card holds', /BP, sugar and your bones/.test(await slotText(a.page)) && !/cervical/i.test(await slotText(a.page)), await slotText(a.page)); await done(a);
  /* 8 her year's skill line */
  a = await open({ seed: m2('hot', 95, { keep: true, endSeen: ago(10) }) });
  check('11.8 her year: "Every day · from Cool and calm", not "this week’s chapter"', /Every day · from Cool and calm/.test(((await skillOf(a.page)) || {}).sub || ''), await skillOf(a.page)); await done(a);
  /* 9 the sleep goal's chapters fixed for the part */
  a = await open({ seed: m2('sleep', B(36), null, { daily: { [ago(2)]: ['d_hotflush'] } }) });
  check('11.9 sleep, week 6: a first hot flush inside the calm weeks keeps the calm chapters', /a kinder answer/.test(((await skillOf(a.page)) || {}).title || ''), await skillOf(a.page)); await done(a);
  a = await open({ seed: m2('sleep', B(36), null, { daily: { [ago(17)]: ['d_hotflush'] } }) });
  check('11.9 hot flushes before that part began: Cool and calm', /swap the thought/.test(((await skillOf(a.page)) || {}).title || ''), await skillOf(a.page)); await done(a);
  /* 10 a new plan's own cards */
  a = await open({ seed: m2('hot', B(30), { w4Seen: ago(5), w12Seen: ago(5) }) });
  await startVia(a.page, { stage: 'meno', goal: 'bones', iq: 1 }, Object.assign({}, PICK, { mheart: 'n' })); p0 = (await st(a.page)).mods.plan;
  check('11.10 a new plan starts its own cards', p0.goalKey === 'bones' && p0.start === TODAY && p0.w4Seen == null && p0.w12Seen == null, { goal: p0.goalKey, start: p0.start, w4: p0.w4Seen }); await done(a);
  /* 11 the balance routine's words */
  a = await open({ seed: m2('hot', B(57)), hash: '#plan-r-steady' });
  let v11 = await view(a.page);
  check('11.11 after her periods stopped, the routine’s safety line says nothing about a period', /chest pain, breathlessness that doesn’t settle, or bleeding\./.test(v11) && !/During your period/.test(v11), v11.slice(0, 600));
  check('11.11 one leg at the wall: no "Then the other foot" (the player does each side)', /One leg at the wall/.test(v11) && !/Then the other foot/.test(v11)); await done(a);
  /* 12 no diary setup prompt while the plan runs */
  const SETUP = { setup: null, planCall: ago(3), firstLog: ago(2) };
  a = await open({ seed: m2('hot', B(3), null, { prompts: SETUP, joined: ago(2) }) });
  const all = (pg) => pg.$eval('#view', (e) => e.textContent.replace(/\s+/g, ' '));   /* folded cards too */
  check('11.12 while the plan runs, no "Start the weekly symptom diary" prompt', !/Start the weekly symptom diary/.test(await all(a.page)), await all(a.page)); await done(a);
  a = await open({ seed: { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400), prompts: SETUP, joined: ago(2) } });
  check('11.12 with no plan it is still offered', /Start the weekly symptom diary/.test(await all(a.page)), await all(a.page)); await done(a);
}

// ---------- 12 the phone test's 6 fixes ----------
{
  /* Mohit's phone: her stage moved to "Periods changing after 40" while her PMOS plan ran */
  const pmosMid = (x) => Object.assign({ dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5),
    mods: { plan: planOf('cycle', 'pmos', 1, { level: 1, limits: { knees: true, back: false } }) }, reminders: [planRem(1)] }, x || {});
  let a = await open({ seed: pmosMid() });
  check('12.1 midlife now, her PMOS plan running: "My midlife plan may fit now"', /My midlife plan may fit now/.test(await txt(a.page, '#view .pl-fit')) && await has(a.page, '#pl-fit-go') && await has(a.page, '#pl-fit-keep'), await view(a.page));
  await tap(a.page, '#pl-fit-go');
  const mi = await a.page.evaluate(() => window.Saathi.mem.planIntake || null);
  check('12.1 See it: her midlife goal’s plan questions', (await a.page.evaluate(() => location.hash)) === '#plan-goal' && mi && mi.stage === 'meno' && mi.goal === 'hot', mi);
  /* 2 "Your day" holds what her PMOS plan holds (Version 39.66: it asks only her bones and heart; the rest comes with her) */
  const pi = await a.page.evaluate(() => { const m = window.Saathi.mem.planIntake || {}; return { act: m.act, lim: m.lim }; });
  check('12.2 "Your day": only her bones and heart asked; how active she is and her knees come from her plan before', await has(a.page, '#view [data-pl-q^="mbone:"]') && !(await has(a.page, '#view [data-pl-q^="act:"]')) && !(await has(a.page, '#view [data-pl-m^="lim:"]')) && pi.act === '1' && (pi.lim || []).join() === 'knees', pi); await done(a);
  a = await open({ seed: pmosMid() }); await tap(a.page, '#pl-fit-keep');
  check('12.1 Keep: her plan stays, and the card goes', !(await has(a.page, '#view .pl-fit')) && (await st(a.page)).mods.plan.pack === 'cycle', await view(a.page)); await done(a);
  a = await open({ seed: pmosMid({ intake: { goal: 'heavy', stage: 'meno' }, goals: ['meno', 'heavy'], mods: { plan: planOf('heavy', 'heavy', 1) } }) });
  check('12.1 heavy periods at 40: her heavy-periods plan stays, with no card', !(await has(a.page, '#view .pl-fit'))); await done(a);
  /* 3 the reveal */
  a = await open({ seed: { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400) } });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'meno', goal: 'hot', iq: 1, act: '0', lim: ['none'], food: 'veg', milk: 'y', mbone: 'n', mheart: 'n', when: 'evening' }; }); await go(a.page, 'plan-goal');
  for (let i = 0; i < 6 && (await a.page.evaluate(() => location.hash)) !== '#plan-reveal'; i++) { if (await has(a.page, '#pl-in-make')) await tap(a.page, '#pl-in-make'); else if (await has(a.page, '[data-pl-when]')) await tap(a.page, '[data-pl-when="evening"]'); else if (await has(a.page, '#pl-in-next')) await tap(a.page, '#pl-in-next'); else break; }
  let rv = '';
  for (let i = 0; i < 4; i++) { rv += ' ' + (await view(a.page)); if (/What happens when/.test(rv) || !(await has(a.page, '#pl-rv-next'))) break; await tap(a.page, '#pl-rv-next'); }
  check('12.3 the reveal names her parts, her chapter and her strength days', /Weeks 1 to 4: Cool and calm/.test(rv) && /Weeks 5 to 8: Rest/.test(rv) && /Weeks 9 to 12: Strong and steady/.test(rv) && /Every week: a short chapter/.test(rv) && /Twice a week, from day 2: Strength at home/.test(rv), rv.slice(-900)); await done(a);
  /* 4 "Why this works" has its arrow */
  a = await open({ seed: m2('hot', B(1)), hash: '#mid-lesson' });
  const arrow = await a.page.$eval('#view details.mid-why summary', (sm) => { const c = getComputedStyle(sm, '::after'); return c.content !== 'none' && parseFloat(c.borderRightWidth) > 0; }).catch(() => false);
  check('12.4 "Why this works" draws its own arrow', arrow); await done(a);
  /* 5 the check-in names tomorrow when it changes */
  a = await open({ seed: m2('hot', B(1)), hash: '#plan-checkin', hm: '20:30' });
  await answerSteps(a.page); await tap(a.page, '#pl-ci-save');
  const tom = await txt(a.page, '#view .pl-ci-tomr');
  check('12.5 day 1’s check-in: "Tomorrow: your skill, your walk, Strength at home", not "the same steps"', /Tomorrow: your skill, your walk, Strength at home/.test(tom) && !/the same steps/.test(await view(a.page)), tom); await done(a);
  /* 6 Moves and calm: Today is her plan's own routine */
  a = await open({ seed: m2('hot', B(2)), hash: '#plan-moves' });
  const today = await a.page.$$eval('#view .pl-ritem', (x) => x.filter((y) => /Today/.test(y.innerText)).map((y) => y.dataset.go));
  check('12.6 a strength day: Strength at home is Today, and Cycle care yoga isn’t', today.length === 1 && today[0] === 'plan-r-strength', today); await done(a);
  a = await open({ seed: m2('hot', B(57)), hash: '#plan-moves' });
  const today2 = await a.page.$$eval('#view .pl-ritem', (x) => x.filter((y) => /Today/.test(y.innerText)).map((y) => y.dataset.go));
  check('12.6 Strong and steady: Steady on your feet is Today', today2.indexOf('plan-r-steady') >= 0 && today2.indexOf('plan-r-cycle') < 0, today2); await done(a);
}

// ---------- 13 the second phone test's 3 gaps ----------
{
  /* 1 "Your last plan": not a plan changed on the day it started with no day followed; the one before it */
  const past = [{ pack: 'cycle', goalKey: 'pmos', pv: 1, start: TODAY, end: TODAY, days: 0, wk: 1, weeks: {} }, { pack: 'meno', goalKey: 'hot', pv: 2, start: ago(1), end: TODAY, days: 1, wk: 1, weeks: {} }];
  let a = await open({ seed: m2('hot', 0, { past: past }), hash: '#plan' });
  const lp = await txt(a.page, '#view .pl-past');
  check('13.1 a plan changed the day it started: "Your last plan" is the one before it, in "1 day"', /My midlife plan · 29 Oct to 30 Oct · followed on 1 day$/.test(lp) && !/0 days/.test(lp), lp);
  const rep = await a.page.evaluate(() => JSON.stringify(window.Saathi.summaries().filter((m) => m.mod === 'plan')));
  check('13.1 the report for her doctor too', /Before this: My midlife plan, 29 Oct 2026 to 30 Oct 2026, followed on 1 day"/.test(rep) && !/My PMOS plan/.test(rep), rep.slice(0, 600));
  check('13.1 her list of plans stays as it was', ((await st(a.page)).mods.plan.past || []).length === 2); await done(a);
  a = await open({ seed: m2('hot', 0, { past: [{ pack: 'cycle', goalKey: 'pmos', pv: 1, start: ago(10), end: TODAY, days: 0, wk: 2, weeks: {} }] }), hash: '#plan' });
  check('13.1 a plan she had for 10 days and didn’t follow still shows', /My PMOS plan · 20 Oct to 30 Oct · followed on 0 days/.test(await txt(a.page, '#view .pl-past')), await txt(a.page, '#view .pl-past')); await done(a);
  /* 2 Strength at home: no repeat row in version 2; Gentle start in its place while her heart answer waits for her doctor */
  a = await open({ seed: m2('hot', B(2)), hash: '#plan' });
  check('13.2 version 2: no "Strength at home" row under My plan (a step, and on Moves and calm)', !(await has(a.page, '#view .pl-moves-row')) && /Strength at home runs twice a week from week 1, in every part/.test(await txt(a.page, '#view .pl-m2-str')), await txt(a.page, '#view .pl-m2-str')); await done(a);
  a = await open({ seed: m2('hot', B(2), { pv: 1 }), hash: '#plan' });
  check('13.2 version 1 keeps its row', await has(a.page, '#view .pl-moves-row [data-go="plan-r-strength"]')); await done(a);
  a = await open({ seed: m2('hot', B(2), { a: { mheart: 'y' } }), hash: '#plan-moves' });
  const ids = await a.page.$$eval('#view .pl-ritem', (x) => x.map((y) => y.dataset.go));
  check('13.2 chest pain when she walks: Moves and calm offers Gentle start, not Strength at home or the sun salutation', ids.indexOf('plan-r-gentle') >= 0 && ids.indexOf('plan-r-strength') < 0 && ids.indexOf('plan-r-sun') < 0, ids);
  check('13.2 and its search tile waits too', await a.page.evaluate(() => { const x = window.Saathi.tiles().find((y) => y.route === 'plan-r-strength'); return !!(x && x.hidden && x.hidden()); }));
  await go(a.page, 'plan-r-strength');
  check('13.2 its page opens Moves and calm instead', await has(a.page, '#view .pl-ritem[data-go="plan-r-gentle"]'), (await view(a.page)).slice(0, 200));
  await go(a.page, 'plan');
  check('13.2 My plan: "Gentle start runs twice a week"', /Gentle start runs twice a week from week 1, in every part/.test(await txt(a.page, '#view .pl-m2-str')) && !(await has(a.page, '#view .pl-moves-row')), await txt(a.page, '#view .pl-m2-str'));
  await tap(a.page, '[data-m2="heart-ok"]'); await go(a.page, 'plan-moves');
  const ids2 = await a.page.$$eval('#view .pl-ritem', (x) => x.map((y) => y.dataset.go));
  check('13.2 her doctor said she can do more: Strength at home is back (the sun salutation stays off for midlife: section 18)', ids2.indexOf('plan-r-strength') >= 0 && ids2.indexOf('plan-r-sun') < 0, ids2); await done(a);
  /* 3 her time to move, from the plan she is on */
  const walkTo = async (page) => { let saw = false, sum = '';
    for (let i = 0; i < 10; i++) {
      if (await has(page, '#pl-in-make')) { sum = await view(page); break; }
      if (await has(page, '[data-pl-when]')) { saw = true; await tap(page, '[data-pl-when="evening"]'); continue; }
      for (const [k, v] of Object.entries({ act: '0', lim: 'none', food: 'veg', milk: 'y', mbone: 'n', mheart: 'n' })) { const one = '[data-pl-q="' + k + ':' + v + '"], [data-pl-m="' + k + ':' + v + '"]'; if ((await has(page, one)) && !(await has(page, '[data-pl-q="' + k + ':' + v + '"].on, [data-pl-m="' + k + ':' + v + '"].on'))) await tap(page, one); }
      if (await has(page, '#pl-in-next')) await tap(page, '#pl-in-next'); else break;
    }
    return { saw, sum }; };
  a = await open({ seed: { dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5), mods: { plan: planOf('cycle', 'pmos', 3) }, reminders: [planRem(3)] } });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'meno', goal: 'hot', iq: 1 }; }); await go(a.page, 'plan-goal');
  const w1 = await walkTo(a.page);
  check('13.3 a new plan while one runs: no "When can you move for 10 minutes?", her time in the summary', !w1.saw && /Your time to move After dinner/.test(w1.sum), w1);
  await tap(a.page, '[data-pl-edit="when"]');
  check('13.3 Change asks it', await has(a.page, '[data-pl-when]'));
  await tap(a.page, '[data-pl-when="evening"]');
  check('13.3 and the summary shows her new time', /Your time to move In the evening/.test(await view(a.page)), (await view(a.page)).slice(0, 400));
  await tap(a.page, '#pl-in-make');
  check('13.3 her new plan keeps the time she chose', ((await st(a.page)).mods.plan.next || {}).when === 'evening', (await st(a.page)).mods.plan.next); await done(a);
  a = await open({ seed: { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400) } });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'meno', goal: 'hot', iq: 1 }; }); await go(a.page, 'plan-goal');
  const w2 = await walkTo(a.page);
  check('13.3 her first plan still asks it', w2.saw && /Your time to move In the evening/.test(w2.sum), w2); await done(a);
}

// ---------- 14 the third phone test's 2 gaps ----------
{
  /* 1 "Your last plan": never a plan changed on the day it started, even when her check-in that day counted it */
  let a = await open({ seed: m2('hot', 0, { past: [{ pack: 'cycle', goalKey: 'pmos', pv: 1, start: TODAY, end: TODAY, days: 1, wk: 1, weeks: {} }, { pack: 'meno', goalKey: 'hot', pv: 2, start: ago(5), end: ago(1), days: 3, wk: 1, weeks: {} }] }), hash: '#plan' });
  const lp = await txt(a.page, '#view .pl-past');
  check('14.1 a plan changed the day it started, after a check-in: "Your last plan" is the one before it', /My midlife plan · 25 Oct to 29 Oct · followed on 3 days/.test(lp) && !/PMOS/.test(lp), lp); await done(a);
  /* Mohit's phone: her midlife plan restarted on the day it started, after her check-in */
  a = await open({ seed: m2('hot', 0, { log: { [TODAY]: { ci: 1 } }, past: [{ pack: 'meno', goalKey: 'hot', pv: 2, start: ago(1), end: TODAY, days: 1, wk: 1, weeks: {} }] }) });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'meno', goal: 'hot', iq: 1 }; }); await go(a.page, 'plan-goal');
  for (let i = 0; i < 12 && (await a.page.evaluate(() => location.hash)) !== '#plan-reveal'; i++) { if (await has(a.page, '#pl-in-make')) await tap(a.page, '#pl-in-make'); else if (await has(a.page, '[data-pl-when]')) await tap(a.page, '[data-pl-when="evening"]'); else if (await has(a.page, '#pl-in-next')) await tap(a.page, '#pl-in-next'); else break; }
  for (let i = 0; i < 8 && !(await has(a.page, '#pl-rv-go')); i++) { if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  await tap(a.page, '#pl-rv-go'); await go(a.page, 'plan');
  const past = (await st(a.page)).mods.plan.past || []; const lp2 = await txt(a.page, '#view .pl-past');
  check('14.1 restarted the same day: the copy stays out of "Your last plan" at once', past.some((x) => x.start === TODAY && x.pack === 'meno' && x.days === 1) && /My midlife plan · 29 Oct to 30 Oct · followed on 1 day$/.test(lp2), { lp2, past: past.map((x) => x.pack + ' ' + x.start + ' ' + x.end + ' ' + x.days) }); await done(a);
  /* 2 "Your day": her bones and heart answers from the midlife plan she is on */
  const day = async (seed, goal) => { const b = await open({ seed: seed }); await b.page.evaluate((g) => { window.Saathi.mem.planIntake = { stage: 'meno', goal: g, iq: 1 }; }, goal); await go(b.page, 'plan-goal'); return b; };
  a = await day(m2('hot', B(3), { a: { mbone: 'y', mheart: 'y' } }), 'sleep');
  check('14.2 a new midlife plan: her bones and heart answers are already picked, with the heart line', await has(a.page, '[data-pl-q="mbone:y"].on') && await has(a.page, '[data-pl-q="mheart:y"].on') && /see your doctor before you do more/.test(await txt(a.page, '#pl-in-warn')), (await view(a.page)).slice(-500)); await done(a);
  a = await day(m2('hot', B(3), { a: { mheart: 'ok' } }), 'hot');
  check('14.2 after "My doctor says I can do more": No shows, with no warning', await has(a.page, '[data-pl-q="mheart:n"].on') && !(await has(a.page, '[data-pl-q="mheart:y"].on')) && !/see your doctor/.test(await txt(a.page, '#pl-in-warn')), (await view(a.page)).slice(-500));
  await tap(a.page, '#pl-in-next');
  check('14.2 and her doctor’s OK goes with her new plan', (await a.page.evaluate(() => (window.Saathi.mem.planIntake || {}).mheart)) === 'ok', await a.page.evaluate(() => window.Saathi.mem.planIntake)); await done(a);
  a = await day({ dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5), mods: { plan: planOf('cycle', 'pmos', 3) }, reminders: [planRem(3)] }, 'hot');
  check('14.2 from a plan that never asked them (PMOS): both wait for her answer', await has(a.page, '[data-pl-q="mheart:y"]') && !(await has(a.page, '[data-pl-q^="mbone:"].on')) && !(await has(a.page, '[data-pl-q^="mheart:"].on'))); await done(a);
}

/* her plan's questions to Start: each question with no answer gets the one in pick, else "None of these", else its first,
   one at a time as the screen redraws (sections 15 and 16) */
const fillOne = (page, pick) => page.evaluate((pk) => {
  const g = {}; document.querySelectorAll('#view [data-pl-q], #view [data-pl-m]').forEach((b) => { const k = (b.dataset.plQ || b.dataset.plM).split(':')[0]; (g[k] = g[k] || []).push(b); });
  const k = Object.keys(g).find((x) => !g[x].some((b) => b.classList.contains('on'))); if (!k) return false;
  const v = (b) => (b.dataset.plQ || b.dataset.plM || '').split(':')[1];
  (g[k].find((b) => pk[k] != null && v(b) === pk[k]) || g[k].find((b) => v(b) === 'none') || g[k][0]).click(); return true; }, pick || {});
const startPlan = async (page, intake, pick) => {
  await page.evaluate((x) => { window.Saathi.mem.planIntake = x; }, intake); await go(page, 'plan-goal');
  for (let i = 0; i < 12 && (await page.evaluate(() => location.hash)) !== '#plan-reveal'; i++) {
    if (await has(page, '#pl-in-make')) { await tap(page, '#pl-in-make'); continue; }
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="evening"]'); continue; }
    for (let j = 0; j < 12 && await fillOne(page, pick); j++) await settle(page, 150);
    if (await has(page, '#pl-in-next')) await tap(page, '#pl-in-next'); else break;
  }
  for (let i = 0; i < 8 && !(await has(page, '#pl-rv-go')); i++) { if (await has(page, '#pl-rv-next')) await tap(page, '#pl-rv-next'); else break; }
  if (await has(page, '#pl-rv-go')) await tap(page, '#pl-rv-go');
};

// ---------- 15 the fourth phone test's gap ----------
{
  const dayFor = async (page, goal) => { await page.evaluate((g) => { window.Saathi.mem.planIntake = { stage: 'meno', goal: g, iq: 1 }; }, goal); await go(page, 'plan-goal'); };
  const fresh = async (page) => await has(page, '[data-pl-q="mheart:y"]') && !(await has(page, '[data-pl-q^="mbone:"].on')) && !(await has(page, '[data-pl-q^="mheart:"].on'));
  /* Mohit's phone: stage back to tracking her periods while her midlife plan ran, then the PMOS plan */
  let a = await open({ seed: m2('hot', B(3), { a: { mbone: 'y', mheart: 'y' } }, { dob: '1990-03-01', situation: {}, intake: { goal: 'pmos', stage: 'cycle' }, goals: ['pmos'] }) });
  await startPlan(a.page, { stage: 'cycle', goal: 'pmos', iq: 1 });
  const p = (await st(a.page)).mods.plan;
  check('15.1 a PMOS plan made while her midlife plan ran keeps no bones or heart answers', p.pack === 'cycle' && p.start === TODAY && (p.intake || {}).mbone == null && (p.intake || {}).mheart == null, { pack: p.pack, start: p.start, ik: p.intake });
  await dayFor(a.page, 'hot');
  check('15.1 and back to My midlife plan, "Your day" asks both again', await fresh(a.page), (await view(a.page)).slice(-400)); await done(a);
  /* a PMOS plan that kept them under 0.39.51.3 (Mohit's phone): they still don't come back */
  a = await open({ seed: { dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5), mods: { plan: planOf('cycle', 'pmos', 3, { intake: { goal: 'pmos', stage: 'cycle', act: 0, lim: [], mbone: 'n', mheart: 'ok' } }) }, reminders: [planRem(3)] } });
  await dayFor(a.page, 'hot');
  check('15.2 her bones and heart answers come only from a midlife plan', await fresh(a.page), (await view(a.page)).slice(-400)); await done(a);
}

// ---------- 16 the exploratory phone test's 4 gaps ----------
{
  /* 1 "Why?" (My plan's "How to do it" opens the same sheet as Today's): the skill's How in its chapter's own words; the calcium
     food has no How that repeats its subtitle */
  const why = async (page, id) => { const i = (await acts(page)).findIndex((x) => x.id === id); await page.$eval('#view [data-pl-how="' + i + '"]', (el) => el.click()); await settle(page, 400);
    return { all: await txt(page, '.pl-why-sh'), how: await txt(page, '.pl-why-sh .pl-why-how') }; };
  let a = await open({ seed: m2('hot', 0), hash: '#plan' });
  const sk = await why(a.page, 'skill');
  check('16.1 the skill’s Why?: its How is this week’s skill in the chapter’s words', /notice it, name it/.test(sk.all) && /When a flush starts, tell yourself/.test(sk.how) && !/from this week’s chapter/.test(sk.how), sk); await done(a);
  a = await open({ seed: m2('hot', 0), hash: '#plan' });
  const ca = await why(a.page, 'ca');
  check('16.1 the calcium food’s Why?: no How that repeats its subtitle', /calcium food/.test(ca.all) && !(await has(a.page, '.pl-why-sh .pl-why-how')), ca); await done(a);
  a = await open({ seed: m2('hot', 0), hash: '#plan' });
  const mv = await why(a.page, 'move');
  check('16.1 the walk keeps its own How', /talk, but not sing/.test(mv.how), mv); await done(a);
  /* 3 "How your plan works": every week, her chapter */
  a = await open({ seed: m2('hot', B(2)), hash: '#plan' });
  check('16.2 "How your plan works": every week, a short chapter and a look back', /Every week A short chapter and a look back/.test(await txt(a.page, '#view .pl-rh')), await txt(a.page, '#view .pl-rh')); await done(a);
  a = await open({ seed: m2('hot', B(2), { pv: 1 }), hash: '#plan' });
  check('16.2 version 1 keeps "Look back, plan the week"', /Every week Look back, plan the week/.test(await txt(a.page, '#view .pl-rh')), await txt(a.page, '#view .pl-rh')); await done(a);
  /* 4 her plan's chapter lights My plan */
  a = await open({ seed: m2('hot', B(1)), hash: '#mid-lesson' });
  check('16.3 her chapter lights My plan, not Explore', /My plan/.test(await txt(a.page, '#tabbar .on')) && /notice it, name it|What a hot flush is/.test(await view(a.page)), await txt(a.page, '#tabbar .on')); await done(a);
  /* 5 her PMOS plan's check-in this morning, then My midlife plan the same day */
  a = await open({ seed: { dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5), mods: { plan: planOf('cycle', 'pmos', 3, { log: { [TODAY]: { ci: 1, slp: 'ok', ck: { move: 'n' } } } }) }, reminders: [planRem(3)] }, hm: '20:30' });
  await startPlan(a.page, { stage: 'meno', goal: 'hot', iq: 1 }, { mbone: 'n', mheart: 'n' });
  const p5 = (await st(a.page)).mods.plan; const lg = (p5.log || {})[TODAY] || {};
  check('16.4 a plan started after today’s check-in asks its own tonight, and her answers stay', p5.pack === 'meno' && p5.start === TODAY && !lg.ci && lg.slp === 'ok', { pack: p5.pack, lg });
  await go(a.page, 'home');
  check('16.4 Today offers its check-in, not "Checked in today"', await has(a.page, '#view .pl-t-ci') && !/Checked in today/.test(await view(a.page)), (await view(a.page)).slice(0, 600)); await done(a);
}

// ---------- 17 the second exploratory phone test's 3 gaps ----------
{
  /* the check-in with these answers (step id: d, p or n), saved */
  const ciSave = async (page, sel) => { for (const [id, v] of Object.entries(sel)) await tap(page, '#view [data-ci="' + id + ':' + v + '"]'); await tap(page, '#pl-ci-save');
    return { tom: await txt(page, '#view .pl-ci-tomr'), add: await txt(page, '#view .pl-ci-add'), all: await view(page) }; };
  /* 1 one "Tomorrow" line: Mohit's day 1 (skill done, the walk and the calcium food not today; tomorrow is a strength day) */
  let a = await open({ seed: m2('hot', 0), hash: '#plan-checkin', hm: '20:30' });
  const c1 = await ciSave(a.page, { skill: 'd', move: 'n', ca: 'n' });
  check('17.1 day 1’s check-in: one "Tomorrow" line, with tomorrow’s steps, and no "Tomorrow, add" for a calcium food tomorrow doesn’t have', /^Tomorrow: your skill, your walk, Strength at home\.$/.test(c1.tom) && !c1.add && (c1.all.match(/Tomorrow/g) || []).length === 1, c1); await done(a);
  /* the add line names only steps tomorrow has: the PMOS plan's yoga today, strength tomorrow */
  a = await open({ seed: { intake: { goal: 'pmos', stage: 'cycle' }, goals: ['pmos'], mods: { plan: planOf('cycle', 'pmos', 0) }, reminders: [planRem(0)] }, hash: '#plan-checkin', hm: '20:30' });
  const xs = await a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, r: x.r || null, title: x.title, name: x.name || '' })));
  const rt = xs.find((x) => x.kind === 'routine'); const sel = {}; xs.filter((x) => x.kind !== 'check').forEach((x) => { sel[x.id] = x.kind === 'minutes' ? 'd' : 'n'; });
  const c2 = await ciSave(a.page, sel);
  check('17.1 the PMOS plan: "Tomorrow, add" names the steps tomorrow has, not today’s yoga when tomorrow has another routine', !!rt && /^Tomorrow: /.test(c2.tom) && c2.tom.indexOf(rt.title.split(' · ')[0]) < 0 && /^Tomorrow, add: /.test(c2.add) && !/yoga/i.test(c2.add), { rt, c2 }); await done(a);
  /* 2 no PMOS plan tile while another plan runs */
  const pmosTile = (page) => page.evaluate(() => { const x = window.Saathi.tiles().find((y) => y.route === 'plan-pmos'); return !!(x && !(x.hidden && x.hidden())); });
  a = await open({ seed: m2('hot', B(2), null, { situation: { stopped: true, pcos: true }, goals: ['meno', 'hot', 'pmos'] }), hash: '#care' });
  check('17.2 her midlife plan runs: no "PMOS: food, yoga and moves" tile (it opened her midlife plan)', !(await pmosTile(a.page)) && !(await has(a.page, '#view [data-go="plan-pmos"]')), (await view(a.page)).slice(0, 500)); await done(a);
  a = await open({ seed: { situation: { pcos: true }, intake: { goal: 'pmos', stage: 'cycle' }, goals: ['pmos'], mods: { plan: planOf('cycle', 'pmos', 3) }, reminders: [planRem(3)] }, hash: '#care' });
  check('17.2 her PMOS plan runs: its tile stays', await pmosTile(a.page)); await done(a);
  /* 3 an undone tick is unanswered again, so the check-in asks it */
  a = await open({ seed: m2('hot', 0), hm: '19:30' });
  await tap(a.page, '#view .today-plan-ca [data-today-act]'); await tap(a.page, '#view .today-plan-ca [data-today-undo]');
  const ck3 = (((await st(a.page)).mods.plan.log || {})[TODAY] || {}).ck || {};
  await go(a.page, 'plan-checkin');
  check('17.3 a tick tapped by mistake and undone: unanswered, and the check-in has no "Not today" picked', ck3.ca == null && !(await has(a.page, '#view [data-ci^="ca:"].on')), ck3); await done(a);
  /* her own walk counts: undoing a walk her minutes did keeps it off, as "Not today" */
  a = await open({ seed: m2('hot', 0, { log: { [TODAY]: { min: 20 } } }), hm: '19:30' });
  const ok0 = await has(a.page, '#view .today-plan-move.today-ok');
  await tap(a.page, '#view .today-plan-move [data-today-undo]');
  const lg4 = (((await st(a.page)).mods.plan.log || {})[TODAY] || {});
  check('17.3 a walk done by her own minutes, undone: off Today, as "Not today", and her minutes stay', ok0 && (lg4.ck || {}).move === 'n' && lg4.min === 20 && !(await has(a.page, '#view .today-plan-move.today-ok')), { ok0, lg4 }); await done(a);
}

// ---------- 18 the bone-safe stop-gap ----------
{
  const ids = (page) => page.$$eval('#view .pl-ritem', (x) => x.map((y) => y.dataset.go));
  let a = await open({ seed: m2('hot', B(2)), hash: '#plan-moves' });
  const i1 = await ids(a.page);
  check('18.1 her midlife plan runs: no Cycle care yoga (child pose) and no sun salutation (forward bends); Strength at home, Steady on your feet and Gentle start stay', i1.indexOf('plan-r-cycle') < 0 && i1.indexOf('plan-r-sun') < 0 && ['plan-r-strength', 'plan-r-steady', 'plan-r-gentle'].every((x) => i1.indexOf(x) >= 0), i1);
  await go(a.page, 'plan-r-sun');
  check('18.1 the sun salutation’s own page opens Moves and calm instead', await has(a.page, '#view .pl-ritem[data-go="plan-r-strength"]') && !/Hasta padasana/.test(await view(a.page)), (await view(a.page)).slice(0, 200)); await done(a);
  a = await open({ seed: { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400) }, hash: '#plan-moves' });
  const i2 = await ids(a.page);
  check('18.2 midlife with no plan running: the same', i2.length > 0 && i2.indexOf('plan-r-cycle') < 0 && i2.indexOf('plan-r-sun') < 0, i2); await done(a);
  a = await open({ seed: { dob: '1982-03-01', situation: { midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(5), mods: { plan: planOf('cycle', 'pmos', 30) }, reminders: [planRem(30)] }, hash: '#plan-moves' });
  const i3 = await ids(a.page);
  check('18.3 a midlife woman who kept her PMOS plan keeps Cycle care yoga (her plan rotates it)', i3.indexOf('plan-r-cycle') >= 0, i3); await done(a);
  a = await open({ seed: { intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', 30) } }, hash: '#plan-moves' });
  const i4 = await ids(a.page);
  check('18.4 a 30-year-old on the PMOS plan keeps Cycle care yoga and the sun salutation', i4.indexOf('plan-r-cycle') >= 0 && i4.indexOf('plan-r-sun') >= 0, i4); await done(a);
}

// ---------- 19 the discreet path cards ----------
{
  const all = (pg) => pg.$eval('#view', (e) => e.textContent.replace(/\s+/g, ' '));   /* folded cards too */
  /* Mohit's phone: discreet mode, My midlife plan in week 1 (the path card) and in week 2 (the weeks card) */
  let a = await open({ seed: m2('hot', B(2), null, { settings: { discreet: true } }), hash: '#plan' });
  const v1 = await all(a.page);
  check('19.1 a shared phone, week 1: no "Your 12 weeks" path card on My midlife plan, and no "hot flushes" on My plan', !(await has(a.page, '#view .pl-m2path')) && !/hot flush/i.test(v1) && /Your step 1/.test(v1), v1.slice(0, 600)); await done(a);
  a = await open({ seed: m2('hot', B(9), null, { settings: { discreet: true } }), hash: '#plan' });
  const v1b = await all(a.page);
  check('19.1 ... and week 2: no "hot flushes" either', !/hot flush/i.test(v1b), v1b.slice(0, 600)); await done(a);
  a = await open({ seed: m2('hot', B(2)), hash: '#plan' });
  check('19.1 not shared: the path card stays', await has(a.page, '#view .pl-m2path')); await done(a);
  /* Getting ready for a baby: its parts name her tablet and his part */
  const ttc = (startAgo, x) => Object.assign({ dob: '1996-05-01', situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, goals: ['ttc', 'ready'],
    mods: { plan: planOf('ttc', 'ready', startAgo, { pv: 2, when: 'evening', intake: { at: ago(startAgo + 1), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' } }) }, reminders: [planRem(startAgo)] }, x || {});
  for (const [wk, sa] of [[1, B(3)], [2, B(10)]]) {
    a = await open({ seed: ttc(sa, { settings: { discreet: true } }), hash: '#plan' });
    const v2 = await all(a.page);
    check('19.2 a shared phone, week ' + wk + ': Getting ready’s "Your 12 weeks" names neither her tablet nor his part', !(await has(a.page, '#view .pl-bpath')) && !/his part|your tablet/i.test(v2), v2.slice(0, 700)); await done(a);
    a = await open({ seed: ttc(sa), hash: '#plan' });
    check('19.2 not shared, week ' + wk + ': her parts stay', /his part/i.test(await all(a.page)), (await all(a.page)).slice(0, 400)); await done(a);
  }
}

// ---------- 20 her parts on the weeks card ----------
{
  /* from week 2 My plan's "Your 12 weeks" is the weeks card: this week's part, and each week's in "All 12 weeks" */
  const wks = async (page) => ({ txt: await txt(page, '#view .pl-weeks'), all: await page.$$eval('#view .pl-weeks .pl-steps li', (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim())) });
  let a = await open({ seed: m2('hot', B(9)), hash: '#plan' });
  let w = await wks(a.page);
  check('20.1 week 2, hot flushes: "This week Cool and calm · A short course for hot flushes, a chapter a week"', /This week Cool and calm · A short course for hot flushes, a chapter a week/.test(w.txt), w.txt.slice(0, 300));
  check('20.1 her 12 weeks in her order: Rest in weeks 5 to 8, Strong and steady in 9 to 11, with the 4-week and 8-week checks and her results kept', w.all.length === 12 && /Rest · One sleep rule a week/.test(w.all[4]) && /Strong and steady · Strength, balance and food for your bones/.test(w.all[8]) && /4-week check|look-back/.test(w.all[3]) && /8-week check|look-back/.test(w.all[7]) && /results/i.test(w.all[11]), w.all); await done(a);
  a = await open({ seed: m2('bones', B(9)), hash: '#plan' });
  w = await wks(a.page);
  check('20.2 bones: Strong and steady first, then Cool and calm, then Rest', /This week Strong and steady/.test(w.txt) && /Cool and calm/.test(w.all[4]) && /Rest ·/.test(w.all[8]), w.all); await done(a);
  a = await open({ seed: m2('hot', B(9), null, { settings: { discreet: true } }), hash: '#plan' });
  w = await wks(a.page);
  check('20.3 a shared phone: "Your daily steps", no parts', /This week Your daily steps/.test(w.txt) && !/Cool and calm|Rest ·|Strong and steady/.test(w.all.join(' ')), w.txt.slice(0, 300)); await done(a);
}

// ---------- 21 POI while her plan runs ----------
{
  /* Mohit's phone: her midlife plan running, then her periods stopped, and she is 37 */
  const poi = (x) => m2('hot', B(3), null, Object.assign({ dob: '1989-03-01' }, x || {}));
  const rem = (page) => page.evaluate(() => ((window.Saathi.state.reminders || []).find((r) => r.id === 'plan') || null));
  let a = await open({ seed: poi() });
  check('21.1 under 40 with her periods stopped: the gynaecologist card on Today, where her plan was', /Before a plan: see a gynaecologist/.test(await txt(a.page, '#view .pl-m2-poi')) && /not menopause/.test(await txt(a.page, '#view .pl-m2-poi')) && !(await has(a.page, '#view .today-plan-skill')), (await view(a.page)).slice(0, 600));
  check('21.1 her plan rests: no check-in reminder', !(await rem(a.page)), await rem(a.page));
  await go(a.page, 'plan');
  check('21.1 My plan: the card alone (no steps, no other pause line)', await has(a.page, '#view .pl-m2-poi') && !(await has(a.page, '#view .pl-steps-card')) && !(await has(a.page, '#view .pl-paused')), (await view(a.page)).slice(0, 500));
  await tap(a.page, '#pl-m2-poi-ok'); await go(a.page, 'home');
  check('21.2 "My doctor has seen me": her plan and its reminder come back', await has(a.page, '#view .today-plan-skill') && !(await has(a.page, '#view .pl-m2-poi')) && !!(await rem(a.page)), { rem: await rem(a.page), v: (await view(a.page)).slice(0, 300) }); await done(a);
  a = await open({ seed: m2('hot', B(3)) });
  check('21.3 at 51 with her periods stopped: her plan runs, no card', await has(a.page, '#view .today-plan-skill') && !(await has(a.page, '#view .pl-m2-poi'))); await done(a);
  a = await open({ seed: poi({ situation: { midlife: true } }) });
  check('21.3 at 37 with periods still coming: her plan runs (no POI card)', await has(a.page, '#view .today-plan-skill') && !(await has(a.page, '#view .pl-m2-poi'))); await done(a);
}

// ---------- 22 the hold's phone test (Mohit, 1 Nov: "fix all 4") ----------
{
  /* Mohit's Flip5: her midlife plan held for her doctor (37, periods stopped), just after she set her stage, an earlier run of the
     plan in her past, and PMOS in her answers */
  const P0 = { setup: 'off', planCall: ago(3), firstLog: ago(30), exStage: ago(0) };
  const held = (x) => m2('hot', B(1), { past: [{ pack: 'meno', goalKey: 'hot', pv: 2, start: ago(2), end: ago(1), days: 1 }] }, Object.assign({ dob: '1989-03-01', situation: { stopped: true, pcos: true }, prompts: P0 }, x || {}));
  const where = (page) => page.evaluate(() => { const v = document.getElementById('view'); const c = v.querySelector('.pl-m2-poi'); const f = v.querySelector('.feel-card'); const r = v.querySelector('.ract-row');
    const sh = v.querySelector('.slot .slot-h'); const lead = sh && sh.nextElementSibling;
    return { card: !!c, inSlot: !!(c && c.closest('.slot')), beforeFeel: !!(c && f && (c.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING)), afterRound: !!(c && r && (r.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING)),
      leads: !!(lead && lead.classList.contains('pl-m2-poi')), keep: !!(c && c.hasAttribute('data-slot-keep')) }; });
  let a = await open({ seed: held() });
  let w = await where(a.page);
  check('22.1 Today: the card stands where her plan was (after the round buttons, before "How do you feel today?", not in Sakhi says)', w.card && !w.inSlot && w.beforeFeel && w.afterRound, w);
  check('22.2 Today: no "Tell Sakhi your stage and goals" just after she set her stage, while the card holds her plan', !(await has(a.page, '#view .ex-card')), (await view(a.page)).slice(0, 400));
  await go(a.page, 'plan');
  const mp = await a.page.evaluate(() => { const v = document.getElementById('view'); const f = v.querySelector('h1 ~ .card'); return { first: f ? f.className : '', past: !!v.querySelector('.pl-past'), txt: v.innerText }; });
  check('22.3 My plan: the card first and alone, no "Your last plan" above it', /pl-m2-poi/.test(mp.first) && !mp.past, mp.first);
  check('22.4 My plan: no "After your 6-week check", and no PMOS plan row beside the card', !/After your 6-week check/.test(mp.txt) && !(await has(a.page, '#view [data-go="plan-pmos"]')), mp.txt.slice(0, 600));
  await go(a.page, 'home'); await tap(a.page, '#view .pl-m2-poi #pl-m2-poi-ok');
  check('22.5 "My doctor has seen me" from its place on Today: her plan comes back', await has(a.page, '#view .today-plan-skill') && !(await has(a.page, '#view .pl-m2-poi')), (await view(a.page)).slice(0, 300)); await done(a);
  /* no plan yet (she joined at 37 with her periods stopped): the card is her plan's offer in Sakhi says, and it always leads */
  a = await open({ seed: { dob: '1989-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['hot'], events: regular(400), prompts: P0 } });
  w = await where(a.page);
  check('22.6 no plan yet: the card leads Sakhi says and stays first (a card that keeps her safe), with no goals ask', w.inSlot && w.leads && w.keep && !(await has(a.page, '#view .ex-card')), w); await done(a);
  /* at 51 with her periods stopped, nothing changes: her plan runs and Today asks nothing new */
  a = await open({ seed: m2('hot', B(3), null, { prompts: P0 }) });
  check('22.7 at 51: her plan runs, no card, no PMOS change', await has(a.page, '#view .today-plan-skill') && !(await has(a.page, '#view .pl-m2-poi'))); await done(a);
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const n = results.filter((r) => r.pass).length;
console.log(n + '/' + results.length + ' checks passed');
process.exit(n === results.length ? 0 : 1);
