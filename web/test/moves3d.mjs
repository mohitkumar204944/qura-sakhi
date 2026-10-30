// Version 39.39: the 3D figure in the routine player, and a rest between moves (Mohit, 29 Oct: "build it into the player
// with the rest screen"; mockup claude.ai/artifact/4mTtM4VPZWwrHs5bb1r2Ka; MODULE_API section 82). This file checks:
//   - the routine's list shows each move's 3D still; each move plays its loop (web/fig/v), the sun salutation each flow once;
//   - "reduce motion" shows the still; the left side is mirrored; a video that can't play gives way to the still;
//   - a build without web/fig, or SAKHI_CONFIG.fig === false, keeps the drawings;
//   - the rest: 15 seconds in Strength at home, 10 in Gentle start and Cycle care, none between sides, before Shavasana or in
//     the sun salutation; +20s, Pause, Skip rest, and "Next" on a move skipping its rest; Previous; the next move's picture;
//     the voice line; the screen kept on; the rest counted in her minutes;
//   - the seated forward bend (child pose with knee pain) has its own loop;
//   - Hindi at 360 px, no page errors, nothing sent anywhere;
//   - on Mohit's Flip5 (360 x 800) and a small phone, Previous, Pause and Next stay above the tab bar, tappable, with the
//     timer in view, however many lines the move's words take (30 Oct: "fix the buttons").
// Usage: node test/moves3d.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'moves3d'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-23', NOW = '2026-10-23T10:00:00+05:30';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const pmosEvents = () => { const out = []; let a = 20; const starts = [a]; [61, 38, 52, 46].forEach((g) => { a += g; starts.unshift(a); }); starts.forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 5), t: 'end' })); return out; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, events: pmosEvents(), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off', notifyIntro: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya', pincode: '302001', activeOn: TODAY };
const ANDROID = 'window.SakhiAndroid = { schedule(j){ window.__sched = j; return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){ window.__buzz = (window.__buzz || 0) + 1; }, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(on){ window.__awake = on; } };';
const DEMO = { api: 'https://api.test.invalid', app: 'test-0.39-pilot', platform: 'android' };
const started = (extra) => Object.assign({ start: TODAY, goal: 'cycles', level: 0, limits: { knees: false, back: false }, food: 'veg', region: 'west', focus: 'habits', log: {}, weeks: {}, body: [] }, extra || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.width || 390, height: o.height || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: o.still ? 'reduce' : 'no-preference' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, DEMO, o.cfg || {})) + ';');
  await ctx.addInitScript(ANDROID);
  // the voice: what the player asks the phone to say
  await ctx.addInitScript('window.__said = []; (function () { const vs = [{ name: "English India", lang: "en-IN", localService: true, default: true, voiceURI: "en-IN" }, { name: "Hindi India", lang: "hi-IN", localService: true, default: false, voiceURI: "hi-IN" }];' +
    ' const fake = { speaking: false, pending: false, getVoices: function () { return vs; }, speak: function (u) { window.__said.push(u.text); }, cancel: function () {}, pause: function () {}, resume: function () {}, addEventListener: function () {}, removeEventListener: function () {} };' +
    ' try { Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true }); } catch (e) {} window.SpeechSynthesisUtterance = function (t) { this.text = t; }; })();');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(Object.assign({ lang: o.lang || 'en' }, o.seed || {})))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  const sent = [];
  await ctx.route(/^https?:/, (r) => { sent.push(r.request().method() + ' ' + r.request().url()); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(NOW) });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  await page.evaluate((x) => { const S = window.Saathi; S.state.mods = S.state.mods || {}; S.state.mods.plan = x; S.save(); S.render(); }, started(o.plan));
  if (o.pre) await page.evaluate(o.pre);
  return { ctx, page, errs, sent };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(12); } }
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 400); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const attr = (page, sel, a) => page.$eval(sel, (e, a) => e.getAttribute(a), a).catch(() => null);
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.state.mods || {}).plan || null)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
/* a video that really plays: a frame decoded and its clock moving (in real time; the page's timers are fake) */
async function playing(page) {
  await sleep(900);
  const a = await page.$eval('video#pl-fig3d', (v) => ({ t: v.currentTime, r: v.readyState, p: v.paused })).catch(() => null);
  await sleep(500);
  const b = await page.$eval('video#pl-fig3d', (v) => ({ t: v.currentTime, r: v.readyState, p: v.paused })).catch(() => null);
  return !!(a && b && b.r >= 2 && !b.p && b.t > a.t);
}
/* a flow that plays once: it got going, or it has already ended on its last frame */
async function played(page) {
  await sleep(1200);
  return page.$eval('video#pl-fig3d', (v) => v.ended || v.currentTime > 0.4).catch(() => false);
}
const secs = (s) => { const m = /(\d+):(\d\d)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : -1; };
/* runs the clock a quarter second at a time until the rest begins, so its first second can be read */
async function toRest(page, most) { for (let i = 0; i < (most || 400) && !(await has(page, '#pl-rest')); i++) await settle(page, 250); }

