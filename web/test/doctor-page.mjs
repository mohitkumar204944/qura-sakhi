// Writes the choice page for test/doctor-shots.mjs: test/shots/doctor-shots/index.html, one card per place with its screenshots
// and four choices (Qura doctor only, Govt. doctor only, Both, By her answer). Choices are saved in the artifact's db
// (choices/mohit) where the page runs as a Claude artifact, else on this device, and "Copy my choices" gives them as text.
// Usage: node test/doctor-page.mjs (after node test/doctor-shots.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROWS, SECTIONS } from './doctor-rows.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, 'shots', 'doctor-shots');
const shots = JSON.parse(fs.readFileSync(path.join(OUT, 'shots.json'), 'utf8'));
const CAP = { private: 'Private doctor, not answered or nowhere yet', govt: 'Government hospital or ASHA' };
const data = ROWS.map((r) => {
  const list = (shots[r.id] || []).filter((s) => fs.existsSync(path.join(OUT, s.file)));
  const two = list.some((s) => s.care === 'govt') && list.some((s) => s.care === 'private');
  return { id: r.id, sec: r.sec, t: r.t, w: r.w, now: r.now, area: r.area, rec: r.rec, why: r.why, note: r.note || '',
    shots: list.map((s) => ({ f: s.file, c: two || s.care === 'govt' ? CAP[s.care] : 'Every woman', none: !s.marks })) };
});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Qura or government doctor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<style>
:root {
  /* Sakhi's own palette: her warm wash, rose accent, deep brown ink; the three mark colours match the screenshots */
  /* layout: a sticky bar with progress and Copy, then one card per place: words and choices beside its phone screenshots */
  --bg: #F4EDE6; --card: #FFFFFF; --ink: #4A2424; --text: #554642; --muted: #6D5C55; --line: #E7D9CF;
  --accent: #C2345B; --accent-soft: #FCE9EF;
  --qura: #7c3aed; --govt: #059669; --gyn: #ea580c;
  --font-display: 'Cormorant Garamond', Georgia, serif; --font-body: 'DM Sans', system-ui, sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1E1414; --card: #2B1C1C; --ink: #F5E8E8; --text: #E8CFCF; --muted: #C9A3A3; --line: #4A3333; --accent: #E8688B; --accent-soft: #3A2228;
  --qura: #a78bfa; --govt: #34d399; --gyn: #fb923c; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #1E1414; --card: #2B1C1C; --ink: #F5E8E8; --text: #E8CFCF; --muted: #C9A3A3; --line: #4A3333; --accent: #E8688B; --accent-soft: #3A2228;
  --qura: #a78bfa; --govt: #34d399; --gyn: #fb923c; color-scheme: dark; }
* { box-sizing: border-box; }
html { scroll-padding-top: 120px; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.5 var(--font-body); }
h1, h2, h3 { color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font: 700 34px/1.1 var(--font-display); }
h2 { font: 700 26px/1.2 var(--font-display); }
h3 { font-size: 17px; line-height: 1.35; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
header.intro { padding: 28px 0 8px; display: grid; gap: 12px; }
.intro p { margin: 0; max-width: 68ch; }
.legend { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 14px; }
.legend span { display: inline-flex; align-items: center; gap: 8px; }
.sw { width: 18px; height: 12px; border-radius: 4px; border: 3px solid; }
.sw.q { border-color: var(--qura); } .sw.g { border-color: var(--govt); } .sw.y { border-color: var(--gyn); }
.opts-key { display: grid; gap: 4px; font-size: 14px; margin: 0; padding-left: 18px; }
.bar { position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.bar .wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding-top: 10px; padding-bottom: 10px; }
.prog { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.meter { flex: 1 1 120px; height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; min-width: 100px; }
.meter i { display: block; height: 100%; width: 0; background: var(--accent); transition: width .2s; }
.tally { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
.status { font-size: 13px; color: var(--muted); }
.btn { font: 500 14px var(--font-body); border-radius: 99px; border: 1px solid var(--line); background: var(--card); color: var(--ink); padding: 8px 14px; cursor: pointer; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn:focus-visible, .opt:focus-visible, .shot:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.secnav { display: flex; flex-wrap: wrap; gap: 6px; }
.secnav a { font-size: 13px; color: var(--ink); text-decoration: none; padding: 4px 10px; border-radius: 99px; border: 1px solid var(--line); background: var(--card); }
.filter { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
section.sec { padding: 26px 0 6px; display: grid; gap: 14px; }
.row { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; border-left: 6px solid var(--line); }
.row.done { border-left-color: var(--accent); }
.row .id { font: 700 13px var(--font-body); color: var(--accent); letter-spacing: .04em; }
.row .meta { display: grid; gap: 8px; align-content: start; }
.row dl { margin: 0; display: grid; gap: 6px; font-size: 15px; }
.row dt { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
.row dd { margin: 0; }
.sug { font-size: 14px; color: var(--muted); }
.sug b { color: var(--ink); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 99px; border: 1px solid var(--line); color: var(--muted); }
.chip.qa { color: var(--qura); border-color: color-mix(in srgb, var(--qura) 45%, transparent); background: color-mix(in srgb, var(--qura) 8%, transparent); }
.chip.na { color: var(--govt); border-color: color-mix(in srgb, var(--govt) 45%, transparent); background: color-mix(in srgb, var(--govt) 8%, transparent); }
.rec { margin: 0; font-size: 15px; color: var(--ink); background: var(--bg); border-radius: 12px; padding: 10px 12px; display: grid; gap: 2px; }
.rec strong { font-weight: 700; }
.rec span { color: var(--text); font-size: 14px; }
.differs { font-size: 13px; color: var(--accent); font-weight: 500; }
.rule { background: var(--card); border: 1px solid var(--line); border-left: 6px solid var(--qura); border-radius: 14px; padding: 14px 16px; display: grid; gap: 6px; max-width: 80ch; }
.rule p { margin: 0; }
.opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 4px; }
.opt { text-align: left; font: 500 14px/1.3 var(--font-body); border: 2px solid var(--line); background: var(--card); color: var(--ink); border-radius: 12px; padding: 10px 12px; cursor: pointer; display: grid; gap: 2px; }
.opt small { font-weight: 400; color: var(--muted); font-size: 12px; }
.opt[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
.opt.q[aria-pressed="true"] { border-color: var(--qura); } .opt.g[aria-pressed="true"] { border-color: var(--govt); }
textarea { width: 100%; min-height: 40px; resize: vertical; font: 14px/1.4 var(--font-body); color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; }
.shots { display: flex; gap: 10px; align-items: flex-start; }
.shot { margin: 0; display: grid; gap: 4px; width: 210px; border: 0; padding: 0; background: none; cursor: zoom-in; text-align: left; color: var(--muted); font: 12px/1.3 var(--font-body); }
.shot img { width: 210px; height: auto; border-radius: 14px; border: 1px solid var(--line); display: block; background: var(--bg); }
.noshot { width: 210px; font-size: 13px; color: var(--muted); border: 1px dashed var(--line); border-radius: 14px; padding: 14px; }
.hide { display: none !important; }
dialog { border: 0; padding: 0; background: transparent; max-width: 96vw; max-height: 96vh; }
dialog::backdrop { background: rgba(20, 10, 10, .75); }
dialog img { max-height: 92vh; max-width: 92vw; border-radius: 16px; display: block; }
dialog p { color: #fff; margin: 8px 0 0; font-size: 14px; text-align: center; }
.copybox { width: 100%; min-height: 160px; }
footer { padding: 30px 0 60px; display: grid; gap: 10px; }
@media (max-width: 760px) {
  .row { grid-template-columns: 1fr; }
  .shots { overflow-x: auto; padding-bottom: 4px; }
  .shot, .shot img, .noshot { width: 170px; }
}
@media (prefers-reduced-motion: reduce) { .meter i { transition: none; } }
</style>
</head>
<body>
<div class="wrap">
  <header class="intro">
    <h1>Qura doctor or government doctor?</h1>
    <p>Every place in Sakhi that names a Qura doctor or government care today, photographed on a 360-pixel phone (your Flip5’s width), with my recommendation by your Qura rule. Pick one choice for each place. Your choices save as you go. When you’re done, tell me in the chat and I’ll read them from this page.</p>
    <div class="legend" aria-label="What the outlines in the screenshots mean">
      <span><i class="sw q"></i>Qura doctor, or “Ask a doctor” (it opens the Qura call)</span>
      <span><i class="sw g"></i>Government care (PHC, ASHA, ANM, free at government centres)</span>
      <span><i class="sw y"></i>“See a gynaecologist” / “See a doctor” (opens the government list, Care near me)</span>
    </div>
    <ul class="opts-key">
      <li><b>Qura doctor:</b> Qura collects the lead there; the government lines and buttons go.</li>
      <li><b>Gynaecologist / Govt. doctor:</b> her gynaecologist, or the free government doctor (eSanjeevani or a government centre); the Qura line and the “Ask a doctor” button go.</li>
      <li><b>Both:</b> both, the same for every woman (as most places are now).</li>
      <li><b>By her answer:</b> the government doctor if she said a government hospital or her ASHA, the Qura doctor for everyone else.</li>
    </ul>
    <div class="rule">
      <p><b>Your rule (6 Nov):</b> Qura collects leads for <b>PCOD/PCOS</b>, <b>help to conceive naturally</b>, <b>menopause</b>, <b>after pregnancy</b> and <b>cycle concerns</b>. Everything else: see <b>a gynaecologist</b>, or the government’s free doctor portal, <b>eSanjeevani</b>.</p>
      <p>Each place now shows my recommendation by that rule, with the reason. Recommended: ${(() => { const c = {}; data.forEach((r) => { c[r.rec] = (c[r.rec] || 0) + 1; }); return 'Qura doctor ' + (c.Q || 0) + ' · Gynaecologist / Govt. doctor ' + (c.G || 0) + ' · Both ' + (c.B || 0) + ' · Keep as it is ' + (c.Keep || 0); })()}.</p>
      <p class="sug">To know: the free government doctor page went in Version 39.68 on the doctors’ review. The “Gynaecologist / Govt. doctor” places need it back, most simply as one row that opens eSanjeevani. Pregnancy isn’t on your Qura list, so pregnancy places are recommended to her gynaecologist or the government.</p>
    </div>
    <p class="sug">Two photos side by side: what she sees with each answer to “Where do you usually go for women’s health?”. Your picks so far are kept.</p>
  </header>
</div>
<div class="bar"><div class="wrap">
  <span class="prog" id="prog">0 of ${data.length} chosen</span>
  <span class="meter" aria-hidden="true"><i id="meter"></i></span>
  <span class="tally" id="tally"></span>
  <label class="filter"><input type="checkbox" id="only-open"> Only places not chosen yet</label>
  <button type="button" class="btn" id="take-sug">Take the recommendations for the rest</button>
  <button type="button" class="btn primary" id="copy">Copy my choices</button>
  <span class="status" id="status" role="status">Saved on this device</span>
  <nav class="secnav" aria-label="Sections">${SECTIONS.map(([k, n]) => `<a href="#sec-${k}">${k} ${esc(n)}</a>`).join('')}</nav>
</div></div>
<main class="wrap" id="main"></main>
<div class="wrap"><footer>
  <h2>Done?</h2>
  <p>Tell me in the chat, “Read my choices”. If saving didn’t work here (the bar says so), tap Copy my choices and paste the text into the chat.</p>
  <textarea class="copybox hide" id="copybox" aria-label="Your choices as text" readonly></textarea>
</footer></div>
<dialog id="zoom"><img id="zoom-img" alt=""><p id="zoom-cap"></p></dialog>
<script>
const ROWS = ${JSON.stringify(data)};
const SECTIONS = ${JSON.stringify(SECTIONS)};
const OPTS = [['Q', 'Qura doctor', 'q', 'Qura collects the lead'], ['G', 'Gynaecologist / Govt. doctor', 'g', 'her gynaecologist, or free: eSanjeevani'], ['B', 'Both', 'b', 'the same for every woman'], ['H', 'By her answer', 'h', 'govt for a govt hospital or ASHA, else Qura']];
const NAME = { Q: 'Qura doctor', G: 'Gynaecologist / Govt. doctor', B: 'Both', H: 'By her answer', Keep: 'Keep as it is' };
const AREA = { pcos: ['qa', 'Qura area: PCOD/PCOS'], ttc: ['qa', 'Qura area: conceiving naturally'], meno: ['qa', 'Qura area: menopause'], post: ['qa', 'Qura area: after pregnancy'], cycle: ['qa', 'Qura area: cycle concerns'], mixed: ['', 'Several topics'], pregnancy: ['na', 'Not a Qura area: pregnancy'], other: ['na', 'Not a Qura area'] };
const KEY = 'sakhi-doctor-choices-v1';
let st = { picks: {}, notes: {}, at: 0 };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.picks) st = s; } catch (e) {}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sugLetter = (s) => (/^[QGBH]$/.test(s || '') ? s : null);

function rowHtml(r) {
  const p = st.picks[r.id] || '';
  const shots = r.shots.length ? r.shots.map((s) => '<button type="button" class="shot" data-f="' + esc(s.f) + '" data-c="' + esc(r.id + ': ' + s.c) + '"><img src="' + esc(s.f) + '" alt="' + esc(r.t + ', ' + s.c) + '" loading="lazy" width="540" height="1200"><span>' + esc(s.c) + (s.none ? ' (nothing marked here)' : '') + '</span></button>').join('')
    : '<div class="noshot">' + esc(r.note || 'No photo.') + '</div>';
  return '<article class="row' + (p ? ' done' : '') + '" id="r-' + r.id + '" data-id="' + r.id + '"><div class="meta">' +
    '<span class="id">' + r.id + '</span><h3>' + esc(r.t) + '</h3><div class="chips"><span class="chip ' + (AREA[r.area] || ['', ''])[0] + '">' + esc((AREA[r.area] || ['', ''])[1]) + '</span></div><dl><div><dt>Where</dt><dd>' + esc(r.w) + '</dd></div><div><dt>What she sees now</dt><dd>' + esc(r.now) + '</dd></div></dl>' +
    (r.shots.length && r.note ? '<p class="sug">' + esc(r.note) + '</p>' : '') +
    '<p class="rec"><strong>Recommended: ' + esc(NAME[r.rec] || r.rec) + '</strong><span>' + esc(r.why) + '</span></p>' +
    (p && sugLetter(r.rec) && p !== r.rec ? '<span class="differs">Your pick differs from the recommendation</span>' : '') +
    '<div class="opts" role="group" aria-label="Choice for ' + r.id + '">' + OPTS.map(([k, label, cls, sub]) => '<button type="button" class="opt ' + cls + '" data-k="' + k + '" aria-pressed="' + (p === k) + '">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>').join('') + '</div>' +
    '<label class="sug" for="n-' + r.id + '">Note (optional)</label><textarea id="n-' + r.id + '" data-note="' + r.id + '" rows="1">' + esc(st.notes[r.id] || '') + '</textarea>' +
    '</div><div class="shots">' + shots + '</div></article>';
}
function renderAll() {
  document.getElementById('main').innerHTML = SECTIONS.map(([k, n]) => '<section class="sec" id="sec-' + k + '"><h2>' + k + '. ' + esc(n) + '</h2>' + ROWS.filter((r) => r.sec === k).map(rowHtml).join('') + '</section>').join('');
  applyFilter(); summary();
}
function summary() {
  const n = ROWS.filter((r) => st.picks[r.id]).length;
  document.getElementById('prog').textContent = n + ' of ' + ROWS.length + ' chosen';
  document.getElementById('meter').style.width = (n / ROWS.length * 100) + '%';
  const c = { Q: 0, G: 0, B: 0, H: 0 }; Object.values(st.picks).forEach((k) => { if (c[k] != null) c[k]++; });
  document.getElementById('tally').textContent = 'Qura ' + c.Q + ' · Gynae/Govt ' + c.G + ' · Both ' + c.B + ' · By answer ' + c.H;
}
function applyFilter() {
  const only = document.getElementById('only-open').checked;
  document.querySelectorAll('.row').forEach((el) => el.classList.toggle('hide', only && !!st.picks[el.dataset.id]));
}
function setRow(id) {
  const el = document.getElementById('r-' + id); if (!el) return; const p = st.picks[id] || '';
  el.classList.toggle('done', !!p); el.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === p)));
  const r = ROWS.find((x) => x.id === id); let d = el.querySelector('.differs'); const show = !!(p && r && sugLetter(r.rec) && p !== r.rec);
  if (show && !d) { d = document.createElement('span'); d.className = 'differs'; d.textContent = 'Your pick differs from the recommendation'; el.querySelector('.rec').after(d); } else if (!show && d) d.remove();
}

/* saving: this device always; the artifact's db where the page has it */
let ref = null, writing = false, again = false, timer = null, canWrite = true;
const status = (t) => { document.getElementById('status').textContent = t; };
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
function changed() { st.at = Date.now(); saveLocal(); summary(); if (!ref || !canWrite) return; clearTimeout(timer); timer = setTimeout(push, 500); status('Saving…'); }
async function push() {
  if (writing) { again = true; return; } writing = true;
  try { await ref.set({ picks: st.picks, notes: st.notes, at: st.at }); status('Saved'); }
  catch (e) { if (e && e.code === 'invalid_argument') { canWrite = false; status('Can’t save here: use Copy my choices'); } else if (e && e.code === 'unavailable') { setTimeout(push, 800 + Math.random() * 800); } else status('Not saved: use Copy my choices'); }
  writing = false; if (again) { again = false; push(); }
}
(async () => {
  if (!window.claude || !window.claude.use) { status('Saved on this device'); return; }
  let db = null; try { db = await window.claude.use('db'); } catch (e) {}
  if (!db) { status('Saved on this device only: use Copy my choices when done'); return; }
  ref = db.doc('choices/mohit');
  const slow = setTimeout(() => status('Can’t reach saved choices yet; saving on this device'), 10000);
  ref.onSnapshot((snap) => {
    if (snap.metadata && !snap.metadata.fromCache) clearTimeout(slow);
    const d = snap.exists ? snap.data() : null;
    if (d && (d.at || 0) > (st.at || 0)) { st = { picks: Object.assign({}, d.picks || {}), notes: Object.assign({}, d.notes || {}), at: d.at }; saveLocal(); renderAll(); }
    else if ((st.at || 0) > ((d && d.at) || 0) && Object.keys(st.picks).length && !writing && canWrite) { push(); }
    if (!snap.metadata || !snap.metadata.hasPendingWrites) status('Saved');
  }, () => { clearTimeout(slow); status('Saved on this device only: use Copy my choices when done'); ref = null; });
})();

document.addEventListener('click', (e) => {
  const o = e.target.closest('.opt');
  if (o) { const id = o.closest('.row').dataset.id; st.picks[id] = st.picks[id] === o.dataset.k ? undefined : o.dataset.k; if (!st.picks[id]) delete st.picks[id]; setRow(id); changed(); return; }
  const s = e.target.closest('.shot');
  if (s) { const d = document.getElementById('zoom'); document.getElementById('zoom-img').src = s.dataset.f; document.getElementById('zoom-img').alt = s.dataset.c; document.getElementById('zoom-cap').textContent = s.dataset.c + ' · tap to close'; try { d.showModal(); } catch (x) { d.setAttribute('open', ''); } return; }
  if (e.target.closest('#zoom')) { const d = document.getElementById('zoom'); try { d.close(); } catch (x) { d.removeAttribute('open'); } }
});
let noteT = null;
document.addEventListener('input', (e) => { const t = e.target; if (!t.dataset || !t.dataset.note) return; const v = t.value.trim(); if (v) st.notes[t.dataset.note] = v; else delete st.notes[t.dataset.note]; clearTimeout(noteT); noteT = setTimeout(changed, 600); });
document.getElementById('only-open').addEventListener('change', applyFilter);
document.getElementById('take-sug').addEventListener('click', () => { let n = 0; ROWS.forEach((r) => { const k = sugLetter(r.rec); if (k && !st.picks[r.id]) { st.picks[r.id] = k; setRow(r.id); n++; } }); if (n) changed(); status(n ? n + ' recommendations taken; change any you like' : 'Nothing left to take'); applyFilter(); });
function asText() {
  const lines = ['Doctor choices (' + ROWS.filter((r) => st.picks[r.id]).length + ' of ' + ROWS.length + ')'];
  ROWS.forEach((r) => { const k = st.picks[r.id]; const n = st.notes[r.id]; if (k || n) lines.push(r.id + ' ' + (k ? k + ' (' + NAME[k] + ')' : '-') + (n ? ': ' + n : '')); });
  return lines.join('\\n');
}
document.getElementById('copy').addEventListener('click', async () => {
  const t = asText(); const box = document.getElementById('copybox'); box.value = t;
  try { await navigator.clipboard.writeText(t); status('Copied: paste it in the chat'); }
  catch (e) { box.classList.remove('hide'); box.focus(); box.select(); status('Select the text at the bottom and copy it'); box.scrollIntoView({ block: 'center' }); }
});
renderAll();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(JSON.stringify({ rows: data.length, shots: data.reduce((n, r) => n + r.shots.length, 0), kb: Math.round(html.length / 1024) }));
