// Version 32: the fixes from the field-test audit (docs/field-test-readiness-2026-10-23.md, MODULE_API section 34), each
// checked the way a tester would meet it. Every run uses a fixed clock (Asia/Kolkata) and sends nothing anywhere: every
// http(s) request goes to a local stand-in for the accounts server.
// Usage: node test/fieldtest.mjs [dir]   (dir defaults to this app folder)
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
const NOW = '2026-10-23T10:00:00+05:30';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const TODAY = '2026-10-23';
const ago = (n) => iso(TODAY, -n);
/* regular 28-day periods, the last one starting `last` days ago, `n` of them, each 5 days long */
const regular = (last, n, gap) => { const ev = []; for (let i = n - 1; i >= 0; i--) { const st = ago(last + i * (gap || 28)); ev.push({ d: st, t: 'start' }, { d: iso(st, 4), t: 'end' }); } return ev; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: TODAY };
/* the Android bridge, recording what the page hands it; loadState gives back what saveState was given (or o.native) */
const bridge = (o) => 'window.__calls = []; window.__native = ' + JSON.stringify(o.native || '') + '; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return ' + (o.canNotify === true) + '; }, askNotify() { __calls.push(["askNotify"]); setTimeout(() => window.__sakhiNotify && window.__sakhiNotify(true), 30); }, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, setDisguise(on) { __calls.push(["disguise", on]); }, isDisguised() { return false; }, canExactAlarms() { return true; }, saveState(j) { window.__native = j; __calls.push(["saveState", (j || "").length]); return true; }, loadState() { return window.__native || ""; } };';

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: o.vp || { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({ api: 'https://api.test.invalid', app: o.app || 'test-0.32-demo', platform: o.android === false ? 'web' : 'android' }, o.cfg || {})) + ';');
  if (o.android !== false) await ctx.addInitScript(bridge(o));
  if (!o.fresh) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); ' + (o.rawState != null ? 'localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(o.rawState) + ');' : 'localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + ');') + (o.noAcct ? '' : ' localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + ');') + ' }');
  const sent = [];
  await ctx.route(/^https?:/, (r) => { const req = r.request(); let b = {}; try { b = JSON.parse(req.postData() || '{}'); } catch (e) { b = {}; } sent.push({ url: req.url(), body: b }); const ans = o.server ? o.server(req.url(), b) : null; if (ans) r.fulfill({ status: ans[0], contentType: 'application/json', body: JSON.stringify(ans[1]) }); else r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(o.now || NOW) });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, sent };
}
/* the app's timers run on the fake clock: step it a little at a time, with real pauses, so the screen keeps up */
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(15); } }
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 300); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const sheetText = (page) => page.$eval('#sheet-root', (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const tap = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const evs = async (page) => (await st(page)).events.map((e) => e.d + ':' + e.t + (e.approx ? '~' : '')).sort();
/* the tool rows Care's search box shows, in order */
async function careSearch(page, q) {
  await page.$eval('#care-q', (i, v) => { i.value = v; i.dispatchEvent(new Event('input')); }, q); await settle(page, 400);
  return page.evaluate(() => { const sec = document.querySelector('#view .care-sec'); return sec && sec.querySelector('h2') && /tools|टूल/i.test(sec.querySelector('h2').innerText) ? [...sec.querySelectorAll('[data-go]')].map((x) => x.dataset.go) : []; });
}
const cleanup = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };

/* ---------- 1. After a pregnancy loss Home waits for her next period (audit 2.2) ---------- */
{
  const T = await open({ seed: { events: regular(69, 8), situation: { pregnant: true, pregnantSince: ago(69) } } });
  const { page } = T;
  await tap(page, '#stage-btn'); await page.$eval('[data-stage="cycle"]', (b) => b.click()); await settle(page); await tap(page, '#st-save');
  const home = await view(page);
  check('1 after a loss: Home waits for her next period, with no late card or test advice', /Sakhi counts your cycle again from your next period/.test(home) && !/no period yet|past your likely range|home test/i.test(home), home.slice(0, 400));
  const s = await st(page);
  check('1 the day the pregnancy ended is kept', s.situation.pregEndedOn === TODAY && !s.situation.pregnant);
  await go(page, '#diary'); await page.$eval('[data-tab="days"]', (b) => b.click()); await settle(page);
  check('1 Days: the pregnancy is not counted as a cycle', !/Day \d+ of your cycle/.test(await view(page)) || /not counted|paused/.test(await view(page)));
  await go(page, '#home'); await tap(page, '#log-last'); await tap(page, '#log-save');
  check('1 her next period starts the count again', /Period · day|Cycle day/.test(await view(page)) && !/Sakhi counts your cycle again/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '1' }));
}

