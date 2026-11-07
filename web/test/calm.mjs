// Version 39.21: Wind down (Mohit, 26 Oct: "build it into the app"; docs/myplan-and-sleep-advice-2026-10-26.md; MODULE_API
// section 64). Dr. Megha's voice guides slow breaths, Bhramari (with the real hum) and yoga nidra, in English and Hindi; three
// CC0 sounds play for sleep with a timer; each moves with an animation; the relief routines speak in her voice. This file checks:
//   1 where she finds it: Explore's Periods topic beside "Feel better now", Explore's search ("yoga nidra" is rest, not the
//     exercise plan), the relief list, the sleep routine's first and last screens (one tap from her plan's bedtime step), midlife;
//   2 the list: 3 guided sessions and 3 sounds, her voice in English or Hindi, the safety card (Version 39.24: the light rows);
//   3 a guided session in a browser: its file, a dark screen over everything, "Breathe in" and the count on her cue, her own
//     pace after it, pause and play, the end, close;
//   4 Bhramari's hum and yoga nidra's light on each part she names, the whole limb, dawn and night;
//   5 Hindi: her voice in Hindi (her choice is kept; a Hindi app starts there), the Hindi timeline, 360 px;
//   6 a sound with a timer: 30 minutes unless she picks 15 or 45, its last minute fades, it stops, it plays again;
//   7 on the phone: Android plays it (path, loop, minutes, notification words, Stop), pause, timer, stop on leaving, the screen
//     kept on for a guided session only while it plays; discreet mode and a shared phone: a plain title, off the lock screen;
//     the notification's words in Hindi;
//   8 the relief routines in her voice: each step's clip (English, Hindi, on the phone), stopped on pause, next and leaving;
//     off on a shared phone and when she turns the voice off;
//   9 the files: every session and clip, Opus, as long as its timeline (a clip shorter than its step), the credits, the
//     APK bundles them uncompressed and plays them in a media service; no page errors.
// Usage: node test/calm.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'calm'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the phone: reminders and speech as in the other tests; with `native`, Android's sound player too, which records each call */
const ANDROID = (native) => 'window.__calls = []; window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, share(){ return true; }, keepAwake(on){ window.__calls.push(["awake", on]); } };' +
  (native ? 'window.__st = { playing: false, pos: 0, dur: 0, left: -1, played: 0 }; Object.assign(window.SakhiAndroid, {' +
    ' soundPlay(){ const a = [].slice.call(arguments); window.__calls.push(["play"].concat(a)); window.__st = { playing: true, pos: 0, dur: a[1] ? 0 : 100, left: a[2] ? a[2] * 60 : -1, played: 0 }; },' +
    ' soundPause(){ window.__calls.push(["pause"]); window.__st.playing = false; }, soundResume(){ window.__calls.push(["resume"]); window.__st.playing = true; },' +
    ' soundStop(){ window.__calls.push(["stop"]); window.__st = { playing: false, pos: 0, dur: 0, left: -1, played: 0 }; }, soundTimer(m){ window.__calls.push(["timer", m]); },' +
    ' soundState(){ return JSON.stringify(window.__st); }, clip(p){ window.__calls.push(["clip", p]); }, clipStop(){ window.__calls.push(["clipStop"]); } });' : '');
