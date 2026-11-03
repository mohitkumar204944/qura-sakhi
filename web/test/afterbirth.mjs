// Version 39.46: I had a baby, the full plan (`post` version 2). Mohit, 30 Oct: "yes start with the I had a baby plan", then
// "proceed building"; advice docs/after-birth-plan-advice-2026-10-30.md; mockup claude.ai/artifact/RLz4dU7pQ5A5iVTFCcnqPa;
// MODULE_API section 89. This file checks:
//   1 starting: the reveal (her 3 steps, what happens when, her evening), the Start card, version 2, her 6-week check ringing;
//   2 days 0 to 13: the squeezes during a feed, her goal's step, the recovery check last and as her evening form (no "How did
//     today go?", the reminder opens the check, a saved check is tonight's check-in), her baby's danger signs in week 1;
//   3 days 14 to 41: 10 squeezes and the knack, a walk 3 days a week, the contraception card and its one feeding question;
//   4 her own 6-week check (days 35 to 41), with what her pregnancy asks of it (a BP check, the sugar test);
//   5 back to strong from day 42 (her check, her doctor, or "I feel ready" with two checks), then the walk most days and
//     Gentle start; "Is my body ready?" from week 12 opens Strength at home;
//   6 leaks, her main measure: the weekly question from day 42, and My progress;
//   7 the weekly mood question waits for the psychologist (drafts only), in the recovery check's reviewed words;
//   8 "My baby has died": every baby line stops, what is hers stays, her support first, no celebration, undo;
//   9 the new danger sign; 10 version 1 runs on, with one offer; 11 My plan's 5 parts and how it works;
//   12 the minimalist baseline (3 steps on day 1, never more than 4, one card, the shared phone); 13 Hindi at 360 px;
//   14 no page errors; 15 the bug hunt's fixes ("My baby has died" everywhere, after midnight, a moved birth date, late joiners,
//   discreet words, rest days, her pregnancy's answers not asked again).
// Usage: node test/afterbirth.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'afterbirth'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.46-pilot', platform: 'android' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {}, goals: ['feed'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'feed', stage: 'post' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const bridge = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return false; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.cfg || {})) + ';');
  if (o.bridge !== false) await ctx.addInitScript(bridge);
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
const steps = (a, day) => a.page.evaluate((x) => window.Saathi.plan.actions(x).map((y) => ({ id: y.id, title: y.title, sub: y.sub || '', r: y.r || null })), day || null);
const ids = async (a, day) => (await steps(a, day)).map((x) => x.id);
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const remIds = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => r.id).join());
const slot = (a) => txt(a, '#view .pl-sl-post');
const KEYS = /\b(plan|post|preg)_[a-z0-9_]+\b/;

/* she joined on day `born - startAgo` after the birth; her plan started `startAgo` days ago (0: today, plan day 1) */
const POST = (startAgo, o) => Object.assign({ pack: 'post', goalKey: 'feed', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: { at: ago(startAgo + 1), stage: 'post', goal: 'feed', food: 'veg', milk: 'y', lim: [] } }, o || {});
const REM = { id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(1), every: 1, time: '20:00', on: true, doneOn: null };
const pseed = (born, startAgo, o, x) => Object.assign({ situation: Object.assign({ care: 'private', deliveredOn: ago(born), breastfeeding: true }, (x || {}).sit || {}), goals: ['feed'], intake: { goal: 'feed', stage: 'post' }, events: [], reminders: [REM], settings: { notify: true }, mods: { plan: POST(startAgo, o) } }, x || {});
const plan = async (a) => (await st(a)).mods.plan;