/* ---------- 2. A late period: no chance line, no next window, the late card at the end of her own range (audit 2.3) ---------- */
{
  /* 22-day cycles; the last started 27 days ago, so she is 5 days past the predicted day */
  const T = await open({ seed: { events: regular(27, 7, 22), situation: { planning: true } } });
  const { page } = T;
  check('2 late: no chance of pregnancy on Home', !(await page.$('#view .chance')) && !/chance of pregnancy/i.test(await view(page)));
  const late = await view(page);
  check('2 late: the late card is on Home at the end of her own range, not on day 37', /Day 28, and no period yet/.test(late), late.slice(0, 900));
  await go(page, '#explain');
  check('2 late: it says she is later than her own dates, with the ectopic warning', /later than your own likely dates/.test(await view(page)) && /pregnancy outside the womb \(ectopic\)/.test(await view(page)));
  const cells = await page.evaluate(() => { const S = window.Saathi; S.mem.calMonth = '2026-11-01'; S.mem.diaryTab = 'cal'; location.hash = 'diary'; S.render(); return [...document.querySelectorAll('.cal .day.fw, .cal .day.ov')].length; });
  check('2 late: the calendar draws no next fertile window', cells === 0, cells);
  await cleanup(Object.assign(T, { name: '2' }));
}
{
  const T = await open({ seed: { events: regular(34, 7), situation: { planning: true } }, lang: 'hi' });
  await T.page.evaluate(() => { window.Saathi.state.lang = 'hi'; window.Saathi.render(); }); await settle(T.page);
  check('2 Hindi: past her range reads "late", not "ahead"', /पीरियड संभावित समय से \d+ दिन देर से है/.test(await view(T.page)) && !/दिन आगे/.test(await view(T.page)), (await view(T.page)).slice(0, 300));
  await cleanup(Object.assign(T, { name: '2 Hindi' }));
}

/* ---------- 3. The after-birth recovery check never folds its warning signs (audit 2.4) ---------- */
{
  const T = await open({ seed: { situation: { deliveredOn: ago(21), breastfeeding: true } }, vp: { width: 360, height: 640 }, hash: '#post-recovery' });
  const f = await T.page.$eval('.pst-form', (e) => ({ folded: e.classList.contains('collapsed'), more: !!(e.nextElementSibling && e.nextElementSibling.classList.contains('morebtn')), text: e.innerText }));
  check('3 the recovery form is whole: chest pain, fits and breathlessness are on screen, no "Show more"', !f.folded && !f.more && /Chest pain/.test(f.text) && /Fits/.test(f.text) && /Breathless/.test(f.text), f);
  await cleanup(Object.assign(T, { name: '3' }));
}

