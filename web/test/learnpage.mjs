// Version 39.85: articles in a better format (docs/teach-and-show-advice-2026-11-08.md, part 3, L7; MODULE_API section 128).
// Mohit, 8 Nov: "you proceed as per your recommendations". This file checks:
//   1 every article opens with "In short": its own summary, once, in a box under the title;
//   2 "Checked by doctors · {month}" on exactly the articles with a doctors' check on record (content.json `reviewed`), and on
//     none other; a changed word (or doctor-route paragraph) takes it away, a changed source list doesn't; a bad month shows
//     nothing; the app and web/tools/stamp-reviewed.mjs work out the same fingerprint over the same fields;
//   3 the drawings: under the paragraph they show, labelled with that paragraph's own sentence (English and Hindi), skipped by
//     Listen, on 4 articles only;
//   4 the box reads in light and dark (4.5:1), Hindi at 360 px, and no page errors.
// Usage: node test/learnpage.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const C = JSON.parse(CONTENT);
const TOOL = await import(pathToFileURL(path.join(root, 'tools', 'stamp-reviewed.mjs')).href);
const SHOTS = path.join(here, 'shots', 'learnpage'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-08';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', focus: { tile: 'cycle', goals: [], at: ago(30) }, prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const arts = C.groups.flatMap((g) => g.articles.map((a) => [g.group + '.' + a.id, a]));
const artOf = (k) => arts.find((x) => x[0] === k)[1];
/* the summary she sees: this seed is on the doctor route (her own doctor, the default), so an article's doctor-route summary wins */
const sumOf = (a, lang) => (a.doc && typeof a.doc['summary_' + lang] === 'string' ? a.doc['summary_' + lang] : a['summary_' + lang]);
const sent = (a, lang, para, i) => (a['body_' + lang][para].split(/(?<=[.?!।])\s+/)[i] || '').replace(/^(Yes, |हाँ, )/, '').replace(/^[a-z]/, (c) => c.toUpperCase());

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', colorScheme: o.dark ? 'dark' : 'light' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + (o.content || CONTENT) + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.85-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(TODAY + 'T10:00:00+05:30') });
  await page.goto(PAGE + (o.hash || '#learn'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 500) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 300); };
const done = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
/* what an article page shows */
const pageOf = (page) => page.evaluate(() => {
  const v = document.querySelector('#view'); const box = v.querySelector('.article .in-short'); const rv = v.querySelector('.article .rv-line');
  return { h1: (v.querySelector('.article h1') || {}).textContent || '', eyebrow: box ? (box.querySelector('.eyebrow') || {}).textContent || '' : '', lead: box ? (box.querySelector('.lead') || {}).textContent || '' : '',
    leads: v.querySelectorAll('.article .lead').length, text: v.innerText, rv: rv ? rv.textContent : '', rvByline: !!(rv && box && rv.nextElementSibling === box && rv.previousElementSibling && rv.previousElementSibling.tagName === 'H1'),
    pics: Array.from(v.querySelectorAll('.article .art-pic')).map((p) => ({ inBody: !!p.closest('.bodytext'), noread: p.getAttribute('data-noread') === '1', prev: p.previousElementSibling ? p.previousElementSibling.textContent : '',
      labels: Array.from(p.querySelectorAll('svg[role="img"]')).map((s) => s.getAttribute('aria-label')) })) };
});

