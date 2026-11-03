// Version 39.32: Getting ready for a baby, the full plan (Mohit, 28 Oct: "Build this plan personalised to users who are planning
// for a baby"; mockup claude.ai/artifact/LYTf9jYeCMPfWw5ZYjMY4r; review packet docs/baby-plan-review-packet-2026-10-28.md;
// MODULE_API section 75). The trying stage's goals open Getting ready version 2. This file checks:
//   1 starting: every trying-stage goal opens it; "A few things first" (4 medicine lines and the verified list, ticked from
//     Months of trying and her goal), how long she has tried (not asked when Months of trying has a date), the summary;
//   2 her version: medicines first, see a gynaecologist first, both, standard; age 40, 35 to 39 at 6 months, a year of
//     trying, Months of trying's own date; her food and moves (mix for PMOS or a healthier weight);
//   3 day 1: 3 steps (her tablet, her move, one food habit), her version's doctor card in Sakhi says from day 1 (the
//     government route's own words for a woman who picked it), "Remind me to book it", a birth under 2 years ago, the lesson row;
//   4 her tablet: the page's verified lines, "I have my tablet" and the 9 pm reminder (a tablet's, on by default), a tick,
//     "Not yet", the switch, "My tablet" on a shared phone, the reminder after a loss and in a pregnancy that follows;
//   5 her weeks: the Hb test from day 2 until she ticks it, the ready check from day 3, the checklist, his part (never on a
//     shared phone), strength from week 7 (Gentle start within 6 months of a birth), PMOS's yoga, the calm few minutes;
//   6 food: the three sets in their order, each habit's reason and meal, the PMOS plan's own habits kept for version 1;
//   7 moves: the 2 weeks before her period (Tadasana for the cobra, sitting quietly for the twist, no sun salutation), the
//     Moves page's lines, never on her period days or on another plan;
//   8 lessons: week 1's verified lines and Call 112, Done, the monthly lessons after week 12, the PIN on a shared phone, the
//     calm switch in week 8;
//   9 the ready check: her folic answer from her ticks, the tobacco line, then and now, a shared phone;
//  10 moments: a fresh start when her period comes, a positive test (Yes, move me on; Not now), a loss (J5), her 12 weeks;
//  11 every verified line word for word: the pages they come from, and plan.js's copies;
//  12 Hindi at 360 px; 13 version 1 runs on for a woman on it; 14 no page errors.
// Usage: node test/baby.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'baby'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';   /* a Wednesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.32-pilot', platform: 'android' };
/* three periods 28 days apart, the last `last` days ago, 5 days each */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { planning: true }, events: regular(10), daily: {}, notes: {}, checkins: {}, goals: ['ready'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'ready', stage: 'ttc' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* her saved answers, and a running Getting ready plan that started `startAgo` days ago (0: today, her day 1) */
const IK = (o) => Object.assign({ at: ago(1), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' }, o || {});
const baby = (startAgo, o) => Object.assign({ pack: 'ttc', goalKey: 'ready', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], intake: IK() }, o || {});
const withPlan = (startAgo, o, seed) => Object.assign({ mods: { plan: baby(startAgo, o) } }, seed || {}, { intake: (o && o.intake) || IK() });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
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
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub, state: x.state, r: x.r || null, habit: x.habit || null, why: x.why || null })));
const ids = async (a) => (await acts(a)).map((x) => x.id);
/* My plan's "Your 12 weeks" (Version 39.32: one card, Getting ready's 4 parts): how many cards say it, its parts, the one marked,
   this week and next, her doctor month, and whether an old baby card is left */
const y12 = (a) => a.page.evaluate(() => { const c = document.querySelector('#view .pl-bpath, #view .pl-weeks'); const li = c ? Array.from(c.querySelectorAll(':scope > .pl-steps li')) : [];
  return { n: Array.from(document.querySelectorAll('#view h3')).filter((h) => h.textContent.trim() === 'Your 12 weeks').length, li: li.length, now: li.findIndex((x) => x.classList.contains('now')), kv: ((c && c.querySelector('.pl-kv')) || {}).textContent || '', dm: ((c && c.querySelector('.pl-bdm')) || {}).textContent || '', baby: !!document.querySelector('#view .pl-baby') }; });
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|ttc)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* ticks the Today row whose text has `title` */
const tickToday = (a, title) => a.page.evaluate((tt) => { const b = Array.from(document.querySelectorAll('[data-today-act]')).find((x) => (x.parentElement.innerText || '').indexOf(tt) >= 0 || ((x.closest('.item, li, .row') || {}).innerText || '').indexOf(tt) >= 0); if (b) b.click(); return !!b; }, title);
/* her version from her answers, without starting a plan (plan.js's own maths, in the page) */
const versionOf = (a, ans) => a.page.evaluate((x) => { const S = window.Saathi; const d = S.plan.startFromIntake(Object.assign({ stage: 'ttc', goal: 'ready' }, x)); const ik = d && d.next ? d.next.intake : null; if (d) delete d.next; return ik ? { bdoc: ik.bdoc, bset: ik.bset, pack: d ? 'ttc' : null } : null; }, ans);

