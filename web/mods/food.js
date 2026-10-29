/* My food (Version 39.3; docs/diet-ux-audit-2026-10-24.md, sections 2, 3 and 5): one food home for every woman, by her stage,
   and one foods table that every food screen reads. How she eats (vegetarian by default, eggs too, fish or meat, or Jain: no
   onion, garlic or root vegetables; and whether she takes milk) is asked once and changed here, without restarting a plan.
   The foods are the ICMR-NIN 2024 plate's (moved here unchanged from the PMOS plan, Version 35). Their tags sit in TAGS:
   Jain (r: onion, garlic or a root vegetable; j: other foods many Jain families leave out), m (milk, curd, paneer), i (iron),
   c (calcium) and b (low cost); and a pregnancy version where a food needs care in pregnancy (sprouts cooked, no papaya).
   Nothing about her food leaves the phone. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });

  /* ---------- the foods (ICMR-NIN Dietary Guidelines for Indians 2024: the plate, cereals at most 45% of calories, salt at
     most 5 g, few ultra-processed foods, no protein supplements). [group, en, hi, diet]: diet 'e' = eggs, 'n' = fish or meat.
     ---------- */
  const GROUPS = ['grain', 'protein', 'veg', 'fruit', 'drink', 'snack'];
  const MORE = [
    ['grain', 'Whole-wheat roti', 'गेहूँ के आटे की रोटी'], ['grain', 'Millets: bajra, jowar, ragi', 'मोटे अनाज: बाजरा, ज्वार, रागी'], ['grain', 'Daliya or oats', 'दलिया या ओट्स'], ['grain', 'Brown or red rice', 'ब्राउन या लाल चावल'],
    ['protein', 'Any dal', 'हर तरह की दाल'], ['protein', 'Chana, rajma, lobia', 'चना, राजमा, लोबिया'], ['protein', 'Sprouts', 'अंकुरित अनाज'], ['protein', 'Curd, paneer, milk', 'दही, पनीर, दूध'], ['protein', 'Eggs', 'अंडे', 'e'], ['protein', 'Fish or chicken, not fried', 'मछली या चिकन, बिना तले', 'n'],
    ['veg', 'Green leafy sabzi', 'हरी पत्तेदार सब्ज़ी'], ['veg', 'Seasonal vegetables', 'मौसमी सब्ज़ियाँ'], ['veg', 'Salad: kheera, gajar, tamatar', 'सलाद: खीरा, गाजर, टमाटर'],
    ['fruit', 'Guava, orange, papaya, apple', 'अमरूद, संतरा, पपीता, सेब'], ['fruit', 'Amla', 'आँवला'],
    ['drink', 'Water', 'पानी'], ['drink', 'Chaas or lassi without sugar', 'बिना चीनी की छाछ या लस्सी'], ['drink', 'Tea with little or no sugar', 'कम या बिना चीनी की चाय'],
    ['snack', 'Roasted chana, makhana, peanuts', 'भुने चने, मखाना, मूँगफली'], ['snack', 'A small handful of nuts or seeds', 'थोड़े मेवे या बीज, एक छोटी मुट्ठी']
  ];
  const LESS = [
    ['grain', 'Maida: white bread, biscuits, naan', 'मैदा: सफ़ेद ब्रेड, बिस्किट, नान'], ['grain', 'Big helpings of white rice', 'सफ़ेद चावल की बड़ी मात्रा'],
    ['snack', 'Sugar, mithai, sweets made with gur', 'चीनी, मिठाई, गुड़ की मिठाई'], ['drink', 'Cold drinks and packaged juice', 'कोल्ड ड्रिंक और पैकेट वाला जूस'],
    ['snack', 'Fried snacks: namkeen, samosa, pakora', 'तले नाश्ते: नमकीन, समोसा, पकौड़े'], ['snack', 'Packet food: chips, instant noodles', 'पैकेट वाला खाना: चिप्स, इंस्टेंट नूडल्स'],
    ['snack', 'Extra salt: pickle, papad, sauces', 'ज़्यादा नमक: अचार, पापड़, सॉस']
  ];
  const AVOID = [
    ['snack', 'Vanaspati and dalda (trans fat)', 'वनस्पति घी और डालडा (ट्रांस फ़ैट)'], ['grain', 'Crash diets, or eating very little', 'क्रैश डाइट, या बहुत कम खाना'],
    ['drink', 'Weight-loss pills or powders without a doctor', 'डॉक्टर के बिना वज़न घटाने की गोलियाँ या पाउडर']
  ];
  const LOCAL = {
    north: [['grain', 'Bajra or makki roti in winter', 'सर्दियों में बाजरे या मक्के की रोटी'], ['grain', 'Jau (barley) daliya', 'जौ का दलिया'], ['grain', 'Roti from atta with chokar', 'चोकर वाले आटे की रोटी'],
      ['protein', 'Rajma, chole, kala chana', 'राजमा, छोले, काला चना'], ['protein', 'Moong or arhar dal', 'मूँग या अरहर दाल'], ['protein', 'Paneer, dahi', 'पनीर, दही'], ['protein', 'Egg bhurji with less oil', 'कम तेल की अंडा भुर्जी', 'e'], ['protein', 'Chicken or fish curry, less oil', 'कम तेल में चिकन या मछली', 'n'],
      ['veg', 'Sarson, palak, methi, bathua', 'सरसों, पालक, मेथी, बथुआ'], ['veg', 'Lauki, tori, gobhi, bhindi', 'लौकी, तोरी, गोभी, भिंडी'], ['fruit', 'Amrood, kinnow, apple, amla', 'अमरूद, किन्नू, सेब, आँवला'],
      ['drink', 'Chaas, nimbu pani without sugar', 'छाछ, बिना चीनी का नींबू पानी'], ['snack', 'Bhuna chana, makhana, sprouts chaat', 'भुना चना, मखाना, अंकुरित चाट']],
    west: [['grain', 'Bajra or jowar bhakri, rotla', 'बाजरे या ज्वार की भाकरी, रोटला'], ['grain', 'Nachni (ragi) bhakri', 'नाचणी (रागी) की भाकरी'], ['grain', 'Khichdi with more dal', 'ज़्यादा दाल वाली खिचड़ी'],
      ['protein', 'Moong, matki (moth) usal', 'मूँग, मटकी (मोठ) की उसळ'], ['protein', 'Tuvar dal, chana, besan cheela', 'तुवर दाल, चना, बेसन चीला'], ['protein', 'Dahi, paneer', 'दही, पनीर'], ['protein', 'Boiled eggs', 'उबले अंडे', 'e'], ['protein', 'Fish, not fried', 'मछली, बिना तली', 'n'],
      ['veg', 'Methi, palak, shepu (dill)', 'मेथी, पालक, शेपू (सोआ)'], ['veg', 'Dudhi, turai, gavar, bhindi', 'दूधी, तुरई, ग्वार, भिंडी'], ['veg', 'Ker-sangri (Rajasthan)', 'केर-सांगरी (राजस्थान)'],
      ['fruit', 'Guava, papaya, orange, ber in season', 'अमरूद, पपीता, संतरा, मौसम में बेर'], ['drink', 'Chaas (taak), water', 'छाछ (ताक), पानी'], ['snack', 'Roasted chana, peanuts, whole-wheat khakhra', 'भुने चने, मूँगफली, गेहूँ का खाखरा']],
    central: [['grain', 'Jowar roti, whole-wheat roti', 'ज्वार की रोटी, गेहूँ की रोटी'], ['grain', 'Kodo or kutki millet', 'कोदो या कुटकी'], ['grain', 'Daliya', 'दलिया'],
      ['protein', 'Tuvar, chana, masoor dal', 'तुवर, चना, मसूर दाल'], ['protein', 'Dahi, paneer', 'दही, पनीर'], ['protein', 'Boiled eggs', 'उबले अंडे', 'e'], ['protein', 'Fish or chicken, less oil', 'कम तेल में मछली या चिकन', 'n'],
      ['veg', 'Chaulai, palak, methi', 'चौलाई, पालक, मेथी'], ['veg', 'Lauki, baingan, bhindi, gobhi', 'लौकी, बैंगन, भिंडी, गोभी'], ['fruit', 'Guava, papaya, amla, jamun in season', 'अमरूद, पपीता, आँवला, मौसम में जामुन'],
      ['drink', 'Chaas, water', 'छाछ, पानी'], ['snack', 'Roasted chana, peanuts, poha with vegetables', 'भुने चने, मूँगफली, सब्ज़ी वाला पोहा']],
    south: [['grain', 'Ragi mudde, ragi dosa or roti', 'रागी मुद्दे, रागी डोसा या रोटी'], ['grain', 'Jowar roti', 'ज्वार की रोटी'], ['grain', 'Millet upma: foxtail, little millet', 'मिलेट उपमा: कंगनी, कुटकी'], ['grain', 'Red or brown rice, a smaller helping', 'लाल या ब्राउन चावल, कम मात्रा'],
      ['protein', 'Sambar and rasam with more dal', 'ज़्यादा दाल वाला सांबर और रसम'], ['protein', 'Sundal: chana, green gram', 'सुंडल: चना, मूँग'], ['protein', 'Curd', 'दही'], ['protein', 'Boiled eggs', 'उबले अंडे', 'e'], ['protein', 'Fish curry, not fried', 'मछली करी, बिना तली', 'n'],
      ['veg', 'Keerai (amaranth), drumstick leaves', 'कीरै (चौलाई), सहजन के पत्ते'], ['veg', 'Beans, carrot, cabbage, gourds, drumstick', 'बीन्स, गाजर, पत्तागोभी, लौकी-तोरी, सहजन'], ['fruit', 'Guava, papaya, orange, amla', 'अमरूद, पपीता, संतरा, आँवला'],
      ['drink', 'Buttermilk (majjige, mor), water', 'छाछ (मज्जिगे, मोर), पानी'], ['drink', 'Coconut water, no added sugar', 'नारियल पानी, बिना चीनी'], ['snack', 'Sundal, roasted chana, peanuts', 'सुंडल, भुने चने, मूँगफली']],
    east: [['grain', 'Less rice, more dal and sabzi', 'कम चावल, ज़्यादा दाल और सब्ज़ी'], ['grain', 'Sattu', 'सत्तू'], ['grain', 'Ragi (mandia)', 'रागी (मंडिया)'], ['grain', 'Whole-wheat roti', 'गेहूँ की रोटी'],
      ['protein', 'Masoor, moong, chana dal', 'मसूर, मूँग, चना दाल'], ['protein', 'Curd, paneer', 'दही, पनीर'], ['protein', 'Boiled eggs', 'उबले अंडे', 'e'], ['protein', 'Small fish (rohu, katla), not fried', 'छोटी मछली (रोहू, कतला), बिना तली', 'n'],
      ['veg', 'Saag: palong, lal saag, kalmi', 'साग: पालक, लाल साग, कलमी'], ['veg', 'Lauki, parwal, karela, pumpkin', 'लौकी, परवल, करेला, कद्दू'], ['fruit', 'Guava, papaya, orange, jamun', 'अमरूद, पपीता, संतरा, जामुन'],
      ['drink', 'Salted sattu drink, no sugar', 'सत्तू का नमकीन शरबत, बिना चीनी'], ['drink', 'Chaas, water', 'छाछ, पानी'], ['snack', 'Jhalmuri with sprouts, less oil', 'अंकुरित वाली झालमुड़ी, कम तेल']],
    ne: [['grain', 'Red or black rice, a smaller helping', 'लाल या काला चावल, कम मात्रा'], ['grain', 'Whole-wheat roti', 'गेहूँ की रोटी'], ['grain', 'Local millets', 'स्थानीय मोटे अनाज'],
      ['protein', 'Dal, local beans, soybean', 'दाल, स्थानीय बीन्स, सोयाबीन'], ['protein', 'Curd', 'दही'], ['protein', 'Boiled eggs', 'उबले अंडे', 'e'], ['protein', 'Fish or chicken, boiled or in a stew', 'उबली या शोरबे वाली मछली या चिकन', 'n'],
      ['veg', 'Local greens: lai saag, mustard, fern', 'स्थानीय साग: लाई साग, सरसों, ढेंकी (फ़र्न)'], ['veg', 'Squash, pumpkin, beans, bamboo shoot', 'स्क्वैश, कद्दू, बीन्स, बाँस की कोपल'], ['fruit', 'Pineapple, orange, guava', 'अनानास, संतरा, अमरूद'],
      ['drink', 'Water, tea without sugar', 'पानी, बिना चीनी की चाय'], ['snack', 'Boiled or roasted peanuts, chana', 'उबली या भुनी मूँगफली, चना']]
  };

  /* [flags, pregnancy version] by the food's English name */
  const PV = (en, hi) => L(en, hi);
  const TAGS = {
    'Millets: bajra, jowar, ragi': ['ic'], 'Any dal': ['ib'], 'Chana, rajma, lobia': ['ib'], 'Sprouts': ['j', PV('Sprouts, cooked', 'पकाए हुए अंकुरित अनाज')],
    'Curd, paneer, milk': ['mc'], 'Eggs': ['ib'], 'Fish or chicken, not fried': ['i'], 'Green leafy sabzi': ['icb'], 'Seasonal vegetables': ['b'],
    'Salad: kheera, gajar, tamatar': ['r'], 'Guava, orange, papaya, apple': ['', PV('Guava, orange, apple', 'अमरूद, संतरा, सेब')], 'Amla': ['i'], 'Water': ['b'],
    'Chaas or lassi without sugar': ['m'], 'Roasted chana, makhana, peanuts': ['b'],
    'Bajra or makki roti in winter': ['i'], 'Rajma, chole, kala chana': ['ib'], 'Paneer, dahi': ['mc'], 'Sarson, palak, methi, bathua': ['icb'],
    'Chaas, nimbu pani without sugar': ['m'], 'Bhuna chana, makhana, sprouts chaat': ['rj', PV('Bhuna chana, makhana, cooked sprouts chaat', 'भुना चना, मखाना, पके अंकुरित की चाट')],
    'Bajra or jowar bhakri, rotla': ['i'], 'Nachni (ragi) bhakri': ['ic'], 'Moong, matki (moth) usal': ['ir'], 'Dahi, paneer': ['mc'], 'Boiled eggs': ['ib'],
    'Methi, palak, shepu (dill)': ['ic'], 'Guava, papaya, orange, ber in season': ['', PV('Guava, orange, ber in season', 'अमरूद, संतरा, मौसम में बेर')],
    'Chaas (taak), water': ['m'], 'Roasted chana, peanuts, whole-wheat khakhra': ['b'], 'Chaulai, palak, methi': ['ic'],
    'Guava, papaya, amla, jamun in season': ['', PV('Guava, amla, jamun in season', 'अमरूद, आँवला, मौसम में जामुन')], 'Chaas, water': ['m'],
    'Roasted chana, peanuts, poha with vegetables': ['rb'], 'Ragi mudde, ragi dosa or roti': ['ic'], 'Sambar and rasam with more dal': ['r'],
    'Sundal: chana, green gram': ['ib'], 'Curd': ['mc'], 'Keerai (amaranth), drumstick leaves': ['ic'], 'Beans, carrot, cabbage, gourds, drumstick': ['r'],
    'Guava, papaya, orange, amla': ['', PV('Guava, orange, amla', 'अमरूद, संतरा, आँवला')], 'Buttermilk (majjige, mor), water': ['m'], 'Sundal, roasted chana, peanuts': ['b'],
    'Sattu': ['ib'], 'Ragi (mandia)': ['ic'], 'Curd, paneer': ['mc'], 'Small fish (rohu, katla), not fried': ['i'], 'Saag: palong, lal saag, kalmi': ['icb'],
    'Guava, papaya, orange, jamun': ['', PV('Guava, orange, jamun', 'अमरूद, संतरा, जामुन')], 'Salted sattu drink, no sugar': ['ib'],
    'Jhalmuri with sprouts, less oil': ['rj', PV('Jhalmuri with cooked sprouts, less oil', 'पके अंकुरित वाली झालमुड़ी, कम तेल')],
    'Local greens: lai saag, mustard, fern': ['i'], 'Boiled or roasted peanuts, chana': ['b']
  };
  const tag = (x) => { const g = TAGS[x[1]]; if (!g) return x; if (x.length < 4) x[3] = ''; x[4] = g[0] || ''; x[5] = g[1] || null; return x; };
  MORE.forEach(tag); LESS.forEach(tag); AVOID.forEach(tag); Object.keys(LOCAL).forEach((k) => LOCAL[k].forEach(tag));

  /* ---------- how she eats ---------- */
  const TYPES = ['veg', 'egg', 'nonveg', 'jain'];
  /* vegetarian unless she says otherwise (diet audit 3.2); a plan made before Version 39.3 keeps the answer it was given */
  const diet = () => { const m = S.state.mods || {}; const d = m.food || {}; const p = m.plan || {}; const type = TYPES.indexOf(d.type) >= 0 ? d.type : (TYPES.indexOf(p.food) >= 0 ? p.food : 'veg'); return { type: type, milk: d.milk !== false }; };
  const set = (type, milk) => { if (!S.canSave()) return; const d = S.data('food'); if (TYPES.indexOf(type) >= 0) d.type = type; if (milk != null) d.milk = !!milk; S.saveQuiet(); };
  const pregnant = () => !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  /* a food she can be shown: her diet, Jain, milk */
  const ok = (x, o) => { o = Object.assign(diet(), o || {}); const dt = x[3] || '', fl = x[4] || '';
    if (dt === 'n' && o.type !== 'nonveg') return false; if (dt === 'e' && o.type !== 'egg' && o.type !== 'nonveg') return false;
    if (o.type === 'jain' && /[rj]/.test(fl)) return false; if (o.milk === false && /m/.test(fl)) return false; return true; };
  /* its name, in pregnancy its pregnancy version */
  const name = (x, o) => { const pg = o && o.preg != null ? o.preg : pregnant(); return tx(pg && x[5] ? x[5] : L(x[1], x[2])); };
  /* for the 21-day steps and other screens that know only vegetarian, eggs and fish or meat */
  const simple = (type) => (type === 'jain' ? 'veg' : type || diet().type);

  /* ---------- My food ---------- */
  const PLATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 12h9"/></svg>';
  /* Version 39.8: the marks on food packs (a green dot for vegetarian, a brown triangle for fish or meat), an egg for eggs */
  const PACK_MK = { veg: '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#FFFFFF" stroke="#2E8540" stroke-width="1.6"/><circle cx="8" cy="8" r="3.4" fill="#2E8540"/>',
    nonveg: '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#FFFFFF" stroke="#8A4B2A" stroke-width="1.6"/><path d="M8 4.4l3.6 6.6H4.4z" fill="#8A4B2A"/>',
    egg: '<path d="M8 1.6c2.9 0 5.1 4.1 5.1 7.4A5.1 5.1 0 0 1 2.9 9c0-3.3 2.2-7.4 5.1-7.4z" fill="#FBF1DE" stroke="#A8803F" stroke-width="1.3"/>' };
  PACK_MK.jain = PACK_MK.veg;
  const mark = (type) => (PACK_MK[type] ? '<svg class="food-mk" viewBox="0 0 16 16" aria-hidden="true">' + PACK_MK[type] + '</svg>' : '');
  /* a drawing for each of My food's rows */
  const ROW_ART = { 'preg-diet': 'thali', 'meno-bones': 'milk', 'plan-plate': 'thali', 'post-feed': 'dal', 'cond-anaemia': 'saag', 'periods-fasting': 'khajur' };
  const rowArt = (r) => (r[0] === 'meno-bones' && !diet().milk ? 'ragi' : ROW_ART[r[0]]);   /* V39.8 review PICTURES-05 */
  const rowPic = (r) => (S.art && S.art.hasFood && rowArt(r) && S.art.hasFood(rowArt(r)) ? '<span class="food-ico hue hue-' + r[3] + '" aria-hidden="true">' + S.art.food(rowArt(r)) + '</span>' : '<span class="ico-sm hue hue-' + r[3] + '">' + PLATE + '</span>');
  const tileT = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x ? t(x.title) : ''; };
  /* her stage's food pages, each the reviewed page itself: [route, title, sub] */
  function rows() {
    const st = S.stageNow ? S.stageNow() : 'cycle'; const disc = !!(S.state.settings || {}).discreet; const out = [];
    const add = (r, ttl, sub, hue) => { if (S.routeOwner(r) && (!S.toolShown || S.toolShown(r))) out.push([r, ttl || tileT(r), sub || '', hue || 'green']); };
    if (st === 'preg' && !disc) add('preg-diet', '', t('food_r_preg'));
    if (st === 'meno' && !disc) add('meno-bones', t('food_r_calcium'), t('food_r_calcium_s'), 'gold');
    if (st !== 'preg') add('plan-plate', '', t('food_r_plate'));
    if (st === 'post' && !disc) add('post-feed', '', t('food_r_post'), 'sky');
    if (!disc) add('cond-anaemia', t('food_r_iron'), t('food_r_iron_s'), 'rose');
    if (!disc) add('periods-fasting', '', t('food_r_fast'), 'purple');
    return out;
  }
  function renderFood(v) {
    const dd = diet(); const can = S.canSave();
    const chip = (k, label) => '<button type="button" class="chip' + (dd.type === k ? ' on' : '') + '" data-food-type="' + k + '" aria-pressed="' + (dd.type === k) + '">' + mark(k) + esc(label) + '</button>';
    v.innerHTML = S.backRow(t('food_h'), 'care', false) + '<p class="small">' + esc(t('food_p')) + '</p>' +
      (can ? '<div class="card food-how"><h2>' + esc(t('food_how_h')) + '</h2><div class="chips" role="group" aria-label="' + esc(t('food_how_h')) + '">' +
        chip('veg', t('food_t_veg')) + chip('egg', t('food_t_egg')) + chip('nonveg', t('food_t_nonveg')) + chip('jain', t('food_t_jain')) + '</div>' +
        '<label class="row food-milk"><input type="checkbox" id="food-milk"' + (dd.milk ? '' : ' checked') + '> ' + esc(t('food_nomilk')) + '</label><p class="small">' + esc(t('food_how_p')) + '</p></div>' : S.needDiary()) +
      '<div class="list food-rows">' + rows().map((r) => '<button type="button" class="item" data-go="' + esc(r[0]) + '">' + rowPic(r) + '<span class="body"><strong>' + esc(r[1]) + '</strong>' + (r[2] ? '<span>' + esc(r[2]) + '</span>' : '') + '</span><span class="chev">' + S.I.chev + '</span></button>').join('') + '</div>' +
      '<p class="footnote">' + esc(t('food_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-food-type]').forEach((b) => b.addEventListener('click', () => { set(b.dataset.foodType); S.toast(t('saved')); S.render(); }));
    const mk = v.querySelector('#food-milk'); if (mk) mk.addEventListener('change', () => { set(null, !mk.checked); S.toast(t('saved')); S.render(); });
  }

  /* Version 39.8 (diet audit DIET-10, VD-03): each food's drawing, read from its English name (the first food it names wins:
     "Paneer, dahi" is paneer), so every food screen can show pictures. No new food words. */
  const R = (re, k) => [re, k];
  const ART_RULES = {
    grain: [R(/maida|white bread|biscuit|naan/, 'bread'), R(/crash|very little/, 'khali'), R(/sattu/, 'sattu'), R(/ragi|nachni|mandia/, 'ragi'), R(/upma/, 'upma'), R(/dosa/, 'dosa'), R(/idli/, 'idli'), R(/poha|jhalmuri/, 'poha'), R(/khichdi|daliya|oats/, 'khichdi'), R(/rice/, 'chawal_k'), R(/bhakri|rotla|bajra|jowar|makki|millet|kodo|kutki/, 'bhakri'), R(/roti|atta|chokar/, 'roti')],
    protein: [R(/egg/, 'egg'), R(/fish/, 'fish'), R(/chicken/, 'chicken'), R(/paneer/, 'paneer'), R(/curd|dahi/, 'dahi'), R(/milk/, 'milk'), R(/sprout|sundal|usal|matki/, 'sprouts'), R(/rajma/, 'rajma'), R(/chole|chana|lobia|besan/, 'chana'), R(/dal|moong|arhar|tuvar|masoor|sambar|rasam|beans|soybean|gram/, 'dal')],
    veg: [R(/leafy|saag|palak|palong|methi|sarson|bathua|keerai|drumstick leaves|chaulai|shepu|greens|lai /, 'saag'), R(/salad|kheera|gajar|tamatar/, 'salad')],
    fruit: [R(/amrood|guava/, 'amrood'), R(/amla/, 'amla'), R(/papaya/, 'papita'), R(/pineapple/, 'ananas')],
    drink: [R(/\btea\b/, 'chai'), R(/cold drink|packaged juice/, 'colddrink'), R(/pill|powder/, 'pills'), R(/coconut/, 'nariyal'), R(/chaas|lassi|buttermilk|taak|majjige|nimbu|sattu/, 'chaas'), R(/water/, 'water')],
    snack: [R(/fried|namkeen|samosa|pakora/, 'samosa'), R(/packet|chips|noodles/, 'chips'), R(/pickle|papad|sauce|extra salt/, 'achaar'), R(/vanaspati|dalda/, 'dalda'), R(/peanut/, 'moongfali'), R(/chana|sundal/, 'chana'), R(/nuts|seeds/, 'til'), R(/poha|jhalmuri/, 'poha'), R(/gur|mithai|sweet/, 'gud')]
  };
  const FALLBACK = { veg: 'sabzi', fruit: 'amrood' };
  /* V39.8 review SAFETY-06, PICTURES-04: a line that asks for less of a food, and a dish made from an ingredient, take these first */
  const ART_FIRST = [R(/less rice|more dal/, 'dal'), R(/upma/, 'upma'), R(/bhakri|rotla/, 'bhakri'), R(/mithai|sweets/, 'laddoo')];
  function artOf(x) {
    if (!x || !S.art || !S.art.hasFood) return null; const en = String(x[1] || '').toLowerCase(); let best = null, at = 1e9;
    const first = ART_FIRST.find((r) => r[0].test(en)); if (first && S.art.hasFood(first[1])) return first[1];
    (ART_RULES[x[0]] || []).forEach((r) => { const m = r[0].exec(en); if (m && m.index < at) { at = m.index; best = r[1]; } });
    if (!best && /tea|cold drink|juice|pill|powder|crash|vanaspati|dalda|maida|fried|packet|salt|white bread/.test(en)) return null;
    best = best || FALLBACK[x[0]] || null; return best && S.art.hasFood(best) ? best : null;
  }
  /* one food as a tile: its drawing, its name (Devanagari in Hindi) and a mark as well as the colour: ✓ more often, – less
     often, ✗ avoid */
  const MARK = { ok: ['✓', 'food_mk_ok'], less: ['–', 'food_mk_less'], avoid: ['✗', 'food_mk_avoid'] };
  function tile(x, mark, fallback) {
    const k = artOf(x); const m = MARK[mark] || MARK.ok;
    return '<span class="food-tile ' + (MARK[mark] ? mark : 'ok') + '">' + (k ? '<span class="ft-art">' + S.art.food(k) + '</span>' : '<span class="ft-art ft-ico">' + (fallback || '') + '</span>') +
      '<span class="ft-n">' + esc(name(x)) + '</span><span class="ft-b" role="img" aria-label="' + esc(t(m[1])) + '">' + m[0] + '</span></span>';
  }
  /* a strip of drawings for a page's foods (names from that page's own reviewed text). V39.8 review SAFETY-02: an item is
     [drawing, name, flags, pregnancy name]; the flags are the foods table's (m milk; r and j left out for Jain; e eggs; n fish
     or meat), so a strip follows how she eats, as the tiles do, and in pregnancy shows the pregnancy name (sprouts, cooked) */
  const stripFit = (x) => { const fl = x[2] || ''; const dt = diet(); if (/m/.test(fl) && !dt.milk) return false; if (dt.type === 'jain' && /[rj]/.test(fl)) return false;
    if (/e/.test(fl) && dt.type !== 'egg' && dt.type !== 'nonveg') return false; if (/n/.test(fl) && dt.type !== 'nonveg') return false; return true; };
  function strip(items, title) {
    const xs = (items || []).filter((x) => x && S.art && S.art.hasFood(x[0]) && stripFit(x)); if (!xs.length) return ''; const pg = pregnant();
    return '<div class="food-strip" data-say="1">' + (title ? '<span class="eyebrow">' + esc(title) + '</span>' : '') + '<div class="fs-row">' + xs.map((x) => '<span class="fs-it">' + S.art.food(x[0]) + '<span>' + esc(tx(pg && x[3] ? x[3] : x[1])) + '</span></span>').join('') + '</div></div>';
  }
  /* Version 39.9 (diet audit 2, food steps that change): her foods with a tag (i iron, c calcium), for a step that changes day
     to day. Her region's foods come first, then the national list; only foods that fit how she eats; one entry per name. */
  function pick(tagCh, o) {
    o = o || {}; const seen = {}; const out = [];
    (LOCAL[o.region] || []).concat(MORE).forEach((x) => { if ((x[4] || '').indexOf(tagCh) < 0 || !ok(x, o) || (o.skip && o.skip.test(x[1]))) return; const n = name(x, o); if (seen[n]) return; seen[n] = 1; out.push(x); });
    return out;
  }
  S.food = { table: { GROUPS: GROUPS, MORE: MORE, LESS: LESS, AVOID: AVOID, LOCAL: LOCAL }, pick: pick, diet: diet, known: () => TYPES.indexOf((((S.state.mods || {}).food) || {}).type) >= 0, set: set, ok: ok, name: name, simple: simple, types: TYPES.slice(), plate: PLATE, artOf: artOf, tile: tile, strip: strip, mark: mark };

  S.register({
    open: ['food'],   /* review FOOD-06: My food opens without a diary too (it says what a diary adds) */
    id: 'food',
    demoPersona: 'priya',
    strings: {
      en: {
        food_h: 'My food', food_tile_s: 'Your plate and the food for your stage, the way you eat', food_mk_ok: 'Eat more often', food_mk_less: 'Less often', food_mk_avoid: 'Avoid',
        food_p: 'Food for your stage, the way you eat. Change how you eat here at any time; your plan keeps going.',
        food_how_h: 'How you eat', food_how_p: 'Sakhi shows only foods that fit this, on every food screen.',
        food_t_veg: 'Vegetarian', food_t_egg: 'Eggs too', food_t_nonveg: 'Fish or meat too', food_t_jain: 'Jain: no onion, garlic or root vegetables',
        food_nomilk: 'I don’t take milk, curd or paneer',
        food_r_preg: 'What to eat more of, and what to keep away from', food_r_plate: 'Half your plate sabzi, and foods from your region',
        food_r_post: 'Food and water while you breastfeed', food_r_iron: 'Food that builds blood', food_r_iron_s: 'Iron foods, and how to take more of it in',
        food_r_calcium: 'Calcium from your kitchen', food_r_calcium_s: 'For strong bones after 40', food_r_fast: 'Eating well on fasting days',
        food_foot: 'Based on the ICMR-NIN Dietary Guidelines for Indians (2024). Not a diet chart: your doctor can give you one.'
      },
      hi: {
        food_mk_ok: 'ज़्यादा खाएँ', food_mk_less: 'कम खाएँ', food_mk_avoid: 'न खाएँ',
        food_h: 'मेरा खाना', food_tile_s: 'आपकी थाली और आपके दौर का खाना, जैसे आप खाती हैं',
        food_p: 'आपके दौर का खाना, जैसे आप खाती हैं। आप क्या खाती हैं, यहाँ कभी भी बदलें; आपका प्लान चलता रहेगा।',
        food_how_h: 'आप क्या खाती हैं', food_how_p: 'Sakhi हर खाने वाले पन्ने पर सिर्फ़ वही चीज़ें दिखाएगी जो इससे मेल खाएँ।',
        food_t_veg: 'शाकाहारी', food_t_egg: 'अंडा भी', food_t_nonveg: 'मछली या मांस भी', food_t_jain: 'जैन: प्याज़, लहसुन या ज़मीन के नीचे की सब्ज़ी नहीं',
        food_nomilk: 'मैं दूध, दही या पनीर नहीं लेती',
        food_r_preg: 'क्या ज़्यादा खाएँ, और किससे दूर रहें', food_r_plate: 'आधी थाली सब्ज़ी, और आपके इलाक़े का खाना',
        food_r_post: 'दूध पिलाते समय खाना और पानी', food_r_iron: 'ख़ून बढ़ाने वाला खाना', food_r_iron_s: 'आयरन वाला खाना, और शरीर उसे ज़्यादा कैसे ले',
        food_r_calcium: 'रसोई से calcium', food_r_calcium_s: '40 के बाद मज़बूत हड्डियों के लिए', food_r_fast: 'व्रत के दिन ठीक से खाना',
        food_foot: 'भारतीयों के लिए ICMR-NIN आहार दिशानिर्देश (2024) पर आधारित। यह डाइट चार्ट नहीं है: वह आपकी डॉक्टर दे सकती हैं।'
      }
    },
    routes: { food: renderFood },
    tiles: [{ section: 'tools', route: 'food', title: 'food_h', sub: 'food_tile_s', icon: PLATE, order: 5, gated: false,
      keywords: 'food khana khaana kya khaye kya khayein diet thali nashta nashtaa breakfast tiffin lunch dinner recipe sabzi dal doodh milk sattu protein calcium iron jain vegetarian veg non-veg egg ahar aahar bhojan खाना क्या खाएं क्या खाएँ आहार भोजन नाश्ता थाली सब्ज़ी दाल दूध सत्तू रेसिपी जैन शाकाहारी अंडा' }],
    css: '.food-mk { width: 16px; height: 16px; margin-right: 6px; flex-shrink: 0; } .food-ico { width: 44px; height: 44px; border-radius: 12px; background: var(--hue-soft, var(--peach-2)); flex-shrink: 0; display: inline-flex; overflow: hidden; } .food-ico svg { width: 100%; height: 100%; } .food-how h2 { margin: 0; } .food-milk { gap: 8px; align-items: center; font-weight: 500; } .food-milk input { width: 22px; height: 22px; min-height: 0; accent-color: var(--accent); }'
  });
})(window.Saathi);
