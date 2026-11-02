// Version 39.55: My period plan (Mohit, 2 Nov: "proceed building with your recommendations"; advice
// docs/period-plan-advice-2026-11-02.md; canvas claude.ai/artifact/9YbP1fyNWG8gN5gF41c7vS).
// pain, heavy and pms version 2 (web/progs/v1.js): her first period goal leads, the others join; her cycle sets the steps:
// - period days: her kit, "Pain today?" and "Your period today" in the check-in, a rest lying down on a heavy day;
// - the 7 days before her likely start: her kit ready (its last 2 days), Cycle care yoga from week 6, her calm-week plan;
// - between: Relax, moving on 3 days, strength from week 5 (week 7 when heavy leads), an iron food, a calcium food;
// - a chapter a week (mods/perplan.js), one card at a time (week 4's doctor card, the second period's card for the days
//   before), version 1 offered version 2 once, a Qura doctor on her doctor check, the fixed Hb line beside her Hb results;
// - 7, the test pass's fixes (2 Nov): My plan's period pain questions, the endometriosis answer kept, "Your plan is ready" saying
//   when each step comes, Today's offer naming My period plan, and the anaemia guide when heavy periods join.
// Usage: node test/periodplan.mjs [web dir]
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
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.55-pilot', platform: 'android' };
/* periods every 28 days, 5 days long; the last started `last` days ago (its likely next start is 26 to 30 days after it) */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const ANS = { stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], pain: 'pk', painDays: '23', endo: 'n', pads: 'p23', clots: 'n', tired: 'n', pms: ['mood', 'irr'], pmsLevel: 'little', when: 'dinner' };
const planOf = (g, startAgo, extra) => Object.assign({ pack: g, goalKey: g, start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', intake: Object.assign({ goal: g }, ANS) }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
/* Priya, 28, tracking her periods: her plan led by g since day 1 = startAgo + 1 days ago, her other goals `also` */
const per = (g, startAgo, o) => { o = o || {}; const px = o.px || {}; const pk = Object.assign({}, px); delete pk.a;
  return Object.assign({ dob: '1998-05-01', situation: {}, goals: [g].concat(o.also || []), intake: { goal: g, stage: 'cycle' }, events: regular(o.last == null ? 10 : o.last),
    mods: { plan: planOf(g, startAgo, Object.assign({ intake: Object.assign({ goal: g }, ANS, px.a || {}) }, pk)) }, reminders: [planRem(startAgo)] }, o.x || {}); };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'pain' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

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
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const acts = (page) => page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub || '', go: x.go || '' })));
const ids = async (page) => (await acts(page)).map((x) => x.id);
const B = (d) => d - 1;   /* plan day d starts d - 1 days ago */

// ---------- 1 the version, the title and day 1 ----------
{
  let a = await open({ seed: per('pain', B(1), { also: ['heavy'] }) });
  const sp = await a.page.evaluate(() => { const P = window.Saathi.plan; return { pain: (P.progs.spec('pain') || {}).ver, heavy: (P.progs.spec('heavy') || {}).ver, pms: (P.progs.spec('pms') || {}).ver, v1: !!P.progs.spec('pain', 1) && !!P.progs.spec('heavy', 1) && !!P.progs.spec('pms', 1),
    cyc: ['pain', 'heavy', 'pms'].map((g) => P.packFor(g, 'cycle')), mid: P.packFor('heavy', 'meno') }; });
  check('1.1 a new plan for pain, heavy periods or the days before is version 2, and version 1 runs on', sp.pain === 2 && sp.heavy === 2 && sp.pms === 2 && sp.v1, sp);
  check('1.1 each goal opens its own plan (her first goal leads); heavy periods after 40 keep it', sp.cyc.join() === 'pain,heavy,pms' && sp.mid === 'heavy', sp);
  let v = await view(a.page);
  check('1.2 Today: "My period plan"', /My period plan/i.test(v), v.slice(0, 400));
  let x = await acts(a.page);
  check('1.3 day 1 (between her periods): Relax, a walk and, with heavy periods too, her Hb test: 3 steps', x.length === 3 && x.map((y) => y.id).join() === 'relax,move,hb', x);
  check('1.3 Relax opens Wind down’s slow breaths', (x.find((y) => y.id === 'relax') || {}).go === 'calm-breaths', x);
  check('1.4 this week’s chapter is one row: "Why periods hurt"', /This week.s chapter/.test(v) && /Why periods hurt/.test(v), v.slice(0, 900));
  await tap(a.page, '#view [data-per-les]');
  v = await view(a.page);
  check('1.4 the chapter opens: its cards, why it helps, Done', /Why periods hurt/.test(v) && /chapter 1 of 12/i.test(v) && /Why this helps/i.test(v) && /womb squeezes/.test(v) && await has(a.page, '#per-les-done'), v.slice(0, 400));
  await tap(a.page, '#per-les-done');
  check('1.4 read once, the row goes', !(await has(a.page, '#view [data-per-les]')), (await view(a.page)).slice(0, 300));
  await done(a);
  for (const g of ['heavy', 'pms']) {
    a = await open({ seed: per(g, B(1)) }); x = await acts(a.page);
    check('1.5 day 1 has 3 steps or fewer when ' + g + ' leads', x.length <= 3 && x.length >= 2, x); await done(a);
  }
}

