/* Feel better now: short guided routines, about 3 minutes, for period cramps, nausea in pregnancy, poor sleep, an anxious or
   low mood, and hot flushes. Self-care, never treatment: every routine ends with when to see a doctor, and the calm one keeps
   the crisis numbers. A timer moves her along, the steps can be read aloud, and "Did this help?" is saved on her phone.
   It shows up where she needs it: on the day page and on Home when she notes one of these, and as a Care tile. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc;
  const planFor = (k) => (k && S.plan && S.plan.forRow ? S.plan.forRow(k) : '');   /* Version 39.53: her plan for this page's subject, when one fits */
  const RL_TOPIC = { cramps: 'pain', hot: 'hot', sleep: 'sleep', calm: 'mood' };   /* Version 39.53: the plan each routine belongs to */
  const D = () => { const d = S.data('relief'); d.log = d.log || []; return d; };
  /* breathing patterns in seconds: in, hold, out, hold */
  const BR = { b46: [4, 0, 6, 0], box: [4, 4, 4, 4], b55: [5, 0, 5, 0] };
  const preg = () => !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  /* steps: [string key, seconds, breathing pattern]. Cramps never in pregnancy (pain there needs a doctor, not a routine). */
  const R = {
    cramps: { syms: ['d_cramps'], ok: () => !preg(), hue: 'rose', more: 'periods-pain', steps: [['c1', 60], ['c2', 40], ['c3', 40], ['c4', 40, 'b46']] },
    nausea: { syms: ['d_nausea'], ok: preg, hue: 'green', more: 'preg-symptoms', steps: [['n1', 40], ['n2', 40], ['n3', 50], ['n4', 50, 'b46']] },
    sleep: { syms: ['d_sleep'], ok: () => true, hue: 'purple', steps: [['s1', 30], ['s2', 60, 'b46'], ['s3', 60], ['s4', 30], ['s5', 25]] },   /* Version 39.20: a mantra or prayer, if she likes */
    calm: { syms: ['d_anxious', 'd_mood', 'd_irritable'], ok: () => true, hue: 'sky', noAsk: true, steps: [['m1', 40], ['m2', 64, 'box'], ['m3', 50], ['m4', 30]] },
    hot: { syms: ['d_hotflush'], ok: () => true, hue: 'orange', more: 'meno', steps: [['h1', 40], ['h2', 40], ['h3', 80, 'b55']] }
  };
  const IDS = Object.keys(R);
  const total = (id) => R[id].steps.reduce((a, s) => a + s[1], 0);
  const mins = (id) => Math.max(1, Math.round(total(id) / 60));
  const fmt = (sec) => { const s = Math.max(0, Math.ceil(sec)); return Math.floor(s / 60) + ':' + S.pad2(s % 60); };
  const buzz = () => { try { const B = window.SakhiAndroid; if (B && B.haptic) B.haptic(); } catch (e) { /* not on a phone */ } };
  /* The routine for a symptom she noted (the first that fits her stage), for the day page, Home and the heads-up card. */
  const forSym = (key) => IDS.find((id) => R[id].syms.indexOf(key) >= 0 && R[id].ok()) || null;
  function pick(got) {
    for (let i = 0; i < (got || []).length; i++) { const id = forSym(got[i]); if (id) return { id: id, key: got[i], hue: R[id].hue, h: t('relief_cta_h'), sub: t('relief_' + id + '_t') + ' · ' + tf('relief_mins', { n: mins(id) }),
      alt: id === 'sleep' && S.routeOwner('calm') ? { go: 'calm', h: t('calm_row'), sub: t('calm_row_s') } : null }; }   /* Version 39.22: poor sleep also offers Wind down */
    return null;
  }
  /* What she said helped in a month ('YYYY-MM'), for her month card. */
  const helped = (mk) => { const seen = {}; D().log.filter((x) => x.d.slice(0, 7) === mk && (x.r === 'yes' || x.r === 'some')).forEach((x) => { seen[x.id] = 1; }); return Object.keys(seen).filter((id) => R[id]).map((id) => t('relief_' + id + '_t')); };
  /* Version 39.5: did she do this routine on that day? A plan step counts from it (read only, never creates her data) */
  const doneOn = (id, iso) => { const l = ((S.state.mods || {}).relief || {}).log; return Array.isArray(l) && l.some((x) => x && x.d === iso && x.id === id); };
  S.relief = { pick: pick, forSym: forSym, helped: helped, doneOn: doneOn, mins: mins };   /* mins: Version 39.49, the night card's button */

  function renderList(v) {
    const ids = IDS.filter((id) => R[id].ok());
    const wind = calmRow();
    v.innerHTML = S.backRow(t('relief_h'), 'care', false) + '<p class="small">' + esc(t('relief_p')) + '</p>' + wind + '<div class="list">' +
      ids.map((id) => '<button type="button" class="item" data-go="relief-' + id + '"><span class="ico-sm hue hue-' + R[id].hue + '">' + S.I.leaf + '</span><span class="body"><strong>' + esc(t('relief_' + id + '_t')) + '</strong><span>' + esc(tf('relief_mins', { n: mins(id) })) + '</span></span><span class="chev">' + S.I.chev + '</span></button>').join('') +
      '</div><p class="footnote">' + esc(t('relief_foot')) + '</p>';
    S.wire(v);
  }

  /* ---------- the player: intro, steps with a timer (or a breathing guide), then "Did this help?" ---------- */
  let run = null, tm = 0;
  const stopRun = () => { clearInterval(tm); tm = 0; if (S.stopSpeech) S.stopSpeech(); if (S.sound) S.sound.stopClip(); };
  /* Version 39.21: each step in Dr. Megha's voice (sounds/voice/<lang>/rl-<step>.ogg, the same reviewed words); in other languages
     the phone reads the step aloud, as before */
  /* Version 39.21: Wind down, on the list and on the sleep routine's first and last screens */
  const calmRow = () => (S.routeOwner('calm') ? '<div class="list rl-calm"><button type="button" class="item" data-go="calm"><span class="ico-sm hue hue-purple">' + S.icon('moon') + '</span><span class="body"><strong>' + esc(t('calm_row')) + '</strong><span>' + esc(t('calm_row_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' : '');
  const clipFor = (key) => (S.sound && (S.state.lang === 'en' || S.state.lang === 'hi') ? 'sounds/voice/' + S.state.lang + '/rl-' + key + '.ogg' : null);
  if (S.onOwnerChange) S.onOwnerChange(() => { stopRun(); run = null; });
  const voiceDefault = () => { const d = S.state.mods && S.state.mods.relief; if (d && d.voice != null) return !!d.voice; return !(S.state.settings.discreet || S.state.settings.shared); };
  const RING = 339.3;   /* 2πr for r = 54 */
  /* Version 39.67 (the 3D moves audit, docs/3d-moves-audit-2026-11-04.md; Mohit, 4 Nov: "Yes, fix both"): the cramps routine's
     two yoga moves show the player's own 3D figure (web/fig), the same moves and words as Cycle care yoga: child's pose its still
     (a hold), knees to chest its loop, with the still for "reduce motion" or a video that can't play. Without web/fig, or with
     SAKHI_CONFIG.fig === false, no picture, as before. Cramps never run in pregnancy, so it is always her usual body. */
  const FIG3 = { c2: 'child', c3: 'knees' };
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  function fig3(key) {
    const f = window.SAKHI_FIG; const k = FIG3[key];
    if (!k || !f || f.v !== 1 || (window.SAKHI_CONFIG || {}).fig === false) return '';
    const still = (f.stills || []).indexOf(k) >= 0 ? 'fig/s/' + k + '.webp' : ''; const loop = (f.loops || []).indexOf(k) >= 0 ? 'fig/v/' + k + '.webm' : '';
    const inClip = loop && (f.loops || []).indexOf(k + '-in') >= 0 ? 'fig/v/' + k + '-in.webm' : '';   /* Version 39.69: into the pose once, then the hold */
    const m = loop && !reduced() ? (inClip ? '<video class="rl-3d" id="rl-fig3d" src="' + inClip + '" data-next="' + loop + '"' + (still ? ' data-still="' + still + '"' : '') + ' muted playsinline autoplay preload="auto"></video>'
      : '<video class="rl-3d" id="rl-fig3d" src="' + loop + '"' + (still ? ' poster="' + still + '" data-still="' + still + '"' : '') + ' muted playsinline autoplay loop preload="auto"></video>')
      : (still ? '<img class="rl-3d" src="' + still + '" alt="">' : '');
    return m ? '<div class="rl-figbox">' + m + '</div>' : '';
  }
  function wireFig3(v) {
    const vd = v.querySelector('video#rl-fig3d'); if (!vd) return;
    const toStill = () => {
      const src = vd.getAttribute('data-still'); if (!vd.isConnected) return;
      if (!src) { const b = vd.closest('.rl-figbox'); if (b) b.remove(); return; }
      const im = document.createElement('img'); im.className = vd.className; im.src = src; im.alt = ''; vd.replaceWith(im);
    };
    vd.addEventListener('error', toStill);
    const next = vd.getAttribute('data-next');   /* Version 39.69: into the pose, then the hold */
    if (next) vd.addEventListener('ended', () => { if (!vd.isConnected || !vd.getAttribute('data-next')) return; vd.removeAttribute('data-next'); vd.loop = true; vd.src = next; const st = vd.getAttribute('data-still'); if (st) vd.poster = st; const p = vd.play(); if (p && p.catch) p.catch(() => { /* the hold's first frame stays */ }); });
    try { vd.muted = true; const p = vd.play(); if (p && p.catch) p.catch((e) => { if (e && e.name === 'NotAllowedError') toStill(); }); } catch (e) { toStill(); }
  }
  function renderPlayer(v, id) {
    if (!R[id] || !R[id].ok()) { renderList(v); return; }
    /* she comes back to where she was, unless she finished it or left it more than 10 minutes ago */
    if (!run || run.id !== id || run.i >= R[id].steps.length || Date.now() - run.at > 600000) { stopRun(); run = { id: id, i: -1, left: 0, el: 0, paused: false, voice: voiceDefault(), rated: null, at: Date.now() }; }
    draw(v);
  }
  const doc = (id) => '<div class="card soft rl-doc"><h3>' + esc(t('relief_see_h')) + '</h3><p class="small">' + esc(t('relief_' + id + '_doc')) + '</p></div>';
  function draw(v) {
    const r = R[run.id]; const n = r.steps.length; const look = (S.state.settings || {}).look;
    const art = (pose) => (S.art ? S.art.sakhi({ pose: pose, look: look }) : '');
    let body;
    if (run.i < 0) {
      body = '<div class="card rl-stage">' + art('calm') + '<p class="lead">' + esc(tf('relief_mins', { n: mins(run.id) })) + '</p><p class="small">' + esc(t('relief_intro')) + '</p></div>' +
        '<ol class="steps">' + r.steps.map((s) => '<li>' + esc(t('relief_' + s[0] + '_h')) + '</li>').join('') + '</ol>' +
        (S.speakEl || clipFor('c1') ? '<div class="list"><label class="item"><span class="body"><strong>' + esc(t('relief_voice')) + '</strong><span>' + esc(t('relief_voice_d')) + '</span></span><input type="checkbox" id="rl-voice" ' + (run.voice ? 'checked' : '') + '></label></div>' : '') +
        '<button type="button" class="btn primary block" id="rl-start">' + esc(t('relief_start')) + '</button>' + (run.id === 'sleep' ? calmRow() : '') + planFor(RL_TOPIC[run.id]) + doc(run.id);   /* Version 39.21: one tap from her plan's bedtime step */
    } else if (run.i < n) {
      const s = r.steps[run.i];
      body = '<div class="rl-dots" aria-hidden="true">' + r.steps.map((x, k) => '<i class="' + (k < run.i ? 'done' : (k === run.i ? 'on' : '')) + '"></i>').join('') + '</div>' +
        '<div class="card rl-stage" id="rl-step">' + fig3(s[0]) + '<span class="eyebrow">' + esc(tf('relief_step_n', { i: run.i + 1, n: n })) + '</span><h2>' + esc(t('relief_' + s[0] + '_h')) + '</h2><p>' + esc(t('relief_' + s[0] + '_p')) + '</p></div>' +
        (s[2] ? '<div class="rl-breath-wrap" aria-hidden="true"><div class="rl-breath" id="rl-breath"></div><b id="rl-phase"></b></div>'
          : '<div class="rl-timer" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="54"/><circle class="arc" id="rl-arc" cx="60" cy="60" r="54" stroke-dasharray="' + RING + '" stroke-dashoffset="0"/></svg><b id="rl-time"></b></div>') +
        '<p class="small rl-left" id="rl-left" aria-live="off"></p>' +
        '<div class="grid2 rl-ctl"><button type="button" class="btn" id="rl-pause">' + esc(t(run.paused ? 'relief_resume' : 'relief_pause')) + '</button><button type="button" class="btn primary" id="rl-next">' + esc(t(run.i === n - 1 ? 'relief_finish' : 'relief_next')) + '</button></div>';
    } else {
      body = '<div class="card rl-stage">' + art('cheer') + '<h2>' + esc(t('relief_done_h')) + '</h2><p class="small">' + esc(t('relief_done_p')) + '</p></div>' +
        (S.canSave() ? (run.rated ? '<div class="card ok"><p>' + esc(t(run.rated === 'no' ? 'relief_thanks_no' : 'relief_thanks')) + '</p></div>'
          : '<h2>' + esc(t('relief_q')) + '</h2><div class="rl-rate">' + ['yes', 'some', 'no'].map((k) => '<button type="button" class="btn" data-rl-rate="' + k + '">' + esc(t('relief_r_' + k)) + '</button>').join('') + '</div>') : '') +
        (run.id === 'sleep' && S.routeOwner('calm') ? '<button type="button" class="btn primary block rl-calm-go" data-go="calm">' + S.icon('moon') + ' ' + esc(t('calm_more')) + '</button>' : '') +   /* Version 39.21 */
        doc(run.id) +
        '<div class="grid2"><button type="button" class="btn" id="rl-again">' + esc(t('relief_again')) + '</button>' + (r.more && S.routeOwner(r.more) ? '<button type="button" class="btn" data-go="' + r.more + '">' + esc(t('relief_more')) + '</button>' : '<button type="button" class="btn" data-go="relief">' + esc(t('relief_all')) + '</button>') + '</div>' +
        (r.noAsk ? '' : '<button type="button" class="btn ghost block" data-ask="' + esc(t('relief_' + run.id + '_t')) + '">' + esc(t('relief_ask')) + '</button>');
    }
    v.innerHTML = S.backRow(t('relief_' + run.id + '_t'), 'relief', false) + '<div class="rl-player">' + body + '</div>';
    S.wire(v); wire(v);
  }
  function wire(v) {
    const vs = v.querySelector('#rl-voice'); if (vs) vs.addEventListener('change', () => { run.voice = vs.checked; if (S.canSave()) { S.data('relief').voice = run.voice; S.saveQuiet(); } });
    const st = v.querySelector('#rl-start'); if (st) st.addEventListener('click', () => go(0));
    const ps = v.querySelector('#rl-pause'); if (ps) ps.addEventListener('click', () => { run.paused = !run.paused; if (run.paused && S.stopSpeech) S.stopSpeech(); if (run.paused && S.sound) S.sound.stopClip(); ps.textContent = t(run.paused ? 'relief_resume' : 'relief_pause'); });
    const nx = v.querySelector('#rl-next'); if (nx) nx.addEventListener('click', () => go(run.i + 1));
    const ag = v.querySelector('#rl-again'); if (ag) ag.addEventListener('click', () => { run.rated = null; go(0); });
    v.querySelectorAll('[data-rl-rate]').forEach((b) => b.addEventListener('click', () => {
      run.rated = b.dataset.rlRate; const d = D(); d.log.push({ d: S.toISO(S.today()), id: run.id, r: run.rated }); if (d.log.length > 400) d.log.splice(0, d.log.length - 400);
      S.save(); draw(v);   /* a save right after her tap: the garden counts it as looking after herself */
    }));
    if (run.i >= 0 && run.i < R[run.id].steps.length) { wireFig3(v); paint(v); tick(v); }
  }
  function go(i) {
    const v = document.getElementById('view'); if (!v || !run) return; const n = R[run.id].steps.length;
    stopRun(); run.i = i; run.paused = false; run.at = Date.now();
    if (i < n) { run.left = R[run.id].steps[i][1]; run.el = 0; }
    buzz(); draw(v); window.scrollTo(0, 0);
    if (i < n && run.voice) { const src = clipFor(R[run.id].steps[i][0]); setTimeout(() => { if (!run || run.i !== i || run.paused) return; if (src && S.sound.clip(src)) return; const el = v.querySelector('#rl-step'); if (el && S.speakEl) S.speakEl(el); }, 150); }
  }
  function tick(v) {
    clearInterval(tm);
    tm = setInterval(() => {
      if (!run || run.paused || !document.getElementById('rl-step')) return;
      run.left -= 0.25; run.el += 0.25; run.at = Date.now(); paint(v);
      if (run.left <= 0) go(run.i + 1);
    }, 250);
  }
  function paint(v) {
    const s = R[run.id].steps[run.i]; if (!s) return; const dur = s[1];
    const te = v.querySelector('#rl-time'); if (te) te.textContent = fmt(run.left);
    const arc = v.querySelector('#rl-arc'); if (arc) arc.setAttribute('stroke-dashoffset', (RING * (1 - run.left / dur)).toFixed(1));
    const lf = v.querySelector('#rl-left'); if (lf) lf.textContent = tf('relief_left', { t: fmt(run.left) });
    const br = s[2] ? BR[s[2]] : null; const c = v.querySelector('#rl-breath'); const ph = v.querySelector('#rl-phase');
    if (br && c && ph) {
      const cyc = br[0] + br[1] + br[2] + br[3]; const p = run.el % cyc; let lab, sc;
      if (p < br[0]) { lab = 'relief_in'; sc = 0.62 + 0.38 * (p / br[0]); }
      else if (p < br[0] + br[1]) { lab = 'relief_hold'; sc = 1; }
      else if (p < br[0] + br[1] + br[2]) { lab = 'relief_out'; sc = 1 - 0.38 * ((p - br[0] - br[1]) / br[2]); }
      else { lab = 'relief_hold'; sc = 0.62; }
      c.style.transform = 'scale(' + sc.toFixed(3) + ')'; const txt = t(lab); if (ph.textContent !== txt) ph.textContent = txt;
    }
  }
  /* Home: when she has noted one of these today and hasn't done its routine yet. Plain words in discreet mode. */
  function homeCard() {
    if (!S.canSave()) return '';
    const day = S.toISO(S.today()); const p = pick((S.state.daily || {})[day] || []); if (!p) return '';
    const log = (S.state.mods && S.state.mods.relief && S.state.mods.relief.log) || []; if (log.some((x) => x.d === day && x.id === p.id)) return '';
    return '<button type="button" class="action rl-home" data-go="relief-' + p.id + '"><span class="ico hue hue-' + p.hue + '">' + S.I.leaf + '</span><span class="body"><strong>' + esc(p.h) + '</strong><span class="small">' + esc(S.state.settings.discreet ? tf('relief_mins', { n: mins(p.id) }) : p.sub) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }

  S.register({
    id: 'relief',
    demoPersona: 'asha',
    strings: {
      en: {
        relief_h: 'Feel better now', relief_p: 'Short routines you can do anywhere, in about 3 minutes. Many women find they help a little. They don’t replace a doctor.',
        relief_tile_s: '3-minute routines for cramps, nausea, sleep, worry and hot flushes', relief_mins: 'About {n} minutes', relief_foot: 'Self-care only, not treatment. The same steps for every woman.',
        relief_cta_h: 'Feel better now', relief_all: 'All routines', relief_ask: 'Ask a Qura doctor about this',
        relief_cramps_t: 'For period cramps', relief_nausea_t: 'For nausea in pregnancy', relief_sleep_t: 'For poor sleep', relief_calm_t: 'When you feel anxious or low', relief_hot_t: 'For hot flushes',
        relief_intro: 'Sit or lie somewhere comfortable. Each step has a timer, and you can move on any time.', relief_voice: 'Read the steps aloud', relief_voice_d: 'Off on a shared phone, unless you turn it on',
        relief_start: 'Start', relief_pause: 'Pause', relief_resume: 'Go on', relief_next: 'Next', relief_finish: 'Finish', relief_step_n: 'Step {i} of {n}', relief_left: '{t} left in this step',
        relief_in: 'Breathe in', relief_hold: 'Hold', relief_out: 'Breathe out',
        relief_done_h: 'Well done', relief_done_p: 'You gave yourself a few quiet minutes.', relief_q: 'Did this help?', relief_r_yes: 'Yes', relief_r_some: 'A little', relief_r_no: 'Not really',
        relief_thanks: 'Thank you. Sakhi will remember what helps you.', relief_thanks_no: 'Thank you for telling Sakhi. If it keeps bothering you, see a doctor.', relief_again: 'Do it again', relief_more: 'Read more', relief_see_h: 'When to see a doctor',
        relief_c1_h: 'Warmth', relief_c1_p: 'Put warmth on your lower belly: a hot water bag, or a bottle of warm water wrapped in a cloth. Warm, not hot.',
        relief_c2_h: 'Child’s pose', relief_c2_p: 'Kneel, sit back on your heels and stretch your arms forward on the floor. Rest your forehead down and breathe slowly.',
        relief_c3_h: 'Knees to chest', relief_c3_p: 'Lie on your back and hug your knees to your chest. Rock gently from side to side.',
        relief_c4_h: 'Slow breaths', relief_c4_p: 'Breathe in for 4, and out for 6. Let your belly go soft each time you breathe out.',
        relief_cramps_doc: 'See a doctor if the pain stops your day, a simple painkiller doesn’t help, or it comes on other days of the month. Pain with fever or a bad-smelling discharge: see a doctor today. Severe pain on one side with a late period, or fainting: go to the nearest hospital now.',
        relief_n1_h: 'Fresh air', relief_n1_p: 'Open a window or step outside for a moment. Loosen anything tight around your waist.',
        relief_n2_h: 'Small sips', relief_n2_p: 'Take small, slow sips of cool water, or coconut water or nimbu pani if you like them.',
        relief_n3_h: 'Something plain', relief_n3_p: 'If you can, eat a little something dry and plain, like a few biscuits, khakhra or roasted chana. An empty stomach can make nausea worse.',
        relief_n4_h: 'Slow breaths', relief_n4_p: 'Sit comfortably. Breathe in through your nose for 4, and out through your mouth for 6.',
        relief_nausea_doc: 'See a doctor today if you can’t keep water or your medicines down for a day, you are losing weight, you feel dizzy, faint, confused or unsteady, or you pass very little dark urine. Vomiting with fever or belly pain also needs a doctor today. There are safe medicines for pregnancy sickness: ask your doctor instead of putting up with it.',
        relief_s1_h: 'Get comfortable', relief_s1_p: 'Lie down and dim the light. When this ends, put the phone away, face down.',
        relief_s2_h: 'Long breaths out', relief_s2_p: 'Breathe in for 4, and out slowly for 6. Longer breaths out help many people settle.',
        relief_s3_h: 'Let go, part by part', relief_s3_p: 'Squeeze your toes for 5 seconds, then let go. Do the same with your legs, your hands, then your shoulders.',
        relief_s4_h: 'Park your thoughts', relief_s4_p: 'If thoughts keep coming, tell yourself: I can think about this tomorrow. Writing it in your diary note can help.', relief_s5_h: 'A mantra or prayer, if you like', relief_s5_p: 'Chant softly, or in your mind: Om, the Gayatri mantra, the Hanuman Chalisa, or any prayer or devotional mantra you like. When thoughts come, gently go back to it.',
        relief_sleep_doc: 'Still awake after about 20 minutes? Get up and sit somewhere quiet in dim light until you feel sleepy, then go back to bed. Getting up at the same time every day helps too. Poor sleep most nights for a few weeks, or loud snoring with gasping, is worth a doctor’s visit.',
        relief_m1_h: 'Feel your feet', relief_m1_p: 'Press your feet into the floor. Name 5 things you can see and 3 things you can hear.',
        relief_m2_h: 'Box breathing', relief_m2_p: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Then again, slowly.',
        relief_m3_h: 'A kind word', relief_m3_p: 'Put a hand on your chest and tell yourself: this is hard, and it will pass.',
        relief_m4_h: 'One small step', relief_m4_p: 'Pick one small thing for the next hour: a glass of water, a short walk, or a call to someone you trust.',
        relief_calm_doc: 'Feeling low or anxious most days for two weeks or more: please talk to someone.',
        relief_h1_h: 'Cool down', relief_h1_p: 'Loosen your clothes or take off a layer. Splash cool water on your face and wrists.',
        relief_h2_h: 'Sip something cool', relief_h2_p: 'Sip cool water slowly. For some women hot tea or spicy food sets off flushes; notice what does it for you.',
        relief_h3_h: 'Slow breathing', relief_h3_p: 'Breathe slowly: in for 5, out for 5. Tell yourself: this will pass in a few minutes, I can let it pass. Keep going until the heat passes.',
        relief_hot_doc: 'If flushes break your sleep or your day most days, talk to a doctor: there are treatments, including hormone therapy and a short course of talking therapy (CBT), which NICE and the Indian Menopause Society recommend. Any bleeding after your periods have stopped for a year needs a check-up.'
      },
      hi: {
        relief_h: 'अभी थोड़ा आराम', relief_p: 'छोटे-छोटे तरीके, जो आप कहीं भी लगभग 3 मिनट में कर सकती हैं। बहुत सी महिलाओं को इनसे थोड़ा आराम मिलता है। ये डॉक्टर की जगह नहीं लेते।',
        relief_tile_s: 'ऐंठन, जी मिचलाना, नींद, घबराहट और हॉट फ़्लश के लिए 3 मिनट', relief_mins: 'लगभग {n} मिनट', relief_foot: 'सिर्फ़ अपनी देखभाल के लिए, इलाज नहीं। हर महिला के लिए एक जैसे क़दम।',
        relief_cta_h: 'अभी थोड़ा आराम', relief_all: 'सारे तरीके', relief_ask: 'इस बारे में Qura की डॉक्टर से पूछें',
        relief_cramps_t: 'पीरियड की ऐंठन के लिए', relief_nausea_t: 'प्रेग्नेंसी में जी मिचलाने के लिए', relief_sleep_t: 'नींद न आए तो', relief_calm_t: 'घबराहट या उदासी हो तो', relief_hot_t: 'हॉट फ़्लश के लिए',
        relief_intro: 'कहीं आराम से बैठ या लेट जाएँ। हर क़दम का टाइमर है, और आप कभी भी आगे बढ़ सकती हैं।', relief_voice: 'क़दम पढ़कर सुनाएँ', relief_voice_d: 'शेयर्ड फ़ोन पर बंद रहता है, जब तक आप चालू न करें',
        relief_start: 'शुरू करें', relief_pause: 'रोकें', relief_resume: 'जारी रखें', relief_next: 'आगे', relief_finish: 'ख़त्म करें', relief_step_n: '{n} में से {i} क़दम', relief_left: 'इस क़दम में {t} बाक़ी',
        relief_in: 'साँस अंदर', relief_hold: 'रोकें', relief_out: 'साँस बाहर',
        relief_done_h: 'बहुत अच्छा', relief_done_p: 'आपने अपने लिए कुछ शांत मिनट निकाले।', relief_q: 'क्या इससे आराम मिला?', relief_r_yes: 'हाँ', relief_r_some: 'थोड़ा', relief_r_no: 'नहीं',
        relief_thanks: 'शुक्रिया। Sakhi याद रखेगी कि आपको किससे आराम मिलता है।', relief_thanks_no: 'बताने के लिए शुक्रिया। परेशानी बनी रहे तो डॉक्टर को दिखाएँ।', relief_again: 'फिर से करें', relief_more: 'और पढ़ें', relief_see_h: 'डॉक्टर को कब दिखाएँ',
        relief_c1_h: 'गर्माहट', relief_c1_p: 'पेट के निचले हिस्से पर गर्माहट रखें: गर्म पानी की थैली, या कपड़े में लपेटी गर्म पानी की बोतल। गुनगुना, ज़्यादा गर्म नहीं।',
        relief_c2_h: 'बालासन', relief_c2_p: 'घुटनों के बल बैठें, एड़ियों पर पीछे की ओर बैठ जाएँ और बाँहें आगे ज़मीन पर फैलाएँ। माथा नीचे टिकाएँ और धीरे-धीरे साँस लें।',
        relief_c3_h: 'घुटने सीने से', relief_c3_p: 'पीठ के बल लेटें और घुटनों को सीने से लगाकर पकड़ें। धीरे-धीरे दाएँ-बाएँ झूलें।',
        relief_c4_h: 'धीमी साँसें', relief_c4_p: '4 गिनते हुए साँस अंदर लें, 6 गिनते हुए बाहर छोड़ें। हर बार साँस छोड़ते हुए पेट ढीला छोड़ दें।',
        relief_cramps_doc: 'दर्द से दिन का काम रुक जाए, सामान्य दर्द की गोली से आराम न हो, या महीने के दूसरे दिनों में भी दर्द हो, तो डॉक्टर को दिखाएँ। दर्द के साथ बुखार या बदबूदार सफ़ेद पानी: आज ही डॉक्टर को दिखाएँ। पीरियड देर से हो और एक तरफ़ तेज़ दर्द हो, या बेहोशी आए: अभी सबसे पास के अस्पताल जाएँ।',
        relief_n1_h: 'ताज़ी हवा', relief_n1_p: 'खिड़की खोलें या थोड़ी देर बाहर निकलें। कमर पर कुछ कसा हो तो ढीला कर लें।',
        relief_n2_h: 'छोटे घूँट', relief_n2_p: 'ठंडा पानी छोटे-छोटे घूँट में धीरे पिएँ, या अच्छा लगे तो नारियल पानी या नींबू पानी।',
        relief_n3_h: 'कुछ सादा', relief_n3_p: 'हो सके तो कुछ सूखा और सादा खाएँ, जैसे दो-चार बिस्किट, खाखरा या भुने चने। ख़ाली पेट जी ज़्यादा मिचला सकता है।',
        relief_n4_h: 'धीमी साँसें', relief_n4_p: 'आराम से बैठें। नाक से 4 गिनते हुए साँस अंदर लें, मुँह से 6 गिनते हुए बाहर छोड़ें।',
        relief_nausea_doc: 'अगर पूरे दिन पानी या दवा भी न टिके, वज़न घट रहा हो, चक्कर, बेहोशी, उलझन या लड़खड़ाहट हो, या पेशाब बहुत कम और गहरे रंग का हो, तो आज ही डॉक्टर को दिखाएँ। उल्टी के साथ बुखार या पेट दर्द हो, तो भी आज ही। प्रेग्नेंसी की उल्टी के लिए सुरक्षित दवाएँ हैं: सहती न रहें, डॉक्टर से पूछें।',
        relief_s1_h: 'आराम से लेटें', relief_s1_p: 'लेट जाएँ और रोशनी धीमी कर दें। यह ख़त्म हो जाए, तो फ़ोन उल्टा करके रख दें।',
        relief_s2_h: 'लंबी साँस बाहर', relief_s2_p: '4 गिनते हुए साँस अंदर, फिर धीरे-धीरे 6 गिनते हुए बाहर। लंबी साँस छोड़ने से बहुत लोगों को सुकून मिलता है।',
        relief_s3_h: 'एक-एक करके ढीला छोड़ें', relief_s3_p: 'पैरों की उँगलियाँ 5 सेकंड कसें, फिर छोड़ दें। ऐसा ही पैरों, हाथों और फिर कंधों के साथ करें।',
        relief_s4_h: 'विचार कल पर छोड़ें', relief_s4_p: 'विचार आते रहें, तो ख़ुद से कहें: इस बारे में कल सोचूँगी। डायरी के नोट में लिख देना भी मदद करता है।', relief_s5_h: 'चाहें तो कोई मंत्र या प्रार्थना', relief_s5_p: 'धीरे से या मन में जपें: ॐ, गायत्री मंत्र, हनुमान चालीसा, या कोई भी प्रार्थना या भक्ति मंत्र जो आपको पसंद हो। विचार आएँ, तो धीरे से फिर जप पर लौट आएँ।',
        relief_sleep_doc: 'लगभग 20 मिनट बाद भी नींद न आए? उठकर किसी शांत जगह हल्की रोशनी में बैठें, नींद आने लगे तब फिर लेटें। रोज़ एक ही समय उठना भी मदद करता है। कुछ हफ़्तों से ज़्यादातर रातें नींद ठीक न आए, या ज़ोर के खर्राटों के साथ साँस अटके, तो डॉक्टर को दिखाएँ।',
        relief_m1_h: 'पैरों को महसूस करें', relief_m1_p: 'पैरों को ज़मीन पर दबाएँ। 5 चीज़ें जो दिख रही हैं और 3 आवाज़ें जो सुनाई दे रही हैं, उनके नाम लें।',
        relief_m2_h: 'चौकोर साँस', relief_m2_p: '4 तक साँस अंदर, 4 तक रोकें, 4 तक बाहर, 4 तक रोकें। फिर से, धीरे-धीरे।',
        relief_m3_h: 'अपने लिए अच्छे शब्द', relief_m3_p: 'सीने पर हाथ रखें और ख़ुद से कहें: यह मुश्किल है, और यह गुज़र जाएगा।',
        relief_m4_h: 'एक छोटा क़दम', relief_m4_p: 'अगले एक घंटे के लिए एक छोटी चीज़ चुनें: एक गिलास पानी, थोड़ी देर टहलना, या किसी भरोसेमंद को फ़ोन।',
        relief_calm_doc: 'दो हफ़्ते या उससे ज़्यादा, ज़्यादातर दिन उदासी या घबराहट रहे: किसी से बात करें।',
        relief_h1_h: 'ठंडक', relief_h1_p: 'कपड़े ढीले करें या एक परत उतार दें। चेहरे और कलाइयों पर ठंडे पानी के छींटे मारें।',
        relief_h2_h: 'कुछ ठंडा पिएँ', relief_h2_p: 'ठंडा पानी धीरे-धीरे पिएँ। कुछ महिलाओं को गर्म चाय या तीखे खाने से फ़्लश होते हैं; ध्यान दें कि आपको किससे होते हैं।',
        relief_h3_h: 'धीमी साँस', relief_h3_p: 'धीरे-धीरे साँस लें: 5 तक अंदर, 5 तक बाहर। ख़ुद से कहें: यह कुछ मिनट में उतर जाएगी, मैं इसे जाने दूँगी। गर्मी उतरने तक ऐसे ही करती रहें।',
        relief_hot_doc: 'ज़्यादातर दिन फ़्लश से नींद या काम में रुकावट हो, तो डॉक्टर से बात करें: इसका इलाज है, जैसे हॉर्मोन therapy और बातचीत वाली therapy (CBT) का छोटा कोर्स, जिसकी सलाह NICE और Indian Menopause Society देते हैं। पीरियड एक साल से बंद होने के बाद कोई भी ब्लीडिंग हो, तो जाँच ज़रूरी है।'
      }
    },
    routes: { relief: renderList },
    prefixes: { 'relief-': (v, rest) => renderPlayer(v, rest) },
    testRoutes: ['relief-cramps', 'relief-nausea', 'relief-sleep', 'relief-calm', 'relief-hot'],
    open: ['relief', 'relief-*'],
    tiles: [{ section: 'tools', route: 'relief', title: 'relief_h', sub: 'relief_tile_s', icon: 'leaf', order: 4, keywords: 'pain cramps dard aithan nausea ulti ji michlana sleep neend anxiety ghabrahat tension udasi low mood hot flush garmi relax breathing saans' }],
    afterRender: (v, route) => { if (!/^relief-/.test(route || '')) stopRun(); },
    sample: (id) => { if (id === 'asha') D().log.push({ d: '2026-09-29', id: 'cramps', r: 'yes' }); if (id === 'kamla') D().log.push({ d: '2026-10-12', id: 'hot', r: 'some' }); },
    css: '.rl-player { display: flex; flex-direction: column; gap: 12px; }' +
      '.rl-stage { align-items: center; text-align: center; gap: 8px; }' +
      '.rl-stage .sakhi { width: 76px; height: 76px; } .rl-stage h2 { margin: 0; }' +
      /* Version 39.67: the 3D figure on the renders' own light grey, as in the player */
      '.rl-figbox { width: 100%; max-width: 240px; border-radius: 20px; overflow: hidden; background: #EBEBEB; } .rl-3d { display: block; width: 100%; height: auto; aspect-ratio: 6 / 5; object-fit: cover; }' +
      '@media (max-height: 860px) { .rl-figbox { max-width: 200px; } } @media (max-height: 720px) { .rl-figbox { max-width: 120px; } .rl-player .rl-timer { width: 96px; height: 96px; } .rl-player .rl-timer b { font-size: 22px; } .rl-player { gap: 8px; } }' +
      /* Version 39.67: Pause and Next stay above the tab bar, as the player's (Version 39.39, Mohit's Flip5: "fix the buttons") */
      '.rl-ctl { position: sticky; bottom: calc(74px + env(safe-area-inset-bottom, 0px)); z-index: 2; padding: 6px 0; margin: -6px 0; background: var(--bg); box-shadow: 0 -10px 10px -8px var(--bg); } @media (min-width: 600px) { .rl-ctl { bottom: calc(90px + env(safe-area-inset-bottom, 0px)); } }' +
      '.rl-dots { display: flex; justify-content: center; gap: 6px; } .rl-dots i { width: 22px; height: 6px; border-radius: 3px; background: var(--line); } .rl-dots i.on { background: var(--accent); } .rl-dots i.done { background: var(--accent-2); }' +
      '.rl-timer { position: relative; width: 132px; height: 132px; align-self: center; } .rl-timer svg { width: 100%; height: 100%; transform: rotate(-90deg); }' +
      '.rl-timer .trk { fill: none; stroke: var(--line); stroke-width: 8; } .rl-timer .arc { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }' +
      '.rl-timer b { position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; font-variant-numeric: tabular-nums; color: var(--fg); }' +
      '.rl-breath-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; } .rl-breath { width: 150px; height: 150px; border-radius: 50%; background: var(--accent-soft); border: 2px solid var(--accent-2); transform: scale(0.62); transition: transform 0.25s linear; }' +
      '.rl-breath-wrap b { font-size: 20px; color: var(--fg); min-height: 1.4em; } .rl-left { text-align: center; font-variant-numeric: tabular-nums; }' +
      '.rl-rate { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }' +
      '@media (prefers-reduced-motion: reduce) { .rl-breath, .rl-timer .arc { transition: none; } }'
  });
})(window.Saathi);
