// Version 39.8: pictures first (docs/roadmap-v39-2026-10-24.md, section 3; diet audit sections 4 and 5, VD-03, 4.1 to 4.9;
// MODULE_API section 51). This file checks:
//   1 My plate as picture tiles with a mark as well as a colour;  2 "Foods that help" strips on the 4 long food pages;
//   3 Today's cycle card on one line while a plan runs, so her steps sit on the first screen;  4 the plan screen with pictures;
//   5 danger signs as pictures, with the reviewed words under them;  6 a speaker on each card that reads only that card;
//   7 Hindi type;  8 My progress: the weeks to come as outlines, and a line instead of an empty chart;
//   9 joining: a picture on each goal, the veg and non-veg marks;  10 the check-in's symbols and the look-back's faces;
//  11 Explore's quick answers, the iron page and My food with their own drawings;  12 the plate she can tap;
//  13 the picture check for the field-test coordinator (pilot and demo builds only; nothing saved or sent);
//  14 the phones it is built for (Android 10 or later) and the APK size ceiling;  15 Hindi, dark mode, a shared phone, 360 px,
//     no page errors;  16 the 25 Oct review of V39.8 (MODULE_API 51.1).
// Usage: node test/pictures.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'pictures'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'plan', 'learn', 'answer'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
/* a speech engine that writes down what it is asked to say */
const TTS = 'window.__spoken = []; (function () { const vs = [{ name: "English India", lang: "en-IN", localService: true, default: true, voiceURI: "en-IN" }, { name: "Hindi India", lang: "hi-IN", localService: true, default: false, voiceURI: "hi-IN" }];' +
  ' const fake = { speaking: false, pending: false, getVoices: function () { return vs; }, speak: function (u) { window.__spoken.push(u.text); }, cancel: function () {}, pause: function () {}, resume: function () {}, addEventListener: function () {}, removeEventListener: function () {} };' +
  ' try { Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true }); } catch (e) {} window.SpeechSynthesisUtterance = function (t) { this.text = t; }; })();';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.8-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(300), prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID); await ctx.addInitScript(TTS);
  const seed = seedOf(Object.assign({ lang: o.lang || 'en' }, o.seed || {}));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, net };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const count = (page, sel) => page.$$eval(sel, (x) => x.length);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const spoken = (page) => page.evaluate(() => (window.__spoken || []).join(' '));
const errsAll = [];

/* ---------- 1. My plate as picture tiles ---------- */
{
  const a = await open({ hash: '#plan-plate' });
  const tl = await page2tiles(a.page);
  check('1 My plate: the foods are picture tiles (40 or more)', tl.n >= 40, tl);
  check('1 ... and every food has a drawing of its own, not the group icon', tl.drawn === tl.n, tl);
  check('1 ... every tile has a mark as well as a colour, with a spoken name (✓ more often, – less often, ✗ avoid)', tl.marks === tl.n && tl.labelled === tl.n && tl.avoidX && tl.lessDash, tl);
  check('1 ... the tiles sit in 2 columns at most on a 360 px phone, with names at 13 px or more', tl.cols <= 2 && tl.minFont >= 13, tl);
  check('1 ... no sideways scroll', await noScroll(a.page));
  await shot(a.page, '01-plate');
  errsAll.push(...a.errs); await a.ctx.close();
}
async function page2tiles(page) {
  return page.evaluate(() => {
    const ts = Array.from(document.querySelectorAll('#view .food-tile')); const xs = new Set();
    ts.forEach((x) => { if (x.offsetParent) xs.add(Math.round(x.getBoundingClientRect().left)); });
    const fs = ts.filter((x) => x.offsetParent).map((x) => parseFloat(getComputedStyle(x.querySelector('.ft-n')).fontSize));
    return { n: ts.length, drawn: ts.filter((x) => x.querySelector('.ft-art svg.food')).length, marks: ts.filter((x) => x.querySelector('.ft-b')).length,
      labelled: ts.filter((x) => (x.querySelector('.ft-b') || {}).getAttribute && x.querySelector('.ft-b').getAttribute('aria-label')).length,
      avoidX: ts.filter((x) => x.classList.contains('avoid')).every((x) => x.querySelector('.ft-b').textContent === '✗') && ts.some((x) => x.classList.contains('avoid')),
      lessDash: ts.filter((x) => x.classList.contains('less')).every((x) => x.querySelector('.ft-b').textContent === '–') && ts.some((x) => x.classList.contains('less')),
      cols: xs.size, minFont: fs.length ? Math.min.apply(null, fs) : 0 };
  });
}

