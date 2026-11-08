// Version 39.88: the articles' subheads, in their own words (docs/teach-and-show-advice-2026-11-08.md, part 3, L7's subheads;
// MODULE_API section 131). Mohit, 8 Nov: "Proceed with your recommendation". This file checks:
//   1 a line of its own that leads into a list shows as a heading, without its colon ("What helps at home", "Do", "Avoid",
//     "घर पर क्या मदद करता है"), right above the list;
//   2 a short label (up to 6 words) that opens a paragraph or a sentence shows in bold ("Why it matters:", "Myth:", "Truth:", "सच:");
//     a long opening phrase before a colon does not;
//   3 the words are the reviewed words: every article's body text on the page is its content, word for word (English and Hindi),
//     so the doctors' stamp still holds on all 60;
//   4 a line that starts with "## " (a subhead the doctors approve later) shows as a heading, and, as a change to the words, takes
//     the doctors' line away until the article is stamped again;
//   5 Hindi at 360 px, and no page errors.
// Usage: node test/subheads.mjs [dir]   (dir defaults to this app folder)
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
const SHOTS = path.join(here, 'shots', 'subheads'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-11';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Sharma', pincode: '302001', activeOn: TODAY };
const base = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], focus: { tile: 'cycle', goals: [], at: ago(200) } }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const arts = C.groups.flatMap((g) => g.articles.map((a) => [g.group + '.' + a.id, a]));
const artOf = (k) => arts.find((x) => x[0] === k)[1];
/* the body she reads: this seed is on the doctor route (her own doctor, the default), so doctor-route paragraphs replace theirs */
const bodyOf = (a, lang) => { const b = a['body_' + lang] || []; const o = a.doc && a.doc['body_' + lang]; return o ? b.map((p, i) => (o[i] != null ? o[i] : p)) : b; };
const words = (s) => s.replace(/^- /gm, '').replace(/[:\s]+/g, ' ').trim();

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + (o.content || CONTENT) + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.88-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(base(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(TODAY + 'T10:30:00+05:30') });
  await page.goto(PAGE + (o.hash || '#learn'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 500) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 300); };
const done = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
const bodyView = (page) => page.evaluate(() => { const b = document.querySelector('#view .article .bodytext'); if (!b) return null;
  return { heads: Array.from(b.querySelectorAll('h2.art-h')).map((h) => ({ t: h.textContent, next: h.nextElementSibling ? h.nextElementSibling.className : '' })), bold: Array.from(b.querySelectorAll('strong')).map((x) => x.textContent),
    text: Array.from(b.children).filter((e) => !e.classList.contains('art-pic')).map((e) => e.textContent).join('\n'), rv: !!document.querySelector('#view .article .rv-line') }; });

