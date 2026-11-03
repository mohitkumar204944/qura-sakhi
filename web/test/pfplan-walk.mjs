// My pelvic floor plan (Version 39.56), lived through (Mohit, 2 Nov: "proceed building"). Each woman joins Sakhi from a new
// install on his Flip5's 360 x 800 screen, the way she would, then lives her plan, doing her sets on about 4 days a week. At each
// stop: Today, a set from the play button on some days, a tick, her evening (the check-in), what she sees after it, My plan, the
// Diary, Today at night, and what rings on the phone.
//   - Asha, 38, stress leaks: days 1, 2, 4, 8 (also in Hindi and on a shared phone), 15, 22 (week 4), 29, 43, 57, 78 (week 12),
//     85 (the end) and 92 (still leaking?).
//   - Kamla, 53, periods stopped, urge leaks, hot flushes as her second goal: days 1, 4, 15, 29 (less tea and coffee) and 85.
//   - Sunita, 48, periods changing, heaviness: days 1, 2, 9 (after "Get checked once": a prolapse), 22, 57, 85 and 92 (week 14).
//   - Rani, 33, pain when she squeezes: days 1, 3 and 10.
//   - Priya, 29, period pain first and the pelvic floor second: My period plan with her sets joined, days 1, 5 and 8.
// Not pass/fail: the screens, each screen's words and the reminders go to test/shots/pfplan-walk/ (gitignored), with flags for
// page errors, string keys, sideways scroll, an empty view, blank placeholders, a line said twice on one screen, too many steps,
// and the plan's own rules (its title on Today, the chapter row, no pelvic words on a shared phone).
// Usage: node test/pfplan-walk.mjs [only]   (only: asha | kamla | sunita | rani | priya)
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
const SHOTS = path.join(here, 'shots', 'pfplan-walk'); fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-30';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const diff = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);
const at2 = (day, hm) => new Date(day + 'T' + hm + ':00+05:30');
const LOCAL = { app: '0.39.56-pilot', platform: 'android' };   /* no server address: the stand-in server (code 123456) */
const BRIDGE = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const KEYS = /\b(plan|preg|pregtools|ttc|food|post|pst|ci|hs|fx|rv|pg|pf|mcp|ob|ys|fl|td|tour|qa|late|bb|st|slot|today|dy|cal|mid|meno|m2|per|pt|px)_[a-z0-9_]{2,}\b/;
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
    if ((await has(a, '[data-pl-pfs]')) && ((rec.pref || {}).pfs || []).length && !(await has(a, '[data-pl-pfs]:checked'))) { for (const k of rec.pref.pfs) { taps++; await a.page.$eval('[data-pl-pfs="' + k + '"]', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }); await settle(a.page, 300); } }
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
    rec.pf = await a.page.evaluate(() => { const S = window.Saathi; const v = (document.querySelector('#view') || {}).innerText || ''; const P = S.plan.pelvic; const id = P && P.lesson ? P.lesson() : null;
      return { on: !!(P && P.on()), les: id, lesRead: !!(id && S.pfplan && S.pfplan.lesson.read(id)), row: !!document.querySelector('#view [data-pf-les]'), rev: !!document.querySelector('#view #pl-rev-open'), open: /\d+ of \d+ done today/.test(v),
        title: /my pelvic floor plan/i.test(v), lv: P && P.on() && P.level ? P.level() : null, target: P && P.on() && P.target ? P.target() : null, words: (v.split(/Sakhi says|SAKHI SAYS/)[0] || '') }; });
    { const c = rec.pf; const n = rec.steps.length;
      if (w.lead === 'pelvic' && n > 3) flag(w.who, tag, 'today', n + ' steps (3 at most)'); if (w.lead === 'pelvic' && tag === 'd1' && n > 2) flag(w.who, tag, 'today', n + ' steps on day 1 (2 at most)');
      if (w.lead === 'pelvic' && c.les && !c.lesRead && !c.row && !c.rev && c.open && !o.disc) flag(w.who, tag, 'today', 'no chapter row for ' + c.les + ' (and no look-back row in its place)');
      if (w.lead === 'pelvic' && !o.disc && !o.lang && !c.title) flag(w.who, tag, 'today', 'no "My pelvic floor plan" on Today');
      if (o.disc && /leak|bladder|urine|squeez|pelvic|prolapse/i.test(c.words)) flag(w.who, tag, 'today', 'pelvic words on a shared phone: ' + (c.words.match(/.{0,40}(leak|bladder|urine|squeez|pelvic|prolapse).{0,40}/i) || [''])[0].replace(/\s+/g, ' '));
      if (w.lead !== 'pelvic' && !c.on) flag(w.who, tag, 'today', 'her sets did not join her plan'); }
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
      await answerOpen(a, '#view [data-ci-pf]', { pfs: 'y', pfw: '1', pfc: 'b', pfwhen: 'stress' });
      { const c = rec.cyc || {}; const v0 = (rec.checkin || {}).text || ''; const ls = await a.page.evaluate(() => { const S = window.Saathi; const s = (S.state.events || []).filter((e) => e.t === 'start').map((e) => e.d).sort().pop(); return s ? Math.round((S.today() - S.fromISO(s)) / 864e5) : null; });
        if (c.pv === 2 && c.bleed && (c.lead === 'heavy' || c.goals.indexOf('heavy') >= 0) && !/Your period today/i.test(v0) && !o.disc && !o.lang) flag(w.who, tag, 'checkin', 'a period evening with heavy periods hers, and no "Your period today"');
        if (c.pv === 2 && c.bleed && ls != null && ls <= 4 && (c.lead === 'pain' || c.goals.indexOf('pain') >= 0) && !/Pain today\\?/.test(v0) && !o.disc && !o.lang) flag(w.who, tag, 'checkin', 'a period evening with pain hers, and no "Pain today?"');
        if (!c.bleed && /Your period today/i.test(v0)) flag(w.who, tag, 'checkin', '"Your period today" on a day she isn’t bleeding'); }
      if (await has(a, '[data-pl-pain]')) await tap(a, '[data-pl-pain="pain_2"]');
      await answerOpen(a, '#view [data-ci-pt], #view [data-ci-px]');
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
    else if (await has(a, '#view [data-xp-off], #view [data-xp-plan]')) { rec.offerVia = 'the doctor finding\'s plan row'; await tap(a, '#view [data-xp-off], #view [data-xp-plan]'); }
    else { flag(w.who, 'join', 'today', 'no plan offer on Today after her first log; started from S.plan.offer'); await a.page.evaluate((g) => window.Saathi.plan.offer(g), w.goal); await settle(a.page, 600); }
    await startPlan(a, w.who, 'join', rec);
    await go(a, 'home'); await closeTips(a); rec.day1 = await look(a, w.who, 'join', '20-today-day1');
    w.s = await stateOf(a); w.acct = await acctOf(a); w.lived = TODAY;
  } catch (e) { flag(w.who, 'join', 'walk', 'stopped: ' + String(e.message).split('\n')[0].slice(0, 200)); rec.crash = String(e.message).slice(0, 400); try { await a.page.screenshot({ path: path.join(SHOTS, w.who + '-join-CRASH.png'), fullPage: true }); } catch (e2) { /* gone */ } }
  finally { errsAll.push(...a.errs.map((e) => w.who + ' join: ' + e)); await a.ctx.close(); }
}

