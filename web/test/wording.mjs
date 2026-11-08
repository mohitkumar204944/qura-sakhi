// Version 39.71, the doctors' feature review, part 3: the wording (Mohit, 6 Nov: "commit 39.70 and go with part 3";
// docs/feature-review-2026-11-05.md, answers 6, 8 and 10 and the approved plan; MODULE_API section 114). This file checks:
// - 1 the renames: "your trainer" in Wind down and the plans (Version 39.77: no doctor named anywhere), "Pelvic floor exercises
//   (Kegels)", "My postpartum recovery", "Menopause transition and menopause", "Period comfort";
// - 2 the medicine line at the top of the pages and Learn articles that tell her about a medicine, the emergency pill's own line,
//   the tests line, under her steps when one is her folic acid tablet, and nowhere else; in Hindi too;
// - 3 cloth and the Rs 1 pad gone from the products guide, the Learn library, the girls' guides, the period plan and the family
//   pages (a warm cloth for heat stays);
// - 4 the doctors' added lines: sleep sounds, the PMS chapters, his part, the ovulation tests in 5 steps, weeks 4 and 10, her own
//   checks first and the vaccines kept short, breastfeeding's basics, the girls' guides on one page, the supplements card, and
//   "or a doctor" on four urgent lines;
// - 5 Qura's doctors: every button says "Ask a doctor", the call form says it is a Qura doctor and has the doctors' line, the tile
//   says "Talk to a doctor", How Qura helps has the line;
// - 6 every live screen, for 5 women in English and Hindi: none of the old words; no page errors.
// Usage: node test/wording.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const LIB = JSON.parse(CONTENT);
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 2000)); };
const MED = { en: 'Take medicines only on your doctor’s advice. Don’t take them on your own.', hi: 'दवाएँ सिर्फ़ डॉक्टर की सलाह पर लें। अपने आप न लें।' };
const EC = 'Ask a doctor or chemist today.';
const TEST = 'Do these tests with your doctor’s guidance: ask your doctor first.';
const QLINE = 'Qura doctors are Ayurveda doctors (BAMS). They help you with natural and Ayurvedic treatments.';   /* Version 39.77: Mohit's words (replace the doctors' answer-10 line; for their read) */
/* the old words, as they showed (a warm cloth for heat, "clothes", "your womb squeezes", the girls' "first-period kit" and the
   joining welcome are not among them) */
const OLD_EN = /Dr\.? ?Megha|(?<!womb )\bsqueezes\b|Squeeze sets|My recovery plan|My midlife plan|(?<!first-)period kit|Ask a Qura doctor|cloth pads?|pad or cloth|or clean cloth|clean (cotton )?cloth|thick cloth|Cloth is|Suvidha|₹ ?1 (a|each|per) pad|Rs 1 (each|per pad)|pads? at (₹|Rs) ?1\b/i;
const OLD_HI = /डॉ\. ?मेघा|मिडलाइफ़ प्लान|40 के बाद मेरा प्लान|रिकवरी का प्लान|पीरियड की आपकी किट|Qura की डॉक्टर से पूछें|कपड़े का pad|पैड या (साफ़ )?कपड़ा|सुविधा पैड|1 रुपये का (पैड|एक)/;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.71-pilot', platform: 'android' }) + ';');
await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
const page = await ctx.newPage();
const errs = []; let where = '';
page.on('pageerror', (e) => errs.push(where + ' :: ' + String(e.message).slice(0, 200)));
await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const ROUTES = await page.evaluate(() => { const S = window.Saathi; const r = ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'library'];
  S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).slice(0, 4).forEach((x) => r.push(x)); });
  S.sections.forEach((s) => r.push('topic-' + s)); return r.filter((x, i) => r.indexOf(x) === i && !(S.retired && S.retired(x))); });
