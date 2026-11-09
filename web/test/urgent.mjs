// Version 39.30: a danger sign typed in search, for every woman (the Cykel walk, 28 Oct; mockup
// claude.ai/artifact/Y4Kom9DHfyiw4buDUQRi8B; MODULE_API section 73). Until now only a pregnant woman's search put the danger
// guide first; for everyone else "bahut bleeding ho rahi hai aur chakkar aa raha hai" opened After an abortion. This file checks:
//   1 Help's "Call 112 now" signs in her words (English, Hinglish, Hindi) put one card first: Help's heading and the sign she
//     typed, Call 112 now and Help and safety. Version 39.70 (the doctors' review, part 2): the heading is "Go to the nearest
//     hospital now if" and the button calls her ambulance (108, or 102 in pregnancy); words about harming herself show no card;
//   2 words that are not a sign show no card: bleeding or dizziness alone, "khoon ki kami", a blood test, a faint test line;
//   3 its buttons: tel: links and Help; Learn's search shows it too;
//   4 every stage: after the birth, midlife, and pregnancy (the danger guide still the quick answer under it), discreet mode;
//   5 Hindi, and 360 px without sideways scroll; no page errors.
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

check('5 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'urgent: all ') + results.length + ' checks' + (failed.length ? '' : ' passed'));
process.exit(failed.length ? 1 : 0);
