// Version 35: the 12-week PMOS plan (mods/plan.js; MODULE_API section 37), and Version 36: the Plans tab, plans suggested from
// her diary and her answers, Care's new order and the plan's audit fixes (MODULE_API section 38). This file checks:
//   - it is on in every build since Mohit's approval (PLAN_RELEASE), pilot and test builds included;
//   - the rules: her region from her PIN code, the weekly targets, knee and back pain, every move's moving drawing;
//   - starting the plan, logging minutes and food habits (on the plan and in Home's Today), the weekly look-back;
//   - the routines: the timer, the moving drawings (and still ones for "reduce motion"), both sides, the minutes logged;
//   - My plate (what she eats, her region), My body (BMI and waist with the Indian cut-offs, discreet mode, her focus);
//   - My progress; paused in pregnancy and for 6 weeks after a birth; the daily reminder; For you, setup and search;
//   - the doctor summary and "Ask Qura to call me"; Hindi; no page errors; the module never touches the network;
//   - Version 36: the Plans tab and page, what each kind of diary suggests (and never "you have PMOS" from long gaps alone),
//     "What you want help with", the Home card and "Not now", Care's order, and the audit fixes (wording, Undo, done today,
//     notifications off, paused reminders, the screen kept on during a routine).
// Usage: node test/pmosplan.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'pmosplan'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-23', NOW = '2026-10-23T10:00:00+05:30';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
/* irregular PMOS-like cycles: gaps of 46, 52, 38 and 61 days, the last start 20 days ago */
const pmosEvents = () => { const out = []; let a = 20; const starts = [a]; [61, 38, 52, 46].forEach((g) => { a += g; starts.unshift(a); }); starts.forEach((x, i) => out.push({ d: ago(x), t: 'start', pain: i === 2 ? 'pain_2' : 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, events: pmosEvents(), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off', notifyIntro: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya', pincode: '302001', activeOn: TODAY };
const ANDROID = 'window.SakhiAndroid = { schedule(j){ window.__sched = j; return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(on){ window.__awake = on; } };';
/* fig: false keeps the drawings this file checks; the 3D figure that replaces them in the player is test/moves3d.mjs (Version 39.39) */
const DEMO = { api: 'https://api.test.invalid', app: 'test-0.35-demo', platform: 'android', fig: false };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: o.still ? 'reduce' : 'no-preference' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(o.cfg || DEMO) + ';');
  if ((o.cfg || DEMO).platform === 'android') await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + ');' + (o.noAcct ? '' : ' localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(Object.assign({}, ACCT, o.acct || {}))) + ');') + ' }');
  const sent = [];
  await ctx.route(/^https?:/, (r) => { const req = r.request(); const p = new URL(req.url()).pathname.replace(/^.*\/v1\//, ''); sent.push(req.method() + ' ' + p);
    if (req.method() === 'GET' && p === 'requests') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: true }) });
    r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(o.now || NOW) });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  if (o.sample) { await page.evaluate((w) => { const S = window.Saathi; const keep = Object.assign({}, S.state.settings); S.loadSample(w); S.state.settings = Object.assign(S.state.settings, keep); S.state.prompts = Object.assign({}, S.state.prompts, { setup: 'off', notifyIntro: '2026-10-20' }); S.state.fullTour = { st: 'done', d: '2026-10-20' }; S.state.tours = JSON.parse(JSON.stringify(S.state.tours || {})); S.save(); }, o.sample); await go(page, 'learn'); await go(page, o.hash ? o.hash.slice(1) : 'home'); }
  return { ctx, page, errs, sent };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(12); } }
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 400); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const gos = (page, sel) => page.$$eval(sel, (b) => b.map((x) => x.dataset.go));
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods || {}).plan || null)));
const setPlan = (page, p) => page.evaluate((x) => { const S = window.Saathi; S.state.mods = S.state.mods || {}; S.state.mods.plan = x; S.save(); S.render(); }, p);
const points = (page) => page.$eval('#pl-fig [data-k="a1"]', (e) => e.getAttribute('points') + '|' + e.ownerSVGElement.querySelector('[data-k="l1"]').getAttribute('points'));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
async function careSearch(page, q) {
  await go(page, 'care');
  return page.evaluate(async (q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); await new Promise((r) => setTimeout(r, 80));
    const sec = document.querySelector('#view .care-sec'); return sec && sec.querySelector('h2') && /tools|टूल/.test(sec.querySelector('h2').innerText) ? [...sec.querySelectorAll('[data-go]')].map((x) => x.dataset.go) : []; }, q);
}
const started = (extra) => Object.assign({ start: TODAY, goal: 'cycles', level: 0, limits: { knees: false, back: false }, food: 'veg', region: 'west', focus: 'habits', log: {}, weeks: {}, body: [] }, extra || {});

