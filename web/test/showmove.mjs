// Version 39.69: every exercise shows the right moves, never a still (Mohit, 5 Nov, on his Flip5's pelvic floor page: "the model
// is not functional", then "i dont want any still picture all exercises model should be doing right moves"; the 3D moves audit,
// docs/3d-moves-audit-2026-11-04.md, section 6). This file checks:
// - 1 the pelvic floor trainer: the 3D figure in her level's position, moving (lying with her knees bent, sitting on a chair or
//   standing with her back near a wall, breathing; walking), on the level card, in a set (pausing with it) and without a plan;
//   "reduce motion", fig: false and a clip that can't play; Pause and Stop above the tab bar at 360 px, in English and Hindi;
// - 2 the player: a held pose comes into the pose once, then holds, breathing (tree, child pose); the breathing steps breathe
//   (Anulom vilom's hand, Bhramari, Sit quietly, Shavasana); Steady on your feet's two balance moves at a wall; the sun
//   salutation's first position breathing; the cramps routine's child pose; and no routine step anywhere holds still
//   (test/fig-coverage.mjs);
// - 3 the belly gap check after a birth;
// - 4 Version 39.69.1 (the phone walkthrough, 6 Nov): a move's breathing circle, or its timer, in view above Previous, Pause and
//   Next on the Flip5, in English and Hindi: Anulom vilom's long words make its picture smaller, never smaller than 120 px; a phone
//   too short even for that scrolls, with Pause and Next tappable.
// SHOTS=1 saves screens to test/shots/showmove/. Usage: node test/showmove.mjs [web dir]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const FIGJS = fs.readFileSync(path.join(root, 'fig', 'fig.js'), 'utf8');
const MAN = JSON.parse(FIGJS.slice(FIGJS.indexOf('{', FIGJS.indexOf('SAKHI_FIG')), FIGJS.lastIndexOf('}') + 1));
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.69-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'pain' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* Meena, 46, on My pelvic floor plan since startAgo days ago, her sets o.pf ({ days ago: sets }) */
const PANS = { stage: 'cycle', pft: 'stress', pfway: '2', pfflags: [] };
const pfPlan = (startAgo) => ({ pack: 'pelvic', goalKey: 'pelvic', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', log: {}, weeks: {}, body: [], intake: Object.assign({ goal: 'pelvic' }, PANS) });
const setsAgo = (m) => Object.fromEntries(Object.keys(m || {}).map((k) => [ago(+k), m[k]]));
const days = (from, to) => { const m = {}; for (let k = from; k <= to; k++) m[k] = 1; return m; };
const pel = (startAgo, o) => { o = o || {}; return Object.assign({ dob: '1980-05-01', situation: { midlife: false }, goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'cycle' }, events: regular(10),
  mods: Object.assign({ plan: pfPlan(startAgo) }, o.pf ? { post: { pf: setsAgo(o.pf) } } : {}), reminders: [planRem(startAgo)] }, o.x || {}); };
/* Priya, 28, on the PMOS plan, for the routines; o.midlife: Vera, 52, in midlife (Steady on your feet) */
const mover = (o) => { o = o || {}; return { dob: o.midlife ? '1974-03-01' : '1998-05-01', situation: Object.assign({ pcos: !o.midlife }, o.midlife ? { midlife: true } : {}), goals: [o.midlife ? 'bones' : 'pcos'], intake: { goal: o.midlife ? 'bones' : 'pcos', stage: o.midlife ? 'meno' : 'cycle' },
  mods: { plan: { pack: 'cycle', goalKey: 'pcos', start: ago(20), started: ago(20), go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', region: 'west', focus: 'habits', goal: 'cycles', log: {}, weeks: {}, body: [] } } }; };

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.cfg || {})) + ';');
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  if (o.block) await ctx.route(o.block, (r) => r.fulfill({ status: 404, body: '' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* a figure as it stands: its file, looping or not, the clip after it, playing, its time; or the still */
const figOf = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s); if (!el) return null;
  if (el.tagName === 'IMG') return { img: el.getAttribute('src') };
  return { src: el.getAttribute('src'), loop: el.loop, next: el.getAttribute('data-next'), poster: el.getAttribute('poster'), still: el.getAttribute('data-still'), paused: el.paused, t: el.currentTime, ended: el.ended };
}, sel);
/* the figure really moves (media time runs on the wall clock, not the page's) */
const moving = async (page, sel) => { const a = await figOf(page, sel); await sleep(450); const b = await figOf(page, sel); return !!(a && b && a.src && b.src === a.src && !b.paused && b.t > a.t); };
/* a tap at the middle of an element lands on it, and it ends above the tab bar */
const reach = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s); if (!el) return { ok: false, why: 'none' };
  const r = el.getBoundingClientRect(); const bar = document.querySelector('.tabbar'); const top = bar ? bar.getBoundingClientRect().top : innerHeight;
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { ok: !!hit && (hit === el || el.contains(hit)) && r.bottom <= top + 1 && r.top >= 0, bottom: Math.round(r.bottom), bar: Math.round(top) };
}, sel);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const SHOT = process.env.SHOTS ? path.join(here, 'shots', 'showmove') : null;
if (SHOT) fs.mkdirSync(SHOT, { recursive: true });
const shot = (page, name) => (SHOT ? page.screenshot({ path: path.join(SHOT, name + '.png') }) : null);
/* the player: Next (or Skip rest) until the step's name matches */
const stepTo = async (page, re) => { for (let i = 0; i < 30 && !re.test(await txt(page, '#pl-step h2')); i++) await tap(page, (await has(page, '#pl-skip')) ? '#pl-skip' : '#pl-next'); return re.test(await txt(page, '#pl-step h2')); };
const FIG = 'video#pl-fig3d, img#pl-fig3d';