// ---------- 2 her cycle sets the steps ----------
{
  /* a period day (her period started today), on plan day 3 */
  let a = await open({ seed: per('pain', B(3), { also: ['heavy'], last: 0 }) });
  let x = await ids(a.page);
  check('2.1 a period day: her kit first, rest or a short walk, her Hb test, an iron food; no Relax', x[0] === 'kit' && x.indexOf('rest') > 0 && x.indexOf('iron') > 0 && x.indexOf('relax') < 0 && x.length <= 4, x);
  const kit = (await acts(a.page)).find((y) => y.id === 'kit') || {};
  check('2.1 the kit opens the cramps routine, with its own line', kit.go === 'relief-cramps' && /Warmth/.test(kit.sub), kit);
  await done(a);
  /* the 2 days before her likely start: her kit made ready */
  a = await open({ seed: per('pain', B(4), { last: 24 }) });
  x = await ids(a.page);
  check('2.2 the 2 days before her period: "Get your kit ready"', x.indexOf('kitready') >= 0, x);
  await done(a);
  /* the test pass (2 Nov): her likely days (25 to 31 days after her last start) until her period comes, then late */
  for (const [last, want] of [[27, true], [31, true], [32, false]]) {
    a = await open({ seed: per('pain', B(4), { last: last, also: ['pms'] }) });
    x = await ids(a.page);
    check('2.2 ' + (want ? 'day ' + last + ', inside her likely days, no period yet: her kit ready' : 'day ' + last + ', past her likely days (late): no kit ready'), want ? x.indexOf('kitready') >= 0 : x.indexOf('kitready') < 0, x);
    await done(a);
    a = await open({ seed: per('pms', B(4), { last: last }) });
    x = await ids(a.page);
    check('2.2 ... the days before lead, day ' + last + ': ' + (want ? 'her calm-week plan' : 'no calm-week plan'), want ? x.indexOf('calmweek') >= 0 : x.indexOf('calmweek') < 0, x);
    await done(a);
  }
  /* the 7 days before, from week 6: Cycle care yoga on a moving day */
  a = await open({ seed: per('pain', 35, { last: 22 }) });
  x = await acts(a.page);
  check('2.3 week 6, the week before her period, on a moving day: Cycle care yoga in the walk’s place', x.some((y) => y.id === 'yoga' && y.go === 'plan-r-cycle') && !x.some((y) => y.id === 'move'), x);
  await done(a);
  /* late: past her likely range with no period */
  a = await open({ seed: per('pain', B(4), { last: 35 }) });
  x = await ids(a.page);
  check('2.4 a late period: no kit and no kit ready', x.indexOf('kit') < 0 && x.indexOf('kitready') < 0, x);
  await done(a);
  /* heavy leads: a period day brings a rest lying down; often tired with no Hb test yet: Calm breath in the walk's place */
  a = await open({ seed: per('heavy', B(3), { last: 0 }) });
  x = await acts(a.page);
  check('2.5 heavy leads, a period day: an iron food, her Hb test, a rest lying down (yoga nidra)', x.some((y) => y.id === 'iron') && x.some((y) => y.id === 'hb') && x.some((y) => y.id === 'rest' && y.go === 'calm-nidra'), x);
  await done(a);
  a = await open({ seed: per('heavy', B(3), { px: { a: { tired: 'y' } } }) });
  x = await ids(a.page);
  check('2.6 heavy leads, often tired, Hb test not done: no walk on a moving day, Calm breath instead', x.indexOf('move') < 0 && x.indexOf('calm') >= 0, x);
  await done(a);
  /* the days before lead: her calm-week plan, a calcium food that opens My food */
  a = await open({ seed: per('pms', B(3), { last: 22 }) });
  x = await acts(a.page);
  check('2.7 the days before lead, in the 7 days before her period: Calm breath, her calm-week plan, a calcium food (My food)', x.some((y) => y.id === 'calm') && x.some((y) => y.id === 'calmweek' && y.go === 'relief-calm') && x.some((y) => y.id === 'ca' && y.go === 'food') && x.length <= 4, x);
  await done(a);
  /* never more than 4 steps a day */
  let worst = 0;
  for (const g of ['pain', 'heavy', 'pms']) for (const last of [0, 2, 10, 22, 24]) for (const sa of [B(2), 30, 40]) {
    const b = await open({ seed: per(g, sa, { also: ['pain', 'heavy', 'pms'].filter((y) => y !== g), last }) }); worst = Math.max(worst, (await acts(b.page)).length); await done(b);
  }
  check('2.8 never more than 4 steps a day, whatever joins', worst <= 4, worst);
}

