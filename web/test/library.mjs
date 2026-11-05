// Version 39.62, phase D (Mohit, 3 Nov: "proceed with phase D"; docs/personal-companion-advice-2026-11-03.md, 4.6 and decision D3):
// Explore and Learn by her day.
// - 1 Explore's first screen: search, For you (her first 3 tools, then her first 3 questions), her topic, one row to the library,
//   Help and safety; no topic grid, Contents or dos and don'ts there; 12 taps or fewer and about one screen, for 8 women; the line
//   about what Explore holds only in her first week;
// - 2 her questions in the order of her day (her goal, a late period, her pregnancy week, the weeks after a birth, periods stopped);
// - 3 the library: dos and don'ts and her other questions, her topics, the government's free care when it isn't on Explore,
//   Contents; a shared phone keeps the full grid;
// - 4 PLACES-05: the violence, abortion and STI pages 2 taps from every screen through Help, at every stage (her choices page in
//   a pregnancy, no abortion row after a loss), on a shared phone and in discreet mode; none while she joins;
// - 5 Learn's Start here and Today's first-days read follow her day (F4);
// - 6 Hindi at 360 px; no page errors.
// Usage: node test/library.mjs [web dir]
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
const TODAY = '2026-11-03';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Verma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.62-pilot', platform: 'android' };
/* periods every 28 days, 5 days long; the last started `last` days ago */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, goals: ['track'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* one woman per stage, as the census has them (no plan running, so For you and Today's read are hers alone) */
const W = {
  priya: { goals: ['track'] },
  sana: { dob: '1997-02-01', goals: ['pain', 'pms'] },
  anjali: { dob: '1999-02-01', situation: { care: 'private', pcos: true }, goals: ['irregular', 'weight'] },
  neha: { dob: '1996-02-01', situation: { care: 'private', planning: true }, goals: ['ready'] },
  riya: { dob: '2000-02-01', situation: { care: 'private', pregnant: true, pregnantSince: ago(140) }, goals: ['food'], events: regular(154) },
  meera: { dob: '1998-02-01', situation: { care: 'private', deliveredOn: ago(21) }, goals: ['recovery'], events: [] },
  kavita: { dob: '1980-02-01', situation: { care: 'private', midlife: true }, goals: ['hot', 'sleep'] },
  sunita: { dob: '1972-02-01', situation: { care: 'private', stopped: true }, goals: ['hot'], events: regular(400) }
};

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
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
  if (o.mem) { await page.evaluate((m) => { Object.assign(window.Saathi.mem, m); window.Saathi.render(); }, o.mem); await settle(page, 300); }
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const qas = (page) => page.$$eval('#view .qa-sec .qa-tile', (b) => b.map((x) => x.dataset.qa));
const tools = (page) => page.$$eval('#view .care-sec:not(.qa-sec) .list [data-go]', (b) => b.map((x) => x.dataset.go));
/* what she can tap on Explore's first screen, and how many phone screens tall it is (as the census counts them) */
const census = (page) => page.evaluate(() => {
  const v = document.querySelector('#view'); const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const taps = [...new Set([...v.querySelectorAll('button, a[href], [role=button], summary, input:not([type=hidden]), select, textarea, [data-go]')].filter(vis))];
  const keys = taps.map((b) => b.dataset.go || b.dataset.qa || '').filter(Boolean);
  return { taps: taps.length, screens: Math.round(Math.max(document.scrollingElement.scrollHeight, v.scrollHeight) / innerHeight * 10) / 10, dup: keys.filter((k, i) => keys.indexOf(k) !== i) };
});

/* ---------- 1. Explore's first screen, for 8 women ---------- */
const TOPIC = { priya: 'periods', sana: 'periods', anjali: 'periods', neha: 'ttc', riya: 'preg', meera: 'post', kavita: 'meno', sunita: 'meno' };
for (const [who, sd] of Object.entries(W)) {
  const a = await open({ seed: sd, hash: '#care' }); const p = a.page;
  const tl = await tools(p); const q = await qas(p); const c = await census(p);
  check('1 ' + who + ': For you has her first 3 tools at most, and her first 3 questions', tl.length >= 1 && tl.length <= 3 && q.length === 3, { tl, q });
  check('1 ' + who + ': one row for her topic, and one for the library', (await p.$$eval('#view .care-topic', (b) => b.map((x) => x.dataset.go))).join() === 'topic-' + TOPIC[who] && (await p.$$('#view [data-go="library"]')).length === 1, await p.$$eval('#view .care-topic', (b) => b.map((x) => x.dataset.go)));
  check('1 ' + who + ': no topic grid, Contents or dos and don\'ts on the first screen; Help and safety stays', !(await has(p, '#view .topic-grid')) && !(await has(p, '#view .care-contents')) && !(await has(p, '#view .qa-wide')) && (await has(p, '#view [data-go="help"]')));
  check('1 ' + who + ': 12 taps or fewer, about one screen, nothing twice', c.taps <= 12 && c.screens <= 1.4 && !c.dup.length, c);
  await done(a);
}

{
  /* the line that says what Explore holds folds after her first week */
  const a = await open({ seed: Object.assign({}, W.priya, { joined: ago(3) }), hash: '#care' }); const p1 = await has(a.page, '#view .care-p'); await done(a);
  const b = await open({ seed: W.priya, hash: '#care' }); const p2 = await has(b.page, '#view .care-p'); await done(b);
  check('1 Explore\'s line about what it holds: in her first week, not after it', p1 && !p2, [p1, p2]);
}

/* ---------- 2. Her questions in the order of her day ---------- */
{
  let a = await open({ seed: W.sunita, hash: '#care' }); let q = await qas(a.page);
  check('2 Sunita, periods stopped: hot flushes (her goal), then bleeding after menopause', q[0] === 'midlife.hot-flushes-night-sweats' && q[1] === 'midlife.bleeding-after-menopause', q);
  await go(a.page, 'library'); const ql = await qas(a.page);
  check('2 ... and "Periods after 40" nowhere, in Explore or the library', q.concat(ql).indexOf('midlife.periods-after-40') < 0 && ql.length >= 2, ql);
  await done(a);
  a = await open({ seed: W.kavita, hash: '#care' }); q = await qas(a.page); await go(a.page, 'library'); const qk = await qas(a.page);
  check('2 Kavita, periods changing: hot flushes and sleep (her goals) first; bleeding after menopause last, in the library', q[0] === 'midlife.hot-flushes-night-sweats' && q[1] === 'midlife.sleep-mood-dryness-midlife' && qk[qk.length - 1] === 'midlife.bleeding-after-menopause', { q, qk });
  await done(a);
  a = await open({ seed: W.riya, hash: '#care' }); q = await qas(a.page);
  check('2 Riya, 20 weeks: danger signs, then baby\'s movements', q[0] === 'pregnancy.danger-signs-call-112' && q[1] === 'pregnancy.babys-movements', q);
  await done(a);
  a = await open({ seed: Object.assign({}, W.riya, { situation: { care: 'private', pregnant: true, pregnantSince: ago(182) } }), hash: '#care' }); q = await qas(a.page);
  check('2 ... at 26 weeks: the sugar test third', q[2] === 'pregnancy.sugar-test-blood-pressure-pmos', q);
  await done(a);
  a = await open({ seed: { goals: ['track'], events: regular(36) }, hash: '#care' }); q = await qas(a.page);
  check('2 a late period: "Period late?" first', q[0] === 'cycle.missed-period-what-to-do-first', q);
  await done(a);
  a = await open({ seed: W.sana, hash: '#care' }); q = await qas(a.page);
  check('2 Sana, period pain: "Period pain" first', q[0] === 'cycle.painful-periods', q);
  await done(a);
  a = await open({ seed: Object.assign({}, W.meera, { situation: { care: 'private', deliveredOn: ago(50) } }), hash: '#care' }); q = await qas(a.page);
  check('2 Meera, 7 weeks after the birth: contraception after the birth first', q[0] === '#post-contra', q);
  await done(a);
}

/* ---------- 3. The library ---------- */
{
  const a = await open({ seed: W.sana, hash: '#care' }); const p = a.page;
  const qe = await qas(p);
  check('3 a private doctor: Govt. services isn\'t on Explore\'s first screen', !(await has(p, '#view .care-free')));
  await tap(p, '#view [data-go="library"]');
  check('3 the library opens from its row, under the Explore tab, with Back to Explore', (await p.evaluate(() => location.hash)) === '#library' && await has(p, '#tabbar [data-go="care"].on') && /All topics and guides/.test(await view(p)));
  const ql = await qas(p);
  check('3 More questions: her stage\'s dos and don\'ts first, then the questions Explore doesn\'t show', (await p.$eval('#view .qa-sec .qa-wide', (e) => e.dataset.qa).catch(() => '')) === 'cycle.period-dos-and-donts' && ql.length === 3 && !ql.some((k) => qe.indexOf(k) >= 0) && /More questions/.test(await view(p)), { qe, ql });
  const tp = await p.$$eval('#view .topic-grid [data-go]', (b) => b.map((x) => x.dataset.go));
  check('3 her topics, My food second', tp[0] === 'topic-periods' && tp[1] === 'food' && tp.length >= 5, tp);
  check('3 Contents is here, and no Govt. services (Version 39.68: the doctors removed those pages)', !(await has(p, '#view .care-free')) && await has(p, '#view .care-contents [data-go="learn"]'));
  await tap(p, '#view .backrow button, #view [data-back]').catch(() => {});
  await done(a);
  let b = await open({ seed: Object.assign({}, W.sana, { situation: { care: 'govt' } }), hash: '#care' });
  check('3 the government route: no Govt. services on Explore or in the library (Version 39.68)', !(await has(b.page, '#view .care-free')) && (await go(b.page, 'library'), !(await has(b.page, '#view .care-free'))));
  await done(b);
  b = await open({ seed: Object.assign({}, W.sana, { situation: { care: 'none' } }), hash: '#care' });
  check('3 "Nowhere yet": no Govt. services either (Version 39.68)', !(await has(b.page, '#view .care-free')));
  await done(b);
  b = await open({ seed: Object.assign({}, W.sana, { settings: { discreet: true } }), hash: '#care' });
  const dc = await census(b.page);
  check('3 discreet mode: Explore is search, the library and Help; no For you, questions or topic', !(await has(b.page, '#view .care-topic')) && !(await has(b.page, '#view .qa-sec')) && !(await has(b.page, '#view .care-sec')) && await has(b.page, '#view [data-go="library"]') && dc.taps <= 5, dc);
  await go(b.page, 'library'); const dt = await b.page.$$eval('#view .topic-grid [data-go]', (x) => x.map((y) => y.dataset.go));
  check('3 ... the library keeps the full grid, with no food card and no questions', dt.indexOf('topic-preg') >= 0 && dt.indexOf('topic-meno') >= 0 && dt.indexOf('food') < 0 && !(await has(b.page, '#view .qa-sec')), dt);
  await done(b);
}

/* ---------- 4. PLACES-05. Version 39.68 (the doctors' review): Help is on Today only (a reader has its tab), with no Private help; the violence
   and STI pages are gone; the abortion page stays, found by search and from her Missed period topic ---------- */
const STAGES = [
  ['tracking', W.priya, 'pregtest-abortion'], ['trying', W.neha, 'pregtest-abortion'], ['pregnant', W.riya, 'pregtest-options'], ['after a birth', W.meera, 'pregtest-abortion'],
  ['midlife', W.kavita, 'pregtest-abortion'], ['periods stopped', W.sunita, 'pregtest-abortion'],
  ['after a loss', { situation: { care: 'private', pregEndedOn: ago(10) }, goals: ['track'] }, null],
  ['a shared phone', Object.assign({}, W.priya, { settings: { shared: true } }), 'pregtest-abortion'], ['discreet mode', Object.assign({}, W.priya, { settings: { discreet: true } }), 'pregtest-abortion'],
  ['just reading', { stage: 'browse', events: [] }, 'pregtest-abortion']
];
for (const [nm, sd, ab] of STAGES) {
  const browse = sd.stage === 'browse';
  const a = await open({ seed: sd, hash: browse ? '#care' : '#home' }); const p = a.page;
  if (await has(p, '#rest-open')) await tap(p, '#rest-open');   /* a shared phone opens on "Your diary is closed" */
  if (browse) check('4 ' + nm + ': Help is a tab', await has(p, '#tabbar [data-go="help"]'));
  else if (!(await has(p, '#help-btn'))) { check('4 ' + nm + ': the Help button on Today', false, { hash: await p.evaluate(() => location.hash), v: (await view(p)).slice(0, 160), top: await txt(p, '#topbar') }); await done(a); continue; }
  else {
    await tap(p, '#help-btn');
    check('4 ' + nm + ': Help from Today: the nearest hospital (Version 39.70), and no Private help', /Go to the nearest hospital now/.test(await txt(p, '#sheet-root')) && !(await has(p, '#sheet-root .hs-priv')) && !/Private help/.test(await txt(p, '#sheet-root')));
    await p.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(p);
  }
  for (const r of ['intimate-safety', 'intimate-sti']) { await go(p, r); check('4 ' + nm + ': ' + r + ' lands on Explore', (await p.evaluate(() => location.hash)) === '#care'); }
  if (ab) { await go(p, ab); const h = await p.evaluate(() => location.hash); const v = await view(p);
    check('4 ' + nm + ': ' + ab + ' still opens', h === '#' + ab && v.length >= 80 && !/not ready|Needs approval/i.test(v), { h, v: v.slice(0, 120) }); }
  await done(a);
}
{
  const a = await open({ seed: W.priya }); const p = a.page; const where = [];
  for (const r of ['home', 'plan', 'diary', 'care', 'library', 'learn', 'me']) { await go(p, r); if (await has(p, '#help-btn')) where.push(r); }
  check('4 the Help button is on Today only', where.join() === 'home', where);
  for (const [q, r, keep] of [['violence', /intimate-safety/, false], ['sti', /intimate-sti/, false], ['abortion', /pregtest-abortion/, true]]) {
    await go(p, 'care'); await p.fill('#care-q', q); await settle(p, 300);
    const res = await p.$$eval('#view [data-go]', (b) => b.map((x) => x.dataset.go));
    check('4 search "' + q + '" ' + (keep ? 'still finds it' : 'finds no removed page'), keep ? res.some((x) => r.test(x)) : !res.some((x) => r.test(x)), res.slice(0, 6));
    await p.fill('#care-q', ''); await settle(p, 200);
  }
  await done(a);
  /* while she joins: no Help button (Version 39.68: "not needed from the first screen") */
  const j = await open({ seed: { stage: 'onboard' }, hash: '#home' });
  check('4 while she joins: no Help button', !(await has(j.page, '#help-btn')));
  await done(j);
}

/* ---------- 5. Learn's Start here and Today's read follow her day ---------- */
const startHere = async (seed) => { const a = await open({ seed, hash: '#learn' }); const s = await a.page.$eval('#view .learn-next [data-go]', (e) => e.dataset.go.slice(2)).catch(() => ''); await done(a); return s; };
const preg = (days) => Object.assign({}, W.riya, { situation: { care: 'private', pregnant: true, pregnantSince: ago(days) } });
{ const r = await startHere(preg(56)); check('5 pregnant, 8 weeks: her four check-ups (Version 39.68: "Register before 12 weeks" is gone)', r === 'pregnancy.four-antenatal-visits', r); }
check('5 pregnant, 20 weeks: her four check-ups, not "Register before 12 weeks"', (await startHere(preg(140))) === 'pregnancy.four-antenatal-visits');
check('5 pregnant, 28 weeks: the sugar test and her blood pressure', (await startHere(preg(196))) === 'pregnancy.sugar-test-blood-pressure-pmos');
check('5 pregnant, 36 weeks: the signs that mean go now', (await startHere(preg(252))) === 'pregnancy.danger-signs-call-112');
check('5 pregnant, 20 weeks, the check-ups read: the danger signs next', (await startHere(Object.assign(preg(140), { mods: { joy: { reads: { 'pregnancy.four-antenatal-visits': ago(1) } } } }))) === 'pregnancy.danger-signs-call-112');
check('5 3 weeks after the birth: the first six weeks after birth', (await startHere(W.meera)) === 'pregnancy.after-birth-first-six-weeks');
{ const r = await startHere(Object.assign({}, W.meera, { mods: { joy: { reads: { 'pregnancy.after-birth-first-six-weeks': ago(2), 'pregnancy.after-birth-dos-and-donts': ago(1) } } } }));
  check('5 ... with both after-birth guides read: never a pregnancy guide (Version 39.68: the schemes guide is gone)', !/^pregnancy\.(four-antenatal|dos-and-donts|danger-signs|sugar-test|babys-movements|register|government)/.test(r), r); }
check('5 periods stopped, hot flushes: hot flushes, not "Perimenopause: what it is"', (await startHere(W.sunita)) === 'midlife.hot-flushes-night-sweats');
check('5 periods stopped, no goal: bleeding after menopause', (await startHere(Object.assign({}, W.sunita, { goals: [] }))) === 'midlife.bleeding-after-menopause');
check('5 periods changing, no goal: perimenopause first (the book\'s order)', (await startHere(Object.assign({}, W.kavita, { goals: [] }))) === 'midlife.perimenopause-indian-age');
check('5 period pain: painful periods', (await startHere(W.sana)) === 'cycle.painful-periods');
check('5 a late period: what to do first', (await startHere({ goals: ['track'], events: regular(36) })) === 'cycle.missed-period-what-to-do-first');
check('5 trying: the India checklist', (await startHere(W.neha)) === 'conceive.getting-ready-india-preconception-checklist');
check('5 tracking, 28: what a cycle is; never the girls\' guide', (await startHere(Object.assign({}, W.priya, { mods: { joy: { reads: Object.fromEntries(['what-is-a-menstrual-cycle', 'usual-gap-between-periods', 'why-cycles-become-irregular', 'missed-period-what-to-do-first', 'heavy-bleeding-how-to-tell', 'painful-periods', 'spotting-between-periods'].map((k) => ['cycle.' + k, ago(1)])) } } }))) === 'cycle.common-period-myths');
{
  /* Today's read in her first days (no plan) is the same pick */
  const a = await open({ seed: Object.assign(preg(140), { focus: { tile: 'preg', goals: ['food'], at: ago(1) } }) });
  const go2 = await a.page.$$eval('#view [data-go^="a-"]', (b) => b.map((x) => x.dataset.go.slice(2)));
  check('5 Today has no first-days read at 20 weeks (Version 39.68: Learn\'s Start here gives it)', go2.indexOf('pregnancy.four-antenatal-visits') < 0 && go2.indexOf('pregnancy.register-by-12-weeks') < 0, go2);
  await done(a);
}

/* ---------- 6. Hindi at 360 px ---------- */
{
  const a = await open({ seed: Object.assign({}, W.kavita, { lang: 'hi' }), hash: '#care' }); const p = a.page;
  check('6 Hindi: Explore at 360 px, no sideways scroll, the library row in Hindi', await noScroll(p) && /सभी विषय और गाइड/.test(await view(p)));
  await go(p, 'library'); check('6 Hindi: the library at 360 px', await noScroll(p) && /और सवाल/.test(await view(p)));
  await go(p, 'home'); await tap(p, '#help-btn'); check('6 Hindi: Help from Today at 360 px, with no Private help (Version 39.68)', /अभी सबसे पास के अस्पताल जाएँ/.test(await txt(p, '#sheet-root')) && !/निजी मदद/.test(await txt(p, '#sheet-root')) && await noScroll(p));
  await done(a);
}

check('6 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const fails = results.filter((r) => !r.pass).length;
console.log((fails ? '' : 'page errors none | ') + (results.length - fails) + '/' + results.length + ' passed');
process.exit(fails ? 1 : 0);
