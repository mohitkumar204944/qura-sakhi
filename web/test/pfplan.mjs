// Version 39.56: My pelvic floor plan (Mohit, 2 Nov: "proceed building", all 10 recommended decisions; advice
// docs/pelvic-floor-plan-advice-2026-11-02.md). pelvic version 1 (web/progs/v1.js), led by "Leaking urine or heaviness":
// - 1 where it leads (tracking, midlife; Getting ready and the after-birth plan keep theirs), day 1's 2 steps, the rings;
// - 2 joining: the goal tile, "When do you leak?", "Before you start" and its lines, the summary, "What happens when";
// - 3 the trainer: a set from Today's play button, the 8 levels from her sets (5 days a level, 3 weeks away one back), quick squeezes;
// - 4 heaviness and a doctor first: lying sets until a doctor has checked her or said more is fine, then one level up; 16 weeks;
// - 5 safety: the signs that need a doctor first, pain (breathing and letting go), "It hurts", the 112 line in the guide and Help;
// - 6 her steps over the weeks (the urge, a habit a fortnight, Get checked once), at most 3, 1 set on a period day;
// - 7 the evening: leaks or heaviness each week, sure in weeks 1, 4 and 12, gets in the way in weeks 4, 8 and 12, compared at 12;
// - 8 one card at a time with a Qura doctor first; 9 the chapters; 10 her results; 11 her sets joining another plan;
// - 12 a shared phone and discreet mode; 13 her stage changes; 14 Hindi at 360 px; 15 joining from a new install;
// - 17 the test pass (3 Nov); 18 the phone test's fixes (3 Nov, Mohit's Flip5: "fix all 6").
// Usage: node test/pfplan.mjs [web dir]
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
const LOCAL = { app: '0.39.56-pilot', platform: 'android' };
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

/* ---------- My pelvic floor plan ---------- */
const PANS = { stage: 'cycle', pft: 'stress', pfway: '2', pfflags: [] };
const pfPlan = (startAgo, a, extra) => Object.assign({ pack: 'pelvic', goalKey: 'pelvic', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', log: {}, weeks: {}, body: [], intake: Object.assign({ goal: 'pelvic' }, PANS, a || {}) }, extra || {});
/* Meena, 46, tracking her periods (not midlife by her own choice), on My pelvic floor plan since day 1 = startAgo + 1 days ago.
   o.a her answers, o.p her plan, o.pf the trainer's sets ({ days ago: sets }), o.also her other goals, o.x the state */
const setsAgo = (m) => Object.fromEntries(Object.keys(m || {}).map((k) => [ago(+k), m[k]]));
const pel = (startAgo, o) => { o = o || {}; return Object.assign({ dob: '1980-05-01', situation: { midlife: false }, goals: ['pelvic'].concat(o.also || []), intake: { goal: 'pelvic', stage: 'cycle' }, events: regular(o.last == null ? 10 : o.last),
  mods: Object.assign({ plan: pfPlan(startAgo, o.a, o.p) }, o.pf ? { post: { pf: setsAgo(o.pf) } } : {}), reminders: [planRem(startAgo)] }, o.x || {}); };
const days = (from, to, n) => { const m = {}; for (let k = from; k <= to; k++) m[k] = n == null ? 1 : n; return m; };   /* sets on days ago from..to */
const lvl = (page) => page.evaluate(() => window.Saathi.plan.pelvic.level());
const runSet = async (page) => { for (let i = 0; i < 400 && await has(page, '#pst-pph'); i++) { await page.clock.runFor(1000); await sleep(5); } await settle(page, 300); };

// ---------- 1 the plan as data, and where it leads ----------
{
  const a = await open({ seed: pel(0) });
  const r = await a.page.evaluate(() => { const P = window.Saathi.plan; const l = P.progs.list().map((x) => x.id); return { sp: (P.progs.spec('pelvic') || {}).ver, order: l.indexOf('pelvic') < l.indexOf('meno') && l.indexOf('pelvic') > l.indexOf('ttc') && l.indexOf('pelvic') > l.indexOf('post'),
    cyc: P.packFor('pelvic', 'cycle'), meno: P.packFor('pelvic', 'meno'), ttc: P.packFor('pelvic', 'ttc'), post: P.packFor('pelvic', 'post'), ad: ['pelvic.sets', 'pelvic.find', 'pelvic.checked', 'pelvic.urge', 'pelvic.habit'].every((k) => P.progs.adapters().indexOf(k) >= 0) }; });
  check('1.1 My pelvic floor plan, version 1: it leads at the tracking and midlife stages; Getting ready and the after-birth plan keep theirs', r.sp === 1 && r.order && r.cyc === 'pelvic' && r.meno === 'pelvic' && r.ttc === 'ttc' && r.post === 'post' && r.ad, r);
  const tl = await txt(a.page, '.pl-th');
  check('1.2 Today names it, and day 1 has 2 steps: her squeeze sets and Find the right muscles', /My pelvic floor plan/i.test(tl) && (await ids(a.page)).join() === 'sets,find', [tl, await ids(a.page)]);
  const s = (await acts(a.page))[0];
  check('1.3 her sets: 0 of 3 today, level 1 lying down, opening the trainer', s.sub === '0 of 3 today · level 1, lying down' && s.go === 'post-pelvic', s);
  const rems = (await st(a.page)).reminders;
  const pf = rems.find((x) => x.id === 'plan-pf'), ci = rems.find((x) => x.id === 'plan');
  check('1.4 one new ring, her morning set at 8 am (on by default, neutral words); the evening ring names her last set', !!pf && pf.on !== false && pf.time === '08:00' && pf.title.en === 'Your first set today. More after lunch and before bed.' && ci.title.en === 'Your last set, then how did today go? 1 minute', rems.map((x) => [x.id, x.time, x.title && x.title.en]));
  await done(a);
}

// ---------- 2 joining: the goal tile, her track, the safety screen ----------
{
  let a = await open({ seed: seedOf({ goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, dob: '1985-01-01' }) });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'cycle', iq: 0 }; location.hash = 'plan-goal'; }); await settle(a.page, 600);
  check('2.1 the goal "Leaking urine or heaviness" at the tracking stage', /Leaking urine or heaviness/.test(await view(a.page)) && !/Pelvic floor and leaks/.test(await view(a.page)), (await view(a.page)).slice(0, 400));
  await tap(a.page, '[data-pl-goal="pelvic"]');
  check('2.2 "When do you leak?" with heaviness and Not sure, and how much it gets in the way', /When do you leak\?/.test(await view(a.page)) && await has(a.page, '[data-pl-q="pft:heavy"]') && await has(a.page, '[data-pl-q="pft:ns"]') && await has(a.page, '[data-pl-q="pfway:3"]'), await view(a.page));
  await tap(a.page, '#pl-in-next');
  check('2.3 her track is needed, how much it gets in the way is not', !(await a.page.$eval('#pl-in-err', (e) => e.hidden)) && /When do you leak/.test(await view(a.page)));
  await tap(a.page, '[data-pl-q="pft:both"]'); await tap(a.page, '#pl-in-next');
  check('2.4 "Before you start": 7 signs that need a doctor first, none ticked, nothing needed', /Before you start/.test(await view(a.page)) && (await a.page.$$('[data-pl-pfs]')).length === 7 && (await a.page.$$('[data-pl-pfs]:checked')).length === 0 && /None of these\? Tap Continue/.test(await view(a.page)));
  await a.page.$eval('[data-pl-pfs="const"]', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }); await settle(a.page, 300);
  check('2.5 a tick shows its line (leaking all the time: this week, it can be repaired)', /See a doctor this week\. This can be repaired/.test(await view(a.page)), await view(a.page));
  await tap(a.page, '#pl-in-next');
  const sm = await view(a.page);
  /* Version 39.68 (the doctors' review): no answers summary; her plan comes next */
  check('2.6 no summary: her plan comes next, with no "Your day" or time to move (the plan uses neither)', /Your plan is ready/.test(sm) && !/Here’s what you told Sakhi/.test(sm) && !/Your day|time to move/i.test(sm), sm);
  if (await has(a.page, '#pl-in-make')) await tap(a.page, '#pl-in-make');
  const nx = await a.page.evaluate(() => (window.Saathi.state.mods.plan || {}).next || null);
  check('2.7 her answers are kept for the plan', nx && nx.pack === 'pelvic' && nx.intake.pft === 'both' && nx.intake.pfflags.join() === 'const' && nx.intake.pfway == null, nx && nx.intake);
  for (let i = 0; i < 4 && !(await has(a.page, '.pl-tl')); i++) { const b = await a.page.$('#pl-rv-next'); if (!b) break; await b.click(); await settle(a.page, 300); }
  const rv = await view(a.page);
  check('2.8 "What happens when": find it, levels, the urge from day 4, a habit from week 2, a chapter, weeks 1, 4 and 12, then keep strong', /Days 1 to 3: find the right muscles/.test(rv) && /After every 5 days of sets, a new level/.test(rv) && /From day 4: when the urge comes/.test(rv) && /From week 2: one small habit/.test(rv) && /keep strong with one set a day/.test(rv), rv.slice(0, 900));
  await done(a);
  a = await open({ seed: seedOf({ stage: 'app', goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, situation: { deliveredOn: ago(60) }, events: [], dob: '1995-01-01' }) });
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'post', iq: 0 }; location.hash = 'plan-goal'; }); await settle(a.page, 600);
  check('2.9 after a birth the goal stays "Pelvic floor and leaks", and opens the after-birth plan', /Pelvic floor and leaks/.test(await view(a.page)) && !/Leaking urine or heaviness/.test(await view(a.page)) && (await a.page.evaluate(() => window.Saathi.plan.packFor('pelvic', 'post'))) === 'post');
  await done(a);
}