/* ---------- 1 starting ---------- */
{
  const a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(4), breastfeeding: true }, goals: ['feed'], intake: { goal: 'feed', stage: 'post' }, events: [], mods: {}, settings: { notify: true } } });
  await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'post', goal: 'feed', food: 'veg', milk: 'y', lim: [] })); await settle(a.page, 300); await go(a, 'plan-reveal');
  const cards = []; for (let i = 0; i < 8; i++) { cards.push({ v: await view(a), tl: await a.page.$$eval('#view .pl-tl li', (xs) => xs.map((x) => x.textContent.trim())), rem: await txt(a, '#view .pl-st-rem') }); if (await has(a, '#pl-rv-go')) break; await tap(a, '#pl-rv-next'); }
  const s1 = cards[0].v, s2 = (cards.find((x) => /^Your \d steps/.test(x.v)) || {}).v || '', dd = cards.find((x) => x.tl.length) || { tl: [], v: '' }, last = cards[cards.length - 1];
  check('1 the reveal: to her baby\'s first birthday, not "12 weeks"', /To your baby’s first birthday · a few minutes a day/.test(s1) && !/12 weeks/.test(s1), s1.slice(0, 300));
  check('1 her 3 steps: the squeezes, her goal\'s step, the daily recovery check', /^Your 3 steps/.test(s2) && /pelvic floor squeezes/.test(s2) && /Breastfeeding/.test(s2) && /recovery check/.test(s2), s2.slice(0, 400));
  check('1 her evening is the recovery check; what happens when: day 14, day 42, week 12, the first birthday', /At 8 pm, your recovery check: 1 minute, with the signs that can’t wait\./.test(dd.v) && dd.tl.join('|') === 'From day 14: a short walk, 3 days a week|Around day 42: your own check, then back to strong|From week 12: is your body ready for more?|To your baby’s first birthday', dd.tl);
  check('1 the Start card: each evening her recovery check, and the reminders she will hear (her recovery check, her 6-week check)', /Each evening, 1 minute: your recovery check, to day 41\./.test(last.v) && /your 8 pm recovery check and your 6-week check on 6 Dec/.test(last.rem), last.rem);
  await tap(a, '#pl-rv-go'); await settle(a.page, 800);
  const p = await plan(a);
  check('1 started as version 2, its check-in and her own 6-week check ringing (no question)', p.pv === 2 && (await remIds(a)).split(',').indexOf('post-6wk') >= 0 && (await remIds(a)).split(',').indexOf('plan') >= 0, { pv: p.pv, rem: await remIds(a) });
  await done(a);
  /* from My pregnancy: high BP and sugar in her pregnancy carry over, nothing asked again */
  const b = await open({ seed: { situation: { care: 'private', deliveredOn: ago(2), breastfeeding: true }, goals: ['feed'], intake: { goal: 'feed', stage: 'post' }, events: [], mods: { plan: { pack: 'preg', goalKey: 'food', start: ago(100), started: ago(100), go: true, pv: 2, log: {}, weeks: {}, body: [], intake: { stage: 'preg', goal: 'food', pflags: ['r_bp', 'r_gdm', 'r_tw'] } } } } });
  await b.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'post', goal: 'feed', food: 'veg', milk: 'y', lim: [] })); await settle(b.page, 300);
  const nx = (await plan(b)).next;
  check('1 from My pregnancy: her high BP and sugar marks carry into her answers (nothing asked again)', nx && JSON.stringify(nx.intake.pm) === '["r_bp","r_gdm"]', nx && nx.intake);
  await done(b);
}

/* ---------- 2 days 0 to 13 ---------- */
{
  const a = await open({ seed: pseed(3, 0), hm: '18:30' });
  const s = await steps(a);
  check('2 plan day 1 (day 3 after the birth): 3 steps, the recovery check last', s.map((x) => x.id).join() === 'pelvic,feed,rcheck', s);
  check('2 the squeezes: "5 gentle squeezes", during a feed', s[0].title === '5 gentle squeezes' && s[0].sub === 'Your pelvic floor, during a feed', s[0]);
  const v = await view(a);
  check('2 Today: "Recovery check at 8 pm", no "How did today go?" button', /Recovery check at 8 pm/.test(v) && !(await has(a, '#view .pl-t-ci')), v.slice(0, 800));
  const sl = await slot(a);
  check('2 Sakhi says in week 1: her baby\'s danger signs in the feeding page\'s reviewed words, with Call 108 and 102', /This week: signs in your baby that can’t wait/.test(sl) && /Take your baby to hospital now if/.test(sl) && /Not feeding, or too sleepy to feed/.test(sl) && /Yellow palms and soles, or yellow skin on the first day/.test(sl) && /Free ambulance 108 or 102/.test(sl) &&
    (await a.page.$$eval('#view .pl-sl-post a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href')).join())) === 'tel:108,tel:102', sl.slice(0, 500));
  await shot(a, 'day3');
  await tap(a, '[data-p2="nb-ok"]');
  check('2 "Got it" puts it away', !(await has(a, '#view .pl-p2-nb')));
  await go(a, 'plan-checkin');
  check('2 the evening check-in opens her recovery check (to day 41)', (await a.page.evaluate(() => location.hash)) === '#post-recovery');
  await a.page.evaluate(() => { const st = window.Saathi.data('post'); st.rec = st.rec || {}; st.rec[window.Saathi.toISO(window.Saathi.today())] = { danger: ['none'], bleed: 'light', mood: 'ok' }; window.Saathi.emit('tool', { route: 'post-recovery' }); window.Saathi.save(); });
  await settle(a.page, 400);
  check('2 a saved recovery check is tonight\'s check-in: the reminder is done for today', await a.page.evaluate((d) => (window.Saathi.reminders.get('plan') || {}).doneOn === d, TODAY));
  await done(a);
  const b = await open({ seed: pseed(3, 0, { goalKey: 'recovery' }, { sit: { breastfeeding: false } }) });
  const sb = await steps(b);
  check('2 not breastfeeding, the recovery goal: squeezes "lying or sitting", "Walk a little, as you feel able"', sb.map((x) => x.id).join() === 'pelvic,pwalk,rcheck' && sb[0].sub === 'Your pelvic floor, lying or sitting' && sb[1].title === 'Walk a little, as you feel able', sb);
  await done(b);
}