/* ---------- 2. "Foods that help" strips on the long food pages ---------- */
{
  /* [route, seed, the food section's heading when the page is long and leads with safety (a chip at the top jumps to it)] */
  const pages = [['meno-bones', { dob: '1976-05-01' }], ['preg-diet', PREG(20)], ['periods-fasting', {}, 'Sargi and sehri ideas']];   /* Version 39.68: the anaemia page is gone */
  for (const [r, seed, jump] of pages) {
    const a = await open({ seed, hash: '#' + r });
    const s = await a.page.evaluate(() => { const el = document.querySelector('#view .food-strip'); if (!el) return null; const r0 = el.getBoundingClientRect(); return { n: el.querySelectorAll('.fs-it svg.food').length, top: r0.top + window.scrollY, names: Array.from(el.querySelectorAll('.fs-it > span')).map((x) => x.textContent), say: !!el.querySelector(':scope > .say-b') }; });
    check('2 ' + r + ': a strip of 5 or more food drawings with their names', s && s.n >= 5 && s.names.length === s.n && s.names.every((x) => x.trim().length > 1), s);
    if (!jump) check('2 ' + r + ': ... near the top of the page (within the first 2 screens)', s && s.top < 1600, s);
    else {
      const j = await a.page.evaluate((h) => { const row = document.querySelector('#view .jump-row'); if (!row) return null; const b = Array.from(row.querySelectorAll('.chip')).find((x) => x.textContent === h); return { top: row.getBoundingClientRect().top, n: row.querySelectorAll('.chip').length, has: !!b }; }, jump);
      check('2 ' + r + ': ... a long page that leads with safety: its sections as chips on the first screen, the food one included', j && j.top < 800 && j.n >= 3 && j.has, j);
      await a.page.evaluate((h) => Array.from(document.querySelectorAll('#view .jump-row .chip')).find((x) => x.textContent === h).click(), jump); await settle(a.page, 200);
      const y = await a.page.evaluate(() => document.querySelector('#view .food-strip').getBoundingClientRect().top);
      check('2 ' + r + ': ... one tap on it brings the food drawings into view', y > 0 && y < 700, y);
      await a.page.evaluate(() => window.scrollTo(0, 0));
    }
    if (s && s.say) {
      await a.page.evaluate(() => { window.__spoken = []; document.querySelector('#view .food-strip > .say-b').click(); }); await settle(a.page, 400);
      const said = await spoken(a.page);
      check('2 ' + r + ': ... its speaker reads the foods in the strip', s.names.slice(0, 3).every((x) => said.indexOf(x) >= 0), { said: said.slice(0, 200), names: s.names });
    } else check('2 ' + r + ': ... its speaker reads the foods in the strip', false, s);
    errsAll.push(...a.errs); await a.ctx.close();
  }
}

/* ---------- 3. Today's cycle card while a plan runs: Version 39.23's headline (it replaced Version 39.8's one line) ---------- */
{
  const a = await open({ seed: { intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
  const m = await a.page.evaluate(() => { const h = document.querySelector('#view .hero.head'); const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const rows = Array.from(document.querySelectorAll('#view .today-card .pl-row, #view .today-card .item')).filter((x) => x.querySelector('button')); return { mini: !!h, ht: h ? Math.round(h.getBoundingClientRect().height) : 0, text: h ? h.innerText : '', nav: nav, tops: rows.map((x) => Math.round(x.getBoundingClientRect().top)) }; });
  /* V39.8 review SAFETY-03: "Change stage" sits under her cycle day, so the card is two short lines high */
  /* V39.8 review SAFETY-03, REGRESSIONS-08: one row, "Cycle day N ›" opening her cycle (named "See my cycle") and Change stage */
  const goName = await a.page.$eval('#view .hero.head .hl-go', (e) => e.getAttribute('aria-label')).catch(() => '');
  check('3 a plan running: her cycle heads Today (the ring, "Cycle day", See my cycle, Change stage; Version 39.23)', m.mini && m.ht <= 300 && /Cycle day/.test(m.text) && goName === 'See my cycle' && /Change stage/.test(m.text), { m, goName });
  check('3 ... and her plan\'s first 2 steps start on the first screen at 360 x 800', m.tops.length >= 2 && m.tops.slice(0, 2).every((y) => y < m.nav), m);
  await tap(a.page, '#view .hero.head .hl-go');
  check('3 ... "See my cycle" opens the diary', (await a.page.evaluate(() => location.hash)) === '#diary');
  await shot(a.page, '03-today-head');
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({});
  check('3 no plan: the full cycle card, with its estimate line', !(await has(b.page, '#view .hero.head')) && /not a way to avoid pregnancy/.test(await view(b.page)));
  errsAll.push(...b.errs); await b.ctx.close();
  /* her likely days are 2 days away: the week strip shows them, so the estimate line stays */
  const c = await open({ seed: { events: regular(26), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) } } });
  check('3 a plan running and her likely days on the week strip: the estimate line stays in the headline', (await has(c.page, '#view .hero.head')) && /not a way to avoid pregnancy/.test(await view(c.page)), (await view(c.page)).slice(0, 400));
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) } } });
  check('3 ... and with her dates further off: the headline still shows them, so the estimate line too (Version 39.23)', (await has(d.page, '#view .hero.head')) && /not a way to avoid pregnancy/.test(await txt(d.page, '#view .hero')), await txt(d.page, '#view .hero'));
  errsAll.push(...d.errs); await d.ctx.close();
  const e = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) }, settings: { discreet: true, toursAuto: false } } });
  check('3 a shared phone (discreet mode): no cycle headline, nothing new shown', !(await has(e.page, '#view .hero.head')));
  errsAll.push(...e.errs); await e.ctx.close();
}

