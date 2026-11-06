// The doctor walk (6 Nov 2026; Mohit: "some places it should be only government doctor and some places only qura doctor ... audit
// and create a list so i can decide"). Not pass/fail. Every live screen, Help, and every Learn page, for 7 women and every answer to
// "Where do you usually go for women's health?" (not answered, private, government, ASHA, nowhere yet), in English. On each screen
// it notes:
// - qura: a line naming Qura (its doctor, team or coordinator);
// - govt: a line naming government care (government, PHC, CHC, ASHA, ANM, Ayushman, eSanjeevani, JSY, PMSMA, free doctor ...);
// - ask: an "Ask a doctor" button (it opens the Qura call), and Qura's booking or WhatsApp links;
// - gyn: a "See a gynaecologist" or "See a doctor" button, and where it goes;
// - tel: a Call link (her own doctor's number, an ambulance).
// Usage: node test/doctor-walk.mjs [web dir]. Output: test/shots/doctor-walk/walk.json (every hit) and by-place.txt (one block per
// place: what shows, for which care answers).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const OUT = path.join(here, 'shots', 'doctor-walk'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ARTS = JSON.parse(CONTENT).groups.flatMap((g) => g.articles.map((a) => 'a-' + g.group + '.' + a.id));

const WOMEN = [
  ['priya', 'priya', {}],                                   /* irregular cycles, 27 */
  ['asha', 'asha', {}],                                     /* regular cycles, 31 */
  ['asha-ttc', 'asha', { planning: true }],                 /* trying for a baby */
  ['meera', 'meera', {}],                                   /* 24 weeks pregnant */
  ['sunita', 'sunita', {}],                                 /* baby born 3 weeks ago */
  ['kamla', 'kamla', {}],                                   /* 48, periods changing */
  ['kamla-meno', 'kamla', { stopped: true }]                /* periods stopped */
];
const CARES = ['unset', 'private', 'govt', 'asha', 'none'];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.76-pilot', platform: 'android' }) + ';');
await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
const page = await ctx.newPage();
const errs = []; let where = '';
page.on('pageerror', (e) => errs.push(where + ' :: ' + String(e.message).slice(0, 200)));
await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const ROUTES = await page.evaluate(() => { const S = window.Saathi; const r = ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'ask-call', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about', 'library', 'plan', 'explain', 'calendar'];
  S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).forEach((x) => r.push(x)); });
  S.sections.forEach((s) => r.push('topic-' + s)); return r.filter((x, i) => r.indexOf(x) === i && !(S.retired && S.retired(x))); });

const load = (o) => page.evaluate((o) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); S.loadSample(o.p); const st = S.state; st.lang = 'en'; st.langChosen = true;
  st.settings.toursAuto = false; st.fullTour = { st: 'done', d: S.toISO(S.today()) }; st.whatsNew = '9.99'; st.situation = st.situation || {};
  Object.assign(st.situation, o.sit || {}); if (o.care === 'unset') delete st.situation.care; else st.situation.care = o.care; S.save(); location.hash = '#home'; S.render(); }, o);