// ---------- 3 the trainer: a set from Today, the levels, quick squeezes ----------
{
  let a = await open({ seed: pel(0) });
  await tap(a.page, '[data-today-nav]');
  check('3.1 Today\'s play button opens the trainer with a set started', /#post-pelvic$/.test(a.page.url()) && await has(a.page, '#pst-pph'), a.page.url());
  const rep = await txt(a.page, '#pst-prep');
  check('3.2 level 1: 8 squeezes, with "It hurts"', /of 8/.test(rep) && await has(a.page, '#pst-phurt'), rep);
  await runSet(a.page);
  const s1 = (await acts(a.page))[0];
  check('3.3 a finished set counts: 1 of 3, the step partly done; the done card says 1 of 3', s1.sub.indexOf('1 of 3 today') === 0 && (await a.page.evaluate(() => window.Saathi.plan.actions()[0].state)) === 'p' && /Set done: 1 of 3 today/.test(await view(a.page)), [s1, await view(a.page)]);
  const rr = (await st(a.page)).reminders.find((x) => x.id === 'plan-pf');
  check('3.4 her morning ring is done for today after a set', rr && rr.doneOn === TODAY, rr);
  await done(a);
  a = await open({ seed: pel(10, { pf: days(1, 10) }) });
  let lv = await lvl(a.page);
  check('3.5 10 days of sets open level 3: sitting, 10 squeezes of 5 seconds, then 5 quick', lv.n === 3 && lv.pos === 'sit' && lv.reps === 10 && lv.hold === 5 && lv.quick === 5, lv);
  await go(a.page, 'post-pelvic');
  const tv = await view(a.page);
  check('3.6 the trainer shows her level and what to do, with the next level\'s days', /Level 3 of 8 · sitting on a chair/i.test(tv) && /10 squeezes: hold each 5 seconds/.test(tv) && /Then 5 quick squeezes/.test(tv) && /Next level after 5 more days of sets/.test(tv), tv.slice(0, 700));
  await tap(a.page, '#pst-pstart'); let qs = false;
  for (let i = 0; i < 400 && await has(a.page, '#pst-pph'); i++) { await a.page.clock.runFor(1000); await sleep(5); if (/Quick squeeze/.test(await txt(a.page, '#pst-pph'))) qs = true; }
  await settle(a.page, 300);
  check('3.7 the quick squeezes come after the holds, and the set counts', qs && (await a.page.evaluate(() => window.Saathi.state.mods.post.pf[window.Saathi.toISO(window.Saathi.today())])) === 1);
  await done(a);
  a = await open({ seed: pel(60, { pf: Object.assign(days(30, 54), {}) }) });
  lv = await lvl(a.page);
  check('3.8 three weeks away step her back one level, never to the start', lv.n === 5 && lv.back === true, lv);
  check('3.9 "Welcome back" on the trainer', /Welcome back\. One level back/.test(await (async () => { await go(a.page, 'post-pelvic'); return view(a.page); })()));
  await done(a);
  a = await open({ seed: pel(60, { pf: days(1, 50) }) });
  check('3.10 the top level is 8: standing or walking, 10 seconds, 10 and 10 quick', (await lvl(a.page)).n === 8 && (await lvl(a.page)).pos === 'walk');
  await done(a);
}

{
  let a = await open({ seed: pel(150, { pf: days(101, 140) }) });
  const lv = await lvl(a.page);
  check('3.11 a long break steps her back one level for each 3 weeks away (100 days: 4 levels)', lv.n === 4 && lv.back, lv);
  await done(a);
  a = await open({ seed: pel(10, { pf: days(1, 10) }) });
  let f = (await acts(a.page)).find((x) => x.id === 'find');
  check('3.12 her first day sitting: Find the right muscles comes back, sitting', !!f && f.sub === 'Your sets are sitting now: find the squeeze that way first, then start', await acts(a.page));
  await done(a);
  a = await open({ seed: pel(10, { pf: Object.assign(days(1, 10), { 0: 1 }) }) });
  f = (await acts(a.page)).find((x) => x.id === 'find');
  check('3.13 and it stays all that day after her first set', !!f);
  await done(a);
  a = await open({ seed: pel(11, { pf: days(1, 11) }) });
  check('3.14 not the day after', !(await ids(a.page)).includes('find'), await ids(a.page));
  await done(a);
}

{
  const a = await open({ seed: pel(3), hash: '#post-pelvic' });
  const v = await view(a.page);
  check('3.15 the trainer without a recent birth: no after-birth lines; the guide, and a Qura doctor to check the squeeze', !/after the birth|Belly gap|Breastfeeding|recovery, sleep, food and feeding/i.test(v) && /Heaviness or a bulge: what it can be/.test(v) && /Is it the right squeeze\?/.test(v) && await has(a.page, '.pst-right [data-ask]'), v.slice(0, 1500));
  await done(a);
  const b = await open({ seed: seedOf({ situation: { deliveredOn: ago(100) }, events: [], goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, dob: '1995-01-01' }), hash: '#post-pelvic' });
  check('3.16 after a birth (no plan of hers runs it) the trainer stays as it was', /3 months after the birth/.test(await view(b.page)) && /Belly gap/.test(await view(b.page)));
  await done(b);
}

// ---------- 4 the heaviness track and a doctor first ----------
{
  let a = await open({ seed: pel(20, { a: { pft: 'heavy' }, pf: days(0, 20) }) });
  let lv = await lvl(a.page);
  check('4.1 heaviness: sets stay lying down (level 2) until a doctor has checked her', lv.n === 2 && lv.capped && lv.pos === 'lie', lv);
  check('4.2 "Get checked once by a doctor" is a step', (await ids(a.page)).indexOf('checked') >= 0, await ids(a.page));
  await a.page.evaluate(() => { const d = window.Saathi.state.mods.plan; d.log[window.Saathi.toISO(window.Saathi.today())] = { ck: { checked: 'd' } }; window.Saathi.save(); window.Saathi.render(); }); await settle(a.page, 400);
  check('4.3 after she ticks it, Sakhi asks what the doctor said', /What did the doctor say\?/.test(await view(a.page)) && await has(a.page, '[data-pf="doc-pop"]'), (await view(a.page)).slice(0, 600));
  await tap(a.page, '[data-pf="doc-pop"]');
  lv = await lvl(a.page);
  check('4.4 "A prolapse": one level up to sitting, not to where her days would have taken her', lv.n === 3 && !lv.capped && (await ids(a.page)).indexOf('checked') < 0, lv);
  await done(a);
  a = await open({ seed: pel(100, { a: { pft: 'heavy' }, p: { pfDoc: { at: ago(90), said: 'pop' }, keep: false } }) });
  check('4.5 after "a prolapse", 3 sets a day to week 16', (await a.page.evaluate(() => window.Saathi.plan.pelvic.target())) === 3);
  await done(a);
  a = await open({ seed: pel(100, { a: { pft: 'stress' } }) });
  check('4.6 after week 12 otherwise, keep strong: 1 set a day', (await a.page.evaluate(() => window.Saathi.plan.pelvic.target())) === 1);
  await done(a);
  a = await open({ seed: pel(20, { a: { pfflags: ['mesh'] }, pf: days(0, 20) }) });
  check('4.7 a past operation or pelvic cancer: lying sets until her doctor says more is fine', (await lvl(a.page)).n === 2 && /Show this plan to your doctor first/.test(await view(a.page)));
  await tap(a.page, '[data-pf="mesh-ok"]');
  check('4.8 "My doctor said more is fine" moves her on, one level', (await lvl(a.page)).n === 3);
  await done(a);
}

// ---------- 5 safety: the signs that need a doctor, and pain ----------
{
  let a = await open({ seed: pel(0, { a: { pfflags: ['retain', 'uti'] } }) });
  const sl = await txt(a.page, '.pl-sl-pf');
  check('5.1 on day 1 her doctor card leads Sakhi says: today for urine she can\'t pass, an infection', /See a doctor first/.test(sl) && /See a doctor today\. Exercises don’t treat this/.test(sl) && /usually an infection/.test(sl) && await has(a.page, '.pl-sl-pf [data-ask]'), sl);
  await tap(a.page, '[data-pf="safe-seen"]');
  check('5.2 "I\'ve seen a doctor" puts it away', !(await has(a.page, '.pl-pf-safe')));
  await done(a);
  a = await open({ seed: pel(0, { a: { pfflags: ['const'] } }) });
  check('5.3 leaking all the time: this week, with the free repair as one quiet line', /This can be repaired/.test(await txt(a.page, '.pl-pf-safe')) && /free at government hospitals/.test(await txt(a.page, '.pl-pf-safe')));
  await done(a);
  a = await open({ seed: pel(0, { a: { pfflags: ['pain'] } }) });
  const s = (await acts(a.page))[0];
  check('5.4 pain when she squeezes: breathing and letting go instead of squeezes, and no Find step', s.title === 'Breathe and let go, a few minutes' && (await ids(a.page)).indexOf('find') < 0 && /Pain during your sets/.test(await view(a.page)), [s, await ids(a.page)]);
  await go(a.page, 'post-pelvic');
  check('5.5 the trainer has no squeezes then: slow breaths with Dr. Megha', /Breathe and let go/.test(await view(a.page)) && !(await has(a.page, '#pst-pstart')));
  await done(a);
  a = await open({ seed: pel(5) });
  await go(a.page, 'post-pelvic'); await tap(a.page, '#pst-pstart'); await tap(a.page, '#pst-phurt');
  check('5.6 "It hurts" stops the set; once, a warning', !(await has(a.page, '#pst-pph')) && (await a.page.evaluate(() => window.Saathi.state.mods.plan.pfHurt)) === 1 && !(await a.page.evaluate(() => window.Saathi.plan.pelvic.relax())));
  await tap(a.page, '#pst-pstart'); await tap(a.page, '#pst-phurt');
  check('5.7 twice, and her plan moves to breathing and letting go, with the pain card', await a.page.evaluate(() => window.Saathi.plan.pelvic.relax()) && /Breathe and let go/.test(await view(a.page)));
  await go(a.page, 'home');
  await tap(a.page, '[data-pf="pain-ok"]');
  check('5.8 "A doctor checked it" brings the squeezes back', !(await a.page.evaluate(() => window.Saathi.plan.pelvic.relax())) && (await acts(a.page))[0].title === 'Your squeeze sets');
  await done(a);
  a = await open({ seed: pel(5), hash: '#intimate-prolapse' });
  const g = await view(a.page);
  check('5.9 the guide: Call 112 now for sudden loss of bladder or bowel control with numbness (a new line for the doctor), and her plan for this', /Call 112 now if/.test(g) && /Suddenly unable to control your bladder or bowel/.test(g) && await has(a.page, '.pl-for') && await has(a.page, 'a[href="tel:112"]'), g.slice(0, 500));
  await go(a.page, 'help');
  check('5.10 the same line in Help\'s "Call 112 now if"', /Suddenly unable to control your bladder or bowel/.test(await view(a.page)));
  await done(a);
}

// ---------- 6 her steps over the weeks ----------
{
  const stepsOn = async (o) => { const a = await open({ seed: pel(o.d, o) }); const r = { ids: await ids(a.page), acts: await acts(a.page) }; await done(a); return r; };
  let r = await stepsOn({ d: B(4), a: { pft: 'urge' } });
  check('6.1 the urge track: When the urge comes from day 4', r.ids.join() === 'sets,urge' && /Stand still, squeeze a few times/.test(r.acts[1].sub), r.ids);
  r = await stepsOn({ d: B(4), a: { pft: 'stress' } });
  check('6.2 the stress track has no urge step', r.ids.join() === 'sets', r.ids);
  r = await stepsOn({ d: B(8) });
  check('6.3 week 2: the knack', r.ids.join() === 'sets,habit' && r.acts[1].title === 'Squeeze before you cough, sneeze or lift', r.acts);
  r = await stepsOn({ d: B(15) });
  check('6.4 weeks 3 to 4: water through the day', r.acts[1].title === 'Water through the day');
  r = await stepsOn({ d: B(29) }); const r2 = await stepsOn({ d: B(29), a: { pft: 'both' } });
  check('6.5 weeks 5 to 6: knees up on the toilet, or less tea, coffee and cola on the urge track', r.acts[1].title === 'On the toilet: knees up, breathe out' && r2.ids.join() === 'sets,urge,habit' && r2.acts[2].title === 'Less tea, coffee and cola, for 2 weeks', [r.acts, r2.acts]);
  r = await stepsOn({ d: B(15), a: { pft: 'urge' } });
  check('6.6 from week 3, a little longer each week', /wait a few minutes more before you go/.test(r.acts.find((x) => x.id === 'urge').sub));
  r = await stepsOn({ d: B(43) }); const r3 = await stepsOn({ d: B(57) });
  check('6.7 weeks 7 to 8 lifting the safe way, weeks 9 to 12 one set standing at a task', r.acts[1].title === 'Lift the safe way' && r3.acts[1].title === 'One set standing, at a task');
  r = await stepsOn({ d: B(2), a: { pft: 'heavy' } }); const r4 = await stepsOn({ d: B(1), a: { pft: 'heavy' } });
  check('6.8 heaviness: day 1 has 2 steps, day 2 three (Get checked once)', r4.ids.length === 2 && r.ids.join() === 'sets,find,checked', [r4.ids, r.ids]);
  r = await stepsOn({ d: B(30), a: { pft: 'both' }, p: {} });
  let max = 0; for (const dd of [1, 2, 4, 8, 15, 29, 43, 57, 85]) { const x = await stepsOn({ d: B(dd), a: { pft: 'both' } }); max = Math.max(max, x.ids.length); }
  check('6.9 never more than 3 steps a day', max <= 3, max);
  const a = await open({ seed: pel(B(8), { last: 1 }) });
  check('6.10 on a period day one set is enough', (await a.page.evaluate(() => window.Saathi.plan.pelvic.target())) === 1 && /1 of 1|0 of 1/.test((await acts(a.page))[0].sub));
  await done(a);
}

// ---------- 7 the evening: her measure in her own words ----------
{
  let a = await open({ seed: pel(0), hm: '20:30', hash: '#plan-checkin' });
  let v = await view(a.page);
  check('7.1 week 1: any leaks this week, and are you sure of the squeeze', /This week: any leaks\?/i.test(v) && /Are you sure you’re squeezing the right way\?/.test(v) && !/How much does it get in the way/.test(v), v);
  await tap(a.page, '[data-ci="sets:p"]'); await tap(a.page, '[data-ci="find:d"]'); await tap(a.page, '[data-ci-lk="some"]'); await tap(a.page, '[data-ci-pf="pfs:ns"]');
  check('7.2 "Not sure": a Qura doctor or a physiotherapist can check it', /A Qura doctor or a physiotherapist can check it with you/.test(await view(a.page)));
  await tap(a.page, '#pl-ci-save');
  let lg = await a.page.evaluate(() => window.Saathi.state.mods.plan.log[window.Saathi.toISO(window.Saathi.today())]);
  check('7.3 saved: her leaks and her answer', lg.lk === 'some' && lg.pfs === 'ns' && lg.ci === 1, lg);
  await done(a);
  a = await open({ seed: pel(B(22)), hm: '20:30', hash: '#plan-checkin' });
  v = await view(a.page);
  check('7.4 week 4: how much it gets in the way, and sure again', /How much does it get in the way of your day\?/.test(v) && /Are you sure you’re squeezing/.test(v), v);
  await done(a);
  a = await open({ seed: pel(B(78)), hm: '20:30', hash: '#plan-checkin' });
  v = await view(a.page);
  check('7.5 week 12: compared with when you started, too', /Compared with when you started\?/.test(v) && /Better/.test(v), v);
  await done(a);
  a = await open({ seed: pel(0, { a: { pft: 'heavy' } }), hm: '20:30', hash: '#plan-checkin' });
  check('7.6 the heaviness track asks about heaviness', /This week: any heaviness\?/i.test(await view(a.page)));
  await done(a);
  a = await open({ seed: pel(0, { a: { pft: 'ns' } }), hm: '20:30', hash: '#plan-checkin' });
  await tap(a.page, '[data-ci-lk="most"]');
  check('7.7 not sure of her track: a leak asks when it happened', /When did it happen\?/.test(await view(a.page)));
  await tap(a.page, '[data-ci-pf="pfwhen:urge"]'); await tap(a.page, '[data-ci="sets:n"]'); await tap(a.page, '[data-ci="find:n"]'); await tap(a.page, '#pl-ci-save');
  check('7.8 her answer sets her track (the urge step joins)', (await a.page.evaluate(() => window.Saathi.state.mods.plan.intake.pft)) === 'urge');
  await done(a);
  a = await open({ seed: pel(3, { p: { log: { [ago(1)]: { lk: 'never', ci: 1 } } } }), hm: '20:30', hash: '#plan-checkin' });
  check('7.9 once a week: not again 2 days later', !/This week: any leaks\?/i.test(await view(a.page)));
  await done(a);
}

// ---------- 8 one card at a time, a Qura doctor first ----------
{
  let a = await open({ seed: pel(B(10)) });
  check('8.1 weeks 2 to 4: "Is it the right squeeze?" with a Qura doctor first, then her own doctor or a physiotherapist', /Is it the right squeeze\?/.test(await txt(a.page, '.pl-sl-pf')) && /A Qura doctor can talk it through/.test(await txt(a.page, '.pl-sl-pf')) && await has(a.page, '.pl-pf-right [data-ask]'));
  await tap(a.page, '[data-pf="right-ok"]');
  check('8.2 Got it puts it away', !(await has(a.page, '.pl-pf-right')));
  await done(a);
  a = await open({ seed: pel(B(40), { p: { pfRightSeen: ago(30), log: { [ago(2)]: { pfs: 'n', ci: 1 } } } }) });
  check('8.3 it comes back when she isn\'t sure later', await has(a.page, '.pl-pf-right'));
  await done(a);
  a = await open({ seed: pel(B(90), { p: { endSeen: ago(3), log: { [ago(4)]: { lk: 'some', ci: 1 } } } }) });
  const e = await txt(a.page, '.pl-sl-pf');
  check('8.4 after 12 weeks still leaking: "A doctor can treat this", the treatments after exercises, Tele-MANAS', /Still leaking or heavy\?/.test(e) && /ring pessary/.test(e) && /Tele-MANAS 14416/.test(e), e);
  await done(a);
  a = await open({ seed: pel(B(90), { p: { endSeen: ago(3), log: { [ago(4)]: { lk: 'never', ci: 1 } } } }) });
  check('8.5 not when she no longer leaks', !(await has(a.page, '.pl-pf-end')));
  await go(a.page, 'plan-end');
  check('8.6 the end page: "Still leaking or heavy?" before the treatments after exercises', /Still leaking or heavy\? A doctor can treat this/.test(await view(a.page)));
  await done(a);
}

// ---------- 9 her chapters ----------
{
  const a = await open({ seed: pel(0) });
  check('9.1 this week\'s chapter is one row under her steps', /This week’s chapter Find your pelvic floor/.test(await txt(a.page, '.pl-pf-les')));
  await tap(a.page, '.pl-pf-les');
  let v = await view(a.page);
  check('9.2 chapter 1: the right squeeze, the full let-go, the mistakes, if it hurts, Tele-MANAS', /chapter 1 of 12/i.test(v) && /Then let go fully/.test(v) && /Holding your breath/.test(v) && /Tele-MANAS 14416/.test(v), v.slice(0, 600));
  await tap(a.page, '#pf-les-done');
  check('9.3 Done marks it read, and the row goes', !(await has(a.page, '.pl-pf-les')));
  const ids16 = await a.page.evaluate(() => window.Saathi.pfplan.lesson.ids());
  check('9.4 15 chapters: 12 for every track, 3 more after "a doctor said prolapse" (Version 39.68: the doctors removed one)', ids16.length === 15 && ids16.filter((x) => /^f\d+$/.test(x)).length === 12 && ids16.filter((x) => /^v\d$/.test(x)).length === 3 && ids16.indexOf('v2') < 0, ids16);
  await a.page.evaluate(() => { window.Saathi.mem.pfLes = 'f10'; location.hash = 'pf-lesson'; }); await settle(a.page, 400);
  check('9.5 the warning-signs chapter has Call 112 now', /Call 112 now if you suddenly can’t control your bladder or bowel/.test(await view(a.page)) && await has(a.page, 'a[href="tel:112"]'));
  await go(a.page, 'pf-urge');
  check('9.6 When the urge comes: stop, squeeze, breathe, walk calmly', /Stop\. Stand still/.test(await view(a.page)) && /Walk calmly/.test(await view(a.page)));
  const hi = await a.page.evaluate(() => { const o = window.Saathi.pfplan.lesson; window.Saathi.state.lang = 'hi'; const r = o.ids().map((id) => o.title(id)); window.Saathi.state.lang = 'en'; return r; });
  check('9.7 every chapter has a Hindi title', hi.every((x) => /[ऀ-ॿ]/.test(x)), hi);
  await done(a);
}

// ---------- 10 her results ----------
{
  const log = {}; [[83, 'most', 1, 'ns'], [76, 'some'], [62, 'some', 2], [48, 'some'], [34, 'some', 1], [6, 'never', 0, 'y']].forEach((x) => { log[ago(x[0])] = Object.assign({ lk: x[1], ci: 1 }, x[2] != null ? { pfw: x[2] } : {}, x[3] ? { pfs: x[3] } : {}); });
  const a = await open({ seed: pel(B(85), { pf: days(1, 80), p: { log: log, endSeen: ago(1) } }), hash: '#plan-progress' });
  const v = await view(a.page);
  check('10.1 her results in her own words: leaks first and latest, gets in the way, sure of the squeeze, her level', /Leaks First noted Most days · week 1 Latest Never · week 12/.test(v) && /Gets in the way of your day First noted Quite a lot Latest Not at all · week 12/.test(v) && /Sure of the squeeze First noted Not sure · week 1 Latest Yes · week 12/.test(v) && /Level 8 of 8 · sets on \d+ days/.test(v), v.slice(0, 1400));
  check('10.2 it never says cured', !/cured/i.test(v));
  await done(a);
}

// ---------- 11 her sets join another plan ----------
{
  let a = await open({ seed: per('pain', B(2), { also: ['pelvic'] }) });
  let i0 = await ids(a.page);
  check('11.1 My period plan with the pelvic floor as another goal: her sets are a step, or the one row under a full day', i0.indexOf('sets') >= 0 || await has(a.page, '.pl-pf-join'), i0);
  await done(a);
  a = await open({ seed: per('pain', B(2)) });
  check('11.2 not without the goal', (await ids(a.page)).indexOf('sets') < 0 && !(await has(a.page, '.pl-pf-join')));
  await done(a);
  const ttc = Object.assign(pel(B(3)), { goals: ['pelvic', 'ready'], intake: { goal: 'pelvic', stage: 'ttc' }, situation: { midlife: false, planning: true } });
  ttc.mods.plan = Object.assign(pfPlan(B(3)), { pack: 'ttc', pv: 2, goalKey: 'pelvic', intake: { goal: 'pelvic', stage: 'ttc', bset: 'std', bdoc: 'std' } });
  a = await open({ seed: ttc });
  const tt = await a.page.evaluate(() => ({ pk: window.Saathi.plan.packOf(), on: window.Saathi.plan.pelvic.on() }));
  check('11.3 trying for a baby: Getting ready stays her plan and her sets join it', tt.pk === 'ttc' && tt.on && ((await ids(a.page)).indexOf('sets') >= 0 || await has(a.page, '.pl-pf-join')), [tt, await ids(a.page)]);
  await done(a);
}

// ---------- 12 a shared phone and discreet mode ----------
{
  let a = await open({ seed: pel(B(8), { x: { settings: { shared: true } } }) });
  const v = await view(a.page); const s0 = (await acts(a.page))[0];
  check('12.1 a shared phone: "Your 2 minutes", no leak words on Today', s0.title === 'Your 2 minutes' && !/leak|bladder|urine|pelvic/i.test(await txt(a.page, '.pl-today, .today-list, #view .plan-today') || v.split('Sakhi says')[0].replace(/My pelvic floor plan/i, '')), [s0, v.slice(0, 500)]);
  await go(a.page, 'plan-checkin');
  check('12.2 no weekly leaks or squeeze questions on a shared phone', !/any leaks|squeezing the right way/i.test(await view(a.page)));
  await done(a);
  a = await open({ seed: pel(B(3), { x: { settings: { discreet: true, pinHash: 'x' } } }) });
  const pin = await a.page.evaluate(() => { location.hash = 'pf-lesson'; return new Promise((r) => setTimeout(() => r(document.querySelector('#view').innerText), 50)); });
  await settle(a.page, 300);
  check('12.3 discreet mode: the chapters are behind her PIN, the title is plain', !/Find your pelvic floor/.test(await view(a.page)) && !/pelvic floor/i.test(await txt(a.page, '.pl-th')), [await view(a.page), await txt(a.page, '.pl-th')]);
  await done(a);
}

// ---------- 13 her stage changes ----------
{
  let a = await open({ seed: Object.assign(pel(B(10)), { events: regular(10).concat([{ d: ago(5), t: 'preg' }]) }) });
  await a.page.evaluate(() => { const S = window.Saathi; S.state.situation = Object.assign({}, S.state.situation, { pregnant: true, pregnantSince: S.toISO(S.addDays(S.today(), -40)) }); S.save(); S.render(); }); await settle(a.page, 400);
  const pz = await a.page.evaluate(() => ({ on: window.Saathi.plan.pelvic.on(), preg: window.Saathi.stageNow ? window.Saathi.stageNow() : null }));
  check('13.1 a pregnancy pauses the plan (My pregnancy has its own pelvic floor step)', !pz.on && !/Your squeeze sets/.test(await view(a.page)), [pz, (await view(a.page)).slice(0, 400)]);
  await done(a);
  a = await open({ seed: Object.assign(pel(B(10)), { goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'ttc' }, situation: { midlife: false, planning: true } }) });
  check('13.2 trying for a baby now: Sakhi offers the plan for now (Getting ready), and Keep keeps hers', /Trying for a baby now\?/.test(await view(a.page)) && await has(a.page, '#pl-fit-keep'), (await view(a.page)).slice(0, 500));
  await done(a);
}