/* ---------- 3 days 14 to 41 ---------- */
{
  const a = await open({ seed: pseed(21, 20) });
  const s = await steps(a);
  check('3 day 21: "10 squeezes, and the knack"', s[0].title === '10 squeezes, and the knack' && s[0].sub === 'Squeeze before you cough, sneeze or lift', s[0]);
  const walkDays = []; for (let i = 0; i < 7; i++) { const d = ago(-i); if ((await ids(a, d)).indexOf('move') >= 0) walkDays.push(i); }
  check('3 a walk 3 days a week from day 14', walkDays.length === 3, walkDays);
  const sl = await slot(a);
  check('3 the contraception card, with one optional question: how is her baby fed now?', /Before sex starts again: choose your method/.test(sl) && /You can get pregnant before your first period comes back\./.test(sl) && /How is your baby fed now\?/.test(sl), sl);
  await tap(a, '[data-p2-feed="only"]');
  check('3 "Only breast milk": what protects her for now, and when it stops', /this protects you for now. It stops when any one of these changes/.test(await slot(a)) && (await st(a)).situation.feedHow === 'only');
  await tap(a, '[data-p2-feed="other"]');
  check('3 "Other milk only": she can get pregnant again from about 4 to 6 weeks', /from about 4 to 6 weeks after the birth/.test(await slot(a)));
  await tap(a, '[data-p2="contra-ok"]');
  check('3 "I have a method" closes it', !(await has(a, '#view .pl-p2-contra')) && !!(await plan(a)).contraOk);
  await done(a);
}

/* ---------- 4 her own 6-week check ---------- */
{
  const a = await open({ seed: pseed(38, 37, { intake: { stage: 'post', goal: 'feed', pm: ['r_bp', 'r_gdm'] } }) });
  const sl = await slot(a);
  check('4 day 38: her own check at 6 weeks, on her gynaecologist, with its date', /Your own check at 6 weeks/.test(sl) && /Around day 42 \(2 Nov\), see your gynaecologist for a check for yourself/.test(sl), sl);
  check('4 ... and what her pregnancy asks of it: a BP check, the sugar test', /From your pregnancy/.test(sl) && /ask for a BP check at this visit/.test(sl) && /ask for the 75 g sugar test at this visit, then once a year/.test(sl), sl);
  await tap(a, '[data-p2="six-rem"]');
  check('4 "Remind me on 2 Nov" sets her 6-week check reminder', (await remIds(a)).split(',').indexOf('post-6wk') >= 0, await remIds(a));
  await tap(a, '[data-p2="six-went"]');
  check('4 "I went" puts it away and back to strong waits for day 42', !(await has(a, '#view .pl-p2-six')) && (await plan(a)).six === TODAY && !(await ids(a)).includes('gentle'));
  await done(a);
  const b = await open({ seed: pseed(4, 3, { intake: { stage: 'post', goal: 'feed', pm: ['r_bp'] } }) });
  await tap(b, '[data-p2="nb-ok"]');
  check('4 high BP in her pregnancy: a BP check in her first week', /Your BP check this week/.test(await slot(b)), await slot(b));
  await done(b);
}