/* the days between stops: she does her sets on about 4 days a week (3 sets, 2 on the 6th day of her week), ticks her other steps
   on those days, and answers her week's questions: leaks some at first and never from week 9, not sure of the squeeze in week 1 */
function live3(s, w, toDay) {
  const p = s.mods.plan; if (!p || !p.start) return s; p.log = p.log || {}; s.mods.post = s.mods.post || {}; const pf = s.mods.post.pf = s.mods.post.pf || {};
  const end = diff(p.start, toDay);
  for (let d = 0; d < end; d++) {
    const k = iso(p.start, d); if (k < (w.lived || '')) continue; const wd = d % 7; const wk = Math.floor(d / 7) + 1;
    if ([0, 1, 3, 5].indexOf(wd) >= 0) { if (!p.log[k]) p.log[k] = { ci: 1, ck: { find: 'd', habit: 'd', urge: 'd' } }; if (!pf[k]) pf[k] = wd === 5 ? 2 : 3; }
    if (wd === 0 && p.log[k] && w.lead === 'pelvic') { p.log[k].lk = wk <= 8 ? (wk <= 2 ? 'most' : 'some') : 'never'; if (wk === 1) p.log[k].pfs = 'ns'; if (wk === 4) { p.log[k].pfs = 'y'; p.log[k].pfw = 2; } if (wk === 8) p.log[k].pfw = 1; }
  }
  for (const pd of (w.periods || [])) { const st0 = iso(p.start, pd - 1); if (st0 < toDay && st0 >= (w.lived || p.start) && !(s.events || []).some((e) => e.d === st0)) s.events = (s.events || []).concat([{ d: st0, t: 'start' }, { d: iso(st0, 4), t: 'end' }]); }
  if (w.docOn && toDay > iso(p.start, w.docOn - 1) && !p.pfDoc) { const k = iso(p.start, w.docOn - 1); p.log[k] = Object.assign(p.log[k] || { ci: 1 }, { ck: Object.assign({}, (p.log[k] || {}).ck, { checked: 'd' }) }); }
  w.lived = toDay; return s;
}
const endPage = (who, tag) => async (a, rec) => { await go(a, 'plan-end'); rec.end = await look(a, who, tag, '7-plan-end'); };
const progress = (who, tag) => async (a, rec) => { await go(a, 'plan-progress'); rec.end = await look(a, who, tag, '7-my-progress'); };
/* a set from Today's play button, to its end */
const doSet = (who, tag) => async (a, rec) => {
  /* the play button on her squeeze sets' own row (another step's may come first) */
  const ok = await a.page.evaluate(() => { const b = [...document.querySelectorAll('#view [data-today-nav]')].find((x) => /squeeze sets|Your 2 minutes/i.test(((x.closest('[data-today-row], .today-item, .item, li') || x.parentElement || {}).textContent) || '')); if (b) { b.setAttribute('data-pf-play', '1'); return true; } return false; });
  if (!ok) { flag(who, tag, 'set', 'no play button on her squeeze sets'); return; }
  await tap(a, '[data-pf-play]');
  if (await has(a, '#pst-jsafe-ok')) { rec.jsafe = await look(a, who, tag, '1c0-safety'); await tap(a, '#pst-jsafe-ok'); await tap(a, '#pst-pstart'); }   /* her joined sets' safety signs, once */
  rec.set = await look(a, who, tag, '1c-set-running');
  for (let i = 0; i < 400 && await has(a, '#pst-pph'); i++) { await a.page.clock.runFor(1000); await sleep(5); }
  await settle(a.page, 400); rec.setDone = await look(a, who, tag, '1d-set-done'); await go(a, 'home'); };
