/* Petal garden: gentle rewards that bring her back. A petal for each kind thing she does for herself (up to 3 a day; 12 make the
   month's flower, a different Indian flower each month), a daily "Sach ya Myth?" card she can send to a friend, a few badges, and
   weeks-in-a-row that never shames a missed week. Petals count what kind of thing she did, never what she logged, and nothing
   here is a score of her health. Celebrations stay quiet on screens about loss, abortion, violence or emergencies, and after a
   check-in that raised a red flag. */
(function (S) {
  'use strict';
  /* Version 39.68 (the doctors' review, 5 Nov 2026): My garden and its petals are gone; Sach ya Myth?, Did you know? and the
     reading ticks stay */
  const GARDEN = false;
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx;
  const PER_DAY = 3, PER_MONTH = 12, QUIZ_PER_DAY = 5;
  const KINDS = ['log', 'quiz', 'read', 'tool', 'checkin', 'ask', 'share'];
  const D = () => { const d = S.data('joy'); d.days = d.days || {}; d.reads = d.reads || {}; d.quiz = d.quiz || {}; d.qday = d.qday || {}; d.badges = d.badges || {}; d.shares = d.shares || 0; return d; };
  const todayISO = () => S.toISO(S.today());
  const monthIdx = (mk) => parseInt(mk.slice(5, 7), 10) - 1;
  const monthName = (m) => (t('months') || [])[m] || '';

  /* ---------- petals ---------- */
  const dayPetals = (d, day) => Math.min(PER_DAY, (d.days[day] || []).filter((k) => KINDS.indexOf(k) >= 0).length);
  function monthPetals(d, mk) { let n = 0; Object.keys(d.days).forEach((day) => { if (day.slice(0, 7) === mk) n += dayPetals(d, day); }); return Math.min(PER_MONTH, n); }
  function monthsTouched(d) { const m = {}; Object.keys(d.days).forEach((day) => { m[day.slice(0, 7)] = 1; }); return Object.keys(m); }
  const totalPetals = (d) => monthsTouched(d).reduce((a, mk) => a + monthPetals(d, mk), 0);
  const anyBloom = (d) => monthsTouched(d).some((mk) => monthPetals(d, mk) >= PER_MONTH);
  const blooms = (d) => monthsTouched(d).filter((mk) => monthPetals(d, mk) >= PER_MONTH).length;

  /* ---------- weeks in a row (Monday to Sunday); the current week counts once she earns a petal in it ---------- */
  const weekStart = (dt) => { const x = new Date(dt); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  function activeWeeks(d) { const a = {}; Object.keys(d.days).forEach((day) => { if (dayPetals(d, day) > 0) a[S.toISO(weekStart(S.fromISO(day)))] = 1; }); return a; }
  function streak(d) {
    const a = activeWeeks(d); let wk = weekStart(S.today()); let n = 0;
    if (!a[S.toISO(wk)]) wk = S.addDays(wk, -7);
    while (a[S.toISO(wk)]) { n++; wk = S.addDays(wk, -7); }
    return n;
  }
  function checkinRun() {
    let best = 0, run = 0, prev = null;
    Object.keys(S.state.checkins || {}).sort().forEach((k) => { const idx = +k.slice(0, 4) * 12 + +k.slice(5, 7); run = prev != null && idx === prev + 1 ? run + 1 : 1; prev = idx; if (run > best) best = run; });
    return best;
  }

  /* ---------- badges ---------- */
  const BADGES = [
    { id: 'first', icon: 'sparkle', hue: 'rose', ok: (d) => totalPetals(d) >= 1 },
    { id: 'fullday', icon: 'clock', hue: 'purple', ok: (d) => Object.keys(d.days).some((day) => dayPetals(d, day) >= PER_DAY) },
    { id: 'bloom', icon: 'flower', hue: 'orange', ok: (d) => anyBloom(d) },
    { id: 'trio', icon: 'leaf', hue: 'green', ok: (d) => blooms(d) >= 3, prog: (d) => [blooms(d), 3] },
    { id: 'diary', icon: 'diary', hue: 'sky', ok: () => S.cycle.starts().length >= 3, prog: () => [S.cycle.starts().length, 3] },
    { id: 'months', icon: 'check', hue: 'teal', ok: () => checkinRun() >= 3, prog: () => [checkinRun(), 3] },
    { id: 'curious', icon: 'learn', hue: 'rose', ok: (d) => Object.keys(d.reads).length >= 5, prog: (d) => [Object.keys(d.reads).length, 5] },
    { id: 'myth', icon: 'help', hue: 'purple', ok: (d) => Object.keys(d.quiz).length >= 10, prog: (d) => [Object.keys(d.quiz).length, 10] },
    { id: 'friend', icon: 'users', hue: 'plum', ok: (d) => d.shares >= 1 },
    { id: 'planner', icon: 'bell', hue: 'gold', ok: () => S.reminders.list().length >= 1 },
    { id: 'steady', icon: 'heart', hue: 'green', ok: (d) => streak(d) >= 4, prog: (d) => [streak(d), 4] },
    { id: 'brave', icon: 'person', hue: 'teal', ok: () => (S.state.leads || []).length >= 1 }
  ];
  /* Stamp newly earned badges with today's date; returns the new ones. */
  function stamp(d) { const out = []; BADGES.forEach((b) => { if (!d.badges[b.id] && S.canSave() && b.ok(d)) { d.badges[b.id] = todayISO(); out.push(b); } }); return out; }

  /* ---------- Sach ya Myth? cards (humanized in Dr. Megha's voice; facts match the guides in the other modules) ---------- */
  const C = (id, a, tags, art, go, sEn, sHi, wEn, wHi) => ({ id: id, a: a, tags: tags, art: art, go: go, s: { en: sEn, hi: sHi }, w: { en: wEn, hi: wHi } });
  const CARDS = [
    C('bath', false, ['cycle', 'teen'], 'periods', 'periods-myths', 'You should not bathe or wash your hair during your period.', 'पीरियड में नहाना या बाल धोना नहीं चाहिए।',
      'A warm bath is safe during your period and keeps you fresh. The warm water can even ease cramps.', 'पीरियड में गुनगुने पानी से नहाना सुरक्षित है और आप तरोताज़ा रहती हैं। गुनगुना पानी ऐंठन में आराम भी दे सकता है।'),
    C('exercise', false, ['cycle', 'teen'], 'periods', 'periods-pain', 'Exercise makes period pain worse.', 'कसरत करने से पीरियड का दर्द बढ़ता है।',
      'Gentle movement like walking, stretching or yoga often eases cramps. On a bad day, rest, and try a short walk when you feel up to it.', 'हल्की हलचल, जैसे टहलना, स्ट्रेचिंग या योग, अक्सर ऐंठन कम करती है। ज़्यादा तकलीफ़ वाले दिन आराम करें, और मन हो तो थोड़ा टहल लें।'),
    C('pickle', false, ['cycle', 'teen'], 'periods', 'periods-myths', 'Touching pickle during your period will spoil it.', 'पीरियड में अचार छूने से वह ख़राब हो जाता है।',
      'Pickle spoils when moisture or germs get into the jar. Your touch during your period does not spoil it. Following the custom is your choice, but there is no health reason behind it.', 'अचार तब ख़राब होता है जब बरनी में नमी या कीटाणु चले जाएँ। पीरियड में आपके छूने से वह ख़राब नहीं होता। रिवाज़ मानना आपकी मर्ज़ी है, पर इसके पीछे सेहत का कोई कारण नहीं है।'),
    C('gap', true, ['cycle'], 'periods', 'diary', 'For adults, a gap of 21 to 35 days between periods is usual.', 'वयस्क महिलाओं में दो पीरियड के बीच 21 से 35 दिन का अंतर आम है।',
      'Count from the first day of one period to the first day of the next. In the first few years after periods start, gaps up to 45 days are common too.', 'एक पीरियड के पहले दिन से अगले पीरियड के पहले दिन तक गिनें। पीरियड शुरू होने के पहले कुछ सालों में 45 दिन तक का अंतर भी आम है।'),
    C('impure', false, ['cycle', 'teen'], 'periods', 'periods-myths', 'Period blood is dirty blood that the body throws out.', 'पीरियड का खून गंदा खून है जिसे शरीर बाहर निकालता है।',
      "Period blood is ordinary blood mixed with the lining of the womb. It is not dirty and not poison. A period that stops is not \"bad blood stuck inside\": it needs a check-up.", "पीरियड का ख़ून आम ख़ून है जिसमें गर्भाशय की परत मिली होती है। यह न गंदा है, न ज़हर। पीरियड रुकने का मतलब \"गंदा ख़ून अंदर रुकना\" नहीं है: इसके लिए जाँच ज़रूरी है।"),
    C('pad', true, ['cycle', 'teen'], 'periods', 'periods-products', 'Changing your pad every 4 to 6 hours helps prevent infection.', 'हर 4 से 6 घंटे में pad बदलने से इन्फ़ेक्शन से बचाव होता है।',
      'Change sooner if it feels full or wet. Wash your hands before and after, and wrap the used pad in paper before you throw it away.', 'भरा या गीला लगे तो पहले ही बदल लें। पहले और बाद में हाथ धोएँ, और इस्तेमाल किया pad काग़ज़ में लपेटकर फेंकें।'),
    C('heavy', false, ['cycle', 'meno'], 'periods', 'help', 'Soaking through a pad every 1 to 2 hours is normal on a heavy day.', 'भारी दिन में हर 1 से 2 घंटे में pad भीग जाना सामान्य है।',
      'That much bleeding is a reason to see a doctor this week. If you also feel dizzy or faint, go to the nearest hospital now.', 'इतनी ब्लीडिंग हो तो इसी हफ़्ते डॉक्टर को दिखाएँ। साथ में चक्कर या बेहोशी लगे तो अभी सबसे पास के अस्पताल जाएँ।'),
    C('periodpreg', false, ['cycle'], 'contra', 'contra', 'You cannot get pregnant during your period.', 'पीरियड के दौरान गर्भ नहीं ठहर सकता।',
      'It is less likely, but it can happen, especially if your cycles are short. Sperm can live inside the body for up to 5 days.', 'संभावना कम है, पर हो सकता है, ख़ासकर अगर आपका चक्र छोटा है। शुक्राणु शरीर के अंदर 5 दिन तक ज़िंदा रह सकते हैं।'),
    C('pppreg', true, ['post'], 'contra', 'post-contra', 'After a birth, you can get pregnant again before your periods come back.', 'डिलीवरी के बाद पीरियड लौटने से पहले भी दोबारा गर्भ ठहर सकता है।',
      'Your body can release an egg before the first period returns. Choose a method by 6 weeks after the birth. Many are free and safe while breastfeeding.', 'पहला पीरियड आने से पहले भी शरीर अंडा छोड़ सकता है। डिलीवरी के 6 हफ़्ते तक कोई तरीक़ा चुन लें। कई तरीक़े मुफ़्त हैं और दूध पिलाते समय भी सुरक्षित हैं।'),
    C('ec', true, ['cycle', 'post'], 'contra', 'contra-ec', 'The emergency pill works best when taken as soon as possible.', 'इमरजेंसी गोली जितनी जल्दी ली जाए, उतना अच्छा असर करती है।',
      'Take it within 72 hours of unprotected sex, and sooner is better. It is not for regular use, and it does not protect against infections.', 'असुरक्षित संबंध के 72 घंटे के अंदर लें, और जितनी जल्दी हो उतना अच्छा। यह रोज़ इस्तेमाल के लिए नहीं है, और इन्फ़ेक्शन से नहीं बचाती।'),
    C('cut', false, ['cycle', 'post'], 'contra', 'contra-m-cut', 'A Copper-T makes it hard to get pregnant later.', 'Copper-T लगवाने से बाद में गर्भ ठहरना मुश्किल हो जाता है।',
      'Fertility comes back soon after a doctor takes it out. It is free at government hospitals and lasts 5 to 10 years, depending on the type.', 'डॉक्टर के निकालने के बाद जल्दी ही गर्भ ठहरने की क्षमता लौट आती है। यह सरकारी अस्पतालों में मुफ़्त है और प्रकार के हिसाब से 5 से 10 साल चलता है।'),
    C('condom', true, ['cycle', 'post'], 'contra', 'contra-m-condom', 'Condoms protect against both pregnancy and infections like HIV.', 'कंडोम गर्भ और HIV जैसे इन्फ़ेक्शन, दोनों से बचाता है।',
      'Used every time and the right way, condoms are the only method that does both. They are free at government health centres.', 'हर बार और सही तरीक़े से इस्तेमाल करें तो कंडोम अकेला तरीक़ा है जो दोनों से बचाता है। यह सरकारी स्वास्थ्य केंद्रों पर मुफ़्त मिलता है।'),
    C('pmospreg', false, ['pmos', 'cycle'], 'cond', 'topic-cond', 'Women with PMOS can never get pregnant.', 'PMOS वाली महिलाओं को कभी गर्भ नहीं ठहर सकता।',
      "Many women with PMOS (also called PCOS) get pregnant, some on their own and some with a doctor's help. Doctors have good treatments that help the ovaries release an egg.", 'PMOS (जिसे PCOS भी कहते हैं) वाली बहुत-सी महिलाओं को गर्भ ठहरता है, कुछ को अपने आप और कुछ को डॉक्टर की मदद से। डॉक्टरों के पास अच्छे इलाज हैं जो ओवरी से अंडा निकलने में मदद करते हैं।'),
    C('pmosweight', false, ['pmos', 'cycle'], 'cond', 'topic-cond', 'Only women who are overweight get PMOS.', 'PMOS सिर्फ़ ज़्यादा वज़न वाली महिलाओं को होता है।',
      'Women of any size can have PMOS. Extra weight can make the symptoms stronger, but slim women get it too.', 'किसी भी शरीर की महिला को PMOS हो सकता है। ज़्यादा वज़न से लक्षण बढ़ सकते हैं, पर दुबली महिलाओं को भी यह होता है।'),
    C('iron', true, ['preg', 'post'], 'preg', 'preg-diet', 'Iron tablets can turn your stools dark or black.', 'आयरन की गोलियों से मल (पॉटी) काला या गहरा हो सकता है।',
      'This is common and harmless. If the tablets upset your stomach, take them after food and tell your ANM or doctor.', 'यह आम है और नुक़सान नहीं करता। गोलियों से पेट ख़राब हो तो खाने के बाद लें और अपनी ANM या डॉक्टर को बताएँ।'),
    C('eattwo', false, ['preg'], 'preg', 'preg-diet', 'In pregnancy you need to eat for two.', 'गर्भ में दो लोगों जितना खाना चाहिए।',
      'Yes, you need a little more. But from the 4th month that is only about 350 extra calories a day: roughly one roti, a bowl of dal and a glass of milk.', 'हाँ, थोड़ा ज़्यादा चाहिए। पर चौथे महीने से यह सिर्फ़ रोज़ लगभग 350 calorie ज़्यादा है: लगभग एक रोटी, एक कटोरी दाल और एक गिलास दूध।'),
    C('kesar', false, ['preg'], 'preg', 'preg-diet', 'Kesar (saffron) milk makes the baby fair.', 'केसर वाला दूध पीने से बच्चा गोरा होता है।',
      "A pinch of kesar in milk is fine as food. But a baby's skin colour comes from the parents' genes, and no food changes it. Every skin colour is healthy.", 'दूध में चुटकी भर केसर खाने के रूप में ठीक है। पर बच्चे का रंग माता-पिता के जीन से आता है, और कोई खाना उसे नहीं बदलता। हर रंग सेहतमंद है।'),
    C('rest', false, ['preg'], 'preg', 'preg-week', 'A pregnant woman should stop all work and rest in bed.', 'गर्भवती महिला को सारा काम छोड़कर बिस्तर पर आराम करना चाहिए।',
      'Unless your doctor says otherwise, everyday work and a daily walk are good for you and the baby. Avoid heavy lifting, and rest when you feel tired.', 'जब तक डॉक्टर कुछ और न कहें, रोज़ का काम और रोज़ थोड़ा टहलना आपके और बच्चे के लिए अच्छा है। भारी सामान न उठाएँ, और थकान हो तो आराम करें।'),
    C('kicks', false, ['preg'], 'preg', 'help', 'If the baby moves less than usual, you can wait a few days to see.', 'बच्चे की हलचल कम लगे तो कुछ दिन रुककर देख सकती हैं।',
      'Fewer movements than usual need a check the same day. Go to your hospital, or call 102 for the free ambulance.', 'हलचल सामान्य से कम हो तो उसी दिन जाँच ज़रूरी है। अपने अस्पताल जाएँ, या मुफ़्त एम्बुलेंस के लिए 102 पर कॉल करें।'),
    C('td', true, ['preg'], 'preg', 'preg-mcp', 'The Td injection in pregnancy protects you and your baby from tetanus.', 'गर्भ में Td का टीका आपको और बच्चे को टिटनेस से बचाता है।',
      'It is free at government centres. Most women get two doses. If you had two doses in a pregnancy within the last 3 years, one booster is enough.', 'यह सरकारी केंद्रों पर मुफ़्त है। ज़्यादातर महिलाओं को दो ख़ुराक लगती हैं। अगर पिछले 3 साल के अंदर किसी गर्भ में दो ख़ुराक लगी थीं, तो एक booster काफ़ी है।'),
    C('colostrum', false, ['post', 'preg'], 'post', 'post-feed', 'The first thick yellow milk should be thrown away.', 'पहला गाढ़ा पीला दूध फेंक देना चाहिए।',
      "This first milk (colostrum) is the baby's first protection against infection. Start breastfeeding within the first hour after the birth.", 'यह पहला दूध (colostrum) बच्चे की इन्फ़ेक्शन से पहली सुरक्षा है। जन्म के पहले घंटे में ही दूध पिलाना शुरू करें।'),
    C('water', false, ['post', 'preg'], 'post', 'post-feed', 'A baby under 6 months needs water in the summer heat.', '6 महीने से छोटे बच्चे को गर्मी में पानी देना चाहिए।',
      'Breast milk gives a baby all the water it needs for the first 6 months, even in summer. Feed more often when it is hot.', 'पहले 6 महीने माँ का दूध बच्चे को ज़रूरत का सारा पानी देता है, गर्मी में भी। गर्मी हो तो ज़्यादा बार दूध पिलाएँ।'),
    C('lowmood', false, ['post', 'preg'], 'post', 'post-mood', 'Feeling low for more than 2 weeks after the birth is just weakness.', 'डिलीवरी के बाद 2 हफ़्ते से ज़्यादा उदासी बस कमज़ोरी है।',
      'Low mood that lasts is common after a birth, and it can be treated. Talk to your doctor, or call Tele-MANAS on 14416. It is free, at any hour.', 'डिलीवरी के बाद लंबी उदासी आम है, और इसका इलाज होता है। अपने डॉक्टर से बात करें, या Tele-MANAS को 14416 पर कॉल करें। यह मुफ़्त है, किसी भी समय।'),
    C('discharge', true, ['all', 'teen'], 'intimate', 'intimate-check', 'Some white discharge is normal.', 'थोड़ा सफ़ेद पानी आना सामान्य है।',
      'Safed pani is how the vagina keeps itself clean, and it changes through the month. See a doctor if it itches, smells bad, or turns green or grey.', 'सफ़ेद पानी से योनि अपने आप साफ़ रहती है, और यह महीने भर बदलता रहता है। खुजली हो, बदबू आए, या रंग हरा या सलेटी हो जाए तो डॉक्टर को दिखाएँ।'),
    C('douche', false, ['all', 'teen'], 'intimate', 'intimate-check', 'Washing inside the vagina with soap keeps it clean.', 'योनि के अंदर साबुन से धोने से वह साफ़ रहती है।',
      'The vagina cleans itself, and washing inside can cause infections. Wash only the outside, with plain water or a mild soap.', 'योनि अपने आप साफ़ होती है, और अंदर धोने से इन्फ़ेक्शन हो सकता है। सिर्फ़ बाहर से, सादे पानी या हल्के साबुन से धोएँ।'),
    C('cervix', true, ['cycle', 'meno', 'post'], 'screen', 'screen-cervix', 'Cervical cancer can often be prevented.', 'बच्चेदानी के मुँह (cervix) का कैंसर अक्सर रोका जा सकता है।',
      'The HPV vaccine protects girls before they ever meet the virus. A free check every 5 years from age 30 finds changes early, when they are easy to treat.', 'HPV टीका लड़कियों को वायरस के संपर्क में आने से पहले बचाता है। 30 की उम्र से हर 5 साल में मुफ़्त जाँच बदलावों को जल्दी पकड़ लेती है, जब उनका इलाज आसान होता है।'),
    C('lump', false, ['cycle', 'meno', 'post', 'preg'], 'screen', 'screen-breast', 'A breast lump that does not hurt is nothing to worry about.', 'स्तन में दर्द न करने वाली गाँठ चिंता की बात नहीं।',
      'Most lumps are not cancer, but a painless lump still needs a check. See a doctor within 2 weeks for any new lump.', 'ज़्यादातर गाँठें कैंसर नहीं होतीं, पर बिना दर्द की गाँठ की भी जाँच ज़रूरी है। कोई भी नई गाँठ हो तो 2 हफ़्ते के अंदर डॉक्टर को दिखाएँ।'),
    C('flushes', false, ['meno'], 'meno', 'meno-hrt', 'Hot flushes and poor sleep around menopause just have to be put up with.', 'मेनोपॉज़ के आसपास गर्मी के झोंके और ख़राब नींद बस सहने पड़ते हैं।',
      'Yes, they are common. But they can be treated. A cool room, light cotton clothes and less tea or coffee help some women, and a doctor can talk you through medicines.', 'हाँ, ये आम हैं। पर इनका इलाज होता है। ठंडा कमरा, हल्के सूती कपड़े और कम चाय-कॉफ़ी से कुछ महिलाओं को आराम मिलता है, और डॉक्टर दवाओं के बारे में समझा सकते हैं।'),
    C('bones', true, ['meno'], 'meno', 'meno-bones', 'Bones can get thinner after menopause.', 'मेनोपॉज़ के बाद हड्डियाँ कमज़ोर हो सकती हैं।',
      'Calcium, vitamin D, some sunlight and a daily walk help keep bones strong. Ask your doctor whether you need a bone check.', 'कैल्शियम, विटामिन D, थोड़ी धूप और रोज़ टहलना हड्डियों को मज़बूत रखने में मदद करते हैं। डॉक्टर से पूछें कि क्या आपको हड्डियों की जाँच की ज़रूरत है।'),
    C('teenirreg', true, ['teen'], 'teen', 'teen-puberty', 'Periods can be irregular for the first few years.', 'शुरू के कुछ सालों में पीरियड अनियमित हो सकते हैं।',
      'Periods can take 2 to 3 years to settle, and gaps up to 45 days are common. See a doctor if a period lasts more than 7 days or soaks a pad every 1 to 2 hours.', 'पीरियड को ठीक से सेट होने में 2 से 3 साल लग सकते हैं, और 45 दिन तक का अंतर आम है। पीरियड 7 दिन से ज़्यादा चले या हर 1 से 2 घंटे में pad भीग जाए तो डॉक्टर को दिखाएँ।'),
    C('pain', false, ['cycle', 'teen'], 'periods', 'periods-pain', 'Period pain bad enough to miss school or work every month is normal.', 'हर महीने इतना दर्द होना कि स्कूल या काम छूट जाए, सामान्य है।',
      'Some cramping is common. But pain that keeps you home from school or work is not something to put up with. A doctor can look for the cause and help.', 'थोड़ी ऐंठन आम है। पर ऐसा दर्द जो आपको स्कूल या काम से घर पर रोक दे, सहने की चीज़ नहीं है। डॉक्टर कारण खोजकर मदद कर सकते हैं।'),
    /* Version 39.7 (journey audit P3-15): the periods myths page's own myths join the deck, in its reviewed words */
    C('kitchen', false, ['cycle', 'teen'], 'periods', 'periods-myths', "A woman on her period should not enter the kitchen or touch food.", "पीरियड में महिला को रसोई में नहीं जाना चाहिए, खाना नहीं छूना चाहिए।",
      "A period does not make food unsafe. Washing your hands before cooking keeps food clean on every day of the month. If you feel tired and want a day off from the kitchen, take it because you need the rest.", "पीरियड से खाना ख़राब नहीं होता। खाना बनाने से पहले हाथ धोने से खाना साफ़ रहता है, महीने के हर दिन। थकान हो और रसोई से एक दिन की छुट्टी चाहिए, तो ज़रूर लें, क्योंकि आपको आराम चाहिए।"),
    C('temple', false, ['cycle', 'teen'], 'periods', 'periods-myths', "A period makes a woman impure, so she must stay away from the temple or puja.", "पीरियड में महिला अशुद्ध हो जाती है, इसलिए मंदिर या पूजा से दूर रहना चाहिए।",
      "Medically, a period is the womb shedding its lining each month. It is a sign of a healthy body, and nothing about it is dirty. Whether you go to a temple or do puja is a matter of your faith and your choice.", "डॉक्टरी नज़र से पीरियड हर महीने गर्भाशय की परत का निकलना है। यह स्वस्थ शरीर की निशानी है, और इसमें कुछ भी गंदा नहीं। मंदिर जाना या पूजा करना आपकी आस्था और आपकी मर्ज़ी की बात है।"),
    C('plant', false, ['cycle', 'teen'], 'periods', 'periods-myths', "If she touches a plant, such as tulsi, it will dry up.", "पौधा, जैसे तुलसी, छू लिया तो सूख जाएगा।",
      "Plants are not affected by a period. They dry up from too little or too much water, too little sun, or pests.", "पीरियड का पौधों पर कोई असर नहीं होता। पौधे कम या ज़्यादा पानी, कम धूप या कीड़ों से सूखते हैं।"),
    C('sour', false, ['cycle', 'teen'], 'periods', 'periods-myths', "Sour food like curd, tamarind or lemon makes cramps or bleeding worse.", "दही, इमली या नींबू जैसी खट्टी चीज़ों से ऐंठन या ब्लीडिंग बढ़ती है।",
      "Sour food does not change your bleeding or cramps. Eat your normal meals, and add iron-rich food such as green leafy vegetables, chana, rajma, eggs or meat.", "खट्टा खाने से ब्लीडिंग या ऐंठन पर असर नहीं पड़ता। अपना सामान्य खाना खाएँ, और आयरन वाला खाना जोड़ें, जैसे हरी पत्तेदार सब्ज़ियाँ, चना, राजमा, अंडा या मांस।"),
    C('sexperiod', false, ['cycle'], 'periods', 'periods-myths', "Sex during a period is harmful, and you cannot get pregnant then.", "पीरियड में संबंध बनाना नुक़सानदेह है, और उस समय गर्भ नहीं ठहरता।",
      "Sex during a period is safe if you both want it. It is your choice, and saying no is your right too. Pregnancy is less likely but still possible, and infections can still pass. Use a condom if you do not want a pregnancy or are not sure about infections.", "अगर दोनों चाहें तो पीरियड में संबंध बनाना सुरक्षित है। यह आपकी मर्ज़ी है, और मना करना भी आपका हक़ है। गर्भ की संभावना कम है पर होती है, और संक्रमण भी फैल सकता है। गर्भ नहीं चाहतीं या संक्रमण को लेकर पक्का नहीं हैं, तो condom इस्तेमाल करें।"),
    C('school', false, ['teen', 'cycle'], 'periods', 'periods-myths', "Girls should stay home from school or skip sport during periods.", "पीरियड में लड़कियों को स्कूल नहीं जाना चाहिए या खेल छोड़ देना चाहिए।",
      "Girls can go to school, sit exams and play sport as usual. Carry a spare pad and a small bag to wrap the used one. A teacher can help if you need a pad or have pain. If the school has no clean toilet with water and a dustbin, parents can ask for one.", "लड़कियाँ हमेशा की तरह स्कूल जा सकती हैं, परीक्षा दे सकती हैं और खेल सकती हैं। एक extra pad और इस्तेमाल किया pad लपेटने के लिए छोटी थैली साथ रखें। pad चाहिए या दर्द हो तो किसी टीचर से कहें। स्कूल में पानी वाला साफ़ शौचालय और कूड़ादान न हो तो माता-पिता इसकी माँग कर सकते हैं।"),
    /* Version 39.7 (journey audit P3-16): worries about contraception (new lines await doctor review, wording review 18.3) */
    C('cutmove', false, ['cycle', 'post'], 'contra', 'contra-m-cut', "A Copper-T can move around inside the body, even up to the heart.", "Copper-T शरीर के अंदर घूम सकता है, दिल तक भी पहुँच सकता है।",
      "A Copper-T stays inside the womb. It cannot travel to the heart, the brain or anywhere else in the body. Now and then it slips out, most often in the first months. If you see it on a pad or in the toilet, go back to the centre and use condoms meanwhile.", "Copper-T बच्चेदानी के अंदर ही रहता है। यह दिल, दिमाग़ या शरीर में कहीं और नहीं जा सकता। कभी-कभी यह बाहर निकल जाता है, ज़्यादातर पहले महीनों में। pad या शौचालय में दिखे तो केंद्र जाएँ और तब तक कंडोम इस्तेमाल करें।"),
    C('pillweight', false, ['cycle', 'post'], 'contra', 'contra-m-pill', "Birth control pills make most women put on weight.", "गर्भनिरोधक गोलियों से ज़्यादातर औरतों का वज़न बढ़ जाता है।",
      "Studies have not found that the pill makes women gain weight. Some notice a little bloating in the first months. If your weight worries you, a doctor can help you pick another method.", "शोध में यह नहीं पाया गया कि गोली से औरतों का वज़न बढ़ता है। कुछ को शुरू के महीनों में थोड़ा फूलापन लगता है। वज़न की चिंता हो तो डॉक्टर कोई और तरीक़ा चुनने में मदद कर सकती हैं।"),
    C('pillinfert', false, ['cycle', 'post'], 'contra', 'contra-m-pill', "Taking the pill for years makes it hard to have a baby later.", "सालों तक गोली लेने से बाद में बच्चा होना मुश्किल हो जाता है।",
      "The pill does not make a woman infertile. Most women can get pregnant soon after they stop taking it.", "गोली से औरत बाँझ नहीं होती। ज़्यादातर औरतों में गोली बंद करने के कुछ ही समय बाद गर्भ ठहर सकता है।"),
    C('antara', false, ['cycle', 'post'], 'contra', 'contra-m-antara', "The Antara injection makes a woman unable to have children.", "अंतरा इंजेक्शन से औरत को बच्चा नहीं हो पाता।",
      "Antara does not cause infertility. Fertility comes back more slowly than with other methods: on average about 7–10 months after the last injection. It does come back.", "अंतरा से बाँझपन नहीं होता। गर्भ ठहरने की क्षमता दूसरे तरीक़ों से धीरे लौटती है: औसतन आख़िरी इंजेक्शन के लगभग 7–10 महीने बाद। लौटती ज़रूर है।"),
    C('nsv', false, ['cycle', 'post'], 'contra', 'contra-m-nsv', "NSV, the operation for men, makes a man weak.", "NSV, पुरुषों का ऑपरेशन, आदमी को कमज़ोर बना देता है।",
      "NSV does not affect strength, manliness or sex. Semen still comes out, but without sperm.", "NSV से ताक़त, मर्दानगी या संबंध पर कोई असर नहीं पड़ता। वीर्य निकलता रहता है, पर उसमें शुक्राणु नहीं होते।")
  ];
  /* Version 39.7 (journey audit P3-15, P3-16): one myths deck. Sach ya Myth, the periods myths page and the contraception
     hub's "Worries and facts" read the same cards (S.joy.deck), so a doctor's correction is made once. */
  const TOPIC = { period: ['kitchen', 'temple', 'pickle', 'bath', 'exercise', 'plant', 'sour', 'impure', 'sexperiod', 'school', 'pain', 'heavy', 'pad', 'gap', 'teenirreg'], contra: ['periodpreg', 'cut', 'cutmove', 'pillweight', 'pillinfert', 'antara', 'nsv', 'ec', 'condom', 'pppreg'] };
  const deck = (topic) => (TOPIC[topic] || []).map((id) => CARDS.find((c) => c.id === id)).filter(Boolean).map((c) => ({ id: c.id, a: c.a, s: c.s, w: c.w, go: c.go }));
  function stageTags() {
    const st = S.state; const sit = st.situation || {}; const age = S.cycle.ageYears(); const out = [];
    if (st.stage !== 'app') return ['teen', 'all'];
    if (sit.pregnant) out.push('preg');
    else if (sit.deliveredOn && S.diffDays(S.fromISO(sit.deliveredOn), S.today()) <= 365) out.push('post');
    if (sit.pcos || (st.goals || []).indexOf('pmos') >= 0) out.push('pmos');
    if (S.cycle.isMidlife ? S.cycle.isMidlife() : (sit.stopped || (age != null && age >= 45))) out.push('meno');
    if (!sit.pregnant) out.push('cycle');
    out.push('all');
    return out;
  }
  /* Cards for her stage, the most relevant first. */
  function pool() {
    const tags = stageTags(); const rank = (c) => Math.min.apply(null, c.tags.map((g) => (tags.indexOf(g) < 0 ? 99 : tags.indexOf(g))));
    const gone = !!(S.post && S.post.died && S.post.died());   /* Version 39.46: no baby-feeding myths after "My baby has died" */
    return CARDS.filter((c) => rank(c) < 99 && !(gone && c.go === 'post-feed')).map((c, i) => ({ c: c, r: rank(c) * 100 + i })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }
  let memQuiz = {};                       /* answers when there is no diary to save them in */
  let q = { id: null, ans: null };        /* the card on screen and her answer */
  const answered = (d) => (S.canSave() ? d.quiz : memQuiz);
  const todayList = (d) => (S.canSave() ? d.qday[todayISO()] || [] : memQuiz.__today || []);
  function nextCard(d) {
    const done = todayList(d); if (done.length >= QUIZ_PER_DAY) return null;
    const all = pool(); const ans = answered(d);
    const fresh = all.filter((c) => !(c.id in ans) && done.indexOf(c.id) < 0);
    const list = fresh.length ? fresh : all.filter((c) => done.indexOf(c.id) < 0);
    return list.length ? { c: list[0], repeat: !fresh.length } : null;
  }
  const quizDoneToday = (d) => todayList(d).length > 0;

  /* ---------- celebrations ---------- */
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const buzz = () => { try { const B = window.SakhiAndroid; if (B && B.haptic) B.haptic(); } catch (e) { /* not on a phone */ } };
  const host = () => { let r = document.getElementById('joy-root'); if (!r) { r = document.createElement('div'); r.id = 'joy-root'; document.body.appendChild(r); } return r; };
  const COLS = ['orange', 'pink', 'yellow', 'red', 'leaf', 'purple'];
  const sparks = (n, spread) => { let h = ''; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (i % 2) * 0.35; const r = spread * (0.7 + ((i * 37) % 10) / 22); h += '<i class="jp-s" style="--dx:' + Math.round(Math.cos(a) * r) + 'px;--dy:' + Math.round(Math.sin(a) * r) + 'px;--r:' + ((i * 47) % 200) + 'deg;--d:' + (i * 28) + 'ms;--c:var(--art-' + COLS[i % COLS.length] + ')"></i>'; } return h; };
  let fresh = null;   /* { mk, idx }: the petal that should grow in on the Home strip */
  let held = null;    /* Version 37.1: { mk, n, bloom, b }: earned while her plan's first day waited for its check-in */
  /* A new owner (Delete everything, a sample, a restore) starts with no quiz answers and no petal waiting to grow. */
  if (S.onOwnerChange) S.onOwnerChange(() => { memQuiz = {}; q = { id: null, ans: null }; fresh = null; held = null; });
  function celebrate(kind, o) {
    if (/^relief-/.test(S.route())) return;
    /* Version 39.37 (the three-plan walkthrough): the check-in already says "A petal for your garden"; a badge earned with a petal is a
       short note, not a second panel over the page (her garden shows it) */
    const just = celebrate.at && Date.now() - celebrate.at < 9000;
    if (kind === 'petal' && S.route() === 'plan-checkin') { celebrate.at = Date.now(); return; }
    if (kind === 'badge' && just) { S.toast(tf('joy_pop_badge', { b: t('joy_b_' + o.b.id) })); return; }
    celebrate.at = Date.now();   /* in a routine: no confetti while she is in pain or anxious (the petal still counts) */
    const m = monthIdx(o.mk || S.monthKey(S.today()));
    const title = kind === 'petal' ? t('joy_pop_petal') : kind === 'bloom' ? tf('joy_pop_bloom', { m: monthName(m) }) : tf('joy_pop_badge', { b: t('joy_b_' + o.b.id) });
    const sub = kind === 'petal' ? tf('joy_pop_sub', { m: monthName(m), n: o.n }) : kind === 'bloom' ? tf('joy_pop_bloom_sub', { f: S.art ? S.art.flowerName(m) : '' }) : tf('joy_earned_on', { d: S.fmtD(S.today(), { day: 'numeric', month: 'long' }) });
    if (reduced() || !S.art) { S.toast(title + ' · ' + sub); return; }
    buzz(); const r = host(); clearTimeout(celebrate.tm);
    if (kind === 'petal') {
      r.innerHTML = '<div class="joy-pop" role="status"><span class="jp-fl">' + S.art.flower(m, o.n, { fresh: o.n - 1, leaves: false }) + sparks(10, 64) + '</span><span class="jp-tx"><strong>' + esc(title) + '</strong><span>' + esc(sub) + '</span></span></div>';
      celebrate.tm = setTimeout(() => { r.innerHTML = ''; }, 3000);
      return;
    }
    const art = kind === 'bloom' ? S.art.flower(m, 12, { grow: true, bg: true }) : S.art.badge(o.b.icon, o.b.hue, true);
    r.innerHTML = '<div class="joy-burst" role="dialog" aria-label="' + esc(title) + '"><div class="jb-card"><div class="jb-art">' + art + sparks(18, 140) + '</div><h2>' + esc(title) + '</h2><p class="small">' + esc(sub) + '</p><button type="button" class="btn sm" id="jb-close">' + esc(t('joy_close')) + '</button></div></div>';
    const close = () => { r.innerHTML = ''; };
    r.querySelector('.joy-burst').addEventListener('click', close);
    celebrate.tm = setTimeout(close, 5200);
  }

  /* ---------- what she does (from app.js, and from this module's cards) ---------- */
  function onEvent(name, p) {
    if (!S.canSave() || KINDS.indexOf(name) < 0) return;
    const d = D(); const day = p && p.day ? p.day : todayISO(); const mk = S.monthKey(p && p.day ? S.fromISO(p.day) : S.today());   /* Version 39.23: a plan check-in after midnight counts for its plan day */
    if (name === 'read' && p.key) d.reads[p.key] = 1;
    if (name === 'share') d.shares = (d.shares || 0) + 1;
    const before = monthPetals(d, mk); const L = d.days[day] || (d.days[day] = []);
    if (L.indexOf(name) < 0) L.push(name);
    const after = monthPetals(d, mk); const newB = stamp(d);
    S.saveQuiet();
    if (!GARDEN) return;   /* Version 39.68: what she read still ticks Learn's book; no petal grows */
    if (after > before && !p.quiet) fresh = { mk: mk, idx: after - 1 };   /* Version 39.27: a quiet one grows no petal on screen either */
    setTimeout(refreshStrip, 80);
    if (p.quiet) return;
    /* Version 37.1: on her plan's first day nothing pops up before her first check-in; what she earned waits for it (S.joy.release) */
    if (S.plan && S.plan.holdJoy && S.plan.holdJoy()) { held = held || { mk: mk, n: 0, bloom: false, b: null }; if (after > before) { held.mk = mk; held.n = after; held.bloom = after >= PER_MONTH; } if (newB.length && !held.b) held.b = newB[0]; return; }
    if (after > before) celebrate(after >= PER_MONTH ? 'bloom' : 'petal', { mk: mk, n: after });
    if (newB.length) setTimeout(() => celebrate('badge', { b: newB[0] }), after > before ? (after >= PER_MONTH ? 5400 : 3100) : 0);
  }

  /* Version 37.1: her first check-in shows what she earned on her plan's first day, once. If the check-in just celebrated a
     petal of its own, only a waiting badge follows. */
  S.joy = { deck: deck, petals: () => (GARDEN && S.canSave() ? monthPetals(D(), S.monthKey(S.today())) : 0), release: () => {
    const h = held; held = null; if (!h || !GARDEN) return false;
    const just = Date.now() - (celebrate.at || 0) < 1000;
    if (h.n && !just) celebrate(h.bloom ? 'bloom' : 'petal', { mk: h.mk, n: h.n });
    if (h.b) setTimeout(() => celebrate('badge', { b: h.b }), h.n || just ? (h.bloom ? 5400 : 3100) : 0);
    return !!(h.n || h.b);   /* something she earned was shown */
  } };

  /* ---------- Home: this month's flower and today's card ---------- */
  function stripHtml() {
    if (!S.canSave() || !S.art) return '';
    const d = D(); const mk = S.monthKey(S.today()); const n = monthPetals(d, mk); const m = monthIdx(mk); const done = quizDoneToday(d);
    const fr = fresh && fresh.mk === mk ? fresh.idx : null; fresh = null;
    return '<div class="joy-strip"><button type="button" class="joy-mini" data-go="joy" aria-label="' + esc(tf('joy_strip_aria', { n: n })) + '">' + S.art.flower(m, n, { leaves: false, fresh: fr }) + '</button>' +
      '<button type="button" class="joy-txt" data-go="joy"><span class="eyebrow">' + esc(tf('joy_month_flower', { m: monthName(m), f: S.art.flowerName(m) })) + '</span><strong>' + esc(tf('joy_petals_n', { n: n })) + '</strong></button>' +
      '<button type="button" class="btn sm joy-today' + (done ? '' : ' on') + '" data-go="joy-quiz">' + (done ? S.I.check.replace('<svg', '<svg style="width:16px;height:16px"') + ' ' : '') + esc(done ? t('joy_card_done') : t('joy_card_today')) + '</button></div>';
  }
  /* ---------- her month with Sakhi: the flower she grew and counts of her own entries, private unless she shares the flower ---------- */
  /* The month to look back on: this month in its last 3 days, last month in the first 5 days of a new one. */
  function recapMonth() {
    const td = S.today(); const dim = new Date(td.getFullYear(), td.getMonth() + 1, 0).getDate();
    if (td.getDate() >= dim - 2) return S.monthKey(td);
    if (td.getDate() <= 5) return S.monthKey(new Date(td.getFullYear(), td.getMonth() - 1, 1));
    return null;
  }
  function monthStats(mk) {
    const st = S.state; const inM = (iso) => typeof iso === 'string' && iso.slice(0, 7) === mk; const days = {};
    Object.keys(st.daily || {}).forEach((k) => { if (inM(k) && (st.daily[k] || []).length) days[k] = 1; });
    Object.keys(st.notes || {}).forEach((k) => { if (inM(k) && st.notes[k]) days[k] = 1; });
    (st.events || []).forEach((e) => { if (inM(e.d) && !e.approx) days[e.d] = 1; });
    const counts = {}; Object.keys(st.daily || {}).forEach((k) => { if (inM(k)) (st.daily[k] || []).forEach((x) => { if (x !== 'd_calm' && x !== 'd_happy' && x !== 'd_ok') counts[x] = (counts[x] || 0) + 1; }); });
    const d = D(); const kindDays = (k) => Object.keys(d.days).filter((day) => inM(day) && (d.days[day] || []).indexOf(k) >= 0).length;
    return {
      noted: Object.keys(days).length, periods: S.cycle.starts().filter((d0) => inM(d0) && !S.cycle.approxStarts()[d0]).length,
      top: Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (a < b ? -1 : 1)).slice(0, 3).map((k) => ({ k: k, n: counts[k] })),
      reads: kindDays('read'), cards: Object.keys(d.qday).filter(inM).reduce((a, k) => a + (d.qday[k] || []).length, 0),
      kind: Object.keys(d.days).filter((day) => inM(day) && dayPetals(d, day) > 0).length, ci: !!(st.checkins || {})[mk]
    };
  }
  /* Home: at the turn of the month, until she has opened it. */
  function recapCard() {
    if (!S.canSave() || !S.art) return ''; const mk = recapMonth(); if (!mk) return '';
    const d = D(); if ((d.recapSeen || {})[mk]) return '';
    const n = monthPetals(d, mk); if (!n && !monthStats(mk).noted) return '';
    const m = monthIdx(mk);
    return '<button type="button" class="action rc-home" data-go="joy-month-' + mk + '"><span class="ico rc-ico">' + S.art.flower(m, n, { leaves: false }) + '</span><span class="body"><strong>' + esc(tf('joy_rc_h', { m: monthName(m) })) + '</strong><span class="small">' + esc(tf('joy_petals_n', { n: n })) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }
  function renderMonth(v, mk0) {
    if (!S.canSave() || !S.art) { renderGarden(v); return; }
    const td = S.today(); const cur = S.monthKey(td);
    const mk = /^\d{4}-\d{2}$/.test(mk0 || '') && mk0 <= cur ? mk0 : (recapMonth() || cur);
    const d = D(); d.recapSeen = d.recapSeen || {}; if (!d.recapSeen[mk]) { d.recapSeen[mk] = todayISO(); S.saveQuiet(); }
    const m = monthIdx(mk); const n = monthPetals(d, mk); const s = monthStats(mk); const disc = !!(S.state.settings || {}).discreet;
    const helped = S.relief && S.relief.helped ? S.relief.helped(mk) : [];
    const stat = (num, lab) => '<div class="stat"><b class="num">' + num + '</b><span>' + esc(lab) + '</span></div>';
    const share = tf('joy_rc_share_text', { m: monthName(m), f: S.art.flowerName(m), n: n }) + '\n\n' + t('joy_share_from');
    v.innerHTML = S.backRow(tf('joy_rc_h', { m: monthName(m) }), 'joy', false) +
      '<div class="card joy-hero"><div class="joy-big">' + S.art.flower(m, n, { bg: true, label: tf('joy_petals_n', { n: n }) }) + '</div><div class="eyebrow">' + esc(tf('joy_month_flower', { m: monthName(m), f: S.art.flowerName(m) })) + '</div><div class="joy-count"><b class="num">' + n + '</b> / 12</div>' + (n >= PER_MONTH ? '<div class="flag ok">' + esc(t('joy_rc_bloom')) + '</div>' : '') + '</div>' +
      '<div class="card"><div class="statgrid rc-stats">' + stat(s.noted, t('joy_rc_days')) + (disc ? '' : stat(s.periods, t('joy_rc_periods'))) + stat(s.reads, t('joy_rc_reads')) + stat(s.cards, t('joy_rc_cards')) + '</div>' + (s.ci ? '<p class="small">' + esc(t('joy_rc_ci')) + '</p>' : '') + '</div>' +
      (!disc && s.top.length ? '<h2>' + esc(t('joy_rc_top')) + '</h2><div class="list">' + s.top.map((x) => '<div class="item quiet"><span class="body"><strong>' + esc(t(x.k)) + '</strong><span>' + esc(tf('joy_rc_times', { n: x.n })) + '</span></span></div>').join('') + '</div>' : '') +
      (helped.length ? '<h2>' + esc(t('joy_rc_helped')) + '</h2><div class="list">' + helped.map((h) => '<div class="item quiet"><span class="ico-sm hue hue-green">' + S.I.leaf + '</span><span class="body"><strong>' + esc(h) + '</strong></span></div>').join('') + '</div>' : '') +
      '<div class="card soft rc-kind">' + (S.art.sakhi ? S.art.sakhi({ pose: s.kind ? 'cheer' : 'calm', look: (S.state.settings || {}).look }) : '') + '<p>' + esc(s.kind ? tf('joy_rc_kind', { n: s.kind }) : t('joy_rc_kind0')) + '</p></div>' +
      '<button type="button" class="btn block" id="rc-share">' + S.I.users.replace('<svg', '<svg style="width:20px;height:20px"') + ' ' + esc(t('joy_rc_share')) + '</button>' +
      '<p class="footnote">' + esc(t('joy_rc_private')) + '</p>';
    S.wire(v);
    const sh = v.querySelector('#rc-share'); if (sh) sh.addEventListener('click', () => { S.share(t('joy_rc_share'), share); S.emit('share', {}); });
  }
  function refreshStrip() { const el = document.querySelector('#view .joy-strip'); if (!el) return; const h = stripHtml(); if (!h) return; el.outerHTML = h; const n = document.querySelector('#view .joy-strip'); if (n) S.wire(n); }

  /* ---------- My garden ---------- */
  function renderGarden(v) {
    if (!S.canSave()) { v.innerHTML = S.backRow(t('joy_h'), 'home', false) + '<p class="small">' + esc(t('joy_intro')) + '</p>' + S.needDiary() + '<button type="button" class="btn block" data-go="joy-quiz">' + esc(t('joy_quiz_h')) + '</button>'; S.wire(v); return; }
    const d = D(); if (stamp(d).length) S.saveQuiet();
    const td = S.today(); const day = todayISO(); const mk = S.monthKey(td); const m = monthIdx(mk); const n = monthPetals(d, mk); const L = d.days[day] || []; const dayFull = dayPetals(d, day) >= PER_DAY;
    const preg = !!(S.state.situation || {}).pregnant; const ciDone = !!(S.state.checkins || {})[mk];
    const ways = [['quiz', 'joy-quiz', 'sparkle', 'joy_w_quiz', 'orange'], preg ? null : ['log', 'home', 'diary', 'joy_w_log', 'rose'], ['read', 'learn', 'learn', 'joy_w_read', 'sky'], ['tool', preg && S.routeOwner('preg-logs') ? 'preg-logs' : (S.routeOwner('tools-reminders') ? 'tools-reminders' : 'care'), 'care', preg ? 'joy_w_tool_p' : 'joy_w_tool', 'teal'], ['checkin', 'checkin', 'check', 'joy_w_checkin', 'green'], ['ask', 'ask', 'person', 'joy_w_ask', 'plum']].filter(Boolean);
    const way = (w) => { const got = L.indexOf(w[0]) >= 0; const status = got ? t('joy_earned') : (w[0] === 'checkin' && ciDone ? t('joy_ci_done') : (dayFull || n >= PER_MONTH ? '' : t('joy_plus')));
      return '<button type="button" class="item joy-way" data-go="' + w[1] + '"><span class="ico-sm hue hue-' + w[4] + '">' + S.I[w[2]] + '</span><span class="body"><strong>' + esc(t(w[3])) + '</strong>' + (status ? '<span>' + esc(status) + '</span>' : '') + '</span>' + (got ? '<span class="joy-tick">' + S.I.check + '</span>' : '<span class="chev">' + S.I.chev + '</span>') + '</button>'; };
    const wk = streak(d); const act = activeWeeks(d); const ws = weekStart(td); let dots = ''; for (let i = 7; i >= 0; i--) dots += '<i class="' + (act[S.toISO(S.addDays(ws, -7 * i))] ? 'on' : '') + '"></i>';
    const badges = BADGES.map((b) => { const on = !!d.badges[b.id]; const pg = !on && b.prog ? b.prog(d) : null;
      return '<button type="button" class="joy-badge" data-badge="' + b.id + '">' + S.art.badge(b.icon, b.hue, on) + '<strong>' + esc(t('joy_b_' + b.id)) + '</strong><span class="small">' + esc(on ? tf('joy_earned_on', { d: S.fmtD(S.fromISO(d.badges[b.id])) }) : (pg ? tf('joy_prog', { a: Math.min(pg[0], pg[1]), b: pg[1] }) : t('joy_locked'))) + '</span></button>'; }).join('');
    const y = td.getFullYear(); let year = '';
    for (let i = 0; i < 12; i++) { const k = y + '-' + S.pad2(i + 1); const fut = i > td.getMonth(); const pn = fut ? 0 : monthPetals(d, k);
      year += (fut ? '<div' : '<button type="button" data-go="joy-month-' + k + '"') + ' class="joy-mo' + (fut ? ' future' : '') + (i === td.getMonth() ? ' now' : '') + '">' + S.art.flower(i, pn, { leaves: false, label: monthName(i) + ': ' + tf('joy_petals_n', { n: pn }) }) + '<strong>' + esc(String(monthName(i)).slice(0, 3)) + '</strong>' + (fut ? '</div>' : '</button>'); }
    v.innerHTML = S.backRow(t('joy_h'), 'home', false) +
      '<div class="card joy-hero"><div class="joy-big">' + S.art.flower(m, n, { bg: true, label: tf('joy_petals_n', { n: n }) }) + (S.art.sakhi ? S.art.sakhi({ pose: n >= PER_MONTH ? 'cheer' : 'hi', look: (S.state.settings || {}).look }) : '') + '</div><div class="eyebrow">' + esc(tf('joy_month_flower', { m: monthName(m), f: S.art.flowerName(m) })) + '</div><div class="joy-count"><b class="num">' + n + '</b> / 12</div><p class="small">' + esc(t('joy_intro')) + '</p><button type="button" class="btn sm" data-go="joy-month-' + mk + '">' + esc(t('joy_rc_see')) + '</button></div>' +
      '<h2>' + esc(t('joy_today_h')) + '</h2>' + (n >= PER_MONTH ? '<div class="flag ok">' + esc(t('joy_full_month')) + '</div>' : (dayFull ? '<div class="flag ok">' + esc(t('joy_full_day')) + '</div>' : '')) + '<div class="list">' + ways.map(way).join('') + '</div>' +
      '<div class="card soft joy-weeks"><div class="row spread"><h3>' + esc(t('joy_weeks_h')) + '</h3><span class="pill ok">' + esc(tf('joy_weeks_n', { n: wk })) + '</span></div><div class="joy-wdots" aria-hidden="true">' + dots + '</div><p class="small">' + esc(t('joy_weeks_p')) + '</p></div>' +
      '<h2>' + esc(t('joy_badges_h')) + '</h2><div class="joy-badges">' + badges + '</div>' +
      '<h2>' + esc(t('joy_year_h')) + '</h2><div class="joy-year">' + year + '</div>' +
      '<p class="footnote">' + esc(t('joy_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-badge]').forEach((b) => b.addEventListener('click', () => { const B = BADGES.find((x) => x.id === b.dataset.badge); const on = !!d.badges[B.id]; const pg = !on && B.prog ? B.prog(d) : null;
      S.sheet('<div class="joy-sheet">' + S.art.badge(B.icon, B.hue, on) + '<h2>' + esc(t('joy_b_' + B.id)) + '</h2><p>' + esc(t('joy_b_' + B.id + '_h')) + '</p><p class="small">' + esc(on ? tf('joy_earned_on', { d: S.fmtD(S.fromISO(d.badges[B.id]), { day: 'numeric', month: 'long', year: 'numeric' }) }) : (pg ? tf('joy_prog', { a: Math.min(pg[0], pg[1]), b: pg[1] }) : t('joy_locked'))) + '</p><button type="button" class="btn block" id="jb-ok">' + esc(t('joy_close')) + '</button></div>', (sh) => { sh.querySelector('#jb-ok').addEventListener('click', S.closeSheet); }); }));
  }

  /* ---------- Sach ya Myth? ---------- */
  function renderQuiz(v) {
    const d = D(); const done = todayList(d);
    let cur = q.id ? CARDS.find((c) => c.id === q.id) : null; let repeat = false;
    if (!cur) { const nx = nextCard(d); if (nx) { cur = nx.c; repeat = nx.repeat; q = { id: cur.id, ans: null }; } }
    let body, share = '';
    if (!cur) body = '<div class="card joy-qcard joy-qdone">' + (S.art ? '<div class="joy-qdone-art">' + S.art.flower(monthIdx(S.monthKey(S.today())), S.canSave() ? monthPetals(d, S.monthKey(S.today())) : 12, { leaves: false }) + '</div>' : '') + '<h2>' + esc(t('joy_done_h')) + '</h2>' + (S.canSave() ? '<button type="button" class="btn primary block" data-go="joy">' + esc(t('joy_to_garden')) + '</button>' : '') + '</div>';
    else {
      const num = q.ans == null ? done.length + 1 : done.indexOf(cur.id) + 1;
      const top = '<div class="joy-qtop"><span class="pill accent">' + esc(tf('joy_card_n', { n: Math.max(1, num), m: QUIZ_PER_DAY })) + '</span>' + (S.art ? S.art.spot(cur.art) : '') + '</div>';
      if (q.ans == null) body = '<div class="card joy-qcard">' + top + (repeat ? '<p class="small">' + esc(t('joy_seen_all')) + '</p>' : '') + '<p class="joy-stmt">' + esc(tx(cur.s)) + '</p><div class="grid2"><button type="button" class="btn joy-ans" data-ans="1">' + esc(t('joy_sach')) + '</button><button type="button" class="btn joy-ans" data-ans="0">' + esc(t('joy_myth')) + '</button></div></div>';
      else {
        const right = (q.ans === 1) === cur.a;
        share = tx(cur.s) + '\n\n' + (cur.a ? t('joy_is_sach') : t('joy_is_myth')) + '. ' + tx(cur.w) + '\n\n' + t('joy_share_from');
        body = '<div class="card joy-qcard">' + top + '<p class="joy-stmt">' + esc(tx(cur.s)) + '</p><div class="joy-verdict ' + (cur.a ? 'sach' : 'myth') + '"><b>' + esc(cur.a ? t('joy_is_sach') : t('joy_is_myth')) + '</b><span>' + esc(right ? t('joy_right') : t('joy_wrong')) + '</span></div><p style="color:var(--fg)">' + esc(tx(cur.w)) + '</p>' +
          (S.routeOwner(cur.go) || ['diary', 'help', 'care', 'learn'].indexOf(cur.go) >= 0 || cur.go.indexOf('topic-') === 0 || cur.go.indexOf('contra-m-') === 0 ? '<button type="button" class="morebtn" data-go="' + esc(cur.go) + '">' + esc(t('joy_more')) + '</button>' : '') +
          '<div class="stack"><button type="button" class="btn primary block" id="joy-next">' + esc(t('joy_next')) + '</button><button type="button" class="btn block" id="joy-share">' + S.I.users.replace('<svg', '<svg style="width:20px;height:20px"') + ' ' + esc(t('joy_share')) + '</button></div></div>';
      }
    }
    v.innerHTML = S.backRow(t('joy_quiz_h'), 'home', false) + '<p class="small">' + esc(t('joy_quiz_p')) + '</p>' + body + (S.canSave() ? '' : '<p class="small">' + esc(t('joy_need_diary')) + '</p>') + '<p class="footnote">' + esc(t('joy_quiz_foot')) + '</p>';
    S.wire(v);
    v.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => {
      q.ans = +b.dataset.ans; const right = (q.ans === 1) === cur.a;
      if (S.canSave()) { d.quiz[cur.id] = right ? 1 : 0; const L = d.qday[todayISO()] || (d.qday[todayISO()] = []); if (L.indexOf(cur.id) < 0) L.push(cur.id); Object.keys(d.qday).forEach((k) => { if (k < S.toISO(S.addDays(S.today(), -14))) delete d.qday[k]; }); S.saveQuiet(); }
      else { memQuiz[cur.id] = right ? 1 : 0; memQuiz.__today = (memQuiz.__today || []).concat([cur.id]); }
      S.render(); S.emit('quiz', {});
    }));
    const nx = v.querySelector('#joy-next'); if (nx) nx.addEventListener('click', () => { q = { id: null, ans: null }; S.render(); window.scrollTo(0, 0); });
    const sh = v.querySelector('#joy-share'); if (sh) sh.addEventListener('click', () => { S.share(t('joy_quiz_h'), share); S.emit('share', {}); });
  }

  /* ---------- sample women: a garden that has been growing for a few months ---------- */
  function sample(id) {
    const plan = { priya: [7, 12, 9], asha: [12, 12, 12], meera: [9, 12, 10], sunita: [4, 6, 0], kamla: [10, 12, 12] }[id]; if (!plan) return;
    const d = D(); const td = S.today(); const sets = [['log', 'read'], ['quiz', 'tool'], ['read', 'quiz', 'tool'], ['checkin', 'quiz']];
    plan.forEach((target, back) => {
      const first = new Date(td.getFullYear(), td.getMonth() - back, 1); const last = back === 0 ? S.addDays(td, -1) : new Date(first.getFullYear(), first.getMonth() + 1, 0);
      const span = S.diffDays(first, last) + 1; if (span <= 0) return;
      const step = Math.max(1, Math.floor(span / Math.max(1, Math.ceil(target / 2.25))));   /* spread across the month, like real use */
      let left = target, i = 0, day = first;
      while (left > 0 && day <= last) { const ks = sets[i % 4].slice(0, Math.min(left, sets[i % 4].length)); d.days[S.toISO(day)] = ks; left -= ks.length; day = S.addDays(day, step); i++; }
    });
    const reads = { priya: 3, asha: 6, meera: 4, sunita: 1, kamla: 5 }[id]; for (let i = 0; i < reads; i++) d.reads['sample.' + i] = 1;
    const qs = { priya: 6, asha: 10, meera: 7, sunita: 2, kamla: 8 }[id]; pool().slice(0, qs).forEach((c, i) => { d.quiz[c.id] = i % 4 === 3 ? 0 : 1; });
    if (id === 'asha') d.shares = 1;
    stamp(d);
  }

  /* Version 39.7 (journey audit P3-02): one "Did you know?" card a week in Today's "Sakhi says", from her stage's cards she
     hasn't answered. She answers it there; it rests the day after. Never on a shared phone, after a loss, or without a diary. */
  const weekOf = (d0) => S.toISO(S.addDays(d0, -((d0.getDay() + 6) % 7)));
  function dykCard() {
    if (!S.canSave() || S.state.stage !== 'app' || (S.state.settings || {}).discreet || (S.cycle.afterLoss && S.cycle.afterLoss())) return null;
    const d = D(); const wk = weekOf(S.today()); const td = todayISO();
    if (!d.dyk || d.dyk.wk !== wk) {
      const c = pool().find((x) => !(x.id in d.quiz)); if (!c) return null;
      d.dyk = { wk: wk, id: c.id }; S.saveQuiet();
    }
    if (d.dyk.on && d.dyk.on < td) return null;   /* answered: it rests until next week */
    const c = CARDS.find((x) => x.id === d.dyk.id); return c ? { c: c, d: d } : null;
  }
  function dykHtml() {
    const k = dykCard(); if (!k) return ''; const c = k.c; const a = k.d.dyk.ans;
    const more = S.routeOwner(c.go) || ['diary', 'help', 'care', 'learn'].indexOf(c.go) >= 0 || c.go.indexOf('topic-') === 0 || c.go.indexOf('contra-m-') === 0;
    return '<div class="card soft joy-dyk" data-nofold="1"><span class="eyebrow">' + esc(t('joy_quiz_h')) + '</span><p class="joy-stmt">' + esc(tx(c.s)) + '</p>' +
      (a == null ? '<div class="grid2"><button type="button" class="btn joy-ans" data-dyk="1">' + esc(t('joy_sach')) + '</button><button type="button" class="btn joy-ans" data-dyk="0">' + esc(t('joy_myth')) + '</button></div>'
        : '<div class="joy-verdict ' + (c.a ? 'sach' : 'myth') + '"><b>' + esc(c.a ? t('joy_is_sach') : t('joy_is_myth')) + '</b><span>' + esc(((a === 1) === c.a) ? t('joy_right') : t('joy_wrong')) + '</span></div><p class="small">' + esc(tx(c.w)) + '</p><div class="row wrap">' + (more ? '<button type="button" class="btn sm" data-go="' + esc(c.go) + '">' + esc(t('joy_more')) + '</button>' : '') + '<button type="button" class="linkbtn" data-go="joy-quiz">' + esc(t('joy_quiz_h')) + '</button></div>') + '</div>';
  }
  function wireDyk(v) {
    v.querySelectorAll('[data-dyk]').forEach((b) => b.addEventListener('click', () => {
      const k = dykCard(); if (!k) return; const d = k.d; const ans = +b.dataset.dyk; const right = (ans === 1) === k.c.a;
      d.dyk.ans = ans; d.dyk.on = todayISO(); d.quiz[k.c.id] = right ? 1 : 0; const L = d.qday[todayISO()] || (d.qday[todayISO()] = []); if (L.indexOf(k.c.id) < 0) L.push(k.c.id);
      S.saveQuiet(); S.render(); S.emit('quiz', {});
    }));
  }

  S.register({
    id: 'joy',
    demoPersona: 'priya',
    /* Tour: the flower and Today's card, on a Home visit after her first petal (so there is something to explain). */
    tours: [
      { id: 'garden', route: 'home', kind: 'feature', order: 60, title: 'joy_tour', hue: 'orange', when: () => GARDEN && S.canSave() && !!S.art, auto: () => monthPetals(D(), S.monthKey(S.today())) >= 1, steps: [
        { sel: '#view .joy-strip', h: 'joy_t1_h', p: 'joy_t1_p' }, { sel: '#view .joy-strip .joy-today', h: 'joy_t2_h', p: 'joy_t2_p' }] }
    ],
    strings: {
      en: {
        joy_rc_h: 'Your {m} with Sakhi', joy_rc_see: 'See your month', joy_rc_days: 'Days you noted something', joy_rc_periods: 'Periods logged', joy_rc_reads: 'Days you read an answer', joy_rc_cards: 'Sach ya Myth cards',
        joy_rc_ci: 'You did this month’s check-in.', joy_rc_top: 'What you noted most', joy_rc_times: '{n} days', joy_rc_helped: 'What helped you', joy_rc_bloom: 'Your flower bloomed this month.',
        joy_rc_kind: 'You looked after yourself on {n} days this month.', joy_rc_kind0: 'A new month is a fresh start. One small thing a day is enough.',
        joy_rc_share: 'Share my flower', joy_rc_share_text: 'My {m} flower in Sakhi: {f}, {n} of 12 petals.', joy_rc_private: 'Only you can see this. Sharing sends just your flower, nothing from your diary.',
        joy_tour: 'Your flower and Today’s card', joy_t1_h: 'Your flower', joy_t1_p: 'Each kind thing you do for yourself adds a petal, up to 3 a day. At 12 petals, this month’s flower blooms.', joy_t2_h: 'Today’s card', joy_t2_p: 'One myth or fact each day. Guess, see the answer, and send it to a friend if you like.',
        joy_h: 'My garden', joy_tile_s: 'A flower that grows with each kind thing you do for yourself', joy_intro: "A petal for each kind thing you do for yourself, up to 3 a day. Twelve petals make this month's flower.",
        joy_month_flower: '{m} flower · {f}', joy_petals_n: '{n} of 12 petals', joy_strip_aria: 'My garden: {n} of 12 petals this month', joy_card_today: "Today's card", joy_card_done: 'Card done',
        joy_today_h: 'Petals today', joy_w_quiz: "Do today's card", joy_w_log: 'Log your period or how you feel', joy_w_read: 'Read a guide', joy_w_tool: 'Use a tool, like reminders', joy_w_tool_p: 'Use a tool, like your BP and weight log',
        joy_w_checkin: 'Do your monthly check-in', joy_w_ask: 'Talk to a Qura doctor', joy_earned: 'Petal earned today', joy_plus: '+1 petal', joy_ci_done: 'Done this month',
        joy_full_day: "You have today's 3 petals. More tomorrow.", joy_full_month: "This month's flower is complete. Petals start again next month.",
        joy_weeks_h: 'Weeks with Sakhi', joy_weeks_n: '{n} in a row', joy_weeks_p: 'A week counts when you earn one petal. Missed a week? Just start again.',
        joy_badges_h: 'Badges', joy_year_h: 'Your garden this year', joy_foot: 'Petals and badges are just for you. They are not a score of your health.',
        joy_need_diary: 'Start a diary to grow your flower. The cards work without one.', joy_pop_petal: 'A petal for today', joy_pop_sub: '{m} flower: {n} of 12',
        joy_pop_bloom: 'Your {m} flower is complete', joy_pop_bloom_sub: '{f} joins your garden.', joy_pop_badge: 'New badge: {b}', joy_close: 'Close', joy_earned_on: 'Earned {d}', joy_prog: '{a} of {b} so far', joy_locked: 'Not yet',
        joy_b_first: 'First petal', joy_b_first_h: 'Earn your first petal.', joy_b_fullday: 'Full day', joy_b_fullday_h: 'Earn all 3 petals in one day.', joy_b_trio: 'Three flowers', joy_b_trio_h: 'Complete 3 monthly flowers.', joy_b_bloom: 'Full bloom', joy_b_bloom_h: 'Grow all 12 petals in one month.', joy_b_diary: 'Diary keeper', joy_b_diary_h: 'Log the start of 3 periods.',
        joy_b_months: 'Three months', joy_b_months_h: 'Do your monthly check-in 3 months in a row.', joy_b_curious: 'Curious mind', joy_b_curious_h: 'Read 5 guides.', joy_b_myth: 'Myth buster', joy_b_myth_h: 'Answer 10 Sach ya Myth cards.',
        joy_b_friend: 'Good friend', joy_b_friend_h: 'Send a card to a friend.', joy_b_planner: 'Planner', joy_b_planner_h: 'Set a reminder.', joy_b_steady: 'Steady', joy_b_steady_h: 'Earn a petal 4 weeks in a row.',
        joy_b_brave: 'Brave step', joy_b_brave_h: 'Ask a Qura doctor for a free call.',
        joy_quiz_h: 'Sach ya Myth?', joy_quiz_tile_s: 'One card a day about common beliefs, with the real answer', joy_quiz_p: 'One card a day. Tap Sach or Myth, then see why.',
        joy_sach: 'Sach', joy_myth: 'Myth', joy_is_sach: 'Sach: this is true', joy_is_myth: 'Myth: this is not true', joy_right: 'You knew this one.', joy_wrong: 'Many women think so.',
        joy_share: 'Send to a friend', joy_next: 'Next card', joy_more: 'Read more', joy_card_n: 'Card {n} of {m} today', joy_done_h: "That's all for today. More cards tomorrow.", joy_to_garden: 'See my garden',
        joy_quiz_foot: 'These cards follow official health guidance. They are general information. For your own health, talk to a doctor.', joy_share_from: 'From Qura Sakhi, a free health app for women.',
        joy_seen_all: "You've seen every card. Here they are again."
      },
      hi: {
        joy_rc_h: 'Sakhi के साथ आपका {m}', joy_rc_see: 'यह महीना देखें', joy_rc_days: 'जिन दिनों कुछ नोट किया', joy_rc_periods: 'दर्ज पीरियड', joy_rc_reads: 'जिन दिनों कोई जवाब पढ़ा', joy_rc_cards: 'सच या मिथक कार्ड',
        joy_rc_ci: 'आपने इस महीने का चेक-इन किया।', joy_rc_top: 'आपने सबसे ज़्यादा क्या नोट किया', joy_rc_times: '{n} दिन', joy_rc_helped: 'आपको किससे आराम मिला', joy_rc_bloom: 'इस महीने आपका फूल खिल गया।',
        joy_rc_kind: 'इस महीने आपने {n} दिन अपना ख़याल रखा।', joy_rc_kind0: 'नया महीना, नई शुरुआत। रोज़ एक छोटी सी चीज़ काफ़ी है।',
        joy_rc_share: 'अपना फूल शेयर करें', joy_rc_share_text: 'Sakhi में मेरा {m} का फूल: {f}, 12 में से {n} पंखुड़ियाँ।', joy_rc_private: 'इसे सिर्फ़ आप देख सकती हैं। शेयर करने पर सिर्फ़ आपका फूल जाता है, डायरी की कोई बात नहीं।',
        joy_tour: 'आपका फूल और आज का कार्ड', joy_t1_h: 'आपका फूल', joy_t1_p: 'अपने लिए किया हर अच्छा काम एक पंखुड़ी जोड़ता है, दिन में 3 तक। 12 पंखुड़ियाँ होते ही इस महीने का फूल खिल जाता है।', joy_t2_h: 'आज का कार्ड', joy_t2_p: 'हर दिन एक बात: सच या मिथक? अंदाज़ा लगाएँ, जवाब देखें, और चाहें तो किसी सहेली को भेजें।',
        joy_h: 'मेरा बगीचा', joy_tile_s: 'अपने लिए किए हर अच्छे काम से बढ़ता फूल', joy_intro: 'अपने लिए किए हर अच्छे काम पर एक पंखुड़ी, दिन में 3 तक। 12 पंखुड़ियों से इस महीने का फूल बनता है।',
        joy_month_flower: '{m} का फूल · {f}', joy_petals_n: '12 में से {n} पंखुड़ियाँ', joy_strip_aria: 'मेरा बगीचा: इस महीने 12 में से {n} पंखुड़ियाँ', joy_card_today: 'आज का कार्ड', joy_card_done: 'कार्ड हो गया',
        joy_today_h: 'आज की पंखुड़ियाँ', joy_w_quiz: 'आज का कार्ड करें', joy_w_log: 'पीरियड या अपना हाल दर्ज करें', joy_w_read: 'कोई गाइड पढ़ें', joy_w_tool: 'कोई टूल इस्तेमाल करें, जैसे रिमाइंडर', joy_w_tool_p: 'कोई टूल इस्तेमाल करें, जैसे BP और वज़न का रिकॉर्ड',
        joy_w_checkin: 'महीने का चेक-इन करें', joy_w_ask: 'Qura डॉक्टर से बात करें', joy_earned: 'आज पंखुड़ी मिल गई', joy_plus: '+1 पंखुड़ी', joy_ci_done: 'इस महीने हो गया',
        joy_full_day: 'आज की 3 पंखुड़ियाँ मिल गईं। कल और।', joy_full_month: 'इस महीने का फूल पूरा हुआ। अगले महीने पंखुड़ियाँ फिर से शुरू होंगी।',
        joy_weeks_h: 'Sakhi के साथ हफ़्ते', joy_weeks_n: 'लगातार {n}', joy_weeks_p: 'एक पंखुड़ी मिलने पर हफ़्ता गिना जाता है। कोई हफ़्ता छूट गया? बस फिर से शुरू करें।',
        joy_badges_h: 'बैज', joy_year_h: 'इस साल आपका बगीचा', joy_foot: 'पंखुड़ियाँ और बैज सिर्फ़ आपके लिए हैं। ये आपकी सेहत का कोई स्कोर नहीं हैं।',
        joy_need_diary: 'अपना फूल उगाने के लिए डायरी शुरू करें। कार्ड डायरी के बिना भी चलते हैं।', joy_pop_petal: 'आज की एक पंखुड़ी', joy_pop_sub: '{m} का फूल: 12 में से {n}',
        joy_pop_bloom: 'आपका {m} का फूल पूरा हुआ', joy_pop_bloom_sub: '{f} आपके बगीचे में आ गया।', joy_pop_badge: 'नया बैज: {b}', joy_close: 'बंद करें', joy_earned_on: '{d} को मिला', joy_prog: 'अब तक {b} में से {a}', joy_locked: 'अभी नहीं',
        joy_b_first: 'पहली पंखुड़ी', joy_b_first_h: 'अपनी पहली पंखुड़ी पाएँ।', joy_b_fullday: 'पूरा दिन', joy_b_fullday_h: 'एक दिन में तीनों पंखुड़ियाँ पाएँ।', joy_b_trio: 'तीन फूल', joy_b_trio_h: 'महीने के 3 फूल पूरे करें।', joy_b_bloom: 'पूरा खिला फूल', joy_b_bloom_h: 'एक महीने में सभी 12 पंखुड़ियाँ पूरी करें।', joy_b_diary: 'डायरी वाली', joy_b_diary_h: '3 पीरियड की शुरुआत दर्ज करें।',
        joy_b_months: 'तीन महीने', joy_b_months_h: 'लगातार 3 महीने चेक-इन करें।', joy_b_curious: 'जानने की चाह', joy_b_curious_h: '5 गाइड पढ़ें।', joy_b_myth: 'भ्रम तोड़ने वाली', joy_b_myth_h: '10 सच या भ्रम कार्ड के जवाब दें।',
        joy_b_friend: 'अच्छी सहेली', joy_b_friend_h: 'किसी सहेली को एक कार्ड भेजें।', joy_b_planner: 'योजना वाली', joy_b_planner_h: 'एक रिमाइंडर लगाएँ।', joy_b_steady: 'लगातार', joy_b_steady_h: 'लगातार 4 हफ़्ते पंखुड़ी पाएँ।',
        joy_b_brave: 'हिम्मत भरा क़दम', joy_b_brave_h: 'Qura डॉक्टर से मुफ़्त कॉल माँगें।',
        joy_quiz_h: 'सच या भ्रम?', joy_quiz_tile_s: 'आम मान्यताओं पर रोज़ एक कार्ड, सही जवाब के साथ', joy_quiz_p: 'रोज़ एक कार्ड। सच या भ्रम चुनें, फिर जानें क्यों।',
        joy_sach: 'सच', joy_myth: 'भ्रम', joy_is_sach: 'सच: यह सही है', joy_is_myth: 'भ्रम: यह सही नहीं है', joy_right: 'आपको यह पता था।', joy_wrong: 'बहुत-सी महिलाएँ ऐसा ही सोचती हैं।',
        joy_share: 'सहेली को भेजें', joy_next: 'अगला कार्ड', joy_more: 'और पढ़ें', joy_card_n: 'आज का कार्ड {n} / {m}', joy_done_h: 'आज के लिए इतना ही। कल और कार्ड।', joy_to_garden: 'मेरा बगीचा देखें',
        joy_quiz_foot: 'ये कार्ड आधिकारिक स्वास्थ्य सलाह पर आधारित हैं। यह आम जानकारी है। अपनी सेहत के लिए डॉक्टर से बात करें।', joy_share_from: 'Qura Sakhi से, महिलाओं के लिए मुफ़्त हेल्थ ऐप।',
        joy_seen_all: 'आपने सभी कार्ड देख लिए। ये फिर से हैं।'
      }
    },
    routes: { 'joy': renderGarden, 'joy-quiz': renderQuiz, 'joy-month': (v) => renderMonth(v, null) },
    prefixes: { 'joy-month-': (v, rest) => renderMonth(v, rest) },
    testRoutes: ['joy-month-2026-09'],
    open: ['joy-quiz'],
    tiles: [
      { section: 'tools', route: 'joy', title: 'joy_h', sub: 'joy_tile_s', icon: 'flower', order: 1, gated: false, keywords: 'garden petals flower badges rewards bagicha phool पंखुड़ी बगीचा' },
      { section: 'tools', route: 'joy-quiz', title: 'joy_quiz_h', sub: 'joy_quiz_tile_s', icon: 'sparkle', order: 2, gated: false, keywords: 'myth fact quiz sach bhram card सच भ्रम' }
    ],
    event: (name, payload) => onEvent(name, payload || {}),
    me: () => (GARDEN && S.canSave() && S.art ? '<h2>' + esc(t('joy_h')) + '</h2><div class="list"><button type="button" class="item" data-go="joy"><span class="ico-sm hue hue-orange">' + S.I.flower + '</span><span class="body"><strong>' + esc(t('joy_h')) + '</strong><span>' + esc(tf('joy_petals_n', { n: monthPetals(D(), S.monthKey(S.today())) })) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' : ''),
    under18: () => '<button type="button" class="btn block" data-go="joy-quiz">' + esc(t('joy_quiz_h')) + '</button>',
    sample: (id) => sample(id),
    homeLast: () => dykHtml(),   /* Version 39.7: after setup and Coming up, never ahead of them */
    afterRender: (v, route) => {
      if (route !== 'joy-quiz') q = { id: null, ans: null };
      if (route === 'home') wireDyk(v);
    }
  });
})(window.Saathi);
