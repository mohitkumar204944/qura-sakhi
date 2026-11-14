// Version 39.30: a danger sign typed in search, for every woman (the Cykel walk, 28 Oct; mockup
// claude.ai/artifact/Y4Kom9DHfyiw4buDUQRi8B; MODULE_API section 73). Until now only a pregnant woman's search put the danger
// guide first; for everyone else "bahut bleeding ho rahi hai aur chakkar aa raha hai" opened After an abortion. This file checks:
//   1 Help's "Call 112 now" signs in her words (English, Hinglish, Hindi) put one card first: Help's heading and the sign she
//     typed, Call 112 now and Help and safety. Version 39.70 (the doctors' review, part 2): the heading is "Go to the nearest
//     hospital now if" and the button calls her ambulance (108, or 102 in pregnancy); words about harming herself show no card;
//   2 words that are not a sign show no card: bleeding or dizziness alone, "khoon ki kami", a blood test, a faint test line;
//   3 its buttons: tel: links and Help; Learn's search shows it too;
//   4 every stage: after the birth, midlife, and pregnancy (the danger guide still the quick answer under it), discreet mode;
//   5 Hindi, and 360 px without sideways scroll; no page errors;
//   6 Version 39.91 (10 Nov, the Ask Sakhi scenario suite): heavy bleeding after a birth, for a woman after a birth and for words
//     that say a birth, in the after-birth page's own line (post_u_1) under the same heading; its near misses; Hindi at 360 px.
//   7 Version 39.92 (Mohit, 10 Nov: "Yes, build it"): a pregnancy now in her words, hers or anyone's, leads with the danger guide as her
//     diary does (no card in search, as in pregnancy); trying, asking, "not pregnant" and a past pregnancy don't; fits and fainting
//     as words ("benefits", "stay fit" and a "faint line" are not signs).
//   8 Version 39.93 (12 Nov, the Ask Sakhi gap cases): after a birth, the after-birth page's other two lines (post_u_2: a severe
//     headache, blurred sight or flashing lights, or fits; post_u_3: chest pain, breathlessness, or a painful or swollen calf), for the
//     same women as post_u_1; in pregnancy, vomiting that will not stop and pains before 37 weeks lead with the danger guide; their
//     near misses; Hindi at 360 px.
// Usage: node test/urgent.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'urgent'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.30-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('10:30') });
  await page.goto(PAGE + '#care', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const t = (page, k) => page.evaluate((k) => window.Saathi.t(k), k);
/* type in a search box; what the card says and where it sits */
const search = async (page, q, id) => {
  await page.evaluate(([q, id]) => { const i = document.querySelector('#' + id); i.value = q; i.dispatchEvent(new Event('input')); }, [q, id || 'care-q']);
  await settle(page, 300);
  return page.evaluate(() => {
    const c = document.querySelector('#view .srch-urg'); const box = document.querySelector('#view .searchbox');
    let next = box ? box.nextElementSibling : null; while (next && !next.matches('.srch-urg, .card, .care-sec')) next = next.nextElementSibling;
    return { on: !!c, k: c ? c.dataset.urg : '', h: c ? c.querySelector('h2').innerText : '', sign: c ? c.querySelector('.su-sign').innerText : '',
      tels: c ? [...c.querySelectorAll('a[href^="tel:"]')].map((x) => x.getAttribute('href')) : [], help: c ? !!c.querySelector('[data-go="help"]') : false,
      first: !!c && next === c, arts: [...document.querySelectorAll('#view .art-row')].map((x) => x.dataset.go),
      qa: (document.querySelector('#view .ans-first [data-qa]') || { dataset: {} }).dataset.qa || '' };
  });
};

/* ---------- 1 and 2: signs and near misses, at the cycle stage ---------- */
{
  const a = await open({});
  const S1B = await t(a.page, 's1b'), S1A = await t(a.page, 's1a'), CALL = await t(a.page, 'call_now');
  for (const q of ['bahut bleeding ho rahi hai aur chakkar aa raha hai', 'very heavy bleeding and I feel faint', 'बहुत खून आ रहा है और चक्कर आ रहे हैं',
    'pad har ghante bhig raha hai, saans phool rahi hai', 'period bahut zyada aa raha hai aur aankhon ke aage andhera', 'bleeding with dizziness', 'spotting and I fainted']) {
    const r = await search(a.page, q);
    check('1 "' + q + '": the card first, Help\'s heading and the bleeding sign, Call 108 and Help', r.on && r.k === 's1b' && r.first && r.h === CALL && CALL === 'Go to the nearest hospital now if' && r.sign === S1B && r.tels.join() === 'tel:108' && r.help, r);
  }
  await a.page.screenshot({ path: path.join(SHOTS, '1-bleed-dizzy.png') });
  for (const q of ['period late hai aur ek taraf pet mein dard', 'test positive and shoulder pain', 'period miss ho gaya aur behosh ho gayi', 'late period, one-sided pain']) {
    const r = await search(a.page, q);
    check('1 "' + q + '": the card with the late-period sign', r.on && r.k === 's1a' && r.first && r.sign === S1A && r.tels.join() === 'tel:108', r);
  }
  for (const q of ['I want to die', 'mujhe khudkushi ke khayal aate hain', 'मैं मर जाना चाहती हूँ', 'thoughts of harming myself']) {
    const r = await search(a.page, q);
    check('1 "' + q + '": no card (Version 39.70, the doctors\' answer 2: nothing for thoughts of harm)', !r.on, r);
  }
  for (const q of ['bleeding kitne din normal hai', 'khoon ki kami se chakkar aata hai', 'faint line on pregnancy test', 'blood test report', 'chakkar aate hain', 'heavy bleeding',
    'period late', 'period mein bahut dard ho raha hai aur chakkar', 'this pain is killing me', 'blood group', 'faint t line and late period', 'irregular periods']) {
    const r = await search(a.page, q);
    check('2 "' + q + '": no card', !r.on, r);
  }
  /* Version 39.89 (the Ask Sakhi eval's dry run, 9 Nov): soaking a pad, and "my period is very heavy", with dizziness */
  for (const q of ['My period is very heavy, I\'m soaking a pad every hour and I feel dizzy', 'soaking through a pad every hour and dizzy', 'my periods are so heavy and I feel faint',
    'har ghante pad bhig raha hai aur chakkar aa raha hai', 'हर घंटे पैड भीग रहा है और चक्कर आ रहे हैं']) {
    const r = await search(a.page, q);
    check('1 Version 39.89 "' + q + '": the card with the bleeding sign', r.on && r.k === 's1b' && r.first && r.sign === S1B && r.tels.join() === 'tel:108', r);
  }
  for (const q of ['soaking wet from the rain and I feel dizzy', 'my period is very heavy', 'soaking a pad every hour', 'my period pain is heavy and I feel dizzy', 'the bag is very heavy and I feel dizzy']) {
    const r = await search(a.page, q);
    check('2 Version 39.89 "' + q + '": no card', !r.on, r);
  }
  /* 3 the buttons work: Help opens Help and safety; an empty box shows nothing */
  await search(a.page, 'heavy bleeding and dizzy');
  await a.page.$eval('#view .srch-urg [data-go="help"]', (b) => b.click()); await settle(a.page, 400);
  check('3 Help and safety opens Help', await a.page.evaluate(() => location.hash === '#help'));
  await go(a.page, 'care'); const r0 = await search(a.page, '');
  check('3 an empty search shows no card', !r0.on);
  await go(a.page, 'learn'); const rl = await search(a.page, 'bahut khoon aa raha hai, chakkar', 'learn-q');
  check('3 Learn\'s search shows the card too', rl.on && rl.k === 's1b' && rl.first, rl);
  await done(a);
}

/* ---------- 4 every stage ---------- */
{
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(70) } } });
  const r1 = await search(a.page, 'bleeding ho rahi hai');
  check('4 pregnancy: bleeding alone keeps today\'s quick answer (the danger guide) and no card', !r1.on && r1.qa === 'pregnancy.danger-signs-call-112', r1);
  const r2 = await search(a.page, 'bleeding aur chakkar aa raha hai');
  check('4 pregnancy: bleeding and dizziness, the card first, Call 102, and the danger guide still the quick answer under it', r2.on && r2.k === 's1b' && r2.first && r2.tels.join() === 'tel:102' && r2.qa === 'pregnancy.danger-signs-call-112', r2);
  /* Version 39.89: the baby moving less, with a word or two between, leads with the danger guide */
  for (const q of ['मैं 30 हफ़्ते की गर्भवती हूँ और सुबह से बच्चे की हलचल बहुत कम है', 'baby ki halchal aaj bahut kam hai', 'bachche ki harkat subah se bilkul nahi', 'बच्चे की हलचल सुबह से बिल्कुल नहीं है', 'the baby is moving much less today', 'baby movements are much less since morning']) {
    const r = await search(a.page, q);
    check('4 pregnancy, Version 39.89 "' + q + '": the danger guide first', r.qa === 'pregnancy.danger-signs-call-112', r);
  }
  for (const q of ['baby ki halchal kab mehsoos hoti hai', 'हलचल कब महसूस होती है', 'how many kicks are normal', 'halchal ke baare mein mujhe kuch pata nahi']) {
    const r = await search(a.page, q);
    check('4 pregnancy, Version 39.89 "' + q + '": not a danger sign', r.qa !== 'pregnancy.danger-signs-call-112' && !r.on, r);
  }
  const r3 = await search(a.page, 'baby ko nuksan pahunchane ke khayal');
  check('4 pregnancy: thoughts of harming her baby show no card (Version 39.70)', !r3.on, r3);
  await done(a);
}
{
  const a = await open({ seed: { situation: { deliveredOn: ago(10), breastfeeding: true } } });
  const r = await search(a.page, 'heavy bleeding and dizzy');
  check('4 after the birth: the card', r.on && r.k === 's1b' && r.first, r);
  await done(a);
}
{
  const a = await open({ seed: { dob: '1978-03-01', situation: { midlife: true } } });
  const r = await search(a.page, 'bahut bleeding aur behoshi jaisa lag raha hai');
  check('4 midlife: the card', r.on && r.k === 's1b', r);
  await done(a);
}
{
  const a = await open({ seed: { settings: { discreet: true } } });
  const r = await search(a.page, 'very heavy bleeding and I feel faint');
  check('4 discreet mode: the card still shows (she typed it)', r.on && r.k === 's1b', r);
  await done(a);
}

