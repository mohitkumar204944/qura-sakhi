# Qura Sakhi on Google Play: the two web pages and two Play Console forms (29 Oct 2026)

Play needs four things that aren't app code:

| What | Where it lives | In this document |
|---|---|---|
| Privacy policy | a public page: quranutrition.com/sakhi/privacy | Part 1, the prompt for a Qura website session |
| Account deletion | a public page: quranutrition.com/sakhi/delete-account | Part 1, the same prompt |
| Data safety form | Play Console, App content | Part 2, the answers to enter |
| Health apps declaration | Play Console, App content | Part 2, the answers to tick |

Every fact here comes from Sakhi's code and spec on 29 Oct 2026:
- the app's own notice (`notice_text` in `web/app.js`, version 2026-10-23.2);
- the server spec (`server/SERVER_SPEC.md`, sections 1, 4, 5 and 10.1);
- the migrations.

The pages and the Data safety answers say the same things, so the two won't contradict each other.

**Updated 7 Nov 2026** (Mohit: "Fix the notes"), to match the app as of Version 39.77 (`d3112de`):
- the emergency line: "Go to the nearest hospital now", with the ambulance (108, or 102 in pregnancy), not "call 112" (Version 39.70);
- Tele-MANAS, the self-checks and the Govt. services pages are gone from the app (Versions 39.68 and 39.70);
- "Share how I use Sakhi" (PostHog, events only, on until she turns it off; Version 39.60) is now in the privacy page, the
  deletion page and the Data safety answers, as `docs/play-upload-audit-2026-11-04.md` (B1) set out;
- the "See a doctor" page opens eSanjeevani, the government's free online doctor (Version 39.77);
- no doctor is named on the pages (Mohit, 6 Nov: "Dont give doctor names anywhere").

**Updated again 7 Nov 2026** (Mohit: "i want to move to firebase"; Version 39.79, MODULE_API section 122): "Share how I use Sakhi"
now goes to Google Firebase Analytics, through the app's own code, instead of PostHog. The same switch and rules; Google also sees
the phone's type and the rough area from the connection; it keeps the data 14 months (set in Google Analytics, 7 Nov). Every
PostHog line below is now a Firebase line, and the Data safety rows say "through Firebase Analytics".

Still for Mohit and counsel: whether usage sharing on by default meets the DPDP Act's consent (the audit's B3), and the page's own
promise "If we ever want to collect something new, Sakhi asks you in the app first", since it started on by default for women who
joined before it (PostHog from Version 39.60, Firebase from Version 39.79).

## Before you send the prompt: fill in or decide

**Decided 7 Nov 2026:** the Grievance Officer is Mohit Kumar, at Trinaya Wellness LLP's registered address (E-1-121, Chitrakoot
Yojna, Chitrakoot Marg, Vaishali Nagar, Jaipur, Rajasthan 302021), email hello@quranutrition.com. The pages went live on 7 Nov at
https://quranutrition.com/sakhi/privacy and https://quranutrition.com/sakhi/delete-account (www redirects there); use these in
Play Console. The first deploy dropped the Grievance Officer section and left /sakhi itself loading Meta Pixel, Google Analytics and
Google Ads remarketing; the follow-up deploy fixed both (checked 7 Nov: the Grievance Officer section and the Hindi line are on the
privacy page, and /sakhi, /hi/sakhi and both pages make no request outside quranutrition.com). The app's builds carry the same
details from vc 140 (`SAKHI_GRIEVANCE`, `SAKHI_PRIVACY`), and from vc 142 the app drops Play's install referrer, so Analytics never
learns which ad or link she installed Sakhi from.

1. **Grievance Officer:** name, Trinaya Wellness LLP's registered address, and email. These are the same details the APK's
   `SAKHI_GRIEVANCE` waits for. Put them in the prompt's "Values" block.
2. **The email for privacy questions and deletion requests.** I recommend the Grievance Officer's own email: one inbox.
3. **How you check a deletion request is hers.** I wrote a call from Qura's number, then deletion within 7 days. Not
   WhatsApp, because that would tell Meta she uses Sakhi. The steps for the team are in `server/DEPLOY.md`, "When someone
   asks by email to delete her account".