/* ---------- 1. Strength at home: the list, each move's loop, and the rest ---------- */
{
  const { ctx, page, errs, sent } = await open();
  await go(page, 'plan-r-strength');
  const thumbs = await page.$$eval('.pl-pitem .pl-thumb img.pl-3d', (x) => x.map((i) => i.getAttribute('src')));
  check('1 the routine\'s list shows each move\'s 3D still', thumbs.length >= 6 && thumbs.every((s) => /^fig\/s\/[a-z0-9]+\.webp$/.test(s)) && thumbs.indexOf('fig/s/chair.webp') >= 0, thumbs);
  check('1 ... and no drawings', !(await has(page, '.pl-pitem svg.pl-fig')));
  await tap(page, '#pl-pstart');
  const v1 = await page.$eval('video#pl-fig3d', (v) => ({ src: v.getAttribute('src'), muted: v.muted, loop: v.loop, inline: v.hasAttribute('playsinline'), poster: v.getAttribute('poster') })).catch(() => null);
  check('1 move 1 plays its 3D loop: muted, looping, in the page, with its still as the poster', !!v1 && v1.src === 'fig/v/warmup.webm' && v1.muted && v1.loop && v1.inline && v1.poster === 'fig/s/warmup.webp', v1);
  check('1 ... in the picture box, with no drawing', (await has(page, '.pl-figbox.pl-fb3d video#pl-fig3d')) && !(await has(page, '#pl-fig')));
  check('1 the loop really plays', await playing(page));
  await shot(page, '1-move-3d');
  check('1 the first move has no Previous', !(await has(page, '#pl-prev')) && (await has(page, '#pl-pause')) && (await has(page, '#pl-next')));
  await tap(page, '#pl-pause');
  check('1 Pause stops the loop as well as the timer', await page.$eval('video#pl-fig3d', (v) => v.paused));
  const tp = await txt(page, '#pl-time'); await settle(page, 2000);
  check('1 ... and the timer stands still', (await txt(page, '#pl-time')) === tp, [tp, await txt(page, '#pl-time')]);
  await tap(page, '#pl-pause');
  await settle(page, 57000); await toRest(page); await settle(page, 300);   /* the voice starts 150 ms into the rest */
  check('1 when a move\'s time ends she rests', await has(page, '#pl-rest'), (await view(page)).slice(0, 200));
  const r1 = await view(page);
  check('1 the rest says which move is done, "Rest", and 15 seconds in Strength at home', /Move 1 of 12 done/i.test(r1) && /\bRest\b/.test(r1) && secs(await txt(page, '#pl-rtime')) >= 14, [r1.slice(0, 200), await txt(page, '#pl-rtime')]);
  check('1 the rest shows the next move: its picture, name and words', (await attr(page, '#pl-nextcard img.pl-3d', 'src')) === 'fig/s/march.webp' && /next/i.test(await txt(page, '#pl-nextcard')) && /March on the spot/.test(await txt(page, '#pl-nextcard')) && /Lift your knees/.test(await txt(page, '#pl-nextcard')), [await attr(page, '#pl-nextcard img', 'src'), await txt(page, '#pl-nextcard')]);
  check('1 the voice says "Rest. Next: March on the spot."', (await page.evaluate(() => window.__said.join(' | '))).indexOf('Rest. Next: March on the spot.') >= 0, await page.evaluate(() => window.__said));
  check('1 the screen stays on while she rests', (await page.evaluate(() => window.__awake)) === true);
  const before = secs(await txt(page, '#pl-rtime')); await tap(page, '#pl-more'); const after = secs(await txt(page, '#pl-rtime'));
  check('1 +20s adds 20 seconds', after >= before + 19 && after <= before + 20, [before, after]);
  await tap(page, '#pl-pause'); const rt = await txt(page, '#pl-rtime'); await settle(page, 3000);
  check('1 Pause holds the rest too', (await txt(page, '#pl-rtime')) === rt);
  await tap(page, '#pl-pause');
  await shot(page, '1-rest-en');
  await tap(page, '#pl-skip');
  check('1 Skip rest starts the next move', /Move 2 of 12/i.test(await view(page)) && (await attr(page, 'video#pl-fig3d', 'src')) === 'fig/v/march.webm', (await view(page)).slice(0, 120));
  await tap(page, '#pl-prev');
  check('1 Previous goes back a move and starts its time again', /Move 1 of 12/i.test(await view(page)) && /1:00|0:59/.test(await txt(page, '#pl-time')), [(await view(page)).slice(0, 80), await txt(page, '#pl-time')]);
  await tap(page, '#pl-next');
  check('1 "Next" on a move skips its rest', /Move 2 of 12/i.test(await view(page)) && !(await has(page, '#pl-rest')));
  await settle(page, 61000); await settle(page, 15500);
  check('1 a rest that runs out starts the next move by itself: chair squats, set 1 of 2, its own loop', /Move 3 of 12/i.test(await view(page)) && /Set 1 of 2/i.test(await view(page)) && (await attr(page, 'video#pl-fig3d', 'src')) === 'fig/v/chair.webm', (await view(page)).slice(0, 160));
  await settle(page, 45500);
  check('1 between sets she rests too, and Next names set 2', (await has(page, '#pl-rest')) && /Set 1 of 2 done/i.test(await view(page)) && /Set 2 of 2/i.test(await txt(page, '#pl-nextcard')), (await view(page)).slice(0, 200));
  check('1 nothing was sent anywhere, and no page errors', !sent.length && !errs.length, [sent, errs]);
  await ctx.close();
}