// ---------- 3 the evening check-in ----------
{
  let a = await open({ seed: per('pain', B(3), { also: ['heavy'], last: 0 }), hm: '21:00', hash: '#plan-checkin' });
  let v = await view(a.page);
  check('3.1 a period day: "Pain today?" and "Your period today" (the same 3 taps for pads or cloth)', /Pain today\?/.test(v) && /Your period today/i.test(v) && /pads or cloth/.test(v), v.slice(0, 900));
  await a.page.$$eval('#view .pl-ci .chips', (gs) => gs.forEach((g) => { const b = g.querySelector('[data-ci$=":d"]'); if (b) b.click(); })); await settle(a.page, 200);
  await tap(a.page, '#view [data-pl-pain="pain_2"]');
  await tap(a.page, '#view [data-ci-pt="soak:y"]'); await tap(a.page, '#view [data-ci-pt="clots:clots_2"]'); await tap(a.page, '#view [data-ci-ptw="night"]');
  await tap(a.page, '#pl-ci-save');
  const s = await st(a.page); const e = (s.events || []).find((y) => (y.t === 'start' || y.t === 'start_detail') && y.d === TODAY) || {}; const lg = (((s.mods || {}).plan || {}).log || {})[TODAY] || {};
  check('3.2 saved: her pain, soaked (the day page’s own "every 1–2 hours"), the clots on today’s period entry; changed at night in her plan', e.pain === 'pain_2' && e.pads === 'pads_4' && e.clots === 'clots_2' && lg.pt && lg.pt.night === true, { e, pt: lg.pt });
  await done(a);
  /* the days before lead: she noted a sign today, in the 7 days before her period */
  a = await open({ seed: per('pms', B(3), { last: 22, x: { daily: { [TODAY]: ['d_mood'] } } }), hm: '21:00', hash: '#plan-checkin' });
  v = await view(a.page);
  check('3.3 the 7 days before, a sign today: "Did it get in the way today?"', /Did it get in the way today\?/i.test(v), v.slice(0, 700));
  await a.page.$$eval('#view .pl-ci .chips', (gs) => gs.forEach((g) => { const b = g.querySelector('[data-ci$=":d"]'); if (b) b.click(); })); await settle(a.page, 200);
  await tap(a.page, '#view [data-ci-px="lot"]'); await tap(a.page, '#pl-ci-save');
  const lg2 = ((((await st(a.page)).mods || {}).plan || {}).log || {})[TODAY] || {};
  check('3.3 saved in her plan: a lot', lg2.px === 'lot', lg2);
  await done(a);
  /* a shared phone asks none of these */
  a = await open({ seed: per('pain', B(3), { also: ['heavy'], last: 0, x: { settings: { shared: true } } }), hm: '21:00', hash: '#plan-checkin' });
  v = await view(a.page);
  check('3.4 a shared phone: no "Pain today?", no "Your period today"', !/Pain today\?/.test(v) && !/Your period today/i.test(v), v.slice(0, 400));
  await done(a);
}

