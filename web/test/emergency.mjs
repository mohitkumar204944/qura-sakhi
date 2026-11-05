// Version 39.70, the doctors' feature review, part 2: the emergency line (Mohit, 6 Nov: "commit 39.68 and go with part 2";
// docs/feature-review-2026-11-05.md, answers 1 to 3; MODULE_API section 113). Wherever "Call 112 now" was, she reads "Go to the
// nearest hospital now", with one ambulance number under it: 108, or 102 in pregnancy. Tele-MANAS, 181, Childline and the
// violence lines are gone, and nothing is shown for thoughts of harm. This file checks:
// - 1 Help: the first row in English and Hindi, 108 or 102 by her stage, no row for thoughts of harm, and the numbers sheet
//   holding only the ambulances, 104 and 1097;
// - 2 search: a danger sign in her words shows Help's line with the ambulance; words about harming herself show no card;
// - 3 every live screen, every sheet above and every Learn article, for 5 women in English and Hindi, discreet mode, and both care
//   routes for Learn: no 112, Tele-MANAS (14416), 181, Childline (1098), women's or police line, in words or in a Call link, and no
//   violence help ("If the sex was forced", "not safe at home");
// - 4 the recovery check after a birth asks mood without a harm chip, and an old harm answer shows nothing about harm;
// - 5 the Learn library and the plans as data hold none of those numbers; no page errors.
// Usage: node test/emergency.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 6000)); };
/* what may never show: the numbers and the names of the lines the doctors removed, and violence help (answer 3) (a digit, a point, a dash or a slash beside a
   number, or a unit after it, means it is part of something else: a date, a BP reading such as 112/74, a sugar of 112 mg/dL) */
const GONE_TEXT = /(?<![\d.,:/+-])(?:112|14416|181|1098|1091|15100|1930)(?![\d/]|\s?(?:mg|mm|kg|g\b|%))|1-?800-?891-?4416|Tele-?MANAS|टेली-?मानस|Childline|चाइल्डलाइन|Child Helpline|चाइल्ड हेल्पलाइन|Women Helpline|महिला हेल्पलाइन/i;
const GONE_VIOL = /did not want the sex|sex was forced|safe at home|\bviolence\b|हिंसा/i;   /* a source may name a guideline's title (sexual violence); the help may not */
const GONE_ALL = new RegExp(GONE_TEXT.source + '|' + GONE_VIOL.source, 'i');
const GONE_TEL = /^tel:(?:112|14416|1-?800-?891-?4416|18008914416|181|1098|1091|15100|1930|100)$/;
const ARTS = JSON.parse(CONTENT).groups.flatMap((g) => g.articles.map((a) => 'a-' + g.group + '.' + a.id));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.70-pilot', platform: 'android' }) + ';');
await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
const page = await ctx.newPage();
const errs = []; let where = '';
page.on('pageerror', (e) => errs.push(where + ' :: ' + String(e.message).slice(0, 200)));
await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const ROUTES = await page.evaluate(() => { const S = window.Saathi; const r = ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about', 'library'];
  S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).slice(0, 4).forEach((x) => r.push(x)); });
  S.sections.forEach((s) => r.push('topic-' + s)); return r.filter((x, i) => r.indexOf(x) === i && !(S.retired && S.retired(x))); });

const load = (o) => page.evaluate((o) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); S.loadSample(o.p); const st = S.state; st.lang = o.lang; st.langChosen = true;
  st.settings.toursAuto = false; st.settings.discreet = !!o.discreet; st.fullTour = { st: 'done', d: S.toISO(S.today()) }; st.whatsNew = '9.99'; if (o.care) st.situation.care = o.care; S.save(); location.hash = '#home'; S.render(); }, o);
/* every number and Call link on the screen and in any open sheet */
const scan = () => page.evaluate((src) => { const re = new RegExp(src[0], 'i'), tre = new RegExp(src[1]); const out = [];
  for (const el of [document.getElementById('view'), document.getElementById('sheet-root')]) { if (!el) continue;
    const m = (el.innerText || '').match(re); if (m) { const i = el.innerText.indexOf(m[0]); out.push('text "' + el.innerText.slice(Math.max(0, i - 50), i + 40).replace(/\s+/g, ' ') + '"'); }
    el.querySelectorAll('a[href^="tel:"]').forEach((a) => { if (tre.test(a.getAttribute('href'))) out.push(a.getAttribute('href')); }); }
  return out; }, [GONE_ALL.source, GONE_TEL.source]);
