// Joins a session's clips with the quiet between them into one track per language, at an even voice loudness.
// Usage: node assemble.mjs <sessions.json> <clips dir> <out dir> [session ...]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const FF = '/opt/homebrew/bin/ffmpeg';
const [specF, clips, out, ...only] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specF, 'utf8'));
fs.mkdirSync(out, { recursive: true });
for (const name of only.length ? only : Object.keys(spec.sessions)) {
  for (const lang of ['en', 'hi']) {
    const seq = spec.sessions[name]; const args = ['-v', 'error', '-y']; const parts = []; let n = 0;
    for (const [id, after] of seq) {
      const f = path.join(clips, lang + '-' + id + '.mp3'); if (!fs.existsSync(f)) throw new Error('missing ' + f);
      args.push('-i', f); parts.push('[' + n + ':a]aformat=sample_rates=44100:channel_layouts=mono[a' + n + ']'); n++;
      if (after > 0) { args.push('-f', 'lavfi', '-t', String(after), '-i', 'anullsrc=r=44100:cl=mono'); parts.push('[' + n + ':a]aformat=sample_rates=44100:channel_layouts=mono[a' + n + ']'); n++; }
    }
    const labels = Array.from({ length: n }, (x, i) => '[a' + i + ']').join('');
    const graph = parts.join(';') + ';' + labels + 'concat=n=' + n + ':v=0:a=1,loudnorm=I=-19:TP=-2:LRA=11,afade=t=in:d=0.5[o]';
    const dest = path.join(out, name + '-' + lang + '.mp3');
    const r = spawnSync(FF, args.concat(['-filter_complex', graph, '-map', '[o]', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', dest]), { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr.slice(0, 500));
    const dur = spawnSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dest], { encoding: 'utf8' }).stdout.trim();
    console.log(dest.split('/').pop(), Math.round(+dur) + ' s,', Math.round(fs.statSync(dest).size / 1024) + ' KB');
  }
}