// ---------- 14 Hindi at 360 px ----------
{
  const a = await open({ seed: Object.assign(pel(B(8), { a: { pft: 'both' } }), { lang: 'hi' }), w: 360, h: 800 });
  const v = await view(a.page);
  check('14.1 Today in Hindi: मेरा पेल्विक फ़्लोर प्लान, her sets and the knack, no scroll', /मेरा पेल्विक फ़्लोर प्लान/.test(v) && /कसने के आपके सेट/.test(v) && /खाँसने, छींकने या उठाने से पहले कसें/.test(v) && await noScroll(a.page), v.slice(0, 500));
  await go(a.page, 'post-pelvic');
  check('14.2 the trainer in Hindi, no scroll', /8 में से लेवल/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 400));
  await go(a.page, 'plan-checkin');
  check('14.3 the check-in in Hindi, no scroll', /इस हफ़्ते: कोई लीक\?/.test(await view(a.page)) && await noScroll(a.page));
  await a.page.evaluate(() => { window.Saathi.mem.planIntake = { stage: 'cycle', goal: 'pelvic', iq: 2 }; location.hash = 'plan-goal'; }); await settle(a.page, 500);
  check('14.4 "Before you start" in Hindi, no scroll', /शुरू करने से पहले|Before/.test(await view(a.page)) && /पेशाब नहीं हो पाता/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 300));
  await done(a);
}

