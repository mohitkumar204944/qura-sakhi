// Version 39.22: meditation in the plan, a sound after a hard night, reminders by the research, a calmer My plan (Mohit, 27 Oct:
// "make meditation part of plan along with exercises and add sound helping you to sleep if facing sleep difficulty", then "go
// ahead and build it with these changes and also research timing for yoga and other activities and set reminders accordingly";
// the mockup: claude.ai/artifact/PZZQiSgZdz8KGMR1UfKwgG; MODULE_API section 65). This file checks:
//   1 My plan after week 1: settings by the title, "How it works" by her week, one line under each step and one "Why these
//     steps?", a plain check-in button (Today keeps the pink one), Plan the week and her garden in This week, her 12 weeks and
//     what consistency brings as one card with her 4-week check, four small tiles; shorter than 2,598 px; week 1 as it was;
//   2 the bedtime step winds down first: tonight's session (slow breaths; yoga nidra after a hard night; Bhramari after a low
//     day), its play button on My plan and Today (a short line there), 30 seconds of it count the step, yoga's line says
//     before a meal first;
//   3 Moves and calm: two tabs, Calm with Dr. Megha's three sessions (where each fits), Calm breath, the sounds, the safety
//     card; the session screens say sit up for Bhramari (not with a nose or ear infection) and in bed for yoga nidra;
//   4 a hard night: "How did you sleep?" in the check-in; Badly brings yoga nidra or a sound, notes Poor sleep in her diary and
//     makes tonight's session yoga nidra; the Diary's Poor sleep offers Wind down; Hindi at 360 px;
//   5 reminders by the research: the move nudge on unless she turns it off (yoga before a meal, a walk right after one), the
//     wind-down 30 minutes before bed (opens tonight's session), an hour apart from her check-in, off switches that stay off,
//     plain words on a shared phone; no page errors.
// Usage: node test/winddown.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'winddown'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = null; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, share(){ return true; } };';
const AUDIO = 'window.__audio = []; window.Audio = class { constructor(src) { this.src = src; this.paused = true; this.ended = false; this.currentTime = 0; this.duration = NaN; this.loop = false; this.volume = 1; window.__audio.push(this); } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.22-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
/* her plan's log: on `days` of every week so far, every step done */
const logged = (startAgo, days) => { const l = {}; for (let i = startAgo; i >= 1; i--) if ((startAgo - i) % 7 < days) l[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', sleep: 'd', yoga: 'd' }, plate: { half: true } }; return l; };
const planOf = (startAgo, extra) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: logged(startAgo, 5), weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, intake: { goal: 'pmos' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: { plan: planOf(37) } }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '20:30') });
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
const sheet = (page) => page.$eval('#sheet-root', (e) => e.innerText).catch(() => '');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const rem = (page, id) => page.evaluate((x) => { const r = window.Saathi.reminders.get(x); return r ? JSON.parse(JSON.stringify(r)) : null; }, id);
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.mods.plan)));
const audios = (page) => page.evaluate(() => window.__audio.map((a) => a.src));
const errsAll = [];
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const stepRow = (page, n) => page.$$eval('#view .pl-steps-card .pl-step', (rs, n) => (rs[n] ? rs[n].innerText.replace(/\s+/g, ' ') : ''), n);
const bedRow = (page) => page.$$eval('#view .pl-steps-card .pl-step', (rs) => { const r = rs.find((x) => /Wind down|सुकून के पल/.test(x.innerText)); return r ? r.innerText.replace(/\s+/g, ' ') : ''; });