4. **Backups.** The policy promises a deleted account leaves the weekly exports within 30 days. That's only true if you keep
   the last 4 exports and delete older ones. `server/DEPLOY.md` now says so.
5. **Counsel:**
   The store listing's "not a medical device" line, and the declaration's "Medical device apps: No", both rest on the CDSCO
   question for a public listing. Check them with your lawyer before the listing goes public. A closed test can go first.
6. **The /sakhi page itself** was built on 25 Oct but not deployed then. These two pages hang off it, so it goes live first,
   or with them.

## Part 1: the prompt for a Qura website session

Paste everything inside the box into a Claude session in Qura's website repo (`~/Desktop/qura_nutrition-version1`), after
replacing the three bracketed values.

````text
You're working in Qura's website repo (www.quranutrition.com). Mohit wants two public pages for the Qura Sakhi app so it can
be listed on Google Play. Play asks for a privacy policy link and an account deletion link, both public web pages.

Qura Sakhi ("Sakhi") is Trinaya Wellness LLP's free women's health app for Android, in English and Hindi. Its code is in a
separate repo you don't need. Every fact you need is below. Don't add, drop or soften any fact. If something here clashes with
what you find in Qura's code or in Qura's own privacy policy, stop and tell Mohit.

VALUES (Mohit fills these in; if any is still in square brackets, stop and ask him; never publish a bracket)
- Grievance Officer: Mohit Kumar
- Trinaya Wellness LLP's registered address: E-1-121, Chitrakoot Yojna, Chitrakoot Marg, Vaishali Nagar, Jaipur, Rajasthan 302021
- Email for privacy questions and deletion requests: hello@quranutrition.com

WHAT TO BUILD
1. Find the existing Sakhi page (quranutrition.com/sakhi, built in a Qura session on 25 Oct from Mohit's handoff folder). Use
   its layout, fonts and colours.
2. Add two pages with the text below:
   - /sakhi/privacy, titled "Qura Sakhi privacy policy";
   - /sakhi/delete-account, titled "Delete your Qura Sakhi account".
3. Link both from the Sakhi page's footer: "Privacy policy" and "Delete your account".

RULES FOR BOTH PAGES
- Public:
  - no login, and no cookie wall or pop-up over the text;
  - the text is in the HTML the server sends, because Google's reviewers and crawlers must be able to read it;
  - not a PDF and not an image.
- No trackers on these two routes:
  - none of Meta Pixel, Google Analytics, Google Tag Manager, Microsoft Clarity, a chat widget, or any third-party script;
  - check the root layout and anything injected site-wide, and exclude these routes from it;
  - why: a visit to these pages tells a tracker that a woman uses a women's health app, and Sakhi's rule is that nothing
    about her health reaches Meta;
  - prove it in the browser's network tab: no request may leave quranutrition.com from either page.
- No forms:
  - these pages collect nothing;
  - the deletion request is an email link (mailto) with only the subject filled in;
  - never put a phone number or any other personal detail in a URL.
- Readable at 360 px wide with no sideways scroll, and headings a screen reader can follow.
- English first, then Hindi. A link at the top ("हिंदी में") jumps to the Hindi. Use the Sakhi page's font stack for the
  Devanagari.
- "Last updated: <the day it goes live>" at the top of both pages.
- The humanizer:
  - apply the humanizer skill (.claude/skills/humanizer/SKILL.md) in Dr. Megha's voice to the two page titles and to
    "The short version" only;
  - leave every other line as written;
  - never change a fact, number, time limit, name or promise;
  - name no doctor anywhere on the pages (Mohit, 6 Nov).
- Qura's own privacy policy:
  - Find it on the site and link to it wherever the text says {Qura's privacy policy}.
  - Where the text says {Qura lead retention}: if Qura's policy says how long Qura keeps leads or booking requests, put
    that in one sentence. If it says nothing, leave the sentence out and tell Mohit.
  - Check that Qura's policy doesn't send lead data to ad platforms without leaving Sakhi out. Sakhi leads (source `sakhi`)
    are skipped by the remarketing sweep and the audience export. If the policy says otherwise, tell Mohit.
- Don't deploy until Mohit says so. When you finish, tell him the two final URLs and what you checked.

DONE WHEN
- both URLs answer 200 to a logged-out browser and to curl, with the text in the HTML;
- no request leaves quranutrition.com from either page;
- the Sakhi page's footer links to both;
- the text matches this prompt word for word, apart from the humanizer's touch on the titles and the short version;
- at 360 px there's no sideways scroll.

==================== PAGE 1: /sakhi/privacy ====================

# Qura Sakhi privacy policy

Last updated: <the day it goes live>

Qura Sakhi ("Sakhi") is a free app for women's reproductive health, made by Qura, the brand of Trinaya Wellness LLP ("we",
"us"). This policy covers the Sakhi app for Android.

## The short version

- Your diary stays on your phone. Your periods, symptoms, moods, notes, pregnancy details, medicines, reports and plan are
  never sent to us.
- To run your account, we keep your mobile number and a few details on a server in Mumbai, until you delete your account.
- Your sign-in code goes by WhatsApp (Meta) or by SMS (AuthKey). The message holds only the code.
- If you ask Qura to call you, only what you choose to share goes to Qura's care team.
- No ads. We don't sell your data, and the app has no advertising tools. To learn which parts of Sakhi help, it tells Google
  Firebase Analytics which screens you open and where you tap, with no name or number and never your diary. You can turn this off.
- You can delete your account in the app at any time, or ask us by email.

## What stays only on your phone

Everything you record in Sakhi:
- your period dates and flow, symptoms, moods, sleep, notes and check-ins, and the private sex log;
- pregnancy and after-birth details, conditions, medicines and tablets, and test results;
- the photos and reports you add;
- your stage, your goals, your plan and its steps, your reminders, and your PIN.

It's kept in the app's private storage on your phone. Sakhi never sends it to us, and doesn't let Android back it up to
Google's cloud.

- The report for your doctor, and anything else you share, leaves your phone only when you share it yourself, with the
  person and the app you choose.
- "Move to a new phone" makes a backup code that holds your diary, locked with your PIN. You keep the code; we never see it.
- Reminders are made by your phone.
- Read-aloud uses your phone's own voice, one that works without the internet when your phone has one.
- Voice typing uses your phone's own voice-typing service (often Google's), which hands Sakhi only the words.
- To remove your diary, tap Me, then "Delete everything on this phone", or uninstall Sakhi.

