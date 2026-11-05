// Version 39.38: the 38-week walk's fixes (Mohit's Flip5, 29 Oct: "can you do a walkthrough on my phone and check gaps", then
// "fix all 8"; MODULE_API section 81). This file checks:
//   1 Day complete counts her daily steps: a "Due now" that waits for her visit isn't in "All n done today";
//   2 My plan's "Every day n steps" and its steps' bar count the same daily steps;
//   3 her iron and calcium tablets are started, not "due", once she takes them in Sakhi (a reminder on, or a tick in 2 weeks),
//     and Today's "Due now" names check-ups and tests only;
//   4 "My baby is born" starts on today's date with "I am breastfeeding" ticked;
//   5 bleeding in a pregnancy is "Bleeding" in the Diary (My cycles and Days), not a cycle that runs to now or "Period started",
//     with no "Add a past period"; her last period before it stays a period;
//   6 from 34 weeks For you has her hospital bag, birth plan and contraction timer, right after her goal's first tool (Version 39.62:
//     her first 3 tools, so the contraction timer is on Today from 37 weeks);
//   7 the week page's "Call 112 now if" card has a Call 112 button (Version 39.70: "Go to the nearest hospital now if", Call 102);
//   8 in a pregnancy Help's "See a doctor" and the screen it opens say her gynaecologist looks after the pregnancy;
//   9 Hindi at 360 px; 10 no page errors.
// Usage: node test/latepreg.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'latepreg'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.34-pilot', platform: 'android' };
/* pregnant `w` weeks today (her last period 7w + 3 days ago), with her doctor (or o.care) */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(10), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* her saved answers, and a running My pregnancy (version 2) that started `startAgo` days ago (0: today, her day 1) */
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 10, pnow: null }, o || {});
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (startAgo, o, seed) => Object.assign({}, seed || {}, { mods: Object.assign({ plan: preg(startAgo, o) }, (seed || {}).mods || {}), intake: (o && o.intake) || IK() });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  if (o.bridge) await ctx.addInitScript(bridge({ notify: true }));   /* the Android bridge, as test/notify.mjs fakes it */
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
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const ids = async (a) => (await acts(a)).map((x) => x.id);
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());

const ifaRem = { id: 'preg-ifa', mod: 'preg', title: { en: 'IFA tablet, 2 hours after a meal', hi: 'IFA की गोली, खाने के 2 घंटे बाद' }, kind: 'med', start: ago(30), every: 1, time: '21:00' };
const tick = async (a) => { const n = await a.page.$$eval('[data-today-act]', (xs) => xs.length);
  for (let i = 0; i < n; i++) { await a.page.$$eval('[data-today-act]', (xs) => { const b = xs.find((x) => !x.closest('.done, .on, [aria-pressed="true"]')); if (b) b.click(); }); await settle(a.page, 400); } };
const tc = (a, sel) => a.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');   /* closed <details> too */
const allText = (a) => a.page.evaluate(() => document.querySelector('#view').textContent.replace(/\s+/g, ' '));

/* ---------- 1, 2 her daily steps, with "Due now" waiting ---------- */
{
  const a = await open({ seed: withPlan(10, { intake: IK({ psafeW: 12 }) }, { situation: sit(12) }) });   /* 12 weeks: a check-up is due */
  const x0 = await acts(a); const n = x0.length - 1;
  check('1 her steps: daily steps, then "Due now" last', x0.length >= 3 && x0[x0.length - 1].id === 'pdue', x0.map((x) => x.id));
  await tick(a);
  const dc = await txt(a, '.pl-dc');
  check('1 Day complete: "All ' + n + ' done today", not counting "Due now"', new RegExp('All ' + n + ' done today').test(dc) && !new RegExp('All ' + (n + 1) + ' done').test(dc), dc);
  await go(a, 'plan');
  const bar = await a.page.$$eval('#view .pl-t4-bar i', (xs) => xs.length);
  check('2 My plan: the steps\' bar has ' + n + ' marks, all done', bar === n && (await a.page.$$eval('#view .pl-t4-bar i.on', (xs) => xs.length)) === n, bar);
  await done(a);
  const w1 = await open({ seed: withPlan(2, { intake: IK({ psafeW: 12 }) }, { situation: sit(12) }), hash: 'plan' });
  if (await has(w1, '#pl-howlink')) await tap(w1, '#pl-howlink');   /* her week's "How it works" (the page's card in her first week) */
  const m = (await acts(w1)).filter((x) => x.id !== 'pdue').length; const all = (await allText(w1)) + ' ' + (await txt(w1, '#sheet-root'));
  check('2 My plan: "Every day ' + m + ' steps", with "Due now" waiting', (await ids(w1)).indexOf('pdue') >= 0 && new RegExp('Every day ?' + m + ' steps, check-in').test(all) && !new RegExp((m + 1) + ' steps, check-in').test(all), (all.match(/Every day ?\d+ steps?, check-in[^.]{0,12}/) || [''])[0]);
  await done(w1);
}

