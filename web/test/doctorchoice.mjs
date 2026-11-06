// Version 39.77, Qura doctor or government doctor, place by place (Mohit, 6 Nov: his 96 choices on claude.ai/artifact/JbnFnzN9W5NC9tq7xQQRzL,
// docs/doctor-choice-audit-2026-11-06.md; "Qura doctors are Ayurveda doctors (BAMS) help you with natural and ayurvedic treatments. We dont
// have to mention that qura doctors can not give any treatment and only gynaecologist can"; MODULE_API section 120). This file checks:
// - 1 core's rule (S.docWho): Q, G, B, and H by her answer; a route's prefix; a topic page by its hub;
// - 2 Help's doctor row: a Qura doctor for a private doctor or no answer, "See a doctor" (her gynaecologist or a free government doctor) for a
//   government hospital or her ASHA, and in a pregnancy; the Help and safety page and search with no match offer both;
// - 3 the "See a doctor" page (#doc-free): her own doctor's Call first, eSanjeevani, Care near me; no Call on a shared phone;
// - 4 the doctor screen and every Qura card say who Qura's doctors are in Mohit's words, and no live screen says they only help with food,
//   sleep or routine, can't treat, or refer to a gynaecologist;
// - 5 each kind of page: G pages have no Qura line or "Ask a doctor" and show the gynaecologist / free government doctor card; Q pages have
//   the Qura card and none of the government "where to go" lines; B pages have both; diary signs have no "See a gynaecologist";
// - 6 Learn: Qura's areas get "How Qura can help" in his words and no free government doctor line; pregnancy articles the government card
//   and no Ask, with their box's safety lines kept; intimate health both; the under-18 articles keep their own lines; the "Govt. services" topic holds the free government doctor;
// - 7 her plans: My plan's care team (Qura and her own doctor, on every answer), the doctor check without a government clause, the baby plan's
//   card without its free line, the months-of-trying card with a Qura doctor, the before-40 card without "See a gynaecologist";
// - 8 Hindi, and no page errors.
// Usage: node test/doctorchoice.mjs [web dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ARTS = JSON.parse(CONTENT).groups.flatMap((g) => g.articles.map((a) => g.group + '.' + a.id));
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 1500)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const QSTD = 'Qura doctors are Ayurveda doctors (BAMS). They help you with natural and Ayurvedic treatments.';
const QSTD_HI = 'Qura की डॉक्टर आयुर्वेद डॉक्टर (BAMS) हैं।';
const GOV_H = 'See a gynaecologist or a free government doctor';
/* what Mohit asked to stop saying about Qura's doctors */
const LIMIT = /Qura[^.]*\b(food|weight|sleep|routine|habits|diet)\b|Qura[^.]*\b(refer|refers)\b|Qura[^.]*(cannot|can't|don't|does not|doesn't|do not) (prescribe|provide|run|do)|Qura refers|need(s)? an MBBS gynaecologist; Qura/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.77-pilot', platform: 'android' }) + ';');
await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
const page = await ctx.newPage();
const errs = []; let where = '';
page.on('pageerror', (e) => errs.push(where + ' :: ' + String(e.message).slice(0, 200)));
await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);

const load = (o) => page.evaluate((o) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); S.reset(); if (S.account) S.account._testSignIn(); S.loadSample(o.p); const st = S.state; st.lang = o.lang || 'en'; st.langChosen = true;
  st.settings.toursAuto = false; st.settings.discreet = !!o.discreet; st.fullTour = { st: 'done', d: S.toISO(S.today()) }; st.whatsNew = '9.99'; st.situation = st.situation || {}; Object.assign(st.situation, o.sit || {});
  if (o.care) st.situation.care = o.care; else delete st.situation.care; if (o.tel) st.mydoc = { tel: o.tel }; S.save(); location.hash = '#home'; S.render(); }, o);
