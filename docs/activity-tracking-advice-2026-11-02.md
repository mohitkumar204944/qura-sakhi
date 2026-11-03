# How to track user activity on Sakhi: advice

Written 2 Nov 2026 for Mohit ("can you research and advise how i can track user activity on sakhi app"). Advice only; nothing
is built.

## 0. The short answer

Don't add an analytics SDK: no Firebase or Google Analytics, Mixpanel, Amplitude, CleverTap, MoEngage, PostHog, and above all
no Microsoft Clarity or any other session recording. Track activity in four layers that run on Sakhi's own free Supabase project
and keep the promise "your diary never leaves this phone":

| Layer | What it tells you | Who | Status |
|---|---|---|---|
| 1. Accounts | Signups, who opens Sakhi and when, retention, version, language, state, how she heard, doctor-call requests | Every woman, per account | **Live now.** Only needs saved queries |
| 2. What helps | Which tools get used and how often, plan follow-through | Opt-in phones, anonymous monthly totals | **Built, but no build can turn it on** (section 3) |
| 3. Errors | Which screens break, on which version | Every phone, anonymous | Not built (SERVER_SPEC 10.2) |
| 4. Pilot summary | The full picture for the field test, with each woman's consent | Pilot women, read in person | Not built |

Google Play Console adds installs, uninstalls and crashes for free once Sakhi is on Play (section 6).

## 1. Why not an analytics SDK

- **Flo.** Flo sent "custom app events" (for example, when a woman picked her last period date or cycle length) through
  Facebook's, Google's and Flurry's analytics SDKs. In August 2025 a US jury found Meta liable for collecting that data; Flo,
  Google and Flurry settled before the verdict. Sakhi's screen names are health data: "plan-pmos", "preg-week", "loss".
  Any event stream that names a screen tells a third party her condition.
- **Sakhi's own promises.** The privacy notice says "No ads and no ad companies". SERVER_SPEC section 1 says no third-party
  tracker and no health screen tied to her account. CLAUDE.md says never send health data to Meta.
- **The APK already blocks it.** The Content-Security-Policy in `android/build-apk.sh` lets the page reach only Sakhi's own
  server (`connect-src`), so an SDK's calls would fail unless that guard is loosened. Keep it.
- **Session recordings** (Clarity, Hotjar, Smartlook, UXCam) film the screen: her diary, her notes, her sex log. Clarity is fine
  on Qura's website and must never be on Sakhi. The Play page draft (`docs/play-store-pages-2026-10-29.md`) already promises
  none of them.
- **Privacy-first services** (PostHog, Aptabase, TelemetryDeck) are better, but each is one more processor to name in the
  notice, a CSP change, and a free tier sized for small apps (Aptabase's is about 20,000 events a month). Sakhi's server already
  does allowlisted anonymous counts for ₹0, so they add nothing yet.

## 2. Layer 1: accounts (live now, no code)

The `sakhi` tables already hold per-account activity that has nothing to do with health, and the notice already tells her
(notice line 5: "It also notes the last day you opened Sakhi and the app version").

- **Active women:** today, last 7 days, last 30 days (SERVER_SPEC section 7, first query).
- **Retention:** of the women who signed up in a week, how many still open Sakhi 1, 4 and 12 weeks later (section 7, second
  query).
- **Who and where:** signups by language, how she heard and state (section 7, third query).
- **Daily totals:** `daily_stats`: signups, active women, WhatsApp and SMS codes sent per day. Codes sent against signups gives
  the signup funnel's drop.
- **Doctor calls:** `call_requests`: "Ask Qura to call me" requests a week. This is the one number that links Sakhi to Qura's
  business.

**Do now:** save those queries in Sakhi's Supabase SQL editor (project `qura-sakhi`) and look once a week. (This session's
Supabase connector only sees Qura's project, so I couldn't pull the numbers.)

**One small server change worth making:** `last_active_on` keeps only her latest day, so you can't tell a woman who opens Sakhi
daily from one who opened it twice. Add an `active_days` counter to `accounts`, increased by `POST /v1/me/active` when the day
changes. It's a server-only change with no app update. Have counsel check that notice line 5 covers it ("the days you open
Sakhi" rather than "the last day").

## 3. Layer 2: "What helps" (built, but switched off everywhere)

Version 30's monthly counts (SERVER_SPEC 5.9, MODULE_API section 32) are the right design: opt-in, no account token, buckets of
1, 2–5 or 6+ days, and only monthly totals kept. The server route has been live since 23 Oct. Three gaps keep it from working:

1. **No build can turn it on.** The switch shows only when `CFG.usage` is set, and `android/build-apk.sh` never writes `usage`
   into `config.js`. So every pilot, test and Play build hides it. It needs a `SAKHI_USAGE=1` variable in the build.
2. **Its tool list is from 22 Oct.** `USAGE_KEYS` (`web/app.js`) and `USAGE_TOOLS` (`server/.../api.js`) predate My plan, every
   version 2 plan, Wind down (`calm`), Moves and calm, My food (`food`), the weekly chapters (`mid-lesson`, `per-lesson`,
   `ttc-lesson`) and the late-pregnancy pages. Today most of what a woman does would not be counted. Refresh both lists together.
   Keep loss, abortion, safety and the sex log out.
3. **It can't see the plan, Sakhi's core job.** Add three keys that don't name the plan or her condition: days she ticked at
   least one step (`plan-step`), days she finished every step (`plan-all`), and evening check-ins (`plan-checkin`). For these,
   a `6+` bucket hides the difference between 6 and 30 days, so add a `15+` bucket on both ends.

