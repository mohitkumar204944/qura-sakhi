// Version 39.10: joining that personalises Sakhi (MODULE_API section 53; Mohit, 25 Oct). For each of the 7 stages, in English
// and in Hindi, on a 360 x 800 phone: joining end to end (about you, her stage, up to 3 goals, a few details, who uses this
// phone, sign-up), "Your Sakhi" and its short tour, her first log in Diary, and her plan offered on Today only after it (her
// first goal chooses the plan). Also: goals capped at 3, numbered, "Just tracking" on its own, period pain, heavy periods and
// mood before periods under both period tiles; other stages' topics and chapters out of Explore and Learn but found by search;
// Help, 112, "someone hurting you" and pregnancy loss within 2 taps of any screen, STIs and abortion within 2 taps of Explore;
// Today at 3 steps or fewer; a shared phone (plain words: no "Your Sakhi", no first-log card, no plan offer); a girl under 18
// (reading, no account); a woman who joined before Version 39.10 (asked once on Today); no page errors, no sideways scroll and
// no untranslated keys on any of these screens.
// Usage: node test/joining.mjs [dir]   (dir defaults to this app folder). Screens go to test/shots/joining/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'joining'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dayISO = (n) => { const d = new Date(Date.now() - n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const LOCAL = { app: '0.39.10-pilot', platform: 'android' };   /* no server address: the stand-in server (code 123456); a pilot build has every tool */
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Meera', pincode: '302001', activeOn: dayISO(0) };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: dayISO(30) }]));

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  if (o.seed) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(o.seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, errs };
}
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.$eval(sel, (el) => el.click()); await sleep(250); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const view = (page) => page.$eval('#view', (e) => e.innerText).catch(() => '');
const hashOf = (page) => page.evaluate(() => location.hash);
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await sleep(500); };
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const KEYS = /\b(ob|ys|fl|fx|td|fd|plan_off|tour)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const fits = async (page) => (await noScroll(page)) && !KEYS.test(await view(page));
const todayRows = (page) => page.$$eval('#view .today-card .today-it', (x) => x.length).catch(() => 0);
const slotFirst = (page) => page.$eval('#view .slot', (s) => (s.children[1] || {}).className || '').catch(() => '');
/* Version 39.62 (phase D): her topics are in the library, one row from Explore */
const topics = async (page) => { if (!(await has(page, '#view .topic-grid'))) await go(page, 'library'); return page.$$eval('#view .topic-grid [data-go]', (x) => x.map((y) => y.dataset.go.replace('topic-', ''))); };
const search = async (page, q) => { await go(page, 'care'); await page.evaluate((x) => { window.Saathi.mem.careQ = x; window.Saathi.render(); }, q); await sleep(300); const r = await page.$$eval('#view section.care-sec [data-go]', (x) => x.map((y) => y.dataset.go)); await page.evaluate(() => { window.Saathi.mem.careQ = ''; }); return r; };
const closeTips = async (page) => { for (let k = 0; k < 6; k++) { const did = await page.evaluate(() => { const b = document.querySelector('#tour-root #tour-later, #tour-root #tour-next'); if (b) { b.click(); return true; } return false; }); if (!did) break; await sleep(300); } };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
/* sign-up on the stand-in server: her name is filled in from joining; she adds her PIN code */
async function signUp(page) {
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 8000 });
  if (await has(page, '#su-done')) { await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); }
  await sleep(700);
}
/* her plan's own questions, to its cards (answers she already gave are kept) */
async function answer(page) {
  for (let i = 0; i < 10; i++) {
    if ((await hashOf(page)) === '#plan-reveal') return;
    if (await has(page, '#pl-in-make')) { await tap(page, '#pl-in-make'); await sleep(400); continue; }
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="dinner"]'); continue; }
    if (await has(page, '#pl-in-skip')) { await tap(page, '#pl-in-skip'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); if (await has(page, '[data-pl-' + kind + '^="' + k + ':"].on')) continue; await tap(page, '[data-pl-' + kind + '^="' + k + ':"]'); }
    await tap(page, '#pl-in-next');
  }
}
const stageOf = (s) => { const x = s.situation || {}; return x.pregnant ? 'preg' : (x.deliveredOn ? 'post' : (x.planning ? 'ttc' : (x.midlife ? 'meno' : 'cycle'))); };

/* each tile: her goals (first one first), her details, the stage Sakhi runs, how her first log is made, what Explore leaves out,
   a search for another stage's pages, the Learn chapters she doesn't see, and whether abortion is a topic of hers */
