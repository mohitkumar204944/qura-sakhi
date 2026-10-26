// Version 39.12: plan follow-through (Mohit, 26 Oct: "we have yoga and diet etc. but it only asks did you ate, 10 minute walk and
// sleep"; the audit's 7 gaps and his 6 decisions; MODULE_API section 55). This file checks:
//   1 Today names the day's yoga or strength, with Start;  2 a routine she finishes counts by itself;
//   3 strength days show ahead on Today;  4 a food habit has its meal, and her plate counts;
//   5 the check-in shows what already counted, asks only the rest, and asks about last night's bedtime;
//   6 the feedback names her goal, her strength days and tomorrow's routine;  7 Plan your week, with an if-then plan;
//   8 the nudge at her time to move (off by default, at most one a day, plain words on a shared phone);
//   9 the 4-week check (waist and weight optional, asked last, never judged);  10 help after two quiet weeks;
//  11 Hindi, a 360 px screen, no page errors.
// Usage: node test/follow.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'follow'); fs.mkdirSync(SHOTS, { recursive: true });
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
const LOCAL = { app: '0.39.12-pilot', platform: 'android' };
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

/* ---------- 1 to 4: Today ---------- */
{
  /* day 10 of her PMOS plan (plan day index 2): cycle care yoga today; strength on Thursday (index 4) */
  const a = await open({ seed: cyc(ago(9), { log: logged(9, 5) }) });
  const td = await txt(a.page, '#view .today-card'); const cm = await rmins(a.page, 'cycle');
  check('1 Today names the day\'s yoga, with the walk as the other way', td.includes('Cycle care yoga · ' + cm + ' min\nOr walk 10 minutes') && !/Move 10 minutes today/.test(td), td);
  check('1 ... with Start, not Done', (await txt(a.page, '#view .today-plan-move [data-today-nav]')) === 'Start' && !(await has(a.page, '#view .today-plan-move [data-today-act]')));
  check('1 ... the row opens Yoga and moves', (await a.page.$eval('#view .today-plan-move .today-go', (b) => b.dataset.go).catch(() => '')) === 'plan-moves');
  check('3 strength days show ahead: "Thursday: strength day · 0 of 2 this week"', /Thursday: strength day · 0 of 2 this week/.test(td), td);
  check('4 the food habit has its meal', /Half the plate sabzi\nAt lunch or dinner/.test(td), td);
  await shot(a.page, '1-today');
  await tap(a.page, '#view .today-plan-move [data-today-nav]');
  check('1 Start opens today\'s routine', (await a.page.evaluate(() => location.hash)) === '#plan-r-cycle');
  /* she finishes it: the routine logs its minutes, and the step counts by itself */
  await tap(a.page, '#pl-pstart'); for (let i = 0; i < 40 && (await has(a.page, '#pl-next')); i++) await tap(a.page, '#pl-next');
  const lg = (await plan(a.page)).log[TODAY] || {};
  await go(a.page, 'home'); const td2 = await txt(a.page, '#view .today-card');
  check('2 a routine she finishes counts by itself: the step leaves Today', (lg.r || []).indexOf('cycle') >= 0 && !(await has(a.page, '#view .today-plan-move')) && /1 of 3 done today/.test(td2), [lg, td2]);
  await done(a);

  /* a strength day (index 1): strength at home, with Start; no "strength day ahead" line */
  const s = await open({ seed: cyc(ago(8), { log: logged(8, 5) }) });
  const ts = await txt(s.page, '#view .today-card'); const sm = await rmins(s.page, 'strength');
  check('1 a strength day: "Strength at home · N min", "Or walk 10 minutes"', ts.includes('Strength at home · ' + sm + ' min\nOr walk 10 minutes') && !/: strength day ·/.test(ts), ts);
  check('1 ... Start opens Strength at home', (await s.page.$eval('#view .today-plan-move [data-today-nav]', (b) => { b.click(); return true; }).then(() => settle(s.page, 300)).then(() => s.page.evaluate(() => location.hash))) === '#plan-r-strength');
  await done(s);
  /* the day before a strength day: "Tomorrow: strength day"; a week whose strength is done: no line */
  const t1 = await open({ seed: cyc(ago(10), { log: logged(10, 5) }) });
  check('3 the day before: "Tomorrow: strength day · 0 of 2 this week"', /Tomorrow: strength day · 0 of 2 this week/.test(await txt(t1.page, '#view .today-card')), await txt(t1.page, '#view .today-card'));
  await done(t1);
  const l2 = logged(9, 5); l2[ago(1)] = Object.assign({}, l2[ago(1)], { str: true }); l2[ago(2)] = Object.assign({}, l2[ago(2)] || {}, { str: true });   /* week 2's two strength days */
  const t2 = await open({ seed: cyc(ago(9), { log: l2, weeks: { 1: { e: 'ok', seen: true } } }) });
  const t2t = await txt(t2.page, '#view .today-card');
  check('3 ... none once she has done this week\'s strength days', !/strength day ·/.test(t2t), t2t);
  await done(t2);
  /* her plate: half sabzi tapped on the thali counts the habit */
  const p = await open({ seed: cyc(ago(9), { log: logged(9, 5), thali: { d: TODAY, on: ['veg', 'grain'] } }) });
  check('4 half sabzi on the plate she tapped counts the habit: the row leaves Today', !(await has(p.page, '#view .today-plan-plate')) && /1 of 3 done today/.test(await txt(p.page, '#view .today-card')), await txt(p.page, '#view .today-card'));
  await done(p);
}

