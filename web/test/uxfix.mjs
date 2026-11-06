// Version 39.75, the UI and UX gaps (Mohit, 6 Nov: "did you also notice any gaps with UI and UX", then "fix all"; MODULE_API section
// 118). This file checks:
// - 1 while her plan's steps show, they come first on Today, and a "see a doctor this week" finding follows them (a sign for now
//   or today stays on top); at 360 x 800 her first step is on the first screen;
// - 2 a phone she wanted locked: the PIN she skipped at her first Home is asked once more, on her first private page (Cancel is her no);
// - 3 under 40, "My periods have stopped" is never called menopause: the POI line while she joins, "My periods have stopped" on
//   Your Sakhi, no "Menopause care" on Today until a doctor has seen her (from 40, as before);
// - 4 her week's count has one home (Today and My plan): the check-in shows today's count and tomorrow;
// - 5 a "this week" finding a week on Today says "Still to see a doctor?" (as "this month" after 4 weeks, Version 39.57);
// - 7 Your Sakhi: "Make my plan" leads, also when her dates show a sign (no plan row in the doctor's card);
// - 8 the check-in asks "Fasting?" only once she has used fasting;
// - 9 the call form's topics are her stage's; the Kegel trainer's figure is hidden from screen readers; a search box's clear
//   button has a name;
// - 10 Hindi at 360 px, and no page errors.
// Usage: node test/uxfix.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-06';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.__secure = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(on){ window.__secure.push(on); }, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.75-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planRem = (startAgo, on) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: on !== false, doneOn: null });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', ppv2No: '2026-10-01', pv2No: '2026-10-01', mpv2No: '2026-10-01' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular', stage: 'cycle' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyIntro: ago(3) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* her PMOS plan (the cycle plan), started startAgo days ago, with a log */
const pmos = (startAgo, log, x, px) => Object.assign({ situation: { pcos: true }, intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', startAgo, Object.assign({ log: log || {}, intake: { goal: 'pmos', stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], when: 'evening' } }, px || {})) }, reminders: [planRem(startAgo)] }, x || {});
const did = (...days) => Object.fromEntries(days.map((n) => [ago(n), { ck: { move: 'd' }, min: 20, ci: 1 }]));

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', hasTouch: !!o.touch, isMobile: !!o.touch });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.init) await ctx.addInitScript(o.init);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { errs.push(String(e.message).slice(0, 200)); if (process.env.DBG) console.log('PAGEERROR', String(e.stack || e.message).slice(0, 600)); });
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 600); };
const view = (page) => page.$eval('#view', (e) => e.innerText.replace(/\s+/g, ' ').trim());
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const hash = (page) => page.evaluate(() => location.hash.slice(1));
const sched = async (page) => { await settle(page, 1200); return page.evaluate(() => window.__sched || []); };
const ring = (list) => list.find((x) => /^pause-/.test(x.id)) || null;
const ringOn = (r) => (r ? new Date(r.at + 5.5 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : null);   /* her clock, IST */
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const move = (page) => page.evaluate(() => { const a = window.Saathi.plan.actions().find((x) => x.id === 'move'); return a ? { title: a.title, sub: a.sub, mins: a.mins, state: a.state || '' } : null; });
const save = (page) => page.evaluate(() => window.Saathi.save());



const longP = (startAgo, len) => [{ d: ago(startAgo + 62), t: 'start' }, { d: ago(startAgo + 58), t: 'end' }, { d: ago(startAgo + 31), t: 'start' }, { d: ago(startAgo + 27), t: 'end' }, { d: ago(startAgo), t: 'start' }, { d: ago(startAgo - len + 1), t: 'end' }];
const pos = (page, a, b) => page.evaluate(([a, b]) => { const x = document.querySelector(a), y = document.querySelector(b); return x && y ? !!(x.compareDocumentPosition(y) & 4) : null; }, [a, b]);

/* ---------- 1. Her steps first ---------- */
{
  let a = await open({ seed: Object.assign(pmos(3, did(1)), { events: longP(14, 11) }), w: 360, h: 800 });
  let v = await view(a.page);
  check('1.1 the "this week" finding is on Today', /See a doctor this week/.test(v) && await has(a.page, '#view [data-xp-lv="week"]'), v.slice(0, 600));
  check('1.1 ... after her plan\'s steps', await pos(a.page, '#view .today-plan-list', '#view [data-xp-lv="week"]') === true);
  const fold = await a.page.evaluate(() => { const s = document.querySelector('#view .today-plan-list .today-row, #view .today-plan-list > *'); const tb = document.querySelector('#tabbar'); if (!s) return null; const r = s.getBoundingClientRect(); const top = tb && getComputedStyle(tb).display !== 'none' ? tb.getBoundingClientRect().top : innerHeight; return { stepTop: Math.round(r.top), stepBottom: Math.round(r.bottom), fold: Math.round(top) }; });
  check('1.2 at 360 x 800 her first step is on the first screen', !!fold && fold.stepBottom <= fold.fold, fold);
  await done(a);
  a = await open({ seed: { events: longP(14, 11) } });
  check('1.3 no plan: the finding stays at the top, before her plan offer', await has(a.page, '#view [data-xp-lv="week"]') && !(await has(a.page, '#view .today-plan-list')), (await view(a.page)).slice(0, 300));
  await done(a);
  /* a sign for today stays on top: 20 weeks pregnant on My pregnancy (version 2), a headache with swelling in today's check-in */
  const pIK = { at: ago(5), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 20, pnow: null };
  a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(7 * 20 + 3), care: 'private' }, goals: ['food'], intake: pIK, events: [], checkins: { [ago(0).slice(0, 7)]: { at: ago(0), chips: ['head', 'swell'], kind: 'preg' } },
    mods: { plan: planOf('preg', 'food', 4, { pv: 2, intake: pIK }) } } });
  check('1.4 a sign for today (headache with swelling in a pregnancy) stays above her steps', await has(a.page, '#view [data-xp-lv="today"]') && await pos(a.page, '#view [data-xp-lv="today"]', '#view .today-plan-list') === true, (await view(a.page)).slice(0, 400));
  await done(a);
}

