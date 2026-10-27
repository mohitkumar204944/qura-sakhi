// Version 39.23: her cycle first on Today, a plan day that ends at 4 am, and period dates easy to fix (Mohit, 27 Oct: "What time
// will app show next day i logged last night and its next day 11:40 AM still i am on same day", then "yes make a mockup first"
// and "go ahead and build it"; the mockup: claude.ai/artifact/RTA92ajojk5uXeLtgVC5jm; MODULE_API section 66). This file checks:
//   1 Today while her plan runs: her cycle is the headline (the ring, the days to her next period, the likely dates), her 3 logs
//     in the same card ("How I feel" as in the + menu), "Change stage" (SAFETY-03), then her plan; the row opens her cycle; a
//     late period says how late, the usual gap and "Period late?"; a shared phone sees her cycle day only; discreet mode as before;
//   2 the plan day ends at 4 am: at 12:30 am her plan still shows Tuesday ("Still Tuesday's plan", "How did Tuesday go?"), a
//     tick, a wind-down session and her garden's petal count for Tuesday, her check-in reminder stays on for Wednesday; at 4 am
//     Wednesday starts;
//   3 "Edit period dates" under the calendar: tap the days she bled (none after today), Save rewrites only what she changed,
//     Undo and Cancel; not in a pregnancy; plain words in discreet mode;
//   4 Cycles with one period: "Add a past period" in place of "Add today", her numbers as a faded example; the sheet (the day it
//     started, a guess is fine, how many days) adds a start and an end, and her first gap shows;
//   5 English and Hindi at 360 px, and no page errors.
// Usage: node test/cyclefirst.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'cyclefirst'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const AUDIO = 'window.__audio = []; window.Audio = class { constructor(src) { this.src = src; this.paused = true; this.ended = false; this.currentTime = 0; this.duration = NaN; this.loop = false; this.volume = 1; window.__audio.push(this); } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.23-pilot', platform: 'android' };
/* three periods 28 days apart, the last `last` days ago, 6 days each */
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 5), t: 'end' })); return out; };
const ONE = [{ d: ago(10), t: 'start' }, { d: ago(5), t: 'end' }];   /* her first period in the diary: 17 to 22 October */
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd', yoga: 'd' }, plate: { half: true } }; return l; };
const planOf = (startAgo, extra) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: logged(startAgo, 5), weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, intake: { goal: 'pmos' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: { plan: planOf(37) } }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(o.hm || '09:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const sheet = (page) => page.$eval('#sheet-root', (e) => e.innerText.replace(/\s+/g, ' ')).catch(() => '');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: false });
const events = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.events)).map((e) => e.d + ':' + e.t).sort());
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.plan)));
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };

