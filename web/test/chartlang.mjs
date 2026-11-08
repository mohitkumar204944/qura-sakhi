// Version 39.86: the presentation audit's fixes and one chart language (docs/teach-and-show-advice-2026-11-08.md, part 4, L9 and
// L10; the audit: docs/presentation-audit-2026-11-08.md; MODULE_API section 129). Mohit, 8 Nov: "you proceed as per your
// recommendations". This file checks:
//   1 Help and safety: "Go to the nearest hospital now if" right under "Not an emergency?" (Version 15), on the first screen at
//     360 x 800, with the gynaecologist or free government card after it; English and Hindi;
//   2 a date never breaks inside itself: Today's likely range keeps each date on one line, with the same words;
//   3 what carries meaning is 13 px or more: the tab bar's labels, the calendar's and the day page's weekday letters;
//   4 one chart language: on the gap and period charts her value sits on top of each bar, the usual band and the 8-day line are
//     labelled beside the bars, every number 13 px or more; My progress puts her minutes on top of each week's bar (above the
//     target line), the week under it, and the target's number in its legend;
//   5 the report's "When it comes": each sign's own picture in its kind's colour, the same as What repeats for you, kept in print;
//   6 Hindi at 360 px, and no page errors.
// Usage: node test/chartlang.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'chartlang'); fs.mkdirSync(SHOTS, { recursive: true });
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
/* 8 periods 28 days apart, the last 10 days ago, with notes in the last 4 cycles (as the presentation walk) */
const starts = [10, 38, 66, 94, 122, 150, 178, 206];
const daily = {}; starts.slice(0, 4).forEach((s) => { daily[ago(s)] = ['d_cramps', 'd_tired']; daily[ago(s - 1)] = ['d_cramps']; daily[ago(s + 3)] = ['d_bloat', 'd_irritable']; daily[ago(s + 2)] = ['d_headache']; });
const cycleW = { events: starts.flatMap((s) => [{ d: ago(s), t: 'start', flow: 'medium' }, { d: ago(s - 4), t: 'end' }]), daily: daily, intake: { goal: 'track', stage: 'cycle' } };
/* PMOS plan day 29 */
const log2 = {}; for (let i = 28; i >= 1; i--) if ((28 - i) % 7 < 4) log2[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', yoga: 'd', sleep: 'd' } };
const planW = { situation: { pcos: true, care: 'private' }, intake: { goal: 'pmos', stage: 'cycle' }, events: [106, 64, 22].flatMap((x) => [{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), focus: { tile: 'cycle', goals: ['pmos'], at: ago(60) },
  mods: { plan: { pack: 'cycle', goalKey: 'pmos', start: ago(28), started: ago(28), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '22:00', when: 'dinner', bed: 'b23', work: 'day', log: log2 } } };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.86-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(base(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(TODAY + 'T10:30:00+05:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 700);
  return { ctx, page, errs, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 500) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); await page.evaluate(() => window.scrollTo(0, 0)); };
const done = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });
const fs13 = (page, sel) => page.evaluate((s) => Array.from(document.querySelectorAll(s)).filter((e) => e.getBoundingClientRect().width > 0).map((e) => parseFloat(getComputedStyle(e).fontSize)), sel);

for (const lang of ['en', 'hi']) {
  /* ---------- 1. Help and safety ---------- */
  {
    const a = await open({ name: '1 Help ' + lang, seed: Object.assign({ lang: lang }, cycleW), hash: '#help' });
    const r = await a.page.evaluate(() => { const cards = Array.from(document.querySelectorAll('#view .card')); const i = cards.findIndex((c) => c.classList.contains('doc-card')); const u = document.querySelector('#view .card.urgent');
      return { next: i >= 0 && cards[i + 1] === u, top: u ? Math.round(u.getBoundingClientRect().top) : 9999, nav: document.querySelector('#tabbar').getBoundingClientRect().top, after: u && u.nextElementSibling ? (u.nextElementSibling.textContent || '').slice(0, 60) : '' }; });
    check('1 ' + lang + ': "Go to the nearest hospital now if" right under "Not an emergency?", starting on the first screen at 360 x 800', r.next && r.top < r.nav - 40, r);
    check('1 ' + lang + ': ... the gynaecologist or free government card after it', /gynaecologist|स्त्री रोग/.test(r.after), r.after);
    await shot(a.page, '1-help-' + lang);
    await done(a);
  }
  /* ---------- 2 and 3. Today: the likely range; the tab bar and weekday letters ---------- */
  {
    const a = await open({ name: '2 Today ' + lang, seed: Object.assign({ lang: lang }, cycleW) });
    const r = await a.page.evaluate(() => { const p = document.querySelector('#view .cd-from'); if (!p) return null; const nw = Array.from(p.querySelectorAll('.nw'));
      return { text: p.textContent, nw: nw.map((x) => x.textContent), nowrap: nw.every((x) => getComputedStyle(x).whiteSpace === 'nowrap'), lines: nw.map((x) => x.getClientRects().length) }; });
    check('2 ' + lang + ': Today\'s likely range keeps each date on one line ("2 Dec" never splits), with the same words', r && r.nw.length === 2 && r.nowrap && r.lines.every((n) => n === 1) && r.nw.every((x) => r.text.indexOf(x) >= 0) && /\d/.test(r.nw[1]), r);
    const tabs = await fs13(a.page, '#tabbar button');
    check('3 ' + lang + ': the tab bar\'s labels at 13 px or more', tabs.length >= 4 && tabs.every((x) => x >= 13), tabs);
    check('3 ' + lang + ': ... and the tab bar is still its 65 px at 100% text', await a.page.evaluate(() => Math.round(document.querySelector('#tabbar').getBoundingClientRect().height)) === 65);
    await a.page.evaluate((d) => window.Saathi.openDay(d), TODAY); await settle(a.page, 500);
    const wd = await fs13(a.page, '#sheet-root .wkstrip .wdn');
    check('3 ' + lang + ': the day page\'s weekday letters at 13 px or more', wd.length === 7 && wd.every((x) => x >= 13), wd);
    await a.page.evaluate(() => { const b = document.querySelector('#sheet-root .sheet-close, #sheet-root [data-close]'); if (b) b.click(); }); await settle(a.page, 300);
    await go(a.page, 'diary'); await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 400);
    const dow = await fs13(a.page, '#view .cal .dow');
    check('3 ' + lang + ': the calendar\'s weekday letters at 13 px or more', dow.length === 7 && dow.every((x) => x >= 13), dow);
    /* ---------- 4. the gap and period charts ---------- */
    await a.page.evaluate(() => document.querySelector('#view [data-tab="tr"]').click()); await settle(a.page, 500);
    await a.page.evaluate(() => { const d = document.querySelector('#view details.charts-d'); if (d) d.open = true; }); await settle(a.page, 300);
    const c = await a.page.evaluate(() => {
      const chart = (el) => { if (!el) return null; const cols = Array.from(el.querySelectorAll('.col')); return { aria: el.getAttribute('aria-label'), vals: cols.map((x) => (x.querySelector('.v') || {}).textContent),
        above: cols.every((x) => { const v = x.querySelector('.v'); return v && v.getBoundingClientRect().bottom <= x.getBoundingClientRect().top + 1; }), lab: Array.from(el.querySelectorAll('.ch-l')).map((x) => x.textContent),
        fs: Array.from(el.querySelectorAll('.v, .ch-l')).map((x) => parseFloat(getComputedStyle(x).fontSize)), inBox: Array.from(el.querySelectorAll('.v, .ch-l')).every((x) => { const b = x.getBoundingClientRect(); return b.left >= 0 && b.right <= window.innerWidth; }), under: !!(el.nextElementSibling && el.nextElementSibling.classList.contains('barlabels')) }; };
      const all = Array.from(document.querySelectorAll('#view details.charts-d .bars')); return { gaps: chart(all.find((x) => !x.classList.contains('pbars'))), per: chart(all.find((x) => x.classList.contains('pbars'))) }; });
    const nums = (s) => (s.match(/\d+(?=\D*$)/) ? s.split(':').pop().split(',').map((x) => x.trim()) : []);
    check('4 ' + lang + ' gaps: her value on top of each bar (the same numbers the screen reader hears), none under the chart', c.gaps && c.gaps.above && !c.gaps.under && JSON.stringify(c.gaps.vals) === JSON.stringify(nums(c.gaps.aria)) && c.gaps.vals.length === 7, c.gaps);
    check('4 ' + lang + ' gaps: the usual band labelled beside the bars, "21–35"', c.gaps && JSON.stringify(c.gaps.lab) === '["21–35"]', c.gaps && c.gaps.lab);
    check('4 ' + lang + ' periods: her value on top of each bar, and the 8-day line labelled "8"', c.per && c.per.above && !c.per.under && JSON.stringify(c.per.vals) === JSON.stringify(nums(c.per.aria)) && JSON.stringify(c.per.lab) === '["8"]', c.per);
    check('4 ' + lang + ': every number on both charts at 13 px or more, inside the screen at 360 px', c.gaps && c.per && c.gaps.fs.concat(c.per.fs).every((x) => x >= 13) && c.gaps.inBox && c.per.inBox, { g: c.gaps && c.gaps.fs, p: c.per && c.per.fs });
    const el = await a.page.$('#view details.charts-d'); if (el) await el.screenshot({ path: path.join(SHOTS, '4-charts-' + lang + '.png') });
    /* ---------- 5. the report's "When it comes" ---------- */
    await go(a.page, 'report');
    const t5 = await a.page.evaluate(() => Array.from(document.querySelectorAll('#view .rp-tm tbody tr')).map((tr) => { const k = tr.querySelector('td:first-child .tm-k'); return { name: tr.querySelector('td:first-child').textContent, hue: k ? (k.className.match(/hue-(\w+)/) || [])[1] : null, svg: !!(k && k.querySelector('svg')), hidden: k ? k.getAttribute('aria-hidden') : null, print: k ? getComputedStyle(k).printColorAdjust : null }; }));
    await go(a.page, 'diary'); await a.page.evaluate(() => document.querySelector('#view [data-tab="tr"]').click()); await settle(a.page, 500);
    const pat = await a.page.evaluate(() => Object.fromEntries(Array.from(document.querySelectorAll('#view .pat-card .item')).map((it) => [(it.querySelector('strong') || {}).textContent, ((it.querySelector('.ico-sm') || {}).className || '').match(/hue-(\w+)/)[1]])));
    const want = lang === 'en' ? { Cramps: 'orange', Tired: 'green', Bloating: 'green', Irritable: 'purple', Headache: 'orange' } : null;
    check('5 ' + lang + ': each sign in the report\'s "When it comes" has its own picture in its kind\'s colour, hidden from a screen reader (the name is read)', t5.length >= 5 && t5.every((x) => x.hue && x.svg && x.hidden === 'true' && x.name.length > 1) && (!want || t5.every((x) => want[x.name] === x.hue)), t5);
    check('5 ' + lang + ': ... the same colour as What repeats for you gives the sign', Object.keys(pat).length >= 3 && Object.keys(pat).every((n) => { const r0 = t5.find((x) => x.name === n); return r0 && r0.hue === pat[n]; }), { pat, t5 });
    check('5 ' + lang + ': ... kept when it is printed', t5.every((x) => x.print === 'exact'), t5.map((x) => x.print));
    await done(a);
  }
  /* ---------- 4. My progress ---------- */
  {
    const a = await open({ name: '4 My progress ' + lang, seed: Object.assign({ lang: lang }, planW), hash: '#plan-progress' });
    const r = await a.page.evaluate(() => { const s = document.querySelector('#view svg.pl-chart'); if (!s) return null; const k = s.getScreenCTM().a;
      const bars = Array.from(s.querySelectorAll('rect.bar')); const tgs = Array.from(s.querySelectorAll('line.tg')); const vs = Array.from(s.querySelectorAll('text.v')); const wk = Array.from(s.querySelectorAll('text:not(.v)')).sort((p, q) => +p.getAttribute('x') - +q.getAttribute('x'));
      const leg = (s.closest('.card').querySelector('.pl-legend') || {}).textContent || '';
      return { aria: s.getAttribute('aria-label'), vals: vs.map((x) => x.textContent), weeks: wk.map((x) => x.textContent), px: Array.from(s.querySelectorAll('text')).map((x) => Math.round(parseFloat(getComputedStyle(x).fontSize) * k * 10) / 10),
        above: vs.every((v, i) => { const vb = v.getBBox(); return vb.y + vb.height <= Math.min(bars[i].getBBox().y, tgs[i].getBBox().y) + 1; }), leg: leg, nb: bars.length }; });
    const mins = r ? r.aria.split(',').map((x) => x.split(':').pop().trim()) : [];
    check('4 ' + lang + ' My progress: her minutes on top of each week\'s bar, above its target line (the numbers the screen reader hears)', r && r.nb === 5 && JSON.stringify(r.vals) === JSON.stringify(mins) && r.above, r);
    check('4 ' + lang + ' My progress: the week under each bar, 1 to 12', r && r.weeks.join() === '1,2,3,4,5,6,7,8,9,10,11,12', r && r.weeks);
    check('4 ' + lang + ' My progress: every number 13 px or more on the screen', r && r.px.every((x) => x >= 13), r && r.px);
    check('4 ' + lang + ' My progress: the target\'s number in its legend', r && (lang === 'en' ? /^target: \d+$/ : /^लक्ष्य: \d+$/).test(r.leg.trim()), r && r.leg);
    const el = await a.page.$('#view .card:has(svg.pl-chart)'); if (el) await el.screenshot({ path: path.join(SHOTS, '4-progress-' + lang + '.png') });
    await done(a);
  }
}
/* ---------- 5. the report's example has the same pictures ---------- */
{
  const a = await open({ name: '5 example', seed: {}, hash: '#report' });
  await a.page.evaluate(() => { const b = document.querySelector('#rp-ex'); if (b) b.click(); }); await settle(a.page, 500);
  const n = await a.page.evaluate(() => Array.from(document.querySelectorAll('#sheet-root .rp-tm tbody tr')).filter((tr) => tr.querySelector('.tm-k svg')).length);
  check('5 the empty report\'s example shows the same pictures in "When it comes"', n === 4, n);
  await done(a);
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
