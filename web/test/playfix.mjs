// Version 39.76, the Play walk's UI and UX gaps (Mohit, 6 Nov: "can you again test live walkthrough on phone what are other UI UX
// gaps which needs correction before we upload on playstore", then "fix all"; MODULE_API section 119). On his Flip5 the WebView
// drops a name given only by aria-label for a toggle (aria-pressed) or a text box, and a label for a switch; this file checks the
// markup that does reach Android (tried on the phone):
// - 1 names: ticks and speakers are plain buttons whose name says the state; switches carry aria-label; text boxes a description;
//   the calendars' arrows say "Previous month" and "Next month";
// - 2 a sheet or the + menu leaves the page behind it inert, and the sheet's handle is a Close button;
// - 3 taps of 48 px where she taps most ("Why?", "How to do it", Back, the calendar's arrows, "Add a past period", "I've seen a
//   doctor"), with her first step still on the first screen at 360 x 800;
// - 4 the + button goes away while she scrolls down and comes back when she scrolls up;
// - 5 joining's "Pain that stops my day" is her plan's "It stops my day", not asked again;
// - 6 sign-up on a touch screen: the picture steps aside while she types, so "you agree" stays above the keyboard;
// - 7 About and privacy: the privacy policy's link (https, from the build), and no coordinator tool in a Play build;
// - 8 Your Sakhi: the fertile-days line only while she tries;
// - 9 two lines that don't break ("1-minute", "1 day"), Hindi, and no page errors.
// Usage: node test/playfix.mjs [web dir]
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
const ANDROID = 'window.__sched = []; window.__secure = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(on){ window.__secure.push(on); }, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.76-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planRem = (startAgo, on) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: on !== false, doneOn: null });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', ppv2No: '2026-10-01', pv2No: '2026-10-01', mpv2No: '2026-10-01' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular', stage: 'cycle' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyIntro: ago(3) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* her PMOS plan (the cycle plan), started startAgo days ago, with a log */
const pmos = (startAgo, log, x, px) => Object.assign({ situation: { pcos: true }, intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', startAgo, Object.assign({ log: log || {}, intake: { goal: 'pmos', stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], when: 'evening' } }, px || {})) }, reminders: [planRem(startAgo)] }, x || {});
const did = (...days) => Object.fromEntries(days.map((n) => [ago(n), { ck: { move: 'd' }, min: 20, ci: 1 }]));

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', hasTouch: !!o.touch, isMobile: !!o.touch });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.init) await ctx.addInitScript(o.init);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
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
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const hash = (page) => page.evaluate(() => location.hash.slice(1));
const sched = async (page) => { await settle(page, 1200); return page.evaluate(() => window.__sched || []); };
const ring = (list) => list.find((x) => /^pause-/.test(x.id)) || null;
const ringOn = (r) => (r ? new Date(r.at + 5.5 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : null);   /* her clock, IST */
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const move = (page) => page.evaluate(() => { const a = window.Saathi.plan.actions().find((x) => x.id === 'move'); return a ? { title: a.title, sub: a.sub, mins: a.mins, state: a.state || '' } : null; });
const save = (page) => page.evaluate(() => window.Saathi.save());



const longP = (startAgo, len) => [{ d: ago(startAgo + 62), t: 'start' }, { d: ago(startAgo + 58), t: 'end' }, { d: ago(startAgo + 31), t: 'start' }, { d: ago(startAgo + 27), t: 'end' }, { d: ago(startAgo), t: 'start' }, { d: ago(startAgo - len + 1), t: 'end' }];
const pos = (page, a, b) => page.evaluate(([a, b]) => { const x = document.querySelector(a), y = document.querySelector(b); return x && y ? !!(x.compareDocumentPosition(y) & 4) : null; }, [a, b]);


const { join } = await import(pathToFileURL(path.join(here, 'join.mjs')).href);
const box = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }).catch(() => null);
const big = (b) => !!b && b.w >= 44 && b.h >= 44;
async function signUp(page) {
  await page.waitForSelector('#su-num', { timeout: 10000 }); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send'); await settle(page, 800);
  await page.waitForSelector('#su-code', { timeout: 10000 }); await page.fill('#su-code', '123456'); await settle(page, 1500);
  if (await has(page, '#su-done')) { if (await has(page, '#su-pin')) await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); await settle(page, 1200); }
}