/* ---------- 1 Today: her cycle first ---------- */
{
  const a = await open();
  const h = await a.page.evaluate(() => { const hero = document.querySelector('#view .card.hero'); const card = document.querySelector('#view .today-card');
    return { head: !!hero && hero.classList.contains('head'), ring: !!(hero && hero.querySelector('.hl-row .ringwrap')), n: (hero && hero.querySelector('.cd-big .cd-n') || {}).textContent || '',
      say: hero ? hero.querySelector('.hl-say').innerText.replace(/\s+/g, ' ') : '', logs: hero ? Array.from(hero.querySelectorAll('.hl-logs .ract .rl')).map((x) => x.textContent) : [],
      stage: !!(hero && hero.querySelector('#stage-btn')), mini: !!document.querySelector('.hero-mini'), below: !!(hero && card && (hero.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING)),
      outside: !!document.querySelector('#view > .ract-row, #view .ract-row:not(.hl-logs)'), note: hero ? /not a way to avoid pregnancy/.test(hero.innerText) : false }; });
  check('1 her plan running: her cycle is the headline card, with the ring', h.head && h.ring && !h.mini, h);
  check('1 ... the days to her next period, big, and the likely dates from her cycles', h.n === '18' && /18 days until your next period/.test(h.say) && /Likely 11–17 Nov · from your last 2 cycles/.test(h.say), h);
  check('1 ... her 3 logs inside the same card: Period started, Spotting, How I feel (the + menu\'s name)', JSON.stringify(h.logs) === JSON.stringify(['Period started', 'Spotting', 'How I feel']) && !h.outside, h);
  check('1 ... "Change stage" stays in it (SAFETY-03), the dates are estimates line too, and her plan comes below', h.stage && h.note && h.below, h);
  await shot(a.page, '1-today');
  await a.page.$eval('#view .hl-say', (e) => e.click()); await settle(a.page, 500);
  check('1 ... a tap on the headline opens her cycle (the Diary)', (await a.page.evaluate(() => location.hash)) === '#diary');
  await go(a.page, 'home');
  check('1 ... the chevron says "See my cycle" to a screen reader', (await a.page.$eval('#view .hl-go', (e) => e.getAttribute('aria-label') + '|' + e.dataset.go)) === 'See my cycle|diary');
  await done(a);

  /* 360 x 800: no sideways scroll; the headline and her plan's first step on the first screen */
  const s = await open({ w: 360, h: 800 });
  const f = await s.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const st = document.querySelector('#view .today-card .today-it'); const hd = document.querySelector('#view .card.hero');
    return { nav: Math.round(nav), step: st ? Math.round(st.getBoundingClientRect().top) : 9999, hero: hd ? Math.round(hd.getBoundingClientRect().bottom) : 9999 }; });
  check('1 at 360 x 800: no sideways scroll, and her plan starts on the first screen under the headline', await noScroll(s.page) && f.hero < f.nav && f.step < f.nav, f);
  await shot(s.page, '1-today-360');
  await done(s);

  /* a late period: how late, the usual gap, and "Period late?" */
  const l = await open({ seed: { events: regular(36) } });
  const lt = await txt(l.page, '#view .card.hero');
  check('1 a late period: "Your period is 5 days late" and the usual gap', /Your period is 5 days late/.test(lt) && /Typical gap 21–35 days/.test(lt), lt);
  check('1 ... and "Period late?" with the home-test line, which opens the pregnancy test guide', (await txt(l.page, '#view .hl-late-go')).indexOf('Period late? A week or more late and you could be pregnant? A home test is the first step.') === 0 && (await l.page.$eval('#view .hl-late-go', (e) => e.dataset.go)) === 'pregtest');
  await shot(l.page, '1-late');
  await done(l);

  /* a shared phone: her cycle day only, no dates; discreet mode keeps its own hero */
  const sh = await open({ seed: { settings: { shared: true } } }); await tap(sh.page, '#rest-open');
  const st = await txt(sh.page, '#view .card.hero .hl-say');
  check('1 a shared phone: the headline says only her cycle day, no dates or countdown', /^Cycle day 11$/.test(st) && !(await has(sh.page, '#view .card.hero .cd-from')), st);
  await done(sh);
  const dc = await open({ seed: { settings: { discreet: true } } });
  check('1 discreet mode: the hidden number as before, no headline', !(await has(dc.page, '#view .card.hero.head')) && /Hidden for privacy/.test(await txt(dc.page, '#view .card.hero')));
  await done(dc);
}

/* ---------- 2 the plan day ends at 4 am ---------- */
{
  const tue = planOf(37); tue.log[TODAY] = { ck: { yoga: 'd', food: 'd' }, plate: { half: true } };
  const a = await open({ seed: { mods: { plan: tue } }, now: at('00:30', iso(TODAY, 1)) });
  await a.page.evaluate((s) => window.Saathi.reminders.upsert({ id: 'plan', mod: 'plan', title: 'Check-in', start: s, every: 1, time: '20:00', on: true }), ago(37));
  check('2 at 12:30 am on Wednesday her plan day is still Tuesday', (await a.page.evaluate(() => window.Saathi.toISO(window.Saathi.planToday()) + '|' + window.Saathi.toISO(window.Saathi.today()))) === TODAY + '|' + iso(TODAY, 1));
  const nb = await txt(a.page, '#view .today-card .pl-night-day');
  check('2 ... Today says so: "Still Tuesday’s plan", ends at 4 am', nb === 'Still Tuesday’s plan Your plan day ends at 4 am, so this counts for Tuesday.', nb);
  check('2 ... and its check-in is open: "How did Tuesday go?"', (await txt(a.page, '#view .today-card .pl-t-ci')) === 'How did Tuesday go?');
  await shot(a.page, '2-night');
  await tap(a.page, '#view .today-card .today-plan-move [data-today-act]');
  const p1 = await plan(a.page);
  check('2 ... a tick after midnight counts for Tuesday', (p1.log[TODAY].ck || {}).move === 'd' && !p1.log[iso(TODAY, 1)], p1.log[TODAY]);
  await go(a.page, 'plan-checkin');
  check('2 ... the check-in asks "How did Tuesday go?"', /How did Tuesday go\?/.test(await txt(a.page, '#view .backrow')), await txt(a.page, '#view .backrow'));
  await go(a.page, 'plan');
  check('2 ... My plan shows the same note', /Still Tuesday’s plan/.test(await txt(a.page, '#view .pl-steps-card')));
  await tap(a.page, '#view .pl-st-play'); await settle(a.page, 31000);
  check('2 ... a wind-down session after midnight counts for Tuesday\'s bedtime step', !!(await a.page.evaluate((d) => window.Saathi.calm.doneOn(d), TODAY)) && !(await a.page.evaluate((d) => window.Saathi.calm.doneOn(d), iso(TODAY, 1))));
  await go(a.page, 'home'); await settle(a.page, 400);
  const p2 = await plan(a.page); const joy = await a.page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods.joy || {}).days || {})));
  const r = await a.page.evaluate(() => { const x = window.Saathi.reminders.get('plan'); return x ? x.doneOn || null : 'none'; });
  check('2 ... all 4 done: Tuesday closes (its petal on Tuesday), and the check-in reminder is done for Tuesday, so Wednesday\'s still rings', (p2.log[TODAY] || {}).fd === 1 && (joy[TODAY] || []).indexOf('checkin') >= 0 && !(joy[iso(TODAY, 1)] || []).length && r === TODAY, { fd: (p2.log[TODAY] || {}).fd, joy: joy, r: r });
  await a.page.clock.fastForward('03:31:00'); await settle(a.page, 1200);
  check('2 at 4 am Wednesday starts: no night note, plan day 39', (await a.page.evaluate(() => window.Saathi.toISO(window.Saathi.planToday()))) === iso(TODAY, 1) && !(await has(a.page, '#view .pl-night-day')) && /plan day 39/i.test(await txt(a.page, '#view .today-card')), await txt(a.page, '#view .today-card'));
  await done(a);
}

