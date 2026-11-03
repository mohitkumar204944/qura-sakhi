// Version 39.57, the all-plans walk's gaps (Mohit, 3 Nov: "can you do a proper walkthrough of all plans one by one", then "fix all 11";
// docs/plans-walkthrough-2026-11-03.md). One check per item, each on the plan the walk found it in:
// - 1 My pregnancy: her pelvic floor set answered in the check-in, and counted from the trainer (a tool's Done beats Partly);
// - 2 Getting ready: her folic acid in the check-in (Done means she has her tablets: the 9 pm ring, a tick from then on);
// - 3 the doctor loop: "I've seen a doctor" on Today's finding, "Still to see a doctor?" after 4 weeks, and her plan's own
//   "Did you get the doctor check?" leading past day 21 while the finding is open;
// - 4 the doctor route on the missed-period pages; 5 trying for a baby: the test first, the choices one quiet row, no "Didn't plan
//   this?", and no "Period late?" after a positive test;
// - 6 the period card's first question, then the rest; 7 day 42 after a birth; 8 My plan after a plan change, and no cramps
//   routine in the first 6 weeks after a birth; 9 the midlife skill's name; 10 "both 42 days"; 11 the anaemia page's 112 line once.
// Usage: node test/allwalk.mjs [web dir]
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

/* her plan's check-in: Done for every step it asks (or the first answer when there is no Done), then Save */
async function checkinAll(page, pick) {
  await page.waitForSelector('#pl-ci-save', { timeout: 5000 });
  const ids = await page.$$eval('[data-ci]', (bs) => [...new Set(bs.map((b) => b.dataset.ci.split(':')[0]))]);
  for (const id of ids) { const v = (pick || {})[id] || 'd'; if (await has(page, '[data-ci="' + id + ':' + v + '"]')) await tap(page, '[data-ci="' + id + ':' + v + '"]'); }
  await tap(page, '#pl-ci-save');
}
const stOf = (page, id) => page.evaluate((x) => { const a = (window.Saathi.plan.actions() || []).find((y) => y.id === x); return a ? { kind: a.kind, state: a.state || null, play: a.play || null, title: a.title } : null; }, id);
const SHOTS = path.join(here, 'shots', 'allwalk'); fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }).catch(() => null);
const click = (page, text) => page.evaluate((x) => { const b = [...document.querySelectorAll('#view button, #view a')].find((e) => e.textContent.replace(/\s+/g, ' ').trim() === x); if (b) b.click(); return !!b; }, text);

/* ---------- 1 My pregnancy: her pelvic floor set ---------- */
const PIK = { at: ago(11), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 20, pnow: null };
const pregP = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: PIK }, o || {});
const pregS = (o, x) => { x = x || {}; const rest = Object.assign({}, x); delete rest.mods;
  return Object.assign({ dob: '1996-05-01', situation: { pregnant: true, pregnantSince: ago(7 * 20 + 3), care: 'private' }, events: [], goals: ['food'], intake: { goal: 'food', stage: 'preg' }, reminders: [planRem(B(11))] }, rest, { mods: Object.assign({ plan: pregP(B(11), o) }, x.mods || {}) }); };
{
  let a = await open({ seed: pregS() });
  const pf = await stOf(a.page, 'pf');
  check('1.1 My pregnancy at 20 weeks: her pelvic floor set is a step she can tick, with the trainer to play', !!pf && pf.kind === 'tick' && pf.play === 'post-pelvic', pf);
  await done(a);
  a = await open({ seed: pregS(), hm: '20:30', hash: '#plan-checkin' });
  const ask = await has(a.page, '[data-ci="pf:d"]'); const doIt = await has(a.page, '.pl-ci [data-go="post-pelvic"]');
  await checkinAll(a.page);
  const pf2 = await stOf(a.page, 'pf');
  check('1.2 her check-in asks it (Done, Partly, Not today), with no "Do it now", and her Done counts', ask && !doIt && pf2 && pf2.state === 'd', [ask, doIt, pf2]);
  await done(a);
  a = await open({ seed: pregS({ log: { [TODAY]: { ck: { pf: 'p' } } } }, { mods: { post: { pf: { [TODAY]: 1 } } } }) });
  const pf3 = await stOf(a.page, 'pf');
  check('1.3 a set in the trainer counts even after a "Partly" in her check-in (the tool\'s Done wins)', pf3 && pf3.state === 'd', pf3);
  await done(a);
}

