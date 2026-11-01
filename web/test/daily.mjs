// Versions 39.14 to 39.16: the daily job made clear (Mohit, 26 Oct: "maximum clarity on what needs to be done and why user should
// do it and what will impact of consistently doing"; docs/home-plan-diary-audit-2026-10-26.md, R1 to R15; MODULE_API sections
// 57 to 59). This file checks:
//   1 Today is her checklist: every step stays, a tap ticks it and a tap on its tick undoes it (only the minutes it added go);
//     one pink button; "plan day", never "Day"; her week as 7 dots with each day's count; the look-back inside the card;
//   2 "Why?": the reviewed reason, how to do it, what keeping it up can bring, her tool, and "Fasting today?" in her food step;
//   3 a full day closes itself: "Day complete", her goal, tomorrow, a petal, her steps folded, the reminder rests;
//   4 a link step keeps its one-tap row; My ASHA stays off Today, My plan and Diary (Mohit, 26 Oct), and stays in Help and
//     Get care free (and Me's setup steps);
//   5 My plan explains the plan: her goal (never a diagnosis), how it works, her steps with their reasons and the same tick,
//     this week as rings, her garden, what consistency brings with her own signs, the check-in only when due, settings on
//     their own page;
//   6 "How do you feel today?": on Home (with the notes meter when she has no plan), at the top of today's day sheet, in the
//     plan's check-in; never on a shared phone's Home or in pregnancy; the meter on Cycles; the calendar's key in two lines;
//   7 Hindi at 360 px, a shared phone, and no page errors.
// Usage: node test/daily.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'daily'); fs.mkdirSync(SHOTS, { recursive: true });
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
const LOCAL = { app: '0.39.16-pilot', platform: 'android' };
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
  await ctx.addInitScript('window.Audio = class { constructor(src) { this.src = src; this.paused = true; this.ended = false; this.currentTime = 0; this.duration = NaN; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };');   /* Version 39.22: tonight\'s session, without sound */
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


const full4 = (o) => Object.assign({ r: ['cycle', 'strength'], str: true, rmin: 8, min: 18, ci: 1, plate: { half: true }, ck: { sleep: 'd' } }, o || {});
const REM = [{ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, time: '20:00', every: 1, start: ago(9), on: true }];
const remDone = (page) => page.evaluate(() => (window.Saathi.reminders.get('plan') || {}).doneOn || null);
const rowTap = async (page, sel) => { await page.$eval(sel + ' .body strong', (e) => e.click()); await settle(page, 300); };
const pinks = (page, sel) => page.$$eval(sel + ' .btn.primary', (b) => b.map((x) => x.innerText.trim()));
const sheetTxt = (page) => page.$eval('#sheet-root', (e) => e.innerText).catch(() => '');
const SEEN1 = { 1: { e: 'good', seen: true } };