**Before turning it on:** the privacy notice must name this flow (open decision 8 in SERVER_SPEC section 11, with counsel), and
the Play Data safety answer for "App activity → App interactions" already says "with her switch on, the monthly tool counts".

**What to expect:** because it's opt-in and off by default, only a minority of women will report. Read it as a direction (which
tools matter, whether plans are followed), not a census. The first numbers arrive a month after the build ships.

## 4. Layer 3: errors (anonymous, every phone)

Play's Android vitals sees only native crashes. It never sees a JavaScript error inside the WebView, which is where all of
Sakhi runs. The app already catches a screen that fails to draw (the `data-crash` card, `web/app.js` line 1146) and then
forgets it.

Build SERVER_SPEC 10.2's crash reports as a small `POST /v1/errors`, the same shape as `/v1/usage`:
- no account token; app version, Android version, the route's family (not a condition's name), the error's type and the
  file and line it came from;
- never the error's message text, which can carry her own words;
- one report per error per day, rate-limited like `/v1/usage`, kept as daily totals.

Update the Play draft's line "Sakhi has no crash reporting" and the notice. This is the cheapest way to learn where real women
get stuck.

## 5. Layer 4: the pilot summary (for the field test)

For a pilot of known women who sign a consent form, the server layers are too thin and too slow. The best activity data comes
from her own phone, read with her there:

- Me → Privacy → "Pilot summary" (pilot builds only, behind her PIN): days she opened Sakhi, days with a plan step, check-ins,
  her plan week, the tools she used with day counts, and her first-day tour finished or skipped. It contains no dates, notes or
  symptoms.
- She sees every line, then shows a **QR code** that the field-test coordinator scans into a sheet. Nothing goes to a server
  and nothing goes through WhatsApp (Meta).
- Pair it with the coordinator's interview and the tap counts in `web/test/taps/`. The numbers say what she did; the interview
  says why.

It needs a small QR library (for example `qrcode-generator`, MIT). That's a download, so ask Mohit first. If the results will be
published, ask counsel whether an ethics committee review is needed.

## 6. Google Play Console (free, once Sakhi is on Play)

Statistics (new users, user loss, 1, 7 and 30-day retention) and Android vitals (crash and ANR rates) come from Google's own
reporting, with no SDK in the app. Pilot APKs are installed outside Play, so none of this exists until the Play listing is up.
Third-party guides say acquisition numbers are noisy below about 50 installs.

## 7. The law, briefly (check with counsel)

- India's DPDP Rules were notified on 13–14 Nov 2025. Their consent, notice, security and rights duties apply 18 months later,
  around May 2027. Commentary agrees that data which truly can't be traced back to a woman is outside the Act, and that
  pseudonymous data (a hashed ID, say) is not.
- Layer 1 is personal data. It's already covered by notice line 5 and the account's purpose.
- Layers 2 and 3 are designed to be anonymous: no token, buckets, totals only, and the IP kept only as a daily HMAC for the rate
  limit. Counsel should confirm that reading, and the notice should still name them.
- The DPDP Act has no special category for health data the way the GDPR does, but Sakhi's own rule is stricter, and the Flo
  case shows why.

## 8. Suggested order

| Step | Work | Needs |
|---|---|---|
| 1 | Save the section 7 queries; weekly look | Mohit, 10 minutes |
| 2 | `active_days` on the server | One server deploy (Mohit runs it); counsel on notice line 5 |
| 3 | `/v1/errors` and the app's report | One app version and a deploy; notice and Play draft lines |
| 4 | Refresh "What helps", add the plan keys and `15+`, add `SAKHI_USAGE` | Counsel's notice line first (open decision 8) |
| 5 | Pilot summary with QR | Before the field test; the QR library download; the pilot consent form |

None of these adds a step, card or question to her day. The only new things she sees are the existing opt-in switch and, in
pilot builds, the summary behind her PIN. No new spend.

## 9. Something like Microsoft Clarity (added 2 Nov)

Mohit, 2 Nov: "i meant something like microsoft clarity which can help me to track user activity on app".

### Clarity itself: no

- **Its own terms rule Sakhi out.** Clarity's Terms of Use bar using it "in connection with content which may contain sensitive
  user materials, such as health care". They also bar sending Microsoft sensitive data, and their definition of sensitive data
  includes health. Masking doesn't change this, because the clause is about the content the app holds.
- **It would work technically.** Clarity has an Android SDK that can record WebViews (a capture toggle), with masking modes;
  input boxes are always masked. The recordings would still go to Microsoft's servers.
- **Sakhi has promised it won't.** The Play page draft lists Clarity among the things Sakhi doesn't use, and the notice promises
  that her entries never go to anyone else.