/* ---------- 4. Logging traps (audit 3.2) ---------- */
{
  const T = await open({ seed: { events: regular(29, 4) } });
  const { page } = T;
  await page.$eval('[data-log="start"]', (b) => b.click()); await page.$eval('[data-log]', (b) => b.click()); await settle(page);
  check('4 a double tap on "Period started" logs the start only', (await evs(page)).filter((x) => x.startsWith(TODAY)).join() === TODAY + ':start', await evs(page));
  await settle(page, 3000);
  await page.$eval('[data-log="end"]', (b) => b.click()); await settle(page);
  check('4 ending a period on the day it started opens the sheet instead', !!(await page.$('#log-save')) && (await evs(page)).filter((x) => x === TODAY + ':end').length === 0);
  await page.$eval('#log-cancel', (b) => b.click()); await settle(page);
  await cleanup(Object.assign(T, { name: '4a' }));
}
{
  /* an end tapped on day 1 by mistake, then the real one on day 5: the later one counts, the earlier one goes */
  const T = await open({ seed: { events: regular(40, 3).concat([{ d: ago(4), t: 'start' }, { d: ago(4), t: 'end' }]) } });
  const { page } = T;
  check('4 the latest end counts', await page.evaluate((d) => window.Saathi.cycle.periodLen(d), ago(4)) === 1);
  await page.evaluate((d) => { window.Saathi.openDay(d); }, TODAY).catch(() => null);
  await page.evaluate(() => { const S = window.Saathi; S.state.events.push({ d: S.toISO(S.today()), t: 'end' }); S.save(); });
  check('4 a later end replaces an early one for the length', await page.evaluate((d) => window.Saathi.cycle.periodLen(d), ago(4)) === 5);
  await cleanup(Object.assign(T, { name: '4b' }));
}
{
  /* "Add details" on her start, then "Ended": the start stays and the end is added */
  const T = await open({ seed: { events: regular(40, 3).concat([{ d: ago(6), t: 'start' }]) } });
  const { page } = T;
  await go(page, '#diary');
  await page.evaluate((d) => { const S = window.Saathi; const ev = S.state.events.find((e) => e.d === d && e.t === 'start'); S.openLog('start', d, ev); }, ago(6));
  await settle(page); await page.$eval('[data-type="end"]', (b) => b.click()); await settle(page);
  await page.$eval('#log-date', (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); }, ago(2)); await settle(page);
  await page.$eval('#log-save', (b) => b.click()); await settle(page);
  check('4 turning a start into "Ended" keeps the start and adds the end', (await evs(page)).filter((x) => x >= ago(6)).join() === [ago(6) + ':start', ago(2) + ':end'].join(), await evs(page));
  await page.evaluate((d) => { const S = window.Saathi; const ev = S.state.events.find((e) => e.d === d && e.t === 'start'); S.openLog('start', d, ev); }, ago(6)); await settle(page);
  await page.$eval('#log-del', (b) => b.click()); await settle(page);
  check('4 deleting a start takes its end with it', (await evs(page)).filter((x) => x >= ago(6)).length === 0, await evs(page));
  const undo = await page.$$eval('#toast-root button', (bs) => bs.map((b) => b.textContent));
  await page.$$eval('#toast-root button', (bs) => { const u = bs.find((b) => /Undo/.test(b.textContent)); if (u) u.click(); }); await settle(page);
  check('4 Undo puts both back', (await evs(page)).filter((x) => x >= ago(6)).length === 2, { undo, ev: await evs(page) });
  await cleanup(Object.assign(T, { name: '4c' }));
}
{
  /* day 13 of a period with no end: the + menu keeps "Period ended", and "Period started" asks first */
  const T = await open({ seed: { events: regular(40, 3).concat([{ d: ago(12), t: 'start' }]) } });
  const { page } = T;
  await page.evaluate(() => window.scrollTo(0, 2000)); await settle(page);
  await page.$eval('#fab', (b) => b.click()); await settle(page);
  const items = await page.$$eval('.fab-it .fl', (xs) => xs.map((x) => x.textContent));
  check('4 a long period: the + menu offers "Period ended"', items.indexOf('Period ended') >= 0 && items.indexOf('Period started') >= 0, items);
  await page.$eval('#fab', (b) => b.click()); await settle(page);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.$eval('[data-log="start"]', (b) => b.click()); await settle(page);
  check('4 a new start 12 days into an open period asks first', /A new period\?/.test(await sheetText(page)) && (await evs(page)).filter((x) => x === TODAY + ':start').length === 0);
  await page.$eval('#np-end', (b) => b.click()); await settle(page);
  check('4 "the same one: it ended today" logs the end', (await evs(page)).indexOf(TODAY + ':end') >= 0);
  await cleanup(Object.assign(T, { name: '4d' }));
}
{
  /* her only entry is the guess from onboarding; she tries "Period started", then Undo */
  const T = await open({ seed: { events: [{ d: ago(14), t: 'start', approx: true }] } });
  const { page } = T;
  await page.$eval('[data-log="start"]', (b) => b.click()); await settle(page);
  await page.$$eval('#toast-root button', (bs) => { const u = bs.find((b) => /Undo/.test(b.textContent)); if (u) u.click(); }); await settle(page);
  check('4 Undo after her first start brings back her onboarding guess', (await evs(page)).join() === ago(14) + ':start~', await evs(page));
  await cleanup(Object.assign(T, { name: '4e' }));
}

/* ---------- 5. Left open overnight: Home draws the new day when she comes back (audit 3.2) ---------- */
{
  const T = await open({ seed: { events: regular(12, 4) }, now: '2026-10-22T23:58:00+05:30' });
  const { page } = T;
  const day1 = await page.$eval('#view .card.hero', (e) => e.innerText);
  await page.evaluate(() => window.__sakhiPause()); await page.clock.setSystemTime(new Date('2026-10-23T08:00:00+05:30')); await page.evaluate(() => window.__sakhiResume()); await settle(page);
  const day2 = await page.$eval('#view .card.hero', (e) => e.innerText);
  check('5 coming back the next morning: the cycle day moves on', /^12\b/.test(day1.trim()) && /^13\b/.test(day2.trim()), [day1.slice(0, 40), day2.slice(0, 40)]);
  await cleanup(Object.assign(T, { name: '5' }));
}

