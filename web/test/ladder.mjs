// Version 39.63, phase E, the doctor ladder's first part (Mohit, 3 Nov: "proceed with phase E"; docs/personal-companion-advice-
// 2026-11-03.md, 4.9; the packet for the doctor: docs/doctor-ladder-packet-2026-11-03.md). UI only:
// - 1 3 taps to a sent call request, no typing: from a sign on Today, from a guide, from Help (with the page she was on as the
//   topic, or her goal's topic on Today); typing still works;
// - 2 the doctor screen stays first in a pregnancy, on the government route, and where no call can be made;
// - 3 one label: "Ask a Qura doctor" on Help's row and the Help page's button ("See a doctor" in a pregnancy);
// - 4 one doctor card on Today: her plan's "Did you get the doctor check?" waits while a sign from her diary shows, and comes
//   back when she puts the sign away ("I've seen a doctor" counts as the check, Version 39.57); a check that covers the sign leads;
// - 5 "See a doctor today": "Call my doctor" first when she saved the number;
// - 7 Version 39.64 (part 2; Mohit, 3 Nov: "Qura first, gynaecologist second"): every sign keeps "Ask a Qura doctor" first, with
//   "See a gynaecologist" or "See a doctor" second where the packet's map says (her own doctor's number if saved; the free
//   government gynaecologist on the government route; else care near her); low mood leads with Tele-MANAS; no line steers her away
//   from the Qura doctor; the trying and midlife tips show on Explore;
// - 6 Hindi at 360 px; no page errors.
// Usage: node test/ladder.mjs [web dir]
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
const DEMO = { app: '0.39.63-demo', platform: 'android' };   /* the stand-in server answers calls */
const PILOT = { app: '0.39.63-pilot', platform: 'android' };   /* no server: no call can be made */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
/* heavy flow on day 2 of her last period, which started `last` days ago */
const heavy = (last) => regular(last).concat([{ d: ago(last - 1), t: 'start_detail', pads: 'pads_4' }]);
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, goals: ['pain'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* My PMOS plan on day 35 (Version 39.57's walk): `skips` gives it a doctor check of its own, which covers her long gaps */
const gaps42 = () => [120, 78, 36].reduce((o, x) => o.concat([{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), []);
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' }, o || {});
const pmosP = (startAgo, ik) => ({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true, seenM: true } }, body: [], intake: CIK(ik) });
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const pmosS = (startAgo, ik, x) => Object.assign({ dob: '1998-05-01', situation: { care: 'private' }, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: pmosP(startAgo, ik) }, reminders: [planRem(startAgo)] }, x || {});

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(o.cfg || DEMO) + ';');
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs, taps: 0 };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
/* a tap she makes, counted */
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); a.taps++; await settle(a.page, 500); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const hashOf = (page) => page.evaluate(() => location.hash);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const topic = (page) => page.$eval('#ac-topic', (e) => e.value).catch(() => null);
const sent = (page) => page.evaluate(() => (window.Saathi.state.calls || []).map((c) => c.topic));