// ---------- 4 one card at a time, and a Qura doctor ----------
{
  let a = await open({ seed: per('pain', 22) });
  let v = await view(a.page);
  check('4.1 week 4: "When to see a doctor", with the reviewed line and "Ask a Qura doctor about this" first', /When to see a doctor/.test(v) && /Pain that stops your day needs a doctor/.test(v) && await has(a.page, '#view .pl-per-w4 [data-ask]'), v.slice(0, 900));
  await tap(a.page, '#view [data-pc="w4-ok"]');
  check('4.1 "Got it": the card goes', !(await has(a.page, '#view .pl-per-w4')));
  await done(a);
  a = await open({ seed: per('pms', 32, { last: 4 }) });
  v = await view(a.page);
  check('4.2 the days before lead, her second period since she began: the reviewed doctor line', /second period on the plan/i.test(v) && /stops your day in most cycles/.test(v), v.slice(0, 900));
  await done(a);
  a = await open({ seed: per('pain', B(3), { px: { doc: null, a: { pain: 'stop' } } }) });
  v = await view(a.page);
  check('4.3 her doctor check: "Ask a Qura doctor about this" beside "Yes, done"', await has(a.page, '#view .pl-sl-doc [data-ask]') && /Yes, done/.test(v), v.slice(0, 900));
  await done(a);
  /* a woman on version 1 is offered version 2, once */
  a = await open({ seed: per('pain', 10, { px: { pv: 1 } }) });
  v = await view(a.page);
  check('4.4 version 1: "My period plan is here"', /My period plan is here/.test(v), v.slice(0, 700));
  await tap(a.page, '#view [data-pc="v2-yes"]');
  const d = (((await st(a.page)).mods || {}).plan) || {};
  check('4.4 "Move me to it": version 2, a fresh 12 weeks from today', d.pv === 2 && d.start === TODAY, { pv: d.pv, start: d.start });
  await done(a);
}

// ---------- 5 a shared phone, Hindi, the Hb line ----------
{
  let a = await open({ seed: per('pain', B(1), { x: { settings: { discreet: true } } }) });
  let v = await view(a.page);
  check('5.1 discreet mode: no "My period plan", no chapter title', !/My period plan/.test(v) && !/Why periods hurt/.test(v), v.slice(0, 500));
  await done(a);
  a = await open({ seed: per('pain', B(1), { also: ['heavy'], x: { lang: 'hi' } }), w: 360 });
  v = await view(a.page);
  check('5.2 Hindi at 360 px: "मेरा पीरियड प्लान", fits', /मेरा पीरियड प्लान/.test(v) && await noScroll(a.page), v.slice(0, 300));
  await done(a);
  a = await open({ seed: per('heavy', B(5), { x: { mods: { cond: { labs: [{ k: 'hb', v: 9.8, u: 'g/dL', d: ago(2), lo: 12, hi: 15 }] }, plan: planOf('heavy', B(5)) } } }), hash: '#cond-anaemia' });
  v = await view(a.page);
  check('5.3 beside her Hb results: the fixed line (below 8, see a doctor this week)', /below 8, see a doctor this week/.test(v), v.slice(0, 700));
  await go(a.page, 'home');
  check('5.3 a saved Hb result counts as her Hb test done', !(await ids(a.page)).includes('hb'), await ids(a.page));
  await done(a);
}