/* ---------- 6. Stage changes (audit 3.2) ---------- */
{
  const T = await open({ seed: { events: [{ d: ago(10), t: 'start' }], situation: { deliveredOn: ago(200), breastfeeding: true } } });
  const { page } = T;
  await tap(page, '#stage-btn'); await page.$eval('[data-stage="cycle"]', (b) => b.click()); await settle(page); await tap(page, '#st-save');
  check('6 back to tracking: breastfeeding no longer pauses her count', (await st(page)).situation.breastfeeding === false);
  await cleanup(Object.assign(T, { name: '6a' }));
}
{
  const T = await open({ seed: { events: regular(20, 6) }, hash: '#contra-mine' });
  const { page } = T;
  await page.$eval('[data-pick="pill"]', (b) => b.click()); await settle(page);
  let s = await st(page);
  check('6 picking the pill sets those cycles aside by itself', s.situation.hormones === true && s.situation.hormonesSince === TODAY, s.situation);
  await page.$eval('[data-pick=""]', (b) => b.click()); await settle(page);
  s = await st(page);
  check('6 "None now": hormones off from today', !s.situation.hormones && s.situation.hormonesUntil === TODAY, s.situation);
  await go(page, '#home');
  const home = await view(page);
  check('6 after stopping: Home waits for her next period (no instant "late")', /Sakhi counts your cycle again/.test(home) && !/past your likely range|no period yet/.test(home), home.slice(0, 300));
  await cleanup(Object.assign(T, { name: '6b' }));
}
{
  const T = await open({ seed: { dob: '1978-03-08', events: [{ d: ago(13), t: 'start' }, { d: ago(9), t: 'end' }] } });
  const { page } = T;
  await tap(page, '#stage-btn'); await page.$eval('[data-stage="meno"]', (b) => b.click()); await settle(page); await tap(page, '#st-save');
  await go(page, '#explain');
  check('6 "periods stopped" right after a period: no "bleeding after your periods stopped"', !/Bleeding after your periods stopped/.test(await view(page)) && (await st(page)).situation.stoppedOn === TODAY);
  await page.evaluate(() => { const S = window.Saathi; S.state.events.push({ d: S.toISO(S.addDays(S.today(), 0)), t: 'spot' }); S.state.situation.stoppedOn = S.toISO(S.addDays(S.today(), -1)); S.save(); S.render(); }); await settle(page);
  check('6 bleeding logged after that day is flagged', /Bleeding after your periods stopped/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '6c' }));
}

/* ---------- 7. Trends: one long period long ago doesn't keep "see a doctor this week" (audit 3.2) ---------- */
{
  const ev = regular(10, 10).map((e, i) => (i === 1 ? { d: iso(ev0(), 9), t: 'end' } : e));
  function ev0() { return regular(10, 10)[0].d; }
  const T = await open({ seed: { events: ev }, hash: '#diary' });
  const { page } = T;
  await page.$eval('[data-tab="tr"]', (b) => b.click()); await settle(page);
  const vd = await page.$eval('.vd-card', (e) => e.innerText).catch(() => '');
  check('7 a 10-day period 9 months ago: the badge is about recent periods, no "this week"', /Period length/.test(vd) && !/Longer than usual/.test(vd) && !/this week/.test(vd), vd.slice(0, 400));
  await cleanup(Object.assign(T, { name: '7' }));
}

/* ---------- 8. Home's heads-up and the countdown agree (audit 3.2) ---------- */
{
  const T = await open({ seed: { events: regular(24, 6) } });
  const v = await view(T.page);
  check('8 the heads-up talks about her likely days, not a second "next period" date', /Your likely days start in \d+ days|Your likely days start tomorrow/.test(v) && !/Your period may come in about/.test(v), v.slice(0, 700));
  await cleanup(Object.assign(T, { name: '8' }));
}

