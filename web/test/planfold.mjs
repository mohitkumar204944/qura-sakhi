// Versions 39.19 and 39.20: My plan with less clutter, and a mantra or prayer at bedtime (Mohit, 26 Oct: "some information can be
// collapsable so the page doesnt look cluttered" and "just advise you can chant these or any devotional mantra you like to chant
// for soothing sleep"; docs/myplan-and-sleep-advice-2026-10-26.md; MODULE_API sections 62 and 63). This file checks:
//   1 her first week: My plan as it was, every part open;
//   2 after it (Version 39.22 carried this further): how her plan works is a link by her week, her steps' reasons sit behind
//     one "Why these 4 steps?", what consistency brings sits in her 12 weeks (this week and next), her care team folds; her
//     steps, this week (her garden in it), the tools and her settings (a gear) stay open; the page about 2.5 screens at
//     360 x 780 (it was 4.6), her 4 steps on the first;
//   3 each opens to what it held;
//   4 a shared phone and Hindi at 360 px;
//   5 the sleep routine's last step: a mantra or prayer, if she likes (no recordings), still about 3 minutes; no page errors.
// Usage: node test/planfold.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'planfold'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.__shared = null; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, share(t, x){ window.__shared = [t, x]; return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.20-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
/* her plan's log: on `days` of every week so far, every step done */
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd' }, plate: { half: true } }; return l; };
const cyc = (start, extra, seed) => Object.assign({ intake: { goal: 'pmos' }, situation: { pcos: true }, mods: { plan: planOf('cycle', 'pmos', start, extra) } }, seed || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '20:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.plan)));
const rmins = (page, id) => page.evaluate((r) => window.Saathi.plan.routineMins(r, window.Saathi.state.mods.plan), id);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const errsAll = [];
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };


const SEEN1 = { 1: { e: 'good', seen: true } };
const sheetTxt = (page) => page.$eval('#sheet-root', (e) => e.innerText).catch(() => '');
const pageH = (page) => page.$eval('#view', (v) => v.scrollHeight);

/* ---------- 1 her first week: everything open ---------- */
{
  const a = await open({ w: 360, h: 780, seed: cyc(ago(3), { log: logged(3, 3), weeks: {} }), now: at(0, '09:30'), hash: '#plan' });
  await go(a.page, 'plan');
  check('1 week 1: nothing folded, each step with its reason and "How to do it"', (await a.page.$$('#view .pl-fold')).length === 0 && (await a.page.$$('#view .pl-step-why')).length >= 3 && /How to do it/.test(await txt(a.page, '#view .pl-steps-card')));
  check('1 ... how her plan works, what consistency brings and her care team, open', /HOW YOUR PLAN WORKS/i.test(await txt(a.page, '#view .pl-rh')) && /Weeks 4 to 12/.test(await txt(a.page, '#view .pl-cons')) && /Report for my doctor/.test(await txt(a.page, '#view .pl-care')));
  await done(a);
}

