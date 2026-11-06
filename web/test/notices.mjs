// Version 37.2: a companion that notices (docs/ux-gaps-2026-10-24.md, section 3; MODULE_API section 41). Mohit, 24 Oct: "Plan
// to do all three properly". This file checks the acceptance criteria:
//   1 the evening reminder opens the check-in for every plan, says "How did today go? 1 minute" on its own channel, and is
//     never at a morning time (a Version 37 morning time moves to 8 pm); discreet mode keeps its neutral words;
//   2 one count everywhere after a "Partly" (the check-in and Today), the plan's rows gone once she checked in, no "All done";
//   3 while the plan's doctor check shows, no separate "no period yet"; at 90 days it shows; midlife words from 40;
//   4 the week's look-back on Today, leading with what she did, one question, the week's own barriers; month 1 after a lapse;
//   5 her period noticed, that day, on Today and My plan (and the cramps line on the pain plan);
//   6 the end of 12 weeks: Today says so, an honest summary, what next, results with the gap that ended during the plan and
//     her joining answer; a pregnancy plan doesn't end at 12 weeks;
//   7 discreet mode: no goal label or period words on any plan screen;
//   8 Hindi, a 360 px screen, and no page errors.
// Usage: node test/notices.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'notices'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__rings = []; window.SakhiAndroid = { schedule(j){ try { window.__rings = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.37-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: {}, body: [], ppv2No: '2026-10-01' }, extra || {});   /* Version 39.55: she kept her plan when My period plan was offered (periodplan.mjs checks the offer) */
const IK = { at: ago(30), stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'b24', work: 'day', when: 'dinner' };
const REM = (time, title) => ({ id: 'plan', mod: 'plan', title: title || { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(30), every: 1, time: time || '20:00', on: true });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const allText = (page) => page.$eval('#view', (e) => e.textContent);   /* folded cards too */
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const slotFirst = (page) => page.$eval('#view .slot', (s) => { const c = s.children[1]; return c ? c.innerText.split('\n')[0] : ''; }).catch(() => '');
const rings = async (page) => { await settle(page, 1200); return page.evaluate(() => (window.__rings || []).filter((r) => /^r-plan-/.test(String(r.id)))); };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const HEALTH = /period|PMOS|PCOS|insulin|hormone|cramp|iron|cycle care|regular periods|waist|acne/i;

/* ---------- 1. The evening reminder opens the check-in, for every plan ---------- */
for (const [stage, goal, extra] of [['cycle', 'irregular', {}], ['cycle', 'pain', {}], ['cycle', 'heavy', {}], ['cycle', 'pms', {}],
  ['preg', 'nausea', { situation: { pregnant: true, pregnantSince: ago(60) }, events: [] }], ['post', 'recovery', { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [] }], ['meno', 'hot', { situation: { midlife: true }, dob: '1977-07-01' }]]) {
  const { ctx, page, errs } = await open({ seed: extra });
  await page.evaluate((a) => { const S = window.Saathi; S.plan.startFromIntake(a); S.plan.start('today', '20:00'); S.save(); }, { stage: stage, goal: goal, gap: 'n', act: 0, bed: 'b23', work: 'day', when: 'evening', pain: 'pk', painDays: '23', pads: 'p23', clots: 'n', tired: 'n', pms: ['mood'], pmsLevel: 'lot' });
  await go(page, 'home');
  const r = (await rings(page)).filter((x) => x.rid === 'plan');   /* Version 39.22: the move nudge and the wind-down ring too */
  check('1 ' + stage + '/' + goal + ': the evening alarm opens the check-in, on "Your plan", at 8 pm', r.length > 0 && r.every((x) => x.go === 'plan-checkin' && x.ch === 'sakhi_plan' && x.chname === 'Your plan' && x.hh === 20 && (stage === 'post' ? /Your recovery check · 1 minute/ : /How did today go\? 1 minute/).test(x.body)), r.slice(0, 1));   /* Version 39.47: to day 41 after a birth, her recovery check */
  check('1 ' + stage + '/' + goal + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  /* a Version 37 plan with a morning time and the old title */
  const { ctx, page, errs } = await open({ seed: { intake: IK, reminders: [REM('08:00', { en: 'Your plan for today', hi: 'आज का आपका प्लान' })], mods: { plan: planOf('cycle', 'irregular', ago(5), { remAt: '08:00' }) } } });
  await go(page, 'plan'); await go(page, 'home');
  const r = (await st(page)).reminders.find((x) => x.id === 'plan');
  check('1 a Version 37 morning check-in moves to the evening, after her 9:15 pm walk (Version 39.27: 10 pm), with the evening words', r && r.time === '22:00' && r.title.en === 'How did today go? 1 minute', r);
  await go(page, 'plan-settings');   /* Version 39.15: Plan settings is a page of its own */
  check('1 My plan offers evening times only', !(await has(page, '[data-pl-at="08:00"]')) && (await has(page, '[data-pl-at="18:00"]')) && (await has(page, '[data-pl-at="21:00"]')));
  await ctx.close();
  const b = await open({ seed: { intake: IK, reminders: [REM()], settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('cycle', 'irregular', ago(5)) } } });
  const rd = await rings(b.page);
  check('1 discreet mode: the alarm keeps its neutral words and channel', rd.length > 0 && rd.every((x) => x.ch === 'sakhi_reminders' && !/How did today go/.test(x.body)), rd.slice(0, 1));
  check('1 no page errors (migration, discreet)', errs.length === 0 && b.errs.length === 0, errs.concat(b.errs));
  await b.ctx.close();
}

/* ---------- 2. One count everywhere ---------- */
{
  /* plan day 4: her bedtime step has joined (Version 39.43), so all 4 steps are counted */
  const { ctx, page, errs } = await open({ seed: { intake: IK, reminders: [REM()], mods: { plan: planOf('cycle', 'irregular', ago(3)) } }, now: at(0, '20:30') });
  await go(page, 'plan-checkin');
  for (const g of await page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))])) await tap(page, '[data-ci="' + g + ':p"]');
  await tap(page, '[data-ci-b="time"]'); await tap(page, '#pl-ci-save');
  let v = await view(page);
  check('2 the check-in counts Partly as partly', /0 done, 4 partly today · 1 of 7 days this week/.test(v), v.slice(0, 400));
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('2 Today says the same count, and that she checked in', /0 done, 4 partly today/.test(td) && /Checked in today/.test(td), td);
  check('2 her steps stay once she checked in, each marked partly (Version 39.14), with no "All done for today"', (await has(page, '#view .today-plan-move')) && /Walk after lunch and dinner\nPartly done/.test(td) && !/All done for today/.test(td), td);
  await shot(page, '2-today-after-partly');
  check('2 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page } = await open({ seed: { intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(3)) } }, now: at(0, '20:30') });   /* plan day 4: with her bedtime step (Version 39.43) */
  await go(page, 'plan-checkin'); await tap(page, '[data-ci="yoga:n"]'); await tap(page, '[data-ci="move:d"]'); await tap(page, '[data-ci="food:p"]'); await tap(page, '[data-ci="sleep:n"]'); await tap(page, '[data-ci-b="tired"]'); await tap(page, '#pl-ci-save');
  check('2 a mixed day: "1 done, 1 partly today"', /1 done, 1 partly today/.test(await view(page)), (await view(page)).slice(0, 300));
  await go(page, 'home');
  check('2 ... and Today agrees', /1 done, 1 partly today/.test(await txt(page, '#view .today-card')));
  await ctx.close();
}

