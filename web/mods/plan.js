/* My PMOS plan (Version 35; docs/lifestyle-plans-research-2026-10-23.md, sections 3 and 8). Mohit, 23 Oct: "Go ahead with the
   PMOS plan first", then "can you add GIFs". Twelve weeks of small daily habits for PMOS (PCOS), graphics first:
   - My plate: what to eat more and less often, with foods from her region (from her PIN code, worked out on the phone) and
     from everywhere in India, filtered by what she eats. No food is banned; only trans fats and crash diets are "avoid".
   - My body (optional): BMI and waist with the cut-offs for Indian women (2009 national consensus: BMI 23, waist 80 cm).
     She picks "habits first" (no weight goal, the default) or "habits and weight", as the 2023 PCOS guideline asks (3.6.4).
   - Yoga and moves: a weekly target of active minutes that builds to 150 (250 with "habits and weight"), two strength days,
     and five routines of Common Yoga Protocol poses and home moves. Every move has a looping moving drawing (our own lines,
     no files, still for "reduce motion"), a timer and the steps read aloud. Knee or back pain swaps or skips moves.
   - My progress: her minutes, strength days and food habits, and from her diary the days between periods, periods that
     needed a painkiller and her check-in signs, before and since she started; weight and waist only if she noted them;
     "what to expect" as a timeline, never a predicted number.
   - A weekly look-back (energy, what got in the way, one tip), a Home "Today" item, an optional daily reminder, and her plan
     in the doctor summary when she ticks it in "Ask Qura to call me".
   Lifestyle only (2023 international PCOS guideline recs 3.1 to 3.6; ICMR-NIN Dietary Guidelines 2024; WHO 2020): no calorie
   counting, no weight target, no supplements, herbs or doses. For those: "Ask a Qura doctor". Paused in pregnancy and for
   the first 6 weeks after a birth. Everything stays on her phone. Approved by Mohit on 23 Oct ("plan approved build apk"), so
   every build shows it; PLAN_RELEASE in app.js can hide it again outside demo builds. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const L = (en, hi) => ({ en: en, hi: hi });
  const N = 12;
  const on = () => !!(S.planOn && S.planOn());
  const D = () => { const d = mig(S.data('plan')); d.log = d.log || {}; d.body = d.body || []; d.weeks = d.weeks || {}; return d; };
  const raw = () => mig((S.state.mods && S.state.mods.plan) || null);   /* read without creating */
  /* Version 37.1: a plan made in Version 37 but never started (she left her plan screen) waits to be started; a plan with no
     "go" (Version 35 starts, the sample) runs. Done once for each saved plan, the first time it is read: modules register
     before her saved diary loads, so it can't run at register. */
  const MIG = typeof WeakSet === 'function' ? new WeakSet() : null;
  function mig(d) {
    if (!d || typeof d !== 'object' || (MIG && MIG.has(d))) return d; if (MIG) MIG.add(d);
    try {
      const rr = S.reminders && S.reminders.get ? S.reminders.get('plan') : null; if (rr && rr.title && rr.title.en === 'Your plan for today') rr.title = REM_T;
      /* Version 37.2: the reminder asks "How did today go?", so a morning or afternoon time (Version 37 offered 8 am and 1 pm) moves to 8 pm */
      if (d.remAt && d.remAt < '17:00') { d.remAt = '20:00'; if (rr) rr.time = '20:00'; }
      if (d.start && d.go === undefined) d.go = true;
      if (d.start && d.pv == null) d.pv = 1;   /* Version 39.4: plans saved before the port are version 1 */
      /* Version 39.45 (Mohit's Flip5): "Your last plan" is a real one: no pregnancy plan with no pregnancy behind it (marked by
         mistake: she isn't pregnant, and no loss or birth since it started), and no second copy of a plan (the one she runs,
         brought back after "marked by mistake") */
      if (Array.isArray(d.past) && d.past.length) { const s0 = S.state.situation || {}; const seen = {}; if (d.start) seen[(d.pack || 'cycle') + '|' + d.start] = 1;
        d.past = d.past.filter((x) => { if (!x || !x.start) return true; const k = (x.pack || 'cycle') + '|' + x.start; if (seen[k]) return false; seen[k] = 1;
          return !(x.pack === 'preg' && !s0.pregnant && !((s0.pregEndedOn || '') >= x.start) && !((s0.deliveredOn || '') >= x.start)); }); }
      if (d.start && d.go === false && !d.next) {
        const fd = Object.assign({ log: {}, weeks: {}, body: [] }, d);
        const quiet = !Object.keys(d.log || {}).some((k) => k >= d.start && dayDone(fd, k));
        if (quiet) {
          d.next = { pack: d.pack || 'cycle', goalKey: d.goalKey || null, goal: d.goal || 'cycles', focus: d.focus || 'habits', level: d.level == null ? 0 : d.level, limits: d.limits || { knees: false, back: false },
            food: d.food || 'veg', region: d.region || null, remAt: d.remAt && d.remAt >= '17:00' ? d.remAt : '20:00', when: d.when || null, bed: d.bed || null, work: d.work || null, intake: S.state.intake || null, at: d.start };
          d.start = null; d.pack = null; d.go = false;
          if (S.reminders && S.reminders.get && S.reminders.get('plan')) S.reminders.remove('plan');
        } else d.go = true;
      }
    } catch (e) { /* an odd old plan: leave it as it is */ }
    return d;
  }
  /* Version 39.23 (Mohit, 27 Oct): her plan's day ends at 4 am, so a step, a session or the check-in after midnight counts
     for the day before (core planToday); her diary keeps the calendar day */
  const pToday = () => (S.planToday ? S.planToday() : S.today());
  const todayISO = () => S.toISO(pToday());
  const disc = () => !!(S.state.settings || {}).discreet;
  /* Version 39.28: on the doctor route (S.care: a private doctor, "Nowhere yet", or not answered) Qura's doctor comes before
     the free government doctor; the government route keeps the free doctor first */
  const docR = () => !!(S.care && S.care.gov && !S.care.gov());
  const byRoute = (free, qura) => (docR() ? qura + free : free + qura);
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  const round5 = (n) => Math.round(n / 5) * 5;
  const num1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '');
  const pregnant = () => !!(S.cycle && S.cycle.isPregnant && S.cycle.isPregnant());
  const earlyPost = () => { const b = (S.state.situation || {}).deliveredOn; return !!b && !pregnant() && S.diffDays(S.fromISO(b), pToday()) < 42; };   /* review FOOD-07 */
  /* paused in pregnancy, and for the first 6 weeks after a birth (pelvic floor and short walks first) */
  const pauseWhy = () => { if (pregnant()) return 'preg'; if (lossNow()) return 'loss'; const b = (S.state.situation || {}).deliveredOn; if (b && S.diffDays(S.fromISO(b), pToday()) < 42) return 'post'; return null; };
  /* Version 39.0: for 6 weeks after a pregnancy ends any other way than a birth, no plan runs and none is suggested, unless she
     picks one herself (S.mem.lossPick) */
  const lossNow = () => { const e = (S.state.situation || {}).pregEndedOn; return !pregnant() && /^\d{4}-\d{2}-\d{2}$/.test(e || '') && S.diffDays(S.fromISO(e), pToday()) >= 0 && S.diffDays(S.fromISO(e), pToday()) < 42; };

  /* ---------- her region, from her PIN code (India Post's first digits), on the phone ---------- */
  const REG = {
    north: { t: L('North India', 'उत्तर भारत'), s: L('Delhi, Punjab, Haryana, UP, Uttarakhand, Himachal, J&K', 'दिल्ली, पंजाब, हरियाणा, यूपी, उत्तराखंड, हिमाचल, जम्मू-कश्मीर') },
    west: { t: L('West India', 'पश्चिम भारत'), s: L('Rajasthan, Gujarat, Maharashtra, Goa', 'राजस्थान, गुजरात, महाराष्ट्र, गोवा') },
    central: { t: L('Central India', 'मध्य भारत'), s: L('Madhya Pradesh, Chhattisgarh', 'मध्य प्रदेश, छत्तीसगढ़') },
    south: { t: L('South India', 'दक्षिण भारत'), s: L('Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Telangana', 'कर्नाटक, तमिलनाडु, केरल, आंध्र प्रदेश, तेलंगाना') },
    east: { t: L('East India', 'पूर्वी भारत'), s: L('Bihar, Jharkhand, West Bengal, Odisha', 'बिहार, झारखंड, पश्चिम बंगाल, ओडिशा') },
    ne: { t: L('North-east India', 'पूर्वोत्तर भारत'), s: L('Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal, Sikkim', 'असम, मेघालय, मणिपुर, मिज़ोरम, नागालैंड, त्रिपुरा, अरुणाचल, सिक्किम') }
  };
  const REGS = ['north', 'west', 'central', 'south', 'east', 'ne'];
  function regionOfPin(pin) {
    const s = String(pin || '').replace(/\D/g, ''); if (s.length !== 6) return null;
    const p2 = +s.slice(0, 2), p3 = +s.slice(0, 3);
    if (p3 === 737) return 'ne';                     /* Sikkim */
    if (p2 >= 11 && p2 <= 28) return 'north';        /* Delhi, Haryana, Punjab, Himachal, J&K, UP, Uttarakhand */
    if (p2 >= 30 && p2 <= 44) return 'west';         /* Rajasthan, Gujarat, Maharashtra, Goa */
    if (p2 >= 45 && p2 <= 49) return 'central';      /* Madhya Pradesh, Chhattisgarh */
    if (p2 >= 50 && p2 <= 69) return 'south';        /* Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, Kerala */
    if (p2 >= 70 && p2 <= 77) return 'east';         /* West Bengal, Odisha */
    if (p2 >= 78 && p2 <= 79) return 'ne';           /* Assam and the North-east */
    if (p2 >= 80 && p2 <= 85) return 'east';         /* Bihar, Jharkhand */
    return null;
  }
  const pinRegion = () => { try { const a = S.account && S.account.info ? S.account.info() : null; return regionOfPin(a && a.pincode); } catch (e) { return null; } };
  const regionOf = (d) => (d && REG[d.region] ? d.region : pinRegion());

  /* ---------- food: the one foods table lives in mods/food.js (Version 39.3), with how she eats and its tags ---------- */
  const FT = () => (S.food && S.food.table) || { GROUPS: [], MORE: [], LESS: [], AVOID: [], LOCAL: {} };
  const dietOk = (item, food) => (S.food ? S.food.ok(item, food ? { type: food } : null) : !item[3] || food === 'nonveg' || (food === 'egg' && item[3] === 'e'));
  const foodName = (x) => (S.food ? S.food.name(x) : tx(L(x[1], x[2])));
  /* how she eats: the shared answer (vegetarian unless she said otherwise); a plan's own answer for plans made before 39.3 */
  const foodOf = (d) => (S.food ? S.food.diet().type : ((d && d.food) || 'veg'));
  const simpleFood = (d) => { const f = foodOf(d); return f === 'jain' ? 'veg' : f; };

  /* six food habits, one more every two weeks; each is one tap a day */
  const HABITS = [
    { id: 'half', wk: 1, h: L('Half the plate sabzi', 'आधी थाली सब्ज़ी'), p: L('At lunch or dinner, fill half your plate with sabzi or salad.', 'दोपहर या रात के खाने में आधी थाली सब्ज़ी या सलाद से भरें।') },
    { id: 'protein', wk: 3, h: L('Protein at breakfast', 'नाश्ते में प्रोटीन'), p: L('Add dal, besan cheela, sprouts, paneer, curd or an egg to breakfast.', 'नाश्ते में दाल, बेसन चीला, अंकुरित अनाज, पनीर, दही या अंडा जोड़ें।'),
      /* review FOOD-03 (wording review 17.1): the same habit in the foods she eats */
      pv: { veg: L('Add dal, besan cheela, sprouts, paneer or curd to breakfast.', 'नाश्ते में दाल, बेसन चीला, अंकुरित अनाज, पनीर या दही जोड़ें।'),
        vegn: L('Add dal, besan cheela, sprouts or roasted chana to breakfast.', 'नाश्ते में दाल, बेसन चीला, अंकुरित अनाज या भुने चने जोड़ें।'),
        jain: L('Add dal, besan cheela, paneer or curd to breakfast.', 'नाश्ते में दाल, बेसन चीला, पनीर या दही जोड़ें।'),
        jainn: L('Add dal, besan cheela or roasted chana to breakfast.', 'नाश्ते में दाल, बेसन चीला या भुने चने जोड़ें।'),
        eggn: L('Add dal, besan cheela, sprouts or an egg to breakfast.', 'नाश्ते में दाल, बेसन चीला, अंकुरित अनाज या एक अंडा जोड़ें।') } },
    { id: 'millet', wk: 5, h: L('One millet or whole-grain swap', 'एक बार मोटा या साबुत अनाज'), p: L('Once a day, have bajra, jowar or ragi roti, daliya or brown rice instead of maida or white rice.', 'दिन में एक बार मैदे या सफ़ेद चावल की जगह बाजरा, ज्वार या रागी की रोटी, दलिया या ब्राउन चावल लें।') },
    { id: 'drinks', wk: 7, h: L('No sweet drinks', 'मीठे पेय नहीं'), p: L('Have water, chaas or nimbu pani without sugar instead of cold drinks, packaged juice or very sweet chai.', 'कोल्ड ड्रिंक, पैकेट जूस या बहुत मीठी चाय की जगह पानी, छाछ या बिना चीनी का नींबू पानी लें।'),
      pv: { vegn: L('Have water or nimbu pani without sugar instead of cold drinks, packaged juice or very sweet chai.', 'कोल्ड ड्रिंक, पैकेट जूस या बहुत मीठी चाय की जगह पानी या बिना चीनी का नींबू पानी लें।') } },
    { id: 'snack', wk: 9, h: L('A better snack', 'बेहतर नाश्ता'), p: L('Have fruit, roasted chana or peanuts instead of biscuits, namkeen or mithai.', 'बिस्किट, नमकीन या मिठाई की जगह फल, भुने चने या मूँगफली लें।') },
    { id: 'oil', wk: 11, h: L('Less oil', 'कम तेल'), p: L('Roast, steam, or cook with a spoon of oil instead of frying.', 'तलने की जगह भूनें, भाप में पकाएँ, या एक चम्मच तेल में बनाएँ।') }
  ];
  /* Version 39.32 (baby plan packet, section E): Getting ready's food habits by her situation, one new every 2 weeks: std (folate
     and iron), mix (PMOS or a healthier-weight goal: the two plans mixed) and uw (a BMI under 18.5: more food, never a weight-loss
     line). The PMOS plan's habits keep their reviewed words; each new one has its own reason. */
  const BH = [
    { id: 'greens', h: L('Greens with one meal', 'एक खाने में हरी सब्ज़ी'), p: L('Palak, methi, sarson or any green sabzi, once a day.', 'दिन में एक बार पालक, मेथी, सरसों या कोई भी हरी सब्ज़ी।'), why: 'plan_fb_bgreens' },
    { id: 'dal', h: L('Dal, chana or sprouts every day', 'रोज़ दाल, चना या अंकुरित अनाज'), p: L('A katori of dal, chana, rajma or cooked sprouts.', 'एक कटोरी दाल, चना, राजमा या पके हुए अंकुरित अनाज।'), why: 'plan_fb_bdal' },
    { id: 'fruit', h: L('A fruit a day', 'रोज़ एक फल'), p: L('Guava, orange, amla or banana, or another fruit in season.', 'अमरूद, संतरा, आँवला या केला, या मौसम का कोई और फल।'), why: 'plan_fb_bfruit' },
    { id: 'tea', h: L('Tea an hour away from meals', 'खाने से एक घंटा दूर चाय'), p: L('Have tea or coffee at least an hour before or after a meal.', 'चाय या कॉफ़ी खाने से कम से कम एक घंटा पहले या बाद में लें।'), why: 'plan_fb_btea' },
    { id: 'milk', h: L('Milk or curd every day', 'रोज़ दूध या दही'), p: L('A glass of milk or a katori of curd. No milk? Til, ragi or green leafy sabzi.', 'एक गिलास दूध या एक कटोरी दही। दूध नहीं लेतीं? तिल, रागी या हरी पत्तेदार सब्ज़ी।'), why: 'plan_fb_bmilk' },
    { id: 'katori', h: L('An extra katori of dal, curd or khichdi', 'दाल, दही या खिचड़ी की एक कटोरी और'), p: L('Add one more katori to one meal a day.', 'दिन के किसी एक खाने में एक कटोरी और जोड़ें।'), why: 'plan_fb_bkatori' },
    { id: 'nuts', h: L('Peanuts or roasted chana as a snack', 'नाश्ते में मूँगफली या भुने चने'), p: L('A handful between meals.', 'खानों के बीच एक मुट्ठी।'), why: 'plan_fb_bnuts' }
  ];
  const BSETS = { std: ['greens', 'dal', 'fruit', 'tea', 'milk', 'half'], mix: ['half', 'drinks', 'greens', 'protein', 'millet', 'tea'], uw: ['katori', 'greens', 'nuts', 'milk', 'fruit', 'tea'] };
  const MEAL_AS = { greens: 'half', dal: 'millet', fruit: 'snack', milk: 'millet', katori: 'millet', nuts: 'snack' };   /* the meal line a new habit shares */
  const ALLH = HABITS.concat(BH);
  const habOf = (id) => ALLH.find((h) => h.id === id) || null;
  /* her plan is the Getting ready programme (ttc version 2); her food set, by her BMI (My body's, or the start answers') and her answers */
  const babyD = (d) => !!d && d.pack === 'ttc' && (d.pv || 1) >= 2;
  /* Version 39.34: her plan is My pregnancy version 2 (safety first); her pregnancy week on a day of her plan (her doctor's count,
     as the pregnancy pages show it) */
  const pregV2 = (d) => !!d && d.pack === 'preg' && (d.pv || 1) >= 2;
  const gwAt = (iso) => { const p = S.preg && S.preg.info ? S.preg.info() : null; return p ? Math.floor((p.days + S.diffDays(S.today(), S.fromISO(iso || todayISO()))) / 7) : null; };
  /* Mohit, 29 Oct ("use recommended wordings"): the foot line says what the plan holds: Getting ready's folic acid tablet and
     its versions, the pregnancy plan's iron tablets (one neutral line on a shared phone); a plan not started yet is read by
     the version it will start */
  const footT = (x) => { const pk = packOf(x) || (x && x.pack); const v2 = pk === 'ttc' && ((x && x.pv) || (specOf('ttc') || {}).ver || 1) >= 2;
    return t(!v2 && pk !== 'preg' ? 'plan_foot' : (disc() ? 'plan_foot_d' : (v2 ? 'plan_foot_ttc' : (((x && x.goalKey) || '') === 'iron' ? 'plan_foot_preg' : 'plan_foot_d')))); };   /* Version 39.36: iron tablets only beside her tablet step */
  const bsetOf = (d) => { const b0 = bmiNow(d); const b = b0 != null ? b0 : (ikOf(d).bmi || null); if (b != null && b < 18.5) return 'uw'; return ikOf(d).bset === 'mix' ? 'mix' : 'std'; };
  const habList = (d) => (babyD(d) ? BSETS[bsetOf(d)].map((id, i) => Object.assign({}, habOf(id), { wk: 1 + 2 * i })) : HABITS);
  const habitsOn = (wk, d) => habList(d).filter((h) => h.wk <= Math.max(1, Math.min(wk, N)));
  /* review FOOD-03: a habit's words in the foods she eats (veg, Jain or with eggs; with or without milk) */
  const habitP = (h) => { const dt = S.food ? S.food.diet() : { type: 'veg', milk: true }; const b = dt.type === 'jain' ? 'jain' : (dt.type === 'veg' ? 'veg' : 'egg'); const pv = h.pv || {};
    const v = dt.milk === false ? (pv[b + 'n'] || pv.vegn) : (b === 'egg' ? null : (pv[b] || pv.veg)); return tx(v || h.p); };

  /* ---------- the weekly target: active minutes that build up (2023 PCOS guideline 3.4.3: 150 to 300 a week, 250 for
     modest weight loss; bouts of 10 minutes or more; two non-consecutive strength days) ---------- */
  const START = [50, 75, 120], STEP = [10, 10, 15], STEPW = [15, 15, 20];
  const bodyLast = (d) => (d.body || []).slice().reverse().find((x) => x.w && x.h) || null;
  const bmiOf = (w, h) => (w > 0 && h > 0 ? w / Math.pow(h / 100, 2) : null);
  const bmiNow = (d) => { const b = bodyLast(d); return b ? bmiOf(b.w, b.h) : null; };
  const weightOn = (d) => d.focus === 'weight' && !(bmiNow(d) != null && bmiNow(d) < 23);
  const lvOf = (d) => S.clamp(d.level | 0, 0, 2);
  /* Version 39.5 (journey audit P2-04): a new 12 weeks on the same goal starts at her last 4 weeks' minutes (d.base), and
     the food habits she kept stay on (d.hab0) */
  const target = (d, wk) => { const s0 = d.base && d.base > START[lvOf(d)] ? d.base : START[lvOf(d)]; return Math.min(weightOn(d) ? 250 : 150, round5(s0 + (weightOn(d) ? STEPW : STEP)[lvOf(d)] * (Math.min(Math.max(wk, 1), N) - 1))); };
  const habitsOf = (d, wk) => habitsOn(wk + 2 * ((d && d.hab0) || 0), d);
  const strTarget = (d, wk) => (lvOf(d) === 0 && wk === 1 ? 1 : 2);
  const daySuggest = (d, wk) => Math.max(10, round5(target(d, wk) / 5));
  const weekNo = (d) => (d && d.start ? Math.floor(S.diffDays(S.fromISO(d.start), pToday()) / 7) + 1 : 0);
  const wkShown = (d) => Math.min(weekNo(d), N);
  /* the week to count in: capped at 12 only for a plan that ends there (a pregnancy plan and "Keep going" go on) */
  const wkNow = (d) => Math.max(1, planWeeks(d) && !d.keep ? Math.min(weekNo(d), N) : (d.keep && keepUntil(d) ? Math.min(weekNo(d), keepUntil(d)) : weekNo(d)));   /* review RESULTS-08: a kept plan stops at its year */
  /* Version 37.2: 12 weeks, except a pregnancy plan, which runs until the birth (0: no end) */
  const planWeeks = (d) => { const L0 = (specD(d) || {}).length; return L0 && L0.weeks != null ? L0.weeks : N; };   /* Version 39.4: the spec's length */
  /* Version 39.6 (journey audit P2-05; roadmap section 2, "After the core"): "Keep it light" after the core: weekly look-backs
     to month 4, then monthly, closing at month 12 (the spec's keep) */
  /* review FIXES-02 (long-standing): an after-birth plan lives until her baby's first birthday (life.needs birth:365), so a kept
     year stops there and shows its end, instead of the plan vanishing on the birthday */
  const keepCap = (d) => { const sp = specD(d) || {}; const u = (sp.keep || {}).until || 52; const m = /^birth:(\d+)$/.exec((sp.life || {}).needs || ''); const b = (S.state.situation || {}).deliveredOn;
    if (!m || !b || !d || !d.start) return u; return Math.max(0, Math.min(u, Math.floor(S.diffDays(S.fromISO(d.start), S.addDays(S.fromISO(b), +m[1])) / 7))); };
  const keepUntil = (d) => (d && d.keep ? keepCap(d) : 0);
  /* Version 39.27 (minimalism audit R03): a 12-week plan carries on after week 12 without a question ("Keep it light"); not the
     after-birth plan, which keeps its own end page, nor pregnancy, which has no end */
  const carries = (d) => !!(d && planWeeks(d) === N && packOf(d) && packOf(d) !== 'post');
  const keepWeekly = (d) => (((specD(d) || {}).keep || {}).weekly || 17);
  const finished = (d) => !!(d && d.start && planWeeks(d) && weekNo(d) > (d.keep ? keepUntil(d) : planWeeks(d)));
  const weekDates = (d, wk) => { const s = S.addDays(S.fromISO(d.start), 7 * (wk - 1)); const out = []; for (let i = 0; i < 7; i++) out.push(S.toISO(S.addDays(s, i))); return out; };
  const dayLog = (d, iso) => (d.log || {})[iso] || {};
  const weekMin = (d, wk) => weekDates(d, wk).reduce((a, iso) => a + (dayLog(d, iso).min || 0), 0);
  const weekStr = (d, wk) => weekDates(d, wk).filter((iso) => dayLog(d, iso).str).length;
  const habitDays = (d, days) => { let n = 0; for (let i = 0; i < days; i++) { const p = dayLog(d, S.toISO(S.addDays(pToday(), -i))).plate || {}; if (Object.keys(p).some((k) => p[k])) n++; } return n; };
  /* today's suggestion: two strength days a week (non-consecutive), yoga on the other days; sun salutation from week 3 (week 5
     for a beginner), never with back pain */
  const weekAt = (d, iso) => Math.floor(S.diffDays(S.fromISO(d.start), S.fromISO(iso)) / 7) + 1;
  function todayPlan(d, iso) {
    const on = iso || todayISO(); const wa = weekAt(d, on); const wk = Math.max(1, Math.min(wa, N)); const di = ((S.diffDays(S.fromISO(d.start), S.fromISO(on)) % 7) + 7) % 7; const lim = d.limits || {};
    /* Version 39.12: the strength days she picked for this plan week (Plan your week), else days 2 and 5 */
    const wp = ((d.wplan || {})[wa] || {}).str; const strDays = Array.isArray(wp) && wp.length ? wp.slice() : (strTarget(d, wk) === 1 ? [3] : [1, 4]);
    if (lightOn(d, on)) return { wk: wk, walk: 10, str: false, routine: 'gentle', strDays: strDays, di: di, light: true };   /* Version 39.12: a lighter week she chose */
    const str = strDays.indexOf(di) >= 0;
    const sunOk = !lim.back && !lim.knees && wk >= (lvOf(d) >= 1 ? 3 : 5) && !lutOn(d, on);   /* Version 39.32 */   /* review FOOD-08 */
    return { wk: wk, walk: daySuggest(d, wk), str: str, routine: str ? 'strength' : (di % 2 === 0 ? 'cycle' : (sunOk ? 'sun' : 'gentle')), strDays: strDays, di: di };
  }
  function prune(d) { const keys = Object.keys(d.log); if (keys.length <= 400) return; keys.sort().slice(0, keys.length - 400).forEach((k) => { delete d.log[k]; }); }
  function addMin(d, n) { const td = todayISO(); const x = d.log[td] = d.log[td] || {}; x.min = S.clamp((x.min || 0) + n, 0, 600); prune(d); remSync(d); }
  function setHabit(d, id, val) { const td = todayISO(); const x = d.log[td] = d.log[td] || {}; x.plate = x.plate || {}; x.plate[id] = !!val; }
  const remSync = (d) => { nudgeSync(d); windSync(d); folicSync(d); pfSync(d);   /* Version 39.56 */ const r = S.reminders.get('plan'); if (!r || !d.start) return; const x = dayLog(d, todayISO()); const ok = recCi(d) ? recDone(todayISO()) : !!(x.ci || x.rest || allDoneToday(d)); const tt = remT(d); S.reminders.upsert(Object.assign({ id: 'plan', doneOn: ok ? todayISO() : null }, r.title && r.title.en === tt.en ? {} : { title: tt }), { quiet: true }); };   /* Version 39.47: its words follow her evening */   /* Version 39.46: to day 41 her recovery check is her check-in */   /* Version 39.13: done only when every step is */   /* a done mark is never her setting a reminder */
  /* a pregnancy plan's reminder ends two weeks after her due date, in case nobody tells Sakhi the baby came */
  /* Version 39.6: a kept plan's reminder ends at month 12. Version 39.27 (R03): one that carries on rings past week 12, to 4 weeks
     after the last day she opened Sakhi (her plan's year at most), so it never rings on for months she isn't using it */
  const remEnd = (d) => { if (planWeeks(d)) { const s0 = S.fromISO(d.start); const core = S.toISO(S.addDays(s0, planWeeks(d) * 7 - 1)); if (!(d.keep || carries(d))) return core;
      const cap = S.toISO(S.addDays(s0, (d.keep ? keepUntil(d) : keepCap(d)) * 7 - 1)); const roll = S.toISO(S.addDays(S.fromISO(todayISO() > core ? todayISO() : core), 28)); return roll < cap ? roll : cap; } const pi = S.preg && S.preg.info ? S.preg.info() : null; return pi && pi.edd ? S.toISO(S.addDays(S.fromISO(pi.edd), 14)) : null; };
  /* paused (pregnancy, the first 6 weeks after a birth): its daily reminder stops too */
  /* ... and when the plan no longer applies (a pregnancy ended, a pregnancy began on the trying plan, a new pregnancy after a birth) */
  /* ... it comes back when the plan applies again (remGone: Sakhi took it away, not her), and a pregnancy plan's end follows her due date */
  /* Version 39.27 (minimalism audit R03): day 85, her steps carry on; checked before any screen draws, so Today shows it at once */
  const carrySync = () => { try { const d = raw(); if (d && carries(d) && !d.keep && d.start && d.go !== false && !pausedFor(d) && weekNo(d) > N && !d.endSeen && keepCap(d) >= weekNo(d)) { d.keep = true; d.carried = todayISO(); S.saveQuiet(); } } catch (e) { /* nothing to carry */ } };
  const pauseSync0 = () => { try { const d = raw(); if (!d) return; if (pastBirthday(d)) { closePlan(D()); S.saveQuiet(); return; } let r = S.reminders.get('plan');
    carrySync();
    if (d.pauseUntil && !selfPaused(d)) { unpause(d); S.saveQuiet(); r = S.reminders.get('plan'); }   /* Version 39.5: her week's pause is over */
    if (selfPaused(d)) { if (r && r.on !== false && (r.start || '') < d.pauseUntil) { S.reminders.upsert({ id: 'plan', start: d.pauseUntil }, { quiet: true }); d.remPaused = 'start'; S.saveQuiet(); } return; }   /* V39.9 review FIXES-04: only its start moves */
    if (r && r.time && /^\d\d:\d\d$/.test(r.time) && r.time >= '17:00' && r.time !== (d.ciSet || d.remAt)) { d.remAt = r.time; d.remPick = true; d.ciSet = r.time; S.saveQuiet(); }   /* an evening time she set in Reminders is her check-in time (mig moves a daytime one to 8 pm) */
    else if (r && r.on !== false && d.start && ciAt(d) !== r.time) { d.ciSet = ciAt(d); S.reminders.upsert({ id: 'plan', time: d.ciSet }, { quiet: true }); S.saveQuiet(); }   /* Version 39.27 (R02): after her walk, as it moves */
    const gone = !!(pausedFor(d) || (d.start && d.start <= todayISO() && d.go !== false && !packOf(d)));
    if (r && gone) { S.reminders.remove('plan'); if (r.on !== false) d.remGone = todayISO(); else delete d.remGone; S.saveQuiet(); return; }   /* one she switched off stays off */
    if (!r && !gone && d.remGone && packOf(d) && !finished(fullD(d))) { delete d.remGone; remOnNow(d, true); S.saveQuiet(); return; }
    if (r && !gone && packOf(d) === 'preg') { const u = remEnd(d); if (u && r.until !== u) { S.reminders.upsert({ id: 'plan', until: u }, { quiet: true }); S.saveQuiet(); } }
    if (r && !gone && planWeeks(d) && (r.until || null) !== remEnd(d)) { S.reminders.upsert({ id: 'plan', until: remEnd(d) }, { quiet: true }); S.saveQuiet(); }   /* review RESULTS-02; Version 39.27: its end follows her (remEnd) */
  } catch (e) { /* nothing to stop */ } };
  const pauseSync = () => { pauseSync0(); const d = raw(); if (d) { nudgeSync(d); windSync(d); folicSync(d); pfSync(d); } };   /* Version 39.56: her morning set rests and comes back with her plan */   /* Version 39.12: her nudge follows her plan; 39.22: on by default, and her wind-down too */

  /* ---------- the moving drawings: one figure, its joints moved between two positions (looping like a GIF) ----------
     h head, n neck, p pelvis; a = arms [far, near] from the neck; l = legs [far, near] from the pelvis; side view faces right */
  const P = {
    pray: { h: [60, 19], n: [60, 30], p: [60, 58], a: [[[50, 42], [59, 40]], [[70, 42], [61, 40]]], l: [[[57, 76], [56, 94]], [[63, 76], [64, 94]]], fv: 1 },
    armsup: { h: [60, 24], n: [60, 35], p: [60, 62], a: [[[51, 23], [54, 8]], [[69, 23], [66, 8]]], l: [[[58, 78], [57, 94]], [[62, 78], [63, 94]]], fv: 1 },
    tree: { h: [60, 24], n: [60, 35], p: [60, 62], a: [[[50, 23], [59, 6]], [[70, 23], [61, 6]]], l: [[[58, 78], [57, 94]], [[75, 72], [60, 80]]], fv: 1 },
    triangle: { h: [36, 31], n: [44, 38], p: [60, 60], a: [[[49, 23], [53, 8]], [[40, 53], [37, 69]]], l: [[[46, 77], [35, 94]], [[74, 77], [85, 94]]], fv: 1 },
    wide: { h: [60, 19], n: [60, 30], p: [60, 60], a: [[[46, 32], [32, 30]], [[74, 32], [88, 30]]], l: [[[46, 77], [35, 94]], [[74, 77], [85, 94]]], fv: 1 },
    warmup: { h: [60, 19], n: [60, 30], p: [60, 58], a: [[[46, 33], [32, 31]], [[74, 33], [88, 31]]], l: [[[56, 76], [54, 94]], [[64, 76], [66, 94]]], fv: 1 },
    warmup2: { h: [60, 19], n: [60, 30], p: [60, 58], a: [[[48, 22], [40, 10]], [[72, 22], [80, 10]]], l: [[[56, 76], [54, 94]], [[64, 76], [66, 94]]], fv: 1 },
    march: { h: [61, 19], n: [60, 30], p: [60, 58], a: [[[67, 43], [73, 35]], [[54, 43], [51, 55]]], l: [[[59, 76], [58, 94]], [[73, 62], [71, 80]]] },
    march2: { h: [61, 19], n: [60, 30], p: [60, 58], a: [[[54, 43], [51, 55]], [[67, 43], [73, 35]]], l: [[[73, 62], [71, 80]], [[61, 76], [62, 94]]] },
    walk: { h: [65, 20], n: [62, 31], p: [60, 58], a: [[[67, 44], [73, 52]], [[55, 44], [50, 55]]], l: [[[54, 76], [45, 92]], [[68, 75], [72, 94]]] },
    walk2: { h: [65, 20], n: [62, 31], p: [60, 58], a: [[[55, 44], [50, 55]], [[67, 44], [73, 52]]], l: [[[68, 75], [72, 94]], [[54, 76], [45, 92]]] },
    prays: { h: [61, 19], n: [60, 30], p: [60, 58], a: [[[66, 42], [70, 38]], [[67, 43], [71, 39]]], l: [[[59, 76], [59, 94]], [[61, 76], [61, 94]]] },
    reach: { h: [56, 22], n: [58, 32], p: [61, 59], a: [[[55, 18], [53, 5]], [[56, 18], [54, 5]]], l: [[[61, 77], [60, 94]], [[62, 77], [61, 94]]] },
    fwdbend: { h: [74, 85], n: [71, 76], p: [60, 55], a: [[[73, 85], [70, 94]], [[75, 85], [72, 94]]], l: [[[60, 75], [61, 94]], [[62, 75], [63, 94]]] },
    lunge: { h: [69, 38], n: [63, 47], p: [52, 73], a: [[[66, 70], [68, 93]], [[68, 70], [70, 93]]], l: [[[33, 88], [14, 92]], [[71, 72], [74, 94]]] },
    lunge2: { h: [69, 38], n: [63, 47], p: [52, 73], a: [[[66, 70], [68, 93]], [[68, 70], [70, 93]]], l: [[[71, 72], [74, 94]], [[33, 88], [14, 92]]] },
    plank: { h: [88, 64], n: [78, 69], p: [48, 79], a: [[[78, 81], [78, 93]], [[79, 81], [79, 93]]], l: [[[32, 86], [16, 92]], [[32, 86], [16, 92]]] },
    ashtanga: { h: [83, 88], n: [73, 89], p: [46, 76], a: [[[70, 80], [75, 93]], [[71, 80], [76, 93]]], l: [[[34, 93], [18, 93]], [[34, 93], [18, 93]]] },
    prone: { h: [86, 86], n: [77, 90], p: [52, 92], a: [[[70, 86], [78, 93]], [[71, 86], [79, 93]]], l: [[[34, 93], [15, 93]], [[34, 93], [15, 93]]] },
    cobra: { h: [85, 61], n: [77, 71], p: [52, 91], a: [[[74, 86], [81, 93]], [[75, 86], [82, 93]]], l: [[[34, 93], [15, 93]], [[34, 93], [15, 93]]] },
    downdog: { h: [79, 84], n: [76, 75], p: [56, 47], a: [[[80, 84], [84, 93]], [[81, 84], [85, 93]]], l: [[[43, 70], [30, 93]], [[44, 70], [31, 93]]] },
    child: { h: [80, 87], n: [69, 82], p: [40, 77], a: [[[89, 91], [103, 92]], [[89, 92], [103, 93]]], l: [[[61, 92], [33, 93]], [[62, 93], [34, 94]]] },
    kneel: { h: [62, 29], n: [61, 40], p: [60, 64], a: [[[55, 52], [58, 62]], [[56, 53], [60, 63]]], l: [[[56, 93], [36, 93]], [[57, 93], [37, 94]]] },
    camel: { h: [46, 30], n: [52, 39], p: [60, 64], a: [[[44, 50], [54, 62]], [[45, 51], [56, 63]]], l: [[[56, 93], [36, 93]], [[57, 93], [37, 94]]] },
    locust: { h: [87, 87], n: [78, 90], p: [52, 91], a: [[[64, 93], [50, 93]], [[65, 93], [51, 93]]], l: [[[34, 93], [15, 93]], [[36, 84], [18, 77]]] },
    bridgedown: { h: [15, 87], n: [26, 89], p: [56, 90], a: [[[40, 93], [56, 93]], [[41, 93], [57, 93]]], l: [[[74, 70], [79, 93]], [[75, 70], [80, 93]]] },
    bridge: { h: [15, 87], n: [26, 89], p: [58, 70], a: [[[40, 93], [56, 93]], [[41, 93], [57, 93]]], l: [[[76, 66], [79, 93]], [[77, 66], [80, 93]]] },
    knees: { h: [19, 85], n: [30, 88], p: [57, 90], a: [[[40, 79], [46, 68]], [[41, 80], [47, 68]]], l: [[[42, 68], [60, 66]], [[43, 69], [61, 67]]] },
    knees2: { h: [21, 82], n: [31, 86], p: [57, 89], a: [[[41, 77], [47, 66]], [[42, 78], [48, 66]]], l: [[[44, 65], [62, 63]], [[45, 66], [63, 64]]] },
    rest: { h: [14, 87], n: [25, 90], p: [58, 91], a: [[[40, 93], [54, 94]], [[41, 93], [55, 94]]], l: [[[77, 92], [97, 92]], [[77, 93], [97, 93]]] },
    sitlong: { h: [46, 46], n: [44, 57], p: [40, 88], a: [[[36, 72], [30, 91]], [[48, 72], [52, 87]]], l: [[[63, 91], [88, 91]], [[63, 90], [88, 90]]] },
    twist: { h: [47, 46], n: [44, 57], p: [40, 88], a: [[[33, 72], [27, 91]], [[55, 60], [63, 66]]], l: [[[63, 91], [88, 91]], [[57, 68], [61, 91]]] },
    butterfly: { h: [60, 44], n: [60, 55], p: [60, 84], a: [[[48, 70], [58, 88]], [[72, 70], [62, 88]]], l: [[[36, 76], [57, 91]], [[84, 76], [63, 91]]], fv: 1 },
    butterfly2: { h: [60, 44], n: [60, 55], p: [60, 84], a: [[[48, 70], [58, 88]], [[72, 70], [62, 88]]], l: [[[38, 70], [57, 91]], [[82, 70], [63, 91]]], fv: 1 },
    sit: { h: [60, 47], n: [60, 58], p: [60, 86], a: [[[48, 71], [42, 84]], [[72, 71], [78, 84]]], l: [[[42, 88], [66, 92]], [[78, 88], [54, 92]]], fv: 1 },
    chairup: { h: [66, 19], n: [64, 30], p: [62, 58], a: [[[70, 43], [80, 45]], [[71, 44], [81, 46]]], l: [[[64, 76], [66, 94]], [[65, 76], [67, 94]]], prop: 'chair' },
    chair: { h: [66, 33], n: [60, 42], p: [46, 69], a: [[[69, 50], [81, 52]], [[70, 51], [82, 53]]], l: [[[69, 76], [66, 94]], [[70, 76], [67, 94]]], prop: 'chair' },
    wallout: { h: [76, 31], n: [71, 40], p: [58, 66], a: [[[83, 39], [95, 37]], [[84, 40], [95, 38]]], l: [[[51, 80], [44, 94]], [[52, 80], [45, 94]]], prop: 'wall' },
    wall: { h: [84, 26], n: [78, 35], p: [61, 64], a: [[[83, 47], [95, 35]], [[84, 48], [95, 36]]], l: [[[52, 79], [44, 94]], [[53, 79], [45, 94]]], prop: 'wall' },
    stepfloor: { h: [54, 18], n: [53, 29], p: [52, 57], a: [[[58, 43], [61, 55]], [[48, 43], [46, 55]]], l: [[[52, 76], [50, 94]], [[54, 76], [54, 94]]], prop: 'step' },
    step: { h: [60, 18], n: [58, 29], p: [56, 56], a: [[[63, 43], [66, 54]], [[52, 43], [49, 55]]], l: [[[54, 76], [50, 94]], [[70, 65], [74, 80]]], prop: 'step' },
    calfdown: { h: [60, 18], n: [58, 29], p: [58, 56], a: [[[72, 40], [90, 40]], [[73, 41], [90, 41]]], l: [[[59, 75], [60, 94], [67, 94]], [[60, 75], [61, 94], [68, 94]]], prop: 'wall' },
    calf: { h: [60, 16], n: [58, 27], p: [58, 54], a: [[[72, 38], [90, 38]], [[73, 39], [90, 39]]], l: [[[59, 73], [61, 90], [67, 94]], [[60, 73], [62, 90], [68, 94]]], prop: 'wall' },
    /* Version 39.52: pregnancy yoga's positions (drafts for the physiotherapist). fv: she faces you (her bump sits on her front);
       m: a point mid-spine, so her back can round (cat) or dip a little (cow); bd 'down': lying on her side, her bump rests
       towards the floor */
    seat: { h: [38, 31], n: [37, 42], p: [36, 68], a: [[[39, 56], [47, 66]], [[40, 57], [48, 67]]], l: [[[54, 69], [55, 94]], [[55, 70], [56, 94]]], prop: 'chair' },
    seatmarch: { h: [38, 31], n: [37, 42], p: [36, 68], a: [[[38, 56], [46, 50]], [[39, 57], [47, 51]]], l: [[[54, 69], [55, 94]], [[52, 58], [57, 80]]], prop: 'chair' },
    seatmarch2: { h: [38, 31], n: [37, 42], p: [36, 68], a: [[[38, 56], [46, 50]], [[39, 57], [47, 51]]], l: [[[52, 58], [57, 80]], [[55, 70], [56, 94]]], prop: 'chair' },
    allfours: { h: [79, 68], n: [70, 68], p: [42, 75], a: [[[71, 81], [72, 94]], [[72, 81], [73, 94]]], l: [[[42, 93], [22, 94]], [[43, 93], [23, 94]]] },
    rockback: { h: [71, 74], n: [62, 74], p: [34, 80], a: [[[67, 84], [72, 94]], [[68, 84], [73, 94]]], l: [[[42, 93], [22, 94]], [[43, 93], [23, 94]]] },
    cat: { h: [76, 78], n: [70, 70], m: [56, 63], p: [42, 76], a: [[[71, 82], [72, 94]], [[72, 82], [73, 94]]], l: [[[42, 93], [22, 94]], [[43, 93], [23, 94]]] },
    cow: { h: [79, 61], n: [70, 67], m: [56, 72], p: [42, 74], a: [[[71, 80], [72, 94]], [[72, 80], [73, 94]]], l: [[[42, 93], [22, 94]], [[43, 93], [23, 94]]] },
    sidelie: { h: [15, 80], n: [25, 85], p: [57, 87], a: [[[18, 94], [12, 88]], [[34, 92], [43, 94]]], l: [[[74, 93], [92, 94]], [[74, 88], [92, 90]]], prop: 'pillow', bd: 'down' },
    sidedown: { h: [15, 80], n: [25, 85], p: [57, 87], a: [[[18, 94], [12, 88]], [[34, 92], [43, 94]]], l: [[[75, 93], [94, 94]], [[75, 90], [94, 92]]], bd: 'down' },
    sideleg: { h: [15, 80], n: [25, 85], p: [57, 87], a: [[[18, 94], [12, 88]], [[34, 92], [43, 94]]], l: [[[75, 93], [94, 94]], [[74, 80], [91, 73]]], bd: 'down' },
    leanfwd: { h: [86, 38], n: [77, 44], p: [52, 58], a: [[[87, 51], [96, 44]], [[88, 52], [96, 45]]], l: [[[51, 76], [49, 94]], [[53, 76], [52, 94]]], prop: 'wall' },
    leanfwd2: { h: [83, 41], n: [74, 46], p: [48, 61], a: [[[85, 52], [96, 44]], [[86, 53], [96, 45]]], l: [[[50, 78], [49, 94]], [[52, 78], [52, 94]]], prop: 'wall' },
    chairfwd: { h: [56, 62], n: [50, 53], p: [37, 68], a: [[[54, 66], [58, 80]], [[55, 67], [59, 81]]], l: [[[55, 69], [57, 94]], [[56, 70], [58, 94]]], prop: 'chair' }
  };
  /* moves that loop: [from, to, seconds per loop, holds at the end?] */
  const ANIM = { chair: ['chairup', 'chair', 3, false], wall: ['wallout', 'wall', 2.6, false], step: ['stepfloor', 'step', 2.4, false], bridge: ['bridgedown', 'bridge', 4, true], cobra: ['prone', 'cobra', 5, true],
    locust: ['prone', 'locust', 4, true], camel: ['kneel', 'camel', 6, true], march: ['march', 'march2', 1.4, false], walk: ['walk', 'walk2', 1.1, false], calf: ['calfdown', 'calf', 2.4, false],
    armsup: ['pray', 'armsup', 6, true], triangle: ['wide', 'triangle', 6, true], butterfly: ['butterfly', 'butterfly2', 1.6, false], twist: ['sitlong', 'twist', 6, true], knees: ['knees', 'knees2', 3, false], warmup: ['warmup', 'warmup2', 3, false],
    /* Version 39.52: pregnancy yoga */
    seatmarch: ['seatmarch', 'seatmarch2', 1.6, false], allfours: ['allfours', 'rockback', 4, false], cat: ['cat', 'cow', 6, false], sideleg: ['sidedown', 'sideleg', 3, true], leanfwd: ['leanfwd', 'leanfwd2', 4, false] };
  const mid = (F) => F.m || [(F.n[0] + F.p[0]) / 2, (F.n[1] + F.p[1]) / 2];
  const lerp = (A, B, k) => { const m = (a, b) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const o = { prop: A.prop, fv: A.fv, bd: A.bd, h: m(A.h, B.h), n: m(A.n, B.n), p: m(A.p, B.p), a: A.a.map((x, i) => x.map((q, j) => m(q, B.a[i][j]))), l: A.l.map((x, i) => x.map((q, j) => m(q, B.l[i][j]))) };
    if (A.m || B.m) o.m = m(mid(A), mid(B)); return o; };
  const pts = (arr) => arr.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const PROPS = { chair: '<path d="M27 44v50M27 71h21M46 71v23"/>', wall: '<path d="M97 10v84"/>', step: '<path d="M56 80h40v14"/>', pillow: '<path d="M68 91a6 2.6 0 1 0 12 0a6 2.6 0 1 0 -12 0"/>' };
  /* Version 39.52: her bump in pregnancy yoga (k: 0.75 in the middle three months, 1 in the last), on her front: from her spine
     when the figure is side-on, round on her middle when she faces you, resting towards the floor when she lies on her side */
  const spine = (f) => (f.m ? [f.n, f.m, f.p] : [f.n, f.p]);
  function bumpOf(f, k) {
    if (!k) return null;
    const n = f.n, p = f.p, dx = p[0] - n[0], dy = p[1] - n[1], len = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx) * 180 / Math.PI;
    if (f.fv) { const r = 4 + 3.2 * k; return { cx: n[0] + dx * 0.72, cy: n[1] + dy * 0.72, rx: r, ry: r, a: 0 }; }
    const rx = 3 + 6 * k, ry = 2 + 5 * k;
    if (f.bd === 'down') return { cx: n[0] + dx * 0.6, cy: 95 - ry, rx: rx, ry: ry, a: a };
    const off = 3.2 + ry * 0.7;
    return { cx: n[0] + dx * 0.64 + (dy / len) * off, cy: n[1] + dy * 0.64 - (dx / len) * off, rx: rx, ry: ry, a: a };
  }
  const bumpKv = (b) => ({ cx: b.cx.toFixed(1), cy: b.cy.toFixed(1), rx: b.rx.toFixed(1), ry: b.ry.toFixed(1), transform: 'rotate(' + b.a.toFixed(1) + ' ' + b.cx.toFixed(1) + ' ' + b.cy.toFixed(1) + ')' });
  const bumpAttr = (b) => { const kv = bumpKv(b); return Object.keys(kv).map((k) => k + '="' + kv[k] + '"').join(' '); };
  function figSvg(id, o) {
    const f = P[id] || P.pray; o = o || {};
    const line = (k, list, w, op) => '<polyline data-k="' + k + '" points="' + pts(list) + '" stroke-width="' + w + '"' + (op ? ' opacity="0.45"' : '') + '/>';
    const bp = bumpOf(f, o.bump);
    const body = '<line class="pl-mat" x1="10" y1="96" x2="110" y2="96"/>' + (f.prop ? '<g class="pl-prop">' + PROPS[f.prop] + '</g>' : '') +
      '<g class="pl-lim">' + line('a0', [f.n].concat(f.a[0]), 5, 1) + line('l0', [f.p].concat(f.l[0]), 6, 1) + line('t', spine(f), 8) + (bp ? '<ellipse class="pl-bump" data-k="b" ' + bumpAttr(bp) + '/>' : '') + line('l1', [f.p].concat(f.l[1]), 6) + line('a1', [f.n].concat(f.a[1]), 5) + '</g>' +
      '<circle data-k="h" cx="' + f.h[0] + '" cy="' + f.h[1] + '" r="7"/>';
    return '<svg class="pl-fig' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 120 100" aria-hidden="true" focusable="false"' + (o.id ? ' id="' + o.id + '"' : '') + (bp ? ' data-bump="' + o.bump + '"' : '') + '>' + (o.mirror ? '<g transform="translate(120 0) scale(-1 1)">' + body + '</g>' : body) + '</svg>';
  }
  function setFig(svg, f) {
    const q = (k) => svg.querySelector('[data-k="' + k + '"]');
    const set = (k, list) => { const el = q(k); if (el) el.setAttribute('points', pts(list)); };
    set('a0', [f.n].concat(f.a[0])); set('l0', [f.p].concat(f.l[0])); set('t', spine(f)); set('l1', [f.p].concat(f.l[1])); set('a1', [f.n].concat(f.a[1]));
    const h = q('h'); if (h) { h.setAttribute('cx', f.h[0].toFixed(1)); h.setAttribute('cy', f.h[1].toFixed(1)); }
    const b = q('b'), bp = b ? bumpOf(f, +svg.getAttribute('data-bump')) : null; if (bp) { const kv = bumpKv(bp); Object.keys(kv).forEach((k) => b.setAttribute(k, kv[k])); }   /* Version 39.52 */
  }
  /* one animation at a time (the step on screen); it stops when the figure leaves the page or she leaves the routine */
  let raf = 0;
  const stopAnim = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  function animate(svg, from, to, dur, hold, once) {
    stopAnim(); if (!svg || !P[from] || !P[to]) return;
    if (reduced()) { setFig(svg, P[to]); return; }
    const A = P[from], B = P[to], t0 = (window.performance ? performance.now() : Date.now());
    const step = (now) => {
      if (!svg.isConnected) { stopAnim(); return; }
      const sec = ((now || Date.now()) - t0) / 1000; let k;
      if (once) { const x = Math.min(1, sec / dur); k = 0.5 - Math.cos(x * Math.PI) / 2; setFig(svg, lerp(A, B, k)); if (x >= 1) { raf = 0; return; } }
      else { const ph = (sec / dur) % 1; k = hold ? (ph < 0.3 ? 0.5 - Math.cos((ph / 0.3) * Math.PI) / 2 : (ph < 0.7 ? 1 : 0.5 + Math.cos(((ph - 0.7) / 0.3) * Math.PI) / 2)) : 0.5 - Math.cos(ph * 2 * Math.PI) / 2; setFig(svg, lerp(A, B, k)); }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  /* ---------- the routines (Common Yoga Protocol poses in our own words, and home strength moves) ----------
     step: { pose, s (seconds), n (name), p (how), reps (sets), side (both sides), knees: {...} instead with knee pain, back: skip with back pain } */
  const W = { pose: 'warmup', s: 60, n: L('Loosen up', 'शरीर खोलें'), p: L('Stand tall. Turn your head slowly side to side, roll your shoulders and swing your arms in big circles.', 'सीधी खड़ी हों। धीरे-धीरे सिर दाएँ-बाएँ घुमाएँ, कंधे घुमाएँ और हाथों को बड़े गोल घुमाएँ।') };
  const MARCH = { pose: 'march', s: 60, n: L('March on the spot', 'एक जगह क़दमताल'), p: L('Lift your knees one by one and swing your arms. Breathe normally.', 'बारी-बारी से घुटने उठाएँ और हाथ झुलाएँ। सामान्य साँस लें।') };
  const REST = { pose: 'rest', s: 60, n: L('Shavasana (rest)', 'शवासन (आराम)'), p: L('Lie flat with your arms by your sides. Let your whole body go loose and breathe slowly.', 'सीधी लेट जाएँ, हाथ बग़ल में। पूरा शरीर ढीला छोड़ें और धीरे साँस लें।') };
  const BRIDGE = { pose: 'bridge', s: 15, reps: 3, n: L('Setu bandhasana (bridge)', 'सेतुबंधासन'), p: L('Lie on your back, knees bent, feet flat. Lift your hips, hold, and lower them slowly.', 'पीठ के बल लेटें, घुटने मोड़ें, तलवे ज़मीन पर। कूल्हे ऊपर उठाएँ, रुकें और धीरे से नीचे लाएँ।') };
  const KNEES = { pose: 'knees', s: 30, n: L('Pavanamuktasana (knees to chest)', 'पवनमुक्तासन'), p: L('Hug both knees to your chest and rock gently from side to side.', 'दोनों घुटनों को छाती से लगाएँ और धीरे-धीरे दाएँ-बाएँ हिलें।') };
  const BUTTERFLY = { pose: 'butterfly', s: 60, n: L('Bhadrasana (butterfly)', 'भद्रासन (तितली)'), p: L('Sit with the soles of your feet together and let your knees drop out. Sit tall and breathe. Move your knees gently up and down if you like.', 'पैरों के तलवे मिलाकर बैठें और घुटनों को ढीला छोड़ें। सीधी बैठें और साँस लें। चाहें तो घुटनों को धीरे-धीरे ऊपर-नीचे करें।') };
  const CHAIR_FWD = { pose: 'chair', fig: 'chairfwd', s: 40, n: L('Seated forward bend', 'कुर्सी पर आगे झुकना'), p: L('Sit on a chair, feet apart, and bend forward slowly with your arms hanging down. Breathe.', 'कुर्सी पर पैर फैलाकर बैठें, और हाथ नीचे लटकाकर धीरे से आगे झुकें। साँस लें।') };
  const R = {
    gentle: { hue: 'green', first: 'armsup', steps: [W, MARCH,
      { pose: 'armsup', s: 30, reps: 2, n: L('Tadasana (palm tree)', 'ताड़ासन'), p: L('Raise your arms above your head, stretch up and breathe slowly. Rise on your toes if you can.', 'हाथ सिर के ऊपर उठाएँ, ऊपर की ओर खिंचें और धीरे साँस लें। हो सके तो पंजों पर उठें।') },
      { pose: 'tree', s: 20, side: true, n: L('Vrikshasana (tree)', 'वृक्षासन'), p: L('Stand on one leg with the other foot on your ankle or calf, never on the knee. Hold a wall if you need to.', 'एक पैर पर खड़ी हों, दूसरा पैर टखने या पिंडली पर रखें, घुटने पर कभी नहीं। ज़रूरत हो तो दीवार पकड़ें।') },
      { pose: 'triangle', s: 20, side: true, n: L('Trikonasana (triangle)', 'त्रिकोणासन'), p: L('Feet wide apart. Slide one hand down your leg and raise the other arm. Look up if your neck is comfortable.', 'पैर फैलाकर खड़ी हों। एक हाथ पैर पर नीचे सरकाएँ और दूसरा हाथ ऊपर उठाएँ। गर्दन आराम से हो तो ऊपर देखें।') },
      BUTTERFLY,
      { pose: 'twist', s: 20, side: true, n: L('Vakrasana (seated twist)', 'वक्रासन'), p: L('Sit with your legs out, bend one knee and turn gently towards it. Keep your back long.', 'पैर सीधे करके बैठें, एक घुटना मोड़ें और धीरे से उसकी ओर मुड़ें। पीठ सीधी रखें।') },
      BRIDGE, KNEES, REST] },
    cycle: { hue: 'rose', first: 'butterfly', steps: [W,
      { pose: 'child', s: 40, knees: CHAIR_FWD, n: L('Shashankasana (child pose)', 'शशांकासन'), p: L('Kneel, sit back on your heels and stretch your arms forward on the floor. Rest your forehead down.', 'घुटनों के बल बैठें, एड़ियों पर बैठें और हाथ आगे ज़मीन पर फैलाएँ। माथा नीचे टिकाएँ।') },
      BUTTERFLY,
      { pose: 'camel', s: 15, reps: 2, knees: { pose: 'armsup', s: 30, reps: 2, n: L('Tadasana (palm tree)', 'ताड़ासन'), p: L('Standing, raise your arms above your head and stretch up. Breathe slowly.', 'खड़ी होकर हाथ सिर के ऊपर उठाएँ और ऊपर की ओर खिंचें। धीरे साँस लें।') }, n: L('Ardha ushtrasana (half camel)', 'अर्ध उष्ट्रासन'), p: L('Kneel up with your hands on your lower back. Push your hips forward and lean back a little. Come up slowly.', 'घुटनों पर खड़ी हों, हाथ कमर के निचले हिस्से पर। कूल्हे आगे करें और थोड़ा पीछे झुकें। धीरे से वापस आएँ।') },
      { pose: 'cobra', s: 15, reps: 3, n: L('Bhujangasana (cobra)', 'भुजंगासन'), p: L('Lie on your tummy, hands under your shoulders. Lift your head and chest gently, elbows bent, hips down.', 'पेट के बल लेटें, हथेलियाँ कंधों के नीचे। सिर और छाती धीरे से उठाएँ, कोहनियाँ मुड़ी रहें, कूल्हे नीचे।') },
      { pose: 'locust', s: 15, side: true, back: true, n: L('Ardha shalabhasana (half locust)', 'अर्ध शलभासन'), p: L('Still on your tummy, lift one straight leg a little, hold, and lower it.', 'पेट के बल ही, एक सीधा पैर थोड़ा उठाएँ, रुकें और नीचे लाएँ।') },
      BRIDGE, KNEES, Object.assign({}, REST, { s: 90 })] },
    strength: { hue: 'orange', first: 'chair', steps: [W, MARCH,
      { pose: 'chair', s: 45, reps: 2, n: L('Chair squats', 'कुर्सी से उठक-बैठक'), p: L('Sit on a chair and stand up without using your hands, then sit down slowly. 10 times.', 'कुर्सी पर बैठें और बिना हाथों के सहारे खड़ी हों, फिर धीरे से बैठें। 10 बार।') },
      { pose: 'wall', s: 45, reps: 2, n: L('Wall push-ups', 'दीवार पर पुश-अप'), p: L('Hands on a wall at shoulder height. Bend your elbows to bring your chest close, then push back. 10 times.', 'कंधे की ऊँचाई पर हथेलियाँ दीवार पर रखें। कोहनियाँ मोड़कर छाती पास लाएँ, फिर वापस धकेलें। 10 बार।') },
      { pose: 'step', s: 45, side: true, knees: Object.assign({}, MARCH, { s: 45 }), n: L('Step-ups', 'सीढ़ी पर चढ़ना-उतरना'), p: L('Step up onto a stair with one foot, then the other, and step down. Hold the railing. 10 times on each leg.', 'एक पैर से सीढ़ी पर चढ़ें, फिर दूसरे से, और उतरें। रेलिंग पकड़ें। हर पैर से 10 बार।') },
      { pose: 'bridge', s: 45, reps: 2, n: L('Bridge lifts', 'ब्रिज'), p: L('Lie on your back, knees bent. Lift your hips and lower them slowly. 12 times.', 'पीठ के बल लेटें, घुटने मोड़ें। कूल्हे उठाएँ और धीरे से नीचे लाएँ। 12 बार।') },
      { pose: 'calf', s: 30, n: L('Heel raises', 'एड़ी उठाना'), p: L('Hold a wall or a chair. Rise up on your toes and come down slowly. 15 times.', 'दीवार या कुर्सी पकड़ें। पंजों पर उठें और धीरे से नीचे आएँ। 15 बार।') },
      REST] },
    /* 30 Oct: Anulom vilom has its own 3D still, her right hand at her nose (fig: 'nostril'); without web/fig it keeps her sitting */
    calm: { hue: 'sky', first: 'sit', steps: [
      { pose: 'sit', fig: 'nostril', s: 180, breath: [4, 0, 6, 0], n: L('Anulom vilom (alternate nostril breathing)', 'अनुलोम-विलोम'), p: L('Sit comfortably. Close your right nostril with your thumb and breathe in through the left. Close the left and breathe out through the right. Then in through the right, out through the left. Slowly, without holding your breath.', 'आराम से बैठें। अंगूठे से दायाँ नथुना बंद करें और बाएँ से साँस लें। बायाँ बंद करें और दाएँ से छोड़ें। फिर दाएँ से लें, बाएँ से छोड़ें। धीरे-धीरे, साँस रोके बिना।') },
      { pose: 'sit', s: 60, breath: [4, 0, 6, 0], n: L('Bhramari (humming breath)', 'भ्रामरी'), p: L('Breathe in through your nose. As you breathe out, hum softly like a bee with your lips closed. Do this 5 times.', 'नाक से साँस लें। साँस छोड़ते हुए होंठ बंद करके मधुमक्खी की तरह धीरे से गुनगुनाएँ। 5 बार करें।') },
      { pose: 'sit', s: 60, n: L('Sit quietly', 'शांत बैठें'), p: L('Sit still with your eyes closed and notice your breath for a minute.', 'आँखें बंद करके एक मिनट शांत बैठें और अपनी साँस पर ध्यान दें।') }] },
    sun: { hue: 'gold', first: 'reach', back: true, steps: null },
    /* Version 39.51: the midlife plan's few minutes of balance at a wall, Today's skill in Strong and steady (drafts for the
       physiotherapist; the 3D loops are the nearest poses until the new ones are made) */
    steady: { hue: 'gold', first: 'march', ffig: 'legwall', steps: [   /* Version 39.69: the 3D figure does the two balance moves at the wall (legwall, tandem) */
      { pose: 'march', fig: 'legwall', s: 30, side: true, n: L('One leg at the wall', 'दीवार के पास एक पैर पर'), p: L('Stand side-on to a wall with one hand on it. Lift one foot a little off the floor and hold, up to 30 seconds.', 'दीवार की तरफ़ बग़ल से खड़ी हों, एक हाथ दीवार पर। एक पैर ज़मीन से थोड़ा उठाकर रोकें, 30 सेकंड तक।') },
      { pose: 'walk', fig: 'tandem', s: 45, n: L('Heel to toe at the wall', 'दीवार के साथ एड़ी से पंजा'), p: L('Walk slowly along a wall with one hand on it, one foot right in front of the other, heel to toe. 10 steps, then turn and come back.', 'दीवार पर एक हाथ रखकर धीरे-धीरे चलें, एक पैर ठीक दूसरे के आगे, एड़ी से पंजा मिलाकर। 10 क़दम, फिर मुड़कर वापस।') },
      { pose: 'calf', s: 30, n: L('Heel raises', 'एड़ी उठाना'), p: L('Hold a wall or a chair. Rise up on your toes and come down slowly. 15 times.', 'दीवार या कुर्सी पकड़ें। पंजों पर उठें और धीरे से नीचे आएँ। 15 बार।') }] }
  };
  /* Version 39.52 (Mohit, 1 Nov: "build the pregnancy yoga by trimester"): yoga for each three months of a pregnancy, from the
     programme design (docs/plans-design-and-build-2026-10-24-programmes.md, section 6) and WHO 2020: nothing on the back after
     13 weeks and nothing on the tummy, no breath held, no deep twists, no jumping, no rising on the toes, balance at a wall.
     Drafts for the gynaecologist and a women's-health physiotherapist (wording review 19.52). The 3D figure, on her with a bump
     from the middle three months (Version 39.54; the drawings, with her bump, without web/fig); the reused moves keep their
     reviewed words */
  const PY_T = (reps) => ({ pose: 'armsup', fig: 'palm', s: 30, reps: reps, n: L('Tadasana (palm tree)', 'ताड़ासन'), p: L('Feet a little apart and flat on the floor. Raise your arms, stretch up and breathe slowly.', 'पैर थोड़े खुले, पूरे ज़मीन पर। हाथ ऊपर उठाएँ, ऊपर की ओर खिंचें और धीरे साँस लें।') });
  const PY_TREE = { pose: 'tree', fig: 'treewall', s: 20, side: true, n: L('Vrikshasana (tree) at a wall', 'दीवार के पास वृक्षासन'), p: L('One hand on a wall. Rest one foot on your other ankle or calf, never on the knee. Breathe.', 'एक हाथ दीवार पर। एक पैर दूसरे पैर के टखने या पिंडली पर रखें, घुटने पर कभी नहीं। साँस लेती रहें।') };
  const PY_CAT = (sag) => ({ pose: 'cat', fig: sag ? null : 'catsmall', s: 60, n: L('Marjariasana (cat and cow)', 'मार्जरी आसन (बिल्ली और गाय)'), p: L('On hands and knees: breathe out, round your back; breathe in, lift your head. ' + (sag ? 'Don’t let your back sag.' : 'Keep it small.'), 'हाथों और घुटनों के बल: साँस छोड़ें, पीठ गोल करें; साँस लें, सिर उठाएँ। ' + (sag ? 'पीठ नीचे न लटकने दें।' : 'हरकत छोटी रखें।')) });
  const PY_CHILD = { pose: 'child', fig: 'childwide', s: 40, knees: Object.assign({}, CHAIR_FWD, { pose: 'chairfwd' }), n: L('Shashankasana (child pose)', 'शशांकासन'), p: L('Knees wide apart, big toes together. Sit back towards your heels and stretch your arms forward.', 'घुटने चौड़े, पैरों के अँगूठे साथ। एड़ियों की ओर पीछे बैठें और हाथ आगे फैलाएँ।') };
  const PY_BUT = (wall) => ({ pose: 'butterfly', fig: wall ? 'butterflywall' : 'butterflytall', s: 60, n: L('Bhadrasana (butterfly)', 'भद्रासन (तितली)'), p: wall ? L('Sit with your back against a wall, the soles of your feet together and your knees out. Breathe slowly.', 'दीवार से पीठ टिकाकर बैठें, तलवे आपस में मिलाकर, घुटने बाहर। धीरे साँस लें।')
    : L('Sit tall on a folded sheet, the soles of your feet together and your knees out. Breathe slowly.', 'मुड़ी हुई चादर पर सीधी बैठें, तलवे आपस में मिलाकर, घुटने बाहर। धीरे साँस लें।') });
  const PY_SIDELEG = { pose: 'sideleg', s: 30, side: true, n: L('Side-lying leg lift', 'करवट लेकर पैर उठाना'), p: L('Lie on your side, head on your arm. Lift your top leg a little, keeping it straight, and lower it slowly. 8 times.', 'करवट लेकर लेटें, सिर बाँह पर। ऊपर वाला पैर सीधा रखकर थोड़ा उठाएँ, फिर धीरे से नीचे लाएँ। 8 बार।') };
  const PY_REST = { pose: 'sidelie', s: 90, n: L('Rest on your side', 'करवट लेकर आराम'), p: L('Lie on your side, left or right, a pillow between your knees. Let your body go loose and breathe slowly.', 'बाईं या दाईं करवट लेटें, घुटनों के बीच तकिया। शरीर ढीला छोड़ें और धीरे साँस लें।') };
  const PY_WALL = Object.assign({}, R.strength.steps[3], { reps: 1 });   /* Wall push-ups, its reviewed words, one set */
  R.preg1 = { hue: 'plum', first: 'cat', ffig: 'catsmall', fb: '', bump: 0, steps: [W, PY_T(2), PY_TREE, PY_CAT(false), PY_CHILD, PY_BUT(false),
    { pose: 'sit', s: 60, breath: [4, 0, 6, 0], n: L('Slow breathing', 'धीमी साँस'), p: L('Sit comfortably. Breathe in for 4 counts and out slowly for 6. Never hold your breath.', 'आराम से बैठें। 4 गिनती तक साँस लें और 6 गिनती तक धीरे छोड़ें। साँस कभी न रोकें।') },
    REST] };
  R.preg2 = { hue: 'plum', first: 'cat', fb: 'b2-', bump: 0.75, steps: [W, PY_T(1), PY_TREE, PY_WALL,
    { pose: 'chair', s: 45, n: L('Chair squats', 'कुर्सी से उठक-बैठक'), p: L('Stand up from a chair slowly, using your hands if you need to, then sit down slowly. 8 times.', 'कुर्सी से धीरे से खड़ी हों, ज़रूरत हो तो हाथों का सहारा लेकर, फिर धीरे से बैठें। 8 बार।') },
    PY_CAT(true), PY_BUT(false), R.calm.steps[1], PY_SIDELEG, PY_REST] };
  R.preg3 = { hue: 'plum', first: 'leanfwd', ffig: 'leantable', fb: 'b3-', bump: 1, steps: [
    { pose: 'seatmarch', s: 60, n: L('Loosen up, sitting', 'बैठकर शरीर खोलें'), p: L('Sit tall on a chair. Roll your shoulders, then march, lifting your knees one by one.', 'कुर्सी पर सीधी बैठें। कंधे घुमाएँ, फिर एक-एक करके घुटने उठाते हुए क़दमताल करें।') },
    { pose: 'chair', fig: 'chairwide', s: 45, n: L('Slow sit-to-stand', 'धीरे से उठना-बैठना'), p: L('Feet wide apart. Stand up from a chair slowly, then sit down slowly. Use your hands if you need to. 6 times.', 'पैर चौड़े खुले। कुर्सी से धीरे से खड़ी हों, फिर धीरे से बैठें। ज़रूरत हो तो हाथों का सहारा लें। 6 बार।') },
    { pose: 'seat', fig: 'chairsit', s: 60, breath: [4, 0, 6, 0], n: L('Long breaths out', 'लंबी साँस छोड़ना'), p: L('Sit tall on a chair. Breathe in for 4 counts and out slowly for 6. Never hold your breath.', 'कुर्सी पर सीधी बैठें। 4 गिनती तक साँस लें और 6 गिनती तक धीरे छोड़ें। साँस कभी न रोकें।') },
    PY_WALL,
    { pose: 'leanfwd', fig: 'leantable', s: 45, n: L('Lean and sway', 'झुककर झूमना'), p: L('Hands on a wall or a table, lean forward a little and sway your hips slowly, side to side or in circles.', 'दीवार या मेज़ पर हाथ रखकर थोड़ा आगे झुकें, और कूल्हों को धीरे-धीरे दाएँ-बाएँ या गोल घुमाएँ।') },
    { pose: 'allfours', s: 60, n: L('Rock on hands and knees', 'हाथों-घुटनों के बल झूलना'), p: L('On hands and knees with your back flat, rock slowly forward and back. A folded sheet under your knees helps.', 'हाथों और घुटनों के बल, पीठ सीधी रखकर, धीरे-धीरे आगे-पीछे झूलें। घुटनों के नीचे मुड़ी चादर रखें।') },
    PY_BUT(true), PY_SIDELEG, PY_REST] };
  const PY = ['preg1', 'preg2', 'preg3'];
  const RIDS = ['gentle', 'cycle', 'sun', 'strength', 'calm', 'steady'].concat(PY);   /* Version 39.51: Steady on your feet, for midlife; 39.52: pregnancy yoga */
  /* Version 39.32 (packet F2, F6): on the Getting ready plan, in the 14 days before her likely period (all month when her dates
     can't say, and while it is late), Bhujangasana (cobra) gives way to Tadasana and Vakrasana (seated twist) to sitting quietly,
     in case she is already pregnant; the sun salutation, which has a cobra, gives way to Gentle start. Never on her period days.
     The moves that take their place are the routines' own reviewed ones. */
  const lutOn = (d, iso) => { if (!babyD(d)) return false; const day = iso || todayISO(); if (periodToday(day)) return false;
    try { const ri = S.cycle.rangeInfo(); return !ri || S.diffDays(S.fromISO(day), ri.from) <= 14; } catch (e) { return true; } };
  const LUT = { cobra: R.cycle.steps[3].knees, twist: R.calm.steps[2] };
  /* the sun salutation: twelve positions, one slow breath each (6 seconds), 3 rounds to start and up to 6 by week 10 */
  const SUN = [
    ['prays', L('Pranamasana: palms together', 'प्रणामासन: हथेलियाँ जोड़ें')], ['reach', L('Hasta uttanasana: arms up, lean back a little', 'हस्त उत्तानासन: हाथ ऊपर, थोड़ा पीछे झुकें')],
    ['fwdbend', L('Hasta padasana: bend forward, hands to your shins or feet', 'हस्तपादासन: आगे झुकें, हाथ पिंडली या पैरों तक')], ['lunge', L('Ashwa sanchalanasana: one leg back, knee down', 'अश्व संचालनासन: एक पैर पीछे, घुटना नीचे')],
    ['plank', L('Dandasana: a straight plank, or knees down', 'दंडासन: सीधा तख़्ता, या घुटने नीचे')], ['ashtanga', L('Ashtanga namaskara: knees, chest and chin down', 'अष्टांग नमस्कार: घुटने, छाती और ठुड्डी नीचे')],
    ['cobra', L('Bhujangasana: lift your chest', 'भुजंगासन: छाती उठाएँ')], ['downdog', L('Parvatasana: hips up like a mountain', 'पर्वतासन: कूल्हे पहाड़ की तरह ऊपर')],
    ['lunge2', L('Ashwa sanchalanasana: the other leg', 'अश्व संचालनासन: दूसरा पैर')], ['fwdbend', L('Hasta padasana: bend forward', 'हस्तपादासन: आगे झुकें')],
    ['reach', L('Hasta uttanasana: arms up', 'हस्त उत्तानासन: हाथ ऊपर')], ['prays', L('Pranamasana: palms together', 'प्रणामासन: हथेलियाँ जोड़ें')]
  ];
  const sunRounds = (wk) => (wk <= 3 ? 3 : (wk <= 6 ? 4 : (wk <= 9 ? 5 : 6)));
  function sunSteps(d) {
    const rounds = sunRounds(d && d.start ? Math.max(1, wkShown(d)) : 1); const out = [W];
    for (let r = 1; r <= rounds; r++) SUN.forEach((x, i) => out.push({ pose: x[0], s: 6, n: x[1], p: L('Breathe slowly and move into the next pose.', 'धीरे साँस लें और अगले आसन में जाएँ।'), sun: true, si: i, round: r, rounds: rounds, flow: i > 0 || r > 1 }));
    out.push(REST); return out;
  }
  /* the steps she does: sets and both sides spelled out; knee pain swaps kneeling moves, back pain skips them */
  function stepsOf(id0, d) {
    const lim = (d && d.limits) || {}; const out = []; const lut = lutOn(d); const id = lut && id0 === 'sun' ? 'gentle' : id0;   /* Version 39.32 */
    (id === 'sun' ? sunSteps(d) : R[id].steps).forEach((s0) => {
      if (lim.back && s0.back) return;
      const s1 = lut && LUT[s0.pose] ? LUT[s0.pose] : s0; const s = lim.knees && s1.knees ? s1.knees : s1; const sets = s.reps || 1;
      for (let k = 1; k <= sets; k++) {
        if (s.side) { out.push(Object.assign({}, s, { sideK: 'r', set: k, sets: sets })); out.push(Object.assign({}, s, { sideK: 'l', set: k, sets: sets })); }
        else out.push(Object.assign({}, s, { set: k, sets: sets }));
      }
    });
    if (R[id] && R[id].fb != null) out.forEach((x) => { x.fb = R[id].fb; x.bump = R[id].bump || 0; });   /* Version 39.54: pregnancy yoga on her body for these three months */
    return out;
  }
  const routineMins = (id, d) => Math.max(1, Math.round(stepsOf(id, d).reduce((a, s) => a + s.s, 0) / 60) + 1);
  const rName = (id) => t(disc() && (id === 'cycle' || PY.indexOf(id) >= 0) ? 'plan_r_d' : 'plan_r_' + id);   /* Version 39.52: "Yoga", never "Pregnancy yoga", on a shared phone */
  const rSub = (id) => (disc() && (id === 'cycle' || PY.indexOf(id) >= 0) ? '' : t('plan_r_' + id + '_s'));
  /* Version 39.52: in a pregnancy, only her three months' yoga, on My pregnancy's green tier with no sign that doesn't wait, and
     Calm breath (no breath held); the other routines lie on the back or the tummy, twist or rise on the toes. Outside a pregnancy,
     never the pregnancy yoga */
  const pyId = (iso) => { const gw = gwAt(iso || todayISO()); return gw == null ? null : (gw < 14 ? 'preg1' : (gw < 28 ? 'preg2' : 'preg3')); };
  const pyWhy = (d) => (d && d.pack === 'preg' && !pregV2(d) && d.start && !pausedFor(d) ? 'v1' : (!(d && pregV2(d) && d.start && d.start <= todayISO() && !pausedFor(d)) ? 'plan'
    : (ikOf(d).pnow ? 'now' : (psTier(ikOf(d).pflags, gwAt(todayISO())) !== 'green' ? 'doc' : ''))));   /* v1: the first pregnancy plan, which has no safety questions */
  const pyOpen = (d) => pregnant() && !pyWhy(d);
  const pyTier = (d) => !!(d && pregV2(d) && pregnant() && !pausedFor(d) && !ikOf(d).pnow && psTier(ikOf(d).pflags, gwAt(todayISO())) === 'green');   /* her steps named before she starts */
  /* Version 39.51 (Mohit's phone test, 1 Nov; advice decision 7, bone-safe moves for every midlife woman), a stop-gap: while a
     midlife plan runs, or at midlife with no plan running, no Cycle care yoga (child pose) and no sun salutation (standing forward
     bends). Another plan she kept (the PMOS plan rotates both) keeps them; Gentle start waits for the physiotherapist's swaps */
  const boneHold = (d) => { const pk = d && d.start ? packOf(d) : null; return pk === 'meno' || (!pk && !!(S.cycle && S.cycle.isMidlife && S.cycle.isMidlife())); };
  const routineOk = (id, d) => (pregnant() ? id === 'calm' || (id === pyId() && pyOpen(d)) : PY.indexOf(id) < 0) && !(id === 'sun' && d && ((d.limits || {}).back || (d.limits || {}).knees || lutOn(d))) && !(id === 'steady' && !(menoV2(d) || !!(S.cycle && S.cycle.isMidlife && S.cycle.isMidlife()))) && !((id === 'strength' || id === 'sun') && heartHold(d)) && !((id === 'cycle' || id === 'sun') && boneHold(d));   /* review FOOD-08: knees too; Version 39.51: Steady on your feet for midlife, and no strength or sun salutation while her heart answer waits for her doctor */

  /* ---------- small pictures ---------- */
  const ICO = {
    grain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V8"/><path d="M12 8c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4zM12 8c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4zM12 13c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4zM12 13c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4zM12 18c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4zM12 18c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4z"/></svg>',
    protein: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 7.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0"/></svg>',
    veg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z"/><path d="M5 19l8-8"/></svg>',
    fruit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8c-3-2-8-1-8 5 0 4 3 8 5 8 1 0 2-.5 3-.5s2 .5 3 .5c2 0 5-4 5-8 0-6-5-7-8-5z"/><path d="M12 8c0-2 1-4 3-5"/></svg>',
    drink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l-1.5 16h-9z"/><path d="M6.5 9h11"/></svg>',
    snack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"/><circle cx="15.5" cy="8" r="2.5"/><circle cx="12" cy="15.5" r="3.5"/></svg>',
    plate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 12h9"/></svg>',
    move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M13 7l-2 6 4 3v5M11 13l-4 3M13 9l4 2"/></svg>',
    body: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v4M11 7v6M15 7v4M19 7v6"/></svg>',
    /* Version 39.8: for the goal rows */
    bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3h5v3h-5z"/><rect x="5.5" y="6" width="13" height="15" rx="4"/><path d="M9 11h6M9 15h6"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-3.9 0-6.5-2.7-6.5-6.2 0-3.3 2.4-5 3.6-7.8.6 1.5 1.5 2.6 2.5 3 0-3.2 1.4-5.6 3.4-7 .3 3 1.5 4.6 2.6 6.2 1 1.4 1.4 2.9 1.4 4.6 0 4.4-3.1 7.2-7 7.2z"/></svg>',
    bone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path transform="rotate(-35 12 12)" d="M8.6 10.6H15.4A2.6 2.6 0 1 1 20 12A2.6 2.6 0 1 1 15.4 13.4H8.6A2.6 2.6 0 1 1 4 12A2.6 2.6 0 1 1 8.6 10.6Z"/></svg>',
    lift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16.5V8M8.5 11.5L12 8l3.5 3.5"/></svg>',
    /* Version 39.13: the yoga step */
    yoga: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.6" r="2"/><path d="M12 7.6v6.4M12 14l-3.4 6.4M12 14l3.4 6.4M6.2 3.2l5.8 6.2 5.8-6.2"/></svg>'
  };
  const icoHtml = (k) => '<span class="pl-ico">' + (ICO[k] || S.icon(k)) + '</span>';

  /* the plate: half sabzi, a quarter grains, a quarter dal or protein, and curd on the side */
  function plateSvg(food) {   /* review PRIVACY-04, FOOD-04: its label and its bowl follow how she eats */
    const f = food || (S.food ? S.food.diet().type : 'veg'); const milk = !S.food || S.food.diet().milk !== false;
    return '<svg class="pl-plate" viewBox="0 0 200 124" role="img" aria-label="' + esc(t('plan_plate_half') + '. ' + t('plan_plate_grain') + '. ' + t(protKey(f)) + '. ' + t(milk ? 'plan_plate_bowl' : 'plan_plate_bowl_n')) + '">' +
      '<defs><clipPath id="pl-clip"><circle cx="70" cy="62" r="54"/></clipPath></defs>' +
      '<g clip-path="url(#pl-clip)"><rect class="pl-pv" x="16" y="8" width="54" height="108"/><rect class="pl-pg" x="70" y="8" width="54" height="54"/><rect class="pl-pp" x="70" y="62" width="54" height="54"/></g>' +
      '<circle cx="70" cy="62" r="54" class="pl-rim"/><line x1="70" y1="8" x2="70" y2="116" class="pl-cut"/><line x1="70" y1="62" x2="124" y2="62" class="pl-cut"/>' +
      '<circle cx="160" cy="36" r="22" class="pl-pb"/><circle cx="160" cy="36" r="22" class="pl-rim"/>' +
      '<text x="42" y="66" text-anchor="middle" class="pl-lab">' + esc(t('plan_pl_veg')) + '</text><text x="97" y="40" text-anchor="middle" class="pl-lab">' + esc(t('plan_pl_grain')) + '</text>' +
      '<text x="97" y="92" text-anchor="middle" class="pl-lab">' + esc(t('plan_pl_prot')) + '</text><text x="160" y="40" text-anchor="middle" class="pl-lab">' + esc(t(milk ? 'plan_pl_bowl' : 'plan_pl_bowl_n')) + '</text>' +
      '<text x="160" y="80" text-anchor="middle" class="pl-lab pl-big">½ · ¼ · ¼</text></svg>';
  }
  /* Version 39.8 (diet audit, section 5): the plate she can tap. What was on her thali today fills the drawing in, with one
     gentle "you could add" line from the plate's own words. No score; only today's ticks are kept, on the phone. */
  const THALI = [['veg', 'pv'], ['prot', 'pp'], ['grain', 'pg'], ['bowl', 'pb']];
  function thaliCard(d, food) {
    const td = todayISO(); const on = d.thali && d.thali.d === td ? (d.thali.on || []) : []; const milk = !S.food || S.food.diet().milk !== false;
    const line = (k) => t(k === 'veg' ? 'plan_plate_half' : (k === 'grain' ? 'plan_plate_grain' : (k === 'prot' ? protKey(food) : (milk ? 'plan_plate_bowl' : 'plan_plate_bowl_n'))));
    const what = (k) => line(k).replace(/^[^:：]+[:：]\s*/, '');   /* "Half: sabzi and salad" -> "sabzi and salad" */
    const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
    let svg = plateSvg(food).replace('class="pl-plate"', 'class="pl-plate pl-tap"').replace(/pl-clip/g, 'pl-clip-t');   /* its own clip id: the guide plate is on the same page */
    THALI.forEach((x) => { if (on.indexOf(x[0]) < 0) svg = svg.replace('class="pl-' + x[1] + '"', 'class="pl-' + x[1] + ' off"'); });
    const miss = THALI.find((x) => on.indexOf(x[0]) < 0);
    return '<div class="card pl-thali" data-nofold="1"><h3>' + esc(t('plan_th_h')) + '</h3>' + svg +
      '<div class="chips" role="group" aria-label="' + esc(t('plan_th_h')) + '">' + THALI.map((x) => '<button type="button" class="chip' + (on.indexOf(x[0]) >= 0 ? ' on' : '') + '" data-pl-th="' + x[0] + '" aria-pressed="' + (on.indexOf(x[0]) >= 0) + '">' + esc(cap(what(x[0]))) + '</button>').join('') + '</div>' +
      '<p class="small pl-th-tip">' + esc(!on.length ? t('plan_th_p') : (miss ? tf('plan_th_add', { x: what(miss[0]) }) : t('plan_th_full'))) + '</p></div>';
  }
  function wireThali(v, food) {
    v.querySelectorAll('[data-pl-th]').forEach((b) => b.addEventListener('click', () => {
      const dd = D(); const td = todayISO(); const cur = dd.thali && dd.thali.d === td ? (dd.thali.on || []).slice() : []; const k = b.dataset.plTh; const i = cur.indexOf(k);
      if (i >= 0) cur.splice(i, 1); else cur.push(k); dd.thali = { d: td, on: cur }; S.save();
      const c = v.querySelector('.pl-thali'); if (c) { c.outerHTML = thaliCard(dd, food); wireThali(v, food); const nb = v.querySelector('[data-pl-th="' + k + '"]'); if (nb) nb.focus(); }
    }));
  }
  function ringSvg(val, max, label) {
    const r = 30, c = 2 * Math.PI * r, f = max > 0 ? Math.min(1, val / max) : 0;
    return '<svg class="pl-ring" viewBox="0 0 76 76" role="img" aria-label="' + esc(label) + '"><circle cx="38" cy="38" r="' + r + '" class="trk"/><circle cx="38" cy="38" r="' + r + '" class="arc" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 38 38)"/><text x="38" y="43" text-anchor="middle">' + Math.round(val) + '</text></svg>';
  }

  const head = (k, back) => S.backRow(k === 'plan_h' && disc() ? t('plan_h_d') : t(k), back || S.mem.planFrom || 'plan-pmos', false);
  function offScreen(v) { v.innerHTML = S.backRow(t('plan_h'), 'care', false) + '<div class="card soft"><p>' + esc(t('plan_off')) + '</p></div>'; S.wire(v); }

  /* ---------- the plan's home ---------- */
  function renderHub(v) {
    if (!on()) { offScreen(v); return; }
    if (S.canSave() && (upcoming(raw()) || (pendingOk(raw()) && !packOf(raw())))) { renderMyPlan(v); return; }
    if (S.canSave() && !pauseWhy() && stageNowKey() === 'ttc' && !(raw() && raw().start)) { renderMyPlan(v); return; }   /* Version 39.32: while she tries for a baby, My plan offers Getting ready */
    pauseSync(); S.mem.planFrom = 'plan-pmos'; const hd = head('plan_h', 'plan');
    const why = pauseWhy();
    if (!S.canSave() || !raw() || !raw().start || why) {
      const art = '<div class="pl-intro-art">' + plateSvg() + figSvg('armsup', { cls: 'pl-fig-sm' }) + '</div>';
      const rows = [['plate', 'plan_i_eat'], ['move', 'plan_i_move'], ['chart', 'plan_i_see']].map((x) => '<div class="item quiet"><span class="ico-sm hue hue-' + (x[0] === 'plate' ? 'green' : (x[0] === 'move' ? 'purple' : 'sky')) + '">' + (ICO[x[0]] || S.icon(x[0])) + '</span><span class="body"><strong>' + esc(t(x[1])) + '</strong><span>' + esc(t(x[1] + '_s')) + '</span></span></div>').join('');
      let act;
      if (why) act = '<div class="card warn"><p>' + esc(t(why === 'preg' ? 'plan_paused_preg' : (why === 'loss' ? 'plan_paused_loss_d' : 'plan_paused_post'))) + '</p>' + (why !== 'loss' && S.routeOwner(why === 'preg' ? 'preg-plan' : 'post-pelvic') ? '<button type="button" class="btn sm" data-go="' + (why === 'preg' ? 'preg-plan' : 'post-pelvic') + '">' + esc(t(why === 'preg' ? 'plan_go_preg' : 'plan_go_post')) + '</button>' : '') + '</div>';
      else act = S.canSave() ? '<button type="button" class="btn primary block" data-go="plan-start">' + esc(t('plan_start')) + '</button>' : S.needDiary();
      v.innerHTML = hd + '<div class="card pl-intro">' + art + '<p class="lead">' + esc(t('plan_intro')) + '</p></div><div class="list">' + rows + '</div><p class="small">' + esc(t('plan_i_time')) + '</p>' + act +
        '<div class="grid2"><button type="button" class="btn" data-go="plan-plate">' + esc(t('plan_tiles_plate')) + '</button><button type="button" class="btn" data-go="plan-moves">' + esc(t('plan_tiles_moves')) + '</button></div>' +
        '<p class="footnote">' + esc(t('plan_foot')) + '</p>';
      S.wire(v); return;
    }
    if (packOf(raw()) && packOf(raw()) !== 'cycle') { renderMyPlan(v); return; }   /* a light plan's page is My plan */
    renderProgramme(v, D(), false);
  }
  /* ---------- Version 39.5 (roadmap section 3; design doc 3.3): one page for every plan ----------
     Her clock; the urgent row (recordsRow, added by My plan); a hero from the spec (ring, week or timeline); one row for
     today (journey audit MIN-10: Today has the steps); the look-back; her path; the spec's 4 tiles; her last plan; her care
     team and when to get help; settings. On the My plan tab (isTab) and at the cycle plan's own address (plan-pmos). */
  function tilesHtml(d, tiles) {
    const ok = (x) => !(disc() && x.priv) && S.routeOwner(x.go) && (!S.toolShown || S.toolShown(x.go));
    const l = (tiles || []).filter(ok); if (!l.length) return '';
    return '<div class="pl-tiles pl-tiles4">' + l.map((x) => '<button type="button" class="pl-tile hue-' + x.hue + '" data-go="' + x.go + '"><span class="ico-sm hue">' + progIco(x.icon) + '</span><strong>' + esc(x.go === 'post-checks' && died() ? t('post_six_h') : ptx(x.text)) + '</strong>' + (x.go === 'plan-progress' ? '<span class="small">' + esc(tf('plan_res_tile_s', { n: followedDays(d) })) + '</span>' : '') + '</button>').join('') + '</div>';   /* Version 39.22: one row of four */
  }
  const pauseBanner = (d) => (selfPaused(d) ? '<div class="card soft pl-pausecard" data-nofold="1"><p>' + esc(tf('plan_paused_til', { d: S.fmtD(S.fromISO(d.pauseUntil), { weekday: 'long', day: 'numeric', month: 'short' }) })) + '</p><button type="button" class="btn sm primary" id="pl-unpause">' + esc(t('plan_unpause')) + '</button></div>' : '');
  /* Version 39.32 (packet section W, I3, I4; the mockup's My plan): this week's lesson (weeks 1 to 12), then one a month in turn */
  const lessonId = (d) => { if (!babyD(d) || !d.start) return null; const wk = weekNo(d); if (wk < 1) return null; return wk <= N ? 'w' + wk : 'm' + ((Math.floor((wk - N - 1) / 4) % 4) + 1); };
  /* under her steps on Today until she reads it, one row (it waits while the week's look-back shows); on a shared phone, no title */
  /* Version 39.41 (Mohit's three-plan walk): getting ready for a baby, her period 14 days or more past its date and no test saved since */
  const lateTest = (dd) => { if (!babyD(dd) || disc() || pregnant()) return false; const p = S.cycle && S.cycle.predict ? S.cycle.predict() : null; if (!p || !p.late || !p.next || p.daysTo > -14) return false;
    const lt = S.pregtest && S.pregtest.lastTest ? S.pregtest.lastTest() : null; return !(lt && lt >= S.toISO(p.next)); };
  const lateRow = (dd) => (lateTest(dd) && S.routeOwner('pregtest') ? '<button type="button" class="action pl-late" data-go="pregtest"><span class="ico hue hue-gold">' + S.I.help + '</span><span class="body"><strong>' + esc(t('qa_late')) + '</strong><span class="small">' + esc(t('late_p')) + '</span></span><span class="go">' + S.I.chev + '</span></button>' : '');
  const lessonRow = (dd) => { const pj = pfJoinRow(dd); if (pj) return pj; if (pfLead(dd)) return pfLessonRow(dd); if (perV2(dd)) return perLessonRow(dd);   /* Version 39.56 */ if (menoV2(dd)) return m2LessonRow(dd); const id = lessonId(dd); if (lateTest(dd) || !id || !S.ttc || !S.ttc.lesson || S.ttc.lesson.read(id)) return '';
    return '<button type="button" class="item pl-les" data-go="ttc-lesson" data-pl-les="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body">' + (disc() ? '<strong>' + esc(t('plan_les_h')) + '</strong>' : '<span class="small">' + esc(t('plan_les_h')) + '</span><strong>' + esc(S.ttc.lesson.title(id)) + '</strong>') + '</span><span class="pill">' + esc(t('plan_les_read')) + '</span></button>'; };
  /* Version 39.32 (found on Mohit's phone): Getting ready's 12 weeks are its 4 parts, in My plan's one "Your 12 weeks" card
     (pathHtml in week 1, weeksCard after it), with her doctor month: 12 months after Months of trying's date, 6 at 35 to 39,
     none at 40 or over (a gynaecologist from the start) */
  const BPH = [['1', 1, 2], ['2', 3, 6], ['3', 7, 12], ['4', 13, 9999]];
  const bphOf = (k) => BPH.find((p) => k >= p[1] && k <= p[2]) || BPH[0];
  function bdocMonth() {
    const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null; const since = S.ttc && S.ttc.since ? S.ttc.since() : null;
    if (!since || disc() || (age != null && age >= 40)) return '';
    const s0 = S.fromISO(since); const mm = age != null && age >= 35 ? 6 : 12; const at = new Date(s0.getFullYear(), s0.getMonth() + mm, 1);
    return '<div class="pl-bdm"><strong>' + esc(tf('plan_bmonth', { m: S.fmtD(at, { month: 'long', year: 'numeric' }) })) + '</strong><p class="small">' + esc(t(mm === 6 ? 'plan_bmonth_p6' : 'plan_bmonth_p12')) + '</p></div>';
  }
  /* the minimalist baseline: her tablet is in her steps and her 12 weeks in "Your 12 weeks", so no row repeats them here: only
     her tools (this week's lesson, her ready check, the calm switch) */
  function babyCard(d) {
    if (!babyD(d) || !S.ttc || !S.ttc.lesson) return ''; const wk = weekNo(d);
    const row = (go, ico, hue, title, sub, les) => '<button type="button" class="item" data-go="' + go + '"' + (les ? ' data-pl-les="' + les + '"' : '') + '><span class="ico-sm hue hue-' + hue + '">' + S.icon(ico) + '</span><span class="body"><strong>' + esc(title) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span><span class="chev">' + S.I.chev + '</span></button>';
    const lid = lessonId(d); const pv = disc();
    const rows = (lid ? row('ttc-lesson', 'diary', 'plum', t('plan_les_h'), pv ? '' : S.ttc.lesson.title(lid) + (S.ttc.lesson.read(lid) ? '\u00a0✓' : ''), lid) : '') +
      (pv ? '' : row('ttc-ready', 'chart', 'sky', t('plan_a_ready'), S.ttc.ready.n() >= 2 ? t('ttc_ready_tn') : t('plan_a_ready_s')));
    const calm = !pv && wk >= 8 ? '<div class="item quiet pl-bcalm"><span class="body"><strong>' + esc(t('plan_bcalm_h')) + '</strong><span>' + esc(t('plan_bcalm_p2')) + '</span></span><button type="button" class="btn sm" id="pl-bcalm">' + esc(t(S.ttc.calmOn() ? 'ttc_off' : 'ttc_on')) + '</button></div>' : '';
    return rows || calm ? '<div class="list pl-baby-tools">' + rows + calm + '</div>' : '';
  }
  function wireBaby(v) {
    v.querySelectorAll('[data-pl-les]').forEach((b) => b.addEventListener('click', () => { S.mem.ttcLes = b.dataset.plLes; }));
    const bc = v.querySelector('#pl-bcalm'); if (bc) bc.addEventListener('click', () => { if (S.ttc && S.ttc.setCalm) { S.ttc.setCalm(!S.ttc.calmOn()); S.save(); S.toast(t('saved')); S.render(); } });
  }
  function renderProgramme(v, d, isTab) {
    const hd0 = isTab ? '<h1>' + esc(packTitle(d)) + '</h1>' : S.backRow(packTitle(d), 'plan', false);
    if (finished(d)) { renderFinished(v, d, hd0); return; }
    const hd = '<div class="pl-head">' + hd0 + (S.canSave() && d.start ? '<button type="button" class="iconbtn pl-gear" data-go="plan-settings" aria-label="' + esc(t('plan_set_h')) + '">' + S.icon('gear') + '</button>' : '') + '</div>';   /* Version 39.22: her settings by her title */
    const sp = specD(d) || {}; const wk = weekNo(d); if (S.canSave() && d.start) pauseSync();   /* Version 39.22 */
    const clock = ownWeek(d) || (wk > N && d.keep ? t('plan_wk_keep') : (planWeeks(d) ? tf('plan_wk', { n: Math.min(wk, N) }) : tf('plan_wk_n', { n: wk })));
    const gk = d.goalKey || (packOf(d) === 'cycle' ? 'irregular' : '');   /* Version 39.15 (audit R7): her goal, never a diagnosis line */
    const acts = selfPaused(d) ? [] : actionsFor(d);
    /* Version 39.19 (Mohit, 26 Oct: "some information can be collapsable"): after her first week, what she reads once folds to
       one line each: how her plan works, her steps' reasons (behind "Why?"), what consistency brings, the weeks ahead and her care
       team. Her steps, this week, the garden, the tools and her settings stay open. */
    const fold = weekNo(d) > 1;
    const one = fold && weeksOne(d);   /* Version 39.22: her 12 weeks and what consistency brings, one card */
    v.innerHTML = hd + '<p class="small pl-clock">' + esc(disc() || !gk ? clock : tf('plan_goal_l', { g: t('plan_gv_' + gk), w: clock })) + (fold && acts.length ? ' · <button type="button" class="linkbtn pl-howlink" id="pl-howlink">' + esc(t('plan_how_link')) + '</button>' : '') + '</p>' +
      pendBanner() + pauseBanner(d) + perBanner(d) + lateRow(d) + rhythmCard(d, acts, fold) + stepsCard(d, acts, fold) + babyCard(d) + m2Card(d) + weekCard(d, fold) + (fold ? '' : gardenRow()) + reviewCard(d) + (one ? weeksCard(d) : mcRow(d) + consCard(d, fold) + pathHtml(d, fold)) +
      tilesHtml(d, sp.tiles) + (packOf(d) === 'preg' && !pregV2(d) && !disc() ? '<p class="small pl-preg-moves">' + esc(t('plan_preg_moves')) + '</p>' : '') + pastCard(d) + careTeam(fold) + '<p class="footnote">' + esc(footT(d)) + '</p>';
    S.wire(v); wireReview(v); wirePause(v); wireSteps(v, acts);
    v.querySelectorAll('[data-pl-fold]').forEach((dt) => dt.addEventListener('toggle', () => { S.mem.plFold = S.mem.plFold || {}; S.mem.plFold[dt.dataset.plFold] = dt.open; }));   /* Version 39.19 */
    const fq = v.querySelector('#pl-fast-tog'); if (fq) fq.addEventListener('click', () => { const dd = D(); setFast(dd, todayISO(), !fastOn(dd)); remSync(dd); S.save(); S.render(); });   /* Version 39.9 */
    const wp = v.querySelector('#pl-wp'); if (wp) wp.addEventListener('click', () => { S.mem.planWkFrom = 'plan'; S.setHash('plan-week'); });   /* Version 39.12 */
    const hl = v.querySelector('#pl-howlink'); if (hl) hl.addEventListener('click', () => openHow(d, acts));   /* Version 39.22 */
    wireBaby(v);   /* Version 39.32 */
    wireMeno(v); wirePer(v); wirePf(v);   /* Version 39.51; 39.55; 39.56 */
  }
  /* ---------- Version 39.15 (audit R7 to R10, R15; the mockup's After 7): My plan explains the plan, top to bottom. Her goal and
     week; how her plan works; her daily steps, each with its reviewed reason and today's tick; this week as rings (a part for
     each step), her minutes and Plan this week; her garden; what consistency brings (the reviewed timeline, "You are here") with
     her own signs beside it; then her 12 weeks, the tools, her care team and one row for her settings. ---------- */
  /* Version 39.19: a folded card: its title and one line, and what it holds one tap away */
  const foldOpen = (k) => !!(S.mem.plFold && S.mem.plFold[k]);
  const foldCard = (cls, title, line, inner) => '<div class="card ' + cls + ' pl-fold"><details data-pl-fold="' + cls + '"' + (foldOpen(cls) ? ' open' : '') + '><summary><span class="pl-fold-t"><strong>' + esc(title) + '</strong>' + (line ? '<span class="small">' + esc(line) + '</span>' : '') + '</span><span class="pl-fold-c" aria-hidden="true">' + S.I.chev + '</span></summary><div class="pl-fold-in">' + inner + '</div></details></div>';
  function rhythmGrid(d, acts) {
    const tw = planWeeks(d) === N && !(d.keep && weekNo(d) > N); const mc = tw && !careTime(d) && !pregnant() && !disc() && !babyD(d) && !pfLead(d); const at = timeOf(ciAt(d));
    const nS = acts.filter((a) => !a.soft).length; const rc = recCi(d);
    const cols = postV2(d) ? [['plan_rh_day', tf(rc && !disc() ? 'plan_rh_day_rc' : (nS === 1 ? 'plan_rh_day_s1' : 'plan_rh_day_s'), { n: nS, t: at })], ['plan_rh_p42', t('plan_rh_p42_s')], ['plan_rh_p84', t('plan_rh_p84_s')]] :   /* Version 39.46 */
      [['plan_rh_day', nS === 1 ? tf('plan_rh_day_s1', { t: at }) : tf('plan_rh_day_s', { n: nS, t: at })], ['plan_rh_wk', t(babyD(d) ? 'plan_rh_wk_b' : (menoV2(d) || perV2(d) || pfLead(d) ? 'plan_rh_wk_m2' : (movesOn(d) ? 'plan_rh_wk_s' : 'plan_rh_wk_s2')))]].concat(mc ? [['plan_rh_m', t('plan_rh_m_s')]] : [], tw ? [['plan_rh_end', t('plan_rh_end_s')]] : []);
    return '<div class="pl-rh-g" style="grid-template-columns:repeat(' + cols.length + ',minmax(0,1fr))">' + cols.map((c, i) => '<div class="pl-rh-c"><i class="' + (i === 0 ? 'on' : '') + '"></i><strong>' + esc(t(c[0])) + '</strong><span class="small">' + esc(c[1]) + '</span></div>').join('') + '</div>';
  }
  /* Version 39.22: her first week reads how her plan works; after it, "How it works" by her week opens it */
  function rhythmCard(d, acts, fold) {
    if (!acts.length || fold) return '';
    return '<div class="card pl-rh"><span class="eyebrow">' + esc(t('plan_how_h2')) + '</span>' + rhythmGrid(d, acts) + '</div>';
  }
  function openHow(d, acts) { if (!S.sheet) return; S.sheet('<div class="pl-why-sh pl-how-sh"><h2>' + esc(t('plan_how_h2')) + '</h2>' + rhythmGrid(d, acts) + '<button type="button" class="btn primary block" id="pl-why-ok">' + esc(t('plan_got')) + '</button></div>', (sh) => { const ok = sh.querySelector('#pl-why-ok'); if (ok) ok.addEventListener('click', () => S.closeSheet()); }); }
  /* Version 39.22: every step's reason in one sheet (her first week shows them under each step) */
  function openWhyAll(acts) {
    const d0 = raw(); if (!d0 || !S.sheet) return; const d = fullD(d0); const xs = acts.filter((a) => a.why && !a.soft);
    S.sheet('<div class="pl-why-sh pl-whyall-sh"><h2>' + esc(xs.length === 1 ? t('plan_why_all1') : tf('plan_why_all', { n: xs.length })) + '</h2>' + xs.map((a) => { const how = howOf(a, d); return '<div class="pl-why-one"><div class="pl-why-top"><span class="ico-sm hue hue-' + esc(a.hue || 'rose') + '">' + a.icon + '</span><h3>' + esc(a.title) + '</h3></div><p class="pl-why-p">' + esc(t(a.why)) + '</p>' + (how ? '<p class="small pl-why-how">' + esc(how) + '</p>' : '') + '</div>'; }).join('') +
      '<button type="button" class="btn primary block" id="pl-why-ok">' + esc(t('plan_got')) + '</button></div>', (sh) => { const ok = sh.querySelector('#pl-why-ok'); if (ok) ok.addEventListener('click', () => S.closeSheet()); });
  }
  /* R7.2: her daily steps, each with its reviewed reason (always shown), how to do it, and today's tick, the same tick as
     Today's; R9: the check-in button only once it is due */
  function stepsCard(d, acts, fold) {
    if (!acts.length) return ''; const rest = isRest(d); const done = acts.filter((a) => a.state === 'd').length; const part = acts.filter((a) => a.state === 'p').length; const ci = ciDone(d); const due = ciDueNow(d, acts); const req = held(acts); const all = done === req.length;   /* Version 39.37 */
    const row = (a, i) => { const ok = a.state === 'd'; const tick = TICK.indexOf(a.kind) >= 0 && !rest; const sb = /^plan-r-/.test(a.go || '') && (a.kind === 'routine' || (a.kind === 'minutes' && !!a.r)); const pl = !!a.play && !ok && !rest;   /* Version 39.22: her wind-down plays where the tick goes */
      const rtB = a.kind === 'routine' && !!a.r && sb && !ok;   /* Version 39.43: as Today's row, its name and its minutes on the play button */
      const nm = disc() && (a.priv || a.kind === 'minutes') ? discNm(a, acts) : (rtB && !disc() ? rName(a.r) : a.title); const why = disc() ? '' : (a.id === 'fast' && a.sub ? a.sub : (fold ? '' : t(a.why || 'plan_fb_any')));   /* her fasting step: its tips, folded or not (V39.9 review SAFETY-03); Version 39.19: the reasons folded after week 1 */
      const sub = (fold || a.play) && !(disc() && a.priv) && a.id !== 'fast' ? stepSub(a, d) : '';   /* Version 39.24: week 1 says what her wind-down plays */   /* Version 39.22: one line under each step; the reasons behind one "Why these steps?" */
      const tk = sb && !ok ? '<button type="button" class="btn sm pl-st-start" data-pl-start="' + i + '">' + (rtB ? S.I.play.replace('<svg', '<svg aria-hidden="true"') + esc(tf('plan_min_n', { n: routineMins(a.r, d) })) : esc(t('plan_start_b'))) + '</button>'
        : (pl ? '<button type="button" class="btn sm ' + (a.playDay ? 'pl-st-start' : 'pl-st-play') + '" data-pl-play="' + i + '">' + PLAY_SVG + esc(tf('calm_min', { n: a.playMin })) + '</button>'
        : (tick ? '<button type="button" class="today-tick' + (ok ? ' on' : '') + '" ' + (ok ? 'data-pl-un' : 'data-pl-tk') + '="' + i + '" aria-pressed="' + ok + '" aria-label="' + esc(tf(ok ? 'today_untick' : 'today_tick', { x: nm })) + '"><span class="tk">' + (ok ? SVG_TICK : '') + '</span></button>'
          : (ok ? '<span class="today-tick on" aria-hidden="true"><span class="tk">' + SVG_TICK + '</span></span>' : '<button type="button" class="today-open" data-go="' + esc(a.go) + '" aria-label="' + esc(nm) + '">' + S.I.chev + '</button>')));
      return '<div class="item quiet pl-step' + (ok ? ' today-ok' : '') + '"' + (tick || sb || pl ? ' data-pl-row="' + i + '"' : '') + '><span class="ico-sm hue hue-' + esc(a.hue || 'rose') + '">' + a.icon + '</span><span class="body"><strong>' + esc(nm) + '</strong>' + (sub ? '<span class="pl-step-sub">' + esc(sub) + '</span>' : '') + (why ? '<span class="pl-step-why">' + esc(why) + '</span>' : '') + (a.why && !disc() && !fold ? '<button type="button" class="linkbtn pl-step-how" data-pl-how="' + i + '">' + esc(t('plan_how_l')) + '</button>' : '') + '</span>' + tk + '</div>'; };
    const whyN = acts.filter((a) => a.why && !a.soft).length;   /* Version 39.41: her daily steps, as the heading counts them */
    const ciB = recCi(d) && !ci ? '<p class="small pl-t-at">' + esc(tf(disc() ? 'plan_th_ci_at' : 'plan_th_rc_at', { t: timeOf(ciAt(d)) })) + '</p>' : due ? '<button type="button" class="btn ' + (fold ? 'sm' : 'primary block') + ' pl-ci-go" data-go="plan-checkin">' + esc(ciLabel()) + '</button>' : '<p class="small pl-t-at' + (ci || all ? ' pl-t-ok' : '') + '">' + esc(ci ? '✓ ' + t(rest ? 'plan_rest_pill' : 'plan_ci_done') : (all ? '✓ ' + t('plan_dc_h') : tf('plan_th_ci_at', { t: timeOf(d.remAt || '20:00') }))) + '</p>';   /* Version 39.22: Today keeps the pink button */
    return '<div class="card pl-steps-card"><div class="row spread pl-steps-h"><h3>' + esc(req.length === 1 ? t('plan_steps_h1') : tf('plan_steps_h', { n: req.length })) + '</h3><span class="small pl-t4-n">' + esc(rest ? t('plan_rest_pill') : countLine(done, part, req.length)) + '</span></div>' + nightBar() +
      '<div class="pl-t4-bar" aria-hidden="true">' + held(acts).map((a) => '<i class="' + (a.state === 'd' ? 'on' : (a.state === 'p' ? 'half' : '')) + '"></i>').join('') + '</div><div class="list">' + acts.map(row).join('') + '</div>' +
      (laterStep(d) ? '<p class="small pl-later">' + esc(laterLine(laterStep(d))) + '</p>' : '') +   /* Version 39.45: until it joins */
      (fold ? '' : '<p class="small pl-steps-same">' + esc(t('plan_steps_same')) + '</p>') +
      (!disc() && !ci && !rest && foodDay(d, todayISO()) && !acts.some((a) => FOOD_IDS.indexOf(a.id) >= 0 || a.id === 'fast') ? '<button type="button" class="linkbtn pl-fast-tog" id="pl-fast-tog">' + esc(t('plan_fast_q')) + '</button>' : '') +   /* no food step to ask in (V39.9 review FOOD-01) */
      (fold ? '<div class="pl-steps-f">' + (whyN && !disc() ? '<button type="button" class="linkbtn pl-whyall" id="pl-whyall">' + esc(whyN === 1 ? t('plan_why_all1') : tf('plan_why_all', { n: whyN })) + '</button>' : '<span></span>') + ciB + '</div>' : ciB) + '</div>';
  }
  /* Version 39.22: the line under a step: when to do yoga (before a meal), her time to walk, her meal, tonight's session */
  const YOGA_R = ['cycle', 'gentle', 'sun'];
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  function stepSub(a, d) {
    if (a.wound && S.calm) return tf('plan_ci_n_wind', { s: S.calm.short(a.wound) });
    if (a.kind === 'routine' && a.r) return YOGA_R.indexOf(a.r) >= 0 ? t('plan_yoga_when') : '';
    return a.sub || '';
  }
  function wireSteps(v, acts) {
    const upd = (fn) => { const dd = D(); fn(dd); remSync(dd); S.saveQuiet(); S.render(); };
    v.querySelectorAll('[data-pl-tk]').forEach((b) => b.addEventListener('click', () => { const a = acts[+b.dataset.plTk]; if (!a) return; upd((dd) => { markAction(dd, a, 'd'); closeDay(dd); }); S.toast(allDoneToday(D()) ? t('plan_t_full') : t('plan_well')); }));
    v.querySelectorAll('[data-pl-un]').forEach((b) => b.addEventListener('click', () => { const a = acts[+b.dataset.plUn]; if (a) upd((dd) => unmark(dd, a)); }));
    v.querySelectorAll('[data-pl-start]').forEach((b) => b.addEventListener('click', () => { const a = acts[+b.dataset.plStart]; if (a) S.setHash(a.go); }));
    v.querySelectorAll('[data-pl-how]').forEach((b) => b.addEventListener('click', () => { const a = acts[+b.dataset.plHow]; if (a) openWhy(a); }));
    v.querySelectorAll('[data-pl-play]').forEach((b) => b.addEventListener('click', () => { const a = acts[+b.dataset.plPlay]; if (a && a.play) S.setHash(a.play); }));   /* Version 39.22 */
    const wa = v.querySelector('#pl-whyall'); if (wa) wa.addEventListener('click', () => openWhyAll(acts));
    v.querySelectorAll('[data-pl-row]').forEach((r) => r.addEventListener('click', (e) => { if (e.target.closest('button, a')) return; const b = r.querySelector('[data-pl-start], [data-pl-play], [data-pl-tk], [data-pl-un]'); if (b) b.click(); }));
  }
  /* R7.3: this week, each day a ring with a part for each step (today ringed, a rest day dashed), the strength days ahead marked;
     her minutes as a line; "+ Add minutes" and Plan this week right here */
  function weekCard(d, fold) {
    if (selfPaused(d)) return ''; const wk = wkNow(d); const td = todayISO(); const cyc = packOf(d) === 'cycle';
    const tp = cyc && !careTime(d) && !lightOn(d) ? todayPlan(d) : null; const sd = tp && Array.isArray(tp.strDays) ? tp.strDays : []; const now = actionsFor(d); const n0 = Math.max(1, now.length);
    const r = 13, C = 2 * Math.PI * r;
    const ring = (sts, n, rest) => { const gap = n > 1 ? 2.4 : 0; const L = C / n - gap; let out = '<svg class="pl-r4" viewBox="0 0 34 34" aria-hidden="true">';
      for (let k = 0; k < n; k++) out += '<circle cx="17" cy="17" r="' + r + '" class="s ' + (rest ? 'r' : (sts[k] || '')) + '" stroke-dasharray="' + L.toFixed(2) + ' ' + (C - L).toFixed(2) + '" stroke-dashoffset="' + (-(k * C / n) - gap / 2).toFixed(2) + '" transform="rotate(-90 17 17)"/>';
      return out + '</svg>'; };
    const days = weekDates(d, wk).map((iso, i) => { const fut = iso > td; const xs = fut ? [] : actionsFor(d, iso); const lg = dayLog(d, iso);
      const sts = xs.map((a) => (a.state === 'd' ? 'd' : (a.state === 'p' ? 'p' : ''))); const str = (fut || iso === td) && sd.indexOf(i) >= 0 && !(lg.str || (lg.r || []).indexOf('strength') >= 0);
      return '<span class="pl-r7d' + (iso === td ? ' now' : '') + (fut ? ' fut' : '') + '"><span>' + esc(weekdayOf(iso, 'narrow')) + '</span>' + ring(sts, fut ? n0 : Math.max(1, xs.length), !fut && !!lg.rest) + '<span class="pl-r7s">' + (str ? SVG_STR : '') + '</span></span>'; }).join('');
    const legend = cyc && !disc() && now.every((a) => ['yoga', 'move', 'food', 'sleep'].indexOf(a.id) >= 0) ? tf('plan_wk_legend', { n: now.length, x: now.map((a) => t('plan_pt_' + a.id)).join(', ') }) : t('plan_wk_legend0');
    const fdn = fullDays(d, wk); const s = strNext(d); const st = s && !s.tp.str && s.a < s.t && s.iso ? (s.tom ? t('plan_wk_str_tom') : tf('plan_wk_str', { d: weekdayOf(s.iso) })) : '';
    const mins = tp ? (() => { const m = weekMin(d, wkNow(d)); const tg = target(d, tp.wk); return '<div class="pl-wk-min"><div class="row spread"><span class="small">' + esc(t('plan_wk_min')) + '</span><strong class="small">' + esc(tf('plan_min_of2', { a: m, t: tg })) + '</strong></div><span class="pl-wk-bar"><i style="width:' + Math.min(100, Math.round((m / Math.max(1, tg)) * 100)) + '%"></i></span></div>'; })() : '';
    if (fold) {   /* Version 39.22: Plan the week in its title, her minutes with + Add, her garden at its foot */
      const pt = S.joy && S.joy.petals ? S.joy.petals() : 0; const gd = S.routeOwner('joy') && !(S.retired && S.retired('joy')) && !disc() ? '<button type="button" class="item quiet pl-garden-in" data-go="joy"><span class="ico-sm hue hue-green">' + S.icon('flower') + '</span><span class="body"><strong>' + esc(pt ? tf(pt === 1 ? 'plan_garden_1' : 'plan_garden_n', { n: pt }) : t('joy_h')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button>' : '';
      const mins2 = mins;   /* Version 39.68: no + Add minutes (the doctors' review: her walk step counts her walking) */
      return '<div class="card pl-wkc"><div class="row spread"><h3>' + esc(t('plan_wk_h')) + '</h3>' + '<span class="small">' + esc(tf('plan_wk_days', { a: (wk - 1) * 7 + 1, b: wk * 7 })) + '</span></div>' +   /* Version 39.68: no Plan your week (the doctors' review) */
        '<div class="pl-r7" role="img" aria-label="' + esc(d7Aria(wk, fdn)) + '">' + days + '</div><p class="pl-wk-line">' + esc((fdn === 1 ? t('plan_wk_full1') : tf('plan_wk_full', { n: fdn })) + (st ? ' · ' + st : '')) + '</p>' +
        (movesOn(d) && wpOf(d) ? '<p class="small pl-wp-sum">' + esc(wpRowSub(d)) + '</p>' : '') + mins2 + gd + '</div>';   /* what she planned, in one line */
    }
    return '<div class="card pl-wkc"><div class="row spread"><h3>' + esc(t('plan_wk_h')) + '</h3><span class="small">' + esc(tf('plan_wk_days', { a: (wk - 1) * 7 + 1, b: wk * 7 })) + '</span></div>' +
      '<div class="pl-r7" role="img" aria-label="' + esc(d7Aria(wk, fdn)) + '">' + days + '</div><p class="small pl-wk-leg">' + esc(legend) + '</p><p class="pl-wk-line">' + esc((fdn === 1 ? t('plan_wk_full1') : tf('plan_wk_full', { n: fdn })) + (st ? ' · ' + st : '')) + '</p>' + mins +
      '</div>';
  }
  /* R10: her garden next to her week (the petal she earns for a full day or a check-in grows it) */
  const gardenRow = () => (S.routeOwner('joy') && !(S.retired && S.retired('joy')) && !disc() ? '<div class="list pl-garden"><button type="button" class="item" data-go="joy"><span class="ico-sm hue hue-green">' + S.icon('flower') + '</span><span class="body"><strong>' + esc(t('joy_h')) + '</strong><span>' + esc(t('joy_tile_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' : '');
  /* R7.4, R8: what consistency brings (the cycle plan's reviewed timeline, "You are here"), and her own signs beside it as they
     arrive: her energy from the look-backs, her 4-week check, her days between periods before and since. Not on a shared phone. */
  function consCard(d, fold) {
    if (disc()) return ''; const pk = packOf(d); const wk = weekNo(d); const sit = S.state.situation || {}; let tl = ''; const now = wk <= 4 ? 0 : (wk <= 12 ? 1 : 2);
    if (pk === 'cycle') { tl = '<ol class="pl-tl">' + [1, 2, 3].map((k, i) => '<li class="' + (i === now ? 'now' : (i < now ? 'past' : '')) + '"><strong>' + esc(t('plan_ex_' + k)) + '</strong>' + (i === now ? ' <span class="pill accent">' + esc(t('plan_ex_now')) + '</span>' : '') + '<span class="small">' + esc(t('plan_ex_' + k + '_p')) + '</span></li>').join('') + '</ol>'; }
    else if (pk === 'ttc') tl = babyD(d) ? [['plan_cons_tab', 'plan_fb_folic'], ['plan_cons_hb', 'plan_a_hb_s'], ['plan_cons_long', 'plan_rv_ttc']].map((x) => '<p class="small pl-bcons"><strong>' + esc(t(x[0])) + '</strong> ' + esc(t(x[1])) + '</p>').join('') : '<p class="small">' + esc(t('plan_rv_ttc')) + '</p>';   /* Mohit, 29 Oct: "use recommended wordings" */
    else if (pk === 'preg') tl = '<p class="small">' + esc(t('plan_rv_exp_preg')) + '</p>';
    const rows = []; const es = []; for (let k = Math.max(1, wk - 3); k < wk; k++) { const e = (d.weeks[k] || {}).e; if (e) es.push(tf('plan_sg_e_v', { n: k, e: t('plan_e_' + e) })); }
    if (es.length) rows.push([t('plan_sg_e'), es.slice(-2).join(' · ')]);
    if (planWeeks(d) === N && !careTime(d) && !pregnant() && !pfLead(d)) { const c = d.mcheck || {};
      if (mcDue(d)) rows.push([t('plan_sg_mc'), t('plan_sg_mc_now')]);
      else { const nk = [1, 2, 3].find((k) => !c[k] && wk <= k * 4); if (nk) { const n = S.diffDays(pToday(), S.addDays(S.fromISO(d.start), nk * 28)); if (n > 0) rows.push([t('plan_sg_mc'), n === 1 ? t('plan_sg_mc_1') : tf('plan_sg_mc_n', { n: n })]); } else if (c[1] || c[2] || c[3]) rows.push([t('plan_sg_mc'), t('plan_sg_mc_done')]); } }
    const per = ['cycle', 'pain', 'heavy', 'pms'].indexOf(pk) >= 0 && !sit.stopped && !sit.hysterectomy;
    if (per && S.cycle && S.cycle.gapsAll) { const cc = cycleCompare(d); const bl = cc.before.length ? cc.before[cc.before.length - 1] : null; const sl = cc.since.length ? cc.since[cc.since.length - 1] : null;
      if (bl != null || sl) rows.push([t('plan_sg_gap'), [bl != null ? tf('plan_sg_gap_b', { n: bl }) : '', sl ? tf(sl.guess ? 'plan_sg_gap_sa' : 'plan_sg_gap_s', { n: sl.days }) : ''].filter(Boolean).join(' · ')]); }
    if (!tl && !rows.length && !per) return '';
    const inner = tl + (rows.length ? '<span class="eyebrow">' + esc(t('plan_signs_h')) + '</span><div class="pl-signs">' + rows.map((x) => '<div class="pl-mc-row"><span>' + esc(x[0]) + '</span><strong class="pl-mc-v">' + esc(x[1]) + '</strong></div>').join('') + '</div>' : '') + (per ? '<p class="small">' + esc(t('plan_rv_cyc')) + '</p>' : '');
    if (fold) return foldCard('pl-cons', t('plan_cons_h'), pk === 'cycle' ? t('plan_ex_' + (now + 1)) + ': ' + t('plan_ex_' + (now + 1) + '_p') : '', inner);   /* Version 39.19: her stage now, in one line */
    return '<div class="card pl-cons"><h3>' + esc(t('plan_cons_h')) + '</h3>' + inner + '</div>';
  }
  /* her settings: one row on My plan, a page of their own */
  const settingsRow = () => '<div class="list pl-set-row"><button type="button" class="item" data-go="plan-settings"><span class="ico-sm hue hue-plum">' + S.icon('gear') + '</span><span class="body"><strong>' + esc(t('plan_set_h')) + '</strong><span>' + esc(t('plan_set_row_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>';
  function renderSettings(v) {
    const d0 = raw(); if (!on() || !S.canSave() || !d0 || !d0.start) { renderMyPlan(v); return; }
    pauseSync();   /* Version 39.22: her reminders as they stand, the nudge and the wind-down on by default */
    v.innerHTML = S.backRow(t('plan_set_h'), 'plan', false) + psSetRow(d0) + settingsHtml(fullD(d0), true) + '<p class="footnote">' + esc(footT(d0)) + '</p>';
    S.wire(v); wireSettings(v); wirePause(v);
  }
  /* +10/+15/+20/+30 minutes, with Undo for a slip of the finger */
  function wireAdd(v) {
    v.querySelectorAll('[data-pl-add]').forEach((b) => b.addEventListener('click', () => {
      const n = +b.dataset.plAdd; addMin(D(), n); S.save(); S.render();
      const msg = tf('plan_added', { n: n }) + ' · ' + tf('plan_today_n', { n: dayLog(D(), todayISO()).min || 0 });
      if (S.toastAct) S.toastAct(msg, [{ label: t('plan_undo'), fn: () => { addMin(D(), -n); S.saveQuiet(); S.render(); } }]); else S.toast(msg);
    }));
  }
  /* Version 37.2: it rings in the evening and opens the check-in (NOTIF_GO.plan), so it says what it is for */
  const REM_T = L('How did today go? 1 minute', 'आज का दिन कैसा रहा? 1 मिनट');
  /* Version 39.47 (Mohit's four-plan walk): to day 41 after a birth her evening is her recovery check, and the phone says so */
  const REM_RC = L('Your recovery check · 1 minute', 'आपकी रिकवरी जाँच · 1 मिनट');
  const REM_PF = L('Your last set, then how did today go? 1 minute', 'आख़िरी सेट, फिर आज का दिन कैसा रहा? 1 मिनट');   /* Version 39.56: her bedtime set rides on the evening ring */
  const remT = (d) => (d && recCi(d) ? REM_RC : (d && pfLead(d) && !pfRelax(d) ? REM_PF : REM_T));
  /* only what changed (no reminder is touched on a day nothing changes): her folic acid to 12 weeks, and the evening's words */
  const remWords = (d) => { try { folicSync(d); const r = S.reminders.get('plan'); const tt = remT(d); if (r && r.title && r.title.en !== tt.en) S.reminders.upsert({ id: 'plan', title: tt }, { quiet: true }); } catch (e) { /* a reminder that can't be read never stops Today */ } };
  function remOnNow(d, quiet) { const at = ciAt(d); d.ciSet = at; S.reminders.upsert({ id: 'plan', mod: 'plan', title: remT(d), start: d.start && d.start > todayISO() ? d.start : todayISO(), until: remEnd(d), every: 1, time: at, on: true, doneOn: null }, quiet ? { quiet: true } : undefined); remSync(d); }

  /* the weekly look-back: energy, what got in the way, and one tip for the next week (behavioural strategies, rec 3.2) */
  const BARS = ['time', 'tired', 'pain', 'family', 'out', 'none'];
  /* Version 37.2 (ux-gaps A3, F3): it leads with what she did, asks only about her energy, and takes "what got in the way" from
     the week's check-ins. On Today too, on the first 3 days of a new week (planCard). */
  function weekBars(d, wk) { const c = {}; weekDates(d, wk).forEach((iso) => { const b = dayLog(d, iso).bar; if (b && b !== 'none') c[b] = (c[b] || 0) + 1; }); const top = Object.keys(c).sort((a, b) => c[b] - c[a])[0]; return top ? { b: top, n: c[top] } : null; }
  const holds = (d, k) => { const ds = k ? weekDates(d, k) : null; return specFlat(d, ds && ds.length ? ds[0] : todayISO()).some((x) => x.grow === 'hold'); };   /* review PAGES-12: the steps she gets that week */
  /* Version 39.6 (journey audit P2-01): the step she did most in plan week k, to name in its look-back */
  function bestStep(d, k) {
    const n = {}, tt = {}; weekDates(d, k).forEach((iso) => { if (iso > todayISO()) return; const ck = dayLog(d, iso).ck || {}; actionsFor(d, iso).forEach((a) => { if (a.id !== 'fast' && (ck[a.id] === 'd' || a.state === 'd')) { n[a.id] = (n[a.id] || 0) + 1; tt[a.id] = a.name || a.title; } }); });   /* V39.9 review FOOD-06 */
    const id = Object.keys(n).sort((a, b) => n[b] - n[a])[0]; return id && n[id] >= 2 ? { t: tt[id], n: n[id] } : null;
  }
  /* Version 39.41 (Mohit's three-plan walk): in a pregnancy the look back says "Plan week {n}", never a week that reads as her pregnancy's */
  const revH = (d, k) => tf(packOf(d) === 'preg' || postV2(d) ? 'plan_rev_hp' : 'plan_rev_h', { n: k });   /* Version 39.47: after a birth too */
  /* Version 39.47 (Mohit's four-plan walk): "Your baby was born today", never "0 days ago" */
  const bornWhy = (n) => (n <= 0 ? t('plan_why_birth0') : (n === 1 ? t('plan_why_birth1') : tf('plan_why_birth', { n: n })));
  /* Version 39.47: on a shared phone each hidden step says its place on her list ("Your step 2"), so two of them never read the
     same; one alone keeps "Your plan for today". The count is the same everywhere: her private steps and her minutes */
  const discNm = (a, acts) => (acts.filter((x) => x.priv || x.kind === 'minutes').length > 1 && acts.indexOf(a) >= 0 ? tf('plan_today_dn', { n: acts.indexOf(a) + 1 }) : t('plan_today_d'));
  function reviewCard(d, onToday, mini) {
    const wk = weekNo(d); const k = wk - 1; const pw = d.keep ? keepUntil(d) : (planWeeks(d) || 999); if (k < 1 || k > pw) return ''; const w = d.weeks[k] || {};
    if (d.keep && k >= keepWeekly(d) && k % 4 !== 0) return '';   /* Version 39.6: after month 4, one look-back a month */
    if (w.seen) return '';
    const cyc = packOf(d) === 'cycle'; const bar = weekBars(d, k); const m = weekMin(d, k);
    /* Version 39.14 (R6): on Today it is one line above her steps until she taps it, so her steps keep the first screen */
    if (mini && S.mem.planRevOpen !== todayISO() + ':' + k) { const fd1 = actionsFor(d, weekDates(d, k)[0]).length > 1 ? fullDays(d, k) : 0;
      return '<button type="button" class="item quiet pl-th-rev pl-sl-rev pl-rev-row' + (w.e ? ' ok' : '') + '" id="pl-rev-open" data-nofold="1" data-disc-ok="1"><span class="body"><strong>' + esc(revH(d, k)) + '</strong><span>' + esc(w.e ? t('plan_rev_tip_s') : tf('plan_rev_short', { n: weekDays(d, k) }) + (fd1 > 0 ? ', ' + tf('plan_rev_short_f', { n: fd1 }) : '')) + '</span></span><span class="pill accent">' + esc(t('plan_rev_open')) + '</span></button>'; }
    const cls = 'card ' + (w.e ? 'ok ' : '') + 'pl-review' + (onToday ? ' pl-slot pl-sl-rev' : '');
    if (!w.e) {
      const fd = actionsFor(d, weekDates(d, k)[0]).length > 1 ? fullDays(d, k) : 0;   /* Version 39.13: the days with every step done, when there were any */
      const did = tf('plan_rev_days', { n: weekDays(d, k) }) + (cyc && m ? ' ' + tf('plan_rev_mins', { a: m }) : '') + (fd > 0 ? ' ' + tf('plan_rev_full', { n: fd }) : '');
      const barLine = bar && !(disc() && bar.b === 'pain') ? tf(bar.n === 1 ? 'plan_rev_bar1' : 'plan_rev_bar', { b: t('plan_b_' + bar.b), n: bar.n }) : '';
      /* Version 39.14 (R6): inside her Today card, two short lines above her steps: how her week went, and her energy */
      if (mini) return '<div class="pl-th-rev pl-sl-rev" data-nofold="1" data-disc-ok="1"><p class="small pl-rev-l"><strong>' + esc(revH(d, k)) + '</strong> · ' + esc(tf('plan_rev_short', { n: weekDays(d, k) }) + (fd > 0 ? ', ' + tf('plan_rev_short_f', { n: fd }) : '')) + '</p>' + (barLine ? '<p class="small pl-rev-l">' + esc(barLine) + '</p>' : '') + '<span class="small">' + esc(t('plan_rev_e')) + '</span><div class="chips pl-rev-c">' + ['low', 'ok', 'good'].map((x) => '<button type="button" class="chip" data-pl-e="' + x + '">' + face(x) + esc(t('plan_e_' + x)) + '</button>').join('') + '</div></div>';
      return '<div class="' + cls + '" data-nofold="1" data-disc-ok="1"><h3>' + esc(revH(d, k)) + '</h3><p class="small">' + esc(did) + '</p>' + (barLine ? '<p class="small">' + esc(barLine) + '</p>' : '') +
        '<span class="eyebrow">' + esc(t('plan_rev_e')) + '</span><div class="chips">' + ['low', 'ok', 'good'].map((x) => '<button type="button" class="chip" data-pl-e="' + x + '">' + face(x) + esc(t('plan_e_' + x)) + '</button>').join('') + '</div></div>';
    }
    const tipK = disc() && w.b === 'pain' ? 'none' : (w.b || (w.e === 'low' ? 'tired' : 'none'));   /* Version 39.6 (P2-01): low energy gets the tired tip */
    const best = bestStep(d, k);
    if (mini) return '<div class="pl-th-rev ok pl-sl-rev" data-nofold="1" data-disc-ok="1"><p class="small pl-rev-l"><strong>' + esc(revH(d, k)) + '</strong> · ' + esc(tipT(d, tipK)) + '</p><div class="row wrap">' + '<button type="button" class="btn sm" id="pl-rev-ok">' + esc(t('plan_got')) + '</button></div></div>';
    return '<div class="' + cls + '" data-nofold="1" data-disc-ok="1"><h3>' + esc(revH(d, k)) + '</h3>' + (best && !disc() ? '<p class="small pl-best">' + esc(tf('plan_rev_best', { x: best.t, n: best.n })) + '</p>' : '') + '<p>' + esc(tipT(d, tipK)) + '</p>' + (tipK === 'pain' && !pfLead(d) && S.routeOwner('relief-cramps') ? '<button type="button" class="btn sm" data-go="relief-cramps">' + esc(t('plan_tiles_moves')) + '</button>' : '') +
      (k < pw ? '<p class="small">' + esc(cyc ? tf('plan_rev_next', { t: target(d, k + 1) }) : t(holds(d, k) && weekDays(d, k) < 3 ? 'plan_rev_hold' : 'plan_rev_keep')) + '</p>' : '') +
      '<button type="button" class="btn sm" id="pl-rev-ok">' + esc(t('plan_got')) + '</button>' + '</div>';   /* Version 39.12 (gap 4); Version 39.68: no Plan your week */
  }
  function wireReview(v) {
    const k = weekNo(D()) - 1;
    const upd = (o) => { const d = D(); d.weeks[k] = Object.assign({}, d.weeks[k] || {}, o, { d: todayISO() }); S.save(); S.render(); };
    v.querySelectorAll('[data-pl-e]').forEach((b) => b.addEventListener('click', () => upd({ e: b.dataset.plE, b: (weekBars(D(), k) || {}).b || 'none' })));
    const ok = v.querySelector('#pl-rev-ok'); if (ok) ok.addEventListener('click', () => { const d = D(); d.weeks[k] = Object.assign({}, d.weeks[k] || {}, { seen: true }); S.saveQuiet(); S.render(); });
    const rp = v.querySelector('#pl-rev-plan'); if (rp) rp.addEventListener('click', () => { const d = D(); d.weeks[k] = Object.assign({}, d.weeks[k] || {}, { seen: true }); S.mem.planWkFrom = S.route() === 'home' ? 'home' : 'plan'; S.saveQuiet(); S.setHash('plan-week'); });   /* Version 39.12 */
  }
  /* Version 37.2 (ux-gaps A5, C3, D3): what happened, honestly; her results; a doctor when nothing changed; then keep going
     (the check-in carries on) or a new 12 weeks */
  function renderFinished(v, d, hd) {
    if (!hd) hd = head('plan_h', 'plan');
    if (!d.endSeen) { D().endSeen = todayISO(); S.saveQuiet(); }
    const carrying = !!(d.keep && !finished(d));   /* Version 39.27 (R03): her 12 weeks' results, her steps carrying on */
    if (d.keep && !carrying && !d.yearSeen) { D().yearSeen = todayISO(); S.saveQuiet(); }
    const kept = !!d.keep && !carrying; const n = carrying ? followedDays(d, planWeeks(d)) : followedDays(d); const tot = (kept ? keepUntil(d) : planWeeks(d)) * 7; const pk = packOf(d) || 'cycle';
    const row = (id, title, sub) => '<button type="button" class="item" id="' + id + '"><span class="body"><strong>' + esc(title) + '</strong><span>' + esc(sub) + '</span></span><span class="chev">' + S.I.chev + '</span></button>';
    /* Version 39.6 (journey audit P2-03; roadmap section 2, "The end sentence"): her result as counts with no judging word,
       then one card for every woman: show this page to a doctor, the free government doctor first */
    const endFree = S.routeOwner('access-doctor') ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '';
    const endRest = '<button type="button" class="btn sm primary" data-go="report-show">' + esc(t('plan_end_show')) + '</button>' +
      (disc() ? '' : '<button type="button" class="btn sm" data-ask="' + esc(tf('plan_ask_r', { t: packTitle(d) })) + '">' + esc(t('plan_rv_qura')) + '</button>');
    const endCard = '<div class="card soft pl-end-doc"><h3>' + esc(t('plan_end_doc_h')) + '</h3><p class="small">' + esc(t('plan_end_doc_p')) + '</p>' + (pfLead(d) ? '<p class="small pl-pf-end"><strong>' + esc(t('plan_pf_end_h')) + '</strong> ' + esc(t('plan_pf_end_p')) + '</p>' : '') + (perV2(d) ? '<p class="small pl-per-end">' + esc(t('plan_per_end')) + '</p>' : '') + '<div class="row wrap">' + byRoute(endFree, endRest) + '</div></div>';
    v.innerHTML = hd + pendBanner() + '<div class="card pl-intro">' + (S.art ? S.art.sakhi({ pose: 'cheer', look: (S.state.settings || {}).look }) : '') + '<h2>' + esc(t(kept ? 'plan_year_h' : 'plan_end_h')) + '</h2><p>' + esc(tf('plan_fin_days', { n: n, t: tot })) + '</p><p class="small">' + esc(t(n < 12 ? 'plan_fin_low' : 'plan_fin_p')) + '</p></div>' +
      (mcDue(d) === 3 ? '<div class="card pl-mc-end"><h3>' + esc(t('plan_mc_end_h')) + '</h3><p class="small">' + esc(t('plan_mc_row_s')) + '</p><button type="button" class="btn sm primary" data-go="plan-check">' + esc(tf('plan_mc_b', { n: N })) + '</button></div>' : '') +   /* Version 39.12 (gap 6) */
      menoRes(d) + resultCard(d) + (docTold(d) && !disc() ? '<p class="small pl-told">' + esc(docTold(d)) + '</p>' : '') + endCard +
      '<section class="care-sec pl-sec"><h2>' + esc(t('plan_fin_next')) + '</h2><div class="list">' +
        (carrying ? '<div class="item quiet pl-carry-on"><span class="body"><strong>' + esc(t('plan_carry_on')) + '</strong><span>' + esc(t('plan_keep_s')) + '</span></span></div>' : (d.keep || !(keepCap(d) > weekNo(d)) ? '' : row('pl-keep', t('plan_keep2'), t('plan_keep_s')))) +
        row('pl-again', t('plan_other'), t(pk === 'cycle' ? 'plan_other_s' : 'plan_other_s2')) + (carrying ? row('pl-end-stop', t('plan_stop'), t('plan_end_stop_s')) : '') + '</div>' +
        (carrying && S.mem.planStopE ? '<div class="card warn"><p>' + esc(t('plan_stop_q')) + '</p><div class="grid2"><button type="button" class="btn" id="pl-end-no">' + esc(t('plan_cancel')) + '</button><button type="button" class="btn primary" id="pl-end-yes">' + esc(t('plan_stop_yes')) + '</button></div></div>' : '') + '</section>' +
      '<details class="pl-details"><summary>' + esc(t('plan_details')) + '</summary><div class="stack" style="gap:10px">' + (pk === 'cycle' ? progressCore(d) : lightResults(d)) + '</div></details>';
    S.wire(v);
    const kp = v.querySelector('#pl-keep'); if (kp) kp.addEventListener('click', () => { const dd = D(); dd.keep = true; if (S.reminders.get('plan')) remOnNow(dd, true); S.save(); S.render(); });
    const es = v.querySelector('#pl-end-stop'); if (es) es.addEventListener('click', () => { S.mem.planStopE = true; S.render(); });
    const en = v.querySelector('#pl-end-no'); if (en) en.addEventListener('click', () => { S.mem.planStopE = false; S.render(); });
    const ey = v.querySelector('#pl-end-yes'); if (ey) ey.addEventListener('click', () => { closePlan(D()); S.mem.planStopE = false; S.save(); S.setHash('plan'); });
    v.querySelector('#pl-again').addEventListener('click', () => { const ik = d.intake || S.state.intake || {}; S.mem.planIntake = Object.assign({}, ik, { stage: stageNowKey(), iq: 0 }, Array.isArray(ik.signs) && !ik.signs.length && ik.gap ? { signs: ['none'] } : {}); S.setHash('plan-goal'); });
  }

  /* Version 39.27 (R03): her 12 weeks' results while her steps carry on (Today's "See your results") */
  function renderEnd(v) { const d0 = raw(); if (!on() || !S.canSave() || !d0 || !d0.start || !packOf(d0) || weekNo(fullD(d0)) <= N) { renderMyPlan(v); return; } renderFinished(v, fullD(d0), S.backRow(packTitle(d0), 'home', false)); }

  /* ---------- make it hers: goal, how active, pain, food, region ---------- */
  function renderStart(v) {
    if (!on()) { offScreen(v); return; }
    const hd = head('plan_s_h');
    if (!S.canSave()) { v.innerHTML = hd + S.needDiary(); S.wire(v); return; }
    if (pauseWhy()) { renderHub(v); return; }   /* paused: the plan's page says why (a blank page before) */
    const dt0 = S.food ? S.food.diet() : null;   /* review FOOD-05: how she eats, as saved (vegetarian unless she said otherwise) */
    const d = D(); const dw = dayWait(d); const f = S.mem.planForm = S.mem.planForm || { goal: d.goal || null, level: d.level == null || dw.indexOf('act') >= 0 ? null : d.level, lim: d.limits && dw.indexOf('lim') < 0 ? Object.assign({}, d.limits) : null, food: dt0 ? dt0.type : (d.food || null), milk: dt0 && dt0.milk === false ? 'n' : 'y', region: regionOf(d) };
    const chips = (name, opts, cur, key) => '<div class="chips" role="group" aria-label="' + esc(t(name)) + '">' + opts.map((o) => '<button type="button" class="chip' + (cur === o[0] ? ' on' : '') + '" data-pl-f="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + esc(t(o[1])) + '</button>').join('') + '</div>';
    const lim = f.lim; const limCur = lim == null ? null : (lim.knees && lim.back ? 'both' : (lim.knees ? 'knees' : (lim.back ? 'back' : 'none')));
    const pin = pinRegion();
    v.innerHTML = hd +
      '<h2>' + esc(t('plan_s_goal')) + '</h2>' + chips('plan_s_goal', ['cycles', 'energy', 'skin', 'weight', 'pain'].map((x) => [x, 'plan_g_' + x]), f.goal, 'goal') +
      '<h2>' + esc(t('plan_s_level')) + '</h2>' + chips('plan_s_level', [['0', 'plan_lv_0'], ['1', 'plan_lv_1'], ['2', 'plan_lv_2']], f.level == null ? null : String(f.level), 'level') +
      '<h2>' + esc(t('plan_s_lim')) + '</h2>' + chips('plan_s_lim', [['none', 'plan_lim_none'], ['knees', 'plan_lim_knees'], ['back', 'plan_lim_back'], ['both', 'plan_lim_both']], limCur, 'lim') +
      '<h2>' + esc(t('plan_s_food')) + '</h2>' + chips('plan_s_food', [['veg', 'plan_f_veg'], ['egg', 'plan_f_egg'], ['nonveg', 'plan_f_nonveg'], ['jain', 'plan_f_jain']], f.food, 'food') +
      '<h2>' + esc(t('plan_in_milk')) + '</h2>' + chips('plan_in_milk', [['y', 'plan_yes'], ['n', 'plan_no']], f.milk, 'milk') +
      '<h2>' + esc(t('plan_s_reg')) + '</h2>' + (pin ? '<p class="small">' + esc(tf('plan_s_reg_pin', { r: tx(REG[pin].t) })) + '</p>' : '<p class="small">' + esc(t('plan_s_reg_pick')) + '</p>') +
      '<div class="chips" role="group" aria-label="' + esc(t('plan_s_reg')) + '">' + REGS.map((x) => '<button type="button" class="chip' + (f.region === x ? ' on' : '') + '" data-pl-f="region" data-v="' + x + '" aria-pressed="' + (f.region === x) + '">' + esc(tx(REG[x].t)) + '</button>').join('') + '</div>' +
      (d.start ? '<p class="small">' + esc(t('plan_s_restart')) + '</p>' : '') + '<p class="small pl-err" id="pl-err" hidden>' + esc(t('plan_s_need')) + '</p>' +
      '<button type="button" class="btn primary block" id="pl-go">' + esc(t('plan_s_go')) + '</button>';
    S.wire(v);
    v.querySelectorAll('[data-pl-f]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.plF, val = b.dataset.v;
      if (k === 'level') f.level = +val; else if (k === 'lim') f.lim = { knees: val === 'knees' || val === 'both', back: val === 'back' || val === 'both' }; else f[k] = val;
      S.render();
    }));
    v.querySelector('#pl-go').addEventListener('click', () => {
      if (!f.goal || f.level == null || !f.lim || !f.food || !f.region) { const e = v.querySelector('#pl-err'); if (e) e.hidden = false; return; }
      const dd = D(); const pcos = !!(S.state.situation || {}).pcos; const gk = !pcos && (f.goal === 'weight' || f.goal === 'skin') ? f.goal : 'pmos';
      dd.next = { pack: 'cycle', goalKey: gk, goal: f.goal, level: f.level, limits: f.lim, food: f.food, region: f.region, focus: f.goal === 'weight' ? 'weight' : (dd.focus || 'habits'),
        remAt: dd.remAt && dd.remAt >= '17:00' ? dd.remAt : '20:00', when: dd.when || null, bed: dd.bed || null, work: dd.work || null, intake: (dd.start && dd.intake) || S.state.intake || null, at: todayISO(),
        dayAsk: dayWait(dd).filter((k) => ['act', 'lim', 'food', 'milk'].indexOf(k) < 0) };   /* Version 39.66: answered here; her bedtime and her day wait on */
      if (S.food && S.food.set) S.food.set(f.food, f.milk !== 'n');   /* review FOOD-05: My food and My plate follow her answer */
      S.state.prompts = Object.assign({}, S.state.prompts || {}, { reveal: todayISO() }); S.mem.planForm = null; S.mem.rvCard = 0; S.mem.rvStart = null;
      S.save(); S.setHash('plan-reveal');
    });
  }

  /* ---------- My plate ---------- */
  /* Version 39.3: the plate's protein quarter in her own foods */
  const protKey = (food) => { const milk = !S.food || S.food.diet().milk; return food === 'nonveg' ? (milk ? 'plan_plate_prot' : 'plan_plate_prot_nn') : (food === 'egg' ? (milk ? 'plan_plate_prot_e' : 'plan_plate_prot_en') : (milk ? 'plan_plate_prot_v' : 'plan_plate_prot_vn')); };
  function renderPlate(v) {
    if (!on()) { offScreen(v); return; }
    const has = S.canSave(); const d = has ? D() : {};
    const food = has && S.food ? S.food.diet().type : (S.mem.planFood || (S.food ? S.food.diet().type : 'veg'));   /* Version 39.3: vegetarian unless she said otherwise; review FOOD-06: her pick when she is only reading */
    const reg = (has ? regionOf(d) : null) || S.mem.planReg || pinRegion();
    const wk = has && d.start ? Math.max(1, wkShown(d)) : 1;
    /* Version 39.8 (diet audit VD-03): each food as a picture tile with a ✓ / – / ✗ mark as well as the colour */
    const tiles = !!(S.food && S.food.tile);
    const chip = (x, cls) => (tiles ? S.food.tile(x, cls, icoHtml(x[0])) : '<span class="pl-f ' + cls + '">' + icoHtml(x[0]) + '<span>' + esc(foodName(x)) + '</span></span>');
    const groupRows = (list, cls) => FT().GROUPS.map((g) => { const items = list.filter((x) => x[0] === g && dietOk(x, food)); return items.length ? '<div class="pl-frow"><span class="pl-glab">' + esc(t('plan_g_' + g)) + '</span><div class="pl-food' + (tiles ? ' food-tiles' : '') + '">' + items.map((x) => chip(x, cls)).join('') + '</div></div>' : ''; }).join('');
    const hb = has && d.start ? habitsOf(d, wk) : [];
    const plate = has ? (dayLog(d, todayISO()).plate || {}) : {};
    v.innerHTML = head('plan_plate_h') + '<p class="small">' + esc(t('plan_plate_p')) + '</p>' +
      '<div class="card pl-platecard">' + plateSvg(food) + '<ul class="pl-plist"><li>' + esc(t('plan_plate_half')) + '</li><li>' + esc(t('plan_plate_grain')) + '</li><li>' + esc(t(protKey(food))) + '</li><li>' + esc(t(S.food && !S.food.diet().milk ? 'plan_plate_bowl_n' : 'plan_plate_bowl')) + '</li></ul></div>' +
      '<div class="chips" role="group" aria-label="' + esc(t('plan_s_food')) + '">' + [['veg', 'plan_f_veg'], ['egg', 'plan_f_egg'], ['nonveg', 'plan_f_nonveg'], ['jain', 'plan_f_jain']].map((o) => '<button type="button" class="chip' + (food === o[0] ? ' on' : '') + '" data-pl-food="' + o[0] + '" aria-pressed="' + (food === o[0]) + '">' + (S.food && S.food.mark ? S.food.mark(o[0]) : '') + esc(t(o[1])) + '</button>').join('') + '</div>' +
      (has ? thaliCard(d, food) : '') +
      (hb.length ? '<div class="card"><h3>' + esc(t('plan_habits_h')) + '</h3>' + hb.map((h) => '<label class="pl-hab' + (plate[h.id] ? ' done' : '') + '"><input type="checkbox" data-pl-hab="' + h.id + '"' + (plate[h.id] ? ' checked' : '') + '><span><strong>' + esc(tx(h.h)) + '</strong><span class="small">' + esc(habitP(h)) + '</span></span></label>').join('') + '</div>' : '') +
      '<h2 class="pl-more"><span class="pl-dot ok"></span>' + esc(t('plan_more')) + '</h2>' +
      (reg ? '<div class="row spread"><span class="eyebrow">' + esc(tf('plan_local', { r: tx(REG[reg].t) })) + '</span><button type="button" class="linkbtn" id="pl-reg">' + esc(t('plan_change')) + '</button></div>' : '<div class="row spread"><span class="eyebrow">' + esc(t('plan_s_reg_pick')) + '</span></div>') +
      (S.mem.planRegOpen || !reg ? '<div class="chips">' + REGS.map((x) => '<button type="button" class="chip' + (reg === x ? ' on' : '') + '" data-pl-reg="' + x + '">' + esc(tx(REG[x].t)) + '</button>').join('') + '</div>' : '') +
      (reg ? '<div class="card pl-fcard">' + groupRows(FT().LOCAL[reg] || [], 'ok') + '</div>' : '') +
      (reg ? '<details class="pl-all"><summary>' + esc(t('plan_all')) + '</summary><div class="card pl-fcard">' + groupRows(FT().MORE, 'ok') + '</div></details>' : '<span class="eyebrow">' + esc(t('plan_all')) + '</span><div class="card pl-fcard">' + groupRows(FT().MORE, 'ok') + '</div>') +
      '<h2 class="pl-less"><span class="pl-dot less"></span>' + esc(t('plan_less')) + '</h2><div class="card pl-fcard">' + groupRows(FT().LESS, 'less') + '</div>' +
      '<h2 class="pl-avoid"><span class="pl-dot avoid"></span>' + esc(t('plan_avoid')) + '</h2><div class="card pl-fcard"><div class="pl-food' + (tiles ? ' food-tiles' : '') + '">' + FT().AVOID.map((x) => chip(x, 'avoid')).join('') + '</div></div>' +
      '<p class="small">' + esc(t('plan_plate_note')) + '</p>' +
      (S.routeOwner('periods-fasting') ? '<button type="button" class="btn sm" data-go="periods-fasting">' + esc(t('plan_fast')) + '</button>' : '') +
      '<p class="footnote">' + esc(t('plan_plate_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-pl-food]').forEach((b) => b.addEventListener('click', () => { if (has) { D().food = b.dataset.plFood; if (S.food) S.food.set(b.dataset.plFood); S.saveQuiet(); } else S.mem.planFood = b.dataset.plFood; S.render(); }));
    const rb = v.querySelector('#pl-reg'); if (rb) rb.addEventListener('click', () => { S.mem.planRegOpen = !S.mem.planRegOpen; S.render(); });
    v.querySelectorAll('[data-pl-reg]').forEach((b) => b.addEventListener('click', () => { if (has) { D().region = b.dataset.plReg; S.saveQuiet(); } else S.mem.planReg = b.dataset.plReg; S.mem.planRegOpen = false; S.render(); }));
    v.querySelectorAll('[data-pl-hab]').forEach((c) => c.addEventListener('change', () => { setHabit(D(), c.dataset.plHab, c.checked); S.save(); S.render(); }));
    if (has) wireThali(v, food);
  }

  /* ---------- My body (optional): BMI and waist with the Indian cut-offs ---------- */
  const BMI_LO = 15, BMI_HI = 35;
  function bmiBar(b) {
    const x = (val) => 8 + ((S.clamp(val, BMI_LO, BMI_HI) - BMI_LO) / (BMI_HI - BMI_LO)) * 284;
    const seg = (a, z, cls) => '<rect x="' + x(a).toFixed(1) + '" y="14" width="' + (x(z) - x(a)).toFixed(1) + '" height="14" class="' + cls + '"/>';
    return '<svg class="pl-bar" viewBox="0 0 300 56" role="img" aria-label="' + esc(t('plan_bmi_range')) + '">' + seg(BMI_LO, 18.5, 'b0') + seg(18.5, 23, 'b1') + seg(23, 25, 'b2') + seg(25, BMI_HI, 'b3') +
      [18.5, 23, 25].map((val) => '<text x="' + x(val).toFixed(1) + '" y="46" text-anchor="middle">' + val + '</text>').join('') +
      (b != null ? '<rect x="' + (x(b) - 2).toFixed(1) + '" y="6" width="4" height="30" rx="2" class="mk"/>' : '') + '</svg>';
  }
  function waistBar(w) {
    const lo = 60, hi = 110; const x = (val) => 8 + ((S.clamp(val, lo, hi) - lo) / (hi - lo)) * 284;
    return '<svg class="pl-bar" viewBox="0 0 300 56" role="img" aria-label="' + esc(t('plan_waist_ok')) + '"><rect x="8" y="14" width="' + (x(80) - 8).toFixed(1) + '" height="14" class="b1"/><rect x="' + x(80).toFixed(1) + '" y="14" width="' + (292 - x(80)).toFixed(1) + '" height="14" class="b3"/>' +
      '<text x="' + x(80).toFixed(1) + '" y="46" text-anchor="middle">80</text>' + (w ? '<rect x="' + (x(w) - 2).toFixed(1) + '" y="6" width="4" height="30" rx="2" class="mk"/>' : '') + '</svg>';
  }
  function renderBody(v) {
    if (!on()) { offScreen(v); return; }
    const hd = head('plan_body_h');
    if (!S.canSave()) { v.innerHTML = hd + S.needDiary(); S.wire(v); return; }
    if (pregnant()) { v.innerHTML = hd + '<div class="card soft"><p>' + esc(t('plan_body_preg')) + '</p>' + (S.routeOwner('preg-logs') ? '<button type="button" class="btn sm" data-go="preg-logs">' + esc(t('plan_go_logs')) + '</button>' : '') + '</div>'; S.wire(v); return; }
    const d = D(); const last = bodyLast(d); const lastAny = d.body.length ? d.body[d.body.length - 1] : null;
    const hide = disc() && !S.mem.planShow;
    const hCm = (S.mem.planH != null ? S.mem.planH : (d.height || (last && last.h) || '')); const ft = hCm ? Math.floor(hCm / 30.48) : ''; const inch = hCm ? Math.min(11, Math.max(0, Math.round((hCm / 2.54) - ft * 12))) : '';
    const b = bmiNow(d);
    const msg = b == null ? '' : (b < 18.5 ? 'plan_bmi_low' : (b < 23 ? 'plan_bmi_ok' : 'plan_bmi_hi'));
    const wst = lastAny && lastAny.waist ? lastAny.waist : null;
    const focusRow = '<h2>' + esc(t('plan_focus_h')) + '</h2><div class="chips">' + ['habits', 'weight'].map((x) => '<button type="button" class="chip' + ((d.focus || 'habits') === x ? ' on' : '') + '" data-pl-focus="' + x + '" aria-pressed="' + ((d.focus || 'habits') === x) + '">' + esc(t('plan_focus_' + x)) + '</button>').join('') + '</div>' +
      '<p class="small">' + esc(t(d.focus === 'weight' ? (b != null && b < 23 ? 'plan_focus_lowbmi' : 'plan_focus_weight_s') : 'plan_focus_habits_s')) + '</p>';
    const results = hide ? '<div class="card soft"><p class="small">' + esc(t('plan_body_hidden')) + '</p><button type="button" class="btn sm" id="pl-show">' + esc(t('plan_body_show')) + '</button></div>' :
      ((b != null ? '<div class="card pl-bmi"><div class="row spread"><span class="eyebrow">' + esc(t('plan_bmi')) + '</span><span class="pl-bmival">' + esc(num1(b)) + '</span></div>' + bmiBar(b) + '<p class="small">' + esc(t('plan_bmi_range')) + '</p><p>' + esc(t(msg)) + '</p></div>' : '') +
       (wst ? '<div class="card pl-bmi"><div class="row spread"><span class="eyebrow">' + esc(t('plan_waist_l')) + '</span><span class="pl-bmival">' + esc(num1(wst)) + ' ' + esc(t('plan_cm')) + '</span></div>' + waistBar(wst) + '<p>' + esc(t(wst >= 80 ? 'plan_waist_hi' : 'plan_waist_ok')) + '</p></div>' : '') +
       (d.body.length ? '<details><summary>' + esc(t('plan_hist')) + '</summary><div class="table-wrap"><table class="pl-hist"><tbody>' + d.body.slice(-8).reverse().map((x) => '<tr><td>' + esc(S.fmtD(S.fromISO(x.d), { day: 'numeric', month: 'short' })) + '</td><td>' + (x.w ? esc(num1(x.w)) + ' kg' : '–') + '</td><td>' + (x.waist ? esc(num1(x.waist)) + ' ' + esc(t('plan_cm')) : '–') + '</td><td>' + (x.w && x.h ? 'BMI ' + esc(num1(bmiOf(x.w, x.h))) : '') + '</td></tr>').join('') + '</tbody></table></div></details>' : ''));
    const opts = (a, z, cur) => { let s = '<option value=""></option>'; for (let i = a; i <= z; i++) s += '<option value="' + i + '"' + (cur === i ? ' selected' : '') + '>' + i + '</option>'; return s; };
    v.innerHTML = hd + '<p class="small">' + esc(t('plan_body_p')) + '</p>' + results +
      '<div class="card"><h3>' + esc(t('plan_height')) + '</h3><div class="grid3 pl-hrow"><label for="pl-ft">' + esc(t('plan_ft')) + '<select id="pl-ft">' + opts(4, 6, ft === '' ? null : ft) + '</select></label><label for="pl-in">' + esc(t('plan_in')) + '<select id="pl-in">' + opts(0, 11, inch === '' ? null : inch) + '</select></label><label for="pl-cm">' + esc(t('plan_cm')) + '<input id="pl-cm" type="number" inputmode="decimal" min="120" max="210" step="0.5" value="' + esc(hCm ? num1(hCm) : '') + '"></label></div>' +
        '<label for="pl-w">' + esc(t('plan_weight')) + '</label><input id="pl-w" type="number" inputmode="decimal" min="25" max="250" step="0.1" value="' + esc(hide || !lastAny || !lastAny.w ? '' : num1(lastAny.w)) + '">' +
        '<label for="pl-waist">' + esc(t('plan_waist')) + '</label><input id="pl-waist" type="number" inputmode="decimal" min="40" max="200" step="0.5" value="' + esc(hide || !wst ? '' : num1(wst)) + '">' +
        '<details><summary>' + esc(t('plan_waist_how')) + '</summary><p class="small">' + esc(t('plan_waist_how_p')) + '</p></details>' +
        '<p class="small pl-err" id="pl-berr" hidden>' + esc(t('plan_body_bad')) + '</p><button type="button" class="btn primary block" id="pl-bsave">' + esc(t('plan_body_save')) + '</button></div>' +
      (raw() && raw().start ? focusRow : '') +
      (d.body.length ? (S.mem.planDel ? '<div class="card warn"><p>' + esc(t('plan_body_del_q')) + '</p><div class="grid2"><button type="button" class="btn" id="pl-del-no">' + esc(t('plan_cancel')) + '</button><button type="button" class="btn primary" id="pl-del-yes">' + esc(t('plan_body_del_yes')) + '</button></div></div>' : '<button type="button" class="linkbtn" id="pl-del">' + esc(t('plan_body_del')) + '</button>') : '') +
      '<p class="footnote">' + esc(t('plan_body_foot')) + '</p>';
    S.wire(v);
    const ftS = v.querySelector('#pl-ft'), inS = v.querySelector('#pl-in'), cmI = v.querySelector('#pl-cm');
    const fromFt = () => { if (ftS.value === '') return; const cm = (+ftS.value * 12 + (+inS.value || 0)) * 2.54; cmI.value = num1(cm); S.mem.planH = +num1(cm); };
    ftS.addEventListener('change', fromFt); inS.addEventListener('change', fromFt);
    cmI.addEventListener('input', () => { const cm = parseFloat(cmI.value); S.mem.planH = isFinite(cm) ? cm : null; });
    v.querySelector('#pl-bsave').addEventListener('click', () => {
      const h = parseFloat(cmI.value), w = parseFloat(v.querySelector('#pl-w').value), ws = parseFloat(v.querySelector('#pl-waist').value);
      const okH = isFinite(h) && h >= 120 && h <= 210, okW = !isFinite(w) || (w >= 25 && w <= 250), okWs = !isFinite(ws) || (ws >= 40 && ws <= 200);
      if (!okH || !okW || !okWs || (!isFinite(w) && !isFinite(ws))) { v.querySelector('#pl-berr').hidden = false; return; }
      const dd = D(); dd.height = Math.round(h * 2) / 2; const td = todayISO(); const e = { d: td, h: dd.height };
      if (isFinite(w)) e.w = Math.round(w * 10) / 10; if (isFinite(ws)) e.waist = Math.round(ws * 2) / 2;
      const i = dd.body.findIndex((x) => x.d === td); if (i >= 0) dd.body[i] = e; else dd.body.push(e);
      if (dd.body.length > 60) dd.body.splice(0, dd.body.length - 60);
      S.mem.planH = null; S.mem.planShow = true; S.saveQuiet(); S.toast(t('plan_body_saved')); S.render();
    });
    v.querySelectorAll('[data-pl-focus]').forEach((b2) => b2.addEventListener('click', () => { D().focus = b2.dataset.plFocus; S.saveQuiet(); S.render(); }));
    const sh = v.querySelector('#pl-show'); if (sh) sh.addEventListener('click', () => { S.mem.planShow = true; S.render(); });
    const dl = v.querySelector('#pl-del'); if (dl) dl.addEventListener('click', () => { S.mem.planDel = true; S.render(); });
    const dn = v.querySelector('#pl-del-no'); if (dn) dn.addEventListener('click', () => { S.mem.planDel = false; S.render(); });
    const dy = v.querySelector('#pl-del-yes'); if (dy) dy.addEventListener('click', () => { const dd = D(); dd.body = []; delete dd.height; if (dd.focus === 'weight') dd.focus = 'habits'; S.mem.planDel = false; S.saveQuiet(); S.render(); });
  }

  /* ---------- Yoga and moves ---------- */
  /* Version 39.22 (Mohit, 27 Oct: "make meditation part of plan along with exercises"): Moves and calm. Calm holds Dr. Megha's
     three sessions (where each fits: AYUSH's protocol for Bhramari, the yoga nidra trials), Calm breath, and the sounds for sleep */
  const calmOn = () => !!(S.calm && S.calm.short && S.routeOwner('calm'));
  const movesTabs = (calm) => (calmOn() ? '<div class="pl-seg" role="tablist" aria-label="' + esc(t('plan_moves_h')) + '">' + [['plan-moves', 'plan_moves_tab', !calm], ['plan-calm', 'plan_calm_tab', !!calm]].map((x) => '<button type="button" role="tab" class="pl-seg-b' + (x[2] ? ' on' : '') + '" aria-selected="' + x[2] + '"' + (x[2] ? '' : ' data-go="' + x[0] + '"') + '>' + esc(t(x[1])) + '</button>').join('') + '</div>' : '');
  function renderCalm(v) {
    if (!on() || !calmOn()) { renderMoves(v); return; }
    /* Version 39.24: the Calm tab is the Wind down page (mods/calm.js): tonight's session, the sessions, Calm breath, the sounds that
       play right here with the timer, and the safety card */
    v.innerHTML = head('plan_moves_h') + movesTabs(true) + S.calm.listBody();
    S.wire(v); S.calm.wireList(v);
  }
  /* Version 39.45: the walk card's 3D loop (its still for "reduce motion" or a video that can't play), or the drawing without web/fig */
  const walkFig = () => { const s = figStill('walk'); if (!s) return figSvg('walk'); const lp = figLoop({ pose: 'walk' });
    return lp && !reduced() ? '<video class="pl-3d" id="pl-fig3d" src="' + lp + '" poster="' + s + '" data-still="' + s + '" muted playsinline autoplay loop preload="auto"></video>' : '<img class="pl-3d" src="' + s + '" alt="">'; };
  function renderMoves(v) {
    if (!on()) { offScreen(v); return; }
    const d = S.canSave() && raw() ? D() : null; const tp = d && d.start && !finished(d) && !pauseWhy() ? todayPlan(d) : null;
    const tRs = !tp ? [] : (packOf(d) === 'cycle' ? [tp.routine] : actionsFor(fullD(d)).filter((a) => a.kind === 'routine' && a.r).map((a) => a.r));   /* Version 39.51 (Mohit's phone): Today is her plan's own routine, not the cycle plan's */
    v.innerHTML = head('plan_moves_h') + movesTabs(false) + '<p class="small">' + esc(t('plan_moves_p')) + '</p>' +
      '<div class="list">' + RIDS.filter((id) => routineOk(id, d) && !(id === 'calm' && calmOn())).map((id) => '<button type="button" class="item pl-ritem" data-go="plan-r-' + id + '"><span class="pl-rfig hue-' + R[id].hue + (figStill((R[id].fb || '') + (R[id].ffig || R[id].first)) ? ' pl-rf3d' : '') + '">' + figThumb({ pose: R[id].first, fig: R[id].ffig, fb: R[id].fb, bump: R[id].bump }) + '</span><span class="body"><strong>' + esc(rName(id)) + '</strong><span>' + esc(rSub(id)) + ' · ' + esc(tf('plan_mins', { n: routineMins(id, d) })) + '</span></span>' + (tRs.indexOf(id) >= 0 ? '<span class="pill accent">' + esc(t('plan_today_pill')) + '</span>' : '<span class="chev">' + S.I.chev + '</span>') + '</button>').join('') + '</div>' +
      '<div class="card pl-walkcard"><span class="pl-mfig' + (figStill('walk') ? ' pl-mf3d' : '') + '" id="pl-walkfig">' + walkFig() + '</span><div class="pl-mtext"><h3>' + esc(t('plan_walk_h')) + '</h3><p class="small">' + esc(t('plan_walk_p')) + '</p></div></div>' +
      /* Version 39.68 (the doctors' review): no +10 to +30 walking minutes here; her walk step already counts her walking */
      (d && (d.limits || {}).knees ? '<p class="small">' + esc(t('plan_knee_note')) + '</p>' : '') +
      (lutOn(d) ? '<p class="small pl-blut">' + esc(t('plan_blut')) + '</p>' : '') + (babyD(d) ? '<p class="small">' + esc(t('plan_bmove')) + '</p>' : '') +   /* Version 39.32 (packet F6, F7) */
      (pregnant() && !disc() && pyWhy(d) ? pyLockCard(d) : '') +   /* Version 39.52 */
      (pregnant() ? pyStopCard() : '<div class="card warn"><h3>' + esc(t('plan_stop_h')) + '</h3><p class="small">' + esc(t((S.state.situation || {}).stopped ? 'plan_stop_l_m' : 'plan_stop_l')) + '</p></div>') +
      '<p class="footnote">' + esc(t('plan_moves_foot')) + '</p>';
    S.wire(v);
    const wf = v.querySelector('#pl-walkfig svg'); if (wf) animate(wf, 'walk', 'walk2', ANIM.walk[2], false, false); wireFig3d(v);
    wireAdd(v);
  }

  /* Version 39.52: pregnancy yoga's stop card (the moves' own stop signs, ACOG's in our words, and Help's "Call 112 now" line), the
     note when it isn't open to her, and "Feeling unwell?" (stop now and rest; Stop for today holds her walk and yoga until she
     checks her answers again, as a sign that doesn't wait does) */
  const pyNowCard = () => '<div class="card dark pl-urg pl-pynow" data-xp-urgent="1"><h3>' + esc(nowH()) + '</h3><p class="small">' + esc(t('plan_py_now')) + '</p><p class="small">' + esc(t('s1c')) + '</p>' + telRow(['112', '108', '102']) + '</div>';
  const pyStopCard = () => '<div class="card warn pl-pystop"><h3>' + esc(t('plan_stop_h')) + '</h3><p class="small">' + esc(t('plan_py_stop')) + '</p><p class="small"><strong>' + esc(nowH()) + '</strong></p><p class="small">' + esc(t('plan_py_now')) + '</p><p class="small">' + esc(t('s1c')) + '</p>' + telRow(['112']) + '</div>';
  const pyLockCard = (d) => { const w = pyWhy(d); const go = { plan: ['plan', 'plan_pk_preg'], v1: ['plan-settings', 'plan_set_h'] }[w] || ['plan-psafe', 'plan_ps_set'];
    return '<div class="card soft pl-pylock"><h3>' + esc(t('plan_py_h')) + '</h3><p class="small">' + esc(w === 'v1' ? tf('plan_py_lock_v1', { x: t('plan_set_goal'), y: t('plan_set_h') }) : t('plan_py_lock_' + w)) + '</p><button type="button" class="btn sm" data-go="' + go[0] + '">' + esc(t(go[1])) + '</button></div>'; };
  const pyUnwellHtml = () => (run.unwell === 'stopped'
    ? '<div class="card pl-intro pl-pyrest"><h2>' + esc(t('plan_py_rest_h')) + '</h2><p>' + esc(t('plan_py_rest_p')) + '</p></div>' + pyNowCard() + '<button type="button" class="btn primary block" data-go="plan">' + esc(t('plan_p_back')) + '</button>'
    : '<div class="card warn pl-pyunwell"><h2>' + esc(t('plan_py_unwell_h')) + '</h2><p>' + esc(t('plan_py_stop')) + '</p></div>' + pyNowCard() +
      '<div class="grid2"><button type="button" class="btn" id="pl-uw-ok">' + esc(t('plan_py_uw_ok')) + '</button><button type="button" class="btn primary" id="pl-uw-stop">' + esc(t('plan_py_uw_stop')) + '</button></div>');

  /* ---------- the player: intro, each move with its moving drawing and a timer, then "How did it feel?" ---------- */
  let run = null, tm = 0;
  /* the screen stays on while she follows a routine: the timer and the voice stop when the screen sleeps */
  let wl = null, wake = false;
  const awake = (yes) => {
    yes = !!yes; if (yes === wake) return; wake = yes;
    try { const B = window.SakhiAndroid; if (B && B.keepAwake) B.keepAwake(yes); } catch (e) { /* not on a phone */ }
    try {
      if (yes && navigator.wakeLock) navigator.wakeLock.request('screen').then((x) => { if (wake) wl = x; else x.release(); }).catch(() => {});
      else if (!yes && wl) { wl.release(); wl = null; }
    } catch (e) { /* no wake lock in this browser */ }
  };
  const stopRun = () => { clearInterval(tm); tm = 0; stopAnim(); if (S.stopSpeech) S.stopSpeech(); };
  if (S.onOwnerChange) S.onOwnerChange(() => { stopRun(); run = null; });
  const voiceDefault = () => { const d = raw(); if (d && d.voice != null) return !!d.voice; return !((S.state.settings || {}).discreet || (S.state.settings || {}).shared); };
  const RING = 339.3;
  const fmt = (sec) => { const s = Math.max(0, Math.ceil(sec)); return Math.floor(s / 60) + ':' + S.pad2(s % 60); };
  const buzz = () => { try { const B = window.SakhiAndroid; if (B && B.haptic) B.haptic(); } catch (e) { /* not on a phone */ } };
  /* Version 39.39: the 3D figure (web/fig, made by web/tools/fig3d; Mohit, 29 Oct: "build it into the player with the rest
     screen"). Each move plays its loop (the drawing's own two positions and timing), with a still for "reduce motion", the
     routine's list and the rest's Next; the sun salutation plays each flow once and holds. A build without web/fig, a video
     that can't play and SAKHI_CONFIG.fig === false all keep the drawings. */
  const FIG = () => { const f = window.SAKHI_FIG; return f && f.v === 1 && (window.SAKHI_CONFIG || {}).fig !== false ? f : null; };
  const figStill = (pose) => { const f = FIG(); return f && (f.stills || []).indexOf(pose) >= 0 ? 'fig/s/' + pose + '.webp' : ''; };
  const figKey = (s) => s.fig || s.pose;   /* Version 39.69: a step's own loop whenever web/fig has one, the held poses and breaths too */
  /* Version 39.54: pregnancy yoga's steps carry her body for those three months (fb: web/fig's b2- or b3- set, '' her usual
     figure), and fall back to the drawings, with her bump, where that body's file isn't there */
  const figName = (s, n) => (s.fb || '') + n;   /* a routine's card picture takes its ffig, the 3D position of the step its drawing (first) shows */
  const figLoop = (s) => { const f = FIG(); const k = figKey(s) && figName(s, figKey(s)); return f && k && (f.loops || []).indexOf(k) >= 0 ? 'fig/v/' + k + '.webm' : ''; };
  const figThumb = (s, mirror) => { const src = figStill(figName(s, s.fig || s.pose)); return src ? '<img class="pl-3d' + (mirror ? ' pl-mirror' : '') + '" src="' + src + '" alt="" loading="lazy">' : figSvg(s.pose, { mirror: mirror, bump: s.bump }); };
  function fig3d(s, prev) {
    const f = FIG(); if (!f) return '';
    const mir = s.sideK === 'l' ? ' pl-mirror' : ''; let still, clip = '', loop = true;
    if (s.sun && s.si != null && f.sun) {
      still = 'fig/s/sun-' + S.pad2(s.si) + '.webp';
      if (s.flow && prev && prev.pose !== s.pose && s.si >= 1 && s.si <= f.sun) { clip = 'fig/v/sun-' + S.pad2(s.si) + '.webm'; loop = false; }
      else if (s.si === 0 && f.sun0) clip = 'fig/v/sun-00.webm';   /* Version 39.69: her first position breathing, palms together */
    } else { still = figStill(figName(s, s.fig || s.pose)); clip = figLoop(s); }
    if (!still && !clip) return '';
    if (!clip || reduced()) return still ? '<img class="pl-3d' + mir + '" id="pl-fig3d" src="' + still + '" alt="">' : '';
    /* Version 39.69 (Mohit, 5 Nov: "i dont want any still picture all exercises model should be doing right moves"): a held pose
       comes in first, once (its -in clip, from standing or kneeling into the pose), then holds, breathing, on its loop */
    const kin = !s.sun && figKey(s) ? figName(s, figKey(s)) + '-in' : ''; const inClip = kin && (f.loops || []).indexOf(kin) >= 0 ? 'fig/v/' + kin + '.webm' : '';
    if (inClip) return '<video class="pl-3d' + mir + '" id="pl-fig3d" src="' + inClip + '" data-next="' + clip + '"' + (still ? ' data-still="' + still + '"' : '') + ' muted playsinline autoplay preload="auto"></video>';
    return '<video class="pl-3d' + mir + '" id="pl-fig3d" src="' + clip + '"' + (still ? ' poster="' + still + '" data-still="' + still + '"' : '') +
      ' muted playsinline autoplay preload="auto"' + (loop ? ' loop' : '') + '></video>';
  }
  /* a video that can't play (not found, can't decode, or the WebView wants a tap first) gives way to the move's still */
  function wireFig3d(v) {
    const vd = v.querySelector('video#pl-fig3d'); if (!vd) return;
    const toStill = () => {
      const src = vd.getAttribute('data-still'); if (!vd.isConnected) return;
      if (!src) { vd.removeAttribute('src'); return; }
      const im = document.createElement('img'); im.className = vd.className; im.id = 'pl-fig3d'; im.src = src; im.alt = ''; vd.replaceWith(im);
    };
    vd.addEventListener('error', toStill);
    const next = vd.getAttribute('data-next');   /* Version 39.69: into the pose, then the hold */
    if (next) vd.addEventListener('ended', () => { if (!vd.isConnected || !vd.getAttribute('data-next')) return; vd.removeAttribute('data-next'); vd.loop = true; vd.src = next; const st = vd.getAttribute('data-still'); if (st) vd.poster = st; const p = vd.play(); if (p && p.catch) p.catch(() => { /* the hold's first frame stays */ }); });
    try { vd.muted = true; const p = vd.play(); if (p && p.catch) p.catch((e) => { if (e && e.name === 'NotAllowedError') toStill(); }); } catch (e) { toStill(); }
  }
  /* Version 39.39, the rest screen (mockup claude.ai/artifact/4mTtM4VPZWwrHs5bb1r2Ka): a rest after each move and set, 15 seconds
     in Strength at home and 10 in Gentle start and Cycle care; none inside the sun salutation or Calm breath, between her right
     and left side, or before Shavasana (it is the rest). It counts in her minutes, as Shavasana does. "Next" on a move skips its rest. */
  const REST_S = { strength: 15, gentle: 10, cycle: 10, preg1: 10, preg2: 10, preg3: 10 };
  const restAfter = (i) => {
    const st = run.steps, a = st[i], b = st[i + 1];
    const rid = run.id === 'sun' && !st.some((s) => s.sun) ? 'gentle' : run.id;   /* Getting ready's sun salutation that became Gentle start */
    const sec = REST_S[rid] || 0;
    if (!sec || !a || !b || a.sun || b.sun || b.pose === 'rest' || b.pose === 'sidelie') return 0;   /* Version 39.52: nor before resting on her side */
    if (a.sideK === 'r' && b.sideK === 'l' && a.n === b.n && a.set === b.set) return 0;
    return sec;
  };
  function rest(sec) {
    const v = document.getElementById('view'); if (!v || !run) return;
    stopRun(); run.rest = { left: sec, total: sec }; run.paused = false; run.at = Date.now(); buzz(); draw(v); window.scrollTo(0, 0);
    if (run.voice && S.speakEl) { const el = v.querySelector('#pl-restsay'); if (el) setTimeout(() => { if (run && run.rest && !run.paused) S.speakEl(el); }, 150); }
  }
  function paintRest(v) {
    if (!run || !run.rest) return;
    const te = v.querySelector('#pl-rtime'); if (te) te.textContent = fmt(run.rest.left);
    const arc = v.querySelector('#pl-rarc'); if (arc) arc.setAttribute('stroke-dashoffset', (RING * (1 - run.rest.left / run.rest.total)).toFixed(1));
  }
  function renderPlayer(v, id) {
    if (!on()) { offScreen(v); return; }
    const d = S.canSave() && raw() ? D() : null;
    if (!R[id] || !routineOk(id, d)) { renderMoves(v); return; }
    if (!run || run.id !== id || run.i >= run.steps.length || Date.now() - run.at > 600000) { stopRun(); run = { id: id, steps: stepsOf(id, d), i: -1, left: 0, el: 0, total: 0, paused: false, voice: voiceDefault(), feel: null, logged: null, at: Date.now() }; }
    draw(v);
  }
  function draw(v) {
    const r = R[run.id]; const st = run.steps; const n = st.length; const hd = S.backRow(rName(run.id), 'plan-moves', false);
    let body;
    if (run.i < 0) {
      const uniq = []; st.forEach((s) => { if (!s.sun && !uniq.some((u) => u.n === s.n)) uniq.push(s); });
      body = '<p class="small">' + esc(t('plan_p_intro')) + '</p>' + (run.id === 'sun' ? '<div class="card warn"><p class="small">' + esc(t('plan_sun_care')) + '</p></div>' : '') +
        '<div class="list">' + (run.id === 'sun' ? [uniq[0]].concat(SUN.slice(0, 8).map((x) => ({ pose: x[0], n: x[1] }))) : uniq).map((s) => '<div class="item quiet pl-pitem"><span class="pl-thumb">' + figThumb(s) + '</span><span class="body"><strong>' + esc(tx(s.n)) + '</strong>' + (s.s ? '<span>' + esc(s.reps > 1 ? s.reps + ' × ' + fmt(s.s) : fmt(s.s)) + (s.side ? ' · ' + esc(t('plan_p_both')) : '') + '</span>' : '') + '</span></div>').join('') + '</div>' +
        (run.id === 'sun' ? '<p class="small">' + esc(tf('plan_p_rounds', { n: st.filter((s) => s.sun).length / SUN.length })) + '</p>' : '') +
        (S.speakEl ? '<div class="list"><label class="item"><span class="body"><strong>' + esc(t('plan_p_voice')) + '</strong><span>' + esc(t('plan_p_voice_d')) + '</span></span><input type="checkbox" id="pl-voice"' + (run.voice ? ' checked' : '') + '></label></div>' : '') +
        (PY.indexOf(run.id) >= 0 ? pyStopCard() : '') +   /* Version 39.52: in pregnancy, the stop signs before Start */
        '<button type="button" class="btn primary block" id="pl-pstart">' + esc(t('plan_p_start')) + ' · ' + esc(tf('plan_mins', { n: routineMins(run.id, raw()) })) + '</button>' +
        (PY.indexOf(run.id) >= 0 ? '' : '<div class="card warn"><p class="small">' + esc(t((S.state.situation || {}).stopped ? 'plan_stop_l_m' : 'plan_stop_l')) + '</p></div>');
      if (PY.indexOf(run.id) >= 0) body = '<p class="small">' + esc(t('plan_py_go')) + '</p>' + body;   /* Version 39.52 */
    } else if (run.unwell) {
      body = pyUnwellHtml();   /* Version 39.52: "Feeling unwell?" during pregnancy yoga */
    } else if (run.rest && run.i < n - 1) {
      /* Version 39.39: the rest between moves, with the next move's picture and its first words */
      const s = st[run.i], nx = st[run.i + 1];
      const tags = [tf('plan_p_step', { i: run.i + 1, n: n })]; if (s.sideK) tags.push(t(s.sideK === 'r' ? 'plan_p_right' : 'plan_p_left')); if (s.sets > 1) tags.push(tf('plan_p_set', { i: s.set, n: s.sets }));
      const more = []; if (nx.sideK) more.push(t(nx.sideK === 'r' ? 'plan_p_right' : 'plan_p_left')); if (nx.sets > 1) more.push(tf('plan_p_set', { i: nx.set, n: nx.sets }));
      body = '<div class="pl-pbar" aria-hidden="true"><i style="width:' + Math.round(((run.i + 1) / n) * 100) + '%"></i></div>' +
        '<div class="card pl-rest" id="pl-rest"><span class="eyebrow">' + esc(tf('plan_p_done_t', { x: tags.join(' · ') })) + '</span><h2>' + esc(t('plan_p_rest')) + '</h2>' +
        '<div class="pl-timer pl-rtimer" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="54"/><circle class="arc" id="pl-rarc" cx="60" cy="60" r="54" stroke-dasharray="' + RING + '" stroke-dashoffset="0"/></svg><b id="pl-rtime"></b></div>' +
        '<p class="pl-sr" id="pl-restsay">' + esc(tf('plan_p_rest_say', { n: [tx(nx.n)].concat(more).join(', ') })) + '</p>' +
        '<div class="grid2"><button type="button" class="btn" id="pl-more">' + esc(t('plan_p_more')) + '</button><button type="button" class="btn" id="pl-pause">' + esc(t(run.paused ? 'plan_p_resume' : 'plan_p_pause')) + '</button></div>' +
        '<button type="button" class="btn primary block" id="pl-skip">' + esc(t('plan_p_skiprest')) + '</button></div>' +
        '<div class="card pl-nextcard" id="pl-nextcard"><span class="pl-thumb">' + figThumb(nx, nx.sideK === 'l') + '</span><span class="body"><span class="eyebrow">' + esc([t('plan_p_up')].concat(more).join(' · ')) + '</span><strong>' + esc(tx(nx.n)) + '</strong><span class="small">' + esc(fmt(nx.s)) + '</span><span>' + esc(tx(nx.p)) + '</span></span></div>';
    } else if (run.i < n) {
      const s = st[run.i];
      const tags = [tf('plan_p_step', { i: run.i + 1, n: n })]; if (s.sun) tags.push(tf('plan_p_round', { i: s.round, n: s.rounds })); if (s.sideK) tags.push(t(s.sideK === 'r' ? 'plan_p_right' : 'plan_p_left')); if (s.sets > 1) tags.push(tf('plan_p_set', { i: s.set, n: s.sets }));
      const f3 = fig3d(s, run.i > 0 ? st[run.i - 1] : null);
      body = '<div class="pl-pbar" aria-hidden="true"><i style="width:' + Math.round((run.i / n) * 100) + '%"></i></div>' +
        '<div class="card pl-stage" id="pl-step"><div class="pl-figbox hue-' + r.hue + (f3 ? ' pl-fb3d' : '') + '">' + (f3 || figSvg(s.pose, { id: 'pl-fig', mirror: s.sideK === 'l', bump: s.bump })) + (PY.indexOf(run.id) >= 0 ? '<button type="button" class="pl-unwell-b" id="pl-unwell" data-noread="1">' + esc(t('plan_py_unwell')) + '</button>' : '') + '</div><span class="eyebrow">' + esc(tags.join(' · ')) + '</span><h2>' + esc(tx(s.n)) + '</h2><p>' + esc(tx(s.p)) + '</p></div>' +
        (s.breath ? '<div class="pl-breath-wrap" aria-hidden="true"><div class="pl-breath" id="pl-breath"></div><b id="pl-phase"></b></div>'
          : '<div class="pl-timer" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="54"/><circle class="arc" id="pl-arc" cx="60" cy="60" r="54" stroke-dasharray="' + RING + '" stroke-dashoffset="0"/></svg><b id="pl-time"></b></div>') +
        '<p class="small pl-left" id="pl-left" aria-live="off"></p>' +
        (run.i > 0 ? '<div class="grid3 pl-ctl"><button type="button" class="btn" id="pl-prev">' + esc(t('plan_p_prev')) + '</button>' : '<div class="grid2 pl-ctl">') +   /* Version 39.39: Previous */
        '<button type="button" class="btn" id="pl-pause">' + esc(t(run.paused ? 'plan_p_resume' : 'plan_p_pause')) + '</button><button type="button" class="btn primary" id="pl-next">' + esc(t(run.i === n - 1 ? 'plan_p_finish' : 'plan_p_next')) + '</button></div>';
    } else {
      body = '<div class="card pl-intro">' + (S.art ? S.art.sakhi({ pose: 'cheer', look: (S.state.settings || {}).look }) : '') + '<h2>' + esc(t('plan_p_done_h')) + '</h2><p>' + esc(run.logged > 1 ? tf('plan_p_done_m', { n: run.logged }) : run.logged === 1 ? t('plan_p_done_m1') : t(S.canSave() ? 'plan_p_done_0' : 'plan_p_done_b')) + '</p></div>' +
        (S.canSave() && raw() ? (run.feel ? '<div class="card ok"><p>' + esc(t(run.feel === 'hard' ? (PY.indexOf(run.id) >= 0 ? 'plan_py_hard' : 'plan_feel_hard_tip') : 'plan_feel_thanks')) + '</p></div>'
          : '<h2>' + esc(t('plan_p_feel')) + '</h2><div class="grid3">' + ['easy', 'ok', 'hard'].map((k) => '<button type="button" class="btn" data-pl-feel="' + k + '">' + esc(t('plan_feel_' + k)) + '</button>').join('') + '</div>') : '') +
        '<div class="grid2"><button type="button" class="btn" id="pl-again2">' + esc(t('plan_p_again')) + '</button><button type="button" class="btn" data-go="' + (S.canSave() && raw() && raw().start ? 'plan' : 'plan-moves') + '">' + esc(t(S.canSave() && raw() && raw().start ? 'plan_p_back' : 'plan_tiles_moves')) + '</button></div>';
    }
    v.innerHTML = hd + '<div class="pl-player">' + body + '</div>';
    S.wire(v); wirePlayer(v);
  }
  /* the minutes she actually spent go into today (a minute or more); strength counts once she finishes the routine */
  function logRoutine() {
    const m = Math.round(run.total / 60); run.logged = 0;
    if (!S.canSave() || !raw()) return;
    const d = D(); const td = todayISO(); const x = d.log[td] = d.log[td] || {};
    const cr = m >= 1 ? ((x.tkr || {})[run.id] || 0) : 0; if (cr) { x.min = S.clamp((x.min || 0) - cr, 0, 600); x.rmin = S.clamp((x.rmin || 0) - cr, 0, 600); x.tkr = Object.assign({}, x.tkr); delete x.tkr[run.id]; }   /* Version 39.41: her Done's minutes give way to the ones she played */
    if (m >= 1) { x.min = S.clamp((x.min || 0) + m, 0, 600); x.rmin = S.clamp((x.rmin || 0) + m, 0, 600); run.logged = m; }   /* Version 39.13: rmin, the routine's own minutes */
    x.r = (x.r || []).concat([run.id]).slice(-6); if (run.id === 'strength') x.str = true;
    prune(d); remSync(d); S.save();
  }
  function wirePlayer(v) {
    const uw = v.querySelector('#pl-unwell'); if (uw) uw.addEventListener('click', () => { stopRun(); run.paused = true; run.unwell = 'ask'; awake(false); draw(v); window.scrollTo(0, 0); });   /* Version 39.52 */
    const uo = v.querySelector('#pl-uw-ok'); if (uo) uo.addEventListener('click', () => { run.unwell = null; draw(v); });
    const us = v.querySelector('#pl-uw-stop'); if (us) us.addEventListener('click', () => { const m = Math.round(run.total / 60);
      if (S.canSave() && raw()) { const dd = D(); if (m >= 1) addMin(dd, m); dd.intake = Object.assign({}, ikOf(dd), { pnow: todayISO() }); S.save(); }   /* her moves wait until she checks her answers again */
      run.unwell = 'stopped'; draw(v); });
    const vs = v.querySelector('#pl-voice'); if (vs) vs.addEventListener('change', () => { run.voice = vs.checked; if (S.canSave() && raw()) { D().voice = run.voice; S.saveQuiet(); } });
    const st = v.querySelector('#pl-pstart'); if (st) st.addEventListener('click', () => go(0));
    const ps = v.querySelector('#pl-pause'); if (ps) ps.addEventListener('click', () => {
      run.paused = !run.paused; if (run.paused && S.stopSpeech) S.stopSpeech(); awake(!run.paused); ps.textContent = t(run.paused ? 'plan_p_resume' : 'plan_p_pause');
      const vd = v.querySelector('video#pl-fig3d'); if (vd) { try { if (run.paused) vd.pause(); else { const p = vd.play(); if (p && p.catch) p.catch(() => {}); } } catch (e) { /* no video */ } }
    });
    const nx = v.querySelector('#pl-next'); if (nx) nx.addEventListener('click', () => go(run.i + 1));
    const pv = v.querySelector('#pl-prev'); if (pv) pv.addEventListener('click', () => go(Math.max(0, run.i - 1)));
    const mo = v.querySelector('#pl-more'); if (mo) mo.addEventListener('click', () => { if (!run.rest) return; run.rest.left += 20; run.rest.total = Math.max(run.rest.total, run.rest.left); paintRest(v); });
    const sk = v.querySelector('#pl-skip'); if (sk) sk.addEventListener('click', () => go(run.i + 1));
    const ag = v.querySelector('#pl-again2'); if (ag) ag.addEventListener('click', () => { run.feel = null; run.logged = null; run.total = 0; go(0); });
    v.querySelectorAll('[data-pl-feel]').forEach((b) => b.addEventListener('click', () => { run.feel = b.dataset.plFeel; const d = D(); d.feel = (d.feel || []).concat([{ d: todayISO(), r: run.id, f: run.feel }]).slice(-60); S.saveQuiet(); draw(v); }));
    if (run.unwell) return;   /* Version 39.52: "Feeling unwell?" has no timer */
    if (run.rest && run.i < run.steps.length - 1) { paintRest(v); tick(v); if (!run.paused) awake(true); }
    else if (run.i >= 0 && run.i < run.steps.length) {
      const s = run.steps[run.i]; const fig = v.querySelector('#pl-fig'); const prev = run.i > 0 ? run.steps[run.i - 1] : null;
      if (fig) {
        if (s.sun && s.flow && prev && prev.pose !== s.pose) animate(fig, prev.pose, s.pose, 0.9, false, true);
        else if (!s.sun && ANIM[s.pose]) animate(fig, ANIM[s.pose][0], ANIM[s.pose][1], ANIM[s.pose][2], ANIM[s.pose][3], false);
      }
      wireFig3d(v); paint(v); tick(v); if (!run.paused) awake(true);
    }
  }
  function go(i) {
    const v = document.getElementById('view'); if (!v || !run) return; const n = run.steps.length;
    stopRun(); if (i >= n) awake(false); run.i = i; run.rest = null; run.paused = false; run.at = Date.now();
    if (i < n) { run.left = run.steps[i].s; run.el = 0; }
    if (i >= n && run.logged == null) logRoutine();
    if (i > 0) buzz(); draw(v); window.scrollTo(0, 0);
    if (i < n && run.voice && S.speakEl) { const el = v.querySelector('#pl-step'); if (el) setTimeout(() => { if (run && run.i === i && !run.paused) S.speakEl(el); }, 150); }
  }
  function tick(v) {
    clearInterval(tm);
    tm = setInterval(() => {
      if (!run || run.paused || !(document.getElementById('pl-step') || document.getElementById('pl-rest'))) return;
      run.total += 0.25; run.at = Date.now();
      if (run.rest) { run.rest.left -= 0.25; paintRest(v); if (run.rest.left <= 0) go(run.i + 1); return; }   /* Version 39.39 */
      run.left -= 0.25; run.el += 0.25; paint(v);
      if (run.left <= 0) { const r = restAfter(run.i); if (r) rest(r); else go(run.i + 1); }
    }, 250);
  }
  function paint(v) {
    const s = run.steps[run.i]; if (!s) return;
    const te = v.querySelector('#pl-time'); if (te) te.textContent = fmt(run.left);
    const arc = v.querySelector('#pl-arc'); if (arc) arc.setAttribute('stroke-dashoffset', (RING * (1 - run.left / s.s)).toFixed(1));
    const lf = v.querySelector('#pl-left'); if (lf) lf.textContent = tf('plan_p_left_t', { t: fmt(run.left) });
    const br = s.breath; const c = v.querySelector('#pl-breath'); const ph = v.querySelector('#pl-phase');
    if (br && c && ph) {
      const cyc = br[0] + br[1] + br[2] + br[3]; const p = run.el % cyc; let lab, sc;
      if (p < br[0]) { lab = 'plan_p_in'; sc = 0.62 + 0.38 * (p / br[0]); } else if (p < br[0] + br[1]) { lab = 'plan_p_in'; sc = 1; } else if (p < br[0] + br[1] + br[2]) { lab = 'plan_p_out'; sc = 1 - 0.38 * ((p - br[0] - br[1]) / br[2]); } else { lab = 'plan_p_out'; sc = 0.62; }
      c.style.transform = 'scale(' + sc.toFixed(3) + ')'; const txt = t(lab); if (ph.textContent !== txt) ph.textContent = txt;
    }
  }

  /* ---------- My progress: from what she logged, before and since she started ---------- */
  const PM_SIGNS = ['hair', 'removal', 'acne', 'thin', 'neck'];
  /* Version 37.2 (ux-gaps E7): a gap that ended during her plan counts as "since", even if it began before; a guessed start
     counts as "about"; with no gap before, her own joining answer ("You said: 36 to 45 days") */
  function cycleCompare(d) {
    const st = d.start; const gaps = (S.cycle.gapsAll() || []).filter((g) => g.usable || (g.guess && g.days >= 10 && g.days <= 400));
    const before = gaps.filter((g) => g.usable && g.to <= st).slice(-3).map((g) => g.days); const since = gaps.filter((g) => g.to > st).map((g) => ({ days: g.days, guess: !!g.guess }));
    return { before: before, since: since, said: before.length ? null : (ikOf(d).gap || null) };
  }
  const sinceTxt = (c) => c.since.map((x) => (x.guess ? tf('plan_about_n', { n: x.days }) : String(x.days))).join(', ');
  const beforeTxt = (c) => (c.before.length ? c.before.join(', ') : (c.said ? tf('plan_prog_said', { g: t('plan_gap_' + c.said) }) : '–'));
  /* one period is its start, as Days counts it (two starts logged within 10 days are one period), and the details added in the
     week after its last logged start; a guessed start isn't counted */
  function periodsOf() {
    const ev = S.state.events || []; const ex = ev.filter((e) => e.t === 'start' && !e.approx).map((e) => e.d).sort();
    const ms = ((S.cycle && S.cycle.starts ? S.cycle.starts() : ex) || []).filter((x) => ex.indexOf(x) >= 0);
    return ms.map((d0, i) => { const lim = S.toISO(S.addDays(S.fromISO(d0), 9)); const last = ex.filter((x) => x >= d0 && x <= lim).slice(-1)[0] || d0;
      let d1 = S.toISO(S.addDays(S.fromISO(last), 7)); const nx = ms[i + 1]; if (nx && d1 >= nx) d1 = S.toISO(S.addDays(S.fromISO(nx), -1)); return { d0: d0, d1: d1 }; });
  }
  const FLOW_T = ['start', 'start_detail', 'end'];   /* Version 39.1: details from any day of her period, and its end */
  const perHas = (p, f) => (S.state.events || []).some((e) => FLOW_T.indexOf(e.t) >= 0 && e.d >= p.d0 && e.d <= p.d1 && f(e));
  function painCompare(d) {
    const st = d.start; const ev = S.state.events || []; const per = {};
    periodsOf().forEach((p) => { const ps = ev.filter((e) => FLOW_T.indexOf(e.t) >= 0 && e.d >= p.d0 && e.d <= p.d1 && e.pain).map((e) => e.pain); if (ps.length) per[p.d0] = ps.indexOf('pain_3') >= 0 ? 'pain_3' : (ps.indexOf('pain_2') >= 0 ? 'pain_2' : ps[0]); });
    const keys = Object.keys(per).sort(); const pk = (k) => per[k] === 'pain_2' || per[k] === 'pain_3';
    const b = keys.filter((k) => k < st).slice(-3), s = keys.filter((k) => k >= st);
    return { b: b.length, bp: b.filter(pk).length, s: s.length, sp: s.filter(pk).length };
  }
  function signsCompare(d) {
    const ks = Object.keys(S.state.checkins || {}).sort(); const atOf = (k) => (S.state.checkins[k] || {}).at || (k + '-01');   /* by the day she made it */
    const cnt = (k) => ((S.state.checkins[k] || {}).chips || []).filter((c) => PM_SIGNS.indexOf(c) >= 0).length;
    const b = ks.filter((k) => atOf(k) < d.start).slice(-1)[0], s = ks.filter((k) => atOf(k) >= d.start).slice(-1)[0];
    return { b: b == null ? null : cnt(b), s: s == null ? null : cnt(s) };
  }
  function minutesChart(d) {
    const wk = Math.max(1, Math.min(weekNo(d), d.keep ? weekNo(d) : N)); const from = Math.max(1, wk - 11); const ws = []; for (let k = from; k <= wk; k++) ws.push(k); const fut = []; for (let k = wk + 1; k <= from + 11 && k <= N; k++) fut.push(k);
    const vals = ws.map((k) => weekMin(d, k)); const tgs = ws.map((k) => target(d, k)); const max = Math.max(150, Math.max.apply(null, vals), Math.max.apply(null, tgs)) * 1.1;
    const bw = 280 / 12; const y = (val) => 70 - (val / max) * 62;
    return '<svg class="pl-chart" viewBox="0 0 300 92" role="img" aria-label="' + esc(vals.map((x, i) => tf('plan_wk', { n: ws[i] }) + ': ' + x).join(', ')) + '">' +
      '<line x1="10" y1="70" x2="290" y2="70" class="gd"/>' +
      fut.map((k, j) => { const x0 = 12 + (ws.length + j) * bw; return '<rect x="' + (x0 + 3).toFixed(1) + '" y="58" width="' + (bw - 6).toFixed(1) + '" height="12" rx="3" class="fut"/><text x="' + (x0 + bw / 2).toFixed(1) + '" y="84" text-anchor="middle">' + k + '</text>'; }).join('') +
      ws.map((k, i) => { const x0 = 12 + i * bw; return '<rect x="' + (x0 + 3).toFixed(1) + '" y="' + y(vals[i]).toFixed(1) + '" width="' + (bw - 6).toFixed(1) + '" height="' + (70 - y(vals[i])).toFixed(1) + '" rx="3" class="bar' + (vals[i] >= tgs[i] ? ' met' : '') + '"/><line x1="' + (x0 + 1).toFixed(1) + '" x2="' + (x0 + bw - 1).toFixed(1) + '" y1="' + y(tgs[i]).toFixed(1) + '" y2="' + y(tgs[i]).toFixed(1) + '" class="tg"/><text x="' + (x0 + bw / 2).toFixed(1) + '" y="84" text-anchor="middle">' + k + '</text>'; }).join('') + '</svg>';
  }
  const cmp = (a, b, k1, k2) => '<div class="pl-cmp"><div><span class="small">' + esc(t(k1 || 'plan_prog_before')) + '</span><strong>' + a + '</strong></div><div class="now"><span class="small">' + esc(t(k2 || 'plan_prog_since')) + '</span><strong>' + b + '</strong></div></div>';
  function progressCore(d) {
    const wk = Math.max(1, Math.min(weekNo(d), N)); const out = [];
    out.push('<div class="card"><div class="row spread"><h3>' + esc(t('plan_prog_min')) + '</h3><span class="small pl-legend"><i class="tg"></i>' + esc(t('plan_prog_target')) + '</span></div>' + minutesChart(d) + '</div>');
    const kept = d.keep && weekNo(d) > N;
    const str = Array.from({ length: Math.min(wk, N) }, (x, i) => weekStr(d, i + 1));
    out.push('<div class="grid2 pl-mini"><div class="card"><span class="eyebrow">' + esc(t('plan_prog_str')) + '</span><strong class="pl-big">' + (kept ? weekStr(d, weekNo(d)) : str[str.length - 1]) + ' / ' + strTarget(d, wk) + '</strong><span class="small">' + esc(kept ? t('plan_wk_keep') : tf('plan_wk', { n: wk })) + '</span></div><div class="card"><span class="eyebrow">' + esc(t('plan_prog_food')) + '</span><strong class="pl-big">' + habitDays(d, 7) + ' / 7</strong></div></div>');
    const sit = S.state.situation || {};
    if (!sit.stopped && !sit.hysterectomy) {
      const c = cycleCompare(d);
      if (!disc()) out.push('<div class="card"><h3>' + esc(t('plan_prog_cyc')) + '</h3>' + (!c.before.length && !c.since.length && !c.said ? '<p class="small">' + esc(t('plan_prog_cyc_none')) + '</p>' :
        cmp(esc(beforeTxt(c)), c.since.length ? esc(sinceTxt(c)) : '…') + (c.since.length ? '' : '<p class="small">' + esc(t('plan_prog_cyc_wait')) + '</p>')) + '<p class="small">' + esc(t('plan_rv_cyc')) + '</p></div>');
      const p = painCompare(d);
      if ((p.b || p.s) && !disc()) out.push('<div class="card"><h3>' + esc(t('plan_prog_pain')) + '</h3>' + cmp(p.b ? esc(tf('plan_prog_pain_n', { a: p.bp, n: p.b })) : '–', p.s ? esc(tf('plan_prog_pain_n', { a: p.sp, n: p.s })) : '–') + '</div>');
    }
    const sg = signsCompare(d);
    if ((sg.b != null || sg.s != null) && !disc()) out.push('<div class="card"><h3>' + esc(t('plan_prog_signs')) + '</h3>' + cmp(sg.b == null ? '–' : esc(tf('plan_prog_signs_n', { n: sg.b })), sg.s == null ? '–' : esc(tf('plan_prog_signs_n', { n: sg.s }))) + '</div>');
    const en = Object.keys(d.weeks || {}).map(Number).filter((k) => d.weeks[k] && d.weeks[k].e).sort((a, b) => a - b);
    if (en.length) out.push('<div class="card"><h3>' + esc(t('plan_prog_energy')) + '</h3><div class="pl-energy">' + en.map((k) => '<span class="pl-en ' + d.weeks[k].e + '">' + face(d.weeks[k].e) + '<b>' + esc(t('plan_e_' + d.weeks[k].e)) + '</b><span class="small">' + esc(tf('plan_wk_s', { n: k })) + '</span></span>').join('') + '</div></div>');
    const bw = (d.body || []).filter((x) => x.w); const bc = (d.body || []).filter((x) => x.waist);
    if (!disc() && (bw.length >= 2 || bc.length >= 2)) out.push('<div class="card"><h3>' + esc(t('plan_prog_body')) + '</h3>' + (bw.length >= 2 ? '<span class="eyebrow">' + esc(t('plan_weight')) + '</span>' + cmp(esc(num1(bw[0].w)), esc(num1(bw[bw.length - 1].w)), 'plan_prog_first', 'plan_prog_last') : '') + (bc.length >= 2 ? '<span class="eyebrow">' + esc(t('plan_waist_l')) + ' (' + esc(t('plan_cm')) + ')</span>' + cmp(esc(num1(bc[0].waist)), esc(num1(bc[bc.length - 1].waist)), 'plan_prog_first', 'plan_prog_last') : '') + '</div>');
    const cc = checksCard(d); if (cc) out.push(cc);   /* Version 39.12 */
    return out.join('');
  }
  function expectCard(d) {
    const wk = weekNo(d); const now = wk <= 4 ? 0 : (wk <= 12 ? 1 : 2);
    return '<div class="card"><h3>' + esc(t('plan_prog_expect')) + '</h3><ol class="pl-tl">' + [1, 2, 3].map((k, i) => '<li class="' + (i === now ? 'now' : (i < now ? 'past' : '')) + '"><strong>' + esc(t('plan_ex_' + k)) + '</strong>' + (i === now ? ' <span class="pill accent">' + esc(t('plan_ex_now')) + '</span>' : '') + '<span class="small">' + esc(t('plan_ex_' + k + '_p')) + '</span></li>').join('') + '</ol></div>';
  }
  /* the supplements question is the PMOS plan's (its topic says so), and it names medicines: not on a shared phone */
  /* Version 39.0: the supplements card is gone (it named medicines and sent her to a call); her doctor decides those */
  function renderProgress(v) {
    if (!on()) { offScreen(v); return; }
    const hd = head('plan_prog_h');
    if (!S.canSave() || !packOf(raw())) { v.innerHTML = hd + (S.canSave() ? pastCard(raw()) + '<div class="card soft"><p>' + esc(t('plan_prog_none')) + '</p><button type="button" class="btn sm primary" data-go="plan">' + esc(t('plan_start')) + '</button></div>' : S.needDiary()); S.wire(v); return; }
    const d = D();   /* Version 39.5: every plan's results live here; My plan's tile opens them */
    v.innerHTML = hd + '<p class="small">' + esc(t(packOf(d) === 'ttc' ? 'plan_prog_p0' : 'plan_prog_p')) + '</p>' +   /* Version 39.33: Getting ready compares nothing with before */ (docTold(d) && !disc() ? '<p class="small pl-told">' + esc(docTold(d)) + '</p>' : '') + (packOf(d) === 'cycle' ? progressCore(d) + (disc() ? '' : expectCard(d)) : lightResults(fullD(d))) + pastCard(d) + '<p class="footnote">' + esc(t('plan_prog_foot')) + '</p>';   /* Version 39.6 */
    S.wire(v);
  }

  /* ---------- Home's Today: today's minutes and today's food habit, one tap each ---------- */
  function today() {
    if (!on() || !S.canSave()) return null; pauseSync(); const d = raw(); if (d && d.fast && S.mem.fastPruned !== todayISO()) { S.mem.fastPruned = todayISO(); if (pruneFast(d)) S.saveQuiet(); }   /* V39.9 review FOOD-08 */ if (!packOf(d) || finished(fullD(d)) || pausedFor(d) || selfPaused(d)) return null;
    /* Version 39.14 (audit R1): Today is her day's checklist. Every step stays, a done one ticked and soft (a tap on its tick
       undoes it); the whole row is the tap target; a link or a check opens its tool and shows done once done there. A rest day
       keeps only a safety step still to do (Version 39.5 review SAFETY-01: the recovery check, the 6-week check, Due now). */
    const dd = fullD(d); const lg = dayLog(d, todayISO()); const rest = !!lg.rest;
    const ids = { move: 'plan-move', food: 'plan-plate', yoga: 'plan-yoga' };
    /* Version 39.12 (plan audit gap 1): a yoga or strength step has Start, which opens the routine */
    const startOf = (a) => (a.kind === 'routine' || (a.kind === 'minutes' && !!a.r)) && /^plan-r-/.test(a.go || '');
    const acts = actionsFor(dd).filter((a) => !rest || (SAFE.indexOf(a.id) >= 0 && a.state !== 'd')); const left = acts.filter((a) => a.state !== 'd');
    const full = !rest && acts.length > 0 && !left.length; const nx = ciDone(dd) ? null : (left.find((a) => a.state !== 'p') || null); const ciNow = ciDueNow(dd, acts);   /* Version 39.33 (walkthrough, 28 Oct): "Next" is the first step she hasn't touched, and none after her check-in */
    return acts.map((a, i) => { const sb = startOf(a); const ok = a.state === 'd'; const tick = TICK.indexOf(a.kind) >= 0;
      const rt = a.kind === 'routine' && a.r && !disc();   /* a routine: its name, and its minutes in the line under it (so the row stays one line at 360 px) */
      /* Version 39.41 (Mohit's three-plan walk): with Start, its minutes go on the button (\u25b6 8 min, as the wind-down step's), so the line keeps when and "Why?" */
      const rtMin = rt ? tf('plan_min_n', { n: routineMins(a.r, dd) }) : ''; const rtBtn = rt && sb && !ok;
      const nm = disc() && (a.priv || a.kind === 'minutes') ? discNm(a, acts) : (rt ? rName(a.r) : (a.kind === 'minutes' && !a.r && !a.walk ? tf('plan_today_move', { n: a.mins }) : (a.titleT || a.title)));   /* Version 39.22: Today keeps the short bedtime name; tonight's session is its line */
      const sub0 = disc() && a.priv ? '' : (rt ? (YOGA_R.indexOf(a.r) >= 0 ? t('plan_yoga_when') + (rtBtn ? '' : ' · ') : '') + (rtBtn ? '' : rtMin) :   /* Version 39.22: when first, so a cut line keeps it */ (a.id === 'fast' && !fastCare() ? '' : (a.subT || a.sub)));   /* V39.9 review SAFETY-03: on Today the fasting step keeps only its doctor line */
      return { id: ids[a.id] || 'plan-' + a.id, order: 25 + i, plan: true, icon: a.icon, hue: a.hue, title: nm,
        sub: ok ? (disc() ? t('plan_t_done') : ciNote(a, lg)) : (a.state === 'p' ? (sub0 && a.subP ? a.subP : t('plan_t_part')) : (a === nx && !ciNow && !sb && !a.play ? (sub0 ? tf('plan_t_next_s', { s: lowFirst(sub0) }) : t('plan_t_next')) : sub0)),
        go: tick ? null : a.go, at: a.at || null, tick: tick, ok: ok, next: a === nx, fold: full,
        nav: !ok && sb ? a.go : (!ok && a.play && !rest ? a.play : null), actLabel: sb ? (rtBtn ? rtMin : t('plan_start_b')) : (a.play ? tf('calm_min', { n: a.playMin }) : null), night: !!a.play && !a.playDay, primary: !ok && sb && a === nx && !ciNow,   /* R1, R14: one pink button, the next step's Start or the evening check-in */
        act: tick && !ok ? () => { const d2 = D(); markAction(d2, a, 'd'); closeDay(d2); remSync(d2); } : null,
        undo: tick && ok ? () => { const d2 = D(); unmark(d2, a); remSync(d2); } : null,
        why: a.why && !disc() ? () => openWhy(a) : null,
        done: left.length === 1 && a === left[0] ? t('plan_t_full') : t('plan_well') }; });
  }
  /* Version 39.5 review: steps that carry danger signs or due check-ups; nothing optional (a rest day, a check-in, the pause
     offer) takes them off Today, and pregnancy and the first 6 weeks after a birth get no rest offer or pause */
  const SAFE = ['rcheck', 'six', 'pdue'];
  const careTime = (d) => { const pk = packOf(d) || (d && d.pack); return pk === 'preg' || (pk === 'post' && earlyPost()); };   /* Version 38: a routine or a link opens its page; a check is done only by doing it */
  /* "Set up Sakhi for you": a woman with PMOS who hasn't started gets "Start your PMOS plan" */
  function setup() {
    if (!on() || !S.canSave() || pauseWhy() || stageNowKey() === 'ttc') return null; const sit = S.state.situation || {};   /* Version 39.32: not while she tries for a baby */
    if (!sit.pcos && (S.state.goals || []).indexOf('pmos') < 0) return null; const d = raw();
    return { id: 'plan', order: 45, title: t('plan_setup'), sub: t('plan_setup_s'), go: 'plan-pmos', done: !!(d && d.start) };
  }
  /* the doctor summary (and, when she ticks it, Ask Qura to call me): where she is, minutes, strength, food, and her body notes */
  function summary() {
    const out = summaryNow(); const d = raw(); const p = on() && S.canSave() && d ? lastPast(d) : null;   /* Version 39.51: not a plan changed the day it started */
    if (!p || !p.start) return out;
    const f = (x) => S.fmtD(S.fromISO(x), { day: 'numeric', month: 'short', year: 'numeric' });
    const line = tf(p.days === 1 ? 'plan_sum_past1' : 'plan_sum_past', { t: packTitle({ pack: p.pack, goalKey: p.goalKey, pv: p.pv }), a: f(p.start), b: f(p.end), n: p.days });
    if (out.length) { out[0].lines.push(line); return out; }
    return [{ title: t('plan_past_h'), lines: [line] }];
  }
  /* Version 39.6 (journey audit P2-03): her report carries what she said at the start, her result and her doctor check */
  function sumMore(dd, lines) { if (disc()) return; const nl = nowLine(dd); if (nl) lines.push(tf('plan_sum_now', { x: nl })); if (pfLead(dd)) pfSum(dd, lines);   /* Version 39.56 */ const mc = mcSum(dd); if (mc) lines.push(mc); const r = resultText(dd); if (r) lines.push(r); const dt = docTold(dd); if (dt) lines.push(dt); else if (docCase(dd) && dd.doc !== 'done') lines.push(t('plan_sum_doc_no')); }
  function summaryNow() {
    if (!on() || !S.canSave()) return []; const d = raw(); const pk = packOf(d); if (!pk) return [];
    const dd = fullD(d); const wk = wkNow(dd); const kept = !!(dd.keep && weekNo(dd) > N);
    const cur = planWeeks(dd) && !dd.keep ? Math.min(weekNo(dd), N + 1) : (dd.keep && keepUntil(dd) ? Math.min(weekNo(dd), keepUntil(dd) + 1) : weekNo(dd));   /* the weeks before this one; after week 12, up to week 12; a kept plan, up to its year */
    const done = Math.max(0, Math.min(4, cur - 1)); const since = S.fmtD(S.fromISO(dd.start), { day: 'numeric', month: 'short', year: 'numeric' });
    const lines = [ownWeek(dd) ? tf('plan_sum_own', { w: ownWeek(dd), d: since }) : (planWeeks(dd) && !kept ? tf('plan_sum_wk', { n: Math.min(wk, N), d: since }) : tf('plan_sum_wkn', { n: kept && keepUntil(dd) ? Math.min(weekNo(dd), keepUntil(dd)) : weekNo(dd), d: since }))];
    if (pk !== 'cycle') {
      if (done) { let a = 0; for (let k = cur - done; k < cur; k++) a += weekDays(dd, k); lines.push(tf('plan_sum_days', { a: num1(a / done) })); }
      lines.push(tf('plan_sum_goal', { g: goalName(dd.goalKey) }));
      sumMore(dd, lines); return [{ title: packTitle(dd), lines: lines }];
    }
    if (done) { let a = 0, s = 0; for (let k = cur - done; k < cur; k++) { a += weekMin(dd, k); s += weekStr(dd, k); } lines.push(tf('plan_sum_min', { a: Math.round(a / done), k: done, t: target(dd, wk) })); lines.push(tf('plan_sum_str', { a: num1(s / done) })); }
    lines.push(tf('plan_sum_food', { a: habitDays(dd, 7) }));
    const bw = dd.body.filter((x) => x.w), bc = dd.body.filter((x) => x.waist); const bits = [];
    if (bw.length) bits.push(bw.length > 1 ? tf('plan_sum_w', { a: num1(bw[0].w), b: num1(bw[bw.length - 1].w) }) : tf('plan_sum_w1', { a: num1(bw[0].w) }));
    if (bc.length) bits.push(bc.length > 1 ? tf('plan_sum_c', { a: num1(bc[0].waist), b: num1(bc[bc.length - 1].waist) }) : tf('plan_sum_c1', { a: num1(bc[0].waist) }));
    const b = bmiNow(dd); if (b != null) bits.push(tf('plan_sum_b', { b: num1(b) }));
    if (bits.length) lines.push(bits.join(', '));
    sumMore(dd, lines); return [{ title: packTitle(dd), lines: lines }];   /* Version 39.2: titled by her plan, not "PMOS plan" for everyone */
  }
  /* Priya (diagnosed PMOS) is three and a half weeks into her plan */
  function sample(id) {
    if (id !== 'priya') return; const d = S.data('plan'); const start = S.addDays(pToday(), -24);
    Object.assign(d, { start: S.toISO(start), goal: 'cycles', level: 0, limits: { knees: false, back: false }, food: 'egg', region: 'north', focus: 'habits', log: {}, weeks: { 1: { e: 'low', b: 'time', seen: true, d: S.toISO(S.addDays(start, 7)) }, 2: { e: 'ok', b: 'tired', seen: true, d: S.toISO(S.addDays(start, 14)) }, 3: { e: 'ok', b: 'family', seen: true, d: S.toISO(S.addDays(start, 21)) } },
      body: [{ d: S.toISO(start), h: 158, w: 66.4, waist: 86 }, { d: S.toISO(S.addDays(start, 21)), h: 158, w: 65.8, waist: 85 }], height: 158 });
    const mins = [10, 0, 15, 10, 0, 20, 10, 15, 0, 20, 10, 15, 20, 0, 20, 15, 0, 20, 25, 10, 20, 15, 20, 0];
    mins.forEach((m, i) => { const iso = S.toISO(S.addDays(start, i)); const x = {}; if (m) x.min = m; if (i % 7 === 1 || i % 7 === 4) { if (i > 6) x.str = true; } if (i % 3 !== 2) x.plate = { half: true, protein: i > 14 }; d.log[iso] = x; });
  }

  /* ---------- Plans for her (Version 36). Mohit, 23 Oct: "let user keep a track of their reproductive health and based on
     symptomatic conditions advise these plans to fix issues using lifestyle". Every plan, routine and course in Sakhi gets
     points from what she logged (long gaps, heavy or painful periods, low mood, poor sleep, hot flushes, her check-ins and her
     PMOS self-check) and from what she asked for help with (state.goals: when she joined, or on this page). 2 points or more
     and it is "Suggested for you" (the top 4); 3 or more and the top one also shows on Home until she taps "Not now". Worked
     out on the phone from her diary; nothing is sent. A suggestion is never a diagnosis: long gaps without a PMOS diagnosis
     point to the PMOS self-check first, not to "you have PMOS". ---------- */
  const isoAgo = (n) => S.toISO(S.addDays(pToday(), -n));
  const daysWith = (keys, n) => { const dl = S.state.daily || {}; const from = isoAgo(n - 1); return Object.keys(dl).filter((k) => k >= from && (dl[k] || []).some((x) => keys.indexOf(x) >= 0)).length; };
  function signals() {
    const st = S.state; const sit = st.situation || {}; const goals = st.goals || []; const mods = st.mods || {};
    const gaps = ((S.cycle && S.cycle.gapsAll && S.cycle.gapsAll()) || []).filter((g) => g.usable).slice(-6);
    const ev = st.events || []; const starts = ev.filter((e) => e.t === 'start').map((e) => e.d).sort().slice(-3);
    /* a period's flow and pain: its start, and any details added in its first week */
    const per = starts.map((d0) => (S.cycle && S.cycle.periodFlow ? S.cycle.periodFlow(d0) : ev.filter((e) => (e.t === 'start' || e.t === 'start_detail') && e.d >= d0 && e.d <= S.toISO(S.addDays(S.fromISO(d0), 7)))));
    const vd = S.cycle && S.cycle.verdict ? S.cycle.verdict() : null;   /* Version 39.1: the same long gaps as Trends and explain */
    const cis = Object.keys(st.checkins || {}).sort().slice(-3).map((k) => st.checkins[k] || {}); const has = (c, k) => (c.chips || []).indexOf(k) >= 0;
    const b = sit.deliveredOn && !pregnant() ? S.diffDays(S.fromISO(sit.deliveredOn), pToday()) : null; const sc = (mods.selfcheck || {}).pmos;
    return {
      stage: S.stageNow ? S.stageNow() : 'cycle', goals: goals, pcos: !!sit.pcos || goals.indexOf('pmos') >= 0, bf: !!sit.breastfeeding, birth: b != null && b >= 0 && b <= 365 ? b : null,
      gaps: gaps.length, long: vd ? vd.longN : 0, band: (S.cycle && S.cycle.bandHi) ? S.cycle.bandHi() : 35, periods: per.length,
      heavy: per.filter((es) => es.some((e) => e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked || e.two)).length,
      pain: per.filter((es) => es.some((e) => e.pain === 'pain_2' || e.pain === 'pain_3')).length,
      ciSigns: cis.filter((c) => (c.chips || []).some((x) => PM_SIGNS.indexOf(x) >= 0)).length, ciHeavy: cis.filter((c) => has(c, 'heavy')).length,
      ciMood: cis.filter((c) => has(c, 'mood')).length, ciHot: cis.filter((c) => c.hot === 'hot_2' || c.hot === 'hot_3').length,
      sc: (sc && sc.v) || null, scDone: !!sc,
      cramps: daysWith(['d_cramps'], 60), acne: daysWith(['d_acne'], 60), tired: daysWith(['d_tired'], 30), low: daysWith(['d_mood', 'd_anxious', 'd_irritable'], 30),
      sleep: daysWith(['d_sleep'], 30), hot: daysWith(['d_hotflush'], 30), nausea: daysWith(['d_nausea'], 14)
    };
  }
  const tileFor = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x && !(x.hidden && x.hidden(S)) ? x : null; };
  /* [route, title, sub, duration, icon, hue, fits her now, active, paused, points]; points are [n, why] pairs, the biggest gives the why */
  function catalogue() {
    const s = signals(); const st = s.stage; const preg = st === 'preg'; const post = s.birth != null; const early = post && s.birth < 42; const moveOk = !preg && !early;
    const g = (k) => s.goals.indexOf(k) >= 0; const pt = (c, n, why) => (c ? [n, why] : null); const gl = (k, n) => pt(g(k), n, tf('plan_why_g', { k: obName(k) }));
    const jd = (S.state.mods || {}).journey || {}; const jOn = (id) => !!(S.canSave() && jd.active === id && jd.start && S.diffDays(S.fromISO(jd.start), pToday()) < 21);
    const pd = S.canSave() ? raw() : null; const pOn = !!(pd && pd.start && (packOf(pd) || upcoming(pd)));
    const poiNo = poiHold() && !(pOn && !(pd && pausedFor(pd)));   /* Version 39.53 (Mohit's phone test): before 40 with her periods stopped, no plan row beside the gynaecologist card (it said "After your 6-week check") */
    const gaps = tf('plan_why_gaps', { n: s.long, m: s.gaps, b: s.band }); const hv = tf('plan_why_heavy', { n: s.heavy, m: s.periods }); const pn = tf('plan_why_pain', { n: s.pain, m: s.periods });
    const low = tf('plan_why_low', { n: s.low }); const mid = t('plan_why_midlife');
    const out = [];
    const add = (o) => {
      if (!o.fit || !S.routeOwner(o.go) || (S.toolShown && !S.toolShown(o.go))) return;
      if (o.tile) { const x = tileFor(o.go); if (!x) return; o.t = o.t || t(x.title); o.s = o.s == null ? t(x.sub) : o.s; o.icon = o.icon || S.icon(x.icon); }
      o.score = 0; o.why = null; let best = 0;
      (o.pts || []).forEach((p) => { if (!p) return; o.score += p[0]; if (p[0] > best) { best = p[0]; o.why = p[1]; } });
      if (o.paused || o.active) o.score = 0;
      delete o.pts; delete o.tile; delete o.fit; out.push(o);
    };
    add({ id: 'plan-pmos', go: 'plan-pmos', t: disc() ? t('plan_h_d') : t('plan_h'), s: t('plan_tile_s'), dur: t('plan_d_12w'), icon: ICO.move, hue: 'purple', fit: !preg && st !== 'ttc' && (st !== 'meno' || s.pcos) && !poiNo,   /* Version 39.32: while she tries for a baby, Getting ready is her plan, with the PMOS food and moves */ active: pOn && !(pd && pausedFor(pd)), paused: (early && !pOn) || !!(pd && pausedFor(pd)),
      pts: [pt(s.pcos, 5, t('plan_why_pcos')), pt(s.sc === 'match', 4, t('plan_why_sc')), pt(s.sc === 'risk', 2, t('plan_why_sc_risk')), pt(!s.pcos && !s.sc && s.long >= 2 && s.ciSigns >= 1, 2, gaps), gl('weight', s.pcos ? 1 : 2), gl('skin', 1), gl('irregular', 1)] });
    /* Version 39.1 (journey audit): "Could it be PMOS?" is a check, not a plan, so it is no longer suggested as one; the long-gap
       and PMOS-signs cards in What your diary shows offer it as "Check the signs" */
    add({ id: 'journey-iron', go: 'journey-iron', t: t('journey_iron_t'), s: t('journey_iron_s'), dur: t('plan_d_21d'), icon: S.icon('drop'), hue: 'rose', fit: jOn('iron'), active: jOn('iron'),   /* Version 39.2: only while she is on it */
      pts: [pt(s.heavy >= 2, 4, hv), pt(s.heavy === 1, 3, hv), pt(s.ciHeavy >= 1, 3, t('plan_why_ciheavy')), gl('heavy', 3), gl('iron', 2), pt(s.tired >= 5, 2, tf('plan_why_tired', { n: s.tired }))] });
    add({ id: 'iron', go: 'iron', tile: true, dur: t('plan_d_daily'), icon: S.icon('pill'), hue: 'rose', fit: true,
      pts: [pt(preg, 4, t('plan_why_preg')), pt(post && s.birth < 180, 3, bornWhy(s.birth)), gl('iron', 3)] });
    add({ id: 'relief-cramps', go: 'relief-cramps', t: t('relief_cramps_t'), s: '', dur: t('plan_d_3m'), icon: S.icon('leaf'), hue: 'rose', fit: !preg && !early,   /* Version 39.57: not in the first 6 weeks after a birth */
      pts: [pt(s.pain >= 2, 4, pn), pt(s.pain === 1, 2, pn), pt(s.cramps >= 3, 3, tf('plan_why_cramps', { n: s.cramps })), gl('pain', 3)] });
    add({ id: 'relief-calm', go: 'relief-calm', t: t('relief_calm_t'), s: '', dur: t('plan_d_3m'), icon: S.icon('sparkle'), hue: 'sky', fit: true,
      pts: [pt(s.low >= 3, 3, low), pt(s.ciMood >= 1, 3, t('plan_why_cimood')), gl('mood', 3), gl('pms', 2)] });
    add({ id: 'periods-pms', go: 'periods-pms', tile: true, icon: S.icon('chart'), hue: 'gold', fit: st === 'cycle' || st === 'ttc', pts: [gl('pms', 3), pt(s.low >= 3, 1, low)] });
    add({ id: 'relief-sleep', go: 'relief-sleep', t: t('relief_sleep_t'), s: '', dur: t('plan_d_3m'), icon: S.icon('moon'), hue: 'purple', fit: true,
      pts: [pt(s.sleep >= 3, 3, tf('plan_why_sleep', { n: s.sleep })), gl('sleep', 3)] });
    add({ id: 'relief-hot', go: 'relief-hot', t: t('relief_hot_t'), s: '', dur: t('plan_d_3m'), icon: S.icon('leaf'), hue: 'orange', fit: st === 'meno' || s.hot > 0,
      pts: [pt(s.hot >= 2, 4, tf('plan_why_hot', { n: s.hot })), pt(s.ciHot >= 1, 3, t('plan_why_cihot')), gl('hot', 4)] });
    add({ id: 'meno-diary', go: 'meno-diary', tile: true, hue: 'orange', fit: st === 'meno', pts: [gl('hot', 3), pt(s.hot >= 2, 2, tf('plan_why_hot', { n: s.hot })), pt(true, 1, mid)] });
    add({ id: 'meno-bones', go: 'meno-bones', tile: true, hue: 'gold', fit: st === 'meno', pts: [gl('bones', 3), pt(true, 1, mid)] });
    add({ id: 'plan-r-strength', go: 'plan-r-strength', t: t('plan_r_strength'), s: t('plan_r_strength_s'), dur: tf('plan_mins', { n: routineMins('strength', pd || {}) }), icon: ICO.move, hue: 'gold', fit: moveOk,
      pts: [gl('bones', 3), pt(st === 'meno', 1, mid)] });
    add({ id: 'plan-moves', go: 'plan-moves', t: t('plan_moves_h'), s: t('plan_i_move_s'), icon: ICO.move, hue: 'purple', fit: moveOk && !s.pcos, pts: [gl('weight', 3), gl('food', 1)] });
    add({ id: 'plan-plate', go: 'plan-plate', t: t('plan_plate_h'), s: t('plan_i_eat_s'), icon: ICO.plate, hue: 'green', fit: !preg && !s.pcos, pts: [gl('food', 3), gl('weight', 3)] });
    add({ id: 'post-recovery', go: 'post-recovery', tile: true, hue: 'rose', fit: post, pts: [pt(early, 4, bornWhy(s.birth)), gl('recovery', 4)] });
    add({ id: 'post-pelvic', go: 'post-pelvic', tile: true, hue: 'plum', fit: post, pts: [pt(true, 3, t('plan_why_post')), gl('pelvic', 4)] });
    if (!died()) add({ id: 'post-feed', go: 'post-feed', tile: true, hue: 'sky', fit: post, pts: [gl('feed', 3), pt(s.bf, 2, t('plan_why_feed'))] });   /* Version 39.46: not after "My baby has died" */
    add({ id: 'post-mood', go: 'post-mood', tile: true, hue: 'sky', fit: post, pts: [gl('mood', 3), pt(s.low >= 3, 3, low)] });
    add({ id: 'preg-plan', go: 'preg-plan', tile: true, hue: 'green', fit: preg, pts: [pt(true, 5, t('plan_why_preg'))] });
    add({ id: 'preg-diet', go: 'preg-diet', tile: true, icon: ICO.plate, hue: 'green', fit: preg, pts: [gl('food', 3), pt(true, 2, t('plan_why_preg'))] });
    add({ id: 'relief-nausea', go: 'relief-nausea', t: t('relief_nausea_t'), s: '', dur: t('plan_d_3m'), icon: S.icon('leaf'), hue: 'green', fit: preg,
      pts: [gl('nausea', 3), pt(s.nausea >= 2, 3, tf('plan_why_nausea', { n: s.nausea }))] });
    add({ id: 'ttc-prep', go: 'ttc-prep', tile: true, hue: 'green', fit: st === 'ttc', pts: [pt(true, 3, t('plan_why_ttc'))] });
    add({ id: 'journey-pmos', go: 'journey-pmos', t: t('journey_pmos_t'), s: t('journey_pmos_s'), dur: t('plan_d_21d'), icon: S.icon('leaf'), hue: 'purple', fit: !preg && jOn('pmos'), active: jOn('pmos'), pts: [] });
    return out;
  }
  /* "Suggested for you": 2 points or more, best first (ties keep the catalogue's order), at most 4 */
  const pcosSaid = () => !!((S.state.situation || {}).pcos || (S.state.goals || []).indexOf('pmos') >= 0);
  const recsOf = (c) => c.map((x, i) => ({ x: x, i: i })).filter((y) => y.x.score >= 2 && !(y.x.id === 'plan-pmos' && !pcosSaid()))   /* review PLACES-03 */.sort((a, b) => b.x.score - a.x.score || a.i - b.i).slice(0, 4).map((y) => y.x);
  const recs = () => (on() && S.canSave() ? recsOf(catalogue()) : []);
  const icoOf = (x) => '<span class="ico-sm hue hue-' + x.hue + '">' + (x.icon || S.icon('leaf')) + '</span>';

  /* ---------- the Plans tab ---------- */
  function renderPlans(v, opt) {
    opt = opt || {};
    if (!on()) { v.innerHTML = '<h1>' + esc(t('plan_all_h')) + '</h1><div class="card soft"><p>' + esc(t('plan_off')) + '</p></div>'; S.wire(v); return; }
    S.mem.planFrom = 'plan';
    /* Version 39.42 (Mohit's tracking-stage walk): with the picker on top (opt.skip), a 12-week plan it lists isn't suggested or listed again */
    const sk = opt.skip || []; const can = S.canSave(); const c = catalogue(); const bare = !!opt.bare; const rc = can && !bare ? recsOf(c).filter((x) => sk.indexOf(x.id) < 0).slice(0, 3) : []; const now = can && !bare ? c.filter((x) => x.active) : [];   /* Version 39.57: after a plan change, the change card and the new plan's goals, no suggestions or more plans */
    const ids = rc.map((x) => x.id).concat(now.map((x) => x.id)); const more = bare ? [] : c.filter((x) => ids.indexOf(x.id) < 0 && sk.indexOf(x.id) < 0 && !(x.id === 'plan-pmos' && !pcosSaid()));   /* Version 39.2 */
    const pill = (x) => (x.paused ? '<span class="pill">' + esc(t('plan_paused_pill')) + '</span>' : (x.dur ? '<span class="pill">' + esc(x.dur) + '</span>' : ''));
    const nowCard = (x) => {
      let sub = '', art = icoOf(x), ttl = x.t;
      if (x.id === 'plan-pmos') {
        const d = fullD(D()); const pk = packOf(d); const kept = d.keep && weekNo(d) > N; if (pk && pk !== 'cycle') ttl = packTitle(d);
        if (upcoming(d)) sub = tf('plan_th_soon', { d: dayWord(d.start) }); else if (finished(d)) sub = t('plan_end_h');
        else if (pk && pk !== 'cycle') sub = ownWeek(d) || (kept ? t('plan_wk_keep') : (planWeeks(d) ? tf('plan_wk', { n: wkShown(d) }) : tf('plan_wk_n', { n: weekNo(d) })));   /* a light plan has no minutes ring */
        else { const wk = wkNow(d); const mins = weekMin(d, wk); const tgt = target(d, wk); art = ringSvg(mins, tgt, tf('plan_min_of', { a: mins, t: tgt })); sub = (kept ? t('plan_wk_keep') : tf('plan_wk', { n: wk })) + ' · ' + tf('plan_min_of', { a: mins, t: tgt }); }
      } else { const jd = S.state.mods.journey; sub = tf('journey_day', { n: Math.min(21, S.diffDays(S.fromISO(jd.start), pToday()) + 1) }); }
      return '<button type="button" class="action pl-now hue-' + x.hue + '" data-go="' + x.go + '">' + art + '<span class="body"><strong>' + esc(ttl) + '</strong><span class="small">' + esc(sub) + '</span></span><span class="go">' + S.I.chev + '</span></button>';
    };
    const recCard = (x) => '<button type="button" class="action pl-rec hue-' + x.hue + '" data-go="' + x.go + '">' + icoOf(x) + '<span class="body"><strong>' + esc(x.t) + '</strong>' +
      (x.why && !disc() ? '<span class="small pl-why">' + esc(x.why) + '</span>' : (x.s ? '<span class="small">' + esc(x.s) + '</span>' : '')) + (pill(x) ? '<span class="pl-meta">' + pill(x) + '</span>' : '') + '</span><span class="go">' + S.I.chev + '</span></button>';
    const moreRow = (x) => '<button type="button" class="item" data-go="' + x.go + '">' + icoOf(x) + '<span class="body"><strong>' + esc(x.t) + '</strong><span>' + esc([x.paused ? t('plan_paused_pill') : (x.dur && (x.s || '').indexOf(x.dur) < 0 ? x.dur : ''), x.s].filter(Boolean).join(' · ')) + '</span></span><span class="chev">' + S.I.chev + '</span></button>';
    v.innerHTML = '<h1>' + esc(t(opt.h || 'plan_all_h')) + '</h1>' + (opt.top || '') + (bare ? '' : '<p class="small">' + esc(t('plan_all_p')) + '</p>') +
      (now.length ? '<section class="care-sec pl-sec"><h2>' + esc(t('plan_all_now')) + '</h2>' + now.map(nowCard).join('') + '</section>' : '') +
      (!can ? '<div class="card soft"><p>' + esc(t('plan_all_diary')) + '</p>' + S.needDiary() + '</div>' :
        (!bare && (rc.length || !sk.length) ? '<section class="care-sec pl-sec"><h2>' + esc(t('plan_all_rec')) + '</h2>' + (rc.length ? rc.map(recCard).join('') : '<div class="card soft"><p class="small">' + esc(t('plan_all_none')) + '</p></div>') + '</section>' : '')) +   /* Version 39.2: one picker ("What do you want to work on?"), no second goal list */
      (more.length ? '<section class="care-sec pl-sec"><h2>' + esc(t('plan_all_more')) + '</h2><div class="list">' + more.map(moreRow).join('') + '</div></section>' : '') +
      '<p class="footnote">' + esc(t('plan_all_foot')) + '</p>';
    S.wire(v); wireHelp(v);
  }
  /* what she wants help with: the same choices as when she joined, for her stage now (state.goals) */
  const helpOpts = () => (S.helpKeys ? S.helpKeys(S.stageNow ? S.stageNow() : 'cycle') : []).filter((k) => k !== 'track');
  const helpOn = (k) => (S.state.goals || []).indexOf(k) >= 0 || (k === 'pmos' && !!(S.state.situation || {}).pcos);
  function helpCard() {
    const opts = helpOpts(); if (!opts.length) return '';
    if (S.mem.planHelp) {
      const sel = S.mem.planHelp;
      return '<div class="card pl-helpcard" id="pl-help"><h3>' + esc(t('ob_help_h')) + '</h3><div class="chips" role="group" aria-label="' + esc(t('ob_help_h')) + '">' +
        opts.map((k) => '<button type="button" class="chip' + (sel[k] ? ' on' : '') + '" data-pl-help="' + k + '" aria-pressed="' + !!sel[k] + '">' + esc(obName(k)) + '</button>').join('') + '</div>' +
        '<div class="grid2"><button type="button" class="btn" id="pl-help-no">' + esc(t('plan_cancel_b')) + '</button><button type="button" class="btn primary" id="pl-help-save">' + esc(t('plan_help_save')) + '</button></div></div>';
    }
    const on1 = opts.filter(helpOn);
    return '<div class="card pl-helpcard" id="pl-help"><div class="row spread"><h3>' + esc(t('plan_help_h')) + '</h3><button type="button" class="linkbtn" id="pl-help-edit">' + esc(t('plan_change')) + '</button></div>' +
      (disc() ? '' : (on1.length ? '<div class="pl-picks">' + on1.map((k) => '<span class="pill">' + esc(obName(k)) + '</span>').join('') + '</div>' : '<p class="small">' + esc(t('plan_help_none')) + '</p>')) + '</div>';
  }
  function wireHelp(v) {
    const ed = v.querySelector('#pl-help-edit'); if (ed) ed.addEventListener('click', () => { const sel = {}; helpOpts().forEach((k) => { if (helpOn(k)) sel[k] = true; }); S.mem.planHelp = sel; S.render(); });
    v.querySelectorAll('[data-pl-help]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.plHelp; S.mem.planHelp[k] = !S.mem.planHelp[k]; b.classList.toggle('on', !!S.mem.planHelp[k]); b.setAttribute('aria-pressed', String(!!S.mem.planHelp[k])); }));
    const no = v.querySelector('#pl-help-no'); if (no) no.addEventListener('click', () => { S.mem.planHelp = null; S.render(); });
    const sv = v.querySelector('#pl-help-save'); if (sv) sv.addEventListener('click', () => {
      const sel = S.mem.planHelp || {}; const opts = helpOpts(); const st = S.state;
      /* her other goals stay (the stage goal from joining, and help picked in another stage) */
      st.goals = (st.goals || []).filter((k) => opts.indexOf(k) < 0).concat(opts.filter((k) => sel[k]));
      /* "I have PMOS (PCOS)" is her own answer about herself, the same one as in My situation */
      if (opts.indexOf('pmos') >= 0 && !pregnant()) { st.situation = st.situation || {}; st.situation.pcos = !!sel.pmos; }
      S.mem.planHelp = null; S.saveQuiet(); S.toast(t('plan_help_saved')); S.render();
    });
  }
  /* Home: the best suggestion, when she has no plan going, until she says "Not now" (back after 14 days) */
  /* Version 39.10 (MODULE_API 53): after her first log, Today offers the plan her first goal chooses. "See my plan" asks the
     plan's own questions (from her answers at joining), then the plan screen and Start, as in Version 37.1. */
  /* Version 39.53 (Mohit, 1 Nov: "everything should lead to plan"): a guide, a routine or a topic page names her plan for its
     subject: the plan she runs (the midlife plan's part for it), or the plan that fits her stage, offered. Nothing while another
     plan runs (hers stays hers), while one rests or is on its way, in a pregnancy, after a loss or on a shared phone. */
  const FOR_PART = { hot: 'h', mood: 'q', sleep: 'r', bones: 's', aches: 's' };
  function forRow(topic) {
    if (!topic || !planOn() || disc() || pregnant() || lossNow()) return '';
    const st = stageNowKey(); const d = raw();
    const goal = topic === 'meno' ? (st === 'meno' ? ((S.state.goals || []).find((k) => GOALS.meno.indexOf(k) >= 0 && k !== 'track' && k !== 'heavy') || 'hot') : null) : topic;
    const pk = goal ? packFor(goal, st) : null; if (!pk) return '';
    const run = runningD();
    const row = (attr, ttl, sub) => '<div class="card soft pl-for" data-nofold="1"><span class="eyebrow">' + esc(t(run ? 'plan_for_h_run' : 'plan_for_h_offer')) + '</span><div class="list"><button type="button" class="item" ' + attr + '><span class="body"><strong>' + esc(ttl) + '</strong>' + (sub ? '<span class="small">' + esc(sub) + '</span>' : '') + '</span><span class="chev">' + S.I.chev + '</span></button></div></div>';
    if (run) {
      if (packOf(run) !== pk && !(perV2(run) && perGoalOn(run, goal)) && !(goal === 'pelvic' && pfJoined(fullD(run)))) return '';   /* Version 39.56: her sets in the plan she runs */   /* Version 39.55: any of her period goals leads to her period plan */
      let sub = ''; const ML = S.midlife && S.midlife.lesson;
      if (menoV2(run) && FOR_PART[topic] && ML && weekNo(run) <= N) { const ord = m2Order(run); let p = FOR_PART[topic]; if (ord.indexOf(p) < 0) p = p === 'h' ? 'q' : (p === 'q' ? 'h' : p); const i = ord.indexOf(p); if (i >= 0) sub = tf('plan_m2_rv_p', { a: i * 4 + 1, b: i * 4 + 4, p: ML.part(p) }); }
      return row('data-go="plan"', packTitle(run), sub);
    }
    if ((d && d.start && packOf(d)) || pendingOk(d) || upcoming(d) || goalsFor({ stage: st }).indexOf(goal) < 0) return '';
    return row('data-pl-for="' + esc(goal) + '"', packTitle({ pack: pk, goalKey: goal, pv: (specOf(pk) || {}).ver }), '');
  }
  /* the offer starts that plan's own questions, from any page (a guide's sheet closes first) */
  document.addEventListener('click', (e) => { const b = e.target && e.target.closest ? e.target.closest('[data-pl-for]') : null; if (!b) return; e.preventDefault(); if (S.closeSheet) S.closeSheet(); S.plan.offer(b.dataset.plFor); });
  function offerCard() {
    const p = S.state.prompts || {}; if (!on() || !S.canSave() || lossNow()) return '';   /* Version 39.58: a shared phone too; its title is "My plan", and its pages ask her PIN */
    const d = raw(); if ((packOf(d) && pausedFor(d) !== 'poi') || pendingOk(d) || upcoming(d)) return '';   /* Version 39.51: a plan held for her doctor shows the card */
    if ((poiHold() && stageNowKey() === 'meno') || poiAsk()) return disc() ? '' : p.poiNot && S.diffDays(S.fromISO(p.poiNot), pToday()) < 14 ? '' : poiHtml(!!(packOf(d) && pausedFor(d) === 'poi'));   /* Version 39.51 (the midlife walk): whatever joining set, as no plan is offered to her; Version 39.53 (Mohit's phone test): while it holds her plan, Today shows it where her plan's steps were */
    if (!p.planOffer) return '';   /* Version 39.61 (phase C): her plan comes first; her first log no longer holds it */
    if (p.planOfferNot && S.diffDays(S.fromISO(p.planOfferNot), pToday()) < 3) return '';
    const ik = S.state.intake || {}; const pk = ik.goal && goalsFor({ stage: stageNowKey() }).indexOf(ik.goal) >= 0 ? packFor(ik.goal, stageNowKey()) : null; if (!pk) return '';   /* Version 39.32: only a goal of her stage now */
    return '<div class="card pl-offer" data-nofold="1" data-disc-ok="1"><span class="eyebrow">' + esc(t('plan_off_eye')) + '</span><h3>' + esc(packTitle({ pack: pk, goalKey: ik.goal, pv: (specOf(pk) || {}).ver })) + '</h3><p class="small">' + esc(t(p.firstLog ? 'plan_off_p' : 'plan_off_p0')) + '</p>' +
      '<div class="row wrap"><button type="button" class="btn sm primary" id="pl-off-go">' + esc(t('plan_off_b')) + '</button><button type="button" class="btn sm" id="pl-off-not">' + esc(t('plan_off_later')) + '</button></div></div>';
  }
  function homeRec() {
    if ((S.state.prompts || {}).planOffer && !(S.state.prompts || {}).firstLog) return '';   /* Version 39.10: her first log comes first */
    if (!on() || !S.canSave() || disc() || lossNow() || packOf(raw()) || pendingOk(raw()) || upcoming(raw())) return '';   /* Version 37: a plan going (or waiting) is her plan; no second suggestion (review life-4: none after a loss) */
    const c = catalogue(); if (c.some((x) => x.active)) return '';
    const top = recsOf(c)[0]; if (!top || top.score < 3) return '';
    const pr = (S.state.prompts || {}).planRec; if (pr && S.diffDays(S.fromISO(pr), pToday()) < 14) return '';
    if (top.id === 'plan-pmos' && S.setupShows && S.setupShows('plan')) return '';   /* the setup card already offers it */
    return '<div class="card pl-homerec" data-nofold="1"><span class="eyebrow">' + esc(t('plan_rec_home')) + '</span>' +
      '<button type="button" class="action pl-rec hue-' + top.hue + '" data-go="' + top.go + '">' + icoOf(top) + '<span class="body"><strong>' + esc(top.t) + '</strong>' + (top.why ? '<span class="small pl-why">' + esc(top.why) + '</span>' : '') + (top.dur ? '<span class="pl-meta"><span class="pill">' + esc(top.dur) + '</span></span>' : '') + '</span><span class="go">' + S.I.chev + '</span></button>' +
      '<div class="row spread"><button type="button" class="linkbtn" id="pl-rec-not">' + esc(t('plan_rec_not')) + '</button><button type="button" class="linkbtn" data-go="plan">' + esc(t('plan_rec_all')) + '</button></div></div>';
  }
  /* Version 39.10: what she said while joining isn't asked again */
  const offerGo = () => { const ik = S.state.intake || {}; S.mem.planIntake = { stage: stageNowKey(), goal: ik.goal, iq: 1, gap: ik.gap || null, dx: ik.dx || null, known: ['gap', 'dx'].filter((k) => ik[k]) }; S.setHash('plan-goal'); };
  function afterHome(v) {
    const og = v.querySelector('#pl-off-go'); if (og) og.addEventListener('click', offerGo);
    wirePoi(v);   /* Version 39.51 */
    v.querySelectorAll('[data-pl-dq]').forEach((b) => b.addEventListener('click', () => { const i = b.dataset.plDq.indexOf(':'); dayAnswer(b.dataset.plDq.slice(0, i), b.dataset.plDq.slice(i + 1)); }));   /* Version 39.66 */
    const on1 = v.querySelector('#pl-off-not'); if (on1) on1.addEventListener('click', () => { S.state.prompts = S.state.prompts || {}; S.state.prompts.planOfferNot = todayISO(); S.saveQuiet(); S.render(); });
    const b = v.querySelector('#pl-rec-not'); if (b) b.addEventListener('click', () => { S.state.prompts = S.state.prompts || {}; S.state.prompts.planRec = todayISO(); S.saveQuiet(); S.render(); });
  }

  /* ---------- Version 37: Sakhi as her companion (docs/companion-journey-2026-10-23.md). Mohit, 23 Oct: "When i onboard then
     only it should clearly understand my needs and then personalize entire experience", then "assume i join this app today
     and start using it how it will act as my companion in order to achieve my goal", then "Build".
     Joining asks one main goal and what the plan needs: her periods (for a cycle goal), her day, when she can move, her body if
     she likes. The plan starts that day. Today carries its two or three actions; an evening check-in asks what she did, says
     what each habit does for her and counts the week; My plan is the 12-week path with the look-back, her results and her care
     team. One engine: the V35 plan for regular periods, PMOS, skin, weight and trying, and light plans built from Sakhi's own
     reviewed routines for period pain, heavy bleeding, mood before periods, pregnancy, after a birth and 40+. Everything stays
     on her phone, and nothing promises a result. ---------- */
  const GOALS = { cycle: ['irregular', 'pmos', 'pain', 'heavy', 'pms', 'skin', 'weight', 'pelvic', 'track'], ttc: ['ready', 'irregular', 'pmos', 'weight', 'pelvic', 'track'],   /* Version 39.56: the pelvic floor */
    preg: ['food', 'nausea', 'iron', 'sleep', 'mood', 'track'], post: ['recovery', 'pelvic', 'feed', 'mood', 'sleep', 'weight', 'track'], meno: ['hot', 'sleep', 'mood', 'bones', 'aches', 'heavy', 'weight', 'pelvic', 'track'] };
  const stKey = (st) => (GOALS[st] ? st : 'cycle');
  /* Version 39.8: the check-in's symbols and the look-back's faces */
  const CI_SYM = { d: '<svg class="ci-sym" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    p: '<svg class="ci-sym" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor"/></svg>',
    n: '<svg class="ci-sym" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' };
  const FACE_M = { low: 'M8 16.6q4-3.4 8 0', ok: 'M8.4 15.4h7.2', good: 'M8 14.2q4 3.8 8 0' };
  const face = (k) => (FACE_M[k] ? '<svg class="face face-' + k + '" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.6"/><circle cx="9" cy="10" r="1.2" class="fe"/><circle cx="15" cy="10" r="1.2" class="fe"/><path d="' + FACE_M[k] + '" class="fm"/></svg>' : '');
  const obName = (k, st) => t(k === 'pelvic' && stKey(st || stageNowKey()) !== 'post' ? 'ob_h_leak' : 'ob_h_' + k);   /* Version 39.56: "Leaking urine or heaviness" outside the after-birth stage */
  const goalName = (k, st) => (k === 'ready' ? t('plan_gl_ready') : obName(k, st));
  /* Version 39.8: a picture for each goal's row: [icon, hue] */
  const GOAL_ICO = { irregular: ['clock', 'rose'], pmos: ['chart', 'gold'], pain: ['bottle', 'orange'], heavy: ['drop', 'rose'], pms: ['heart', 'plum'], skin: ['sparkle', 'orange'], weight: ['target', 'teal'], track: ['diary', 'sky'],
    aches: ['lift', 'gold'], ready: ['flower', 'green'], food: ['plate', 'green'], nausea: ['leaf', 'green'], iron: ['drop', 'rose'], sleep: ['moon', 'sky'], mood: ['heart', 'plum'], recovery: ['care', 'rose'], pelvic: ['lift', 'teal'], feed: ['baby', 'gold'],
    hot: ['flame', 'orange'], bones: ['bone', 'gold'] };
  const goalIco = (k) => { const g = GOAL_ICO[k] || ['target', 'sky']; return '<span class="ico-sm hue hue-' + g[1] + '" aria-hidden="true">' + (ICO[g[0]] || S.icon(g[0])) + '</span>'; };
  /* ---------- Version 39.4 (the port R1; MODULE_API section 47): the plans as data ----------
     Each plan is pure data in web/progs/*.js (window.SAKHI_PROGS, loaded before the modules); this engine reads it at call
     time, so load order doesn't matter. Its words come from a closed vocabulary (below); test/progs.mjs fails on any other.
     A 'draft' plan shows only with SAKHI_CONFIG.drafts. A saved plan keeps the version she started (d.pv). */
  const progsAll = () => (Array.isArray(window.SAKHI_PROGS) ? window.SAKHI_PROGS : []).filter((p) => p && p.id && (p.status !== 'draft' || !!(window.SAKHI_CONFIG || {}).drafts));
  /* one entry per plan, in file order (the first whose goals match is hers), each at the highest version allowed */
  function progs() {
    const at = {}; const out = [];
    progsAll().forEach((p) => { if (at[p.id] == null) { at[p.id] = out.length; out.push(p); } else if ((p.ver || 0) > (out[at[p.id]].ver || 0)) out[at[p.id]] = p; });
    return out;
  }
  const specOf = (pk, pv) => { if (!pk) return null; const all = progsAll().filter((p) => p.id === pk); return (pv && all.find((p) => p.ver === pv)) || progs().find((p) => p.id === pk) || null; };
  const specD = (d) => specOf((d && d.pack) || 'cycle', d && d.pv);
  const tileTitle = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x ? t(x.title) : r; };
  /* text: '@key' is a reviewed string (any module's); '@tile' the title of the tile its route opens */
  const ptx = (x, route) => (typeof x !== 'string' ? (x ? tx(x) : '') : (x === '@tile' ? tileTitle(route) : (x.charAt(0) === '@' ? t(x.slice(1)) : x)));
  const progIco = (k) => (/^ico:/.test(k || '') ? ICO[k.slice(4)] : S.icon(k));
  const earlyAt = (iso) => { const b = (S.state.situation || {}).deliveredOn; return !!b && S.diffDays(S.fromISO(b), S.fromISO(iso)) < 42; };
  /* `if`: an AND list; '!' negates. route[:r] (the route has an owner), early (under 6 weeks after a birth), goal:x, sit:x
     (her situation), ans:q=v (her saved answers), birth:a-b (days a to b after the birth) */
  function progIf(list, c) {
    return (list || []).every((w) => {
      const neg = w.charAt(0) === '!'; const x = neg ? w.slice(1) : w; const i = x.indexOf(':'); const k = i < 0 ? x : x.slice(0, i), v = i < 0 ? '' : x.slice(i + 1);
      let r = false;
      if (k === 'route') r = !!S.routeOwner(v || c.go);
      else if (k === 'early') r = earlyAt(c.day);
      else if (k === 'goal') r = (c.goal || '') === v;
      else if (k === 'sit') r = !!(S.state.situation || {})[v];
      else if (k === 'ans') { const j = v.indexOf('='); r = String((c.ik || {})[v.slice(0, j)]) === v.slice(j + 1); }
      else if (k === 'birth') { const b = (S.state.situation || {}).deliveredOn; const m = /^(\d+)-(\d*)$/.exec(v); const n = b && m ? S.diffDays(S.fromISO(b), S.fromISO(c.day)) : -1; r = !!m && n >= +m[1] && (m[2] === '' || n <= +m[2]); }   /* Version 39.5: days since the birth; Version 39.46: b may be empty (from a on) */
      else if (k === 'unlock') r = unlocked(c.d, c.day);   /* Version 39.46: back to strong, after her 6-week check */
      else if (k === 'pready') r = preadyOk(c.d, c.day);   /* Version 39.46: Strength at home, after "Is my body ready?" */
      else if (k === 'died') r = died();   /* Version 39.46: "My baby has died" */
      else if (k === 'folic') r = folicCarry(c.d, c.day);   /* Version 39.47: her folic acid from Getting ready, to 12 weeks */
      else if (k === 'week' || k === 'pday') { const m = /^(\d+)-(\d*)$/.exec(v); const n = c.d && c.d.start && c.day ? (k === 'week' ? weekAt(c.d, c.day) : planDayAt(c.d, c.day)) : 0; r = !!m && n >= +m[1] && (m[2] === '' || n <= +m[2]); }   /* Version 39.32: her plan's week or day, a to b (no b: from a on) */
      else if (k === 'gw') { const m = /^(\d+)-(\d*)$/.exec(v); const n = gwAt(c.day); r = !!m && n != null && n >= +m[1] && (m[2] === '' || n <= +m[2]); }   /* Version 39.34: her pregnancy week, a to b */
      else if (k === 'pt') r = psTier((c.ik || {}).pflags, gwAt(c.day)) === v;   /* Version 39.34: her safety tier, from her answers and her week */
      else if (k === 'pnow') r = !!(c.ik || {}).pnow;
      else if (k === 'also') r = alsoGoal(v, c.goal);   /* Version 39.55: another of her goals (her first goal leads) */
      else if (k === 'period') r = periodToday(c.day);   /* a day she bleeds */
      else if (k === 'before') r = beforeAt(c.day);   /* the 7 days before her likely days, and those days until her period comes */
      else if (k === 'pfurge') r = pfUrge(c.d);   /* Version 39.56: the urge track (urge or both) */
      else if (k === 'pfgoal') r = pfGoal();   /* the pelvic floor is one of her goals: her sets join this plan */
      else if (k === 'hbdone') r = hbDone(c.d, c.day);   /* her Hb test, ticked or saved */   /* Version 39.34: a sign that doesn't wait, until she checks her answers again */
      return neg ? !r : r;
    });
  }
  /* `when`: daily (or none), periodDays (a day she is bleeding), days:a,b (days of her plan week; 0 is the day she started) */
  function progWhen(w, c) {
    if (!w || w === 'daily') return true;
    if (w === 'periodDays') return periodToday(c.day);
    if (w === 'before') return beforeAt(c.day);   /* Version 39.55: My period plan's days */
    if (w === 'between') return !periodToday(c.day) && !beforeAt(c.day);
    if (w === 'kitday') return kitDayAt(c.day);
    const m = /^days:([\d,]+)$/.exec(w); return !!m && m[1].split(',').map(Number).indexOf((planDayAt(c.d, c.day) - 1) % 7) >= 0;
  }
  const walkStep = (d, c, mins, why, st) => ({ id: 'move', icon: ICO.move, hue: 'purple', kind: 'minutes', mins: mins, title: tf('plan_walk', { n: mins }), sub: d.when ? t('plan_w_' + d.when) : t('plan_walk_s'), go: S.routeOwner('plan-moves') && packOf(d) !== 'preg' && !earlyPost() ? 'plan-moves' : 'plan', state: st('move', (c.lg.min || 0) >= mins), why: why });   /* review PAGES-07 */
  /* minutes: ladder (the week's walk, plan.js's table), light (10 to 30 minutes over the weeks), post (10 for 6 weeks after a birth, then light).
     Version 39.5, the hold rule (journey audit P2-07): with grow: 'hold', the walk grows only after a week with 3 days or
     more; a quieter week keeps last week's pace (rest days count as days). */
  const lightWalkW = (wk) => (wk <= 2 ? 10 : (wk <= 4 ? 15 : (wk <= 8 ? 20 : 30)));
  const heldWk = (d, iso) => { const wk = Math.max(1, Math.min(weekAt(d, iso), N)); let w = 1; for (let k = 2; k <= wk; k++) if (weekDays(d, k - 1) >= 3) w++; return w; };
  const minsOf = (x, d, c) => {
    if (lightOn(d, c.day)) return 10;   /* Version 39.12: a lighter week she chose */
    if (typeof x.mins === 'number') return x.mins;   /* Version 39.34: a set walk (My pregnancy's easy 10 minutes) */
    const hw = x.grow === 'hold' ? heldWk(d, c.day) : 0;
    const n = x.mins === 'light' ? (hw ? lightWalkW(hw) : lightWalk(d, c.day)) : (x.mins === 'post' ? (earlyAt(c.day) ? 10 : (hw ? lightWalkW(hw) : lightWalk(d, c.day))) : (hw ? daySuggest(d, hw) : c.tp.walk));
    return x.cap ? Math.min(n, x.cap) : n;
  };
  /* Version 39.5 (journey audit P2-15): a step that counts from its own tool (from), done only by doing it there (check) */
  const fromDone = (f, iso) => {
    try {
      if (/^relief:/.test(f)) return !!(S.relief && S.relief.doneOn && S.relief.doneOn(f.slice(7), iso));
      if (f === 'ttc-prep') return !!(S.ttc && S.ttc.prepOn && S.ttc.prepOn(iso));
      if (f === 'meno-diary') return !!(S.meno && S.meno.diaryOn && S.meno.diaryOn(iso));
      if (f === 'post-pelvic') return !!(S.post && S.post.pelvicOn && S.post.pelvicOn(iso));
      if (f === 'post-recovery') return recDone(iso);   /* Version 39.46: after midnight, the evening before's */
      if (f === 'preg-plan') return !!(S.preg && S.preg.plan && S.preg.plan.markedOn && S.preg.plan.markedOn(iso));
    } catch (e) { /* a module this build doesn't have */ }
    return false;
  };
  /* the steps other modules own, moved unchanged from Version 39.3's actionsFor */
  /* Version 39.9 (diet audit 2): after the 21 days, one iron food a day that changes over 7 days, from her region's foods and
     how she eats (amla is the vitamin C that goes with it, so it is the line under it, not a food of the day) */
  function ironRot(d, c, fo) {
    const xs = S.food && S.food.pick ? S.food.pick('i', { region: regionOf(d), preg: pregnant(), skip: /^amla$/i }).slice(0, 7) : [];
    if (!xs.length) return { t: t('plan_a_ironf'), p: t('plan_a_ironf_' + (fo === 'nonveg' || fo === 'egg' ? fo : 'veg')) };
    const x = xs[Math.max(0, planDayAt(d, c.day) - 22) % xs.length];
    return { t: tf('plan_a_iron_rot', { x: S.food.name(x, { preg: pregnant() }) }), p: t('plan_a_iron_c') };
  }
  /* Version 39.9: once a week, the 5th day of her plan week, an earlier habit comes back ("Still doing half the plate sabzi?") */
  const lowFirst = (x) => (S.state.lang === 'en' ? x.charAt(0).toLowerCase() + x.slice(1) : x);
  /* V39.9 review FOOD-05: each week's earlier habit is the one asked longest ago (one that just left Today first), so every
     earlier habit comes back, after a fair restart (hab0) and in a kept year too */
  const stillPick = (d, w) => { const last = {}; let pick = null;
    for (let v = 1; v <= w; v++) { const old = habitsOf(d, Math.min(v, N)).slice(0, -1); if (!old.length) continue;
      let best = null; for (let i = old.length - 1; i >= 0; i--) { const a = last[old[i].id] == null ? -1 : last[old[i].id]; if (!best || a < best.a) best = { h: old[i], a: a }; }
      last[best.h.id] = v; pick = best.h; }
    return pick; };
  /* Version 39.9 (diet audit 3.6): on a day she fasts, her food steps make way for one fasting step (the fasting page's lines) */
  const FOOD_IDS = ['food', 'iron', 'ca', 'bfood'];
  const fastOn = (d, iso) => !!(d && d.fast && d.fast[iso || todayISO()]);
  /* V39.9 review FOOD-01: in pregnancy and while she breastfeeds, the fasting step (with its doctor line) can come on any
     day of her plan, not only on a day with a food step */
  const fastCare = () => pregnant() || !!(S.state.situation || {}).breastfeeding;
  const fastStep = (st) => ({ id: 'fast', icon: ICO.drink, hue: 'sky', kind: 'tick', title: t('plan_a_fast'), sub: t(fastCare() ? 'plan_a_fast_pb' : 'plan_a_fast_s'), go: S.routeOwner('periods-fasting') ? 'periods-fasting' : 'food', state: st('fast'), why: 'plan_fb_any', priv: true });
  /* her fasting days stay a week at most (V39.9 review FOOD-08: also when she never taps a fasting chip again) */
  const pruneFast = (d) => { if (!d || !d.fast) return false; const lo = S.toISO(S.addDays(pToday(), -7)); let n = 0; Object.keys(d.fast).forEach((k) => { if (k < lo) { delete d.fast[k]; n++; } }); return n > 0; };
  function setFast(d, iso, on1) { d.fast = Object.assign({}, d.fast || {}); if (on1) d.fast[iso] = 1; else delete d.fast[iso]; pruneFast(d); }
  const foodDay = (d, iso) => { const xs = stepsFor(d, iso); return xs.some((a) => FOOD_IDS.indexOf(a.id) >= 0 || a.id === 'fast') || (xs.length > 0 && fastCare()); };
  /* Version 39.32 (packet R11): the ready check on days 3 to 7, in week 6 and in week 12, then once every 4 weeks while her plan
     carries on, each until she does it */
  const readyDue = (d, day, last) => { const pd = planDayAt(d, day); const lp = last ? planDayAt(d, last) : -1; const win = (a, b) => pd >= a && pd <= b && lp < a;
    if (win(3, 7) || win(36, 42) || win(78, 84)) return true; if (pd > 84) { const a = 85 + 28 * Math.floor((pd - 85) / 28); return pd <= a + 6 && lp < a; } return false; };
  /* the 7 days before her likely period, on any day (the calm week's own rule) */
  /* Version 39.55 (My period plan): the 7 days before her likely start (not a day she bleeds), their last 2 days (her kit made
     ready), another of her goals (her first goal leads), and her Hb test (ticked in her plan, or a result saved from 90 days before
     her plan began) */
  /* the test pass (2 Nov): her likely days count too, until her period comes; past them she is late, and no window opens */
  const perWin = (iso, k) => { try { const ri = S.cycle.rangeInfo(); if (!ri || periodToday(iso)) return false; return S.diffDays(S.fromISO(iso), ri.from) <= k && S.diffDays(S.fromISO(iso), ri.to) >= 0; } catch (e) { return false; } };
  const beforeAt = (iso) => perWin(iso, 7);
  const kitDayAt = (iso) => perWin(iso, 2);
  /* the reveal's line for a step of her cycle (Version 39.55) */
  const PI_WIN = { periodDays: 'plan_pi_pd', before: 'plan_pi_bf', kitday: 'plan_pi_kd', pfd13: 'plan_pf_pi_d13' };   /* Version 39.56: Find the right muscles, days 1 to 3 */
  const alsoGoal = (g, lead) => !!g && g !== lead && (S.state.goals || []).indexOf(g) >= 0;
  const perV2 = (d) => !!(d && ['pain', 'heavy', 'pms'].indexOf(d.pack || '') >= 0 && (d.pv || 1) >= 2);
  const perGoalOn = (d, g) => perV2(d) && ((d.goalKey || d.pack) === g || alsoGoal(g, d.goalKey || d.pack));
  const hbDone = (d, iso) => { if (!d || !d.start) return false; const hl = S.cond && S.cond.hbLatest ? S.cond.hbLatest() : null; if (hl && hl.d >= S.toISO(S.addDays(S.fromISO(d.start), -90))) return true;
    const n = Math.min(120, S.diffDays(S.fromISO(d.start), S.fromISO(iso || todayISO()))); for (let i = 0; i <= n; i++) { if ((dayLog(d, S.toISO(S.addDays(S.fromISO(d.start), i))).ck || {}).hb === 'd') return true; } return false; };
  const calmWeekAt = (iso) => { try { const ri = S.cycle.rangeInfo(); if (!ri) return false; const n = S.diffDays(S.fromISO(iso), ri.from); return n >= 1 && n <= 7; } catch (e) { return false; } };
  /* her folic acid reminder runs with the Getting ready plan, and on in a pregnancy that follows it until 12 weeks (packet J3);
     after a loss it stops with the plan */
  /* Version 39.47 (Mohit's four-plan walk): "Your folic acid carries on to 12 weeks", and now it does. Once she started My
     pregnancy, the tablet step and its 9 pm reminder went (the pregnancy plan isn't Getting ready). A pregnancy plan that follows
     Getting ready (its plan before this pregnancy, or the one it replaces) keeps the tablet step, first, and its reminder until
     12 weeks; her check-ups count her tablet as started (preg.js), so "Due now" doesn't name it too. */
  const ttcBefore = () => { const r = raw(); if (!r) return false; if (babyD(r)) return true; const since = (S.state.situation || {}).pregnantSince;
    return (Array.isArray(r.past) ? r.past : []).some((p) => p && p.pack === 'ttc' && (p.pv || 1) >= 2 && (!since || !p.end || p.end >= since)); };
  const folicCarry = (d, iso) => { if (!d || packOf(d) !== 'preg' || !pregnant() || !ttcBefore()) return false; const gw = gwAt(iso || todayISO()); return gw != null && gw < 12; };
  const folicRun = (d) => { if (!babyD(d)) return folicCarry(d) && !pausedFor(d) && !selfPaused(d); if (packOf(d) && !pausedFor(d) && !selfPaused(d) && !finished(fullD(d))) return true;
    if (pregnant()) { const pi = S.preg && S.preg.info ? S.preg.info() : null; return !!(pi && pi.weeks != null && pi.weeks < 12); } return false; };
  const folicSync = (d) => { try { if (d && S.ttc && S.ttc.folic) S.ttc.folic.sync(folicRun(d), ((dayLog(d, todayISO()).ck) || {}).folic === 'd'); } catch (e) { /* this build has no trying pages */ } };
  /* ---------- Version 39.56: My pelvic floor plan (Mohit, 2 Nov: "proceed building"; docs/pelvic-floor-plan-advice-2026-11-02.md) ----------
     Her sets in 8 levels that unlock from her sets, never the calendar: 5 days of sets at a level opens the next, and 3 weeks away
     steps her back one. Lying sets only (level 2) until a doctor has checked heaviness, or after a past operation for leaks or
     prolapse or pelvic cancer treatment until her doctor or physiotherapist says more is fine (a cap counts from the day it lifts,
     so she moves up one level, not to where her days would have taken her). Breathing and letting go after pain (her safety
     answer, or "It hurts" twice in the trainer) until a doctor has checked it. 3 sets a day, 1 on a period day, 1 a day after
     week 12 (3 to week 16 after "a doctor said prolapse"). The same sets join My period plan, My midlife plan and Getting ready as
     one step when the pelvic floor is one of her goals. */
  const PF_LV = [['lie', 3, 8, 0], ['lie', 5, 8, 0], ['sit', 5, 10, 5], ['sit', 7, 10, 10], ['stand', 5, 10, 10], ['stand', 8, 10, 10], ['stand', 10, 10, 10], ['walk', 10, 10, 10]];
  const PFS = ['retain', 'const', 'uti', 'bulge', 'bowel', 'pain', 'mesh'];   /* her safety answers, in the screen's order */
  const PFS_DOC = ['retain', 'bulge', 'const', 'bowel', 'uti'];   /* a doctor first, the most urgent first */
  const pfLead = (d) => !!d && (d.pack || 'cycle') === 'pelvic';
  const pfGoal = () => (S.state.goals || []).indexOf('pelvic') >= 0;
  const pfSetsOn = (iso) => { try { return S.post && S.post.pfSets ? S.post.pfSets(iso) : 0; } catch (e) { return 0; } };
  const pfIk = (d) => (pfLead(d) ? ikOf(d) : {});
  const pfFlag = (d, k) => (pfIk(d).pfflags || []).indexOf(k) >= 0;
  const pfUrge = (d) => { const k = pfIk(d).pft; return k === 'urge' || k === 'both'; };
  /* Mohit's phone test: her check-in's answer for her sets, only in the mode it was given ('s' squeezes, 'r' breathing and letting go;
     an answer from before the fix was a squeeze answer), and the better of it and what the trainer counted, so a later set still counts */
  const pfAns = (lg, md) => { const v = ((lg || {}).ck || {}).sets; return v && (((lg || {}).ckm || {}).sets || 's') === md ? v : null; };
  const pfBest = (a, b) => (a === 'd' || b === 'd' ? 'd' : (a === 'p' || b === 'p' ? 'p' : (a || b || null)));
  const pfRelax = (d) => !!d && (pfFlag(d, 'pain') || !!d.pfRelax) && !d.pfPainOk;
  const pfCapOn = (d, iso) => (pfLead(d) && ((pfIk(d).pft === 'heavy' && !(d.pfDoc && d.pfDoc.at <= iso)) || (pfFlag(d, 'mesh') && !(d.pfOk && d.pfOk <= iso))) ? 2 : 8);
  /* the days she did a set: the trainer's, and her Done in the check-in */
  function pfDays(d) {
    const s = {}; try { (S.post && S.post.pfDays ? S.post.pfDays() : []).forEach((x) => { s[x] = 1; }); } catch (e) { /* no trainer in this build */ }
    const lg = (d && d.log) || {}; Object.keys(lg).forEach((x) => { const c0 = pfAns(lg[x], 's'); if (c0 === 'd' || c0 === 'p') s[x] = 1;   /* the test pass: some sets away from the phone count too (a breathing day is not a day of squeezes) */ });
    const td = todayISO(); return Object.keys(s).filter((x) => x <= td).sort();
  }
  function pfLevel(d) {
    let lv = 1, n = 0, prev = null; const td = todayISO();
    const away = (a, b) => Math.floor(S.diffDays(S.fromISO(a), b) / 21);   /* one level back for each 3 weeks away */
    pfDays(d).forEach((x) => { const k = prev ? away(prev, S.fromISO(x)) : 0; if (k > 0) { lv = Math.max(1, lv - k); n = 0; } n++; if (n >= 5) { if (lv < pfCapOn(d, x)) { lv++; n = 0; } else n = 5; } prev = x; });
    let back = false; if (prev && prev < td) { const k = away(prev, pToday()); if (k > 0) { lv = Math.max(1, lv - k); n = 0; back = true; } }
    const cap = pfCapOn(d, td); if (lv > cap) lv = cap; const L0 = PF_LV[lv - 1];
    return { n: lv, pos: L0[0], hold: L0[1], reps: L0[2], quick: L0[3], left: lv >= cap ? 0 : Math.max(1, 5 - n), back: back, capped: cap < 8 && lv >= cap, top: lv >= 8, fresh: !back && [3, 5, 8].indexOf(lv) >= 0 && (n === 0 || (n === 1 && prev === td)) };   /* fresh: her first day at a new position, all that day */
  }
  const pfSecs = (lv) => 3 + lv.reps * lv.hold * 2 + lv.quick * 3;   /* get ready, each squeeze and its let-go, the quick squeezes */
  const pfMins = (lv) => Math.max(1, Math.round(pfSecs(lv) / 60));
  const pfTarget = (d, iso) => { if (pfRelax(d) || periodToday(iso)) return 1; const wk = d && d.start ? weekAt(d, iso) : 1; if (wk > N) return pfLead(d) && d.pfDoc && d.pfDoc.said === 'pop' && wk <= 16 ? 3 : 1; return 3; };
  /* her habit for the fortnight, from week 2: the knack, water, the toilet (less tea and coffee on the urge track), lifting, a set at a task */
  const pfHabit = (d, iso) => { const wk = weekAt(d, iso); return wk === 2 ? 'h1' : (wk <= 4 ? 'h2' : (wk <= 6 ? (pfUrge(d) ? 'h3u' : 'h3') : (wk <= 8 ? 'h4' : (wk <= 12 ? 'h5' : null)))); };
  const pfShared = () => disc() || !!(S.state.settings || {}).shared;
  const pfPop = (d) => !!(pfLead(d) && pfIk(d).pft === 'heavy' && d.pfDoc && d.pfDoc.said === 'pop');   /* a doctor found a prolapse */
  const PF_HCH = { h1: 'f2', h2: 'f4', h3: 'f5', h3u: 'f6', h4: 'f8', h5: 'f9' };   /* each habit's chapter */
  const ADAPT = {
    /* Version 39.56 (My pelvic floor plan): her squeeze sets (the trainer; its play button starts a set), or breathing and letting
       go after pain; Find the right muscles; Get checked once (heaviness, until she says what the doctor said); When the urge
       comes; her habit for the fortnight (the week's chapter teaches it) */
    'pelvic.sets': (d, c, x, st) => {
      const sh = pfShared();
      if (pfRelax(d)) { const did = !!(S.calm && S.calm.doneOn && S.calm.doneOn(c.day)); const nm = t(sh ? 'plan_pf_sets_d' : 'plan_pf_relax');
        return [{ id: 'sets', icon: S.icon('sparkle'), hue: 'sky', kind: 'tick', title: nm, name: nm, sub: t('plan_pf_relax_s'), go: S.calm ? 'calm-breaths' : 'plan-r-calm', state: pfBest(did ? 'd' : null, pfAns(c.lg, 'r')), mode: 'r', why: 'plan_fb_pf_relax', priv: true, how: t('post_pf_relax_p'),
          play: S.calm ? 'calm-breaths' : null, playMin: S.calm && S.calm.mins ? S.calm.mins('breaths') : 0, playDay: true }]; }
      const n = pfSetsOn(c.day); const m = pfTarget(d, c.day); const lv = pfLevel(d); const nm = t(sh ? 'plan_pf_sets_d' : 'plan_pf_sets'); const sb = tf('plan_pf_sets_s', { n: Math.min(n, m), m: m, l: tf('plan_pf_lv', { n: lv.n, p: t('plan_pf_pos_' + lv.pos) }) });
      return [{ id: 'sets', icon: S.icon('flower'), hue: 'plum', kind: 'tick', title: nm, name: nm, sub: sb, subP: n > 0 ? sb : undefined, go: 'post-pelvic', state: pfBest(n >= m ? 'd' : (n > 0 ? 'p' : null), pfAns(c.lg, 's')), mode: 's', why: 'plan_fb_pfl', priv: true,   /* Mohit's phone test: partly done, her count */
        play: 'pf-go', playMin: pfMins(lv), playDay: true, how: tf('post_pf_lv_do', { r: lv.reps, h: lv.hold }) + (lv.quick ? '. ' + tf('post_pf_lv_q', { q: lv.quick }) : '') + '.' }];   /* the test pass: her level's squeezes */
    },
    'pelvic.find': (d, c, x, st) => { if (pfRelax(d)) return []; const pd = planDayAt(d, c.day); const lv = pd > 3 && c.day === todayISO() ? pfLevel(d) : null; if (pd > 3 && !(lv && lv.fresh)) return [];   /* days 1 to 3, and her first day at a new position */
      return [{ id: 'find', icon: S.icon('sparkle'), hue: 'plum', kind: 'tick', title: t('plan_pf_find'), name: t('plan_pf_find'), sub: lv ? tf('plan_pf_find_n', { p: t('plan_pf_pos_' + lv.pos) }) : t('plan_pf_find_s'), go: 'post-pelvic', state: st('find'), why: 'plan_fb_pf_find', priv: true, win: lv ? undefined : 'pfd13' }]; },
    'pelvic.checked': (d, c, x, st) => (d.pfDoc ? [] : [{ id: 'checked', icon: S.icon('steth'), hue: 'rose', kind: 'tick', title: t('plan_pf_chk'), name: t('plan_pf_chk'), sub: t('plan_pf_chk_s'), go: S.routeOwner('intimate-prolapse') ? 'intimate-prolapse' : 'plan', state: st('checked'), why: 'plan_fb_pf_chk', priv: true, once: true }]),
    'pelvic.urge': (d, c, x, st) => [{ id: 'urge', icon: S.icon('sparkle'), hue: 'sky', kind: 'tick', title: t('plan_pf_urge'), name: t('plan_pf_urge'), sub: t(weekAt(d, c.day) >= 3 ? 'plan_pf_urge_s2' : 'plan_pf_urge_s1'), go: 'pf-urge', state: st('urge'), why: 'plan_fb_pf_urge', priv: true }],
    'pelvic.habit': (d, c, x, st) => { const k = pfHabit(d, c.day); return k ? [{ id: 'habit', icon: S.icon('leaf'), hue: 'green', kind: 'tick', title: t('plan_pf_' + k), name: t('plan_pf_' + k), sub: t('plan_pf_' + k + '_s'), go: 'pf-habit', state: st('habit'), why: 'plan_fb_pf_habit', priv: true }] : []; },   /* the test pass: the chapter that teaches it */

    /* Version 39.55 (My period plan): Relax with Dr. Megha (Wind down's slow breaths; any session she plays that day counts), a rest
       lying down on a heavy day (yoga nidra), her Hb test to day 21 until it is done (a result she saves counts), and her calm-week
       plan in the 7 days before her period (its tool is the 3-minute routine for a hard moment) */
    'period.relax': (d, c, x, st) => { const did = !!(S.calm && S.calm.doneOn && S.calm.doneOn(c.day));
      return [{ id: 'relax', icon: S.icon('sparkle'), hue: 'sky', kind: 'tick', title: t('plan_a_relax'), name: t('plan_a_relax'), sub: t('plan_a_relax_s'), go: S.calm ? 'calm-breaths' : 'plan-r-calm', state: st('relax', did), why: 'plan_fb_relax',
        play: S.calm ? 'calm-breaths' : null, playMin: S.calm && S.calm.mins ? S.calm.mins('breaths') : 0, playDay: true }]; },   /* the phone test: one tap plays it */
    'period.rest': (d, c, x, st) => { const did = !!(S.calm && S.calm.doneOn && S.calm.doneOn(c.day));
      return [{ id: 'rest', icon: S.icon('moon'), hue: 'purple', kind: 'tick', title: t('plan_a_prest'), name: t('plan_a_prest'), sub: t('plan_a_prest_s'), go: S.calm ? 'calm-nidra' : 'plan-r-calm', state: st('rest', did), why: 'plan_fb_prest',
        play: S.calm ? 'calm-nidra' : null, playMin: S.calm && S.calm.mins ? S.calm.mins('nidra') : 0, playDay: true }]; },
    'period.hb': (d, c, x, st) => { if (planDayAt(d, c.day) > 21 || hbDone(d, S.toISO(S.addDays(S.fromISO(c.day), -1)))) return [];
      return [{ id: 'hb', icon: S.icon('drop'), hue: 'rose', kind: 'tick', title: t('plan_a_phb'), name: t('plan_a_phb'), sub: t('plan_a_phb_s'), go: S.routeOwner('cond-anaemia') ? 'cond-anaemia' : (S.toolShown && S.toolShown('cond-labs') ? 'cond-labs' : 'plan'), state: st('hb'), why: 'plan_fb_phb', priv: true, once: true }]; },   /* Version 39.68: her Hb results on the lab page, the anaemia page gone */   /* once: no "Partly" in the check-in */
    'period.calmweek': (d, c, x, st) => [{ id: 'calmweek', icon: S.icon('sparkle'), hue: 'plum', kind: 'tick', title: t('plan_a_calmweek'), name: t('plan_a_calmweek'), sub: t('plan_a_calmweek_s'), go: S.routeOwner('relief-calm') ? 'relief-calm' : 'plan', state: st('calmweek'), why: 'plan_fb_calmweek', priv: true }],
    /* Version 39.13 (Mohit, 26 Oct: "walk and yoga should be separate"): the day's yoga (Strength at home on a strength day) is a
       step of its own, done by finishing it or by her answer in the check-in. The walk is the rest of the day's minutes (10 at
       least), done by walking minutes, not the yoga's, so the week's minutes still grow as the plan intends. */
    'yoga.cycle': (d, c, x, st) => { const tp = c.tp; const R0 = c.lg.r || []; const did = tp.str ? (R0.indexOf('strength') >= 0 || !!c.lg.str) : R0.some((r) => r !== 'calm');
      return [{ id: 'yoga', icon: ICO.yoga, hue: 'plum', kind: 'routine', r: tp.routine, title: tf('plan_a_r', { r: rName(tp.routine), n: routineMins(tp.routine, d) }), name: t('plan_r_d'), sub: '', go: 'plan-r-' + tp.routine, state: st('yoga', did), why: tp.str ? 'plan_fb_str' : 'plan_fb_move_g' }]; },
    'walk.cycle': (d, c, x, st) => { const tp = c.tp; const n = tp.light ? tp.walk : Math.max(10, Math.ceil((tp.walk - routineMins(tp.routine, d)) / 5) * 5); const mv = walkStep(d, c, n, 'plan_fb_move', st);
      mv.walk = true; mv.title = tf('plan_a_walk', { n: n }); mv.state = st('move', (c.lg.min || 0) - (c.lg.rmin || 0) >= n); return [mv]; },
    plate: (d, c, x, st) => { const hb = habitsOf(d, c.tp.wk); let h = hb[hb.length - 1]; let back = false;
      const pd = planDayAt(d, c.day); const nw = h; if (hb.length >= 2 && (pd - 1) % 7 === 4) { h = stillPick(d, Math.floor((pd - 1) / 7) + 1) || h; back = true; }   /* Version 39.9 */
      const th = !!h && h.id === 'half' && c.day === todayISO() && !!d.thali && d.thali.d === c.day && (d.thali.on || []).indexOf('veg') >= 0;   /* Version 39.12 (gap 3): her plate counts */
      return h ? [{ id: 'food', icon: ICO.plate, hue: 'green', kind: 'habit', habit: h.id, title: back ? tf('plan_a_still', { h: lowFirst(tx(h.h)) }) : tx(h.h), name: tx(nw.h), sub: t('plan_meal_' + (MEAL_AS[h.id] || h.id)), go: 'plan-plate', state: st('food', !!(c.lg.plate || {})[h.id] || th), why: h.why || x.why }] : []; },
    bed: (d, c, x, st) => {
      if (d.work === 'night') return [{ id: 'sleep', icon: S.icon('moon'), hue: 'purple', kind: 'tick', title: t('plan_a_shift'), sub: t('plan_a_shift_s'), go: 'plan', state: st('sleep'), why: 'plan_fb_sleep' }];
      const bt = bedTarget(d, c.day); if (!bt) return [];
      const a = { id: 'sleep', icon: S.icon('moon'), hue: 'purple', kind: 'tick', title: tf('plan_a_bed', { t: clockOf(bt) }), sub: t('plan_a_bed_s'), go: 'plan', state: st('sleep'), why: 'plan_fb_sleep', bed: bedTarget(d, S.toISO(S.addDays(S.fromISO(c.day), -1))) || bt };
      /* Version 39.22 (Mohit, 27 Oct: "make meditation part of plan"): the bedtime step winds down with Dr. Megha first, tonight's
         session chosen from her day; one she played for 30 seconds that day counts the step, as a tick at bedtime does */
      const wp = windPick(d, c.day); if (wp) { const wd = S.calm.doneOn(c.day); Object.assign(a, { title: tf('plan_a_wind', { t: clockOf(bt) }), sub: tf('plan_a_wind_s', { s: S.calm.short(wp) }), subT: tf('plan_a_wind_t', { s: S.calm.short(wp) }), titleT: tf('plan_a_bed', { t: clockOf(bt) }), how: t('plan_a_wind_how'), play: 'calm-' + wp, playMin: S.calm.mins(wp), state: st('sleep', !!wd), wound: wd ? wd.id : null }); }
      return [a];   /* Version 39.12: bed, last night's target */
    },
    /* Version 38 (ux-gaps E4): the 21 iron days fit what she eats; after them, one iron food a day, from her own food.
       Version 39.3 (diet audit 2.4): an iron step opens My food (her iron foods and the reviewed page) */
    'journey.iron': (d, c, x, st) => {
      const n = planDayAt(d, c.day); const fo = simpleFood(d); const dt = S.food ? S.food.diet() : { type: fo, milk: true };
      const j = n <= 21 ? (S.journey && S.journey.step('iron', n, { food: fo, preg: pregnant(), jain: dt.type === 'jain', nomilk: dt.milk === false })) : ironRot(d, c, fo);   /* review FOOD-01, FOOD-03; Version 39.9: after the 21 days, a rotation */
      return j ? [{ id: 'iron', icon: S.icon('leaf'), hue: 'green', kind: 'tick', title: j.t, name: n > 21 ? t('plan_a_ironf') : null, sub: j.p, go: j.go || (S.routeOwner('food') ? 'food' : 'plan'), state: st('iron'), why: 'plan_fb_iron', priv: true }] : [];
    },
    /* Version 38 (ux-gaps E1): what her pregnancy plan has due now comes first (preg.js S.preg.plan) */
    'preg.due': (d, c, x, st) => { const due = (S.preg && S.preg.plan ? S.preg.plan.due() : []).filter((y) => y.id !== 'asha' || !(S.care && S.care.gov && S.care.gov()));   /* Mohit, 26 Oct: My ASHA stays off Today and My plan; Version 39.40: on her doctor's route it is her doctor's and ambulance numbers */ return due.length ? [{ id: 'pdue', icon: S.icon('check'), hue: 'orange', kind: 'link', title: due.length > 1 ? tf('plan_a_due_more', { x: due[0].name, n: due.length - 1 }) : tf('plan_a_due', { x: due[0].name }), sub: t('plan_a_due_s'), go: 'preg-plan', state: st('pdue'), why: 'plan_fb_due', priv: true, soft: true }] : []; },   /* Version 39.37: soft */
    /* Version 38 (ux-gaps E2): until 6 weeks, the daily recovery check and its danger signs, done only by doing it (S.post.checkedOn) */
    'post.rcheck': (d, c) => [{ id: 'rcheck', icon: S.icon('check'), hue: 'rose', kind: 'check', title: tileTitle('post-recovery'), sub: t('plan_a_rcheck_s'), go: 'post-recovery', state: recDone(c.day) ? 'd' : null, why: 'plan_fb_recov', priv: true }],
    /* Version 39.46: after the birth, her squeezes by her days: 5 gentle ones to day 13 (during a feed, or lying or sitting), then 10
       and the knack. Done here or in the pelvic floor trainer (S.post.pelvicOn). */
    'post.pf': (d, c, x, st) => { const n = bDays(c.day); const e2 = n != null && n <= 13; const feed = !!(S.state.situation || {}).breastfeeding && !died();
      return [{ id: 'pelvic', icon: S.icon('flower'), hue: 'plum', kind: 'tick', title: t(e2 ? 'plan_a_pf5' : 'plan_a_pf10'), name: t('plan_a_pf'), sub: t(e2 ? (feed ? 'plan_a_pf5_s' : 'plan_a_pf5_s0') : 'plan_a_pf10_s'), go: 'post-pelvic', state: st('pelvic', !!(S.post && S.post.pelvicOn && S.post.pelvicOn(c.day))), why: 'plan_fb_pelvic', priv: true }]; },
    /* Version 39.9 (diet audit 2): for 40+ bones, a calcium food on its days, from her region and how she eats */
    'food.calcium': (d, c, x, st) => { const xs = S.food && S.food.pick ? S.food.pick('c', { region: regionOf(d) }).slice(0, 7) : []; if (!xs.length) return [];
      const pd = planDayAt(d, c.day) - 1; const ds = /^days:/.test(x.when || '') ? x.when.slice(5).split(',').map(Number) : [0, 1, 2, 3, 4, 5, 6];
      const f = xs[(Math.floor(pd / 7) * ds.length + Math.max(0, ds.indexOf(pd % 7))) % xs.length];   /* V39.9 review FOOD-07: her calcium days in turn, so a week doesn't repeat */
      return [{ id: 'ca', icon: ICO.drink, hue: 'gold', kind: 'tick', title: tf('plan_a_ca', { x: S.food.name(f) }), name: t('plan_a_ca_s'), sub: t('plan_a_ca_s'), go: x.go || (S.routeOwner('meno-bones') ? 'meno-bones' : 'food'), state: st('ca'), why: x.why || 'plan_fb_any', how: '', priv: true }]; },   /* Version 39.51: no How that repeats its subtitle */
    /* Version 39.9 (diet audit 2): the pregnancy plan's food step changes with her trimester, from the pregnancy food page's
       reviewed lines (preg.js S.preg.foodTip) */
    'preg.food': (d, c, x, st) => { const pi = S.preg && S.preg.info ? S.preg.info() : null;
      const w = pi && pi.days != null ? Math.floor((pi.days + S.diffDays(pToday(), S.fromISO(c.day))) / 7) : (pi ? pi.weeks : null);   /* V39.9 review FOOD-06: that day's week */
      const tip = w != null && S.preg.foodTip ? S.preg.foodTip(w) : null;
      return [{ id: 'food', icon: ICO.plate, hue: 'green', kind: 'tick', title: tip ? tf('plan_a_pfood', { x: tip.t }) : tileTitle('preg-diet'), name: tileTitle('preg-diet'), sub: tip ? tip.p : '', go: 'preg-diet', state: st('food'), why: 'plan_fb_any', priv: true }]; },
    /* Version 39.32 (packet D1 to D16): the Getting ready plan's own steps, kept by ttc.js. Her tablet every day (where to get it
       until she has it, done on its page, so the check-in doesn't ask; "My tablet" in discreet mode); her Hb test from day 2 to day 14 until she ticks it on her checklist; the
       1-minute ready check when it is due; the calm few minutes in the week before her period, from week 8, if she switched it on. */
    'ttc.folic': (d, c, x, st) => { const F = S.ttc && S.ttc.folic; if (!F) return []; const has = F.has(); const nm = t(disc() ? 'plan_a_folic_d' : 'plan_a_folic');
      return [{ id: 'folic', icon: S.icon('pill'), hue: 'rose', kind: has ? 'tick' : 'check', title: nm, name: nm, sub: has ? '' : t('plan_a_folic_get'), go: 'ttc-folic', state: has ? st('folic') : (F.askedOn() === c.day ? 'n' : null), why: 'plan_fb_folic', ciAsk: !has && F.askedOn() !== c.day, noPart: true }   /* Version 39.57: her check-in asks it (Done means she has them), unless she said "Not yet" on its page today */]; },
    'ttc.hb': (d, c) => { const T2 = S.ttc; if (!T2 || !T2.prepHas) return []; const pd = planDayAt(d, c.day); const at = T2.prepAt('hb');
      if (pd < 2 || pd > 14 || (T2.prepHas('hb') && at !== c.day)) return [];
      return [{ id: 'hb', icon: S.icon('drop'), hue: 'rose', kind: 'check', title: t('plan_a_hb'), sub: t('plan_a_hb_s'), go: 'ttc-prep', state: at === c.day ? 'd' : null, why: 'plan_fb_hb', priv: true, soft: true }]; },   /* Version 39.47: a test waits for her visit, as "Due now" */
    'ttc.ready': (d, c) => { const R2 = S.ttc && S.ttc.ready; if (!R2) return []; const last = R2.last(); if (last !== c.day && !readyDue(d, c.day, last)) return [];
      return [{ id: 'ready', icon: S.icon('chart'), hue: 'sky', kind: 'check', title: t('plan_a_ready'), sub: t('plan_a_ready_s'), go: 'ttc-ready', state: last === c.day ? 'd' : null, why: 'plan_fb_ready', priv: true }]; },
    /* his part, once a week from week 2 (the 6th day of her plan week), opening the partner page; never on a shared phone */
    'ttc.his': (d, c, x, st) => { if (disc() || (S.state.settings || {}).shared || weekAt(d, c.day) < 2 || (planDayAt(d, c.day) - 1) % 7 !== 5 || !S.routeOwner('ttc-partner')) return [];
      return [{ id: 'his', icon: S.icon('users'), hue: 'sky', kind: 'tick', title: t('plan_a_his'), name: t('plan_a_his'), sub: '', go: 'ttc-partner', state: st('his'), why: 'plan_fb_his', priv: true }]; },
    'ttc.calm': (d, c, x, st) => { if (!S.ttc || !S.ttc.calmOn || !S.ttc.calmOn() || weekAt(d, c.day) < 8 || !calmWeekAt(c.day)) return []; const did = (c.lg.r || []).indexOf('calm') >= 0;
      return [{ id: 'calm', icon: ICO.yoga, hue: 'sky', kind: 'routine', r: 'calm', title: tf('plan_a_r', { r: rName('calm'), n: routineMins('calm', d) }), name: rName('calm'), sub: '', go: 'plan-r-calm', state: st('calm', did), why: 'plan_fb_bcalm' }]; },
    /* Version 39.51: the midlife plan's skill of the day: the chapter's practice or Rest's sleep rule (a tick that opens the
       chapter), Strong and steady's balance routine; in her year, the skill of her first part */
    'meno.skill': (d, c, x, st) => { const ML = S.midlife && S.midlife.lesson; if (!ML || !menoV2(d)) return []; const id = m2Skill(d, c.day); if (!id) return []; const p = id.charAt(0);
      if (p === 's') { const did = (c.lg.r || []).indexOf('steady') >= 0; return [{ id: 'skill', icon: ICO.move, hue: 'gold', kind: 'routine', r: 'steady', title: tf('plan_a_r', { r: rName('steady'), n: routineMins('steady', d) }), name: rName('steady'), sub: '', go: 'plan-r-steady', state: st('skill', did), why: 'plan_fb_m2s' }]; }
      return [{ id: 'skill', icon: S.icon(p === 'r' ? 'moon' : 'sparkle'), hue: p === 'r' ? 'purple' : 'plum', kind: 'tick', title: tf('plan_m2_skill', { s: ML.skill(id) }), name: t('plan_m2_skill_n'), sub: m2Part(d, c.day) === 'k' ? tf('plan_m2_keep_s', { p: ML.part(p) }) : t(p === 'r' ? 'plan_m2_rule_s' : 'plan_m2_skill_s'), go: 'mid-lesson', state: st('skill'), why: 'plan_fb_m2' + p, how: ML.how ? ML.how(id) : undefined, priv: p !== 'r' }]; }   /* Version 39.51: its How, the chapter's own skill */
  };
  /* the day's steps from her plan's spec: { id, icon, hue, kind: 'minutes' | 'habit' | 'routine' | 'tick' | 'link' | 'check',
     title, sub, go, state: 'd' | 'p' | 'n' | null, why }. Another day (iso: yesterday) gets that day's week, weekday and log. */
  /* Version 39.5 review (ENGINE-02, PAGES-12): her plan's steps on a day as written in the spec (not made), for counting a day
     she did a step in its own tool, and for the hold rule */
  function specFlat(d, iso) {
    const sp = packOf(d) ? specD(d) : null; if (!sp) return [];
    const c = { d: d, day: iso || todayISO(), goal: d.goalKey, ik: ikOf(d), go: null }; const out = [];
    const ok = (x) => { c.go = x.go || null; return progWhen(x.when, c) && progIf(x.if, c); };
    const walk = (list) => (list || []).forEach((x) => { if (x.first) { const f = x.first.find(ok); if (f) out.push(f); return; } if (x.goal) { walk(x.goal[d.goalKey] || x.goal['*']); return; } if (ok(x)) out.push(x); });
    walk(sp.steps); return out;
  }
  /* review PAGES-06: the trying plan's checklist step rests once every item is ticked */
  const allDone = (f, day) => { if (f !== 'ttc-prep' || !(S.ttc && S.ttc.prepDone)) return false; const p = S.ttc.prepDone(); if (!(p && p.b && p.a >= p.b)) return false;
    const last = S.ttc.prepLast ? S.ttc.prepLast() : null; return !last || !day || last < day; };   /* review FIXES-10: past days keep their step */
  function stepsFor(d, iso) {
    const pk = packOf(d); const sp = pk ? specD(d) : null; if (!sp) return [];
    const day = iso || todayISO(); const lg = dayLog(d, day); const ck = lg.ck || {}; const R0 = lg.r || [];
    const c = { d: d, day: day, lg: lg, goal: d.goalKey, ik: ikOf(d), tp: todayPlan(d, day), go: null };
    const st = (id, auto) => ck[id] || (auto ? 'd' : null);
    const often = (x, a) => { if (/^days:/.test(x.when || '')) a.forEach((y) => { y.every = x.when.slice(5).split(',').length; }); if (PI_WIN[x.when]) a.forEach((y) => { y.win = x.when; }); return a; };   /* V39.9 review FOOD-06: "3 days a week"; Version 39.55: "On your period days" */
    const make = (x) => {
      c.go = x.go || null; if (!progWhen(x.when, c) || !progIf(x.if, c)) return [];
      if (x.kind === 'adapter') return often(x, (ADAPT[x.use] && ADAPT[x.use](d, c, x, st)) || []);
      if (x.kind === 'minutes') { const ws = walkStep(d, c, minsOf(x, d, c), x.why, st); if (x.sub && !d.when) ws.sub = t(String(x.sub).replace(/^@/, '')); return often(x, [ws]); }   /* Version 39.55: "3 days a week" for a walk too */   /* Version 39.34: its own line (an easy walk) */
      const r = (/^plan-r-(.+)$/.exec(x.go) || [])[1];
      return often(x, [Object.assign({ id: x.id, icon: progIco(x.icon), hue: x.hue, kind: x.kind || 'tick', r: r, title: ptx(x.title, x.go), sub: x.sub && !(disc() && x.when === 'periodDays') ? ptx(x.sub) : '', go: x.go, at: x.at || null, state: st(x.id, x.kind === 'routine' && R0.indexOf(r) >= 0), why: x.why, priv: !!x.priv },
        x.play ? { play: x.go, playMin: S.relief && S.relief.mins && /^relief-/.test(x.go || '') ? S.relief.mins(x.go.slice(7)) : (x.go === 'post-pelvic' ? 2 : 3), playDay: true } : {})]);   /* Version 39.55 (the phone test): her kit plays the cramps routine */
    };
    const one = (x) => { if (x.from && allDone(x.from, day)) return []; const a = make(x); if (x.once) { const lg2 = (dd) => (dayLog(d, S.toISO(S.addDays(S.fromISO(day), -dd))).ck || {})[x.id]; for (let i = 1; i <= 7; i++) if (lg2(i) === 'd') { a.forEach((y) => { y.state = 'd'; }); break; } a.forEach((y) => { y.once = true; }); }   /* review PAGES-05: a one-time step stays done */
      if (x.from) { const dn = fromDone(x.from, day); a.forEach((y) => { if (x.check) { y.kind = 'check'; y.state = dn ? 'd' : null; } else if (dn && y.state !== 'd') y.state = 'd'; }); }   /* Version 39.57: done in its tool beats a partly answer */ return a; };
    const out = [];
    const walkList = (list) => (list || []).forEach((x) => {
      if (x.first) { for (let i = 0; i < x.first.length; i++) { const a = one(x.first[i]); if (a.length) { out.push.apply(out, a); break; } } return; }
      if (x.goal) { walkList(x.goal[d.goalKey] || x.goal['*']); return; }
      out.push.apply(out, one(x));
    });
    walkList(sp.steps);
    let list = out; const max = (sp.slots && sp.slots.day1 && planDayAt(d, day) === 1 ? sp.slots.day1 : 0) || (sp.slots && sp.slots.max) || 3;   /* Version 39.55: day 1 at 3 at most */
    if (fastOn(d, day)) { const i = out.findIndex((a) => FOOD_IDS.indexOf(a.id) >= 0); if (i >= 0) list = out.map((a, j) => (j === i ? fastStep(st) : a)).filter((a) => FOOD_IDS.indexOf(a.id) < 0);   /* Version 39.9 */
      else if (out.length && fastCare()) { list = out.slice(0, max); if (list.length < max) list.push(fastStep(st)); else { let k = -1; for (let j = list.length - 1; j >= 0; j--) if (SAFE.indexOf(list[j].id) < 0) { k = j; break; } if (k >= 0) list[k] = fastStep(st); } } }   /* V39.9 review FOOD-01: never in place of a safety step */
    if (lightOn(d, day)) { const pref = (a) => (['move', 'food'].indexOf(a.id) >= 0 ? 0 : 1); const pick = list.filter((a) => SAFE.indexOf(a.id) < 0).sort((a, b) => pref(a) - pref(b)).slice(0, Math.max(0, 2 - list.filter((a) => SAFE.indexOf(a.id) >= 0).length)); list = list.filter((a) => SAFE.indexOf(a.id) >= 0 || pick.indexOf(a) >= 0); }   /* Version 39.12; 39.13: her walk and food habit */
    list = list.slice(0, max);
    if (postV2(d)) { const rc = list.filter((a) => a.id === 'rcheck'); if (rc.length) list = list.filter((a) => a.id !== 'rcheck').concat(rc); }   /* Version 39.46: her evening check last, as she lives her evening */
    return list;
  }
  /* her plan for a goal: the first plan whose goals match her stage and goal (web/progs/v1.js's order) */
  const packFor = (goal, st) => { if (!goal || goal === 'track') return null; const p = progs().find((x) => (x.goals || []).some((g) => (!g.stage || g.stage === st) && (!g.goal || g.goal === goal))); return p && !(p.id === 'meno' && poiHold()) ? p.id : null; };   /* Version 39.51: periods stopped before 40 see a gynaecologist first */
  /* her active plan. The V35 plan has no pack: it is the cycle plan. A pregnancy plan ends with the pregnancy, and an after-birth
     plan a year after the birth. */
  function packOf(d) {
    if (!d || !d.start || d.start > todayISO()) return null; const pk = d.pack || 'cycle'; const sp = specOf(pk, d.pv); if (!sp) return null;
    const lf = sp.life || {};
    if (lf.needs === 'pregnant' && !pregnant()) return null;
    if (lf.ends === 'pregnant' && pregnant()) return null;   /* Version 38: getting ready ends with the pregnancy (it doesn't pause) */
    if (/^birth:\d+$/.test(lf.needs || '')) { const b = (S.state.situation || {}).deliveredOn; if (!b || pregnant() || S.diffDays(S.fromISO(b), pToday()) > +lf.needs.slice(6)) return null; }
    return pk;
  }
  const fullD = (d) => Object.assign({ log: {}, weeks: {}, body: [] }, d);
  const kv2 = (x) => { const i = String(x).indexOf(':'); return [String(x).slice(0, i), String(x).slice(i + 1)]; };
  const planDay = (d) => S.diffDays(S.fromISO(d.start), pToday()) + 1;
  const planDayAt = (d, iso) => S.diffDays(S.fromISO(d.start), S.fromISO(iso)) + 1;
  /* Version 38 (ux-gaps C2): the pregnancy and after-birth plans follow her own weeks, not "of 12" */
  const ownWeek = (d) => { if (disc()) return ''; const ck = (specD(d) || {}).clock;
    if (ck === 'pregWeek') { const pi = S.preg && S.preg.info ? S.preg.info() : null; return pi ? tf('plan_wk_preg', { n: pi.weeks }) : ''; }
    if (ck === 'birthWeek') { const b = (S.state.situation || {}).deliveredOn; return b ? tf('plan_wk_post', { n: Math.floor(S.diffDays(S.fromISO(b), pToday()) / 7) + 1 }) : ''; } return ''; };
  /* the cycle and light plans pause in pregnancy and for the first 6 weeks after a birth (the pregnancy and after-birth plans don't) */
  /* review life-1: a plan started on or after the day her pregnancy ended isn't paused by it (it used to fall through to 'loss') */
  const pausedFor = (d) => { const pk = packOf(d); if (!pk) return null; if (pk === 'meno' && poiHold()) return 'poi';   /* Version 39.51 (Mohit's phone test): under 40 with her periods stopped, her doctor first */
    const w = pauseWhy(); if (!w || (((specD(d) || {}).life || {}).pause || []).indexOf(w) < 0) return null;
    if (w === 'loss') return d && d.start && d.started && d.started >= ((S.state.situation || {}).pregEndedOn || '') ? null : 'loss'; return w; };
  function packTitle(d) {
    const pk = packOf(d) || (d && d.pack) || 'cycle'; const sp = specOf(pk, d && d.pv);
    if (disc() || (sp && sp.sensitive)) return ptx((sp && sp.discreetTitle) || '@plan_h_d');
    const r = sp ? (sp.title || []).find((x) => progIf(x.if, { goal: d && d.goalKey, day: todayISO() })) : null;
    return r ? ptx(r.text) : t('plan_h');
  }
  const nowHM = () => { const n = new Date(); return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); };
  /* "11:30 pm" / "रात 11:30" */
  const clockOf = (hm) => { const h = +hm.slice(0, 2), m = hm.slice(3); const h12 = (h % 12) || 12;
    if (S.state.lang === 'hi') return 'रात ' + h12 + (m !== '00' ? ':' + m : ' बजे');
    return h === 0 && m === '00' ? 'midnight' : h12 + (m !== '00' ? ':' + m : '') + (h >= 12 ? ' pm' : ' am'); };
  const timeOf = (hm) => { const h = +String(hm || '20:00').slice(0, 2), m = String(hm || '20:00').slice(3, 5); const h12 = (h % 12) || 12;
    if (S.state.lang === 'hi') return (h < 12 ? 'सुबह' : (h < 16 ? 'दोपहर' : (h < 19 ? 'शाम' : 'रात'))) + ' ' + h12 + (m !== '00' ? ':' + m : ' बजे');
    return h12 + (m !== '00' ? ':' + m : '') + (h >= 12 ? ' pm' : ' am'); };
  const periodToday = (iso) => { try { const k = (S.cycle.bleedingDays() || {})[iso || todayISO()]; return k === 'start' || k === 'bleed'; } catch (e) { return false; } };

  /* ---------- the intake: the screens after her stage, for her goal ---------- */
  /* Version 39.4: the screens come from her plan's spec (intake.screens, intake.when): her goal; its own questions; her day;
     when she can move (plans with moves); her body (Version 39.3: only for a weight goal; My body takes it any time); and,
     Version 37.1, what she told Sakhi, to check before her plan is made */
  /* Version 39.36 (Mohit's walkthrough, 29 Oct): "Your day" only when it asks something My food doesn't already hold */
  /* Version 39.66 (plan questions on their day; the advice's phase C, the minimalist baseline: ask on the day it changes something):
     before Start, "Your day" asks only the midlife plan's safety questions (weak bones, chest pain when she walks). How active
     she is, how she eats, milk, her knees or back, her bedtime and her day wait for the first day a step uses them (dayQKey).
     Change on the summary's Your day row still shows them all. */
  const DAY_NOW = ['mbone', 'mheart'];
  const dayWait = (d) => (d && Array.isArray(d.dayAsk) ? d.dayAsk : []);   /* what still waits for its day: its default isn't her answer */
  const qsAsk = (id, a) => (id === 'day' && !a.dayShow ? qsOf('day', a).filter((k) => DAY_NOW.indexOf(k) >= 0) : qsOf(id, a));   /* dayShow: "Change" on Your day itself */
  const daySkip = (a) => { if (a.dayShow) return false; const fk = !!(S.food && S.food.known && S.food.known()); const kn = a.known || []; const q = qsOf('day', a); return q.length > 0 && q.every((k) => kn.indexOf(k) >= 0 || (fk && (k === 'food' || k === 'milk'))); };   /* Version 39.46: or answers she gave before */
  const dayFill = (a) => { if (a.food == null && S.food && S.food.known && S.food.known()) { const dd = S.food.diet(); a.food = dd.type; if (a.milk == null) a.milk = dd.milk ? 'y' : 'n'; } };
  /* Version 39.51 (Mohit's phone test, 31 Oct): her time to move comes from the plan she is on, so a new plan doesn't ask it
     again; Change on the summary asks it */
  const whenRun = () => { const d0 = raw(); return d0 && d0.start && d0.when && Q.when[1].some((o) => o[0] === d0.when) ? d0.when : null; };
  const asksWhen = (a) => { const pk = packFor(a.goal, a.stage); const sp = pk ? specOf(pk) : null; const ik = (sp && sp.intake) || {}; return ik.when === true || (Array.isArray(ik.when) && progIf(ik.when, { goal: a.goal, day: todayISO() })); };
  const whenFill = (a) => { if (a.when == null && asksWhen(a)) { const w = whenRun(); if (w) a.when = w; } };
  function screensOf(a) {
    const pk = packFor(a.goal, a.stage); const sp = pk ? specOf(pk) : null; const out = ['goal']; if (!sp) return out;
    const ik = sp.intake || {}; const c = { goal: a.goal, day: todayISO() };
    (ik.screens || []).forEach((x) => { if (progIf(x.if, c)) out.push(x.id); });
    if (!daySkip(a) && qsAsk('day', a).length) out.push('day');   /* Version 39.56: a plan that asks nothing about her day has no Your day */ if ((ik.when === true || (Array.isArray(ik.when) && progIf(ik.when, c))) && (a.whenShow || !whenRun())) out.push('when');   /* Version 39.51: not again while a plan holds it */
    if (a.goal === 'weight') out.push('body'); return out;   /* Version 39.61: from joining, the one-page plan has Change my answers; Version 39.68 (the doctors' review): no "Here's what you told Sakhi" before any plan, her last answer makes it */
  }
  /* her goals now: no "heavy periods" once her periods have stopped (bleeding after that needs a doctor, not a plan) */
  const goalsFor = (a) => GOALS[stKey(a.stage)].filter((k) => !(k === 'heavy' && (a.stopped || (S.state.situation || {}).stopped)));
  /* what each screen asks: [answer key, label key, options [value, label key]] ("multi" lists take several) */
  const Q = {
    gap: ['plan_in_gap', [['lt21', 'plan_gap_lt21'], ['n', 'plan_gap_n'], ['g45', 'plan_gap_g45'], ['g60', 'plan_gap_g60'], ['gt60', 'plan_gap_gt60'], ['vary', 'plan_gap_vary']]],
    skips: ['plan_in_skips', [['y', 'plan_yes'], ['n', 'plan_no']]],
    dx: ['plan_in_dx', [['y', 'plan_yes'], ['n', 'plan_no'], ['ns', 'plan_dx_ns']]],
    signs: ['plan_in_signs', [['hair', 'plan_sg_hair'], ['acne', 'plan_sg_acne'], ['thin', 'plan_sg_thin'], ['neck', 'plan_sg_neck'], ['none', 'plan_sg_none']], 'multi'],
    pain: ['plan_in_pain', [['mild', 'plan_pn_mild'], ['pk', 'plan_pn_pk'], ['stop', 'plan_pn_stop']]],
    painDays: ['plan_in_pdays', [['1', 'plan_pd_1'], ['23', 'plan_pd_23'], ['4', 'plan_pd_4']]],
    pads: ['plan_in_pads', [['p4', 'plan_pa_4'], ['p23', 'plan_pa_23'], ['p12', 'plan_pa_12']]],
    clots: ['plan_in_clots', [['y', 'plan_yes'], ['n', 'plan_no']]],
    tired: ['plan_in_tired', [['y', 'plan_yes'], ['n', 'plan_no']]],
    pms: ['plan_in_pms', [['mood', 'plan_pm_mood'], ['irr', 'plan_pm_irr'], ['anx', 'plan_pm_anx'], ['bloat', 'plan_pm_bloat'], ['breast', 'plan_pm_breast'], ['head', 'plan_pm_head'], ['crave', 'plan_pm_crave']], 'multi'],
    pmsLevel: ['plan_in_pmsl', [['little', 'plan_pl_little'], ['lot', 'plan_pl_lot']]],
    pft: ['plan_in_pft', [['stress', 'plan_pft_stress'], ['urge', 'plan_pft_urge'], ['both', 'plan_pft_both'], ['heavy', 'plan_pft_heavy'], ['ns', 'plan_dx_ns']]],   /* Version 39.56 */
    pfway: ['plan_in_pfway', [['0', 'plan_pw_0'], ['1', 'plan_pw_1'], ['2', 'plan_pw_2'], ['3', 'plan_pw_3']]],
    endo: ['plan_in_endo', [['y', 'plan_yes'], ['n', 'plan_no']]],   /* Version 39.55: a doctor's diagnosis opens the endometriosis swaps */
    act: ['plan_s_level', [['0', 'plan_lv_0'], ['1', 'plan_lv_1'], ['2', 'plan_lv_2']]],
    food: ['plan_s_food', [['veg', 'plan_f_veg'], ['egg', 'plan_f_egg'], ['nonveg', 'plan_f_nonveg'], ['jain', 'plan_f_jain']]],
    milk: ['plan_in_milk', [['y', 'plan_yes'], ['n', 'plan_no']]],
    lim: ['plan_s_lim', [['none', 'plan_lim_none'], ['knees', 'plan_lim_knees'], ['back', 'plan_lim_back']], 'multi'],
    mbone: ['plan_in_mbone', [['y', 'plan_yes'], ['n', 'plan_no'], ['ns', 'plan_dx_ns']]],   /* Version 39.51: the midlife plan's moves */
    mheart: ['plan_in_mheart', [['y', 'plan_yes'], ['n', 'plan_no']]],
    bed: ['plan_in_bed', [['b22', 'plan_bd_22'], ['b23', 'plan_bd_23'], ['b24', 'plan_bd_24'], ['late', 'plan_bd_late']]],
    work: ['plan_in_work', [['day', 'plan_wk_day'], ['night', 'plan_wk_night'], ['home', 'plan_wk_home']]],
    trying: ['plan_in_trying', [['no', 'plan_tr_no'], ['lt6', 'plan_tr_lt6'], ['m6', 'plan_tr_m6'], ['gt12', 'plan_tr_gt12']]],   /* Version 39.32 (packet B18) */
    remind: ['plan_in_rem', [['08:00', 'plan_rm_08'], ['13:00', 'plan_rm_13'], ['18:00', 'plan_rm_18'], ['20:00', 'plan_rm_20'], ['21:00', 'plan_rm_21']]],
    when: ['plan_in_when_h', [['morning', 'plan_w_morning'], ['breakfast', 'plan_w_breakfast'], ['lunch', 'plan_w_lunch'], ['evening', 'plan_w_evening'], ['dinner', 'plan_w_dinner']]]
  };
  /* the questions on a screen, for her answers so far */
  function qsOf(id, a) {
    const pk = packFor(a.goal, a.stage);
    if (id === 'cyc') return ['gap', 'skips'].concat(a.goal === 'pmos' ? [] : ['dx'], ['signs']);
    if (id === 'pain') return ['pain', 'painDays'];
    if (id === 'heavy') return ['pads', 'clots', 'tired'];
    if (id === 'pms') return ['pms', 'pmsLevel'];
    if (id === 'pftrack') return ['pft', 'pfway'];   /* Version 39.56 */
    if (id === 'pain2') return ['pain', 'painDays', 'endo'];   /* Version 39.55 */
    /* Version 39.3: how she eats for every plan; activity where her steps use it; bedtime and work where sleep is a step */
    /* Version 39.3 (journey audit P2-21): her knees or back where the plan has moves, so they can be swapped */
    if (id === 'day') { const sp = specOf(pk); return sp ? ((sp.intake || {}).day || []).slice() : ['act', 'food', 'milk', 'bed', 'work']; }   /* Version 39.4: from her plan's spec */
    return [];
  }
  const SCREEN_H = { baby: ['plan_in_baby_h', 'plan_in_baby_p'], cyc: ['plan_in_cyc_h', 'plan_in_now_p'], pain: ['plan_in_pain_h', 'plan_in_now_p'], pain2: ['plan_in_pain_h', 'plan_in_now_p'], heavy: ['plan_in_heavy_h', 'plan_in_now_p'], pms: ['plan_in_pms_h', 'plan_in_now_p'], pftrack: ['plan_in_pf_h', 'plan_in_now_p'], day: ['plan_in_day_h', 'plan_in_day_p'] };
  /* the summary's rows: [label, what she said, the screen that asks it] */
  function sumRows(a) {
    const pk = packFor(a.goal, a.stage); const l = screensOf(a); const rows = [[t('plan_in_sum_goal'), goalName(a.goal), 'goal']];
    if (l.indexOf('baby') >= 0) { const fl = Array.isArray(a.bflags) ? a.bflags : []; const fls = S.ttc && S.ttc.flagList ? S.ttc.flagList() : []; const nm = (k) => (BMEDS.indexOf(k) >= 0 ? t('plan_bf_' + k) : tx(fls.find((f) => f.k === k) || { en: k, hi: k }));
      const ord = BMEDS.concat(fls.map((f) => f.k)).filter((k) => fl.indexOf(k) >= 0);   /* in the screen's order */
      rows.push([t('plan_in_baby_h'), ord.length ? ord.map(nm).join(' · ') : t('plan_sg_none'), 'baby']); if (a.trying) rows.push([t('plan_in_trying'), t('plan_tr_' + a.trying), 'baby']); }   /* Version 39.32 */
    if (l.indexOf('pftrack') >= 0 && a.pft) rows.push([t('plan_in_pft'), t(a.pft === 'ns' ? 'plan_dx_ns' : 'plan_pft_' + a.pft) + (a.pfway != null ? ' · ' + t('plan_pw_' + a.pfway) : ''), 'pftrack']);   /* Version 39.56 */
    if (l.indexOf('pfsafe') >= 0) { const fl = (a.pfflags || []).filter((k) => PFS.indexOf(k) >= 0); rows.push([t('plan_ps_h'), fl.length ? fl.map((k) => t('plan_pfs_' + k)).join(' · ') : t('plan_sg_none'), 'pfsafe']); }
    if (l.indexOf('psafe') >= 0) rows.push([t('plan_ps_h'), t(a.pnow === 'y' ? 'plan_ps_t_now' : 'plan_ps_t_' + psTier(a.pflags, gwAt(todayISO()))), 'psafe']);   /* Version 39.34 */
    const sym = ['cyc', 'pain', 'pain2', 'heavy', 'pms'].find((x) => l.indexOf(x) >= 0); const now = nowLineOf(ikOfAnswers(a), pk);
    if (sym && now) rows.push([t('plan_in_sum_now'), now, sym]);
    if (l.indexOf('day') >= 0 || daySkip(a) || dayHeld(a)) { dayFill(a);   /* Version 39.36; Version 39.66: or what her plan before holds, to change */
      const q = qsOf('day', a); const bedK = a.bed ? 'plan_bd_' + (a.bed === 'late' ? 'late' : a.bed.slice(1)) : null;
      const bits = [q.indexOf('act') >= 0 && a.act != null ? t('plan_lv_' + a.act) : null, q.indexOf('food') >= 0 && a.food ? t('plan_f_' + a.food) : null, bedK ? t(bedK) : null, a.work ? t('plan_wk_' + a.work) : null, a.mbone === 'y' ? t('plan_m2_sum_bone') : null, a.mheart === 'y' ? t('plan_m2_sum_heart') : null].filter(Boolean);
      if (bits.length) rows.push([t('plan_in_day_h'), bits.join(' · '), 'day']);
    }
    if (asksWhen(a)) { whenFill(a); if (a.when) rows.push([t('plan_in_sum_when'), t('plan_w_' + a.when), 'when']); }   /* Version 39.51: asked, or from the plan she is on */
    if (l.indexOf('body') >= 0 && a.h && a.w) rows.push([t('plan_in_body_h'), num1(a.h) + ' ' + t('plan_cm') + ' · ' + num1(a.w) + ' kg', 'body']);
    return rows;
  }
  /* a warning under an answer that needs a doctor (the same rules as the diary's own) */
  const warnOf = (id, a) => ((id === 'pain' || id === 'pain2') && a.pain === 'stop' ? 'plan_rv_doc_pain' : (id === 'heavy' && (a.pads === 'p12' || a.clots === 'y') ? 'plan_rv_doc_heavy' : (id === 'day' && a.mheart === 'y' ? 'plan_m2_heart_w' : (id === 'day' && a.mbone === 'y' ? 'plan_m2_bone_w' : ''))));   /* Version 39.51: her walk and her bones */
  /* Draws intake screen a.iq into v. ctx = { head(title, p), chip(attr, val, label, on), back(fn), done(), prev(), redraw() };
     joining (core) and "What do you want to work on?" (My plan) both use it. */
  /* Version 39.3 (journey audit J-05): what her diary already says about her gaps, as an answer she can change */
  function diaryGaps() {
    if (!S.canSave() || !S.cycle || !S.cycle.usable) return null; const g = S.cycle.usable().slice(-6); if (g.length < 2) return null;
    const srt = g.slice().sort((x, y) => x - y); const m = srt[Math.floor((srt.length - 1) / 2)]; const lo = srt[0], hi = srt[srt.length - 1];
    /* review FOOD-02: the gap that is still open counts too (her last period may be months ago) */
    const ls = S.cycle.lastStart ? S.cycle.lastStart() : null; const open = ls ? S.diffDays(ls, pToday()) : 0;
    const long = open > Math.max(hi, 35); const cat = (x) => (x < 21 ? 'lt21' : (x <= 35 ? 'n' : (x <= 45 ? 'g45' : (x <= 60 ? 'g60' : 'gt60'))));
    const gap = long ? cat(open) : (hi - lo > 21 ? 'vary' : cat(m));
    return { gap: gap, skips: g.some((x) => x > 60) || open > 60 ? 'y' : 'n', n: g.length, lo: lo, hi: hi, open: long ? open : 0 };
  }
  /* Version 39.51 (Mohit's phone): what her plan before holds, so it isn't asked again; only what this screen asks (his fourth phone
     test). Version 39.66: her bedtime and her day too, and never what still waits for its day; the summary shows them, with Change. */
  function dayPre(a) {
    if (a.dayPre) return; a.dayPre = true; const d0 = raw() || {}; const ik0 = d0.intake || {}; const qd = qsOf('day', a); const asks = (k) => !!d0.start && qd.indexOf(k) >= 0 && dayWait(d0).indexOf(k) < 0;
    if (asks('act') && a.act == null) { const lv = ik0.act != null ? ik0.act : d0.level; if (lv != null) a.act = String(lv); }
    if (asks('lim') && a.lim == null) { if (Array.isArray(ik0.lim)) a.lim = ik0.lim.length ? ik0.lim.slice() : ['none']; else if (d0.limits) { const l = ['knees', 'back'].filter((k) => d0.limits[k]); a.lim = l.length ? l : ['none']; } }
    if (asks('bed') && a.bed == null && d0.bed) a.bed = d0.bed;
    if (asks('work') && a.work == null && d0.work) a.work = d0.work;
    /* Version 39.51 (Mohit's phone test): her bones and heart answers too, from the midlife plan she is on; "My doctor says I can do more" stays hers */
    if (asks('mbone') && menoV2(d0) && a.mbone == null && ['y', 'n', 'ns'].indexOf(ik0.mbone) >= 0) a.mbone = ik0.mbone;
    if (asks('mheart') && menoV2(d0) && a.mheart == null && ['y', 'n', 'ok'].indexOf(ik0.mheart) >= 0) a.mheart = ik0.mheart;
  }
  const dayHeld = (a) => { dayPre(a); const q = qsOf('day', a); return ['act', 'lim', 'bed', 'work'].some((k) => q.indexOf(k) >= 0 && a[k] != null); };   /* her answers from the plan before */
  function renderIntake(v, a, ctx) {
    const list = screensOf(a);
    /* Version 39.68 (no answers summary): when nothing is left to ask (a plan after the birth carries her answers), her plan is made */
    if (a.goal && (a.iq || 0) >= list.length) { ctx.done(); return; }
    a.iq = S.clamp(a.iq || 0, 0, list.length - 1); const id = list[a.iq];
    const dg = id === 'cyc' ? diaryGaps() : null;
    if (dg && a.gap == null && !a.dgSeen) { a.gap = dg.gap; a.skips = a.skips || dg.skips; a.dgSeen = true; }
    if (id === 'day' && a.food == null && S.food && S.food.diet) { const dd = S.food.diet(); a.food = dd.type; if (a.milk == null) a.milk = dd.milk ? 'y' : 'n'; }
    if (id === 'day') dayPre(a);
    const next = () => { const l2 = screensOf(a); if (a.iq + 1 >= l2.length) ctx.done(); else { a.iq++; ctx.redraw(); } };
    const prev = () => { if (a.iq <= 0 || (a.fromJoin && a.goal && a.iq <= 1)) ctx.prev(); else { a.iq--; ctx.redraw(); } };   /* Version 39.61: from joining, her goal is known, so Back returns to Your Sakhi */
    const ask = (k) => { const q = Q[k]; const cur = k === 'mheart' && a[k] === 'ok' ? 'n' : a[k]; const multi = q[2] === 'multi';   /* Version 39.51: after her doctor's OK, No shows */
      const mk = (o, h) => (k === 'food' && S.food && S.food.mark ? h.replace(/>([^<]*)<\/button>$/, '>' + S.food.mark(o[0]) + '$1</button>') : h);   /* Version 39.8: the veg and non-veg marks */
      return '<h2 class="ob-h2">' + esc(t(q[0])) + '</h2><div class="chips" role="group" aria-label="' + esc(t(q[0])) + '">' + q[1].map((o) => mk(o, ctx.chip(multi ? 'data-pl-m' : 'data-pl-q', k + ':' + o[0], t(o[1]), multi ? (cur || []).indexOf(o[0]) >= 0 : String(cur) === o[0]))).join('') + '</div>'; };
    let html = '';
    if (id === 'goal') {
      html = ctx.head(t('plan_in_goal_h'), t('plan_in_goal_p')) + '<div class="list">' + goalsFor(a).map((k) => '<button type="button" class="item ob-opt' + (a.goal === k ? ' on' : '') + '" data-pl-goal="' + k + '" aria-pressed="' + (a.goal === k) + '">' + goalIco(k) + '<span class="body"><strong>' + esc(goalName(k, a.stage)) + '</strong></span>' + (a.goal === k ? '<span class="pill ok">✓</span>' : '') + '</button>').join('') + '</div>';
    } else if (id === 'when') {
      html = ctx.head(t('plan_in_when_h'), t('plan_in_when_p')) + '<div class="list">' + Q.when[1].map((o) => '<button type="button" class="item ob-opt' + (a.when === o[0] ? ' on' : '') + '" data-pl-when="' + o[0] + '" aria-pressed="' + (a.when === o[0]) + '"><span class="body"><strong>' + esc(t(o[1])) + '</strong></span></button>').join('') + '</div>';
    } else if (id === 'sum') {
      html = ctx.head(t('plan_in_sum_h'), t('plan_in_sum_p')) + '<div class="list pl-sum">' + sumRows(a).map((r) => '<div class="item quiet"><span class="body"><span>' + esc(r[0]) + '</span><strong>' + esc(r[1]) + '</strong></span><button type="button" class="linkbtn" data-pl-edit="' + r[2] + '">' + esc(t('plan_change')) + '</button></div>').join('') + '</div>' +
        '<button type="button" class="btn primary block" id="pl-in-make">' + esc(t('plan_in_make')) + '</button>';
    } else if (id === 'body') {
      const ft = Array.from({ length: 3 }, (x, i) => i + 4), inch = Array.from({ length: 12 }, (x, i) => i);
      html = ctx.head(t('plan_in_body_h'), t('plan_in_body_p')) + '<div class="card pl-hrow"><label>' + esc(t('plan_height')) + '<span class="row" style="gap:8px"><select id="pl-in-ft" aria-label="' + esc(t('plan_ft')) + '"><option value="">' + esc(t('plan_ft')) + '</option>' + ft.map((x) => '<option value="' + x + '">' + x + '</option>').join('') + '</select><select id="pl-in-in" aria-label="' + esc(t('plan_in')) + '"><option value="">' + esc(t('plan_in')) + '</option>' + inch.map((x) => '<option value="' + x + '">' + x + '</option>').join('') + '</select></span></label>' +
        '<label>' + esc(t('plan_cm')) + '<input type="number" inputmode="decimal" id="pl-in-cm" min="120" max="210" value="' + esc(a.h || '') + '"></label><label>' + esc(t('plan_weight')) + '<input type="number" inputmode="decimal" id="pl-in-w" min="25" max="250" step="0.1" value="' + esc(a.w || '') + '"></label><label>' + esc(t('plan_waist')) + '<input type="number" inputmode="decimal" id="pl-in-waist" min="40" max="200" value="' + esc(a.waist || '') + '"></label></div>' +
        '<p class="small pl-err" id="pl-in-err" hidden>' + esc(t('plan_body_bad')) + '</p><div class="grid2"><button type="button" class="btn" id="pl-in-skip">' + esc(t('plan_in_skip')) + '</button><button type="button" class="btn primary" id="pl-in-next">' + esc(t('plan_in_save')) + '</button></div>';
    } else if (id === 'psafe') {
      /* Version 39.34: before her first step, 2 safety questions; her MCP card's marks come ticked; nothing has to be answered */
      if (!Array.isArray(a.pflags)) a.pflags = psPre();
      html = ctx.head(t('plan_ps_h'), t('plan_ps_p')) + psafeHtml(a, gwAt(todayISO())) + '<button type="button" class="btn primary block" id="pl-in-next">' + esc(t('continue')) + '</button>';
    } else if (id === 'pfsafe') {
      /* Version 39.56: before her first set, the signs that need a doctor before exercises (NICE NG123 1.3.20), each with its line
         as she ticks it; nothing has to be answered */
      if (!Array.isArray(a.pfflags)) a.pfflags = [];
      html = ctx.head(t('plan_ps_h'), t('plan_pfs_p')) + '<div class="list pl-bflags pl-pfs">' + PFS.map((k) => { const on1 = a.pfflags.indexOf(k) >= 0;
        return '<label class="item pl-bf pl-pfs-i"><input type="checkbox" data-pl-pfs="' + k + '"' + (on1 ? ' checked' : '') + '><span class="body">' + esc(t('plan_pfs_' + k)) + (on1 ? '<span class="small pl-pfs-w">' + esc(t('plan_pfs_' + k + '_w')) + '</span>' : '') + '</span></label>'; }).join('') + '</div>' +
        '<p class="small">' + esc(t('plan_pfs_none')) + '</p><button type="button" class="btn primary block" id="pl-in-next">' + esc(t('continue')) + '</button>';
    } else if (id === 'baby') {
      /* Version 39.32 (packet B1 to B19): a few things first. Her answers choose her version. The verified list is ticked as she
         ticked it on Months of trying, and her goal ticks its own line (PMOS, very irregular periods). How long she has been trying
         is asked only when Months of trying has no date; none of it has to be answered. */
      /* Version 39.32 (found on Mohit's phone): PMOS she told Sakhi (joining, Me) is ticked too, so her version is right without asking again */
      if (!Array.isArray(a.bflags)) { const pre = S.ttc && S.ttc.flagsOn ? S.ttc.flagsOn() : []; if ((a.goal === 'pmos' || pcosSaid()) && pre.indexOf('pcos') < 0) pre.push('pcos'); if (a.goal === 'irregular' && pre.indexOf('irregular') < 0) pre.push('irregular'); a.bflags = pre; }
      const opts = BMEDS.map((k) => [k, t('plan_bf_' + k)]).concat((S.ttc && S.ttc.flagList ? S.ttc.flagList() : []).map((f) => [f.k, tx(f)]));
      const known = !!(S.ttc && S.ttc.since && S.ttc.since());
      html = ctx.head(t('plan_in_baby_h'), t('plan_in_baby_p')) + '<h2 class="ob-h2">' + esc(t('plan_in_bflags')) + '</h2><div class="list pl-bflags">' +
        opts.map((o) => '<label class="item pl-bf"><input type="checkbox" data-pl-bf="' + o[0] + '"' + (a.bflags.indexOf(o[0]) >= 0 ? ' checked' : '') + '><span class="body">' + esc(o[1]) + '</span></label>').join('') + '</div>' +
        '<p class="small">' + esc(t('plan_in_bnone')) + '</p>' + (known ? '' : ask('trying')) +
        '<button type="button" class="btn primary block" id="pl-in-next">' + esc(t('continue')) + '</button>';
    } else {
      const qs = qsAsk(id, a).filter((k) => a.edit || (a.known || []).indexOf(k) < 0); const w = warnOf(id, a);
      html = ctx.head(t(SCREEN_H[id][0]), SCREEN_H[id][1] ? t(SCREEN_H[id][1]) : '') + (dg ? '<p class="small pl-in-from">' + esc((dg.lo === dg.hi ? tf(dg.n === 2 ? 'plan_in_from_eq2' : 'plan_in_from_eq', { n: dg.n, a: dg.lo }) : tf('plan_in_from', { n: dg.n, a: dg.lo, b: dg.hi })) + (dg.open ? ' ' + tf('plan_in_from_open', { n: dg.open }) : '')) + '</p>' : '') + qs.map(ask).join('') +
        '<div class="card warn" id="pl-in-warn"' + (w ? '' : ' hidden') + '><p class="small">' + (w ? esc(t(w)) : '') + '</p></div>' +
        '<p class="small pl-err" id="pl-in-err" hidden>' + esc(t('plan_s_need')) + '</p><button type="button" class="btn primary block" id="pl-in-next">' + esc(t('continue')) + '</button>';
    }
    v.innerHTML = '<div class="stack ob" style="gap:12px">' + html + '</div>';
    ctx.back(prev);
    v.querySelectorAll('[data-pl-goal]').forEach((b) => b.addEventListener('click', () => { a.goal = b.dataset.plGoal; if (a.goal === 'track') { ctx.done(); return; } a.iq = 0; next(); }));
    v.querySelectorAll('[data-pl-when]').forEach((b) => b.addEventListener('click', () => { a.when = b.dataset.plWhen; next(); }));
    v.querySelectorAll('[data-pl-edit]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.plEdit === 'day') a.dayShow = true; if (b.dataset.plEdit === 'when') a.whenShow = true; const k = screensOf(a).indexOf(b.dataset.plEdit); if (k >= 0) { a.iq = k; a.edit = true; ctx.redraw(); } }));   /* "Change" shows every question, the joining answers too */
    const mk = v.querySelector('#pl-in-make'); if (mk) mk.addEventListener('click', () => ctx.done());
    v.querySelectorAll('[data-pl-bf]').forEach((c) => c.addEventListener('change', () => { const k = c.dataset.plBf; a.bflags = (a.bflags || []).filter((x) => x !== k); if (c.checked) a.bflags.push(k); }));   /* Version 39.32 */
    v.querySelectorAll('[data-pl-pfs]').forEach((c) => c.addEventListener('change', () => { const k = c.dataset.plPfs; a.pfflags = (a.pfflags || []).filter((x) => x !== k); if (c.checked) a.pfflags.push(k); ctx.redraw(); }));   /* Version 39.56 */
    if (id === 'psafe') wirePsafe(v, a, gwAt(todayISO()));   /* Version 39.34 */
    v.querySelectorAll('[data-pl-q]').forEach((b) => b.addEventListener('click', () => {
      const kv = kv2(b.dataset.plQ); a[kv[0]] = kv[1];
      v.querySelectorAll('[data-pl-q^="' + kv[0] + ':"]').forEach((x) => { const on1 = x === b; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); });
      const w = warnOf(id, a); const wc = v.querySelector('#pl-in-warn'); if (wc) { wc.hidden = !w; wc.querySelector('p').textContent = w ? t(w) : ''; }
    }));
    v.querySelectorAll('[data-pl-m]').forEach((b) => b.addEventListener('click', () => {
      const kv = kv2(b.dataset.plM); const k = kv[0], val = kv[1]; let l = (a[k] || []).slice(); const had = l.indexOf(val) >= 0;
      if (val === 'none') l = had ? [] : ['none']; else { l = l.filter((x) => x !== 'none' && x !== val); if (!had) l.push(val); }
      a[k] = l; v.querySelectorAll('[data-pl-m^="' + k + ':"]').forEach((x) => { const on1 = l.indexOf(kv2(x.dataset.plM)[1]) >= 0; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); });
    }));
    const ft = v.querySelector('#pl-in-ft'), inch = v.querySelector('#pl-in-in'), cm = v.querySelector('#pl-in-cm');
    const fill = () => { if (ft && inch && ft.value !== '' && cm) cm.value = num1((+ft.value * 12 + (+inch.value || 0)) * 2.54); };
    if (ft) ft.addEventListener('change', fill); if (inch) inch.addEventListener('change', fill);
    const sk = v.querySelector('#pl-in-skip'); if (sk) sk.addEventListener('click', () => { a.h = a.w = a.waist = null; next(); });
    const nx = v.querySelector('#pl-in-next'); if (nx) nx.addEventListener('click', () => {
      const er = v.querySelector('#pl-in-err');
      if (id === 'body') {
        const h = +(cm && cm.value), wt = +(v.querySelector('#pl-in-w') || {}).value, wa = (v.querySelector('#pl-in-waist') || {}).value;
        const ok = h >= 120 && h <= 210 && wt >= 25 && wt <= 250 && (!wa || (+wa >= 40 && +wa <= 200));
        if (!ok) { if (er) er.hidden = false; return; }
        a.h = h; a.w = wt; a.waist = wa ? +wa : null; next(); return;
      }
      const miss = qsAsk(id, a).filter((k) => k !== 'milk' && k !== 'endo' && k !== 'pfway' && (Q[k][2] === 'multi' ? !(a[k] || []).length : a[k] == null || a[k] === ''));
      if (miss.length) { if (er) er.hidden = false; return; }
      next();
    });
  }

  /* ---------- her plan from what she told Sakhi: it waits (d.next) until she starts it ----------
     Version 37.1 (docs/first-days-audit-2026-10-24.md): answering the last question makes her plan; "Start my plan" on its last
     card starts it, today, tomorrow or on Monday. A running plan carries on until then, and so do its answers (S.state.intake),
     so a goal change can't leak into the plan she is on. */
  const nextOf = (d) => (d && d.next && d.next.pack ? d.next : null);
  const NEXT_KEYS = ['pack', 'goalKey', 'goal', 'focus', 'level', 'limits', 'food', 'region', 'when', 'bed', 'work', 'intake', 'dayAsk'];
  /* the waiting plan as a plan, to draw it (starting today) */
  function viewOf(d) {
    const n = nextOf(d); const v = Object.assign({ log: {}, weeks: {}, body: [] }, d); if (!n) return v;
    NEXT_KEYS.forEach((k) => { if (n[k] !== undefined) v[k] = n[k]; }); v.remAt = n.remAt || v.remAt || '20:00'; v.pv = (specOf(v.pack || 'cycle') || {}).ver || 1;   /* Version 39.32: the version she would start */
    v.start = todayISO(); v.started = todayISO(); v.go = false; v.weeks = {}; v.wplan = {}; v.mcheck = {}; v.light = null; v.quietAt = null; v.keep = false; v.carried = null; v.doc = null; v.docAt = null; v.docSaid = null; v.m4Seen = null; v.dueSeen = null; v.lapse = null;   /* review life-1: a plan she starts now isn't paused by an earlier loss */
    const same = (d.pack || 'cycle') === 'cycle' && (v.pack || 'cycle') === 'cycle' && (d.goalKey || null) === (v.goalKey || null);   /* review FIXES-01: fairOf needs nothing else */
    const fr = fairOf(d.start && d.start <= todayISO() ? (same ? pastEntry(d) : null) : (Array.isArray(d.past) ? d.past[0] : null), v); if (fr) { v.base = fr.base; v.hab0 = fr.hab0; } else { delete v.base; delete v.hab0; }
    return v;
  }
  /* a plan with a start date still to come */
  const upcoming = (d) => !!(d && d.start && d.start > todayISO() && d.go);
  const ikBase = (a) => ({ at: todayISO(), stage: a.stage || 'cycle', goal: a.goal || null, gap: a.gap || null, skips: a.skips || null, dx: a.goal === 'pmos' ? 'y' : (a.dx || null), signs: (a.signs || []).filter((x) => x !== 'none'),
    pain: a.pain || null, painDays: a.painDays || null, endo: a.endo || null, pads: a.pads || null, clots: a.clots || null, tired: a.tired || null, pms: (a.pms || []).slice(), pmsLevel: a.pmsLevel || null,
    act: a.act == null ? null : +a.act, food: a.food || null, milk: a.milk || null, lim: (a.lim || []).filter((x) => x !== 'none'), bed: a.bed || null, work: a.work || null, when: a.when || null, mbone: dayAsks(a, 'mbone') ? a.mbone || null : null, mheart: dayAsks(a, 'mheart') ? a.mheart || null : null,
    pft: a.pft || null, pfway: a.pfway != null ? a.pfway : null, pfflags: (a.pfflags || []).filter((k) => PFS.indexOf(k) >= 0) });   /* Version 39.56 */   /* Version 39.51: the midlife plan's moves, kept only by a plan that asks them (Mohit's fourth phone test) */
  const dayAsks = (a, k) => qsOf('day', a).indexOf(k) >= 0;
  const BMEDS = ['meds', 'diab', 'ntd', 'scd'];
  /* Version 39.32 (packet B20, B21): her version. Medicines first: a daily medicine, diabetes, a past pregnancy with a spine or
     brain defect, sickle cell or thalassaemia. See a gynaecologist first: any line of the verified list, 40 or over, or a year of
     trying under 35 and 6 months at 35 to 39 (Months of trying's own rule, from its date or her answer here). Both: both cards.
     Her food and moves: mix for PMOS or a healthier-weight goal. */
  function babyOf(a) {
    const fl = Array.isArray(a.bflags) ? a.bflags : []; const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null; const tn = S.ttc && S.ttc.tryingNow ? S.ttc.tryingNow() : null;
    const meds = fl.some((k) => BMEDS.indexOf(k) >= 0);
    const gyn = fl.some((k) => BMEDS.indexOf(k) < 0) || (age != null && age >= 40) || a.trying === 'gt12' || (age != null && age >= 35 && a.trying === 'm6') || !!(tn && tn.now);
    const mix = fl.indexOf('pcos') >= 0 || !!(S.state.situation || {}).pcos || a.goal === 'pmos' || a.goal === 'weight';
    return { bflags: fl.slice(), trying: a.trying || null, bmi: a.h && a.w ? Math.round(bmiOf(+a.w, +a.h) * 10) / 10 : null, bset: mix ? 'mix' : 'std', bdoc: meds && gyn ? 'both' : (meds ? 'meds' : (gyn ? 'gyn' : 'std')) };
  }
  /* ---------- Version 39.34: My pregnancy version 2, safety first ----------
     Before her first step, the safety screen (the reason: safety). Right now: Help's own pregnancy line; a yes shows Help's
     "Call 112 now" card and holds her walk until she checks her answers again, which Sakhi asks the next day. Told by her
     doctor: her MCP card's marks (ticked as she ticked them there, and saved back to it) and 2 lines of its own. Red (told to
     rest, marked high-risk, high BP, Hb under 7, twins from 28 weeks): no walking target. Amber (any other line, or "Not
     sure"): an easy 10-minute walk. Green: the light walk that grows. The pelvic floor from week 13 in every tier. Her answers
     again at 14 and 28 weeks. From 28 weeks the check-in asks about her baby's movements, never a count: less, not sure or
     none shows the kick page's own lines with Call buttons, and holds her walk until she checks her answers again. */
  const PSAFE = ['rest', 'r_hr', 'r_bp', 'r_an', 'r_tw', 'r_gdm', 'r_prev', 'r_oth', 'unsure'];
  const PS_RED = ['rest', 'r_hr', 'r_bp', 'r_an'];
  const psTier = (fl, gw) => { const l = Array.isArray(fl) ? fl : []; return l.some((k) => PS_RED.indexOf(k) >= 0) || (l.indexOf('r_tw') >= 0 && gw != null && gw >= 28) ? 'red' : (l.length ? 'amber' : 'green'); };
  const psName = (k) => (k === 'rest' || k === 'unsure' ? t('plan_ps_' + k) : (S.preg && S.preg.riskName ? S.preg.riskName(k) : k));
  const psPre = () => (S.preg && S.preg.risks ? S.preg.risks().filter((k) => PSAFE.indexOf(k) >= 0) : []);
  const telRow = (ns) => '<div class="row wrap">' + ns.map((n, i) => '<a class="btn sm' + (i ? '' : ' primary') + '" href="tel:' + n + '">' + esc(t('call_b')) + ' ' + n + '</a>').join('') + '</div>';
  const lvNow = () => (S.access && S.access.lv ? S.access.lv('now') : null);
  const nowH = () => (lvNow() ? tx(lvNow().label) : t('call_b') + ' 112');
  const psNowCard = () => '<div class="card dark pl-urg pl-ps-go" data-xp-urgent="1"><h3>' + esc(nowH()) + '</h3>' + (lvNow() ? '<p class="small">' + esc(tx(lvNow().where)) + '</p>' : '') + telRow(['112', '108', '102']) + '<p class="small">' + esc(t('plan_ps_now_p')) + '</p></div>';
  const psTierCard = (fl, gw) => { const tr = psTier(fl, gw); return '<div class="card ' + (tr === 'green' ? 'ok' : 'warn') + ' pl-ps-tier" data-tier="' + tr + '"><h3>' + esc(t('plan_ps_t_' + tr)) + '</h3><p class="small">' + esc(t('plan_ps_t_' + tr + '_p')) + '</p></div>'; };
  function psafeHtml(a, gw) {
    const nb = (k, key) => '<button type="button" class="chip' + (a.pnow === k ? ' on' : '') + '" data-pl-pnow="' + k + '" aria-pressed="' + (a.pnow === k) + '">' + esc(t(key)) + '</button>';
    return '<h2 class="ob-h2">' + esc(t('plan_ps_now_q')) + '</h2><p class="small pl-ps-signs">' + esc(t('s1c')) + '</p><div class="chips" role="group" aria-label="' + esc(t('plan_ps_now_q')) + '">' + nb('n', 'plan_ps_none') + nb('y', 'plan_ps_yes') + '</div>' +
      '<div id="pl-ps-now">' + (a.pnow === 'y' ? psNowCard() : '') + '</div>' +
      '<h2 class="ob-h2">' + esc(t('plan_ps_told_q')) + '</h2><div class="list pl-bflags pl-psafe">' + PSAFE.map((k) => '<label class="item pl-bf"><input type="checkbox" data-pl-ps="' + k + '"' + (a.pflags.indexOf(k) >= 0 ? ' checked' : '') + '><span class="body">' + esc(psName(k)) + '</span></label>').join('') + '</div>' +
      '<p class="small">' + esc(t('plan_ps_unsure_p')) + '</p><div id="pl-ps-tier">' + psTierCard(a.pflags, gw) + '</div>';
  }
  function wirePsafe(v, a, gw) {
    v.querySelectorAll('[data-pl-pnow]').forEach((b) => b.addEventListener('click', () => { a.pnow = b.dataset.plPnow;
      v.querySelectorAll('[data-pl-pnow]').forEach((x) => { const on1 = x === b; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); });
      const nw = v.querySelector('#pl-ps-now'); if (nw) nw.innerHTML = a.pnow === 'y' ? psNowCard() : ''; }));
    v.querySelectorAll('[data-pl-ps]').forEach((c) => c.addEventListener('change', () => { const k = c.dataset.plPs; a.pflags = (a.pflags || []).filter((x) => x !== k); if (c.checked) a.pflags.push(k);
      const tc = v.querySelector('#pl-ps-tier'); if (tc) tc.innerHTML = psTierCard(a.pflags, gw); }));
  }
  /* her answers in her plan's intake: her ticks, the week she gave them, and the day she said yes to a sign that doesn't wait */
  const pregOf = (a) => ({ pflags: (Array.isArray(a.pflags) ? a.pflags : []).filter((k) => PSAFE.indexOf(k) >= 0), psafeW: gwAt(todayISO()), pnow: a.pnow === 'y' ? todayISO() : null });
  /* her answers again: the day after a sign that doesn't wait ('now'), or once she reaches 14 and 28 weeks ('wk') */
  const psafeDue = (dd) => { const ik = ikOf(dd); if (ik.pnow && ik.pnow < todayISO()) return 'now'; const gw = gwAt(todayISO()); const w0 = ik.psafeW == null ? gw : ik.psafeW;
    return gw != null && w0 != null && ((gw >= 14 && w0 < 14) || (gw >= 28 && w0 < 28)) ? 'wk' : ''; };
  const psLine = (d) => { const ik = ikOf(d); return t(ik.pnow ? 'plan_ps_t_now' : 'plan_ps_t_' + psTier(ik.pflags, gwAt(todayISO()))); };
  const psSetRow = (d) => (pregV2(d) ? '<div class="list pl-ps-set"><button type="button" class="item" data-go="plan-psafe"><span class="body"><strong>' + esc(t('plan_ps_set')) + '</strong><span>' + esc(psLine(d)) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' : '');   /* Version 39.36: a › as the rows beside it */
  /* her answers again, for the plan she is on (nothing restarts) */
  function renderPsafe(v) {
    const d0 = raw(); if (!planOn() || !packOf(d0) || !pregV2(d0)) { renderMyPlan(v); return; }
    const ik = ikOf(D()); const gw = gwAt(todayISO());
    const a = S.mem.planPs = S.mem.planPs && S.mem.planPs.day === todayISO() ? S.mem.planPs : { day: todayISO(), pflags: (ik.pflags || []).slice(), pnow: null };
    v.innerHTML = head('plan_ps_set', 'home') + '<div class="stack ob" style="gap:12px"><p class="small">' + esc(t('plan_ps_p')) + '</p>' + psafeHtml(a, gw) + '<button type="button" class="btn primary block" id="pl-ps-save">' + esc(t('save')) + '</button></div>';
    S.wire(v); wirePsafe(v, a, gw);
    v.querySelector('#pl-ps-save').addEventListener('click', () => { const dd = D(); const fl = a.pflags.filter((k) => PSAFE.indexOf(k) >= 0);
      dd.intake = Object.assign({}, ikOf(dd), { pflags: fl, psafeW: gw, pnow: a.pnow === 'y' ? todayISO() : null });
      if (S.preg && S.preg.setRisks) S.preg.setRisks(fl);
      S.mem.planPs = null; S.save(); S.toast(t('saved')); S.setHash('home'); });
  }
  /* Version 39.36: the reveal's "What happens when", by her week: the pelvic floor (day 4, or week 13), the checks of her
     answers still ahead (14 and 28 weeks), her baby's movements in the check-in (from 28 weeks) */
  const pregRvRows = () => { const gw = gwAt(todayISO()); if (gw == null) return []; const r = [gw >= 13 ? 'plan_rv_pf' : 'plan_rv_pf13'];
    if (gw < 14) r.push('plan_rv_ps14'); else if (gw < 28) r.push('plan_rv_ps28'); r.push(gw >= 28 ? 'plan_rv_mv' : 'plan_rv_mv28'); return r; };
  /* the check-in from 28 weeks: her baby's movements today, then sleeping on her side tonight */
  const MV = ['usual', 'less', 'unsure', 'none'];
  const mvAsk = (d) => pregV2(d) && !disc() && (gwAt(todayISO()) || 0) >= 28;
  const mvOut = (k) => (k === 'none' ? '<div class="card dark pl-urg pl-mv-out pl-mv-now" data-xp-urgent="1"><h3>' + esc(nowH()) + '</h3><p class="small">' + esc(t('pregtools_k_now')) + '</p>' + telRow(['112', '108', '102']) + '</div>'
    : (k === 'less' || k === 'unsure' ? '<div class="card warn pl-mv-out pl-mv-today"><p class="small"><strong>' + esc(t('pregtools_k_today')) + '</strong></p>' + telRow(['108', '112']) + '</div>' : ''));
  const mvQ = (m) => '<div class="card pl-ci-mv"><span class="eyebrow">' + esc(t('plan_mv_q')) + '</span><p class="small">' + esc(t('plan_mv_p')) + '</p><div class="chips" role="group" aria-label="' + esc(t('plan_mv_q')) + '">' +
    MV.map((k) => '<button type="button" class="chip' + (m.mv === k ? ' on' : '') + '" data-ci-mv="' + k + '" aria-pressed="' + (m.mv === k) + '">' + esc(t('plan_mv_' + k)) + '</button>').join('') + '</div><div id="pl-ci-mvout">' + mvOut(m.mv) + '</div></div>';
  const wireMv = (v, m) => v.querySelectorAll('[data-ci-mv]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciMv; m.mv = m.mv === k ? null : k;
    v.querySelectorAll('[data-ci-mv]').forEach((x) => { const on1 = x.dataset.ciMv === m.mv; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); });
    const o = v.querySelector('#pl-ci-mvout'); if (o) o.innerHTML = mvOut(m.mv); }));
  const sideCard = () => '<div class="card soft pl-ci-side"><span class="eyebrow">' + esc(t('plan_mv_side_h')) + '</span><p class="small">' + esc(t('plan_mv_side')) + '</p></div>';
  const ikOfAnswers = (a) => { const ik = ikBase(a); if ((a.stage || 'cycle') === 'ttc') Object.assign(ik, babyOf(a)); if ((a.stage || 'cycle') === 'preg') Object.assign(ik, pregOf(a)); return ik; };   /* Version 39.34: her safety answers */
  function startFromIntake(a0) {
    const a = a0 || {}; const st = a.stage || 'cycle'; const pk = packFor(a.goal, st);
    dayFill(a); whenFill(a);   /* Version 39.36: My food's answer when "Your day" wasn't asked */   /* Version 39.51: her time to move when it wasn't asked */
    if (S.food && S.canSave() && a.food) S.food.set(a.food, a.milk !== 'n');   /* Version 39.3: how she eats, for every food screen */
    const ik = ikOfAnswers(Object.assign({}, a, { stage: st }));
    if (st === 'post') { const cur = raw(); const fl = cur && cur.pack === 'preg' ? (ikOf(cur).pflags || []) : []; const pm = fl.filter((k) => ['r_bp', 'r_gdm'].indexOf(k) >= 0); if (pm.length) ik.pm = pm; }   /* Version 39.46: high BP or sugar in her pregnancy */
    if (!pk || !on() || !S.canSave()) { S.state.intake = ik; return null; }   /* "Just keeping track": her answers, no plan */
    const d = D();
    /* Version 39.66: what "Your day" didn't ask and she hasn't answered before waits for its day; meanwhile the gentlest level, gentle
       moves for her knees and back, her food from My food (or veg), and no bedtime target */
    const fk = !!(S.food && S.food.known && S.food.known()); const qd = qsOf('day', { goal: a.goal, stage: st }); const was = dayWait(d);   /* still waiting on the plan she is on: its defaults aren't answers */
    const later = qd.filter((k) => DAY_NOW.indexOf(k) < 0 && a[k] == null && (was.indexOf(k) >= 0 || (!(k === 'act' && d.level != null) && !(k === 'lim' && d.limits) && !((k === 'food' || k === 'milk') && (fk || d.food)) && !(k === 'bed' && d.bed) && !(k === 'work' && d.work))));
    d.next = { pack: pk, goalKey: a.goal, intake: ik, at: todayISO(), dayAsk: later,
      level: a.act == null ? (d.level == null ? 0 : d.level) : S.clamp(+a.act, 0, 2), limits: a.lim ? { knees: a.lim.indexOf('knees') >= 0, back: a.lim.indexOf('back') >= 0 } : (d.limits || (later.indexOf('lim') >= 0 ? { knees: true, back: true } : { knees: false, back: false })), food: a.food || d.food || 'veg', region: d.region || null,
      goal: pk === 'cycle' ? ({ skin: 'skin', weight: 'weight' }[a.goal] || 'cycles') : (pk === 'pain' ? 'pain' : 'cycles'), focus: a.goal === 'weight' && pk !== 'ttc' ? 'weight' : 'habits',   /* Version 39.32: Getting ready keeps 150 minutes a week (packet F4) */
      remAt: d.remAt && d.remAt >= '17:00' ? d.remAt : '20:00', when: a.when || null, bed: a.bed || (later.indexOf('bed') < 0 && d.bed) || null, work: a.work || (later.indexOf('work') < 0 && d.work) || null,   /* Version 39.66: carried, as her level and food are */
      body: a.h && a.w ? { h: +a.h, w: +a.w, waist: a.waist ? +a.waist : null } : null };
    S.state.prompts = Object.assign({}, S.state.prompts || {}, { reveal: todayISO() }); S.mem.rvCard = 0; S.mem.rvStart = null;
    return d;
  }
  /* "Start my plan": today, tomorrow or next Monday, with her check-in time */
  function startDay(when) { const t0 = pToday(); if (when === 'tomorrow') return S.toISO(S.addDays(t0, 1)); if (when === 'monday') return S.toISO(S.addDays(t0, ((8 - t0.getDay()) % 7) || 7)); return S.toISO(t0); }
  /* Version 39.35 (Mohit's walkthrough, 29 Oct): starting a plan keeps the plan it replaces, so "No, I marked it by mistake" (core's
     stage sheet) brings that plan back as it was: its start, its days, its answers and its check-in. The mistaken pregnancy plan
     is dropped, not kept as her last plan. */
  const PLAN_OWN = ['log', 'past', 'next', 'prevPlan', 'body', 'height'];
  const snapPlan = (d) => { const o = JSON.parse(JSON.stringify(d)); PLAN_OWN.forEach((k) => { delete o[k]; }); o.ik0 = S.state.intake ? JSON.parse(JSON.stringify(S.state.intake)) : null; return o; };
  function restorePrev(d) {
    const pp = d.prevPlan; const keep = {}; PLAN_OWN.forEach((k) => { if (k !== 'prevPlan' && d[k] !== undefined) keep[k] = d[k]; });
    Object.keys(d).forEach((k) => { delete d[k]; }); Object.assign(d, JSON.parse(JSON.stringify(pp)), keep);
    if (Array.isArray(d.past)) d.past = d.past.filter((x) => !(x && (x.pack || 'cycle') === (d.pack || 'cycle') && x.start === d.start));   /* Version 39.45: its own entry, made when the pregnancy plan replaced it */
    if (d.ik0) S.state.intake = d.ik0; delete d.ik0;
    S.reminders.remove('plan'); delete d.remGone; remOnNow(d, true);
  }
  function commitStart(when, remAt) {
    const d = D(); const n = nextOf(d); if (!n) return null;
    const fresh = !d.start; const prev = !fresh && d.pack ? snapPlan(d) : null; if (!fresh) archive(d);   /* Version 39.35: the plan it replaces */   /* Version 39.5: the plan she leaves is kept in d.past */
    NEXT_KEYS.forEach((k) => { if (n[k] !== undefined) d[k] = n[k]; });
    if (n.body && n.body.h && n.body.w) { const b = { d: todayISO(), h: n.body.h, w: n.body.w }; if (n.body.waist) b.waist = n.body.waist; d.body = (d.body || []).filter((x) => x.d !== todayISO()).concat([b]).slice(-60); d.height = n.body.h; }
    if (remAt && remAt >= '17:00') { d.remAt = remAt; d.remPick = true; } else d.remAt = n.remAt || '20:00';   /* Version 39.27: a time she picked stays hers */
    d.start = startDay(when); d.go = true; d.keep = false; d.weeks = {}; d.doc = null; d.lapse = null; d.per = null; d.endSeen = null; d.started = todayISO(); delete d.remGone;
    d.pv = (specOf(d.pack || 'cycle') || {}).ver || 1;   /* Version 39.4: the version of her plan she started */
    if (d.goalKey) S.state.goals = [d.goalKey].concat((Array.isArray(S.state.goals) ? S.state.goals : []).filter((x) => x !== d.goalKey));   /* Version 39.48 (Mohit's switch walk): the plan she starts leads her goals, so For you and the rest follow it, also while it rests */
    if (postV2(d) && S.post && S.post.sixRemind) { const n0 = bDays(todayISO()); if (n0 != null && n0 < 42) S.post.sixRemind(); }   /* Version 39.46: her own 6-week check rings on its day */
    delete d.pauseUntil; delete d.remPaused; delete d.chg; delete d.docAt; delete d.docSaid; delete d.m4Seen; delete d.dueSeen; delete d.yearSeen; delete d.carried;   /* review RESULTS-03: the last plan's doctor answer stays with it */
    const fr = fairOf(Array.isArray(d.past) ? d.past[0] : null, d);   /* review FIXES-04: after Stop, past[0] is the plan she stopped */
    if (fr) { d.base = fr.base; d.hab0 = fr.hab0; } else { delete d.base; delete d.hab0; }
    delete d.pauseAsk;   /* review ENGINE-08: each plan gets its own pause offer */
    ['wplan', 'light', 'quietAt', 'mcheck', 'mcNot', 'w4Seen', 'w12Seen', 'mpv2No', 'pfSafeSeen', 'pfMeshSeen', 'pfPainSeen', 'pfRightSeen', 'pfEndSeen', 'pfChkNot'].forEach((k) => { delete d[k]; });   /* Version 39.56: her pelvic floor cards start fresh (a doctor's answer stays hers) */   /* Version 39.51: the midlife cards too */   /* Version 39.12: her weeks, checks and a lighter week belong to the plan they were made in */
    if (fresh) { delete d.nudgeMade; delete d.nudgeHeld; delete d.pfMade; delete d.pfHeld; }   /* Version 39.32 (found on Mohit's phone): a plan she stopped earlier made a nudge, so the new plan's nudge looked deleted and the 6 pm the Start card named never rang */
    if (n.intake) S.state.intake = n.intake;
    delete d.next; if (S.state.prompts) delete S.state.prompts.reveal;
    if (!fresh) S.reminders.remove('plan');
    if (!fresh && d.start === todayISO()) { const lx = (d.log || {})[todayISO()]; if (lx && lx.ci) delete lx.ci; }   /* Version 39.51 (Mohit's phone test): a plan started after today's check-in asks its own tonight; her answers stay */
    remOnNow(d, true);
    if (babyD(d) && S.ttc && S.ttc.setFlags) S.ttc.setFlags((d.intake || {}).bflags || []);   /* Version 39.32: Months of trying shows the same ticks */
    if (pregV2(d) && S.preg && S.preg.setRisks) S.preg.setRisks((d.intake || {}).pflags || []);   /* Version 39.34: her MCP card shows the same marks */
    folicSync(d); pfSync(d);   /* Version 39.56: her morning set, from her first day */
    if (prev) d.prevPlan = prev; else delete d.prevPlan;   /* Version 39.35 */
    return d;
  }
  /* ---------- for core and the other modules: where her plan is ---------- */
  const planOn = () => on() && S.canSave();
  const runningD = () => { const d = raw(); return planOn() && packOf(d) && !pausedFor(d) && !finished(fullD(d)) ? d : null; };
  /* a waiting plan that can be drawn (a pregnancy plan made before the pregnancy ended can't) */
  /* Version 39.32 (found on Mohit's phone): a plan made at another stage doesn't wait: after she switches to "Trying for a baby",
     a period-pain plan she never started no longer stands between her and her stage's plans (it waits again if she switches back) */
  const pendingOk = (d) => { const v = viewOf(d); const s0 = ((nextOf(d) || {}).intake || {}).stage; return !!(nextOf(d) && packOf(v) && !pausedFor(v) && (!s0 || stKey(s0) === stageNowKey())); };
  /* her plan's first 3 days (also the days her plan waits to be started, or waits for its first day): it leads Today, and
     the "Sakhi says" cards that can wait do (docs/first-days-audit-2026-10-24.md, 5.6) */
  function early() {
    if (!planOn()) return false; const d = raw(); if (!d) return false;
    if (runningD() && !selfPaused(d)) { const day = planDay(fullD(d)); return day >= 1 && day <= 3; }   /* review FIXES-09: a pause in her first days lets Today's cards back */
    if (upcoming(d)) return true;
    const n = nextOf(d); return !!(n && pendingOk(d) && n.at && S.diffDays(S.fromISO(n.at), pToday()) <= 2);
  }
  /* her plan leads Today while it waits, runs, or has just finished (its end card) */
  const leads = () => { if (!planOn()) return false; const d = raw(); return !!((runningD() && !selfPaused(d)) || pendingOk(d) || upcoming(d) || (packOf(d) && !pausedFor(d) && finished(fullD(d))) || offerCard()); };   /* Version 39.10: her plan's offer leads too */
  /* from "Start my plan" until her first check-in (at most to day 3), petals and badges wait for that check-in (joy.js) */
  function holdJoy() {
    if (planOn() && /^plan-(goal|reveal|start)$/.test(S.route()) && !runningD()) return true;   /* Version 39.10: while she sets up her plan on Today's offer, what she earns waits for her first check-in */
    const d = raw(); if (!planOn() || !d || !d.go || !d.start || !d.started) return false;
    if (todayISO() > S.toISO(S.addDays(S.fromISO(d.start), 2))) return false;
    return !Object.keys(d.log || {}).some((k) => k >= d.started && (d.log[k] || {}).ci);
  }
  /* a step's name where others may see the screen: private ones say only "Your plan for today" */
  const stepName = (a) => (a && !(disc() && a.priv) ? a.title : '');
  /* "tomorrow", or "Monday, 2 Nov" */
  const dayWord = (iso) => (S.diffDays(pToday(), S.fromISO(iso)) === 1 ? t('plan_when_tom') : S.fmtD(S.fromISO(iso), { weekday: 'long', day: 'numeric', month: 'short' }));

  /* ---------- the day's two or three actions ----------
     { id, icon, hue, kind: 'minutes' | 'habit' | 'routine' | 'tick', title, sub, go, state: 'd' | 'p' | 'n' | null, why } */
  function bedTarget(d, iso) {
    const b = d.bed; if (!b || b === 'b22') return null; const wk = iso && d.start ? Math.max(1, Math.min(weekAt(d, iso), N)) : Math.max(1, wkShown(d));   /* Version 39.12: that day's week */
    if (b === 'b23') return '23:00'; if (b === 'b24') return wk <= 4 ? '23:30' : '23:00';
    return wk <= 4 ? '00:00' : (wk <= 8 ? '23:30' : '23:00');
  }
  const lightWalk = (d, iso) => { const wk = Math.max(1, Math.min(weekAt(d, iso || todayISO()), N)); return wk <= 2 ? 10 : (wk <= 4 ? 15 : (wk <= 8 ? 20 : 30)); };
  /* the day's steps; another day (iso: yesterday) gets that day's week, weekday and log. Version 39.4: from her plan's spec */
  function actionsFor(d, iso) { const xs = stepsFor(d, iso); return xs.some((a) => a.soft) ? xs.filter((a) => !a.soft).concat(xs.filter((a) => a.soft)) : xs; }   /* Version 39.37: a soft step after her daily steps */
  /* one tap on Today, or a "Done" in the check-in */
  function markAction(d, a, val) {
    if (a.kind === 'check' && !a.ciAsk) return;
    const x = d.log[todayISO()] = d.log[todayISO()] || {}; x.ck = Object.assign({}, x.ck || {}); x.ck[a.id] = val;
    if (a.id === 'folic' && val === 'd' && S.ttc && S.ttc.folic && S.ttc.folic.have && !S.ttc.folic.has()) S.ttc.folic.have();   /* Version 39.57: she took it, so she has her tablets */
    if (a.mode) { x.ckm = Object.assign({}, x.ckm || {}); x.ckm[a.id] = a.mode; }   /* Version 39.56 (Mohit's phone test): the mode her step was in (her sets: squeezes, or breathing and letting go) */
    if (a.kind === 'minutes') { const want = val === 'd' ? a.mins : (val === 'p' ? Math.round(a.mins / 2) : 0); const rm = x.rmin || 0; const m0 = x.min || 0; if (m0 - rm < want) { x.min = rm + want; x.tkm = Object.assign({}, x.tkm || {}); x.tkm[a.id] = (x.tkm[a.id] || 0) + (x.min - m0); } }   /* Version 39.13: walking minutes, apart from the yoga's; 39.14: what a tick added, so its undo takes only that */
    if (a.kind === 'habit') { x.plate = x.plate || {}; x.plate[a.habit] = val !== 'n'; }
    if (a.kind === 'routine' && a.r === 'strength' && val === 'd') x.str = true;
    /* Version 39.41 (Mohit's three-plan walk): a routine she did without the player (her Done, or a tick) counts its minutes, once: not
       when she played it today (the player counted those), and playing it later takes this back (logRoutine) */
    if (a.kind === 'routine' && a.r) { const want = val === 'd' ? routineMins(a.r, d) : (val === 'p' ? Math.round(routineMins(a.r, d) / 2) : 0); const cr = (x.r || []).indexOf(a.r) >= 0 ? 0 : want;
      x.tkr = Object.assign({}, x.tkr || {}); const dl = cr - (x.tkr[a.r] || 0); if (dl) { x.min = S.clamp((x.min || 0) + dl, 0, 600); x.rmin = S.clamp((x.rmin || 0) + dl, 0, 600); } if (cr) x.tkr[a.r] = cr; else delete x.tkr[a.r]; }
    if (a.kind === 'minutes' && a.go === 'plan-r-strength' && val === 'd') x.str = true;   /* Version 39.5 (journey audit P2-16): a strength day's Done counts it */
    prune(d);
  }
  const ciDone = (d) => (recCi(d) ? recDone(todayISO()) : !!dayLog(d, todayISO()).ci);   /* Version 39.46: to day 41, her recovery check */
  /* Version 37.2: one count everywhere: "2 of 3 done today", or "1 done, 2 partly today" */
  const countLine = (dn, pn, n) => (pn ? tf('plan_cnt_dp', { d: dn, p: pn }) : (n > 1 && dn === n ? tf('plan_cnt_all', { n: n }) : tf('plan_th_done', { a: dn, n: n })));   /* Version 39.13: a full day says so */
  /* days she followed her plan in its weeks so far */
  const followedDays = (d, wks) => { const pw = wks || (d.keep && keepUntil(d) ? keepUntil(d) : (planWeeks(d) || Math.max(1, weekNo(d))));   /* Version 39.27: wks, her 12 weeks' count while her steps carry on */   /* review RESULTS-01: a kept plan counts to its year */ let n = 0; for (let i = 0; i < pw * 7; i++) { const iso = S.toISO(S.addDays(S.fromISO(d.start), i)); if (iso > todayISO()) break; if (dayDone(d, iso)) n++; } return n; };
  /* her period, noticed (the event hook): shown on Today and My plan for 2 days */
  /* the 7 days before her likely period, from Sakhi's own range (only when her cycles give one) */
  const calmWeek = () => { try { const ri = S.cycle.rangeInfo(); if (!ri) return false; const n = S.diffDays(pToday(), ri.from); return n >= 1 && n <= 7; } catch (e) { return false; } };
  const latestStart = () => (S.state.events || []).filter((e) => e.t === 'start').map((e) => e.d).sort().pop() || null;
  const perNow = (d) => !!(d && d.per && d.per.at && S.diffDays(S.fromISO(d.per.at), pToday()) <= 1 && !disc() && d.per.d === latestStart());   /* undone or replaced: gone */
  const perLine0 = (d, q) => (d.per.days ? tf(d.per.guess ? (q ? 'plan_per_ab_q' : 'plan_per_ab') : (q ? 'plan_per_q' : 'plan_per'), { n: d.per.days }) : t(q ? 'plan_per0_q' : 'plan_per0')) + (packOf(d) === 'pain' && !q ? ' ' + t('plan_per_pain') : '');   /* q: "Pain today?" takes the place of "noted for your results" */
  const perLine = (d, q) => (babyD(d) && !q ? t('plan_bper') : perLine0(d, q));   /* Version 39.32 (packet J1): a fresh start, no failure words */
  /* Version 39.66 (plan questions on their day): a question that waited, one at a time, under her week on Today on the first day a
     step uses it, in "Your day"'s own words; one tap answers it and her steps follow at once. Her knees or back first (a routine
     today), then how she eats and milk (a food step), her bedtime and her day (the bedtime step's day), then how active she is (her
     move). Never in discreet mode or on a shared phone, where the defaults stay. */
  const isFood = (a) => FOOD_IDS.indexOf(a.id) >= 0 || /^(food|plan-plate|preg-diet)/.test(a.go || '');   /* her food habit, her iron or calcium food, food while she breastfeeds */
  const bedDue = (dd) => { try { return stepsFor(Object.assign({}, dd, { bed: 'b23' })).some((a) => a.id === 'sleep'); } catch (e) { return false; } };   /* the bedtime step's day has come */
  function dayQKey(dd, acts) {
    const ks = Array.isArray(dd.dayAsk) ? dd.dayAsk : []; if (!ks.length || disc() || (S.state.settings || {}).shared) return null;
    const on = (k) => ks.indexOf(k) >= 0; const has = (f) => acts.some(f);
    if (on('lim') && has((a) => a.kind === 'routine')) return 'lim';
    if (on('food') && has(isFood)) return 'food';
    if (on('milk') && has(isFood)) return 'milk';
    if (on('bed') && !has((a) => a.id === 'sleep') && bedDue(dd)) return 'bed';
    if (on('work') && !on('bed') && has((a) => a.id === 'sleep')) return 'work';
    if (on('act') && has((a) => a.id === 'move')) return 'act';
    return null;
  }
  const DQ_OPTS = { lim: [['none', 'plan_lim_none'], ['knees', 'plan_lim_knees'], ['back', 'plan_lim_back'], ['both', 'plan_lim_both']] };   /* knees, back or both in one tap, as My plan's settings ask it */
  const dayQHtml = (k) => '<div class="pl-dq" data-nofold="1"><p class="small"><strong>' + esc(t(Q[k][0])) + '</strong></p><div class="chips" role="group" aria-label="' + esc(t(Q[k][0])) + '">' +
    (DQ_OPTS[k] || Q[k][1]).map((o) => '<button type="button" class="chip" data-pl-dq="' + k + ':' + o[0] + '">' + (k === 'food' && S.food && S.food.mark ? S.food.mark(o[0]) : '') + esc(t(o[1])) + '</button>').join('') + '</div></div>';
  function dayAnswer(k, v) {
    const dd = D(); const ik = dd.intake = Object.assign({}, dd.intake || {}); const o = {};
    if (k === 'lim') { dd.limits = { knees: v === 'knees' || v === 'both', back: v === 'back' || v === 'both' }; o.lim = v === 'none' ? [] : (v === 'both' ? ['knees', 'back'] : [v]); }
    else if (k === 'food') { dd.food = v; o.food = v; if (S.food && S.food.set) S.food.set(v, ik.milk !== 'n'); }
    else if (k === 'milk') { o.milk = v; if (S.food && S.food.set) S.food.set(dd.food || foodOf(dd), v !== 'n'); }
    else if (k === 'bed') { dd.bed = v; o.bed = v; } else if (k === 'work') { dd.work = v; o.work = v; }
    else if (k === 'act') { dd.level = S.clamp(+v, 0, 2); o.act = +v; }
    Object.assign(ik, o); if (S.state.intake) S.state.intake = Object.assign({}, S.state.intake, o);   /* her answers, where her next plan reads them */
    dd.dayAsk = (dd.dayAsk || []).filter((x) => x !== k); if (k === 'bed' && v === 'b22') dd.dayAsk = dd.dayAsk.filter((x) => x !== 'work');   /* no bedtime step: nothing to ask about her day */
    if (k === 'bed' || k === 'work') { try { remSync(dd); } catch (e) { /* her reminders follow on the next draw */ } }
    S.save(); S.render();
    const wr = k === 'bed' && S.reminders ? S.reminders.get('plan-wind') : null;   /* the ring her bedtime brings, named as the Start card names it */
    if (wr && wr.on !== false && wr.time) S.toast(tf('plan_st_rem', { l: tf('plan_st_r_wind', { t: timeOf(wr.time) }) }));
  }
  /* Version 39.27 (minimalism audit R05): the pain plan measures pain. On the first 3 days of each period, "Pain today?" once,
     with the day page's own 4 answers; one tap saves it on that period for her results. If she skips it on Today, the evening
     check-in asks. Never on a shared phone or in discreet mode. */
  const PAIN_A = ['pain_0', 'pain_1', 'pain_2', 'pain_3'];
  /* Version 39.55 (My period plan): the evening notes. On a day she bleeds, when heavy periods are one of her goals: "Your period
     today", 3 taps the same for pads or cloth, saved on that day's diary entry (pads, clots, leaked: her diary, the report and What
     your diary shows read them) and in her plan (changed at night, couldn't do her day). In the 7 days before her period, when the
     days before are one of her goals and she noted a sign today: did it get in the way. Never on a shared phone. */
  const ptAsk = (d) => perGoalOn(d, 'heavy') && !disc() && !(S.state.settings || {}).shared && periodToday(todayISO());
  const pxAsk = (d) => perGoalOn(d, 'pms') && !disc() && !(S.state.settings || {}).shared && beforeAt(todayISO()) && ((S.state.daily || {})[todayISO()] || []).some((k) => k !== 'd_ok');
  const ptLoad = () => { const td = todayISO(); const e = (S.state.events || []).find((x) => (x.t === 'start' || x.t === 'start_detail') && x.d === td) || {}; const lg = dayLog(D(), td).pt || {};
    return { soak: e.pads === 'pads_4' ? 'y' : (lg.soak || null), clots: e.clots || null, w: { leak: !!e.leaked, night: !!lg.night, day: !!lg.day } }; };
  const ptCard = (m) => { const p = m.pt || (m.pt = ptLoad());
    const ch = (k, v, lab) => '<button type="button" class="chip' + (p[k] === v ? ' on' : '') + '" data-ci-pt="' + k + ':' + v + '" aria-pressed="' + (p[k] === v) + '">' + esc(lab) + '</button>';
    const tg = (k, lab) => '<button type="button" class="chip' + (p.w[k] ? ' on' : '') + '" data-ci-ptw="' + k + '" aria-pressed="' + !!p.w[k] + '">' + esc(lab) + '</button>';
    return '<div class="card pl-ci-pt"><span class="eyebrow">' + esc(t('plan_pt_h')) + '</span><p class="small">' + esc(t('plan_pt_note')) + '</p>' +
      '<p class="small"><strong>' + esc(t('plan_pt_soak')) + '</strong></p><div class="chips">' + ch('soak', 'n', t('plan_no')) + ch('soak', 'y', t('plan_yes')) + '</div>' +
      (p.soak || p.clots || p.w.leak || p.w.night || p.w.day ? '<p class="small"><strong>' + esc(t('clots')) + '</strong></p><div class="chips">' + ['clots_0', 'clots_1', 'clots_2'].map((k) => ch('clots', k, t(k))).join('') + '</div>' +
      '<p class="small"><strong>' + esc(t('plan_pt_way')) + '</strong></p><div class="chips">' + tg('leak', t('plan_pt_w_leak')) + tg('night', t('plan_pt_w_night')) + tg('day', t('plan_pt_w_day')) + '</div>' : '') + '</div>'; };   /* Version 39.57: the other two once she answers the first */
  const pxQ = (m) => '<div class="card pl-ci-px"><span class="eyebrow">' + esc(t('plan_px_q')) + '</span><div class="chips">' + ['little', 'lot'].map((k) => '<button type="button" class="chip' + (m.px === k ? ' on' : '') + '" data-ci-px="' + k + '" aria-pressed="' + (m.px === k) + '">' + esc(t('plan_px_' + k)) + '</button>').join('') + '</div></div>';
  /* Version 39.55: My period plan asks "Pain today?" on each day she bleeds, to day 5 of her period, when period pain is one of her
     goals (her pain each day, for her results) */
  const painAsk2 = (d) => { if (!perGoalOn(d, 'pain') || disc() || (S.state.settings || {}).shared || !S.cycle || !S.cycle.setPain) return false;
    const td = todayISO(); if (!periodToday(td)) return false; const ls = latestStart(); if (!ls || S.diffDays(S.fromISO(ls), S.fromISO(td)) > 4) return false;
    return !(S.state.events || []).some((e) => (e.t === 'start' || e.t === 'start_detail') && e.d === td && e.pain); };
  const painAsk = (d) => { if (perV2(d)) return painAsk2(d); if (!d || packOf(d) !== 'pain' || disc() || (S.state.settings || {}).shared || !S.cycle || !S.cycle.setPain) return false;
    const ls = latestStart(); if (!ls) return false; const n = S.diffDays(S.fromISO(ls), S.today()); if (n < 0 || n > 2) return false;
    return !(S.state.events || []).some((e) => FLOW_T.indexOf(e.t) >= 0 && e.d >= ls && e.pain); };
  const painQ = (d) => (painAsk(d) ? '<div class="pl-pain" role="group" aria-label="' + esc(t('plan_pain_q')) + '"><p class="small"><strong>' + esc(t('plan_pain_q')) + '</strong></p><div class="pl-pain-a">' + PAIN_A.map((k) => '<button type="button" class="btn sm" data-pl-pain="' + k + '">' + esc(t(k)) + '</button>').join('') + '</div></div>' : '');
  const wirePain = (v) => v.querySelectorAll('[data-pl-pain]').forEach((b) => b.addEventListener('click', () => { if (S.cycle.setPain(b.dataset.plPain)) S.toast(t('plan_pain_saved')); S.render(); }));
  function onLog(name, p) {
    /* Version 39.46: her recovery check saved (her check-in to day 41) marks tonight's reminder done; after "My baby has died" a
       feeding goal becomes her recovery */
    if (name === 'tool' && p && p.route === 'post-recovery') { const d0 = raw(); if (d0 && recCi(d0)) setTimeout(() => { remSync(D()); S.saveQuiet(); }, 0); return; }
    if (name === 'babyDied') { const d0 = raw(); if (d0 && (d0.pack || 'cycle') === 'post') { const dd = D(); if (dd.goalKey === 'feed') { dd.goalKey = 'recovery'; dd.goalWas = 'feed'; } remSync(dd); } return; }
    if (name === 'stageUndo' && p && p.at) { const d0 = raw(); if (d0 && d0.start && d0.started && d0.started >= p.at && S.diffDays(S.fromISO(d0.started), pToday()) <= 3) { if (d0.prevPlan && d0.prevPlan.pack) restorePrev(D()); else closePlan(D(), true); S.saveQuiet(); } return; }   /* Version 39.65 */
    if (name === 'babyBack') { const d0 = raw(); if (d0 && d0.goalWas) { const dd = D(); dd.goalKey = dd.goalWas; delete dd.goalWas; remSync(dd); } return; }   /* "Marked this by mistake": her goal back */
    if (name === 'pregEnd' && p && p.mistake) { const d0 = raw(); if (d0 && d0.pack === 'preg' && d0.prevPlan && d0.prevPlan.pack && d0.prevPlan.pack !== 'preg') restorePrev(D()); else if (d0 && d0.pack === 'preg' && d0.start) closePlan(D(), true); return; }   /* Version 39.35; Version 39.45: with no plan before it, the mistaken pregnancy plan ends and isn't kept as her last plan */
    if (name === 'tool' && p && p.type === 'calm') { const dc = raw(); if (dc && packOf(dc)) setTimeout(() => { const dd = D(); closeDay(dd); remSync(dd); S.saveQuiet(); }, 0); return; }   /* Version 39.22: she wound down (after this event: a full day's petal is an event too) */
    if (name !== 'log' || !p || p.type !== 'start' || !runningD()) return;
    const d = D(); const st = (S.state.events || []).filter((e) => e.t === 'start').map((e) => e.d).sort(); const last = st[st.length - 1];
    if (!last || last < d.start || (d.per && d.per.d === last) || S.diffDays(S.fromISO(last), pToday()) > 3) return;   /* already noted, or an old one filled in */
    const g = ((S.cycle && S.cycle.gapsAll && S.cycle.gapsAll()) || []).filter((x) => x.to === last)[0];
    d.per = { at: todayISO(), d: last, days: g && g.days >= 10 && g.days <= 400 ? g.days : null, guess: !!(g && g.guess) }; S.saveQuiet();
  }
  /* a day she followed her plan: checked in, minutes, a routine, a food habit or an action done */
  /* the after-birth recovery check is a step of her plan until 6 weeks after the birth */
  const rcheckOn = (d, iso) => { const b = (S.state.situation || {}).deliveredOn; return !!(d.pack === 'post' && b && S.diffDays(S.fromISO(b), S.fromISO(iso)) < 42 && S.post && S.post.checkedOn); };
  const dayDone = (d, iso) => { const x = dayLog(d, iso); return !!(x.rest || (rcheckOn(d, iso) && recDone(iso)) || x.ci || (x.min || 0) > 0 || (x.r || []).length || Object.keys(x.ck || {}).some((k) => x.ck[k] === 'd' || x.ck[k] === 'p') || Object.keys(x.plate || {}).some((k) => x.plate[k]) || (hasFrom(d) && specFlat(d, iso).some((st) => st.from && fromDone(st.from, iso)))); };   /* review ENGINE-02: a step done in its own tool counts the day */
  const weekDays = (d, wk) => weekDates(d, wk).filter((iso) => dayDone(d, iso)).length;
  /* review FIXES-01: does her plan (this version and goal) have any step that counts from its own tool? */
  const fromMemo = {};
  const hasFrom = (d) => { const sp = packOf(d) ? specD(d) : null; if (!sp) return false; const key = (sp.id || '') + '|' + (sp.ver || '') + '|' + (d.goalKey || ''); if (fromMemo[key] != null) return fromMemo[key];
    let any = false; const walk = (list) => (list || []).forEach((x) => { if (x.first) x.first.forEach((f) => { if (f.from) any = true; }); else if (x.goal) walk(x.goal[d.goalKey] || x.goal['*']); else if (x.from) any = true; }); walk(sp.steps); return (fromMemo[key] = any); };
  /* Version 39.5: 2 rest days a week she taps (the spec's rest); a rest day counts as a day she followed her plan. Sakhi only
     offers one, on a day she logged pain that stopped her day or heavy flow; it never applies one. */
  const restLeft = (d, iso) => { const day = iso || todayISO(); const used = weekDates(d, weekAt(d, day)).filter((x) => dayLog(d, x).rest).length; return Math.max(0, ((specD(d) || {}).rest || 0) - used); };
  const isRest = (d, iso) => !!dayLog(d, iso || todayISO()).rest;
  function setRest(d) { const x = d.log[todayISO()] = d.log[todayISO()] || {}; x.rest = true; x.ci = 1; prune(d); }
  const hardDay = () => (S.state.events || []).some((e) => e.d === todayISO() && (e.pain === 'pain_3' || !!(S.cycle && S.cycle.heavyEv && S.cycle.heavyEv(e))));
  /* Version 39.5 (journey audit P2-17): "Pause for a week": her steps, the cards and the reminder rest, then it carries on */
  const selfPaused = (d) => !!(d && d.pauseUntil && todayISO() < d.pauseUntil);
  /* review ENGINE-03: the reminder stays on and starts again the day the pause ends, so the phone rings then without Sakhi being
     opened; one she deleted during the pause stays deleted */
  function pauseWeek(d) { d.pauseUntil = S.toISO(S.addDays(pToday(), 7)); const r = S.reminders.get('plan'); if (r && r.on !== false) { S.reminders.upsert({ id: 'plan', start: d.pauseUntil }, { quiet: true }); d.remPaused = 'start'; } nudgeSync(d); }
  /* review FIXES-03: a V39.7 pause only moved the start, so ending it moves the start back and keeps her own on/off choice;
     a pause begun before V39.7 switched the reminder off, so that one comes back on */
  function unpause(d) { delete d.pauseUntil; if (d.remPaused) { delete d.remPaused; const r = S.reminders.get('plan'); if (r) { const st = r.start && r.start > todayISO() ? todayISO() : (r.start || todayISO()); S.reminders.upsert({ id: 'plan', start: st }, { quiet: true }); } } nudgeSync(d); }   /* review FIXES-03, V39.9 review FIXES-04: her on/off choice stays hers */
  /* Version 39.5 (journey audit P2-10): a plan she replaces or stops is kept, with what she did */
  /* review ENGINE-05, SAFETY-07: the day her plan stopped applying: the last day of a finished plan, the day her stage ended a
     pregnancy plan or paused another, else today */
  /* V39.9 review FIXES-07: an after-birth plan ends at her baby's first birthday at the latest */
  function endAt(d, dd) { const e = endAt0(d, dd); const b = (S.state.situation || {}).deliveredOn;
    if ((d.pack || 'cycle') === 'post' && typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b)) { const cap = S.toISO(S.addDays(S.fromISO(b), 365)); if (cap >= d.start && e > cap) return cap; }
    return e; }
  function endAt0(d, dd) {
    const sit = S.state.situation || {}; const td = todayISO(); const pk = d.pack || 'cycle';
    if (finished(dd) && planWeeks(dd)) return S.toISO(S.addDays(S.fromISO(d.start), (d.keep ? keepUntil(dd) : planWeeks(dd)) * 7 - 1));
    const inPlan = (x) => x && x >= d.start && x <= td;
    if (pk === 'preg') { const e2 = [sit.deliveredOn, sit.pregEndedOn].filter(inPlan).sort()[0]; if (e2) return e2; }
    else if (pausedFor(d)) { const p2 = [sit.pregnantSince, sit.deliveredOn, sit.pregEndedOn].filter(inPlan).sort().pop(); if (p2) return p2; }
    return td;
  }
  function pastEntry(d) {
    if (!d || !d.start || d.start > todayISO()) return null; const dd = fullD(d); const pk = d.pack || 'cycle';
    let k = Math.max(1, Math.min(weekNo(dd), d.keep ? keepUntil(dd) : N));   /* kept: her year's last 4 weeks */
    /* Version 39.27 (R03): a plan that carried on by itself counts to her last active week (week 12 at least), so moving on soon
       after day 85 keeps her level, and a plan she left at week 12 keeps week 12's last day as its end */
    const quietAfter = !!(d.carried && weekNo(dd) > N); if (quietAfter) { let w = k; while (w > N && !weekDates(dd, w).some((x) => x <= todayISO() && dayDone(dd, x))) w--; k = w; }
    const coreEnd = quietAfter && k === N ? S.toISO(S.addDays(S.fromISO(d.start), N * 7 - 1)) : null;
    const e = { pack: pk, goalKey: d.goalKey || null, pv: d.pv || 1, start: d.start, end: coreEnd || endAt(d, dd), days: followedDays(dd), wk: weekNo(dd), weeks: d.weeks || {} };
    if (d.docSaid && d.docSaid.k === 'hb') e.hbAt = d.docAt || d.docSaid.at || null;   /* review FIXES-07 */
    if (pk === 'cycle') {
      let m = 0, w = 0; for (let i = Math.max(1, k - 3); i <= k; i++) { m += weekMin(dd, i); w++; } e.mins = w ? Math.round(m / w) : 0;
      const last = coreEnd ? S.fromISO(coreEnd) : (finished(dd) ? S.addDays(S.fromISO(d.start), (d.keep ? keepUntil(dd) : planWeeks(dd)) * 7 - 1) : pToday());   /* her plan's own last 2 weeks */
      e.kept = 0; const HL = habList(dd); for (let i = 0; i < HL.length && HL[i].wk <= k + 2 * (d.hab0 || 0); i++) { let n = 0; for (let j = 0; j < 14; j++) if ((dayLog(dd, S.toISO(S.addDays(last, -j))).plate || {})[HL[i].id]) n++; if (n >= 8) e.kept++; else break; }
    }
    return e;
  }
  function archive(d) { const e = pastEntry(d); if (e) d.past = [e].concat(Array.isArray(d.past) ? d.past : []).slice(0, 5); }
  /* the plan ends and is kept as "Your last plan": Stop, or (V39.9 review FIXES-07) her after-birth plan at the baby's first birthday */
  function closePlan(dd, drop) { if (!drop) archive(dd); delete dd.prevPlan; dd.start = null; dd.keep = false; dd.pack = null; dd.endSeen = null; ['doc', 'docAt', 'docSaid', 'm4Seen', 'dueSeen', 'yearSeen', 'carried'].forEach((k) => { delete dd[k]; }); delete dd.remGone; delete dd.pauseUntil; delete dd.remPaused; S.reminders.remove('plan'); S.reminders.remove('plan-nudge'); S.reminders.remove('plan-pf'); ['nudge', 'nudgeHeld', 'nudgeMade', 'pfRing', 'pfHeld', 'pfMade', 'wplan', 'light', 'quietAt', 'mcheck', 'mcNot'].forEach((k) => { delete dd[k]; }); }   /* Version 39.56: her morning set too */   /* Version 39.12 */
  const pastBirthday = (d) => { const b = (S.state.situation || {}).deliveredOn; return !!(d && d.start && (d.pack || 'cycle') === 'post' && d.go !== false && d.start <= todayISO() && typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b) && !pregnant() && S.diffDays(S.fromISO(b), pToday()) > 365); };
  /* Version 39.5 (P2-04): the same goal again, within a month of her last plan's end, starts where she is. Review ENGINE-06:
     the plan screen shows it too, before she starts */
  function fairOf(pp, nv) {
    if (pp && pp.pack === 'cycle' && (nv.pack || 'cycle') === 'cycle' && pp.goalKey === (nv.goalKey || null) && pp.end && S.diffDays(S.fromISO(pp.end), pToday()) <= 30) return { base: pp.mins > START[lvOf(nv)] ? round5(pp.mins) : null, hab0: pp.kept || 0 };
    return null;
  }
  /* Version 39.5 (journey audit P2-09): her stage stopped her plan: a pregnancy, or her baby's birth ending the pregnancy plan */
  function changedWhy(d) {
    const pk = d && (d.pack || 'cycle');   /* review ENGINE-04: Version 35's plan has no pack */
    if (!planOn() || !d || !d.start || pendingOk(d) || d.chg === d.start + ':' + pk || d.start > todayISO()) return null;
    if (pregnant() && pk !== 'preg' && !finished(fullD(d))) return 'preg';
    const b = (S.state.situation || {}).deliveredOn; if (pk === 'preg' && !pregnant() && b && b >= d.start && S.diffDays(S.fromISO(b), pToday()) < 42) return 'birth';   /* review SAFETY-03: the card's recovery-check line holds for 6 weeks */
    return null;
  }
  function changedCard(d, why, slot) {
    const dd = fullD(d); const cls = 'card soft pl-chg' + (slot ? ' pl-slot pl-sl-chg' : '');
    if (disc()) return '<div class="' + cls + '" data-nofold="1" data-disc-ok="1"><h3>' + esc(t('plan_chg_h')) + '</h3><p class="small">' + esc(t('plan_chg_d')) + '</p><div class="row wrap">' + (slot ? '<button type="button" class="btn sm primary" data-go="plan">' + esc(t('plan_chg_go_d')) + '</button>' : '<button type="button" class="btn sm" id="pl-chg-not">' + esc(t('plan_rec_not')) + '</button>') + '</div></div>';   /* review PAGES-08, FIXES-06: on My plan itself, Not now (the page has its one pick button) */
    return '<div class="' + cls + '" data-nofold="1"><h3>' + esc(t('plan_chg_h')) + '</h3><p class="small">' + esc(tf(why === 'preg' ? 'plan_chg_preg' : 'plan_chg_birth', { t: packTitle(dd), n: followedDays(dd) })) + '</p>' +
      '<div class="row wrap"><button type="button" class="btn sm primary" id="pl-chg-go" data-chg="' + why + '">' + esc(t(why === 'preg' ? 'plan_chg_go_preg' : 'plan_chg_go_post')) + '</button><button type="button" class="btn sm" id="pl-chg-not">' + esc(t('plan_rec_not')) + '</button></div></div>';
  }
  /* Version 39.48 (Mohit's switch walk): her stage moved between tracking and trying while the other stage's plan runs. Getting
     ready ran on after "Tracking my periods" (folic acid, trying lessons, "you could be pregnant"), and Easier periods after
     "Trying for a baby", with no folic acid; "Your plan has changed" knew only a pregnancy and a birth. Now one card offers the
     plan for now. Her plan runs on until she chooses, and "Keep" keeps it, remembered apart from "Your plan has changed" so a
     pregnancy still asks. */
  const CYC_PACKS = ['cycle', 'pain', 'heavy', 'pms', 'pelvic'];   /* Version 39.56: trying for a baby, Getting ready (her sets join it) */
  function fitWhy(d) {
    if (!planOn() || !d || !d.start || pendingOk(d) || d.start > todayISO() || pregnant() || pausedFor(d) || selfPaused(d) || finished(fullD(d))) return null;
    const st = stageNowKey(); const pk = packOf(d);
    const why = st === 'ttc' && CYC_PACKS.indexOf(pk) >= 0 ? 'ttc' : (st === 'cycle' && pk === 'ttc' ? 'nottc' : (st === 'meno' && ['cycle', 'pain', 'pms', 'ttc'].indexOf(pk) >= 0 ? 'meno' :
      (st === 'cycle' && pk === 'meno' ? (perFirst() ? 'per' : 'nomid') : null)));   /* Version 39.55 (the phone test): a midlife plan after "Tracking my periods" */   /* Version 39.51 (Mohit's phone): midlife now; heavy periods keep their plan */
    const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null; if (why === 'meno' && age != null && age < 40) return null;   /* Version 39.65: only a plan that fits her age */
    return why && d.fitKeep !== d.start + ':' + why ? why : null;
  }
  const perFirst = () => (S.state.goals || []).find((k) => ['pain', 'heavy', 'pms'].indexOf(k) >= 0) || null;   /* her first period goal */
  function fitCard(d, why) {
    const dd = fullD(d); const cls = 'card soft pl-slot pl-fit pl-sl-fit'; const b = (id, key, pri, x) => '<button type="button" class="btn sm' + (pri ? ' primary' : '') + '" id="' + id + '" data-fit="' + why + '">' + esc(x || t(key)) + '</button>';
    if (disc()) return '<div class="' + cls + '" data-nofold="1" data-disc-ok="1"><h3>' + esc(t('plan_fit_hd')) + '</h3><p class="small">' + esc(t('plan_fit_pd')) + '</p><div class="row wrap">' + b('pl-fit-go', 'plan_fit_pick', true) + b('pl-fit-keep', 'plan_fit_keep_d') + '</div></div>';   /* a shared phone: plain words */
    if (why === 'per') { const g = perFirst(); const pt = packTitle({ pack: g, goalKey: g, pv: (specOf(g) || {}).ver }); return '<div class="' + cls + '" data-nofold="1"><h3>' + esc(tf('plan_fit_meno_h', { t: pt })) + '</h3><p class="small">' + esc(t('plan_per_v2_p')) + '</p><div class="row wrap">' + b('pl-fit-go', null, true, tf('plan_fit_meno_go', { t: pt })) + b('pl-fit-keep', null, false, tf('plan_fit_keep', { t: packTitle(dd) })) + '</div></div>'; }
    if (why === 'nomid') return '<div class="' + cls + '" data-nofold="1"><h3>' + esc(t('plan_fit_hd')) + '</h3><p class="small">' + esc(t('plan_fit_pd')) + '</p><div class="row wrap">' + b('pl-fit-go', 'plan_fit_pick', true) + b('pl-fit-keep', null, false, tf('plan_fit_keep', { t: packTitle(dd) })) + '</div></div>';
    if (why === 'meno') { const mt = packTitle({ pack: 'meno', pv: 2 }); return '<div class="' + cls + '" data-nofold="1"><h3>' + esc(tf('plan_fit_meno_h', { t: mt })) + '</h3><p class="small">' + esc(t('plan_fit_meno_p')) + '</p><div class="row wrap">' + b('pl-fit-go', null, true, tf('plan_fit_meno_go', { t: mt })) + b('pl-fit-keep', null, false, tf('plan_fit_keep', { t: packTitle(dd) })) + '</div></div>'; }
    return '<div class="' + cls + '" data-nofold="1"><h3>' + esc(t(why === 'ttc' ? 'plan_fit_ttc_h' : 'plan_fit_cyc_h')) + '</h3><p class="small">' + esc(t(why === 'ttc' ? 'plan_fit_ttc_p' : 'plan_fit_cyc_p')) + '</p><div class="row wrap">' +
      b('pl-fit-go', why === 'ttc' ? 'plan_fit_ttc_go' : 'plan_fit_pick', true) + b('pl-fit-keep', null, false, tf('plan_fit_keep', { t: packTitle(dd) })) + '</div></div>';
  }
  function wireFit(v) {
    const g = v.querySelector('#pl-fit-go'); if (g) g.addEventListener('click', () => { const mg = g.dataset.fit === 'meno' ? (S.state.goals || []).find((k) => GOALS.meno.indexOf(k) >= 0 && k !== 'track' && k !== 'heavy') : null;   /* her midlife goal, when she has one */
      S.mem.planIntake = g.dataset.fit === 'ttc' ? { stage: 'ttc', goal: 'ready', iq: 1 } : (mg ? { stage: 'meno', goal: mg, iq: 1 } : (g.dataset.fit === 'per' && perFirst() ? { stage: 'cycle', goal: perFirst(), iq: 1 } : { stage: stageNowKey(), iq: 0 })); S.setHash('plan-goal'); });
    const k = v.querySelector('#pl-fit-keep'); if (k) k.addEventListener('click', () => { const dd = D(); dd.fitKeep = dd.start + ':' + k.dataset.fit; S.saveQuiet(); S.render(); });
  }
  /* Version 39.46: after the birth, her pregnancy's answers for "Your day" (how she eats, her knees or back), so it isn't asked again */
  const postPre = () => { const ik = S.state.intake || {}; const d0 = raw() || {}; const a = { stage: 'post', goal: 'recovery', iq: 1 };
    if (ik.food) { a.food = ik.food; a.milk = ik.milk || 'y'; }
    if (Array.isArray(ik.lim)) a.lim = ik.lim.filter((k) => k === 'knees' || k === 'back'); else if (d0.limits && dayWait(d0).indexOf('lim') < 0) a.lim = ['knees', 'back'].filter((k) => d0.limits[k]);
    a.known = ['food', 'milk', 'lim'].filter((k) => a[k] != null); return a; };
  function wireChange(v) {
    const g = v.querySelector('#pl-chg-go'); if (g) g.addEventListener('click', () => { const w = g.dataset.chg; S.mem.planIntake = w === 'preg' ? { stage: 'preg', iq: 0 } : postPre();   /* Version 39.35: her goal, asked (it chooses her step) */ S.setHash('plan-goal'); });
    const n = v.querySelector('#pl-chg-not'); if (n) n.addEventListener('click', () => { const dd = D(); dd.chg = dd.start + ':' + (dd.pack || 'cycle'); S.saveQuiet(); S.render(); });
    const pk2 = v.querySelector('#pl-chg-pick'); if (pk2) pk2.addEventListener('click', () => { S.mem.discPick = true; S.render(); });
  }
  /* Version 39.51 (Mohit's phone tests, 31 Oct): a plan changed on the day it started isn't her last plan, even when her check-in
     that day counted it as followed: "Your last plan" and the report for her doctor show the one before it (the list itself stays
     as it was). A copy of the plan she is on is always one of these (its start is today), so it goes at once, not only when the
     app next opens (mig) */
  const sameDay = (x) => !!(x && x.start && x.end && x.end <= x.start);
  const lastPast = (d) => { const l = d && Array.isArray(d.past) ? d.past : []; let i = 0; while (i < l.length && sameDay(l[i])) i++; return l[i] || null; };
  /* Version 39.68 (the doctors' review): no "Your last plan" card; Undo and "Changed by mistake" bring her earlier plan back, and
     her report for the doctor keeps the line about it (summary) */
  const pastCard = () => '';
  /* days since she last followed her plan (0: today) */
  const sinceLast = (d) => { for (let i = 0; i < 60; i++) { const iso = S.toISO(S.addDays(pToday(), -i)); if (iso < d.start) return i; if (dayDone(d, iso)) return i; } return 60; };

  /* ---------- the plan reveal (decisive moment 1: "Sakhi understood me") ---------- */
  const ikOf = (d) => (d && d.intake) || S.state.intake || {};
  /* the plan's doctor check from her answers (id 'start': the first entry that matches; Version 39.4) */
  function docEntry(d) {
    const sp = specOf(packOf(d) || (d && d.pack), d && d.pv); if (!sp) return null; const c = { ik: ikOf(d), goal: d && d.goalKey, day: todayISO() };
    return (sp.doctor || []).find((x) => x.id === 'start' && (x.any || []).some((w) => progIf([w], c))) || null;
  }
  function docCase(d) { const r = docEntry(d); return r ? String(r.text).replace(/^@/, '') : ''; }
  /* Version 39.32 (packet C1 to C15, I5): the Getting ready plan's doctor card, from her version: her gynaecologist first and the
     free option second, a Qura doctor for food, sleep and habits. Verified lines come from ttc.js, word for word. */
  function babyDoc(dd) {
    const ik = ikOf(dd); const v = ik.bdoc || 'std'; const fl = ik.bflags || []; const sit = S.state.situation || {};
    const VF = (k) => (S.ttc && S.ttc.vf ? S.ttc.vf(k) : null); const PR = (k) => (S.ttc && S.ttc.prep ? S.ttc.prep(k) : null); const dl = (x) => (x ? tx({ en: x.den, hi: x.dhi }) : '');
    const gyn = v === 'gyn' || v === 'both'; const meds = v === 'meds' || v === 'both'; const lines = []; let h = '';
    if (gyn) { h = t('plan_bdoc_gyn_h'); lines.push(t('plan_bdoc_gyn_p')); if (fl.indexOf('pcos') >= 0 || sit.pcos) lines.push(t('plan_bdoc_pmos')); }
    if (meds) { if (!h) h = t('plan_bdoc_meds_h'); if (fl.indexOf('meds') >= 0 && PR('meds')) lines.push(dl(PR('meds'))); if (VF('folic3')) lines.push(tx(VF('folic3'))); if (fl.indexOf('diab') >= 0 && PR('control')) lines.push(tx(PR('control')) + '. ' + dl(PR('control'))); }
    if (!h) { h = t('plan_bdoc_std_h'); lines.push(t('plan_bdoc_std_p')); }
    const b = sit.deliveredOn; const m = b && !pregnant() ? Math.floor(S.diffDays(S.fromISO(b), pToday()) / 30.44) : null; if (m != null && m >= 0 && m < 24) lines.push(tf('plan_bdoc_space', { n: m }));
    return { h: h, lines: lines.filter(Boolean), free: gyn && VF('start') ? tx(VF('start')) : t('plan_bdoc_free'), go: gyn && VF('together') ? tx(VF('together')) : '', qura: t('plan_bdoc_qura') };
  }
  /* Version 39.6: a doctor check her own dates call for (id 'due'): months of trying, from her own dates in ttc.js */
  const DUE = { 'ttc-trying': () => { try { return S.ttc && S.ttc.tryingNow ? S.ttc.tryingNow() : null; } catch (e) { return null; } } };
  function dueEntry(d) { const sp = specD(d); if (!sp) return null; const r = (sp.doctor || []).find((x) => x.id === 'due' && DUE[x.due]); if (!r) return null; const st = DUE[r.due](); return st && st.now ? Object.assign({ months: st.months, reasons: !!st.reasons }, r) : null; }
  /* after "Yes, done": what the doctor said, only where an answer has a home already (her PMOS line; her Hb result) */
  const SAID = { cycle: ['pmos', 'other', 'skip'], heavy: ['hb', 'other', 'skip'] };
  /* Version 39.6 (journey audit P2-14): her check is done, so the diary's cards about the same thing rest (90 days or more
     without a period always shows) */
  const SEEN_IDS = { cycle: ['gap_long', 'gap_short', 'gap_vary', 'late_now'], heavy: ['flow_heavy', 'period_long'], pain: ['pain_severe'] };
  /* Version 39.57 (the all-plans walk): the findings her plan's own doctor check answers; while one is open the check stays, past day 21 */
  const docOpen = (dd) => !!(S.explain && S.explain.openIds && S.explain.openIds((SEEN_IDS[packOf(dd)] || []).filter((x) => x !== 'late_now')));
  /* Version 39.6 (journey audit P2-03; roadmap section 2, "The end sentence"): her plan's main result, before and since, as
     counts with no judging word */
  function resultOf(d, onProg) {   /* onProg: My progress, where her checklist has its own card */
    const pk = packOf(d) || d.pack || 'cycle'; const sit = S.state.situation || {}; const ik = ikOf(d); const said = (k) => tf('plan_prog_said', { g: k });
    if (pk === 'cycle' && !sit.stopped && !sit.hysterectomy) { const c = cycleCompare(d); if (c.before.length || c.since.length || c.said) return { h: t('plan_prog_cyc'), b: beforeTxt(c), s: c.since.length ? sinceTxt(c) : '…' }; return null; }
    if (pk === 'pain') { const p = painCompare(d); if (p.b || p.s) return { h: t('plan_prog_pain'), b: p.b ? tf('plan_prog_pain_n', { a: p.bp, n: p.b }) : (ik.pain ? said(t('plan_pn_' + ik.pain)) : '–'), s: p.s ? tf('plan_prog_pain_n', { a: p.sp, n: p.s }) : '…' }; return null; }
    if (pk === 'heavy') { const h = heavyCompare(d); if (h.b || h.s) return { h: t('plan_res_heavy'), b: h.b ? tf('plan_prog_pain_n', { a: h.bh, n: h.b }) : (ik.pads ? said(t('plan_pa_' + ik.pads.slice(1))) : '–'), s: h.s ? tf('plan_prog_pain_n', { a: h.sh, n: h.s }) : '…' }; return null; }
    if (pk === 'ttc' && S.ttc && S.ttc.prepDone) { const pr = S.ttc.prepDone();
      if (babyD(d)) { const wks = Math.max(1, Math.min(weekNo(d), N)); let mm = 0; for (let w = 1; w <= wks; w++) mm += weekMin(d, w); let fd = 0; Object.keys(d.log || {}).forEach((k) => { if (k >= d.start && ((d.log[k].ck || {}).folic === 'd')) fd++; });
        return { h: t('plan_bres_h'), only: tf(onProg ? 'plan_bres_p' : 'plan_bres', { n: fd, k: pr.a, t: pr.b, m: round5(mm / wks) }) }; }   /* Version 39.32 (packet K1); Version 39.33: on My progress, without the checklist (its own card says it) */
      return { h: t('plan_res_prep_h'), only: tf('plan_res_prep', { a: pr.a, b: pr.b }) }; }
    /* Version 39.27 (minimalism audit R05): the hot-flush goal counts days with hot flushes, from her quick chip (the 12-row
       weekly diary stays for more detail) */
    if (pk === 'pms' || ((pk === 'post' || pk === 'meno') && d.goalKey === 'mood') || (pk === 'meno' && d.goalKey === 'hot')) {
      const hot = pk === 'meno' && d.goalKey === 'hot'; const st = S.fromISO(d.start); const keys = hot ? ['d_hotflush'] : ['d_mood', 'd_anxious', 'd_irritable']; const dl = S.state.daily || {};
      const cnt = (a, b) => Object.keys(dl).filter((k) => k >= S.toISO(a) && k < S.toISO(b) && (dl[k] || []).some((x) => keys.indexOf(x) >= 0)).length;
      /* review RESULTS-05: no result when she logged nothing then, and "since" counts only from her start */
      const s0 = S.toISO(S.addDays(pToday(), -29)) > d.start ? S.addDays(pToday(), -29) : st; const any = (a, b) => Object.keys(dl).some((k) => k >= S.toISO(a) && k < S.toISO(b) && (dl[k] || []).length);
      const hb = any(S.addDays(st, -30), st), hs = any(s0, S.addDays(pToday(), 1)); if (!hb && !hs) return null;
      return { h: t(hot ? 'plan_res_hotd' : 'plan_res_low'), b: hb ? String(cnt(S.addDays(st, -30), st)) : (ik.pmsLevel && !hot ? said(t('plan_pl_' + ik.pmsLevel)) : '–'), s: hs ? String(cnt(s0, S.addDays(pToday(), 1))) : '…', lb: 'plan_res_low_b', ls: 'plan_res_low_s' };
    }
    return null;
  }
  const resultCard = (d) => { if (disc()) return ''; const r = resultOf(d); return r ? '<div class="card pl-head-res"><h3>' + esc(r.h) + '</h3>' + (r.only ? '<p>' + esc(r.only) + '</p>' : cmp(esc(r.b), esc(r.s), r.lb, r.ls)) + '</div>' : ''; };
  const resultText = (d) => { const r = resultOf(d); return !r ? '' : r.h + ': ' + (r.only || (t(r.lb || 'plan_prog_before') + ' ' + r.b + ' · ' + t(r.ls || 'plan_prog_since') + ' ' + r.s)); };
  /* "You told Sakhi you had the check", on her results and in her report */
  const docTold = (d) => (d && d.doc === 'done' && (d.docAt || docCase(d)) ? (d.docAt ? tf('plan_doc_told', { d: S.fmtD(S.fromISO(d.docAt), { day: 'numeric', month: 'short' }) }) : t('plan_doc_told0')) + (d.docSaid && d.docSaid.k && ['pmos', 'hb'].indexOf(d.docSaid.k) >= 0 ? ' ' + t('plan_said_' + d.docSaid.k + '_r') : '') : '');
  const nowLine = (d) => nowLineOf(ikOf(d), packOf(d) || (d && d.pack));
  function nowLineOf(ik, pk) {
    ik = ik || {}; const bits = [];
    /* every answer she gave shows here, so she sees Sakhi heard her (English answers lose their capital mid-line) */
    const lc = (x) => (S.state.lang === 'en' && !/^I\b/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x);
    if (pk === 'cycle' && ik.gap) { bits.push(ik.gap === 'vary' ? t('plan_now_vary') : tf('plan_now_gap', { g: t('plan_gap_' + ik.gap) })); if (ik.skips === 'y') bits.push(t('plan_now_skip')); }
    if (pk === 'cycle') (ik.signs || []).forEach((x) => bits.push(lc(t('plan_sg_' + x))));
    if (pk === 'pain' && ik.pain) { bits.push(t('plan_pn_' + ik.pain)); if (ik.painDays) bits.push(tf('plan_now_pdays', { x: lc(t('plan_pd_' + ik.painDays)) })); }
    if (pk === 'pain' && ik.endo === 'y') bits.push(t('plan_now_endo'));   /* Version 39.55 */
    if (pk === 'heavy' && ik.pads) { bits.push(tf('plan_now_pads', { x: lc(t('plan_pa_' + ik.pads.slice(1))) })); if (ik.clots === 'y') bits.push(t('plan_now_clots')); if (ik.tired === 'y') bits.push(t('plan_now_tired')); }
    if (pk === 'pms' && (ik.pms || []).length) { bits.push(ik.pms.map((x) => lc(t('plan_pm_' + x))).join(', ')); if (ik.pmsLevel) bits.push(tf('plan_now_pmsl', { x: lc(t('plan_pl_' + ik.pmsLevel)) })); }
    return bits.join(' · ');
  }
  /* her plan's steps, each with what it does for her (the reviewed lines, wording-review section 14.6) */
  /* Version 39.7 (journey audit P3-02): each step's "Why?" opens the Learn guide that explains it (never on a shared phone) */
  const WHY_ART = { plan_fb_move: 'mind_body.movement-busy-day', plan_fb_move_g: 'mind_body.movement-busy-day', plan_fb_movep: 'mind_body.movement-busy-day', plan_fb_str: 'mind_body.movement-busy-day', plan_fb_food: 'mind_body.simple-indian-plate', plan_fb_food_t: 'mind_body.simple-indian-plate', plan_fb_sleep: 'mind_body.sleep-and-hormones', plan_fb_calm: 'mind_body.stress-and-periods', plan_fb_cramps: 'cycle.painful-periods', plan_fb_iron: 'mind_body.thyroid-and-anaemia-tests', plan_fb_hot: 'midlife.hot-flushes-night-sweats', plan_fb_bones: 'midlife.bones-heart-after-40', plan_fb_recov: 'pregnancy.after-birth-first-six-weeks', plan_fb_due: 'pregnancy.four-antenatal-visits', plan_fb_prep: 'conceive.getting-ready-india-preconception-checklist',
    /* Version 39.32 */ plan_fb_folic: 'conceive.getting-ready-india-preconception-checklist', plan_fb_hb: 'mind_body.thyroid-and-anaemia-tests', plan_fb_bcalm: 'mind_body.stress-and-periods', plan_fb_bgreens: 'mind_body.simple-indian-plate', plan_fb_bdal: 'mind_body.simple-indian-plate', plan_fb_bfruit: 'mind_body.simple-indian-plate', plan_fb_btea: 'mind_body.simple-indian-plate', plan_fb_bmilk: 'mind_body.simple-indian-plate', plan_fb_bkatori: 'mind_body.simple-indian-plate', plan_fb_bnuts: 'mind_body.simple-indian-plate' };
  WHY_ART.plan_fb_pyoga = 'pregnancy.dos-and-donts';   /* Version 39.52: its reviewed line on everyday work and a daily walk */
  Object.assign(WHY_ART, { plan_fb_m2h: 'midlife.hot-flushes-night-sweats', plan_fb_m2q: 'midlife.sleep-mood-dryness-midlife', plan_fb_m2r: 'midlife.sleep-mood-dryness-midlife', plan_fb_m2s: 'midlife.bones-heart-after-40' });   /* Version 39.51 */
  /* review FACTS-04, KNOWLEDGE-10: the guide fits her plan and stage. No exercise guide in pregnancy or the first 6 weeks
     after a birth (after the birth, the recovery guide); the calm step's guide by plan (none in pregnancy). */
  const MOVE_WHY = ['plan_fb_move', 'plan_fb_move_g', 'plan_fb_movep', 'plan_fb_str'];
  const CALM_ART = { meno: 'midlife.sleep-mood-dryness-midlife', post: 'pregnancy.after-birth-first-six-weeks', preg: null };
  const whyArt = (why, pk) => {
    let k = WHY_ART[why];
    if (k && MOVE_WHY.indexOf(why) >= 0 && (pregnant() || earlyPost())) k = earlyPost() ? 'pregnancy.after-birth-first-six-weeks' : null;
    if (k && why === 'plan_fb_calm' && pk && Object.prototype.hasOwnProperty.call(CALM_ART, pk)) k = CALM_ART[pk];
    return k && !disc() && S.article && S.article(k) ? k : null;
  };
  const whyBtn = (why, cls, pk) => { const k = whyArt(why, pk); return k ? '<button type="button" class="linkbtn ' + (cls || '') + '" data-why-art="' + esc(k) + '">' + esc(t('plan_why')) + '</button>' : ''; };
  const wireWhy = (v) => v.querySelectorAll('[data-why-art]').forEach((b) => b.addEventListener('click', () => { if (S.openAnswer) S.openAnswer(b.dataset.whyArt); }));
  /* Version 39.55: a step of her cycle says when it comes (not on a shared phone); My period plan's iron food and Hb test as they are */
  const piLine = (d, a) => (pfLead(d) && a.id === 'checked' ? tf('plan_pf_pi_soon', { x: a.name || a.title }) : perV2(d) && a.id === 'iron' ? t('plan_pi_iron') : (perV2(d) && a.id === 'hb' ? tf('plan_pi_phb', { x: a.name || a.title }) : (a.win && PI_WIN[a.win] && !disc() ? tf(PI_WIN[a.win], { x: a.name || a.title }) :
    tf(a.every && a.every < 7 ? 'plan_pi_days' : 'plan_pi_goal', { x: a.name || a.title, n: a.every }))));
  function stepsList(d) {
    const sp = packOf(d) ? specD(d) : null; const out = []; if (!sp) return out;   /* Version 39.4: from her plan's spec (list) */
    const add = (ico, hue, txt, why, priv) => out.push({ ico: ico, hue: hue, txt: txt, why: why, priv: !!priv });
    (sp.list || []).forEach((x) => {
      if (x.use === 'walk') { const n = x.mins === 'light' ? lightWalk(d) : daySuggest(d, 1); add(ICO.move, 'purple', tf('plan_pi_walk', { n: x.cap ? Math.min(n, x.cap) : n }), x.why); }
      else if (x.use === 'plate') { const hb = habitsOf(d, 1); const h = hb[hb.length - 1]; add(ICO.plate, 'green', tf('plan_pi_food', { h: tx(h.h) }), x.why); }
      else if (x.use === 'item') add(progIco(x.icon), x.hue, ptx(x.text), x.why, x.priv);
      else if (x.use === 'bed') { if (laterStep(d)) return;   /* Version 39.45: "What happens when" names it */ if (d.work === 'night') add(S.icon('moon'), 'purple', t('plan_pi_shift'), 'plan_fb_sleep'); else { const bt = bedTarget(d); if (bt) add(S.icon('moon'), 'purple', tf('plan_pi_bed', { t: clockOf(bt) }), 'plan_fb_sleep'); } }
      else if (x.use === 'pyoga') { const id = pyId(); if (!id || !pyTier(d) || out.some((y) => y.py)) return; const w = out.find((y) => y.walk);   /* Version 39.52: the yoga takes the walk's place on 2 days, so it shares the walk's line */
        if (w) { w.txt = tf('plan_pi_wy', { x: w.x, y: lowFirst(rName(id)) }); w.py = true; } else { add(ICO.yoga, 'plum', tf('plan_pi_days', { x: rName(id), n: 2 }), 'plan_fb_pyoga', true); out[out.length - 1].py = true; } }
      else if (x.use === 'today') actionsFor(d).forEach((a) => { add(a.icon, a.hue, a.id === 'pdue' ? t('plan_pi_due') : (a.id === 'rcheck' ? t('plan_pi_rcheck') : piLine(d, a)), a.why, a.priv); const y = out[out.length - 1]; if (PY.indexOf(a.r) >= 0) y.py = true; if (a.id === 'move' && a.kind === 'minutes' && !a.r) { y.walk = true; y.x = a.name || a.title; } });   /* V39.9 review FOOD-06 */
    });
    return out;
  }
  /* Version 39.45 (Mohit's Flip5): a step her plan holds back for its first days (the cycle plan's bedtime, from day 4: Version
     39.43) is named before it comes: its day and its own title as it will show, or null once it is here */
  function laterStep(d) {
    const sp = d && packOf(d) ? specD(d) : null; if (!sp) return null;
    const s = (sp.steps || []).filter((x) => x.use === 'bed')[0]; const m = s && (s.if || []).map((w) => /^pday:(\d+)-$/.exec(w)).filter(Boolean)[0]; const n = m ? +m[1] : 0;
    if (n < 2 || (d.start && d.start <= todayISO() && planDay(d) >= n)) return null;
    const st0 = d.start || todayISO(); const a = stepsFor(Object.assign(fullD(d), { start: st0 }), S.toISO(S.addDays(S.fromISO(st0), n - 1))).filter((x) => x.id === s.id)[0];
    if (!a && dayWait(d).indexOf('bed') >= 0) return { n: n, a: null };   /* Version 39.66: her bedtime is asked on its day, so it is named without a time */
    return a ? { n: n, a: a } : null;
  }
  const laterLine = (l) => tf('plan_rv_from', { n: l.n, x: !l.a ? t('plan_rv_bed0') : (S.state.lang === 'en' ? l.a.title.charAt(0).toLowerCase() + l.a.title.slice(1) : l.a.title) });
  /* about how many minutes a day her first steps take */
  const dayMins = (d) => actionsFor(d).reduce((n, a) => n + (a.kind === 'minutes' ? a.mins : (a.r ? routineMins(a.r, d) : (/^relief-/.test(a.go) ? 3 : 0))), 0);
  /* Version 37.1: her plan as cards, one idea each (docs/first-days-audit-2026-10-24.md, 5.3 and 5.5): it's ready; your steps;
     how each day works; what happens when; a doctor check alongside it when her answers need one; when to start. Only "Start
     my plan" on the last card starts it. The card she is on stays (S.mem.rvCard), so a doctor page opened from it comes back. */
  const EVE = ['18:00', '19:00', '20:00', '21:00', '21:30', '22:00'];   /* Version 39.27 (R02): 9:30 and 10 pm too */
  let meghaAud = null;
  const stopAudio = () => { try { if (meghaAud) meghaAud.pause(); } catch (e) { /* nothing playing */ } meghaAud = null; };
  /* Dr. Megha's 30-second welcome, when the build carries her recording (android/build-apk.sh lists web/audio/ in SAKHI_CONFIG.audio) */
  const meghaSrc = () => { const l = (window.SAKHI_CONFIG || {}).audio || []; const k = [S.state.lang, 'en'].map((x) => 'megha-welcome-' + x).find((x) => l.indexOf(x) >= 0); return k ? 'audio/' + k + '.mp3' : null; };
  function renderReveal(v) {
    const d = raw(); if (!on() || !S.canSave() || !pendingOk(d)) { renderMyPlan(v); return; }   /* no plan waiting: My plan, drawn in place */
    const n = nextOf(d); const dd = viewOf(d); const pk = packOf(dd); const dk = docCase(dd); const run = runningD();
    /* Version 39.32 (the minimalist baseline, one home for each fact): Getting ready's routine card (standard version) shows on
       Today from day 1, so the reveal keeps its doctor card for the versions that need a check first */
    const dkR = dk && !(babyD(dd) && (ikOf(dd).bdoc || 'std') === 'std') ? dk : '';
    const cards = ['ready', 'steps', 'days'].concat(dkR ? ['doc'] : [], ['start']);   /* Version 39.3: one card for her days and weeks */
    const i = S.mem.rvCard = S.clamp(S.mem.rvCard || 0, 0, cards.length - 1); const id = cards[i];
    const st = S.mem.rvStart = S.mem.rvStart || { when: nowHM() >= '21:00' ? 'tomorrow' : 'today', at: null };   /* at: null is Sakhi's time (Version 39.27); a chip she taps is hers */
    const rvAt = () => ciAt(Object.assign({}, dd, { remAt: st.at || n.remAt || '20:00', remPick: !!st.at || !!dd.remPick }));   /* Version 39.47: "How each day works" says the Start card's time */
    const chip = (attr, val, label, on1) => '<button type="button" class="chip' + (on1 ? ' on' : '') + '" ' + attr + '="' + esc(val) + '" aria-pressed="' + !!on1 + '">' + esc(label) + '</button>';
    const nextB = '<button type="button" class="btn primary block" id="pl-rv-next">' + esc(t('plan_rv_next')) + '</button>';
    const editB = '<button type="button" class="linkbtn" id="pl-rv-edit">' + esc(t('plan_rv_edit')) + '</button>';
    const top = '<div class="ob-top pl-rv-top">' + (i > 0 ? '<button type="button" class="iconbtn" id="pl-rv-back" aria-label="' + esc(t('back')) + '">' + S.I.back + '</button>' : '<span class="pl-rv-sp"></span>') +
      '<div class="progress" role="img" aria-label="' + esc(t('step') + ' ' + (i + 1) + ' ' + t('of') + ' ' + cards.length) + '">' + cards.map((x, k) => '<i class="' + (k <= i ? 'on' : '') + '"></i>').join('') + '</div></div>';
    const bodyOf = (id) => { let body = '';
    if (id === 'ready') {
      const nm = String((S.account && S.account.info && (S.account.info() || {}).name) || '').trim().split(/\s+/)[0]; const now = nowLine(dd); const m = round5(dayMins(dd));
      body = (S.art ? '<div class="pl-rv-art">' + S.art.sakhi({ pose: 'cheer', look: (S.state.settings || {}).look }) + '</div>' : '') +
        '<h1>' + esc(nm && !disc() ? tf('plan_rv_h', { name: nm }) : t('plan_rv_h0')) + '</h1>' +
        '<span class="pill accent pl-rv-goal">' + esc(tf('plan_rv_goal', { g: disc() ? t('plan_h_d') : t('plan_gv_' + dd.goalKey) })) + '</span>' +
        (now && !disc() ? '<p>' + esc(tf('plan_rv_made', { x: now })) + '</p>' : '') +
        '<div class="card pl-rv-len"><strong>' + esc(pk === 'preg' ? t(disc() ? 'plan_rv_len_d' : 'plan_rv_len_preg') : postV2(dd) ? t(disc() ? 'plan_rv_len_d' : (died() ? 'plan_rv_len_pb' : 'plan_rv_len_p')) : (m >= 5 ? tf('plan_rv_len', { n: m }) : t('plan_rv_len_few'))) + '</strong><span class="small">' + esc(packTitle(dd)) + '</span></div>' +
        (run ? '<p class="small">' + esc(t('plan_rv_repl')) + '</p>' : '') + nextB + editB;
    } else if (id === 'steps') {
      const sl = stepsList(dd);
      body = '<h1>' + esc(sl.length === 1 ? t('plan_rv_step1_h') : tf('plan_rv_steps_h', { n: sl.length })) + '</h1><div class="list pl-rv-steps">' +
        /* Version 39.8 (diet audit VD-07): one picture per step, its reason behind "Why?" */
        sl.map((x) => '<div class="item quiet pl-pillar pl-pic-row"><span class="pl-pic hue hue-' + x.hue + '">' + (S.art && S.art.food && /^plan_fb_food/.test(x.why || '') ? S.art.food('thali') : x.ico) + '</span><span class="body"><strong>' + esc(disc() && x.priv ? t('plan_today_d') : x.txt) + '</strong>' + (x.why && !disc() ? '<details class="pl-why-d"><summary>' + esc(t('plan_why_q')) + '</summary><span>' + esc(t(x.why)) + '</span>' + whyBtn(x.why, 'pl-why', pk) + '</details>' : '') + '</span></div>').join('') + '</div>' +
        (disc() ? '<p class="small">' + esc(t('plan_fb_any')) + '</p>' : '') +
        (pk === 'cycle' ? '<p class="small">' + esc(tf('plan_rv_week', { m: target(dd, 1), n: daySuggest(dd, 1) })) + '</p><p class="small">' + esc(t('plan_rv_also')) + '</p>' : '') + nextB;
    } else if (id === 'days') {
      const src = meghaSrc(); const rows = pk === 'preg' ? ['plan_rv_w1'].concat(pregV2(dd) && !disc() ? pregRvRows() : []) : (postV2(dd) ? [[14, 'plan_rv_p14'], [42, 'plan_rv_p42'], [84, 'plan_rv_p84']].filter((x) => (bDays(todayISO()) || 0) < x[0]).map((x) => x[1]).concat([died() ? 'plan_rv_p365b' : 'plan_rv_p365']) : (menoV2(dd) ? m2RvRows(dd) : (perV2(dd) ? perRvRows(dd) : (pfLead(dd) ? pfRvRows(dd) : ['plan_rv_w1', 'plan_rv_w4', 'plan_rv_w12']))));   /* Version 39.55 */   /* Version 39.36: what comes later in her pregnancy; Version 39.46: her year after the birth */
      if (pfJoined(dd)) rows.push({ x: t('plan_pf_rv_join') });   /* Version 39.56: her sets join this plan */
      body = '<h1>' + esc(t('plan_rv_days_h')) + '</h1><h2 class="ob-h2">' + esc(t('plan_rv_day_h')) + '</h2><ol class="pl-rv-how pl-rv-strip">' + ['plan_rv_d1', postV2(dd) && earlyAt(todayISO()) && !disc() ? 'plan_rv_d2p' : 'plan_rv_d2', 'plan_rv_d3'].map((k, j) => '<li><span class="pl-rv-ic hue hue-' + ['green', 'purple', 'rose'][j] + '" aria-hidden="true">' + S.icon(['check', 'bell', 'sparkle'][j]) + '</span><span>' + esc(j === 1 ? tf(k, { t: timeOf(rvAt()) }) : t(k)) + '</span></li>').join('') + '</ol>' +   /* Version 39.8: the day as a 3-picture strip (Done, the evening check-in, Sakhi answers) */
        '<div class="card soft"><p>' + esc(t('plan_rv_miss')) + '</p></div>' +
        (src ? '<button type="button" class="btn sm pl-rv-aud" id="pl-rv-aud" data-src="' + esc(src) + '">' + esc(t('plan_rv_aud')) + '</button>' : '') +
        '<h2 class="ob-h2">' + esc(t('plan_rv_when_h')) + '</h2><ol class="pl-tl">' + (pk !== 'preg' && laterStep(dd) ? '<li><strong>' + esc(laterLine(laterStep(dd))) + '</strong></li>' : '') + rows.map((k) => '<li><strong>' + esc(typeof k === 'string' ? t(k) : k.x) + '</strong></li>').join('') + '</ol>' +
        (['cycle', 'pain', 'heavy', 'pms'].indexOf(pk) >= 0 && !disc() ? '<p>' + esc(t('plan_rv_cyc')) + '</p>' : '') + (pk === 'ttc' && !disc() ? '<p>' + esc(t('plan_rv_ttc')) + '</p>' : '') +
        '<p class="small">' + esc(t(pk === 'preg' && !disc() ? 'plan_rv_exp_preg' : 'plan_rv_diff')) + '</p>' + nextB;
    } else if (id === 'doc' && babyD(dd) && !disc()) {   /* Version 39.32: her version's own card */
      const bd = babyDoc(dd);
      body = '<h1>' + esc(bd.h) + '</h1><div class="card warn pl-doc pl-bdoc">' + bd.lines.map((x) => '<p>' + esc(x) + '</p>').join('') + '</div><p class="small">' + esc(bd.free) + '</p>' + (bd.go ? '<p class="small">' + esc(bd.go) + '</p>' : '') + '<p class="small">' + esc(bd.qura) + '</p>' +
        '<div class="row wrap">' + byRoute(S.routeOwner('access-doctor') ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '', '<button type="button" class="btn sm" data-go="ask">' + esc(t('plan_rv_qura')) + '</button>') + '</div>' + nextB;
    } else if (id === 'doc') {
      body = '<h1>' + esc(t('plan_rv_doc_h2')) + '</h1><div class="card warn pl-doc"><p>' + esc(t(disc() ? 'plan_doc_d' : dk)) + '</p></div><p>' + esc(t(dk === 'plan_rv_doc_cyc' ? 'plan_rv_doc_when' : 'plan_rv_doc_soon')) + '</p>' +
        '<div class="row wrap">' + byRoute(S.routeOwner('access-doctor') ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '', '<button type="button" class="btn sm" data-go="ask">' + esc(t('plan_rv_qura')) + '</button>') + '</div>' + nextB;
    } else {
      const mon = pToday().getDay() === 0 ? [] : [['monday', tf('plan_st_mon', { d: S.fmtD(S.fromISO(startDay('monday')), { day: 'numeric', month: 'short' }) })]];
      const al = S.alerts || {}; const can = !!(al.can && al.can());
      const pv = Object.assign({}, dd, { remAt: st.at || n.remAt || '20:00', remPick: !!st.at || !!dd.remPick }); const at0 = ciAt(pv); const ats = EVE.indexOf(at0) >= 0 ? EVE : EVE.concat([at0]).sort();   /* Version 39.27 (R02): Sakhi's time, after her walk */
      body = '<h1>' + esc(t('plan_st_h')) + '</h1>' +
        '<h2 class="ob-h2">' + esc(t('plan_st_day')) + '</h2><div class="chips" role="group" aria-label="' + esc(t('plan_st_day')) + '">' + [['today', t('plan_st_today')], ['tomorrow', t('plan_st_tom')]].concat(mon).map((o) => chip('data-rv-when', o[0], o[1], st.when === o[0])).join('') + '</div>' +
        '<h2 class="ob-h2">' + esc(t('plan_st_at')) + '</h2><div class="chips" role="group" aria-label="' + esc(t('plan_st_at')) + '">' + ats.map((x) => chip('data-rv-at', x, timeOf(x), at0 === x)).join('') + '</div><p class="small">' + esc(t(postV2(dd) && earlyAt(todayISO()) && !disc() ? 'plan_st_at_pp' : 'plan_st_at_p')) + '</p>' +
        (can ? '<p class="small pl-st-rem">' + S.icon('bell') + ' <span>' + esc(remLine(pv)) + '</span></p>' : '') +   /* Version 39.27 (R01): no question; the line says what will ring */
        '<button type="button" class="btn primary block" id="pl-rv-go">' + esc(t('plan_start')) + '</button>' + editB;
    }
    return body; };
    /* Version 39.61 (phase C): from joining, one page (her days and weeks are in My plan's How it works) */
    const one = !!S.mem.rvOne; const ids = one ? ['ready', 'steps'].concat(dkR ? ['doc'] : [], ['start']) : [id];
    const body = ids.map((x, k) => { let b = bodyOf(x); if (!one) return b; b = b.split(nextB).join('').split(editB).join(''); return k ? b.replace(/<h1>/g, '<h2 class="pl-rv-h">').replace(/<\/h1>/g, '</h2>') : b; }).join(one ? '<hr class="pl-rv-sep">' : '') + (one ? editB : '');
    v.innerHTML = '<div class="pl-rv' + (one ? ' pl-rv-one' : '') + '">' + (one ? '' : top) + body + (id === 'start' || one ? '<p class="footnote">' + esc(footT(dd)) + '</p>' : '') + '</div>';   /* Version 39.8 (VD-07): the disclaimer once, on the Start card */
    S.wire(v); wireWhy(v);
    const to = (k) => { stopAudio(); S.mem.rvCard = k; S.render(); window.scrollTo(0, 0); };
    const nx = v.querySelector('#pl-rv-next'); if (nx) nx.addEventListener('click', () => to(i + 1));
    const bk = v.querySelector('#pl-rv-back'); if (bk) bk.addEventListener('click', () => to(i - 1));
    const ed = v.querySelector('#pl-rv-edit'); if (ed) ed.addEventListener('click', () => {
      const ik = n.intake || S.state.intake || {}; const b = n.body || {};
      S.mem.planIntake = Object.assign({}, ik, { stage: ik.stage || stageNowKey(), iq: 0, h: b.h || null, w: b.w || null, waist: b.waist || null }, Array.isArray(ik.signs) && !ik.signs.length && ik.gap ? { signs: ['none'] } : {}); stopAudio(); S.setHash('plan-goal');
    });
    const au = v.querySelector('#pl-rv-aud'); if (au) au.addEventListener('click', () => { if (meghaAud && !meghaAud.paused) { stopAudio(); return; } try { meghaAud = new Audio(au.dataset.src); const pl = meghaAud.play(); if (pl && pl.catch) pl.catch(() => {}); } catch (e) { meghaAud = null; } });
    v.querySelectorAll('[data-rv-when]').forEach((b) => b.addEventListener('click', () => { st.when = b.dataset.rvWhen; S.render(); }));
    v.querySelectorAll('[data-rv-at]').forEach((b) => b.addEventListener('click', () => { st.at = b.dataset.rvAt; S.render(); }));
    const go = v.querySelector('#pl-rv-go'); if (go) go.addEventListener('click', () => {
      commitStart(st.when, st.at); S.mem.rvCard = 0; S.mem.rvStart = null; S.mem.rvOne = false; stopAudio(); S.save();
      if (S.alerts && S.alerts.auto) S.alerts.auto(true);   /* Version 39.27 (R01): reminders are on; Android's own "Allow" now if it still needs one */
      S.setHash('home');
    });
  }
  const stageNowKey = () => { if (pauseWhy() === 'post') return 'post'; const k = S.stageNow ? S.stageNow() : 'cycle'; return GOALS[k] ? k : 'cycle'; };

  /* ---------- the evening check-in (decisive moment 2: "Today I did it") ---------- */
  /* Version 39.46: after the birth, from day 42 once a week, her main measure: any leaks this week (days 14 to 41 read her
     recovery check's own "Leaking"). Never on a shared phone. */
  const LK = ['never', 'some', 'most'];
  const weekAsk = (d, key) => postV2(d) && bDays(todayISO()) >= 42 && !(S.state.settings || {}).shared && !disc() && ![1, 2, 3, 4, 5, 6].some((i) => dayLog(d, S.toISO(S.addDays(pToday(), -i)))[key]);
  const lkAsk = (d) => (pfLead(d) ? pfAsk(d) && ![1, 2, 3, 4, 5, 6].some((i) => dayLog(d, S.toISO(S.addDays(pToday(), -i))).lk) : weekAsk(d, 'lk'));   /* Version 39.56: every week of My pelvic floor plan */
  /* Version 39.56: My pelvic floor plan's measure in her own words: "sure" in weeks 1, 4 and 12, "gets in the way" in weeks 4, 8
     and 12, "compared with when you started" at week 12; never on a shared phone or in discreet mode. Not sure of her track, a leak
     asks when it happened, and her answer sets it (the urge step joins). */
  const pfAsk = (d) => pfLead(d) && !!packOf(d) && !(S.state.settings || {}).shared && !disc();
  const pfWeekHas = (d, key) => { const wk = weekNo(d); const s0 = S.fromISO(d.start); for (let i = 0; i < 7; i++) { const iso = S.toISO(S.addDays(s0, (wk - 1) * 7 + i)); if (iso !== todayISO() && dayLog(d, iso)[key] != null) return true; } return false; };
  const pfSureAsk = (d) => pfAsk(d) && [1, 4, 12].indexOf(weekNo(d)) >= 0 && !pfWeekHas(d, 'pfs');
  const pfWayAsk = (d) => pfAsk(d) && [4, 8, 12].indexOf(weekNo(d)) >= 0 && !pfWeekHas(d, 'pfw');
  const pfCmpAsk = (d) => pfAsk(d) && weekNo(d) === 12 && !pfWeekHas(d, 'pfc');
  const pfChip = (m, key, k, lab) => '<button type="button" class="chip' + (m[key] === k ? ' on' : '') + '" data-ci-pf="' + key + ':' + k + '" aria-pressed="' + (m[key] === k) + '">' + esc(t(lab)) + '</button>';
  const pfRowQ = (m, h, key, opts) => '<div class="pl-ci-pfq"><span class="small pl-ci-slp-h">' + esc(t(h)) + '</span><div class="chips" role="group" aria-label="' + esc(t(h)) + '">' + opts.map((o) => pfChip(m, key, o[0], o[1])).join('') + '</div></div>';
  function pfQ(d, m) {
    const out = [];
    if (pfSureAsk(d)) out.push(pfRowQ(m, 'plan_pf_sure', 'pfs', [['y', 'plan_yes'], ['ns', 'plan_dx_ns'], ['n', 'plan_no']]) + (m.pfs === 'ns' || m.pfs === 'n' ? '<p class="small pl-ci-pfs-l">' + esc(t('plan_pf_sure_line')) + '</p>' : ''));
    if (pfWayAsk(d)) out.push(pfRowQ(m, 'plan_in_pfway', 'pfw', [['0', 'plan_pw_0'], ['1', 'plan_pw_1'], ['2', 'plan_pw_2'], ['3', 'plan_pw_3']]));
    if (pfCmpAsk(d)) out.push(pfRowQ(m, 'plan_pf_cmp', 'pfc', [['b', 'plan_pf_cmp_b'], ['s', 'plan_pf_cmp_s'], ['w', 'plan_pf_cmp_w']]));
    return out.length ? '<div class="card pl-ci-pf">' + out.join('') + '</div>' : '';
  }
  const lkQ = (m, d) => { const pf = pfLead(d); const hv = pf && ikOf(d).pft === 'heavy'; const h = t(hv ? 'plan_lk_hv' : 'plan_lk_h'); const lk = m.lk === 'some' || m.lk === 'most';
    return '<div class="card pl-ci-lk"><span class="eyebrow">' + esc(h) + '</span><div class="chips" role="group" aria-label="' + esc(h) + '">' + LK.map((k) => '<button type="button" class="chip' + (m.lk === k ? ' on' : '') + '" data-ci-lk="' + k + '" aria-pressed="' + (m.lk === k) + '">' + esc(t('plan_lk_' + k)) + '</button>').join('') + '</div>' +
      (lk && !pf ? '<p class="small">' + esc(t('post_tp_leak')) + '</p>' : '') + (lk && pf && ikOf(d).pft === 'ns' ? pfRowQ(m, 'plan_pf_when', 'pfwhen', [['stress', 'plan_pft_stress'], ['urge', 'plan_pft_urge'], ['both', 'plan_pft_both']]) : '') + '</div>'; };
  /* the weekly "How are you in yourself?" after day 41, in the recovery check's own reviewed words and its crisis card; it waits for
     the psychologist (SAKHI_CONFIG.drafts only), and to day 41 the recovery check asks it every evening */
  const MD = ['ok', 'low', 'anx', 'harm'];
  const mdAsk = (d) => !!(window.SAKHI_CONFIG || {}).drafts && weekAsk(d, 'md');
  /* Version 39.49 (night sweats and sleep): the midlife plan's hot-flush and sleep goals ask "How did you sleep?" on a card of its
     own, as a bedtime step does in other plans. "Hot flushes woke me" joins its answers for her hot-flush goal, or for a midlife
     woman with hot flushes in her diary in the last 30 days; never in discreet mode or on a shared phone. */
  const slpAsk = (d) => packOf(d) === 'meno' && (d.goalKey === 'hot' || d.goalKey === 'sleep');
  const hotRecent = () => { const dl = S.state.daily || {}; return Object.keys(dl).some((k) => k <= todayISO() && S.diffDays(S.fromISO(k), pToday()) <= 30 && (dl[k] || []).indexOf('d_hotflush') >= 0); };
  const slpHot = (d) => !disc() && !(S.state.settings || {}).shared && (d.goalKey === 'hot' || ((packOf(d) === 'meno' || !!(S.cycle && S.cycle.isMidlife && S.cycle.isMidlife())) && hotRecent()));
  const crisisHtml = () => '<div class="card dark urgent pl-ci-crisis" role="alert"><h3>' + esc(t('post_fl_harm_h')) + '</h3><p class="small">' + esc(t(died() ? 'post_fl_harm_b' : 'post_fl_harm')) + '</p>' + telRow(['14416', '112']) + '</div>';
  const mdQ = (m) => '<div class="card pl-ci-md"><span class="eyebrow">' + esc(t('plan_md_h')) + '</span><div class="chips" role="group" aria-label="' + esc(t('plan_md_h')) + '">' + MD.map((k) => '<button type="button" class="chip' + (m.md === k ? ' on' : '') + '" data-ci-md="' + k + '" aria-pressed="' + (m.md === k) + '">' + esc(t(k === 'harm' && died() ? 'post_mo_harm_b' : 'post_mo_' + k)) + '</button>').join('') + '</div>' +
    (m.md === 'harm' ? crisisHtml() : (m.md === 'low' || m.md === 'anx' ? '<p class="small">' + esc(t('plan_md_low')) + '</p>' : '')) + '</div>';
  function renderCheckin(v) {
    const d0 = raw(); if (!on() || !S.canSave() || !packOf(d0) || pausedFor(d0) || finished(fullD(d0))) { renderMyPlan(v); return; }
    if (recCi(d0)) { v.innerHTML = ''; location.replace('#post-recovery'); return; }   /* Version 39.46: to day 41 her evening form is the recovery check (its reminder opens it) */
    const d = D(); const acts = actionsFor(d); const m = S.mem.planCi = S.mem.planCi && S.mem.planCi.day === todayISO() ? S.mem.planCi : { day: todayISO(), sel: {}, bar: null, saved: null, edit: false };
    if (m.slp === undefined) m.slp = dayLog(d, todayISO()).slp || null;   /* Version 39.22: how she slept last night */
    if (m.mv === undefined) m.mv = dayLog(d, todayISO()).mv || null;   /* Version 39.34: her baby's movements today */
    if (m.pfs === undefined) { const l0 = dayLog(d, todayISO()); m.pfs = l0.pfs || null; m.pfw = l0.pfw != null ? String(l0.pfw) : null; m.pfc = l0.pfc || null; m.pfwhen = null; }   /* Version 39.56 */
    if (m.lk === undefined) m.lk = dayLog(d, todayISO()).lk || null; if (m.md === undefined) m.md = dayLog(d, todayISO()).md || null;   /* Version 39.46 */
    if (m.ms === undefined) { const ms0 = dayLog(d, todayISO()).ms; m.ms = ms0 == null ? null : +ms0; }   /* Version 39.51: her weekly number */
    const firstCi = !Object.keys(d.log).some((k) => k >= d.start && k < todayISO() && (d.log[k] || {}).ci);
    acts.forEach((a) => { if (!m.sel[a.id] && a.state) m.sel[a.id] = a.state; });
    const asked = acts.filter((a) => a.kind !== 'check' || a.ciAsk);
    /* Version 39.12 (plan audit gaps 1 and 3): a step that already counted today (her yoga, her plate, a tap on Today) shows as
       done, with where it was counted from, and isn't asked again; "Change an answer" opens them all. Bedtime is asked about last
       night, so the evening check-in never asks about a bedtime still to come. */
    const lg = dayLog(d, todayISO()); const pre = asked.filter((a) => a.state === 'd').map((a) => a.id);
    if (!m.edit) pre.forEach((id) => { m.sel[id] = 'd'; });
    const open = asked.filter((a) => m.edit || pre.indexOf(a.id) < 0);
    const fd0 = foodDay(d, todayISO()), fd1 = foodDay(d, S.toISO(S.addDays(pToday(), 1)));   /* V39.9 review FOOD-01: a chip only for a day it changes */
    const hd = lateNight() ? S.backRow(ciLabel(), 'home', false) : head('plan_ci_h', 'home');   /* Version 39.23: "How did Tuesday go?" after midnight */
    if (m.saved && m.saved.rest) {   /* Version 39.5: a rest day */
      v.innerHTML = hd + '<div class="card ok pl-fb" id="pl-ci-fb"><p class="lead">' + esc(t('plan_rest_saved')) + '</p><p class="small">' + esc(tf('plan_ci_week', { w: m.saved.w })) + '</p></div>' +
        '<div class="grid2"><button type="button" class="btn primary" data-go="home">' + esc(t('plan_ci_home')) + '</button><button type="button" class="btn" data-go="plan">' + esc(t('plan_ci_plan')) + '</button></div>';
      S.wire(v); return;
    }
    if (m.saved) {
      const s = m.saved; if (disc()) s.line = t('plan_fb_any');
      const goal = s.goal && !disc() ? '<span class="eyebrow">' + esc(t('plan_ci_goal_h')) + '</span><p class="lead pl-ci-goal">' + esc(s.goal) + '</p>' : '';   /* her goal */
      v.innerHTML = hd + '<div class="card ok pl-fb" id="pl-ci-fb">' + goal + '<p class="' + (goal ? 'pl-ci-why' : 'lead') + '">' + esc(s.line) + '</p>' + (disc() ? '' : whyBtn(s.why, 'pl-why', packOf(d))) + '<p class="small">' + esc(countLine(s.dn, s.pn, s.n) + ' · ' + tf('plan_ci_week', { w: s.w })) + '</p>' + (s.add ? '<p class="small pl-ci-add">' + esc(s.add) + '</p>' : '') +
        (s.str ? '<p class="small pl-ci-str">' + esc(s.str) + '</p>' : '') + (s.tom ? '<p class="small pl-ci-tomr">' + esc(s.tom) + '</p>' : '') +
        (s.tip ? '<p class="small">' + esc(s.tip) + '</p>' : '') + '<p class="small pl-ci-next">' + esc(tf(s.first && !s.tom ? 'plan_ci_tom' : 'plan_ci_see', { t: timeOf(ciAt(d)) })) + '</p>' + (s.petal ? '<p class="small pl-petal">' + S.icon('flower') + ' ' + esc(t('plan_ci_petal')) + '</p>' : '') + '</div>' + (s.md === 'harm' ? crisisHtml() : '') + (s.mv && s.mv !== 'usual' ? mvOut(s.mv) : (s.side ? sideCard() : '') + nightHtml(s)) +
        '<div class="grid2"><button type="button" class="btn primary" data-go="home">' + esc(t('plan_ci_home')) + '</button><button type="button" class="btn" data-go="plan">' + esc(t('plan_ci_plan')) + '</button></div>';
      S.wire(v); wireWhy(v); return;
    }
    const opt = (a, val, key) => '<button type="button" class="chip' + (m.sel[a.id] === val ? ' on' : '') + '" data-ci="' + a.id + ':' + val + '" aria-pressed="' + (m.sel[a.id] === val) + '">' + CI_SYM[val] + esc(t(key)) + '</button>';
    const anyMiss = () => asked.some((a) => m.sel[a.id] === 'n' || m.sel[a.id] === 'p');
    const nm = (a, done) => (disc() && a.priv ? discNm(a, acts) : (a.bed ? tf(done ? 'plan_ci_last_d' : 'plan_ci_last', { t: clockOf(a.bed) }) : a.title));
    /* Version 39.22: with last night's bedtime, how she slept (if she likes; a hard night brings a sound for tonight) */
    const slpChips = () => '<div class="chips" role="group" aria-label="' + esc(t('plan_ci_slp')) + '">' + ['well', 'ok', 'bad'].concat(slpHot(d) ? ['hot'] : []).map((k) => '<button type="button" class="chip' + (m.slp === k ? ' on' : '') + '" data-ci-slp="' + k + '" aria-pressed="' + (m.slp === k) + '">' + esc(t('plan_slp_' + k)) + '</button>').join('') + '</div>';
    const slpQ = (a) => (a.bed ? '<div class="pl-ci-slp"><span class="small pl-ci-slp-h">' + esc(t('plan_ci_slp')) + '</span>' + slpChips() + '</div>' : '');
    const slpCard = () => '<div class="card pl-ci-slpc"><span class="eyebrow">' + esc(t('plan_ci_slp')) + '</span>' + slpChips() + '</div>';   /* Version 39.49 */
    const left = open.filter((a) => !a.ciAsk).length;   /* Version 39.57: her folic question is optional */ const leftTxt = left ? tf(left === 1 ? 'plan_ci_left1' : 'plan_ci_left', { n: left }) : t('plan_ci_left0');
    const ico = (a) => '<span class="ico-sm hue hue-' + a.hue + '">' + a.icon + '</span>';
    const preRow = (a) => '<div class="pl-ci-row pl-ci-pre"><div class="row" style="gap:10px">' + ico(a) + '<span class="body"><strong>' + esc(nm(a, true)) + '</strong><span class="small pl-ci-ok">' + CI_SYM.d + esc(ciNote(a, lg)) + '</span></span></div>' + slpQ(a) + '</div>';
    const askRow = (a) => '<div class="pl-ci-row' + (a.ciAsk ? ' pl-ci-opt' : '') + '"><div class="row" style="gap:10px">' + ico(a) + '<strong>' + esc(nm(a)) + '</strong></div><div class="chips" role="group" aria-label="' + esc(nm(a)) + '">' +
      (a.bed ? opt(a, 'd', 'plan_ci_yes') + opt(a, 'p', 'plan_ci_close') + opt(a, 'n', 'plan_ci_no') : opt(a, 'd', 'plan_ci_d') + (a.once || a.noPart ? '' : opt(a, 'p', 'plan_ci_p')) + opt(a, 'n', 'plan_ci_n')) + '</div>' + slpQ(a) + '</div>';
    v.innerHTML = hd + '<p class="small pl-ci-date">' + esc(S.fmtD(pToday(), { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + leftTxt) + '</p>' +
      (firstCi && !ciDone(d) ? '<p class="small pl-ci-first">' + esc(t('plan_ci_first')) + '</p>' : '') +
      (!ciDone(d) && restLeft(d) > 0 && !acts.some((a) => a.state === 'd' || a.state === 'p' || (SAFE.indexOf(a.id) >= 0 && a.state !== 'd')) ? '<button type="button" class="btn block pl-rest-b" id="pl-ci-rest">' + esc(t('plan_rest_b')) + ' <span class="small">· ' + esc(tf('plan_rest_left', { n: restLeft(d) })) + '</span></button>' : '') +
      '<div class="card pl-ci">' + acts.filter((a) => a.kind === 'check' && !a.soft && !a.ciAsk).map((a) => '<div class="pl-ci-row"><div class="row" style="gap:10px">' + ico(a) + '<strong>' + esc(disc() && a.priv ? discNm(a, acts) : a.title) + '</strong></div>' + (a.state === 'd' ? '<p class="small pl-ci-ok">✓ ' + esc(t('plan_ci_chk_done')) + '</p>' : '<button type="button" class="btn sm" data-go="' + a.go + '">' + esc(t('plan_ci_chk_go')) + '</button>') + '</div>').join('') +
        asked.map((a) => (open.indexOf(a) >= 0 ? askRow(a) : preRow(a))).join('') + '</div>' +
      (pre.length && !m.edit ? '<button type="button" class="linkbtn pl-ci-edit" id="pl-ci-edit">' + esc(t('plan_ci_change')) + '</button>' : '') +
      (!disc() && (fd0 || fd1) ? '<div class="card pl-ci-fast"><span class="eyebrow">' + esc(t('plan_fast_h')) + '</span><div class="chips">' +
        [['pl-ci-fast-today', 'plan_fast_today', fastOn(d), fd0], ['pl-ci-fast-tom', 'plan_fast_tom', fastOn(d, S.toISO(S.addDays(pToday(), 1))), fd1]].filter((x) => x[3]).map((x) => '<button type="button" class="chip' + (x[2] ? ' on' : '') + '" id="' + x[0] + '" aria-pressed="' + !!x[2] + '">' + esc(t(x[1])) + '</button>').join('') + '</div></div>' : '') +   /* Version 39.9 */
      '<div class="card" id="pl-ci-bar"' + (anyMiss() ? '' : ' hidden') + '><span class="eyebrow">' + esc(t('plan_rev_b')) + '</span><div class="chips">' + BARS.filter((x) => !(disc() && x === 'pain') && !(pfLead(d) && x === 'out')).map((x) => '<button type="button" class="chip' + (m.bar === x ? ' on' : '') + '" data-ci-b="' + x + '">' + esc(t('plan_b_' + x)) + '</button>').join('') + '</div></div>' +
      (painAsk(d) ? '<div class="card pl-ci-pain">' + painQ(d) + '</div>' : '') + (ptAsk(d) ? ptCard(m) : '') + (pxAsk(d) ? pxQ(m) : '') +   /* Version 39.55 */ (mvAsk(d) ? mvQ(m) : '') + (lkAsk(d) ? lkQ(m, d) : '') + pfQ(d, m) + (mdAsk(d) ? mdQ(m) : '') + (slpAsk(d) && !asked.some((a) => a.bed) ? slpCard() : '') +   /* Version 39.46 */   /* Version 39.27 (R05): she skipped it on Today */
      (slpRest(d) && !slpAsk(d) && !asked.some((a) => a.bed) ? slpCard() : '') + (msAsk(d) || m.ms != null ? msQ(d, m) : '') +   /* Version 39.51: Rest asks how she slept; her weekly number */
      (S.feel && S.feel.on() ? '<div class="card pl-ci-feel"><span class="eyebrow">' + esc(t('feel_h')) + '</span>' + S.feel.chips(todayISO()) + '</div>' : '') +   /* Version 39.16 (R11): one evening ritual fills her plan and her Diary */
      '<p class="small pl-err" id="pl-ci-err" hidden>' + esc(t('plan_ci_need')) + '</p><button type="button" class="btn primary block" id="pl-ci-save">' + esc(t('plan_help_save')) + '</button>';
    S.wire(v); wirePain(v); wireMv(v, m);   /* Version 39.34 */
    v.querySelectorAll('[data-ci-pt]').forEach((b) => b.addEventListener('click', () => { const kv = kv2(b.dataset.ciPt); m.pt = m.pt || ptLoad(); m.pt[kv[0]] = m.pt[kv[0]] === kv[1] ? null : kv[1]; S.render(); }));   /* Version 39.55 */
    v.querySelectorAll('[data-ci-ptw]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciPtw; m.pt = m.pt || ptLoad(); m.pt.w[k] = !m.pt.w[k]; S.render(); }));
    v.querySelectorAll('[data-ci-px]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciPx; m.px = m.px === k ? null : k; S.render(); }));
    v.querySelectorAll('[data-ci-pf]').forEach((b) => b.addEventListener('click', () => { const kv = kv2(b.dataset.ciPf); m[kv[0]] = m[kv[0]] === kv[1] ? null : kv[1]; S.render(); }));   /* Version 39.56 */
    v.querySelectorAll('[data-ci-lk]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciLk; m.lk = m.lk === k ? null : k; S.render(); }));   /* Version 39.46 */
    v.querySelectorAll('[data-ci-md]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciMd; m.md = m.md === k ? null : k; S.render(); }));
    v.querySelectorAll('[data-ci-ms]').forEach((b) => b.addEventListener('click', () => { const n = +b.dataset.ciMs; m.ms = m.ms === n ? null : n;   /* Version 39.51 */
      v.querySelectorAll('[data-ci-ms]').forEach((x) => { const on1 = +x.dataset.ciMs === m.ms; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); }); }));
    v.querySelectorAll('[data-ci]').forEach((b) => b.addEventListener('click', () => { const kv = kv2(b.dataset.ci); m.sel[kv[0]] = kv[1];
      v.querySelectorAll('[data-ci^="' + kv[0] + ':"]').forEach((x) => { const on1 = x === b; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); });
      const bc = v.querySelector('#pl-ci-bar'); if (bc) bc.hidden = !anyMiss(); }));
    const ce = v.querySelector('#pl-ci-edit'); if (ce) ce.addEventListener('click', () => { m.edit = true; S.render(); });
    v.querySelectorAll('[data-ci-slp]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ciSlp; m.slp = m.slp === k ? null : k;
      v.querySelectorAll('[data-ci-slp]').forEach((x) => { const on1 = x.dataset.ciSlp === m.slp; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); }); }));
    v.querySelectorAll('[data-feel]').forEach((b) => b.addEventListener('click', () => { if (S.feel) S.feel.toggle(todayISO(), b.dataset.feel); S.render(); }));
    const ft = v.querySelector('#pl-ci-fast-today'); if (ft) ft.addEventListener('click', () => { const dd = D(); setFast(dd, todayISO(), !fastOn(dd)); S.save(); S.render(); });
    const fm = v.querySelector('#pl-ci-fast-tom'); if (fm) fm.addEventListener('click', () => { const dd = D(); const tm = S.toISO(S.addDays(pToday(), 1)); setFast(dd, tm, !fastOn(dd, tm)); S.save(); S.render(); });
    v.querySelectorAll('[data-ci-b]').forEach((b) => b.addEventListener('click', () => { m.bar = b.dataset.ciB; v.querySelectorAll('[data-ci-b]').forEach((x) => x.classList.toggle('on', x === b)); }));
    const rb = v.querySelector('#pl-ci-rest'); if (rb) rb.addEventListener('click', () => { const dd = D(); setRest(dd); remSync(dd); S.save(); m.saved = { rest: true, w: weekDays(dd, wkNow(dd)) }; S.render(); });
    v.querySelector('#pl-ci-save').addEventListener('click', () => {
      if (asked.some((a) => !a.ciAsk && !m.sel[a.id])) { v.querySelector('#pl-ci-err').hidden = false; return; }
      const dd = D(); asked.forEach((a) => { if (pre.indexOf(a.id) >= 0 && m.sel[a.id] === 'd') return; if (!m.sel[a.id]) return; markAction(dd, a, m.sel[a.id]); });   /* an optional question left empty saves nothing */   /* what counted already stays as it was counted */
      const x = dd.log[todayISO()] = dd.log[todayISO()] || {}; x.ci = 1; if (m.bar && anyMiss()) x.bar = m.bar; else delete x.bar;
      if (m.slp) x.slp = m.slp; else delete x.slp;   /* Version 39.22: a hard night goes in her diary as Poor sleep */
      if (pfSureAsk(dd) && m.pfs) x.pfs = m.pfs; if (pfWayAsk(dd) && m.pfw != null) x.pfw = +m.pfw; if (pfCmpAsk(dd) && m.pfc) x.pfc = m.pfc;   /* Version 39.56 */
      if (pfLead(dd) && ikOf(dd).pft === 'ns' && m.pfwhen && (m.lk === 'some' || m.lk === 'most')) dd.intake = Object.assign({}, ikOf(dd), { pft: m.pfwhen });   /* her answer sets her track */
      if (lkAsk(dd) && m.lk) x.lk = m.lk; if (mdAsk(dd) && m.md) x.md = m.md;   /* Version 39.46 */
      if (m.ms != null && msAsk(dd)) x.ms = m.ms;   /* Version 39.51 */
      if (ptAsk(dd) && m.pt) { const p = m.pt; x.pt = { soak: p.soak || null, night: !!p.w.night, day: !!p.w.day }; if (S.cycle && S.cycle.setFlowToday) S.cycle.setFlowToday({ soak: p.soak || null, clots: p.clots || null, leaked: !!p.w.leak }); }   /* Version 39.55 */
      if (pxAsk(dd) && m.px) x.px = m.px;
      if (mvAsk(dd) && m.mv) { x.mv = m.mv; if (m.mv !== 'usual') dd.intake = Object.assign({}, ikOf(dd), { pnow: todayISO() }); } else delete x.mv;   /* Version 39.34: less, not sure or none: her walk waits until she checks her answers again */
      const dl0 = () => ((S.state.daily || {})[todayISO()] || []);
      if ((m.slp === 'bad' || m.slp === 'hot') && S.feel && dl0().indexOf('d_sleep') < 0) S.feel.toggle(todayISO(), 'd_sleep');
      if (m.slp === 'hot' && S.feel && dl0().indexOf('d_hotflush') < 0) S.feel.toggle(todayISO(), 'd_hotflush');   /* Version 39.49: hot flushes woke her, so both go in her diary */
      const p0 = S.joy && S.joy.petals ? S.joy.petals() : 0; const tomL = ciTom(fullD(dd));
      const done = acts.filter((a) => m.sel[a.id] === 'd' || m.sel[a.id] === 'p'); const dl = done.filter((a) => m.sel[a.id] === 'd'); const pool = dl.length ? dl : done;
      const first = pool.length ? pool[(planDay(dd) - 1) % pool.length] : null;   /* Version 39.6 (P2-01): each evening, the reason of another step she did */
      const wpl = wpOf(dd); const tipOf = (b) => (wpl && wpl.ifb === b && wpl.ift ? tf('plan_ci_if', { x: ifText(b, wpl.ift) }) : tipT(dd, b));   /* Version 39.12: her own if-then plan first */
      m.saved = { why: first ? first.why : null, line: first ? t(first.why || 'plan_fb_any') : t('plan_ci_none'), a: done.length, n: held(acts.map((a) => Object.assign({}, a, { state: m.sel[a.id] || a.state }))).length, dn: acts.filter((a) => m.sel[a.id] === 'd').length, pn: acts.filter((a) => m.sel[a.id] === 'p').length, w: weekDays(dd, wkNow(dd)), tip: m.bar && m.bar !== 'none' && anyMiss() ? tipOf(m.bar) : '', first: firstCi,
        goal: done.length ? goalLine(dd) : '', str: ciStr(fullD(dd)), tom: tomL,
        slp: m.slp || null, md: mdAsk(dd) ? m.md || null : null, mv: mvAsk(dd) ? m.mv || null : null, side: mvAsk(dd), wind: windPick(dd), windOn: acts.some(windStep) && !(S.calm && S.calm.doneOn(todayISO())),
        add: done.length && !(tomL && (menoV2(dd) || perV2(dd))) ? (function () { const tmr = stepsFor(fullD(dd), S.toISO(S.addDays(pToday(), 1))); const miss = acts.filter((a) => m.sel[a.id] === 'n' && tmr.some((y) => y.id === a.id && (y.r || null) === (a.r || null))); return miss.length ? tf('plan_ci_add', { x: miss.map((a) => (disc() && a.priv ? discNm(a, acts) : (a.name || a.title))).join(', ') }) : ''; })() : '' };   /* Version 39.51 (Mohit's phone test): only a step tomorrow has, and none when tomorrow's own line names them all */   /* Version 39.13 */
      remSync(dd); S.save();
      const rel = S.joy && S.joy.release ? S.joy.release() : false;   /* what her plan's first day earned, celebrated now */
      m.saved.petal = !!rel || (S.joy && S.joy.petals ? S.joy.petals() : 0) > p0;
      S.render();
    });
  }

  /* Version 39.22: after the check-in, tonight's session; after a hard night, yoga nidra or a sound for sleep */
  function nightHtml(s) {
    /* Version 39.49: hot flushes woke her: keep cool tonight, and the hot-flush routine for a flush that wakes her (yoga nidra too) */
    if (s.slp === 'hot') return '<div class="card pl-night pl-night-hot"><div class="row pl-night-h"><span class="pl-night-i" aria-hidden="true">' + S.icon('moon') + '</span><h3>' + esc(t('plan_night_hot_h')) + '</h3></div><p class="small">' + esc(t('plan_night_hot_p')) + '</p>' +
      '<button type="button" class="btn block pl-night-a" data-go="relief-hot">' + PLAY_SVG + esc(t('relief_hot_t') + (S.relief && S.relief.mins ? ' · ' + tf(calmOn() ? 'calm_min' : 'relief_mins', { n: S.relief.mins('hot') }) : '')) + '</button>' +
      (calmOn() ? '<button type="button" class="btn block pl-night-b" data-go="calm-nidra">' + PLAY_SVG + esc(t('calm_nidra') + ' · ' + tf('calm_min', { n: S.calm.mins('nidra') })) + '</button>' : '') +
      '<p class="small pl-night-n">' + esc(t('plan_night_hot_noted')) + '</p></div>';
    if (!calmOn()) return '';
    if (s.slp === 'bad') return '<div class="card pl-night"><div class="row pl-night-h"><span class="pl-night-i" aria-hidden="true">' + S.icon('moon') + '</span><h3>' + esc(t('plan_night_h')) + '</h3></div><p class="small">' + esc(tf('plan_night_p', { n: S.calm.timer() })) + '</p>' +
      '<button type="button" class="btn block pl-night-a" data-go="calm-nidra">' + PLAY_SVG + esc(t('calm_nidra') + ' · ' + tf('calm_min', { n: S.calm.mins('nidra') })) + '</button>' +
      '<button type="button" class="btn block pl-night-b" data-go="calm-bowl">' + PLAY_SVG + esc(t('calm_bowl') + ' · ' + tf('calm_min', { n: S.calm.timer() })) + '</button>' +
      '<p class="small pl-night-n">' + esc(t('plan_night_noted')) + '</p></div>';
    if (!s.windOn || !s.wind) return '';
    return '<div class="list pl-tonight"><button type="button" class="item" data-go="calm-' + s.wind + '"><span class="ico-sm hue hue-purple">' + S.icon('moon') + '</span><span class="body"><strong>' + esc(t('plan_tonight')) + '</strong><span>' + esc(S.calm.short(s.wind) + ' · ' + tf('calm_min', { n: S.calm.mins(s.wind) })) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>';
  }
  /* ---------- My plan: the 12-week path, today's steps, the look-back, results and her care team ---------- */
  function pathHtml(d, fold) {
    const kept = !!(d.keep && weekNo(d) > N); const wk = kept ? weekNo(d) : Math.max(1, Math.min(weekNo(d), N)); const pk = packOf(d);
    if (babyD(d)) {   /* Version 39.32: Getting ready's 4 parts, this one marked, and her doctor month */
      if (disc()) return '';   /* Version 39.51 (Mohit's phone test): its parts name her tablet and his part, so a shared phone sees none, as in a pregnancy */
      /* Version 39.41 (Mohit's three-plan walk): a part that has passed is drawn as passed, never a tick (she may not have done it), as her pregnancy's path is (Version 39.35) */
      const wn = weekNo(d); const cur = bphOf(wn);
      return '<div class="card pl-path pl-bpath"><div class="row spread"><h3>' + esc(t('plan_path_h')) + '</h3><span class="small">' + esc(kept ? t('plan_wk_keep') : tf('plan_wk', { n: wk })) + '</span></div>' +
        '<div class="pl-dots" aria-hidden="true">' + Array.from({ length: N }, (x, i) => '<i class="' + (i + 1 < wk || kept ? 'on' : (i + 1 === wk ? 'now' : '')) + '"></i>').join('') + '</div><ol class="pl-steps">' +
        BPH.map((p) => { const past = wn > p[2]; return '<li class="' + (past ? 'gone' : (p === cur ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true"></span><span class="body"><strong>' + esc(t('plan_bph_' + p[0] + 'w')) + '</strong><span class="small">' + esc(t('plan_bph_' + p[0])) + '</span></span></li>'; }).join('') + '</ol>' + bdocMonth() + '</div>';
    }
    if (menoV2(d)) {   /* Version 39.51: her 3 parts in the order her goal needs, this one marked, then her year */
      if (disc()) return '';   /* Version 39.51 (Mohit's phone test): its parts name hot flushes, worry and sleep, so a shared phone sees none */
      const wn = weekNo(d); const ML = S.midlife && S.midlife.lesson; const rows = m2Order(d).split('').map((p, i) => [p, i * 4 + 1, i * 4 + 4]).concat([['k', N + 1, 9999]]);
      return '<div class="card pl-path pl-m2path"><div class="row spread"><h3>' + esc(t('plan_path_h')) + '</h3><span class="small">' + esc(kept ? t('plan_wk_keep') : tf('plan_wk', { n: wk })) + '</span></div>' +
        '<div class="pl-dots" aria-hidden="true">' + Array.from({ length: N }, (x, i) => '<i class="' + (i + 1 < wk || kept ? 'on' : (i + 1 === wk ? 'now' : '')) + '"></i>').join('') + '</div><ol class="pl-steps">' +
        rows.map((r) => { const past = wn > r[2]; const now = wn >= r[1] && wn <= r[2]; return '<li class="' + (past ? 'gone' : (now ? 'now' : '')) + '" data-m2p="' + r[0] + '"><span class="pl-sdot" aria-hidden="true"></span><span class="body"><strong>' + esc(r[0] === 'k' ? t('plan_m2_year') : (ML ? ML.part(r[0]) : r[0])) + '</strong><span class="small">' + esc(r[0] === 'k' ? t('plan_m2_year_s') : tf('plan_m2_wks', { a: r[1], b: r[2] }) + ' · ' + t('plan_m2_p_' + r[0])) + '</span></span></li>'; }).join('') + '</ol>' +
        '<p class="small pl-m2-str">' + esc(tf('plan_m2_str_all', { r: rName(ikOf(d).mheart === 'y' ? 'gentle' : 'strength') })) + '</p></div>';
    }
    if (pk === 'preg') {
      if (disc()) return '';   /* trimesters are pregnancy words; a pregnancy has no 12-week path either */
      const pi = S.preg && S.preg.info ? S.preg.info() : null; const w = pi ? pi.weeks : 0; const tri = w < 14 ? 1 : (w < 28 ? 2 : 3);
      return '<div class="card pl-path"><div class="row spread"><h3>' + esc(t('plan_path_preg_h')) + '</h3></div><ol class="pl-steps">' +   /* Version 39.5: her week is the page's clock line */
        [1, 2, 3].map((k) => '<li class="' + (k < tri ? 'gone' : (k === tri ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true"></span><span class="body"><strong>' + esc(t('plan_tri_' + k)) + '</strong><span class="small">' + esc(t('plan_tri_' + k + '_p')) + '</span></span></li>').join('') + '</ol></div>';
    }
    if (pk === 'post' && postV2(d)) {   /* Version 39.46: her year in 5 parts, by her days since the birth */
      if (disc()) return ''; const n = bDays(todayISO()) || 0; const ph = n <= 13 ? 1 : (n <= 41 ? 2 : (n <= 125 ? 3 : (n <= 182 ? 4 : 5)));
      const b0 = (S.state.situation || {}).deliveredOn; const yr = b0 ? S.fmtD(S.addDays(S.fromISO(b0), 365), { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return '<div class="card pl-path pl-ppath"><div class="row spread"><h3>' + esc(t('plan_pq_h')) + '</h3></div><ol class="pl-steps">' +
        [1, 2, 3, 4, 5].map((k) => '<li class="' + (k < ph ? 'gone' : (k === ph ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true"></span><span class="body"><strong>' + esc(k === 5 ? tf('plan_pq_5', { d: yr }) : t('plan_pq_' + k)) + '</strong><span class="small">' + esc(t('plan_pq_' + k + 'p')) + '</span></span></li>').join('') + '</ol></div>';
    }
    if (pk === 'post') {   /* Version 39.5 (journey audit P2-19): her weeks after the birth, not "of 12" */
      if (disc()) return '';
      const b = (S.state.situation || {}).deliveredOn; const w = b ? Math.floor(S.diffDays(S.fromISO(b), pToday()) / 7) + 1 : 1; const ph = w <= 6 ? 1 : (w <= 12 ? 2 : 3);
      return '<div class="card pl-path"><div class="row spread"><h3>' + esc(t('plan_path_post_h')) + '</h3></div><ol class="pl-steps">' +
        [1, 2, 3].map((k) => '<li class="' + (k < ph ? 'past' : (k === ph ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true">' + (k < ph ? '✓' : '') + '</span><span class="body"><strong>' + esc(t('plan_pp_' + k)) + '</strong><span class="small">' + esc(t('plan_pp_' + k + '_p')) + '</span></span></li>').join('') + '</ol></div>';
    }
    const mc = !disc() && !careTime(d) && !pregnant() && planWeeks(d) === N;   /* Version 39.15: the 4-week check, where there is one */
    const focus = (k) => { if (k === 4) return t(mc ? 'plan_path_r4' : 'plan_path_m4'); if (k === 8) return t(mc ? 'plan_path_r8' : 'plan_path_m8'); if (k === N) return t('plan_path_r12');
      if (pk === 'cycle') { const h = HABITS.find((x) => x.wk === k + 2 * (d.hab0 || 0)); return tf('plan_path_cyc', { m: target(d, k) }) + (h ? ' · ' + tf('plan_path_new', { h: tx(h.h) }) : ''); }
      return t('plan_path_light'); };
    const ks = kept ? [wk] : [wk - 1, wk, wk + 1, wk < 4 ? 4 : (wk < 8 ? 8 : N)].filter((k, i, l) => k >= 1 && k <= N && l.indexOf(k) === i);   /* after 12 weeks: this week */
    if (!kept && ks.indexOf(N) < 0) ks.push(N);
    const li = (k) => '<li class="' + (k < wk ? 'past' : (k === wk ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true">' + (k < wk ? '✓' : '') + '</span><span class="body"><strong>' + esc(k === wk ? t('plan_path_now') + ' · ' + tf('plan_wk_s', { n: k }) : tf('plan_wk_s', { n: k })) + '</strong><span class="small">' + esc(focus(k)) + '</span></span></li>';
    /* Version 39.19: after her first week, last week and this week; every week ahead one tap away */
    const ahead = []; if (fold && !kept) for (let k = wk + 1; k <= N; k++) ahead.push(k);
    return '<div class="card pl-path"><div class="row spread"><h3>' + esc(t('plan_path_h')) + '</h3><span class="small">' + esc(kept ? t('plan_wk_keep') : tf('plan_wk', { n: wk })) + '</span></div>' +
      '<div class="pl-dots" aria-hidden="true">' + Array.from({ length: N }, (x, i) => '<i class="' + (i + 1 < wk ? 'on' : (i + 1 === wk ? 'now' : '')) + '"></i>').join('') + '</div><ol class="pl-steps">' +
      (fold && !kept ? ks.filter((k) => k <= wk) : ks).map(li).join('') + '</ol>' +
      (ahead.length ? '<details class="pl-path-more" data-pl-fold="path"' + (foldOpen('path') ? ' open' : '') + '><summary class="linkbtn">' + esc(t('plan_path_ahead')) + '</summary><ol class="pl-steps">' + ahead.map(li).join('') + '</ol></details>' : '') + '</div>';
  }
  /* Version 39.22: after her first week, her 12 weeks and what consistency brings are one card: this week and next, her stage in
     one line, her 4-week check when it is due, and every week, the timeline and her own signs one tap away */
  const weeksOne = (d) => { const pk = packOf(d); return !!(pk && pk !== 'preg' && pk !== 'post' && planWeeks(d) === N && !(d.keep && weekNo(d) > N)); };
  function weeksCard(d) {
    const wk = Math.max(1, Math.min(weekNo(d), N)); const pk = packOf(d); const mc = !disc() && !careTime(d) && !pregnant();
    const focus = (k) => { if (k === 4) return t(mc ? 'plan_path_r4' : 'plan_path_m4'); if (k === 8) return t(mc ? 'plan_path_r8' : 'plan_path_m8'); if (k === N) return t('plan_path_r12');
      if (pk === 'cycle') { const h = HABITS.find((x) => x.wk === k + 2 * (d.hab0 || 0)); return tf('plan_path_cyc', { m: target(d, k) }) + (h ? ' · ' + tf('plan_path_new', { h: tx(h.h) }) : ''); }
      if (babyD(d)) return t(disc() ? 'plan_path_light' : 'plan_bph_' + bphOf(k)[0]);   /* Version 39.32: Getting ready's part */   /* Version 39.51 (Mohit's phone test): not on a shared phone */
      if (menoV2(d) && !disc()) { const ML = S.midlife && S.midlife.lesson; const p = m2Order(d).charAt(Math.min(2, Math.floor((k - 1) / 4))); if (ML && p) return ML.part(p) + ' · ' + t('plan_m2_p_' + p); }   /* Version 39.51: her part, as week 1's path card names it */
      return t('plan_path_light'); };
    const now = wk <= 4 ? 0 : 1; const stage = pk === 'cycle' && !disc() ? '<p class="small pl-wk-stage">' + esc(t('plan_ex_' + (now + 1)) + ': ' + t('plan_ex_' + (now + 1) + '_p')) + '</p>' : '';
    const li = (k) => '<li class="' + (k < wk ? 'past' : (k === wk ? 'now' : '')) + '"><span class="pl-sdot" aria-hidden="true">' + (k < wk ? '✓' : '') + '</span><span class="body"><strong>' + esc(k === wk ? t('plan_path_now') + ' · ' + tf('plan_wk_s', { n: k }) : tf('plan_wk_s', { n: k })) + '</strong><span class="small">' + esc(focus(k)) + '</span></span></li>';
    const all = []; for (let k = 1; k <= N; k++) all.push(k); const cons = consCard(d, false);
    const mr = mcRow(d).replace('<div class="list pl-mc-rowl">', '<div class="list pl-mc-rowl pl-mc-in">');
    return '<div class="card pl-path pl-weeks"><div class="row spread"><h3>' + esc(t('plan_path_h')) + '</h3><span class="small">' + esc(tf('plan_wk', { n: wk })) + '</span></div>' +
      '<div class="pl-dots" aria-hidden="true">' + Array.from({ length: N }, (x, i) => '<i class="' + (i + 1 < wk ? 'on' : (i + 1 === wk ? 'now' : '')) + '"></i>').join('') + '</div>' +
      '<dl class="pl-kv"><dt>' + esc(t('plan_kv_this')) + '</dt><dd>' + esc(focus(wk)) + '</dd>' + (wk < N && focus(wk + 1) !== focus(wk) ? '<dt>' + esc(t('plan_kv_next')) + '</dt><dd>' + esc(focus(wk + 1)) + '</dd>' : '') + '</dl>' + stage + (babyD(d) ? bdocMonth() : '') + mr +
      '<details class="pl-path-more" data-pl-fold="path"' + (foldOpen('path') ? ' open' : '') + '><summary class="linkbtn">' + esc(t('plan_path_all')) + '</summary><ol class="pl-steps">' + all.map(li).join('') + '</ol>' + cons.replace('<div class="card pl-cons">', '<div class="pl-cons pl-cons-in">') + '</details></div>';
  }
  /* Version 39.40 (Mohit's 39-week walk): on her doctor's route, her own doctor first: Call, or add the number (Version 39.41: in every plan) */
  const myDocRow = () => { if (disc() || !S.mydoc || !S.canSave() || (S.care && S.care.gov && S.care.gov())) return ''; const n = S.mydoc.get();
    return n ? '<a class="item pl-mydoc" href="tel:' + esc(n) + '"><span class="ico-sm hue hue-rose">' + S.icon('steth') + '</span><span class="body"><strong>' + esc(t('mydoc_call')) + '</strong><span>' + esc(n) + '</span></span><span class="chev">' + S.I.chev + '</span></a>'
      : '<button type="button" class="item pl-mydoc" data-mydoc="1"><span class="ico-sm hue hue-rose">' + S.icon('steth') + '</span><span class="body"><strong>' + esc(t('mydoc_h')) + '</strong><span>' + esc(t('mydoc_add')) + '</span></span><span class="chev">' + S.I.chev + '</span></button>'; };
  function careTeam(fold) {
    const row = (go, ico, title, sub) => '<button type="button" class="item" data-go="' + go + '"><span class="ico-sm hue hue-rose">' + ico + '</span><span class="body"><strong>' + esc(title) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span><span class="chev">' + S.I.chev + '</span></button>';
    const sec = (list) => (fold ? foldCard('pl-care', t('plan_ct_h'), t('plan_ct_sum'), list) : '<section class="care-sec pl-sec pl-care"><h2>' + esc(t('plan_ct_h')) + '</h2>' + list + '</section>');   /* Version 39.19: one row after her first week */
    const free = S.routeOwner('access-doctor') ? row('access-doctor', S.icon('steth'), t('plan_rv_free'), t('plan_ct_free_s')) : '';
    const qura = disc() ? row('ask', S.icon('steth'), t('plan_ct_qura'), t('plan_ct_qura_s')) : '<button type="button" class="item" data-ask="' + esc(tf('plan_ask_q', { t: packTitle(raw() || {}) })) + '"><span class="ico-sm hue hue-rose">' + S.icon('steth') + '</span><span class="body"><strong>' + esc(t('plan_ct_qura')) + '</strong><span>' + esc(t('plan_ct_qura_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button>';   /* Version 39.6 (P2-11) */
    return sec('<div class="list">' + myDocRow() + byRoute(free, qura) +
      row('report', S.icon('file'), t('plan_ct_report'), '') + row('help', S.I.help, t('help'), t('plan_ct_help_s')) + '</div>');
  }
  /* Version 39.46: her leaks by birth week from week 3: days 14 to 41 from her recovery check's own "Leaking", then her weekly answer */
  const leakWeeks = (d) => { const b = (S.state.situation || {}).deliveredOn; const nNow = bDays(todayISO()); if (!b || nNow == null) return []; const out = []; const b0 = S.fromISO(b);
    for (let w = 3; (w - 1) * 7 <= nNow; w++) { const a = S.addDays(b0, (w - 1) * 7); let v = null;
      if (w <= 6) { const r = S.post && S.post.leaks ? S.post.leaks(S.toISO(a), S.toISO(S.addDays(a, 6))) : null; if (r && r.n >= 2) v = r.k === 0 ? 'never' : (r.k >= 4 ? 'most' : 'some'); }
      else for (let i = 0; i < 7; i++) { const x = dayLog(d, S.toISO(S.addDays(a, i))).lk; if (x) v = x; }
      if (v) out.push({ w: w, v: v }); }
    return out; };
  const leakCmp = (d) => { const L = leakWeeks(d); if (!L.length) return null; const f = L[0], l = L[L.length - 1];
    return { a: tf('plan_res_lk_w', { x: t('plan_lk_' + f.v), n: f.w }), b: L.length > 1 ? tf('plan_res_lk_w', { x: t('plan_lk_' + l.v), n: l.w }) : '…' }; };
  function lightResults(d) {
    const wk = wkNow(d); const out = [];
    const ks = []; for (let k = Math.max(1, wk - 11); k <= wk; k++) ks.push(k);   /* the latest 12 weeks */
    /* Version 39.8: the weeks still to come as outlines, and a line instead of an empty chart */
    const pw = !d.keep && planWeeks(d); const fut = []; if (pw) for (let k = wk + 1; k <= Math.min(pw, ks[0] + 11); k++) fut.push(k);
    out.push('<div class="card"><h3>' + esc(t('plan_res_days')) + '</h3><div class="pl-days">' + ks.map((k) => { const n = weekDays(d, k); return '<span class="pl-dbar" title="' + esc(tf('plan_wk_s', { n: k })) + '"><i style="height:' + Math.round((n / 7) * 100) + '%"></i><b>' + n + '</b><span class="small">' + k + '</span></span>'; }).join('') +
      fut.map((k) => '<span class="pl-dbar fut" aria-hidden="true"><i></i><b></b><span class="small">' + k + '</span></span>').join('') + '</div>' + (wk > 1 || followedDays(d) ? '' : '<p class="small pl-first">' + esc(t('plan_res_first')) + '</p>') + '</div>');
    const pk = packOf(d); const sit = S.state.situation || {};
    if (['pain', 'heavy', 'pms'].indexOf(pk) >= 0 && !sit.stopped && !sit.hysterectomy) {
      const c = cycleCompare(d); if (c.before.length || c.since.length) out.push('<div class="card"><h3>' + esc(t('plan_prog_cyc')) + '</h3>' + cmp(esc(beforeTxt(c)), c.since.length ? esc(sinceTxt(c)) : '…') + '</div>');
    }
    const ik = ikOf(d); const said = (k) => esc(tf('plan_prog_said', { g: k }));
    if (pk === 'pain' || perGoalOn(d, 'pain')) { const p = painCompare(d); if (p.b || p.s) out.push('<div class="card"><h3>' + esc(t('plan_prog_pain')) + '</h3>' + cmp(p.b ? esc(tf('plan_prog_pain_n', { a: p.bp, n: p.b })) : (ik.pain ? said(t('plan_pn_' + ik.pain)) : '–'), p.s ? esc(tf('plan_prog_pain_n', { a: p.sp, n: p.s })) : '–') + '</div>'); }
    if (pk === 'heavy' || perGoalOn(d, 'heavy')) { const h = heavyCompare(d); if (h.b || h.s) out.push('<div class="card"><h3>' + esc(t('plan_res_heavy')) + '</h3>' + cmp(h.b ? esc(tf('plan_prog_pain_n', { a: h.bh, n: h.b })) : (ik.pads ? said(t('plan_pa_' + ik.pads.slice(1))) : '–'), h.s ? esc(tf('plan_prog_pain_n', { a: h.sh, n: h.s })) : '–') + '</div>'); }
    if (perV2(d)) out.push(perWayCards(d));   /* Version 39.55: her evening answers, day by day */
    if (disc()) return out.slice(0, 1).join('');   /* a shared phone: only the days she followed her plan */
    if (pfLead(d)) out.push.apply(out, pfResults(d));   /* Version 39.56 */
    if (postV2(d)) { const lk = leakCmp(d); if (lk) out.push('<div class="card pl-res-lk"><h3>' + esc(t('plan_res_lk')) + '</h3>' + cmp(esc(lk.a), esc(lk.b), 'plan_prog_first', 'plan_prog_last') + '</div>'); }   /* Version 39.46 */
    if (pk === 'ttc' && S.ttc && S.ttc.prepDone) { const pr = S.ttc.prepDone(); const br = babyD(d) ? resultOf(d, true) : null; if (br && br.only) out.push('<div class="card pl-bres"><h3>' + esc(br.h) + '</h3><p>' + esc(br.only) + '</p></div>');   /* Version 39.32 (packet K1); Version 39.33: her checklist's count only in its own card */
      out.push('<div class="card pl-prep-res"><h3>' + esc(t('plan_res_prep_h')) + '</h3><p>' + esc(tf('plan_res_prep', { a: pr.a, b: pr.b })) + '</p><button type="button" class="btn sm" data-go="ttc-prep">' + esc(t('plan_res_prep_b')) + '</button></div>'); }
    if (pk === 'meno' && S.meno && S.meno.trend && ['hot', 'sleep', 'mood'].indexOf(d.goalKey) >= 0 && !(d.goalKey === 'hot' && resultOf(d))) {
      const k = d.goalKey; const st0 = S.fromISO(d.start); const m0 = S.addDays(st0, -((st0.getDay() + 6) % 7));   /* the Monday of the week she started */
      const b = S.meno.trend(k, S.toISO(S.addDays(m0, -28)), S.toISO(S.addDays(m0, -1))); const mT = S.addDays(pToday(), -((pToday().getDay() + 6) % 7)); const f0 = S.addDays(mT, -21); const n = S.meno.trend(k, S.toISO(f0 > m0 ? f0 : m0), todayISO());   /* this week and the 3 before */
      out.push('<div class="card"><h3>' + esc(t('plan_res_meno_' + k)) + '</h3>' + (b.weeks || n.weeks ? cmp(b.weeks ? esc(tf('plan_res_wks', { a: b.on, n: b.weeks })) : '–', n.weeks ? esc(tf('plan_res_wks', { a: n.on, n: n.weeks })) : '–', 'plan_res_wk_b', 'plan_res_wk_s') : '<p class="small">' + esc(t(k === 'hot' ? 'plan_res_hot_none' : 'plan_res_meno_none')) + '</p>') + '</div>');
    }
    if (pk === 'pms' || (pk === 'post' && d.goalKey === 'mood') || (pk === 'meno' && (d.goalKey === 'mood' || d.goalKey === 'hot'))) {
      const r = resultOf(d);   /* review RESULTS-05: one count, the same as the end page's (none when she logged nothing) */
      if (r && r.lb === 'plan_res_low_b') out.push('<div class="card"><h3>' + esc(r.h) + '</h3>' + cmp(esc(r.b), esc(r.s), r.lb, r.ls) + '</div>');
    }
    const cc = checksCard(d); if (cc) out.push(cc);   /* Version 39.12 */
    return out.join('');
  }
  /* Version 39.55 (the test pass): the days her evening answers said it got in her way, since she started */
  function perWayCards(d) {
    const st = d.start; const out = []; const ik = ikOf(d); const ks = Object.keys(d.log || {}).filter((k) => k >= st).sort();
    if (perGoalOn(d, 'pms')) { const n = ks.filter((k) => d.log[k].px === 'lot').length; const any = ks.some((k) => d.log[k].px);
      if (any || ik.pmsLevel) out.push('<div class="card pl-res-px"><h3>' + esc(t('plan_prog_pxl')) + '</h3>' + cmp(ik.pmsLevel ? esc(tf('plan_prog_said', { g: t('plan_pl_' + ik.pmsLevel) })) : '–', any ? esc(tf('plan_prog_dn', { n: n })) : '…') + '</div>'); }
    if (perGoalOn(d, 'heavy')) { const lk = {}; (S.state.events || []).forEach((e) => { if (FLOW_T.indexOf(e.t) >= 0 && e.d >= st && e.leaked) lk[e.d] = 1; });
      ks.forEach((k) => { const p = d.log[k].pt; if (p && (p.night || p.day)) lk[k] = 1; }); const pd = ks.some((k) => d.log[k].pt) || Object.keys(lk).length;
      if (pd) out.push('<div class="card pl-res-pt"><h3>' + esc(t('plan_prog_hway')) + '</h3>' + cmp('–', esc(tf('plan_prog_dn', { n: Object.keys(lk).length }))) + '<p class="small">' + esc(t('plan_prog_hway_p')) + '</p></div>'); }
    return out.join('');
  }
  function heavyCompare(d) {
    const st = d.start; const hv = (e) => (S.cycle && S.cycle.heavyEv ? S.cycle.heavyEv(e) : e.pads === 'pads_4' || e.clots === 'clots_2' || e.leaked);   /* review ENGINE-05 */
    const ps = periodsOf().filter((p) => perHas(p, (e) => e.pads || e.clots || e.leaked));   /* only periods she said how heavy they were */
    const b = ps.filter((p) => p.d0 < st).slice(-3), s = ps.filter((p) => p.d0 >= st); const isH = (p) => perHas(p, hv);
    return { b: b.length, bh: b.filter(isH).length, s: s.length, sh: s.filter(isH).length };
  }
  function settingsHtml(d, page) {
    const remOn = !!(S.reminders.get('plan') && S.reminders.get('plan').on !== false);
    return '<section class="care-sec pl-sec">' + (page ? '' : '<h2>' + esc(t('plan_set_h')) + '</h2>') + '<div class="list"><label class="item"><span class="body"><strong>' + esc(t('plan_remind')) + '</strong><span>' + esc(ciAt(d) !== (d.remAt || '20:00') ? tf('plan_rem_after', { t: timeOf(ciAt(d)) }) : timeOf(ciAt(d))) + '</span></span><input type="checkbox" id="pl-rem"' + (remOn ? ' checked' : '') + '></label>' +
      '<button type="button" class="item" id="pl-chg"><span class="body"><strong>' + esc(t('plan_set_goal')) + '</strong><span>' + esc(t(d.pack === 'preg' ? 'plan_set_goal_s2' : 'plan_set_goal_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' +
      (remOn ? '<div class="chips">' + (EVE.indexOf(ciAt(d)) >= 0 ? EVE : EVE.concat([ciAt(d)]).sort()).map((x) => '<button type="button" class="chip' + (ciAt(d) === x ? ' on' : '') + '" data-pl-at="' + x + '">' + esc(timeOf(x)) + '</button>').join('') + '</div>' : '') +
      (remOn && S.alerts && S.alerts.can && S.alerts.can() && !S.alerts.on() ? '<div class="card warn"><p class="small">' + esc(t('plan_notif_off')) + '</p><button type="button" class="btn sm" id="pl-notif">' + esc(t('plan_notif_on')) + '</button></div>' : '') +
      /* Version 39.12 (gaps 4 and 5): her week, and the nudge at her time to move (off unless she turns it on) */
      (movesOn(d) ? '<div class="list pl-wp-set">' +   /* Version 39.15: Plan this week is in My plan's This week */
        '<label class="item"><span class="body"><strong>' + esc(t('plan_nudge')) + '</strong><span>' + esc(d.when && NUDGE_AT[d.when] ? tf('plan_nudge_s', { w: t('plan_w_' + d.when), t: timeOf(NUDGE_AT[d.when]) }) : t('plan_nudge_none')) + '</span></span><input type="checkbox" id="pl-nudge"' + (nudgeOn() ? ' checked' : '') + '></label></div>' +
        '<p class="small pl-nudge-n">' + esc(t('plan_nudge_n')) + '</p>' : '') +
      (windOk(d) && windAt(d) ? '<div class="list pl-wind-set"><label class="item"><span class="body"><strong>' + esc(t('plan_wind_rem')) + '</strong><span>' + esc(windNear(d, windAt(d)) ? t('plan_wind_rem_ci') : tf('plan_wind_rem_s', { t: timeOf(windAt(d)) })) + '</span></span><input type="checkbox" id="pl-wind"' + (d.wind !== false ? ' checked' : '') + '></label></div>' : '') +   /* Version 39.22 */
      (selfPaused(d) ? '<div class="list"><button type="button" class="item" id="pl-unpause"><span class="body"><strong>' + esc(t('plan_unpause')) + '</strong><span>' + esc(tf('plan_paused_til', { d: S.fmtD(S.fromISO(d.pauseUntil), { day: 'numeric', month: 'short' }) })) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>'
        : (careTime(d) || !d.start || d.start > todayISO() ? '' : '<div class="list"><button type="button" class="item" id="pl-pause"><span class="body"><strong>' + esc(t('plan_pause')) + '</strong><span>' + esc(t('plan_pause_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>')) +
      (S.mem.planStop ? '<div class="card warn"><p>' + esc(t('plan_stop_q')) + '</p><div class="grid2"><button type="button" class="btn" id="pl-stop-no">' + esc(t('plan_cancel')) + '</button><button type="button" class="btn primary" id="pl-stop-yes">' + esc(t('plan_stop_yes')) + '</button></div>' + (selfPaused(d) || careTime(d) || !d.start || d.start > todayISO() ? '' : '<button type="button" class="linkbtn" id="pl-pause-alt">' + esc(t('plan_stop_or')) + '</button>') + '</div>' : '<button type="button" class="linkbtn" id="pl-stop">' + esc(t('plan_stop')) + '</button>') + '</section>';
  }
  function wireSettings(v) {
    const rm = v.querySelector('#pl-rem'); if (rm) rm.addEventListener('change', () => { if (rm.checked) remOnNow(D()); else S.reminders.remove('plan'); S.saveQuiet(); S.render(); });
    const nb = v.querySelector('#pl-notif'); if (nb) nb.addEventListener('click', () => { if (S.alerts && S.alerts.ask) S.alerts.ask(() => S.render()); });
    v.querySelectorAll('[data-pl-at]').forEach((b) => b.addEventListener('click', () => { const dd = D(); dd.remAt = b.dataset.plAt; dd.remPick = true; remOnNow(dd); S.saveQuiet(); S.render(); }));
    const cg = v.querySelector('#pl-chg'); if (cg) cg.addEventListener('click', () => { S.mem.planIntake = { stage: stageNowKey(), iq: 0 }; S.setHash('plan-goal'); });
    const wp = v.querySelector('#pl-wp'); if (wp) wp.addEventListener('click', () => { S.mem.planWkFrom = 'plan'; S.setHash('plan-week'); });   /* Version 39.12 */
    const ng = v.querySelector('#pl-nudge'); if (ng) ng.addEventListener('change', () => { const dd = D();
      if (ng.checked && !(dd.when && NUDGE_AT[dd.when])) { ng.checked = false; S.mem.planNudgeAsk = true; S.mem.planWkFrom = 'plan'; S.setHash('plan-week'); return; }   /* her time first */
      dd.nudge = ng.checked; delete dd.nudgeHeld; if (ng.checked) nudgeSync(dd, true); else S.reminders.remove('plan-nudge'); S.saveQuiet(); S.render(); });
    const wn = v.querySelector('#pl-wind'); if (wn) wn.addEventListener('change', () => { const dd = D(); dd.wind = wn.checked; delete dd.windGone; if (wn.checked) windSync(dd, true); else S.reminders.remove('plan-wind'); S.saveQuiet(); S.render(); });   /* Version 39.22 */
    const sp = v.querySelector('#pl-stop'); if (sp) sp.addEventListener('click', () => { S.mem.planStop = true; S.render(); });
    const sn = v.querySelector('#pl-stop-no'); if (sn) sn.addEventListener('click', () => { S.mem.planStop = false; S.render(); });
    const sy = v.querySelector('#pl-stop-yes'); if (sy) sy.addEventListener('click', () => { closePlan(D()); S.mem.planStop = false; S.saveQuiet(); if (S.route() === 'plan-settings') S.setHash('plan'); else S.render(); });   /* Version 39.5: her results stay as "Your last plan" */
  }
  /* the tab: her plan, or "What do you want to work on?" */
  function renderMyPlan(v) {
    if (!on()) { v.innerHTML = '<h1>' + esc(t('plan_my_h')) + '</h1><div class="card soft"><p>' + esc(t('plan_off')) + '</p></div>'; S.wire(v); return; }
    S.mem.planFrom = 'plan'; pauseSync();
    const d = raw(); const pk = S.canSave() ? packOf(d) : null;
    if (pk && !pausedFor(d)) { renderProgramme(v, fullD(d), true); recordsRow(v); planRows(v, d); return; }   /* Version 39.5: one page for every plan */
    const why = pk ? pausedFor(d) : (S.canSave() && nextOf(d) ? pausedFor(viewOf(d)) : null);
    if (S.canSave() && upcoming(d)) { renderSoon(v, d); return; }
    if (S.canSave() && pendingOk(d)) { renderReveal(v); return; }
    const st = stageNowKey(); const ik = S.state.intake || {};
    /* Version 39.0: for 6 weeks after a loss, the loss pages and Help, and goals only when she asks */
    if (S.canSave() && lossNow() && !S.mem.lossPick) {
      v.innerHTML = '<h1>' + esc(t('plan_my_h')) + '</h1><div class="card soft pl-loss"><p>' + esc(t(disc() ? 'plan_paused_loss_d' : 'plan_paused_loss')) + '</p>' + (d && d.pack === 'ttc' && !disc() ? '<p class="small">' + esc(t('plan_bloss')) + '</p>' : '') + '<div class="list">' +   /* Version 39.32 (packet J5) */
        (!disc() && S.routeOwner('loss') ? '<button type="button" class="item" data-go="loss"><span class="body"><strong>' + esc(t('loss_hub')) + '</strong><span>' + esc(t('loss_hub_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button>' : '') +
        '<button type="button" class="item" data-go="help"><span class="body"><strong>' + esc(t('help')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button></div>' +
        '<button type="button" class="linkbtn" id="pl-loss-pick">' + esc(t('plan_pick_ready')) + '</button></div>';
      S.wire(v); v.querySelector('#pl-loss-pick').addEventListener('click', () => { S.mem.lossPick = true; S.mem.discPick = true; S.render(); }); return;
    }
    /* Version 39.0 (journey audit J-12): a shared phone shows no goal names until she asks */
    if (S.canSave() && disc() && !S.mem.discPick) {
      const chg0 = changedWhy(d);   /* Version 39.5: the neutral "Your plan has changed" card, before any goal names */
      v.innerHTML = '<h1>' + esc(t('plan_my_h')) + '</h1>' + (chg0 ? changedCard(d, chg0) : '') + '<div class="card soft"><p>' + esc(t('plan_h_d')) + '</p><button type="button" class="btn primary block" id="pl-disc-pick">' + esc(t('plan_pick_ready')) + '</button></div>';
      S.wire(v); wireChange(v); v.querySelector('#pl-disc-pick').addEventListener('click', () => { S.mem.discPick = true; S.render(); }); return;
    }
    /* paused (a pregnancy, or the first 6 weeks after a birth): why, and the plans for now; a new one replaces the paused one */
    /* Version 39.5: when her stage stopped her plan, one card that offers the plan for her new stage; and her last plan */
    const chg = S.canSave() ? changedWhy(d) : null;
    const paused = (chg ? changedCard(d, chg) : (why && why !== 'loss' && why !== 'poi' ? '<div class="card warn pl-paused"><p>' + esc(t(why === 'preg' ? 'plan_paused_preg' : 'plan_paused_post')) + '</p>' + (S.routeOwner(why === 'preg' ? 'preg-plan' : 'post-pelvic') ? '<button type="button" class="btn sm" data-go="' + (why === 'preg' ? 'preg-plan' : 'post-pelvic') + '">' + esc(t(why === 'preg' ? 'plan_go_preg' : 'plan_go_post')) + '</button>' : '') + '</div>' : '')) + (S.canSave() ? pastCard(d) : '');
    const pick = S.canSave() ? paused + '<div class="card pl-pick"><h2>' + esc(t('plan_my_pick_h')) + '</h2><p class="small">' + esc(t(ik.goal === 'track' ? 'plan_my_track' : 'plan_my_pick_p')) + '</p><div class="list">' + goalsFor({ stage: st }).filter((k) => k !== 'track').map((k) => '<button type="button" class="item" data-pl-pick="' + k + '"><span class="body"><strong>' + esc(goalName(k)) + '</strong></span>' + (k === suggestedGoal(st) ? '<span class="pill ok pl-sugg">' + esc(t('plan_suggested')) + '</span>' : '') + '<span class="chev">' + S.I.chev + '</span></button>').join('') + '</div></div>' : '';
    const pick2 = poiHold() && st === 'meno' && S.canSave() ? poiHtml() : pick;   /* Version 39.51 (the midlife walk): before 40, the gynaecologist first, not goals that lead nowhere; Version 39.53 (Mohit's phone test): the card alone, as "Your last plan" above it read as if her resting plan had ended */
    renderPlans(v, { h: 'plan_my_h', top: pick2, bare: !!chg, skip: S.canSave() && goalsFor({ stage: st }).indexOf('pmos') >= 0 ? ['plan-pmos'] : [] }); wireChange(v); wirePoi(v);   /* Version 39.42: "I have PMOS" is its row */
    v.querySelectorAll('[data-pl-pick]').forEach((b) => b.addEventListener('click', () => { S.mem.planIntake = { stage: st, goal: b.dataset.plPick, iq: 1 }; S.setHash('plan-goal'); }));
  }
  /* Version 39.1 (roadmap 39.1): what her records point to, as one row under My plan's heading. The plan never works it out
     itself (decision 5a); it shows explain's top open finding, and the row opens What your diary shows. Not on a shared phone. */
  function recordsRow(v) {
    if (!S.canSave() || disc() || !S.explain || !S.explain.top || !S.explain.label) return;
    const f = S.explain.top(); if (!f || ['now', 'today'].indexOf(f.lv) < 0) return; const lb = S.explain.label(f);   /* Version 39.37: one home: Today and Cycles hold the rest */
    const el = document.createElement('div'); el.className = 'list pl-xp';
    el.innerHTML = '<button type="button" class="item"><span class="ico-sm hue hue-' + esc(lb.hue) + '">' + S.I.help + '</span><span class="body"><strong>' + esc(lb.t) + '</strong><span>' + esc(lb.lv) + '</span></span><span class="chev">' + S.I.chev + '</span></button>' +
      (lb.call ? '<div class="row wrap pl-xp-call">' + (lb.call === '14416' ? '<a class="btn sm primary" href="tel:14416">' + esc(t('call_b')) + ' 14416</a>' : '') + '<a class="btn sm primary" href="tel:112">' + esc(t('call_b')) + ' 112</a></div>' : '');   /* review PRIVACY-04 */
    el.querySelector('button').addEventListener('click', () => S.setHash('explain'));
    const h = v.querySelector('.pl-head') || v.querySelector('h1'); if (h && h.parentNode === v) h.insertAdjacentElement('afterend', el); else v.insertBefore(el, v.firstChild);   /* Version 39.22: after her title and its gear */
  }
  /* Version 39.2 (journey audit J-11): the goal her own records point to, marked "Suggested" (never on a shared phone) */
  const suggestedGoal = (st) => { if (disc() || !S.canSave()) return null; const s = signals(); const ok = (g) => goalsFor({ stage: st }).indexOf(g) >= 0 ? g : null;
    return (s.pcos && ok('pmos')) || (s.heavy >= 2 && ok('heavy')) || (s.pain >= 2 && ok('pain')) || (s.long >= 2 && ok('irregular')) || null; };
  /* Version 39.2: My plan's own rows: "My baby is born" in the pregnancy plan from week 28, and her garden at the end */
  function planRows(v, d) {
    const add = (html, cls) => { const el = document.createElement('div'); el.className = 'list ' + cls; el.innerHTML = html; v.appendChild(el); return el; };
    const row = (r, ico, hue, ttl, sub) => '<button type="button" class="item" data-go="' + r + '"><span class="ico-sm hue hue-' + hue + '">' + ico + '</span><span class="body"><strong>' + esc(ttl) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span><span class="chev">' + S.I.chev + '</span></button>';
    const pk = packOf(d); const b = (S.state.situation || {}).deliveredOn; const early = pk === 'post' && !!b && S.diffDays(S.fromISO(b), pToday()) < 42;
    /* Version 39.5: My food and Yoga and moves are the plan's own tiles (renderProgramme); 40+ keeps strength first */
    if (pk === 'meno' && !early && !menoV2(d)) S.wire(add(row('plan-r-strength', ICO.move, 'gold', t('plan_r_strength'), ''), 'pl-moves-row'));   /* Version 39.51 (Mohit's phone test): version 2 has strength as a step and on Moves and calm */
    const pi = S.preg && S.preg.info ? S.preg.info() : null;
    if (packOf(d) === 'preg' && pi && pi.weeks >= 28 && S.openStage) { const el = add('<button type="button" class="item"><span class="ico-sm hue hue-plum">' + S.icon('baby') + '</span><span class="body"><strong>' + esc(t(disc() ? 'stage_change' : 'bb_born')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button>', 'pl-born'); el.querySelector('button').addEventListener('click', () => S.openStage('post')); }
  }
  /* a plan that starts tomorrow or on Monday: when, her first step, and "Start today instead" */
  function renderSoon(v, d) {
    const a = actionsFor(Object.assign(fullD(d), { start: todayISO() }))[0]; const nm = stepName(a);
    v.innerHTML = '<h1>' + esc(packTitle(d)) + '</h1>' + pendBanner() + '<div class="card pl-soon"><h3>' + esc(tf('plan_th_soon', { d: dayWord(d.start) })) + '</h3>' + (nm ? '<p>' + esc(tf('plan_th_first', { a: nm })) + '</p>' : '') +
      '<p class="small">' + esc(tf('plan_sl_d1_p0', { t: timeOf(ciAt(d)) })) + '</p><button type="button" class="btn sm" id="pl-soon-now">' + esc(t('plan_soon_now')) + '</button></div>' +
      careTeam() + settingsHtml(d) + '<p class="footnote">' + esc(footT(d)) + '</p>';
    S.wire(v); wireSettings(v);
    v.querySelector('#pl-soon-now').addEventListener('click', () => { const dd = D(); dd.start = todayISO(); remOnNow(dd, true); S.save(); S.setHash('home'); });
  }
  /* a new plan she made while on this one waits for her on My plan too */
  const perBanner = (d) => (perNow(d) ? '<div class="card soft pl-per" data-nofold="1"><p>' + (babyD(d) ? '<strong>' + esc(t('plan_bper_h')) + '</strong> ' : '') + esc(perLine(d)) + '</p></div>' : '');
  const pendBanner = () => (pendingOk(raw()) ? '<div class="card soft pl-pend" data-nofold="1"><h3>' + esc(t('plan_sl_new_h')) + '</h3><p class="small">' + esc(t('plan_rv_repl')) + '</p><button type="button" class="btn sm primary" data-go="plan-reveal">' + esc(t('plan_sl_go_b')) + '</button></div>' : '');
  /* "What do you want to work on?" for a woman who joined before Version 37, or who changes her goal */
  function renderGoalFlow(v) {
    if (!on() || !S.canSave()) { renderMyPlan(v); return; }
    const a = S.mem.planIntake = S.mem.planIntake || { stage: stageNowKey(), iq: 0 }; a.stage = a.stage || stageNowKey();
    const total = a.goal ? screensOf(a).length : 5;
    const chip = (attr, val, label, on1) => '<button type="button" class="chip ob-c' + (on1 ? ' on' : '') + '" ' + attr + '="' + esc(String(val)) + '" aria-pressed="' + !!on1 + '">' + esc(label) + '</button>';
    const headF = (title, p) => '<div class="ob-top"><button type="button" class="iconbtn" id="pl-in-back" aria-label="' + esc(t('back')) + '">' + S.I.back + '</button><div class="progress" aria-hidden="true">' + Array.from({ length: total }, (x, i) => '<i class="' + (i <= (a.iq || 0) ? 'on' : '') + '"></i>').join('') + '</div></div><h1>' + esc(title) + '</h1>' + (p ? '<p>' + esc(p) + '</p>' : '');
    renderIntake(v, a, { head: headF, chip: chip, back: (fn) => { const b = v.querySelector('#pl-in-back'); if (b) b.addEventListener('click', fn); },
      done: () => { const ans = Object.assign({}, a); const one = !!ans.fromJoin; delete ans.known; delete ans.edit; delete ans.fromJoin; S.mem.planIntake = null; const dd = startFromIntake(ans); S.mem.rvOne = one && !!dd; S.mem.rvCard = 0; S.save(); S.setHash(dd ? 'plan-reveal' : 'plan'); },
      prev: () => { const back = a.fromJoin ? 'your-sakhi' : 'plan'; S.mem.planIntake = null; S.setHash(back); }, redraw: () => S.render() });
  }

  /* ---------- Today: her plan's line in the Today card, and its cards in the "Sakhi says" slot ---------- */
  /* Version 39.27 (minimalism audit R03): day 85 on, until she opens her results: her 12 weeks are done and her steps carry on,
     her results one tap away and a Stop she can see */
  const carryRow = () => '<div class="pl-carry"><p class="small"><strong>' + esc(t('plan_end_h')) + '</strong> ' + esc(t('plan_carry_p')) + '</p>' + (S.mem.planStopT
    ? '<p class="small">' + esc(t('plan_stop_q')) + '</p><div class="row wrap"><button type="button" class="btn sm" id="pl-carry-no">' + esc(t('plan_cancel')) + '</button><button type="button" class="btn sm primary" id="pl-carry-yes">' + esc(t('plan_stop_yes')) + '</button></div>'
    : '<div class="row wrap"><button type="button" class="btn sm primary" data-go="plan-end">' + esc(t('plan_end_b')) + '</button><button type="button" class="btn sm" id="pl-carry-stop">' + esc(t('plan_carry_stop')) + '</button></div>') + '</div>';
  function todayHead() {
    if (!planOn()) return ''; const d = raw();
    /* a plan that starts tomorrow or on Monday: when, and its first step; no steps yet */
    if (upcoming(d)) {
      const a = actionsFor(Object.assign(fullD(d), { start: todayISO() }))[0]; const nm = stepName(a);
      return '<div class="pl-th pl-th-soon"><button type="button" class="pl-th-plan" data-go="plan"><span class="eyebrow">' + esc(packTitle(d)) + '</span><span class="small">' + esc(tf('plan_th_soon', { d: dayWord(d.start) }) + (nm ? ' · ' + tf('plan_th_first', { a: nm }) : '')) + '</span></button></div>';
    }
    const pk = packOf(d); if (!pk || pausedFor(d)) return '';
    /* Version 39.5: paused for a week: until when, and "Start again now" */
    if (selfPaused(d)) return '<div class="pl-th pl-th-pause"><button type="button" class="pl-th-plan" data-go="plan"><span class="eyebrow">' + esc(packTitle(d)) + '</span><span class="small">' + esc(tf('plan_paused_til', { d: S.fmtD(S.fromISO(d.pauseUntil), { weekday: 'long', day: 'numeric', month: 'short' }) })) + '</span></button><button type="button" class="btn sm" id="pl-unpause">' + esc(t('plan_unpause')) + '</button></div>';
    /* Version 37.2: her weeks are done: it says so, and opens her results */
    if (finished(fullD(d))) return '<div class="pl-th"><button type="button" class="pl-th-plan" data-go="plan"><span class="eyebrow">' + esc(packTitle(d)) + '</span><span class="small">' + esc(t(d.keep ? 'plan_year_h' : 'plan_end_h')) + '</span></button><button type="button" class="btn sm primary" data-go="plan">' + esc(t('plan_end_b')) + '</button></div>';
    const dd = fullD(d); const acts = actionsFor(dd); if (!acts.length) return '';
    const done = acts.filter((a) => a.state === 'd').length; const part = acts.filter((a) => a.state === 'p').length; const ci = ciDone(dd); const day = planDay(dd);
    const rem = dd.remAt || '20:00'; const rest = isRest(dd); const req = held(acts); const full = !rest && done === req.length;   /* Version 39.37 */ const ciNow = ciDueNow(dd, acts);
    /* Version 39.14: a notice gets a line of its own; her week's dots now carry "Yesterday" and her week line the strength day */
    let sub = '';
    if (day >= 2) {
      if (day === 3 && !full) sub = t('plan_th_d3');
      /* Version 39.5: back after 2 quiet days or more: welcome back, and nothing to catch up */
      let quiet = 0; for (let i = 1; i <= 7; i++) { const iso = S.toISO(S.addDays(pToday(), -i)); if (iso < dd.start || dayDone(dd, iso)) break; quiet++; }
      if (quiet >= 2) sub = t('plan_th_wb');
    }
    if (lightOn(dd)) sub = tf('plan_th_light', { d: weekdayOf(dd.light.until) });   /* Version 39.12 */
    const left = acts.filter((a) => a.state !== 'd'); const one = !ci && acts.length > 1 && left.length === 1 ? tf('plan_th_one', { a: stepName(left[0]) || t('plan_today_d') }) : '';   /* Version 39.13: her day's last step */
    if (one) sub = one;
    if (rest) sub = t('plan_th_rest');
    if (pk === 'pms' && calmWeek() && !disc()) sub = t('plan_calm');   /* Version 38 (ux-gaps E6): the days before her likely period */
    const pq = painAsk(dd); if (perNow(dd)) sub = perLine(dd, pq);
    const offer = !ci && !rest && !full && restLeft(dd) > 0 && !careTime(dd) && hardDay();   /* never in pregnancy or the first 6 weeks after a birth */   /* her own log of a hard day: Sakhi offers a rest day */
    /* R4: "plan day", never just "Day" (Cycle day stays the only plain day count); the check-in's time until it is due */
    const top = '<div class="pl-th"><button type="button" class="pl-th-plan" data-go="plan"><span class="eyebrow">' + esc(packTitle(dd) + ' · ' + ebLine(dd)) + '</span></button></div>';   /* her check-in's time or "Checked in" sits under her steps (todayFoot), so her 4 steps fit the first screen */
    const wl = weekLine(dd); const cr = dd.carried && !dd.endSeen ? carryRow() : '';   /* Version 39.27 (R03) */
    if (full) return top + cr + nightBar() + dayDoneHtml(dd, ci, '<div class="pl-wk">' + weekDots(dd) + (wl ? '<p class="small pl-wl">' + wl + '</p>' : '') + '</div>');   /* R2: a full day closes itself */
    /* R1, R5: her week as 7 small dots (today ringed) and today's count on one line; a notice, else her week's line, under it.
       Two short lines, as Version 39.13's were, so her steps keep their place on the first screen at 360 px. */
    const dq = pq ? null : dayQKey(dd, acts);   /* Version 39.66: a question on its day */
    return top + cr + nightBar() + '<div class="pl-t7">' + weekDots(dd, true) + '<span class="small pl-t4-n">' + esc(rest ? t('plan_rest_pill') : countLine(done, part, req.length)) + '</span></div>' +
      (sub ? '<p class="small pl-th-y pl-th-str">' + esc(sub) + '</p>' : (wl ? '<p class="small pl-wl">' + wl + '</p>' : '')) +
      (pq ? painQ(dd) + (perNow(dd) ? '<p class="small pl-th-y">' + esc(t('plan_per_pain')) + '</p>' : '') : '') +   /* Version 39.27 (R05) */
      (dq ? dayQHtml(dq) : '') +
      (offer ? '<div class="pl-th-rest"><span class="small">' + esc(t('plan_rest_q')) + '</span><button type="button" class="btn sm" id="pl-rest-yes">' + esc(t('plan_rest_yes')) + '</button></div>' : '');
  }
  /* the plan's card for the slot: her plan waiting to be started, her first day, the doctor check, a Qura doctor on day 3,
     a restart after a few quiet days, a month done. In discreet mode only the cards written in plain words (data-disc-ok). */
  function planCard() {
    if (!planOn()) return ''; const d = raw(); const pr = S.state.prompts || {};
    const card = (cls, h, p, btns, ok) => '<div class="card soft pl-slot ' + cls + '" data-nofold="1"' + (ok ? ' data-disc-ok="1"' : '') + '><h3>' + esc(h) + '</h3>' + (p ? '<p class="small">' + esc(p) + '</p>' : '') + (btns ? '<div class="row wrap">' + btns + '</div>' : '') + '</div>';
    if (pendingOk(d)) {
      const nm = stepName(actionsFor(viewOf(d))[0]); const run = !!runningD();
      return card('pl-sl-go', t(run ? 'plan_sl_new_h' : 'plan_sl_go_h'), run ? t('plan_rv_repl') : (nm ? tf('plan_sl_go_p', { a: nm }) : ''),
        '<button type="button" class="btn sm primary" data-go="plan-reveal">' + esc(t('plan_sl_go_b')) + '</button>' + (run ? '<button type="button" class="btn sm" id="pl-next-drop">' + esc(t('plan_sl_keep')) + '</button>' : ''), true);
    }
    const chg = changedWhy(d); if (chg) return changedCard(d, chg, true);   /* Version 39.5 */
    if (poiDue() && !(packOf(d) && pausedFor(d) === 'poi')) return poiHtml(false);   /* Version 39.65: before 40, her doctor first while her plan runs on (a plan held for her doctor shows the card in its own place, Version 39.53) */
    const fit = fitWhy(d); if (fit) return fitCard(d, fit);   /* Version 39.48: her stage moved between tracking and trying */
    const pk = packOf(d); if (!pk || pausedFor(d) || selfPaused(d)) return '';
    const k = cardKind(d); const dd = fullD(d); const acts = actionsFor(dd); const first = acts[0]; const day = planDay(dd); const easy = acts.find((a) => a.id === 'move') || first;   /* Version 39.13: a restart starts with her walk */
    if (postV2(dd) && S.post && S.post.sixSync) S.post.sixSync();   /* Version 39.46: a changed birth date moves her 6-week check */
    pfSync(d);   /* Version 39.56: her morning set's ring follows her day */
    remWords(dd);   /* Version 39.47: as Today draws, her tablet's reminder follows her weeks, and the evening's its words */
    if (k === 'post2' || k === 'pv2') return postCardHtml(dd, k === 'pv2' ? 'pv2' : postDue(dd));   /* Version 39.46 */
    if (k === 'meno2' || k === 'mpv2') return menoCardHtml(dd, k === 'mpv2' ? 'mpv2' : menoDue(dd));   /* Version 39.51 */
    if (k === 'pf') return pfCardHtml(dd, pfDue(dd));   /* Version 39.56 */
    if (k === 'per2' || k === 'ppv2') return perCardHtml(dd, k === 'ppv2' ? 'ppv2' : perDue(dd));   /* Version 39.55 */
    if (k === 'pause') return card('pl-sl-pause', t('plan_sl_pause_h'), t('plan_sl_pause_p'), '<button type="button" class="btn sm primary" id="pl-pause-go">' + esc(t('plan_pause')) + '</button><button type="button" class="btn sm" id="pl-pause-not">' + esc(t('plan_rec_not')) + '</button>', true);
    if (k === 'end') return card('pl-sl-end', t(dd.keep ? 'plan_year_h' : 'plan_end_h'), babyD(dd) && !dd.keep ? t('plan_bend_p') : tf('plan_end_p', { n: followedDays(dd), t: (dd.keep ? keepUntil(dd) : planWeeks(dd)) * 7 }), '<button type="button" class="btn sm primary" data-go="plan">' + esc(t('plan_end_b')) + '</button>', true);
    if (k === 'd1') { const nm = stepName(first); return card('pl-sl-d1', t('plan_sl_d1_h'), nm ? tf('plan_sl_d1_p', { a: nm, t: timeOf(ciAt(dd)) }) : tf('plan_sl_d1_p0', { t: timeOf(ciAt(dd)) }), '', true); }
    if (k === 'month') { const mth = weekNo(dd) === 5 ? 1 : 2;   /* Version 39.6 (journey audit P2-13): the month's summary itself */
      const wsum = (a, b) => { let n = 0; for (let w = a; w <= b; w++) n += weekDays(dd, w); return n; }; const now = wsum(mth * 4 - 3, mth * 4);
      const lines = [sinceLast(dd) >= 3 && first ? tf('plan_sl_m_lp', { d: S.fmtD(S.fromISO(dd.start), { day: 'numeric', month: 'short' }), a: stepName(easy) || t('plan_today_d') }) : '',
        mth > 1 ? tf('plan_m_days', { a: now, b: wsum(1, 4) }) : tf('plan_m_days1', { a: now }), disc() ? '' : resultText(dd), docCase(dd) && dd.doc !== 'done' && !disc() ? t('plan_m_doc') : ''].filter(Boolean);
      return '<div class="card soft pl-slot pl-sl-m" data-nofold="1" data-disc-ok="1"><h3>' + esc(tf('plan_sl_m_h', { n: mth })) + '</h3>' + lines.map((x) => '<p class="small">' + esc(x) + '</p>').join('') + '<div class="row wrap">' + (mcDue(dd) ? '<button type="button" class="btn sm primary" data-go="plan-check">' + esc(tf('plan_mc_b', { n: mcDue(dd) * 4 })) + '</button>' : '') + '<button type="button" class="btn sm' + (mcDue(dd) ? '' : ' primary') + '" id="pl-m-go">' + esc(t('plan_sl_m_b')) + '</button>' + (docCase(dd) && dd.doc !== 'done' && !disc() ? '<button type="button" class="btn sm" id="pl-doc-yes">' + esc(t('plan_sl_doc_yes')) + '</button>' : '') + (sinceLast(dd) >= 3 ? '<button type="button" class="btn sm" data-go="plan">' + esc(t('plan_sl_lapse_b')) + '</button>' : '') + '</div></div>'; }   /* review DOCTOR-08: after day 21 the check can still be recorded here */
    if (k === 'rev') return acts.length ? '' : reviewCard(dd, true);   /* Version 39.14 (R6): inside her Today card, above her steps */
    if (k === 'doc' && babyD(dd) && !disc()) { const bd = babyDoc(dd);   /* Version 39.32: day 1 to 21, her version's card in short */
      return '<div class="card warn pl-slot pl-sl-doc pl-sl-bdoc" data-nofold="1"><h3>' + esc(bd.h) + '</h3>' + bd.lines.slice(0, 2).map((x) => '<p class="small">' + esc(x) + '</p>').join('') + '<p class="small">' + esc(bd.free) + '</p><div class="row wrap"><button type="button" class="btn sm primary" id="pl-doc-yes">' + esc(t('plan_sl_doc_yes')) + '</button><button type="button" class="btn sm" id="pl-doc-later">' + esc(t('plan_bdoc_later')) + '</button></div></div>'; }
    if (k === 'pos') return card('pl-sl-pos', t('plan_bpos_h'), t('plan_bpos_p'), '<button type="button" class="btn sm primary" id="pl-pos-yes">' + esc(t('plan_bpos_yes')) + '</button><button type="button" class="btn sm" id="pl-pos-not">' + esc(t('plan_rec_not')) + '</button>');   /* Version 39.32 (packet J3) */
    if (k === 'psafe') { const why = psafeDue(dd); return card('pl-sl-psafe' + (why === 'now' ? ' pl-ps-now' : ''), t('plan_ps_re_h'), t(why === 'now' && !disc() ? 'plan_ps_re_now' : 'plan_ps_re_p'), '<button type="button" class="btn sm primary" data-go="plan-psafe">' + esc(t('plan_ps_re_go')) + '</button>' + (why === 'now' ? '' : '<button type="button" class="btn sm" id="pl-ps-same">' + esc(t('plan_ps_re_same')) + '</button>'), true); }   /* Version 39.34: neutral words, so it shows on a shared phone too */
    if (k === 'doc') { const de = docEntry(dd) || {};
      const extra = disc() ? '' : (de.check && S.routeOwner(de.check) && (!S.toolShown || S.toolShown(de.check)) ? '<button type="button" class="btn sm" data-go="' + de.check + '">' + esc(t('explain_check')) + '</button>' : (de.go && S.routeOwner(de.go) ? '<button type="button" class="btn sm" data-go="' + de.go + '">' + esc(tileTitle(de.go)) + '</button>' : ''));
      return '<div class="card warn pl-slot pl-sl-doc" data-nofold="1" data-disc-ok="1" data-slot-first="1"><h3>' + esc(t('plan_sl_doc_h')) + '</h3><p class="small">' + esc(t(disc() ? 'plan_doc_d' : (docCase(dd) === 'plan_rv_doc_cyc' ? 'plan_sl_doc_p' : docCase(dd)))) + '</p><div class="row wrap"><button type="button" class="btn sm primary" id="pl-doc-yes">' + esc(t('plan_sl_doc_yes')) + '</button>' + byRoute(S.routeOwner('access-doctor') && !docR() ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '', '<button type="button" class="btn sm pl-doc-qura" data-ask="' + (disc() ? '' : esc(packTitle(dd))) + '">' + esc(t('ask_qura')) + '</button>') + extra + '<button type="button" class="btn sm" id="pl-doc-later">' + esc(t('plan_rv_later')) + '</button></div></div>'; }
    if (k === 'said') return card('pl-sl-said', t('plan_said_h'), t('plan_said_p'), SAID[pk].map((x) => '<button type="button" class="btn sm' + (x === SAID[pk][0] ? ' primary' : '') + '" data-said="' + x + '">' + esc(t('plan_said_' + x)) + '</button>').join(''));
    if (k === 'due') { const de = dueEntry(dd); return card('pl-sl-due', t('plan_due_h'), de.reasons ? t('plan_doc_ttc_now') : tf(String(de.text).replace(/^@/, ''), { n: de.months || '' }), (de.go && S.routeOwner(de.go) ? '<button type="button" class="btn sm primary" data-go="' + de.go + '">' + esc(t('plan_due_go')) + '</button>' : '') + (S.routeOwner('access-doctor') ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '') + '<button type="button" class="btn sm" id="pl-due-not">' + esc(t('plan_rec_not')) + '</button>'); }
    if (k === 'm4') return '<div class="card soft pl-slot pl-sl-m4" data-nofold="1"><h3>' + esc(t('plan_m4_h')) + '</h3>' + (resultText(dd) ? '<p class="small">' + esc(resultText(dd)) + '</p>' : '') + '<p class="small">' + esc(tf('plan_m4_days', { n: followedDays(dd) })) + '</p><div class="row wrap"><button type="button" class="btn sm primary" id="pl-m4-go">' + esc(t('plan_m4_b')) + '</button><button type="button" class="btn sm" data-go="report-show">' + esc(t('plan_end_show')) + '</button></div></div>';
    /* Mohit, 24 Oct: on day 3, once, a Qura doctor for her questions (the "Ask Qura to call me" page shares only what she ticks) */
    if (k === 'call') return card('pl-sl-call', t('plan_sl_call_h'), t('plan_sl_call_p'), '<button type="button" class="btn sm primary" id="pl-call-go">' + esc(t('plan_rv_qura')) + '</button><button type="button" class="btn sm" id="pl-call-not">' + esc(t('plan_rec_not')) + '</button>');
    if (k === 'quiet') return quietCard(dd);   /* Version 39.12 (gap 7) */
    if (k === 'lapse') return card('pl-sl-lapse', t('plan_sl_lapse_h'), (pToday().getDay() === 1 ? t('plan_sl_lapse_mon') + ' ' : '') + tf('plan_sl_lapse_p', { a: easy ? easy.title : '' }), '<button type="button" class="btn sm primary" data-go="plan">' + esc(t('plan_sl_lapse_b')) + '</button><button type="button" class="btn sm" id="pl-lapse-not">' + esc(t('plan_rec_not')) + '</button>');
    return '';
  }
  /* which of the running plan's cards Today shows, first that applies: her weeks done; day 1; a month done (with the restart in
     its words after a lapse); the week's look-back (days 1 to 3 of a new week); the doctor check (days 2 to 21); a Qura doctor
     on day 3; a fresh start after 3 quiet days. In discreet mode only the plain-words ones (end, day 1, the look-back). */
  /* ---------- Version 39.51: My midlife plan, version 2, "Cool, calm and strong" (Mohit, 30 Oct: "start with the midlife plan",
     then "proceed building with your recommendations"; docs/midlife-plan-advice-2026-10-30.md; mockup
     claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd). Three 4-week parts in the order her goal needs, then her year to month 12;
     mods/midlife.js holds the chapters. ---------- */
  const menoV2 = (d) => !!(d && (d.pack || 'cycle') === 'meno' && (d.pv || (d.start ? 1 : ((specOf('meno') || {}).ver || 1))) >= 2);
  /* Version 39.51 (Mohit's phone test, 31 Oct): chest pain, fainting or getting very breathless when she walks: until her doctor
     says she can do more, Gentle start takes the place of Strength at home everywhere (Moves and calm, its search tile, My plan's
     line), and the sun salutation waits too */
  const heartHold = (d0) => { const d = d0 || (S.canSave() ? raw() : null); return !!(d && d.start && menoV2(d) && ikOf(d).mheart === 'y'); };
  /* the parts: h Cool and calm (hot flushes), q its calm version (worry, low mood), r Rest, s Strong and steady */
  const M2_ORDER = { hot: 'hrs', sleep: 'rhs', mood: 'qrs', bones: 'shr', weight: 'srh', aches: 'srh' };
  /* her sleep goal's chapters on flushes only when her diary has hot flushes in the 60 days before that part starts (chosen on its
     first day, so it never changes inside the part); otherwise the calm ones */
  const hotBefore = (iso) => { const dl = S.state.daily || {}; return Object.keys(dl).some((k) => k <= iso && S.diffDays(S.fromISO(k), S.fromISO(iso)) <= 60 && (dl[k] || []).indexOf('d_hotflush') >= 0); };
  const m2Order = (d) => { const o = M2_ORDER[(d && d.goalKey) || 'hot'] || M2_ORDER.hot; if (!(d && d.goalKey === 'sleep')) return o;
    const aDay = d.start ? S.toISO(S.addDays(S.fromISO(d.start), 28 * o.indexOf('h'))) : null; return hotBefore(aDay && aDay <= todayISO() ? aDay : todayISO()) ? o : o.replace('h', 'q'); };
  const m2Hot = (dd) => (dd && dd.goalKey === 'hot') || hotBefore(todayISO());
  /* 12 months since her last period (none in her diary: joining's "about a year ago" or more) */
  const yearSinceBleed = () => { const ls = S.cycle && S.cycle.lastStart ? S.cycle.lastStart() : null; return !ls || S.diffDays(ls, pToday()) >= 365; };
  /* her part on a day: h, q, r or s in weeks 1 to 12, then k (her year) */
  const m2Part = (d, iso) => { if (!menoV2(d) || !d.start) return null; const wk = weekAt(d, iso || todayISO()); if (wk < 1) return null; return wk > N ? 'k' : m2Order(d).charAt(Math.floor((wk - 1) / 4)); };
  /* the week's chapter (h1 to s4); in her year a Learn article a month, in turn (y1, y2, ...) */
  const m2Lesson = (d, iso) => { const p = m2Part(d, iso); if (!p) return null; const wk = weekAt(d, iso || todayISO()); return p === 'k' ? 'y' + (Math.floor((wk - N - 1) / 4) + 1) : p + (((wk - 1) % 4) + 1); };
  /* the chapter behind Today's skill: the week's, and in her year her first part's (the practice that brings it together) */
  const M2_KEEP = { h: 'h3', q: 'q3', r: 'r1', s: 's2' };
  const m2Skill = (d, iso) => { const p = m2Part(d, iso); if (!p) return null; return p === 'k' ? M2_KEEP[m2Order(d).charAt(0)] : m2Lesson(d, iso); };
  const M2_YEAR = ['hormone-therapy-explained', 'sleep-mood-dryness-midlife', 'bones-heart-after-40', 'periods', 'hot-flushes-night-sweats', 'more'];
  const m2Art = (wk) => { const k = M2_YEAR[Math.floor((wk - N - 1) / 4) % M2_YEAR.length]; const st = !!(S.state.situation || {}).stopped;
    return 'midlife.' + (k === 'periods' ? (st ? 'bleeding-after-menopause' : 'periods-after-40') : (k === 'more' ? (st ? 'perimenopause-indian-age' : 'contraception-perimenopause') : k)); };
  /* under her steps on Today until she reads it, one row: the week's chapter, or in her year the month's Learn article (none on a
     shared phone) */
  function m2LessonRow(dd) {
    const id = m2Lesson(dd, todayISO()); const ML = S.midlife && S.midlife.lesson; if (!id || !ML || ML.read(id)) return ''; const pv = disc();
    if (id.charAt(0) === 'y') { const k = m2Art(weekNo(dd)); const a = S.article && S.article(k); if (!a || pv) return '';
      return '<button type="button" class="item pl-les pl-m2-art" data-mid-art="' + k + '" data-mid-y="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body"><span class="small">' + esc(t('plan_m2_month')) + '</span><strong>' + esc(a.title) + '</strong></span><span class="pill">' + esc(t('plan_les_read')) + '</span></button>'; }
    return '<button type="button" class="item pl-les pl-m2-les" data-go="mid-lesson" data-mid-les="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body">' + (pv ? '<strong>' + esc(t('plan_m2_les_h')) + '</strong>' : '<span class="small">' + esc(t('plan_m2_les_h')) + '</span><strong>' + esc(ML.title(id)) + '</strong>') + '</span><span class="pill">' + esc(t('plan_les_read')) + '</span></button>';
  }
  /* the check-in's "Tomorrow" (Mohit's phone): her steps by name when tomorrow's differ from today's, as a strength day does */
  function m2Tom(d) {
    if (disc()) return ''; const tn = S.toISO(S.addDays(pToday(), 1)); const last = d.keep ? keepUntil(d) : planWeeks(d); if (last && weekAt(d, tn) > last) return '';
    const a = stepsFor(d, S.toISO(pToday())), b = stepsFor(d, tn); const ids = (l) => l.map((x) => x.id).join('|'); if (!b.length || ids(a) === ids(b)) return '';
    const nm = (x) => (x.kind === 'routine' && x.r ? rName(x.r) : (['skill', 'move', 'ca', 'food'].indexOf(x.id) >= 0 ? t('plan_m2_tl_' + x.id) : (x.name || x.title)));
    return tf('plan_m2_tom', { x: b.map(nm).join(', ') });
  }
  /* the reveal's "What happens when": her parts in her order, the chapter and the look back each week, her strength days, her results */
  function m2RvRows(dd) {
    const ML = S.midlife && S.midlife.lesson; if (!ML) return ['plan_rv_w1', 'plan_rv_w4', 'plan_rv_w12'];
    return m2Order(dd).split('').map((p, i) => ({ x: tf('plan_m2_rv_p', { a: i * 4 + 1, b: i * 4 + 4, p: ML.part(p) }) }))
      .concat([{ x: t('plan_m2_rv_ch') }, { x: tf('plan_m2_rv_str', { r: rName((ikOf(dd) || {}).mheart === 'y' ? 'gentle' : 'strength') }) }, 'plan_rv_w12']);
  }
  /* Version 39.55: "What happens when" in My period plan: the steps of her cycle that aren't today's, the chapter and the look back
     each week, week 4 (her first month and when to see a doctor), her strength and yoga weeks, week 12. On a shared phone, as before. */
  function perRvRows(dd) {
    if (disc()) return ['plan_rv_w1', 'plan_rv_w4', 'plan_rv_w12'];
    const ids = actionsFor(dd).map((a) => a.id); const lead = dd.goalKey || dd.pack; const has = (g) => lead === g || alsoGoal(g, lead); const out = [];
    const ri = S.cycle && S.cycle.rangeInfo ? S.cycle.rangeInfo() : null;   /* the phone test: with no likely days, nothing for the days before her period */
    if (lead === 'pain') { if (ri) out.push({ x: ids.indexOf('kit') >= 0 ? tf('plan_pi_kd', { x: lowFirst(t('plan_a_kitready')) }) : t('plan_per_rv_kit') }); else if (ids.indexOf('kit') < 0) out.push({ x: tf('plan_pi_pd', { x: lowFirst(t('plan_a_kit')) }) }); }
    else if (has('pain') && ids.indexOf('kit') < 0) out.push({ x: tf('plan_pi_pd', { x: lowFirst(t('plan_a_kit')) }) });
    if (lead === 'heavy' && ids.indexOf('rest') < 0) out.push({ x: t('plan_per_rv_rest') });
    if (lead === 'pms' && ri && ids.indexOf('calmweek') < 0) out.push({ x: tf('plan_pi_bf', { x: lowFirst(t('plan_a_calmweek')) }) });   /* joining another lead, the days before are the evening question */
    out.push({ x: t('plan_m2_rv_ch') }, { x: t('plan_per_rv_w4') });
    if (lead === 'pain') { out.push({ x: tf('plan_per_rv_str', { n: 5, r: rName('strength') }) }); if (ri) out.push({ x: tf('plan_per_rv_yoga', { n: 6, r: rName('cycle') }) }); }
    if (lead === 'heavy') out.push({ x: tf('plan_per_rv_str', { n: 7, r: rName('strength') }) });
    return out.concat(['plan_rv_w12']);
  }
  /* Rest asks "How did you sleep?" for every goal (V39.49's card; the hot-flush and sleep goals ask it every evening) */
  const slpRest = (d) => menoV2(d) && m2Part(d, todayISO()) === 'r';
  /* her weekly number, once a week from day 7: how much her goal's trouble got in her way, 0 to 10 (the card's speaker reads it);
     never on a shared phone */
  const MS_OF = { hot: 'hot', sleep: 'sleep', mood: 'mood' };
  const msX = (d) => t('plan_ms_' + (MS_OF[(d && d.goalKey) || ''] || 'body'));
  const msAsk = (d) => menoV2(d) && planDayAt(d, todayISO()) >= 7 && !(S.state.settings || {}).shared && !disc() && ![1, 2, 3, 4, 5, 6].some((i) => dayLog(d, S.toISO(S.addDays(pToday(), -i))).ms != null);
  const msQ = (d, m) => '<div class="card pl-ci-ms" data-say="1"><span class="eyebrow">' + esc(t('plan_ms_eye')) + '</span><p class="pl-ci-ms-q"><strong>' + esc(tf('plan_ms_q', { x: msX(d) })) + '</strong></p><div class="pl-ms-n" role="group" aria-label="' + esc(tf('plan_ms_q', { x: msX(d) })) + '">' +
    Array.from({ length: 11 }, (x, i) => '<button type="button" class="chip' + (m.ms === i ? ' on' : '') + '" data-ci-ms="' + i + '" aria-pressed="' + (m.ms === i) + '">' + i + '</button>').join('') + '</div><div class="row spread small pl-ms-ends"><span>' + esc(t('plan_ms_lo')) + '</span><span>' + esc(t('plan_ms_hi')) + '</span></div></div>';
  /* periods that stopped before 40 need a gynaecologist first (the reviewed POI line): no midlife plan until her doctor has seen her */
  function poiHold() { const s0 = S.state.situation || {}; const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null; return !!s0.stopped && age != null && age < 40 && !s0.poiOk; }   /* a declaration: pausedFor asks it */
  /* Version 39.65 (the stage-change rules): under 40 she said her periods have stopped; her cycle counts until a doctor has seen her */
  function poiAsk() { const s0 = S.state.situation || {}; const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null; return !!s0.stopAsk && !s0.stopped && age != null && age < 40; }
  const poiDue = () => (poiAsk() || (poiHold() && stageNowKey() === 'meno')) && !disc() && !((S.state.prompts || {}).poiNot && S.diffDays(S.fromISO(S.state.prompts.poiNot), pToday()) < 14);
  function wirePoi(v) {
    const po = v.querySelector('#pl-m2-poi-ok'); if (po) po.addEventListener('click', () => { S.state.situation = Object.assign({}, S.state.situation || {}, { poiOk: todayISO() }); S.state.prompts = Object.assign({}, S.state.prompts || {}); if (!S.state.prompts.planOffer) S.state.prompts.planOffer = todayISO(); S.save(); S.render(); });   /* her plan is offered now */
    const ps = v.querySelector('#pl-m2-poi-stop'); if (ps && S.stopConfirm) ps.addEventListener('click', () => S.stopConfirm());   /* Version 39.65 */
    const pn = v.querySelector('#pl-m2-poi-not'); if (pn) pn.addEventListener('click', () => { S.state.prompts = Object.assign({}, S.state.prompts || {}, { poiNot: todayISO() }); S.saveQuiet(); S.render(); });
  }
  const poiHtml = (top) => '<div class="card warn pl-offer pl-m2-poi" data-nofold="1" data-slot-keep="1"' + (top ? ' data-plan-top="1"' : '') + '><h3>' + esc(t(poiAsk() ? 'stage_meno' : 'plan_m2_poi_h')) + '</h3><p class="small">' + esc(t('meno_tl_poi0')) + '</p><div class="row wrap">' +   /* Version 39.65: in her words while her plan runs on */
    '<button type="button" class="btn sm primary" data-ask="' + esc(t('stage_meno')) + '">' + esc(t('hs_doc_q')) + '</button>' + (S.explain && S.explain.docNext ? S.explain.docNext('gyn') : '') +   /* Version 39.65: a Qura doctor first, the gynaecologist beside it */
    (S.routeOwner('cond-poi') ? '<button type="button" class="btn sm" data-go="cond-poi">' + esc(t('plan_m2_poi_read')) + '</button>' : '') + (poiAsk() ? '<button type="button" class="btn sm" id="pl-m2-poi-stop">' + esc(t('plan_m2_poi_stop')) + '</button>' : '<button type="button" class="btn sm" id="pl-m2-poi-ok">' + esc(t('plan_m2_poi_ok')) + '</button>') + '<button type="button" class="btn sm" id="pl-m2-poi-not">' + esc(t('plan_off_later')) + '</button></div></div>';
  /* which midlife card is due, first that applies, one at a time in Sakhi says (none on a shared phone): her periods stopped before
     45 at 40 to 44, a year after her last period (once); in weeks 4 to 7, for hot flushes (her goal or her diary), aches and tiredness or
     hormone medicine: her doctor and hormone therapy, her hormone medicine's own signs, blood tests; in weeks 12 to 16 her checks after
     40. Each has its weeks, so none comes back for months */
  function menoDue(dd) {
    if (disc() || !menoV2(dd)) return ''; const wk = weekNo(dd); const s0 = S.state.situation || {}; const age = S.cycle && S.cycle.ageYears ? S.cycle.ageYears() : null;
    if (s0.stopped && age != null && age >= 40 && age < 45 && yearSinceBleed() && !dd.e45Seen && !aside('pl-m2-e45')) return 'e45';
    if (wk >= 4 && wk <= 7 && (m2Hot(dd) || dd.goalKey === 'aches' || !!s0.hormones) && !dd.w4Seen && !aside('pl-m2-w4')) return 'w4';
    if (wk >= 12 && wk <= N + 4 && !dd.w12Seen && !aside('pl-m2-w12')) return 'w12';
    return '';
  }
  /* women on version 1 are offered this one once; her days and answers stay */
  const mpv2Offer = (dd) => (dd.pack || 'cycle') === 'meno' && !menoV2(dd) && !dd.mpv2No && !disc() && !!specOf('meno', 2);
  function menoCardHtml(dd, k) {
    const card = (cls, h, p, btns, extra) => '<div class="card soft pl-slot pl-sl-m2 ' + cls + '" data-nofold="1"><h3>' + esc(h) + '</h3>' + (p ? '<p class="small">' + esc(p) + '</p>' : '') + (extra || '') + (btns ? '<div class="row wrap">' + btns + '</div>' : '') + '</div>';
    const b = (id, key, pri) => '<button type="button" class="btn sm' + (pri ? ' primary' : '') + '" data-m2="' + id + '">' + esc(t(key)) + '</button>';
    const art = (a) => (S.article && S.article(a) ? '<button type="button" class="btn sm" data-mid-art="' + a + '">' + esc(t('plan_m2_read')) + '</button>' : '');
    if (k === 'e45') return card('pl-m2-e45', t('plan_m2_e45_h'), t('meno_tl_done_early'), art('midlife.early-menopause-poi') + b('e45-ok', 'plan_got', true));
    if (k === 'w4') { const hrt = !!(S.state.situation || {}).hormones; const hot = m2Hot(dd); const ach = dd.goalKey === 'aches';
      return card('pl-m2-w4', t(hot ? 'plan_m2_w4_h' : 'plan_m2_w4_h2'), t(hrt ? 'plan_m2_w4_on' : (hot ? 'plan_m2_w4_p' : 'plan_m2_aches')), (hot || hrt ? art('midlife.hormone-therapy-explained') : '') + b('w4-ok', 'plan_got', true),
        (hrt ? '<p class="small pl-m2-hrt"><strong>' + esc(t('plan_m2_hrt')) + '</strong></p>' + telRow(['112']) : '') + (ach && (hot || hrt) ? '<p class="small pl-m2-aches">' + esc(t('plan_m2_aches')) + '</p>' : '')); }
    if (k === 'w12') return card('pl-m2-w12', t('plan_m2_w12_h'), t('plan_m2_w12_p'), (S.routeOwner('meno-bones') ? '<button type="button" class="btn sm primary" data-go="meno-bones">' + esc(t('plan_m2_w12_go')) + '</button>' : '') + b('w12-ok', 'plan_got'));
    if (k === 'mpv2') return card('pl-m2-pv2', t('plan_m2_v2_h'), t('plan_m2_v2_p'), b('mpv2-yes', 'plan_m2_v2_yes', true) + b('mpv2-no', 'plan_rec_not'));
    return '';
  }
  /* My plan: the week's chapter (ticked once read), her walk kept easy after "chest pain when you walk", her bones */
  /* Version 39.55 (My period plan): the week's chapter, one row under her steps until she reads it (its title hidden on a shared
     phone); the version 2 offer to a woman on version 1, once; and one card at a time: in weeks 4 to 6 when to see a doctor (her
     goals' reviewed lines), at her second period since she began, for the days before (the reviewed line). Each card asks a Qura
     doctor first. */
  /* Version 39.68 (the doctors' review): one "Telling your family" chapter for pain and heavy periods; weeks whose chapter the
     doctors removed have none */
  const PER_SHARED = { h8: 'p8' };
  const perLessonId = (dd) => { const wk = weekNo(dd); const g = { pain: 'p', heavy: 'h', pms: 'm' }[dd.goalKey || dd.pack]; const id = g && wk >= 1 && wk <= N ? g + wk : null; return id ? PER_SHARED[id] || id : null; };
  function perLessonRow(dd) {
    const id = perLessonId(dd); const PL = S.perplan && S.perplan.lesson; if (!id || !PL || !PL.has(id) || PL.read(id)) return ''; const pv = disc();
    return '<button type="button" class="item pl-les pl-per-les" data-go="per-lesson" data-per-les="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body">' + (pv ? '<strong>' + esc(t('plan_m2_les_h')) + '</strong>' : '<span class="small">' + esc(t('plan_m2_les_h')) + '</span><strong>' + esc(PL.title(id)) + '</strong>') + '</span><span class="chev">' + S.I.chev + '</span></button>';
  }
  /* Version 39.56 (My pelvic floor plan): one card at a time, a Qura doctor first. Her safety answers that need a doctor first lead
     until she has seen one; a past operation or pelvic cancer, until her doctor says more is fine; pain, until a doctor has checked
     it; on the heaviness track, what the doctor said once she has been; "Is it the right squeeze?" in weeks 2 to 4 and whenever
     she isn't sure; from week 12, "Still leaking or heavy?" with the treatments after exercises and Tele-MANAS. */
  /* Version 39.56 (the test pass): her report for the doctor: when she leaks and how much it gets in the way, her signs before she
     started, what the doctor said, her leaks (or heaviness) first and latest, her level and her days of sets */
  const pfByWk = (d, key) => { const L = []; const s0 = S.fromISO(d.start); for (let w = 1; w <= wkNow(d); w++) { let v = null; for (let i = 0; i < 7; i++) { const x = dayLog(d, S.toISO(S.addDays(s0, (w - 1) * 7 + i)))[key]; if (x != null) v = x; } if (v != null) L.push({ w: w, v: v }); } return L; };
  function pfSum(dd, lines) {
    const ik = ikOf(dd); const hv = ik.pft === 'heavy';
    if (ik.pft) lines.push(t('plan_in_pft') + ' ' + t(ik.pft === 'ns' ? 'plan_dx_ns' : 'plan_pft_' + ik.pft) + (ik.pfway != null ? ' · ' + t('plan_pw_' + ik.pfway) : ''));
    const fl = (ik.pfflags || []).filter((k) => PFS.indexOf(k) >= 0); if (fl.length) lines.push(t('plan_ps_h') + ': ' + fl.map((k) => t('plan_pfs_' + k)).join('; '));
    if (dd.pfDoc) lines.push(t('plan_pf_doc_h') + ' ' + t(dd.pfDoc.said === 'pop' ? 'plan_pf_doc_pop' : 'plan_pf_doc_ok'));
    const L = pfByWk(dd, 'lk'); if (L.length) { const f = L[0], l = L[L.length - 1]; const w = (x) => tf('plan_res_lk_w', { x: t('plan_lk_' + x.v), n: x.w }); lines.push(t(hv ? 'plan_pf_res_hv' : 'plan_res_lk') + ': ' + w(f) + (L.length > 1 ? ' → ' + w(l) : '')); }
    const lv = pfLevel(dd); lines.push(tf('plan_pf_res_lv_s', { n: lv.n, d: pfDays(dd).filter((x) => x >= dd.start).length }));
    if (pfRelax(dd)) lines.push(t('plan_pf_pain_h'));
  }
  /* the evening's and the look-back's tips, the plan's own (it has no walks) */
  const tipT = (d, b) => (d && pfLead(d) && b !== 'none' ? t('plan_pf_tip_' + b) : t('plan_tip_' + b));
  const pfSureLast = (dd) => { let r = null; Object.keys(dd.log || {}).sort().forEach((k) => { const v = (dd.log[k] || {}).pfs; if (v && k >= dd.start) r = { v: v, at: k }; }); return r; };
  const pfLkLast = (dd) => { let r = null; Object.keys(dd.log || {}).sort().forEach((k) => { const v = (dd.log[k] || {}).lk; if (v && k >= dd.start) r = v; }); return r; };
  const pfChkTicked = (dd) => Object.keys(dd.log || {}).some((k) => k >= dd.start && (!dd.pfChkNot || k > dd.pfChkNot) && ((dd.log[k] || {}).ck || {}).checked === 'd');
  function pfDue(dd) {
    if (!pfLead(dd)) return ''; const fl = pfIk(dd).pfflags || [];
    if (PFS_DOC.some((k) => fl.indexOf(k) >= 0) && !dd.pfSafeSeen) return 'safe';
    if (disc()) return '';
    if (fl.indexOf('mesh') >= 0 && !dd.pfOk && !dd.pfMeshSeen) return 'mesh';
    if (pfRelax(dd) && !dd.pfPainSeen) return 'pain';
    if (pfIk(dd).pft === 'heavy' && !dd.pfDoc && pfChkTicked(dd)) return 'doc';
    const wk = weekNo(dd); const sl = pfSureLast(dd); const unsure = !!sl && sl.v !== 'y';
    if (!dd.pfRightSeen ? ((wk >= 2 && wk <= 4) || unsure) : (unsure && sl.at > dd.pfRightSeen)) return 'right';
    if (wk > (pfPop(dd) ? 16 : N) && !dd.pfEndSeen && pfLkLast(dd) !== 'never') return 'end';   /* after a prolapse, the end of her 16 weeks */
    return '';
  }
  function pfCardHtml(dd, k) {
    const pc = (cls, h, p, btns, warn, ok) => '<div class="card ' + (warn ? 'warn' : 'soft') + ' pl-slot pl-sl-pf ' + cls + '" data-nofold="1"' + (ok ? ' data-disc-ok="1"' : '') + '><h3>' + esc(h) + '</h3>' + p + '<div class="row wrap">' + btns + '</div></div>';
    const b = (id, key, pri) => '<button type="button" class="btn sm' + (pri ? ' primary' : '') + '" data-pf="' + id + '">' + esc(t(key)) + '</button>';
    const ask = disc() ? '' : '<button type="button" class="btn sm primary" data-ask="' + esc(packTitle(dd)) + '">' + esc(t('ask_qura')) + '</button>';
    const P = (key) => '<p class="small">' + esc(t(key)) + '</p>'; const fl = pfIk(dd).pfflags || [];
    if (k === 'safe') return pc('pl-pf-safe', t('plan_pf_safe_h'), disc() ? P('plan_pf_safe_d') : PFS_DOC.filter((x) => fl.indexOf(x) >= 0).map((x) => P('plan_pfs_' + x + '_w')).join('') + (fl.indexOf('const') >= 0 ? P('plan_pfs_const_g') : ''), ask + b('safe-seen', 'plan_pf_safe_seen'), true, true);
    if (k === 'mesh') return pc('pl-pf-mesh', t('plan_pf_mesh_h'), P('plan_pfs_mesh_w'), ask + b('mesh-ok', 'plan_pf_mesh_ok') + b('mesh-later', 'plan_got'));
    if (k === 'pain') return pc('pl-pf-pain', t('plan_pf_pain_h'), P('plan_pf_pain_p'), ask + b('pain-seen', 'plan_got') + b('pain-ok', 'plan_pf_pain_ok'));
    if (k === 'doc') return pc('pl-pf-doc', t('plan_pf_doc_h'), '', b('doc-pop', 'plan_pf_doc_pop', true) + b('doc-ok', 'plan_pf_doc_ok') + b('doc-not', 'plan_pf_doc_not'));
    if (k === 'right') return pc('pl-pf-right', t('plan_pf_right_h'), P('plan_pf_right_p') + P('plan_pf_right_g'), ask + b('right-ok', 'plan_got'));
    if (k === 'end') return pc('pl-pf-end', t('plan_pf_end_h'), P('plan_pf_end_p') + P('plan_pf_low') + telRow(['14416']), ask + (S.routeOwner('intimate-prolapse') ? '<button type="button" class="btn sm" data-go="intimate-prolapse">' + esc(t('plan_pf_tile_g')) + '</button>' : '') + b('end-ok', 'plan_got'));
    return '';
  }
  function wirePf(v) {
    v.querySelectorAll('[data-pf]').forEach((btn) => btn.addEventListener('click', () => { const k = btn.dataset.pf; const dd = D(); const td = todayISO();
      if (k === 'safe-seen') dd.pfSafeSeen = td; else if (k === 'mesh-ok') { dd.pfOk = td; S.toast(t('plan_pf_doc_ok_t')); } else if (k === 'mesh-later') dd.pfMeshSeen = td;
      else if (k === 'pain-seen') dd.pfPainSeen = td; else if (k === 'pain-ok') { dd.pfPainOk = td; dd.pfHurt = 0; dd.pfRelax = null; }
      else if (k === 'doc-pop' || k === 'doc-ok') { dd.pfDoc = { at: td, said: k === 'doc-pop' ? 'pop' : 'ok' }; S.toast(t(k === 'doc-pop' ? 'plan_pf_doc_pop_t' : 'plan_pf_doc_ok_t')); }
      else if (k === 'doc-not') dd.pfChkNot = td;
      else if (k === 'right-ok') dd.pfRightSeen = td; else if (k === 'end-ok') dd.pfEndSeen = td;
      remSync(dd); S.save(); S.render(); }));
  }
  /* "Your plan is ready": what comes when */
  function pfRvRows(dd) {
    if (disc()) return ['plan_rv_w1', 'plan_rv_w4', 'plan_rv_w12'];
    const hv = pfIk(dd).pft === 'heavy'; const rl = pfRelax(dd); const out = [{ x: t(rl ? 'plan_pf_relax_s' : 'plan_pf_rv_d1') }];
    if (hv) out.push({ x: t('plan_pf_rv_chk') }); if (!rl) out.push({ x: t('plan_pf_rv_lv') }); if (pfUrge(dd)) out.push({ x: t('plan_pf_rv_urge') });
    return out.concat([{ x: t('plan_pf_rv_h') }, { x: t('plan_m2_rv_ch') }, { x: t('plan_pf_rv_w4') }, 'plan_rv_w12', { x: t(hv ? 'plan_pf_rv_16' : 'plan_pf_rv_keep') }]);
  }
  /* the week's chapter, one row under her steps until she reads it; on a full day of another plan, her sets as that row */
  const pfLessonId = (dd) => { const wk = weekNo(dd); if (wk < 1) return null; if (wk <= N) return 'f' + wk; return pfPop(dd) && wk <= 16 ? 'v' + (wk - N) : null; };
  function pfLessonRow(dd) {
    const id = pfLessonId(dd); const PL = S.pfplan && S.pfplan.lesson; if (!id || !PL || !PL.has(id) || PL.read(id)) return ''; const pv = disc();
    return '<button type="button" class="item pl-les pl-pf-les" data-go="pf-lesson" data-pf-les="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body">' + (pv ? '<strong>' + esc(t('plan_m2_les_h')) + '</strong>' : '<span class="small">' + esc(t('plan_m2_les_h')) + '</span><strong>' + esc(PL.title(id)) + '</strong>') + '</span><span class="chev">' + S.I.chev + '</span></button>';
  }
  const pfJoined = (dd) => !pfLead(dd) && pfGoal() && !!packOf(dd) && !pausedFor(dd) && specFlat(dd, todayISO()).some((x) => x.use === 'pelvic.sets');
  function pfJoinRow(dd) {
    if (!pfJoined(dd) || actionsFor(dd).some((a) => a.id === 'sets')) return ''; const td = todayISO(); const n = pfSetsOn(td); const m = pfTarget(dd, td); if (n >= m) return '';
    return '<button type="button" class="item pl-les pl-pf-join" data-go="post-pelvic"><span class="ico-sm hue hue-plum">' + S.icon('flower') + '</span><span class="body"><strong>' + esc(t(pfShared() ? 'plan_pf_sets_d' : 'plan_pf_sets')) + '</strong><span class="small">' + esc(tf('plan_pf_sets_n', { n: n, m: m })) + '</span></span><span class="chev">' + S.I.chev + '</span></button>';
  }
  /* her results: leaks (or heaviness) by week, first and latest; how much it gets in the way, at the start and latest; sure of the
     squeeze, first and latest; her level and the days she did her sets */
  function pfResults(d) {
    const out = []; const ik = ikOf(d); const hv = ik.pft === 'heavy'; const lv = pfLevel(d); const nd = pfDays(d).filter((x) => x >= d.start).length;
    const lvCard = '<div class="card pl-res-pflv"><h3>' + esc(t('plan_pf_res_lv')) + '</h3><p class="small">' + esc(tf('plan_pf_res_lv_s', { n: lv.n, d: nd })) + '</p></div>';
    if (disc()) return [lvCard];
    const byWk = (key) => { const L = []; const s0 = S.fromISO(d.start); for (let w = 1; w <= wkNow(d); w++) { let v = null; for (let i = 0; i < 7; i++) { const x = dayLog(d, S.toISO(S.addDays(s0, (w - 1) * 7 + i)))[key]; if (x != null) v = x; } if (v != null) L.push({ w: w, v: v }); } return L; };
    const pair = (cls, h, L, nm, a0) => { const f = L[0], l = L[L.length - 1]; const a = a0 != null ? a0 : (f ? tf('plan_res_lk_w', { x: nm(f.v), n: f.w }) : '–'); const z = l && (a0 != null || L.length > 1) ? tf('plan_res_lk_w', { x: nm(l.v), n: l.w }) : '…';
      out.push('<div class="card ' + cls + '"><h3>' + esc(t(h)) + '</h3>' + cmp(esc(a), esc(z), 'plan_prog_first', 'plan_prog_last') + '</div>'); };
    const lk = byWk('lk'); if (lk.length) pair('pl-res-lk', hv ? 'plan_pf_res_hv' : 'plan_res_lk', lk, (v) => t('plan_lk_' + v));
    const wy = byWk('pfw'); if (ik.pfway != null || wy.length) pair('pl-res-pfw', 'plan_pf_res_way', wy, (v) => t('plan_pw_' + v), ik.pfway != null ? t('plan_pw_' + ik.pfway) : null);
    const su = byWk('pfs'); if (su.length) pair('pl-res-pfs', 'plan_pf_res_sure', su, (v) => t(v === 'y' ? 'plan_yes' : (v === 'n' ? 'plan_no' : 'plan_dx_ns')));
    out.push(lvCard); return out;
  }
  /* one new ring, her morning set (the 3-a-day dose); her bedtime set is named on the evening ring. Off in Me stays off. */
  const PF_AT = '08:00';
  const PF_REM = L('Your first set today. More after lunch and before bed.', 'आज का पहला सेट। और दोपहर के खाने के बाद और सोने से पहले।');
  function pfSync(d, loud) {
    try {
      if (!d || !S.reminders) return; const r = S.reminders.get('plan-pf'); const td = todayISO();
      const up = !!(d.start && d.start > td && d.go !== false && (d.pack || 'cycle') === 'pelvic');   /* the test pass: a plan that starts tomorrow rings from its first day */
      const ok = pfLead(d) && planOn() && d.pfRing !== false && (up || (!!packOf(d) && !pausedFor(d) && !selfPaused(d) && !finished(fullD(d)) && d.start <= td));
      if (!ok) { if (r) { if (d.pfRing !== false) d.pfHeld = true; S.reminders.remove('plan-pf'); } return; }
      if (!r && !loud && !d.pfHeld && d.pfMade) { d.pfRing = false; S.saveQuiet(); return; }   /* she deleted it in Reminders: it stays off */
      delete d.pfHeld;
      const done = pfSetsOn(td) > 0 || ((dayLog(d, td).ck || {}).sets === 'd');
      const w = { id: 'plan-pf', mod: 'plan', title: PF_REM, start: up ? d.start : (r && r.start && r.start <= td ? r.start : td), until: remEnd(d), every: 1, time: (r && r.time) || d.pfAt || PF_AT, doneOn: done && !up ? td : null };
      if (r && r.time === w.time && r.start === w.start && (r.until || null) === (w.until || null) && (r.doneOn || null) === w.doneOn && (r.title || {}).en === w.title.en) return;
      S.reminders.upsert(r ? w : Object.assign({ on: true }, w), loud ? undefined : { quiet: true }); d.pfMade = true;
    } catch (e) { /* no reminders in this build */ }
  }
  const ppv2Offer = (dd) => ['pain', 'heavy', 'pms'].indexOf(dd.pack || '') >= 0 && !perV2(dd) && !dd.ppv2No && !disc() && !!specOf(dd.pack, 2);
  const perStarts = (dd) => (S.state.events || []).filter((e) => e.t === 'start' && dd.start && e.d >= dd.start).length;
  function perDue(dd) {
    if (!perV2(dd) || disc()) return ''; const wk = weekNo(dd);
    if (perGoalOn(dd, 'pms') && !dd.pmsSeen && perStarts(dd) >= 2) return 'pms2';
    if (wk >= 4 && wk <= 6 && !dd.pw4Seen) return 'pw4';
    return '';
  }
  function perCardHtml(dd, k) {
    const pc = (cls, h, p, btns) => '<div class="card soft pl-slot pl-sl-per ' + cls + '" data-nofold="1"><h3>' + esc(h) + '</h3>' + p + '<div class="row wrap">' + btns + '</div></div>';
    const b = (id, key, pri) => '<button type="button" class="btn sm' + (pri ? ' primary' : '') + '" data-pc="' + id + '">' + esc(t(key)) + '</button>';
    const ask = '<button type="button" class="btn sm primary" data-ask="' + esc(packTitle(dd)) + '">' + esc(t('ask_qura')) + '</button>';
    const P = (key) => '<p class="small">' + esc(t(key)) + '</p>';
    if (k === 'ppv2') return pc('pl-per-v2', t('plan_per_v2_h'), P('plan_per_v2_p'), b('v2-yes', 'plan_per_v2_yes', true) + b('v2-no', 'plan_rec_not'));
    if (k === 'pw4') return pc('pl-per-w4', t('plan_per_w4_h'), (perGoalOn(dd, 'pain') ? P('plan_rv_doc_pain') : '') + (perGoalOn(dd, 'heavy') ? P('r2') : '') + (perGoalOn(dd, 'pms') ? P('plan_rv_doc_pms') : ''), ask + b('w4-ok', 'plan_got'));
    if (k === 'pms2') return pc('pl-per-pms2', t('plan_per_pms2_h'), P('plan_rv_doc_pms'), ask + b('pms2-ok', 'plan_got'));
    return '';
  }
  function wirePer(v) {
    v.querySelectorAll('[data-pc]').forEach((btn) => btn.addEventListener('click', () => { const k = btn.dataset.pc; const dd = D();
      if (k === 'w4-ok') dd.pw4Seen = todayISO(); else if (k === 'pms2-ok') dd.pmsSeen = todayISO(); else if (k === 'v2-no') dd.ppv2No = todayISO();
      else if (k === 'v2-yes') { dd.pv = 2; dd.start = todayISO(); dd.started = todayISO(); dd.weeks = {}; dd.keep = false; dd.endSeen = null; dd.lapse = null;   /* a fresh 12 weeks; what she logged stays */
        ['carried', 'pw4Seen', 'pmsSeen', 'yearSeen', 'm4Seen', 'mcheck', 'mcNot', 'wplan', 'light', 'quietAt', 'pauseAsk'].forEach((x) => { delete dd[x]; }); if (S.reminders.get('plan')) remOnNow(dd, true); S.toast(t('plan_per_v2_done')); }
      remSync(dd); S.save(); S.render(); }));
  }
  function m2Card(d) {
    if (!menoV2(d) || !packOf(d) || !S.midlife) return ''; const ik = ikOf(d); const ML = S.midlife.lesson; const pv = disc(); const id = m2Lesson(d, todayISO());
    const les = id && id.charAt(0) !== 'y' ? '<div class="list pl-m2-tools"><button type="button" class="item" data-go="mid-lesson" data-mid-les="' + id + '"><span class="ico-sm hue hue-plum">' + S.icon('diary') + '</span><span class="body"><strong>' + esc(t('plan_m2_les_h')) + '</strong>' + (pv ? '' : '<span>' + esc(ML.title(id) + (ML.read(id) ? ' ✓' : '')) + '</span>') + '</span><span class="chev">' + S.I.chev + '</span></button></div>' : '';
    const heart = ik.mheart === 'y' ? '<div class="card warn pl-m2-heart"><h3>' + esc(t('plan_m2_heart_h')) + '</h3><p class="small">' + esc(t('plan_m2_heart_w')) + '</p>' + telRow(['112']) + '<div class="row wrap"><button type="button" class="btn sm" data-m2="heart-ok">' + esc(t('plan_m2_heart_ok')) + '</button></div></div>' : '';
    const bone = ik.mbone === 'y' && !pv ? '<div class="card soft pl-m2-bone"><h3>' + esc(t('plan_m2_bone_h')) + '</h3><p class="small">' + esc(t('plan_m2_bone_w')) + '</p>' + (S.routeOwner('meno-bones') ? '<div class="row wrap"><button type="button" class="btn sm" data-go="meno-bones">' + esc(tileTitle('meno-bones')) + '</button></div>' : '') + '</div>' : '';
    return les + heart + bone;
  }
  function wireMeno(v) {
    v.querySelectorAll('[data-m2]').forEach((btn) => btn.addEventListener('click', () => { const k = btn.dataset.m2; const dd = D();
      if (k === 'e45-ok') dd.e45Seen = todayISO(); else if (k === 'w4-ok') dd.w4Seen = todayISO(); else if (k === 'w12-ok') dd.w12Seen = todayISO();
      else if (k === 'mpv2-yes') { dd.pv = 2; dd.start = todayISO(); dd.started = todayISO(); dd.weeks = {}; dd.keep = false; dd.endSeen = null; dd.lapse = null;   /* the midlife walk: a fresh 12 weeks, so her parts start at the first; what she logged stays */
        ['carried', 'w4Seen', 'w12Seen', 'yearSeen', 'm4Seen', 'mcheck', 'mcNot', 'wplan', 'light', 'quietAt', 'pauseAsk'].forEach((x) => { delete dd[x]; }); if (S.reminders.get('plan')) remOnNow(dd, true); S.toast(t('plan_m2_v2_done')); }
      else if (k === 'mpv2-no') dd.mpv2No = todayISO();
      else if (k === 'heart-ok') dd.intake = Object.assign({}, ikOf(dd), { mheart: 'ok' });   /* her doctor said she can do more */
      remSync(dd); S.save(); S.render(); }));
    v.querySelectorAll('[data-mid-les]').forEach((b) => b.addEventListener('click', () => { S.mem.midLes = b.dataset.midLes; }));
    v.querySelectorAll('[data-mid-art]').forEach((b) => b.addEventListener('click', () => { const y = b.dataset.midY; if (y && S.midlife) S.midlife.lesson.mark(y); if (S.openAnswer) S.openAnswer(b.dataset.midArt); }));
  }
  /* her 12 weeks in her own numbers, her first 2 weeks beside her last 2 (never "better" or "worse") */
  function menoRes(d) {
    if (!menoV2(d) || disc() || !d.start) return ''; const s0 = S.fromISO(d.start); const day = (i) => dayLog(d, S.toISO(S.addDays(s0, i)));
    const avg = (a, b) => { const xs = []; for (let i = a; i < b; i++) { const v = day(i).ms; if (v != null) xs.push(+v); } return xs.length ? Math.round(xs.reduce((p, q) => p + q, 0) / xs.length) : null; };
    const nights = (a, b) => { let n = 0, ok = 0; for (let i = a; i < b; i++) { const v = day(i).slp; if (v) { n++; if (v === 'well' || v === 'ok') ok++; } } return n ? [ok, n] : null; };
    let str = 0; for (let i = 0; i < N * 7; i++) { const lg = day(i); if ((lg.ck || {}).str === 'd' || (lg.r || []).indexOf('strength') >= 0) str++; }
    const a = avg(0, 14), b = avg(N * 7 - 14, N * 7); const na = nights(0, 14), nb = nights(N * 7 - 14, N * 7);
    return '<div class="card pl-m2res"><h3>' + esc(t('plan_m2_res_h')) + '</h3>' + (a != null && b != null ? '<p class="small pl-m2res-ms">' + esc(tf('plan_m2_res_ms', { x: msX(d), a: a, b: b })) + '</p>' : '') +
      (na && nb ? '<p class="small pl-m2res-n">' + esc(tf('plan_m2_res_n', { a: na[0], an: na[1], b: nb[0], bn: nb[1] })) + '</p>' : '') + '<p class="small pl-m2res-str">' + esc(tf('plan_m2_res_str', { n: str })) + '</p></div>';
  }
  /* ---------- Version 39.46: after the birth, version 2 (Mohit, 30 Oct: "yes start with the I had a baby plan", then "proceed
     building"; docs/after-birth-plan-advice-2026-10-30.md; mockup claude.ai/artifact/RLz4dU7pQ5A5iVTFCcnqPa). Her days from the
     birth to the first birthday; one card at a time in Sakhi says. ---------- */
  const postV2 = (d) => !!(d && (d.pack || 'cycle') === 'post' && (d.pv || (d.start ? 1 : ((specOf('post') || {}).ver || 1))) >= 2);
  const bDays = (iso) => { const b = (S.state.situation || {}).deliveredOn; return b ? S.diffDays(S.fromISO(b), S.fromISO(iso || todayISO())) : null; };
  /* "My baby has died" (post.js): every baby, feeding and vaccine line stops; what is hers stays */
  const died = () => !!(S.post && S.post.died && S.post.died());
  /* back to strong: from day 42, after her 6-week check, her doctor's OK, or "I feel ready" with its two checks */
  const unlocked = (d, iso) => { const n = bDays(iso); return !!(d && n != null && n >= 42 && (d.six || d.unlock)); };
  /* Strength at home: from the day after "Is my body ready?" said yes */
  const preadyOk = (d, iso) => !!(d && d.pready && d.pready.ok && d.pready.at < (iso || todayISO()) && unlocked(d, iso));
  /* to day 41 the evening recovery check is her check-in: one form, one ring */
  const recCi = (d, iso) => postV2(d) && earlyAt(iso || todayISO()) && !!S.routeOwner('post-recovery') && !!(S.post && S.post.checkedOn);
  const recDone = (iso) => !!(S.post && (S.post.checkedFor ? S.post.checkedFor(iso) : S.post.checkedOn && S.post.checkedOn(iso)));   /* after midnight, the evening before's (post.js checkedFor) */
  /* her pregnancy's marks that matter after the birth: high BP and sugar (My pregnancy's answers, her MCP card) */
  const pMarks = (d) => { const a = (ikOf(d).pm || []).slice(); try { (S.preg && S.preg.risks ? S.preg.risks() : []).forEach((k) => { if (['r_bp', 'r_gdm'].indexOf(k) >= 0 && a.indexOf(k) < 0) a.push(k); }); } catch (e) { /* no pregnancy pages */ } return a; };
  const later = (x) => !!(x && x >= todayISO());   /* "Remind me" / "Not now" until that day */
  const ago = (x) => (x ? S.diffDays(S.fromISO(x), pToday()) : 9999);
  /* which after-birth card is due, first that applies: after "My baby has died", her support (a week); in week 1 her baby's danger
     signs; a BP check in week 1 after high BP in pregnancy; her own check at 6 weeks (days 35 to 56, until "I went"); from day 42
     "Ready to move a little more?"; from week 12 "Is your body ready for more?"; from day 21 her method before sex starts again */
  /* Version 39.47 (Mohit's four-plan walk): a card Today set aside (it led Sakhi says on 3 days, unanswered) lets the next of
     her plan's cards lead for its 7 days: "Ready to move a little more?" no longer holds back her method before sex starts again */
  const aside = (cls) => { const a = (S.state.prompts || {}).slotAside || {}; const td = todayISO(); return Object.keys(a).some((k) => a[k] > td && (' ' + k.split('#')[0] + ' ').indexOf(' ' + cls + ' ') >= 0); };
  function postDue(dd) {
    const n = bDays(todayISO()); if (n == null || n < 0) return ''; const s0 = S.state.situation || {}; const sh = !!(S.state.settings || {}).shared;
    if (died()) { if (ago(s0.babyDied) <= 7 && dd.diedSeen !== s0.babyDied) return 'died'; }
    else if (n <= 7 && !dd.nbSeen && !disc() && !sh) return 'nb';
    if (pMarks(dd).indexOf('r_bp') >= 0 && n >= 2 && n <= 10 && !dd.bpAt && !later(dd.bpLater) && !disc()) return 'bp';
    if (n >= 35 && n <= 41 && !dd.six && !dd.unlock && !later(dd.sixLater) && !aside('pl-p2-six')) return 'six';
    if (n >= 42 && !unlocked(dd) && !(dd.unNot && ago(dd.unNot) < 7) && !aside('pl-p2-un')) return 'unlock';
    if (n >= 84 && unlocked(dd) && !(dd.pready && (dd.pready.ok || ago(dd.pready.at) < 14)) && !later(dd.readyLater) && !aside('pl-p2-ready')) return 'ready';
    if (n >= 21 && n <= 120 && !dd.contraOk && !later(dd.contraLater) && !disc() && S.routeOwner('post-contra') && !aside('pl-p2-contra')) return 'contra';
    return '';
  }
  /* women on version 1 are offered this one once; her days, her steps and her answers stay (the clock is the birth's) */
  const pv2Offer = (dd) => (dd.pack || 'cycle') === 'post' && !postV2(dd) && !dd.pv2No && !disc() && !!specOf('post', 2);
  const FEED_HOW = ['only', 'mix', 'other'];
  /* what her pregnancy asks of her own check: a BP check after high BP, the sugar test after sugar */
  const fromPreg = (dd) => { const pm = pMarks(dd); const from = (pm.indexOf('r_bp') >= 0 ? [t('plan_p2_six_bp')] : []).concat(pm.indexOf('r_gdm') >= 0 ? [t('plan_p2_six_gdm')] : []);
    return from.length && !disc() ? '<div class="pl-p2-from"><strong class="small">' + esc(t('plan_p2_from')) + '</strong>' + from.map((x) => '<p class="small">' + esc(x) + '</p>').join('') + '</div>' : ''; };
  function postCardHtml(dd, k) {
    const card = (cls, h, p, btns, extra, ok) => '<div class="card soft pl-slot pl-sl-post ' + cls + '" data-nofold="1"' + (ok ? ' data-disc-ok="1"' : '') + '><h3>' + esc(h) + '</h3>' + (p ? '<p class="small">' + esc(p) + '</p>' : '') + (extra || '') + (btns ? '<div class="row wrap">' + btns + '</div>' : '') + '</div>';
    const b = (id, key, pri) => '<button type="button" class="btn sm' + (pri ? ' primary' : '') + '" data-p2="' + id + '">' + esc(t(key)) + '</button>';
    const n = bDays(todayISO()); const bd = (S.state.situation || {}).deliveredOn;
    if (k === 'died') return card('pl-p2-died', t('post_lost_h'), t('post_lost_talk'), '<a class="btn sm primary" href="tel:14416">' + esc(t('call_b')) + ' 14416</a>' + (S.routeOwner('loss-grief') ? '<button type="button" class="btn sm" data-go="loss-grief">' + esc(t('post_lost_sup')) + '</button>' : '') + b('died-ok', 'plan_rec_not'));
    if (k === 'nb') { const sg = S.post && S.post.babySigns ? S.post.babySigns() : null; if (!sg) return '';
      return '<div class="card warn pl-slot pl-sl-post pl-p2-nb" data-nofold="1"><h3>' + esc(t('plan_p2_nb_h')) + '</h3><p class="small"><strong>' + esc(sg.h) + '</strong></p><ul class="small pl-p2-ul">' + sg.list.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="small">' + esc(sg.note) + '</p>' + telRow(['108', '102']) + '<div class="row wrap">' + b('nb-ok', 'plan_got') + '</div></div>'; }
    if (k === 'bp') return card('pl-p2-bp', t('plan_p2_bp_h'), t('plan_p2_bp_p'), b('bp-done', 'plan_sl_doc_yes', true) + b('bp-later', 'plan_p2_tom'));
    if (k === 'six') { const sixD = bd ? S.addDays(S.fromISO(bd), 42) : null; const pm = pMarks(dd);
      const rem = S.post && S.post.sixOn ? S.post.sixOn() : true;
      return card('pl-p2-six', t('post_six_h'), sixD ? tf(docR() ? 'post_six_p_doc' : 'post_six_p', { d: S.fmtD(sixD, { day: 'numeric', month: 'short' }) }) : t(docR() ? 'post_six_p0_doc' : 'post_six_p0'),
        (n < 42 && !rem && sixD ? '<button type="button" class="btn sm" data-p2="six-rem">' + esc(tf('plan_p2_six_rem', { d: S.fmtD(sixD, { day: 'numeric', month: 'short' }) })) + '</button>' : '') + b('six-went', 'plan_p2_six_went', true) + (S.routeOwner('post-checks') ? '<button type="button" class="btn sm" data-go="post-checks">' + esc(t('post_six_list')) + '</button>' : ''),
        fromPreg(dd)); }
    if (k === 'unlock' && disc()) return card('pl-p2-un', t('plan_p2_un_hd'), t('plan_p2_un_pd'), b('un-doc', 'plan_p2_un_doc', true) + b('un-ready', 'plan_p2_un_ready') + b('un-not', 'plan_p2_un_not'), '', true);   /* a shared phone: plain words, no check after a birth */
    if (k === 'unlock') return card('pl-p2-un', t('plan_p2_un_h'), t('plan_p2_un_p'), (dd.six ? '' : b('un-six', 'plan_p2_un_six', true)) + b('un-doc', 'plan_p2_un_doc', !!dd.six) + b('un-ready', 'plan_p2_un_ready') + b('un-not', 'plan_p2_un_not'), dd.six ? '' : fromPreg(dd));   /* from day 42 it holds her 6-week check too */
    if (k === 'ready') return card('pl-p2-ready', t('plan_p2_rd_h'), tf('plan_p2_rd_p', { r: rName('strength') }), '<button type="button" class="btn sm primary" data-go="plan-pready">' + esc(t('plan_p2_rd_go')) + '</button>' + b('ready-later', 'plan_rec_not'), '', true);   /* plain words */
    if (k === 'contra') { const fh = (S.state.situation || {}).feedHow; const q = !died() && (S.state.situation || {}).breastfeeding !== false;
      const chips = q ? '<p class="small">' + esc(t('plan_p2_fq')) + '</p><div class="chips" role="group" aria-label="' + esc(t('plan_p2_fq')) + '">' + FEED_HOW.map((x) => '<button type="button" class="chip' + (fh === x ? ' on' : '') + '" data-p2-feed="' + x + '" aria-pressed="' + (fh === x) + '">' + esc(t('plan_p2_f_' + x)) + '</button>').join('') + '</div>' + (fh ? '<p class="small pl-p2-fline">' + esc(t('plan_p2_fl_' + fh)) + '</p>' : '') : '';
      return card('pl-p2-contra', t('plan_p2_c_h'), t(died() ? 'plan_p2_c_p0' : 'plan_p2_c_p'), '<button type="button" class="btn sm primary" data-go="post-contra">' + esc(t('plan_p2_c_go')) + '</button>' + b('contra-ok', 'plan_p2_c_have'), chips); }
    if (k === 'pv2') return card('pl-p2-pv2', t('plan_p2_v2_h'), t('plan_p2_v2_p'), b('pv2-yes', 'plan_p2_v2_yes', true) + b('pv2-no', 'plan_rec_not'));
    return '';
  }
  /* "I feel ready to start gently": her two checks, then back to strong */
  function openReady() {
    if (!S.sheet) return; const a = { c1: false, c2: false };
    const draw = () => '<div class="pl-why-sh pl-p2-sh"><h2>' + esc(t('plan_p2_un_ready')) + '</h2><p class="small">' + esc(t('plan_p2_rdy_p')) + '</p>' +
      ['c1', 'c2'].map((x) => '<label class="item quiet pl-p2-ck"><input type="checkbox" id="pl-p2-' + x + '"' + (a[x] ? ' checked' : '') + '><span class="body"><strong>' + esc(t('plan_p2_rdy_' + x)) + '</strong></span></label>').join('') +
      '<button type="button" class="btn primary block" id="pl-p2-rdy-go"' + (a.c1 && a.c2 ? '' : ' disabled') + '>' + esc(t('plan_p2_rdy_go')) + '</button><p class="small">' + esc(t('plan_p2_rdy_no')) + '</p></div>';
    const wire = (sh) => { ['c1', 'c2'].forEach((x) => { const c = sh.querySelector('#pl-p2-' + x); if (c) c.addEventListener('change', () => { a[x] = c.checked; const g = sh.querySelector('#pl-p2-rdy-go'); if (g) g.disabled = !(a.c1 && a.c2); }); });
      const g = sh.querySelector('#pl-p2-rdy-go'); if (g) g.addEventListener('click', () => { if (!(a.c1 && a.c2)) return; const dd = D(); dd.unlock = { at: todayISO(), by: 'ready' }; remSync(dd); S.save(); S.closeSheet(); S.toast(tf('plan_p2_un_open', { r: rName('gentle') })); S.render(); }); };
    S.sheet(draw(), wire);
  }
  function wirePostCard(v) {
    v.querySelectorAll('[data-p2]').forEach((btn) => btn.addEventListener('click', () => {
      const k = btn.dataset.p2; const dd = D(); const s0 = S.state.situation || {}; const tom = S.toISO(S.addDays(pToday(), 1));
      if (k === 'died-ok') dd.diedSeen = s0.babyDied || todayISO();
      else if (k === 'nb-ok') dd.nbSeen = todayISO();
      else if (k === 'bp-done') dd.bpAt = todayISO();
      else if (k === 'bp-later') dd.bpLater = tom;
      else if (k === 'six-rem') { if (S.post && S.post.sixRemind) S.post.sixRemind(); const b0 = s0.deliveredOn; if (b0) S.toast(tf('post_six_on', { d: S.fmtD(S.addDays(S.fromISO(b0), 42), { day: 'numeric', month: 'short' }) })); }
      else if (k === 'six-went') { dd.six = todayISO(); const b0 = s0.deliveredOn; if (bDays(todayISO()) >= 42) S.toast(tf('plan_p2_un_open', { r: rName('gentle') })); else if (b0) S.toast(tf('plan_p2_six_wait', { d: S.fmtD(S.addDays(S.fromISO(b0), 42), { day: 'numeric', month: 'short' }) })); }
      else if (k === 'un-six') { dd.six = dd.six || todayISO(); S.toast(tf('plan_p2_un_open', { r: rName('gentle') })); }
      else if (k === 'un-doc') { dd.unlock = { at: todayISO(), by: 'doc' }; S.toast(tf('plan_p2_un_open', { r: rName('gentle') })); }
      else if (k === 'un-ready') { openReady(); return; }
      else if (k === 'un-not') dd.unNot = todayISO();
      else if (k === 'ready-later') dd.readyLater = S.toISO(S.addDays(pToday(), 7));
      else if (k === 'contra-ok') dd.contraOk = todayISO();
      else if (k === 'pv2-yes') { dd.pv = 2; S.toast(t('plan_p2_v2_done')); }
      else if (k === 'pv2-no') dd.pv2No = todayISO();
      remSync(dd); S.save(); S.render();
    }));
    v.querySelectorAll('[data-p2-feed]').forEach((btn) => btn.addEventListener('click', () => { S.state.situation = Object.assign({}, S.state.situation || {}, { feedHow: btn.dataset.p2Feed }); S.save(); S.render(); }));
  }
  /* "Is your body ready for more?" (week 12 on, after back to strong): 6 tests at home with a rice bag, never the baby; any leak,
     heaviness, pain or bleeding keeps this level 2 more weeks. A yes opens Strength at home from tomorrow. */
  const PREADY = ['walk', 'leg', 'sit', 'lift', 'carry', 'toes'];
  function renderPready(v) {
    const d0 = raw(); if (!planOn() || !packOf(d0) || !postV2(d0) || !unlocked(d0)) { renderMyPlan(v); return; }
    const a = S.mem.planPr = S.mem.planPr && S.mem.planPr.day === todayISO() ? S.mem.planPr : { day: todayISO(), on: {}, leak: null };
    const all = PREADY.every((x) => a.on[x]);
    v.innerHTML = head('plan_p2_rd_h', 'home') + '<div class="stack" style="gap:12px"><p class="small">' + esc(tf('plan_p2_rd_p', { r: rName('strength') })) + '</p><div class="card"><h3>' + esc(t('plan_p2_rd_tick')) + '</h3>' +
      PREADY.map((x) => '<label class="item quiet pl-p2-ck"><input type="checkbox" data-pr="' + x + '"' + (a.on[x] ? ' checked' : '') + '><span class="body"><strong>' + esc(t('plan_p2_rd_' + x)) + '</strong></span></label>').join('') +
      '<p class="small">' + esc(t(died() ? 'plan_p2_rd_bag0' : 'plan_p2_rd_bag')) + '</p></div><div class="card"><h3>' + esc(t('plan_p2_rd_q')) + '</h3><div class="chips">' + ['no', 'yes'].map((x) => '<button type="button" class="chip' + (a.leak === x ? ' on' : '') + '" data-pr-leak="' + x + '" aria-pressed="' + (a.leak === x) + '">' + esc(t('plan_p2_rd_' + x)) + '</button>').join('') + '</div></div>' +
      (a.leak === 'yes' ? '<div class="card warn"><h3>' + esc(t('plan_p2_rd_stay_h')) + '</h3><p class="small">' + esc(t('plan_p2_rd_stay')) + '</p></div>' : (a.leak === 'no' && all ? '<div class="card ok"><h3>' + esc(tf('plan_p2_rd_ok_h', { r: rName('strength') })) + '</h3><p class="small">' + esc(t('plan_p2_rd_ok')) + '</p></div>' : (a.leak === 'no' ? '<p class="small">' + esc(t('plan_p2_rd_notyet')) + '</p>' : ''))) +
      '<button type="button" class="btn primary block" id="pl-pr-save"' + (a.leak ? '' : ' disabled') + '>' + esc(t('save')) + '</button><p class="small">' + esc(t('plan_p2_rd_run')) + '</p></div>';
    S.wire(v);
    v.querySelectorAll('[data-pr]').forEach((c) => c.addEventListener('change', () => { a.on[c.dataset.pr] = c.checked; S.render(); }));
    v.querySelectorAll('[data-pr-leak]').forEach((c) => c.addEventListener('click', () => { a.leak = c.dataset.prLeak; S.render(); }));
    const sv = v.querySelector('#pl-pr-save'); if (sv) sv.addEventListener('click', () => { if (!a.leak) return; const dd = D(); dd.pready = { at: todayISO(), ok: a.leak === 'no' && PREADY.every((x) => a.on[x]) }; S.mem.planPr = null; remSync(dd); S.save(); S.toast(tf(dd.pready.ok ? 'plan_p2_rd_saved' : 'plan_p2_rd_saved0', { r: rName('strength') })); S.setHash('home'); });
  }
  function cardKind(d) {
    const pk = packOf(d); if (!pk || pausedFor(d) || selfPaused(d)) return ''; const dd = fullD(d); const day = planDay(dd); const pr = S.state.prompts || {};
    if (finished(dd)) return (dd.keep ? dd.yearSeen : dd.endSeen) ? (pfLead(dd) && pfDue(dd) === 'end' ? 'pf' : '') : 'end';   /* Version 39.56: then "Still leaking or heavy?" */   /* review RESULTS-07: her year's end shows once too */
    if (postV2(dd) && postDue(dd)) return 'post2';   /* Version 39.46: one after-birth card at a time, before every other card */
    if (pv2Offer(dd)) return 'pv2';   /* Version 39.46: version 1 is offered version 2, once */
    if (menoV2(dd) && menoDue(dd)) return 'meno2';   /* Version 39.51: one midlife card at a time */
    if (mpv2Offer(dd)) return 'mpv2';   /* Version 39.51: version 1 is offered version 2, once */
    if (perV2(dd) && perDue(dd)) return 'per2';   /* Version 39.55: one period-plan card at a time */
    if (ppv2Offer(dd)) return 'ppv2';
    if (pfLead(dd) && pfDue(dd)) return 'pf';   /* Version 39.56: one pelvic-floor card at a time */   /* Version 39.55: version 1 is offered version 2, once */
    if (babyD(dd) && !disc() && posDue(dd)) return 'pos';   /* Version 39.32 (packet J3): a positive test she saved, once */
    if (pregV2(dd) && psafeDue(dd) && (psafeDue(dd) === 'now' || !aside('pl-sl-psafe'))) return 'psafe';   /* Version 39.47: a sign that doesn't wait always leads */   /* Version 39.34: her safety answers again (the day after a sign that doesn't wait; at 14 and 28 weeks) */
    if (day === 1 && actionsFor(dd).length && !ciDone(dd)) return babyD(dd) && !disc() && docCase(dd) && dd.doc !== 'done' && !(dd.doc && dd.doc > todayISO()) ? 'doc' : 'd1';   /* Version 39.32: her doctor card from day 1 (the mockup's Today) */
    const wk = weekNo(dd); const inWeek = (day - 1) % 7 < 3;
    if (!disc() && (wk === 5 || wk === 9) && !(dd.weeks[(wk === 5 ? 1 : 2) * 4] || {}).seenM && inWeek) return 'month';
    if (dd.keep && !disc() && wk === keepWeekly(dd) && inWeek && !dd.m4Seen) return 'm4';   /* Version 39.6: month 4, her results */
    /* Version 39.68 (the doctors' review): the week's look-back leaves Today, where the week dots already show her week; it stays
       on My plan, where she gives her energy */
    if (docCase(dd) && day >= 2 && (day <= 21 || docOpen(dd)) && dd.doc !== 'done' && !(dd.doc && dd.doc > todayISO()) && !aside('pl-sl-doc') && !(S.explain && S.explain.signOn && S.explain.signOn())) return 'doc';   /* Version 39.63: a sign from her diary leads; this waits */   /* Version 39.6: every plan's own check */
    if (!disc() && dd.doc === 'done' && !dd.docSaid && SAID[pk] && docCase(dd) && dd.docAt && S.diffDays(S.fromISO(dd.docAt), pToday()) <= 30) return 'said';
    if (!disc() && dueEntry(dd) && dd.dueSeen !== todayISO().slice(0, 7)) return 'due';
    if (disc()) return '';
    if (day >= 3 && day <= 5 && !pr.planCall && !postV2(dd)) return 'call';   /* Version 39.46: not in her first weeks after a birth */
    if (quietDue(dd)) return 'quiet';   /* Version 39.12 (plan audit gap 7): two quiet weeks */
    if (day > 14 && sinceLast(dd) >= 14 && !dd.pauseAsk && !careTime(dd)) return 'pause';   /* Version 39.5 (P2-17): once, instead of the daily restart card */
    if (day > 3 && sinceLast(dd) >= 3 && dd.lapse !== todayISO() && !(sinceLast(dd) >= 14 && dd.pauseAsk && (dd.pauseAsk === todayISO() || pToday().getDay() !== 1))) return 'lapse';   /* review ENGINE-08: after the pause offer, a quiet plan's restart card comes once a week (Mondays) */
    return '';
  }
  function afterHomePlan(v) {
    wirePostCard(v);   /* Version 39.46 */
    wireMeno(v); wirePer(v); wirePf(v);   /* Version 39.51; 39.55; 39.56 */
    if (v.querySelector('.pl-sl-rev')) wireReview(v);
    const ro = v.querySelector('#pl-rev-open'); if (ro) ro.addEventListener('click', () => { S.mem.planRevOpen = todayISO() + ':' + (weekNo(D()) - 1); S.render(); });   /* Version 39.14 */
    const dy = v.querySelector('#pl-doc-yes'); if (dy) dy.addEventListener('click', () => { const dd = D(); dd.doc = 'done'; dd.docAt = todayISO(); if (S.explain && S.explain.seenIds) S.explain.seenIds(SEEN_IDS[packOf(dd)] || []); S.saveQuiet(); S.render(); });
    v.querySelectorAll('[data-said]').forEach((b) => b.addEventListener('click', () => { const dd = D(); const k = b.dataset.said; dd.docSaid = { k: k, at: todayISO() };
      if (k === 'pmos') S.state.situation = Object.assign({}, S.state.situation || {}, { pcos: true });   /* her PMOS line, as in Me */
      S.save(); if (k === 'hb' && S.toolShown && S.toolShown('cond-labs')) S.setHash('cond-labs'); else S.render(); }));   /* review SAFETY-07 */
    /* Version 39.32 (packet J3): "Yes, move me on" marks her pregnant from her last period, as Me does; with no recent period
       date, Me asks her dates */
    const py = v.querySelector('#pl-pos-yes'); if (py) py.addEventListener('click', () => { const ls = S.cycle && S.cycle.lastStart ? S.cycle.lastStart() : null;
      if (!ls || S.diffDays(ls, pToday()) > 300) { S.setHash('me'); return; }
      const s0 = S.state.situation = S.state.situation || {}; s0.pregnant = true; s0.pregnantSince = S.toISO(ls); s0.planning = false; s0.stopped = false; delete s0.midlife; S.save(); S.setHash('home'); });
    const pss = v.querySelector('#pl-ps-same'); if (pss) pss.addEventListener('click', () => { const dd = D(); dd.intake = Object.assign({}, ikOf(dd), { psafeW: gwAt(todayISO()) }); S.saveQuiet(); S.render(); });   /* Version 39.34: nothing has changed */
    const pn = v.querySelector('#pl-pos-not'); if (pn) pn.addEventListener('click', () => { const dd = D(); dd.posSeen = S.pregtest && S.pregtest.lastPos ? S.pregtest.lastPos() : todayISO(); S.saveQuiet(); S.render(); });
    v.querySelectorAll('[data-pl-les]').forEach((b) => b.addEventListener('click', () => { S.mem.ttcLes = b.dataset.plLes; }));
    const dn = v.querySelector('#pl-due-not'); if (dn) dn.addEventListener('click', () => { D().dueSeen = todayISO().slice(0, 7); S.saveQuiet(); S.render(); });
    const m4 = v.querySelector('#pl-m4-go'); if (m4) m4.addEventListener('click', () => { D().m4Seen = todayISO(); S.saveQuiet(); S.setHash('plan-progress'); });
    const dl = v.querySelector('#pl-doc-later'); if (dl) dl.addEventListener('click', () => { D().doc = S.toISO(S.addDays(pToday(), 3)); S.saveQuiet(); S.render(); });
    const ln = v.querySelector('#pl-lapse-not'); if (ln) ln.addEventListener('click', () => { D().lapse = todayISO(); S.saveQuiet(); S.render(); });
    const mg = v.querySelector('#pl-m-go'); if (mg) mg.addEventListener('click', () => { const dd = D(); const k = weekNo(dd) === 5 ? 4 : 8; dd.weeks[k] = Object.assign({}, dd.weeks[k] || {}, { seenM: true }); S.saveQuiet(); S.setHash('plan-progress'); });   /* review PAGES-07: every plan's results are on My progress */
    const call = (go) => { S.state.prompts = S.state.prompts || {}; S.state.prompts.planCall = todayISO(); S.saveQuiet(); if (go && S.ask) S.ask(tf('plan_ask_q', { t: packTitle(raw()) })); else if (go) S.setHash('ask'); else S.render(); };   /* Version 39.6 (P2-11): her plan as the topic */
    const cg = v.querySelector('#pl-call-go'); if (cg) cg.addEventListener('click', () => call(true));
    const cn = v.querySelector('#pl-call-not'); if (cn) cn.addEventListener('click', () => call(false));
    /* she keeps the plan she is on: the new one is dropped */
    const nd = v.querySelector('#pl-next-drop'); if (nd) nd.addEventListener('click', () => { const dd = D(); delete dd.next; if (S.state.prompts) delete S.state.prompts.reveal; S.saveQuiet(); S.render(); });
    wirePause(v); wireChange(v); wireFit(v); wireQuiet(v);
    const cs = v.querySelector('#pl-carry-stop'); if (cs) cs.addEventListener('click', () => { S.mem.planStopT = true; S.render(); });   /* Version 39.27 (R03) */
    const cno = v.querySelector('#pl-carry-no'); if (cno) cno.addEventListener('click', () => { S.mem.planStopT = false; S.render(); });
    const cye = v.querySelector('#pl-carry-yes'); if (cye) cye.addEventListener('click', () => { closePlan(D()); S.mem.planStopT = false; S.save(); S.render(); });
    wirePain(v);   /* Version 39.27 (R05) */
    const ry = v.querySelector('#pl-rest-yes'); if (ry) ry.addEventListener('click', () => { const dd = D(); setRest(dd); remSync(dd); S.save(); S.toast(t('plan_rest_saved')); S.render(); });

  }
  /* Version 39.5: pause for a week, start again, and the one-time offer */
  function wirePause(v) {
    const go = () => { const dd = D(); pauseWeek(dd); dd.pauseAsk = todayISO(); S.mem.planStop = false; S.save(); S.render(); };
    ['#pl-pause', '#pl-pause-go', '#pl-pause-alt'].forEach((id) => { const b = v.querySelector(id); if (b) b.addEventListener('click', go); });
    const pn = v.querySelector('#pl-pause-not'); if (pn) pn.addEventListener('click', () => { D().pauseAsk = todayISO(); S.saveQuiet(); S.render(); });
    v.querySelectorAll('#pl-unpause').forEach((b) => b.addEventListener('click', () => { const dd = D(); unpause(dd); S.save(); S.render(); }));
  }

  /* ---------- Version 39.12, plan follow-through (Mohit, 26 Oct: "we have yoga and diet etc. but it only asks did you ate, 10
     minute walk and sleep"; the audit's 7 gaps, mockup claude.ai/artifact/WYGamiymeknKbDL4nbVpFT, built on his 6 decisions).
     Today names the day's yoga or strength, with Start; strength days show ahead; a food habit has its meal; the check-in shows
     what already counted, asks only the rest and asks about last night's bedtime; the feedback names her goal; Plan your week;
     an optional nudge at her time to move; a 4-week check; and help after two quiet weeks. All of it stays on the phone. ---------- */
  /* Version 39.13 (Mohit, 26 Oct: "we need to make sure user did all daily activities for the day"): a day with every step done */
  /* Version 39.37 (the three-plan walkthrough): a soft step ("Due now", a check-up that waits for her visit) counts when it is
     done, and never holds her day while it waits */
  const held = (xs) => xs.filter((a) => !a.soft || a.state === 'd' || a.state === 'p');
  const allDoneToday = (d) => { try { if (!packOf(d)) return false; const acts = held(actionsFor(fullD(d))); return acts.length > 0 && acts.every((a) => a.state === 'd'); } catch (e) { return false; } };
  /* a day's count: its steps as Today counted them, and a step she ticked that a later day can't rebuild (what was due in her
     pregnancy then); Version 39.14: her week's dots and full days count the same way */
  const dayCount = (d, iso) => { const xs = held(actionsFor(d, iso)); const ck = dayLog(d, iso).ck || {}; const more = Object.keys(ck).filter((k) => !xs.some((a) => a.id === k) && (ck[k] === 'd' || ck[k] === 'p'));
    return { a: xs.filter((a) => a.state === 'd').length + more.filter((k) => ck[k] === 'd').length, p: xs.filter((a) => a.state === 'p').length + more.filter((k) => ck[k] === 'p').length, n: xs.length + more.length }; };
  const dayFull = (d, iso) => { const c = dayCount(d, iso); return c.n > 0 && c.a === c.n; };
  const fullDays = (d, wk) => weekDates(d, wk).filter((iso) => iso <= todayISO() && dayFull(d, iso)).length;
  const lightOn = (d, iso) => { const l = d && d.light; const x = iso || todayISO(); return !!(l && l.from && l.until && x >= l.from && x < l.until); };
  const weekdayOf = (iso, w) => S.fmtD(S.fromISO(iso), { weekday: w || 'long' });
  /* gap 2: the next strength day of her week (Today's plan line, and the check-in's feedback) */
  function strNext(d) {
    if (packOf(d) !== 'cycle' || lightOn(d) || careTime(d)) return null;
    const tp = todayPlan(d); const a = weekStr(d, weekNo(d)); const tg = strTarget(d, tp.wk);
    const nx = tp.strDays.filter((x) => x > tp.di).sort((x, y) => x - y)[0];
    return { tp: tp, a: a, t: tg, iso: nx == null ? null : S.toISO(S.addDays(pToday(), nx - tp.di)), tom: nx != null && nx - tp.di === 1 };
  }
  function strLine(d) {
    const s = strNext(d); if (!s || s.tp.str || s.a >= s.t || !s.iso || planDay(d) < 2) return '';
    return tf(s.tom ? 'plan_th_str_tom' : 'plan_th_str', { d: weekdayOf(s.iso), a: s.a, t: s.t });
  }
  const ciStr = (d) => { const s = strNext(d); if (!s) return ''; return tf('plan_ci_str', { a: s.a, t: s.t }) + (s.a < s.t && s.iso ? ' · ' + tf('plan_ci_str_nx', { d: s.tom ? t('plan_when_tom') : weekdayOf(s.iso) }) : ''); };
  const ciTom = (d) => { if (packOf(d) !== 'cycle') return menoV2(d) || perV2(d) || pfLead(d) ? m2Tom(d) : '';   /* Version 39.55 (the phone test): her period's days change tomorrow's steps */ const tn = S.toISO(S.addDays(pToday(), 1)); const last = d.keep ? keepUntil(d) : planWeeks(d); if (last && weekAt(d, tn) > last) return '';
    const tp = todayPlan(d, tn); return tf('plan_ci_tomr', { r: rName(tp.routine), n: routineMins(tp.routine, d) }); };
  /* her goal: what a check-in is a step towards (new health lines: wording review section 19.12) */
  const CG = ['irregular', 'pmos', 'skin', 'weight', 'ready', 'pain', 'heavy', 'pms', 'food', 'nausea', 'iron', 'sleep', 'mood', 'recovery', 'pelvic', 'feed', 'hot', 'bones', 'aches'];
  const goalLine = (d) => { if (disc()) return ''; const gk = d.goalKey || ({ cycles: 'irregular', skin: 'skin', weight: 'weight', pain: 'pain' })[d.goal] || 'irregular'; return CG.indexOf(gk) >= 0 ? t('plan_cg_' + gk) : ''; };
  /* gap 3: where a step that already counted today was counted from */
  function ciNote(a, lg) {
    const ck = lg.ck || {}; if (ck[a.id] === 'd') return t('plan_ci_n_today');
    if (a.wound && S.calm) return tf('plan_ci_n_wind', { s: S.calm.short(a.wound) });   /* Version 39.22 */
    if (a.id === 'move' && a.kind === 'minutes') { const wm = (lg.min || 0) - (lg.rmin || 0); if (wm > 0) return tf('plan_ci_n_min', { n: wm }); }
    if (a.kind === 'habit') return t('plan_ci_n_plate');
    if (a.kind === 'routine') { const rs = (lg.r || []).filter((r) => r !== 'calm'); return t(a.r === 'strength' && rs.indexOf('strength') >= 0 ? 'plan_ci_n_str' : (a.id === 'yoga' && rs.some((r) => r !== 'strength') ? 'plan_ci_n_r' : 'plan_ci_n_rt')); }
    return t('plan_ci_n_tool');
  }

  /* Version 39.22: tonight's wind-down: yoga nidra after a hard night (her check-in or Poor sleep in her diary), Bhramari after a
     low, anxious or irritable day, slow breaths otherwise. Only where Wind down is in this build. */
  function windPick(d, iso) {
    if (!S.calm || !S.calm.short || !S.routeOwner('calm')) return null; const day = iso || todayISO(); const dl = (S.state.daily || {})[day] || [];
    if ((dayLog(d, day) || {}).slp === 'bad' || dl.indexOf('d_sleep') >= 0) return 'nidra';
    return ['d_mood', 'd_anxious', 'd_irritable'].some((k) => dl.indexOf(k) >= 0) ? 'bhramari' : 'breaths';
  }
  /* Version 39.22 (research: docs/myplan-and-sleep-advice-2026-10-26.md, "Timing"): the wind-down reminder 30 minutes before her
     bedtime (NHS: time to relax before bed). On unless she turns it off; none once she has wound down that day or on a rest day,
     or while her plan rests. When her check-in comes less than an hour before it, the check-in carries tonight's session instead
     (reminders at least an hour apart; Version 39.27: only within 15 minutes, windNear). It opens tonight's session. */
  const WIND_T = L('Time to wind down. Tap for tonight’s session.', 'सुकून के पल का समय। आज रात का सत्र शुरू करने के लिए टैप करें।');
  const hmMin = (hm) => +String(hm).slice(0, 2) * 60 + +String(hm).slice(3, 5);
  const hmOf = (n) => { n = ((n % 1440) + 1440) % 1440; return S.pad2(Math.floor(n / 60)) + ':' + S.pad2(n % 60); };
  const windAt = (d) => { const bt = d && d.work !== 'night' ? bedTarget(d, todayISO()) : null; return bt ? hmOf(hmMin(bt) - 30) : null; };
  /* Version 39.27 (Mohit, 28 Oct: "no need for 90 minute gap, wherever needed have reminders"): no spacing rule; only a wind-down
     due within 15 minutes of her check-in rides on it, so two never ring at the same moment */
  const windNear = (d, at) => { const g = hmMin(at) - hmMin(ciAt(d)); return g >= 0 && g < 15; };
  /* Version 39.45: the wind-down her plan rings, from today (windOk; before her start day, her first day's steps), or from the
     day its bedtime joins (the Start card and Me's line name it with its day) */
  const windSoon = (d) => { if (!d || !planOn() || !packOf(d) || careTime(d) || !windAt(d)) return null; const on0 = d.start && d.start <= todayISO(); if (on0 && pausedFor(d)) return null;
    if (on0 ? windOk(d) : stepsFor(Object.assign(fullD(d), { start: todayISO() }), todayISO()).some(windStep)) return { at: windAt(d), n: 1 };
    const l = laterStep(d); return l && windStep(l.a) ? { at: windAt(d), n: l.n } : null; };
  const windStep = (a) => !!(a && a.play && !a.playDay);   /* Version 39.55: the bedtime step's wind-down, not a daytime session's play button */
  const windOk = (d) => !!(d && planOn() && packOf(d) && d.start && d.start <= todayISO() && !pausedFor(d) && !finished(fullD(d)) && !careTime(d) && actionsFor(fullD(d)).some(windStep));
  function windSync(d, loud) {
    try {
      if (!d || !S.reminders) return; const r = S.reminders.get('plan-wind'); const at = d.wind !== false && windOk(d) ? windAt(d) : null;
      if (!at || windNear(d, at)) { if (r) { S.reminders.remove('plan-wind'); if (d.wind !== false) d.windGone = true; } return; }
      if (!r && d.windMade && !d.windGone && !loud) { d.wind = false; S.saveQuiet(); return; }   /* she deleted it in Reminders: it stays off */
      delete d.windGone;
      const dd = fullD(d); const td = todayISO(); const done = !!(S.calm.doneOn(td) || dayLog(dd, td).rest); const st = selfPaused(d) ? d.pauseUntil : (r && r.start && r.start <= td ? r.start : td);
      const w = { id: 'plan-wind', mod: 'plan', title: WIND_T, start: st, until: remEnd(dd), every: 1, time: at, doneOn: done ? td : null };
      if (r && r.time === w.time && r.start === w.start && (r.until || null) === (w.until || null) && (r.doneOn || null) === w.doneOn) return;
      S.reminders.upsert(r ? w : Object.assign({ on: true }, w), loud ? undefined : { quiet: true }); d.windMade = true;
    } catch (e) { /* no reminders in this build */ }
  }
  /* tonight's session from a reminder: the session, at its own address */
  function renderWind(v) {
    const d = raw(); const w = d && packOf(d) ? windPick(fullD(d)) : null; if (!w) { renderMyPlan(v); return; }
    v.innerHTML = '<div class="card pl-wind-open"><span class="eyebrow">' + esc(t('plan_tonight')) + '</span><p class="lead">' + esc(S.calm.short(w) + ' · ' + tf('calm_min', { n: S.calm.mins(w) })) + '</p><button type="button" class="btn primary block" data-go="calm-' + w + '">' + PLAY_SVG + esc(t('calm_play')) + '</button></div>';
    S.wire(v); try { history.replaceState(null, '', '#calm-' + w); setTimeout(() => S.render(), 0); } catch (e) { /* she taps Play */ }
  }
  /* gap 5: a nudge at her time to move. Off unless she turns it on (Plan settings); one a day at most; none once she has moved or
     checked in, on a rest day, or while her plan rests; on a shared phone core's notification says only "A reminder" */
  const NUDGE_AT = { morning: '07:30', breakfast: '09:30', lunch: '14:00', evening: '18:00', dinner: '21:15' };
  const NUDGE_T = L('Your time to move. Tap to start.', 'चलने-फिरने का समय। शुरू करने के लिए टैप करें।');
  /* Version 39.22: yoga on an empty or light stomach (AYUSH Common Yoga Protocol), a walk right after a meal (Reynolds et al.
     2016: blood sugar fell most after the evening meal); the nudge is on unless she turns it off (Mohit, 27 Oct: "set
     reminders accordingly") */
  const NUDGE_YOGA = L('Yoga before you eat, then your walk. Tap to start.', 'खाने से पहले योग, फिर सैर। शुरू करने के लिए टैप करें।');
  const NUDGE_WALK = L('Time for your walk, right after the meal. Tap to start.', 'खाने के ठीक बाद सैर का समय। शुरू करने के लिए टैप करें।');
  const AFTER_MEAL = ['breakfast', 'lunch', 'dinner'];
  /* Version 39.27 (minimalism audit R02): the check-in rings after her last step is due, so it never asks about a walk still to
     come: her time (8 pm unless she picked one), or 45 minutes after her time to move when that is later, but not later than 45
     minutes before her bedtime target. A time she picks herself (Start, her settings, Reminders) is kept as it is. */
  const ciAt = (d) => {
    const own = d && d.remAt && d.remAt >= '17:00' ? d.remAt : '20:00';
    if (!d || d.remPick || d.work === 'night' || !d.when || !NUDGE_AT[d.when] || !(specD(d) || {}).moves || careTime(d)) return own;
    const mv = hmMin(NUDGE_AT[d.when]) + 45; if (mv <= hmMin(own)) return own;
    const bt = d.bed === 'b22' ? '22:00' : bedTarget(d, todayISO()); let b = bt ? hmMin(bt) : 24 * 60; if (b < 12 * 60) b += 24 * 60;
    const at = Math.max(hmMin(own), Math.min(mv, b - 45)); const wk0 = hmMin(NUDGE_AT[d.when]);
    return hmOf(at > wk0 ? at : wk0 + 15);   /* Version 39.47 (Mohit's four-plan walk): after her walk, never at its minute (in bed by 10 pm, a 9:15 pm walk: 9:30 pm) */
  };
  /* Version 39.27 (R01): what will ring, named above Start (one switch covers it all); in her day's order */
  function remLine(d) {
    const al = S.alerts || {}; if (al.off && al.off()) return t('plan_st_off'); if (al.blocked && al.blocked()) return t('plan_st_block');
    const ci = ciAt(d); const xs = [[ci, tf(postV2(d) && earlyAt(todayISO()) && !disc() ? 'plan_st_r_rc' : 'plan_st_r_ci', { t: timeOf(ci) })]];   /* Version 39.46: to day 41, her recovery check */
    try {
      if (d.nudge !== false && d.when && NUDGE_AT[d.when] && movesOn(d)) xs.push([NUDGE_AT[d.when], tf(AFTER_MEAL.indexOf(d.when) >= 0 ? 'plan_st_r_walk' : 'plan_st_r_move', { t: timeOf(NUDGE_AT[d.when]) })]);
      const pw = d.wind === false ? null : windSoon(d);   /* Version 39.45: and the one her bedtime brings later */
      if (pw && pw.at && !windNear(d, pw.at)) xs.push([pw.at, pw.n > 1 ? tf('plan_st_r_wind_n', { t: timeOf(pw.at), n: pw.n }) : tf('plan_st_r_wind', { t: timeOf(pw.at) })]);
      if (pfLead(d) && d.pfRing !== false) { const pr = S.reminders.get('plan-pf'); const at = (pr && pr.time) || d.pfAt || PF_AT; if (!pr || pr.on !== false) xs.push([at, tf('plan_st_r_pf', { t: timeOf(at) })]); }   /* Version 39.56: her morning set */
    } catch (e) { /* the check-in alone */ }
    const ord = (hm) => { const m = hmMin(hm); return m < 4 * 60 ? m + 24 * 60 : m; };
    const l = xs.sort((a, b) => ord(a[0]) - ord(b[0])).map((x) => x[1]); if (al.period && al.period() && !disc()) l.push(t('plan_st_r_per'));   /* discreet: no health words */
    if (postV2(d) && !disc()) { const b0 = (S.state.situation || {}).deliveredOn; const sixD = b0 ? S.addDays(S.fromISO(b0), 42) : null; if (sixD && sixD > pToday()) l.push(tf('plan_st_r_six', { d: S.fmtD(sixD, { day: 'numeric', month: 'short' }) })); }   /* Version 39.46 */
    const and = l.length > 1 ? l.slice(0, -1).join(', ') + t('plan_and') + l[l.length - 1] : l[0];
    return tf('plan_st_rem', { l: and });
  }
  const nudgeT = (d) => (AFTER_MEAL.indexOf(d.when) >= 0 ? NUDGE_WALK : (actionsFor(d).some((a) => a.id === 'yoga') ? NUDGE_YOGA : NUDGE_T));
  const movesOn = (d) => !!(d && planOn() && packOf(d) && (specD(d) || {}).moves && !pausedFor(d) && !finished(fullD(d)) && !careTime(d) && d.start <= todayISO());
  const nudgeOn = () => { const r = S.reminders.get('plan-nudge'); return !!(r && r.on !== false); };
  /* the test pass (2 Nov): the plan-week days her moves come on, as weekdays (0 is Sunday); null when a move comes every day */
  const MOVE_IDS = ['move', 'yoga', 'str'];
  function moveDays(d) {
    const sp = specD(d); if (!sp || !d.start) return null; const ds = {}; let daily = false;
    const walk = (l) => (l || []).forEach((x) => { if (x.first) { walk(x.first); return; } if (x.goal) { Object.keys(x.goal).forEach((k) => walk(x.goal[k])); return; }
      if (MOVE_IDS.indexOf(x.id) < 0) return; const m = /^days:(.+)$/.exec(x.when || ''); if (m) m[1].split(',').forEach((n) => { ds[+n] = 1; }); else if (!x.when || x.when === 'daily') daily = true; });
    walk(sp.steps); const ks = Object.keys(ds).map(Number); if (daily || !ks.length) return null;
    const s0 = S.fromISO(d.start).getDay(); return ks.map((i) => (s0 + i) % 7).filter((x, j, a) => a.indexOf(x) === j).sort((a, b) => a - b);
  }
  function nudgeSync(d, loud) {
    try {
      if (!d || !S.reminders) return; const r = S.reminders.get('plan-nudge');
      if (!(d.nudge !== false && d.when && NUDGE_AT[d.when] && movesOn(d))) { if (r) { if (d.nudge !== false) d.nudgeHeld = true; S.reminders.remove('plan-nudge'); } return; }
      if (!r && !loud && !d.nudgeHeld && (d.nudgeMade || d.nudge === true)) { d.nudge = false; S.saveQuiet(); return; }   /* she deleted it in Reminders: it stays off */
      delete d.nudgeHeld;
      const dd = fullD(d); const td = todayISO(); const x = dayLog(dd, td); const pv2 = perV2(dd); const mvs = actionsFor(dd).filter((a) => a.id === 'move' || a.id === 'yoga' || (pv2 && a.id === 'str'));
      const done = !!(x.rest || x.ci || (mvs.length && mvs.every((a) => a.state === 'd')) || (pv2 && !mvs.length));   /* Version 39.55: a strength day moves; a day with no move doesn't ring */   /* Version 39.13: her yoga and her walk */ const st = selfPaused(d) ? d.pauseUntil : (r && r.start && r.start <= td ? r.start : td);
      const wd = moveDays(dd);   /* Version 39.55: only on her moving days */
      const w = { id: 'plan-nudge', mod: 'plan', title: nudgeT(dd), start: st, until: remEnd(dd), every: wd ? null : 1, weekdays: wd, time: NUDGE_AT[d.when], doneOn: done ? td : null };
      if (r && r.time === w.time && r.start === w.start && (r.until || null) === (w.until || null) && (r.doneOn || null) === w.doneOn && (r.title || {}).en === w.title.en && String(r.weekdays || '') === String(wd || '')) return;
      S.reminders.upsert(r ? w : Object.assign({ on: true }, w), loud ? undefined : { quiet: true }); d.nudgeMade = true;
    } catch (e) { /* no reminders in this build */ }
  }

  /* gap 4: Plan your week, 30 seconds, kept by plan week (d.wplan[week]: str, when, ifb, ift). Her strength days (not two
     in a row), her time to move, and one if-then plan for what got in the way last week; "Same as last week" skips it */
  const IFT = { time: ['five', 'split', 'phone'], tired: ['breath', 'slow', 'gentle'], pain: ['cramps', 'rest'], family: ['ask', 'home', 'dinner'], out: ['march', 'stairs', 'yoga'] };
  const ifText = (b, x) => t('plan_if_' + b + '_' + x);
  const wpOf = (d, wk) => ((d && d.wplan) || {})[wk == null ? weekNo(d) : wk] || null;
  function wkSum(d, wk) {
    if (packOf(d) === 'cycle') { const h = HABITS.find((x) => x.wk > 1 && x.wk === Math.min(wk, N) + 2 * (d.hab0 || 0)); return tf('plan_wp_sum', { m: target(d, Math.min(wk, N)) }) + (h ? ' · ' + tf('plan_wp_new', { h: tx(h.h) }) : ''); }
    const mv = actionsFor(d).find((a) => a.kind === 'minutes'); return mv ? tf('plan_wp_sum_d', { n: mv.mins }) : '';
  }
  function wpRowSub(d) {   /* what her week's plan holds: her strength days and her time */
    const p = wpOf(d); if (!p) return t(packOf(d) === 'cycle' ? 'plan_wp_row_s' : 'plan_wp_row_s2');
    const ds = weekDates(d, weekNo(d)); const bits = [];
    if (Array.isArray(p.str) && p.str.length) bits.push(tf('plan_wp_row_str', { d: p.str.map((i) => weekdayOf(ds[i], 'short')).join(', ') }));
    if (p.when) bits.push(t('plan_w_' + p.when)); return bits.join(' · ');
  }
  function saveWeek(src) {
    const dd = D(); const wk = weekNo(dd); const cyc = packOf(dd) === 'cycle';
    const rec = { when: src.when || null, at: todayISO() }; if (cyc && Array.isArray(src.str)) rec.str = src.str.slice().sort((a, b) => a - b);
    if (src.ift && IFT[src.ifb] && IFT[src.ifb].indexOf(src.ift) >= 0) { rec.ifb = src.ifb; rec.ift = src.ift; }
    dd.wplan = Object.assign({}, dd.wplan || {}); Object.keys(dd.wplan).forEach((k) => { if (+k < wk - 5) delete dd.wplan[k]; }); dd.wplan[wk] = rec;
    if (rec.when) dd.when = rec.when;
    if (S.mem.planNudgeAsk && rec.when) { dd.nudge = true; S.mem.planNudgeAsk = false; nudgeSync(dd, true); } else nudgeSync(dd);
    S.mem.planWk = null; S.save(); S.toast(t('plan_wp_saved')); S.setHash(S.mem.planWkFrom || 'plan');
  }
  function renderWeek(v) {
    if (!movesOn(raw())) { renderMyPlan(v); return; }
    const d = D(); const wk = weekNo(d); const dd = fullD(d); const tp = todayPlan(dd); const cyc = packOf(d) === 'cycle'; const prev = wpOf(d, wk - 1); const cur = wpOf(d, wk);
    const lb = wk > 1 ? weekBars(d, wk - 1) : null; const lbOk = !!(lb && IFT[lb.b] && !(disc() && lb.b === 'pain'));
    const m = S.mem.planWk = S.mem.planWk && S.mem.planWk.wk === wk && S.mem.planWk.day === todayISO() ? S.mem.planWk :
      { wk: wk, day: todayISO(), str: tp.strDays.slice(), when: (cur && cur.when) || d.when || null, ifb: (cur && cur.ifb) || (lbOk ? lb.b : 'time'), ift: (cur && cur.ift) || null };
    const dates = weekDates(d, wk); const td = todayISO(); const need = strTarget(d, tp.wk); const f = (iso) => S.fmtD(S.fromISO(iso), { day: 'numeric', month: 'short' });
    const sh = need === 1 ? t('plan_wp_str1') : tf('plan_wp_str', { n: need }); const bs = Object.keys(IFT).filter((b) => !(disc() && b === 'pain'));
    v.innerHTML = head('plan_wp_h', S.mem.planWkFrom || 'plan') + '<p class="small">' + esc(tf('plan_wp_sub', { n: wk, a: f(dates[0]), b: f(dates[6]) })) + '</p>' +
      (cyc ? '<div class="card pl-wp"><h3>' + esc(sh) + '</h3><div class="pl-wp-days" role="group" aria-label="' + esc(sh) + '">' +
        dates.map((iso, i) => { const on1 = m.str.indexOf(i) >= 0; return '<button type="button" class="pl-wp-d' + (on1 ? ' on' : '') + '" data-wp-d="' + i + '" aria-pressed="' + on1 + '" aria-label="' + esc(S.fmtD(S.fromISO(iso), { weekday: 'long', day: 'numeric', month: 'long' })) + '"' + (iso < td ? ' disabled' : '') + '><span>' + esc(weekdayOf(iso, 'narrow')) + '</span><b>' + S.fromISO(iso).getDate() + '</b></button>'; }).join('') +
        '</div><p class="small">' + esc(tf('plan_wp_str_p', { n: routineMins('strength', d) })) + '</p></div>' : '') +
      '<div class="card pl-wp"><h3>' + esc(t('plan_wp_when')) + '</h3><div class="chips" role="group" aria-label="' + esc(t('plan_wp_when')) + '">' + Q.when[1].map((o) => '<button type="button" class="chip' + (m.when === o[0] ? ' on' : '') + '" data-wp-w="' + o[0] + '" aria-pressed="' + (m.when === o[0]) + '">' + esc(t(o[1])) + '</button>').join('') + '</div></div>' +
      '<div class="card pl-wp"><h3>' + esc(t('plan_wp_if')) + '</h3>' + (lbOk ? '<p class="small">' + esc(tf(lb.n === 1 ? 'plan_wp_last1' : 'plan_wp_last', { b: t('plan_b_' + lb.b), n: lb.n })) + '</p>' : '') +
        '<div class="chips" role="group" aria-label="' + esc(t('plan_wp_if')) + '">' + bs.map((b) => '<button type="button" class="chip' + (m.ifb === b ? ' on' : '') + '" data-wp-b="' + b + '" aria-pressed="' + (m.ifb === b) + '">' + esc(t('plan_b_' + b)) + '</button>').join('') + '</div>' +
        '<strong class="pl-wp-q">' + esc(t('plan_ifq_' + m.ifb)) + '</strong><div class="list pl-wp-ifs">' + IFT[m.ifb].map((x) => '<button type="button" class="item pl-wp-if' + (m.ift === x ? ' on' : '') + '" data-wp-t="' + x + '" aria-pressed="' + (m.ift === x) + '"><span class="body"><span>' + esc(ifText(m.ifb, x)) + '</span></span>' + (m.ift === x ? '<span class="pill ok">✓</span>' : '') + '</button>').join('') + '</div></div>' +
      '<p class="small pl-wp-sum">' + esc(wkSum(dd, wk)) + '</p><p class="small pl-err" id="pl-wp-err" hidden></p>' +
      '<button type="button" class="btn primary block" id="pl-wp-save">' + esc(t('plan_wp_save')) + '</button>' + (prev || d.when ? '<button type="button" class="linkbtn pl-wp-same" id="pl-wp-same">' + esc(t('plan_wp_same')) + '</button>' : '');
    S.wire(v);
    v.querySelectorAll('[data-wp-d]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.wpD; const j = m.str.indexOf(i);
      if (need === 1) m.str = [i]; else if (j >= 0) m.str.splice(j, 1); else { m.str.push(i); if (m.str.length > need) m.str.shift(); } S.render(); }));
    v.querySelectorAll('[data-wp-w]').forEach((b) => b.addEventListener('click', () => { m.when = b.dataset.wpW; S.render(); }));
    v.querySelectorAll('[data-wp-b]').forEach((b) => b.addEventListener('click', () => { if (m.ifb !== b.dataset.wpB) { m.ifb = b.dataset.wpB; m.ift = null; } S.render(); }));
    v.querySelectorAll('[data-wp-t]').forEach((b) => b.addEventListener('click', () => { m.ift = m.ift === b.dataset.wpT ? null : b.dataset.wpT; S.render(); }));
    const err = (x) => { const e = v.querySelector('#pl-wp-err'); e.textContent = x; e.hidden = false; };
    v.querySelector('#pl-wp-save').addEventListener('click', () => {
      if (cyc) { const s = m.str.slice().sort((a, b) => a - b); if (s.length !== need || (s.length === 2 && s[1] - s[0] === 1)) { err(need === 1 ? t('plan_wp_err1') : tf('plan_wp_err', { n: need })); return; } }
      if (!m.when) { err(t('plan_wp_err_w')); return; }
      saveWeek(m);
    });
    const sm = v.querySelector('#pl-wp-same'); if (sm) sm.addEventListener('click', () => saveWeek(prev ? { str: prev.str || tp.strDays, when: prev.when || d.when, ifb: prev.ifb, ift: prev.ift } : { str: tp.strDays, when: d.when }));
  }

  /* gap 6: the 4-week check (d.mcheck[1 to 3]: weeks 5 and 9, and at the end). How she feels since she started; waist and weight if
     she likes, in the cycle plan only, asked last and never judged; then what she did beside what she noticed. Not on a shared
     phone, in pregnancy, or in the first 6 weeks after a birth. */
  const MC_V = ['better', 'same', 'worse'];
  const mcQs = (d) => ['e', 's', 'm'].concat(packOf(d) === 'cycle' && (['pmos', 'skin'].indexOf(d.goalKey) >= 0 || !!(S.state.situation || {}).pcos) ? ['sk'] : []);
  const mcK = (d) => { const wk = weekNo(d); return wk >= 13 ? 3 : (wk >= 9 ? 2 : (wk >= 5 ? 1 : 0)); };
  const mcDue = (d) => {
    if (!d || !planOn() || !packOf(d) || pausedFor(d) || selfPaused(d) || planWeeks(d) !== N || careTime(d) || disc() || pregnant() || babyD(d) || pfLead(d)) return 0;   /* Version 39.32: Getting ready has its ready check instead; Version 39.56: the pelvic floor plan's is in its check-in */
    const k = mcK(d); if (!k || (d.mcheck || {})[k]) return 0; if (k < 3 && weekNo(d) > k * 4 + 2) return 0; if (k === 3 && d.keep && weekNo(d) > N + 4) return 0;
    if (d.mcNot && S.diffDays(S.fromISO(d.mcNot), pToday()) < 3) return 0; return k;
  };
  const habitsGoing = (d) => { let n = 0; habList(d).forEach((h) => { if (h.wk > Math.min(weekNo(d), N) + 2 * (d.hab0 || 0)) return; let c = 0; for (let j = 0; j < 14; j++) if ((dayLog(d, S.toISO(S.addDays(pToday(), -j))).plate || {})[h.id]) c++; if (c >= 7) n++; }); return n; };
  function checkResult(d, k) {
    const rec = (d.mcheck || {})[k] || {}; const pk = packOf(d); const wks = Math.min(k * 4, N); let mv = 0, sn = 0, mins = 0, days = 0;
    for (let w = 1; w <= wks; w++) { days += weekDays(d, w); sn += weekStr(d, w); mins += weekMin(d, w); weekDates(d, w).forEach((iso) => { const x = dayLog(d, iso); if ((x.min || 0) > 0 || (x.r || []).some((r) => r !== 'calm')) mv++; }); }
    const tiles = pk === 'cycle' ? [[mv, 'plan_mc_r_moved', 'purple'], [sn, 'plan_mc_r_str', 'gold'], [habitsGoing(d), 'plan_mc_r_food', 'green']] : [[days, 'plan_mc_r_days', 'purple']];
    const row = (l, val, cls) => '<div class="pl-mc-row"><span>' + esc(l) + '</span><strong class="pl-mc-v' + (cls ? ' ' + cls : '') + '">' + esc(val) + '</strong></div>';
    const meas = (key, unit, lk) => { const val = rec[key]; if (!val) return ''; const xs = (d.body || []).filter((x) => x[key]); const a = xs.length >= 2 ? xs[0][key] : null; return row(t(lk), (a != null && a !== val ? num1(a) + ' → ' : '') + num1(val) + ' ' + unit); };
    const worse = mcQs(d).some((q) => rec[q] === 'worse'); const per = ['cycle', 'pain', 'heavy', 'pms'].indexOf(pk) >= 0 && !(S.state.situation || {}).stopped;
    return '<h1 class="pl-mc-rh">' + esc(k === 3 ? t('plan_mc_res_h3') : tf('plan_mc_res_h', { n: wks })) + '</h1>' +
      '<div class="card pl-mc-did"><span class="eyebrow">' + esc(t('plan_mc_did')) + '</span><div class="pl-mc-tiles">' + tiles.map((x) => '<div class="pl-mc-tile hue-' + x[2] + '"><strong>' + x[0] + '</strong><span class="small">' + esc(t(x[1])) + '</span></div>').join('') + '</div>' + (pk === 'cycle' && mins ? '<p class="small">' + esc(tf('plan_mc_r_mins', { n: mins })) + '</p>' : '') + '</div>' +
      '<div class="card pl-mc-saw"><span class="eyebrow">' + esc(t('plan_mc_saw')) + '</span>' + mcQs(d).filter((q) => rec[q]).map((q) => row(t('plan_mc_' + q), t('plan_mc_' + rec[q]), rec[q])).join('') + meas('waist', t('plan_cm'), 'plan_mc_waist_l') + meas('w', 'kg', 'plan_mc_weight_l') + '</div>' +
      (worse ? '<div class="card soft pl-mc-worse"><p class="small">' + esc(t('plan_mc_worse_p')) + '</p><div class="row wrap">' + byRoute(S.routeOwner('access-doctor') ? '<button type="button" class="btn sm" data-go="access-doctor">' + esc(t('plan_rv_free')) + '</button>' : '', '<button type="button" class="btn sm" data-ask="' + esc(tf('plan_ask_q', { t: packTitle(d) })) + '">' + esc(t('plan_rv_qura')) + '</button>') + '</div></div>' : '') +
      (per || k < 3 ? '<div class="card soft pl-mc-note">' + (per ? '<p class="small">' + esc(t('plan_rv_cyc')) + '</p>' : '') + (k < 3 ? '<p class="small">' + esc(t('plan_mc_next')) + '</p>' : '') + '</div>' : '') +
      '<div class="grid2"><button type="button" class="btn primary" data-go="home">' + esc(t('home')) + '</button><button type="button" class="btn" data-go="plan-progress">' + esc(t('plan_tiles_prog')) + '</button></div>';
  }
  function renderCheck(v) {
    const d0 = raw(); const m0 = S.mem.planMc && S.mem.planMc.day === todayISO() ? S.mem.planMc : null;
    if (!on() || !S.canSave() || disc() || !d0 || !packOf(d0)) { renderMyPlan(v); return; }
    const d = D(); const k0 = mcDue(fullD(d)); if (!(m0 && m0.saved) && !k0) { renderMyPlan(v); return; }
    const m = S.mem.planMc = m0 && (m0.saved || m0.k === k0) ? m0 : { day: todayISO(), k: k0, sel: {}, waist: '', w: '', saved: false };
    const hd = S.backRow(tf('plan_mc_h', { n: Math.min(m.k * 4, N) }), 'plan', false);
    if (m.saved) { v.innerHTML = hd + checkResult(fullD(d), m.k); S.wire(v); return; }
    const meas = packOf(d) === 'cycle';
    v.innerHTML = hd + '<p class="small">' + esc(t('plan_mc_p')) + '</p>' +
      '<div class="card pl-mc"><strong>' + esc(t('plan_mc_since')) + '</strong>' + mcQs(d).map((q) => '<div class="pl-mc-q"><span class="pl-mc-l" id="pl-mc-l-' + q + '">' + esc(t('plan_mc_' + q)) + '</span><div class="pl-mc-opts" role="group" aria-labelledby="pl-mc-l-' + q + '">' +
        MC_V.map((x) => '<button type="button" class="chip pl-mc-c ' + x + (m.sel[q] === x ? ' on' : '') + '" data-mc="' + q + ':' + x + '" aria-pressed="' + (m.sel[q] === x) + '">' + esc(t('plan_mc_' + x)) + '</button>').join('') + '</div></div>').join('') + '</div>' +
      (meas ? '<div class="card pl-mc-meas"><div class="row spread"><strong>' + esc(t('plan_mc_meas')) + '</strong><span class="small">' + esc(t('plan_mc_opt')) + '</span></div><div class="grid2"><label for="pl-mc-waist">' + esc(t('plan_mc_waist')) + '<input id="pl-mc-waist" type="number" inputmode="decimal" min="40" max="200" step="0.5" value="' + esc(m.waist) + '"></label>' +
        '<label for="pl-mc-w">' + esc(t('plan_weight')) + '<input id="pl-mc-w" type="number" inputmode="decimal" min="25" max="250" step="0.1" placeholder="' + esc(t('plan_mc_skip')) + '" value="' + esc(m.w) + '"></label></div>' +
        '<details><summary>' + esc(t('plan_waist_how')) + '</summary><p class="small">' + esc(t('plan_waist_how_p')) + '</p></details></div>' : '') +
      '<p class="small pl-err" id="pl-mc-err" hidden></p><button type="button" class="btn primary block" id="pl-mc-save">' + esc(t('plan_mc_save')) + '</button><button type="button" class="linkbtn pl-mc-not" id="pl-mc-not">' + esc(t('plan_rec_not')) + '</button>';
    S.wire(v);
    v.querySelectorAll('[data-mc]').forEach((b) => b.addEventListener('click', () => { const kv = kv2(b.dataset.mc); m.sel[kv[0]] = kv[1]; v.querySelectorAll('[data-mc^="' + kv[0] + ':"]').forEach((x) => { const on1 = x === b; x.classList.toggle('on', on1); x.setAttribute('aria-pressed', String(on1)); }); }));
    [['waist', '#pl-mc-waist'], ['w', '#pl-mc-w']].forEach((x) => { const el = v.querySelector(x[1]); if (el) el.addEventListener('input', () => { m[x[0]] = el.value; }); });
    v.querySelector('#pl-mc-not').addEventListener('click', () => { D().mcNot = todayISO(); S.mem.planMc = null; S.saveQuiet(); S.setHash('plan'); });
    v.querySelector('#pl-mc-save').addEventListener('click', () => {
      const e = v.querySelector('#pl-mc-err'); const no = (k) => { e.textContent = t(k); e.hidden = false; };
      if (mcQs(d).some((q) => !m.sel[q])) { no('plan_ci_need'); return; }
      const ws = parseFloat(m.waist), w = parseFloat(m.w); const hasWs = String(m.waist).trim() !== '', hasW = String(m.w).trim() !== '';
      if ((hasWs && !(ws >= 40 && ws <= 200)) || (hasW && !(w >= 25 && w <= 250))) { no('plan_mc_bad'); return; }
      const dd = D(); const rec = { at: todayISO() }; mcQs(dd).forEach((q) => { rec[q] = m.sel[q]; });
      if (hasWs) rec.waist = Math.round(ws * 2) / 2; if (hasW) rec.w = Math.round(w * 10) / 10;
      dd.mcheck = Object.assign({}, dd.mcheck || {}); dd.mcheck[m.k] = rec; delete dd.mcNot;
      if (rec.waist || rec.w) { const td = todayISO(); const i = dd.body.findIndex((x) => x.d === td); const e2 = Object.assign({ d: td }, i >= 0 ? dd.body[i] : {}); if (dd.height && !e2.h) e2.h = dd.height; if (rec.w) e2.w = rec.w; if (rec.waist) e2.waist = rec.waist;
        if (i >= 0) dd.body[i] = e2; else dd.body.push(e2); if (dd.body.length > 60) dd.body.splice(0, dd.body.length - 60); }
      if (m.k < 3) dd.weeks[m.k * 4] = Object.assign({}, dd.weeks[m.k * 4] || {}, { seenM: true });   /* the month card's job is done */
      m.saved = true; S.save(); S.render(); window.scrollTo(0, 0);
    });
  }
  const mcRow = (d) => { const k = mcDue(d); return k ? '<div class="list pl-mc-rowl"><button type="button" class="item" data-go="plan-check"><span class="ico-sm hue hue-sky">' + S.icon('chart') + '</span><span class="body"><strong>' + esc(tf('plan_mc_h', { n: Math.min(k * 4, N) })) + '</strong><span>' + esc(t('plan_mc_row_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' : ''; };
  function checksCard(d) {
    const c = d.mcheck || {}; const ks = [1, 2, 3].filter((k) => c[k]); if (!ks.length || disc()) return '';
    return '<div class="card pl-mc-hist"><h3>' + esc(t('plan_mc_hist')) + '</h3>' + ks.map((k) => '<p class="small"><strong>' + esc(tf('plan_mc_after', { n: Math.min(k * 4, N) })) + '</strong> ' + esc(['e', 's', 'm', 'sk'].filter((q) => c[k][q]).map((q) => t('plan_mc_' + q) + ': ' + lowFirst(t('plan_mc_' + c[k][q]))).join(' · ')) + '</p>').join('') + '</div>';
  }
  const mcSum = (d) => { const c = d.mcheck || {}; const k = [3, 2, 1].find((x) => c[x]); if (!k) return ''; return tf('plan_sum_mc', { n: Math.min(k * 4, N), x: ['e', 's', 'm', 'sk'].filter((q) => c[k][q]).map((q) => lowFirst(t('plan_mc_' + q)) + ' ' + lowFirst(t('plan_mc_' + c[k][q]))).join(', ') }); };

  /* gap 7: after two quiet weeks, one card with no health words: a lighter week, a family walk (her own message, sent through her
     phone's share sheet), a free Qura doctor call (the card comes at most once in 4 weeks), or a week's pause */
  const quietDue = (d) => { const wk = weekNo(d); if (wk < 3 || careTime(d) || disc() || lightOn(d)) return false; if ((d.quietAt && S.diffDays(S.fromISO(d.quietAt), pToday()) < 28) || (d.pauseAsk && S.diffDays(S.fromISO(d.pauseAsk), pToday()) < 28)) return false;   /* asked about a week off lately: not again */
    return weekDays(d, wk - 1) < 3 && weekDays(d, wk - 2) < 3 && weekDays(d, wk) < 3; };
  const famMsg = (d) => { if (S.mem.planFam != null) return S.mem.planFam; const mv = actionsFor(fullD(d)).find((a) => a.kind === 'minutes'); return tf('plan_q_msg', { w: lowFirst(t('plan_w_' + (d.when || 'evening'))), n: Math.max(10, (mv && mv.mins) || 15) }); };
  function quietCard(d) {
    const ed = !!S.mem.planFamEdit; const opt = (id, hue, ico, h, s) => '<button type="button" class="item pl-q-opt hue-' + hue + '" id="' + id + '"><span class="ico-sm hue">' + ico + '</span><span class="body"><strong>' + esc(h) + '</strong><span>' + esc(s) + '</span></span></button>';
    return '<div class="card soft pl-slot pl-sl-quiet" data-nofold="1"><h3>' + esc(t('plan_q_h')) + '</h3><p class="small">' + esc(t('plan_q_p')) + '</p><div class="pl-q-opts">' +
      opt('pl-q-light', 'purple', ICO.lift, t('plan_q_light'), t(packOf(d) === 'cycle' ? 'plan_q_light_s' : 'plan_q_light_s2')) +
      '<div class="pl-q-fam hue-plum"><div class="row pl-q-famh"><span class="ico-sm hue">' + S.icon('person') + '</span><span class="body"><strong>' + esc(t('plan_q_fam')) + '</strong><span class="small">' + esc(t('plan_q_fam_s')) + '</span></span></div>' +
        (ed ? '<textarea id="pl-q-ta" rows="3" aria-label="' + esc(t('plan_q_fam')) + '">' + esc(famMsg(d)) + '</textarea>' : '<p class="pl-q-msg">' + esc(famMsg(d)) + '</p>') +
        '<div class="row wrap"><button type="button" class="btn sm primary" id="pl-q-share">' + esc(t('plan_q_share')) + '</button>' + (ed ? '' : '<button type="button" class="btn sm" id="pl-q-edit">' + esc(t('plan_q_edit')) + '</button>') + '</div></div>' +
      opt('pl-q-call', 'sky', S.icon('steth'), t('plan_rv_qura'), t('plan_ct_qura_s')) +
      '</div><div class="row spread"><button type="button" class="linkbtn" id="pl-q-pause">' + esc(t('plan_pause')) + '</button><button type="button" class="linkbtn" id="pl-q-not">' + esc(t('plan_rec_not')) + '</button></div></div>';
  }
  function wireQuiet(v) {
    const done = (fn) => { const dd = D(); dd.quietAt = todayISO(); if (!dd.pauseAsk) dd.pauseAsk = todayISO(); if (fn) fn(dd); S.mem.planFam = null; S.mem.planFamEdit = false; S.save(); };
    const lt = v.querySelector('#pl-q-light'); if (lt) lt.addEventListener('click', () => { done((dd) => { dd.light = { from: todayISO(), until: S.toISO(S.addDays(pToday(), 7)) }; }); S.toast(t('plan_q_light_ok')); S.render(); });
    const ed = v.querySelector('#pl-q-edit'); if (ed) ed.addEventListener('click', () => { S.mem.planFam = famMsg(raw()); S.mem.planFamEdit = true; S.render(); const ta = document.getElementById('pl-q-ta'); if (ta) ta.focus(); });
    const ta = v.querySelector('#pl-q-ta'); if (ta) ta.addEventListener('input', () => { S.mem.planFam = ta.value; });
    const sh = v.querySelector('#pl-q-share'); if (sh) sh.addEventListener('click', () => { const msg = String(famMsg(raw()) || '').trim(); if (msg && S.share) S.share('', msg); });
    const cl = v.querySelector('#pl-q-call'); if (cl) cl.addEventListener('click', () => { done(); if (S.ask) S.ask(tf('plan_ask_q', { t: packTitle(raw()) })); else S.setHash('ask'); });
    const ps = v.querySelector('#pl-q-pause'); if (ps) ps.addEventListener('click', () => { done((dd) => { pauseWeek(dd); dd.pauseAsk = todayISO(); }); S.render(); });
    const nn = v.querySelector('#pl-q-not'); if (nn) nn.addEventListener('click', () => { done(); S.render(); });
  }
  /* ---------- Version 39.14 (Mohit, 26 Oct: "no confusion for user, maximum clarity on what needs to be done and why user should
     do it and what will impact of consistently doing"; docs/home-plan-diary-audit-2026-10-26.md, R1 to R6; the mockup
     claude.ai/artifact/6CVQhWJnZmJFZ9sNcapHdr, built on his answers: done steps stay ticked, a full day closes itself, her own
     plan week as dots). Today is her day's checklist: one tap ticks a step and a tap on its tick undoes it; one pink button at a
     time; a full day closes itself with her goal, tomorrow and a petal; every step's "Why?" opens its reviewed reason, how to do
     it and its tool; "plan day", never "Day"; her plan week as 7 dots; the week's look-back inside the card. ---------- */
  const TICK = ['tick', 'habit', 'minutes', 'routine'];   /* a link or a check is done in its own tool */
  const SVG_TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_STR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  /* the evening check-in: from 5 pm, at her check-in time, or once she has done a step; never once every step is done */
  const ciDueNow = (d, acts) => { if (ciDone(d) || isRest(d) || recCi(d)) return false;   /* Version 39.46: to day 41 the recovery check's row is her evening form */ const xs = acts || actionsFor(d); if (xs.length && xs.every((a) => a.state === 'd')) return false;
    const hm = nowHM(); return hm < '04:00' || hm >= '17:00' || hm >= ciAt(d) || xs.some((a) => a.state === 'd' || a.state === 'p'); };
  /* Version 39.23: from midnight to 4 am her plan still shows the day before, and says so */
  const lateNight = () => S.toISO(S.today()) !== todayISO();
  const nightDay = () => weekdayOf(todayISO());
  const ciLabel = () => (lateNight() ? tf('plan_ci_b_n', { d: nightDay() }) : t('plan_ci_b'));
  const nightBar = () => (lateNight() ? '<p class="pl-night-day">' + S.I.moon + '<span><strong>' + esc(tf('plan_night_d', { d: nightDay() })) + '</strong><span>' + esc(tf('plan_night_d_s', { d: nightDay() })) + '</span></span></p>' : '');
  /* R4: her plan's clock, "Week 2 · plan day 10" (a pregnancy or after-birth plan keeps its own week) */
  const ebLine = (d) => { const ow = ownWeek(d); if (ow) return ow; const wk = weekNo(d); return (d.keep && wk > N ? t('plan_wk_keep') : tf('plan_wk_s', { n: wk })) + ' · ' + tf('plan_pday', { n: planDay(d) }); };
  /* a tap on a ticked step's tick: not done after all (the minutes her tick added go too, never the ones she walked) */
  function unmark(d, a) {
    const x = d.log[todayISO()] = d.log[todayISO()] || {}; x.ck = Object.assign({}, x.ck || {}); delete x.ck[a.id];   /* Version 39.51 (Mohit's phone test): unanswered, as before her tick */
    if (x.ckm && x.ckm[a.id]) { x.ckm = Object.assign({}, x.ckm); delete x.ckm[a.id]; }   /* Version 39.56 */
    const tk = x.tkm && x.tkm[a.id]; if (a.kind === 'minutes' && tk) { x.min = Math.max(x.rmin || 0, (x.min || 0) - tk); x.tkm = Object.assign({}, x.tkm); delete x.tkm[a.id]; }
    const tr = a.kind === 'routine' && a.r && x.tkr ? x.tkr[a.r] : 0; if (tr) { x.min = Math.max(0, (x.min || 0) - tr); x.rmin = Math.max(0, (x.rmin || 0) - tr); x.tkr = Object.assign({}, x.tkr); delete x.tkr[a.r]; }   /* Version 39.41 */
    if (a.kind === 'habit') { x.plate = Object.assign({}, x.plate || {}); x.plate[a.habit] = false; }
    if (a.r === 'strength' && (x.r || []).indexOf('strength') < 0) delete x.str;
    if (((actionsFor(fullD(d)).find((y) => y.id === a.id) || {}).state) === 'd') x.ck[a.id] = 'n';   /* her own minutes or a routine she played would tick it again */
    prune(d);
  }
  /* R2: the tick that completes her day earns a petal, as a check-in does (once a day; no check-in needed) */
  function closeDay(d) {
    if (!allDoneToday(d)) return; const x = d.log[todayISO()] = d.log[todayISO()] || {}; if (x.fd) return; x.fd = 1;
    const p0 = S.joy && S.joy.petals ? S.joy.petals() : 0; if (S.emit) S.emit('checkin', { quiet: true, day: todayISO() }); if (S.joy && S.joy.petals && S.joy.petals() > p0) x.petal = 1;
  }
  /* the week's label and a day's count, for a screen reader (Mohit, 3 Nov: one full day, one step) */
  const d7Aria = (wk, n) => (n === 1 ? tf('plan_d7_aria1', { w: wk }) : tf('plan_d7_aria', { w: wk, n: n }));
  const d7Day = (day, c) => (c.n === 1 ? tf('plan_d7_t1', { d: day, a: c.a }) : tf('plan_d7_t', { d: day, a: c.a, n: c.n }));
  /* R5: her plan week as 7 dots: a full day (every step) ticked, a day with some steps soft, a rest day dashed, today ringed,
     a strength day ahead marked */
  function weekDots(d, mini) {
    const wk = wkNow(d); const td = todayISO(); const tp = packOf(d) === 'cycle' && !careTime(d) && !lightOn(d) ? todayPlan(d) : null; const sd = tp && Array.isArray(tp.strDays) ? tp.strDays : [];
    return '<div class="pl-d7' + (mini ? ' mini' : '') + '" role="img" aria-label="' + esc(d7Aria(wk, fullDays(d, wk))) + '">' + weekDates(d, wk).map((iso, i) => {
      const fut = iso > td; const lg = dayLog(d, iso); const c = fut ? { a: 0, n: 0 } : dayCount(d, iso); const full = !fut && c.n > 0 && c.a === c.n; const some = !fut && !full && dayDone(d, iso);
      const str = iso === td ? sd.indexOf(i) >= 0 && !(lg.str || (lg.r || []).indexOf('strength') >= 0) : fut && sd.indexOf(i) >= 0;
      const cls = full ? 'full' : (!fut && lg.rest ? 'rest' : (some ? 'some' : (str ? 'str' : '')));
      const day = weekdayOf(iso); const ti = !fut && lg.rest ? tf('plan_d7_rest', { d: day }) : (fut ? (str ? tf('plan_d7_str', { d: day }) : day) : d7Day(day, c));   /* each day's count, for a screen reader and a long press */
      return '<span class="pl-d7d' + (iso === td ? ' now' : '') + '" title="' + esc(ti) + '">' + (mini ? '' : '<span>' + esc(weekdayOf(iso, 'narrow')) + '</span>') + '<i class="' + cls + '">' + (mini ? '' : (full ? SVG_TICK : (cls === 'str' ? SVG_STR : ''))) + '</i></span>';
    }).join('') + '</div>';
  }
  /* "This week: 2 full days · strength on Thursday" (from her second plan day, or once a day is full) */
  function weekLine(d) {
    const n = fullDays(d, wkNow(d)); const s = strNext(d); const lg = dayLog(d, todayISO()); let st = '';
    if (s && !s.tp.str && s.a < s.t && s.iso) st = s.tom ? t('plan_wk_str_tom') : tf('plan_wk_str', { d: weekdayOf(s.iso) });
    if (!n) return st ? esc(S.state.lang === 'en' ? st.charAt(0).toUpperCase() + st.slice(1) : st) : '';   /* no full day yet: only what is ahead, never "0 full days" */
    return esc(tf(n === 1 ? 'plan_wk_full1' : 'plan_wk_full', { n: n }) + (st ? ' · ' + st : ''));
  }
  /* R2: tomorrow in a line or two: her first two steps (the cycle plan: her yoga and her walk) */
  const tomLines = (d) => { if (disc()) return []; const tn = S.toISO(S.addDays(pToday(), 1)); const last = d.keep ? keepUntil(d) : planWeeks(d); if (last && weekAt(d, tn) > last) return [];
    const noToday = (x) => String(x).replace(/\s+today$/i, '').replace(/^आज\s+/, '').replace(/\s+आज(\s)/, '$1');   /* Version 39.27 (R04): never "Tomorrow · Move 10 minutes today" */
    return actionsFor(d, tn).filter((a) => !a.priv && a.kind !== 'check' && a.kind !== 'link').slice(0, 2).map((a) => noToday(a.kind === 'minutes' && !a.r && !a.walk ? tf('plan_today_move', { n: a.mins }) : a.title)); };
  function dayDoneHtml(d, ci, wk) {
    const n = held(actionsFor(d)).length; const g = goalLine(d); const tm = tomLines(d);   /* Version 39.38 */ const x = dayLog(d, todayISO());
    return '<div class="pl-dc"><span class="pl-dc-ic" aria-hidden="true">' + SVG_TICK + '</span><span class="pl-dc-t"><strong>' + esc(t('plan_dc_h')) + '</strong><span class="small">' + esc(countLine(n, 0, n)) + '</span></span></div>' +
      (g ? '<p class="pl-dc-goal">' + esc(g) + '</p>' : '') + wk +
      (tm.length ? '<div class="pl-dc-tom"><span class="eyebrow">' + esc(t('plan_dc_tom')) + '</span>' + tm.map((y) => '<span>' + esc(y) + '</span>').join('') + '</div>' : '') +
      (x.petal && S.routeOwner('joy') && !disc() ? '<div class="list"><button type="button" class="item quiet pl-dc-pet" data-go="joy"><span class="ico-sm hue hue-green">' + S.icon('flower') + '</span><span class="body"><strong>' + esc(t('plan_ci_petal')) + '</strong></span><span class="chev">' + S.I.chev + '</span></button></div>' : '') +
      (ci ? '' : '<button type="button" class="linkbtn pl-dc-how" data-go="plan-checkin">' + esc(t('plan_dc_how')) + '</button>');
  }
  /* R3: how to do a step: a food habit's own line, the walk's pace, a routine's moves, the bedtime tip, else its line */
  function howOf(a, d) {
    if (a.how != null) return a.how;   /* Version 39.22: the wind-down's own */   /* Version 39.51 (Mohit's phone test): '' is no How, not her subtitle again */
    if (a.kind === 'habit') { const h = habOf(a.habit); return h && h.p ? tx(h.p) : ''; }
    if (a.kind === 'minutes' && !a.r) return t('plan_walk_s');
    if (a.r && (a.r === 'sun' || R[a.r])) { const seen = {}; const ns = []; stepsOf(a.r, d).forEach((s) => { const nm = s.n ? tx(s.n) : ''; if (nm && !seen[nm]) { seen[nm] = 1; ns.push(nm); } });
      return tf('plan_how_r', { n: routineMins(a.r, d), x: ns.slice(0, 6).join(', ') + (ns.length > 6 ? ' …' : '') }); }
    return a.sub || '';
  }
  /* its tool: the routine itself, Yoga and moves for the walk, My plate, My food, its page */
  function toolOf(a) {
    if (a.kind === 'routine' && /^plan-r-/.test(a.go || '')) return { go: a.go, label: t('plan_start_b') };
    const g = a.kind === 'minutes' && !a.r ? (S.routeOwner('plan-moves') && !careTime(raw()) ? 'plan-moves' : null) : (a.go && a.go !== 'plan' && a.go !== 'home' ? a.go : null);
    if (!g || (!/^plan-r-/.test(g) && !S.routeOwner(g))) return null;
    const tt = tileTitle(g);   /* Version 39.32 (found on Mohit's phone): a page with no tile (her tablet, the ready check) takes the step's own name, never its address */
    return { go: g, at: a.at || null, label: g === 'plan-moves' ? t('plan_tiles_moves') : (g === 'plan-plate' ? t('plan_tiles_plate') : (/^plan-r-/.test(g) ? t('plan_start_b') : (tt !== g ? tt : (a.name || a.title || t('plan_start_b'))))) };
  }
  function openWhy(a) {
    const d0 = raw(); if (!d0 || !S.sheet || !a.why) return; const d = fullD(d0); const pk = packOf(d); const how = howOf(a, d); const tl = toolOf(a); const art = whyArt(a.why, pk);
    const ex = pk === 'cycle' && ['plan_fb_move', 'plan_fb_move_g', 'plan_fb_str', 'plan_fb_food', 'plan_fb_sleep'].indexOf(a.why) >= 0;   /* the cycle plan's reviewed timeline */
    const fq = (FOOD_IDS.indexOf(a.id) >= 0 || a.id === 'fast') && !disc() && !ciDone(d) && foodDay(d, todayISO()); const fo = fastOn(d);   /* Version 39.15 (audit 16): "Fasting today?" lives in her food step */
    S.sheet('<div class="pl-why-sh"><div class="pl-why-top"><span class="ico-sm hue hue-' + esc(a.hue || 'rose') + '">' + a.icon + '</span><h2>' + esc(a.title) + '</h2></div>' +
      '<span class="eyebrow">' + esc(t('plan_why')) + '</span><p class="pl-why-p">' + esc(t(a.why)) + '</p>' +
      (how ? '<span class="eyebrow">' + esc(t('plan_how_h')) + '</span><p class="pl-why-how">' + esc(how) + '</p>' : '') +
      (ex ? '<div class="pl-why-ex"><span class="eyebrow">' + esc(t('plan_bring_h')) + '</span>' + [1, 2, 3].map((k) => '<p class="small"><strong>' + esc(t('plan_ex_' + k)) + '</strong> · ' + esc(t('plan_ex_' + k + '_p')) + '</p>').join('') + '</div>' : '') +
      (fq ? '<button type="button" class="chip pl-why-fast' + (fo ? ' on' : '') + '" id="pl-why-fast" aria-pressed="' + fo + '">' + esc(t(fo ? 'plan_fast_undo' : 'plan_fast_q')) + '</button>' : '') +
      '<div class="grid2 pl-why-b">' + (tl ? '<button type="button" class="btn" data-go="' + esc(tl.go) + '"' + (tl.at ? ' data-go-at="' + esc(tl.at) + '"' : '') + '>' + esc(tl.label) + '</button>' : '') + '<button type="button" class="btn primary' + (tl ? '' : ' pl-why-wide') + '" id="pl-why-ok">' + esc(t('plan_got')) + '</button></div>' +
      (art ? '<button type="button" class="linkbtn pl-why-more" data-why-art="' + esc(art) + '">' + esc(t('plan_t_more')) + '</button>' : '') + '</div>', (sh) => {
      S.wire(sh); wireWhy(sh);
      sh.querySelector('#pl-why-ok').addEventListener('click', () => S.closeSheet());
      const fb = sh.querySelector('#pl-why-fast'); if (fb) fb.addEventListener('click', () => { const dd = D(); setFast(dd, todayISO(), !fastOn(dd)); remSync(dd); S.save(); S.closeSheet(true); S.render(); });
    });
  }
  /* R1: under her steps, the check-in once it is due (then the one pink button), and on her first days how to undo a tick */
  function todayFoot() {
    if (!planOn()) return ''; const d = raw(); const pk = packOf(d); if (!pk || pausedFor(d) || selfPaused(d) || finished(fullD(d))) return '';
    const dd = fullD(d); const acts = actionsFor(dd); if (!acts.length) return '';
    /* R6: the week's look-back, inside her Today card, right under her steps (her 3 steps keep the first screen at 360 x 800,
       review FIXES-06): one line until she taps it */
    const rev = cardKind(d) === 'rev' ? reviewCard(dd, true, true) : ''; if (isRest(dd)) return rev;
    const all = acts.every((a) => a.state === 'd'); const tk = acts.some((a) => a.state === 'd' && TICK.indexOf(a.kind) >= 0);
    const ci = ciDone(dd); const due = ciDueNow(dd, acts);
    return rev + (tk && !all && planDay(dd) <= 7 ? '<p class="small pl-t-undo">' + esc(t('plan_t_undo')) + '</p>' : '') +
      (due ? '<button type="button" class="btn primary block pl-t-ci" data-go="plan-checkin">' + esc(ciLabel()) + '</button>' : (ci ? '<p class="small pl-t-at pl-t-ok">✓ ' + esc(t('plan_ci_done')) + '</p>' : (all ? '' : '<p class="small pl-t-at">' + esc(tf(recCi(dd) && !disc() ? 'plan_th_rc_at' : 'plan_th_ci_at', { t: timeOf(ciAt(dd)) })) + '</p>'))) + (rev ? '' : lessonRow(dd));   /* Version 39.46: to day 41, her recovery check */   /* Version 39.32: one row under her steps at a time; the look-back first */
  }

  /* the nudge opens today's routine (Yoga and moves for a plan that walks) */
  function renderNow(v) { const d = raw(); const r = movesOn(d) && packOf(d) === 'cycle' ? todayPlan(fullD(d)).routine : null; try { history.replaceState(null, '', '#' + (r ? 'plan-r-' + r : 'plan-moves')); } catch (e) { /* the address stays */ } if (r) renderPlayer(v, r); else renderMoves(v); }

  /* for the tests and other modules: the rules, without the screens */
  /* Version 39.24: for Wind down (its page, its session screen, Explore's For you): tonight's session when her bedtime step has
     one, and the Calm breath row where her plan has it */
  const planTonight = () => { const d = S.canSave() && raw() ? D() : null; return d && packOf(d) && !pausedFor(d) && !selfPaused(d) && actionsFor(fullD(d)).some(windStep) ? windPick(fullD(d)) : null; };
  const calmRow = () => { const d = S.canSave() && raw() ? D() : null; return routineOk('calm', d) ? { go: 'plan-r-calm', title: rName('calm'), sub: rSub('calm') + ' · ' + tf('plan_mins', { n: routineMins('calm', d) }) } : null; };
  /* Version 39.32: a positive test she saved since her plan started, not yet answered */
  const posDue = (dd) => { const lp = S.pregtest && S.pregtest.lastPos ? S.pregtest.lastPos() : null; return !!lp && lp >= dd.start && !pregnant() && dd.posSeen !== lp; };
  S.plan = { tonight: planTonight, calmRow: calmRow, forRow: forRow,   /* Version 39.53 */
    titleNow: () => { const d = runningD(); return d ? packTitle(d) : ''; },   /* Version 39.63: a topic for the call form */
    /* Version 39.59 (the lives audit, C3: one home): the pages her running plan's 4 tiles open, so Explore's For you leaves them out */
    tileGo: () => { const d = runningD(); if (!d) return []; const sp = specOf(packOf(d), d.pv); return ((sp && sp.tiles) || []).map((x) => x.go).filter(Boolean); },
    /* Version 39.56: My pelvic floor plan, for the trainer (mods/post.js) and its chapters (mods/pfplan.js) */
    pelvic: { on: () => { const d = raw(); return !!(planOn() && d && packOf(d) && !pausedFor(d) && (pfLead(d) || pfJoined(fullD(d)))); },
      level: () => { const d = raw(); return d ? pfLevel(fullD(d)) : null; }, target: () => { const d = raw(); return d ? pfTarget(fullD(d), todayISO()) : 3; },
      relax: () => { const d = raw(); return !!d && pfRelax(d); }, period: () => periodToday(todayISO()),
      joinSafe: () => { const d = raw(); return !!(d && !pfLead(d) && !d.pfSafeAt); }, joinSafeOk: () => { const d = D(); d.pfSafeAt = todayISO(); S.save(); },   /* the test pass: her joined sets' safety signs, once */
      signs: () => PFS.slice(),
      knack: () => { const d = raw(); if (!d || !d.start || disc()) return false; const k = pfIk(d).pft; return weekNo(fullD(d)) >= 2 && k !== 'heavy' && k !== 'urge'; },
      lesson: () => { const d = raw(); return d && pfLead(d) && packOf(d) ? pfLessonId(fullD(d)) : null; }, habitCh: () => { const d = raw(); const h = d && pfLead(d) && packOf(d) ? pfHabit(fullD(d), todayISO()) : null; return (h && PF_HCH[h]) || null; }, track: () => { const d = raw(); return d && pfLead(d) ? pfIk(d).pft || 'ns' : null; },
      urge: () => { const d = raw(); return !!d && pfUrge(d); }, week: () => { const d = raw(); return d && d.start ? weekNo(fullD(d)) : 0; },
      painOk: () => { const d = D(); d.pfPainOk = todayISO(); d.pfHurt = 0; d.pfRelax = null; S.save(); },   /* Version 39.56 (the test pass): a doctor checked the pain */
      hurt: () => { const d = D(); d.pfHurt = (d.pfHurt || 0) + 1; if (d.pfHurt >= 2 && !pfRelax(d)) { d.pfRelax = todayISO(); d.pfPainOk = null; d.pfPainSeen = null; } S.save(); return d.pfHurt; },
      sync: () => { const d = raw(); if (d && d.start) { pfSync(d); remSync(d); } } },
    poi: () => poiHold(),
    period: { kitToday: () => { const d = raw(); return !!(planOn() && d && perV2(d) && packOf(d) && !pausedFor(d) && actionsFor(fullD(d)).some((a) => a.id === 'kitready')); },   /* the test pass: core's heads-up card steps aside */
      lesson: () => { const d = raw(); return d && perV2(d) && packOf(d) ? perLessonId(fullD(d)) : null; }, on: () => { const d = raw(); return !!(planOn() && d && perV2(d) && packOf(d) && !pausedFor(d)); } },   /* Version 39.55: for mods/perplan.js */   /* Version 39.53 (Mohit's phone test): before 40 with her periods stopped, her doctor first (core's goals card waits) */
    /* Version 39.32: the Getting ready plan, for ttc.js (her lesson, her tablet's reminder, her ready check's folic answer) */
    folicOn: () => { const d = raw(); if (!d || !planOn()) return false; if (folicCarry(d)) return true;   /* Version 39.47: preg.js's check-ups count her tablet as started */
      return babyD(d) && pregnant() && folicRun(d) && !!(S.ttc && S.ttc.folic && S.ttc.folic.has && S.ttc.folic.has()); },   /* moved on, before she starts My pregnancy: her tablet still rings */
    meno: { on: () => { const d = raw(); return !!(planOn() && d && menoV2(d) && packOf(d) && !pausedFor(d)); }, lesson: () => { const d = raw(); return d && planOn() ? m2Lesson(d, todayISO()) : null; }, skillId: () => { const d = raw(); return d && planOn() ? m2Skill(d, todayISO()) : null; }, part: () => { const d = raw(); return d && planOn() ? m2Part(d, todayISO()) : null; } },   /* Version 39.51 */
    baby: { on: () => { const d = raw(); return !!(planOn() && d && babyD(d) && packOf(d) && !pausedFor(d)); }, lesson: () => { const d = raw(); return d && planOn() ? lessonId(d) : null; }, set: (d) => (d ? bsetOf(fullD(d)) : null), lut: () => { const d = raw(); return !!(d && lutOn(d)); } },
    ckDays: (id, n) => { const d = raw(); if (!d || !planOn()) return null; let c = 0; for (let i = 0; i < n; i++) if (((dayLog(d, S.toISO(S.addDays(pToday(), -i))).ck) || {})[id] === 'd') c++; return c; }, regionOfPin: regionOfPin, target: target, dayCount: (iso) => { const d = raw(); return packOf(d) ? dayCount(fullD(d), iso) : null; },   /* Version 39.14 */
    /* Version 39.4: the plans as data (web/progs/*.js): what this build runs, each spec, and the engine's own words */
    progs: { list: () => progs().map((p) => ({ id: p.id, ver: p.ver, status: p.status })), spec: specOf, adapters: () => Object.keys(ADAPT) }, daySuggest: daySuggest, stepsOf: stepsOf, routineMins: routineMins, habitsOn: habitsOn, poses: () => Object.keys(P), anims: () => Object.keys(ANIM), on: on,
    catalogue: () => (on() ? catalogue() : []), recs: recs, signals: signals,
    /* Version 37: joining's intake screens (core onboarding draws them), the plan they start, and her plan now */
    goalIco: goalIco,   /* Version 39.10: joining's goals screen */
    /* Version 39.27 (R06): her plan on offer (Today's "Ready for you" after joining) or waiting to start, for the doctor finding's
       card; offerGo is the offer's own "See my plan" */
    offerPair: () => { const d = raw(); if (!planOn() || runningD()) return null;
      if (pendingOk(d)) { const vv = viewOf(d); if (planWeeks(vv) !== N) return null; const g = vv.goalKey || 'irregular'; return { title: packTitle(vv), g: g, ico: goalIco(g), go: 'reveal' }; }
      if (!offerCard()) return null; const ik = S.state.intake || {}; const pk = packFor(ik.goal, stageNowKey()); const sp = specOf(pk); if (!sp || ((sp.length || {}).weeks != null && sp.length.weeks !== N)) return null;
      return { title: packTitle({ pack: pk, goalKey: ik.goal, pv: (specOf(pk) || {}).ver }), g: ik.goal, ico: goalIco(ik.goal), go: 'offer' }; },
    offerGo: () => offerGo(),
    intake: { render: renderIntake, count: (a) => (a && a.goal ? screensOf(a).length : 5), goals: (st) => GOALS[stKey(st)].slice(),
      part: (a) => { const l = a && a.goal ? screensOf(a) : []; return l[S.clamp((a && a.iq) || 0, 0, Math.max(0, l.length - 1))] === 'sum' ? 2 : 1; } },
    psTier: psTier, gwAt: (iso) => gwAt(iso),   /* Version 39.34 */
    rids: () => RIDS.filter((id) => routineOk(id, S.canSave() && raw() ? D() : null)), pyId: (iso) => pyId(iso), routine: (id) => (R[id] ? { hue: R[id].hue, fb: R[id].fb != null ? R[id].fb : null, bump: R[id].bump || 0 } : null),   /* Version 39.52; 39.54 her 3D body */
    changing: () => { const d = raw(); return !!(planOn() && d && (changedWhy(d) || fitWhy(d))); },   /* Version 39.35: core's goals card waits while it asks */   /* Version 39.48: or while the plan for now is offered */
    misfit: () => { const d = raw(); return !!(planOn() && d && fitWhy(d)); },   /* Version 39.48: a plan that doesn't fit her stage doesn't keep its goal first */
    nudgeAt: NUDGE_AT, mcDue: () => (raw() ? mcDue(fullD(raw())) : 0),   /* Version 39.12 */
    startFromIntake: startFromIntake, packFor: packFor, packOf: () => packOf(raw()), dayDone: (iso) => { const d = raw(); return !!(packOf(d) && iso >= d.start && dayDone(fullD(d), iso)); }, actions: (iso) => (packOf(raw()) ? actionsFor(fullD(raw()), iso || undefined) : []),   /* Version 39.46: any day's steps, for tests */
    /* Version 37.1: a plan waits to be started; core orders Today by these, and joy holds its petals for the first check-in */
    /* Version 39.1: a signal (a long gap) or a PMOS result offers the plan for her periods; it opens the goal's questions */
    offerOk: (g) => on() && S.canSave() && !disc() && !pregnant() && goalsFor({ stage: stageNowKey() }).indexOf(g) >= 0 && !(packOf(raw()) && !pausedFor(raw())) && !pendingOk(raw()) && !upcoming(raw()),   /* review FLOWS-02 */
    offering: () => !!offerCard(),   /* Version 39.10: Today's "Ready for you" card is up (other tips wait) */
    offer: (g) => { S.mem.planIntake = { stage: stageNowKey(), goal: g, iq: 1 }; S.setHash('plan-goal'); },
    pending: () => planOn() && pendingOk(raw()), running: () => !!runningD() && !selfPaused(raw()),   /* review PAGES-01: during her week's pause, her stage's own cards come back */
    docSeen: () => { const d = raw(); if (!planOn() || !d) return; const dd = fullD(d); if (!docCase(dd) || dd.doc === 'done') return; const x = D(); x.doc = 'done'; x.docAt = todayISO(); S.saveQuiet(); },   /* Version 39.57: "I've seen a doctor" on Today's finding */
    docOwns: (fid) => { const d = raw(); if (!planOn() || !d || pendingOk(d) || !runningD() || fid === 'late_now') return false; const dd = fullD(d); return !!(docCase(dd) && dd.doc !== 'done' && (SEEN_IDS[packOf(dd)] || []).indexOf(fid) >= 0); },   /* Version 39.57: Today's finding steps aside for her plan's doctor check */
    saidHbAt: () => { const d = raw(); if (!planOn() || !d) return null; const xs = [d.docSaid && d.docSaid.k === 'hb' ? (d.docAt || d.docSaid.at || null) : null].concat((Array.isArray(d.past) ? d.past : []).map((p) => p.hbAt || null)).filter(Boolean).sort(); return xs.length ? xs[xs.length - 1] : null; },   /* review FIXES-07: the latest, this plan or a past one */   /* review DOCTOR-03 */ docShowing: () => planOn() && !pendingOk(raw()) && cardKind(raw()) === 'doc' && docCase(fullD(raw())) === 'plan_rv_doc_cyc',   /* review SAFETY-01: only the cycle plan's check covers a late period */ goal: () => { const d = raw(); return planOn() && packOf(d) && !pausedFor(d) ? d.goalKey || null : null; }, leads: leads, early: early, holdJoy: holdJoy, start: (when, at) => { const d = commitStart(when, at); if (d) S.saveQuiet(); return !!d; } };

  S.register({
    id: 'plan',
    demoPersona: 'priya',
    strings: {
      en: {
        plan_h: 'My PMOS plan', plan_h_d: 'My plan', plan_tile_t: 'PMOS: food, yoga and moves', plan_tile_s: '12 weeks with moving pictures, foods from your region and your progress',
        plan_off: 'This plan is not in this version of Sakhi yet.',
        /* Version 39.32: Getting ready for a baby (docs/baby-plan-review-packet-2026-10-28.md). New lines wait for the doctor; the
           verified ones (plan_bf's list in ttc.js, plan_fb_folic, plan_a_hb, plan_a_hb_s, plan_fb_hb, plan_fb_his, plan_fb_bkatori)
           are copied word for word, and test/baby.mjs checks them. */
        plan_in_baby_h: 'A few things first', plan_in_baby_p: 'Your answers choose the right version of your plan. They stay on this phone.', plan_in_bflags: 'Does any of this apply to you?',
        plan_bf_meds: 'I take a medicine every day, for example for fits, BP, sugar, thyroid, acne or skin', plan_bf_diab: 'Diabetes', plan_bf_ntd: 'A past pregnancy with a spine or brain defect', plan_bf_scd: 'Sickle cell disease or thalassaemia',
        plan_in_bnone: 'None of these? Leave them empty and carry on.', plan_in_trying: 'How long have you been trying?', plan_tr_no: 'Not started yet', plan_tr_lt6: 'Under 6 months', plan_tr_m6: '6 to 12 months', plan_tr_gt12: 'Over a year',
        plan_a_folic: 'My folic acid tablet', plan_a_folic_d: 'My tablet', plan_a_folic_get: 'Not got it yet? See where', plan_fb_folic: "It protects the baby's spine and brain, which form before most women know they are pregnant.",
        plan_a_hb: 'Haemoglobin (Hb) test', plan_a_hb_s: 'Anaemia is common and is easier to fix before pregnancy than during it.', plan_fb_hb: 'Anaemia is common and is easier to fix before pregnancy than during it. Free at the Ayushman Arogya Mandir.',
        plan_a_his: 'His part this week', plan_fb_his: 'Sperm take about 2–3 months to form, so changes show in a test after that.',
        plan_a_ready: '1-minute ready check', plan_a_ready_s: 'How ready do you feel?', plan_fb_ready: '6 quick questions, just for you. There is no score.',
        plan_fb_bcalm: 'Hope one day and worry the next is common in the week before a period. A few slow breaths help many women.', plan_bcalm_h: 'A calm few minutes', plan_bcalm_p: 'For the week before your period. You can switch it on from week 8.', plan_bcalm_p2: 'For the week before your period.',
        plan_fb_bgreens: 'Greens give folate and iron, which your body needs before a pregnancy.', plan_fb_bdal: 'They give protein, iron and folate.', plan_fb_bfruit: 'Fruit with vitamin C helps your body take in iron.', plan_fb_btea: 'Tea with food blocks iron. You don’t have to stop tea.', plan_fb_bmilk: 'Calcium for your bones, now and in a pregnancy.',
        plan_fb_bkatori: "Being very thin or quite heavy can both stop eggs from being released. Steady changes in food, sleep and walking help; crash diets don't.", plan_fb_bnuts: 'Small extra snacks add up.', plan_meal_tea: 'When you have tea or coffee',
        plan_bdoc: 'Before you start trying', plan_bdoc_std_h: 'Before you start trying', plan_bdoc_std_p: 'See your gynaecologist for a check: your folic acid, the tests before pregnancy, and any medicines you take.', plan_bdoc_free: 'Free: the PHC or Ayushman Arogya Mandir, or eSanjeevani', plan_bdoc_later: 'Remind me to book it',
        plan_bdoc_gyn_h: 'See a gynaecologist now', plan_bdoc_gyn_p: 'Because of what you told us, doctors suggest a check now. You don’t need to wait 12 months.', plan_bdoc_pmos: 'With PMOS, eggs may not be released every month. A gynaecologist can check, and treatment helps.',
        plan_bdoc_meds_h: 'See your doctor before you start trying', plan_bdoc_qura: 'Your plan runs alongside your doctor’s care. A Qura doctor can help with food, sleep and habits on a free call; your fertility check is with a gynaecologist.',
        plan_bdoc_space: 'Your last baby was born {n} months ago. Doctors suggest waiting at least 2 years after a birth before the next pregnancy, so your body can recover. After a caesarean, ask your doctor how long to wait.',
        plan_les_h: 'This week’s lesson · 2 min', plan_les_read: 'Read', plan_rh_wk_b: 'A 2-minute lesson and a look back', plan_rh_wk_m2: 'A short chapter and a look back',
        plan_bph_h: 'Your 12 weeks', plan_bph_1w: 'Weeks 1–2', plan_bph_1: 'First things first: your tablet, an Hb test, and his part', plan_bph_2w: 'Weeks 3–6', plan_bph_2: 'Food, tests before pregnancy, fertile days, and how long it takes', plan_bph_3w: 'Weeks 7–12', plan_bph_3: 'Steady and calm: strength, the waiting week, sleep and family', plan_bph_4w: 'After that', plan_bph_4: 'A lesson and a ready check each month',
        plan_bmonth: 'Your doctor month: {m}', plan_bmonth_p12: '12 months after you started trying. If you’re not pregnant by then, see a gynaecologist. Sooner whenever you’re worried.', plan_bmonth_p6: '6 months after you started trying. If you’re not pregnant by then, see a gynaecologist. Sooner whenever you’re worried.',
        plan_bper_h: 'A fresh start', plan_bper: 'Your period started today. This month counts too: your tablet and your walk carry on, and nothing needs to change.',
        plan_bpos_h: 'Your test is positive', plan_bpos_p: 'Move on to My pregnancy? Your folic acid carries on to 12 weeks, and your Hb result comes with you. See your gynaecologist within a few days.', plan_bpos_yes: 'Yes, move me on',
        plan_bloss: 'After methotrexate or a molar pregnancy, start again only when your doctor says you can try again.',
        plan_bres_h: 'Your 12 weeks', plan_bres: '{n} days of your tablet, {k} of {t} on your checklist, and about {m} minutes moved a week.', plan_bres_p: '{n} days of your tablet, and about {m} minutes moved a week.', plan_bend_p: '12 weeks of looking after yourself. Your steps carry on, and so does your tablet.',
        plan_blut: 'In the 2 weeks before your period, Sakhi swaps Bhujangasana (cobra) and Vakrasana (seated twist) for gentler moves, in case you’re already pregnant.', plan_bmove: 'Moving most days is enough. You don’t need hard workouts.',
        plan_intro: 'Twelve weeks of small daily habits that help with PMOS: what to eat more and less often, yoga and simple moves at home, and your own progress.',
        plan_i_eat: 'Eat', plan_i_eat_s: 'Foods from your region, more often and less often', plan_i_move: 'Move', plan_i_move_s: 'Yoga, walking and strength, with moving pictures',
        plan_i_see: 'See your progress', plan_i_see_s: 'Your cycles, pain and minutes, compared with when you started', plan_i_time: 'About 10 minutes a day to start. At home, no equipment.',
        plan_start: 'Start my plan',
        plan_paused_preg: 'Your plan is paused while you are pregnant. Pregnancy needs its own food and moves: pick what you want help with below, and ask your doctor before you exercise.',
        plan_paused_post: 'Start this plan after your 6-week check. Until then, short walks and the pelvic floor course are best.', plan_paused_loss: 'Your plan is resting for now. Take the time you need; these pages may help.', plan_paused_loss_d: 'Your plan is resting for now.', plan_pick_ready: 'Pick a goal when you’re ready', plan_doc_d: 'A doctor’s check is part of your plan. It is free at a government health centre.', plan_doc_d_doc: 'A doctor’s check is part of your plan. It is also free at a government health centre.', plan_set_goal_s2: 'Starts a new plan. What you logged stays.', plan_go_preg: 'Check-ups and tests', plan_go_post: 'Pelvic floor course', plan_go_logs: 'My pregnancy logs',
        plan_s_h: 'Make the plan yours', plan_s_goal: 'What matters most to you?',
        plan_g_cycles: 'More regular periods', plan_g_energy: 'More energy', plan_g_skin: 'Clearer skin, less hair growth', plan_g_weight: 'A healthier weight', plan_g_pain: 'Less period pain',
        plan_s_level: 'How active are you now?', plan_lv_0: 'Hardly any exercise', plan_lv_1: 'Some days', plan_lv_2: 'Most days',
        plan_s_lim: 'Any pain in your knees or back?', plan_lim_none: 'No', plan_lim_knees: 'Knees', plan_lim_back: 'Back', plan_lim_both: 'Both',
        plan_s_food: 'What do you eat?', plan_f_veg: 'Vegetarian', plan_f_egg: 'Eggs too', plan_f_nonveg: 'Fish or meat too',
        plan_s_reg: 'Foods from your region', plan_s_reg_pin: 'From your PIN code: {r}', plan_s_reg_pick: 'Pick your region',
        plan_s_restart: 'This starts your 12 weeks again. What you logged stays.', plan_s_go: 'Start my 12 weeks', plan_s_need: 'Pick one answer for each question.',
        plan_wk: 'Week {n} of 12', plan_wk_s: 'Week {n}', plan_wk_keep: 'Keep it light', plan_min_of: '{a} of {t} minutes', plan_min_week: 'Active minutes this week', plan_str_n: 'Strength days: {a} of {t}',
        plan_rv_doc_hb: 'Often tired or dizzy with heavy periods: ask for an Hb test. It is free at a government health centre.', plan_rv_doc_hb_doc: 'Often tired or dizzy with heavy periods: ask your doctor for an Hb test. It is also free at a government health centre.', plan_rv_doc_pdays: 'Pain on 4 days or more of each period needs a doctor’s check. It can have a cause that can be treated.',
        plan_rv_doc_pms: 'If the week before your period stops your day in most cycles, a doctor can help. Note how you feel each day for 2 cycles and take the log with you.',
        plan_doc_ttc: 'You have been trying for {n} months. Doctors suggest tests for you both now: see a gynaecologist.', plan_due_h: 'Time for one doctor check', plan_due_go: 'What doctors suggest', plan_doc_ttc_now: 'Something you told Sakhi means you don’t need to wait: see a gynaecologist now.',
        plan_said_h: 'What did the doctor say?', plan_said_p: 'Only if you want to say. It stays on this phone.', plan_said_pmos: 'It is PMOS (PCOS)', plan_said_hb: 'My Hb was low', plan_said_other: 'Something else', plan_said_skip: 'I’d rather not say',
        plan_said_pmos_r: 'The doctor said PMOS.', plan_said_hb_r: 'The doctor said her Hb was low.', plan_doc_told: 'You told Sakhi you had the doctor check on {d}.', plan_doc_told0: 'You told Sakhi you had the doctor check.', plan_sum_doc_no: 'Doctor check at the start: not done yet', plan_sum_now: 'At the start: {x}',
        plan_m_days: 'You followed your plan on {a} days this month (last month: {b}).', plan_m_days1: 'You followed your plan on {a} days this month.', plan_m_doc: 'Your doctor check is still to do.',
        plan_m4_h: 'Month 4: your results', plan_m4_days: 'You have followed your plan on {n} days.', plan_m4_b: 'See my results', plan_year_h: 'Your year is done',
        plan_end_doc_h: 'Show this page to a doctor', plan_end_doc_p: 'Your before and since are here. A doctor can tell you what they mean for you.', plan_end_show: 'Show my doctor', plan_details: 'Details: minutes, food and energy',
        plan_ask_q: 'My plan ({t}): questions', plan_ask_r: 'My plan ({t}): results', plan_rev_best: 'Your best step: {x}, {n} days.',
        plan_plate_prot_nn: 'A quarter: dal, chana, egg or fish', plan_pl_bowl_n: 'Dal', plan_body_tile_s: 'Your weight, waist and BMI, on this phone', plan_in_from_open: 'Your last period started {n} days ago.',
        plan_rest_b: 'Rest day today', plan_rest_left: '{n} left this week', plan_rest_saved: 'Rest well. Your plan carries on tomorrow.', plan_rest_pill: 'Rest day', plan_th_rest: 'A rest day today. See you tomorrow.',
        plan_rest_q: 'Make today a rest day?', plan_rest_yes: 'Yes, rest today', plan_th_wb: 'Welcome back. Nothing to catch up: just today.',
        plan_pause: 'Pause for a week', plan_pause_s: 'Your steps and the reminder rest for 7 days, then carry on', plan_paused_til: 'Paused until {d}', plan_unpause: 'Start again now',
        plan_sl_pause_h: 'Take a week off?', plan_sl_pause_p: 'You can pause your plan for a week. It carries on after that, from where you are.', plan_stop_or: 'Or pause it for a week instead',
        plan_past_h: 'Your last plan', plan_past_p: '{t} · {a} to {b} · followed on {n} days', plan_past_p1: '{t} · {a} to {b} · followed on 1 day', plan_sum_past: 'Before this: {t}, {a} to {b}, followed on {n} days', plan_sum_past1: 'Before this: {t}, {a} to {b}, followed on 1 day',
        plan_chg_h: 'Your plan has changed', plan_chg_preg: 'You are pregnant now, so {t} is on hold. You followed it on {n} days. Your pregnancy plan has the steps for now.', plan_chg_birth: 'Your baby is here, so your pregnancy plan has ended. Your after-birth plan starts with the daily recovery check.',
        plan_chg_d: 'Your plan has changed. Open My plan to see what is next.', plan_chg_go_preg: 'See my pregnancy plan', plan_chg_go_post: 'See my after-birth plan', plan_chg_go_d: 'Open My plan',
        plan_hero_days: '{n} of 7 days this week', plan_hero_days_s: 'Days you followed your plan. Rest days count.', plan_res_tile: '{n} days so far', plan_rev_hold: 'Next week: the same pace. Your steps grow after a week with 3 days or more.',
        plan_keep2: 'Keep my habits', plan_other: 'Work on something else', plan_other_s: 'Pick a goal. The same goal again starts from where you are now.', plan_other_s2: 'Pick a goal for your next plan.', plan_ct_help_s: 'Danger signs, and who to call',
        plan_path_post_h: 'After the birth', plan_pp_1: 'Weeks 1 to 6', plan_pp_1_p: 'Rest, your daily recovery check, and your 6-week check', plan_pp_2: 'Weeks 7 to 12', plan_pp_2_p: 'Short walks and your pelvic floor', plan_pp_3: 'Months 4 to 12', plan_pp_3_p: 'At your own pace',
        plan_today: 'Today', plan_walk: 'Walk or move {n} minutes', plan_walk_s: 'Brisk: you can talk, but not sing', plan_add: 'Add minutes', plan_today_n: 'Today: {n} min',
        plan_yoga: 'Today’s yoga', plan_strength_day: 'Strength day', plan_plate_today: 'Your plate today', plan_habit_new: 'New this week',
        plan_tiles_plate: 'My plate', plan_tiles_moves: 'Moves and calm', plan_tiles_body: 'My body', plan_tiles_prog: 'My progress',
        plan_remind: 'Remind me every day', plan_remind_at: 'At', plan_stop: 'Stop my plan', plan_stop_q: 'Stop your plan? What you logged stays on your phone.', plan_stop_yes: 'Yes, stop it', plan_cancel: 'Keep it',
        plan_foot: 'Everyday habits from national guidelines, the same for every woman. No supplements, herbs or medicines here: your doctor decides those.',
        plan_foot_ttc: 'Everyday habits from national guidelines, and the folic acid tablet they advise before a pregnancy. Your answers choose your version. No other supplements, herbs or medicines here: your doctor decides those.',
        plan_foot_preg: 'Everyday habits from national guidelines, and the iron tablets your doctor prescribes in pregnancy. No other supplements, herbs or medicines here: your doctor decides those.',
        plan_foot_d: 'Everyday habits from national guidelines. Any other tablet, herb or medicine: your doctor decides.',
        plan_cons_tab: 'Your tablet every day:', plan_cons_hb: 'Your Hb test:', plan_cons_long: 'How long it usually takes:',
        plan_done: 'Done', plan_yes: 'Yes', plan_well: 'Well done.', plan_today_d: 'Your plan for today', plan_today_dn: 'Your step {n}', plan_today_move: 'Move {n} minutes today',
        plan_rev_h: 'Week {n} is done', plan_rev_hp: 'Plan week {n} is done', plan_rev_min: 'You moved {a} minutes. Your target was {t}.', plan_rev_e: 'How was your energy this week?', plan_e_low: 'Low', plan_e_ok: 'Okay', plan_e_good: 'Good',
        plan_rev_b: 'What got in the way?', plan_b_time: 'No time', plan_b_tired: 'Too tired', plan_b_pain: 'Pain', plan_b_family: 'Family or work', plan_b_out: 'Weather or safety', plan_b_none: 'Nothing',
        plan_tip_time: 'Split it up: two 10-minute walks count. Walk while you talk on the phone, or after dinner with your family.',
        plan_tip_tired: 'On tired days, do the 5-minute calm breath or a slow 10-minute walk. Some movement is better than none.',
        plan_tip_pain: 'On painful days, try the cramps routine in Feel better now, or rest. Pain that stops your daily work needs a doctor.',
        plan_tip_family: 'Ask someone to walk with you, or do a routine at home while the children play. One healthy plate can feed the whole family.',
        plan_tip_out: 'Move indoors: march on the spot, walk up and down the stairs, or do a yoga routine at home.', plan_tip_none: 'Well done. Keep going.',
        plan_rev_next: 'Next week: {t} minutes', plan_got: 'Got it',
        plan_fin_h: 'You did 12 weeks', plan_fin_p: 'Every week counts. Keep the habits that helped you most.', plan_keep: 'Keep going', plan_again: 'Start again',
        plan_plate_h: 'My plate', plan_plate_p: 'No food is banned. Eat the green ones more often and the yellow ones less often.',
        plan_pl_veg: 'Sabzi', plan_pl_grain: 'Roti, rice', plan_pl_prot: 'Dal, protein', plan_pl_bowl: 'Curd',
        plan_plate_half: 'Half: sabzi and salad', plan_plate_grain: 'A quarter: roti, rice or millet', plan_plate_prot: 'A quarter: dal, chana, paneer, egg or fish', plan_plate_bowl: 'On the side: curd or chaas',
        plan_more: 'More often', plan_less: 'Less often', plan_avoid: 'Avoid', plan_local: 'From {r}', plan_all: 'Everywhere in India', plan_change: 'Change',
        plan_habits_h: 'Your food habits', plan_fast: 'Keeping a vrat (fast)?', plan_plate_note: 'No diet pills, weight-loss powders or supplements without your doctor.',
        plan_plate_foot: 'Based on the Dietary Guidelines for Indians (ICMR-NIN, 2024). Eat what your family eats, with these changes.',
        plan_g_grain: 'Grains and millets', plan_g_protein: 'Dal and protein', plan_g_veg: 'Vegetables and greens', plan_g_fruit: 'Fruit', plan_g_drink: 'Drinks', plan_g_snack: 'Snacks and others',
        plan_body_h: 'My body', plan_body_p: 'Optional. These numbers stay on your phone, and you can delete them any time.',
        plan_body_preg: 'In pregnancy your doctor watches your weight. Note it in your pregnancy logs.',
        plan_height: 'Height', plan_ft: 'Feet', plan_in: 'Inches', plan_cm: 'cm', plan_weight: 'Weight (kg)', plan_waist: 'Waist (cm), if you like', plan_waist_l: 'Waist',
        plan_waist_how: 'How to measure your waist', plan_waist_how_p: 'Stand straight and breathe out. Put a tape round your waist halfway between your lowest rib and the top of your hip bone, usually near your navel. Snug, not tight.',
        plan_body_save: 'Save', plan_body_saved: 'Saved on your phone.', plan_body_bad: 'Check the numbers: height 120 to 210 cm, weight 25 to 250 kg, waist 40 to 200 cm.',
        plan_bmi: 'BMI', plan_bmi_range: 'Healthy range for Indian women: 18.5 to 22.9',
        plan_bmi_low: 'Your BMI is below the healthy range for Indian women. Eat regular meals with enough dal, milk, nuts and grains. If you are losing weight without trying, see a doctor.',
        plan_bmi_ok: 'Your BMI is in the healthy range for Indian women. The plan keeps your weight steady and builds strength.',
        plan_bmi_hi: 'Your BMI is above the healthy range for Indian women. Small, steady changes help, and healthy habits help your body even before your weight changes.',
        plan_waist_hi: 'Your waist is 80 cm or more. In Indian women a bigger waist goes with a higher chance of sugar and heart problems. Aim to bring it below 80 cm, slowly.',
        plan_waist_ok: 'Your waist is under 80 cm, the limit for Indian women.',
        plan_focus_h: 'Your focus', plan_focus_habits: 'Habits first', plan_focus_weight: 'Habits and weight',
        plan_focus_habits_s: 'No weight goal. Habits help your cycles, skin and energy on their own.', plan_focus_weight_s: 'A little more activity each week, up to 250 minutes. Your weight shows in your progress.',
        plan_focus_lowbmi: 'Your BMI is already in the healthy range, so the plan keeps your weight steady.',
        plan_hist: 'What you noted', plan_body_del: 'Delete my body notes', plan_body_del_q: 'Delete all your height, weight and waist notes?', plan_body_del_yes: 'Yes, delete them',
        plan_body_show: 'Show my numbers', plan_body_hidden: 'Hidden because others use this phone.',
        plan_body_foot: 'BMI is a rough guide: build, muscle and age matter too. The limits for Indian women come from the 2009 national consensus: BMI 23 and waist 80 cm.',
        plan_moves_h: 'Moves and calm', plan_moves_p: 'Do what you can. Every minute counts towards your week.',
        plan_m2_skill: 'Today’s skill: {s}', plan_m2_skill_n: 'Today’s skill', plan_m2_skill_s: '2 minutes · from this week’s chapter', plan_m2_rule_s: 'This week’s sleep rule', plan_m2_les_h: 'This week’s chapter', plan_m2_month: 'This month’s read',
        plan_fb_m2h: 'A skill you practise every day makes hot flushes easier to handle, even when they still come.', plan_fb_m2q: 'Noticing your thoughts, and doing one thing that lifts you, helps your mood day by day.', plan_fb_m2r: 'A steady body clock lets sleep come more easily.', plan_fb_m2s: 'A few minutes of balance a day helps keep you steady on your feet.',
        plan_r_steady: 'Steady on your feet', plan_r_steady_s: 'Balance at a wall, 3 minutes',
        /* Version 39.52: pregnancy yoga (new lines wait for doctor review, wording review 19.52) */
        plan_r_preg1: 'Pregnancy yoga', plan_r_preg2: 'Pregnancy yoga', plan_r_preg3: 'Pregnancy yoga',
        plan_r_preg1_s: 'First three months: gentle stretches and slow breathing', plan_r_preg2_s: 'Middle three months: stretches, strength and rest on your side', plan_r_preg3_s: 'Last three months: easy moves, long breaths out and rest on your side',
        plan_pi_wy: '{x}, or {y} on 2 days a week',
        plan_py_h: 'Pregnancy yoga', plan_py_go: 'Go gently in a cool room, with water nearby, and skip any move that doesn’t feel right. You should be able to talk while you move.',
        plan_py_stop: 'Dizziness, a headache, breathlessness before you start, or a calf that hurts or swells. Stop, rest, and tell your doctor today.', plan_py_now: 'Chest pain, fainting, or regular painful tightenings in your tummy.',
        plan_py_unwell: 'Feeling unwell?', plan_py_unwell_h: 'Stop now and rest', plan_py_uw_ok: 'I feel fine now', plan_py_uw_stop: 'Stop for today',
        plan_py_rest_h: 'Rest now', plan_py_rest_p: 'Your walk and yoga wait until you check your answers again; Sakhi asks you tomorrow. If you feel worse, don’t wait: call 112.',
        plan_py_hard: 'Next time, go more slowly and skip any move that feels hard. If something felt wrong, tell your doctor.',
        plan_py_lock_plan: 'Yoga for your pregnancy comes with My pregnancy plan, after two safety questions.', plan_py_lock_doc: 'Yoga opens when your doctor says exercise is fine for you. Then change your answers in My safety answers.', plan_py_lock_now: 'No yoga until you check your answers again.',
        plan_py_lock_v1: 'Yoga for your pregnancy comes with the newer My pregnancy plan. To switch, tap “{x}” in {y}. What you logged stays.',
        plan_fb_pyoga: 'Gentle yoga in pregnancy can ease aches and help you sleep and feel calmer.',
        plan_in_mbone: 'Has a doctor said your bones are weak, or did a bone break after a small fall?', plan_in_mheart: 'Chest pain, fainting, or getting very breathless when you walk?',
        plan_m2_heart_w: 'Please see your doctor before you do more. Until then your walk stays easy, and Gentle start takes the place of Strength at home. Chest pain right now, or pain spreading to your jaw or arm: call 112.',
        plan_m2_bone_w: 'Every move in this plan is bone-safe, with no jumps. Ask your doctor about a bone scan and tablets.',
        plan_ms_eye: 'Once a week', plan_ms_q: 'This week, how much did {x} get in your way?', plan_ms_hot: 'hot flushes and night sweats', plan_ms_sleep: 'poor sleep', plan_ms_mood: 'worry or low mood', plan_ms_body: 'aches, stiffness or tiredness', plan_ms_lo: '0 · not at all', plan_ms_hi: '10 · very much',
        plan_m2_e45_h: 'Your periods stopped before 45', plan_m2_read: 'Read more',
        plan_m2_w4_h: 'Hot flushes still getting in your way?', plan_m2_w4_h2: 'Your doctor can help too',
        plan_m2_w4_p: 'The most effective treatment for hot flushes is hormone therapy, prescribed by an MBBS gynaecologist. Your plan works beside it, or on its own.',
        plan_m2_w4_on: 'You take hormone medicine: keep to your doctor’s plan, and see your doctor about it once a year.',
        plan_m2_hrt: 'Call 112 now if one calf is swollen and painful, you are suddenly breathless, or one side of your body feels weak or speaking is hard.',
        plan_m2_aches: 'Aches and tiredness: ask your doctor which blood tests you need, often Hb and thyroid.',
        plan_m2_w12_h: 'Your checks after 40', plan_m2_w12_p: 'After 40, BP, sugar and your bones need checking more often. See which checks, and how often.', plan_m2_w12_go: 'See the checks',
        plan_m2_v2_h: 'Your plan has a new version', plan_m2_v2_p: 'A short chapter a week for hot flushes, sleep and strength, and a few minutes of balance, in a fresh 12 weeks from today. What you logged stays.', plan_m2_v2_yes: 'Try it', plan_m2_v2_done: 'Your new 12 weeks start today.',
        plan_m2_sum_bone: 'Weak bones', plan_m2_sum_heart: 'Chest pain or very breathless when you walk', plan_m2_keep_s: 'Every day · from {p}', plan_stop_l_m: 'Pain, dizziness, chest pain, breathlessness that doesn’t settle, or bleeding.',
        plan_m2_poi_h: 'Before a plan: see a gynaecologist', plan_m2_poi_ok: 'My doctor has seen me', plan_m2_poi_stop: 'My doctor says my periods have stopped', plan_m2_poi_read: 'Read about POI',
        plan_m2_year: 'Your year', plan_m2_year_s: 'The skills that work for you, and a read a month, to month 12', plan_m2_wks: 'Weeks {a} to {b}',
        plan_m2_p_h: 'A short course for hot flushes, a chapter a week', plan_m2_p_q: 'A short course for worry and low mood, a chapter a week', plan_m2_p_r: 'One sleep rule a week', plan_m2_p_s: 'Strength, balance and food for your bones',
        plan_m2_str_all: '{r} runs twice a week from week 1, in every part.',
        plan_m2_heart_h: 'Your walk stays easy for now', plan_m2_heart_ok: 'My doctor says I can do more', plan_m2_bone_h: 'Your bones',
        plan_m2_res_h: 'Your own numbers', plan_m2_res_ms: 'How much {x} got in your way: {a} of 10 in your first 2 weeks, {b} of 10 in your last 2.', plan_m2_res_n: 'Nights you slept well or okay: {a} of {an} in your first 2 weeks, {b} of {bn} in your last 2.', plan_m2_res_str: 'Strength days: {n}',
        plan_r_gentle: 'Gentle start', plan_r_cycle: 'Cycle care yoga', plan_r_sun: 'Sun salutation, slow', plan_r_strength: 'Strength at home', plan_r_calm: 'Calm breath',
        plan_r_gentle_s: 'Stretch and balance, easy on the knees', plan_r_cycle_s: 'Hips, belly and back', plan_r_sun_s: 'Surya namaskar, one breath a pose', plan_r_strength_s: 'Chair, wall and stairs, 2 days a week', plan_r_calm_s: 'Anulom vilom and bhramari',
        plan_mins: 'About {n} min', plan_today_pill: 'Today', plan_walk_h: 'Walking', plan_walk_p: 'Brisk walking is the easiest way to add minutes: fast enough that you can talk, but not sing.',
        plan_stop_h: 'Stop and rest if you feel', plan_stop_l: 'Pain, dizziness, chest pain, breathlessness that doesn’t settle, or bleeding. During your period, do what feels comfortable and skip what hurts.',
        plan_sun_care: 'Skip this if you have back pain or high BP, or feel dizzy. Do Gentle start instead.', plan_knee_note: 'Knee pain: kneeling moves are swapped for easier ones.',
        plan_moves_foot: 'Poses from the Common Yoga Protocol (Ministry of AYUSH) and simple home moves, in our own words and pictures.',
        plan_p_intro: 'Each move has a timer and a moving picture. Go at your own pace, and tap Next any time.', plan_p_voice: 'Read the steps aloud', plan_p_voice_d: 'Off on a shared phone, unless you turn it on',
        plan_p_start: 'Start', plan_p_pause: 'Pause', plan_p_resume: 'Go on', plan_p_next: 'Next', plan_p_finish: 'Finish', plan_p_both: 'both sides', plan_p_rounds: '{n} rounds, one slow breath in each pose',
        plan_p_step: 'Move {i} of {n}', plan_p_round: 'Round {i} of {n}', plan_p_right: 'Right side', plan_p_left: 'Left side', plan_p_set: 'Set {i} of {n}', plan_p_left_t: '{t} left',
        plan_p_in: 'Breathe in', plan_p_out: 'Breathe out',
        /* Version 39.39: the rest between moves, and Previous (UI words only) */
        plan_p_prev: 'Previous', plan_p_rest: 'Rest', plan_p_more: '+20s', plan_p_skiprest: 'Skip rest', plan_p_up: 'Next', plan_p_done_t: '{x} done',
        plan_p_rest_say: 'Rest. Next: {n}.',
        plan_p_done_h: 'Well done', plan_p_done_m: '{n} minutes added to your week.', plan_p_done_m1: 'One minute added to your week.', plan_p_done_0: 'Routine done. Every move counts.', plan_p_done_b: 'Every move counts. Start your diary to keep your minutes.',
        plan_p_feel: 'How did it feel?', plan_feel_easy: 'Easy', plan_feel_ok: 'Just right', plan_feel_hard: 'Hard',
        plan_feel_hard_tip: 'Do Gentle start for a week, and go slowly. If a move hurts, skip it.', plan_feel_thanks: 'Thank you. Keep going at this pace.',
        plan_p_again: 'Do it again', plan_p_back: 'Back to my plan',
        plan_prog_h: 'My progress', plan_prog_p: 'From what you logged, compared with before you started.', plan_prog_p0: 'From what you logged.',
        /* Version 39.36: the reveal's rows for My pregnancy (interface words) */
        plan_rv_pf: 'From day 4: your pelvic floor, 1 set a day', plan_rv_pf13: 'From week 13: your pelvic floor, 1 set a day', plan_rv_ps14: 'At 14 and 28 weeks: a quick check of your 2 safety answers', plan_rv_ps28: 'At 28 weeks: a quick check of your 2 safety answers', plan_rv_mv28: 'From 28 weeks: your baby’s movements, in “How did today go?”', plan_rv_mv: 'Each evening: your baby’s movements, in “How did today go?”',
       
        /* Version 39.34: My pregnancy, safety first (new lines wait for doctor review; plan_mv_side and plan_fb_pf are verified lines, word for word) */
        plan_ps_h: 'Before you start', plan_ps_p: 'Two questions keep your plan safe for you. Your answers stay on this phone.', plan_ps_now_q: 'Right now, do you have any of these?', plan_ps_none: 'None of these', plan_ps_yes: 'Yes, one of these', plan_ps_now_p: 'No walk until you check your answers again; your other steps stay. Sakhi asks you tomorrow.', plan_ps_told_q: 'Has your doctor or ANM told you any of these?', plan_ps_told_q_doc: 'Has your doctor told you any of these?', plan_ps_rest: 'My doctor or ANM told me to rest, or not to exercise', plan_ps_rest_doc: 'My doctor told me to rest, or not to exercise', plan_ps_unsure: 'Not sure about any of these', plan_ps_unsure_p: 'Not sure? Tick it. Sakhi keeps your walk easy until your doctor says.', plan_ps_t_green: 'Your full plan', plan_ps_t_green_p: 'A walk at a pace you can talk, growing over the weeks, with yoga for your stage of pregnancy on 2 days, the pelvic floor from week 13, and the step for your goal.', plan_ps_t_amber: 'Easy walking, until your doctor says', plan_ps_t_amber_p: 'An easy 10-minute walk, the pelvic floor from week 13, and the step for your goal. At your next check-up, ask: “Is it fine for me to exercise?”', plan_ps_t_red: 'Gentle days', plan_ps_t_red_p: 'No walking target. The pelvic floor from week 13 and the step for your goal stay. Your doctor decides when you can do more.', plan_ps_t_now: 'No walk until you check your answers again', plan_ps_re_h: 'A quick check', plan_ps_re_p: 'Two questions, so your steps still fit you.', plan_ps_re_now: 'You told Sakhi about a sign that doesn’t wait. Before your next walk, check your answers.', plan_ps_re_go: 'Check my answers', plan_ps_re_same: 'Nothing has changed', plan_ps_set: 'My safety answers', plan_walk_easy: 'Easy: slow, at a pace you can talk. Stop if you feel dizzy.', plan_mv_q: 'Your baby’s movements today', plan_mv_p: 'Your baby’s own pattern, not a number.', plan_mv_usual: 'As usual', plan_mv_less: 'Less than usual', plan_mv_unsure: 'Not sure', plan_mv_none: 'Not felt any movement today', plan_mv_side_h: 'Tonight', plan_mv_side: 'From 28 weeks, go to sleep on your side, left or right. A pillow under your belly and between your knees helps.', plan_pf_t: 'Pelvic floor · 1 set', plan_fb_pf: 'Doing these in pregnancy lowers the chance of leaking urine late in pregnancy and after the birth.',
        plan_prog_none: 'Start your plan to see your progress here.',
        plan_prog_min: 'Active minutes each week', plan_prog_target: 'target', plan_prog_str: 'Strength days this week', plan_prog_food: 'Food habits, last 7 days',
        plan_prog_cyc: 'Days between periods', plan_prog_before: 'Before', plan_prog_since: 'Since you started', plan_prog_cyc_wait: 'Your first cycle since you started isn’t over yet.', plan_prog_cyc_none: 'Log your periods to see this.',
        plan_prog_pain: 'Periods that needed a painkiller', plan_prog_pxl: 'The week before your period: days it got in your way a lot', plan_prog_hway: 'Period days it got in your way', plan_prog_hway_p: 'Leaked through clothes, changed at night or couldn’t do your day, from your check-ins.', plan_prog_dn: '{n} days',   /* Version 39.55 */ plan_prog_pain_n: '{a} of {n}', plan_prog_signs: 'PMOS signs in your check-in', plan_prog_signs_n: '{n} ticked',
        plan_prog_energy: 'Your energy each week', plan_prog_body: 'Weight and waist', plan_prog_first: 'First noted', plan_prog_last: 'Latest', plan_prog_expect: 'What to expect',
        plan_ex_1: 'Weeks 1 to 4', plan_ex_1_p: 'Many women feel more energy and sleep better.', plan_ex_2: 'Weeks 4 to 12', plan_ex_2_p: 'Habits get easier, and your waist may start to come down.',
        plan_ex_3: '3 to 6 months', plan_ex_3_p: 'Periods may start to come more regularly.', plan_ex_now: 'You are here',
        plan_prog_foot: 'These are your own entries, not a test result or a diagnosis. Change takes months, and it differs for every woman.',
        plan_ask: 'Want advice on supplements or medicines?', plan_ask_b: 'Ask a Qura doctor about supplements or medicines', plan_ask_topic: 'My PMOS plan: supplements or medicines',
        plan_ask_p: 'Talk to a doctor for medicines or supplements, or if nothing changes after 3 months. Qura’s doctors are Ayurveda (BAMS) doctors; hormone medicines need an MBBS gynaecologist, and Qura refers you.',
        plan_sum_h: 'PMOS plan', plan_sum_wk: 'Week {n} of 12, started {d}', plan_sum_min: 'Active minutes: about {a} a week over the last {k} weeks (target now {t})', plan_sum_str: 'Strength: {a} days a week',
        plan_sum_food: 'Food habits kept: {a} of the last 7 days', plan_sum_w: 'weight {a} → {b} kg', plan_sum_w1: 'weight {a} kg', plan_sum_c: 'waist {a} → {b} cm', plan_sum_c1: 'waist {a} cm', plan_sum_b: 'BMI {b}',
        plan_setup: 'Start your PMOS plan', plan_setup_s: '12 weeks of food and moves',
        plan_done_today: 'Done today', plan_added: '{n} minutes added', plan_undo: 'Undo',
        plan_notif_off: 'Phone notifications are off for Sakhi, so this reminder can’t ring.', plan_notif_on: 'Turn them on',
        plan_all_h: 'Plans for you', plan_all_p: 'Picked from your diary and your answers, on your phone.', plan_all_now: 'Your plans now', plan_all_rec: 'Suggested for you', plan_all_more: 'More plans',
        plan_all_none: 'Nothing to suggest yet. Log your periods and how you feel, or tell Sakhi what you would like help with.',
        plan_all_diary: 'Start your diary, and Sakhi suggests plans from what you log.',
        plan_all_foot: 'Suggestions come from what you logged and what you told Sakhi. They are not a diagnosis. For medicines or supplements, ask a doctor.',
        plan_help_h: 'What you want help with', plan_help_none: 'Nothing picked yet.', plan_help_save: 'Save', plan_help_saved: 'Saved. Your suggestions are updated.', plan_cancel_b: 'Cancel',
        plan_off_eye: 'Ready for you', plan_off_p: 'Made from your answers and your first log.', plan_off_p0: 'Made from your answers.', plan_off_b: 'See my plan', plan_off_later: 'Later',
        plan_rec_home: 'A plan for you', plan_rec_not: 'Not now', plan_fit_ttc_h: 'Trying for a baby now?', plan_fit_ttc_p: 'Getting ready for a baby has the steps for these months: your folic acid tablet, your food and your moves.', plan_fit_ttc_go: 'See Getting ready', plan_fit_cyc_h: 'Not trying for a baby now?', plan_fit_cyc_p: 'Getting ready for a baby is for the months before a pregnancy. Choose a plan for your periods, or keep this one.', plan_fit_pick: 'Choose my plan', plan_fit_keep: 'Keep {t}', plan_fit_hd: 'A different plan may fit now', plan_fit_pd: 'Your stage has changed. Choose a plan for now, or keep yours.', plan_fit_keep_d: 'Keep my plan', plan_fit_meno_h: '{t} may fit now', plan_fit_meno_p: 'A short chapter a week for hot flushes, sleep or worry, with strength and balance for your bones. What you logged stays.', plan_fit_meno_go: 'See {t}', plan_for_h_run: 'Your plan for this', plan_for_h_offer: 'A free plan for this',
        plan_m2_rv_p: 'Weeks {a} to {b}: {p}', plan_m2_rv_ch: 'Every week: a short chapter, and a look back at your week', plan_m2_rv_str: 'Twice a week, from day 2: {r}',
        plan_m2_tom: 'Tomorrow: {x}.', plan_m2_tl_skill: 'your skill', plan_m2_tl_move: 'your walk', plan_m2_tl_ca: 'a calcium food', plan_m2_tl_food: 'your plate', plan_rec_all: 'All plans', plan_paused_pill: 'After your 6-week check',
        plan_d_12w: '12 weeks', plan_d_21d: '21 days', plan_d_3m: '3 minutes', plan_d_2m: '2 minutes', plan_d_daily: 'Every day',
        plan_sc_t: 'Could it be PMOS?', plan_sc_s: 'The signs doctors ask about, with your diary',
        plan_why_g: 'You asked for help with: {k}.', plan_why_pcos: 'You told Sakhi you have PMOS.', plan_why_sc: 'Your PMOS self-check matched PMOS.', plan_why_sc_risk: 'Your PMOS self-check found 1 of the 2 signs.',
        plan_why_gaps: '{n} of your last {m} cycles were longer than {b} days.', plan_why_signs: 'You ticked PMOS signs in {n} monthly check-ins.', plan_why_acne: 'You logged acne on {n} days.',
        plan_why_heavy: 'Heavy flow in {n} of your last {m} periods.', plan_why_ciheavy: 'You ticked heavy flow in your check-in.', plan_why_tired: 'You felt tired on {n} days this month.',
        plan_why_pain: 'You needed a painkiller in {n} of your last {m} periods.', plan_why_cramps: 'You logged cramps on {n} days.',
        plan_why_low: 'You felt low, anxious or irritable on {n} days this month.', plan_why_cimood: 'You ticked low mood in your check-in.', plan_why_sleep: 'You slept badly on {n} days this month.',
        plan_why_hot: 'You logged hot flushes on {n} days this month.', plan_why_cihot: 'You noted hot flushes in your check-in.', plan_why_nausea: 'You logged nausea on {n} days.',
        plan_why_preg: 'For your pregnancy.', plan_why_birth: 'Your baby was born {n} days ago.', plan_why_birth0: 'Your baby was born today.', plan_why_birth1: 'Your baby was born yesterday.', plan_why_post: 'It helps every woman after a birth.', plan_why_feed: 'You are breastfeeding.',
        plan_why_ttc: 'You are planning a pregnancy.', plan_why_midlife: 'It helps in the years around menopause.',
        plan_gv_irregular: 'more regular periods', plan_gv_pmos: 'feeling better with PMOS', plan_gv_pain: 'less period pain', plan_gv_heavy: 'more iron and easier heavy periods', plan_gv_pms: 'calmer days before your period', plan_gv_skin: 'clearer skin and less extra hair',
        plan_gv_weight: 'a healthier weight', plan_gv_ready: 'getting ready for a baby', plan_gv_food: 'eating well in pregnancy', plan_gv_nausea: 'easier days with nausea', plan_gv_iron: 'enough iron', plan_gv_sleep: 'better sleep', plan_gv_mood: 'calmer days',
        plan_gv_recovery: 'a good recovery', plan_gv_pelvic: 'a stronger pelvic floor', plan_gv_feed: 'easier breastfeeding', plan_gv_hot: 'easier days with hot flushes', plan_gv_bones: 'strong bones and muscles', plan_gv_aches: 'fewer aches and more energy',
        plan_pk_cycle: 'My cycle plan', plan_pk_weight: 'My healthy body plan', plan_pk_ready: 'Getting ready for a baby', plan_pk_pain: 'Easier periods', plan_pk_heavy: 'Stronger blood', plan_pk_pms: 'A calmer cycle',
        plan_pk_preg: 'My pregnancy plan', plan_pk_ttc: 'Getting ready for a baby', plan_pk_post: 'My recovery plan', plan_pk_meno: 'My midlife plan', plan_gl_ready: 'Getting ready for a baby',
        plan_in_goal_h: 'What do you want to work on first?', plan_in_goal_p: 'Pick one. Sakhi builds your plan around it, and you can change it any time.',
        plan_in_cyc_h: 'About your periods', plan_in_gap: 'How far apart are your periods, usually?', plan_gap_lt21: 'Less than 21 days', plan_gap_n: '21 to 35 days', plan_gap_g45: '36 to 45 days', plan_gap_g60: '46 to 60 days', plan_gap_gt60: 'More than 60 days', plan_gap_vary: 'They change a lot',
        plan_in_skips: 'Do some months get skipped?', plan_no: 'No', plan_in_dx: 'Has a doctor said you have PMOS (PCOS)?', plan_dx_ns: 'Not sure',
        plan_in_signs: 'Do you notice any of these?', plan_sg_hair: 'Extra hair on the face, chin or body', plan_sg_acne: 'Acne that keeps coming back', plan_sg_thin: 'Hair thinning on the head', plan_sg_neck: 'Dark, velvety skin on the neck', plan_sg_none: 'None of these',
        plan_in_pain_h: 'About your period pain', plan_in_pain: 'How bad is it, usually?', plan_pn_mild: 'Mild', plan_pn_pk: 'I need a painkiller', plan_pn_stop: 'It stops my day', plan_in_pdays: 'For how many days?', plan_pd_1: '1 day', plan_pd_23: '2 to 3 days', plan_pd_4: 'More than 3 days',
        plan_in_heavy_h: 'About your bleeding', plan_in_pads: 'On your heaviest day, how often do you change a pad?', plan_pa_4: 'Every 4 hours or more', plan_pa_23: 'Every 2 to 3 hours', plan_pa_12: 'Every 1 to 2 hours, or two pads at once',
        plan_in_clots: 'Clots as big as a ₹10 coin?', plan_in_tired: 'Do you often feel tired, dizzy or out of breath?',
        plan_in_pms_h: 'Before your period', plan_in_pms: 'What do you notice?', plan_pm_mood: 'Low mood', plan_pm_irr: 'Irritable', plan_pm_anx: 'Anxious', plan_pm_bloat: 'Bloating', plan_pm_breast: 'Breast pain', plan_pm_head: 'Headache', plan_pm_crave: 'Food cravings',
        plan_in_pmsl: 'How much does it affect your day?', plan_pl_little: 'A little', plan_pl_lot: 'A lot',
        plan_in_day_h: 'Your day', plan_in_day_p: 'So your steps fit your day.', plan_in_bed: 'When do you usually go to sleep?', plan_bd_22: 'Before 10 pm', plan_bd_23: '10 to 11 pm', plan_bd_24: '11 pm to midnight', plan_bd_late: 'After midnight',
        plan_in_work: 'Your day is mostly', plan_wk_day: 'Work or college in the day', plan_wk_night: 'Night shifts', plan_wk_home: 'At home',
        plan_in_rem: 'When should Sakhi remind you?', plan_rm_08: 'Morning, 8 am', plan_rm_13: 'Afternoon, 1 pm', plan_rm_18: 'Evening, 6 pm', plan_rm_20: 'Night, 8 pm', plan_rm_21: 'Night, 9 pm',
        plan_in_when_h: 'When can you move for 10 minutes?', plan_in_when_p: 'Sakhi puts your walk at this time each day.', plan_w_morning: 'In the morning', plan_w_breakfast: 'After breakfast', plan_w_lunch: 'After lunch', plan_w_evening: 'In the evening', plan_w_dinner: 'After dinner',
        plan_in_body_h: 'Your body (optional)', plan_in_body_p: 'For your BMI and waist, with the limits for Indian women. It stays on your phone.', plan_in_skip: 'Skip', plan_in_save: 'Save and continue',
        plan_rv_h: 'Your plan is ready, {name}', plan_rv_h0: 'Your plan is ready', plan_rv_goal: 'Your goal: {g}', plan_rv_now: 'Now: {x}', plan_now_gap: '{g} apart', plan_now_skip: 'some months skipped', plan_pi_pd: 'On your period days: {x}', plan_pi_bf: 'The 7 days before your period: {x}', plan_pi_kd: 'Just before your period: {x}', plan_pi_phb: 'Once, in your first 3 weeks: {x}', plan_per_rv_kit: 'On your period days: your period kit, and just before, get it ready', plan_per_rv_w4: 'Week 4: a look at your first month, and when to see a doctor', plan_per_rv_rest: 'On your period days: a rest lying down (yoga nidra)', plan_per_rv_str: 'From week {n}: {r} on 2 of your walking days', plan_per_rv_yoga: 'From week {n}, in the week before your period: {r}',   /* Version 39.55 */
        plan_now_clots: 'clots', plan_now_endo: 'endometriosis or adenomyosis (a doctor said)', plan_now_vary: 'gaps that change a lot', plan_now_pdays: 'for {x}', plan_now_pads: 'a pad {x}', plan_now_pmsl: 'affects your day {x}', plan_now_tired: 'often tired or dizzy', plan_rv_12: '12 weeks',
        plan_pi_walk: 'Walking that grows from {n} minutes a day', plan_pi_food: 'One food change every two weeks, starting with: {h}', plan_pi_bed: 'A regular bedtime: {t}', plan_pi_shift: 'Sleep 7 to 8 hours after your shift',
        plan_pi_cramps: 'The 3-minute cramps routine on period days', plan_pi_iron: 'One iron-rich food step every day', plan_pi_calm: 'Calm breath every day', plan_pi_goal: 'Every day: {x}', plan_pi_days: '{n} days a week: {x}',
        plan_rv_exp: 'What to expect', plan_rv_diff: 'It is different for every woman.', plan_rv_exp_g: 'Week 1: small steps. Week 4: your first look at how it is going. Week 12: your results. It is different for every woman.', plan_rv_exp_preg: 'A small step each day until your baby is born. Your check-ups and the danger signs always come first.',
        plan_rv_doc_h: 'First, one check', plan_rv_doc_cyc: 'Periods that skip months or come more than 45 days apart need one doctor check: thyroid, prolactin and PMOS. If your period is late and you could be pregnant, do a pregnancy test first.',
        plan_rv_doc_heavy: 'Bleeding this heavy needs a doctor’s check and an Hb test. Both are free at a government health centre.', plan_rv_doc_heavy_doc: 'Bleeding this heavy needs a doctor’s check and an Hb test. Both are also free at a government health centre.', plan_rv_doc_pain: 'Pain that stops your day needs a doctor’s check.',
        plan_rv_free: 'Free government doctor', plan_rv_qura: 'Talk to a Qura doctor', plan_rv_later: 'Later', plan_rv_today: 'Today', plan_rv_go: 'Start today', plan_rv_edit: 'Change my answers',
        plan_a_str_s: 'Strength day: Strength at home counts, about {n} min', plan_a_bed: 'In bed by {t}', plan_a_bed_s: 'Phone away half an hour before', plan_a_shift: 'Sleep 7 to 8 hours after your shift', plan_a_shift_s: 'A dark, quiet room helps', plan_sleep_today: 'Your sleep tonight',
        plan_ci_h: 'How did today go?', plan_ci_b: 'How did today go?', plan_ci_d: 'Done', plan_ci_p: 'Partly', plan_ci_n: 'Not today', plan_ci_need: 'Pick one answer for each.', plan_ci_done: 'Checked in today', plan_ci_b_n: 'How did {d} go?', plan_night_d: 'Still {d}’s plan', plan_night_d_s: 'Your plan day ends at 4 am, so this counts for {d}.',
        plan_why: 'Why it helps', plan_why_q: 'Why?', plan_ci_count: '{a} of {n} today · {w} of 7 days this week', plan_ci_petal: 'A petal for your garden', plan_ci_home: 'Back to Today', plan_ci_plan: 'See my plan', plan_ci_none: 'Some days are like that. Tomorrow, start with just one.',
        plan_th_done: '{a} of {n} done today',
        plan_fb_move: 'Moving most days helps your body use insulin better, and that is one of the things that helps periods come more regularly.',
        plan_fb_food: 'Small food changes add up: steadier sugar levels help your hormones, and your cycle, over time.',
        plan_fb_sleep: 'A regular bedtime helps your body clock, and your body clock and your cycle are linked.',
        plan_fb_str: 'Stronger muscles use sugar well, and that helps with PMOS.', plan_fb_movep: 'Regular movement makes period pain milder for many women.',
        plan_fb_cramps: 'Gentle stretches and warmth relax the muscles that cramp.', plan_fb_iron: 'Iron-rich food helps your body make the blood you lose each month.',
        plan_fb_calm: 'Slow breathing calms your body’s stress response, and that can make the days before your period easier.', plan_fb_pelvic: 'A few minutes a day help your pelvic floor recover after the birth.',
        plan_fb_recov: 'Checking each day helps you spot early anything that needs a doctor.', plan_fb_hot: 'Cooling down and a calm breath can make a hot flush more comfortable while it passes.',
        plan_fb_bones: 'Strength work two days a week keeps your muscles strong after 40, and helps your bones too.', plan_fb_move_g: 'Moving most days lifts your energy and mood.', plan_fb_any: 'Every small step counts.',
        plan_my_h: 'My plan', plan_my_pick_h: 'What do you want to work on?', plan_my_pick_p: 'Pick one, answer a few questions, and Sakhi makes your 12-week plan.', plan_my_track: 'You’re keeping track. Pick a goal whenever you like.',
        plan_path_h: 'Your 12 weeks', plan_path_ahead: 'The weeks ahead', plan_path_now: 'This week', plan_path_cyc: '{m} minutes a week', plan_path_new: 'new: {h}', plan_path_r4: 'Your 4-week check', plan_path_m4: 'Month 1 look-back', plan_path_r8: 'Your 8-week check', plan_path_m8: 'Month 2 look-back', plan_path_r12: 'Your results', plan_path_light: 'Your daily steps',
        plan_today_h: 'Today’s steps', plan_res_h: 'My progress', plan_suggested: 'Suggested', plan_f_jain: 'Jain: no onion, garlic or root vegetables', plan_plate_prot_v: 'A quarter: dal, chana or paneer', plan_plate_prot_vn: 'A quarter: dal, chana or soybean', plan_plate_prot_e: 'A quarter: dal, chana, paneer or egg', plan_plate_prot_en: 'A quarter: dal, chana or egg', plan_plate_bowl_n: 'On the side: a bowl of dal or salad', plan_moves_tile_s: 'Yoga and simple moves, with moving pictures', plan_plate_tile_s: 'Half your plate sabzi, and foods from your region', plan_in_milk: 'Do you have milk, curd or paneer?', plan_in_from: 'From your diary: your last {n} gaps were {a} to {b} days. Change it if this isn’t right.', plan_in_from_eq2: 'From your diary: your last 2 gaps were both {a} days. Change it if this isn’t right.', plan_in_from_eq: 'From your diary: your last {n} gaps were all {a} days. Change it if this isn’t right.', plan_rv_days_h: 'Your days and weeks', plan_preg_moves: 'In pregnancy, start moves only after your doctor says it’s OK for you.', plan_res_days: 'Days you followed your plan, each week', plan_res_first: 'Your first bar fills in as you follow your plan this week.', plan_th_h: 'What was on your plate today?', plan_th_p: 'Tap what you ate, and the plate fills in.', plan_th_add: 'Next meal, you could add {x}.', plan_th_full: 'A full plate today.', plan_a_iron_rot: 'Today’s iron food: {x}', plan_a_iron_c: 'Eat it with lemon, amla or guava.', plan_a_still: 'Still doing {h}?', plan_a_ca: 'Today’s calcium food: {x}', plan_a_ca_s: 'Calcium from your kitchen, for your bones', plan_a_pfood: 'This week: {x}', plan_a_bfood: 'Food while you breastfeed', plan_a_fast: 'On your fast today', plan_a_fast_s: 'A proper sargi or sehri, water when you can, and break the fast gently', plan_a_fast_pb: 'Talk to your doctor before a fast without water', plan_fast_q: 'Fasting today?', plan_fast_undo: 'Not fasting today', plan_fast_h: 'Fasting?', plan_fast_today: 'Fasting today', plan_fast_tom: 'Fasting tomorrow', plan_res_low: 'Low, anxious or irritable days', plan_res_low_b: '30 days before you started', plan_res_low_s: 'Last 30 days', plan_res_heavy: 'Periods with heavy flow',
        plan_rev_days: 'You followed your plan on {n} of 7 days.', plan_rev_keep: 'Next week: keep going, one day at a time.',
        plan_ct_h: 'Your care team', plan_ct_sum: 'Doctors, your report, help', plan_ct_free_s: 'At the PHC or district hospital', plan_ct_qura: 'A Qura doctor', plan_ct_qura_s: 'The first 20-minute call is free', plan_ct_report: 'Report for my doctor',
        plan_set_h: 'Plan settings', plan_set_goal: 'Change what I work on', plan_set_goal_s: 'Starts a new 12 weeks. What you logged stays.', plan_other_h: 'Other plans',
        plan_sl_go_h: 'Your plan is ready', plan_sl_go_p: 'Your first step: {a}.', plan_sl_doc_h: 'Did you get the doctor check?', plan_sl_doc_p: 'One check for skipped or late periods: thyroid, prolactin and PMOS. If your period is late and you could be pregnant, do a pregnancy test first.', plan_sl_doc_yes: 'Yes, done',
        plan_sl_lapse_h: 'Shall we start again, small?', plan_sl_lapse_p: 'No catching up needed. Just today: {a}.', plan_sl_lapse_mon: 'A new week is a fresh start.', plan_sl_lapse_b: 'Today’s steps',
        plan_sl_m_h: 'Month {n} done', plan_sl_m_p: 'See how your habits and your cycle are doing.', plan_sl_m_b: 'See how it is going',
        /* Version 37.1: her first day (docs/first-days-audit-2026-10-24.md; wording-review section 15) */
        plan_when_tom: 'tomorrow', plan_day: 'Day {n}', plan_th_soon: 'Your plan starts {d}', plan_th_first: 'Your first step: {a}', plan_th_ci_at: 'Check-in at {t}',
        plan_th_y: 'Yesterday: {a} done.', plan_th_yp: 'Yesterday: {a} done, {p} partly.', plan_th_y0: 'No steps yesterday. Today, start with one.', plan_th_d3: '3 days in: small steps add up.',
        plan_sl_new_h: 'Your new plan is ready', plan_rv_repl: 'It replaces the plan you are on when you start it. What you logged stays.', plan_sl_go_b: 'See my plan and start', plan_sl_keep: 'Keep my plan',
        plan_sl_d1_h: 'Day 1 of your plan', plan_sl_d1_p: 'Your first step: {a}. At {t}, a 1-minute check-in.', plan_sl_d1_p0: 'At {t}, a 1-minute check-in.',
        plan_sl_call_h: 'Questions about your plan?', plan_sl_call_p: 'A Qura doctor can go through it with you. The first 20-minute call is free.', plan_soon_now: 'Start today instead',
        plan_rv_next: 'Next', plan_rv_made: 'Made from what you told Sakhi: {x}', plan_rv_len: '12 weeks · from about {n} minutes a day', plan_rv_len_few: '12 weeks · a few minutes a day', plan_rv_len_preg: 'Until your baby is born · a few minutes a day',
        plan_rv_steps_h: 'Your {n} steps', plan_rv_step1_h: 'Your daily step', plan_rv_week: 'This week: {m} minutes, about {n} a day. It grows a little each week.', plan_rv_also: 'In My plan too: yoga, your plate and your progress.',
        plan_rv_day_h: 'How each day works', plan_rv_d1: 'Today shows your steps. Tap Done when you do one.', plan_rv_d2: 'At {t}, Sakhi asks “How did today go?” It takes 1 minute.', plan_rv_d3: 'Sakhi tells you what each step does for you.',
        plan_rv_miss: 'Missed a day? Nothing to catch up. Just start again.', plan_rv_aud: 'Hear Dr. Megha (30 seconds)',
        plan_rv_when_h: 'What happens when', plan_rv_w1: 'Every week: a short look back at your week', plan_rv_w4: 'Week 4: a look at your first month', plan_rv_w12: 'Week 12: your results, next to where you started',
        plan_rv_cyc: 'Periods often take 3 to 6 months to change. Keep noting them: that’s how Sakhi sees the change.',
        plan_rv_doc_h2: 'Alongside your plan: one doctor check', plan_rv_doc_when: 'You can start your steps today. Get the check in the next 3 weeks; Sakhi will ask you about it.', plan_rv_doc_soon: 'You can start your steps today. Please see a doctor soon.',
        plan_st_h: 'When do you want to start?', plan_st_day: 'Your first day', plan_st_today: 'Today', plan_st_tom: 'Tomorrow', plan_st_mon: 'Monday, {d}', plan_st_at: 'Sakhi checks in at', plan_st_at_p: 'Each evening, 1 minute: “How did today go?”',
        plan_st_rem: 'Reminders are on: {l}. Nothing shows on the lock screen. Change them any time in Me > Reminders.', plan_st_off: 'Your phone reminders are off, so nothing will ring. You can turn them on in Me > Reminders.', plan_st_block: 'Your phone isn’t letting Sakhi ring reminders. You can allow them in Me > Reminders.', plan_st_r_ci: 'your {t} check-in', plan_st_r_walk: 'your {t} walk', plan_st_r_move: 'your {t} time to move', plan_st_r_wind: 'your {t} wind-down', plan_st_r_wind_n: 'your {t} wind-down from day {n}', plan_rv_from: 'From day {n}: {x}', plan_rv_bed0: 'a regular bedtime',
        /* Version 39.46: after the birth, version 2 (review section 19.46; the new lines wait for the doctor) */
        plan_p2_nb_h: 'This week: signs in your baby that can’t wait', plan_p2_bp_h: 'Your BP check this week', plan_p2_bp_p: 'You had high BP in your pregnancy. It can stay high after the birth, so get it checked this week, and again at your 6-week check.', plan_p2_tom: 'Remind me tomorrow',
        plan_p2_six_bp: 'You had high BP in your pregnancy: ask for a BP check at this visit.', plan_p2_six_gdm: 'You had sugar in your pregnancy: ask for the 75 g sugar test at this visit, then once a year.', plan_p2_from: 'From your pregnancy', plan_p2_six_rem: 'Remind me on {d}', plan_p2_six_went: 'I went',
        plan_p2_un_h: 'Ready to move a little more?', plan_p2_un_p: 'Back to strong starts after your own check at 6 weeks, or when your doctor says so.', plan_p2_un_six: 'I went to my 6-week check', plan_p2_un_doc: 'My doctor said I can exercise', plan_p2_un_ready: 'I feel ready to start gently', plan_p2_un_not: 'Not yet', plan_p2_un_open: 'Back to strong: more walking, and {r} 2 days a week.',
        plan_p2_rdy_p: 'Start gently only if both are true:', plan_p2_rdy_c1: 'My bleeding is no heavier when I’m active', plan_p2_rdy_c2: 'My stitches or wound don’t hurt when I walk', plan_p2_rdy_go: 'Start back to strong', plan_p2_rdy_no: 'Not both? Keep to walks and squeezes for now, and ask at your check.',
        plan_p2_rd_h: 'Is your body ready for more?', plan_p2_rd_p: '6 simple tests at home, about 10 minutes. They open {r}.', plan_p2_rd_go: 'Start the tests', plan_p2_rd_tick: 'Mark each one you can do comfortably', plan_p2_rd_walk: 'Walk for 30 minutes', plan_p2_rd_leg: 'Stand on one leg for 10 seconds, a hand near a wall', plan_p2_rd_sit: 'Stand up from a chair and sit down, 10 times', plan_p2_rd_lift: 'Lift the rice bag from the floor, 10 times', plan_p2_rd_carry: 'Carry a half-full bucket for 20 steps', plan_p2_rd_toes: 'Rise up on your toes, 10 times',
        plan_p2_rd_bag: 'Use a rice or atta bag about your baby’s weight. Never test with your baby.', plan_p2_rd_bag0: 'Use a rice or atta bag of about 4 kg.', plan_p2_rd_q: 'While doing them: any leak, heaviness, pain or bleeding?', plan_p2_rd_no: 'No', plan_p2_rd_yes: 'Yes', plan_p2_rd_stay_h: 'Stay at this level for 2 more weeks', plan_p2_rd_stay: 'That is still doing your plan. Still leaking, heavy, or unable to hold in wind or potty at 3 months: see your doctor or a physiotherapist.',
        plan_p2_rd_ok_h: '{r} opens', plan_p2_rd_ok: '2 days a week from tomorrow. Your walks and squeezes carry on.', plan_p2_rd_notyet: 'Not all 6 yet? Try again in 2 weeks. Nothing is lost.', plan_p2_rd_run: 'Running, jumping and skipping are outside this plan. Ask a physiotherapist or your doctor first.', plan_p2_rd_saved: '{r} opens from tomorrow.', plan_p2_rd_saved0: 'Saved. Try again in 2 weeks.',
        plan_p2_fq: 'How is your baby fed now?', plan_p2_f_only: 'Only breast milk', plan_p2_f_mix: 'Breast milk and other milk', plan_p2_f_other: 'Other milk only',
        plan_p2_fl_only: 'Only breast milk, day and night, your baby under 6 months, and no period yet: this protects you for now. It stops when any one of these changes, so choose a method before then.', plan_p2_fl_mix: 'With other milk too, breastfeeding on its own does not protect you. Choose a method before sex starts again.', plan_p2_fl_other: 'Without breastfeeding, you can get pregnant again from about 4 to 6 weeks after the birth. Choose a method before sex starts again.',
        plan_p2_c_h: 'Before sex starts again: choose your method', plan_p2_c_p: 'You can get pregnant before your first period comes back.', plan_p2_c_p0: 'You can get pregnant again soon after a birth, even before your first period.', plan_p2_c_go: 'See my choices', plan_p2_c_have: 'I have a method',
        plan_p2_v2_h: 'Your recovery plan has more now', plan_p2_v2_p: 'It follows your body to your baby’s first birthday: your evening check, your 6-week check, then back to strong. Your days and answers stay.', plan_p2_v2_yes: 'Switch to it', plan_p2_v2_done: 'Your recovery plan is up to date.',
        plan_a_pwalk: 'Walk a little, as you feel able', plan_a_pf: 'Your pelvic floor squeezes', plan_a_pf5: '5 gentle squeezes', plan_a_pf5_s: 'Your pelvic floor, during a feed', plan_a_pf5_s0: 'Your pelvic floor, lying or sitting', plan_a_pf10: '10 squeezes, and the knack', plan_a_pf10_s: 'Squeeze before you cough, sneeze or lift',
        plan_lk_h: 'This week: any leaks?', plan_lk_never: 'Never', plan_lk_some: 'Sometimes', plan_lk_most: 'Most days', plan_md_h: 'How are you in yourself this week?', plan_md_low: 'Low or worried most days for 2 weeks or more? Talk to your doctor this week, or call Tele-MANAS 14416, free.',
        plan_rv_p14: 'From day 14: a short walk, 3 days a week', plan_rv_p42: 'Around day 42: your own check, then back to strong', plan_rv_p84: 'From week 12: is your body ready for more?', plan_rv_p365: 'To your baby’s first birthday', plan_rv_p365b: 'To a year after the birth', plan_rv_d2p: 'At {t}, your recovery check: 1 minute, with the signs that can’t wait.', plan_st_r_six: 'your 6-week check on {d}',
        plan_pq_h: 'Your year, in 5 parts', plan_pq_1: 'Rest and heal · days 0 to 13', plan_pq_1p: 'Your evening check, gentle squeezes, rest', plan_pq_2: 'Settle · days 14 to 41', plan_pq_2p: 'Short walks, choosing a method, your 6-week check', plan_pq_3: 'Back to strong · weeks 7 to 18', plan_pq_3p: 'After your 6-week check: more walking, gentle moves, then strength', plan_pq_4: 'Keep going · to 6 months', plan_pq_4p: 'Your steps carry on. Periods can come back any time.', plan_pq_5: 'Your first year · to {d}', plan_pq_5p: 'Your steps, and a look back at your year',
        plan_rh_day_rc: '{n} steps, recovery check {t}', plan_th_rc_at: 'Recovery check at {t}', plan_p2_un_hd: 'Ready for a little more?', plan_p2_un_pd: 'Start when your doctor says so, or when you feel ready.', plan_rv_len_p: 'To your baby’s first birthday · a few minutes a day', plan_rv_len_pb: 'A year after the birth · a few minutes a day', plan_st_at_pp: 'Each evening, 1 minute: your recovery check, to day 41.', plan_st_r_rc: 'your {t} recovery check', plan_p2_six_wait: 'Back to strong opens on {d}.', plan_rh_p42: 'Around day 42', plan_rh_p42_s: 'Your own check, then back to strong', plan_rh_p84: 'From week 12', plan_rh_p84_s: 'Is your body ready for more?', plan_res_lk: 'Leaks', plan_res_lk_w: '{x} · week {n}', plan_st_r_per: 'a note the day before your period', plan_st_r_pf: 'your {t} first set', plan_pf_pi_d13: 'Days 1 to 3: {x}', plan_pf_pi_soon: 'In your first weeks: {x}', plan_and: ' and ', plan_rem_after: '{t}, after your walk',
        plan_in_now_p: 'So Sakhi knows where you’re starting, and can show you what changes.', plan_in_sum_h: 'Here’s what you told Sakhi', plan_in_sum_p: 'Check it, then Sakhi makes your plan.',
        plan_in_sum_goal: 'What you want to work on', plan_in_sum_now: 'Now', plan_in_sum_when: 'Your time to move', plan_in_make: 'Make my plan',
        plan_ci_first: 'This takes a minute. Your answers stay on this phone.', plan_ci_tom: 'Tomorrow: the same steps. See you at {t}.', plan_ci_see: 'See you tomorrow at {t}.',
        plan_sum_days: 'Followed the plan on about {a} days a week', plan_sum_goal: 'Working on: {g}',
        /* Version 37.2: a companion that notices (docs/ux-gaps-2026-10-24.md; wording-review section 15) */
        plan_cnt_dp: '{d} done, {p} partly today', plan_ci_week: '{w} of 7 days this week',
        plan_per: 'Your period came after {n} days. Sakhi noted it for your results.', plan_per_ab: 'Your period came about {n} days after the last one. Sakhi noted it for your results.', plan_per0: 'Your period is noted. Sakhi keeps it for your results.', plan_per_pain: 'Your cramps routine is on Today on your period days.', plan_per_q: 'Your period came after {n} days.', plan_per_ab_q: 'Your period came about {n} days after the last one.', plan_per0_q: 'Your period is noted.', plan_pain_q: 'Pain today?',
        plan_pk_pelvic: 'My pelvic floor plan',   /* Version 39.56 */
        plan_pf_sets: 'Your squeeze sets', plan_pf_sets_d: 'Your 2 minutes', plan_pf_sets_s: '{n} of {m} today · {l}', plan_pf_sets_n: '{n} of {m} today', plan_pf_lv: 'level {n}, {p}',
        plan_pf_pos_lie: 'lying down', plan_pf_pos_sit: 'sitting', plan_pf_pos_stand: 'standing', plan_pf_pos_walk: 'standing or walking', plan_pf_pd: 'One set is enough on a period day, lying down if you like.',
        plan_pf_relax: 'Breathe and let go, a few minutes', plan_pf_relax_s: 'In place of squeezes, until a doctor has checked the pain',
        plan_pf_find: 'Find the right muscles', plan_pf_find_s: 'Lying down: squeeze as if to stop wind and urine, lift, then let go fully', plan_pf_find_n: 'Your sets are {p} now: find the squeeze that way first, then start',
        plan_pf_chk: 'Get checked once by a doctor', plan_pf_chk_s: 'A doctor names the cause, not the app. Until then, your sets stay lying down.',
        plan_pf_urge: 'When the urge comes: stop, squeeze, breathe', plan_pf_urge_s1: 'Stand still, squeeze a few times, breathe out slowly, then walk calmly', plan_pf_urge_s2: 'Then wait a few minutes more before you go, a little longer each week',
        plan_pf_h1: 'Squeeze before you cough, sneeze or lift', plan_pf_h1_s: 'The knack. It can stop a leak as it starts.', plan_pf_h2: 'Water through the day', plan_pf_h2_s: 'A little at a time, about 6 to 8 glasses. Too little makes the bladder more urgent.',
        plan_pf_h3: 'On the toilet: knees up, breathe out', plan_pf_h3_s: 'Feet on a low stool, lean forward, and don’t push hard', plan_pf_h3u: 'Less tea, coffee and cola, for 2 weeks', plan_pf_h3u_s: 'Then see if the urge is calmer. Keep drinking water.',
        plan_pf_h4: 'Lift the safe way', plan_pf_h4_s: 'Squeeze first, breathe out as you lift, and keep it close to you', plan_pf_h5: 'One set standing, at a task', plan_pf_h5_s: 'While you cook, wash or wait: squeeze and hold, the way you learned',
        plan_fb_pfl: 'Squeezing your pelvic floor every day, the right way, makes the muscles stronger. It takes about 3 months.', plan_fb_pf_find: 'Finding the right muscles first makes every set count.',
        plan_fb_pf_chk: 'Heaviness can have more than one cause. A doctor’s check tells you which, and which exercises are safe.', plan_fb_pf_urge: 'Calming the urge and stretching the time between toilet visits trains the bladder. It takes a few weeks.',
        plan_fb_pf_habit: 'Small changes in your day take strain off your pelvic floor.', plan_fb_pf_relax: 'Pain when you squeeze can mean the muscles are too tight. Breathing and letting go comes first.',
        plan_in_pf_h: 'About the leaks or heaviness', plan_in_pft: 'When do you leak?', plan_pft_stress: 'With a cough, sneeze, laugh or lift', plan_pft_urge: 'With a sudden strong need, before I reach the toilet', plan_pft_both: 'Both', plan_pft_heavy: 'I feel heaviness or a bulge down below',
        plan_in_pfway: 'How much does it get in the way of your day?', plan_pw_0: 'Not at all', plan_pw_1: 'A little', plan_pw_2: 'Quite a lot', plan_pw_3: 'A lot',
        plan_pfs_p: 'Tick any that are true for you. Some need a doctor before exercises. Nothing has to be answered.', plan_pfs_join_p: 'See a doctor first if any of these is true for you.', plan_pfs_none_b: 'None of these', plan_pfs_none: 'None of these? Tap Continue.',
        plan_pfs_retain: 'I can’t pass urine, or it dribbles all the time', plan_pfs_retain_w: 'See a doctor today. Exercises don’t treat this.',
        plan_pfs_const: 'Leaking all the time, day and night, after a long labour or an operation', plan_pfs_const_w: 'See a doctor this week. This can be repaired, and it shouldn’t wait 3 months of exercises.', plan_pfs_const_g: 'The repair is free at government hospitals.',
        plan_pfs_uti: 'Burning, fever, or blood in the urine', plan_pfs_uti_w: 'See a doctor. This is usually an infection, not a weak pelvic floor.',
        plan_pfs_bulge: 'A bulge that stays outside', plan_pfs_bulge_w: 'See a doctor today. If it is very painful or bleeding, go now.', plan_pfs_bowel: 'Wind or stool I can’t hold', plan_pfs_bowel_w: 'See a doctor this week.',
        plan_pfs_pain: 'Pain when I squeeze, or pain with sex', plan_pfs_pain_w: 'Your plan starts with breathing and letting go instead of squeezes. See a doctor about the pain.',
        plan_pfs_mesh: 'A past operation for leaks or prolapse, or cancer treatment in the pelvis', plan_pfs_mesh_w: 'Show this plan to your doctor first. Your sets stay lying down until your doctor or physiotherapist says more is fine.',
        plan_lk_hv: 'This week: any heaviness?', plan_pf_sure: 'Are you sure you’re squeezing the right way?', plan_pf_sure_line: 'A Qura doctor or a physiotherapist can check it with you.', plan_pf_when: 'When did it happen?',
        plan_pf_cmp: 'Compared with when you started?', plan_pf_cmp_b: 'Better', plan_pf_cmp_s: 'The same', plan_pf_cmp_w: 'Worse',
        plan_pf_safe_h: 'See a doctor first', plan_pf_safe_d: 'Your answers before you started need a doctor first.', plan_pf_safe_seen: 'I’ve seen a doctor',
        plan_pf_right_h: 'Is it the right squeeze?', plan_pf_right_p: 'A Qura doctor can talk it through on a free call. Your own doctor or a women’s health physiotherapist can check it in person.', plan_pf_right_g: 'A government hospital’s gynae OPD can check it too, at little or no cost.',
        plan_pf_doc_h: 'What did the doctor say?', plan_pf_doc_pop: 'A prolapse, and exercises can help', plan_pf_doc_ok: 'I can exercise', plan_pf_doc_not: 'Not checked yet',
        plan_pf_doc_pop_t: 'Your sets now move on to sitting and standing as they unlock. Keep 3 sets a day to week 16.', plan_pf_doc_ok_t: 'Your sets now move on as they unlock.',
        plan_pf_mesh_h: 'Show this plan to your doctor first', plan_pf_mesh_ok: 'My doctor said more is fine', plan_pf_pain_h: 'Pain during your sets', plan_pf_pain_p: 'Your sets are now breathing and letting go. See a doctor about the pain: a Qura doctor first, or your own.', plan_pf_pain_ok: 'A doctor checked it: back to squeezes',
        plan_pf_end_h: 'Still leaking or heavy?', plan_pf_end_p: 'A doctor can treat this. After exercises there are more treatments: a ring pessary, medicines for an urgent bladder, and an operation. Your doctor decides with you.', plan_pf_low: 'Feeling low or alone because of this? Tele-MANAS 14416 is free.',
        plan_pf_rv_d1: 'Days 1 to 3: find the right muscles. Your sets start lying down.', plan_pf_rv_lv: 'After every 5 days of sets, a new level: longer holds, then sitting and standing.', plan_pf_rv_urge: 'From day 4: when the urge comes, stop, squeeze, breathe.',
        plan_pf_rv_chk: 'Get checked once by a doctor. Until then, your sets stay lying down.', plan_pf_rv_h: 'From week 2: one small habit, a new one every 2 weeks.', plan_pf_rv_w4: 'Weeks 1, 4 and 12: are you sure it’s the right squeeze? A Qura doctor can help.',
        plan_pf_rv_16: 'If a doctor finds a prolapse: 3 sets a day to week 16, then keep strong.', plan_pf_rv_join: 'Every day: your squeeze sets, 3 a day', plan_pf_rv_keep: 'After 12 weeks: keep strong with one set a day.',
        plan_pf_res_lv: 'Your level', plan_pf_res_lv_s: 'Level {n} of 8 · sets on {d} days', plan_pf_res_way: 'Gets in the way of your day', plan_pf_res_sure: 'Sure of the squeeze', plan_pf_res_hv: 'Heaviness',
        plan_pf_tile: 'Squeeze sets', plan_pf_tile_ch: 'Chapters', plan_pf_tile_g: 'Leaks and heaviness',
        plan_pf_tip_time: 'A set takes a few minutes. Do one while the tea boils, or in bed before you sleep.', plan_pf_tip_tired: 'On a tired day, do your sets lying down. They still count.',
        plan_pf_tip_pain: 'If a squeeze hurts, stop and tap “It hurts” in your sets. A doctor should check the pain.', plan_pf_tip_family: 'No one can see a squeeze: do a set sitting with your family, or at a task.',
        plan_pf_tip_out: 'Your sets need no space: lying down, sitting or standing, at home.',
        plan_pk_period: 'My period plan',   /* Version 39.55 */
        plan_a_kit: 'Your period kit', plan_a_kit_s: 'Warmth, the cramps routine and a rest position', plan_a_kitready: 'Get your kit ready', plan_a_kitready_s: 'Your period is likely soon: a hot water bag, pads or cloth, and a quiet place to rest',
        plan_a_restday: 'Rest today, or walk 10 minutes', plan_a_restday_s: 'Your choice on a period day. Either one counts.', plan_a_pdiary: 'Your pain diary for your doctor', plan_a_pdiary_s: 'A minute a week, to take to your doctor',
        plan_a_relax: 'Relax, a few minutes', plan_a_relax_s: 'Slow breaths with Dr. Megha, or yoga nidra at bedtime', plan_a_prest: 'Rest, lying down: yoga nidra', plan_a_prest_s: 'In place of the walk today. It counts.',
        plan_a_phb: 'Get your Hb tested', plan_a_phb_s: 'Ask a Qura doctor, or your own doctor. Done? Add your result.', plan_a_calmweek: 'Your calm-week plan', plan_a_calmweek_s: 'An early night · a lighter day · 10 minutes outside',
        plan_fb_kitready: 'Having your things ready before your period makes the first day easier.', plan_fb_restday: 'Rest or gentle movement are both fine on a period day.',
        plan_fb_cyoga: 'Gentle yoga in the days before your period relaxes your hips, belly and back.', plan_fb_relax: 'A few calm minutes a day can quiet pain signals. Many women notice it over a few periods.',
        plan_fb_pdiary: 'A pain diary shows your doctor your pattern, which helps them plan your treatment.', plan_fb_prest: 'Resting lying down on a heavy day saves your energy.',
        plan_fb_phb: 'Heavy periods can lower your Hb. A test shows whether you need treatment.', plan_fb_calmweek: 'Planning the week before your period, with lighter days and more rest, makes the hard days easier to manage.',
        plan_fb_pca: 'Calcium from food on most days is good for you, and in some studies it eased the days before a period.', plan_in_endo: 'Has a doctor told you that you have endometriosis or adenomyosis?',
        plan_pt_h: 'Your period today', plan_pt_note: 'The same 3 taps for pads or cloth.', plan_pt_soak: 'Did it soak through within 1 to 2 hours?', plan_pt_way: 'Did it get in your way?', plan_pt_w_leak: 'Leaked through clothes', plan_pt_w_night: 'Changed at night', plan_pt_w_day: 'Couldn’t do my day',
        plan_px_q: 'Did it get in the way today?', plan_px_little: 'A little', plan_px_lot: 'A lot',
        plan_per_v2_h: 'My period plan is here', plan_per_v2_p: 'It follows your cycle: steps for your period days, the week before and the days between, and a short chapter each week. What you logged stays.', plan_per_v2_yes: 'Move me to it', plan_per_v2_done: 'Your plan has moved. A fresh 12 weeks starts today.',
        plan_per_w4_h: 'When to see a doctor', plan_per_pms2_h: 'Your second period on the plan', plan_per_end: 'Still hard? A doctor can treat painful and heavy periods and PMS. Take your record.', plan_pain_saved: 'Saved for your results',
        plan_rev_mins: 'You moved {a} minutes.', plan_rev_bar: '{b} on {n} days.', plan_rev_bar1: '{b} on 1 day.',
        plan_end_h: 'Your 12 weeks are done', plan_end_p: 'You followed your plan on {n} of {t} days. See your results, and choose what next.', plan_end_b: 'See your results', plan_carry_p: 'Your steps carry on.', plan_carry_stop: 'Stop', plan_carry_on: 'Your steps carry on', plan_end_stop_s: 'Your steps and their reminders end. What you logged stays on your phone.',
        plan_fin_days: 'You followed your plan on {n} of {t} days.', plan_fin_low: 'Want to try again, smaller? A new plan can start with one step.', plan_fin_doc: 'If nothing has changed, see a doctor: they can look for the cause.',
        plan_fin_next: 'What next?', plan_keep_s: 'The same steps, and the evening check-in carries on.', plan_again2: 'Start a new 12 weeks', plan_again_s: 'Answer a few questions again. What you logged stays.',
        plan_sl_m_lp: 'You started on {d}. Start again small today: {a}.', plan_about_n: 'about {n}', plan_prog_said: 'You said: {g}', plan_r_d: 'Yoga',
        /* Version 38: a plan that fits every goal (docs/ux-gaps-2026-10-24.md, themes 5 and 6; wording-review section 16) */
        plan_wk_preg: 'Week {n} of pregnancy', plan_wk_post: 'Week {n} after the birth', plan_sum_own: '{w}, plan started {d}',
        plan_a_due: 'Due now: {x}', plan_a_due_more: 'Due now: {x}, and {n} more', plan_a_due_s: 'Check-ups and tests', plan_fb_due: 'Check-ups and tests on time find problems early, for you and your baby.', plan_pi_due: 'Your check-ups and tests, week by week',
        plan_path_preg_h: 'Your pregnancy', plan_tri_1: 'Weeks 1 to 13', plan_tri_1_p: 'Registration, the first check-up and folic acid', plan_tri_2: 'Weeks 14 to 27', plan_tri_2_p: 'Check-ups, the scan, iron and calcium', plan_tri_3: 'Weeks 28 to 40', plan_tri_3_p: 'Check-ups, your baby’s kicks and your birth plan',
        plan_a_rcheck_s: '1 minute, with the warning signs', plan_pi_rcheck: 'The daily recovery check, until 6 weeks after the birth', plan_ci_chk_done: 'Done today', plan_ci_chk_go: 'Do it now',
        plan_a_prep: 'Your before-pregnancy checklist: tick what you’ve done', plan_pi_prep: 'Your before-pregnancy checklist, once a week', plan_fb_prep: 'The checklist covers what doctors advise before a pregnancy.', plan_fb_food_t: 'Eating well before a pregnancy helps your body get ready.',
        plan_rv_ttc: 'When the woman is under 40, more than 8 in 10 couples get pregnant within a year of regular sex without contraception, and more than 9 in 10 within two years.',
        plan_res_prep_h: 'Before-pregnancy checklist', plan_res_prep: '{a} of {b} done', plan_res_prep_b: 'Open the checklist',
        plan_a_ironf: 'An iron-rich food today', plan_a_ironf_veg: 'Green leafy sabzi, chana, rajma, ragi or poha, with lemon or amla', plan_a_ironf_egg: 'Green leafy sabzi, chana, rajma or eggs, with lemon or amla', plan_a_ironf_nonveg: 'Green leafy sabzi, chana, eggs, fish or meat, with lemon or amla',
        plan_res_meno_hot: 'Weeks with hot flushes', plan_res_meno_sleep: 'Weeks with poor sleep', plan_res_meno_mood: 'Weeks with low mood', plan_res_wks: '{a} of {n} weeks', plan_res_meno_none: 'Fill in your weekly symptom diary to see this.', plan_res_hotd: 'Days with hot flushes', plan_res_hot_none: 'Tap “Hot flushes” on Today on the days you have them, to see this.',
        plan_calm: 'Your calm week: the days before your period. Your calm breath comes first.',
        /* the 24 Oct review's fixes */
        plan_wk_n: 'Week {n}', plan_sum_wkn: 'Plan week {n}, started {d}', plan_sl_m_p2: 'See how your plan is going.', plan_rv_len_d: 'A few minutes a day', plan_res_wk_b: '4 weeks before you started', plan_res_wk_s: 'Last 4 weeks',
        /* Version 39.12: plan follow-through. The new health lines (plan_cg_*, plan_mc_worse_p) wait for the doctor: wording review section 19.12 */
        plan_a_r: '{r} · {n} min', plan_start_b: 'Start',
        /* Version 39.13: yoga and the walk as two steps, and a day with every step done */
        /* Version 39.14: Today's checklist, the day that closes itself, "Why?", plan day, her week's dots (wording review 19.14) */
        plan_pday: 'plan day {n}', plan_t_next: 'Next step', plan_t_next_s: 'Next · {s}', plan_t_part: 'Partly done', plan_t_done: 'Done', plan_t_full: 'Day complete. Well done.',
        plan_t_undo: 'Tapped by mistake? Tap the tick again.', plan_t_more: 'Read more', plan_how_h: 'How', plan_how_r: 'About {n} minutes: {x}.', plan_bring_h: 'What keeping to your plan can bring',
        plan_wk_full: 'This week: {n} full days', plan_wk_full1: 'This week: 1 full day', plan_wk_str: 'strength on {d}', plan_wk_str_tom: 'strength tomorrow', plan_wk_str_now: 'strength today',
        plan_d7_aria: 'Week {w} of your plan: {n} full days so far', plan_d7_aria1: 'Week {w} of your plan: 1 full day so far', plan_d7_t: '{d}: {a} of {n} steps', plan_d7_t1: '{d}: {a} of 1 step', plan_d7_rest: '{d}: rest day', plan_d7_str: '{d}: strength day', plan_rev_short: '{n} of 7 days on your plan', plan_rev_short_f: 'all steps on {n}', plan_rev_open: 'Look back', plan_rev_tip_s: 'Your tip for this week', plan_min_n: '{n} min', plan_dc_h: 'Day complete', plan_dc_tom: 'Tomorrow', plan_dc_how: 'Add how it went (optional)',
        /* Version 39.15: My plan explains the plan (wording review 19.15) */
        plan_goal_l: 'Goal: {g} · {w}', plan_how_h2: 'How your plan works', plan_rh_day: 'Every day', plan_rh_day_s: '{n} steps, check-in {t}', plan_rh_day_s1: '1 step, check-in {t}', plan_rh_wk: 'Every week', plan_rh_wk_s: 'Look back, plan the week', plan_rh_wk_s2: 'A look back',
        plan_rh_m: 'Every 4 weeks', plan_rh_m_s: 'A 1-minute check', plan_rh_end: 'After 12 weeks', plan_rh_end_s: 'Your results', plan_steps_h: 'Your {n} daily steps', plan_steps_h1: 'Your daily step', plan_steps_same: 'Tick here or on Today: it’s the same tick.', plan_how_l: 'How to do it',
        plan_wk_h: 'This week', plan_wk_days: 'Plan days {a} to {b}', plan_wk_legend: 'Each ring has {n} parts: {x}.', plan_wk_legend0: 'Each ring is a day: full when every step is done.', plan_pt_yoga: 'yoga', plan_pt_move: 'walk', plan_pt_food: 'food', plan_pt_sleep: 'sleep',
        plan_wk_min: 'Active minutes', plan_min_of2: '{a} of {t}', plan_cons_h: 'What consistency brings', plan_signs_h: 'Your own signs', plan_sg_e: 'Your energy', plan_sg_e_v: 'Week {n}: {e}', plan_sg_mc: 'Your 4-week check', plan_sg_mc_n: 'In {n} days', plan_sg_mc_1: 'Tomorrow', plan_sg_mc_now: 'Due now', plan_sg_mc_done: 'Done',
        plan_sg_gap: 'Days between periods', plan_sg_gap_b: '{n} before your plan', plan_sg_gap_s: '{n} since', plan_sg_gap_sa: 'about {n} since', plan_set_row_s: 'Reminder, nudge, pause, change or stop',
        plan_a_walk: 'Walk {n} minutes', plan_pi_yoga: 'Yoga at home every day, with moving pictures', plan_cnt_all: 'All {n} done today', plan_th_one: 'One more: {a}', plan_ci_add: 'Tomorrow, add: {x}.', plan_rev_full: 'All your steps on {n} of 7 days.',
        plan_meal_half: 'At lunch or dinner', plan_meal_protein: 'Dal or besan cheela, for example', plan_meal_millet: 'At one meal today', plan_meal_drinks: 'When you want something to drink', plan_meal_snack: 'At snack time', plan_meal_oil: 'When you cook',
        plan_th_str: '{d}: strength day · {a} of {t} this week', plan_th_str_tom: 'Tomorrow: strength day · {a} of {t} this week', plan_th_light: 'A lighter week: 10 minutes a day until {d}.',
        plan_ci_last: 'Last night: in bed by {t}?', plan_ci_last_d: 'Last night: in bed by {t}', plan_ci_yes: 'Yes', plan_ci_close: 'Close', plan_ci_no: 'No',
        plan_ci_left: '{n} questions left', plan_ci_left1: '1 question left', plan_ci_left0: 'All counted. Just save.', plan_ci_change: 'Change an answer',
        plan_ci_n_r: 'Counted from your yoga', plan_ci_n_str: 'Counted from Strength at home', plan_ci_n_rt: 'Counted from the routine you did', plan_ci_n_min: 'Counted: {n} minutes today', plan_ci_n_plate: 'From your plate today', plan_ci_n_today: 'Ticked on Today', plan_ci_n_tool: 'Counted from where you did it',
        plan_ci_goal_h: 'Your goal', plan_ci_str: 'Strength: {a} of {t} this week', plan_ci_str_nx: 'next: {d}', plan_ci_tomr: 'Tomorrow: {r} · {n} min', plan_ci_if: 'You planned: “I’ll {x}.”',
        plan_cg_irregular: 'A step towards more regular periods.', plan_cg_pmos: 'A step towards more regular periods.', plan_cg_skin: 'A step towards clearer skin.', plan_cg_weight: 'A step towards a healthier weight.', plan_cg_ready: 'A step in getting ready for a baby.',
        plan_cg_pain: 'A step towards easier periods.', plan_cg_heavy: 'A step towards feeling stronger.', plan_cg_pms: 'A step towards calmer days before your period.', plan_cg_food: 'A step for a healthy pregnancy.', plan_cg_nausea: 'A step towards easier days.',
        plan_cg_iron: 'A step towards healthy iron levels.', plan_cg_sleep: 'A step towards better sleep.', plan_cg_mood: 'A step towards calmer days.', plan_cg_recovery: 'A step in your recovery.', plan_cg_pelvic: 'A step towards a stronger pelvic floor.',
        plan_cg_feed: 'A step for you and your baby.', plan_cg_hot: 'A step towards more comfortable days.', plan_cg_bones: 'A step towards stronger bones.', plan_cg_aches: 'A step towards more energy.',
        plan_wp_h: 'Plan your week', plan_wp_sub: 'Week {n} · {a} to {b} · 30 seconds', plan_wp_str: 'Your {n} strength days', plan_wp_str1: 'Your strength day', plan_wp_str_p: 'Strength at home, about {n} minutes. Not two days in a row.',
        plan_wp_when: 'Your time to move', plan_wp_if: 'If something gets in the way', plan_wp_last: 'Last week, “{b}” got in the way on {n} days.', plan_wp_last1: 'Last week, “{b}” got in the way on 1 day.',
        plan_wp_sum: 'This week: {m} minutes', plan_wp_new: 'new: {h}', plan_wp_sum_d: 'This week: walk {n} minutes a day', plan_wp_save: 'Save my week', plan_wp_same: 'Same as last week', plan_wp_saved: 'Your week is planned.',
        plan_wp_err: 'Pick {n} days, not two in a row.', plan_wp_err1: 'Pick your strength day.', plan_wp_err_w: 'Pick your time to move.', plan_wp_b: 'Plan your week · 30 seconds',
        plan_wp_row: 'Plan this week', plan_wp_row_s: 'Strength days, your time, and a plan B', plan_wp_row_s2: 'Your time, and a plan B', plan_wp_row_str: 'Strength: {d}',
        plan_ifq_time: 'If I’m short of time, I’ll…', plan_ifq_tired: 'If I’m too tired, I’ll…', plan_ifq_pain: 'If I’m in pain, I’ll…', plan_ifq_family: 'If family or work gets in the way, I’ll…', plan_ifq_out: 'If I can’t go out, I’ll…',
        plan_if_time_five: 'do 5 minutes instead', plan_if_time_split: 'split it into two short walks', plan_if_time_phone: 'walk while I talk on the phone',
        plan_if_tired_breath: 'do the 5-minute calm breath', plan_if_tired_slow: 'take a slow 10-minute walk', plan_if_tired_gentle: 'do the Gentle start yoga',
        plan_if_pain_cramps: 'try the cramps routine', plan_if_pain_rest: 'rest today and walk slowly tomorrow',
        plan_if_family_ask: 'ask someone to walk with me', plan_if_family_home: 'do yoga at home while the children play', plan_if_family_dinner: 'walk with my family after dinner',
        plan_if_out_march: 'march on the spot at home', plan_if_out_stairs: 'walk up and down the stairs', plan_if_out_yoga: 'do a yoga routine at home',
        /* Version 39.22: meditation in the plan, sleep in the check-in, reminders by the research, a calmer My plan */
        plan_a_wind: 'Wind down, in bed by {t}', plan_a_wind_s: 'Tonight: {s} with Dr. Megha', plan_a_wind_t: 'Tonight: {s}', plan_a_wind_how: 'Press play, put the phone face down and close your eyes. Keep the room dark and quiet.', plan_ci_n_wind: 'Wound down: {s}', plan_yoga_when: 'Before a meal',
        plan_ci_slp: 'How did you sleep?', plan_slp_well: 'Well', plan_slp_ok: 'Okay', plan_slp_bad: 'Badly',
        plan_night_h: 'A hard night. Tonight, let a sound help you sleep.', plan_night_p: 'Dr. Megha’s yoga nidra relaxes you part by part. Or play a calm sound that fades out after {n} minutes.',
        plan_night_noted: 'Noted in your diary as poor sleep. Sleeping badly most nights for 2 weeks? Tell your doctor.', plan_tonight: 'Tonight’s wind-down', plan_tonight_pill: 'Tonight',
        /* Version 39.49: night sweats and sleep */
        plan_slp_hot: 'Hot flushes woke me', plan_night_hot_h: 'Hot flushes woke you. Tonight, keep the room cool.', plan_night_hot_p: 'Light cotton clothes and water by your bed help some women too. If a flush wakes you, cool down and breathe slowly until it passes.',
        plan_night_hot_noted: 'Noted in your diary as hot flushes and poor sleep. Woken by them often? See a doctor: they are treatable.',
        plan_wind_rem: 'Wind-down reminder', plan_wind_rem_s: 'Every night at {t}, 30 minutes before bed', plan_wind_rem_ci: 'Your evening check-in brings tonight’s session',
        plan_how_link: 'How it works', plan_why_all: 'Why these {n} steps?', plan_why_all1: 'Why this step?', plan_wp_link: 'Plan the week', plan_add_s: 'Add',
        plan_res_tile_s: '{n} days', plan_garden_n: 'My garden · {n} petals', plan_garden_1: 'My garden · 1 petal', plan_kv_this: 'This week', plan_kv_next: 'Next week', plan_path_all: 'All 12 weeks',
        plan_moves_tab: 'Yoga and moves', plan_calm_tab: 'Calm', plan_calm_p: 'Dr. Megha guides you in her own voice, in English or Hindi. Any one of these is tonight’s wind-down.',
        plan_calm_s_breaths: 'In for 4, out for 6, sitting or lying', plan_calm_s_bhramari: 'A soft hum, sitting up', plan_calm_s_nidra: 'Lying in bed, part by part',
        plan_calm_snd_s: 'Singing bowl and waves, Wandering, Dunes, with a timer', plan_calm_safe_h: 'For rest and sleep, not treatment', plan_calm_safe_p: 'Stop if you feel dizzy or unwell.',
        plan_nudge: 'Nudge at my time to move', plan_nudge_s: '{w}, about {t}', plan_nudge_none: 'Pick your time in Plan this week', plan_nudge_n: 'One nudge a day at most, and none once you have moved or on a rest day.',
        plan_mc_h: 'Your {n}-week check', plan_mc_p: '1 minute · only on this phone', plan_mc_since: 'Since you started, how is your…', plan_mc_e: 'Energy', plan_mc_s: 'Sleep', plan_mc_m: 'Mood', plan_mc_sk: 'Skin and hair',
        plan_mc_better: 'Better', plan_mc_same: 'Same', plan_mc_worse: 'Worse', plan_mc_meas: 'Measure, if you like', plan_mc_opt: 'Optional', plan_mc_waist: 'Waist (cm)', plan_mc_skip: 'Skip', plan_mc_save: 'Save my check',
        plan_mc_bad: 'Check the numbers: waist 40 to 200 cm, weight 25 to 250 kg.', plan_mc_b: 'Do your {n}-week check', plan_mc_row_s: '1 minute: how you feel since you started', plan_mc_end_h: 'How do you feel after 12 weeks?',
        plan_mc_res_h: 'Your first {n} weeks', plan_mc_res_h3: 'Your 12 weeks', plan_mc_did: 'What you did', plan_mc_saw: 'What you noticed', plan_mc_r_moved: 'days you moved', plan_mc_r_str: 'strength days', plan_mc_r_food: 'food habits going', plan_mc_r_days: 'days you followed your plan',
        plan_mc_r_mins: '{n} minutes of yoga and walking in all.', plan_mc_waist_l: 'Waist', plan_mc_weight_l: 'Weight', plan_mc_worse_p: 'Something feels worse? A doctor can help you find out why.', plan_mc_next: 'Your next check: in 4 weeks.',
        plan_mc_hist: 'How you felt', plan_mc_after: 'After {n} weeks:', plan_sum_mc: 'Since starting (her {n}-week check): {x}',
        plan_q_h: 'Two quiet weeks', plan_q_p: 'Life gets busy. Your plan is waiting, and nothing you did is lost. What would help?', plan_q_light: 'Make next week lighter', plan_q_light_s: '10 minutes a day and one food habit', plan_q_light_s2: '10 minutes a day and fewer steps',
        plan_q_light_ok: 'The next 7 days are lighter. Your plan carries on after that.', plan_q_fam: 'Ask family to walk with me', plan_q_fam_s: 'Your own message, with no health words', plan_q_msg: 'Will you walk with me {w}? {n} minutes, every day this week.', plan_q_share: 'Share', plan_q_edit: 'Change it'
      },
      hi: {
        plan_h: 'मेरा PMOS प्लान', plan_h_d: 'मेरा प्लान', plan_tile_t: 'PMOS: खाना, योग और व्यायाम', plan_tile_s: 'चलती तस्वीरों, आपके इलाक़े के खाने और आपकी प्रगति के साथ 12 हफ़्ते',
        plan_off: 'यह प्लान Sakhi के इस वर्ज़न में अभी नहीं है।',
        plan_in_baby_h: 'पहले कुछ बातें', plan_in_baby_p: 'आपके जवाबों से आपके प्लान का सही रूप चुना जाता है। ये इसी फ़ोन पर रहते हैं।', plan_in_bflags: 'क्या इनमें से कुछ आप पर लागू होता है?',
        plan_bf_meds: 'मैं रोज़ कोई दवा लेती हूँ, जैसे दौरे, BP, शुगर, थायरॉइड, मुँहासे या त्वचा के लिए', plan_bf_diab: 'डायबिटीज़ (शुगर)', plan_bf_ntd: 'पिछले गर्भ में रीढ़ या दिमाग़ की ख़राबी', plan_bf_scd: 'सिकल सेल की बीमारी या thalassaemia',
        plan_in_bnone: 'इनमें से कुछ नहीं? ख़ाली छोड़ें और आगे बढ़ें।', plan_in_trying: 'आप कब से कोशिश कर रही हैं?', plan_tr_no: 'अभी शुरू नहीं किया', plan_tr_lt6: '6 महीने से कम', plan_tr_m6: '6 से 12 महीने', plan_tr_gt12: 'एक साल से ज़्यादा',
        plan_a_folic: 'मेरी folic acid की गोली', plan_a_folic_d: 'मेरी गोली', plan_a_folic_get: 'अभी नहीं ली? देखें कहाँ मिलेगी', plan_fb_folic: 'यह बच्चे की रीढ़ और दिमाग़ को बचाता है, जो ज़्यादातर महिलाओं को गर्भ का पता चलने से पहले ही बनने लगते हैं।',
        plan_a_hb: 'हीमोग्लोबिन (Hb) की जाँच', plan_a_hb_s: 'ख़ून की कमी आम है, और गर्भ से पहले इसे ठीक करना ज़्यादा आसान है।', plan_fb_hb: 'ख़ून की कमी आम है, और गर्भ से पहले इसे ठीक करना ज़्यादा आसान है। आयुष्मान आरोग्य मंदिर में मुफ़्त।',
        plan_a_his: 'इस हफ़्ते उनका हिस्सा', plan_fb_his: 'Sperm बनने में लगभग 2–3 महीने लगते हैं, इसलिए बदलाव का असर उसके बाद test में दिखता है।',
        plan_a_ready: '1 मिनट की तैयारी जाँच', plan_a_ready_s: 'आप कितना तैयार महसूस करती हैं?', plan_fb_ready: '6 छोटे सवाल, सिर्फ़ आपके लिए। इसमें कोई नंबर नहीं।',
        plan_fb_bcalm: 'पीरियड से पहले वाले हफ़्ते में एक दिन उम्मीद, अगले दिन चिंता होना आम है। कुछ धीमी साँसें कई महिलाओं की मदद करती हैं।', plan_bcalm_h: 'कुछ शांत मिनट', plan_bcalm_p: 'पीरियड से पहले वाले हफ़्ते के लिए। हफ़्ता 8 से इसे चालू कर सकती हैं।', plan_bcalm_p2: 'पीरियड से पहले वाले हफ़्ते के लिए।',
        plan_fb_bgreens: 'हरी सब्ज़ियों से फ़ोलेट और आयरन मिलता है, जो गर्भ से पहले शरीर को चाहिए।', plan_fb_bdal: 'इनसे प्रोटीन, आयरन और फ़ोलेट मिलता है।', plan_fb_bfruit: 'विटामिन C वाले फल शरीर को आयरन लेने में मदद करते हैं।', plan_fb_btea: 'खाने के साथ चाय आयरन को रोकती है। चाय छोड़नी नहीं है।', plan_fb_bmilk: 'हड्डियों के लिए कैल्शियम, अभी भी और गर्भ में भी।',
        plan_fb_bkatori: 'बहुत दुबला होना या वज़न काफ़ी ज़्यादा होना, दोनों से अंडा निकलना रुक सकता है। खाने, नींद और पैदल चलने में धीरे-धीरे बदलाव मदद करता है; अचानक बहुत कम खाना नहीं।', plan_fb_bnuts: 'छोटे-छोटे नाश्ते मिलकर काफ़ी हो जाते हैं।', plan_meal_tea: 'जब चाय या कॉफ़ी पिएँ',
        plan_bdoc: 'कोशिश शुरू करने से पहले', plan_bdoc_std_h: 'कोशिश शुरू करने से पहले', plan_bdoc_std_p: 'अपनी स्त्री रोग विशेषज्ञ से एक जाँच करवाएँ: folic acid, गर्भ से पहले की जाँचें, और जो भी दवाएँ आप लेती हैं।', plan_bdoc_free: 'मुफ़्त: PHC या आयुष्मान आरोग्य मंदिर, या eSanjeevani', plan_bdoc_later: 'बुक करना याद दिलाएँ',
        plan_bdoc_gyn_h: 'अभी स्त्री रोग विशेषज्ञ को दिखाएँ', plan_bdoc_gyn_p: 'आपने जो बताया, उसकी वजह से डॉक्टर अभी जाँच की सलाह देते हैं। 12 महीने इंतज़ार करने की ज़रूरत नहीं।', plan_bdoc_pmos: 'PMOS में हो सकता है हर महीने अंडा न निकले। स्त्री रोग विशेषज्ञ इसकी जाँच कर सकती हैं, और इलाज मदद करता है।',
        plan_bdoc_meds_h: 'कोशिश शुरू करने से पहले अपनी डॉक्टर को दिखाएँ', plan_bdoc_qura: 'आपका प्लान आपकी डॉक्टर की देखभाल के साथ चलता है। Qura की डॉक्टर मुफ़्त कॉल पर खाने, नींद और आदतों में मदद कर सकती हैं; गर्भ ठहरने से जुड़ी जाँच स्त्री रोग विशेषज्ञ करती हैं।',
        plan_bdoc_space: 'आपके पिछले बच्चे का जन्म {n} महीने पहले हुआ। डॉक्टर सलाह देते हैं कि जन्म के बाद अगले गर्भ से पहले कम से कम 2 साल रुकें, ताकि शरीर ठीक हो सके। ऑपरेशन (सिज़ेरियन) हुआ था, तो डॉक्टर से पूछें कि कितना रुकना है।',
        plan_les_h: 'इस हफ़्ते का पाठ · 2 मिनट', plan_les_read: 'पढ़ें', plan_rh_wk_b: '2 मिनट का एक पाठ और पीछे एक नज़र', plan_rh_wk_m2: 'एक छोटा अध्याय और पीछे एक नज़र',
        plan_bph_h: 'आपके 12 हफ़्ते', plan_bph_1w: 'हफ़्ता 1–2', plan_bph_1: 'पहले ज़रूरी काम: आपकी गोली, Hb की जाँच, और उनका हिस्सा', plan_bph_2w: 'हफ़्ता 3–6', plan_bph_2: 'खाना, गर्भ से पहले की जाँचें, फ़र्टाइल दिन, और कितना समय लगता है', plan_bph_3w: 'हफ़्ता 7–12', plan_bph_3: 'आराम से और लगातार: स्ट्रेंथ, इंतज़ार का हफ़्ता, नींद और परिवार', plan_bph_4w: 'उसके बाद', plan_bph_4: 'हर महीने एक पाठ और एक तैयारी जाँच',
        plan_bmonth: 'डॉक्टर वाला महीना: {m}', plan_bmonth_p12: 'कोशिश शुरू करने के 12 महीने बाद। तब तक गर्भ न ठहरे, तो स्त्री रोग विशेषज्ञ को दिखाएँ। जब भी चिंता हो, उससे पहले।', plan_bmonth_p6: 'कोशिश शुरू करने के 6 महीने बाद। तब तक गर्भ न ठहरे, तो स्त्री रोग विशेषज्ञ को दिखाएँ। जब भी चिंता हो, उससे पहले।',
        plan_bper_h: 'नई शुरुआत', plan_bper: 'आज आपका पीरियड शुरू हुआ। यह महीना भी मायने रखता है: आपकी गोली और सैर जारी रहेंगी, कुछ बदलने की ज़रूरत नहीं।',
        plan_bpos_h: 'आपका टेस्ट पॉज़िटिव है', plan_bpos_p: '‘मेरी गर्भावस्था’ पर चलें? folic acid 12 हफ़्ते तक जारी रहेगी, और आपका Hb नतीजा साथ आएगा। कुछ दिनों में अपनी स्त्री रोग विशेषज्ञ को दिखाएँ।', plan_bpos_yes: 'हाँ, आगे ले चलें',
        plan_bloss: 'methotrexate या मोलर गर्भ के बाद, तभी फिर शुरू करें जब डॉक्टर कहें कि अब कोशिश कर सकती हैं।',
        plan_bres_h: 'आपके 12 हफ़्ते', plan_bres: '{n} दिन गोली, चेकलिस्ट में {t} में से {k}, और हफ़्ते में लगभग {m} मिनट चलना-फिरना।', plan_bres_p: '{n} दिन गोली, और हफ़्ते में लगभग {m} मिनट चलना-फिरना।', plan_bend_p: 'अपना ख़्याल रखते हुए 12 हफ़्ते। आपके क़दम जारी रहेंगे, और आपकी गोली भी।',
        plan_blut: 'पीरियड से पहले के 2 हफ़्तों में Sakhi भुजंगासन और वक्रासन की जगह हल्के आसन रखती है, क्योंकि हो सकता है गर्भ ठहर चुका हो।', plan_bmove: 'ज़्यादातर दिन चलना-फिरना काफ़ी है। कड़ी कसरत की ज़रूरत नहीं।',
        plan_intro: 'बारह हफ़्तों की छोटी-छोटी रोज़ की आदतें, जो PMOS में मदद करती हैं: क्या ज़्यादा और क्या कम खाएँ, घर पर योग और आसान व्यायाम, और आपकी अपनी प्रगति।',
        plan_i_eat: 'खाना', plan_i_eat_s: 'आपके इलाक़े का खाना, क्या ज़्यादा और क्या कम', plan_i_move: 'व्यायाम', plan_i_move_s: 'योग, सैर और ताक़त के व्यायाम, चलती तस्वीरों के साथ',
        plan_i_see: 'अपनी प्रगति देखें', plan_i_see_s: 'आपके पीरियड, दर्द और मिनट, शुरुआत से तुलना करके', plan_i_time: 'शुरू में रोज़ लगभग 10 मिनट। घर पर, बिना किसी सामान के।',
        plan_start: 'मेरा प्लान शुरू करें',
        plan_paused_preg: 'गर्भावस्था में आपका प्लान रुका हुआ है। गर्भ में खाना और व्यायाम अलग होते हैं: नीचे चुनें कि आपको किसमें मदद चाहिए, और व्यायाम से पहले डॉक्टर से पूछें।',
        plan_paused_post: 'यह प्लान 6 हफ़्ते की जाँच के बाद शुरू करें। तब तक छोटी सैर और पेल्विक फ़्लोर व्यायाम सबसे अच्छे हैं।', plan_paused_loss: 'अभी आपका प्लान रुका है। जितना समय चाहिए, लें; ये पन्ने मदद कर सकते हैं।', plan_paused_loss_d: 'अभी आपका प्लान रुका है।', plan_pick_ready: 'जब मन हो, एक लक्ष्य चुनें', plan_doc_d: 'डॉक्टर से एक जाँच आपके प्लान का हिस्सा है। यह सरकारी स्वास्थ्य केंद्र पर मुफ़्त है।', plan_doc_d_doc: 'डॉक्टर से एक जाँच आपके प्लान का हिस्सा है। यह सरकारी स्वास्थ्य केंद्र पर मुफ़्त भी है।', plan_set_goal_s2: 'नया प्लान शुरू होगा। आपने जो दर्ज किया, वह रहेगा।', plan_go_preg: 'जाँचें और टेस्ट', plan_go_post: 'पेल्विक फ़्लोर व्यायाम', plan_go_logs: 'मेरे गर्भावस्था लॉग',
        plan_s_h: 'प्लान को अपना बनाएँ', plan_s_goal: 'आपके लिए सबसे ज़रूरी क्या है?',
        plan_g_cycles: 'पीरियड समय पर आएँ', plan_g_energy: 'ज़्यादा ताक़त और फुर्ती', plan_g_skin: 'साफ़ त्वचा, कम बाल', plan_g_weight: 'सेहतमंद वज़न', plan_g_pain: 'पीरियड में कम दर्द',
        plan_s_level: 'अभी आप कितना व्यायाम करती हैं?', plan_lv_0: 'लगभग नहीं', plan_lv_1: 'कुछ दिन', plan_lv_2: 'ज़्यादातर दिन',
        plan_s_lim: 'घुटनों या कमर में दर्द रहता है?', plan_lim_none: 'नहीं', plan_lim_knees: 'घुटने', plan_lim_back: 'कमर', plan_lim_both: 'दोनों',
        plan_s_food: 'आप क्या खाती हैं?', plan_f_veg: 'शाकाहारी', plan_f_egg: 'अंडा भी', plan_f_nonveg: 'मछली या मांस भी',
        plan_s_reg: 'आपके इलाक़े का खाना', plan_s_reg_pin: 'आपके पिन कोड से: {r}', plan_s_reg_pick: 'अपना इलाक़ा चुनें',
        plan_s_restart: 'इससे आपके 12 हफ़्ते फिर से शुरू होंगे। जो आपने दर्ज किया, वह रहेगा।', plan_s_go: 'मेरे 12 हफ़्ते शुरू करें', plan_s_need: 'हर सवाल का एक जवाब चुनें।',
        plan_wk: '12 में से हफ़्ता {n}', plan_wk_s: 'हफ़्ता {n}', plan_wk_keep: 'हल्के से जारी', plan_min_of: '{t} में से {a} मिनट', plan_min_week: 'इस हफ़्ते के सक्रिय मिनट', plan_str_n: 'ताक़त के दिन: {t} में से {a}',
        plan_rv_doc_hb: 'भारी पीरियड के साथ अक्सर थकान या चक्कर: Hb टेस्ट करवाएँ। यह सरकारी स्वास्थ्य केंद्र में मुफ़्त है।', plan_rv_doc_hb_doc: 'भारी पीरियड के साथ अक्सर थकान या चक्कर: डॉक्टर से Hb टेस्ट करवाएँ। यह सरकारी स्वास्थ्य केंद्र में मुफ़्त भी है।', plan_rv_doc_pdays: 'हर पीरियड में 4 या ज़्यादा दिन दर्द हो तो डॉक्टर की जाँच ज़रूरी है। इसकी वजह का इलाज हो सकता है।',
        plan_rv_doc_pms: 'अगर ज़्यादातर चक्रों में पीरियड से पहले का हफ़्ता आपका दिन रोक देता है, तो डॉक्टर मदद कर सकती हैं। 2 चक्र तक रोज़ लिखें कि कैसा लगा, और वह डायरी साथ ले जाएँ।',
        plan_doc_ttc: 'आप {n} महीने से कोशिश कर रही हैं। डॉक्टर अब आप दोनों की जाँच की सलाह देते हैं: स्त्री रोग विशेषज्ञ को दिखाएँ।', plan_due_h: 'एक बार डॉक्टर की जाँच का समय', plan_due_go: 'डॉक्टर क्या सलाह देते हैं', plan_doc_ttc_now: 'आपने Sakhi को जो बताया, उससे इंतज़ार की ज़रूरत नहीं: अभी स्त्री रोग विशेषज्ञ को दिखाएँ।',
        plan_said_h: 'डॉक्टर ने क्या कहा?', plan_said_p: 'सिर्फ़ अगर आप बताना चाहें। यह इसी फ़ोन पर रहेगा।', plan_said_pmos: 'PMOS (PCOS) है', plan_said_hb: 'मेरा Hb कम था', plan_said_other: 'कुछ और', plan_said_skip: 'नहीं बताना चाहती',
        plan_said_pmos_r: 'डॉक्टर ने PMOS बताया।', plan_said_hb_r: 'डॉक्टर ने बताया कि Hb कम था।', plan_doc_told: 'आपने Sakhi को बताया कि {d} को डॉक्टर की जाँच हो गई।', plan_doc_told0: 'आपने Sakhi को बताया कि डॉक्टर की जाँच हो गई।', plan_sum_doc_no: 'शुरुआत की डॉक्टर जाँच: अभी नहीं हुई', plan_sum_now: 'शुरुआत में: {x}',
        plan_m_days: 'इस महीने आपने {a} दिन प्लान माना (पिछले महीने: {b})।', plan_m_days1: 'इस महीने आपने {a} दिन प्लान माना।', plan_m_doc: 'आपकी डॉक्टर जाँच अभी बाक़ी है।',
        plan_m4_h: 'महीना 4: आपके नतीजे', plan_m4_days: 'आपने {n} दिन प्लान माना है।', plan_m4_b: 'मेरे नतीजे देखें', plan_year_h: 'आपका साल पूरा हुआ',
        plan_end_doc_h: 'यह पेज डॉक्टर को दिखाएँ', plan_end_doc_p: 'आपका पहले और अब यहाँ है। डॉक्टर बता सकती हैं कि आपके लिए इसका क्या मतलब है।', plan_end_show: 'डॉक्टर को दिखाएँ', plan_details: 'विवरण: मिनट, खाना और ताक़त',
        plan_ask_q: 'मेरा प्लान ({t}): सवाल', plan_ask_r: 'मेरा प्लान ({t}): नतीजे', plan_rev_best: 'आपका सबसे अच्छा क़दम: {x}, {n} दिन।',
        plan_plate_prot_nn: 'एक चौथाई: दाल, चना, अंडा या मछली', plan_pl_bowl_n: 'दाल', plan_body_tile_s: 'आपका वज़न, कमर और BMI, इसी फ़ोन पर', plan_in_from_open: 'आपका पिछला पीरियड {n} दिन पहले शुरू हुआ था।',
        plan_rest_b: 'आज आराम का दिन', plan_rest_left: 'इस हफ़्ते {n} बचे', plan_rest_saved: 'अच्छे से आराम करें। आपका प्लान कल से फिर चलेगा।', plan_rest_pill: 'आराम का दिन', plan_th_rest: 'आज आराम का दिन है। कल मिलते हैं।',
        plan_rest_q: 'आज आराम का दिन रखें?', plan_rest_yes: 'हाँ, आज आराम', plan_th_wb: 'फिर से स्वागत है। कुछ पूरा नहीं करना है: बस आज से।',
        plan_pause: 'एक हफ़्ते के लिए रोकें', plan_pause_s: 'आपके क़दम और रिमाइंडर 7 दिन रुकेंगे, फिर चलेंगे', plan_paused_til: '{d} तक रुका है', plan_unpause: 'अभी फिर शुरू करें',
        plan_sl_pause_h: 'एक हफ़्ते की छुट्टी लें?', plan_sl_pause_p: 'आप अपना प्लान एक हफ़्ते के लिए रोक सकती हैं। उसके बाद वह वहीं से चलेगा जहाँ आप हैं।', plan_stop_or: 'या इसकी जगह एक हफ़्ते के लिए रोकें',
        plan_past_h: 'आपका पिछला प्लान', plan_past_p: '{t} · {a} से {b} · {n} दिन माना', plan_past_p1: '{t} · {a} से {b} · 1 दिन माना', plan_sum_past: 'इससे पहले: {t}, {a} से {b}, {n} दिन माना', plan_sum_past1: 'इससे पहले: {t}, {a} से {b}, 1 दिन माना',
        plan_chg_h: 'आपका प्लान बदल गया है', plan_chg_preg: 'अब आप गर्भवती हैं, इसलिए {t} रुका है। आपने इसे {n} दिन माना। अभी के क़दम आपके गर्भावस्था प्लान में हैं।', plan_chg_birth: 'आपका बच्चा आ गया है, इसलिए गर्भावस्था का प्लान पूरा हुआ। जन्म के बाद का प्लान रोज़ की रिकवरी जाँच से शुरू होता है।',
        plan_chg_d: 'आपका प्लान बदल गया है। आगे क्या है, यह देखने के लिए मेरा प्लान खोलें।', plan_chg_go_preg: 'मेरा गर्भावस्था प्लान देखें', plan_chg_go_post: 'जन्म के बाद का मेरा प्लान देखें', plan_chg_go_d: 'मेरा प्लान खोलें',
        plan_hero_days: 'इस हफ़्ते 7 में से {n} दिन', plan_hero_days_s: 'जिन दिनों आपने प्लान माना। आराम के दिन भी गिने जाते हैं।', plan_res_tile: 'अब तक {n} दिन', plan_rev_hold: 'अगले हफ़्ते: वही रफ़्तार। 3 या ज़्यादा दिनों वाले हफ़्ते के बाद आपके क़दम बढ़ेंगे।',
        plan_keep2: 'मेरी आदतें जारी रखें', plan_other: 'किसी और चीज़ पर काम करें', plan_other_s: 'एक लक्ष्य चुनें। वही लक्ष्य फिर से चुनें तो प्लान वहीं से शुरू होगा जहाँ आप अभी हैं।', plan_other_s2: 'अपने अगले प्लान के लिए एक लक्ष्य चुनें।', plan_ct_help_s: 'ख़तरे के संकेत, और किसे फ़ोन करें',
        plan_path_post_h: 'जन्म के बाद', plan_pp_1: 'हफ़्ता 1 से 6', plan_pp_1_p: 'आराम, रोज़ की रिकवरी जाँच, और 6 हफ़्ते की जाँच', plan_pp_2: 'हफ़्ता 7 से 12', plan_pp_2_p: 'थोड़ी सैर और आपका पेल्विक फ़्लोर', plan_pp_3: 'महीना 4 से 12', plan_pp_3_p: 'अपनी रफ़्तार से',
        plan_today: 'आज', plan_walk: '{n} मिनट तेज़ चलें या व्यायाम करें', plan_walk_s: 'तेज़ चाल: बात कर सकें, पर गा न सकें', plan_add: 'मिनट जोड़ें', plan_today_n: 'आज: {n} मिनट',
        plan_yoga: 'आज का योग', plan_strength_day: 'ताक़त का दिन', plan_plate_today: 'आज आपकी थाली', plan_habit_new: 'इस हफ़्ते नई',
        plan_tiles_plate: 'मेरी थाली', plan_tiles_moves: 'योग, व्यायाम और सुकून', plan_tiles_body: 'मेरा शरीर', plan_tiles_prog: 'मेरी प्रगति',
        plan_remind: 'मुझे रोज़ याद दिलाएँ', plan_remind_at: 'समय', plan_stop: 'मेरा प्लान रोकें', plan_stop_q: 'प्लान रोकें? जो आपने दर्ज किया, वह आपके फ़ोन पर रहेगा।', plan_stop_yes: 'हाँ, रोकें', plan_cancel: 'रहने दें',
        plan_foot: 'राष्ट्रीय दिशानिर्देशों से रोज़ की आदतें, हर महिला के लिए एक जैसी। यहाँ कोई सप्लीमेंट, जड़ी-बूटी या दवा नहीं: वह आपकी डॉक्टर तय करती हैं।',
        plan_foot_ttc: 'राष्ट्रीय दिशानिर्देशों से रोज़ की आदतें, और गर्भ से पहले की folic acid की गोली, जिसकी वे सलाह देते हैं। आपके जवाबों से आपके प्लान का रूप चुना जाता है। यहाँ और कोई सप्लीमेंट, जड़ी-बूटी या दवा नहीं: वह आपकी डॉक्टर तय करती हैं।',
        plan_foot_preg: 'राष्ट्रीय दिशानिर्देशों से रोज़ की आदतें, और गर्भ में आपकी डॉक्टर की लिखी आयरन की गोलियाँ। यहाँ और कोई सप्लीमेंट, जड़ी-बूटी या दवा नहीं: वह आपकी डॉक्टर तय करती हैं।',
        plan_foot_d: 'राष्ट्रीय दिशानिर्देशों से रोज़ की आदतें। कोई और गोली, जड़ी-बूटी या दवा: वह आपकी डॉक्टर तय करती हैं।',
        plan_cons_tab: 'रोज़ आपकी गोली:', plan_cons_hb: 'आपकी Hb जाँच:', plan_cons_long: 'आम तौर पर कितना समय लगता है:',
        plan_done: 'हो गया', plan_yes: 'हाँ', plan_well: 'बहुत अच्छा।', plan_today_d: 'आज का आपका प्लान', plan_today_dn: 'आपका कदम {n}', plan_today_move: 'आज {n} मिनट चलें या व्यायाम करें',
        plan_rev_h: 'हफ़्ता {n} पूरा हुआ', plan_rev_hp: 'प्लान का हफ़्ता {n} पूरा हुआ', plan_rev_min: 'आपने {a} मिनट व्यायाम किया। लक्ष्य {t} मिनट था।', plan_rev_e: 'इस हफ़्ते आपकी ऊर्जा कैसी रही?', plan_e_low: 'कम', plan_e_ok: 'ठीक', plan_e_good: 'अच्छी',
        plan_rev_b: 'किस बात ने रोका?', plan_b_time: 'समय नहीं', plan_b_tired: 'बहुत थकान', plan_b_pain: 'दर्द', plan_b_family: 'घर या काम', plan_b_out: 'मौसम या सुरक्षा', plan_b_none: 'कुछ नहीं',
        plan_tip_time: 'बाँट लें: 10-10 मिनट की दो सैर भी गिनी जाती हैं। फ़ोन पर बात करते हुए टहलें, या रात के खाने के बाद परिवार के साथ।',
        plan_tip_tired: 'थकान वाले दिन 5 मिनट की शांत साँस करें या 10 मिनट धीरे टहलें। थोड़ा हिलना-डुलना भी कुछ न करने से बेहतर है।',
        plan_tip_pain: 'दर्द वाले दिन “अभी थोड़ा आराम” में ऐंठन वाला तरीक़ा करें, या आराम करें। जो दर्द रोज़ का काम रोक दे, उसके लिए डॉक्टर को दिखाएँ।',
        plan_tip_family: 'किसी को साथ टहलने को कहें, या बच्चे खेलें तब घर पर व्यायाम करें। एक सेहतमंद थाली पूरे परिवार के लिए अच्छी है।',
        plan_tip_out: 'घर के अंदर करें: एक जगह क़दमताल, सीढ़ियाँ चढ़ना-उतरना, या घर पर योग।', plan_tip_none: 'बहुत अच्छा। ऐसे ही जारी रखें।',
        plan_rev_next: 'अगले हफ़्ते: {t} मिनट', plan_got: 'समझ गई',
        plan_fin_h: 'आपने 12 हफ़्ते पूरे किए', plan_fin_p: 'हर हफ़्ता मायने रखता है। जिन आदतों से सबसे ज़्यादा मदद मिली, उन्हें जारी रखें।', plan_keep: 'जारी रखें', plan_again: 'फिर से शुरू करें',
        plan_plate_h: 'मेरी थाली', plan_plate_p: 'कोई खाना मना नहीं है। हरे वाले ज़्यादा खाएँ, पीले वाले कम।',
        plan_pl_veg: 'सब्ज़ी', plan_pl_grain: 'रोटी, चावल', plan_pl_prot: 'दाल, प्रोटीन', plan_pl_bowl: 'दही',
        plan_plate_half: 'आधी: सब्ज़ी और सलाद', plan_plate_grain: 'एक चौथाई: रोटी, चावल या मोटा अनाज', plan_plate_prot: 'एक चौथाई: दाल, चना, पनीर, अंडा या मछली', plan_plate_bowl: 'साथ में: दही या छाछ',
        plan_more: 'ज़्यादा खाएँ', plan_less: 'कम खाएँ', plan_avoid: 'न खाएँ', plan_local: '{r} से', plan_all: 'पूरे भारत में', plan_change: 'बदलें',
        plan_habits_h: 'आपकी खाने की आदतें', plan_fast: 'व्रत रखती हैं?', plan_plate_note: 'डॉक्टर की सलाह के बिना वज़न घटाने की गोलियाँ, पाउडर या सप्लीमेंट न लें।',
        plan_plate_foot: 'भारतीयों के लिए आहार दिशानिर्देश (ICMR-NIN, 2024) पर आधारित। परिवार जो खाता है वही खाएँ, बस इन बदलावों के साथ।',
        plan_g_grain: 'अनाज और मोटे अनाज', plan_g_protein: 'दाल और प्रोटीन', plan_g_veg: 'सब्ज़ियाँ और साग', plan_g_fruit: 'फल', plan_g_drink: 'पेय', plan_g_snack: 'नाश्ता और बाक़ी',
        plan_body_h: 'मेरा शरीर', plan_body_p: 'अपनी मर्ज़ी से। ये आँकड़े आपके फ़ोन पर रहते हैं, और आप इन्हें कभी भी मिटा सकती हैं।',
        plan_body_preg: 'गर्भावस्था में आपका वज़न डॉक्टर देखती हैं। इसे अपने गर्भावस्था लॉग में दर्ज करें।',
        plan_height: 'लंबाई', plan_ft: 'फ़ुट', plan_in: 'इंच', plan_cm: 'सेमी', plan_weight: 'वज़न (किलो)', plan_waist: 'कमर (सेमी), अगर चाहें', plan_waist_l: 'कमर',
        plan_waist_how: 'कमर कैसे नापें', plan_waist_how_p: 'सीधी खड़ी हों और साँस छोड़ें। सबसे नीचे की पसली और कूल्हे की हड्डी के ऊपरी सिरे के बीच, आम तौर पर नाभि के पास, कमर पर फ़ीता लपेटें। कसा हुआ, पर ज़्यादा टाइट नहीं।',
        plan_body_save: 'सेव करें', plan_body_saved: 'आपके फ़ोन पर सेव हो गया।', plan_body_bad: 'आँकड़े जाँचें: लंबाई 120 से 210 सेमी, वज़न 25 से 250 किलो, कमर 40 से 200 सेमी।',
        plan_bmi: 'BMI', plan_bmi_range: 'भारतीय महिलाओं के लिए सही सीमा: 18.5 से 22.9',
        plan_bmi_low: 'आपका BMI भारतीय महिलाओं की सही सीमा से कम है। समय पर खाना खाएँ, जिसमें दाल, दूध, मेवे और अनाज भरपूर हों। अगर बिना कोशिश के वज़न घट रहा है, तो डॉक्टर को दिखाएँ।',
        plan_bmi_ok: 'आपका BMI भारतीय महिलाओं की सही सीमा में है। प्लान आपका वज़न स्थिर रखता है और ताक़त बढ़ाता है।',
        plan_bmi_hi: 'आपका BMI भारतीय महिलाओं की सही सीमा से ज़्यादा है। छोटे, लगातार बदलाव मदद करते हैं, और अच्छी आदतें वज़न बदलने से पहले ही शरीर की मदद करती हैं।',
        plan_waist_hi: 'आपकी कमर 80 सेमी या ज़्यादा है। भारतीय महिलाओं में बड़ी कमर के साथ शुगर और दिल की बीमारी का ख़तरा बढ़ता है। धीरे-धीरे इसे 80 सेमी से नीचे लाने का लक्ष्य रखें।',
        plan_waist_ok: 'आपकी कमर 80 सेमी से कम है, जो भारतीय महिलाओं की सीमा है।',
        plan_focus_h: 'आपका ध्यान किस पर', plan_focus_habits: 'पहले आदतें', plan_focus_weight: 'आदतें और वज़न',
        plan_focus_habits_s: 'वज़न का कोई लक्ष्य नहीं। आदतें अपने आप आपके पीरियड, त्वचा और ताक़त में मदद करती हैं।', plan_focus_weight_s: 'हर हफ़्ते थोड़ा ज़्यादा व्यायाम, 250 मिनट तक। आपका वज़न आपकी प्रगति में दिखेगा।',
        plan_focus_lowbmi: 'आपका BMI पहले से सही सीमा में है, इसलिए प्लान आपका वज़न स्थिर रखता है।',
        plan_hist: 'आपने क्या दर्ज किया', plan_body_del: 'मेरे शरीर के आँकड़े मिटाएँ', plan_body_del_q: 'लंबाई, वज़न और कमर के सभी आँकड़े मिटाएँ?', plan_body_del_yes: 'हाँ, मिटाएँ',
        plan_body_show: 'मेरे आँकड़े दिखाएँ', plan_body_hidden: 'छिपे हैं, क्योंकि यह फ़ोन और लोग भी इस्तेमाल करते हैं।',
        plan_body_foot: 'BMI एक मोटा अंदाज़ा है: बनावट, मांसपेशियाँ और उम्र भी मायने रखती हैं। भारतीय महिलाओं के लिए सीमाएँ 2009 की राष्ट्रीय सहमति से हैं: BMI 23 और कमर 80 सेमी।',
        plan_moves_h: 'योग, व्यायाम और सुकून', plan_moves_p: 'जितना हो सके, करें। हर मिनट आपके हफ़्ते में जुड़ता है।',
        plan_m2_skill: 'आज का अभ्यास: {s}', plan_m2_skill_n: 'आज का अभ्यास', plan_m2_skill_s: '2 मिनट · इस हफ़्ते के अध्याय से', plan_m2_rule_s: 'इस हफ़्ते का नींद का नियम', plan_m2_les_h: 'इस हफ़्ते का अध्याय', plan_m2_month: 'इस महीने पढ़ें',
        plan_fb_m2h: 'रोज़ का अभ्यास गर्मी के झोंकों को झेलना आसान बनाता है, भले ही वे आते रहें।', plan_fb_m2q: 'अपनी सोच पहचानना, और मन हल्का करने वाला एक काम करना, दिन-ब-दिन मन को सँभालता है।', plan_fb_m2r: 'शरीर की घड़ी ठीक रहे, तो नींद आसानी से आती है।', plan_fb_m2s: 'रोज़ कुछ मिनट संतुलन का अभ्यास पैरों पर टिके रहने में मदद करता है।',
        plan_r_steady: 'पैरों पर संतुलन', plan_r_steady_s: 'दीवार के पास संतुलन, 3 मिनट',
        /* Version 39.52: प्रेग्नेंसी योग */
        plan_r_preg1: 'प्रेग्नेंसी योग', plan_r_preg2: 'प्रेग्नेंसी योग', plan_r_preg3: 'प्रेग्नेंसी योग',
        plan_r_preg1_s: 'पहले तीन महीने: हल्के खिंचाव और धीमी साँस', plan_r_preg2_s: 'बीच के तीन महीने: खिंचाव, ताक़त और करवट लेकर आराम', plan_r_preg3_s: 'आख़िरी तीन महीने: आसान हरकतें, लंबी साँस छोड़ना और करवट लेकर आराम',
        plan_pi_wy: '{x}, या हफ़्ते में 2 दिन {y}',
        plan_py_h: 'प्रेग्नेंसी योग', plan_py_go: 'ठंडे कमरे में, पास में पानी रखकर, आराम से करें, और जो हरकत ठीक न लगे उसे छोड़ दें। करते समय आप बात कर पाएँ, इतना ही ज़ोर लगाएँ।',
        plan_py_stop: 'चक्कर, सिरदर्द, शुरू करने से पहले ही साँस फूलना, या पिंडली में दर्द या सूजन। रुकें, आराम करें, और आज ही अपनी डॉक्टर को बताएँ।', plan_py_now: 'छाती में दर्द, बेहोशी, या पेट में बार-बार दर्द वाला कसाव।',
        plan_py_unwell: 'तबीयत ठीक नहीं?', plan_py_unwell_h: 'अभी रुकें और आराम करें', plan_py_uw_ok: 'अब मैं ठीक हूँ', plan_py_uw_stop: 'आज के लिए बस',
        plan_py_rest_h: 'अब आराम करें', plan_py_rest_p: 'जवाब दोबारा देखने तक टहलना और योग रुके रहेंगे; सखी कल पूछेगी। तबीयत और बिगड़े, तो इंतज़ार न करें: 112 पर कॉल करें।',
        plan_py_hard: 'अगली बार और धीरे करें, और जो हरकत मुश्किल लगे उसे छोड़ दें। कुछ ठीक न लगा हो, तो अपनी डॉक्टर को बताएँ।',
        plan_py_lock_plan: 'प्रेग्नेंसी का योग “मेरा प्रेग्नेंसी प्लान” के साथ आता है, दो सुरक्षा सवालों के बाद।', plan_py_lock_doc: 'जब आपकी डॉक्टर कहें कि व्यायाम आपके लिए ठीक है, तब योग खुलेगा। फिर “मेरे सुरक्षा जवाब” में अपने जवाब बदलें।', plan_py_lock_now: 'जवाब दोबारा देखने तक योग नहीं।',
        plan_py_lock_v1: 'प्रेग्नेंसी का योग नए “मेरा प्रेग्नेंसी प्लान” के साथ आता है। बदलने के लिए, {y} में “{x}” दबाएँ। आपका लिखा हुआ रहता है।',
        plan_fb_pyoga: 'प्रेग्नेंसी में हल्का योग दर्द-तकलीफ़ कम कर सकता है, और नींद व मन को शांत रखने में मदद करता है।',
        plan_in_mbone: 'क्या डॉक्टर ने कहा है कि आपकी हड्डियाँ कमज़ोर हैं, या हल्का-सा गिरने पर कोई हड्डी टूटी?', plan_in_mheart: 'चलते समय छाती में दर्द, बेहोशी, या साँस बहुत फूलना?',
        plan_m2_heart_w: 'और ज़्यादा करने से पहले अपनी डॉक्टर को दिखाएँ। तब तक आपकी सैर हल्की रहेगी, और घर पर ताक़त की जगह आसान शुरुआत होगी। अभी छाती में दर्द हो, या दर्द जबड़े या बाँह तक जाए: 112 पर फ़ोन करें।',
        plan_m2_bone_w: 'इस प्लान का हर व्यायाम हड्डियों के लिए सुरक्षित है, कोई उछल-कूद नहीं। अपनी डॉक्टर से हड्डियों की जाँच (bone scan) और गोलियों के बारे में पूछें।',
        plan_ms_eye: 'हफ़्ते में एक बार', plan_ms_q: 'इस हफ़्ते {x} ने आपको कितना परेशान किया?', plan_ms_hot: 'गर्मी के झोंकों और रात के पसीने', plan_ms_sleep: 'ख़राब नींद', plan_ms_mood: 'चिंता या उदासी', plan_ms_body: 'दर्द, अकड़न या थकान', plan_ms_lo: '0 · बिल्कुल नहीं', plan_ms_hi: '10 · बहुत ज़्यादा',
        plan_m2_e45_h: 'आपके पीरियड 45 से पहले बंद हुए', plan_m2_read: 'और पढ़ें',
        plan_m2_w4_h: 'गर्मी के झोंके अब भी परेशान करते हैं?', plan_m2_w4_h2: 'आपकी डॉक्टर भी मदद कर सकती हैं',
        plan_m2_w4_p: 'गर्मी के झोंकों का सबसे असरदार इलाज हॉर्मोन therapy है, जो MBBS स्त्री रोग विशेषज्ञ लिखते हैं। आपका प्लान इसके साथ भी चलता है, और अकेले भी।',
        plan_m2_w4_on: 'आप हॉर्मोन वाली दवा लेती हैं: डॉक्टर के बताए अनुसार लें, और साल में एक बार इसके लिए डॉक्टर को दिखाएँ।',
        plan_m2_hrt: 'अभी 112 पर फ़ोन करें अगर एक पिंडली सूजी हो और दर्द हो, अचानक साँस फूले, या शरीर का एक हिस्सा कमज़ोर लगे या बोलने में मुश्किल हो।',
        plan_m2_aches: 'दर्द और थकान: अपनी डॉक्टर से पूछें कि कौन-सी ख़ून की जाँचें ज़रूरी हैं, अक्सर Hb और थायरॉइड।',
        plan_m2_w12_h: '40 के बाद आपकी जाँचें', plan_m2_w12_p: '40 के बाद BP, शुगर और हड्डियों की जाँच ज़्यादा बार ज़रूरी है। देखें कौन-सी जाँचें, और कितनी बार।', plan_m2_w12_go: 'जाँचें देखें',
        plan_m2_v2_h: 'आपके प्लान का नया रूप', plan_m2_v2_p: 'गर्मी के झोंकों, नींद और ताक़त पर हर हफ़्ते एक छोटा अध्याय, और कुछ मिनट संतुलन, आज से नए 12 हफ़्तों में। आपने जो दर्ज किया, वह रहेगा।', plan_m2_v2_yes: 'आज़माएँ', plan_m2_v2_done: 'आपके नए 12 हफ़्ते आज से शुरू।',
        plan_m2_sum_bone: 'कमज़ोर हड्डियाँ', plan_m2_sum_heart: 'चलते समय छाती में दर्द या साँस बहुत फूलना', plan_m2_keep_s: 'हर दिन · {p} से', plan_stop_l_m: 'दर्द, चक्कर, छाती में दर्द, ऐसा साँस फूलना जो ठीक न हो, या ख़ून आना।',
        plan_m2_poi_h: 'प्लान से पहले: स्त्री रोग विशेषज्ञ को दिखाएँ', plan_m2_poi_ok: 'डॉक्टर ने मुझे देख लिया है', plan_m2_poi_stop: 'मेरी डॉक्टर ने कहा, पीरियड बंद हो गए हैं', plan_m2_poi_read: 'POI के बारे में पढ़ें',
        plan_m2_year: 'आपका साल', plan_m2_year_s: 'जो अभ्यास आपके काम आए, और हर महीने कुछ पढ़ने को, 12वें महीने तक', plan_m2_wks: 'हफ़्ते {a} से {b}',
        plan_m2_p_h: 'गर्मी के झोंकों के लिए छोटा कोर्स, हर हफ़्ते एक अध्याय', plan_m2_p_q: 'चिंता और उदासी के लिए छोटा कोर्स, हर हफ़्ते एक अध्याय', plan_m2_p_r: 'हर हफ़्ते नींद का एक नियम', plan_m2_p_s: 'ताक़त, संतुलन और हड्डियों के लिए खाना',
        plan_m2_str_all: '{r} पहले हफ़्ते से, हर हिस्से में, हफ़्ते में दो बार चलती है।',
        plan_m2_heart_h: 'अभी आपकी सैर हल्की रहेगी', plan_m2_heart_ok: 'डॉक्टर ने कहा है कि मैं ज़्यादा कर सकती हूँ', plan_m2_bone_h: 'आपकी हड्डियाँ',
        plan_m2_res_h: 'आपके अपने आँकड़े', plan_m2_res_ms: '{x} ने आपको कितना परेशान किया: पहले 2 हफ़्तों में 10 में से {a}, आख़िरी 2 हफ़्तों में 10 में से {b}।', plan_m2_res_n: 'जिन रातों अच्छी या ठीक-ठाक नींद आई: पहले 2 हफ़्तों में {an} में से {a}, आख़िरी 2 हफ़्तों में {bn} में से {b}।', plan_m2_res_str: 'ताक़त वाले दिन: {n}',
        plan_r_gentle: 'आसान शुरुआत', plan_r_cycle: 'पीरियड के लिए योग', plan_r_sun: 'सूर्य नमस्कार, धीरे', plan_r_strength: 'घर पर ताक़त', plan_r_calm: 'शांत साँस',
        plan_r_gentle_s: 'खिंचाव और संतुलन, घुटनों पर हल्का', plan_r_cycle_s: 'कूल्हे, पेट और पीठ', plan_r_sun_s: 'सूर्य नमस्कार, हर आसन में एक साँस', plan_r_strength_s: 'कुर्सी, दीवार और सीढ़ी, हफ़्ते में 2 दिन', plan_r_calm_s: 'अनुलोम-विलोम और भ्रामरी',
        plan_mins: 'लगभग {n} मिनट', plan_today_pill: 'आज', plan_walk_h: 'सैर', plan_walk_p: 'तेज़ चलना मिनट जोड़ने का सबसे आसान तरीक़ा है: इतना तेज़ कि बात कर सकें, पर गा न सकें।',
        plan_stop_h: 'रुकें और आराम करें, अगर हो', plan_stop_l: 'दर्द, चक्कर, छाती में दर्द, ऐसा साँस फूलना जो ठीक न हो, या ख़ून आना। पीरियड में जो आराम से हो वही करें, और जिससे दर्द हो उसे छोड़ दें।',
        plan_sun_care: 'कमर दर्द या हाई BP हो, या चक्कर आए, तो इसे न करें। उसकी जगह “आसान शुरुआत” करें।', plan_knee_note: 'घुटनों में दर्द: घुटने टेकने वाले व्यायाम की जगह आसान व्यायाम हैं।',
        plan_moves_foot: 'कॉमन योग प्रोटोकॉल (आयुष मंत्रालय) के आसन और घर के आसान व्यायाम, हमारे अपने शब्दों और तस्वीरों में।',
        plan_p_intro: 'हर व्यायाम में टाइमर और चलती तस्वीर है। अपनी रफ़्तार से करें, और कभी भी “आगे” दबाएँ।', plan_p_voice: 'क़दम बोलकर सुनाएँ', plan_p_voice_d: 'साझा फ़ोन पर बंद, जब तक आप चालू न करें',
        plan_p_start: 'शुरू करें', plan_p_pause: 'रोकें', plan_p_resume: 'जारी रखें', plan_p_next: 'आगे', plan_p_finish: 'पूरा करें', plan_p_both: 'दोनों तरफ़', plan_p_rounds: '{n} राउंड, हर आसन में एक धीमी साँस',
        plan_p_step: '{n} में से व्यायाम {i}', plan_p_round: '{n} में से राउंड {i}', plan_p_right: 'दायाँ हिस्सा', plan_p_left: 'बायाँ हिस्सा', plan_p_set: '{n} में से सेट {i}', plan_p_left_t: '{t} बाक़ी',
        plan_p_in: 'साँस लें', plan_p_out: 'साँस छोड़ें',
        plan_p_prev: 'पिछला', plan_p_rest: 'आराम', plan_p_more: '+20 सेकंड', plan_p_skiprest: 'आराम छोड़ें', plan_p_up: 'अगला', plan_p_done_t: '{x} पूरा',
        plan_p_rest_say: 'आराम। अगला: {n}।',
        plan_p_done_h: 'बहुत अच्छा', plan_p_done_m: 'आपके हफ़्ते में {n} मिनट जुड़ गए।', plan_p_done_m1: 'आपके हफ़्ते में 1 मिनट जुड़ गया।', plan_p_done_0: 'पूरा हुआ। हर व्यायाम मायने रखता है।', plan_p_done_b: 'हर व्यायाम मायने रखता है। अपने मिनट रखने के लिए अपनी डायरी शुरू करें।',
        plan_p_feel: 'कैसा लगा?', plan_feel_easy: 'आसान', plan_feel_ok: 'ठीक', plan_feel_hard: 'मुश्किल',
        plan_feel_hard_tip: 'एक हफ़्ता “आसान शुरुआत” करें, और धीरे चलें। जिस व्यायाम से दर्द हो, उसे छोड़ दें।', plan_feel_thanks: 'शुक्रिया। इसी रफ़्तार से जारी रखें।',
        plan_p_again: 'फिर से करें', plan_p_back: 'मेरे प्लान पर वापस',
        plan_prog_h: 'मेरी प्रगति', plan_prog_p: 'आपने जो दर्ज किया उससे, शुरू करने से पहले की तुलना में।', plan_prog_p0: 'आपने जो दर्ज किया उससे।',
        /* Version 39.36: the reveal's rows for My pregnancy (interface words) */
        plan_rv_pf: 'चौथे दिन से: पेल्विक फ़्लोर, रोज़ 1 सेट', plan_rv_pf13: '13वें हफ़्ते से: पेल्विक फ़्लोर, रोज़ 1 सेट', plan_rv_ps14: '14 और 28 हफ़्ते पर: आपके 2 सुरक्षा वाले जवाबों की एक छोटी-सी जाँच', plan_rv_ps28: '28 हफ़्ते पर: आपके 2 सुरक्षा वाले जवाबों की एक छोटी-सी जाँच', plan_rv_mv28: '28 हफ़्ते से: “आज का दिन कैसा रहा?” में आपके बच्चे की हलचल', plan_rv_mv: 'हर शाम: “आज का दिन कैसा रहा?” में आपके बच्चे की हलचल',
       
        /* Version 39.34: My pregnancy, safety first (new lines wait for doctor review; plan_mv_side and plan_fb_pf are verified lines, word for word) */
        plan_ps_h: 'शुरू करने से पहले', plan_ps_p: 'दो सवाल आपके प्लान को आपके लिए सुरक्षित रखते हैं। आपके जवाब इसी फ़ोन पर रहते हैं।', plan_ps_now_q: 'क्या अभी आपको इनमें से कुछ है?', plan_ps_none: 'इनमें से कुछ नहीं', plan_ps_yes: 'हाँ, इनमें से एक', plan_ps_now_p: 'जवाब दोबारा देखने तक टहलना नहीं; आपके बाक़ी कदम रहेंगे। सखी कल फिर पूछेगी।', plan_ps_told_q: 'क्या आपकी डॉक्टर या ANM ने आपको इनमें से कुछ बताया है?', plan_ps_told_q_doc: 'क्या आपकी डॉक्टर ने आपको इनमें से कुछ बताया है?', plan_ps_rest: 'मेरी डॉक्टर या ANM ने आराम करने, या व्यायाम न करने को कहा है', plan_ps_rest_doc: 'मेरी डॉक्टर ने आराम करने, या व्यायाम न करने को कहा है', plan_ps_unsure: 'इनमें से किसी के बारे में पक्का नहीं पता', plan_ps_unsure_p: 'पक्का नहीं पता? इसे टिक करें। जब तक आपकी डॉक्टर न कहें, सखी आपका टहलना हल्का रखेगी।', plan_ps_t_green: 'आपका पूरा प्लान', plan_ps_t_green_p: 'इतनी रफ़्तार से टहलना कि आप बात कर सकें, जो हफ़्तों के साथ बढ़ेगा, और हफ़्ते में 2 दिन प्रेग्नेंसी के आपके महीनों का योग; 13वें हफ़्ते से पेल्विक फ़्लोर; और आपके लक्ष्य वाला कदम।', plan_ps_t_amber: 'हल्का टहलना, जब तक आपकी डॉक्टर न कहें', plan_ps_t_amber_p: '10 मिनट हल्का टहलना, 13वें हफ़्ते से पेल्विक फ़्लोर, और आपके लक्ष्य वाला कदम। अगली जाँच पर पूछें: “क्या मेरे लिए व्यायाम करना ठीक है?”', plan_ps_t_red: 'आराम के दिन', plan_ps_t_red_p: 'टहलने का कोई लक्ष्य नहीं। 13वें हफ़्ते से पेल्विक फ़्लोर और आपके लक्ष्य वाला कदम रहेंगे। आप कब ज़्यादा कर सकती हैं, यह आपकी डॉक्टर तय करेंगी।', plan_ps_t_now: 'जवाब दोबारा देखने तक टहलना नहीं', plan_ps_re_h: 'एक छोटी-सी जाँच', plan_ps_re_p: 'दो सवाल, ताकि आपके कदम अब भी आपके लिए ठीक रहें।', plan_ps_re_now: 'आपने सखी को एक ऐसे लक्षण के बारे में बताया जो इंतज़ार नहीं कर सकता। अगली बार टहलने से पहले अपने जवाब देख लें।', plan_ps_re_go: 'मेरे जवाब देखें', plan_ps_re_same: 'कुछ नहीं बदला', plan_ps_set: 'मेरे सुरक्षा वाले जवाब', plan_walk_easy: 'हल्की चाल: धीरे, इतनी कि आप बात कर सकें। चक्कर आए तो रुक जाएँ।', plan_mv_q: 'आज आपके बच्चे की हलचल', plan_mv_p: 'आपके बच्चे का अपना ढंग, कोई गिनती नहीं।', plan_mv_usual: 'हमेशा जैसी', plan_mv_less: 'आम दिनों से कम', plan_mv_unsure: 'पक्का नहीं पता', plan_mv_none: 'आज कोई हलचल महसूस नहीं हुई', plan_mv_side_h: 'आज रात', plan_mv_side: '28 हफ़्ते से करवट लेकर सोएँ, बाईं या दाईं। पेट के नीचे और घुटनों के बीच तकिया मदद करता है।', plan_pf_t: 'पेल्विक फ़्लोर · 1 सेट', plan_fb_pf: 'प्रेग्नेंसी में ये करने से आख़िरी महीनों में और डिलीवरी के बाद पेशाब लीक होने की संभावना कम होती है।',
        plan_prog_none: 'अपनी प्रगति यहाँ देखने के लिए अपना प्लान शुरू करें।',
        plan_prog_min: 'हर हफ़्ते के सक्रिय मिनट', plan_prog_target: 'लक्ष्य', plan_prog_str: 'इस हफ़्ते ताक़त के दिन', plan_prog_food: 'खाने की आदतें, पिछले 7 दिन',
        plan_prog_cyc: 'पीरियड के बीच के दिन', plan_prog_before: 'पहले', plan_prog_since: 'शुरू करने के बाद', plan_prog_cyc_wait: 'शुरू करने के बाद का पहला चक्र अभी पूरा नहीं हुआ।', plan_prog_cyc_none: 'इसे देखने के लिए अपने पीरियड दर्ज करें।',
        plan_prog_pain: 'पीरियड जिनमें दर्द की गोली लेनी पड़ी', plan_prog_pxl: 'पीरियड से पहले का हफ़्ता: दिन जब बहुत रुकावट आई', plan_prog_hway: 'पीरियड के दिन जब इससे रुकावट आई', plan_prog_hway_p: 'कपड़ों तक निकल गया, रात में बदलना पड़ा या दिन का काम नहीं हो पाया, आपके चेक-इन से।', plan_prog_dn: '{n} दिन', plan_prog_pain_n: '{n} में से {a}', plan_prog_signs: 'चेक-इन में PMOS के लक्षण', plan_prog_signs_n: '{n} पर टिक',
        plan_prog_energy: 'हर हफ़्ते आपकी ऊर्जा', plan_prog_body: 'वज़न और कमर', plan_prog_first: 'पहली बार', plan_prog_last: 'सबसे नया', plan_prog_expect: 'क्या उम्मीद रखें',
        plan_ex_1: 'हफ़्ता 1 से 4', plan_ex_1_p: 'कई महिलाओं में ताक़त बढ़ती है और नींद बेहतर होती है।', plan_ex_2: 'हफ़्ता 4 से 12', plan_ex_2_p: 'आदतें आसान होने लगती हैं, और कमर कम होनी शुरू हो सकती है।',
        plan_ex_3: '3 से 6 महीने', plan_ex_3_p: 'पीरियड ज़्यादा नियमित आने लग सकते हैं।', plan_ex_now: 'आप यहाँ हैं',
        plan_prog_foot: 'ये आपकी अपनी एंट्री हैं, कोई टेस्ट रिज़ल्ट या निदान नहीं। बदलाव में महीने लगते हैं, और हर महिला में अलग होता है।',
        plan_ask: 'सप्लीमेंट या दवा पर सलाह चाहिए?', plan_ask_b: 'सप्लीमेंट या दवा के बारे में Qura की डॉक्टर से पूछें', plan_ask_topic: 'मेरा PMOS प्लान: सप्लीमेंट या दवा',
        plan_ask_p: 'दवा या सप्लीमेंट के लिए, या 3 महीने बाद भी कुछ न बदले तो, डॉक्टर से बात करें। Qura की डॉक्टर आयुर्वेद (BAMS) डॉक्टर हैं; हॉर्मोन की दवाओं के लिए MBBS स्त्री रोग विशेषज्ञ चाहिए, और Qura आपको उनके पास भेजती है।',
        plan_sum_h: 'PMOS प्लान', plan_sum_wk: '12 में से हफ़्ता {n}, {d} से शुरू', plan_sum_min: 'सक्रिय मिनट: पिछले {k} हफ़्तों में हर हफ़्ते लगभग {a} (अभी लक्ष्य {t})', plan_sum_str: 'ताक़त: हफ़्ते में {a} दिन',
        plan_sum_food: 'खाने की आदतें: पिछले 7 में से {a} दिन', plan_sum_w: 'वज़न {a} → {b} किलो', plan_sum_w1: 'वज़न {a} किलो', plan_sum_c: 'कमर {a} → {b} सेमी', plan_sum_c1: 'कमर {a} सेमी', plan_sum_b: 'BMI {b}',
        plan_setup: 'अपना PMOS प्लान शुरू करें', plan_setup_s: 'खाने और व्यायाम के 12 हफ़्ते',
        plan_done_today: 'आज हो गया', plan_added: '{n} मिनट जुड़ गए', plan_undo: 'वापस लें',
        plan_notif_off: 'Sakhi के लिए फ़ोन की सूचनाएँ बंद हैं, इसलिए यह रिमाइंडर नहीं बजेगा।', plan_notif_on: 'चालू करें',
        plan_all_h: 'आपके लिए प्लान', plan_all_p: 'आपकी डायरी और आपके जवाबों से, आपके फ़ोन पर ही चुने गए।', plan_all_now: 'अभी आपके प्लान', plan_all_rec: 'आपके लिए सुझाव', plan_all_more: 'और प्लान',
        plan_all_none: 'अभी कोई सुझाव नहीं। अपने पीरियड और आप कैसा महसूस करती हैं, दर्ज करें, या Sakhi को बताएँ कि आपको किस बात में मदद चाहिए।',
        plan_all_diary: 'अपनी डायरी शुरू करें, और Sakhi आपकी entries से प्लान सुझाएगी।',
        plan_all_foot: 'सुझाव आपकी entries और आपके बताए जवाबों से आते हैं। ये कोई निदान नहीं हैं। दवा या सप्लीमेंट के लिए डॉक्टर से पूछें।',
        plan_help_h: 'आपको किस बात में मदद चाहिए', plan_help_none: 'अभी कुछ नहीं चुना।', plan_help_save: 'सेव करें', plan_help_saved: 'सेव हो गया। आपके सुझाव बदल गए हैं।', plan_cancel_b: 'रद्द करें',
        plan_off_eye: 'आपके लिए तैयार', plan_off_p: 'आपके जवाबों और पहली एंट्री से बना।', plan_off_p0: 'आपके जवाबों से बना।', plan_off_b: 'मेरा प्लान देखें', plan_off_later: 'बाद में',
        plan_rec_home: 'आपके लिए एक प्लान', plan_rec_not: 'अभी नहीं', plan_fit_ttc_h: 'अब बच्चे की कोशिश कर रही हैं?', plan_fit_ttc_p: '‘गर्भ के लिए तैयारी’ में इन महीनों के कदम हैं: folic acid की गोली, आपका खाना और व्यायाम।', plan_fit_ttc_go: '‘गर्भ के लिए तैयारी’ देखें', plan_fit_cyc_h: 'अभी बच्चे की कोशिश नहीं?', plan_fit_cyc_p: '‘गर्भ के लिए तैयारी’ प्रेगनेंसी से पहले के महीनों के लिए है। अपने पीरियड के लिए प्लान चुनें, या इसी को रखें।', plan_fit_pick: 'मेरा प्लान चुनें', plan_fit_keep: '{t} रखें', plan_fit_hd: 'अब कोई दूसरा प्लान ठीक रहेगा', plan_fit_pd: 'आपकी स्थिति बदली है। अभी के लिए प्लान चुनें, या अपना रखें।', plan_fit_keep_d: 'मेरा प्लान रखें', plan_fit_meno_h: '{t} अब ठीक रहेगा', plan_fit_meno_p: 'गर्मी के झोंकों, नींद या चिंता पर हर हफ़्ते एक छोटा अध्याय, और हड्डियों के लिए ताक़त व संतुलन। आपने जो दर्ज किया, वह रहेगा।', plan_fit_meno_go: '{t} देखें', plan_for_h_run: 'इसके लिए आपका प्लान', plan_for_h_offer: 'इसके लिए एक मुफ़्त प्लान',
        plan_m2_rv_p: 'हफ़्ते {a} से {b}: {p}', plan_m2_rv_ch: 'हर हफ़्ते: एक छोटा अध्याय, और अपने हफ़्ते पर एक नज़र', plan_m2_rv_str: 'हफ़्ते में दो बार, दूसरे दिन से: {r}',
        plan_m2_tom: 'कल: {x}।', plan_m2_tl_skill: 'आपका अभ्यास', plan_m2_tl_move: 'आपकी सैर', plan_m2_tl_ca: 'एक कैल्शियम वाला खाना', plan_m2_tl_food: 'आपकी थाली', plan_rec_all: 'सभी प्लान', plan_paused_pill: '6 हफ़्ते की जाँच के बाद',
        plan_d_12w: '12 हफ़्ते', plan_d_21d: '21 दिन', plan_d_3m: '3 मिनट', plan_d_2m: '2 मिनट', plan_d_daily: 'रोज़',
        plan_sc_t: 'क्या यह PMOS हो सकता है?', plan_sc_s: 'डॉक्टर जिन संकेतों के बारे में पूछते हैं, आपकी डायरी के साथ',
        plan_why_g: 'आपने इसमें मदद माँगी: {k}।', plan_why_pcos: 'आपने Sakhi को बताया कि आपको PMOS है।', plan_why_sc: 'आपका PMOS self-check PMOS से मेल खाता है।', plan_why_sc_risk: 'आपके PMOS self-check में 2 में से 1 संकेत मिला।',
        plan_why_gaps: 'आपके पिछले {m} में से {n} चक्र {b} दिन से लंबे थे।', plan_why_signs: 'आपने {n} महीने के चेक-इन में PMOS के लक्षण चुने।', plan_why_acne: 'आपने {n} दिन मुँहासे दर्ज किए।',
        plan_why_heavy: 'आपके पिछले {m} में से {n} पीरियड में ज़्यादा ब्लीडिंग हुई।', plan_why_ciheavy: 'आपने चेक-इन में ज़्यादा ब्लीडिंग चुनी।', plan_why_tired: 'इस महीने {n} दिन आपको थकान रही।',
        plan_why_pain: 'आपके पिछले {m} में से {n} पीरियड में दर्द की गोली लेनी पड़ी।', plan_why_cramps: 'आपने {n} दिन ऐंठन दर्ज की।',
        plan_why_low: 'इस महीने {n} दिन आप उदास, घबराई हुई या चिड़चिड़ी रहीं।', plan_why_cimood: 'आपने चेक-इन में उदास मन चुना।', plan_why_sleep: 'इस महीने {n} दिन आपकी नींद ख़राब रही।',
        plan_why_hot: 'इस महीने आपने {n} दिन गर्मी के झोंके दर्ज किए।', plan_why_cihot: 'आपने चेक-इन में गर्मी के झोंके बताए।', plan_why_nausea: 'आपने {n} दिन जी मिचलाना दर्ज किया।',
        plan_why_preg: 'आपकी गर्भावस्था के लिए।', plan_why_birth: 'आपके बच्चे का जन्म {n} दिन पहले हुआ।', plan_why_birth0: 'आपके बच्चे का जन्म आज हुआ।', plan_why_birth1: 'आपके बच्चे का जन्म कल हुआ।', plan_why_post: 'जन्म के बाद यह हर महिला की मदद करता है।', plan_why_feed: 'आप स्तनपान करा रही हैं।',
        plan_why_ttc: 'आप गर्भधारण की योजना बना रही हैं।', plan_why_midlife: 'यह मेनोपॉज़ के आसपास के सालों में मदद करता है।',
        plan_gv_irregular: 'ज़्यादा नियमित पीरियड', plan_gv_pmos: 'PMOS में बेहतर महसूस करना', plan_gv_pain: 'पीरियड में कम दर्द', plan_gv_heavy: 'ज़्यादा आयरन और आसान भारी पीरियड', plan_gv_pms: 'पीरियड से पहले शांत दिन', plan_gv_skin: 'साफ़ त्वचा और कम अनचाहे बाल',
        plan_gv_weight: 'सेहतमंद वज़न', plan_gv_ready: 'गर्भ के लिए तैयारी', plan_gv_food: 'गर्भावस्था में अच्छा खाना', plan_gv_nausea: 'जी मिचलाने में आसान दिन', plan_gv_iron: 'भरपूर आयरन', plan_gv_sleep: 'बेहतर नींद', plan_gv_mood: 'शांत दिन',
        plan_gv_recovery: 'अच्छी रिकवरी', plan_gv_pelvic: 'मज़बूत पेल्विक फ़्लोर', plan_gv_feed: 'आसान स्तनपान', plan_gv_hot: 'गर्मी के झोंकों में आसान दिन', plan_gv_bones: 'मज़बूत हड्डियाँ और मांसपेशियाँ', plan_gv_aches: 'कम दर्द और ज़्यादा ऊर्जा',
        plan_pk_cycle: 'मेरा पीरियड प्लान', plan_pk_weight: 'मेरा सेहतमंद शरीर प्लान', plan_pk_ready: 'गर्भ के लिए तैयारी', plan_pk_pain: 'आसान पीरियड', plan_pk_heavy: 'ख़ून की ताक़त', plan_pk_pms: 'शांत चक्र',
        plan_pk_preg: 'मेरा प्रेग्नेंसी प्लान', plan_pk_ttc: 'गर्भ के लिए तैयारी', plan_pk_post: 'मेरी रिकवरी का प्लान', plan_pk_meno: '40 के बाद मेरा प्लान', plan_gl_ready: 'गर्भ के लिए तैयारी',
        plan_in_goal_h: 'सबसे पहले किस पर काम करना चाहती हैं?', plan_in_goal_p: 'एक चुनें। Sakhi आपका प्लान इसी के हिसाब से बनाएगी, और आप इसे कभी भी बदल सकती हैं।',
        plan_in_cyc_h: 'आपके पीरियड के बारे में', plan_in_gap: 'आम तौर पर आपके पीरियड कितने दिन के अंतर पर आते हैं?', plan_gap_lt21: '21 दिन से कम', plan_gap_n: '21 से 35 दिन', plan_gap_g45: '36 से 45 दिन', plan_gap_g60: '46 से 60 दिन', plan_gap_gt60: '60 दिन से ज़्यादा', plan_gap_vary: 'बहुत बदलते रहते हैं',
        plan_in_skips: 'क्या कुछ महीने पीरियड आते ही नहीं?', plan_no: 'नहीं', plan_in_dx: 'क्या किसी डॉक्टर ने बताया है कि आपको PMOS (PCOS) है?', plan_dx_ns: 'पता नहीं',
        plan_in_signs: 'क्या इनमें से कुछ दिखता है?', plan_sg_hair: 'चेहरे, ठुड्डी या शरीर पर ज़्यादा बाल', plan_sg_acne: 'बार-बार होने वाले मुँहासे', plan_sg_thin: 'सिर के बाल पतले होना', plan_sg_neck: 'गर्दन पर गहरी, मखमली त्वचा', plan_sg_none: 'इनमें से कुछ नहीं',
        plan_in_pain_h: 'पीरियड के दर्द के बारे में', plan_in_pain: 'आम तौर पर दर्द कितना होता है?', plan_pn_mild: 'हल्का', plan_pn_pk: 'दर्द की गोली लेनी पड़ती है', plan_pn_stop: 'दिन का काम रुक जाता है', plan_in_pdays: 'कितने दिन?', plan_pd_1: '1 दिन', plan_pd_23: '2 से 3 दिन', plan_pd_4: '3 दिन से ज़्यादा',
        plan_in_heavy_h: 'आपकी ब्लीडिंग के बारे में', plan_in_pads: 'सबसे ज़्यादा ब्लीडिंग वाले दिन, कितनी देर में pad बदलती हैं?', plan_pa_4: '4 घंटे या उससे ज़्यादा में', plan_pa_23: '2 से 3 घंटे में', plan_pa_12: '1 से 2 घंटे में, या एक साथ दो pad',
        plan_in_clots: '₹10 के सिक्के जितने बड़े थक्के?', plan_in_tired: 'क्या अक्सर थकान, चक्कर या साँस फूलना होता है?',
        plan_in_pms_h: 'पीरियड से पहले', plan_in_pms: 'क्या-क्या महसूस होता है?', plan_pm_mood: 'मन उदास', plan_pm_irr: 'चिड़चिड़ापन', plan_pm_anx: 'घबराहट', plan_pm_bloat: 'पेट फूलना', plan_pm_breast: 'स्तन में दर्द', plan_pm_head: 'सिरदर्द', plan_pm_crave: 'खाने की तेज़ इच्छा',
        plan_in_pmsl: 'आपके दिन पर इसका कितना असर होता है?', plan_pl_little: 'थोड़ा', plan_pl_lot: 'बहुत',
        plan_in_day_h: 'आपका दिन', plan_in_day_p: 'ताकि आपके क़दम आपके दिन में फ़िट हों।', plan_in_bed: 'आम तौर पर कब सोती हैं?', plan_bd_22: 'रात 10 बजे से पहले', plan_bd_23: 'रात 10 से 11 बजे', plan_bd_24: 'रात 11 से 12 बजे', plan_bd_late: 'रात 12 बजे के बाद',
        plan_in_work: 'आपका दिन ज़्यादातर', plan_wk_day: 'दिन में काम या कॉलेज', plan_wk_night: 'रात की शिफ़्ट', plan_wk_home: 'घर पर',
        plan_in_rem: 'Sakhi आपको कब याद दिलाए?', plan_rm_08: 'सुबह 8 बजे', plan_rm_13: 'दोपहर 1 बजे', plan_rm_18: 'शाम 6 बजे', plan_rm_20: 'रात 8 बजे', plan_rm_21: 'रात 9 बजे',
        plan_in_when_h: '10 मिनट चलने या व्यायाम के लिए कब समय निकाल सकती हैं?', plan_in_when_p: 'Sakhi हर दिन इसी समय आपकी सैर रखेगी।', plan_w_morning: 'सुबह', plan_w_breakfast: 'नाश्ते के बाद', plan_w_lunch: 'दोपहर के खाने के बाद', plan_w_evening: 'शाम को', plan_w_dinner: 'रात के खाने के बाद',
        plan_in_body_h: 'आपका शरीर (अपनी मर्ज़ी से)', plan_in_body_p: 'आपके BMI और कमर के लिए, भारतीय महिलाओं की सीमाओं के साथ। यह आपके फ़ोन पर ही रहता है।', plan_in_skip: 'छोड़ें', plan_in_save: 'सेव करके आगे बढ़ें',
        plan_rv_h: '{name}, आपका प्लान तैयार है', plan_rv_h0: 'आपका प्लान तैयार है', plan_rv_goal: 'आपका लक्ष्य: {g}', plan_rv_now: 'अभी: {x}', plan_now_gap: '{g} के अंतर पर', plan_now_skip: 'कुछ महीने नहीं आते', plan_pi_pd: 'पीरियड के दिनों में: {x}', plan_pi_bf: 'पीरियड से पहले के 7 दिनों में: {x}', plan_pi_kd: 'पीरियड से ठीक पहले: {x}', plan_pi_phb: 'एक बार, पहले 3 हफ़्तों में: {x}', plan_per_rv_kit: 'पीरियड के दिनों में: पीरियड की आपकी किट, और ठीक पहले उसे तैयार रखें', plan_per_rv_w4: 'हफ़्ता 4: आपके पहले महीने पर एक नज़र, और डॉक्टर को कब दिखाएँ', plan_per_rv_rest: 'पीरियड के दिनों में: लेटकर आराम (योग निद्रा)', plan_per_rv_str: 'हफ़्ते {n} से: सैर के 2 दिनों में {r}', plan_per_rv_yoga: 'हफ़्ते {n} से, पीरियड से पहले के हफ़्ते में: {r}',   /* Version 39.55 */
        plan_now_clots: 'थक्के', plan_now_endo: 'endometriosis या adenomyosis (डॉक्टर ने बताया)', plan_now_vary: 'अंतर बहुत बदलता रहता है', plan_now_pdays: 'दर्द {x}', plan_now_pads: 'pad बदलना: {x}', plan_now_pmsl: 'दिन पर असर: {x}', plan_now_tired: 'अक्सर थकान या चक्कर', plan_rv_12: '12 हफ़्ते',
        plan_pi_walk: 'रोज़ {n} मिनट से बढ़ती सैर', plan_pi_food: 'हर दो हफ़्ते में खाने में एक बदलाव, शुरुआत: {h}', plan_pi_bed: 'सोने का तय समय: {t}', plan_pi_shift: 'शिफ़्ट के बाद 7 से 8 घंटे की नींद',
        plan_pi_cramps: 'पीरियड के दिनों में 3 मिनट का ऐंठन वाला तरीक़ा', plan_pi_iron: 'रोज़ आयरन वाले खाने का एक क़दम', plan_pi_calm: 'रोज़ शांत साँस', plan_pi_goal: 'रोज़: {x}', plan_pi_days: 'हफ़्ते में {n} दिन: {x}',
        plan_rv_exp: 'क्या उम्मीद रखें', plan_rv_diff: 'हर महिला में यह अलग होता है।', plan_rv_exp_g: 'हफ़्ता 1: छोटे क़दम। हफ़्ता 4: पहली बार देखेंगे कि कैसा चल रहा है। हफ़्ता 12: आपके नतीजे। हर महिला में यह अलग होता है।', plan_rv_exp_preg: 'बच्चे के जन्म तक रोज़ एक छोटा क़दम। आपकी जाँचें और ख़तरे के संकेत हमेशा सबसे पहले।',
        plan_rv_doc_h: 'पहले, एक जाँच', plan_rv_doc_cyc: 'जो पीरियड महीनों छूट जाते हैं या 45 दिन से ज़्यादा के अंतर पर आते हैं, उनके लिए एक बार डॉक्टर की जाँच ज़रूरी है: थायरॉइड, प्रोलैक्टिन और PMOS। अगर पीरियड देर से है और गर्भ हो सकता है, तो पहले प्रेग्नेंसी टेस्ट करें।',
        plan_rv_doc_heavy: 'इतनी ज़्यादा ब्लीडिंग में डॉक्टर की जाँच और Hb टेस्ट ज़रूरी है। दोनों सरकारी स्वास्थ्य केंद्र पर मुफ़्त हैं।', plan_rv_doc_heavy_doc: 'इतनी ज़्यादा ब्लीडिंग में डॉक्टर की जाँच और Hb टेस्ट ज़रूरी है। दोनों सरकारी स्वास्थ्य केंद्र पर मुफ़्त भी हैं।', plan_rv_doc_pain: 'जो दर्द दिन का काम रोक दे, उसकी डॉक्टर से जाँच ज़रूरी है।',
        plan_rv_free: 'मुफ़्त सरकारी डॉक्टर', plan_rv_qura: 'Qura की डॉक्टर से बात करें', plan_rv_later: 'बाद में', plan_rv_today: 'आज', plan_rv_go: 'आज से शुरू करें', plan_rv_edit: 'मेरे जवाब बदलें',
        plan_a_str_s: 'ताक़त का दिन: “घर पर ताक़त” भी गिना जाता है, लगभग {n} मिनट', plan_a_bed: '{t} तक बिस्तर पर', plan_a_bed_s: 'आधा घंटा पहले फ़ोन दूर रखें', plan_a_shift: 'शिफ़्ट के बाद 7 से 8 घंटे सोएँ', plan_a_shift_s: 'अँधेरा, शांत कमरा मदद करता है', plan_sleep_today: 'आज रात की नींद',
        plan_ci_b_n: '{d} कैसा रहा?', plan_night_d: 'अभी भी {d} का प्लान', plan_night_d_s: 'आपके प्लान का दिन सुबह 4 बजे ख़त्म होता है, इसलिए यह {d} में गिना जाएगा।', plan_ci_h: 'आज का दिन कैसा रहा?', plan_ci_b: 'आज का दिन कैसा रहा?', plan_ci_d: 'हो गया', plan_ci_p: 'थोड़ा', plan_ci_n: 'आज नहीं', plan_ci_need: 'हर एक का एक जवाब चुनें।', plan_ci_done: 'आज का दर्ज हो गया',
        plan_why: 'यह क्यों मदद करता है', plan_why_q: 'क्यों?', plan_ci_count: 'आज {n} में से {a} · इस हफ़्ते 7 में से {w} दिन', plan_ci_petal: 'आपके बगीचे के लिए एक पंखुड़ी', plan_ci_home: 'आज पर वापस', plan_ci_plan: 'मेरा प्लान देखें', plan_ci_none: 'कुछ दिन ऐसे ही होते हैं। कल बस एक से शुरू करें।',
        plan_th_done: 'आज {n} में से {a} हो गए',
        plan_fb_move: 'ज़्यादातर दिन चलने-फिरने से शरीर इंसुलिन का बेहतर इस्तेमाल करता है, और इससे पीरियड ज़्यादा नियमित आने में मदद मिलती है।',
        plan_fb_food: 'खाने के छोटे बदलाव मिलकर असर करते हैं: शुगर स्थिर रहने से समय के साथ हॉर्मोन और पीरियड, दोनों को मदद मिलती है।',
        plan_fb_sleep: 'सोने का तय समय शरीर की घड़ी को ठीक रखता है, और शरीर की घड़ी और पीरियड आपस में जुड़े हैं।',
        plan_fb_str: 'मज़बूत मांसपेशियाँ शुगर का अच्छा इस्तेमाल करती हैं, और इससे PMOS में मदद मिलती है।', plan_fb_movep: 'नियमित चलने-फिरने से कई महिलाओं में पीरियड का दर्द कम होता है।',
        plan_fb_cramps: 'हल्का खिंचाव और गर्माहट ऐंठने वाली मांसपेशियों को ढीला करते हैं।', plan_fb_iron: 'आयरन वाला खाना शरीर को वह ख़ून बनाने में मदद करता है, जो हर महीने निकल जाता है।',
        plan_fb_calm: 'धीमी साँस शरीर के तनाव को शांत करती है, और इससे पीरियड से पहले के दिन आसान हो सकते हैं।', plan_fb_pelvic: 'रोज़ कुछ मिनट से जन्म के बाद पेल्विक फ़्लोर ठीक होने में मदद मिलती है।',
        plan_fb_recov: 'रोज़ जाँचने से डॉक्टर वाली बात जल्दी पकड़ में आ जाती है।', plan_fb_hot: 'ठंडक और धीमी साँस से गर्मी का झोंका गुज़रते समय कुछ आराम मिल सकता है।',
        plan_fb_bones: 'हफ़्ते में दो दिन ताक़त के व्यायाम से 40 के बाद मांसपेशियाँ मज़बूत रहती हैं, और हड्डियों को भी मदद मिलती है।', plan_fb_move_g: 'ज़्यादातर दिन चलने-फिरने से ताक़त और मन दोनों अच्छे रहते हैं।', plan_fb_any: 'हर छोटा क़दम मायने रखता है।',
        plan_my_h: 'मेरा प्लान', plan_my_pick_h: 'आप किस पर काम करना चाहती हैं?', plan_my_pick_p: 'एक चुनें, कुछ सवालों के जवाब दें, और Sakhi आपका 12 हफ़्तों का प्लान बनाएगी।', plan_my_track: 'आप हिसाब रख रही हैं। जब चाहें, कोई लक्ष्य चुनें।',
        plan_path_h: 'आपके 12 हफ़्ते', plan_path_ahead: 'आगे के हफ़्ते', plan_path_now: 'यह हफ़्ता', plan_path_cyc: 'हफ़्ते में {m} मिनट', plan_path_new: 'नया: {h}', plan_path_r4: 'आपका 4 हफ़्ते का चेक-इन', plan_path_m4: 'पहले महीने पर नज़र', plan_path_r8: 'आपका 8 हफ़्ते का चेक-इन', plan_path_m8: 'दूसरे महीने पर नज़र', plan_path_r12: 'आपके नतीजे', plan_path_light: 'आपके रोज़ के क़दम',
        plan_today_h: 'आज के क़दम', plan_res_h: 'मेरी प्रगति', plan_suggested: 'सुझाया गया', plan_f_jain: 'जैन: प्याज़, लहसुन या ज़मीन के नीचे की सब्ज़ी नहीं', plan_plate_prot_v: 'एक चौथाई: दाल, चना या पनीर', plan_plate_prot_vn: 'एक चौथाई: दाल, चना या सोयाबीन', plan_plate_prot_e: 'एक चौथाई: दाल, चना, पनीर या अंडा', plan_plate_prot_en: 'एक चौथाई: दाल, चना या अंडा', plan_plate_bowl_n: 'साथ में: एक कटोरी दाल या सलाद', plan_moves_tile_s: 'योग और आसान व्यायाम, चलती तस्वीरों के साथ', plan_plate_tile_s: 'आधी थाली सब्ज़ी, और आपके इलाक़े का खाना', plan_in_milk: 'क्या आप दूध, दही या पनीर लेती हैं?', plan_in_from: 'आपकी डायरी से: आपके पिछले {n} अंतर {a} से {b} दिन के थे। सही न हो तो बदल दें।', plan_in_from_eq2: 'आपकी डायरी से: आपके पिछले दोनों अंतर {a} दिन के थे। सही न हो तो बदल दें।', plan_in_from_eq: 'आपकी डायरी से: आपके पिछले {n} अंतर, सभी {a} दिन के थे। सही न हो तो बदल दें।', plan_rv_days_h: 'आपके दिन और हफ़्ते', plan_preg_moves: 'प्रेग्नेंसी में व्यायाम तभी शुरू करें जब डॉक्टर कहें कि आपके लिए ठीक है।', plan_res_days: 'हर हफ़्ते, जितने दिन आपने प्लान माना', plan_res_first: 'इस हफ़्ते जैसे-जैसे आप प्लान मानेंगी, पहली पट्टी भरती जाएगी।', plan_th_h: 'आज आपकी थाली में क्या था?', plan_th_p: 'जो खाया उस पर टैप करें, थाली भरती जाएगी।', plan_th_add: 'अगली बार थाली में {x} भी रख सकती हैं।', plan_th_full: 'आज की थाली पूरी है।', plan_a_iron_rot: 'आज का आयरन वाला खाना: {x}', plan_a_iron_c: 'इसे नींबू, आँवला या अमरूद के साथ खाएँ।', plan_a_still: 'क्या अब भी: {h}?', plan_a_ca: 'आज का कैल्शियम वाला खाना: {x}', plan_a_ca_s: 'हड्डियों के लिए, रसोई से कैल्शियम', plan_a_pfood: 'इस हफ़्ते: {x}', plan_a_bfood: 'स्तनपान के दिनों का खाना', plan_a_fast: 'आज आपका व्रत है', plan_a_fast_s: 'सरगी या सेहरी ठीक से, जब हो सके पानी, और व्रत धीरे से खोलें', plan_a_fast_pb: 'बिना पानी के व्रत से पहले डॉक्टर से बात करें', plan_fast_q: 'आज व्रत है?', plan_fast_undo: 'आज व्रत नहीं', plan_fast_h: 'व्रत?', plan_fast_today: 'आज व्रत है', plan_fast_tom: 'कल व्रत है', plan_res_low: 'उदासी, घबराहट या चिड़चिड़ेपन के दिन', plan_res_low_b: 'शुरू करने से पहले के 30 दिन', plan_res_low_s: 'पिछले 30 दिन', plan_res_heavy: 'ज़्यादा ब्लीडिंग वाले पीरियड',
        plan_rev_days: 'आपने 7 में से {n} दिन प्लान माना।', plan_rev_keep: 'अगले हफ़्ते: ऐसे ही, एक-एक दिन।',
        plan_ct_h: 'आपकी देखभाल टीम', plan_ct_sum: 'डॉक्टर, आपकी रिपोर्ट, मदद', plan_ct_free_s: 'PHC या ज़िला अस्पताल में', plan_ct_qura: 'Qura की डॉक्टर', plan_ct_qura_s: 'पहली 20 मिनट की कॉल मुफ़्त', plan_ct_report: 'डॉक्टर के लिए मेरी रिपोर्ट',
        plan_set_h: 'प्लान की सेटिंग', plan_set_goal: 'जिस पर काम कर रही हूँ, उसे बदलें', plan_set_goal_s: 'नए 12 हफ़्ते शुरू होंगे। आपकी entries रहेंगी।', plan_other_h: 'और प्लान',
        plan_sl_go_h: 'आपका प्लान तैयार है', plan_sl_go_p: 'आपका पहला क़दम: {a}।', plan_sl_doc_h: 'क्या डॉक्टर से जाँच करवा ली?', plan_sl_doc_p: 'छूटे या देर से आने वाले पीरियड के लिए एक जाँच: थायरॉइड, प्रोलैक्टिन और PMOS। अगर पीरियड देर से है और गर्भ हो सकता है, तो पहले प्रेग्नेंसी टेस्ट करें।', plan_sl_doc_yes: 'हाँ, हो गई',
        plan_sl_lapse_h: 'चलिए, फिर से छोटे से शुरू करें?', plan_sl_lapse_p: 'पिछला पूरा करने की ज़रूरत नहीं। बस आज: {a}।', plan_sl_lapse_mon: 'नया हफ़्ता, नई शुरुआत।', plan_sl_lapse_b: 'आज के क़दम',
        plan_sl_m_h: '{n} महीना पूरा', plan_sl_m_p: 'देखें कि आपकी आदतें और पीरियड कैसे चल रहे हैं।', plan_sl_m_b: 'देखें कैसा चल रहा है',
        plan_when_tom: 'कल', plan_day: 'दिन {n}', plan_th_soon: 'आपका प्लान {d} से शुरू होगा', plan_th_first: 'आपका पहला क़दम: {a}', plan_th_ci_at: 'चेक-इन {t}',
        plan_th_y: 'कल आपने {a} क़दम पूरे किए।', plan_th_yp: 'कल आपने {a} क़दम पूरे किए, {p} थोड़े।', plan_th_y0: 'कल कोई क़दम नहीं हुआ। आज एक से शुरू करें।', plan_th_d3: '3 दिन हो गए: छोटे क़दम जुड़ते जाते हैं।',
        plan_sl_new_h: 'आपका नया प्लान तैयार है', plan_rv_repl: 'शुरू करने पर यह आपके अभी वाले प्लान की जगह लेगा। आपने जो दर्ज किया, वह रहेगा।', plan_sl_go_b: 'प्लान देखें और शुरू करें', plan_sl_keep: 'मेरा अभी वाला प्लान रखें',
        plan_sl_d1_h: 'आपके प्लान का पहला दिन', plan_sl_d1_p: 'आपका पहला क़दम: {a}। {t}, 1 मिनट का चेक-इन।', plan_sl_d1_p0: '{t}, 1 मिनट का चेक-इन।',
        plan_sl_call_h: 'अपने प्लान के बारे में कोई सवाल?', plan_sl_call_p: 'Qura की डॉक्टर आपके साथ इसे समझ सकती हैं। पहली 20 मिनट की कॉल मुफ़्त है।', plan_soon_now: 'इसके बजाय आज से शुरू करें',
        plan_rv_next: 'आगे', plan_rv_made: 'आपने Sakhi को जो बताया, उससे बना: {x}', plan_rv_len: '12 हफ़्ते · रोज़ लगभग {n} मिनट से शुरू', plan_rv_len_few: '12 हफ़्ते · रोज़ कुछ मिनट', plan_rv_len_preg: 'बच्चे के जन्म तक · रोज़ कुछ मिनट',
        plan_rv_steps_h: 'आपके {n} क़दम', plan_rv_step1_h: 'आपका रोज़ का क़दम', plan_rv_week: 'इस हफ़्ते: {m} मिनट, रोज़ लगभग {n}। हर हफ़्ते यह थोड़ा बढ़ता है।', plan_rv_also: '“मेरा प्लान” में यह भी: योग, आपकी थाली और आपकी प्रगति।',
        plan_rv_day_h: 'हर दिन कैसे चलेगा', plan_rv_d1: '“आज” पर आपके क़दम दिखेंगे। कोई क़दम पूरा हो तो “हो गया” दबाएँ।', plan_rv_d2: '{t} Sakhi पूछेगी “आज का दिन कैसा रहा?” इसमें 1 मिनट लगता है।', plan_rv_d3: 'Sakhi बताएगी कि हर क़दम आपके लिए क्या करता है।',
        plan_rv_miss: 'कोई दिन छूट गया? पिछला पूरा करने की ज़रूरत नहीं। बस फिर से शुरू करें।', plan_rv_aud: 'डॉ. मेघा को सुनें (30 सेकंड)',
        plan_rv_when_h: 'कब क्या होगा', plan_rv_w1: 'हर हफ़्ते: आपके हफ़्ते पर एक छोटी नज़र', plan_rv_w4: 'हफ़्ता 4: आपके पहले महीने पर एक नज़र', plan_rv_w12: 'हफ़्ता 12: आपके नतीजे, शुरुआत के मुक़ाबले',
        plan_rv_cyc: 'पीरियड में बदलाव आने में अक्सर 3 से 6 महीने लगते हैं। उन्हें दर्ज करती रहें: इसी से Sakhi बदलाव देख पाती है।',
        plan_rv_doc_h2: 'प्लान के साथ: एक बार डॉक्टर की जाँच', plan_rv_doc_when: 'आप अपने क़दम आज से शुरू कर सकती हैं। जाँच अगले 3 हफ़्तों में करवा लें; Sakhi आपसे इसके बारे में पूछेगी।', plan_rv_doc_soon: 'आप अपने क़दम आज से शुरू कर सकती हैं। कृपया जल्दी डॉक्टर को दिखाएँ।',
        plan_st_h: 'आप कब से शुरू करना चाहती हैं?', plan_st_day: 'आपका पहला दिन', plan_st_today: 'आज', plan_st_tom: 'कल', plan_st_mon: 'सोमवार, {d}', plan_st_at: 'Sakhi इस समय पूछेगी', plan_st_at_p: 'हर शाम, 1 मिनट: “आज का दिन कैसा रहा?”',
        plan_st_rem: 'रिमाइंडर चालू हैं: {l}। लॉक स्क्रीन पर कुछ नहीं दिखता। इन्हें कभी भी मैं > रिमाइंडर में बदलें।', plan_st_off: 'आपके फ़ोन रिमाइंडर बंद हैं, इसलिए कुछ नहीं बजेगा। आप इन्हें मैं > रिमाइंडर में चालू कर सकती हैं।', plan_st_block: 'आपका फ़ोन Sakhi को रिमाइंडर बजाने नहीं दे रहा। आप इन्हें मैं > रिमाइंडर में चालू कर सकती हैं।', plan_st_r_ci: '{t} का चेक-इन', plan_st_r_walk: '{t} की सैर', plan_st_r_move: '{t} चलने-फिरने का समय', plan_st_r_wind: '{t} सुकून के पल', plan_st_r_wind_n: '{n}वें दिन से {t} सुकून के पल', plan_rv_from: '{n}वें दिन से: {x}', plan_rv_bed0: 'सोने का एक तय समय',
        plan_p2_nb_h: 'इस हफ़्ते: बच्चे में ऐसे संकेत जिनमें देर न करें', plan_p2_bp_h: 'इस हफ़्ते अपना BP जँचवाएँ', plan_p2_bp_p: 'आपकी प्रेग्नेंसी में BP ज़्यादा था। डिलीवरी के बाद भी यह ज़्यादा रह सकता है, इसलिए इस हफ़्ते जँचवाएँ, और फिर 6 हफ़्ते की जाँच पर।', plan_p2_tom: 'कल याद दिलाएँ',
        plan_p2_six_bp: 'आपकी प्रेग्नेंसी में BP ज़्यादा था: इस जाँच में BP ज़रूर जँचवाएँ।', plan_p2_six_gdm: 'आपकी प्रेग्नेंसी में शुगर बढ़ी थी: इस जाँच में 75 g शुगर टेस्ट करवाएँ, फिर हर साल एक बार।', plan_p2_from: 'आपकी प्रेग्नेंसी से', plan_p2_six_rem: '{d} को याद दिलाएँ', plan_p2_six_went: 'मैं जाँच करवा आई',
        plan_p2_un_h: 'थोड़ा और चलने-फिरने के लिए तैयार?', plan_p2_un_p: '6 हफ़्ते पर आपकी अपनी जाँच के बाद, या डॉक्टर के कहने पर, दोबारा मज़बूती शुरू होती है।', plan_p2_un_six: 'मैं 6 हफ़्ते की जाँच करवा आई', plan_p2_un_doc: 'डॉक्टर ने कहा मैं व्यायाम कर सकती हूँ', plan_p2_un_ready: 'मैं धीरे-धीरे शुरू करने को तैयार हूँ', plan_p2_un_not: 'अभी नहीं', plan_p2_un_open: 'दोबारा मज़बूती: ज़्यादा सैर, और हफ़्ते में 2 दिन {r}।',
        plan_p2_rdy_p: 'धीरे-धीरे तभी शुरू करें जब दोनों बातें सही हों:', plan_p2_rdy_c1: 'चलने-फिरने से मेरी ब्लीडिंग नहीं बढ़ती', plan_p2_rdy_c2: 'चलते समय टाँकों या घाव में दर्द नहीं होता', plan_p2_rdy_go: 'दोबारा मज़बूती शुरू करें', plan_p2_rdy_no: 'दोनों सही नहीं? अभी सैर और कसाव ही करें, और जाँच पर पूछें।',
        plan_p2_rd_h: 'क्या आपका शरीर और के लिए तैयार है?', plan_p2_rd_p: 'घर पर 6 आसान टेस्ट, लगभग 10 मिनट। इनसे {r} खुलता है।', plan_p2_rd_go: 'टेस्ट शुरू करें', plan_p2_rd_tick: 'जो आराम से कर पाएँ, उसे चुनें', plan_p2_rd_walk: '30 मिनट चलें', plan_p2_rd_leg: 'दीवार के पास हाथ रखकर 10 सेकंड एक पैर पर खड़ी रहें', plan_p2_rd_sit: 'कुर्सी से उठें और बैठें, 10 बार', plan_p2_rd_lift: 'चावल का थैला ज़मीन से उठाएँ, 10 बार', plan_p2_rd_carry: 'आधी भरी बाल्टी 20 क़दम ले जाएँ', plan_p2_rd_toes: 'पंजों पर ऊपर उठें, 10 बार',
        plan_p2_rd_bag: 'बच्चे के वज़न जितना चावल या आटे का थैला लें। बच्चे के साथ कभी टेस्ट न करें।', plan_p2_rd_bag0: 'लगभग 4 किलो का चावल या आटे का थैला लें।', plan_p2_rd_q: 'करते समय: कोई लीक, भारीपन, दर्द या ब्लीडिंग?', plan_p2_rd_no: 'नहीं', plan_p2_rd_yes: 'हाँ', plan_p2_rd_stay_h: '2 हफ़्ते और इसी स्तर पर रहें', plan_p2_rd_stay: 'यह भी प्लान मानना ही है। 3 महीने पर भी लीक, भारीपन, या गैस या पॉटी न रोक पाएँ: डॉक्टर या फ़िज़ियोथेरेपिस्ट से मिलें।',
        plan_p2_rd_ok_h: '{r} खुल गया', plan_p2_rd_ok: 'कल से हफ़्ते में 2 दिन। आपकी सैर और कसाव जारी रहेंगे।', plan_p2_rd_notyet: 'अभी सभी 6 नहीं? 2 हफ़्ते बाद फिर से करें। कुछ नहीं बिगड़ता।', plan_p2_rd_run: 'दौड़ना, कूदना और रस्सी कूदना इस प्लान में नहीं है। पहले फ़िज़ियोथेरेपिस्ट या डॉक्टर से पूछें।', plan_p2_rd_saved: 'कल से {r} खुल जाएगा।', plan_p2_rd_saved0: 'सेव हो गया। 2 हफ़्ते बाद फिर से करें।',
        plan_p2_fq: 'अब बच्चे को क्या पिलाती हैं?', plan_p2_f_only: 'सिर्फ़ माँ का दूध', plan_p2_f_mix: 'माँ का दूध और दूसरा दूध', plan_p2_f_other: 'सिर्फ़ दूसरा दूध',
        plan_p2_fl_only: 'सिर्फ़ माँ का दूध, दिन-रात, बच्चा 6 महीने से छोटा, और अभी पीरियड नहीं आया: अभी के लिए यह आपको बचाता है। इनमें से कोई एक भी बदले तो यह बचाव नहीं रहता, इसलिए उससे पहले कोई तरीक़ा चुन लें।', plan_p2_fl_mix: 'दूसरा दूध भी देती हैं, तो सिर्फ़ स्तनपान से बचाव नहीं होता। संबंध फिर शुरू होने से पहले कोई तरीक़ा चुनें।', plan_p2_fl_other: 'स्तनपान न हो तो डिलीवरी के लगभग 4 से 6 हफ़्ते बाद फिर से गर्भ ठहर सकता है। संबंध फिर शुरू होने से पहले कोई तरीक़ा चुनें।',
        plan_p2_c_h: 'संबंध फिर शुरू होने से पहले: गर्भनिरोध का तरीक़ा चुनें', plan_p2_c_p: 'पहला पीरियड लौटने से पहले भी गर्भ ठहर सकता है।', plan_p2_c_p0: 'डिलीवरी के कुछ समय बाद, पहले पीरियड से पहले भी, फिर से गर्भ ठहर सकता है।', plan_p2_c_go: 'मेरे विकल्प देखें', plan_p2_c_have: 'मेरे पास तरीक़ा है',
        plan_p2_v2_h: 'आपके रिकवरी प्लान में अब और भी है', plan_p2_v2_p: 'यह बच्चे के पहले जन्मदिन तक आपके शरीर के साथ चलता है: शाम की जाँच, 6 हफ़्ते की जाँच, फिर दोबारा मज़बूती। आपके दिन और जवाब वैसे ही रहेंगे।', plan_p2_v2_yes: 'इसे अपनाएँ', plan_p2_v2_done: 'आपका रिकवरी प्लान अपडेट हो गया।',
        plan_a_pwalk: 'जितना हो सके, थोड़ा चलें', plan_a_pf: 'पेल्विक फ़्लोर के कसाव', plan_a_pf5: '5 हल्के कसाव', plan_a_pf5_s: 'पेल्विक फ़्लोर, दूध पिलाते समय', plan_a_pf5_s0: 'पेल्विक फ़्लोर, लेटकर या बैठकर', plan_a_pf10: '10 कसाव, और खाँसी से पहले कसना', plan_a_pf10_s: 'खाँसने, छींकने या कुछ उठाने से पहले कस लें',
        plan_lk_h: 'इस हफ़्ते: कोई लीक?', plan_lk_never: 'कभी नहीं', plan_lk_some: 'कभी-कभी', plan_lk_most: 'ज़्यादातर दिन', plan_md_h: 'इस हफ़्ते आप अंदर से कैसी हैं?', plan_md_low: '2 हफ़्ते या उससे ज़्यादा से ज़्यादातर दिन उदास या चिंतित? इस हफ़्ते डॉक्टर से बात करें, या Tele-MANAS 14416 पर मुफ़्त कॉल करें।',
        plan_rv_p14: '14वें दिन से: हफ़्ते में 3 दिन थोड़ी सैर', plan_rv_p42: 'लगभग 42वें दिन: आपकी अपनी जाँच, फिर दोबारा मज़बूती', plan_rv_p84: '12वें हफ़्ते से: क्या शरीर और के लिए तैयार है?', plan_rv_p365: 'बच्चे के पहले जन्मदिन तक', plan_rv_p365b: 'डिलीवरी के एक साल तक', plan_rv_d2p: '{t} आपकी रिकवरी जाँच: 1 मिनट, उन संकेतों के साथ जिनमें देर नहीं करनी।', plan_st_r_six: '{d} को आपकी 6 हफ़्ते की जाँच',
        plan_pq_h: 'आपका साल, 5 हिस्सों में', plan_pq_1: 'आराम और ठीक होना · दिन 0 से 13', plan_pq_1p: 'शाम की जाँच, हल्के कसाव, आराम', plan_pq_2: 'संभलना · दिन 14 से 41', plan_pq_2p: 'थोड़ी सैर, गर्भनिरोध चुनना, 6 हफ़्ते की जाँच', plan_pq_3: 'दोबारा मज़बूती · हफ़्ते 7 से 18', plan_pq_3p: '6 हफ़्ते की जाँच के बाद: ज़्यादा सैर, हल्के व्यायाम, फिर ताक़त वाले', plan_pq_4: 'जारी रखें · 6 महीने तक', plan_pq_4p: 'आपके क़दम जारी रहेंगे। पीरियड कभी भी लौट सकते हैं।', plan_pq_5: 'पहला साल · {d} तक', plan_pq_5p: 'आपके क़दम, और साल पर एक नज़र',
        plan_rh_day_rc: '{n} क़दम, रिकवरी जाँच {t}', plan_th_rc_at: 'रिकवरी जाँच {t}', plan_p2_un_hd: 'थोड़ा और करने को तैयार?', plan_p2_un_pd: 'डॉक्टर के कहने पर, या जब आप तैयार महसूस करें, तब शुरू करें।', plan_rv_len_p: 'बच्चे के पहले जन्मदिन तक · रोज़ कुछ मिनट', plan_rv_len_pb: 'डिलीवरी के एक साल तक · रोज़ कुछ मिनट', plan_st_at_pp: 'हर शाम, 1 मिनट: आपकी रिकवरी जाँच, 41वें दिन तक।', plan_st_r_rc: '{t} की रिकवरी जाँच', plan_p2_six_wait: '{d} से दोबारा मज़बूती शुरू होगी।', plan_rh_p42: 'लगभग 42वें दिन', plan_rh_p42_s: 'आपकी अपनी जाँच, फिर दोबारा मज़बूती', plan_rh_p84: '12वें हफ़्ते से', plan_rh_p84_s: 'क्या शरीर और के लिए तैयार है?', plan_res_lk: 'लीक', plan_res_lk_w: '{x} · हफ़्ता {n}', plan_st_r_per: 'पीरियड से एक दिन पहले एक सूचना', plan_st_r_pf: '{t} का पहला सेट', plan_pf_pi_d13: 'दिन 1 से 3: {x}', plan_pf_pi_soon: 'पहले हफ़्तों में: {x}', plan_and: ' और ', plan_rem_after: '{t}, आपकी सैर के बाद',
        plan_in_now_p: 'ताकि Sakhi जाने कि आप कहाँ से शुरू कर रही हैं, और आपको दिखा सके कि क्या बदला।', plan_in_sum_h: 'आपने Sakhi को यह बताया', plan_in_sum_p: 'एक बार देख लें, फिर Sakhi आपका प्लान बनाएगी।',
        plan_in_sum_goal: 'आप किस पर काम करना चाहती हैं', plan_in_sum_now: 'अभी', plan_in_sum_when: 'चलने-फिरने का आपका समय', plan_in_make: 'मेरा प्लान बनाएँ',
        plan_ci_first: 'इसमें एक मिनट लगता है। आपके जवाब इसी फ़ोन पर रहते हैं।', plan_ci_tom: 'कल: यही क़दम। {t} फिर मिलेंगे।', plan_ci_see: 'कल {t} फिर मिलेंगे।',
        plan_sum_days: 'हफ़्ते में लगभग {a} दिन प्लान पूरा किया', plan_sum_goal: 'इस पर काम: {g}',
        plan_cnt_dp: 'आज {d} हो गए, {p} थोड़े', plan_ci_week: 'इस हफ़्ते 7 में से {w} दिन',
        plan_per: 'आपका पीरियड {n} दिन बाद आया। Sakhi ने इसे आपके नतीजों के लिए दर्ज कर लिया।', plan_per_ab: 'आपका पीरियड पिछले से लगभग {n} दिन बाद आया। Sakhi ने इसे आपके नतीजों के लिए दर्ज कर लिया।', plan_per0: 'आपका पीरियड दर्ज हो गया। Sakhi इसे आपके नतीजों के लिए रखती है।', plan_per_pain: 'पीरियड के दिनों में ऐंठन का तरीक़ा “आज” पर रहेगा।', plan_per_q: 'आपका पीरियड {n} दिन बाद आया।', plan_per_ab_q: 'आपका पीरियड पिछले से लगभग {n} दिन बाद आया।', plan_per0_q: 'आपका पीरियड दर्ज हो गया।', plan_pain_q: 'आज दर्द है?',
        plan_pk_pelvic: 'मेरा पेल्विक फ़्लोर प्लान',   /* Version 39.56 */
        plan_pf_sets: 'कसने के आपके सेट', plan_pf_sets_d: 'आपके 2 मिनट', plan_pf_sets_s: 'आज {m} में से {n} · {l}', plan_pf_sets_n: 'आज {m} में से {n}', plan_pf_lv: 'लेवल {n}, {p}',
        plan_pf_pos_lie: 'लेटकर', plan_pf_pos_sit: 'बैठकर', plan_pf_pos_stand: 'खड़े होकर', plan_pf_pos_walk: 'खड़े होकर या चलते हुए', plan_pf_pd: 'पीरियड के दिन एक सेट काफ़ी है, चाहें तो लेटकर।',
        plan_pf_relax: 'साँस लें और ढीला छोड़ें, कुछ मिनट', plan_pf_relax_s: 'कसने की जगह, जब तक डॉक्टर दर्द की जाँच न कर लें',
        plan_pf_find: 'सही मांसपेशियाँ पहचानें', plan_pf_find_s: 'लेटकर: ऐसे कसें जैसे गैस और पेशाब रोक रही हों, ऊपर खींचें, फिर पूरा ढीला छोड़ें', plan_pf_find_n: 'अब आपके सेट {p} हैं: पहले इसी तरह कसना पहचानें, फिर शुरू करें',
        plan_pf_chk: 'एक बार डॉक्टर से जाँच करवाएँ', plan_pf_chk_s: 'कारण डॉक्टर बताती हैं, ऐप नहीं। तब तक आपके सेट लेटकर ही रहेंगे।',
        plan_pf_urge: 'जब तेज़ हाजत हो: रुकें, कसें, साँस लें', plan_pf_urge_s1: 'रुककर खड़ी हों, कुछ बार कसें, धीरे साँस छोड़ें, फिर आराम से चलें', plan_pf_urge_s2: 'फिर जाने से पहले कुछ मिनट और रुकें, हर हफ़्ते थोड़ा ज़्यादा',
        plan_pf_h1: 'खाँसने, छींकने या उठाने से पहले कसें', plan_pf_h1_s: 'यह तरकीब लीक को शुरू होते ही रोक सकती है।', plan_pf_h2: 'दिन भर पानी', plan_pf_h2_s: 'थोड़ा-थोड़ा, लगभग 6 से 8 गिलास। बहुत कम पानी से मूत्राशय में और जल्दी हाजत होती है।',
        plan_pf_h3: 'शौच के समय: घुटने ऊपर, साँस बाहर', plan_pf_h3_s: 'पैर छोटे पीढ़े पर, आगे झुकें, और ज़ोर न लगाएँ', plan_pf_h3u: '2 हफ़्ते के लिए चाय, कॉफ़ी और कोला कम', plan_pf_h3u_s: 'फिर देखें कि हाजत शांत हुई या नहीं। पानी पीती रहें।',
        plan_pf_h4: 'सही तरीक़े से उठाएँ', plan_pf_h4_s: 'पहले कसें, उठाते समय साँस छोड़ें, और बोझ शरीर के पास रखें', plan_pf_h5: 'किसी काम के समय खड़े होकर एक सेट', plan_pf_h5_s: 'खाना बनाते, धोते या इंतज़ार करते हुए: कसें और रोकें, जैसा आपने सीखा',
        plan_fb_pfl: 'रोज़ सही तरीक़े से pelvic floor कसने से मांसपेशियाँ मज़बूत होती हैं। इसमें लगभग 3 महीने लगते हैं।', plan_fb_pf_find: 'पहले सही मांसपेशियाँ पहचानने से हर सेट काम आता है।',
        plan_fb_pf_chk: 'भारीपन के एक से ज़्यादा कारण हो सकते हैं। डॉक्टर की जाँच बताती है कौन सा, और कौन से व्यायाम सुरक्षित हैं।', plan_fb_pf_urge: 'हाजत को शांत करना और शौचालय जाने के बीच का समय बढ़ाना मूत्राशय को सिखाता है। इसमें कुछ हफ़्ते लगते हैं।',
        plan_fb_pf_habit: 'दिन की छोटी आदतें pelvic floor पर ज़ोर कम करती हैं।', plan_fb_pf_relax: 'कसते समय दर्द का मतलब हो सकता है कि मांसपेशियाँ बहुत कसी हुई हैं। पहले साँस लेना और ढीला छोड़ना।',
        plan_in_pf_h: 'लीक या भारीपन के बारे में', plan_in_pft: 'पेशाब कब लीक होता है?', plan_pft_stress: 'खाँसने, छींकने, हँसने या उठाने पर', plan_pft_urge: 'अचानक तेज़ हाजत में, शौचालय पहुँचने से पहले', plan_pft_both: 'दोनों', plan_pft_heavy: 'नीचे भारीपन या उभार महसूस होता है',
        plan_in_pfway: 'यह आपके दिन में कितनी रुकावट डालता है?', plan_pw_0: 'बिल्कुल नहीं', plan_pw_1: 'थोड़ी', plan_pw_2: 'काफ़ी', plan_pw_3: 'बहुत ज़्यादा',
        plan_pfs_p: 'जो आप पर लागू हो, उस पर टिक करें। कुछ में व्यायाम से पहले डॉक्टर ज़रूरी हैं। कुछ भी जवाब देना ज़रूरी नहीं।', plan_pfs_join_p: 'इनमें से कुछ भी आप पर लागू हो, तो पहले डॉक्टर को दिखाएँ।', plan_pfs_none_b: 'इनमें से कुछ नहीं', plan_pfs_none: 'इनमें से कुछ नहीं? आगे पर टैप करें।',
        plan_pfs_retain: 'पेशाब नहीं हो पाता, या हर समय बूँद-बूँद टपकता है', plan_pfs_retain_w: 'आज ही डॉक्टर को दिखाएँ। व्यायाम से इसका इलाज नहीं होता।',
        plan_pfs_const: 'लंबी डिलीवरी या ऑपरेशन के बाद, दिन-रात हर समय लीक', plan_pfs_const_w: 'इसी हफ़्ते डॉक्टर को दिखाएँ। इसकी मरम्मत हो सकती है, और इसे 3 महीने के व्यायाम तक नहीं रुकना चाहिए।', plan_pfs_const_g: 'सरकारी अस्पतालों में इसकी मरम्मत मुफ़्त है।',
        plan_pfs_uti: 'पेशाब में जलन, बुख़ार, या ख़ून', plan_pfs_uti_w: 'डॉक्टर को दिखाएँ। यह आम तौर पर इन्फ़ेक्शन होता है, कमज़ोर pelvic floor नहीं।',
        plan_pfs_bulge: 'उभार जो बाहर ही रहे', plan_pfs_bulge_w: 'आज ही डॉक्टर को दिखाएँ। बहुत दर्द हो या ख़ून आए, तो अभी जाएँ।', plan_pfs_bowel: 'गैस या शौच रोक नहीं पाती', plan_pfs_bowel_w: 'इसी हफ़्ते डॉक्टर को दिखाएँ।',
        plan_pfs_pain: 'कसने पर दर्द, या संबंध में दर्द', plan_pfs_pain_w: 'आपका प्लान कसने की जगह साँस लेने और ढीला छोड़ने से शुरू होगा। दर्द के लिए डॉक्टर को दिखाएँ।',
        plan_pfs_mesh: 'लीक या prolapse का पुराना ऑपरेशन, या पेडू में कैंसर का इलाज', plan_pfs_mesh_w: 'पहले यह प्लान अपनी डॉक्टर को दिखाएँ। जब तक डॉक्टर या फ़िज़ियोथेरेपिस्ट आगे बढ़ने को न कहें, आपके सेट लेटकर ही रहेंगे।',
        plan_lk_hv: 'इस हफ़्ते: कोई भारीपन?', plan_pf_sure: 'क्या आपको यक़ीन है कि आप सही तरीक़े से कस रही हैं?', plan_pf_sure_line: 'Qura की डॉक्टर या फ़िज़ियोथेरेपिस्ट आपके साथ इसकी जाँच कर सकती हैं।', plan_pf_when: 'यह कब हुआ?',
        plan_pf_cmp: 'शुरुआत के मुक़ाबले?', plan_pf_cmp_b: 'बेहतर', plan_pf_cmp_s: 'वैसा ही', plan_pf_cmp_w: 'ख़राब',
        plan_pf_safe_h: 'पहले डॉक्टर को दिखाएँ', plan_pf_safe_d: 'शुरू करने से पहले के आपके जवाबों के लिए पहले डॉक्टर ज़रूरी हैं।', plan_pf_safe_seen: 'मैं डॉक्टर को दिखा चुकी हूँ',
        plan_pf_right_h: 'क्या कसने का तरीक़ा सही है?', plan_pf_right_p: 'Qura की डॉक्टर मुफ़्त कॉल पर इस बारे में बात कर सकती हैं। आपकी डॉक्टर या महिलाओं की फ़िज़ियोथेरेपिस्ट इसे सामने से जाँच सकती हैं।', plan_pf_right_g: 'सरकारी अस्पताल की स्त्री रोग OPD में भी इसकी जाँच हो सकती है, कम या बिना ख़र्च के।',
        plan_pf_doc_h: 'डॉक्टर ने क्या कहा?', plan_pf_doc_pop: 'Prolapse है, और व्यायाम मदद कर सकते हैं', plan_pf_doc_ok: 'मैं व्यायाम कर सकती हूँ', plan_pf_doc_not: 'अभी जाँच नहीं हुई',
        plan_pf_doc_pop_t: 'अब लेवल खुलने पर आपके सेट बैठकर और खड़े होकर होंगे। हफ़्ते 16 तक रोज़ 3 सेट करती रहें।', plan_pf_doc_ok_t: 'अब लेवल खुलने पर आपके सेट आगे बढ़ेंगे।',
        plan_pf_mesh_h: 'पहले यह प्लान अपनी डॉक्टर को दिखाएँ', plan_pf_mesh_ok: 'डॉक्टर ने कहा आगे बढ़ना ठीक है', plan_pf_pain_h: 'सेट के दौरान दर्द', plan_pf_pain_p: 'अब आपके सेट साँस लेने और ढीला छोड़ने के हैं। दर्द के लिए डॉक्टर को दिखाएँ: पहले Qura की डॉक्टर, या अपनी डॉक्टर।', plan_pf_pain_ok: 'डॉक्टर ने जाँच ली: फिर से कसना',
        plan_pf_end_h: 'अब भी लीक या भारीपन?', plan_pf_end_p: 'डॉक्टर इसका इलाज कर सकती हैं। व्यायाम के बाद और भी इलाज हैं: ring pessary, तेज़ हाजत के लिए दवाएँ, और ऑपरेशन। आपकी डॉक्टर आपके साथ तय करती हैं।', plan_pf_low: 'इसकी वजह से उदास या अकेली महसूस करती हैं? Tele-MANAS 14416 मुफ़्त है।',
        plan_pf_rv_d1: 'दिन 1 से 3: सही मांसपेशियाँ पहचानें। आपके सेट लेटकर शुरू होंगे।', plan_pf_rv_lv: 'हर 5 दिन के सेट के बाद नया लेवल: ज़्यादा देर रोकना, फिर बैठकर और खड़े होकर।', plan_pf_rv_urge: 'दिन 4 से: जब तेज़ हाजत हो, रुकें, कसें, साँस लें।',
        plan_pf_rv_chk: 'एक बार डॉक्टर से जाँच करवाएँ। तब तक आपके सेट लेटकर ही रहेंगे।', plan_pf_rv_h: 'हफ़्ते 2 से: एक छोटी आदत, हर 2 हफ़्ते में नई।', plan_pf_rv_w4: 'हफ़्ते 1, 4 और 12: क्या यक़ीन है कि कसने का तरीक़ा सही है? Qura की डॉक्टर मदद कर सकती हैं।',
        plan_pf_rv_16: 'डॉक्टर को prolapse मिले, तो: हफ़्ते 16 तक रोज़ 3 सेट, फिर मज़बूत बनी रहें।', plan_pf_rv_join: 'रोज़: कसने के आपके सेट, दिन में 3', plan_pf_rv_keep: '12 हफ़्ते के बाद: रोज़ एक सेट से मज़बूत बनी रहें।',
        plan_pf_res_lv: 'आपका लेवल', plan_pf_res_lv_s: '8 में से लेवल {n} · {d} दिन सेट', plan_pf_res_way: 'दिन में रुकावट', plan_pf_res_sure: 'कसने के तरीक़े पर यक़ीन', plan_pf_res_hv: 'भारीपन',
        plan_pf_tile: 'कसने के सेट', plan_pf_tile_ch: 'अध्याय', plan_pf_tile_g: 'लीक और भारीपन',
        plan_pf_tip_time: 'एक सेट में कुछ मिनट लगते हैं। चाय उबलते समय करें, या सोने से पहले बिस्तर पर।', plan_pf_tip_tired: 'थकान वाले दिन सेट लेटकर करें। वे भी गिने जाते हैं।',
        plan_pf_tip_pain: 'अगर कसने में दर्द हो, तो रुकें और अपने सेट में “दर्द हो रहा है” पर टैप करें। दर्द की जाँच डॉक्टर करें।', plan_pf_tip_family: 'कसना किसी को दिखता नहीं: परिवार के साथ बैठे हुए या किसी काम के समय एक सेट करें।',
        plan_pf_tip_out: 'सेट के लिए जगह नहीं चाहिए: लेटकर, बैठकर या खड़े होकर, घर पर।',
        plan_pk_period: 'मेरा पीरियड प्लान',   /* Version 39.55 */
        plan_a_kit: 'पीरियड की आपकी किट', plan_a_kit_s: 'गर्माहट, ऐंठन वाली दिनचर्या और आराम की एक मुद्रा', plan_a_kitready: 'अपनी किट तैयार रखें', plan_a_kitready_s: 'पीरियड शायद जल्द आएगा: गर्म पानी की थैली, पैड या कपड़ा, और आराम की एक शांत जगह',
        plan_a_restday: 'आज आराम करें, या 10 मिनट टहलें', plan_a_restday_s: 'पीरियड के दिन आपकी मर्ज़ी। दोनों में से कोई भी गिना जाएगा।', plan_a_pdiary: 'डॉक्टर के लिए दर्द की डायरी', plan_a_pdiary_s: 'हफ़्ते में एक मिनट, डॉक्टर को दिखाने के लिए',
        plan_a_relax: 'कुछ मिनट आराम', plan_a_relax_s: 'डॉ. मेघा के साथ धीमी साँसें, या सोने से पहले योग निद्रा', plan_a_prest: 'लेटकर आराम: योग निद्रा', plan_a_prest_s: 'आज सैर की जगह। यह गिना जाएगा।',
        plan_a_phb: 'अपना Hb टेस्ट करवाएँ', plan_a_phb_s: 'Qura डॉक्टर से पूछें, या अपनी डॉक्टर से। हो गया? अपना नतीजा जोड़ें।', plan_a_calmweek: 'शांत हफ़्ते की आपकी योजना', plan_a_calmweek_s: 'जल्दी सोना · हल्का दिन · 10 मिनट बाहर',
        plan_fb_kitready: 'पीरियड से पहले चीज़ें तैयार हों, तो पहला दिन आसान रहता है।', plan_fb_restday: 'पीरियड के दिन आराम या हल्की हरकत, दोनों ठीक हैं।',
        plan_fb_cyoga: 'पीरियड से पहले के दिनों में हल्का योग कूल्हों, पेट और पीठ को ढीला करता है।', plan_fb_relax: 'रोज़ कुछ मिनट का सुकून दर्द के संकेतों को शांत कर सकता है। कई महिलाओं को कुछ पीरियड में फ़र्क़ दिखता है।',
        plan_fb_pdiary: 'दर्द की डायरी से डॉक्टर आपका पैटर्न देख पाती हैं, जिससे इलाज तय करने में मदद मिलती है।', plan_fb_prest: 'ज़्यादा ब्लीडिंग वाले दिन लेटकर आराम करने से ताक़त बचती है।',
        plan_fb_phb: 'ज़्यादा ब्लीडिंग से Hb कम हो सकता है। टेस्ट से पता चलता है कि इलाज की ज़रूरत है या नहीं।', plan_fb_calmweek: 'पीरियड से पहले के हफ़्ते की योजना, हल्के दिनों और ज़्यादा आराम के साथ, मुश्किल दिनों को संभालना आसान बनाती है।',
        plan_fb_pca: 'ज़्यादातर दिन खाने से कैल्शियम आपके लिए अच्छा है, और कुछ अध्ययनों में इससे पीरियड से पहले के दिन आसान हुए।', plan_in_endo: 'क्या किसी डॉक्टर ने बताया है कि आपको endometriosis या adenomyosis है?',
        plan_pt_h: 'आज आपका पीरियड', plan_pt_note: 'पैड हो या कपड़ा, वही 3 टैप।', plan_pt_soak: 'क्या 1 से 2 घंटे में पूरा भीग गया?', plan_pt_way: 'क्या इससे काम में रुकावट आई?', plan_pt_w_leak: 'कपड़ों तक निकल गया', plan_pt_w_night: 'रात में बदलना पड़ा', plan_pt_w_day: 'दिन का काम नहीं हो पाया',
        plan_px_q: 'क्या आज इससे काम में रुकावट आई?', plan_px_little: 'थोड़ी', plan_px_lot: 'बहुत',
        plan_per_v2_h: 'मेरा पीरियड प्लान आ गया है', plan_per_v2_p: 'यह आपके चक्र के साथ चलता है: पीरियड के दिनों, उससे पहले के हफ़्ते और बीच के दिनों के लिए अलग कदम, और हर हफ़्ते एक छोटा अध्याय। आपने जो दर्ज किया है, वह रहेगा।', plan_per_v2_yes: 'मुझे इसमें ले चलें', plan_per_v2_done: 'आपका प्लान बदल गया। आज से नए 12 हफ़्ते शुरू।',
        plan_per_w4_h: 'डॉक्टर को कब दिखाएँ', plan_per_pms2_h: 'प्लान पर आपका दूसरा पीरियड', plan_per_end: 'अब भी मुश्किल है? दर्द वाले और ज़्यादा ब्लीडिंग वाले पीरियड और PMS का इलाज डॉक्टर कर सकती हैं। अपना रिकॉर्ड साथ ले जाएँ।', plan_pain_saved: 'आपके नतीजों के लिए सेव हो गया',
        plan_rev_mins: 'आपने {a} मिनट व्यायाम किया।', plan_rev_bar: '{n} दिन: {b}।', plan_rev_bar1: '1 दिन: {b}।',
        plan_end_h: 'आपके 12 हफ़्ते पूरे हुए', plan_end_p: 'आपने {t} में से {n} दिन प्लान पूरा किया। अपने नतीजे देखें, और चुनें कि आगे क्या करना है।', plan_end_b: 'अपने नतीजे देखें', plan_carry_p: 'आपके क़दम जारी रहेंगे।', plan_carry_stop: 'रोकें', plan_carry_on: 'आपके क़दम जारी हैं', plan_end_stop_s: 'आपके क़दम और उनके रिमाइंडर बंद हो जाएँगे। जो आपने लिखा, वह आपके फ़ोन पर रहेगा।',
        plan_fin_days: 'आपने {t} में से {n} दिन प्लान पूरा किया।', plan_fin_low: 'फिर से, छोटे से शुरू करना चाहेंगी? नया प्लान एक क़दम से शुरू हो सकता है।', plan_fin_doc: 'अगर कुछ नहीं बदला, तो डॉक्टर को दिखाएँ: वे कारण ढूँढ सकती हैं।',
        plan_fin_next: 'आगे क्या?', plan_keep_s: 'यही क़दम, और शाम का चेक-इन जारी रहेगा।', plan_again2: 'नए 12 हफ़्ते शुरू करें', plan_again_s: 'कुछ सवालों के जवाब फिर से दें। आपने जो दर्ज किया, वह रहेगा।',
        plan_sl_m_lp: 'आपने {d} को शुरू किया था। आज फिर छोटे से शुरू करें: {a}।', plan_about_n: 'लगभग {n}', plan_prog_said: 'आपने बताया: {g}', plan_r_d: 'योग',
        plan_wk_preg: 'गर्भ का हफ़्ता {n}', plan_wk_post: 'डिलीवरी के बाद हफ़्ता {n}', plan_sum_own: '{w}, प्लान {d} को शुरू हुआ',
        plan_a_due: 'अभी: {x}', plan_a_due_more: 'अभी: {x} और {n} अन्य', plan_a_due_s: 'जाँचें और टेस्ट', plan_fb_due: 'समय पर जाँच और टेस्ट से समस्या जल्दी पकड़ में आती है, आपके और बच्चे के लिए।', plan_pi_due: 'आपकी जाँचें और टेस्ट, हफ़्ते दर हफ़्ते',
        plan_path_preg_h: 'आपकी प्रेग्नेंसी', plan_tri_1: 'हफ़्ता 1 से 13', plan_tri_1_p: 'पंजीकरण, पहली जाँच और फोलिक एसिड', plan_tri_2: 'हफ़्ता 14 से 27', plan_tri_2_p: 'जाँचें, स्कैन, आयरन और कैल्शियम', plan_tri_3: 'हफ़्ता 28 से 40', plan_tri_3_p: 'जाँचें, बच्चे की हलचल और डिलीवरी की तैयारी',
        plan_a_rcheck_s: '1 मिनट, ख़तरे के संकेतों के साथ', plan_pi_rcheck: 'रोज़ की रिकवरी जाँच, डिलीवरी के 6 हफ़्ते बाद तक', plan_ci_chk_done: 'आज हो गई', plan_ci_chk_go: 'अभी करें',
        plan_a_prep: 'गर्भ से पहले की चेकलिस्ट: जो हो गया, उस पर टिक करें', plan_pi_prep: 'गर्भ से पहले की चेकलिस्ट, हफ़्ते में एक बार', plan_fb_prep: 'इस चेकलिस्ट में वह सब है जो डॉक्टर गर्भ से पहले करने की सलाह देते हैं।', plan_fb_food_t: 'गर्भ से पहले अच्छा खाना शरीर को तैयार होने में मदद करता है।',
        plan_rv_ttc: 'जब महिला की उम्र 40 से कम हो, तो बिना गर्भनिरोध के नियमित संबंध से 10 में से 8 से ज़्यादा जोड़ों को एक साल में गर्भ ठहर जाता है, और 10 में से 9 से ज़्यादा को दो साल में।',
        plan_res_prep_h: 'गर्भ से पहले की चेकलिस्ट', plan_res_prep: '{b} में से {a} पूरी', plan_res_prep_b: 'चेकलिस्ट खोलें',
        plan_a_ironf: 'आज कोई आयरन वाला खाना', plan_a_ironf_veg: 'हरी पत्तेदार सब्ज़ी, चना, राजमा, रागी या पोहा, नींबू या आँवले के साथ', plan_a_ironf_egg: 'हरी पत्तेदार सब्ज़ी, चना, राजमा या अंडे, नींबू या आँवले के साथ', plan_a_ironf_nonveg: 'हरी पत्तेदार सब्ज़ी, चना, अंडे, मछली या मीट, नींबू या आँवले के साथ',
        plan_res_meno_hot: 'गर्मी के झोंकों वाले हफ़्ते', plan_res_meno_sleep: 'ख़राब नींद वाले हफ़्ते', plan_res_meno_mood: 'उदासी वाले हफ़्ते', plan_res_wks: '{n} में से {a} हफ़्ते', plan_res_meno_none: 'इसे देखने के लिए हर हफ़्ते की लक्षण डायरी भरें।', plan_res_hotd: 'गर्मी के झोंकों वाले दिन', plan_res_hot_none: 'इसे देखने के लिए जिन दिनों गर्मी के झोंके आएँ, उन दिनों “आज” पर “गर्मी के झोंके” दबाएँ।',
        plan_calm: 'आपका शांत हफ़्ता: पीरियड से पहले के दिन। शांत साँस सबसे पहले।',
        plan_wk_n: 'हफ़्ता {n}', plan_sum_wkn: 'प्लान का हफ़्ता {n}, {d} को शुरू हुआ', plan_sl_m_p2: 'देखें कि आपका प्लान कैसा चल रहा है।', plan_rv_len_d: 'रोज़ कुछ मिनट', plan_res_wk_b: 'शुरू करने से पहले के 4 हफ़्ते', plan_res_wk_s: 'पिछले 4 हफ़्ते',
        /* Version 39.12 */
        plan_a_r: '{r} · {n} मिनट', plan_start_b: 'शुरू करें',
        plan_pday: 'प्लान का दिन {n}', plan_t_next: 'अगला क़दम', plan_t_next_s: 'अगला · {s}', plan_t_part: 'थोड़ा हुआ', plan_t_done: 'हो गया', plan_t_full: 'आज का दिन पूरा। शाबाश।',
        plan_t_undo: 'ग़लती से टैप हुआ? टिक पर फिर से टैप करें।', plan_t_more: 'और पढ़ें', plan_how_h: 'कैसे', plan_how_r: 'लगभग {n} मिनट: {x}।', plan_bring_h: 'प्लान पर लगातार चलने से क्या मिल सकता है',
        plan_wk_full: 'इस हफ़्ते: {n} दिन सारे क़दम पूरे', plan_wk_full1: 'इस हफ़्ते: 1 दिन सारे क़दम पूरे', plan_wk_str: '{d} को ताक़त का दिन', plan_wk_str_tom: 'कल ताक़त का दिन', plan_wk_str_now: 'आज ताक़त का दिन',
        plan_d7_aria: 'आपके प्लान का हफ़्ता {w}: अब तक {n} दिन सारे क़दम पूरे', plan_d7_aria1: 'आपके प्लान का हफ़्ता {w}: अब तक 1 दिन सारे क़दम पूरे', plan_d7_t: '{d}: {n} में से {a} क़दम', plan_d7_t1: '{d}: 1 में से {a} क़दम', plan_d7_rest: '{d}: आराम का दिन', plan_d7_str: '{d}: ताक़त का दिन', plan_rev_short: '7 में से {n} दिन प्लान पर', plan_rev_short_f: '{n} दिन सारे क़दम', plan_rev_open: 'देखें', plan_rev_tip_s: 'इस हफ़्ते के लिए आपकी सलाह', plan_min_n: '{n} मिनट', plan_dc_h: 'आज का दिन पूरा', plan_dc_tom: 'कल', plan_dc_how: 'आज कैसा रहा, बताएँ (चाहें तो)',
        plan_goal_l: 'लक्ष्य: {g} · {w}', plan_how_h2: 'आपका प्लान कैसे चलता है', plan_rh_day: 'हर दिन', plan_rh_day_s: '{n} क़दम, चेक-इन {t}', plan_rh_day_s1: '1 क़दम, चेक-इन {t}', plan_rh_wk: 'हर हफ़्ते', plan_rh_wk_s: 'पीछे देखें, हफ़्ता तय करें', plan_rh_wk_s2: 'एक नज़र पीछे',
        plan_rh_m: 'हर 4 हफ़्ते', plan_rh_m_s: '1 मिनट का चेक-इन', plan_rh_end: '12 हफ़्ते बाद', plan_rh_end_s: 'आपके नतीजे', plan_steps_h: 'आपके रोज़ के {n} क़दम', plan_steps_h1: 'आपका रोज़ का क़दम', plan_steps_same: 'यहाँ टिक करें या “आज” पर: दोनों एक ही हैं।', plan_how_l: 'कैसे करें',
        plan_wk_h: 'इस हफ़्ते', plan_wk_days: 'प्लान के दिन {a} से {b}', plan_wk_legend: 'हर गोले में {n} हिस्से: {x}।', plan_wk_legend0: 'हर गोला एक दिन है: सारे क़दम होने पर पूरा।', plan_pt_yoga: 'योग', plan_pt_move: 'सैर', plan_pt_food: 'खाना', plan_pt_sleep: 'नींद',
        plan_wk_min: 'सक्रिय मिनट', plan_min_of2: '{t} में से {a}', plan_cons_h: 'लगातार करने से क्या मिलता है', plan_signs_h: 'आपके अपने संकेत', plan_sg_e: 'आपकी ऊर्जा', plan_sg_e_v: 'हफ़्ता {n}: {e}', plan_sg_mc: 'आपका 4 हफ़्ते का चेक-इन', plan_sg_mc_n: '{n} दिन में', plan_sg_mc_1: 'कल', plan_sg_mc_now: 'अभी करें', plan_sg_mc_done: 'हो गया',
        plan_sg_gap: 'पीरियड के बीच के दिन', plan_sg_gap_b: 'प्लान से पहले {n}', plan_sg_gap_s: 'प्लान के बाद {n}', plan_sg_gap_sa: 'प्लान के बाद लगभग {n}', plan_set_row_s: 'रिमाइंडर, याद दिलाना, रोकना, बदलना या बंद करना',
        plan_a_walk: '{n} मिनट सैर करें', plan_pi_yoga: 'रोज़ घर पर योग, चलती तस्वीरों के साथ', plan_cnt_all: 'आज के सभी {n} क़दम हो गए', plan_th_one: 'बस एक और: {a}', plan_ci_add: 'कल यह भी करें: {x}।', plan_rev_full: 'हफ़्ते के 7 में से {n} दिन सारे क़दम पूरे हुए।',
        plan_meal_half: 'दोपहर या रात के खाने में', plan_meal_protein: 'जैसे दाल या बेसन चीला', plan_meal_millet: 'आज किसी एक खाने में', plan_meal_drinks: 'जब कुछ पीने का मन हो', plan_meal_snack: 'बीच के नाश्ते में', plan_meal_oil: 'खाना बनाते समय',
        plan_th_str: '{d}: ताक़त का दिन · इस हफ़्ते {t} में से {a}', plan_th_str_tom: 'कल: ताक़त का दिन · इस हफ़्ते {t} में से {a}', plan_th_light: '{d} तक हल्का हफ़्ता: रोज़ 10 मिनट।',
        plan_ci_last: 'कल: {t} तक बिस्तर पर गईं?', plan_ci_last_d: 'कल: {t} तक बिस्तर पर गईं', plan_ci_yes: 'हाँ', plan_ci_close: 'लगभग', plan_ci_no: 'नहीं',
        plan_ci_left: '{n} सवाल बाक़ी', plan_ci_left1: '1 सवाल बाक़ी', plan_ci_left0: 'सब गिना जा चुका है। बस सेव करें।', plan_ci_change: 'कोई जवाब बदलें',
        plan_ci_n_r: 'आपके योग से गिना गया', plan_ci_n_str: '“घर पर ताक़त” से गिना गया', plan_ci_n_rt: 'आपके किए अभ्यास से गिना गया', plan_ci_n_min: 'गिना गया: आज {n} मिनट', plan_ci_n_plate: 'आज की आपकी थाली से', plan_ci_n_today: '“आज” पर टिक किया', plan_ci_n_tool: 'जहाँ किया, वहीं से गिना गया',
        plan_ci_goal_h: 'आपका लक्ष्य', plan_ci_str: 'ताक़त: इस हफ़्ते {t} में से {a}', plan_ci_str_nx: 'अगला: {d}', plan_ci_tomr: 'कल: {r} · {n} मिनट', plan_ci_if: 'आपने तय किया था: “{x}।”',
        plan_cg_irregular: 'पीरियड नियमित होने की ओर एक क़दम।', plan_cg_pmos: 'पीरियड नियमित होने की ओर एक क़दम।', plan_cg_skin: 'साफ़ त्वचा की ओर एक क़दम।', plan_cg_weight: 'सेहतमंद वज़न की ओर एक क़दम।', plan_cg_ready: 'गर्भ की तैयारी में एक क़दम।',
        plan_cg_pain: 'आसान पीरियड की ओर एक क़दम।', plan_cg_heavy: 'ज़्यादा ताक़त की ओर एक क़दम।', plan_cg_pms: 'पीरियड से पहले के शांत दिनों की ओर एक क़दम।', plan_cg_food: 'सेहतमंद प्रेग्नेंसी के लिए एक क़दम।', plan_cg_nausea: 'आसान दिनों की ओर एक क़दम।',
        plan_cg_iron: 'आयरन ठीक रखने की ओर एक क़दम।', plan_cg_sleep: 'बेहतर नींद की ओर एक क़दम।', plan_cg_mood: 'शांत मन की ओर एक क़दम।', plan_cg_recovery: 'ठीक होने की ओर एक क़दम।', plan_cg_pelvic: 'मज़बूत पेल्विक फ़्लोर की ओर एक क़दम।',
        plan_cg_feed: 'आपके और आपके बच्चे के लिए एक क़दम।', plan_cg_hot: 'ज़्यादा आरामदायक दिनों की ओर एक क़दम।', plan_cg_bones: 'मज़बूत हड्डियों की ओर एक क़दम।', plan_cg_aches: 'ज़्यादा ऊर्जा की ओर एक क़दम।',
        plan_wp_h: 'अपना हफ़्ता तय करें', plan_wp_sub: 'हफ़्ता {n} · {a} से {b} · 30 सेकंड', plan_wp_str: 'आपके {n} ताक़त के दिन', plan_wp_str1: 'आपका ताक़त का दिन', plan_wp_str_p: '“घर पर ताक़त”, लगभग {n} मिनट। लगातार दो दिन नहीं।',
        plan_wp_when: 'चलने-फिरने का आपका समय', plan_wp_if: 'अगर कोई रुकावट आए', plan_wp_last: 'पिछले हफ़्ते {n} दिन “{b}” की वजह से रुकावट आई।', plan_wp_last1: 'पिछले हफ़्ते 1 दिन “{b}” की वजह से रुकावट आई।',
        plan_wp_sum: 'इस हफ़्ते: {m} मिनट', plan_wp_new: 'नया: {h}', plan_wp_sum_d: 'इस हफ़्ते: रोज़ {n} मिनट सैर', plan_wp_save: 'मेरा हफ़्ता सेव करें', plan_wp_same: 'पिछले हफ़्ते जैसा', plan_wp_saved: 'आपका हफ़्ता तय हो गया।',
        plan_wp_err: '{n} दिन चुनें, लगातार दो दिन नहीं।', plan_wp_err1: 'अपना ताक़त का दिन चुनें।', plan_wp_err_w: 'चलने-फिरने का अपना समय चुनें।', plan_wp_b: 'अपना हफ़्ता तय करें · 30 सेकंड',
        plan_wp_row: 'इस हफ़्ते की योजना', plan_wp_row_s: 'ताक़त के दिन, आपका समय, और दूसरा रास्ता', plan_wp_row_s2: 'आपका समय, और दूसरा रास्ता', plan_wp_row_str: 'ताक़त: {d}',
        plan_ifq_time: 'अगर समय कम हो, तो मैं…', plan_ifq_tired: 'अगर बहुत थकान हो, तो मैं…', plan_ifq_pain: 'अगर दर्द हो, तो मैं…', plan_ifq_family: 'अगर घर या काम की वजह से न हो पाए, तो मैं…', plan_ifq_out: 'अगर बाहर न जा सकूँ, तो मैं…',
        plan_if_time_five: '5 मिनट ही कर लूँगी', plan_if_time_split: 'दो छोटी सैर में बाँट लूँगी', plan_if_time_phone: 'फ़ोन पर बात करते हुए टहल लूँगी',
        plan_if_tired_breath: '5 मिनट की शांत साँस कर लूँगी', plan_if_tired_slow: '10 मिनट धीरे टहल लूँगी', plan_if_tired_gentle: '“आसान शुरुआत” वाला योग कर लूँगी',
        plan_if_pain_cramps: 'ऐंठन वाला तरीक़ा आज़माऊँगी', plan_if_pain_rest: 'आज आराम करूँगी और कल धीरे टहलूँगी',
        plan_if_family_ask: 'किसी को साथ टहलने को कहूँगी', plan_if_family_home: 'बच्चे खेलें, तब घर पर योग कर लूँगी', plan_if_family_dinner: 'रात के खाने के बाद परिवार के साथ टहलूँगी',
        plan_if_out_march: 'घर पर एक जगह क़दमताल कर लूँगी', plan_if_out_stairs: 'सीढ़ियाँ चढ़-उतर लूँगी', plan_if_out_yoga: 'घर पर योग कर लूँगी',
        plan_a_wind: 'सुकून के पल, फिर {t} तक बिस्तर पर', plan_a_wind_s: 'आज रात: डॉ. मेघा के साथ {s}', plan_a_wind_t: 'आज रात: {s}', plan_a_wind_how: 'चलाएँ, फ़ोन उल्टा रख दें और आँखें बंद करें। कमरा अँधेरा और शांत रखें।', plan_ci_n_wind: 'सुकून के पल: {s}', plan_yoga_when: 'खाने से पहले',
        plan_ci_slp: 'नींद कैसी रही?', plan_slp_well: 'अच्छी', plan_slp_ok: 'ठीक-ठाक', plan_slp_bad: 'ख़राब',
        plan_night_h: 'रात मुश्किल रही। आज रात, किसी शांत आवाज़ के सहारे सोएँ।', plan_night_p: 'डॉ. मेघा की योग निद्रा शरीर के हर हिस्से को आराम देती है। या कोई शांत आवाज़ चलाएँ, जो {n} मिनट बाद धीमी होकर बंद हो जाएगी।',
        plan_night_noted: 'डायरी में “नींद ख़राब” लिख दिया है। 2 हफ़्ते तक ज़्यादातर रातें नींद ख़राब रहे, तो डॉक्टर को बताएँ।', plan_tonight: 'आज रात के सुकून के पल', plan_tonight_pill: 'आज रात',
        plan_slp_hot: 'गर्मी के झोंकों से नींद खुली', plan_night_hot_h: 'गर्मी के झोंकों से नींद खुली। आज रात कमरा ठंडा रखें।', plan_night_hot_p: 'हल्के सूती कपड़े और बिस्तर के पास पानी भी कुछ महिलाओं की मदद करते हैं। झोंके से नींद खुले, तो ठंडक लें और धीरे-धीरे साँस लें, जब तक वह गुज़र न जाए।',
        plan_night_hot_noted: 'डायरी में “गर्मी के झोंके” और “नींद ख़राब” लिख दिया है। अक्सर इनसे नींद खुलती है? डॉक्टर को दिखाएँ: इनका इलाज होता है।',
        plan_wind_rem: 'सुकून के पल का रिमाइंडर', plan_wind_rem_s: 'हर रात {t}, सोने से 30 मिनट पहले', plan_wind_rem_ci: 'शाम का चेक-इन ही आज रात का सत्र दिखाएगा',
        plan_how_link: 'कैसे चलता है', plan_why_all: 'ये {n} क़दम क्यों?', plan_why_all1: 'यह क़दम क्यों?', plan_wp_link: 'हफ़्ते की योजना', plan_add_s: 'जोड़ें',
        plan_res_tile_s: '{n} दिन', plan_garden_n: 'मेरा बगीचा · {n} पंखुड़ियाँ', plan_garden_1: 'मेरा बगीचा · 1 पंखुड़ी', plan_kv_this: 'इस हफ़्ते', plan_kv_next: 'अगले हफ़्ते', plan_path_all: 'सभी 12 हफ़्ते',
        plan_moves_tab: 'योग और व्यायाम', plan_calm_tab: 'सुकून', plan_calm_p: 'डॉ. मेघा अपनी आवाज़ में, हिंदी या अंग्रेज़ी में साथ देती हैं। इनमें से कोई भी आज रात के सुकून के पल गिना जाएगा।',
        plan_calm_s_breaths: '4 तक अंदर, 6 तक बाहर, बैठकर या लेटकर', plan_calm_s_bhramari: 'धीमी गुनगुनाहट, बैठकर', plan_calm_s_nidra: 'बिस्तर में लेटकर, एक-एक हिस्सा',
        plan_calm_snd_s: 'सिंगिंग बाउल और लहरें, धीमा संगीत, गहरा संगीत, टाइमर के साथ', plan_calm_safe_h: 'आराम और नींद के लिए, इलाज नहीं', plan_calm_safe_p: 'चक्कर आए या ठीक न लगे, तो रुक जाएँ।',
        plan_nudge: 'चलने-फिरने के समय याद दिलाएँ', plan_nudge_s: '{w}, लगभग {t}', plan_nudge_none: '“इस हफ़्ते की योजना” में अपना समय चुनें', plan_nudge_n: 'दिन में ज़्यादा से ज़्यादा एक बार, और चलने-फिरने के बाद या आराम के दिन बिल्कुल नहीं।',
        plan_mc_h: 'आपका {n} हफ़्ते का चेक-इन', plan_mc_p: '1 मिनट · सिर्फ़ इसी फ़ोन पर', plan_mc_since: 'शुरू करने के बाद से ये कैसे हैं?', plan_mc_e: 'ऊर्जा', plan_mc_s: 'नींद', plan_mc_m: 'मूड', plan_mc_sk: 'त्वचा और बाल',
        plan_mc_better: 'बेहतर', plan_mc_same: 'वैसा ही', plan_mc_worse: 'ख़राब', plan_mc_meas: 'चाहें तो नापें', plan_mc_opt: 'अपनी मर्ज़ी से', plan_mc_waist: 'कमर (सेमी)', plan_mc_skip: 'छोड़ें', plan_mc_save: 'मेरा चेक-इन सेव करें',
        plan_mc_bad: 'नंबर जाँचें: कमर 40 से 200 सेमी, वज़न 25 से 250 किलो।', plan_mc_b: 'अपना {n} हफ़्ते का चेक-इन करें', plan_mc_row_s: '1 मिनट: शुरू करने के बाद से आप कैसा महसूस करती हैं', plan_mc_end_h: '12 हफ़्ते बाद आप कैसा महसूस करती हैं?',
        plan_mc_res_h: 'आपके पहले {n} हफ़्ते', plan_mc_res_h3: 'आपके 12 हफ़्ते', plan_mc_did: 'आपने क्या किया', plan_mc_saw: 'आपने क्या महसूस किया', plan_mc_r_moved: 'दिन व्यायाम किया', plan_mc_r_str: 'ताक़त के दिन', plan_mc_r_food: 'खाने की आदतें जारी', plan_mc_r_days: 'दिन प्लान माना',
        plan_mc_r_mins: 'कुल {n} मिनट योग और सैर।', plan_mc_waist_l: 'कमर', plan_mc_weight_l: 'वज़न', plan_mc_worse_p: 'कुछ पहले से ख़राब लग रहा है? डॉक्टर इसकी वजह जानने में मदद कर सकती हैं।', plan_mc_next: 'अगला चेक-इन: 4 हफ़्ते बाद।',
        plan_mc_hist: 'आपने कैसा महसूस किया', plan_mc_after: '{n} हफ़्ते बाद:', plan_sum_mc: 'शुरू करने के बाद से ({n} हफ़्ते का चेक-इन): {x}',
        plan_q_h: 'दो शांत हफ़्ते', plan_q_p: 'ज़िंदगी में व्यस्तता आ जाती है। आपका प्लान इंतज़ार कर रहा है, और आपने जो किया वह कहीं नहीं गया। किस चीज़ से मदद मिलेगी?', plan_q_light: 'अगला हफ़्ता हल्का करें', plan_q_light_s: 'रोज़ 10 मिनट और खाने की एक आदत', plan_q_light_s2: 'रोज़ 10 मिनट और कम क़दम',
        plan_q_light_ok: 'अगले 7 दिन हल्के रहेंगे। उसके बाद आपका प्लान वैसे ही चलेगा।', plan_q_fam: 'परिवार से साथ टहलने को कहें', plan_q_fam_s: 'आपका अपना संदेश, सेहत की कोई बात नहीं', plan_q_msg: 'क्या आप {w} मेरे साथ टहलने चलेंगे? इस हफ़्ते रोज़ {n} मिनट।', plan_q_share: 'भेजें', plan_q_edit: 'बदलें'
      }
    },
    routes: { plan: renderMyPlan, 'plan-settings': renderSettings, 'plan-psafe': renderPsafe, 'plan-pmos': renderHub, 'plan-reveal': renderReveal, 'plan-checkin': renderCheckin, 'plan-goal': renderGoalFlow, 'plan-start': renderStart, 'plan-plate': renderPlate, 'plan-body': renderBody, 'plan-moves': renderMoves, 'plan-calm': renderCalm, 'plan-progress': renderProgress, 'plan-week': renderWeek, 'plan-check': renderCheck, 'plan-now': renderNow, 'plan-wind': renderWind, 'plan-end': renderEnd, 'plan-pready': renderPready },
    prefixes: { 'plan-r-': (v, rest) => renderPlayer(v, rest) },
    testRoutes: ['plan-r-gentle', 'plan-r-cycle', 'plan-r-sun', 'plan-r-strength', 'plan-r-calm'],
    open: ['plan', 'plan-pmos', 'plan-plate', 'plan-moves', 'plan-calm', 'plan-r-*'],
    /* Version 39.3 (diet audit 5.3, 5.4): Yoga and moves, Strength at home and My plate can be found by search (not in pregnancy) */
    tiles: [{ section: 'tools', route: 'plan-moves', title: 'plan_moves_h', sub: 'plan_moves_tile_s', icon: ICO.move, order: 6, gated: false, hidden: () => !on() || (pregnant() && !pyOpen(S.canSave() && raw() ? D() : null)) || earlyPost(), keywords: 'yoga yog exercise vyayam kasrat workout asana stretch stretching moves योग व्यायाम कसरत आसन' },
      { section: 'tools', route: 'plan-r-strength', title: 'plan_r_strength', sub: 'plan_r_strength_s', icon: ICO.move, order: 7, gated: false, hidden: () => !on() || pregnant() || earlyPost() || heartHold(), keywords: 'strength strong bones muscle chair wall stairs taqat ताक़त ताकत हड्डी' },
      { section: 'tools', route: 'plan-plate', title: 'plan_plate_h', sub: 'plan_plate_tile_s', icon: ICO.plate, order: 8, gated: false, hidden: () => !on() || pregnant(), keywords: 'plate thali healthy plate portion half sabzi थाली' },   /* review FOOD-10 */
      { section: 'tools', route: 'plan-body', title: 'plan_tiles_body', sub: 'plan_body_tile_s', icon: ICO.body, order: 9, gated: false, hidden: () => !on() || pregnant(), keywords: 'bmi weight waist body vajan wajan motapa वज़न वजन मोटापा कमर' },   /* review FOOD-11: "BMI" opens My body */
      { section: 'cond', route: 'plan-pmos', title: 'plan_tile_t', sub: 'plan_tile_s', icon: ICO.move, order: 0.5, gated: true, hidden: () => !on() || pregnant() || (stageNowKey() === 'ttc' && !(raw() && raw().start)) || !!(raw() && raw().start && (raw().pack || 'cycle') !== 'cycle'),   /* Version 39.51 (Mohit's phone test): not while another plan runs */   /* Version 39.32: while she tries for a baby, Getting ready (My plan) */
      keywords: 'diet food khana thali eat avoid what to eat yoga yog exercise vyayam kasrat workout walk walking steps strength bmi weight vajan motapa waist healthy millet bajra ragi खाना डाइट थाली योग व्यायाम कसरत सैर वज़न वजन मोटापा बीएमआई कमर' }],
    today: today,
    setup: setup,
    summary: summary,
    sample: sample,
    beforeRender: () => { if (planOn()) carrySync(); },
    home: () => (S.explain && S.explain.pairsPending && S.explain.pairsPending() ? '' : planCard() || offerCard() || homeRec()),   /* Version 39.27 (R06): her plan's offer is inside the doctor finding's card */
    afterHome: (v) => { afterHome(v); afterHomePlan(v); },
    todayHead: todayHead,
    todayFoot: todayFoot,   /* Version 39.14 */
    event: onLog,
    afterRender: (v, route) => { if (route !== 'plan-reveal' && route !== 'plan') stopAudio(); if (!/^plan-r-/.test(route || '')) { stopRun(); awake(false); } if (route !== 'plan-moves' && !/^plan-r-/.test(route || '')) stopAnim(); if (route !== 'plan-body') S.mem.planShow = false; if (route !== 'plan') S.mem.planHelp = null; if (route !== 'plan' && !/^plan-/.test(route || '')) { S.mem.discPick = false; S.mem.lossPick = false; } if (route !== 'plan-week') { S.mem.planWk = null; S.mem.planNudgeAsk = false; } if (route !== 'plan-check' && S.mem.planMc && S.mem.planMc.saved) S.mem.planMc = null; if (route !== 'home') { S.mem.planFam = null; S.mem.planFamEdit = false; } },   /* Version 39.12 */
    css: [
      '.card.dark.pl-urg { background: var(--ink); color: var(--ink-text); } .card.dark.pl-urg h3, .card.dark.pl-urg p { color: var(--ink-text) !important; }',   /* Version 39.36 */
      '.pl-steps li.gone .pl-sdot { background: var(--line); border-color: var(--line); } .pl-steps li.gone strong { color: var(--muted); }',   /* Version 39.35: a part of her pregnancy that has passed, not a tick */
      '.pl-fig { width: 100%; height: auto; display: block; color: var(--accent); }',
      '.pl-fig polyline { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; } .pl-fig circle { fill: currentColor; } .pl-fig ellipse.pl-bump { fill: currentColor; } .pl-figbox { position: relative; } .pl-unwell-b { position: absolute; top: 8px; right: 8px; min-height: 36px; padding: 4px 12px; border-radius: 18px; border: 1px solid var(--line); background: var(--card); color: var(--accent); font: inherit; font-size: 13px; font-weight: 600; }',
      '.pl-fig .pl-mat { stroke: var(--line); stroke-width: 2; stroke-linecap: round; } .pl-fig .pl-prop path { fill: none; stroke: var(--muted); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }',
      '.pl-intro { align-items: center; text-align: center; gap: 8px; } .pl-intro .sakhi { width: 72px; height: 72px; } .pl-intro .lead { margin: 0; }',
      '.pl-intro-art { display: grid; grid-template-columns: 1.6fr 1fr; gap: 8px; align-items: center; width: 100%; } .pl-fig-sm { max-width: 120px; margin: 0 auto; }',
      '.pl-plate { width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto; } .pl-plate .pl-pv { fill: var(--h-green-soft); } .pl-plate .pl-pg { fill: var(--h-gold-soft); } .pl-plate .pl-pp { fill: var(--h-plum-soft); } .pl-plate .pl-pb { fill: var(--h-sky-soft); }',
      '.pl-plate .pl-rim { fill: none; stroke: var(--line); stroke-width: 2; } .pl-plate .pl-cut { stroke: var(--card); stroke-width: 3; } .pl-plate .pl-lab { fill: var(--fg); font-size: 11px; font-weight: 600; } .pl-plate .pl-big { font-size: 13px; fill: var(--muted); } .pl-tap { max-width: 260px; margin: 4px auto 8px; } .pl-tap .pl-pv { fill: var(--h-green); fill-opacity: 0.55; } .pl-tap .pl-pg { fill: var(--h-gold); fill-opacity: 0.55; } .pl-tap .pl-pp { fill: var(--h-plum); fill-opacity: 0.55; } .pl-tap .pl-pb { fill: var(--h-sky); fill-opacity: 0.55; } .pl-plate.pl-tap .off { fill: var(--card); fill-opacity: 1; stroke: var(--muted); stroke-width: 1.4; stroke-dasharray: 4 3; } .pl-th-tip { margin-top: 8px; }',
      '.pl-plist { margin: 0; padding-left: 20px; display: grid; gap: 4px; color: var(--fg); }',
      '.pl-dots { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; } .pl-dots i { height: 8px; border-radius: 4px; background: var(--line); } .pl-dots i.on { background: var(--accent); } .pl-dots i.now { background: var(--accent-2); }',
      '.pl-weekrow { gap: 14px; align-items: center; } .pl-weekinfo { display: grid; gap: 2px; min-width: 0; } .pl-weekinfo strong { font-size: 17px; color: var(--fg); }',
      '.pl-ring { width: 84px; height: 84px; flex: none; } .pl-ring .trk { fill: none; stroke: var(--line); stroke-width: 8; } .pl-ring .arc { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; } .pl-ring text { fill: var(--fg); font-size: 18px; font-weight: 700; }',
      '.pl-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; text-align: center; margin-top: 12px; } .pl-day i { display: grid; place-items: center; height: 30px; border-radius: 10px; background: var(--line); font-style: normal; } .pl-day i.half { background: var(--accent-soft); } .pl-day i.full { background: var(--accent-strong); }',
      '.pl-day i b { color: var(--fg); font-size: 13px; } .pl-day i.full b { color: #FFFFFF; } .pl-day span { font-size: 13px; color: var(--muted); } .pl-day.now span { color: var(--accent); font-weight: 700; }',
      '.pl-today h3 { margin: 0 0 6px; } .pl-move { display: flex; gap: 12px; align-items: center; } .pl-mfig { width: 76px; flex: none; } .pl-mtext { display: grid; gap: 2px; min-width: 0; } .pl-mtext strong { color: var(--fg); } .pl-tn { color: var(--accent); font-weight: 600; }',
      '.pl-add { margin: 8px 0 4px; } .pl-routine { margin-top: 8px; } .pl-routine .pl-rfig, .pl-ritem .pl-rfig { width: 76px; height: 64px; flex: none; display: block; border-radius: 12px; background: var(--hue-soft, var(--accent-soft)); padding: 2px; }',
      '.pl-ritem .pl-rfig.pl-rf3d, .pl-mf3d { padding: 0; overflow: hidden; background: #EBEBEB; border-radius: 12px; } .pl-ritem .pl-rf3d .pl-3d { width: 76px; height: 64px; aspect-ratio: auto; object-fit: cover; }',   /* Version 39.45: the 3D figure on Moves and calm */
      '.pl-habits { display: grid; gap: 6px; margin-top: 12px; } .pl-hab { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--card); } .pl-hab.done { border-color: var(--ok); background: var(--ok-soft); }',
      '.pl-hab input { width: 22px; height: 22px; min-height: 0; flex: none; accent-color: var(--accent); margin-top: 1px; } .pl-hab > span { display: grid; gap: 2px; min-width: 0; } .pl-hab strong { color: var(--fg); }',
      '.pl-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } .pl-tile { display: grid; gap: 8px; justify-items: start; padding: 14px; border-radius: 18px; border: 1.5px solid var(--line); background: var(--hue-soft, var(--card)); color: var(--fg); text-align: left; font: inherit; min-height: 92px; }',
      '.pl-tile .ico-sm { background: var(--card); } .pl-tile strong { font-size: 15px; }',
      '.pl-ico { display: inline-flex; width: 18px; height: 18px; flex: none; } .pl-ico svg { width: 18px; height: 18px; }',
      '.pl-frow { display: grid; gap: 6px; } .pl-frow + .pl-frow { margin-top: 10px; } .pl-glab { font-size: 13px; font-weight: 600; color: var(--muted); } .pl-food { display: flex; flex-wrap: wrap; gap: 6px; }',
      '.pl-f { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 16px; font-size: 13px; color: var(--fg); background: var(--h-green-soft); min-width: 0; } .pl-f span { overflow-wrap: anywhere; } .pl-f .pl-ico { color: var(--h-green); }',
      '.pl-f.less { background: var(--h-gold-soft); } .pl-f.less .pl-ico { color: var(--h-gold); } .pl-f.avoid { background: var(--accent-soft); } .pl-f.avoid .pl-ico { color: var(--accent); }',
      '.pl-dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; margin-right: 8px; vertical-align: 1px; } .pl-dot.ok { background: var(--h-green); } .pl-dot.less { background: var(--h-gold); } .pl-dot.avoid { background: var(--accent); }',
      '.pl-bar { width: 100%; height: auto; display: block; } .pl-bar .b0 { fill: var(--h-sky); opacity: 0.55; } .pl-bar .b1 { fill: var(--h-green); opacity: 0.7; } .pl-bar .b2 { fill: var(--h-gold); opacity: 0.75; } .pl-bar .b3 { fill: var(--h-orange); opacity: 0.7; } .pl-bar .mk { fill: var(--accent-strong); } .pl-bar text { fill: var(--muted); font-size: 12px; }',
      '.pl-bmival { font-size: 26px; font-weight: 700; color: var(--fg); } .pl-hrow label { display: grid; gap: 4px; font-size: 13px; } .pl-hist td { padding: 4px 8px 4px 0; white-space: nowrap; }',
      '.pl-err { color: var(--accent); font-weight: 600; }',
      '.pl-walkcard { flex-direction: row; display: flex; gap: 12px; align-items: center; } .pl-walkcard h3 { margin: 0; }',
      '.pl-pitem .pl-thumb { width: 56px; height: 47px; flex: none; display: block; } .pl-pbar { height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; } .pl-pbar i { display: block; height: 100%; background: var(--accent); }',
      '.pl-stage { align-items: center; text-align: center; gap: 6px; } .pl-stage h2 { margin: 0; } .pl-stage p { margin: 0; color: var(--fg); }',
      '.pl-figbox { width: 100%; max-width: 260px; border-radius: 20px; background: var(--hue-soft, var(--accent-soft)); padding: 6px 4px 0; } .pl-figbox .pl-fig { color: var(--hue, var(--accent)); }',
      /* Version 39.39: the 3D figure (on the renders' own light grey) and the rest between moves */
      '.pl-figbox.pl-fb3d { padding: 0; overflow: hidden; background: #EBEBEB; } .pl-3d { display: block; width: 100%; height: auto; aspect-ratio: 6 / 5; object-fit: cover; } .pl-mirror { transform: scaleX(-1); } .pl-pitem .pl-thumb img.pl-3d { width: 56px; height: 47px; border-radius: 8px; }',
      '.pl-rest { align-items: center; text-align: center; gap: 6px; } .pl-rest h2 { margin: 0; font-family: var(--font-display); font-size: 34px; line-height: 1.1; } body.hi .pl-rest h2 { font-family: var(--font-hi); font-size: 28px; } .pl-rest .grid2, .pl-rest .btn.block { width: 100%; }',
      '.pl-timer.pl-rtimer, .pl-timer.pl-rtimer svg { width: 140px; height: 140px; } .pl-timer.pl-rtimer .arc { stroke: var(--h-sky); } .pl-timer.pl-rtimer .trk { stroke: var(--h-sky-soft); } .pl-timer.pl-rtimer b { font-size: 30px; }',
      '.pl-nextcard { flex-direction: row; display: flex; gap: 12px; align-items: center; } .pl-nextcard .pl-thumb { width: 108px; flex: none; border-radius: 12px; overflow: hidden; background: #EBEBEB; } .pl-nextcard .pl-thumb .pl-fig, .pl-nextcard .pl-thumb .pl-3d { width: 108px; height: auto; display: block; }',
      '.pl-nextcard .body { display: grid; gap: 2px; min-width: 0; overflow-wrap: anywhere; } .pl-nextcard .body > span:last-child { font-size: 14px; } .pl-sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }',
      '.pl-timer { position: relative; width: 120px; height: 120px; margin: 4px auto 0; } .pl-timer svg { width: 120px; height: 120px; transform: rotate(-90deg); } .pl-timer .trk { fill: none; stroke: var(--line); stroke-width: 8; }',
      '.pl-timer .arc { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; } .pl-timer b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 24px; color: var(--fg); }',
      '.pl-breath-wrap { position: relative; width: 150px; height: 150px; margin: 4px auto 0; display: grid; place-items: center; } .pl-breath { position: absolute; inset: 0; border-radius: 50%; background: var(--h-sky-soft); border: 3px solid var(--h-sky); transform: scale(0.62); transition: transform 0.25s linear; }',
      '.pl-breath-wrap b { position: relative; font-size: 17px; color: var(--fg); } .pl-left { text-align: center; } .pl-player { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; } .pl-player .item .body { min-width: 0; overflow-wrap: anywhere; }',
      /* Version 39.39 (Mohit's Flip5, 30 Oct: "fix the buttons"): Previous, Pause and Next stay above the tab bar however long the move's
         words; a short screen gets a smaller timer and the time left only once (the ring), still read out from #pl-left */
      '.pl-ctl { position: sticky; bottom: calc(74px + env(safe-area-inset-bottom, 0px)); z-index: 2; padding: 6px 0; margin: -6px 0; background: var(--bg); box-shadow: 0 -10px 10px -8px var(--bg); } @media (min-width: 600px) { .pl-ctl { bottom: calc(90px + env(safe-area-inset-bottom, 0px)); } }',
      '@media (max-height: 860px) { .pl-player { gap: 8px; } .pl-timer, .pl-timer svg { width: 100px; height: 100px; } .pl-breath-wrap { width: 120px; height: 120px; } .pl-left { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; } } @media (max-height: 720px) { .pl-figbox { max-width: 220px; } }',
      '.pl-chart { width: 100%; height: auto; display: block; } .pl-chart .gd { stroke: var(--line); stroke-width: 1; } .pl-chart .bar { fill: var(--accent); opacity: 0.4; } .pl-chart .bar.met { fill: var(--accent-strong); opacity: 1; } .pl-chart .tg { stroke: var(--gold); stroke-width: 2.5; stroke-linecap: round; } .pl-chart text { fill: var(--muted); font-size: 11px; }',
      '.pl-legend { display: inline-flex; align-items: center; gap: 6px; } .pl-legend i.tg { display: inline-block; width: 14px; height: 3px; border-radius: 2px; background: var(--gold); }',
      '.pl-mini .card { gap: 4px; } .pl-mini .pl-big, .pl-big { font-size: 22px; color: var(--fg); }',
      '.pl-energy { display: flex; flex-wrap: wrap; gap: 6px; } .pl-en { display: grid; gap: 0; text-align: center; padding: 6px 10px; border-radius: 12px; background: var(--card-2); min-width: 64px; } .pl-en.low { background: var(--h-orange-soft); } .pl-en.ok { background: var(--h-gold-soft); } .pl-en.good { background: var(--h-green-soft); } .pl-en b { color: var(--fg); font-size: 14px; }',
      '.pl-tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; } .pl-tl li { display: grid; gap: 2px; padding: 8px 12px; border-left: 4px solid var(--line); } .pl-tl li.past { border-color: var(--ok); } .pl-tl li.now { border-color: var(--accent); background: var(--accent-soft); border-radius: 0 12px 12px 0; } .pl-tl strong { color: var(--fg); }',
      '.pl-review .chips { margin: 4px 0 8px; } .pl-review h3 { margin: 0; }',
      '.pl-cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } .pl-cmp > div { display: grid; gap: 2px; padding: 10px 12px; border-radius: 14px; background: var(--card-2); min-width: 0; } .pl-cmp > div.now { background: var(--accent-soft); }',
      '.pl-cmp strong { font-size: 18px; color: var(--fg); overflow-wrap: anywhere; } .pl-chart .fut { fill: none; stroke: var(--line); stroke-width: 1.5; stroke-dasharray: 3 3; }',
      '.pl-sec { display: grid; gap: 10px; } .pl-rec, .pl-now { border-left: 5px solid var(--hue, var(--accent)); } .pl-rec .body, .pl-now .body { display: grid; gap: 3px; min-width: 0; }',
      '.pl-why { color: var(--fg); } .pl-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; } .pl-now .pl-ring { width: 64px; height: 64px; } .pl-routine.done { border-color: var(--ok); background: var(--ok-soft); }',
      '.pl-rec .go, .pl-now .go, .pl-routine .go { display: inline-flex; width: 18px; height: 18px; color: var(--accent); flex: none; } .pl-rec .go svg, .pl-now .go svg, .pl-routine .go svg { width: 18px; height: 18px; }',
      '.pl-helpcard h3 { margin: 0; } .pl-picks { display: flex; flex-wrap: wrap; gap: 6px; } .pl-homerec { gap: 8px; } .pl-homerec .action { margin: 0; }',
      '.pl-rv { display: grid; gap: 12px; } .pl-rv-art .sakhi { width: 76px; height: 76px; } .pl-rv h1 { margin: 0; } .pl-rv-goal { justify-self: start; } .pl-pillar { padding: 6px 0; } .pl-doc h3 { margin: 0; }',
      '.pl-th { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 2px 0 8px; } .pl-th.pl-th-wrap { flex-wrap: wrap; row-gap: 2px; } .pl-th-wrap .pl-th-plan { flex: 1 1 100%; } .pl-th-wrap .pl-th-at { flex-basis: 100%; } .pl-th-plan { display: grid; gap: 2px; text-align: left; background: none; border: none; padding: 0; color: var(--fg); font: inherit; min-width: 0; }',
      '.pl-ci { display: grid; gap: 14px; } .pl-ci-row { display: grid; gap: 8px; } .pl-ci-row strong { color: var(--fg); } .pl-fb .lead { margin: 0; color: var(--fg); } .pl-petal { display: flex; align-items: center; gap: 6px; } .pl-petal svg { width: 18px; height: 18px; color: var(--accent); }',
      '.pl-path h3 { margin: 0; } .pl-steps { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 8px; } .pl-steps li { display: flex; gap: 10px; align-items: flex-start; } .pl-steps .body { display: grid; gap: 2px; min-width: 0; }',
      '.pl-sdot { width: 22px; height: 22px; border-radius: 11px; border: 2px solid var(--line); flex: none; display: grid; place-items: center; font-size: 12px; color: #FFFFFF; } .pl-steps li.past .pl-sdot { background: var(--ok); border-color: var(--ok); } .pl-steps li.now .pl-sdot { border-color: var(--accent); } .pl-steps li.now strong { color: var(--accent); }',
      '.pl-act.done strong { color: var(--muted); } .pl-ci-go { margin-top: 10px; } .pl-ci-ok { color: var(--ok); font-weight: 600; margin: 8px 0 0; } .pl-pick .list { margin-top: 6px; }',
      '.pl-days { display: flex; gap: 6px; align-items: flex-end; height: 90px; } .pl-dbar { flex: 1; display: grid; grid-template-rows: 1fr auto auto; justify-items: center; height: 100%; min-width: 0; } .pl-dbar i { width: 100%; max-width: 22px; align-self: end; background: var(--accent); opacity: 0.55; border-radius: 4px 4px 0 0; min-height: 2px; } .pl-dbar b { font-size: 12px; color: var(--fg); } .pl-dbar.fut i { height: 100%; background: none; opacity: 1; border: 1.5px dashed var(--line); border-bottom: none; } .pl-dbar.fut b { min-height: 1em; } .pl-first { margin-top: 8px; } .ci-sym { width: 16px; height: 16px; margin-right: 6px; flex-shrink: 0; } .face { width: 22px; height: 22px; margin-right: 6px; flex-shrink: 0; } .face circle { fill: var(--gold-soft); stroke: var(--gold); stroke-width: 1.4; } .face .fe { fill: var(--fg); stroke: none; } .face .fm { fill: none; stroke: var(--fg); stroke-width: 1.6; stroke-linecap: round; } .pl-en .face { width: 28px; height: 28px; margin: 0 0 2px; }',
      '.pl-other > summary { list-style: none; cursor: pointer; } .pl-other[open] > summary .chev { transform: rotate(90deg); }',
      '.pl-all > summary { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); cursor: pointer; padding: 6px 0; } .pl-all[open] > summary { margin-bottom: 8px; }',
      /* Version 37.1: the plan's cards, the Start screen and Today's lines */
      '.pl-rv-top { margin-bottom: 2px; } .pl-rv-sp { width: 44px; height: 44px; flex: none; } .pl-rv-len { gap: 2px; } .pl-rv-len strong { color: var(--fg); font-size: 17px; }',
      '.pl-rv-how { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; } .pl-rv-how li { display: flex; gap: 12px; align-items: flex-start; color: var(--fg); }',
      '.pl-rv-n { width: 28px; height: 28px; border-radius: 14px; flex: none; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-strong); font-weight: 700; font-size: 14px; }',
      '.pl-rv-steps .body > span { color: var(--fg); } .pl-rv-aud, .pl-soon .btn { align-self: flex-start; justify-self: start; } .pl-st-rem { display: flex; gap: 8px; align-items: flex-start; margin: 0; color: var(--fg); } .pl-st-rem svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; color: var(--accent); }',
      '.pl-th-y { margin: -2px 0 4px; color: var(--fg); } .pl-th-at { color: var(--muted); white-space: nowrap; } .pl-soon h3, .pl-pend h3 { margin: 0; }',
      '.pl-sum .body { display: grid; gap: 2px; min-width: 0; } .pl-sum .body > span { font-size: 13px; color: var(--muted); } .pl-sum .body strong { overflow-wrap: anywhere; }',
      '.pl-ci-first { color: var(--fg); } .pl-ci-next { color: var(--fg); font-weight: 600; }',
      '.pl-per p { margin: 0; color: var(--fg); } .pl-fin-doc .row { gap: 8px; }',
      '.pl-add-h { display: block; margin-top: 8px; }',
      /* Version 39.5: one page for every plan */
      '.pl-clock { margin-top: -6px; } .pl-trow .item { min-height: 56px; } .pl-trow + .pl-ci-go { margin-top: -4px; } .pl-addmin { margin-top: 8px; }',
      '.pl-day i.rest { background: var(--soft, #F3EEF1); border: 1.5px dashed var(--line); } .pl-tile .small { color: var(--muted); }',
      '.pl-hero-week .pl-mfig { width: 64px; flex-shrink: 0; } .pl-past p, .pl-chg p { margin: 4px 0 0; } .pl-chg .row, .pl-pausecard .btn { margin-top: 8px; gap: 8px; }',
      '.pl-th-rest { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 6px; } .pl-pain { display: grid; gap: 6px; margin: 4px 0 8px; } .pl-pain p { margin: 0; color: var(--fg); } .pl-pain-a { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; } .pl-pain-a .btn { min-height: 44px; } .pl-carry { display: grid; gap: 6px; margin: 2px 0 8px; padding: 10px 12px; border-radius: 14px; background: var(--accent-soft); } .pl-carry p { margin: 0; color: var(--fg); } .pl-carry strong { display: block; } .pl-rest-b { margin-bottom: 10px; }',
      /* Version 39.12: plan follow-through */
      '.pl-th-str { font-weight: 600; } .pl-ci-date { margin-top: -4px; }',
      '.pl-ci-pre .body { display: grid; gap: 2px; min-width: 0; } .pl-ci-pre .pl-ci-ok { margin: 0; display: inline-flex; align-items: center; gap: 6px; } .pl-ci-pre .ci-sym { width: 14px; height: 14px; flex: none; }',
      '.pl-ci-edit { justify-self: start; margin-top: -4px; } .pl-ci-goal { margin: 0; color: var(--fg); } .pl-ci-why { margin: 0; color: var(--fg); } .pl-ci-str, .pl-ci-tomr { color: var(--fg); margin: 0; }',
      '.pl-wp h3 { margin: 0; } .pl-wp-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }',
      '.pl-wp-d { display: grid; gap: 2px; justify-items: center; align-content: center; min-height: 56px; padding: 6px 0; border-radius: 14px; border: 1.5px solid var(--line); background: var(--card); color: var(--fg); font: inherit; min-width: 0; }',
      '.pl-wp-d span { font-size: 12px; color: var(--muted); } .pl-wp-d b { font-size: 16px; } .pl-wp-d.on { background: var(--accent); border-color: var(--accent); color: #FFFFFF; } .pl-wp-d.on span { color: #FFFFFF; } .pl-wp-d:disabled { opacity: 0.45; }',
      '.pl-wp-q { display: block; margin-top: 10px; color: var(--fg); } .pl-wp-ifs { margin-top: 6px; } .pl-wp-if.on { border-color: var(--ok); background: var(--ok-soft); } .pl-wp-sum { color: var(--fg); font-weight: 600; } .pl-wp-same, .pl-mc-not { justify-self: center; align-self: center; }',
      '.pl-nudge-n { margin-top: -4px; }',
      '.pl-mc { display: grid; gap: 12px; } .pl-mc-q { display: grid; gap: 6px; } .pl-mc-l { font-weight: 600; color: var(--fg); } .pl-mc-opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; } .pl-mc-opts .chip { justify-content: center; min-height: 44px; min-width: 0; }',
      '.pl-mc-c.better.on { background: var(--ok-soft); border-color: var(--ok); color: var(--fg); } .pl-mc-c.worse.on { background: var(--h-orange-soft); border-color: var(--h-orange); color: var(--fg); }',
      '.pl-mc-meas label { display: grid; gap: 4px; font-size: 14px; font-weight: 600; min-width: 0; } .pl-mc-rh { margin: 0; }',
      '.pl-mc-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; text-align: center; } .pl-mc-tile { display: grid; gap: 2px; padding: 10px 6px; border-radius: 14px; background: var(--hue-soft, var(--card-2)); } .pl-mc-tile strong { font-size: 22px; color: var(--fg); }',
      '.pl-mc-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); } .pl-mc-row:last-child { border-bottom: none; } .pl-mc-v { color: var(--fg); text-align: right; } .pl-mc-v.better { color: var(--ok); }',
      '.pl-mc-note p, .pl-mc-hist p { margin: 0; } .pl-mc-worse .row, .pl-mc-end .btn { margin-top: 8px; } .pl-mc-end h3 { margin: 0; }',
      '.pl-sl-quiet h3 { margin: 0; } .pl-q-opts { display: grid; gap: 10px; margin: 8px 0; } .pl-q-opt { border-radius: 18px; background: var(--hue-soft, var(--card)); border: none; text-align: left; width: 100%; }',
      '.pl-q-opt .ico-sm, .pl-q-fam .ico-sm { background: var(--card); } .pl-q-fam { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--hue-soft, var(--card)); } .pl-q-famh { gap: 12px; align-items: center; flex-wrap: nowrap; }',
      '.pl-ci-add { color: var(--fg); margin: 0; }',
      /* Version 39.13: on a narrow phone her 4 steps fit above the tab bar; the bedtime tip stays on My plan */
      /* Version 39.14: Today's checklist (the rows are the core's .today-chk), her week's dots, the day that closes itself, "Why?" */
      '.pl-d7 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; text-align: center; margin: 0 0 4px; }',
      '.pl-d7d { display: grid; justify-items: center; gap: 2px; font-size: 11px; line-height: 13px; color: var(--muted); min-width: 0; } .pl-d7d.now { color: var(--accent); font-weight: 700; }',
      '.pl-d7d i { width: 22px; height: 22px; border-radius: 11px; background: var(--line); display: grid; place-items: center; color: #FFFFFF; box-sizing: border-box; } .pl-d7d i svg { width: 12px; height: 12px; }',
      '.pl-d7d i.full { background: var(--ok); } .pl-d7d i.some { background: var(--ok-soft); box-shadow: inset 0 0 0 2px var(--ok); } .pl-d7d i.rest { background: transparent; border: 1.5px dashed var(--muted); } .pl-d7d i.str { background: var(--h-gold-soft); color: var(--h-gold); }',
      '.pl-d7d.now i { box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--accent); } .pl-d7d.now i.some { box-shadow: inset 0 0 0 2px var(--ok), 0 0 0 2px var(--card), 0 0 0 4px var(--accent); }',
      '.pl-night-day { display: flex; align-items: center; gap: 10px; margin: 2px 0 4px; padding: 8px 12px; border-radius: 14px; background: #2F2240; color: #FFFFFF; } .pl-night-day svg { width: 20px; height: 20px; flex-shrink: 0; color: #F3D99B; } .pl-night-day strong { display: block; font-size: 15px; line-height: 1.3; } .pl-night-day span span { display: block; font-size: 13px; line-height: 1.35; color: #E4DCEC; }' +
      '.pl-t7 { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; min-width: 0; } .pl-t7 .pl-t4-n { margin-left: auto; } .pl-d7.mini { display: flex; gap: 7px; } .pl-d7.mini .pl-d7d i { width: 16px; height: 16px; border-radius: 8px; } .pl-d7.mini .pl-d7d.now i { box-shadow: 0 0 0 2px var(--card), 0 0 0 3.5px var(--accent); } .pl-d7.mini .pl-d7d.now i.some { box-shadow: inset 0 0 0 2px var(--ok), 0 0 0 2px var(--card), 0 0 0 3.5px var(--accent); }',
      '.pl-wk { display: grid; gap: 4px; } .pl-wl { margin: 0; color: var(--fg); } .today-card .pl-th { margin: 0; } .today-card .pl-d7 { margin: 0; } .today-card .pl-t4 { margin: 0; }',
      '.pl-t4 { display: flex; align-items: center; gap: 10px; margin: 2px 0 4px; } .pl-t4-bar { flex: 1; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 4px; } .pl-t4-bar i { height: 8px; border-radius: 4px; background: var(--line); }',
      '.pl-t4-bar i.on { background: var(--ok); } .pl-t4-bar i.half { background: var(--ok-soft); box-shadow: inset 0 0 0 1.5px var(--ok); } .pl-t4-n { color: var(--fg); font-weight: 600; margin: 0; }',
      '.pl-dc { display: flex; align-items: center; gap: 14px; margin: 2px 0 4px; } .pl-dc-ic { width: 52px; height: 52px; border-radius: 26px; background: var(--ok); color: #FFFFFF; display: grid; place-items: center; flex: none; } .pl-dc-ic svg { width: 28px; height: 28px; }',
      '.pl-dc-t { display: grid; gap: 2px; min-width: 0; } .pl-dc-t strong { font-size: 22px; line-height: 1.15; color: var(--fg); } .pl-dc-t .small { margin: 0; } .pl-dc-goal { margin: 0 0 4px; color: var(--fg); font-weight: 600; }',
      '.pl-dc-tom { display: grid; gap: 2px; padding: 10px 12px; border-radius: 14px; background: var(--card-2); color: var(--fg); margin: 2px 0 4px; } .pl-dc-how { justify-self: center; align-self: center; }',
      '.pl-th-rev { display: grid; gap: 6px; margin: 2px 0 8px; padding: 10px 12px; border-radius: 16px; background: var(--card-2); } .pl-rev-row { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: none; min-height: 52px; } .pl-rev-row .body { flex: 1; min-width: 0; display: grid; gap: 2px; } .pl-rev-row .body strong { color: var(--fg); } .pl-rev-row .body span { font-size: 13px; color: var(--muted); } .pl-rev-row .pill { flex: none; } .pl-th-rev.ok { background: var(--ok-soft); } .pl-rev-l { margin: 0; color: var(--fg); } .pl-rev-c { flex-wrap: nowrap; } .pl-rev-c .chip { flex: 1; justify-content: center; min-width: 0; }',
      '.pl-bdm { display: grid; gap: 4px; padding: 10px 12px; border-radius: 14px; background: var(--card-2); } .pl-bdm .small { margin: 0; }',   /* Version 39.32: her doctor month in "Your 12 weeks" */
      '.pl-t-undo { margin: 2px 0 0; text-align: center; } .pl-t-ci { margin-top: 8px; } .pl-t-at { margin: 4px 0 0; text-align: center; color: var(--muted); } .pl-t-ok { color: var(--ok); font-weight: 600; }',
      '.pl-why-sh { display: grid; gap: 6px; } .pl-why-top { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; } .pl-why-top h2 { margin: 0; min-width: 0; overflow-wrap: anywhere; }',
      '.pl-why-p { margin: 0 0 8px; color: var(--fg); font-size: 17px; line-height: 1.45; } .pl-why-how { margin: 0 0 8px; color: var(--fg); } .pl-why-ex { display: grid; gap: 4px; padding: 12px; border-radius: 14px; background: var(--card-2); } .pl-why-ex p { margin: 0; }',
      /* Version 39.15: My plan */
      '.pl-rh { gap: 8px; } .pl-rh-g { display: grid; gap: 6px; text-align: center; } .pl-rh-c { display: grid; justify-items: center; align-content: start; gap: 3px; min-width: 0; } .pl-rh-c i { width: 12px; height: 12px; border-radius: 6px; background: var(--line); } .pl-rh-c i.on { background: var(--accent); } .pl-rh-c strong { font-size: 13px; line-height: 1.25; color: var(--fg); } .pl-rh-c .small { margin: 0; line-height: 1.3; } .pl-rh-c > * { max-width: 100%; overflow-wrap: anywhere; }',
      '.pl-steps-card { gap: 10px; } .pl-steps-h { flex-wrap: wrap; gap: 2px 10px; } .pl-steps-h h3 { margin: 0; } .pl-step .body > * { min-width: 0; overflow-wrap: anywhere; } .pl-step { align-items: flex-start; padding-top: 10px; padding-bottom: 10px; cursor: pointer; } .pl-step .body { flex: 1; min-width: 0; display: grid; gap: 3px; } .pl-step .body strong { overflow-wrap: anywhere; }',
      '.pl-step-why { font-size: 14px; line-height: 1.4; color: var(--text); } .pl-step-how { justify-self: start; padding: 0; min-height: 0; font-size: 13px; } .pl-steps-same { margin: 0; text-align: center; } .pl-st-start, .pl-st-play { flex: none; align-self: center; white-space: nowrap; gap: 6px; } .pl-st-start svg, .pl-st-play svg { width: 16px; height: 16px; flex: none; } .pl-step .today-tick, .pl-step .today-open { align-self: center; }',
      '.pl-wkc { gap: 8px; } .pl-wkc h3 { margin: 0; } .pl-wkc .row, .pl-signs .pl-mc-row { flex-wrap: wrap; gap: 2px 10px; } .pl-r7 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; text-align: center; } .pl-r7d { display: grid; justify-items: center; gap: 3px; font-size: 12px; color: var(--muted); min-width: 0; } .pl-r7d.now { color: var(--accent); font-weight: 700; }',
      '.pl-r4 { width: 34px; height: 34px; } .pl-r4 .s { fill: none; stroke-width: 5; stroke: var(--line); } .pl-r4 .s.d { stroke: var(--ok); } .pl-r4 .s.p { stroke: var(--ok-soft); } .pl-r7d.fut .pl-r4 .s { stroke: var(--card-2); } .pl-r4 .s.r { stroke: var(--muted); stroke-dasharray: 2 3; }',
      '.pl-r7d.now .pl-r4 { border-radius: 50%; box-shadow: 0 0 0 2px var(--accent); } .pl-r7s { height: 14px; display: grid; place-items: center; color: var(--h-gold); } .pl-r7s svg { width: 12px; height: 12px; }',
      '.pl-wk-leg { margin: 0; } .pl-wk-line { margin: 0; color: var(--fg); font-weight: 600; } .pl-wk-min { display: grid; gap: 6px; } .pl-wk-min .small { margin: 0; } .pl-wk-bar { display: block; height: 8px; border-radius: 4px; background: var(--line); overflow: hidden; } .pl-wk-bar i { display: block; height: 100%; background: var(--h-purple); border-radius: 4px; }',
      '.pl-cons { gap: 8px; } .pl-cons h3 { margin: 0; } .pl-cons .pl-tl { margin: 0; } .pl-signs { display: grid; } .pl-cons p { margin: 0; }',
      '.pl-ci-feel { gap: 8px; }',
      /* Version 39.19: folded cards on My plan */
      '.pl-fold > details > summary { list-style: none; display: flex; align-items: center; gap: 10px; cursor: pointer; min-height: 40px; } .pl-fold > details > summary::-webkit-details-marker { display: none; } .pl-fold-t { flex: 1; min-width: 0; display: grid; gap: 2px; overflow-wrap: anywhere; } .pl-fold-t strong { color: var(--fg); font-size: 16px; } .pl-fold-t .small { margin: 0; }',
      '.pl-fold-c { display: inline-flex; flex-shrink: 0; width: 18px; height: 18px; color: var(--accent); transition: transform .2s; } .pl-fold-c svg { width: 18px; height: 18px; } .pl-fold > details[open] > summary .pl-fold-c { transform: rotate(90deg); } .pl-fold-in { display: grid; gap: 8px; margin-top: 12px; } .pl-fold-in .pl-tl { margin: 0; }',
      '.pl-path-more > summary { list-style: none; cursor: pointer; padding: 8px 0; min-height: 40px; } .pl-path-more > summary::-webkit-details-marker { display: none; } .pl-path-more[open] > summary { margin-bottom: 4px; }',
      '.pl-why-fast { justify-self: start; margin-top: 4px; } .pl-why-b { margin-top: 8px; } .pl-why-wide { grid-column: 1 / -1; } .pl-why-more { justify-self: center; }',
      '.pl-q-fam .body { display: grid; gap: 2px; min-width: 0; } .pl-q-msg { margin: 0; padding: 12px 14px; border-radius: 14px; background: var(--card); color: var(--fg); } .pl-q-fam textarea { width: 100%; box-sizing: border-box; font: inherit; }',
      /* Version 39.22: a calmer My plan, tonight's wind-down, Moves and calm */
      '.pl-head { display: flex; align-items: center; gap: 10px; } .pl-head > :first-child { flex: 1; min-width: 0; } .pl-gear { flex-shrink: 0; } .pl-howlink { display: inline; min-height: 0; padding: 0; font-size: inherit; vertical-align: baseline; }',
      '.pl-steps-card .pl-step { background: transparent; box-shadow: none; border-radius: 0; padding: 10px 0; } .pl-steps-card .pl-step + .pl-step { border-top: 1px solid var(--line); } .pl-steps-card .list { gap: 0; }',
      '.pl-step-sub { font-size: 13px; color: var(--muted); line-height: 1.35; } .pl-steps-f { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; } .pl-steps-f .pl-t-at { margin: 0; }',
      '.pl-st-play, .today-start.night { background: #2F2240; color: #FFFFFF; border-color: #2F2240; padding: 0 10px; gap: 4px; } .pl-st-play svg, .today-start.night svg { width: 14px; height: 14px; }',
      '.pl-tiles4 { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; } .pl-tiles4 .pl-tile { justify-items: center; text-align: center; padding: 10px 4px; gap: 6px; min-height: 84px; align-content: center; } .pl-tiles4 .pl-tile strong { font-size: 13px; line-height: 1.25; overflow-wrap: anywhere; hyphens: auto; -webkit-hyphens: auto; } .pl-tiles4 .pl-tile .small { font-size: 12px; margin-top: -4px; }',
      '.pl-wkc .pl-garden-in { border-top: 1px solid var(--line); border-radius: 0; box-shadow: none; padding: 10px 0 0; background: transparent; } .pl-wp-link { display: inline-flex; align-items: center; gap: 2px; min-height: 0; padding: 0; } .pl-wp-link svg { width: 16px; height: 16px; }',
      '.pl-kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; margin: 0; font-size: 14px; } .pl-kv dt { color: var(--muted); } .pl-kv dd { margin: 0; color: var(--fg); font-weight: 600; } .pl-wk-stage { margin: 0; } .pl-cons-in { display: grid; gap: 8px; margin-top: 8px; }',
      '.pl-night { background: linear-gradient(160deg, #2A1F45 0%, #1B1530 100%); color: #F4ECF6; } .pl-night h3 { color: #FFFFFF; margin: 0; } .pl-night .small { color: #D9CCE4; } .pl-night-h { gap: 10px; align-items: center; } .pl-night-i { width: 40px; height: 40px; border-radius: 20px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(242,167,203,0.16); color: #F2A7CB; } .pl-night-i svg { width: 22px; height: 22px; }',
      '.pl-night-a { background: #F2A7CB; color: #2A1430; border: none; } .pl-night-b { background: rgba(255,255,255,0.08); color: #FFFFFF; border-color: rgba(255,255,255,0.22); } .pl-night-a svg, .pl-night-b svg { width: 16px; height: 16px; }',
      '.pl-ci-slp { display: grid; gap: 6px; margin-top: 8px; } .pl-ci-slp-h { color: var(--fg); font-weight: 500; }',
      '.pl-ms-n { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; } .pl-ms-n .chip { justify-content: center; min-height: 44px; padding: 0; font-variant-numeric: tabular-nums; } .pl-ms-ends { margin-top: 4px; } .pl-ci-ms-q { margin: 6px 0 10px; }',   /* Version 39.51: her weekly number, 0 to 10 */
      '.pl-seg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; background: var(--card-2); border-radius: 16px; padding: 4px; } .pl-seg-b { min-height: 44px; border-radius: 12px; border: none; background: transparent; color: var(--muted); font: inherit; font-weight: 600; } .pl-seg-b.on { background: var(--card); color: var(--fg); box-shadow: var(--shadow); }'
    ].join('\n')
  });
})(window.Saathi);
