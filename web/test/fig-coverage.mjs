// The 3D figure's coverage (4 Nov 2026 audit, docs/3d-moves-audit-2026-11-04.md): for every step of every routine in
// mods/plan.js, with its knee-pain swap and Getting ready's swaps before her period, the 3D still and loop the player would use,
// read the same way the player reads them (figKey, figName, fb). Not a test of whether the picture shows the right move: the
// audit's section 2 lists the borrowed ones. Version 39.69 (Mohit, 5 Nov: "i dont want any still picture all exercises model
// should be doing right moves"): every step moves, a held pose coming in first (its -in clip, then its loop), the sun
// salutation's first position breathing (sun-00). Run from web/: node test/fig-coverage.mjs   (exit 1 if a step has no 3D still,
// or holds still: no loop)
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(web, 'mods/plan.js'), 'utf8');
const cut = (a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('plan.js has moved: ' + a); return src.slice(i, j); };
const ctx = { L: (en, hi) => ({ en, hi }) };
vm.createContext(ctx);
vm.runInContext(cut('const ANIM = {', 'const mid = (F)') + '\n' + cut('const W = {', 'const sunRounds') + '\n;globalThis.OUT = { ANIM, R, SUN, LUT };', ctx);
const { ANIM, R, SUN, LUT } = ctx.OUT;

const figTxt = fs.readFileSync(path.join(web, 'fig/fig.js'), 'utf8');
const FIG = JSON.parse(figTxt.slice(figTxt.indexOf('{'), figTxt.lastIndexOf('}') + 1));
const has = (p) => fs.existsSync(path.join(web, p));
const pad = (i) => String(i).padStart(2, '0');

const rows = []; const seen = new Set();
const add = (r) => { const k = [r.rid, r.name, r.still].join('|'); if (!seen.has(k)) { seen.add(k); rows.push(r); } };
function step(rid, s, how) {
  const fb = R[rid].fb || ''; const key = s.fig || s.pose;   /* the player's figKey, Version 39.69 */
  const still = fb + (s.fig || s.pose); const loop = key ? fb + key : '';
  const ok = (n) => FIG.loops.includes(n) && has('fig/v/' + n + '.webm');
  add({ rid, how, name: s.n.en, still, stillOk: FIG.stills.includes(still) && has('fig/s/' + still + '.webp'),
    loop: loop && ok(loop) ? (ok(loop + '-in') ? loop + '-in, then ' : '') + loop : '' });
}
for (const rid of Object.keys(R)) {
  if (rid === 'sun') {
    SUN.forEach((x, i) => add({ rid, how: 'flow ' + i, name: x[1].en, still: 'sun-' + pad(i), stillOk: has('fig/s/sun-' + pad(i) + '.webp'),
      loop: (i >= 1 && i <= FIG.sun) || (i === 0 && FIG.sun0) ? (has('fig/v/sun-' + pad(i) + '.webm') ? 'sun-' + pad(i) : '') : '' }));
    continue;
  }
  R[rid].steps.forEach((s) => { step(rid, s, ''); if (s.knees) step(rid, s.knees, 'knee pain'); if (LUT[s.pose]) step(rid, LUT[s.pose], 'before her period (Getting ready)'); });
}
let miss = 0, held = 0;
for (const r of rows) {
  if (!r.stillOk) miss++;
  if (!r.loop) held++;
  console.log([r.rid.padEnd(9), r.name.slice(0, 44).padEnd(45), (r.stillOk ? '✓ ' : '✗ ') + r.still.padEnd(18), r.loop ? 'loop ' + r.loop : 'still only', r.how ? '(' + r.how + ')' : ''].join(' '));
}
console.log('\n' + rows.length + ' steps, ' + rows.filter((r) => r.loop).length + ' with a 3D loop (' + rows.filter((r) => / then /.test(r.loop)).length + ' coming into the pose first), ' +
  (rows.length - miss) + ' with a 3D still, ' + miss + ' with no 3D picture, ' + held + ' holding still');
process.exit(miss || held ? 1 : 0);