/* ---------- 9. Signup: a hiccup on Qura's side never locks her out; codes behave (audit 3.1) ---------- */
const suSeed = { noAcct: true, seed: { events: regular(10, 3) } };
async function toCode(page, num) { await page.$eval('#su-num', (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, num || '9876543210'); await tap(page, '#su-send'); }
for (const [name, ans, want] of [['WhatsApp and SMS both down', [502, { error: 'send_failed' }], /couldn’t send a code right now/i], ['a database error', [500, { error: 'server_error' }], /server isn’t answering/i], ['a rate limit', [429, { error: 'too_many', retry_after: 1800 }], /Try again in 30 min/]]) {
  const T = await open(Object.assign({ server: (u) => (/otp\/start/.test(u) ? ans : null) }, suSeed));
  await toCode(T.page);
  const v = await view(T.page);
  check('9 ' + name + ': the right message, and "Continue for now"', want.test(v) && !!(await T.page.$('#su-later')), v.slice(0, 400));
  await tap(T.page, '#su-later');
  check('9 ' + name + ': "Continue for now" opens her diary', !(await T.page.$('#su-num')));
  await cleanup(Object.assign(T, { name: '9 ' + name }));
}
{
  let starts = 0;
  const T = await open(Object.assign({ server: (u, b) => { if (/otp\/start/.test(u)) { starts++; return [200, { challenge: 'ch' + starts, channel: b.channel === 'sms' ? 'sms' : 'whatsapp', resend_after: 30, expires_in: 600 }]; } if (/otp\/verify/.test(u)) return [429, { error: 'too_many', retry_after: 0 }]; return null; } }, suSeed));
  const { page, sent } = T;
  await toCode(page);
  await tap(page, '#su-back'); await toCode(page);
  check('9 back and "Send code" again for the same number: the same code screen, no second code', starts === 1 && !!(await page.$('#su-code')), starts);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await settle(page);
  check('9 the code step survives Android reloading Sakhi', !!(await page.$('#su-code')) && /98765/.test(await view(page)));
  await tap(page, '#su-by-sms');
  await settle(page, 31000);
  await tap(page, '#su-resend');
  const chans = sent.filter((x) => /otp\/start/.test(x.url)).map((x) => x.body.channel || 'auto');
  check('9 after "Send by SMS", a new code comes by SMS too', chans.slice(-2).join() === 'sms,sms', chans);
  await page.$eval('#su-code', (el) => { el.value = '111111'; el.dispatchEvent(new Event('input')); }); await settle(page);
  check('9 five wrong tries: "ask for a new code", and the button is ready', /Ask for a new code/.test(await view(page)) && !(await page.$eval('#su-resend', (b) => b.disabled)));
  await cleanup(Object.assign(T, { name: '9 codes' }));
}
{
  const T = await open(Object.assign({ server: (u) => (/otp\/start/.test(u) ? [200, { challenge: 'c1', channel: 'whatsapp', resend_after: 30, expires_in: 600 }] : (/otp\/verify/.test(u) ? [400, { error: 'code_wrong' }] : null)) }, suSeed));
  await toCode(T.page);
  await T.page.$eval('#su-code', (el) => { el.value = '222222'; el.dispatchEvent(new Event('input')); }); await settle(T.page);
  check('9 a wrong code no longer says "Check the SMS" when it came on WhatsApp', /Check the message and try again/.test(await view(T.page)) && !/Check the SMS/.test(await view(T.page)));
  await cleanup(Object.assign(T, { name: '9 wrong' }));
}

/* ---------- 10. Delete everything, the forgotten PIN and samples (audit 2.7, 3.5) ---------- */
{
  const T = await open({ seed: { events: regular(10, 3), reminders: [{ id: 'r1', kind: 'custom', text: 'Iron tablet', time: '09:00', on: true, rep: 'daily', from: TODAY }], settings: { notify: true } } });
  const { page } = T;
  await go(page, '#me'); await tap(page, '#me-del'); await tap(page, '#del-yes');
  const after = await page.evaluate(() => ({ acct: localStorage.getItem('qura-sakhi-account-v1'), diary: localStorage.getItem('qura-saathi-v1'), calls: window.__calls.slice(-6), native: window.__native }));
  check('10 delete everything: signed out on this phone, alarms cleared, the second copy gone', !after.acct && after.calls.some((c) => c[0] === 'schedule' && c[1] === '[]') && !after.native, after);
  await cleanup(Object.assign(T, { name: '10a' }));
}
{
  /* a backup made with the app lock on, then the PIN forgotten: the backup opens the diary and drops the lock */
  const A = await open({ seed: { events: regular(10, 3), settings: { pinHash: null } }, hash: '#backup' });
  await A.page.$eval('#bk-pin', (el) => { el.value = '4321'; }); await A.page.$eval('#bk-pin2', (el) => { el.value = '4321'; });
  await A.page.evaluate(() => { window.Saathi.state.settings.pinHash = 'abc123'; });
  await A.page.$eval('#bk-make', (b) => b.click()); await A.page.waitForSelector('#bk-the-code', { timeout: 15000 });
  const code = await A.page.$eval('#bk-the-code', (e) => e.value); await cleanup(Object.assign(A, { name: '10b make' }));
  const T = await open({ seed: { events: [], settings: { pinHash: 'deadbeef' } } });
  const { page } = T;
  await tap(page, '#lock-forgot');
  check('10 forgot PIN: "restore from my backup code" comes before deleting', !!(await page.$('#lf-restore')) && /backup code/.test(await view(page)));
  await tap(page, '#lf-restore');
  await page.$eval('#wr-code', (el, v) => { el.value = v; }, code); await page.$eval('#wr-pin', (el) => { el.value = '4321'; });
  await page.$eval('#wr-go', (b) => b.click()); await page.waitForFunction(() => !window.Saathi.state.settings.pinHash && window.Saathi.state.events.length > 0, null, { timeout: 15000 }).catch(() => null); await settle(page);
  const s = await st(page);
  check('10 the restored diary comes back without the forgotten PIN', !s.settings.pinHash && s.events.length === 6 && !(await page.$('#lockpad')), { pin: s.settings.pinHash, n: s.events.length });
  await cleanup(Object.assign(T, { name: '10b' }));
}
{
  const T = await open({ seed: { events: regular(10, 3) }, hash: '#me-about' });
  const { page } = T;
  for (let i = 0; i < 5; i++) await page.$eval('#me-version', (b) => b.click());
  await settle(page); await page.$eval('[data-set="proto"]', (b) => b.click()); await settle(page);
  await page.$eval('[data-demo]', (b) => b.click()); await settle(page);
  check('10 a sample woman asks before replacing her diary', /replaces the entries on this phone/.test(await view(page)) && !(await st(page)).sample);
  await cleanup(Object.assign(T, { name: '10c' }));
}

/* ---------- 11. Reminders: asked to turn on phone reminders the moment she sets one (audit 3.3) ---------- */
{
  const T = await open({ seed: { events: regular(10, 3) }, hash: '#contra-mine' });
  const { page } = T;
  await page.$eval('[data-pick="pill"]', (b) => b.click()); await settle(page, 1200);
  check('11 setting the pill with phone reminders off asks to turn them on', /Turn on phone reminders\?/.test(await sheetText(page)));
  await page.$eval('#nq-yes', (b) => b.click()); await settle(page, 600);
  const s = await st(page);
  check('11 "Turn on" asks Android and turns phone reminders on', s.settings.notify === true && (await page.evaluate(() => window.__calls.some((c) => c[0] === 'askNotify'))));
  await go(page, '#tools-reminders');
  check('11 the Reminders page says they ring on this phone (no WhatsApp, no "prototype")', /ring as notifications/.test(await view(page)) && !/WhatsApp message|prototype/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '11' }));
}

