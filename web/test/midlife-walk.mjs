// My midlife plan, version 2, lived through (Mohit, 30 Oct: "can you do testing first for any gaps or bugs", before its commit).
// Each woman joins Sakhi from a new install on his Flip5's 360 x 800 screen, the way she would, then lives her plan, following it
// on about 4 days a week. At each stop: Today, a tick, her evening (the check-in), what she sees after it, My plan, the Diary,
// Today at night, and what rings on the phone; on some stops each step's own page too.
//   - Kavita, 51, periods stopped, hot flushes (and sleep): days 1, 2, 7 (her weekly number), 8 (also in Hindi and on a shared
//     phone), 22 (week 4), 29 (Rest), 57 (Strong and steady, its routine played), 78 (week 12), 85 (the end) and 95 (her year).
//   - Sunita, 44, periods changing, sleep, the government route: days 1, 8, 29 (then "Periods stopped" on the stage sheet), 36.
//   - Asha, 47, periods stopped, aches and tiredness, on hormone medicine, chest pain when she walks and weak bones: days 1, 2,
//     22 (then "My doctor says I can do more"), 23.
//   - Meera, 37, periods stopped: the gynaecologist first, then her plan.
//   - Vera, on version 1 since 40 days ago: the new version's offer, Try it.
// Not pass/fail: the screens, each screen's words and the reminders go to test/shots/midlife-walk/ (gitignored), with flags for
// page errors, string keys, sideways scroll, an empty view, blank placeholders, a line said twice on one screen and too many steps.
// Usage: node test/midlife-walk.mjs [only]   (only: kavita | sunita | asha | meera | vera)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ONLY = process.argv[2] || null;
const SHOTS = path.join(here, 'shots', 'midlife-walk'); fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);
const at2 = (day, hm) => new Date(day + 'T' + hm + ':00+05:30');
const LOCAL = { app: '0.39.51-pilot', platform: 'android' };   /* no server address: the stand-in server (code 123456) */
const BRIDGE = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const KEYS = /\b(plan|preg|pregtools|ttc|food|post|pst|ci|hs|fx|rv|pg|pf|mcp|ob|ys|fl|td|tour|qa|late|bb|st|slot|today|dy|cal|mid|meno|m2)_[a-z0-9_]{2,}\b/;
const browser = await chromium.launch();
const flags = []; const errsAll = []; const LOG = {};
const flag = (who, tag, where, what) => flags.push(who + ' ' + tag + ' ' + where + ': ' + what);

async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
async function open(o) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(BRIDGE);
  if (o.state) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(o.state)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(o.acct)) + '); }');
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 240)));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 240)); });
  await page.clock.install({ time: o.now });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 600); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 500); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const hashOf = (a) => a.page.evaluate(() => location.hash);