/* ---------- 1. 3 taps to a sent request, no typing ---------- */
{
  let a = await open({ seed: { events: heavy(12) } });
  check('1 a sign on Today: heavy flow', /Heavy flow/.test(await txt(a.page, '#view .xp-home')));
  await tap(a, '#view .xp-home'); await tap(a, '#view .xp-card [data-ask]');
  const t1 = await topic(a.page);
  check('1 ... "Ask a Qura doctor" opens the call form straight away, her topic filled in', (await hashOf(a.page)) === '#ask-call' && !!t1, [await hashOf(a.page), t1]);
  await tap(a, '#ac-send');
  check('1 ... sent in 3 taps from Today, without typing', a.taps === 3 && await has(a.page, '#ac-done') && (await sent(a.page))[0] === t1, [a.taps, await sent(a.page)]);
  await done(a);
  a = await open({ hash: '#a-cycle.heavy-bleeding-how-to-tell' });
  await tap(a, '#art-ask');
  check('1 a guide: its title is the topic', /Heavy bleeding/.test(await topic(a.page) || ''), await topic(a.page));
  await tap(a, '#ac-send');
  check('1 ... sent in 2 taps', a.taps === 2 && await has(a.page, '#ac-done'), a.taps);
  await done(a);
  a = await open({ hash: '#a-cycle.painful-periods' });
  await tap(a, '#help-btn');
  check('1 Help: "Ask a Qura doctor"', /Ask a Qura doctor/.test(await txt(a.page, '#sheet-root #hs-doc')), await txt(a.page, '#sheet-root #hs-doc'));
  await tap(a, '#sheet-root #hs-doc');
  check('1 ... the page she was on is the topic', (await hashOf(a.page)) === '#ask-call' && (await topic(a.page)) === 'Painful periods', [await hashOf(a.page), await topic(a.page)]);
  await tap(a, '#ac-send');
  check('1 ... sent in 3 taps from Help', a.taps === 3 && await has(a.page, '#ac-done'), a.taps);
  await done(a);
  a = await open({});
  await tap(a, '#help-btn'); await tap(a, '#sheet-root #hs-doc');
  const tops = await a.page.$$eval('#view .ac-tops [data-ac-top]', (b) => b.map((x) => [x.dataset.acTop, x.classList.contains('on')]));
  check('1 Help from Today: topics to tap (her goal), the first chosen', tops.length >= 1 && tops[0][1] && (await topic(a.page)) === tops[0][0], tops);
  await tap(a, '#ac-send');
  check('1 ... sent in 3 taps', a.taps === 3 && await has(a.page, '#ac-done'), a.taps);
  await done(a);
  a = await open({ hash: '#a-cycle.painful-periods' });
  await tap(a, '#art-ask'); await a.page.fill('#ac-topic', 'My own words'); await settle(a.page, 200); await tap(a, '#ac-send');
  check('1 typing still works', (await sent(a.page))[0] === 'My own words', await sent(a.page));
  await done(a);
  a = await open({ hash: '#a-cycle.painful-periods' });
  await tap(a, '#art-ask'); await a.page.fill('#ac-topic', ''); await settle(a.page, 200); await tap(a, '#ac-send');
  check('1 an empty topic still asks for one', !(await has(a.page, '#ac-done')) && await has(a.page, '#ac-err'));
  await done(a);
}

/* ---------- 2. Where the doctor screen stays first ---------- */
{
  let a = await open({ seed: { situation: { care: 'private', pregnant: true, pregnantSince: ago(140) }, goals: ['food'], events: [] } });
  await tap(a, '#help-btn');
  check('2 pregnant: Help says "See a doctor"', /See a doctor/.test(await txt(a.page, '#sheet-root #hs-doc')) && !/Ask a Qura doctor/.test(await txt(a.page, '#sheet-root #hs-doc')));
  await tap(a, '#sheet-root #hs-doc');
  check('2 ... and opens the doctor screen (her own doctor first), not the form', (await hashOf(a.page)) === '#ask');
  await done(a);
  a = await open({ seed: { situation: { care: 'govt' } }, hash: '#a-cycle.painful-periods' });
  await tap(a, '#art-ask');
  check('2 the government route: the doctor screen, with the free government doctor', (await hashOf(a.page)) === '#ask' && await has(a.page, '#ask-free'));
  await done(a);
  a = await open({ cfg: PILOT, hash: '#a-cycle.painful-periods' });
  await tap(a, '#art-ask');
  check('2 no call can be made: the doctor screen (WhatsApp or booking)', (await hashOf(a.page)) === '#ask' && !(await has(a.page, '#ask-call')));
  await done(a);
  a = await open({ hash: '#ask' });
  check('2 the doctor screen is still there, with "Ask for a call"', await has(a.page, '#ask-call [data-go="ask-call"]'));
  await done(a);
}

