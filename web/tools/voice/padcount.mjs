// Spreads extra quiet across the K largest gaps between a counted clip's words, so the count lasts exactly `target` seconds.
// The words themselves are untouched. Usage: node padcount.mjs <in.mp3> <out.mp3> <target seconds> <K gaps>
import { execFileSync } from 'node:child_process';
const [inp, out, target, K] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const R = 44100; const b = execFileSync('/opt/homebrew/bin/ffmpeg', ['-v', 'error', '-i', inp, '-ac', '1', '-ar', String(R), '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
const x = new Int16Array(b.buffer, b.byteOffset, b.length / 2); const F = Math.round(R * 0.01); const n = Math.floor(x.length / F);
const db = []; for (let i = 0; i < n; i++) { let e = 0; for (let k = i * F; k < (i + 1) * F; k++) e += x[k] * x[k]; db.push(10 * Math.log10(e / F + 1)); }
const peak = Math.max(...db); const loud = db.map((v) => v > peak - 30);
const first = loud.indexOf(true), last = loud.lastIndexOf(true); const gaps = []; let st = -1;
for (let i = first; i <= last; i++) { if (!loud[i] && st < 0) st = i; if (loud[i] && st >= 0) { if (i - st >= 5) gaps.push([st, i]); st = -1; } }
const pick = gaps.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, K).sort((a, b) => a[0] - b[0]);
const extra = Math.max(0, target - x.length / R); const add = Math.round((extra / Math.max(1, pick.length)) * R);
const parts = []; let at = 0;
for (const [g0, g1] of pick) { const mid = Math.round(((g0 + g1) / 2) * F); parts.push(x.subarray(at, mid), new Int16Array(add)); at = mid; }
parts.push(x.subarray(at)); const len = parts.reduce((a, p) => a + p.length, 0); const y = new Int16Array(len); let o = 0; for (const p of parts) { y.set(p, o); o += p.length; }
execFileSync('/opt/homebrew/bin/ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', String(R), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '128k', out], { input: Buffer.from(y.buffer) });
console.log(out.split('/').pop(), 'gaps found', gaps.length, 'used', pick.length, '|', (x.length / R).toFixed(2) + 's ->', (len / R).toFixed(2) + 's');