/* the doctor card after "Get checked once": "A prolapse, and exercises can help" */
const docPop = (who, tag) => async (a, rec) => { await go(a, 'home'); if (await has(a, '[data-pf="doc-pop"]')) { rec.doc = await look(a, who, tag, '1e-doctor-card'); await tap(a, '[data-pf="doc-pop"]'); rec.docAfter = await look(a, who, tag, '1f-after-doctor'); } else flag(who, tag, 'today', 'no "What did the doctor say?" after Get checked once'); };

const WOMEN = [
  { who: 'asha-stress', name: 'Asha', lead: 'pelvic', pref: { pft: 'stress', pfway: '2' }, join: { tile: 'cycle', dec: 1980, y: 1988, goals: ['pelvic'], dates: [ago(80), ago(52), ago(24)], dlen: 5, care: 'private' },
    periods: [5, 33, 61, 89],
    stops: [['d1', 1, { steps: true, at10: doSet('asha-stress', 'd1') }], ['d2', 2, { only: 'evening' }], ['d4', 4], ['d8', 8, { steps: true }], ['d15', 15, { at10: doSet('asha-stress', 'd15') }], ['d22', 22], ['d29', 29, { steps: true }], ['d43', 43],
      ['d57', 57, { steps: true, at10: doSet('asha-stress', 'd57') }], ['d78', 78], ['d85', 85, { after: endPage('asha-stress', 'd85') }], ['d92', 92, { after: progress('asha-stress', 'd92') }]] },
  { who: 'kamla-urge', name: 'Kamla', lead: 'pelvic', pref: { pft: 'urge', pfway: '3' }, join: { tile: 'meno', dec: 1970, y: 1973, goals: ['pelvic', 'hot'], mp: '2', care: 'govt' },
    stops: [['d1', 1, { steps: true }], ['d4', 4, { steps: true }], ['d15', 15], ['d29', 29, { steps: true }], ['d85', 85, { after: progress('kamla-urge', 'd85') }]] },
  { who: 'sunita-heavy', name: 'Sunita', lead: 'pelvic', pref: { pft: 'heavy', pfway: '1' }, join: { tile: 'mid', dec: 1970, y: 1978, goals: ['pelvic'], dates: [ago(90), ago(58), ago(30)], dlen: 6, care: 'private' },
    periods: [3, 35, 67], docOn: 8,
    stops: [['d1', 1, { steps: true }], ['d2', 2, { steps: true }], ['d9', 9, { at10: docPop('sunita-heavy', 'd9') }], ['d22', 22], ['d57', 57], ['d85', 85], ['d92', 92, { steps: true }]] },
  { who: 'rani-pain', name: 'Rani', lead: 'pelvic', pref: { pft: 'stress', pfs: ['pain'] }, join: { tile: 'cycle', dec: 1990, y: 1993, goals: ['pelvic'], dates: [ago(70), ago(42), ago(14)], dlen: 5, care: 'private' },
    periods: [15, 43],
    stops: [['d1', 1, { steps: true }], ['d3', 3], ['d10', 10]] },
  { who: 'priya-joined', name: 'Priya', lead: 'pain', pref: {}, join: { tile: 'cycle', dec: 1990, y: 1997, goals: ['pain', 'pelvic'], dates: [ago(80), ago(52), ago(24)], dlen: 5, pain: true, care: 'private' },
    periods: [5, 33],
    stops: [['d1', 1, { steps: true }], ['d5', 5, { steps: true }], ['d8', 8, { at10: doSet('priya-joined', 'd8') }]] }
];