/* ---------- 2 and 3 after her first week (Version 39.22 carried the folds further: MODULE_API section 65) ---------- */
{
  const a = await open({ w: 360, h: 780, seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }), now: at(0, '09:30'), hash: '#plan' });
  await go(a.page, 'plan');
  const h = await pageH(a.page);
  check('2 week 2: about 2.5 screens (it was 3,580 px, 4.6 screens)', h > 0 && h <= 2000, h);
  const folds = await a.page.$$eval('#view .pl-fold', (f) => f.map((x) => x.className.split(' ').filter((c) => /^pl-(rh|cons|care)$/.test(c))[0]));
  check('2 how her plan works is a link by her week; what consistency brings sits in her 12 weeks; her care team folds', folds.join() === 'pl-care' && await has(a.page, '#pl-howlink') && !(await has(a.page, '#view .pl-rh')) && !(await has(a.page, '#view .card.pl-cons')), folds);
  check('2 ... closed, with its one line: "Doctors, your report, help"; her stage now in her 12 weeks', await a.page.$$eval('#view .pl-fold details', (d) => d.every((x) => !x.open)) &&
    /Doctors, your report, help/.test(await txt(a.page, '#view .pl-care summary')) && /Weeks 1 to 4: Many women feel more energy and sleep better./.test(await txt(a.page, '#view .pl-weeks')));
  check('2 her steps keep their names, ticks and one line each; the reasons go behind "Why these 4 steps?"', (await a.page.$$('#view .pl-step-why')).length === 0 && (await a.page.$$('#view .pl-step-how')).length === 0 && /Why these 4 steps\?/.test(await txt(a.page, '#pl-whyall')) && (await a.page.$$('#view [data-pl-tk]')).length === 2 && await has(a.page, '#view [data-pl-play]'));
  check('2 ... and all 4 fit on the first screen', await a.page.$eval('#view .pl-steps-card', (c) => c.getBoundingClientRect().bottom <= 780));
  const path = await txt(a.page, '#view .pl-path');
  check('2 the 12 weeks: this week and next, then "All 12 weeks"', /This week\s+60 minutes a week/.test(path) && /Next week\s+70 minutes a week/.test(path) && /All 12 weeks/.test(path), path);
  check('2 this week (her garden at its foot), the tools and her settings (a gear by her title) stay open', await has(a.page, '#view .pl-wkc .pl-r7') && !(await has(a.page, '#view .pl-garden-in')) && await has(a.page, '#view .pl-gear[data-go="plan-settings"]'));   /* Version 39.68: no garden */
  await a.page.$eval('#pl-whyall', (b) => b.click()); await settle(a.page, 300);
  check('3 "Why these 4 steps?" opens every reason and how to do it', /Why these 4 steps\?/.test(await sheetTxt(a.page)) && /A regular bedtime helps your body clock/.test(await sheetTxt(a.page)), (await sheetTxt(a.page)).slice(0, 200));
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await a.page.$eval('#pl-howlink', (b) => b.click()); await settle(a.page, 300);
  check('3 "How it works" opens how her plan works', /How your plan works[\s\S]*Every week/.test(await sheetTxt(a.page)));
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await a.page.$eval('#view .pl-care summary', (x) => x.click());
  await a.page.$eval('#view .pl-path-more summary', (x) => x.click()); await settle(a.page, 200);
  check('3 each fold opens to what it held', /Weeks 4 to 12/.test(await txt(a.page, '#view .pl-weeks')) && /YOUR OWN SIGNS/i.test(await txt(a.page, '#view .pl-weeks')) && /Report for my doctor/.test(await txt(a.page, '#view .pl-care')) && /Week 12/.test(await txt(a.page, '#view .pl-path')));
  await shot(a.page, 'w2-open');
  await done(a);
}

/* ---------- 4 a shared phone, Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 780, seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }, { settings: { discreet: true } }), now: at(0, '09:30'), hash: '#plan' });
  await go(a.page, 'plan');
  check('4 a shared phone: no reasons and no consistency card, folds as plain rows', !(await has(a.page, '#view .pl-step-why')) && !(await has(a.page, '#view .pl-cons')) && await has(a.page, '#view .pl-care.pl-fold'));
  await done(a);
}
{
  const a = await open({ w: 360, h: 780, lang: 'hi', seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }, { lang: 'hi' }), now: at(0, '09:30'), hash: '#plan' });
  await go(a.page, 'plan');
  check('4 Hindi: the folded page fits at 360 px, with "सभी 12 हफ़्ते" and "डॉक्टर, आपकी रिपोर्ट, मदद"', await noScroll(a.page) && /सभी 12 हफ़्ते/.test(await txt(a.page, '#view .pl-path')) && /डॉक्टर, आपकी रिपोर्ट, मदद/.test(await txt(a.page, '#view .pl-care')));
  await shot(a.page, 'w2-hi');
  await done(a);
}

/* ---------- 5 the sleep routine's mantra or prayer ---------- */
{
  const a = await open({ w: 360, h: 780, hash: '#relief-sleep' });
  await go(a.page, 'relief-sleep');
  const intro = await view(a.page);
  check('5 the sleep routine: 5 steps, the last "A mantra or prayer, if you like", still about 3 minutes', (await a.page.$$('#view ol.steps li')).length === 5 && /A mantra or prayer, if you like/.test(intro) && /3 min/.test(intro), intro.slice(0, 300));
  await tap(a.page, '#rl-start'); for (let i = 0; i < 4; i++) await tap(a.page, '#rl-next');
  const st = await txt(a.page, '#rl-step');
  check('5 ... it advises chanting, no recordings: Om, the Gayatri mantra, the Hanuman Chalisa, or any prayer or devotional mantra she likes', /STEP 5 OF 5/i.test(st) && /Om, the Gayatri mantra, the Hanuman Chalisa, or any prayer or devotional mantra you like/.test(st) && !(await has(a.page, '#view audio')), st);
  await done(a);
}
{
  const a = await open({ w: 360, h: 780, lang: 'hi', seed: { lang: 'hi' }, hash: '#relief-sleep' });
  await go(a.page, 'relief-sleep');
  check('5 Hindi: "चाहें तो कोई मंत्र या प्रार्थना"', /चाहें तो कोई मंत्र या प्रार्थना/.test(await view(a.page)) && await noScroll(a.page));
  await done(a);
}
check('5 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(passed + '/' + results.length + ' checks passed');
process.exit(passed === results.length ? 0 : 1);