/* ---------- 3 her tablets ---------- */
{
  const a = await open({ seed: withPlan(30, {}, { situation: sit(38), reminders: [ifaRem] }) });
  const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('3 Today\'s "Due now" names no tablet', due.indexOf('ifa') < 0 && due.indexOf('ca') < 0, due);
  const pd = (await acts(a)).find((x) => x.id === 'pdue');
  check('3 ... and its step doesn\'t name them', !pd || !/iron|calcium|IFA/i.test((pd.title || '') + ' ' + (pd.sub || '')), pd);
  await go(a, 'preg-plan');
  check('3 her iron reminder on: Iron tablets show as done on Check-ups and tests', /Done: from your (MCP|pregnancy) card, logs or tools/.test(await tc(a, '[data-plan="ifa"]')), await tc(a, '[data-plan="ifa"]'));
  check('3 calcium, not taken in Sakhi: still there to start', !/Done: from/.test(await tc(a, '[data-plan="ca"]')), await tc(a, '[data-plan="ca"]'));
  await done(a);
  const tabs = {}; for (let i = 1; i <= 5; i++) tabs[ago(i)] = { ca: true };
  const b = await open({ seed: { situation: sit(38), mods: { preg: { tabs: tabs } } }, hash: 'preg-plan' });
  check('3 calcium ticked this week: done', /Done: from your (MCP|pregnancy) card, logs or tools/.test(await tc(b, '[data-plan="ca"]')), await tc(b, '[data-plan="ca"]'));
  const tabs2 = {}; tabs2[ago(20)] = { ca: true };
  await done(b);
  const c = await open({ seed: { situation: sit(38), mods: { preg: { tabs: tabs2 } } }, hash: 'preg-plan' });
  check('3 a tick 3 weeks ago only: not done', !/Done: from/.test(await tc(c, '[data-plan="ca"]')), await tc(c, '[data-plan="ca"]'));
  await done(c);
}

/* ---------- 4 "My baby is born" ---------- */
{
  const a = await open({ seed: { situation: sit(38) } });
  await tap(a, '#stage-btn'); await tap(a, '[data-stage="post"]');
  const v = await a.page.evaluate(() => ({ d: (document.querySelector('#st-birth') || {}).value, bf: !!(document.querySelector('#st-bf') || {}).checked }));
  check('4 from a pregnancy: the birth date is today, "I am breastfeeding" ticked', v.d === TODAY && v.bf, v);
  await done(a);
  const b = await open({ seed: { situation: { care: 'private' }, events: [{ d: ago(20), t: 'start' }, { d: ago(16), t: 'end' }] } });
  await tap(b, '#stage-btn'); await tap(b, '[data-stage="post"]');
  check('4 not pregnant: no date filled in (she says when)', (await b.page.evaluate(() => (document.querySelector('#st-birth') || {}).value)) === '');
  await done(b);
}