## What we keep on our server, and why

Your Sakhi account is kept on a server in Mumbai, run for us by Supabase.

| What we keep | Why |
|---|---|
| Your mobile number | Your account and signing in |
| Your year of birth | To check you're 18 or older |
| Your first name | Your account. If you ask Qura to call you, the care team uses it too |
| Your PIN code, and the district and state it belongs to | Your account, and to count where Sakhi is used |
| Your email, if you give it | Your account |
| How you heard of Sakhi, if you tell us | To learn how women find Sakhi |
| Whether you want updates by SMS or WhatsApp | To send updates only if you said yes |
| Your language, app version, whether you use Sakhi on Android or the web, and the last day you opened it | To keep Sakhi working, and to count how many women use it |
| What you agreed to, and when | A record of your consent |
| Your logins, kept only as a scrambled code | So you stay signed in |

## Your sign-in code

- To sign you up or in, we send a 6-digit code to your number by WhatsApp (run by Meta) or by SMS (through AuthKey). They get
  your number and the code, nothing else.
- We keep the code only in scrambled form, and delete it within a day.

## When you ask Qura to call you (only if you choose to)

- In Sakhi you can ask Qura's care team to call you. Before you send, you see exactly what will go. Nothing from your diary
  is ticked to start.
- What goes:
  - your first name and number;
  - what you write (up to 120 characters);
  - the best time to call, and your language;
  - only the parts of your diary you tick.
- It passes through Sakhi's server.
  - The server deletes what you wrote and ticked as soon as Qura has it, or after 24 hours if it can't be delivered.
  - It keeps a short record with your account: the reference, when you asked, the best time, your language, which parts you
    ticked (not what they said) and whether it reached Qura. That record is deleted with your account.