// ---------- 1 the pelvic floor trainer: her position, moving ----------
{
  check('1.0 web/fig has her positions moving: lying, sitting, standing near a wall (breathing), walking', ['bridgedown', 'chairsit', 'pfstand', 'walk'].every((n) => MAN.loops.includes(n) && fs.existsSync(path.join(root, 'fig', 'v', n + '.webm'))) && MAN.stills.includes('pfstand'), MAN.loops);
  let a = await open({ seed: pel(3, { pf: { 1: 3, 2: 3 } }), hash: '#post-pelvic' });
  let f = await figOf(a.page, '#pst-fig video');
  check('1.1 the level card: the figure lying with her knees bent, breathing, looping (no still)', f && f.src === 'fig/v/bridgedown.webm' && f.loop && f.poster === 'fig/s/bridgedown.webp' && !(await has(a.page, '.pst-lv img')), f);
  check('1.2 ... and it really moves', await moving(a.page, '#pst-fig video'));
  check('1.3 her level\'s words under it', /Level 1 of 8 · lying on your back, knees bent/i.test(await txt(a.page, '.pst-lv')) && await a.page.$eval('.pst-lv', (c) => !!c.firstElementChild && c.firstElementChild.id === 'pst-fig'));
  await shot(a.page, 'pf-level-lie');
  await tap(a.page, '#pst-pstart');
  f = await figOf(a.page, '.pst-trainer video');
  check('1.4 a set: the same figure in the trainer, moving', f && f.src === 'fig/v/bridgedown.webm' && await moving(a.page, '.pst-trainer video'), f);
  await a.page.clock.runFor(3100); await sleep(20);
  await tap(a.page, '#pst-ppause'); await sleep(250);
  const p1 = await figOf(a.page, '.pst-trainer video'); await sleep(300); const p2 = await figOf(a.page, '.pst-trainer video');
  check('1.5 Pause pauses her too', p1 && p2 && p1.paused && p2.paused && p1.t === p2.t, [p1, p2]);
  await tap(a.page, '#pst-ppause');
  check('1.6 ... and she moves again with her set', await moving(a.page, '.pst-trainer video'));
  for (const sel of ['#pst-ppause', '#pst-pstop']) check('1.7 in a set at 360 × 800, ' + sel + ' sits above the tab bar, tappable', (await reach(a.page, sel)).ok, await reach(a.page, sel));
  await shot(a.page, 'pf-set-lie');
  await done(a);
  for (const [days0, pos, name] of [[10, 'sitting on a chair', 'chairsit'], [20, 'standing, your back near a wall', 'pfstand'], [50, 'standing, or walking slowly', 'walk']]) {
    a = await open({ seed: pel(days0, { pf: days(1, days0) }), hash: '#post-pelvic' });
    f = await figOf(a.page, '#pst-fig video');
    check('1.8 ' + pos + ': her figure ' + name + ', moving', f && f.src === 'fig/v/' + name + '.webm' && (await txt(a.page, '.pst-lv')).toLowerCase().indexOf(pos) >= 0 && await moving(a.page, '#pst-fig video'), [f, await txt(a.page, '.pst-lv')]);
    if (name === 'pfstand') await shot(a.page, 'pf-level-stand');
    await tap(a.page, '#pst-pstart');
    check('1.9 ' + name + ' in her set too', ((await figOf(a.page, '.pst-trainer video')) || {}).src === 'fig/v/' + name + '.webm');
    await done(a);
  }
  a = await open({ seed: pel(3, { pf: { 1: 3 } }), hash: '#post-pelvic', reduce: true });
  check('1.10 "reduce motion": her position\'s still', ((await figOf(a.page, '#pst-fig img')) || {}).img === 'fig/s/bridgedown.webp' && !(await has(a.page, '#pst-fig video')));
  await done(a);
  a = await open({ seed: pel(3, { pf: { 1: 3 } }), hash: '#post-pelvic', cfg: { fig: false } });
  check('1.11 fig: false: no figure, as before', !(await has(a.page, '#pst-fig')));
  await done(a);
  a = await open({ seed: pel(3, { pf: { 1: 3 } }), hash: '#post-pelvic', block: /fig\/v\/bridgedown\.webm$/ });
  await sleep(300); await settle(a.page, 200);
  check('1.12 a clip that can\'t play gives way to her position\'s still', ((await figOf(a.page, '#pst-fig img')) || {}).img === 'fig/s/bridgedown.webp');
  await done(a);
  a = await open({ seed: seedOf({ situation: { deliveredOn: ago(100) }, events: [], goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, dob: '1995-01-01' }), hash: '#post-pelvic' });
  f = await figOf(a.page, '.pst-free video');
  check('1.13 the trainer without a plan: her figure lying, moving, above her hold time', f && f.src === 'fig/v/bridgedown.webm' && await moving(a.page, '.pst-free video'), f);
  await done(a);
  for (const [lang, w, h] of [['hi', 360, 800], ['en', 360, 640]]) {
    a = await open({ seed: Object.assign(pel(3, { pf: { 1: 3 } }), { lang }), hash: '#post-pelvic', w, h });
    const ok0 = await noScroll(a.page);
    await tap(a.page, '#pst-pstart'); await a.page.clock.runFor(3100); await sleep(30);
    const r3 = await reach(a.page, '#pst-ppause'), r4 = await reach(a.page, '#pst-pstop');
    check('1.14 ' + lang + ' at ' + w + ' × ' + h + ': nothing runs off the screen, and Pause and Stop sit above the tab bar in a set', ok0 && r3.ok && r4.ok && await noScroll(a.page), [ok0, r3, r4]);
    await shot(a.page, 'pf-set-' + lang + '-' + h);
    await done(a);
  }
}