/* ---------- 5 and 6: the check-in ---------- */
{
  const l = logged(9, 5); l[TODAY] = { min: 8, r: ['cycle'] };
  const a = await open({ seed: cyc(ago(9), { log: l, thali: { d: TODAY, on: ['veg'] } }), hash: '#plan-checkin' });
  const v = await view(a.page);
  check('5 what already counted shows as done, with where it came from', /Cycle care yoga · \d+ min\nCounted from your yoga/.test(v) && /Half the plate sabzi\nFrom your plate today/.test(v), v);
  check('5 ... only the rest is asked: "1 question left"', /Tuesday, 27 October · 1 question left/.test(v) && !(await has(a.page, '[data-ci="move:d"]')) && !(await has(a.page, '[data-ci="food:d"]')), v);
  check('5 bedtime is asked about last night, Yes / Close / No', /Last night: in bed by 11:30 pm\?\nYes\nClose\nNo/.test(v), v);
  await shot(a.page, '5-checkin');
  await tap(a.page, '#pl-ci-edit');
  check('5 "Change an answer" opens every step', /3 questions left/.test(await view(a.page)) && (await has(a.page, '[data-ci="move:d"].on')) && (await has(a.page, '[data-ci="food:d"].on')));
  await a.page.evaluate(() => { window.Saathi.mem.planCi.edit = false; window.Saathi.render(); }); await settle(a.page, 300);
  await tap(a.page, '[data-ci="sleep:p"]'); await tap(a.page, '[data-ci-b="tired"]'); await tap(a.page, '#pl-ci-save');
  const x = (await plan(a.page)).log[TODAY]; const fb = await view(a.page);
  check('5 saving keeps what counted as it was counted (8 minutes stay 8), and last night\'s bedtime on today', x.min === 8 && x.ck.sleep === 'p' && x.ci === 1 && !x.ck.move, x);
  check('6 the feedback names her goal', /YOUR GOAL\n\nA step towards more regular periods\./.test(fb), fb);
  check('6 ... her strength days and tomorrow\'s routine', /Strength: 0 of 2 this week · next: Thursday/.test(fb) && /Tomorrow: Gentle start · \d+ min/.test(fb), fb);
  await shot(a.page, '6-feedback');
  await done(a);
  /* nothing done: no goal line */
  const n = await open({ seed: cyc(ago(9), { log: logged(9, 5) }), hash: '#plan-checkin' });
  for (const g of ['move', 'food', 'sleep']) await tap(n.page, '[data-ci="' + g + ':n"]');
  await tap(n.page, '#pl-ci-save'); const nf = await view(n.page);
  check('6 a day with nothing done: no goal line, the kind word instead', !/YOUR GOAL/.test(nf) && /Some days are like that/.test(nf), nf);
  await done(n);
  /* night shift: her sleep step stays about today */
  const ns = await open({ seed: cyc(ago(9), { log: logged(9, 5), work: 'night' }), hash: '#plan-checkin' });
  const nv = await view(ns.page);
  check('5 night shift: "Sleep 7 to 8 hours after your shift", Done / Partly / Not today', /Sleep 7 to 8 hours after your shift\nDone\nPartly\nNot today/.test(nv) && !/Last night/.test(nv), nv);
  await done(ns);
  /* a shared phone: plain words, no goal line */
  const dz = await open({ seed: cyc(ago(9), { log: l }, { settings: { discreet: true } }), hash: '#plan-checkin' });
  const dv = await view(dz.page);
  check('5 a shared phone: "Yoga", never the cycle', /Yoga · \d+ min\nCounted from your yoga/.test(dv) && !/Cycle care|PMOS|period/i.test(dv), dv);
  for (const g of await dz.page.$$eval('[data-ci]', (b) => [...new Set(b.map((y) => y.dataset.ci.split(':')[0]))])) await tap(dz.page, '[data-ci="' + g + ':d"]');
  await tap(dz.page, '#pl-ci-save');
  check('6 ... and no goal line', !/YOUR GOAL|regular periods/i.test(await view(dz.page)), await view(dz.page));
  await done(dz);
}