/* ---------- 2 Getting ready: her folic acid ---------- */
const TIK = { at: ago(1), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' };
const babyP = (startAgo, o) => Object.assign({ pack: 'ttc', goalKey: 'ready', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], intake: TIK }, o || {});
const tryS = (startAgo, o, x) => Object.assign({ dob: '1996-05-01', situation: { planning: true, care: 'private' }, events: regular(10), goals: ['ready'], intake: { goal: 'ready', stage: 'ttc' },
  mods: { plan: babyP(startAgo, o) }, reminders: [planRem(startAgo)] }, x || {});
{
  const a = await open({ seed: tryS(B(5)), hm: '20:30', hash: '#plan-checkin' });
  await shot(a.page, '2-folic-checkin'); const q = { d: await has(a.page, '[data-ci="folic:d"]'), p: await has(a.page, '[data-ci="folic:p"]'), go: await has(a.page, '.pl-ci [data-go="ttc-folic"]') };
  check('2.1 Getting ready, before she says she has tablets: the check-in asks her folic acid (Done or Not today), with no "Do it now"', q.d && !q.p && !q.go, q);
  await checkinAll(a.page);
  const r = await a.page.evaluate(() => ({ has: window.Saathi.ttc.folic.has(), rem: (window.Saathi.state.reminders || []).find((x) => x.id === 'ttc-folic') || null }));
  const fo = await stOf(a.page, 'folic');
  check('2.2 her Done means she has them: the 9 pm ring is booked and the step is a tick, done today', r.has && r.rem && r.rem.time === '21:00' && fo && fo.kind === 'tick' && fo.state === 'd', [r, fo]);
  await done(a);
  /* Mohit, 3 Nov: "make the folic question optional" */
  const b = await open({ seed: tryS(B(5)), hm: '20:30', hash: '#plan-checkin' });
  const left = await txt(b.page, '#view');
  await checkinAll(b.page, { folic: 'none' });
  const r2 = await b.page.evaluate((d) => { const S = window.Saathi; const x = ((S.state.mods.plan || {}).log || {})[d] || {}; return { ci: x.ci, ck: (x.ck || {}).folic || null, has: S.ttc.folic.has(), rem: !!(S.state.reminders || []).find((y) => y.id === 'ttc-folic') }; }, TODAY);
  check('2.3 the folic question is optional: "2 questions left", Save works without it, and nothing is saved or booked for it', /2 questions left/.test(left) && r2.ci === 1 && !r2.ck && !r2.has && !r2.rem, [left.slice(0, 120), r2]);
  await done(b);
}

/* ---------- 3 the doctor loop ---------- */
/* Priya, 28, PMOS, periods 42 days apart (her last started 36 days ago), on My PMOS plan since plan day 1 = startAgo + 1 days ago */
const gaps42 = () => [120, 78, 36].reduce((o, x) => o.concat([{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), []);
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' }, o || {});
const pmosP = (startAgo, ik) => ({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true, seenM: true } }, body: [], intake: CIK(ik) });
const pmosS = (startAgo, ik, x) => Object.assign({ dob: '1998-05-01', situation: { care: 'private' }, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: pmosP(startAgo, ik) }, reminders: [planRem(startAgo)] }, x || {});
const gapKey = (page) => page.evaluate(() => ((window.Saathi.explain.findings() || []).find((f) => f.id === 'gap_long') || {}).key || null);
{
  let a = await open({ seed: pmosS(B(35)) });
  const row = await txt(a.page, '.xp-home-wrap'); await shot(a.page, '3-finding');
  check('3.1 My PMOS plan, gaps of 42 days: Today\'s finding has "I\'ve seen a doctor"', /Your last gap was 42 days/.test(row) && /See a doctor this month/.test(row) && /I’ve seen a doctor/.test(row), row);
  const k = await gapKey(a.page);
  await a.page.evaluate((kk) => { const S = window.Saathi; const d = S.data('explain'); d.shown = Object.assign({}, d.shown, { [kk]: S.toISO(S.addDays(S.today(), -30)) }); S.saveQuiet(); S.render(); }, k); await settle(a.page, 400);
  const row2 = await txt(a.page, '.xp-home-wrap');
  check('3.2 after 4 weeks on Today it says "Still to see a doctor?", not "this month" again', /Still to see a doctor\?/.test(row2) && !/this month/.test(row2), row2);
  if (await has(a.page, '.xp-seen')) await tap(a.page, '.xp-seen');
  const seen = await a.page.evaluate((kk) => !!(window.Saathi.data('explain').seen || {})[kk], k);
  check('3.3 "I\'ve seen a doctor" takes it off Today', seen && !/Your last gap was/.test(await txt(a.page, '.xp-home, .xp-home-wrap')), seen);
  await done(a);
  a = await open({ seed: pmosS(B(35), { skips: 'y' }) });
  const sl = { doc: await has(a.page, '#view .pl-sl-doc #pl-doc-yes'), xp: /Your last gap was/.test(await txt(a.page, '.xp-home, .xp-home-wrap')) };
  check('3.4 with a doctor check of its own, on plan day 35: "Did you get the doctor check?" leads, and the finding steps aside', sl.doc && !sl.xp, sl);
  if (await has(a.page, '#pl-doc-yes')) await tap(a.page, '#pl-doc-yes');
  const af = { said: await has(a.page, '#view .pl-sl-said'), xp: /Your last gap was/.test(await txt(a.page, '.xp-home, .xp-home-wrap')), doc: await a.page.evaluate(() => window.Saathi.state.mods.plan.doc) };
  check('3.5 "Yes, done": her plan asks what the doctor said, and the finding stays off Today', af.said && !af.xp && af.doc === 'done', af);
  await done(a);
  a = await open({ w: 360, h: 780, seed: Object.assign(pmosS(B(35)), { lang: 'hi' }) });
  check('3.6 in Hindi at 360 px, the finding and its answer fit', await noScroll(a.page) && /मैं डॉक्टर को दिखा चुकी हूँ/.test(await txt(a.page, '.xp-home-wrap')), await txt(a.page, '.xp-home-wrap'));
  await done(a);
}

