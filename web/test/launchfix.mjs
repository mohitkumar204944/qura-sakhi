// Version 39.78, the launch QA's fixes (Mohit, 7 Nov: "Yes, fix all 8", after docs/launch-qa-2026-11-07.md; MODULE_API section 121).
// Each was seen on his Flip5 or in the rendered sweep, and each check below failed on d3112de:
// - 1 sign-up: one tap on Send code with the keyboard up (the picture steps aside on her first tap in a box and stays aside);
// - 2 a pregnant woman's pelvic floor trainer has no after-birth lines (the belly gap check on her back, "3 months after the birth");
// - 3 a page Android restored starts no sound until her tap (taps on the lock screen don't count); a notification she taps still
//   opens and plays; MainActivity reads a notification's screen only on a real new launch;
// - 4 the players' Pause, Next and Stop, the check-in's Save and the + menu sit above Wind down's bar and above the tab bar's real
//   height (large text grows it), and nothing moves at 100% text with no bar;
// - 5 "Ring on time?" when a medicine reminder is booked (her tap or her plan) or her plan starts with one, on a phone that would ring
//   late (Android 14+ new installs); never for her other reminders (Version 39.27); one Android "Allow" at a time;
// - 6 joining's next step, and the page she signed up on, open at their top;
// - 7 the Learn article on her data says what the joining notice says (no Tell a person, no diary on servers), the usage line only in a
//   build that has it (Firebase Analytics since Version 39.79);
// - 8 the language tile names only Hindi and English;
// - 9 no page errors.
// Usage: node test/launchfix.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-06';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the phone: reminders and speech as in the other tests; Android's sound player, which records each call (as in test/calm.mjs);
   "Alarms and reminders" off or on (window.__exact), and restored() true once when window.__restored is set before the page loads */
const ANDROID = 'window.__sched = []; window.__calls = []; window.__exactAsk = 0; window.__st = { playing: false, pos: 0, dur: 0, left: -1, played: 0 }; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return window.__notify !== false; }, askNotify(){ window.__askN = (window.__askN || 0) + 1; },'
  + ' canExactAlarms(){ return window.__exact !== false; }, askExactAlarms(){ window.__exactAsk++; }, restored(){ const r = !!window.__restored; window.__restored = false; return r; },'
  + ' speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; }, keepAwake(on){ window.__calls.push(["awake", on]); },'
  + ' soundPlay(){ const a = [].slice.call(arguments); window.__calls.push(["play"].concat(a)); window.__st = { playing: true, pos: 0, dur: a[1] ? 0 : 100, left: a[2] ? a[2] * 60 : -1, played: 0 }; },'
  + ' soundPause(){ window.__calls.push(["pause"]); window.__st.playing = false; }, soundResume(){ window.__calls.push(["resume"]); window.__st.playing = true; },'
  + ' soundStop(){ window.__calls.push(["stop"]); window.__st = { playing: false, pos: 0, dur: 0, left: -1, played: 0 }; }, soundTimer(m){ window.__calls.push(["timer", m]); },'
  + ' soundState(){ return JSON.stringify(window.__st); }, clip(p){ window.__calls.push(["clip", p]); }, clipStop(){ window.__calls.push(["clipStop"]); } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.78-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planRem = (startAgo, on) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: on !== false, doneOn: null });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', ppv2No: '2026-10-01', pv2No: '2026-10-01', mpv2No: '2026-10-01' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular', stage: 'cycle' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyIntro: ago(3) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* her PMOS plan (the cycle plan), started startAgo days ago, with a log */
