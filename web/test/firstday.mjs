// Version 37.1: her first day (docs/first-days-audit-2026-10-24.md, section 8; MODULE_API section 40). Mohit, 24 Oct: "i just
// entered details while onboarding and i am straight on to program, i felt i am not sure whats happening my expectations were
// not set". This file checks the acceptance criteria:
//   1 the welcome names the plan, the daily steps, the evening check-in and "about 3 minutes"; the joining bar has 4 named parts
//     (Version 39.10: about you, her stage, her goals, details; then "Your Sakhi", her first log, and the plan offered on Today);
//   2 "More than a month ago" asks how long ago, and saves a guessed date;
//   3 before her plan she sees what she told Sakhi, and can change it; the reminder question has left joining;
//   4 the plan as cards: what she does each day, how long, when Sakhi checks in, a missed day, weeks 1, 4 and 12; no percentage;
//   5 until "Start my plan": no steps, no week count, no reminder and no check-in; the top card is "Your plan is ready";
//   6 reminders are offered on the Start screen; after Start, Today has one tip and no other pop-up;
//   7 urgent cards first (more than 42 weeks pregnant, next to a plan card and an explain card);
//   8 days 1 to 3: her plan leads "Sakhi says", "keep an eye on it" cards and the heads-up, setup and Coming up wait, month
//     cards don't; no petal until the first check-in, then one celebration; the check-in's first-time and "see you" lines;
//   9 "Tomorrow" makes tomorrow day 1 (no ring tonight, Today says so); after 9 pm the Start screen picks tomorrow;
//   10 "What's new" once for a woman updating, never for a new one;
//   11 a goal change keeps the old plan and its answers until the new one starts;
//   12 the migration: a Version 37 plan never started waits to be started; a Version 35 plan keeps running;
//   13 a pregnancy plan keeps its reminder; a cycle plan in pregnancy pauses its reminder;
//   14 the day-3 "Questions about your plan?" card, once, never in discreet mode;
//   15 Dr. Megha's welcome only when the build carries her recording;
//   16 discreet mode, Hindi, a 360 px screen, the doctor summary by plan, and no page errors.
// Usage: node test/firstday.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'firstday-test'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* canNotify is off until askNotify is called (as on a new phone), so the Start screen's offer can be checked */
const ANDROID = 'window.__rings = []; window.__asked = 0; window.SakhiAndroid = { schedule(j){ try { window.__rings = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return !!window.__notifOk; }, askNotify(){ window.__asked++; window.__notifOk = true; setTimeout(() => window.__sakhiNotify && window.__sakhiNotify(true), 20); }, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.37-pilot', platform: 'android' };   /* no server address: the stand-in server, whose code is 123456 */
const regular = () => { const out = []; [84, 56, 28].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: {}, body: [], ppv2No: '2026-10-01' }, extra || {});   /* Version 39.55: she kept her plan when My period plan was offered (periodplan.mjs checks the offer) */
const IK = { at: ago(1), stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'b24', work: 'day', when: 'dinner' };