/* ---------- 12. A second copy of the diary through the Android bridge (audit 2.6) ---------- */
{
  const older = seedOf({ events: regular(10, 3) }); older.savedAt = 1;
  const newer = seedOf({ events: regular(10, 3).concat([{ d: TODAY, t: 'spot' }]) }); newer.savedAt = 2;
  const T = await open({ rawState: JSON.stringify(older), native: JSON.stringify(newer) });
  check('12 at start the newer copy wins (an entry the WebView lost comes back)', (await evs(T.page)).indexOf(TODAY + ':spot') >= 0);
  await T.page.evaluate(() => { const S = window.Saathi; S.state.notes[S.toISO(S.today())] = 'x'; S.save(); });
  check('12 every save goes to the second copy too', await T.page.evaluate(() => JSON.parse(window.__native).notes[window.Saathi.toISO(window.Saathi.today())] === 'x'));
  await cleanup(Object.assign(T, { name: '12a' }));
  const T2 = await open({ rawState: '{"events": [broken', native: JSON.stringify(newer) });
  check('12 a damaged saved diary: the second copy is used and the damaged one kept aside', (await evs(T2.page)).length === 7 && (await T2.page.evaluate(() => localStorage.getItem('qura-saathi-v1-rescue'))) === '{"events": [broken');
  await cleanup(Object.assign(T2, { name: '12b' }));
}