const show = (r) => page.evaluate((r) => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); location.hash = '#' + r; S.render(); }, r);
const view = () => page.evaluate(() => (document.getElementById('view').innerText || '').replace(/\s+/g, ' '));
const has = (sel) => page.evaluate((sel) => !!document.querySelector(sel), sel);
const asks = () => page.evaluate(() => document.querySelectorAll('#view [data-ask], #view [data-go="ask"], #view #art-ask').length);
const help = async () => { await show('home'); await page.evaluate(() => { const b = document.getElementById('help-btn'); if (b) b.click(); }); await sleep(120);
  return page.evaluate(() => { const r = document.querySelector('#sheet-root #hs-doc'); return r ? { h: r.querySelector('strong').innerText, s: r.querySelector('.body span').innerText } : null; }); };

// 1. core's rule
await load({ p: 'asha', care: 'private' });
{ const w = await page.evaluate(() => { const S = window.Saathi; return ['help', 'contra-m-pill', 'topic-meno', 'learn-pregnancy', 'learn-intimate', 'post-mood', 'post-feed', 'cond-pid', 'cond-fibroids', 'nowhere-at-all', 'plan-preg', 'plan'].map((p) => S.docWho(p)); });
  check('1.1 the rule: help Q (private answer), a method page G, the menopause topic Q, pregnancy articles G, intimate articles B, mood after a birth Q, feeding G, infections G, fibroids Q, an unnamed place B, My pregnancy G, other plans Q', w.join() === 'Q,G,Q,G,B,Q,G,G,Q,B,G,Q', w); }
await load({ p: 'asha', care: 'govt' });
check('1.2 by her answer: Help on a government hospital answer is G', await page.evaluate(() => window.Saathi.docWho('help')) === 'G');
await load({ p: 'asha', care: 'asha' });
check('1.3 ... and on her ASHA', await page.evaluate(() => window.Saathi.docWho('help')) === 'G');