/* a browser's <audio>: each one made is kept, and the test sets its time */
const AUDIO = 'window.__audio = []; window.Audio = class { constructor(src) { this.src = src; this.paused = true; this.ended = false; this.currentTime = 0; this.duration = NaN; this.loop = false; this.volume = 1; window.__audio.push(this); }' +
  ' play() { this.paused = false; this.ended = false; return Promise.resolve(); } pause() { this.paused = true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.21-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: 'no-preference' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID(o.native));
  await ctx.addInitScript(AUDIO);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('22:10') });
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
const attr = (page, sel, a) => page.$eval(sel, (e, a) => e.getAttribute(a), a).catch(() => null);
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });
const audios = (page) => page.evaluate(() => window.__audio.map((a) => ({ src: a.src, loop: a.loop, paused: a.paused, volume: a.volume })));
const calls = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__calls)));
const calm = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods || {}).calm || {})));
/* move the last <audio> to a moment in its track, then let the player draw it */
const seek = async (page, x, dur) => { await page.evaluate(([x, dur]) => { const a = window.__audio[window.__audio.length - 1]; a.currentTime = x; if (dur) a.duration = dur; }, [x, dur]); await settle(page, 300); };
const label = (page) => txt(page, '.cm-label');
const count = (page) => txt(page, '.cm-count');
const errsAll = [];
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const TL = (() => { const w = {}; new Function('window', fs.readFileSync(path.join(root, 'sounds', 'timelines.js'), 'utf8'))(w); return w.SAKHI_CALM.tl; })();
const cue = (key, k, n) => TL[key].cues.filter((c) => c.k === k)[n || 0];
/* the tool rows a search shows (Care's search box) */
const careSearch = (page, q) => page.evaluate(async (q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); await new Promise((r) => setTimeout(r, 80));
  const sec = document.querySelector('#view .care-sec'); return sec ? [...sec.querySelectorAll('[data-go]')].map((x) => x.dataset.go) : []; }, q);

/* ---------- 1 where she finds it ---------- */
{
  const a = await open({ hash: '#topic-periods' });
  const gos = await a.page.$$eval('#view [data-go]', (b) => b.map((x) => x.dataset.go));
  check('1 Explore\'s Periods topic: Wind down beside "Feel better now"', gos.indexOf('calm') >= 0 && gos.indexOf('relief') >= 0, gos);
  for (const [q, n] of [['wind down', 0], ['yoga nidra', 0], ['bhramari', 0], ['sleep music', 0], ['योग निद्रा', 0], ['neend', 2]]) { await go(a.page, 'care'); const r = await careSearch(a.page, q); check('1 search "' + q + '" finds Wind down' + (n ? '' : ' first'), r.indexOf('calm') >= 0 && r.indexOf('calm') <= n, r); }
  await go(a.page, 'care'); const yg = await careSearch(a.page, 'yoga');
  check('1 ... while "yoga" alone still finds the yoga in her plan first', yg[0] === 'plan-moves' || yg[0] === 'plan-pmos', yg);
  await go(a.page, 'relief');
  check('1 the relief list: a Wind down row', await has(a.page, '#view .rl-calm [data-go="calm"]') && /Wind down/.test(await txt(a.page, '#view .rl-calm')));
  await go(a.page, 'relief-sleep'); await tap(a.page, '#rl-voice');   /* quiet for this one */
  await tap(a.page, '#rl-start'); for (let i = 0; i < 5; i++) await tap(a.page, '#rl-next');
  check('1 the sleep routine ends with "Keep going: sounds for sleep and yoga nidra"', /Keep going: sounds for sleep/.test(await txt(a.page, '#view .rl-calm-go')));
  await tap(a.page, '#view .rl-calm-go');
  check('1 ... which opens Wind down', (await a.page.evaluate(() => location.hash)) === '#calm' && /Wind down/.test(await view(a.page)));
  await go(a.page, 'relief-calm');
  check('1 only the sleep routine ends with it', !(await has(a.page, '#view .rl-calm-go')));
  await go(a.page, 'relief-sleep'); await tap(a.page, '#rl-again').catch(() => {}); await go(a.page, 'home'); await go(a.page, 'relief-sleep');
  check('1 the sleep routine\'s first screen: Wind down under Start (one tap from her plan\'s bedtime step)', await has(a.page, '#rl-start') && await has(a.page, '#view .rl-calm [data-go="calm"]'));
  await done(a);
  const m = await open({ hash: '#meno-timeline', seed: { dob: '1975-03-01', stage: 'app', intake: { goal: 'meno' } } });
  check('1 midlife: Wind down beside the sleep routine', await has(m.page, '#view [data-go="calm"]') && await has(m.page, '#view [data-go="relief-sleep"]'), (await view(m.page)).slice(0, 300));
  await done(m);
}