const load = (o) => page.evaluate((o) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); S.loadSample(o.p); const st = S.state; st.lang = o.lang || 'en'; st.langChosen = true;
  st.settings.toursAuto = false; st.fullTour = { st: 'done', d: S.toISO(S.today()) }; st.whatsNew = '9.99'; if (o.x) Object.assign(st, o.x); S.save(); location.hash = '#home'; S.render(); }, o);
const show = (r) => page.evaluate((r) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); location.hash = '#' + r; S.render(); }, r);
const view = () => page.evaluate(() => document.getElementById('view').innerText.replace(/\s+/g, ' ').trim());
const meds = () => page.evaluate(() => [...document.querySelectorAll('#view .med-line')].map((x) => x.innerText.trim()));
const has = (sel) => page.evaluate((sel) => !!document.querySelector(sel), sel);
const T = (k) => page.evaluate((k) => window.Saathi.t(k), k);

// 1. The renames
await load({ p: 'priya' }); where = 'renames';
await show('calm'); { const v = await view(); check('1.1 Wind down: "Guided by your trainer", the trainer’s voice, no Dr. Megha', /Guided by your trainer/.test(v) && /Your trainer’s voice/.test(v) && !/Megha/.test(v), v.slice(0, 300)); }
check('1.2 the captions name the trainer, and the welcome buttons name no doctor (Version 39.77, Mohit: "Dont give doctor names anywhere")', (await T('calm_who')) === 'Trainer' && !/Megha/.test(await T('listen')) && !/Megha/.test(await T('plan_rv_aud')) && /short welcome/.test(await T('plan_rv_aud')));
check('1.3 the plans: Relax, the bedtime step and Calm say "your trainer"', /^Slow breaths or yoga nidra at bedtime, or a sound for sleep$/.test(await T('plan_a_relax_s')) && /your trainer/.test(await T('plan_a_wind_s')) && /^Your trainer guides you/.test(await T('plan_calm_p')));
check('1.4 the plan names: My postpartum recovery, Menopause transition and menopause, Period comfort', (await T('plan_pk_post')) === 'My postpartum recovery' && (await T('plan_pk_meno')) === 'Menopause transition and menopause' && (await T('plan_a_kit')) === 'Period comfort');
check('1.5 Kegels: the step, the sets and the tile', (await T('plan_a_pf')) === 'Your pelvic floor exercises (Kegels)' && (await T('plan_pf_sets')) === 'Your Kegel sets' && (await T('plan_pf_tile')) === 'Kegel sets');
await load({ p: 'sunita' }); await show('post-pelvic'); { const v = await view(); check('1.6 the pelvic floor trainer after a birth: no "squeezes"', !/\bsqueezes\b/i.test(v) && /Squeeze and lift|Start a set/.test(v), v.slice(0, 400)); }
await load({ p: 'priya', lang: 'hi' });
check('1.7 Hindi names', (await T('plan_pk_post')) === 'डिलीवरी के बाद मेरी रिकवरी' && (await T('plan_pk_meno')) === 'मेनोपॉज़ की ओर बदलाव और मेनोपॉज़' && (await T('plan_a_kit')) === 'पीरियड में आराम' && (await T('calm_who')) === 'ट्रेनर');