/* ---------- 1 and 2. every article, English: "In short" once, and the doctors' line exactly where a check is on record ---------- */
{
  const stamped = arts.filter(([, a]) => TOOL.stateOf(a) === 'ok').map(([k]) => k);
  const stale = arts.filter(([, a]) => TOOL.stateOf(a) === 'changed').map(([k]) => k);
  if (stale.length) console.log('NOTE: ' + stale.length + ' stamped article(s) changed since the doctors checked them, so they show no line until checked and stamped again: ' + stale.join(', '));
  check('2 content.json: the doctors\' check is on record (all 60 since their read of 8 Nov; an article changed since loses its line until it is checked again)', stamped.length >= 10, stamped.length);
  const a = await open({ name: '1 all articles' });
  const bad = { box: [], once: [], rv: [], noRv: [] }; let shown = 0;
  for (const [k, art] of arts) {
    await go(a.page, 'a-' + k); const p = await pageOf(a.page);
    if (!p.h1) continue; shown++;
    if (p.eyebrow !== 'In short' || p.lead !== sumOf(art, 'en')) bad.box.push(k);
    if (p.leads !== 1 || p.text.split(sumOf(art, 'en')).length !== 2) bad.once.push(k);
    const want = stamped.indexOf(k) >= 0;
    if (want && !(/^Checked by doctors · \w{3} \d{4}$/.test(p.rv) && p.rvByline)) bad.rv.push(k + ': ' + p.rv);
    if (!want && p.rv) bad.noRv.push(k);
  }
  check('1 every article that opens (' + shown + ') has "In short" with its own summary under the title', shown >= 50 && !bad.box.length, bad.box);
  check('1 ... said once on the page (no second summary)', !bad.once.length, bad.once);
  check('2 "Checked by doctors · {month}" under the title, above "In short", on each article with a check on record', !bad.rv.length, bad.rv);
  check('2 ... and on no other article', !bad.noRv.length, bad.noRv);
  await go(a.page, 'a-cycle.what-is-a-menstrual-cycle');
  const at0 = (artOf('cycle.what-is-a-menstrual-cycle').reviewed || {}).at || ''; const mon = at0 ? new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(+at0.slice(0, 4), +at0.slice(5) - 1, 1)) : '?';
  check('2 the line names the month of the check on record ("' + mon + '")', (await pageOf(a.page)).rv === 'Checked by doctors · ' + mon, (await pageOf(a.page)).rv);
  await shot(a.page, '1-cycle-en');
  await done(a);
}