const OTHER_PREG = /^(preg(-|$)|a-pregnancy\.)/, OTHER_MENO = /^(meno(-|$)|midlife$|a-midlife\.)/;
const STAGES = [
  { tile: 'cycle', goals: ['pain', 'heavy', 'pms'], st: 'cycle', log: 'save', hide: ['preg', 'post', 'meno'], q: 'pregnancy', qr: OTHER_PREG, noCh: ['pregnancy', 'midlife'], abort: true },
  { tile: 'pmos', goals: ['irregular', 'weight', 'skin'], dx: 'y', st: 'cycle', log: 'save', hide: ['preg', 'post', 'meno'], q: 'pregnancy', qr: OTHER_PREG, noCh: ['pregnancy', 'midlife'], abort: true },
  { tile: 'ttc', goals: ['ready', 'weight'], st: 'ttc', log: 'save', hide: ['preg', 'post', 'meno'], q: 'menopause', qr: OTHER_MENO, noCh: ['pregnancy', 'midlife'], abort: true },
  { tile: 'preg', goals: ['nausea', 'food'], lmp: dayISO(100), st: 'preg', log: 'go', hide: ['meno', 'ttc', 'pregtest'], q: 'menopause', qr: OTHER_MENO, noCh: ['cycle', 'pmos', 'midlife'], abort: false },
  { tile: 'post', goals: ['recovery', 'feed'], birth: dayISO(30), bf: 'yes', st: 'post', log: 'go', hide: ['preg', 'meno', 'ttc'], q: 'menopause', qr: OTHER_MENO, noCh: ['midlife', 'pmos'], abort: true },
  { tile: 'mid', goals: ['hot', 'sleep'], dec: 1970, y: 1978, st: 'meno', log: 'save', hide: ['preg', 'post', 'ttc'], q: 'pregnancy', qr: OTHER_PREG, noCh: ['pregnancy', 'conceive'], abort: true },
  { tile: 'meno', goals: ['hot', 'bones'], dec: 1960, y: 1968, mp: '2', st: 'meno', log: 'go', hide: ['preg', 'post', 'ttc'], q: 'pregnancy', qr: OTHER_PREG, noCh: ['pregnancy', 'conceive'], abort: true }
];