/* ---------- 7: Plan your week ---------- */
{
  /* day 8 of a plan (week 2, index 0), last week's look-back answered, "No time" on 2 days */
  const l = logged(7, 4); l[ago(3)] = Object.assign({}, l[ago(3)], { bar: 'time' }); l[ago(4)] = Object.assign({}, l[ago(4)], { bar: 'time' });
  const a = await open({ seed: cyc(ago(7), { log: l, weeks: { 1: { e: 'ok', b: 'time', d: TODAY } } }), now: at(0, '10:00') });
  check('7 the look-back offers "Plan your week · 30 seconds"', /Plan your week · 30 seconds/.test(await txt(a.page, '#view .pl-review')), await txt(a.page, '#view .slot'));
  await tap(a.page, '#view #pl-rev-plan');
  const w = await view(a.page);
  check('7 Plan your week: her strength days, her time, and last week\'s barrier', (await a.page.evaluate(() => location.hash)) === '#plan-week' && /Week 2 · 27 Oct to 2 Nov · 30 seconds/.test(w) && /Your 2 strength days/.test(w) && /Last week, “No time” got in the way on 2 days\./.test(w) && /If I’m short of time, I’ll…/.test(w), w);
  check('7 ... "After dinner" already picked (her time)', await has(a.page, '[data-wp-w="dinner"].on'));
  await shot(a.page, '7-week');
  await tap(a.page, '[data-wp-d="1"]'); await tap(a.page, '[data-wp-d="4"]'); await tap(a.page, '[data-wp-d="2"]');   /* [1, 4] → [4] → [] → [2]... */
  const sel = await a.page.evaluate(() => window.Saathi.mem.planWk.str.slice().sort());
  await tap(a.page, '[data-wp-d="3"]'); await tap(a.page, '#pl-wp-save');
  check('7 two days in a row are refused', /Pick 2 days, not two in a row\./.test(await txt(a.page, '#pl-wp-err')), [sel, await txt(a.page, '#pl-wp-err')]);
  await tap(a.page, '[data-wp-d="3"]'); await tap(a.page, '[data-wp-d="5"]'); await tap(a.page, '[data-wp-t="split"]'); await tap(a.page, '#pl-wp-save');
  const d = await plan(a.page);
  check('7 saving keeps her week: strength days, time, and her if-then plan', JSON.stringify((d.wplan || {})[2]) === JSON.stringify({ when: 'dinner', at: TODAY, str: [2, 5], ifb: 'time', ift: 'split' }) && d.weeks[1].seen === true, [d.wplan, d.weeks]);
  await go(a.page, 'home'); await a.page.clock.setFixedTime(at(2, '10:00')); await go(a.page, 'home');
  check('7 her own strength day comes on Today (in 2 days, index 2)', /Strength at home · \d+ min/.test(await txt(a.page, '#view .today-card')), await txt(a.page, '#view .today-card'));
  /* the barrier she planned for: the check-in's tip is her own plan */
  await a.page.clock.setFixedTime(at(2, '20:30')); await go(a.page, 'plan-checkin');
  for (const g of await a.page.$$eval('[data-ci]', (b) => [...new Set(b.map((y) => y.dataset.ci.split(':')[0]))])) await tap(a.page, '[data-ci="' + g + ':n"]');
  await tap(a.page, '[data-ci-b="time"]'); await tap(a.page, '#pl-ci-save');
  check('7 the check-in reminds her of her own plan for that barrier', /You planned: “I’ll split it into two short walks\.”/.test(await view(a.page)), await view(a.page));
  /* Plan settings: "Plan this week" shows what she planned; "Same as last week" next week */
  await go(a.page, 'plan');
  check('7 Plan settings: "Plan this week", with her days and time', /Plan this week\nStrength: Thu, Sun · After dinner/.test(await view(a.page)), (await view(a.page)).slice(-900));
  await a.page.clock.setFixedTime(at(7, '10:00')); await go(a.page, 'plan-week');
  await tap(a.page, '#pl-wp-same');
  const d2 = await plan(a.page);
  check('7 "Same as last week" copies it', JSON.stringify(((d2.wplan || {})[3] || {}).str) === '[2,5]' && (d2.wplan[3] || {}).ift === 'split', d2.wplan);
  await done(a);
  /* a plan without strength days (period pain): her time and an if-then plan only */
  const pn = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9), { log: logged(9, 4) }) } }, hash: '#plan-week' });
  const pv = await view(pn.page);
  check('7 a pain plan: her time and a plan B, no strength days', /Plan your week/.test(pv) && !/strength days/i.test(pv) && /Your time to move/.test(pv) && /This week: walk \d+ minutes a day/.test(pv), pv);
  await done(pn);
  /* a pregnancy plan has no week to plan */
  const pg = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(120) }, events: [], intake: { goal: 'food' }, mods: { plan: planOf('preg', 'food', ago(9)) } }, hash: '#plan-week' });
  check('7 a pregnancy plan: no Plan your week (My plan instead)', !/Plan your week/.test(await view(pg.page)) && !(await has(pg.page, '#pl-wp')) && !(await has(pg.page, '#pl-nudge')));
  await done(pg);
}