const browser = await chromium.launch();
const allErrs = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(o.cfg || LOCAL) + ';');
  await ctx.addInitScript(ANDROID + (o.notif === false ? '' : ' window.__notifOk = true;'));
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(Object.assign({}, ACCT, o.acct || {}))) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { errs.push(String(e.message).slice(0, 200)); allErrs.push(String(e.message).slice(0, 200)); });
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const jump = async (page, day, hm, h) => { await page.clock.setSystemTime(at(day, hm)); await go(page, 'diary'); await go(page, h || 'home'); await settle(page, 600); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const pop = (page) => page.evaluate(() => ({ sheet: (document.querySelector('#sheet-root .sheet') || {}).innerText || '', tour: (document.querySelector('#tour-root .tour-pop') || {}).innerText || '', joy: !!document.querySelector('#joy-root .joy-pop, #joy-root .joy-burst') }));
const slotFirst = (page) => page.$eval('#view .slot', (s) => { const c = s.children[1]; return c ? c.innerText.split('\n')[0] : ''; }).catch(() => '');
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const closeTips = async (page) => { for (let k = 0; k < 6; k++) { const did = await page.evaluate(() => { const b = document.querySelector('#tour-root #tour-later, #tour-root #tour-next'); if (b) { b.click(); return true; } return false; }); if (!did) break; await settle(page, 300); } };
/* Version 39.10: joining, from the language screen to the shared-phone question (test/join.mjs) */
/* walks the plan's cards to the Start screen, collecting their words */
async function cardsToStart(page) {
  let words = '';
  /* Version 39.8: a step's reason sits behind "Why?"; read it too (a shared phone must show no health words there either) */
  const why = () => page.$$eval('#view details.pl-why-d', (xs) => xs.map((x) => 'Why: ' + x.textContent.replace(/^\s*\S+\s*/, '')).join('\n'));
  for (let i = 0; i < 8; i++) { words += '\n' + (await view(page)) + '\n' + (await why()); if (await has(page, '#pl-rv-go')) break; await tap(page, '#pl-rv-next'); }
  return words;
}
const pend = (page, a) => page.evaluate((x) => { const S = window.Saathi; S.plan.startFromIntake(x); S.save(); }, a);

/* ---------- 1–6, 8. A new woman: welcome, joining, her first log, her plan's cards, Start, her first day (Version 39.10: the
   plan is offered on Today after her first log) ---------- */
{
  const { ctx, page, errs } = await open({ seed: null, notif: false });
  await tap(page, '[data-ob-lang="en"]');
  let v = await view(page);
  check('1 the welcome names the plan made for her', /Your period diary, and a plan made for you/.test(v) && /12-week plan/.test(v), v.slice(0, 300));
  check('1 the welcome names the daily steps and the evening check-in', /Small steps each day, and a 1-minute check-in each evening/.test(v), v.slice(0, 300));
  check('1 the start button says how long joining takes', /Start · about 3 minutes/.test(await txt(page, '#w-start')), await txt(page, '#w-start'));
  check('1 Version 39.10: one way in, no "I just want to read"', !(await has(page, '#w-browse')));
  await tap(page, '#w-start');
  check('1 the joining bar names 4 parts, "About you" first', (await txt(page, '.ob-parts')).replace(/\n/g, '|') === 'About you|Your stage|Your goals|Details' && /About you/.test(await txt(page, '.ob-parts .on')), await txt(page, '.ob-parts'));
  await page.fill('#ob-name', 'Riya');
  for (const x of ['[data-ob-dec="1990"]', '[data-ob-y="1999"]']) await tap(page, x);
  check('1 part 2, "Your stage": 7 tiles', /Your stage/.test(await txt(page, '.ob-parts .on')) && (await page.$$('[data-ob-st]')).length === 7, await txt(page, '.ob-parts .on'));
  await tap(page, '[data-ob-st="pmos"]');
  check('1 part 3, "Your goals"', /Your goals/.test(await txt(page, '.ob-parts .on')), await txt(page, '.ob-parts .on'));
  await tap(page, '[data-ob-goal="irregular"]'); await tap(page, '#ob-next');
  await tap(page, '#jd-none');   /* Version 39.26: the quick choices sit behind "I don't remember the dates" */
  v = await view(page);
  check('3 her details say why Sakhi asks', /Why we ask: Sakhi marks your next period, and notices longer gaps./.test(v) && /Details/.test(await txt(page, '.ob-parts .on')), v.slice(0, 300));
  await tap(page, '[data-ob-lp="more"]');
  v = await view(page);
  check('2 "More than a month ago" asks how long ago', /About how long ago\?/.test(v) && /5 to 6 weeks/.test(v) && /About 2 months/.test(v) && /3 months or more/.test(v), v.slice(0, 400));
  for (const x of ['[data-ob-lpm="60"]', '[data-ob-gap="g45"]', '[data-ob-dx="ns"]']) await tap(page, x);
  await tap(page, '#ob-next');
  check('3 no reminder question while joining: next is where she gets care (Version 39.28), then who uses this phone', await has(page, '[data-ob-care]') && !/When should Sakhi remind you/.test(await view(page)));
  await tap(page, '[data-ob-care="none"]'); await settle(page, 200);   /* Version 39.58.1: "Nowhere yet", so her setup card keeps free care near her (day 4 below) */
  await tap(page, '[data-ob-sh="me"]'); await settle(page, 400);
  let s = await st(page);
  check('2 the guessed date is saved as a guess, about 2 months ago', s.events.some((e) => e.t === 'start' && e.approx && e.d === ago(60)), s.events);
  check('5 sign-up promises no plan yet (it comes after her first log)', !/Your plan is ready/.test(await view(page)) && !(s.mods.plan || {}).next, (await view(page)).slice(0, 300));
  check('5 no tabs behind sign-up', await page.$eval('#tabbar', (e) => e.hidden).catch(() => true));
  await page.fill('#su-num', '9876543210'); await tap(page, '#su-send'); await page.fill('#su-code', '123456'); await settle(page, 900);
  if (await has(page, '#su-done')) { await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); }
  await settle(page, 900);
  check('4 after sign-up, "Your Sakhi" by her name, not straight into a plan', (await page.evaluate(() => location.hash)) === '#your-sakhi' && /Riya, here’s your Sakhi/.test(await view(page)) && !(s.mods.plan || {}).next, (await view(page)).slice(0, 300));
  await shot(page, '01-your-sakhi');
  await tap(page, '#ys-skip'); await closeTips(page);
  check('5 Today straight after joining: her plan offered (Version 39.61: her first log no longer holds it), "Made from your answers."', (await has(page, '#pl-off-go')) && /Made from your answers\./.test(await view(page)), (await view(page)).slice(0, 600));
  await go(page, 'diary'); await closeTips(page);
  check('4 Diary opens on her first log, with why logging helps', await has(page, '#fl-card') && /Why log every day\?/.test(await view(page)), (await view(page)).slice(0, 400));
  await tap(page, '[data-fl-days="5"]'); await tap(page, '[data-fl-sign="d_tired"]'); await tap(page, '#fl-save');   /* Version 39.17: the same 5 as everywhere */ await settle(page, 600);
  s = await st(page);
  check('4 her first log: her last period\'s end and today\'s tiredness', s.events.some((e) => e.t === 'end' && e.d === ago(56)) && (s.daily[TODAY] || []).indexOf('d_tired') >= 0 && !!s.prompts.firstLog, [s.events, s.daily]);
  await go(page, 'home'); await closeTips(page);
  check('4 then Today offers her plan, first in "Sakhi says"', /^Ready for you$/i.test(await slotFirst(page)) && await has(page, '#pl-off-go'), [await slotFirst(page), (await st(page)).prompts]);
  await tap(page, '#pl-off-go');
  v = await view(page);
  check('3 her periods screen says why Sakhi asks, and doesn\'t ask again what she said while joining (the gap, a diagnosis)', /So Sakhi knows where you’re starting, and can show you what changes/.test(v) && !(await has(page, '[data-pl-q^="gap:"]')) && !(await has(page, '[data-pl-q^="dx:"]')) && await has(page, '[data-pl-q="skips:y"]'), v.slice(0, 300));
  await tap(page, '[data-pl-q="skips:y"]'); await tap(page, '[data-pl-m="signs:acne"]'); await tap(page, '#pl-in-next');
  v = await view(page);
  check('3 no "Your day" (Version 39.66: her day\'s questions wait for Today), and no reminder question', !/So your steps fit your day/.test(v) && !/When should Sakhi remind you/.test(v), v.slice(0, 500));
  check('3 her walk time says what Sakhi does with it', /Sakhi nudges you to walk at this time each day/.test(await view(page)));   /* Version 39.74: the cycle plan */
  await tap(page, '[data-pl-when="evening"]'); await settle(page, 600);   /* Version 39.3: no body screen unless her goal is her weight */
  v = await view(page);
  check('3 her last answer makes her plan, from what she told Sakhi (Version 39.68: no answers summary)', !/Here’s what you told Sakhi/.test(v) && /Made from what you told Sakhi: 36 to 45 days apart · some months skipped · acne that keeps coming back/.test(v), v.slice(0, 700));
  check('4 "Make my plan" opens her plan', (await page.evaluate(() => location.hash)) === '#plan-reveal' && /Your plan is ready, Riya/.test(await view(page)), [await page.evaluate(() => location.hash), (await view(page)).slice(0, 300)]);
  v = await view(page);
  check('4 card 1: her goal, what it is made from, and how long it takes', /Your goal: more regular periods/.test(v) && /Made from what you told Sakhi: 36 to 45 days apart · some months skipped · acne that keeps coming back/.test(v) && /12 weeks · from about \d+ minutes a day/.test(v), v.slice(0, 500));
  await shot(page, '02-card1');
  /* 5. before Start: nothing runs */
  s = await st(page);
  check('5 the plan waits: no first day, no reminder', !s.mods.plan.start && !!s.mods.plan.next && !(s.reminders || []).some((r) => r.id === 'plan'), s.mods.plan);
  await go(page, 'home'); await closeTips(page);
  v = await view(page);
  check('5 Today before Start: no steps and no week count', !/Day 1 ·|Week 1 of 12|Move 10 minutes today|Half the plate sabzi/.test(v) && !(await has(page, '#view .pl-th')), v.slice(0, 900));
  check('5 Today before Start: the top card is "Your plan is ready"', (await slotFirst(page)) === 'Your plan is ready', await slotFirst(page));
  await go(page, 'plan-checkin');
  check('5 no check-in before Start (her plan shows instead)', !(await has(page, '#pl-ci-save')) && (await has(page, '.pl-rv')));
  await page.evaluate(() => { window.Saathi.mem.rvCard = 0; }); await go(page, 'plan-reveal');
  const words = await cardsToStart(page);
  check('4 card 2: her steps, each with what it does for her (Version 39.45: her first day\'s 3; her bedtime "From day 4"; 39.66: asked on day 4, so named without a time)', /Your 3 steps/.test(words) && /From day 4: a regular bedtime/.test(words) && /Yoga at home every day, with moving pictures/.test(words) && /A 10-minute walk after lunch and after dinner, and a brisk 30 to 45 minutes when your day allows/.test(words) && /helps your body use insulin better/.test(words) && !/It grows a little each week/.test(words), words.slice(0, 900));   /* Version 39.72: her walk is 10 minutes after lunch and after dinner */
  check('4 one screen (Version 39.72, the doctors\' review): no cards for how each day works or what happens when (they are My plan\'s How it works); the check-in time on its Start', !/How each day works|What happens when/.test(words) && /8 pm/.test(words) && !(await has(page, '#pl-rv-next')), words.slice(0, 1600));
  check('4 a doctor check card for skipped months, alongside her plan', /Alongside your plan: one doctor check/.test(words) && /You can start your steps today/.test(words));
  check('4 no percentage anywhere on her plan', !/%/.test(words));
  check('15 no Dr. Megha button without her recording', !/Hear Dr. Megha/.test(words));
  v = await view(page);
  check('6 the Start screen: today, tomorrow or Monday, and an evening check-in time', /When do you want to start\?/.test(v) && /Today/.test(v) && /Tomorrow/.test(v) && /Monday, 2 Nov/.test(v) && /6 pm/.test(v) && /9 pm/.test(v) && !/8 am|1 pm/.test(v), v.slice(0, 600));
  check('6 the Start screen names what will ring, and asks nothing (Version 39.27: reminders on by default; 39.43: her wind-down comes with her bedtime step, from day 4; 39.45: named with its day; 39.66: named on day 4, when her bedtime is asked)', /Reminders are on: your 6 pm time to move and your 8 pm check-in\. Nothing shows on the lock screen\./.test(v) && !(await has(page, '#pl-st-allow')), v.slice(0, 900));
  await shot(page, '03-start');
  await closeTips(page);
  await tap(page, '#pl-rv-go'); await settle(page, 1500);
  check('6 Start brings the phone\'s own "Allow", once (Version 39.27)', (await page.evaluate(() => window.__asked)) === 1);
  let p = await pop(page);
  check('6 after Start: Today, no tip and no sheet (Version 39.68: no tip starts on its own)', (await page.evaluate(() => location.hash)) === '#home' && !p.sheet && !p.tour, [p, (await st(page)).tours, (await st(page)).tourDay]);
  check('8 no petal on Start', !p.joy, [p, await page.evaluate(() => (document.querySelector('#joy-root') || {}).innerText || ''), (await st(page)).mods.joy]);
  await closeTips(page); await settle(page, 2500);
  p = await pop(page);
  check('6 no other pop-up after the tip', !p.sheet && !p.tour && !p.joy, p);
  s = await st(page);
  check('5 Start starts it: day 1 today, the 8 pm reminder', s.mods.plan.start === TODAY && s.mods.plan.go === true && !s.mods.plan.next && (s.reminders || []).some((r) => r.id === 'plan' && r.time === '20:00' && r.start === TODAY), [s.mods.plan.start, s.reminders]);
  v = await view(page);
  check('8 day 1: her plan leads "Sakhi says"', (await slotFirst(page)) === 'Day 1 of your plan' && /Your first step: Cycle care yoga · \d+ min\. At 8 pm, a 1-minute check-in\./.test(v), [await slotFirst(page), v.slice(0, 900)]);
  check('8 day 1: Today counts her plan by plan day (Version 39.14), and the check-in waits for the evening', /PLAN DAY 1/.test(v) && /0 of 3 done today/.test(v) && /Check-in at 8 pm/.test(v) && !(await has(page, '#view .today-card .pl-t-ci')), v.slice(0, 900));
  check('8 day 1: the "keep an eye on it" card waits (no period for 60 days)', !(await has(page, '#view [data-xp-lv="watch"]')));
  check('8 day 1: the heads-up, setup and Coming up wait', !(await has(page, '#view .hu-card')) && !(await has(page, '#view .setup-card')) && !(await has(page, '#view .cu-empty')));
  await shot(page, '04-day1-today');
  /* a Done before the evening: still no petal, and now the check-in shows */
  await tap(page, '#view .today-card [data-today-act]'); await settle(page, 1500);
  check('8 a Done on day 1: no petal yet', !(await pop(page)).joy);
  check('8 after her first Done, the check-in button shows', await has(page, '#view .today-card .pl-t-ci[data-go="plan-checkin"]'));
  await jump(page, 0, '20:05', 'plan-checkin');
  check('8 the first check-in says it takes a minute and stays on the phone', /This takes a minute. Your answers stay on this phone./.test(await view(page)), (await view(page)).slice(0, 300));
  for (const g of await page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))])) await tap(page, '[data-ci="' + g + ':d"]');
  await tap(page, '#pl-ci-save'); await settle(page, 300);
  v = await view(page);
  check('8 after the first check-in: tomorrow, and when (one "Tomorrow" line: Version 39.37)', (/Tomorrow: the same steps\. See you at 8 pm\./.test(v) && (v.match(/Tomorrow:/g) || []).length === 1) || (/See you tomorrow at 8 pm\./.test(v) && !/Tomorrow: the same steps/.test(v)), v.slice(0, 500));
  check('8 the check-in has no petal (Version 39.68: My garden is gone), and no panel over it', !/A petal for your garden/.test(v) && !(await pop(page)).joy);
  await shot(page, '05-first-checkin');
  /* day 2: yesterday */
  await jump(page, 1, '09:00'); await closeTips(page);
  v = await view(page);
  const yd = await page.$$eval('#view .today-card .pl-d7d', (x) => { const i = x.findIndex((y) => y.classList.contains('now')); const y = x[i - 1]; return y ? { c: y.querySelector('i').className, t: y.title } : null; });
  check('8 day 2: Today shows what she did yesterday (Version 39.14: her week\'s dots)', /PLAN DAY 2/.test(v) && yd && yd.c === 'full' && /: 3 of 3 steps$/.test(yd.t), [yd, v.slice(0, 900)]);
  check('8 day 2: no first-day card', (await slotFirst(page)) !== 'Day 1 of your plan', await slotFirst(page));
  await jump(page, 2, '09:00'); await closeTips(page);
  v = await view(page);
  const yd3 = await page.$$eval('#view .today-card .pl-d7d', (x) => { const i = x.findIndex((y) => y.classList.contains('now')); const y = x[i - 1]; return y ? { c: y.querySelector('i').className, t: y.title } : null; });
  check('8 day 3: small steps add up', /3 days in: small steps add up./.test(v) && yd3 && yd3.c === '' && /: 0 of 3 steps$/.test(yd3.t), [yd3, v.slice(0, 900)]);
  await jump(page, 3, '09:00'); await closeTips(page);
  check('8 day 4: the cards that waited come back (Coming up); no setup card, as its last step was free care (Version 39.68: Govt. services is gone)', ((x) => /Coming up/.test(x) && !/Set up Sakhi for you/.test(x))(await page.$eval('#view .slot', (e) => e.textContent).catch(() => '')));
  check('8 day 4: "no period yet" is folded into the plan\'s doctor check (Version 37.2)', (await page.$eval('#view .slot', (s) => s.children[1] ? s.children[1].innerText.split('\n')[0] : '').catch(() => '')) === 'Did you get the doctor check?' && !(await has(page, '#view [data-xp-lv="watch"]')));
  await jump(page, 4, '20:05', 'plan-checkin');
  check('8 later check-ins have no first-time line', !/This takes a minute/.test(await view(page)));
  check('16 no page errors (new woman)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 8. A "month" card never waits; days 1 to 3 hold only "keep an eye on it" ---------- */
{
  const { ctx, page, errs } = await open({ seed: { events: [{ d: ago(100), t: 'start', approx: true }], mods: { plan: planOf('cycle', 'irregular', TODAY, { intake: IK, started: TODAY }) }, intake: IK } });
  await closeTips(page);
  check('8 a 100-day gap (a month card) shows on day 1', await has(page, '#view [data-xp-lv="month"]'));
  /* Version 39.0 (journey audit P1-09): a "see a doctor this month" signal from her records comes before her plan's day card,
     so it never folds under "More from Sakhi"; her plan still heads Today, and its day-1 card waits one tap down */
  check('8 the month card leads the slot, and her plan still heads Today', (await slotFirst(page)) !== 'Day 1 of your plan' && await has(page, '#view .slot [data-xp-lv="month"]') && /Day 1/.test(await view(page)) && /Day 1 of your plan/.test(await page.$eval('#view .slot-more', (e) => e.textContent).catch(() => '')), await slotFirst(page));
  check('16 no page errors (month card)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 7. Urgent first: 42+ weeks pregnant, with a plan card and an explain card ---------- */
{
  const since = ago(300);
  const { ctx, page, errs } = await open({ seed: { events: [], situation: { pregnant: true, pregnantSince: since }, checkins: { [TODAY.slice(0, 7)]: { at: TODAY, kind: 'preg', chips: ['mood'] } }, mods: { plan: planOf('preg', 'food', ago(4), { intake: { stage: 'preg', goal: 'food' } }) } } });
  await closeTips(page);
  const v = await view(page);
  check('7 more than 42 weeks: the urgent line shows', await has(page, '#view .pg-late'), v.slice(0, 900));
  check('7 the urgent line sits above "Sakhi says"', await page.evaluate(() => { const u = document.querySelector('#view .pg-late'); const sl = document.querySelector('#view .slot'); return !!u && (!sl || !!(u.compareDocumentPosition(sl) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
  check('7 the plan card and the explain card are there too', (await has(page, '#view .pl-slot')) && (await has(page, '#view .xp-home')), v.slice(0, 900));
  check('16 no page errors (urgent)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 9. Starting tomorrow ---------- */
{
  const { ctx, page, errs } = await open({ seed: { intake: IK }, now: at(0, '21:30') });
  await pend(page, Object.assign({}, IK, { stage: 'cycle' })); await go(page, 'plan-reveal');
  await cardsToStart(page);
  check('9 after 9 pm the Start screen picks tomorrow', await page.$eval('[data-rv-when="tomorrow"]', (b) => b.classList.contains('on')).catch(() => false));
  await tap(page, '#pl-rv-go'); await settle(page, 1200); await closeTips(page);
  let s = await st(page);
  check('9 tomorrow is day 1', s.mods.plan.start === iso(TODAY, 1), s.mods.plan.start);
  check('9 the reminder starts tomorrow', (s.reminders || []).some((r) => r.id === 'plan' && r.start === iso(TODAY, 1)), s.reminders);
  await settle(page, 1200);
  const rings = await page.evaluate(() => window.__rings || []);
  const first = rings.filter((r) => /^r-plan-/.test(r.id)).map((r) => r.id).sort()[0];
  check('9 no ring tonight: the first plan alarm is tomorrow', first === 'r-plan-' + iso(TODAY, 1), rings.map((r) => r.id));
  let v = await view(page);
  check('9 Today says when it starts, and its first step, with no steps yet', /Your plan starts tomorrow · Your first step: Cycle care yoga · \d+ min/.test(v) && !/Half the plate sabzi|Day 1 ·/.test(v), v.slice(0, 900));
  check('9 no "All done for today" under it', !/All done for today/.test(v));
  await go(page, 'plan');
  check('9 My plan says when, with "Start today instead"', /Your plan starts tomorrow/.test(await view(page)) && (await has(page, '#pl-soon-now')));
  await jump(page, 1, '10:00'); await closeTips(page);
  v = await view(page);
  check('9 tomorrow, day 1 begins (3 steps)', /PLAN DAY 1/.test(v) && /0 of 3 done today/.test(v) && (await slotFirst(page)) === 'Day 1 of your plan', v.slice(0, 900));
  check('16 no page errors (tomorrow)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 10. What's new ---------- */
{
  const old = { whatsNew: undefined, mods: { plan: planOf('cycle', null, ago(40), { go: undefined, pack: undefined }) }, situation: { pcos: true } };
  const { ctx, page, errs } = await open({ seed: old });
  await settle(page, 1500);
  let p = await pop(page);
  check('10 a woman updating hears what is new, once', /What’s new in Sakhi/.test(p.sheet) && /12-week plan/.test(p.sheet) && /Home is now “Today”, and Care is now “Explore”/.test(p.sheet), p.sheet);
  check('10 her PMOS plan carries on', /Your plan carries on/.test(p.sheet), p.sheet);
  await tap(page, '#wn-later'); await go(page, 'diary'); await go(page, 'home'); await settle(page, 1500);
  check('10 not again', !/What’s new/.test((await pop(page)).sheet));
  check('16 no page errors (what is new)', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: null });
  await join(page, { tile: 'cycle', goals: ['track'], y: 1999, lp: '24' }); await settle(page, 400);
  const s = await st(page);
  check('10 a new woman never sees it', s.whatsNew === '0.37');
  check('3 "Just keeping track" makes no plan, and none is offered', !(s.mods.plan || {}).next && !(s.mods.plan || {}).start && (s.intake || {}).goal === 'track' && !(s.prompts || {}).planOffer, [s.mods.plan, s.prompts]);
  check('16 no page errors (just tracking)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 11. A goal change keeps the old plan until the new one starts ---------- */
{
  const { ctx, page, errs } = await open({ seed: { intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(20), { intake: IK }) } } });
  await go(page, 'plan-settings'); await tap(page, '#pl-chg');   /* Version 39.15: Plan settings is a page of its own */
  await tap(page, '[data-pl-goal="pain"]');
  for (let i = 0; i < 6; i++) {
    if (!/plan-goal/.test((await page.evaluate(() => location.hash)))) break;   /* Version 39.68: her last answer makes the plan */
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="evening"]'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); await tap(page, '[data-pl-' + kind + '^="' + k + ':"]'); }
    await tap(page, '#pl-in-next');
  }
  let s = await st(page);
  check('11 the new plan waits; the old one runs with its own answers', s.mods.plan.pack === 'cycle' && s.mods.plan.start === ago(20) && s.mods.plan.next && s.mods.plan.next.pack === 'pain' && s.intake.goal === 'irregular', [s.mods.plan.pack, s.mods.plan.start, s.intake.goal]);
  check('11 the cards say it replaces the old plan when she starts it', /It replaces the plan you are on when you start it. What you logged stays./.test(await view(page)), (await view(page)).slice(0, 500));
  await go(page, 'home'); await closeTips(page);
  let v = await view(page);
  check('11 Today still shows the plan she is on', /week 3 · plan day/i.test(v) && (await slotFirst(page)) === 'Your new plan is ready', [await slotFirst(page), v.slice(0, 900)]);
  await tap(page, '#pl-next-drop');
  s = await st(page);
  check('11 "Keep my plan" drops the new one', !s.mods.plan.next && s.mods.plan.pack === 'cycle');
  /* again, and this time she starts it */
  await go(page, 'plan-settings'); await tap(page, '#pl-chg');   /* Version 39.15: Plan settings is a page of its own */ await tap(page, '[data-pl-goal="pain"]');
  for (let i = 0; i < 6; i++) {
    if (!/plan-goal/.test((await page.evaluate(() => location.hash)))) break;   /* Version 39.68: her last answer makes the plan */
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="evening"]'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); await tap(page, '[data-pl-' + kind + '^="' + k + ':"]'); }
    await tap(page, '#pl-in-next');
  }
  await cardsToStart(page); await tap(page, '#pl-rv-go'); await settle(page, 1200);
  s = await st(page);
  check('11 Start: the new plan and its answers take over', s.mods.plan.pack === 'pain' && s.mods.plan.start === TODAY && s.intake.goal === 'pain' && !s.mods.plan.next, [s.mods.plan.pack, s.intake.goal]);
  check('11 one plan reminder', (s.reminders || []).filter((r) => r.id === 'plan').length === 1);
  check('16 no page errors (goal change)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 12. The migration ---------- */
{
  const v37 = planOf('cycle', 'irregular', TODAY, { go: false, remAt: '08:00' });
  const { ctx, page, errs } = await open({ seed: { intake: IK, prompts: { setup: 'off', notifyIntro: ago(3), reveal: TODAY }, mods: { plan: v37 } } });
  await closeTips(page);
  let s = await st(page);
  check('12 a Version 37 plan never started now waits to be started', !!(await page.evaluate(() => window.Saathi.plan.pending())) && !(await page.evaluate(() => window.Saathi.plan.packOf())), s.mods.plan);
  check('12 Today: "Your plan is ready", no steps', (await slotFirst(page)) === 'Your plan is ready' && !/Day 1 ·|Week 1 of 12/.test(await view(page)), await slotFirst(page));
  await go(page, 'plan-reveal'); await cardsToStart(page);
  check('12 its morning reminder time becomes an evening one: after her 9:15 pm walk, 10 pm (Version 39.27)', await page.$eval('[data-rv-at="22:00"]', (b) => b.classList.contains('on')).catch(() => false));
  await ctx.close();
}
{
  const v35 = planOf('cycle', null, ago(10), { go: undefined, pack: undefined });
  const { ctx, page, errs } = await open({ seed: { situation: { pcos: true }, mods: { plan: v35 } } });
  await closeTips(page);
  check('12 a Version 35 plan keeps running', (await page.evaluate(() => window.Saathi.plan.packOf())) === 'cycle' && /week 2 · plan day/i.test(await view(page)), (await view(page)).slice(0, 600));
  check('16 no page errors (migration)', errs.length === 0, errs);
  await ctx.close();
}
{
  const done = planOf('cycle', 'irregular', ago(1), { go: false, log: { [ago(1)]: { ck: { move: 'd' }, min: 10 } } });
  const { ctx, page } = await open({ seed: { intake: IK, prompts: { setup: 'off', notifyIntro: ago(3), reveal: ago(1) }, mods: { plan: done } } });
  check('12 a Version 37 plan she already followed keeps running', (await page.evaluate(() => window.Saathi.plan.packOf())) === 'cycle' && !(await page.evaluate(() => window.Saathi.plan.pending())));
  await ctx.close();
}

/* ---------- 13. The pause rule ---------- */
{
  const rem = [{ id: 'plan', mod: 'plan', title: { en: 'Your plan for today', hi: 'आज का आपका प्लान' }, start: ago(5), every: 1, time: '20:00', on: true }];
  const { ctx, page } = await open({ seed: { events: [], situation: { pregnant: true, pregnantSince: ago(80) }, reminders: rem.slice(), mods: { plan: planOf('preg', 'food', ago(5)) } } });
  await go(page, 'plan'); await go(page, 'home');
  check('13 a pregnancy plan keeps its reminder', ((await st(page)).reminders || []).some((r) => r.id === 'plan'));
  await ctx.close();
  const b = await open({ seed: { events: [], situation: { pregnant: true, pregnantSince: ago(80) }, reminders: rem.slice(), mods: { plan: planOf('cycle', 'irregular', ago(30)) } } });
  await go(b.page, 'plan'); await go(b.page, 'home');
  check('13 a cycle plan in pregnancy pauses its reminder', !((await st(b.page)).reminders || []).some((r) => r.id === 'plan'));
  await b.ctx.close();
}

/* ---------- 14. Day 3: a Qura doctor for her questions, once ---------- */
{
  const { ctx, page, errs } = await open({ seed: { intake: IK, mods: { plan: planOf('pain', 'pain', ago(2), { goal: 'pain' }) } } });
  await closeTips(page);
  check('14 day 3: "Questions about your plan?"', (await slotFirst(page)) === 'Questions about your plan?' && /The first 20-minute call is free/.test(await view(page)), await slotFirst(page));
  await tap(page, '#pl-call-not');
  check('14 "Not now" puts it away', (await slotFirst(page)) !== 'Questions about your plan?');
  await jump(page, 1, '10:00'); await closeTips(page);
  check('14 once only', !/Questions about your plan\?/.test(await view(page)));
  await ctx.close();
  const b = await open({ seed: { intake: IK, mods: { plan: planOf('pain', 'pain', ago(2), { goal: 'pain' }) } } });
  await closeTips(b.page); await tap(b.page, '#pl-call-go');
  check('14 its button opens "Talk to a Qura doctor"', (await b.page.evaluate(() => location.hash)) === '#ask' && !!(await st(b.page)).prompts.planCall);
  await b.ctx.close();
  const c = await open({ seed: { intake: IK, settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('pain', 'pain', ago(2), { goal: 'pain' }) } } });
  await closeTips(c.page);
  check('14 never in discreet mode', !/Questions about your plan\?/.test(await view(c.page)));
  check('16 no page errors (day 3)', errs.length === 0 && c.errs.length === 0, errs.concat(c.errs));
  await c.ctx.close();
}

/* ---------- 15. Dr. Megha's welcome ---------- */
{
  const { ctx, page, errs } = await open({ seed: { intake: IK }, cfg: Object.assign({}, LOCAL, { audio: ['megha-welcome-en'] }) });
  await pend(page, Object.assign({}, IK, { stage: 'cycle' })); await go(page, 'plan-reveal');
  check('15 her plan\'s one screen offers Dr. Megha when the build carries her recording (Version 39.72)', /Hear Dr. Megha \(30 seconds\)/.test(await view(page)) && (await page.$eval('#pl-rv-aud', (b) => b.dataset.src).catch(() => '')) === 'audio/megha-welcome-en.mp3');
  check('16 no page errors (audio)', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 16. A shared phone, Hindi, a small screen, the doctor summary ---------- */
{
  const { ctx, page, errs } = await open({ seed: { intake: IK, settings: { discreet: true, toursAuto: false, notify: true } } });
  await pend(page, Object.assign({}, IK, { stage: 'cycle' })); await go(page, 'home'); await closeTips(page);
  check('16 discreet: "Your plan is ready" still shows, in plain words', (await slotFirst(page)) === 'Your plan is ready', await slotFirst(page));
  await go(page, 'plan-reveal');
  const words = await cardsToStart(page);
  check('16 discreet: no health words on her plan cards', !/period|PMOS|PCOS|insulin|acne|hormone|cycle/i.test(words), words.match(/.{0,40}(period|PMOS|PCOS|insulin|acne|hormone|cycle).{0,40}/i));
  /* Version 39.0: the doctor check is part of every plan, on a shared phone too, in plain words */
  check('16 discreet: the doctor check shows in plain words', !/doctor check/.test(words) || /A doctor’s check is part of your plan/.test(words), words.match(/.{0,60}doctor.{0,60}/i));
  await tap(page, '#pl-rv-go'); await settle(page, 1200); await closeTips(page);
  const v = await view(page);
  check('16 discreet: Today says "My plan · plan day 1"', /My plan/i.test(v) && /PLAN DAY 1/.test(v) && /0 of 3 done today/.test(v) && !/My cycle plan/i.test(v), v.slice(0, 700));
  check('16 discreet: the day-1 card shows, in plain words', (await slotFirst(page)) === 'Day 1 of your plan', await slotFirst(page));
  check('16 no page errors (discreet)', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { lang: 'hi', intake: IK }, lang: 'hi', w: 360 });
  await pend(page, Object.assign({}, IK, { stage: 'cycle' })); await go(page, 'home'); await closeTips(page);
  check('16 Hindi: "आपका प्लान तैयार है" on Today', (await slotFirst(page)) === 'आपका प्लान तैयार है', await slotFirst(page));
  await go(page, 'plan-reveal');
  let ok360 = true; let words = '';
  for (let i = 0; i < 8; i++) { words += '\n' + (await view(page)); if (!(await noScroll(page))) ok360 = false; if (await has(page, '#pl-rv-go')) break; await tap(page, '#pl-rv-next'); }
  check('16 Hindi: her plan on one screen in Hindi (Version 39.72)', /आपका प्लान तैयार है/.test(words) && /आप कब से शुरू करना चाहती हैं\?/.test(words) && !/हर दिन कैसे चलेगा|कब क्या होगा/.test(words), words.slice(0, 600));
  check('16 Hindi: no English left on the cards', !/\b(Next|Today|Tomorrow|Start my plan|How each day works|Your plan is ready)\b/.test(words), words.match(/.{0,30}\b(Next|Today|Tomorrow|Start my plan|How each day works|Your plan is ready)\b.{0,30}/));
  check('16 360 px: no card scrolls sideways', ok360);
  await shot(page, '06-hindi-start-360');
  await tap(page, '#pl-rv-go'); await settle(page, 1200); await closeTips(page);
  check('16 Hindi: Today says plan day 1 and the check-in time', /प्लान का दिन 1/.test(await view(page)) && /चेक-इन रात 10 बजे/.test(await view(page)), (await view(page)).slice(0, 700));
  check('16 360 px: Today does not scroll sideways', await noScroll(page));
  check('16 no page errors (Hindi)', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { intake: IK, mods: { plan: planOf('pain', 'pain', ago(15), { goal: 'pain', log: { [ago(3)]: { ci: 1, ck: { move: 'd' } } } }) } } });
  const sum = await page.evaluate(() => { const S = window.Saathi; return (S.summaries ? S.summaries() : null); });
  await go(page, 'report');
  const v = await view(page);
  check('16 the doctor summary names her plan, with no minutes for a pain plan', /Easier periods/.test(v) && /Week 3 of 12/.test(v) && !/Active minutes/.test(v), v.match(/.{0,80}Easier periods.{0,200}/s));
  check('16 no page errors (summary)', errs.length === 0, errs);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
