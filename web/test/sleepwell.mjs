// Version 39.24: Wind down that comes up properly (Mohit, 27 Oct: "can you check wind down sleep section its not properly coming
// up", then "yes make a mockup first" and "go ahead and build it"; the mockup: claude.ai/artifact/EofEApr38Rojv8656FPSHt;
// MODULE_API section 67). The phone's player is stood in for: its position moves with the clock and stops at the track's end.
// This file checks:
//   1 the opening seconds: "Dr. Megha is starting. Settle in.", how long until the breathing starts, the tip, her first words;
//     tonight's session says so;
//   2 captions: her words as she says them (the counts keep her last words), a list part by part, CC that stays off, Hindi;
//   3 her voice switches on the screen (the session starts again in it);
//   4 Back keeps it playing: a bar above the tabs (pause, open, stop), the Diary's + button above it;
//   5 the end: "Sleep well, Riya", her bedtime step done, the sounds and yoga nidra, the timer, Done; an ended session starts
//     afresh next time;
//   6 one Wind down page: tonight's session first, rows that play, Calm breath, the sounds with the timer, the safety card; My
//     plan's Calm tab is the same page;
//   7 Explore's For you: Wind down right after her goal's first tool, in the night colour (tonight's session), when her plan
//     has the step or her goal is sleep, mood or PMS; not otherwise;
//   8 My plan in week 1 says what her wind-down plays;
//   9 yoga nidra, softer: a glow, and the light on the part she names;
//  10 Hindi at 360 px, and no page errors.
// Usage: node test/sleepwell.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'sleepwell'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the phone's player: plays from soundPlay, moves with the clock, pauses and stops, ends at the track's length */
const LEN = { 'breaths-en': 226.42, 'breaths-hi': 230, 'bhramari-en': 178, 'nidra-en': 497 };
const BRIDGE = 'window.__calls = []; window.__p = null; window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, keepAwake(){}, ' +
  'soundPlay(src, loop, mins){ window.__calls.push("play " + src); const m = /voice\\/(en|hi)\\/(\\w+)\\.ogg/.exec(src); const L = ' + JSON.stringify(LEN) + '; window.__p = { src: src, at: Date.now(), pos: 0, on: true, dur: m ? (L[m[2] + "-" + m[1]] || 200) : 0, loop: !!loop }; }, ' +
  'soundPause(){ window.__calls.push("pause"); const p = window.__p; if (p && p.on) { p.pos += (Date.now() - p.at) / 1000; p.on = false; } }, soundResume(){ window.__calls.push("resume"); const p = window.__p; if (p && !p.on) { p.at = Date.now(); p.on = true; } }, ' +
  'soundStop(){ window.__calls.push("stop"); window.__p = null; }, soundTimer(m){ window.__calls.push("timer " + m); }, ' +
  'soundState(){ const p = window.__p; if (!p) return JSON.stringify({ playing: false, pos: 0, dur: 0, left: -1, played: 0 }); let x = p.pos + (p.on ? (Date.now() - p.at) / 1000 : 0); let on = p.on; if (p.dur && x >= p.dur) { x = p.dur; on = false; } return JSON.stringify({ playing: on, pos: p.loop ? x % 200 : x, dur: p.dur || 200, left: -1, played: x }); } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.24-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 5), t: 'end' })); return out; };