const show = (r) => page.evaluate((r) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); location.hash = '#' + r; S.render(); }, r);
const helpSheet = async () => { await show('home'); await page.evaluate(() => { const b = document.getElementById('help-btn'); if (b) b.click(); }); await page.waitForTimeout(120);
  return page.evaluate(() => { const r = document.querySelector('#sheet-root #hs-112');
    return { on: !!r, h: r ? r.querySelector('strong').innerText : '', s: r ? r.querySelector('.body span').innerText : '', tel: r ? r.getAttribute('href') : '', first: !!r && !r.previousElementSibling,
      harm: !!document.querySelector('#sheet-root #hs-harm'), sos: !!document.querySelector('#sheet-root #hs-sos') }; }); };
const sosSheet = async () => { await page.evaluate(() => { const b = document.querySelector('#sheet-root #hs-sos'); if (b) b.click(); }); await page.waitForTimeout(120);
  return page.evaluate(() => [...document.querySelectorAll('#sheet-root .sos-row .sos-n')].map((x) => x.innerText.trim())); };
const search = async (q) => { await show('care'); await page.evaluate((q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); }, q); await page.waitForTimeout(150);
  return page.evaluate(() => { const c = document.querySelector('#view .srch-urg');
    return { on: !!c, h: c ? c.querySelector('h2').innerText : '', tels: c ? [...c.querySelectorAll('a[href^="tel:"]')].map((x) => x.getAttribute('href')) : [], help: !!c && !!c.querySelector('[data-go="help"]') }; }); };
const T = (k, o) => page.evaluate(([k, o]) => (o ? window.Saathi.tf(k, o) : window.Saathi.t(k)), [k, o]);

// 1. Help: "Go to the nearest hospital now", the ambulance under it
const EN = { h: 'Go to the nearest hospital now', s108: 'Ambulance: call 108', s102: 'Ambulance: call 102', card: 'Go to the nearest hospital now if' };
for (const [p, lang, n] of [['asha', 'en', '108'], ['meera', 'en', '102'], ['sunita', 'en', '108'], ['kamla', 'en', '108'], ['asha', 'hi', '108'], ['meera', 'hi', '102']]) {
  where = p + ' ' + lang + ' help'; await load({ p, lang });
  const h = await helpSheet(); const s = await T('hs_112_s', { n }); const head = await T('hs_112');
  check('1.1 ' + p + ' (' + lang + '): Help\'s first row says "' + head + '", "' + s + '", and calls ' + n, h.on && h.first && h.h === head && h.s === s && h.tel === 'tel:' + n &&
    (lang === 'hi' ? head === 'अभी सबसे पास के अस्पताल जाएँ' && s === 'एम्बुलेंस: ' + n + ' पर कॉल करें' : head === EN.h && s === EN['s' + n]), h);
  check('1.2 ' + p + ' (' + lang + '): no row for thoughts of harm, and the other numbers are still a tap away', !h.harm && h.sos, h);
  const nums = await sosSheet();
  check('1.3 ' + p + ' (' + lang + '): the numbers sheet holds only the ambulances, 104 and 1097', nums.slice().sort().join() === ['102', '1097', '104', '108'].sort().join(), nums);
  const left = await scan(); check('1.4 ' + p + ' (' + lang + '): neither sheet names a removed line', !left.length, left);
}

// 2. Search: a danger sign shows Help's line with the ambulance; words about harm show no card
for (const [p, n] of [['asha', '108'], ['meera', '102']]) {
  await load({ p, lang: 'en' });
  for (const q of ['bleeding with dizziness', 'bahut bleeding ho rahi hai aur chakkar aa raha hai', 'late period, one-sided pain']) {
    where = p + ' search ' + q; const r = await search(q);
    check('2.1 ' + p + ' "' + q + '": "' + EN.card + '", Call ' + n + ' and Help', r.on && r.h === EN.card && r.tels.join() === 'tel:' + n && r.help, r);
  }
  for (const q of ['I want to kill myself', 'thoughts of harming myself', 'khud ko nuksan pahunchana', 'आत्महत्या', 'mujhe apne bachche ko nuksan ka dar hai']) {
    where = p + ' search ' + q; const r = await search(q); const left = await scan();
    check('2.2 ' + p + ' "' + q + '": no card and no helpline (the doctors\' answer 2)', !r.on && !left.length, { r, left });
  }
}
await load({ p: 'asha', lang: 'hi' }); where = 'asha hi search';
{ const r = await search('बहुत खून आ रहा है और चक्कर आ रहे हैं'); check('2.3 Hindi: the card says "अभी सबसे पास के अस्पताल जाएँ अगर" and calls 108', r.on && r.h === 'अभी सबसे पास के अस्पताल जाएँ अगर' && r.tels.join() === 'tel:108', r); }