/* ---------- 13. A tester's APK holds back fertile days and the triage tools (decisions 1 and 3) ---------- */
{
  const T = await open({ app: 'test-0.32', seed: { events: regular(10, 8), situation: { planning: true } } });
  const { page } = T;
  check('13 no chance of pregnancy in a tester\'s APK', !/chance of pregnancy/i.test(await view(page)));
  const tiles = await page.evaluate(() => window.Saathi.tiles ? null : null);
  await go(page, '#pattern');
  check('13 a held-back tool says it is not in this version', /Not in this version/.test(await view(page)));
  await go(page, '#care');
  const care = await page.$$eval('[data-go]', (xs) => xs.map((x) => x.dataset.go));
  check('13 no links to held-back tools anywhere on Care', !care.some((r) => ['pattern', 'selfcheck', 'intimate-check', 'cond-labs', 'meno-score', 'midlife', 'pregtest-abortion', 'access-symptoms', 'preg-symptoms', 'pregtools-kicks', 'pregtools-contractions', 'fertile'].indexOf(r) >= 0), care);
  await go(page, '#explain');
  check('13 What your diary shows stays', !/Not in this version/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '13' }));
  const D = await open({ seed: { events: regular(10, 8) }, hash: '#pattern' });
  check('13 a demo build still has them', !/Not in this version/.test(await view(D.page)));
  await cleanup(Object.assign(D, { name: '13 demo' }));
}

/* ---------- 14. Fertile days: for every woman (Version 33), never "low", hidden in discreet mode (audit 2.1) ---------- */
{
  const T = await open({ seed: { events: regular(5, 8) }, hash: '#fertile' });
  check('14 a woman not trying for a baby sees her fertile days, and that they are not a way to avoid pregnancy', /Likely fertile days/.test(await view(T.page)) && /not a way to avoid pregnancy/.test(await view(T.page)) && !/Low chance/i.test(await view(T.page)));
  await T.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.render(); }); await settle(T.page);
  check('14 discreet mode: the fertile page shows nothing', /Hidden while discreet mode is on/.test(await view(T.page)));
  await cleanup(Object.assign(T, { name: '14' }));
}

/* ---------- 19. A pilot build has every tool, without the demo extras (Version 33, MODULE_API section 35) ---------- */
{
  /* day 11 of steady 28-day cycles: inside her fertile window */
  const T = await open({ app: 'test-0.33-pilot', seed: { events: regular(10, 8) } });
  const { page } = T;
  check('19 pilot: the chance of pregnancy shows, for a woman not trying for a baby', /Medium chance of pregnancy from sex today|High chance of pregnancy from sex today/.test(await view(page)), (await view(page)).slice(0, 500));
  await go(page, '#pattern');
  check('19 pilot: the self-checks are back', !/Not in this version/.test(await view(page)));
  await go(page, '#topic-ttc');
  const ttc = await page.$$eval('[data-go]', (xs) => xs.map((x) => x.dataset.go));
  check('19 pilot: Care\'s trying-for-a-baby page links to the fertile tool again', ttc.indexOf('fertile') >= 0, ttc);
  await go(page, '#me-about');
  for (let i = 0; i < 5; i++) await page.$eval('#me-version', (b) => b.click());
  await settle(page);
  check('19 pilot: no prototype settings and no sample women behind the version taps', !(await page.$('[data-set="proto"]')) && !(await page.$('[data-demo]')));
  await go(page, '#me-privacy');
  check('19 pilot: "send what helps" stays hidden while its server route is not live', !(await page.$('[data-set="usage"]')));
  await cleanup(Object.assign(T, { name: '19' }));
}

/* ---------- 15. Help paths, words and the notice (decisions 4 and 5, audit 3.4) ---------- */
{
  const T = await open({ seed: { events: regular(10, 3) }, hash: '#ask', cfg: { grievance: 'Test Officer, Trinaya Wellness LLP' } });
  const { page } = T;
  const ids = await page.$$eval('#view .card', (cs) => cs.map((c) => c.id || ''));
  check('15 the free government doctor comes first on the doctor screen', ids[0] === 'ask-free', ids);
  check('15 the Qura card says who the doctors are and what costs money', /Ayurveda \(BAMS\)/.test(await view(page)) && /tests and plans cost money/.test(await view(page)));
  await go(page, '#me-about');
  check('15 the notice names the Grievance Officer the build gives, and where the account is kept', /Grievance Officer: Test Officer/.test(await view(page)) && /Mumbai \(Supabase\)/.test(await view(page)) && !/\[NAME/.test(await view(page)));
  await go(page, '#access-schemes-preg'); await page.evaluate(() => document.querySelectorAll('#view details').forEach((d) => { d.open = true; }));
  check('15 the PMMVY helpline is 1515', /Helpline 1515/.test(await view(page)) && !/14408/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '15' }));
}
{
  const T = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, checkins: { '2026-10': { at: ago(1), chips: ['breast'], kind: 'post' } } }, hash: '#explain' });
  const btns = await T.page.$$eval('.xp-card button', (bs) => bs.map((b) => b.dataset.go || (b.dataset.ask ? 'ask' : '')));
  check('15 "see a doctor today" points to free care, not to booking a call', btns.indexOf('access-free') >= 0 && btns.indexOf('ask') < 0, btns);
  await cleanup(Object.assign(T, { name: '15 explain' }));
}