// ---------- 15 joining from a new install ----------
{
  const a = await open({ seed: null, hash: '#welcome' });
  await a.page.evaluate(() => { localStorage.clear(); sessionStorage.setItem('seeded', '1'); }); await a.page.reload(); await settle(a.page, 600);
  const { join } = await import('./join.mjs');
  let tiles = '';
  await join(a.page, { name: 'Meena', dec: 1980, y: 1980, tile: 'cycle', goals: ['pelvic'], stop: 'details', onScreen: async (n) => { if (n === 'goals') tiles = await view(a.page); } });
  check('15.1 joining: "Leaking urine or heaviness" among the tracking stage\'s goals', /Leaking urine or heaviness/.test(tiles) && /Squeeze sets step by step/.test(tiles), tiles.slice(0, 600));
  await done(a);
}

// ---------- 17 the test pass (3 Nov: "can you throughly test for any bugs or gaps") ----------
/* her own way to a new plan: My plan's offer, her answers, Start */
async function startPelvic(page, pft, flags) {
  await page.evaluate(() => window.Saathi.plan.offer('pelvic')); await settle(page, 500);
  await tap(page, '[data-pl-q="pft:' + (pft || 'stress') + '"]'); await tap(page, '#pl-in-next');
  for (const k of (flags || [])) { await page.$eval('[data-pl-pfs="' + k + '"]', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }); await settle(page, 300); }
  await tap(page, '#pl-in-next'); if (await has(page, '#pl-in-make')) await tap(page, '#pl-in-make');   /* Version 39.68: no answers summary */
  for (let i = 0; i < 6 && !(await has(page, '#pl-rv-go')); i++) { if (await has(page, '#pl-rv-next')) await tap(page, '#pl-rv-next'); else break; }
  if (await has(page, '#pl-rv-go')) await tap(page, '#pl-rv-go');
  await go(page, 'home');
}
{
  let a = await open({ seed: pel(B(10)) });
  await go(a.page, 'plan-settings');
  await a.page.evaluate(() => { const b = [...document.querySelectorAll('#view button')].find((x) => /^Stop my plan$/i.test(x.textContent.trim())); if (b) b.click(); }); await settle(a.page, 400);
  await a.page.evaluate(() => { const b = [...document.querySelectorAll('#view button')].find((x) => /^Yes, stop it$/i.test(x.textContent.trim())); if (b) b.click(); }); await settle(a.page, 500);
  let rr = (await st(a.page)).reminders.map((x) => x.id);
  check('17.1 Stop my plan ends her 8 am ring too', !(await a.page.evaluate(() => window.Saathi.plan.packOf())) && rr.indexOf('plan-pf') < 0, rr);
  await startPelvic(a.page, 'stress');
  rr = (await st(a.page)).reminders.filter((x) => x.id === 'plan-pf');
  check('17.2 a new plan after a stopped one rings at 8 am again (not "deleted by her")', a.page && (await a.page.evaluate(() => window.Saathi.plan.packOf())) === 'pelvic' && rr.length === 1 && rr[0].on !== false, [await a.page.evaluate(() => window.Saathi.plan.packOf()), rr]);
  await done(a);
  a = await open({ seed: pel(B(10)) });
  await a.page.evaluate(() => { const S = window.Saathi; S.state.situation = Object.assign({}, S.state.situation, { pregnant: true, pregnantSince: S.toISO(S.addDays(S.today(), -40)) }); S.save(); location.hash = 'plan'; S.render(); }); await settle(a.page, 500);
  await go(a.page, 'home');
  rr = (await st(a.page)).reminders.map((x) => x.id);
  check('17.3 a pregnancy holds her 8 am ring', rr.indexOf('plan-pf') < 0 && await a.page.evaluate(() => !!window.Saathi.state.mods.plan.pfHeld), rr);
  await a.page.evaluate(() => { const S = window.Saathi; S.state.situation = Object.assign({}, S.state.situation, { pregnant: false, pregnantSince: null }); S.save(); location.hash = 'plan'; S.render(); }); await settle(a.page, 500);
  await go(a.page, 'home');
  check('17.4 and it comes back with her plan', (await st(a.page)).reminders.some((x) => x.id === 'plan-pf'), (await st(a.page)).reminders.map((x) => x.id));
  await done(a);
  a = await open({ seed: pel(B(10), { a: { pfflags: ['retain'] }, p: { pfSafeSeen: ago(5) } }) });
  check('17.5 (her card put away on this plan)', !(await has(a.page, '.pl-pf-safe')));
  await startPelvic(a.page, 'stress', ['retain']);
  check('17.6 a new plan with the same sign shows its doctor card again', await has(a.page, '.pl-pf-safe'), (await view(a.page)).slice(0, 600));
  await done(a);
  a = await open({ seed: per('pain', B(5), { also: ['pelvic'], px: { pfRelax: ago(1), pfSafeAt: ago(3) } }), hash: '#post-pelvic' });
  check('17.7 her sets joined to another plan, breathing and letting go: the trainer has "A doctor checked it"', await has(a.page, '#pst-painok'));
  await tap(a.page, '#pst-painok');
  check('17.8 and it brings her squeezes back', !(await a.page.evaluate(() => window.Saathi.plan.pelvic.relax())) && await has(a.page, '#pst-pstart'));
  await done(a);
  a = await open({ seed: pel(B(30), { a: { pft: 'stress', pfway: '2', pfflags: ['mesh'] }, p: { log: { [ago(28)]: { lk: 'most', ci: 1 }, [ago(2)]: { lk: 'some', ci: 1 } } } }), hash: '#report' });
  const rp = await view(a.page);
  check('17.9 her report: when she leaks, her signs before she started, her leaks first and latest, her level', /When do you leak\? With a cough, sneeze, laugh or lift · Quite a lot/.test(rp) && /Before you start: A past operation for leaks or prolapse/.test(rp) && /Leaks: Most days · week 1 → Sometimes · week 4/.test(rp) && /Level \d of 8 · sets on \d+ days/.test(rp), rp.slice(0, 1400));
  await done(a);
  a = await open({ seed: seedOf({ goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'cycle' }, dob: '1985-01-01' }) });
  const urg = async (q) => { await a.page.evaluate((q) => { window.Saathi.mem.careQ = q; location.hash = 'care'; window.Saathi.render(); }, q); await settle(a.page, 400); return a.page.$eval('[data-urg]', (e) => e.dataset.urg).catch(() => null); };
  const u1 = await urg('can\'t control my bladder and my legs are numb'), u2 = await urg('पेशाब पर काबू नहीं और पैर सुन्न'), u3 = await urg('peshab rok nahi pa rahi aur kamar mein dard'), u4 = await urg('leaking urine when I cough'), u5 = await urg('can\'t hold urine');
  check('17.10 search: the new 112 sign in her words puts the urgent card first (English, Hindi, Hinglish); leaking on its own does not', u1 === 's1d' && u2 === 's1d' && u3 === 's1d' && !u4 && !u5, [u1, u2, u3, u4, u5]);
  check('17.11 the trainer\'s tile says only what every woman gets', /Guided squeeze-and-relax timer, step by step/.test(await (async () => { await a.page.evaluate(() => { window.Saathi.mem.careQ = 'pelvic floor'; window.Saathi.render(); }); await settle(a.page, 400); return view(a.page); })()));
  await done(a);
  a = await open({ seed: pel(B(3)), hm: '20:30', hash: '#plan-checkin' });
  await tap(a.page, '[data-ci="sets:n"]'); await tap(a.page, '[data-ci="find:n"]');
  check('17.12 "What got in the way?" has no "Weather or safety" (her sets need no space)', await has(a.page, '[data-ci-b="time"]') && !(await has(a.page, '[data-ci-b="out"]')));
  await tap(a.page, '[data-ci-b="time"]'); await tap(a.page, '#pl-ci-save');
  check('17.13 and its tip is about her sets, not walks', /A set takes a few minutes/.test(await view(a.page)) && !/walk/i.test(await txt(a.page, '#pl-ci-fb')), await txt(a.page, '#pl-ci-fb'));
  await done(a);
  const lg5 = {}; for (let k = 1; k <= 5; k++) lg5[ago(k)] = { ci: 1, ck: { sets: 'p' } };
  a = await open({ seed: pel(B(6), { p: { log: lg5 } }) });
  check('17.14 a "Partly" in the check-in is a day of sets (5 open level 2)', (await lvl(a.page)).n === 2, await lvl(a.page));
  await done(a);
  a = await open({ seed: Object.assign(pel(B(10)), { situation: { midlife: false, deliveredOn: ago(100) }, events: [] }), hash: '#post-pelvic' });
  const tb = await view(a.page);
  check('17.15 after a birth with this plan running, the trainer keeps the after-birth lines beside her level', /Level 1 of 8/i.test(tb) && /Belly gap/.test(tb) && /3 months after the birth/.test(tb), tb.slice(0, 900));
  await done(a);
}

