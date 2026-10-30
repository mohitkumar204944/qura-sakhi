// Version 39.49: night sweats and sleep (Mohit, 30 Oct: "build the night sweats and sleep link", after the walk through a
// menopause app; MODULE_API section 92). This file checks:
//   1 the midlife plan's hot-flush goal: the evening check-in asks "How did you sleep?" on a card of its own, after her steps and
//     before "How do you feel today?": Well, Okay, Badly and "Hot flushes woke me"; it needs no answer;
//   2 "Hot flushes woke me": her answer kept; Hot flushes and Poor sleep in her diary today (once each, also when she had tapped
//     Hot flushes already); tonight's card: keep the room cool, the hot-flush routine (it opens) and yoga nidra, what was noted;
//   3 Badly: the hard night as before (Poor sleep only); Well: no card;
//   4 who is asked: the sleep goal (the fourth answer only with hot flushes in her diary in the last 30 days), not the mood
//     goal; discreet mode and a shared phone keep three answers; a 30-year-old's bedtime step keeps three;
//   5 the doctor's card from her diary: hot flushes and poor sleep on the same day on 3 of the last 14 days (not 2, not older
//     ones, not under 45); with her check-in's "Woke me at night" too, one card with the count;
//   6 the report for her doctor: the days in her last 28 with both;
//   7 Hindi at 360 px; no page errors.
// Usage: node test/nightsweats.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'nightsweats'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.Audio = class { constructor(src) { this.src = src; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Kamla Devi', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.49-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', hot: 'd', rsleep: 'd', calm: 'd', food: 'd', sleep: 'd', yoga: 'd' } }; return l; };
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: logged(startAgo, 5), weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
/* a woman of 47 whose periods still come, on the midlife plan's goal g since 9 days ago */
const meno = (g, x) => Object.assign({ dob: '1979-03-01', intake: { goal: g, stage: 'meno' }, events: regular(20), mods: { plan: planOf('meno', g, 9) }, reminders: [planRem(9)] }, x || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

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
  await page.clock.install({ time: at(o.hm || '20:30') });
  await page.goto(PAGE + (o.hash || '#plan-checkin'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* "Done" for every step the check-in asks */
const answerSteps = async (page) => { await page.$$eval('#view .pl-ci .chips', (gs) => gs.forEach((g) => { const b = g.querySelector('[data-ci$=":d"]'); if (b) b.click(); })); await settle(page, 200); };
const slpAnswers = (page, sel) => page.$$eval(sel || '#view [data-ci-slp]', (b) => b.map((x) => x.innerText.trim()));
const hotCard = (page) => page.evaluate(() => (window.Saathi.explain.findings() || []).filter((f) => f.id === 'm_hot').map((f) => ({ lv: f.lv, k: (f.vars || {}).k, w2: !!f.w2 })));
/* the full card, as "What this means" opens it */
const cardsText = async (page) => { await go(page, 'explain'); return view(page); };
const BOTH = ['d_hotflush', 'd_sleep'];

/* ---------- 1 and 2: the hot-flush goal's check-in ---------- */
{
  const a = await open({ seed: meno('hot') });
  check('1 the hot-flush goal: "How did you sleep?" on a card of its own', /How did you sleep\?/i.test(await txt(a.page, '#view .pl-ci-slpc')));
  const ans = await slpAnswers(a.page, '#view .pl-ci-slpc [data-ci-slp]');
  check('1 ... Well, Okay, Badly and "Hot flushes woke me"', JSON.stringify(ans) === JSON.stringify(['Well', 'Okay', 'Badly', 'Hot flushes woke me']), ans);
  const pos = await a.page.evaluate(() => ['#view .card.pl-ci', '#view .pl-ci-slpc', '#view .pl-ci-feel'].map((s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + window.scrollY) : -1; }));
  check('1 ... after her steps, before "How do you feel today?"', pos[0] >= 0 && pos[0] < pos[1] && pos[1] < pos[2], pos);
  await shot(a.page, '1-checkin');
  await answerSteps(a.page); await tap(a.page, '#view [data-ci-slp="hot"]'); await tap(a.page, '#pl-ci-save');
  const s = await st(a.page); const dl = s.daily[TODAY] || [];
  check('2 "Hot flushes woke me": her answer kept', (s.mods.plan.log[TODAY] || {}).slp === 'hot', s.mods.plan.log[TODAY]);
  check('2 ... Hot flushes and Poor sleep in her diary today', dl.indexOf('d_hotflush') >= 0 && dl.indexOf('d_sleep') >= 0, dl);
  const nc = await txt(a.page, '#view .pl-night-hot');
  check('2 tonight\'s card: keep the room cool; light cotton and water by her bed; if a flush wakes her, cool down and breathe slowly', /Hot flushes woke you\. Tonight, keep the room cool\./.test(nc) && /Light cotton clothes and water by your bed help some women too\./.test(nc) && /If a flush wakes you, cool down and breathe slowly until it passes\./.test(nc), nc);
  check('2 ... the hot-flush routine (3 min) and yoga nidra', /For hot flushes · 3 min/.test(nc) && /Yoga nidra · \d+ min/.test(nc) && await has(a.page, '#view .pl-night-hot [data-go="relief-hot"]') && await has(a.page, '#view .pl-night-hot [data-go="calm-nidra"]'), nc);
  check('2 ... what was noted, and when to see a doctor', /Noted in your diary as hot flushes and poor sleep\. Woken by them often\? See a doctor: they are treatable\./.test(nc), nc);
  check('2 ... one card: no hard-night card beside it', (await a.page.$$('#view .pl-night')).length === 1);
  await shot(a.page, '2-night-hot');
  await tap(a.page, '#view .pl-night-hot [data-go="relief-hot"]');
  check('2 the routine opens', (await a.page.evaluate(() => location.hash)) === '#relief-hot' && /For hot flushes/.test(await view(a.page)), await a.page.evaluate(() => location.hash));
  await done(a);

  const b = await open({ seed: meno('hot') });
  await tap(b.page, '#view .pl-ci-feel [data-feel="d_hotflush"]');
  await answerSteps(b.page); await tap(b.page, '#view [data-ci-slp="hot"]'); await tap(b.page, '#pl-ci-save');
  const d2 = (await st(b.page)).daily[TODAY] || [];
  check('2 she had tapped Hot flushes already: each once in her diary', d2.filter((k) => k === 'd_hotflush').length === 1 && d2.filter((k) => k === 'd_sleep').length === 1, d2);
  await done(b);

  const n = await open({ seed: meno('hot') });
  await answerSteps(n.page); await tap(n.page, '#pl-ci-save');
  const sn = await st(n.page);
  check('1 it needs no answer: saved without one, nothing noted', (sn.mods.plan.log[TODAY] || {}).ci === 1 && !('slp' in (sn.mods.plan.log[TODAY] || {})) && !(sn.daily[TODAY] || []).length && !(await has(n.page, '#view .pl-night')), sn.mods.plan.log[TODAY]);
  await done(n);
}

/* ---------- 3 Badly and Well ---------- */
{
  const c = await open({ seed: meno('hot') });
  await answerSteps(c.page); await tap(c.page, '#view [data-ci-slp="bad"]'); await tap(c.page, '#pl-ci-save');
  const d3 = (await st(c.page)).daily[TODAY] || [];
  check('3 Badly: the hard night as before, Poor sleep only', /A hard night\. Tonight, let a sound help you sleep\./.test(await txt(c.page, '#view .pl-night')) && !(await has(c.page, '#view .pl-night-hot')) && d3.indexOf('d_sleep') >= 0 && d3.indexOf('d_hotflush') < 0, d3);
  await done(c);
  const w = await open({ seed: meno('hot') });
  await answerSteps(w.page); await tap(w.page, '#view [data-ci-slp="well"]'); await tap(w.page, '#pl-ci-save');
  check('3 Well: no night card, nothing noted', !(await has(w.page, '#view .pl-night')) && !((await st(w.page)).daily[TODAY] || []).length);
  await done(w);
}

/* ---------- 4 who is asked ---------- */
{
  const a = await open({ seed: meno('sleep') });
  check('4 the sleep goal: asked, three answers without hot flushes in her diary', JSON.stringify(await slpAnswers(a.page, '#view .pl-ci-slpc [data-ci-slp]')) === JSON.stringify(['Well', 'Okay', 'Badly']), await slpAnswers(a.page));
  await done(a);
  const b = await open({ seed: meno('sleep', { daily: { [ago(12)]: ['d_hotflush'] } }) });
  check('4 ... the fourth with hot flushes in her diary in the last 30 days', (await slpAnswers(b.page, '#view .pl-ci-slpc [data-ci-slp]')).indexOf('Hot flushes woke me') === 3);
  await done(b);
  const o = await open({ seed: meno('sleep', { daily: { [ago(40)]: ['d_hotflush'] } }) });
  check('4 ... not with older ones', (await slpAnswers(o.page, '#view .pl-ci-slpc [data-ci-slp]')).length === 3);
  await done(o);
  const m = await open({ seed: meno('mood') });
  check('4 the mood goal: not asked', /How do you feel today\?/i.test(await view(m.page)) && !(await has(m.page, '#view .pl-ci-slpc')) && !(await has(m.page, '#view [data-ci-slp]')), await view(m.page));
  await done(m);
  for (const k of ['discreet', 'shared']) {
    const x = await open({ seed: meno('hot', { settings: { [k]: true } }) });
    const v = await view(x.page);
    check('4 ' + (k === 'discreet' ? 'discreet mode' : 'a shared phone') + ': never "Hot flushes woke me"', !/Hot flushes woke me/.test(v) && !(await has(x.page, '#view [data-ci-slp="hot"]')), v.slice(0, 300));
    await done(x);
  }
  const y = await open({ seed: { situation: { pcos: true }, intake: { goal: 'pmos' }, daily: { [ago(3)]: ['d_hotflush'] }, mods: { plan: planOf('cycle', 'pmos', 9) }, reminders: [planRem(9)] } });
  const ya = await slpAnswers(y.page, '#view .pl-ci-slp [data-ci-slp]');
  check('4 a 30-year-old\'s bedtime step: the same three answers, no card of its own', JSON.stringify(ya) === JSON.stringify(['Well', 'Okay', 'Badly']) && !(await has(y.page, '#view .pl-ci-slpc')), ya);
  await done(y);
}

/* ---------- 5 the doctor's card from her diary ---------- */
{
  const a = await open({ hash: '#home', seed: meno('hot', { daily: { [ago(1)]: BOTH, [ago(6)]: BOTH, [ago(13)]: BOTH, [ago(9)]: ['d_hotflush'] } }) });
  const f = await hotCard(a.page);
  check('5 hot flushes and poor sleep on 3 of the last 14 days: the card, this month, with the count', f.length === 1 && f[0].lv === 'month' && f[0].k === 3 && f[0].w2, f);
  const ct = await cardsText(a.page);
  check('5 ... in her words, with a doctor this month and HRT', /Hot flushes waking you at night/.test(ct) && /You noted hot flushes and poor sleep together on 3 of the last 14 days\./.test(ct) && /See a doctor this month\. They can talk you through treatments, including HRT\./.test(ct), ct.slice(0, 900));
  await done(a);
  const b = await open({ hash: '#home', seed: meno('hot', { daily: { [ago(1)]: BOTH, [ago(6)]: BOTH, [ago(14)]: BOTH, [ago(3)]: ['d_sleep'] } }) });
  check('5 2 of the last 14 (one is 14 days ago): no card', !(await hotCard(b.page)).length, await hotCard(b.page));
  await done(b);
  const c = await open({ hash: '#home', seed: { daily: { [ago(1)]: BOTH, [ago(2)]: BOTH, [ago(3)]: BOTH } } });
  check('5 under 45: no card', !(await hotCard(c.page)).length, await hotCard(c.page));
  await done(c);
  const d = await open({ hash: '#home', seed: meno('hot', { daily: { [ago(1)]: BOTH, [ago(2)]: BOTH, [ago(3)]: BOTH }, checkins: { '2026-10': { at: ago(2), kind: 'meno', hot: 'hot_3', chips: [] } } }) });
  const fd = await hotCard(d.page);
  check('5 her check-in\'s "Woke me at night" too: one card, with the count', fd.length === 1 && fd[0].k === 3 && fd[0].w2, fd);
  await done(d);
  const e = await open({ hash: '#home', seed: meno('hot', { checkins: { '2026-10': { at: ago(2), kind: 'meno', hot: 'hot_3', chips: [] } } }) });
  const fe = await hotCard(e.page);
  check('5 her check-in alone: the card as before, without the count', fe.length === 1 && !fe[0].w2 && !/You noted hot flushes/.test(await cardsText(e.page)), fe);
  await done(e);
}

/* ---------- 6 the report for her doctor ---------- */
{
  const a = await open({ hash: '#report', seed: meno('hot', { daily: { [ago(2)]: BOTH, [ago(20)]: BOTH, [ago(27)]: BOTH, [ago(30)]: BOTH } }) });
  const v = await view(a.page);
  check('6 the report: the days in her last 28 with hot flushes and poor sleep together', /Hot flushes and sleep/.test(v) && /Hot flushes and poor sleep on the same day: 3 of the last 28 days/.test(v), v.slice(0, 1500));
  await done(a);
  const b = await open({ hash: '#report', seed: { daily: { [ago(2)]: BOTH } } });
  check('6 ... not under 45', !/Hot flushes and sleep/.test(await view(b.page)));
  await done(b);
}

/* ---------- 7 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, seed: meno('hot', { lang: 'hi' }) });
  const ans = await slpAnswers(a.page, '#view .pl-ci-slpc [data-ci-slp]');
  check('7 hi: "नींद कैसी रही?" with "गर्मी के झोंकों से नींद खुली", no sideways scroll', /नींद कैसी रही\?/.test(await txt(a.page, '#view .pl-ci-slpc')) && ans[3] === 'गर्मी के झोंकों से नींद खुली' && await noScroll(a.page), ans);
  const fit = await a.page.$$eval('#view .pl-ci-slpc [data-ci-slp]', (bs) => bs.every((b) => b.getBoundingClientRect().right <= window.innerWidth + 1));
  check('7 ... every answer inside the screen', fit);
  await answerSteps(a.page); await tap(a.page, '#view [data-ci-slp="hot"]'); await tap(a.page, '#pl-ci-save');
  const nc = await txt(a.page, '#view .pl-night-hot');
  check('7 hi: tonight\'s card', /गर्मी के झोंकों से नींद खुली। आज रात कमरा ठंडा रखें।/.test(nc) && /डॉक्टर को दिखाएँ: इनका इलाज होता है।/.test(nc) && await noScroll(a.page), nc);
  await shot(a.page, '7-hi-night');
  await done(a);
}

check('7 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'NIGHTSWEATS FAIL ' : 'NIGHTSWEATS OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