/* ---------- 1 My plan after week 1 ---------- */
{
  const a = await open({ hash: '#plan' });
  check('1 settings by her title (a gear), no Plan settings row at the foot', await has(a.page, '#view .pl-head .pl-gear[data-go="plan-settings"]') && !(await has(a.page, '#view .pl-set-row')));
  check('1 "How it works" by her week; no How your plan works card', /Week 6 of 12 · How it works/.test(await txt(a.page, '#view .pl-clock')) && !(await has(a.page, '#view .pl-rh')));
  await tap(a.page, '#pl-howlink');
  check('1 ... which opens how her plan works', /How your plan works[\s\S]*Every day[\s\S]*Every week/.test(await sheet(a.page)));
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page);
  const rows = await a.page.$$eval('#view .pl-steps-card .pl-step', (rs) => rs.map((r) => ({ sub: (r.querySelector('.pl-step-sub') || {}).innerText || '', how: !!r.querySelector('.pl-step-how, .pl-step-why') })));
  check('1 one line under each of her 4 steps, no reasons or links on them', rows.length === 4 && rows.every((r) => r.sub && !r.how), rows);
  check('1 ... yoga before a meal, her walk after dinner, her meal, tonight\'s session', rows[0].sub === 'Before a meal' && rows[1].sub === 'After dinner' && /meal/i.test(rows[2].sub) && /Tonight: slow breaths with Dr\. Megha/.test(rows[3].sub), rows);
  await tap(a.page, '#pl-whyall');
  const why = await sheet(a.page);
  check('1 one "Why these 4 steps?" opens every reason', /Why these 4 steps\?/.test(why) && (why.match(/Wind down|Walk|swap|yoga/gi) || []).length >= 4 && /body clock/.test(why), why.slice(0, 300));
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page);
  check('1 the check-in button is a plain one here (Today keeps the pink one), no "same tick" line', await has(a.page, '#view .pl-steps-f .pl-ci-go:not(.primary)') && !(await has(a.page, '#view .pl-steps-same')));
  check('1 This week: Plan the week in its title, no ring legend, her garden at its foot', await has(a.page, '#view .pl-wkc .pl-wp-link#pl-wp') && !(await has(a.page, '#view .pl-wk-leg')) && await has(a.page, '#view .pl-wkc .pl-garden-in[data-go="joy"]') && !(await has(a.page, '#view .pl-garden')));
  const wc = await txt(a.page, '#view .pl-weeks');
  check('1 her 12 weeks and what consistency brings: one card, this week and next, her stage', /This week\s+100 minutes a week/.test(wc) && /Next week\s+110 minutes a week · new: No sweet drinks/.test(wc) && /Weeks 4 to 12: Habits get easier/.test(wc) && !(await has(a.page, '#view .card.pl-cons')), wc.slice(0, 300));
  check('1 ... with her 4-week check in it while it is due', await has(a.page, '#view .pl-weeks .pl-mc-in [data-go="plan-check"]') && !(await has(a.page, '#view > .pl-mc-rowl')));
  check('1 ... and every week, the timeline and her signs behind "All 12 weeks"', await a.page.$eval('#view .pl-weeks details.pl-path-more', (d) => !d.open && d.querySelectorAll('.pl-steps li').length === 12 && /Weeks 1 to 4[\s\S]*3 to 6 months/.test(d.textContent) && /Days between periods/.test(d.textContent)));
  const tiles = await a.page.$$eval('#view .pl-tiles4 .pl-tile', (b) => b.map((x) => x.innerText.trim()));
  check('1 four small tiles in one row: Moves and calm among them', tiles.length === 4 && tiles.indexOf('Moves and calm') >= 0 && await a.page.$$eval('#view .pl-tiles4 .pl-tile', (b) => new Set(b.map((x) => Math.round(x.getBoundingClientRect().top))).size === 1), tiles);
  const h = await a.page.$eval('#view', (v) => v.scrollHeight);
  check('1 the page is much shorter: under 2,100 px at 390 px (it was 2,598 at week 6)', h < 2100, h);
  await shot(a.page, '1-myplan-w6');
  await done(a);
  const b = await open({ hash: '#plan', seed: { mods: { plan: planOf(3) } } });
  check('1 week 1 as it was: how her plan works open, each reason, "How to do it", the pink check-in, the same tick', await has(b.page, '#view .card.pl-rh') && (await b.page.$$('#view .pl-step-why')).length >= 3 && (await b.page.$$('#view .pl-step-how')).length >= 3 && await has(b.page, '#view .pl-ci-go.primary') && await has(b.page, '#view .pl-steps-same'));
  check('1 ... its bedtime step winds down too, the gear by her title', /Wind down, in bed by 11:30 pm/.test(await bedRow(b.page)) && await has(b.page, '#view .pl-st-play') && await has(b.page, '#view .pl-gear'));
  await done(b);
}