/* ---------- 3 Edit period dates ---------- */
{
  const a = await open({ hash: '#diary', seed: { mods: {}, events: ONE } });
  check('3 the calendar: "Edit period dates" under the month', (await txt(a.page, '#view #cal-edit')) === 'Edit period dates');
  await tap(a.page, '#view #cal-edit');
  const c0 = await a.page.evaluate(() => ({ h: document.querySelector('#view .cal-edit').innerText.replace(/\s+/g, ' '), on: Array.from(document.querySelectorAll('#view [data-ed].bleed')).map((b) => b.dataset.ed), n: document.querySelectorAll('#view [data-ed]').length, fut: document.querySelectorAll('#view .ce-fut').length }));
  check('3 ... edit mode: tap the days she bled, her period marked, no day after today', /Tap the days you bled\. Tap a day again to take it off\./.test(c0.h) && /Days after today can’t be marked\./.test(c0.h) && c0.on.join(',') === [17, 18, 19, 20, 21, 22].map((d) => '2026-10-' + d).join(',') && c0.n === 27 && c0.fut === 4, c0);
  await shot(a.page, '3-edit');
  await tap(a.page, '#view [data-ed="2026-10-17"]'); await tap(a.page, '#view [data-ed="2026-10-23"]');
  await tap(a.page, '#view #ce-save');
  check('3 ... Save: her period now starts on the 18th and ends on the 23rd', JSON.stringify(await events(a.page)) === JSON.stringify(['2026-10-18:start', '2026-10-23:end']), await events(a.page));
  check('3 ... and the calendar is back, with Undo', (await has(a.page, '#view #cal-edit')) && /Undo/.test(await a.page.$eval('body', (e) => e.innerText)));
  await a.page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === 'Undo'); if (b) b.click(); }); await settle(a.page, 400);
  check('3 ... Undo puts her dates back', JSON.stringify(await events(a.page)) === JSON.stringify(['2026-10-17:start', '2026-10-22:end']), await events(a.page));
  /* a period in the month before, from the calendar: her first gap */
  await tap(a.page, '#view #cal-edit'); await tap(a.page, '#view #cal-prev');
  for (const d of ['18', '19', '20', '21', '22']) await tap(a.page, '#view [data-ed="2026-09-' + d + '"]');
  await tap(a.page, '#view #ce-cancel');
  check('3 ... Cancel changes nothing', JSON.stringify(await events(a.page)) === JSON.stringify(['2026-10-17:start', '2026-10-22:end']));
  await tap(a.page, '#view #cal-edit');
  for (const d of ['18', '19', '20', '21', '22']) await tap(a.page, '#view [data-ed="2026-09-' + d + '"]');
  await tap(a.page, '#view #ce-save');
  check('3 ... September\'s period added: a start and an end, and October\'s untouched', JSON.stringify(await events(a.page)) === JSON.stringify(['2026-09-18:start', '2026-09-22:end', '2026-10-17:start', '2026-10-22:end']), await events(a.page));
  await tap(a.page, '#view [data-tab="tr"]');
  check('3 ... and Cycles shows her first gap: 29 days', /29-day cycle/.test(await txt(a.page, '#view .mc-card')), await txt(a.page, '#view .mc-card'));
  await done(a);

  const p = await open({ hash: '#diary', seed: { mods: {}, situation: { pregnant: true, pregnantSince: ago(60) } } });
  check('3 in a pregnancy: no "Edit period dates"', !(await has(p.page, '#view #cal-edit')));
  await done(p);
  const d = await open({ hash: '#diary', seed: { mods: {}, events: ONE, settings: { discreet: true } } });
  await tap(d.page, '#view #cal-edit');
  check('3 discreet mode: "Edit dates", and the line in plain words', (await txt(d.page, '#view .cal-edit h2')) === 'Edit dates' && /Tap the days to mark them\./.test(await txt(d.page, '#view .cal-edit')));
  await done(d);
}