// ---------- 6 her results ----------
{
  /* pain leads, heavy periods join: her periods before the plan and since, with pain and flow on each */
  const ev = [];
  [[94, 'pain_3', 'pads_4'], [66, 'pain_3', 'pads_4'], [38, 'pain_2', 'pads_2'], [10, 'pain_1', 'pads_2']].forEach((x) => ev.push({ d: ago(x[0]), t: 'start', pain: x[1], pads: x[2], clots: '', leaked: false }, { d: ago(x[0] - 4), t: 'end' }));
  let a = await open({ seed: per('pain', 50, { also: ['heavy'], x: { events: ev } }), hash: '#plan-progress' });
  const hp = await a.page.evaluate(() => [window.Saathi.t('plan_prog_pain'), window.Saathi.t('plan_res_heavy')]);
  let v = await view(a.page);
  check('6.1 My progress: period pain before and since, and heavy periods too (a goal that joins)', v.indexOf(hp[0]) >= 0 && v.indexOf(hp[1]) >= 0, { hp, v: v.slice(0, 600) });
  await done(a);
  a = await open({ seed: per('pain', 90), hash: '#plan-end' });
  v = await view(a.page);
  check('6.2 the end page: "Still hard?" with "Show this page to a doctor" and a Qura doctor', /Still hard\? A doctor can treat painful and heavy periods and PMS/.test(v) && await has(a.page, '#view .pl-end-doc [data-ask]'), v.slice(0, 900));
  await done(a);
}

// ---------- 7 the test pass's fixes (2 Nov: "test properly for any bugs or gaps") ----------
const revealCards = async (page, ik) => { await page.evaluate((x) => { window.Saathi.plan.startFromIntake(x); window.Saathi.save(); }, ik); await go(page, 'plan-reveal');
  const out = []; for (let i = 0; i < 8; i++) { out.push({ v: await view(page), st: await has(page, '#view .pl-rv-steps'), tl: await page.$$eval('#view .pl-tl li', (x) => x.map((y) => y.innerText.replace(/\s+/g, ' ').trim())) });
    if (await has(page, '#pl-rv-go') || !(await has(page, '#pl-rv-next'))) break; await tap(page, '#pl-rv-next'); }
  return { steps: (out.find((x) => x.st) || { v: '' }).v, tl: (out.find((x) => x.tl.length) || { tl: [] }).tl }; };
