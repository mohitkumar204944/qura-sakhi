/* My pelvic floor plan's chapters (Version 39.56; Mohit, 2 Nov: "proceed building"; advice
   docs/pelvic-floor-plan-advice-2026-11-02.md, from the 24 Oct design, docs/plans-design-and-build-2026-10-24-programmes.md,
   section 4). A short chapter a week for the plan's 12 weeks (f1 to f12), and 4 more on the heaviness track after "a doctor said
   prolapse" (v1 to v4, weeks 13 to 16). Also "When the urge comes" (pf-urge), the urge track's routine, and pf-go, which opens
   the trainer with a set started (Today's play button and the morning ring).
   NICE NG123 and NG210 are the source: at least 8 squeezes 3 times a day for at least 3 months, bladder training for at least 6
   weeks, less caffeine for an urgent bladder, 16 weeks for a mild prolapse. No medicine names or doses, no promises, and only a
   doctor names a cause. Every line waits for the doctor and a women's health physiotherapist (review 19.56). mods/plan.js chooses
   the week's chapter (S.plan.pelvic.lesson()). */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;
  const N2 = (en, hi) => ({ en: en, hi: hi });
  const T = (o) => esc(tx(o));
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));

  /* Browse mode keeps what she read in memory for this visit only */
  let temp = { owner: null, d: {} };
  const store = () => { if (S.canSave()) return S.data('pfplan'); if (temp.owner !== S.state) temp = { owner: S.state, d: {} }; return temp.d; };
  const persist = () => { if (S.canSave()) S.save(); };

  const TRY = N2('Try this week', 'इस हफ़्ते आज़माएँ');
  const LOW = N2('Feeling low or alone because of this? Talk to your doctor.', 'इसकी वजह से उदास या अकेली महसूस करती हैं? अपनी डॉक्टर से बात करें।');
  const WHY = N2('Pelvic floor exercises (Kegels), done the right way every day for at least 3 months, are the first treatment doctors advise for leaking urine and for mild heaviness. They work best with a little help: a doctor or physiotherapist can check your squeeze.',
    'रोज़ सही तरीक़े से, कम से कम 3 महीने pelvic floor के व्यायाम, पेशाब लीक होने और हल्के भारीपन का पहला इलाज है जो डॉक्टर बताती हैं। थोड़ी मदद से ये सबसे अच्छा काम करते हैं: डॉक्टर या फ़िज़ियोथेरेपिस्ट आपके कसने के तरीक़े की जाँच कर सकती हैं।');
  /* a chapter: h (its title) and cards: { b: heading, l: lines, go/gol: a button, ask: a Qura doctor, warn, u: urgent with tel } */
  const L = {
    f1: { h: N2('Find your pelvic floor', 'अपना pelvic floor पहचानें'), cards: [
      { pic: 'sling' },
      { l: [N2('Your pelvic floor is a sling of muscles under your bladder, womb and bowel. It holds them up and keeps them closed until you are ready.', 'Pelvic floor मांसपेशियों का एक झूला है, जो मूत्राशय, बच्चेदानी और आँतों के नीचे है। यह इन्हें सहारा देता है और तब तक बंद रखता है जब तक आप तैयार न हों।'),
        N2('Births, years of heavy lifting, a long cough, constipation and the years after menopause can stretch it. Then urine can leak, or you feel heavy down below. It is common, and it can get better.', 'डिलीवरी, सालों तक भारी बोझ उठाना, लंबी खाँसी, क़ब्ज़ और मेनोपॉज़ के बाद के साल इसे ढीला कर सकते हैं। तब पेशाब लीक हो सकता है, या नीचे भारीपन लगता है। यह आम है, और यह ठीक हो सकता है।')] },
      { b: N2('The right squeeze', 'सही तरीक़े से कसना'), l: [N2('Lie down with your knees bent. Squeeze as if you are stopping wind and stopping urine at the same time. Feel it lift up and in.', 'घुटने मोड़कर लेट जाएँ। ऐसे कसें जैसे आप एक साथ गैस और पेशाब रोक रही हों। महसूस करें कि यह अंदर और ऊपर की ओर खिंचता है।'),
        N2('Then let go fully. The letting go matters as much as the squeeze.', 'फिर पूरी तरह ढीला छोड़ें। ढीला छोड़ना उतना ही ज़रूरी है जितना कसना।')] },
      { b: N2('Common mistakes', 'आम ग़लतियाँ'), l: [N2('Holding your breath. Breathe normally all through.', 'साँस रोकना। पूरे समय सामान्य साँस लें।'), N2('Squeezing your buttocks, thighs or belly instead. Keep them soft.', 'इसकी जगह कूल्हे, जाँघें या पेट कसना। इन्हें ढीला रखें।'),
        N2('Pushing down, as if passing stool. The squeeze goes up, never down.', 'नीचे की ओर ज़ोर लगाना, जैसे शौच के समय। कसना ऊपर की ओर होता है, कभी नीचे नहीं।'), N2('Practising by stopping your urine on the toilet. Don’t: just imagine it.', 'शौचालय में पेशाब रोककर अभ्यास करना। ऐसा न करें: बस कल्पना करें।')] },
      { b: TRY, l: [N2('Find it lying down, 3 times a day. Your first sets are lying down too.', 'दिन में 3 बार लेटकर इसे पहचानें। आपके पहले सेट भी लेटकर ही हैं।')], go: 'post-pelvic', gol: '@tile' },
      { warn: true, b: N2('If it hurts', 'अगर दर्द हो'), l: [N2('Squeezing should not hurt. If it does, stop and tap “It hurts” in your sets. A doctor should check the pain.', 'कसने में दर्द नहीं होना चाहिए। अगर हो, तो रुकें और अपने सेट में “दर्द हो रहा है” पर टैप करें। दर्द की जाँच डॉक्टर करें।'), LOW] }] },
    f2: { h: N2('The knack', 'तरकीब'), cards: [
      { l: [N2('A leak often comes with a cough, a sneeze, a laugh or a lift. These push down on your bladder all at once.', 'लीक अक्सर खाँसी, छींक, हँसी या कुछ उठाने के साथ होता है। ये एक साथ मूत्राशय पर नीचे की ओर ज़ोर डालते हैं।'),
        N2('The knack is a squeeze just before that moment, held until it passes. It can stop a leak as it starts, from the first weeks.', 'तरकीब है ठीक उस पल से पहले कसना, और तब तक रोके रखना जब तक वह पल निकल न जाए। पहले हफ़्तों से ही यह लीक को शुरू होते ही रोक सकती है।')] },
      { b: N2('How to practise', 'कैसे अभ्यास करें'), l: [N2('Sit or stand. Squeeze and lift, then give a small pretend cough while you hold. Let go after the cough.', 'बैठें या खड़ी हों। कसें और ऊपर खींचें, फिर रोके रखते हुए एक छोटी-सी नक़ली खाँसी करें। खाँसी के बाद ढीला छोड़ें।'),
        N2('Do the same before you lift a bucket, a child or a pot of water.', 'बाल्टी, बच्चे या पानी का घड़ा उठाने से पहले भी ऐसा ही करें।')] },
      { b: TRY, l: [N2('Use the knack every time you cough, sneeze or lift this week. It becomes a habit in a few weeks.', 'इस हफ़्ते हर बार खाँसने, छींकने या उठाने पर तरकीब इस्तेमाल करें। कुछ हफ़्तों में यह आदत बन जाती है।')] }] },
    f3: { h: N2('Longer holds, and quick Kegels', 'ज़्यादा देर रोकना, और जल्दी-जल्दी कसना'), cards: [
      { l: [N2('Your muscles need two kinds of strength. Long holds help them hold you up all day. Quick Kegels help them close fast when you cough or rush.', 'आपकी मांसपेशियों को दो तरह की ताक़त चाहिए। देर तक रोकने से ये पूरे दिन सहारा देती हैं। जल्दी-जल्दी कसने से ये खाँसी या जल्दबाज़ी में तुरंत बंद होती हैं।'),
        N2('Your sets grow with your levels: longer holds first, then quick Kegels after them. A level opens after 5 days of sets, never by the date.', 'आपके सेट लेवल के साथ बढ़ते हैं: पहले ज़्यादा देर रोकना, फिर उसके बाद जल्दी-जल्दी कसना। लेवल 5 दिन के सेट के बाद खुलता है, तारीख़ से नहीं।')] },
      { b: N2('Breathe while you hold', 'रोकते समय साँस लें'), l: [N2('Count out loud during a hold. If you can count, you are breathing.', 'रोकते समय ज़ोर से गिनें। अगर गिन पा रही हैं, तो आप साँस ले रही हैं।')] },
      { b: TRY, l: [N2('If a hold is too long, stop when the squeeze fades, rest, and start again. A good short hold is better than a weak long one.', 'अगर रोकना बहुत लंबा लगे, तो कसाव ढीला पड़ते ही रुकें, आराम करें, और फिर शुरू करें। कमज़ोर लंबे की जगह अच्छा छोटा रोकना बेहतर है।')], go: 'post-pelvic', gol: '@tile' }] },
    f4: { h: N2('Water through the day', 'दिन भर पानी'), cards: [
      { l: [N2('Many women drink less to leak less. But too little water makes urine strong, and strong urine makes the bladder more urgent.', 'कई महिलाएँ कम लीक के लिए कम पानी पीती हैं। पर बहुत कम पानी से पेशाब गाढ़ा होता है, और गाढ़ा पेशाब मूत्राशय में और जल्दी हाजत पैदा करता है।'),
        N2('Drink about 6 to 8 glasses a day, a little at a time, more in the heat. Pale yellow urine means you are drinking enough.', 'दिन में लगभग 6 से 8 गिलास पिएँ, थोड़ा-थोड़ा करके, गर्मी में ज़्यादा। हल्का पीला पेशाब बताता है कि आप काफ़ी पी रही हैं।'),
        N2('Drink less in the last 2 hours before bed if you wake at night to pass urine.', 'अगर रात में पेशाब के लिए उठती हैं, तो सोने से पहले के आख़िरी 2 घंटों में कम पिएँ।')] },
      { b: N2('Your 4-week check', 'आपकी 4 हफ़्ते की जाँच'), l: [N2('Are you sure you are squeezing the right way? Many women aren’t at first. A Qura doctor can talk it through on a free call, and your doctor or a women’s health physiotherapist can check it in person.', 'क्या आपको यक़ीन है कि आप सही तरीक़े से कस रही हैं? शुरू में कई महिलाओं को नहीं होता। Qura की डॉक्टर मुफ़्त कॉल पर बात कर सकती हैं, और आपकी डॉक्टर या महिलाओं की फ़िज़ियोथेरेपिस्ट सामने से जाँच सकती हैं।')], ask: true },
      { b: TRY, l: [N2('Keep a glass of water where you can see it, and sip through the day.', 'पानी का एक गिलास ऐसी जगह रखें जहाँ दिखे, और दिन भर घूँट-घूँट पिएँ।')] }] },
    f5: { h: N2('On the toilet', 'शौच के समय'), cards: [
      { l: [N2('Straining on the toilet pushes down on your pelvic floor, day after day. How you sit helps.', 'शौच के समय ज़ोर लगाना दिन-ब-दिन pelvic floor पर नीचे की ओर दबाव डालता है। बैठने का तरीक़ा मदद करता है।'),
        N2('Put your feet on a low stool so your knees are above your hips, lean forward with your elbows on your knees, and breathe out. Let your belly relax. Don’t push hard.', 'पैर एक छोटे पीढ़े पर रखें ताकि घुटने कूल्हों से ऊपर हों, कोहनियाँ घुटनों पर रखकर आगे झुकें, और साँस छोड़ें। पेट ढीला रहने दें। ज़ोर न लगाएँ।'),
        N2('On an Indian toilet you are already squatting: breathe out and don’t strain.', 'भारतीय शौचालय में आप पहले से उकड़ूँ बैठी होती हैं: साँस छोड़ें और ज़ोर न लगाएँ।')] },
      { b: N2('Soft stools', 'नरम शौच'), l: [N2('Water, fruit, vegetables, dal and whole grains every day keep stools soft. Constipation that lasts needs a doctor.', 'रोज़ पानी, फल, सब्ज़ियाँ, दाल और साबुत अनाज शौच को नरम रखते हैं। लंबी क़ब्ज़ के लिए डॉक्टर ज़रूरी हैं।')] },
      { b: TRY, l: [N2('Go when you need to, not “just in case”. Going too often teaches the bladder to hold less.', 'ज़रूरत होने पर जाएँ, “बस यूँ ही” नहीं। बार-बार जाने से मूत्राशय कम रोकना सीखता है।')] }] },
    f6: { h: N2('Less pushing down', 'नीचे की ओर कम ज़ोर'), cards: [
      { l: [N2('A long cough, constipation and heavy loads push down on your pelvic floor. Each one you ease takes strain off it.', 'लंबी खाँसी, क़ब्ज़ और भारी बोझ pelvic floor पर नीचे की ओर ज़ोर डालते हैं। हर एक को कम करने से इस पर ज़ोर घटता है।'),
        N2('A cough that lasts more than 3 weeks needs a doctor, for its own sake and for your pelvic floor.', '3 हफ़्ते से ज़्यादा चलने वाली खाँसी के लिए डॉक्टर ज़रूरी हैं, उसके अपने लिए भी और आपके pelvic floor के लिए भी।')] },
      { b: N2('If you rush to the toilet', 'अगर शौचालय की ओर भागना पड़ता है'), l: [N2('Tea, coffee and cola can make an urgent bladder worse. Try less of them for 2 weeks, and see if the urge is calmer. Keep drinking water.', 'चाय, कॉफ़ी और कोला तेज़ हाजत को बढ़ा सकते हैं। 2 हफ़्ते इन्हें कम करके देखें कि हाजत शांत होती है या नहीं। पानी पीती रहें।')] },
      { b: TRY, l: [N2('Use the knack before every cough or sneeze, and breathe out when you lift.', 'हर खाँसी या छींक से पहले तरकीब इस्तेमाल करें, और उठाते समय साँस छोड़ें।')] }] },
    f7: { h: N2('Standing sets', 'खड़े होकर सेट'), cards: [
      { l: [N2('Lying down is the easiest way to squeeze. Sitting is harder, and standing is hardest, because your bladder and womb press down on the muscles.', 'लेटकर कसना सबसे आसान है। बैठकर मुश्किल है, और खड़े होकर सबसे मुश्किल, क्योंकि मूत्राशय और बच्चेदानी मांसपेशियों पर नीचे दबाव डालते हैं।'),
        N2('Leaks happen when you are up and moving, so standing sets are the goal. Your sets move to standing when your level gets there.', 'लीक तब होते हैं जब आप खड़ी होकर चल-फिर रही होती हैं, इसलिए खड़े होकर सेट लक्ष्य है। लेवल वहाँ पहुँचने पर आपके सेट खड़े होकर होंगे।')] },
      { b: N2('Standing at a wall', 'दीवार के पास खड़े होकर'), l: [N2('Stand with your back near a wall, feet apart, knees soft. Squeeze and lift as before, breathing normally.', 'पीठ दीवार के पास रखकर खड़ी हों, पैर थोड़े खुले, घुटने ढीले। पहले की तरह कसें और ऊपर खींचें, सामान्य साँस लेते हुए।')] },
      { b: TRY, l: [N2('If a standing set feels weak, do your first set of the day lying down, and the others standing.', 'अगर खड़े होकर सेट कमज़ोर लगे, तो दिन का पहला सेट लेटकर करें, और बाक़ी खड़े होकर।')], go: 'post-pelvic', gol: '@tile' }] },
    f8: { h: N2('Lifting the safe way', 'सही तरीक़े से उठाना'), cards: [
      { l: [N2('Water pots, buckets, children and loads are part of many women’s days. Lifting the same way each time protects your pelvic floor.', 'पानी के घड़े, बाल्टियाँ, बच्चे और बोझ कई महिलाओं के दिन का हिस्सा हैं। हर बार एक ही तरीक़े से उठाने से pelvic floor की रक्षा होती है।'),
        N2('Bend your knees, not your back. Squeeze first, breathe out as you lift, and keep the load close to you. Share heavy loads when you can.', 'कमर नहीं, घुटने मोड़ें। पहले कसें, उठाते समय साँस छोड़ें, और बोझ शरीर के पास रखें। जब हो सके, भारी बोझ बाँट लें।')] },
      { b: N2('Halfway', 'आधा रास्ता'), l: [N2('You are halfway. Look back at your weeks in My progress. Many women notice fewer leaks by now, and more after 3 months.', 'आप आधे रास्ते पर हैं। मेरी प्रगति में अपने हफ़्ते देखें। कई महिलाओं को अब तक कम लीक दिखते हैं, और 3 महीने बाद और भी कम।')], go: 'plan-progress', gol: 'plan_tiles_prog' },
      { b: TRY, l: [N2('Before each lift this week: squeeze, breathe out, lift.', 'इस हफ़्ते हर बार उठाने से पहले: कसें, साँस छोड़ें, उठाएँ।')] }] },
    f9: { h: N2('Sets in your day', 'दिन के काम में सेट'), cards: [
      { l: [N2('The best set is the one you do. Tie your sets to things you do every day, so you don’t have to remember.', 'सबसे अच्छा सेट वही है जो आप करती हैं। अपने सेट रोज़ के कामों से जोड़ें, ताकि याद न रखना पड़े।'),
        N2('One set while the tea boils, one while you wait for water at the tap, one after you brush your teeth at night.', 'एक सेट जब चाय उबले, एक जब नल पर पानी का इंतज़ार हो, एक रात को दाँत साफ़ करने के बाद।')] },
      { b: TRY, l: [N2('Pick one task for one set each day this week, and do it standing.', 'इस हफ़्ते रोज़ एक सेट के लिए एक काम चुनें, और उसे खड़े होकर करें।')] }] },
    f10: { h: N2('When to see a doctor', 'डॉक्टर को कब दिखाएँ'), cards: [
      { u: N2('Go to the nearest hospital or a doctor now if you suddenly can’t control your bladder or bowel, with numbness between your legs, weak legs or bad back pain.', 'अभी सबसे पास के अस्पताल या डॉक्टर के पास जाएँ अगर अचानक पेशाब या शौच पर क़ाबू न रहे, साथ में जाँघों के बीच सुन्नपन, पैरों में कमज़ोरी या कमर में तेज़ दर्द हो।'), tel: ['112'] },
      { warn: true, b: N2('See a doctor today', 'आज ही डॉक्टर को दिखाएँ'), l: [N2('You can’t pass urine at all, or a bulge is stuck outside, very painful or bleeding: tell someone at home, and go to a doctor or the nearest hospital today.', 'पेशाब बिल्कुल न हो पाए, या उभार बाहर अटक जाए, बहुत दर्द हो या ख़ून आए: घर में किसी को बताएँ, और आज ही डॉक्टर या सबसे पास के अस्पताल जाएँ।')] },
      { b: N2('See a doctor soon', 'जल्दी डॉक्टर को दिखाएँ'), l: [N2('Burning, fever or blood in your urine: usually an infection, not a weak pelvic floor.', 'पेशाब में जलन, बुख़ार या ख़ून: आम तौर पर इन्फ़ेक्शन, कमज़ोर pelvic floor नहीं।'),
        N2('Leaking all the time, day and night: it can be repaired, and it shouldn’t wait.', 'दिन-रात हर समय लीक: इसकी मरम्मत हो सकती है, और इसे रुकना नहीं चाहिए।'),
        N2('Any bleeding 12 months or more after your last period: within about 2 weeks.', 'आख़िरी पीरियड के 12 महीने या ज़्यादा बाद कोई भी ब्लीडिंग: लगभग 2 हफ़्ते में।'),
        N2('Wind or stool you can’t hold, or 2 urine infections in 6 months.', 'गैस या शौच रोक न पाना, या 6 महीने में पेशाब के 2 इन्फ़ेक्शन।')], ask: true }] },
    f11: { h: N2('If exercises aren’t enough', 'अगर व्यायाम काफ़ी न हों'), cards: [
      { l: [N2('Exercises help most women. When they don’t help enough, there is more a doctor can do. You don’t have to live with it.', 'व्यायाम ज़्यादातर महिलाओं की मदद करते हैं। जब काफ़ी मदद न हो, तो डॉक्टर और भी कर सकती हैं। आपको इसके साथ जीना नहीं पड़ेगा।')] },
      { b: N2('What a doctor can offer', 'डॉक्टर क्या दे सकती हैं'), l: [N2('A ring pessary: a soft ring a doctor places inside to hold things up, with a check every few months.', 'Ring pessary: एक नरम अंगूठी जिसे डॉक्टर अंदर रखती हैं ताकि सब अपनी जगह रहे, हर कुछ महीने जाँच के साथ।'),
        N2('Medicines for an urgent bladder, which your doctor chooses with you.', 'तेज़ हाजत वाले मूत्राशय के लिए दवाएँ, जो आपकी डॉक्टर आपके साथ चुनती हैं।'),
        N2('After menopause, a treatment inside the vagina that your doctor may suggest.', 'मेनोपॉज़ के बाद, योनि के अंदर का एक इलाज जो आपकी डॉक्टर सुझा सकती हैं।'),
        N2('An operation, for leaks or a prolapse that bother you a lot. Your doctor explains which kind suits you.', 'ऑपरेशन, उन लीक या prolapse के लिए जो बहुत परेशान करें। आपकी डॉक्टर बताती हैं कि कौन सा आपके लिए सही है।')], ask: true, go: 'intimate-prolapse', gol: '@tile' },
      { b: TRY, l: [N2('Keep your sets going. They help whatever comes next, and before and after an operation too.', 'अपने सेट करती रहें। आगे जो भी हो, ये मदद करते हैं, ऑपरेशन से पहले और बाद में भी।')] }] },
    f12: { h: N2('Keep strong', 'मज़बूत बनी रहें'), cards: [
      { l: [N2('Your 12 weeks are done. Muscles that are used stay strong; muscles that rest grow weak again.', 'आपके 12 हफ़्ते पूरे हुए। जिन मांसपेशियों का इस्तेमाल होता है वे मज़बूत रहती हैं; जो आराम करती हैं वे फिर कमज़ोर हो जाती हैं।'),
        N2('One set a day keeps the strength you built. Keep the knack and the safe lift for life.', 'रोज़ एक सेट आपकी बनाई ताक़त बनाए रखता है। तरकीब और सही तरीक़े से उठाना हमेशा के लिए रखें।')] },
      { b: N2('Still leaking or heavy?', 'अब भी लीक या भारीपन?'), l: [N2('After 3 months of exercises, see a doctor. There are more treatments, and a doctor can find what is still holding you back.', '3 महीने व्यायाम के बाद डॉक्टर को दिखाएँ। और भी इलाज हैं, और डॉक्टर पता लगा सकती हैं कि अब भी क्या रुकावट है।'), LOW], ask: true, go: 'plan-progress', gol: 'plan_tiles_prog' }] },
    v1: { h: N2('A rest at the end of the day', 'दिन के आख़िर में आराम'), cards: [
      { l: [N2('Heaviness is often worse in the evening, after hours of standing. A short rest lying down eases the dragging.', 'भारीपन अक्सर शाम को ज़्यादा होता है, घंटों खड़े रहने के बाद। लेटकर थोड़ा आराम खिंचाव कम करता है।'),
        N2('Lie on your back for 10 minutes with a pillow under your hips, and do one set lying down.', 'कूल्हों के नीचे तकिया रखकर 10 मिनट पीठ के बल लेटें, और लेटकर एक सेट करें।')] },
      { b: TRY, l: [N2('Plan your heaviest jobs for the morning, and sit for tasks you can do sitting.', 'सबसे भारी काम सुबह के लिए रखें, और जो काम बैठकर हो सकें, वे बैठकर करें।')] }] },
    v3: { h: N2('Sex and prolapse', 'संबंध और prolapse'), cards: [
      { l: [N2('Sex is safe with a prolapse, and it doesn’t make it worse. Some positions are more comfortable, such as lying on your side.', 'Prolapse के साथ संबंध सुरक्षित है, और इससे यह बढ़ता नहीं। कुछ मुद्राएँ ज़्यादा आरामदायक होती हैं, जैसे करवट लेकर लेटना।'),
        N2('Empty your bladder first. Squeezing and letting go during sex can feel good, and is a set too.', 'पहले पेशाब कर लें। संबंध के दौरान कसना और ढीला छोड़ना अच्छा लग सकता है, और यह भी एक सेट है।')] },
      { b: N2('If sex hurts', 'अगर संबंध में दर्द हो'), l: [N2('Pain with sex is not something to put up with. Tell your doctor; there is help for it.', 'संबंध में दर्द सहने की चीज़ नहीं है। अपनी डॉक्टर को बताएँ; इसका इलाज है।')], ask: true }] },
    v4: { h: N2('Keep strong for life', 'हमेशा के लिए मज़बूत'), cards: [
      { l: [N2('Your 16 weeks are done. A prolapse doesn’t go away with exercises, but heaviness often eases, and strong muscles help it not get worse.', 'आपके 16 हफ़्ते पूरे हुए। Prolapse व्यायाम से ख़त्म नहीं होता, पर भारीपन अक्सर कम होता है, और मज़बूत मांसपेशियाँ इसे बढ़ने से रोकने में मदद करती हैं।'),
        N2('Keep one set a day, the knack, the safe lift and soft stools. See your doctor if it gets worse.', 'रोज़ एक सेट, तरकीब, सही तरीक़े से उठाना और नरम शौच जारी रखें। बढ़े तो अपनी डॉक्टर को दिखाएँ।')], ask: true }] }
  };
  /* the sling (decision 7): the bladder, the womb and the bowel on the pelvic floor, and the lift a squeeze gives */
  const SL = { bl: N2('Bladder', 'मूत्राशय'), wb: N2('Womb', 'बच्चेदानी'), bw: N2('Bowel', 'आँत'), pf: N2('Your pelvic floor', 'आपका pelvic floor'), up: N2('A squeeze lifts it', 'कसने पर यह ऊपर उठता है'),
    alt: N2('The bladder, the womb and the bowel rest on a sling of muscles, the pelvic floor. A squeeze lifts it.', 'मूत्राशय, बच्चेदानी और आँतें मांसपेशियों के एक झूले, pelvic floor, पर टिकी हैं। कसने पर यह ऊपर उठता है।') };
  const slingSvg = () => '<figure class="pf-sling"><svg viewBox="0 0 240 150" role="img" aria-label="' + T(SL.alt) + '">' +
    '<ellipse cx="62" cy="58" rx="34" ry="26" class="pf-org"/><ellipse cx="120" cy="50" rx="26" ry="34" class="pf-org"/><ellipse cx="180" cy="60" rx="30" ry="24" class="pf-org"/>' +
    '<path d="M18 92 Q120 150 222 92" class="pf-sl-old"/><path d="M18 92 Q120 122 222 92" class="pf-sl"/>' +
    '<path d="M120 142 L120 116" class="pf-up"/><path d="M112 124 L120 114 L128 124" class="pf-up"/>' +
    '<text x="62" y="62" text-anchor="middle">' + T(SL.bl) + '</text><text x="120" y="54" text-anchor="middle">' + T(SL.wb) + '</text><text x="180" y="64" text-anchor="middle">' + T(SL.bw) + '</text></svg>' +
    '<figcaption class="small"><strong>' + T(SL.pf) + '</strong> · ' + T(SL.up) + '</figcaption></figure>';
  const lessonRead = (id) => !!((store().les || {})[id]);
  const mark = (id) => { if (!L[id]) return; const st = store(); st.les = Object.assign({}, st.les || {}); st.les[id] = S.toISO(S.today()); persist(); };
  const tileT = (r) => { const x = (S.tiles ? S.tiles() : []).find((y) => y.route === r); return x ? t(x.title) : r; };
  const call = (n) => '<a class="btn danger sm" href="tel:' + n + '">' + esc(t('call_b')) + ' ' + n + '</a>';
  const topic = () => t('plan_pk_pelvic');
  function cardHtml(c) {
    if (c.pic === 'sling') return slingSvg();
    if (c.u) return '<div class="card dark urgent pf-les" role="alert" data-say="1"><p class="pf-p">' + T(c.u) + '</p><div class="row wrap">' + (S.emNums ? S.emNums(c.tel || ['112']) : ['108']).map(call).join('') + '</div></div>';
    const go = c.go && S.routeOwner(c.go) ? '<button type="button" class="btn sm" data-go="' + c.go + '">' + (c.gol === '@tile' ? esc(tileT(c.go)) : (typeof c.gol === 'string' ? esc(t(c.gol)) : T(c.gol))) + '</button>' : '';
    const ask = c.ask ? '<button type="button" class="btn sm primary" data-ask="' + esc(topic()) + '">' + esc(t('ask_qura')) + '</button>' : '';
    return '<div class="card pf-les' + (c.warn ? ' warn' : '') + (c.b === TRY ? ' pf-try' : '') + '" data-say="1">' + (c.b ? '<h3>' + T(c.b) + '</h3>' : '') + c.l.map((x) => '<p class="pf-p">' + T(x) + '</p>').join('') + (go || ask ? '<div class="row wrap">' + ask + go + '</div>' : '') + '</div>';
  }
  function renderLesson(v, forced) {
    const P = S.plan && S.plan.pelvic; const id = [forced, S.mem.pfLes, P && P.lesson()].find((x) => x && L[x]) || 'f1'; const ls = L[id];   /* the row she tapped, else this week's */
    const ch = id.charAt(0) === 'v' ? fill(t('pf_ch_v'), { n: id.slice(1) }) : fill(t('pf_ch'), { n: id.slice(1) });
    v.innerHTML = S.backRow(tx(ls.h), 'home', false) + '<div class="stack">' + '<span class="eyebrow pf-eye">' + esc(t('plan_pk_pelvic') + ' · ' + ch) + '</span>' + ls.cards.map(cardHtml).join('') +
      '<details class="card pf-why"><summary>' + esc(t('pf_why')) + '</summary><p class="pf-p small">' + T(WHY) + '</p></details>' +
      (S.canSave() ? '<button type="button" class="btn primary block" id="pf-les-done">' + esc(t('pf_done')) + '</button>' : '') + '</div>';
    S.wire(v);
    const dn = v.querySelector('#pf-les-done'); if (dn) dn.addEventListener('click', () => { mark(id); S.mem.pfLes = null; S.setHash('home'); });
  }
  /* "When the urge comes": stop, squeeze, breathe, walk calmly; from week 3, a few minutes more before she goes */
  const URGE = [N2('Stop. Stand still, or sit down if you can.', 'रुकें। स्थिर खड़ी हों, या हो सके तो बैठ जाएँ।'), N2('Squeeze. A few quick, strong Kegels.', 'कसें। कुछ बार जल्दी और ज़ोर से कसें।'),
    N2('Breathe. Breathe out slowly and count to 5. Think of something else.', 'साँस लें। धीरे साँस छोड़ें और 5 तक गिनें। किसी और चीज़ के बारे में सोचें।'), N2('Walk calmly. When the urge eases, walk to the toilet. Don’t rush.', 'आराम से चलें। हाजत कम हो, तो शौचालय तक चलें। भागें नहीं।')];
  function renderUrge(v) {
    const P = S.plan && S.plan.pelvic; const wk = P && P.week ? P.week() : 0;
    v.innerHTML = S.backRow(t('plan_pf_urge'), 'home', false) + '<div class="stack">' +
      '<div class="card pf-les" data-say="1"><p class="pf-p">' + esc(t('pf_urge_p')) + '</p><ol class="steps pf-urge">' + URGE.map((x) => '<li>' + T(x) + '</li>').join('') + '</ol></div>' +
      '<div class="card pf-les' + (wk >= 3 ? ' pf-try' : '') + '" data-say="1"><h3>' + esc(t('pf_urge_wait_h')) + '</h3><p class="pf-p">' + esc(t('pf_urge_wait')) + '</p></div>' +
      '<div class="card pf-les warn" data-say="1"><p class="pf-p">' + esc(t('plan_pfs_uti_w')) + '</p><div class="row wrap"><button type="button" class="btn sm primary" data-ask="' + esc(topic()) + '">' + esc(t('ask_qura')) + '</button></div></div></div>';
    S.wire(v);
  }
  /* Today's play button and the morning ring: the trainer with a set started */
  /* her habit's chapter (Today's habit step), else this week's */
  function renderHabit(v) { const P = S.plan && S.plan.pelvic; renderLesson(v, P && P.habitCh ? P.habitCh() : null); }
  function renderGo(v) {
    S.mem.pfAuto = true;
    if (S.post && S.post.renderPelvic) { try { history.replaceState(null, '', '#post-pelvic'); } catch (e) { /* the trainer still draws */ } S.post.renderPelvic(v); return; }
    v.innerHTML = ''; location.replace('#post-pelvic');
  }
  /* the row she taps on Today or My plan opens its own chapter (data-go navigates after this capture) */
  document.addEventListener('click', (e) => { const b = e.target && e.target.closest ? e.target.closest('[data-pf-les]') : null; if (b) S.mem.pfLes = b.dataset.pfLes; }, true);
  S.pfplan = Object.assign(S.pfplan || {}, {
    lesson: { has: (id) => !!L[id], title: (id) => (L[id] ? tx(L[id].h) : ''), read: lessonRead, mark: mark, ids: () => Object.keys(L) }
  });

  S.register({
    id: 'pfplan',
    strings: {
      en: { pf_ch: 'chapter {n} of 12', pf_ch_v: 'after a doctor’s check, chapter {n} of 4', pf_why: 'Why this helps', pf_done: 'Done',
        pf_urge_p: 'A sudden strong urge comes in a wave, and it passes. Rushing makes it stronger. Try this each time:', pf_urge_wait_h: 'From week 3: a little longer', pf_urge_wait: 'When the urge has passed, wait a few minutes more before you go. Each week, a little longer. Over 6 weeks your bladder learns to hold more.' },
      hi: { pf_ch: '12 में से अध्याय {n}', pf_ch_v: 'डॉक्टर की जाँच के बाद, 4 में से अध्याय {n}', pf_why: 'यह क्यों मदद करता है', pf_done: 'हो गया',
        pf_urge_p: 'अचानक तेज़ हाजत एक लहर की तरह आती है, और निकल जाती है। भागने से यह और तेज़ होती है। हर बार यह आज़माएँ:', pf_urge_wait_h: 'हफ़्ते 3 से: थोड़ा और', pf_urge_wait: 'हाजत निकल जाने पर, जाने से पहले कुछ मिनट और रुकें। हर हफ़्ते थोड़ा ज़्यादा। 6 हफ़्तों में मूत्राशय ज़्यादा रोकना सीख जाता है।' }
    },
    routes: { 'pf-lesson': renderLesson, 'pf-habit': renderHabit, 'pf-urge': renderUrge, 'pf-go': renderGo },
    open: ['pf-lesson', 'pf-habit', 'pf-urge', 'pf-go'],
    css: [
      '.pf-p { margin: 0; overflow-wrap: anywhere; }',
      '.pf-les { display: grid; gap: 8px; }',
      '.pf-les.has-say > .say-b + .pf-p { padding-right: 40px; }',
      '.pf-try { border: 1.5px solid var(--accent); }',
      '.pf-urge { margin: 0; padding-left: 20px; display: grid; gap: 6px; }',
      '.pf-sling { margin: 0; display: grid; gap: 4px; justify-items: center; }', '.pf-sling svg { width: 100%; max-width: 320px; height: auto; }',
      '.pf-sling text { font-size: 12px; fill: var(--fg); }', '.pf-org { fill: var(--accent); fill-opacity: 0.14; stroke: var(--muted); stroke-width: 1.2; }',
      '.pf-sl { fill: none; stroke: var(--accent); stroke-width: 7; stroke-linecap: round; }', '.pf-sl-old { fill: none; stroke: var(--muted); stroke-width: 2; stroke-dasharray: 5 5; }',
      '.pf-up { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }', '.pf-sling figcaption { text-align: center; color: var(--muted); }',
      '.pf-why summary { list-style: none; cursor: pointer; font-weight: 600; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
      '.pf-why summary::-webkit-details-marker { display: none; }',
      '.pf-why summary::after { content: ""; flex: none; width: 8px; height: 8px; margin-right: 4px; border-right: 2px solid var(--muted); border-bottom: 2px solid var(--muted); transform: rotate(45deg); }',
      '.pf-why[open] summary::after { transform: rotate(-135deg); }'
    ].join('\n')
  });
})(window.Saathi);