// 2. The medicine line
await load({ p: 'priya' });
for (const [r, want] of [['contra', MED.en], ['contra-m-pill', MED.en], ['contra-ec', EC], ['contra-m-ec', EC], ['pregtest-abortion', MED.en], ['ttc-folic', MED.en], ['iron', MED.en], ['meno-hrt', MED.en], ['meno-bones', MED.en], ['periods-pain', MED.en], ['post-contra', MED.en], ['ttc-tests', TEST]]) {
  where = 'med ' + r; await show(r); const m = await meds();
  check('2.1 #' + r + ': one line at the top, "' + want.slice(0, 40) + '…"', m.length === 1 && m[0] === want && await page.evaluate(() => { const l = document.querySelector('#view .med-line'); const h = document.querySelector('#view > .backrow, #view > .row'); return !!l && (!h || h.nextElementSibling === l); }), m);
}
for (const r of ['home', 'diary', 'periods-products', 'calm', 'ttc', 'meno', 'help']) { where = 'nomed ' + r; await show(r); check('2.2 #' + r + ': no medicine line', !(await meds()).length); }
const MED_ARTS = ['cycle.painful-periods', 'conceive.folic-acid-and-tests-before-pregnancy', 'midlife.hormone-therapy-explained', 'pregnancy.iron-folic-acid-calcium-td', 'mind_body.thyroid-and-anaemia-tests'];
for (const k of MED_ARTS) { where = 'art ' + k; await show('a-' + k); const m = await meds(); check('2.3 the article ' + k + ': the line under its summary', m.length === 1 && m[0] === MED.en && await page.evaluate(() => { const l = document.querySelector('#view .med-line'); return !!l && !!l.previousElementSibling && (l.previousElementSibling.classList.contains('lead') || l.previousElementSibling.classList.contains('in-short')); }), m); }   /* Version 39.85: the summary sits in its "In short" box */
for (const k of ['cycle.what-is-a-menstrual-cycle', 'intimate.hygiene-myths', 'services.how-qura-helps']) { await show('a-' + k); check('2.4 the article ' + k + ': no line', !(await meds()).length); }
await load({ p: 'priya', lang: 'hi' }); await show('contra'); check('2.5 Hindi: the line on contraception', (await meds())[0] === MED.hi, await meds());
/* her plan: the line under her steps on the days her folic acid tablet is one of them */
{ await load({ p: 'asha' });
  const st = await page.evaluate(() => { const S = window.Saathi; const d = S.toISO(S.addDays(S.today(), -2));   /* as test/baby.mjs seeds Getting ready, on its day 3 (the plan day ends at 4 am) */
    const ik = { at: d, stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' };
    S.state.mods.plan = { pack: 'ttc', goalKey: 'ready', start: d, started: d, go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], intake: ik };
    S.state.goals = ['ready']; S.state.intake = ik; S.state.situation.planning = true; S.save(); location.hash = '#plan'; S.render();
    const ids = [...document.querySelectorAll('#view .pl-step')].length; return { steps: ids, med: [...document.querySelectorAll('#view .pl-steps-card .med-line')].map((x) => x.innerText), folic: /folic acid/i.test(document.getElementById('view').innerText) }; });
  check('2.6 Getting ready, My plan: under her steps, the medicine line once, with her folic acid tablet (Today’s tablet step opens its page, which has it)', st.folic && st.med.length === 1 && st.med[0] === MED.en, st); }

// 3. Cloth and the Rs 1 pad
await load({ p: 'priya' });
await show('periods-products'); { const v = await view(); check('3.1 the products guide: no cloth section or chip, no ₹1 pads, and the table says Pad', !/cloth/i.test(v) && !/₹ ?1\b/.test(v) && !/Suvidha/.test(v) && !(await has('#pp-cloth')) && /Pad/.test(v), v.slice(0, 500)); }
await show('a-intimate.pads-cloth-cups-tampons'); { const v = await view(); check('3.2 the article: "Pads, cups and tampons: safe use", no cloth, no Rs 1', /Pads, cups and tampons: safe use/.test(v) && !/\bcloth\b|Rs 1\b|Jan Aushadhi/i.test(v), v.slice(0, 400)); }   /* "clothes" and "a Rs 10 coin" are not the old words */
await show('teen-first'); { const v = await view(); check('3.3 the first period guide: pads only', !/cloth pad|cotton cloth|₹ ?1/i.test(v), v.match(/.{40}cloth.{40}/i)); }
{ const bad = []; for (const g of LIB.groups) for (const a of g.articles) { const tx = [a.title_en, a.summary_en].concat(a.body_en, a.see_doctor_en).join(' | ');
  if (/cloth pads?|or (clean )?cloth|clean (cotton )?cloth|thick cloth|Cloth is|Cloth:|wash cloth|Suvidha|Rs ?1 (each|per pad)|₹ ?1 (a|each|per) pad|pads at (Rs|₹) ?1\b/i.test(tx)) bad.push(g.group + '.' + a.id); }
  check('3.4 the Learn library: no cloth as a period product, no Rs 1 pad (a warm cloth for heat stays)', !bad.length && /warm cloth/.test(JSON.stringify(LIB)), bad); }
