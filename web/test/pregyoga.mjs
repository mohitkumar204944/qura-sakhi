// Version 39.52: pregnancy yoga by trimester (Mohit, 1 Nov: "build the pregnancy yoga by trimester", after the walk through a
// prenatal yoga app; the programme design, docs/plans-design-and-build-2026-10-24-programmes.md, section 6; MODULE_API section
// 95). This file checks:
//   1 three routines by her week (first three months to 13 weeks, middle to 27, last from 28), on the 3D figure (Version 39.54:
//     her usual figure, then her with a middle and a full bump; every step's still, and a loop where its drawing moves);
//     nothing on the back after 13 weeks, nothing on the tummy, no twist, no rising on the toes, no step-ups, no breath held;
//     10 minutes at most; balance at a wall;
//   2 Today on My pregnancy: on days 2 and 5 of her plan week, her three months' yoga in the walk's place (Start), on the green
//     tier only; amber keeps the easy walk, red has no move, a sign that doesn't wait has none; 3 steps or fewer on day 1, 4 at
//     most; the routine changes at 14 and 28 weeks; My plan names it on her walk days too; "Before you start" names it;
//   3 the player: the stop card above Start (the moves' stop signs, Help's "Call 112 now" line, Call 112), her 3D body for these
//     three months (the drawings, with her bump, without web/fig or its pregnancy sets), "Feeling unwell?" on every move (Call 112, 108, 102; "I feel fine now" goes back, paused;
//     "Stop for today" holds her walk and yoga until she checks her answers again, and "A quick check" leads the next day);
//     10-second rests, none between sides or before resting on her side;
//   4 Moves and calm in a pregnancy: only her three months' yoga (and Calm breath in Wind down); the other routines' pages
//     refuse; why it isn't open (no plan yet, her doctor first, a sign that doesn't wait); never the pregnancy yoga outside one;
//   5 a shared phone: "Yoga", never "Pregnancy yoga"; 6 Hindi at 360 px; 7 no page errors.
// Usage: node test/pregyoga.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'pregyoga'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-01';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.52-pilot', platform: 'android' };
/* pregnant `w` weeks today, with her doctor */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(20), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 20, pnow: null }, o || {});
/* My pregnancy (version 2) started `startAgo` days ago: 0 is her day 1 (a walk day); 2 and 5 are her plan week's yoga days */
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (w, startAgo, o, seed) => Object.assign({ situation: sit(w) }, seed || {}, { mods: Object.assign({ plan: preg(startAgo, Object.assign({ intake: IK({ psafeW: w }) }, o || {})) }, (seed || {}).mods || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.cfg || {})) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  if (o.pre) { await page.evaluate(o.pre); await page.evaluate(() => window.Saathi.render()); await settle(page, 300); }
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, r: x.r || null, title: x.title, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const mv = async (a) => (await acts(a)).find((x) => x.id === 'move') || null;
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());
const SRC = fs.readFileSync(path.join(root, 'mods', 'plan.js'), 'utf8');
const STOP = 'Dizziness, a headache, breathlessness before you start, or a calf that hurts or swells. Stop, rest, and tell your doctor today.';
const NOW = 'Chest pain, fainting, or regular painful tightenings in your tummy.';   /* never "today": these go with Help's "Call 112 now" line */