- Qura's care team uses it only to arrange and prepare your call, and keeps it under {Qura's privacy policy}.
  {Qura lead retention}
- When your consult is booked, Qura confirms it on WhatsApp, as for any Qura booking.
- Deleting your Sakhi account doesn't remove these calls from Qura's records. To have them deleted too, ask us (see
  "Deleting your account").

## How you use Sakhi (Google Firebase Analytics), until you turn it off

- To learn which parts of Sakhi help, the app sends Google Firebase Analytics which screens you open, how long you stay, where
  you tap, and when something on a screen fails to work (without what it said). Google does this for us, on its own servers,
  which can be outside India.
- With it, Google also sees your phone's type, its Android and app versions and language, and your rough area from the internet
  connection. Never your exact place.
- It never gets the words on a screen, your diary, your name, your number or your account. Sakhi never uses an advertising ID,
  and ad personalisation is off.
- Each phone has a random ID for this that isn't linked to your account. Turning it off deletes that ID on your phone.
- Screen names can show your stage, for example the pregnancy plan.
- Nothing is sent from private screens, while Sakhi is locked, in discreet mode, or on a phone marked as shared.
- Turn it off any time on the Me page, in Privacy.

## Keeping it safe

- Everything between the app and our server is encrypted (HTTPS).
- We use your IP address only to stop abuse, such as too many codes from one network. It's kept as a scrambled value that
  changes every day; we don't store the address itself.
- The server's logs never hold your code, your login or anything from your diary.
- We keep encrypted weekly backups of the account records. A deleted account leaves them within 30 days.

## What we never do

- We never receive your diary.
- No ads and no advertising tools in the app. Google Firebase Analytics (above) is the only service that learns how Sakhi is
  used, and you can turn it off. We don't sell or rent your data.
- We don't send your account details to Meta or any ad platform. Meta is involved only when your sign-in code goes by
  WhatsApp, and when Qura confirms a booked consult on WhatsApp.

## Links that leave Sakhi