/* ---------- 1. Names Android keeps ---------- */
{
  let a = await open({ seed: pmos(3, did(1)), w: 360, h: 800 });
  const ticks = await a.page.$$eval('#view .today-tick', (bs) => bs.map((b) => ({ p: b.getAttribute('aria-pressed'), l: b.getAttribute('aria-label') })));
  check('1.1 Today\'s ticks: plain buttons whose name says the state ("Mark done: …" / "Done: …. Tap to undo")', ticks.length > 0 && ticks.every((x) => x.p === null && /^(Mark done: .+|Done: .+\. Tap to undo)$/.test(x.l || '')), ticks);
  const spk = await a.page.$eval('[data-lang-read]', (b) => ({ p: b.getAttribute('aria-pressed'), l: b.getAttribute('aria-label') })).catch(() => null);
  check('1.2 the top bar\'s speaker: no aria-pressed, "Read this screen aloud"', !!spk && spk.p === null && spk.l === 'Read this screen aloud', spk);
  await a.page.evaluate(() => window.Saathi.openDay(window.Saathi.toISO(window.Saathi.today()))); await settle(a.page, 800);
  const say = await a.page.$eval('#sheet-root .say-b', (b) => ({ p: b.getAttribute('aria-pressed'), l: b.getAttribute('aria-label') })).catch(() => null);
  const sayOn = await a.page.$eval('#sheet-root .say-b', (b) => { b.click(); return b.getAttribute('aria-label'); }).catch(() => null);   /* read at once: the test phone's voice ends at once */
  check('1.3 a card\'s speaker: "Listen to this", then "Stop reading" while it reads; no aria-pressed', !!say && say.p === null && say.l === 'Listen to this' && sayOn === 'Stop reading', { say, sayOn });
  const note = await a.page.evaluate(() => { const n = document.querySelector('#sheet-root #day-note'); const d = n && document.getElementById(n.getAttribute('aria-describedby') || '-'); return n ? { d: d ? d.textContent : null, hid: d ? d.hidden : null } : null; });
  check('1.4 the day\'s note box: its label as a description (Android shows it as the hint)', !!note && !!note.d && note.hid === true, note);
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 300);
  await go(a.page, 'plan-settings');
  const sw = await a.page.$$eval('#view .item input[type=checkbox]', (cs) => cs.map((c) => ({ l: c.getAttribute('aria-label'), row: ((c.closest('.item').querySelector('strong') || c.closest('.item')).textContent || '').replace(/\s+/g, ' ').trim() })));
  check('1.5 Plan settings\' switch: its row\'s words as its name', sw.length > 0 && sw.every((x) => x.l && x.l === x.row.slice(0, 120)), sw);
  await go(a.page, 'me-reminders');
  const sw2 = await a.page.$$eval('#view input[type=checkbox]', (cs) => cs.map((c) => c.getAttribute('aria-label')));
  check('1.6 Reminders: every switch named', sw2.length > 0 && sw2.every(Boolean), sw2);
  await go(a.page, 'care');
  const q = await a.page.evaluate(() => { const n = document.querySelector('#care-q'); const d = n && document.getElementById(n.getAttribute('aria-describedby') || '-'); return d ? d.textContent : null; });
  check('1.7 Explore\'s search box: "Search: period, safed pani, PCOD, pregnancy…" as its description', /^Search: period/.test(q || ''), q);
  await go(a.page, 'diary');
  const arrows = await a.page.evaluate(() => [document.querySelector('#cal-prev'), document.querySelector('#cal-next')].map((b) => b && b.getAttribute('aria-label')));
  check('1.8 the calendar\'s arrows: "Previous month" and "Next month"', arrows[0] === 'Previous month' && arrows[1] === 'Next month', arrows);
  await done(a);
}

