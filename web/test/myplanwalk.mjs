// Version 39.45: the PMOS walk's gaps (Mohit's Flip5 at 360 dp, 30 Oct: "can you do a walkthrough on my phone and check gaps",
// then "fix all 4"; MODULE_API section 88). This file checks:
//   1 My plan's play button keeps "9 min" on one line, its icon at Today's size;
//   2 a bedtime her plan holds back to day 4 is named before it comes: the reveal's "Your 3 steps" leaves it out, "What happens
//     when" starts "From day 4: wind down, in bed by 11 pm", the Start card says "your 10:30 pm wind-down from day 4", and My plan
//     says it under her steps until it joins; a plan whose bedtime is there from day 1 is as before;
//   3 "Your last plan" is a real one: no copy of the plan "marked by mistake" brought back, no pregnancy plan marked by mistake
//     (with or without a plan before it), and phones that already hold one are mended; a loss or a birth keeps its plan;
//   4 Moves and calm shows the 3D figure (Version 39.39): each routine's first position and the walk's loop; without web/fig,
//     or with "reduce motion", as before;
//   5 Hindi at 360 px; 6 no page errors.
// Usage: node test/myplanwalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'myplanwalk'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.44-pilot', platform: 'android' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {}, goals: ['pmos'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'pmos', stage: 'cycle' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });

const bridge = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return false; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.cfg || {})) + ';');
  if (o.bridge) await ctx.addInitScript(bridge);   /* the Android bridge, as test/notify.mjs fakes it: the Start card says what will ring */
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
const ids = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => x.id));
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const remIds = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => r.id).join());
const pasts = (s) => ((s.mods.plan || {}).past || []).map((x) => x.pack + ':' + x.start).join();

const cyc3 = (starts) => starts.flatMap((x) => [{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]);
const PMOS = (startAgo, o) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'morning', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], intake: { at: ago(startAgo + 1), stage: 'cycle', goal: 'pmos', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'morning' } }, o || {});
const cycSeed = (x) => Object.assign({ situation: { care: 'private' }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, events: cyc3([120, 78, 36]) }, x || {});
const pm = (startAgo, o, x) => cycSeed(Object.assign({ mods: { plan: PMOS(startAgo, o) }, intake: PMOS(startAgo).intake }, x || {}));
const PMOS_IK = { stage: 'cycle', goal: 'pmos', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'morning' };
const PAIN_IK = { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' };
const TTCIK = { at: ago(2), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: ['meds'], trying: null, bmi: null, bset: 'std', bdoc: 'meds' };
const TTC = { pack: 'ttc', goalKey: 'ready', start: ago(1), started: ago(1), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: {}, body: [], intake: TTCIK };
const REM = { id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(1), every: 1, time: '20:00', on: true, doneOn: null };
const trying = (x) => Object.assign({ situation: { planning: true, care: 'private' }, intake: TTCIK, mods: { plan: TTC }, reminders: [REM], settings: { notify: true }, goals: ['ready'] }, x || {});
/* the stage sheet: pick a stage, then a last period date (or the mistake/ended answer), then Save */
const stageTo = async (a, s, o) => { await tap(a, '#stage-btn'); await tap(a, '[data-stage="' + s + '"]');
  if (o && o.lmp != null) await a.page.$eval('#st-lmp', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, o.lmp);
  if (o && o.end) await tap(a, '[data-st-end="' + o.end + '"]'); await tap(a, '#st-save'); await settle(a.page, 1200); };
const toStart = async (a) => { await go(a, 'plan-reveal'); for (let i = 0; i < 8 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next'); };
const startPreg = async (a) => { await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'preg', goal: 'food', pflags: [], pnow: 'n' })); await settle(a.page, 300);
  await toStart(a); await tap(a, '#pl-rv-go'); await settle(a.page, 1000); };