/* ---------- 3. "No period yet" and the plan's doctor check ---------- */
{
  const ev = [{ d: ago(110), t: 'start' }, { d: ago(105), t: 'end' }, { d: ago(80), t: 'start' }, { d: ago(75), t: 'end' }, { d: ago(45), t: 'start' }, { d: ago(40), t: 'end' }];
  const { ctx, page, errs } = await open({ seed: { events: ev, intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(4), { intake: IK }) } } });
  await go(page, 'home');
  let v = await view(page);
  check('3 day 5, 45 days since her period: the plan\'s doctor check leads', (await slotFirst(page)) === 'Did you get the doctor check?', await slotFirst(page));
  check('3 ... and "no period yet" isn\'t a card of its own', !/no period yet/i.test(await allText(page)), (await allText(page)).match(/.{0,60}no period yet.{0,40}/i));
  check('3 the doctor check says a pregnancy test comes first if she could be pregnant', /do a pregnancy test first/.test(v));
  await tap(page, '#pl-doc-yes');
  /* Version 39.6: "Yes, done" rests what the doctor check covered, the early "no period yet" too (MODULE_API section 49) */
  check('3 once the check is done, the early "no period yet" rests too', !/no period yet/i.test(await allText(page)), (await allText(page)).match(/.{0,60}no period yet.{0,40}/i));
  await ctx.close();
  const e = await open({ seed: { events: [{ d: ago(95), t: 'start' }, { d: ago(90), t: 'end' }], intake: IK, mods: { explain: { seen: { ['late_now:' + ago(95)]: ago(50) } }, plan: planOf('cycle', 'irregular', ago(60), { intake: IK, doc: 'done', docAt: ago(50) }) } } });
  await go(e.page, 'home');
  check('3 ... but at 90 days it shows again, though she rested the early card for the same gap', /no period yet/i.test(await allText(e.page)), (await allText(e.page)).slice(0, 900));
  await e.ctx.close();
  const b = await open({ seed: { events: [{ d: ago(95), t: 'start' }, { d: ago(90), t: 'end' }], intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(4), { intake: IK }) } } });
  await go(b.page, 'home');
  check('3 at 90 days or more it always shows', /no period yet/i.test(await allText(b.page)), (await allText(b.page)).slice(0, 900));
  await b.ctx.close();
  const c = await open({ seed: { situation: { midlife: true }, dob: '1978-03-01', events: [{ d: ago(130), t: 'start' }, { d: ago(125), t: 'end' }, { d: ago(70), t: 'start' }, { d: ago(65), t: 'end' }] } });
  await go(c.page, 'home');
  const cv = await view(c.page);
  check('3 from 40: midlife words, not "no period yet"', /70 days since your last period/.test(cv) && !/no period yet/i.test(cv), cv.slice(0, 900));
  await go(c.page, 'explain');
  check('3 ... and on the explain page, the years before menopause', /In the years before menopause, gaps between periods often get longer or shorter/.test(await view(c.page)));
  check('3 no page errors', errs.length === 0 && b.errs.length === 0 && c.errs.length === 0, errs.concat(b.errs, c.errs));
  await c.ctx.close();
}