for (const lang of ['en', 'hi']) {
  const a = await open({ name: 'articles ' + lang, seed: { lang: lang } });
  /* ---------- 1 and 2 ---------- */
  await go(a.page, 'a-cycle.painful-periods'); let v = await bodyView(a.page);
  check('1 ' + lang + ' painful periods: "' + (lang === 'en' ? 'What helps at home' : 'घर पर क्या मदद करता है') + '" a heading, without its colon, right above the list', v && v.heads.length === 1 && v.heads[0].t === (lang === 'en' ? 'What helps at home' : 'घर पर क्या मदद करता है') && v.heads[0].next === 'bullet', v && v.heads);
  check('2 ' + lang + ' painful periods: the list\'s own labels in bold', v && v.bold.indexOf(lang === 'en' ? 'Heat:' : 'गर्माहट:') >= 0 && v.bold.indexOf(lang === 'en' ? 'Gentle movement:' : 'हल्की हरकत:') >= 0, v && v.bold);
  await a.page.evaluate(() => { const h = document.querySelector('#view .bodytext .art-h'); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 160); }); await settle(a.page, 200);
  await a.page.screenshot({ path: path.join(SHOTS, 'painful-' + lang + '.png') });
  check('5 ' + lang + ': no sideways scroll at 360 px', await a.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await go(a.page, 'a-cycle.period-dos-and-donts'); v = await bodyView(a.page);
  check('1 ' + lang + ' periods\' dos and don\'ts: its three lead-ins are its three headings', v && v.heads.length === 3 && v.heads.every((h) => h.next === 'bullet'), v && v.heads);
  await go(a.page, 'a-pregnancy.dos-and-donts'); v = await bodyView(a.page);
  check('1 ' + lang + ' pregnancy\'s dos and don\'ts: "Do" and "Avoid" (in her language) as headings', v && v.heads.length === 2, v && v.heads);
  await go(a.page, 'a-cycle.heavy-bleeding-how-to-tell'); v = await bodyView(a.page);
  check('2 ' + lang + ' heavy bleeding: its three labels in bold', v && JSON.stringify(v.bold) === JSON.stringify(lang === 'en' ? ['Why it matters:', 'What to do this week:', 'What to do today:'] : ['यह क्यों ज़रूरी है:', 'इस हफ़्ते क्या करें:', 'आज क्या करें:']), v && v.bold);
  await go(a.page, 'a-cycle.common-period-myths'); v = await bodyView(a.page);
  const my = lang === 'en' ? ['Myth:', 'Truth:'] : ['भ्रम:', 'सच:'];
  check('2 ' + lang + ' the myths: each "' + my[0] + '" and each "' + my[1] + '" in bold (7 of each)', v && v.bold.filter((x) => x === my[0]).length === 7 && v.bold.filter((x) => x === my[1]).length === 7, v && v.bold);
  await go(a.page, 'a-cycle.spotting-between-periods'); v = await bodyView(a.page);
  check('2 ' + lang + ' a long opening phrase before a colon stays plain (spotting\'s first lines)', v && !v.bold.some((x) => x.split(/\s+/).length > 6), v && v.bold);
  /* ---------- 3. the words are the reviewed words, on every article ---------- */
  const off = [];
  for (const [k, art] of arts) {
    if (k === 'services.your-data-privacy') continue;   /* its page is drawn from the joining notice (Version 39.78) */
    await go(a.page, 'a-' + k); const b = await bodyView(a.page); if (!b) { off.push(k + ' (no page)'); continue; }
    if (words(b.text) !== words(bodyOf(art, lang).join('\n'))) off.push(k);
  }
  check('3 ' + lang + ': on every article the body is its content, word for word (only the headings\' colons go)', !off.length, off);
  await done(a);
}
check('3 the doctors\' stamp still holds on all 60 (no word changed)', arts.every(([, x]) => TOOL.stateOf(x) === 'ok'), arts.filter(([, x]) => TOOL.stateOf(x) !== 'ok').map(([k]) => k));

/* ---------- 4. "## " ---------- */
{
  /* through web/tools/add-subhead.mjs, which moves the article's doctor-route paragraphs (keyed by position) along with their text */
  const { addSubhead } = await import(pathToFileURL(path.join(root, 'tools', 'add-subhead.mjs')).href);
  const c = JSON.parse(CONTENT); const a0 = addSubhead(c, 'pregnancy.after-birth-first-six-weeks', 2, 'Your ASHA', 'आपकी ASHA');
  const orig = artOf('pregnancy.after-birth-first-six-weeks');
  check('4 the tool moves the doctor-route paragraphs with their text (each still replaces its own paragraph)', ['body_en', 'body_hi'].every((f) => Object.keys(orig.doc[f]).every((k) => a0.doc[f][+k + (+k >= 2 ? 1 : 0)] === orig.doc[f][k])) && a0.body_en[2] === '## Your ASHA' && a0.body_hi[2] === '## आपकी ASHA', a0.doc);
  const a = await open({ name: '4 approved subhead', content: JSON.stringify(c), hash: '#a-pregnancy.after-birth-first-six-weeks' });
  const v = await bodyView(a.page);
  check('4 a "## " line shows as a heading', v && v.heads.length === 1 && v.heads[0].t === 'Your ASHA', v && v.heads);
  check('4 ... and, as a change to the words, takes the doctors\' line away until the article is stamped again', v && !v.rv && TOOL.stateOf(a0) === 'changed', v && v.rv);
  await done(a);
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