/* ---------- 2 the bedtime step winds down first ---------- */
{
  const a = await open({ hash: '#plan', hm: '21:30' });
  check('2 My plan: "Wind down, in bed by 11 pm", tonight slow breaths, a 4-minute play button', /Wind down, in bed by 11 pm Tonight: slow breaths with Dr\. Megha 4 min/.test(await bedRow(a.page)), await bedRow(a.page));
  await tap(a.page, '#view .pl-st-play');
  check('2 ... which opens her session and plays it', (await a.page.evaluate(() => location.hash)) === '#calm-breaths' && (await audios(a.page)).some((s) => /sounds\/voice\/en\/breaths\.ogg$/.test(s)));
  await settle(a.page, 31000);
  check('2 30 seconds of it count: Sakhi remembers tonight\'s session', !!(await a.page.evaluate((d) => window.Saathi.calm.doneOn(d), TODAY)));
  await go(a.page, 'plan');
  check('2 ... and her step is done: "Wound down: slow breaths"', /Wound down: slow breaths/.test(await bedRow(a.page)) && await a.page.$$eval('#view .pl-steps-card .pl-step', (rs) => rs.some((r) => /Wind down/.test(r.innerText) && r.classList.contains('today-ok'))));
  await go(a.page, 'home');
  check('2 Today shows it ticked too', await a.page.$eval('#view .today-plan-sleep', (r) => r.classList.contains('today-ok')).catch(() => false));
  await done(a);
  const t = await open({ hash: '#home', hm: '21:00' });
  const tw = await t.page.$eval('#view .today-plan-sleep', (r) => ({ t: r.innerText.replace(/\s+/g, ' '), b: !!r.querySelector('.today-start.night[data-today-nav]'), w: !!r.querySelector('.today-sub.wrap') })).catch(() => null);
  check('2 Today: tonight\'s session plays where the tick goes, in a short line', !!tw && tw.b && !tw.w && /In bed by 11 pm/.test(tw.t) && /Tonight: slow breaths/.test(tw.t) && !/Dr\. Megha/.test(tw.t) && /4 min/.test(tw.t), tw);
  check('2 ... and yoga says before a meal, first in its line', /^Before a meal · 8 min/.test(await txt(t.page, '#view .today-plan-yoga .today-sub-t')));
  check('2 ... the pink button stays the next step\'s (or the check-in), never the session', !(await has(t.page, '#view .today-start.night.primary')));
  await tap(t.page, '#view .today-plan-sleep [data-today-nav]');
  check('2 ... a tap plays tonight\'s session', (await t.page.evaluate(() => location.hash)) === '#calm-breaths');
  await done(t);
  const n = await open({ hash: '#plan', seed: { daily: { [TODAY]: ['d_sleep'] } } });
  check('2 Poor sleep in her diary today: tonight is yoga nidra, 9 minutes', /Tonight: yoga nidra with Dr\. Megha 9 min/.test(await bedRow(n.page)), await bedRow(n.page));
  await done(n);
  const m = await open({ hash: '#plan', seed: { daily: { [TODAY]: ['d_mood'] } } });
  check('2 a low day: tonight is Bhramari, 3 minutes', /Tonight: Bhramari with Dr\. Megha 3 min/.test(await bedRow(m.page)), await bedRow(m.page));
  await done(m);
}

/* ---------- 3 Moves and calm ---------- */
{
  const a = await open({ hash: '#plan-moves' });
  check('3 Moves and calm: two tabs, Yoga and moves on', /Moves and calm/.test(await txt(a.page, '#view h1')) && (await a.page.$$('#view .pl-seg .pl-seg-b')).length === 2 && /Yoga and moves/.test(await txt(a.page, '#view .pl-seg-b.on')));
  check('3 ... Calm breath has moved to Calm', !(await has(a.page, '#view .pl-ritem[data-go="plan-r-calm"]')) && await has(a.page, '#view .pl-ritem[data-go="plan-r-cycle"]'));
  await tap(a.page, '#view .pl-seg-b[data-go="plan-calm"]');
  const v = await view(a.page);
  check('3 Calm: Dr. Megha\'s three sessions, where each fits', /Slow breaths\s+In for 4, out for 6, sitting or lying · 4 min/.test(v) && /Bhramari, the humming breath\s+A soft hum, sitting up · 3 min/.test(v) && /Yoga nidra\s+Lying in bed, part by part · 9 min/.test(v), v.slice(0, 500));
  check('3 ... tonight\'s session marked, Calm breath, the sounds, the safety card (Version 39.24: the Wind down page, sounds that play here)', /Tonight/.test(await txt(a.page, '#view .cm-tn[data-go="calm-breaths"]')) && await has(a.page, '#view .cm-it[data-go="plan-r-calm"]') && await has(a.page, '#view .cm-it[data-go="calm-bowl"]') && /For rest and sleep, not treatment[\s\S]*dizzy/.test(await txt(a.page, '#view .card.warn')));
  await shot(a.page, '3-calm-tab');
  await go(a.page, 'calm-bhramari');
  check('3 Bhramari\'s screen: sit up, nose; not with a nose or ear infection', /Sit up and breathe through your nose[\s\S]*nose or ear infection/.test(await txt(a.page, '.cm-tip')));
  await go(a.page, 'calm-nidra');
  check('3 yoga nidra\'s screen: in bed, lights off, phone face down', /In bed, with the lights off\. Press play, then put the phone face down\./.test(await txt(a.page, '.cm-tip')));
  await go(a.page, 'calm');
  const tl = await a.page.$$eval('#view .cm-it, #view .cm-tn', (b) => b.map((x) => x.innerText.replace(/\s+/g, ' ')));
  check('3 the Wind down page says where: Bhramari sitting up, yoga nidra in bed (Version 39.24: as on the Calm tab)', tl.some((x) => /Bhramari.*sitting up · 3 min/.test(x)) && tl.some((x) => /Yoga nidra.*Lying in bed.* · 9 min/.test(x)) && tl.some((x) => /Slow breaths.*4 min/.test(x)), tl);
  await done(a);
}