// ---------- 2 the player: no step holds still ----------
{
  let cov = '';
  try { cov = execFileSync(process.execPath, [path.join(here, 'fig-coverage.mjs')], { encoding: 'utf8' }); } catch (e) { cov = String(e.stdout || e.message); }
  check('2.0 every routine step moves: a loop for each, the held poses coming in first (fig-coverage.mjs)', / 0 holding still/.test(cov) && / 0 with no 3D picture/.test(cov), cov.split('\n').filter((l) => /still only|✗/.test(l)).slice(0, 8));
  let a = await open({ seed: mover(), hash: '#plan-r-gentle' });
  await tap(a.page, '#pl-pstart');
  check('2.1 Vrikshasana: found in Gentle start', await stepTo(a.page, /Vrikshasana/));
  let f = await figOf(a.page, FIG);
  check('2.2 tree: she comes into the pose first (tree-in, once), the hold next', f && f.src === 'fig/v/tree-in.webm' && !f.loop && f.next === 'fig/v/tree.webm' && f.still === 'fig/s/tree.webp' && await moving(a.page, FIG), f);
  await sleep(4200); f = await figOf(a.page, FIG);
  check('2.3 ... then holds it, breathing, on a loop', f && f.src === 'fig/v/tree.webm' && f.loop && !f.next && await moving(a.page, FIG), f);
  await shot(a.page, 'player-tree');
  check('2.4 Shavasana breathes', await stepTo(a.page, /Shavasana/) && ((await figOf(a.page, FIG)) || {}).src === 'fig/v/rest.webm' && ((await figOf(a.page, FIG)) || {}).loop && await moving(a.page, FIG), await figOf(a.page, FIG));
  await done(a);
  a = await open({ seed: mover(), hash: '#plan-r-cycle' });
  await tap(a.page, '#pl-pstart');
  check('2.5 child pose: kneeling, sitting back and folding forward first, then the hold', await stepTo(a.page, /Shashankasana/) && ((await figOf(a.page, FIG)) || {}).src === 'fig/v/child-in.webm' && ((await figOf(a.page, FIG)) || {}).next === 'fig/v/child.webm', await figOf(a.page, FIG));
  await done(a);
  a = await open({ seed: mover(), hash: '#plan-r-calm' });
  await tap(a.page, '#pl-pstart');
  f = await figOf(a.page, FIG);
  check('2.6 Anulom vilom: her hand at her nose, close up, changing sides as she breathes (a loop)', /Anulom vilom/.test(await txt(a.page, '#pl-step h2')) && f && f.src === 'fig/v/nostril.webm' && f.loop && await moving(a.page, FIG), f);
  await shot(a.page, 'player-nostril');
  check('2.7 Bhramari breathes', await stepTo(a.page, /Bhramari/) && ((await figOf(a.page, FIG)) || {}).src === 'fig/v/sit.webm' && await moving(a.page, FIG));
  check('2.8 Sit quietly breathes', await stepTo(a.page, /Sit quietly/) && ((await figOf(a.page, FIG)) || {}).src === 'fig/v/sit.webm');
  await done(a);
  a = await open({ seed: mover(), hash: '#plan-r-sun' });
  await tap(a.page, '#pl-pstart'); await stepTo(a.page, /Pranamasana/);
  f = await figOf(a.page, FIG);
  check('2.9 the sun salutation\'s first position: palms together, breathing (sun-00, a loop)', MAN.sun0 === 1 && f && f.src === 'fig/v/sun-00.webm' && f.loop && await moving(a.page, FIG), f);
  await done(a);
  a = await open({ seed: mover({ midlife: true }), hash: '#plan-r-steady' });
  check('2.10 Steady on your feet\'s list: the one-leg stand at the wall, and heel to toe, as themselves', await a.page.$$eval('.pl-pitem img.pl-3d', (xs) => xs.map((x) => x.getAttribute('src'))).then((xs) => xs.includes('fig/s/legwall.webp') && xs.includes('fig/s/tandem.webp')).catch(() => false));
  await tap(a.page, '#pl-pstart');
  f = await figOf(a.page, FIG);
  check('2.11 One leg at the wall: her hand on the wall, she lifts a foot (legwall-in), then holds, breathing', /One leg at the wall/.test(await txt(a.page, '#pl-step h2')) && f && f.src === 'fig/v/legwall-in.webm' && f.next === 'fig/v/legwall.webm', f);
  await shot(a.page, 'player-legwall');
  check('2.12 Heel to toe at the wall: one foot right in front of the other, her hand on the wall (a loop)', await stepTo(a.page, /Heel to toe/) && ((await figOf(a.page, FIG)) || {}).src === 'fig/v/tandem.webm' && await moving(a.page, FIG), await figOf(a.page, FIG));
  await shot(a.page, 'player-tandem');
  await done(a);
  a = await open({ seed: mover(), hash: '#plan-r-gentle', reduce: true });
  await tap(a.page, '#pl-pstart'); await stepTo(a.page, /Vrikshasana/);
  check('2.13 "reduce motion": the pose\'s still', ((await figOf(a.page, FIG)) || {}).img === 'fig/s/tree.webp');
  await done(a);
  a = await open({ seed: mover(), hash: '#plan-r-gentle', block: /fig\/v\/tree-in\.webm$/ });
  await tap(a.page, '#pl-pstart'); await stepTo(a.page, /Vrikshasana/); await sleep(300); await settle(a.page, 200);
  check('2.14 a clip that can\'t play gives way to the pose\'s still', ((await figOf(a.page, FIG)) || {}).img === 'fig/s/tree.webp', await figOf(a.page, FIG));
  await done(a);
  a = await open({ seed: mover(), hash: '#relief-cramps' });
  await tap(a.page, '#rl-start');
  for (let i = 0; i < 3 && !/Child/i.test(await txt(a.page, '#rl-step')); i++) await tap(a.page, '#rl-next');
  f = await figOf(a.page, '#rl-fig3d');
  check('2.15 the cramps routine\'s child pose comes in first too, then holds', /Child/i.test(await txt(a.page, '#rl-step')) && f && f.src === 'fig/v/child-in.webm' && f.next === 'fig/v/child.webm', f);
  await done(a);
}