/* ---------- 5 Hindi, 360 px ---------- */
{
  const a = await open({ seed: { lang: 'hi' }, w: 360 });
  const r = await search(a.page, 'bahut khoon aa raha hai aur chakkar aa rahe hain');
  check('5 Hindi: Help\'s Hindi heading and sign', r.on && r.h === await t(a.page, 'call_now') && /^अभी सबसे पास के अस्पताल जाएँ/.test(r.h) && r.sign === await t(a.page, 's1b') && /[ऀ-ॿ]/.test(r.sign), r);
  check('5 Hindi at 360 px: no sideways scroll', await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await a.page.screenshot({ path: path.join(SHOTS, '5-hindi-360.png') });
  const h = await search(a.page, 'मैं मर जाना चाहती हूँ');
  check('5 Hindi at 360 px: no card for words about harm, and no sideways scroll', !h.on && await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), h);
  await done(a);
}

/* ---------- 6 Version 39.91: heavy bleeding after a birth ---------- */
const BRIEF = ['I delivered 5 days ago and I\'m soaking a pad every hour', 'after delivery heavy bleeding, pad full every hour',
  'delivery ke baad bahut bleeding ho rahi hai, har ghante pad bhar jata hai', 'डिलीवरी के बाद बहुत खून आ रहा है, हर घंटे पैड भर जाता है'];
{
  /* a woman marked after a birth, 5 days ago */
  const a = await open({ seed: { situation: { deliveredOn: ago(5), breastfeeding: true }, events: regular(330) } });
  const CALL = await t(a.page, 'call_now'), U1 = await t(a.page, 'post_u_1'), S1B = await t(a.page, 's1b');
  check('6 the after-birth line is the page\'s own (post_u_1), under the same heading there', U1 === 'You soak a pad in an hour, or pass clots egg-sized or bigger' && await t(a.page, 'post_u_h') === CALL, [U1, CALL]);
  for (const q of BRIEF.concat(['soaking a pad every hour', 'big clots', 'bahut bleeding ho rahi hai', 'heavy bleeding', 'bleeding is very heavy',
    'pads are completely soaked within an hour', 'pad aadhe ghante mein bhar jata hai', 'एक घंटे में पैड भीग जाता है', 'बड़े-बड़े थक्के आ रहे हैं', 'खून बहुत ज़्यादा आ रहा है'])) {
    const r = await search(a.page, q);
    check('6 after a birth "' + q + '": the card first, Help\'s heading, the after-birth line, Call 108 and Help', r.on && r.k === 'post_u_1' && r.first && r.h === CALL && r.sign === U1 && r.tels.join() === 'tel:108' && r.help, r);
  }
  const rd = await search(a.page, BRIEF[0] + ' and I feel dizzy');
  check('6 after a birth, with dizziness: Help\'s own bleeding line (s1b), as before', rd.on && rd.k === 's1b' && rd.sign === S1B && rd.first, rd);
  for (const q of ['bleeding kitne din normal hai', 'how long does bleeding last after delivery', 'bleeding after delivery normal?', 'delivery ke baad khoon ki kami', 'blood test after delivery shows low hb',
    'change pad every 4 hours after delivery', 'pad kitne ghante mein badalna chahiye', 'delivery ke baad pad har 4 ghante mein badalti hoon', 'breast pads soaked every hour', 'milk leaking, pads full every hour',
    'bleeding zyada nahi hai', 'bleeding is not heavy', 'डिलीवरी के बाद ब्लीडिंग ज़्यादा नहीं है', 'clots after delivery', 'bleeding with clots after delivery normal?',
    'fever after delivery', 'delivery ke baad bukhar', 'bahut dard hai aur bleeding bhi', 'bahut thakan hai delivery ke baad', 'my baby feeds every hour']) {
    const r = await search(a.page, q);
    check('6 after a birth, not this sign: "' + q + '": no card', !r.on, r);
  }
  await go(a.page, 'post');
  check('6 the after-birth page shows the same line under the same heading', await a.page.evaluate(([h, u]) => { const f = document.querySelector('#view .flag.urgent'); return !!f && f.querySelector('strong').innerText === h && [...f.querySelectorAll('li')].some((li) => li.innerText === u); }, [CALL, U1]));
  await go(a.page, 'learn'); const rl = await search(a.page, BRIEF[2], 'learn-q');
  check('6 after a birth: Learn\'s search shows the card too', rl.on && rl.k === 'post_u_1' && rl.first, rl);
  await done(a);
}
{
  /* no birth in her diary: her words say the birth (hers, a sister's, a daughter-in-law's) */
  const a = await open({});
  for (const q of BRIEF.concat(['my sister delivered 3 days ago and is soaking a pad every hour', 'meri bahu ki delivery ke baad bade bade thakke aa rahe hain', 'डिलीवरी के बाद बड़े थक्के आ रहे हैं',
    'gave birth last week, passing clots the size of an egg', 'postpartum bleeding soaking pads every 30 minutes', 'since my c-section, bleeding a lot', 'c section ke baad bleeding bahut hai',
    'baby hone ke baad har ghante pad bhig jata hai', 'बच्चा होने के बाद एक घंटे में पैड भीग जाता है', 'प्रसव के बाद बहुत खून बह रहा है', 'I had a baby 2 weeks ago and the bleeding got heavy again',
    'I am 25 years old, I delivered 5 days ago and I\'m soaking a pad every hour', 'meri umar 25 saal hai, delivery ke baad bahut bleeding ho rahi hai'])) {
    const r = await search(a.page, q);
    check('6 her words say a birth "' + q + '": the card with the after-birth line, Call 108', r.on && r.k === 'post_u_1' && r.first && r.tels.join() === 'tel:108', r);
  }
  for (const q of ['soaking a pad every hour', 'big clots', 'heavy bleeding', 'bahut bleeding ho rahi hai', 'heavy bleeding after starting birth control', 'after delivery 2 years ago, heavy bleeding with big clots in periods', 'delivery 2 saal pehle hui thi, ab periods mein bahut bleeding',
    'my periods are heavy since I gave birth', 'after the birth of my baby there was some bleeding', 'how long does bleeding last after delivery', 'fever after delivery']) {
    const r = await search(a.page, q);
    check('6 no birth in her diary, not this sign: "' + q + '": no card', !r.on, r);
  }
  await done(a);
}
{
  /* pregnant, asking about after the birth: the card with her ambulance, 102 */
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(200) } } });
  const r = await search(a.page, BRIEF[1]);
  check('6 pregnant, words about after the birth: the card with Call 102', r.on && r.k === 'post_u_1' && r.tels.join() === 'tel:102', r);
  await done(a);
}
{
  /* Hindi, 360 px */
  const a = await open({ seed: { lang: 'hi', situation: { deliveredOn: ago(5), breastfeeding: true }, events: regular(330) }, w: 360 });
  const r = await search(a.page, BRIEF[3]);
  check('6 Hindi: Help\'s Hindi heading and the after-birth page\'s Hindi line', r.on && r.k === 'post_u_1' && r.h === await t(a.page, 'call_now') && r.sign === await t(a.page, 'post_u_1') && /^एक घंटे में पैड भीग जाए/.test(r.sign), r);
  check('6 Hindi at 360 px: no sideways scroll', await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await a.page.screenshot({ path: path.join(SHOTS, '6-after-birth-hindi-360.png') });
  await done(a);
}

/* ---------- 7 Version 39.92: a pregnancy in her words ---------- */
const DG = 'pregnancy.danger-signs-call-112';
{
  /* not marked pregnant: her words say someone is pregnant now */
  const a = await open({});
  for (const q of ['my sister is 7 months pregnant and had a fit', 'मेरी बहन 7 महीने की प्रेग्नेंट है, उसे दौरा पड़ा', 'meri behen 7 mahine ki pregnant hai, use daura pada',
    'I am pregnant and bleeding', 'main pregnant hoon aur bleeding ho rahi hai', 'मैं गर्भवती हूँ और खून आ रहा है', 'my wife is 8 months pregnant and the baby is moving less',
    'satwa mahina chal raha hai, pani nikal raha hai', 'I\'m 30 weeks pregnant with a severe headache and blurred vision', 'pata chala ki main pregnant hoon, ab spotting ho rahi hai']) {
    const r = await search(a.page, q);
    check('7 her words say a pregnancy now "' + q + '": the danger guide leads, no card (as in pregnancy)', r.qa === DG && !r.on, r);
  }
  for (const q of ['how to get pregnant', 'can I get pregnant while bleeding', 'kya main pregnant hoon, bleeding ho rahi hai', 'pregnant hone ke liye kya karein, bleeding', 'I\'m not pregnant but bleeding',
    'main pregnant nahi hoon, bleeding ho rahi hai', 'क्या मैं प्रेग्नेंट हूँ, खून आ रहा है', 'is bleeding normal in pregnancy', 'in my last pregnancy I had bleeding', 'when I was pregnant I had fits',
    'pregnant women and fever', 'chances of getting pregnant with spotting', 'pregnancy test faint line, am I pregnant', 'bleeding ho rahi hai']) {
    const r = await search(a.page, q);
    check('7 not a pregnancy now "' + q + '": not the danger guide', r.qa !== DG, r);
  }
  await done(a);
}
{
  /* marked pregnant: fits and fainting as words */
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(200) } } });
  for (const q of ['benefits of yoga', 'how to stay fit in pregnancy', 'I am pregnant, benefits of walking', 'faint line on my test']) {
    const r = await search(a.page, q);
    check('7 pregnancy "' + q + '": not a sign, so not the danger guide', r.qa !== DG, r);
  }
  for (const q of ['she had a fit', 'fits aa rahe hain', 'usko fit aaya', 'I fainted this morning', 'bleeding ho rahi hai']) {
    const r = await search(a.page, q);
    check('7 pregnancy "' + q + '": still the danger guide', r.qa === DG, r);
  }
  await done(a);
}
{
  /* Hindi, 360 px */
  const a = await open({ seed: { lang: 'hi' }, w: 360 });
  const r = await search(a.page, 'मेरी बहन 7 महीने की प्रेग्नेंट है, उसे दौरा पड़ा');
  check('7 Hindi: the danger guide leads for her sister\'s pregnancy', r.qa === DG, r);
  check('7 Hindi at 360 px: no sideways scroll', await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await a.page.screenshot({ path: path.join(SHOTS, '7-sister-hindi-360.png') });
  await done(a);
}

/* ---------- 8 Version 39.93: the after-birth page's other two lines, and two more pregnancy signs ---------- */
const HEAD_Q = ['I had my baby 10 days ago. Since morning I have a terrible headache and my vision is blurry.', 'Meri bhabhi ki delivery 2 hafte pehle hui thi, aaj use daura pada',
  'delivery ke baad sir mein bahut tez dard hai', 'डिलीवरी के बाद सिर में बहुत तेज़ दर्द है और धुंधला दिख रहा है'];
const CLOT_Q = ['डिलीवरी को 3 हफ़्ते हुए, सीने में दर्द है और साँस फूल रही है', '2 weeks after my c-section, my left calf is swollen and it hurts',
  'delivery ke baad seene mein dard aur saans phool rahi hai', 'after delivery one leg is swollen and painful'];
{
  /* a woman marked after a birth, 10 days ago */
  const a = await open({ seed: { situation: { deliveredOn: ago(10), breastfeeding: true }, events: regular(330) } });
  const CALL = await t(a.page, 'call_now'), U2 = await t(a.page, 'post_u_2'), U3 = await t(a.page, 'post_u_3');
  check('8 the after-birth lines are the page\'s own (post_u_2, post_u_3), under the same heading there', U2 === 'Severe headache, blurred vision or flashing lights, or fits' && U3 === 'Chest pain, breathlessness, or pain and swelling in one calf' && await t(a.page, 'post_u_h') === CALL, [U2, U3]);
  for (const q of HEAD_Q.concat(['severe headache since morning', 'my head hurts terribly and painkillers don\'t help', 'blurred vision', 'I see flashing lights', 'aankhon ke aage chamak dikh rahi hai',
    'सिर में बहुत तेज़ दर्द है', 'धुंधला दिख रहा है', 'she had a fit', 'mujhe jhatke aaye', 'उसे दौरा पड़ा'])) {
    const r = await search(a.page, q);
    check('8 after a birth "' + q + '": the card first, Help\'s heading, the headache and fits line, Call 108 and Help', r.on && r.k === 'post_u_2' && r.first && r.h === CALL && r.sign === U2 && r.tels.join() === 'tel:108' && r.help, r);
  }
  for (const q of CLOT_Q.concat(['chest pain', 'I am breathless', 'I can\'t breathe properly', 'saans lene mein dikkat ho rahi hai', 'साँस लेने में दिक्कत है', 'my calf hurts and is swollen',
    'ek pair mein sujan aur dard hai', 'दाएँ पैर की पिंडली में दर्द और सूजन है', 'is this a blood clot in my leg'])) {
    const r = await search(a.page, q);
    check('8 after a birth "' + q + '": the card first, the chest, breath and calf line, Call 108', r.on && r.k === 'post_u_3' && r.first && r.h === CALL && r.sign === U3 && r.tels.join() === 'tel:108', r);
  }
  const rb = await search(a.page, 'I delivered 10 days ago, soaking a pad every hour and a bad headache');
  check('8 after a birth, heavy bleeding with a headache: the bleeding line first (post_u_1)', rb.on && rb.k === 'post_u_1', rb);
  for (const q of ['headache after delivery, is it normal', 'sir dard hai', 'mild headache', 'both feet are swollen after delivery', 'dono pairon mein sujan hai', 'my legs ache',
    'breast pain while feeding', 'chest pain while breastfeeding, my breasts are full', 'seene mein jalan hai', 'baby ki saans tez chal rahi hai', 'my baby is breathing fast while sleeping',
    'is it normal for a newborn to breathe fast', 'bachche ki saans mein awaaz aati hai', 'fever after delivery', 'thoughts of hurting my baby', 'baby ko nuksan pahunchane ke khayal',
    'my eyes are tired from no sleep', 'calf muscle cramps at night']) {
    const r = await search(a.page, q);
    check('8 after a birth, not these signs: "' + q + '": no card', !r.on, r);
  }
  await done(a);
}
{
  /* no birth in her diary: her words say the birth */
  const a = await open({});
  for (const q of HEAD_Q) {
    const r = await search(a.page, q);
    check('8 her words say a birth "' + q + '": the headache and fits line', r.on && r.k === 'post_u_2' && r.first && r.tels.join() === 'tel:108', r);
  }
  for (const q of CLOT_Q) {
    const r = await search(a.page, q);
    check('8 her words say a birth "' + q + '": the chest, breath and calf line', r.on && r.k === 'post_u_3' && r.first && r.tels.join() === 'tel:108', r);
  }
  for (const q of ['severe headache and blurred vision', 'chest pain and breathless', 'my calf hurts after running', 'I had a fit last night', 'delivery 2 saal pehle hui thi, ab sir mein bahut dard rehta hai',
    'after my delivery 3 years ago I get chest pain', 'headache after starting birth control']) {
    const r = await search(a.page, q);
    check('8 no birth in her diary or her words, or one years ago: "' + q + '": no card', !r.on, r);
  }
  await done(a);
}
{
  /* pregnant, 30 weeks: two more danger-guide signs; no card in search, as in pregnancy */
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(210) } } });
  for (const q of ['tightening pains every 10 minutes', 'har 10 minute mein dard aa raha hai', 'हर 5 मिनट में दर्द हो रहा है', 'contractions every 5 to 10 minutes', 'I think my contractions have started',
    'labour pain shuru ho gaya', 'लेबर पेन शुरू हो गया', 'vomiting everything, even water', 'ulti ruk nahi rahi', '2 din se paani bhi ulti ho jata hai, kuch nahi tikta', 'उल्टी रुक नहीं रही']) {
    const r = await search(a.page, q);
    check('8 pregnancy, 30 weeks, "' + q + '": the danger guide leads, no card (as in pregnancy)', r.qa === DG && !r.on, r);
  }
  for (const q of ['I vomit every morning', 'subah ulti hoti hai', 'nausea in pregnancy', 'are braxton hicks contractions normal', 'when do contractions start', 'what does labour pain feel like',
    'back pain while sitting', 'I feed every 2 hours']) {
    const r = await search(a.page, q);
    check('8 pregnancy, 30 weeks, not these signs: "' + q + '": not the danger guide', r.qa !== DG && !r.on, r);
  }
  await done(a);
}
{
  /* at 38 weeks: regular pains are labour's time (the labour timer, Version 39.40), not this sign; vomiting still is */
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(266) } } });
  const r1 = await search(a.page, 'contractions every 5 minutes');
  check('8 pregnancy, 38 weeks: contractions every 5 minutes are not this sign', r1.qa !== DG, r1);
  const r2 = await search(a.page, 'vomiting all day and nothing stays down');
  check('8 pregnancy, 38 weeks: vomiting that will not stop still leads with the danger guide', r2.qa === DG, r2);
  await done(a);
}
{
  /* not marked pregnant: her words give the week */
  const a = await open({});
  for (const q of ['I\'m 30 weeks pregnant and I\'m getting tightening pains every 10 minutes', '8 mahine ki pregnant hu, har 10 minute mein dard', '9 hafte pregnant hu, 2 din se paani bhi ulti ho jata hai, kuch nahi tikta']) {
    const r = await search(a.page, q);
    check('8 her words say a pregnancy before 37 weeks "' + q + '": the danger guide leads', r.qa === DG, r);
  }
  for (const q of ['I\'m 38 weeks pregnant and having contractions every 5 minutes', '9 mahine ki pregnant hu, har 5 minute mein dard', 'nauva mahina chal raha hai, har 5 minute mein dard']) {
    const r = await search(a.page, q);
    check('8 her words say 37 weeks or more "' + q + '": not this sign', r.qa !== DG, r);
  }
  await done(a);
}
{
  /* Hindi, 360 px */
  const a = await open({ seed: { lang: 'hi', situation: { deliveredOn: ago(10), breastfeeding: true }, events: regular(330) }, w: 360 });
  const r = await search(a.page, CLOT_Q[0]);
  check('8 Hindi: Help\'s Hindi heading and the after-birth page\'s Hindi line', r.on && r.k === 'post_u_3' && r.h === await t(a.page, 'call_now') && r.sign === await t(a.page, 'post_u_3') && /^सीने में दर्द/.test(r.sign), r);
  check('8 Hindi at 360 px: no sideways scroll', await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await a.page.screenshot({ path: path.join(SHOTS, '8-after-birth-chest-hindi-360.png') });
  const r2 = await search(a.page, HEAD_Q[3]);
  check('8 Hindi: the headache and fits line', r2.on && r2.k === 'post_u_2' && /^तेज़ सिरदर्द/.test(r2.sign), r2);
  await done(a);
}

check('5 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'urgent: all ') + results.length + ' checks' + (failed.length ? '' : ' passed'));
process.exit(failed.length ? 1 : 0);
