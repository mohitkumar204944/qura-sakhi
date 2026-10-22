/* My ASHA or ANM (Version 28; docs/feature-research-2026-10-22.md, B4). Her ASHA and the ANM are the people Indian women
   already call about their health, and the free link to government care. Here she saves her ASHA's or ANM's number (on this
   phone only), calls her in one tap, and opens a large-type summary to show her: stage, iron days, check-ups, method and
   her own questions. Nothing is sent, and the ASHA gets no extra work. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const D = () => S.data('asha');
  const fmt = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  /* a 10-digit Indian mobile number from what she typed (+91, a leading 0 and spaces allowed) */
  const tenDigits = (raw) => { let n = String(raw || '').replace(/\D/g, ''); if (n.length === 12 && n.indexOf('91') === 0) n = n.slice(2); if (n.length === 11 && n[0] === '0') n = n.slice(1); return /^[6-9]\d{9}$/.test(n) ? n : ''; };
  const spaced = (n) => n.slice(0, 5) + ' ' + n.slice(5);
  const mem = { edit: false, err: '' };
  if (S.onOwnerChange) S.onOwnerChange(() => { mem.edit = false; mem.err = ''; });

  function formHtml(d) {
    const role = d.role === 'anm' ? 'anm' : 'asha';
    return '<div class="card" id="asha-form"><h3>' + esc(t(d.phone ? 'asha_change_h' : 'asha_add_h')) + '</h3>' +
      '<div class="chips" role="radiogroup" aria-label="' + esc(t('asha_who')) + '">' + ['asha', 'anm'].map((r) => '<button type="button" class="chip' + (role === r ? ' on' : '') + '" role="radio" aria-checked="' + (role === r) + '" data-asha-role="' + r + '">' + esc(t('asha_role_' + r)) + '</button>').join('') + '</div>' +
      '<label for="asha-name">' + esc(t('asha_name_l')) + '</label><input id="asha-name" autocomplete="off" maxlength="40" value="' + esc(d.name || '') + '">' +
      '<label for="asha-phone">' + esc(t('asha_phone_l')) + '</label><input id="asha-phone" inputmode="tel" autocomplete="off" maxlength="16" placeholder="' + esc(t('asha_phone_ph')) + '" value="' + esc(d.phone || '') + '">' +
      (mem.err ? '<div class="flag" role="alert">' + esc(mem.err) + '</div>' : '') +
      '<p class="small">' + esc(t('asha_stays')) + '</p>' +
      '<div class="grid2"><button type="button" class="btn primary" id="asha-save">' + esc(t('asha_save')) + '</button>' + (d.phone ? '<button type="button" class="btn" id="asha-cancel">' + esc(t('cancel')) + '</button>' : '') + '</div>' +
      (d.phone ? '<button type="button" class="linkbtn" id="asha-del">' + esc(t('asha_del')) + '</button>' : '') + '</div>';
  }
  function render(v) {
    const head = S.backRow(t('asha_h'), 'care', false);
    const find = '<div class="card soft"><h3>' + esc(t('asha_find_h')) + '</h3><p class="small">' + esc(t('asha_find_p')) + '</p>' + (S.routeOwner('access-care') ? '<button type="button" class="btn sm" style="align-self:flex-start" data-go="access-care">' + esc(t('asha_care')) + '</button>' : '') + '</div>';
    if (!S.canSave()) { v.innerHTML = head + '<p>' + esc(t('asha_p')) + '</p>' + find + S.needDiary(); S.wire(v); return; }
    const d = D(); const has = !!tenDigits(d.phone);
    const card = has && !mem.edit ? '<div class="card asha-card" data-nofold="1"><span class="eyebrow">' + esc(t('asha_role_' + (d.role === 'anm' ? 'anm' : 'asha'))) + '</span><h2>' + esc(d.name || t('asha_role_' + (d.role === 'anm' ? 'anm' : 'asha'))) + '</h2><p class="asha-num num">' + esc(spaced(tenDigits(d.phone))) + '</p>' +
      '<div class="grid2"><a class="btn primary" id="asha-call" href="tel:+91' + esc(tenDigits(d.phone)) + '">' + S.I.person + ' ' + esc(t('asha_call')) + '</a><button type="button" class="btn" data-go="asha-show">' + esc(t('asha_show')) + '</button></div>' +
      '<button type="button" class="linkbtn" id="asha-edit">' + esc(t('asha_change')) + '</button></div>' : formHtml(d);
    v.innerHTML = head + '<p>' + esc(t('asha_p')) + '</p>' + card + (has ? '' : find) +
      '<div class="card"><h3>' + esc(t('asha_can_h')) + '</h3><ul class="asha-ul">' + ['asha_can1', 'asha_can2', 'asha_can3', 'asha_can4'].map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ul></div>' +
      (has ? find : '') + '<p class="footnote">' + esc(t('asha_foot')) + '</p>';
    S.wire(v);
    let role = d.role === 'anm' ? 'anm' : 'asha';
    v.querySelectorAll('[data-asha-role]').forEach((b) => b.addEventListener('click', () => { role = b.dataset.ashaRole; v.querySelectorAll('[data-asha-role]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); }); }));
    const sv = v.querySelector('#asha-save'); if (sv) sv.addEventListener('click', () => {
      const n = tenDigits(v.querySelector('#asha-phone').value);
      if (!n) { mem.err = t('asha_bad'); S.render(); return; }
      Object.assign(d, { name: v.querySelector('#asha-name').value.trim().slice(0, 40), phone: n, role: role });
      mem.edit = false; mem.err = ''; S.save(); S.toast(t('asha_saved')); S.render();
    });
    const cn = v.querySelector('#asha-cancel'); if (cn) cn.addEventListener('click', () => { mem.edit = false; mem.err = ''; S.render(); });
    const ed = v.querySelector('#asha-edit'); if (ed) ed.addEventListener('click', () => { mem.edit = true; S.render(); });
    const dl = v.querySelector('#asha-del'); if (dl) dl.addEventListener('click', () => { delete d.name; delete d.phone; delete d.role; mem.edit = false; mem.err = ''; S.save(); S.render(); });
  }

  /* ---------- the summary she shows: big type, her own entries, nothing sent ---------- */
  const SHOW_MODS = ['preg', 'post', 'iron', 'access', 'screen', 'contra'];
  function renderShow(v) {
    if (!S.canSave()) { render(v); return; }
    const sit = S.state.situation || {}; const acc = S.account && S.account.signedIn() ? S.account.info() : {}; const age = S.cycle.ageYears();
    const about = [];
    if (acc.name) about.push(acc.name + (age != null ? ', ' + tf('asha_age', { n: age }) : '')); else if (age != null) about.push(tf('asha_age', { n: age }));
    const pi = S.preg && S.preg.info ? S.preg.info() : null;
    if (pi) about.push(tf('asha_preg', { w: pi.weeks, d: fmt(S.fromISO(pi.edd)) }));
    else if (S.cycle.afterBirth() && sit.deliveredOn) about.push(tf('asha_born', { d: fmt(S.fromISO(sit.deliveredOn)) }));
    else { const ls = S.cycle.lastStart(); if (ls) about.push(tf('asha_last', { d: fmt(ls) })); }
    const blocks = [];
    (S.summaries() || []).filter((m) => SHOW_MODS.indexOf(m.mod) >= 0).sort((a, b) => SHOW_MODS.indexOf(a.mod) - SHOW_MODS.indexOf(b.mod)).forEach((m) => (m.sections || []).forEach((x) => { if (x && x.lines && x.lines.length) blocks.push(x); }));
    const qs = (S.state.askTopics || []).filter((x) => typeof x === 'string' && x);
    const block = (h, lines) => '<div class="asha-block"><h3>' + esc(h) + '</h3><ul>' + lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>';
    v.innerHTML = S.backRow(t('asha_show_h'), 'asha', false) + '<div class="card asha-show" data-nofold="1">' +
      (about.length ? block(t('asha_about'), about) : '') + blocks.map((x) => block(x.title, x.lines)).join('') + (qs.length ? block(t('asha_qs'), qs) : '') +
      (!about.length && !blocks.length && !qs.length ? '<p>' + esc(t('asha_empty')) + '</p>' : '') + '</div>' +
      '<p class="footnote">' + esc(t('asha_show_foot')) + '</p>';
    S.wire(v);
  }

  /* for other modules (the pregnancy plan): is her ASHA's number saved? Read-only */
  S.asha = { saved: () => S.canSave() && !!tenDigits(D().phone) };
  /* Home's setup card (Version 30): her ASHA's number, at every stage */
  const setup = () => (S.canSave() ? { id: 'asha', order: 50, title: t('asha_setup'), sub: t('asha_help_s'), go: 'asha', done: S.asha.saved() } : null);

  S.register({
    id: 'asha',
    strings: {
      en: {
        asha_h: 'My ASHA or ANM', asha_tile_s: 'Save her number, call in one tap, show her your summary', asha_help_s: 'Call her in one tap',
        asha_p: 'Your ASHA and the ANM at your health centre are your free link to government care: check-ups, iron tablets, vaccines and schemes. Save her number to call her in one tap.',
        asha_add_h: 'Add your ASHA or ANM', asha_change_h: 'Change her details', asha_who: 'Who is she?', asha_role_asha: 'ASHA', asha_role_anm: 'ANM',
        asha_name_l: 'Her name (optional)', asha_phone_l: 'Her mobile number', asha_phone_ph: '10 digits, e.g. 98765 43210',
        asha_stays: 'Her number stays on this phone. Sakhi never sends it anywhere.', asha_save: 'Save', asha_saved: 'Saved.', asha_bad: 'Enter a 10-digit mobile number.',
        asha_setup: 'Save your ASHA or ANM’s number',
        asha_del: 'Remove her number', asha_call: 'Call', asha_show: 'Show her my summary', asha_change: 'Change',
        asha_find_h: 'Don’t know your ASHA?', asha_find_p: 'Ask at your nearest Anganwadi centre or Ayushman Arogya Mandir. In states that run it, 104 can help too.', asha_care: 'Care near me',
        asha_can_h: 'What she can help with', asha_can1: 'Registering a pregnancy, and the free check-ups and vaccines', asha_can2: 'Iron tablets, calcium and the weekly iron tablet', asha_can3: 'Schemes like PMMVY and JSY, and the forms', asha_can4: 'Family planning, and where to go for anything she can’t do',
        asha_foot: 'ASHAs and ANMs are government health workers. Their help is free.',
        asha_show_h: 'For my ASHA or ANM', asha_about: 'About me', asha_age: 'age {n}', asha_preg: 'Pregnant: about week {w}, due {d}', asha_born: 'My baby was born on {d}', asha_last: 'My last period started on {d}',
        asha_qs: 'My questions', asha_empty: 'Nothing to show yet. Your diary, iron days and check-ups fill this page.', asha_show_foot: 'From your own entries on this phone. Nothing was sent.'
      },
      hi: {
        asha_h: 'मेरी ASHA या ANM', asha_tile_s: 'उनका नंबर सेव करें, एक टैप में कॉल करें, अपना सारांश दिखाएँ', asha_help_s: 'एक टैप में कॉल करें',
        asha_p: 'आपकी ASHA और स्वास्थ्य केंद्र की ANM सरकारी इलाज से आपका मुफ़्त जुड़ाव हैं: जाँच, आयरन की गोलियाँ, टीके और योजनाएँ। एक टैप में कॉल करने के लिए उनका नंबर सेव करें।',
        asha_add_h: 'अपनी ASHA या ANM जोड़ें', asha_change_h: 'उनकी जानकारी बदलें', asha_who: 'वह कौन हैं?', asha_role_asha: 'ASHA', asha_role_anm: 'ANM',
        asha_name_l: 'उनका नाम (चाहें तो)', asha_phone_l: 'उनका मोबाइल नंबर', asha_phone_ph: '10 अंक, जैसे 98765 43210',
        asha_stays: 'उनका नंबर इसी फ़ोन पर रहता है। Sakhi इसे कहीं नहीं भेजती।', asha_save: 'सेव करें', asha_saved: 'सेव हो गया।', asha_bad: '10 अंकों का मोबाइल नंबर लिखें।',
        asha_setup: 'अपनी ASHA या ANM का नंबर सेव करें',
        asha_del: 'उनका नंबर हटाएँ', asha_call: 'कॉल करें', asha_show: 'उन्हें मेरा सारांश दिखाएँ', asha_change: 'बदलें',
        asha_find_h: 'अपनी ASHA नहीं पता?', asha_find_p: 'पास के आंगनवाड़ी केंद्र या आयुष्मान आरोग्य मंदिर में पूछें। जिन राज्यों में 104 चलता है, वहाँ उससे भी मदद मिल सकती है।', asha_care: 'मेरे पास इलाज',
        asha_can_h: 'वह किसमें मदद कर सकती हैं', asha_can1: 'गर्भ का पंजीकरण, और मुफ़्त जाँच और टीके', asha_can2: 'आयरन की गोलियाँ, कैल्शियम और हफ़्ते की आयरन गोली', asha_can3: 'PMMVY और JSY जैसी योजनाएँ, और उनके फ़ॉर्म', asha_can4: 'परिवार नियोजन, और जो वह न कर सकें उसके लिए कहाँ जाएँ',
        asha_foot: 'ASHA और ANM सरकारी स्वास्थ्यकर्मी हैं। उनकी मदद मुफ़्त है।',
        asha_show_h: 'मेरी ASHA या ANM के लिए', asha_about: 'मेरे बारे में', asha_age: 'उम्र {n}', asha_preg: 'गर्भवती: लगभग हफ़्ता {w}, डिलीवरी की तारीख़ {d}', asha_born: 'मेरा बच्चा {d} को हुआ', asha_last: 'मेरा पिछला पीरियड {d} को शुरू हुआ',
        asha_qs: 'मेरे सवाल', asha_empty: 'अभी दिखाने को कुछ नहीं। आपकी डायरी, आयरन के दिन और जाँचें इस पन्ने को भरती हैं।', asha_show_foot: 'इसी फ़ोन पर आपकी अपनी entries से। कुछ भी भेजा नहीं गया।'
      }
    },
    routes: { asha: render, 'asha-show': renderShow },
    setup: setup,
    open: ['asha'],
    tiles: [
      { section: 'tools', route: 'asha', title: 'asha_h', sub: 'asha_tile_s', icon: 'person', order: 3, gated: false, keywords: 'asha anm health worker didi call phone number anganwadi आशा एएनएम दीदी फ़ोन' },
      { section: 'preg', route: 'asha', title: 'asha_h', sub: 'asha_tile_s', icon: 'person', order: 46, gated: false, keywords: 'asha anm call आशा' },
      { section: 'post', route: 'asha', title: 'asha_h', sub: 'asha_tile_s', icon: 'person', order: 46, gated: false, keywords: 'asha anm call आशा' }
    ],
    css: '.asha-card h2 { margin: 0; } .asha-num { font-size: 22px; font-weight: 600; color: var(--fg); margin: 0; letter-spacing: 0.5px; } .asha-ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; color: var(--fg); }' +
      '.asha-show { gap: 16px; } .asha-block h3 { margin: 0 0 6px; } .asha-block ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; } .asha-block li { font-size: 18px; line-height: 1.45; color: var(--fg); }'
  });
})(window.Saathi);
