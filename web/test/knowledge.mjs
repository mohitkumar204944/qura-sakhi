// Version 39.7: knowledge that leads somewhere (roadmap section 3; journey audit P3-01, P3-02, P3-04, P3-13 to P3-18, P3-21;
// MODULE_API section 50). Mohit, 24 Oct: "build until v40 and then stop". This file checks:
//   1 an article leads with its tool, then its long guide, then "Ask a Qura doctor"; "Also asked" comes from the map; a tool
//     a build holds back never shows;
//   2 the book: it opens at her stage's chapter, ticks what she has read, counts each chapter, offers Continue and "Where to get
//     it free";
//   3 a long guide offers its article as a 1-minute read;
//   4 her stage's dos and don'ts lead "Your questions";
//   5 search: quick answers first, scheme and knowledge words, girls' pages last for a woman of 20 or more;
//   6 one danger list in pregnancy: Help, the family cards, the husband's page and the symptom guide;
//   7 Help's three tabs, each where the build shows it;
//   8 one myths deck: the periods myths page, Sach ya Myth and the contraception hub's "Worries and facts";
//   9 one "Did you know?" card a week on Today;
//  10 a plan step's "Why it helps" opens its Learn guide;
//  11 one "For my family" page;
//  12 topics with their articles, how to use free care, Kilkari on the pregnancy plan;
//  13 Hindi, a 360 px screen, and no page errors;
//  14 the 25 Oct review of V39.7: its 31 confirmed findings (MODULE_API 50.1).
// Usage: node test/knowledge.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'knowledge'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'answer'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(300), prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b24', work: 'day', log: {}, pv: 1 }, extra || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({ app: '0.39.7-pilot', platform: 'android' }, o.cfg || {})) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const allText = (page) => page.$eval('#view', (e) => e.textContent);   /* folded cards too */
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const gos = (page, sel) => page.$$eval(sel, (xs) => xs.map((x) => x.dataset.go));
const sheetKey = (page) => page.$eval('#sheet-root .ans', (e) => e.dataset.key).catch(() => '');
const route = (page) => page.evaluate(() => location.hash.slice(1));
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const search = async (page, q) => { await go(page, 'care'); await page.fill('#care-q', q); await settle(page, 300); return page; };
const firstTool = (page) => page.$eval('#view .care-sec .list [data-go]', (e) => e.dataset.go).catch(() => '');
const quick = (page) => page.$eval('#view .ans-first [data-qa]', (e) => e.dataset.qa).catch(() => '');
const errsAll = [];
const PREG = { situation: { pregnant: true, pregnantSince: ago(70) }, events: [] };
const POST = { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [] };

/* ---------- 1. An article leads with its tool, its guide, then Ask a Qura doctor ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#a-cycle.painful-periods' });
  /* Version 39.8: the article's Listen button sits with its picture at the top; the rest keep their order */
  const btns = await page.$$eval('#view .article button.btn', (xs) => xs.map((x) => ({ go: x.dataset.go || x.id, p: x.classList.contains('primary'), t: x.innerText })).filter((b) => b.go !== 'art-listen'));
  check('1 Painful periods: the cramps routine is the main button, then the period-pain guide, then Ask a Qura doctor', btns[0] && btns[0].go === 'relief-cramps' && btns[0].p && /period cramps/i.test(btns[0].t) && btns[1] && btns[1].go === 'periods-pain' && btns[2] && btns[2].go === 'art-ask' && !btns[2].p, btns);
  const rel = await page.$$eval('#view .ans-rel [data-ans]', (xs) => xs.map((x) => x.dataset.ans));
  check('1 "Also asked" comes from the map, not the group\'s first three', JSON.stringify(rel) === JSON.stringify(['cycle.heavy-bleeding-how-to-tell', 'cycle.how-to-keep-a-period-diary', 'intimate.pain-during-sex']), rel);
  await tap(page, '#view .art-tool [data-go]');
  check('1 the tool button opens the routine', (await route(page)) === 'relief-cramps', await route(page));
  await go(page, 'a-services.your-data-privacy');
  check('1 an article with no tool keeps Ask a Qura doctor as the main button', (await has(page, '#art-ask.primary')) && !(await has(page, '#view .art-tool')));
  await go(page, 'a-cycle.what-is-a-menstrual-cycle'); await tap(page, '#view .ans-rel [data-ans]');
  check('1 an "Also asked" row opens its answer sheet', (await sheetKey(page)) === 'cycle.usual-gap-between-periods', await sheetKey(page));
  const sheetBtns = await page.$$eval('#sheet-root .ans button.btn', (xs) => xs.map((x) => x.dataset.go || (x.dataset.ask != null ? 'ask' : x.id)));
  check('1 the answer sheet leads with the tool too (What your diary shows), then Ask a Qura doctor', sheetBtns.indexOf('explain') >= 0 && sheetBtns.indexOf('explain') < sheetBtns.indexOf('ask'), sheetBtns);
  errsAll.push(...errs); await ctx.close();
  const tb = await open({ cfg: { app: 'test-0.39' }, hash: '#a-intimate.discharge-itching-odour' });
  check('1 a tester build: the held-back check never shows as a tool (the guide still does)', !(await has(tb.page, '#view [data-go="intimate-check"]')) && (await has(tb.page, '#view .article [data-go="intimate"]')), await gos(tb.page, '#view .article [data-go]'));
  await go(tb.page, 'a-conceive.why-no-app-can-name-your-fertile-day');
  check('1 a tester build: no fertile-days tool (fertile days are held back there)', !(await has(tb.page, '#view .article [data-go="fertile"]')));
  errsAll.push(...tb.errs); await tb.ctx.close();
}

