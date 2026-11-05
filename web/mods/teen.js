/* Girls and families: puberty, the first period, feelings and safety, free services for adolescents, and a guide for parents. Education only: every screen is open and nothing is saved. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const ID = 'teen';

  /* ---------- small helpers ---------- */
  const T = (o) => esc(tx(o));
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + (typeof x === 'string' ? esc(t(x)) : T(x)) + '</li>').join('') + '</ul>';
  const steps = (arr) => '<ol class="steps">' + arr.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol>';
  const intro = (o) => '<p class="small">' + T(o) + '</p>';
  const goBtn = (route, label) => '<button type="button" class="btn sm" style="align-self:flex-start" data-go="' + esc(route) + '">' + T(label) + '</button>';
  const linkItem = (route, icon, title, sub) => '<button type="button" class="item" data-go="' + esc(route) + '"><span class="ico-sm">' + S.icon(icon) + '</span><span class="body"><strong>' + esc(title) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span></button>';
  const ext = (href, label) => '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + T(label) + '</a>';
  const flag = (cls, inner) => '<div class="flag' + (cls ? ' ' + cls : '') + '"><span>' + inner + '</span></div>';
  const sec = (id, title, inner, cls) => '<section class="card teen-sec' + (cls ? ' ' + cls : '') + '" id="' + id + '"><h2>' + T(title) + '</h2>' + inner + '</section>';
  const jumps = (list) => '<div class="chips">' + list.map((j) => '<button type="button" class="chip" data-teen-jump="' + esc(j[0]) + '">' + T(j[1]) + '</button>').join('') + '</div>';
  const doctorCard = (title, items, urgent, extra) => '<div class="card"><h3 style="color:var(--accent)">' + T(title) + '</h3>' + ul(items) +
    (urgent ? flag('urgent', '<strong>' + esc(t('call_now')) + ':</strong> ' + esc(t('s1b'))) : '') + (extra || '') + '</div>';
  const myth = (m, f) => '<div class="card"><span class="pill muted" style="align-self:flex-start">' + T({ en: 'Myth', hi: 'मिथक' }) + '</span><h3>' + T(m) + '</h3>' +
    flag('ok', '<strong>' + T({ en: 'Fact', hi: 'सच' }) + ':</strong> ' + T(f)) + '</div>';
  const checklist = (items) => '<div class="checklist">' + items.map((x) => '<label><input type="checkbox" class="teen-check"> <span>' + T(x) + '</span></label>').join('') + '</div>' +
    '<p class="small">' + T({ en: 'Ticks stay only on this screen. Nothing is saved.', hi: 'टिक सिर्फ़ इसी स्क्रीन पर रहते हैं। कुछ भी save नहीं होता।' }) + '</p>';
  const FOOT = { en: 'Nothing on this page is saved. Under 18? A parent, guardian or another adult you trust can come with you to any doctor or clinic.', hi: 'इस पन्ने पर कुछ भी save नहीं होता। 18 से कम उम्र? माता-पिता, अभिभावक या कोई भरोसेमंद बड़ा किसी भी डॉक्टर या क्लिनिक में आपके साथ आ सकता है।' };
  const foot = () => '<p class="footnote">' + T(FOOT) + '</p>';

  /* Helplines, shown as text with a Copy button (no tel: links). */
  const HL = {
    '1098': { en: 'Childline: for anyone under 18. Free, day and night', hi: 'Childline: 18 से कम उम्र के लिए। मुफ़्त, दिन-रात' },
    '112': { en: 'Emergency: police, ambulance. Any time', hi: 'आपातकाल: पुलिस, एम्बुलेंस। कभी भी' },
    '1930': { en: 'National Cyber Crime Helpline: online threats, photos, fraud. Free, 24×7', hi: 'राष्ट्रीय साइबर क्राइम हेल्पलाइन: ऑनलाइन धमकी, फ़ोटो, धोखा। मुफ़्त, 24×7' },
    '14416': { en: 'Tele-MANAS: someone to talk to when you feel low. Free, 24×7', hi: 'Tele-MANAS: मन उदास हो तो बात करने के लिए। मुफ़्त, 24×7' },
    '181': { en: 'Women Helpline', hi: 'महिला हेल्पलाइन' },
    '104': { en: 'Health advice helpline', hi: 'स्वास्थ्य सलाह हेल्पलाइन' }
  };
  const lines = (nums0) => { const nums = nums0.filter((n) => !S.emNums || S.emNums([n]).indexOf(n) >= 0); if (!nums.length) return '';   /* Version 39.70: no 112, Tele-MANAS, 181 or Childline */
    return '<div class="list">' + nums.map((n) => '<div class="helpline"><div class="teen-hlw"><div class="n num">' + esc(n) + '</div><div class="what">' + T(HL[n]) + '</div></div><button type="button" class="btn sm" data-teen-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>').join('') + '</div>'; };

  function wireAll(v) {
    S.wire(v);
    v.querySelectorAll('[data-teen-jump]').forEach((b) => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.teenJump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    v.querySelectorAll('.teen-check').forEach((c) => c.addEventListener('change', () => { const l = c.closest('label'); if (l) l.classList.toggle('done', c.checked); }));
    v.querySelectorAll('[data-teen-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.teenCopy; const done = () => S.toast(t('copied') + ' ' + n);
      const pick = () => { try { const el = b.parentElement.querySelector('.n'); const r = document.createRange(); r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) { /* selection blocked */ } S.toast(n); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(done, pick); else pick(); } catch (e) { pick(); }
    }));
  }

  /* ---------- drawings (inline SVG, colours from tokens via module CSS) ---------- */
  /* Puberty timeline, drawn to scale: ages 8 to 16. Breasts start 8–13; first period 8–15, most at 12–13. */
  function pubertySvg() {
    const x = (age) => 14 + (age - 8) * 34;
    let ticks = '';
    for (let a = 8; a <= 16; a++) ticks += '<line class="ax" x1="' + x(a) + '" y1="94" x2="' + x(a) + '" y2="99"/><text x="' + x(a) + '" y="111" text-anchor="middle">' + a + '</text>';
    return '<svg class="teen-chart" viewBox="0 0 300 116" role="img" aria-label="' + T({ en: 'Ages when breasts start and the first period comes', hi: 'स्तन बढ़ना शुरू होने और पहले पीरियड की उम्र' }) + '">' +
      '<text class="lbl" x="' + x(8) + '" y="13">' + T({ en: 'Breasts start to grow', hi: 'स्तन बढ़ना शुरू' }) + '</text>' +
      '<rect class="bl" x="' + x(8) + '" y="19" width="' + (x(13) - x(8)) + '" height="14" rx="7"/>' +
      '<text class="lbl" x="' + x(8) + '" y="57">' + T({ en: 'First period', hi: 'पहला पीरियड' }) + '</text>' +
      '<rect class="bl" x="' + x(8) + '" y="63" width="' + (x(15) - x(8)) + '" height="14" rx="7"/>' +
      '<rect class="bd" x="' + x(12) + '" y="63" width="' + (x(14) - x(12)) + '" height="14" rx="7"/>' +
      '<line class="ax" x1="' + x(8) + '" y1="94" x2="' + x(16) + '" y2="94"/>' + ticks + '</svg>';
  }
  /* Example gaps in a girl's first year, to scale (0–60 days), with the usual 21–45 day band. */
  function gapsSvg() {
    const gaps = [33, 44, 24, 38, 29]; const y = (d) => 96 - (d / 60) * 88;
    let bars = '';
    gaps.forEach((g, i) => { const bx = 58 + i * 48; bars += '<rect class="bar" x="' + bx + '" y="' + y(g).toFixed(1) + '" width="28" height="' + (96 - y(g)).toFixed(1) + '" rx="4"/><text x="' + (bx + 14) + '" y="111" text-anchor="middle">' + g + '</text>'; });
    return '<svg class="teen-chart" viewBox="0 0 300 116" role="img" aria-label="' + T({ en: 'Example gaps of 33, 44, 24, 38 and 29 days, all inside the 21 to 45 day band', hi: 'उदाहरण: 33, 44, 24, 38 और 29 दिन के अंतर, सब 21 से 45 दिन की पट्टी के अंदर' }) + '">' +
      '<rect class="band" x="44" y="' + y(45).toFixed(1) + '" width="252" height="' + (y(21) - y(45)).toFixed(1) + '" rx="6"/>' +
      '<text x="38" y="' + (y(45) + 4).toFixed(1) + '" text-anchor="end">45</text><text x="38" y="' + (y(21) + 4).toFixed(1) + '" text-anchor="end">21</text>' +
      '<line class="ax" x1="44" y1="96" x2="296" y2="96"/>' + bars + '</svg>';
  }
  /* Four panels: peel the strip, stick it in the middle, fold the wings, wrap and bin. Underwear is drawn opened out, seen from above. */
  const PANTS = '<path class="u" d="M18 8 H102 C100 28 86 38 74 42 V60 C86 64 100 74 102 94 H18 C20 74 34 64 46 60 V42 C34 38 20 28 18 8 Z"/><path class="wb" d="M19 14 H101 M19 88 H101"/>';
  const ARROW_HEAD = (x, y, dir) => (dir === 'r' ? '<path class="a" d="M' + (x - 5) + ' ' + (y - 4) + ' L' + x + ' ' + y + ' L' + (x - 5) + ' ' + (y + 4) + '"/>' : '<path class="a" d="M' + (x - 4) + ' ' + (y - 5) + ' L' + x + ' ' + y + ' L' + (x + 4) + ' ' + (y - 5) + '"/>');
  /* Built at render time so the small SVG labels follow the current language. */
  const PAD_PANELS = () => [
    { svg: '<rect class="p" x="34" y="8" width="34" height="84" rx="16"/><rect class="wb" x="43" y="20" width="16" height="60" rx="8"/>' +
        '<rect class="s" x="80" y="14" width="14" height="72" rx="6" transform="rotate(10 87 50)"/><path class="a" d="M66 50 C70 46 74 46 78 48"/>' + ARROW_HEAD(80, 49, 'r'),
      cap: { en: 'Wash your hands. Open the pad and peel off the paper strip on the back.', hi: 'हाथ धोएँ। pad खोलें और पीछे की काग़ज़ की पट्टी उतारें।' } },
    { svg: PANTS + '<rect class="p" x="49" y="24" width="22" height="54" rx="11"/>' +
        '<text x="60" y="6" text-anchor="middle">' + T({ en: 'front', hi: 'आगे' }) + '</text><text x="60" y="104" text-anchor="middle">' + T({ en: 'back', hi: 'पीछे' }) + '</text>',
      cap: { en: 'Press it, sticky side down, onto the middle of your underwear.', hi: 'चिपकने वाली तरफ़ नीचे करके अंडरवियर के बीच में दबाकर चिपकाएँ।' } },
    { svg: PANTS + '<path class="w" d="M49 43 C40 44 34 48 34 51 C34 54 40 58 49 59 Z"/><path class="w" d="M71 43 C80 44 86 48 86 51 C86 54 80 58 71 59 Z"/><rect class="p" x="49" y="24" width="22" height="54" rx="11"/>' +
        '<path class="a" d="M30 51 C26 58 30 66 38 68"/>' + ARROW_HEAD(40, 68, 'r') + '<path class="a" d="M90 51 C94 58 90 66 82 68"/><path class="a" d="M85 64 L80 68 L85 72"/>',
      cap: { en: 'If it has wings, fold them under the underwear and press.', hi: 'अगर pad में पंख (wings) हैं, तो उन्हें अंडरवियर के नीचे मोड़कर दबा दें।' } },
    { svg: '<rect class="pp" x="8" y="44" width="40" height="26" rx="6"/><path class="wb" d="M14 52 H42 M14 58 H42 M14 64 H36"/>' +
        '<path class="a" d="M50 52 C58 40 66 36 74 38"/>' + ARROW_HEAD(77, 39, 'r') +
        '<path class="b" d="M80 44 H112 L107 96 H85 Z"/><path class="b" d="M76 38 H116 V44 H76 Z"/><path class="wb" d="M91 54 V88 M101 54 V88"/>',
      cap: { en: 'To throw it away, roll it up, wrap it in its wrapper or paper, and put it in the dustbin.', hi: 'फेंकने के लिए उसे लपेटें, उसके wrapper या काग़ज़ में बाँधें, और कूड़ेदान में डालें।' } }
  ];
  const padPanels = () => '<div class="teen-panels">' + PAD_PANELS().map((p, i) => '<div class="teen-panel"><div class="row" style="gap:8px;align-items:flex-start"><span class="teen-n num">' + (i + 1) + '</span><p>' + T(p.cap) + '</p></div><svg class="teen-fig" viewBox="0 -6 120 118" aria-hidden="true">' + p.svg + '</svg></div>').join('') + '</div>';

  /* ---------- hub ---------- */
  const GIRL_SCREENS = [
    ['teen-puberty', 'sparkle', 'teen_puberty', 'teen_puberty_s'],
    ['teen-first', 'flower', 'teen_first', 'teen_first_s'],
    ['teen-mind', 'heart', 'teen_mind', 'teen_mind_s'],
    ['teen-services', 'map', 'teen_services', 'teen_services_s']
  ];
  function renderHub(v) {
    v.innerHTML = S.backRow(t('teen_hub'), 'care', false) +
      intro({ en: `For girls 10–17 and their families. Plain answers about growing up, your first period, feelings and staying safe. You don't need a diary, and nothing on these pages is saved.`, hi: `10–17 साल की लड़कियों और उनके परिवार के लिए। बड़े होने, पहले पीरियड, मन की बातों और सुरक्षा पर सीधे-सरल जवाब। इसके लिए डायरी की ज़रूरत नहीं, और इन पन्नों पर कुछ भी save नहीं होता।` }) +
      '<h2>' + T({ en: 'For girls', hi: 'लड़कियों के लिए' }) + '</h2>' +
      '<div class="list">' + GIRL_SCREENS.map((x) => linkItem(x[0], x[1], t(x[2]), t(x[3]))).join('') + '</div>' +
      '<h2>' + T({ en: 'For mothers and fathers', hi: 'माँ और पापा के लिए' }) + '</h2>' +
      '<button type="button" class="action" data-go="teen-mother"><span class="ico accent">' + S.I.users + '</span><span class="body"><strong>' + esc(t('teen_mother')) + '</strong><span class="small">' + T({ en: 'When and how to talk, words you can use in Hindi and English, what to keep ready, and keeping her safe', hi: 'कब और कैसे बात करें, हिंदी और English में कहने के शब्द, क्या तैयार रखें, और उसकी सुरक्षा' }) + '</span></span><span class="go">' + S.I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' +
      doctorCard({ en: 'See a doctor with a parent if', hi: 'माता-पिता के साथ डॉक्टर को दिखाएँ अगर' }, [
        's5a',
        { en: 'Breasts, hair on the private parts or a period start before age 8', hi: '8 साल से पहले स्तन बढ़ने लगें, प्राइवेट पार्ट पर बाल आएँ या पीरियड शुरू हो जाए' },
        { en: 'A period lasts more than 7 days, or soaks a pad every 1–2 hours', hi: 'पीरियड 7 दिन से ज़्यादा चले, या हर 1–2 घंटे में pad भीग जाए' },
        { en: 'Period pain keeps you home from school', hi: 'पीरियड के दर्द की वजह से स्कूल छूट जाए' }
      ], true, '<p class="small">' + T({ en: 'The teen clinic (AFHC) at a government hospital is free.', hi: 'सरकारी अस्पताल का किशोर क्लिनिक (AFHC) मुफ़्त है।' }) + '</p><div class="row wrap">' + goBtn('teen-services', { en: 'Free help', hi: 'मुफ़्त मदद' }) + goBtn('help', { en: 'Safety guide', hi: 'सुरक्षा गाइड' }) + '</div>') +
      foot();   /* Version 39.70: no helplines (Childline and Tele-MANAS are gone) */
    wireAll(v);
  }

  /* ---------- puberty ---------- */
  const CHANGES = [
    ['heart', { en: 'Breasts', hi: 'स्तन' }, { en: 'First a small lump grows under one or both nipples, and it can feel tender. This is a breast bud, not an illness. One side often grows faster than the other; most even out with time. A soft cotton slip or bra helps when you feel ready.', hi: 'पहले एक या दोनों निप्पल के नीचे छोटी-सी गाँठ बनती है, जिसमें हल्का दर्द हो सकता है। यह स्तन का बढ़ना शुरू होना है, कोई बीमारी नहीं। अक्सर एक तरफ़ पहले बढ़ता है; ज़्यादातर समय के साथ बराबर हो जाते हैं। जब आप तैयार महसूस करें, मुलायम सूती slip या bra पहन सकती हैं।' }],
    ['leaf', { en: 'Hair', hi: 'बाल' }, { en: 'Hair grows around your private parts, and a little later under your arms. Hair on your arms and legs may get darker. It is normal, and it is not dirty. Removing it or not is your choice.', hi: 'प्राइवेट पार्ट के आसपास बाल आते हैं, और थोड़ा बाद में बगल में। हाथ-पैर के बाल गहरे हो सकते हैं। यह सामान्य है, गंदा नहीं। हटाना है या नहीं, यह आपकी मर्ज़ी है।' }],
    ['chart', { en: 'Height and shape', hi: 'लंबाई और शरीर का आकार' }, { en: 'For a while you grow taller quickly: a growth spurt. Your hips get wider and your body gets curvier. Putting on some weight now is part of growing, not a reason to diet. Eat full meals: dal, green vegetables, milk or curd, and eggs or meat if your family eats them.', hi: 'कुछ समय तक लंबाई तेज़ी से बढ़ती है। कूल्हे चौड़े होते हैं और शरीर भरता है। इस समय थोड़ा वज़न बढ़ना बढ़ने का हिस्सा है, diet करने की वजह नहीं। पूरा खाना खाएँ: दाल, हरी सब्ज़ियाँ, दूध या दही, और अगर घर में खाते हैं तो अंडा या मांस।' }],
    ['drop', { en: 'White discharge', hi: 'सफ़ेद पानी' }, { en: 'You may see clear or white, slightly sticky wetness in your underwear. It often starts about 6 months before your first period. It is how the body keeps the vagina clean. Wash the outside with plain water; no soap inside.', hi: 'अंडरवियर में साफ़ या सफ़ेद, थोड़ा चिपचिपा पानी दिख सकता है। यह अक्सर पहले पीरियड से लगभग 6 महीने पहले शुरू होता है। यह शरीर का योनि को साफ़ रखने का तरीक़ा है। बाहर से सादे पानी से धोएँ; अंदर साबुन नहीं।' },
      { en: 'See a doctor if it itches, burns, smells bad, or turns green, grey or thick like curd.', hi: 'डॉक्टर को दिखाएँ अगर खुजली हो, जलन हो, बदबू आए, या रंग हरा, सलेटी या दही जैसा गाढ़ा हो जाए।' }],
    ['sparkle', { en: 'Pimples', hi: 'मुँहासे' }, { en: `Puberty hormones make your skin oilier, so pimples are common. Wash your face twice a day with mild soap and water. Don't squeeze or pick them; that leaves marks. If they are painful, large or leave scars, a doctor can treat them.`, hi: 'प्यूबर्टी के हॉर्मोन से त्वचा ज़्यादा तैलीय होती है, इसलिए मुँहासे आम हैं। दिन में दो बार हल्के साबुन और पानी से चेहरा धोएँ। उन्हें दबाएँ या नोचें नहीं; इससे दाग़ रह जाते हैं। दर्द वाले, बड़े या दाग़ छोड़ने वाले मुँहासों का डॉक्टर इलाज कर सकती हैं।' }],
    ['clock', { en: 'Sweat and smell', hi: 'पसीना और गंध' }, { en: 'New sweat glands start working under your arms, and sweat can smell. Bathe every day, wear clean cotton clothes, and change after sport. A deodorant is optional.', hi: 'बगल में पसीने की नई ग्रंथियाँ काम करने लगती हैं, और पसीने से गंध आ सकती है। रोज़ नहाएँ, साफ़ सूती कपड़े पहनें, और खेल के बाद कपड़े बदलें। deodorant लगाना ज़रूरी नहीं।' }]
  ];
  function renderPuberty(v) {
    v.innerHTML = S.backRow(t('teen_puberty'), 'teen', false) +
      intro({ en: `Puberty is the time your body slowly changes from a girl's to a young woman's. It usually starts between 8 and 13 and takes a few years. Every girl goes at her own pace, so being earlier or later than your friends is normal.`, hi: 'प्यूबर्टी (किशोरावस्था) वह समय है जब आपका शरीर धीरे-धीरे बच्ची से जवान लड़की का बनता है। यह आम तौर पर 8 से 13 साल के बीच शुरू होती है और कुछ साल चलती है। हर लड़की की अपनी रफ़्तार होती है, इसलिए सहेलियों से पहले या बाद में होना सामान्य है।' }) +
      '<div class="card"><h3>' + T({ en: 'When things usually happen', hi: 'आम तौर पर कब क्या होता है' }) + '</h3>' + pubertySvg() +
      '<div class="teen-legend"><span><i class="teen-sw-l"></i>' + T({ en: 'Usual range', hi: 'आम उम्र' }) + '</span><span><i class="teen-sw-d"></i>' + T({ en: 'Most girls: at 12 or 13 years old', hi: 'ज़्यादातर लड़कियाँ: 12 या 13 साल की उम्र में' }) + '</span><span>' + T({ en: 'Numbers: age in years', hi: 'अंक: उम्र, सालों में' }) + '</span></div>' +
      '<p class="small">' + T({ en: 'The first period usually comes about 2–3 years after breasts start to grow. A clear or white discharge often starts about 6 months before it.', hi: 'पहला पीरियड आम तौर पर स्तन बढ़ना शुरू होने के लगभग 2–3 साल बाद आता है। उससे लगभग 6 महीने पहले अक्सर साफ़ या सफ़ेद पानी आना शुरू होता है।' }) + '</p></div>' +
      '<h2>' + T({ en: 'What changes', hi: 'क्या बदलता है' }) + '</h2>' +
      CHANGES.map((c) => '<div class="card teen-ch"><span class="ico-sm">' + S.icon(c[0]) + '</span><div class="body"><h3>' + T(c[1]) + '</h3><p class="teen-body">' + T(c[2]) + '</p>' + (c[3] ? flag('', T(c[3])) : '') + '</div></div>').join('') +
      '<div class="card soft teen-ch"><span class="ico-sm">' + S.I.heart + '</span><div class="body"><h3>' + T({ en: 'Feelings', hi: 'मन' }) + '</h3><p class="teen-body">' + T({ en: 'You may feel happy one hour and upset the next, or think a lot more about how you look. That is common too.', hi: 'एक घंटे ख़ुशी और अगले घंटे उदासी हो सकती है, या अपने रूप के बारे में पहले से बहुत ज़्यादा सोच सकती हैं। यह भी आम है।' }) + '</p>' + goBtn('teen-mind', { en: 'Feelings, friends and safety', hi: 'मन, दोस्ती और सुरक्षा' }) + '</div></div>' +
      doctorCard({ en: 'See a doctor with a parent if', hi: 'माता-पिता के साथ डॉक्टर को दिखाएँ अगर' }, [
        's5a',
        { en: 'Breasts, hair on the private parts or a period start before age 8', hi: '8 साल से पहले स्तन बढ़ने लगें, प्राइवेट पार्ट पर बाल आएँ या पीरियड शुरू हो जाए' },
        { en: 'Thick dark hair on the face, chest or belly keeps increasing, often with periods far apart. A doctor can check why.', hi: 'चेहरे, छाती या पेट पर मोटे काले बाल बढ़ते जाएँ, अक्सर पीरियड में लंबे अंतर के साथ। डॉक्टर इसकी वजह जाँच सकती हैं।' },
        { en: 'Discharge that itches, burns or smells bad', hi: 'सफ़ेद पानी के साथ खुजली, जलन या बदबू' }
      ], false, '<p class="small">' + T({ en: 'The teen clinic (AFHC) at a PHC, CHC or district hospital is free and private.', hi: 'PHC, CHC या ज़िला अस्पताल का किशोर क्लिनिक (AFHC) मुफ़्त और निजी है।' }) + '</p>' + goBtn('teen-services', { en: 'Free help for girls', hi: 'लड़कियों के लिए मुफ़्त मदद' })) +
      foot();
    wireAll(v);
  }

  /* ---------- first period ---------- */
  function renderFirst(v) {
    v.innerHTML = S.backRow(t('teen_first'), 'teen', false) +
      intro({ en: 'Your first period is a sign your body is growing well. Knowing what to expect, and keeping a small kit in your bag, makes the day much easier.', hi: 'पहला पीरियड इस बात का संकेत है कि आपका शरीर ठीक से बढ़ रहा है। क्या होगा यह पहले से जानना, और बैग में एक छोटी किट रखना, उस दिन को बहुत आसान बना देता है।' }) +
      jumps([['f-what', { en: 'What it is', hi: 'यह क्या है' }], ['f-kit', { en: 'Kit', hi: 'किट' }], ['f-pad', { en: 'Using a pad', hi: 'pad लगाना' }], ['f-school', { en: 'At school', hi: 'स्कूल में' }], ['f-pain', { en: 'Pain', hi: 'दर्द' }], ['f-gaps', { en: 'Gaps', hi: 'अंतर' }], ['f-myths', { en: 'Myths', hi: 'मिथक' }]]) +
      sec('f-what', { en: 'What a period is', hi: 'पीरियड क्या है' },
        '<p>' + T({ en: `Every month the womb, a small organ low in your belly, builds a soft lining of blood and tissue. When the body doesn't need it, the lining comes out through the vagina over a few days. That bleeding is your period. It is not dirty blood, and it does not mean you are hurt or ill.`, hi: 'हर महीने गर्भाशय (पेट के निचले हिस्से में एक छोटा अंग) अंदर ख़ून और ऊतक की एक नरम परत बनाता है। जब शरीर को इसकी ज़रूरत नहीं होती, तो यह परत कुछ दिनों में योनि से बाहर आती है। यही ब्लीडिंग आपका पीरियड है। यह गंदा ख़ून नहीं है, और इसका मतलब यह नहीं कि आपको चोट लगी है या आप बीमार हैं।' }) + '</p>' +
        '<h3>' + T({ en: 'What to expect', hi: 'क्या होगा' }) + '</h3>' +
        ul([{ en: 'Most girls get their first period at 12–13. Anywhere from 8 to 15 can be normal.', hi: 'ज़्यादातर लड़कियों को पहला पीरियड 12–13 साल में आता है। 8 से 15 साल के बीच कभी भी सामान्य हो सकता है।' },
          { en: 'The first ones are often light: a few brown or red spots in your underwear.', hi: 'पहले पीरियड अक्सर हल्के होते हैं: अंडरवियर में कुछ भूरे या लाल धब्बे।' },
          { en: 'A period lasts 2–7 days.', hi: 'पीरियड 2–7 दिन चलता है।' },
          { en: 'Some girls get cramps, backache or sore breasts just before or during a period.', hi: 'कुछ लड़कियों को पीरियड से ठीक पहले या उसके दौरान पेट में ऐंठन, कमर दर्द या स्तनों में दर्द होता है।' }])) +
      sec('f-kit', { en: 'A first-period kit for your bag', hi: 'बैग के लिए पहले पीरियड की किट' },
        '<p class="small">' + T({ en: 'Pack it in a small pouch once your breasts start growing or you notice white discharge.', hi: 'जब स्तन बढ़ने लगें या सफ़ेद पानी दिखे, तब इसे एक छोटी पाउच में रख लें।' }) + '</p>' +
        checklist([{ en: '2–3 pads, or clean folded cotton cloth pads', hi: '2–3 pad, या साफ़, तह किए सूती कपड़े के pad' },
          { en: 'A spare pair of underwear', hi: 'एक जोड़ी extra अंडरवियर' },
          { en: 'A small paper bag or old newspaper, to wrap a used pad', hi: 'इस्तेमाल किया pad लपेटने के लिए छोटा काग़ज़ का लिफ़ाफ़ा या पुराना अख़बार' },
          { en: 'A small soap or a few tissues', hi: 'छोटा साबुन या कुछ tissue' },
          { en: 'A dark sweater or dupatta to tie around your waist if blood shows', hi: 'ख़ून का दाग़ दिखे तो कमर पर बाँधने के लिए गहरे रंग का sweater या दुपट्टा' },
          { en: `A note with a parent's phone number`, hi: 'माता-पिता के फ़ोन नंबर वाली पर्ची' }])) +
      sec('f-pad', { en: 'How to use a pad', hi: 'pad कैसे लगाएँ' },
        padPanels() +
        ul([{ en: 'Change it at least every 4–8 hours, or sooner if it feels full or wet. A longer pad helps at night.', hi: 'कम से कम हर 4–8 घंटे में बदलें, या भरा या गीला लगे तो पहले। रात में लंबा pad काम आता है।' },
          { en: 'Never flush a pad down the toilet. It blocks the drain.', hi: 'pad कभी toilet में flush न करें। इससे नाली बंद होती है।' },
          { en: 'Wash your hands after changing. Wash the outside of your private parts with plain water once or twice a day.', hi: 'बदलने के बाद हाथ धोएँ। दिन में एक-दो बार प्राइवेट पार्ट को बाहर से सादे पानी से धोएँ।' }]) +
        goBtn('periods-products', { en: 'Cloth pads, cups and more', hi: 'कपड़े के pad, cup और बाकी' })) +
      sec('f-school', { en: 'At school', hi: 'स्कूल में' },
        ul([{ en: 'Who to ask: your class teacher or any woman teacher, the school nurse, or a friend. You can say, "My period has started, I need a pad." Teachers hear this often.', hi: 'किससे कहें: क्लास टीचर या कोई भी मैडम, स्कूल की नर्स, या कोई सहेली। आप कह सकती हैं, "मेरा पीरियड शुरू हो गया है, मुझे pad चाहिए।" टीचर यह अक्सर सुनती हैं।' },
          { en: 'Many government schools have two teachers trained as Health and Wellness Ambassadors. You can take your questions to them.', hi: 'कई सरकारी स्कूलों में दो टीचर "हेल्थ एंड वेलनेस एम्बेसडर" के रूप में प्रशिक्षित होते हैं। आप अपने सवाल उनके पास ले जा सकती हैं।' },
          { en: `Free pads: the Supreme Court has directed every school, government or private, to give girls free pads, kept in the girls' toilet or with a named teacher. Ask where they are kept. If your school doesn't have them yet, a parent can ask the head teacher.`, hi: 'मुफ़्त pad: सुप्रीम कोर्ट ने हर स्कूल को, सरकारी हो या प्राइवेट, लड़कियों को मुफ़्त pad देने का निर्देश दिया है, जो लड़कियों के toilet में या किसी तय टीचर के पास रखे हों। पूछें कि pad कहाँ रखे हैं। अगर आपके स्कूल में अभी नहीं हैं, तो माता-पिता प्रधानाध्यापक से बात कर सकते हैं।' },
          { en: 'Leaked? Tie your sweater or dupatta around your waist, ask to go to the toilet and change. Blood washes out best with cold water and soap.', hi: 'दाग़ लग गया? sweater या दुपट्टा कमर पर बाँधें, toilet जाने की इजाज़त लें और pad बदलें। ख़ून का दाग़ ठंडे पानी और साबुन से सबसे अच्छा निकलता है।' },
          { en: 'You can go to class, write exams and play on your period.', hi: 'पीरियड में आप क्लास, परीक्षा और खेल, सब कर सकती हैं।' }])) +
      sec('f-pain', { en: 'Period pain', hi: 'पीरियड का दर्द' },
        '<p class="teen-body">' + T({ en: 'Cramps in the lower belly or back for the first day or two are common. What helps:', hi: 'पहले एक-दो दिन पेट के निचले हिस्से या कमर में ऐंठन होना आम है। इससे आराम मिलता है:' }) + '</p>' +
        ul([{ en: 'A hot water bottle or warm cloth on your belly or lower back', hi: 'पेट या कमर पर गर्म पानी की बोतल या गर्म कपड़ा' },
          { en: 'Walking, light exercise or gentle stretching', hi: 'टहलना, हल्की कसरत या धीरे-धीरे stretching' },
          { en: 'Warm drinks and rest', hi: 'गर्म पेय और आराम' },
          { en: 'Before taking any tablet for pain, ask a parent or doctor, and follow the leaflet.', hi: 'दर्द की कोई भी गोली लेने से पहले माता-पिता या डॉक्टर से पूछें, और पर्चे पर लिखे तरीक़े से ही लें।' }]) +
        flag('', T({ en: `If pain keeps you home from school, or tablets don't help, see a doctor with a parent. Painful periods can be treated.`, hi: 'अगर दर्द की वजह से स्कूल छूटता है, या गोली से आराम नहीं मिलता, तो माता-पिता के साथ डॉक्टर को दिखाएँ। दर्द वाले पीरियड का इलाज होता है।' })) +
        goBtn('periods-pain', { en: 'More on period pain', hi: 'पीरियड के दर्द पर और जानकारी' })) +
      sec('f-gaps', { en: 'Irregular periods are normal at first', hi: 'शुरू में पीरियड का अनियमित होना सामान्य है' },
        '<p class="teen-body">' + T({ en: 'Count from the first day of one period to the first day of the next. In the first years, that gap can be anywhere from 21 to 45 days, and it often changes from month to month. Periods usually settle over the first 2–3 years; some girls take longer.', hi: 'एक पीरियड के पहले दिन से अगले पीरियड के पहले दिन तक गिनें। शुरुआती सालों में यह अंतर 21 से 45 दिन तक कुछ भी हो सकता है, और अक्सर हर महीने बदलता है। पीरियड आम तौर पर पहले 2–3 साल में नियमित होते हैं; कुछ लड़कियों को ज़्यादा समय लगता है।' }) + '</p>' +
        gapsSvg() +
        '<div class="teen-legend"><span><i class="teen-sw-band"></i>' + T({ en: 'Usual band: 21–45 days', hi: 'आम पट्टी: 21–45 दिन' }) + '</span><span><i class="teen-sw-bar"></i>' + T({ en: `Example: one girl's first 5 gaps, in days`, hi: 'उदाहरण: एक लड़की के पहले 5 अंतर, दिनों में' }) + '</span></div>' +
        '<p class="small">' + T({ en: 'Mark the first day of each period on a paper calendar. It helps if you ever need to see a doctor.', hi: 'हर पीरियड का पहला दिन काग़ज़ के कैलेंडर पर निशान लगाएँ। कभी डॉक्टर को दिखाना पड़े तो यह काम आता है।' }) + '</p>') +
      '<h2 class="teen-sec" id="f-myths">' + T({ en: 'Myths: no restriction is needed', hi: 'मिथक: कोई रोक-टोक ज़रूरी नहीं' }) + '</h2>' +
      myth({ en: `Don't bathe or wash your hair during a period.`, hi: 'पीरियड में नहाना या बाल धोना नहीं चाहिए।' }, { en: 'Bathing keeps you clean, and a warm bath can ease cramps. Bathe and wash your hair as usual.', hi: 'नहाने से आप साफ़ रहती हैं, और गुनगुने पानी से नहाने पर ऐंठन में आराम मिल सकता है। हमेशा की तरह नहाएँ और बाल धोएँ।' }) +
      myth({ en: 'Girls should stay home from school on period days.', hi: 'पीरियड के दिनों में लड़कियों को स्कूल नहीं जाना चाहिए।' }, { en: 'A period is not an illness. With a pad and your kit, you can go to school and sit exams. If pain keeps you home, see a doctor; it can be treated.', hi: 'पीरियड बीमारी नहीं है। pad और अपनी किट के साथ आप स्कूल जा सकती हैं और परीक्षा दे सकती हैं। अगर दर्द से स्कूल छूटे, तो डॉक्टर को दिखाएँ; इसका इलाज है।' }) +
      myth({ en: 'No running, sport, yoga or dance during a period.', hi: 'पीरियड में दौड़ना, खेलना, योग या डांस नहीं करना चाहिए।' }, { en: 'Exercise is safe on your period and often eases cramps. Change your pad before you play.', hi: 'पीरियड में कसरत सुरक्षित है और अक्सर ऐंठन कम करती है। खेलने से पहले pad बदल लें।' }) +
      myth({ en: `Stay out of the kitchen and don't touch the pickle.`, hi: 'रसोई में मत जाओ और अचार मत छुओ।' }, { en: 'A period does not spoil food. Washing your hands keeps food clean on every day of the month.', hi: 'पीरियड से खाना ख़राब नहीं होता। हाथ धोने से खाना महीने के हर दिन साफ़ रहता है।' }) +
      goBtn('periods-myths', { en: 'More myths and facts', hi: 'और मिथक और सच' }) +
      doctorCard({ en: 'See a doctor with a parent if', hi: 'माता-पिता के साथ डॉक्टर को दिखाएँ अगर' }, [
        { en: 'Your period lasts more than 7 days, or you soak a pad every 1–2 hours', hi: 'पीरियड 7 दिन से ज़्यादा चले, या हर 1–2 घंटे में pad भीग जाए' },
        { en: 'Periods come more often than every 21 days, or less often than every 45 days', hi: 'पीरियड 21 दिन से पहले बार-बार आएँ, या 45 दिन से ज़्यादा के अंतर पर आएँ' },
        { en: 'Your periods started, then stopped for more than 3 months', hi: 'पीरियड शुरू होकर फिर 3 महीने से ज़्यादा बंद रहें' },
        { en: 'Pain keeps you home from school', hi: 'दर्द की वजह से स्कूल छूट जाए' },
        's5a'
      ], true, goBtn('help', { en: 'Safety guide', hi: 'सुरक्षा गाइड' })) +
      foot();
    wireAll(v);
  }

  /* ---------- feelings, friends and safety ---------- */
  function renderMind(v) {
    v.innerHTML = S.backRow(t('teen_mind'), 'teen', false) +
      intro({ en: 'Growing up is not only about your body. Feelings, friendships and life on the phone change too. Here is what is normal, what is not OK, and who can help.', hi: 'बड़ा होना सिर्फ़ शरीर के बारे में नहीं है। मन, दोस्ती और फ़ोन की दुनिया भी बदलती है। यहाँ जानिए क्या सामान्य है, क्या ठीक नहीं, और कौन मदद कर सकता है।' }) +
      jumps([['m-feel', { en: 'Feelings', hi: 'मन' }], ['m-body', { en: 'Body image', hi: 'अपना रूप' }], ['m-friends', { en: 'Bullying', hi: 'तंग करना' }], ['m-online', { en: 'Online', hi: 'ऑनलाइन' }], ['m-touch', { en: 'Safe touch', hi: 'सही-ग़लत छूना' }], ['m-consent', { en: 'Consent', hi: 'सहमति' }], ['m-tell', { en: 'Who to tell', hi: 'किसे बताएँ' }]]) +
      sec('m-feel', { en: 'Feelings and moods', hi: 'मन और मूड' },
        '<p class="teen-body">' + T({ en: 'Changing hormones, exams and friendships can make you feel happy one hour and like crying the next. You may want more privacy, or feel shy about your body. This is common.', hi: 'बदलते हॉर्मोन, परीक्षा और दोस्ती की वजह से एक घंटे ख़ुशी और अगले घंटे रोने का मन हो सकता है। आपको अपने लिए ज़्यादा जगह और निजता चाहिए हो सकती है, या अपने शरीर को लेकर झिझक हो सकती है। यह आम है।' }) + '</p>' +
        '<h3>' + T({ en: 'What helps', hi: 'किससे मदद मिलती है' }) + '</h3>' +
        ul([{ en: 'Enough sleep, with the phone away at bedtime', hi: 'पूरी नींद, और सोते समय फ़ोन दूर' },
          { en: 'Moving your body every day: play, walk, dance', hi: 'रोज़ शरीर को चलाएँ: खेलें, टहलें, नाचें' },
          { en: 'Talking to someone you trust', hi: 'किसी भरोसेमंद से बात करना' },
          { en: 'Writing down what you feel', hi: 'जो महसूस हो रहा है, उसे लिख लेना' }]) +
        flag('', esc(t('s6a')))) +
      sec('m-body', { en: 'Your body, your looks', hi: 'आपका शरीर, आपका रूप' },
        ul([{ en: 'Bodies come in many shapes and colours. Gaining weight in puberty is growth, not a problem to fix.', hi: 'शरीर कई आकार और रंग के होते हैं। प्यूबर्टी में वज़न बढ़ना बढ़ने का हिस्सा है, कोई कमी नहीं जिसे ठीक करना हो।' },
          { en: 'Skipping meals or crash diets can make you weak, cause anaemia and even stop your periods.', hi: 'खाना छोड़ने या कड़ी diet से कमज़ोरी और ख़ून की कमी (anaemia) हो सकती है, और पीरियड भी रुक सकते हैं।' },
          { en: 'Photos and videos online are often edited and filtered. Real skin has pores, marks and hair.', hi: 'ऑनलाइन फ़ोटो और वीडियो अक्सर edit और filter किए होते हैं। असली त्वचा पर रोमछिद्र, निशान और बाल होते हैं।' },
          { en: 'Your skin colour is not a flaw.', hi: 'आपकी त्वचा का रंग कोई कमी नहीं है।' }]) +
        flag('', T({ en: 'If you are scared of eating, make yourself vomit, or think about your weight most of the day, tell a parent or a doctor. This can be treated.', hi: 'अगर खाने से डर लगे, आप ख़ुद उल्टी करती हों, या दिन भर वज़न के बारे में सोचती रहें, तो माता-पिता या डॉक्टर को बताएँ। इसका इलाज होता है।' }))) +
      sec('m-friends', { en: 'Friendships and bullying', hi: 'दोस्ती और तंग करना (bullying)' },
        '<p class="teen-body">' + T({ en: `A good friend respects your "no" and doesn't make you feel small.`, hi: 'अच्छी सहेली आपकी "ना" का सम्मान करती है और आपको छोटा महसूस नहीं कराती।' }) + '</p>' +
        '<p class="teen-body">' + T({ en: 'Bullying is hitting, name-calling, mocking your body, caste or religion, leaving someone out on purpose, or spreading rumours, in person or online. It is never your fault.', hi: 'तंग करना (bullying) मतलब मारना, बुरे नाम से बुलाना, शरीर, जाति या धर्म का मज़ाक उड़ाना, जानबूझकर अलग कर देना, या अफ़वाह फैलाना, आमने-सामने या ऑनलाइन। इसमें आपकी कोई ग़लती नहीं।' }) + '</p>' +
        ul([{ en: `Don't face it alone. Tell a parent, and a teacher or the principal.`, hi: 'अकेले न सहें। माता-पिता को, और किसी टीचर या प्रिंसिपल को बताएँ।' },
          { en: 'Keep screenshots of messages, with dates.', hi: 'मैसेज के screenshot तारीख़ के साथ संभालकर रखें।' },
          { en: 'If you see someone else being bullied, stand with them or tell an adult.', hi: 'अगर किसी और को तंग किया जा रहा हो, तो उसका साथ दें या किसी बड़े को बताएँ।' }])) +
      sec('m-online', { en: 'Online safety', hi: 'ऑनलाइन सुरक्षा' },
        ul([{ en: `Never send photos or videos of your body, even to someone you like or trust. Once sent, you can't take them back.`, hi: 'अपने शरीर की फ़ोटो या वीडियो कभी न भेजें, चाहे सामने वाला पसंद हो या भरोसेमंद लगे। एक बार भेजने के बाद वापस नहीं ले सकतीं।' },
          { en: 'Keep your passwords, home address, school name and live location to yourself.', hi: 'अपना password, घर का पता, स्कूल का नाम और live location किसी को न बताएँ।' },
          { en: 'People online may not be who they say they are. Never meet an online friend alone; take a parent.', hi: 'ऑनलाइन लोग वैसे नहीं होते जैसा वे बताते हैं। ऑनलाइन दोस्त से कभी अकेले न मिलें; माता-पिता को साथ ले जाएँ।' }]) +
        '<div class="card warn"><h3>' + T({ en: 'If someone asks for photos, threatens you or asks for money', hi: 'अगर कोई फ़ोटो माँगे, धमकाए या पैसे माँगे' }) + '</h3>' +
        steps([{ en: `Don't reply, don't pay, and don't send anything more.`, hi: 'जवाब न दें, पैसे न दें, और कुछ भी और न भेजें।' },
          { en: 'Take screenshots, then block and report the account.', hi: 'screenshot लें, फिर उस account को block और report करें।' },
          { en: 'Tell a parent or a teacher today.', hi: 'आज ही माता-पिता या किसी टीचर को बताएँ।' },
          { en: 'Call the National Cyber Crime Helpline 1930, or report at cybercrime.gov.in.', hi: 'राष्ट्रीय साइबर क्राइम हेल्पलाइन 1930 पर कॉल करें, या cybercrime.gov.in पर शिकायत करें।' }]) +
        '<p class="small" style="color:var(--fg)">' + T({ en: 'It is not your fault. The person threatening you is the one breaking the law.', hi: 'इसमें आपकी ग़लती नहीं है। धमकाने वाला क़ानून तोड़ रहा है।' }) + '</p></div>' +
        lines(['1930']) + '<p class="small">' + ext('https://cybercrime.gov.in/', { en: 'National Cyber Crime Reporting Portal (cybercrime.gov.in)', hi: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in)' }) + '</p>') +
      sec('m-touch', { en: 'Safe and unsafe touch', hi: 'सही और ग़लत छूना' },
        '<div class="grid2"><div class="card ok" style="padding:12px;gap:6px"><h3 style="color:var(--ok)">' + T({ en: 'Safe touch', hi: 'सही छूना' }) + '</h3><p class="small" style="color:var(--ok)">' + T({ en: 'A hug from family when you want one, a high-five from a friend, a doctor checking you with a parent in the room. It feels caring, and you can say no.', hi: 'जब आप चाहें तब घरवालों का गले लगाना, सहेली की ताली, माता-पिता के सामने डॉक्टर का जाँच करना। इसमें अपनापन लगता है, और आप मना कर सकती हैं।' }) + '</p></div>' +
        '<div class="card warn" style="padding:12px;gap:6px"><h3>' + T({ en: 'Unsafe touch', hi: 'ग़लत छूना' }) + '</h3><p class="small" style="color:var(--fg)">' + T({ en: 'Anyone touching your private parts (chest, between your legs, bottom), asking you to touch theirs, showing you sexual photos or videos, or asking you to keep a touch secret.', hi: 'कोई आपके प्राइवेट पार्ट (छाती, टाँगों के बीच, नितंब) छुए, आपसे अपने छुआए, आपको गंदी फ़ोटो या वीडियो दिखाए, या छूने की बात छिपाने को कहे।' }) + '</p></div></div>' +
        '<p class="teen-body">' + T({ en: 'Unsafe touch can come from someone you know well: a relative, a neighbour, a tutor, a driver or an older child.', hi: 'ग़लत छूना किसी जान-पहचान वाले से भी हो सकता है: रिश्तेदार, पड़ोसी, ट्यूशन टीचर, ड्राइवर या कोई बड़ा बच्चा।' }) + '</p>' +
        steps([{ en: 'Say NO, loudly.', hi: 'ज़ोर से "ना" कहें।' },
          { en: 'Get away from that person.', hi: 'उस व्यक्ति से दूर चली जाएँ।' },
          { en: `Tell an adult you trust. If they don't listen, tell another.`, hi: 'किसी भरोसेमंद बड़े को बताएँ। अगर वे न सुनें, तो किसी और को बताएँ।' }]) +
        '<p class="small">' + T({ en: 'Surprises, like a birthday gift, are fine to keep. Secrets about touch are never OK.', hi: 'जन्मदिन के तोहफ़े जैसा surprise छिपाना ठीक है। छूने से जुड़ा राज़ कभी ठीक नहीं।' }) + '</p>') +
      sec('m-consent', { en: 'Consent: your body, your say', hi: 'सहमति: आपका शरीर, आपकी मर्ज़ी' },
        ul([{ en: 'You can say no to a hug, a touch, a kiss or a photo, even with someone in your family.', hi: 'आप गले लगने, छूने, चूमने या फ़ोटो के लिए मना कर सकती हैं, परिवार के किसी व्यक्ति को भी।' },
          { en: `Yes once doesn't mean yes always. You can change your mind at any time.`, hi: 'एक बार "हाँ" का मतलब हमेशा "हाँ" नहीं। आप कभी भी अपना मन बदल सकती हैं।' },
          { en: 'A yes given out of fear, under pressure or for a gift is not a real yes.', hi: 'डर, दबाव या किसी तोहफ़े के बदले दी गई "हाँ" असली "हाँ" नहीं है।' },
          { en: 'Other people can say no to you too, and you respect it.', hi: 'दूसरे भी आपको मना कर सकते हैं, और आप उसका सम्मान करें।' }]) +
        '<div class="card soft"><h3>' + T({ en: 'POCSO protects children', hi: 'POCSO क़ानून बच्चों की रक्षा करता है' }) + '</h3>' +
        ul([{ en: `India's POCSO Act protects everyone under 18, girls and boys, from sexual abuse, online too.`, hi: 'भारत का POCSO क़ानून 18 साल से कम उम्र के हर बच्चे, लड़की हो या लड़का, को यौन शोषण से बचाता है, ऑनलाइन भी।' },
          { en: 'The law treats anyone under 18 as a child who cannot give consent to sexual acts. The blame is never on the child.', hi: 'क़ानून 18 से कम उम्र के हर व्यक्ति को बच्चा मानता है, जो यौन काम के लिए सहमति नहीं दे सकता। दोष कभी बच्चे का नहीं होता।' },
          { en: 'Anyone who learns that a child is being abused must report it to the police, so the child can be protected.', hi: 'जिसे भी पता चले कि किसी बच्चे का शोषण हो रहा है, उसे पुलिस को बताना होता है, ताकि बच्चे को बचाया जा सके।' },
          { en: `The child's name must be kept secret. Police should record her statement at home or at a place she chooses, by a woman officer where possible, with a parent or trusted adult present.`, hi: 'बच्चे का नाम गुप्त रखना ज़रूरी है। पुलिस को बच्ची का बयान घर पर या उसकी चुनी जगह पर, जहाँ तक हो सके किसी महिला अधिकारी से, माता-पिता या किसी भरोसेमंद बड़े की मौजूदगी में लेना चाहिए।' }]) + '</div>') +
      sec('m-tell', { en: 'Who to tell', hi: 'किसे बताएँ' },
        '<p class="teen-body">' + T({ en: `Tell someone you trust: a parent, an older sister or aunt, a teacher, the principal, the school counsellor, your ASHA or ANM didi, or the doctor at the teen clinic. If the first person doesn't help, keep telling until someone does.`, hi: 'किसी भरोसेमंद को बताएँ: माँ-पापा, बड़ी बहन, मौसी या बुआ, कोई टीचर, प्रिंसिपल, स्कूल counsellor, आपकी आशा या ANM दीदी, या किशोर क्लिनिक की डॉक्टर। अगर पहला व्यक्ति मदद न करे, तो तब तक बताती रहें जब तक कोई मदद न करे।' }) + '</p>' +
        lines(['1098', '112', '1930', '14416', '181'])) +
      foot();
    wireAll(v);
  }

  /* ---------- free services ---------- */
  function svcCard(icon, title, inner) {
    return '<div class="card"><div class="row" style="align-items:flex-start"><span class="ico-sm">' + S.icon(icon) + '</span><h3 style="padding-top:7px">' + T(title) + '</h3></div>' + inner + '</div>';
  }
  function renderServices(v) {
    v.innerHTML = S.backRow(t('teen_services'), 'teen', false) +
      intro({ en: 'The National Health Mission runs free health services for girls and boys aged 10–19 under the Rashtriya Kishor Swasthya Karyakram (RKSK). Here is what to ask for and where. What runs in your area differs by state and district; your ASHA, ANM or a school teacher will know.', hi: 'राष्ट्रीय स्वास्थ्य मिशन, राष्ट्रीय किशोर स्वास्थ्य कार्यक्रम (RKSK) के तहत 10–19 साल के लड़के-लड़कियों के लिए मुफ़्त सेवाएँ चलाता है। यहाँ जानिए क्या माँगें और कहाँ। आपके इलाक़े में क्या चलता है, यह राज्य और ज़िले के हिसाब से अलग होता है; आपकी आशा, ANM या स्कूल टीचर को पता होगा।' }) +
      svcCard('care', { en: 'Teen clinic (Adolescent Friendly Health Clinic, AFHC)', hi: 'किशोर क्लिनिक (AFHC, किशोर-अनुकूल स्वास्थ्य क्लिनिक)' },
        '<p class="teen-body">' + T({ en: 'A doctor, ANM or counsellor trained to talk with young people. Go for periods, pimples, weight, tiredness or anaemia, feeling low, or questions about your body and sex. It is free, and it is meant to be private.', hi: 'एक डॉक्टर, ANM या counsellor जो युवाओं से बात करने के लिए प्रशिक्षित हैं। पीरियड, मुँहासे, वज़न, थकान या ख़ून की कमी, उदासी, या शरीर और सेक्स से जुड़े सवालों के लिए जाएँ। यह मुफ़्त है, और यहाँ बात निजी रखी जाती है।' }) + '</p>' +
        '<p class="teen-body"><strong style="color:var(--fg)">' + T({ en: 'Where:', hi: 'कहाँ:' }) + '</strong> ' + T({ en: 'many PHCs and CHCs, district hospitals and medical colleges', hi: 'कई PHC और CHC, ज़िला अस्पताल और मेडिकल कॉलेज' }) + '</p>' +
        '<p class="small">' + T({ en: 'Ask at the registration desk: "Where is the AFHC, the teen clinic?" A parent or trusted adult can come with you.', hi: 'पर्ची काउंटर पर पूछें: "AFHC, यानी किशोर क्लिनिक, कहाँ है?" माता-पिता या कोई भरोसेमंद बड़ा साथ आ सकता है।' }) + '</p>') +
      svcCard('pill', { en: 'Weekly blue iron tablet (WIFS)', hi: 'हर हफ़्ते नीली आयरन की गोली (WIFS)' },
        '<p class="teen-body">' + T({ en: 'Iron and folic acid prevent anaemia (low blood), which makes you tired, breathless and pale. Students in classes 6–12 in government, government-aided and municipal schools get one blue tablet a week, on a fixed day, from a teacher. Girls who are not in school get it at the Anganwadi.', hi: 'आयरन और फ़ोलिक एसिड ख़ून की कमी (anaemia) से बचाते हैं, जिससे थकान, साँस फूलना और पीलापन होता है। सरकारी, सरकारी-सहायता प्राप्त और नगरपालिका स्कूलों में कक्षा 6–12 के बच्चों को हफ़्ते में एक नीली गोली, तय दिन पर, टीचर देती हैं। जो लड़कियाँ स्कूल नहीं जातीं, उन्हें यह आंगनवाड़ी में मिलती है।' }) + '</p>' +
        '<h3>' + T({ en: 'How to take it', hi: 'कैसे लें' }) + '</h3>' +
        ul([{ en: 'After a meal, never on an empty stomach', hi: 'खाने के बाद, कभी ख़ाली पेट नहीं' },
          { en: 'With water, not with milk. Keep tea, coffee and milk an hour away from it.', hi: 'पानी के साथ, दूध के साथ नहीं। चाय, कॉफ़ी और दूध इससे एक घंटा दूर रखें।' },
          { en: 'Dark stools, mild nausea or constipation can happen at first and usually settle in a few weeks. If not, tell your ANM or ASHA.', hi: 'शुरू में काला मल, हल्की मतली या कब्ज़ हो सकती है, जो आम तौर पर कुछ हफ़्तों में ठीक हो जाती है। ठीक न हो तो अपनी ANM या आशा को बताएँ।' },
          { en: 'A deworming tablet is also given every six months.', hi: 'हर छह महीने में पेट के कीड़ों की गोली भी दी जाती है।' }]) +
        goBtn('cond-anaemia', { en: 'Anaemia: signs and the free Hb test', hi: 'ख़ून की कमी: लक्षण और मुफ़्त Hb जाँच' })) +
      svcCard('users', { en: 'Saathiya peer educators and Adolescent Health Day', hi: 'साथिया (साथी शिक्षक) और किशोर स्वास्थ्य दिवस' },
        '<p class="teen-body">' + T({ en: 'Where this part of the programme runs, the ASHA helps choose four young people in each village, two girls and two boys, as Saathiya. They hold weekly group sessions on health with other adolescents and can tell you where to go for help.', hi: 'जहाँ कार्यक्रम का यह हिस्सा चलता है, वहाँ आशा हर गाँव से चार युवा, दो लड़कियाँ और दो लड़के, साथिया के रूप में चुनने में मदद करती है। वे दूसरे किशोरों के साथ हर हफ़्ते सेहत पर समूह में बात करते हैं और बता सकते हैं कि मदद कहाँ मिलेगी।' }) + '</p>' +
        '<p class="teen-body">' + T({ en: 'Adolescent Health Day is held every three months, often at the Anganwadi centre, with services and information for young people and their parents. Adolescent Friendly Club meetings happen every month at the sub-centre, with the ANM.', hi: 'किशोर स्वास्थ्य दिवस हर तीन महीने में होता है, अक्सर आंगनवाड़ी केंद्र पर, जहाँ किशोरों और उनके माता-पिता के लिए सेवाएँ और जानकारी मिलती है। किशोर-अनुकूल क्लब की बैठक हर महीने उप-केंद्र (sub-centre) पर ANM के साथ होती है।' }) + '</p>') +
      svcCard('learn', { en: 'School Health and Wellness Programme', hi: 'स्कूल स्वास्थ्य और कल्याण कार्यक्रम' },
        '<p class="teen-body">' + T({ en: 'Under Ayushman Bharat, government and government-aided schools in many districts have two teachers, ideally one woman and one man, trained as Health and Wellness Ambassadors. They run an hour of health activities every week. You can take your questions to them.', hi: 'आयुष्मान भारत के तहत कई ज़िलों के सरकारी और सरकारी-सहायता प्राप्त स्कूलों में दो टीचर, हो सके तो एक महिला और एक पुरुष, "हेल्थ एंड वेलनेस एम्बेसडर" के रूप में प्रशिक्षित होते हैं। वे हर हफ़्ते एक घंटा सेहत से जुड़ी गतिविधियाँ कराते हैं। आप अपने सवाल उनके पास ले जा सकती हैं।' }) + '</p>') +
      svcCard('drop', { en: 'Free and low-cost pads', hi: 'मुफ़्त और सस्ते pad' },
        ul([{ en: `At school: in January 2026 the Supreme Court directed every school, government or private, in villages and cities, to give girl students sanitary pads free, ideally from a machine in the girls' toilet, or else from a named teacher or place. In September 2026 it said the pads must be biodegradable and compostable. The Health Ministry has asked states to follow it. If your school has none yet, ask the head teacher.`, hi: 'स्कूल में: जनवरी 2026 में सुप्रीम कोर्ट ने निर्देश दिया कि गाँव हो या शहर, हर स्कूल, सरकारी हो या प्राइवेट, छात्राओं को सैनिटरी pad मुफ़्त दे, हो सके तो लड़कियों के toilet में मशीन से, नहीं तो किसी तय टीचर या जगह से। सितंबर 2026 में कोर्ट ने कहा कि pad biodegradable और compostable हों। स्वास्थ्य मंत्रालय ने राज्यों से इसका पालन करने को कहा है। अगर आपके स्कूल में अभी नहीं हैं, तो प्रधानाध्यापक से पूछें।' },
          { en: 'In villages: under the Menstrual Hygiene Scheme, girls aged 10–19 can get a pack of 6 pads for ₹6 from their ASHA, where the state runs it; some states now give them free.', hi: 'गाँव में: मासिक धर्म स्वच्छता योजना में 10–19 साल की लड़कियाँ आशा दीदी से 6 pad का पैकेट ₹6 में ले सकती हैं, जहाँ राज्य यह योजना चलाता है। कुछ राज्य अब ये मुफ़्त देते हैं।' },
          { en: 'Anywhere: Jan Aushadhi Kendras sell Suvidha pads at ₹1 a pad.', hi: 'कहीं भी: जन औषधि केंद्रों पर Suvidha pad ₹1 का एक मिलता है।' }]) +
        goBtn('access-schemes-teen', { en: 'All schemes for girls', hi: 'लड़कियों के लिए सभी योजनाएँ' })) +
      svcCard('ribbon', { en: 'HPV vaccine at 14, free', hi: '14 साल में HPV टीका, मुफ़्त' },
        '<p class="teen-body">' + T({ en: 'Since February 2026, girls aged 14 get one dose of the HPV vaccine free at government health facilities. It protects against the HPV types that cause most cervical cancers. A parent or guardian gives consent.', hi: 'फ़रवरी 2026 से 14 साल की लड़कियों को सरकारी अस्पतालों में HPV टीके की एक ख़ुराक मुफ़्त मिलती है। यह उन HPV वायरस से बचाता है जिनसे बच्चेदानी के मुँह (cervix) के ज़्यादातर कैंसर होते हैं। सहमति माता-पिता या अभिभावक देते हैं।' }) + '</p>' +
        goBtn('screen-hpv', { en: 'About the HPV vaccine', hi: 'HPV टीके के बारे में' })) +
      '<h2>' + esc(t('helplines')) + '</h2>' + lines(['1098', '14416', '1930', '104', '112', '181']) +
      '<div class="card soft"><h3>' + T({ en: 'Official pages', hi: 'सरकारी पन्ने' }) + '</h3>' +
      '<p class="small">' + ext('https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=818&lid=221', { en: 'RKSK, National Health Mission', hi: 'RKSK, राष्ट्रीय स्वास्थ्य मिशन' }) + '</p>' +
      '<p class="small">' + ext('https://cybercrime.gov.in/', { en: 'National Cyber Crime Reporting Portal', hi: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल' }) + '</p></div>' +
      foot();
    wireAll(v);
  }

  /* ---------- guide for mothers and fathers ---------- */
  /* Each line is shown in both languages, whatever the app language, so a family can use the words it speaks. */
  const SAY = [
    [{ en: 'To start', hi: 'शुरुआत में' },
      'तुम बड़ी हो रही हो, और तुम्हारे शरीर में कुछ बदलाव आएँगे। मैं चाहती हूँ कि तुम यह सब पहले मुझसे सुनो, ताकि किसी बात से डर न लगे।',
      `You're growing up, and your body will start to change. I want you to hear about it from me first, so nothing scares you.`],
    [{ en: 'Explaining a period', hi: 'पीरियड समझाना' },
      'महीने में एक बार, कुछ दिन योनि से थोड़ा ख़ून आएगा। इसे पीरियड या माहवारी कहते हैं। इसका मतलब यह नहीं कि तुम्हें चोट लगी है या तुम बीमार हो। इसका मतलब है तुम्हारा शरीर ठीक से बढ़ रहा है।',
      `Once a month, a little blood will come out of your vagina for a few days. It's called a period. It doesn't mean you're hurt or ill. It means your body is growing well.`],
    [{ en: 'If it starts at school', hi: 'अगर स्कूल में शुरू हो जाए' },
      'अगर स्कूल में शुरू हो जाए, तो अपनी क्लास टीचर या किसी भी मैडम के पास जाकर कहना, "मेरा पीरियड शुरू हो गया है, मुझे pad चाहिए।" तुम्हारे बैग की पाउच में pad रखा है। फिर मुझे फ़ोन करना।',
      `If it starts at school, go to your class teacher or any woman teacher and say, "My period has started, I need a pad." There's a pad in the pouch in your bag. Then call me.`],
    [{ en: 'Nothing to be ashamed of', hi: 'शर्म की कोई बात नहीं' },
      'पीरियड में शर्म की कोई बात नहीं। तुम स्कूल जा सकती हो, खेल सकती हो, नहा सकती हो और सब कुछ खा सकती हो। मुझसे कभी भी कुछ भी पूछ सकती हो।',
      `Periods are nothing to be ashamed of. You can go to school, play, bathe and eat everything as usual. You can ask me anything, any time.`],
    [{ en: 'Her body, her say', hi: 'उसका शरीर, उसकी मर्ज़ी' },
      'तुम्हारा शरीर तुम्हारा है। अगर कोई तुम्हें ऐसे छुए जो ठीक न लगे, या छूने की बात छिपाने को कहे, तो मुझे बताना। मुझे बताने पर तुम्हें कभी डाँट नहीं पड़ेगी।',
      `Your body belongs to you. If anyone touches you in a way that feels wrong, or asks you to keep a touch secret, tell me. You will never be in trouble for telling me.`]
  ];
  function sayBlock(s) {
    const hiLine = tx({ en: 'In Hindi: ', hi: 'हिंदी में: ' }) + s[1];
    const enLine = tx({ en: 'In English: ', hi: 'English में: ' }) + s[2];
    return '<div class="card soft" style="gap:8px"><h3>' + T(s[0]) + '</h3><p class="teen-say" lang="hi">' + esc(hiLine) + '</p><p class="teen-say alt" lang="en">' + esc(enLine) + '</p></div>';
  }
  function renderMother(v) {
    v.innerHTML = S.backRow(t('teen_mother'), 'teen', false) +
      intro({ en: 'Your daughter will hear about periods somewhere: from friends, a phone, a cousin. It is better she hears it first from you, calmly, before it happens. You don\'t need perfect words. Short, honest talks work.', hi: 'आपकी बेटी पीरियड के बारे में कहीं न कहीं से सुनेगी: सहेलियों से, फ़ोन से, किसी cousin से। अच्छा है कि वह पहली बार आपसे, शांति से, और पीरियड आने से पहले सुने। एकदम सही शब्दों की ज़रूरत नहीं। छोटी, सच्ची बातें काम करती हैं।' }) +
      jumps([['p-when', { en: 'When to talk', hi: 'कब बात करें' }], ['p-words', { en: 'Words to use', hi: 'क्या कहें' }], ['p-ready', { en: 'Keep ready', hi: 'क्या तैयार रखें' }], ['p-myths', { en: 'Myths', hi: 'मिथक' }], ['p-doctor', { en: 'Doctor', hi: 'डॉक्टर' }], ['p-safety', { en: 'Safety', hi: 'सुरक्षा' }], ['p-hpv', { en: 'HPV vaccine', hi: 'HPV टीका' }]]) +
      sec('p-when', { en: 'When and how to start', hi: 'कब और कैसे शुरू करें' },
        ul([{ en: 'Start around 8–10, before her first period. Some girls get it at 8 or 9.', hi: 'लगभग 8–10 साल की उम्र में शुरू करें, पहले पीरियड से पहले। कुछ लड़कियों को 8 या 9 साल में ही आ जाता है।' },
          { en: 'Talk often and briefly, at easy moments: cooking together, on a walk, on the bus. One big talk is harder for both of you.', hi: 'बार-बार और थोड़ी-थोड़ी बात करें, आराम के पलों में: साथ खाना बनाते हुए, टहलते हुए, बस में। एक बड़ी बातचीत दोनों के लिए मुश्किल होती है।' },
          { en: 'Use the real words: period, vagina, breasts. They help her ask for help and tell you if something is wrong.', hi: 'सही शब्द इस्तेमाल करें: पीरियड, योनि, स्तन। इनसे वह मदद माँग पाती है और कुछ ग़लत हो तो आपको बता पाती है।' },
          { en: 'Show her a pad and how to use it before she needs one.', hi: 'ज़रूरत से पहले उसे pad दिखाएँ और लगाना सिखाएँ।' },
          { en: 'Fathers can talk too. Hearing "This is normal, you can tell me anything" from her father matters.', hi: 'पापा भी बात कर सकते हैं। पापा के मुँह से "यह सामान्य है, तुम मुझे कुछ भी बता सकती हो" सुनना बहुत मायने रखता है।' },
          { en: `If you don't know an answer, say "Let's find out together."`, hi: 'अगर किसी सवाल का जवाब न पता हो, तो कहें "चलो, साथ में पता करते हैं।"' }]) +
        goBtn('teen-first', { en: 'Read the first-period guide with her', hi: 'पहले पीरियड की गाइड उसके साथ पढ़ें' })) +
      '<h2 class="teen-sec" id="p-words">' + T({ en: 'Words you can use', hi: 'आप ये शब्द कह सकती हैं' }) + '</h2>' +
      '<p class="small">' + T({ en: 'Say them in your own way. Each line is in Hindi and in English.', hi: 'अपने तरीक़े से कहें। हर बात हिंदी और English, दोनों में है।' }) + '</p>' +
      SAY.map(sayBlock).join('') +
      sec('p-ready', { en: 'What to keep ready', hi: 'क्या तैयार रखें' },
        checklist([{ en: 'A pack of pads, with a few longer ones for night, or clean cotton cloth pads', hi: 'pad का एक पैकेट, रात के लिए कुछ लंबे pad के साथ, या साफ़ सूती कपड़े के pad' },
          { en: 'A small pouch for her school bag: 2–3 pads, spare underwear and a paper bag', hi: 'स्कूल बैग के लिए छोटी पाउच: 2–3 pad, extra अंडरवियर और काग़ज़ का लिफ़ाफ़ा' },
          { en: 'Old newspaper and a covered dustbin in the bathroom', hi: 'बाथरूम में पुराना अख़बार और ढक्कन वाला कूड़ेदान' },
          { en: 'A hot water bottle for cramps', hi: 'ऐंठन के लिए गर्म पानी की बोतल' },
          { en: 'A calendar to mark the first day of each period', hi: 'हर पीरियड का पहला दिन लिखने के लिए कैलेंडर' },
          { en: 'Your phone number written in her school diary', hi: 'उसकी स्कूल डायरी में आपका फ़ोन नंबर' }]) +
        goBtn('periods-products', { en: 'Pads, cloth pads and cups', hi: 'Pad, कपड़े के pad और cup' })) +
      '<h2 class="teen-sec" id="p-myths">' + T({ en: 'Myths not to pass on', hi: 'ये मिथक आगे न बढ़ाएँ' }) + '</h2>' +
      myth({ en: 'She is "impure" and must keep out of the kitchen or the puja room.', hi: 'वह "अशुद्ध" है, रसोई या पूजा घर से दूर रहे।' }, { en: 'A period is the body working normally, not dirt. Rules like these teach her to be ashamed of her body. If she is tired, let her rest because she needs it.', hi: 'पीरियड शरीर का सामान्य काम है, गंदगी नहीं। ऐसे नियम उसे अपने शरीर पर शर्म करना सिखाते हैं। थकी हो तो आराम करने दें, क्योंकि उसे ज़रूरत है।' }) +
      myth({ en: 'No bath and no hair wash.', hi: 'नहाना और बाल धोना मना।' }, { en: 'Bathing keeps her clean and can ease cramps.', hi: 'नहाने से वह साफ़ रहती है और ऐंठन में आराम मिल सकता है।' }) +
      myth({ en: 'Keep her home from school and sport.', hi: 'उसे स्कूल और खेल से रोकें।' }, { en: 'Missing school every month adds up. With a kit she can go. If pain stops her, take her to a doctor.', hi: 'हर महीने स्कूल छूटने से पढ़ाई का बहुत नुक़सान होता है। किट के साथ वह जा सकती है। दर्द से रुके, तो डॉक्टर को दिखाएँ।' }) +
      myth({ en: 'No curd, pickle, sour or cold food.', hi: 'दही, अचार, खट्टा या ठंडा खाना मना।' }, { en: 'No food is off limits. She needs good food, with iron from green leafy vegetables, dal and chana, and eggs or meat if your family eats them.', hi: 'कोई खाना मना नहीं। उसे अच्छा खाना चाहिए, जिसमें हरी पत्तेदार सब्ज़ियों, दाल और चने से, और अगर घर में खाते हैं तो अंडे या मांस से आयरन मिले।' }) +
      myth({ en: 'Her first period means she is ready for marriage.', hi: 'पहला पीरियड आ गया, अब शादी लायक़ हो गई।' }, { en: 'A first period only means puberty has begun. Her body and mind are still growing. In India, marrying a girl before 18 is against the law.', hi: 'पहले पीरियड का मतलब बस इतना है कि प्यूबर्टी शुरू हुई है। उसका शरीर और मन अभी बढ़ रहे हैं। भारत में 18 साल से पहले लड़की की शादी क़ानून के ख़िलाफ़ है।' }) +
      myth({ en: 'White discharge is a sign of weakness.', hi: 'सफ़ेद पानी कमज़ोरी की निशानी है।' }, { en: 'Clear or white discharge before and between periods is normal. Itching, burning, a bad smell, or green or curd-like discharge needs a doctor.', hi: 'पीरियड से पहले और बीच में साफ़ या सफ़ेद पानी सामान्य है। खुजली, जलन, बदबू, या हरा या दही जैसा पानी हो तो डॉक्टर को दिखाएँ।' }) +
      '<div class="teen-sec" id="p-doctor">' + doctorCard({ en: 'Take her to a doctor if', hi: 'उसे डॉक्टर को दिखाएँ अगर' }, [
        's5a',
        { en: 'Breasts, hair on the private parts or a period start before age 8', hi: '8 साल से पहले स्तन बढ़ने लगें, प्राइवेट पार्ट पर बाल आएँ या पीरियड शुरू हो जाए' },
        { en: 'A period lasts more than 7 days, or soaks a pad every 1–2 hours', hi: 'पीरियड 7 दिन से ज़्यादा चले, या हर 1–2 घंटे में pad भीग जाए' },
        { en: 'Periods come more often than every 21 days, or less often than every 45 days', hi: 'पीरियड 21 दिन से पहले बार-बार आएँ, या 45 दिन से ज़्यादा के अंतर पर आएँ' },
        { en: 'Pain keeps her home from school', hi: 'दर्द की वजह से उसका स्कूल छूटे' },
        { en: 'She seems low or withdrawn most days for two weeks or more.', hi: 'दो हफ़्ते या ज़्यादा, लगभग रोज़ वह उदास या चुप-चुप लगे।' }
      ], true, '<p class="small">' + T({ en: 'The teen clinic (AFHC) at a PHC, CHC or district hospital is free. You can ask for a woman doctor or ANM, and you can go in with her.', hi: 'PHC, CHC या ज़िला अस्पताल का किशोर क्लिनिक (AFHC) मुफ़्त है। आप महिला डॉक्टर या ANM के लिए कह सकती हैं, और उसके साथ अंदर जा सकती हैं।' }) + '</p>' + goBtn('teen-services', { en: 'Free services for girls', hi: 'लड़कियों के लिए मुफ़्त सेवाएँ' })) + '</div>' +
      sec('p-hpv', { en: 'HPV vaccine', hi: 'HPV टीका' },
        '<p class="teen-body">' + T({ en: 'The HPV vaccine works best between 9 and 14, before any sexual contact. It protects against the HPV types behind most cervical cancers. In India, girls aged 14 get one dose free at government health facilities. You give consent; you can walk in or register on U-WIN.', hi: 'HPV टीका 9 से 14 साल की उम्र में, किसी भी यौन संपर्क से पहले, सबसे अच्छा काम करता है। यह उन HPV वायरस से बचाता है जिनसे बच्चेदानी के मुँह (cervix) के ज़्यादातर कैंसर होते हैं। भारत में 14 साल की लड़कियों को सरकारी अस्पतालों में इसकी एक ख़ुराक मुफ़्त मिलती है। सहमति आप देते हैं; आप सीधे जा सकते हैं या U-WIN पर पंजीकरण कर सकते हैं।' }) + '</p>' +
        goBtn('screen-hpv', { en: 'About the HPV vaccine', hi: 'HPV टीके के बारे में' })) +
      '<div class="card dark"><h3>' + T({ en: `Questions about your daughter's health?`, hi: 'बेटी की सेहत को लेकर सवाल?' }) + '</h3><p class="small" style="color:var(--dark-text)">' + T({ en: 'As her parent, you can book a free call with a Qura doctor (BAMS) about her periods, weight, pimples or diet. Hormone medicines need an MBBS gynaecologist; Qura refers.', hi: 'माता-पिता के रूप में आप उसके पीरियड, वज़न, मुँहासे या खाने को लेकर Qura की डॉक्टर (BAMS) से मुफ़्त कॉल बुक कर सकते हैं। हॉर्मोन की दवाओं के लिए MBBS स्त्री रोग विशेषज्ञ चाहिए; Qura refer करता है।' }) + '</p>' +
      '<button type="button" class="btn sm" style="background:var(--bg);color:var(--fg);border:none;align-self:flex-start" data-ask="' + esc(tx({ en: 'My daughter: puberty and periods', hi: 'मेरी बेटी: प्यूबर्टी और पीरियड' })) + '">' + esc(t('ask_qura')) + '</button></div>' +
      '<p class="footnote">' + T({ en: 'Nothing on this page is saved.', hi: 'इस पन्ने पर कुछ भी save नहीं होता।' }) + '</p>';
    wireAll(v);
  }

  S.register({
    id: ID,
    demoPersona: 'browse',
    strings: {
      en: {
        teen_hub: 'Girls and families', teen_all: 'All guides for girls', teen_hub_s: 'For girls 10–17 and their families. Read only, nothing saved',
        teen_puberty: 'Your changing body', teen_puberty_s: 'Breasts, hair, height, discharge, pimples, sweat',
        teen_first: 'Your first period', teen_first_s: 'What to expect, a kit for your bag, using a pad, school',
        teen_mind: 'Feelings, friends and safety', teen_mind_s: 'Body image, bullying, online safety, safe touch, who to tell',
        teen_services: 'Free help for girls', teen_services_s: 'Teen clinics, weekly iron tablet, free pads, helplines',
        teen_mother: 'A guide for mothers and fathers', teen_mother_s: 'Talking to your daughter before her first period',
        teen_u18: 'Guides for girls (read only)'
      },
      hi: {
        teen_hub: 'बेटियाँ और परिवार', teen_all: 'लड़कियों के लिए सभी गाइड', teen_hub_s: '10–17 साल की लड़कियों और उनके परिवार के लिए। सिर्फ़ पढ़ने के लिए, कुछ save नहीं होता',
        teen_puberty: 'आपका बदलता शरीर', teen_puberty_s: 'स्तन, बाल, लंबाई, सफ़ेद पानी, मुँहासे, पसीना',
        teen_first: 'आपका पहला पीरियड', teen_first_s: 'क्या होगा, बैग के लिए किट, pad कैसे लगाएँ, स्कूल में',
        teen_mind: 'मन, दोस्ती और सुरक्षा', teen_mind_s: 'अपना रूप, तंग करना, ऑनलाइन सुरक्षा, सही-ग़लत छूना, किसे बताएँ',
        teen_services: 'लड़कियों के लिए मुफ़्त मदद', teen_services_s: 'किशोर क्लिनिक, हर हफ़्ते आयरन की गोली, मुफ़्त pad, हेल्पलाइन',
        teen_mother: 'माँ और पापा के लिए गाइड', teen_mother_s: 'पहले पीरियड से पहले बेटी से बात कैसे करें',
        teen_u18: 'लड़कियों के लिए गाइड (सिर्फ़ पढ़ने के लिए)'
      }
    },
    routes: {
      'teen': renderHub,
      'teen-puberty': renderPuberty,
      'teen-first': renderFirst,
      'teen-mind': renderMind,
      'teen-services': renderServices,
      'teen-mother': renderMother
    },
    testRoutes: [],
    open: ['teen', 'teen-puberty', 'teen-first', 'teen-mind', 'teen-services', 'teen-mother'],
    tiles: [
      { section: 'teen', route: 'teen', title: 'teen_all', sub: 'teen_hub_s', icon: 'leaf', order: 1, gated: false, keywords: 'teen girl girls adolescent daughter puberty kishori किशोरी बेटी लड़की' },
      { section: 'teen', route: 'teen-puberty', title: 'teen_puberty', sub: 'teen_puberty_s', icon: 'sparkle', order: 10, gated: false, keywords: 'puberty breasts hair growth discharge pimples acne sweat प्यूबर्टी स्तन मुँहासे सफ़ेद पानी' },
      { section: 'teen', route: 'teen-first', title: 'teen_first', sub: 'teen_first_s', icon: 'flower', order: 20, gated: false, keywords: 'first period menarche pad kit school cramps irregular myths पहला पीरियड माहवारी pad स्कूल' },
      { section: 'teen', route: 'teen-mind', title: 'teen_mind', sub: 'teen_mind_s', icon: 'heart', order: 30, gated: false, keywords: 'feelings mood body image bullying online safety photos 1930 touch consent pocso childline 1098 मन तंग सुरक्षा' },
      { section: 'teen', route: 'teen-services', title: 'teen_services', sub: 'teen_services_s', icon: 'map', order: 40, gated: false, keywords: 'rksk afhc wifs iron tablet saathiya peer educator school health pads hpv helpline किशोर क्लिनिक आयरन' },
      { section: 'teen', route: 'teen-mother', title: 'teen_mother', sub: 'teen_mother_s', icon: 'users', order: 50, gated: false, keywords: 'mother father parent daughter talk first period safety pocso hpv माँ पापा बेटी बात' }
    ],
    under18: () => '<button type="button" class="btn block" data-go="teen">' + esc(t('teen_u18')) + '</button>',
    css: [
      '.teen-sec { scroll-margin-top: 72px; }',
      '.teen-hlw { min-width: 0; flex: 1; }',
      '.teen-body { font-size: 14px; color: var(--text); line-height: 1.5; }',
      '.teen-ch { flex-direction: row; align-items: flex-start; gap: 12px; }',
      '.teen-ch .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }',
      '.teen-chart { display: block; width: 100%; height: auto; }',
      '.teen-chart text { fill: var(--muted); font-size: 13px; font-family: inherit; }',
      '.teen-chart .lbl { fill: var(--fg); font-size: 13px; font-weight: 600; }',
      '.teen-chart .bl { fill: var(--accent-2); opacity: 0.4; }',
      '.teen-chart .bd { fill: var(--accent); }',
      '.teen-chart .band { fill: var(--peach); opacity: 0.75; }',
      '.teen-chart .bar { fill: var(--accent-2); }',
      '.teen-chart .ax { stroke: var(--line); stroke-width: 1; }',
      '.teen-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: var(--muted); }',
      '.teen-legend span { display: inline-flex; align-items: center; gap: 6px; }',
      '.teen-legend i { width: 12px; height: 12px; border-radius: 4px; display: inline-block; flex-shrink: 0; }',
      '.teen-sw-l { background: var(--accent-2); opacity: 0.4; } .teen-sw-d { background: var(--accent-strong); } .teen-sw-band { background: var(--peach); } .teen-sw-bar { background: var(--accent-2); }',
      '.teen-panels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }',
      '.teen-panel { background: var(--card-2); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; min-width: 0; }',
      '.teen-panel p { font-size: 12px; color: var(--fg); line-height: 1.4; min-width: 0; }',
      '.teen-n { width: 24px; height: 24px; border-radius: 12px; background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.teen-fig { display: block; width: 100%; max-width: 150px; height: auto; margin: 0 auto; }',
      '.teen-fig .u { fill: var(--card); stroke: var(--fg); stroke-width: 1.6; stroke-linejoin: round; }',
      '.teen-fig .wb { fill: none; stroke: var(--muted); stroke-width: 1; opacity: 0.6; }',
      '.teen-fig .p { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.6; }',
      '.teen-fig .s { fill: var(--gold-soft); stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 3 2; }',
      '.teen-fig .w { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.4; stroke-dasharray: 3 2; }',
      '.teen-fig .a { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }',
      '.teen-fig .b { fill: var(--peach-2); stroke: var(--fg); stroke-width: 1.6; stroke-linejoin: round; }',
      '.teen-fig .pp { fill: var(--card); stroke: var(--muted); stroke-width: 1.2; }',
      '.teen-fig text { fill: var(--muted); font-size: 13px; font-family: inherit; }',
      '.teen-say { border-left: 3px solid var(--accent-2); padding: 2px 0 2px 10px; color: var(--fg); font-size: 14px; line-height: 1.55; overflow-wrap: break-word; }',
      '.teen-say.alt { border-left-color: var(--peach); color: var(--text); font-size: 13px; }'
    ].join('\n')
  });
})(window.Saathi);