const viewText = (a) => a.page.$eval('#view', (e) => e.innerText).catch(() => '');
const stateOf = (a) => a.page.evaluate(() => JSON.parse(localStorage.getItem('qura-saathi-v1')));
const acctOf = (a) => a.page.evaluate(() => JSON.parse(localStorage.getItem('qura-sakhi-account-v1') || 'null'));
const steps = (a) => a.page.evaluate(() => (window.Saathi.plan && window.Saathi.plan.actions ? window.Saathi.plan.actions() : []).map((x) => ({ id: x.id, title: x.title, sub: x.sub || '', go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function closeTips(a) {
  for (let k = 0; k < 6; k++) {
    const did = await a.page.evaluate(() => { const b = document.querySelector('#tour-root #tour-later, #tour-root #tour-next'); if (b) { b.click(); return true; }
      const n = [...document.querySelectorAll('.tour-pop button')].find((x) => /Not now|Later|Close|Skip|अभी नहीं|बाद में/i.test(x.textContent || '')); if (n) { n.click(); return true; } return false; });
    if (!did) break; await settle(a.page, 300);
  }
}
/* the "Sakhi says" slot: its first card, and how many more wait under it */
const slotOf = (a) => a.page.evaluate(() => { const s = document.querySelector('#view section.slot'); if (!s) return { n: 0, first: '' };
  const more = s.querySelectorAll('details.slot-more .card').length; const first = [...s.children].find((x) => x.classList && x.classList.contains('card'));
  return { n: (first ? 1 : 0) + more, first: first ? first.innerText.replace(/\s+/g, ' ').trim() : '', more: [...s.querySelectorAll('details.slot-more .card')].map((x) => x.textContent.replace(/\s+/g, ' ').trim().slice(0, 160)) }; });
/* what rings in the next 36 hours, from the last list Sakhi gave the phone */
const rings = (a) => a.page.evaluate(() => { const s = (window.__calls || []).filter((c) => c[0] === 'schedule'); if (!s.length) return [];
  const all = JSON.parse(s[s.length - 1][1]); const now = Date.now();
  return all.filter((x) => x.at - now < 36 * 3600e3).sort((x, y) => x.at - y.at).map((x) => { const d = new Date(x.at); return d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) + ' · ' + x.body + (x.go ? ' → #' + x.go : ''); }); });
const remList = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => r.id + (r.on === false ? ' (off)' : '') + ' ' + (r.time || '') + (r.every ? ' every ' + r.every : '') + (r.weekdays ? ' wd ' + r.weekdays.join('') : '') + (r.dates ? ' dates ' + r.dates.length : '') + (r.start ? ' from ' + r.start : '') + (r.until ? ' until ' + r.until : '')));

/* every screen: words kept, a picture, and the flags */
async function look(a, who, tag, where) {
  await settle(a.page, 300); const v = await viewText(a); const f = [];
  if (!v || v.trim().length < 40) f.push('empty view');
  const k = v.match(KEYS); if (k) f.push('string key "' + k[0] + '"');
  if (/\bundefined\b|\bNaN\b|\{[a-z_]+\}|\bnull\b|\[object/.test(v)) f.push('placeholder: ' + (v.match(/.{0,40}(\bundefined\b|\bNaN\b|\{[a-z_]+\}|\bnull\b|\[object).{0,40}/) || [''])[0].replace(/\s+/g, ' '));
  if (!(await noScroll(a))) f.push('scrolls sideways');
  const lines = v.split('\n').map((x) => x.trim()).filter((x) => x.length > 30); const seen = {}; lines.forEach((x) => { seen[x] = (seen[x] || 0) + 1; });
  const twice = Object.keys(seen).filter((x) => seen[x] > 1); if (twice.length) f.push('said twice: "' + twice.map((x) => x.slice(0, 90)).join('" / "') + '"');
  if (a.errs.length) { f.push('errors: ' + a.errs.join(' / ')); errsAll.push(...a.errs.map((e) => who + ' ' + tag + ' ' + where + ': ' + e)); a.errs.length = 0; }
  f.forEach((x) => flag(who, tag, where, x));
  const name = who + '-' + tag + '-' + where; await a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
  return { where, hash: await hashOf(a), text: v.replace(/\n{2,}/g, '\n').trim() };
}
/* her plan's answers: a typical woman (in bed 11 pm to midnight, so the bedtime step shows), never the first chip by default */
const PREF = { act: '0', food: 'veg', milk: 'y', lim: 'none', bed: 'b24', work: 'day', skips: 'n', signs: 'none', dx: 'y', trying: 'lt6', gap: 'g45' };
/* a benign answer for every question group still open on the screen (never a warning sign) */
const BENIGN = /^(none|light|fine|no|ok|good|okay|never|well|brown|stitch|usual|easy|fine_ok|n|same|yes_ok|rested)$/;
async function answerOpen(a, sel, pref) {
  await a.page.evaluate(([sel, ben, pref]) => { const re = new RegExp(ben); const groups = {};
    document.querySelectorAll(sel).forEach((b) => { if (b.closest('[hidden]')) return; const k = Object.keys(b.dataset)[0]; const raw = b.dataset[k] || ''; const g = k + '|' + (raw.indexOf(':') >= 0 ? raw.split(':')[0] : (b.dataset.pstG || '')); (groups[g] = groups[g] || []).push(b); });
    Object.values(groups).forEach((bs) => { if (bs.some((b) => b.classList.contains('on'))) return; const val = (b) => { const k = Object.keys(b.dataset).find((x) => x !== 'pstG') || Object.keys(b.dataset)[0]; const raw = b.dataset[k] || ''; return raw.indexOf(':') >= 0 ? raw.split(':').pop() : raw; };
      const key = (() => { const b = bs[0]; const k = Object.keys(b.dataset)[0]; const raw = b.dataset[k] || ''; return raw.indexOf(':') >= 0 ? raw.split(':')[0] : ''; })();
      (bs.find((b) => pref && pref[key] != null && val(b) === pref[key]) || bs.find((b) => re.test(val(b))) || bs[0]).click(); });
  }, [sel, BENIGN.source, pref || null]);
  await settle(a.page, 400);
}
/* sign-up on the stand-in server: her name is filled in from joining; she adds her PIN code */
async function signUp(a) {
  await a.page.waitForSelector('#su-num', { timeout: 10000 }); await a.page.fill('#su-num', '9876543210'); await tap(a, '#su-send');
  await a.page.waitForSelector('#su-code', { timeout: 10000 }); await a.page.fill('#su-code', '123456');
  await a.page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 10000 });
  if (await has(a, '#su-done')) { await a.page.fill('#su-pin', '302001'); await tap(a, '#su-done'); }
  await settle(a.page, 900);
}
/* her plan's own questions, the reveal's cards and Start: every screen kept, and the taps counted */
async function startPlan(a, who, tag, rec) {
  let n = 0; const scr = rec.start = rec.start || []; let taps = 0;
  const tp = async (sel) => { taps++; await tap(a, sel); };
  for (let i = 0; i < 16; i++) {
    const h = await hashOf(a); if (h === '#plan-reveal') break;
    scr.push(await look(a, who, tag, 'q' + String(++n).padStart(2, '0')));
    if (await has(a, '#pl-in-make')) { await tp('#pl-in-make'); continue; }
    if (await has(a, '[data-pl-goal]')) { const g = (rec.pref || {}).goal; await tp((g && (await has(a, '[data-pl-goal="' + g + '"]'))) ? '[data-pl-goal="' + g + '"]' : '[data-pl-goal]'); continue; }
    if ((await has(a, '[data-pl-pnow]')) && !(await has(a, '[data-pl-pnow].on'))) await tp('[data-pl-pnow="n"]');
    if (await has(a, '[data-pl-when]')) { await tp('[data-pl-when="' + ((rec.pref || {}).when || 'dinner') + '"]'); continue; }
    if (await has(a, '#pl-in-skip')) { await tp('#pl-in-skip'); continue; }
    const before = await a.page.$$eval('[data-pl-q].on, [data-pl-m].on', (x) => x.length);
    await answerOpen(a, '#view [data-pl-q], #view [data-pl-m]', Object.assign({}, PREF, rec.pref || {})); taps += (await a.page.$$eval('[data-pl-q].on, [data-pl-m].on', (x) => x.length)) - before;
    if (await has(a, '#pl-in-next')) await tp('#pl-in-next'); else { flag(who, tag, 'start', 'no Continue on ' + h); break; }
  }
  for (let i = 0; i < 12; i++) {
    scr.push(await look(a, who, tag, 'r' + String(i + 1).padStart(2, '0')));
    if (await has(a, '#pl-rv-go')) break;
    if (!(await has(a, '#pl-rv-next'))) { flag(who, tag, 'reveal', 'no Next and no Start on ' + (await hashOf(a))); break; }
    await tp('#pl-rv-next');
  }
  if (await has(a, '#pl-rv-go')) await tp('#pl-rv-go');
  await settle(a.page, 1000); rec.startTaps = taps;
  const d = ((await stateOf(a)).mods || {}).plan || {};
  rec.started = { pack: d.pack, pv: d.pv, goalKey: d.goalKey, start: d.start, go: d.go, hash: await hashOf(a) };
}
/* the days between stops: she follows her plan on about 4 days a week, and logs her periods; after a birth, her recovery check */
function live(s, w, toDay) {
  const p = s.mods.plan; if (!p || !p.start) return s; p.log = p.log || {};
  const end = diff(p.start, toDay);
  for (let d = 0; d < end; d++) {
    const k = iso(p.start, d); if (k < (w.lived || '')) continue;
    if ([0, 2, 3, 5].indexOf(d % 7) >= 0 && !p.log[k]) p.log[k] = { ci: 1, min: 20 };
    const born = (s.situation || {}).deliveredOn;
    if (born && diff(born, k) >= 0 && diff(born, k) <= 41 && [0, 2, 3, 5].indexOf(d % 7) >= 0) { s.mods.post = s.mods.post || {}; const r = s.mods.post.rec = s.mods.post.rec || {}; if (!r[k]) r[k] = { danger: ['none'], bleed: diff(born, k) < 14 ? 'moderate' : 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', at: '20:40' }; }
  }
  for (const pd of (w.periods || [])) { const st0 = iso(TODAY, pd - 1); if (st0 < toDay && st0 >= (w.lived || TODAY) && !(s.events || []).some((e) => e.d === st0)) { s.events = (s.events || []).concat([{ d: st0, t: 'start' }, { d: iso(st0, 4), t: 'end' }]); } }
  w.lived = toDay; return s;
}

/* one stop: Today, a tick, her evening, after it, My plan, the Diary, Today at night, the phone's rings */
async function stop(w, tag, day, o = {}) {
  const rec = LOG[w.who][tag] = { day, lang: o.lang || 'en', disc: !!o.disc };
  const st0 = JSON.parse(JSON.stringify(w.s)); if (o.lang) st0.lang = o.lang; if (o.disc) st0.settings = Object.assign({}, st0.settings, { discreet: true });
  const a = await open({ state: st0, acct: w.acct, now: at2(day, '10:00'), lang: o.lang });
  try {
    await closeTips(a);
    rec.sheet = await a.page.evaluate(() => { const r = document.querySelector('#sheet-root'); return r && r.innerText.trim() ? r.innerText.replace(/\s+/g, ' ').slice(0, 200) : ''; });
    if (rec.sheet) { await a.page.keyboard.press('Escape'); await settle(a.page, 300); }
    rec.steps = await steps(a); rec.slot = await slotOf(a);
    const n = rec.steps.length; if (n > 4) flag(w.who, tag, 'today', n + ' steps (4 at most)'); if (tag === 'd1' && n > 3) flag(w.who, tag, 'today', n + ' steps on day 1 (3 or fewer)');
    rec.today = await look(a, w.who, tag, '1-today');
    if (o.only === 'today') return rec;
    if (o.steps) { rec.stepPages = []; for (const x of rec.steps) { if (!x.go) continue; await go(a, x.go); await closeTips(a); rec.stepPages.push(Object.assign({ id: x.id }, await look(a, w.who, tag, 'step-' + x.id))); } await go(a, 'home'); }
    if (await has(a, '[data-today-act]')) { await a.page.$eval('[data-today-act]', (b) => b.click()); await settle(a.page, 600); rec.ticked = await look(a, w.who, tag, '1b-ticked'); }
    if (o.at10) await o.at10(a, rec);
    /* her evening */
    await a.page.clock.setSystemTime(at2(day, '21:00')); await go(a, 'home'); await closeTips(a);
    rec.evening = await look(a, w.who, tag, '2a-today-9pm');
    await go(a, 'plan-checkin'); await closeTips(a);
    const h = await hashOf(a); rec.ciHash = h;
    if (h === '#post-recovery') {
      rec.checkin = await look(a, w.who, tag, '2-recovery-check');
      await a.page.evaluate(() => { const b = document.querySelector('[data-pst-g="danger"][data-pst-v="none"]'); if (b && !b.classList.contains('on')) b.click(); }); await settle(a.page, 300);
      for (let i = 0; i < 3; i++) await answerOpen(a, '#view [data-pst-g]:not([data-pst-g="danger"])');
      if (await has(a, '#pst-rsave')) await tap(a, '#pst-rsave'); else flag(w.who, tag, 'recovery', 'no Save');
      rec.after = await look(a, w.who, tag, '3-recovery-saved');
      await go(a, 'home'); rec.afterHome = await look(a, w.who, tag, '3b-today-after');
    } else if (h === '#plan-checkin') {
      rec.checkin = await look(a, w.who, tag, '2-checkin');
      await a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => { if (!x.classList.contains('on')) x.click(); })); await settle(a.page, 300);
      await answerOpen(a, '#view [data-ci-mv], #view [data-ci-slp], #view [data-ci-lk], #view [data-ci-pain], #view [data-ci-feel], #view [data-ci-md]');
      rec.msCard = await has(a, '#view .pl-ci-ms'); rec.slpCard = await has(a, '#view .pl-ci-slpc');
      if (o.ms != null && (await has(a, '[data-ci-ms="' + o.ms + '"]'))) await tap(a, '[data-ci-ms="' + o.ms + '"]');
      if (await has(a, '#pl-ci-save')) await tap(a, '#pl-ci-save'); else flag(w.who, tag, 'checkin', 'no Save');
      rec.after = await look(a, w.who, tag, '3-after-checkin');
      const lg = (((await stateOf(a)).mods.plan || {}).log || {})[day] || {}; if (!lg.ci) flag(w.who, tag, 'checkin', 'the check-in did not save');
      await go(a, 'home'); rec.afterHome = await look(a, w.who, tag, '3b-today-after');
    } else { rec.checkin = await look(a, w.who, tag, '2-checkin-elsewhere'); flag(w.who, tag, 'checkin', 'the check-in opened ' + h); }
    if (o.only === 'evening') { rec.rings = await rings(a); rec.rem = await remList(a); return rec; }
    await go(a, 'plan'); await closeTips(a); rec.myplan = await look(a, w.who, tag, '4-myplan');
    if (!o.lang && !o.disc) {
      rec.diary = [];
      for (const tb of ['cal', 'tr', 'days']) { await go(a, 'diary'); await closeTips(a); if (await has(a, '[data-tab="' + tb + '"]')) await tap(a, '[data-tab="' + tb + '"]'); rec.diary.push(await look(a, w.who, tag, '5-diary-' + tb)); }
    }
    await a.page.clock.setSystemTime(at2(day, '21:45')); await go(a, 'home'); rec.night = await look(a, w.who, tag, '6-today-night');
    rec.rings = await rings(a); rec.rem = await remList(a);
    if (o.after) await o.after(a, rec);
    if (!o.lang && !o.disc) w.s = await stateOf(a);
  } catch (e) { flag(w.who, tag, 'walk', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); rec.crash = String(e.message).slice(0, 400); try { await a.page.screenshot({ path: path.join(SHOTS, w.who + '-' + tag + '-CRASH.png'), fullPage: true }); } catch (e2) { /* the page is gone */ } }
  finally { errsAll.push(...a.errs.map((e) => w.who + ' ' + tag + ': ' + e)); await a.ctx.close(); }
  return rec;
}

/* joining from a new install, to her plan's day 1 */
async function joinAndStart(w) {
  const rec = LOG[w.who].join = { screens: [] };
  const a = await open({ now: at2(TODAY, '10:00') });
  try {
    await join(a.page, Object.assign({ lang: 'en', name: w.name, stop: 'share' }, w.join, { onScreen: async (n) => { rec.screens.push(await look(a, w.who, 'join', '0' + rec.screens.length + '-' + n)); } }));
    await tap(a, '[data-ob-sh="me"]'); await signUp(a);
    rec.screens.push(await look(a, w.who, 'join', '10-your-sakhi'));
    if (await has(a, '#ys-skip')) await tap(a, '#ys-skip');
    await go(a, 'home'); await closeTips(a); rec.screens.push(await look(a, w.who, 'join', '11-today-first'));
    await go(a, 'diary'); await closeTips(a); rec.screens.push(await look(a, w.who, 'join', '12-first-log'));
    if (await has(a, '#fl-save')) { if (await has(a, '[data-fl-days="5"]')) await tap(a, '[data-fl-days="5"]'); if (await has(a, '[data-fl-sign="d_tired"]')) await tap(a, '[data-fl-sign="d_tired"]'); await tap(a, '#fl-save'); }
    else if (await has(a, '[data-fl-go]')) { await tap(a, '[data-fl-go]'); rec.screens.push(await look(a, w.who, 'join', '13-first-log-page')); }
    await go(a, 'home'); await closeTips(a); rec.offer = await look(a, w.who, 'join', '14-today-offer'); rec.offerSlot = await slotOf(a);
    if (await has(a, '#pl-m2-poi-ok')) { rec.poi = true; await tap(a, '#pl-m2-poi-ok'); await go(a, 'home'); await closeTips(a); rec.screens.push(await look(a, w.who, 'join', '14b-after-poi')); }
    rec.pref = w.pref || {};
    if (await has(a, '#pl-off-go')) await tap(a, '#pl-off-go');
    else if (await has(a, '#view section.slot [data-xp-off], #view section.slot [data-xp-plan]')) { rec.offerVia = 'the doctor finding\'s plan row'; await tap(a, '#view section.slot [data-xp-off], #view section.slot [data-xp-plan]'); }
    else { flag(w.who, 'join', 'today', 'no plan offer on Today after her first log; started from S.plan.offer'); await a.page.evaluate((g) => window.Saathi.plan.offer(g), w.goal); await settle(a.page, 600); }
    await startPlan(a, w.who, 'join', rec);
    await go(a, 'home'); await closeTips(a); rec.day1 = await look(a, w.who, 'join', '20-today-day1');
    w.s = await stateOf(a); w.acct = await acctOf(a); w.lived = TODAY;
  } catch (e) { flag(w.who, 'join', 'walk', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); rec.crash = String(e.message).slice(0, 400); try { await a.page.screenshot({ path: path.join(SHOTS, w.who + '-join-CRASH.png'), fullPage: true }); } catch (e2) { /* gone */ } }
  finally { errsAll.push(...a.errs.map((e) => w.who + ' join: ' + e)); await a.ctx.close(); }
}
/* a hand-off on a stop's evening page: what she sees, and the plan that starts after it */
async function handoff(a, w, tag, rec, fn) {
  rec.handoff = [];
  try { await fn(a, rec.handoff); } catch (e) { flag(w.who, tag, 'handoff', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); }
  await settle(a.page, 600); w.s = await stateOf(a);
}


/* the days between stops: she follows her plan on about 4 days a week (her skill, her walk, the day's food or strength), says
   how she slept, and gives her weekly number on the days in w.ms */
function live2(s, w, toDay) {
  const p = s.mods.plan; if (!p || !p.start) return s; p.log = p.log || {};
  const end = diff(p.start, toDay);
  for (let d = 0; d < end; d++) {
    const k = iso(p.start, d); if (k < (w.lived || '')) continue;
    const wd = d % 7; const pd = d + 1;
    if ([0, 1, 3, 5].indexOf(wd) >= 0 && !p.log[k]) { const ck = { skill: 'd', move: 'd' }; if ([0, 2, 5].indexOf(wd) >= 0) ck.ca = 'd'; if ([1, 4].indexOf(wd) >= 0) ck.str = 'd'; p.log[k] = { ci: 1, min: 20, ck: ck, slp: wd === 3 ? 'bad' : 'ok' }; }
    if (w.ms && w.ms[pd] != null) { p.log[k] = p.log[k] || { ci: 1 }; p.log[k].ms = w.ms[pd]; }
  }
  for (const pd of (w.periods || [])) { const st0 = iso(TODAY, pd - 1); if (st0 < toDay && st0 >= (w.lived || TODAY) && !(s.events || []).some((e) => e.d === st0)) { s.events = (s.events || []).concat([{ d: st0, t: 'start' }, { d: iso(st0, 4), t: 'end' }]); } }
  w.lived = toDay; return s;
}
/* Strong and steady: her balance routine, played */
const steadyPlay = (who, tag) => async (a, rec) => { rec.play = [];
  await go(a, 'plan-r-steady'); rec.play.push(await look(a, who, tag, '1c-steady-intro'));
  if (await has(a, '#pl-pstart')) { await tap(a, '#pl-pstart'); await settle(a.page, 1200); rec.play.push(await look(a, who, tag, '1d-steady-move1')); await settle(a.page, 31000); rec.play.push(await look(a, who, tag, '1e-steady-31s')); await settle(a.page, 31000); rec.play.push(await look(a, who, tag, '1f-steady-62s')); await settle(a.page, 60000); rec.play.push(await look(a, who, tag, '1g-steady-2min')); }
  await go(a, 'home'); };
const endPage = (who, tag) => async (a, rec) => { await go(a, 'plan-end'); rec.end = await look(a, who, tag, '7-plan-end'); };
const yearRead = (who, tag) => async (a, rec) => { rec.extra = [];
  await a.page.clock.setSystemTime(at2(rec.day, '11:00')); await go(a, 'home'); await closeTips(a);
  if (await has(a, '[data-mid-art]')) { rec.extra.push({ where: 'the month row', text: await a.page.$eval('[data-mid-art]', (b) => b.innerText.replace(/\s+/g, ' ')) }); await a.page.$eval('[data-mid-art]', (b) => b.click()); await settle(a.page, 800); rec.extra.push(await look(a, who, tag, '7-month-read')); await go(a, 'home'); rec.extra.push(await look(a, who, tag, '7b-today-after-read')); }
  else flag(who, tag, 'today', 'no month read row in her year'); };
async function stageTo(a, pick, o = {}) {
  await go(a, 'home'); await closeTips(a);
  if (!(await has(a, '#stage-btn'))) return 'no Change stage on Today';
  await tap(a, '#stage-btn'); await tap(a, '#sheet-root [data-stage="' + pick + '"]');
  if (o.end) await tap(a, '#sheet-root [data-st-end="' + o.end + '"]');
  await tap(a, '#st-save'); await settle(a.page, 900);
  const left = await a.page.evaluate(() => { const r = document.querySelector('#sheet-root'); return r && r.innerText.trim() ? r.innerText.replace(/\s+/g, ' ').slice(0, 300) : ''; });
  await go(a, 'home'); await closeTips(a); return left ? 'sheet still open: ' + left : '';
}
const toStopped = (who, tag) => async (a, rec) => { rec.extra = []; const r = await stageTo(a, 'meno'); if (r) flag(who, tag, 'stage', r);
  rec.extra.push(await look(a, who, tag, '7-today-stopped')); rec.extra.push({ where: 'steps after', text: JSON.stringify(await steps(a)) }); rec.extra.push({ where: 'slot after', text: JSON.stringify(await slotOf(a)) });
  await go(a, 'plan'); rec.extra.push(await look(a, who, tag, '7b-myplan-stopped')); const p = ((await stateOf(a)).mods || {}).plan || {}; rec.extra.push({ where: 'plan', text: JSON.stringify({ pack: p.pack, pv: p.pv, goal: p.goalKey, start: p.start, go: p.go, sit: (await stateOf(a)).situation }) }); };
const heartOk = (who, tag) => async (a, rec) => { rec.extra = []; await go(a, 'plan'); rec.extra.push(await look(a, who, tag, '7-myplan-heart'));
  if (await has(a, '[data-m2="heart-ok"]')) { await tap(a, '[data-m2="heart-ok"]'); await go(a, 'home'); rec.extra.push(await look(a, who, tag, '7b-today-heart-ok')); rec.extra.push({ where: 'steps after', text: JSON.stringify(await steps(a)) }); }
  else flag(who, tag, 'myplan', 'no "My doctor says I can do more"'); };

const WOMEN = [
  { who: 'kavita-hot', name: 'Kavita', goal: 'hot', pref: { when: 'evening' }, join: { tile: 'meno', dec: 1970, y: 1975, goals: ['hot', 'sleep'], mp: '1', care: 'private' },
    ms: { 14: 7, 21: 6, 28: 6, 35: 5, 42: 5, 49: 5, 56: 4, 63: 4, 70: 4, 77: 4, 84: 3 },
    stops: [['d1', 1, { steps: true }], ['d2', 2, { only: 'evening' }], ['d7', 7, { ms: 7 }], ['d8', 8], ['d22', 22, { steps: true }], ['d29', 29, { steps: true }], ['d57', 57, { steps: true, at10: steadyPlay('kavita-hot', 'd57') }],
      ['d78', 78], ['d85', 85, { after: endPage('kavita-hot', 'd85') }], ['d95', 95, { after: yearRead('kavita-hot', 'd95') }]] },
  { who: 'sunita-mid', name: 'Sunita', goal: 'sleep', pref: { when: 'morning' }, join: { tile: 'mid', dec: 1980, y: 1982, goals: ['sleep'], dates: [ago(95), ago(58), ago(25)], dlen: 6, care: 'govt' }, periods: [10, 44],
    stops: [['d1', 1, { steps: true }], ['d8', 8], ['d29', 29, { steps: true, after: toStopped('sunita-mid', 'd29') }], ['d36', 36]] },
  { who: 'asha-aches', name: 'Asha', goal: 'aches', hrt: true, pref: { when: 'evening', mheart: 'y', mbone: 'y' }, join: { tile: 'meno', dec: 1970, y: 1979, goals: ['aches'], mp: '1', care: 'private' },
    stops: [['d1', 1, { steps: true }], ['d2', 2, { steps: true }], ['d22', 22, { after: heartOk('asha-aches', 'd22') }], ['d23', 23]] },
  { who: 'meera-poi', name: 'Meera', goal: 'hot', pref: { when: 'evening' }, join: { tile: 'meno', dec: 1980, y: 1989, goals: ['hot'], mp: '1', care: 'private' },
    stops: [['d1', 1]] }
];

/* Vera: on version 1 since 40 days ago (her plan saved before this build), offered version 2 */
async function vera() {
  LOG.vera = {}; const rec = LOG.vera.v1 = { day: TODAY };
  const plan = { pack: 'meno', goalKey: 'hot', pv: 1, start: ago(40), started: ago(40), go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', remAt: '20:00', when: 'evening', log: {}, weeks: {}, intake: { goal: 'hot', stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [] } };
  for (let d = 1; d <= 40; d++) if (d % 2) plan.log[ago(d)] = { ci: 1, min: 15, ck: { hot: 'd', move: 'd' } };
  const s = { lang: 'en', langChosen: true, stage: 'app', dob: '1974-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: [{ d: ago(500), t: 'start' }], daily: {}, notes: {}, checkins: {},
    tours: {}, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', joined: ago(300), prompts: { setup: 'off', planCall: ago(30), firstLog: ago(200) }, mods: { plan: plan }, reminders: [{ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(40), until: iso(ago(40), 83), every: 1, time: '20:00', on: true, doneOn: null }], settings: { toursAuto: false, notify: true } };
  const a = await open({ state: s, acct: { token: 't', id: 't', phone: '+919876543210', name: 'Vera', pincode: '302001', activeOn: TODAY }, now: at2(TODAY, '10:00') });
  try {
    await closeTips(a); rec.steps = await steps(a); rec.slot = await slotOf(a); rec.today = await look(a, 'vera', 'v1', '1-today-v1');
    if (await has(a, '[data-m2="mpv2-yes"]')) { await tap(a, '[data-m2="mpv2-yes"]'); await go(a, 'home'); await closeTips(a); rec.after = await look(a, 'vera', 'v1', '2-today-v2'); rec.stepsAfter = await steps(a); rec.slotAfter = await slotOf(a);
      await go(a, 'plan'); rec.myplan = await look(a, 'vera', 'v1', '3-myplan-v2'); const p = ((await stateOf(a)).mods || {}).plan || {}; rec.extra = [{ where: 'plan', text: JSON.stringify({ pv: p.pv, start: p.start, goal: p.goalKey }) }, { where: 'steps after', text: JSON.stringify(rec.stepsAfter) }, { where: 'slot after', text: JSON.stringify(rec.slotAfter) }];
      await a.page.clock.setSystemTime(at2(TODAY, '21:00')); await go(a, 'plan-checkin'); rec.checkin = await look(a, 'vera', 'v1', '4-checkin-v2'); }
    else flag('vera', 'v1', 'today', 'no offer of the new version');
  } catch (e) { flag('vera', 'v1', 'walk', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); }
  finally { errsAll.push(...a.errs.map((e) => 'vera: ' + e)); await a.ctx.close(); }
}

for (const w of WOMEN) {
  if (ONLY && w.who.indexOf(ONLY) < 0) continue;
  LOG[w.who] = {}; console.log('== ' + w.who);
  await joinAndStart(w); if (!w.s) { console.log('  joining stopped'); continue; }
  if (w.hrt) w.s.situation = Object.assign({}, w.s.situation, { hormones: true });   /* Me: "I take hormone medicine" */
  for (const [tag, pday, o] of w.stops) {
    const day = iso(w.s.mods.plan && w.s.mods.plan.start ? w.s.mods.plan.start : TODAY, pday - 1);
    live2(w.s, w, day);
    await stop(w, tag, day, o || {});
    const r = LOG[w.who][tag] || {}; r.who = w.who; r.tag = tag;
    console.log('  ' + tag + ' ' + day + ': ' + (r.steps || []).map((x) => x.id).join(', ') + ' | slot ' + ((r.slot || {}).n || 0) + (r.msCard ? ' | weekly number' : '') + (r.slpCard ? ' | sleep card' : ''));
    if (tag === 'd8') { await stop(w, tag + '-hi', day, { lang: 'hi', only: 'evening' }); await stop(w, tag + '-disc', day, { disc: true, only: 'evening' }); }
  }
}
if (!ONLY || 'vera'.indexOf(ONLY) >= 0) await vera();
await browser.close();
fs.writeFileSync(path.join(SHOTS, 'walk.json'), JSON.stringify({ flags, errors: errsAll, log: LOG }, null, 1));
/* a readable copy, one file per woman */
for (const who of Object.keys(LOG)) {
  const out = [];
  for (const [tag, r] of Object.entries(LOG[who])) {
    out.push('\n######## ' + who + ' ' + tag + (r.day ? ' ' + r.day : '') + (r.lang && r.lang !== 'en' ? ' (' + r.lang + ')' : '') + (r.disc ? ' (shared phone)' : ''));
    if (r.crash) out.push('CRASH: ' + r.crash);
    if (r.startTaps != null) out.push('start taps: ' + r.startTaps + ' · started: ' + JSON.stringify(r.started));
    if (r.sheet) out.push('SHEET ON OPEN: ' + r.sheet);
    if (r.steps) out.push('STEPS: ' + r.steps.map((x) => x.id + ' "' + x.title + '" (' + x.sub + ')' + (x.go ? ' → ' + x.go : '')).join(' | '));
    if (r.slot) out.push('SAKHI SAYS (' + r.slot.n + '): ' + r.slot.first + (r.slot.more && r.slot.more.length ? ' || MORE: ' + r.slot.more.join(' | ') : ''));
    for (const k of ['screens', 'start', 'stepPages', 'play', 'diary', 'handoff', 'extra']) for (const x of (r[k] || [])) out.push('--- ' + k + ' ' + (x.id || x.where) + ' ' + (x.hash || '') + '\n' + x.text);
    if (r.msCard != null) out.push('WEEKLY NUMBER CARD: ' + r.msCard + ' · SLEEP CARD: ' + r.slpCard);
    for (const k of ['offer', 'day1', 'today', 'ticked', 'evening', 'checkin', 'after', 'afterHome', 'myplan', 'night', 'end']) if (r[k]) out.push('--- ' + k + ' ' + (r[k].hash || '') + '\n' + r[k].text);
    if (r.rem) out.push('REMINDERS: ' + r.rem.join(' | '));
    if (r.rings) out.push('RINGS (36 h): ' + r.rings.join(' | '));
  }
  fs.writeFileSync(path.join(SHOTS, who + '.txt'), out.join('\n'));
}
console.log('FLAGS (' + flags.length + ')\n' + flags.join('\n')); console.log('ERRORS ' + errsAll.length + (errsAll.length ? '\n' + errsAll.slice(0, 30).join('\n') : ''));