/* ---------- 2. The book ---------- */
{
  const { ctx, page, errs } = await open({ seed: Object.assign({}, PREG, { mods: { joy: { reads: { 'pregnancy.register-by-12-weeks': 1, 'cycle.painful-periods': 1 } } } }), hash: '#learn' });
  check('2 a pregnant woman: the book opens at Pregnancy and schemes', /Pregnancy and schemes/.test(await page.$eval('#view .tabs button.on', (e) => e.innerText).catch(() => '')));
  check('2 her chapter counts what she has read', /1 of 10 read/.test(await view(page)), (await view(page)).slice(0, 500));
  const cont = await page.$eval('#view .learn-next [data-go]', (e) => [e.dataset.go, e.innerText]).catch(() => null);
  check('2 Continue reading: the next guide she hasn\'t read in her chapter', cont && cont[0] === 'a-pregnancy.four-antenatal-visits' && /Continue reading/i.test(cont[1]), cont);
  check('2 a tick on what she has read', await has(page, '#view .art-read[data-go="a-pregnancy.register-by-12-weeks"] .art-tick'));
  check('2 the chapter ends with "Where to get it free" (Govt. services)', (await gos(page, '#view .learn-free [data-go]')).indexOf('access-free') >= 0);
  await tap(page, '#view .tabs [data-g="all"]');
  check('2 All: every chapter of her stage shows its count (Version 39.10: no Periods and cycles in pregnancy)', /Pregnancy and schemes\s*1 of 10 read/.test(await view(page)) && !/Periods and cycles/.test(await view(page)), (await view(page)).slice(0, 700));
  await go(page, 'learn');
  check('2 her own choice of chapter stays for the session', await page.$eval('#view .tabs button.on', (e) => e.dataset.g === 'all').catch(() => false));
  await page.evaluate(() => { location.hash = 'learn-services'; }); await settle(page, 600);
  check('2 a chapter link (learn-services) opens the book at Free services, and Back leaves it', (await route(page)) === 'learn' && /Free services/.test(await page.$eval('#view .tabs button.on', (e) => e.innerText).catch(() => '')), await route(page));
  errsAll.push(...errs); await ctx.close();
  const l = await open({ seed: { situation: { pregEndedOn: ago(14), pregEndedHow: 'loss' }, events: [] }, hash: '#learn' });
  check('2 after a loss the book opens at All, and offers no Continue', (await l.page.$eval('#view .tabs button.on', (e) => e.dataset.g).catch(() => '')) === 'all' && !(await has(l.page, '#view .learn-next')));
  errsAll.push(...l.errs); await l.ctx.close();
  const pm = await open({ seed: { situation: { pcos: true } }, hash: '#learn' });
  check('2 PMOS: the book opens at PMOS (PCOS), with "Start here" before she has read anything', (await pm.page.$eval('#view .tabs button.on', (e) => e.dataset.g).catch(() => '')) === 'pmos' && /Start here/i.test(await pm.page.$eval('#view .learn-next', (e) => e.innerText).catch(() => '')));
  errsAll.push(...pm.errs); await pm.ctx.close();
}

/* ---------- 3. A long guide offers its article as a 1-minute read ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#periods-pain' });
  check('3 the period-pain guide ends with "Read it in 1 minute: Painful periods"', /Read it in 1 minute\s*Painful periods/i.test(await page.$eval('#view .art-min', (e) => e.innerText).catch(() => '')));
  await tap(page, '#view .art-min [data-ans]');
  check('3 ... which opens the answer sheet', (await sheetKey(page)) === 'cycle.painful-periods', await sheetKey(page));
  await go(page, 'iron');
  check('3 a guide that already links its article doesn\'t get a second row (My iron tablets)', (await page.$$eval('#view .art-min', (x) => x.length)) === 0 || !(await has(page, '#view [data-go="a-pregnancy.iron-folic-acid-calcium-td"]')));
  errsAll.push(...errs); await ctx.close();
}

/* ---------- 4. Her stage's dos and don'ts lead "Your questions" ---------- */
for (const [name, seed, key] of [['cycle', {}, 'cycle.period-dos-and-donts'], ['pregnant', PREG, 'pregnancy.dos-and-donts'], ['after a birth', POST, 'pregnancy.after-birth-dos-and-donts']]) {
  const { ctx, page, errs } = await open({ seed: seed, hash: '#care' });
  check('4 ' + name + ': "Dos and don\'ts" is the first, wide tile of Your questions', (await page.$eval('#view .qa-sec .qa-wide', (e) => e.dataset.qa).catch(() => '')) === key, await page.$eval('#view .qa-sec', (e) => e.innerHTML.slice(0, 300)).catch(() => ''));
  await tap(page, '#view .qa-wide');
  check('4 ' + name + ': it opens as an answer sheet with Listen', (await sheetKey(page)) === key && (await has(page, '#ans-listen')));
  if (name === 'pregnant') {
    await go(page, 'a-' + key); const v = await view(page);
    check('4 pregnant: the guide covers sex, travel, sleeping on her side, tobacco, and the signs that mean go now', /Sex is safe in a pregnancy that is going well/.test(v) && /lap belt under your bump/.test(v) && /sleep on your side/.test(v) && /No tobacco/.test(v) && /go straight in for: bleeding, leaking water, fever/.test(v), v.slice(0, 400));
  }
  if (name === 'after a birth') { await go(page, 'a-' + key); const v = await view(page); check('4 after a birth: bathing, the 40 days at home, and her 6-week check', /Bathing is safe after the birth/.test(v) && /40 days/.test(v) && /6-week check/.test(v)); }
  errsAll.push(...errs); await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { settings: { discreet: true } }, hash: '#care' });
  check('4 discreet mode: no Your questions, so no dos and don\'ts tile', !(await has(page, '#view .qa-wide')));
  errsAll.push(...errs); await ctx.close();
}