/* ---------- 3. One label ---------- */
{
  const a = await open({ hash: '#help' });
  check('3 the Help page: "Ask a Qura doctor"', /Ask a Qura doctor/.test(await txt(a.page, '#view .doc-card')) && !/Speak to a doctor/.test(await view(a.page)), await txt(a.page, '#view .doc-card'));
  await done(a);
}

/* ---------- 4. One doctor card on Today ---------- */
{
  let a = await open({ seed: pmosS(34, { skips: 'y' }, { events: gaps42().concat([{ d: ago(35), t: 'start_detail', pads: 'pads_4' }]) }) });
  const s1 = { doc: await has(a.page, '#view .pl-sl-doc'), xp: await txt(a.page, '#view .xp-home') };
  check('4 her plan\'s doctor check and a sign it doesn\'t cover: the sign leads, the check waits', !s1.doc && /Heavy flow/.test(s1.xp), s1);
  await go(a.page, 'explain'); const fk = await a.page.evaluate(() => ((window.Saathi.explain.findings() || []).find((f) => f.id === 'flow_heavy') || {}).key);
  await tap(a, '#view [data-xp-got="' + fk + '"]'); await go(a.page, 'home');
  check('4 ... "Got it" on the sign: the plan\'s check comes back', await has(a.page, '#view .pl-sl-doc #pl-doc-yes'));
  await done(a);
  a = await open({ seed: pmosS(34, { skips: 'y' }, { events: gaps42().concat([{ d: ago(35), t: 'start_detail', pads: 'pads_4' }]) }) });
  if (await has(a.page, '#view .xp-seen')) await tap(a, '#view .xp-seen');
  check('4 ... "I\'ve seen a doctor" on the sign: her plan counts its check done and asks what the doctor said (Version 39.57)', await has(a.page, '#view .pl-sl-said') && !(await has(a.page, '#view .pl-sl-doc')));
  await done(a);
  a = await open({ seed: pmosS(34, { skips: 'y' }) });
  check('4 a check that covers the sign still leads (Version 39.57)', await has(a.page, '#view .pl-sl-doc #pl-doc-yes') && !/Your last gap was/.test(await txt(a.page, '#view .xp-home')));
  await done(a);
}

/* ---------- 5. "See a doctor today": her own doctor first ---------- */
{
  const sd = (x) => Object.assign({ situation: { care: 'private', pregnant: true, pregnantSince: ago(140) }, goals: ['food'], events: [], daily: { [ago(1)]: ['d_swell', 'd_headache'] } }, x || {});
  let a = await open({ seed: sd({ mydoc: { tel: '9876500000' } }), hash: '#explain' });
  const b1 = await a.page.$$eval('#view .xp-card.xp-today .xp-acts a, #view .xp-card.xp-today .xp-acts button', (b) => b.map((x) => [x.innerText.trim(), x.classList.contains('primary')]));
  check('5 a sign for today, her doctor saved: "Call my doctor" first, then free care near her', b1[0] && b1[0][0] === 'Call my doctor' && b1[0][1] && await has(a.page, '#view .xp-card.xp-today a.xp-mydoc[href="tel:9876500000"]'), b1);
  await done(a);
  a = await open({ seed: sd(), hash: '#explain' });
  const b2 = await a.page.$$eval('#view .xp-card.xp-today .xp-acts a, #view .xp-card.xp-today .xp-acts button', (b) => b.map((x) => [x.innerText.trim(), x.classList.contains('primary')]));
  check('5 ... without the number: free care near her first, as before', !(await has(a.page, '#view .xp-mydoc')) && b2[0] && b2[0][1], b2);
  await done(a);
}