Websites, phone calls, WhatsApp and your phone's share screen open outside Sakhi and follow their own policies. One of the
websites is eSanjeevani, the government's free online doctor. Qura's booking page follows {Qura's privacy policy}.

## Under 18

Sakhi's diary is for women 18 and over, and Sakhi doesn't make an account for anyone younger. Girls under 18 can read the
safety guide and the Learn pages, which need no account, and nothing they type is saved.

## How long we keep things

- Your account: until you delete it.
- Logins not used for 365 days: deleted (your account stays).
- Sign-in codes: deleted within a day.
- What you write and tick when you ask Qura to call you: on Sakhi's server only until Qura has it, 24 hours at most.
- Weekly backups: a deleted account leaves them within 30 days.
- How you use Sakhi, at Google Firebase Analytics: 14 months. It has no name or number, so it can't be tied to your account.
- Totals with no name or number: kept. These are the daily counts of signups and active users.

## Your rights

Under India's Digital Personal Data Protection Act, 2023, you can:
- see your details: Sakhi's Account page shows them;
- correct them there;
- delete your account, in the app or by email (below), and withdraw your consent;
- name someone to act for you if you die or can't act yourself;
- complain to our Grievance Officer, and then to the Data Protection Board of India.

Email [EMAIL] for any of these. We reply within 30 days.

## Deleting your account

- In Sakhi: tap Me, then your name at the top, then "Delete my account", then "Yes, delete it".
- Or email [EMAIL]. All the steps: quranutrition.com/sakhi/delete-account.
- Deleting your account doesn't touch the diary on your phone. To remove that too, tap Me, then "Delete everything on this
  phone", or uninstall Sakhi.

## Grievance Officer

[NAME], Trinaya Wellness LLP, [ADDRESS]. Email: [EMAIL].

## Changes

If this policy changes, we update this page and the date at the top. If we ever want to collect something new, Sakhi asks
you in the app first.

---

## हिंदी में: Qura Sakhi की गोपनीयता नीति का सार

आपकी एंट्री सिर्फ़ इसी फ़ोन पर रहती हैं। Qura (Trinaya Wellness LLP) आपका अकाउंट चलाने के लिए आपके अकाउंट की जानकारी मुंबई
के एक सर्वर (Supabase) पर रखता है, जब तक आप “अकाउंट” पन्ने पर अपना अकाउंट मिटा न दें। साइन-इन कोड भेजने के लिए आपका नंबर
WhatsApp (Meta) को, या SMS के लिए AuthKey को जाता है; मैसेज में सिर्फ़ कोड होता है। अगर आप Qura से कॉल माँगती हैं, तो आपका
पहला नाम और नंबर, आपकी लिखी बात और डायरी के सिर्फ़ वही हिस्से जो आप टिक करें, Sakhi के सर्वर से होकर Qura की care टीम को
जाते हैं; Qura को मिलते ही सर्वर उन्हें मिटा देता है।

- कोई विज्ञापन नहीं। हम आपका डेटा नहीं बेचते, और ऐप में विज्ञापन का कोई टूल नहीं है।
- आप Sakhi कैसे इस्तेमाल करती हैं: आप कौन-से पन्ने खोलती हैं, कितनी देर रुकती हैं और कहाँ टैप करती हैं, यह Google Firebase
  Analytics के पास जाता है, आपके फ़ोन के प्रकार और मोटे-मोटे इलाके के साथ, बिना नाम या नंबर के; पन्नों पर लिखे शब्द या आपकी डायरी
  कभी नहीं। इसे कभी भी “मैं” पन्ने पर, निजता में बंद कर सकती हैं।
- अकाउंट मिटाने के लिए: Sakhi में “मैं” → सबसे ऊपर अपना नाम → “मेरा अकाउंट मिटाएँ” → “हाँ, मिटाएँ”। या [EMAIL] पर ईमेल
  करें।
- आपकी डायरी हमारे सर्वर पर कभी नहीं आती। उसे हटाने के लिए “मैं” पन्ने पर “इस फ़ोन से सब कुछ delete करें” दबाएँ, या Sakhi
  को फ़ोन से हटा दें।
- शिकायत अधिकारी: [NAME], Trinaya Wellness LLP, [ADDRESS]। ईमेल: [EMAIL]। हम 30 दिन के अंदर जवाब देते हैं।

पूरी नीति ऊपर अंग्रेज़ी में है।

==================== PAGE 2: /sakhi/delete-account ====================

# Delete your Qura Sakhi account

Last updated: <the day it goes live>

Qura Sakhi is made by Qura (Trinaya Wellness LLP). You can delete your Sakhi account at any time.

## In the app (it takes a minute)

1. Open Sakhi and tap **Me**.
2. Tap your name at the top (your number shows under it). This opens **Your Sakhi account**.
3. Tap **Delete my account**, then **Yes, delete it**.

Your account is deleted straight away.

## Without the app

Email [EMAIL] with the subject "Delete my Sakhi account" (make this a mailto link with only that subject filled in). Write the
mobile number you signed up with. We'll call you from Qura's number to check the number is yours, then delete your account
within 7 days and reply to tell you.

If you also want the calls you asked Qura for deleted, say so in the same email.

## What is deleted

- your mobile number, year of birth, first name, PIN code with its district and state, email, how you heard of Sakhi, and
  your update choices;
- your language, app version, the last day you opened Sakhi, your consent records and your logins;
- the record, on Sakhi's server, of calls you asked Qura for.

## What stays, and for how long

- **Your diary:** it was never on our server. It stays on your phone until you tap Me, then "Delete everything on this
  phone", or uninstall Sakhi.
- **Calls you asked Qura for:** Qura's care team keeps them under {Qura's privacy policy}, unless you ask us to delete them
  (above).
- **Backups:** our encrypted weekly backups still hold your account for up to 30 days. Then it's gone from them too.
- **How you used Sakhi, at Google Firebase Analytics:** it has no name or number, so it can't be tied to your account; Google
  keeps it for 14 months. Turn "Share how I use Sakhi" off on the Me page to stop it and delete the phone's random ID.
- **Totals with no name or number:** the daily counts of signups and active users. They don't identify you, and they stay.

---

## हिंदी में: अपना Qura Sakhi अकाउंट मिटाएँ

