// Version 39.73, the Kegel trainer (Mohit, 6 Nov, after his phone walk of "Your Kegel sets": "Proceed"). The squeeze happens
// inside, so nothing on her body moves when it's done right ("Find the right muscles", line 3): the screen shows it instead.
// - 1 Get into position: her first sets begin from one card (her position, how many, the reviewed "Find the right muscles"
//     lines) with Start under it; from her 3rd set ever Today's play button starts the set at once, as before;
// - 2 in a set: the lift beside her rises over the squeeze and settles as she lets go (lighter), stops when paused; "Keep breathing
//     normally" under the phase word; lying framed on her and the mat; Pause and Stop reachable at 360 x 800, Hindi too;
// - 3 after a set: "Set done", then "Start set 2" straight under it; after her last set of the day, Start below her level;
// - 4 the count: two sets count 2 everywhere, and a set counts in her diary as it is when it ends (his phone lost one).
// Usage: node test/kegel.mjs [web dir]
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

/* SHOT=1 keeps the screens in test/shots/kegel/ (gitignored) */
const SHOT = process.env.SHOT ? path.join(here, 'shots', 'kegel') : ''; if (SHOT) fs.mkdirSync(SHOT, { recursive: true });
const shot = (page, name) => (SHOT ? page.screenshot({ path: path.join(SHOT, name + '.png') }) : null);
const reach = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s); if (!el) return { ok: false, why: 'none' };
  const r = el.getBoundingClientRect(); const bar = document.querySelector('.tabbar'); const top = bar ? bar.getBoundingClientRect().top : innerHeight;
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { ok: !!hit && (hit === el || el.contains(hit)) && r.bottom <= top + 1 && r.top >= 0, bottom: Math.round(r.bottom), bar: Math.round(top) };
}, sel);
const liftH = (page) => page.$eval('#pst-pbar', (i) => parseFloat(i.style.height) || 0).catch(() => -1);
const liftPh = (page) => page.$eval('#pst-plift', (l) => l.dataset.phase).catch(() => '');
const toPhase = async (page, re) => { for (let i = 0; i < 80 && !re.test(await txt(page, '#pst-pph')); i++) { await page.clock.runFor(250); await sleep(5); } return re.test(await txt(page, '#pst-pph')); };
const today = (page) => page.evaluate(() => (window.Saathi.state.mods.post && window.Saathi.state.mods.post.pf || {})[window.Saathi.toISO(window.Saathi.planToday ? window.Saathi.planToday() : window.Saathi.today())] || 0);