/* ---------- 2. A sheet, and the + menu: the page behind is inert ---------- */
{
  const a = await open({ seed: pmos(3, did(1)), hash: '#diary' });
  const app0 = await a.page.evaluate(() => ({ inert: document.getElementById('app').inert, hid: document.getElementById('app').getAttribute('aria-hidden') }));
  await a.page.evaluate(() => window.Saathi.sheet('<h2>Test</h2><p>A sheet</p>')); await settle(a.page, 300);
  const up = await a.page.evaluate(() => ({ inert: document.getElementById('app').inert, hid: document.getElementById('app').getAttribute('aria-hidden'), fab: document.getElementById('fab-root') && document.getElementById('fab-root').inert, modal: document.querySelector('#sheet-root .sheet').getAttribute('aria-modal'), handle: (document.querySelector('#sheet-root .handle') || {}).tagName, hl: document.querySelector('#sheet-root .handle') && document.querySelector('#sheet-root .handle').getAttribute('aria-label'), focus: document.activeElement && document.activeElement.className }));
  check('2.1 a sheet open: the page behind it (and the + button) inert and hidden from screen readers; the sheet modal', app0.inert === false && !app0.hid && up.inert === true && up.hid === 'true' && up.fab === true && up.modal === 'true', { app0, up });
  check('2.2 its handle is a "Close" button', up.handle === 'BUTTON' && up.hl === 'Close', up);
  await a.page.$eval('#sheet-root .handle', (b) => b.click()); await settle(a.page, 300);
  const down = await a.page.evaluate(() => ({ sheet: !!document.querySelector('#sheet-root .sheet'), inert: document.getElementById('app').inert, hid: document.getElementById('app').getAttribute('aria-hidden') }));
  check('2.3 Close shuts it, and the page is back', !down.sheet && down.inert === false && down.hid === null, down);
  await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(a.page, 300);   /* Version 39.87 (the audit's D5): on the Diary's Calendar the + waits while her log tiles show, so the + menu opens from the Cycles tab */
  await tap(a.page, '#fab');
  const fm = await a.page.evaluate(() => ({ menu: !!document.querySelector('.fab-menu'), inert: document.getElementById('app').inert, fab: document.getElementById('fab-root').inert }));
  await tap(a.page, '#fab');
  const fm2 = await a.page.evaluate(() => ({ menu: !!document.querySelector('.fab-menu'), inert: document.getElementById('app').inert }));
  check('2.4 the + menu open: the page behind it inert, the menu not; closed: back', fm.menu && fm.inert === true && fm.fab === false && !fm2.menu && fm2.inert === false, { fm, fm2 });
  await tap(a.page, '#fab'); await a.page.evaluate(() => window.Saathi.render()); await settle(a.page, 300);
  const fm3 = await a.page.evaluate(() => ({ menu: !!document.querySelector('.fab-menu'), inert: document.getElementById('app').inert, hid: document.getElementById('app').getAttribute('aria-hidden') }));
  check('2.5 a redraw while the + menu is open never leaves the page inert', !fm3.menu && fm3.inert === false && fm3.hid === null, fm3);
  await a.page.setViewportSize({ width: 360, height: 800 });
  await a.page.evaluate(() => window.Saathi.openDay(window.Saathi.toISO(window.Saathi.today()))); await settle(a.page, 900);
  const dt = await a.page.evaluate(() => { const sh = document.querySelector('#sheet-root .sheet'); const top = document.querySelector('#sheet-root .day-top'); const hd = document.querySelector('#sheet-root .handle'); return { sheet: Math.round(sh.getBoundingClientRect().top), row: top ? Math.round(top.getBoundingClientRect().top) : null, handle: Math.round(hd.getBoundingClientRect().height) }; });
  check('2.6 a tall sheet (the day page at 360 x 800): the handle keeps its 48 px, and the first row starts inside the sheet', dt.handle === 48 && dt.row != null && dt.row >= dt.sheet + 8, dt);
  await done(a);
}