/* ---------- 5 bleeding in a pregnancy, in the Diary ---------- */
const lmp = ago(7 * 38 + 3);
const pEvents = [{ d: iso(lmp, -29), t: 'start' }, { d: iso(lmp, -25), t: 'end' }, { d: lmp, t: 'start' }, { d: iso(lmp, 4), t: 'end' }, { d: ago(2), t: 'start' }];
{
  const a = await open({ seed: { situation: sit(38), events: pEvents }, hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  const mc = await txt(a, '.mc-card');
  const fd = (d) => a.page.evaluate((x) => window.Saathi.fmtD ? window.Saathi.fmtD(new Date(x + 'T12:00:00')) : x, d);
  const d2 = await fd(ago(2));
  check('5 My cycles: the bleed 2 days ago is "Bleeding", not counted, never a cycle to now', new RegExp(d2 + ' Edit dates Bleeding · not counted: pregnancy').test(mc) && !/Cycle day/.test(mc) && !new RegExp(d2 + ' – now').test(mc), mc.slice(0, 400));
  check('5 ... no "Add a past period" in a pregnancy', !(await has(a, '#ap-add')));
  await tap(a, '[data-tab="days"]');
  const heads = await a.page.$$eval('.dy-gh', (xs) => xs.map((x) => x.innerText.trim()));
  check('5 Days: not "Period from" (Version 39.41: the days inside the pregnancy are one "In your pregnancy" group)', heads.indexOf('In your pregnancy') >= 0 && !heads.some((h) => h.indexOf('Period from ' + d2) === 0), heads);
  const tags = await a.page.$$eval('.dy-tag.p', (xs) => xs.map((x) => x.innerText.trim()));
  check('5 Days: the day says "Bleeding"; her last period before the pregnancy still says "Period started"', tags.indexOf('Bleeding') >= 0 && tags.indexOf('Period started') >= 0, tags);
  await done(a);
  const b = await open({ seed: { situation: { care: 'private' }, events: [{ d: ago(50), t: 'start' }, { d: ago(46), t: 'end' }, { d: ago(20), t: 'start' }, { d: ago(16), t: 'end' }] }, hash: 'diary' });
  await tap(b, '[data-tab="tr"]');
  check('5 not pregnant: "Add a past period" as before', await has(b, '#ap-add'));
  await done(b);
}

/* ---------- 6 For you from 34 weeks ---------- */
const fyRoutes = (a) => a.page.$$eval('.care-sec .list [data-go]', (xs) => xs.map((x) => x.dataset.go));
{
  const a = await open({ seed: withPlan(30, {}, { situation: sit(38) }), hash: 'care' });
  const r = await fyRoutes(a);
  /* Version 39.62 (phase D): For you holds her first 3 tools; from 37 weeks the contraction timer is on Today (Version 39.40) */
  check('6 38 weeks: For you has the hospital bag and birth plan, after her goal\'s first tool', r.slice(1, 3).join() === 'pregtools-bag,pregtools-birth' && r.length <= 3, r);
  await a.page.evaluate(() => { location.hash = 'home'; }); await settle(a.page, 500);
  check('6 ... and the contraction timer on Today', await a.page.$('#view [data-go="pregtools-contractions"]').then((x) => !!x));
  await done(a);
  const b = await open({ seed: withPlan(30, {}, { situation: sit(20) }), hash: 'care' });
  const r2 = await fyRoutes(b);
  check('6 20 weeks: not yet', !r2.some((x) => /pregtools-(bag|birth|contractions)/.test(x)), r2);
  await done(b);
}

/* ---------- 7 the week page's Call 112 ---------- */
{
  const a = await open({ seed: { situation: sit(38) }, hash: 'preg-week' });
  check('7 the week page: "Go to the nearest hospital now if" with a Call 102 button', /Go to the nearest hospital now if/.test(await view(a)) && (await tels(a, '#view .pg-call')) === '102', await tels(a, '#view'));
  await done(a);
}

/* ---------- 8 Help's "See a doctor" in a pregnancy ---------- */
{
  const a = await open({ seed: { situation: sit(38) } });
  await a.page.evaluate(() => window.Saathi.openHelp ? window.Saathi.openHelp() : document.querySelector('[data-help], #help-btn, .help-btn').click()); await settle(a.page, 500);
  const hd = await txt(a, '#hs-doc');
  check('8 Help: "See a doctor" says her gynaecologist looks after the pregnancy', /Your gynaecologist for the pregnancy; a Qura doctor for food, weight and sleep/.test(hd), hd);
  await tap(a, '#hs-doc'); await settle(a.page, 400);
  check('8 ... and the screen it opens says it first', /^Talk to a Qura doctor A free call with a Qura doctor \(BAMS\) can help with food, weight and sleep\. Your gynaecologist looks after the pregnancy itself, medicines and scans\./.test(await view(a)), (await view(a)).slice(0, 300));
  await done(a);
  const g = await open({ seed: { situation: sit(38, { care: 'govt' }) } });
  await g.page.evaluate(() => window.Saathi.openHelp ? window.Saathi.openHelp() : document.querySelector('[data-help], #help-btn, .help-btn').click()); await settle(g.page, 500);
  check('8 the government route: her ANM or gynaecologist', /Your ANM or gynaecologist for the pregnancy/.test(await txt(g, '#hs-doc')), await txt(g, '#hs-doc'));
  await done(g);
  const c = await open({ seed: { situation: { care: 'private' } } });
  await c.page.evaluate(() => window.Saathi.openHelp ? window.Saathi.openHelp() : document.querySelector('[data-help], #help-btn, .help-btn').click()); await settle(c.page, 500);
  check('8 not pregnant: "A call with a Qura doctor" (Version 39.68: no free government doctor page)', /A call with a Qura doctor/.test(await txt(c, '#hs-doc')) && !/government/.test(await txt(c, '#hs-doc')), await txt(c, '#hs-doc'));
  await done(c);
}

/* ---------- 9 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: { lang: 'hi', situation: sit(38), events: pEvents }, hash: 'diary' });
  await tap(a, '[data-tab="tr"]');
  check('9 Hindi at 360 px: My cycles says ब्लीडिंग, no side scroll', /ब्लीडिंग · गिना नहीं गया: गर्भावस्था/.test(await txt(a, '.mc-card')) && (await noScroll(a)), (await txt(a, '.mc-card')).slice(0, 300));
  await go(a, 'preg-week');
  check('9 Hindi at 360 px: the week page\'s call button', (await tels(a, '#view .pg-call')) === '102' && (await noScroll(a)));
  await shot(a, 'hi-week');
  await done(a);
}

check('10 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (latepreg)');
process.exit(failed.length ? 1 : 0);