{
  let a = await open({ seed: pel(B(5)), hm: '00:30', hash: '#post-pelvic' });
  await tap(a.page, '#pst-pstart'); await runSet(a.page);
  const pf = await a.page.evaluate(() => (window.Saathi.state.mods.post || {}).pf || {});
  check('17.16 a set at 00:30 counts for the evening before (her plan day ends at 4 am)', pf[ago(1)] === 1 && !pf[TODAY] && (await acts(a.page))[0].sub.indexOf('1 of 3 today') === 0, [pf, (await acts(a.page))[0]]);
  await done(a);
  a = await open({ seed: seedOf({ goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'cycle' }, dob: '1985-01-01', mods: {} }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pelvic')); await settle(a.page, 500);
  await tap(a.page, '[data-pl-q="pft:stress"]'); await tap(a.page, '#pl-in-next'); await tap(a.page, '#pl-in-next'); if (await has(a.page, '#pl-in-make')) await tap(a.page, '#pl-in-make');
  let rv = '';
  for (let i = 0; i < 6 && !(await has(a.page, '#pl-rv-go')); i++) { rv += ' ' + await view(a.page); if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  check('17.17 "Your plan is ready" says when each step comes: Days 1 to 3, Find the right muscles', /Days 1 to 3: Find the right muscles/.test(rv) && !/Every day: Find the right muscles/.test(rv), rv.slice(0, 900));
  check('17.18 the Start card names her 8 am first set among what will ring', /Reminders are on: your 8 am first set, your 8 pm check-in/.test(await view(a.page)), await view(a.page));
  await tap(a.page, '[data-rv-when="tomorrow"]'); await tap(a.page, '#pl-rv-go');
  const pr = (await st(a.page)).reminders.find((x) => x.id === 'plan-pf');
  check('17.19 a plan that starts tomorrow books her 8 am ring from that day', !!pr && pr.start === iso(TODAY, 1) && pr.time === '08:00', pr);
  await done(a);
}

/* her answers to any plan's questions: the first chip of each open question, Continue, to "Make my plan" and the reveal */
async function answerAll(page) {
  for (let i = 0; i < 12; i++) {
    if (await has(page, '#pl-in-make')) { await tap(page, '#pl-in-make'); break; }
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when]'); continue; }
    await page.evaluate(() => { const gs = {}; document.querySelectorAll('#view [data-pl-q]').forEach((b) => { const k = b.dataset.plQ.split(':')[0]; (gs[k] = gs[k] || []).push(b); });
      Object.values(gs).forEach((bs) => { if (!bs.some((b) => b.classList.contains('on'))) bs[0].click(); });
      const ms = {}; document.querySelectorAll('#view [data-pl-m]').forEach((b) => { const k = b.dataset.plM.split(':')[0]; (ms[k] = ms[k] || []).push(b); });
      Object.values(ms).forEach((bs) => { if (!bs.some((b) => b.classList.contains('on'))) (bs.find((b) => /:none$/.test(b.dataset.plM)) || bs[0]).click(); }); });
    await settle(page, 200); if (await has(page, '#pl-in-next')) await tap(page, '#pl-in-next'); else if (await has(page, '#pl-in-skip')) await tap(page, '#pl-in-skip'); else break;
  }
}
{
  let a = await open({ seed: pel(10, { pf: days(1, 10) }) });
  const hw = (await a.page.evaluate(() => window.Saathi.plan.actions()[0].how)) || '';
  check('17.20 My plan\'s "How to do it" for her sets is her level\'s squeezes', hw === '10 squeezes: hold each 5 seconds, then let go as long. Then 5 quick squeezes: squeeze, let go.', hw);
  await done(a);
  a = await open({ seed: seedOf({ goals: ['pain', 'pelvic'], intake: { goal: 'pain', stage: 'cycle' }, dob: '1994-01-01', events: regular(10) }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 500); await answerAll(a.page);
  let rv = ''; for (let i = 0; i < 6 && !(await has(a.page, '#pl-rv-go')); i++) { rv += ' ' + await view(a.page); if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  check('17.21 a plan her sets join says so in "What happens when"', /Every day: your squeeze sets, 3 a day/.test(rv), rv.slice(0, 1200));
  await done(a);
  a = await open({ seed: pel(B(10)) });
  await go(a.page, 'plan-settings');
  await a.page.evaluate(() => { const b = [...document.querySelectorAll('#view button')].find((x) => /^Pause for a week/i.test(x.textContent.trim())); if (b) b.click(); }); await settle(a.page, 500);
  await go(a.page, 'home');
  const rr = (await st(a.page)).reminders.map((x) => x.id);
  check('17.22 Pause for a week rests her 8 am ring too', rr.indexOf('plan-pf') < 0 && await a.page.evaluate(() => !!(window.Saathi.state.mods.plan || {}).pauseUntil), rr);
  await done(a);
  a = await open({ seed: Object.assign(pel(B(20), { p: { pauseUntil: ago(1), pfHeld: true, pfMade: true } }), { reminders: [planRem(B(20))] }) });
  check('17.23 and it comes back when the week is over', (await st(a.page)).reminders.some((x) => x.id === 'plan-pf'), (await st(a.page)).reminders.map((x) => x.id));
  await done(a);
  a = await open({ seed: pel(B(10), { also: ['pain'] }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pain')); await settle(a.page, 500); await answerAll(a.page);
  for (let i = 0; i < 6 && !(await has(a.page, '#pl-rv-go')); i++) { if (await has(a.page, '#pl-rv-next')) await tap(a.page, '#pl-rv-next'); else break; }
  if (await has(a.page, '#pl-rv-go')) await tap(a.page, '#pl-rv-go');
  await go(a.page, 'home');
  const pk = await a.page.evaluate(() => window.Saathi.plan.packOf());
  check('17.24 moving to another plan ends her 8 am ring (her sets join it, the ring belongs to this plan)', pk === 'pain' && !(await st(a.page)).reminders.some((x) => x.id === 'plan-pf'), [pk, (await st(a.page)).reminders.map((x) => x.id)]);
  await done(a);
}

{
  const a = await open({ seed: pel(B(15)) });
  const hb = (await acts(a.page)).find((x) => x.id === 'habit');
  await go(a.page, hb.go);
  check('17.25 her habit opens the chapter that teaches it (week 3: water, not this week\'s "Longer holds")', hb.go === 'pf-habit' && /Water through the day/.test(await txt(a.page, '.backrow, #view h1, #view .row')) && /6 to 8 glasses/.test(await view(a.page)), [hb, (await view(a.page)).slice(0, 300)]);
  await go(a.page, 'pf-lesson');
  check('17.26 the weekly chapter is still this week\'s', /Longer holds/.test(await view(a.page)));
  await done(a);
}

{
  let a = await open({ seed: per('pain', B(5), { also: ['pelvic'] }), hash: '#pf-go' });
  check('17.27 her sets joined to another plan: before her first set, the 7 signs that need a doctor first, and no set starts', await has(a.page, '.pst-jsafe') && (await a.page.$$('.pst-jsafe li')).length === 7 && !(await has(a.page, '#pst-pph')) && !(await has(a.page, '#pst-pstart')), (await view(a.page)).slice(0, 600));
  await tap(a.page, '#pst-jsafe-ok');
  check('17.28 "None of these" opens her sets, and it isn\'t asked again', !(await has(a.page, '.pst-jsafe')) && await has(a.page, '#pst-pstart') && await a.page.evaluate(() => !!window.Saathi.state.mods.plan.pfSafeAt));
  await done(a);
  a = await open({ seed: pel(B(5)), hash: '#post-pelvic' });
  check('17.29 the plan of her own asked them at joining, so its trainer doesn\'t again', !(await has(a.page, '.pst-jsafe')) && await has(a.page, '#pst-pstart'));
  await done(a);
  a = await open({ seed: pel(B(97), { a: { pft: 'heavy' }, p: { pfDoc: { at: ago(90), said: 'ok' }, log: { [ago(3)]: { lk: 'some', ci: 1 } } } }) });
  const ok = await a.page.evaluate(() => ({ les: window.Saathi.plan.pelvic.lesson(), target: window.Saathi.plan.pelvic.target() }));
  check('17.30 "I can exercise": no prolapse chapters after week 12, 1 set a day', ok.les === null && ok.target === 1, ok);
  await done(a);
  a = await open({ seed: pel(B(97), { a: { pft: 'heavy' }, p: { pfDoc: { at: ago(90), said: 'pop' }, endSeen: ago(10), log: { [ago(3)]: { lk: 'some', ci: 1 } } } }) });
  const pop = await a.page.evaluate(() => ({ les: window.Saathi.plan.pelvic.lesson(), target: window.Saathi.plan.pelvic.target() }));
  check('17.31 "a prolapse": the after-week-12 chapters and 3 sets a day, and "Still leaking or heavy?" waits for week 16', pop.les === 'v2' && pop.target === 3 && !(await has(a.page, '.pl-pf-end')), pop);
  await done(a);
}

{
  let a = await open({ seed: seedOf({ goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, dob: '1985-01-01' }), hash: '#post-pelvic' });
  check('17.32 the trainer without a plan offers My pelvic floor plan ("Your plan for this")', /My pelvic floor plan/.test(await txt(a.page, '.pl-for')) && await has(a.page, '.pl-for [data-pl-for="pelvic"]'), await txt(a.page, '.pl-for'));
  await done(a);
  a = await open({ seed: pel(B(5)), hash: '#post-pelvic' });
  check('17.33 and not on the trainer her own plan runs', !(await has(a.page, '.pl-for')));
  await done(a);
}

// ---------- 18 the phone test's fixes (3 Nov, Mohit's Flip5: "fix all 6") ----------
const ink = (page) => page.evaluate(() => { const c = document.querySelector('#view .card.urgent'); if (!c) return null; const pr = document.createElement('div'); pr.style.background = 'var(--ink)'; document.body.appendChild(pr);
  const want = getComputedStyle(pr).backgroundColor; pr.remove(); return { dark: c.classList.contains('dark'), bg: getComputedStyle(c).backgroundColor, want: want, tel: !!c.querySelector('a[href="tel:112"]') }; });
const tabOn = (page) => page.$eval('#tabbar button.on', (b) => b.dataset.go).catch(() => null);
{
  /* P1: her check-in said "Partly" after her first set; the two sets after it make the step done and her day complete */
  let a = await open({ seed: pel(B(3), { pf: { 0: 1 } }), hm: '20:30', hash: '#plan-checkin' });
  await tap(a.page, '[data-ci="find:d"]'); await tap(a.page, '#pl-ci-save');
  const lg = await a.page.evaluate((d) => (window.Saathi.state.mods.plan.log || {})[d] || {}, TODAY);
  check('18.1 (her check-in kept her sets as they stood: Partly, with its mode)', (lg.ck || {}).sets === 'p' && (lg.ckm || {}).sets === 's', lg);
  await go(a.page, 'post-pelvic'); await tap(a.page, '#pst-pstart'); await runSet(a.page); await tap(a.page, '#pst-pstart'); await runSet(a.page);
  await go(a.page, 'home');
  const s1 = await a.page.evaluate(() => window.Saathi.plan.actions().map((x) => x.id + ':' + x.state).join()); const v1 = await view(a.page);
  check('18.2 P1: then her 3 of 3 sets are done, not "Partly done", and her day is complete', s1 === 'sets:d,find:d' && !/Partly done/.test(v1) && /All 2 done today/.test(v1), [s1, v1.slice(0, 700)]);
  await done(a);
  /* P1 in breathing and letting go: her squeezes' "Partly" from earlier that day is not the breathing step's */
  a = await open({ seed: pel(B(3), { pf: { 0: 2 }, p: { pfRelax: TODAY, log: { [TODAY]: { ci: 1, ck: { sets: 'p' } } } } }) });
  const r1 = await a.page.evaluate(() => { const x = window.Saathi.plan.actions()[0]; return { t: x.title, s: x.state }; });
  check('18.3 P1: the day she moves to breathing and letting go, its step is not "Partly done" from her squeezes', /Breathe and let go/.test(r1.t) && !r1.s && !/Partly done/.test(await view(a.page)), [r1, (await view(a.page)).slice(0, 600)]);
  await done(a);
  a = await open({ seed: pel(B(3), { p: { pfRelax: TODAY } }), hm: '20:30', hash: '#plan-checkin' });
  await tap(a.page, '[data-ci="sets:d"]'); if (await has(a.page, '[data-ci="find:d"]')) await tap(a.page, '[data-ci="find:d"]'); await tap(a.page, '#pl-ci-save');
  const lg2 = await a.page.evaluate((d) => (window.Saathi.state.mods.plan.log || {})[d] || {}, TODAY);
  check('18.4 P1: her check-in while breathing and letting go keeps its mode', (lg2.ck || {}).sets === 'd' && (lg2.ckm || {}).sets === 'r', lg2);
  await done(a);
  const lg5 = {}; for (let k = 1; k <= 5; k++) lg5[ago(k)] = { ci: 1, ck: { sets: 'd' }, ckm: { sets: 'r' } };
  a = await open({ seed: pel(B(6), { p: { log: lg5 } }) });
  check('18.5 P1: 5 days of breathing are not 5 days of squeezes (level 1 stays; 17.14 is the squeeze version)', (await lvl(a.page)).n === 1, await lvl(a.page));
  await done(a);
  /* P2: a half-done sets row says her count */
  a = await open({ seed: pel(B(3), { pf: { 0: 1 } }) });
  const v2 = await view(a.page);
  check('18.6 P2: a half-done sets row says her count, not "Partly done"', /Your squeeze sets 1 of 3 today · level 1, lying down/.test(v2) && !/Your squeeze sets Partly done/.test(v2), v2.slice(0, 700));
  await done(a);
  a = await open({ seed: pel(B(3), { pf: { 0: 1 }, x: { settings: { discreet: true, notify: true } } }) });
  const v3 = await view(a.page);
  check('18.7 P2: in discreet mode only "Partly done", as before', !/1 of 3 today/.test(v3) && /Partly done/.test(v3), v3.slice(0, 700));
  await done(a);
}
{
  /* P3: week 1, the Find card leads until her first set of the day */
  let a = await open({ seed: pel(B(2)), hash: '#post-pelvic' });
  const ord = (p) => p.evaluate(() => { const f = document.querySelector('#view .pst-find'), s = document.querySelector('#pst-pstart'), ok = document.querySelector('#view .card.ok');
    const before = (x, y) => !!(x && y && (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING)); return { findFirst: before(f, s), okFirst: before(ok, f), startFirst: before(s, f) }; });
  const o1 = await ord(a.page);
  check('18.8 P3: week 1, before her first set: Find the right muscles first', o1.findFirst, o1);
  await tap(a.page, '#pst-pstart'); await runSet(a.page);
  const o2 = await ord(a.page);
  check('18.9 P3: after it, her set\'s result and Start come before Find, which stays on the page', o2.okFirst && o2.startFirst && await has(a.page, '#view .pst-find'), o2);
  await done(a);
  /* P4: breathing and letting go teaches no squeezes */
  for (const dd of [B(3), B(10)]) {
    a = await open({ seed: pel(dd, { pf: { 0: 2 }, p: { pfRelax: TODAY } }), hash: '#post-pelvic' });
    const rv = await view(a.page);
    check('18.10 P4: breathing and letting go (plan day ' + (dd + 1) + '): no Find card, squeeze ticks or "Is it the right squeeze?"; its card has Slow breaths, a Qura doctor and the way back',
      !(await has(a.page, '#view .pst-find')) && !(await has(a.page, '#view .pst-ticks')) && !(await has(a.page, '#view .pst-right')) && await has(a.page, '.pst-relax [data-go="calm-breaths"]') && await has(a.page, '.pst-relax [data-ask]') && await has(a.page, '.pst-relax #pst-painok') && !/Squeeze as if/.test(rv), rv.slice(0, 900));
    await done(a);
  }
  a = await open({ w: 360, h: 780, seed: Object.assign(pel(B(3), { pf: { 0: 2 }, p: { pfRelax: TODAY } }), { lang: 'hi' }), hash: '#post-pelvic' });
  check('18.11 P4: in Hindi at 360 px the breathing card and its Qura doctor fit', await noScroll(a.page) && await has(a.page, '.pst-relax [data-ask]'), (await view(a.page)).slice(0, 500));
  await done(a);
}
{
  /* P5: the 112 cards in ink, as Help's "Call 112 now" */
  let a = await open({ seed: pel(B(3)) });
  await a.page.evaluate(() => { window.Saathi.mem.pfLes = 'f10'; location.hash = 'pf-lesson'; }); await settle(a.page, 400);
  const k1 = await ink(a.page);
  check('18.12 P5: chapter 10\'s 112 card is ink', !!k1 && k1.dark && k1.bg === k1.want && k1.tel, k1);
  await go(a.page, 'intimate-prolapse');
  const k2 = await ink(a.page);
  check('18.13 P5: and the prolapse guide\'s', !!k2 && k2.dark && k2.bg === k2.want && k2.tel, k2);
  await done(a);
  const plain = ['app.js'].concat(fs.readdirSync(path.join(root, 'mods')).filter((f) => /\.js$/.test(f)).map((f) => 'mods/' + f)).filter((f) => /class="card urgent/.test(fs.readFileSync(path.join(root, f), 'utf8')));
  check('18.14 P5: no urgent card without its ink anywhere (the midlife and period chapters, the check-in\'s crisis card)', plain.length === 0, plain);
  /* P6: the trainer her plan runs is My plan's */
  a = await open({ seed: pel(B(3)), hash: '#post-pelvic' });
  const t1 = await tabOn(a.page); await go(a.page, 'pf-go'); const t2 = await tabOn(a.page);
  await done(a);
  a = await open({ seed: seedOf({ goals: ['track'], intake: { goal: 'track', stage: 'cycle' }, dob: '1985-01-01' }), hash: '#post-pelvic' });
  const t3 = await tabOn(a.page);
  check('18.15 P6: the trainer her plan runs lights My plan (also from the play button); without her plan, Explore as before', t1 === 'plan' && t2 === 'plan' && t3 === 'care', [t1, t2, t3]);
  await done(a);
  /* the phone check of the fixes (Mohit, 3 Nov: "fix the aria label too"): what a screen reader says for one full day and one step */
  const lab = (page, sel) => page.$eval(sel, (e) => e.getAttribute('aria-label')).catch(() => null);
  const full1 = { pf: { 0: 3 }, p: { log: { [TODAY]: { ck: { find: 'd' } } } } };
  a = await open({ seed: pel(B(3), full1) });
  const w1 = await lab(a.page, '#view .today-card .pl-d7'); await go(a.page, 'plan'); const w2 = await lab(a.page, '#view .pl-r7');
  check('18.16 the week dots and My plan\'s week say "1 full day so far", not "1 full days"', w1 === 'Week 1 of your plan: 1 full day so far' && w2 === w1, [w1, w2]);
  await done(a);
  a = await open({ seed: pel(B(3), { p: { pfRelax: TODAY } }) });
  const t0 = await a.page.$eval('#view .today-card .pl-d7d.now', (e) => e.title).catch(() => '');
  check('18.17 a day with one step says "0 of 1 step"', /: 0 of 1 step$/.test(t0), t0);
  await done(a);
  a = await open({ seed: Object.assign(pel(B(3), full1), { lang: 'hi' }) });
  const w3 = await lab(a.page, '#view .today-card .pl-d7');
  check('18.18 Hindi keeps its words ("1 दिन" was already right)', w3 === 'आपके प्लान का हफ़्ता 1: अब तक 1 दिन सारे क़दम पूरे', w3);
  await done(a);
}

console.log('page errors', errsAll.length ? errsAll : 'none');
check('16 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
process.exit(fails.length ? 1 : 0);