const startPmos = async (a) => { await a.page.evaluate((ik) => window.Saathi.plan.startFromIntake(ik), PMOS_IK); await settle(a.page, 300); await toStart(a); await tap(a, '#pl-rv-go'); await settle(a.page, 1000); };
/* the reveal's cards, one text each, to the Start card */
const reveal = async (a, ik) => { await a.page.evaluate((x) => window.Saathi.plan.startFromIntake(x), ik); await settle(a.page, 300); await go(a, 'plan-reveal');
  const out = []; for (let i = 0; i < 8; i++) { out.push({ v: await view(a), tl: await a.page.$$eval('#view .pl-tl li', (xs) => xs.map((x) => x.textContent.trim())), rem: await txt(a, '#view .pl-st-rem') }); if (await has(a, '#pl-rv-go')) break; await tap(a, '#pl-rv-next'); } return out; };
const PLAY_BTN = () => { const b = document.querySelector('#view [data-pl-start]'); if (!b) return null; const sv = b.querySelector('svg'); const r = b.getBoundingClientRect();
  return { t: b.textContent.trim(), h: Math.round(r.height), ws: getComputedStyle(b).whiteSpace, fit: b.scrollWidth <= b.clientWidth + 1, sv: sv ? Math.round(sv.getBoundingClientRect().width) : 0 }; };

/* ---------- 1 My plan's play button ---------- */
{
  for (const w of [300, 360]) {
    const a = await open({ w: w, h: 800, seed: pm(5), hash: 'plan' });
    const b = await a.page.evaluate(PLAY_BTN);
    check('1 ' + w + ' px: My plan\'s play button keeps "N min" on one line (no wrap, nothing cut), its icon 16 px', b && /^\d+ min$/.test(b.t) && b.ws === 'nowrap' && b.fit && b.h <= 44 && b.sv === 16, b);
    if (w === 360) await shot(a, 'plan-360');
    await go(a, 'home');
    const tsv = await a.page.$eval('#view .today-plan-yoga .today-start svg', (x) => Math.round(x.getBoundingClientRect().width)).catch(() => 0);
    check('1 ' + w + ' px: ... the same size as Today\'s', tsv === 16, tsv);
    await done(a);
  }
}

/* ---------- 2 a bedtime that joins on day 4 is named before it comes ---------- */
{
  const a = await open({ seed: cycSeed({ settings: { notify: true } }), bridge: true });
  const c = await reveal(a, PMOS_IK);
  const steps = c.find((x) => /^Your \d steps?/.test(x.v)) || { v: '' };
  check('2 PMOS reveal: "Your 3 steps", the 3 she does on day 1 (no bedtime among them)', /^Your 3 steps/.test(steps.v) && !/bedtime|in bed by/i.test(steps.v), steps.v.slice(0, 400));
  const days = c.find((x) => x.tl.length) || { tl: [] };
  check('2 PMOS reveal: "What happens when" starts "From day 4: wind down, in bed by 11 pm"', days.tl[0] === 'From day 4: wind down, in bed by 11 pm' && days.tl.length === 4, days.tl);
  const last = c[c.length - 1];
  check('2 PMOS Start card: the reminders say "your 10:30 pm wind-down from day 4", after her check-in', /your 8 pm check-in and your 10:30 pm wind-down from day 4\./.test(last.rem), last.rem);
  await done(a);
  const b = await open({ seed: cycSeed({ goals: ['pain'], intake: { goal: 'pain', stage: 'cycle' }, settings: { notify: true } }), bridge: true });
  const p = await reveal(b, PAIN_IK);
  const ps = p.find((x) => /^Your \d steps?/.test(x.v)) || { v: '' }; const pd = p.find((x) => x.tl.length) || { tl: [] }; const pl = p[p.length - 1];
  check('2 a plan whose bedtime is there from day 1 (pain): in its steps, no "From day" row, and the Start card names the wind-down without a day', /A regular bedtime: 11 pm/.test(ps.v) && !pd.tl.some((x) => /^From day/.test(x)) && /your 10:30 pm wind-down/.test(pl.rem) && !/from day/.test(pl.rem), { s: ps.v.slice(0, 300), tl: pd.tl, rem: pl.rem });
  await done(b);
  for (const n of [0, 2]) {
    const d = await open({ seed: pm(n), hash: 'plan' });
    check('2 My plan, plan day ' + (n + 1) + ': under her 3 steps, "From day 4: wind down, in bed by 11 pm"', (await txt(d, '#view .pl-steps-card .pl-later')) === 'From day 4: wind down, in bed by 11 pm' && (await ids(d)).length === 3, await txt(d, '#view .pl-steps-card'));
    await done(d);
  }
  const e = await open({ seed: pm(3), hash: 'plan' });
  check('2 My plan, day 4: her bedtime is a step (4 steps), and the line is gone', !(await has(e, '#view .pl-later')) && (await ids(e)).indexOf('sleep') >= 0 && (await ids(e)).length === 4, await ids(e));
  await done(e);
}

