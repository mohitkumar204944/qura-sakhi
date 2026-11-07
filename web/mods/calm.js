/* Wind down (Version 39.21; Mohit, 26 Oct: "build it into the app"; docs/myplan-and-sleep-advice-2026-10-26.md, S1 to S5).
   Dr. Megha guides three sessions in her own voice, Bhramari's hum included (slow breaths, Bhramari, yoga nidra; English and
   Hindi), and three sounds play for sleep (a singing bowl with waves, Wandering, Dunes: CC0 recordings from Freesound, credits
   in sounds/CREDITS.md). Each plays with an animation that moves with her voice (the cue times are in sounds/timelines.js), on a
   dark screen; on the phone it goes on with the screen off, and a sound stops after her timer, fading over its last minute.
   Version 39.24 (Mohit, 27 Oct: "its not properly coming up"; mockup claude.ai/artifact/EofEApr38Rojv8656FPSHt): the opening
   seconds say what is coming, her words show as captions (sounds/captions.js), her voice can switch on the screen, Back leaves
   it playing with a bar above the tabs, a guided session ends on "Sleep well", and one Wind down page serves Explore and My
   plan's Calm tab. Self-care, never treatment: nothing here is a claim, and nothing is sent anywhere. */
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
    const defs = svgEl('defs', {}, svg); const g = svgEl('radialGradient', { id: 'cm-spot' }, defs);
    svgEl('stop', { offset: '0%', 'stop-color': '#FFF4C7', 'stop-opacity': '1' }, g); svgEl('stop', { offset: '100%', 'stop-color': '#FFD36E', 'stop-opacity': '0' }, g);
    const mg = svgEl('radialGradient', { id: 'cm-matg', cx: '50%', cy: '45%', r: '70%' }, defs); svgEl('stop', { offset: '0%', 'stop-color': '#2E2450' }, mg); svgEl('stop', { offset: '100%', 'stop-color': '#1B1530' }, mg);
    svgEl('feGaussianBlur', { stdDeviation: '5' }, svgEl('filter', { id: 'cm-soft', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs));
    svgEl('rect', { x: 20, y: 2, width: 160, height: 406, rx: 34, class: 'cm-mat' }, svg);
    /* Version 39.24: rounded parts, a soft glow around her; each part still lights as Dr. Megha names it */
    const parts = (parent) => ({ head: svgEl('ellipse', { cx: 100, cy: 42, rx: 21, ry: 25 }, parent), torso: svgEl('rect', { x: 71, y: 78, width: 58, height: 130, rx: 26 }, parent),
      armR: svgEl('rect', { x: 38, y: 86, width: 19, height: 166, rx: 9.5, transform: 'rotate(8 47 86)' }, parent), armL: svgEl('rect', { x: 143, y: 86, width: 19, height: 166, rx: 9.5, transform: 'rotate(-8 153 86)' }, parent),
      legR: svgEl('rect', { x: 76, y: 200, width: 22, height: 194, rx: 11, transform: 'rotate(1 87 200)' }, parent), legL: svgEl('rect', { x: 102, y: 200, width: 22, height: 194, rx: 11, transform: 'rotate(-1 113 200)' }, parent) });
    parts(svgEl('g', { class: 'cm-glow', filter: 'url(#cm-soft)' }, svg));
    const body = svgEl('g', { class: 'cm-body' }, svg); svgEl('rect', { x: 93, y: 62, width: 14, height: 18, rx: 6 }, body);
    const shape = parts(body);
    const spot = svgEl('circle', { cx: 100, cy: 40, r: 20, fill: 'url(#cm-spot)', opacity: 0 }, svg);
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

  /* ---------- Version 39.24: her words as captions, and the opening seconds ---------- */
  const CAP = () => ((window.SAKHI_CALM_CAP || {})[vlang()] || {});
  const COUNT = /^(in4|in|out6|out8|humreal)$/;   /* the counts and the hum: the light says them, the caption keeps her last words */
  const MOVE = /^(in4|in|out6|out8|humreal|yn2)$/;   /* the first of these is when the picture starts to move */
  const firstMove = (cues) => { const c = (cues || []).find((x) => MOVE.test(x.k)); return c ? c.t : 0; };
  const ccOn = () => saved().cc !== false;
  function capAt(cues, x) {
    const L = CAP(); let c = null;
    for (let i = (cues || []).length - 1; i >= 0; i--) { const q = cues[i]; if (x >= q.t && !COUNT.test(q.k) && L[q.k]) { c = q; break; } }
    if (!c) return '';
    const ps = L[c.k]; if (!c.items || c.items.length !== ps.length) return ps.join(' ');
    let n = 0; c.items.forEach((it, i) => { if (x >= (typeof it === 'number' ? it : it.t) - 0.15) n = i + 1; });   /* a list: the parts said so far, the last few */
    return ps.slice(Math.max(0, n - 4), Math.max(1, n)).join(' ');
  }
  /* tonight's session, when her plan's bedtime step has one (My plan says which) */
  const tonight = () => { try { return S.plan && S.plan.tonight ? S.plan.tonight() : null; } catch (e) { return null; } };
  const X_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const TICK_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVGI = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICO = { breaths: () => SVGI('<path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/>'), bhramari: () => SVGI('<path d="M3 12h2M7 9v6M11 6v12M15 9v6M19 11v2"/>'), nidra: () => S.icon('moon'),
    bowl: () => S.icon('bell'), wandering: () => S.icon('sparkle'), dunes: () => SVGI('<path d="M2 17c3-4 6-4 9 0s6 4 9 0M2 12c3-4 6-4 9 0s6 4 9 0"/>') };
  const HUE = { breaths: 'sky', bhramari: 'gold', nidra: 'purple', bowl: 'gold', wandering: 'purple', dunes: 'rose' };
  const subOf = (x) => (x.guided ? t('calm_s_' + x.id) + ' · ' + S.tf('calm_min', { n: x.min }) : t('calm_timer_s'));
  /* a session or a sound as one button: her finger anywhere on the row plays it (light rows on the page, dark ones at the end) */
  const rowOf = (x) => '<button type="button" class="item cm-it" data-go="calm-' + x.id + '"><span class="ico-sm hue hue-' + HUE[x.id] + '">' + ICO[x.id]() + '</span><span class="body"><strong>' + esc(t('calm_' + x.id)) + '</strong><span>' + esc(subOf(x)) + '</span></span><span class="cm-pb" aria-hidden="true">' + PLAY_I + '</span></button>';
  const voiceRow = () => '<div class="cm-vl" role="group" aria-label="' + esc(t('calm_voice')) + '"><span class="small">' + esc(t('calm_voice')) + '</span>' + [['en', 'English'], ['hi', 'हिंदी']].map((l) => '<button type="button" class="chip' + (vlang() === l[0] ? ' on' : '') + '" data-vl="' + l[0] + '" aria-pressed="' + (vlang() === l[0]) + '">' + l[1] + '</button>').join('') + '</div>';
  const timerRow = () => '<div class="cm-timer" role="group" aria-label="' + esc(t('calm_timer')) + '"><span class="small">' + esc(t('calm_timer')) + '</span>' + [15, 30, 45].map((m) => '<button type="button" class="chip' + (mins() === m ? ' on' : '') + '" data-min="' + m + '" aria-pressed="' + (mins() === m) + '">' + esc(S.tf('calm_min', { n: m })) + '</button>').join('') + '</div>';
  const wireTimer = (v) => v.querySelectorAll('[data-min]').forEach((b) => b.addEventListener('click', () => { D().mins = +b.dataset.min; S.save(); if (cur && !cur.it.guided) S.sound.timer(+b.dataset.min);
    v.querySelectorAll('[data-min]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); }));

  /* ---------- the list ---------- */
  /* Version 39.24: one Wind down page for Explore and for My plan's Calm tab: tonight's session first when her plan has one, the
     guided sessions (Calm breath where her plan has it), the sounds that play right here with the timer, and the safety card */
  function listBody() {
    const tn = tonight(); const ti = tn ? item(tn) : null; const cb = S.plan && S.plan.calmRow ? (() => { try { return S.plan.calmRow(); } catch (e) { return null; } })() : null;
    return '<div class="cm-list"><p class="small">' + esc(t('calm_p')) + '</p>' + voiceRow() +
      (ti ? '<button type="button" class="cm-tn" data-go="calm-' + tn + '"><span class="body"><span class="cm-pill">' + esc(t('plan_tonight_pill')) + '</span><strong>' + esc(t('calm_' + tn)) + '</strong><span>' + esc(subOf(ti)) + '</span></span><span class="cm-pb big" aria-hidden="true">' + PLAY_I + '</span></button>' : '') +
      '<h2 class="cm-sh">' + esc(t('calm_guided')) + '</h2><div class="list">' + ITEMS.filter((x) => x.guided && x.id !== tn).map(rowOf).join('') +
      (cb ? '<button type="button" class="item cm-it" data-go="' + esc(cb.go) + '"><span class="ico-sm hue hue-sky">' + S.icon('leaf') + '</span><span class="body"><strong>' + esc(cb.title) + '</strong><span>' + esc(cb.sub) + '</span></span><span class="chev">' + S.I.chev + '</span></button>' : '') + '</div>' +
      '<h2 class="cm-sh">' + esc(t('calm_sounds')) + '</h2><div class="list">' + ITEMS.filter((x) => !x.guided).map(rowOf).join('') + '</div>' + timerRow() +
      '<div class="card warn cm-safe"><h3>' + esc(t('calm_safe_h')) + '</h3><p class="small">' + esc(t('calm_safe_p') + (preg() ? ' ' + t('calm_preg') : '')) + '</p></div></div>';
  }
  function wireList(v) {
    v.querySelectorAll('[data-vl]').forEach((b) => b.addEventListener('click', () => { D().vl = b.dataset.vl; S.save(); S.render(); }));
    wireTimer(v);
  }
  function renderList(v) {
    v.innerHTML = S.backRow(t('calm_h'), 'care', false) + listBody();
    S.wire(v); wireList(v);
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
    if (cur && cur.it === it) cur.started = true;   /* Version 39.78: a session that really plays (a restored page waits for her Play) */
    S.sound.play(srcOf(it), { loop: !it.guided, mins: it.guided ? 0 : mins(), title: hide ? t('calm_h') : t('calm_' + it.id), text: t('calm_notif'), stop: t('calm_stop'), secret: hide });
    if (it.guided) awake(true);
    clearTimeout(doneT); doneT = setTimeout(() => { if (!cur || cur.it !== it) return; const st = S.sound.state(); if (st.playing || Math.max(st.played || 0, st.pos || 0) >= 25) markDone(it.id); }, 30000);
  }
  function renderPlayer(v, id) {
    const it = item(id); if (!it) { renderList(v); return; }
    const fresh = !cur || cur.id !== id; if (cur) cancelAnimationFrame(cur.raf);
    if (fresh) {   /* a render of the same page keeps her session playing */
      /* Version 39.78: on a page Android restored, Play waits for her tap; but a session Android kept playing through the restore (the font
         size or language changed) carries on, not stopped (the review) */
      const wait = !!(S.autoplayOk && !S.autoplayOk()); const keep = wait && !!(S.sound && S.sound.state().playing);
      if (!keep) stopAll(); cur = { id: id, it: it, st: null, at: 0, ended: false, started: keep };
      if (keep) { if (it.guided) awake(true); } else if (!wait) start(it);
    }
    const tl = it.guided ? TL()[it.id + '-' + vlang()] : null; const cues = tl ? tl.cues : [];
    /* Version 39.24: her voice switches here too (the session starts again in it) */
    const seg = it.guided && !cur.ended ? '<div class="cm-seg" role="group" aria-label="' + esc(t('calm_voice')) + '">' + [['en', 'English'], ['hi', 'हिंदी']].map((l) => '<button type="button" class="' + (vlang() === l[0] ? 'on' : '') + '" data-pvl="' + l[0] + '" aria-pressed="' + (vlang() === l[0]) + '">' + l[1] + '</button>').join('') + '</div>' : '';
    const top = '<div class="cm-top"><button type="button" class="iconbtn cm-x" id="cm-x" aria-label="' + esc(t('calm_close')) + '">' + X_I + '</button><h2>' + esc(t('calm_' + id)) + '</h2>' + seg + '</div>';
    const close = () => { stopAll(); S.goBack('calm'); };
    if (cur.ended && it.guided) {   /* Version 39.24: the end: sleep well, and what could come next */
      const plain = !!(S.state.settings.discreet || S.state.settings.shared); const nm = plain ? '' : String(((S.account && S.account.info ? S.account.info() : null) || {}).name || '').trim().split(/\s+/)[0];
      const td = S.toISO(S.planToday ? S.planToday() : S.today()); const counted = !!tonight() && !!(saved().done || {})[td];
      const next = ITEMS.filter((x) => !x.guided).concat(id === 'nidra' ? [] : [item('nidra')]);
      v.innerHTML = '<div class="cm-night cm-end">' + top + '<div class="cm-endc"><span class="cm-moon" aria-hidden="true">' + S.I.moon + '</span><h2 class="cm-sw">' + esc(nm ? S.tf('calm_sleep_n', { name: nm }) : t('calm_sleep')) + '</h2></div>' +
        (counted ? '<p class="cm-ok">' + TICK_I + esc(t('calm_counted')) + '</p>' : '') +
        '<p class="cm-sh2">' + esc(t(id === 'nidra' ? 'calm_sounds' : 'calm_more')) + '</p><div class="list cm-rows">' + next.map(rowOf).join('') + '</div>' + timerRow() +
        '<button type="button" class="btn block cm-done" id="cm-done">' + esc(t('calm_done')) + '</button></div>';
      S.wire(v); wireTimer(v); awake(false);
      v.querySelector('#cm-x').addEventListener('click', close); v.querySelector('#cm-done').addEventListener('click', close);
      return;
    }
    const tn = tonight() === id && it.guided;
    v.innerHTML = '<div class="cm-night" data-scene="">' + top +
      (tn ? '<p class="cm-eb"><span class="cm-pill">' + esc(t('plan_tonight_pill')) + '</span>' + esc(S.tf('calm_wd_min', { n: it.min })) + '</p>' : '') +
      '<div class="cm-stage" id="cm-stage"></div>' +
      (it.guided ? '<div class="cm-open" id="cm-open"><p class="cm-say">' + esc(t('calm_start')) + '</p><p class="cm-soon" id="cm-soon"></p>' + (it.id !== 'bhramari' ? '<p class="small cm-tip">' + esc(t('calm_tip_' + it.id)) + '</p>' : '') + '</div>' : '') +
      (it.id === 'bhramari' ? '<p class="small cm-tip">' + esc(t('calm_tip_bhramari')) + '</p>' : '') +   /* her nose or ear: stays in view */
      (it.id === 'nidra' && preg() ? '<p class="small cm-note">' + esc(t('calm_preg')) + '</p>' : '') +   /* her session says "on your back" */
      (it.guided ? '<div class="cm-cap' + (ccOn() ? '' : ' off') + '" id="cm-cap"><div class="cm-cap-h"><span>' + esc(t('calm_who')) + '</span><button type="button" class="cm-cc" id="cm-cc" aria-pressed="' + ccOn() + '" aria-label="' + esc(t(ccOn() ? 'calm_cc_on' : 'calm_cc_off')) + '">CC</button></div><p id="cm-cap-t" aria-live="polite"></p></div>' : '') +
      '<div class="cm-bar"><span class="cm-track" aria-hidden="true"><i id="cm-prog"></i></span><div class="cm-ctrl"><span id="cm-time" class="num">0:00</span>' +
      '<button type="button" class="cm-play" id="cm-play" aria-label="' + esc(t('calm_pause')) + '">' + PAUSE_I + '</button><span id="cm-len" class="num"></span></div>' +
      (it.guided ? '' : timerRow()) + '</div><p class="small cm-off">' + esc(t('calm_keep')) + '</p></div>';
    const stage = v.querySelector('#cm-stage'); const night = v.querySelector('.cm-night');
    const opEl = v.querySelector('#cm-open'), soonEl = v.querySelector('#cm-soon'), capEl = v.querySelector('#cm-cap-t'); const fm = firstMove(cues);
    cur.anim = mount(stage, it, cues);
    v.querySelector('#cm-x').addEventListener('click', close);
    v.querySelectorAll('[data-pvl]').forEach((b) => b.addEventListener('click', () => { if (vlang() === b.dataset.pvl) return; D().vl = b.dataset.pvl; S.save(); stopAll(); S.render(); }));
    const cc = v.querySelector('#cm-cc'); if (cc) cc.addEventListener('click', () => { D().cc = !ccOn(); S.save(); const on = ccOn(); v.querySelector('#cm-cap').classList.toggle('off', !on); cc.setAttribute('aria-pressed', String(on)); cc.setAttribute('aria-label', t(on ? 'calm_cc_on' : 'calm_cc_off')); });
    const pb = v.querySelector('#cm-play');
    pb.addEventListener('click', () => { const st = S.sound.state(); if (st.playing) S.sound.pause(); else if (cur.ended || (!st.playing && !st.dur && !st.played)) { cur.ended = false; start(it); } else S.sound.resume(); cur.at = 0; });
    wireTimer(v);
    const frame = (now) => {
      if (!cur || cur.id !== id || !document.body.contains(stage)) return;
      if (!cur.st || now - cur.at > 200) { cur.st = S.sound.state(); cur.at = now; cur.wall = now; }   /* read the player 5 times a second, run smoothly between */
      const st = cur.st; const run = st.playing ? (now - cur.wall) / 1000 : 0;
      const x = it.guided ? (st.pos || 0) + run : (st.played || 0) + run;
      cur.anim(x); night.dataset.scene = stage.dataset.scene || '';
      const len = it.guided ? (st.dur || ((TL()[it.id + '-' + vlang()] || {}).len) || 0) : mins() * 60;
      v.querySelector('#cm-prog').style.width = len ? Math.min(100, (x / len) * 100).toFixed(1) + '%' : '0';
      v.querySelector('#cm-time').textContent = fmt(x); v.querySelector('#cm-len').textContent = fmt(len);
      if (opEl) { const open = x < fm - 0.2; opEl.classList.toggle('gone', !open); opEl.classList.toggle('idle', !cur.started); if (open && soonEl) soonEl.textContent = S.tf('calm_soon', { n: Math.max(1, Math.ceil(fm - x)) }); }
      if (capEl) { const c = capAt(cues, x); if (capEl.textContent !== c) capEl.textContent = c; }
      if (!cur.ended && !st.playing && it.guided && st.dur && st.pos >= st.dur - 0.6) { cur.ended = true; awake(false); S.render(); return; }   /* Version 39.24: the end card */
      const on = !!st.playing; if (pb.dataset.on !== String(on)) { pb.dataset.on = String(on); pb.innerHTML = on ? PAUSE_I : PLAY_I; pb.setAttribute('aria-label', t(on ? 'calm_pause' : 'calm_play')); }
      cur.raf = requestAnimationFrame(frame);
    };
    cur.raf = requestAnimationFrame(frame);
  }

  /* ---------- Version 39.24: leaving the screen keeps it playing, with a bar above the tabs; its ✕ stops it ---------- */
  let barT = 0;
  function barSync(route) {
    if (cur && cur.ended && !/^calm-/.test(route || '')) stopAll();   /* an ended session starts afresh next time */
    if (cur && !cur.started && !/^calm-/.test(route || '')) stopAll();   /* Version 39.78 (the review): a restored player she left unplayed: no "Paused" bar whose Play did nothing */
    const on = !!cur && !cur.ended && !/^calm-/.test(route || '');
    let b = document.getElementById('cm-mini');
    if (!on) { if (b) b.remove(); document.body.classList.remove('cm-mini-on'); clearInterval(barT); barT = 0; return; }
    if (!b) { b = document.createElement('div'); b.id = 'cm-mini'; b.className = 'cm-mini'; document.body.appendChild(b); }
    const it = cur.it; b.setAttribute('role', 'region'); b.setAttribute('aria-label', t('calm_playing_h'));
    b.innerHTML = '<button type="button" class="cm-mi-open" id="cm-mi-open"><span class="cm-mi-orb" aria-hidden="true"></span><span class="cm-mi-t"><strong>' + esc(t('calm_' + it.id)) + '</strong><span id="cm-mi-s"></span></span></button>' +
      '<button type="button" class="cm-mi-b cm-mi-pp" id="cm-mi-pp" aria-label="' + esc(t('calm_pause')) + '">' + PAUSE_I + '</button><button type="button" class="cm-mi-b cm-mi-x" id="cm-mi-x" aria-label="' + esc(t('calm_stop')) + '">' + X_I + '</button><span class="cm-mi-prog" aria-hidden="true"><i id="cm-mi-p"></i></span>';
    document.body.classList.add('cm-mini-on'); document.documentElement.style.setProperty('--mini-h', b.offsetHeight + 'px');   /* Version 39.78: what sits above the bar */
    if (!b._ro && 'ResizeObserver' in window) { b._ro = new ResizeObserver(() => { if (b.offsetHeight) document.documentElement.style.setProperty('--mini-h', b.offsetHeight + 'px'); }); b._ro.observe(b); }   /* its subtitle fills in later and wraps at large text (the review: 62 px measured, 116 px real) */
    b.querySelector('#cm-mi-open').addEventListener('click', () => { location.hash = 'calm-' + it.id; });   /* her session, still playing */
    b.querySelector('#cm-mi-pp').addEventListener('click', () => { const st = S.sound.state(); if (st.playing) S.sound.pause(); else S.sound.resume(); setTimeout(tick, 60); });
    b.querySelector('#cm-mi-x').addEventListener('click', () => { stopAll(); barSync(''); });
    clearInterval(barT); barT = setInterval(tick, 1000); tick();
  }
  function tick() {
    const b = document.getElementById('cm-mini'); if (!b || !cur) { clearInterval(barT); barT = 0; return; }
    const it = cur.it; const st = S.sound.state(); const x = it.guided ? (st.pos || 0) : (st.played || 0); const len = it.guided ? (st.dur || ((TL()[it.id + '-' + vlang()] || {}).len) || 0) : mins() * 60;
    if ((it.guided && !st.playing && st.dur && st.pos >= st.dur - 0.6) || (!it.guided && !st.playing && (st.left === 0 || (st.played || 0) >= len - 1))) { stopAll(); barSync(''); return; }   /* it ended, or her timer ran out, while she was away */
    const s0 = b.querySelector('#cm-mi-s'); if (s0) s0.textContent = S.tf(st.playing ? 'calm_playing' : 'calm_paused', { a: fmt(x), b: fmt(len) });
    const p0 = b.querySelector('#cm-mi-p'); if (p0) p0.style.width = len ? Math.min(100, (x / len) * 100).toFixed(1) + '%' : '0';
    const pp = b.querySelector('#cm-mi-pp'); if (pp && pp.dataset.on !== String(!!st.playing)) { pp.dataset.on = String(!!st.playing); pp.innerHTML = st.playing ? PAUSE_I : PLAY_I; pp.setAttribute('aria-label', t(st.playing ? 'calm_pause' : 'calm_play')); }
  }
  const PLAY_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const PAUSE_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';

  S.calm = { items: () => ITEMS.map((x) => x.id), playing: () => (cur ? cur.id : null),
    /* Version 39.22: for her plan's wind-down step: the session she played that day, a session's short name and minutes, her timer */
    doneOn: (iso) => ((saved().done || {})[iso] || null), short: (id) => t('calm_short_' + id), mins: (id) => ((item(id) || {}).min || 0), timer: () => mins(),
    listBody: listBody, wireList: wireList, caption: (id, lang, x) => { const tl = TL()[id + '-' + (lang || vlang())]; return tl ? capAt(tl.cues, x) : ''; } };   /* Version 39.24 */

  S.register({
    id: 'calm',
    strings: {
      en: {
        calm_h: 'Wind down', calm_p: 'Your trainer’s voice for calm and for sleep. Choose one, then put the phone down and rest.',
        calm_tile_s: 'Slow breaths, Bhramari and yoga nidra in your trainer’s voice, and sounds for sleep',
        calm_guided: 'Guided by your trainer', calm_sounds: 'Sounds for sleep', calm_voice: 'Her voice in',
        calm_breaths: 'Slow breaths', calm_bhramari: 'Bhramari, the humming breath', calm_nidra: 'Yoga nidra', calm_bowl: 'Singing bowl and waves', calm_wandering: 'Wandering', calm_dunes: 'Dunes',
        calm_min: '{n} min', calm_timer_s: 'With a timer', calm_timer: 'Stop after', calm_play: 'Play', calm_pause: 'Pause', calm_close: 'Close', calm_stop: 'Stop',
        calm_off: 'It keeps playing with the screen off.', calm_notif: 'Playing. Tap to open.',
        calm_foot: 'For rest and sleep, not treatment. Stop if you feel dizzy or unwell.', calm_preg: 'In pregnancy, lie on your left side with a pillow, not flat on your back.',
        calm_in: 'Breathe in', calm_out: 'Breathe out', calm_hum: 'Hum… mmm', calm_own: 'At your own pace',
        calm_row: 'Wind down', calm_row_s: 'Your trainer’s voice, and sounds for sleep', calm_more: 'Keep going: sounds for sleep, or yoga nidra, a sleep meditation',
        calm_short_breaths: 'slow breaths', calm_short_bhramari: 'Bhramari', calm_short_nidra: 'yoga nidra', calm_where_bhramari: 'sitting up', calm_where_nidra: 'in bed',
        calm_tip_breaths: 'Sitting or lying down. Press play, then put the phone face down and close your eyes.',
        calm_tip_bhramari: 'Sit up and breathe through your nose; lie down after. Skip it if you have a nose or ear infection.',
        calm_tip_nidra: 'In bed, with the lights off. Press play, then put the phone face down.',
        calm_start: 'Your trainer is starting. Settle in.', calm_soon: 'Breathing starts in {n} s', calm_keep: 'Leave this screen or lock the phone: it keeps playing.',
        calm_who: 'Trainer', calm_cc_on: 'Captions on', calm_cc_off: 'Captions off', calm_wd_min: 'Your wind-down · {n} min',
        calm_sleep: 'Sleep well', calm_sleep_n: 'Sleep well, {name}', calm_counted: 'Your bedtime step is done for tonight', calm_done: 'Done',
        calm_playing_h: 'Playing', calm_playing: 'Playing · {a} of {b}', calm_paused: 'Paused · {a} of {b}',
        calm_s_breaths: 'In for 4, out for 6, sitting or lying', calm_s_bhramari: 'A soft hum, sitting up', calm_s_nidra: 'Lying in bed, part by part',
        calm_safe_h: 'For rest and sleep, not treatment', calm_safe_p: 'Stop if you feel dizzy or unwell.'
      },
      hi: {
        calm_h: 'सुकून के पल', calm_p: 'सुकून और नींद के लिए आपकी ट्रेनर की आवाज़। एक चुनें, फिर फ़ोन रख दें और आराम करें।',
        calm_tile_s: 'आपकी ट्रेनर की आवाज़ में धीमी साँसें, भ्रामरी और योग निद्रा, और नींद के लिए आवाज़ें',
        calm_guided: 'आपकी ट्रेनर के साथ', calm_sounds: 'नींद के लिए आवाज़ें', calm_voice: 'उनकी आवाज़',
        calm_breaths: 'धीमी साँसें', calm_bhramari: 'भ्रामरी, गुनगुनाती साँस', calm_nidra: 'योग निद्रा', calm_bowl: 'सिंगिंग बाउल और लहरें', calm_wandering: 'धीमा संगीत', calm_dunes: 'गहरा संगीत',
        calm_min: '{n} मिनट', calm_timer_s: 'टाइमर के साथ', calm_timer: 'इतनी देर बाद बंद', calm_play: 'चलाएँ', calm_pause: 'रोकें', calm_close: 'बंद करें', calm_stop: 'बंद करें',
        calm_off: 'स्क्रीन बंद होने पर भी यह चलता रहेगा।', calm_notif: 'चल रहा है। खोलने के लिए टैप करें।',
        calm_foot: 'आराम और नींद के लिए, इलाज नहीं। चक्कर आए या ठीक न लगे, तो रुक जाएँ।', calm_preg: 'गर्भ में पीठ के बल सीधी न लेटें। तकिया लेकर बाईं करवट लेटें।',
        calm_in: 'साँस अंदर', calm_out: 'साँस बाहर', calm_hum: 'गुनगुनाएँ… म्म्म', calm_own: 'अपनी गति से',
        calm_row: 'सुकून के पल', calm_row_s: 'आपकी ट्रेनर की आवाज़, और नींद के लिए आवाज़ें', calm_more: 'आगे जारी रखें: नींद की आवाज़ें, या योग निद्रा, नींद के लिए ध्यान',
        calm_short_breaths: 'धीमी साँसें', calm_short_bhramari: 'भ्रामरी', calm_short_nidra: 'योग निद्रा', calm_where_bhramari: 'बैठकर', calm_where_nidra: 'बिस्तर में',
        calm_tip_breaths: 'बैठकर या लेटकर। चलाएँ, फिर फ़ोन उल्टा रख दें और आँखें बंद करें।',
        calm_tip_bhramari: 'सीधी बैठें और नाक से साँस लें; बाद में लेट जाएँ। नाक या कान में इंफ़ेक्शन हो, तो इसे न करें।',
        calm_tip_nidra: 'बिस्तर में, बत्ती बंद करके। चलाएँ, फिर फ़ोन उल्टा रख दें।',
        calm_start: 'आपकी ट्रेनर शुरू कर रही हैं। आराम से बैठें या लेटें।', calm_soon: 'साँसें {n} सेकंड में शुरू होंगी', calm_keep: 'यह स्क्रीन छोड़ें या फ़ोन लॉक करें: यह चलता रहेगा।',
        calm_who: 'ट्रेनर', calm_cc_on: 'कैप्शन चालू', calm_cc_off: 'कैप्शन बंद', calm_wd_min: 'आपका सुकून का समय · {n} मिनट',
        calm_sleep: 'शुभ रात्रि', calm_sleep_n: 'शुभ रात्रि, {name}', calm_counted: 'आज रात का सोने का क़दम हो गया', calm_done: 'हो गया',
        calm_playing_h: 'चल रहा है', calm_playing: 'चल रहा है · {b} में से {a}', calm_paused: 'रुका है · {b} में से {a}',
        calm_s_breaths: '4 तक अंदर, 6 तक बाहर, बैठकर या लेटकर', calm_s_bhramari: 'धीमी गुनगुनाहट, बैठकर', calm_s_nidra: 'बिस्तर में लेटकर, एक-एक हिस्सा',
        calm_safe_h: 'आराम और नींद के लिए, इलाज नहीं', calm_safe_p: 'चक्कर आए या ठीक न लगे, तो रुक जाएँ।'
      }
    },
    routes: { calm: renderList },
    prefixes: { 'calm-': (v, rest) => renderPlayer(v, rest) },
    testRoutes: ['calm-breaths', 'calm-bhramari', 'calm-nidra', 'calm-bowl', 'calm-wandering', 'calm-dunes'],
    open: ['calm', 'calm-*'],
    tiles: [{ section: 'tools', route: 'calm', title: 'calm_h', sub: 'calm_tile_s', icon: 'moon', order: 5, keywords: 'sleep neend relax calm sukoon breathing saans meditation dhyan yoga nidra bhramari music sangeet singing bowl wind down' }],
    afterRender: (v, route) => { barSync(route); },   /* Version 39.24: leaving keeps it playing, with the bar */
    css: '.cm-list { display: grid; gap: 12px; } .cm-list > p { margin: 0; } .cm-sh { margin: 6px 0 0; font-size: 17px; }' +
      /* Version 39.24: the page in the app's own colours, rows that play, tonight's session in the night colour */
      '.cm-list .list { display: grid; gap: 8px; } .cm-it { width: 100%; text-align: left; cursor: pointer; } .cm-it .cm-pb { margin-left: auto; }' +
      '.cm-pb { width: 44px; height: 44px; border-radius: 22px; background: #2F2240; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; } .cm-pb svg { width: 16px; height: 16px; } .cm-pb.big { width: 52px; height: 52px; border-radius: 26px; background: #F2A7CB; color: #2A1430; } .cm-pb.big svg { width: 20px; height: 20px; }' +
      '.cm-tn { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; border: none; border-radius: 20px; padding: 14px 12px 14px 16px; background: #2F2240; color: #F4ECF6; font: inherit; cursor: pointer; box-shadow: 0 8px 22px rgba(47,34,64,.22); }' +
      '.cm-tn .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; } .cm-tn strong { font-size: 17px; color: #FFFFFF; } .cm-tn .body > span:last-child { font-size: 13px; color: #D9CCE6; }' +
      '.cm-pill { display: inline-flex; align-self: flex-start; align-items: center; height: 22px; padding: 0 9px; border-radius: 11px; border: 1.5px solid #F2A7CB; color: #F2A7CB; font-size: 12px; font-weight: 600; margin: 0 8px 4px 0; }' +
      '.cm-safe h3 { margin: 0; } .cm-safe p { margin: 0; }' +
      /* the player: her voice, tonight, the opening seconds, her words */
      '.cm-seg { display: inline-flex; margin-left: auto; background: rgba(255,255,255,0.06); border: 1px solid #3A2E52; border-radius: 22px; padding: 3px; gap: 2px; flex-shrink: 0; } .cm-seg button { min-height: 38px; padding: 0 12px; border-radius: 19px; border: none; background: none; color: #C9BAD6; font: inherit; font-size: 13px; font-weight: 600; } .cm-seg button.on { background: #F2A7CB; color: #2A1430; }' +
      '.cm-eb { margin: 0; width: 100%; max-width: 520px; display: flex; align-items: center; font-size: 13px; color: #C9BAD6; } .cm-eb .cm-pill { margin-bottom: 0; }' +
      '.cm-open { width: 100%; max-width: 460px; display: grid; gap: 2px; text-align: center; } .cm-open.gone { display: none; } .cm-say { margin: 0; font-size: 20px; font-weight: 600; color: #F4ECF6; } .cm-soon { margin: 0; font-size: 14px; color: #C9BAD6; min-height: 1.4em; } .cm-open .cm-tip { margin-top: 4px; }' +
      '.cm-cap { width: 100%; max-width: 520px; box-sizing: border-box; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 10px 14px 12px; display: grid; gap: 4px; } .cm-cap.off { background: none; border-color: transparent; padding: 0; } .cm-cap.off p { display: none; }' +
      '.cm-cap-h { display: flex; align-items: center; justify-content: space-between; } .cm-cap-h span { font-size: 12px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; color: #F2A7CB; } .cm-cap.off .cm-cap-h span { visibility: hidden; }' +
      '.cm-cc { min-width: 44px; min-height: 32px; border-radius: 8px; border: 1.5px solid #6E5A93; background: none; color: #E6DCEE; font: inherit; font-size: 12px; font-weight: 700; } .cm-cc[aria-pressed="false"] { color: #8E7FA6; border-style: dashed; }' +
      '.cm-cap p { margin: 0; font-size: 16px; line-height: 1.45; color: #F4ECF6; min-height: 2.9em; }' +
      /* the end: sleep well */
      '.cm-end { justify-content: flex-start; gap: 14px; overflow-y: auto; } .cm-endc { display: grid; justify-items: center; gap: 8px; padding: 18px 0 4px; text-align: center; } .cm-moon { width: 60px; height: 60px; color: #F5D58E; display: inline-flex; } .cm-moon svg { width: 60px; height: 60px; }' +
      '.cm-sw { margin: 0; font-family: var(--font-display); font-size: 40px; font-weight: 700; line-height: 1.05; color: #F4ECF6; }' +
      '.cm-ok { margin: 0; width: 100%; max-width: 520px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; background: rgba(122,196,140,0.12); border: 1px solid rgba(122,196,140,0.35); border-radius: 14px; padding: 10px 12px; font-size: 14px; font-weight: 600; color: #BFE8C9; } .cm-ok svg { width: 20px; height: 20px; flex-shrink: 0; }' +
      '.cm-sh2 { margin: 0; width: 100%; max-width: 520px; font-size: 15px; font-weight: 600; color: #F4ECF6; } .cm-rows { width: 100%; max-width: 520px; display: grid; gap: 8px; }' +
      '.cm-night .cm-it { background: rgba(255,255,255,0.06); border: 1px solid #3A2E52; box-shadow: none; color: #F4ECF6; } .cm-night .cm-it strong { color: #F4ECF6; } .cm-night .cm-it .body span { color: #C9BAD6; } .cm-night .cm-pb { background: #F2A7CB; color: #2A1430; }' +
      '.cm-done { width: 100%; max-width: 520px; margin-top: 4px; background: none; border: 1.5px solid #6E5A93; color: #F4ECF6; } .cm-end .cm-timer { width: 100%; max-width: 520px; }' +
      /* the bar: her session playing on any other screen */
      '.cm-open.idle .cm-say, .cm-open.idle .cm-soon { display: none; }' +   /* Version 39.78: before her Play on a restored page, only the tip */
      '.cm-mini { position: fixed; z-index: 15; left: 50%; transform: translateX(-50%); width: calc(min(430px, 100%) - 20px); bottom: calc(var(--tb-gap, 74px) + env(safe-area-inset-bottom, 0px)); box-sizing: border-box; display: flex; align-items: center; gap: 8px; background: #2F2240; color: #F4ECF6; border-radius: 18px; padding: 8px 8px 10px 10px; box-shadow: 0 8px 24px rgba(47,34,64,0.35); }' +
      '.cm-mi-open { flex: 1; min-width: 0; min-height: 44px; display: flex; align-items: center; gap: 10px; background: none; border: none; color: inherit; font: inherit; text-align: left; padding: 0; cursor: pointer; }' +
      '.cm-mi-orb { width: 30px; height: 30px; border-radius: 15px; flex-shrink: 0; background: radial-gradient(circle, #F7D4E6 0 40%, rgba(156,106,222,0.45) 42% 100%); }' +
      '.cm-mi-t { display: grid; min-width: 0; line-height: 1.25; } .cm-mi-t strong { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cm-mi-t span { font-size: 12px; color: #C9BAD6; font-variant-numeric: tabular-nums; }' +
      '.cm-mi-b { width: 44px; height: 44px; border-radius: 22px; border: none; display: inline-flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; cursor: pointer; } .cm-mi-b svg { width: 18px; height: 18px; } .cm-mi-pp { background: #F2A7CB; color: #2A1430; } .cm-mi-x { background: rgba(255,255,255,0.08); color: #F4ECF6; }' +
      '.cm-mi-prog { position: absolute; left: 14px; right: 14px; bottom: 4px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.12); overflow: hidden; } .cm-mi-prog i { display: block; height: 100%; width: 0; background: #F2A7CB; }' +
      /* Version 39.78 (launch QA B4): with the bar up, the players' Pause, Next and Stop, the check-in's Save and the + menu sit above it
         (they were under it: a tap paused or stopped her sound instead); the bar's own height is --mini-h, set when it draws */
      'body.cm-mini-on .fab { bottom: calc(var(--tb-gap, 74px) + var(--mini-h, 62px) + 14px + env(safe-area-inset-bottom, 0px)); } body.cm-mini-on #view::after { content: ""; display: block; height: calc(var(--mini-h, 62px) + 2px); }' +
      'body.cm-mini-on .pl-ctl, body.cm-mini-on .rl-ctl, body.cm-mini-on .pst-ctl { bottom: calc(var(--tb-gap, 74px) + var(--mini-h, 62px) + 8px + env(safe-area-inset-bottom, 0px)); } body.cm-mini-on .sticky-cta { bottom: calc(var(--tb-gap, 74px) + var(--mini-h, 62px) + 10px + env(safe-area-inset-bottom, 0px)); } body.cm-mini-on .fab-menu { bottom: calc(var(--tb-gap, 74px) + var(--mini-h, 62px) + 84px + env(safe-area-inset-bottom, 0px)); }' +
      /* yoga nidra, softer */
      '.cm-glow > * { fill: #9C82D6; } .cm-glow { opacity: 0.5; }' +
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
      '.cm-orb, .cm-bowl { width: auto; height: min(40vh, 300px); max-width: 80vw; } .cm-label { margin: 6px 0 0; font-size: 22px; font-weight: 600; min-height: 1.5em; text-align: center; } .cm-count { margin: 0; font-size: 40px; font-weight: 300; min-height: 1.3em; color: #F2A7CB; font-variant-numeric: tabular-nums; }' +
      '.cm-nidra { height: min(46vh, 460px); width: auto; } .cm-mat { fill: url(#cm-matg); stroke: #3D3263; stroke-width: 1.5; } .cm-body { transition: transform 1.2s ease, opacity 1.2s; } .cm-body > * { fill: #5E4D8C; transition: fill .6s; } .cm-body > .lit { fill: #F2C98A; }' +
      '.cm-waves { position: absolute; inset: 0; width: 100%; height: 100%; -webkit-mask-image: linear-gradient(to right, transparent, #000 22%, #000 78%, transparent), linear-gradient(#000 72%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, transparent, #000 22%, #000 78%, transparent), linear-gradient(#000 72%, transparent); mask-composite: intersect; }' +   /* soft edges: no hard sides or bottom */
      '.cm-night .cm-off { color: #B8A9C6; text-align: center; } .cm-night .cm-note { color: #F2C98A; text-align: center; margin: 0; max-width: 520px; } .cm-night .cm-tip { color: #E6DCEE; text-align: center; margin: 0; max-width: 460px; }' +
      '.cm-bar { width: 100%; max-width: 520px; display: grid; gap: 10px; } .cm-track { display: block; height: 4px; border-radius: 2px; background: #3A2E52; overflow: hidden; } .cm-track i { display: block; height: 100%; width: 0; background: #F2A7CB; }' +
      '.cm-ctrl { display: flex; align-items: center; justify-content: space-between; color: #B8A9C6; font-size: 14px; }' +
      '.cm-play { width: 64px; height: 64px; border-radius: 50%; border: none; background: #F2A7CB; color: #2A1430; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; } .cm-play svg { width: 26px; height: 26px; }' +
      '.cm-night .chip { background: rgba(255,255,255,0.06); color: #F4ECF6; border-color: #3A2E52; } .cm-night .chip.on { border-color: #F2A7CB; color: #F2A7CB; } .cm-night .small { color: #B8A9C6; }' +
      '@media (prefers-reduced-motion: reduce) { .cm-body, .cm-night { transition: none; } }'
  });
})(window.Saathi);