/* ---------- 2. The PIN she skipped ---------- */
{
  const lockSeed = (x) => Object.assign({ settings: { discreet: true }, prompts: { pinWant: true }, intake: { goal: 'irregular', stage: 'cycle' } }, x || {});
  let a = await open({ seed: lockSeed(), hash: '#home' });
  await go(a.page, 'plan-goal'); await settle(a.page, 900);
  let sh = await txt(a.page, '#sheet-root');
  check('2.1 a shared phone she wanted locked, no PIN: her first private page asks for one', /Choose a 4-digit PIN/.test(sh), sh);
  await tap(a.page, '#pin-cancel'); await settle(a.page, 400);
  check('2.2 Cancel: her page, no PIN', !(await has(a.page, '#sheet-root .sheet')) && (await hash(a.page)) === 'plan-goal', await hash(a.page));
  await go(a.page, 'home'); await go(a.page, 'plan-goal'); await settle(a.page, 900);
  const gone = !(await has(a.page, '#sheet-root .sheet')) && !((await st(a.page)).prompts || {}).pinWant;
  await a.page.reload({ waitUntil: 'domcontentloaded' }); await settle(a.page, 900); await go(a.page, 'plan-goal'); await settle(a.page, 900);
  check('2.3 ... asked once more only: Cancel there is her no, on this visit and the next', gone && !(await has(a.page, '#sheet-root .sheet')));
  await done(a);
  a = await open({ seed: lockSeed({ prompts: {} }), hash: '#home' });
  await go(a.page, 'plan-goal'); await settle(a.page, 900);
  check('2.4 discreet without asking for a lock at joining: not asked', !(await has(a.page, '#sheet-root .sheet')));
  await done(a);
  a = await open({ seed: lockSeed(), hash: '#home' });
  await go(a.page, 'plan-goal'); await settle(a.page, 900);
  for (const k of '12341234') { await a.page.$$eval('#sheet-root [data-k="' + k + '"]', (bs) => bs[0] && bs[0].click()); await settle(a.page, 150); }
  const s2 = await st(a.page);
  check('2.5 she sets it: the PIN is on, and Sakhi stops asking', !!s2.settings.pinHash && !(s2.prompts || {}).pinWant && !(s2.prompts || {}).pinDue, { pin: !!s2.settings.pinHash, p: s2.prompts });
  await done(a);
  a = await open({ seed: lockSeed({ settings: {} }), hash: '#home' });
  await go(a.page, 'plan-goal'); await settle(a.page, 900);
  check('2.6 a lock without plain words: asked once more too', /Choose a 4-digit PIN/.test(await txt(a.page, '#sheet-root')));
  await done(a);
  a = await open({ seed: lockSeed({ prompts: { pinWant: true, pinDue: true } }), hash: '#plan-goal' });
  await settle(a.page, 900);
  const before = !(await has(a.page, '#sheet-root .sheet'));
  await go(a.page, 'home'); await settle(a.page, 900);
  check('2.7 before her first Home, a private page waits: Home asks first (Version 34.1)', before && /Choose a 4-digit PIN/.test(await txt(a.page, '#sheet-root')));
  await done(a);
  /* the first Home's PIN ask comes before any other prompt (Version 34.1's chain): Cancel the moment it opens, and nothing opens behind it */
  const cancelPin = "document.addEventListener('DOMContentLoaded', () => new MutationObserver(() => { const b = document.querySelector('#pin-cancel'); if (b && !window.__pc) { window.__pc = 1; b.click(); } }).observe(document.body, { childList: true, subtree: true }));";
  a = await open({ seed: lockSeed({ prompts: { pinWant: true, pinDue: true }, whatsNew: null }), hash: '#home', init: cancelPin });
  await settle(a.page, 1500);
  const pc = await a.page.evaluate(() => window.__pc || 0);
  check('2.8 the first Home asks for the PIN and nothing else: Cancel at once, and "What\'s new" doesn\'t open behind it', pc === 1 && !(await has(a.page, '#sheet-root .sheet')), { pc, sheet: (await txt(a.page, '#sheet-root')).slice(0, 120) });
  await done(a);
}