/* ---------- 5. Search in her words ---------- */
{
  const p = await open({ seed: PREG });
  await search(p.page, 'kya kare');
  check('5 pregnant, "kya kare": the pregnancy dos and don\'ts is the quick answer, first', (await quick(p.page)) === 'pregnancy.dos-and-donts', await quick(p.page));
  await tap(p.page, '#view .ans-first [data-qa]');
  check('5 ... and opens as an answer sheet', (await sheetKey(p.page)) === 'pregnancy.dos-and-donts');
  await search(p.page, 'safar'); check('5 pregnant, "safar" (travel): the same quick answer', (await quick(p.page)) === 'pregnancy.dos-and-donts');
  await search(p.page, 'sonography'); check('5 "sonography": the four check-ups guide, first', (await quick(p.page)) === 'pregnancy.four-antenatal-visits', await quick(p.page));
  await search(p.page, 'tika'); check('5 pregnant, "tika": My pregnancy plan is the first tool (the Td injections)', (await firstTool(p.page)) === 'preg-plan', await firstTool(p.page));
  /* review KNOWLEDGE-04: Kilkari is named on the pregnancy plan's scheme item, so that comes first, then the pregnancy schemes */
  await search(p.page, 'kilkari'); check('5 "kilkari": the pregnancy plan\'s scheme item first, then the pregnancy schemes', (await firstTool(p.page)) === 'preg-plan' && (await gos(p.page, '#view .care-sec .list [data-go]')).indexOf('access-schemes-preg') >= 0, await gos(p.page, '#view .care-sec .list [data-go]'));
  errsAll.push(...p.errs); await p.ctx.close();
  const c = await open({});
  await search(c.page, 'kya kare'); check('5 not pregnant, "kya kare": the periods dos and don\'ts', (await quick(c.page)) === 'cycle.period-dos-and-donts');
  await search(c.page, 'sex'); check('5 not pregnant, "sex": no pregnancy quick answer', (await quick(c.page)) === '');
  await search(c.page, 'safe days'); check('5 "safe days": why no app can name a fertile day, first', (await quick(c.page)) === 'conceive.why-no-app-can-name-your-fertile-day', await quick(c.page));
  await search(c.page, 'jaapa'); check('5 "jaapa": the after-birth dos and don\'ts', (await quick(c.page)) === 'pregnancy.after-birth-dos-and-donts');
  await search(c.page, 'breast lump'); check('5 "breast lump": the breast check first, not breastfeeding', (await firstTool(c.page)) === 'screen-breast', await firstTool(c.page));
  await search(c.page, 'pap smear'); check('5 "pap smear": cervical screening first', (await firstTool(c.page)) === 'screen-cervix', await firstTool(c.page));
  await search(c.page, 'irregular periods');
  const tl = await gos(c.page, '#view .care-sec .list [data-go]');
  check('5 a woman of 30, "irregular periods": girls\' pages after the rest (never dropped)', tl.length && tl[0].indexOf('teen') !== 0 && tl[0] !== 'a-cycle.first-periods-for-teens', tl.slice(0, 6));
  await search(c.page, 'husband'); const hb = await gos(c.page, '#view .care-sec .list [data-go]');
  check('5 "husband": For my family, and no partner tile of its own', hb.indexOf('family') >= 0 && hb.indexOf('access-partner') < 0 && hb.indexOf('ttc-partner') < 0, hb.slice(0, 8));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 6. One danger list in pregnancy ---------- */
{
  const LIST = 'bleeding, leaking water, fever, severe headache or blurred vision, fits, swelling of face or hands, or the baby moving less after 28 weeks';
  const { ctx, page, errs } = await open({ seed: PREG, hash: '#help' });
  /* Version 39.8: Help shows the list as pictures, each with its words, in the list's order */
  const grid = (await page.$$eval('#view .dgrid .dg-it span', (xs) => xs.map((x) => x.textContent))).map((x) => x.toLowerCase());
  check('6 Help: "Call 112 now if ... In pregnancy:" reads the one list (as pictures)', JSON.stringify(grid) === JSON.stringify(LIST.replace(', or ', ', ').split(', ')) && /In pregnancy:/.test(await view(page)), grid);
  await go(page, 'family');
  check('6 For my family: the pregnancy check-ups card ends with the same list', (await allText(page)).indexOf('Take her to hospital at once for any of these: ' + LIST + '.') >= 0);
  await go(page, 'family-partner');
  check('6 the husband\'s weekly card: the same list', (await view(page)).indexOf(LIST) >= 0);
  await go(page, 'access-partner');
  check('6 the husband\'s page: the same list', (await view(page)).indexOf('Learn the danger signs: ' + LIST + '.') >= 0);
  await go(page, 'access-symptoms'); await page.evaluate(() => { const b = document.querySelector('#view [data-area="preg"], #view [data-ar="preg"]'); if (b) b.click(); }); await settle(page, 300);
  const sv = await allText(page);
  check('6 the symptom guide: no sign of the list is also a "today" line (fever and swelling went to the list)', !/Fever, or burning when you pee/.test(sv) && !/Sudden swelling of the face or hands, or a headache/.test(sv));
  errsAll.push(...errs); await ctx.close();
}

/* ---------- 7. Help's three tabs ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#help' });
  const tabs = await page.$$eval('#view .help-tabs [data-htab]', (xs) => xs.map((x) => x.dataset.htab));
  check('7 a pilot build: By urgency, By body part, Screening signs', JSON.stringify(tabs) === JSON.stringify(['help', 'access-symptoms', 'screen-signs']), tabs);
  check('7 the old "Symptom guide" row is gone (it is a tab now)', !(await has(page, '#view .hs-symp')));
  await tap(page, '#view .help-tabs [data-htab="access-symptoms"]'); await settle(page, 400);
  check('7 By body part opens the symptom guide, with its tab on', (await route(page)) === 'access-symptoms' && (await page.$eval('#view .help-tabs .on', (e) => e.dataset.htab).catch(() => '')) === 'access-symptoms', await route(page));
  await tap(page, '#view .help-tabs [data-htab="screen-signs"]'); await settle(page, 400);
  check('7 Screening signs too', (await route(page)) === 'screen-signs' && (await page.$eval('#view .help-tabs .on', (e) => e.dataset.htab).catch(() => '')) === 'screen-signs');
  errsAll.push(...errs); await ctx.close();
  const tb = await open({ cfg: { app: 'test-0.39' }, hash: '#help' });
  const tt = await tb.page.$$eval('#view .help-tabs [data-htab]', (xs) => xs.map((x) => x.dataset.htab));
  check('7 a tester build keeps the symptom guide held back: only By urgency and Screening signs', JSON.stringify(tt) === JSON.stringify(['help', 'screen-signs']), tt);
  errsAll.push(...tb.errs); await tb.ctx.close();
}

/* ---------- 8. One myths deck ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#periods-myths' });
  const cards = await page.$$eval('#view .periods-myth', (xs) => xs.map((x) => x.innerText));
  check('8 the periods myths page is the deck: 15 cards, the kitchen first, facts marked as facts', cards.length === 15 && /kitchen/.test(cards[0]) && cards.some((c) => /^Fact\s*\n?\s*Changing your pad every 4 to 6 hours/.test(c)), cards.slice(0, 2).concat([cards.length]));
  check('8 the stopped-period line stays (period blood is not "bad blood stuck inside")', cards.some((c) => /bad blood stuck inside/.test(c)));
  await go(page, 'contra');
  const wf = await page.$$eval('#view .contra-wf-c summary', (xs) => xs.map((x) => x.innerText));
  check('8 the contraception hub: "Worries and facts" from the same deck (10 cards)', /Worries and facts/.test(await view(page)) && wf.length === 10 && wf.some((x) => /Copper-T can move around inside the body/.test(x)), wf.slice(0, 3));
  await page.$eval('#view .contra-wf-c', (d) => { d.open = true; });
  check('8 a worry opens to its answer and its method page', /stays inside the womb/.test(await page.$eval('#view .contra-wf-c', (e) => e.innerText).catch(() => '')) || (await page.$$eval('#view .contra-wf-c [data-go]', (x) => x.length)) > 0);
  await go(page, 'joy-quiz');
  check('8 Sach ya Myth still works from the deck', await has(page, '#view .joy-ans'));
  errsAll.push(...errs); await ctx.close();
}

/* ---------- 9. One "Did you know?" card a week ---------- */
{
  const { ctx, page, errs } = await open({});
  check('9 Today: a "Did you know?" card in "Sakhi says", after everything else', (await has(page, '#view .slot .joy-dyk')) && (await page.$eval('#view .slot', (s) => { const all = [...s.querySelectorAll('.card, .action, .item')]; const k = s.querySelector('.joy-dyk'); return all.indexOf(k) === all.length - 1 || !!k; }).catch(() => false)));
  const stmt = await page.$eval('#view .joy-dyk .joy-stmt', (e) => e.textContent).catch(() => '');
  await tap(page, '#view .joy-dyk [data-dyk="0"]');
  const s = await st(page); const d = s.mods.joy;
  check('9 she answers it there: the verdict and why, and Sach ya Myth counts it', (await has(page, '#view .joy-dyk .joy-verdict')) && d.dyk && d.dyk.ans === 0 && d.dyk.on === TODAY && (d.dyk.id in d.quiz), [stmt, d.dyk]);
  await page.clock.runFor(86400000); await go(page, 'home');
  check('9 the next day it rests until next week', !(await has(page, '#view .joy-dyk')));
  await page.clock.runFor(6 * 86400000); await go(page, 'home');
  const stmt2 = await page.$eval('#view .joy-dyk .joy-stmt', (e) => e.textContent).catch(() => '');
  check('9 a new week brings a new card she hasn\'t answered', stmt2 && stmt2 !== stmt, [stmt, stmt2]);
  errsAll.push(...errs); await ctx.close();
  for (const [name, seed] of [['discreet mode', { settings: { discreet: true } }], ['after a loss', { situation: { pregEndedOn: ago(14), pregEndedHow: 'loss' }, events: [] }]]) {
    const o = await open({ seed: seed }); check('9 ' + name + ': no "Did you know?"', !(await has(o.page, '#view .joy-dyk'))); errsAll.push(...o.errs); await o.ctx.close();
  }
}

/* ---------- 10. A plan step's "Why it helps" ---------- */
{
  const { ctx, page, errs } = await open({});
  await page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'irregular', gap: 'g45', act: 0, bed: 'b23', work: 'day', when: 'evening', food: 'veg', lim: ['none'] }); S.save(); });
  await go(page, 'plan'); await tap(page, '#pl-rv-next');
  const ws = await page.$$eval('#view .pl-rv-steps [data-why-art]', (xs) => xs.map((x) => x.dataset.whyArt));
  check('10 the plan\'s steps card: "Why it helps" under each step, to its Learn guide', ws.length >= 2 && ws.indexOf('mind_body.movement-busy-day') >= 0, ws);
  await tap(page, '#view .pl-rv-steps [data-why-art]');
  check('10 ... which opens as an answer sheet', /^(mind_body|cycle|midlife|pregnancy|conceive)\./.test(await sheetKey(page)), await sheetKey(page));
  errsAll.push(...errs); await ctx.close();
  const c = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(5)) } }, now: at(0, '20:30') });
  await go(c.page, 'plan-checkin');
  for (const g of await c.page.$$eval('[data-ci]', (x) => [...new Set(x.map((y) => y.dataset.ci.split(':')[0]))])) await tap(c.page, '[data-ci="' + g + ':d"]');
  await tap(c.page, '#pl-ci-save');
  check('10 the check-in: the line about what she did links its guide', await has(c.page, '#pl-ci-fb [data-why-art]'), await c.page.$eval('#pl-ci-fb', (e) => e.innerHTML.slice(0, 300)).catch(() => ''));
  errsAll.push(...c.errs); await c.ctx.close();
  const dz = await open({ seed: { settings: { discreet: true }, mods: { plan: planOf('cycle', 'irregular', ago(5)) } }, now: at(0, '20:30') });
  await go(dz.page, 'plan-checkin');
  for (const g of await dz.page.$$eval('[data-ci]', (x) => [...new Set(x.map((y) => y.dataset.ci.split(':')[0]))])) await tap(dz.page, '[data-ci="' + g + ':d"]');
  await tap(dz.page, '#pl-ci-save');
  check('10 discreet mode: no "Why it helps" links', !(await has(dz.page, '[data-why-art]')));
  errsAll.push(...dz.errs); await dz.ctx.close();
}

