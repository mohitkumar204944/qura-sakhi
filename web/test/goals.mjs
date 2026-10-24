// Version 38: a plan that fits every goal (docs/ux-gaps-2026-10-24.md, themes 1.5, 1.6 and 1.8; MODULE_API section 42). Mohit,
// 24 Oct: "Plan to do all three properly". This file checks:
//   1 one pregnancy plan: what is due now is its first step (no second "Due now" row), her own weeks of pregnancy, her
//     trimesters as the path, and no 21-day journey row while a plan runs;
//   2 after a birth: the daily recovery check for every goal until day 42, done only by doing the check; the after-birth card
//     steps aside for it; gone after day 42;
//   3 trying for a baby: its own plan, the before-pregnancy checklist once a week (a link, no dose), checklist progress in
//     its results, and it ends with a pregnancy;
//   4 heavy periods: the iron steps follow what she eats, then one iron food a day after day 21;
//   5 from 40: Today follows her own timeline (no cycle ring), and results come from her weekly diary;
//   6 the calm week before her period on the PMS plan;
//   7 one name for each thing: "This month", no "Other plans" while a plan runs, the self-check opens with her answers;
//   8 For you leads with her goal's tools;
//   9 discreet mode, Hindi, a 360 px screen, and no page errors;
//  10 to 12 the review's fixes and the two checks after it (MODULE_API section 42.1).
// Usage: node test/goals.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'goals'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.37-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = { situation: { pregnant: true, pregnantSince: ago(60) }, events: [] };
const POST = (n) => ({ situation: { deliveredOn: ago(n), breastfeeding: true }, events: [] });
const REC = { danger: ['none'], bleed: 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', sleep: 'some' };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
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
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const count = (s, re) => (String(s).match(re) || []).length;

/* ---------- 1. One pregnancy plan ---------- */
{
  const { ctx, page, errs } = await open({ seed: Object.assign({}, PREG, { mods: { plan: planOf('preg', 'food', ago(5)), journey: { active: 'iron', start: ago(2), done: {}, finished: {} } } }) });
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('1 pregnancy: her plan names her own week, not "of 12"', /My pregnancy plan/i.test(td) && /Week 8 of pregnancy/.test(td) && !/of 12/.test(td), td);
  check('1 pregnancy: "Due now" is her plan\'s first step, once', count(td, /Due now/g) === 1 && !(await has(page, '#view .today-preg-plan')) && /Due now: Register your pregnancy/.test(td), td);
  check('1 the due step opens her pregnancy plan, with no Done of its own', (await page.$eval('#view .today-plan-pdue .today-go', (b) => b.dataset.go).catch(() => '')) === 'preg-plan' && !(await has(page, '#view .today-plan-pdue [data-today-act]')));
  check('1 a running plan leaves no 21-day journey row on Today', !(await has(page, '#view .today-journey')));
  await go(page, 'plan');
  const v = await view(page);
  check('1 My plan: her trimesters are the path, with no 12 weeks', /Your pregnancy/.test(v) && /Weeks 1 to 13/.test(v) && /Weeks 28 to 40/.test(v) && !/Your 12 weeks|of 12/.test(v), v.slice(0, 900));
  await shot(page, '1-preg-my-plan');
  await go(page, 'plan-checkin');
  check('1 the check-in asks about what is due', (await has(page, '[data-ci="pdue:d"]')));
  check('1 no page errors', errs.length === 0, errs);
  await ctx.close();
  const b = await open({ seed: Object.assign({}, PREG, { mods: { journey: { active: 'iron', start: ago(2), done: {}, finished: {} } } }) });
  await go(b.page, 'home');
  check('1 without a plan, the journey row and the pregnancy plan\'s own "Due now" row are back', (await has(b.page, '#view .today-journey')) && (await has(b.page, '#view .today-preg-plan')));
  await b.ctx.close();
}

/* ---------- 2. After a birth: the recovery check, for every goal, until day 42 ---------- */
for (const goal of ['feed', 'weight', 'recovery']) {
  const { ctx, page, errs } = await open({ seed: Object.assign({}, POST(14), { mods: { plan: planOf('post', goal, ago(3)) } }), now: at(0, '20:30') });
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('2 ' + goal + ': the daily recovery check comes first, with its warning signs', /Week 3 after the birth/.test(td) && /Daily recovery check/.test(td) && /1 minute, with the warning signs/.test(td) && count(td, /Daily recovery check/g) === 1, td);
  check('2 ' + goal + ': no Done for it on Today (it is done by doing the check)', !(await has(page, '#view .today-plan-rcheck [data-today-act]')));
  check('2 ' + goal + ': the after-birth card steps aside for it', !/after birth: how are you today/i.test(await view(page)));
  await go(page, 'plan-checkin');
  check('2 ' + goal + ': the check-in opens the check, with no Done chip for it', (await has(page, '#view .pl-ci [data-go="post-recovery"]')) && !(await has(page, '[data-ci^="rcheck:"]')));
  await page.evaluate((r) => { const S = window.Saathi; S.state.mods.post = S.state.mods.post || {}; S.state.mods.post.rec = Object.assign({}, S.state.mods.post.rec || {}, { [S.toISO(S.today())]: r }); S.save(); }, REC);
  await go(page, 'plan-checkin');
  check('2 ' + goal + ': once she has done the check, it says so', /Done today/.test(await view(page)));
  check('2 ' + goal + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page } = await open({ seed: Object.assign({}, POST(50), { mods: { plan: planOf('post', 'feed', ago(3)) } }) });
  await go(page, 'home');
  check('2 after day 42 the daily check leaves her plan', !/Daily recovery check/.test(await txt(page, '#view .today-card')), await txt(page, '#view .today-card'));
  await ctx.close();
}

/* ---------- 3. Trying for a baby ---------- */
{
  const { ctx, page, errs } = await open({ seed: { situation: { planning: true }, goals: ['ttc', 'ready'] } });
  await page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'ttc', goal: 'ready', act: 0, food: 'veg', bed: 'b23', work: 'day', when: 'evening' }); S.save(); });
  await go(page, 'plan-reveal');
  let w = ''; for (let i = 0; i < 8; i++) { w += '\n' + (await view(page)); if (await has(page, '#pl-rv-go')) break; await tap(page, '#pl-rv-next'); }
  check('3 trying for a baby: its own plan and steps, with the checklist', /Getting ready for a baby/.test(w) && /Your before-pregnancy checklist, once a week/.test(w) && /Eating well before a pregnancy helps your body get ready/.test(w), w.slice(0, 900));
  check('3 ... its own expectation, and no promise about periods or waist', /more than 8 in 10 couples get pregnant within a year/.test(w) && !/Periods often take|waist|regular periods/i.test(w));
  check('3 no doses anywhere in the plan', !/\d+\s?(mg|mcg|µg)\b|tablet/i.test(w));
  await tap(page, '#pl-rv-go'); await settle(page, 800);
  check('3 it is its own pack', (await page.evaluate(() => window.Saathi.plan.packOf())) === 'ttc');
  await go(page, 'home');
  let td = await txt(page, '#view .today-card');
  check('3 day 1: the checklist step, as a link (no Done)', /Your before-pregnancy checklist: tick what you’ve done/.test(td) && !(await has(page, '#view .today-plan-prep [data-today-act]')) && (await page.$eval('#view .today-plan-prep .today-go', (b) => b.dataset.go).catch(() => '')) === 'ttc-prep', td);
  await page.clock.setSystemTime(at(1, '10:00')); await go(page, 'diary'); await go(page, 'home');
  check('3 day 2: once a week only', !/before-pregnancy checklist/.test(await txt(page, '#view .today-card')));
  await page.evaluate(() => { const S = window.Saathi; S.state.mods.ttc = Object.assign({}, S.state.mods.ttc || {}, { prep: { folic: true, hb: true } }); S.save(); });
  await go(page, 'plan');
  check('3 results: her checklist progress', /Before-pregnancy checklist/.test(await view(page)) && /2 of 17 done/.test(await view(page)), (await view(page)).match(/Before-pregnancy.{0,80}/s));
  await page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregnant: true, pregnantSince: x }; S.save(); }, ago(30));
  await go(page, 'plan');
  check('3 a pregnancy ends it (no pause): My plan offers the pregnancy goals', !(await page.evaluate(() => window.Saathi.plan.packOf())) && /What do you want to work on\?/.test(await view(page)) && (await has(page, '[data-pl-pick="nausea"]')), (await view(page)).slice(0, 400));
  check('3 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 4. Heavy periods: iron that fits her food, then a daily habit ---------- */
for (const [food, re] of [['veg', /Poha with lemon/], ['egg', /Eggs today/], ['nonveg', /Eggs, fish or meat/]]) {
  const { ctx, page, errs } = await open({ seed: { mods: { plan: planOf('heavy', 'heavy', ago(8), { food: food }) } } });
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('4 day 9, ' + food + ': the iron step fits what she eats', re.test(td) && (food === 'nonveg' || !/fish or meat/.test(td)), td);
  check('4 ' + food + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page } = await open({ seed: { mods: { plan: planOf('heavy', 'heavy', ago(24), { food: 'veg' }) } } });
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('4 after day 21: one iron food a day, from her own food, not day 1 again', /An iron-rich food today/.test(td) && /chana, rajma, ragi or poha/.test(td) && !/Your iron tablet/.test(td), td);
  await ctx.close();
}

/* ---------- 5. From 40 ---------- */
{
  const monday = (n) => { const d = new Date('2026-10-26T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 7 * n); return d.toISOString().slice(0, 10); };
  const dia = {}; [7, 6, 5, 4, 3].forEach((n) => { dia[monday(n)] = { v: { hot: 2, sleep: 1 } }; }); [2, 1, 0].forEach((n) => { dia[monday(n)] = { v: { hot: 0, sleep: 1 } }; });
  const ev = [{ d: ago(110), t: 'start' }, { d: ago(105), t: 'end' }, { d: ago(50), t: 'start' }, { d: ago(45), t: 'end' }];
  const { ctx, page, errs } = await open({ seed: { situation: { midlife: true }, dob: '1978-03-01', events: ev, mods: { meno: { diary: dia }, plan: planOf('meno', 'hot', ago(20)) } } });
  await go(page, 'home');
  const v = await view(page);
  check('5 from 40: Today shows days since her last period, not a cycle ring', /Since your last period/i.test(v) && /50\s+days/.test(v) && !(await has(page, '#view .ringwrap')) && !/Cycle day|Typical gap/.test(v), v.slice(0, 600));
  check('5 ... with her weekly symptom diary one tap away', (await has(page, '#view .hero [data-go="meno-diary"]')) && /This week’s diary: done/.test(v));
  await go(page, 'plan');
  const pv = await view(page);
  check('5 results from her weekly diary: hot flushes before and since', /Weeks with hot flushes/.test(pv) && /4 weeks before you started\s+4 of 4 weeks/.test(pv) && /Last 4 weeks\s+1 of 4 weeks/.test(pv), pv.match(/Weeks with hot flushes.{0,160}/s));
  check('5 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 6. The calm week before her period ---------- */
{
  const { ctx, page, errs } = await open({ seed: { events: regular(23), mods: { plan: planOf('pms', 'pms', ago(10)) } } });
  await go(page, 'home');
  check('6 PMS: in the days before her likely period, her calm week', /Your calm week: the days before your period/.test(await txt(page, '#view .today-card')), await txt(page, '#view .today-card'));
  await ctx.close();
  const b = await open({ seed: { events: regular(5), mods: { plan: planOf('pms', 'pms', ago(10)) } } });
  await go(b.page, 'home');
  check('6 ... and not at other times', !/Your calm week/.test(await txt(b.page, '#view .today-card')));
  check('6 no page errors', errs.length === 0 && b.errs.length === 0, errs.concat(b.errs));
  await b.ctx.close();
}

/* ---------- 7. One name for each thing ---------- */
{
  const ik = { at: ago(30), stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'] };
  const { ctx, page, errs } = await open({ seed: { intake: ik, mods: { plan: planOf('cycle', 'irregular', ago(20), { intake: ik }) } } });
  await go(page, 'home');
  check('7 the monthly check-in is "This month"', /This month/.test(await txt(page, '#view [data-go="checkin"]')) && !/Check-in$/m.test(await txt(page, '#view [data-go="checkin"]')), await txt(page, '#view [data-go="checkin"]'));
  await go(page, 'checkin');
  check('7 ... and so is its page', /This month: October/.test(await view(page)));
  await go(page, 'plan');
  check('7 while a plan runs, no "Other plans" (Change what I work on stays)', !/Other plans/.test(await view(page)) && (await has(page, '#pl-chg')));
  await go(page, 'selfcheck-pmos');
  const on = (k, v) => page.$eval('[data-sc="' + k + '"][data-v="' + v + '"]', (b) => b.getAttribute('aria-pressed') === 'true').catch(() => false);
  check('7 the PMOS self-check opens with what she told Sakhi', (await on('gaps', 'y')) && !(await on('few', 'y')) && !(await on('few', 'n')) && (await on('acne', 'y')) && (await on('hair', 'n')) && /Some answers come from what you told Sakhi for your plan/.test(await view(page)));
  check('7 ... and still waits for the answers only she can give before any verdict', !(await has(page, '#sc-verdict')));
  check('7 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 8. For you leads with her goal ---------- */
for (const [pack, goal, first] of [['pain', 'pain', 'periods-pain'], ['heavy', 'heavy', 'iron'], ['cycle', 'irregular', 'selfcheck']]) {
  const { ctx, page, errs } = await open({ seed: { goals: ['track', goal], mods: { plan: planOf(pack, goal, ago(5)) } }, hash: '#care' });
  const fy = await page.$$eval('#view section.care-sec:first-of-type [data-go]', (b) => b.map((x) => x.dataset.go));
  check('8 ' + goal + ': For you starts with her goal\'s tools', fy[0] === first, fy);
  check('8 ' + goal + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 9. A shared phone, Hindi, a small screen ---------- */
{
  const { ctx, page, errs } = await open({ seed: Object.assign({}, PREG, { settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('preg', 'food', ago(5)) } }) });
  await go(page, 'home');
  const td = await txt(page, '#view .today-card');
  check('9 discreet: the pregnancy plan\'s due step says only "Your plan for today"', /Your plan for today/.test(td) && !/Register|pregnan/i.test(td), td);
  check('9 discreet: her plan\'s line has no pregnancy words', /My plan/i.test(td) && !/of pregnancy/.test(td), td);
  await ctx.close();
  const b = await open({ seed: Object.assign({}, POST(14), { settings: { discreet: true, toursAuto: false, notify: true }, mods: { plan: planOf('post', 'feed', ago(3)) } }) });
  await go(b.page, 'home');
  check('9 discreet: the recovery check is in plain words', !/recovery|birth|warning/i.test(await txt(b.page, '#view .today-card')), await txt(b.page, '#view .today-card'));
  await b.ctx.close();
  const c = await open({ seed: Object.assign({}, PREG, { lang: 'hi', mods: { plan: planOf('preg', 'food', ago(5)) } }), lang: 'hi', w: 360 });
  await go(c.page, 'home');
  check('9 Hindi: her own week of pregnancy and "Due now"', /गर्भ का हफ़्ता 8/.test(await txt(c.page, '#view .today-card')) && /अभी: /.test(await txt(c.page, '#view .today-card')), await txt(c.page, '#view .today-card'));
  check('9 360 px: Today doesn\'t scroll sideways', await noScroll(c.page));
  await go(c.page, 'plan');
  check('9 Hindi: the trimester path', /आपकी प्रेग्नेंसी/.test(await view(c.page)) && /हफ़्ता 1 से 13/.test(await view(c.page)));
  check('9 360 px: My plan doesn\'t scroll sideways', await noScroll(c.page));
  const d = await open({ seed: { situation: { midlife: true }, dob: '1978-03-01', lang: 'hi', events: [{ d: ago(80), t: 'start' }, { d: ago(75), t: 'end' }] }, lang: 'hi', w: 360 });
  await go(d.page, 'home');
  check('9 Hindi: the midlife Today', /पिछले पीरियड से/.test(await view(d.page)) && /महीने/.test(await view(d.page)), (await view(d.page)).slice(0, 300));
  check('9 no page errors (shared phone, Hindi)', errs.length === 0 && b.errs.length === 0 && c.errs.length === 0 && d.errs.length === 0, errs.concat(b.errs, c.errs, d.errs));
  await c.ctx.close(); await d.ctx.close();
}

/* ---------- 10. The 24 Oct review's fixes (web/MODULE_API.md, section 42.1) ---------- */
{
  const rem = [{ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(30), every: 1, time: '20:00', on: true }];
  const a = await open({ seed: Object.assign({}, PREG, { reminders: rem.slice(), mods: { plan: planOf('preg', 'food', ago(30)) } }) });
  await a.page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregEndedOn: x }; S.save(); }, ago(1)); await go(a.page, 'home');
  check('10 a pregnancy that ended takes its plan\'s evening reminder with it', !((await st(a.page)).reminders || []).some((r) => r.id === 'plan'));
  await a.ctx.close();
  const b = await open({ seed: { situation: { planning: true }, reminders: rem.slice(), mods: { plan: planOf('ttc', 'ready', ago(30)) } } });
  await b.page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregnant: true, pregnantSince: x }; S.save(); }, ago(40)); await go(b.page, 'home');
  check('10 getting pregnant ends the trying plan\'s reminder too', !((await st(b.page)).reminders || []).some((r) => r.id === 'plan'));
  await b.ctx.close();
  const log = {}; for (let i = 1; i <= 27; i++) log[ago(i)] = { ci: 1, ck: { pdue: 'd' } };
  const c = await open({ seed: Object.assign({}, PREG, { situation: { pregnant: true, pregnantSince: ago(150) }, mods: { plan: planOf('preg', 'food', ago(140), { log: log }) } }) });
  const sum = await c.page.evaluate(() => (window.Saathi.summaries().find((m) => m.mod === 'plan') || { sections: [] }).sections.map((x) => x.lines.join(' | ')).join(' || '));
  check('10 a pregnancy plan past 12 weeks counts its recent weeks (doctor summary)', /about (6\.[5-9]|7) days a week/.test(sum), sum);
  await c.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); }); await go(c.page, 'plan');
  const cv = await view(c.page);
  check('10 discreet: a pregnancy plan says its own week in plain words, never "Week 12 of 12", and no trimesters', /Week 20/.test(cv) && !/of 12|pregnan|trimester|Weeks 1 to 13/i.test(cv), cv.slice(0, 500));
  await c.ctx.close();
  const d = await open({ seed: { checkins: { [TODAY.slice(0, 7)]: { at: ago(2), kind: 'cycle', chips: ['mood'] } }, mods: { contra: { method: 'implant', until: ago(10) }, plan: planOf('cycle', 'irregular', ago(9)) } } });
  await go(d.page, 'home');
  check('10 an expired implant\'s warning stays on Today next to her plan and an explain card', /may no longer protect you/i.test(await d.page.$eval('#view', (e) => e.textContent)), (await view(d.page)).slice(0, 900));
  await d.ctx.close();
  const e = await open({ seed: Object.assign({}, PREG, { settings: { discreet: true, toursAuto: false, notify: true } }) });
  await e.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'preg', goal: 'food', bed: 'b23', work: 'home' }); S.save(); }); await go(e.page, 'plan-reveal');
  let w = ''; for (let i = 0; i < 8; i++) { w += '\n' + (await view(e.page)); if (await has(e.page, '#pl-rv-go')) break; await tap(e.page, '#pl-rv-next'); }
  check('10 discreet: a pregnancy plan\'s cards have no pregnancy words', !/baby|danger|pregnan/i.test(w), w.match(/.{0,50}(baby|danger|pregnan).{0,30}/i));
  await e.ctx.close();
  const f = await open({ seed: null });
  for (const x of ['[data-ob-lang="en"]', '#w-start', '[data-ob-dec="1970"]', '[data-ob-y="1975"]', '[data-ob-st="meno"]', '[data-ob-lp="stop"]']) await tap(f.page, x);
  check('10 periods stopped: no "Heavy periods" plan to pick (bleeding then needs a doctor)', !(await has(f.page, '[data-pl-goal="heavy"]')) && (await has(f.page, '[data-pl-goal="hot"]')));
  await f.ctx.close();
  const g = await open({ seed: Object.assign({}, PREG, { goals: ['ttc', 'ready'] }), hash: '#care' });
  const fy = await g.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go));
  check('10 For you: a goal from another stage doesn\'t lead once she is pregnant', fy[0] === 'preg-plan', fy);
  await g.ctx.close();
  const h = await open({ seed: Object.assign({}, PREG, { situation: { pregnant: true, pregnantSince: ago(60), pcos: true }, mods: { plan: planOf('cycle', 'pmos', ago(80)) } }) });
  await go(h.page, 'plan');
  check('10 a plan paused by pregnancy: My plan says why and offers the pregnancy goals', /paused while you are pregnant/.test(await view(h.page)) && (await has(h.page, '[data-pl-pick="nausea"]')), (await view(h.page)).slice(0, 400));
  await h.ctx.close();
  const k = await open({ seed: { events: [{ d: ago(40), t: 'start' }, { d: ago(35), t: 'end' }], mods: { plan: planOf('cycle', 'irregular', ago(10)) } } });
  await go(k.page, 'home'); await k.page.$eval('[data-log="start"]', (x) => x.click()); await settle(k.page, 600);
  check('10 her period is noticed the moment she logs it', /Your period came after 40 days/.test(await txt(k.page, '#view .today-card')), await txt(k.page, '#view .today-card'));
  await k.page.evaluate(() => { const S = window.Saathi; S.state.events = S.state.events.filter((x) => x.d !== S.toISO(S.today())); S.save(); }); await go(k.page, 'home');
  check('10 ... and the line goes when she takes the period back', !/Your period came after/.test(await txt(k.page, '#view .today-card')));
  await k.ctx.close();
  const m = await open({ seed: { mods: { plan: planOf('pain', 'pain', ago(90), { goal: 'pain' }) } }, hash: '#plan-checkin' });
  check('10 after 12 weeks the check-in opens the end page', /Your 12 weeks are done/.test(await view(m.page)) && !(await has(m.page, '#pl-ci-save')));
  await m.ctx.close();
}