/* ---------- 2 the list ---------- */
{
  const a = await open({ hash: '#calm' });
  const v = await view(a.page);
  check('2 the list: 3 guided sessions with their minutes', /Slow breaths[\s\S]*4 min[\s\S]*Bhramari, the humming breath[\s\S]*3 min[\s\S]*Yoga nidra[\s\S]*9 min/.test(v), v.slice(0, 400));
  check('2 ... and 3 sounds for sleep, each with a timer', /Sounds for sleep[\s\S]*Singing bowl and waves[\s\S]*Wandering[\s\S]*Dunes/.test(v) && (v.match(/With a timer/g) || []).length === 3);
  check('2 ... her voice in English (pressed), Hindi beside it', (await attr(a.page, '[data-vl="en"]', 'aria-pressed')) === 'true' && (await attr(a.page, '[data-vl="hi"]', 'aria-pressed')) === 'false');
  check('2 ... the safety card: "not treatment" (Version 39.24: "it keeps playing" is on the session screen)', !/keeps playing with the screen off/.test(v) && /not treatment/.test(v));
  check('2 ... nothing plays on the list', (await audios(a.page)).length === 0);
  check('2 ... every row at least 44 px tall (Version 39.24: rows that play)', await a.page.$$eval('#view .cm-it', (t) => t.length >= 6 && t.every((x) => x.getBoundingClientRect().height >= 44)));
  await shot(a.page, '2-list');
  await done(a);
}

/* ---------- 3 a guided session in a browser ---------- */
{
  const a = await open({ hash: '#calm' });
  await tap(a.page, '#view [data-go="calm-breaths"]');
  let au = await audios(a.page);
  check('3 slow breaths: her English session plays, once, not looped', au.length === 1 && /sounds\/voice\/en\/breaths\.ogg$/.test(au[0].src) && !au[0].loop && !au[0].paused, au);
  check('3 ... on a dark screen over everything (tabs and the Help button under it)', await a.page.evaluate(() => { const n = document.querySelector('.cm-night'); if (!n || getComputedStyle(n).position !== 'fixed') return false;
    return [[window.innerWidth / 2, window.innerHeight - 6], [window.innerWidth - 30, window.innerHeight - 110], [window.innerWidth / 2, 4]].every(([x, y]) => { const e = document.elementFromPoint(x, y); return e && !!e.closest('.cm-night'); }); }));
  check('3 ... its name, and its length from her timeline', /Slow breaths/.test(await txt(a.page, '.cm-top h2')) && (await txt(a.page, '#cm-len')) === '3:46');
  const in4 = cue('breaths-en', 'in4'), out6 = cue('breaths-en', 'out6'), sb3 = cue('breaths-en', 'sb3');
  await seek(a.page, in4.t + 1.5, TL['breaths-en'].len);
  check('3 ... as she counts in: "Breathe in", 2', (await label(a.page)) === 'Breathe in' && (await count(a.page)) === '2', [await label(a.page), await count(a.page)]);
  const r1 = await a.page.$eval('.cm-orb circle:last-of-type', (c) => +c.getAttribute('r'));
  await seek(a.page, out6.t + 3.2);
  check('3 ... as she counts out: "Breathe out", 4, the light smaller', (await label(a.page)) === 'Breathe out' && (await count(a.page)) === '4' && (await a.page.$eval('.cm-orb circle:last-of-type', (c) => +c.getAttribute('r'))) < r1 + 30, [await label(a.page), await count(a.page)]);
  await seek(a.page, sb3.t + sb3.d + 1);
  check('3 ... then at her own pace (no count)', (await label(a.page)) === 'Breathe in · At your own pace' && (await count(a.page)) === '', await label(a.page));
  check('3 ... the clock and the bar follow her voice', (await txt(a.page, '#cm-time')) === '0:59' && await a.page.$eval('#cm-prog', (e) => parseFloat(e.style.width) > 20 && parseFloat(e.style.width) < 40), await txt(a.page, '#cm-time'));
  await shot(a.page, '3-breaths');
  await tap(a.page, '#cm-play');
  check('3 ... Pause pauses, the button says Play', (await audios(a.page))[0].paused && (await attr(a.page, '#cm-play', 'aria-label')) === 'Play');
  await tap(a.page, '#cm-play');
  check('3 ... Play carries on from there', !(await audios(a.page))[0].paused && (await audios(a.page)).length === 1 && (await attr(a.page, '#cm-play', 'aria-label')) === 'Pause');
  await a.page.evaluate(() => window.Saathi.render()); await settle(a.page, 300);
  check('3 ... a new draw of the page keeps it playing', (await audios(a.page)).length === 1 && !(await audios(a.page))[0].paused);
  await a.page.evaluate((len) => { const x = window.__audio[0]; x.duration = len; x.currentTime = len; x.paused = true; x.ended = true; }, TL['breaths-en'].len); await settle(a.page, 300);
  check('3 ... at the end: "Sleep well" (Version 39.24)', /Sleep well/.test(await txt(a.page, '.cm-end')));
  await tap(a.page, '#cm-done'); await tap(a.page, '#view [data-go="calm-breaths"]');
  au = await audios(a.page);
  check('3 ... and the next time it starts again from the beginning', au.length === 2 && !au[1].paused && /breaths\.ogg$/.test(au[1].src));
  await tap(a.page, '#cm-x');
  check('3 ... close stops it and goes back to the list', (await audios(a.page))[1].paused && (await a.page.evaluate(() => location.hash)) === '#calm' && (await a.page.evaluate(() => window.Saathi.calm.playing())) === null);
  await tap(a.page, '#view [data-go="calm-nidra"]'); await go(a.page, 'home');
  check('3 ... leaving the player any other way keeps it playing, with the bar (Version 39.24)', (await audios(a.page)).some((x) => !x.paused) && await a.page.$('#cm-mini').then((x) => !!x));
  await tap(a.page, '#cm-mi-x');
  check('3 ... and the bar\'s ✕ stops it', (await audios(a.page)).every((x) => x.paused) && !(await a.page.$('#cm-mini')));
  await done(a);
}