/* ---------- 2. the fingerprint: the same in the app and the tool; a changed word takes the line away ---------- */
{
  const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const m = src.match(/const RV_FIELDS = (\[[^\]]*\]);/); const appFields = m ? JSON.parse(m[1].replace(/'/g, '"')) : null;
  check('2 the app and the stamp tool fingerprint the same fields (every field she reads; not the sources)', JSON.stringify(appFields) === JSON.stringify(TOOL.RV_FIELDS) && TOOL.RV_FIELDS.indexOf('sources') < 0 && ['title_en', 'title_hi', 'summary_en', 'summary_hi', 'body_en', 'body_hi', 'see_doctor_en', 'see_doctor_hi', 'qura_line_en', 'qura_line_hi', 'doc'].every((f) => TOOL.RV_FIELDS.indexOf(f) >= 0), appFields);
  const K = 'cycle.usual-gap-between-periods'; const [G, ID] = K.split('.');
  const variant = (fn) => { const c = JSON.parse(CONTENT); const a0 = c.groups.find((g) => g.group === G).articles.find((x) => x.id === ID); fn(a0); return JSON.stringify(c); };
  const cases = [
    ['a word changed in the English body', (x) => { x.body_en[0] = x.body_en[0] + ' Really.'; }, false],
    ['a word changed in the Hindi summary', (x) => { x.summary_hi = x.summary_hi + ' '; }, false],
    ['a doctor-route paragraph added', (x) => { x.doc = Object.assign({}, x.doc || {}, { body_en: { 0: 'Changed.' } }); }, false],
    ['a "see a doctor" line changed', (x) => { x.see_doctor_en = (x.see_doctor_en || []).concat('One more line.'); }, false],
    ['only its sources changed', (x) => { x.sources = (x.sources || []).concat('A new source'); }, true],
    ['a month that does not exist (2026-13)', (x) => { x.reviewed = { at: '2026-13', h: x.reviewed.h }; }, false],
  ];
  check('2 the case article is stamped to start with', TOOL.stateOf(artOf(K)) === 'ok');
  for (const [name, fn, keep] of cases) {
    const a = await open({ name: '2 ' + name, content: variant(fn), hash: '#a-' + K });
    const p = await pageOf(a.page);
    check('2 ' + name + (keep ? ': the line stays' : ': the line goes'), !!p.h1 && (keep ? !!p.rv : !p.rv), p.rv);
    await done(a);
  }
}

/* ---------- 3. the drawings, English and Hindi ---------- */
const PICS = { 'cycle.what-is-a-menstrual-cycle': [1, [[1, 1], [1, 2], [1, 3]]], 'pmos.what-pmos-is': [1, [[1, 0]]], 'cycle.why-cycles-become-irregular': [9, [[9, 2]]], 'cycle.painful-periods': [1, [[1, 1]]] };
for (const lang of ['en', 'hi']) {
  const a = await open({ name: '3 drawings ' + lang, seed: { lang: lang } });
  for (const [k, [para, sents]] of Object.entries(PICS)) {
    const art = artOf(k); await go(a.page, 'a-' + k); const p = await pageOf(a.page);
    const want = sents.map(([pi, si]) => sent(art, lang, pi, si));
    const ok = p.pics.length === 1 && p.pics[0].inBody && p.pics[0].noread && JSON.stringify(p.pics[0].labels) === JSON.stringify(want) && want.every((s) => s.length > 10 && p.pics[0].prev.indexOf(s.slice(1)) >= 0) && p.pics[0].prev === art['body_' + lang][para].replace(/^- /, '');
    check('3 ' + lang + ' ' + k + ': its drawing sits under the paragraph it shows, labelled with that paragraph\'s sentence' + (want.length > 1 ? 's' : '') + ', skipped by Listen', ok, { p: p.pics, want });
  }
  await go(a.page, 'a-cycle.heavy-bleeding-how-to-tell'); const p2 = await pageOf(a.page);
  check('3 ' + lang + ' ... and no drawing where it would show nothing the words say (heavy bleeding)', p2.h1 && p2.pics.length === 0, p2.pics);
  if (lang === 'hi') {
    await go(a.page, 'a-cycle.what-is-a-menstrual-cycle'); const p3 = await pageOf(a.page);
    check('1 hi "संक्षेप में" with the Hindi summary', p3.eyebrow === 'संक्षेप में' && p3.lead === sumOf(artOf('cycle.what-is-a-menstrual-cycle'), 'hi'), p3.eyebrow);
    check('2 hi "डॉक्टरों ने जाँचा · {month} 2026"', /^डॉक्टरों ने जाँचा · \S+ 2026$/.test(p3.rv), p3.rv);
  }
  await done(a);
}

/* ---------- 4. the box reads in light and dark; Hindi at 360 px ---------- */
for (const dark of [false, true]) {
  const a = await open({ name: '4 ' + (dark ? 'dark' : 'light'), dark: dark, seed: { settings: { theme: dark ? 'dark' : 'light' } }, hash: '#a-cycle.what-is-a-menstrual-cycle' });
  const r = await a.page.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number); const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = (s) => { const [r, g, b] = rgb(s); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
    const ratio = (f, b) => { const x = lum(f), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const box = document.querySelector('.article .in-short'); const bg = getComputedStyle(box).backgroundColor;
    return { theme: document.documentElement.getAttribute('data-theme'), bg: bg, eyebrow: ratio(getComputedStyle(box.querySelector('.eyebrow')).color, bg), lead: ratio(getComputedStyle(box.querySelector('.lead')).color, bg), alpha: (rgb(bg)[3] === undefined ? 1 : rgb(bg)[3]) };
  });
  check('4 ' + (dark ? 'dark' : 'light') + ': "In short" and its summary read at 4.5:1 or better on a solid box', r.theme === (dark ? 'dark' : 'light') && r.alpha === 1 && r.eyebrow >= 4.5 && r.lead >= 4.5, r);
  await shot(a.page, '4-' + (dark ? 'dark' : 'light'));
  await done(a);
}
{
  const a = await open({ name: '4 Hindi 360', w: 360, h: 800, seed: { lang: 'hi' }, hash: '#a-cycle.what-is-a-menstrual-cycle' });
  const r = await a.page.evaluate(() => { const svgs = Array.from(document.querySelectorAll('.article .art-pic svg')).map((s) => s.getBoundingClientRect());
    return { noScroll: document.documentElement.scrollWidth <= window.innerWidth + 1, n: svgs.length, oneRow: svgs.every((b) => Math.abs(b.top - svgs[0].top) < 2), w: svgs.map((b) => Math.round(b.width)), right: Math.max(...svgs.map((b) => b.right)) }; });
  check('4 Hindi at 360 px: no sideways scroll, the three steps side by side and each big enough to read (80 px or more)', r.noScroll && r.n === 3 && r.oneRow && r.w.every((x) => x >= 80) && r.right <= 360, r);
  await shot(a.page, '4-hi-360');
  await done(a);
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