const pmos = (startAgo, log, x, px) => Object.assign({ situation: { pcos: true }, intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', startAgo, Object.assign({ log: log || {}, intake: { goal: 'pmos', stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], when: 'evening' } }, px || {})) }, reminders: [planRem(startAgo)] }, x || {});
const did = (...days) => Object.fromEntries(days.map((n) => [ago(n), { ck: { move: 'd' }, min: 20, ci: 1 }]));
import { join } from './join.mjs';
/* Android's text size (WebView setTextZoom) emulated on desktop: every px font-size in the CSSOM times the factor (the launch QA's sweep) */
const ZOOM_JS = `(() => {
  if (window.__qzOn) return; window.__qzOn = true;
  const f = window.__qzF; const done = new WeakSet();
  const sc = (v) => v.replace(/(-?\\d*\\.?\\d+)px/g, (m, n) => (parseFloat(n) * f).toFixed(2) + 'px');
  const doRule = (r) => { if (done.has(r)) return; done.add(r);
    if (r.style) { const v = r.style.getPropertyValue('font-size'); if (v && /px/.test(v)) r.style.setProperty('font-size', sc(v), r.style.getPropertyPriority('font-size')); else { const fv = r.style.getPropertyValue('font'); if (fv && /px/.test(fv)) r.style.setProperty('font', sc(fv), r.style.getPropertyPriority('font')); } }
    if (r.cssRules) for (const c of r.cssRules) doRule(c); };
  window.__qzBlocked = []; const sheets = () => { for (const s of document.styleSheets) { let rs; try { rs = s.cssRules; } catch (e) { window.__qzBlocked.push(s.href || 'inline'); continue; } for (const r of rs) doRule(r); } };
  const inl = (el) => { if (done.has(el) || !el.style) return; done.add(el); const v = el.style.getPropertyValue('font-size'); if (v && /px/.test(v)) el.style.setProperty('font-size', sc(v), el.style.getPropertyPriority('font-size')); };
  const walk = (root) => { if (root.nodeType !== 1) return; if (root.hasAttribute('style')) inl(root); root.querySelectorAll('[style]').forEach(inl); };
  sheets(); walk(document.documentElement);
  const base = parseFloat(getComputedStyle(document.documentElement).fontSize); document.documentElement.style.setProperty('font-size', (base * f) + 'px'); done.add(document.documentElement);
  new MutationObserver((ms) => { let ns = false; for (const m of ms) { m.addedNodes.forEach((n) => { if (n.nodeType === 1) { walk(n); if (n.tagName === 'STYLE' || n.tagName === 'LINK') ns = true; } }); } if (ns) sheets(); }).observe(document.documentElement, { childList: true, subtree: true });
  window.__qzSheets = sheets;
})();`;
const IK = { at: ago(1), stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'b24', work: 'day', when: 'dinner' };

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await (o.browser || browser).newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', hasTouch: !!o.touch, isMobile: !!o.touch });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.init) await ctx.addInitScript(o.init);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + ');' + (o.noAcct ? '' : ' localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + ');') + ' }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { errs.push(String(e.message).slice(0, 200)); if (process.env.DBG) console.log('PAGEERROR', String(e.stack || e.message).slice(0, 600)); });
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 600); };
const view = (page) => page.$eval('#view', (e) => e.innerText.replace(/\s+/g, ' ').trim());
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const plays = (page) => page.evaluate(() => (window.__calls || []).filter((c) => c[0] === 'play').map((c) => c[1]));
const sheetTxt = (page) => page.evaluate(() => { const s = document.querySelector('#sheet-root .sheet'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : ''; });
/* what a tap at the centre of each button would hit: the button itself (or inside it), never a bar on top of it */
const hits = (page, sels) => page.evaluate((ss) => ss.map((s) => { const b = document.querySelector(s); if (!b) return { s, missing: true }; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { s, ok: !!e && (e === b || b.contains(e)), at: Math.round(r.top), hit: e ? (e.id || e.className || e.tagName) : null }; }), sels);
const allOk = (xs) => xs.length && xs.every((x) => x.ok);

/* ---------- 1 sign-up: one tap on Send code with the keyboard up ---------- */
try {
  const a = await open({ seed: {}, noAcct: true, touch: true });
  await a.page.waitForSelector('#su-num');
  const rest = await a.page.$eval('#su-send', (b) => Math.round(b.getBoundingClientRect().top));
  await a.page.tap('#su-num'); await a.page.keyboard.type('9876543210'); await settle(a.page, 300);
  const typing = await a.page.evaluate(() => { const b = document.querySelector('#su-send').getBoundingClientRect(); const av = document.querySelector('.su .ob-av'); return { x: b.left + b.width / 2, y: b.top + b.height / 2, top: Math.round(b.top), av: av ? getComputedStyle(av).display : null }; });
  await a.page.touchscreen.tap(typing.x, typing.y); await settle(a.page, 800);
  check('1.1 Send code: the picture steps aside while she types, and one tap with the keyboard up sends the code (it took two on the Flip5)', typing.av === 'none' && typing.top < rest && await has(a.page, '#su-code'), { rest, typing, code: await has(a.page, '#su-code') });
  await a.page.fill('#su-code', '123456'); await settle(a.page, 1200);
  const about = await has(a.page, '#su-done');
  const avBefore = await a.page.$eval('.su .ob-av', (e) => getComputedStyle(e).display).catch(() => null);
  await a.page.tap('#su-pin').catch(() => {}); await settle(a.page, 200);
  await a.page.evaluate(() => document.activeElement && document.activeElement.blur()); await settle(a.page, 200);
  const avAfter = await a.page.$eval('.su .ob-av', (e) => getComputedStyle(e).display).catch(() => null);
  check('1.2 "Almost done": the picture shows until her first tap in a box, then stays aside when the box lets go', about && avBefore === 'block' && avAfter === 'none', { about, avBefore, avAfter });
  if (await has(a.page, '#su-name')) await a.page.fill('#su-name', 'Riya');
  await a.page.fill('#su-pin', '30200'); await a.page.$eval('#su-done', (b) => b.click()); await settle(a.page, 400);
  const err = await a.page.evaluate(() => ({ focus: document.activeElement && document.activeElement.id, av: getComputedStyle(document.querySelector('.su .ob-av')).display }));
  check('1.4 a wrong PIN code: Sakhi puts her back in the box, and the picture stays aside for it', err.focus === 'su-pin' && err.av === 'none', err);
  await done(a);
  const d = await open({ seed: {}, noAcct: true });
  await d.page.waitForSelector('#su-num'); await d.page.focus('#su-num');
  check('1.3 with a mouse (no touch screen) the picture never moves', (await d.page.$eval('.su .ob-av', (e) => getComputedStyle(e).display)) === 'block');
  await done(d);
} catch (e) { check('1 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 6 the next step and the page she signed up on open at their top ---------- */
try {
  const a = await open({ seed: null });
  await join(a.page, { tile: 'pmos', stop: 'goals' });
  await a.page.$eval('[data-ob-goal="irregular"]', (b) => b.click()); await settle(a.page, 300);
  await a.page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight)); await settle(a.page, 200);
  const y0 = await a.page.evaluate(() => Math.round(scrollY));
  await tap(a.page, '#ob-next'); await settle(a.page, 300);
  const top = await a.page.evaluate(() => ({ y: Math.round(scrollY), h1: Math.round(document.querySelector('#view h1').getBoundingClientRect().top), t: document.querySelector('#view h1').textContent }));
  check('6.1 joining: Continue at the foot of the goals list opens "Your last 3 periods" at its top (it opened 247 px down)', y0 > 100 && top.y === 0 && top.h1 > 0, { y0, top });
  await a.page.evaluate(() => window.scrollTo(0, 260)); await settle(a.page, 200);
  const day = await a.page.$eval('[data-jd-day]', (b) => b.dataset.jdDay);
  await a.page.$eval('[data-jd-day="' + day + '"]', (b) => b.click()); await settle(a.page, 400);
  const kept = await a.page.evaluate(() => Math.round(scrollY));
  check('6.2 ... and a tap on that screen (a period day) keeps her place', kept > 100, { kept });
  await done(a);
  const s = await open({ seed: {}, noAcct: true, hash: '#your-sakhi' });
  await s.page.waitForSelector('#su-num'); await s.page.fill('#su-num', '9876543210'); await tap(s.page, '#su-send');
  await s.page.fill('#su-code', '123456'); await settle(s.page, 1200);
  if (await has(s.page, '#su-name')) await s.page.fill('#su-name', 'Riya');
  await s.page.fill('#su-pin', '302001');
  await s.page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight)); await settle(s.page, 200);
  const ys = await s.page.evaluate(() => Math.round(scrollY));
  await tap(s.page, '#su-done'); await settle(s.page, 800);
  const after = await s.page.evaluate(() => ({ h: location.hash, y: Math.round(scrollY), su: !!document.querySelector('#su-done') }));
  check('6.3 Your Sakhi after "Almost done" opens at its top (it kept sign-up\'s 326 px)', ys > 50 && after.h === '#your-sakhi' && !after.su && after.y === 0, { ys, after });
  await done(s);
  const r = await open({ seed: null, h: 480 });
  await join(r.page, { stop: 'stage' }); await tap(r.page, '#ob-back'); await settle(r.page, 300);   /* stage -> step 1 */
  await r.page.evaluate(() => window.scrollTo(0, 400)); await settle(r.page, 200); const ry = await r.page.evaluate(() => Math.round(scrollY));
  await tap(r.page, '#ob-back'); await tap(r.page, '#w-start'); await settle(r.page, 300);   /* step 1 -> Hello -> step 1 again */
  const r1 = await r.page.evaluate(() => Math.round(scrollY));
  await r.page.evaluate(() => window.scrollTo(0, 400)); await settle(r.page, 200);
  await tap(r.page, '[data-ob-dec="post"]'); await settle(r.page, 300);
  const u18 = await r.page.evaluate(() => ({ y: Math.round(scrollY), t: document.querySelector('#view h1') && document.querySelector('#view h1').textContent }));
  check('6.4 step 1 entered a second time, and the under-18 page, open at their top (both kept the last scroll)', ry > 50 && r1 === 0 && u18.y === 0 && /18/.test(u18.t || ''), { ry, r1, u18 });
  await done(r);
  const q = await open({ seed: {}, h: 560 });
  await q.page.evaluate(() => window.Saathi.plan.offer('irregular')); await settle(q.page, 600);
  const h1 = await q.page.evaluate(() => (document.querySelector('#view h2, #view h1') || {}).textContent);
  for (const sel of ['[data-pl-q="gap:n"]', '[data-pl-q="skips:n"]', '[data-pl-q="dx:ns"]', '[data-pl-m="signs:none"]']) if (await has(q.page, sel)) await tap(q.page, sel);
  await q.page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight)); await settle(q.page, 200); const qy = await q.page.evaluate(() => Math.round(scrollY));
  await tap(q.page, '#pl-in-next'); await settle(q.page, 500);
  const q2 = await q.page.evaluate(() => ({ y: Math.round(scrollY), h: (document.querySelector('#view h2, #view h1') || {}).textContent }));
  check('6.5 her plan\'s questions: the next question opens at its top too (they kept the last one\'s scroll)', qy > 50 && q2.h !== h1 && q2.y === 0, { h1, qy, q2 });
  await done(q);
} catch (e) { check('6 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 2 a pregnant woman's pelvic floor trainer ---------- */
try {
  const p = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(140) } }, hash: '#post-pelvic' });
  const v = await view(p.page);
  check('2.1 20 weeks pregnant: no belly gap check (on her back, head up) and no after-birth "see a doctor" lines on the trainer', /Pelvic floor/.test(v) && !/Belly gap check|months after the birth|baby is 8 weeks|Daily recovery check|Mood after birth/i.test(v), v.slice(0, 1400));
  const figs = () => p.page.evaluate(() => [...document.querySelectorAll('#view video, #view img')].map((x) => (x.getAttribute('src') || '') + ' ' + (x.getAttribute('poster') || '')).join(' | '));
  const f0 = await figs(); await tap(p.page, '#pst-pstart'); await settle(p.page, 300); const f1 = await figs();
  check('2.3 ... and her figure sits up with her bump, before and during a set, never flat on her back (bridgedown)', /chairsit/.test(f0) && /chairsit/.test(f1) && !/bridgedown/.test(f0 + f1), { f0, f1 });
  await done(p);
  const b = await open({ seed: { situation: { deliveredOn: ago(30) } }, hash: '#post-pelvic' });
  const bf = await b.page.evaluate(() => [...document.querySelectorAll('#view video, #view img')].map((x) => x.getAttribute('src') || '').join(' '));
  check('2.2 after a birth the belly gap check and the trainer\'s lying figure stay, as they were', /Belly gap check/.test(await view(b.page)) && /bridgedown/.test(bf), bf);
  await done(b);
} catch (e) { check('2 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 3 a page Android restored starts no sound until her tap ---------- */
try {
  const a = await open({ hash: '#calm-nidra', init: 'window.__restored = true;' });
  const p0 = await plays(a.page);
  const idle = await a.page.evaluate(() => { const o = document.querySelector('#cm-open'); const say = o && o.querySelector('.cm-say'); return { idle: !!o && o.classList.contains('idle'), say: say ? getComputedStyle(say).display : null }; });
  await tap(a.page, '#cm-play'); await settle(a.page, 400);
  const p1 = await plays(a.page);
  check('3.1 Android restored yoga nidra: no sound by itself; her tap on Play starts it', p0.length === 0 && p1.length === 1 && /nidra/.test(p1[0]), { p0, p1 });
  check('3.6 ... and before her Play it doesn\'t say "Your trainer is starting" with a countdown that never moves', idle.idle && idle.say === 'none', idle);
  await done(a);
  const g = await open({ hash: '#calm-nidra', init: 'window.__restored = true;' });
  await g.page.evaluate(() => { location.hash = 'calm'; }); await settle(g.page, 600);
  const ghost = await g.page.evaluate(() => ({ bar: !!document.querySelector('#cm-mini'), on: document.body.classList.contains('cm-mini-on') }));
  await tap(g.page, '[data-go="calm-nidra"]'); await settle(g.page, 400);
  check('3.7 she leaves the restored player unplayed (Back): no "Paused" bar whose Play did nothing, and its row then starts it', !ghost.bar && !ghost.on && (await plays(g.page)).some((x) => /nidra/.test(x)), { ghost, plays: await plays(g.page) });
  await done(g);
  const kp = await open({ hash: '#calm-nidra', init: 'window.__restored = true; window.__st = { playing: true, pos: 40, dur: 496, left: -1, played: 40 };' });
  const kc = await kp.page.evaluate(() => (window.__calls || []).map((c) => c[0]));
  check('3.8 restored while Android still plays it (the font size changed): it carries on, not stopped and not started again', kc.indexOf('stop') < 0 && kc.indexOf('play') < 0 && (await kp.page.$eval('#cm-play', (b) => b.getAttribute('aria-label'))) === 'Pause', kc);
  await done(kp);
  const b = await open({ hash: '#calm-nidra' });
  check('3.2 opened in the app (not restored), the session starts as before', (await plays(b.page)).length === 1);
  await done(b);
  const c = await open({ hash: '#home', init: 'window.__restored = true;' });
  await c.page.evaluate(() => window.__sakhiOpen('calm-bowl')); await settle(c.page, 800);
  check('3.3 restored, then a notification she taps opens its sound: her tap', (await plays(c.page)).some((x) => /bowl/.test(x)), await plays(c.page));
  await done(c);
  const k = await open({ hash: '#calm-nidra', init: 'window.__restored = true;', seed: { settings: { pinHash: 'x1' } } });
  const locked = await has(k.page, '#lockpad');
  await k.page.$eval('#lockpad button, #lockpad', (b) => b.click()).catch(() => {}); await settle(k.page, 200);
  await k.page.evaluate(() => { window.Saathi.mem.locked = false; window.Saathi.render(); }); await settle(k.page, 600);
  const k0 = await plays(k.page); await tap(k.page, '#cm-play'); const k1 = await plays(k.page);
  check('3.4 restored behind her PIN: taps on the lock screen don\'t count, so after unlocking the page still waits for her Play', locked && k0.length === 0 && k1.length === 1, { locked, k0, k1 });
  await done(k);
  const java = fs.readFileSync(path.join(root, '..', 'android', 'src', 'com', 'quranutrition', 'sakhi', 'MainActivity.java'), 'utf8');
  check('3.5 MainActivity: a notification\'s screen only on a real new launch, never from the recent-apps list; restored() once', /pendingGo = state == null && !fromHistory\(getIntent\(\)\) \? goOf\(getIntent\(\)\) : null;/.test(java) && /fromHistory\(intent\) \? null : goOf\(intent\)/.test(java)
    && /FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY/.test(java) && /public boolean restored\(\) \{ boolean r = restoredPage; restoredPage = false; return r; \}/.test(java) && /else restoredPage = true;/.test(java) && /restoredPage = false;   \/\/ a fresh Home/.test(java)
    && /if \(go != null\) \{ if \(pageReady\) openRoute\(go\); else pendingGo = go; \}/.test(java) && /if \(view == web\) pageReady = true;/.test(java));
} catch (e) { check('3 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 4 above Wind down's bar, and above the tab bar's real height ---------- */
try {
  const a = await open({ hash: '#calm-breaths' });
  await go(a.page, 'relief-cramps'); await tap(a.page, '#rl-start'); await tap(a.page, '#rl-next'); await settle(a.page, 400);
  const bar = await has(a.page, '#cm-mini');
  const r1 = await hits(a.page, ['#rl-pause', '#rl-next']);
  check('4.1 with a sound playing, a routine\'s Pause and Next sit above the bar (a tap there paused or stopped her sound)', bar && allOk(r1), r1);
  const ring = await a.page.evaluate(() => { const t = document.querySelector('.rl-timer'), c = document.querySelector('.rl-ctl'); return t && c ? { tb: Math.round(t.getBoundingClientRect().bottom), ct: Math.round(c.getBoundingClientRect().top) } : null; });
  check('4.9 ... and the routine\'s timer stays above them (its picture gives the bar\'s room back; seen half covered on the Flip5)', ring && ring.tb <= ring.ct + 2, ring);
  await go(a.page, 'post-pelvic'); await tap(a.page, '#pst-pstart'); await settle(a.page, 300);
  const r2 = await hits(a.page, ['#pst-ppause', '#pst-pstop']);
  check('4.2 ... the Kegel trainer\'s Pause and Stop too (Stop restarted the sound)', allOk(r2), r2);
  await tap(a.page, '#pst-pstop'); await go(a.page, 'checkin'); await settle(a.page, 300);
  const r3 = await hits(a.page, ['#ci-save']);
  check('4.3 ... and the check-in\'s Save', allOk(r3), r3);
  await go(a.page, 'diary'); await tap(a.page, '#fab'); await settle(a.page, 300);
  const r4 = await a.page.evaluate(() => [...document.querySelectorAll('.fab-it')].map((b) => { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: b.innerText.trim(), ok: !!e && (e === b || b.contains(e)) }; }));
  check('4.4 ... and every row of the open + menu (its Close sat on "Period started")', allOk(r4), r4);
  await done(a);
  const n = await open({ hash: '#relief-cramps' });
  await tap(n.page, '#rl-start'); await tap(n.page, '#rl-next');
  const flat = await n.page.evaluate(() => ({ ctl: getComputedStyle(document.querySelector('.rl-ctl')).bottom, fab: null, tb: getComputedStyle(document.documentElement).getPropertyValue('--tb-h').trim() }));
  check('4.5 at 100% text with no bar nothing moved: the controls 74 px up, the tab bar measured at 65 px', flat.ctl === '74px' && flat.tb === '65px', flat);
  await done(n);
  const zb = await chromium.launch({ args: ['--allow-file-access-from-files'] });   /* the zoom reads the CSSOM of file:// sheets */
  const z = await open({ hash: '#home', browser: zb });
  await z.page.evaluate((f) => { window.__qzF = f; }, 2); await z.page.evaluate(ZOOM_JS); await settle(z.page, 300);
  await go(z.page, 'relief-cramps'); await tap(z.page, '#rl-start'); await tap(z.page, '#rl-next'); await settle(z.page, 400);
  const tb = await z.page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')));
  const r5 = await hits(z.page, ['#rl-pause', '#rl-next']);
  check('4.6 at 200% text the tab bar grows, and Pause and Next stay above it (their middle hit the tabs)', tb > 80 && allOk(r5), { tb, r5 });
  await done(z);
  const zz = await open({ hash: '#calm-breaths', browser: zb });
  await zz.page.evaluate((f) => { window.__qzF = f; }, 2); await zz.page.evaluate(ZOOM_JS); await settle(zz.page, 300);
  await go(zz.page, 'relief-cramps'); await tap(zz.page, '#rl-start'); await tap(zz.page, '#rl-next'); await settle(zz.page, 600);
  const mh = await zz.page.evaluate(() => ({ mini: document.querySelector('#cm-mini') ? document.querySelector('#cm-mini').offsetHeight : 0, var: getComputedStyle(document.documentElement).getPropertyValue('--mini-h').trim() }));
  const r6 = await hits(zz.page, ['#rl-pause', '#rl-next']);
  check('4.7 at 200% text with Wind down\'s bar up (its subtitle wraps, 116 px), Pause and Next still sit above it', mh.mini > 70 && mh.var === mh.mini + 'px' && allOk(r6), { mh, r6 });
  await done(zz); await zb.close();
  const ci = await open({ hash: '#checkin', touch: true, seed: { consent: { c1: ago(300), c2: null, c4: ago(10) } } });
  const n0 = await ci.page.evaluate(() => Object.keys(window.Saathi.state.checkins || {}).length);
  await ci.page.tap('#ci-note'); await ci.page.keyboard.type('feeling better'); await ci.page.setViewportSize({ width: 360, height: 480 }); await settle(ci.page, 300);
  const sv = await ci.page.$eval('#ci-save', (b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await ci.page.touchscreen.tap(sv.x, sv.y); await settle(ci.page, 600);
  const n1 = await ci.page.evaluate(() => Object.keys(window.Saathi.state.checkins || {}).length);
  check('4.8 the check-in: after typing a note, one tap on Save saves (the hidden tab bar took Save down with it, and the tap missed)', n1 === n0 + 1, { n0, n1, sv });
  await done(ci);
} catch (e) { check('4 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 5 "Ring on time?" for a medicine ---------- */
const IRON = { id: 'iron-tablet', mod: 'iron', kind: 'med', title: { en: 'Iron tablet', hi: 'आयरन की गोली' }, start: ago(5), every: 1, time: '21:00', on: true };
const startPlan = async (page) => { await page.evaluate((x) => { const S = window.Saathi; S.plan.startFromIntake(x); S.save(); }, IK); await go(page, 'plan-reveal');
  for (let i = 0; i < 8 && !(await has(page, '#pl-rv-go')); i++) await tap(page, '#pl-rv-next');
  await tap(page, '#pl-rv-go'); let sh = ''; for (let i = 0; i < 12 && !/Ring on time/.test(sh); i++) { await settle(page, 600); sh = await sheetTxt(page); } return sh; };
const MED = /^Ring on time\? Android can ring reminders up to an hour late unless you allow “Alarms and reminders” for Sakhi\. Allow it, and your tablet reminders come on time\./;
try {
  const a = await open({ seed: { reminders: [IRON] }, init: 'window.__exact = false;' });
  const sh = await startPlan(a.page);
  check('5.1 Android would ring late, and her iron tablet rings: after Start my plan, "Ring on time?" with the tablet line, on Today', MED.test(sh) && (await a.page.evaluate(() => location.hash)) === '#home', sh);
  await tap(a.page, '#ex-yes');
  check('5.2 Allow opens Android\'s setting', (await a.page.evaluate(() => window.__exactAsk)) === 1);
  await a.page.evaluate(() => window.Saathi.alerts.auto(true, true)); await settle(a.page, 3000);
  check('5.3 at most once a week', !/Ring on time/.test(await sheetTxt(a.page)));
  await done(a);
  const n = await open({ seed: {}, init: 'window.__exact = false;' });
  const sn = await startPlan(n.page); await settle(n.page, 3000);
  check('5.4 no medicine rings: Start my plan asks nothing in Sakhi\'s words (Version 39.27 stands)', !sn && !(await sheetTxt(n.page)), sn);
  await n.page.evaluate(() => window.Saathi.reminders.upsert({ id: 'x-plain', mod: 'plan', kind: 'custom', title: 'Walk', start: '2026-11-06', every: 1, time: '18:00' }, { quiet: true })); await settle(n.page, 3000);
  check('5.5 ... nor a plain reminder her plan books', !(await sheetTxt(n.page)));
  await n.page.evaluate(() => window.Saathi.reminders.upsert({ id: 'ttc-folic', mod: 'ttc', kind: 'med', title: { en: 'My folic acid tablet', hi: 'मेरी folic acid की गोली' }, start: '2026-11-06', every: 1, time: '21:00', on: true }, { quiet: true }));
  let sf = ''; for (let i = 0; i < 8 && !sf; i++) { await settle(n.page, 600); sf = await sheetTxt(n.page); }
  check('5.6 a tablet reminder her plan books quietly (her folic acid, once she has the tablets): "Ring on time?" with the tablet line', MED.test(sf), sf);
  await done(n);
  const b = await open({ seed: { reminders: [IRON] } });
  await startPlan(b.page); await settle(b.page, 3000);
  check('5.7 "Alarms and reminders" already allowed: nothing to ask', !(await sheetTxt(b.page)));
  await done(b);
  const o = await open({ seed: { reminders: [IRON] }, init: 'window.__exact = false; window.__notify = false;' });
  await o.page.evaluate(() => window.Saathi.alerts.auto(true, true)); await settle(o.page, 200);
  await o.page.evaluate(() => { document.body.click(); window.Saathi.reminders.upsert({ id: 'post-6wk', mod: 'post', kind: 'checkup', title: 'My 6-week check', dates: ['2026-11-30'], time: '09:00', on: true }); }); await settle(o.page, 1200);
  const asked = await o.page.evaluate(() => window.__askN || 0);
  await o.page.evaluate(() => { window.__notify = true; window.__sakhiNotify(true); }); let so = ''; for (let i = 0; i < 8 && !/Ring on time/.test(so); i++) { await settle(o.page, 600); so = await sheetTxt(o.page); }
  check('5.8 one Android "Allow" at a time (a reminder booked in the same seconds asked again and cancelled it), and after her Allow, "Ring on time?"', asked === 1 && MED.test(so), { asked, so });
  await done(o);
  const post = fs.readFileSync(path.join(root, 'mods', 'post.js'), 'utf8'); const plan = fs.readFileSync(path.join(root, 'mods', 'plan.js'), 'utf8');
  check('5.9 Start my plan: S.alerts.auto(true, true); the after-birth plan books her 6-week check quietly', /S\.alerts\.auto\(true, true\)/.test(plan) && /S\.post\.sixRemind\(\{ quiet: true \}\)/.test(plan) && /o && o\.quiet \? \{ quiet: true \} : undefined/.test(post));
} catch (e) { check('5 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 7 the Learn article on her data, and 8 the language tile ---------- */
try {
  const a = await open({ hash: '#a-services.your-data-privacy' });
  const v = await view(a.page); const S = (k) => a.page.evaluate((x) => window.Saathi.t(x), k);
  check('7.1 the article says what the joining notice says, word for word', [await S('ob_notice_1'), await S('ob_notice_2'), await S('ob_notice_5'), await S('notice_text'), await S('ob_notice_3'), await S('ob_notice_4')].every((x) => v.indexOf(x) >= 0), v.slice(0, 700));
  check('7.2 ... and none of the old claims: Tell a person, her diary on servers, a sharing switch, WhatsApp updates, auto-deletion, a Settings page, an officer with no contact; no usage line in a build without it', !/Tell a person|servers run by|switch sharing|update is ready|not opened for a long time|Settings|Grievance Officer|PostHog|Firebase/.test(v), v);
  await done(a);
  const h = await open({ hash: '#a-services.your-data-privacy', seed: { lang: 'hi' } });
  const vh = await view(h.page);
  check('7.3 in Hindi too', vh.indexOf(await h.page.evaluate(() => window.Saathi.t('ob_notice_1'))) >= 0 && !/किसी को बताएँ|सर्वर पर जो यह ऐप/.test(vh), vh.slice(0, 400));
  await done(h);
  const p = await open({ hash: '#a-services.your-data-privacy', init: 'Object.assign(window.SakhiAndroid, { usageOk(){ return true; }, usage(){}, usageEvent(){}, usageForget(){} });' });
  check('7.4 with Firebase Analytics in the build (Version 39.79), its line too, as in the notice', (await view(p.page)).indexOf(await p.page.evaluate(() => window.Saathi.t('ob_notice_6'))) >= 0);
  await p.ctx.close();
  const gv = await open({ hash: '#a-services.your-data-privacy', config: { grievance: 'Asha Rao, Trinaya Wellness LLP, Jaipur, help@example.com' } });
  check('7.6 with a Grievance Officer in the build, the article names them, as the notice does', /Asha Rao, Trinaya Wellness LLP, Jaipur, help@example\.com/.test(await view(gv.page)));
  await done(gv);
  const c = JSON.parse(CONTENT); const art = c.groups.find((g) => g.group === 'services').articles.find((x) => x.id === 'your-data-privacy');
  check('7.5 content.json (search) holds the same sentences, in English and Hindi', !/Tell a person|servers run by|Settings|switch sharing/.test(JSON.stringify([art.body_en, art.see_doctor_en, art.qura_line_en])) && !/किसी को बताएँ|सेटिंग्स/.test(JSON.stringify([art.body_hi, art.see_doctor_hi, art.qura_line_hi])) && art.body_en.length === 8 && art.body_hi.length === 8);
  const l = await open({ hash: '#home' });
  const tile = await l.page.evaluate(() => [window.Saathi.t('lang_tile_s'), (() => { window.Saathi.state.lang = 'hi'; const x = window.Saathi.t('lang_tile_s'); window.Saathi.state.lang = 'en'; return x; })()]);
  check('8.1 the language tile names Hindi and English only (Marathi, Bengali, Tamil and Telugu went in Version 39.68)', tile[0] === 'Hindi or English, and hearing any screen read out' && tile[1] === 'हिंदी या English, और हर पन्ना सुनने की सुविधा', tile);
  await go(l.page, 'learn'); await l.page.fill('#care-q, #learn-q, input[type=search]', 'marathi').catch(() => {}); await settle(l.page, 600);
  check('8.2 searching "marathi" no longer finds it', !/Language and read-aloud/.test(await view(l.page)));
  await done(l);
} catch (e) { check('7 (section ran to the end)', false, String(e && e.message).slice(0, 300)); }

/* ---------- 9 ---------- */
check('9 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' passed');
process.exit(pass === results.length ? 0 : 1);