/* ---------- 11. The re-check's fixes (web/MODULE_API.md, section 42.1, second round) ---------- */
{
  const rem = (x) => [Object.assign({ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(30), every: 1, time: '20:00', on: true }, x || {})];
  const yd = ago(1);
  /* a plan paused by a birth is paused on My plan: no running ring card, no minutes target */
  const a = await open({ seed: Object.assign({}, POST(20), { mods: { plan: planOf('pain', 'pain', ago(30), { goal: 'pain' }) } }), hash: '#plan' });
  const av = await view(a.page);
  check('11 a plan paused by a birth shows no running plan card or minutes target', !(await has(a.page, '#view .pl-now')) && !/of \d+ minutes|My PMOS plan\s*\n\s*Week/.test(av) && /6-week check/.test(av), av.slice(0, 600));
  await a.ctx.close();
  /* a waiting plan that would be paused isn't offered in a pregnancy */
  const nx = { pack: 'pain', goalKey: 'pain', goal: 'pain', focus: 'habits', level: 0, limits: {}, food: 'veg', bed: 'b23', work: 'day', when: 'evening', remAt: '20:00', body: null, intake: { goal: 'pain' }, at: ago(1) };
  const b = await open({ seed: Object.assign({}, PREG, { mods: { plan: planOf('cycle', 'irregular', ago(40), { next: nx }) } }), hash: '#plan' });
  const bv = await view(b.page);
  check('11 pregnant: a plan made before is not "ready"; My plan says why it waits', /paused while you are pregnant/.test(bv) && !/Your plan is ready/.test(bv) && !(await b.page.evaluate(() => window.Saathi.plan.pending())), bv.slice(0, 400));
  await b.ctx.close();
  /* "Yesterday" counts what Today counted that day */
  const c = await open({ seed: { mods: { plan: planOf('pms', 'pms', ago(4), { log: { [yd]: { r: ['calm'], min: 5 } } }) } } });
  check('11 Yesterday: a 5-minute calm breath is one step on the PMS plan, not two', /Yesterday: 1 done\./.test(await txt(c.page, '#view .today-card')), await txt(c.page, '#view .today-card'));
  await c.ctx.close();
  const c2 = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(4), { log: { [yd]: { r: ['calm'], min: 5 } } }) } } });
  check('11 Yesterday: a routine that isn\'t one of her steps, and minutes short of the walk, count nothing', /No steps yesterday/.test(await txt(c2.page, '#view .today-card')), await txt(c2.page, '#view .today-card'));
  await c2.ctx.close();
  const c3 = await open({ seed: Object.assign({}, POST(60), { mods: { post: { rec: { [yd]: REC } }, plan: planOf('post', 'feed', ago(10)) } }) });
  check('11 Yesterday: after 6 weeks the recovery check is no longer a step to count', /No steps yesterday/.test(await txt(c3.page, '#view .today-card')), await txt(c3.page, '#view .today-card'));
  await c3.ctx.close();
  const c4 = await open({ seed: Object.assign({}, POST(20), { mods: { post: { rec: { [yd]: REC } }, plan: planOf('post', 'feed', ago(10)) } }) });
  check('11 Yesterday: before 6 weeks her recovery check counts', /Yesterday: 1 done\./.test(await txt(c4.page, '#view .today-card')), await txt(c4.page, '#view .today-card'));
  await c4.ctx.close();
  /* a reminder Sakhi took away for a pregnancy comes back when the plan applies again */
  const e = await open({ seed: { situation: { planning: true }, reminders: rem(), mods: { plan: planOf('ttc', 'ready', ago(20)) } } });
  await e.page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregnant: true, pregnantSince: x }; S.save(); }, ago(40)); await go(e.page, 'home');
  const e1 = ((await st(e.page)).reminders || []).some((r) => r.id === 'plan');
  await e.page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregEndedOn: x, planning: true }; S.save(); }, ago(0)); await go(e.page, 'home');
  const e2 = ((await st(e.page)).reminders || []).find((r) => r.id === 'plan');
  check('11 the trying plan\'s reminder goes with a pregnancy and comes back with the plan', !e1 && !!e2 && e2.on !== false && /8 pm|8:00 pm|20:00/i.test(await txt(e.page, '#view .today-card')) && !((await st(e.page)).mods.plan.remGone), { e1, e2 });
  await e.ctx.close();
  const e3 = await open({ seed: { reminders: [], mods: { plan: planOf('cycle', 'irregular', ago(20)) } } });
  await go(e3.page, 'home');
  check('11 a reminder she turned off herself stays off', !((await st(e3.page)).reminders || []).some((r) => r.id === 'plan'));
  await e3.ctx.close();
  /* a pregnancy plan's reminder ends two weeks after the due date she has now */
  const f = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(60), scanEdd: iso(TODAY, 240) }, events: [], reminders: rem({ until: iso(TODAY, 200) }), mods: { plan: planOf('preg', 'food', ago(5)) } } });
  await go(f.page, 'home');
  check('11 a scan date that moves her due date moves the reminder\'s end', (((await st(f.page)).reminders || []).find((r) => r.id === 'plan') || {}).until === iso(TODAY, 254), ((await st(f.page)).reminders || []).find((r) => r.id === 'plan'));
  await f.ctx.close();
  /* midlife: "Last 4 weeks" is at most 4 weeks */
  const dia = {}; for (let n = 0; n < 9; n++) dia[iso('2026-10-26', -7 * n)] = { v: { hot: 2 } };
  const g = await open({ seed: { situation: { midlife: true }, dob: '1978-03-01', events: [{ d: ago(110), t: 'start' }, { d: ago(105), t: 'end' }, { d: ago(50), t: 'start' }, { d: ago(45), t: 'end' }], mods: { meno: { diary: dia }, plan: planOf('meno', 'hot', ago(42)) } }, hash: '#plan' });
  const gv = await view(g.page);
  check('11 midlife results: "Last 4 weeks" counts 4 weeks, never 5', /Last 4 weeks\s*\n?\s*4 of 4 weeks/.test(gv) && !/of 5 weeks/.test(gv), (gv.match(/Weeks with[\s\S]{0,160}/) || [gv.slice(0, 300)])[0]);
  await g.ctx.close();
  /* the doctor summary: a finished plan averages weeks 9 to 12; "Keep going" isn't "Week 12 of 12" */
  const lg = {}; for (let i = 77; i < 84; i++) lg[iso(ago(90), i)] = { min: 30 };
  const h = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(90), { log: lg }) } } });
  const hs = await h.page.evaluate(() => (window.Saathi.summaries().find((m) => m.mod === 'plan') || { sections: [] }).sections.map((x) => x.lines.join(' | ')).join(' || '));
  check('11 doctor summary: a finished plan counts its week 12', /Active minutes: about 53 a week over the last 4 weeks/.test(hs), hs);
  await h.ctx.close();
  const k = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(95), { keep: true }) } }, hash: '#plan' });
  const ks = await k.page.evaluate(() => (window.Saathi.summaries().find((m) => m.mod === 'plan') || { sections: [] }).sections.map((x) => x.lines.join(' | ')).join(' || '));
  const kp = await txt(k.page, '#view .pl-path');
  check('11 "Keep going": the summary says her plan week, and the path card follows her weeks past 12', /Plan week 14/.test(ks) && !/of 12/.test(ks) && /Keeping it going/.test(kp) && /Week 14/.test(kp) && !/Week 12 of 12/.test(kp), { ks, kp });
  await k.ctx.close();
  /* pain results: two starts logged in one period are one period */
  const m = await open({ seed: { events: [{ d: ago(60), t: 'start', pain: 'pain_1' }, { d: ago(55), t: 'end' }, { d: ago(24), t: 'start', pain: 'pain_2' }, { d: ago(21), t: 'start', pain: 'pain_2' }, { d: ago(18), t: 'end' }], mods: { plan: planOf('pain', 'pain', ago(30), { goal: 'pain' }) } }, hash: '#plan' });
  const mv = await view(m.page);
  check('11 pain results: two starts logged 3 days apart are one period', /needed a painkiller[\s\S]{0,120}1 of 1/.test(mv) && !/2 of 2/.test(mv), (mv.match(/needed a painkiller[\s\S]{0,160}/) || [mv.slice(0, 300)])[0]);
  await m.ctx.close();
  /* For you: an after-birth plan keeps its own tools once her periods come back */
  const n = await open({ seed: { situation: { deliveredOn: ago(120), breastfeeding: false }, events: [{ d: ago(20), t: 'start' }, { d: ago(15), t: 'end' }], mods: { plan: planOf('post', 'weight', ago(30)) } }, hash: '#care' });
  const nf = await n.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go));
  check('11 For you: an after-birth plan for weight leads with the after-birth tools, not the PMOS plan', nf[0] === 'post-pelvic' && nf.indexOf('plan-pmos') !== 0, nf);
  await n.ctx.close();
}