// 2. Help
for (const [care, isQ] of [[null, true], ['private', true], ['none', true], ['govt', false], ['asha', false]]) {
  where = 'help ' + care; await load({ p: 'asha', care }); const r = await help();
  check('2.1 Help\'s doctor row, answer ' + (care || 'not given') + ': ' + (isQ ? '"Ask a doctor", a call with a Qura doctor' : '"See a doctor", her gynaecologist or a free government doctor'),
    r && (isQ ? r.h === 'Ask a doctor' && r.s === 'A call with a Qura doctor' : r.h === 'See a doctor' && r.s === 'Your gynaecologist, or a free government doctor'), r);
  await page.evaluate(() => document.querySelector('#sheet-root #hs-doc').click()); await sleep(150);
  const h = await page.evaluate(() => location.hash);
  check('2.2 ... and it opens ' + (isQ ? 'the Qura call' : 'the "See a doctor" page'), isQ ? /^#ask/.test(h) : h === '#doc-free', h);
}
for (const care of ['private', 'govt']) {
  where = 'help preg ' + care; await load({ p: 'meera', care }); const r = await help();
  check('2.3 Help in a pregnancy (' + care + '): "See a doctor", her ' + (care === 'govt' ? 'ANM or ' : '') + 'gynaecologist or a free government doctor, no Qura',
    r && r.h === 'See a doctor' && r.s === (care === 'govt' ? 'Your ANM or gynaecologist for the pregnancy, or a free government doctor' : 'Your gynaecologist for the pregnancy, or a free government doctor'), r);
}
await load({ p: 'asha', care: 'private' }); await show('help');
{ const v = await view(); check('2.4 the Help and safety page: the Qura doctor and the gynaecologist or free government doctor', /Speak to a Qura doctor/.test(v) && v.indexOf(GOV_H) >= 0 && await has('#view .doc-gov a[href*="esanjeevani"]'), v.slice(0, 400)); }
await show('care'); await page.evaluate(() => { const i = document.querySelector('#care-q'); i.value = 'zzqqxx'; i.dispatchEvent(new Event('input')); }); await sleep(150);
check('2.5 search with no match: "Ask a doctor about this" and "Free government doctor"', await has('#view [data-ask="zzqqxx"]') && await has('#view [data-go="doc-free"]'));

// 3. the "See a doctor" page
await load({ p: 'asha', care: 'private', tel: '9812345678' }); await show('doc-free');
{ const b = await page.evaluate(() => [...document.querySelectorAll('#view .doc-gov a, #view .doc-gov button')].map((x) => (x.getAttribute('href') || x.dataset.go || '') + '|' + x.innerText.trim()));
  check('3.1 "See a doctor": her own doctor\'s Call first, then eSanjeevani, then Care near me', b.length === 3 && b[0] === 'tel:9812345678|Call my doctor' && /^https:\/\/esanjeevani\.mohfw\.gov\.in\/\|Free online doctor \(eSanjeevani\)$/.test(b[1]) && b[2] === 'access-care|Care near me', b);
  check('3.2 ... with its heading and line', (await view()).indexOf(GOV_H) >= 0 && /eSanjeevani \(hours vary by state\)/.test(await view())); }
await load({ p: 'asha', care: 'private', tel: '9812345678', discreet: true }); await show('doc-free');
check('3.3 on a shared phone: no Call with her doctor\'s number', !(await has('#view .doc-gov a[href^="tel:"]')) && await has('#view .doc-gov a[href*="esanjeevani"]'));

// 4. Mohit's words, and none of the old ones
await load({ p: 'asha', care: 'private' }); await show('ask');
{ const v = await view(); check('4.1 the doctor screen: who Qura\'s doctors are, in his words; no "refers", no MBBS', v.indexOf(QSTD) >= 0 && !/Qura refers|MBBS|tell you when you need a gynaecologist/.test(v), v.slice(0, 500)); }
const ROUTES = await page.evaluate(() => { const S = window.Saathi; const r = ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'library', 'explain', 'plan', 'doc-free'];
  S.modules.forEach((m) => Object.keys(m.routes || {}).forEach((x) => r.push(x))); S.sections.forEach((s) => r.push('topic-' + s)); return r.filter((x, i) => r.indexOf(x) === i && !(S.retired && S.retired(x))); });
{ const bad = [];
  for (const [p, sit] of [['asha', {}], ['meera', {}], ['sunita', {}], ['kamla', {}], ['kamla', { stopped: true }]]) for (const care of ['private', 'govt']) {
    await load({ p, sit, care });
    for (const r of ROUTES) { where = p + ' ' + care + ' #' + r; await show(r); const lines = (await page.evaluate(() => (document.getElementById('view').innerText || '').split('\n'))).filter((l) => LIMIT.test(l)); lines.forEach((l) => bad.push('#' + r + ': ' + l.slice(0, 140))); }
  }
  check('4.2 no live screen (' + ROUTES.length + ' routes, 5 women, both answers) says Qura\'s doctors only help with food, sleep or routine, can\'t treat, or refer on', !bad.length, [...new Set(bad)].slice(0, 12)); }