/* ---------- 2. The whole of Strength at home on its timers: the rests count in her minutes ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, 'plan-r-strength'); await tap(page, '#pl-pstart');
  for (let i = 0; i < 30 && !(/Well done/.test(await view(page))); i++) await settle(page, 30000);
  const p = await plan(page);
  // 570 seconds of moves and 9 rests of 15 seconds: 705 seconds, so 12 minutes
  check('2 the whole routine runs on its timers, rests and all, to "Well done"', /Well done/.test(await view(page)), (await view(page)).slice(0, 200));
  check('2 her minutes count the rests (12, not the 10 her moves alone take)', ((p.log || {})[TODAY] || {}).min === 12, (p.log || {})[TODAY]);
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Gentle start: 10 seconds, none between sides or before Shavasana; the left side mirrored ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, 'plan-r-gentle'); await tap(page, '#pl-pstart');
  await settle(page, 58000); await toRest(page);
  check('3 Gentle start rests 10 seconds', (await has(page, '#pl-rest')) && secs(await txt(page, '#pl-rtime')) >= 9 && secs(await txt(page, '#pl-rtime')) <= 10, await txt(page, '#pl-rtime'));
  for (let i = 0; i < 12 && !/Vrikshasana/.test(await view(page)); i++) await tap(page, (await has(page, '#pl-skip')) ? '#pl-skip' : '#pl-next');
  check('3 the tree pose, right side, plays its still (a held pose)', /Right side/i.test(await view(page)) && (await attr(page, 'img#pl-fig3d', 'src')) === 'fig/s/tree.webp', (await view(page)).slice(0, 120));
  await settle(page, 20500);
  check('3 no rest between her right and left side', /Left side/i.test(await view(page)) && !(await has(page, '#pl-rest')), (await view(page)).slice(0, 120));
  check('3 the left side is the same picture, mirrored', await has(page, 'img#pl-fig3d.pl-mirror'));
  for (let i = 0; i < 20 && !/Pavanamuktasana/.test(await view(page)); i++) await tap(page, (await has(page, '#pl-skip')) ? '#pl-skip' : '#pl-next');
  await settle(page, 30500);
  check('3 no rest before Shavasana (it is the rest)', /Shavasana/.test(await view(page)) && !(await has(page, '#pl-rest')), (await view(page)).slice(0, 120));
  check('3 Shavasana shows her lying still, eyes closed', (await attr(page, 'img#pl-fig3d', 'src')) === 'fig/s/rest.webp');
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. The sun salutation: each flow plays once, no rests; the seated forward bend; Calm breath ---------- */
{
  const { ctx, page, errs } = await open({ plan: { start: ago(40) } });
  await go(page, 'plan-r-sun'); await tap(page, '#pl-pstart'); await tap(page, '#pl-next');
  check('4 the sun salutation opens on its first position, a still', /Round 1/i.test(await view(page)) && (await attr(page, 'img#pl-fig3d', 'src')) === 'fig/s/sun-00.webp', (await view(page)).slice(0, 120));
  await settle(page, 6500);
  const s1 = await page.$eval('video#pl-fig3d', (v) => ({ src: v.getAttribute('src'), loop: v.loop })).catch(() => null);
  check('4 each next position flows in once (no loop), with no rest between', !(await has(page, '#pl-rest')) && !!s1 && s1.src === 'fig/v/sun-01.webm' && s1.loop === false, s1);
  check('4 the flow really plays', await played(page));
  await settle(page, 6500);
  check('4 ... and the next one', (await attr(page, 'video#pl-fig3d', 'src')) === 'fig/v/sun-02.webm' && !(await has(page, '#pl-rest')));
  await ctx.close();
  const k = await open({ plan: { limits: { knees: true, back: false } } });
  await go(k.page, 'plan-r-cycle'); await tap(k.page, '#pl-pstart'); await tap(k.page, '#pl-next');
  check('4 with knee pain, child pose becomes the seated forward bend, with its own loop (not chair squats)', /Seated forward bend/.test(await view(k.page)) && (await attr(k.page, 'video#pl-fig3d', 'src')) === 'fig/v/chairfwd.webm', (await view(k.page)).slice(0, 120));
  await k.ctx.close();
  const c = await open();
  await go(c.page, 'plan-r-calm'); await tap(c.page, '#pl-pstart');
  check('4 Calm breath shows her sitting, eyes closed', (await attr(c.page, 'img#pl-fig3d', 'src')) === 'fig/s/sit.webp');
  await settle(c.page, 180500);
  check('4 Calm breath has no rests', /Move 2 of 3/i.test(await view(c.page)) && !(await has(c.page, '#pl-rest')), (await view(c.page)).slice(0, 120));
  check('4 no page errors', !errs.length && !k.errs.length && !c.errs.length, [errs, k.errs, c.errs]);
  await c.ctx.close();
}