/* ---------- 4 Cycles with one period: Add a past period ---------- */
{
  const a = await open({ hash: '#diary', seed: { mods: {}, events: ONE } });
  await tap(a.page, '#view [data-tab="tr"]');
  const v = await txt(a.page, '#view');
  check('4 Cycles with one period: My cycles shows it, with "Add a past period" (no "Add today")', /My cycles/.test(v) && /17 Oct – now/.test(v) && (await txt(a.page, '#view #ap-add')) === 'Add a past period' && !(await has(a.page, '#view #tr-log')), v.slice(0, 400));
  check('4 ... and her numbers as a faded example that says what it needs', /Your numbers Example/.test(await txt(a.page, '#view .ex-card')) && /Log two period starts to see the gap between them\./.test(await txt(a.page, '#view .ex-card')) && (await a.page.$eval('#view .ex-tiles', (e) => e.getAttribute('aria-hidden'))) === 'true');
  await shot(a.page, '4-cycles');
  await tap(a.page, '#view #ap-add');
  const s0 = await sheet(a.page);
  check('4 the sheet: when did it start (a guess is fine), September first, Save waits for a day', /Add a past period/.test(s0) && /When did it start\?/.test(s0) && /A guess is fine\. You can fix it later\./.test(s0) && /September 2026/.test(s0) && (await a.page.$eval('#ap-save', (b) => b.disabled)), s0);
  await tap(a.page, '#sheet-root #ap-next');
  check('4 ... days inside or near her period can\'t be picked, nor days after today', (await a.page.$eval('#sheet-root [data-ap="2026-10-20"]', (b) => b.disabled)) && (await a.page.$eval('#sheet-root [data-ap="2026-10-09"]', (b) => b.disabled)) && (await a.page.$eval('#sheet-root [data-ap="2026-10-28"]', (b) => b.disabled)) && !(await a.page.$eval('#sheet-root [data-ap="2026-10-06"]', (b) => b.disabled)));
  await tap(a.page, '#sheet-root #ap-prev');
  await tap(a.page, '#sheet-root [data-ap="2026-09-18"]');
  const s1 = await a.page.evaluate(() => ({ len: document.querySelector('#sheet-root .ap-step b').textContent, lt: Array.from(document.querySelectorAll('#sheet-root .ap-d.light')).map((b) => b.dataset.ap), save: document.querySelector('#ap-save').disabled }));
  check('4 ... a day picked: her usual length (6 days) shows on the calendar, and Save is ready', s1.len === '6 days' && s1.lt.length === 5 && !s1.save, s1);
  await shot(a.page, '4-sheet');
  await tap(a.page, '#sheet-root #ap-minus');
  await tap(a.page, '#sheet-root #ap-save');
  check('4 ... Save adds its start and end (5 days)', JSON.stringify(await events(a.page)) === JSON.stringify(['2026-09-18:start', '2026-09-22:end', '2026-10-17:start', '2026-10-22:end']), await events(a.page));
  check('4 ... and her first gap shows: 29 days; the example goes', /29-day cycle/.test(await txt(a.page, '#view .mc-card')) && !(await has(a.page, '#view .ex-card')));
  await done(a);
  const h = await open({ hash: '#diary', w: 360, h: 800, seed: { mods: {}, events: ONE, lang: 'hi' } });
  await tap(h.page, '#view [data-tab="tr"]'); await tap(h.page, '#view #ap-add');
  check('4 Hindi at 360 px: the sheet fits', await noScroll(h.page) && /पिछला पीरियड जोड़ें/.test(await sheet(h.page)));
  await done(h);
}

/* ---------- 5 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, seed: { lang: 'hi' } });
  check('5 Hindi at 360 px: the headline fits', await noScroll(a.page) && /दिन में अगला पीरियड/.test(await txt(a.page, '#view .card.hero')));
  await shot(a.page, '5-hindi');
  await done(a);
  const n = await open({ w: 360, h: 800, seed: { lang: 'hi', mods: { plan: planOf(37) } }, now: at('01:00', iso(TODAY, 1)) });
  check('5 ... and the night note in Hindi', /अभी भी मंगलवार का प्लान/.test(await txt(n.page, '#view .pl-night-day')) && await noScroll(n.page), await txt(n.page, '#view .pl-night-day'));
  await done(n);
}

await browser.close();
check('no page errors', !errsAll.length, errsAll);
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' cyclefirst checks passed');
process.exit(failed.length ? 1 : 0);