await show('family'); check('3.5 the family pages: pads, not cloth', !/clean cloth/i.test(await view()));

// 4. The doctors' added lines
await load({ p: 'kamla' });
{ const ml = fs.readFileSync(path.join(root, 'mods/midlife.js'), 'utf8'); const i = ml.indexOf('h4: {'), j = ml.indexOf('q1: {', i); const h4 = ml.slice(i, j);
  check('4.1 Night sweats: under the second card, a sound for sleep or yoga nidra, with Wind down', h4.indexOf('It will pass. I can rest.') > 0 && h4.indexOf('Still awake? Play a sound for sleep') > h4.indexOf('It will pass. I can rest.') && /Still awake\? Play a sound for sleep[^\n]*\n[^\n]*go: 'calm'/.test(h4) && h4.indexOf('Still awake?') < h4.indexOf('b: SKILL'), h4.slice(0, 300)); }
check('4.2 For poor sleep: the room line', /A cool room, a dim and warm light, and a cosy bed help you sleep\./.test(await T('relief_sleep_room')));
check('4.3 the bedtime step offers a meditation', /meditation/.test(await T('plan_a_wind')) && /sleep meditation/.test(await T('calm_more')));
const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');
{ const pp = src('mods/perplan.js'); const ttc = src('mods/ttc.js'); const pf = src('mods/pfplan.js');
  check('4.4 the PMS chapters: m5 a hobby, m6 a doctor or a friend, m7 two cards, m11 the people close to her', /Doing something you enjoy also turns your mind/.test(pp) && /You can also talk to a doctor, or a friend\./.test(pp) && /Lean on the people close to you/.test(pp) && !/Plan where you can step away to at home/.test(pp));
  check('4.5 Getting ready: week 4 the tests line, week 5 the ovulation tests in 5 steps, week 10 two new lines', /Week 4 · Tests before pregnancy'[^\n]*\n\s+\{ l: \[N2\('Do these tests with your doctor’s guidance/.test(ttc) && [1, 2, 3, 4, 5].every((n) => ttc.indexOf("N2('" + n + '. ') >= 0) && /Don’t take on stress for what others say\./.test(ttc) && /Before bed you can play a meditation/.test(ttc));
  check('4.6 his part: a healthy pregnancy is a shared job, on the page he is shown (the step keeps its reviewed reason)', /A healthy pregnancy is a shared job/.test(ttc) && (await T('plan_fb_his')) === 'Sperm take about 2–3 months to form, so changes show in a test after that.');
  check('4.7 "or a doctor": heavy periods week 7, the pelvic floor line and week 10, the fibroids guide', /heart races: see a doctor\./.test(pp) && /Go to the nearest hospital or a doctor now if you suddenly/.test(pf) && /tell someone at home, and go to a doctor or the nearest hospital today/.test(pf) && /go to a doctor or the nearest hospital now \(ambulance: 108\)/.test(src('mods/cond.js'))); }
await load({ p: 'sunita' });
await show('post-checks'); { const o = await page.evaluate(() => { const v = document.getElementById('view'); const tx = v.innerText; return { six: tx.indexOf('Your own check at 6 weeks'), vax: tx.search(/Baby.s vaccines|vaccines for your baby|Vaccines/), all: !!v.querySelector('details.pst-vall'), short: v.querySelectorAll('.pst-vlist')[0] ? v.querySelectorAll('.pst-vlist')[0].children.length : 0 }; });
  check('4.8 Check-ups: her own 6-week check before the baby’s vaccines, two doses showing, the rest folded', o.six >= 0 && o.vax > o.six && o.short === 2 && o.all, o); }