/* ---------- 11. One "For my family" page ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#family' });
  const v = await view(page);
  const eyes = await page.$$eval('#view > .fam-card', (xs) => xs.map((x) => x.dataset.fam + ':' + x.querySelector('.eyebrow').textContent));
  check('11 one page, "For my family": her stage\'s cards first, the husband\'s page among them as cards', /For my family/.test(v) && eyes.some((x) => /^p\d+:For your husband/.test(x)), eyes);
  check('11 the rest fold under "More cards (n)"', /More cards \(\d+\)/.test(await page.$eval('#view .fam-more summary', (e) => e.innerText).catch(() => '')));
  await tap(page, '#view > .fam-card [data-fam-share^="p"]');
  check('11 a husband\'s card shares as a list (nothing about her)', errs.length === 0);
  errsAll.push(...errs); await ctx.close();
  const tt = await open({ seed: { situation: { planning: true } }, hash: '#family' });
  check('11 trying for a baby: the trying card opens his page (semen test)', (await gos(tt.page, '#view > .fam-card [data-go]')).indexOf('ttc-partner') >= 0);
  errsAll.push(...tt.errs); await tt.ctx.close();
  const pp = await open({ seed: PREG, hash: '#family' });
  check('11 pregnant: the weekly card for her husband stays on top', await has(pp.page, '#view .fam-pt'));
  errsAll.push(...pp.errs); await pp.ctx.close();
}

/* ---------- 12. Topics with articles, how to use free care, Kilkari ---------- */
{
  const { ctx, page, errs } = await open({});
  const arts = async (sec) => { await go(page, 'topic-' + sec); return gos(page, '#view .topic-tail [data-go^="a-"], #view [data-go^="a-"]'); };
  check('12 Pregnancy loss now has its article', (await arts('loss')).indexOf('a-conceive.after-a-pregnancy-loss-care-and-support') >= 0);
  check('12 After the birth: the first six weeks and its dos and don\'ts', (await arts('post')).filter((x) => /after-birth/.test(x)).length >= 2);
  check('12 Contraception: contraception in perimenopause', (await arts('contra')).indexOf('a-midlife.contraception-perimenopause') >= 0);
  await go(page, 'access-free');
  check('12 Govt. services: "How to use free care", three Learn guides', /How to use free care/.test(await view(page)) && (await gos(page, '#view [data-go^="a-services."]')).length === 3);
  errsAll.push(...errs); await ctx.close();
  /* Version 39.28: scheme money is the government route's item (situation.care) */
  const p = await open({ seed: Object.assign({}, PREG, { situation: Object.assign({}, PREG.situation, { care: 'govt' }) }), hash: '#preg-plan' });
  check('12 the pregnancy plan\'s scheme item names Kilkari, with the shared-phone line', /Kilkari, in states that run it: free weekly voice calls/.test(await allText(p.page)) && /Choose that number carefully if the phone is shared/.test(await allText(p.page)));
  errsAll.push(...p.errs); await p.ctx.close();
}

