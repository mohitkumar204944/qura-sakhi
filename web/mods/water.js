/* Water (Version 39.80; Mohit, 7 Nov: "we dont have water intake in plans and reminder and its an important part", then
   "Build W1 to W7" on docs/water-advice-2026-11-07.md; contract: MODULE_API section 123).
   The plan's own water step lives in mods/plan.js (the 'water' adapter). This module holds:
   - the Water page (route 'water'): how much for her (the advice's section 2a, by her stage), what a glass is, what counts,
     and her water reminder (W6): off until she turns it on, then up to 3 rings a day at times she picks (8 am to 7 pm only, so
     never in the hours before bed), quiet for the rest of the day once she ticks water in her plan;
   - one "Sakhi says" card at a time (homeTop, so her plan's first 3 days keep it back):
     - the hot months' card (W4): April to June, once a season, until "Got it" (NCDC's heat advice, the ambulance button);
     - the line her monthly check-in calls for (W3), for 7 days after it: constipation in a pregnancy whose plan has no water
       step, leaking urine after a birth or in midlife without the pelvic floor plan (that plan teaches water already). Never
       in discreet mode or on a shared phone;
   - S.water: hot(iso), done(iso, on), amount().
   The words are the app's existing lines wherever they exist (the pregnancy pages, the feeding page, the pelvic floor plan, the
   fasting page, the Learn library); the new lines wait for the doctors' read (docs/wording-review-v28.md, section 19.80). */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc;
  const L = (en, hi) => ({ en: en, hi: hi });
  const IDS = ['water-1', 'water-2', 'water-3'];
  const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  const D = () => { const d = S.data('water'); if (!Array.isArray(d.times) || d.times.length !== 3 || d.times.some((x) => TIMES.indexOf(x) < 0)) d.times = ['11:00', '14:00', '17:00']; return d; };
  const todayISO = () => S.toISO(S.today());
  const disc = () => !!(S.state.settings || {}).discreet;
  const shared = () => !!(S.state.settings || {}).shared;
  const sit = () => S.state.situation || {};
  /* April to June (the advice's decision D3, the simplest: everywhere) */
  const hot = (iso) => { const m = (iso ? S.fromISO(iso) : S.today()).getMonth(); return m >= 3 && m <= 5; };
  const born = () => { const s0 = sit(); return !S.cycle.isPregnant() && !!s0.deliveredOn && !s0.babyOff && S.diffDays(S.fromISO(s0.deliveredOn), S.today()) <= 365; };
  const feeding = () => born() && !!sit().breastfeeding;
  const babySmall = () => feeding() && S.diffDays(S.fromISO(sit().deliveredOn), S.today()) < 183;
  const pfLeads = () => !!(S.plan && S.plan.pelvic && S.plan.pelvic.on && S.plan.pelvic.on() && S.plan.pelvic.track && S.plan.pelvic.track());
  const old = () => { const a = S.cycle.ageYears ? S.cycle.ageYears() : null; return a != null && a >= 60; };
  const planWater = () => !!(S.plan && S.plan.waterToday && S.plan.waterToday());
  const waterStep = () => !!(S.plan && S.plan.waterStep && S.plan.waterStep());   /* her water step itself today, so a tick can quiet the rings (the phone test) */
  /* how much for her (the advice's section 2a): a shared phone or discreet mode gets the plain amount, never her stage */
  const amount = () => { if (disc() || shared()) return 'gen'; if (S.cycle.isPregnant()) return 'preg'; if (feeding()) return 'bf'; if (pfLeads()) return 'pf'; if (old()) return 'old'; return 'gen'; };
  const remsOn = () => IDS.some((id) => { const r = S.reminders.get(id); return !!r && r.on !== false; });
  /* her tick on the plan's water step (Today or the check-in): the rest of the day's water rings stay quiet; an undo brings them back */
  const done = (iso, on) => { let ch = false; IDS.forEach((id) => { const r = S.reminders.get(id); if (!r) return; if (on && r.doneOn !== iso) { r.doneOn = iso; ch = true; } else if (!on && r.doneOn === iso) { delete r.doneOn; ch = true; } }); if (ch) S.saveQuiet(); };
  const remRec = (i) => ({ id: IDS[i], mod: 'water', kind: 'water', title: L('Water: a glass now', 'पानी: अभी एक गिलास'), start: todayISO(), every: 1, weekdays: null, dates: null, time: D().times[i], on: true });

  /* ---------- the Water page ---------- */
  const li = (k) => '<li>' + esc(t(k)) + '</li>';
  function render(v) {
    const can = S.canSave(); const k = amount(); const on = can && remsOn();
    const lines = ['water_glass', 'water_count', 'water_pale', 'water_hotd', 'water_toilet'].concat(k === 'pf' ? ['water_bed'] : [], k === 'bf' && babySmall() ? ['water_baby'] : [], ['water_lim']);
    const times = on ? '<div class="wt-times">' + [0, 1, 2].map((i) => '<label class="small" for="wt-t' + i + '">' + esc(tf('water_rem_n', { n: i + 1 })) + '</label><select id="wt-t' + i + '" data-wt-t="' + i + '">' + TIMES.map((x) => '<option value="' + x + '"' + (D().times[i] === x ? ' selected' : '') + '>' + esc(clock(x)) + '</option>').join('') + '</select>').join('') + '</div>' : '';
    v.innerHTML = S.backRow(t('water_h'), 'home', false) +
      '<div class="card wt-amt"><span class="eyebrow">' + esc(t('water_amt_h')) + '</span><p class="wt-big">' + esc(t('water_amt_' + k)) + '</p><ul class="wt-ul">' + lines.map(li).join('') + '</ul></div>' +
      (can ? '<div class="card wt-rem"><label class="item wt-rem-row"><span class="body"><strong>' + esc(t('water_rem_h')) + '</strong><span>' + esc(t('water_rem_s') + (waterStep() ? ' ' + t('water_rem_q') : '')) + '</span></span><input type="checkbox" id="wt-rem" aria-label="' + esc(t('water_rem_h')) + '"' + (on ? ' checked' : '') + '></label>' + times + '</div>' : S.needDiary());
    S.wire(v);
    const sw = v.querySelector('#wt-rem');
    if (sw) sw.addEventListener('change', () => {
      if (sw.checked) { IDS.forEach((id, i) => S.reminders.upsert(remRec(i), i === 0 ? undefined : { quiet: true })); if (S.plan && S.plan.waterDone && S.plan.waterDone()) done(todayISO(), true);   /* ticked already today: today stays quiet */ S.toast(t('water_rem_on')); }
      else { IDS.forEach((id) => S.reminders.remove(id)); S.toast(t('water_rem_off')); }
      S.save(); render(v);
    });
    v.querySelectorAll('[data-wt-t]').forEach((sel) => sel.addEventListener('change', () => { const i = +sel.dataset.wtT; if (TIMES.indexOf(sel.value) < 0) return; D().times[i] = sel.value; if (S.reminders.get(IDS[i])) S.reminders.upsert({ id: IDS[i], time: sel.value }, { quiet: true }); S.save(); S.toast(tf('water_time_ok', { t: clock(sel.value) })); }));
  }
  /* "11 am" / "सुबह 11 बजे" */
  const clock = (hm) => { const h = +hm.slice(0, 2); const h12 = (h % 12) || 12;
    if (S.state.lang === 'hi') return (h < 12 ? 'सुबह' : (h < 16 ? 'दोपहर' : 'शाम')) + ' ' + h12 + ' बजे';
    return h12 + (h >= 12 ? ' pm' : ' am'); };

  /* ---------- one "Sakhi says" card ---------- */
  const btns = (key) => '<div class="grid2 wt-btns"><button type="button" class="btn sm" data-go="water">' + esc(t('water_more')) + '</button><button type="button" class="btn sm primary" data-wt-ok="' + key + '">' + esc(t('water_ok')) + '</button></div>';
  /* W4: the hot months, once a season (NCDC's heat advice; the ambulance is core's, 102 in a pregnancy) */
  function heatCard() {
    if (!hot()) return ''; const yr = String(S.today().getFullYear()); if (D().heat === yr) return '';
    const q = disc() || shared(); const ks = ['water_hot_1'].concat(q ? [] : (S.cycle.isPregnant() ? ['water_hot_preg'] : (feeding() ? ['water_hot_bf'] : [])), !q && old() ? ['water_hot_old'] : [], ['water_hot_ors', 'water_hot_sun'], !q && babySmall() ? ['water_baby'] : []);
    return '<div class="card wt-card wt-hot" data-key="wt-hot" data-disc-ok="1"><h3>' + esc(t('water_hot_h')) + '</h3><ul class="wt-ul">' + ks.map(li).join('') + '</ul>' +
      '<div class="wt-sign"><p class="small"><strong>' + esc(t('water_hot_sign')) + '</strong></p>' + (q ? '<a class="btn danger sm xp-call" href="tel:108">' + esc(t('call_b')) + ' 108</a>' : (S.ambBtn ? S.ambBtn('danger sm') : '')) + '</div>' + btns('heat') + '</div>';
  }
  /* W3: what her monthly check-in says, for 7 days after it */
  function signCard() {
    if (disc() || shared()) return ''; const ci = (S.state.checkins || {})[S.monthKey(S.today())];
    if (!ci || !ci.at || S.diffDays(S.fromISO(ci.at), S.today()) > 6) return ''; const chips = ci.chips || [];
    if (S.cycle.isPregnant() && chips.indexOf('constip') >= 0 && !planWater() && D().con !== ci.at)
      return '<div class="card wt-card wt-con" data-key="wt-con"><h3>' + esc(t('water_con_h')) + '</h3><p class="small">' + esc(t('water_con_p')) + '</p>' + btns('con') + '</div>';
    if ((chips.indexOf('leak') >= 0 || chips.indexOf('urine') >= 0) && !S.cycle.isPregnant() && !pfLeads() && D().leak !== ci.at)
      return '<div class="card wt-card wt-leak" data-key="wt-leak"><h3>' + esc(t('water_leak_h')) + '</h3><p class="small">' + esc(t('water_leak_p')) + '</p><p class="small">' + esc(t('water_leak_p2')) + '</p>' + btns('leak') + '</div>';
    return '';
  }
  const homeTop = () => (S.canSave() && S.state.stage === 'app' ? heatCard() || signCard() : '');
  function afterHome(v) {
    (v || document).querySelectorAll('[data-wt-ok]').forEach((b) => b.addEventListener('click', () => {
      const d = D(); const k = b.dataset.wtOk; const ci = (S.state.checkins || {})[S.monthKey(S.today())] || {};
      if (k === 'heat') d.heat = String(S.today().getFullYear()); else if (k === 'con') d.con = ci.at || todayISO(); else if (k === 'leak') d.leak = ci.at || todayISO();
      S.save(); S.render();
    }));
  }

  S.water = { hot: hot, done: done, amount: amount };

  S.register({
    id: 'water',
    strings: {
      en: {
        water_h: 'Water', water_tile_s: 'How much to drink for you, and a reminder if you want one',
        water_amt_h: 'How much for you', water_amt_gen: 'About 8 glasses (2 litres) a day.',
        water_amt_preg: '8 to 12 glasses (2 to 3 litres) a day in your pregnancy: at least 2 litres.',
        water_amt_bf: 'About 10 to 12 glasses (2.5 to 3 litres) a day while you breastfeed, to your thirst. A glass at every feed covers most of it.',
        water_amt_pf: '6 to 8 glasses (1.5 to 2 litres) a day, a little at a time.',
        water_amt_old: 'About 8 glasses a day. From 60, thirst comes later, so drink at your times: at least 6 to 7 glasses, even when you are not thirsty.',
        water_glass: 'A glass is about 250 ml, a full steel glass.',
        water_count: 'Milk, chaas, nimbu pani, coconut water and tea count. Cold drinks and packaged juice don’t replace water.',
        water_pale: 'Pale yellow urine means you are drinking enough.', water_hotd: 'More on hot days, and before you feel thirsty.',
        water_toilet: 'Don’t drink less to go to the toilet less. It makes urine infections more likely.',
        water_bed: 'Drink less in the last 2 hours before bed if you wake at night to pass urine.',
        water_baby: 'Breast milk gives a baby all the water it needs for the first 6 months, even in summer. Feed more often when it is hot.',
        water_lim: 'If your doctor has told you to drink less (for your heart or kidneys), follow your doctor.',
        water_rem_h: 'Remind me to drink water', water_rem_s: 'Up to 3 a day, at the times you pick.', water_rem_q: 'Once you tick water on Today, the rest of the day stays quiet.',
        water_rem_n: 'Reminder {n}', water_rem_on: 'Water reminders are on.', water_rem_off: 'Water reminders are off.', water_time_ok: 'Changed to {t}.',
        water_hot_h: 'Hot days are here', water_hot_1: 'Drink water often, even before you feel thirsty.',
        water_hot_preg: 'In your pregnancy: 8 to 12 glasses, and more on the hottest days.', water_hot_bf: 'While you breastfeed: a glass at every feed, and more when it is hot.',
        water_hot_old: 'From 60, thirst comes later: drink at your times, not only when you are thirsty.',
        water_hot_ors: 'Keep ORS at home, and mix one packet exactly as written on it.', water_hot_sun: 'Stay out of the sun from 12 noon to 3 pm if you can, and rest in the shade.',
        water_hot_sign: 'Very hot skin, confusion, fainting, or no sweat in the heat: go to the nearest hospital now.',
        water_more: 'How much water for you', water_ok: 'Got it',
        water_con_h: 'For constipation', water_con_p: 'Drink over 2 litres a day. Eat fibre: whole grains, dal, vegetables and fruit. Walk every day.',
        water_leak_h: 'Leaking urine: keep drinking', water_leak_p: 'Many women drink less to leak less. But too little water makes urine strong, and strong urine makes the bladder more urgent.',
        water_leak_p2: 'Drink about 6 to 8 glasses a day, a little at a time, more in the heat. Pale yellow urine means you are drinking enough.'
      },
      hi: {
        water_h: 'पानी', water_tile_s: 'आपके लिए कितना पानी, और चाहें तो रिमाइंडर',
        water_amt_h: 'आपके लिए कितना', water_amt_gen: 'दिन में लगभग 8 गिलास (2 लीटर)।',
        water_amt_preg: 'गर्भ में दिन में 8 से 12 गिलास (2 से 3 लीटर): कम से कम 2 लीटर।',
        water_amt_bf: 'स्तनपान के दिनों में दिन में लगभग 10 से 12 गिलास (2.5 से 3 लीटर), प्यास के हिसाब से। हर फ़ीड पर एक गिलास से इसका ज़्यादातर हिस्सा हो जाता है।',
        water_amt_pf: 'दिन में 6 से 8 गिलास (1.5 से 2 लीटर), थोड़ा-थोड़ा करके।',
        water_amt_old: 'दिन में लगभग 8 गिलास। 60 के बाद प्यास देर से लगती है, इसलिए अपने तय समय पर पिएँ: कम से कम 6 से 7 गिलास, प्यास न लगे तब भी।',
        water_glass: 'एक गिलास लगभग 250 ml का होता है, यानी स्टील का एक भरा गिलास।',
        water_count: 'दूध, छाछ, नींबू पानी, नारियल पानी और चाय भी गिने जाते हैं। कोल्ड ड्रिंक और पैकेट वाला जूस पानी की जगह नहीं लेते।',
        water_pale: 'हल्का पीला पेशाब बताता है कि आप काफ़ी पी रही हैं।', water_hotd: 'गर्मी के दिनों में ज़्यादा, और प्यास लगने से पहले।',
        water_toilet: 'शौचालय कम जाना पड़े, इसलिए पानी कम न पिएँ। इससे पेशाब के इन्फ़ेक्शन की संभावना बढ़ती है।',
        water_bed: 'अगर रात में पेशाब के लिए उठती हैं, तो सोने से पहले के आख़िरी 2 घंटों में कम पिएँ।',
        water_baby: 'पहले 6 महीने माँ का दूध बच्चे को ज़रूरत का सारा पानी देता है, गर्मी में भी। गर्मी हो तो ज़्यादा बार दूध पिलाएँ।',
        water_lim: 'अगर डॉक्टर ने कम पीने को कहा है (दिल या गुर्दे की वजह से), तो डॉक्टर की बात मानें।',
        water_rem_h: 'मुझे पानी पीने की याद दिलाएँ', water_rem_s: 'दिन में 3 बार तक, आपके चुने समय पर।', water_rem_q: 'आज पर पानी पर टिक करते ही, बाक़ी दिन कोई रिमाइंडर नहीं बजेगा।',
        water_rem_n: 'रिमाइंडर {n}', water_rem_on: 'पानी के रिमाइंडर चालू हैं।', water_rem_off: 'पानी के रिमाइंडर बंद हैं।', water_time_ok: '{t} कर दिया।',
        water_hot_h: 'गर्मी के दिन आ गए हैं', water_hot_1: 'बार-बार पानी पिएँ, प्यास लगने से पहले भी।',
        water_hot_preg: 'गर्भ में: 8 से 12 गिलास, और सबसे गर्म दिनों में उससे ज़्यादा।', water_hot_bf: 'स्तनपान के दिनों में: हर फ़ीड पर एक गिलास, और गर्मी में उससे ज़्यादा।',
        water_hot_old: '60 के बाद प्यास देर से लगती है: सिर्फ़ प्यास लगने पर नहीं, अपने तय समय पर पिएँ।',
        water_hot_ors: 'घर में ORS रखें, और एक पैकेट ठीक वैसे घोलें जैसा उस पर लिखा है।', water_hot_sun: 'हो सके तो दोपहर 12 से 3 बजे तक धूप से बचें, और छाँव में आराम करें।',
        water_hot_sign: 'गर्मी में त्वचा बहुत गर्म हो, उलझन हो, बेहोशी हो, या पसीना न आए: अभी सबसे पास के अस्पताल जाएँ।',
        water_more: 'आपके लिए कितना पानी', water_ok: 'ठीक है',
        water_con_h: 'क़ब्ज़ के लिए', water_con_p: 'रोज़ 2 लीटर से ज़्यादा पानी पिएँ। फ़ाइबर वाला खाना खाएँ: साबुत अनाज, दाल, सब्ज़ियाँ और फल। रोज़ टहलें।',
        water_leak_h: 'पेशाब लीक होना: पानी पीती रहें', water_leak_p: 'कई महिलाएँ कम लीक के लिए कम पानी पीती हैं। पर बहुत कम पानी से पेशाब गाढ़ा होता है, और गाढ़ा पेशाब मूत्राशय में और जल्दी हाजत पैदा करता है।',
        water_leak_p2: 'दिन में लगभग 6 से 8 गिलास पिएँ, थोड़ा-थोड़ा करके, गर्मी में ज़्यादा। हल्का पीला पेशाब बताता है कि आप काफ़ी पी रही हैं।'
      }
    },
    routes: { water: render },
    tiles: [{ section: 'tools', route: 'water', title: 'water_h', sub: 'water_tile_s', icon: 'drop', order: 24, gated: false, keywords: 'water drink drinking glass glasses litre litres hydration thirst thirsty dehydration heat summer ors pani paani nimbu pani coconut water पानी गिलास लीटर प्यास गर्मी पीना' }],
    homeTop: homeTop,
    afterHome: afterHome,
    css: '.wt-big { margin: 4px 0 6px; font-size: 18px; font-weight: 600; color: var(--fg); line-height: 1.35; } .wt-ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; color: var(--fg); }' +
      '.wt-rem-row { border: 0; padding: 0; } .wt-times { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; align-items: center; margin-top: 10px; } .wt-times select { min-height: 48px; }' +
      '.wt-card h3 { margin: 0; } .wt-sign { display: grid; gap: 6px; margin-top: 8px; } .wt-sign .btn { justify-self: start; } .wt-btns { margin-top: 10px; }'
  });
})(window.Saathi);