/* ---------- 3. Under 40, never "menopause" ---------- */
{
  const stopped = (dob, x) => Object.assign({ dob, situation: { stopped: true, midlife: true, stoppedOn: ago(40) }, intake: { goal: 'hot', stage: 'meno' }, focus: { tile: 'meno', goals: ['hot'], at: ago(60) }, events: [] }, x || {});
  let a = await open({ seed: stopped('1989-03-01') });
  let v = await view(a.page);
  check('3.1 at 37: no "Menopause care" on Today', !/Menopause care/.test(v), v.slice(0, 500));
  await done(a);
  a = await open({ seed: stopped('1980-03-01') });
  check('3.2 at 46: "Menopause care" as before', /Menopause care/.test(await view(a.page)));
  await done(a);
  a = await open({ seed: stopped('1989-03-01', { situation: { stopped: true, midlife: true, stoppedOn: ago(40), poiOk: ago(5) } }) });
  check('3.3 at 37, after her doctor has seen her: "Menopause care" again', /Menopause care/.test(await view(a.page)));
  await done(a);
  a = await open({ seed: Object.assign(stopped('1989-03-01'), { focus: { tile: 'meno', goals: ['hot'], read: true, at: ago(0) } }), hash: '#your-sakhi' });
  v = await view(a.page);
  check('3.4 Your Sakhi at 37: "My periods have stopped", not "Menopause"', /My periods have stopped/.test(v) && !/(^| )Menopause( |$)/.test(v.split('HOW SAKHI')[0]), v.slice(0, 300));
  await done(a);
  /* joining: the Menopause tile's details screen at 36 shows the reviewed POI line */
  const { join } = await import(pathToFileURL(path.join(here, 'join.mjs')).href);
  a = await open({ seed: null, hash: '' });
  let poi = '';
  await join(a.page, { name: 'Meera', dec: 1990, y: 1990, tile: 'meno', goals: ['hot'], stop: 'care', onScreen: async (n) => { if (n === 'details') poi = await view(a.page); } }).catch((e) => { poi = poi || String(e.message).slice(0, 200); });
  check('3.5 joining at 36, "Menopause": the reviewed line "Periods that stop before 40 are not menopause" first', /Periods that stop before 40 are not menopause/.test(poi), poi.slice(0, 300));
  await done(a);
}

/* ---------- 4. One home for her week's count ---------- */
{
  const a = await open({ seed: pmos(5, did(1, 2, 3)), now: at(0, '21:00') });
  await go(a.page, 'plan-checkin'); await settle(a.page, 600);
  for (const sel of await a.page.$$eval('#view [data-ci]', (bs) => { const g = {}; bs.forEach((b) => { const k = b.dataset.ci.split(':')[0]; if (!g[k]) g[k] = '[data-ci="' + b.dataset.ci + '"]'; }); return Object.values(g); })) await tap(a.page, sel);
  if (await has(a.page, '#view [data-feel="d_ok"]')) await tap(a.page, '#view [data-feel="d_ok"]');
  await a.page.$$eval('#view button', (bs) => { const b = bs.find((x) => x.innerText.trim() === 'Save'); if (b) b.click(); }); await settle(a.page, 900);
  const v = await view(a.page);
  check('4.1 after the check-in: today\'s count and tomorrow, no "of 7 days this week"', /done today/.test(v) && !/of 7 days this week/.test(v), v.slice(0, 400));
  await done(a);
}