/* ---------- 1. Every stage, in English and in Hindi, from joining to her plan's questions ---------- */
for (const lang of ['en', 'hi']) for (const S of STAGES) {
  const tag = S.tile + ' (' + lang + ')';
  const { ctx, page, errs } = await open({ lang });
  const screens = [];
  await join(page, { lang, name: 'Asha', tile: S.tile, goals: S.goals, dec: S.dec, y: S.y, dx: S.dx, lmp: S.lmp, birth: S.birth, bf: S.bf, mp: S.mp, stop: 'share', onScreen: async (n) => { screens.push([n, await fits(page)]); } });
  check(tag + ': 6 joining screens (about you, stage, goals, details, where she gets care, this phone), each fits 360 px with no untranslated words', screens.length === 6 && screens.every((x) => x[1]), screens);
  await tap(page, '[data-ob-sh="me"]'); await signUp(page);
  let s = await st(page); const g1 = S.dx === 'y' && S.goals[0] === 'irregular' ? 'pmos' : S.goals[0];
  check(tag + ': joining saved her stage, her goals in order, and no plan yet', stageOf(s) === S.st && s.focus && s.focus.tile === S.tile && JSON.stringify(s.focus.goals) === JSON.stringify(S.goals) && s.intake.goal === g1 && !(s.mods.plan || {}).next && !(s.mods.plan || {}).start && !!(s.prompts || {}).planOffer, [stageOf(s), s.focus, s.intake, s.prompts]);
  if (S.dx === 'y') check(tag + ': "a doctor said PMOS" is kept, and names her goal', s.situation.pcos === true && s.goals.indexOf('pmos') === 1, [s.situation, s.goals]);
  const ys = await view(page);
  check(tag + ': "Your Sakhi" greets her by name, with 3 rows and what stays out of her way', (await hashOf(page)) === '#your-sakhi' && /Asha/.test(ys) && (await page.$$('#view .ys-rows .item')).length === 3 && await has(page, '#view .ys-hid') && await fits(page), ys.slice(0, 300));
  check(tag + ': no tabs on "Your Sakhi"', await page.$eval('#tabbar', (e) => e.hidden || !e.offsetHeight).catch(() => true));
  await shot(page, S.tile + '-' + lang + '-1-your-sakhi');
  if (lang === 'en') {
    await tap(page, '#ys-tour'); let n = 0;
    for (let k = 0; k < 5; k++) { await page.waitForSelector('#tour-root #tour-next', { timeout: 4000 }).catch(() => null); if (!(await has(page, '#tour-root #tour-next'))) break; n++; await tap(page, '#tour-root #tour-next'); await sleep(450); }
    check(tag + ': "Show me around": 3 steps on Today, ending in Diary', n === 3 && (await hashOf(page)) === '#diary', [n, await hashOf(page)]);
  } else {
    await tap(page, '#ys-skip'); await sleep(400);
    check(tag + ': "Skip the tour" goes to Today', (await hashOf(page)) === '#home');
  }
  await go(page, 'home'); await closeTips(page);
  const po = !!(await page.evaluate(() => (window.Saathi.state.prompts || {}).planOffer));   /* Version 39.61 (phase C): her first log no longer holds her plan back */
  check(tag + ': Today: her plan offered from the start when her goal has one, 3 steps or fewer', (await has(page, '#pl-off-go')) === po && (await todayRows(page)) <= 3 && await fits(page), [po, await todayRows(page)]);
  await go(page, 'diary'); await closeTips(page);
  check(tag + ': Diary opens on her first log, with 3 reasons to log every day', await has(page, '#fl-card') && (await page.$$('#fl-card .fl-why .item')).length === 3 && await fits(page), (await view(page)).slice(0, 300));
  await shot(page, S.tile + '-' + lang + '-2-first-log');
  if (S.log === 'save') {
    if (await has(page, '[data-fl-days="5"]')) await tap(page, '[data-fl-days="5"]');
    await tap(page, '[data-fl-sign="d_tired"]'); await tap(page, '#fl-save'); await sleep(400);
    s = await st(page);
    check(tag + ': her first log saved, with today\'s sign', !!s.prompts.firstLog && (s.daily[dayISO(0)] || []).indexOf('d_tired') >= 0, [s.prompts, s.daily]);
  } else {
    const to = await page.$eval('[data-fl-go]', (b) => b.dataset.flGo); await tap(page, '[data-fl-go]'); await sleep(400);
    check(tag + ': her first log opens her stage\'s own page', (await hashOf(page)) === '#' + to && !!(await st(page)).prompts.firstLog, [to, await hashOf(page)]);
  }
  await go(page, 'diary');
  check(tag + ': the first-log card has gone', !(await has(page, '#fl-card')));
  await go(page, 'home'); await closeTips(page);
  check(tag + ': then Today offers her plan, first in "Sakhi says", with 3 steps or fewer', /pl-offer/.test(await slotFirst(page)) && (await todayRows(page)) <= 3 && await fits(page), [await slotFirst(page), await todayRows(page)]);
  await shot(page, S.tile + '-' + lang + '-3-today-offer');
  /* Explore and Learn: her stage only; search still finds the rest */
  await go(page, 'care'); const exFits = await fits(page); const tp = await topics(page);
  check(tag + ': Explore shows her stage\'s topics only, with no "All topics" (Version 39.62: in the library)', S.hide.every((x) => tp.indexOf(x) < 0) && tp.indexOf('intimate') >= 0 && !(await has(page, '#topics-all')) && exFits && await fits(page), tp);
  const found = await search(page, S.q);
  check(tag + ': search still finds another stage\'s pages ("' + S.q + '")', found.some((x) => S.qr.test(x)), found.slice(0, 8));
  await go(page, 'learn'); const ch = await page.$$eval('#view .tabs [data-g]', (x) => x.map((y) => y.dataset.g));
  check(tag + ': Learn leaves out other stages\' chapters', ch.length > 1 && S.noCh.every((x) => ch.indexOf(x) < 0), ch);
  /* safety within 2 taps */
  await tap(page, '#help-btn');
  check(tag + ': Help (1 tap) holds 112, "someone hurting you" and pregnancy loss', await has(page, '#sheet-root #hs-sos') && await has(page, '#sheet-root #hs-harm') && await has(page, '#sheet-root #hs-loss'));
  await tap(page, '#sheet-root #hs-loss'); await sleep(300);
  check(tag + ': pregnancy loss in 2 taps', (await hashOf(page)) === '#loss');
  await go(page, 'topic-intimate');
  check(tag + ': STIs and safety in 2 taps of Explore (Intimate health)', await has(page, '#view [data-go="intimate-sti"]') && await has(page, '#view [data-go="intimate-safety"]'));
  if (S.abort) { await go(page, 'topic-pregtest'); check(tag + ': abortion from her Missed period topic (in the library)', tp.indexOf('pregtest') >= 0 && await has(page, '#view [data-go="pregtest-abortion"]'), tp);
    /* Version 39.62 (phase D; PLACES-05): and 2 taps from every screen, through Help */
    await tap(page, '#help-btn'); check(tag + ': abortion in 2 taps (Help, then the page)', await has(page, '#sheet-root .hs-priv [data-hs-go="pregtest-abortion"]')); await page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await sleep(200); }
  else { const ab = await search(page, 'abortion'); check(tag + ': abortion found by search', ab.indexOf('pregtest-abortion') >= 0, ab.slice(0, 6)); }
  /* the plan for her first goal (English runs: through its questions to its cards) */
  if (lang === 'en') {
    await go(page, 'home'); await tap(page, '#pl-off-go'); await sleep(300);
    check(tag + ': "See my plan" opens her plan\'s own questions, not a goal picker', (await hashOf(page)) === '#plan-goal' && !(await has(page, '[data-pl-goal]')), await hashOf(page));
    await answer(page);
    s = await st(page); const d = s.mods.plan || {}; const nx = d.next || d;
    check(tag + ': her first goal chose the plan', (await hashOf(page)) === '#plan-reveal' && (nx.goalKey === g1 || JSON.stringify(d).indexOf('"goalKey":"' + g1 + '"') >= 0), [await hashOf(page), nx.goalKey, nx.pack]);
  }
  check(tag + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. Goals: up to 3, numbered; "Just tracking" alone; pain, heavy and mood before periods under both period tiles ---------- */
{
  const { ctx, page, errs } = await open();
  await join(page, { name: 'Asha', tile: 'pmos', stop: 'goals' });
  const pm = await page.$$eval('[data-ob-goal]', (x) => x.map((y) => y.dataset.obGoal));
  for (const g of ['irregular', 'weight', 'skin', 'pms']) await tap(page, '[data-ob-goal="' + g + '"]');
  let on = await page.$$eval('[data-ob-goal].on', (x) => x.map((y) => y.dataset.obGoal));
  check('goals: a 4th pick is refused, with a line saying why', on.length === 3 && on.indexOf('pms') < 0 && /Up to 3/.test(await page.$eval('.toast', (e) => e.innerText).catch(() => '')), on);
  check('goals: numbered 1, 2, 3 in the order she picked', JSON.stringify(await page.$$eval('[data-ob-goal].on .ob-tick', (x) => x.map((y) => y.innerText.trim()))) === '["1","2","3"]');
  check('goals: Continue says how many', /3 picked/.test(await page.$eval('#ob-next', (e) => e.innerText)));
  await tap(page, '[data-ob-goal="irregular"]');
  check('goals: tapping one again takes it off, and the others move up', JSON.stringify(await page.$$eval('[data-ob-goal].on .ob-tick', (x) => x.map((y) => y.innerText.trim()))) === '["1","2"]');
  await tap(page, '#ob-back'); await tap(page, '[data-ob-st="cycle"]');
  const cy = await page.$$eval('[data-ob-goal]', (x) => x.map((y) => y.dataset.obGoal));
  check('goals: period pain, heavy periods and mood before periods under both period tiles', ['pain', 'heavy', 'pms'].every((g) => cy.indexOf(g) >= 0 && pm.indexOf(g) >= 0) && cy.indexOf('track') >= 0, [cy, pm]);
  await tap(page, '[data-ob-goal="pain"]'); await tap(page, '[data-ob-goal="track"]');
  on = await page.$$eval('[data-ob-goal].on', (x) => x.map((y) => y.dataset.obGoal));
  check('goals: "Just tracking" stands alone', JSON.stringify(on) === '["track"]', on);
  await tap(page, '[data-ob-goal="track"]'); await tap(page, '#ob-next');
  check('goals: none picked, Continue asks for one', !(await page.$eval('#ob-goal-err', (e) => e.hidden)) && await has(page, '[data-ob-goal]'));
  await tap(page, '#ob-back');
  check('joining: 7 stage tiles, none for "just learning"', (await page.$$('[data-ob-st]')).length === 7 && !(await has(page, '[data-ob-st="learn"]')));
  await tap(page, '#ob-back');
  check('joining: back from her stage keeps her name and year', (await page.$eval('#ob-name', (e) => e.value)) === 'Asha' && await has(page, '[data-ob-y="1994"].on'));
  check('goals: no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. A shared phone: plain words, so no "Your Sakhi", no first-log card and no plan offer ---------- */
{
  const { ctx, page, errs } = await open();
  await join(page, { tile: 'pmos', goals: ['irregular'], share: 'fam' });
  await signUp(page);
  check('shared phone: Today straight after sign-up, no "Your Sakhi"', (await hashOf(page)) === '#home' && !(await has(page, '#ys-tour')), await hashOf(page));
  await sleep(800); if (await has(page, '#pin-cancel')) await tap(page, '#pin-cancel');
  await closeTips(page);
  check('shared phone: Today has no stage card, no first-days rows and no plan offer', !(await has(page, '#view .ex-card')) && !(await has(page, '#view .today-core-log')) && !(await has(page, '#pl-off-go')));
  await go(page, 'diary'); await closeTips(page);
  check('shared phone: Notes opens with no first-log card (no period words on top)', !(await has(page, '#fl-card')));
  await page.evaluate(() => { const S = window.Saathi; const d = S.toISO(S.today()); S.state.daily[d] = ['d_tired']; S.save(); });
  check('shared phone: whatever she logs counts as her first log', !!(await st(page)).prompts.firstLog);
  check('shared phone: no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. A girl under 18: the reading path, no account ---------- */
{
  const { ctx, page, errs } = await open();
  await join(page, { under18: true });
  await page.waitForSelector('#u18-back');
  check('under 18: her own screen, and no sign-up', !(await has(page, '#su-num')));
  await tap(page, '#view [data-go="learn"]'); await sleep(300);
  check('under 18: she reads without an account', !(await has(page, '#su-num')) && /learn/.test(await hashOf(page)), await hashOf(page));
  check('under 18: no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. A woman who joined before Version 39.10: asked once on Today; her diary untouched ---------- */
const OLD = { lang: 'en', langChosen: true, stage: 'app', dob: '1994-07-01', consent: { c1: dayISO(90) }, situation: {}, goals: ['track', 'pain'],
  events: [{ d: dayISO(40), t: 'start' }, { d: dayISO(35), t: 'end' }, { d: dayISO(12), t: 'start' }, { d: dayISO(7), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: dayISO(30) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: dayISO(30) }, mods: {}, settings: { toursAuto: false } };
{
  const { ctx, page, errs } = await open({ seed: OLD });
  await sleep(700);
  check('existing woman: Today asks for her stage and goals', await has(page, '#view .ex-card #ex-go') && !(await has(page, '#view .slot .ex-card')));
  await tap(page, '#ex-go');
  check('existing woman: the stage tiles, with no joining bar', (await hashOf(page)) === '#join-update' && (await page.$$('[data-ob-st]')).length === 7 && !(await has(page, '.ob-parts')));
  await tap(page, '[data-ob-st="cycle"]');
  check('existing woman: her goals screen, her old goal ticked', await has(page, '[data-ob-goal="pain"].on'));
  await tap(page, '[data-ob-goal="pms"]'); await tap(page, '#ob-next'); await sleep(500);
  const s = await st(page);
  check('existing woman: saved her goals; her diary untouched; Today again, the card gone', s.focus && JSON.stringify(s.focus.goals) === '["pain","pms"]' && JSON.stringify(s.goals) === '["track","pain","pms"]' && s.events.length === 4 && (await hashOf(page)) === '#home' && !(await has(page, '#view .ex-card')), [s.focus, s.goals]);
  await go(page, 'diary');
  check('existing woman: no first-log card (her diary isn\'t new)', !(await has(page, '#fl-card')) && !!s.prompts.firstLog);
  check('existing woman: no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: OLD });
  await sleep(700); await tap(page, '#ex-not');
  check('existing woman: "Not now" hides it', !(await has(page, '#view .ex-card')));
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await sleep(700);
  check('existing woman: and it stays hidden after a restart', !(await has(page, '#view .ex-card')));
  check('existing woman ("Not now"): no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: OLD });
  await sleep(700); await tap(page, '#ex-go'); await tap(page, '[data-ob-st="preg"]'); await sleep(500);
  check('existing woman: another stage opens the stage change (her dates), not new joining', /#home/.test(await hashOf(page)) && await has(page, '#sheet-root .sheet'), await hashOf(page));
  check('existing woman (another stage): no page errors', !errs.length, errs);
  await ctx.close();
}

await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' checks passed');
process.exit(pass === results.length ? 0 : 1);
