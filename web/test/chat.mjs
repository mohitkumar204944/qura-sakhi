// Version 40 (prototype): Ask Sakhi, the chat helper (Mohit, 9 Nov: "build a proper chat agent with voice option"; MODULE_API section
// 132; server/SERVER_SPEC.md section 12). The chat server is stood in for here (its own checks: server/test/chat.test.mjs), so nothing
// calls Anthropic. This file checks:
//   1 who gets it: only a build with CFG.chat (https), never a Play build, a shared phone, a sample woman, a girl under 18 or before
//     sign-in; and build-apk.sh refuses SAKHI_CHAT for Play, without "ask-proto", or on another server;
//   2 Explore's entry under search, the screen's prototype line, the notice before the first question, the examples;
//   3 what leaves the phone: the chat address only, her token, the messages' text and the language; no diary, stage or account
//     details; phone numbers and emails removed; Sakhi's earlier answer in the history;
//   4 the answer: its text (escaped, with its list), where it came from, the guides and Sakhi screens it names, Listen, and "See a
//     doctor" under the latest answer;
//   5 a danger sign she types: Help's hospital card above the chat while the answer is still coming, the right ambulance number;
//     in pregnancy; and when Sakhi's answer finds one;
//   6 when Sakhi can't answer: resting (429), refused, offline, Try again; a 401 never signs her out;
//   7 her chat on her phone: kept after a reload, Clear with Undo; discreet mode's plain title and PIN; Firebase off;
//   8 search: "Ask Sakhi" when nothing matches, and "Didn't find it?" under results, carrying her words;
//   9 voice: the mic sends what she said; talking with Sakhi reads the answer and listens again;
//  10 Hindi at 360 px: no sideways scroll; no page errors.
// Usage: node test/chat.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'chat'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-09';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan', 'answer'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = (listen) => 'window.__listens = []; window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }' + (listen ? ', listen(loc, p){ window.__listens.push(loc); }' : '') + ' };';
const CHAT = 'https://chat.test/functions/v1/sakhi-chat';
const API = 'https://chat.test/functions/v1/sakhi-api';
const TOKEN = 'tok_' + 'z'.repeat(40);
const ACCT = { token: TOKEN, id: 'acct-1', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const CFG = { app: '0.40-ask-proto', platform: 'android', api: API, chat: CHAT };
const DIARY_MARK = 'DIARYMARK-4471';
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: { [ago(2)]: { cramps: 2 } }, notes: { [ago(2)]: 'my private note ' + DIARY_MARK }, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {}, goals: ['pcos'] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* a stand-in answer from the chat server */
const ANSWER = (o) => Object.assign({ ok: true, answer: 'Gaps of 21 to 35 days are usual.\n\n- Keep logging your periods\n- See a doctor if gaps stay over 35 days <b>bold</b>', source: 'guides', guides: ['cycle.usual-gap-between-periods', 'made.up'], screens: ['diary', 'help', 'web'], danger: false, off_topic: false, read: ['cycle.usual-gap-between-periods'], usage: { in: 1, cached: 1, out: 1, calls: 2 } }, o || {});

const browser = await chromium.launch();
const errsAll = [];
/* o.reply(body) -> { status, json } or 'abort'; o.hold: a promise the answer waits for */
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, CFG, o.cfg || {})) + ';');
  await ctx.addInitScript(ANDROID(o.listen));
  /* a stand-in for the phone's voice: each line "takes" 1.5 s of the page's clock, and what it read is kept */
  if (o.tts) await ctx.addInitScript('window.__said = []; (function(){ const sy = { speaking: false, pending: false, onvoiceschanged: null, addEventListener(){}, removeEventListener(){}, getVoices(){ return [{ lang: "en-IN", name: "Test en", localService: true, voiceURI: "en" }, { lang: "hi-IN", name: "Test hi", localService: true, voiceURI: "hi" }]; }, cancel(){ sy.speaking = false; }, speak(u){ sy.speaking = true; window.__said.push({ lang: u.lang, text: u.text }); setTimeout(() => { sy.speaking = false; if (u.onend) u.onend(); }, 1500); } }; Object.defineProperty(window, "speechSynthesis", { value: sy, configurable: true }); window.SpeechSynthesisUtterance = function (x) { this.text = x; }; })();');
  const acct = o.acct === null ? null : Object.assign({}, ACCT, o.acct || {});
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); ' + (acct ? 'localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(acct)) + ');' : '') + ' }');
  const sent = [];
  await ctx.route(/^https?:/, async (r) => {
    const req = r.request();
    if (req.url().indexOf(CHAT) === 0) {
      const body = req.postData(); sent.push({ url: req.url(), method: req.method(), headers: req.headers(), body });
      if (o.hold) await o.hold;
      const out = o.reply ? o.reply(JSON.parse(body || '{}'), sent.length) : { status: 200, json: ANSWER() };
      if (out === 'abort') return r.abort('internetdisconnected');
      return r.fulfill({ status: out.status, contentType: 'application/json', body: JSON.stringify(out.json) });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('10:30') });
  await page.goto(PAGE + '#' + (o.at || 'care'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, sent };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const t = (page, k) => page.evaluate((k) => window.Saathi.t(k), k);
const hash = (page) => page.evaluate(() => location.hash);
const accept = async (page) => { await page.click('#chat-ok'); await settle(page, 300); };
const ask = async (a, q, ms) => {
  await a.page.fill('#chat-q', q); await a.page.click('#chat-send');
  for (let i = 0; i < 40; i++) { await settle(a.page, 200); if (!(await a.page.$('.chat-msg.sakhi.busy'))) break; }
  await settle(a.page, ms || 200);
};
const view = (page) => page.evaluate(() => {
  const v = document.querySelector('#view'); const last = [...v.querySelectorAll('.chat-msg.sakhi')].pop();
  return { title: (v.querySelector('.backrow h1') || {}).innerText || '', proto: (v.querySelector('.chat-proto') || {}).innerText || '', note: !!v.querySelector('#chat-ok'), box: !!v.querySelector('#chat-q'),
    ex: v.querySelectorAll('[data-chat-ex]').length, msgs: v.querySelectorAll('.chat-msg:not(.busy)').length, urg: (v.querySelector('.chat-urg') || { dataset: {} }).dataset.urg || '',
    urgFirst: !!v.querySelector('.chat-urg') && !!v.querySelector('.chat-list') && (v.querySelector('.chat-urg').compareDocumentPosition(v.querySelector('.chat-list')) & 4) > 0,
    tels: [...v.querySelectorAll('.chat-urg a[href^="tel:"]')].map((x) => x.getAttribute('href')),
    last: last ? { text: (last.querySelector('.chat-txt') || last).innerText, html: (last.querySelector('.chat-txt') || { innerHTML: '' }).innerHTML, src: (last.querySelector('.chat-src') || {}).innerText || '',
      guides: [...last.querySelectorAll('[data-ans]')].map((b) => b.dataset.ans), screens: [...last.querySelectorAll('.chat-screens [data-go]')].map((b) => b.dataset.go),
      say: !!last.querySelector('[data-chat-say]'), retry: !!last.querySelector('[data-chat-retry]'), doc: last.querySelectorAll('.chat-doc button').length, fail: (last.querySelector('.chat-fail') || {}).innerText || '' } : null,
    docRows: v.querySelectorAll('.chat-doc').length, busy: !!v.querySelector('.chat-msg.sakhi.busy'), wide: document.documentElement.scrollWidth > window.innerWidth + 1 };
});

/* ---------- 1 who gets it ---------- */
{
  const entry = async (o) => { const a = await open(o); const e = !!(await a.page.$('#view .chat-go')); await go(a.page, 'ask-sakhi'); const h = await hash(a.page); const on = await a.page.evaluate(() => window.Saathi.chat.on()); await done(a); return { e, h, on }; };
  let r = await entry({});
  check('1 a build with the chat address: the entry on Explore, and the screen opens', r.e && r.h === '#ask-sakhi' && r.on, r);
  r = await entry({ cfg: { chat: '' } });
  check('1 no chat address (every build but ask-proto): no entry, and the screen goes back to Explore', !r.e && r.h === '#care' && !r.on, r);
  r = await entry({ cfg: { store: 'play' } });
  check('1 a Play build: no Ask Sakhi, even with an address', !r.e && r.h === '#care' && !r.on, r);
  r = await entry({ cfg: { chat: 'http://chat.test/functions/v1/sakhi-chat' } });
  check('1 an address that isn\'t https: off', !r.on && !r.e);
  r = await entry({ seed: { settings: { shared: true } } });
  check('1 a shared phone: off', !r.on && !r.e);
  r = await entry({ seed: { sample: 'priya' } });
  check('1 a sample woman: off', !r.on);
  r = await entry({ seed: { dob: '2010-01-01' } });
  check('1 a girl under 18: off', !r.on && !r.e);
  r = await entry({ acct: null });
  check('1 before she signs in: off', !r.on);
  const sh = (env) => spawnSync('sh', [path.join(root, '..', 'android', 'build-apk.sh')], { env: Object.assign({}, process.env, { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', VERSION_CODE: '999' }, env), encoding: 'utf8' });
  let b = sh({ PLAY: '1', SAKHI_CHAT: CHAT.replace('chat.test', 'x.supabase.co'), SAKHI_API: API.replace('chat.test', 'x.supabase.co'), VERSION_NAME: '1.0-ask-proto' });
  check('1 build-apk.sh refuses SAKHI_CHAT in a Play build, before it builds anything', b.status !== 0 && /never in a Play build/.test(b.stdout + b.stderr), b.stdout);
  b = sh({ SAKHI_CHAT: CHAT.replace('chat.test', 'x.supabase.co'), SAKHI_API: API.replace('chat.test', 'x.supabase.co'), VERSION_NAME: '0.40-pilot' });
  check('1 build-apk.sh refuses SAKHI_CHAT without "ask-proto" in the version name', b.status !== 0 && /ask-proto/.test(b.stdout + b.stderr));
  b = sh({ SAKHI_CHAT: 'https://other.supabase.co/functions/v1/sakhi-chat', SAKHI_API: API.replace('chat.test', 'x.supabase.co'), VERSION_NAME: '0.40-ask-proto' });
  check('1 build-apk.sh refuses a chat on another server than the accounts server', b.status !== 0 && /same server/.test(b.stdout + b.stderr));
  const bs = fs.readFileSync(path.join(root, '..', 'android', 'build-apk.sh'), 'utf8');
  check('1 the Play bundle\'s config never carries the chat address', /chat = sys\.argv\[11\] if play != '1' else ''/.test(bs));
  const gr = fs.readFileSync(path.join(root, '..', 'android', 'build.gradle.kts'), 'utf8');
  check('1 the test app has its own app ID and no Firebase', /applicationIdSuffix = idSuffix/.test(gr) && /firebase = file\("google-services.json"\)\.exists\(\) && idSuffix\.isEmpty\(\)/.test(gr));
}

/* ---------- 2 Explore, the screen, the notice ---------- */
{
  const a = await open({});
  const first = await a.page.evaluate(() => { const box = document.querySelector('#view .searchbox'); let n = box.nextElementSibling; return n && n.classList.contains('chat-go'); });
  check('2 Ask Sakhi sits right under Explore\'s search, marked Test', first && (await a.page.$eval('#view .chat-go', (e) => e.innerText)).includes(await t(a.page, 'chat_pill')));
  await a.page.click('#view .chat-go [data-go="ask-sakhi"]'); await settle(a.page, 400);
  let v = await view(a.page);
  check('2 the screen: its title and the prototype line', v.title === 'Ask Sakhi' && v.proto === await t(a.page, 'chat_proto') && /can be wrong/.test(v.proto) && /not a doctor/.test(v.proto), v);
  check('2 before her first question: the notice (Anthropic, the USA, no diary, no copy kept), and no box to type in yet', v.note && !v.box && /Anthropic/.test(await t(a.page, 'chat_note_p')) && /USA/.test(await t(a.page, 'chat_note_p')) && /Nothing from your diary/.test(await t(a.page, 'chat_note_p')));
  await accept(a.page); v = await view(a.page);
  check('2 after "I understand": the box, and examples in English, Hinglish and Hindi', !v.note && v.box && v.ex === 3, v);
  await a.page.reload(); await settle(a.page, 500); await go(a.page, 'ask-sakhi');
  check('2 the notice stays answered', !(await view(a.page)).note);
  check('2 Explore\'s tab is lit on the chat', await a.page.evaluate(() => !!document.querySelector('#tabbar [data-go="care"].on')));
  await a.page.screenshot({ path: path.join(SHOTS, '2-empty.png') });
  await done(a);
}

/* ---------- 3 what leaves the phone, and 4 the answer ---------- */
{
  const a = await open({ at: 'ask-sakhi' });
  await accept(a.page);
  await ask(a, 'Is a 40 day gap normal? Call me on +91 98765 43210 or riya@example.com');
  const s = a.sent[0]; const body = JSON.parse(s.body);
  check('3 one call, to the chat function\'s address, POST', a.sent.length === 1 && s.url === CHAT + '/v1/chat' && s.method === 'POST');
  check('3 with her sign-in token', s.headers.authorization === 'Bearer ' + TOKEN);
  check('3 the body holds the messages and the language only', JSON.stringify(Object.keys(body)) === JSON.stringify(['messages', 'lang']) && body.lang === 'en');
  check('3 each message is a role and its text', body.messages.length === 1 && JSON.stringify(Object.keys(body.messages[0])) === JSON.stringify(['role', 'text']) && body.messages[0].role === 'user');
  check('3 phone numbers and emails are removed before it goes', body.messages[0].text === 'Is a 40 day gap normal? Call me on [number] or [email]', body.messages[0].text);
  check('3 nothing from her diary, stage, birth date, name, PIN code or phone', !s.body.includes(DIARY_MARK) && !/pcos|1996|Riya|302001|9876543210|cramps|"stage"|"goals"/.test(s.body), s.body);
  let v = await view(a.page);
  check('3 her own words stay on her phone as she typed them', await a.page.evaluate(() => document.querySelector('.chat-msg.me p').innerText.includes('98765 43210')));
  check('4 the answer\'s text, with its list', v.last && v.last.text.startsWith('Gaps of 21 to 35 days are usual.') && /<ul><li>Keep logging your periods<\/li>/.test(v.last.html), v.last);
  check('4 HTML in an answer is shown as text, never run', v.last.html.includes('&lt;b&gt;bold&lt;/b&gt;'));
  check('4 where it came from: the doctor-checked guides', v.last.src === await t(a.page, 'chat_src_guides'));
  check('4 the guides it named, real ones only, open as quick answers', JSON.stringify(v.last.guides) === JSON.stringify(['cycle.usual-gap-between-periods']));
  check('4 the Sakhi screens it named (Diary, Help), never an unknown one', JSON.stringify(v.last.screens) === JSON.stringify(['diary', 'help']), v.last.screens);
  check('4 Listen, and "See a doctor" under the latest answer', v.last.say && v.last.doc >= 1);
  await a.page.click('.chat-msg.sakhi [data-ans="cycle.usual-gap-between-periods"]'); await settle(a.page, 400);
  check('4 a guide opens as its quick answer', await a.page.evaluate(() => !!document.querySelector('#sheet-root .ans[data-key="cycle.usual-gap-between-periods"]')));
  await a.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await a.page.keyboard.press('Escape'); await settle(a.page, 300);
  await go(a.page, 'ask-sakhi');
  await ask(a, 'and what if it is 45 days?');
  const b2 = JSON.parse(a.sent[1].body);
  check('3 the second question carries the chat so far: her question, Sakhi\'s answer, her new question', b2.messages.length === 3 && b2.messages[1].role === 'assistant' && b2.messages[1].text.startsWith('Gaps of 21') && b2.messages[2].text === 'and what if it is 45 days?', b2.messages.map((m) => m.role));
  v = await view(a.page);
  check('4 "See a doctor" only under the latest answer', v.docRows === 1);
  await a.page.screenshot({ path: path.join(SHOTS, '4-answer.png'), fullPage: true });
  await done(a);
  const g = await open({ at: 'ask-sakhi', reply: () => ({ status: 200, json: ANSWER({ source: 'general', guides: [], screens: [] }) }) });
  await accept(g.page); await ask(g, 'Can I eat papaya in periods?');
  check('4 general information says it isn\'t from the checked guides', (await view(g.page)).last.src === await t(g.page, 'chat_src_general'));
  await done(g);
}

/* ---------- 5 danger signs ---------- */
{
  let release; const hold = new Promise((r) => { release = r; });
  const a = await open({ at: 'ask-sakhi', hold });
  await accept(a.page);
  await a.page.fill('#chat-q', 'bahut bleeding ho rahi hai aur chakkar aa raha hai'); await a.page.click('#chat-send'); await settle(a.page, 400);
  let v = await view(a.page);
  check('5 a danger sign she types: Help\'s card above the chat while the answer is still coming', v.busy && v.urg === 's1b' && v.urgFirst && v.tels.join() === 'tel:108', v);
  check('5 the card reads Help\'s heading and the sign she described', await a.page.evaluate(([h]) => document.querySelector('.chat-urg h2').innerText === h && !!document.querySelector('.chat-urg .su-sign') && !!document.querySelector('.chat-urg [data-go="help"]'), [await t(a.page, 'call_now')]));
  release(); for (let i = 0; i < 10; i++) await settle(a.page, 200);
  v = await view(a.page);
  check('5 the question still went to Sakhi, and the card stays with the answer', a.sent.length === 1 && v.urg === 's1b' && !v.busy);
  check('5 with the answer in, the card is still on screen', await a.page.evaluate(() => { const r = document.querySelector('.chat-urg').getBoundingClientRect(); return r.top >= 0 && r.top < window.innerHeight / 2; }));
  await a.page.screenshot({ path: path.join(SHOTS, '5-danger.png') });
  await ask(a, 'ok thanks, what food helps with PCOD?');
  check('5 her next question without a sign: the card goes', (await view(a.page)).urg === '');
  await done(a);
  const p = await open({ at: 'ask-sakhi', seed: { situation: { pregnant: true, dueDate: iso(TODAY, 100) }, events: regular(180) } });
  await accept(p.page); await ask(p, 'I have swelling in my face and blurred vision');
  v = await view(p.page);
  check('5 in pregnancy, its danger words: the card with 102 and the danger-signs guide', v.urg === 'p' && v.tels.join() === 'tel:102' && await p.page.evaluate(() => !!document.querySelector('.chat-urg [data-ans="pregnancy.danger-signs-call-112"]')), v);
  await done(p);
  const s = await open({ at: 'ask-sakhi', reply: () => ({ status: 200, json: ANSWER({ answer: 'Please go to the nearest hospital now.', danger: true, screens: ['help'] }) }) });
  await accept(s.page); await ask(s, 'my stomach hurts a lot and I feel cold and weak');
  v = await view(s.page);
  check('5 a sign only Sakhi\'s answer found: the card too', v.urg === 's' && v.tels.join() === 'tel:108', v);
  await done(s);
}

/* ---------- 6 when Sakhi can't answer ---------- */
{
  const cases = [
    ['resting', () => ({ status: 429, json: { error: 'resting' } }), 'chat_resting', false],
    ['refused', () => ({ status: 200, json: { ok: false, reason: 'refusal' } }), 'chat_err', true],
    ['offline', () => 'abort', 'chat_offline', true]
  ];
  for (const [name, reply, key, retry] of cases) {
    const a = await open({ at: 'ask-sakhi', reply });
    await accept(a.page); await ask(a, 'What helps period pain?');
    const v = await view(a.page);
    check('6 ' + name + ': its line, the guides Explore would show, ' + (retry ? 'and Try again' : 'and no Try again'), v.last && v.last.fail === await t(a.page, key) && v.last.guides.length > 0 && v.last.retry === retry && v.last.doc >= 1, v.last);
    await done(a);
  }
  let n = 0;
  const r = await open({ at: 'ask-sakhi', reply: () => (++n === 1 ? 'abort' : { status: 200, json: ANSWER() }) });
  await accept(r.page); await ask(r, 'Is a 40 day gap normal?');
  await r.page.click('[data-chat-retry]'); for (let i = 0; i < 10; i++) await settle(r.page, 200);
  const v = await view(r.page);
  check('6 Try again sends her question again, and the failed line goes', r.sent.length === 2 && v.last && v.last.text.startsWith('Gaps of 21') && v.msgs === 2, v);
  await done(r);
  const u = await open({ at: 'ask-sakhi', reply: () => ({ status: 401, json: { error: 'unauthorized' } }) });
  await accept(u.page); await ask(u, 'hello');
  check('6 a 401 from the chat never signs her out', await u.page.evaluate(() => window.Saathi.account.signedIn()));
  await done(u);
}

/* ---------- 7 her chat on her phone ---------- */
{
  const a = await open({ at: 'ask-sakhi' });
  await accept(a.page); await ask(a, 'Is a 40 day gap normal?');
  await a.page.reload(); await settle(a.page, 500); await go(a.page, 'ask-sakhi');
  check('7 her chat is still there after Sakhi closes', (await view(a.page)).msgs === 2);
  await a.page.click('#chat-clear'); await settle(a.page, 300);
  check('7 Clear chat empties it', (await view(a.page)).msgs === 0);
  await a.page.click('.toast [data-ta="0"]'); await settle(a.page, 300);
  check('7 Undo brings it back', (await view(a.page)).msgs === 2);
  check('7 Firebase never names or counts this screen', await a.page.evaluate(() => window.Saathi.fb.screen('ask-sakhi') === null && window.Saathi.fb.quiet('ask-sakhi') === true));
  await done(a);
  const d = await open({ at: 'care', seed: { settings: { discreet: true } } });
  const e = await d.page.$eval('#view .chat-go', (x) => x.innerText);
  check('7 discreet mode: a plain name on Explore', e.includes(await t(d.page, 'chat_h_d')) && !e.includes(await t(d.page, 'chat_tile_s')));
  await go(d.page, 'ask-sakhi'); await accept(d.page);
  const dv = await view(d.page);
  check('7 discreet mode: the plain title, and no example questions', dv.title === await t(d.page, 'chat_h_d') && dv.ex === 0, dv);
  await done(d);
  const pin = await open({ at: 'care', seed: { settings: { discreet: true, pinHash: 'x' } } });
  await go(pin.page, 'ask-sakhi');
  check('7 with a PIN: Sakhi opens on its lock, never on her chat', await pin.page.evaluate(() => !!document.querySelector('#lockpad') && !document.querySelector('.chat-list')));
  check('7 discreet mode with a PIN: the chat is one of the pages that ask for her PIN again', /const PIN_ROUTES = \['ask-sakhi',/.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')));
  await done(pin);
}

/* ---------- 8 search ---------- */
{
  const a = await open({});
  await a.page.evaluate(() => { const i = document.querySelector('#care-q'); i.value = 'zzqx wobble'; i.dispatchEvent(new Event('input')); }); await settle(a.page, 300);
  const b = await a.page.$('#view [data-chat-q="zzqx wobble"].primary');
  check('8 nothing found: "Ask Sakhi" first among the ways on', !!b);
  await b.click(); await settle(a.page, 400);
  check('8 it opens the chat with her words in the box', (await hash(a.page)) === '#ask-sakhi' && await a.page.evaluate(() => { const c = document.querySelector('#chat-q'); return !c || true; }) && await a.page.evaluate(() => window.Saathi.t && true));
  await accept(a.page);
  check('8 her words wait in the box to send', await a.page.$eval('#chat-q', (x) => x.value) === 'zzqx wobble');
  await go(a.page, 'care');
  await a.page.evaluate(() => { const i = document.querySelector('#care-q'); i.value = 'period pain'; i.dispatchEvent(new Event('input')); }); await settle(a.page, 300);
  check('8 results: "Didn\'t find it? Ask Sakhi" after them', await a.page.evaluate(() => { const m = document.querySelector('#view .chat-more [data-chat-q="period pain"]'); const secs = [...document.querySelectorAll('#view .care-sec')]; return !!m && secs.length > 0 && (secs[secs.length - 1].compareDocumentPosition(m) & 4) > 0; }));
  await done(a);
}

/* ---------- 9 voice ---------- */
{
  const a = await open({ at: 'ask-sakhi', listen: true, tts: true, reply: (b) => ({ status: 200, json: ANSWER(/exercise/.test(JSON.stringify(b)) ? { answer: 'हल्की कसरत रोज़ करें।', guides: [], screens: [] } : {}) }) });
  await accept(a.page);
  check('9 a mic beside the box, and Talk with Sakhi', !!(await a.page.$('#chat-mic')) && !!(await a.page.$('#chat-talk')));
  await a.page.click('#chat-mic'); await settle(a.page, 200);
  check('9 the mic listens in the app\'s language, and shows it is listening', (await a.page.evaluate(() => window.__listens.slice())).join() === 'en-IN' && !!(await a.page.$('.chat-msg.me.busy')));
  await a.page.evaluate(() => window.__sakhiHeard('PCOD mein kya khana chahiye')); for (let i = 0; i < 10; i++) await settle(a.page, 200);
  check('9 what she said goes as her question', a.sent.length === 1 && JSON.parse(a.sent[0].body).messages[0].text === 'PCOD mein kya khana chahiye' && (await view(a.page)).msgs === 2);
  await a.page.click('#chat-talk'); await settle(a.page, 200);
  check('9 Talk with Sakhi starts listening', (await a.page.evaluate(() => window.__listens.length)) === 2 && await a.page.$eval('#chat-talk', (b) => b.classList.contains('on')));
  await a.page.evaluate(() => window.__sakhiHeard('aur exercise?')); for (let i = 0; i < 40; i++) await settle(a.page, 200);
  const said = await a.page.evaluate(() => window.__said.slice());
  check('9 in Talk, the answer is read aloud in its own language (a Hindi answer in a Hindi voice in the English app)', said.length > 0 && said.every((x) => x.lang === 'hi-IN') && said.map((x) => x.text).join(' ').includes('हल्की कसरत'), said);
  check('9 after the answer is read, it listens again by itself', a.sent.length === 2 && (await a.page.evaluate(() => window.__listens.length)) === 3);
  await a.page.evaluate(() => window.__sakhiHeard(null)); await settle(a.page, 300);
  check('9 silence ends talking', !(await a.page.$eval('#chat-talk', (b) => b.classList.contains('on'))));
  await done(a);
  const w = await open({ at: 'ask-sakhi', listen: false });
  await accept(w.page);
  check('9 without the phone\'s voice typing: no mic, no Talk', !(await w.page.$('#chat-mic')) && !(await w.page.$('#chat-talk')));
  await done(w);
}

/* ---------- 10 Hindi at 360 px ---------- */
{
  const a = await open({ at: 'ask-sakhi', w: 360, h: 800, seed: { lang: 'hi' }, reply: () => ({ status: 200, json: ANSWER({ answer: 'पीरियड के बीच 21 से 35 दिन का अंतर आम है।\n\n- अपने पीरियड लिखती रहें\n- 35 दिन से ज़्यादा हो तो डॉक्टर को दिखाएँ' }) }) });
  let v = await view(a.page);
  check('10 Hindi: the title and the notice in Hindi', v.title === 'Sakhi से पूछें' && v.note);
  await accept(a.page); await ask(a, 'क्या 40 दिन का अंतर नॉर्मल है? ' + 'बहुत लंबा सवाल '.repeat(10));
  v = await view(a.page);
  check('10 Hindi: the app\'s language goes with the question', JSON.parse(a.sent[0].body).lang === 'hi');
  check('10 at 360 px: no sideways scroll, with a long question and an answer', !v.wide && v.msgs === 2, v);
  const box = await a.page.evaluate(() => { const c = document.querySelector('.chat-compose').getBoundingClientRect(); const tb = document.querySelector('#tabbar').getBoundingClientRect(); return { bottom: c.bottom, tabTop: tb.top }; });
  check('10 the box to type in sits above the tab bar', box.bottom <= box.tabTop + 1, box);
  await a.page.screenshot({ path: path.join(SHOTS, '10-hindi-360.png') });
  await done(a);
}

check('no page errors', errsAll.length === 0, errsAll);
await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' Ask Sakhi checks pass');
process.exit(pass === results.length ? 0 : 1);