/* ---------- 3. Taps of 48 px, and her first step still on the first screen ---------- */
{
  let a = await open({ seed: Object.assign(pmos(3, did(1)), { events: longP(14, 11) }), w: 360, h: 800 });
  const why = await box(a.page, '#view [data-today-why]');
  const seen = await box(a.page, '#view .xp-seen');
  const head = await box(a.page, '#view .pl-th-plan');
  const fold = await a.page.evaluate(() => { const s = document.querySelector('#view .today-plan-list .today-row, #view .today-plan-list > *'); const tb = document.querySelector('#tabbar'); if (!s) return null; const r = s.getBoundingClientRect(); const top = tb && getComputedStyle(tb).display !== 'none' ? tb.getBoundingClientRect().top : innerHeight; return { stepBottom: Math.round(r.bottom), fold: Math.round(top) }; });
  check('3.1 Today: "Why?" a 48 px tap (it was 18 px tall)', !!why && why.h >= 44 && why.w >= 44, why);
  check('3.2 ... "I\'ve seen a doctor" 48 px, and the plan\'s header line a 44 px tap', !!seen && seen.h >= 48 && !!head && head.h >= 44, { seen, head });
  check('3.3 ... and her first step is still on the first screen at 360 x 800', !!fold && fold.stepBottom <= fold.fold, fold);
  await go(a.page, 'plan');
  const how = await box(a.page, '#view .pl-step-how');
  await go(a.page, 'plan-settings');
  const back = await box(a.page, '#view .backrow .iconbtn');
  check('3.4 My plan: "Why?" or "How to do it" a 48 px tap; Plan settings\' Back 48 px (it was 40 at 360 px)', !!how && how.h >= 48 && !!back && back.w >= 48 && back.h >= 48, { how, back });
  await go(a.page, 'diary');
  check('3.5 the calendar\'s arrows 48 px', big(await box(a.page, '#cal-prev')) && (await box(a.page, '#cal-prev')).w >= 48, await box(a.page, '#cal-prev'));
  const tb = await a.page.$$eval('#topbar .iconbtn', (bs) => bs.map((b) => Math.round(b.getBoundingClientRect().width)));
  check('3.6 the top bar keeps its narrow-screen size (40 px at 360)', tb.length > 0 && tb.every((w) => w <= 44), tb);
  await done(a);
  a = await open({ seed: { events: [{ d: ago(9), t: 'start' }, { d: ago(5), t: 'end' }] }, w: 360, h: 800 });
  const ap = await box(a.page, '#view .why-row .linkbtn');
  check('3.7 "Add a past period" in Sakhi\'s reason box: a 48 px tap (it was 37)', !!ap && ap.h >= 48, ap);
  await done(a);
}

/* ---------- 4. The + button out of the way while she scrolls down ---------- */
{
  const a = await open({ seed: pmos(3, did(1)), hash: '#diary', w: 360, h: 640 });
  await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(a.page, 300);   /* Version 39.87 (the audit's D5): on the Diary's Calendar the + waits while her log tiles show, so this runs on the Cycles tab, where it shows */
  const vis0 = await a.page.$eval('#fab', (f) => !f.classList.contains('hid') && !f.classList.contains('away'));
  await a.page.evaluate(() => window.scrollTo(0, 120)); await settle(a.page, 200); await a.page.evaluate(() => window.scrollTo(0, 420)); await settle(a.page, 300);
  const hid = await a.page.$eval('#fab', (f) => f.classList.contains('hid'));
  await a.page.evaluate(() => window.scrollTo(0, 240)); await settle(a.page, 300);
  const back = await a.page.$eval('#fab', (f) => !f.classList.contains('hid'));
  check('4.1 the + shows; scrolling down puts it away; scrolling up brings it back', vis0 && hid && back, { vis0, hid, back });
  await a.page.evaluate(() => window.scrollTo(0, 420)); await settle(a.page, 300); await a.page.evaluate(() => window.Saathi.render()); await settle(a.page, 300);
  check('4.2 ... a redraw of the same page keeps it away', await a.page.$eval('#fab', (f) => f.classList.contains('hid')));
  await done(a);
}

/* ---------- 5. Joining's pain, carried into her plan ---------- */
{
  const a = await open({ seed: null, hash: '' });
  await join(a.page, { name: 'Sana', dec: 1990, y: 1997, tile: 'cycle', goals: ['pain'], dates: ['2026-08-16', '2026-09-13', '2026-10-11'], dlen: 5, pain: true, care: 'private' });
  await signUp(a.page);
  await tap(a.page, '#ys-plan');
  const q = await a.page.evaluate(() => ({ sev: document.querySelectorAll('#view [data-pl-q^="pain:"]').length, days: document.querySelectorAll('#view [data-pl-q^="painDays:"]').length, ik: (window.Saathi.mem.planIntake || {}).pain }));
  check('5.1 "Make my plan": "How bad is it, usually?" is not asked again ("Pain that stops my day" is "It stops my day"); how many days is', q.sev === 0 && q.days > 0 && q.ik === 'stop', q);
  await done(a);
}