/* ---------- 5. Reduce motion, a video that can't play, and builds without the 3D figure ---------- */
{
  const s = await open({ still: true });
  await go(s.page, 'plan-r-strength'); await tap(s.page, '#pl-pstart');
  check('5 "reduce motion" on the phone: her still, no video', (await attr(s.page, 'img#pl-fig3d', 'src')) === 'fig/s/warmup.webp' && !(await has(s.page, 'video')));
  await s.ctx.close();
  // a loop the manifest lists but the build lacks: the video fails and the move's still takes its place
  const b = await open({ pre: () => { window.SAKHI_FIG.loops.push('tree'); } });
  await go(b.page, 'plan-r-gentle'); await tap(b.page, '#pl-pstart');
  for (let i = 0; i < 12 && !/Vrikshasana/.test(await view(b.page)); i++) await tap(b.page, (await has(b.page, '#pl-skip')) ? '#pl-skip' : '#pl-next');
  await sleep(800); await settle(b.page, 300);
  check('5 a video that can\'t play gives way to the move\'s still', (await attr(b.page, 'img#pl-fig3d', 'src')) === 'fig/s/tree.webp' && !(await has(b.page, 'video')));
  check('5 ... with no page errors', !b.errs.length, b.errs);
  await b.ctx.close();
  for (const [tag, o] of [['SAKHI_CONFIG.fig false', { cfg: { fig: false } }], ['a build without web/fig', { pre: () => { window.SAKHI_FIG = undefined; } }]]) {
    const n = await open(o);
    await go(n.page, 'plan-r-strength');
    const svgs = (await n.page.$$('.pl-pitem svg.pl-fig')).length;
    await tap(n.page, '#pl-pstart');
    check('5 ' + tag + ': the drawings, as before', svgs >= 6 && (await has(n.page, '#pl-fig')) && !(await has(n.page, '#pl-fig3d')), svgs);
    await settle(n.page, 60500);
    check('5 ' + tag + ': the rest still comes, with the next move\'s drawing', (await has(n.page, '#pl-rest')) && (await has(n.page, '#pl-nextcard svg.pl-fig')));
    await n.ctx.close();
  }
}