/* ---------- 4 a hard night ---------- */
{
  const a = await open({ hash: '#plan-checkin' });
  check('4 the check-in: "How did you sleep?" with last night\'s bedtime', /Last night: in bed by 11 pm\?[\s\S]*How did you sleep\?\s*Well\s*Okay\s*Badly/.test(await view(a.page)));
  await a.page.$$eval('[data-ci$=":d"]', (bs) => bs.forEach((x) => x.click())); await settle(a.page);
  await tap(a.page, '[data-ci-slp="bad"]'); await tap(a.page, '#pl-ci-save');
  const nc = await txt(a.page, '#view .pl-night');
  check('4 Badly: a sound for tonight, yoga nidra or the singing bowl for 30 minutes', /A hard night\. Tonight, let a sound help you sleep\./.test(nc) && /Yoga nidra · 9 min/.test(nc) && /Singing bowl and waves · 30 min/.test(nc) && /Tell your doctor/.test(nc), nc);
  check('4 ... noted: Poor sleep in her diary today, her answer kept', (await a.page.evaluate((d) => (window.Saathi.state.daily[d] || []).indexOf('d_sleep') >= 0, TODAY)) && (await plan(a.page)).log[TODAY].slp === 'bad');
  await shot(a.page, '4-night');
  await tap(a.page, '#view .pl-night-a');
  check('4 ... yoga nidra plays', (await a.page.evaluate(() => location.hash)) === '#calm-nidra' && (await audios(a.page)).some((s) => /nidra\.ogg$/.test(s)));
  await go(a.page, 'plan');
  check('4 ... and tonight\'s step is yoga nidra', /Tonight: yoga nidra/.test(await bedRow(a.page)));
  await done(a);
  const w = await open({ hash: '#plan-checkin' });
  await w.page.$$eval('[data-ci$=":d"]', (bs) => bs.forEach((x) => x.click())); await settle(w.page);
  await tap(w.page, '[data-ci-slp="well"]'); await tap(w.page, '#pl-ci-save');
  check('4 Well: no hard-night card, tonight\'s session one row away', !(await has(w.page, '#view .pl-night')) && /Tonight’s wind-down\s+slow breaths · 4 min/.test(await txt(w.page, '#view .pl-tonight')) && !(await w.page.evaluate((d) => (window.Saathi.state.daily[d] || []).indexOf('d_sleep') >= 0, TODAY)));
  await done(w);
  const s = await open({ hash: '#plan-checkin' });
  await s.page.$$eval('[data-ci$=":d"]', (bs) => bs.forEach((x) => x.click())); await settle(s.page); await tap(s.page, '#pl-ci-save');
  check('4 not answered: nothing kept, nothing noted', !('slp' in ((await plan(s.page)).log[TODAY] || {})) && !(await has(s.page, '#view .pl-night')));
  await done(s);
  const d = await open({ hash: '#diary', seed: { daily: { [TODAY]: ['d_sleep'] } } });
  await d.page.evaluate((x) => window.Saathi.openDay(x, null), TODAY); await settle(d.page, 500);
  check('4 the Diary: Poor sleep offers the sleep routine and Wind down', await has(d.page, '#sheet-root #day-relief') && /Wind down/.test(await txt(d.page, '#sheet-root .relief-alt[data-go="calm"]')));
  await done(d);
  const h = await open({ hash: '#plan-checkin', w: 360, h: 780, seed: { lang: 'hi' } });
  check('4 Hindi: "नींद कैसी रही?"', /नींद कैसी रही\?[\s\S]*अच्छी[\s\S]*ठीक-ठाक[\s\S]*ख़राब/.test(await view(h.page)));
  await h.page.$$eval('[data-ci$=":d"]', (bs) => bs.forEach((x) => x.click())); await settle(h.page);
  await tap(h.page, '[data-ci-slp="bad"]'); await tap(h.page, '#pl-ci-save');
  check('4 ... the hard-night card in Hindi, no sideways scroll at 360 px', /रात मुश्किल रही/.test(await txt(h.page, '#view .pl-night')) && /योग निद्रा · 9 मिनट/.test(await txt(h.page, '#view .pl-night')) && await noScroll(h.page));
  await shot(h.page, '4-night-hi');
  await go(h.page, 'plan');
  check('4 ... My plan in Hindi at 360 px: the wind-down step, no sideways scroll', /सुकून के पल, फिर रात 11 बजे तक बिस्तर पर/.test(await bedRow(h.page)) && await noScroll(h.page), await bedRow(h.page));
  await done(h);
}

