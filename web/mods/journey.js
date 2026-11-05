/* 21 days of small steps: one tiny, everyday step a day for PMOS or for more iron. Missed days are never counted against her;
   she just does today's. A petal each day she marks done, an optional 9 am reminder, a Home card for today's step, and at the end
   a doctor for anyone who wants a plan made for her. Lifestyle steps only: no doses, no herbs, nothing that replaces her doctor. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const LD = (en, hi, den, dhi) => ({ en: en, hi: hi, doc: { en: den, hi: dhi } });   /* Version 39.29: with its doctor-route words */
  const D = () => { const d = S.data('journey'); d.done = d.done || {}; d.finished = d.finished || {}; return d; };
  const J = {
    pmos: { hue: 'purple', icon: 'leaf', ask: 'PMOS', days: [
      [L('A 10-minute walk', '10 मिनट की सैर'), L('Walk for 10 minutes today, after a meal if you can.', 'आज 10 मिनट टहलें, हो सके तो खाने के बाद।')],
      [L('Protein at breakfast', 'नाश्ते में प्रोटीन'), L('Add dal, besan cheela, eggs, paneer or sprouts to your breakfast.', 'नाश्ते में दाल, बेसन चीला, अंडे, पनीर या अंकुरित अनाज जोड़ें।')],
      [L('Water first', 'पहले पानी'), L('Start the day with a glass of water, before tea.', 'दिन की शुरुआत चाय से पहले एक गिलास पानी से करें।')],
      [L('One whole-grain swap', 'एक बार साबुत अनाज'), L('Swap white rice or maida for millets, brown rice or whole wheat once today.', 'आज एक बार सफ़ेद चावल या मैदे की जगह मिलेट, ब्राउन राइस या गेहूँ का आटा लें।')],
      [L('Note today', 'आज का नोट'), L('Log how you feel today in your diary. Patterns show up over time.', 'आज कैसा लगा, डायरी में दर्ज करें। समय के साथ पैटर्न दिखते हैं।'), 'diary'],
      [L('A 15-minute walk', '15 मिनट की सैर'), L('Make today’s walk 15 minutes.', 'आज की सैर 15 मिनट की करें।')],
      [L('In bed by 11', '11 बजे तक बिस्तर पर'), L('Aim to be in bed by 11 tonight, with the phone away.', 'आज रात 11 बजे तक बिस्तर पर जाने की कोशिश करें, फ़ोन दूर रखकर।')],
      [L('Half the plate vegetables', 'आधी थाली सब्ज़ी'), L('Fill half your lunch plate with vegetables or salad.', 'दोपहर की थाली का आधा हिस्सा सब्ज़ी या सलाद से भरें।')],
      [L('A sweet swap', 'मीठे की जगह फल'), L('Have a fruit instead of a sweet or a biscuit once today.', 'आज एक बार मिठाई या बिस्किट की जगह फल लें।')],
      [L('A walk after dinner', 'रात के खाने के बाद सैर'), L('A 10-minute walk after dinner can help your sugar settle.', 'रात के खाने के बाद 10 मिनट की सैर sugar को ठीक रखने में मदद कर सकती है।')],
      [L('Three calm minutes', 'तीन शांत मिनट'), L('Try the 3-minute calm routine in Feel better now.', '“अभी थोड़ा आराम” में 3 मिनट का शांत तरीका आज़माएँ।'), 'relief-calm'],
      [L('A 20-minute walk', '20 मिनट की सैर'), L('Make today’s walk 20 minutes.', 'आज की सैर 20 मिनट की करें।')],
      [L('Read one answer', 'एक जवाब पढ़ें'), L('Read one short answer about PMOS.', 'PMOS के बारे में एक छोटा जवाब पढ़ें।'), 'a-pmos.what-pmos-is'],
      [L('Roasted, not fried', 'तला नहीं, भुना'), L('Choose roasted or steamed over fried for one meal.', 'एक खाने में तले की जगह भुना या भाप में पका चुनें।')],
      [L('Less sugar in tea', 'चाय में कम चीनी'), L('Try one cup of tea with less sugar, or none.', 'एक कप चाय कम चीनी या बिना चीनी के पीकर देखें।')],
      [L('Strength at home', 'घर पर ताक़त'), L('Do 10 squats or 10 push-ups against a wall. Go slowly.', '10 उठक-बैठक (squats) या दीवार से 10 पुश-अप करें। धीरे-धीरे।'), 'plan-r-strength'],   /* Version 39.67 (the 3D moves audit): both moves in 3D in Strength at home */
      [L('Know the tests', 'जाँचें जानें'), L('Read which tests doctors do for PMOS, and why.', 'पढ़ें कि PMOS के लिए डॉक्टर कौन सी जाँचें करते हैं, और क्यों।'), 'cond-labs'],
      [L('A 25-minute walk', '25 मिनट की सैर'), L('Walk for 25 minutes today, or take two short walks.', 'आज 25 मिनट टहलें, या दो छोटी सैर करें।')],
      [L('Dal or chana at dinner', 'रात को दाल या चना'), L('Add a bowl of dal or chana to dinner.', 'रात के खाने में एक कटोरी दाल या चना जोड़ें।')],
      [L('This month', 'इस महीने'), L('Note this month’s signs, if you haven’t yet.', 'इस महीने के संकेत दर्ज कर लें, अगर अभी तक नहीं किए।'), 'checkin'],
      [L('Look back', 'पीछे देखें'), L('Which steps helped most? Keep two of them going.', 'किन क़दमों से सबसे ज़्यादा मदद मिली? उनमें से दो जारी रखें।')]] },
    iron: { hue: 'rose', icon: 'drop', ask: 'Anaemia and iron', days: [
      [L('Your iron tablet', 'आपकी आयरन की गोली'), LD('If the ASHA or a doctor gave you iron tablets, take them today the way they told you, with water or nimbu pani.', 'अगर ASHA या डॉक्टर ने आयरन की गोलियाँ दी हैं, तो आज उनके बताए तरीके से लें, पानी या नींबू पानी के साथ।', 'If your doctor gave you iron tablets, take them today the way they told you, with water or nimbu pani.', 'अगर डॉक्टर ने आयरन की गोलियाँ दी हैं, तो आज उनके बताए तरीके से लें, पानी या नींबू पानी के साथ।'), 'iron'],
      [L('Tea away from meals', 'खाने से दूर चाय'), L('Keep tea and coffee an hour away from your meals today.', 'आज चाय और कॉफ़ी खाने से एक घंटा दूर रखें।')],
      [L('Lemon on your dal', 'दाल पर नींबू'), L('Squeeze lemon on your dal or sabzi. Vitamin C helps your body take in iron.', 'दाल या सब्ज़ी पर नींबू निचोड़ें। विटामिन C शरीर को आयरन लेने में मदद करता है।')],
      [L('Green leaves', 'हरी पत्तियाँ'), L('Add a green leafy sabzi today: palak, methi, bathua or sarson.', 'आज हरी पत्तेदार सब्ज़ी खाएँ: पालक, मेथी, बथुआ या सरसों।')],
      [L('Chana for a snack', 'नाश्ते में चना'), L('Have roasted chana or a chana salad as a snack.', 'नाश्ते में भुने चने या चना सलाद लें।')],
      [L('Amla, guava or orange', 'आँवला, अमरूद या संतरा'), L('Eat an amla, a guava or an orange today.', 'आज एक आँवला, अमरूद या संतरा खाएँ।')],
      [L('Rajma or lobia', 'राजमा या लोबिया'), L('Have rajma, lobia or a dal with dinner.', 'रात के खाने में राजमा, लोबिया या दाल लें।')],
      [L('A reminder for your tablet', 'गोली का रिमाइंडर'), L('Set a daily reminder so you don’t miss your tablet.', 'रोज़ का रिमाइंडर लगाएँ ताकि गोली न छूटे।'), 'iron'],
      [L('Eggs, fish or meat', 'अंडे, मछली या मीट'), L('If you eat them, have eggs, fish or meat once today.', 'अगर आप खाती हैं, तो आज एक बार अंडे, मछली या मीट लें।')],
      [L('Cook in iron', 'लोहे की कढ़ाई'), L('Cook a sabzi in an iron kadhai: a little iron passes into the food.', 'सब्ज़ी लोहे की कढ़ाई में पकाएँ: थोड़ा आयरन खाने में आ जाता है।')],
      [L('How do you feel?', 'कैसा लग रहा है?'), L('Note in your diary if you feel tired or breathless today.', 'आज थकान या साँस फूलना हो, तो डायरी में नोट करें।'), 'diary'],
      [L('Ragi or bajra', 'रागी या बाजरा'), L('Have ragi or bajra today: roti, porridge or dosa.', 'आज रागी या बाजरा लें: रोटी, दलिया या डोसा।')],
      [L('A handful of seeds', 'मुट्ठी भर बीज'), L('Snack on a few pumpkin or sesame (til) seeds.', 'नाश्ते में थोड़े कद्दू या तिल के बीज लें।')],
      [L('Milk at another time', 'दूध अलग समय पर'), L('Have milk or curd at a different time from your iron tablet.', 'दूध या दही आयरन की गोली से अलग समय पर लें।')],
      [L('Know your Hb', 'अपना Hb जानें'), LD('Ask for an Hb test at your next check-up. It is free at government health centres. If it is low, treating it usually takes a daily tablet for about 3 months, then a repeat test, so don’t stop when you feel better.', 'अगली जाँच में Hb टेस्ट माँगें। सरकारी स्वास्थ्य केंद्रों पर यह मुफ़्त है। कम निकले, तो इलाज में आम तौर पर लगभग 3 महीने रोज़ गोली और फिर दोबारा जाँच होती है, इसलिए बेहतर लगने पर गोली बंद न करें।', 'Ask your doctor for an Hb test at your next check-up. It is also free at government health centres. If it is low, treating it usually takes a daily tablet for about 3 months, then a repeat test, so don’t stop when you feel better.', 'अगली जाँच में डॉक्टर से Hb टेस्ट माँगें। सरकारी स्वास्थ्य केंद्रों पर यह मुफ़्त भी है। कम निकले, तो इलाज में आम तौर पर लगभग 3 महीने रोज़ गोली और फिर दोबारा जाँच होती है, इसलिए बेहतर लगने पर गोली बंद न करें।')],
      [L('If the tablet upsets you', 'अगर गोली से परेशानी हो'), LD('Black stools are normal with iron. If the tablet upsets your stomach, tell the ASHA or doctor instead of stopping.', 'आयरन की गोली से मल काला होना आम है। अगर पेट ख़राब हो, तो गोली बंद करने की जगह ASHA या डॉक्टर को बताएँ।', 'Black stools are normal with iron. If the tablet upsets your stomach, tell your doctor instead of stopping.', 'आयरन की गोली से मल काला होना आम है। अगर पेट ख़राब हो, तो गोली बंद करने की जगह डॉक्टर को बताएँ।')],
      [L('Ask about deworming', 'पेट के कीड़ों की दवा'), LD('Worms can cause anaemia. Ask the ASHA or doctor about a deworming tablet.', 'पेट के कीड़ों से ख़ून की कमी हो सकती है। ASHA या डॉक्टर से कीड़े की दवा के बारे में पूछें।', 'Worms can cause anaemia. Ask your doctor about a deworming tablet.', 'पेट के कीड़ों से ख़ून की कमी हो सकती है। डॉक्टर से कीड़े की दवा के बारे में पूछें।')],
      [L('Sprouts', 'अंकुरित अनाज'), L('Add sprouted moong or chana to a meal.', 'किसी खाने में अंकुरित मूँग या चना जोड़ें।')],
      [L('Tell your family', 'परिवार को बताएँ'), L('Send the iron card from Explain it to my family.', '“परिवार को समझाएँ” से आयरन वाला कार्ड भेजें।'), 'family'],
      [L('This month', 'इस महीने'), L('Note this month’s signs, if you haven’t yet.', 'इस महीने के संकेत दर्ज कर लें, अगर अभी तक नहीं किए।'), 'checkin'],
      [L('Look back', 'पीछे देखें'), L('Which iron foods did you like? Keep three of them in your week.', 'कौन से आयरन वाले खाने अच्छे लगे? उनमें से तीन हर हफ़्ते खाती रहें।')]] }
  };
  const IDS = Object.keys(J);
  const N = 21;
  /* Version 37: the companion plans reuse these doctor-reviewed steps (the heavy-periods plan's iron food of the day) */
  /* Version 38: for a vegetarian, or eggs but no meat, the iron day that asks for eggs, fish or meat (day 9) */
  const ALT = { iron: { 9: { veg: [L('Poha with lemon', 'नींबू वाला पोहा'), L('Have poha with a squeeze of lemon. Poha has iron, and lemon helps your body take it in.', 'पोहे पर नींबू निचोड़कर खाएँ। पोहे में आयरन होता है, और नींबू उसे शरीर में जाने में मदद करता है।')],
    egg: [L('Eggs today', 'आज अंडे'), L('Have eggs once today, boiled or as a bhurji with less oil.', 'आज एक बार अंडे खाएँ, उबले या कम तेल की भुर्जी।')] },
    /* review FOOD-01, FOOD-03 (wording review 17.1, for Dr. Megha): no milk, then no tea with the tablet instead; in pregnancy,
       sprouts cooked; for a Jain woman, an iron food she eats */
    14: { nomilk: [L('Tea at another time', 'चाय अलग समय पर'), L('Have tea or coffee at a different time from your iron tablet, not with it.', 'चाय या कॉफ़ी आयरन की गोली के साथ नहीं, अलग समय पर लें।')] },
    18: { preg: [L('Cooked sprouts', 'पके हुए अंकुरित अनाज'), L('Add boiled sprouted moong or chana to a meal, or cook them in a sabzi.', 'उबले हुए अंकुरित मूँग या चने किसी खाने में जोड़ें, या सब्ज़ी में पकाएँ।')],
      jain: [L('Dates or raisins', 'खजूर या किशमिश'), L('Have 2 or 3 dates or a few raisins as a snack.', 'नाश्ते में 2-3 खजूर या थोड़ी किशमिश लें।')] } } };
  S.journey = { step: (id, n, o) => { const j = J[id]; if (!j) return null; const i = (((n - 1) % j.days.length) + j.days.length) % j.days.length; const A = ALT[id] && ALT[id][i + 1]; const ak = A && o ? (['preg', 'jain', 'nomilk'].find((k) => o[k] && A[k]) || (o.food && A[o.food] ? o.food : null)) : null; const alt = ak ? A[ak] : null;   /* review FOOD-01: pregnancy, Jain and no milk first */ const x = alt || j.days[i]; return { t: tx(x[0]), p: tx(x[1]), go: (alt ? null : x[2]) || null }; }, len: (id) => (J[id] ? J[id].days.length : 0) };
  const todayISO = () => S.toISO(S.today());
  const dayN = (d) => Math.min(N, S.diffDays(S.fromISO(d.start), S.today()) + 1);
  const goOk = (r) => !!r && (['diary', 'checkin'].indexOf(r) >= 0 || r.indexOf('a-') === 0 || !!S.routeOwner(r))
    && !(r.indexOf('plan-r-') === 0 && (!(S.planOn && S.planOn()) || (S.cycle && S.cycle.isPregnant && S.cycle.isPregnant())));   /* Version 39.67: a routine only where the player shows it; in pregnancy Moves offers her own yoga */
  const doneCount = (d) => Object.keys(d.done).length;
  const finished = (d) => d.active && (doneCount(d) >= N || S.diffDays(S.fromISO(d.start), S.today()) >= N);
  /* Today's step done: on the journey page and in Home's Today */
  const markDone = (d, id) => { d.done[dayN(d)] = todayISO(); if (doneCount(d) >= N) { d.finished[id] = todayISO(); S.reminders.remove('journey'); } else if (S.reminders.get('journey')) S.reminders.upsert({ id: 'journey', doneOn: todayISO() }); S.save(); };
  function renderList(v) {
    const d = S.canSave() ? D() : { done: {}, finished: {} };
    v.innerHTML = S.backRow(t('journey_h'), 'care', false) + '<p class="small">' + esc(t('journey_p')) + '</p><div class="list">' +
      IDS.map((id) => '<button type="button" class="item" data-go="journey-' + id + '"><span class="ico-sm hue hue-' + J[id].hue + '">' + S.icon(J[id].icon) + '</span><span class="body"><strong>' + esc(t('journey_' + id + '_t')) + '</strong><span>' + esc(d.active === id ? tf('journey_day', { n: dayN(d) }) : (d.finished[id] ? t('journey_did') : t('journey_' + id + '_s'))) + '</span></span><span class="chev">' + S.I.chev + '</span></button>').join('') +
      '</div>' + (S.canSave() ? '' : S.needDiary()) + '<p class="footnote">' + esc(t('journey_foot')) + '</p>';
    S.wire(v);
  }
  function renderJourney(v, id) {
    const j = J[id]; if (!j) { renderList(v); return; }
    const head = S.backRow(t('journey_' + id + '_t'), 'journey', false);
    if (!S.canSave()) { v.innerHTML = head + '<p class="small">' + esc(t('journey_' + id + '_s')) + '</p>' + S.needDiary(); S.wire(v); return; }
    const d = D(); const art = (pose) => (S.art ? S.art.sakhi({ pose: pose, look: (S.state.settings || {}).look }) : '');
    const remindOn = !!(S.reminders.get('journey') && S.reminders.get('journey').on);
    let body;
    if (d.active !== id) {
      body = '<div class="card jr-intro">' + art('hi') + '<p class="lead">' + esc(t('journey_' + id + '_s')) + '</p><ol class="steps">' + j.days.slice(0, 3).map((x) => '<li>' + esc(tx(x[0])) + '</li>').join('') + '<li>…</li></ol></div>' +
        '<details class="jr-read"><summary>' + esc(t('journey_all')) + '</summary><ol class="jr-all">' + j.days.map((y) => '<li>' + esc(tx(y[0])) + '</li>').join('') + '</ol></details>' +
        (S.routeOwner('plan') ? '<p class="small">' + esc(t('journey_inplan')) + '</p><button type="button" class="btn block" data-go="plan">' + esc(t('journey_plan_b')) + '</button>' : '');   /* Version 39.2: no new journeys */
    } else if (finished(d)) {
      const full = doneCount(d) >= N;
      body = '<div class="card jr-fin">' + art(full ? 'cheer' : 'calm') + '<h2>' + esc(t(full ? 'journey_fin_h' : 'journey_end_h')) + '</h2><p>' + esc(t(full ? 'journey_' + id + '_fin' : 'journey_' + id + '_end')) + '</p><p class="small">' + esc(tf('journey_fin_n', { n: doneCount(d) })) + '</p></div>' +
        '<button type="button" class="btn primary block" data-ask="' + esc(j.ask) + '">' + esc(t('journey_ask')) + '</button>' +
        '<div class="grid2"><button type="button" class="btn" data-go="plan">' + esc(t('journey_plan_b')) + '</button><button type="button" class="btn" data-go="journey-' + IDS.find((x) => x !== id) + '">' + esc(t('journey_other')) + '</button></div>';
    } else {
      const n = dayN(d); const x = j.days[n - 1]; const doneToday = !!d.done[n]; const missed = Object.keys(d.done).length < n - 1;
      body = '<div class="jr-dots" role="img" aria-label="' + esc(tf('journey_dots', { a: doneCount(d), n: N })) + '">' + j.days.map((y, i) => '<i class="' + (d.done[i + 1] ? 'on' : (i + 1 === n ? 'now' : '')) + '"></i>').join('') + '</div>' +
        '<div class="card jr-today"><span class="eyebrow">' + esc(tf('journey_day', { n: n })) + ' · ' + esc(t('journey_today')) + '</span><h2>' + esc(tx(x[0])) + '</h2><p>' + esc(tx(x[1])) + '</p>' +
        (goOk(x[2]) ? '<button type="button" class="btn sm" data-go="' + x[2] + '">' + esc(t('journey_open')) + '</button>' : '') + '</div>' +
        (doneToday ? '<div class="card ok"><p>' + esc(t('journey_done_ok')) + '</p></div>' : '<button type="button" class="btn primary block" id="jr-done">' + esc(t('journey_done_b')) + '</button>') +
        (missed ? '<p class="small">' + esc(t('journey_missed')) + '</p>' : '') +
        '<div class="list"><label class="item"><span class="body"><strong>' + esc(t('journey_remind')) + '</strong></span><input type="checkbox" id="jr-remind" ' + (remindOn ? 'checked' : '') + '></label></div>' +
        '<details><summary>' + esc(t('journey_all')) + '</summary><ol class="jr-all">' + j.days.map((y, i) => '<li class="' + (d.done[i + 1] ? 'done' : '') + '">' + esc(tx(y[0])) + '</li>').join('') + '</ol></details>' +
        '<button type="button" class="linkbtn" id="jr-stop">' + esc(t('journey_stop')) + '</button>';
    }
    v.innerHTML = head + body + '<p class="footnote">' + esc(t('journey_foot')) + '</p>';
    S.wire(v);
    const reRem = () => { if (S.reminders.get('journey')) S.reminders.upsert({ id: 'journey', start: todayISO(), until: S.toISO(S.addDays(S.today(), N - 1)), doneOn: null }); };   /* a new 21 days for a reminder that is on */
    const st = v.querySelector('#jr-start'); if (st) st.addEventListener('click', () => { d.active = id; d.start = todayISO(); d.done = {}; reRem(); S.save(); renderJourney(v, id); });
    const dn = v.querySelector('#jr-done'); if (dn) dn.addEventListener('click', () => { markDone(d, id); S.toast(t('journey_well')); renderJourney(v, id); });
    /* review PLACES-07: no "Do it again" (the 21-day journeys are reading now; the plans have the steps) */
    if (finished(d) && S.reminders.get('journey')) S.reminders.remove('journey');   /* the 21 days are over: no more 9 am reminder */
    const rm = v.querySelector('#jr-remind'); if (rm) rm.addEventListener('change', () => {
      if (rm.checked) S.reminders.upsert({ id: 'journey', mod: 'journey', title: L('Your small step for today', 'आज का आपका छोटा क़दम'), start: todayISO(), until: S.toISO(S.addDays(S.fromISO(d.start), N - 1)), every: 1, time: '09:00', on: true, doneOn: d.done[dayN(d)] ? todayISO() : null });
      else S.reminders.remove('journey');
      S.saveQuiet();
    });
    const sp = v.querySelector('#jr-stop'); if (sp) sp.addEventListener('click', () => { d.active = null; S.reminders.remove('journey'); S.saveQuiet(); renderJourney(v, id); });
  }
  /* Home's Today: today's step, until it is done, with one tap. Plain words in discreet mode. */
  function today() {
    if (!S.canSave() || (S.plan && S.plan.running && S.plan.running())) return null; const d = (S.state.mods || {}).journey;   /* Version 38: her plan's steps are Today's */ if (!d || !d.active || !J[d.active] || !d.start) return null;
    const dd = Object.assign({ done: {}, finished: {} }, d); if (finished(dd)) return null; const n = dayN(dd); if ((dd.done || {})[n]) return null;
    const x = J[d.active].days[n - 1]; const disc = !!(S.state.settings || {}).discreet; const id = d.active;
    return { id: 'journey', order: 30, icon: J[id].icon, hue: J[id].hue, title: disc ? t('journey_home_d') : tx(x[0]), sub: tf('journey_day', { n: n }), go: 'journey-' + id, rem: ['journey'],
      actLabel: t('journey_done_b'), act: () => markDone(D(), id), done: t('journey_well') };
  }

  S.register({
    id: 'journey',
    demoPersona: 'priya',
    strings: {
      en: {
        journey_h: '21 days of small steps', journey_tile_s: 'One small step a day, for PMOS or for more iron',
        journey_p: 'Pick one journey. Each day has one small step that takes a few minutes. Missed a day? Just carry on.',
        journey_pmos_t: 'Small steps for PMOS', journey_iron_t: 'More iron in 21 days', journey_pmos_s: 'Walking, meals and sleep, a little at a time', journey_iron_s: 'Iron-rich Indian food and your tablets',
        journey_inplan: 'These small steps are part of the 12-week plans now. Pick what you want to work on in My plan.', journey_plan_b: 'Open My plan', journey_start: 'Start this journey', journey_replace: 'This takes the place of the journey you are on now.', journey_day: 'Day {n} of 21', journey_today: 'Today’s step', journey_open: 'Open',
        journey_done_b: 'Done for today', journey_done_ok: 'Done for today. See you tomorrow.', journey_well: 'Well done.', journey_missed: 'Missed a day or two? No problem. Just do today’s step.',
        journey_remind: 'Remind me every day at 9 am', journey_all: 'All 21 days', journey_stop: 'Stop this journey', journey_dots: '{a} of {n} days done', journey_did: 'Done once. Start again any time.',
        journey_fin_h: 'You did it: 21 days', journey_fin_n: 'You marked {n} days done.', journey_end_h: 'Your 21 days are over', journey_pmos_end: 'Every small step counts, and you can start again any time. Keep the ones that helped. For a plan made for you, talk to a doctor.', journey_iron_end: 'Every small step counts, and you can start again any time. If you still feel tired or breathless, see a doctor and ask for an Hb test.', journey_again: 'Do it again', journey_other: 'Try the other journey', journey_ask: 'Talk to a Qura doctor',
        journey_pmos_fin: 'You did 21 days of small steps. Keep the two that helped most. For a plan made for you, talk to a doctor.', journey_iron_fin: 'You did 21 days for your iron. If you still feel tired or breathless, see a doctor and ask for an Hb test.',
        journey_home_d: 'Today’s small step', journey_foot: 'Simple everyday steps, the same for everyone. They don’t replace your doctor’s advice.'
      },
      hi: {
        journey_h: '21 दिन, छोटे क़दम', journey_tile_s: 'PMOS या ज़्यादा आयरन के लिए रोज़ एक छोटा क़दम',
        journey_p: 'एक सफ़र चुनें। हर दिन एक छोटा क़दम है जिसमें कुछ ही मिनट लगते हैं। कोई दिन छूट गया? बस आगे बढ़ती रहें।',
        journey_pmos_t: 'PMOS के लिए छोटे क़दम', journey_iron_t: '21 दिन में ज़्यादा आयरन', journey_pmos_s: 'सैर, खाना और नींद, थोड़ा-थोड़ा करके', journey_iron_s: 'आयरन वाला भारतीय खाना और आपकी गोलियाँ',
        journey_inplan: 'ये छोटे क़दम अब 12 हफ़्ते के प्लान का हिस्सा हैं। मेरा प्लान में चुनें कि आप किस पर काम करना चाहती हैं।', journey_plan_b: 'मेरा प्लान खोलें', journey_start: 'यह सफ़र शुरू करें', journey_replace: 'यह आपके अभी के सफ़र की जगह ले लेगा।', journey_day: '21 में से दिन {n}', journey_today: 'आज का क़दम', journey_open: 'खोलें',
        journey_done_b: 'आज का हो गया', journey_done_ok: 'आज का हो गया। कल मिलते हैं।', journey_well: 'बहुत अच्छा।', journey_missed: 'एक-दो दिन छूट गए? कोई बात नहीं। बस आज का क़दम करें।',
        journey_remind: 'मुझे रोज़ सुबह 9 बजे याद दिलाएँ', journey_all: 'सभी 21 दिन', journey_stop: 'यह सफ़र रोकें', journey_dots: '{n} में से {a} दिन हो गए', journey_did: 'एक बार पूरा किया। कभी भी फिर शुरू करें।',
        journey_fin_h: 'आपने कर दिखाया: 21 दिन', journey_fin_n: 'आपने {n} दिन पूरे किए।', journey_end_h: 'आपके 21 दिन पूरे हुए', journey_pmos_end: 'हर छोटा क़दम मायने रखता है, और आप कभी भी फिर शुरू कर सकती हैं। जिनसे मदद मिली, उन्हें जारी रखें। अपने लिए बना प्लान चाहिए, तो डॉक्टर से बात करें।', journey_iron_end: 'हर छोटा क़दम मायने रखता है, और आप कभी भी फिर शुरू कर सकती हैं। अगर अब भी थकान या साँस फूलना हो, तो डॉक्टर को दिखाएँ और Hb टेस्ट माँगें।', journey_again: 'फिर से करें', journey_other: 'दूसरा सफ़र आज़माएँ', journey_ask: 'Qura की डॉक्टर से बात करें',
        journey_pmos_fin: 'आपने 21 दिन छोटे क़दम उठाए। जिन दो से सबसे ज़्यादा मदद मिली, उन्हें जारी रखें। अपने लिए बना प्लान चाहिए, तो डॉक्टर से बात करें।', journey_iron_fin: 'आपने आयरन के लिए 21 दिन पूरे किए। अगर अब भी थकान या साँस फूलना हो, तो डॉक्टर को दिखाएँ और Hb टेस्ट माँगें।',
        journey_home_d: 'आज का छोटा क़दम', journey_foot: 'रोज़ के आसान क़दम, सबके लिए एक जैसे। ये डॉक्टर की सलाह की जगह नहीं लेते।'
      }
    },
    routes: { journey: renderList },
    prefixes: { 'journey-': (v, rest) => renderJourney(v, rest) },
    testRoutes: ['journey-pmos', 'journey-iron'],
    open: ['journey', 'journey-*'],
    tiles: [{ section: 'tools', route: 'journey', title: 'journey_h', sub: 'journey_tile_s', icon: 'sparkle', order: 5, keywords: 'journey challenge 21 days habit pmos pcos iron anaemia khoon ki kami small steps' }],
    today: today,
    css: '.jr-intro, .jr-fin { align-items: center; text-align: center; gap: 8px; } .jr-intro .sakhi, .jr-fin .sakhi { width: 72px; height: 72px; } .jr-intro .steps { text-align: left; align-self: stretch; }' +
      '.jr-dots { display: grid; grid-template-columns: repeat(21, minmax(0, 1fr)); gap: 3px; } .jr-dots i { height: 8px; border-radius: 4px; background: var(--line); } .jr-dots i.on { background: var(--accent); } .jr-dots i.now { background: var(--accent-2); }' +
      '.jr-today h2 { margin: 0; } .jr-today p { margin: 0; color: var(--fg); } .jr-all { margin: 8px 0 0; padding-left: 22px; display: grid; gap: 4px; color: var(--fg); } .jr-all li.done { color: var(--muted); text-decoration: line-through; }'
  });
})(window.Saathi);