// ---------- 1 Get into position ----------
{
  let a = await open({ seed: pel(0) });
  await tap(a.page, '[data-today-nav]');
  const iv = await txt(a.page, '.pst-intro');
  check('1.1 her first set: Today\'s play button opens Get into position, not a running set', /#post-pelvic$/.test(a.page.url()) && await has(a.page, '.pst-intro') && !(await has(a.page, '#pst-pph')), a.page.url());
  check('1.2 one card: her position on the figure, her level, how many, and Find the right muscles with "Keep breathing normally"', await has(a.page, '.pst-intro #pst-fig') && /Level 1 of 8 · lying on your back, knees bent/i.test(iv) && /8 times: hold each 3 seconds/.test(iv) &&
    /Find the right muscles/.test(iv) && /stopping your wee and holding in wind/.test(iv) && /Keep breathing normally\. Don't pull in your tummy/.test(iv) && (await a.page.$$('.pst-intro .pst-in li')).length === 4, iv.slice(0, 500));
  await shot(a.page, '1-get-into-position');
  check('1.3 Start straight under it, and the lines live only in the card (one home)', await a.page.evaluate(() => { const c = document.querySelector('.pst-intro'); const s = document.querySelector('#pst-pstart'); return !!c && c.nextElementSibling === s; }) && (await a.page.$$('#view .pst-find')).length === 1);
  await tap(a.page, '#pst-pstart');
  check('1.4 Start begins the set', await has(a.page, '#pst-pph') && /Get ready/.test(await txt(a.page, '#pst-pph')));
  await done(a);
  a = await open({ seed: pel(9, { pf: { 1: 1 } }) });
  await tap(a.page, '[data-today-nav]');
  check('1.5 week 2, 1 set ever and none today: still Get into position', await has(a.page, '.pst-intro') && !(await has(a.page, '#pst-pph')));
  await done(a);
  a = await open({ seed: pel(3, { pf: { 1: 3 } }) });
  await tap(a.page, '[data-today-nav]');
  check('1.6 from her 3rd set ever, Today\'s play button starts the set at once, as before', await has(a.page, '#pst-pph') && !(await has(a.page, '.pst-intro')));
  await done(a);
}

// ---------- 2 in a set ----------
{
  let a = await open({ w: 360, h: 800, seed: pel(3, { pf: { 1: 3 } }), hash: '#post-pelvic' });
  check('2.1 lying, framed on her and the mat (2 : 1, no empty floor)', await a.page.$eval('.pst-lv .pst-fig-m', (m) => { const r = m.getBoundingClientRect(); return Math.abs(r.width / r.height - 2) < 0.08; }));
  await tap(a.page, '#pst-pstart');
  check('2.2 the trainer: her figure and the lift side by side', await has(a.page, '.pst-trainer .pst-stage #pst-fig') && await has(a.page, '.pst-trainer .pst-stage #pst-plift'));
  await toPhase(a.page, /Squeeze and lift/); await a.page.clock.runFor(600); await sleep(20); const s1 = await liftH(a.page);
  await a.page.clock.runFor(1600); await sleep(20); const s2 = await liftH(a.page);
  await shot(a.page, '2-squeeze');
  check('2.3 on "Squeeze and lift" the lift rises', (await liftPh(a.page)) === 'sq' && s2 > s1 && s1 > 0, [s1, s2]);
  await toPhase(a.page, /^Relax/); await a.page.clock.runFor(600); await sleep(20); const r1 = await liftH(a.page);
  await a.page.clock.runFor(1600); await sleep(20); const r2 = await liftH(a.page);
  const op = await a.page.$eval('#pst-pbar', (i) => +getComputedStyle(i).opacity);
  await shot(a.page, '3-relax');
  check('2.4 on "Relax" it settles, lighter', (await liftPh(a.page)) === 'rel' && r2 < r1 && op < 1, [r1, r2, op]);
  check('2.5 "Keep breathing normally" under the phase word', /^Keep breathing normally$/.test(await txt(a.page, '.pst-trainer .pst-breathe')) && await a.page.evaluate(() => document.querySelector('#pst-pph').nextElementSibling.classList.contains('pst-breathe')));
  await tap(a.page, '#pst-ppause'); const p1 = await liftH(a.page); await a.page.clock.runFor(2000); await sleep(20); const p2 = await liftH(a.page);
  check('2.6 Pause stops the lift', p1 === p2, [p1, p2]);
  for (const sel of ['#pst-ppause', '#pst-pstop']) check('2.7 at 360 × 800, ' + sel + ' sits above the tab bar, tappable', (await reach(a.page, sel)).ok, await reach(a.page, sel));
  check('2.8 no sideways scroll', await noScroll(a.page));
  await done(a);
  a = await open({ seed: pel(10, { pf: days(1, 10) }), hash: '#post-pelvic' });
  check('2.9 sitting keeps its full frame (6 : 5)', await a.page.$eval('.pst-lv .pst-fig-m', (m) => { const r = m.getBoundingClientRect(); return Math.abs(r.width / r.height - 1.2) < 0.08; }));
  await done(a);
  a = await open({ w: 360, h: 800, seed: Object.assign(pel(3, { pf: { 1: 3 } }), { lang: 'hi' }), hash: '#post-pelvic' });
  await tap(a.page, '#pst-pstart');
  check('2.10 Hindi: "साँस आम तरह से लेती रहें" in the set, Pause reachable, no sideways scroll', /साँस आम तरह से लेती रहें/.test(await txt(a.page, '.pst-breathe')) && (await reach(a.page, '#pst-ppause')).ok && await noScroll(a.page));
  await done(a);
  a = await open({ w: 360, h: 800, seed: Object.assign(pel(0), { lang: 'hi' }), hash: '#post-pelvic' });
  check('2.11 Hindi Get into position at 360 px: the card and Start fit', await has(a.page, '.pst-intro') && await has(a.page, '#pst-pstart') && await noScroll(a.page) && /सही मांसपेशियाँ पहचानें/.test(await txt(a.page, '.pst-intro')));
  await done(a);
}

// ---------- 3 after a set, and 4 the count ----------
{
  const a = await open({ seed: pel(3, { pf: { 1: 3 } }), hash: '#post-pelvic', hm: '12:40' });
  await tap(a.page, '#pst-pstart'); await runSet(a.page);
  const order = () => a.page.evaluate(() => { const ok = document.querySelector('#view .card.ok'); const s = document.querySelector('#pst-pstart'); const lv = document.querySelector('#view .pst-lv');
    return { next: !!ok && ok.nextElementSibling === s, beforeLv: !!(s && lv && (s.compareDocumentPosition(lv) & Node.DOCUMENT_POSITION_FOLLOWING)), label: s ? s.innerText.trim() : '' }; });
  const o1 = await order();
  await a.page.setViewportSize({ width: 360, height: 800 }); await settle(a.page, 200); await shot(a.page, '4-set-done');
  check('3.1 "Set done: 1 of 3", then "Start set 2" straight under it, before her level', /Set done: 1 of 3 today/.test(await txt(a.page, '#view .card.ok')) && o1.next && o1.beforeLv && o1.label === 'Start set 2', o1);
  await tap(a.page, '#pst-pstart'); await runSet(a.page);
  check('4.1 two sets count 2: the trainer, her diary, My plan\'s step and Today\'s ticks', /Set done: 2 of 3 today/.test(await txt(a.page, '#view .card.ok')) && (await today(a.page)) === 2 &&
    (await a.page.$$('#view .pst-tick.on')).length === 2 && (await acts(a.page))[0].sub.indexOf('2 of 3 today') === 0, [await txt(a.page, '#view .card.ok'), await today(a.page), (await acts(a.page))[0].sub]);
  check('3.2 then "Start set 3"', (await order()).label === 'Start set 3');
  /* his phone lost a finished set: here her diary's trainer data is replaced while a set runs, and the set still counts in it */
  await tap(a.page, '#pst-pstart'); await toPhase(a.page, /Squeeze and lift/);
  await a.page.evaluate(() => { const S = window.Saathi; S.state.mods.post = JSON.parse(JSON.stringify(S.state.mods.post)); });
  await runSet(a.page);
  check('4.2 a set counts in her diary as it is when the set ends', (await today(a.page)) === 3 && /Set done: 3 of 3 today/.test(await txt(a.page, '#view .card.ok')), [await today(a.page), await txt(a.page, '#view .card.ok')]);
  const o3 = await order();
  check('3.3 after her last set of the day, Start ("Start a set") sits below her level, as before', o3.label === 'Start a set' && !o3.next && !o3.beforeLv, o3);
  const saved = await a.page.evaluate(() => JSON.parse(localStorage.getItem('qura-saathi-v1')).mods.post.pf);
  check('4.3 and it is saved', saved[TODAY] === 3, saved);
  await done(a);
}

await browser.close();
check('no page errors', !errsAll.length, errsAll);
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' Kegel trainer checks passed');
if (failed.length) process.exit(1);