// 5. each kind of page
const G_PAGES = ['contra', 'contra-m-pill', 'contra-m-cut', 'intimate-firsttime', 'intimate-prolapse', 'iron', 'screen', 'cond-pid', 'pregtest-options', 'pregtest-abortion', 'preg', 'preg-diet', 'pregtools-birth', 'post-feed', 'post-contra', 'teen-mother', 'access-partner', 'tools-meds'];
const Q_PAGES = ['periods-pain', 'periods-fasting', 'cond', 'cond-fibroids', 'cond-labs', 'cond-poi', 'meno', 'meno-hrt', 'meno-bones', 'ttc', 'ttc-tests', 'ttc-trying', 'post', 'post-mood'];
for (const care of ['private', 'govt']) {
  const badG = [], badQ = [];
  for (const r of G_PAGES) { await load({ p: r.indexOf('preg') === 0 ? 'meera' : (r.indexOf('post') === 0 ? 'sunita' : 'asha'), care }); where = 'G ' + r; await show(r); const v = await view();
    if (/Qura/.test(v.replace(/Qura Sakhi/g, '')) || (await asks()) || v.indexOf(GOV_H) < 0) badG.push(r + (/Qura/.test(v.replace(/Qura Sakhi/g, '')) ? ' (Qura line)' : '') + ((await asks()) ? ' (Ask)' : '') + (v.indexOf(GOV_H) < 0 ? ' (no card)' : '')); }
  check('5.1 ' + G_PAGES.length + ' gynaecologist / government pages (' + care + '): no Qura line, no "Ask a doctor", the gynaecologist or free government doctor card', !badG.length, badG);
  for (const r of Q_PAGES) { await load({ p: r.indexOf('post') === 0 ? 'sunita' : (r.indexOf('meno') === 0 ? 'kamla' : 'asha'), care }); where = 'Q ' + r; await show(r); const v = await view();
    if (v.indexOf(QSTD) < 0 || v.indexOf(GOV_H) >= 0 || !(await asks())) badQ.push(r + (v.indexOf(QSTD) < 0 ? ' (no Qura line)' : '') + (v.indexOf(GOV_H) >= 0 ? ' (gov card)' : '')); }
  check('5.2 ' + Q_PAGES.length + ' Qura pages (' + care + '): the Qura card in Mohit\'s words and "Ask a doctor", no government doctor card', !badQ.length, badQ);
}
await load({ p: 'asha', care: 'govt' });
{ const gone = {};
  for (const [r, re] of [['cond-fibroids', /district hospital or medical college can order the scan/], ['cond-poi', /Where to go: the gynaecology OPD/], ['ttc-tests', /Government options/], ['ttc-loss2', /gynaecology OPD of a government medical college/], ['ttc-trying', /Start at the gynaecology OPD/], ['intimate', /Suraksha clinic/]]) { await show(r); gone[r] = !re.test(await view()); }
  await load({ p: 'kamla', care: 'govt' }); await show('meno'); gone.meno = !/Where: the gynaecology OPD/.test(await view());
  check('5.3 Qura pages lose their government "where to go" lines (fibroids, early menopause, fertility tests, two losses, trying a year, the intimate health hub, menopause)', Object.values(gone).every(Boolean), gone);
  await load({ p: 'asha', care: 'govt' }); await show('ttc-trying'); check('5.4 ... trying a year starts with a Qura doctor', /Start with a Qura doctor/.test(await view()));
  await show('intimate'); check('5.5 ... the intimate hub keeps the free HIV test', /ICTC/.test(await view())); }
for (const r of ['loss-again', 'loss-types']) { await load({ p: 'asha', care: 'private' }); await show(r); const v = await view();
  check('5.6 ' + r + ' (both): the Qura line and the gynaecologist or free government doctor', v.indexOf(QSTD) >= 0 && v.indexOf(GOV_H) >= 0 && !/Qura refers|food, weight and sleep/.test(v)); }
await load({ p: 'kamla', sit: { stopped: true }, care: 'private' }); await show('explain');
check('5.7 diary signs: "Ask a doctor about this" and no "See a gynaecologist" or "See a doctor" button', (await asks()) > 0 && !(await page.evaluate(() => [...document.querySelectorAll('#view .xp-doc')].length)));
await load({ p: 'sunita', care: 'private' }); await show('post-feed');
check('5.8 feeding help: the nurse, her doctor or her ASHA, then the free government doctor', /A nurse at your hospital, your doctor, or your ASHA or ANM can watch a feed and help\./.test(await view()) && !/Qura/.test(await view()));
await load({ p: 'meera', care: 'private' }); await show('preg-logs');
check('5.9 her pregnancy numbers: "Your doctor sees this", not a Qura doctor', /Your doctor sees this at your next visit/.test(await view()) && !/Qura doctor sees/.test(await view()));