/* ---------- 5 back to strong ---------- */
{
  const a = await open({ seed: pseed(46, 45) });
  const sl = await slot(a);
  check('5 day 46: "Ready to move a little more?" with her check, her doctor, "I feel ready" and "Not yet"', /Ready to move a little more\?/.test(sl) && /I went to my 6-week check/.test(sl) && /My doctor said I can exercise/.test(sl) && /I feel ready to start gently/.test(sl) && /Not yet/.test(sl), sl);
  check('5 until then: the walk 3 days a week, no Gentle start', !(await ids(a)).includes('gentle'));
  await tap(a, '[data-p2="un-ready"]');
  const dis = await a.page.$eval('#pl-p2-rdy-go', (b) => b.disabled);
  await a.page.$eval('#pl-p2-c1', (e) => { e.checked = true; e.dispatchEvent(new Event('change')); });
  const dis1 = await a.page.$eval('#pl-p2-rdy-go', (b) => b.disabled);
  await a.page.$eval('#pl-p2-c2', (e) => { e.checked = true; e.dispatchEvent(new Event('change')); });
  check('5 "I feel ready" needs both checks (bleeding no heavier, wound not hurting)', dis && dis1 && !(await a.page.$eval('#pl-p2-rdy-go', (b) => b.disabled)));
  await tap(a, '#pl-p2-rdy-go');
  const all = new Set(); let gentle = 0, walkEvery = true; for (let i = 0; i < 7; i++) { const x = await ids(a, ago(-i)); x.forEach((k) => all.add(k)); if (x.includes('gentle')) gentle++; if (!x.includes('move')) walkEvery = false; }
  check('5 back to strong: the walk most days, Gentle start 2 days a week', (await plan(a)).unlock.by === 'ready' && walkEvery && gentle === 2, { all: [...all], gentle });
  await done(a);
  const b = await open({ seed: pseed(50, 49) });
  await tap(b, '[data-p2="un-not"]');
  check('5 "Not yet": asked again in a week', !(await has(b, '#view .pl-p2-un')));
  await done(b);
  const c = await open({ seed: pseed(90, 89, { six: ago(48) }) });
  check('5 week 13: "Is your body ready for more?" opens Strength at home', /Is your body ready for more\?/.test(await slot(c)) && /They open Strength at home/.test(await slot(c)), await slot(c));
  await go(c, 'plan-pready');
  await c.page.$$eval('[data-pr]', (xs) => xs.forEach((e) => { e.checked = true; e.dispatchEvent(new Event('change')); })); await settle(c.page, 300);
  await tap(c, '[data-pr-leak="no"]');
  check('5 the 6 tests and no leak, heaviness, pain or bleeding: "Strength at home opens"', /Strength at home opens/.test(await view(c)) && /Never test with your baby/.test(await view(c)), (await view(c)).slice(0, 600));
  await tap(c, '#pl-pr-save');
  let str = 0; for (let i = 1; i <= 7; i++) if ((await ids(c, ago(-i))).includes('str')) str++;
  check('5 Strength at home from tomorrow, 2 days a week; never today', str === 2 && !(await ids(c)).includes('str'), str);
  await done(c);
  const e = await open({ seed: pseed(90, 89, { six: ago(48) }), hash: 'plan-pready' });
  await tap(e, '[data-pr-leak="yes"]');
  check('5 a leak or heaviness: stay at this level 2 more weeks', /Stay at this level for 2 more weeks/.test(await view(e)));
  await tap(e, '#pl-pr-save'); await go(e, 'home');
  check('5 ... no Strength at home, and the card waits 2 weeks', !(await ids(e, ago(-2))).includes('str') && !(await has(e, '#view .pl-p2-ready')));
  await done(e);
}

/* ---------- 6 leaks ---------- */
{
  const recs = {}; for (let i = 15; i <= 41; i++) recs[ago(70 - i)] = { danger: ['none'], pee: i <= 27 ? (i % 2 ? 'leak' : 'fine') : 'fine' };
  const a = await open({ seed: Object.assign(pseed(70, 69, { six: ago(30) }), { mods: { plan: POST(69, { six: ago(30) }), post: { rec: recs } } }), hm: '21:00' });
  await go(a, 'plan-checkin');
  check('6 from day 42, once a week in the check-in: "This week: any leaks?"', /This week: any leaks\? Never Sometimes Most days/i.test(await view(a)), (await view(a)).slice(0, 600));
  await tap(a, '[data-ci-lk="never"]');
  await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((b) => b.click())); await settle(a.page, 300);
  await tap(a, '#pl-ci-save');
  check('6 her answer is saved with the day', (await plan(a)).log[TODAY].lk === 'never');
  await go(a, 'plan-progress');
  check('6 My progress: leaks, first noted (from her recovery check) and latest', /Leaks First noted Sometimes · week 3 Latest Never · week 11/.test(await view(a)), (await view(a)).slice(0, 900));
  await done(a);
  const b = await open({ seed: pseed(70, 69, { six: ago(30), log: { [ago(3)]: { ci: 1, lk: 'some' } } }), hm: '21:00', hash: 'plan-checkin' });
  check('6 not asked again within the week', !/any leaks/.test(await view(b)));
  await done(b);
  const c = await open({ seed: pseed(70, 69, { six: ago(30) }, { settings: { shared: true, notify: true } }), hm: '21:00', hash: 'plan-checkin' });
  check('6 never on a shared phone', !/any leaks/.test(await view(c)));
  await done(c);
}