/* ---------- 5. "Still to see a doctor?" a week on ---------- */
{
  const run = async (shownAgo) => { const a = await open({ seed: Object.assign(pmos(3, did(1)), { events: longP(14, 11), mods: Object.assign({}, pmos(3, did(1)).mods, { explain: { shown: {} } }) }) });
    const key = await a.page.evaluate(() => { const b = document.querySelector('#view [data-xp-lv="week"]'); const w = b && b.closest('.xp-home-wrap'); const s = w && w.querySelector('[data-xp-seen]'); return s ? s.dataset.xpSeen : null; });
    if (key && shownAgo) { await a.page.evaluate(([k, d]) => { const m = window.Saathi.state.mods.explain; m.shown = m.shown || {}; m.shown[k] = d; window.Saathi.save(); window.Saathi.render(); }, [key, ago(shownAgo)]); await settle(a.page, 500); }
    const t0 = await txt(a.page, '#view [data-xp-lv="week"]'); await done(a); return { key, t0 }; };
  const r0 = await run(0), r8 = await run(8);
  check('5.1 a new "this week" finding: "See a doctor this week"', /See a doctor this week/.test(r0.t0), r0);
  check('5.2 shown 8 days ago: "Still to see a doctor?"', /Still to see a doctor\?/.test(r8.t0) && !/this week/.test(r8.t0), r8);
  /* no plan yet, so her plan's offer stands beside the finding (the pair card): its first day counts the same */
  const p = await open({ seed: { events: longP(14, 11), joined: TODAY, focus: { tile: 'cycle', goals: ['irregular'], at: TODAY }, prompts: { setup: 'off', planCall: ago(3), firstLog: TODAY, planOffer: TODAY, notifyAuto: TODAY } } });   /* just joined: her plan offered (minimal.mjs 6) */
  const pk = await p.page.$eval('#view .xp-pair', (e) => e.dataset.key).catch(() => null);
  const first = await p.page.evaluate((k) => (((window.Saathi.state.mods || {}).explain || {}).shown || {})[k] || null, pk);
  await p.page.evaluate(([k, d]) => { const m = window.Saathi.state.mods.explain; m.shown[k] = d; window.Saathi.save(); window.Saathi.render(); }, [pk, ago(8)]); await settle(p.page, 500);
  const pt = await txt(p.page, '#view .xp-pair .xp-pill');
  check('5.3 with her plan\'s offer beside it: the day counts from that card too, and a week on it asks "Still to see a doctor?"', !!pk && first === ago(0) && /Still to see a doctor\?/.test(pt), { pk, first, pt });
  await done(p);
}

/* ---------- 7. Your Sakhi: "Make my plan" leads ---------- */
{
  const a = await open({ seed: { events: [{ d: ago(85), t: 'start' }, { d: ago(81), t: 'end' }, { d: ago(45), t: 'start' }, { d: ago(41), t: 'end' }, { d: ago(5), t: 'start' }, { d: ago(1), t: 'end' }], intake: { goal: 'irregular', stage: 'cycle' }, goals: ['irregular'], focus: { tile: 'pmos', goals: ['irregular'], read: true, at: ago(0) }, prompts: { planOffer: ago(0), setup: 'off', firstLog: ago(3), notifyIntro: ago(3) } }, hash: '#your-sakhi' });
  const v = await view(a.page);
  check('7.1 her dates show a sign: the doctor\'s card, and "Make my plan" leads (no plan row in the card)', /One of your recent gaps|gap/.test(v) && await has(a.page, '#ys-plan') && !(await has(a.page, '#view [data-xp-plan]')), v.slice(0, 700));
  await done(a);
}