/* ---------- 16. Hindi search finds her pregnancy first, and the fertile tool (audit 3.7) ---------- */
{
  const T = await open({ seed: { lang: 'hi', situation: { pregnant: true, pregnantSince: ago(80) } }, hash: '#care' });
  const { page } = T;
  const res = await careSearch(page, 'गर्भ');
  check('16 "गर्भ": her pregnancy tools before loss and abortion', ['preg-plan', 'preg-week', 'pregnancy'].indexOf(res[0]) >= 0 && res.slice(0, 3).every((r) => !/^loss/.test(r) && r !== 'pregtest-abortion'), res.slice(0, 8));
  const fz = await careSearch(page, 'ओव्यूलेशन');
  check('16 "ओव्यूलेशन" finds the fertile tool', fz.indexOf('fertile') >= 0, fz);
  const fz2 = await careSearch(page, 'फर्टाइल');
  check('16 "फर्टाइल" without the nukta finds it too', fz2.indexOf('fertile') >= 0, fz2);
  await cleanup(Object.assign(T, { name: '16' }));
}

/* ---------- 17. Android: Back steps through the first run; the day sheet has no speaker over its arrows (audit 2.9, 3.6) ---------- */
{
  const T = await open({ fresh: true, noAcct: true, hash: '' });
  const { page } = T;
  await page.evaluate(() => { const S = window.Saathi; S.state.langChosen = true; S.state.stage = 'onboard'; S.mem.ob = { step: 2 }; S.render(); }); await settle(page);
  const back = await page.evaluate(() => window.__sakhiBack());
  check('17 Android Back on a first-run step steps back instead of closing Sakhi', back === true);
  await cleanup(Object.assign(T, { name: '17a' }));
  const D = await open({ seed: { events: regular(10, 3) } });
  await D.page.evaluate(() => window.Saathi.openDay(window.Saathi.toISO(window.Saathi.today()))); await settle(D.page);
  check('17 the day sheet has no speaker on top of its next-day arrow', !(await D.page.$('#sheet-say')) && !!(await D.page.$('[data-dstep="1"]')));
  await cleanup(Object.assign(D, { name: '17b' }));
}

/* ---------- 18. Old phones and the files that ship (audit 3.6) ---------- */
{
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  check('18 index.html asks for a WebView update if the app never starts', /boot-note/.test(html) && /Android System WebView/.test(html));
  const css = fs.readFileSync(path.join(root, 'app.css'), 'utf8');
  check('18 no CSS "inset" (sheets open off-screen before Chrome 87)', !/(^|[^-\w])inset:/m.test(css));
  const js = ['app.js'].concat(fs.readdirSync(path.join(root, 'mods')).filter((f) => f.endsWith('.js')).map((f) => 'mods/' + f)).map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  check('18 no \\p{...} regex literals (older WebViews cannot read the file)', !/\/[^/\n]*\\p\{[A-Za-z]+\}[^/\n]*\/[a-z]*u/.test(js.replace(/new RegExp\([^)]*\)/g, '')));
  const T = await open({ seed: { events: regular(10, 3) } });
  check('18 a normal start replaces the note', !(await T.page.$('.boot-note')));
  await cleanup(Object.assign(T, { name: '18' }));
  if (fs.existsSync(path.join(root, 'care', 'index.js'))) {
    const sb = {}; for (const f of fs.readdirSync(path.join(root, 'care'))) if (f.endsWith('.js')) new Function('window', fs.readFileSync(path.join(root, 'care', f), 'utf8'))(sb);
    const bad = []; for (const k in sb.SAKHI_CARE) if (/^t/.test(k)) for (const r of sb.SAKHI_CARE[k]) if (['gh', 'mh', 'wh'].indexOf(r[1]) >= 0 && /\b(pvt|private|nursing\s*home|apollo|fortis|max|rockland|ganga\s*ram)\b/i.test(r[0])) bad.push(r[0]);
    check('18 Care near me calls no private hospital a government one', !bad.length, bad.slice(0, 8));
  }
}

await browser.close();
const bad = results.filter((r) => !r.pass);
console.log(bad.length ? 'FIELDTEST FAIL ' + (results.length - bad.length) + '/' + results.length : 'FIELDTEST OK ' + results.length + '/' + results.length);
process.exit(bad.length ? 1 : 0);