/* ---------- 4 Bhramari and yoga nidra ---------- */
{
  const a = await open({ hash: '#calm-bhramari' });
  const hum = cue('bhramari-en', 'humreal'), bh3 = cue('bhramari-en', 'bh3');
  check('4 Bhramari: her English session, with the real hum in it', /sounds\/voice\/en\/bhramari\.ogg$/.test((await audios(a.page))[0].src));
  await seek(a.page, hum.t + 3, TL['bhramari-en'].len);
  check('4 ... while she hums: "Hum… mmm", the rings go out', (await label(a.page)) === 'Hum… mmm' && await a.page.$$eval('.cm-orb circle[stroke]', (r) => r.some((x) => +x.getAttribute('opacity') > 0)), await label(a.page));
  await seek(a.page, bh3.t + bh3.d + 4.5);
  check('4 ... then a 9-second hum at her own pace', (await label(a.page)) === 'Hum… mmm · At your own pace', await label(a.page));
  await shot(a.page, '4-bhramari');
  await go(a.page, 'calm-nidra');
  const key = 'nidra-en', yn5 = cue(key, 'yn5'), yn9 = cue(key, 'yn9');
  await seek(a.page, yn5.items[3] + 0.5, TL[key].len);
  check('4 yoga nidra: a warm light on each part she names', +(await attr(a.page, '.cm-nidra circle', 'opacity')) > 0.9 && (await a.page.$$('.cm-body .lit')).length === 0);
  await seek(a.page, yn9.items[0] + 0.5);
  check('4 ... "the whole right leg" lights one leg', (await a.page.$$('.cm-body .lit')).length === 1);
  await seek(a.page, yn9.items[9] + 0.5);
  check('4 ... "the whole body" lights all of her', (await a.page.$$('.cm-body .lit')).length === 6);
  await seek(a.page, cue(key, 'yn13').t + 2);
  check('4 ... the calm place at dawn', (await attr(a.page, '.cm-night', 'data-scene')) === 'dawn');
  await shot(a.page, '4-nidra-dawn');
  await seek(a.page, cue(key, 'yn15').t + 2);
  check('4 ... and night as she drifts off', (await attr(a.page, '.cm-night', 'data-scene')) === 'night');
  check('4 ... no pregnancy line when she isn\'t pregnant', !(await has(a.page, '.cm-note')));
  await done(a);
  const p = await open({ hash: '#calm-nidra', seed: { situation: { pregnant: true }, preg: { lmp: ago(140) } } });
  check('4 pregnant: yoga nidra says to lie on her left side, not flat on her back', /left side with a pillow, not flat on your back/.test(await txt(p.page, '.cm-note')));
  await go(p.page, 'calm-breaths');
  check('4 ... only for yoga nidra', !(await has(p.page, '.cm-note')));
  await done(p);
}