// 6. Learn
{ const bad = [];
  for (const care of ['private', 'govt']) { await load({ p: 'asha', care });
    for (const k of ARTS) { where = 'art ' + k; await show('a-' + k); const g = k.split('.')[0]; const v = await view(); const u18 = k === 'cycle.first-periods-for-teens' || k === 'services.under-18-daughter-sister';
      const box = /How Qura can help/.test(v), std = v.indexOf(QSTD) >= 0, gov = v.indexOf(GOV_H) >= 0, ask = await has('#view #art-ask');
      const free = await page.evaluate(() => [...document.querySelectorAll('#view .card.dark li')].some((li) => /^(Free|मुफ़्त)/.test(li.innerText.trim())));
      if (u18) { if (std) bad.push(k + ' under-18 lost its own line'); continue; }
      if (g === 'pregnancy') { if (box || ask || !gov) bad.push(k + ' (pregnancy)' + (box ? ' box' : '') + (ask ? ' ask' : '') + (!gov ? ' no-gov' : '')); }
      else if (g === 'intimate') { if ((box && !std) || !gov || !ask) bad.push(k + ' (intimate)'); }
      else if ((box && !std) || gov || free || !ask) bad.push(k + ' (' + g + ')' + (box && !std ? ' old-line' : '') + (gov ? ' gov' : '') + (free ? ' free-line' : '') + (!ask ? ' no-ask' : '')); } }
  check('6.1 ' + ARTS.length + ' Learn articles, both answers: Qura\'s areas in his words without a free government doctor line; pregnancy and after the birth the government card, no Ask; intimate health both; the under-18 articles keep their own', !bad.length, bad.slice(0, 12)); }
{ const want = [['pregnancy.babys-movements', 'en', /A baby's movements can only be checked at a hospital\./], ['pregnancy.after-birth-first-six-weeks', 'en', /Bleeding, fever, mood illness and anything about the baby are for your doctor, a hospital or the PHC\./],
    ['pregnancy.after-birth-first-six-weeks', 'en', /Tell your doctor if you are breastfeeding; that changes what is safe to take\./], ['pregnancy.iron-folic-acid-calcium-td', 'en', /Your doctor decides these doses; this list only helps you ask\./],
    ['pregnancy.four-antenatal-visits', 'en', /Never stop a medicine another doctor prescribed on your own/], ['pregnancy.babys-movements', 'hi', /बच्चे की हरकत सिर्फ़ अस्पताल में जाँची जा सकती है।/],
    ['pregnancy.after-birth-dos-and-donts', 'hi', /ब्लीडिंग, बुखार, मन की बीमारी और बच्चे से जुड़ी हर बात आपकी डॉक्टर, अस्पताल या PHC के लिए है।/]];
  const miss = [];
  for (const [k, lang, re] of want) { await load({ p: 'meera', care: 'private', lang }); await show('a-' + k); const v = await view(); if (!re.test(v) || /not Qura|Qura के लिए नहीं/.test(v)) miss.push(k + ' ' + lang); }
  check('6.3 pregnancy and after-birth articles keep their box\'s safety lines in "When to see a doctor", without the Qura part', !miss.length, miss); }
for (const lang of ['en', 'hi']) { await load({ p: 'asha', care: 'private', lang }); where = 'how-qura-helps ' + lang; await show('a-services.how-qura-helps'); const v = await view();
  const ok = lang === 'en'
    ? /^Listen How Qura helps Who Qura’s doctors are/.test(v) && v.indexOf(QSTD) >= 0 && /Your periods: irregular, painful or heavy periods/.test(v) && /PMOS \(PCOS or PCOD\)/.test(v) && /Getting pregnant, naturally\./.test(v) && /Menopause, and the years before it\./.test(v) && /Your body after a baby\./.test(v)
      && /for her registration number and council/.test(v) && !/Megha|Ayushi|28526/.test(v) && /It is booked only when you tap Book a consultation/.test(v) && /see your own gynaecologist, or a free government doctor: eSanjeevani/.test(v) && /Go to the nearest hospital now \(ambulance: 108\)/.test(v) && /Anyone under 18/.test(v)
      && !/cannot|can't|MBBS|send you on|where it stops|food, sleep, stress|How Qura can help/.test(v)
    : /^सुनें Qura कैसे मदद करता है/.test(v) && v.indexOf(QSTD_HI) >= 0 && /उनका रजिस्ट्रेशन नंबर और काउंसिल पूछ सकती हैं/.test(v) && !/मेघा|आयुषी|28526/.test(v) && /अभी सबसे पास के अस्पताल जाएँ \(एम्बुलेंस: 108\)/.test(v) && !/नहीं लिख सकतीं|नहीं देख सकतीं|MBBS|रुक जाता है/.test(v);
  check('6.4 How Qura helps (' + lang + '), rewritten in Mohit\'s words: who Qura\'s doctors are, the five areas, the free call booked only by her, everything else to her gynaecologist or a free government doctor, asking any doctor for her registration, the emergency and under-18 lines; no doctor\'s name; nothing about what they cannot do, and no second Qura box', ok, v.slice(0, 900)); }
await load({ p: 'asha', care: 'private' }); await show('topic-free');
{ const v = await view(); check('6.2 "Govt. services": the free government doctor, not Qura\'s article', await has('#view [data-go="doc-free"]') && !/How Qura helps/.test(v), v.slice(0, 300)); }

// 7. her plans (seeds as test/ladder.mjs, test/baby.mjs, test/behave.mjs build them)
const TODAY = '2026-11-06';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const gaps42 = () => [120, 78, 36].reduce((o, x) => o.concat([{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]), []);
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, goals: ['pain'], intake: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS, fullTour: { st: 'done', d: ago(3) }, whatsNew: '9.99', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack, goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [] }, extra || {});
const planRem = (startAgo) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: true, doneOn: null });
const CIK = (o) => Object.assign({ goal: 'pmos', stage: 'cycle', gap: 'g45', skips: 'n', act: '0', food: 'veg', milk: 'y', lim: [], when: 'dinner', bed: 'b23', work: 'day' }, o || {});
const pmosS = (startAgo, ik, care) => seedOf({ dob: '1998-05-01', situation: { pcos: true, care }, events: gaps42(), goals: ['pmos'], intake: { goal: 'pmos', stage: 'cycle' }, mydoc: { tel: '9812345678' },
  mods: { plan: planOf('cycle', 'pmos', startAgo, { weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true, seenM: true } }, intake: CIK(ik) }) }, reminders: [planRem(startAgo)] });