/* ---------- 1: Today is her checklist ---------- */
{
  /* day 10 of her PMOS plan (plan week 2, Sunday 25 Oct to Saturday 31 Oct; today Tuesday, index 2), 9:30 am */
  const l = logged(9, 5); l[ago(1)] = full4();
  const a = await open({ seed: cyc(ago(9), { log: l, weeks: SEEN1 }, { reminders: REM }), now: at(0, '09:30') });
  const td = await txt(a.page, '#view .today-card');
  check('1 "plan day", never just "Day": MY PMOS PLAN · WEEK 2 · PLAN DAY 10', /MY PMOS PLAN · WEEK 2 · PLAN DAY 10/.test(td) && !/\bDay 10\b/.test(td.replace(/PLAN DAY 10/, '')), td);
  const rows = await a.page.$$eval('#view .today-card .today-plan-list .today-it', (x) => x.map((y) => (y.className.match(/today-plan-[a-z]+/) || [''])[0]));
  check('1 her 4 steps as a checklist: yoga, walk, food, bedtime', JSON.stringify(rows) === JSON.stringify(['today-plan-yoga', 'today-plan-move', 'today-plan-plate', 'today-plan-sleep']), rows);
  check('1 one pink button in the morning: her yoga\'s Start (Version 39.41: its minutes on it)', (await pinks(a.page, '#view .today-card')).length === 1 && /^\d+ min$/.test((await pinks(a.page, '#view .today-card'))[0]), await pinks(a.page, '#view .today-card'));
  check('1 the check-in waits, with its time under her steps (Version 39.27: 10 pm, after her 9:15 pm walk)', /Check-in at 10 pm/.test(td) && !(await has(a.page, '#view .today-card [data-go="plan-checkin"]')), td);
  const dots = await a.page.$$eval('#view .today-card .pl-d7d', (x) => x.map((y) => ({ c: y.querySelector('i').className, t: y.title, now: y.classList.contains('now') })));
  check('1 her plan week as 7 dots: Sunday some steps, Monday a full day, today ringed', dots.length === 7 && dots[0].c === 'some' && dots[1].c === 'full' && dots[2].now && /^Monday: 4 of 4 steps$/.test(dots[1].t) && /^Sunday: 3 of 4 steps$/.test(dots[0].t), dots);
  check('1 ... and her week in words: "This week: 1 full day · strength on Thursday"', /This week: 1 full day · strength on Thursday/.test(td), td);
  /* a tap on the row ticks the walk; it stays, ticked; the check-in is due now (she did a step) */
  await rowTap(a.page, '#view .today-plan-move');
  let lg = (await plan(a.page)).log[TODAY]; const td2 = await txt(a.page, '#view .today-card');
  check('1 a tap on the row ticks the walk; it stays on Today, ticked, with where it counted', lg.ck.move === 'd' && lg.min === 10 && lg.tkm.move === 10 && (await has(a.page, '#view .today-plan-move.today-ok')) && /Walk 10 minutes\nTicked on Today/.test(td2) && /1 of 4 done today/.test(td2), [lg, td2]);
  check('1 ... then the check-in is the one pink button', JSON.stringify(await pinks(a.page, '#view .today-card')) === JSON.stringify(['How did today go?']), await pinks(a.page, '#view .today-card'));
  /* a tap on its tick undoes it, and only the minutes the tick added go */
  await tap(a.page, '#view .today-plan-move [data-today-undo]');
  lg = (await plan(a.page)).log[TODAY] || {};   /* Version 39.51 (Mohit's phone test): back to unanswered, as before the tick */
  check('1 a tap on the tick undoes it (and the minutes it added)', (lg.ck || {}).move == null && !(lg.min > 0) && !(await has(a.page, '#view .today-plan-move.today-ok')) && /0 of 4 done today/.test(await txt(a.page, '#view .today-card')), lg);
  /* her yoga row starts her yoga */
  await rowTap(a.page, '#view .today-plan-yoga');
  check('1 the yoga row starts today\'s routine', (await a.page.evaluate(() => location.hash)) === '#plan-r-cycle');
  await go(a.page, 'home'); await shot(a.page, '1-today');
  /* 2: "Why?" */
  await tap(a.page, '#view .today-plan-plate [data-today-why]'); const w = await sheetTxt(a.page);
  check('2 "Why?" opens the reviewed reason, how to do it and what keeping it up can bring', /WHY IT HELPS\n\nSmall food changes add up: steadier sugar levels help your hormones, and your cycle, over time\./.test(w) && /HOW\n\nAt lunch or dinner, fill half your plate with sabzi or salad\./.test(w) && /WHAT KEEPING TO YOUR PLAN CAN BRING/.test(w) && /Weeks 1 to 4 · Many women feel more energy and sleep better\./.test(w) && /3 to 6 months · Periods may start to come more regularly\./.test(w), w);
  check('2 ... with her tool (My plate) and "Read more"', (await has(a.page, '#sheet-root [data-go="plan-plate"]')) && /My plate/.test(w) && (await has(a.page, '#sheet-root [data-why-art]')), w);
  await shot(a.page, '2-why');
  await tap(a.page, '#pl-why-fast');
  check('2 "Fasting today?" lives in her food step: the fasting step takes its place', (await has(a.page, '#view .today-plan-fast')) && !(await has(a.page, '#view .today-plan-plate')) && !(await has(a.page, '#sheet-root .pl-why-sh')));
  await tap(a.page, '#view .today-plan-fast [data-today-why]'); await tap(a.page, '#pl-why-fast');
  check('2 ... and "Not fasting" there brings her food step back', (await has(a.page, '#view .today-plan-plate')) && !(await has(a.page, '#view .today-plan-fast')));
  await tap(a.page, '#view .today-plan-sleep [data-today-why]'); const ws = await sheetTxt(a.page);
  check('2 bedtime\'s "Why?": its reason and its tip, no tool', /A regular bedtime helps your body clock/.test(ws) && /Press play, put the phone face down and close your eyes/.test(ws) && !(await has(a.page, '#sheet-root .pl-why-b [data-go]')), ws);   /* Version 39.22: the wind-down's tip */
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await done(a);
}
/* ---------- 3: a full day closes itself ---------- */
{
  const l = logged(9, 5); l[TODAY] = { r: ['cycle'], rmin: 8, min: 8, plate: { half: true } };
  const a = await open({ seed: cyc(ago(9), { log: l, weeks: SEEN1 }, { reminders: REM }), now: at(0, '20:30') });
  check('3 the evening: the check-in is the one pink button while a step is left', JSON.stringify(await pinks(a.page, '#view .today-card')) === JSON.stringify(['How did today go?']));
  await tap(a.page, '#view .today-plan-move [data-today-act]');
  check('3 "One more: Wind down, in bed by 11:30 pm"', /One more: Wind down, in bed by 11:30 pm/.test(await txt(a.page, '#view .today-card')));
  await tap(a.page, '#view .today-plan-sleep [data-today-nav]'); await settle(a.page, 31000); await go(a.page, 'home');   /* Version 39.22: tonight's session, 30 seconds of it */
  const dc = await txt(a.page, '#view .today-card'); const lg = (await plan(a.page)).log[TODAY];
  check('3 the last step (tonight\'s wind-down) closes the day: "Day complete", "All 4 done today"', /Day complete\nAll 4 done today/.test(dc), dc);
  check('3 ... her goal, her week and tomorrow', /A step towards more regular periods\./.test(dc) && /This week: 1 full day/.test(dc) && /TOMORROW\n/.test(dc), dc);
  check('3 ... and tomorrow\'s lines never say "today" (Version 39.27)', !/TOMORROW\n[\s\S]*\btoday\b/i.test(dc.split(/TOMORROW\n/)[1] ? 'TOMORROW\n' + dc.split(/TOMORROW\n/)[1].split('\n').slice(0, 2).join('\n') : ''), dc);
  check('3 ... a petal for her garden, once', lg.fd === 1 && lg.petal === 1 && (await has(a.page, '#view .today-card .pl-dc-pet[data-go="joy"]')), lg);
  check('3 ... no check-in needed: the reminder rests, "Add how it went (optional)" is a quiet link', (await remDone(a.page)) === TODAY && !(await has(a.page, '#view .today-card .btn.primary')) && (await has(a.page, '#view .today-card .pl-dc-how[data-go="plan-checkin"]')), await remDone(a.page));
  check('3 ... her 4 ticked steps fold under it, a tap away', (await has(a.page, '#view .today-card details.today-fold:not([open])')) && /Your 4 steps/.test(dc) && (await a.page.$$('#view .today-fold .today-ok')).length === 4);
  await shot(a.page, '3-day-complete');
  /* undo from the folded list: the day opens again */
  await a.page.$eval('#view details.today-fold', (d) => { d.open = true; }); await settle(a.page, 200);
  await tap(a.page, '#view .today-plan-move [data-today-undo]');
  check('3 a tick undone in the folded list reopens the day', /3 of 4 done today/.test(await txt(a.page, '#view .today-card')) && !(await remDone(a.page)) && !/Day complete/.test(await txt(a.page, '#view .today-card')));
  await done(a);
}
/* ---------- 1 (R6): the week's look-back inside the Today card ---------- */
{
  const a = await open({ seed: cyc(ago(7), { log: logged(7, 5) }), now: at(0, '09:30') });
  const lb0 = await txt(a.page, '#view .today-card .pl-sl-rev');
  check('1 a new week: the look-back is one line inside her Today card, right under her steps', /Week 1 is done\n5 of 7 days on your plan/.test(lb0) && (await has(a.page, '#view .today-card #pl-rev-open')) && !(await has(a.page, '#view .today-card [data-pl-e]')), lb0);
  await tap(a.page, '#pl-rev-open'); const lb = await txt(a.page, '#view .today-card .pl-sl-rev');
  check('1 ... a tap opens it there: what she did, and her energy', /Week 1 is done · 5 of 7 days on your plan/.test(lb) && /How was your energy this week\?/.test(lb) && !(await has(a.page, '#view .slot .pl-sl-rev')) && (await a.page.evaluate(() => { const r = document.querySelector('#view .today-card .pl-sl-rev'); const s = document.querySelector('#view .today-plan-list'); return !!(r && s && (s.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING)); })), lb);
  await tap(a.page, '#view .today-card [data-pl-e="good"]');
  const lb2 = await txt(a.page, '#view .today-card .pl-sl-rev');
  check('1 ... one tap answers it, then her tip and Plan your week (not pink: her steps keep the one pink button)', /Week 1 is done ·/.test(lb2) && (await has(a.page, '#view .today-card #pl-rev-plan:not(.primary)')) && (await has(a.page, '#view .today-card #pl-rev-ok')), lb2);
  await tap(a.page, '#view .today-card #pl-rev-ok');
  check('1 ... "Got it" puts it away', !(await has(a.page, '#view .pl-sl-rev')));
  await done(a);
}
/* ---------- 4: a link step keeps its one-tap row; My ASHA stays off Today, My plan and Diary (the government route: on her doctor's
   route the item is her doctor's and ambulance numbers, and Today counts it, Version 39.40, test/termwalk.mjs) ---------- */
{
  const p = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(60), care: 'govt' }, events: [], intake: { goal: 'food' }, mods: { plan: planOf('preg', 'food', ago(9)) } }, now: at(0, '09:30') });
  const pd = await p.page.evaluate(() => !!document.querySelector('#view .today-plan-pdue .today-go[data-go="preg-plan"]'));
  check('4 pregnancy\'s "Due now" keeps its one-tap row to her checklist (no tick of its own)', pd && !(await has(p.page, '#view .today-plan-pdue [data-today-act]')));
  await p.page.evaluate(() => { const S = window.Saathi; if (S.preg && S.preg.plan) S.preg.plan.due = () => [{ id: 'asha', name: 'ASHA and ambulance numbers' }]; S.render(); }); await settle(p.page, 300);
  check('4 her checklist\'s ASHA item stays off Today', !(await has(p.page, '#view .today-plan-pdue')) && !/ASHA/.test(await txt(p.page, '#view .today-card')));
  await go(p.page, 'plan');
  check('4 ... and off My plan', !/ASHA/.test(await view(p.page)));
  await done(p);
  const a = await open({ seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }, { prompts: { notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, joined: ago(5) }), now: at(0, '09:30') });
  check('4 Today has no My ASHA step', !/ASHA/.test(await view(a.page)));
  await go(a.page, 'plan');
  check('4 My plan\'s care team has no My ASHA', !(await has(a.page, '#view [data-go="asha"]')) && /Your care team/.test(await view(a.page)) && /A Qura doctor/.test(await a.page.$eval('#view .pl-care', (e) => e.textContent)));   /* Version 39.19: folded after week 1 */
  await go(a.page, 'diary');
  check('4 the Diary has no My ASHA', !/ASHA/.test(await view(a.page)));
  await go(a.page, 'access-free');
  check('4 Get care free keeps it', await has(a.page, '#view [data-go="asha"]'));
  await go(a.page, 'help');
  check('4 Help keeps it', await has(a.page, '#view [data-go="asha"]'));
  await done(a);
}
/* ---------- 5: My plan explains the plan ---------- */
{
  const l = logged(9, 5); l[ago(1)] = full4();
  const a = await open({ seed: cyc(ago(9), { log: l, weeks: SEEN1 }, { reminders: REM }), now: at(0, '09:30'), hash: '#plan' });
  const v = await view(a.page);
  check('5 her goal and her week, never a diagnosis line', /Goal: feeling better with PMOS · Week 2 of 12/.test(v) && !/I have PMOS/.test(v), v.slice(0, 300));
  /* Version 39.19: after her first week these fold to one line each; opened, they read as before (and stay open) */
  check('5 Version 39.22: how her plan works is a link by her week, what consistency brings in her 12 weeks, her care team folded', (await a.page.$$('#view .pl-fold details:not([open])')).length === 1 && await has(a.page, '#pl-howlink') && await has(a.page, '#view .pl-weeks'));
  await tap(a.page, '#pl-howlink');
  const rh = await sheetTxt(a.page); await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 150);
  check('5 how her plan works: every day, every week, every 4 weeks, after 12 weeks', /Every day\n4 steps, check-in 10 pm\nEvery week\nLook back, plan the week\nEvery 4 weeks\nA 1-minute check\nAfter 12 weeks\nYour results/.test(rh), rh);
  await tap(a.page, '#pl-whyall'); const wa = await sheetTxt(a.page); await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 150);
  check('5 her 4 daily steps, each with its reviewed reason (behind "Why these 4 steps?" after week 1)', /Your 4 daily steps/.test(v) && /Moving most days lifts your energy and mood\./.test(wa) && /Moving most days helps your body use insulin better/.test(wa) && /Small food changes add up/.test(wa) && /A regular bedtime helps your body clock/.test(wa), wa.slice(0, 400));
  check('5 the check-in only when it is due: in the morning its time, no pink button', /Check-in at 8 pm/.test(await txt(a.page, '#view .pl-steps-card')) && !(await has(a.page, '#view .pl-steps-card .btn.primary')));
  await tap(a.page, '#view .pl-steps-card [data-pl-tk="1"]');
  check('5 a tick on My plan is the same tick as Today\'s', ((await plan(a.page)).log[TODAY].ck || {}).move === 'd' && (await has(a.page, '#view .pl-steps-card .today-ok')) && /1 of 4 done today/.test(await txt(a.page, '#view .pl-steps-card')));
  check('5 ... and then the check-in is due there too (a plain button: Today keeps the pink one)', await has(a.page, '#view .pl-steps-card .pl-ci-go[data-go="plan-checkin"]'));
  await tap(a.page, '#view .pl-steps-card [data-pl-un="1"]');
  check('5 ... and undone there too (back to unanswered, Version 39.51)', ((((await plan(a.page)).log[TODAY] || {}).ck || {}).move == null) && !(await has(a.page, '#view .pl-steps-card .today-ok')));
  const wk = await txt(a.page, '#view .pl-wkc');
  const rings = await a.page.$$eval('#view .pl-wkc .pl-r4', (x) => x.map((s) => ({ n: s.querySelectorAll('circle').length, d: s.querySelectorAll('circle.d').length })));
  check('5 this week as rings, a part for each step (Monday all 4, Sunday 3)', rings.length === 7 && rings[0].n === 4 && rings[0].d === 3 && rings[1].d === 4, rings);
  check('5 ... her full days, her minutes, and Plan the week right here (the legend is week 1\'s, Version 39.22)', !/Each ring has 4 parts/.test(wk) && /This week: 1 full day · strength on Thursday/.test(wk) && /Active minutes/.test(wk) && (await has(a.page, '#view .pl-wkc #pl-wp')), wk);
  check('5 her garden sits at the foot of her week (Version 39.22)', await has(a.page, '#view .pl-wkc .pl-garden-in[data-go="joy"]'));
  await a.page.$eval('#view .pl-weeks .pl-path-more summary', (x) => x.click()); await settle(a.page, 200);   /* Version 39.22: in her 12 weeks, behind "All 12 weeks" */
  const cs = await txt(a.page, '#view .pl-cons-in');
  check('5 what consistency brings: the reviewed timeline, "You are here" at weeks 1 to 4', /What consistency brings/.test(cs) && /Weeks 1 to 4\nYou are here\nMany women feel more energy and sleep better\./.test(cs) && /3 to 6 months/.test(cs), cs);
  check('5 ... and her own signs: her energy, her 4-week check, her days between periods', /Your energy\nWeek 1: Good/.test(cs) && /Your 4-week check\nIn 19 days/.test(cs) && /Days between periods\n28 before your plan/.test(cs), cs);
  check('5 "Fasting today?" is no longer on My plan (it is in her food step)', !/Fasting today\?/.test(await view(a.page)));
  check('5 settings are one row; My ASHA is not in her care team', (await has(a.page, '#view [data-go="plan-settings"]')) && !(await has(a.page, '#view #pl-rem')) && !(await has(a.page, '#view #pl-stop')));
  await shot(a.page, '5-myplan');
  await tap(a.page, '#view #pl-wp');
  check('5 Plan this week opens her week', (await a.page.evaluate(() => location.hash)) === '#plan-week');
  await go(a.page, 'plan-settings'); const st = await view(a.page);
  check('5 Plan settings, a page of its own: her reminder, the nudge, pause, change, stop', /Plan settings/.test(st) && /Remind me every day/.test(st) && /Nudge at my time to move/.test(st) && /Pause for a week/.test(st) && /Change what I work on/.test(st) && /Stop my plan/.test(st), st);
  await tap(a.page, '#pl-stop'); await tap(a.page, '#pl-stop-yes');
  check('5 stopping it there returns to My plan', (await a.page.evaluate(() => location.hash)) === '#plan' && !(await plan(a.page)).start);
  await done(a);
}
/* ---------- 6: "How do you feel today?" ---------- */
{
  const a = await open({ seed: { intake: { goal: 'track' }, focus: { at: ago(2) } }, now: at(0, '09:30') });
  const fc = await txt(a.page, '#view .feel-card');
  check('6 Home, no plan: "How do you feel today?" with 5 of the Diary\'s words and More (Version 39.17: "Feeling okay" first)', /TODAY · 10 SECONDS\nHow do you feel today\?/.test(fc) && (await a.page.$$('#view .feel-card [data-feel]')).length === 5 && /Feeling okay/.test(fc) && /Tired/.test(fc) && /Cramps/.test(fc) && /Low mood/.test(fc) && /Bloating/.test(fc) && (await has(a.page, '#feel-more')), fc);
  check('6 ... why it matters, and the notes meter: "Noted on N of 27 days", and what comes next', /A note a day shows what repeats in your cycle\./.test(fc) && /Noted on \d+ of 27 days/.test(fc) && /Next: /.test(fc), fc);
  check('6 ... the first days\' "Log today" row makes way for it', !(await has(a.page, '#view .today-core-log')));
  await tap(a.page, '#view .feel-card [data-feel="d_tired"]');
  check('6 one tap notes it in her Diary (today\'s entry), on the phone', JSON.stringify((await a.page.evaluate(() => window.Saathi.state.daily))[TODAY]) === '["d_tired"]' && /Noted today\./.test(await txt(a.page, '#view .feel-card')) && (await has(a.page, '#view .feel-card [data-feel="d_tired"].on')));
  await tap(a.page, '#view .feel-card [data-feel="d_tired"]');
  check('6 ... a second tap takes it back', !(await a.page.evaluate((d) => !!window.Saathi.state.daily[d], TODAY)));
  await tap(a.page, '#feel-more'); const ds = await sheetTxt(a.page);
  check('6 More opens today\'s day sheet, which starts with the same question', /How do you feel today\?/.test(ds) && ds.indexOf('How do you feel today?') < ds.indexOf('Period started'), ds.slice(0, 400));
  await a.page.$eval('#sheet-root .feel-sec [data-sym="d_cramps"]', (b) => b.click()); await settle(a.page, 300);
  check('6 ... a chip there is today\'s entry, and shows once on the page (Version 39.17: no sign twice)', JSON.stringify((await a.page.evaluate(() => window.Saathi.state.daily))[TODAY]) === '["d_cramps"]' && (await a.page.$$('#sheet-root [data-sym="d_cramps"].on')).length === 1);
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await go(a.page, 'diary'); await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(a.page, 300);
  check('6 Version 39.17: the notes meter moved from Cycles to the Calendar\'s Today strip', !(await has(a.page, '#diary-body .meter')));
  await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'cal'; window.Saathi.render(); }); await settle(a.page, 300);
  const lg = await a.page.$$eval('#diary-body .legend', (x) => x.map((y) => y.innerText.replace(/\s+/g, ' ').trim()));
  check('6 the calendar\'s key in two lines: the period marks, then "Dots: what you noted" with "?"', lg.length === 2 && /Bleeding/.test(lg[0]) && !/Today/.test(lg[0]) && /Dots: what you noted/.test(lg[1]) && (await has(a.page, '#cal-key')), lg);
  await tap(a.page, '#cal-key'); const key = await sheetTxt(a.page);
  check('6 ... "?" opens the full key', /What the marks mean/.test(key) && /Today/.test(key) && /Pain/.test(key) && /Mood/.test(key) && /Note/.test(key), key);
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await done(a);
  /* a plan: a short question on Home, and the same question in her evening check-in */
  const p = await open({ seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }), now: at(0, '20:30') });
  const pf = await txt(p.page, '#view .feel-card');
  check('6 with a plan: the question on Home, short (no meter)', /How do you feel today\?/.test(pf) && !/Noted on/.test(pf) && !/10 SECONDS/.test(pf), pf);
  await go(p.page, 'plan-checkin');
  check('6 ... and in her evening check-in', /HOW DO YOU FEEL TODAY\?/.test(await view(p.page)) && (await p.page.$$('#view .pl-ci-feel [data-feel]')).length === 5);
  await tap(p.page, '#view .pl-ci-feel [data-feel="d_bloat"]');
  check('6 ... a tap there is her Diary\'s entry for today', JSON.stringify((await p.page.evaluate(() => window.Saathi.state.daily))[TODAY]) === '["d_bloat"]' && (await has(p.page, '#view .pl-ci-feel [data-feel="d_bloat"].on')));
  await done(p);
  /* never on a shared phone's Home, nor in pregnancy */
  const d = await open({ seed: { intake: { goal: 'track' }, settings: { discreet: true } }, now: at(0, '09:30') });
  check('6 a shared phone: no symptom words on Home', !(await has(d.page, '#view .feel-card')));
  await done(d);
  const g = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(60) }, events: [] }, now: at(0, '09:30') });
  check('6 pregnancy: her own checks lead, no feel card', !(await has(g.page, '#view .feel-card')));
  await done(g);
}
/* ---------- 7: Hindi at 360 px, a shared phone ---------- */
{
  const l = logged(9, 5); l[ago(1)] = full4();
  const h = await open({ seed: cyc(ago(9), { log: l, weeks: SEEN1 }, { lang: 'hi' }), lang: 'hi', w: 360, h: 780, now: at(0, '09:30') });
  const td = await txt(h.page, '#view .today-card');
  check('7 Hindi Today: प्लान का दिन, the count, her week', /हफ़्ता 2 · प्लान का दिन 10/.test(td) && /आज 4 में से 0 हो गए/.test(td) && /इस हफ़्ते: 1 दिन सारे क़दम पूरे/.test(td) && await noScroll(h.page), td);
  /* Version 39.23: her cycle heads Today again, so at 360 x 780 her first step (not all 4) is on the first screen */
  check('7 Hindi: her 4 steps, the first above the tab bar at 360 x 780', await h.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const b = Array.from(document.querySelectorAll('#view .today-plan-list [data-today-act], #view .today-plan-list [data-today-nav]')); return b.length === 4 && b[0].getBoundingClientRect().bottom <= nav; }));
  await tap(h.page, '#view .today-plan-move [data-today-why]');
  check('7 Hindi "Why?": its reason and how', /यह क्यों मदद करता है|क्यों/.test(await sheetTxt(h.page)) && /कैसे/.test(await sheetTxt(h.page)), await sheetTxt(h.page));
  await h.page.evaluate(() => window.Saathi.closeSheet()); await settle(h.page, 200);
  await go(h.page, 'plan'); const v = await view(h.page);
  check('7 Hindi My plan at 360 px: her goal, her steps, her week, her 12 weeks', /लक्ष्य: /.test(v) && /आपके रोज़ के 4 क़दम/.test(v) && /इस हफ़्ते/.test(v) && /सभी 12 हफ़्ते/.test(v) && await noScroll(h.page), v.slice(0, 500));   /* Version 39.22: what consistency brings sits in her 12 weeks */
  await shot(h.page, '7-myplan-hi');
  await done(h);
  const s = await open({ seed: cyc(ago(9), { log: logged(9, 5), weeks: SEEN1 }, { settings: { discreet: true } }), now: at(0, '09:30') });
  const st = await txt(s.page, '#view .today-card');
  check('7 a shared phone: plain words, plan day, no "Why?" and no goal', /MY PLAN · WEEK 2 · PLAN DAY 10/.test(st) && !(await has(s.page, '#view [data-today-why]')) && !/PMOS/.test(st), st);
  await go(s.page, 'plan');
  check('7 ... and My plan without reasons or what consistency brings', !(await has(s.page, '#view .pl-cons')) && !(await has(s.page, '#view .pl-step-why')) && !/PMOS/.test(await view(s.page)));
  await done(s);
}
check('7 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(passed + '/' + results.length + ' checks passed');
process.exit(passed === results.length ? 0 : 1);