for (const w of WOMEN) {
  if (ONLY && w.who.indexOf(ONLY) < 0) continue;
  LOG[w.who] = {}; console.log('== ' + w.who);
  await joinAndStart(w); if (!w.s) { console.log('  joining stopped'); continue; }
  const st = (w.s.mods || {}).plan || {}; console.log('  started: ' + st.pack + ' v' + st.pv + ' (' + st.goalKey + ') on ' + st.start);
  const want = w.lead === 'pelvic' ? 'pelvic' : 'pain'; if (st.pack !== want) flag(w.who, 'join', 'plan', 'started ' + st.pack + ' v' + st.pv + ', not ' + want);
  for (const [tag, pday, o] of w.stops) {
    const day = iso(w.s.mods.plan && w.s.mods.plan.start ? w.s.mods.plan.start : TODAY, pday - 1);
    live3(w.s, w, day);
    await stop(w, tag, day, o || {});
    const r = LOG[w.who][tag] || {}; r.who = w.who; r.tag = tag;
    console.log('  ' + tag + ' ' + day + ': ' + (r.steps || []).map((x) => x.id).join(', ') + ' | slot ' + ((r.slot || {}).n || 0) + (r.pf && r.pf.lv ? ' | level ' + r.pf.lv.n + ' ' + r.pf.lv.pos + ' · ' + r.pf.target + ' sets' : '') + (r.pf && r.pf.les ? ' · ' + r.pf.les : ''));
    if (tag === 'd8' && w.who === 'asha-stress') { await stop(w, tag + '-hi', day, { lang: 'hi', only: 'evening' }); await stop(w, tag + '-disc', day, { disc: true, only: 'evening' }); }
  }
}
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
    if (r.pf) out.push('PLAN: ' + JSON.stringify({ lv: r.pf.lv, target: r.pf.target, les: r.pf.les, read: r.pf.lesRead }));
    for (const k of ['screens', 'start', 'stepPages']) for (const x of (r[k] || [])) out.push('--- ' + k + ' ' + (x.id || x.where) + ' ' + (x.hash || '') + '\n' + x.text);
    for (const k of ['offer', 'day1', 'today', 'jsafe', 'set', 'setDone', 'doc', 'docAfter', 'ticked', 'evening', 'checkin', 'after', 'afterHome', 'myplan', 'night', 'end']) if (r[k]) out.push('--- ' + k + ' ' + (r[k].hash || '') + '\n' + r[k].text);
    if (r.rem) out.push('REMINDERS: ' + r.rem.join(' | '));
    if (r.rings) out.push('RINGS (36 h): ' + r.rings.join(' | '));
  }
  fs.writeFileSync(path.join(SHOTS, who + '.txt'), out.join('\n'));
}
console.log('FLAGS (' + flags.length + ')\n' + flags.join('\n')); console.log('ERRORS ' + errsAll.length + (errsAll.length ? '\n' + errsAll.slice(0, 30).join('\n') : ''));
