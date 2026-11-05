// Version 39.53, every guide leads to her plan (Mohit, 1 Nov: "i believe everything should leave to plan and for extended medical
// help qura doctor should be advised", then "build it"). MODULE_API section 96; review section 19.53.
//   1 her plan running: the guides, routines and topic pages name it ("Your plan for this"), the midlife plan's part for each subject,
//     and a tap opens My plan;
//   2 no plan: the plan that fits her stage, offered ("A free plan for this · See {plan}"), and a tap starts its questions; on the
//     guides (full page and quick answer), the routines and the topic pages;
//   3 another plan running: nothing (hers stays hers); her own plan's guides still name it;
//   4 none on a shared phone, in a pregnancy, before 40 with her periods stopped, or where no plan fits her stage;
//   5 the three medical guides lead with "Ask a Qura doctor about this"; the iron tablets page asks a Qura doctor too;
//   6 Hindi at 360 px; no page errors.
// Usage: node test/planfor.mjs [dir]   (dir defaults to this app folder)
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
const TODAY = '2026-10-30';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Kavita Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.53-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* Kavita, 51, periods stopped, on My midlife plan (version 2) with goal g */
const m2 = (g, startAgo, x) => Object.assign({ dob: '1975-03-01', situation: { stopped: true }, intake: { goal: g, stage: 'meno' }, goals: ['meno', g], events: regular(400),
  mods: { plan: planOf('meno', g, startAgo, { pv: 2, intake: { goal: g, stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' } }) }, reminders: [planRem(startAgo)] }, x || {});

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
const hash = (page) => page.evaluate(() => location.hash);
const intake = (page) => page.evaluate(() => window.Saathi.mem.planIntake || null);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const row = (page, route) => go(page, route).then(() => txt(page, '#view .pl-for'));

// ---------- 1 her plan running: her plan, and the midlife plan's part for each subject ----------
{
  const a = await open({ seed: m2('hot', 2) });
  let r = await row(a.page, 'a-midlife.hot-flushes-night-sweats');
  check('1 hot flushes guide: "Your plan for this · My midlife plan · Weeks 1 to 4: Cool and calm"', /Your plan for this/i.test(r) && /My midlife plan/.test(r) && /Weeks 1 to 4: Cool and calm/.test(r), r);
  r = await row(a.page, 'a-mind_body.sleep-and-hormones');
  check('1 sleep guide: the Rest part', /Weeks 5 to 8: Rest/.test(r), r);
  r = await row(a.page, 'a-midlife.bones-heart-after-40');
  check('1 bones guide: Strong and steady', /Weeks 9 to 12: Strong and steady/.test(r), r);
  r = await row(a.page, 'relief-hot');
  check('1 the hot-flush routine names her plan’s part', /My midlife plan/.test(r) && /Cool and calm/.test(r), r);
  r = await row(a.page, 'relief-sleep');
  check('1 the sleep routine: the Rest part', /Rest/.test(r), r);
  r = await row(a.page, 'meno-bones');
  check('1 Bones and heart: Strong and steady', /Strong and steady/.test(r), r);
  r = await row(a.page, 'meno');
  check('1 the Menopause page names her plan', /My midlife plan/.test(r), r);
  await go(a.page, 'a-midlife.hot-flushes-night-sweats'); await tap(a.page, '#view .pl-for [data-go="plan"]');
  await go(a.page, 'a-midlife.hot-flushes-night-sweats');
  const order = await a.page.evaluate(() => { const v = document.querySelector('#view'); const p = v.querySelector('.pl-for'), tl = v.querySelector('.art-tool'), q = v.querySelector('#art-ask'); return !!(p && tl && q) && !!(p.compareDocumentPosition(tl) & 4) && !!(tl.compareDocumentPosition(q) & 4); });
  check('1 her plan first, then the tool, then a Qura doctor', order);
  await tap(a.page, '#view .pl-for [data-go="plan"]');
  check('1 a tap opens My plan', (await hash(a.page)) === '#plan'); await done(a);
}

// ---------- 2 no plan: the plan that fits, offered ----------
{
  let a = await open({});
  let r = await row(a.page, 'a-cycle.painful-periods');
  check('2 painful periods guide: "A free plan for this · My period plan" (the period pain plan, Version 39.55)', /A free plan for this/i.test(r) && /My period plan/.test(r), r);
  await tap(a.page, '#view .pl-for [data-pl-for]');
  let mi = await intake(a.page);
  check('2 a tap starts that plan’s questions', (await hash(a.page)) === '#plan-goal' && mi && mi.goal === 'pain', { h: await hash(a.page), mi }); await done(a);
  a = await open({});
  const offers = {};
  /* Version 39.68 (the doctors' review): the mood guide and the PMS, anaemia and endometriosis pages are gone */
  for (const [route, goal] of [['a-cycle.heavy-bleeding-how-to-tell', 'heavy'], ['a-pmos.what-pmos-is', 'pmos'], ['a-cycle.why-cycles-become-irregular', 'irregular'],
    ['periods-pain', 'pain'], ['cond-fibroids', 'heavy'], ['relief-cramps', 'pain']]) {
    await go(a.page, route); offers[route] = await a.page.$eval('#view .pl-for [data-pl-for]', (b) => b.dataset.plFor).catch(() => null);
  }
  check('2 heavy, PMOS and irregular guides, and the period pain, fibroids and cramps pages, each offer their plan', JSON.stringify(offers) === JSON.stringify({ 'a-cycle.heavy-bleeding-how-to-tell': 'heavy', 'a-pmos.what-pmos-is': 'pmos', 'a-cycle.why-cycles-become-irregular': 'irregular', 'periods-pain': 'pain', 'cond-fibroids': 'heavy', 'relief-cramps': 'pain' }), offers);
  await done(a);
  /* a quick answer's sheet, from a guide's "Also asked" */
  a = await open({ hash: '#a-cycle.what-is-a-menstrual-cycle' });
  await tap(a.page, '#view [data-ans="cycle.why-cycles-become-irregular"]');
  const sh = await txt(a.page, '#sheet-root .pl-for');
  check('2 the quick answer’s sheet offers it too', /A free plan for this/i.test(sh) && (await a.page.$eval('#sheet-root .pl-for [data-pl-for]', (x) => x.dataset.plFor).catch(() => null)) === 'irregular', sh);
  await tap(a.page, '#sheet-root .pl-for [data-pl-for]');
  check('2 ... and its tap closes the sheet and starts the questions', (await hash(a.page)) === '#plan-goal' && !(await has(a.page, '#sheet-root .pl-for')), await hash(a.page)); await done(a);
  /* trying for a baby: Getting ready */
  a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, goals: ['ttc', 'ready'] } });
  r = await row(a.page, 'a-conceive.getting-ready-india-preconception-checklist');
  check('2 trying for a baby: the checklist guide offers Getting ready for a baby', /Getting ready for a baby/.test(r), r); await done(a);
}

// ---------- 3 another plan running ----------
{
  const a = await open({ seed: { intake: { goal: 'pmos', stage: 'cycle' }, goals: ['pmos'], mods: { plan: planOf('cycle', 'pmos', 3) }, reminders: [planRem(3)] } });
  check('3 her PMOS plan runs: the painful periods guide offers nothing else', !(await row(a.page, 'a-cycle.painful-periods')));
  const r = await row(a.page, 'a-pmos.what-pmos-is');
  check('3 ... and the PMOS guide names her plan', /Your plan for this/i.test(r) && /My PMOS plan/.test(r), r); await done(a);
}

// ---------- 4 none where it shouldn't be ----------
{
  let a = await open({ seed: m2('hot', 2, { settings: { discreet: true } }) });
  check('4 a shared phone: no plan row on her guide', !(await row(a.page, 'a-midlife.hot-flushes-night-sweats'))); await done(a);
  a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(60) }, intake: { goal: 'track', stage: 'preg' }, goals: ['preg'] } });
  check('4 in a pregnancy: none', !(await row(a.page, 'a-cycle.painful-periods'))); await done(a);
  a = await open({ seed: { dob: '1989-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(200) } });
  check('4 before 40 with her periods stopped: no plan offered (the gynaecologist first)', !(await row(a.page, 'a-midlife.hot-flushes-night-sweats'))); await done(a);
  a = await open({});
  check('4 a subject no plan at her stage covers (sleep, tracking her periods): none', !(await row(a.page, 'a-mind_body.sleep-and-hormones'))); await done(a);
}

// ---------- 5 a Qura doctor for medical help ----------
{
  const a = await open({ seed: m2('hot', 2) });
  const lead = {};
  for (const k of ['midlife.bleeding-after-menopause', 'intimate.burning-when-peeing']) {
    await go(a.page, 'a-' + k); lead[k] = { qura1: await has(a.page, '#view #art-ask.primary'), qura: await has(a.page, '#view #art-ask'), govtFirst: await has(a.page, '#view .btn.primary[data-go="access-doctor"]') };
  }
  /* Version 39.68 (the doctors' review): "Who treats what" is gone (its message goes into the app's words), and so is the free government
     doctor page, so the bleeding and burning guides lead with a Qura doctor, who checks and recommends a gynaecologist */
  await go(a.page, 'a-pmos.who-treats-what');
  check('5 "Who treats what" is gone: it lands on Learn', (await hash(a.page)) === '#learn', await hash(a.page));
  check('5 the bleeding and burning guides lead with "Ask a Qura doctor about this"', ['midlife.bleeding-after-menopause', 'intimate.burning-when-peeing'].every((k) => lead[k].qura1 && !lead[k].govtFirst), lead);
  await go(a.page, 'iron');
  check('5 the iron tablets page asks a Qura doctor', /Ask a Qura doctor/.test(await txt(a.page, '#view [data-ask]')), await txt(a.page, '#view [data-ask]')); await done(a);
}

// ---------- 6 Hindi at 360 px ----------
{
  const a = await open({ seed: { lang: 'hi' }, w: 360, h: 800 });
  const r = await row(a.page, 'a-cycle.painful-periods');
  check('6 Hindi: "इसके लिए एक मुफ़्त प्लान", no sideways scroll', /इसके लिए एक मुफ़्त प्लान/.test(r) && await noScroll(a.page), r); await done(a);
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const n = results.filter((r) => r.pass).length;
console.log(n + '/' + results.length + ' checks passed');
process.exit(n === results.length ? 0 : 1);