/* ---------- 4. The plan screen with pictures ---------- */
{
  const IK = { at: ago(1), stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, food: 'veg', bed: 'b24', work: 'day', when: 'dinner' };
  const a = await open({ seed: { intake: null } });
  await a.page.evaluate((x) => { const S = window.Saathi; S.plan.startFromIntake(x); S.save(); S.mem.rvCard = 1; }, IK); await go(a.page, 'plan-reveal');
  const c2 = await a.page.evaluate(() => { const rows = Array.from(document.querySelectorAll('#view .pl-pic-row')); return { n: rows.length, pics: rows.filter((r) => r.querySelector('svg')).length, why: rows.filter((r) => r.querySelector('details.pl-why-d > summary')).length, words: rows.map((r) => (r.querySelector('strong') || r).textContent.trim().split(/\s+/).length) }; });
  check('4 "Your 3 steps": one picture per step', c2.n >= 2 && c2.pics === c2.n, c2);
  check('4 ... each step\'s reason behind "Why?", and its name short (10 words or fewer)', c2.why === c2.n && c2.words.every((w) => w <= 10), c2);
  const fn1 = await count(a.page, '#view .footnote');
  await tap(a.page, '#pl-rv-next');
  const c3 = await a.page.evaluate(() => { const s = document.querySelector('#view .pl-rv-strip'); return s ? s.querySelectorAll('svg').length : 0; });
  check('4 "How each day works": the day as a strip of 3 pictures (Done, the check-in, Sakhi answers)', c3 === 3, c3);
  const fn2 = await count(a.page, '#view .footnote');
  let fnLast = 0; for (let i = 0; i < 6 && !(await has(a.page, '#pl-rv-go')); i++) await tap(a.page, '#pl-rv-next');
  fnLast = await count(a.page, '#view .footnote');
  check('4 ... the "not a diagnosis" footnote once, on the Start screen only', fn1 === 0 && fn2 === 0 && fnLast === 1, { fn1, fn2, fnLast });
  await shot(a.page, '04-reveal-start');
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 5, 6. Danger signs as pictures; a speaker on each card ---------- */
const DANGER_EN = ['Bleeding', 'Leaking water', 'Fever', 'Severe headache or blurred vision', 'Fits', 'Swelling of face or hands', 'The baby moving less after 28 weeks'];
const DANGER_HI = ['ब्लीडिंग', 'पानी निकलना', 'बुखार', 'तेज़ सिरदर्द या धुंधला दिखना', 'झटके', 'चेहरे या हाथों पर सूजन', '28 हफ़्ते के बाद बच्चा कम हिले'];
for (const lang of ['en', 'hi']) {
  const a = await open({ lang, hash: '#help' });
  const g = await a.page.evaluate(() => { const card = document.querySelector('#view .dgrid') && document.querySelector('#view .dgrid').closest('.card'); const its = Array.from(document.querySelectorAll('#view .dgrid .dg-it'));
    return { n: its.length, pics: its.filter((x) => x.querySelector('svg.sign')).length, words: its.map((x) => x.querySelector('span').textContent), sos: !!(card && card.querySelector('#sos-btn')), cardText: card ? card.innerText : '',
      same: its.every((x) => getComputedStyle(x).color === getComputedStyle(card).color), lab: its.every((x) => getComputedStyle(x.querySelector('span')).opacity === '1') }; });
  const want = lang === 'hi' ? DANGER_HI : DANGER_EN;
  check('5 ' + lang + ': Help\'s "Call 112 now" card shows 7 danger signs as pictures', g.n === 7 && g.pics === 7, g);
  check('5 ' + lang + ': ... with the reviewed words under them, in order', JSON.stringify(g.words) === JSON.stringify(want), g.words);
  check('5 ' + lang + ': ... the words in the card\'s own text colour (readable on the dark card), and the emergency numbers button stays', g.same && g.lab && g.sos, g);
  check('5 ' + lang + ': ... each sign said once in that card (no second list of the same words)', want.every((w) => g.cardText.split(w).length - 1 === 1), g.cardText.slice(0, 500));
  /* 6: a speaker on each card, reading only that card */
  const sp = await a.page.evaluate(() => Array.from(document.querySelectorAll('#view .card[data-say]')).map((c) => !!c.querySelector(':scope > .say-b')));
  check('6 ' + lang + ': every Help card has its own speaker', sp.length >= 5 && sp.every(Boolean), sp);
  await a.page.evaluate(() => { window.__spoken = []; document.querySelector('#view .dgrid').closest('.card').querySelector(':scope > .say-b').click(); }); await settle(a.page, 400);
  const said = await spoken(a.page);
  const other = await a.page.evaluate(() => { const cs = Array.from(document.querySelectorAll('#view .card[data-say]')); const c = cs.find((x) => !x.querySelector('.dgrid')); return c ? (c.querySelector('h3, h2') || c).textContent.trim() : ''; });
  /* the speech engine reads numbers digit by digit ("1 1 2") */
  check('6 ' + lang + ': ... the danger card\'s speaker reads its heading and its signs', said.indexOf(want[0]) >= 0 && said.indexOf(want[5]) >= 0 && (lang === 'hi' ? /1 ?1 ?2/.test(said) : /Call 1 ?1 ?2/.test(said)), said.slice(0, 300));
  check('6 ' + lang + ': ... and not the other cards', other && said.indexOf(other) < 0, { other, said: said.slice(0, 300) });
  check('5 ' + lang + ': 360 px, no sideways scroll', await noScroll(a.page));
  /* 7: Hindi type */
  if (lang === 'hi') {
    const fz = await a.page.evaluate(() => { const p = document.querySelector('#view .card p.small, #view p.small'); const cs = getComputedStyle(p); return { fs: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) }; });
    check('7 Hindi: small text at 15 px with a line height of about 1.65', fz.fs === 15 && Math.abs(fz.lh - 1.65) < 0.05, fz);
  }
  await shot(a.page, '05-help-' + lang);
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* an article: a picture and Listen at the top */
  const a = await open({ hash: '#a-cycle.painful-periods' });
  check('6 an article opens with a picture and a Listen button', await has(a.page, '#view .art-hero svg') && await has(a.page, '#view #art-listen'));
  await a.page.evaluate(() => { window.__spoken = []; }); await tap(a.page, '#art-listen'); await settle(a.page, 400);
  check('6 ... Listen reads the article', /Painful periods/.test(await spoken(a.page)) && /cramping/i.test(await spoken(a.page)), (await spoken(a.page)).slice(0, 200));
  errsAll.push(...a.errs); await a.ctx.close();
  /* Hindi type on the plate tiles */
  const b = await open({ lang: 'hi', hash: '#plan-plate' });
  const fz = await b.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#view .food-tile .ft-n')).fontSize));
  check('7 Hindi: food names on the plate tiles at 15 px', fz === 15, fz);
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 8. My progress: the weeks to come, and a line instead of an empty chart ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(1)) } }, hash: '#plan-progress' });
  const p = await a.page.evaluate(() => ({ bars: document.querySelectorAll('#view .pl-days .pl-dbar:not(.fut)').length, fut: document.querySelectorAll('#view .pl-days .pl-dbar.fut').length, first: (document.querySelector('#view .pl-first') || {}).textContent || '' }));
  check('8 day 2, nothing followed yet: this week\'s bar and 11 outlines for the weeks to come', p.bars === 1 && p.fut === 11, p);
  check('8 ... and a line instead of an empty chart', /Your first bar fills in as you follow your plan this week/.test(p.first), p);
  errsAll.push(...a.errs); await a.ctx.close();
  const lg = {}; lg[ago(1)] = { ck: { move: 'd' }, min: 15 };
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(1), { log: lg }) } }, hash: '#plan-progress' });
  check('8 after one day followed: no line, the bar shows it', !(await has(b.page, '#view .pl-first')) && /\b1\b/.test(await txt(b.page, '#view .pl-days')));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(40)) } }, hash: '#plan-progress' });
  const pc = await c.page.evaluate(() => ({ bars: document.querySelectorAll('#view .pl-days .pl-dbar:not(.fut)').length, fut: document.querySelectorAll('#view .pl-days .pl-dbar.fut').length }));
  check('8 week 6: 6 bars and 6 outlines, 12 weeks in all', pc.bars === 6 && pc.fut === 6, pc);
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 9. Joining: a picture on each goal; the veg and non-veg marks (Version 39.66: on Today's question) ---------- */
{
  const a = await open({ seed: { intake: null }, hash: '#plan-goal' });
  const g = await a.page.evaluate(() => { const rows = Array.from(document.querySelectorAll('#view [data-pl-goal]')); return { n: rows.length, ico: rows.filter((r) => r.querySelector('.ico-sm svg')).length, tall: rows.every((r) => r.getBoundingClientRect().height >= 44) }; });
  check('9 "What do you want to work on?": a picture on every goal row, each row 44 px or taller', g.n >= 6 && g.ico === g.n && g.tall, g);
  errsAll.push(...a.errs); await a.ctx.close();
  /* Version 39.66: how she eats is asked on Today, on the first day her food step comes */
  const f = await open({ seed: { intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', ago(0), { dayAsk: ['food', 'milk'] }) } } });
  const marks = await f.page.evaluate(() => Array.from(document.querySelectorAll('#view .pl-dq [data-pl-dq^="food:"]')).map((b) => b.dataset.plDq + ':' + (b.querySelector('svg.food-mk') ? 'mark' : '-') + ':' + Math.round(b.getBoundingClientRect().height)));
  check('9 ... how she eats, on Today: vegetarian, eggs, fish or meat and Jain each with its mark', marks.length === 4 && marks.every((x) => x.split(':')[2] === 'mark'), marks);
  check('9 ... chips 44 px or taller', marks.length === 4 && marks.every((x) => +x.split(':')[3] >= 44), marks);
  await shot(f.page, '09-today-food');
  errsAll.push(...f.errs); await f.ctx.close();
  const b = await open({ hash: '#food' });
  check('9 My food: the same marks on how she eats', (await count(b.page, '#view [data-food-type] svg.food-mk')) === 4);
  check('11 My food: each food page row with a drawing', (await count(b.page, '#view .food-rows .food-ico svg.food')) >= 2 && (await count(b.page, '#view .food-rows .food-ico svg.food')) === (await count(b.page, '#view .food-rows [data-go]')));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 10. The check-in's symbols; the look-back's faces ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(3)) } }, hash: '#plan-checkin', now: at(0, '20:30') });
  const c = await a.page.evaluate(() => Array.from(document.querySelectorAll('#view [data-ci]')).map((b) => b.dataset.ci.split(':')[1] + ':' + (b.querySelector('svg.ci-sym') ? 'sym' : '-') + ':' + b.textContent.trim()));
  check('10 the check-in: ✓ Done, ½ Partly and ✗ Not today each with its symbol and its word', c.length >= 4 && c.every((x) => x.split(':')[1] === 'sym') && c.some((x) => /^d:sym:Done$/.test(x)) && c.some((x) => /^n:sym:Not today$/.test(x)), c);
  await tap(a.page, '#view [data-ci$=":d"]');
  check('10 ... a tap still picks the answer', (await a.page.$eval('#view [data-ci$=":d"]', (b) => b.getAttribute('aria-pressed'))) === 'true');
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) } }, hash: '#plan' });
  const f = await b.page.evaluate(() => Array.from(document.querySelectorAll('#view [data-pl-e]')).map((x) => x.dataset.plE + ':' + (x.querySelector('svg.face') ? 'face' : '-')));
  check('10 the weekly look-back: Low, Okay and Good with a face each', f.join() === 'low:face,ok:face,good:face', f);
  errsAll.push(...b.errs); await b.ctx.close();
  const c2 = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(20), { weeks: { 1: { e: 'low', seen: 1 }, 2: { e: 'good', seen: 1 } } }) } }, hash: '#plan-progress' });
  check('10 My progress: each week\'s energy with its face', (await count(c2.page, '#view .pl-en svg.face')) === 2);
  errsAll.push(...c2.errs); await c2.ctx.close();
}