/* ---------- 6. Sign-up on a touch screen: the picture steps aside while she types ---------- */
{
  const a = await open({ seed: null, hash: '', touch: true, w: 360, h: 800 });
  await join(a.page, { name: 'Ria', dec: 1990, y: 1997, tile: 'cycle', goals: ['track'], care: 'private' });
  await a.page.waitForSelector('#su-num');
  const before = await a.page.$eval('.su .ob-av', (e) => getComputedStyle(e).display).catch(() => 'none');
  await a.page.focus('#su-num'); await settle(a.page, 200);
  const after = await a.page.$eval('.su .ob-av', (e) => getComputedStyle(e).display).catch(() => 'gone');
  const d = await a.page.evaluate(() => { const n = document.querySelector('#su-num'); const x = n && document.getElementById(n.getAttribute('aria-describedby') || '-'); return x ? x.textContent : null; });
  check('6.1 the picture shows, and steps aside while she types her number (so "you agree" stays above the keyboard)', before !== 'none' && after === 'none', { before, after });
  check('6.2 the number box: "Mobile number" as its description', d === 'Mobile number', d);
  await done(a);
}

/* ---------- 7. About and privacy ---------- */
{
  const POL = 'https://www.quranutrition.com/sakhi/privacy';
  let a = await open({ seed: {}, hash: '#me-about', config: { privacy: POL } });
  const l = await a.page.$eval('#me-privacy-link', (x) => ({ href: x.getAttribute('href'), t: x.textContent, tg: x.getAttribute('target') })).catch(() => null);
  check('7.1 with the build\'s address: "Privacy policy", opening outside the app', !!l && l.href === POL && l.t === 'Privacy policy' && l.tg === '_blank', l);
  check('7.2 a pilot build: the picture check for the coordinator as before', await has(a.page, '#view [data-go="pic-check"]'));
  await done(a);
  a = await open({ seed: {}, hash: '#me-about', config: { store: 'play', privacy: 'http://example.com/p' } });
  check('7.3 a Play build: no coordinator tool; an address that isn\'t https: no link', !(await has(a.page, '#view [data-go="pic-check"]')) && !(await has(a.page, '#me-privacy-link')));
  await done(a);
  a = await open({ seed: {}, hash: '#me-about' });
  check('7.4 no address: no link (never one to a missing page)', !(await has(a.page, '#me-privacy-link')));
  await done(a);
}

/* ---------- 8. Your Sakhi: fertile days only while she tries ---------- */
{
  const ys = (x) => open({ seed: Object.assign({ events: regular(10), focus: { tile: 'cycle', goals: ['pain'], read: true, at: ago(0) } }, x || {}), hash: '#your-sakhi' });
  let a = await ys();
  check('8.1 tracking her periods: no "Fertile days and ovulation" line', !/Fertile days and ovulation/.test(await view(a.page)), (await view(a.page)).slice(0, 300));
  await done(a);
  a = await ys({ situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, focus: { tile: 'ttc', goals: ['ready'], read: true, at: ago(0) } });
  check('8.2 trying for a baby: the line stays', /Fertile days and ovulation/.test(await view(a.page)), (await view(a.page)).slice(0, 300));
  await done(a);
}

/* ---------- 9. Lines that don't break, Hindi, no page errors ---------- */
{
  let a = await open({ seed: null, hash: '' });
  await tap(a.page, '[data-ob-lang="en"]');
  check('9.1 the welcome: "1‑minute" with a hyphen the line doesn\'t break at', /a 1‑minute check-in/.test(await view(a.page)));
  check('9.2 the plan\'s "1 day" with a space it doesn\'t break at', await a.page.evaluate(() => window.Saathi.t('plan_pd_1')) === '1 day');
  await done(a);
  a = await open({ seed: Object.assign(pmos(3, did(1)), { lang: 'hi' }), hash: '#diary', lang: 'hi', w: 360, h: 800 });
  const ar = await a.page.evaluate(() => [document.querySelector('#cal-prev'), document.querySelector('#cal-next')].map((b) => b && b.getAttribute('aria-label')));
  check('9.3 Hindi: the arrows "पिछला महीना" and "अगला महीना"; no sideways scroll at 360 px', ar[0] === 'पिछला महीना' && ar[1] === 'अगला महीना' && (await noScroll(a.page)), ar);
  await go(a.page, 'home');
  check('9.4 Hindi Today at 360 px: no sideways scroll', await noScroll(a.page));
  await done(a);
}

check('no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const f = results.filter((r) => !r.pass).length;
console.log((results.length - f) + '/' + results.length + ' passed');
process.exit(f ? 1 : 0);