/* ---------- 5 Hindi ---------- */
{
  const a = await open({ hash: '#calm', w: 360, h: 780 });
  await tap(a.page, '[data-vl="hi"]');
  check('5 her voice in Hindi: kept on her phone', (await calm(a.page)).vl === 'hi' && (await attr(a.page, '[data-vl="hi"]', 'aria-pressed')) === 'true');
  await tap(a.page, '#view [data-go="calm-nidra"]');
  check('5 ... yoga nidra in her Hindi voice, with the Hindi timeline', /sounds\/voice\/hi\/nidra\.ogg$/.test((await audios(a.page))[0].src) && (await txt(a.page, '#cm-len')) === '8:38', [(await audios(a.page))[0].src, await txt(a.page, '#cm-len')]);
  await done(a);
  const b = await open({ hash: '#calm', w: 360, h: 780, seed: { lang: 'hi' } });
  const v = await view(b.page);
  check('5 a Hindi app: "सुकून के पल", her voice in Hindi to start with', /सुकून के पल/.test(v) && (await attr(b.page, '[data-vl="hi"]', 'aria-pressed')) === 'true' && /धीमी साँसें[\s\S]*भ्रामरी[\s\S]*योग निद्रा[\s\S]*नींद के लिए आवाज़ें/.test(v));
  check('5 ... no sideways scroll at 360 px, every tile name inside its tile', await noScroll(b.page) && await b.page.$$eval('#view .cm-it strong', (s) => s.length >= 6 && s.every((x) => x.scrollWidth <= x.clientWidth + 1)));
  await shot(b.page, '5-list-hi');
  await tap(b.page, '#view [data-go="calm-breaths"]');
  await seek(b.page, cue('breaths-hi', 'in4').t + 1.5, TL['breaths-hi'].len);
  check('5 ... the Hindi player: "साँस अंदर", Hindi slow breaths, no sideways scroll', (await label(b.page)) === 'साँस अंदर' && /sounds\/voice\/hi\/breaths\.ogg$/.test((await audios(b.page))[0].src) && await noScroll(b.page), await label(b.page));
  await shot(b.page, '5-breaths-hi');
  await go(b.page, 'calm-dunes');
  check('5 ... the timer in Hindi, its chips fit', /इतनी देर बाद बंद/.test(await txt(b.page, '.cm-timer')) && await noScroll(b.page));
  await done(b);
}

/* ---------- 6 a sound with a timer ---------- */
{
  const a = await open({ hash: '#calm-bowl' });
  let au = await audios(a.page);
  check('6 the singing bowl: its sound, looped', au.length === 1 && /sounds\/music\/bowl\.ogg$/.test(au[0].src) && au[0].loop && !au[0].paused, au);
  check('6 ... 30 minutes unless she picks, its bowl of light', (await attr(a.page, '[data-min="30"]', 'aria-pressed')) === 'true' && (await txt(a.page, '#cm-len')) === '30:00' && await has(a.page, '.cm-bowl'));
  await tap(a.page, '[data-min="15"]');
  check('6 ... she picks 15: kept on her phone, 15:00', (await calm(a.page)).mins === 15 && (await txt(a.page, '#cm-len')) === '15:00' && (await attr(a.page, '[data-min="15"]', 'aria-pressed')) === 'true');
  await a.page.clock.fastForward(14.5 * 60 * 1000); await settle(a.page, 300);
  au = await audios(a.page);
  check('6 ... its last minute fades out', au[0].volume > 0.35 && au[0].volume < 0.65 && !au[0].paused, au[0]);
  await a.page.clock.fastForward(40 * 1000); await settle(a.page, 300);
  au = await audios(a.page);
  check('6 ... and it stops after 15 minutes, the button says Play', au[0].paused && (await attr(a.page, '#cm-play', 'aria-label')) === 'Play');
  await tap(a.page, '#cm-play');
  au = await audios(a.page);
  check('6 ... Play starts it again', au.length === 2 && !au[1].paused && au[1].loop);
  await go(a.page, 'calm-wandering');
  check('6 Wandering: waves of light', /sounds\/music\/wandering\.ogg$/.test((await audios(a.page))[2].src) && await has(a.page, '.cm-waves') && (await txt(a.page, '#cm-len')) === '15:00');
  await go(a.page, 'calm-dunes');
  check('6 Dunes: warm waves', /sounds\/music\/dunes\.ogg$/.test((await audios(a.page))[3].src) && (await attr(a.page, '.cm-waves path', 'fill')) === '#C98A4B');
  await shot(a.page, '6-dunes');
  await done(a);
}