/* ---------- 4 and 5 the missed-period pages ---------- */
const lateS = (sit, x) => Object.assign({ dob: '1996-05-01', situation: sit, events: regular(40), goals: sit.planning ? ['ready'] : ['track'], intake: { goal: sit.planning ? 'ready' : 'track', stage: sit.planning ? 'ttc' : 'cycle' } }, x || {});
{
  let a = await open({ seed: lateS({ planning: true, care: 'private' }), hash: '#pregtest' });
  let v = await view(a.page); await shot(a.page, '5-trying-hub');
  check('4.1 her own doctor: "Where to get a test" says a chemist and her doctor, one quiet free line, no ASHA or ANM', !/ASHA|ANM/.test(v) && /your doctor can test you/.test(v) && /also free at a government health centre/.test(v), v.slice(0, 1200));
  const items = await a.page.$$eval('#view [data-go]', (bs) => bs.map((b) => b.dataset.go));
  const ch = await txt(a.page, '#view [data-go="pregtest-options"]');
  check('5.1 trying for a baby: the test first, no abortion rows, and her choices as one quiet row', items.indexOf('pregtest-abortion') < 0 && items.indexOf('pregtest-after') < 0 && items.filter((x) => x === 'pregtest-options').length === 1 && /Your choices/.test(ch) && items.indexOf('pregtest-when') < items.indexOf('pregtest-options'), [items, ch]);
  await go(a.page, 'pregtest-when'); await click(a.page, 'Positive'); await settle(a.page, 300);
  v = await view(a.page);
  check('4.2 a positive result, her own doctor: one quiet free line, no ANM registering or ANM tablets', /also free at the sub-centre/.test(v) && !/Registering with your ANM/.test(v) && !/ANM gives them free/.test(v), v.slice(0, 1500));
  check('5.2 trying for a baby, a positive result: no "Didn\'t plan this?" and no "Your choices", the pregnancy guide', !/Didn't plan this\?/.test(v) && !(await has(a.page, '#view [data-go="pregtest-options"]')) && await has(a.page, '#view [data-go="preg"]'), v.slice(0, 1500));
  await done(a);
  a = await open({ seed: lateS({ care: 'govt' }), hash: '#pregtest' });
  v = await view(a.page); const it2 = await a.page.$$eval('#view [data-go]', (bs) => bs.map((b) => b.dataset.go));
  check('4.3 the government route as before, and a woman who isn\'t trying keeps every row', /Your ASHA usually carries/.test(v) && it2.indexOf('pregtest-abortion') >= 0 && it2.indexOf('pregtest-after') >= 0, it2);
  await done(a);
  a = await open({ seed: tryS(B(45), {}, { events: regular(40) }) });
  const late1 = await has(a.page, '#view .hl-late-go');
  await done(a);
  a = await open({ seed: tryS(B(45), {}, { events: regular(40), mods: { plan: babyP(B(45)), pregtest: { tests: [{ d: ago(1), r: 'pos' }] } } }) });
  const late2 = await has(a.page, '#view .hl-late-go');
  check('5.3 Today\'s "Period late? A home test is the first step" goes once her positive test is saved', late1 && !late2, [late1, late2]);
  await done(a);
}

/* ---------- 6 the period card in the check-in ---------- */
{
  const a = await open({ seed: per('heavy', B(5), { last: 1 }), hm: '20:30', hash: '#plan-checkin' });
  const s0 = { soak: await has(a.page, '.pl-ci-pt [data-ci-pt="soak:n"]'), clots: await has(a.page, '.pl-ci-pt [data-ci-pt^="clots:"]') };
  await shot(a.page, '6-period-card'); await tap(a.page, '.pl-ci-pt [data-ci-pt="soak:n"]'); await shot(a.page, '6b-period-card-open');
  const s1 = { clots: await has(a.page, '.pl-ci-pt [data-ci-pt^="clots:"]'), way: await has(a.page, '.pl-ci-pt [data-ci-ptw="night"]') };
  check('6.1 heavy periods, a period day: "Your period today" asks its first question, then the other two once she answers', s0.soak && !s0.clots && s1.clots && s1.way, [s0, s1]);
  await done(a);
}

/* ---------- 7 day 42 after a birth ---------- */
const postS = (n) => ({ dob: '1996-05-01', situation: { deliveredOn: ago(n), breastfeeding: true, care: 'private' }, events: [], goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' } });
{
  let a = await open({ seed: postS(42) }); const v42 = await view(a.page); await done(a);
  a = await open({ seed: postS(41) }); const v41 = await view(a.page); await done(a);
  check('7.1 after a birth, day 42: "The first 6 weeks are done", not "Week 6 of 6" (day 41 still says it)', /The first 6 weeks are done/.test(v42) && !/Week 6 of 6/.test(v42) && /Week 6 of 6/.test(v41), [v42.slice(0, 300), v41.slice(0, 300)]);
}

/* ---------- 8 My plan after a plan change ---------- */
{
  let a = await open({ seed: tryS(B(20), {}, { situation: { planning: true, pregnant: true, pregnantSince: ago(40), care: 'private' } }), hash: '#plan' });
  const v = await view(a.page);
  check('8.1 her plan changed (now pregnant): My plan shows the change card and her new plan\'s goals, no suggestions or more plans', await has(a.page, '#view .pl-chg') && await has(a.page, '#view .pl-pick') && !/Suggested for you|More plans/.test(v), v.slice(0, 900));
  await done(a);
  a = await open({ seed: postS(10), hash: '#plan' }); const p10 = await has(a.page, '#view [data-go="relief-cramps"]'); await done(a);
  a = await open({ seed: seedOf({ goals: ['track'], intake: { goal: 'track', stage: 'cycle' } }), hash: '#plan' }); const pc = await has(a.page, '#view [data-go="relief-cramps"]'); await done(a);
  check('8.2 "For period cramps" isn\'t offered in the first 6 weeks after a birth (it is for a woman tracking her periods)', !p10 && pc, [p10, pc]);
}

/* ---------- 9, 10 and 11 ---------- */
const MANS = { goal: 'hot', stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' };
const menoS = (startAgo) => ({ dob: '1975-03-01', situation: { stopped: true, care: 'private' }, intake: { goal: 'hot', stage: 'meno' }, goals: ['hot'], events: regular(400),
  mods: { plan: Object.assign(planOf('meno', startAgo), { goalKey: 'hot', pv: 2, doc: undefined, intake: MANS }) }, reminders: [planRem(startAgo)] });
{
  let a = await open({ seed: menoS(B(16)) });
  const sk = (await acts(a.page)).map((x) => x.title).find((x) => /Today’s skill/.test(x)) || '';
  check('9.1 My midlife plan, week 3: the skill is "carry on through a flush", not just "carry on"', sk === 'Today’s skill: carry on through a flush', sk);
  await done(a);
  a = await open({ seed: seedOf({ goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, events: gaps42(), dob: '1998-05-01' }) });
  await a.page.evaluate(() => window.Saathi.plan.offer('pmos')); await settle(a.page, 500);
  const q1 = await view(a.page);
  check('10.1 My PMOS plan\'s first question: "your last 2 gaps were both 42 days", not "42 to 42"', /your last 2 gaps were both 42 days/.test(q1) && !/42 to 42/.test(q1), q1.slice(0, 400));
  await done(a);
  a = await open({ seed: seedOf({ goals: ['heavy'], intake: { goal: 'heavy', stage: 'cycle' } }), hash: '#cond-anaemia' });
  const n112 = ((await view(a.page)).match(/Soaking a pad every 1–2 hours and feeling dizzy or breathless/g) || []).length;
  check('11.1 the anaemia page says its 112 line once', n112 === 1, n112);
  await done(a);
}

console.log('page errors', errsAll.length ? errsAll : 'none');
check('12 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
process.exit(fails.length ? 1 : 0);