/* ---------- 12. The third check's fixes (web/MODULE_API.md, section 42.1, third round) ---------- */
{
  const rem = (x) => [Object.assign({ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(30), every: 1, time: '20:00', on: true }, x || {})];
  const pregThenLoss = async (page) => {
    await page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregnant: true, pregnantSince: x }; S.save(); }, ago(40)); await go(page, 'home');
    await page.evaluate((x) => { const S = window.Saathi; S.state.situation = { pregEndedOn: x, planning: true }; S.save(); }, ago(0)); await go(page, 'home');
    return ((await st(page)).reminders || []).find((r) => r.id === 'plan') || null;
  };
  const a = await open({ seed: { situation: { planning: true }, reminders: rem({ on: false }), mods: { plan: planOf('ttc', 'ready', ago(20)) } } });
  const ar = await pregThenLoss(a.page);
  check('12 a plan reminder she switched off in Reminders stays off after a pregnancy ends', !ar || ar.on === false, ar);
  await a.ctx.close();
  const b = await open({ seed: { situation: { planning: true }, reminders: rem({ time: '21:30' }), mods: { plan: planOf('ttc', 'ready', ago(20)) } } });
  const br = await pregThenLoss(b.page);
  check('12 ... and one that comes back keeps the time she set in Reminders', !!br && br.on !== false && br.time === '21:30' && /9:30 pm/i.test(await txt(b.page, '#view .today-card')), { br, td: await txt(b.page, '#view .today-card') });
  await b.ctx.close();
  const c = await open({ seed: { situation: { deliveredOn: ago(25), breastfeeding: false }, events: [{ d: ago(4), t: 'start' }], mods: {} }, hash: '#plan' });
  check('12 in the first 6 weeks after a birth, My plan offers the after-birth goals even with a period logged', (await has(c.page, '[data-pl-pick="pelvic"]')) && !(await has(c.page, '[data-pl-pick="pain"]')), (await view(c.page)).slice(0, 500));
  await c.ctx.close();
  const nx = { pack: 'pain', goalKey: 'pain', goal: 'pain', focus: 'habits', level: 0, limits: {}, food: 'veg', bed: 'b23', work: 'day', when: 'evening', remAt: '20:00', body: null, intake: { goal: 'pain' }, at: ago(30) };
  const c2 = await open({ seed: { situation: { deliveredOn: ago(25) }, events: [], mods: { plan: { next: nx, log: {}, weeks: {}, body: [] } } }, hash: '#plan' });
  check('12 a waiting plan paused by a birth says why on My plan', /6-week check/.test(await view(c2.page)) && !/Your plan is ready/.test(await view(c2.page)), (await view(c2.page)).slice(0, 400));
  await c2.ctx.close();
  const d = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(14), { log: { [ago(1)]: { min: 10, plate: { half: true } } } }) } } });
  check('12 Yesterday on the first day of a new week counts yesterday\'s walk and food habit', /Yesterday: 2 done\./.test(await txt(d.page, '#view .today-card')), await txt(d.page, '#view .today-card'));
  await d.ctx.close();
  const pd = { done: Object.fromEntries(['reg', 'folic', 'anc1', 'td', 'scheme'].map((k) => [k, true])), pmsma: [] };   /* week 9: everything due is done */
  const d2 = await open({ seed: Object.assign({}, PREG, { mods: { preg: { plan: pd }, plan: planOf('preg', 'food', ago(30), { log: { [ago(1)]: { ci: 1, ck: { pdue: 'd', food: 'd' } } } }) } }) });
  const due2 = await d2.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('12 Yesterday keeps a pregnancy plan\'s "Due now" tick when nothing is due today', due2.length === 0 && /Yesterday: 2 done\./.test(await txt(d2.page, '#view .today-card')), { td: await txt(d2.page, '#view .today-card'), due2 });
  await d2.ctx.close();
  const e = await open({ seed: { situation: { deliveredOn: ago(60), breastfeeding: true }, events: [], mods: { plan: planOf('cycle', 'weight', ago(200), { keep: true }) } }, hash: '#care' });
  const ef = await e.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go));
  check('12 For you: a kept cycle plan after a birth still leads with the after-birth tools', ef[0] === 'post-pelvic', ef);
  await e.ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
