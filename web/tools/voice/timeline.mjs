// Works out when each clip starts in a session's track, and, for clips that list things with <#x#> pauses (yoga nidra's body
// parts, the breath counts), when each item is spoken. Usage: node timeline.mjs <sessions.json> <clips dir> <out dir> [session ...]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const [specF, clips, out, ...only] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specF, 'utf8')); fs.mkdirSync(out, { recursive: true });
const dur = (f) => +execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();
/* the spoken stretches of a clip: 10 ms frames louder than 30 dB under its peak, joined across gaps shorter than `minGap` s */
function speech(f, minGap) {
  const R = 16000; const b = execFileSync('/opt/homebrew/bin/ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(R), '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
  const x = new Int16Array(b.buffer, b.byteOffset, b.length / 2); const F = R / 100; const db = [];
  for (let i = 0; i + F <= x.length; i += F) { let e = 0; for (let k = i; k < i + F; k++) e += x[k] * x[k]; db.push(10 * Math.log10(e / F + 1)); }
  const peak = Math.max(...db); const segs = []; let s = -1, lastOn = -1;
  db.forEach((v, i) => { if (v > peak - 30) { if (s < 0) s = i; else if ((i - lastOn) / 100 > minGap) { segs.push([s / 100, (lastOn + 1) / 100]); s = i; } lastOn = i; } });
  if (s >= 0) segs.push([s / 100, (lastOn + 1) / 100]); return segs;
}
for (const name of only.length ? only : Object.keys(spec.sessions)) {
  for (const lang of ['en', 'hi']) {
    let t = 0; const cues = [];
    for (const [id, after] of spec.sessions[name]) {
      const f = path.join(clips, lang + '-' + id + '.mp3'); const d = dur(f); const cue = { k: id, t: +t.toFixed(2), d: +d.toFixed(2) };
      const text = spec.clips[lang][id] || ''; const items = text.split(/<#[0-9.]+#>/).map((x) => x.trim()).filter(Boolean);
      if (items.length > 2) {   /* a list: match its items to the clip's spoken stretches (the pauses between them are 1 s or more) */
        const segs = speech(f, 0.6);
        cue.items = segs.length === items.length ? segs.map((g, i) => ({ t: +(t + g[0]).toFixed(2), d: +(g[1] - g[0]).toFixed(2), s: items[i] }))
          : items.map((s2, i) => ({ t: +(t + (d * i) / items.length).toFixed(2), d: +(d / items.length).toFixed(2), s: s2, guess: true }));   /* fallback: spread evenly */
        if (segs.length !== items.length) console.log('  note:', lang, id, 'items', items.length, 'spoken stretches', segs.length, '(spread evenly)');
      }
      cues.push(cue); t += d + after;
    }
    fs.writeFileSync(path.join(out, name + '-' + lang + '.json'), JSON.stringify({ session: name, lang: lang, length: +t.toFixed(2), cues: cues }));
    console.log(name, lang, 'cues', cues.length, 'length', t.toFixed(1) + 's');
  }
}