/* ---------- 4. The week's look-back on Today, and month 1 after a lapse ---------- */
{
  const log = {}; [7, 6, 5, 3].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' }, min: 10 }; }); [6, 4, 2].forEach((n) => { log[ago(n)] = Object.assign(log[ago(n)] || { ci: 1 }, { bar: 'time' }); });
  const { ctx, page, errs } = await open({ seed: { intake: IK, mods: { plan: planOf('pain', 'pain', ago(7), { goal: 'pain', log: log }) } } });
  await go(page, 'home');
  let v = await view(page);
  check('4 a new week: no look-back on Today (Version 39.68: the week dots show her week; it stays on My plan)', !(await has(page, '#view .pl-sl-rev, #view #pl-rev-open')), await txt(page, '#view .today-card'));
  await go(page, 'plan'); v = await view(page);   /* Version 39.68: the look-back lives on My plan */
  check('4 it leads with what she did, and the week\'s own barrier', /Week 1 is done/.test(v) && /You followed your plan on \d of 7 days/.test(v) && /No time on 3 days\./.test(v) && !/target/i.test(v), v.slice(0, 1200));
  check('4 one question: her energy (what got in the way comes from the check-ins)', (await page.$$('#view .pl-review [data-pl-e]')).length === 3 && !(await has(page, '#view [data-pl-b]')));
  await tap(page, '#view .pl-review [data-pl-e="ok"]');
  check('4 her answer brings the tip for that barrier', /Split it up/.test(await view(page)));
  let s = await st(page);
  check('4 the week keeps her energy and the barrier', s.mods.plan.weeks[1].e === 'ok' && s.mods.plan.weeks[1].b === 'time', s.mods.plan.weeks);
  await tap(page, '#pl-rev-ok');
  check('4 "Got it" puts it away', !(await has(page, '#view .pl-review')));
  await ctx.close();
  const one = {}; one[ago(28)] = { ci: 1, ck: { move: 'd' }, min: 10 };
  const m = await open({ seed: { intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(28), { log: one, doc: 'done' }) } } });
  await go(m.page, 'home');
  const mv = await view(m.page);
  check('4 month 1 shows even after a lapse, with the restart in its words', (await slotFirst(m.page)) === 'Month 1 done' && /You started on \d+ \w+\. Start again small today: Walk \d+ minutes/.test(mv), [await slotFirst(m.page), mv.slice(0, 900)]);
  check('4 no page errors', errs.length === 0 && m.errs.length === 0, errs.concat(m.errs));
  await m.ctx.close();
}