/* ---------- 8. "Fasting?" once she has used it ---------- */
{
  const ciFast = async (x) => { const sd = pmos(5, did(1, 2)); Object.assign(sd.mods.plan, x || {}); const a = await open({ seed: sd, now: at(0, '21:00') }); await go(a.page, 'plan-checkin'); await settle(a.page, 600); const r = await has(a.page, '#view .pl-ci-fast'); await done(a); return r; };
  check('8.1 she has never fasted: no "Fasting?" in the check-in', !(await ciFast(null)));
  check('8.2 her last fast 10 days ago (the 7-day list has let it go): "Fasting?" stays', await ciFast({ fastAt: ago(10) }));
  check('8.3 her last fast 100 days ago: "Fasting?" has gone', !(await ciFast({ fastAt: ago(100) })));
  const a = await open({ seed: pmos(5, did(1, 2)), now: at(0, '12:00') });
  await tap(a.page, '#view .today-plan-plate [data-today-why]'); await tap(a.page, '#pl-why-fast');
  const st = await a.page.evaluate(() => { const d = window.Saathi.state.mods.plan; return { fastAt: d.fastAt, fast: d.fast }; });
  await go(a.page, 'plan-checkin'); await settle(a.page, 600);
  const on = await a.page.$eval('#view #pl-ci-fast-today', (b) => b.getAttribute('aria-pressed')).catch(() => null);
  check('8.4 "Fasting today?" in her food step\'s Why: the check-in asks "Fasting?" from then on, today\'s chip on', st.fastAt === ago(0) && on === 'true', JSON.stringify(st) + ' ' + on);
  await tap(a.page, '#view #pl-ci-fast-today');
  const st2 = await a.page.evaluate(() => { const d = window.Saathi.state.mods.plan; return { fastAt: d.fastAt || null, n: Object.keys(d.fast || {}).length }; });
  check('8.5 a fast marked by mistake and undone takes its mark back', st2.fastAt === null && st2.n === 0, JSON.stringify(st2));
  await done(a);
}

/* ---------- 9. The call form, the trainer's figure, the search box ---------- */
{
  let a = await open({ seed: { goals: ['irregular', 'recovery', 'food'], intake: { goal: 'irregular', stage: 'cycle' } }, hash: '#ask-call', config: { app: '0.39.75-demo' } });   /* a demo build: the stand-in server takes calls */
  let v = await view(a.page);
  check('9.1 the call form\'s topics: her stage\'s goals, not "Recovering after the birth" or "Food and activity"', /Irregular or late periods/.test(v) && !/Recovering after the birth/.test(v) && !/Food and activity/.test(v), v.slice(0, 500));
  await done(a);
  a = await open({ seed: { goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'cycle' } }, hash: '#post-pelvic' });
  const vids = await a.page.$$eval('video', (vs) => vs.map((x) => x.getAttribute('aria-hidden')));
  check('9.2 the pelvic floor trainer\'s moving figure is hidden from screen readers', vids.length > 0 && vids.every((x) => x === 'true'), vids);
  await done(a);
  a = await open({ seed: {}, hash: '#care' });
  check('9.3 an empty search box: no clear button', !(await a.page.$eval('#care-q-clear', (b) => !b.hidden).catch(() => false)));
  await a.page.evaluate(() => { const i = document.querySelector('#care-q'); i.value = 'pcos'; i.dispatchEvent(new Event('input')); }); await settle(a.page, 400);
  const cl = await a.page.$eval('#care-q-clear', (b) => { const r = b.getBoundingClientRect(); return { shown: !b.hidden, label: b.getAttribute('aria-label'), w: r.width, h: r.height }; }).catch(() => null);
  check('9.4 after typing: a clear button named "Clear search", 44 px like the mic', !!cl && cl.shown && cl.label === 'Clear search' && cl.w >= 44 && cl.h >= 44, cl);
  await tap(a.page, '#care-q-clear');
  check('9.5 it clears the search', (await a.page.$eval('#care-q', (i) => i.value)) === '');
  await done(a);
}

/* ---------- 10. Hindi at 360 px, and no page errors ---------- */
{
  const a = await open({ seed: Object.assign(pmos(3, did(1)), { lang: 'hi', events: longP(14, 11) }), lang: 'hi', w: 360, h: 800 });
  check('10.1 Hindi at 360 px: her steps before the finding, no sideways scroll', await pos(a.page, '#view .today-plan-list', '#view [data-xp-lv="week"]') === true && await noScroll(a.page));
  await done(a);
  const b = await open({ seed: { lang: 'hi' }, hash: '#care', lang: 'hi' });
  await b.page.evaluate(() => { const i = document.querySelector('#care-q'); i.value = 'pcos'; i.dispatchEvent(new Event('input')); }); await settle(b.page, 400);
  check('10.2 Hindi: the clear button\'s name', (await b.page.$eval('#care-q-clear', (x) => x.getAttribute('aria-label')).catch(() => '')) === 'खोज साफ़ करें');
  await done(b);
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' passed');
if (failed.length) process.exit(1);