const IK = { pain: { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', endo: 'n', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening' },
  heavy: { stage: 'cycle', goal: 'heavy', pads: 'p23', clots: 'n', tired: 'y', food: 'veg', milk: 'y', lim: [], when: 'evening' },
  pms: { stage: 'cycle', goal: 'pms', pms: ['mood'], pmsLevel: 'little', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening' } };
const NOPLAN = (g, x) => Object.assign({ goals: [g], intake: { goal: g, stage: 'cycle' } }, x || {});
{
  /* 7.1 My plan's goal flow: period pain's questions (its screen had no heading, so it crashed), the endometriosis question needs
     no answer, and a yes is kept and shown */
  let a = await open({ seed: NOPLAN('pain'), hash: '#plan' });
  await tap(a.page, '#view [data-pl-pick="pain"]');
  let v = await view(a.page);
  check('7.1 My plan > period pain: its questions with the endometriosis one (no "Something went wrong")', /About your period pain/.test(v) && /endometriosis or adenomyosis\?/.test(v) && !/Something went wrong/.test(v), v.slice(0, 300));
  await tap(a.page, '[data-pl-q="pain:pk"]'); await tap(a.page, '[data-pl-q="painDays:23"]'); await tap(a.page, '#pl-in-next');
  check('7.1 ... Continue without the endometriosis answer, to "Your day" with no bedtime or work', await has(a.page, '[data-pl-q^="act:"]') && !(await has(a.page, '[data-pl-q^="bed:"]')) && !(await has(a.page, '[data-pl-q^="work:"]')), (await view(a.page)).slice(0, 300));
  await done(a);
  a = await open({ seed: NOPLAN('pain'), hash: '#plan' });
  await tap(a.page, '#view [data-pl-pick="pain"]');
  for (const q of ['pain:pk', 'painDays:23', 'endo:y']) await tap(a.page, '[data-pl-q="' + q + '"]');
  await tap(a.page, '#pl-in-next'); await tap(a.page, '[data-pl-q="act:0"]'); await tap(a.page, '[data-pl-m="lim:none"]'); await tap(a.page, '#pl-in-next');
  if (await has(a.page, '[data-pl-when="evening"]')) await tap(a.page, '[data-pl-when="evening"]');
  v = await view(a.page);
  check('7.1 ... her summary says what she told Sakhi, the doctor\'s diagnosis too', /endometriosis or adenomyosis \(a doctor said\)/.test(v), v.slice(0, 400));
  await tap(a.page, '#pl-in-make');
  check('7.1 ... and her plan keeps it (the endometriosis version)', (((await st(a.page)).mods.plan || {}).next || {}).intake.endo === 'y');
  await done(a);
  /* 7.2 "Your plan is ready": each step says when it comes, and "What happens when" names her cycle's steps that aren't today's */
  a = await open({ seed: NOPLAN('pain') });
  let r = await revealCards(a.page, IK.pain);
  check('7.2 period pain, between periods: "Every day: Relax" and "3 days a week: Walk" (not "Every day")', /Every day: Relax, 5 minutes/.test(r.steps) && /3 days a week: Walk or move \d+ minutes/.test(r.steps), r.steps);
  check('7.2 ... "What happens when": her kit on period days and before, the chapter, week 4, strength, yoga, week 12', r.tl[0] === 'On your period days: your period kit, and just before, get it ready' && r.tl.indexOf('Every week: a short chapter, and a look back at your week') >= 0 &&
    r.tl.indexOf('Week 4: a look at your first month, and when to see a doctor') >= 0 && r.tl.indexOf('From week 5: Strength at home on 2 of your walking days') >= 0 && r.tl.indexOf('From week 6, in the week before your period: Cycle care yoga') >= 0 && r.tl[r.tl.length - 1] === 'Week 12: your results, next to where you started', r.tl);
  await done(a);
  a = await open({ seed: NOPLAN('pain', { events: regular(0) }) });
  r = await revealCards(a.page, IK.pain);
  check('7.2 period pain, on a period day: "On your period days: Your period kit", and the row after names only getting it ready', /On your period days: Your period kit/.test(r.steps) && !/Every day: Your period kit/.test(r.steps) && r.tl[0] === 'Just before your period: get your kit ready', [r.steps, r.tl]);
  await done(a);
  a = await open({ seed: NOPLAN('pms', { events: regular(24) }) });
  r = await revealCards(a.page, IK.pms);
  check('7.2 the days before, 2 days before her period: "The 7 days before your period: Your calm-week plan", not "Every day", and no row repeats it', /The 7 days before your period: Your calm-week plan/.test(r.steps) && !/Every day: Your calm-week plan/.test(r.steps) && !r.tl.some((x) => /calm-week/.test(x)), [r.steps, r.tl]);
  await done(a);
  a = await open({ seed: NOPLAN('pain', { goals: ['pain', 'pms'] }) });
  r = await revealCards(a.page, IK.pain);
  check('7.2 pain leading, the days before joining: no calm-week plan promised (they join as the evening question)', r.tl.length && !r.tl.some((x) => /calm-week/.test(x)), r.tl);
  await done(a);
  a = await open({ seed: NOPLAN('heavy') });
  r = await revealCards(a.page, IK.heavy);
  check('7.2 heavy periods (often tired): the iron food as it is, the Hb test once, a rest on period days, strength from week 7', /One iron-rich food step every day/.test(r.steps) && !/Your iron tablet/.test(r.steps) && /Once, in your first 3 weeks: Get your Hb tested/.test(r.steps) &&
    r.tl[0] === 'On your period days: a rest lying down (yoga nidra)' && r.tl.indexOf('From week 7: Strength at home on 2 of your walking days') >= 0, [r.steps, r.tl]);
  await done(a);
  a = await open({ seed: NOPLAN('pain', { settings: { discreet: true, toursAuto: false, notify: true } }) });
  r = await revealCards(a.page, IK.pain);
  check('7.2 a shared phone: the usual 3 rows, no period words', r.tl.length === 3 && !r.tl.some((x) => /period/i.test(x)), r.tl);
  await done(a);
  /* 7.5 one home for each fact: her "Get your kit ready" step holds the heads-up card's advice; 3 days before, the card still comes */
  a = await open({ seed: per('pain', B(4), { last: 24 }) });
  check('7.5 pain leads, 1 day before her likely days: "Get your kit ready", and no heads-up card repeating it', (await ids(a.page)).indexOf('kitready') >= 0 && !(await has(a.page, '#view .hu-card')), await ids(a.page));
  await done(a);
  a = await open({ seed: per('pain', B(4), { last: 22 }) });
  check('7.5 ... 3 days before: the heads-up card, and no kit step yet', (await ids(a.page)).indexOf('kitready') < 0 && await has(a.page, '#view .hu-card'), await ids(a.page));
  await done(a);
  a = await open({ seed: per('pms', B(4), { last: 24 }) });
  check('7.5 ... the days before leading (no kit step): the heads-up card stays', await has(a.page, '#view .hu-card'));
  await done(a);
  /* 7.6 a shared phone on a period day (pain leads, heavy joins): no word of her period on Today, My plan or the check-in */
  const DISC = { settings: { discreet: true, toursAuto: false, notify: true } };
  const LEAK = /period|pain|cramp|bleed|blood|iron|kit|heavy|haemo|\bHb\b/i;
  a = await open({ seed: Object.assign(per('pain', B(3), { also: ['heavy'], last: 0 }), DISC) });
  v = await txt(a.page, '#view .td-card, #view [data-today-card]') || await view(a.page);
  const td = (await view(a.page)); const tdPlan = td.slice(td.indexOf('MY PLAN'), td.indexOf('Check-in at'));
  check('7.6 a shared phone, a period day: Today\'s plan card names nothing of her period ("Rest today, or walk 10 minutes" without its line)', /Rest today, or walk 10 minutes/.test(tdPlan) && !LEAK.test(tdPlan.replace('Rest today, or walk 10 minutes', '')), tdPlan);
  await go(a.page, 'plan'); v = await view(a.page);
  const mp = v.slice(0, v.indexOf('Your care team'));
  check('7.6 ... My plan too', !LEAK.test(mp.replace('Rest today, or walk 10 minutes', '')), mp.slice(0, 500));
  await a.page.clock.setSystemTime(new Date(TODAY + 'T21:00:00+05:30')); await go(a.page, 'plan-checkin'); v = await view(a.page);
  check('7.6 ... and the check-in: no "Pain today?", no "Your period today"', !LEAK.test(v.replace('Rest today, or walk 10 minutes', '')), v.slice(0, 500));
  await done(a);
  /* 7.7 Hindi at 360 px: "Your plan is ready" with its new lines, fitting */
  a = await open({ seed: NOPLAN('pain', { lang: 'hi' }), w: 360, h: 800 });
  r = await revealCards(a.page, Object.assign({}, IK.pain));
  check('7.7 Hindi at 360 px: the steps and "What happens when" in Hindi, fitting', /हफ़्ते में 3 दिन/.test(r.steps) && r.tl[0] === 'पीरियड के दिनों में: पीरियड की आपकी किट, और ठीक पहले उसे तैयार रखें' && await noScroll(a.page), [r.steps.slice(0, 200), r.tl]);
  await done(a);
  /* 7.8 her evening answers lead somewhere: My progress counts the days it got in her way (they were saved and never read) */
  const lg = {}; lg[ago(20)] = { ci: 1, px: 'lot' }; lg[ago(19)] = { ci: 1, px: 'lot' }; lg[ago(18)] = { ci: 1, px: 'little' };
  a = await open({ seed: per('pms', 40, { px: { log: lg } }), hash: '#plan-progress' });
  v = await txt(a.page, '#view .pl-res-px');
  check('7.8 the days before: "days it got in your way a lot", what she told Sakhi before, 2 days since', /The week before your period: days it got in your way a lot/.test(v) && /You said: A little/.test(v) && /2 days/.test(v), v);
  await done(a);
  const lh = {}; lh[ago(15)] = { ci: 1, pt: { soak: 'y', night: true, day: false } }; lh[ago(14)] = { ci: 1, pt: { soak: 'n', night: false, day: false } };
  a = await open({ seed: per('pain', 40, { also: ['heavy'], px: { log: lh }, x: { events: regular(16).concat([{ d: ago(13), t: 'start_detail', pads: '', clots: '', pain: '', leaked: true, two: false }]) } }), hash: '#plan-progress' });
  v = await txt(a.page, '#view .pl-res-pt');
  check('7.8 heavy periods joining: "Period days it got in your way", 2 days since (changed at night; leaked through clothes)', /Period days it got in your way/.test(v) && /2 days/.test(v), v);
  await done(a);
  a = await open({ seed: Object.assign(per('pms', 40, { px: { log: lg } }), DISC), hash: '#plan-progress' });
  check('7.8 ... not on a shared phone', !(await has(a.page, '#view .pl-res-px')));
  await done(a);
  /* 7.9 the move nudge rings on her moving days only (it rang every evening for a 3-days-a-week walk) */
  const nudge = async (page) => ((await st(page)).reminders || []).find((r) => r.id === 'plan-nudge') || null;
  a = await open({ seed: per('pain', B(1)) });   /* day 1 is today, a Friday: moving days 0, 2 and 5 are Friday, Sunday and Wednesday */
  let nu = await nudge(a.page);
  check('7.9 period pain: the nudge on Sunday, Wednesday and Friday, not every day', !!nu && String(nu.weekdays) === '0,3,5' && !nu.every, nu);
  await done(a);
  a = await open({ seed: per('pms', B(1)) });
  nu = await nudge(a.page);
  check('7.9 the days before: days 1, 3 and 5 (Saturday, Monday, Wednesday)', !!nu && String(nu.weekdays) === '1,3,6' && !nu.every, nu);
  await done(a);
  a = await open({ seed: per('pain', B(3), { last: 0 }) });   /* plan day 3 is a moving day, but her period came today: rest */
  nu = await nudge(a.page);
  check('7.9 a period day with no move in her steps: no ring today', !!nu && nu.doneOn === TODAY, nu);
  await done(a);
  /* 7.3 Today's plan offer names the plan that will start (it said "Easier periods") */
  a = await open({ seed: NOPLAN('pain', { prompts: { setup: 'off', planCall: ago(3), firstLog: ago(2), planOffer: ago(2) } }) });
  check('7.3 Today\'s offer: "My period plan"', (await txt(a.page, '#view .pl-offer h3')) === 'My period plan', await txt(a.page, '#view .pl-offer'));
  await done(a);
  /* 7.4 "Your plan for this": heavy periods joining her pain plan lead from the anaemia guide to it; without heavy, no row */
  a = await open({ seed: per('pain', B(9), { also: ['heavy'] }) });
  await go(a.page, 'cond-anaemia');
  check('7.4 pain leads, heavy joins: the anaemia guide shows "My period plan"', /My period plan/.test(await txt(a.page, '#view .pl-for')), await txt(a.page, '#view .pl-for'));
  await done(a);
  a = await open({ seed: per('pain', B(9)) });
  await go(a.page, 'cond-anaemia');
  check('7.4 ... pain alone: no plan row on the anaemia guide', !(await has(a.page, '#view .pl-for')));
  await done(a);
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const n = results.filter((r) => r.pass).length;
console.log(n + '/' + results.length + ' checks passed');
process.exit(n === results.length ? 0 : 1);