/* ---------- 11. Explore's quick answers and the iron page ---------- */
{
  const a = await open({ hash: '#care' });
  const q = await a.page.evaluate(() => { const f = (k) => { const b = document.querySelector('#view .qa-tile[data-qa="' + k + '"]'); return b ? (b.querySelector('svg.sign') ? 'sign' : (b.querySelector('svg.food') ? 'food' : (b.querySelector('svg.spot') ? 'spot' : '-'))) : 'none'; }; return { pain: f('cycle.painful-periods'), late: f('cycle.missed-period-what-to-do-first') }; });
  check('11 quick answers: "Period pain" with its own drawing; the others keep their group\'s picture', q.pain === 'sign' && q.late === 'spot', q);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: PREG(16), hash: '#care' });   /* Version 39.62: before 20 weeks her first 3 questions are danger signs, check-ups and tablets */
  const qb = await b.page.evaluate(() => { const f = (k) => { const x = document.querySelector('#view .qa-tile[data-qa="' + k + '"]'); return x ? (x.querySelector('svg.food') ? 'food' : (x.querySelector('svg.spot') ? 'spot' : '-')) : 'none'; }; return { tablets: f('pregnancy.iron-folic-acid-calcium-td'), danger: f('pregnancy.danger-signs-call-112') }; });
  check('11 pregnancy: "Tablets" with a tablet; "Danger signs" keeps the Help shield', qb.tablets === 'food' && qb.danger === 'spot', qb);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: Object.assign(PREG(20), { mods: { iron: { plan: 'preg', start: ago(20), log: {}, left: 3 } } }), hash: '#iron' });
  check('11 Iron tablets: the tablet drawn on today\'s card, and the strip on "tablets left"', (await has(c.page, '#view .iron-today .iron-pic svg.food')) && (await count(c.page, '#view .iron-pic svg.food')) === 2);
  check('11 ... and still "I took it today"', await has(c.page, '#iron-took'));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 12. The plate she can tap ---------- */
{
  const a = await open({ hash: '#plan-plate' });
  const offN = () => a.page.$$eval('#view .pl-thali .pl-tap .off', (x) => x.length);
  const tip = () => txt(a.page, '#view .pl-thali .pl-th-tip');
  check('12 "What was on your plate today?": the plate empty and 4 parts to tap', (await has(a.page, '#view .pl-thali')) && (await offN()) === 4 && (await count(a.page, '#view .pl-thali [data-pl-th]')) === 4 && /Tap what you ate/.test(await tip()));
  const log0 = JSON.stringify(((await st(a.page)).mods.plan || {}).log || {});
  await tap(a.page, '#view [data-pl-th="grain"]');
  check('12 ... roti: that part fills in, and one gentle line names what she could add', (await offN()) === 3 && (await tip()) === 'Next meal, you could add sabzi and salad.', await tip());
  check('12 ... the chip shows it is picked', (await a.page.$eval('#view [data-pl-th="grain"]', (b) => b.getAttribute('aria-pressed'))) === 'true');
  await tap(a.page, '#view [data-pl-th="veg"]'); await tap(a.page, '#view [data-pl-th="prot"]');
  check('12 ... then the next missing part', (await tip()) === 'Next meal, you could add curd or chaas.', await tip());
  await tap(a.page, '#view [data-pl-th="bowl"]');
  check('12 ... all 4: "A full plate today", no score anywhere', (await offN()) === 0 && (await tip()) === 'A full plate today.' && !/score|%|\/ ?4|out of/i.test(await txt(a.page, '#view .pl-thali')));
  await tap(a.page, '#view [data-pl-th="bowl"]');
  check('12 ... a second tap takes it back', (await offN()) === 1);
  const s1 = await st(a.page);
  check('12 ... only today\'s ticks are kept, and her plan\'s log is untouched', JSON.stringify((s1.mods.plan || {}).thali) === JSON.stringify({ d: TODAY, on: ['grain', 'veg', 'prot'] }) && JSON.stringify((s1.mods.plan || {}).log || {}) === log0, (s1.mods.plan || {}).thali);
  check('12 ... nothing sent', a.net.length === 0, a.net);
  await shot(a.page, '12-plate');
  errsAll.push(...a.errs); await a.ctx.close();
  /* the next day the plate starts empty again */
  const b = await open({ seed: { mods: { plan: { thali: { d: ago(1), on: ['grain', 'veg'] }, log: {} } } }, hash: '#plan-plate' });
  check('12 the next day: an empty plate again', (await b.page.$$eval('#view .pl-thali .pl-tap .off', (x) => x.length)) === 4);
  errsAll.push(...b.errs); await b.ctx.close();
  /* no milk: the bowl is dal or salad; Hindi */
  const c = await open({ lang: 'hi', seed: { mods: { food: { type: 'veg', milk: false } } }, hash: '#plan-plate' });
  await tap(c.page, '#view [data-pl-th="grain"]'); await tap(c.page, '#view [data-pl-th="veg"]'); await tap(c.page, '#view [data-pl-th="prot"]');
  check('12 Hindi, no milk: the bowl is a bowl of dal or salad', (await txt(c.page, '#view .pl-thali .pl-th-tip')) === 'अगली बार थाली में एक कटोरी दाल या सलाद भी रख सकती हैं।', await txt(c.page, '#view .pl-thali .pl-th-tip'));
  check('12 Hindi: 360 px, no sideways scroll', await noScroll(c.page));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 13. The picture check (pilot and demo builds only) ---------- */
{
  const a = await open({ hash: '#me-about' });
  check('13 a pilot build: About has the picture check, for the coordinator', await has(a.page, '#view [data-go="pic-check"]'));
  const ls0 = await a.page.evaluate(() => localStorage.getItem('qura-saathi-v1'));
  await tap(a.page, '#view [data-go="pic-check"]');
  const first = await view(a.page);
  check('13 ... one drawing at a time, its name hidden until asked', /Drawing 1 of \d\d/i.test(first) && !(await has(a.page, '#view .pc-name')) && (await has(a.page, '#view .pc-big svg')), first.slice(0, 300));
  const n = +(/Drawing 1 of (\d+)/i.exec(first) || [0, 0])[1];
  check('13 ... the danger signs and the food drawings (40 or more)', n >= 40, n);
  await tap(a.page, '#pc-show');
  check('13 ... "Show its name" shows it', /Bleeding/.test(await txt(a.page, '#view .pc-name')));
  await tap(a.page, '#view [data-pc="y"]'); await tap(a.page, '#view [data-pc="n"]'); await tap(a.page, '#pc-prev');
  check('13 ... Back one goes back a drawing', /Drawing 2 of/i.test(await view(a.page)));
  for (let i = 1; i < n; i++) await a.page.$eval('#view [data-pc="y"]', (b) => b.click());
  await settle(a.page, 300);
  const res = await view(a.page);
  check('13 ... at the end, her answers to write down', new RegExp('Named ' + (n - 0) + ' of ' + n).test(res) || new RegExp('Named ' + (n - 1) + ' of ' + n).test(res), res.slice(0, 300));
  const ls1 = await a.page.evaluate(() => localStorage.getItem('qura-saathi-v1'));
  check('13 ... nothing saved on the phone, nothing sent', ls0 === ls1 && a.net.length === 0, { same: ls0 === ls1, net: a.net });
  await shot(a.page, '13-piccheck');
  errsAll.push(...a.errs); await a.ctx.close();
  for (const app of ['0.39.8', 'test-0.39']) {
    const b = await open({ config: { app }, hash: '#me-about' });
    check('13 a ' + (app === '0.39.8' ? 'release' : 'tester') + ' build: no picture check in About', !(await has(b.page, '#view [data-go="pic-check"]')));
    await go(b.page, 'pic-check');
    check('13 ... and its address goes back to About', (await b.page.evaluate(() => location.hash)) === '#me-about');
    errsAll.push(...b.errs); await b.ctx.close();
  }
}

/* ---------- 14. The phones it is built for, and the size ceiling ---------- */
/* Mohit, 25 Oct: "build it for newer phones", not very cheap ones. Android 10 is the oldest Android whose Chrome and WebView
   Google still updates, so the app needs no workarounds for old WebViews. */
{
  const sh = fs.readFileSync(path.join(root, '..', 'android', 'build-apk.sh'), 'utf8');
  check('14 the APK needs Android 10 or later (min SDK 29, for the package and the code)', /--min-sdk-version 29 /.test(sh) && /d8" --min-api 29 /.test(sh) && !/min-sdk-version 2[0-8]\b|min-api 2[0-8]\b/.test(sh));
  /* V39.8 review SAFETY-07: a whole number, checked first; and the size is checked before the new APK replaces the last good one */
  const ceil = sh.indexOf('-gt $((MAX_APK_MB * 1024 * 1024))'), mv = sh.indexOf('mv -f build/signed.apk QuraSakhi-prototype.apk');
  check('14 the APK build refuses an APK over its size ceiling (30 MB unless raised on purpose), keeping the last good one', /MAX_APK_MB="\$\{MAX_APK_MB:-30\}"/.test(sh) && /case "\$MAX_APK_MB" in ''\|\*\[!0-9\]\*\)/.test(sh) && ceil > 0 && mv > ceil && !/rm -f QuraSakhi-prototype\.apk/.test(sh), { ceil, mv });
}

/* ---------- 15. Hindi, dark mode, a shared phone, 360 px, no page errors ---------- */
{
  const routes = ['home', 'help', 'plan-plate', 'plan-progress', 'food', 'care', 'a-cycle.painful-periods', 'pic-check', 'plan'];   /* Version 39.68: the anaemia page is gone */
  const bad = [];
  for (const lang of ['en', 'hi']) {
    for (const theme of ['light', 'dark']) {
      const a = await open({ lang, seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) }, settings: { theme, toursAuto: false } } });
      for (const r of routes) { await go(a.page, r); if (!(await noScroll(a.page))) bad.push(lang + '/' + theme + '/' + r); }
      if (theme === 'dark') await go(a.page, 'help'), await shot(a.page, '15-help-dark-' + lang);
      errsAll.push(...a.errs); await a.ctx.close();
    }
  }
  check('15 every V39.8 page at 360 px, in English and Hindi, light and dark: no sideways scroll', bad.length === 0, bad);
  const d = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) }, settings: { discreet: true, toursAuto: false } }, hash: '#plan-plate' });
  check('15 a shared phone: the plate she can tap shows (food words only)', await has(d.page, '#view .pl-thali'));
  await go(d.page, 'help');
  check('15 a shared phone: Help still shows the danger signs (the same for everyone)', (await count(d.page, '#view .dgrid .dg-it')) === 7);
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 16. The 25 Oct review of V39.8 (MODULE_API 51.1): 21 findings confirmed, all fixed ---------- */
{
  /* SAFETY-01, PICTURES-01, REGRESSIONS-01: the danger pictures in each language's own words */
  const OWN = { hi: ['गर्भ में:', 'ब्लीडिंग', 'बुखार', 'सूजन'] };   /* Version 39.68 (the doctors' review): Hindi and English only */
  for (const lang of Object.keys(OWN)) {
    const a = await open({ seed: { lang: lang }, hash: '#help' });
    const g = await a.page.evaluate(() => ({ h: (document.querySelector('#view .dgrid .dg-h') || {}).textContent || '', w: Array.from(document.querySelectorAll('#view .dgrid .dg-it span')).map((x) => x.textContent) }));
    const want = OWN[lang];
    check('16 ' + lang + ': Help\'s danger pictures in her own words, all 7, under her own heading (SAFETY-01)', g.w.length === 7 && g.h === want[0] && g.w[0] === want[1] && g.w.join(' ').indexOf(want[2]) >= 0 && g.w.join(' ').indexOf(want[3]) >= 0 && !/[A-Za-z]{4}/.test(g.w.join(' ').replace(/\(.*?\)/g, '')), g);
    errsAll.push(...a.errs); await a.ctx.close();
  }
  /* SAFETY-03, PICTURES-02, REGRESSIONS-03, PICTURES-10, REGRESSIONS-08: the one-line card */
  const c = await open({ seed: { intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
  const m = await c.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const done = Array.from(document.querySelectorAll('#view .today-card [data-today-act], #view .today-card [data-today-nav], #view .today-card [data-today-undo]')).map((x) => Math.round(x.getBoundingClientRect().bottom)); return { nav: nav, done: done, stage: !!document.querySelector('#view .hero.head #stage-btn') }; });
  check('16 a plan running: "Change stage" stays in the cycle headline (SAFETY-03)', m.stage);
  check('16 ... and her first step\'s button (Done, or Start for her yoga: Version 39.12) sits above the tab bar at 360 x 800 (REGRESSIONS-08; Version 39.23 puts her cycle first)', m.done.length >= 1 && m.done[0] <= m.nav, m);
  errsAll.push(...c.errs); await c.ctx.close();
  /* the ring tour, not yet seen, with tours on: it waits for the full card */
  const T2 = Object.assign({}, TOURS_DONE); delete T2.ring;
  const rt = await open({ seed: { tours: T2, settings: { toursAuto: true }, intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
  await settle(rt.page, 1500);
  const pop = await rt.page.evaluate(() => (document.querySelector('.tour-pop') || {}).textContent || '');
  check('16 ... the ring tour doesn\'t open on the headline, which has no key (PICTURES-10)', !/cycle ring/i.test(pop), pop.slice(0, 120));
  errsAll.push(...rt.errs); await rt.ctx.close();
  const ttcEv = []; for (let k = 6; k >= 0; k--) ttcEv.push({ d: ago(12 + k * 28), t: 'start' }, { d: ago(12 + k * 28 - 5), t: 'end' });
  const tt = await open({ seed: { situation: { planning: true }, goals: ['ttc'], events: ttcEv, intake: { goal: 'ready', stage: 'ttc' }, mods: { plan: planOf('ttc', 'ready', ago(9)) } } });
  const tv = await tt.page.evaluate(() => { const h = document.querySelector('#view .hero'); return { mini: !!document.querySelector('#view .hero.head'), text: h ? h.innerText : '' }; });
  check('16 trying for a baby, her plan running, a fertile day: today\'s chance stays in the headline, with the estimate line (PICTURES-02)', tv.mini && /chance/i.test(tv.text) && /not a way to avoid pregnancy/.test(tv.text), tv);
  errsAll.push(...tt.errs); await tt.ctx.close();
  /* SAFETY-04, PICTURES-03, REGRESSIONS-05: the picture check's results */
  for (const lang of ['en', 'hi']) {
    const p = await open({ lang, seed: { lang }, hash: '#pic-check' });
    await tap(p.page, '#view [data-pc="y"]'); await tap(p.page, '#view [data-pc="n"]'); await tap(p.page, '#view [data-pc="s"]');
    for (let i = 0; i < 80 && await has(p.page, '#view [data-pc="y"]'); i++) await p.page.$eval('#view [data-pc="y"]', (b) => b.click());
    await settle(p.page, 300);
    const pills = await p.page.$$eval('#view .pc-res .pill', (xs) => xs.slice(0, 3).map((x) => x.textContent));
    const want = lang === 'hi' ? ['पहचान लिया', 'नहीं पहचाना', 'छोड़ा'] : ['Named it', 'Not quite', 'Skipped'];
    check('16 ' + lang + ': the picture check\'s answers read "' + want.join('", "') + '" (SAFETY-04)', JSON.stringify(pills) === JSON.stringify(want), pills);
    errsAll.push(...p.errs); await p.ctx.close();
  }
  /* SAFETY-02, PICTURES-05, REGRESSIONS-06: strips follow how she eats and her stage */
  /* Version 39.68 (the doctors' review): the anaemia page and its strip (the one with sprouts) are gone; no strip left shows plain sprouts in a pregnancy */
  const pg = await open({ seed: PREG(20), hash: '#cond-anaemia' });
  check('16 the anaemia page lands on Explore', (await pg.page.evaluate(() => location.hash)) === '#care');
  await go(pg.page, 'preg-diet');
  const pgn = await pg.page.$$eval('#view .food-strip .fs-it > span', (xs) => xs.map((x) => x.textContent));
  check('16 pregnant: her food strip never says plain "Sprouts" (SAFETY-02)', pgn.length >= 5 && pgn.indexOf('Sprouts') < 0, pgn);
  errsAll.push(...pg.errs); await pg.ctx.close();
  const nm = await open({ seed: { mods: { food: { type: 'veg', milk: false } } }, hash: '#periods-fasting' });
  const nmn = await nm.page.$$eval('#view .food-strip .fs-it > span', (xs) => xs.map((x) => x.textContent));
  check('16 no milk: the fasting strip shows no curd, paneer or chaas (REGRESSIONS-06)', nmn.length >= 5 && !nmn.some((x) => /Curd|Paneer|Chaas/.test(x)), nmn);
  errsAll.push(...nm.errs); await nm.ctx.close();
  const mb = await open({ seed: { dob: '1976-05-01', situation: { stopped: true }, events: [], mods: { food: { type: 'veg', milk: false } } }, hash: '#food' });
  check('16 midlife, no milk: My food\'s calcium row draws ragi, not milk (PICTURES-05)', await mb.page.evaluate(() => { const r = document.querySelector('#view .food-rows [data-go="meno-bones"] .food-ico'); const tmp = document.createElement('div'); tmp.innerHTML = window.Saathi.art.food('ragi'); return !!r && r.innerHTML === tmp.innerHTML; }));
  errsAll.push(...mb.errs); await mb.ctx.close();
  /* PICTURES-06: the 4th month's extra */
  const w8 = await open({ seed: PREG(8), hash: '#preg-diet' }); const w20 = await open({ seed: PREG(20), hash: '#preg-diet' });
  check('16 pregnancy food: the "1 roti + 1 katori dal + 1 glass milk" picture only from week 13 (PICTURES-06)', !(await has(w8.page, '#view .food-sum')) && (await has(w20.page, '#view .food-sum')));
  errsAll.push(...w8.errs, ...w20.errs); await w8.ctx.close(); await w20.ctx.close();
  /* SAFETY-06, PICTURES-04: dish words first; less rice is not rice; sweets are a sweet */
  const f = await open({});
  const arts = await f.page.evaluate(() => { const S = window.Saathi; const a = (g, n) => S.food.artOf([g, n]); return { lessRice: a('grain', 'Less rice, more dal and sabzi'), upma: a('grain', 'Millet upma: foxtail, little millet'), bhakri: a('grain', 'Nachni (ragi) bhakri'), sweets: a('snack', 'Sugar, mithai, sweets made with gur') }; });
  check('16 My plate: "Less rice, more dal" is dal, millet upma is upma, nachni bhakri is bhakri, sweets a laddoo (SAFETY-06)', arts.lessRice === 'dal' && arts.upma === 'upma' && arts.bhakri === 'bhakri' && arts.sweets === 'laddoo', arts);
  /* PICTURES-11: the picture check covers every drawing a food screen shows */
  const gap = await f.page.evaluate(() => { const S = window.Saathi; const T = S.food.table; const all = [].concat(T.MORE, T.LESS, T.AVOID); Object.keys(T.LOCAL).forEach((k) => T.LOCAL[k].forEach((x) => all.push(x))); const keys = new Set(all.map((x) => S.food.artOf(x)).filter(Boolean)); return Array.from(keys); });
  await go(f.page, 'pic-check'); const nPic = +(/of (\d+)/i.exec(await view(f.page)) || [0, 0])[1];
  check('16 the picture check has every drawing My plate shows, and the produce drawings the strips use (61 in all)', nPic === 61 && gap.length > 30, { nPic, gap: gap.length });
  errsAll.push(...f.errs); await f.ctx.close();
  /* PICTURES-08, PICTURES-09: speakers that read their own card, show a stop state, and are 44 px */
  const h = await open({ hash: '#help' });
  await h.page.evaluate(() => { window.__spoken = []; const cs = Array.from(document.querySelectorAll('#view .card[data-say]')); cs[0].querySelector(':scope > .say-b').click(); }); await settle(h.page, 300);
  const on1 = await h.page.$$eval('#view .say-b.on', (x) => x.length);
  await h.page.evaluate(() => { window.__spoken = []; const cs = Array.from(document.querySelectorAll('#view .card[data-say]')); cs[1].querySelector(':scope > .say-b').click(); }); await settle(h.page, 400);
  const second = await h.page.evaluate(() => { const cs = Array.from(document.querySelectorAll('#view .card[data-say]')); return { said: (window.__spoken || []).join(' '), head: (cs[1].querySelector('h3') || cs[1]).textContent.trim(), pressed: cs[1].querySelector(':scope > .say-b').getAttribute('aria-pressed'), firstOn: cs[0].querySelector(':scope > .say-b').classList.contains('on') }; });
  check('16 a second card\'s speaker stops the first and reads its own card, showing it is on (PICTURES-08)', on1 === 1 && second.said.indexOf(second.head.replace(/1 ?1 ?2/, '')) >= 0 && second.pressed === 'true' && !second.firstOn, second);
  const sizes = await h.page.$$eval('#view .say-b', (xs) => xs.map((x) => { const b = x.getBoundingClientRect(); return Math.min(b.width, b.height); }));
  check('16 every speaker is a 44 px target (PICTURES-09)', sizes.length > 3 && sizes.every((s) => s >= 44), sizes);
  const overlap = await h.page.evaluate(() => { const g = document.querySelector('#view .dgrid > .say-b'); const t0 = document.querySelector('#view .dgrid .dg-it'); if (!g || !t0) return null; const a = g.getBoundingClientRect(), b = t0.getBoundingClientRect(); return a.bottom <= b.top + 1; });
  check('16 ... and the danger grid\'s speaker sits above its pictures, not on one', overlap === true, overlap);
  errsAll.push(...h.errs); await h.ctx.close();
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'OK ') + (results.length - failed.length) + '/' + results.length + ' checks (pictures)');
process.exit(failed.length ? 1 : 0);