/* ---------- 1 starting ---------- */
{
  const a = await open({ seed: { mods: { ttc: { flags: { fibroids: true } } } } });
  check('1 every trying-stage goal opens Getting ready (version 2): 5 screens, 6 for a weight goal (her body)', (await a.page.evaluate(() => ['ready', 'irregular', 'pmos', 'weight'].map((g) => window.Saathi.plan.packFor(g, 'ttc') + ':' + window.Saathi.plan.intake.count({ stage: 'ttc', goal: g })).join())) === 'ttc:5,ttc:5,ttc:5,ttc:6'
    && (await a.page.evaluate(() => window.Saathi.plan.progs.list().find((x) => x.id === 'ttc').ver)) === 2);
  await a.page.evaluate(() => window.Saathi.plan.offer('pmos')); await settle(a.page, 600);
  const v = await view(a); const fl = await a.page.evaluate(() => window.Saathi.ttc.flagList().map((f) => f.en));
  check('1 A few things first: its heading, the 4 medicine lines, the verified list word for word, and "None of these?"', /^A few things first Your answers choose the right version of your plan\. They stay on this phone\. Does any of this apply to you\? I take a medicine every day, for example for fits, BP, sugar, thyroid, acne or skin Diabetes A past pregnancy with a spine or brain defect Sickle cell disease or thalassaemia/.test(v)
    && fl.length === 9 && fl.every((x) => v.indexOf(x) >= 0) && /None of these\? Leave them empty and carry on\./.test(v) && (await a.page.$$('[data-pl-bf]')).length === 13, v.slice(0, 600));
  const ticked = await a.page.$$eval('[data-pl-bf]:checked', (xs) => xs.map((x) => x.dataset.plBf).sort().join());
  check('1 her goal ticks PMOS, and Months of trying\'s own ticks come with her', ticked === 'fibroids,pcos', ticked);
  check('1 how long she has been trying: 4 answers, none needed', /How long have you been trying\? Not started yet Under 6 months 6 to 12 months Over a year/.test(v) && (await a.page.$$('[data-pl-q^="trying:"]')).length === 4);
  await tap(a, '[data-pl-bf="fibroids"]'); await tap(a, '[data-pl-bf="meds"]'); await tap(a, '#pl-in-next');
  check('1 Continue with no answer to how long', /Your day/.test(await view(a)));
  await tap(a, '[data-pl-q="act:1"]'); await tap(a, '[data-pl-m="lim:none"]'); await tap(a, '#pl-in-next'); await tap(a, '[data-pl-when="evening"]');
  check('1 the minimalist baseline: no body screen unless her goal is weight', !/Your body \(optional\)/.test(await view(a)) && /Here’s what you told Sakhi/.test(await view(a)));
  const sm = await view(a);
  check('1 the summary shows her ticks', /A few things first I take a medicine every day, for example for fits, BP, sugar, thyroid, acne or skin · PMOS \(PCOS\) diagnosed by a doctor Change/.test(sm) && !/How long have you been trying/.test(sm), sm.slice(0, 500));
  await tap(a, '#pl-in-make');
  for (let i = 0; i < 5 && (await has(a, '#pl-rv-next')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go');
  const s = await st(a); const d = s.mods.plan;
  check('1 her plan starts: Getting ready version 2, medicines first and a gynaecologist (both), PMOS food and moves', d.pack === 'ttc' && d.pv === 2 && d.intake.bdoc === 'both' && d.intake.bset === 'mix' && d.focus === 'habits', { pack: d.pack, pv: d.pv, ik: d.intake });
  check('1 Months of trying shows the same ticks (the medicine line is the plan\'s own)', JSON.stringify(s.mods.ttc.flags) === '{"pcos":true}', s.mods.ttc.flags);
  await done(a);
  const b = await open({ seed: { mods: { ttc: { since: ago(100) } } } });
  await b.page.evaluate(() => window.Saathi.plan.offer('ready')); await settle(b.page, 600);
  check('1 with a date on Months of trying, how long isn\'t asked', !/How long have you been trying/.test(await view(b)) && /A few things first/.test(await view(b)));
  await tap(b, '#pl-in-next'); await tap(b, '[data-pl-q="act:0"]'); await tap(b, '[data-pl-m="lim:none"]'); await tap(b, '#pl-in-next'); await tap(b, '[data-pl-when="evening"]');
  check('1 none ticked: "None of these" in the summary', /A few things first None of these Change/.test(await view(b)));
  await tap(b, '#pl-in-make');
  check('1 the standard version: no doctor card in the reveal (Today shows her routine card from day 1)', (await b.page.$$eval('.pl-rv .progress i', (x) => x.length)) === 4);
  await done(b);
}

/* ---------- 2 her version ---------- */
{
  const a = await open({});
  const v = async (x) => JSON.stringify(await versionOf(a, x));
  check('2 standard: nothing ticked, 30, under 6 months', (await v({ bflags: [], trying: 'lt6' })) === '{"bdoc":"std","bset":"std","pack":"ttc"}');
  check('2 medicines first: a daily medicine, diabetes, a past spine or brain defect, sickle cell', ['meds', 'diab', 'ntd', 'scd'].every(async () => true) && (await v({ bflags: ['meds'] })).indexOf('"bdoc":"meds"') >= 0 && (await v({ bflags: ['diab'] })).indexOf('"bdoc":"meds"') >= 0 && (await v({ bflags: ['ntd'] })).indexOf('"bdoc":"meds"') >= 0 && (await v({ bflags: ['scd'] })).indexOf('"bdoc":"meds"') >= 0);
  check('2 a gynaecologist first: any line of the verified list', ['irregular', 'pcos', 'endo', 'fibroids', 'pid', 'tb', 'tubes', 'partner', 'loss2'].length === 9 && (await v({ bflags: ['endo'] })).indexOf('"bdoc":"gyn"') >= 0 && (await v({ bflags: ['partner'] })).indexOf('"bdoc":"gyn"') >= 0 && (await v({ bflags: ['loss2'] })).indexOf('"bdoc":"gyn"') >= 0);
  check('2 both: a medicine and a line of the list', (await v({ bflags: ['meds', 'tb'] })).indexOf('"bdoc":"both"') >= 0);
  check('2 a year of trying under 35 is a gynaecologist; 6 to 12 months isn\'t, at 30', (await v({ trying: 'gt12' })).indexOf('"bdoc":"gyn"') >= 0 && (await v({ trying: 'm6' })).indexOf('"bdoc":"std"') >= 0);
  check('2 PMOS or a healthier weight: the mixed food and moves', (await v({ bflags: ['pcos'] })).indexOf('"bset":"mix"') >= 0 && (await v({ goal: 'pmos' })).indexOf('"bset":"mix"') >= 0 && (await v({ goal: 'weight' })).indexOf('"bset":"mix"') >= 0 && (await v({ goal: 'irregular' })).indexOf('"bset":"std"') >= 0);
  await done(a);
  const old = await open({ seed: { dob: '1985-04-01' } });
  check('2 at 40 or over: a gynaecologist from the start', (JSON.stringify(await versionOf(old, {}))).indexOf('"bdoc":"gyn"') >= 0);
  await done(old);
  const mid = await open({ seed: { dob: '1990-04-01' } });
  check('2 at 35 to 39: 6 months of trying is enough', (JSON.stringify(await versionOf(mid, { trying: 'm6' }))).indexOf('"bdoc":"gyn"') >= 0 && (JSON.stringify(await versionOf(mid, { trying: 'lt6' }))).indexOf('"bdoc":"std"') >= 0);
  await done(mid);
  const dated = await open({ seed: { mods: { ttc: { since: ago(400) } } } });
  check('2 Months of trying\'s own date counts (13 months: a gynaecologist)', (JSON.stringify(await versionOf(dated, {}))).indexOf('"bdoc":"gyn"') >= 0);
  await done(dated);
  const sit = await open({ seed: { situation: { planning: true, pcos: true } } });
  check('2 PMOS in Me counts too', (JSON.stringify(await versionOf(sit, {}))).indexOf('"bset":"mix"') >= 0);
  await done(sit);
}

/* ---------- 3 day 1 and her doctor card ---------- */
{
  const a = await open({ seed: withPlan(0) });
  const xs = await acts(a);
  check('3 day 1: 3 steps, her tablet (where to get it), her move and one food habit', xs.map((x) => x.id).join() === 'folic,move,food' && xs[0].kind === 'check' && xs[0].title === 'My folic acid tablet' && xs[0].sub === 'Not got it yet? See where' && xs[2].habit === 'greens', xs);
  const v = await view(a);
  check('3 Sakhi says: "Before you start trying" from day 1, her gynaecologist first and the free option second', /Before you start trying See your gynaecologist for a check: your folic acid, the tests before pregnancy, and any medicines you take\. Free: the PHC or Ayushman Arogya Mandir, or eSanjeevani Yes, done Remind me to book it/.test(v), v.slice(0, 1600));
  check('3 the week\'s lesson under her steps', /This week’s lesson · 2 min Week 1 · The first month counts Read/.test(v));
  await shot(a, 'today-day1');
  await tap(a, '#pl-doc-later');
  check('3 "Remind me to book it": the card waits 3 days', !/Remind me to book it/.test(await view(a)) && (await st(a)).mods.plan.doc === iso(TODAY, 3));
  await done(a);
  const g = await open({ seed: withPlan(0, { intake: IK({ bflags: ['pcos', 'endo'], bset: 'mix', bdoc: 'gyn' }) }, { situation: { planning: true } }) });
  const gv = await view(g);
  check('3 a gynaecologist first: why, PMOS\'s own line, and the doctor-first free line', /See a gynaecologist now Because of what you told us, doctors suggest a check now\. You don’t need to wait 12 months\. With PMOS, eggs may not be released every month\. A gynaecologist can check, and treatment helps\. Start with a gynaecologist, or the gynaecology OPD of your district hospital or a government medical college, which is free\./.test(gv), gv.slice(0, 1600));
  check('3 PMOS: her move is the PMOS plan\'s yoga, her first habit half the plate sabzi', (await acts(g)).map((x) => x.id + ':' + (x.habit || x.kind)).join() === 'folic:check,yoga:routine,food:half', await acts(g));
  await done(g);
  const gv2 = await open({ seed: withPlan(0, { intake: IK({ bflags: ['endo'], bdoc: 'gyn' }) }, { situation: { planning: true, care: 'govt' } }) });
  check('3 a woman who picked a government centre: its own words (the OPD, her ASHA or ANM)', /Start at the gynaecology OPD of your district hospital or a government medical college\. Your ASHA or ANM can tell you the nearest one\./.test(await view(gv2)));
  await done(gv2);
  const m = await open({ seed: withPlan(0, { intake: IK({ bflags: ['meds', 'diab'], bdoc: 'meds' }) }) });
  await go(m, 'plan-reveal');
  const mr = await m.page.evaluate(() => { const S = window.Saathi; const d = S.state.mods.plan; d.next = { pack: 'ttc', goalKey: 'ready', intake: d.intake, at: '2026-10-28' }; S.mem.rvCard = 3; S.render(); return true; });
  await settle(m.page, 500);
  const mv = await view(m);
  check('3 medicines first: the checklist\'s medicines line, the higher dose line, and the steady-first line, word for word', mr && /See your doctor before you start trying Some medicines for fits, BP, acne or skin are not safe in pregnancy\. Do not stop on your own; ask the doctor who prescribed them about a switch\. Some women need a higher dose, for example after a pregnancy with a spine defect; your doctor decides\. PMOS, thyroid, diabetes and BP under control\. Pregnancy goes more smoothly when these are steady before you start\./.test(mv), mv.slice(0, 1400));
  check('3 the Qura doctor for food, sleep and habits; the fertility check with a gynaecologist', /Your plan runs alongside your doctor’s care\. A Qura doctor can help with food, sleep and habits on a free call; your fertility check is with a gynaecologist\./.test(mv));
  await done(m);
  const sp = await open({ seed: withPlan(0, {}, { situation: { planning: true, deliveredOn: ago(300) } }) });
  check('3 a birth under 2 years ago: the spacing line', /Your last baby was born 9 months ago\. Doctors suggest waiting at least 2 years after a birth before the next pregnancy/.test(await view(sp)), (await view(sp)).slice(0, 1500));
  await done(sp);
}

/* ---------- 4 her tablet ---------- */
{
  const a = await open({ seed: withPlan(0), hash: 'ttc-folic' });
  const v = await view(a);
  check('4 the tablet page: the checklist\'s folic acid line a sentence at a time, the Learn strip, the free line', /^My folic acid tablet Folic acid every day, from 3 months before trying 400 mcg \(0\.4 mg\) once a day, until 12 weeks of pregnancy\. It protects the baby's spine and brain, which form before most women know they are pregnant\. Some women need a higher dose, for example after a pregnancy with a spine defect; your doctor decides\. Where to get it: from your doctor, or any chemist\. At a chemist, check the strip: the usual tablet sold is 5 mg, which is the higher dose\. Ask for 400 mcg, or ask a doctor which one to take\. Either costs a few rupees\. Free at the PHC or Ayushman Arogya Mandir\. I have my tablet Not yet: remind me tomorrow/.test(v), v);
  check('4 no ANM line on the doctor-first page', !/Ask the ANM/.test(v));
  await tap(a, '#ttc-fo-has');
  const r = await a.page.evaluate(() => window.Saathi.reminders.get('ttc-folic'));
  check('4 "I have my tablet": her tablet\'s reminder at 9 pm, every day, on by default (Version 39.27: reminders on wherever she needs one)', r && r.kind === 'med' && r.time === '21:00' && r.every === 1 && r.on !== false && r.mod === 'ttc' && (await a.page.$eval('#ttc-fo-rem', (c) => c.checked)), r);
  check('4 the switch, and the lock screen\'s words', /Remind me at 9 pm Your lock screen says only “Time for your tablet”\./.test(await view(a)));
  await go(a, 'home');
  const x0 = (await acts(a))[0];
  check('4 her tablet is a tick now', x0.id === 'folic' && x0.kind === 'tick' && x0.sub === '' && x0.state == null, x0);
  check('4 tick it on Today', await tickToday(a, 'My folic acid tablet')); await settle(a.page, 400);
  const s1 = await st(a);
  check('4 ticked: her log, and tonight\'s reminder knows', (s1.mods.plan.log[TODAY].ck || {}).folic === 'd' && s1.reminders.find((x) => x.id === 'ttc-folic').doneOn === TODAY, { ck: s1.mods.plan.log[TODAY], r: s1.reminders.find((x) => x.id === 'ttc-folic') });
  await go(a, 'plan-checkin');
  check('4 once she has it, the check-in counts it', /My folic acid tablet/.test(await view(a)));
  await go(a, 'ttc-folic'); await a.page.$eval('#ttc-fo-rem', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); }); await settle(a.page, 300);
  await go(a, 'home');
  check('4 switched off, it stays off', !(await a.page.evaluate(() => window.Saathi.reminders.get('ttc-folic'))) && (await st(a)).mods.ttc.folic.rem === false);
  await done(a);
  const n = await open({ seed: withPlan(0), hash: 'ttc-folic' });
  await tap(n, '#ttc-fo-not');
  check('4 "Not yet": today\'s step is answered, the page asks again tomorrow', (await acts(n))[0].state === 'n' && !(await n.page.evaluate(() => window.Saathi.reminders.get('ttc-folic'))));
  await go(n, 'plan-checkin');
  check('4 the evening check-in doesn\'t ask "Done?" about a tablet she hasn\'t got: it offers its page', /How did today go/.test(await view(n)) && /My folic acid tablet Do it now Walk or move/.test(await view(n)), (await view(n)).slice(0, 400));
  await done(n);
  const dsc = await open({ seed: withPlan(0, {}, { settings: { discreet: true }, mods: { plan: baby(0), ttc: { folic: { has: ago(2) } } } }) });
  check('4 a shared phone: "My tablet"', (await acts(dsc))[0].title === 'My tablet' && !/folic/i.test(await txt(dsc, '.pl-th, .today-card, #view .card')));
  await done(dsc);
  /* a loss stops the plan and the reminder; a pregnancy that follows keeps it until 12 weeks */
  const ls = await open({ seed: withPlan(20, {}, { mods: { plan: baby(20), ttc: { folic: { has: ago(15), remSet: true } } }, reminders: [{ id: 'ttc-folic', mod: 'ttc', kind: 'med', title: { en: 'My folic acid tablet', hi: 'मेरी folic acid की गोली' }, start: ago(15), every: 1, time: '21:00', on: true }], situation: { planning: true, pregEndedOn: ago(2) } }) });
  await go(ls, 'plan');
  check('4 after a loss: no reminder, the plan rests, and the methotrexate line', !(await ls.page.evaluate(() => window.Saathi.reminders.get('ttc-folic'))) && /Your plan is resting for now/.test(await view(ls)) && /After methotrexate or a molar pregnancy, start again only when your doctor says you can try again\./.test(await view(ls)), (await view(ls)).slice(0, 500));
  await done(ls);
  const pg = await open({ seed: withPlan(30, {}, { mods: { plan: baby(30), ttc: { folic: { has: ago(25), remSet: true } } }, reminders: [{ id: 'ttc-folic', mod: 'ttc', kind: 'med', title: { en: 'My folic acid tablet', hi: 'मेरी folic acid की गोली' }, start: ago(25), every: 1, time: '21:00', on: true }], situation: { pregnant: true, pregnantSince: ago(40) }, events: [] }) });
  await go(pg, 'plan');
  check('4 pregnant at 6 weeks: the plan has ended and the tablet\'s reminder carries on', (await pg.page.evaluate(() => window.Saathi.plan.packOf())) === null && !!(await pg.page.evaluate(() => window.Saathi.reminders.get('ttc-folic'))));
  await done(pg);
}

/* ---------- 5 her days and weeks ---------- */
{
  const day = async (startAgo, o, seed) => { const a = await open({ seed: withPlan(startAgo, o, seed) }); const x = await acts(a); await done(a); return x; };
  const d2 = await day(1);
  check('5 day 2: her Hb test is the 4th step', d2.map((x) => x.id).join() === 'folic,move,food,hb' && d2[3].title === 'Haemoglobin (Hb) test' && d2[3].kind === 'check' && d2[3].sub === 'Anaemia is common and is easier to fix before pregnancy than during it.', d2);
  const d3 = await day(2);
  check('5 day 3: the 1-minute ready check comes first', d3.map((x) => x.id).join() === 'folic,move,food,ready', d3);
  const hbDone = await day(1, {}, { mods: { plan: baby(1), ttc: { prep: { hb: true }, prepAt: { hb: TODAY } } } });
  check('5 the day she ticks her Hb test on the checklist, it is done', hbDone[3].id === 'hb' && hbDone[3].state === 'd', hbDone);
  const hbOld = await day(4, {}, { mods: { plan: baby(4), ttc: { prep: { hb: true }, prepAt: { hb: ago(1) }, ready: [{ at: ago(1), a: {} }] } } });
  check('5 day 5 with her Hb test and ready check done: the checklist, on its day of the week', hbOld.map((x) => x.id).join() === 'folic,move,food' || hbOld[3] && hbOld[3].id === 'prep', hbOld);
  const his = await day(12, {}, { mods: { plan: baby(12), ttc: { prep: { hb: true }, ready: [{ at: ago(10), a: {} }] } } });
  check('5 week 2, the 6th day of her week: his part this week', his.length === 4 && his[3].id === 'his' && his[3].title === 'His part this week', his);
  const hisD = await day(12, {}, { settings: { discreet: true }, mods: { plan: baby(12), ttc: { prep: { hb: true }, ready: [{ at: ago(10), a: {} }] } } });
  check('5 never on a shared phone', hisD.every((x) => x.id !== 'his'), hisD);
  const s7 = await day(43, {}, { mods: { plan: baby(43), ttc: { prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 week 7: strength twice a week', s7[3] && s7[3].id === 'str' && s7[3].r === 'strength', s7);
  const g7 = await day(43, {}, { situation: { planning: true, deliveredOn: ago(120) }, mods: { plan: baby(43), ttc: { prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 within 6 months of a birth: Gentle start instead', g7[3] && g7[3].id === 'str' && g7[3].r === 'gentle', g7);
  const s6 = await day(36, {}, { mods: { plan: baby(36), ttc: { prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 not before week 7', s6.every((x) => x.id !== 'str'), s6);
  const mx = await day(43, { intake: IK({ bset: 'mix' }) }, { mods: { plan: baby(43, { intake: IK({ bset: 'mix' }) }), ttc: { prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 PMOS: the PMOS plan\'s yoga (and its strength days) in the move step, no second strength step', mx[1].id === 'yoga' && mx.every((x) => x.id !== 'str'), mx);
  /* the calm few minutes: week 8, switched on, her period in 5 days */
  const cm = await day(52, {}, { events: regular(23), mods: { plan: baby(52), ttc: { calmOn: true, prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 week 8 on, switched on, the week before her period: the calm few minutes', cm[3] && cm[3].id === 'calm' && cm[3].r === 'calm' && cm[3].why === 'plan_fb_bcalm', cm);
  const cmOff = await day(52, {}, { events: regular(23), mods: { plan: baby(52), ttc: { prep: { hb: true }, ready: [{ at: ago(5), a: {} }] } } });
  check('5 not unless she switched it on', cmOff.every((x) => x.id !== 'calm'), cmOff);
}

/* ---------- 6 food ---------- */
{
  const a = await open({ seed: withPlan(0) });
  const order = (bset, body, ik2) => a.page.evaluate((o) => { const S = window.Saathi; const d = S.state.mods.plan; d.intake = Object.assign({}, d.intake, { bset: o.bset }, o.ik || {}); d.body = o.body || []; const out = []; for (let w = 1; w <= 11; w += 2) { d.start = S.toISO(S.addDays(S.today(), -7 * (w - 1))); const f = S.plan.actions().find((x) => x.id === 'food'); out.push(f ? f.habit : '-'); } return out.join(); }, { bset: bset, body: body, ik: ik2 });
  check('6 standard: greens, dal, fruit, the tea gap, milk or curd, half the plate sabzi', (await order('std')) === 'greens,dal,fruit,tea,milk,half', await order('std'));
  check('6 PMOS or a healthier weight: the two plans mixed', (await order('mix')) === 'half,drinks,greens,protein,millet,tea', await order('mix'));
  check('6 a BMI under 18.5: more food first, never a weight-loss habit', (await order('std', [{ d: ago(3), h: 160, w: 44 }])) === 'katori,greens,nuts,milk,fruit,tea' && (await order('mix', [], { bmi: 17.6 })) === 'katori,greens,nuts,milk,fruit,tea');
  const why = await a.page.evaluate(() => { const S = window.Saathi; const d = S.state.mods.plan; d.intake = Object.assign({}, d.intake, { bset: 'std', bmi: null }); d.body = []; d.start = S.toISO(S.addDays(S.today(), -42)); const f = S.plan.actions().find((x) => x.id === 'food'); return [f.title, f.sub, f.why, S.t(f.why)]; });
  check('6 each new habit has its own reason and meal', why.join('|') === 'Tea an hour away from meals|When you have tea or coffee|plan_fb_btea|Tea with food blocks iron. You don’t have to stop tea.', why);
  await done(a);
  const v1 = await open({ seed: { mods: { plan: Object.assign(baby(0), { pv: 1 }) } } });
  check('6 version 1 keeps the PMOS plan\'s habits', (await acts(v1)).find((x) => x.id === 'food').habit === 'half' && (await ids(v1)).indexOf('folic') < 0);
  await done(v1);
}

/* ---------- 7 moves before her period ---------- */
{
  const poses = (a, id) => a.page.evaluate((x) => window.Saathi.plan.stepsOf(x, window.Saathi.state.mods.plan).map((s) => s.pose).join(), id);
  const lut = await open({ seed: withPlan(5, {}, { events: regular(18) }) });   /* her period in about 10 days */
  check('7 the 2 weeks before her period: Tadasana for the cobra', (await poses(lut, 'cycle')).indexOf('cobra') < 0 && (await poses(lut, 'cycle')).indexOf('armsup') >= 0, await poses(lut, 'cycle'));
  check('7 sitting quietly for the seated twist', (await poses(lut, 'gentle')).indexOf('twist') < 0 && (await poses(lut, 'gentle')).indexOf('sit') >= 0, await poses(lut, 'gentle'));
  check('7 no sun salutation: Gentle start', (await poses(lut, 'sun')) === (await poses(lut, 'gentle')) && (await lut.page.evaluate(() => window.Saathi.plan.baby.lut())));
  await go(lut, 'plan-moves');
  const mv = await view(lut);
  check('7 Yoga and moves says why, and that moving most days is enough', /In the 2 weeks before your period, Sakhi swaps Bhujangasana \(cobra\) and Vakrasana \(seated twist\) for gentler moves, in case you’re already pregnant\./.test(mv) && /Moving most days is enough\. You don’t need hard workouts\./.test(mv) && !/Surya namaskar/.test(mv), mv.slice(0, 900));
  await done(lut);
  const early = await open({ seed: withPlan(5, {}, { events: regular(5) }) });   /* 23 days to her period */
  check('7 earlier in her cycle: the cobra as always', (await poses(early, 'cycle')).indexOf('cobra') >= 0 && (await poses(early, 'gentle')).indexOf('twist') >= 0);
  await done(early);
  const per = await open({ seed: withPlan(5, {}, { events: regular(1).slice(0, 5).concat([{ d: ago(1), t: 'start' }]) }) });
  check('7 never on her period days', (await poses(per, 'cycle')).indexOf('cobra') >= 0);
  await done(per);
  const other = await open({ seed: { events: regular(18), mods: { plan: Object.assign(baby(5), { pack: 'cycle', pv: 1 }) } } });
  check('7 not on another plan', (await poses(other, 'cycle')).indexOf('cobra') >= 0);
  await done(other);
}

/* ---------- 8 lessons ---------- */
{
  /* the minimalist baseline: one row under her steps at a time, the week's look-back first; My plan doesn't repeat her tablet,
     and her 12 weeks fold after week 1 */
  const lg = {}; for (let i = 7; i >= 2; i--) lg[ago(i)] = { min: 15, ci: 1, ck: { folic: 'd', move: 'd', food: 'd' } };
  const lb = await open({ seed: withPlan(7, { weeks: {}, log: lg }) });
  check('8 week 2, day 1: the look-back row, and the lesson waits for it', (await has(lb, '#view .pl-rev-row')) && !(await has(lb, '#view .pl-les')));
  await done(lb);
  const w2 = await open({ seed: withPlan(8) });
  check('8 the look-back seen: the lesson row', (await has(w2, '#view .pl-les')) && !(await has(w2, '#view .pl-rev-row')));
  await go(w2, 'plan');
  const y2 = await y12(w2);
  check('8 My plan after week 1: no row repeats her tablet, one "Your 12 weeks", and this week and next name her parts', !(await has(w2, '.pl-baby-tools [data-go="ttc-folic"]')) && (await has(w2, '.pl-baby-tools [data-go="ttc-lesson"]')) && y2.n === 1 && /This week\s*First things first: your tablet, an Hb test, and his part\s*Next week\s*Food, tests before pregnancy, fertile days, and how long it takes/.test(y2.kv), y2);
  await done(w2);
  const w1 = await open({ seed: withPlan(0), hash: 'plan' });
  const y1 = await y12(w1);
  check('8 week 1: one "Your 12 weeks", her 4 parts, the first marked', y1.n === 1 && y1.li === 4 && y1.now === 0 && !y1.baby, y1);
  await done(w1);
  const a = await open({ seed: withPlan(0) });
  await tap(a, '.pl-les');
  const v = await view(a);
  check('8 week 1: the story, the verified tablet and Hb lines, and the warning signs with Call 112', /^Week 1 · The first month counts Rekha and Amit decided this was the year\./.test(v) && /It protects the baby's spine and brain, which form before most women know they are pregnant\./.test(v) && /Anaemia is common and is easier to fix before pregnancy than during it\./.test(v) && /Period late or a positive test, with pain on one side of the lower belly, shoulder-tip pain, dizziness or fainting: call 112 now\./.test(v) && (await has(a, 'a[href="tel:112"]')) && (await a.page.$$('[data-say]')).length >= 4, v.slice(0, 900));
  await tap(a, '#ttc-les-done');
  check('8 Done: read, and the row leaves Today', (await st(a)).mods.ttc.les.w1 === TODAY && !(await has(a, '.pl-les')));
  await done(a);
  const id = async (startAgo) => { const b = await open({ seed: withPlan(startAgo) }); const x = await b.page.evaluate(() => window.Saathi.plan.baby.lesson()); await done(b); return x; };
  check('8 one a week to week 12, then one a month in turn', (await id(7)) === 'w2' && (await id(83)) === 'w12' && (await id(84)) === 'm1' && (await id(112)) === 'm2' && (await id(196)) === 'm1');
  const w8 = await open({ seed: withPlan(49), hash: 'ttc-lesson' });
  check('8 week 8: the waiting week, with the calm switch', /Week 8 · The waiting week/.test(await view(w8)) && (await has(w8, '#ttc-calm-sw')));
  await tap(w8, '#ttc-calm-sw');
  check('8 switched on', (await st(w8)).mods.ttc.calmOn === true && /Switch off/.test(await view(w8)));
  await done(w8);
  const w11 = await open({ seed: withPlan(70), hash: 'ttc-lesson' });
  check('8 week 11: the fertility tablets line, the hospital warning and the ART Act', /Week 11 · What elders may say/.test(await view(w11)) && /Ovulation tablets, IUI and IVF are started by an MBBS\/MD gynaecologist after tests\./.test(await view(w11)) && /Taking tablets or injections from your doctor to help eggs release\? A swollen, painful belly, vomiting or breathlessness: go to hospital now\./.test(await view(w11)) && /Under the ART \(Regulation\) Act, 2021/.test(await view(w11)));
  await done(w11);
  const pin = await open({ seed: withPlan(7, {}, { settings: { discreet: true, pinHash: 'x1' } }), hash: 'ttc-lesson' });
  check('8 a shared phone with a PIN: the lesson waits for it', !/It’s for both of you/.test(await view(pin)));
  await done(pin);
  const dsc = await open({ seed: withPlan(7, {}, { settings: { discreet: true } }) });
  check('8 a shared phone: Today\'s lesson row has no title', /This week’s lesson · 2 min/.test(await view(dsc)) && !/It’s for both of you/.test(await view(dsc)), (await view(dsc)).slice(0, 900));
  await done(dsc);
}

/* ---------- 9 the ready check ---------- */
{
  const ticks = {}; for (let i = 0; i < 7; i++) ticks[ago(i)] = { ck: { folic: 'd' } };
  const a = await open({ seed: withPlan(3, { log: ticks }, { mods: { plan: baby(3, { log: ticks }), ttc: { folic: { has: ago(3) } } } }) });
  check('9 day 4: the ready check is today\'s 4th step', (await ids(a)).join() === 'folic,move,food,ready');
  await go(a, 'ttc-ready');
  const v = await view(a);
  check('9 its 6 questions, no score', /^1-minute ready check How ready do you feel\? 6 quick questions, just for you\. There is no score\. Greens or other vegetables Most days Some days Rarely Fruit/.test(v) && /His part Started Not yet Not for us/.test(v), v.slice(0, 700));
  check('9 her folic acid answer starts from her ticks', await has(a, '[data-rd="folic:every"].on'));
  await tap(a, '#ttc-rd-save');
  check('9 every answer first', !(await st(a)).mods.ttc.ready && !(await a.page.$eval('#ttc-rd-err', (e) => e.hidden)));
  for (const k of ['veg:some', 'fruit:rare', 'tob:daily', 'move:some', 'his:not']) await tap(a, '[data-rd="' + k + '"]');
  check('9 tobacco: the checklist\'s quitline line', /They lower the chance of pregnancy and harm the baby\. Free help to quit: National Tobacco Quitline 1800-11-2356\./.test(await view(a)));
  await tap(a, '#ttc-rd-save');
  const s = await st(a);
  check('9 saved, and the step is done today', s.mods.ttc.ready.length === 1 && s.mods.ttc.ready[0].a.folic === 'every' && (await acts(a))[3].state === 'd');
  await done(a);
  const b = await open({ seed: withPlan(40, {}, { mods: { plan: baby(40), ttc: { ready: [{ at: ago(38), a: { veg: 'rare', fruit: 'rare', folic: 'not', tob: 'none', move: 'rare', his: 'not' } }, { at: ago(1), a: { veg: 'most', fruit: 'some', folic: 'every', tob: 'none', move: 'some', his: 'started' } }] } } }), hash: 'ttc-ready' });
  check('9 then and now, side by side', /Then and now/.test(await view(b)) && /Greens or other vegetables Rarely · Most days/.test(await view(b)), (await view(b)).slice(0, 700));
  await done(b);
  const c = await open({ seed: withPlan(3, {}, { settings: { discreet: true } }), hash: 'ttc-ready' });
  check('9 a shared phone: "Just for me", and his part isn\'t asked', /^1-minute ready check Just for me/i.test(await view(c)) && !/His part/.test(await view(c)));
  await done(c);
}

/* ---------- 10 moments ---------- */
{
  const ev = regular(28).concat([{ d: TODAY, t: 'start' }]);
  const a = await open({ seed: withPlan(20, { per: { at: TODAY, d: TODAY, days: 28 } }, { events: ev }) });
  check('10 her period comes: a fresh start, no failure words', /Your period started today\. This month counts too: your tablet and your walk carry on, and nothing needs to change\./.test(await view(a)));
  await go(a, 'plan');
  check('10 on My plan too, with its heading', /A fresh start Your period started today\./.test(await view(a)));
  await done(a);
  const p = await open({ seed: withPlan(20, {}, { mods: { plan: baby(20), pregtest: { tests: [{ d: ago(1), r: 'pos' }] } } }) });
  check('10 a positive test she saved: "Your test is positive", once', /Your test is positive Move on to My pregnancy\? Your folic acid carries on to 12 weeks, and your Hb result comes with you\. See your gynaecologist within a few days\. Yes, move me on Not now/.test(await view(p)), (await view(p)).slice(0, 1500));
  await tap(p, '#pl-pos-yes');
  const sp = await st(p);
  check('10 "Yes, move me on": pregnant from her last period, and the plan has ended', sp.situation.pregnant === true && sp.situation.pregnantSince === ago(10) && sp.situation.planning === false && (await p.page.evaluate(() => window.Saathi.plan.packOf())) === null, sp.situation);
  await done(p);
  const q = await open({ seed: withPlan(20, {}, { mods: { plan: baby(20), pregtest: { tests: [{ d: ago(1), r: 'pos' }] } } }) });
  await tap(q, '#pl-pos-not');
  check('10 "Not now": it doesn\'t ask again for the same test', !/Your test is positive/.test(await view(q)) && (await st(q)).mods.plan.posSeen === ago(1));
  await done(q);
  const old = await open({ seed: withPlan(20, {}, { mods: { plan: baby(20), pregtest: { tests: [{ d: ago(40), r: 'pos' }] } } }) });
  check('10 a test from before her plan doesn\'t ask', !/Your test is positive/.test(await view(old)));
  await done(old);
  const end = await open({ seed: withPlan(84, { log: { [ago(80)]: { ck: { folic: 'd' }, min: 20 }, [ago(79)]: { ck: { folic: 'd' } } } }, { mods: { plan: baby(84, { log: { [ago(80)]: { ck: { folic: 'd' }, min: 20 }, [ago(79)]: { ck: { folic: 'd' } } } }), ttc: { prep: { folic: true, hb: true } } } }) });
  const res = await end.page.evaluate(() => { const S = window.Saathi; return S.t('plan_bres_h'); });
  await go(end, 'plan-progress');
  check('10 her 12 weeks: days of her tablet and her minutes (her checklist in its own card), no pregnancy count', res === 'Your 12 weeks' && /Your 12 weeks 2 days of your tablet, and about \d+ minutes moved a week\. Before-pregnancy checklist 2 of 17 done/.test(await view(end)) && !/pregnan/i.test(await txt(end, '.pl-bres')), (await view(end)).slice(0, 900));
  await done(end);
}

/* ---------- 11 every verified line word for word ---------- */
{
  const a = await open({ seed: withPlan(0) });
  const pageHas = async (hash, keys) => { await go(a, hash); const v = await a.page.$eval('#view', (e) => e.textContent.replace(/\s+/g, ' ')); return keys.map((k) => [k, v.indexOf(k) >= 0]); };
  const vf = await a.page.evaluate(() => { const S = window.Saathi; const o = {}; ['male', 'show', 'sperm', 'semen', 'sex', 'whenH', 'when1', 'when2', 'when3', 'both', 'together', 'ovu', 'artH', 'art', 'start', 'checks', 'antara', 'strip', 'folic1', 'folic2', 'folic3', 'hb1', 'open'].forEach((k) => { o[k] = S.ttc.vf(k); }); return o; });
  const partner = await pageHas('ttc-partner', [vf.male.en, vf.show.en, vf.sperm.en, vf.semen.en]);
  check('11 the partner page has its 4 lines', partner.every((x) => x[1]), partner.filter((x) => !x[1]));
  const trying = await pageHas('ttc-trying', [vf.together.en, vf.ovu.en, vf.start.doc.en]);
  check('11 Months of trying has its 3 lines (and the doctor-first start line)', trying.every((x) => x[1]), trying.filter((x) => !x[1]));
  const tests = await pageHas('ttc-tests', [vf.whenH.en, vf.when1.en, vf.when2.en, vf.when3.en, vf.artH.en, vf.art.en]);
  check('11 the tests page has its 6 lines', tests.every((x) => x[1]), tests.filter((x) => !x[1]));
  const src = fs.readFileSync(path.join(root, 'mods', 'ttc.js'), 'utf8'); const csrc = fs.readFileSync(path.join(root, 'mods', 'contra.js'), 'utf8');
  const count = (s, x) => s.split(x).length - 1;
  check('11 in the trying pages\' own source too: the sex line, both partners, the checks line (each twice: the page and the plan)', [vf.sex.en, vf.sex.hi, vf.both.en, vf.checks.en, vf.checks.doc.en, vf.start.hi].every((x) => count(src, x) >= 2) && [vf.antara.en, vf.antara.hi].every((x) => csrc.indexOf(x) >= 0));
  check('11 the Learn strip line, word for word', CONTENT.indexOf(vf.strip.en) >= 0 && CONTENT.indexOf(vf.strip.hi) >= 0);
  const prep = await a.page.evaluate(() => { const S = window.Saathi; const f = S.ttc.prep('folic'), h = S.ttc.prep('hb'), b = S.ttc.prep('bmi'), m = S.ttc.prep('meds'), c = S.ttc.prep('control');
    const vf = (k) => S.ttc.vf(k); const plan = (k, l) => (window.SAKHI_STR || null, S.state.lang = l, S.t(k));
    const out = [];
    out.push(['folic sentences', f.den.indexOf(vf('folic1').en) === 0 && f.den.indexOf(vf('folic2').en) > 0 && f.den.indexOf(vf('folic3').en) > 0 && f.dhi.indexOf(vf('folic1').hi) === 0 && f.dhi.indexOf(vf('folic2').hi) > 0 && f.dhi.indexOf(vf('folic3').hi) > 0]);
    out.push(['hb sentence', h.den.indexOf(vf('hb1').en) === 0 && h.dhi.indexOf(vf('hb1').hi) === 0]);
    out.push(['plan_fb_folic', plan('plan_fb_folic', 'en') === vf('folic2').en && plan('plan_fb_folic', 'hi') === vf('folic2').hi]);
    out.push(['plan_a_hb', plan('plan_a_hb', 'en') === h.en && plan('plan_a_hb', 'hi') === h.hi && plan('plan_a_hb_s', 'en') === vf('hb1').en && plan('plan_a_hb_s', 'hi') === vf('hb1').hi && plan('plan_fb_hb', 'en') === h.den && plan('plan_fb_hb', 'hi') === h.dhi]);
    out.push(['plan_fb_his', plan('plan_fb_his', 'en') === vf('sperm').en && plan('plan_fb_his', 'hi') === vf('sperm').hi]);
    out.push(['plan_fb_bkatori', plan('plan_fb_bkatori', 'en') === b.den && plan('plan_fb_bkatori', 'hi') === b.dhi]);
    out.push(['plan_in_bflags', plan('plan_in_bflags', 'en') === 'Does any of this apply to you?']);
    out.push(['meds and control', !!m.den && !!c.den]);
    S.state.lang = 'en'; return out; });
  check('11 plan.js\'s copies equal the verified lines, in both languages', prep.every((x) => x[1]), prep.filter((x) => !x[1]));
  await done(a);
}

/* ---------- 12 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: Object.assign(withPlan(0, {}, { mods: { plan: baby(0), ttc: { folic: { has: ago(1) } } } }), { lang: 'hi' }) });
  const bad = [];
  for (const h of ['home', 'plan', 'ttc-folic', 'ttc-lesson', 'ttc-ready', 'plan-moves']) { await go(a, h); const v = await view(a); if (!(await noScroll(a)) || KEYS.test(v) || !/[ऀ-ॿ]/.test(v)) bad.push([h, await noScroll(a), (v.match(KEYS) || [])[0]]); }
  check('12 Hindi at 360 px: Today, My plan, the tablet, the lesson, the ready check, the moves: no sideways scroll, no raw keys', !bad.length, bad);
  await go(a, 'home'); await shot(a, 'hi-today');
  check('12 the Hindi doctor card and lesson row', /कोशिश शुरू करने से पहले/.test(await view(a)) && /इस हफ़्ते का पाठ · 2 मिनट/.test(await view(a)));
  await a.page.evaluate(() => window.Saathi.plan.offer('pmos')); await settle(a.page, 600);
  check('12 A few things first in Hindi, no sideways scroll', /पहले कुछ बातें/.test(await view(a)) && /क्या इनमें से कुछ आप पर लागू होता है\?/.test(await view(a)) && (await noScroll(a)) && !KEYS.test(await view(a)));
  await shot(a, 'hi-start');
  await done(a);
}

/* ---------- 16 a plan she made at another stage (found on Mohit's phone, 28 Oct) ---------- */
{
  const old = { pack: 'pain', goalKey: 'pain', intake: { at: ago(9), stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23' }, at: ago(9), level: 0, limits: { knees: false, back: false }, food: 'veg', goal: 'pain', focus: 'habits', remAt: '20:00' };
  const a = await open({ seed: { situation: { planning: true }, intake: { at: ago(9), stage: 'cycle', goal: 'pain' }, mods: { plan: { next: old, log: {}, weeks: {}, body: [] } }, prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30), planOffer: ago(9) } }, hash: 'plan' });
  const v = await view(a);
  check('16 after she switches to trying for a baby, the old period-pain plan stops waiting: My plan offers her stage\'s goals, Getting ready first', /What do you want to work on\?/.test(v) && /Getting ready for a baby/.test(v) && !/Your plan is ready/.test(v), v.slice(0, 600));
  await go(a, 'home');
  check('16 Today offers no plan for a goal of her old stage', !/Ready to start|Ready for you/i.test(await view(a)) || !/Easier periods/.test(await view(a)), (await view(a)).slice(0, 900));
  await done(a);
  const back = await open({ seed: { situation: {}, intake: { at: ago(9), stage: 'cycle', goal: 'pain' }, mods: { plan: { next: old, log: {}, weeks: {}, body: [] } } }, hash: 'plan' });
  check('16 back at her old stage, it waits again', /Your plan is ready/.test(await view(back)));
  await done(back);
  /* a plan she stopped earlier made a nudge (nudgeMade): the new plan's nudge is still on, as the Start card says */
  const was = await open({ seed: { mods: { plan: { nudgeMade: true, past: [], log: {}, weeks: {}, body: [] } } } });
  await was.page.evaluate(() => window.Saathi.plan.offer('ready')); await settle(was.page, 600);
  await tap(was, '#pl-in-next'); await tap(was, '[data-pl-q="act:1"]'); await tap(was, '[data-pl-m="lim:none"]'); await tap(was, '#pl-in-next'); await tap(was, '[data-pl-when="evening"]');
  await tap(was, '#pl-in-make'); for (let i = 0; i < 5 && (await has(was, '#pl-rv-next')); i++) await tap(was, '#pl-rv-next'); await tap(was, '#pl-rv-go');
  const ng = await was.page.evaluate(() => ({ r: window.Saathi.reminders.get('plan-nudge'), off: window.Saathi.state.mods.plan.nudge === false }));
  check('16 after a plan she stopped, the new plan\'s 6 pm nudge rings (it isn\'t taken for one she deleted)', ng.r && ng.r.time === '18:00' && ng.r.on !== false && !ng.off, ng);
  await done(was);
  /* PMOS she told Sakhi is ticked on "A few things first": her version without asking again (Mohit's phone: an older diary's
     goals hold "pmos" from Version 36's "What would you like help with?"; a diagnosis saved in situation.pcos was ticked already) */
  const said = await open({ seed: { situation: { planning: true }, goals: ['ttc', 'pmos'] } });
  await said.page.evaluate(() => window.Saathi.plan.offer('ready')); await settle(said.page, 600);
  check('16 PMOS she told Sakhi comes ticked on "A few things first"', await said.page.$eval('[data-pl-bf="pcos"]', (c) => c.checked));
  await tap(said, '#pl-in-next'); await tap(said, '[data-pl-q="act:1"]'); await tap(said, '[data-pl-m="lim:none"]'); await tap(said, '#pl-in-next'); await tap(said, '[data-pl-when="evening"]');
  await tap(said, '#pl-in-make'); for (let i = 0; i < 5 && (await has(said, '#pl-rv-next')); i++) await tap(said, '#pl-rv-next'); await tap(said, '#pl-rv-go');
  const sk = (await st(said)).mods.plan.intake || {};
  check('16 ...so her plan is a gynaecologist first, with the PMOS food and moves', sk.bdoc === 'gyn' && sk.bset === 'mix', sk);
  await done(said);
  /* while she tries for a baby, Getting ready is her plan: "My PMOS plan" isn't offered (My plan, Me's setup, Explore), and its page opens My plan */
  const pm = await open({ seed: { situation: { planning: true, pcos: true } }, hash: 'plan' });
  check('16 at the trying stage, My plan suggests no "My PMOS plan" (Getting ready is listed)', !/My PMOS plan/.test(await view(pm)) && /Getting ready for a baby/.test(await view(pm)), (await view(pm)).slice(0, 700));
  await go(pm, 'topic-cond'); check('16 ...nor Explore\'s PMOS tile', !/PMOS: food, yoga and moves/.test(await view(pm)), (await view(pm)).slice(0, 500));
  await go(pm, 'plan-pmos'); check('16 ...and its page opens My plan, Getting ready first', /What do you want to work on\?/.test(await view(pm)) && /Getting ready for a baby/.test(await view(pm)), (await view(pm)).slice(0, 400));
  await done(pm);
  const cyc = await open({ seed: { situation: { pcos: true }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' } }, hash: 'topic-cond' });
  check('16 at the tracking stage, the PMOS tile stays', /PMOS: food, yoga and moves/.test(await view(cyc)));
  await done(cyc);
  const SET = { planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) };   /* Me's setup card on */
  const ms = await open({ seed: { dob: '1999-05-01', situation: { planning: true, pcos: true, care: 'govt' }, prompts: SET }, hash: 'me' });   /* Version 39.58.1: the government route keeps her setup card's steps */   /* 27: no check-up step first */
  check('16 ...nor Me\'s setup ("Start your PMOS plan") while she tries', !/Start your PMOS plan/.test(await view(ms)) && /Set up Sakhi for you/.test(await view(ms)), (await view(ms)).slice(0, 500));
  await done(ms);
  const mc = await open({ seed: { dob: '1999-05-01', situation: { pcos: true }, goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, prompts: SET }, hash: 'me' });
  check('16 ...which offers it at the tracking stage', /Start your PMOS plan/.test(await view(mc)), (await view(mc)).slice(0, 500));
  await done(mc);
  /* a woman who joined before Version 39.10, after a stage change: her plan holds her stage and goal, so Today doesn't ask */
  const ex0 = await open({ seed: {} });
  check('16 an older diary with no plan: Today asks her stage and goals once', await has(ex0, '#view .ex-card'));
  await done(ex0);
  const ex1 = await open({ seed: withPlan(0) });
  check('16 ...but not while her plan for this stage runs', !(await has(ex1, '#view .ex-card')));
  await done(ex1);
}

/* ---------- 17 how it looks (found on Mohit's phone, 28 Oct): the app's own switch, a speaker clear of the words, her 12 weeks as a list ---------- */
{
  const a = await open({ seed: withPlan(0), hash: 'ttc-folic', h: 760 });
  await tap(a, '#ttc-fo-has');
  const sw = await a.page.evaluate(() => { const c = document.querySelector('#ttc-fo-rem'); const r = c.closest('.ttc-fo-rem').getBoundingClientRect(); const cs = getComputedStyle(c); return { item: c.parentElement.classList.contains('item'), w: cs.width, app: cs.appearance || cs.webkitAppearance, top: r.top, bot: r.bottom, vh: window.innerHeight }; });
  check('17 the tablet\'s reminder is the app\'s switch (as in Plan settings)', sw.item && sw.w === '48px' && sw.app === 'none', sw);
  check('17 ...where her buttons were, with no toast over it (the switch says it)', sw.top >= 0 && sw.bot <= sw.vh && !(await has(a, '.toast, #toast.on, .toast.on')), sw);
  await done(a);
  const l = await open({ seed: withPlan(0), hash: 'ttc-lesson' });
  const ov = await l.page.evaluate(() => Array.from(document.querySelectorAll('#view .ttc-les.has-say')).map((c) => { const b = c.querySelector(':scope > .say-b').getBoundingClientRect(); const f = c.querySelector(':scope > .say-b + *'); if (!f || /^H/.test(f.tagName)) return null; const r = f.getBoundingClientRect(); const cs = getComputedStyle(f); return { tag: f.className, right: f.classList.contains('flag') ? r.right : r.right - parseFloat(cs.paddingRight), b: b.left }; }).filter(Boolean));
  check('17 the lesson\'s speaker covers no words (its story and its urgent line)', ov.length >= 2 && ov.every((x) => x.right <= x.b + 1), ov);
  await done(l);
  /* her doctor month (Months of trying 40 days ago, at 30: 12 months on) under her 4 parts, in week 1 and after it */
  const dmS = (n) => withPlan(n, {}, { mods: { plan: baby(n), ttc: { since: ago(40) } } });
  const p1 = await open({ seed: dmS(0), hash: 'plan' }); const q1 = await y12(p1);
  check('17 "Your 12 weeks" in week 1: her doctor month under her 4 parts', q1.n === 1 && q1.li === 4 && /^Your doctor month: September 2027/.test(q1.dm), q1);
  await done(p1);
  const p2 = await open({ seed: dmS(8), hash: 'plan' }); const q2 = await y12(p2);
  check('17 ...and after week 1', q2.n === 1 && /^Your doctor month: September 2027/.test(q2.dm), q2);
  await done(p2);
  /* "How to do it" names a page with no tile by its step (found on Mohit's phone: "ttc-folic") */
  const wy = await open({ seed: withPlan(2), hash: 'plan' }); const ix = await ids(wy); const lab = {};
  for (const id of ['folic', 'ready']) { const i = ix.indexOf(id); if (i < 0) continue; await tap(wy, '[data-pl-how="' + i + '"]'); lab[id] = await wy.page.$eval('.pl-why-b [data-go]', (b) => b.textContent.trim()).catch(() => null); await wy.page.evaluate(() => window.Saathi.closeSheet()); await settle(wy.page, 300); }
  check('17 "How to do it" names her tablet\'s page and the ready check, never their address', lab.folic === 'My folic acid tablet' && lab.ready === '1-minute ready check', { ix, lab });
  await done(wy);
  const r = await open({ seed: withPlan(8, {}, { mods: { plan: baby(8), ttc: { les: { w2: ago(1) } } } }), hash: 'plan' });
  check('17 a lesson read keeps its tick on the same line', /The first|Week 2/.test(await view(r)) && (await r.page.evaluate(() => / ✓/.test((document.querySelector('.pl-baby-tools [data-go="ttc-lesson"]') || {}).textContent || ''))));
  await done(r);
}

/* ---------- 13 version 1 runs on ---------- */
{
  const a = await open({ seed: { mods: { plan: Object.assign(baby(3), { pv: 1 }) } } });
  const x = await ids(a);
  check('13 a woman on version 1 keeps its steps (no tablet step, no lesson)', x[0] === 'move' && x.indexOf('folic') < 0 && !(await has(a, '.pl-les')), x);
  await done(a);
}

/* ---------- 15 the minimalist baseline: her evening ---------- */
{
  const CI = { id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(3), every: 1, time: '20:00', on: true };
  const a = await open({ seed: withPlan(3, {}, { mods: { plan: baby(3), ttc: { folic: { has: ago(3) } } }, reminders: [CI] }) });
  await go(a, 'plan'); await go(a, 'home');
  const ev = await a.page.evaluate(() => window.Saathi.reminders.list().filter((r) => r.on !== false).map((r) => ({ id: r.id, t: r.time, k: r.kind })));
  const ci = ev.find((x) => x.id === 'plan'), nu = ev.find((x) => x.id === 'plan-nudge'), fo = ev.find((x) => x.id === 'ttc-folic');
  check('15 her evening in her order (Version 39.27): the walk nudge, the check-in after it, and her tablet as a medicine at 9 pm', !!ci && !!nu && nu.t < ci.t && !!fo && fo.k === 'med' && fo.t === '21:00' && ev.filter((x) => x.id === 'plan-wind').length === 0, ev);
  await done(a);
}

/* ---------- 18 the recommended wordings (Mohit, 29 Oct: "use recommended wordings"; review section 19.33) ---------- */
{
  const FOOT = /Everyday habits from national guidelines, and the folic acid tablet they advise before a pregnancy\. Your answers choose your version\. No other supplements, herbs or medicines here: your doctor decides those\./;
  const a = await open({ seed: withPlan(0), hash: 'plan' });
  const v = await view(a);
  check('18 My plan\'s foot line: her folic acid tablet and her version, not "the same for every woman"', FOOT.test(v) && !/the same for every woman/.test(v), (v.match(/Everyday habits[^.]*\.[^.]*\./) || [])[0]);
  check('18 What consistency brings: her tablet, her Hb test (their reviewed reasons), then how long it usually takes', /Your tablet every day: It protects the baby.s spine and brain, which form before most women know they are pregnant\. Your Hb test: Anaemia is common and is easier to fix before pregnancy than during it\. How long it usually takes: When the woman is under 40, more than 8 in 10 couples get pregnant/.test(v), (v.match(/What consistency brings.{0,400}/) || [])[0]);
  await go(a, 'plan-settings');
  check('18 Plan settings: the same foot line', FOOT.test(await view(a)));
  await done(a);
  const b = await open({});
  await b.page.evaluate(() => window.Saathi.plan.offer('ready')); await settle(b.page, 600);
  await tap(b, '#pl-in-next'); await tap(b, '[data-pl-q="act:1"]'); await tap(b, '[data-pl-m="lim:none"]'); await tap(b, '#pl-in-next'); await tap(b, '[data-pl-when="evening"]');
  await tap(b, '#pl-in-make'); for (let i = 0; i < 5 && (await has(b, '#pl-rv-next')); i++) await tap(b, '#pl-rv-next');
  check('18 the Start card, before her plan has a version: the same foot line', (await has(b, '#pl-rv-go')) && FOOT.test(await view(b)));
  await done(b);
  const s = await open({ seed: withPlan(0, {}, { settings: { discreet: true } }), hash: 'plan' });
  const sv = await view(s);
  check('18 a shared phone: one neutral foot line', /Everyday habits from national guidelines\. Any other tablet, herb or medicine: your doctor decides\./.test(sv) && !/folic|pregnan/i.test(sv.slice(sv.indexOf('Everyday habits'))));
  await done(s);
  const pg = { pack: 'preg', goalKey: 'iron', start: ago(3), started: ago(3), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'food', remAt: '20:00', when: 'evening', log: {}, weeks: {}, body: [], intake: { at: ago(4), stage: 'preg', goal: 'food' } };
  const p = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(120) }, goals: ['preg'], intake: { at: ago(4), stage: 'preg', goal: 'food' }, mods: { plan: pg } }, hash: 'plan' });
  check('18 the pregnancy plan\'s foot line names her iron tablets (her iron goal, which has the tablet step)', /Everyday habits from national guidelines, and the iron tablets your doctor prescribes in pregnancy\. No other supplements, herbs or medicines here: your doctor decides those\./.test(await view(p)), (await view(p)).slice(-400));
  await done(p);
  const h = await open({ w: 360, seed: withPlan(0, {}, { lang: 'hi' }), hash: 'plan' });
  const hv = await view(h);
  check('18 Hindi at 360 px: the foot line and the 3 lines', /और गर्भ से पहले की folic acid की गोली, जिसकी वे सलाह देते हैं/.test(hv) && /रोज़ आपकी गोली:/.test(hv) && /आपकी Hb जाँच:/.test(hv) && /आम तौर पर कितना समय लगता है:/.test(hv) && !KEYS.test(hv) && (await noScroll(h)), hv.slice(-500));
  await done(h);
}

check('14 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (baby)');
process.exit(failed.length ? 1 : 0);