/* ---------- 8: the nudge ---------- */
{
  const a = await open({ seed: cyc(ago(9), { log: logged(9, 5) }), now: at(0, '10:00'), hash: '#plan' });
  check('8 off by default: no nudge until she turns it on', !(await a.page.evaluate(() => !!window.Saathi.reminders.get('plan-nudge'))) && !(await a.page.$eval('#pl-nudge', (c) => c.checked)));
  check('8 Plan settings say when, and that it is one a day at most', /Nudge at my time to move\nAfter dinner, about 9:15 pm/.test(await view(a.page)) && /One nudge a day at most, and none once you have moved or on a rest day\./.test(await view(a.page)));
  await a.page.$eval('#pl-nudge', (c) => c.click()); await settle(a.page, 1500);
  const r = await a.page.evaluate(() => window.Saathi.reminders.get('plan-nudge'));
  const sc = await a.page.evaluate(() => (window.__sched || []).filter((x) => /plan-nudge/.test(x.id)).map((x) => [x.id, x.body, x.go]));
  check('8 on: a daily reminder at her time, which opens today\'s routine', r && r.time === '21:15' && r.every === 1 && r.mod === 'plan' && sc.length && sc[0][0] === 'r-plan-nudge-' + TODAY && sc[0][1] === 'Your time to move. Tap to start.' && sc[0][2] === 'plan-now', [r, sc.slice(0, 2)]);
  /* she moves (a +10): today's nudge stops */
  await go(a.page, 'plan-moves'); await tap(a.page, '[data-pl-add="10"]'); await settle(a.page, 1200);
  const sc2 = await a.page.evaluate(() => (window.__sched || []).filter((x) => /plan-nudge/.test(x.id)).map((x) => x.id));
  check('8 once she has moved, none today', (await a.page.evaluate(() => window.Saathi.reminders.get('plan-nudge').doneOn)) === TODAY && sc2[0] === 'r-plan-nudge-' + iso(TODAY, 1), sc2.slice(0, 2));
  await go(a.page, 'plan-now');
  check('8 the nudge opens today\'s routine', (await a.page.evaluate(() => location.hash)) === '#plan-r-cycle');
  /* a shared phone: plain words */
  await a.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); }); await settle(a.page, 1200);
  const sc3 = await a.page.evaluate(() => (window.__sched || []).filter((x) => /plan-nudge/.test(x.id)).map((x) => x.body));
  check('8 a shared phone: "A reminder", nothing more', sc3.length && sc3.every((b) => !/move|plan/i.test(b)), sc3.slice(0, 2));
  await a.page.evaluate(() => { window.Saathi.state.settings.discreet = false; window.Saathi.save(); });
  /* her week's pause moves it; Stop removes it */
  await go(a.page, 'plan'); await tap(a.page, '#pl-pause');
  const rp = await a.page.evaluate(() => window.Saathi.reminders.get('plan-nudge'));
  check('8 Pause for a week: the nudge starts again when her plan does', rp && rp.start === iso(TODAY, 7), rp);
  await tap(a.page, '#pl-unpause'); await tap(a.page, '#pl-stop'); await tap(a.page, '#pl-stop-yes');
  check('8 Stop: the nudge goes with her plan', !(await a.page.evaluate(() => !!window.Saathi.reminders.get('plan-nudge'))) && !(await plan(a.page)).nudge);
  await done(a);
  /* no time to move yet: the switch opens Plan your week, and saving turns it on */
  const b = await open({ seed: cyc(ago(9), { log: logged(9, 5), when: null }), now: at(0, '10:00'), hash: '#plan' });
  check('8 no time yet: "Pick your time in Plan this week"', /Nudge at my time to move\nPick your time in Plan this week/.test(await view(b.page)));
  await b.page.$eval('#pl-nudge', (c) => c.click()); await settle(b.page, 500);
  check('8 ... the switch opens Plan your week', (await b.page.evaluate(() => location.hash)) === '#plan-week');
  await tap(b.page, '[data-wp-w="morning"]'); await tap(b.page, '#pl-wp-save');
  const rb = await b.page.evaluate(() => window.Saathi.reminders.get('plan-nudge'));
  check('8 ... saving her time turns the nudge on, in the morning', rb && rb.time === '07:30' && (await plan(b.page)).when === 'morning', rb);
  /* a rest day: none */
  await go(b.page, 'plan-checkin'); if (await has(b.page, '#pl-ci-rest')) await tap(b.page, '#pl-ci-rest');
  check('8 a rest day: no nudge that day', (await b.page.evaluate(() => window.Saathi.reminders.get('plan-nudge').doneOn)) === TODAY);
  await done(b);
}

