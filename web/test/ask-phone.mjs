// Ask Sakhi on a real phone (Version 40.5.1, 10 Nov 2026; Mohit: "you access app ask and run proper tests"). Drives the "Sakhi Ask
// test" app's Ask tab over adb, chat by chat, against the live server, and reads each answer back from the screen reader's tree (the
// raw uiautomator dump holds the whole chat, also the part scrolled away). Not pass/fail by a model: each answer is checked by rule.
// Version 40.5.3 (10 Nov): the iron-tablet reminder answer is also checked for pregnancy facts given as hers (she never says she is
// pregnant), and for any "Sakhi can't remind you".
// Typing goes through `input text`, which takes Latin letters only, so the Hindi chat starts from the empty chat's Hindi example and
// goes on with a Hindi follow-up the answer offers.
// It clears the chat on the phone first (there is an Undo). Every question is a real one: it counts towards her 100 a day.
// Needs: the phone awake, unlocked, with the app signed in and its Ask notice accepted. Never touches the PIN or the lock screen.
// Usage (from web/): node test/ask-phone.mjs [only,ids]     SERIAL=<adb serial> (default the Flip5)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHATS } from './ask-chats.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SERIAL = process.env.SERIAL || 'R5CW82RBXCN';
const PKG = 'com.quranutrition.sakhi.ask';
const ONLY = (process.argv[2] || '').split(',').filter(Boolean);
const OUT = path.join(here, 'shots', 'ask-phone');
const adb = (...a) => execFileSync('adb', ['-s', SERIAL, ...a], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#10;/g, '\n').replace(/&amp;/g, '&');

function nodes() {
  let xml = '';
  for (let i = 0; i < 3 && !xml.includes('<node'); i++) { try { adb('shell', 'uiautomator', 'dump', '/sdcard/ask-ui.xml'); xml = adb('shell', 'cat', '/sdcard/ask-ui.xml'); } catch (e) { xml = ''; } }
  const out = [];
  for (const m of xml.matchAll(/<node ([^>]*)>?/g)) {
    const a = {}; for (const kv of m[1].matchAll(/([\w-]+)="([^"]*)"/g)) a[kv[1]] = unesc(kv[2]);
    const b = (a.bounds || '').match(/\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/); if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    out.push({ text: a.text || a['content-desc'] || '', cls: (a.class || '').split('.').pop(), x: (x1 + x2) >> 1, y: (y1 + y2) >> 1, h: y2 - y1, w: x2 - x1, pkg: a.package || '', click: a.clickable === 'true', enabled: a.enabled !== 'false' });
  }
  return out;
}
const visible = (n) => n.h > 0 && n.w > 0;
const tap = (n) => adb('shell', 'input', 'tap', String(n.x), String(n.y));
const find = (ns, re) => ns.filter((n) => visible(n) && re.test(n.text));
/* `input text` on the phone's shell: spaces as %s, the shell's own characters escaped */
const typeText = (s) => adb('shell', 'input', 'text', s.replace(/([\\'"`$&|;<>()?*!#~\[\]{}])/g, '\\$1').replace(/ /g, '%s'));
const scrollTop = async () => { for (let i = 0; i < 6; i++) { adb('shell', 'input', 'swipe', '540', '700', '540', '2000', '200'); await sleep(250); } };

async function ensureAsk() {
  const front = adb('shell', 'dumpsys', 'window').match(/mFocusedApp=.*?(com\.[\w.]+)\//);
  if (!front || front[1] !== PKG) throw new Error('Sakhi Ask test is not in front: open it on the phone first');
  if (/isKeyguardShowing=true/.test(adb('shell', 'dumpsys', 'window'))) throw new Error('the phone is locked: unlock it yourself first');
  const ns = nodes(); const askTab = find(ns, /^Ask$/).find((n) => n.cls === 'Button' && n.y > 2000);
  if (askTab) { tap(askTab); await sleep(900); }
}
async function clearChat() {
  await scrollTop(); let ns = nodes(); const c = find(ns, /^Clear chat$/)[0];
  if (c) { tap(c); await sleep(1200); }
  ns = nodes(); return ns.some((n) => n.text === 'You could ask');
}
const countAnswers = (ns) => ns.filter((n) => /^Listen to this answer$|^Sakhi couldn’t answer this/.test(n.text)).length;
async function waitAnswer(before, ms = 70000) {
  const t0 = Date.now(); let ns = [];
  while (Date.now() - t0 < ms) {
    await sleep(1500); ns = nodes();
    if (!ns.some((n) => n.text === 'Sakhi is writing…') && countAnswers(ns) > before) { await sleep(800); return { ns: nodes(), secs: (Date.now() - t0) / 1000 }; }
  }
  return { ns, secs: (Date.now() - t0) / 1000, timeout: true };
}
async function ask(q) {
  const ns = nodes(); const before = countAnswers(ns);
  const box = ns.find((n) => n.cls === 'EditText' && visible(n)); if (!box) throw new Error('no question box on screen');
  tap(box); await sleep(500); typeText(q); await sleep(700);
  const send = find(nodes(), /^Send$/)[0]; if (!send) throw new Error('no Send button'); tap(send);
  return waitAnswer(before);
}
async function tapChip(re) {
  const ns = nodes(); const b = ns.filter((n) => n.cls === 'Button' && re.test(n.text)).pop();
  if (!b) return null;
  if (!visible(b)) return null;
  const before = countAnswers(ns); tap(b); const r = await waitAnswer(before); r.q = b.text; return r;
}
/* her latest exchange, from the whole tree: the answer's lines after her question, up to its Listen button */
function lastExchange(ns, q) {
  const texts = ns.map((n) => n); let qi = -1;
  for (let i = texts.length - 1; i >= 0; i--) if (texts[i].text.trim() === q.trim()) { qi = i; break; }
  const block = [];
  for (let i = qi + 1; i < texts.length; i++) { const t = texts[i].text; if (/^Listen to this answer$|^Sakhi couldn’t answer this/.test(t)) { if (/^Sakhi couldn/.test(t)) block.push({ text: t, cls: 'fail' }); break; } if (t) block.push(texts[i]); }
  const lines = block.filter((n) => /TextView|View/.test(n.cls) && n.text !== '• ').map((n) => n.text);
  const med = lines.find((t) => /^Take medicines only on your doctor|^दवाएँ सिर्फ़ डॉक्टर की सलाह पर लें|^Ask a doctor or chemist today|^आज ही डॉक्टर या केमिस्ट से पूछें/.test(t)) || '';
  const answer = lines.filter((t) => t !== med && !/^From Sakhi’s doctor-checked guides$|^General information/.test(t)).join('\n');
  const rows = block.filter((n) => n.cls === 'Button').map((n) => n.text);
  const fus = ns.filter((n) => n.cls === 'Button' && qi >= 0).map((n) => n.text);
  return { found: qi >= 0, answer, med, rows, urgent: ns.some((n) => n.text === 'Go to the nearest hospital now if'), failed: block.some((n) => n.cls === 'fail'), followUps: fus };
}

/* the chats and their checks: ask-chats.mjs, shared with ask-local.mjs */

fs.mkdirSync(OUT, { recursive: true });
const results = []; const log = [];
await ensureAsk();
for (const c of CHATS) {
  if (ONLY.length && ONLY.indexOf(c.id) < 0) continue;
  const cleared = await clearChat();
  log.push('## ' + c.id + (cleared ? '' : ' (the chat did not clear)'));
  for (const [i, tn] of c.turns.entries()) {
    let r, q;
    if (tn.chip) { r = await tapChip(tn.chip); q = r && r.q; }
    else if (tn.chipFollow) { r = await tapChip(tn.chipFollow); q = r && r.q; if (!r) { q = tn.fallback; r = await ask(q); } }
    else { q = tn.q; r = await ask(q); }
    if (!r) { results.push({ chat: c.id, turn: i + 1, check: 'the turn could be sent', pass: false }); log.push('- turn ' + (i + 1) + ': could not send'); break; }
    const x = lastExchange(r.ns, q);
    log.push('- ' + (i + 1) + '. ' + q + '  (' + r.secs.toFixed(1) + ' s' + (r.timeout ? ', TIMED OUT' : '') + ')', '  ' + (x.failed ? '(Sakhi couldn’t answer this)' : x.answer.replace(/\n/g, '\n  ')), x.med ? '  [under it] ' + x.med : '', x.rows.length ? '  [rows] ' + x.rows.join(' | ') : '', x.urgent ? '  [Help\'s card on top]' : '');
    for (const [name, fn] of Object.entries(tn.checks)) { const pass = !!(x.found && !r.timeout && fn(x)); results.push({ chat: c.id, turn: i + 1, check: name, pass }); log.push('  ' + (pass ? 'PASS ' : 'FAIL ') + name); }
  }
}
const pass = results.filter((r) => r.pass).length;
fs.writeFileSync(path.join(OUT, 'last-run.md'), log.filter((l) => l !== '').join('\n') + '\n\n' + pass + '/' + results.length + ' checks pass\n');
console.log(log.filter((l) => l !== '').join('\n'));
console.log('\n' + pass + '/' + results.length + ' phone checks pass · ' + path.relative(process.cwd(), path.join(OUT, 'last-run.md')));
process.exit(pass === results.length ? 0 : 1);