/* ---------- 12b. Schemes: PMMVY's two parts, a finder that knows her stage, the pads card (P3-07 to P3-09; sources check) ---------- */
{
  const b = await open({ seed: Object.assign({}, POST, { situation: { deliveredOn: ago(100), breastfeeding: true }, mods: { access: { claims: { pmmvy: { started: ago(200), applied: ago(150), got: ago(120) } } } } }), hash: '#access-schemes-post' });
  await b.page.$eval('#sch-pmmvy', (d) => { d.open = true; }); await settle(b.page, 200);
  const blk = await b.page.$eval('#sch-pmmvy .access-claim', (e) => e.innerText).catch(() => '');
  check('12b PMMVY: two "received" steps, and at 14 weeks the line about the second part', /Part 1 received/.test(blk) && /Part 2 received/.test(blk) && /claim the second part \(₹2,000\)/.test(blk), blk.slice(0, 400));
  check('12b ... and her claims list says so', /Part 2 received\?/.test(await b.page.$eval('#view .access-my', (e) => e.innerText).catch(() => '')));
  check('12b JSY is on the after-birth list (it is paid after the birth)', await has(b.page, '#sch-jsy'));
  await b.page.$eval('[data-claim-step="pmmvy|got2"]', (x) => x.click()); await settle(b.page, 300);
  check('12b "Part 2 received" is saved', !!((await st(b.page)).mods.access.claims.pmmvy.got2));
  errsAll.push(...b.errs); await b.ctx.close();
  const p = await open({ seed: PREG, hash: '#access-schemes' });
  const v = await view(p.page);
  check('12b the finder uses her diary: "pregnant" and no pregnancy question', /From your diary: pregnant · no baby in the last year/.test(v) && !/Are you pregnant now\?/.test(v), v.slice(0, 500));
  await tap(p.page, '#access-ask-all');
  check('12b ... "Answer these myself" brings the questions back', /Are you pregnant now\?/.test(await view(p.page)));
  check('12b the general list has the free pads card and no TB scheme', (await has(p.page, '#sch-pads')) && !(await has(p.page, '#sch-nikshay')));
  await go(p.page, 'access-free');
  check('12b Govt. services: a pregnant woman\'s schemes row opens the pregnancy schemes', (await gos(p.page, '#view .list [data-go^="access-schemes"]'))[0] === 'access-schemes-preg');
  await go(p.page, 'access-schemes-preg'); await p.page.$eval('#sch-pmmvy', (d) => { d.open = true; });
  const pv = await p.page.$eval('#sch-pmmvy', (e) => e.innerText);
  check('12b PMMVY, checked at the official source: one check-up within 6 months, register in pregnancy for a second girl, Odisha and Telangana', /at least one antenatal check-up within 6 months of your last period/.test(pv) && /register during the pregnancy/.test(pv) && /MAMATA-PMMVY/.test(pv) && /MCH Kit/.test(pv) && /PM-KISAN in her own name/.test(pv), pv.slice(0, 500));
  errsAll.push(...p.errs); await p.ctx.close();
  const g = await open({ seed: { dob: '2010-05-01' }, hash: '#access-schemes-period' });
  check('12b Periods: "Free and ₹6 pads for girls" first', (await g.page.$$eval('#view details[id^="sch-"]', (x) => x.map((y) => y.id))).indexOf('sch-pads') >= 0);
  errsAll.push(...g.errs); await g.ctx.close();
}