/* ---------- 7 on the phone ---------- */
{
  const a = await open({ hash: '#calm-dunes', native: true });
  let c = await calls(a.page);
  check('7 Android plays it: path, looped, her 30 minutes, the notification\'s words, Stop', JSON.stringify(c.find((x) => x[0] === 'play')) === JSON.stringify(['play', 'sounds/music/dunes.ogg', true, 30, 'Dunes', 'Playing. Tap to open.', 'Stop', false]), c);
  check('7 ... and not the browser too; the screen may sleep', (await audios(a.page)).length === 0 && !c.some((x) => x[0] === 'awake' && x[1] === true));
  await a.page.evaluate(() => { window.__st = { playing: true, pos: 50, dur: 160, left: 1675, played: 125 }; }); await settle(a.page, 300);
  check('7 ... the player shows what Android played', /^2:0\d$/.test(await txt(a.page, '#cm-time')), await txt(a.page, '#cm-time'));
  await tap(a.page, '#cm-play'); await tap(a.page, '#cm-play'); await tap(a.page, '[data-min="45"]');
  c = await calls(a.page);
  check('7 ... pause, play and her timer go to Android', c.some((x) => x[0] === 'pause') && c.some((x) => x[0] === 'resume') && c.some((x) => x[0] === 'timer' && x[1] === 45), c);
  await a.page.evaluate(() => { window.__calls = []; }); await go(a.page, 'home');
  check('7 ... leaving the player keeps it playing, with the bar (Version 39.24)', !(await calls(a.page)).some((x) => x[0] === 'stop') && await a.page.$('#cm-mini').then((x) => !!x));
  await tap(a.page, '#cm-mi-x');
  check('7 ... and the bar\'s ✕ stops it', (await calls(a.page)).some((x) => x[0] === 'stop') && !(await a.page.$('#cm-mini')));
  await a.page.evaluate(() => { window.__calls = []; }); await go(a.page, 'calm-nidra');
  c = await calls(a.page);
  check('7 a guided session: not looped, no timer, the screen kept on', JSON.stringify(c.find((x) => x[0] === 'play')) === JSON.stringify(['play', 'sounds/voice/en/nidra.ogg', false, 0, 'Yoga nidra', 'Playing. Tap to open.', 'Stop', false]) && c.some((x) => x[0] === 'awake' && x[1] === true), c);
  await a.page.evaluate((len) => { window.__st = { playing: false, pos: len, dur: len, left: -1, played: len }; }, TL['nidra-en'].len); await settle(a.page, 300);
  check('7 ... when it ends: the screen may sleep, and "Sleep well" (Version 39.24)', (await calls(a.page)).some((x) => x[0] === 'awake' && x[1] === false) && /Sleep well/.test(await txt(a.page, '.cm-end')));
  await tap(a.page, '#cm-done'); await a.page.evaluate(() => { window.__calls = []; window.__st = null; }); await go(a.page, 'calm-nidra');
  check('7 ... the next time starts it again', (await calls(a.page)).some((x) => x[0] === 'play' && x[1] === 'sounds/voice/en/nidra.ogg'));
  await done(a);
  const b = await open({ hash: '#calm-nidra', native: true, seed: { settings: { discreet: true } } });
  const bp = (await calls(b.page)).find((x) => x[0] === 'play');
  check('7 discreet: the notification says only "Wind down", and stays off the lock screen', bp[4] === 'Wind down' && bp[7] === true, bp);
  await done(b);
  const sh = await open({ hash: '#home', native: true, seed: { settings: { shared: true } } });
  await tap(sh.page, '#rest-open'); await go(sh.page, 'calm-breaths');
  const sp = (await calls(sh.page)).find((x) => x[0] === 'play');
  check('7 a shared phone: the same', !!sp && sp[4] === 'Wind down' && sp[7] === true, sp);
  await done(sh);
  const h = await open({ hash: '#calm-bowl', native: true, seed: { lang: 'hi' } });
  check('7 Hindi: the notification\'s words in Hindi', JSON.stringify((await calls(h.page)).find((x) => x[0] === 'play').slice(4)) === JSON.stringify(['सिंगिंग बाउल और लहरें', 'चल रहा है। खोलने के लिए टैप करें।', 'बंद करें', false]), (await calls(h.page)).find((x) => x[0] === 'play'));
  await done(h);
}