/* ---------- 6. Hindi at 360 px ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', width: 360 });
  await go(page, 'plan-r-strength'); await tap(page, '#pl-pstart'); await tap(page, '#pl-next');
  check('6 Hindi: Previous is "पिछला"', /पिछला/.test(await txt(page, '#pl-prev')));
  await settle(page, 60500);
  const r = await view(page);
  check('6 Hindi: the rest in Hindi ("आराम", "+20 सेकंड", "आराम छोड़ें", "अगला", "... पूरा")', /आराम/.test(r) && /\+20 सेकंड/.test(r) && /आराम छोड़ें/.test(r) && /अगला/.test(r) && /पूरा/.test(r), r.slice(0, 300));
  check('6 Hindi: the voice line in Hindi', /आराम। अगला: /.test(await page.evaluate(() => window.__said.join(' | '))), await page.evaluate(() => window.__said));
  check('6 Hindi at 360 px: nothing runs off the screen', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  await shot(page, '6-rest-hi');
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. the buttons above the tab bar (Mohit's Flip5 is 360 x 800 inside the app; 30 Oct: "fix the buttons") ---------- */
/* a move whose words take three lines pushed Previous, Pause and Next under the tab bar until she scrolled */
const atCentre = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const hit = document.elementFromPoint(x, y); const bar = document.querySelector('.tabbar').getBoundingClientRect();
  return { mine: !!hit && (hit === e || e.contains(hit)), top: Math.round(r.top), bottom: Math.round(r.bottom), bar: Math.round(bar.top), h: innerHeight }; }, sel);
for (const [lang, w, h, route, re] of [['en', 360, 800, 'plan-r-strength', /Wall push-ups/], ['hi', 360, 800, 'plan-r-strength', /दीवार/], ['en', 360, 800, 'plan-r-sun', /Ashtanga/],
  ['en', 360, 640, 'plan-r-strength', /Wall push-ups/]]) {
  const { ctx, page, errs } = await open({ lang, width: w, height: h });
  await go(page, route); await tap(page, '#pl-pstart');
  for (let i = 0; i < 12 && !re.test(await txt(page, '#pl-step h2')); i++) await tap(page, (await has(page, '#pl-skip')) ? '#pl-skip' : '#pl-next');
  const tag = '7 ' + lang + ' at ' + w + ' x ' + h + ', ' + (await txt(page, '#pl-step h2')).replace(/\s+/g, ' ');
  const b = { prev: await atCentre(page, '#pl-prev'), pause: await atCentre(page, '#pl-pause'), next: await atCentre(page, '#pl-next') };
  check(tag + ': Previous, Pause and Next sit above the tab bar, each the thing a tap there hits', re.test(tag) && ['prev', 'pause', 'next'].every((k) => b[k] && b[k].mine && b[k].bottom <= b[k].bar && b[k].top >= 0), b);
  const ring = await page.evaluate(() => { const t = document.querySelector('#pl-step ~ .pl-timer'), c = document.querySelector('.pl-ctl'); if (!t || !c) return null; const a = t.getBoundingClientRect(), z = c.getBoundingClientRect(); return { ring: [Math.round(a.top), Math.round(a.bottom)], ctl: Math.round(z.top) }; });
  if (h >= 800) check(tag + ': the timer stays in view above them', ring && ring.ring[0] >= 0 && ring.ring[1] <= ring.ctl, ring);
  await page.screenshot({ path: path.join(SHOTS, '7-buttons-' + lang + '-' + w + 'x' + h + '-' + route.slice(7) + '.png') });   // what she sees, not the whole page
  check(tag + ': no page errors', !errs.length, errs);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + ' / ' + results.length + ' checks passed');
process.exit(failed.length ? 1 : 0);