// ---------- 3 the belly gap check after a birth ----------
{
  const a = await open({ seed: seedOf({ situation: { deliveredOn: ago(20) }, events: [], goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, dob: '1995-01-01' }), hash: '#post-pelvic' });
  const f = await figOf(a.page, '.pst-gapfig video');
  check('3.1 the gap check: on her back, her head and shoulders lifting, her fingertips at her belly button (a loop)', f && f.src === 'fig/v/gapcheck.webm' && f.loop && f.poster === 'fig/s/gapup.webp', f);
  await done(a);
}

// ---------- 4 Version 39.69.1: the breathing circle (or the timer) in view above Previous, Pause and Next ----------
{
  /* with the page at its top: the circle's bottom against the top of the controls as they stick above the tab bar */
  const fitOf = (page) => page.evaluate(() => {
    const ring = document.querySelector('.pl-breath-wrap, .pl-timer'), ctl = document.querySelector('.pl-ctl'), box = document.querySelector('#pl-step .pl-figbox'), tab = document.querySelector('.tabbar');
    if (!ring || !ctl || !box) return null;
    const limit = (tab ? tab.getBoundingClientRect().top : innerHeight) - ctl.offsetHeight;
    return { ring: Math.round(ring.getBoundingClientRect().bottom + scrollY), limit: Math.round(limit), fig: Math.round(box.getBoundingClientRect().width), breath: ring.classList.contains('pl-breath-wrap') };
  });
  for (const [lang, w, h] of [['en', 360, 800], ['hi', 360, 800], ['en', 360, 640]]) {
    const a = await open({ seed: Object.assign(mover(), { lang }), hash: '#plan-r-calm', w, h });
    await tap(a.page, '#pl-pstart'); await sleep(200);
    const out = [];
    for (let i = 0; i < 3; i++) { out.push(Object.assign({ step: await txt(a.page, '#pl-step h2') }, await fitOf(a.page))); if (i < 2) await tap(a.page, '#pl-next'); }
    const nose = out[0];
    if (h >= 800) {
      check('4.1 ' + lang + ' at ' + w + ' × ' + h + ': each Calm breath step\'s breathing circle (Sit quietly\'s timer) sits above Previous, Pause and Next', out[0].breath && out[1].breath && !out[2].breath && out.every((x) => x.ring <= x.limit), out);
      check('4.2 ' + lang + ' at ' + w + ' × ' + h + ': Anulom vilom\'s picture gives way for its long words, never below 120 px', nose.fig >= 120 && nose.fig <= 260, nose);
    } else check('4.5 at ' + w + ' × ' + h + ' (too short for the words): the picture goes down to 120 px, the rest scrolls, and Pause and Next stay tappable', nose.fig === 120 && (await reach(a.page, '#pl-next')).ok, [nose, await reach(a.page, '#pl-next')]);
    if (lang === 'en' && h === 800) check('4.3 Bhramari\'s shorter words keep a bigger picture than Anulom vilom\'s', out[1].fig > nose.fig, out);
    await done(a);
  }
  const g = await open({ seed: mover(), hash: '#plan-r-gentle', w: 360, h: 800 });
  await tap(g.page, '#pl-pstart'); await stepTo(g.page, /Vrikshasana/);
  const tr = await fitOf(g.page);
  check('4.4 a move with a timer: the timer above the controls too, the picture at its full size when it fits', tr && !tr.breath && tr.ring <= tr.limit && tr.fig === 260, tr);
  await done(g);
}

await browser.close();
const errs = errsAll.filter((e) => !/ResizeObserver/.test(e));
check('page errors', !errs.length, errs);
const fails = results.filter((r) => !r.pass);
console.log(fails.length ? fails.length + ' of ' + results.length + ' checks failed' : results.length + ' / ' + results.length + ' checks passed');
process.exit(fails.length ? 1 : 0);
