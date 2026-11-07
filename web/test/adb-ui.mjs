// Phone walk helper (6 Nov 2026, the launch QA walk): reads the phone's screen as text through uiautomator, taps by label,
// and lists accessibility gaps, so a walk on a real device needs no screenshots and no WebView debugging.
// Usage (from web/): node test/adb-ui.mjs <command> [args]
//   d                    dump the screen: one line per node with text or a name, top to bottom, with its centre and size in dp
//   t "<label>" [n]      tap the n-th (default 1st) node whose text or name contains <label> (case-insensitive)
//   x <x> <y>            tap at pixel x, y
//   s up|down [px]       swipe the page (up = scroll down the page)
//   b                    Back
//   p <file.png>         screenshot of the main display to <file.png>
//   a                    accessibility scan: unnamed tappables (NAF) and tappables under 48 dp
//   w <ms>               wait
// Env: SERIAL (default R5CW82RBXCN), DISPLAY_ID for screencap (default the Flip5's main display).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const SERIAL = process.env.SERIAL || 'R5CW82RBXCN';
const DISP = process.env.DISPLAY_ID || '4630946592180194435';
const adb = (...a) => execFileSync('adb', ['-s', SERIAL, ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });
const adbBuf = (...a) => execFileSync('adb', ['-s', SERIAL, ...a], { maxBuffer: 64 << 20 });
let DENS = 0;
const density = () => {
  if (DENS) return DENS;
  const m = adb('shell', 'wm', 'density').match(/(\d+)\s*$/m);
  DENS = m ? +m[1] : 480; return DENS;
};
const dp = (px) => Math.round(px * 160 / density());
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#10;/g, ' ').replace(/&#39;/g, "'");

export function nodes() {
  let xml = '';
  for (let i = 0; i < 3 && !xml.includes('<node'); i++) {
    try { adb('shell', 'uiautomator', 'dump', '/sdcard/qa-ui.xml'); xml = adb('shell', 'cat', '/sdcard/qa-ui.xml'); } catch (e) { xml = ''; }
  }
  const out = [];
  const re = /<node ([^>]*?)\/?>/g; let m;
  while ((m = re.exec(xml))) {
    const a = {}; m[1].replace(/([\w-]+)="([^"]*)"/g, (_, k, v) => { a[k] = unesc(v); });
    const b = (a.bounds || '').match(/\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/); if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    out.push({ text: a.text || '', desc: a['content-desc'] || '', hint: a.hint || '', cls: (a.class || '').split('.').pop(), pkg: a.package,
      click: a.clickable === 'true', check: a.checkable === 'true', checked: a.checked === 'true', naf: a.NAF === 'true', focus: a.focused === 'true',
      x1, y1, x2, y2, cx: (x1 + x2) >> 1, cy: (y1 + y2) >> 1, w: x2 - x1, h: y2 - y1 });
  }
  return out;
}
const label = (n) => (n.text || n.desc || n.hint || '').trim();

function dump() {
  const ns = nodes().filter((n) => (label(n) || n.click) && n.h > 0 && n.w > 0);
  for (const n of ns) {
    const flags = [n.click ? 'tap' : '', n.check ? (n.checked ? 'on' : 'off') : '', n.naf ? 'NAF' : '', n.focus ? 'focus' : ''].filter(Boolean).join(',');
    const t = n.text && n.desc && n.text !== n.desc ? n.text + ' | desc:' + n.desc : label(n);
    console.log(String(n.cy).padStart(5) + ' ' + String(n.cx).padStart(5) + '  ' + (dp(n.w) + 'x' + dp(n.h)).padEnd(8) + ' ' + n.cls.padEnd(10) + ' ' + (flags ? '[' + flags + '] ' : '') + t.slice(0, 160));
  }
}
function tap(lbl, nth = 1) {
  const q = lbl.toLowerCase();
  const ns = nodes().filter((n) => label(n).toLowerCase().includes(q) && n.h > 0 && n.w > 0);
  const exact = ns.filter((n) => label(n).toLowerCase() === q);
  const pick = (exact.length >= nth ? exact : ns)[nth - 1];
  if (!pick) { console.log('NOT FOUND: ' + lbl + ' (' + ns.length + ' partial)'); process.exitCode = 2; return; }
  adb('shell', 'input', 'tap', String(pick.cx), String(pick.cy));
  console.log('tapped "' + label(pick).slice(0, 80) + '" at ' + pick.cx + ',' + pick.cy);
}
function scan() {
  const ns = nodes().filter((n) => n.h > 0 && n.w > 0 && n.pkg && n.pkg.startsWith('com.quranutrition'));
  const naf = ns.filter((n) => n.click && !label(n));
  const small = ns.filter((n) => n.click && (dp(n.w) < 48 || dp(n.h) < 48));
  console.log('unnamed tappables: ' + naf.length);
  for (const n of naf) console.log('  NAF ' + n.cls + ' at ' + n.cx + ',' + n.cy + ' ' + dp(n.w) + 'x' + dp(n.h) + 'dp');
  console.log('tappables under 48 dp: ' + small.length);
  for (const n of small) console.log('  ' + (dp(n.w) + 'x' + dp(n.h)).padEnd(8) + ' ' + label(n).slice(0, 70) + ' @' + n.cx + ',' + n.cy);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'd') dump();
else if (cmd === 't') tap(args[0], +(args[1] || 1));
else if (cmd === 'x') adb('shell', 'input', 'tap', args[0], args[1]);
else if (cmd === 's') {
  let left = +(args[1] || 1000); const W = 540; const mid = 1300;
  while (left > 0) {   // at most 1600 px a swipe, so the finger stays on the page
    const d = Math.min(left, 1600); left -= d;
    if (args[0] === 'up') adb('shell', 'input', 'swipe', String(W), String(mid + d / 2), String(W), String(mid - d / 2), '350');
    else adb('shell', 'input', 'swipe', String(W), String(mid - d / 2), String(W), String(mid + d / 2), '350');
  }
} else if (cmd === 'b') adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
else if (cmd === 'p') fs.writeFileSync(args[0], adbBuf('exec-out', 'screencap', '-p', '-d', DISP));
else if (cmd === 'a') scan();
else if (cmd === 'w') Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, +(args[0] || 800));
else console.log('commands: d | t "<label>" [n] | x X Y | s up|down [px] | b | p file.png | a | w ms');