/* ---------- 9: the 4-week check ---------- */
{
  const l = logged(29, 5); l[ago(6)] = Object.assign({}, l[ago(6)], { str: true }); l[ago(9)] = Object.assign({}, l[ago(9)], { str: true });
  const W4 = { 1: { e: 'ok', seen: true }, 2: { e: 'ok', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true } };
  const a = await open({ seed: cyc(ago(29), { log: l, weeks: W4, body: [{ d: ago(29), h: 158, w: 66.4, waist: 86 }], height: 158 }), now: at(0, '10:00') });
  const sl = await txt(a.page, '#view .pl-sl-m');
  check('9 week 5: the month card offers "Do your 4-week check"', /Month 1 done/.test(sl) && /Do your 4-week check/.test(sl), sl);
  await tap(a.page, '#view .pl-sl-m [data-go="plan-check"]');
  const v = await view(a.page);
  check('9 how she feels first; skin and hair for PMOS; waist and weight last and optional', /Your 4-week check\n\n1 minute · only on this phone/.test(v) && v.indexOf('Energy') < v.indexOf('Skin and hair') && v.indexOf('Skin and hair') < v.indexOf('Measure, if you like') && /Optional/.test(v) && v.indexOf('Weight (kg)') > v.indexOf('Waist (cm)'), v);
  await shot(a.page, '9-check');
  await tap(a.page, '#pl-mc-save');
  check('9 every feeling needs an answer', /Pick one answer for each\./.test(await txt(a.page, '#pl-mc-err')));
  for (const q of ['e:better', 's:same', 'm:better', 'sk:worse']) await tap(a.page, '[data-mc="' + q + '"]');
  await a.page.fill('#pl-mc-waist', '84'); await a.page.fill('#pl-mc-w', '65.8'); await tap(a.page, '#pl-mc-save');
  const r = await view(a.page); const d = await plan(a.page);
  check('9 saved: her answers, waist and weight, also in My body', JSON.stringify(d.mcheck[1]) === JSON.stringify({ at: TODAY, e: 'better', s: 'same', m: 'better', sk: 'worse', waist: 84, w: 65.8 }) && d.body.some((x) => x.d === TODAY && x.waist === 84 && x.w === 65.8 && x.h === 158), [d.mcheck, d.body]);
  check('9 the result: what she did beside what she noticed', /Your first 4 weeks/.test(r) && /WHAT YOU DID\n\d+\ndays you moved\n2\nstrength days/.test(r) && /WHAT YOU NOTICED\nEnergy\nBetter\nSleep\nSame/.test(r) && /Waist\n86 → 84 cm/.test(r) && /Weight\n66\.4 → 65\.8 kg/.test(r), r);
  check('9 ... never a judgement on her body', !/(lost|gained|great|well done|too high|overweight|good news)/i.test(r.slice(r.indexOf('WHAT YOU NOTICED'))), r);
  check('9 ... "Worse" brings a doctor, and her periods line', /Something feels worse\? A doctor can help you find out why\./.test(r) && (await has(a.page, '#view [data-go="access-doctor"]')) && /Periods often take 3 to 6 months to change/.test(r) && /Your next check: in 4 weeks\./.test(r), r);
  await shot(a.page, '9-result');
  await go(a.page, 'home');
  check('9 the month card\'s job is done', !(await has(a.page, '#view .pl-sl-m')));
  await go(a.page, 'plan-progress');
  check('9 My progress: "How you felt"', /How you felt\n\nAfter 4 weeks: Energy: better · Sleep: same · Mood: better · Skin and hair: worse/.test(await view(a.page)), (await view(a.page)).slice(-700));
  const sum = await a.page.evaluate(() => (window.Saathi.summaries ? window.Saathi.summaries() : []).filter((m) => m.mod === 'plan').map((m) => (m.sections || []).map((x) => (x.lines || []).join(' / ')).join(' // ')).join(''));
  check('9 her report carries her latest check', /Since starting \(her 4-week check\): energy better, sleep same, mood better, skin and hair worse/.test(sum), sum);
  await done(a);
  /* My plan's row, "Not now", a light plan (no measures, no skin), a shared phone, the end */
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(30), { log: logged(30, 4) }) } }, now: at(0, '10:00'), hash: '#plan' });
  check('9 My plan: the check\'s row while it is due', /Your 4-week check\n1 minute: how you feel since you started/.test(await view(b.page)));
  await go(b.page, 'plan-check'); const bv = await view(b.page);
  check('9 a pain plan: energy, sleep and mood; no skin, no measures', /Energy/.test(bv) && /Mood/.test(bv) && !/Skin and hair|Waist|Weight/.test(bv), bv);
  await tap(b.page, '#pl-mc-not');
  check('9 "Not now": back to My plan, and the row waits 3 days', (await b.page.evaluate(() => location.hash)) === '#plan' && !(await has(b.page, '#view .pl-mc-rowl')));
  await done(b);
  const dz = await open({ seed: cyc(ago(29), { log: logged(29, 5) }, { settings: { discreet: true } }), now: at(0, '10:00'), hash: '#plan-check' });
  check('9 a shared phone: no check', !/4-week check/.test(await view(dz.page)) && !(await has(dz.page, '#pl-mc-save')));
  await done(dz);
  const e = await open({ seed: cyc(ago(90), { log: logged(90, 4) }), now: at(0, '10:00'), hash: '#plan' });
  check('9 the end of 12 weeks: "How do you feel after 12 weeks?"', /How do you feel after 12 weeks\?/.test(await view(e.page)) && (await has(e.page, '#view .pl-mc-end [data-go="plan-check"]')));
  await done(e);
}