/* ---------- 5. Her period, noticed ---------- */
for (const [pack, goal, extraLine] of [['cycle', 'irregular', null], ['pain', 'pain', /Your cramps routine is on Today on your period days\./]]) {
  const ev = [{ d: ago(68), t: 'start' }, { d: ago(63), t: 'end' }, { d: ago(40), t: 'start' }, { d: ago(35), t: 'end' }];
  const { ctx, page, errs } = await open({ seed: { events: ev, intake: IK, mods: { plan: planOf(pack, goal, ago(10), { doc: 'done', goal: pack === 'pain' ? 'pain' : 'cycles' }) } } });
  await go(page, 'home');
  await page.$eval('[data-log="start"]', (b) => b.click()); await settle(page, 600);
  await page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await go(page, 'home');
  let v = await txt(page, '#view .today-card');
  /* Version 39.27 (R05): on the pain plan, "Pain today?" takes the place of "noted for your results" */
  check('5 ' + pack + ': the day she logs it, her plan says it noticed', (pack === 'pain' ? /Your period came after 40 days\.\s+Pain today\?/.test(v) && !/noted it for your results/.test(v) : /Your period came after 40 days\. Sakhi noted it for your results\./.test(v)) && (!extraLine || extraLine.test(v)), v);
  await go(page, 'plan');
  check('5 ' + pack + ': My plan says so too', /Your period came after 40 days/.test(await view(page)));
  await page.clock.setSystemTime(at(3, '10:00')); await go(page, 'home');
  check('5 ' + pack + ': a few days later it is gone', !/Your period came after/.test(await txt(page, '#view .today-card')));
  check('5 ' + pack + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 6. The end of 12 weeks ---------- */
{
  const log = {}; [80, 70, 60].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' }, min: 10 }; });
  const ev = [{ d: ago(100), t: 'start', approx: true }, { d: ago(50), t: 'start' }, { d: ago(45), t: 'end' }];
  const { ctx, page, errs } = await open({ seed: { events: ev, intake: IK, reminders: [REM()], mods: { plan: planOf('cycle', 'irregular', ago(84), { log: log, intake: IK, doc: 'done' }) } } });
  await go(page, 'home');
  let v = await view(page);
  /* Version 39.27 (minimalism audit R03): from day 85 her steps carry on; Today says her 12 weeks are done, with her results
     and Stop; no second card in "Sakhi says" */
  check('6 after week 12, Today says it is done, her steps carry on, her results one tap away', /Your 12 weeks are done\s+Your steps carry on\./.test(await txt(page, '#view .pl-carry')) && (await has(page, '#view .pl-carry [data-go="plan-end"].primary')) && (await has(page, '#view .pl-carry #pl-carry-stop')) && /Walk after lunch and dinner/.test(await txt(page, '#view .today-card')), await txt(page, '#view .today-card'));   /* Version 39.72: her walk after meals */
  check('6 ... and no second "12 weeks are done" card in "Sakhi says"', (await slotFirst(page)) !== 'Your 12 weeks are done' && !(await has(page, '#view .pl-sl-end')), await slotFirst(page));
  await go(page, 'plan-end');
  v = await view(page);
  check('6 the summary is honest, then her results', /You followed your plan on 3 of 84 days\./.test(v) && /Want to try again, smaller\?/.test(v) && !/You did 12 weeks/.test(v), v.slice(0, 600));
  check('6 results: her joining answer as "before", and the gap that ended during her plan', /You said: 36 to 45 days/.test(v) && /about 50/.test(v), v.match(/Days between periods.{0,200}/s));
  /* Version 39.6: one end card for every woman, with no judging word (MODULE_API section 49) */
  check('6 every plan ends with "Show this page to a doctor"', /Show this page to a doctor/.test(v) && (await has(page, '#view .pl-end-doc [data-go="report-show"]')) && !/If nothing has changed/.test(v));
  check('6 what next: her steps carry on, a new 12 weeks, or Stop (no gate)', /What next\?/.test(v) && /Your steps carry on/.test(v) && !(await has(page, '#pl-keep')) && (await has(page, '#pl-again')) && (await has(page, '#pl-end-stop')));
  await shot(page, '6-end');
  await go(page, 'home');
  check('6 once seen, Today\'s row goes; her steps stay', !(await has(page, '#view .pl-carry')) && /Walk after lunch and dinner/.test(await txt(page, '#view .today-card')));   /* Version 39.72 */
  const s = await st(page); const r = s.reminders.find((x) => x.id === 'plan');
  check('6 her plan carries on ("Keep it light"), and so does the evening check-in: 4 weeks past her last visit (Version 39.27)', s.mods.plan.keep === true && s.mods.plan.carried === TODAY && r && r.on && r.until === iso(TODAY, 28) && /KEEP IT LIGHT/.test(await view(page)), [s.mods.plan.keep, r]);
  check('6 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const log = {}; [70, 50].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' } }; });
  const { ctx, page, errs } = await open({ seed: { intake: Object.assign({}, IK, { goal: 'pain', pain: 'stop' }), mods: { plan: planOf('pain', 'pain', ago(90), { goal: 'pain', log: log, intake: { stage: 'cycle', goal: 'pain', pain: 'stop' } }) } } });
  await go(page, 'plan-end');
  const v = await view(page);
  check('6 a light plan ends the same way', /Your 12 weeks are done/.test(v) && /You followed your plan on 2 of 84 days/.test(v) && /What next\?/.test(v), v.slice(0, 500));
  check('6 pain that stopped her day: a doctor is offered at the end', /Show this page to a doctor/.test(v) && (await has(page, '#view .pl-end-doc button')) && !(await has(page, '#view [data-go="access-doctor"]')));
  await ctx.close();
  const p = await open({ seed: { events: [], situation: { pregnant: true, pregnantSince: ago(150) }, mods: { plan: planOf('preg', 'food', ago(90)) } } });
  await go(p.page, 'home');
  const pv = await txt(p.page, '#view .today-card');
  check('6 a pregnancy plan doesn\'t end at 12 weeks', !/Your 12 weeks are done/.test(pv) && (await p.page.evaluate(() => window.Saathi.plan.running())), pv);
  check('6 no page errors (light, pregnancy)', errs.length === 0 && p.errs.length === 0, errs.concat(p.errs));
  await p.ctx.close();
}

