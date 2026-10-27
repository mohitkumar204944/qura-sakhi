/* Wind down (Version 39.21; Mohit, 26 Oct: "build it into the app"; docs/myplan-and-sleep-advice-2026-10-26.md, S1 to S5).
   Dr. Megha guides three sessions in her own voice, Bhramari's hum included (slow breaths, Bhramari, yoga nidra; English and
   Hindi), and three sounds play for sleep (a singing bowl with waves, Wandering, Dunes: CC0 recordings from Freesound, credits
   in sounds/CREDITS.md). Each plays with an animation that moves with her voice (the cue times are in sounds/timelines.js), on a
   dark screen; on the phone it goes on with the screen off, and a sound stops after her timer, fading over its last minute.
   Self-care, never treatment: nothing here is a claim, and nothing is sent anywhere. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc;
  const TL = () => ((window.SAKHI_CALM || {}).tl || {});
  const ITEMS = [
    { id: 'breaths', kind: 'orb', guided: true, min: 4 },
    { id: 'bhramari', kind: 'orb', guided: true, min: 3 },
    { id: 'nidra', kind: 'nidra', guided: true, min: 9 },
    { id: 'bowl', kind: 'bowl', file: 'sounds/music/bowl.ogg' },
    { id: 'wandering', kind: 'waves', file: 'sounds/music/wandering.ogg' },
    { id: 'dunes', kind: 'waves', tone: 'warm', file: 'sounds/music/dunes.ogg' }
  ];
  const item = (id) => ITEMS.find((x) => x.id === id) || null;
  /* Version 39.22 (AYUSH Common Yoga Protocol; the yoga nidra trials): where each session fits */
  const WHERE = { bhramari: 1, nidra: 1 };
  const D = () => S.data('calm');
  const saved = () => (S.state.mods && S.state.mods.calm) || {};
  /* her voice: Hindi or English (the app's language first; she can switch) */
  const vlang = () => saved().vl || (S.state.lang === 'hi' ? 'hi' : 'en');
  const mins = () => [15, 30, 45].indexOf(saved().mins) >= 0 ? saved().mins : 30;
  const srcOf = (it) => (it.guided ? 'sounds/voice/' + vlang() + '/' + it.id + '.ogg' : it.file);
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + S.pad2(s % 60); };
  const preg = () => !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  const awake = (on) => { try { const B = window.SakhiAndroid; if (B && B.keepAwake) B.keepAwake(!!on); } catch (e) { /* not on a phone */ } };

  /* ---------- the animations: no timers of their own; the player calls update(t) every frame with the track's time ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ease = (p) => (p < 0 ? 0 : p > 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * p));
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const cueAt = (cues, x) => { for (let i = cues.length - 1; i >= 0; i--) if (x >= cues[i].t) return cues[i]; return null; };
  /* the breathing light: slow breaths and Bhramari. Her counts and her hum set it; in the minutes at her own pace it keeps the
     last rhythm (after sb3 in 4 out 6, after sb5 in 4 out 8, after bh3 in 4 and a 9-second hum) */
  function orb(root, id, cues) {
    const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'cm-orb', 'aria-hidden': 'true' }, root);
    const g = svgEl('radialGradient', { id: 'cm-glow' }, svgEl('defs', {}, svg));
    svgEl('stop', { offset: '0%', 'stop-color': '#FFE3F1', 'stop-opacity': '0.95' }, g); svgEl('stop', { offset: '55%', 'stop-color': '#E7A6C9', 'stop-opacity': '0.55' }, g); svgEl('stop', { offset: '100%', 'stop-color': '#9C6ADE', 'stop-opacity': '0' }, g);
    const rings = [0, 1, 2, 3].map(() => svgEl('circle', { cx: 150, cy: 150, r: 60, fill: 'none', stroke: '#F3C6DD', 'stroke-width': 2, opacity: 0 }, svg));
    const halo = svgEl('circle', { cx: 150, cy: 150, r: 140, fill: 'url(#cm-glow)' }, svg); const core = svgEl('circle', { cx: 150, cy: 150, r: 70, fill: '#F7D4E6', opacity: 0.9 }, svg);
    const label = document.createElement('p'); label.className = 'cm-label'; root.appendChild(label);
    const count = document.createElement('p'); count.className = 'cm-count'; root.appendChild(count);
    const own = { sb3: [4, 6], sb5: [4, 8], bh3: [4, 9] };
    return function (x) {
      let ph = 'rest', p = 0, dur = 1, mine = false; const c = cueAt(cues, x);
      if (c && (c.k === 'in4' || c.k === 'in')) { dur = 4; p = (x - c.t) / dur; ph = p > 1 ? 'hold' : 'in'; }
      else if (c && (c.k === 'out6' || c.k === 'out8')) { dur = c.k === 'out8' ? 8 : 6; p = (x - c.t) / dur; ph = p > 1 ? 'rest' : 'out'; }
      else if (c && c.k === 'humreal') { dur = c.d; p = (x - c.t) / dur; ph = p > 1 ? 'rest' : 'hum'; }
      else if (c && own[c.k] && x > c.t + c.d) { const r = own[c.k]; const y = (x - c.t - c.d) % (r[0] + r[1]); mine = true;
        if (y < r[0]) { ph = 'in'; dur = r[0]; p = y / dur; } else { ph = id === 'bhramari' ? 'hum' : 'out'; dur = r[1]; p = (y - r[0]) / dur; } }
      const lo = 0.58, s = ph === 'in' ? lo + (1 - lo) * ease(p) : ph === 'out' ? 1 - (1 - lo) * ease(p) : (ph === 'hum' || ph === 'hold') ? 1 : 0.72 + 0.04 * Math.sin(x * 0.9);
      const jit = ph === 'hum' && !reduce() ? 1 + 0.012 * Math.sin(x * 70) : 1;
      core.setAttribute('r', (70 * s * jit).toFixed(2)); halo.setAttribute('r', (140 * s).toFixed(2));
      rings.forEach((r, i) => { if (ph === 'hum' && !reduce()) { const q = (x * 0.9 + i / rings.length) % 1; r.setAttribute('r', (70 * s + 75 * q).toFixed(1)); r.setAttribute('opacity', ((1 - q) * 0.55).toFixed(2)); } else r.setAttribute('opacity', 0); });
      const word = ph === 'in' || ph === 'hold' ? t('calm_in') : ph === 'out' ? t('calm_out') : ph === 'hum' ? t('calm_hum') : '';
      label.textContent = word ? word + (mine ? ' · ' + t('calm_own') : '') : '';
      count.textContent = (ph === 'in' || ph === 'out') && !mine ? String(Math.min(dur, Math.floor(p * dur) + 1)) : '';
    };
  }
  /* yoga nidra: she rests on a mat, seen from above (her right on the left); a warm light goes to each part as Dr. Megha names
     it, whole limbs light up for "the whole right leg"; the body sinks for heavy, floats for light; dawn for the calm place */
  const PARTS = {
    yn5: [[47, 240], [41, 250], [38, 247], [36, 243], [36, 238], [42, 228], [44, 226], [44, 212], [47, 160], [62, 92], [66, 110], [74, 190], [80, 215], [80, 262], [82, 302], [82, 338], [84, 368], [84, 380], [84, 386], [84, 372], [84, 392]],
    yn7: [null, [100, 26], [100, 105], [100, 145], [100, 195], [100, 150]],
    yn8: [null, [100, 12], [100, 26], [92, 31], [108, 31], [100, 33], [92, 38], [108, 38], [76, 40], [124, 40], [89, 47], [111, 47], [100, 45], [100, 54], [100, 61], [100, 74], [100, 108], [100, 172], [100, 180]],
    yn9: ['legR', 'legL', 'legs', 'armR', 'armL', 'arms', 'torso', 'torso', 'head', 'all', 'all']
  };
  PARTS.yn6 = PARTS.yn5.map((p) => [200 - p[0], p[1]]);
  function nidra(root, cues) {
    const svg = svgEl('svg', { viewBox: '0 0 200 410', class: 'cm-nidra', 'aria-hidden': 'true' }, root);
    const g = svgEl('radialGradient', { id: 'cm-spot' }, svgEl('defs', {}, svg));
    svgEl('stop', { offset: '0%', 'stop-color': '#FFF4C7', 'stop-opacity': '1' }, g); svgEl('stop', { offset: '100%', 'stop-color': '#FFD36E', 'stop-opacity': '0' }, g);
    svgEl('rect', { x: 22, y: 0, width: 156, height: 408, rx: 30, class: 'cm-mat' }, svg);
    const body = svgEl('g', { class: 'cm-body' }, svg);
    const shape = { head: svgEl('ellipse', { cx: 100, cy: 40, rx: 22, ry: 27 }, body), torso: svgEl('path', { d: 'M66 82 Q100 70 134 82 L128 205 Q100 215 72 205 Z' }, body),
      armR: svgEl('path', { d: 'M62 86 Q50 140 44 215 L40 245 Q36 252 46 250 L52 214 Q60 150 72 100 Z' }, body), armL: svgEl('path', { d: 'M138 86 Q150 140 156 215 L160 245 Q164 252 154 250 L148 214 Q140 150 128 100 Z' }, body),
      legR: svgEl('path', { d: 'M74 205 L98 210 L92 300 L90 380 L94 394 L76 394 L78 380 L76 300 Z' }, body), legL: svgEl('path', { d: 'M126 205 L102 210 L108 300 L110 380 L106 394 L124 394 L122 380 L124 300 Z' }, body) };
    const spot = svgEl('circle', { cx: 100, cy: 40, r: 18, fill: 'url(#cm-spot)', opacity: 0 }, svg);
    const belly = svgEl('ellipse', { cx: 100, cy: 172, rx: 22, ry: 14, fill: '#FFE7A8', opacity: 0 }, svg);
    let sx = 100, sy = 40;
    return function (x) {
      const c = cueAt(cues, x); const k = c ? c.k : ''; let to = null, region = null;
      if (c && PARTS[k] && c.items) { let idx = -1; c.items.forEach((it, i) => { if (x >= it - 0.15) idx = i; }); const a = idx >= 0 ? PARTS[k][idx] : null; if (Array.isArray(a)) to = a; else if (a) region = a; }
      Object.keys(shape).forEach((n) => { const lit = region === 'all' || region === n || (region === 'legs' && /^leg/.test(n)) || (region === 'arms' && /^arm/.test(n)); shape[n].setAttribute('class', lit ? 'lit' : ''); });
      if (to) { sx += (to[0] - sx) * 0.18; sy += (to[1] - sy) * 0.18; spot.setAttribute('cx', sx.toFixed(1)); spot.setAttribute('cy', sy.toFixed(1)); spot.setAttribute('opacity', 0.95); } else spot.setAttribute('opacity', 0);
      belly.setAttribute('opacity', k === 'yn10' || k === 'yn2' ? (0.25 + 0.35 * (0.5 + 0.5 * Math.sin((x * 2 * Math.PI) / 5))).toFixed(2) : 0);
      const heavy = k === 'yn11' ? Math.min(1, (x - c.t) / 6) : 0, light = k === 'yn12' ? Math.min(1, (x - c.t) / 6) : 0;
      body.setAttribute('transform', 'translate(0 ' + (heavy * 6 - light * 8).toFixed(2) + ')'); body.style.opacity = (0.9 - heavy * 0.3 + light * 0.1).toFixed(2);
      root.dataset.scene = k === 'yn13' ? 'dawn' : (k === 'yn15' ? 'night' : (k === 'yn12' ? 'light' : ''));
    };
  }
  /* the sounds: slow waves of light (warm for Dunes), or a singing bowl's glow with rings going out */
  function waves(root, tone) {
    const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'cm-waves', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, root);
    const pal = tone === 'warm' ? ['#C98A4B', '#E0A96D', '#9E6B5A'] : ['#7E5BD6', '#C46BA8', '#5E8FD9'];
    const ws = [0, 1, 2].map((i) => svgEl('path', { fill: pal[i], opacity: 0.32 }, svg)); const sp = reduce() ? 0.3 : 1;
    return function (x) { ws.forEach((w, i) => { let d = 'M0 300 L0 ' + (190 + i * 22); for (let px = 0; px <= 300; px += 10) d += ' L' + px + ' ' + (190 + i * 22 + 18 * Math.sin(px / 47 + x * sp * (0.25 + i * 0.07) + i * 2)).toFixed(1); w.setAttribute('d', d + ' L300 300 Z'); }); };
  }
  function bowl(root) {
    const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'cm-bowl', 'aria-hidden': 'true' }, root);
    const rings = [0, 1, 2].map(() => svgEl('circle', { cx: 150, cy: 150, r: 70, fill: 'none', stroke: '#F5C77E', 'stroke-width': 1.6, opacity: 0 }, svg));
    const glow = svgEl('circle', { cx: 150, cy: 150, r: 46, fill: '#FFE2A6' }, svg);
    return function (x) { const b = 0.5 + 0.5 * Math.sin((x * 2 * Math.PI) / 8); glow.setAttribute('opacity', (0.65 + 0.35 * b).toFixed(2)); glow.style.filter = 'drop-shadow(0 0 ' + (6 + 14 * b).toFixed(0) + 'px #F5B94F)';
      rings.forEach((r, i) => { const q = (x / 8 + i / 3) % 1; r.setAttribute('r', (70 + 80 * q).toFixed(1)); r.setAttribute('opacity', reduce() ? 0 : ((1 - q) * 0.5).toFixed(2)); }); };
  }
  const mount = (root, it, cues) => (it.kind === 'nidra' ? nidra(root, cues) : it.kind === 'waves' ? waves(root, it.tone) : it.kind === 'bowl' ? bowl(root) : orb(root, it.id, cues));

  /* ---------- the list ---------- */
  function renderList(v) {
    const tile = (it) => '<button type="button" class="cm-tile" data-go="calm-' + it.id + '"><span class="cm-ti" aria-hidden="true">' + S.icon(it.guided ? (it.id === 'nidra' ? 'moon' : 'leaf') : (it.id === 'bowl' ? 'bell' : 'sparkle')) + '</span><strong>' + esc(t('calm_' + it.id)) + '</strong><span>' + esc(it.guided ? S.tf('calm_min', { n: it.min }) + (WHERE[it.id] ? ' · ' + t('calm_where_' + it.id) : '') : t('calm_timer_s')) + '</span></button>';
    v.innerHTML = S.backRow(t('calm_h'), 'care', false) + '<div class="cm-list"><p class="small">' + esc(t('calm_p')) + '</p>' +
      '<div class="cm-vl" role="group" aria-label="' + esc(t('calm_voice')) + '"><span class="small">' + esc(t('calm_voice')) + '</span>' + [['en', 'English'], ['hi', 'हिंदी']].map((l) => '<button type="button" class="chip' + (vlang() === l[0] ? ' on' : '') + '" data-vl="' + l[0] + '" aria-pressed="' + (vlang() === l[0]) + '">' + l[1] + '</button>').join('') + '</div>' +
      '<h2 class="cm-sh">' + esc(t('calm_guided')) + '</h2><div class="cm-grid">' + ITEMS.filter((x) => x.guided).map(tile).join('') + '</div>' +
      '<h2 class="cm-sh">' + esc(t('calm_sounds')) + '</h2><div class="cm-grid">' + ITEMS.filter((x) => !x.guided).map(tile).join('') + '</div>' +
      '<p class="small cm-off">' + esc(t('calm_off')) + '</p></div><p class="footnote">' + esc(t('calm_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-vl]').forEach((b) => b.addEventListener('click', () => { D().vl = b.dataset.vl; S.save(); S.render(); }));
  }

  /* ---------- the player ---------- */
  let cur = null;   /* { id, it, anim, raf, st, at } : what is playing, and the last state the player read */
  let doneT = 0;
  function stopAll() { clearTimeout(doneT); doneT = 0; if (cur) cancelAnimationFrame(cur.raf); cur = null; if (S.sound) S.sound.stop(); awake(false); }
  /* Version 39.22: her plan's wind-down step counts a session or a sound she has listened to for 30 seconds (she may fall asleep
     before it ends). Kept 60 days, on her phone only. */
  function markDone(id) {
    if (!S.canSave()) return; const d = D(); const td = S.toISO(S.planToday ? S.planToday() : S.today()); const now = new Date();   /* Version 39.23: a session after midnight counts for the evening before */
    d.done = Object.assign({}, d.done || {}); d.done[td] = { id: id, at: S.pad2(now.getHours()) + ':' + S.pad2(now.getMinutes()) };
    const ks = Object.keys(d.done).sort(); ks.slice(0, Math.max(0, ks.length - 60)).forEach((k) => { delete d.done[k]; });
    S.saveQuiet(); if (S.emit) S.emit('tool', { type: 'calm', id: id, quiet: true, day: td });   /* her garden counts it, without a pop-up at night; her plan updates its reminders */
  }
  function start(it) {
    const hide = !!(S.state.settings.discreet || S.state.settings.shared);   /* like her reminders: off the lock screen, a plain title */
    S.sound.play(srcOf(it), { loop: !it.guided, mins: it.guided ? 0 : mins(), title: hide ? t('calm_h') : t('calm_' + it.id), text: t('calm_notif'), stop: t('calm_stop'), secret: hide });
    if (it.guided) awake(true);
    clearTimeout(doneT); doneT = setTimeout(() => { if (!cur || cur.it !== it) return; const st = S.sound.state(); if (st.playing || Math.max(st.played || 0, st.pos || 0) >= 25) markDone(it.id); }, 30000);
  }
  function renderPlayer(v, id) {
    const it = item(id); if (!it) { renderList(v); return; }
    const fresh = !cur || cur.id !== id; if (cur) cancelAnimationFrame(cur.raf);
    if (fresh) { stopAll(); cur = { id: id, it: it, st: null, at: 0, ended: false }; start(it); }   /* a render of the same page keeps her session playing */
    const tl = it.guided ? TL()[it.id + '-' + vlang()] : null;
    v.innerHTML = '<div class="cm-night" data-scene=""><div class="cm-top"><button type="button" class="iconbtn cm-x" id="cm-x" aria-label="' + esc(t('calm_close')) + '">' + S.I.back + '</button><h2>' + esc(t('calm_' + id)) + '</h2></div>' +
      '<div class="cm-stage" id="cm-stage"></div>' + (it.guided ? '<p class="small cm-tip">' + esc(t('calm_tip_' + it.id)) + '</p>' : '') + (it.id === 'nidra' && preg() ? '<p class="small cm-note">' + esc(t('calm_preg')) + '</p>' : '') + '<p class="small cm-off">' + esc(t('calm_off')) + '</p>' +   /* her session says "on your back" */
      '<div class="cm-bar"><span class="cm-track" aria-hidden="true"><i id="cm-prog"></i></span><div class="cm-ctrl"><span id="cm-time" class="num">0:00</span>' +
      '<button type="button" class="cm-play" id="cm-play" aria-label="' + esc(t('calm_pause')) + '">' + PAUSE_I + '</button><span id="cm-len" class="num"></span></div>' +
      (it.guided ? '' : '<div class="cm-timer" role="group" aria-label="' + esc(t('calm_timer')) + '"><span class="small">' + esc(t('calm_timer')) + '</span>' + [15, 30, 45].map((m) => '<button type="button" class="chip' + (mins() === m ? ' on' : '') + '" data-min="' + m + '" aria-pressed="' + (mins() === m) + '">' + esc(S.tf('calm_min', { n: m })) + '</button>').join('') + '</div>') +
      '</div></div>';
    const stage = v.querySelector('#cm-stage'); const night = v.querySelector('.cm-night');
    cur.anim = mount(stage, it, tl ? tl.cues : []);
    v.querySelector('#cm-x').addEventListener('click', () => { stopAll(); S.goBack('calm'); });
    const pb = v.querySelector('#cm-play');
    pb.addEventListener('click', () => { const st = S.sound.state(); if (st.playing) S.sound.pause(); else if (cur.ended || (!st.playing && !st.dur && !st.played)) { cur.ended = false; start(it); } else S.sound.resume(); cur.at = 0; });
    v.querySelectorAll('[data-min]').forEach((b) => b.addEventListener('click', () => { D().mins = +b.dataset.min; S.save(); S.sound.timer(+b.dataset.min);
      v.querySelectorAll('[data-min]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); }));
    const frame = (now) => {
      if (!cur || cur.id !== id || !document.body.contains(stage)) return;
      if (!cur.st || now - cur.at > 200) { cur.st = S.sound.state(); cur.at = now; cur.wall = now; }   /* read the player 5 times a second, run smoothly between */
      const st = cur.st; const run = st.playing ? (now - cur.wall) / 1000 : 0;
      const x = it.guided ? (st.pos || 0) + run : (st.played || 0) + run;
      cur.anim(x); night.dataset.scene = stage.dataset.scene || '';
      const len = it.guided ? (st.dur || ((TL()[it.id + '-' + vlang()] || {}).len) || 0) : mins() * 60;
      v.querySelector('#cm-prog').style.width = len ? Math.min(100, (x / len) * 100).toFixed(1) + '%' : '0';
      v.querySelector('#cm-time').textContent = fmt(x); v.querySelector('#cm-len').textContent = fmt(len);
      if (!st.playing && it.guided && st.dur && st.pos >= st.dur - 0.6) { cur.ended = true; awake(false); }
      const on = !!st.playing; if (pb.dataset.on !== String(on)) { pb.dataset.on = String(on); pb.innerHTML = on ? PAUSE_I : PLAY_I; pb.setAttribute('aria-label', t(on ? 'calm_pause' : 'calm_play')); }
      cur.raf = requestAnimationFrame(frame);
    };
    cur.raf = requestAnimationFrame(frame);
  }
  const PLAY_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const PAUSE_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';

  S.calm = { items: () => ITEMS.map((x) => x.id), playing: () => (cur ? cur.id : null),
    /* Version 39.22: for her plan's wind-down step: the session she played that day, a session's short name and minutes, her timer */
    doneOn: (iso) => ((saved().done || {})[iso] || null), short: (id) => t('calm_short_' + id), mins: (id) => ((item(id) || {}).min || 0), timer: () => mins() };

  S.register({
    id: 'calm',
    strings: {
      en: {
        calm_h: 'Wind down', calm_p: 'Dr. Megha’s voice for calm and for sleep. Choose one, then put the phone down and rest.',
        calm_tile_s: 'Slow breaths, Bhramari and yoga nidra in Dr. Megha’s voice, and sounds for sleep',
        calm_guided: 'Guided by Dr. Megha', calm_sounds: 'Sounds for sleep', calm_voice: 'Her voice in',
        calm_breaths: 'Slow breaths', calm_bhramari: 'Bhramari, the humming breath', calm_nidra: 'Yoga nidra', calm_bowl: 'Singing bowl and waves', calm_wandering: 'Wandering', calm_dunes: 'Dunes',
        calm_min: '{n} min', calm_timer_s: 'With a timer', calm_timer: 'Stop after', calm_play: 'Play', calm_pause: 'Pause', calm_close: 'Close', calm_stop: 'Stop',
        calm_off: 'It keeps playing with the screen off.', calm_notif: 'Playing. Tap to open.',
        calm_foot: 'For rest and sleep, not treatment. Stop if you feel dizzy or unwell.', calm_preg: 'In pregnancy, lie on your left side with a pillow, not flat on your back.',
        calm_in: 'Breathe in', calm_out: 'Breathe out', calm_hum: 'Hum… mmm', calm_own: 'At your own pace',
        calm_row: 'Wind down', calm_row_s: 'Dr. Megha’s voice, and sounds for sleep', calm_more: 'Keep going: sounds for sleep and yoga nidra',
        calm_short_breaths: 'slow breaths', calm_short_bhramari: 'Bhramari', calm_short_nidra: 'yoga nidra', calm_where_bhramari: 'sitting up', calm_where_nidra: 'in bed',
        calm_tip_breaths: 'Sitting or lying down. Press play, then put the phone face down and close your eyes.',
        calm_tip_bhramari: 'Sit up and breathe through your nose; lie down after. Skip it if you have a nose or ear infection.',
        calm_tip_nidra: 'In bed, with the lights off. Press play, then put the phone face down.'
      },
      hi: {
        calm_h: 'सुकून के पल', calm_p: 'सुकून और नींद के लिए डॉ. मेघा की आवाज़। एक चुनें, फिर फ़ोन रख दें और आराम करें।',
        calm_tile_s: 'डॉ. मेघा की आवाज़ में धीमी साँसें, भ्रामरी और योग निद्रा, और नींद के लिए आवाज़ें',
        calm_guided: 'डॉ. मेघा के साथ', calm_sounds: 'नींद के लिए आवाज़ें', calm_voice: 'उनकी आवाज़',
        calm_breaths: 'धीमी साँसें', calm_bhramari: 'भ्रामरी, गुनगुनाती साँस', calm_nidra: 'योग निद्रा', calm_bowl: 'सिंगिंग बाउल और लहरें', calm_wandering: 'धीमा संगीत', calm_dunes: 'गहरा संगीत',
        calm_min: '{n} मिनट', calm_timer_s: 'टाइमर के साथ', calm_timer: 'इतनी देर बाद बंद', calm_play: 'चलाएँ', calm_pause: 'रोकें', calm_close: 'बंद करें', calm_stop: 'बंद करें',
        calm_off: 'स्क्रीन बंद होने पर भी यह चलता रहेगा।', calm_notif: 'चल रहा है। खोलने के लिए टैप करें।',
        calm_foot: 'आराम और नींद के लिए, इलाज नहीं। चक्कर आए या ठीक न लगे, तो रुक जाएँ।', calm_preg: 'गर्भ में पीठ के बल सीधी न लेटें। तकिया लेकर बाईं करवट लेटें।',
        calm_in: 'साँस अंदर', calm_out: 'साँस बाहर', calm_hum: 'गुनगुनाएँ… म्म्म', calm_own: 'अपनी गति से',
        calm_row: 'सुकून के पल', calm_row_s: 'डॉ. मेघा की आवाज़, और नींद के लिए आवाज़ें', calm_more: 'आगे जारी रखें: नींद की आवाज़ें और योग निद्रा',
        calm_short_breaths: 'धीमी साँसें', calm_short_bhramari: 'भ्रामरी', calm_short_nidra: 'योग निद्रा', calm_where_bhramari: 'बैठकर', calm_where_nidra: 'बिस्तर में',
        calm_tip_breaths: 'बैठकर या लेटकर। चलाएँ, फिर फ़ोन उल्टा रख दें और आँखें बंद करें।',
        calm_tip_bhramari: 'सीधी बैठें और नाक से साँस लें; बाद में लेट जाएँ। नाक या कान में इंफ़ेक्शन हो, तो इसे न करें।',
        calm_tip_nidra: 'बिस्तर में, बत्ती बंद करके। चलाएँ, फिर फ़ोन उल्टा रख दें।'
      }
    },
    routes: { calm: renderList },
    prefixes: { 'calm-': (v, rest) => renderPlayer(v, rest) },
    testRoutes: ['calm-breaths', 'calm-bhramari', 'calm-nidra', 'calm-bowl', 'calm-wandering', 'calm-dunes'],
    open: ['calm', 'calm-*'],
    tiles: [{ section: 'tools', route: 'calm', title: 'calm_h', sub: 'calm_tile_s', icon: 'moon', order: 5, keywords: 'sleep neend relax calm sukoon breathing saans meditation dhyan yoga nidra bhramari music sangeet singing bowl wind down' }],
    afterRender: (v, route) => { if (!/^calm-/.test(route || '')) { if (cur) stopAll(); } },
    css: '.cm-list { display: grid; gap: 12px; } .cm-list > p { margin: 0; } .cm-sh { margin: 6px 0 0; font-size: 17px; }' +
      '.cm-vl, .cm-timer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; } .cm-vl .small, .cm-timer .small { margin-right: 2px; }' +
      '.cm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .cm-grid > .cm-tile:last-child:nth-child(odd) { grid-column: 1 / -1; min-height: 88px; }' +   /* the third tile takes the whole row */
      '.cm-tile { display: grid; gap: 4px; text-align: left; min-height: 104px; padding: 14px; border-radius: 18px; border: 1.5px solid #3A2E52; background: linear-gradient(160deg, #2A2140, #1B1530); color: #F4ECF6; font: inherit; cursor: pointer; }' +
      '.cm-tile strong { font-size: 16px; overflow-wrap: anywhere; } .cm-tile > span:last-child { font-size: 13px; color: #C9BAD6; } .cm-ti { color: #F2A7CB; width: 26px; height: 26px; } .cm-ti svg { width: 24px; height: 24px; }' +
      '.cm-off { color: var(--muted); margin: 0; }' +
      /* the player: a dark, calm screen over everything */
      '.cm-night { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px calc(18px + env(safe-area-inset-bottom, 0px)); background: radial-gradient(ellipse at 50% 35%, #2A1F45 0%, #14101F 70%); color: #F4ECF6; transition: background 2s; }' +
      '.cm-night[data-scene="dawn"] { background: radial-gradient(ellipse at 50% 30%, #6B3F5E 0%, #3A2A4E 45%, #14101F 80%); } .cm-night[data-scene="light"] { background: radial-gradient(ellipse at 50% 35%, #3B3060 0%, #14101F 75%); } .cm-night[data-scene="night"] { background: radial-gradient(ellipse at 50% 35%, #160F25 0%, #07050C 80%); }' +
      '.cm-top { width: 100%; max-width: 520px; display: flex; align-items: center; gap: 8px; } .cm-top h2 { margin: 0; font-size: 18px; font-weight: 600; color: #F4ECF6; overflow-wrap: anywhere; } .cm-x { color: #F4ECF6; background: rgba(255,255,255,0.08); }' +
      '.cm-stage { flex: 1; width: 100%; max-width: 520px; min-height: 0; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; }' +
      '.cm-orb, .cm-bowl { width: min(78vw, 340px); height: auto; } .cm-label { margin: 6px 0 0; font-size: 22px; font-weight: 600; min-height: 1.5em; text-align: center; } .cm-count { margin: 0; font-size: 40px; font-weight: 300; min-height: 1.3em; color: #F2A7CB; font-variant-numeric: tabular-nums; }' +
      '.cm-nidra { height: min(58vh, 520px); width: auto; } .cm-mat { fill: #251C3B; stroke: #3A2E58; stroke-width: 1.5; } .cm-body { transition: transform 1.2s ease, opacity 1.2s; } .cm-body > * { fill: #6E5A93; transition: fill .6s; } .cm-body > .lit { fill: #F2C98A; }' +
      '.cm-waves { position: absolute; inset: 0; width: 100%; height: 100%; -webkit-mask-image: linear-gradient(to right, transparent, #000 22%, #000 78%, transparent), linear-gradient(#000 72%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, transparent, #000 22%, #000 78%, transparent), linear-gradient(#000 72%, transparent); mask-composite: intersect; }' +   /* soft edges: no hard sides or bottom */
      '.cm-night .cm-off { color: #B8A9C6; text-align: center; } .cm-night .cm-note { color: #F2C98A; text-align: center; margin: 0; max-width: 520px; } .cm-night .cm-tip { color: #E6DCEE; text-align: center; margin: 0; max-width: 460px; }' +
      '.cm-bar { width: 100%; max-width: 520px; display: grid; gap: 10px; } .cm-track { display: block; height: 4px; border-radius: 2px; background: #3A2E52; overflow: hidden; } .cm-track i { display: block; height: 100%; width: 0; background: #F2A7CB; }' +
      '.cm-ctrl { display: flex; align-items: center; justify-content: space-between; color: #B8A9C6; font-size: 14px; }' +
      '.cm-play { width: 64px; height: 64px; border-radius: 50%; border: none; background: #F2A7CB; color: #2A1430; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; } .cm-play svg { width: 26px; height: 26px; }' +
      '.cm-night .chip { background: rgba(255,255,255,0.06); color: #F4ECF6; border-color: #3A2E52; } .cm-night .chip.on { border-color: #F2A7CB; color: #F2A7CB; } .cm-night .small { color: #B8A9C6; }' +
      '@media (prefers-reduced-motion: reduce) { .cm-body, .cm-night { transition: none; } }'
  });
})(window.Saathi);
