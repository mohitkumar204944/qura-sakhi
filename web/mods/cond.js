/* Conditions beyond PMOS: an endometriosis pain diary, fibroids/cysts/polyps, pelvic infection and genital TB, a lab results log, anaemia with a heavy-bleeding chart (PBAC), periods stopping before 40 (POI), and questions before a hysterectomy. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const ID = 'cond';

  /* Screen state that is never saved. */
  const mem = { endo: null, lab: null, labPre: null, pb: null };

  /* ---------- sources (all checked) ---------- */
  const SRC = {
    whoEndo: { url: 'https://www.who.int/news-room/fact-sheets/detail/endometriosis', en: 'WHO fact sheet: Endometriosis, 2025', hi: 'WHO fact sheet: एंडोमेट्रियोसिस, 2025' },
    acogInf: { url: 'https://www.acog.org/womens-health/faqs/evaluating-infertility', en: 'ACOG: Evaluating infertility', hi: 'ACOG: बच्चा न होने की जाँच' },
    nhsCyst: { url: 'https://www.nhs.uk/conditions/ovarian-cyst/', en: 'NHS: Ovarian cyst', hi: 'NHS: अंडाशय की सिस्ट' },
    nhsFib: { url: 'https://www.nhs.uk/conditions/fibroids/', en: 'NHS: Fibroids', hi: 'NHS: फाइब्रॉइड' },
    acogFib: { url: 'https://www.acog.org/womens-health/faqs/uterine-fibroids', en: 'ACOG: Uterine fibroids', hi: 'ACOG: फाइब्रॉइड' },
    torsion: { url: 'https://www.rightdecisions.scot.nhs.uk/nhs-borders-clinical-guidelines/acute-services/gynaecology/ovarian-cystsmasses-management/', en: 'NHS Borders: ovarian cysts and torsion', hi: 'NHS Borders: सिस्ट और अंडाशय का मुड़ना' },
    cdcPid: { url: 'https://www.cdc.gov/std/treatment-guidelines/pid.htm', en: 'CDC: PID treatment guidelines', hi: 'CDC: PID इलाज की गाइड' },
    naco: { url: 'https://naco.mohfw.gov.in/division/sti-rti-services/', en: 'NACO: STI/RTI services (Suraksha Clinics)', hi: 'NACO: STI/RTI सेवाएँ (सुरक्षा क्लिनिक)' },
    icmrTb: { url: 'https://icmr.gov.in/icmrobject/uploads/STWs/1725964688_8_fgtm_15032022.pdf', en: 'ICMR treatment workflow: female genital TB, 2022', hi: 'ICMR: महिलाओं की जननांग टीबी का इलाज-क्रम, 2022' },
    whoSero: { url: 'https://www.who.int/news/item/20-07-2011-who-warns-against-the-use-of-inaccurate-blood-tests-for-active-tuberculosis', en: 'WHO warning on TB blood tests, 2011', hi: 'WHO: टीबी के ग़लत blood test पर चेतावनी, 2011' },
    whoIgra: { url: 'https://tbksp.who.int/en/node/3082', en: 'WHO: skin tests and IGRA cannot diagnose TB disease', hi: 'WHO: skin test और IGRA से टीबी बीमारी पता नहीं चलती' },
    ntep: { url: 'https://dghs.mohfw.gov.in/national-tuberculosis-elimination-programme.php', en: 'National TB Elimination Programme', hi: 'राष्ट्रीय टीबी उन्मूलन कार्यक्रम' },
    npy: { url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/mar/doc2025324525701.pdf', en: 'PIB, World TB Day 2025: Ni-kshay Poshan Yojana ₹1,000 a month', hi: 'PIB, विश्व टीबी दिवस 2025: निक्षय पोषण योजना ₹1,000 महीना' },
    tbHelp: { url: 'https://tbcindia.mohfw.gov.in/faqs/', en: 'Central TB Division FAQs (helpline 1800-11-6666)', hi: 'केंद्रीय टीबी विभाग FAQ (हेल्पलाइन 1800-11-6666)' },
    amb: { url: 'https://www.nhm.gov.in/New-Update-2025-26/Nutrition/AMB-guidelines/AMB-Abhiyaan-Guidelines.pdf', en: 'Anemia Mukt Bharat Abhiyaan guidelines, 2026', hi: 'एनीमिया मुक्त भारत अभियान गाइड, 2026' },
    pbac: { url: 'https://doi.org/10.1111/j.1471-0528.1990.tb16249.x', en: 'Higham, O\'Brien, Shaw. BJOG 1990 (blood loss chart)', hi: 'Higham और साथी, BJOG 1990 (ब्लीडिंग चार्ट)' },
    eshre: { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11631070/', en: 'ESHRE guideline: premature ovarian insufficiency, 2024', hi: 'ESHRE गाइड: 40 से पहले अंडाशय का रुकना (POI), 2024' },
    nhsEarly: { url: 'https://www.nhs.uk/conditions/early-menopause/', en: 'NHS: Early menopause', hi: 'NHS: जल्दी मेनोपॉज़' },
    charter: { url: 'http://clinicalestablishments.mohfw.gov.in/sites/default/files/2023-03/2911.pdf', en: 'Charter of Patients\' Rights and Responsibilities, 2021', hi: 'मरीज़ों के अधिकार और ज़िम्मेदारियों का चार्टर, 2021' },
    sc: { url: 'https://www.livelaw.in/pdf_upload/310-dr-narendra-gupta-v-union-of-india-5-apr-2023-470717.pdf', en: 'Supreme Court, Narendra Gupta v Union of India, 5 April 2023', hi: 'सुप्रीम कोर्ट, नरेंद्र गुप्ता बनाम भारत सरकार, 5 अप्रैल 2023' },
    pmjay: { url: 'https://nha.gov.in/PM-JAY', en: 'National Health Authority: PM-JAY', hi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण: PM-JAY' }
  };

  /* ---------- small helpers ---------- */
  const h = (o) => esc(tx(o));
  const P = (o, cls) => '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + h(o) + '</p>';
  const ul = (arr) => '<ul>' + arr.map((o) => '<li>' + h(o) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((o) => '<li>' + h(o) + '</li>').join('') + '</ol>';
  const intro = (o) => '<p class="small">' + h(o) + '</p>';
  const flag = (cls, o) => '<div class="flag' + (cls ? ' ' + cls : '') + '"><span>' + h(o) + '</span></div>';
  const flagLead = (cls, lead, body) => '<div class="flag' + (cls ? ' ' + cls : '') + '"><span><strong>' + esc(lead) + ':</strong> ' + esc(body) + '</span></div>';
  const linkItem = (route, icon, title, sub, pill) => '<button type="button" class="item" data-go="' + esc(route) + '"><span class="ico-sm">' + S.icon(icon) + '</span><span class="body"><strong>' + esc(title) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span>' + (pill ? '<span class="pill" style="flex-shrink:0">' + esc(pill) + '</span>' : '') + '</button>';
  const askCard = (topic, body) => '<div class="card dark"><h3>' + esc(t('qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + h(body) + '</p><button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none;align-self:flex-start" data-ask="' + esc(tx(topic)) + '">' + esc(t('ask_qura')) + '</button></div>';
  const sources = (keys) => '<details><summary>' + esc(t('sources')) + '</summary><p class="sources">' + keys.map((k) => { const s = SRC[k]; return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + h(s) + '</a>'; }).join(' · ') + '</p></details>';
  const foot = (o) => '<p class="footnote" style="text-align:left">' + h(o) + '</p>';
  const sub = (o) => '<h3 class="cond-sub">' + h(o) + '</h3>';
  const copyRow = (num, o) => '<div class="helpline"><div><div class="n num">' + esc(num) + '</div><div class="what">' + h(o) + '</div></div><button type="button" class="btn sm" data-ccopy="' + esc(num) + '">' + esc(t('copy')) + '</button></div>';
  function wireCopy(v) {
    v.querySelectorAll('[data-ccopy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.ccopy; const done = () => S.toast(t('copied') + ' ' + n);
      try { navigator.clipboard.writeText(n).then(done, () => S.toast(n)); } catch (e) { S.toast(n); }
    }));
  }
  const fmtS = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short' });
  const fmtL = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short', year: 'numeric' });
  const okDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const num = (x) => String(Math.round(x * 100) / 100);
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const startsU = () => uniq(S.cycle.starts()).sort();
  function cdOf(dateStr, st) {
    let s = null;
    for (let i = 0; i < st.length; i++) { if (st[i] <= dateStr) s = st[i]; else break; }
    return s ? { start: s, day: S.diffDays(S.fromISO(s), S.fromISO(dateStr)) + 1 } : null;
  }
  const cycOff = () => { const s = S.state.situation || {}; return !!(s.pregnant || s.hysterectomy || s.stopped); };

  /* ---------- saved data ---------- */
  /* state.mods.cond = { pain: { 'YYYY-MM-DD': { p: 0-10, z: [zone], ty: [type] } },
                         labs: [ { id, k, v, u, d, lo, hi } ],
                         pbac: { 'YYYY-MM-DD' (first day of that period): { d: [ { l, h, f, cs, cl, fl } x 10 ] } },
                         hyst: { questionKey: true } } */
  const modR = () => (S.state.mods && S.state.mods[ID]) || {};
  const painR = () => { const m = modR(); return m.pain && typeof m.pain === 'object' ? m.pain : {}; };
  const painW = () => { const d = S.data(ID); if (!d.pain || typeof d.pain !== 'object') d.pain = {}; return d.pain; };
  const labsR = () => { const m = modR(); return Array.isArray(m.labs) ? m.labs.filter((x) => x && typeof x.v === 'number') : []; };
  const labsW = () => { const d = S.data(ID); if (!Array.isArray(d.labs)) d.labs = []; return d.labs; };
  const pbR = () => { const m = modR(); return m.pbac && typeof m.pbac === 'object' ? m.pbac : {}; };
  const pbW = () => { const d = S.data(ID); if (!d.pbac || typeof d.pbac !== 'object') d.pbac = {}; return d.pbac; };
  const hystR = () => { const m = modR(); return m.hyst && typeof m.hyst === 'object' ? m.hyst : {}; };
  const hystW = () => { const d = S.data(ID); if (!d.hyst || typeof d.hyst !== 'object') d.hyst = {}; return d.hyst; };

  /* ---------- pain diary ---------- */
  const ZONES = ['br', 'bc', 'bl', 'bladder', 'legs', 'lb', 'bowel', 'deep'];
  const TYPES = ['period', 'bowel', 'pee', 'sex', 'other'];
  const painEntry = (e) => ({ p: S.clamp(parseInt(e && e.p, 10) || 0, 0, 10), z: Array.isArray(e && e.z) ? e.z.filter((k) => ZONES.indexOf(k) >= 0) : [], ty: Array.isArray(e && e.ty) ? e.ty.filter((k) => TYPES.indexOf(k) >= 0) : [] });
  function painStats() {
    const st = startsU(); const pain = painR(); const td = S.toISO(S.today());
    const dates = Object.keys(pain).filter(okDate).sort();
    const last3 = st.slice(-3); const pts = []; let beyond = 0;
    dates.forEach((d) => {
      const c = cdOf(d, st); if (!c) return; const ci = last3.indexOf(c.start); if (ci < 0) return;
      const e = painEntry(pain[d]);
      if (c.day > 60) { beyond++; return; }
      pts.push({ d: d, cd: c.day, p: e.p, age: last3.length - 1 - ci });
    });
    const pd = (a, b) => dates.filter((d) => d >= a && (!b || d < b) && painEntry(pain[d]).p > 0).length;
    const lastFull = st.length >= 2 ? pd(st[st.length - 2], st[st.length - 1]) : null;
    const cur = st.length ? pd(st[st.length - 1], null) : null;
    const last30 = pd(S.toISO(S.addDays(S.today(), -29)), S.toISO(S.addDays(S.today(), 1)));
    const ps = dates.map((d) => painEntry(pain[d]).p);   /* every entry, the same ones the list below shows */
    const worst = ps.length ? Math.max.apply(null, ps) : null;
    const severe = ps.filter((x) => x >= 7).length;
    return { st: st, last3: last3, pts: pts, beyond: beyond, lastFull: lastFull, cur: cur, last30: last30, worst: worst, severe: severe, total: dates.length, dates: dates, td: td };
  }
  function painChart(ps) {
    const W = 300, L = 24, R = 8, T = 8, B = 118;
    const maxCd = ps.pts.reduce((m, x) => Math.max(m, x.cd), 0); const maxX = S.clamp(Math.max(35, Math.ceil(maxCd / 7) * 7), 35, 63);
    const x = (cd) => L + ((cd - 1) / (maxX - 1)) * (W - L - R); const y = (p) => B - (p / 10) * (B - T);
    let s = '<svg class="spark cond-chart" viewBox="0 0 300 140" role="img" aria-label="' + esc(t('cond_chart_h')) + '">';
    [0, 5, 10].forEach((v) => { s += '<line class="gd" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 6) + '" y="' + (y(v) + 3) + '" text-anchor="end">' + v + '</text>'; });
    [1, 7, 14, 21, 28, 35, 42, 49, 56, 63].filter((v) => v <= maxX).forEach((v) => { s += '<text x="' + x(v).toFixed(1) + '" y="' + (B + 14) + '" text-anchor="middle">' + v + '</text>'; });
    ps.pts.slice().sort((a, b) => b.age - a.age).forEach((q) => {
      s += '<circle class="cond-dot a' + q.age + '" cx="' + x(q.cd).toFixed(1) + '" cy="' + y(q.p).toFixed(1) + '" r="' + (q.age === 0 ? 4.5 : 4) + '"><title>' + esc(fmtS(q.d) + ' · ' + tf('cond_cd', { n: q.cd }) + ' · ' + q.p + '/10') + '</title></circle>';
    });
    return s + '</svg>';
  }

  /* Simple front and back outline. Her right is on the left of the front view, as when she faces you. */
  const FIG = '<circle class="cond-fig" cx="60" cy="18" r="13"/><rect class="cond-fig" x="53" y="30" width="14" height="9"/><rect class="cond-fig" x="17" y="42" width="13" height="62" rx="6.5"/><rect class="cond-fig" x="90" y="42" width="13" height="62" rx="6.5"/><rect class="cond-fig" x="31" y="37" width="58" height="84" rx="16"/><rect class="cond-fig" x="35" y="114" width="23" height="80" rx="10"/><rect class="cond-fig" x="62" y="114" width="23" height="80" rx="10"/>';
  const zoneAttr = (k, sel) => ' class="cond-zone' + (sel.indexOf(k) >= 0 ? ' on' : '') + '" data-zone="' + k + '" role="button" tabindex="0" aria-pressed="' + (sel.indexOf(k) >= 0) + '" aria-label="' + esc(t('cond_z_' + k)) + '"';
  function bodyMap(sel) {
    const legs = (k) => '<g' + zoneAttr(k, sel) + '><rect x="38" y="128" width="17" height="44" rx="7"/><rect x="65" y="128" width="17" height="44" rx="7"/></g>';
    const front = '<svg viewBox="0 0 120 200" aria-hidden="false">' + FIG +
      '<rect' + zoneAttr('br', sel) + ' x="35" y="76" width="16" height="24" rx="6"/>' +
      '<rect' + zoneAttr('bc', sel) + ' x="53" y="76" width="14" height="24" rx="6"/>' +
      '<rect' + zoneAttr('bl', sel) + ' x="69" y="76" width="16" height="24" rx="6"/>' +
      '<ellipse' + zoneAttr('bladder', sel) + ' cx="60" cy="109" rx="10" ry="6.5"/>' + legs('legs') + '</svg>';
    const back = '<svg viewBox="0 0 120 200">' + FIG +
      '<rect' + zoneAttr('lb', sel) + ' x="35" y="74" width="50" height="22" rx="7"/>' +
      '<circle' + zoneAttr('bowel', sel) + ' cx="60" cy="110" r="7.5"/>' + legs('legs') + '</svg>';
    return '<div class="cond-map"><figure><figcaption>' + esc(t('cond_front')) + '</figcaption>' + front + '<div class="row spread cond-lr"><span>' + esc(t('cond_your_r')) + '</span><span>' + esc(t('cond_your_l')) + '</span></div></figure>' +
      '<figure><figcaption>' + esc(t('cond_back')) + '</figcaption>' + back + '<div class="row spread cond-lr"><span>' + esc(t('cond_your_l')) + '</span><span>' + esc(t('cond_your_r')) + '</span></div></figure></div>';
  }
  const draftFor = (d) => { const e = painR()[d]; const x = e ? painEntry(e) : null; return { date: d, p: x ? x.p : null, z: x ? x.z.slice() : [], ty: x ? x.ty.slice() : [] }; };

  function drawEndoForm(v) {
    const slot = v.querySelector('#cond-endo-slot'); if (!slot) return;
    const td = S.toISO(S.today());
    if (!mem.endo || mem.endo.date > td) mem.endo = draftFor(td);
    const dr = mem.endo; const exists = !!painR()[dr.date]; const c = cdOf(dr.date, startsU());
    const scale = []; for (let n = 0; n <= 10; n++) scale.push('<button type="button" class="btn sm' + (dr.p === n ? ' on' : '') + '" data-pain="' + n + '" aria-pressed="' + (dr.p === n) + '">' + n + '</button>');
    slot.innerHTML = '<div class="card" id="cond-endo-form"><h2>' + esc(t('cond_pain_h')) + '</h2>' +
      '<div class="row spread"><label for="cond-pd">' + esc(t('on_date')) + '</label>' + (c && !cycOff() ? '<span class="pill muted">' + esc(tf('cond_cd', { n: c.day })) + '</span>' : '') + '</div>' +
      '<input type="date" id="cond-pd" value="' + esc(dr.date) + '" max="' + td + '">' +
      '<label>' + esc(t('cond_pain_q')) + '</label><div class="cond-scale" role="group" aria-label="' + esc(t('cond_pain_q')) + '">' + scale.join('') + '</div>' +
      '<div class="row spread small"><span>' + esc(t('cond_p0')) + '</span><span style="text-align:right">' + esc(t('cond_p10')) + '</span></div>' +
      '<label>' + esc(t('cond_where')) + '</label>' + bodyMap(dr.z) +
      '<div class="chips">' + ZONES.map((k) => '<button type="button" class="chip' + (dr.z.indexOf(k) >= 0 ? ' on' : '') + '" data-zchip="' + k + '" aria-pressed="' + (dr.z.indexOf(k) >= 0) + '">' + esc(t('cond_z_' + k)) + '</button>').join('') + '</div>' +
      '<label>' + esc(t('cond_type')) + '</label><div class="chips">' + TYPES.map((k) => '<button type="button" class="chip' + (dr.ty.indexOf(k) >= 0 ? ' on' : '') + '" data-ty="' + k + '" aria-pressed="' + (dr.ty.indexOf(k) >= 0) + '">' + esc(t('cond_t_' + k)) + '</button>').join('') + '</div>' +
      (exists ? '<p class="small">' + esc(t('cond_has_entry')) + '</p>' : '') +
      '<p class="small cond-err" id="cond-perr" hidden>' + esc(t('cond_pick_pain')) + '</p>' +
      '<button type="button" class="btn primary block" id="cond-psave">' + esc(t('save')) + '</button>' +
      (exists ? '<button type="button" class="btn ghost sm" id="cond-pdel">' + esc(t('cond_del_day')) + '</button>' : '') +
      '<p class="small">' + esc(t('cond_pain_note')) + '</p></div>';
    const setOn = (sel, on) => slot.querySelectorAll(sel).forEach((el) => { el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); });
    slot.querySelectorAll('[data-pain]').forEach((b) => b.addEventListener('click', () => {
      dr.p = parseInt(b.dataset.pain, 10); slot.querySelectorAll('[data-pain]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      const er = slot.querySelector('#cond-perr'); if (er) er.hidden = true;
    }));
    const togZone = (k) => { const i = dr.z.indexOf(k); if (i >= 0) dr.z.splice(i, 1); else dr.z.push(k); const on = i < 0; setOn('[data-zone="' + k + '"]', on); setOn('[data-zchip="' + k + '"]', on); };
    slot.querySelectorAll('[data-zone]').forEach((el) => {
      el.addEventListener('click', () => togZone(el.dataset.zone));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togZone(el.dataset.zone); } });
    });
    slot.querySelectorAll('[data-zchip]').forEach((b) => b.addEventListener('click', () => togZone(b.dataset.zchip)));
    slot.querySelectorAll('[data-ty]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ty; const i = dr.ty.indexOf(k); if (i >= 0) dr.ty.splice(i, 1); else dr.ty.push(k); setOn('[data-ty="' + k + '"]', i < 0); }));
    slot.querySelector('#cond-pd').addEventListener('change', (e) => { const d = e.target.value; if (okDate(d) && d <= td) { mem.endo = draftFor(d); drawEndoForm(v); } });
    slot.querySelector('#cond-psave').addEventListener('click', () => {
      if (dr.p == null) { const er = slot.querySelector('#cond-perr'); if (er) er.hidden = false; return; }
      painW()[dr.date] = { p: dr.p, z: dr.z.slice(), ty: dr.ty.slice(), at: td }; S.save();
      S.toast(tf('cond_saved_d', { d: fmtS(dr.date) })); mem.endo = draftFor(dr.date); S.render();
    });
    const del = slot.querySelector('#cond-pdel'); let armed = false;
    if (del) del.addEventListener('click', () => {
      if (!armed) { armed = true; del.textContent = t('cond_del_sure'); return; }
      delete painW()[dr.date]; S.save(); S.toast(t('cond_deleted')); mem.endo = draftFor(dr.date); S.render();
    });
  }
  const zoneText = (e) => e.z.map((k) => t('cond_z_' + k)).join(', ');
  function renderEndo(v) {
    const can = S.canSave(); const sit = S.state.situation || {};
    let off = '';
    if (can && sit.pregnant) off = '<div class="card soft"><p class="small">' + h({ en: 'You are marked as pregnant, so there is no cycle day to line up. You can still log pain. Belly pain in pregnancy needs its own check: see the pregnancy symptoms guide.', hi: 'आपने गर्भवती चुना है, इसलिए चक्र का दिन नहीं गिना जाता। दर्द फिर भी दर्ज कर सकती हैं। गर्भावस्था में पेट दर्द की अलग जाँच ज़रूरी है: गर्भावस्था के लक्षण वाली गाइड देखें।' }) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="preg-symptoms">' + h({ en: 'Pregnancy symptoms', hi: 'गर्भावस्था के लक्षण' }) + '</button></div>';
    else if (can && (sit.hysterectomy || sit.stopped)) off = '<div class="card soft"><p class="small">' + h({ en: 'Without periods there is no cycle day to line up. You can still log pain: your counts show by date, and your doctor sees every entry.', hi: 'पीरियड न होने से चक्र का दिन नहीं गिना जाता। दर्द फिर भी दर्ज करें: गिनती तारीख़ के हिसाब से दिखेगी, और डॉक्टर हर entry देख सकती हैं।' }) + '</p></div>';

    let tracker = '';
    if (can) {
      const ps = painStats();
      let chart = '';
      if (!cycOff()) {
        if (!ps.st.length) chart = '<div class="card"><h2>' + esc(t('cond_chart_h')) + '</h2><p class="small">' + esc(t('cond_no_starts')) + '</p><button type="button" class="btn sm" style="align-self:flex-start" data-go="diary">' + esc(t('diary')) + '</button></div>';
        else chart = '<div class="card"><h2>' + esc(t('cond_chart_h')) + '</h2><p class="small">' + esc(t('cond_chart_p')) + '</p>' + painChart(ps) +
          (ps.pts.length ? '<div class="row wrap small cond-legend">' + [0, 1, 2].filter((a) => ps.pts.some((q) => q.age === a)).map((a) => '<span class="row" style="gap:4px"><i class="cond-sw a' + a + '"></i>' + esc(t('cond_leg' + a)) + '</span>').join('') + '</div>' : '') +
          '<p class="small">' + esc(t('cond_axis')) + '</p>' +
          (!ps.pts.length ? '<p class="small" style="color:var(--fg)">' + esc(t('cond_none_cycles')) + '</p>' : '') +
          (ps.beyond ? '<p class="small">' + esc(tf('cond_beyond', { n: ps.beyond })) + '</p>' : '') + '</div>';
      }
      const kv = [];
      if (!cycOff() && ps.lastFull != null) kv.push([t('cond_pd_last'), ps.lastFull]);
      if (!cycOff() && ps.cur != null) kv.push([t('cond_pd_cur'), ps.cur]);
      kv.push([t('cond_pd_30'), ps.last30]);
      if (ps.worst != null) kv.push([t('cond_worst'), ps.worst + '/10']);
      kv.push([t('cond_severe'), ps.severe]);
      const counts = ps.total ? '<div class="card"><h2>' + esc(t('cond_counts_h')) + '</h2><dl class="kv">' + kv.map((x) => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(String(x[1])) + '</dd>').join('') + '</dl><p class="footnote">' + esc(t('cond_noscore')) + '</p></div>' : '';
      const pain = painR(); const recentDates = ps.dates.slice(-8).reverse();
      const recent = recentDates.length ? '<div class="card"><h2>' + esc(t('cond_recent_h')) + '</h2><div class="list">' + recentDates.map((d) => {
        const e = painEntry(pain[d]); const c = cdOf(d, ps.st);
        const subTxt = [t('cond_pain_lbl') + ' ' + e.p + '/10', zoneText(e), e.ty.map((k) => t('cond_t_' + k)).join(', ')].filter(Boolean).join(' · ');
        return '<button type="button" class="item quiet" data-pedit="' + esc(d) + '"><span class="cond-pnum cond-tnum">' + e.p + '</span><span class="body"><strong>' + esc(fmtS(d)) + (c && !cycOff() ? ' · ' + esc(tf('cond_cd', { n: c.day })) : '') + '</strong><span>' + esc(subTxt) + '</span></span><span class="small" style="color:var(--accent);flex-shrink:0">' + esc(t('edit')) + '</span></button>';
      }).join('') + '</div></div>' : '';
      tracker = '<div id="cond-endo-slot"></div>' + chart + counts + recent;
    } else tracker = S.needDiary();

    const explain = '<div class="card"><h2>' + h({ en: 'What are endometriosis and adenomyosis?', hi: 'एंडोमेट्रियोसिस और एडेनोमायोसिस क्या हैं?' }) + '</h2>' +
      P({ en: 'In endometriosis, tissue like the lining of the womb grows outside the womb: on the ovaries, the tubes, the lining of the pelvis, and sometimes the bowel or bladder. It swells and bleeds with each cycle, which causes pain and scarring. About 1 in 10 women of reproductive age has it.', hi: 'एंडोमेट्रियोसिस में बच्चेदानी (गर्भाशय) की अंदरूनी परत जैसा ऊतक बच्चेदानी के बाहर उग आता है: अंडाशय (ovaries) पर, नलियों (tubes) पर, पेडू की अंदरूनी परत पर, और कभी आँत या पेशाब की थैली पर। हर चक्र में इसमें सूजन आती है और ख़ून निकलता है, जिससे दर्द होता है और अंदर चिपकाव बनते हैं। प्रजनन उम्र की लगभग 10 में से 1 महिला को यह होता है।' }) +
      P({ en: 'In adenomyosis, the same kind of tissue grows into the muscle wall of the womb. The womb can become bulky, and periods become heavy and painful. A woman can have both.', hi: 'एडेनोमायोसिस में यही ऊतक बच्चेदानी की मांसपेशी वाली दीवार के अंदर उग जाता है। बच्चेदानी भारी (bulky) हो सकती है, और पीरियड भारी और दर्द भरे हो जाते हैं। एक महिला को दोनों हो सकते हैं।' }) +
      sub({ en: 'Signs to take seriously', hi: 'इन संकेतों को गंभीरता से लें' }) +
      ul([{ en: 'Period pain that stops you working, studying or running the house, even with painkillers', hi: 'पीरियड का ऐसा दर्द जो दर्द की गोली के बाद भी काम, पढ़ाई या घर सँभालना रोक दे' },
        { en: 'Deep pain during or after sex', hi: 'संबंध के समय या बाद में अंदर गहराई में दर्द' },
        { en: 'Pain when passing stool or urine, especially during a period', hi: 'पखाना या पेशाब करते समय दर्द, ख़ासकर पीरियड में' },
        { en: 'Pelvic pain on many days of the month, not only during the period', hi: 'महीने के कई दिनों में पेडू में दर्द, सिर्फ़ पीरियड में नहीं' },
        { en: 'Heavy periods and tiredness', hi: 'भारी पीरियड और थकान' },
        { en: 'Trouble getting pregnant', hi: 'गर्भ ठहरने में मुश्किल' }]) +
      P({ en: 'Many women live with this pain for years before anyone gives it a name. WHO says the average time to diagnosis is 4 to 12 years. Some period pain is common. Pain that stops your day is not something you have to put up with.', hi: 'बहुत सी महिलाएँ सालों तक यह दर्द सहती रहती हैं, इससे पहले कि कोई इसका नाम बताए। WHO के अनुसार diagnosis में औसतन 4 से 12 साल लग जाते हैं। पीरियड में थोड़ा दर्द आम है। जो दर्द आपका दिन रोक दे, उसे चुपचाप सहना ज़रूरी नहीं।' }) + '</div>';

    const tell = '<div class="card"><h2>' + h({ en: 'Getting checked: what to tell the gynaecologist', hi: 'जाँच: स्त्री रोग विशेषज्ञ को क्या बताएँ' }) + '</h2>' +
      P({ en: 'She will ask about your pain, examine you, and usually order an ultrasound, often a scan through the vagina. An MRI or a laparoscopy (keyhole surgery with a camera) may be needed to be sure, but treatment can start without surgery first.', hi: 'वह आपके दर्द के बारे में पूछेंगी, जाँच करेंगी, और आम तौर पर अल्ट्रासाउंड करवाएँगी, अक्सर योनि के रास्ते वाला scan। पक्का करने के लिए MRI या laparoscopy (कैमरे वाली छोटी सर्जरी) की ज़रूरत पड़ सकती है, पर इलाज सर्जरी से पहले भी शुरू हो सकता है।' }) +
      '<p class="small" style="color:var(--fg);font-weight:600">' + h({ en: 'Take this diary, and be ready to say:', hi: 'यह डायरी साथ ले जाएँ, और ये बातें बताने को तैयार रहें:' }) + '</p>' +
      steps([{ en: 'When the pain started, and on how many days a month it comes', hi: 'दर्द कब शुरू हुआ, और महीने में कितने दिन होता है' },
        { en: 'Where it hurts, and whether it comes with your period, sex, passing stool or peeing', hi: 'कहाँ दर्द होता है, और क्या यह पीरियड, संबंध, पखाना या पेशाब के साथ आता है' },
        { en: 'Which painkillers you tried, how often, and whether they helped', hi: 'कौन सी दर्द की गोली ली, कितनी बार, और आराम मिला या नहीं' },
        { en: 'Days you missed work, college or housework because of pain', hi: 'दर्द की वजह से कितने दिन काम, कॉलेज या घर का काम छूटा' },
        { en: 'How heavy your periods are, and whether you feel tired or breathless', hi: 'पीरियड कितने भारी हैं, और क्या थकान या साँस फूलना रहता है' },
        { en: 'Whether you want a pregnancy now, later or not at all', hi: 'क्या आप अभी, बाद में या कभी नहीं गर्भ चाहती हैं' }]) +
      P({ en: 'Where to go: the gynaecology OPD of a district hospital or medical college.', hi: 'कहाँ जाएँ: ज़िला अस्पताल या मेडिकल कॉलेज की gynaecology OPD।' }, 'small') + '</div>';

    const treat = '<div class="card"><h2>' + h({ en: 'Treatment, decided by a gynaecologist', hi: 'इलाज, जो स्त्री रोग विशेषज्ञ तय करती हैं' }) + '</h2>' +
      ul([{ en: 'Pain relief: anti-inflammatory painkillers such as ibuprofen or naproxen. Your doctor tells you which one and how much.', hi: 'दर्द से राहत: सूजन कम करने वाली दर्द की गोलियाँ, जैसे ibuprofen या naproxen। कौन सी और कितनी, यह डॉक्टर बताएँगी।' },
        { en: 'Hormone medicines: the pill, progestogen tablets or a hormonal IUD can calm the tissue and ease pain. These need an MBBS gynaecologist\'s prescription.', hi: 'हॉर्मोन की दवाएँ: pill, progestogen की गोलियाँ या हॉर्मोन वाला IUD इस ऊतक को शांत करके दर्द कम कर सकते हैं। ये MBBS स्त्री रोग विशेषज्ञ ही लिखती हैं।' },
        { en: 'Surgery: laparoscopy can remove the patches and scar tissue. It is not a cure, and pain can come back.', hi: 'सर्जरी: laparoscopy से ये धब्बे और चिपकाव हटाए जा सकते हैं। यह पक्का इलाज नहीं है, दर्द लौट सकता है।' },
        { en: 'Adenomyosis: hormone medicines or a hormonal IUD can help. Removing the womb is considered only when other treatment has not helped and no more children are wanted.', hi: 'एडेनोमायोसिस: हॉर्मोन की दवाएँ या हॉर्मोन वाला IUD मदद कर सकते हैं। बच्चेदानी निकालने के बारे में तभी सोचा जाता है जब बाक़ी इलाज से फ़ायदा न हो और आगे बच्चा न चाहिए।' }]) +
      sub({ en: 'Pregnancy', hi: 'गर्भ' }) +
      P({ en: 'Many women with endometriosis get pregnant without help. Among women who struggle to conceive, 25–50% have endometriosis. If you have been trying for a year (6 months if you are 35 or older), see a gynaecologist; with known endometriosis you can ask for tests sooner. Treatments such as IVF can help.', hi: 'एंडोमेट्रियोसिस वाली बहुत सी महिलाएँ बिना मदद के गर्भवती हो जाती हैं। जिन महिलाओं को गर्भ ठहरने में मुश्किल होती है, उनमें से 25–50% को एंडोमेट्रियोसिस होता है। एक साल से कोशिश कर रही हैं (35 या ज़्यादा उम्र में 6 महीने), तो स्त्री रोग विशेषज्ञ को दिखाएँ; एंडोमेट्रियोसिस पहले से पता हो तो जाँच जल्दी माँग सकती हैं। IVF जैसे इलाज मदद कर सकते हैं।' }) +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="ttc-tests">' + h({ en: 'Tests when trying for a baby', hi: 'बच्चे की कोशिश में जाँचें' }) + '</button></div>';

    const doctor = '<div class="card warn"><h3>' + esc(t('see_doctor')) + '</h3>' +
      flagLead('urgent', t('call_now'), t('s1a')) +
      flagLead('', t('today_if'), t('s2b')) +
      P({ en: 'This month: period pain that stops your day, or pain during sex. Take this diary with you.', hi: 'इसी महीने: पीरियड का दर्द जो दिन रोक दे, या संबंध में दर्द। यह डायरी साथ ले जाएँ।' }, 'small') + '</div>';

    v.innerHTML = S.backRow(t('cond_endo'), 'cond', false) +
      intro({ en: 'Log pain on any day it comes, and pain-free days too. The diary lines it up by cycle day, so you and your gynaecologist can see when it happens. Not a diagnosis.', hi: 'जिस दिन दर्द हो उस दिन दर्ज करें, और बिना दर्द वाले दिन भी। डायरी इसे चक्र के दिन के हिसाब से दिखाती है, ताकि आप और आपकी स्त्री रोग विशेषज्ञ देख सकें कि दर्द कब होता है। यह diagnosis नहीं है।' }) +
      off + tracker + explain + tell + treat + doctor +
      askCard({ en: 'Pelvic pain and my pain diary (endometriosis)', hi: 'पेडू का दर्द और मेरी दर्द डायरी (एंडोमेट्रियोसिस)' }, { en: 'A Qura doctor (BAMS) can go through this diary with you, help with sleep, food and movement, order tests, and refer you to a gynaecologist. Hormone medicines and surgery need an MBBS gynaecologist.', hi: 'Qura की डॉक्टर (BAMS) यह डायरी आपके साथ देख सकती हैं, नींद, खाने और चलने-फिरने में मदद करती हैं, जाँचें लिखती हैं, और स्त्री रोग विशेषज्ञ के पास refer करती हैं। हॉर्मोन की दवाएँ और सर्जरी MBBS स्त्री रोग विशेषज्ञ ही करती हैं।' }) +
      sources(['whoEndo', 'acogInf']);
    S.wire(v);
    if (!can) return;
    drawEndoForm(v);
    v.querySelectorAll('[data-pedit]').forEach((b) => b.addEventListener('click', () => {
      mem.endo = draftFor(b.dataset.pedit); drawEndoForm(v);
      const f = v.querySelector('#cond-endo-form'); if (f && f.scrollIntoView) f.scrollIntoView({ block: 'start' });
    }));
  }

  /* ---------- fibroids, cysts, polyps ---------- */
  const TORSION = { en: 'Sudden, severe pain on one side of the lower belly with vomiting: go to a hospital emergency now, or call 112 or 108. A cyst can twist the ovary and cut off its blood; quick surgery can save the ovary.', hi: 'पेट के निचले हिस्से में एक तरफ़ अचानक तेज़ दर्द और साथ में उल्टी: अभी अस्पताल की emergency में जाएँ, या 112 या 108 पर कॉल करें। सिस्ट अंडाशय को मरोड़ सकती है और उसका ख़ून रोक सकती है; जल्दी ऑपरेशन से अंडाशय बच सकता है।' };
  function renderFibroids(v) {
    const block = (title, what, signs, tests, treat, extra) => '<div class="card"><h2>' + h(title) + '</h2>' + P(what) +
      sub({ en: 'Signs', hi: 'संकेत' }) + ul(signs) + sub({ en: 'Tests', hi: 'जाँच' }) + P(tests) + sub({ en: 'Treatment', hi: 'इलाज' }) + (Array.isArray(treat) ? ul(treat) : P(treat)) + (extra || '') + '</div>';
    const fib = block({ en: 'Fibroids', hi: 'फाइब्रॉइड (बच्चेदानी की गाँठ)' },
      { en: 'Fibroids are lumps of muscle that grow in or on the wall of the womb. They are common and are not cancer. Many women have them and never know.', hi: 'फाइब्रॉइड मांसपेशी की गाँठें हैं जो बच्चेदानी की दीवार में या उस पर बनती हैं। ये आम हैं और कैंसर नहीं हैं। बहुत सी महिलाओं को होती हैं और उन्हें पता भी नहीं चलता।' },
      [{ en: 'Heavy or long periods, period pain', hi: 'भारी या लंबे पीरियड, पीरियड में दर्द' }, { en: 'A swollen belly, lower back pain', hi: 'पेट फूला हुआ, कमर में दर्द' }, { en: 'Needing to pee often, or constipation', hi: 'बार-बार पेशाब आना, या कब्ज़' }, { en: 'Pain during sex, trouble getting pregnant', hi: 'संबंध में दर्द, गर्भ ठहरने में मुश्किल' }],
      { en: 'An ultrasound shows how many there are, where, and how big. A haemoglobin (Hb) test checks whether heavy bleeding has caused anaemia.', hi: 'अल्ट्रासाउंड से पता चलता है कि कितनी गाँठें हैं, कहाँ हैं और कितनी बड़ी। हीमोग्लोबिन (Hb) जाँच से पता चलता है कि भारी ब्लीडिंग से ख़ून की कमी तो नहीं हुई।' },
      [{ en: 'Small fibroids that cause no trouble usually need no treatment, only a check now and then. Fibroids often shrink after menopause.', hi: 'छोटी गाँठें जो परेशानी न दें, उनका आम तौर पर इलाज नहीं चाहिए, बस बीच-बीच में जाँच। मेनोपॉज़ के बाद गाँठें अक्सर छोटी हो जाती हैं।' },
        { en: 'Heavy bleeding: tablets that reduce bleeding (such as tranexamic acid), painkillers, or hormone treatment.', hi: 'भारी ब्लीडिंग: ब्लीडिंग कम करने वाली गोलियाँ (जैसे tranexamic acid), दर्द की गोली, या हॉर्मोन वाला इलाज।' },
        { en: 'Procedures: removing only the fibroids and keeping the womb (myomectomy), blocking their blood supply (uterine artery embolisation), or removing the womb (hysterectomy).', hi: 'ऑपरेशन: बच्चेदानी रखते हुए सिर्फ़ गाँठें निकालना (myomectomy), गाँठों की ख़ून की नली बंद करना (embolisation), या बच्चेदानी निकालना (hysterectomy)।' },
        { en: 'The choice depends on size, place, your age and whether you want children. Hormone medicines and surgery are decided by an MBBS gynaecologist.', hi: 'क्या करना है, यह गाँठ के आकार, जगह, आपकी उम्र और बच्चे की इच्छा पर निर्भर है। हॉर्मोन की दवा और सर्जरी MBBS स्त्री रोग विशेषज्ञ तय करती हैं।' }],
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="cond-hyst">' + h({ en: 'Told you need a hysterectomy?', hi: 'बच्चेदानी निकालने को कहा गया है?' }) + '</button>');
    const cyst = block({ en: 'Ovarian cysts', hi: 'अंडाशय की सिस्ट (पानी की थैली)' },
      { en: 'A cyst is a fluid-filled sac on an ovary. Most come from the normal monthly cycle and go away on their own within a few months. Doctors often repeat the ultrasound after some weeks to check.', hi: 'सिस्ट अंडाशय पर पानी भरी थैली होती है। ज़्यादातर सिस्ट हर महीने के सामान्य चक्र से बनती हैं और कुछ महीनों में अपने आप चली जाती हैं। डॉक्टर अक्सर कुछ हफ़्तों बाद दोबारा अल्ट्रासाउंड करवाकर देखते हैं।' },
      [{ en: 'Usually none', hi: 'आम तौर पर कोई नहीं' }, { en: 'A dull ache or sharp pain low in the belly', hi: 'पेट के निचले हिस्से में हल्का या तेज़ दर्द' }, { en: 'Pain during sex, bloating, feeling full quickly', hi: 'संबंध में दर्द, पेट फूलना, जल्दी पेट भर जाना' }, { en: 'Needing to pee often, changes in periods', hi: 'बार-बार पेशाब, पीरियड में बदलाव' }],
      { en: 'An ultrasound, often through the vagina. Sometimes a blood test (CA-125); it can also be raised by endometriosis, infection, fibroids or a period, so a raised value is not a cancer result on its own. After menopause, a cyst is followed more closely, with scans and blood tests over about a year.', hi: 'अल्ट्रासाउंड, अक्सर योनि के रास्ते। कभी blood test (CA-125); यह एंडोमेट्रियोसिस, संक्रमण, फाइब्रॉइड या पीरियड से भी बढ़ सकता है, इसलिए सिर्फ़ इसके बढ़ने का मतलब कैंसर नहीं। मेनोपॉज़ के बाद सिस्ट पर ज़्यादा नज़र रखी जाती है, लगभग एक साल तक scan और blood test से।' },
      { en: 'Watching with a repeat scan. Surgery if a cyst is large, causes symptoms, or looks unusual on the scan. A "chocolate cyst" (endometrioma) is a cyst from endometriosis.', hi: 'दोबारा scan करके नज़र रखना। सिस्ट बड़ी हो, परेशानी दे, या scan में अलग दिखे तो ऑपरेशन। "चॉकलेट सिस्ट" (endometrioma) एंडोमेट्रियोसिस से बनी सिस्ट होती है।' },
      '<div class="card soft"><h3>' + h({ en: '"Polycystic ovaries" are not cysts to remove', hi: '"Polycystic ovaries" निकालने वाली सिस्ट नहीं हैं' }) + '</h3>' + P({ en: 'On a scan report, polycystic ovaries mean many small egg sacs (follicles) that paused while growing. They are one of the signs doctors look at for PMOS (PCOS). They do not need draining or an operation.', hi: 'Scan report में polycystic ovaries का मतलब है कई छोटी अंडे की थैलियाँ (follicles) जो बढ़ते-बढ़ते रुक गईं। डॉक्टर PMOS (PCOS) के लिए जो संकेत देखते हैं, यह उनमें से एक है। इन्हें निकालने या ऑपरेशन की ज़रूरत नहीं होती।' }, 'small') + '</div>');
    const polyp = block({ en: 'Polyps', hi: 'पॉलिप' },
      { en: 'Polyps are small, soft growths from the lining of the womb or from the neck of the womb (cervix). Most are not cancer.', hi: 'पॉलिप बच्चेदानी की अंदरूनी परत या बच्चेदानी के मुँह (cervix) से निकली छोटी, मुलायम गाँठें हैं। ज़्यादातर कैंसर नहीं होते।' },
      [{ en: 'Bleeding between periods or after sex', hi: 'दो पीरियड के बीच या संबंध के बाद ब्लीडिंग' }, { en: 'Any bleeding after menopause', hi: 'मेनोपॉज़ के बाद कोई भी ब्लीडिंग' }, { en: 'Heavy periods; often no signs at all', hi: 'भारी पीरियड; अक्सर कोई संकेत नहीं' }],
      { en: 'An ultrasound, and a look inside the womb with a thin camera (hysteroscopy).', hi: 'अल्ट्रासाउंड, और पतले कैमरे से बच्चेदानी के अंदर देखना (hysteroscopy)।' },
      { en: 'The polyp is removed, usually through hysteroscopy with no cut on the belly, and sent to the lab. Bleeding after menopause always needs checking, even though most causes are not serious.', hi: 'पॉलिप निकाल दिया जाता है, आम तौर पर hysteroscopy से, पेट पर बिना चीरे के, और lab में जाँच के लिए भेजा जाता है। मेनोपॉज़ के बाद ब्लीडिंग की जाँच हमेशा ज़रूरी है, भले ज़्यादातर कारण गंभीर न हों।' });
    const where = '<div class="card"><h3>' + h({ en: 'Where to go, and cost', hi: 'कहाँ जाएँ, और ख़र्च' }) + '</h3>' +
      P({ en: 'A gynaecologist at a district hospital or medical college can order the scan and plan treatment. Under PM-JAY (Ayushman Bharat), eligible families get cashless hospital treatment up to ₹5 lakh a year at empanelled hospitals. To check if you are covered, call 14555.', hi: 'ज़िला अस्पताल या मेडिकल कॉलेज की स्त्री रोग विशेषज्ञ scan लिख सकती हैं और इलाज तय कर सकती हैं। PM-JAY (आयुष्मान भारत) में पात्र परिवारों को सूचीबद्ध (empanelled) अस्पतालों में साल में ₹5 लाख तक का cashless इलाज मिलता है। आप इसमें हैं या नहीं, यह जानने के लिए 14555 पर कॉल करें।' }) + '</div>';
    v.innerHTML = S.backRow(t('cond_fibroids'), 'cond', false) +
      intro({ en: 'Three common growths in or near the womb. Most are not cancer. What each one is, how it is found, and what can be done. Not a diagnosis.', hi: 'बच्चेदानी में या उसके पास होने वाली तीन आम गाँठें। ज़्यादातर कैंसर नहीं होतीं। हर एक क्या है, कैसे पता चलती है, और क्या किया जा सकता है। यह diagnosis नहीं है।' }) +
      flag('urgent', TORSION) + flagLead('urgent', t('call_now'), t('s1a')) +
      fib + cyst + polyp + where +
      askCard({ en: 'Fibroids, cysts or polyps', hi: 'फाइब्रॉइड, सिस्ट या पॉलिप' }, { en: 'Bring your scan report to a free call. A Qura doctor explains it in plain words, helps with heavy-period care and diet, and refers you to a gynaecologist.', hi: 'अपनी scan report लेकर मुफ़्त कॉल पर आएँ। Qura की डॉक्टर उसे आसान शब्दों में समझाएँगी, भारी पीरियड और खाने में मदद करेंगी, और स्त्री रोग विशेषज्ञ के पास refer करेंगी।' }) +
      sources(['nhsFib', 'acogFib', 'nhsCyst', 'torsion', 'pmjay']);
    S.wire(v);
  }

  /* ---------- PID and genital TB ---------- */
  function renderPid(v) {
    const pid = '<div class="card"><h2>' + h({ en: 'Pelvic inflammatory disease (PID)', hi: 'पेडू का संक्रमण (PID)' }) + '</h2>' +
      P({ en: 'PID is an infection of the womb, tubes and ovaries. It usually starts as an infection that spreads up from the vagina and cervix, often one passed on during sex, such as chlamydia or gonorrhoea. It can also follow a birth, a miscarriage, an abortion or a procedure. It is not a sign that you did anything wrong.', hi: 'PID बच्चेदानी, नलियों और अंडाशय का संक्रमण है। यह आम तौर पर योनि और बच्चेदानी के मुँह से ऊपर फैले संक्रमण से शुरू होता है, अक्सर ऐसा संक्रमण जो संबंध से फैलता है, जैसे chlamydia या gonorrhoea। यह डिलीवरी, गर्भपात, गर्भ गिरने या किसी प्रक्रिया के बाद भी हो सकता है। इसका मतलब यह नहीं कि आपने कुछ ग़लत किया।' }) +
      sub({ en: 'Signs', hi: 'संकेत' }) +
      ul([{ en: 'Pain low in the belly, often on both sides', hi: 'पेट के निचले हिस्से में दर्द, अक्सर दोनों तरफ़' }, { en: 'Fever', hi: 'बुख़ार' }, { en: 'Unusual or smelly discharge', hi: 'असामान्य या बदबूदार सफ़ेद पानी' }, { en: 'Pain during sex; bleeding between periods or after sex', hi: 'संबंध में दर्द; दो पीरियड के बीच या संबंध के बाद ब्लीडिंग' }, { en: 'Burning when peeing', hi: 'पेशाब में जलन' }]) +
      P({ en: 'Mild PID can show very few signs, and it can still harm the tubes.', hi: 'हल्के PID में बहुत कम संकेत होते हैं, फिर भी नलियों को नुक़सान हो सकता है।' }, 'small') +
      sub({ en: 'Why early treatment matters', hi: 'जल्दी इलाज क्यों ज़रूरी है' }) +
      P({ en: 'Each infection can scar the tubes. Scarred tubes raise the chance of a pregnancy growing outside the womb (ectopic), make it harder to get pregnant, and can leave long-lasting pelvic pain. Starting antibiotics early lowers this risk.', hi: 'हर संक्रमण नलियों पर निशान छोड़ सकता है। ख़राब नलियों से बच्चेदानी के बाहर गर्भ ठहरने (ectopic) का ख़तरा बढ़ता है, गर्भ ठहरना मुश्किल होता है, और पेडू में लंबा दर्द रह सकता है। जल्दी antibiotic शुरू करने से यह ख़तरा कम होता है।' }) +
      sub({ en: 'Treatment', hi: 'इलाज' }) +
      ul([{ en: 'A full course of antibiotics, usually for about two weeks. Finish it even when you feel better.', hi: 'antibiotic का पूरा कोर्स, आम तौर पर लगभग दो हफ़्ते। ठीक लगने पर भी पूरा करें।' },
        { en: 'You should feel better within 3 days. If not, go back: you may need hospital care.', hi: '3 दिन में आराम लगना चाहिए। न लगे तो दोबारा दिखाएँ: अस्पताल में भर्ती की ज़रूरत हो सकती है।' },
        { en: 'Hospital care is usual if you have a high fever (over 38.5 °C / 101 °F), are vomiting, are pregnant, or the pain is severe.', hi: 'तेज़ बुख़ार (38.5 °C / 101 °F से ज़्यादा), उल्टी, गर्भ, या बहुत तेज़ दर्द हो तो अस्पताल में भर्ती आम है।' }]) +
      sub({ en: 'Your partner needs treatment too', hi: 'साथी का इलाज भी ज़रूरी है' }) +
      P({ en: 'Anyone you had sex with in the 60 days before your symptoms started should be checked and treated, even if he has no symptoms. Otherwise the infection comes back to you. No sex until both of you have finished treatment and your symptoms are gone.', hi: 'लक्षण शुरू होने से पहले के 60 दिनों में जिससे भी संबंध रहा, उसकी जाँच और इलाज होना चाहिए, भले उसे कोई लक्षण न हो। नहीं तो संक्रमण फिर से आपको हो जाएगा। जब तक दोनों का इलाज पूरा न हो और आपके लक्षण न चले जाएँ, संबंध न बनाएँ।' }) +
      sub({ en: 'Free and private', hi: 'मुफ़्त और गोपनीय' }) +
      P({ en: 'Suraksha Clinics (STI/RTI clinics) at government district hospitals and medical colleges give counselling and treatment free, and can treat your partner too. The NACO helpline 1097 is free.', hi: 'सरकारी ज़िला अस्पतालों और मेडिकल कॉलेजों के सुरक्षा क्लिनिक (STI/RTI क्लिनिक) में सलाह और इलाज मुफ़्त है, और वे आपके साथी का इलाज भी कर सकते हैं। NACO हेल्पलाइन 1097 मुफ़्त है।' }) +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="intimate-sti">' + h({ en: 'Infections passed on during sex', hi: 'संबंध से फैलने वाले संक्रमण' }) + '</button></div>';

    const tb = '<div class="card"><h2>' + h({ en: 'Genital TB', hi: 'जननांग की टीबी (Genital TB)' }) + '</h2>' +
      P({ en: 'TB can reach the lining of the womb and the tubes, usually through the blood from TB elsewhere in the body, sometimes from long ago. In India it is a known cause of blocked tubes and difficulty getting pregnant.', hi: 'टीबी बच्चेदानी की अंदरूनी परत और नलियों तक पहुँच सकती है, आम तौर पर शरीर में कहीं और की टीबी से ख़ून के रास्ते, कभी बहुत पहले की। भारत में यह नलियाँ बंद होने और गर्भ न ठहरने की एक जानी-मानी वजह है।' }) +
      P({ en: 'It is often silent and is found during tests for infertility. When there are signs: periods becoming scanty, irregular or stopping; long-lasting pelvic pain; unusual discharge; low fever, weight loss or night sweats.', hi: 'अक्सर इसके कोई संकेत नहीं होते और यह बच्चा न होने की जाँचों में पता चलती है। संकेत हों तो: पीरियड बहुत कम, अनियमित या बंद होना; पेडू में लंबा दर्द; असामान्य सफ़ेद पानी; हल्का बुख़ार, वज़न घटना या रात में पसीना।' }) +
      sub({ en: 'How it is diagnosed', hi: 'पता कैसे चलता है' }) +
      P({ en: 'On a proper sample: a small piece of the womb lining (endometrial biopsy) or tissue taken during laparoscopy. It is tested by smear, culture, GeneXpert or another molecular test (PCR), and under the microscope. Menstrual blood should not be used for the molecular test.', hi: 'सही sample पर: बच्चेदानी की परत का छोटा टुकड़ा (endometrial biopsy) या laparoscopy में लिया गया ऊतक। इसकी जाँच smear, culture, GeneXpert या दूसरे molecular test (PCR) से, और माइक्रोस्कोप में होती है। Molecular test के लिए पीरियड का ख़ून इस्तेमाल नहीं करना चाहिए।' }) +
      '<div class="card soft"><h3>' + h({ en: 'Before 6 months of TB medicine', hi: '6 महीने की टीबी दवा शुरू करने से पहले' }) + '</h3>' +
      ul([{ en: 'TB antibody blood tests are banned in India because they give wrong results.', hi: 'टीबी के antibody blood test भारत में बंद (banned) हैं, क्योंकि उनके नतीजे ग़लत आते हैं।' },
        { en: 'A Mantoux skin test or an IGRA blood test only shows that you met TB at some time, as many Indians have. It cannot show active genital TB.', hi: 'Mantoux skin test या IGRA blood test सिर्फ़ यह बताते हैं कि कभी टीबी के कीटाणु से सामना हुआ, जैसा बहुत से भारतीयों के साथ होता है। इनसे सक्रिय जननांग टीबी पता नहीं चलती।' },
        { en: 'If a PCR report is the main finding, ask which sample was tested. It counts on a womb-lining or tissue sample, not on menstrual or ordinary blood.', hi: 'अगर मुख्य आधार PCR report है, तो पूछें कि किस sample पर जाँच हुई। यह बच्चेदानी की परत या ऊतक के sample पर मानी जाती है, पीरियड के या आम ख़ून पर नहीं।' },
        { en: 'If TB medicine is advised only on a blood test or a skin test, get a second opinion at a government hospital or medical college first.', hi: 'अगर सिर्फ़ blood test या skin test के आधार पर टीबी की दवा कही जाए, तो पहले सरकारी अस्पताल या मेडिकल कॉलेज में दूसरी राय लें।' }]) + '</div>' +
      sub({ en: 'Treatment is free', hi: 'इलाज मुफ़्त है' }) +
      P({ en: 'If TB is confirmed, treatment is the same as for TB elsewhere in the body, under the National TB Elimination Programme. Tests and medicines are free at government facilities. Take every dose; stopping early can make TB harder to treat.', hi: 'टीबी पक्की हो तो इलाज वही है जो शरीर के दूसरे हिस्सों की टीबी का, राष्ट्रीय टीबी उन्मूलन कार्यक्रम के तहत। सरकारी जगहों पर जाँच और दवा मुफ़्त है। हर ख़ुराक लें; बीच में छोड़ने से टीबी का इलाज मुश्किल हो सकता है।' }) +
      P({ en: 'Ni-kshay Poshan Yojana: every TB patient registered on Ni-kshay gets ₹1,000 a month by bank transfer for food, for the whole treatment. Ask your doctor or DOTS centre to register you.', hi: 'निक्षय पोषण योजना: Ni-kshay पर दर्ज हर टीबी मरीज़ को पूरे इलाज के दौरान खाने के लिए हर महीने ₹1,000 बैंक खाते में मिलते हैं। डॉक्टर या DOTS केंद्र से अपना नाम दर्ज करवाएँ।' }) +
      P({ en: 'If the tubes or womb lining were damaged, pregnancy may need help such as IVF later. Finish TB treatment first; your gynaecologist plans the rest.', hi: 'अगर नलियों या बच्चेदानी की परत को नुक़सान हुआ है, तो बाद में गर्भ के लिए IVF जैसी मदद लगनी पड़ सकती है। पहले टीबी का इलाज पूरा करें; आगे की योजना स्त्री रोग विशेषज्ञ बनाएँगी।' }, 'small') + '</div>';

    const lines = '<h2>' + esc(t('helplines')) + '</h2><div class="list">' +
      copyRow('1800-11-6666', { en: 'Ni-kshay Sampark TB helpline, toll-free', hi: 'निक्षय संपर्क टीबी हेल्पलाइन, टोल-फ़्री' }) +
      copyRow('1097', { en: 'NACO helpline: HIV and STI', hi: 'NACO हेल्पलाइन: HIV और STI' }) + '</div>';

    v.innerHTML = S.backRow(t('cond_pid'), 'cond', false) +
      intro({ en: 'Two infections that can quietly damage the tubes. Caught early, both are treatable, and the tests and medicines are free at government facilities. Not a diagnosis.', hi: 'दो संक्रमण जो चुपचाप नलियों को नुक़सान पहुँचा सकते हैं। जल्दी पकड़ में आएँ तो दोनों का इलाज हो सकता है, और सरकारी जगहों पर जाँच और दवा मुफ़्त है। यह diagnosis नहीं है।' }) +
      flagLead('urgent', t('call_now'), t('s1a')) + flagLead('', t('today_if'), t('s2b')) +
      pid + tb + lines +
      askCard({ en: 'Pelvic infection or genital TB', hi: 'पेडू का संक्रमण या जननांग टीबी' }, { en: 'Unsure about a report or a treatment plan? A Qura doctor can go through it with you and tell you where to get it checked for free.', hi: 'किसी report या इलाज को लेकर उलझन है? Qura की डॉक्टर उसे आपके साथ देख सकती हैं और बताएँगी कि मुफ़्त जाँच कहाँ होगी।' }) +
      sources(['cdcPid', 'naco', 'icmrTb', 'whoSero', 'whoIgra', 'ntep', 'npy', 'tbHelp']);
    S.wire(v); wireCopy(v);
  }

  /* ---------- lab results ---------- */
  const TESTS = [
    { k: 'tsh', name: { en: 'TSH', hi: 'TSH' }, units: ['mIU/L', 'µIU/mL'], about: { en: 'A thyroid test. Often ordered for irregular periods, tiredness, weight change, or when trying for a baby.', hi: 'थायरॉइड की जाँच। अक्सर अनियमित पीरियड, थकान, वज़न में बदलाव, या बच्चे की कोशिश में लिखी जाती है।' } },
    { k: 'ft4', name: { en: 'Free T4', hi: 'Free T4' }, units: ['ng/dL', 'pmol/L'], about: { en: 'A thyroid hormone, usually checked along with TSH.', hi: 'थायरॉइड हॉर्मोन, आम तौर पर TSH के साथ जाँचा जाता है।' } },
    { k: 'prl', name: { en: 'Prolactin', hi: 'Prolactin' }, units: ['ng/mL', 'mIU/L'], about: { en: 'A hormone from a small gland in the brain. Checked for irregular or missed periods, or milky nipple discharge.', hi: 'दिमाग़ की एक छोटी ग्रंथि का हॉर्मोन। अनियमित या रुके पीरियड, या निप्पल से दूध जैसे स्राव में जाँचा जाता है।' } },
    { k: 'hb', name: { en: 'Haemoglobin (Hb)', hi: 'हीमोग्लोबिन (Hb)' }, units: ['g/dL', 'g/L'], about: { en: 'The part of blood that carries oxygen. Checked for tiredness and heavy periods.', hi: 'ख़ून का वह हिस्सा जो ऑक्सीजन ले जाता है। थकान और भारी पीरियड में जाँचा जाता है।' } },
    { k: 'fer', name: { en: 'Ferritin', hi: 'Ferritin (आयरन भंडार)' }, units: ['ng/mL', 'µg/L'], about: { en: 'Shows the body\'s iron store.', hi: 'शरीर में जमा आयरन दिखाता है।' } },
    { k: 'fbs', name: { en: 'Fasting sugar', hi: 'खाली पेट sugar' }, units: ['mg/dL', 'mmol/L'], about: { en: 'Blood sugar after not eating overnight.', hi: 'रात भर कुछ न खाने के बाद ख़ून में sugar।' } },
    { k: 'a1c', name: { en: 'HbA1c', hi: 'HbA1c' }, units: ['%', 'mmol/mol'], about: { en: 'Average blood sugar over about 3 months.', hi: 'लगभग 3 महीने की औसत sugar।' } },
    { k: 'vitd', name: { en: 'Vitamin D', hi: 'विटामिन D' }, units: ['ng/mL', 'nmol/L'], about: { en: 'Usually reported as 25-OH vitamin D.', hi: 'आम तौर पर 25-OH vitamin D के नाम से आता है।' } },
    { k: 'b12', name: { en: 'Vitamin B12', hi: 'विटामिन B12' }, units: ['pg/mL', 'pmol/L'], about: { en: 'Needed for blood and nerves.', hi: 'ख़ून और नसों के लिए ज़रूरी।' } }
  ];
  const testOf = (k) => TESTS.find((x) => x.k === k) || TESTS[0];
  const outside = (e) => (e.lo != null && e.v < e.lo) || (e.hi != null && e.v > e.hi);
  const rangeText = (e) => (e.lo != null && e.hi != null ? num(e.lo) + '–' + num(e.hi) : (e.lo != null ? '≥ ' + num(e.lo) : (e.hi != null ? '≤ ' + num(e.hi) : t('cond_lab_norange'))));
  const parseNum = (s) => { let x = String(s == null ? '' : s).trim().replace(/\s+/g, ''); x = /^\d{1,3}(,\d{2,3})*,\d{3}(\.\d+)?$/.test(x) ? x.replace(/,/g, '') : x.replace(',', '.'); const n = parseFloat(x); return isFinite(n) ? n : null; };   /* 1,050 and 1,05,000 are grouped thousands; 10,5 is a decimal comma */
  function labChart(list) {
    const W = 300, L = 10, R = 10, T = 18, B = 92;
    const last = list[list.length - 1]; const vals = list.map((e) => e.v); if (last.lo != null) vals.push(last.lo); if (last.hi != null) vals.push(last.hi);
    let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1); } const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
    const y = (x) => B - ((x - lo) / (hi - lo)) * (B - T);
    const t0 = S.fromISO(list[0].d).getTime(), t1 = S.fromISO(last.d).getTime();
    const x = (e) => (list.length === 1 || t1 === t0 ? W / 2 : L + 18 + ((S.fromISO(e.d).getTime() - t0) / (t1 - t0)) * (W - L - R - 36));
    let s = '<svg class="spark cond-chart2" viewBox="0 0 300 112" role="img" aria-label="' + esc(tx(testOf(last.k).name)) + '">';
    if (last.lo != null || last.hi != null) { const top = y(last.hi != null ? last.hi : hi), bot = y(last.lo != null ? last.lo : lo); s += '<rect class="cond-band" x="' + L + '" y="' + top.toFixed(1) + '" width="' + (W - L - R) + '" height="' + Math.max(1, bot - top).toFixed(1) + '" rx="4"/>'; }
    if (list.length > 1) s += '<polyline class="ln" points="' + list.map((e) => x(e).toFixed(1) + ',' + y(e.v).toFixed(1)).join(' ') + '"/>';
    list.forEach((e, i) => {
      s += '<circle class="pt' + (outside(e) ? ' cond-out' : '') + '" cx="' + x(e).toFixed(1) + '" cy="' + y(e.v).toFixed(1) + '" r="4.5"/><text x="' + x(e).toFixed(1) + '" y="' + (y(e.v) - 8).toFixed(1) + '" text-anchor="middle" class="cond-val">' + esc(num(e.v)) + '</text>';
      if (list.length <= 4 || i === 0 || i === list.length - 1) s += '<text x="' + x(e).toFixed(1) + '" y="108" text-anchor="middle">' + esc(fmtS(e.d)) + '</text>';
    });
    return s + '</svg>';
  }
  function drawLabForm(v) {
    const slot = v.querySelector('#cond-lab-slot'); if (!slot) return;
    const td = S.toISO(S.today());
    if (!mem.lab) mem.lab = { k: mem.labPre || 'hb', v: '', u: '', d: td, lo: '', hi: '', err: '' };
    mem.labPre = null;
    const f = mem.lab; const T = testOf(f.k); if (T.units.indexOf(f.u) < 0) f.u = T.units[0];
    slot.innerHTML = '<div class="card" id="cond-lab-form"><h2>' + esc(t('cond_lab_add')) + '</h2>' +
      '<label for="cond-lt">' + esc(t('cond_lab_test')) + '</label><select id="cond-lt">' + TESTS.map((x) => '<option value="' + x.k + '"' + (x.k === f.k ? ' selected' : '') + '>' + h(x.name) + '</option>').join('') + '</select>' +
      '<div class="grid2"><div class="stack" style="gap:6px"><label for="cond-lv">' + esc(t('cond_lab_value')) + '</label><input id="cond-lv" inputmode="decimal" value="' + esc(f.v) + '" autocomplete="off"></div>' +
      '<div class="stack" style="gap:6px"><label for="cond-lu">' + esc(t('cond_lab_unit')) + '</label><select id="cond-lu">' + T.units.map((u) => '<option' + (u === f.u ? ' selected' : '') + '>' + esc(u) + '</option>').join('') + '</select></div></div>' +
      '<label for="cond-ld">' + esc(t('cond_lab_date')) + '</label><input type="date" id="cond-ld" value="' + esc(f.d) + '" max="' + td + '">' +
      '<div class="eyebrow">' + esc(t('cond_lab_range_h')) + '</div>' +
      '<div class="grid2"><div class="stack" style="gap:6px"><label for="cond-llo">' + esc(t('cond_lab_lo')) + '</label><input id="cond-llo" inputmode="decimal" value="' + esc(f.lo) + '" autocomplete="off"></div>' +
      '<div class="stack" style="gap:6px"><label for="cond-lhi">' + esc(t('cond_lab_hi')) + '</label><input id="cond-lhi" inputmode="decimal" value="' + esc(f.hi) + '" autocomplete="off"></div></div>' +
      '<p class="small">' + esc(t('cond_lab_range_p')) + '</p>' +
      (f.err ? '<p class="small cond-err">' + esc(f.err) + '</p>' : '') +
      '<button type="button" class="btn primary block" id="cond-lsave">' + esc(t('save')) + '</button></div>';
    const keep = () => { f.v = slot.querySelector('#cond-lv').value; f.u = slot.querySelector('#cond-lu').value; f.d = slot.querySelector('#cond-ld').value || f.d; f.lo = slot.querySelector('#cond-llo').value; f.hi = slot.querySelector('#cond-lhi').value; };
    slot.querySelector('#cond-lt').addEventListener('change', (e) => { keep(); f.k = e.target.value; f.u = testOf(f.k).units[0]; f.err = ''; drawLabForm(v); });
    slot.querySelector('#cond-lsave').addEventListener('click', () => {
      keep(); const val = parseNum(f.v); const lo = parseNum(f.lo), hi = parseNum(f.hi);
      if (val == null) { f.err = t('cond_lab_err'); drawLabForm(v); return; }
      if ((String(f.lo).trim() && lo == null) || (String(f.hi).trim() && hi == null)) { f.err = t('cond_lab_err_r'); drawLabForm(v); return; }
      if (lo != null && hi != null && lo > hi) { f.err = t('cond_lab_err_o'); drawLabForm(v); return; }
      if (!okDate(f.d) || f.d > td) f.d = td;
      labsW().push({ id: 'L' + Date.now().toString(36) + Math.floor(Math.random() * 1000), k: f.k, v: val, u: f.u, d: f.d, lo: lo, hi: hi }); S.save();
      S.toast(t('saved')); mem.lab = { k: f.k, v: '', u: f.u, d: f.d, lo: f.lo, hi: f.hi, err: '' }; S.render();
    });
  }
  function labCards() {
    const labs = labsR(); if (!labs.length) return '<div class="card"><p class="small">' + esc(t('cond_lab_none')) + '</p></div>';
    return TESTS.map((T) => {
      const list = labs.filter((e) => e.k === T.k).sort((a, b) => (a.d < b.d ? -1 : (a.d > b.d ? 1 : 0)));
      if (!list.length) return '';
      const unitKey = (u) => (/^(mIU\/L|µIU\/mL|uIU\/mL|μIU\/mL)$/.test(String(u || '')) ? 'miu' : String(u || ''));   /* mIU/L = µIU/mL */
      const last = list[list.length - 1]; const same = list.filter((e) => unitKey(e.u) === unitKey(last.u));
      return '<div class="card"><div class="row spread" style="align-items:flex-start"><h3 style="min-width:0">' + h(T.name) + '</h3><span class="small num" style="color:var(--fg);font-weight:600;flex-shrink:0">' + esc(num(last.v) + ' ' + last.u) + '</span></div>' +
        labChart(same) + (last.lo != null || last.hi != null ? '<p class="small"><i class="cond-bandsw"></i> ' + esc(tf('cond_lab_band', { r: rangeText(last) })) + (same.some(outside) ? ' ' + esc(t('cond_lab_gold')) : '') + '</p>' : '') + (same.length < list.length ? '<p class="small">' + esc(t('cond_lab_units_note')) + '</p>' : '') +
        '<div class="list">' + list.slice().reverse().map((e) => '<div class="item quiet cond-labrow"><span class="body"><strong class="cond-tnum">' + esc(num(e.v) + ' ' + e.u) + ' · ' + esc(fmtL(e.d)) + '</strong><span>' + esc(t('cond_lab_range_lbl')) + ': ' + esc(rangeText(e)) + '</span>' + (outside(e) ? '<span class="pill accent cond-flag">' + esc(t('cond_lab_out')) + '</span>' : '') + '</span><button type="button" class="btn ghost sm" data-ldel="' + esc(e.id) + '">' + esc(t('cond_del')) + '</button></div>').join('') + '</div></div>';
    }).join('');
  }
  function renderLabs(v) {
    const can = S.canSave();
    v.innerHTML = S.backRow(t('cond_labs'), 'cond', true) +
      intro({ en: 'Write down results from your reports, so you and your doctor can see them over time. Copy the reference range printed on each report, because labs differ.', hi: 'अपनी reports के नतीजे यहाँ लिखें, ताकि आप और आपकी डॉक्टर समय के साथ इन्हें देख सकें। हर report पर छपी reference range भी लिखें, क्योंकि हर lab की range अलग होती है।' }) +
      '<div class="card soft"><p class="small" style="color:var(--fg)">' + esc(t('cond_lab_rule')) + '</p></div>' +
      (can ? '<div id="cond-lab-slot"></div>' + labCards() : S.needDiary()) +
      '<details class="card"><summary>' + h({ en: 'What these tests are', hi: 'ये जाँचें क्या हैं' }) + '</summary><dl class="cond-about">' + TESTS.map((T) => '<dt>' + h(T.name) + '</dt><dd>' + h(T.about) + '</dd>').join('') + '</dl></details>' +
      askCard({ en: 'My lab results', hi: 'मेरी lab reports' }, { en: 'A Qura doctor can read your reports with you, explain what they mean for you, and tell you if anything needs a specialist.', hi: 'Qura की डॉक्टर आपकी reports आपके साथ पढ़ सकती हैं, बता सकती हैं कि आपके लिए इनका क्या मतलब है, और किसी specialist की ज़रूरत हो तो बताएँगी।' }) +
      foot({ en: 'This page does not interpret results. Ranges differ by lab, age and pregnancy. Your doctor decides what a result means.', hi: 'यह पन्ना नतीजों का मतलब नहीं बताता। range lab, उम्र और गर्भ के हिसाब से बदलती है। नतीजे का मतलब आपकी डॉक्टर तय करती हैं।' });
    S.wire(v);
    if (!can) return;
    drawLabForm(v);
    v.querySelectorAll('[data-ldel]').forEach((b) => { let armed = false; b.addEventListener('click', () => {
      if (!armed) { armed = true; b.textContent = t('cond_del_sure'); return; }
      const d = S.data(ID); if (Array.isArray(d.labs)) d.labs = d.labs.filter((e) => e.id !== b.dataset.ldel); S.save(); S.toast(t('cond_deleted')); S.render();
    }); });
  }

  /* ---------- anaemia and the heavy-bleeding chart (PBAC) ---------- */
  const PB_KEYS = ['l', 'h', 'f', 'cs', 'cl', 'fl'];
  const PB_DAYS = 10;
  const emptyDay = () => ({ l: 0, h: 0, f: 0, cs: 0, cl: 0, fl: 0 });
  const dayPts = (d) => (d ? (d.l || 0) + 5 * (d.h || 0) + 20 * (d.f || 0) : 0);
  const dayAny = (d) => !!d && PB_KEYS.some((k) => (d[k] || 0) > 0);
  function pbDays(key) {
    const r = pbR()[key]; const out = [];
    for (let i = 0; i < PB_DAYS; i++) { const d = r && Array.isArray(r.d) && r.d[i] ? r.d[i] : null; const e = emptyDay(); if (d) PB_KEYS.forEach((k) => { e[k] = S.clamp(parseInt(d[k], 10) || 0, 0, 99); }); out.push(e); }
    return out;
  }
  function pbTotals(key) {
    const days = pbDays(key); const tot = { pts: 0, cs: 0, cl: 0, fl: 0, n: 0 };
    days.forEach((d) => { tot.pts += dayPts(d); tot.cs += d.cs; tot.cl += d.cl; tot.fl += d.fl; if (dayAny(d)) tot.n++; });
    return tot;
  }
  const padIcon = (lvl) => '<svg viewBox="0 0 24 32" class="cond-pad" aria-hidden="true"><rect x="4" y="2" width="16" height="28" rx="8" class="cond-pad-o"/>' + (lvl === 'l' ? '<ellipse cx="12" cy="16" rx="3" ry="4" class="cond-stain"/>' : (lvl === 'h' ? '<ellipse cx="12" cy="16" rx="5.5" ry="9" class="cond-stain"/>' : '<rect x="6" y="4" width="12" height="24" rx="6" class="cond-stain"/>')) + '</svg>';
  const clotIcon = (r) => '<svg viewBox="0 0 24 32" class="cond-pad" aria-hidden="true"><circle cx="12" cy="16" r="' + r + '" class="cond-stain"/></svg>';
  const PB_ROWS = [['l', 'cond_pb_light', 'cond_pb_pts1', () => padIcon('l')], ['h', 'cond_pb_half', 'cond_pb_pts5', () => padIcon('h')], ['f', 'cond_pb_full', 'cond_pb_pts20', () => padIcon('f')], ['cs', 'cond_pb_cs', 'cond_pb_noted', () => clotIcon(3)], ['cl', 'cond_pb_cl', 'cond_pb_noted', () => clotIcon(7)], ['fl', 'cond_pb_fl', 'cond_pb_noted', () => '<span class="cond-pad cond-fl">' + S.I.drop + '</span>']];
  function pbChart(days, n) {
    const W = 300, L = 6, R = 6, T = 16, B = 86; const pts = days.slice(0, n).map(dayPts); const mx = Math.max(20, Math.max.apply(null, pts)); const bw = (W - L - R) / n;
    let s = '<svg class="spark cond-chart3" viewBox="0 0 300 104" role="img" aria-label="' + esc(t('cond_pb_h')) + '"><line class="gd" x1="' + L + '" x2="' + (W - R) + '" y1="' + B + '" y2="' + B + '"/>';
    pts.forEach((v, i) => {
      const x = L + i * bw; const hgt = (v / mx) * (B - T);
      if (v > 0) s += '<rect class="cond-bar" x="' + (x + bw * 0.2).toFixed(1) + '" y="' + (B - hgt).toFixed(1) + '" width="' + (bw * 0.6).toFixed(1) + '" height="' + Math.max(1, hgt).toFixed(1) + '" rx="3"/><text x="' + (x + bw / 2).toFixed(1) + '" y="' + (B - hgt - 4).toFixed(1) + '" text-anchor="middle" class="cond-val">' + v + '</text>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="100" text-anchor="middle">' + (i + 1) + '</text>';
    });
    return s + '</svg>';
  }
  function drawPB(v) {
    const box = v.querySelector('#cond-pb'); if (!box) return;
    const td = S.toISO(S.today()); const st = startsU().filter((s) => s <= td);
    const recent = st.slice(-3).reverse();
    if (!mem.pb || !okDate(mem.pb.key)) mem.pb = { key: recent[0] || td, day: 0 };
    const key = mem.pb.key; const day = S.clamp(mem.pb.day || 0, 0, PB_DAYS - 1);
    const keys = recent.slice(); if (keys.indexOf(key) < 0) keys.unshift(key);
    const days = pbDays(key); let lastAny = -1; days.forEach((d, i) => { if (dayAny(d)) lastAny = i; });
    const n = S.clamp(Math.max(8, lastAny + 2, day + 1), 8, PB_DAYS);
    const tot = pbTotals(key); const cur = days[day];
    box.innerHTML = '<h2>' + esc(t('cond_pb_h')) + '</h2><p class="small">' + esc(t('cond_pb_p')) + '</p>' +
      '<label>' + esc(t('cond_pb_period')) + '</label><div class="chips">' + keys.map((k) => '<button type="button" class="chip' + (k === key ? ' on' : '') + '" data-pbk="' + esc(k) + '">' + esc(tf('cond_pb_from', { d: fmtS(k) })) + '</button>').join('') + '</div>' +
      '<div class="row"><label for="cond-pbd" style="flex:1;font-weight:500">' + esc(t('cond_pb_other')) + '</label><input type="date" id="cond-pbd" max="' + td + '" style="flex:1.3"></div>' +
      '<label>' + esc(t('cond_pb_whichday')) + '</label><div class="cond-days">' + days.slice(0, n).map((d, i) => '<button type="button" class="btn sm cond-day' + (i === day ? ' on' : '') + '" data-pbday="' + i + '" aria-label="' + esc(tf('cond_pb_dayn', { n: i + 1 })) + '"><span>' + esc(tf('cond_pb_dayn', { n: i + 1 })) + '</span><span class="num cond-dpts">' + (dayAny(d) ? dayPts(d) : '–') + '</span></button>').join('') + '</div>' +
      '<div class="stack cond-ctrs"><div class="eyebrow">' + esc(tf('cond_pb_dayn', { n: day + 1 })) + ' · ' + esc(fmtS(S.toISO(S.addDays(S.fromISO(key), day)))) + '</div>' +
      PB_ROWS.map((r) => '<div class="cond-ctr"><span class="cond-ico">' + r[3]() + '</span><span class="lbl"><strong>' + esc(t(r[1])) + '</strong><span class="small">' + esc(t(r[2])) + '</span></span><button type="button" class="btn sm" data-pbm="' + r[0] + '" aria-label="' + esc(t('cond_less') + ': ' + t(r[1])) + '">−</button><span class="n num">' + cur[r[0]] + '</span><button type="button" class="btn sm" data-pbp="' + r[0] + '" aria-label="' + esc(t('cond_more') + ': ' + t(r[1])) + '">+</button></div>').join('') + '</div>' +
      '<div class="card soft cond-pbsum"><div class="row spread" style="align-items:flex-end"><span class="eyebrow">' + esc(t('cond_pb_total')) + '</span><span class="cond-total num">' + tot.pts + '</span></div>' +
      (tot.n ? pbChart(days, n) : '') +
      '<p class="small" style="color:var(--fg)">' + esc(tf('cond_pb_clots', { s: tot.cs, l: tot.cl, f: tot.fl })) + '</p>' +
      '<p class="small" style="color:var(--fg);font-weight:600">' + esc(t('cond_pb_line')) + '</p>' +
      '<p class="small">' + esc(t('cond_pb_only')) + '</p></div>';
    box.querySelectorAll('[data-pbk]').forEach((b) => b.addEventListener('click', () => { mem.pb = { key: b.dataset.pbk, day: 0 }; drawPB(v); }));
    box.querySelector('#cond-pbd').addEventListener('change', (e) => { const d = e.target.value; if (okDate(d) && d <= td) { mem.pb = { key: d, day: 0 }; drawPB(v); } });
    box.querySelectorAll('[data-pbday]').forEach((b) => b.addEventListener('click', () => { mem.pb.day = parseInt(b.dataset.pbday, 10) || 0; drawPB(v); }));
    const bump = (k, by) => {
      const all = pbW(); const rec = all[key] && Array.isArray(all[key].d) ? all[key] : (all[key] = { d: [] });
      while (rec.d.length < PB_DAYS) rec.d.push(emptyDay());
      const d = rec.d[day] || (rec.d[day] = emptyDay()); d[k] = S.clamp((parseInt(d[k], 10) || 0) + by, 0, 99);
      if (!rec.d.some(dayAny)) delete all[key];
      S.save(); drawPB(v);
    };
    box.querySelectorAll('[data-pbp]').forEach((b) => b.addEventListener('click', () => bump(b.dataset.pbp, 1)));
    box.querySelectorAll('[data-pbm]').forEach((b) => b.addEventListener('click', () => bump(b.dataset.pbm, -1)));
  }
  function renderAnaemia(v) {
    const can = S.canSave();
    const hbs = labsR().filter((e) => e.k === 'hb').sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 3);
    const hbCard = '<div class="card"><h2>' + h({ en: 'Your Hb results', hi: 'आपके Hb नतीजे' }) + '</h2>' +
      (!can ? P({ en: 'Hb results you save on the lab results page show here.', hi: 'Lab results वाले पन्ने पर सेव किए Hb नतीजे यहाँ दिखते हैं।' }, 'small') :
        (hbs.length ? '<div class="list">' + hbs.map((e) => '<div class="item quiet"><span class="body"><strong class="cond-tnum">' + esc(num(e.v) + ' ' + e.u) + ' · ' + esc(fmtL(e.d)) + '</strong><span>' + esc(t('cond_lab_range_lbl')) + ': ' + esc(rangeText(e)) + '</span>' + (outside(e) ? '<span class="pill accent cond-flag">' + esc(t('cond_lab_out')) + '</span>' : '') + '</span></div>').join('') + '</div>' :
          P({ en: 'No Hb result saved yet. Ask your ANM or the Ayushman Arogya Mandir for a free Hb test.', hi: 'अभी कोई Hb नतीजा सेव नहीं है। मुफ़्त Hb जाँच के लिए अपनी ANM या आयुष्मान आरोग्य मंदिर से कहें।' }, 'small')) +
        '<button type="button" class="btn sm" style="align-self:flex-start" id="cond-addhb">' + h({ en: 'Add an Hb result', hi: 'Hb नतीजा जोड़ें' }) + '</button>') + '</div>';

    const about = '<div class="card"><h2>' + h({ en: 'What anaemia is', hi: 'ख़ून की कमी (एनीमिया) क्या है' }) + '</h2>' +
      P({ en: 'Anaemia means your blood has less haemoglobin (Hb) than it needs to carry oxygen. It is very common among Indian women. Heavy periods, pregnancies close together, worms, and too little iron in food are common causes. Others include a lack of vitamin B12 or folate, thalassaemia trait, and infections like TB or malaria, so your doctor may order more tests such as ferritin or B12.', hi: 'एनीमिया का मतलब है कि ख़ून में ऑक्सीजन ले जाने वाला हीमोग्लोबिन (Hb) ज़रूरत से कम है। भारतीय महिलाओं में यह बहुत आम है। भारी पीरियड, जल्दी-जल्दी गर्भ, पेट के कीड़े, और खाने में कम आयरन इसकी आम वजहें हैं। विटामिन B12 या folate की कमी, thalassaemia trait, और टीबी या मलेरिया जैसे संक्रमण भी वजह हो सकते हैं, इसलिए डॉक्टर ferritin या B12 जैसी और जाँचें लिख सकती हैं।' }) +
      sub({ en: 'Signs', hi: 'संकेत' }) +
      ul([{ en: 'Tiredness, weakness, feeling sleepy, trouble concentrating', hi: 'थकान, कमज़ोरी, नींद-सी आना, ध्यान न लगना' }, { en: 'Dizziness', hi: 'चक्कर आना' }, { en: 'Later: pale skin, breathlessness, chest pain', hi: 'बाद में: पीली त्वचा, साँस फूलना, सीने में दर्द' }]) +
      P({ en: 'The early signs are easy to blame on work or stress. A blood test is the only way to know.', hi: 'शुरुआती संकेतों को काम या तनाव मान लेना आसान है। पता सिर्फ़ ख़ून की जाँच से चलता है।' }, 'small') + '</div>';

    const pbCard = can ? '<div class="card" id="cond-pb"></div>' :
      '<div class="card"><h2>' + esc(t('cond_pb_h')) + '</h2><p class="small">' + esc(t('cond_pb_p')) + '</p><p class="small" style="color:var(--fg);font-weight:600">' + esc(t('cond_pb_line')) + '</p></div>' + S.needDiary();

    const free = '<div class="card"><h2>' + h({ en: 'Free from the government', hi: 'सरकार की तरफ़ से मुफ़्त' }) + '</h2>' +
      P({ en: 'Under Anemia Mukt Bharat Abhiyaan:', hi: 'एनीमिया मुक्त भारत अभियान में:' }, 'small') +
      ul([{ en: 'Women aged 20–49 who are not pregnant or breastfeeding: one red iron-folic acid (IFA) tablet once a week, free. Each has 60 mg iron and 500 mcg folic acid. Ask your ANM or ASHA at the Village Health and Nutrition Day, or at your health centre.', hi: '20–49 साल की महिलाएँ जो गर्भवती नहीं हैं और दूध नहीं पिला रहीं: हफ़्ते में एक लाल आयरन-फ़ोलिक एसिड (IFA) गोली, मुफ़्त। हर गोली में 60 mg आयरन और 500 mcg फ़ोलिक एसिड होता है। ग्राम स्वास्थ्य और पोषण दिवस पर अपनी ANM या ASHA से, या अपने स्वास्थ्य केंद्र पर माँगें।' },
        { en: 'An Hb test once a year. Ask at your Ayushman Arogya Mandir, a health camp, or your ANM.', hi: 'साल में एक बार Hb जाँच। आयुष्मान आरोग्य मंदिर, health camp, या अपनी ANM से पूछें।' },
        { en: 'A deworming tablet (albendazole) twice a year at the Anganwadi centre.', hi: 'साल में दो बार पेट के कीड़ों की गोली (albendazole), आँगनवाड़ी केंद्र पर।' },
        { en: 'Planning a pregnancy? Switch to a daily folic acid tablet (400 mcg) from before pregnancy until 12 weeks. Pregnant or breastfeeding women get a different schedule at their check-ups.', hi: 'गर्भ की योजना है? गर्भ से पहले से 12 हफ़्ते तक रोज़ फ़ोलिक एसिड की गोली (400 mcg) लें। गर्भवती और दूध पिलाने वाली महिलाओं को जाँच के समय अलग schedule मिलता है।' }]) +
      P({ en: 'If your Hb is low, the doctor or ANM may give the red tablet daily, often for about 3 months, and test again. Your doctor decides.', hi: 'अगर Hb कम है, तो डॉक्टर या ANM लाल गोली रोज़ दे सकती हैं, अक्सर लगभग 3 महीने, और फिर जाँच। यह डॉक्टर तय करती हैं।' }, 'small') +
      sub({ en: 'Taking the tablet', hi: 'गोली लेते समय' }) +
      ul([{ en: 'If it makes you feel sick, take it after a meal or at bedtime.', hi: 'जी मिचलाए तो खाने के बाद या सोते समय लें।' },
        { en: 'Black stools are normal with iron and not harmful.', hi: 'आयरन से पखाना काला होना सामान्य है, नुक़सान नहीं करता।' },
        { en: 'Constipation: more water, fruit, vegetables and walking.', hi: 'कब्ज़ हो तो: ज़्यादा पानी, फल, सब्ज़ी और टहलना।' },
        { en: 'Pause it during a fever, diarrhoea or other short illness, and restart when you are well.', hi: 'बुख़ार, दस्त या कोई और छोटी बीमारी में रोक दें, ठीक होने पर फिर शुरू करें।' },
        { en: 'Thalassaemia major or repeated blood transfusions: do not take iron unless your doctor says so.', hi: 'Thalassaemia major हो या बार-बार ख़ून चढ़ा हो: डॉक्टर के कहे बिना आयरन न लें।' },
        { en: 'Severe vomiting, belly pain that does not settle, rash, swelling or trouble breathing: stop and see a doctor.', hi: 'तेज़ उल्टी, पेट दर्द जो न रुके, चकत्ते, सूजन या साँस में तकलीफ़: गोली रोकें और डॉक्टर को दिखाएँ।' }]) +
      (S.routeOwner('iron') ? '<button type="button" class="btn sm" style="align-self:flex-start" data-go="iron">' + h({ en: 'Iron tablets: tick and reminder', hi: 'आयरन की गोलियाँ: टिक और रिमाइंडर' }) + '</button>' : '') + '</div>';

    /* Version 39.8 (diet audit VD-02): the card's own foods as pictures first; the card never folds */
    const dt = S.food && S.food.diet ? S.food.diet() : { type: 'veg' };
    const ironPics = S.food && S.food.strip ? S.food.strip([['saag', { en: 'Green leafy sabzi', hi: 'हरी पत्तेदार सब्ज़ी' }], ['ragi', { en: 'Ragi', hi: 'रागी' }], ['dal', { en: 'Chana dal', hi: 'चना दाल' }], ['sprouts', { en: 'Sprouts', hi: 'स्प्राउट्स' }, 'j', { en: 'Sprouts, cooked', hi: 'पकाए हुए अंकुरित अनाज' }],   /* V39.8 review SAFETY-02 */ ['til', { en: 'Til', hi: 'तिल' }], ['gud', { en: 'Gur', hi: 'गुड़' }], ['khajur', { en: 'Dates', hi: 'खजूर' }]].concat(dt.type === 'nonveg' ? [['fish', { en: 'Fish', hi: 'मछली' }]] : []).concat([['amla', { en: 'Amla', hi: 'आँवला' }], ['amrood', { en: 'Guava', hi: 'अमरूद' }], ['nimbu', { en: 'Lemon', hi: 'नींबू' }]]), t('foods_help')) : '';
    const food = '<div class="card" data-nofold="1"><h2>' + h({ en: 'Food that builds blood', hi: 'ख़ून बढ़ाने वाला खाना' }) + '</h2>' + ironPics +
      ul([{ en: 'Green leafy vegetables such as chaulai, methi, gongura, beet greens and pumpkin leaves', hi: 'हरी पत्तेदार सब्ज़ियाँ, जैसे चौलाई, मेथी, गोंगुरा, चुकंदर के पत्ते और कद्दू के पत्ते' },
        { en: 'Ragi, bajra and rajgira', hi: 'रागी, बाजरा और राजगिरा' },
        { en: 'Chana dal, urad dal, lobia, moth and kulthi', hi: 'चना दाल, उड़द दाल, लोबिया, मोठ और कुलथी' },
        { en: 'Halim seeds, til and gur; dates, raisins and imli', hi: 'हलीम के बीज, तिल और गुड़; खजूर, किशमिश और इमली' },
        { en: 'Fish and liver, if you eat them', hi: 'मछली और कलेजी, अगर आप खाती हैं' }]) +
      sub({ en: 'Help your body take it in', hi: 'शरीर को आयरन लेने में मदद करें' }) +
      ul([{ en: 'Eat vitamin C in the same meal: amla, guava, lemon or orange.', hi: 'उसी खाने के साथ विटामिन C लें: आँवला, अमरूद, नींबू या संतरा।' },
        { en: 'Keep tea and coffee for between meals, not with food or the iron tablet.', hi: 'चाय और कॉफ़ी खाने के बीच के समय में पिएँ, खाने या आयरन की गोली के साथ नहीं।' },
        { en: 'Sprouting, soaking and fermenting (sprouts, idli, dosa, dhokla) help the body absorb more iron.', hi: 'अंकुरित करना, भिगोना और ख़मीर उठाना (स्प्राउट्स, इडली, डोसा, ढोकला) से शरीर ज़्यादा आयरन ले पाता है।' }]) +
      P({ en: 'Once you are anaemic, food alone is often not enough. You may need tablets as well.', hi: 'एक बार ख़ून की कमी हो जाए तो अक्सर सिर्फ़ खाना काफ़ी नहीं होता। गोलियाँ भी लगती हैं।' }, 'small') + '</div>';

    const doctor = '<div class="card warn"><h3>' + esc(t('see_doctor')) + '</h3>' +
      flagLead('urgent', t('call_now'), t('s1b')) +
      flag('', { en: 'Chest pain, fainting, or breathless while resting: get medical help today; call 112 if it is severe.', hi: 'सीने में दर्द, बेहोशी, या आराम में भी साँस फूलना: आज ही इलाज लें; ज़्यादा हो तो 112 पर कॉल करें।' }) +
      ul([{ en: 'Within a few weeks: periods heavy month after month, periods that get in the way of your work, sleep or going out (whatever the chart says), or a heavy-bleeding chart total of 100 or more. See a gynaecologist and take the chart.', hi: 'कुछ हफ़्तों में: हर महीने भारी पीरियड, ऐसे पीरियड जो आपके काम, नींद या बाहर जाने में रुकावट डालें (चार्ट कुछ भी कहे), या ब्लीडिंग चार्ट का कुल 100 या ज़्यादा। स्त्री रोग विशेषज्ञ को चार्ट के साथ दिखाएँ।' },
        { en: 'This week: ' + t('s4a'), hi: 'इसी हफ़्ते: ' + t('s4a') },
        { en: 'Any bleeding a year or more after your last period.', hi: 'आख़िरी पीरियड के एक साल या ज़्यादा बाद कोई भी ब्लीडिंग।' }]) + '</div>';

    v.innerHTML = S.backRow(t('cond_anaemia'), 'cond', true) +
      intro({ en: 'Anaemia is easy to test for and usually easy to treat. Heavy periods are a common cause. This page has your Hb results, a heavy-bleeding chart to fill during your period, and what is free. Not a diagnosis.', hi: 'ख़ून की कमी की जाँच आसान है और इलाज भी अक्सर आसान है। भारी पीरियड इसकी आम वजह हैं। इस पन्ने पर आपके Hb नतीजे, पीरियड के दिनों में भरने वाला ब्लीडिंग चार्ट, और मुफ़्त सुविधाएँ हैं। यह diagnosis नहीं है।' }) +
      flagLead('urgent', t('call_now'), t('s1b')) +
      [hbCard, pbCard, about, free, food, doctor].map((x) => x.replace(/^<div class="card([^"]*)"/, '<div class="card$1" data-jump="1"')).join('') +   /* Version 39.8: one tap to each section */
      askCard({ en: 'Anaemia and heavy periods', hi: 'ख़ून की कमी और भारी पीरियड' }, { en: 'Bring your Hb report and this chart to a free call. A Qura doctor helps with diet and tablets, orders tests, and refers you to a gynaecologist when bleeding needs treatment.', hi: 'अपनी Hb report और यह चार्ट लेकर मुफ़्त कॉल पर आएँ। Qura की डॉक्टर खाने और गोलियों में मदद करती हैं, जाँचें लिखती हैं, और ब्लीडिंग के इलाज के लिए स्त्री रोग विशेषज्ञ के पास refer करती हैं।' }) +
      sources(['amb', 'pbac']);
    S.wire(v);
    const add = v.querySelector('#cond-addhb'); if (add) add.addEventListener('click', () => { mem.lab = null; mem.labPre = 'hb'; S.setHash('cond-labs'); });
    if (can) drawPB(v);
  }

  /* ---------- POI: periods stopping before 40 ---------- */
  function renderPoi(v) {
    const age = S.cycle.ageYears(); const sit = S.state.situation || {};
    const mine = S.canSave() && age != null && age < 40 && sit.stopped ? '<div class="card soft"><p class="small" style="color:var(--fg)">' + h({ en: 'You marked that your periods have stopped, and you are under 40. Please see a gynaecologist; this page explains why it matters.', hi: 'आपने बताया है कि आपके पीरियड बंद हो गए हैं, और आपकी उम्र 40 से कम है। कृपया स्त्री रोग विशेषज्ञ को दिखाएँ; यह पन्ना बताता है कि यह क्यों ज़रूरी है।' }) + '</p></div>' : '';
    v.innerHTML = S.backRow(t('cond_poi'), 'cond', false) +
      intro({ en: 'When the ovaries stop working before 40, doctors call it premature ovarian insufficiency (POI). Before 45 it is called early menopause. It needs care, because the hormones the ovaries make protect your bones and heart. Not a diagnosis.', hi: 'जब 40 साल से पहले अंडाशय काम करना बंद कर दें, तो डॉक्टर इसे premature ovarian insufficiency (POI) कहते हैं। 45 से पहले हो तो इसे जल्दी मेनोपॉज़ कहते हैं। इसमें देखभाल ज़रूरी है, क्योंकि अंडाशय के हॉर्मोन हड्डियों और दिल की रक्षा करते हैं। यह diagnosis नहीं है।' }) +
      mine +
      '<div class="card warn"><h3>' + h({ en: 'See a gynaecologist if', hi: 'स्त्री रोग विशेषज्ञ को दिखाएँ अगर' }) + '</h3>' +
      ul([{ en: 'You are under 40 and your periods have stopped or become very irregular for 4 months or more (not pregnant, breastfeeding or on hormones). Do a pregnancy test first.', hi: 'आपकी उम्र 40 से कम है और 4 महीने या ज़्यादा से पीरियड बंद हैं या बहुत अनियमित हैं (गर्भ, स्तनपान या हॉर्मोन की दवा नहीं)। पहले गर्भ का test करें।' },
        { en: 'You are under 45 with hot flushes, night sweats or vaginal dryness and changing periods.', hi: 'आपकी उम्र 45 से कम है, और गर्मी के झोंके, रात में पसीना या योनि में सूखापन है, साथ में पीरियड बदल रहे हैं।' }]) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'Causes', hi: 'कारण' }) + '</h2>' +
      ul([{ en: 'Often no cause is found.', hi: 'अक्सर कोई कारण नहीं मिलता।' },
        { en: 'Cancer treatment (chemotherapy or radiotherapy), or surgery that removed the ovaries', hi: 'कैंसर का इलाज (chemotherapy या radiotherapy), या ऑपरेशन जिसमें अंडाशय निकाले गए' },
        { en: 'Autoimmune conditions, such as some thyroid problems', hi: 'Autoimmune बीमारियाँ, जैसे कुछ थायरॉइड की समस्याएँ' },
        { en: 'Genetic causes, such as Turner syndrome or a fragile X gene change', hi: 'जीन से जुड़ी वजहें, जैसे Turner syndrome या fragile X जीन में बदलाव' },
        { en: 'It is more likely if it runs in your family, or if you smoke.', hi: 'परिवार में किसी को हुआ हो, या आप धूम्रपान करती हों, तो संभावना ज़्यादा होती है।' }]) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'Tests', hi: 'जाँचें' }) + '</h2>' +
      steps([{ en: 'A pregnancy test first', hi: 'सबसे पहले गर्भ का test' },
        { en: 'FSH blood test. With periods disturbed for at least 4 months, one raised FSH (above 25 IU/L) is enough for doctors to diagnose POI; they repeat it if unsure.', hi: 'FSH blood test। कम से कम 4 महीने से पीरियड गड़बड़ हों, तो एक बार बढ़ा हुआ FSH (25 IU/L से ऊपर) POI बताने के लिए काफ़ी है; शक हो तो दोबारा करते हैं।' },
        { en: 'TSH and prolactin, to rule out other causes of missed periods', hi: 'TSH और prolactin, ताकि पीरियड रुकने की दूसरी वजहें देखी जा सकें' },
        { en: 'If there is no clear cause such as surgery or cancer treatment: a chromosome test, a fragile X gene test and an adrenal antibody test', hi: 'अगर ऑपरेशन या कैंसर के इलाज जैसी साफ़ वजह न हो: chromosome test, fragile X जीन test और adrenal antibody test' },
        { en: 'A bone density scan (DEXA) at diagnosis, where available', hi: 'जहाँ हो सके, diagnosis के समय हड्डियों की मज़बूती का scan (DEXA)' }]) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'Why hormone treatment is advised', hi: 'हॉर्मोन का इलाज क्यों कहा जाता है' }) + '</h2>' +
      P({ en: 'Hormone therapy (HRT) is recommended for women with POI until the usual age of menopause. It replaces hormones your body would normally make at your age. It keeps bones strong and lowers the risk of heart disease, which is higher without it. At the usual age of menopause, the doctor reviews whether to continue. The combined pill is sometimes used instead.', hi: 'POI वाली महिलाओं को मेनोपॉज़ की आम उम्र तक हॉर्मोन therapy (HRT) की सलाह दी जाती है। यह वे हॉर्मोन देती है जो इस उम्र में आपका शरीर ख़ुद बनाता। इससे हड्डियाँ मज़बूत रहती हैं और दिल की बीमारी का ख़तरा कम होता है, जो इसके बिना ज़्यादा होता है। मेनोपॉज़ की आम उम्र पर डॉक्टर देखती हैं कि आगे जारी रखना है या नहीं। कभी इसकी जगह combined pill दी जाती है।' }) +
      P({ en: 'HRT and the pill must be prescribed by an MBBS gynaecologist. Some women, such as those who had certain cancers, cannot take hormones; the gynaecologist decides.', hi: 'HRT और pill MBBS स्त्री रोग विशेषज्ञ ही लिखती हैं। कुछ महिलाएँ, जैसे कुछ कैंसर के बाद, हॉर्मोन नहीं ले सकतीं; यह स्त्री रोग विशेषज्ञ तय करती हैं।' }, 'small') +
      '<div class="row wrap"><button type="button" class="btn sm" data-go="meno-hrt">' + h({ en: 'About HRT', hi: 'HRT के बारे में' }) + '</button><button type="button" class="btn sm" data-go="meno-bones">' + h({ en: 'Strong bones', hi: 'मज़बूत हड्डियाँ' }) + '</button></div></div>' +
      '<div class="card"><h2>' + h({ en: 'Pregnancy', hi: 'गर्भ' }) + '</h2>' +
      P({ en: 'POI makes natural pregnancy much less likely, but the ovaries can still work now and then. So pregnancy can happen: use contraception if you do not want one. HRT is not contraception.', hi: 'POI में अपने आप गर्भ ठहरने की संभावना बहुत कम होती है, पर अंडाशय बीच-बीच में काम कर सकते हैं। इसलिए गर्भ ठहर सकता है: न चाहिए तो गर्भनिरोध इस्तेमाल करें। HRT गर्भनिरोध नहीं है।' }) +
      P({ en: 'IVF with donor eggs is an established way to get pregnant after POI. If you are about to have cancer treatment, ask about freezing eggs or embryos first.', hi: 'POI के बाद गर्भ के लिए donor अंडों से IVF एक जाना-माना तरीक़ा है। अगर कैंसर का इलाज शुरू होने वाला है, तो पहले अंडे या embryo freeze करवाने के बारे में पूछें।' }) +
      '<button type="button" class="btn sm" style="align-self:flex-start" data-go="ttc-tests">' + h({ en: 'Tests when trying for a baby', hi: 'बच्चे की कोशिश में जाँचें' }) + '</button></div>' +
      '<div class="card"><h2>' + h({ en: 'Your feelings matter too', hi: 'आपकी भावनाएँ भी मायने रखती हैं' }) + '</h2>' +
      P({ en: 'Hearing that your ovaries have stopped early can be a shock, especially if you hoped for children. Talk to someone you trust. Tele-MANAS 14416 is free, any time.', hi: 'यह सुनना कि अंडाशय जल्दी रुक गए, सदमा दे सकता है, ख़ासकर अगर आप बच्चा चाहती थीं। किसी भरोसेमंद से बात करें। Tele-MANAS 14416 मुफ़्त है, कभी भी।' }) +
      P({ en: 'Where to go: the gynaecology OPD of a district hospital or medical college.', hi: 'कहाँ जाएँ: ज़िला अस्पताल या मेडिकल कॉलेज की gynaecology OPD।' }, 'small') + '</div>' +
      askCard({ en: 'Periods stopped before 40 (POI)', hi: '40 से पहले पीरियड बंद (POI)' }, { en: 'A Qura doctor can go through your reports, help with sleep, diet and bone care, and refer you to a gynaecologist for HRT.', hi: 'Qura की डॉक्टर आपकी reports देख सकती हैं, नींद, खाने और हड्डियों की देखभाल में मदद करती हैं, और HRT के लिए स्त्री रोग विशेषज्ञ के पास refer करती हैं।' }) +
      sources(['eshre', 'nhsEarly']);
    S.wire(v);
  }

  /* ---------- before a hysterectomy ---------- */
  const HQ = [
    ['why', { en: 'Why it is advised', hi: 'क्यों कहा गया है' }, [
      ['dx', { en: 'What exactly is the diagnosis, and which report shows it?', hi: 'असल में बीमारी क्या है, और कौन सी report में यह दिखता है?' }],
      ['wait', { en: 'What happens if I wait, or try something else first?', hi: 'अगर मैं रुकूँ, या पहले कुछ और आज़माऊँ, तो क्या होगा?' }]]],
    ['tried', { en: 'What else has been tried', hi: 'और क्या आज़माया गया है' }, [
      ['meds', { en: 'Medicines for bleeding or pain, such as tranexamic acid or painkillers', hi: 'ब्लीडिंग या दर्द की दवाएँ, जैसे tranexamic acid या दर्द की गोली' }],
      ['ius', { en: 'A hormonal IUD or other hormone treatment', hi: 'हॉर्मोन वाला IUD या कोई और हॉर्मोन इलाज' }],
      ['myo', { en: 'Removing only the fibroid or polyp and keeping the womb', hi: 'बच्चेदानी रखते हुए सिर्फ़ फाइब्रॉइड या पॉलिप निकालना' }],
      ['abl', { en: 'Endometrial ablation, which treats only the lining', hi: 'Endometrial ablation, जिसमें सिर्फ़ अंदरूनी परत का इलाज होता है' }]]],
    ['ov', { en: 'Ovaries', hi: 'अंडाशय (ovaries)' }, [
      ['ovk', { en: 'Will my ovaries be kept? If they are removed before menopause, menopause starts at once. Ask why.', hi: 'क्या मेरे अंडाशय रखे जाएँगे? मेनोपॉज़ से पहले निकाले गए तो मेनोपॉज़ तुरंत शुरू हो जाता है। वजह पूछें।' }]]],
    ['op', { en: 'The operation', hi: 'ऑपरेशन' }, [
      ['route', { en: 'Which route: through the vagina, keyhole (laparoscopy), or an open cut on the belly? Why that one?', hi: 'कौन सा तरीक़ा: योनि के रास्ते, दूरबीन (laparoscopy), या पेट पर चीरा? यही क्यों?' }],
      ['cx', { en: 'Will the cervix be removed? If it is kept, I still need cervical screening.', hi: 'क्या बच्चेदानी का मुँह (cervix) भी निकलेगा? रखा गया तो cervix की screening आगे भी करानी होगी।' }],
      ['rec', { en: 'What are the risks? How long in hospital, and when can I lift, work and have sex again?', hi: 'ख़तरे क्या हैं? अस्पताल में कितने दिन, और कब से वज़न उठाना, काम और संबंध फिर शुरू कर सकती हूँ?' }],
      ['hpe', { en: 'Will the removed tissue be sent for a lab report (histopathology), and will I get a copy?', hi: 'क्या निकाला गया हिस्सा lab जाँच (histopathology) में जाएगा, और मुझे उसकी copy मिलेगी?' }]]],
    ['cost', { en: 'Cost', hi: 'ख़र्च' }, [
      ['amt', { en: 'What is the total cost, in writing?', hi: 'कुल ख़र्च कितना है, लिखकर दें?' }],
      ['pmjay', { en: 'Is this covered under PM-JAY here? Ask the Ayushman Mitra at the hospital desk.', hi: 'क्या यहाँ यह PM-JAY में आता है? अस्पताल के आयुष्मान मित्र से पूछें।' }]]]
  ];
  function renderHyst(v) {
    const can = S.canSave(); const saved = hystR();
    const list = HQ.map((g) => '<h3 class="cond-sub">' + h(g[1]) + '</h3><div class="checklist">' + g[2].map((q) => '<label' + (saved[q[0]] ? ' class="done"' : '') + '><input type="checkbox" data-hq="' + q[0] + '"' + (saved[q[0]] ? ' checked' : '') + '> <span>' + h(q[1]) + '</span></label>').join('') + '</div>').join('');
    v.innerHTML = S.backRow(t('cond_hyst'), 'cond', false) +
      intro({ en: 'A hysterectomy (removing the womb) is sometimes the right treatment. It cannot be undone. Many problems it is offered for, such as fibroids or heavy bleeding, can often be treated in other ways first. Before you agree, ask these questions, and take a second opinion if you are unsure.', hi: 'Hysterectomy (बच्चेदानी निकालना) कभी-कभी सही इलाज होता है। इसे वापस नहीं किया जा सकता। जिन समस्याओं के लिए यह कहा जाता है, जैसे फाइब्रॉइड या भारी ब्लीडिंग, उनका अक्सर पहले दूसरे तरीक़ों से इलाज हो सकता है। हाँ कहने से पहले ये सवाल पूछें, और उलझन हो तो दूसरी राय (second opinion) लें।' }) +
      '<div class="card"><h2>' + h({ en: 'Second-opinion checklist', hi: 'दूसरी राय के लिए सवाल' }) + '</h2>' +
      P({ en: 'Tick each one once you have a clear answer.', hi: 'जिस सवाल का साफ़ जवाब मिल जाए, उस पर टिक करें।' }, 'small') + list +
      (can ? '' : P({ en: 'Ticks are not saved without a diary.', hi: 'डायरी के बिना टिक सेव नहीं होते।' }, 'small')) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'Your rights as a patient', hi: 'मरीज़ के तौर पर आपके अधिकार' }) + '</h2>' +
      P({ en: 'The Charter of Patients\' Rights says you have the right to:', hi: 'मरीज़ों के अधिकारों का चार्टर कहता है कि आपको अधिकार है:' }, 'small') +
      ul([{ en: 'Clear information about your illness, the treatment, possible problems and the expected cost', hi: 'अपनी बीमारी, इलाज, संभावित परेशानियों और अनुमानित ख़र्च की साफ़ जानकारी' },
        { en: 'Copies of your case papers, reports and an itemised bill', hi: 'अपने case papers, reports और पूरे ब्योरे वाले bill की copy' },
        { en: 'Give or refuse informed consent before an operation', hi: 'ऑपरेशन से पहले सोच-समझकर सहमति देना या मना करना' },
        { en: 'A second opinion from a doctor of your choice, with the hospital giving your records', hi: 'अपनी पसंद के डॉक्टर से दूसरी राय, जिसके लिए अस्पताल आपके records देगा' },
        { en: 'A woman present when a male doctor examines you', hi: 'पुरुष डॉक्टर जाँच करे तो साथ में एक महिला की मौजूदगी' },
        { en: 'Choose another treatment when there are options', hi: 'विकल्प हों तो दूसरा इलाज चुनना' }]) + '</div>' +
      '<div class="card"><h2>' + h({ en: 'Safeguards in India', hi: 'भारत में सुरक्षा के नियम' }) + '</h2>' +
      ul([{ en: 'In 2022 the Health Ministry issued guidelines to prevent unnecessary hysterectomies. District committees audit hysterectomies on women under 35, and removal of ovaries in women under 40.', hi: '2022 में स्वास्थ्य मंत्रालय ने बेवजह hysterectomy रोकने की गाइडलाइन जारी की। ज़िला समितियाँ 35 से कम उम्र की महिलाओं की hysterectomy, और 40 से कम उम्र में अंडाशय निकालने के मामलों की जाँच (audit) करती हैं।' },
        { en: 'In April 2023 the Supreme Court told every state to follow these guidelines, and to take strict action, including blacklisting, against hospitals that do unnecessary hysterectomies or operate without informed consent.', hi: 'अप्रैल 2023 में सुप्रीम कोर्ट ने हर राज्य को ये गाइडलाइन लागू करने को कहा, और बेवजह या बिना सहमति hysterectomy करने वाले अस्पतालों पर blacklist समेत सख़्त कार्रवाई करने को कहा।' },
        { en: 'Some states ask hospitals for extra approval before a hysterectomy on a woman aged 40 or below under government insurance.', hi: 'कुछ राज्यों में सरकारी बीमा से 40 या कम उम्र की महिला की hysterectomy से पहले अस्पताल को अलग मंज़ूरी लेनी होती है।' },
        { en: 'PM-JAY (Ayushman Bharat): eligible families get cashless treatment up to ₹5 lakh a year at empanelled hospitals. Helpline 14555 checks eligibility and takes complaints.', hi: 'PM-JAY (आयुष्मान भारत): पात्र परिवारों को सूचीबद्ध अस्पतालों में साल में ₹5 लाख तक cashless इलाज। हेल्पलाइन 14555 पर पात्रता जानें और शिकायत करें।' }]) +
      sub({ en: 'Where to go', hi: 'कहाँ जाएँ' }) +
      P({ en: 'For a second opinion: the gynaecology OPD of a district hospital or government medical college. Take every scan and report. If you were pressured, or not told why, complain to the district Chief Medical Officer (CMO), or call 14555 for a PM-JAY hospital.', hi: 'दूसरी राय के लिए: ज़िला अस्पताल या सरकारी मेडिकल कॉलेज की gynaecology OPD। सारे scan और reports साथ ले जाएँ। अगर दबाव डाला गया, या वजह नहीं बताई गई, तो ज़िले के मुख्य चिकित्सा अधिकारी (CMO) से शिकायत करें, या PM-JAY अस्पताल के लिए 14555 पर कॉल करें।' }) + '</div>' +
      '<h2>' + h({ en: 'Related', hi: 'इससे जुड़े पन्ने' }) + '</h2><div class="list">' +
      linkItem('intimate-prolapse', 'heart', tx({ en: 'Prolapse (womb slipping down)', hi: 'Prolapse (बच्चेदानी का नीचे खिसकना)' }), tx({ en: 'Often treatable without removing the womb', hi: 'अक्सर बच्चेदानी निकाले बिना इलाज' })) +
      linkItem('meno-surgical', 'moon', tx({ en: 'Menopause after surgery', hi: 'ऑपरेशन के बाद मेनोपॉज़' }), tx({ en: 'If the ovaries are removed', hi: 'अगर अंडाशय निकाले गए' })) +
      linkItem('screen-cervix', 'ribbon', tx({ en: 'Cervical screening', hi: 'Cervix की screening' }), tx({ en: 'Still needed if the cervix is kept', hi: 'Cervix रखा गया तो अब भी ज़रूरी' })) + '</div>' +
      askCard({ en: 'Advised a hysterectomy: second opinion', hi: 'Hysterectomy की सलाह: दूसरी राय' }, { en: 'A Qura doctor can go through your reports with you and help you write down your questions. Qura does not do surgery and has nothing to sell you here.', hi: 'Qura की डॉक्टर आपकी reports आपके साथ देख सकती हैं और सवाल लिखने में मदद करती हैं। Qura सर्जरी नहीं करता और यहाँ आपको कुछ नहीं बेचता।' }) +
      sources(['charter', 'sc', 'pmjay']);
    S.wire(v);
    v.querySelectorAll('[data-hq]').forEach((c) => c.addEventListener('change', () => {
      const lab = c.closest('label'); if (lab) lab.classList.toggle('done', c.checked);
      if (!S.canSave()) return;
      const d = hystW(); if (c.checked) d[c.dataset.hq] = true; else delete d[c.dataset.hq]; S.save();
    }));
  }

  /* ---------- hub ---------- */
  const SCREENS = [
    ['cond-endo', 'chart', 'cond_endo', 'cond_endo_s', false],
    ['cond-fibroids', 'flower', 'cond_fibroids', 'cond_fibroids_s', false],
    ['cond-pid', 'help', 'cond_pid', 'cond_pid_s', false],
    ['cond-anaemia', 'drop', 'cond_anaemia', 'cond_anaemia_s', true],
    ['cond-labs', 'file', 'cond_labs', 'cond_labs_s', true],
    ['cond-poi', 'moon', 'cond_poi', 'cond_poi_s', false],
    ['cond-hyst', 'users', 'cond_hyst', 'cond_hyst_s', false]
  ];
  function renderHub(v) {
    v.innerHTML = S.backRow(t('cond_hub'), 'care', false) +
      intro({ en: 'Guides for women\'s health conditions other than PMOS: what they are, which tests help, what a gynaecologist may offer, and what is free. Not a diagnosis.', hi: 'PMOS के अलावा महिलाओं की दूसरी बीमारियों की गाइड: ये क्या हैं, कौन सी जाँच काम आती है, स्त्री रोग विशेषज्ञ क्या इलाज दे सकती हैं, और क्या मुफ़्त है। यह diagnosis नहीं है।' }) +
      '<div class="list">' + SCREENS.map((x) => linkItem(x[0], x[1], t(x[2]), t(x[3]), x[4] && S.flags.proto ? t('gated_short') : '')).join('') +
      /* Version 39.1: Pattern check is gone; the PMOS self-check (Should I get this checked?) asks its questions */
      (S.canSave() && S.toolShown && S.toolShown('selfcheck') ? linkItem('selfcheck', 'check', t('selfcheck_h'), t('selfcheck_tile_s'), S.flags.proto ? t('gated_short') : '') : '') + '</div>' +
      '<div class="card"><h3 style="color:var(--accent)">' + esc(t('see_doctor')) + '</h3>' +
      flagLead('urgent', t('call_now'), t('s1a')) + flag('urgent', TORSION) +
      flagLead('', t('today_if'), t('s2b')) +
      ul([{ en: 'Period pain that stops your day, or pain during sex: see a gynaecologist within a few weeks, with your pain diary.', hi: 'पीरियड का दर्द जो दिन रोक दे, या संबंध में दर्द: कुछ हफ़्तों में दर्द डायरी के साथ स्त्री रोग विशेषज्ञ को दिखाएँ।' }, { en: t('s3a'), hi: t('s3a') }]) +
      '<button type="button" class="btn sm primary" style="align-self:flex-start" data-ask="">' + S.I.steth + ' ' + esc(t('doc_b')) + '</button></div>' +
      '<h2>' + h({ en: 'Related', hi: 'इससे जुड़े पन्ने' }) + '</h2><div class="list">' +
      linkItem('periods-pain', 'heart', tx({ en: 'Period pain', hi: 'पीरियड का दर्द' }), tx({ en: 'What helps, and what is not normal', hi: 'किससे आराम मिलता है, और क्या सामान्य नहीं' })) +
      linkItem('intimate-sti', 'help', tx({ en: 'Infections passed on during sex', hi: 'संबंध से फैलने वाले संक्रमण' }), tx({ en: 'Free and private testing', hi: 'मुफ़्त और गोपनीय जाँच' })) +
      linkItem('meno-surgical', 'moon', tx({ en: 'Menopause after surgery', hi: 'ऑपरेशन के बाद मेनोपॉज़' }), tx({ en: 'When the womb or ovaries are removed', hi: 'जब बच्चेदानी या अंडाशय निकाले जाएँ' })) +
      linkItem('ttc-tests', 'flower', tx({ en: 'Tests when trying for a baby', hi: 'बच्चे की कोशिश में जाँचें' }), tx({ en: 'Tubes, hormones, semen test', hi: 'नलियाँ, हॉर्मोन, वीर्य की जाँच' })) + '</div>' +
      askCard({ en: 'A women\'s health condition', hi: 'महिलाओं की सेहत से जुड़ी बीमारी' }, { en: 'Not sure which page fits? A Qura doctor can listen, order tests and tell you where to go next. For hormone medicines or surgery, Qura refers you to an MBBS gynaecologist.', hi: 'समझ नहीं आ रहा कौन सा पन्ना देखें? Qura की डॉक्टर आपकी बात सुनेंगी, जाँच लिखेंगी और बताएँगी कि आगे कहाँ जाएँ। हॉर्मोन की दवा या सर्जरी के लिए Qura MBBS स्त्री रोग विशेषज्ञ के पास refer करता है।' });
    S.wire(v);
  }

  /* ---------- doctor summary ---------- */
  function summary() {
    const out = [];
    const ps = painStats();
    if (ps.total) {
      const L = [];
      if (ps.lastFull != null && !cycOff()) L.push(t('cond_pd_last') + ': ' + ps.lastFull);
      if (ps.cur != null && !cycOff()) L.push(t('cond_pd_cur') + ': ' + ps.cur);
      L.push(t('cond_pd_30') + ': ' + ps.last30);
      if (ps.worst != null) L.push(t('cond_worst') + ': ' + ps.worst + '/10');
      const pain = painR(); const zc = {}; ps.dates.slice(-30).forEach((d) => painEntry(pain[d]).z.forEach((k) => { zc[k] = (zc[k] || 0) + 1; }));
      const top = Object.keys(zc).sort((a, b) => zc[b] - zc[a]).slice(0, 3);
      if (top.length) L.push(t('cond_sum_where') + ': ' + top.map((k) => t('cond_z_' + k) + ' ×' + zc[k]).join(', '));
      out.push({ title: t('cond_endo'), lines: L });
    }
    const labs = labsR();
    if (labs.length) {
      const L = TESTS.map((T) => {
        const list = labs.filter((e) => e.k === T.k).sort((a, b) => (a.d < b.d ? -1 : 1)); if (!list.length) return null; const e = list[list.length - 1];
        return tx(T.name) + ': ' + num(e.v) + ' ' + e.u + ' (' + fmtL(e.d) + '; ' + t('cond_lab_range_lbl') + ' ' + rangeText(e) + ')' + (outside(e) ? ' · ' + t('cond_lab_out_short') : '');
      }).filter(Boolean);
      out.push({ title: t('cond_labs'), lines: L });
    }
    const pb = pbR(); const keys = Object.keys(pb).filter(okDate).sort().filter((k) => pbTotals(k).n > 0);
    if (keys.length) {
      const k = keys[keys.length - 1]; const tot = pbTotals(k);
      out.push({ title: t('cond_pb_h'), lines: [tf('cond_pb_from', { d: fmtL(k) }) + ': ' + t('cond_pb_total') + ' ' + tot.pts + ' (' + tot.n + ' ' + t('days') + ')', tf('cond_pb_clots', { s: tot.cs, l: tot.cl, f: tot.fl }), t('cond_sum_pbac')] });
    }
    return out;
  }

  /* ---------- sample women ---------- */
  function sample(personaId) {
    const td = S.toISO(S.today()); const d = S.data(ID);
    if (personaId === 'kamla') {
      const pain = {};
      const put = (date, p, z, ty) => { if (date <= td) pain[date] = { p: p, z: z, ty: ty, at: date }; };
      put('2026-07-08', 6, ['bc', 'lb'], ['period']); put('2026-07-09', 5, ['bc'], ['period']); put('2026-07-10', 3, ['bc'], ['period']); put('2026-07-21', 0, [], []);
      put('2026-09-20', 7, ['bc', 'lb', 'legs'], ['period']); put('2026-09-21', 6, ['bc', 'lb'], ['period']); put('2026-09-22', 4, ['bc'], ['period']);
      put('2026-10-02', 2, ['bladder'], ['pee']); put('2026-10-10', 0, [], []);
      d.pain = pain;
      d.labs = [
        { id: 'sk1', k: 'hb', v: 10.6, u: 'g/dL', d: '2026-04-10', lo: 12, hi: 15 },
        { id: 'sk2', k: 'hb', v: 9.8, u: 'g/dL', d: '2026-10-01', lo: 12, hi: 15 },
        { id: 'sk3', k: 'tsh', v: 2.4, u: 'mIU/L', d: '2026-10-01', lo: 0.4, hi: 4.5 }
      ].filter((e) => e.d <= td);
      const day = (l, hh, f, cs, cl, fl) => ({ l: l, h: hh, f: f, cs: cs, cl: cl, fl: fl });
      if ('2026-09-20' <= td) d.pbac = { '2026-09-20': { d: [day(0, 2, 3, 1, 0, 0), day(0, 2, 2, 2, 1, 1), day(1, 1, 1, 1, 0, 0), day(2, 0, 0, 0, 0, 0), day(2, 0, 0, 0, 0, 0), emptyDay(), emptyDay(), emptyDay(), emptyDay(), emptyDay()] } };
    } else if (personaId === 'priya') {
      d.labs = [
        { id: 'sp1', k: 'tsh', v: 2.6, u: 'mIU/L', d: '2026-03-02', lo: 0.27, hi: 4.2 },
        { id: 'sp2', k: 'tsh', v: 3.1, u: 'mIU/L', d: '2026-09-10', lo: 0.27, hi: 4.2 },
        { id: 'sp3', k: 'prl', v: 14.2, u: 'ng/mL', d: '2026-09-10', lo: 4.8, hi: 23.3 }
      ].filter((e) => e.d <= td);
    }
  }

  /* Version 39.1 (journey audit P1-06): her latest heavy-bleeding chart and its total, for What your diary shows (which uses
     the doctors' line of 100 for its own reviewed heavy-flow card). The chart stays hers, here. */
  S.cond = Object.assign(S.cond || {}, { /* Version 39.6: her latest Hb result, with the range printed on her report (read only) */
    hbLatest: () => { const l = labsR().filter((x) => x.k === 'hb' && /^\d{4}-\d{2}-\d{2}$/.test(x.d || '')).sort((a, b) => (a.d < b.d ? -1 : (a.d > b.d ? 1 : 0))); return l[l.length - 1] || null; },
    pbacLatest: () => { const ks = Object.keys(pbR()).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort(); const k = ks[ks.length - 1]; if (!k) return null; const tot = pbTotals(k); return tot.n ? { d: k, pts: tot.pts, n: tot.n } : null; } });
  S.register({
    id: ID,
    demoPersona: 'kamla',
    strings: {
      en: {
        cond_hub: 'Conditions beyond PMOS', cond_all: 'Other conditions', cond_hub_s: 'Endometriosis, fibroids, cysts, infections, TB, anaemia, early menopause, hysterectomy',
        cond_endo: 'Endometriosis pain diary', cond_endo_s: 'Log pain by day and place; see it by cycle day',
        cond_fibroids: 'Fibroids, cysts and polyps', cond_fibroids_s: 'What they are, tests, treatment, and when it is urgent',
        cond_pid: 'Pelvic infection and genital TB', cond_pid_s: 'Why early treatment protects your tubes; free TB care',
        cond_labs: 'My lab results', cond_labs_s: 'TSH, prolactin, Hb, sugar, vitamins: values and charts',
        cond_anaemia: 'Anaemia and heavy periods', cond_anaemia_s: 'Free iron tablets, iron-rich food, heavy-bleeding chart',
        cond_poi: 'Periods stopped before 40', cond_poi_s: 'Early menopause (POI): causes, tests, HRT, pregnancy',
        cond_hyst: 'Before a hysterectomy', cond_hyst_s: 'Second-opinion checklist and your rights',
        cond_pain_h: 'Log a day', cond_pain_q: 'How bad was the pain?', cond_p0: '0 = no pain', cond_p10: '10 = worst you can imagine', cond_pain_lbl: 'Pain',
        cond_where: 'Where was it? Tap the picture or the list', cond_type: 'When did it hurt?', cond_front: 'Front', cond_back: 'Back', cond_your_r: 'your right', cond_your_l: 'your left',
        cond_z_br: 'Lower belly, right', cond_z_bc: 'Lower belly, centre', cond_z_bl: 'Lower belly, left', cond_z_bladder: 'Bladder', cond_z_legs: 'Legs or thighs', cond_z_lb: 'Lower back', cond_z_bowel: 'Bowel or back passage', cond_z_deep: 'Deep inside, during sex',
        cond_t_period: 'With my period', cond_t_bowel: 'Passing stool', cond_t_pee: 'Peeing', cond_t_sex: 'During or after sex', cond_t_other: 'Other times',
        cond_cd: 'Cycle day {n}', cond_has_entry: 'You already logged this day. Change it and save again.', cond_pick_pain: 'Tap a number from 0 to 10 first.',
        cond_saved_d: 'Saved for {d}.', cond_deleted: 'Deleted.', cond_del: 'Delete', cond_del_day: 'Delete this day', cond_del_sure: 'Tap again to delete',
        cond_pain_note: 'Pain-free days are worth logging too: they show your doctor when the pain is not there.',
        cond_chart_h: 'Your pain by cycle day', cond_chart_p: 'Each dot is a day you logged: how high is the pain (0–10), across is the day of your cycle. Day 1 is the day your period started.',
        cond_leg0: 'This cycle', cond_leg1: 'Last cycle', cond_leg2: 'Cycle before', cond_axis: 'Across: cycle day. Up: pain 0–10.',
        cond_none_cycles: 'Nothing logged in your last 3 cycles yet.', cond_beyond: '{n} logged days fall after day 60 of a cycle and are not drawn.',
        cond_no_starts: 'Log your period start dates in the diary so your pain lines up by cycle day.',
        cond_counts_h: 'Your counts', cond_pd_last: 'Pain days in your last full cycle', cond_pd_cur: 'Pain days so far this cycle', cond_pd_30: 'Pain days in the last 30 days', cond_worst: 'Highest pain logged', cond_severe: 'Days rated 7 or more',
        cond_noscore: 'Counts of your own entries. No score, no diagnosis.', cond_recent_h: 'Recent entries', cond_sum_where: 'Most logged places (last 30 entries)', cond_sum_pbac: 'Pads only (PBAC, Higham 1990). A total of 100 or more is used as a sign of heavy periods.',
        cond_lab_add: 'Add a result', cond_lab_test: 'Test', cond_lab_value: 'Value', cond_lab_unit: 'Unit', cond_lab_date: 'Date on the report',
        cond_lab_range_h: 'Reference range from your report', cond_lab_lo: 'Lowest', cond_lab_hi: 'Highest',
        cond_lab_range_p: 'Copy it exactly as printed, in the same unit as the value. If the report gives only one limit, leave the other box empty.',
        cond_lab_rule: 'The only thing this page tells you is when a value is outside the range you entered from your report. What a result means is for your doctor.',
        cond_lab_out: 'Outside the range you entered from your report. Show your doctor.', cond_lab_out_short: 'outside the range entered from the report',
        cond_lab_norange: 'not entered', cond_lab_range_lbl: 'Report range', cond_lab_none: 'No results saved yet. Add one from your latest report.',
        cond_lab_err: 'Enter the value as a number, for example 9.8.', cond_lab_err_r: 'Enter the range as numbers, or leave the box empty.', cond_lab_err_o: 'The lowest value should be smaller than the highest.',
        cond_lab_units_note: 'Results in a different unit are listed below but not drawn.',
        cond_lab_band: 'Green band: the range on your latest report ({r}).', cond_lab_gold: 'Gold dots are outside the range you entered.',
        cond_pb_h: 'Heavy-bleeding chart', cond_pb_p: 'During your period, each time you change, tap the pad that looks most like yours. Note clots and flooding too. Doctors use this chart, called PBAC, to judge how heavy a period is.',
        cond_pb_period: 'Which period?', cond_pb_from: 'Period from {d}', cond_pb_other: 'Or pick its first day', cond_pb_whichday: 'Which day of the period?', cond_pb_dayn: 'Day {n}',
        cond_pb_light: 'Lightly stained pad', cond_pb_half: 'Half-soaked pad', cond_pb_full: 'Fully soaked pad', cond_pb_cs: 'Small clot', cond_pb_cl: 'Large clot, ₹10 coin or bigger', cond_pb_fl: 'Flooding or leaking through',
        cond_pb_pts1: '1 point each', cond_pb_pts5: '5 points each', cond_pb_pts20: '20 points each', cond_pb_noted: 'Noted for your doctor', cond_less: 'One less', cond_more: 'One more',
        cond_pb_total: 'Total for this period', cond_pb_clots: 'Clots: {s} small, {l} large · Flooding: {f}',
        cond_pb_line: 'Doctors use a total of 100 or more as a sign of heavy periods. Take this chart to your doctor.',
        cond_pb_only: 'The total counts pads only, as in the original chart (Higham, 1990). It was made for disposable pads; if you use cloth, a cup or tampons, tell your doctor.'
      },
      hi: {
        cond_hub: 'PMOS के अलावा दूसरी बीमारियाँ', cond_all: 'दूसरी बीमारियाँ', cond_hub_s: 'एंडोमेट्रियोसिस, फाइब्रॉइड, सिस्ट, संक्रमण, टीबी, ख़ून की कमी, जल्दी मेनोपॉज़, बच्चेदानी का ऑपरेशन',
        cond_endo: 'एंडोमेट्रियोसिस दर्द डायरी', cond_endo_s: 'दिन और जगह के हिसाब से दर्द लिखें; चक्र के दिन के हिसाब से देखें',
        cond_fibroids: 'फाइब्रॉइड, सिस्ट और पॉलिप', cond_fibroids_s: 'ये क्या हैं, जाँच, इलाज, और कब तुरंत जाना है',
        cond_pid: 'पेडू का संक्रमण और जननांग टीबी', cond_pid_s: 'जल्दी इलाज नलियों को कैसे बचाता है; टीबी का मुफ़्त इलाज',
        cond_labs: 'मेरी lab reports', cond_labs_s: 'TSH, prolactin, Hb, sugar, विटामिन: नतीजे और चार्ट',
        cond_anaemia: 'ख़ून की कमी और भारी पीरियड', cond_anaemia_s: 'मुफ़्त आयरन गोली, आयरन वाला खाना, ब्लीडिंग चार्ट',
        cond_poi: '40 से पहले पीरियड बंद', cond_poi_s: 'जल्दी मेनोपॉज़ (POI): कारण, जाँच, HRT, गर्भ',
        cond_hyst: 'बच्चेदानी निकालने से पहले', cond_hyst_s: 'दूसरी राय के सवाल और आपके अधिकार',
        cond_pain_h: 'एक दिन दर्ज करें', cond_pain_q: 'दर्द कितना था?', cond_p0: '0 = कोई दर्द नहीं', cond_p10: '10 = सबसे ज़्यादा जो सोच सकें', cond_pain_lbl: 'दर्द',
        cond_where: 'कहाँ था? तस्वीर या सूची पर टैप करें', cond_type: 'दर्द कब हुआ?', cond_front: 'सामने', cond_back: 'पीछे', cond_your_r: 'आपका दायाँ', cond_your_l: 'आपका बायाँ',
        cond_z_br: 'पेट का निचला हिस्सा, दायाँ', cond_z_bc: 'पेट का निचला हिस्सा, बीच', cond_z_bl: 'पेट का निचला हिस्सा, बायाँ', cond_z_bladder: 'पेशाब की थैली', cond_z_legs: 'पैर या जाँघें', cond_z_lb: 'कमर', cond_z_bowel: 'आँत या मलद्वार', cond_z_deep: 'अंदर गहराई में, संबंध के समय',
        cond_t_period: 'पीरियड के साथ', cond_t_bowel: 'पखाना करते समय', cond_t_pee: 'पेशाब करते समय', cond_t_sex: 'संबंध के समय या बाद', cond_t_other: 'दूसरे समय',
        cond_cd: 'चक्र का दिन {n}', cond_has_entry: 'यह दिन पहले से दर्ज है। बदलकर फिर से सेव करें।', cond_pick_pain: 'पहले 0 से 10 में से एक नंबर पर टैप करें।',
        cond_saved_d: '{d} के लिए सेव हो गया।', cond_deleted: 'हटा दिया।', cond_del: 'हटाएँ', cond_del_day: 'यह दिन हटाएँ', cond_del_sure: 'हटाने के लिए फिर टैप करें',
        cond_pain_note: 'बिना दर्द वाले दिन भी दर्ज करें: इससे डॉक्टर को दिखता है कि दर्द कब नहीं होता।',
        cond_chart_h: 'चक्र के दिन के हिसाब से आपका दर्द', cond_chart_p: 'हर बिंदु एक दर्ज किया दिन है: ऊँचाई दर्द (0–10) है, और आड़ी लाइन पर चक्र का दिन। दिन 1 वह दिन है जब पीरियड शुरू हुआ।',
        cond_leg0: 'यह चक्र', cond_leg1: 'पिछला चक्र', cond_leg2: 'उससे पहले का', cond_axis: 'आड़ा: चक्र का दिन। ऊपर: दर्द 0–10।',
        cond_none_cycles: 'पिछले 3 चक्रों में अभी कुछ दर्ज नहीं।', cond_beyond: 'दर्ज किए गए {n} दिन चक्र के 60वें दिन के बाद के हैं, वे यहाँ नहीं दिखते।',
        cond_no_starts: 'डायरी में पीरियड शुरू होने की तारीख़ें दर्ज करें, ताकि दर्द चक्र के दिन के हिसाब से दिखे।',
        cond_counts_h: 'आपकी गिनती', cond_pd_last: 'पिछले पूरे चक्र में दर्द वाले दिन', cond_pd_cur: 'इस चक्र में अब तक दर्द वाले दिन', cond_pd_30: 'पिछले 30 दिनों में दर्द वाले दिन', cond_worst: 'सबसे ज़्यादा दर्ज दर्द', cond_severe: '7 या ज़्यादा दर्द वाले दिन',
        cond_noscore: 'यह आपकी अपनी entries की गिनती है। कोई score नहीं, कोई diagnosis नहीं।', cond_recent_h: 'हाल की entries', cond_sum_where: 'सबसे ज़्यादा दर्ज जगहें (पिछली 30 entries)', cond_sum_pbac: 'सिर्फ़ pad गिने गए (PBAC, Higham 1990)। कुल 100 या ज़्यादा को भारी पीरियड का संकेत माना जाता है।',
        cond_lab_add: 'नतीजा जोड़ें', cond_lab_test: 'जाँच', cond_lab_value: 'नतीजा', cond_lab_unit: 'इकाई (unit)', cond_lab_date: 'report की तारीख़',
        cond_lab_range_h: 'आपकी report पर छपी reference range', cond_lab_lo: 'सबसे कम', cond_lab_hi: 'सबसे ज़्यादा',
        cond_lab_range_p: 'जैसा छपा है वैसा ही लिखें, नतीजे वाली इकाई में। report में एक ही सीमा हो तो दूसरा खाना खाली छोड़ दें।',
        cond_lab_rule: 'यह पन्ना सिर्फ़ इतना बताता है कि नतीजा आपकी report से भरी गई range के बाहर है या नहीं। नतीजे का मतलब आपकी डॉक्टर बताएँगी।',
        cond_lab_out: 'आपकी report से भरी range के बाहर है। डॉक्टर को दिखाएँ।', cond_lab_out_short: 'report से भरी range के बाहर',
        cond_lab_norange: 'नहीं भरी', cond_lab_range_lbl: 'report की range', cond_lab_none: 'अभी कोई नतीजा सेव नहीं है। अपनी हाल की report से एक जोड़ें।',
        cond_lab_err: 'नतीजा नंबर में लिखें, जैसे 9.8।', cond_lab_err_r: 'range नंबर में लिखें, या खाना खाली छोड़ें।', cond_lab_err_o: 'सबसे कम वाला नंबर सबसे ज़्यादा वाले से छोटा होना चाहिए।',
        cond_lab_units_note: 'दूसरी इकाई वाले नतीजे नीचे सूची में हैं, चार्ट में नहीं।',
        cond_lab_band: 'हरी पट्टी: आपकी सबसे नई report की range ({r})।', cond_lab_gold: 'सुनहरे बिंदु आपकी भरी range के बाहर हैं।',
        cond_pb_h: 'भारी ब्लीडिंग का चार्ट', cond_pb_p: 'पीरियड के दिनों में, हर बार pad बदलने पर उस तस्वीर पर टैप करें जो आपके pad जैसी दिखे। थक्के और अचानक बहाव भी लिखें। डॉक्टर इस चार्ट (PBAC) से अंदाज़ा लगाते हैं कि पीरियड कितना भारी है।',
        cond_pb_period: 'कौन सा पीरियड?', cond_pb_from: '{d} से शुरू पीरियड', cond_pb_other: 'या उसका पहला दिन चुनें', cond_pb_whichday: 'पीरियड का कौन सा दिन?', cond_pb_dayn: 'दिन {n}',
        cond_pb_light: 'हल्का दाग़ वाला pad', cond_pb_half: 'आधा भीगा pad', cond_pb_full: 'पूरा भीगा pad', cond_pb_cs: 'छोटा थक्का', cond_pb_cl: 'बड़ा थक्का, ₹10 के सिक्के जितना या बड़ा', cond_pb_fl: 'अचानक तेज़ बहाव या कपड़ों तक निकलना',
        cond_pb_pts1: 'हर एक का 1 अंक', cond_pb_pts5: 'हर एक के 5 अंक', cond_pb_pts20: 'हर एक के 20 अंक', cond_pb_noted: 'डॉक्टर के लिए लिखा गया', cond_less: 'एक कम', cond_more: 'एक ज़्यादा',
        cond_pb_total: 'इस पीरियड का कुल', cond_pb_clots: 'थक्के: {s} छोटे, {l} बड़े · तेज़ बहाव: {f}',
        cond_pb_line: 'डॉक्टर कुल 100 या ज़्यादा को भारी पीरियड का संकेत मानते हैं। यह चार्ट डॉक्टर को दिखाएँ।',
        cond_pb_only: 'कुल में सिर्फ़ pad गिने जाते हैं, जैसा मूल चार्ट (Higham, 1990) में था। यह चार्ट disposable pad के लिए बना था; कपड़ा, cup या tampon इस्तेमाल करती हैं तो डॉक्टर को बताएँ।'
      }
    },
    routes: {
      'cond': renderHub,
      'cond-endo': renderEndo,
      'cond-fibroids': renderFibroids,
      'cond-pid': renderPid,
      'cond-labs': renderLabs,
      'cond-anaemia': renderAnaemia,
      'cond-poi': renderPoi,
      'cond-hyst': renderHyst
    },
    testRoutes: [],
    open: ['cond', 'cond-endo', 'cond-fibroids', 'cond-pid', 'cond-labs', 'cond-anaemia', 'cond-poi', 'cond-hyst'],
    tiles: [
      { section: 'cond', route: 'cond', title: 'cond_all', sub: 'cond_hub_s', icon: 'care', order: 1, gated: false, keywords: 'conditions disease gynaecology बीमारी स्त्री रोग' },
      { section: 'cond', route: 'cond-endo', title: 'cond_endo', sub: 'cond_endo_s', icon: 'chart', order: 10, gated: false, keywords: 'endometriosis adenomyosis chocolate cyst pelvic pain painful periods pain during sex dysmenorrhoea एंडोमेट्रियोसिस दर्द डायरी पेडू' },
      { section: 'cond', route: 'cond-fibroids', title: 'cond_fibroids', sub: 'cond_fibroids_s', icon: 'flower', order: 20, gated: false, keywords: 'fibroid fibroids myoma cyst ovarian cyst polyp torsion ultrasound रसौली गाँठ फाइब्रॉइड सिस्ट पॉलिप' },
      { section: 'cond', route: 'cond-pid', title: 'cond_pid', sub: 'cond_pid_s', icon: 'help', order: 30, gated: false, keywords: 'pid pelvic infection genital tb tuberculosis infertility blocked tubes nikshay संक्रमण टीबी नलियाँ' },
      { section: 'cond', route: 'cond-anaemia', title: 'cond_anaemia', sub: 'cond_anaemia_s', icon: 'drop', order: 40, gated: true, keywords: 'anaemia anemia hb haemoglobin iron ifa pbac heavy periods heavy bleeding clots खून की कमी एनीमिया आयरन' },
      { section: 'cond', route: 'cond-labs', title: 'cond_labs', sub: 'cond_labs_s', icon: 'file', order: 50, gated: true, keywords: 'lab report results tsh thyroid t4 prolactin hb ferritin sugar hba1c vitamin d b12 रिपोर्ट जाँच थायरॉइड' },
      { section: 'cond', route: 'cond-poi', title: 'cond_poi', sub: 'cond_poi_s', icon: 'moon', order: 60, gated: false, keywords: 'poi premature ovarian insufficiency early menopause fsh hrt जल्दी मेनोपॉज़ पीरियड बंद' },
      { section: 'cond', route: 'cond-hyst', title: 'cond_hyst', sub: 'cond_hyst_s', icon: 'users', order: 70, gated: false, keywords: 'hysterectomy uterus removal second opinion womb operation pmjay बच्चेदानी ऑपरेशन दूसरी राय' }
    ],
    css: [
      '.cond-sub { margin-top: 4px; color: var(--accent); }',
      '.cond-err { color: var(--accent); font-weight: 600; }',
      '.cond-scale { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }',
      '.cond-scale .btn { min-height: 44px; padding: 0; font-size: 15px; }',
      '.cond-map { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }',
      '.cond-map figure { margin: 0; display: flex; flex-direction: column; align-items: stretch; gap: 4px; background: var(--card-2); border-radius: 14px; padding: 8px; min-width: 0; }',
      '.cond-map figcaption { font-size: 12px; font-weight: 600; color: var(--fg); text-align: center; }',
      '.cond-map svg { width: 100%; height: auto; max-height: 230px; display: block; }',
      '.cond-lr { font-size: 13px; color: var(--muted); }',
      '.cond-fig { fill: var(--card); stroke: var(--muted); stroke-width: 1.4; }',
      '.cond-zone { fill: var(--accent-soft); stroke: var(--accent-2); stroke-width: 1.5; cursor: pointer; }',
      '.cond-zone.on { fill: var(--accent); stroke: var(--accent); }',
      '.cond-zone:focus { outline: none; stroke: var(--fg); stroke-width: 2.5; }',
      '.spark.cond-chart { height: auto; aspect-ratio: 300 / 140; }',
      '.spark.cond-chart2 { height: auto; aspect-ratio: 300 / 112; }',
      '.spark.cond-chart3 { height: auto; aspect-ratio: 300 / 104; }',
      '.cond-dot.a0 { fill: var(--accent); } .cond-dot.a1 { fill: var(--accent-2); } .cond-dot.a2 { fill: var(--peach); stroke: var(--gold); stroke-width: 1; }',
      '.cond-sw { display: inline-block; width: 10px; height: 10px; border-radius: 5px; }',
      '.cond-sw.a0 { background: var(--accent-strong); } .cond-sw.a1 { background: var(--accent-2); } .cond-sw.a2 { background: var(--peach); border: 1px solid var(--gold); }',
      '.cond-legend { gap: 6px 14px; }',
      '.cond-tnum { font-variant-numeric: tabular-nums; }',
      '.cond-pnum { width: 32px; height: 32px; border-radius: 16px; background: var(--accent-soft); color: var(--accent); font-weight: 600; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.cond-band { fill: var(--ok-soft); stroke: var(--ok); stroke-width: 0.6; stroke-dasharray: 3 3; }',
      '.spark .cond-out { fill: var(--gold); }',
      '.spark text.cond-val { fill: var(--fg); font-weight: 600; }',
      '.cond-bandsw { display: inline-block; width: 14px; height: 8px; border-radius: 2px; background: var(--ok-soft); border: 1px dashed var(--ok); vertical-align: 0; }',
      '.cond-labrow { align-items: flex-start; }',
      '.cond-labrow .body { gap: 4px; }',
      '.cond-labrow .btn { flex-shrink: 0; }',
      '.item .body .pill.cond-flag { align-self: flex-start; font-size: 11px; color: var(--fg); white-space: normal; line-height: 1.35; }',
      '.cond-about { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; margin: 8px 0 0 0; font-size: 13px; }',
      '.cond-about dt { color: var(--fg); font-weight: 600; margin-top: 6px; }',
      '.cond-about dd { margin: 0; color: var(--muted); }',
      'details.card summary { font-size: 14px; color: var(--fg); }',
      '.cond-days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }',
      '.cond-days .cond-day { flex-direction: column; gap: 0; min-height: 50px; padding: 4px 2px; line-height: 1.2; font-size: 12px; }',
      '.cond-dpts { font-size: 11px; color: var(--muted); font-weight: 500; }',
      '.cond-ctrs { gap: 6px; }',
      '.cond-ctr { display: flex; align-items: center; gap: 8px; background: var(--card-2); border-radius: 14px; padding: 6px 8px; }',
      '.cond-ctr .lbl { flex: 1; min-width: 0; display: flex; flex-direction: column; color: var(--fg); font-size: 13px; line-height: 1.3; }',
      '.cond-ctr .lbl strong { font-weight: 600; }',
      '.cond-ctr .btn { width: 44px; min-height: 44px; padding: 0; font-size: 20px; flex-shrink: 0; }',
      '.cond-ctr .n { width: 24px; text-align: center; font-weight: 600; color: var(--fg); flex-shrink: 0; }',
      '.cond-ico { width: 28px; flex-shrink: 0; display: flex; justify-content: center; }',
      '.cond-pad { width: 22px; height: 30px; display: block; }',
      '.cond-pad-o { fill: var(--card); stroke: var(--muted); stroke-width: 1.4; }',
      '.cond-stain { fill: var(--accent); }',
      '.cond-fl { color: var(--accent); display: flex; align-items: center; }',
      '.cond-fl svg { width: 22px; height: 22px; }',
      '.cond-bar { fill: var(--accent); }',
      '.cond-pbsum { gap: 8px; }',
      '.cond-total { font-family: var(--font-display); font-size: 44px; font-weight: 600; line-height: 1; color: var(--fg); }',
      'body.hi .cond-total { font-family: var(--font-hi); font-size: 38px; }'
    ].join('\n'),
    summary: summary,
    sample: sample,
    afterRender: (v, route) => {
      if (route !== 'cond-endo') mem.endo = null;
      if (route !== 'cond-labs') mem.lab = null;
      if (route !== 'cond-anaemia') mem.pb = null;
    }
  });
})(window.Saathi);