/* ---------- 7. A shared phone: no health words on plan screens ---------- */
{
  const log = {}; [7, 6, 5].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' }, min: 10, bar: 'pain' }; });
  const { ctx, page, errs } = await open({ seed: { intake: IK, settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('cycle', 'irregular', ago(14), { log: log, intake: IK }) } }, now: at(0, '20:30') });
  await go(page, 'plan');
  let v = await view(page);
  check('7 discreet: My plan has no goal label or health words', !HEALTH.test(v) && /Yoga · \d+ min/.test(v), v.match(/.{0,60}(period|PMOS|PCOS|insulin|hormone|cramp|iron|cycle care|regular periods|waist|acne).{0,40}/i));
  await go(page, 'plan-progress');
  v = await view(page);
  check('7 discreet: My progress shows no period or waist words', !/Days between periods|What to expect|waist|period/i.test(v), v.match(/.{0,60}(Days between periods|What to expect|waist|period).{0,40}/i));
  await go(page, 'plan-checkin');
  v = await view(page);
  check('7 discreet: the check-in names no health goal, and has no "Pain" chip', !HEALTH.test(v) && !(await has(page, '[data-ci-b="pain"]')), v.slice(0, 500));
  for (const g of await page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))])) await tap(page, '[data-ci="' + g + ':d"]');
  await tap(page, '#pl-ci-save');
  check('7 discreet: the check-in\'s after screen is plain: her count, no reason line (Version 39.72)', /today · \d of 7 days this week/.test(await view(page)) && !HEALTH.test(await view(page)), (await view(page)).slice(0, 300));
  await ctx.close();
  const b = await open({ seed: { intake: IK, settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('heavy', 'heavy', ago(8), { log: log }) } } });
  await go(b.page, 'home');
  const td = await txt(b.page, '#view .today-card');
  check('7 discreet: the heavy plan\'s iron step says only "Your plan for today" (or "Your step {n}" beside another hidden step, Version 39.47)', /Your plan for today|Your step \d/.test(td) && !HEALTH.test(td), td);
  await go(b.page, 'plan');   /* Version 39.68: the look-back lives on My plan */
  check('7 discreet: the look-back shows, in plain words', (await has(b.page, '#view .pl-review')) && !HEALTH.test(await txt(b.page, '#view .pl-review')), await txt(b.page, '#view .pl-review'));
  await go(b.page, 'plan');
  check('7 discreet: a light plan\'s page has no health words', !HEALTH.test(await view(b.page)), (await view(b.page)).match(/.{0,60}(period|PMOS|insulin|hormone|cramp|iron|regular periods|waist).{0,40}/i));
  check('7 no page errors', errs.length === 0 && b.errs.length === 0, errs.concat(b.errs));
  await b.ctx.close();
}