/* ---------- 3 "Your last plan" is a real one ---------- */
{
  /* Getting ready, then pregnant with My pregnancy, then "No, I marked it by mistake", then the PMOS plan */
  const a = await open({ seed: trying(), wait: 1200 });
  await stageTo(a, 'preg', { lmp: ago(212) }); await startPreg(a);
  await a.page.evaluate(() => { location.hash = 'home'; }); await settle(a.page, 500); await stageTo(a, 'cycle', { end: 'mistake' });
  const s1 = await st(a);
  check('3 marked by mistake: Getting ready is back, with no copy of itself and no pregnancy plan in her past plans', s1.mods.plan.pack === 'ttc' && s1.mods.plan.start === ago(1) && pasts(s1) === '', pasts(s1));
  await startPmos(a);
  const s2 = await st(a);
  check('3 ... then the PMOS plan: Getting ready is her last plan, once', s2.mods.plan.pack === 'cycle' && pasts(s2) === 'ttc:' + ago(1), pasts(s2));
  await go(a, 'plan');
  check('3 ... My plan: "Your last plan: Getting ready for a baby"', /Your last plan Getting ready for a baby/.test(await txt(a, '#view .pl-past')), await txt(a, '#view .pl-past'));
  await done(a);
  /* the same with no plan before her pregnancy plan (Mohit's phone: "My pregnancy plan · 29 Oct to 30 Oct") */
  const b = await open({ seed: cycSeed({ settings: { notify: true } }), wait: 1200 });
  await stageTo(b, 'preg', { lmp: ago(212) }); await startPreg(b);
  await b.page.evaluate(() => { location.hash = 'home'; }); await settle(b.page, 500); await stageTo(b, 'cycle', { end: 'mistake' });
  const s3 = await st(b);
  check('3 no plan before it: the mistaken pregnancy plan ends (no plan, no check-in) and isn\'t kept', !s3.mods.plan.pack && !s3.mods.plan.start && pasts(s3) === '' && (await remIds(b)).split(',').indexOf('plan') < 0, { pack: s3.mods.plan.pack, p: pasts(s3), rem: await remIds(b) });
  await startPmos(b); await go(b, 'plan');
  check('3 ... then the PMOS plan: no "Your last plan"', !(await has(b, '#view .pl-past')) && pasts(await st(b)) === '', await txt(b, '#view .pl-past'));
  await done(b);
  /* a phone that already holds one: mended when Sakhi opens */
  const PP = (o) => Object.assign({ pack: 'preg', goalKey: 'food', pv: 2, start: ago(1), end: ago(0), days: 1, wk: 1, weeks: {} }, o || {});
  const c = await open({ seed: pm(0, { past: [PP(), { pack: 'cycle', goalKey: 'irregular', pv: 1, start: ago(200), end: ago(120), days: 40, wk: 12, weeks: {} }] }), hash: 'plan' });
  check('3 a phone like Mohit\'s (the PMOS plan, and a pregnancy plan of 29 to 30 Oct with no pregnancy behind it): her last plan is the one before', /^Your last plan My cycle plan · /.test(await txt(c, '#view .pl-past')) && pasts(await st(c)) === 'cycle:' + ago(200), { card: await txt(c, '#view .pl-past'), p: pasts(await st(c)) });
  await done(c);
  const d = await open({ seed: trying({ mods: { plan: Object.assign({}, TTC, { past: [{ pack: 'ttc', goalKey: 'ready', pv: 2, start: ago(1), end: ago(0), days: 1, wk: 1, weeks: {} }] }) } }), hash: 'plan' });
  check('3 a phone with a copy of the plan she runs (Getting ready brought back): the copy is gone', pasts(await st(d)) === '' && !(await has(d, '#view .pl-past')), pasts(await st(d)));
  await done(d);
  const e = await open({ seed: pm(0, { past: [PP({ start: ago(300), end: ago(100), days: 150, wk: 12 })] }, { situation: { care: 'private', deliveredOn: ago(100) } }), hash: 'plan' });
  check('3 after a birth, her pregnancy plan stays her last plan', /My pregnancy/i.test(await txt(e, '#view .pl-past')) && pasts(await st(e)) === 'preg:' + ago(300), { card: await txt(e, '#view .pl-past'), p: pasts(await st(e)) });
  await done(e);
  const f = await open({ seed: pm(0, { past: [PP({ start: ago(90), end: ago(10), days: 20 })] }, { situation: { care: 'private', pregEndedOn: ago(10), pregEndedHow: 'loss' } }), hash: 'plan' });
  check('3 after a loss, it is kept (and, as before, not on show: review SAFETY-07)', pasts(await st(f)) === 'preg:' + ago(90) && !(await has(f, '#view .pl-past')), pasts(await st(f)));
  await done(f);
}