Qura Sakhi को Qura (Trinaya Wellness LLP) बनाता है। आप कभी भी अपना Sakhi अकाउंट मिटा सकती हैं।

### ऐप में

1. Sakhi खोलें और **मैं** दबाएँ।
2. सबसे ऊपर अपने नाम पर दबाएँ (उसके नीचे आपका नंबर दिखता है)। **आपका Sakhi अकाउंट** खुलेगा।
3. **मेरा अकाउंट मिटाएँ** दबाएँ, फिर **हाँ, मिटाएँ**।

अकाउंट उसी समय मिट जाता है।

### ऐप के बिना

[EMAIL] पर ईमेल करें। विषय में “Delete my Sakhi account” लिखें, और वह मोबाइल नंबर लिखें जिससे आपने साइन-अप किया था। नंबर
आपका ही है, यह जाँचने के लिए हम Qura के नंबर से आपको कॉल करेंगे, फिर 7 दिन के अंदर अकाउंट मिटाकर आपको बताएँगे। Qura से
माँगी गई कॉल की जानकारी भी मिटवानी हो, तो उसी ईमेल में लिखें।

### क्या बचा रहता है

- **आपकी डायरी** हमारे सर्वर पर कभी नहीं थी। वह आपके फ़ोन पर रहती है, जब तक आप “मैं” पन्ने पर “इस फ़ोन से सब कुछ delete
  करें” न दबाएँ या Sakhi को फ़ोन से न हटा दें।
- **बैकअप:** हमारे हफ़्ते के बैकअप में आपका अकाउंट ज़्यादा से ज़्यादा 30 दिन रहता है, फिर वहाँ से भी मिट जाता है।
- **आप Sakhi कैसे इस्तेमाल करती थीं (Google Firebase Analytics):** इसमें नाम या नंबर नहीं होता, इसलिए यह आपके अकाउंट से नहीं
  जुड़ता; Google इसे 14 महीने रखता है। “मैं” पन्ने पर “मैं Sakhi कैसे इस्तेमाल करती हूँ, यह साझा करें” बंद करें, तो यह रुक जाता है
  और फ़ोन की गुमनाम पहचान मिट जाती है।
- **बिना नाम या नंबर वाली गिनती** (कितनी महिलाओं ने साइन-अप किया या ऐप खोला) बनी रहती है; उससे आपकी पहचान नहीं होती।
````

## Part 2: what to enter in Play Console

### The Data safety form (App content → Data safety)

**Data collection and security**
- Does your app collect or share any of the required user data types? **Yes.**
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS only).
- Account creation: **Yes**. Pick the option for a phone number with a one-time code and no password.
- Delete account URL: **https://quranutrition.com/sakhi/delete-account**
- A way to delete some data without deleting the account? **No.** The diary is never collected, so its "Delete everything"
  doesn't count here.

**Data types: everything below is "Collected", never "Shared", and none is processed only ephemerally.**
- Nothing is "Shared":
  - Supabase (the server), Meta (the WhatsApp code), AuthKey (the SMS) and Google Firebase Analytics (how she uses Sakhi) are
    service providers acting for Trinaya. Play doesn't count service providers as sharing.
  - Qura is Trinaya itself.

| Category → type | What it is in Sakhi | Required or optional | Purposes |
|---|---|---|---|
| Location → Approximate location | Her PIN code, and the district and state from it; and, through Firebase Analytics, the rough area from the connection | Required | Account management, Analytics |
| Personal info → Name | Her first name | Required | Account management, App functionality |
| Personal info → Email address | Her email, if she gives it | Optional | Account management |
| Personal info → User IDs | Sakhi's account ID | Required | Account management |
| Personal info → Phone number | Her mobile number | Required | Account management, App functionality, Developer communications (updates, only if she says yes) |
| Personal info → Other info | Her year of birth (the 18+ check); how she heard of Sakhi (optional) | Required | Account management, Analytics |
| Health and fitness → Health info | Only the diary parts she ticks when she asks Qura to call her; and, through Firebase Analytics, screen names that can show her stage (the safer reading) | Optional | App functionality, Analytics |
| Messages → Other in-app messages | What she writes to Qura's care team (up to 120 characters) | Optional | App functionality |
| App activity → App interactions | The last day she opened Sakhi (required); through Firebase Analytics, the screens she opens, how long she stays and where she taps (she can turn this off) | Required | Analytics |
| App info and performance → Diagnostics | Through Firebase Analytics, when something on a screen fails, without its message | Optional | Analytics |
| Device or other IDs → Device or other IDs | Through Firebase Analytics, a random ID for the app on the phone (the app instance ID), not linked to her account; off deletes it | Optional | Analytics |