- **Other cloud recorders** (UXCam, Smartlook, LogRocket, Hotjar, PostHog's cloud) raise the same issue: screens from a health
  app stored on another company's servers. Each would need its terms checked, counsel's sign-off and a line in the notice.

### What gives the same insight, the Sakhi way

**A. Recorded sessions for the field test (now, no code).** The coordinator sits with a pilot woman who has given her written
yes, turns on Android's own screen recorder, and asks her to do 3 or 4 everyday jobs while she thinks aloud: log her period,
do today's steps, find help. Five women usually show most of the problems. The recordings stay on the coordinator's laptop and
are deleted after review. This is Clarity's recordings with the reason behind each tap, which Clarity can't give.

**B. Sakhi's own tap map (pilot opt-in).** This gives most of Clarity's dashboard (heatmaps, rage taps, dead taps, where she
gives up) without any picture of the screen.
- For each tap, the phone notes the screen's family, which button (its `data-go` or id, never its words), where on the screen
  (as a % of width and height) and how long after the screen opened.
- It also notes rage taps (3 or more taps within a second in one spot), dead taps (a tap on nothing that responds) and the
  screen she left the app from.
- It keeps no words, numbers or dates. It's sent once a day in one small batch with a random pilot ID that isn't her account.
  Private pages (loss, abortion, intimate health, the sex log, safety, PIN screens) aren't counted.
- A private page in this repo draws the heatmap for each screen.

**C. Masked replays (pilot opt-in, only if A and B leave questions).**
- [rrweb](https://github.com/rrweb-io/rrweb) (MIT, the open-source library many replay tools are built on) records the page's
  structure, not a video.
- On the phone, before anything leaves, every word and number becomes a grey block, and images and drawings are blocked.
- Private pages are never recorded, and recording stops on a shared phone or in discreet mode.
- Recordings go to Sakhi's own Supabase Storage (1 GB on the free plan; check supabase.com/pricing), compressed and on Wi-Fi
  only where the phone reports it. They're deleted automatically after 30 days.
- Mohit watches them in a private player page (rrweb-player) on his Mac.
- It needs the rrweb download (ask first), the consent form, counsel's notice line, a Play Data safety line, and checks in
  `test/privacy.mjs` that no text leaves the phone.

**Recommendation:** A now. B before the field test: it gives most of Clarity's value for a small part of the risk. C only if
A and B leave questions. B and C are for consenting pilot women only. After launch, every woman gets only sections 2 to 4.

## 10. How similar apps track (added 2 Nov)

Mohit, 2 Nov: "how do other similar apps currently track". Principle-level notes from public studies, not a walkthrough.

**Mozilla's July 2026 test of six period trackers** (it watched each app's network traffic with a proxy):

| App | Score | What it sends, and to whom |
|---|---|---|
| Euki | 10/10 | Nothing from its own features. Data stays on the phone and no account is needed. |
| Clue | 8/10 | Separate yes or no choices for research, analytics, recommendations and advertising, changeable later. No broad sharing of health records seen. |
| Flo | 7/10 | AppsFlyer (which ad brought her), Moloco (ads) and Google Firebase (analytics). Saying no to analytics and ads cut most of it. "Anonymous Mode" stops AppsFlyer and hides her IP behind a Cloudflare relay. No health data seen going out. |
| Period Calendar | 6/10 | Ad-funded: Google AdMob, DoubleClick and InMobi get device details at first launch, and the app's name alone tells them she tracks her period. |
| Spot On | 5/10 | Clean in its core features; trackers load in its built-in browser and chatbot. |
| Stardust | 2/10 | RudderStack (analytics), AppsFlyer and Facebook from launch; birth control and symptoms went to RudderStack with a lasting user ID. |

**India.** In 2019 Privacy International found that Maya (Plackal, Bengaluru) told Facebook when a woman opened the app, before
she had agreed to its privacy policy. Maya then removed Facebook's SDKs. The free PCOS Exercise app that Mohit tried on 29 Oct
carried ads and a Firebase backup. Ad-funded free apps are the common Indian pattern.

**Apple's Cycle Tracking** keeps the data on the phone. In iCloud it's encrypted so that Apple can't read it.

**Three patterns:**
1. **Funded apps (Flo, Clue, Stardust):** a full stack. Analytics (Firebase, Amplitude, RudderStack) records every screen and
   tap, AppsFlyer measures ads, and some use Meta's SDK. Since the Flo case, the better ones put each purpose behind its own
   switch and offer an anonymous mode.
2. **Ad-funded free apps (Period Calendar, most Indian trackers):** ad SDKs that send device details at launch, often before
   any consent.
3. **Privacy-first (Euki, Apple, Drip):** no outside analytics. They learn from research, reviews and, at most, opt-in totals.

**Where Sakhi stands:** in pattern 3, plus an account that knows only who she is and the last day she opened Sakhi. That's a
real strength to say out loud on the Play page and Qura's /sakhi page. Mozilla's top score went to the app that sends nothing.

**What's worth borrowing:**
- **Clue's separate switches.** Sakhi's "What helps" switch already works this way; keep any future purpose (research, the
  pilot) on a switch of its own.
- **What AppsFlyer does for Flo, without AppsFlyer.** To learn which ad or link brought her, use Google's Play Install Referrer
  library. It reads the `utm_` tags of the Play link she installed from, on the phone, from the Play Store app, with no
  third-party server. Sakhi could send that once with her signup, beside `heard`. It needs one allowlisted field on the server
  and a line in the notice. It's worth it once Qura runs ads to the Play listing.

## 11. The roadmap measure (added 2 Nov)

Mohit, 2 Nov: "my goal is to find what users like and spend time more on and then this will define our future roadmap".

### The five questions and what answers each

| Question | Measure | Source |
|---|---|---|
| What does she use? | Days a month each tool is used | "What helps", refreshed (section 3) |
| What does she spend time on? | Minutes a month on each tool | New: a clock per tool on the phone |
| What keeps her coming back? | The tools used by women who open Sakhi on 15+ days, against those on 1–5 | New: the days she opened Sakhi, in the same report |
| What does she like? | Finished (a routine, a Wind down session, an article to the end) and "What helped most?" at the end of her 12 weeks | New: finish counts, and one question on the plan's end page |
| What's missing? | Searches that found nothing; what women ask Qura's doctors about | A count for everyone; the words only in the pilot (section 5); the call topics in Qura's leads, read by Qura's team |

Today Sakhi measures none of these: there is no clock, no finish count and no feedback anywhere, and the monthly counts are
switched off in every build.

### "What helps", version 2

One report a month, as now: opt-in, no account, no IP kept, buckets only, totals only.

```json
{ "month": "2026-11", "opened": "15+", "since": "2-3",
  "tools": { "moves": { "d": "6-14", "m": "15-60", "f": "2-5" }, "calm": { "d": "2-5", "m": "5-15", "f": "1" } },
  "plan": { "step": "15+", "all": "6-14", "checkin": "6-14" }, "nofind": "2-5", "helped": "moves" }
```

- `opened`: the days she opened Sakhi this month (`1`, `2-5`, `6-14`, `15+`). `since`: months since she joined (`1`, `2-3`, `4-6`,
  `7+`).
- For each tool: `d` days, `m` minutes (`<1`, `1-5`, `5-15`, `15-60`, `60+`), `f` times finished (`0`, `1`, `2-5`, `6+`).
- The clock counts only while the screen is in front of her. It stops after 60 seconds without a tap or scroll, except while
  Wind down or the moves player is playing.
- `plan`: the three keys from section 3, which don't name the plan. `nofind`: searches with no result. `helped`: her answer on
  the plan's end page, only in that month.
- Server: totals per month, `opened`, `since`, tool, measure and bucket, so "what keeps them" can be read without a row per
  phone. Modules report through core (`S.` calls); only core's `net()` sends.
- The list leaves out loss, abortion, intimate health, the sex log and safety, as now.

### Getting enough phones

A switch hidden in Me → Privacy will report from very few women, and those few are the keenest, so the picture leans their
way. Three choices, all Mohit's:
1. **Ask once (recommended):** one row on Today after her first 7 days: "Help shape Sakhi? It sends how many days and minutes
   you use each tool, never your diary." Yes or Not now, never asked again, changeable in Me. It's a new card under the minimalist
   baseline; its reason is that without it the counts are too thin to steer the roadmap.
2. Keep the switch in Me only: few phones.
3. On by default with a switch to turn it off: the most data, but it goes against what the most private apps do (Clue, Flo
   and Euki all ask first) and against Sakhi's promise.

For the field test, every pilot woman who signs the consent form has it on, so the pilot cohort gives complete numbers from day 1.

### Reading it each month

One table per tool:
- **Reach:** the share of reporting phones that used it.
- **Depth:** days and minutes.
- **Stickiness:** its use among 15+ day women against 1–5 day women.
- **Finish:** how often it's finished.
- **Demand:** searches that found nothing, call topics and "helped most".

Then sort each tool into three: **grow it** (used, finished and sticky), **fix it** (opened but not finished) or **fold it**
(rarely used and not missed). Start with saved queries in Supabase; build a private page later if needed. Pair it with five
short conversations a month with pilot women and the Play reviews: the numbers say what, the conversations say why.

### What it needs

- One app version (the clock, the finish counts, the ask, the end-page question, the refreshed list, `SAKHI_USAGE` in the build)
  and the server's version 2 route with its migration (Mohit deploys).
- Counsel's line in the privacy notice (open decision 8) and the Play Data safety answer for "App interactions".
- UI words in English and Hindi; no health wording, so no doctor review.

## 12. What it will tell you (added 3 Nov)

Mohit, 3 Nov: "what insights this tracking will generate". The examples below are invented, only to show the kind of finding
and the decision it leads to.

| Insight | Example finding (invented) | The roadmap decision it informs |
|---|---|---|
| What gets used | Diary on 70% of phones, a plan step on 40%, Wind down on 15%, the labour timer on 2% | Where build time goes; what to leave alone |
| Where time goes | Wind down: few women, but 15–60 minutes each. The weekly chapters: opened, but under a minute | Put Wind down on Today for the sleep goal; try the chapters as voice or pictures |
| What brings her back | My food is used by twice the share of women who open Sakhi on 15+ days as of those on 1–5 days | Lead joining and Today with the habit that daily users share (a link, not proof that it causes the habit) |
| What she finishes | Strength: started by 30%, finished by 10%. Cycle care yoga finished by most who start it | A 5-minute strength version; keep yoga as it is |
| Plan follow-through | Most women tick one step on 6–14 days, but few finish every step | Test whether 4 steps a day is too many |
| When plans fade | Plan steps fall between month 1 and months 2–3 | Where welcome-back and the 4-week check need work |
| What helped most | At week 12, "Moves" comes first for PMOS and "food" for iron | Which part of each plan to grow in its next version |
| What's missing | 8% of searches find nothing; in the pilot the words are about white discharge and hair fall | New Learn pages and quick answers (reproductive health only) |
| Who stays (accounts) | Week-4 retention is 35% in Hindi and 50% in English; women who heard from a doctor stay longest | Fix the Hindi experience; put outreach where women stay |
| Where it breaks (errors) | The moves player fails on one Android version | Fix list before features |
| Doctor demand | Call requests per 100 active women, and their topics in Qura's leads | Which plans need a doctor step, and the doctor hand-off's value to Qura |

**What it won't tell you:**
- **Why.** Only the conversations with pilot women tell you that.
- **Her path through a session,** or the exact screen where she gives up. Monthly totals can't show this; the pilot's tap map
  (section 9 B) can.
- **Health results.** The diary stays on her phone; only "What helped most?" comes back.
- **Anything about one woman.** That's by design.
- **Before and after a release, or Hindi against English, in the usage report.** Version 30 left out the app version and
  language on purpose. Adding them back is Mohit's call: they sharpen those comparisons and make a report slightly less
  anonymous.
- **Fine differences early on.** With few reports, read only the big gaps, and remember that opt-in leans towards keen users.

## 13. Tracking the gaps too (added 3 Nov)

Mohit, 3 Nov: "i need to track these also What it won't tell you its important to optimise app further".

| Gap | How to track it | How private | Needs |
|---|---|---|---|
| **Why** | One-tap reasons at three moments. Leaving a routine or Wind down before the end: "Too long / Too hard / Interrupted / Not for me", once per tool. A step skipped 3 days running: "Not today / Too hard / Don't need it", once per step. The plan's end page: "What would you change?" (tiles). All counted in the monthly report. Plus pilot conversations and Play reviews | Anonymous, with the switch on | Each asks once and can be ignored (minimalist baseline) |
| **Her path, and where she gives up** | The phone counts screen-to-screen moves and the last screen before she left the app, and sends totals, never one visit's sequence. Joining: the furthest step she reached, as a number, on her account (never her answers). Pilot: the tap map with each visit's path (section 9 B) | Report anonymous; the joining step is on her account but holds no health data; pilot with consent | `setup_step` on the server; a notice line |
| **Health results** | On the plan's end page and month summaries, "Share this result to help improve Sakhi?", asked each time. The plan's own measure goes as fewer, same or more (pain days, leaks, heavy days, hot flushes, sleep), anonymously. Never on a shared phone or in discreet mode, never loss, abortion or the sex log. Pilot: the coordinator notes results from her summary at weeks 1, 4 and 12 | Her yes each time; anonymous; coarse | **Changes the rule "the diary never leaves the phone"**: a summary of a result would leave, with her yes. Mohit decides, then counsel, then CLAUDE.md and the notice |
| **One woman's journey** | Pilot: a participant code (P-017), never her number; the coordinator's sheet holds her summaries from each visit. After launch, an optional "Research panel" switch (Clue's model): a random panel ID, never her account, on her monthly reports, so one phone's months link up | Pilot: research consent. Panel: its own opt-in; pseudonymous, so the DPDP Act applies | Counsel; an ethics committee if results are published |
| **Before and after a release, Hindi and English** | App version and language in the report. The accounts table already holds both, for retention | Anonymous | Server allowlist |
| **Fine differences** | (1) More phones: ask once after week 1, and every pilot woman on. (2) Correct the lean: weight the reports by `opened` to match all women's active days in the accounts table. (3) Experiments: the phone picks A or B at random for a screen change (3 or 4 steps on day 1, say), the report carries the variant, and the two are compared. No experiment touches a safety line; plan content waits for the doctor | Anonymous | An `exp` field and that rule |

**Two of these change Sakhi's promises,** so they're Mohit's decisions:
- **Results leaving the phone.** Recommendation: yes, as above. "Does the plan work?" is the most valuable answer Sakhi can
  have, and a coarse, anonymous result shared with her yes each time keeps the promise's spirit.
- **Following one woman.** Recommendation: the pilot only for now. Decide on the research panel after counsel, and never tie
  any of it to her account or number.

Either way, the privacy notice and the Play Data safety answers change (the results would be declared as health info).

**Order:** version, language, the reasons, the screen-to-screen counts and experiments go into the same version 2 report.
Results and the panel follow Mohit's decision and counsel.

## 14. Clarity, asked again: the options side by side (added 3 Nov)

Mohit, 3 Nov: "cant we use something like microsoft clarity it is highly recommended".

Clarity is recommended for websites, and it's good at that. Inside Sakhi, its own terms (section 9) rule it out. Masking
doesn't change that, because the clause is about the app's content. Using it anyway risks Microsoft closing the project, and it
contradicts Sakhi's privacy notice and the Play page draft.

**Where Clarity fits:** Sakhi's download page on Qura's website, which is marketing, not her health data. Qura already runs
Clarity, so the install funnel (who reaches the page, scrolls, taps Download) can be watched there today. That's Qura's repo,
not this one.

**Clarity's experience inside the app, three ways:**

| Option | What you get | Cost | Where the data goes | Fit |
|---|---|---|---|---|
| **Sakhi's own** (rrweb recordings with text masked, plus the tap map; section 9 B and C) | Recordings, heatmaps, rage and dead taps, exit screens; a private viewer page we build | ₹0 (Supabase free tier) | Sakhi's own Supabase, Mumbai | Best fit; more build work |
| PostHog Cloud | Closest to Clarity, plus funnels, experiments and surveys; 5,000 web recordings a month free | Free, but its HIPAA agreement needs the $250 a month Boost add-on | PostHog's US or EU servers | A third party holding a health app's screens; notice, consent, CSP change, counsel |
| OpenReplay, self-hosted | A Clarity-like dashboard, open source (AGPL) | A server to rent and run | Your own server | Breaks "no new spend"; you run the operations |

**Recommendation:** Sakhi's own, pilot women first with consent. After the pilot, extend it to women who say yes, recording a
sample of visits and keeping them for 30 days, so the free tier's 1 GB lasts. It needs the rrweb download (MIT), which needs
Mohit's yes.

## 15. A ready-to-use free tool (added 3 Nov)

Mohit, 3 Nov: "if we build ours what is a way to collect insights without putting too much burden on server", then "do
further research and find me a ready to use free solution that fits my needs".

**His needs:** Clarity-style recordings, heatmaps and rage taps; what she uses and for how long; where she gives up; why;
experiments; errors. It must work in Sakhi's WebView (vanilla JS), be free, put no load on Sakhi's server, and suit a health app.

| Tool | Free tier | Recordings | Funnels, paths, retention | Surveys ("why") | Experiments | Errors | Load on Sakhi | Fit |
|---|---|---|---|---|---|---|---|---|
| **PostHog Cloud EU** | 1M events, 5,000 web recordings, 1,500 survey answers, 1M flag requests, 100k errors a month; 1 year kept; no card; 1 project | Yes, plus rage and dead clicks | Yes | Yes | Yes | Yes | None | **Every need, ready to use** |
| Microsoft Clarity | Free | Yes | Partly | No | No | Partly | None | Its terms bar health care |
| Umami Cloud | 10k–100k events (sources disagree) | No | Funnels | No | No | No | None | Too little |
| Countly Lite | Free, self-hosted | No | No retention or heatmaps in Lite | No | No | Crashes | Your server | Too little |
| OpenReplay, OpenPanel, PostHog self-hosted | Free software | OpenReplay and PostHog | Yes | PostHog | PostHog | Partly | You run a server | Not ready to use; server cost |

**Recommendation: PostHog Cloud, EU region (Frankfurt), free plan, set up privacy-first.** PostHog's own guidance for health
data without its paid BAA is to strip out anything that identifies a person or her health. HIPAA is US law, but the same setup
suits Sakhi's promise:
- **Opt-in only:** capturing is off by default and turns on only with her yes (the pilot consent form, then the ask after week 1).
- **Anonymous:** never `identify()` her, so PostHog never gets her number, name or account; no person profiles; IP capture off
  (the default for new EU projects).
- **Recordings with every word masked** (`maskAllText`, `maskAllInputs`), and images, drawings and the 3D figure blocked.
- **Private screens never captured:** loss, abortion, intimate health, the sex log, safety, notes, PIN screens. Shared phone and
  discreet mode: off.
- **Screen names on an allowlist:** neutral names for screens that would show her condition.
- **No remote code:** the full posthog-js bundle ships inside the APK, so the CSP adds only PostHog's EU address to `connect-src`,
  never to `script-src`.
- **Health results never go to PostHog;** if Mohit approves them (section 13), they use Sakhi's own anonymous report.

**What it replaces:** most of sections 9, 11 and 13 (the tap map, recordings, the clock, reasons, paths, experiments, errors).
Sakhi's own server keeps the accounts layer (section 2), so the load on it barely changes.

**Caveats, checked before any build:**
1. **A one-hour test on the Flip5:** posthog-js inside Sakhi's `file://` WebView (storage, recordings with Sakhi's styles,
   surveys). Nothing found confirms or rules this out.
2. **The heatmap overlay** loads the page from a web address, which an app page doesn't have. Rage and dead taps still show as
   numbers and in recordings. A hosted copy of the screens could fix this later.
3. **The free plan's limits:** 5,000 recordings a month (record a sample once past the pilot). For events, at roughly 30 a day
   per woman (a rough guess), 1M events covers about 1,000 opted-in women a day.

**What Mohit decides:**
- Changing the rule "Only core `net()` talks to a server" to allow PostHog's SDK as set up above.
- Naming PostHog (EU) in the privacy notice as a processor, and signing its DPA (check that the free plan offers it).
- The Play Data safety answers (app interactions, diagnostics: collected, optional, not shared).
- The posthog-js download (MIT) and a free PostHog account in Qura's name.

## 16. The Flip5 test (3 Nov)

Mohit, 3 Nov: "yes start with the flip5 test", then "done".

**How it ran:**
- posthog-js 1.444.4 (`array.full.no-external.js`, licence Apache-2.0 and MIT) went into a separate test app,
  `com.quranutrition.sakhi.phtest` ("Sakhi PH test"). It was built in the scratchpad from a copy of `web/` and `android/`;
  nothing in the repo changed.
- Everything it sent went to a catcher on the Mac (`adb reverse`), which answered like PostHog with recordings, heatmaps, dead
  clicks and errors on. Nothing went to PostHog.
- Mohit used it for about 8 minutes: joining with a made-up number, Today, Diary, a routine left early, Wind down, search, and a
  rage tap.
- The test app was then uninstalled. His Sakhi wasn't touched.

**It works in Sakhi's WebView.** The library ran from `file://` under Sakhi's CSP with no console or CSP errors. It loaded its
settings and sent 164 requests (about 1.4 MB: 0.5 MB of events, 1 MB of recording):
- 19 screen views, each with the time spent on the screen before;
- 87 taps, 56 heatmap batches, 2 dead taps, 1 dead swipe and 1 rage tap (on the relief routine);
- no errors.

**What was private, and what leaked:**

| Part | Result |
|---|---|
| Visible text and inputs | Masked everywhere (`**** *****`); no number, code, health word or Hindi in events or recordings |
| Taps (autocapture) | Only the element's place in the page (`button:nth-child…`): no label, class or id. Private, but it doesn't say which button |
| Screen names | Neutral names worked where the setup set them, but the real route leaked in `$session_entry_url` and as the **keys** of `$heatmap_data` (`#per-lesson`, `#relief-cramps`, `#report-show`) |
| **Recordings** | **Element attributes go out unmasked:** `data-ob-st="pmos"`, `data-ob-goal="pain"` (her joining answers), `data-ask="Severe period pain"` (her doctor topic), `class="… bleed"` on calendar days (her bleeding days), `aria-label="Mark done: Move 15 minutes today"`, `data-go="relief-cramps"`, a placeholder about periods |
| Recordings' look | `app.css` and `fonts.css` were recorded as `file://` links, which PostHog's player can't load, so replays would be unstyled |
| Private pages | Not exercised (the search didn't open the loss page). The filter they rely on (`before_send`) ran on every event type: views, taps, heatmaps, recordings |

**Fixes and what they cost:**
- **Events (easy, proven reachable):** in `before_send`, also rewrite `$session_entry_url` and `$session_entry_pathname`, and the
  keys of `$heatmap_data`. That's about 10 lines.
- **Recordings (hard):** turn off their compression (`session_recording.compress_events: false`) so `before_send` can scrub
  them; scrub every attribute against an allowlist (labels, `data-*`, placeholders, ids and class words); put `app.css` inline
  so the replay has styles; and add a privacy test that fails on any unmasked attribute. Each new version's `data-*` attributes
  would be a fresh risk, so this is fragile.

**Volume:**
- About 22 events a minute with taps captured, or about 10 without (taps tell little when they're anonymous).
- At 3 minutes a day per woman, 1M free events a month covers roughly 500 opted-in women a day with taps on, or 1,100 without.
- Each 8-minute session was one recording of about 1 MB.

**Recommendation after the test:**
- Use PostHog Cloud EU for **events only, recordings off:** screens with neutral names, time on each screen, funnels, paths,
  retention, rage and dead taps per screen, surveys, experiments and errors, with the event fixes above.
- The watching side stays with the coordinator's recorded sessions in the pilot (section 9 A).
- Revisit recordings only with the allowlist scrubber and its privacy test.
- Heatmap pictures would need the screens at a web address (section 15); rage and dead taps still count per screen.

## 17. Built: Version 39.60, "Share how I use Sakhi" (3 Nov)

Mohit, 3 Nov: "yes proceed, i'll create the posthog account". Contract: MODULE_API section 103. Test: `node test/posthog.mjs`
(38 checks). Not committed. (A parallel session took 39.59 for "a calmer Today", so this is 39.60.)

**What's built:**
- **Core block in `web/app.js`:** a switch in Me > Privacy under "Help improve Sakhi", off until she turns it on and shown only in a
  build with `SAKHI_PH`.
  - posthog-js loads from `web/vendor/` only after she turns it on.
  - It sends screen views under neutral names, with the time on the screen before; taps as tag and position; rage and dead taps;
    and errors as type and file only, including those Sakhi's `safe()` catches.
  - Never sent: recordings, heatmaps, surveys, flags, remote settings, identify(), the referrer or the IP.
- **Section 16's leaks are closed.** `get_current_url` and `phKeep` give every event the neutral address, every property passes
  an allowlist, and `$elements_chain` is rebuilt from tags and positions.
- **Off forgets the anonymous id** (`opt_out_persistence_by_default`, then the `ph_` keys are removed); on again starts a new one.
  Discreet mode, a shared phone, the lock, private screens and a sample woman send nothing.
- **`android/build-apk.sh`:** `SAKHI_PH=phc_...` adds the key, `phHost`, `vendor/posthog.js` with its licence, and
  `https://eu.i.posthog.com` to `connect-src`. Without it, nothing changes. A key in the wrong form stops the build.
- **The test** runs against a fake PostHog that switches recordings, heatmaps and surveys on from its side, and checks that none of
  it happens. It also checks the allowlists, neutral names, no screen words, numbers, Hindi, routes or file paths, private screens
  (judged by capture time), errors, discreet and shared modes, off and on, and Hindi at 360 px.
  - The test browser hides `navigator.webdriver`, because posthog-js drops headless browsers as bots.
- **Existing suites still pass:** privacy 51/51, Me 63/63, value 110/110, smoke, check.

**Minimalist baseline:** no new screen, card, ring, tour or question. One switch in Me, off. The shared-phone check holds:
nothing leaves in discreet or shared mode.

**What isn't covered yet:**
- **Joining:** she can only turn it on after joining, so joining's drop-off still needs the server's `setup_step` (section 13).
- **The ask once after week 1 (section 11):** still Mohit's decision. Until then only women who find the switch, or pilot women
  whose coordinator turns it on, will share.
- **The privacy notice line** (counsel) and the Play Data safety answers in `docs/play-store-pages-2026-10-29.md` (app
  interactions, plus crash logs and diagnostics, which now exist) before any Play or public build.

**Mohit's PostHog project:**
- EU region; Settings > Project: "Discard client IP data" on.
- Session replay, surveys and heatmaps can stay off there too; the app ignores them either way.
- The Project API key (`phc_...`) goes in `SAKHI_PH`.

**Next, with the key:**
- Build `0.39.60-pilot`, vc 110 (the parallel session installed vc 109), from a clean worktree of HEAD with only this work applied,
  because `android/` holds the Play session's uncommitted changes.
- Install it over his Sakhi, keeping the diary. He turns the switch on and uses Sakhi; logcat shows no CSP or console errors, and
  PostHog's Activity page shows the events and their neutral names.

## 18. On by default, and where to watch (3 Nov)

Mohit, 3 Nov: "i need to keep it on by default and where can i see whats happening on app".

**Built:**
- "Share how I use Sakhi" is on unless she turns it off (`state.settings.ph !== false`), like Version 39.27's reminders: no question,
  and off stays off.
- The data notice ("How Sakhi keeps your data", at signup and in Me > About) gets one line in a PostHog build: what goes, to whom, and
  where to turn it off. Its version becomes `2026-10-23.2.ph`, so the consent rows show which notice she agreed to.
- `test/posthog.mjs` has 42 checks; signup's code guard allows the one fixed PostHog loader beside the Care loader.

**What on-by-default means:**
- Women who joined before this build start sharing after the update, without seeing the new line unless they open Me > About.
  A one-time line in "What's new" would tell them; that's Mohit's choice.
- Clue, Flo and Euki all ask first. Sakhi now shares screen use by default but never her diary, words or identity, and stops
  anything on private pages, in discreet mode or on a shared phone.
- Counsel should confirm the notice line before a Play or public build. The DPDP Rules' consent duties apply from about May 2027.

**Where to watch (PostHog, EU: eu.posthog.com), once a build with the key is on phones:**

| What you want | Where in PostHog |
|---|---|
| Events arriving live (for the first test) | Activity |
| A ready-made overview: users, views, sessions, time, top screens, first and last screens, phones | Web analytics |
| What women use most | Product analytics > new Trends insight: `$pageview`, broken down by `screen` |
| Where they drop off (for example plan goal, reveal, start, check-in) | Funnels on `$pageview` filtered by `screen` |
| Whether they come back | Retention (by anonymous phone ID; Lifecycle doesn't work with anonymous users) |
| Screen to screen, and where they leave | Paths, on `$pathname` |
| Rage and dead taps by screen | Trends on `$rageclick` and `$dead_click`, broken down by `screen` |
| What breaks | Error tracking (type, file and screen, never the message) |
| Hindi against English, before and after a version | Break down or filter by `lang` or `app` |

Pin the ones you use to one "Sakhi" dashboard. Signups, daily users and retention by account stay in Supabase's SQL editor
(section 2).

## 19. Live on the Flip5 (3 Nov)

- **PostHog:** project "Qura Sakhi" (id 332652, EU), created by Mohit. "Discard client IP data" was already on, and replay, surveys and
  heatmaps were already off. The time zone is set to Asia/Kolkata.
- **Builds:** vc 110 (`0.39.60-pilot`), then vc 111 (`0.39.60.1-pilot`), built from a clean worktree of f95718f plus only this work.
  Real events arrive with the neutral address, `screen`, `lang` and `app`, an anonymous ID and no profile.
- **Found on the real servers:** PostHog's GeoIP step stored city, postal code and coordinates from the IP before discarding it,
  so Sakhi sends `$geoip_disable: true` on every event (in `phKeep`; `test/posthog.mjs` checks it). Verified: events from vc 111
  carry "GeoIP disabled" and no location. Mohit can delete the first two test events (his own location) in PostHog if he likes.
- **Build lesson:** a first vc 111 took main's `app.js` after the parallel session had committed phase C (f5ad438), and ran for
  3.5 minutes before it was replaced. Never copy whole files from main into an older worktree: apply the diff, or start from the
  last APK's files.

## Sources

- DPDP Rules timeline: [YourStory, Nov 2025](https://yourstory.com/2025/11/digital-personal-data-protection-dpdp-rules-2025-rollout-over-18-months),
  [Mondaq, 2026 milestones](https://www.mondaq.com/dpdp-act-and-rules-2025-the-2026-compliance-milestones-businesses-cant-afford-to-miss/1830402)
- Anonymised data under the DPDP Act: [ConsentOS, DPDP for healthtech](https://consentos.pages.dev/learn/dpdp-for-healthtech),
  [KPMG, DPDP in healthcare](https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2025/12/the-privacy-prescription-impact-of-dpdp-act-and-rules-in-healthcare-and-life-sciences-sector.pdf.coredownload.pdf)
- Flo and Meta: [National Law Review](https://natlawreview.com/article/jury-finds-meta-liable-collecting-private-reproductive-health-data),
  [HIPAA Journal](https://www.hipaajournal.com/jury-trial-meta-flo-health-cons)
- Analytics services' free tiers: [AgentDeals, Aptabase](https://agentdeals.dev/vendor/aptabase),
  [Free tier comparison 2026](https://agentdeals.dev/analytics-free-tier-comparison-2026)
- Play Console statistics: [Play Console Help](https://support.google.com/googleplay/android-developer/answer/139628?hl=en),
  [Play Console deep dive](https://digitanomy.substack.com/p/google-play-console-statistics-deep)
- Clarity's terms and health data: [Clarity Terms of Use](https://clarity.microsoft.com/terms),
  [Microsoft Q&A quoting the terms](https://learn.microsoft.com/en-us/answers/questions/1477820/is-ms-clarity-hipaa-compliant),
  [Paubox](https://www.paubox.com/blog/is-microsoft-clarity-hipaa-compliant)
- Clarity on Android: [Android SDK](https://learn.microsoft.com/en-us/clarity/mobile-sdk/android-sdk),
  [masking](https://learn.microsoft.com/en-us/clarity/mobile-sdk/clarity-sdk-masking),
  [WebView capture](https://learn.microsoft.com/en-us/clarity/mobile-sdk/sdk-data-capture-rules)
- Open-source replay: [OpenReplay's list](https://blog.openreplay.com/open-source-session-replay-tools/),
  [PostHog's comparison](https://posthog.com/blog/best-session-replay-tools)
- Mozilla's period-tracker test, July 2026: [CyberInsider](https://cyberinsider.com/mozilla-study-ranks-euki-as-the-most-private-period-tracker/),
  [DH Insights](https://dhinsights.org/news/mozilla-report-reveals-wide-privacy-gaps-among-popular-period-tracking-apps)
- Maya and Facebook, 2019: [BuzzFeed News](https://buzzfeednews.com/article/meghara/period-tracker-apps-facebook-maya-mia-fem),
  [The News Minute](https://www.thenewsminute.com/news/period-tracking-apps-share-extensive-sensitive-data-facebook-finds-study-108727)
- Apple's Cycle Tracking: [Apple Support](https://support.apple.com/120356)
- PostHog: [session replay pricing](https://posthog.com/session-replay/pricing), [pricing](https://posthog.com/pricing.md)
- PostHog and health data: [HIPAA compliance](https://posthog.com/docs/privacy/hipaa-compliance.md),
  [privacy compliance](https://posthog.com/docs/privacy), [privacy controls](https://posthog.com/docs/product-analytics/privacy)
- Umami: [pricing compared](https://aicores.io/pricing/umami). Countly: [pricing](https://countly.com/pricing).
  OpenPanel: [vs Countly](https://openpanel.dev/compare/countly-alternative)
- OpenReplay: [PostHog's list of open-source replay tools](https://posthog.com/blog/best-open-source-session-replay-tools),
  [G2 reviews](https://www.g2.com/products/openreplay/reviews)