/* ---------- 8 the relief routines in her voice ---------- */
{
  const a = await open({ hash: '#relief-sleep' });
  check('8 the voice is on to start with', await a.page.$eval('#rl-voice', (x) => x.checked));
  await tap(a.page, '#rl-start');
  let au = await audios(a.page);
  check('8 step 1 in her voice', au.length === 1 && /sounds\/voice\/en\/rl-s1\.ogg$/.test(au[0].src) && !au[0].paused, au);
  await tap(a.page, '#rl-next');
  au = await audios(a.page);
  check('8 ... Next: step 1 stops, step 2 speaks', au.length === 2 && au[0].paused && /rl-s2\.ogg$/.test(au[1].src) && !au[1].paused, au);
  await tap(a.page, '#rl-pause');
  check('8 ... Pause stops her voice', (await audios(a.page))[1].paused);
  await tap(a.page, '#rl-pause'); await tap(a.page, '#rl-next'); await tap(a.page, '#rl-next'); await tap(a.page, '#rl-next');
  check('8 ... the last step: a mantra or prayer, in her voice', /rl-s5\.ogg$/.test((await audios(a.page)).slice(-1)[0].src));
  await go(a.page, 'home');
  check('8 ... leaving stops her voice', (await audios(a.page)).every((x) => x.paused));
  await done(a);
  const h = await open({ hash: '#relief-calm', seed: { lang: 'hi' } });
  await tap(h.page, '#rl-start');
  check('8 Hindi: the calm routine in her Hindi voice', /sounds\/voice\/hi\/rl-m1\.ogg$/.test(((await audios(h.page))[0] || {}).src || ''));
  await done(h);
  const n = await open({ hash: '#relief-cramps', native: true });
  await tap(n.page, '#rl-start');
  let c = await calls(n.page);
  check('8 on the phone: Android plays the step\'s clip', c.some((x) => x[0] === 'clip' && x[1] === 'sounds/voice/en/rl-c1.ogg') && (await audios(n.page)).length === 0, c);
  await go(n.page, 'home');
  check('8 ... and stops it on leaving', (await calls(n.page)).some((x) => x[0] === 'clipStop'));
  await done(n);
  const s = await open({ hash: '#home', seed: { settings: { shared: true } } });
  await tap(s.page, '#rest-open'); await go(s.page, 'relief-sleep');
  check('8 a shared phone: the voice is off to start with', !(await s.page.$eval('#rl-voice', (x) => x.checked)));
  await tap(s.page, '#rl-start');
  check('8 ... so the step is quiet', (await audios(s.page)).length === 0);
  await done(s);
  const o = await open({ hash: '#relief-hot' });
  await tap(o.page, '#rl-voice'); await tap(o.page, '#rl-start');
  check('8 her voice turned off: quiet', (await audios(o.page)).length === 0);
  await done(o);
}

