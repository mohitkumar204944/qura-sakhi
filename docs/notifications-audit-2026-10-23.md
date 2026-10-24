# Notifications: audit and advice (23 Oct 2026)

Mohit asked: "does this app serves required notifications can you audit and advise". This audit covers the 0.33.2-pilot
code: `web/app.js` (`reminders`, `buildNotifs`, `askNotifyNow`), the modules that create reminders, and the Android side
(`Reminders.java`, `ReminderReceiver.java`, `BootReceiver.java`, the manifest). It also read Sakhi's state on Mohit's
Flip5 with read-only adb queries. Nothing was changed.

## Status: fixed in Version 34 (23 Oct, Mohit: "can you fix all and get notifications working in perfect state")

Everything below is built except the two items not recommended: fertile-window alerts and server push. Details are in
`web/MODULE_API.md`, section 36.
- **P0:** asked once on Home, and repeating reminders now renew themselves on the phone.
- **P1:** "Ring on time?" with re-arming, neutral words on a shared phone, and the late nudge.
- **P2:** the monthly check-in reminder, a tap opens the reminder's screen, channels by kind in her language, and the
  backup nudge.

Tests: `web/test/notify.mjs` and `android/test/ReminderMathTest.java`. On a real phone, the 2-minute check below still
applies.

## Verdict

The machinery is sound and careful with privacy:
- the right Android calls, so alarms ring through Doze;
- alarms put back after a restart or an app update;
- nothing shown on the lock screen;
- generic text in discreet mode.

**But in practice most women would get no notifications at all, and the daily ones would stop after two or three weeks.**
Both are fixable inside the app, with no server or Qura change.

## What it does today

- **All notifications are local** (Android alarms). No push server, nothing from Qura.
- **Phone reminders are off by default** (`settings.notify`). The app asks only when she creates a reminder, or when she
  turns on the switch on Me > Reminders.
- **What can ring** (all set up by her, except the first):

| Source | Reminders |
|---|---|
| Automatic | "Your period may start in the next few days", at 9 am the day before her likely range. Only with steady dates, not while pregnant, breastfeeding or after a birth |
| Contraception | Daily pill, injection (Antara) due, Chhaya schedule, device replacement |
| Iron | Daily or weekly tablet, the repeat Hb test |
| Pregnancy | IFA and calcium tablets; the plan's visits and tests (PMSMA, Td) |
| After birth | 6-week check, baby's vaccines |
| Screening | Cervical, breast, BP and sugar checks; monthly breast self-check |
| Medicines and own reminders | At her times; monthly ones |
| Schemes | PMMVY registration |
| 21-day journey | A daily small step |

- **How they're delivered:**
  - The page schedules the next 21 days, at most 60 alarms, soonest first.
  - The last alarm says "Open Sakhi so your reminders keep coming."
  - The list is re-sent on every save and whenever she opens Sakhi.
  - Exact alarms are used when Android allows them; otherwise Android may ring them late.
  - One channel, "Reminders", at normal importance: sound, no pop-up over the screen. The lock screen shows nothing
    (`VISIBILITY_SECRET`).
- **On Mohit's Flip5 (Android 16):**
  - notification permission granted;
  - "Alarms & reminders" not granted;
  - **no Sakhi alarm queued.** His diary is set to after a birth, which has no period alert, so this is expected unless he
    set reminders.

## Gaps, most important first

**P0: she never turns them on.** The one automatic alert, "period coming", needs phone reminders on. A woman who never sets a
pill or medicine reminder is never asked.
- Fix: ask once, when it helps her. For example, after her first period log or at the end of first-run: "Get a heads-up the
  day before your period?" Then Android's permission prompt.

**P0: daily reminders go quiet after two or three weeks if she doesn't open Sakhi.** The page schedules only 21 days, and
at most 60 alarms. A pill plus IFA plus calcium twice a day is 4 a day, so they stop after 15 days. The single "open
Sakhi" alert is easy to miss. A woman who relies on the pill reminder and never opens the app loses it without knowing.
- Fix: when a repeating reminder rings, Android schedules its next one itself (the repeat rule goes with the alarm). Daily
  and weekly reminders then keep going without the app being opened. Medium effort, in the Android code.

**P1: reminders can come late.** From Android 14, "Alarms & reminders" is off for new installs (as on the Flip5), so Android
may delay alarms, by up to an hour when the phone is idle. That matters for the progestin-only pill, which has a 3-hour
window. The app offers the setting only on Me > Reminders, after reminders are on.
- Fix: ask right when she sets a pill reminder. When she allows it, re-arm the alarms as exact straight away (Android
  announces the change).

**P1: shared phones.** With "Others use this phone" on but discreet mode off, the notification shade shows "Take your pill"
or "Your period may start" once the phone is unlocked.
- Fix: word notifications as in discreet mode ("Reminder") whenever the phone is shared.

**P1: no alert when her period is late.** The late card on Home carries the test advice and the ectopic warning, but
nothing tells her to look.
- Fix: one neutral nudge, 3 days after her own likely range ends: "Open Sakhi: your dates need a look." No health words, so
  it's safe on a shared phone. Needs the doctor's OK.

**P2:**
- **A monthly check-in reminder,** off by default. The check-in is how PCOS signs get tracked.
- **Tapping a reminder opens Home,** not the thing to do (tick the pill, log the visit). Open the right screen.
- **One English-only channel.** In Android's settings she can't mute the daily step but keep her pills, and the name isn't
  in Hindi. Split it into Medicines, Pregnancy and baby, Period, and Other, named in her language.
- **A backup nudge,** opt-in and monthly. The diary lives only on the phone, so a lost phone or an uninstall loses it.

**Not recommended:**
- **Fertile-window alerts.** They would push fertile days towards use as contraception, which the app says they aren't.
- **Server push.** Nothing needs it. Qura confirms calls and bookings on WhatsApp.

## Check it on a phone (2 minutes)

1. Me > Reminders: turn on phone notifications, and allow "Alarms & reminders" if it's offered.
2. Add a reminder for 2 minutes from now, lock the phone, and wait. It should ring with nothing readable on the lock
   screen, then show its text after unlocking.

## Effort

All fixes are in the app and its Android shell. They need a new APK (versionCode 38 or later), and no server or Qura change.
- **Small:** P0 ask, P1 shared wording, P1 late nudge (plus the doctor's OK on its wording), P2 monthly check-in.
- **Medium:** P0 self-renewing repeats, P1 exact-alarm prompt and re-arm, P2 channels and opening the right screen.