/* ---------- 5 reminders by the research ---------- */
{
  const a = await open({ hash: '#home' });
  const nu = await rem(a.page, 'plan-nudge'), wd = await rem(a.page, 'plan-wind');
  check('5 the move nudge is on without her asking: after dinner, 9:15 pm, a walk right after the meal', !!nu && nu.on !== false && nu.time === '21:15' && /right after the meal/.test(nu.title.en), nu);
  check('5 the wind-down: 30 minutes before her 11 pm bedtime, every day', !!wd && wd.on !== false && wd.time === '22:30' && wd.every === 1 && /wind down/i.test(wd.title.en), wd);
  await a.page.evaluate(() => window.Saathi.save()); await settle(a.page, 1200);
  const sc = await a.page.evaluate(() => window.__sched || []);
  const wn = sc.find((x) => x.rid === 'plan-wind');
  check('5 ... booked on the phone, opening tonight\'s session', !!wn && wn.go === 'plan-wind' && /Time to wind down/.test(wn.body), wn);
  await go(a.page, 'plan-wind'); await settle(a.page, 300);
  check('5 ... which plays tonight\'s session', (await a.page.evaluate(() => location.hash)) === '#calm-breaths');
  await settle(a.page, 31000); await go(a.page, 'home');
  check('5 once she has wound down, tonight\'s reminder rests', ((await rem(a.page, 'plan-wind')) || {}).doneOn === TODAY);
  await go(a.page, 'plan-settings');
  check('5 Plan settings: the nudge on, the wind-down at 10:30 pm', await a.page.$eval('#pl-nudge', (x) => x.checked) && await a.page.$eval('#pl-wind', (x) => x.checked) && /Every night at 10:30 pm, 30 minutes before bed/.test(await txt(a.page, '#view .pl-wind-set')));
  await tap(a.page, '#pl-wind'); await tap(a.page, '#pl-nudge');
  check('5 she turns both off: gone', !(await rem(a.page, 'plan-wind')) && !(await rem(a.page, 'plan-nudge')) && (await plan(a.page)).wind === false && (await plan(a.page)).nudge === false);
  await go(a.page, 'home'); await go(a.page, 'plan');
  check('5 ... and they stay off', !(await rem(a.page, 'plan-wind')) && !(await rem(a.page, 'plan-nudge')));
  await done(a);
  const y = await open({ hash: '#home', seed: { mods: { plan: planOf(37, { when: 'morning' }) } } });
  const ny = await rem(y.page, 'plan-nudge');
  check('5 her time is the morning: 7:30 am, yoga before she eats, then her walk', !!ny && ny.time === '07:30' && /Yoga before you eat, then your walk/.test(ny.title.en), ny);
  await done(y);
  const c = await open({ hash: '#plan-settings', seed: { mods: { plan: planOf(37, { remAt: '22:00' }) } } });
  check('5 a check-in less than an hour before bed brings tonight\'s session instead (no second reminder)', !(await rem(c.page, 'plan-wind')) && /Your evening check-in brings tonight’s session/.test(await txt(c.page, '#view .pl-wind-set')));
  await done(c);
  const o = await open({ hash: '#home', seed: { mods: { plan: planOf(37, { nudge: false }) } } });
  check('5 a nudge she turned off before stays off', !(await rem(o.page, 'plan-nudge')) && !!(await rem(o.page, 'plan-wind')));
  await done(o);
  const sh = await open({ hash: '#home', seed: { settings: { shared: true } } });
  await sh.page.evaluate(() => { const b = document.querySelector('#rest-open'); if (b) b.click(); }); await settle(sh.page, 300);
  await sh.page.evaluate(() => window.Saathi.save()); await settle(sh.page, 1200);
  const sw = (await sh.page.evaluate(() => window.__sched || [])).find((x) => x.rid === 'plan-wind');
  check('5 a shared phone: the wind-down notification says only "Reminder"', !!sw && sw.body === 'Reminder' && sw.secret === true, sw);
  await done(sh);
}

await browser.close();
check('no page errors', !errsAll.length, errsAll);
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' winddown checks passed');
process.exit(failed.length ? 1 : 0);