const IK = (o) => Object.assign({ at: ago(1), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' }, o || {});
const mAns = { goal: 'hot', stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' };
async function seeded(seed, hash) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await c.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';'); await c.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.77-pilot', platform: 'android' }) + ';');
  await c.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 't', id: 't', phone: '+919876543210', name: 'Priya', pincode: '302001', activeOn: TODAY })) + '); }');
  await c.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await c.newPage(); p.on('pageerror', (e) => errs.push('seeded ' + hash + ' :: ' + String(e.message).slice(0, 200)));
  await p.clock.install({ time: new Date(TODAY + 'T10:00:00+05:30') }); await p.goto(PAGE + '#' + hash, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => !!window.Saathi);
  for (let i = 0; i < 8; i++) { await p.clock.runFor(100); await sleep(10); }
  return { c, p, text: () => p.evaluate(() => (document.getElementById('view').innerText || '').replace(/\s+/g, ' ')) };
}
for (const care of ['private', 'govt']) {
  const a = await seeded(pmosS(10, null, care), 'plan'); await a.p.evaluate(() => document.querySelectorAll('#view details').forEach((d) => { d.open = true; }));
  const ct = await a.p.evaluate(() => { const c = document.querySelector('#view .pl-care'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  check('7.1 My plan\'s care team (' + care + '): her own doctor\'s Call and a Qura doctor, no free government doctor row', /Call my doctor/.test(ct) && /A Qura doctor/.test(ct) && !/Free government doctor/.test(ct), ct); await a.c.close();
  const b = await seeded(pmosS(35, { skips: 'y' }, care), 'home'); const doc = await b.p.evaluate(() => { const c = document.querySelector('#view .pl-sl-doc'); return c ? { t: c.innerText.replace(/\s+/g, ' '), ask: !!c.querySelector('[data-ask]') } : null; });
  check('7.2 the doctor check (' + care + '): "Ask a doctor about this", and no government clause', doc && doc.ask && !/government/.test(doc.t), doc); await b.c.close();
}
{ const ik = IK({ bdoc: 'gyn' }); const a = await seeded(seedOf({ situation: { planning: true }, goals: ['ttc', 'ready'], intake: ik, mods: { plan: planOf('ttc', 'ready', 2, { pv: 2, when: 'evening', intake: ik }) }, reminders: [planRem(2)] }), 'home');
  const t = await a.p.evaluate(() => { const c = document.querySelector('#view .pl-sl-bdoc'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  check('7.3 Getting ready\'s "A few things first": no free government line', t && !/Free: the PHC|eSanjeevani|Ayushman/.test(t), t); await a.c.close(); }
{ const a = await seeded(seedOf({ dob: '1989-03-01', situation: { stopped: true, midlife: true }, intake: { goal: 'hot', stage: 'meno' }, goals: ['meno', 'hot'], events: regular(400), mods: { plan: planOf('meno', 'hot', 2, { pv: 2, intake: mAns }) }, reminders: [planRem(2)] }), 'home');
  const c = await a.p.evaluate(() => { const x = document.querySelector('#view .pl-m2-poi'); return x ? { ask: !!x.querySelector('[data-ask]'), gyn: !!x.querySelector('.xp-doc') } : null; });
  check('7.4 the before-40 card: "Ask a doctor", no "See a gynaecologist" button', c && c.ask && !c.gyn, c); await a.c.close(); }
{ const s = fs.readFileSync(path.join(root, 'mods', 'plan.js'), 'utf8');
  check('7.5 the plan\'s Qura lines in his words (the baby plan, "Talk to a doctor for medicines")', s.indexOf("plan_bdoc_qura: '" + QSTD) >= 0 && /plan_ask_p: '[^']*Qura doctors are Ayurveda doctors \(BAMS\) and help with natural and Ayurvedic treatments\.'/.test(s));
  check('7.6 My pregnancy\'s doctor: her gynaecologist or a free government doctor (quraHere)', /packOf\(d \|\| raw\(\) \|\| \{\}\) === 'preg' \? 'plan-preg' : 'plan'/.test(s)); }

// 8. Hindi
await load({ p: 'asha', care: 'govt', lang: 'hi' }); { const r = await help(); check('8.1 Hindi: Help\'s row on the government answer', r && r.h === 'डॉक्टर को दिखाएँ' && r.s === 'आपकी स्त्री रोग विशेषज्ञ, या मुफ़्त सरकारी डॉक्टर', r); }
await show('periods-pain'); check('8.2 Hindi: the Qura card in his words', (await view()).indexOf(QSTD_HI) >= 0);
await show('contra'); check('8.3 Hindi: the gynaecologist or free government doctor card', (await view()).indexOf('स्त्री रोग विशेषज्ञ या मुफ़्त सरकारी डॉक्टर को दिखाएँ') >= 0 && !/Qura/.test((await view()).replace(/Qura Sakhi/g, '')));
{ const hi = await page.evaluate(() => { const S = window.Saathi; return ['qura_std', 'gov_h', 'gov_p', 'gov_esanj', 'gov_near', 'gov_page', 'gov_tile', 'gov_tile_s', 'hs_doc_s_gov'].filter((k) => !S.strings.hi[k] || S.strings.hi[k] === S.strings.en[k]); });
  check('8.4 every new line has its Hindi', !hi.length, hi); }
{ const NAMES = /\bMegha\b|Ayushi|मेघा(?!लय)|आयुषी/;   /* not Meghalaya, the state */
  const str = await page.evaluate((src) => { const re = new RegExp(src); const S = window.Saathi; const out = []; ['en', 'hi'].forEach((l) => Object.entries(S.strings[l] || {}).forEach(([k, v]) => { if (typeof v === 'string' && re.test(v)) out.push(l + '.' + k); })); return out; }, NAMES.source);
  const lib = []; const walk = (v, p) => { if (typeof v === 'string') { if (NAMES.test(v)) lib.push(p); } else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, p + '.' + k)); }; walk(JSON.parse(CONTENT), 'content');
  const mods = fs.readdirSync(path.join(root, 'mods')).filter((f) => f.endsWith('.js')).flatMap((f) => fs.readFileSync(path.join(root, 'mods', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').split('\n').filter((l) => NAMES.test(l)).map((l) => f + ': ' + l.trim().slice(0, 80)));
  check('8.6 no doctor named anywhere (Mohit: "Dont give doctor names anywhere"): the strings, the Learn library, the modules\' words', !str.length && !lib.length && !mods.length, { str, lib, mods }); }
check('8.5 no page errors', !errs.length, errs.slice(0, 8));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(JSON.stringify({ checks: results.length, failed: failed.length }));
process.exit(failed.length ? 1 : 0);