/* ---------- 10: two quiet weeks ---------- */
{
  /* week 4: her first week full, then two quiet ones */
  const l = {}; [21, 20, 19, 18, 17].forEach((i) => { l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd' } }; }); l[ago(10)] = { min: 10, ci: 1, ck: { move: 'd' } }; l[ago(4)] = { ci: 1, ck: { food: 'd' } };
  const W = { 1: { e: 'ok', seen: true }, 2: { e: 'low', seen: true }, 3: { e: 'low', seen: true } };
  const a = await open({ seed: cyc(ago(21), { log: l, weeks: W }), now: at(0, '10:00') });
  const q = await txt(a.page, '#view .pl-sl-quiet');
  check('10 two quiet weeks: one card, its 4 ways and Not now', /Two quiet weeks/.test(q) && /Make next week lighter\n10 minutes a day and one food habit/.test(q) && /Ask family to walk with me\nYour own message, with no health words/.test(q) && /Talk to a Qura doctor\nThe first 20-minute call is free/.test(q) && /Pause for a week/.test(q) && /Not now/.test(q), q);
  check('10 ... it leads "Sakhi says"', (await a.page.$eval('#view .slot > .pl-slot, #view .slot > .card', (e) => e.className).catch(() => '')).indexOf('pl-sl-quiet') >= 0);
  await shot(a.page, '10-quiet');
  await tap(a.page, '#pl-q-share');
  const sh = await a.page.evaluate(() => window.__shared);
  check('10 the family message goes through her phone\'s share sheet, with no health words', sh && sh[1] === 'Will you walk with me after dinner? 15 minutes, every day this week.' && !/period|pmos|pcos|weight|health|plan|doctor|sakhi/i.test(sh[1]), sh);
  await tap(a.page, '#pl-q-edit'); await a.page.fill('#pl-q-ta', 'Shall we walk to the temple each evening?'); await tap(a.page, '#pl-q-share');
  check('10 ... in her own words when she changes it', ((await a.page.evaluate(() => window.__shared)) || [])[1] === 'Shall we walk to the temple each evening?');
  await tap(a.page, '#pl-q-light');
  const d = await plan(a.page); const td = await txt(a.page, '#view .today-card');
  check('10 a lighter week: 7 days of 10 minutes and one food habit, said on Today', JSON.stringify(d.light) === JSON.stringify({ from: TODAY, until: iso(TODAY, 7) }) && d.quietAt === TODAY && /A lighter week: 10 minutes a day until Tuesday\./.test(td) && /0 of 2 done today/.test(td) && /Gentle start · \d+ min/.test(td) && /walk 10 minutes/.test(td) && !/In bed by/.test(td), [d.light, td]);
  check('10 ... and the card is gone', !(await has(a.page, '#view .pl-sl-quiet')));
  await a.page.clock.setFixedTime(at(7, '10:00')); await go(a.page, 'home');
  check('10 ... a week later, her plan as before', /3 done today|0 of 3 done today/.test(await txt(a.page, '#view .today-card')) && !(await has(a.page, '#view .pl-sl-quiet')), await txt(a.page, '#view .today-card'));
  await done(a);
  /* Qura's free call; Not now waits 4 weeks; a pause; a shared phone */
  const c = await open({ seed: cyc(ago(21), { log: l, weeks: W }), now: at(0, '10:00') });
  await tap(c.page, '#pl-q-call');
  check('10 the free Qura doctor call, with her plan as the topic', (await c.page.evaluate(() => location.hash)) === '#ask' && ((await c.page.evaluate(() => window.Saathi.state.askTopics || [])).join() || '').includes('My plan'), await c.page.evaluate(() => window.Saathi.state.askTopics));
  await c.page.clock.setFixedTime(at(13, '10:00')); await go(c.page, 'home');
  check('10 at most once in 4 weeks', !(await has(c.page, '#view .pl-sl-quiet')));
  await done(c);
  const p = await open({ seed: cyc(ago(21), { log: l, weeks: W }), now: at(0, '10:00') });
  await tap(p.page, '#pl-q-pause');
  check('10 Pause for a week', (await plan(p.page)).pauseUntil === iso(TODAY, 7));
  await done(p);
  const dz = await open({ seed: cyc(ago(21), { log: l, weeks: W }, { settings: { discreet: true } }), now: at(0, '10:00') });
  check('10 not on a shared phone', !(await has(dz.page, '#view .pl-sl-quiet')));
  await done(dz);
}

/* ---------- 11: Hindi, 360 px ---------- */
{
  const l = logged(9, 5); l[TODAY] = { min: 8, r: ['cycle'] };
  const h = await open({ seed: cyc(ago(9), { log: l }, { lang: 'hi' }), lang: 'hi', w: 360 });
  const td = await txt(h.page, '#view .today-card');
  check('11 Hindi Today: the strength line', /गुरुवार: ताक़त का दिन · इस हफ़्ते 2 में से 0/.test(td) && await noScroll(h.page), td);
  await go(h.page, 'plan-checkin'); const v = await view(h.page);
  check('11 Hindi check-in: what counted, and last night', /आपके योग से गिना गया/.test(v) && /कल: रात 11:30 तक बिस्तर पर गईं\?/.test(v) && /हाँ\nलगभग\nनहीं/.test(v) && await noScroll(h.page), v);
  await go(h.page, 'plan-week'); const w = await view(h.page);
  check('11 Hindi Plan your week, at 360 px', /अपना हफ़्ता तय करें/.test(w) && /चलने-फिरने का आपका समय/.test(w) && !/[a-z]{4,}/.test(w.replace(/Sakhi|Qura|PMOS|PCOS/g, '')) && await noScroll(h.page), w);
  await shot(h.page, '11-week-hi');
  await done(h);
  const c = await open({ seed: cyc(ago(29), { log: logged(29, 5) }, { lang: 'hi' }), lang: 'hi', w: 360, hash: '#plan-check', now: at(0, '10:00') });
  const cv = await view(c.page);
  check('11 Hindi 4-week check, at 360 px', /आपका 4 हफ़्ते का चेक-इन/.test(cv) && /बेहतर\nवैसा ही\nख़राब/.test(cv) && await noScroll(c.page), cv);
  await done(c);
}
check('11 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