await show('post-feed'); { const v = await view(); check('4.9 Breastfeeding: the basics (latch, enough, sore, full, mastitis, supply myths), food kept for her plan, and not the rest', /A good latch/.test(v) && /Is baby getting enough\?/.test(v) && /Sore or cracked nipples/.test(v) && /Milk supply: myths and facts/.test(v) && /Food while you breastfeed/.test(v) && !/Going back to work|Expressing and storing milk|Only breast milk for 6 months/.test(v), v.slice(0, 300)); }
await load({ p: 'priya' });
await show('teen'); { const v = await view(); check('4.10 the girls’ guides on one page: the first period and the parents’ guide, nothing on feelings, safety or free help', /the first period, and a guide for mothers and fathers/.test(v) && (await page.evaluate(() => [...document.querySelectorAll('#view [data-go]')].map((b) => b.dataset.go).filter((g) => /^teen-/.test(g)))).sort().join() === 'teen-first,teen-mother' && !/staying safe|keeping her safe|Free help/.test(v), v.slice(0, 300)); }
await show('teen-mother'); check('4.11 the parents’ guide: no Safety chip', !(await page.evaluate(() => [...document.querySelectorAll('#view [data-jump]')].some((b) => b.dataset.jump === 'p-safety'))));
await show('meno-bones'); check('4.12 Bones and heart: supplements after consulting the doctor, and no Ashwagandha', /Supplements, if your doctor advises/.test(await view()) && /vitamin D, calcium or a multivitamin/.test(await view()) && !/ashwagandha/i.test(await view()));

// 5. Qura's doctors
await load({ p: 'priya' });
check('5.1 the buttons: "Ask a doctor"', (await T('ask_qura')) === 'Ask a doctor about this' && (await T('hs_doc_q')) === 'Ask a doctor' && (await T('doc_b')) === 'Ask a doctor');
await show('ask'); { const v = await view(); check('5.2 the call form: "Talk to a Qura doctor", with the doctors’ line', /Talk to a Qura doctor/.test(v) && v.indexOf(QLINE) >= 0, v.slice(0, 300)); }
check('5.3 Explore’s tile: "Talk to a doctor"', (await page.evaluate(() => { const S = window.Saathi; const x = S.tiles().find((y) => y.route === 'ask'); return x ? S.t(x.title) : null; })) === 'Talk to a doctor');
await show('a-services.how-qura-helps'); check('5.4 How Qura helps: the line', (await view()).indexOf(QLINE) >= 0);

// 6. Every live screen: none of the old words
const found = [];
for (const su of [{ p: 'priya' }, { p: 'asha' }, { p: 'meera' }, { p: 'sunita' }, { p: 'kamla' }, { p: 'priya', lang: 'hi' }, { p: 'sunita', lang: 'hi' }, { p: 'kamla', lang: 'hi' }]) {
  await load(su);
  for (const r of ROUTES) { where = su.p + ' ' + (su.lang || 'en') + ' #' + r; await show(r);
    const tx = await page.evaluate(() => (document.getElementById('view').innerText || '') + ' ' + [...document.querySelectorAll('#view button, #view a')].map((b) => b.getAttribute('aria-label') || '').join(' '));
    const m = tx.match(OLD_EN) || tx.match(OLD_HI); if (m) found.push(where + ': "' + m[0] + '"'); }
}
check('6.1 ' + ROUTES.length + ' routes, 5 women in English and 3 in Hindi: none of the old words', !found.length, found.slice(0, 20));
check('6.2 no page errors', !errs.length, errs.slice(0, 8));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(failed.length ? 'FAILED ' + (results.length - failed.length) + '/' + results.length : 'wording: all ' + results.length + ' checks passed');
process.exit(failed.length ? 1 : 0);