/* ---------- 9 the files ---------- */
{
  const SND = path.join(root, 'sounds');
  /* an Ogg Opus file's length: its last page's granule position, less the pre-skip, at 48 kHz */
  const opus = (f) => { if (!fs.existsSync(f)) return -1; const b = fs.readFileSync(f); const h = b.indexOf('OpusHead'); if (b.toString('latin1', 0, 4) !== 'OggS' || h < 0) return -2;
    const last = b.lastIndexOf('OggS'); return (Number(b.readBigUInt64LE(last + 6)) - b.readUInt16LE(h + 10)) / 48000; };
  const bad = [];
  for (const id of ['breaths', 'bhramari', 'nidra']) for (const l of ['en', 'hi']) { const s = opus(path.join(SND, 'voice', l, id + '.ogg')); const tl = TL[id + '-' + l]; if (!tl || s < 0 || Math.abs(s - tl.len) > 1) bad.push([id, l, s, tl && tl.len]); }
  check('9 each session in English and Hindi: Opus, as long as its timeline', !bad.length, bad);
  const rel = fs.readFileSync(path.join(root, 'mods', 'relief.js'), 'utf8'); const steps = [...rel.matchAll(/\['([cnsmh]\d)', (\d+)/g)].map((m) => [m[1], +m[2]]);
  const badc = [];
  for (const [k, sec] of steps) for (const l of ['en', 'hi']) { const s = opus(path.join(SND, 'voice', l, 'rl-' + k + '.ogg')); if (s <= 0 || s > sec - 1) badc.push([k, l, s, sec]); }
  check('9 every relief step has her clip in English and Hindi, shorter than its step (' + steps.length + ' steps)', steps.length === 20 && !badc.length, badc);
  /* the clip says the routine's reviewed words (her heading, then the step): a changed step needs a new recording */
  const voice = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'voice', 'sessions.json'), 'utf8')).clips; const wd = (x) => String(x || '').replace(/<#[\d.]+#>/g, ' ').replace(/[.।,:;!?…‘’'"()\-–]/g, ' ').replace(/\s+/g, ' ').trim();
  const strs = {}; for (const l of ['en', 'hi']) { const b = await browser.newContext(); await b.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';'); await b.addInitScript('localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf({ lang: l }))) + ');'); const pg = await b.newPage(); await pg.goto(PAGE + '#home'); await pg.waitForFunction(() => !!window.Saathi);
    strs[l] = await pg.evaluate((ks) => Object.fromEntries(ks.map((k) => [k, window.Saathi.t('relief_' + k + '_h') + '. ' + window.Saathi.t('relief_' + k + '_p')])), steps.map((s) => s[0])); await b.close(); }
  const stale = []; for (const [k] of steps) for (const l of ['en', 'hi']) if (wd(voice[l]['rl-' + k]) !== wd(strs[l][k])) stale.push([l, k, wd(voice[l]['rl-' + k]).slice(0, 60), wd(strs[l][k]).slice(0, 60)]);
  check('9 each clip says the routine\'s words exactly, in both languages', !stale.length, stale);
  const music = ['bowl', 'wandering', 'dunes'].map((m) => opus(path.join(SND, 'music', m + '.ogg')));
  check('9 the 3 sounds for sleep: Opus, each over a minute', music.every((s) => s > 60), music);
  const cr = fs.existsSync(path.join(SND, 'CREDITS.md')) ? fs.readFileSync(path.join(SND, 'CREDITS.md'), 'utf8') : '';
  check('9 CREDITS.md: the 3 Freesound recordings (CC0), Dr. Megha\'s voice and the hum', /479206/.test(cr) && /455855/.test(cr) && /447511/.test(cr) && /CC0/.test(cr) && /Megha/.test(cr) && /hum/i.test(cr));
  const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
  check('9 all the sounds together under 20 MB (the APK stays under its 30 MB ceiling)', size(SND) < 20 * 1024 * 1024, size(SND));
  const sh = fs.readFileSync(path.join(root, '..', 'android', 'build-apk.sh'), 'utf8'), mf = fs.readFileSync(path.join(root, '..', 'android', 'AndroidManifest.xml'), 'utf8');
  const gk = fs.readFileSync(path.join(root, '..', 'android', 'build.gradle.kts'), 'utf8');   // Version 39.79: Gradle packs the app
  check('9 the APK bundles them, uncompressed, and plays them in a media service', /sounds\/voice/.test(sh) && /sounds\/timelines\.js/.test(sh) && /noCompress \+= listOf\("ogg"/.test(gk) &&
    /SoundService" android:exported="false" android:foregroundServiceType="mediaPlayback"/.test(mf) && /FOREGROUND_SERVICE_MEDIA_PLAYBACK/.test(mf));
  check('9 the page loads the timelines before the modules', /<script src="sounds\/timelines\.js"[^>]*><\/script>[\s\S]*<script src="mods\/calm\.js"/.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8')));
}

await browser.close();
check('no page errors', !errsAll.length, errsAll);
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' calm checks passed');
process.exit(failed.length ? 1 : 0);