// 3. Every live screen and every Learn article: none of the removed lines, in words or a Call link
const SETUPS = [];
for (const p of ['priya', 'asha', 'meera', 'sunita', 'kamla']) for (const lang of ['en', 'hi']) SETUPS.push({ p, lang });
SETUPS.push({ p: 'priya', lang: 'en', discreet: true }, { p: 'meera', lang: 'hi', discreet: true });
const found = []; let screens = 0;
for (const su of SETUPS) {
  await load(su);
  for (const r of ROUTES) { where = su.p + ' ' + su.lang + (su.discreet ? ' discreet' : '') + ' #' + r; await show(r); screens++; const left = await scan(); if (left.length) found.push(where + ': ' + left.join(' | ')); }
}
const byRoute = {}; found.forEach((f) => { const k = f.split(': ')[0].split(' #')[1]; (byRoute[k] = byRoute[k] || []).push(f.split(': ').slice(1).join(': ')); });
check('3.1 ' + screens + ' screens (' + ROUTES.length + ' routes, 5 women, English and Hindi, discreet mode): no removed line', !found.length, Object.entries(byRoute).map(([k, v]) => '#' + k + ' (' + v.length + '): ' + v[0]));
const foundA = []; let arts = 0;
for (const su of [{ p: 'asha', lang: 'en' }, { p: 'asha', lang: 'hi' }, { p: 'asha', lang: 'en', care: 'govt' }, { p: 'asha', lang: 'hi', care: 'govt' }, { p: 'meera', lang: 'en' }]) {
  await load(su);
  for (const r of ARTS) { where = su.p + ' ' + su.lang + ' ' + (su.care || '') + ' #' + r; await show(r); arts++; const left = await scan(); if (left.length) foundA.push(where + ': ' + left.join(' | ')); }
}
check('3.2 ' + arts + ' Learn pages (' + ARTS.length + ' articles, English and Hindi, both care routes): no removed line', !foundA.length, foundA.slice(0, 12));
await load({ p: 'meera', lang: 'en' }); await show('a-pregnancy.danger-signs-call-112');
{ const tx = await page.evaluate(() => document.getElementById('view').innerText);
  check('3.3 the pregnancy danger signs page: the nearest hospital now, and 102 before 108', /go to the nearest hospital now, one open 24 hours/i.test(tx) && /call 102, the free ambulance for pregnant women, or 108/.test(tx), tx.slice(0, 300)); }

// 4. After a birth: the recovery check's mood has no harm chip; an old harm answer shows nothing about harm
await load({ p: 'sunita', lang: 'en' }); where = 'sunita post-recovery'; await show('post-recovery');
{ const moods = await page.evaluate(() => [...document.querySelectorAll('#view [data-pst-g="mood"]')].map((b) => b.dataset.pstV));
  check('4.1 the recovery check asks mood with Okay, Low and Anxious only', moods.join() === 'ok,low,anx', moods); }
{ await page.evaluate(() => { const S = window.Saathi; const d = S.data('post'); d.rec = d.rec || {}; const k = S.toISO(S.addDays(S.today(), -1)); d.rec[k] = { danger: ['none'], mood: 'harm' }; S.save(); });
  const shown = {};
  for (const r of ['post-recovery', 'post', 'report', 'home']) { where = 'sunita old harm #' + r; await show(r); shown[r] = await page.evaluate(() => { const t = document.getElementById('view').innerText; return { harm: /harm|नुक़?सान पहुँचा/i.test(t), len: t.length }; }); }
  check('4.2 an old harm answer: the recovery check, the after-birth hub, the report and Today show nothing about harm', Object.values(shown).every((x) => !x.harm && x.len > 40), shown); }

// 5. The Learn library and the plans as data
{ const bad = []; const walk = (v, p) => { if (typeof v === 'string') { if (p.slice(-3) !== '.id' && (GONE_TEXT.test(v) || (!/\.sources\./.test(p) && GONE_VIOL.test(v)))) bad.push(p + ': ' + v.slice(0, 120)); } else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, p + '.' + k)); };
  walk(JSON.parse(CONTENT), 'content');
  for (const f of fs.readdirSync(path.join(root, 'progs')).filter((x) => x.endsWith('.js'))) { const s = fs.readFileSync(path.join(root, 'progs', f), 'utf8'); const m = s.match(GONE_TEXT); if (m) bad.push('progs/' + f + ': ' + m[0]); }
  check('5.1 content.json and progs/*.js name none of the removed lines', !bad.length, bad.slice(0, 10)); }
check('5.2 no page errors', !errs.length, errs.slice(0, 8));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(JSON.stringify({ checks: results.length, failed: failed.length, screens, arts }));
process.exit(failed.length ? 1 : 0);
