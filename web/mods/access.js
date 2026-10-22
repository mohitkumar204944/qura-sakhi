/* Finding care and help: free care near her PIN code, a government scheme finder, a page for her husband or partner, "Today for you" cards, planned doctor videos and a symptom guide by body area. */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, tf = S.tf, esc = S.esc, tx = S.tx, I = S.I;
  const L = (en, hi) => ({ en: en, hi: hi });
  const E = (o) => esc(tx(o));
  const P = (o, cls, style) => '<p' + (cls ? ' class="' + cls + '"' : '') + (style ? ' style="' + style + '"' : '') + '>' + E(o) + '</p>';
  const ul = (arr) => '<ul>' + arr.map((x) => '<li>' + E(x) + '</li>').join('') + '</ul>';
  const chev = '<span class="access-chev">' + I.chev + '</span>';

  /* Screen state that is never saved: PIN, scheme answers, chosen body area. */
  const mem = { pin: '', pinErr: '', ans: {}, area: 'bleed', open: null };
  if (S.onOwnerChange) S.onOwnerChange(() => { mem.pin = ''; mem.pinErr = ''; mem.ans = {}; mem.area = 'bleed'; mem.open = null; });

  /* ---------- sources (each one opened and checked, Oct 2026) ---------- */
  const SRC = {
    pmmvyfaq: { url: 'https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs', en: 'Ministry of Women and Child Development, PMMVY FAQs', hi: 'महिला एवं बाल विकास मंत्रालय, PMMVY के सवाल-जवाब' },
    pmmvypib: { url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/aug/doc2025825619601.pdf', en: 'PIB, Pradhan Mantri Matru Vandana Yojana, 24 Aug 2025', hi: 'PIB, प्रधानमंत्री मातृ वंदना योजना, 24 अगस्त 2025' },
    jsy: { url: 'https://nhm.gov.in/index1.php?lang=1&level=3&lid=309&sublinkid=841', en: 'National Health Mission, Janani Suraksha Yojana', hi: 'राष्ट्रीय स्वास्थ्य मिशन, जननी सुरक्षा योजना' },
    jssk: { url: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308', en: 'National Health Mission, JSSK', hi: 'राष्ट्रीय स्वास्थ्य मिशन, JSSK' },
    pmsma: { url: 'https://pmsma.mohfw.gov.in/', en: 'Ministry of Health, PMSMA', hi: 'स्वास्थ्य मंत्रालय, PMSMA' },
    nha: { url: 'https://nha.gov.in/PM-JAY', en: 'National Health Authority, PM-JAY', hi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण, PM-JAY' },
    amb: { url: 'https://nhm.gov.in/images/pdf/Nutrition/AMB-guidelines/Anemia-Mukt-Bharat-Operational-Guidelines-FINAL.pdf', en: 'Ministry of Health, Anemia Mukt Bharat guidelines', hi: 'स्वास्थ्य मंत्रालय, एनीमिया मुक्त भारत दिशानिर्देश' },
    afhc: { url: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1247&lid=421', en: 'National Health Mission, Adolescent Friendly Health Clinics', hi: 'राष्ट्रीय स्वास्थ्य मिशन, किशोर-अनुकूल स्वास्थ्य क्लिनिक' },
    cho: { url: 'https://nhsrcindia.org/sites/default/files/2022-05/Family_Planning_Guidance_Booklet_for_CHO.pdf', en: 'NHSRC, family planning guidance for CHOs, 2022', hi: 'NHSRC, CHO के लिए परिवार नियोजन पुस्तिका, 2022' },
    fpis: { url: 'https://nhm.gov.in/images/pdf/programmes/family-planing/schemes/FP_Indemnity_Scheme_2013.pdf', en: 'Ministry of Health, Family Planning Indemnity Scheme', hi: 'स्वास्थ्य मंत्रालय, परिवार नियोजन क्षतिपूर्ति योजना' },
    ja: { url: 'https://janaushadhi.gov.in/locate-kendra', en: 'Jan Aushadhi, locate a Kendra', hi: 'जन औषधि, केंद्र खोजें' },
    poshan: { url: 'https://wcd.gov.in/documents/uploaded/Mission%20Saksham%20Anganwadi%20and%20Poshan%202.0%20scheme%20guidelines.pdf', en: 'Ministry of WCD, Saksham Anganwadi and Poshan 2.0 guidelines', hi: 'महिला एवं बाल विकास मंत्रालय, सक्षम आंगनवाड़ी और पोषण 2.0 दिशानिर्देश' },
    labour: { url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251127708501.pdf', en: 'PIB, New Labour Codes and women, Nov 2025', hi: 'PIB, नए श्रम कानून और महिलाएँ, नवंबर 2025' },
    nikshay: { url: 'https://nhm.uk.gov.in/?p=1023', en: 'NHM Uttarakhand, Ni-kshay Poshan Yojana', hi: 'NHM उत्तराखंड, निक्षय पोषण योजना' },
    osc: { url: 'https://missionshakti.wcd.gov.in/statisticsOsc', en: 'Mission Shakti, One Stop Centres', hi: 'मिशन शक्ति, वन स्टॉप सेंटर' },
    ictc: { url: 'https://naco.mohfw.gov.in/wp-content/uploads/2024/06/ICTC-CENTRE-FACILITIES.pdf', en: 'NACO, list of ICTCs', hi: 'NACO, ICTC की सूची' },
    dsrc: { url: 'https://naco.mohfw.gov.in/wp-content/uploads/2024/06/DSRC-CENTRE-FACILITIES.pdf', en: 'NACO, list of Suraksha clinics', hi: 'NACO, सुरक्षा क्लिनिक की सूची' },
    naco: { url: 'https://naco.mohfw.gov.in/division/sti-rti-services/', en: 'NACO, STI and RTI services', hi: 'NACO, STI और RTI सेवाएँ' },
    aam: { url: 'https://aam.mohfw.gov.in/', en: 'Ayushman Arogya Mandir, Ministry of Health', hi: 'आयुष्मान आरोग्य मंदिर, स्वास्थ्य मंत्रालय' },
    dengue: { url: 'https://ncvbdc.mohfw.gov.in/Doc/National%20Guidelines%20for%20Clinical%20Management%20of%20Dengue%20Fever%202023.pdf', en: 'NCVBDC, dengue guidelines 2023', hi: 'NCVBDC, डेंगू दिशानिर्देश 2023' },
    heat: { url: 'https://ndma.gov.in/Natural-Hazards/Heat-Wave', en: 'NDMA, heat wave', hi: 'NDMA, लू (heat wave)' }
  };
  const srcList = (keys) => '<details class="access-src"><summary>' + esc(t('access_sources')) + '</summary><p class="sources">' + keys.map((k) => '<a href="' + esc(SRC[k].url) + '" target="_blank" rel="noopener">' + E(SRC[k]) + '</a>').join(' · ') + '</p></details>';
  const ext = (url, label) => '<a class="access-link" href="' + esc(url) + '" target="_blank" rel="noopener"><span>' + E(label) + '</span><span aria-hidden="true">↗</span></a>';

  /* ---------- small shared pieces ---------- */
  const copyRow = (n, what) => '<div class="helpline"><div style="min-width:0"><div class="n num">' + esc(n) + '</div><div class="what">' + E(what) + '</div></div><button type="button" class="btn sm" data-copy="' + esc(n) + '">' + esc(t('copy')) + '</button></div>';
  function wireCopy(v) {
    v.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.copy; const done = () => S.toast(t('copied') + ' ' + n);
      try { navigator.clipboard.writeText(n).then(done, () => S.toast(n)); } catch (e) { S.toast(n); }
    }));
  }
  const quraCard = (topic) => '<div class="card dark"><h3>' + esc(t('qura_h')) + '</h3><p class="small" style="color:var(--dark-text)">' + esc(t('qura_p')) + '</p><button type="button" class="btn" style="background:var(--bg);color:var(--fg);border:none" data-ask="' + esc(topic) + '">' + esc(t('ask_qura')) + '</button></div>';
  const GUIDE = {
    'periods': L('Periods guide', 'पीरियड गाइड'), 'periods-pain': L('Period pain', 'पीरियड का दर्द'), 'periods-pms': L('PMS and mood', 'PMS और मन'),
    'pregtest-when': L('When to test', 'test कब करें'), 'loss-types': L('Pregnancy loss', 'गर्भ का नुक़सान'),
    'preg-symptoms': L('Pregnancy symptoms', 'गर्भ के लक्षण'), 'preg-diet': L('Food in pregnancy', 'गर्भ में खाना'), 'pregtools-kicks': L('Baby’s movements', 'बच्चे की हलचल'), 'pregtools-contractions': L('Labour pains', 'प्रसव का दर्द'),
    'post-recovery': L('Recovery after birth', 'डिलीवरी के बाद ठीक होना'), 'post-mood': L('Mood after birth', 'डिलीवरी के बाद मन'), 'post-feed': L('Breastfeeding', 'स्तनपान'), 'post-pelvic': L('Pelvic floor', 'पेल्विक फ़्लोर'), 'post-contra': L('Contraception after birth', 'डिलीवरी के बाद गर्भनिरोध'),
    'cond-fibroids': L('Fibroids', 'फ़ाइब्रॉइड'), 'cond-anaemia': L('Anaemia', 'खून की कमी'), 'cond-labs': L('Blood tests', 'खून की जाँचें'), 'cond-endo': L('Endometriosis', 'एंडोमेट्रियोसिस'), 'cond-pid': L('Pelvic infection (PID)', 'पेड़ू का इन्फ़ेक्शन (PID)'),
    'screen-cervix': L('Cervical screening', 'बच्चेदानी के मुँह की जाँच'), 'screen-breast': L('Breast check', 'स्तन की जाँच'), 'screen-signs': L('Warning signs', 'चेतावनी के लक्षण'), 'screen-mine': L('My check-ups', 'मेरे चेक-अप'),
    'intimate-check': L('Discharge and itching', 'सफ़ेद पानी और खुजली'), 'intimate-sti': L('STIs', 'यौन संक्रमण (STI)'), 'intimate-prolapse': L('Prolapse', 'बच्चेदानी का खिसकना'), 'intimate-safety': L('Safety and violence', 'सुरक्षा और हिंसा'),
    'contra-ec': L('Emergency pill', 'इमरजेंसी गोली'), 'contra-free': L('Free contraception', 'मुफ़्त गर्भनिरोध'), 'contra-m-nsv': L('NSV for men', 'पुरुषों की NSV'), 'contra-m-condom': L('Condoms', 'कंडोम'),
    'meno': L('Menopause', 'मेनोपॉज़'), 'meno-intimate': L('Dryness after menopause', 'मेनोपॉज़ के बाद सूखापन'), 'teen-mind': L('Mood in the teens', 'किशोर उम्र में मन'),
    'ttc-tests': L('Fertility tests', 'बच्चे के लिए जाँचें'), 'ttc-partner': L('His part in fertility', 'उनकी भूमिका'),
    'access-schemes-preg': L('Pregnancy schemes', 'गर्भ की योजनाएँ'), 'access-care': L('Care near me', 'मेरे पास इलाज'), 'access-schemes': L('Schemes for you', 'आपके लिए योजनाएँ'), 'access-partner': L('For your partner', 'पति/साथी के लिए'), 'access-symptoms': L('Symptom guide', 'लक्षण गाइड'),
    'diary': L('Open my diary', 'मेरी डायरी खोलें'), 'tools-reminders': L('My reminders', 'मेरे रिमाइंडर'), 'help': L('Safety guide', 'सुरक्षा गाइड')
  };
  const goBtns = (routes) => (routes && routes.length ? '<div class="row wrap access-gos">' + routes.map((r) => '<button type="button" class="btn sm" data-go="' + esc(r) + '">' + E(GUIDE[r] || L(r, r)) + '</button>').join('') + '</div>' : '');

  /* =====================================================================
     1. Care near me
     ===================================================================== */
  const CARE = [
    { k: 'asha', icon: 'users', pill: 'local',
      name: L('ASHA, ANM and Anganwadi', 'ASHA, ANM और आंगनवाड़ी'),
      free: L('Home visits in pregnancy and after birth, registering your pregnancy and the MCP card, vaccines on the monthly village health day, condoms, pills, the emergency pill and pregnancy test kits from your ASHA, iron tablets, and take-home food from the Anganwadi for pregnant women and new mothers.', 'गर्भ में और डिलीवरी के बाद घर पर मुलाक़ात, गर्भ का पंजीकरण और MCP card, हर महीने गाँव के स्वास्थ्य दिवस पर टीके, ASHA से कंडोम, गोलियाँ, इमरजेंसी गोली और गर्भ जाँच किट, आयरन की गोलियाँ, और आंगनवाड़ी से गर्भवती महिलाओं और नई माँओं के लिए घर ले जाने वाला खाना।'),
      find: L('There is no official map for these. Ask a neighbour, your gram panchayat or the nearest sub-centre who your ASHA and Anganwadi worker are. In a city, ask at the urban PHC.', 'इनका कोई सरकारी नक़्शा नहीं है। पड़ोसी, ग्राम पंचायत या नज़दीकी सब-सेंटर से पूछें कि आपकी ASHA और आंगनवाड़ी कार्यकर्ता कौन हैं। शहर में urban PHC पर पूछें।'),
      links: [] },
    { k: 'aam', icon: 'heart', pill: 'free',
      name: L('Ayushman Arogya Mandir', 'आयुष्मान आरोग्य मंदिर'),
      free: L('BP, sugar and cancer checks (mouth, breast, cervix) for everyone 30 and over, pregnancy check-ups, family planning, common medicines and tests, and a video call with a doctor in many centres.', '30 साल और उससे ऊपर सबके लिए BP, शुगर और कैंसर की जाँच (मुँह, स्तन, बच्चेदानी का मुँह), गर्भ की जाँच, परिवार नियोजन, आम दवाएँ और जाँचें, और कई केंद्रों पर वीडियो कॉल से डॉक्टर से बात।'),
      find: L('Your ASHA or ANM knows the nearest one. Many were earlier called Health and Wellness Centres or sub-centres. The official site explains the services; it has no map.', 'आपकी ASHA या ANM नज़दीकी केंद्र जानती हैं। कई पहले हेल्थ एंड वेलनेस सेंटर या सब-सेंटर कहलाते थे। सरकारी साइट पर सेवाओं की जानकारी है, नक़्शा नहीं।'),
      links: [['aam', L('About Ayushman Arogya Mandirs (official)', 'आयुष्मान आरोग्य मंदिर के बारे में (सरकारी)')]] },
    { k: 'phc', icon: 'care', pill: 'free',
      name: L('PHC and CHC', 'PHC और CHC'),
      free: L('A doctor in the OPD, free medicines and tests, deliveries (many are open day and night), Copper-T, the Antara injection, and tubectomy or NSV on fixed days. Many CHCs also have an HIV test centre (ICTC).', 'OPD में डॉक्टर, मुफ़्त दवाएँ और जाँचें, डिलीवरी (कई केंद्र दिन-रात खुले), Copper-T, अंतरा इंजेक्शन, और तय दिनों पर महिला नसबंदी या NSV। कई CHC में HIV जाँच केंद्र (ICTC) भी है।'),
      find: L('Ask your ASHA or ANM which PHC and CHC serve your village or ward. The 104 health helpline can also guide you.', 'अपनी ASHA या ANM से पूछें कि आपके गाँव या वार्ड का PHC और CHC कौन सा है। 104 स्वास्थ्य हेल्पलाइन भी रास्ता बता सकती है।'),
      links: [] },
    { k: 'dh', icon: 'baby', pill: 'free',
      name: L('District hospital', 'ज़िला अस्पताल'),
      free: L('Deliveries and C-sections, with medicines, tests, blood and food during your stay, are free under JSSK, and so is transport (102 or 108). Also a gynaecologist OPD, a blood bank, and special care for sick newborns.', 'JSSK में डिलीवरी और C-section, साथ में दवाएँ, जाँचें, खून और भर्ती के दौरान खाना मुफ़्त है, और आना-जाना भी (102 या 108)। साथ में स्त्री रोग विशेषज्ञ की OPD, ब्लड बैंक, और बीमार नवजात की ख़ास देखभाल।'),
      find: L('One in every district, usually in the district town. In pregnancy the 102 or 108 ambulance takes you there free.', 'हर ज़िले में एक, आम तौर पर ज़िला मुख्यालय में। गर्भ में 102 या 108 एम्बुलेंस आपको मुफ़्त ले जाती है।'),
      links: [['jssk', L('What JSSK makes free (NHM)', 'JSSK में क्या मुफ़्त है (NHM)')]] },
    { k: 'ja', icon: 'pill', pill: 'low',
      name: L('Jan Aushadhi Kendra', 'जन औषधि केंद्र'),
      free: L('Not free, but low cost: generic medicines priced 50–80% below branded ones, and Suvidha sanitary pads at ₹1 a pad.', 'मुफ़्त नहीं, पर सस्ता: जेनेरिक दवाएँ ब्रांडेड से 50–80% कम दाम पर, और Suvidha सैनिटरी पैड ₹1 का एक।'),
      find: L('Search by state and district on the official site, or use the Jan Aushadhi Sugam app.', 'सरकारी साइट पर राज्य और ज़िला चुनकर खोजें, या Jan Aushadhi Sugam app इस्तेमाल करें।'),
      links: [['ja', L('Find a Jan Aushadhi Kendra (official)', 'जन औषधि केंद्र खोजें (सरकारी)')]] },
    { k: 'ictc', icon: 'lock', pill: 'free',
      name: L('ICTC and Suraksha clinic', 'ICTC और सुरक्षा क्लिनिक'),
      free: L('ICTC: a confidential HIV test with counselling. Suraksha clinic (STI/RTI clinic): a check-up and treatment for infections passed on through sex; your partner can be treated too.', 'ICTC: गोपनीय HIV जाँच, सलाह के साथ। सुरक्षा क्लिनिक (STI/RTI क्लिनिक): संबंध से फैलने वाले इन्फ़ेक्शन की जाँच और इलाज; आपके साथी का इलाज भी हो सकता है।'),
      find: L('Mostly at district hospitals, medical colleges and many CHCs. Call 1097, the free NACO helpline, or open the official lists below (by state and district).', 'ज़्यादातर ज़िला अस्पताल, मेडिकल कॉलेज और कई CHC में। 1097 पर कॉल करें, NACO की मुफ़्त हेल्पलाइन, या नीचे की सरकारी सूचियाँ खोलें (राज्य और ज़िले के हिसाब से)।'),
      links: [['ictc', L('ICTC list by district (NACO, PDF)', 'ज़िलेवार ICTC सूची (NACO, PDF)')], ['dsrc', L('Suraksha clinic list (NACO, PDF)', 'सुरक्षा क्लिनिक सूची (NACO, PDF)')]] },
    { k: 'osc', icon: 'help', pill: 'free',
      name: L('One Stop Centre (Sakhi)', 'वन स्टॉप सेंटर (सखी)'),
      free: L('For any woman facing violence, at home or outside: medical help, police help, legal aid and counselling under one roof, open 24 hours, and a safe place to stay for up to 5 days.', 'घर में या बाहर हिंसा झेल रही किसी भी महिला के लिए: एक ही जगह इलाज, पुलिस मदद, क़ानूनी सहायता और सलाह, 24 घंटे खुला, और 5 दिन तक सुरक्षित रहने की जगह।'),
      find: L('Call 181, the Women Helpline, any time. Find the nearest centre on the Mission Shakti site.', 'कभी भी 181, महिला हेल्पलाइन, पर कॉल करें। नज़दीकी सेंटर मिशन शक्ति की साइट पर खोजें।'),
      links: [['osc', L('Find your nearest One Stop Centre (official)', 'नज़दीकी वन स्टॉप सेंटर खोजें (सरकारी)')]] },
    { k: 'afhc', icon: 'flower', pill: 'gov',
      name: L('Adolescent Friendly Health Clinic', 'किशोर-अनुकूल स्वास्थ्य क्लिनिक (AFHC)'),
      free: L('For girls and boys aged 10–19: a doctor, ANM or counsellor talks with you in private about periods, body changes, food, sex and relationships, mood, drugs or alcohol, and violence. Weekly iron tablets too.', '10–19 साल की लड़कियों और लड़कों के लिए: डॉक्टर, ANM या counsellor अकेले में बात करते हैं, पीरियड, शरीर के बदलाव, खाना, संबंध, मन, नशा और हिंसा के बारे में। हफ़्ते की आयरन गोली भी।'),
      find: L('At PHCs, CHCs, district hospitals and medical colleges. Ask at the counter for the AFHC, or ask your ASHA or school. Under 18? A parent or trusted adult can come with you, and Childline 1098 is there for you.', 'PHC, CHC, ज़िला अस्पताल और मेडिकल कॉलेज में। काउंटर पर AFHC पूछें, या अपनी ASHA या स्कूल से। 18 से कम? माता-पिता या भरोसे का कोई बड़ा साथ आ सकता है, और Childline 1098 आपके लिए है।'),
      links: [['afhc', L('About AFHCs (NHM)', 'AFHC के बारे में (NHM)')]] },
    { k: 'pmjay', icon: 'file', pill: 'card',
      name: L('Hospitals that take the Ayushman card', 'आयुष्मान card वाले अस्पताल'),
      free: L('With a PM-JAY (Ayushman) card, hospital treatment is cashless up to ₹5 lakh per family per year at listed government and private hospitals.', 'PM-JAY (आयुष्मान) card हो तो सूची वाले सरकारी और प्राइवेट अस्पतालों में हर परिवार को साल में ₹5 लाख तक का cashless इलाज।'),
      find: L('Check your name and card on the official site, or call 14555. At the hospital, ask at the Ayushman Mitra desk.', 'सरकारी साइट पर अपना नाम और card देखें, या 14555 पर कॉल करें। अस्पताल में आयुष्मान मित्र की डेस्क पर पूछें।'),
      links: [['pmjayb', L('Check your Ayushman card (official)', 'अपना आयुष्मान card देखें (सरकारी)'), 'https://beneficiary.nha.gov.in/'], ['pmjayh', L('Map of private hospitals on PM-JAY (official)', 'PM-JAY के प्राइवेट अस्पतालों का नक़्शा (सरकारी)'), 'https://hospitals.pmjay.gov.in/mapsPlotting.htm']] }
  ];
  const CARE_PILL = { free: ['ok', L('Free', 'मुफ़्त')], low: ['', L('Low cost', 'सस्ता')], local: ['muted', L('Ask locally', 'आस-पास पूछें')], gov: ['muted', L('Government clinic', 'सरकारी क्लिनिक')], card: ['', L('With a card', 'card से')] };
  const linkFor = (x) => ext(x[2] || SRC[x[0]].url, x[1]);

  function careCard(c) {
    const p = CARE_PILL[c.pill];
    return '<details class="access-sch"><summary><span class="ico-sm">' + S.icon(c.icon) + '</span><span class="body"><strong>' + E(c.name) + '</strong></span><span class="pill ' + p[0] + '">' + E(p[1]) + '</span>' + chev + '</summary>' +
      '<div class="in"><h4>' + esc(t('access_what_free')) + '</h4>' + P(c.free) + '<h4>' + esc(t('access_how_find')) + '</h4>' + P(c.find) +
      (c.links.length ? '<div class="access-links">' + c.links.map(linkFor).join('') + '</div>' : '') + '</div></details>';
  }

  /* ---------- Near her PIN code: the government's facility list, bundled with the app (Version 28, B2; MODULE_API
     section 30). Her PIN is looked up on the phone, the nearest centres are worked out on the phone, and nothing is sent.
     Without the bundled data (the web prototype, a build without web/care) the card explains what the live app will do. */
  const NEAR_T = { sc: L('Sub-centre', 'उप-स्वास्थ्य केंद्र'), phc: L('Primary health centre (PHC)', 'प्राथमिक स्वास्थ्य केंद्र (PHC)'), uphc: L('Urban primary health centre', 'शहरी प्राथमिक स्वास्थ्य केंद्र'), chc: L('Community health centre (CHC)', 'सामुदायिक स्वास्थ्य केंद्र (CHC)'), uhp: L('Urban health post', 'शहरी स्वास्थ्य पोस्ट'), sdh: L('Sub-district hospital', 'उप-ज़िला अस्पताल'), dh: L('District hospital', 'ज़िला अस्पताल'), gh: L('Government hospital', 'सरकारी अस्पताल'), wh: L('Women’s hospital', 'महिला अस्पताल'), mh: L('Maternity home', 'प्रसूति गृह'), mcw: L('Mother and child welfare centre', 'मातृ-शिशु कल्याण केंद्र'), mc: L('Medical college hospital', 'मेडिकल कॉलेज अस्पताल') };
  const NEAR_G = [{ h: 'access_near_centres', types: ['sc', 'phc', 'uphc', 'uhp', 'mcw'] }, { h: 'access_near_hosp', types: ['chc', 'sdh', 'dh', 'gh', 'wh', 'mh', 'mc'] }];
  const NEAR_KM = 50;
  const kmBetween = (a, b, c, d) => { const r = Math.PI / 180; const x = Math.pow(Math.sin((c - a) * r / 2), 2) + Math.cos(a * r) * Math.cos(c * r) * Math.pow(Math.sin((d - b) * r / 2), 2); return 12742 * Math.asin(Math.min(1, Math.sqrt(x))); };
  const nearMem = {};   /* PIN → { st: 'loading' | 'done', res }, for this visit only */
  const accPin = () => { try { const a = S.account && S.account.signedIn() ? S.account.info() : null; const p = a ? String(a.pincode || '') : ''; return /^[1-9]\d{5}$/.test(p) ? p : ''; } catch (e) { return ''; } };
  function nearFind(pin) {
    if (nearMem[pin]) return;
    const box = nearMem[pin] = { st: 'loading' };
    const done = (res) => { box.st = 'done'; box.res = res; if ((location.hash || '').slice(1) === 'access-care') S.render(); };
    S.care.load('index').then((ix) => {
      if (!ix || !ix.fac || !ix.pins) return done({ none: true });
      return S.care.load('p' + pin.slice(0, 2)).then((ps) => {
        const rec = ps && ps.p && Object.prototype.hasOwnProperty.call(ps.p, pin) ? ps.p[pin] : null;
        if (!rec) return done({ ix: ix, unknown: true });
        const place = [ps.d[rec[2]], ps.s[rec[3]]].filter(Boolean).join(', ');
        if (typeof rec[0] !== 'number' || typeof rec[1] !== 'number') return done({ ix: ix, place: place, nocoord: true });
        /* a state the list hardly covers: say so rather than show a "nearest" that may be far from the real one */
        const st = ps.s[rec[3]]; if (st && Array.isArray(ix.thin) && ix.thin.indexOf(st) >= 0) return done({ ix: ix, place: place, thin: st });
        const la = Math.floor(rec[0]), lo = Math.floor(rec[1]); const names = [];
        for (let a = la - 1; a <= la + 1; a++) for (let b = lo - 1; b <= lo + 1; b++) { const n = 't' + a + '_' + b; if (!Array.isArray(ix.tiles) || ix.tiles.indexOf(n) >= 0) names.push(n); }
        return Promise.all(names.map((n) => S.care.load(n))).then((ts) => {
          const all = [];
          ts.forEach((tl) => (Array.isArray(tl) ? tl : []).forEach((f) => { if (!Array.isArray(f) || !NEAR_T[f[1]]) return; const d = kmBetween(rec[0], rec[1], +f[2], +f[3]); if (d <= NEAR_KM) all.push({ f: f, d: d }); }));
          all.sort((x, y) => x.d - y.d);
          done({ ix: ix, place: place, groups: NEAR_G.map((g) => ({ h: g.h, rows: all.filter((x) => g.types.indexOf(x.f[1]) >= 0).slice(0, 3) })) });
        });
      });
    }).catch(() => done({ none: true }));
  }
  const dataGov = (u) => (/^https:\/\/www\.data\.gov\.in\//.test(String(u || '')) ? String(u) : '');
  function nearFoot(ix, withNote) {   /* the distance caveat only where distances are shown */
    const y = String((ix.fac && ix.fac.revised) || '').slice(0, 4); const b = /^\d{4}-\d{2}-\d{2}$/.test(ix.built || '') ? S.fmtD(S.fromISO(ix.built), { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const src = [ix.fac, ix.pins].map((x) => (dataGov(x.url) ? '<a href="' + esc(dataGov(x.url)) + '" target="_blank" rel="noopener">' + esc(String(x.src || '')) + '</a>' : esc(String(x.src || '')))).join(' · ');
    return (withNote ? '<p class="small" style="color:var(--fg)">' + esc(tf('access_near_note', { y: /^\d{4}$/.test(y) ? y : '–' })) + '</p>' : '') + '<p class="sources">' + esc(tf('access_near_src', { d: b || '–' })) + ' ' + src + '</p>';
  }
  function nearBlock(pin) {
    nearFind(pin); const box = nearMem[pin]; const r = box.res || {};
    if (r.none) return null;
    const head = '<div class="row spread" style="align-items:flex-start;gap:8px"><div style="min-width:0"><h3>' + esc(tf('access_near_h', { pin: pin })) + '</h3>' + (r.place ? '<p class="small access-near-place" style="color:var(--fg)">' + esc(r.place) + '</p>' : '') + '</div><button type="button" class="btn ghost sm" id="access-pin-clear">' + esc(t('access_pin_change')) + '</button></div>';
    if (box.st === 'loading') return '<div class="card soft access-near" data-nofold="1" aria-busy="true">' + head + '<p class="small">' + esc(t('access_near_load')) + '</p></div>';
    if (r.unknown) return '<div class="card soft access-near" data-nofold="1">' + head + '<p class="small" style="color:var(--fg)">' + esc(t('access_near_unknown')) + '</p></div>';
    if (r.thin) return '<div class="card soft access-near" data-nofold="1">' + head + '<p class="small" style="color:var(--fg)">' + esc(tf('access_near_thin', { s: r.thin })) + '</p>' + nearFoot(r.ix) + '</div>';
    if (r.nocoord) return '<div class="card soft access-near" data-nofold="1">' + head + '<p class="small" style="color:var(--fg)">' + esc(t('access_near_nocoord')) + '</p>' + nearFoot(r.ix) + '</div>';
    const row = (x) => { const f = x.f; const km = x.d < 1 ? t('access_near_km0') : tf('access_near_km', { n: Math.round(x.d) });
      const map = 'https://www.google.com/maps/search/?api=1&query=' + (+f[2]).toFixed(4) + ',' + (+f[3]).toFixed(4);
      return '<div class="item access-fac"><span class="body"><strong>' + esc(String(f[0])) + '</strong><span>' + E(NEAR_T[f[1]]) + ' · ' + esc(km) + '</span>' + (f[5] ? '<span>' + esc(String(f[5])) + '</span>' : '') + '</span><a class="btn sm" href="' + esc(map) + '" target="_blank" rel="noopener">' + esc(t('access_near_dir')) + '</a></div>'; };
    /* nothing near in either group: one plain line, so two "None" lines don't read as "no care here" */
    if (r.groups.every((g) => !g.rows.length)) return '<div class="card soft access-near" data-nofold="1">' + head + '<p class="small" style="color:var(--fg)">' + esc(t('access_near_empty')) + '</p>' + nearFoot(r.ix) + '</div>';
    return '<div class="card access-near" data-nofold="1">' + head + r.groups.map((g) => '<h4>' + esc(t(g.h)) + '</h4>' + (g.rows.length ? '<div class="list">' + g.rows.map(row).join('') + '</div>' : '<p class="small">' + esc(t('access_near_none')) + '</p>')).join('') + nearFoot(r.ix, true) + '</div>';
  }
  const protoCard = (pin) => '<div class="card soft"><div class="row spread"><h3>' + esc(t('access_pin_for')) + ' <span class="num hl">' + esc(pin) + '</span></h3><button type="button" class="btn ghost sm" id="access-pin-clear">' + esc(t('access_pin_change')) + '</button></div>' +
    P(L('In the live app this page will list the real facilities near this PIN from government directories, with timings and distance. This prototype does not invent names or addresses, so for now it shows the kinds of free care every PIN has and the official links to find them.', 'असली app में यह पन्ना सरकारी सूचियों से इस PIN के पास की असली जगहें, समय और दूरी के साथ दिखाएगा। यह prototype नाम या पते नहीं गढ़ता, इसलिए अभी हर PIN पर मिलने वाले मुफ़्त इलाज के प्रकार और उन्हें खोजने के सरकारी link दिखाता है।'), 'small', 'color:var(--fg)') + '</div>';

  function renderCare(v) {
    /* her account's PIN code until she types another one (or clears it) on this screen */
    const pin = mem.pinSet ? mem.pin : (mem.pin || accPin()); const fromAcc = !mem.pinSet && !mem.pin && !!pin;
    const near = pin && S.care && S.care.on() ? nearBlock(pin) : null;
    v.innerHTML = S.backRow(t('access_care'), 'care', false) +
      P(L('Every PIN code in India has free government care: from your ASHA at home to the district hospital. Here is what each one gives free, and the official way to find it.', 'भारत के हर PIN code पर मुफ़्त सरकारी इलाज है: घर पर ASHA से लेकर ज़िला अस्पताल तक। यहाँ देखें कि हर जगह क्या मुफ़्त है, और उसे खोजने का सरकारी तरीक़ा।'), 'small') +
      '<div class="card"><label for="access-pin">' + esc(t('access_pin_l')) + '</label><div class="row"><input id="access-pin" inputmode="numeric" maxlength="6" autocomplete="postal-code" placeholder="' + esc(t('access_pin_ph')) + '" value="' + esc(pin) + '" style="flex:1"><button type="button" class="btn primary sm" id="access-pin-go">' + esc(t('access_pin_go')) + '</button></div>' +
      (mem.pinErr ? '<div class="flag" role="alert">' + E(mem.pinErr) + '</div>' : '') +
      '<p class="small">' + esc(t(fromAcc ? 'access_near_acc' : 'access_pin_note')) + '</p></div>' +
      (pin ? (near || protoCard(pin)) : '') +
      '<div class="list">' + (S.routeOwner('asha') ? '<button type="button" class="item" data-go="asha"><span class="ico-sm hue hue-teal">' + S.icon('person') + '</span><span class="body"><strong>' + esc(t('asha_h')) + '</strong><span>' + esc(t('asha_help_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button>' : '') +
        '<button type="button" class="item" data-go="access-online"><span class="ico-sm hue hue-sky">' + S.icon('file') + '</span><span class="body"><strong>' + esc(t('access_online')) + '</strong><span>' + esc(t('access_online_s')) + '</span></span><span class="chev">' + S.I.chev + '</span></button></div>' +
      '<div class="flag urgent">' + E(L('Emergency: call 112, or 108 or 102 for a free ambulance. Do not wait to find the right centre.', 'Emergency: 112 पर कॉल करें, या मुफ़्त एम्बुलेंस के लिए 108 या 102। सही केंद्र खोजने में देर न करें।')) + '</div>' +
      '<h2>' + E(pin ? L('Free care near you', 'आपके पास मुफ़्त इलाज') : L('Free care every PIN has', 'हर PIN पर मिलने वाला मुफ़्त इलाज')) + '</h2>' +
      '<div class="list">' + CARE.map(careCard).join('') + '</div>' +
      '<div class="card ok">' + P(L('Not sure which scheme money you can get? The scheme finder asks five quick questions.', 'कौन सी योजना का पैसा मिल सकता है, पता नहीं? योजना खोजने वाला पन्ना पाँच छोटे सवाल पूछता है।'), '', 'color:var(--ok)') + '<button type="button" class="btn sm access-inline" data-go="access-schemes">' + esc(t('access_schemes')) + '</button></div>' +
      '<h2>' + esc(t('helplines')) + '</h2><div class="list">' +
      copyRow('104', L('Health advice', 'स्वास्थ्य सलाह')) + copyRow('102', L('Ambulance in pregnancy and for babies', 'गर्भ और बच्चों के लिए एम्बुलेंस')) + copyRow('181', L('Women Helpline, any time', 'महिला हेल्पलाइन, कभी भी')) +
      copyRow('1097', L('HIV and STI helpline (NACO)', 'HIV और STI हेल्पलाइन (NACO)')) + copyRow('14555', L('Ayushman card (PM-JAY) helpline', 'आयुष्मान card (PM-JAY) हेल्पलाइन')) + '</div>' +
      srcList(['aam', 'jssk', 'ja', 'ictc', 'dsrc', 'naco', 'osc', 'afhc', 'nha']);
    S.wire(v); wireCopy(v);
    const inp = v.querySelector('#access-pin');
    const go = () => {
      const val = (inp.value || '').replace(/\s+/g, '');
      if (!/^\d{6}$/.test(val)) { mem.pinErr = L('Enter all 6 digits of your PIN code.', 'अपने PIN code के पूरे 6 अंक लिखें।'); mem.pin = ''; }
      else if (val[0] === '0') { mem.pinErr = L('Indian PIN codes start with a digit from 1 to 9. Please check the first digit.', 'भारत के PIN code 1 से 9 तक के अंक से शुरू होते हैं। पहला अंक जाँचें।'); mem.pin = ''; }
      else { mem.pinErr = ''; mem.pin = val; }
      mem.pinSet = true; renderCare(v);
    };
    v.querySelector('#access-pin-go').addEventListener('click', go);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    const cl = v.querySelector('#access-pin-clear'); if (cl) cl.addEventListener('click', () => { mem.pin = ''; mem.pinErr = ''; mem.pinSet = true; renderCare(v); const i2 = v.querySelector('#access-pin'); if (i2) i2.focus(); });
  }

  /* =====================================================================
     2. Scheme finder
     ===================================================================== */
  const Q = {
    preg: { q: L('Are you pregnant now?', 'क्या आप अभी गर्भवती हैं?'), o: ['y', 'n'] },
    baby: { q: L('Did you have a baby in the last 12 months?', 'क्या पिछले 12 महीनों में आपका बच्चा हुआ है?'), o: ['y', 'n'] },
    child: { q: L('Which child is this for you?', 'यह आपका कौन सा बच्चा है?'), o: ['1', '2', '3'], mom: true },
    job: { q: L('Do you work for an employer on a salary?', 'क्या आप किसी मालिक या कंपनी के यहाँ तनख़्वाह पर काम करती हैं?'), o: ['y', 'n'], mom: true },
    girl: { q: L('Is there a girl under 18 at home?', 'क्या घर में 18 साल से कम उम्र की कोई लड़की है?'), o: ['y', 'n'] },
    card: { q: L('Do you have an Ayushman (PM-JAY) card?', 'क्या आपके पास आयुष्मान (PM-JAY) card है?'), o: ['y', 'n', 'u'] },
    ration: { q: L('Do you have a ration card (BPL or NFSA)?', 'क्या आपके पास राशन कार्ड (BPL या NFSA) है?'), o: ['y', 'n'] }
  };
  const OPT = { y: L('Yes', 'हाँ'), n: L('No', 'नहीं'), u: L('Not sure', 'पता नहीं'), 1: L('First', 'पहला'), 2: L('Second', 'दूसरा'), 3: L('Third or more', 'तीसरा या ज़्यादा') };
  const TAGS = {
    all: { title: 'access_schemes', qs: ['preg', 'baby', 'child', 'job', 'girl', 'card', 'ration'], list: ['pmmvy', 'jsy', 'jssk', 'pmsma', 'thr', 'matben', 'amb', 'rksk', 'contra', 'steril', 'suvidha', 'pmjay', 'nikshay', 'osc'] },
    preg: { title: 'access_schemes_preg', qs: ['preg', 'child', 'job', 'card', 'ration'], list: ['pmmvy', 'jsy', 'jssk', 'pmsma', 'thr', 'amb', 'matben', 'pmjay'], preset: { preg: 'y' } },
    post: { title: 'access_schemes_post', qs: ['baby', 'child', 'job', 'card', 'ration'], list: ['pmmvy', 'jssk', 'thr', 'contra', 'amb', 'matben', 'steril', 'pmjay'], preset: { baby: 'y' } },
    period: { title: 'access_schemes_period', qs: ['girl', 'card'], list: ['suvidha', 'amb', 'rksk', 'pmjay'] },
    teen: { title: 'access_schemes_teen', qs: ['girl'], list: ['rksk', 'amb', 'suvidha', 'osc'], preset: { girl: 'y' } },
    family: { title: 'access_schemes_family', qs: ['card', 'ration'], list: ['contra', 'steril', 'pmjay'] }
  };
  const TAG_ORDER = ['all', 'preg', 'post', 'period', 'teen', 'family'];
  const TAG_CHIP = { all: L('All', 'सब'), preg: L('Pregnancy', 'गर्भ'), post: L('After birth', 'डिलीवरी के बाद'), period: L('Periods', 'पीरियड'), teen: L('Girls', 'बेटियाँ'), family: L('Family planning', 'परिवार नियोजन') };

  const isMom = (a) => a.preg === 'y' || a.baby === 'y';
  const notMom = (a) => a.preg === 'n' && a.baby === 'n';
  const SCH = {
    pmmvy: {
      name: L('PMMVY: Pradhan Mantri Matru Vandana Yojana', 'PMMVY: प्रधानमंत्री मातृ वंदना योजना'),
      line: L('₹5,000 for the first child; ₹6,000 if the second child is a girl', 'पहले बच्चे पर ₹5,000; दूसरा बच्चा बेटी हो तो ₹6,000'),
      benefit: L('₹5,000 for your first child, in two parts: ₹3,000 after at least one antenatal check-up, and ₹2,000 after the birth is registered and the baby has had the vaccines due by 14 weeks. If your second child is a girl: ₹6,000 in one payment after the birth and the 14-week vaccines. The money comes straight to your bank or post office account.', 'पहले बच्चे पर ₹5,000, दो हिस्सों में: कम से कम एक ANC जाँच के बाद ₹3,000, और जन्म का पंजीकरण और 14 हफ़्ते तक के टीके लगने के बाद ₹2,000। दूसरा बच्चा बेटी हो तो: जन्म और 14 हफ़्ते के टीकों के बाद एक बार में ₹6,000। पैसा सीधे आपके बैंक या डाकघर खाते में आता है।'),
      who: L('Women aged 18 years 7 months to 55 years at the birth, from any one of these groups: SC or ST; disability of 40% or more; BPL or NFSA ration card; Ayushman (PM-JAY) card; e-Shram card; PM-KISAN farmer family; MGNREGA job card; family income under ₹8 lakh a year; Anganwadi workers and helpers, and ASHAs. Women in regular government or PSU jobs with paid maternity leave are not covered. The scheme is not run in Telangana and Odisha; ask your Anganwadi worker what your state offers.', 'जन्म के समय 18 साल 7 महीने से 55 साल की महिलाएँ, इनमें से किसी एक समूह से: SC या ST; 40% या ज़्यादा विकलांगता; BPL या NFSA राशन कार्ड; आयुष्मान (PM-JAY) card; e-Shram card; PM-KISAN किसान परिवार; MGNREGA job card; परिवार की आमदनी साल में ₹8 लाख से कम; आंगनवाड़ी कार्यकर्ता, सहायिका और ASHA। सरकारी या PSU की पक्की नौकरी में सवेतन मातृत्व छुट्टी वाली महिलाएँ इसमें नहीं आतीं। तेलंगाना और ओडिशा में यह योजना नहीं चलती; आंगनवाड़ी कार्यकर्ता से पूछें कि आपके राज्य में क्या मिलता है।'),
      how: L('Your Anganwadi worker or ASHA can fill the form online for you, or you can register yourself on the PMMVY portal. Register any time up to 270 days after the birth. Helpline 14408. If a pregnancy is lost, you can still apply in a later pregnancy.', 'आपकी आंगनवाड़ी कार्यकर्ता या ASHA आपके लिए online फ़ॉर्म भर सकती हैं, या आप ख़ुद PMMVY portal पर पंजीकरण कर सकती हैं। जन्म के 270 दिन तक कभी भी पंजीकरण करें। हेल्पलाइन 14408। अगर गर्भ नहीं रहा, तो अगले गर्भ में फिर से आवेदन कर सकती हैं।'),
      docs: L('Aadhaar; a bank or post office account linked to Aadhaar; your mobile number; the MCP card with your last period date and check-up dates; one proof from the groups above (for example a ration card or job card). Later: the birth registration and the baby’s vaccine record.', 'आधार; आधार से जुड़ा बैंक या डाकघर खाता; आपका मोबाइल नंबर; MCP card जिसमें पिछले पीरियड और जाँच की तारीख़ें हों; ऊपर के समूहों में से एक का सबूत (जैसे राशन कार्ड या job card)। बाद में: जन्म का पंजीकरण और बच्चे के टीकों का रिकॉर्ड।'),
      links: [['https://pmmvy.wcd.gov.in/', L('PMMVY portal (official)', 'PMMVY portal (सरकारी)')]], src: ['pmmvyfaq', 'pmmvypib'],
      note: (a) => (a.child === '2' ? L('For a second child, only if the baby is a girl.', 'दूसरे बच्चे के लिए, सिर्फ़ तब जब बेटी हो।') : null),
      match: (a) => { if (notMom(a) || a.child === '3') return 'no'; if (!isMom(a) || a.child === '2') return 'maybe'; return (a.ration === 'y' || a.card === 'y') ? 'yes' : 'maybe'; } },
    jsy: {
      name: L('JSY: Janani Suraksha Yojana', 'JSY: जननी सुरक्षा योजना'),
      line: L('Cash when you give birth in a government hospital', 'सरकारी अस्पताल में डिलीवरी पर नक़द पैसा'),
      benefit: L('Cash for the mother after a birth in a government hospital or health centre. In Uttar Pradesh, Uttarakhand, Bihar, Jharkhand, Madhya Pradesh, Chhattisgarh, Assam, Rajasthan, Odisha and Jammu and Kashmir: ₹1,400 in villages, ₹1,000 in towns. In all other states: ₹700 in villages, ₹600 in towns.', 'सरकारी अस्पताल या स्वास्थ्य केंद्र में डिलीवरी के बाद माँ को नक़द। उत्तर प्रदेश, उत्तराखंड, बिहार, झारखंड, मध्य प्रदेश, छत्तीसगढ़, असम, राजस्थान, ओडिशा और जम्मू-कश्मीर में: गाँव में ₹1,400, शहर में ₹1,000। बाक़ी सभी राज्यों में: गाँव में ₹700, शहर में ₹600।'),
      who: L('In the 10 states named above: every woman who gives birth in a government facility. In other states: women from BPL, SC or ST families who give birth in a government facility. In every state, BPL, SC or ST women who give birth in an accredited private hospital.', 'ऊपर लिखे 10 राज्यों में: सरकारी केंद्र में डिलीवरी कराने वाली हर महिला। बाक़ी राज्यों में: सरकारी केंद्र में डिलीवरी कराने वाली BPL, SC या ST परिवार की महिलाएँ। हर राज्य में, मान्यता वाले प्राइवेट अस्पताल में डिलीवरी कराने वाली BPL, SC या ST महिलाएँ।'),
      how: L('Register your pregnancy early with your ASHA or ANM. Before you leave the hospital after the birth, ask how and when the JSY money will reach your account.', 'अपनी ASHA या ANM के पास जल्दी गर्भ का पंजीकरण कराएँ। डिलीवरी के बाद अस्पताल से निकलने से पहले पूछें कि JSY का पैसा खाते में कैसे और कब आएगा।'),
      docs: L('Usually the MCP card, Aadhaar and bank account details, and a BPL or caste certificate if that is how you qualify. Your ASHA knows your state’s exact list.', 'आम तौर पर MCP card, आधार और बैंक खाते की जानकारी, और अगर उसी से पात्र हैं तो BPL या जाति प्रमाण पत्र। आपके राज्य की पूरी सूची ASHA जानती हैं।'),
      links: [], src: ['jsy'],
      note: (a) => (a.baby === 'y' && a.preg !== 'y' ? L('Already had your baby? If the JSY money has not come, ask your ASHA.', 'बच्चा हो चुका है? JSY का पैसा नहीं आया तो ASHA से पूछें।') : null),
      match: (a) => { if (notMom(a)) return 'no'; if (a.preg === 'y') return a.ration === 'y' ? 'yes' : 'maybe'; return 'maybe'; } },
    jssk: {
      name: L('JSSK: free birth and newborn care', 'JSSK: मुफ़्त डिलीवरी और नवजात की देखभाल'),
      line: L('Delivery, C-section, medicines, tests, food and transport free', 'डिलीवरी, C-section, दवा, जाँच, खाना और आना-जाना मुफ़्त'),
      benefit: L('At government hospitals, free for every pregnant woman: the delivery, including a C-section; medicines; tests; blood if needed; food (3 days after a normal birth, 7 days after a C-section); and transport from home, between hospitals and back home. A sick baby up to 1 year old also gets free treatment, medicines, tests, blood and transport. Complications in pregnancy and after birth are covered too.', 'सरकारी अस्पतालों में हर गर्भवती महिला के लिए मुफ़्त: डिलीवरी, C-section भी; दवाएँ; जाँचें; ज़रूरत हो तो खून; खाना (सामान्य डिलीवरी के बाद 3 दिन, C-section के बाद 7 दिन); और घर से, एक अस्पताल से दूसरे तक और वापस घर तक आना-जाना। 1 साल तक के बीमार बच्चे का इलाज, दवाएँ, जाँचें, खून और आना-जाना भी मुफ़्त। गर्भ में और डिलीवरी के बाद की परेशानियाँ भी इसमें आती हैं।'),
      who: L('Every pregnant woman and every baby up to 1 year at a government facility. No card or income proof is needed.', 'सरकारी केंद्र पर हर गर्भवती महिला और 1 साल तक का हर बच्चा। कोई card या आमदनी का सबूत नहीं चाहिए।'),
      how: L('Go to a government hospital. Call 102 (108 in some states) for the free ambulance. If anyone asks you to pay or to buy medicines outside, you can say no and ask for the medical officer in charge, or call 104.', 'सरकारी अस्पताल जाएँ। मुफ़्त एम्बुलेंस के लिए 102 पर कॉल करें (कुछ राज्यों में 108)। कोई पैसे माँगे या बाहर से दवा ख़रीदने को कहे, तो मना कर सकती हैं और प्रभारी डॉक्टर से मिलें, या 104 पर कॉल करें।'),
      docs: L('Nothing is needed to get care. Carry your MCP card and old reports.', 'इलाज के लिए कुछ ज़रूरी नहीं। अपना MCP card और पुरानी रिपोर्ट साथ रखें।'),
      links: [], src: ['jssk'],
      match: (a) => (isMom(a) ? 'yes' : (notMom(a) ? 'no' : 'maybe')) },
    pmsma: {
      name: L('PMSMA: free check-up on the 9th', 'PMSMA: हर महीने की 9 तारीख़ को मुफ़्त जाँच'),
      line: L('A doctor checks you on the 9th of every month', 'हर महीने की 9 तारीख़ को डॉक्टर जाँच करते हैं'),
      benefit: L('A full antenatal check-up by a doctor, free, on the 9th of every month at government health centres, for women in the 4th to 9th month of pregnancy. Women with a high-risk pregnancy are followed up more closely.', 'गर्भ के 4वें से 9वें महीने की महिलाओं के लिए हर महीने की 9 तारीख़ को सरकारी केंद्रों पर डॉक्टर से पूरी ANC जाँच, मुफ़्त। ज़्यादा जोखिम वाले गर्भ में और ध्यान से देखभाल होती है।'),
      who: L('Every pregnant woman in the second or third trimester.', 'दूसरी या तीसरी तिमाही की हर गर्भवती महिला।'),
      how: L('Go to your PHC, CHC or district hospital on the 9th. Try to go at least once. If the 9th is a holiday, ask your ASHA which day it moves to.', '9 तारीख़ को अपने PHC, CHC या ज़िला अस्पताल जाएँ। कम से कम एक बार ज़रूर जाएँ। 9 तारीख़ को छुट्टी हो तो ASHA से पूछें कि जाँच किस दिन होगी।'),
      docs: L('Your MCP card and earlier reports.', 'आपका MCP card और पुरानी रिपोर्टें।'),
      links: [['https://pmsma.mohfw.gov.in/', L('PMSMA (official)', 'PMSMA (सरकारी)')]], src: ['pmsma'],
      match: (a) => (a.preg === 'y' ? 'yes' : (a.preg === 'n' ? 'no' : 'maybe')) },
    thr: {
      name: L('Anganwadi food for mothers (Poshan 2.0)', 'माँओं के लिए आंगनवाड़ी का खाना (पोषण 2.0)'),
      line: L('Free take-home ration in pregnancy and for 6 months after birth', 'गर्भ में और जन्म के 6 महीने बाद तक मुफ़्त घर ले जाने वाला राशन'),
      benefit: L('Extra food from the Anganwadi: take-home ration (in some states a hot cooked meal instead) for pregnant women and for mothers until the baby is 6 months old. Children under 6 get food at the Anganwadi too.', 'आंगनवाड़ी से अतिरिक्त खाना: गर्भवती महिलाओं के लिए, और बच्चे के 6 महीने का होने तक माँ के लिए, घर ले जाने वाला राशन (कुछ राज्यों में इसकी जगह गरम पका खाना)। 6 साल से छोटे बच्चों को भी आंगनवाड़ी में खाना मिलता है।'),
      who: L('Every pregnant woman, and every mother until her baby is 6 months old.', 'हर गर्भवती महिला, और बच्चे के 6 महीने का होने तक हर माँ।'),
      how: L('Register at your nearest Anganwadi Centre. If you cannot go yourself, ask about naming someone to collect it for you.', 'नज़दीकी आंगनवाड़ी केंद्र में पंजीकरण कराएँ। ख़ुद नहीं जा सकतीं तो पूछें कि आपकी जगह कौन ले सकता है, उसका नाम लिखवाया जा सकता है।'),
      docs: L('Aadhaar and your MCP card.', 'आधार और आपका MCP card।'),
      links: [], src: ['poshan'],
      match: (a) => (isMom(a) ? 'yes' : (notMom(a) ? 'no' : 'maybe')) },
    matben: {
      name: L('Paid maternity leave for working women', 'नौकरी करने वाली महिलाओं के लिए सवेतन मातृत्व छुट्टी'),
      line: L('Up to 26 weeks of paid leave, nursing breaks, crèche', '26 हफ़्ते तक सवेतन छुट्टी, दूध पिलाने का समय, crèche'),
      benefit: L('Up to 26 weeks of leave paid at your average daily wage, of which up to 8 weeks can be before the due date. 12 weeks if you adopt a baby under 3 months or become a mother through surrogacy. Two nursing breaks a day until the baby is 15 months old. A ₹3,500 medical bonus if your employer does not give free care before and after the birth. A crèche at workplaces with 50 or more workers. Work from home after the leave, if the job allows it and you both agree.', 'औसत रोज़ की मज़दूरी पर 26 हफ़्ते तक की सवेतन छुट्टी, जिसमें से 8 हफ़्ते तक डिलीवरी की तारीख़ से पहले ले सकती हैं। 3 महीने से छोटा बच्चा गोद लें या surrogacy से माँ बनें तो 12 हफ़्ते। बच्चे के 15 महीने का होने तक रोज़ दूध पिलाने के दो ब्रेक। मालिक जन्म से पहले और बाद में मुफ़्त इलाज न दे तो ₹3,500 का मेडिकल बोनस। 50 या ज़्यादा कर्मचारियों वाली जगह पर crèche। छुट्टी के बाद, काम ऐसा हो और दोनों राज़ी हों तो घर से काम।'),
      who: L('Women who worked at least 80 days for the employer in the 12 months before the due date. Since 21 November 2025 this comes under the Code on Social Security, 2020 (earlier the Maternity Benefit Act, 1961). Daily-wage and home-based work may not be covered; PMMVY is meant for many of these women.', 'जिन्होंने डिलीवरी की तारीख़ से पहले के 12 महीनों में उस मालिक के यहाँ कम से कम 80 दिन काम किया हो। 21 नवंबर 2025 से यह सामाजिक सुरक्षा संहिता, 2020 में आता है (पहले मातृत्व लाभ अधिनियम, 1961)। दिहाड़ी और घर से होने वाला काम शायद इसमें न आए; ऐसी कई महिलाओं के लिए PMMVY है।'),
      how: L('Tell your employer in writing, with your due date, and ask HR for the form. If it is refused, contact your state labour department.', 'अपने मालिक को लिखकर बताएँ, डिलीवरी की तारीख़ के साथ, और HR से फ़ॉर्म माँगें। मना करें तो अपने राज्य के श्रम विभाग से संपर्क करें।'),
      docs: L('Proof of pregnancy, delivery or miscarriage can now come from a doctor, an ASHA, an ANM or a midwife.', 'गर्भ, डिलीवरी या गर्भपात का सबूत अब डॉक्टर, ASHA, ANM या दाई से भी मिल सकता है।'),
      links: [], src: ['labour'],
      match: (a) => { if (notMom(a) || a.job === 'n') return 'no'; if (isMom(a) && a.job === 'y') return 'yes'; return 'maybe'; } },
    amb: {
      name: L('Anemia Mukt Bharat: free iron tablets', 'एनीमिया मुक्त भारत: मुफ़्त आयरन गोलियाँ'),
      line: L('Iron-folic acid tablets and a free Hb test', 'आयरन-फ़ोलिक एसिड की गोलियाँ और मुफ़्त Hb जाँच'),
      benefit: L('Free iron-folic acid (IFA) tablets. Pregnant women: one red tablet a day from the 4th month, for at least 180 days, and for 180 days after the birth. Women 20–49 who are not pregnant or breastfeeding: one red tablet a week. Girls and boys 10–19: one blue tablet a week at school; girls out of school get it at the Anganwadi. Also a haemoglobin (Hb) test, and treatment if it is low. Your ANM or doctor decides if you need a different dose.', 'मुफ़्त आयरन-फ़ोलिक एसिड (IFA) गोलियाँ। गर्भवती महिलाएँ: चौथे महीने से रोज़ एक लाल गोली, कम से कम 180 दिन, और डिलीवरी के बाद 180 दिन। 20–49 साल की महिलाएँ जो गर्भवती नहीं या दूध नहीं पिला रहीं: हफ़्ते में एक लाल गोली। 10–19 साल के लड़के-लड़कियाँ: स्कूल में हफ़्ते में एक नीली गोली; स्कूल न जाने वाली लड़कियों को आंगनवाड़ी में। साथ में हीमोग्लोबिन (Hb) जाँच, और कम हो तो इलाज। अलग ख़ुराक चाहिए या नहीं, यह आपकी ANM या डॉक्टर तय करती हैं।'),
      who: L('Everyone in these groups. No card needed.', 'इन समूहों में हर कोई। कोई card नहीं चाहिए।'),
      how: L('Ask your ASHA, ANM, Anganwadi worker or school, or at your Ayushman Arogya Mandir.', 'अपनी ASHA, ANM, आंगनवाड़ी कार्यकर्ता या स्कूल से, या आयुष्मान आरोग्य मंदिर पर पूछें।'),
      docs: L('None.', 'कुछ नहीं।'),
      links: [], src: ['amb'],
      match: () => 'all' },
    rksk: {
      name: L('RKSK: clinics and help for teenagers', 'RKSK: किशोरों के लिए क्लिनिक और मदद'),
      line: L('Private talks with a counsellor or doctor for ages 10–19', '10–19 साल के लिए counsellor या डॉक्टर से अकेले में बात'),
      benefit: L('Adolescent Friendly Health Clinics at PHCs, CHCs, district hospitals and medical colleges: a trained doctor, ANM or counsellor talks in private about periods, body changes, food, sex and relationships, mood, drugs or alcohol, and violence. Weekly iron tablets. Peer educators in many villages.', 'PHC, CHC, ज़िला अस्पताल और मेडिकल कॉलेज में किशोर-अनुकूल स्वास्थ्य क्लिनिक: प्रशिक्षित डॉक्टर, ANM या counsellor पीरियड, शरीर के बदलाव, खाना, संबंध, मन, नशा और हिंसा पर अकेले में बात करते हैं। हफ़्ते की आयरन गोली। कई गाँवों में साथी शिक्षक (peer educator) भी।'),
      who: L('Girls and boys aged 10–19, married or unmarried.', '10–19 साल की लड़कियाँ और लड़के, शादीशुदा हों या नहीं।'),
      how: L('Ask at the hospital counter for the AFHC, or ask your ASHA or school. A parent or trusted adult can come along. Childline 1098 is there for anyone under 18.', 'अस्पताल के काउंटर पर AFHC पूछें, या अपनी ASHA या स्कूल से। माता-पिता या भरोसे का कोई बड़ा साथ आ सकता है। 18 से कम उम्र के लिए Childline 1098।'),
      docs: L('None.', 'कुछ नहीं।'),
      links: [], src: ['afhc', 'amb'],
      match: (a) => (a.girl === 'y' ? 'yes' : (a.girl === 'n' ? 'no' : 'maybe')) },
    contra: {
      name: L('Free contraception, delivered by your ASHA', 'मुफ़्त गर्भनिरोध, ASHA घर तक लाती हैं'),
      line: L('Condoms, pills, emergency pill and test kits at home', 'कंडोम, गोलियाँ, इमरजेंसी गोली और जाँच किट घर पर'),
      benefit: L('Your ASHA brings condoms (Nirodh), Mala-N pills, Chhaya weekly pills, the emergency pill and Nishchay pregnancy test kits to your home. Copper-T, the Antara injection, tubectomy and NSV for men are free at government facilities. ₹300 towards travel if you get a Copper-T within 48 hours of a delivery or after an abortion at a government facility.', 'आपकी ASHA कंडोम (Nirodh), Mala-N गोलियाँ, छाया (हफ़्ते की गोली), इमरजेंसी गोली और Nishchay गर्भ जाँच किट घर तक लाती हैं। Copper-T, अंतरा इंजेक्शन, महिला नसबंदी और पुरुषों की NSV सरकारी केंद्रों पर मुफ़्त। सरकारी केंद्र में डिलीवरी के 48 घंटे के अंदर या गर्भपात के बाद Copper-T लगवाने पर आने-जाने के ₹300।'),
      who: L('Any woman or couple.', 'कोई भी महिला या जोड़ा।'),
      how: L('Ask your ASHA, or go to your Ayushman Arogya Mandir or PHC. Pills are given after a first check by a doctor, nurse or ANM.', 'अपनी ASHA से माँगें, या आयुष्मान आरोग्य मंदिर या PHC जाएँ। गोलियाँ डॉक्टर, नर्स या ANM की पहली जाँच के बाद मिलती हैं।'),
      docs: L('None.', 'कुछ नहीं।'),
      links: [], src: ['cho'], go: ['contra-free'],
      match: () => 'all' },
    steril: {
      name: L('Sterilisation: wage compensation and indemnity', 'नसबंदी: मज़दूरी का मुआवज़ा और क्षतिपूर्ति'),
      line: L('Money for lost wages after tubectomy or NSV', 'महिला नसबंदी या NSV के बाद मज़दूरी के नुक़सान का पैसा'),
      benefit: L('Money for wages lost on the day of a tubectomy (women) or NSV (men) at a government facility. The amount depends on your state and category. If the operation fails or there is a complication, the Family Planning Indemnity Scheme pays compensation.', 'सरकारी केंद्र में महिला नसबंदी या पुरुषों की NSV के दिन की मज़दूरी के नुक़सान का पैसा। रक़म आपके राज्य और श्रेणी पर निर्भर है। ऑपरेशन नाकाम हो या कोई परेशानी हो, तो परिवार नियोजन क्षतिपूर्ति योजना मुआवज़ा देती है।'),
      who: L('Women or men who choose a permanent method at a government facility, once the family is complete. It is always your choice; no one may pressure you.', 'परिवार पूरा होने पर सरकारी केंद्र में स्थायी तरीक़ा चुनने वाली महिलाएँ या पुरुष। फ़ैसला हमेशा आपका है; कोई दबाव नहीं डाल सकता।'),
      how: L('Ask at your PHC or CHC for the next tubectomy or NSV day, and ask the amount before the date. Keep the certificate you get.', 'अपने PHC या CHC पर अगली नसबंदी या NSV की तारीख़ पूछें, और तारीख़ से पहले रक़म भी पूछ लें। जो प्रमाण पत्र मिले उसे सँभालकर रखें।'),
      docs: L('Usually Aadhaar and bank account details.', 'आम तौर पर आधार और बैंक खाते की जानकारी।'),
      links: [], src: ['cho', 'fpis'], go: ['contra-m-nsv'],
      match: () => 'maybe' },
    suvidha: {
      name: L('Suvidha pads at ₹1', 'Suvidha पैड ₹1 में'),
      line: L('Sanitary pads at ₹1 each at Jan Aushadhi Kendras', 'जन औषधि केंद्रों पर ₹1 का एक सैनिटरी पैड'),
      benefit: L('Oxo-biodegradable Suvidha sanitary pads at ₹1 a pad. The same Kendras sell generic medicines priced 50–80% below branded ones.', 'Oxo-biodegradable Suvidha सैनिटरी पैड ₹1 का एक। इन्हीं केंद्रों पर जेनेरिक दवाएँ ब्रांडेड से 50–80% कम दाम पर।'),
      who: L('Anyone.', 'कोई भी।'),
      how: L('Find a Jan Aushadhi Kendra on the official site or the Jan Aushadhi Sugam app.', 'सरकारी साइट या Jan Aushadhi Sugam app पर जन औषधि केंद्र खोजें।'),
      docs: L('None.', 'कुछ नहीं।'),
      links: [['https://janaushadhi.gov.in/locate-kendra', L('Find a Jan Aushadhi Kendra (official)', 'जन औषधि केंद्र खोजें (सरकारी)')]], src: ['ja'],
      match: () => 'all' },
    pmjay: {
      name: L('PM-JAY: Ayushman Bharat card', 'PM-JAY: आयुष्मान भारत card'),
      line: L('Cashless hospital care up to ₹5 lakh per family per year', 'हर परिवार को साल में ₹5 लाख तक cashless इलाज'),
      benefit: L('Cashless hospital treatment up to ₹5 lakh per family per year at listed government and private hospitals, including illnesses you already had, with no waiting period. Everyone aged 70 or more can get a card, whatever the family income.', 'सूची वाले सरकारी और प्राइवेट अस्पतालों में हर परिवार को साल में ₹5 लाख तक cashless इलाज, पहले से चल रही बीमारियाँ भी, बिना इंतज़ार। 70 साल या ज़्यादा उम्र के हर व्यक्ति को card मिल सकता है, परिवार की आमदनी कुछ भी हो।'),
      who: L('Families on the scheme’s list in your state, and everyone aged 70 or more. Check your name online or call 14555.', 'आपके राज्य में योजना की सूची वाले परिवार, और 70 साल या ज़्यादा उम्र का हर व्यक्ति। online नाम देखें या 14555 पर कॉल करें।'),
      how: L('Check your name on the beneficiary site, or at the Ayushman Mitra desk of a listed hospital. Complete e-KYC with Aadhaar to get your card.', 'beneficiary साइट पर, या सूची वाले अस्पताल में आयुष्मान मित्र की डेस्क पर नाम देखें। card के लिए आधार से e-KYC करें।'),
      docs: L('Aadhaar. A ration card helps to find your family on the list.', 'आधार। राशन कार्ड से सूची में परिवार ढूँढना आसान होता है।'),
      links: [['https://beneficiary.nha.gov.in/', L('Check your Ayushman card (official)', 'अपना आयुष्मान card देखें (सरकारी)')], ['https://hospitals.pmjay.gov.in/mapsPlotting.htm', L('Map of private hospitals on PM-JAY (official)', 'PM-JAY के प्राइवेट अस्पतालों का नक़्शा (सरकारी)')]], src: ['nha'],
      match: (a) => (a.card === 'y' ? 'yes' : 'maybe') },
    nikshay: {
      name: L('Ni-kshay Poshan Yojana: food money for TB', 'निक्षय पोषण योजना: टीबी में खाने के लिए पैसा'),
      line: L('₹1,000 a month for anyone on TB treatment', 'टीबी का इलाज ले रहे हर व्यक्ति को हर महीने ₹1,000'),
      benefit: L('₹1,000 a month by bank transfer for food, for the whole TB treatment (since 1 November 2024; earlier ₹500). TB tests and medicines are free at government centres.', 'खाने के लिए हर महीने ₹1,000 बैंक में, टीबी के पूरे इलाज तक (1 नवंबर 2024 से; पहले ₹500)। टीबी की जाँच और दवाएँ सरकारी केंद्रों पर मुफ़्त।'),
      who: L('Every person with TB who is registered on Ni-kshay, man or woman, adult or child.', 'Ni-kshay पर दर्ज टीबी का हर मरीज़, महिला या पुरुष, बड़ा या बच्चा।'),
      how: L('Your doctor or DOTS centre registers you on Ni-kshay. Give them your bank details. If anyone at home has had a cough for 2 weeks or more, get them tested free.', 'आपके डॉक्टर या DOTS केंद्र Ni-kshay पर आपका नाम दर्ज करते हैं। उन्हें बैंक की जानकारी दें। घर में किसी को 2 हफ़्ते या ज़्यादा से खाँसी हो तो मुफ़्त जाँच कराएँ।'),
      docs: L('A bank account, linked to Aadhaar.', 'आधार से जुड़ा बैंक खाता।'),
      links: [], src: ['nikshay'],
      note: () => L('Only if someone at home has TB.', 'सिर्फ़ तब, जब घर में किसी को टीबी हो।'),
      match: () => 'maybe' },
    osc: {
      name: L('One Stop Centre and 181 (Mission Shakti)', 'वन स्टॉप सेंटर और 181 (मिशन शक्ति)'),
      line: L('Help for any woman facing violence, 24 hours', 'हिंसा झेल रही किसी भी महिला के लिए मदद, 24 घंटे'),
      benefit: L('Medical help, police help, legal aid and counselling under one roof, open 24 hours, and a safe place to stay for up to 5 days. The 181 Women Helpline answers any time. Free legal aid: 15100.', 'एक ही जगह इलाज, पुलिस मदद, क़ानूनी सहायता और सलाह, 24 घंटे खुला, और 5 दिन तक सुरक्षित रहने की जगह। 181 महिला हेल्पलाइन कभी भी जवाब देती है। मुफ़्त क़ानूनी सहायता: 15100।'),
      who: L('Any woman or girl facing violence at home or outside, married or not. Under 18: Childline 1098 too.', 'घर में या बाहर हिंसा झेल रही कोई भी महिला या लड़की, शादीशुदा हो या नहीं। 18 से कम: Childline 1098 भी।'),
      how: L('Call 181 or 112, or walk in. Find the nearest centre on the Mission Shakti site.', '181 या 112 पर कॉल करें, या सीधे जाएँ। नज़दीकी सेंटर मिशन शक्ति की साइट पर खोजें।'),
      docs: L('None. You do not need to file a police case first.', 'कुछ नहीं। पहले पुलिस केस करना ज़रूरी नहीं।'),
      links: [['https://missionshakti.wcd.gov.in/statisticsOsc', L('Find your nearest One Stop Centre (official)', 'नज़दीकी वन स्टॉप सेंटर खोजें (सरकारी)')]], src: ['osc'], go: ['intimate-safety'],
      match: () => 'all' }
  };
  const STATUS = { yes: ['ok', L('Likely for you', 'शायद आपके लिए')], maybe: ['', L('Check if it fits', 'देखें कि लागू है या नहीं')], all: ['accent', L('For everyone', 'सबके लिए')], no: ['muted', L('Not now', 'अभी नहीं')] };

  /* ---------- My claims (Version 28; docs/feature-research-2026-10-22.md, B1) ----------
     For schemes she applies for, she can track her claim on this phone: papers ready (PMMVY's list as ticks), applied, money or
     card received, each with its date. PMMVY's deadline (270 days after the birth, from the verified "how") is worked out from
     her baby's birth date, with a reminder a month and a week before. The finder's answers are still never saved; only the
     claims she chooses to track are, in her diary. */
  const TRACK = ['pmmvy', 'jsy', 'thr', 'matben', 'steril', 'pmjay', 'nikshay'];
  const STEPS = ['ready', 'applied', 'got'];
  const AD = () => { const d = S.data('access'); if (!d.claims || typeof d.claims !== 'object') d.claims = {}; return d; };
  const claimOf = (k) => (S.canSave() ? AD().claims[k] || null : null);
  const docList = (s) => { const a = s.docs.en.split(/;\s*/), b = s.docs.hi.split(/;\s*/); return a.length >= 2 && a.length === b.length ? a.map((x, i) => L(x.charAt(0).toUpperCase() + x.slice(1), b[i])) : null; };   /* a list item starts with a capital */
  const birthISO = () => { const b = (S.state.situation || {}).deliveredOn; return typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b) ? b : null; };
  const pmmvyBy = () => { const b = birthISO(); return b ? S.addDays(S.fromISO(b), 270) : null; };
  const fmtL = (d) => S.fmtD(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const stepOf = (c) => (c.got ? 'got' : (c.applied ? 'applied' : 'ready'));
  function claimSync() {
    S.reminders.remove('access-pmmvy');
    const c = claimOf('pmmvy'); const by = pmmvyBy();
    if (!c || c.applied || c.got || !by) return;
    const ds = [S.addDays(by, -30), S.addDays(by, -7)].filter((d) => d > S.today()).map(S.toISO);
    if (ds.length) S.reminders.upsert({ id: 'access-pmmvy', mod: 'access', title: L('PMMVY: register soon', 'PMMVY: जल्द पंजीकरण करें'), kind: 'custom', dates: ds, start: null, every: null, weekdays: null, time: '10:00', on: true });
  }
  function claimBlock(k) {
    if (!S.canSave() || TRACK.indexOf(k) < 0) return '';
    const s = SCH[k]; const c = claimOf(k);
    if (!c) return '<button type="button" class="btn sm primary access-inline" data-claim-start="' + k + '">' + esc(t('access_claim_start')) + '</button>';
    const docs = docList(s); const st = stepOf(c);
    let extra = '';
    if (k === 'pmmvy') {
      const by = pmmvyBy();
      if (by && !c.applied && !c.got) extra += '<div class="flag">' + esc(tf('access_pmmvy_by', { d: fmtL(by) })) + '</div>';
      const anc = S.pregAnc ? S.pregAnc() : [];
      /* The ministry's FAQ asks for one check-up in one answer and two in another (read 22 Oct 2026), so the line waits for two:
         true either way. docs/wording-review-v28.md, section 5, asks which is right. */
      if (!by && S.cycle.isPregnant() && anc.length >= 2 && !c.applied && !c.got) extra += '<p class="small" style="color:var(--fg)">' + esc(t('access_pmmvy_part1')) + '</p>';
    }
    return '<div class="access-claim" data-claim="' + k + '"><h4>' + esc(t('access_claim_h')) + '</h4>' + extra +
      (docs ? '<p class="small">' + esc(t('access_claim_docs')) + '</p><div class="checklist">' + docs.map((x, i) => '<label class="' + ((c.docs || {})[i] ? 'done' : '') + '"><input type="checkbox" data-claim-doc="' + k + '|' + i + '"' + ((c.docs || {})[i] ? ' checked' : '') + '> <span>' + E(x) + '</span></label>').join('') + '</div>' : '') +
      '<div class="access-steps">' + STEPS.map((x) => '<button type="button" class="chip' + (x === st ? ' on' : '') + '" data-claim-step="' + k + '|' + x + '">' + esc(t('access_step_' + x)) + (x !== 'ready' && c[x] ? ' · ' + esc(S.fmtD(S.fromISO(c[x]), { day: 'numeric', month: 'short' })) : '') + '</button>').join('') + '</div>' +
      '<button type="button" class="linkbtn" data-claim-stop="' + k + '">' + esc(t('access_claim_stop')) + '</button></div>';
  }
  function myClaims() {
    if (!S.canSave()) return ''; const cl = AD().claims; const ks = TRACK.filter((k) => cl[k]); if (!ks.length) return '';
    return '<div class="card access-my"><h3>' + esc(t('access_my_h')) + '</h3><div class="list">' + ks.map((k) => { const c = cl[k]; const st = stepOf(c); const by = k === 'pmmvy' && st === 'ready' ? pmmvyBy() : null;
      return '<button type="button" class="item" data-claim-open="' + k + '"><span class="body"><strong>' + E(SCH[k].name) + '</strong><span>' + esc(t('access_step_' + st)) + (c[st] && st !== 'ready' ? ' · ' + esc(fmtL(S.fromISO(c[st]))) : '') + (by ? ' · ' + esc(tf('access_pmmvy_by', { d: fmtL(by) })) : '') + '</span></span><span class="chev">' + S.I.chev + '</span></button>'; }).join('') + '</div></div>';
  }

  function schemeCard(k, st, a) {
    const s = SCH[k]; const p = STATUS[st]; const note = s.note ? s.note(a) : null;
    return '<details class="access-sch" id="sch-' + k + '"' + (mem.open === k ? ' open' : '') + '><summary><span class="body"><strong>' + E(s.name) + '</strong><span>' + E(s.line) + '</span></span><span class="pill ' + p[0] + '">' + E(p[1]) + '</span>' + chev + '</summary>' +
      '<div class="in">' + (note ? '<div class="flag">' + E(note) + '</div>' : '') +
      '<h4>' + esc(t('access_benefit')) + '</h4>' + P(s.benefit) + '<h4>' + esc(t('access_who')) + '</h4>' + P(s.who) + '<h4>' + esc(t('access_apply')) + '</h4>' + P(s.how) + '<h4>' + esc(t('access_docs')) + '</h4>' + P(s.docs) + claimBlock(k) +
      (s.links.length ? '<div class="access-links">' + s.links.map((x) => ext(x[0], x[1])).join('') + '</div>' : '') + goBtns(s.go) +
      '<p class="sources">' + esc(t('access_source')) + ': ' + s.src.map((x) => '<a href="' + esc(SRC[x].url) + '" target="_blank" rel="noopener">' + E(SRC[x]) + '</a>').join(' · ') + '</p></div></details>';
  }

  /* ---------- Do it online: the government's own apps and websites (Version 28; docs/feature-research-2026-10-22.md, B5) ----------
     Each opens the official site in her browser. Sakhi sends nothing and fills in nothing for her. Every link was opened and
     checked on 22 Oct 2026; the facts are from each scheme's official page or Sakhi's verified articles. */
  const ONLINE = [
    { k: 'abha', icon: 'file', hue: 'sky', url: 'https://abha.abdm.gov.in/abha/v3/',
      name: L('ABHA: your free health ID', 'ABHA: आपकी मुफ़्त हेल्थ ID'),
      what: L('A free 14-digit health ID from the Government of India. Labs and hospitals in the Ayushman Bharat Digital Mission can link your reports to it, and a doctor sees them only with your consent.', 'भारत सरकार की 14 अंकों की मुफ़्त हेल्थ ID। आयुष्मान भारत डिजिटल मिशन से जुड़ी लैब और अस्पताल आपकी रिपोर्ट इससे जोड़ सकते हैं, और डॉक्टर उन्हें सिर्फ़ आपकी सहमति से देखते हैं।'),
      need: L('Usually your Aadhaar and the mobile number linked to it. Or ask at your Ayushman Arogya Mandir.', 'आम तौर पर आपका आधार और उससे जुड़ा मोबाइल नंबर। या अपने आयुष्मान आरोग्य मंदिर में पूछें।') },
    { k: 'uwin', icon: 'check', hue: 'teal', url: 'https://uwin.mohfw.gov.in/home',
      name: L('U-WIN: vaccination records', 'U-WIN: टीकों का रिकॉर्ड'),
      what: L('Your Td doses in pregnancy and your baby’s vaccines, with certificates. You can also find a vaccination session near your PIN code.', 'गर्भावस्था के Td टीके और बच्चे के टीके, सर्टिफ़िकेट के साथ। अपने PIN code के पास टीकाकरण का दिन भी देख सकती हैं।'),
      need: L('A mobile number for the OTP.', 'OTP के लिए एक मोबाइल नंबर।') },
    { k: 'pmmvy', icon: 'file', hue: 'gold', url: 'https://pmmvy.wcd.gov.in/', go: 'access-schemes-preg',
      name: L('PMMVY: ₹5,000 for your first child', 'PMMVY: पहले बच्चे के लिए ₹5,000'),
      what: L('Apply yourself on the official portal, or through your Anganwadi worker or ASHA. A second child who is a girl gets ₹6,000.', 'सरकारी पोर्टल पर ख़ुद आवेदन करें, या आंगनवाड़ी कार्यकर्ता या ASHA के ज़रिए। दूसरा बच्चा बेटी हो तो ₹6,000 मिलते हैं।'),
      need: L('Aadhaar, a bank or post office account linked to Aadhaar, your MCP card, and one proof that you are eligible, such as a ration card or an Ayushman card.', 'आधार, आधार से जुड़ा बैंक या डाकघर खाता, आपका MCP कार्ड, और पात्रता का एक सबूत, जैसे राशन कार्ड या आयुष्मान कार्ड।') },
    { k: 'pmjay', icon: 'heart', hue: 'rose', url: 'https://beneficiary.nha.gov.in/',
      name: L('Ayushman card (PM-JAY)', 'आयुष्मान कार्ड (PM-JAY)'),
      what: L('Check whether your family has free hospital care of up to ₹5 lakh a year, and get your card.', 'देखें कि आपके परिवार को हर साल ₹5 लाख तक का मुफ़्त अस्पताल इलाज मिलता है या नहीं, और अपना कार्ड बनवाएँ।'),
      need: L('Your mobile number, and Aadhaar for e-KYC. Or ask at the Ayushman Mitra desk of a listed hospital. Helpline 14555.', 'आपका मोबाइल नंबर, और e-KYC के लिए आधार। या किसी सूचीबद्ध अस्पताल के आयुष्मान मित्र डेस्क पर पूछें। हेल्पलाइन 14555।') },
    { k: 'esanj', icon: 'person', hue: 'purple', url: 'https://esanjeevani.mohfw.gov.in/',
      name: L('eSanjeevani: free video OPD', 'eSanjeevani: मुफ़्त वीडियो OPD'),
      what: L('Talk to a government doctor on a video call from your phone, free.', 'अपने फ़ोन से वीडियो कॉल पर सरकारी डॉक्टर से बात करें, मुफ़्त।'),
      need: L('A mobile number for the OTP. Timings depend on your state.', 'OTP के लिए एक मोबाइल नंबर। समय आपके राज्य पर निर्भर है।') },
    { k: 'ja', icon: 'pill', hue: 'green', url: 'https://janaushadhi.gov.in/locate-kendra',
      name: L('Jan Aushadhi: medicines for less', 'जन औषधि: कम दाम पर दवाएँ'),
      what: L('Find a Jan Aushadhi store near you: generic medicines at 50 to 80 percent lower prices, and sanitary pads at ₹1 each.', 'अपने पास जन औषधि स्टोर खोजें: जेनेरिक दवाएँ 50 से 80 प्रतिशत कम दाम पर, और सैनिटरी पैड ₹1 में।'),
      need: L('Your state and district.', 'आपका राज्य और ज़िला।') }
  ];
  function renderOnline(v) {
    v.innerHTML = S.backRow(t('access_online'), 'care', false) + P(L('These are the government’s own websites. They open in your browser: Sakhi sends nothing and fills in nothing for you.', 'ये सरकार की अपनी वेबसाइटें हैं। ये आपके browser में खुलती हैं: Sakhi न कुछ भेजती है, न आपकी ओर से कुछ भरती है।')) +
      '<div class="flag">' + E(L('Never share an OTP with someone who calls you, and never pay anyone to get a scheme.', 'कॉल करने वाले किसी को OTP न बताएँ, और किसी योजना के लिए किसी को पैसे न दें।')) + '</div>' +
      ONLINE.map((x) => '<div class="card access-on" data-nofold="1"><div class="row" style="gap:10px;align-items:center"><span class="ico-sm hue hue-' + x.hue + '">' + S.icon(x.icon) + '</span><h3 style="margin:0;min-width:0">' + E(x.name) + '</h3></div>' +
        '<p>' + E(x.what) + '</p><p class="small"><strong>' + esc(t('access_online_need')) + '</strong> ' + E(x.need) + '</p>' +
        '<div class="row wrap"><a class="btn sm primary" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(t('access_online_open')) + '</a>' + (x.go ? '<button type="button" class="btn sm" data-go="' + x.go + '">' + esc(t('access_online_who')) + '</button>' : '') + '</div></div>').join('') +
      '<p class="footnote">' + esc(t('access_online_foot')) + '</p>';
    S.wire(v);
  }

  function renderSchemes(v, tag) {
    const tg = TAGS[tag] ? tag : 'all'; const T = TAGS[tg]; const a = mem.ans;
    Object.keys(T.preset || {}).forEach((k) => { if (a[k] == null) a[k] = T.preset[k]; });
    const qs = T.qs.filter((k) => !Q[k].mom || isMom(a));
    const groups = { yes: [], maybe: [], all: [], no: [] };
    T.list.forEach((k) => { groups[SCH[k].match(a)].push(k); });
    const head = (key, cls) => '<h2 class="access-gh">' + E(STATUS[key][1]) + ' <span class="pill ' + cls + '">' + groups[key].length + '</span></h2>';
    const block = (key) => (groups[key].length ? head(key, STATUS[key][0]) + '<div class="list">' + groups[key].map((k) => schemeCard(k, key, a)).join('') + '</div>' : '');
    const answered = qs.filter((k) => a[k] != null).length;
    v.innerHTML = S.backRow(t(T.title), 'care', false) +
      P(L('Government money and free services for women and families, checked against official sources for 2025–26. Answer what you like; your answers stay on this screen and are not saved.', 'महिलाओं और परिवारों के लिए सरकारी पैसा और मुफ़्त सेवाएँ, 2025–26 के सरकारी स्रोतों से जाँची गई। जो चाहें उसका जवाब दें; आपके जवाब इसी screen पर रहते हैं, save नहीं होते।'), 'small') +
      myClaims() + (tg === 'preg' ? '<div class="card soft">' + P(L('In 2025, families paid about ₹37,600 of their own money on average for a birth in a private hospital, and about ₹2,300 in a government one (national survey, NSS 80th round). Under JSSK, birth at a government hospital is free and cashless.', 'साल 2025 में परिवारों ने निजी अस्पताल में एक डिलीवरी पर औसतन लगभग ₹37,600 अपनी जेब से दिए, और सरकारी अस्पताल में लगभग ₹2,300 (राष्ट्रीय सर्वे, NSS 80वाँ दौर)। JSSK में सरकारी अस्पताल में डिलीवरी मुफ़्त और बिना नक़द के होती है।'), 'small') + '<p class="sources"><a href="https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/apr/doc2026420852401.pdf" target="_blank" rel="noopener">' + E(L('PIB, NSS 80th round: household health spending, 2026', 'PIB, NSS 80वाँ दौर: परिवारों का स्वास्थ्य ख़र्च, 2026')) + '</a></p></div>' : '') +
      '<div class="chips access-tags" role="group" aria-label="' + esc(t('access_filter')) + '">' + TAG_ORDER.map((x) => '<button type="button" class="chip' + (x === tg ? ' on' : '') + '" data-go="access-schemes-' + x + '">' + E(TAG_CHIP[x]) + '</button>').join('') + '</div>' +
      '<div class="card"><div class="row spread"><h3>' + esc(t('access_q_h')) + '</h3><span class="small num">' + answered + '/' + qs.length + '</span></div>' +
      qs.map((k) => '<div class="access-q"><span class="access-ql">' + E(Q[k].q) + '</span><div class="chips">' + Q[k].o.map((o) => '<button type="button" class="chip' + (a[k] === o ? ' on' : '') + '" data-q="' + k + '" data-o="' + o + '">' + E(OPT[o]) + '</button>').join('') + '</div></div>').join('') +
      (answered ? '<button type="button" class="btn ghost sm access-inline" id="access-q-reset">' + esc(t('access_q_reset')) + '</button>' : '') + '</div>' +
      block('yes') + block('maybe') + block('all') +
      (groups.no.length ? '<details class="access-later"><summary>' + E(STATUS.no[1]) + ' (' + groups.no.length + ')</summary><div class="list" style="margin-top:8px">' + groups.no.map((k) => schemeCard(k, 'no', a)).join('') + '</div></details>' : '') +
      '<div class="card soft">' + P(L('Amounts and rules can change, and states add their own schemes. Your ASHA, Anganwadi worker or the 104 helpline can confirm what applies to you. Nobody may charge you to fill a scheme form.', 'रक़म और नियम बदल सकते हैं, और राज्य अपनी योजनाएँ भी जोड़ते हैं। आप पर क्या लागू है, यह आपकी ASHA, आंगनवाड़ी कार्यकर्ता या 104 हेल्पलाइन बता सकती है। योजना का फ़ॉर्म भरने के पैसे कोई नहीं ले सकता।'), 'small', 'color:var(--fg)') + '<button type="button" class="btn sm access-inline" data-go="access-care">' + esc(t('access_care')) + '</button></div>';
    S.wire(v);
    v.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.q, o = b.dataset.o; a[k] = a[k] === o ? undefined : o;
      if (!isMom(a)) { delete a.child; delete a.job; }
      renderSchemes(v, tg);
    }));
    const rs = v.querySelector('#access-q-reset'); if (rs) rs.addEventListener('click', () => { mem.ans = {}; renderSchemes(v, tg); });
    /* claims: saved in her diary; the card she is working on stays open */
    const redo = (k) => { mem.open = k; claimSync(); S.save(); renderSchemes(v, tg); const el = v.querySelector('#sch-' + k); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' }); };
    v.querySelectorAll('[data-claim-start]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.claimStart; AD().claims[k] = { started: S.toISO(S.today()), docs: {} }; redo(k); }));
    v.querySelectorAll('[data-claim-doc]').forEach((c) => c.addEventListener('change', () => { const p = c.dataset.claimDoc.split('|'); const cl = AD().claims[p[0]]; if (!cl) return; cl.docs = cl.docs || {}; if (c.checked) cl.docs[p[1]] = 1; else delete cl.docs[p[1]]; redo(p[0]); }));
    v.querySelectorAll('[data-claim-step]').forEach((b) => b.addEventListener('click', () => { const p = b.dataset.claimStep.split('|'); const cl = AD().claims[p[0]]; if (!cl) return; const td = S.toISO(S.today());
      if (p[1] === 'ready') { delete cl.applied; delete cl.got; } else if (p[1] === 'applied') { cl.applied = cl.applied || td; delete cl.got; } else { cl.applied = cl.applied || td; cl.got = cl.got || td; } redo(p[0]); }));
    v.querySelectorAll('[data-claim-stop]').forEach((b) => b.addEventListener('click', () => { delete AD().claims[b.dataset.claimStop]; redo(null); }));
    v.querySelectorAll('[data-claim-open]').forEach((b) => b.addEventListener('click', () => { mem.open = b.dataset.claimOpen; const el = v.querySelector('#sch-' + mem.open); if (el) { el.open = true; if (el.scrollIntoView) el.scrollIntoView({ block: 'start' }); } else renderSchemes(v, 'all'); }));
  }

  /* =====================================================================
     3. For your husband or partner
     ===================================================================== */
  const PARTNER = [
    { h: L('Her periods', 'उनके पीरियड'), go: ['periods-pain'], items: [
      L('Periods are normal and healthy. Nothing about them is dirty or impure; she can eat, cook, sleep and pray as she wishes.', 'पीरियड सामान्य और सेहत की निशानी हैं। इनमें कुछ भी गंदा या अपवित्र नहीं; वे जैसा चाहें खा, पका, सो और पूजा कर सकती हैं।'),
      L('Keep pads at home, help with heavy work on the first days, and give her space to rest. A hot water bottle helps cramps.', 'घर में pad रखें, पहले दिनों में भारी काम में हाथ बँटाएँ, और आराम करने दें। गरम पानी की थैली से ऐंठन में आराम मिलता है।'),
      L('Pain that stops her day, bleeding more than 8 days, or soaking a pad every 1–2 hours is not normal. Go with her to a doctor; the Hb test is free at government centres.', 'दर्द जो उनका दिन रोक दे, 8 दिन से ज़्यादा ब्लीडिंग, या हर 1–2 घंटे में pad भीगना सामान्य नहीं। उनके साथ डॉक्टर के पास जाएँ; Hb जाँच सरकारी केंद्रों पर मुफ़्त है।')] },
    { h: L('In pregnancy', 'गर्भ में'), go: ['access-schemes-preg'], items: [
      L('Go with her to register the pregnancy and to her check-ups. A free doctor check-up happens on the 9th of every month (PMSMA).', 'गर्भ के पंजीकरण और जाँचों में उनके साथ जाएँ। हर महीने की 9 तारीख़ को डॉक्टर की मुफ़्त जाँच होती है (PMSMA)।'),
      L('She needs more food, rest and her iron and calcium tablets every day. Take on the heavy work. Keep smoke, bidi and tobacco away from her.', 'उन्हें ज़्यादा खाना, आराम और रोज़ आयरन और कैल्शियम की गोलियाँ चाहिए। भारी काम आप सँभालें। धुआँ, बीड़ी और तंबाकू उनसे दूर रखें।'),
      L('Learn the danger signs: bleeding, fits, severe headache with blurred vision, fluid leaking, or the baby moving less. Any of these: call 112 or 102 now and take her to hospital.', 'ख़तरे के लक्षण पहचानें: ब्लीडिंग, दौरे, धुंधली नज़र के साथ तेज़ सिरदर्द, पानी निकलना, या बच्चे की हलचल कम होना। इनमें से कुछ भी हो: अभी 112 या 102 पर कॉल करें और अस्पताल ले जाएँ।'),
      L('Plan the hospital, the 102 ambulance number and money for the day in advance. Asking about or finding out the baby’s sex is a crime in India. A daughter is as welcome as a son.', 'अस्पताल, 102 एम्बुलेंस का नंबर और उस दिन के ख़र्च की योजना पहले से बनाएँ। बच्चे का लिंग पूछना या पता करना भारत में अपराध है। बेटी उतनी ही स्वागत योग्य है जितना बेटा।')] },
    { h: L('After the birth', 'डिलीवरी के बाद'), go: ['post-recovery', 'post-mood'], items: [
      L('Her body needs about 6 weeks to recover. Share the night feeds you can (burping, changing, settling the baby), the cooking and the housework.', 'उनके शरीर को ठीक होने में लगभग 6 हफ़्ते लगते हैं। रात में जो हो सके सँभालें (डकार दिलाना, कपड़े बदलना, बच्चे को सुलाना), खाना और घर का काम भी।'),
      L('Take her to a doctor today for heavy bleeding, fever, smelly discharge, a severe headache, or pain in the chest or one leg.', 'भारी ब्लीडिंग, बुख़ार, बदबूदार स्राव, तेज़ सिरदर्द, या छाती या एक पैर में दर्द हो तो आज ही डॉक्टर के पास ले जाएँ।'),
      L('She can get pregnant again before her periods return. Talk together about a method before you start having sex again.', 'पीरियड लौटने से पहले भी वे फिर से गर्भवती हो सकती हैं। संबंध फिर शुरू करने से पहले मिलकर तरीक़े पर बात करें।')] },
    { h: L('Around menopause', 'मेनोपॉज़ के आसपास'), go: ['meno'], items: [
      L('Between about 45 and 55, periods change and stop. Hot flushes, poor sleep, low mood and joint pain are common. Be patient; this is her body, not her temper.', 'लगभग 45 से 55 साल के बीच पीरियड बदलते और बंद होते हैं। गर्मी के झोंके, ख़राब नींद, उदासी और जोड़ों का दर्द आम हैं। धीरज रखें; यह उनका शरीर है, उनका ग़ुस्सा नहीं।'),
      L('Bleeding again 12 months or more after periods have stopped always needs a check. Treatments for hot flushes exist; a gynaecologist can prescribe them.', 'पीरियड बंद होने के 12 महीने या ज़्यादा बाद फिर ब्लीडिंग हो तो जाँच हमेशा ज़रूरी है। गर्मी के झोंकों का इलाज है; स्त्री रोग विशेषज्ञ लिख सकती हैं।')] },
    { h: L('Your part in contraception', 'गर्भनिरोध में आपकी भूमिका'), go: ['contra-m-nsv', 'contra-m-condom'], items: [
      L('Condoms are free from the ASHA and at every government centre. They are the only method that also protects both of you from infections.', 'कंडोम ASHA से और हर सरकारी केंद्र पर मुफ़्त हैं। यही एक तरीक़ा है जो आप दोनों को इन्फ़ेक्शन से भी बचाता है।'),
      L('NSV (no-scalpel vasectomy) is the simplest permanent method: no cut, no stitches, and you walk home about 30 minutes later. It is free at government facilities, with money for lost wages.', 'NSV (बिना चीरे की नसबंदी) सबसे आसान स्थायी तरीक़ा है: न चीरा, न टाँके, और लगभग 30 मिनट बाद आप चलकर घर जा सकते हैं। सरकारी केंद्रों पर मुफ़्त, मज़दूरी के नुक़सान के पैसे के साथ।'),
      L('NSV does not affect your strength, your manhood, your desire or your performance in sex. It does not cause weakness or back pain.', 'NSV से आपकी ताक़त, मर्दानगी, इच्छा या संबंध की क्षमता पर कोई असर नहीं पड़ता। इससे कमज़ोरी या कमर दर्द नहीं होता।'),
      L('It does not work straight away. Use condoms until a semen test, about 3 months later, shows no sperm.', 'यह तुरंत काम नहीं करती। लगभग 3 महीने बाद semen test में शुक्राणु न दिखें, तब तक कंडोम इस्तेमाल करें।')] },
    { h: L('If a baby is not coming', 'अगर बच्चा नहीं हो रहा'), go: ['ttc-partner', 'ttc-tests'], items: [
      L('After 12 months of regular sex without contraception (6 months if she is 35 or older), both of you should be checked, not only her.', '12 महीने तक बिना गर्भनिरोध के नियमित संबंध के बाद (वे 35 या ऊपर हों तो 6 महीने), दोनों की जाँच होनी चाहिए, सिर्फ़ उनकी नहीं।'),
      L('For men, it starts with a simple semen test. It is cheap, quick and painless, and should be done early, before she goes through many tests. The doctor or lab tells you how to prepare.', 'पुरुषों के लिए शुरुआत एक आसान semen test से होती है। यह सस्ता, जल्दी और बिना दर्द का है, और जल्दी करवाना चाहिए, उनकी कई जाँचों से पहले। तैयारी कैसे करनी है, डॉक्टर या lab बताते हैं।'),
      L('A problem can be on either side, or both. It is nobody’s fault, and many causes can be treated.', 'दिक़्क़त किसी की भी तरफ़ हो सकती है, या दोनों की। इसमें किसी का दोष नहीं, और कई कारणों का इलाज होता है।')] },
    { h: L('Consent and respect', 'सहमति और सम्मान'), go: ['intimate-safety'], items: [
      L('Sex needs her yes, every time, also in marriage. If she says no, or sex hurts her, stop. Pain during sex is a reason to see a doctor, not to push.', 'संबंध के लिए हर बार उनकी हाँ ज़रूरी है, शादी में भी। वे मना करें, या संबंध से दर्द हो, तो रुकें। संबंध में दर्द डॉक्टर को दिखाने की वजह है, ज़बरदस्ती की नहीं।'),
      L('Decisions about pregnancy and contraception are made together. Never force, threaten or trick her about them.', 'गर्भ और गर्भनिरोध के फ़ैसले मिलकर होते हैं। इनके बारे में कभी ज़बरदस्ती, धमकी या धोखा न करें।'),
      L('Hitting, threats, insults, controlling her money or her movements are domestic violence. The Protection of Women from Domestic Violence Act, 2005 protects her; 181 helps any time.', 'मारना, धमकाना, अपमान करना, उनके पैसे या आने-जाने पर रोक लगाना घरेलू हिंसा है। घरेलू हिंसा से महिलाओं का संरक्षण अधिनियम, 2005 उनकी रक्षा करता है; 181 कभी भी मदद करती है।')] },
    { h: L('Signs she may need help for her mind', 'जब उन्हें मन की मदद चाहिए'), go: ['post-mood'], items: [
      L('Low or empty mood most days for 2 weeks or more; no interest in things she enjoyed; crying a lot; not sleeping even when she can; feeling worthless or guilty; panic or constant worry.', '2 हफ़्ते या ज़्यादा, लगभग रोज़ उदासी या ख़ालीपन; पसंद की चीज़ों में मन न लगना; बहुत रोना; मौक़ा होने पर भी नींद न आना; ख़ुद को बेकार या दोषी मानना; घबराहट या लगातार चिंता।'),
      L('This is common after a birth, a loss and around menopause, and it is treatable. Listen without blame, share the load, and go with her to a doctor. Tele-MANAS 14416 is free, any time, for her and for you.', 'यह डिलीवरी, गर्भ के नुक़सान और मेनोपॉज़ के आसपास आम है, और इसका इलाज है। बिना दोष दिए सुनें, बोझ बाँटें, और उनके साथ डॉक्टर के पास जाएँ। Tele-MANAS 14416 मुफ़्त है, कभी भी, उनके लिए और आपके लिए भी।'),
      L('If she talks about harming herself or the baby: stay with her and call 14416 or 112 now.', 'अगर वे ख़ुद को या बच्चे को नुक़सान पहुँचाने की बात करें: उनके साथ रहें और अभी 14416 या 112 पर कॉल करें।')] }
  ];

  function renderPartner(v) {
    v.innerHTML = S.backRow(t('access_partner'), 'care', false) +
      '<div class="card soft access-hand"><div class="eyebrow">' + esc(t('access_partner_eyebrow')) + '</div>' + P(L('Show this page to your husband or partner, or read it together. It is written for him. Switch the language at the top: EN or हिंदी.', 'यह पन्ना अपने पति या साथी को दिखाएँ, या साथ में पढ़ें। यह उनके लिए लिखा है। भाषा ऊपर बदलें: EN या हिंदी।'), '', 'color:var(--fg)') + '</div>' +
      '<p class="lead">' + E(L('Her health is a family matter. Small things you do every day make the biggest difference.', 'उनकी सेहत परिवार की ज़िम्मेदारी है। रोज़ की छोटी-छोटी बातें सबसे बड़ा फ़र्क़ लाती हैं।')) + '</p>' +
      PARTNER.map((s) => '<div class="card"><h3>' + E(s.h) + '</h3>' + ul(s.items) + goBtns(s.go) + '</div>').join('') +
      '<h2>' + esc(t('helplines')) + '</h2><div class="list">' + copyRow('112', L('Emergency', 'आपातकाल')) + copyRow('102', L('Ambulance in pregnancy and for babies', 'गर्भ और बच्चों के लिए एम्बुलेंस')) + copyRow('14416', L('Tele-MANAS, mental health, free', 'Tele-MANAS, मानसिक स्वास्थ्य, मुफ़्त')) + copyRow('181', L('Women Helpline', 'महिला हेल्पलाइन')) + '</div>' +
      quraCard(t('access_partner')) + srcList(['cho', 'pmsma', 'jssk', 'osc']);
    S.wire(v); wireCopy(v);
  }

  /* =====================================================================
     4. Today for you (gated)
     ===================================================================== */
  function feedCards() {
    const st = S.state; const sit = st.situation || {}; const td = S.today(); const out = [];
    const add = (c) => { if (out.length < 5 && !out.some((x) => x.go === c.go)) out.push(c); };
    const app = S.canSave();
    if (app) {
      const due = S.reminders.upcoming(0);
      if (due.length) add({ why: L('From your reminders', 'आपके रिमाइंडर से'), title: L('Due today: ' + S.reminders.text(due[0].r), 'आज: ' + S.reminders.text(due[0].r)), text: L(due.length > 1 ? 'And ' + (due.length - 1) + ' more due today.' : 'Tick it off in your reminders when it is done.', due.length > 1 ? 'और ' + (due.length - 1) + ' आज के।' : 'हो जाए तो रिमाइंडर में टिक करें।'), go: 'tools-reminders', btn: GUIDE['tools-reminders'] });
      if (sit.pregnant) {
        const pinfo = S.preg && S.preg.info(); const wk = pinfo ? pinfo.weeks : null;
        if (wk != null && wk >= 4 && wk <= 42) {
          const tri = wk < 14 ? 0 : (wk < 28 ? 1 : 2);
          const txt = [L('Folic acid every day, and register your pregnancy for the MCP card before 12 weeks. Nausea is common; small, frequent meals help.', 'रोज़ फ़ोलिक एसिड, और 12 हफ़्ते से पहले गर्भ का पंजीकरण करवाकर MCP card लें। जी मिचलाना आम है; थोड़ा-थोड़ा, बार-बार खाना मदद करता है।'),
            L('Iron and calcium tablets every day (not together), the Td vaccine, and the anomaly scan at 18–20 weeks. Many women first feel movements between 16 and 24 weeks.', 'रोज़ आयरन और कैल्शियम की गोलियाँ (एक साथ नहीं), Td टीका, और 18–20 हफ़्ते पर anomaly scan। कई महिलाओं को पहली हलचल 16 से 24 हफ़्ते के बीच महसूस होती है।'),
            L('Know your baby’s usual pattern of movements; fewer than usual means a check the same day. Pack your bag and plan transport; the 102 ambulance is free.', 'बच्चे की हलचल का रोज़ का पैटर्न पहचानें; सामान्य से कम हो तो उसी दिन जाँच। अपना बैग तैयार रखें और आने-जाने की योजना बनाएँ; 102 एम्बुलेंस मुफ़्त है।')][tri];
          add({ why: L('Because you set: pregnant', 'क्योंकि आपने चुना: गर्भवती'), title: L('About week ' + wk + ': what to do now', 'लगभग ' + wk + 'वाँ हफ़्ता: अभी क्या करें'), text: txt, go: 'preg-w-' + wk, btn: L('Week ' + wk, 'हफ़्ता ' + wk) });
          if (wk >= 13) {
            const nine = td.getDate() <= 9 ? new Date(td.getFullYear(), td.getMonth(), 9) : new Date(td.getFullYear(), td.getMonth() + 1, 9);
            const when = S.fmtD(nine, { day: 'numeric', month: 'short' });
            add({ why: L('Months 4 to 9 of pregnancy', 'गर्भ के 4 से 9 महीने'), title: L('Free doctor check-up on ' + when, when + ' को डॉक्टर से मुफ़्त जाँच'), text: L('PMSMA: a full check-up by a doctor on the 9th of every month at government health centres. Take your MCP card.', 'PMSMA: हर महीने की 9 तारीख़ को सरकारी केंद्रों पर डॉक्टर से पूरी जाँच। अपना MCP card साथ ले जाएँ।'), go: 'access-schemes-preg', btn: GUIDE['access-schemes-preg'] });
          }
        }
      }
      if (sit.deliveredOn) {
        const d = S.diffDays(S.fromISO(sit.deliveredOn), td);
        if (d >= 0 && d <= 365) {
          if (d <= 42) add({ why: L('Day ' + d + ' after the birth', 'डिलीवरी के बाद दिन ' + d), title: L('Recovery: what is normal, what is not', 'ठीक होना: क्या सामान्य, क्या नहीं'), text: L('Rest, eat well and keep taking iron. See a doctor today for heavy bleeding, fever, smelly discharge, a severe headache, or pain in the chest or one leg.', 'आराम करें, अच्छा खाएँ और आयरन लेती रहें। भारी ब्लीडिंग, बुख़ार, बदबूदार स्राव, तेज़ सिरदर्द, या छाती या एक पैर में दर्द हो तो आज ही डॉक्टर को दिखाएँ।'), go: 'post-recovery', btn: GUIDE['post-recovery'] });
          if (d <= 120) add({ why: L('In the months after a birth', 'डिलीवरी के बाद के महीनों में'), title: L('How is your mood?', 'आपका मन कैसा है?'), text: L('Weepy days in the first 2 weeks are common and pass. Low mood that lasts longer is common too, and treatable. Tele-MANAS 14416 is free, any time.', 'पहले 2 हफ़्तों में रोना आना आम है और ठीक हो जाता है। उससे लंबी उदासी भी आम है, और उसका इलाज है। Tele-MANAS 14416 मुफ़्त है, कभी भी।'), go: 'post-mood', btn: GUIDE['post-mood'] });
          if (d >= 21 && d <= 180) add({ why: L('Before 6 weeks after the birth', 'डिलीवरी के 6 हफ़्ते से पहले'), title: L('Pregnancy can happen before periods return', 'पीरियड लौटने से पहले भी गर्भ ठहर सकता है'), text: L('Choose a method by 6 weeks after the birth. Many are free and safe while breastfeeding.', 'डिलीवरी के 6 हफ़्ते तक कोई तरीक़ा चुन लें। कई तरीक़े मुफ़्त हैं और दूध पिलाते समय सुरक्षित।'), go: 'post-contra', btn: GUIDE['post-contra'] });
        }
      }
      if (!sit.pregnant && !S.cycle.countsOff() && !sit.stopped) {
        const ls = S.cycle.lastStart();
        if (!ls) add({ why: L('Your diary', 'आपकी डायरी'), title: L('Log your last period', 'अपना पिछला पीरियड दर्ज करें'), text: L('A few months of start dates help your doctor more than any single day. One tap on Home.', 'कुछ महीनों की शुरुआत की तारीख़ें किसी एक दिन से ज़्यादा डॉक्टर की मदद करती हैं। होम पर एक टैप।'), go: 'diary', btn: GUIDE['diary'] });
        else {
          const cd = S.cycle.cycleDay(); const bd = S.cycle.bleedingDays()[S.toISO(td)];
          if (bd && bd !== 'spot') add({ why: L('Period day ' + cd + ' in your diary', 'आपकी डायरी में पीरियड का दिन ' + cd), title: L('Cramps and flow', 'ऐंठन और ब्लीडिंग'), text: L('Heat, rest and gentle movement ease cramps. Soaking a pad every 1–2 hours is a reason to see a doctor this week.', 'गरमी, आराम और हल्की हलचल से ऐंठन में आराम मिलता है। हर 1–2 घंटे में pad भीगे तो इसी हफ़्ते डॉक्टर को दिखाएँ।'), go: 'periods-pain', btn: GUIDE['periods-pain'] });
          else if (cd > 35) add({ why: L('Cycle day ' + cd + ' in your diary', 'आपकी डायरी में चक्र का दिन ' + cd), title: L('More than 35 days since your period started', 'पीरियड शुरू हुए 35 दिन से ज़्यादा'), text: L('If you could be pregnant, a home test is the first step. Free Nishchay kits come from your ASHA.', 'अगर गर्भ की संभावना है, तो पहले घर पर test करें। मुफ़्त Nishchay किट ASHA से मिलती है।'), go: 'pregtest-when', btn: GUIDE['pregtest-when'] });
          else add({ why: L('Cycle day ' + cd + ' in your diary', 'आपकी डायरी में चक्र का दिन ' + cd), title: L('Your cycle, in plain words', 'आपका चक्र, आसान भाषा में'), text: L('A usual gap between periods is 21–35 days, and it can change a little each month. Log the start and end; the pattern helps more than any single date.', 'पीरियड के बीच आम अंतर 21–35 दिन होता है, और हर महीने थोड़ा बदल सकता है। शुरुआत और ख़त्म होना दर्ज करें; पैटर्न किसी एक तारीख़ से ज़्यादा मदद करता है।'), go: 'periods', btn: GUIDE['periods'] });
        }
      }
    }
    const m = td.getMonth();
    if (m >= 6 && m <= 10) add({ why: L('Season: July to November', 'मौसम: जुलाई से नवंबर'), title: L('Dengue season', 'डेंगू का मौसम'), text: L('Empty standing water around the house every week and sleep under a net. For fever, see a doctor; doctors use paracetamol and advise against aspirin and ibuprofen. Go to hospital now with severe belly pain, repeated vomiting, or bleeding from the nose or gums.' + (sit.pregnant ? ' In pregnancy, see a doctor the same day for any fever.' : ''), 'घर के आसपास जमा पानी हर हफ़्ते ख़ाली करें और मच्छरदानी में सोएँ। बुख़ार हो तो डॉक्टर को दिखाएँ; डॉक्टर paracetamol देते हैं और aspirin या ibuprofen से मना करते हैं। तेज़ पेट दर्द, बार-बार उल्टी, या नाक या मसूड़ों से ख़ून आए तो अभी अस्पताल जाएँ।' + (sit.pregnant ? ' गर्भ में किसी भी बुख़ार पर उसी दिन डॉक्टर को दिखाएँ।' : '')), go: 'access-symptoms', btn: GUIDE['access-symptoms'] });
    else if (m >= 2 && m <= 5) add({ why: L('Season: March to June', 'मौसम: मार्च से जून'), title: L('Heat season', 'गर्मी और लू का मौसम'), text: L('Drink water often, stay in the shade from 12 to 3 in the afternoon, and wear loose cotton. Pregnant women, babies and older people get heat illness faster. Confusion, fainting or a very hot, dry body: call 108 or 112.', 'बार-बार पानी पिएँ, दोपहर 12 से 3 बजे तक छाँव में रहें, और ढीले सूती कपड़े पहनें। गर्भवती महिलाएँ, बच्चे और बुज़ुर्ग जल्दी बीमार पड़ते हैं। उलझन, बेहोशी या बहुत गरम, सूखा शरीर: 108 या 112 पर कॉल करें।'), go: 'help', btn: GUIDE['help'] });
    if (app) {
      const age = S.cycle.ageYears();
      if (age != null && age >= 30 && age <= 65) add({ why: L('Because you are ' + age, 'क्योंकि आपकी उम्र ' + age + ' है'), title: L('Free check-ups at your age', 'आपकी उम्र में मुफ़्त जाँचें'), text: L('From 30: BP and sugar every year, and cervical, breast and mouth checks every 5 years, free at your Ayushman Arogya Mandir.', '30 से: हर साल BP और शुगर, और हर 5 साल में बच्चेदानी के मुँह, स्तन और मुँह की जाँच, आयुष्मान आरोग्य मंदिर पर मुफ़्त।'), go: 'screen-mine', btn: GUIDE['screen-mine'] });
      else if (age != null && age < 30) add({ why: L('Because you are ' + age, 'क्योंकि आपकी उम्र ' + age + ' है'), title: L('Tired, or heavy periods?', 'थकान, या भारी पीरियड?'), text: L('Anaemia is common in young Indian women. The Hb test is free at government centres, and so are iron tablets.', 'भारत की युवा महिलाओं में खून की कमी आम है। Hb जाँच सरकारी केंद्रों पर मुफ़्त है, और आयरन की गोलियाँ भी।'), go: 'cond-anaemia', btn: GUIDE['cond-anaemia'] });
      if (age != null && age >= 45 && !sit.pregnant) add({ why: L('Because you are ' + age, 'क्योंकि आपकी उम्र ' + age + ' है'), title: L('Periods changing?', 'पीरियड बदल रहे हैं?'), text: L('Between about 45 and 55 periods change, then stop. Hot flushes and poor sleep are common, and treatable.', 'लगभग 45 से 55 के बीच पीरियड बदलते हैं, फिर बंद होते हैं। गर्मी के झोंके और ख़राब नींद आम हैं, और इनका इलाज है।'), go: 'meno', btn: GUIDE['meno'] });
    }
    add({ why: L('For every woman', 'हर महिला के लिए'), title: L('Scheme money you may be missing', 'योजना का पैसा जो शायद छूट रहा है'), text: L('Five quick questions show which government schemes may fit you, with the papers you need.', 'पाँच छोटे सवाल बताते हैं कि कौन सी सरकारी योजनाएँ आप पर लागू हो सकती हैं, ज़रूरी काग़ज़ों के साथ।'), go: 'access-schemes', btn: GUIDE['access-schemes'] });
    add({ why: L('For every woman', 'हर महिला के लिए'), title: L('Free care near you', 'आपके पास मुफ़्त इलाज'), text: L('From your ASHA to the district hospital: what each one gives free, and the official way to find it.', 'ASHA से ज़िला अस्पताल तक: हर जगह क्या मुफ़्त है, और उसे खोजने का सरकारी तरीक़ा।'), go: 'access-care', btn: GUIDE['access-care'] });
    return out;
  }

  function renderFeed(v) {
    const cards = feedCards();
    v.innerHTML = S.backRow(t('access_feed'), 'home', true) +
      P(L('A few short cards picked for today from what you set yourself: diary dates, pregnancy or birth date, age, reminders and the month. Simple rules, the same for everyone. Not a diagnosis.', 'आज के लिए कुछ छोटे कार्ड, उन बातों से चुने गए जो आपने ख़ुद दर्ज कीं: डायरी की तारीख़ें, गर्भ या डिलीवरी की तारीख़, उम्र, रिमाइंडर और महीना। आसान नियम, सबके लिए एक जैसे। diagnosis नहीं।'), 'small') +
      (S.canSave() ? '' : S.needDiary()) +
      cards.map((c) => '<div class="card access-fc"><div class="eyebrow">' + E(c.why) + '</div><h3>' + E(c.title) + '</h3>' + P(c.text, 'small', 'color:var(--fg)') + '<button type="button" class="btn sm access-inline" data-go="' + esc(c.go) + '">' + E(c.btn) + ' ' + I.chev.replace('<svg', '<svg style="width:14px;height:14px"') + '</button></div>').join('') +
      '<p class="footnote">' + esc(t('cadence')) + '</p>' + srcList(['pmsma', 'dengue', 'heat', 'aam']);
    S.wire(v);
  }

  /* =====================================================================
     5. Doctor videos (planned)
     ===================================================================== */
  const ROLE = { megha: L('Dr. Megha, Qura', 'Dr. Megha, Qura'), qdoc: L('A Qura doctor (BAMS)', 'Qura की एक डॉक्टर (BAMS)'), coord: L('A Qura care coordinator', 'Qura की एक care coordinator') };
  const VIDEOS = [
    { k: 'periods', mins: 6, who: 'megha', icon: 'drop', go: 'periods', title: L('Your period: what is normal and what is not', 'आपका पीरियड: क्या सामान्य है, क्या नहीं'), text: [
      L('A usual gap between periods is 21–35 days, and bleeding lasts up to 8 days.', 'पीरियड के बीच आम अंतर 21–35 दिन होता है, और ब्लीडिंग 8 दिन तक चलती है।'),
      L('Soaking a pad every 1–2 hours, clots the size of a ₹10 coin, or bleeding through clothes needs a doctor this week.', 'हर 1–2 घंटे में pad भीगना, ₹10 के सिक्के जितने थक्के, या कपड़ों तक ब्लीडिंग: इसी हफ़्ते डॉक्टर को दिखाएँ।'),
      L('Pain that stops your day is not something to put up with. Keep a diary of dates and pain; it helps the doctor more than memory.', 'जो दर्द दिन रोक दे, उसे सहते न रहें। तारीख़ों और दर्द की डायरी रखें; यह याद से ज़्यादा डॉक्टर की मदद करती है।'),
      L('No period for 90 days or more, and not pregnant or breastfeeding: take a pregnancy test first, then see a doctor.', '90 दिन या ज़्यादा पीरियड नहीं, और गर्भ या स्तनपान नहीं: पहले गर्भ test, फिर डॉक्टर।')] },
    { k: 'pmos', mins: 8, who: 'megha', icon: 'leaf', go: 'cond-labs', title: L('PMOS (PCOS): first steps after the diagnosis', 'PMOS (PCOS): diagnosis के बाद पहले क़दम'), text: [
      L('PMOS is common and long-term, and it can be managed. It is not your fault.', 'PMOS आम और लंबे समय की स्थिति है, और इसे सँभाला जा सकता है। यह आपकी ग़लती नहीं।'),
      L('Ask for a sugar test and a lipid test; PMOS raises the chance of diabetes.', 'शुगर और lipid की जाँच माँगें; PMOS से diabetes का ख़तरा बढ़ता है।'),
      L('Regular meals, daily movement and sleep help cycles and skin. Even a small weight loss, if you are overweight, can bring periods back.', 'समय पर खाना, रोज़ की हलचल और नींद से चक्र और त्वचा में मदद मिलती है। वज़न ज़्यादा हो तो थोड़ा कम होने से भी पीरियड लौट सकते हैं।'),
      L('Going 90 days or more without a period needs a doctor; regular periods protect the womb lining. Hormone medicines are prescribed by a gynaecologist; Qura refers.', '90 दिन या ज़्यादा पीरियड न आएँ तो डॉक्टर को दिखाएँ; नियमित पीरियड बच्चेदानी की परत को सुरक्षित रखते हैं। हॉर्मोन की दवाएँ स्त्री रोग विशेषज्ञ लिखती हैं; Qura रेफ़र करता है।')] },
    { k: 'schemes', mins: 7, who: 'coord', icon: 'file', go: 'access-schemes-preg', title: L('Free care in pregnancy: what the government gives you', 'गर्भ में मुफ़्त देखभाल: सरकार क्या देती है'), text: [
      L('JSSK makes the delivery, a C-section, medicines, tests, blood, food and transport free at government hospitals.', 'JSSK से सरकारी अस्पतालों में डिलीवरी, C-section, दवा, जाँच, खून, खाना और आना-जाना मुफ़्त है।'),
      L('PMMVY gives ₹5,000 for the first child and ₹6,000 if the second child is a girl, to eligible women.', 'PMMVY में पात्र महिलाओं को पहले बच्चे पर ₹5,000 और दूसरा बच्चा बेटी हो तो ₹6,000 मिलते हैं।'),
      L('JSY gives cash after a birth in a government facility; the amount depends on your state and whether you live in a village or a town.', 'JSY में सरकारी केंद्र में डिलीवरी के बाद नक़द मिलता है; रक़म आपके राज्य और गाँव या शहर पर निर्भर है।'),
      L('On the 9th of every month, a doctor checks pregnant women free (PMSMA). Your ASHA helps with every form.', 'हर महीने की 9 तारीख़ को डॉक्टर गर्भवती महिलाओं की मुफ़्त जाँच करते हैं (PMSMA)। हर फ़ॉर्म में ASHA मदद करती हैं।')] },
    { k: 'danger', mins: 5, who: 'qdoc', icon: 'help', go: 'preg-symptoms', title: L('Danger signs in pregnancy: when to go now', 'गर्भ में ख़तरे के लक्षण: कब तुरंत जाएँ'), text: [
      L('Call 112 or 102 now for bleeding, fits, a severe headache with blurred vision, fluid leaking, or the baby moving less.', 'ब्लीडिंग, दौरे, धुंधली नज़र के साथ तेज़ सिरदर्द, पानी निकलना, या बच्चे की हलचल कम हो तो अभी 112 या 102 पर कॉल करें।'),
      L('Regular, painful tightening before 37 weeks: go to hospital now.', '37 हफ़्ते से पहले नियमित और दर्द वाला कसाव: अभी अस्पताल जाएँ।'),
      L('Fever, vomiting that will not stop, or burning when you pee: see a doctor today.', 'बुख़ार, न रुकने वाली उल्टी, या पेशाब में जलन: आज ही डॉक्टर को दिखाएँ।'),
      L('Keep the 102 number, your MCP card and some money ready from the 7th month.', '7वें महीने से 102 नंबर, MCP card और कुछ पैसे तैयार रखें।')] },
    { k: 'after', mins: 7, who: 'qdoc', icon: 'baby', go: 'post-recovery', title: L('The first 6 weeks after birth', 'डिलीवरी के बाद पहले 6 हफ़्ते'), text: [
      L('Bleeding slowly gets lighter over 4–6 weeks. Soaking a pad an hour, or large clots, needs a hospital now.', 'ब्लीडिंग 4–6 हफ़्ते में धीरे-धीरे कम होती है। एक घंटे में pad भीगना या बड़े थक्के: अभी अस्पताल।'),
      L('Fever, smelly discharge, a painful red wound, or pain in the chest or one leg: see a doctor today.', 'बुख़ार, बदबूदार स्राव, दर्द वाला लाल घाव, या छाती या एक पैर में दर्द: आज ही डॉक्टर को दिखाएँ।'),
      L('Keep taking iron for 180 days, eat well and rest when the baby sleeps.', '180 दिन तक आयरन लेती रहें, अच्छा खाएँ और बच्चा सोए तो आराम करें।'),
      L('You can get pregnant before periods return; choose a method by 6 weeks.', 'पीरियड लौटने से पहले भी गर्भ ठहर सकता है; 6 हफ़्ते तक कोई तरीक़ा चुन लें।')] },
    { k: 'contra', mins: 8, who: 'megha', icon: 'pill', go: 'contra-free', title: L('Contraception: all the free methods', 'गर्भनिरोध: सारे मुफ़्त तरीक़े'), text: [
      L('Condoms, Mala-N, Chhaya and the emergency pill come free from your ASHA.', 'कंडोम, Mala-N, छाया और इमरजेंसी गोली ASHA से मुफ़्त मिलती हैं।'),
      L('Copper-T, the Antara injection, tubectomy and NSV are free at government facilities.', 'Copper-T, अंतरा इंजेक्शन, महिला नसबंदी और NSV सरकारी केंद्रों पर मुफ़्त हैं।'),
      L('The emergency pill works best within 72 hours of sex; sooner is better.', 'इमरजेंसी गोली संबंध के 72 घंटे के अंदर सबसे अच्छा काम करती है; जितनी जल्दी, उतना अच्छा।'),
      L('No calendar method or “safe days” is a reliable way to avoid pregnancy. Pills and devices are prescribed after a check by a doctor, nurse or ANM.', 'कोई calendar तरीक़ा या “safe days” गर्भ रोकने का भरोसेमंद तरीक़ा नहीं। गोलियाँ और साधन डॉक्टर, नर्स या ANM की जाँच के बाद मिलते हैं।')] },
    { k: 'discharge', mins: 5, who: 'qdoc', icon: 'lock', go: 'intimate-check', title: L('White discharge: normal or infection?', 'सफ़ेद पानी: सामान्य या इन्फ़ेक्शन?'), text: [
      L('Clear or white discharge that changes through the month is normal and keeps the vagina healthy.', 'साफ़ या सफ़ेद पानी जो महीने भर बदलता रहे, सामान्य है और योनि को स्वस्थ रखता है।'),
      L('A change in colour or smell, itching, or burning when you pee needs a check this week.', 'रंग या गंध बदले, खुजली हो, या पेशाब में जलन हो तो इसी हफ़्ते जाँच कराएँ।'),
      L('Do not wash inside the vagina or use scented products; plain water outside is enough.', 'योनि के अंदर न धोएँ और ख़ुशबू वाली चीज़ें न लगाएँ; बाहर सादा पानी काफ़ी है।'),
      L('Suraksha clinics test and treat infections free and in private, and can treat your partner too.', 'सुरक्षा क्लिनिक इन्फ़ेक्शन की जाँच और इलाज मुफ़्त और गोपनीय करते हैं, और साथी का इलाज भी।')] },
    { k: 'meno', mins: 8, who: 'megha', icon: 'moon', go: 'meno', title: L('Menopause: hot flushes, sleep and bones', 'मेनोपॉज़: गर्मी के झोंके, नींद और हड्डियाँ'), text: [
      L('Periods usually stop between 45 and 55. Changes can start years before.', 'पीरियड आम तौर पर 45 से 55 के बीच बंद होते हैं। बदलाव कई साल पहले शुरू हो सकते हैं।'),
      L('Hot flushes that wake you at night have good treatments; hormone therapy is prescribed by a gynaecologist, and Qura refers.', 'रात में जगा देने वाले गर्मी के झोंकों का अच्छा इलाज है; हॉर्मोन थेरेपी स्त्री रोग विशेषज्ञ लिखती हैं, और Qura रेफ़र करता है।'),
      L('Walking, calcium-rich food and sunlight help keep bones strong.', 'चलना, कैल्शियम वाला खाना और धूप हड्डियों को मज़बूत रखने में मदद करते हैं।'),
      L('Any bleeding 12 months or more after your last period always needs a check.', 'आख़िरी पीरियड के 12 महीने या ज़्यादा बाद कोई भी ब्लीडिंग हो तो जाँच हमेशा ज़रूरी है।')] },
    { k: 'mood', mins: 6, who: 'qdoc', icon: 'heart', go: 'post-mood', title: L('Low mood after the baby: you are not alone', 'बच्चे के बाद उदासी: आप अकेली नहीं हैं'), text: [
      L('Feeling weepy in the first 2 weeks is common and passes.', 'पहले 2 हफ़्तों में रोना आना आम है और ठीक हो जाता है।'),
      L('Low mood most days for 2 weeks or more is common too, and it is treatable. It does not make you a bad mother.', '2 हफ़्ते या ज़्यादा लगभग रोज़ उदासी भी आम है, और इसका इलाज है। इससे आप बुरी माँ नहीं बनतीं।'),
      L('Tell someone you trust and see a doctor. Tele-MANAS 14416 is free, any time.', 'किसी भरोसे वाले को बताएँ और डॉक्टर को दिखाएँ। Tele-MANAS 14416 मुफ़्त है, कभी भी।'),
      L('Thoughts of harming yourself or the baby: call 14416 or 112 now.', 'ख़ुद को या बच्चे को नुक़सान के विचार: अभी 14416 या 112 पर कॉल करें।')] },
    { k: 'men', mins: 6, who: 'megha', icon: 'users', go: 'access-partner', title: L('For husbands: how to support her', 'पतियों के लिए: उनका साथ कैसे दें'), text: [
      L('Go with her to check-ups, share the work, and learn the danger signs in pregnancy and after birth.', 'जाँचों में साथ जाएँ, काम बाँटें, और गर्भ और डिलीवरी के बाद के ख़तरे के लक्षण सीखें।'),
      L('Condoms and NSV are your part in contraception. NSV does not affect strength or sex.', 'कंडोम और NSV गर्भनिरोध में आपकी भूमिका हैं। NSV से ताक़त या संबंध पर असर नहीं पड़ता।'),
      L('If a baby is not coming, a semen test is a simple first step for you.', 'अगर बच्चा नहीं हो रहा, तो आपके लिए semen test आसान पहला क़दम है।'),
      L('Her yes matters every time. Watch for signs that she needs help for her mind.', 'उनकी हाँ हर बार मायने रखती है। ध्यान दें कि कहीं उन्हें मन की मदद तो नहीं चाहिए।')] }
  ];

  function renderVideos(v) {
    v.innerHTML = S.backRow(t('access_videos'), 'care', false) +
      P(L('Short talks we plan to record in Hindi and English. Until they are ready, tap any card to read a short text version.', 'छोटी बातचीत जो हम हिंदी और English में रिकॉर्ड करने वाले हैं। तब तक किसी भी कार्ड पर टैप करके छोटा लिखित रूप पढ़ें।'), 'small') +
      '<div class="list">' + VIDEOS.map((x) => '<button type="button" class="item access-vid" data-vid="' + x.k + '"><span class="ico-sm">' + S.icon(x.icon) + '</span><span class="body"><strong>' + E(x.title) + '</strong><span>' + esc(S.tf('access_mins', { n: x.mins })) + ' · ' + E(ROLE[x.who]) + '</span><span class="pill muted access-planned">' + esc(t('access_planned')) + '</span></span></button>').join('') + '</div>' +
      '<p class="footnote">' + esc(t('access_vid_note')) + '</p>' + quraCard(t('access_videos'));
    S.wire(v);
    v.querySelectorAll('[data-vid]').forEach((b) => b.addEventListener('click', () => {
      const x = VIDEOS.find((y) => y.k === b.dataset.vid); if (!x) return;
      S.sheet('<div class="row wrap"><span class="pill muted">' + esc(t('access_planned')) + '</span><span class="small">' + esc(S.tf('access_mins', { n: x.mins })) + ' · ' + E(ROLE[x.who]) + '</span></div><h2>' + E(x.title) + '</h2><div class="eyebrow">' + esc(t('access_text_v')) + '</div><ul class="access-vt">' + x.text.map((p) => '<li>' + E(p) + '</li>').join('') + '</ul>' +
        '<div class="grid2"><button type="button" class="btn" data-go="' + esc(x.go) + '">' + esc(t('access_read_guide')) + '</button><button type="button" class="btn primary" id="access-vclose">' + esc(t('access_close')) + '</button></div>', (sh) => {
        sh.querySelectorAll('[data-go]').forEach((g) => g.addEventListener('click', () => S.closeSheet()));
        const c = sh.querySelector('#access-vclose'); if (c) c.addEventListener('click', () => S.closeSheet());
      });
    }));
  }

  /* =====================================================================
     6. Symptom guide (gated)
     ===================================================================== */
  const LV = {
    now: { cls: 'urgent', label: L('Call 112 now', 'अभी 112 पर कॉल करें'), where: L('Call 112, or 108 or 102 for a free ambulance, and go to the nearest district hospital or the hospital where you are registered. Do not wait to see if it settles.', '112 पर कॉल करें, या मुफ़्त एम्बुलेंस के लिए 108 या 102, और नज़दीकी ज़िला अस्पताल या जहाँ पंजीकरण है वहाँ जाएँ। ठीक होने का इंतज़ार न करें।') },
    today: { cls: 'today', label: L('See a doctor today', 'आज ही डॉक्टर को दिखाएँ'), where: L('Today: the emergency or OPD of your CHC or district hospital, free. In pregnancy, the hospital where you are registered; 102 is a free ambulance.', 'आज: अपने CHC या ज़िला अस्पताल की emergency या OPD, मुफ़्त। गर्भ में, जहाँ पंजीकरण है वह अस्पताल; 102 मुफ़्त एम्बुलेंस है।') },
    week: { cls: 'week', label: L('See a doctor this week', 'इसी हफ़्ते डॉक्टर को दिखाएँ'), where: L('This week: your Ayushman Arogya Mandir or PHC first, free. They refer you to the CHC or district hospital if needed. Sooner if it gets worse or a fever starts.', 'इसी हफ़्ते: पहले आयुष्मान आरोग्य मंदिर या PHC, मुफ़्त। ज़रूरत हो तो वे CHC या ज़िला अस्पताल भेजते हैं। बिगड़े या बुख़ार आए तो पहले।') },
    weeks2: { cls: 'week', label: L('See a doctor within 2 weeks', '2 हफ़्ते के अंदर डॉक्टर को दिखाएँ'), where: L('Within 2 weeks: your PHC or the gynaecology OPD at the district hospital, free. Take your diary.', '2 हफ़्ते के अंदर: अपना PHC या ज़िला अस्पताल की स्त्री रोग OPD, मुफ़्त। अपनी डायरी साथ ले जाएँ।') },
    routine: { cls: 'routine', label: L('Routine: at your next check-up', 'सामान्य: अगली जाँच में'), where: L('At your next visit: Ayushman Arogya Mandir, your antenatal check-up or your doctor. Sooner if it gets worse.', 'अगली मुलाक़ात में: आयुष्मान आरोग्य मंदिर, ANC जाँच या आपकी डॉक्टर। बिगड़े तो पहले।') }
  };
  const LV_ORDER = ['now', 'today', 'week', 'weeks2', 'routine'];
  const K = (key) => ({ key: key }); /* use the core safety-guide wording */
  const AREAS = [
    { k: 'bleed', name: L('Periods and bleeding', 'पीरियड और ब्लीडिंग'), items: [
      { lv: 'now', s: K('s1b'), often: L('Often a pregnancy problem (miscarriage or ectopic pregnancy), fibroids or a hormone imbalance. Losing this much blood needs care now, whatever the cause.', 'अक्सर गर्भ की परेशानी (गर्भपात या बच्चेदानी के बाहर गर्भ), फ़ाइब्रॉइड या हॉर्मोन का असंतुलन। इतना खून जाना, वजह जो भी हो, अभी इलाज माँगता है।'), go: ['cond-fibroids', 'loss-types'] },
      { lv: 'today', s: K('s2a'), often: L('Often fibroids, a polyp, hormone changes (common in the teens and the 40s) or a bleeding problem. Iron levels can fall fast.', 'अक्सर फ़ाइब्रॉइड, पॉलिप, हॉर्मोन के बदलाव (किशोर उम्र और 40 के बाद आम) या खून बहने की कोई परेशानी। आयरन जल्दी घट सकता है।'), go: ['cond-fibroids', 'cond-anaemia'] },
      { lv: 'week', s: K('s4a'), often: L('Often fibroids, adenomyosis, hormone changes or thyroid. Common and treatable.', 'अक्सर फ़ाइब्रॉइड, adenomyosis, हॉर्मोन के बदलाव या थायरॉइड। आम है और इलाज होता है।'), go: ['periods', 'cond-fibroids'] },
      { lv: 'week', s: K('s4b'), often: L('Often endometriosis, adenomyosis or fibroids. Pain that stops your day is not something to put up with.', 'अक्सर endometriosis, adenomyosis या फ़ाइब्रॉइड। जो दर्द दिन रोक दे, उसे सहते न रहें।'), go: ['periods-pain', 'cond-endo'] },
      { lv: 'weeks2', s: L('Bleeding between periods or after sex', 'दो पीरियड के बीच या संबंध के बाद ब्लीडिंग'), often: L('Often an infection, a polyp, a harmless change on the cervix, or hormone pills. It still needs a check of the cervix.', 'अक्सर इन्फ़ेक्शन, पॉलिप, बच्चेदानी के मुँह पर कोई मामूली बदलाव, या हॉर्मोन की गोलियाँ। फिर भी बच्चेदानी के मुँह की जाँच ज़रूरी है।'), go: ['screen-cervix'] },
      { lv: 'weeks2', s: K('s3a'), often: L('Often a thin womb lining or a polyp. A check rules out cancer of the womb.', 'अक्सर बच्चेदानी की पतली परत या पॉलिप। जाँच से बच्चेदानी के कैंसर की आशंका दूर होती है।'), go: ['meno', 'screen-signs'] },
      { lv: 'weeks2', s: K('s3b'), often: L('Often pregnancy, breastfeeding, PMOS, thyroid, stress, weight change or early menopause.', 'अक्सर गर्भ, स्तनपान, PMOS, थायरॉइड, तनाव, वज़न में बदलाव या जल्दी मेनोपॉज़।'), go: ['pregtest-when', 'cond-labs'] },
      { lv: 'routine', s: L('Period a week or more late, and you could be pregnant', 'पीरियड एक हफ़्ता या ज़्यादा देर से, और गर्भ की संभावना है'), often: L('A home pregnancy test is the first step. Free Nishchay test kits come from your ASHA.', 'पहला क़दम घर पर गर्भ test है। मुफ़्त Nishchay किट ASHA से मिलती है।'), go: ['pregtest-when'] }] },
    { k: 'preg', name: L('Pregnancy', 'गर्भ'), items: [
      { lv: 'now', s: K('s1a'), often: L('This can be an ectopic pregnancy (outside the womb), which can bleed inside. It needs a hospital now.', 'यह बच्चेदानी के बाहर का गर्भ हो सकता है, जिसमें अंदर ख़ून बह सकता है। अभी अस्पताल ज़रूरी है।'), go: ['loss-types'] },
      { lv: 'now', s: K('s1c'), often: L('These can be signs of a problem with the placenta, high BP of pregnancy (pre-eclampsia), early labour, or the baby needing help.', 'ये आँवल (placenta) की परेशानी, गर्भ का हाई BP (pre-eclampsia), समय से पहले प्रसव, या बच्चे को मदद की ज़रूरत के लक्षण हो सकते हैं।'), go: ['preg-symptoms', 'pregtools-kicks'] },
      { lv: 'now', s: L('Regular, painful tightening before 37 weeks', '37 हफ़्ते से पहले नियमित, दर्द वाला कसाव'), often: L('This can be early (preterm) labour. Go to hospital now; 102 is a free ambulance.', 'यह समय से पहले प्रसव हो सकता है। अभी अस्पताल जाएँ; 102 मुफ़्त एम्बुलेंस है।'), go: ['pregtools-contractions'] },
      { lv: 'today', s: L('Sudden swelling of the face or hands, or a headache that will not go away', 'चेहरे या हाथों पर अचानक सूजन, या ऐसा सिरदर्द जो न जाए'), often: L('Often harmless, but it can be high BP of pregnancy. A BP check today settles it.', 'अक्सर मामूली, पर यह गर्भ का हाई BP हो सकता है। आज BP जाँच से पता चल जाएगा।'), go: ['preg-symptoms'] },
      { lv: 'today', s: L('Vomiting so much you cannot keep water down, or passing very little urine', 'इतनी उल्टी कि पानी भी न रुके, या बहुत कम पेशाब'), often: L('Often severe pregnancy sickness (hyperemesis). A drip and medicine help; do not wait.', 'अक्सर गर्भ की तेज़ उल्टी (hyperemesis)। ड्रिप और दवा से आराम मिलता है; इंतज़ार न करें।'), go: ['preg-symptoms'] },
      { lv: 'today', s: L('Fever, or burning when you pee', 'बुख़ार, या पेशाब में जलन'), often: L('Often a urine infection, which needs quick treatment in pregnancy. From July to November, dengue or malaria too.', 'अक्सर पेशाब का इन्फ़ेक्शन, जिसका गर्भ में जल्दी इलाज ज़रूरी है। जुलाई से नवंबर में डेंगू या मलेरिया भी।'), go: ['preg-symptoms'] },
      { lv: 'today', s: L('Itching all over, worse on the palms and soles, in the last months', 'आख़िरी महीनों में पूरे शरीर में खुजली, हथेलियों और तलवों में ज़्यादा'), often: L('Often harmless, but it can be a liver condition of pregnancy (cholestasis) that needs a blood test.', 'अक्सर मामूली, पर यह गर्भ में लिवर की एक स्थिति (cholestasis) हो सकती है, जिसके लिए खून की जाँच चाहिए।'), go: ['preg-symptoms'] },
      { lv: 'routine', s: L('Nausea, heartburn, backache, leg cramps or tiredness', 'जी मिचलाना, सीने में जलन, कमर दर्द, पैरों में ऐंठन या थकान'), often: L('Very common in pregnancy and usually normal. Mention them at your next check-up.', 'गर्भ में बहुत आम और आम तौर पर सामान्य। अगली जाँच में बताएँ।'), go: ['preg-symptoms', 'preg-diet'] }] },
    { k: 'breast', name: L('Breast', 'स्तन'), items: [
      { lv: 'today', s: L('A red, hot, painful area with fever, while breastfeeding', 'दूध पिलाते समय लाल, गरम, दर्द वाली जगह और बुख़ार'), often: L('Often mastitis (an inflamed breast). Keep feeding or expressing from that side; a doctor can give medicine that is safe while feeding.', 'अक्सर mastitis (स्तन में सूजन)। उस तरफ़ से दूध पिलाती या निकालती रहें; डॉक्टर दूध पिलाते समय सुरक्षित दवा दे सकती हैं।'), go: ['post-feed'] },
      { lv: 'weeks2', s: L('A new lump or swelling in the breast or armpit', 'स्तन या बगल में नई गाँठ या सूजन'), often: L('Most lumps are not cancer: often a cyst or a harmless lump (fibroadenoma). Every new lump still needs a check.', 'ज़्यादातर गाँठें कैंसर नहीं होतीं: अक्सर cyst या मामूली गाँठ (fibroadenoma)। फिर भी हर नई गाँठ की जाँच ज़रूरी है।'), go: ['screen-breast'] },
      { lv: 'weeks2', s: L('Dimpled skin, a nipple newly turned in, or blood from a nipple', 'त्वचा में गड्ढे, हाल में अंदर मुड़ा निप्पल, या निप्पल से खून'), often: L('Often harmless, but these need a check by a doctor.', 'अक्सर मामूली, पर इनकी डॉक्टर से जाँच ज़रूरी है।'), go: ['screen-breast'] },
      { lv: 'weeks2', s: K('s3d'), often: L('Often a high prolactin level, thyroid, or some medicines. A blood test helps.', 'अक्सर ज़्यादा prolactin, थायरॉइड, या कुछ दवाएँ। खून की जाँच से पता चलता है।'), go: ['cond-labs'] },
      { lv: 'routine', s: L('Tender, lumpy breasts in the days before your period', 'पीरियड से पहले के दिनों में स्तनों में दर्द और गाँठें-सी'), often: L('Very common and linked to the cycle. If one lump stays after your period, get it checked.', 'बहुत आम और चक्र से जुड़ा। पीरियड के बाद भी कोई गाँठ बनी रहे तो जाँच कराएँ।'), go: ['screen-breast'] }] },
    { k: 'belly', name: L('Belly and pelvis', 'पेट और पेड़ू'), items: [
      { lv: 'now', s: L('Sudden severe belly pain with fainting or dizziness', 'चक्कर या बेहोशी के साथ अचानक तेज़ पेट दर्द'), often: L('It can be an ectopic pregnancy, a twisted or burst ovarian cyst, or appendicitis.', 'यह बच्चेदानी के बाहर का गर्भ, अंडाशय की मुड़ी या फटी cyst, या appendix हो सकता है।'), go: ['help'] },
      { lv: 'today', s: K('s2b'), often: L('Often an infection of the womb or tubes (PID), especially after a birth, an abortion or a Copper-T insertion, or appendicitis.', 'अक्सर बच्चेदानी या नलियों का इन्फ़ेक्शन (PID), ख़ासकर डिलीवरी, गर्भपात या Copper-T लगने के बाद, या appendix।'), go: ['cond-pid'] },
      { lv: 'today', s: L('Lower belly pain with fever and unusual discharge', 'बुख़ार और असामान्य स्राव के साथ पेट के निचले हिस्से में दर्द'), often: L('Often PID, an infection of the womb and tubes. Early treatment protects future fertility.', 'अक्सर PID, बच्चेदानी और नलियों का इन्फ़ेक्शन। जल्दी इलाज से आगे बच्चा होने की क्षमता बची रहती है।'), go: ['cond-pid', 'intimate-sti'] },
      { lv: 'week', s: L('Pain during sex, or pelvic pain that keeps coming back', 'संबंध में दर्द, या पेड़ू में बार-बार होने वाला दर्द'), often: L('Often endometriosis, an infection, dryness or tight muscles. Treatable.', 'अक्सर endometriosis, इन्फ़ेक्शन, सूखापन या कसी हुई मांसपेशियाँ। इलाज होता है।'), go: ['cond-endo', 'intimate-check'] },
      { lv: 'weeks2', s: L('Bloating, feeling full quickly or belly pain on 12 or more days a month', 'महीने में 12 या ज़्यादा दिन पेट फूलना, जल्दी पेट भरना या पेट दर्द'), often: L('Often gas, constipation or an irritable bowel. Rarely the ovary, which is why it needs a check.', 'अक्सर गैस, क़ब्ज़ या पेट की चिड़चिड़ाहट (IBS)। कभी-कभार अंडाशय, इसलिए जाँच ज़रूरी है।'), go: ['screen-signs'] },
      { lv: 'routine', s: L('Cramps on the first days of your period that a painkiller settles', 'पीरियड के पहले दिनों की ऐंठन जो दर्द की गोली से ठीक हो जाए'), often: L('Very common. Heat, movement and the painkiller your doctor suggests help.', 'बहुत आम। गरमी, हलचल और डॉक्टर की बताई दर्द की गोली मदद करती है।'), go: ['periods-pain'] }] },
    { k: 'urine', name: L('Urine', 'पेशाब'), items: [
      { lv: 'today', s: K('s2c'), often: L('Often a kidney infection, which needs treatment today.', 'अक्सर गुर्दे का इन्फ़ेक्शन, जिसका आज ही इलाज ज़रूरी है।'), go: ['intimate-check'] },
      { lv: 'week', s: L('Burning or stinging when you pee, or needing to go often, without fever', 'बिना बुख़ार के पेशाब में जलन या चुभन, या बार-बार जाना'), often: L('Often a bladder infection (UTI). Drink water and see a doctor; sooner if a fever starts or you are pregnant.', 'अक्सर मूत्राशय का इन्फ़ेक्शन (UTI)। पानी पिएँ और डॉक्टर को दिखाएँ; बुख़ार आए या गर्भवती हों तो पहले।'), go: ['intimate-check'] },
      { lv: 'week', s: L('Blood in your urine', 'पेशाब में खून'), often: L('Often an infection or a kidney stone, sometimes period blood mixing in. It still needs a urine test.', 'अक्सर इन्फ़ेक्शन या पथरी, कभी-कभी पीरियड का खून मिल जाता है। फिर भी पेशाब की जाँच ज़रूरी है।'), go: ['intimate-check'] },
      { lv: 'routine', s: L('Leaking urine when you cough, laugh or lift', 'खाँसने, हँसने या वज़न उठाने पर पेशाब निकल जाना'), often: L('Very common after childbirth and around menopause. Pelvic floor exercises help most women.', 'डिलीवरी के बाद और मेनोपॉज़ के आसपास बहुत आम। पेल्विक फ़्लोर व्यायाम से ज़्यादातर महिलाओं को फ़ायदा होता है।'), go: ['post-pelvic', 'intimate-prolapse'] }] },
    { k: 'vagina', name: L('Vagina and vulva', 'योनि और बाहरी हिस्सा'), items: [
      { lv: 'today', s: L('After forced or unwanted sex', 'ज़बरदस्ती या बिना मर्ज़ी के संबंध के बाद'), often: L('It is not your fault. Go to a hospital or One Stop Centre as soon as you can, within 72 hours if possible, for the emergency pill, medicine to prevent HIV and care for injuries. Call 181 or 112.', 'यह आपकी ग़लती नहीं है। जितनी जल्दी हो सके, हो सके तो 72 घंटे के अंदर, अस्पताल या वन स्टॉप सेंटर जाएँ: इमरजेंसी गोली, HIV से बचाने की दवा और चोटों का इलाज। 181 या 112 पर कॉल करें।'), go: ['intimate-safety', 'contra-ec'] },
      { lv: 'week', s: K('s4c'), often: L('Often a yeast infection, bacterial vaginosis or an STI. All are treatable; your partner may need treatment too.', 'अक्सर yeast इन्फ़ेक्शन, bacterial vaginosis या कोई STI। सबका इलाज है; साथी को भी इलाज की ज़रूरत हो सकती है।'), go: ['intimate-check', 'intimate-sti'] },
      { lv: 'week', s: L('Sores, blisters, warts or an ulcer on the vulva', 'बाहरी हिस्से पर घाव, छाले, मस्से या ज़ख़्म'), often: L('Often herpes, warts or another STI. A Suraksha clinic tests and treats free and in private.', 'अक्सर herpes, मस्से या कोई और STI। सुरक्षा क्लिनिक मुफ़्त और गोपनीय जाँच और इलाज करता है।'), go: ['intimate-sti'] },
      { lv: 'weeks2', s: L('Smelly or blood-stained discharge', 'बदबूदार या खून मिला स्राव'), often: L('Often an infection or a forgotten cloth or tampon; sometimes a problem of the cervix. Needs a check.', 'अक्सर इन्फ़ेक्शन, या अंदर भूला कपड़ा या tampon; कभी-कभी बच्चेदानी के मुँह की परेशानी। जाँच ज़रूरी है।'), go: ['screen-cervix'] },
      { lv: 'routine', s: L('A bulge or heavy feeling in the vagina', 'योनि में उभार या भारीपन'), often: L('Often a prolapse, common after births and after menopause. Exercises, a ring pessary or surgery help.', 'अक्सर prolapse (बच्चेदानी का खिसकना), डिलीवरी और मेनोपॉज़ के बाद आम। व्यायाम, ring pessary या ऑपरेशन से मदद मिलती है।'), go: ['intimate-prolapse'] },
      { lv: 'routine', s: L('Dryness or pain with sex after menopause', 'मेनोपॉज़ के बाद सूखापन या संबंध में दर्द'), often: L('Very common as hormones fall. Lubricants, and treatments a gynaecologist prescribes, help.', 'हॉर्मोन घटने से बहुत आम। चिकनाई (lubricant) और स्त्री रोग विशेषज्ञ का लिखा इलाज मदद करता है।'), go: ['meno-intimate'] }] },
    { k: 'mood', name: L('Mood', 'मन'), items: [
      { lv: 'now', s: K('s6b'), often: L('These thoughts can come with depression, after a birth or a loss, or in very hard times. Help works; you do not have to be alone with them.', 'ये विचार डिप्रेशन के साथ, डिलीवरी या किसी नुक़सान के बाद, या बहुत मुश्किल समय में आ सकते हैं। मदद काम करती है; आपको इनके साथ अकेले नहीं रहना है।'), go: ['post-mood'] },
      { lv: 'today', s: L('Feeling unsafe at home, or someone hurts, threatens or controls you', 'घर में असुरक्षित महसूस करना, या कोई चोट पहुँचाए, धमकाए या रोक-टोक करे'), often: L('This is not your fault. 181 and One Stop Centres help free, any time, in private.', 'यह आपकी ग़लती नहीं है। 181 और वन स्टॉप सेंटर मुफ़्त, कभी भी, गोपनीय मदद करते हैं।'), go: ['intimate-safety'] },
      { lv: 'week', s: K('s6a'), often: L('Often depression or anxiety, also after a birth, with thyroid problems or around menopause. Treatable.', 'अक्सर डिप्रेशन या घबराहट, डिलीवरी के बाद, थायरॉइड में या मेनोपॉज़ के आसपास भी। इलाज होता है।'), go: ['post-mood', 'teen-mind'] },
      { lv: 'routine', s: L('Low mood, crying or worry in the first 2 weeks after a birth, that eases', 'डिलीवरी के बाद पहले 2 हफ़्तों में उदासी, रोना या चिंता, जो कम होती जाए'), often: L('Often the “baby blues”, which most new mothers feel. If it lasts beyond 2 weeks or gets worse, see a doctor.', 'अक्सर “baby blues”, जो ज़्यादातर नई माँओं को होता है। 2 हफ़्ते से ज़्यादा रहे या बढ़े तो डॉक्टर को दिखाएँ।'), go: ['post-mood'] },
      { lv: 'routine', s: L('Irritability, low mood or bloating in the week before your period', 'पीरियड से पहले के हफ़्ते में चिड़चिड़ापन, उदासी या पेट फूलना'), often: L('Often PMS. If it upsets work or family life every month, see a doctor.', 'अक्सर PMS। अगर हर महीने काम या घर पर असर डाले, तो डॉक्टर को दिखाएँ।'), go: ['periods-pms'] }] },
    { k: 'skin', name: L('Skin and hair', 'त्वचा और बाल'), items: [
      { lv: 'today', s: L('Yellow eyes or skin, especially in pregnancy', 'आँखें या त्वचा पीली, ख़ासकर गर्भ में'), often: L('Often hepatitis or another liver problem. In pregnancy it needs a check today.', 'अक्सर हेपेटाइटिस (पीलिया) या लिवर की कोई और परेशानी। गर्भ में आज ही जाँच ज़रूरी।'), go: ['preg-symptoms'] },
      { lv: 'week', s: L('Pale skin or nails, tiredness and breathlessness', 'पीली त्वचा या नाख़ून, थकान और साँस फूलना'), often: L('Often anaemia (low haemoglobin), common in Indian women. The Hb test is free at government centres.', 'अक्सर खून की कमी (कम हीमोग्लोबिन), भारतीय महिलाओं में आम। Hb जाँच सरकारी केंद्रों पर मुफ़्त है।'), go: ['cond-anaemia'] },
      { lv: 'weeks2', s: K('s3c'), often: L('Often PMOS (PCOS). Rarely a hormone-making growth, which is why a fast change needs a check.', 'अक्सर PMOS (PCOS)। कभी-कभार हॉर्मोन बनाने वाली कोई गाँठ, इसलिए तेज़ बदलाव की जाँच ज़रूरी है।'), go: ['cond-labs'] },
      { lv: 'routine', s: L('Dark velvety patches on the neck or underarms', 'गर्दन या बगल में काले मखमली धब्बे'), often: L('Often a sign of insulin resistance, which comes with PMOS and pre-diabetes. The sugar test is free at government centres.', 'अक्सर insulin resistance का संकेत, जो PMOS और pre-diabetes के साथ आता है। शुगर जाँच सरकारी केंद्रों पर मुफ़्त है।'), go: ['cond-labs'] },
      { lv: 'routine', s: L('Hair fall with tiredness, feeling cold or weight gain', 'थकान, ठंड लगने या वज़न बढ़ने के साथ बाल झड़ना'), often: L('Often thyroid, anaemia, stress, a recent birth or an illness. Blood tests help.', 'अक्सर थायरॉइड, खून की कमी, तनाव, हाल की डिलीवरी या कोई बीमारी। खून की जाँच से पता चलता है।'), go: ['cond-labs', 'cond-anaemia'] },
      { lv: 'routine', s: L('Acne with irregular periods', 'अनियमित पीरियड के साथ मुँहासे'), often: L('Often PMOS. A few months of your cycle dates help the doctor.', 'अक्सर PMOS। कुछ महीनों की चक्र की तारीख़ें डॉक्टर की मदद करती हैं।'), go: ['periods'] }] }
  ];
  const symText = (s) => (s.key ? esc(t(s.key)) : E(s));

  function renderSymptoms(v) {
    const area = AREAS.find((a) => a.k === mem.area) || AREAS[0];
    const items = area.items.slice().sort((a, b) => LV_ORDER.indexOf(a.lv) - LV_ORDER.indexOf(b.lv));
    v.innerHTML = S.backRow(t('access_symptoms'), 'care', true) +
      P(L('Pick a part of the body, then the sign that fits. You will see how soon to get help, what it often turns out to be, and where to go first for free. Nothing you tap here is saved.', 'शरीर का हिस्सा चुनें, फिर जो लक्षण मेल खाए। आप देखेंगी कि मदद कितनी जल्दी लेनी है, यह अक्सर क्या निकलता है, और पहले मुफ़्त में कहाँ जाएँ। यहाँ जो टैप करती हैं, वह save नहीं होता।'), 'small') +
      '<div class="flag urgent">' + E(L('Heavy bleeding with dizziness, one-sided pain with fainting, fits, or thoughts of harming yourself: call 112 now. Do not stop to use this guide.', 'चक्कर के साथ भारी ब्लीडिंग, एक तरफ़ दर्द के साथ बेहोशी, दौरे, या ख़ुद को नुक़सान के विचार: अभी 112 पर कॉल करें। पहले यह गाइड देखने में समय न लगाएँ।')) + '</div>' +
      '<div class="chips access-areas" role="group" aria-label="' + esc(t('access_area')) + '">' + AREAS.map((a) => '<button type="button" class="chip' + (a.k === area.k ? ' on' : '') + '" data-area="' + a.k + '">' + E(a.name) + '</button>').join('') + '</div>' +
      '<h2>' + E(area.name) + '</h2>' +
      '<div class="list">' + items.map((it) => {
        const lv = LV[it.lv];
        return '<details class="access-sch access-sym lv-' + lv.cls + '"><summary><span class="body"><strong>' + symText(it.s) + '</strong><span class="access-lvl lvt-' + lv.cls + '">' + E(lv.label) + '</span></span>' + chev + '</summary>' +
          '<div class="in">' + (it.lv === 'now' ? '<div class="flag urgent">' + E(lv.label) + '</div>' : '') +
          '<h4>' + esc(t('access_often')) + '</h4>' + P(it.often) + '<h4>' + esc(t('access_where')) + '</h4>' + P(lv.where) + goBtns(it.go) + '</div></details>';
      }).join('') + '</div>' +
      '<div class="flag ok">' + esc(t('access_not_dx')) + '</div>' +
      '<p class="small">' + esc(t('same_for_all')) + '</p>' +
      '<button type="button" class="action" data-ask=""><span class="ico accent">' + S.I.steth + '</span><span class="body"><strong>' + esc(t('doc_b')) + '</strong><span class="small">' + esc(t('doc_p')) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>' +
      '<button type="button" class="btn block" data-ask="' + esc(t('access_symptoms') + ': ' + tx(area.name)) + '">' + esc(t('ask_qura')) + '</button>';
    S.wire(v);
    v.querySelectorAll('[data-area]').forEach((b) => b.addEventListener('click', () => { mem.area = b.dataset.area; renderSymptoms(v); }));
  }

  /* ---------- today's stories: the same cards as "Today for you", one at a time, full screen. Tap the right side for the next,
     the left side for the one before; they move on by themselves unless she pauses (or prefers less motion). ---------- */
  let stI = 0, stTm = 0, stPaused = false;
  const ST_MS = 7000;
  const stTodayISO = () => S.toISO(S.today());
  const stopStories = () => { clearTimeout(stTm); stTm = 0; };
  const stReduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function renderStories(v) {
    const cards = feedCards(); stopStories(); if (stI > cards.length) stI = 0;
    const end = stI >= cards.length; const c = cards[stI]; const look = (S.state.settings || {}).look;
    if (end && S.canSave()) { const d = S.data('access'); if (d.storySeen !== stTodayISO()) { d.storySeen = stTodayISO(); S.saveQuiet(); } }
    v.innerHTML = '<div class="st-wrap"><div class="st-bars" aria-hidden="true">' + cards.map((x, i) => '<i class="' + (i < stI || end ? 'done' : '') + '"><b' + (i === stI ? ' id="st-fill"' : '') + '></b></i>').join('') + '</div>' +
      '<div class="st-top"><span class="st-av">' + (S.art ? S.art.sakhi({ pose: 'hi', look: look }) : '') + '</span><strong>' + esc(t('access_feed')) + '</strong>' +
      (end ? '' : '<button type="button" class="iconbtn" id="st-pause" aria-label="' + esc(t(stPaused ? 'access_st_play' : 'access_st_pause')) + '">' + (stPaused ? I.play : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6v12M15 6v12"/></svg>') + '</button>') +
      '<button type="button" class="iconbtn" id="st-close" aria-label="' + esc(t('access_st_close')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      (end ? '<div class="card st-card st-end">' + (S.art ? S.art.sakhi({ pose: 'cheer', look: look }) : '') + '<h2>' + esc(t('access_st_end')) + '</h2><p class="small">' + esc(t('access_st_end_p')) + '</p><div class="stack"><button type="button" class="btn primary block" data-go="home">' + esc(t('access_st_home')) + '</button><button type="button" class="btn block" data-go="access-feed">' + esc(t('access_st_list')) + '</button></div></div>'
        : '<div class="card st-card" id="st-card"><div class="eyebrow">' + E(c.why) + '</div><h2>' + E(c.title) + '</h2>' + P(c.text, 'st-text') + '<div class="row wrap"><button type="button" class="btn sm primary" data-go="' + esc(c.go) + '">' + E(c.btn) + '</button>' + (S.readAloud ? '<button type="button" class="btn sm" id="st-say">' + I.speaker.replace('<svg', '<svg style="width:16px;height:16px"') + ' ' + esc(t('access_st_listen')) + '</button>' : '') + '</div></div>' +
          '<div class="grid2"><button type="button" class="btn" id="st-prev"' + (stI === 0 ? ' disabled' : '') + '>' + esc(t('access_st_prev')) + '</button><button type="button" class="btn" id="st-next">' + esc(t('access_st_next')) + '</button></div>') + '</div>';
    S.wire(v);
    const go = (i) => { stI = Math.max(0, i); renderStories(v); };
    const cl = v.querySelector('#st-close'); if (cl) cl.addEventListener('click', () => { stopStories(); S.setHash('home'); });
    const pv = v.querySelector('#st-prev'); if (pv) pv.addEventListener('click', () => go(stI - 1));
    const nx = v.querySelector('#st-next'); if (nx) nx.addEventListener('click', () => go(stI + 1));
    const ps = v.querySelector('#st-pause'); if (ps) ps.addEventListener('click', () => { stPaused = !stPaused; renderStories(v); });
    const sy = v.querySelector('#st-say'); if (sy) sy.addEventListener('click', () => { stPaused = true; stopStories(); S.readAloud(v.querySelector('#st-card')); const p2 = v.querySelector('#st-pause'); if (p2) p2.innerHTML = I.play; });
    const card = v.querySelector('#st-card');
    if (card) card.addEventListener('click', (e) => { if (e.target.closest('button, a')) return; const r = card.getBoundingClientRect(); go(e.clientX < r.left + r.width * 0.3 ? stI - 1 : stI + 1); });
    const fill = v.querySelector('#st-fill');
    if (!end && fill && !stPaused && !stReduced()) {
      fill.style.width = '0%'; requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = 'width ' + ST_MS + 'ms linear'; fill.style.width = '100%'; }));
      stTm = setTimeout(() => { if (document.getElementById('st-card')) go(stI + 1); }, ST_MS);
    } else if (fill) fill.style.width = stPaused ? '50%' : '0%';
  }
  /* Home: one line with Sakhi, until she has seen today's cards (then it greys). Not in discreet mode. */
  function storyRow() {
    if (!S.canSave() || (S.state.settings || {}).discreet) return '';
    const n = feedCards().length; if (!n) return '';
    const seen = ((S.state.mods || {}).access || {}).storySeen === stTodayISO();
    return '<button type="button" class="action st-home' + (seen ? ' seen' : '') + '" data-go="access-stories"><span class="ico st-ring">' + (S.art ? S.art.sakhi({ pose: 'hi', look: (S.state.settings || {}).look }) : I.sparkle) + '</span><span class="body"><strong>' + esc(t('access_feed')) + '</strong><span class="small">' + esc(S.tf(seen ? 'access_st_seen' : 'access_st_n', { n: n })) + '</span></span><span class="go">' + I.chev.replace('<svg', '<svg style="width:18px;height:18px"') + '</span></button>';
  }

  /* ---------- home hook ---------- */
  /* The "Today for you" card used to sit among Home's module cards; the stories line at the top of Home (storyRow) replaces it. */
  function home() { return ''; }

  /* ---------- strings ---------- */
  const en = {
    access_st_n: '{n} short cards for today', access_st_seen: 'Seen today · {n} cards', access_st_end: 'That’s all for today', access_st_end_p: 'New cards come as your days change.', access_st_list: 'See them as a list', access_st_home: 'Back to Home', access_st_close: 'Close', access_st_next: 'Next', access_st_prev: 'Back', access_st_pause: 'Pause', access_st_play: 'Play', access_st_listen: 'Listen',
    access_care: 'Care near me', access_care_s: 'Free government care by PIN code, and how to find it',
    access_claim_start: 'Track my claim', access_claim_h: 'My claim', access_claim_docs: 'Papers to keep ready. Tick each one you have.', access_claim_stop: 'Stop tracking',
    access_step_ready: 'Getting papers ready', access_step_applied: 'Applied', access_step_got: 'Money or card received', access_my_h: 'My claims',
    access_pmmvy_by: 'Register by {d}', access_pmmvy_part1: 'You have had two check-ups, so you can apply for the first part (₹3,000) now.',
    access_online: 'Do it online: government services', access_online_s: 'ABHA, U-WIN, PMMVY, Ayushman card, eSanjeevani, Jan Aushadhi',
    access_online_need: 'You need:', access_online_open: 'Open the official site', access_online_who: 'Who gets it', access_online_foot: 'Official government sites, checked on 22 Oct 2026. Sakhi is not part of them.',
    access_schemes: 'Government schemes for you', access_schemes_s: 'PMMVY, JSY, JSSK, Ayushman card and more: who gets what',
    access_schemes_preg: 'Money and free care in pregnancy', access_schemes_preg_s: 'PMMVY, JSY, JSSK, PMSMA, Anganwadi food, maternity leave',
    access_schemes_post: 'Schemes after the birth', access_schemes_post_s: 'PMMVY instalments, free care for the baby, food, contraception',
    access_schemes_period: 'Schemes for periods', access_schemes_teen: 'Schemes for girls', access_schemes_family: 'Family planning schemes',
    access_partner: 'For your husband or partner', access_partner_s: 'A page to hand him: support, NSV myths, semen test, consent',
    access_partner_eyebrow: 'For him to read',
    access_feed: 'Today for you', access_feed_s: 'A few short cards picked from your diary and the season', access_feed_home: '{n} short cards picked for today',
    access_videos: 'Doctor videos', access_videos_s: 'Planned talks, with a short text version now',
    access_symptoms: 'Symptom guide', access_symptoms_s: 'By body area: how urgent, what it often is, where to go',
    access_sources: 'Sources', access_source: 'Source', access_what_free: 'What you get', access_how_find: 'How to find it',
    access_pin_l: 'Your PIN code', access_pin_ph: '6 digits, e.g. 226010', access_pin_go: 'Show care', access_pin_note: 'Your PIN is used only on this screen and is not saved.', access_pin_for: 'PIN', access_pin_change: 'Change',
    access_near_acc: 'This is the PIN code in your Sakhi account. To look near another place, like your mother’s home, change it.', access_near_h: 'Near PIN {pin}', access_near_load: 'Looking in the government lists on this phone…',
    access_near_unknown: 'This PIN code isn’t in India Post’s list. Please check the number.', access_near_nocoord: 'India Post’s list has no map location for this PIN code, so Sakhi can’t tell which centres are closest. The official links below can help.',
    access_near_centres: 'Health centres', access_near_hosp: 'Hospitals', access_near_none: 'None within 50 km in this list.', access_near_empty: 'The government’s list has no centres within 50 km of this PIN code. That doesn’t mean there are none: ask your ASHA or call 104.', access_near_thin: 'The government’s list is missing most centres in {s}, so Sakhi can’t tell which are nearest. Your ASHA, 104 or the official links below can tell you.', access_near_km: 'about {n} km', access_near_km0: 'less than 1 km', access_near_dir: 'Directions',
    access_near_note: 'Distances are in a straight line. This is the government’s list of health facilities (NIN), last revised in {y}: a centre may be missing, or may have moved, closed or changed. Before you go, check with your ASHA or call 104.', access_near_src: 'Checked by Sakhi on {d}. Government Open Data License – India:',
    access_benefit: 'What you get', access_who: 'Who can get it', access_apply: 'How to apply', access_docs: 'Papers to keep ready',
    access_filter: 'Show schemes for', access_q_h: 'A few questions (optional)', access_q_reset: 'Clear my answers',
    access_mins: 'About {n} min', access_planned: 'Recording planned', access_text_v: 'Short text version', access_read_guide: 'Read the guide', access_close: 'Close',
    access_vid_note: 'Videos will be recorded by Qura’s doctors and checked against the same sources as the written guides.',
    access_area: 'Part of the body', access_often: 'What it often turns out to be', access_where: 'Where to go, free first',
    access_not_dx: 'Not a diagnosis. These are common causes, not what you have. Only a doctor who examines you can say.'
  };
  const hi = {
    access_st_n: 'आज के {n} छोटे कार्ड', access_st_seen: 'आज देख लिए · {n} कार्ड', access_st_end: 'आज के लिए इतना ही', access_st_end_p: 'जैसे-जैसे आपके दिन बदलते हैं, नए कार्ड आते हैं।', access_st_list: 'सूची में देखें', access_st_home: 'होम पर वापस', access_st_close: 'बंद करें', access_st_next: 'आगे', access_st_prev: 'पीछे', access_st_pause: 'रोकें', access_st_play: 'चलाएँ', access_st_listen: 'सुनें',
    access_care: 'मेरे पास इलाज', access_care_s: 'PIN code से मुफ़्त सरकारी इलाज, और उसे कैसे खोजें',
    access_claim_start: 'मेरा दावा ट्रैक करें', access_claim_h: 'मेरा दावा', access_claim_docs: 'तैयार रखने वाले काग़ज़। जो पास है, उसे टिक करें।', access_claim_stop: 'ट्रैक करना बंद करें',
    access_step_ready: 'काग़ज़ तैयार कर रही हूँ', access_step_applied: 'आवेदन किया', access_step_got: 'पैसा या कार्ड मिल गया', access_my_h: 'मेरे दावे',
    access_pmmvy_by: '{d} तक पंजीकरण करें', access_pmmvy_part1: 'आपकी दो जाँचें हो चुकी हैं, इसलिए आप पहले हिस्से (₹3,000) के लिए अभी आवेदन कर सकती हैं।',
    access_online: 'ऑनलाइन करें: सरकारी सेवाएँ', access_online_s: 'ABHA, U-WIN, PMMVY, आयुष्मान कार्ड, eSanjeevani, जन औषधि',
    access_online_need: 'आपको चाहिए:', access_online_open: 'सरकारी साइट खोलें', access_online_who: 'किसे मिलता है', access_online_foot: 'सरकारी वेबसाइटें, 22 अक्टूबर 2026 को जाँची गईं। Sakhi इनका हिस्सा नहीं है।',
    access_schemes: 'आपके लिए सरकारी योजनाएँ', access_schemes_s: 'PMMVY, JSY, JSSK, आयुष्मान card और भी: किसे क्या मिलता है',
    access_schemes_preg: 'गर्भ में पैसा और मुफ़्त देखभाल', access_schemes_preg_s: 'PMMVY, JSY, JSSK, PMSMA, आंगनवाड़ी का खाना, मातृत्व छुट्टी',
    access_schemes_post: 'डिलीवरी के बाद की योजनाएँ', access_schemes_post_s: 'PMMVY की किस्तें, बच्चे का मुफ़्त इलाज, खाना, गर्भनिरोध',
    access_schemes_period: 'पीरियड से जुड़ी योजनाएँ', access_schemes_teen: 'बेटियों के लिए योजनाएँ', access_schemes_family: 'परिवार नियोजन की योजनाएँ',
    access_partner: 'आपके पति या साथी के लिए', access_partner_s: 'उन्हें देने वाला पन्ना: साथ, NSV के भ्रम, semen test, सहमति',
    access_partner_eyebrow: 'उनके पढ़ने के लिए',
    access_feed: 'आज आपके लिए', access_feed_s: 'आपकी डायरी और मौसम से चुने कुछ छोटे कार्ड', access_feed_home: 'आज के लिए चुने {n} छोटे कार्ड',
    access_videos: 'डॉक्टर के वीडियो', access_videos_s: 'आने वाली बातचीत, अभी छोटा लिखित रूप',
    access_symptoms: 'लक्षण गाइड', access_symptoms_s: 'शरीर के हिस्से से: कितना ज़रूरी, अक्सर क्या, कहाँ जाएँ',
    access_sources: 'स्रोत', access_source: 'स्रोत', access_what_free: 'क्या मिलता है', access_how_find: 'कैसे खोजें',
    access_pin_l: 'आपका PIN code', access_pin_ph: '6 अंक, जैसे 226010', access_pin_go: 'इलाज दिखाएँ', access_pin_note: 'आपका PIN सिर्फ़ इसी screen पर इस्तेमाल होता है और save नहीं होता।', access_pin_for: 'PIN', access_pin_change: 'बदलें',
    access_near_acc: 'यह आपके Sakhi account का PIN code है। किसी और जगह के पास देखने के लिए, जैसे मायके के पास, इसे बदलें।', access_near_h: 'PIN {pin} के पास', access_near_load: 'इस फ़ोन पर सरकारी सूची में देख रहे हैं…',
    access_near_unknown: 'यह PIN code India Post की सूची में नहीं है। नंबर एक बार जाँच लें।', access_near_nocoord: 'India Post की सूची में इस PIN code की नक्शे पर जगह नहीं है, इसलिए Sakhi नहीं बता सकती कि कौन से केंद्र सबसे पास हैं। नीचे दिए सरकारी लिंक मदद कर सकते हैं।',
    access_near_centres: 'स्वास्थ्य केंद्र', access_near_hosp: 'अस्पताल', access_near_none: 'इस सूची में 50 किलोमीटर के अंदर कोई नहीं।', access_near_empty: 'सरकारी सूची में इस PIN code के 50 किलोमीटर के अंदर कोई केंद्र नहीं है। इसका मतलब यह नहीं कि वहाँ कोई नहीं है: अपनी ASHA से पूछें या 104 पर कॉल करें।', access_near_thin: 'सरकारी सूची में {s} के ज़्यादातर केंद्र नहीं हैं, इसलिए Sakhi नहीं बता सकती कि कौन से सबसे पास हैं। आपकी ASHA, 104 या नीचे दिए सरकारी लिंक बता सकते हैं।', access_near_km: 'लगभग {n} किमी', access_near_km0: '1 किमी से कम', access_near_dir: 'रास्ता देखें',
    access_near_note: 'दूरी सीधी रेखा में है। यह सरकार की स्वास्थ्य केंद्रों की सूची (NIN) है, जो आख़िरी बार {y} में बदली गई थी: कोई केंद्र इसमें छूटा हो सकता है, या हट गया, बंद हो गया या बदल गया हो सकता है। जाने से पहले अपनी ASHA से पूछें या 104 पर कॉल करें।', access_near_src: 'Sakhi ने {d} को जाँचा। Government Open Data License – India:',
    access_benefit: 'क्या मिलता है', access_who: 'किसे मिलता है', access_apply: 'आवेदन कैसे करें', access_docs: 'तैयार रखने वाले काग़ज़',
    access_filter: 'किसके लिए योजनाएँ दिखाएँ', access_q_h: 'कुछ सवाल (वैकल्पिक)', access_q_reset: 'मेरे जवाब हटाएँ',
    access_mins: 'लगभग {n} मिनट', access_planned: 'रिकॉर्डिंग बाक़ी', access_text_v: 'छोटा लिखित रूप', access_read_guide: 'गाइड पढ़ें', access_close: 'बंद करें',
    access_vid_note: 'वीडियो Qura की डॉक्टर रिकॉर्ड करेंगी, और इन्हें लिखी गाइड वाले स्रोतों से ही जाँचा जाएगा।',
    access_area: 'शरीर का हिस्सा', access_often: 'यह अक्सर क्या निकलता है', access_where: 'कहाँ जाएँ, पहले मुफ़्त',
    access_not_dx: 'diagnosis नहीं। ये आम कारण हैं, आपको क्या है यह नहीं। जाँच करने वाली डॉक्टर ही बता सकती हैं।'
  };

  /* ---------- module CSS (scoped to access-) ---------- */
  const css = [
    '.access-sch{background:var(--card);border-radius:16px;box-shadow:var(--shadow);overflow:hidden}',
    '.access-sch>summary{display:flex;gap:12px;align-items:center;padding:12px 14px;list-style:none;font-size:15px;color:var(--fg);font-weight:400;min-height:56px}',
    '.access-sch>summary::-webkit-details-marker{display:none}',
    '.access-sch .body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.access-sch .body strong{font-weight:600;font-size:15px;overflow-wrap:break-word;line-height:1.35}',
    '.access-sch .body span{font-size:12px;color:var(--muted);overflow-wrap:break-word}',
    '.access-sch>summary>.pill{flex-shrink:0;max-width:38%;text-align:center;line-height:1.3;white-space:normal}',
    '.access-chev{color:var(--accent);width:18px;height:18px;flex-shrink:0;display:inline-flex;transition:transform .2s}',
    '.access-chev svg{width:18px;height:18px}',
    '.access-sch[open]>summary .access-chev{transform:rotate(90deg)}',
    '.access-sch .in{padding:0 14px 14px;display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px}',
    '.access-sch .in h4{margin:6px 0 0;font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}',
    'body.hi .access-sch .in h4{text-transform:none;letter-spacing:0;font-size:12px}',
    '.access-sch .in p{font-size:14px;color:var(--text);line-height:1.5;overflow-wrap:break-word}',
    '.access-links{display:flex;flex-direction:column;gap:6px;margin-top:4px}',
    '.access-link{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--accent-soft);color:var(--fg);font-size:13px;font-weight:600;overflow-wrap:anywhere}',
    '.access-link span:last-child{color:var(--accent);flex-shrink:0}',
    '.access-gos{margin-top:4px}',
    '.access-inline{align-self:flex-start}',
    '.access-tags{gap:6px}',
    '.access-tags .chip,.access-areas .chip{min-height:38px;padding:0 12px}',
    '.access-q{display:flex;flex-direction:column;gap:6px;padding-top:8px;border-top:1px solid var(--line)}',
    '.access-ql{font-size:14px;color:var(--fg);font-weight:500}',
    '.access-q .chip{min-height:38px;padding:0 14px}',
    '.access-gh{display:flex;align-items:center;gap:8px;margin-top:4px}',
    '.access-later>summary{font-size:13px;padding:6px 0}',
    '.access-src summary{padding:4px 0}',
    '.access-fc{gap:6px}',
    '.access-vid{align-items:flex-start}',
    '.access-vid .body strong{overflow-wrap:break-word;line-height:1.35}',
    '.access-claim{display:flex;flex-direction:column;gap:8px;margin-top:6px;padding-top:10px;border-top:1px solid var(--line)} .access-steps{display:flex;flex-wrap:wrap;gap:6px} .access-planned{align-self:flex-start;margin-top:4px;font-size:12px !important;font-weight:600}',
    '.access-vt{display:flex;flex-direction:column;gap:6px;padding-left:18px;color:var(--fg);font-size:14px}',
    '.access-lvl{display:inline-flex;align-self:flex-start;margin-top:4px;font-size:13px !important;font-weight:600;padding:2px 8px;border-radius:10px;line-height:1.4}',
    '.lvt-urgent{background:var(--ink);color:var(--ink-text) !important}',
    '.lvt-today{background:var(--accent-soft);color:var(--accent) !important}',
    '.lvt-week{background:var(--gold-soft);color:var(--gold) !important;border:1px solid var(--gold)}',
    '.lvt-routine{background:var(--ok-soft);color:var(--ok) !important}',
    '.access-sym.lv-urgent{border-left:4px solid var(--ink)}',
    '.access-sym.lv-today{border-left:4px solid var(--accent)}',
    '.access-hand{border:1.5px dashed var(--gold)}'
  ].join('\n');

  S.register({
    id: 'access',
    demoPersona: 'blank',
    strings: { en: en, hi: hi },
    routes: { 'access-stories': (v) => { stI = 0; stPaused = false; renderStories(v); }, 'access-care': renderCare, 'access-online': renderOnline, 'access-schemes': (v) => renderSchemes(v, 'all'), 'access-partner': renderPartner, 'access-feed': renderFeed, 'access-videos': renderVideos, 'access-symptoms': renderSymptoms },
    prefixes: { 'access-schemes-': (v, rest) => renderSchemes(v, rest) },
    testRoutes: ['access-schemes-preg', 'access-schemes-post', 'access-schemes-period', 'access-schemes-teen', 'access-schemes-family', 'access-schemes-all'],
    open: ['access-stories', 'access-care', 'access-online', 'access-schemes', 'access-schemes-*', 'access-partner', 'access-feed', 'access-videos', 'access-symptoms'],
    tiles: [
      { section: 'tools', route: 'access-care', title: 'access_care', sub: 'access_care_s', icon: 'map', order: 20, gated: false, keywords: 'care near me pin code phc chc district hospital asha anganwadi ayushman arogya mandir jan aushadhi ictc one stop centre afhc पास इलाज अस्पताल' },
      { section: 'tools', route: 'access-schemes', title: 'access_schemes', sub: 'access_schemes_s', icon: 'file', order: 21, gated: false, keywords: 'scheme yojana pmmvy jsy jssk pmsma pm-jay ayushman card maternity benefit ni-kshay suvidha 181 योजना पैसा' },
      { section: 'tools', route: 'access-online', title: 'access_online', sub: 'access_online_s', icon: 'file', order: 21, gated: false, keywords: 'online website portal app abha health id u-win vaccine certificate pmmvy apply ayushman card pm-jay esanjeevani video doctor jan aushadhi ऑनलाइन वेबसाइट आवेदन' },
      { section: 'tools', route: 'access-partner', title: 'access_partner', sub: 'access_partner_s', icon: 'users', order: 22, gated: false, keywords: 'husband partner men nsv vasectomy condom semen test consent पति साथी' },
      { section: 'tools', route: 'access-feed', title: 'access_feed', sub: 'access_feed_s', icon: 'sparkle', order: 23, gated: true, keywords: 'today for you feed tips insights आज' },
      { section: 'tools', route: 'access-videos', title: 'access_videos', sub: 'access_videos_s', icon: 'play', order: 24, gated: false, keywords: 'video doctor talk dr megha वीडियो' },
      { section: 'tools', route: 'access-symptoms', title: 'access_symptoms', sub: 'access_symptoms_s', icon: 'help', order: 25, gated: true, keywords: 'symptom checker pain bleeding discharge lump urgent लक्षण' },
      { section: 'preg', route: 'access-schemes-preg', title: 'access_schemes_preg', sub: 'access_schemes_preg_s', icon: 'file', order: 70, gated: false, keywords: 'pmmvy jsy jssk pmsma money scheme maternity योजना' },
      { section: 'post', route: 'access-schemes-post', title: 'access_schemes_post', sub: 'access_schemes_post_s', icon: 'file', order: 70, gated: false, keywords: 'pmmvy jssk anganwadi ration scheme योजना' }
    ],
    css: css + '.access-near .item { box-shadow: none; background: var(--card-2); } .access-near h4 { margin: 14px 0 6px; } .access-fac .btn { flex-shrink: 0; } .st-wrap { display: flex; flex-direction: column; gap: 12px; } .st-bars { display: flex; gap: 4px; } .st-bars i { flex: 1; height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; } .st-bars i.done b { width: 100%; } .st-bars b { display: block; height: 100%; width: 0; background: var(--accent); }' +
      '.st-top { display: flex; align-items: center; gap: 10px; } .st-top strong { flex: 1; min-width: 0; } .st-av { width: 40px; height: 40px; flex: none; } .st-av .sakhi { width: 40px; height: 40px; }' +
      '.st-card { min-height: 46vh; justify-content: center; gap: 10px; cursor: pointer; } .st-card h2 { margin: 0; font-size: 24px; } .st-text { font-size: 17px; line-height: 1.5; color: var(--fg); } .st-end { align-items: center; text-align: center; cursor: default; } .st-end .sakhi { width: 76px; height: 76px; }' +
      '.st-ring { background: none !important; padding: 0; border: 2.5px solid var(--accent); } .st-home.seen .st-ring { border-color: var(--line); } .st-ring .sakhi { width: 100%; height: 100%; }',
    home: home,
    homeTop: storyRow,
    summary: () => { if (!S.canSave()) return []; const cl = AD().claims; const ks = TRACK.filter((k) => cl[k]); if (!ks.length) return []; return [{ title: t('access_my_h'), lines: ks.map((k) => { const c = cl[k]; const st = stepOf(c); return tx(SCH[k].name).split(':')[0] + ': ' + t('access_step_' + st) + (c[st] && st !== 'ready' ? ' (' + fmtL(S.fromISO(c[st])) + ')' : ''); }) }]; },
    afterRender: (v, route) => { if (route !== 'access-stories') stopStories(); }
  });
})(window.Saathi);