/* ---------- 7 the weekly mood question waits for the psychologist ---------- */
{
  const a = await open({ seed: pseed(60, 59, { six: ago(20) }), hm: '21:00', hash: 'plan-checkin' });
  check('7 off in this build (it ships after the psychologist\'s review)', !(await has(a, '#view .pl-ci-md')));
  await done(a);
  const b = await open({ seed: pseed(60, 59, { six: ago(20) }), hm: '21:00', hash: 'plan-checkin', cfg: { drafts: true } });
  const m = await txt(b, '#view .pl-ci-md');
  check('7 with drafts on: the recovery check\'s own mood words', /How are you in yourself this week\? Okay Low or teary Worried or panicky Thoughts of harming myself or my baby/i.test(m), m);
  await tap(b, '[data-ci-md="harm"]');
  check('7 "Thoughts of harming myself or my baby": its reviewed crisis card, Call 14416 and 112', /Get help now: call 14416 or 112/.test(await txt(b, '#view .pl-ci-crisis')) && (await b.page.$$eval('#view .pl-ci-crisis a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href')).join())) === 'tel:14416,tel:112');
  await done(b);
}

/* ---------- 8 "My baby has died" ---------- */
{
  const VAX = { id: 'post-vax-6w', mod: 'post', title: { en: 'Vaccines', hi: 'टीके' }, kind: 'checkup', dates: [ago(-20)], time: '09:00', on: true };
  const a = await open({ seed: pseed(10, 9, {}, { reminders: [REM, VAX] }), hash: 'post' });
  check('8 the after-birth page has "My baby has died"', await has(a, '#pst-lost'));
  await tap(a, '#pst-lost');
  const sh = await txt(a, '#sheet-root');
  check('8 it asks once, saying what stops and what stays', /We are so sorry/.test(sh) && /Sakhi will stop everything about your baby/.test(sh) && /What is for you stays/.test(sh), sh);
  await tap(a, '#pst-lost-yes'); await settle(a.page, 800);
  const s = await st(a);
  check('8 marked: no vaccine reminders, her feeding goal becomes her recovery, no celebration', s.situation.babyDied === TODAY && (await remIds(a)).indexOf('post-vax') < 0 && s.mods.plan.goalKey === 'recovery' && !/petal/i.test(await txt(a, '.toast, #toast')), { rem: await remIds(a), goal: s.mods.plan.goalKey });
  check('8 the after-birth page: her support first (14416, support after a loss), no feeds, no vaccines, no baby\'s age', /We are so sorry Talk to someone: Tele-MANAS 14416, free, any time\. Call 14416 Support after a loss/.test(await view(a)) && !/Feeds today|Next vaccines|Your baby is/.test(await view(a)), (await view(a)).slice(0, 500));
  await go(a, 'home');
  const v = await view(a);
  check('8 Today: "days since birth", "Your recovery", no Feeding button, no feeding step, her support in Sakhi says', /days since birth/.test(v) && /Your recovery/.test(v) && !/Recovery and feeding/.test(v) && !(await ids(a)).some((k) => ['feed', 'bfood'].indexOf(k) >= 0) && /We are so sorry/.test(await slot(a)), v.slice(0, 800));
  await go(a, 'plan');
  check('8 My plan\'s tiles: her own check, not "baby\'s vaccines"', /Your own check at 6 weeks/.test(await txt(a, '#view .pl-tiles')) && !/baby's vaccines/.test(await txt(a, '#view .pl-tiles')), await txt(a, '#view .pl-tiles'));
  await go(a, 'post-feed');
  check('8 the feeding page says what it is, and leads back to her recovery', /This page is about feeding a baby\. Back to your recovery/.test(await view(a)));
  await go(a, 'post-checks');
  check('8 Check-ups: her own 6-week check, no baby\'s vaccines', /Your own check at 6 weeks/.test(await view(a)) && !/Remind me of the vaccines|BCG|Pentavalent/.test(await view(a)));
  await go(a, 'post-recovery');
  check('8 her recovery check: "Thoughts of harming myself", without the baby', /Thoughts of harming myself/.test(await view(a)) && !/harming myself or my baby/.test(await view(a)));
  check('8 ... and her self-care lines without the baby', /drink water through the day/.test(await view(a)) && /Avoid lifting anything heavy for the first weeks/.test(await view(a)) && !/heavier than your baby|every time you feed/.test(await view(a)));
  await go(a, 'post');
  check('8 the after-birth page: no baby in its first line or its urgent box', /The first weeks after a birth are for healing/.test(await view(a)) && /Thoughts of harming yourself: 14416 or 112/.test(await view(a)) && !/or your baby/.test(await view(a)));
  await go(a, 'post'); await tap(a, '#pst-lost-undo');
  check('8 "Marked this by mistake? Undo": her feeding goal comes back', !(await st(a)).situation.babyDied && (await has(a, '#pst-lost')) && (await plan(a)).goalKey === 'feed', (await plan(a)).goalKey);
  await done(a);
  const b = await open({ seed: pseed(25, 24) });
  await tap(b, '#stage-btn'); await tap(b, '[data-stage="post"]');
  check('8 the stage sheet has it too', await has(b, '#st-lost'));
  await tap(b, '#st-lost'); await settle(b.page, 300);
  check('8 ... opening the same question', /Sakhi will stop everything about your baby/.test(await txt(b, '#sheet-root')));
  await tap(b, '#pst-lost-yes'); await go(b, 'home');
  check('8 after it: the contraception card without the feeding question', /You can get pregnant again soon after a birth/.test(await slot(b)) || !(await has(b, '[data-p2-feed]')), await slot(b));
  await done(b);
}

/* ---------- 9 the new danger sign ---------- */
{
  const a = await open({ seed: pseed(5, 4), hash: 'post-recovery' });
  check('9 "Fever and feeling very unwell" in her warning signs', /Fever and feeling very unwell/.test(await view(a)));
  await a.page.$$eval('[data-pst-g="danger"]', (xs) => { const b = xs.find((x) => x.dataset.pstV === 'ill'); if (b) b.click(); }); await settle(a.page, 400);
  check('9 ... a "now" sign: Call 112', /serious infection. Call 112 or go to hospital now/.test(await view(a)), (await view(a)).slice(0, 900));
  await done(a);
}

/* ---------- 10 version 1 runs on ---------- */
{
  const a = await open({ seed: pseed(30, 29, { pv: 1 }) });
  const s = await ids(a);
  check('10 version 1 keeps its steps', s.indexOf('rcheck') === 0 && s.indexOf('pelvic') >= 0, s);
  check('10 ... and is offered version 2 once', /Your recovery plan has more now/.test(await slot(a)));
  await tap(a, '[data-p2="pv2-yes"]');
  const p = await plan(a);
  check('10 "Switch to it": version 2, the same start and days', p.pv === 2 && p.start === ago(29));
  await done(a);
  const b = await open({ seed: pseed(30, 29, { pv: 1 }) });
  await tap(b, '[data-p2="pv2-no"]'); await go(b, 'home');
  check('10 "Not now": not offered again', !(await has(b, '#view .pl-p2-pv2')) && (await plan(b)).pv === 1);
  await done(b);
}

/* ---------- 11 My plan ---------- */
{
  const a = await open({ seed: pseed(3, 0), hash: 'plan' });
  const v = await view(a);
  check('11 how it works (week 1): her steps with the recovery check at 8 pm, around day 42, from week 12', /HOW YOUR PLAN WORKS Every day 3 steps, recovery check 8 pm Around day 42 Your own check, then back to strong From week 12 Is your body ready for more\?/i.test(v), v.slice(0, 600));
  check('11 her year in 5 parts, this one marked', /Your year, in 5 parts/.test(v) && (await a.page.$$eval('#view .pl-ppath li', (xs) => xs.map((x) => x.className).join())) === 'now,,,,');
  await done(a);
  const b = await open({ seed: pseed(50, 49), hash: 'plan' });
  check('11 day 50: the parts that passed carry no tick', (await b.page.$$eval('#view .pl-ppath li', (xs) => xs.map((x) => x.className + ':' + x.querySelector('.pl-sdot').textContent).join())) === 'gone:,gone:,now:,:,:');
  await done(b);
}

/* ---------- 12 the minimalist baseline ---------- */
{
  let worst = 0, d1 = 0;
  for (const g of ['feed', 'recovery', 'mood', 'sleep', 'weight', 'pelvic']) {
    const a = await open({ seed: pseed(2, 0, { goalKey: g, six: ago(-50), pready: { at: ago(-90), ok: true } }) });
    d1 = Math.max(d1, (await ids(a)).length);
    for (let k = 0; k < 120; k += 3) { const n = (await ids(a, ago(-k))).length; if (n > worst) worst = n; }
    await done(a);
  }
  check('12 day 1 has 3 steps or fewer for every goal, and no day has more than 4', d1 <= 3 && worst <= 4, { d1, worst });
  const b = await open({ seed: pseed(3, 0) });
  check('12 one Sakhi says card at a time', (await b.page.$$('#view .pl-slot')).length === 1);
  await done(b);
  const c = await open({ seed: pseed(21, 20, {}, { settings: { discreet: true, notify: true } }) });
  const vc = await view(c);
  check('12 discreet mode: no baby\'s danger card, no contraception card, private steps as "Today\'s step"', !(await has(c, '#view .pl-p2-nb')) && !(await has(c, '#view .pl-p2-contra')) && !/squeezes|Breastfeeding/.test(vc), vc.slice(0, 600));
  await done(c);
}

/* ---------- 13 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, seed: Object.assign(pseed(3, 0), { lang: 'hi' }) });
  const v = await view(a);
  check('13 Hindi at 360 px, day 3: her steps and her baby\'s signs, no string keys, no side scroll', /5 हल्के कसाव/.test(v) && /इस हफ़्ते: बच्चे में ऐसे संकेत जिनमें देर न करें/.test(v) && !KEYS.test(v) && (await noScroll(a)), v.slice(0, 600));
  await shot(a, 'hi-day3');
  await done(a);
  const b = await open({ w: 360, h: 800, seed: Object.assign(pseed(46, 45), { lang: 'hi' }) });
  const vb = await view(b);
  check('13 Hindi at 360 px, day 46: the unlock card, no string keys, no side scroll', /थोड़ा और चलने-फिरने के लिए तैयार\?/.test(vb) && !KEYS.test(vb) && (await noScroll(b)), vb.slice(0, 600));
  await go(b, 'plan');
  check('13 Hindi at 360 px: My plan\'s 5 parts', /आपका साल, 5 हिस्सों में/.test(await view(b)) && !KEYS.test(await view(b)) && (await noScroll(b)));
  await shot(b, 'hi-plan46');
  await done(b);
}

/* ---------- 15 the bug hunt (Mohit, 30 Oct: "can you first test for any bugs or issues") ---------- */
{
  /* a: "My baby has died" on the old plan, My food, the plan picker, Explore; undo */
  const a = await open({ seed: pseed(10, 9, { pv: 1 }), hash: 'post' });
  await tap(a, '#pst-lost'); await tap(a, '#pst-lost-yes'); await settle(a.page, 600);
  const s1 = (await st(a)).situation;
  check('15a after "My baby has died" she no longer breastfeeds a baby; the old plan has no food-while-breastfeeding step', s1.breastfeeding === false && s1.bfWas === true && !(await ids(a)).includes('bfood'), { sit: s1, ids: await ids(a) });
  await go(a, 'food');
  check('15a My food: no breastfeeding page', !/Food and water while you breastfeed/.test(await view(a)));
  await go(a, 'care');
  const ex = await view(a);
  await go(a, 'plan'); const mp = await view(a); await go(a, 'care');   /* Version 39.59: her plan's tiles live in My plan, not For you */
  check('15a Explore: no Breastfeeding tile; her own check named without "baby\'s vaccines" (on My plan\'s tile)', !/Breastfeeding Feed log/.test(ex) && !/Check-ups and baby's vaccines/.test(ex + mp) && /Your own check at 6 weeks/.test(ex + mp), (ex + ' || ' + mp).slice(0, 900));
  await go(a, 'post'); await tap(a, '#pst-lost-undo');
  check('15a undo brings breastfeeding back', (await st(a)).situation.breastfeeding === true && !(await st(a)).situation.bfWas);
  await done(a);
  /* b: a recovery check after midnight is the evening before's */
  const b = await open({ seed: pseed(10, 9), now: at('01:10', iso(TODAY, 1)) });
  await go(b, 'post-recovery');
  await b.page.$$eval('[data-pst-g="danger"]', (xs) => { const n = xs.find((x) => x.dataset.pstV === 'none'); if (n) n.click(); }); await settle(b.page, 200);
  await b.page.$$eval('[data-pst-g]', (xs) => { const pick = {}; xs.forEach((x) => { const g = x.dataset.pstG; if (g !== 'danger' && !pick[g]) { pick[g] = 1; x.click(); } }); }); await settle(b.page, 200);
  const sv = await b.page.$('#pst-rsave, #pst-save, [data-pst-save]'); if (sv) { await sv.click(); await settle(b.page, 500); }
  const rec = await b.page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.data('post') || {}).rec || {})));
  const k = Object.keys(rec)[0];
  check('15b a check saved at 1:10 am keeps its time, and counts for the evening before (the reminder is done for it)', k === iso(TODAY, 1) && rec[k].at === '01:10' && (await b.page.evaluate(() => (window.Saathi.reminders.get('plan') || {}).doneOn)) === TODAY, { k, rec: rec[k], done: await b.page.evaluate(() => (window.Saathi.reminders.get('plan') || {}).doneOn) });
  await done(b);
  const c = await open({ seed: Object.assign(pseed(10, 9), { mods: { plan: POST(9), post: { rec: { [iso(TODAY, 1)]: { danger: ['none'], at: '01:10' } } } } }), now: at('21:00', iso(TODAY, 1)) });
  check('15b ... and the next evening her check is still to do', !(await c.page.evaluate(() => (window.Saathi.plan.actions().find((x) => x.id === 'rcheck') || {}).state)) && (await c.page.evaluate((d) => (window.Saathi.reminders.get('plan') || {}).doneOn !== d, iso(TODAY, 1))));
  await done(c);
  /* c: a changed birth date moves her 6-week check reminder */
  const d = await open({ seed: pseed(20, 19, {}, { reminders: [REM, { id: 'post-6wk', mod: 'post', title: { en: 'My 6-week check after birth', hi: 'x' }, kind: 'checkup', dates: [ago(-22)], time: '09:00', on: true }] }) });
  await d.page.evaluate(() => { const S = window.Saathi; S.state.situation.deliveredOn = S.toISO(S.addDays(S.today(), -25)); S.save(); S.render(); }); await settle(d.page, 500);
  check('15c a changed birth date moves her 6-week check reminder', JSON.stringify(await d.page.evaluate(() => (window.Saathi.reminders.get('post-6wk') || {}).dates)) === JSON.stringify([ago(-17)]));
  await done(d);
  /* d: a late joiner hears only what is still ahead */
  const e = await open({ seed: { situation: { care: 'private', deliveredOn: ago(60), breastfeeding: true }, goals: ['feed'], intake: { goal: 'feed', stage: 'post' }, events: [], mods: {}, settings: { notify: true } } });
  await e.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'post', goal: 'feed', food: 'veg', milk: 'y', lim: [] })); await settle(e.page, 300); await go(e, 'plan-reveal');
  let tl = []; for (let i = 0; i < 8; i++) { tl = await e.page.$$eval('#view .pl-tl li', (xs) => xs.map((x) => x.textContent.trim())); if (tl.length || (await has(e, '#pl-rv-go'))) break; await tap(e, '#pl-rv-next'); }
  check('15d joining on day 60: what happens when lists only week 12 and the first birthday', tl.join('|') === 'From week 12: is your body ready for more?|To your baby’s first birthday', tl);
  await done(e);
  /* e: discreet mode keeps the plain check-in words */
  const f = await open({ seed: pseed(10, 9, {}, { settings: { discreet: true, notify: true } }) });
  const vf = await view(f);
  check('15e discreet mode: "Check-in at 8 pm", never "Recovery check"', /Check-in at 8 pm/.test(vf) && !/Recovery check|recovery check/.test(vf), vf.slice(0, 500));
  await done(f);
  const f2 = await open({ seed: pseed(46, 45, {}, { settings: { discreet: true, notify: true } }) });
  const sl2 = await txt(f2, '#view .pl-sl-post');
  check('15e discreet mode, day 46: back to strong in plain words (no check after a birth)', /Ready for a little more\? Start when your doctor says so, or when you feel ready\./.test(sl2) && !/6-week/.test(sl2), sl2);
  await done(f2);
  /* f: a rest day in her first 6 weeks doesn't silence her recovery check */
  const g = await open({ seed: pseed(10, 9, { log: { [TODAY]: { rest: true, ci: 1 } } }) });
  await g.page.evaluate(() => window.Saathi.render()); await settle(g.page, 300);
  check('15f a rest day in her first 6 weeks: her check still shows and its reminder still rings', /Daily recovery check/.test(await view(g)) && (await g.page.evaluate((d) => (window.Saathi.reminders.get('plan') || {}).doneOn !== d, TODAY)));
  await done(g);
  /* g: from My pregnancy, the birth, then her plan: her answers aren't asked again */
  const PIK = { stage: 'preg', goal: 'food', food: 'veg', milk: 'y', lim: [], pflags: ['r_bp'], psafeW: 30 };
  const h = await open({ seed: { situation: { care: 'private', pregnant: true, pregnantSince: ago(273) }, goals: ['food'], intake: PIK, events: [], settings: { notify: true }, reminders: [REM],
    mods: { plan: { pack: 'preg', goalKey: 'food', start: ago(60), started: ago(60), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', log: {}, weeks: {}, body: [], intake: PIK } } }, wait: 1200 });
  await tap(h, '#stage-btn'); await tap(h, '[data-stage="post"]'); await tap(h, '#st-save'); await settle(h.page, 1200);
  await tap(h, '#pl-chg-go');
  const skipped = !/So your steps fit your day/.test(await view(h)) && (await has(h, '#pl-in-make'));
  check('15g after the birth, "Your day" isn\'t asked again (her pregnancy\'s answers): straight to her answers and "Make my plan"', skipped, (await view(h)).slice(0, 400));
  if (await has(h, '#pl-in-make')) await tap(h, '#pl-in-make'); await settle(h.page, 500);
  for (let i = 0; i < 8 && !(await has(h, '#pl-rv-go')); i++) if (await has(h, '#pl-rv-next')) await tap(h, '#pl-rv-next'); else break;
  if (await has(h, '#pl-rv-go')) await tap(h, '#pl-rv-go'); await settle(h.page, 800);
  const ph = (await st(h)).mods.plan;
  check('15g ... her recovery plan starts as version 2, with her high BP carried over', ph.pack === 'post' && ph.pv === 2 && JSON.stringify((ph.intake || {}).pm) === '["r_bp"]', { pack: ph.pack, pv: ph.pv, pm: (ph.intake || {}).pm });
  await done(h);
}

check('14 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (afterbirth)');
process.exit(failed.length ? 1 : 0);