/* ---------- 4 Moves and calm shows the 3D figure ---------- */
{
  const a = await open({ w: 360, h: 800, seed: pm(5), hash: 'plan-moves', wait: 1200 });
  const r = await a.page.$$eval('#view .pl-ritem .pl-rfig', (xs) => xs.map((x) => { const im = x.querySelector('img.pl-3d'); return { im: im ? im.getAttribute('src') : null, ok: !!(im && im.complete && im.naturalWidth > 0), svg: !!x.querySelector('svg') }; }));
  check('4 each routine shows its first position as the 3D figure\'s still (loaded), not the drawing', r.length >= 3 && r.every((x) => /^fig\/s\/[a-z]+\.webp$/.test(x.im || '') && x.ok && !x.svg), r);
  const w = await a.page.$eval('#pl-walkfig', (x) => { const v = x.querySelector('video'); return { v: v ? v.getAttribute('src') : null, poster: v ? v.getAttribute('poster') : null, loop: v ? v.loop && v.muted : false, svg: !!x.querySelector('svg') }; });
  check('4 the walk card plays the 3D walk loop (muted, looping), its still as the poster', w.v === 'fig/v/walk.webm' && w.poster === 'fig/s/walk.webp' && w.loop && !w.svg, w);
  check('4 no side scroll at 360 px', await noScroll(a));
  await shot(a, 'moves-360');
  await done(a);
  const b = await open({ seed: pm(5), hash: 'plan-moves', reduce: true });
  check('4 "reduce motion": the walk card shows its still', (await b.page.$eval('#pl-walkfig', (x) => (x.querySelector('img.pl-3d') || {}).getAttribute ? x.querySelector('img.pl-3d').getAttribute('src') : '')) === 'fig/s/walk.webp' && !(await has(b, '#pl-walkfig video')));
  await done(b);
  const c = await open({ seed: pm(5), hash: 'plan-moves', cfg: { fig: false } });
  check('4 without the figure (SAKHI_CONFIG.fig false): the drawings, as before', (await c.page.$$eval('#view .pl-ritem .pl-rfig', (xs) => xs.every((x) => !!x.querySelector('svg') && !x.querySelector('img')))) && (await has(c, '#pl-walkfig svg')) && !(await has(c, '#pl-walkfig video')));
  await done(c);
}

/* ---------- 5 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, seed: Object.assign(pm(0), { lang: 'hi' }), hash: 'plan' });
  const b = await a.page.evaluate(PLAY_BTN);
  check('5 Hindi at 360 px: My plan\'s play button "N मिनट" on one line', b && /^\d+ मिनट$/.test(b.t) && b.fit && b.h <= 44, b);
  const l = await txt(a, '#view .pl-later');
  check('5 Hindi: "4वें दिन से: …" under her steps, no string keys, no side scroll', /^4वें दिन से: .*11/.test(l) && !/plan_[a-z_]+/.test(await view(a)) && (await noScroll(a)), l);
  await shot(a, 'hi-plan');
  await done(a);
}

check('6 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (myplanwalk)');
process.exit(failed.length ? 1 : 0);