**Not collected:** leave all of these unticked.
- Precise location; financial info.
- Photos, videos, audio, files and documents: the reports vault and voice typing stay on the phone.
- Calendar, contacts, SMS, emails, web browsing, installed apps, search history.
- Crash logs: Sakhi has no crash reporting (a screen's errors are Diagnostics, above).
- The advertising ID: Sakhi doesn't read it, and Firebase is set never to collect it (the AD_ID permission is removed from the app).

### The health apps declaration (App content → Health apps)

**Tick these**, each with what in Sakhi it covers:

| Group | Category | What in Sakhi |
|---|---|---|
| Health and fitness | Period Tracking | The diary, predictions and fertile days |
| Health and fitness | Activity and Fitness | Walks, yoga and strength in her plan |
| Health and fitness | Nutrition and Weight Management | Food habits, the plate, the PMOS plan's weight goal |
| Health and fitness | Sleep Management | Wind down, the sleep sounds, the bedtime step |
| Health and fitness | Stress Management, Relaxation, Mental Acuity | Slow breaths, Bhramari, yoga nidra |
| Medical | Reproductive and Sexual Health | Trying for a baby, pregnancy, after the birth, contraception, sexual health learning |
| Medical | Diseases and Conditions Management | The PMOS plan, anaemia and iron, midlife and menopause |
| Medical | Medication and Treatment Management | Iron and folic acid tablet reminders, medicine reminders |
| Medical | Healthcare Services and Management | "Ask Qura to call me", the report for her doctor, the "See a doctor" page (her own doctor's number, eSanjeevani), Care near me, reports kept on the phone |
| Medical | Medical Reference and Education | The Learn library and quick answers, plus the symptom guides: Google counts symptom checkers here |
| Medical | Emergency and First Aid | Danger signs, "Go to the nearest hospital now" with the ambulance (108, or 102 in pregnancy), Help and safety |
| Medical | Mental and Behavioral Health | The mood check after a birth, and low mood as a sign in her diary |
| Medical | Physical Therapy and Rehabilitation | Pelvic floor exercises in pregnancy and after the birth |
| Medical | Disease Prevention and Public Health | Free check-ups and pregnancy schemes for a woman who uses government care, screening after 30, the HPV vaccine, Care near me and eSanjeevani |

Ticking a borderline category is safer than leaving out something the reviewer finds.

**Don't tick:**
- Clinical Decision Support: it's for healthcare professionals.
- Research studies, clinical trials and patient communities.
- Medical Device Apps, unless your lawyer says Sakhi is a regulated device (decision 5 above).

### On the same visit

- **Privacy policy** (App content): https://quranutrition.com/sakhi/privacy
- **App access:** the reviewer's number and code, from `server/DEPLOY.md`, section 3, step 5.
- **Ads:** No.
- **Target audience:** 18 and over. The diary refuses anyone younger. In a Play build she sees only the safety guide, with no Learn
  pages and no tab bar (Version 39.81, from the bundle after vc 142).
- **The store description:** Play's health apps policy wants its own disclaimer wording, and apps that mention government services
  must say they aren't affiliated with a government (launch QA A3, 7 Nov). Put both paragraphs at the end of the full description:

  > Qura Sakhi gives general health information and self-care support. It is not a medical device and does not diagnose, treat,
  > cure, or prevent any medical condition. For a health problem, see a doctor. In an emergency, go to the nearest hospital now
  > (ambulance: 108).
  >
  > Qura Sakhi is not affiliated with any government. Its information on government health services comes from the official
  > sources, such as data.gov.in and eSanjeevani.

  In the listing, never use the national emblem or the word "official" about Sakhi itself.