const planOf = (startAgo, extra) => Object.assign({ pack: 'cycle', goalKey: 'pmos', start: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, intake: { goal: 'pmos' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: { plan: planOf(2) } }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(BRIDGE);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '21:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(6); } }
const fast = async (page, ms) => { await page.clock.runFor(ms); await settle(page, 300); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const hashOf = (page) => page.evaluate(() => location.hash);
const calls = (page) => page.evaluate(() => window.__calls.slice());
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const SB1 = 'Lie down, or sit comfortably. Let your shoulders drop, and close your eyes if you like.';
const SB2 = 'We will breathe slowly together.';
const SB3 = 'Good. Keep going on your own: in for four, out for six.';

/* ---------- 1 to 5: tonight's slow breaths from My plan ---------- */
{
  const a = await open({ hash: '#plan' });
  /* 8 week 1 says what her wind-down plays */
  check('8 My plan, week 1: the bedtime step says "Tonight: slow breaths with Dr. Megha"', /Tonight: slow breaths with Dr\. Megha/.test(await txt(a.page, '#view .pl-steps-card')));
  await tap(a.page, '#view .pl-st-play'); await fast(a.page, 3800);
  const o = await a.page.evaluate(() => ({ open: !document.querySelector('#cm-open').classList.contains('gone'), say: document.querySelector('.cm-say').textContent, soon: document.querySelector('#cm-soon').textContent, tip: (document.querySelector('.cm-open .cm-tip') || {}).textContent || '', cap: document.querySelector('#cm-cap-t').textContent, eb: (document.querySelector('.cm-eb') || {}).textContent || '' }));
  check('1 the opening seconds: "Dr. Megha is starting. Settle in.", when the breathing starts, the tip', (await hashOf(a.page)) === '#calm-breaths' && o.open && o.say === 'Dr. Megha is starting. Settle in.' && /^Breathing starts in 1[6-9] s$/.test(o.soon) && /^Sitting or lying down\./.test(o.tip), o);
  check('1 ... tonight\'s session says so, and her first words show', o.eb === 'TonightYour wind-down · 4 min' && o.cap === SB1, o);
  await shot(a.page, '1-open');
  await fast(a.page, 21000);
  const c2 = await a.page.evaluate(() => ({ gone: document.querySelector('#cm-open').classList.contains('gone'), cap: document.querySelector('#cm-cap-t').textContent, label: (document.querySelector('.cm-label') || {}).textContent || '' }));
  check('2 once the breathing starts the opening goes; the counts keep her last words in the caption', c2.gone && c2.cap.indexOf(SB2) === 0 && /Breathe (in|out)/.test(c2.label), c2);
  await fast(a.page, 45000);
  check('2 ... and at 1:10 her next words', (await txt(a.page, '#cm-cap-t')) === SB3);
  await shot(a.page, '2-breathe');
  /* 2 CC off stays off */
  await tap(a.page, '#cm-cc');
  check('2 CC turns the captions off (and says so)', await a.page.evaluate(() => document.querySelector('#cm-cap').classList.contains('off') && document.querySelector('#cm-cc').getAttribute('aria-pressed') === 'false' && window.Saathi.state.mods.calm.cc === false));
  await tap(a.page, '#cm-cc');
  /* 4 Back keeps it playing */
  const n0 = (await calls(a.page)).filter((x) => /^play /.test(x)).length; const c0 = (await calls(a.page)).length;
  await a.page.evaluate(() => history.back()); await settle(a.page, 800);
  const b = await a.page.evaluate(() => { const m = document.querySelector('#cm-mini'); const nav = document.querySelector('#tabbar').getBoundingClientRect().top; return m ? { t: m.innerText.replace(/\s+/g, ' '), bottom: Math.round(m.getBoundingClientRect().bottom), nav: Math.round(nav), on: document.body.classList.contains('cm-mini-on') } : null; });
  check('4 Back leaves it playing: a bar above the tabs, "Slow breaths · Playing · 1:1x of 3:46"', (await hashOf(a.page)) === '#plan' && !!b && /Slow breaths Playing · 1:1\d of 3:46/.test(b.t) && b.bottom <= b.nav && b.on && (await calls(a.page)).slice(c0).indexOf('stop') < 0, b);
  await shot(a.page, '4-bar');
  await tap(a.page, '#cm-mi-pp'); await settle(a.page, 1200);
  check('4 ... its pause pauses her session', (await calls(a.page)).indexOf('pause') >= 0 && /Paused · /.test(await txt(a.page, '#cm-mini')), await txt(a.page, '#cm-mini'));
  await tap(a.page, '#cm-mi-pp'); await settle(a.page, 300);
  await tap(a.page, '#cm-mi-open');
  check('4 ... a tap opens her session, still playing (not started again)', (await hashOf(a.page)) === '#calm-breaths' && (await calls(a.page)).filter((x) => /^play /.test(x)).length === n0 && !(await has(a.page, '#cm-mini')));
  await go(a.page, 'diary');
  check('4 ... on the Diary the + button sits above the bar', await a.page.evaluate(() => { const f = document.querySelector('.fab'); const m = document.querySelector('#cm-mini'); return !!f && !!m && f.getBoundingClientRect().bottom <= m.getBoundingClientRect().top + 1; }));
  const c1 = (await calls(a.page)).length; await tap(a.page, '#cm-mi-x');
  check('4 ... and its ✕ stops it', !(await has(a.page, '#cm-mini')) && (await calls(a.page)).slice(c1).indexOf('stop') >= 0);
  /* 5 the end */
  await go(a.page, 'calm-breaths'); await fast(a.page, 228000);   /* her step is done (a tick now), so straight to the session */
  const e = await txt(a.page, '.cm-end');
  check('5 the end: "Sleep well, Riya" and her bedtime step done for tonight', /Sleep well, Riya/.test(e) && /Your bedtime step is done for tonight/.test(e), e);
  check('5 ... then the sounds and yoga nidra, the timer and Done', /Keep going: sounds for sleep and yoga nidra/.test(e) && ['calm-bowl', 'calm-wandering', 'calm-dunes', 'calm-nidra'].every((x) => e && true) && await a.page.evaluate(() => ['calm-bowl', 'calm-wandering', 'calm-dunes', 'calm-nidra'].every((x) => !!document.querySelector('.cm-end [data-go="' + x + '"]'))) && /Stop after/.test(e) && await has(a.page, '#cm-done'), e);
  await shot(a.page, '5-end');
  await tap(a.page, '.cm-end [data-go="calm-bowl"]');
  check('5 ... a sound plays from there', (await hashOf(a.page)) === '#calm-bowl' && (await calls(a.page)).slice(-1)[0] === 'play sounds/music/bowl.ogg', (await calls(a.page)).slice(-3));
  await tap(a.page, '#cm-x');
  await go(a.page, 'calm-breaths'); await fast(a.page, 2000);
  check('5 an ended session starts afresh next time', !(await has(a.page, '.cm-end')) && (await has(a.page, '#cm-open')) && (await calls(a.page)).slice(-1)[0] === 'play sounds/voice/en/breaths.ogg');
  /* 3 her voice switches here */
  await tap(a.page, '[data-pvl="hi"]'); await fast(a.page, 3000);
  check('3 her voice switches on the screen: the session starts again in Hindi, with Hindi captions', (await calls(a.page)).slice(-1)[0] === 'play sounds/voice/hi/breaths.ogg' && /^लेट जाएँ, या आराम से बैठें।/.test(await txt(a.page, '#cm-cap-t')), [(await calls(a.page)).slice(-2), await txt(a.page, '#cm-cap-t')]);
  await done(a);
}

/* ---------- 6 one Wind down page, and My plan's Calm tab ---------- */
{
  const a = await open({ hash: '#calm' });
  const p = await a.page.evaluate(() => ({ tn: (document.querySelector('#view .cm-tn') || {}).innerText || '', tgo: (document.querySelector('#view .cm-tn') || { dataset: {} }).dataset.go, rows: Array.from(document.querySelectorAll('#view .cm-it')).map((b) => b.dataset.go), chips: document.querySelectorAll('#view [data-min]').length, safe: (document.querySelector('#view .cm-safe') || {}).innerText || '', old: /keeps playing with the screen off/.test(document.querySelector('#view').innerText) }));
  check('6 the Wind down page: tonight\'s session first, the others and Calm breath, the sounds that play, the timer, the safety card', /Tonight\s+Slow breaths\s+In for 4, out for 6, sitting or lying · 4 min/.test(p.tn) && p.tgo === 'calm-breaths' && JSON.stringify(p.rows) === JSON.stringify(['calm-bhramari', 'calm-nidra', 'plan-r-calm', 'calm-bowl', 'calm-wandering', 'calm-dunes']) && p.chips === 3 && /For rest and sleep, not treatment\s+Stop if you feel dizzy or unwell\./.test(p.safe) && !p.old, p);
  await shot(a.page, '6-page');
  await tap(a.page, '#view [data-min="45"]');
  check('6 ... the timer is kept', await a.page.evaluate(() => window.Saathi.state.mods.calm.mins === 45));
  await tap(a.page, '#view .cm-it[data-go="calm-wandering"]');
  check('6 ... a sound plays from its row', (await hashOf(a.page)) === '#calm-wandering' && (await calls(a.page)).slice(-1)[0] === 'play sounds/music/wandering.ogg');
  await tap(a.page, '#cm-x');
  await go(a.page, 'plan-calm');
  check('6 My plan\'s Calm tab is the same page', (await has(a.page, '#view .pl-mt, #view [role="tablist"]')) && (await has(a.page, '#view .cm-list .cm-tn')) && (await has(a.page, '#view .cm-it[data-go="calm-bowl"]')));
  await done(a);
  const n = await open({ hash: '#calm', seed: { mods: {}, intake: { goal: 'track' }, goals: ['track'] } });
  check('6 with no plan: no "Tonight", every session in its row (and Calm breath)', !(await has(n.page, '#view .cm-tn')) && JSON.stringify(await n.page.$$eval('#view .cm-it', (x) => x.map((b) => b.dataset.go))) === JSON.stringify(['calm-breaths', 'calm-bhramari', 'calm-nidra', 'plan-r-calm', 'calm-bowl', 'calm-wandering', 'calm-dunes']));
  await done(n);
}

/* ---------- 7 Explore's For you ---------- */
{
  const a = await open({ hash: '#care' });
  const f = await a.page.evaluate(() => { const ts = Array.from(document.querySelectorAll('#view .care-sec .tile')); const b = ts[1]; return b ? { first: ts[0].dataset.go, go: b.dataset.go, night: b.classList.contains('tile-night'), t: b.innerText.replace(/\s+/g, ' ') } : null; });
  check('7 Explore: Wind down in For you right after her goal\'s first tool, in the night colour, with tonight\'s session', !!f && f.first !== 'calm' && f.go === 'calm' && f.night && /Tonight: slow breaths/.test(f.t), f);
  await shot(a.page, '7-explore');
  await done(a);
  const g = await open({ hash: '#care', seed: { mods: {}, goals: ['sleep'] } });
  check('7 ... her goal is sleep: Wind down near the top, no session named', await g.page.evaluate(() => { const ts = Array.from(document.querySelectorAll('#view .care-sec .tile')).slice(0, 2); const b = ts.find((x) => x.dataset.go === 'calm'); return !!b && !/Tonight/.test(b.innerText); }));
  await done(g);
  const n = await open({ hash: '#care', seed: { mods: {}, intake: { goal: 'track' }, goals: ['track'] } });
  check('7 ... neither: not in For you', !(await has(n.page, '#view .care-sec .tile[data-go="calm"]')));
  await done(n);
}

/* ---------- 9 yoga nidra, softer ---------- */
{
  const a = await open({ hash: '#calm-nidra' });
  await fast(a.page, 80000);
  const y = await a.page.evaluate(() => ({ glow: document.querySelectorAll('.cm-nidra .cm-glow > *').length, lit: (document.querySelector('.cm-nidra circle[fill="url(#cm-spot)"]') || { getAttribute: () => '0' }).getAttribute('opacity'), cap: document.querySelector('#cm-cap-t').textContent }));
  check('9 yoga nidra: a soft glow around her, the light on the part she names, the parts in the caption', y.glow === 6 && +y.lit > 0.5 && /^Right hand thumb\./.test(y.cap), y);
  await shot(a.page, '9-nidra');
  await done(a);
}

/* ---------- 10 Hindi at 360 px; discreet mode ---------- */
{
  const a = await open({ hash: '#plan', w: 360, h: 800, seed: { lang: 'hi' } });
  await tap(a.page, '#view .pl-st-play'); await fast(a.page, 3000);
  check('10 Hindi at 360 px: the opening and her words fit', await noScroll(a.page) && /डॉ\. मेघा शुरू कर रही हैं।/.test(await txt(a.page, '.cm-say')) && /^साँसें (1[7-9]|2[01]) सेकंड में शुरू होंगी$/.test(await txt(a.page, '#cm-soon')), [await txt(a.page, '#cm-soon')]);
  await shot(a.page, '10-hindi');
  await a.page.evaluate(() => history.back()); await settle(a.page, 800);
  check('10 ... the bar in Hindi', /चल रहा है · 3:50 में से 0:0\d/.test(await txt(a.page, '#cm-mini')), await txt(a.page, '#cm-mini'));
  await done(a);
  const d = await open({ hash: '#calm-breaths', seed: { settings: { discreet: true } } });
  await fast(d.page, 232000);
  check('10 discreet mode: the end says "Sleep well", without her name', /^Sleep well$/.test(await txt(d.page, '.cm-sw')));
  await done(d);
}

await browser.close();
check('no page errors', !errsAll.length, errsAll);
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' sleepwell checks passed');
process.exit(failed.length ? 1 : 0);