const show = (r) => page.evaluate((r) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); location.hash = '#' + r; S.render(); }, r);
const QURA = /Qura(?!\s*Sakhi)|क्यूरा|कुरा/;
const GOVT = /government|govt|\bPHC\b|\bCHC\b|\bASHA\b|\bANM\b|Ayushman|Arogya Mandir|eSanjeevani|Janani|\bJSY\b|PMSMA|PMMVY|Anganwadi|district hospital|free doctor|sarkari|health centre|health center|Jan Aushadhi|\b104\b/i;
const scan = () => page.evaluate(([q, g]) => { const Q = new RegExp(q), G = new RegExp(g, 'i'); const out = [];
  const els = [document.getElementById('view'), document.getElementById('sheet-root')].filter(Boolean);
  for (const el of els) {
    const where = el.id === 'view' ? 'page' : 'sheet';
    const lines = (el.innerText || '').split('\n').map((x) => x.trim()).filter(Boolean);
    lines.forEach((l) => { if (Q.test(l)) out.push({ k: 'qura', w: where, t: l }); if (G.test(l)) out.push({ k: 'govt', w: where, t: l }); });
    el.querySelectorAll('[data-ask], [data-go="ask"], [data-go="ask-call"], a[href*="quranutrition"], a[href*="wa.me"]').forEach((b) => {
      out.push({ k: 'ask', w: where, t: (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '), to: b.dataset.go || b.getAttribute('href') || 'ask(' + (b.dataset.ask || '') + ')' }); });
    el.querySelectorAll('button, a').forEach((b) => { const tx = (b.innerText || '').trim().replace(/\s+/g, ' ');
      if (/^(See a gynaecologist|See a doctor|Call my doctor|My doctor|Care near me)/i.test(tx)) out.push({ k: 'gyn', w: where, t: tx, to: b.dataset.go || b.getAttribute('href') || b.id || [...b.attributes].map((a) => a.name).filter((n) => n.indexOf('data-') === 0).join(',') }); });
    el.querySelectorAll('a[href^="tel:"]').forEach((a) => out.push({ k: 'tel', w: where, t: (a.innerText || '').trim().replace(/\s+/g, ' '), to: a.getAttribute('href') }));
  }
  return out; }, [QURA.source, GOVT.source]);
const helpSheet = async () => { await show('home'); await page.evaluate(() => { const b = document.getElementById('help-btn'); if (b) b.click(); }); await page.waitForTimeout(80); };

const hits = [];   /* { who, care, place, k, w, t, to } */
const add = (who, care, place, list) => list.forEach((h) => hits.push(Object.assign({ who, care, place }, h)));
let screens = 0;
for (const [who, p, sit] of WOMEN) for (const care of CARES) {
  where = who + ' ' + care; await load({ p, sit, care });
  for (const r of ROUTES) { where = who + ' ' + care + ' #' + r; await show(r); screens++; add(who, care, '#' + r, await scan()); }
  where = who + ' ' + care + ' help sheet'; await helpSheet(); screens++; add(who, care, 'Help (sheet on Today)', (await scan()).filter((h) => h.w === 'sheet'));
}
let arts = 0;
for (const care of CARES) { await load({ p: 'asha', sit: {}, care });
  for (const r of ARTS) { where = 'asha ' + care + ' #' + r; await show(r); arts++; add('asha', care, '#' + r, await scan()); } }
await load({ p: 'meera', sit: {}, care: 'unset' });   /* the pregnancy articles as a pregnant woman reads them */
for (const r of ARTS.filter((x) => /^a-(pregnancy|conceive)\./.test(x))) { where = 'meera #' + r; await show(r); add('meera', 'unset', '#' + r, await scan()); }
await browser.close();

fs.writeFileSync(path.join(OUT, 'walk.json'), JSON.stringify({ screens, arts, routes: ROUTES.length, errs, hits }, null, 1));
/* by place: each distinct line or button, and the care answers (and women) it shows for */
const byPlace = {};
hits.forEach((h) => { const P = byPlace[h.place] || (byPlace[h.place] = {}); const key = h.k + '|' + h.t + (h.to ? ' → ' + h.to : '');
  const e = P[key] || (P[key] = { cares: new Set(), who: new Set() }); e.cares.add(h.care); e.who.add(h.who); });
const txt = Object.keys(byPlace).sort().map((pl) => pl + '\n' + Object.entries(byPlace[pl]).map(([k, e]) => '  [' + k.split('|')[0] + '] ' + k.split('|').slice(1).join('|').slice(0, 260) +
  '  {' + (e.cares.size === CARES.length ? 'all' : [...e.cares].join(',')) + '; ' + [...e.who].join(',') + '}').join('\n')).join('\n\n');
fs.writeFileSync(path.join(OUT, 'by-place.txt'), txt);
console.log(JSON.stringify({ screens, arts, routes: ROUTES.length, places: Object.keys(byPlace).length, hits: hits.length, errs: errs.length }));