/* ---------- 1. On in every build since Mohit's approval (PLAN_RELEASE), pilot and test builds included ---------- */
for (const cfg of [{ api: 'https://api.test.invalid', app: 'test-0.35-pilot', platform: 'android' }, { api: 'https://api.test.invalid', app: '0.35-test', platform: 'android' }, DEMO, { app: '0.35', platform: 'web' }]) {
  const tag = '1 ' + cfg.app + ' (' + cfg.platform + ')';
  const { ctx, page, errs } = await open({ cfg: cfg, hash: '#topic-cond' });
  check(tag + ': the plan is on (PLAN_RELEASE)', (await page.evaluate(() => window.Saathi.plan.on())) === true);
  check(tag + ': the plan heads the PMOS topic', (await gos(page, '#view .list [data-go]'))[0] === 'plan-pmos', await gos(page, '#view .list [data-go]'));
  /* Version 39.3: "yoga" finds the yoga moves first, and the PMOS plan with them */
  check(tag + ': search for "yoga" finds the moves and the plan', ((r) => r[0] === 'plan-moves' && r.indexOf('plan-pmos') >= 0)(await careSearch(page, 'yoga')), await careSearch(page, 'yoga'));
  check(tag + ': the Plans tab is there', await has(page, '#tabbar [data-go="plan"]'));
  await setPlan(page, started({ start: ago(10) }));
  await go(page, 'home');
  check(tag + ': Home\'s Today carries the plan', await has(page, '.today-plan-move'));
  check(tag + ': the doctor summary carries the plan', await page.evaluate(() => window.Saathi.summaries().some((m) => m.mod === 'plan' && m.sections.length)));
  check(tag + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. The rules ---------- */
{
  const { ctx, page, errs } = await open();
  const R = await page.evaluate(() => {
    const P = window.Saathi.plan; const pins = { '110001': 'north', '160017': 'north', '302001': 'west', '403001': 'west', '400001': 'west', '462001': 'central', '492001': 'central', '500001': 'south', '560001': 'south', '600001': 'south', '682001': 'south', '700001': 'east', '751001': 'east', '800001': 'east', '834001': 'east', '781001': 'ne', '737101': 'ne', '795001': 'ne', '29001': null, '000000': null, '': null, '9000AB': null };
    const base = (x) => Object.assign({ level: 0, focus: 'habits', body: [], limits: {} }, x || {});
    const poses = (id, d) => P.stepsOf(id, d).map((s) => s.pose);
    return {
      pins: Object.keys(pins).filter((k) => P.regionOfPin(k) !== pins[k]).map((k) => k + '->' + P.regionOfPin(k)),
      t0: [1, 2, 6, 11, 12].map((w) => P.target(base(), w)), t1: [1, 5, 9].map((w) => P.target(base({ level: 1 }), w)), t2: [1, 2, 3, 12].map((w) => P.target(base({ level: 2 }), w)),
      w0: P.target(base({ focus: 'weight' }), 12), w2: [8, 12].map((w) => P.target(base({ level: 2, focus: 'weight' }), w)),
      wLow: P.target(base({ level: 2, focus: 'weight', body: [{ d: '2026-10-01', h: 160, w: 52 }] }), 12), wHigh: P.target(base({ level: 2, focus: 'weight', body: [{ d: '2026-10-01', h: 160, w: 70 }] }), 12),
      day: [P.daySuggest(base(), 1), P.daySuggest(base(), 12), P.daySuggest(base({ level: 2, focus: 'weight' }), 12)],
      knees: poses('cycle', { limits: { knees: true } }), back: poses('cycle', { limits: { back: true } }), cyc: poses('cycle', {}),
      strength: P.stepsOf('strength', {}).length, strKnees: poses('strength', { limits: { knees: true } }),
      sun1: P.stepsOf('sun', { start: '2026-10-23', level: 0 }).length, sunMins: P.routineMins('sun', { start: '2026-10-23', level: 0 }),
      habits: [1, 2, 3, 5, 12].map((w) => P.habitsOn(w).length),
      sides: P.stepsOf('gentle', {}).filter((s) => s.sideK).map((s) => s.sideK).join(''),
      poses: P.poses(), anims: P.anims()
    };
  });
  check('2 her region comes from the first digits of her PIN code (Sikkim is north-east), and a bad PIN gives none', !R.pins.length, R.pins);
  check('2 a beginner builds from 50 to 150 active minutes a week by week 11', JSON.stringify(R.t0) === '[50,60,100,150,150]', R.t0);
  check('2 "some days" starts at 75 and reaches 150', JSON.stringify(R.t1) === '[75,115,150]', R.t1);
  check('2 "most days" starts at 120 and reaches 150 in week 3', JSON.stringify(R.t2) === '[120,135,150,150]', R.t2);
  check('2 "habits and weight" builds towards 250 (2023 PCOS guideline 3.4.3)', R.w0 === 215 && JSON.stringify(R.w2) === '[250,250]', [R.w0, R.w2]);
  check('2 with a BMI already under 23, "weight" keeps 150 (steady weight)', R.wLow === 150 && R.wHigh === 250, [R.wLow, R.wHigh]);
  check('2 the daily suggestion is a fifth of the week, at least 10 minutes', JSON.stringify(R.day) === '[10,30,50]', R.day);
  check('2 knee pain swaps kneeling moves (camel, child pose) for standing or chair ones', !R.knees.includes('camel') && !R.knees.includes('child') && R.cyc.includes('camel') && R.cyc.includes('child') && R.knees.includes('armsup'), R.knees);
  check('2 back pain skips the half locust', !R.back.includes('locust') && R.cyc.includes('locust'), R.back);
  check('2 strength: warm-up, march, two sets each, step-ups on both legs, heel raises, rest (12 moves)', R.strength === 12, R.strength);
  check('2 knee pain swaps step-ups for marching', !R.strKnees.includes('step'), R.strKnees);
  check('2 the sun salutation: warm-up, 3 rounds of 12 poses, rest', R.sun1 === 38 && R.sunMins >= 5, [R.sun1, R.sunMins]);
  check('2 one food habit every two weeks, six in all', JSON.stringify(R.habits) === '[1,1,2,3,6]', R.habits);
  check('2 one-sided moves are done on the right and then the left', /^(rl)+$/.test(R.sides), R.sides);
  const struct = await page.evaluate(() => { const P = window.Saathi.plan; return P.anims(); });
  check('2 every animation has its drawings', struct.length >= 15 && R.poses.length >= 40, [struct.length, R.poses.length]);
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Starting the plan, minutes, food habits, Home's Today ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#plan-pmos' });
  const v0 = await view(page);
  check('3 before she starts: what it is, and one button', /Twelve weeks of small daily habits/.test(v0) && (await has(page, '[data-go="plan-start"]')), v0.slice(0, 300));
  await shot(page, 'hub-intro-en');
  await tap(page, '[data-go="plan-start"]');
  check('3 her region is picked from her PIN code (302001: West India)', /From your PIN code: West India/.test(await view(page)) && (await has(page, '[data-pl-f="region"][data-v="west"].on')));
  await tap(page, '#pl-go');
  check('3 an answer missing: it says so and does not start', !(await page.$eval('#pl-err', (e) => e.hidden)) && !((await plan(page)) || {}).start);
  for (const [k, val] of [['goal', 'cycles'], ['level', '0'], ['lim', 'none'], ['food', 'veg']]) await tap(page, '[data-pl-f="' + k + '"][data-v="' + val + '"]');
  await shot(page, 'start-en');
  await tap(page, '#pl-go'); await settle(page, 400);
  /* Version 37.1: her answers make her plan; it waits on its cards until "Start my plan" */
  const p0 = await plan(page);
  check('3 her answers make her plan, which waits on its cards', p0 && !p0.start && p0.next && p0.next.goal === 'cycles' && p0.next.level === 0 && p0.next.food === 'veg' && p0.next.region === 'west' && p0.next.focus === 'habits' && p0.next.limits.knees === false && (await page.evaluate(() => location.hash)) === '#plan-reveal', p0);
  for (let i = 0; i < 8 && !(await has(page, '#pl-rv-go')); i++) await tap(page, '#pl-rv-next');
  await tap(page, '#pl-rv-go'); await settle(page, 600); await go(page, 'plan-pmos');
  const p1 = await plan(page);
  check('3 "Start my plan" starts it today with her answers', p1 && p1.start === TODAY && p1.goal === 'cycles' && p1.level === 0 && p1.food === 'veg' && p1.region === 'west' && p1.focus === 'habits' && p1.limits.knees === false && !p1.next, p1);
  const hub = await view(page);
  /* Version 39.5 (journey audit MIN-10): her plan's page has the week's ring and one row for today; Today has the steps, My moves
     the minutes and My plate the food habits */
  check('3 week 1: 0 of 50 minutes in her week, and her steps with their reasons (Version 39.15)', /Week 1 of 12/i.test(hub) && /Active minutes\n0 of 50/.test(hub) && (await has(page, '#view .pl-steps-card')) && (await has(page, '#view .pl-wkc')) && !(await has(page, '#view [data-pl-add]')), hub.slice(0, 900));
  await go(page, 'home');
  check('3 ... and Today has her yoga and her 10-minute walk (Versions 39.12 and 39.13; 39.41: its minutes on its Start)', /Cycle care yoga\nBefore a meal[\s\S]*?\n\d+ min\nWalk 10 minutes/.test(await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '')));
  await go(page, 'plan-plate');
  check('3 the first food habit is there to tick (My plate)', await has(page, '[data-pl-hab="half"]'));
  await go(page, 'plan-moves');
  await tap(page, '[data-pl-add="20"]');
  check('3 +20 on Yoga and moves adds 20 minutes to today', (await plan(page)).log[TODAY].min === 20);
  check('3 the toast says what was added, with Undo', /20 minutes added/.test(await page.$eval('#toast-root', (e) => e.innerText)) && (await has(page, '#toast-root [data-ta="0"]')));
  await tap(page, '#toast-root [data-ta="0"]');
  check('3 Undo takes the 20 minutes back', !(await plan(page)).log[TODAY].min);
  await tap(page, '[data-pl-add="20"]');
  await go(page, 'plan-pmos');
  check('3 ... and her week counts them', /Active minutes\n20 of 50/.test(await view(page)));
  await go(page, 'plan-plate');
  await page.$eval('[data-pl-hab="half"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(page, 300);
  check('3 ticking the food habit saves it for today', (await plan(page)).log[TODAY].plate.half === true);
  await go(page, 'plan-pmos');
  await shot(page, 'hub-en');
  /* Home's Today: the minutes and the habit, one tap each */
  await setPlan(page, started({ start: ago(15), level: 1 }));
  await go(page, 'home');
  const tv = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('3 Home\'s Today: today\'s strength, her walk for the rest of the day\'s minutes, and the newest food habit', /Strength at home\nWhy\?\n\d+ min\nWalk 10 minutes/.test(tv) && /Protein at breakfast/.test(tv), tv);
  await tap(page, '.today-plan-move [data-today-act]');
  check('3 one tap logs today\'s walk, and the step stays, ticked (Version 39.14)', (await plan(page)).log[TODAY].min === 10 && (await has(page, '.today-plan-move.today-ok')));
  await tap(page, '.today-plan-yoga [data-today-nav]');
  check('3 Start opens today\'s routine (Version 39.12)', (await page.evaluate(() => location.hash)) === '#plan-r-strength');
  await go(page, 'home');
  await tap(page, '.today-plan-plate [data-today-act]');
  check('3 one tap keeps today\'s food habit', (await plan(page)).log[TODAY].plate.protein === true && (await has(page, '.today-plan-plate.today-ok')));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.state.mods.plan.log = {}; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  const td = await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '');
  check('3 discreet mode: Today says "Your plan for today", never PMOS', /Your plan for today/.test(td) && !/PMOS/.test(td), td);
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. The routines: timer, moving drawings, both sides, minutes logged ---------- */
{
  const { ctx, page, errs } = await open();
  await setPlan(page, started());
  await go(page, 'plan-r-strength');
  const intro = await view(page);
  check('4 the routine lists its moves with pictures and a start button with the minutes', /Chair squats/.test(intro) && /Wall push-ups/.test(intro) && /Start · About \d+ min/.test(intro) && (await page.$$('.pl-pitem .pl-fig')).length >= 6, intro.slice(0, 400));
  await tap(page, '#pl-pstart');
  check('4 move 1: loosen up, with a moving drawing and a timer', /Move 1 of 12/i.test(await view(page)) && (await has(page, '#pl-fig')) && (await has(page, '#pl-arc')));
  const a = await points(page); await settle(page, 700); const b = await points(page);
  check('4 the drawing moves, like a GIF', a !== b, [a, b]);
  await settle(page, 61000);
  check('4 when the timer ends she rests (Version 39.39), then moves on to the next move', await has(page, '#pl-rest'), (await view(page)).slice(0, 200));
  await settle(page, 15000);
  check('4 the timer moves her on to the next move', /Move 2 of 12/i.test(await view(page)) && /March on the spot/.test(await view(page)), (await view(page)).slice(0, 200));
  await shot(page, 'player-march-en');
  await tap(page, '#pl-next');
  check('4 sets are counted: chair squats, set 1 of 2', /Chair squats/.test(await view(page)) && /Set 1 of 2/i.test(await view(page)));
  await settle(page, 800); await shot(page, 'player-chair-en');
  for (let i = 0; i < 10; i++) await tap(page, '#pl-next');
  const done = await view(page);
  const p = await plan(page);
  check('4 finishing logs the minutes she spent and the strength day', /Well done/.test(done) && /(\d+ minutes|One minute) added to your week/.test(done) && p.log[TODAY].min >= 1 && p.log[TODAY].str === true, [done.slice(0, 300), p.log[TODAY]]);
  await tap(page, '[data-pl-feel="hard"]');
  check('4 "Hard" suggests Gentle start for a week', /Gentle start for a week/.test(await view(page)) && (await plan(page)).feel.slice(-1)[0].f === 'hard');
  /* both sides: the tree pose's left side is the same drawing, mirrored */
  await go(page, 'plan-r-gentle'); await tap(page, '#pl-pstart');
  for (let i = 0; i < 5; i++) await tap(page, '#pl-next');
  check('4 the left side shows the drawing mirrored', /Left side/i.test(await view(page)) && /scale\(-1 1\)/.test(await page.$eval('#pl-fig', (e) => e.innerHTML)), (await view(page)).slice(0, 160));
  /* the sun salutation flows from pose to pose, then holds */
  await go(page, 'plan-r-sun'); await tap(page, '#pl-pstart'); await tap(page, '#pl-next'); await tap(page, '#pl-next');
  const s1 = await points(page); await settle(page, 1200); const s2 = await points(page); await settle(page, 1500); const s3 = await points(page);
  check('4 the sun salutation moves into each pose, then holds it', /Round 1 of 3/i.test(await view(page)) && s1 !== s2 && s2 === s3, [s1, s2, s3]);
  await shot(page, 'player-sun-en');
  check('4 the screen stays on while she follows a routine', (await page.evaluate(() => window.__awake)) === true);
  await go(page, 'plan-pmos');
  check('4 leaving the routine lets the screen sleep again', (await page.evaluate(() => window.__awake)) === false);
  check('4 leaving the routine stops its timer and drawing (no errors)', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ still: true });
  await setPlan(page, started());
  await go(page, 'plan-r-strength'); await tap(page, '#pl-pstart');
  const a = await points(page); await settle(page, 1500); const b = await points(page);
  check('4 "reduce motion" on the phone: the drawings stay still', a === b, [a, b]);
  await setPlan(page, started({ limits: { knees: false, back: true } }));
  await go(page, 'plan-moves');
  check('4 back pain: no sun salutation in the list', !(await gos(page, '#view .list [data-go]')).includes('plan-r-sun'));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. The weekly look-back ---------- */
{
  const { ctx, page, errs } = await open();
  const log = {}; for (let i = 8; i >= 2; i--) log[ago(i)] = { min: 10 }; [7, 5, 3].forEach((i) => { log[ago(i)].ci = 1; log[ago(i)].bar = 'time'; });
  await setPlan(page, started({ start: ago(8), log: log }));
  await go(page, 'plan-pmos');
  const v = await view(page);
  /* Version 37.2: it leads with what she did, asks only her energy, and takes what got in the way from her check-ins */
  check('5 a new week opens with last week\'s look-back: what she did, the week\'s barrier, one question', /Week 1 is done/.test(v) && /You followed your plan on 7 of 7 days\. You moved 70 minutes\./.test(v) && /No time on 3 days\./.test(v) && !/target/i.test(v.slice(v.indexOf('Week 1 is done'), v.indexOf('Week 1 is done') + 200)) && (await has(page, '[data-pl-e="ok"]')) && !(await has(page, '[data-pl-b]')), v.slice(0, 900));
  check('5 the look-back sits under her steps, not above them (Version 39.15)', await page.evaluate(() => { const a = document.querySelector('#view .pl-steps-card'), b = document.querySelector('#view .pl-review'); return !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)); }));   /* Version 39.5: one row for today */
  await tap(page, '#view .pl-review [data-pl-e="ok"]');
  check('5 her answer brings one tip and next week\'s target', /Split it up: two 10-minute walks count/.test(await view(page)) && /Next week: 60 minutes/.test(await view(page)));
  await tap(page, '#pl-rev-ok');
  const w = (await plan(page)).weeks['1'];
  check('5 "Got it" puts it away; the answers are kept for her progress', !/Week 1 is done/.test(await view(page)) && w.e === 'ok' && w.b === 'time' && w.seen === true, w);
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. My plate: her region, what she eats, no food banned ---------- */
{
  const { ctx, page, errs } = await open();
  await setPlan(page, started());
  await go(page, 'plan-plate');
  let v = await view(page);
  check('6 the plate: half sabzi, a quarter grains, a quarter dal or protein, curd on the side', /Half: sabzi and salad/.test(v) && /A quarter: roti, rice or millet/.test(v) && (await has(page, '#view svg.pl-plate')));
  check('6 foods from her region (West India) come first', /From West India/i.test(v) && /Bajra or jowar bhakri, rotla/.test(v), v.slice(0, 900));
  check('6 vegetarian: no eggs, fish or chicken', !/Boiled eggs|Fish, not fried|chicken/i.test(v));
  check('6 less often and avoid, with no food banned', /Less often/.test(v) && /Maida: white bread, biscuits, naan/.test(v) && /Vanaspati and dalda/.test(v) && /No food is banned/.test(v));
  await tap(page, '[data-pl-food="nonveg"]');
  v = await view(page);
  check('6 non-vegetarian adds eggs and fish', /Boiled eggs/.test(v) && /Fish, not fried/.test(v) && (await plan(page)).food === 'nonveg');
  await tap(page, '#pl-reg'); await tap(page, '[data-pl-reg="south"]');
  v = await view(page);
  check('6 she can change her region', /From South India/i.test(v) && /Ragi mudde/.test(v) && (await plan(page)).region === 'south');
  await shot(page, 'plate-en');
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { stage: 'browse' } });
  await go(page, 'plan-plate');
  check('6 without a diary the plate still works', /Less often/.test(await view(page)));
  await go(page, 'plan-pmos');
  check('6 without a diary the plan asks her to start one', /Start my diary|start your diary/i.test(await view(page)));
  await go(page, 'plan');
  const vb = await view(page);
  check('6 without a diary the Plans page lists the plans and asks for a diary for suggestions', /My plan/.test(vb) && /Start your diary, and Sakhi suggests plans/.test(vb) && (await gos(page, '#view [data-go]')).includes('plan-pmos'), vb.slice(0, 400));
  check('6 no page errors (browse)', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. My body: BMI and waist with the Indian cut-offs ---------- */
{
  const { ctx, page, errs } = await open();
  await setPlan(page, started({ level: 0 }));
  await go(page, 'plan-body');
  await page.fill('#pl-cm', '100'); await page.fill('#pl-w', '60'); await tap(page, '#pl-bsave');
  check('7 a height outside 120 to 210 cm is refused', !(await page.$eval('#pl-berr', (e) => e.hidden)) && !(await plan(page)).body.length);
  await page.$eval('#pl-ft', (s) => { s.value = '5'; s.dispatchEvent(new Event('change')); }); await page.$eval('#pl-in', (s) => { s.value = '2'; s.dispatchEvent(new Event('change')); });
  check('7 feet and inches fill in the centimetres', (await page.$eval('#pl-cm', (i) => i.value)) === '157.5');
  await page.fill('#pl-cm', '158'); await page.fill('#pl-w', '65.8'); await page.fill('#pl-waist', '85'); await tap(page, '#pl-bsave');
  const v = await view(page);
  check('7 BMI 26.4, above the healthy range for Indian women (18.5 to 22.9)', /26\.4/.test(v) && /above the healthy range for Indian women/.test(v) && /18\.5 to 22\.9/.test(v), v.slice(0, 600));
  check('7 a waist of 85 cm: 80 cm is the limit for Indian women', /85 cm/.test(v) && /80 cm or more/.test(v));
  check('7 no "obese" or "overweight" label anywhere', !/obese|overweight/i.test(v));
  await shot(page, 'body-en');
  await tap(page, '[data-pl-focus="weight"]');
  check('7 "Habits and weight" raises her target towards 250 minutes', (await plan(page)).focus === 'weight' && (await page.evaluate(() => window.Saathi.plan.target(window.Saathi.state.mods.plan, 12))) === 215);
  await page.fill('#pl-w', '52'); await tap(page, '#pl-bsave');
  check('7 with BMI under 23 the plan keeps her weight steady (150)', /already in the healthy range/.test(await view(page)) && (await page.evaluate(() => window.Saathi.plan.target(window.Saathi.state.mods.plan, 12))) === 150);
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'plan-pmos'); await go(page, 'plan-body');
  const vd = await view(page);
  check('7 discreet mode hides her numbers until she taps Show', !/20\.8/.test(vd) && !(await has(page, '#view .pl-bmi')) && (await has(page, '#pl-show')), vd.slice(0, 300));
  await tap(page, '#pl-show');
  check('7 Show brings them back', /20\.8/.test(await view(page)));
  await tap(page, '#pl-del'); await tap(page, '#pl-del-yes');
  const p = await plan(page);
  check('7 she can delete all her body notes', !p.body.length && p.height === undefined && p.focus === 'habits');
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. My progress (Priya, three and a half weeks in) ---------- */
{
  const { ctx, page, errs } = await open({ sample: 'priya', hash: '#plan-progress' });
  const v = await view(page);
  check('8 active minutes for each week, with the target', (await has(page, '#view svg.pl-chart')) && /Active minutes each week/.test(v));
  check('8 days between periods, before and since she started', /Days between periods/.test(v) && /Before/.test(v) && /Since you started/.test(v), v.slice(0, 900));
  check('8 her energy each week, from the look-backs', /Your energy each week/.test(v) && /Low/.test(v));
  check('8 weight and waist, first and latest, only as she noted them', /Weight and waist/.test(v) && /66\.4/.test(v) && /65\.8/.test(v) && /86/.test(v));
  check('8 what to expect, as a timeline: she is in weeks 1 to 4', /What to expect/.test(v) && /Weeks 1 to 4\s*You are here/.test(v), v.slice(-900));
  /* Version 39.0 (Mohit's decision 3, 24 Oct): the supplements card is gone from the plan's pages */
  check('8 no supplements card and no "ask about supplements" button (Version 39.0)', !(await page.$$('#view [data-ask]')).length && !/supplements or medicines/.test(v));
  check('8 it says these are her own entries, not a diagnosis', /not a test result or a diagnosis/.test(v));
  await shot(page, 'progress-en');
  await go(page, 'plan-pmos');
  await shot(page, 'hub-priya-en');
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 9. Paused in pregnancy and for 6 weeks after a birth ---------- */
{
  const { ctx, page, errs } = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(120) } }, hash: '#plan-pmos' });
  check('9 pregnant: the plan is paused, with her pregnancy plan instead', /paused while you are pregnant/.test(await view(page)) && !(await has(page, '[data-go="plan-start"]')));
  await go(page, 'topic-cond');
  check('9 pregnant: no plan tile', !(await gos(page, '#view [data-go]')).includes('plan-pmos'));
  check('9 pregnant: search for "diet" does not offer the plan', !(await careSearch(page, 'diet')).includes('plan-pmos'));
  await setPlan(page, started({ start: ago(30) }));
  await page.evaluate(() => window.Saathi.reminders.upsert({ id: 'plan', mod: 'plan', title: { en: 'Your plan for today', hi: 'आज का आपका प्लान' }, start: '2026-10-01', every: 1, time: '18:00', on: true }));
  await go(page, 'home');
  check('9 pregnant: nothing from the plan on Home', !(await has(page, '.today-plan-move')));
  check('9 pregnant: the plan\'s daily reminder stops too', !(await page.evaluate(() => window.Saathi.reminders.get('plan'))));
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}
for (const [days, paused] of [[21, true], [50, false]]) {
  const { ctx, page, errs } = await open({ seed: { situation: { deliveredOn: ago(days), breastfeeding: true } }, hash: '#plan-pmos' });
  const v = await view(page);
  check('9 ' + days + ' days after a birth: ' + (paused ? 'start after the 6-week check' : 'she can start'), paused ? /after your 6-week check/.test(v) : (await has(page, '[data-go="plan-start"]')), v.slice(0, 300));
  check('9 no page errors (' + days + ' days)', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10. The daily reminder, and stopping the plan ---------- */
{
  const { ctx, page, errs } = await open();
  await setPlan(page, started()); await go(page, 'plan-settings');   /* Version 39.15: Plan settings is a page of its own */
  await page.$eval('#pl-rem', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(page, 300);
  let r = await page.evaluate(() => window.Saathi.reminders.get('plan'));
  check('10 the reminder: every day at 8 pm (Version 37.1: her evening check-in), past the 12 weeks by 4 more (Version 39.27: her steps carry on)', r && r.time === '20:00' && r.every === 1 && r.until === iso(TODAY, 111) && r.mod === 'plan', r);
  check('10 only evening times are offered for the check-in', !(await has(page, '[data-pl-at="07:00"]')) && (await has(page, '[data-pl-at="18:00"]')) && (await has(page, '[data-pl-at="21:00"]')));
  await tap(page, '[data-pl-at="19:00"]');
  r = await page.evaluate(() => window.Saathi.reminders.get('plan'));
  check('10 she can pick another time', r && r.time === '19:00');
  await tap(page, '#pl-stop'); await tap(page, '#pl-stop-yes');
  check('10 stopping asks first, then ends the plan and its reminder', !(await plan(page)).start && !(await page.evaluate(() => window.Saathi.reminders.get('plan'))));
  check('10 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 11. For you, the setup card and search ---------- */
{
  const { ctx, page, errs } = await open({ seed: { prompts: { notifyIntro: ago(3) } }, hash: '#care' });
  const all = await gos(page, '#view [data-go]'); const fy = await gos(page, '#view section.care-sec:first-of-type [data-go]');
  /* Version 39.2: Contents (all guides and articles) sits right under search, then For you */
  check('11 Explore opens with Contents, then For you (her plan first), then Govt. services; My plan is a tab, so no Plans row', all[0] === 'learn' && all[1] === 'plan-pmos' && fy[0] === 'plan-pmos' && all.indexOf('access-free') > all.indexOf(fy[fy.length - 1]) && !(await has(page, '#view .care-plans')), [all.slice(0, 10), fy]);
  check('11 For you has no government pages: they sit in Govt. services', !fy.some((r) => /^access-|^asha$/.test(r)), fy);
  check('11 Govt. services is one row, and its topic card is gone', /Govt\. services/.test(await page.$eval('#view .care-free', (e) => e.innerText)) && !(await has(page, '#view [data-go="topic-free"]')));
  /* Version 39.2 (journey audit J-24): she joined months ago, so the setup card waits in Me, one step at a time */
  await go(page, 'home');
  check('11 after 30 days the setup card is not on Today', !(await has(page, '#view .setup-card')));
  await go(page, 'me');
  check('11 "Set up Sakhi for you" sits in Me and shows one step at a time', (await has(page, '#view .setup-card')) && (await page.$$eval('#view .setup-card .setup-it', (x) => x.length)) === 1);
  await go(page, 'home');
  /* Version 39.3: "yoga" finds the moves first and "khana" My food first, each with the plan; "BMI" finds the plan first */
  { const yo = await careSearch(page, 'yoga'), kh = await careSearch(page, 'khana'), bm = await careSearch(page, 'bmi');
    /* the V39.3 review (FOOD-11): "BMI" opens My body first, with the plan */
    check('11 search: "yoga" finds the moves, "khana" My food, "BMI" My body, each with the plan', yo[0] === 'plan-moves' && yo.indexOf('plan-pmos') >= 0 && kh[0] === 'food' && kh.indexOf('plan-pmos') >= 0 && bm[0] === 'plan-body' && bm.indexOf('plan-pmos') >= 0, [yo, kh, bm]); }
  check('11 search: "pcod" still finds the PMOS self-check or guide first', ['selfcheck', 'cond', 'explain'].includes((await careSearch(page, 'pcod'))[0]), await careSearch(page, 'pcod'));
  check('11 search: "plan" still finds the pregnancy plan first', (await careSearch(page, 'plan'))[0] === 'preg-plan', await careSearch(page, 'plan'));
  check('11 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 12. The doctor summary and "Ask Qura to call me" (a real diary: samples never see the call form) ---------- */
{
  const { ctx, page, errs } = await open();
  const log = {}; for (let i = 24; i >= 1; i--) log[ago(i)] = { min: 15, plate: { half: i % 3 !== 0 }, str: i % 7 === 3 && i < 18 };
  await setPlan(page, started({ start: ago(24), level: 0, log: log, body: [{ d: ago(24), h: 158, w: 66.4, waist: 86 }, { d: ago(3), h: 158, w: 65.8, waist: 85 }], height: 158 }));
  const sec = await page.evaluate(() => (window.Saathi.summaries().find((m) => m.mod === 'plan') || {}).sections);
  const lines = (sec && sec[0] && sec[0].lines) || [];
  check('12 the summary: her week, minutes, strength, food habits and body notes', /Week 4 of 12, started/.test(lines[0]) && lines.some((l) => /Active minutes: about 105 a week over the last 3 weeks \(target now 80\)/.test(l)) && lines.some((l) => /Strength: [\d.]+ days a week/.test(l)) && lines.some((l) => /Food habits kept: \d of the last 7 days/.test(l)) && lines.some((l) => /weight 66\.4 → 65\.8 kg, waist 86 → 85 cm, BMI 26\.4/.test(l)), lines);
  await go(page, 'ask-call'); await settle(page, 600);
  if (await has(page, '[data-ac-sec="tools"]')) {
    await page.$eval('[data-ac-sec="tools"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(page, 300);
    const prev = await page.$eval('#ac-preview', (e) => e.innerText);
    check('12 ticking "tools" sends her plan to the doctor', /PMOS plan: Week 4 of 12/.test(prev) && /weight 66\.4 → 65\.8 kg/.test(prev), prev.slice(0, 800));
  } else check('12 the call form shows her sections', false, (await view(page)).slice(0, 300));
  await go(page, 'report');
  check('12 her report for any doctor includes the plan', /PMOS plan: Week 4 of 12/.test(await view(page)));
  check('12 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 13. Hindi, and nothing sent from the plan ---------- */
{
  const { ctx, page, errs } = await open({ sample: 'priya', lang: 'hi', hash: '#plan-pmos' });
  await page.evaluate(() => { const S = window.Saathi; S.state.lang = 'hi'; S.save(); S.render(); }); await settle(page, 300);
  const raw = [];
  for (const r of ['plan', 'plan-pmos', 'plan-plate', 'plan-body', 'plan-moves', 'plan-progress', 'plan-r-cycle']) {
    await go(page, r); const v = await view(page);
    if (/plan_[a-z0-9_]+/.test(v)) raw.push(r + ': ' + v.match(/plan_[a-z0-9_]+/)[0]);
    if (r === 'plan') check('13 Hindi: My plan is her plan', /मेरा PMOS प्लान/.test(v) && /12 में से हफ़्ता 4/.test(v) && /आपके 12 हफ़्ते/.test(v), v.slice(0, 300));
    if (r === 'plan-pmos') check('13 Hindi: the plan\'s title and week', /मेरा PMOS प्लान/.test(v) && /12 में से हफ़्ता 4/.test(v), v.slice(0, 200));
    if (r === 'plan-plate') check('13 Hindi: the plate and her region\'s foods', /मेरी थाली/.test(v) && /उत्तर भारत से/.test(v) && /बाजरे या मक्के की रोटी/.test(v), v.slice(0, 400));
    if (r === 'plan-r-cycle') { await tap(page, '#pl-pstart'); await tap(page, '#pl-next'); check('13 Hindi: pose names in Devanagari', /शशांकासन/.test(await view(page)), (await view(page)).slice(0, 200)); await shot(page, 'player-hi'); }
    if (r === 'plan-pmos') await shot(page, 'hub-hi');
    if (r === 'plan') await shot(page, 'plans-hi');
  }
  check('13 Hindi: no raw string keys', !raw.length, raw);
  check('13 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const src = fs.readFileSync(path.join(root, 'mods', 'plan.js'), 'utf8');
  check('13 the module never touches the network (MODULE_API section 24)', !/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.share|import\s*\(/.test(src));
  const words = await (async () => { const { ctx, page } = await open(); const w = await page.evaluate(() => ['en', 'hi'].map((l) => Object.keys(window.Saathi.strings[l]).filter((k) => k.indexOf('plan_') === 0).map((k) => window.Saathi.strings[l][k]).join(' ')).join(' ')); await ctx.close(); return w; })();
  check('13 the plan\'s words: no calories, no "obese" or "overweight", no weight target', !/calorie|kcal|obese|overweight|ideal weight|lose \d+ ?kg/i.test(words));
}

/* ---------- 14. Version 36: the Plans tab, and what her diary suggests ---------- */
const recIds = (page) => gos(page, '#view .pl-sec .pl-rec');
const recWhy = (page) => page.$$eval('#view .pl-sec .pl-rec', (b) => b.map((x) => (x.querySelector('.pl-why') || {}).innerText || ''));
/* regular 28-day cycles, heavy flow in two of the last three periods */
const heavyEvents = () => [70, 42, 14].map((x, i) => ({ d: ago(x), t: 'start', pads: i ? 'pads_4' : 'pads_2', clots: 'clots_0', pain: 'pain_1' })).concat([70, 42, 14].map((x) => ({ d: ago(x - 5), t: 'end' })));
{
  /* she has PMOS: the PMOS plan first, because she said so; one painful period brings the cramps routine */
  const { ctx, page, errs } = await open({ hash: '#plan' });
  let v = await view(page);
  check('14 My plan with no plan going: its heading, "What do you want to work on?" first, no back button, the tab lit', /^My plan/.test(v) && (await has(page, '#view [data-pl-pick]')) && !(await has(page, '#view .backrow, #view [data-back]')) && (await has(page, '#tabbar [data-go="plan"].on')), v.slice(0, 200));
  let ids = await recIds(page); let why = await recWhy(page);
  check('14 PMOS: her plan is suggested first, because she told Sakhi', ids[0] === 'plan-pmos' && /You told Sakhi you have PMOS/.test(why[0]), [ids, why]);
  check('14 one period that needed a painkiller suggests the cramps routine, with the reason', ids.includes('relief-cramps') && why.some((w) => /You needed a painkiller in 1 of your last 3 periods/.test(w)), [ids, why]);
  /* Version 39.2: the 21-day journeys stop being programmes; More plans holds the routines and tools */
  check('14 more plans are listed under More plans, and no 21-day journey', (await gos(page, '#view .pl-sec .list [data-go]')).length > 0 && !(await gos(page, '#view [data-go]')).some((r) => /^journey-/.test(r)));
  await shot(page, 'plans-en');
  await setPlan(page, started({ start: ago(10) })); await go(page, 'plan');
  v = await view(page);
  check('14 a started plan: My plan is the plan itself, with its week, minutes and 12-week path', /^My PMOS plan/.test(v) && /Week 2 of 12/i.test(v) && (await has(page, '#view .pl-path')) && !(await recIds(page)).includes('plan-pmos'), v.slice(0, 400));
  await go(page, 'plan-pmos');
  check('14 the PMOS plan\'s back button goes to the Plans page', (await page.$eval('#view .backrow [data-back]', (b) => b.dataset.back).catch(() => '')) === 'plan' && (await has(page, '#tabbar [data-go="plan"].on')));
  await go(page, 'plan-plate');
  check('14 its pages go back to the PMOS plan', (await page.$eval('#view .backrow [data-back]', (b) => b.dataset.back).catch(() => '')) === 'plan-pmos');
  check('14 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  /* long gaps, no diagnosis: never "you have PMOS". Version 39.1 (journey audit): the self-check is a check, not a plan, so it is
     offered on the long-gap card in Diary's What it shows ("Check the signs"), never as "A plan for you" */
  const { ctx, page, errs } = await open({ seed: { situation: {} }, hash: '#plan' });
  const ids = await recIds(page);
  check('14 long gaps without a diagnosis: the PMOS self-check is not offered as a plan (Version 39.1)', !ids.includes('selfcheck-pmos'), ids);
  check('14 ... and nothing says she has PMOS', !/You told Sakhi you have PMOS|matched PMOS/.test(await view(page)) && !ids.includes('plan-pmos'), ids);
  await go(page, 'diary'); await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(page, 400);
  check('14 ... her long gaps offer "Check the signs" (the PMOS self-check) in What it shows', (await gos(page, '#view [data-xp-check]')).includes('selfcheck-pmos'), await gos(page, '#view [data-xp-check]'));
  await go(page, 'home');
  check('14 Home: no "A plan for you" brings a self-check', !(await gos(page, '#view .pl-homerec [data-go]')).includes('selfcheck-pmos'));
  check('14 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  /* Home's "A plan for you": "Not now" for 2 weeks, and none on a shared phone (a diary with a plan to suggest) */
  const { ctx, page, errs } = await open({ seed: { situation: { pcos: true }, events: heavyEvents() }, hash: '#home' });
  check('14 Home: "A plan for you" (in Sakhi says)', /A plan for you/i.test(await page.$eval('#view .slot .pl-homerec', (e) => e.textContent).catch(() => '')));
  await tap(page, '#pl-rec-not');
  check('14 "Not now" puts the Home card away for 2 weeks', !(await has(page, '#view .pl-homerec')) && (await page.evaluate(() => window.Saathi.state.prompts.planRec)) === TODAY);
  await page.evaluate((d) => { const S = window.Saathi; S.state.prompts.planRec = d; S.save(); }, ago(15)); await go(page, 'learn'); await go(page, 'home');
  check('14 after 2 weeks the card comes back', await has(page, '#view .pl-homerec'));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('14 discreet mode: no plan card on Home', !(await has(page, '#view .pl-homerec')));
  await go(page, 'plan');
  check('14 discreet mode: the Plans page hides the reasons from her diary', !(await page.$$eval('#view .pl-why', (x) => x.length)) && !/Heavy flow in 2 of your last 3 periods/.test(await view(page)));
  check('14 no page errors (Home card)', !errs.length, errs);
  await ctx.close();
}
{
  /* a tester build holds the triage tools back: no self-check is suggested there */
  const { ctx, page, errs } = await open({ cfg: { api: 'https://api.test.invalid', app: '0.36-test', platform: 'android' }, seed: { situation: {} }, hash: '#plan' });
  check('14 a tester build never suggests a held-back tool (the self-check)', !(await gos(page, '#view [data-go]')).includes('selfcheck-pmos'), await gos(page, '#view [data-go]'));
  check('14 no page errors (tester build)', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { situation: {}, events: heavyEvents() }, hash: '#plan' });
  const ids = await recIds(page); const why = await recWhy(page);
  /* Version 39.2 (journey audit J-11): her heavy flow marks the "Heavy periods" goal as Suggested; no 21-day journey */
  check('14 heavy periods: the Heavy periods goal is "Suggested", because of her heavy flow', /Suggested/.test(await page.$eval('#view [data-pl-pick="heavy"]', (e) => e.innerText).catch(() => '')) && !ids.includes('journey-iron'), [ids, why]);
  check('14 no page errors (heavy)', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(120) }, events: [] }, hash: '#plan' });
  const ids = await recIds(page); const all = await gos(page, '#view [data-go]');
  check('14 pregnant: her pregnancy plan first, iron tablets next, and no PMOS plan anywhere', ids[0] === 'preg-plan' && ids.includes('iron') && !all.includes('plan-pmos') && !all.includes('relief-cramps'), [ids, all]);
  check('14 no page errors (pregnant)', !errs.length, errs);
  await ctx.close();
}
{
  /* Version 39.2: "My PMOS plan" is listed for a woman with PMOS (for others it is her PMOS goal) */
  const { ctx, page, errs } = await open({ seed: { situation: { deliveredOn: ago(21), breastfeeding: true, pcos: true }, events: [] }, hash: '#plan' });
  const ids = await recIds(page); const v = await view(page);
  check('14 three weeks after a birth: recovery, then iron and the pelvic floor', ids[0] === 'post-recovery' && ids.includes('post-pelvic') && /Your baby was born 21 days ago/.test(v), [ids, v.slice(0, 500)]);
  check('14 ... and the PMOS plan waits in More plans until her 6-week check', /After your 6-week check/.test(await page.$eval('#view .pl-sec .list', (e) => e.innerText).catch(() => '')) && !ids.includes('plan-pmos'));
  check('14 no page errors (after birth)', !errs.length, errs);
  await ctx.close();
}
{
  const daily = {}; [2, 5, 9, 12].forEach((n) => { daily[ago(n)] = ['d_hotflush']; });
  const { ctx, page, errs } = await open({ seed: { dob: '1977-03-01', situation: { midlife: true }, events: [{ d: ago(50), t: 'start' }, { d: ago(45), t: 'end' }], daily: daily }, hash: '#plan' });
  const ids = await recIds(page); const why = await recWhy(page);
  check('14 40+ with hot flushes: the hot-flush routine first, because of her logs', ids[0] === 'relief-hot' && /You logged hot flushes on 4 days this month/.test(why[0]) && !(await gos(page, '#view [data-go]')).includes('plan-pmos'), [ids, why]);
  check('14 no page errors (40+)', !errs.length, errs);
  await ctx.close();
}
{
  /* Version 39.2 (journey audit J-11): one picker. "What you want help with" is gone; the goal her records point to is
     marked "Suggested" (here PMOS, from My situation) */
  const { ctx, page, errs } = await open({ hash: '#plan' });
  check('14 one picker: no "What you want help with"', !(await has(page, '#pl-help')) && (await has(page, '#view [data-pl-pick]')));
  check('14 PMOS (from My situation) is the suggested goal', /Suggested/.test(await page.$eval('#view [data-pl-pick="pmos"]', (e) => e.innerText).catch(() => '')));
  check('14 no page errors (help)', !errs.length, errs);
  await ctx.close();
}
{
  /* Home's card waits while the setup card's step is the plan, and while a plan is going */
  const { ctx, page, errs } = await open({ seed: { prompts: { notifyIntro: ago(3) } } });
  const shows = await page.evaluate(() => window.Saathi.setupShows('plan'));
  check('14 the PMOS suggestion and the setup step never both offer the plan', shows ? !(await has(page, '#view .pl-homerec')) : (await has(page, '#view .pl-homerec')), shows);
  await page.evaluate(() => { const S = window.Saathi; S.state.prompts.setup = 'off'; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('14 with the setup card put away, Home suggests her plan', (await gos(page, '#view .pl-homerec .pl-rec'))[0] === 'plan-pmos');
  await setPlan(page, started()); await go(page, 'learn'); await go(page, 'home');
  check('14 with a plan going, no suggestion card on Home (Today has her plan)', !(await has(page, '#view .pl-homerec')) && (await has(page, '.today-plan-move')));
  check('14 no page errors (Home)', !errs.length, errs);
  await ctx.close();
}
{
  /* Version 37: no Plans row in Explore (My plan is a tab); the tab shows her suggestions when no plan is going */
  const { ctx, page, errs } = await open({ hash: '#care' });
  check('14 Explore has no Plans row (My plan is a tab)', !(await has(page, '#view .care-plans')));
  await go(page, 'plan');
  check('14 My plan lists her 2 suggestions under the goal picker', (await recIds(page)).length === 2 && (await has(page, '#view [data-pl-pick]')));
  check('14 no page errors (Care)', !errs.length, errs);
  await ctx.close();
}

/* ---------- 15. Version 36: the plan's audit fixes ---------- */
{
  const { ctx, page, errs } = await open();
  await setPlan(page, started()); await go(page, 'plan-pmos');
  const r0 = await page.evaluate(() => (window.Saathi.plan.actions().find((x) => x.id === 'yoga') || {}).r);
  await page.evaluate((r) => { const S = window.Saathi; S.state.mods.plan.log['2026-10-23'] = { r: [r] }; S.save(); S.render(); }, r0); await settle(page, 300);
  check('15 today\'s routine done: her step says so (Version 39.15: ticked on My plan)', (await has(page, '#view .pl-steps-card .today-ok .today-tick.on')) && /1 of \d done today/.test(await page.$eval('#view .pl-steps-card', (e) => e.innerText)), await page.$eval('#view .pl-steps-card', (e) => e.innerText).catch(() => ''));
  check('15 the routine row names the routine once (no "yoga: ... yoga")', !/yoga.*:.*yoga/i.test(await page.$eval('#view .pl-steps-card .today-ok .body strong', (e) => e.innerText).catch(() => '')));
  await go(page, 'plan-settings');
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.notify = false; S.reminders.upsert({ id: 'plan', mod: 'plan', title: { en: 'Your plan for today', hi: 'आज का आपका प्लान' }, start: '2026-10-23', every: 1, time: '18:00', on: true }); S.save(); S.render(); }); await settle(page, 300);
  check('15 the reminder is on but phone notifications are off: it says so, with a button', /Phone notifications are off for Sakhi/.test(await view(page)) && (await has(page, '#pl-notif')));
  await tap(page, '#pl-notif'); await settle(page, 600);
  check('15 the button turns notifications on and the warning goes', (await page.evaluate(() => window.Saathi.state.settings.notify)) === true && !(await has(page, '#pl-notif')));
  await settle(page, 1200);
  const rings = await page.evaluate(() => JSON.parse(window.__sched || '[]').filter((x) => /^r-plan-/.test(String(x.id))));
  check('15 a tap on the plan\'s reminder opens its evening check-in (Version 37.2; it opened the PMOS page, and before that the reminders list)', rings.length > 0 && rings.every((x) => x.go === 'plan-checkin'), rings.slice(0, 2));
  await setPlan(page, started({ start: ago(90), keep: true })); await go(page, 'home');
  check('15 after week 12, Home says "Keep it light" (Version 39.6), not "Week 12 of 12"', /keep it light/i.test(await page.$eval('#view .today-card .pl-th', (e) => e.innerText).catch(() => '')) && !/Week 12 of 12/.test(await page.$eval('#view .today-card', (e) => e.innerText).catch(() => '')));
  check('15 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  /* the routine's finishing words never scold */
  const words = await (async () => { const { ctx, page } = await open(); const w = await page.evaluate(() => window.Saathi.strings.en.plan_p_done_0 + ' | ' + window.Saathi.strings.hi.plan_p_done_0); await ctx.close(); return w; })();
  check('15 a routine done quickly still says "Routine done. Every move counts."', /^Routine done\. Every move counts\./.test(words) && !/Try the whole routine/.test(words), words);
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'OK: all ') + results.length + ' checks passed' + (failed.length ? '' : '') + '  (screenshots: test/shots/pmosplan)');
process.exit(failed.length ? 1 : 0);