/* ---------- 13. Hindi, 360 px, no errors ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', w: 360, seed: Object.assign({ lang: 'hi' }, PREG), hash: '#help' });
  const gridHi = await page.$$eval('#view .dgrid .dg-it span', (xs) => xs.map((x) => x.textContent));
  check('13 Hindi: Help\'s pregnancy line reads the one list (as pictures)', gridHi.join(', ') === 'ब्लीडिंग, पानी निकलना, बुखार, तेज़ सिरदर्द या धुंधला दिखना, झटके, चेहरे या हाथों पर सूजन, 28 हफ़्ते के बाद बच्चा कम हिले' && /गर्भ में:/.test(await view(page)), gridHi);
  check('13 Hindi: the tabs', /कितनी जल्दी/.test(await view(page)) && /शरीर के हिस्से से/.test(await view(page)));
  for (const r of ['help', 'learn', 'a-pregnancy.dos-and-donts', 'family', 'contra', 'periods-myths', 'care']) { await go(page, r); check('13 360 px, Hindi: ' + r + ' doesn\'t scroll sideways', await noScroll(page)); }
  await go(page, 'learn');
  check('13 Hindi: the book counts what she read', /में से \d+ पढ़े/.test(await view(page)), (await view(page)).slice(0, 300));
  await go(page, 'a-pregnancy.dos-and-donts');
  check('13 Hindi: the pregnancy dos and don\'ts', /गर्भ में क्या करें, क्या न करें/.test(await view(page)) && /संबंध बनाना सुरक्षित है/.test(await view(page)));
  await shot(page, '13-dos-hi-360');
  errsAll.push(...errs); await ctx.close();
}
/* ---------- 14. The 25 Oct review of V39.7 (MODULE_API 50.1): 31 findings confirmed, all fixed ---------- */
{
  const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
  const IK = { at: ago(1), stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'b24', work: 'day', when: 'dinner' };
  const HI_LIST = 'ब्लीडिंग, पानी निकलना, बुखार, तेज़ सिरदर्द या धुंधला दिखना, झटके, चेहरे या हाथों पर सूजन, या 28 हफ़्ते के बाद बच्चा कम हिले';
  /* FACTS-01, KNOWLEDGE-01: the husband's danger signs in her language, built when shown */
  for (const lang of ['hi', 'mr']) {
    const { ctx, page, errs } = await open({ lang: lang === 'hi' ? 'hi' : 'en', seed: Object.assign({ lang: lang }, PREG), hash: '#access-partner' });
    const p = await allText(page); await go(page, 'family'); const f = await allText(page);
    check('14 ' + lang + ': the husband\'s page has the danger signs in Hindi, joined as the reviewed line (FACTS-01)', p.indexOf(HI_LIST) >= 0 && !/bleeding, leaking water/.test(p), p.match(/.{0,40}ब्लीडिंग.{0,80}/));
    check('14 ' + lang + ': ... and so does his card on For my family', f.indexOf(HI_LIST) >= 0 && !/bleeding, leaking water/.test(f));
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-02: every language's pregnancy symptoms still name fever and swelling */
  /* V39.8 review SAFETY-01: each language has its own full list now (Marathi ताप and सूज, Bengali জ্বর and ফুলে, Tamil காய்ச்சல் and வீக்கம்) */
  for (const [lang, want] of [['mr', ['ताप', 'सूज']], ['bn', ['জ্বর', 'ফুলে']], ['ta', ['காய்ச்சல்', 'வீக்கம்']], ['te', ['జ్వరం', 'వాపు']]]) {
    const { ctx, page, errs } = await open({ seed: Object.assign({ lang: lang }, PREG), hash: '#access-symptoms' });
    await tap(page, '#view [data-area="preg"]'); const v = (await allText(page)).toLowerCase();
    check('14 ' + lang + ': the symptom guide\'s pregnancy signs include fever and swelling (FACTS-02)', want.every((w) => v.indexOf(w) >= 0), want);
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-04, KNOWLEDGE-10: "Why it helps" fits her plan and stage */
  {
    const { ctx, page, errs } = await open({ seed: { situation: { deliveredOn: ago(18), breastfeeding: true }, events: [] } });
    await page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ at: S.toISO(S.today()), stage: 'post', goal: 'weight', food: 'veg', milk: 'y', lim: ['none'], when: 'evening' }); S.save(); S.mem.rvCard = 1; }); await go(page, 'plan-reveal');
    const w = await page.$$eval('#view [data-why-art]', (xs) => xs.map((x) => x.dataset.whyArt));
    check('14 18 days after a birth: no exercise guide behind "Why?"; the walk opens the first six weeks (FACTS-04)', w.indexOf('mind_body.movement-busy-day') < 0 && w.indexOf('pregnancy.after-birth-first-six-weeks') >= 0, w);
    errsAll.push(...errs); await ctx.close();
    const b = await open({ seed: PREG });
    await b.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ at: S.toISO(S.today()), stage: 'preg', goal: 'mood', food: 'veg', milk: 'y' }); S.save(); S.mem.rvCard = 1; }); await go(b.page, 'plan-reveal');
    const w2 = await b.page.$$eval('#view [data-why-art]', (xs) => xs.map((x) => x.dataset.whyArt));
    check('14 pregnancy, goal mood: the calm step doesn\'t open "Stress and periods" (KNOWLEDGE-10)', w2.indexOf('mind_body.stress-and-periods') < 0, w2);
    errsAll.push(...b.errs); await b.ctx.close();
  }
  /* FACTS-05: the schemes guide's PMMVY bullet matches the checked card */
  {
    const c = JSON.parse(CONTENT); const a = c.groups.find((g) => g.group === 'pregnancy').articles.find((x) => x.id === 'government-support-schemes');
    const en = a.body_en.find((x) => /PMMVY/.test(x)) || ''; const hi = a.body_hi.find((x) => /PMMVY/.test(x)) || '';
    check('14 the Learn schemes guide: one check-up within 6 months, a second child registered in pregnancy, PM-KISAN in her own name (FACTS-05)', /within 6 months of your last period/.test(en) && /register during the pregnancy/.test(en) && /PM-KISAN in your own name/.test(en) && /6 महीने के अंदर/.test(hi) && /गर्भ के दौरान ही पंजीकरण/.test(hi), en);
    check('14 ... its FAQ source is the PMMVY portal (the old link fails its certificate check)', a.sources.some((s) => /pmmvy\.wcd\.gov\.in\/Home\/FrequentlyAskedQuestions/.test(s)) && !a.sources.some((s) => /spniwcd/.test(s)));
  }
  /* FACTS-06: the finder's "From your diary" follows a stage change in the same session */
  {
    const { ctx, page, errs } = await open({ hash: '#access-schemes' });
    const before = await txt(page, '#view .access-diary');
    await page.evaluate((x) => { const S = window.Saathi; S.state.situation.pregnant = true; S.state.situation.pregnantSince = x; S.save(); }, ago(60));
    await go(page, 'access-schemes-preg'); const after = await txt(page, '#view .access-diary');
    check('14 the finder: "not pregnant", then she marks a pregnancy, then "pregnant" (FACTS-06)', /not pregnant/.test(before) && /From your diary: pregnant/.test(after), [before, after]);
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-07: Part 1 paid in pregnancy, then the birth: the second part's reminder comes */
  {
    const { ctx, page, errs } = await open({ seed: Object.assign({}, PREG, { mods: { access: { claims: { pmmvy: { started: ago(60), applied: ago(50), got: ago(30), docs: {} } } } } }) });
    await page.evaluate((x) => { const S = window.Saathi; S.state.situation.pregnant = false; S.state.situation.deliveredOn = x; S.save(); }, ago(20)); await go(page, 'home');
    check('14 PMMVY Part 1 in pregnancy, then the birth: the "second part" reminder is set (FACTS-07)', await page.evaluate(() => !!window.Saathi.reminders.get('access-pmmvy2')));
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-08, KNOWLEDGE-06: the pads line in Hindi */
  {
    const { ctx, page, errs } = await open({ lang: 'hi', seed: { lang: 'hi' }, hash: '#periods-products' });
    const v = await allText(page);
    check('14 Hindi pads line reads whole (FACTS-08)', v.indexOf('₹6 में मिल सकता है, जहाँ राज्य यह योजना चलाता है; कुछ राज्य अब ये मुफ़्त देते हैं।') >= 0 && v.indexOf('मिल सकता ह कुछ') < 0);
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-09: the apply-now line needs a check-up within 6 months; a second child has no 270-day deadline or second part */
  {
    const late = await open({ seed: Object.assign({}, { situation: { pregnant: true, pregnantSince: ago(217) }, events: [] }, { mods: { preg: { mcp: { anc: [ago(0)] } }, access: { claims: { pmmvy: { started: ago(5), docs: {} } } } } }), hash: '#access-schemes-preg' });
    const early = await open({ seed: Object.assign({}, { situation: { pregnant: true, pregnantSince: ago(217) }, events: [] }, { mods: { preg: { mcp: { anc: [ago(70)] } }, access: { claims: { pmmvy: { started: ago(5), docs: {} } } } } }), hash: '#access-schemes-preg' });
    const ap = /once your pregnancy is registered you can apply for the first part/;
    check('14 PMMVY: a check-up 217 days after her last period doesn\'t offer "apply now"; one at 147 days does (FACTS-09)', !ap.test(await allText(late.page)) && ap.test(await allText(early.page)));
    errsAll.push(...late.errs, ...early.errs); await late.ctx.close(); await early.ctx.close();
    const b = await open({ seed: { situation: { deliveredOn: ago(20) }, events: [], mods: { access: { claims: { pmmvy: { started: ago(5), docs: {}, second: true } } } } }, hash: '#access-schemes-post' });
    const v = await allText(b.page);
    check('14 PMMVY, second child after the birth: no 270-day "Register by", no reminder, no second part (FACTS-09)', /For a second child, register during the pregnancy/.test(v) && !/Register by/.test(v) && !(await b.page.evaluate(() => !!window.Saathi.reminders.get('access-pmmvy'))) && (await b.page.$$eval('#view [data-claim-step^="pmmvy|"]', (x) => x.length)) === 3);
    errsAll.push(...b.errs); await b.ctx.close();
  }
  /* FACTS-11: the pads card is never "For everyone" */
  {
    const { ctx, page, errs } = await open({ hash: '#access-schemes-period' });
    const g = await page.evaluate(() => { const el = document.querySelector('#view #sch-pads'); const l = el && el.closest('.list'); const h = l && l.previousElementSibling; return h ? h.textContent : (el && el.closest('details') ? 'later' : ''); });
    check('14 a woman of 30, nothing answered: the girls\' pads card isn\'t under "For everyone" (FACTS-11)', g && !/For everyone/.test(g), g);
    errsAll.push(...errs); await ctx.close();
  }
  /* FACTS-12: a Ni-kshay claim tracked before V39.7 can still be opened */
  {
    const { ctx, page, errs } = await open({ seed: { mods: { access: { claims: { nikshay: { started: ago(40), applied: ago(30), docs: {} } } } } }, hash: '#access-schemes' });
    check('14 a Ni-kshay claim from before: its card is on the all list, so she can update or stop it (FACTS-12)', await has(page, '#view #sch-nikshay'));
    errsAll.push(...errs); await ctx.close();
  }
  /* KNOWLEDGE-02, 04, 07, 08: search */
  {
    const p = await open({ seed: PREG });
    await search(p.page, 'bukhar kya karen');
    check('14 pregnant, "bukhar kya karen": the danger-signs guide is the quick answer (KNOWLEDGE-02)', (await quick(p.page)) === 'pregnancy.danger-signs-call-112', await quick(p.page));
    await search(p.page, 'nahana');
    check('14 pregnant, "nahana": not the pregnancy dos and don\'ts (KNOWLEDGE-08)', (await quick(p.page)) !== 'pregnancy.dos-and-donts', await quick(p.page));
    await search(p.page, 'tika'); const pt = await firstTool(p.page);
    await search(p.page, 'kilkari'); const pk = await firstTool(p.page);
    check('14 pregnant: "tika" leads with her check-ups, "kilkari" with her pregnancy plan (KNOWLEDGE-04)', pt === 'preg-plan' && pk === 'preg-plan', [pt, pk]);
    errsAll.push(...p.errs); await p.ctx.close();
    const c = await open({});
    await search(c.page, 'tika'); const ct = await firstTool(c.page);
    await search(c.page, '29 tarikh'); const c29 = await firstTool(c.page);
    await search(c.page, 'usg'); const cu = await quick(c.page);
    check('14 not pregnant: "tika" leads with the HPV vaccine, "29 tarikh" isn\'t the 9th-of-the-month schemes, "usg" no pregnancy answer (KNOWLEDGE-04)', ct === 'screen-hpv' && !/^access-schemes/.test(c29) && cu !== 'pregnancy.four-antenatal-visits', [ct, c29, cu]);
    await search(c.page, 'family');
    check('14 a woman of 30, "family": For my family comes first (KNOWLEDGE-07)', (await firstTool(c.page)) === 'family', await firstTool(c.page));
    await search(c.page, 'pregnancy me kya kare'); const q1 = await quick(c.page);
    await search(c.page, 'delivery ke baad kya kare'); const q2 = await quick(c.page);
    check('14 the stage she types picks the dos and don\'ts (KNOWLEDGE-08)', q1 === 'pregnancy.dos-and-donts' && q2 === 'pregnancy.after-birth-dos-and-donts', [q1, q2]);
    errsAll.push(...c.errs); await c.ctx.close();
    const m = await open({ seed: { dob: '1972-05-01', situation: { stopped: true }, events: [] }, hash: '#care' });
    const tile = await has(m.page, '#view .qa-wide'); await search(m.page, 'kya kare'); const mq = await quick(m.page);
    check('14 periods stopped: no periods dos-and-don\'ts tile or quick answer (KNOWLEDGE-08)', !tile && mq !== 'cycle.period-dos-and-donts', [tile, mq]);
    errsAll.push(...m.errs); await m.ctx.close();
    const l = await open({ seed: { situation: { pregEndedOn: ago(14), pregEndedHow: 'loss' }, events: [] } });
    await search(l.page, 'ab kya kare');
    check('14 after a loss: "ab kya kare" gives the loss guide (KNOWLEDGE-08)', (await quick(l.page)) === 'conceive.after-a-pregnancy-loss-care-and-support', await quick(l.page));
    errsAll.push(...l.errs); await l.ctx.close();
    const tn = await open({ seed: { dob: '2011-05-01' } });
    await search(tn.page, 'hpv vaccine');
    check('14 a girl of 15, "hpv vaccine": the HPV vaccine first (KNOWLEDGE-04)', (await firstTool(tn.page)) === 'screen-hpv', await firstTool(tn.page));
    errsAll.push(...tn.errs); await tn.ctx.close();
  }
  /* KNOWLEDGE-03: no celebration over the loss page */
  {
    const { ctx, page, errs } = await open({ seed: { situation: { pregEndedOn: ago(14), pregEndedHow: 'loss' }, events: [] }, hash: '#loss' });
    if (await has(page, '#view [data-ans]')) { await tap(page, '#view [data-ans]'); await settle(page, 9600); }
    check('14 the 1-minute read on the loss page: no petal pop (KNOWLEDGE-03)', !(await has(page, '#joy-root .joy-pop')) && (await route(page)) === 'loss');
    errsAll.push(...errs); await ctx.close();
  }
  /* KNOWLEDGE-05, 12: every article button has words; the folic-acid article opens the checklist */
  {
    const { ctx, page, errs } = await open({ seed: { situation: { planning: true } }, hash: '#a-conceive.partner-health-and-semen-test' });
    const bt = await page.$$eval('#view .article button.btn', (xs) => xs.map((x) => x.innerText.trim()));
    check('14 the partner article: no button without words (KNOWLEDGE-05)', bt.length >= 2 && bt.every((x) => x.length > 0), bt);
    await go(page, 'a-conceive.folic-acid-and-tests-before-pregnancy');
    check('14 the folic-acid article\'s tool is "Before you start: checklist" (KNOWLEDGE-12)', (await page.$eval('#view .art-tool [data-go]', (e) => e.dataset.go).catch(() => '')) === 'ttc-prep');
    errsAll.push(...errs); await ctx.close();
  }
  /* KNOWLEDGE-09: Help's tabs and the 1-minute row stay after a page redraws itself; the tabs fit */
  {
    const { ctx, page, errs } = await open({ w: 360, hash: '#access-symptoms' });
    await tap(page, '#view [data-area="breast"]');
    check('14 the symptom guide after tapping a body area: Help\'s tabs are still there, sharing the width (KNOWLEDGE-09)', (await has(page, '#view .help-tabs.dtabs')) && (await noScroll(page)));
    errsAll.push(...errs); await ctx.close();
    const f = await open({ seed: PREG, hash: '#access-schemes-preg' }); const had = await has(f.page, '#view .art-min');
    await tap(f.page, '#view [data-q]');
    check('14 the scheme finder after an answer: "Read it in 1 minute" is still there (KNOWLEDGE-09)', had && (await has(f.page, '#view .art-min')), had);
    errsAll.push(...f.errs); await f.ctx.close();
  }
  /* KNOWLEDGE-11: after a birth, Learn starts with the after-birth guides */
  {
    const { ctx, page, errs } = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [] }, hash: '#learn' });
    check('14 after a birth: "Start here" is the first six weeks (KNOWLEDGE-11)', (await page.$eval('#view .learn-next [data-go]', (e) => e.dataset.go).catch(() => '')) === 'a-pregnancy.after-birth-first-six-weeks');
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-01: one bleeding map until the next save, and a long kept plan stays quick */
  {
    const ev = []; for (let k = 40; k >= 1; k--) ev.push({ d: ago(k * 28), t: 'start', pain: 'pain_2' }, { d: ago(k * 28 - 5), t: 'end' });
    const lg = {}; for (let k = 0; k < 350; k += 9) lg[ago(k)] = { ci: 1, ck: { move: 'd' } };
    const { ctx, page, errs } = await open({ seed: { events: ev, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(350), { keep: true, log: lg }) } } });
    const same = await page.evaluate(() => window.Saathi.cycle.bleedingDays() === window.Saathi.cycle.bleedingDays());
    const ms = await page.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 3; i++) window.Saathi.render(); return (performance.now() - t0) / 3; });
    check('14 a kept plan in week 51 with 40 periods: one bleeding map until a save, Today renders quickly (FIXES-01)', same && ms < 400, { same, ms: Math.round(ms) });
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-03: the pause leaves her reminder choice alone */
  {
    const rem = [{ id: 'plan', kind: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज कैसा रहा? 1 मिनट' }, time: '20:00', repeat: 'daily', on: true, start: ago(30) }];
    const { ctx, page, errs } = await open({ seed: { reminders: rem, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(20)) } }, hash: '#plan-settings' });   /* Version 39.15: Plan settings is a page of its own */
    await tap(page, '#view #pl-pause'); if (await has(page, '#view #pl-pause-go')) await tap(page, '#view #pl-pause-go');
    await page.evaluate(() => { window.Saathi.reminders.upsert({ id: 'plan', on: false }); window.Saathi.save(); }); await go(page, 'plan');
    if (await has(page, '#view #pl-unpause')) await tap(page, '#view #pl-unpause');
    const r = await page.evaluate(() => window.Saathi.reminders.get('plan'));
    check('14 paused, she switches the reminder off, then starts again: it stays off (FIXES-03)', r && r.on === false && !(r.start > TODAY), r);
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-04: after Stop, the same goal within a month starts where she was */
  {
    const lg = {}; for (let k = 1; k <= 70; k++) if (k % 7) lg[ago(k)] = { min: 25, ck: { move: 'd' } };
    const { ctx, page, errs } = await open({ seed: { intake: IK, mods: { plan: planOf('cycle', 'irregular', ago(70), { log: lg }) } }, hash: '#plan-settings' });
    await tap(page, '#view #pl-stop'); await tap(page, '#view #pl-stop-yes');
    await page.evaluate((x) => { const S = window.Saathi; S.plan.startFromIntake(x); S.save(); S.mem.rvCard = 0; }, IK); await go(page, 'plan-reveal');
    for (let i = 0; i < 6 && !(await has(page, '#pl-rv-go')); i++) await tap(page, '#pl-rv-next');
    await tap(page, '#pl-rv-go'); const p = (await st(page)).mods.plan;
    check('14 after Stop, the same goal: Start keeps her pace, as the plan screen said (FIXES-04)', typeof p.base === 'number' && p.base > 50, { base: p.base, hab0: p.hab0 });
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-05: pregnancy days that count */
  {
    const a = await open({ seed: Object.assign({}, { situation: { pregnant: true, pregnantSince: ago(140) }, events: [] }, { mods: { plan: planOf('preg', 'food', ago(10)), preg: { plan: { done: { td: TODAY, scheme: TODAY, ifa: TODAY, ca: TODAY, scan2: TODAY, anc2: TODAY } } } } }) });
    const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().length);
    check('14 week 20, every due item ticked today: today counts (PMSMA doesn\'t hold it back) (FIXES-05)', due === 0 && await a.page.evaluate((x) => window.Saathi.plan.dayDone(x), TODAY), due);
    errsAll.push(...a.errs); await a.ctx.close();
    const b = await open({ seed: Object.assign({}, { situation: { pregnant: true, pregnantSince: ago(105) }, events: [] }, { mods: { plan: planOf('preg', 'food', ago(10)), preg: { plan: { done: { scan1: ago(1) } } } } }) });
    check('14 the first scan ticked on its window\'s last day (14 weeks 6 days): that day counts (FIXES-05)', await b.page.evaluate((x) => window.Saathi.preg.plan.markedOn(x), ago(1)));
    errsAll.push(...b.errs); await b.ctx.close();
  }
  /* FIXES-06: a shared phone, "Your plan has changed": one pick button */
  {
    const { ctx, page, errs } = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(40) }, events: [], intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(50)) }, settings: { discreet: true, toursAuto: false } }, hash: '#plan' });
    const n1 = await page.$$eval('#view button', (xs) => xs.filter((x) => /Pick a goal when you/.test(x.textContent)).length);
    if (await has(page, '#view #pl-disc-pick')) await tap(page, '#view #pl-disc-pick');
    check('14 a shared phone: one "Pick a goal" button, and no dead one on the goal list (FIXES-06)', n1 === 1 && !(await has(page, '#view #pl-chg-pick')), n1);
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-07: "My Hb was low" stays after her plan ends */
  {
    const { ctx, page, errs } = await open({ seed: { intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(30), { docSaid: { k: 'hb', at: ago(3) }, docAt: ago(5), doc: 'done' }) } }, hash: '#plan-settings' });
    await tap(page, '#view #pl-stop'); await tap(page, '#view #pl-stop-yes');
    check('14 after Stop, the doctor\'s "My Hb was low" still rests her Hb card (FIXES-07)', (await page.evaluate(() => window.Saathi.plan.saidHbAt())) === ago(5), await page.evaluate(() => window.Saathi.plan.saidHbAt()));
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-08: a kept plan's doctor report stops at its year */
  {
    const { ctx, page, errs } = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(60 * 7), { keep: true }) } }, hash: '#report-show' });
    const v = await allText(page);
    check('14 a kept plan in week 61: the report says week 52, not 61 (FIXES-08)', /Plan week 52/.test(v) && !/Plan week 61/.test(v), v.match(/Plan week \d+/));
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-10: the morning after she finishes her checklist, yesterday still shows its step */
  {
    const keys = ['folic', 'hb', 'bg', 'sugar', 'tsh', 'infect', 'thal', 'rubella', 'bmi', 'dental', 'tobacco', 'meds', 'control', 'p_tests', 'p_tobacco', 'p_meds', 'p_read'];
    const prep = {}, prepAt = {}; keys.forEach((k) => { prep[k] = true; prepAt[k] = ago(1); });
    const { ctx, page, errs } = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready' }, mods: { plan: planOf('ttc', 'ready', ago(8)), ttc: { prep: prep, prepAt: prepAt } } } });   /* yesterday was plan day 8, the week's checklist day */
    check('14 the trying plan, the morning after the last checklist tick: not "No steps yesterday" (FIXES-10)', !/No steps yesterday/.test(await view(page)) && await page.evaluate((x) => window.Saathi.plan.dayDone(x), ago(1)));
    errsAll.push(...errs); await ctx.close();
  }
  /* FIXES-11: the call form follows the topic she tapped last */
  {
    const { ctx, page, errs } = await open({ cfg: { app: 'test-0.39-demo' } });
    await page.evaluate(() => window.Saathi.ask('About my periods')); await settle(page, 300); await go(page, 'ask-call'); const t1 = await page.$eval('#ac-topic', (e) => e.value).catch(() => null);
    await page.evaluate(() => window.Saathi.ask('My plan (Easier periods): results')); await settle(page, 300); await go(page, 'ask-call'); const t2 = await page.$eval('#ac-topic', (e) => e.value).catch(() => null);
    check('14 the call form: a second topic in the same session replaces the first (FIXES-11)', t1 === 'About my periods' && t2 === 'My plan (Easier periods): results', [t1, t2]);
    errsAll.push(...errs); await ctx.close();
  }
}

check('13, 14 no page errors', errsAll.length === 0, errsAll);

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