/* ---------- 8. Hindi, a small screen ---------- */
{
  const log = {}; [80, 70].forEach((n) => { log[ago(n)] = { ci: 1, ck: { move: 'd' }, min: 10 }; });
  const { ctx, page, errs } = await open({ seed: { lang: 'hi', intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(84), { log: log, intake: IK }) } }, lang: 'hi', w: 360 });
  await go(page, 'home');
  check('8 Hindi: the end of 12 weeks', /आपके 12 हफ़्ते पूरे हुए/.test(await view(page)) && /अपने नतीजे देखें/.test(await view(page)), (await view(page)).slice(0, 600));
  check('8 360 px: Today doesn\'t scroll sideways', await noScroll(page));
  await go(page, 'plan-end');
  check('8 Hindi: the summary and what next', /आपने 84 में से 2 दिन प्लान पूरा किया/.test(await view(page)) && /आगे क्या\?/.test(await view(page)) && /आपने बताया: 36 से 45 दिन/.test(await view(page)), (await view(page)).slice(0, 600));
  check('8 360 px: the summary doesn\'t scroll sideways', await noScroll(page));
  await ctx.close();
  const b = await open({ seed: { lang: 'hi', intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(3)) } }, lang: 'hi', w: 360, now: at(0, '20:30') });   /* plan day 4 (Version 39.43) */
  await go(b.page, 'plan-checkin');
  for (const g of await b.page.$$eval('[data-ci]', (x) => [...new Set(x.map((y) => y.dataset.ci.split(':')[0]))])) await tap(b.page, '[data-ci="' + g + ':p"]');
  await tap(b.page, '[data-ci-b="time"]'); await tap(b.page, '#pl-ci-save');
  check('8 Hindi: one count', /आज 0 हो गए, 4 थोड़े · इस हफ़्ते 7 में से 1 दिन/.test(await view(b.page)), (await view(b.page)).slice(0, 300));
  check('8 360 px: the check-in doesn\'t scroll sideways', await noScroll(b.page));
  check('8 no page errors (Hindi)', errs.length === 0 && b.errs.length === 0, errs.concat(b.errs));
  await b.ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