try {
  /* ---------- 1. the three routines ---------- */
  const a1 = await open({ seed: withPlan(20, 2) });
  const R = await a1.page.evaluate(() => { const P = window.Saathi.plan; return ['preg1', 'preg2', 'preg3'].map((id) => ({ id, meta: P.routine(id), steps: P.stepsOf(id).map((s) => ({ pose: s.pose, s: s.s, side: !!s.side, sideK: s.sideK || null, breath: s.breath || null, n: s.n, p: s.p, fig: s.fig || null, fb: s.fb, bump: s.bump })), mins: P.routineMins(id) })); });
  const poses = await a1.page.evaluate(() => ({ p: window.Saathi.plan.poses(), a: window.Saathi.plan.anims() }));
  const byId = Object.fromEntries(R.map((x) => [x.id, x]));
  const posesOf = (id) => byId[id].steps.map((s) => s.pose);
  const SUPINE = ['rest', 'bridge', 'bridgedown', 'knees', 'knees2'];
  const NEVER = ['prone', 'cobra', 'locust', 'twist', 'sitlong', 'calf', 'calfdown', 'step', 'stepfloor', 'downdog', 'plank', 'ashtanga', 'camel', 'lunge', 'lunge2', 'fwdbend', 'triangle', 'wide', 'reach'];
  check('1 three routines on her 3D body for each three months (her usual figure, then a middle and a full bump), the drawings\' bump behind them', R.every((x) => x.meta && x.steps.length && x.steps.every((s) => s.fb === x.meta.fb)) && byId.preg1.meta.fb === '' && byId.preg2.meta.fb === 'b2-' && byId.preg3.meta.fb === 'b3-' && byId.preg1.meta.bump === 0 && byId.preg2.meta.bump > 0 && byId.preg3.meta.bump > byId.preg2.meta.bump, R.map((x) => x.meta));
  const FIGS = await a1.page.evaluate(() => window.SAKHI_FIG || null); const miss = [];
  R.forEach((x) => x.steps.forEach((s) => { const n = x.meta.fb + (s.fig || s.pose); if (!FIGS || FIGS.stills.indexOf(n) < 0) miss.push('still ' + n); if (poses.a.indexOf(s.pose) >= 0 && (!FIGS || FIGS.loops.indexOf(n) < 0)) miss.push('loop ' + n); }));
  check('1 every step has her body\'s 3D still, and a loop where its drawing moves (web/fig, render-preg.sh)', !miss.length, miss);
  check('1 nothing on the tummy, no twist, no rising on the toes, no step-ups, no deep bends, in any of them', R.every((x) => posesOf(x.id).every((p) => NEVER.indexOf(p) < 0)), R.map((x) => posesOf(x.id)));
  check('1 nothing on the back after 13 weeks', ['preg2', 'preg3'].every((id) => posesOf(id).every((p) => SUPINE.indexOf(p) < 0)), [posesOf('preg2'), posesOf('preg3')]);
  check('1 no breath held, ever', R.every((x) => x.steps.every((s) => !s.breath || (s.breath[1] === 0 && s.breath[3] === 0))));
  check('1 10 minutes at most', R.every((x) => x.mins <= 10), R.map((x) => x.mins));
  check('1 each ends at rest (on her side after 13 weeks)', byId.preg1.steps.slice(-1)[0].pose === 'rest' && byId.preg2.steps.slice(-1)[0].pose === 'sidelie' && byId.preg3.steps.slice(-1)[0].pose === 'sidelie');
  check('1 balance at a wall, and her knees wide in child pose', byId.preg1.steps.concat(byId.preg2.steps).filter((s) => s.pose === 'tree').every((s) => /wall/.test(s.p.en)) && byId.preg1.steps.filter((s) => s.pose === 'child').every((s) => /knees wide apart/i.test(s.p.en)));
  check('1 every position is drawn (and the loops exist)', R.every((x) => x.steps.every((s) => poses.p.indexOf(s.pose) >= 0)) && ['seatmarch', 'allfours', 'cat', 'sideleg', 'leanfwd'].every((k) => poses.a.indexOf(k) >= 0) && ['seat', 'seatmarch2', 'rockback', 'cow', 'sidelie', 'sidedown', 'leanfwd2'].every((k) => poses.p.indexOf(k) >= 0));
  check('1 the reused moves keep their reviewed words (wall push-ups, Bhramari, Loosen up)', byId.preg2.steps.some((s) => s.n.en === 'Wall push-ups' && /^Hands on a wall at shoulder height\./.test(s.p.en)) && byId.preg2.steps.some((s) => /^Bhramari/.test(s.n.en)) && byId.preg1.steps[0].n.en === 'Loosen up');
  check('1 her three months by her week: 13 first, 14 middle, 27 middle, 28 last', await a1.page.evaluate(() => { const P = window.Saathi.plan; const d0 = new Date(); const w0 = P.gwAt(); const at = (w) => { const dt = new Date(d0.getTime() + (w - w0) * 7 * 864e5); return P.pyId(dt.toISOString().slice(0, 10)); }; return [at(13), at(14), at(27), at(28), at(39)].join(); }) === 'preg1,preg2,preg2,preg3,preg3');

  /* ---------- 2. Today ---------- */
  const y2 = await mv(a1);
  check('2 green, 20 weeks, her plan week\'s day 2: the middle three months\' yoga in the walk\'s place', y2 && y2.kind === 'routine' && y2.r === 'preg2' && y2.go === 'plan-r-preg2' && y2.priv, await acts(a1));
  await go(a1, 'home');
  const row = await a1.page.evaluate(() => { const r = [...document.querySelectorAll('#view .today-plan-move')][0]; return r ? { name: (r.querySelector('.body strong') || {}).textContent, start: ((r.querySelector('.today-start') || {}).textContent || '').trim() } : null; });
  check('2 Today: "Pregnancy yoga", Start with its minutes', row && row.name === 'Pregnancy yoga' && row.start === '10 min', row);
  await a1.page.$eval('#view .today-plan-move [data-today-why]', (e) => e.click()); await settle(a1.page, 400);
  const wh = await a1.page.evaluate(() => { const s = document.querySelector('.pl-why-sh'); return s ? { t: s.innerText.replace(/\s+/g, ' '), art: (s.parentElement || s).innerHTML.indexOf('pregnancy.dos-and-donts') >= 0 } : null; });
  check('2 its Why?: the reason, its moves, and the reviewed pregnancy dos and don\'ts', wh && /Gentle yoga in pregnancy can ease aches and help you sleep and feel calmer\./.test(wh.t) && /Marjariasana/.test(wh.t) && wh.art, wh);
  await a1.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(a1.page, 300);
  check('2 4 steps at most on a yoga day', (await acts(a1)).length <= 4, (await acts(a1)).map((x) => x.id));
  await go(a1, 'plan');
  const pv = await view(a1);
  check('2 My plan: Pregnancy yoga, its reason always shown', /Pregnancy yoga Gentle yoga in pregnancy can ease aches/.test(pv), pv.slice(0, 900));
  await shot(a1, '2-myplan-yoga-day');
  await done(a1);
  const d1 = await open({ seed: withPlan(20, 0) });
  const w1 = await mv(d1);
  check('2 day 1 is a walk day, 3 steps or fewer', w1 && w1.kind === 'minutes' && (await acts(d1)).length <= 3, await acts(d1));
  await done(d1);
  /* her plan's steps before she starts: "2 days a week: Pregnancy yoga" on the green tier (not amber) */
  for (const [tick, want] of [[null, true], ['unsure', false]]) {
    const r0 = await open({ seed: { situation: sit(20) } });
    await r0.page.evaluate(() => window.Saathi.plan.offer('food')); await settle(r0.page, 600);
    await tap(r0, '[data-pl-pnow="n"]');
    if (tick) { await r0.page.$eval('[data-pl-ps="' + tick + '"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(r0.page, 200); }
    for (let i = 0; i < 4 && !(await has(r0, '#pl-in-make')) && (await has(r0, '#pl-in-next')); i++) await tap(r0, '#pl-in-next');   /* Version 39.68: no answers summary, so her plan comes next */
    if (await has(r0, '#pl-in-make')) await tap(r0, '#pl-in-make'); await settle(r0.page, 600);
    if (!/plan-reveal/.test(await r0.page.evaluate(() => location.hash))) await go(r0, 'plan-reveal');
    for (let i = 0; i < 8 && !(await has(r0, '.pl-rv-steps')); i++) await tap(r0, '#pl-rv-next');
    const rv = await txt(r0, '.pl-rv-steps');
    check('2 her steps before she starts, ' + (tick ? 'amber: the easy walk, no yoga' : 'green: the walk\'s line names the yoga, and the count stays'), (want ? /Walk or move 10 minutes, or pregnancy yoga on 2 days a week/.test(rv) : /Every day: Walk or move 10 minutes/.test(rv) && !/yoga/i.test(rv)) && (await r0.page.$$eval('.pl-rv-steps .item', (xs) => xs.length)) <= 4, rv);
    if (!tick) await shot(r0, '2-reveal-steps');
    await done(r0);
  }
  for (const [w, id] of [[10, 'preg1'], [13, 'preg1'], [14, 'preg2'], [27, 'preg2'], [28, 'preg3'], [36, 'preg3']]) {
    const x = await open({ seed: withPlan(w, 5, { intake: IK({ psafeW: w }) }) });
    const m = await mv(x);
    check('2 at ' + w + ' weeks: ' + id, m && m.r === id, m);
    await done(x);
  }
  const am = await open({ seed: withPlan(20, 2, { intake: IK({ pflags: ['r_gdm'] }) }) });
  const ma = await mv(am);
  check('2 amber: the easy walk, never yoga', ma && ma.kind === 'minutes' && ma.mins === 10, ma);
  await go(am, 'plan');
  check('2 amber: My plan doesn\'t name the yoga', !/Pregnancy yoga/.test(await view(am)));
  await done(am);
  const rd = await open({ seed: withPlan(20, 2, { intake: IK({ pflags: ['r_bp'] }) }) });
  check('2 red: no move at all', !(await mv(rd)), await acts(rd));
  await done(rd);
  const pn = await open({ seed: withPlan(20, 2, { intake: IK({ pnow: TODAY }) }) });
  check('2 a sign that doesn\'t wait: no yoga', !(await mv(pn)), await acts(pn));
  await done(pn);
  const ps = await open({ seed: withPlan(20, 2), hash: 'plan-psafe' });
  check('2 "Before you start" names the yoga on the green tier', /with yoga for your stage of pregnancy on 2 days/.test(await txt(ps, '.pl-ps-tier')), await txt(ps, '.pl-ps-tier'));
  await done(ps);

  /* ---------- 3. the player ---------- */
  const p3 = await open({ seed: withPlan(20, 2), hash: 'plan-r-preg2', w: 360, h: 800 });
  const iv = await view(p3);
  check('3 the intro: the stop card above Start', await p3.page.evaluate(() => { const c = document.querySelector('.pl-pystop'), b = document.getElementById('pl-pstart'); return !!(c && b && (c.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
  const sc = await txt(p3, '.pl-pystop');
  check('3 its words: the signs for today, the signs for now with Help\'s "Go to the nearest hospital now" line, and Call 102 (Version 39.70)', sc.indexOf(STOP) >= 0 && sc.indexOf('Go to the nearest hospital now ' + NOW + ' In pregnancy:') >= 0 && (await tels(p3, '.pl-pystop')) === '102', sc);
  check('3 "Go gently in a cool room, with water nearby" first, and about 10 minutes on Start', /^Pregnancy yoga Go gently in a cool room, with water nearby, and skip any move that doesn’t feel right\./.test(iv) && /Start · About 10 min/.test(iv), iv.slice(0, 300));
  const srcs = (a, sel) => a.page.$$eval(sel, (xs) => xs.map((x) => x.getAttribute('src') || x.getAttribute('poster') || ''));
  const pics = await srcs(p3, '#view .pl-pitem img.pl-3d');
  check('3 the moves in 3D, on her with the middle three months\' bump (b2-), no drawings', pics.length > 5 && pics.every((x) => /^fig\/t\/b2-/.test(x)) && !(await has(p3, '#view .pl-pitem svg.pl-fig')), pics);
  await shot(p3, '3-intro');
  await tap(p3, '#pl-pstart');
  check('3 the first move: her 3D figure with the bump (Loosen up\'s b2- loop), and "Feeling unwell?" on its picture', await has(p3, '.pl-figbox.pl-fb3d #pl-fig3d') && /^fig\/v\/b2-warmup\.webm$/.test(await p3.page.$eval('#pl-fig3d', (e) => e.getAttribute('src') || '')) && await has(p3, '.pl-figbox #pl-unwell') && !(await has(p3, '#pl-fig')));
  /* every move of every routine, in both languages, at 360 x 800: the timer (or the breath circle) above the buttons */
  const lay = [];
  for (const [rid, w] of [['preg1', 10], ['preg2', 20], ['preg3', 32]]) for (const lang of ['en', 'hi']) {
    const x = await open({ seed: withPlan(w, 2, {}, { lang }), hash: 'plan-r-' + rid, w: 360, h: 800 });
    await tap(x, '#pl-pstart'); const n = await x.page.evaluate((r) => window.Saathi.plan.stepsOf(r).length, rid);
    for (let i = 0; i < n; i++) {
      const m = await x.page.evaluate(() => { const g = document.querySelector('#pl-step ~ .pl-timer, #pl-step ~ .pl-breath-wrap'), c = document.querySelector('.pl-ctl'), u = document.getElementById('pl-unwell'); if (!g || !c || !u) return null; const a = g.getBoundingClientRect(), z = c.getBoundingClientRect(), b = u.getBoundingClientRect(); return { h2: document.querySelector('#pl-step h2').textContent, bottom: Math.round(a.bottom), ctl: Math.round(z.top), chip: Math.round(b.top) }; });
      if (!m || m.bottom > m.ctl || m.chip < 0) lay.push([rid, lang, i, m]);
      if (i < n - 1) { await x.page.$eval('#pl-next', (e) => e.click()); await settle(x.page, 150); }
    }
    await done(x);
  }
  check('3 at 360 × 800, every move of all three, English and Hindi: the timer in view above the buttons, "Feeling unwell?" on screen', lay.length === 0, lay.slice(0, 6));
  check('3 "Feeling unwell?" in view, clear of the buttons, at 360 × 800', await p3.page.evaluate(() => { const b = document.getElementById('pl-unwell').getBoundingClientRect(); const c = document.querySelector('.pl-ctl').getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const hit = document.elementFromPoint(x, y); return b.top >= 0 && b.bottom <= c.top && !!hit && hit.closest('#pl-unwell') !== null; }));
  check('3 the voice reads the move, not "Feeling unwell?" (it skips [data-noread])', await p3.page.evaluate(() => document.getElementById('pl-unwell').matches('[data-noread]')) && /\[data-noread\]/.test(fs.readFileSync(path.join(root, 'mods', 'lang.js'), 'utf8')));
  await shot(p3, '3-step');
  /* "Feeling unwell?" reads clearly in light and dark (4.5 to 1 at least) */
  const ratio = (fg, bg) => { const L = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }; const a = L(fg), b = L(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
  const cs = [];
  for (const theme of ['light', 'dark']) {
    const x = await open({ seed: withPlan(20, 2, {}, { settings: { theme, toursAuto: false } }), hash: 'plan-r-preg2', w: 360, h: 800 });
    await tap(x, '#pl-pstart'); const c = await x.page.evaluate(() => { const s = getComputedStyle(document.getElementById('pl-unwell')); return [s.color, s.backgroundColor]; }); cs.push([theme, ratio(c[0], c[1]).toFixed(2)]);
    await done(x);
  }
  check('3 "Feeling unwell?" reads clearly in light and dark', cs.every((x) => +x[1] >= 4.5), cs);
  /* every move has it, and the rests: 10 seconds, none between sides or before resting on her side */
  const rests = await p3.page.evaluate(() => { const st = window.Saathi.plan.stepsOf('preg2'); return st.map((s, i) => [s.pose, s.sideK || '', (st[i + 1] || {}).pose || '']); });
  const secs = await p3.page.evaluate(() => window.Saathi.plan.stepsOf('preg2').map((s) => s.s));
  let unwellAll = true, restOk = true; const restSeen = [];
  for (let i = 0; i < rests.length - 1; i++) {
    if (!(await has(p3, '#pl-unwell'))) unwellAll = false;
    await p3.page.clock.runFor((secs[i] + 0.6) * 1000); await sleep(20);   /* the move's timer runs out */
    const r = await has(p3, '#pl-rest'); restSeen.push(r ? await txt(p3, '#pl-rtime') : '');
    const next = rests[i + 1][0]; const sameSide = rests[i][1] === 'r' && rests[i + 1][1] === 'l';
    if (r === (next === 'sidelie' || sameSide) || (r && !/^0:(0[1-9]|10)$/.test(restSeen[restSeen.length - 1]))) restOk = false;   /* a 10-second rest, part gone by the time we look */
    if (r) { await p3.page.$eval('#pl-skip', (e) => e.click()); await settle(p3.page, 200); }
  }
  if (!(await has(p3, '#pl-unwell'))) unwellAll = false;
  check('3 "Feeling unwell?" on every move', unwellAll);
  check('3 rests between moves, none between sides or before resting on her side', restOk, restSeen);
  await done(p3);
  const u3 = await open({ seed: withPlan(20, 2), hash: 'plan-r-preg2' });
  await tap(u3, '#pl-pstart'); await settle(u3.page, 3000);
  await tap(u3, '#pl-unwell');
  const uv = await view(u3);
  check('3 Feeling unwell: stop now and rest, the signs for today, the signs for now, Call 102 and 108 (Version 39.70)', /Stop now and rest/.test(uv) && uv.indexOf(STOP) >= 0 && (await txt(u3, '.pl-pynow')).indexOf(NOW) >= 0 && (await tels(u3, '.pl-pynow')) === '102,108' && await has(u3, '#pl-uw-ok') && await has(u3, '#pl-uw-stop'), uv.slice(0, 500));
  await shot(u3, '3-unwell');
  await tap(u3, '#pl-uw-ok');
  check('3 "I feel fine now": back to the move, paused', await has(u3, '#pl-step') && (await txt(u3, '#pl-pause')) === 'Go on');
  await tap(u3, '#pl-unwell'); await tap(u3, '#pl-uw-stop');
  const s3 = await st(u3);
  check('3 "Stop for today": her walk and yoga wait until she checks her answers again', s3.mods.plan.intake.pnow === TODAY && /Rest now/.test(await view(u3)) && (await tels(u3, '.pl-pynow')) === '102,108', s3.mods.plan.intake);
  check('3 ... and no move on Today', !(await mv(u3)));
  await go(u3, 'plan-r-preg2');
  check('3 ... and the routine waits (Moves and calm instead)', !(await has(u3, '#pl-pstart')) && /No yoga until you check your answers again\./.test(await txt(u3, '.pl-pylock')) && await has(u3, '.pl-pylock [data-go="plan-psafe"]'));
  await done(u3);
  const n3 = await open({ seed: withPlan(20, 3, { intake: IK({ pnow: ago(1) }) }) });
  check('3 the next day "A quick check" leads', await has(n3, '.pl-sl-psafe'));
  await done(n3);
  const t1 = await open({ seed: withPlan(10, 2), hash: 'plan-r-preg1' });
  const t1p = await srcs(t1, '#view .pl-pitem img.pl-3d');
  check('3 the first three months: her usual 3D figure (no bump yet), ends lying on her back (fine to 13 weeks)', t1p.length > 5 && t1p.every((x) => /^fig\/t\/[a-z]/.test(x) && !/^fig\/t\/b[23]-/.test(x)) && !(await has(t1, '#view ellipse.pl-bump')) && /Shavasana/.test(await view(t1)), t1p);
  await done(t1);
  const h3 = await open({ seed: withPlan(32, 2), hash: 'plan-r-preg3' });
  const hv = await view(h3);
  check('3 the last three months: sitting first, long breaths out, rest on her side', /Loosen up, sitting/.test(hv) && /Long breaths out/.test(hv) && /Rest on your side/.test(hv) && !/Shavasana/.test(hv));
  const h3p = await srcs(h3, '#view .pl-pitem img.pl-3d');
  check('3 ... on her with the full bump (b3-)', h3p.length > 5 && h3p.every((x) => /^fig\/t\/b3-/.test(x)), h3p);
  await done(h3);
  /* without the 3D figure, or a web/fig from before the pregnancy sets: the drawings, with her bump */
  for (const [tag, o] of [['SAKHI_CONFIG.fig false', { cfg: { fig: false } }], ['a web/fig without the pregnancy sets', { pre: () => { const F = window.SAKHI_FIG; ['loops', 'stills'].forEach((k) => { F[k] = F[k].filter((n) => !/^b[23]-/.test(n)); }); } }]]) {
    const x = await open(Object.assign({ seed: withPlan(20, 2), hash: 'plan-r-preg2' }, o));
    check('3 ' + tag + ': the drawings, with her bump', (await x.page.$$eval('#view .pl-pitem svg ellipse.pl-bump', (xs) => xs.length)) > 5 && !(await has(x, '#view .pl-pitem .pl-3d')));
    await tap(x, '#pl-pstart');
    check('3 ' + tag + ': the first move drawn with her bump', await has(x, '.pl-figbox svg#pl-fig ellipse.pl-bump') && !(await has(x, '#pl-fig3d')) && await has(x, '.pl-figbox #pl-unwell'));
    await done(x);
  }

  /* ---------- 4. Moves and calm ---------- */
  const m4 = await open({ seed: withPlan(20, 2), hash: 'plan-moves' });
  const items = await m4.page.$$eval('#view .pl-ritem', (xs) => xs.map((x) => x.dataset.go));
  check('4 in a pregnancy: only her three months\' yoga', items.join() === 'plan-r-preg2', items);
  check('4 its picture: her 3D figure with the middle three months\' bump, moving (Version 39.69.2)', await has(m4, '.pl-ritem .pl-rfig.pl-rf3d img[src="fig/t/b2-cat.webp"]'));
  check('4 the pregnancy stop card, not the cycle one', await has(m4, '.pl-pystop') && !/During your period/.test(await view(m4)));
  for (const r of ['gentle', 'cycle', 'sun', 'strength', 'steady', 'preg1', 'preg3']) {
    await go(m4, 'plan-r-' + r);
    check('4 #plan-r-' + r + ' refuses in her middle three months', !(await has(m4, '#pl-pstart')) && /Moves and calm/.test(await view(m4)));
  }
  check('4 Calm breath stays (no breath held)', await m4.page.evaluate(() => !!window.Saathi.plan.calmRow()));
  await done(m4);
  const m4a = await open({ seed: withPlan(20, 2, { intake: IK({ pflags: ['unsure'] }) }), hash: 'plan-moves' });
  check('4 amber: no routine, "Yoga opens when your doctor says…", My safety answers', !(await has(m4a, '#view .pl-ritem')) && /^Pregnancy yoga Yoga opens when your doctor says exercise is fine for you\./.test(await txt(m4a, '.pl-pylock')) && await has(m4a, '.pl-pylock [data-go="plan-psafe"]'), await txt(m4a, '.pl-pylock'));
  await done(m4a);
  const m4n = await open({ seed: { situation: sit(20) }, hash: 'plan-moves' });
  check('4 no plan yet: "comes with My pregnancy plan"', !(await has(m4n, '#view .pl-ritem')) && /comes with My pregnancy plan, after two safety questions/.test(await txt(m4n, '.pl-pylock')) && await has(m4n, '.pl-pylock [data-go="plan"]'), await txt(m4n, '.pl-pylock'));
  await go(m4n, 'plan-r-cycle');
  check('4 ... and the cycle routine (on her tummy, on her back) refuses', !(await has(m4n, '#pl-pstart')));
  await done(m4n);
  const m4v = await open({ seed: withPlan(20, 30, { pv: 1 }), hash: 'plan-moves' });
  check('4 the first pregnancy plan: "comes with the newer My pregnancy plan", and Plan settings', /^Pregnancy yoga Yoga for your pregnancy comes with the newer My pregnancy plan\. To switch, tap “Change what I work on” in Plan settings\. What you logged stays\. Plan settings$/.test(await txt(m4v, '.pl-pylock')) && await has(m4v, '.pl-pylock [data-go="plan-settings"]'), await txt(m4v, '.pl-pylock'));
  await tap(m4v, '.pl-pylock [data-go="plan-settings"]');
  check('4 ... which opens Plan settings, with "Change what I work on"', (await m4v.page.evaluate(() => location.hash)) === '#plan-settings' && /Change what I work on/.test(await view(m4v)));
  await tap(m4v, '#pl-chg'); await m4v.page.evaluate(() => { const x = [...document.querySelectorAll('#view button')].find((e) => /Food and activity/.test(e.textContent)); if (x) x.click(); }); await settle(m4v.page, 600);
  check('4 ... and "Change what I work on" starts the newer plan with "Before you start", as the note says', /^Before you start/.test(await view(m4v)) && await has(m4v, '[data-pl-pnow="n"]'), (await view(m4v)).slice(0, 120));
  await done(m4v);
  const m4c = await open({ seed: { situation: {}, goals: ['periods'], intake: { goal: 'irregular', stage: 'cycle' } }, hash: 'plan-moves' });
  const ci = await m4c.page.$$eval('#view .pl-ritem', (xs) => xs.map((x) => x.dataset.go));
  check('4 not pregnant: never the pregnancy yoga', ci.length > 0 && ci.every((g) => !/preg/.test(g)) && !(await has(m4c, '.pl-pylock')) && !(await has(m4c, '.pl-pystop')), ci);
  await go(m4c, 'plan-r-preg2');
  check('4 ... and its page refuses', !(await has(m4c, '#pl-pstart')));
  await done(m4c);

  /* search: "yoga" finds Moves and calm once her yoga is open (its tile stays hidden in a pregnancy otherwise) */
  for (const [seed, want, tag] of [[withPlan(20, 2), true, 'green'], [withPlan(20, 2, { intake: IK({ pflags: ['unsure'] }) }), false, 'amber'], [{ situation: sit(20) }, false, 'no plan']]) {
    const q4 = await open({ seed, hash: 'care' });
    await q4.page.fill('#view input[type="search"]', 'yoga'); await settle(q4.page, 600);
    const found = await has(q4, '#view [data-go="plan-moves"]');
    check('4 search "yoga" in a pregnancy, ' + tag + ': ' + (want ? 'Moves and calm, with her yoga' : 'not Moves and calm'), found === want, await txt(q4, '#view'));
    await done(q4);
  }

  /* ---------- 5. a shared phone (discreet words) ---------- */
  const sh = await open({ seed: withPlan(20, 2, {}, { settings: { discreet: true } }) });
  await go(sh, 'home');
  check('5 shared phone: Today never says "Pregnancy yoga"', !/Pregnancy yoga/i.test(await view(sh)), (await view(sh)).slice(0, 500));
  await go(sh, 'plan-r-preg2');
  check('5 ... the player\'s title is "Yoga", and the stop signs stay', /^Yoga /.test(await view(sh)) && !/^Pregnancy yoga/.test(await view(sh)) && await has(sh, '.pl-pystop'));
  await done(sh);

  /* ---------- 6. Hindi at 360 px ---------- */
  const hi = await open({ seed: withPlan(32, 2, {}, { lang: 'hi' }), hash: 'plan-r-preg3', w: 360, h: 800 });
  const hv1 = await view(hi);
  check('6 Hindi: the intro, the stop card, no string key, no sideways scroll', /प्रेग्नेंसी योग/.test(hv1) && /रुकें, आराम करें, और आज ही अपनी डॉक्टर को बताएँ।/.test(hv1) && !KEYS.test(hv1) && await noScroll(hi), hv1.slice(0, 400));
  await shot(hi, '6-hi-intro');
  await tap(hi, '#pl-pstart');
  const hv2 = await view(hi);
  check('6 Hindi: the first move and "तबीयत ठीक नहीं?"', /बैठकर शरीर खोलें/.test(hv2) && (await txt(hi, '#pl-unwell')) === 'तबीयत ठीक नहीं?' && !KEYS.test(hv2) && await noScroll(hi), hv2.slice(0, 300));
  await shot(hi, '6-hi-step');
  await tap(hi, '#pl-unwell');
  check('6 Hindi: the unwell screen', /अभी रुकें और आराम करें/.test(await view(hi)) && !KEYS.test(await view(hi)) && await noScroll(hi));
  await done(hi);
  const hm = await open({ seed: withPlan(20, 2, { intake: IK({ pflags: ['unsure'] }) }, { lang: 'hi' }), hash: 'plan-moves', w: 360, h: 800 });
  check('6 Hindi: Moves and calm\'s note', /जब आपकी डॉक्टर कहें कि व्यायाम आपके लिए ठीक है/.test(await txt(hm, '.pl-pylock')) && !KEYS.test(await view(hm)) && await noScroll(hm));
  await done(hm);

  /* ---------- 7. the code ---------- */
  check('7 every new line has its Hindi', ['plan_py_stop', 'plan_py_go', 'plan_py_unwell', 'plan_py_rest_p', 'plan_py_lock_doc', 'plan_r_preg3_s', 'plan_fb_pyoga'].every((k) => (SRC.match(new RegExp('\\b' + k + ': ', 'g')) || []).length === 2));
} catch (e) {
  check('no crash: ' + String(e && e.message).slice(0, 300), false);
}
check('7 no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' checks passed');
process.exit(pass === results.length ? 0 : 1);