/* ---------- 7. Part 2: the doctor a sign needs, second ---------- */
const acts = (page, cls) => page.$$eval('#view .xp-card' + (cls || '') + ' .xp-acts a, #view .xp-card' + (cls || '') + ' .xp-acts button', (b) => b.map((x) => ({ t: x.innerText.trim(), p: x.classList.contains('primary'), go: x.dataset.go || x.getAttribute('href') || '' })));
const card = (page, id) => page.evaluate((x) => { const f = (window.Saathi.explain.findings() || []).find((y) => y.id === x); if (!f) return null; const c = [...document.querySelectorAll('#view .xp-card')].find((e) => e.innerText.indexOf(window.Saathi.explain.label(f).t) >= 0); return c ? [...c.querySelectorAll('.xp-acts a, .xp-acts button')].map((b) => ({ t: b.innerText.trim(), p: b.classList.contains('primary'), go: b.dataset.go || b.getAttribute('href') || '' })) : null; }, id);
{
  let a = await open({ seed: { events: heavy(12) }, hash: '#explain' });
  let c = await card(a.page, 'flow_heavy');
  check('7 heavy flow: "Ask a Qura doctor" first, then "See a gynaecologist" (care near her)', c && /Ask a Qura doctor/.test(c[0].t) && c[0].p && c[1].t === 'See a gynaecologist' && !c[1].p && /^access-(care|free)$/.test(c[1].go), c);
  check('7 ... and no line that sends her away from the Qura doctor', !/needs a gynaecologist/i.test(await view(a.page)));
  await done(a);
  a = await open({ seed: { events: heavy(12), mydoc: { tel: '9876500000' } }, hash: '#explain' });
  c = await card(a.page, 'flow_heavy');
  check('7 ... her doctor saved: "See a gynaecologist" calls her number', c && c[1] && c[1].go === 'tel:9876500000', c);
  await done(a);
  a = await open({ seed: { events: heavy(12), situation: { care: 'govt' } }, hash: '#explain' });
  c = await card(a.page, 'flow_heavy');
  check('7 ... the government route: the free government gynaecologist', c && c[1] && c[1].go === 'a-services.see-gynaecologist-government-hospital', c);
  await done(a);
  a = await open({ seed: { checkins: { '2026-11': { at: ago(2), chips: ['burn'], kind: 'cycle' } } }, hash: '#explain' });
  c = await card(a.page, 'burn');
  check('7 burning when she pees: "Ask a Qura doctor", then "See a doctor"', c && /Ask a Qura doctor/.test(c[0].t) && c[1] && c[1].t === 'See a doctor', c);
  await done(a);
  a = await open({ seed: { checkins: { '2026-11': { at: ago(2), chips: ['mood'], kind: 'cycle' } } }, hash: '#explain' });
  c = await card(a.page, 'mood');
  check('7 low mood: Tele-MANAS 14416 first, then "Ask a Qura doctor"', c && c[0].go === 'tel:14416' && c[0].p && /Ask a Qura doctor/.test((c[1] || {}).t || ''), c);
  await done(a);
  a = await open({ seed: { situation: { care: 'private', planning: true }, goals: ['ready'], joined: ago(2), tours: {}, settings: { toursAuto: true, notify: true } }, hash: '#care' });
  await settle(a.page, 1500);
  check('7 the trying-for-a-baby tip shows on Explore, at her questions', /Questions for planning a baby/.test(await txt(a.page, '#tour-root')), await txt(a.page, '#tour-root'));
  await done(a);
}

/* ---------- 6. Hindi at 360 px ---------- */
{
  const a = await open({ seed: { lang: 'hi' }, hash: '#a-cycle.painful-periods' });
  await tap(a, '#help-btn');
  check('6 Hindi: Help\'s row', /Qura की डॉक्टर से पूछें/.test(await txt(a.page, '#sheet-root #hs-doc')));
  await tap(a, '#sheet-root #hs-doc');
  check('6 Hindi: the call form at 360 px, with its topics', (await hashOf(a.page)) === '#ask-call' && await noScroll(a.page) && await has(a.page, '#view .ac-tops'));
  await done(a);
}

check('6 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const fails = results.filter((r) => !r.pass).length;
console.log((fails ? '' : 'page errors none | ') + (results.length - fails) + '/' + results.length + ' passed');
process.exit(fails ? 1 : 0);
