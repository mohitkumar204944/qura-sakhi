# Security

## Reporting a problem

Please email hello@quranutrition.com with "Sakhi security" in the subject, and don't open a public issue. We will reply
within 3 working days and tell you what we plan to do. Please give us time to fix a problem before you talk about it
in public.

In scope: the Android app (`android/`), the web layer in `web/`, and the server functions `sakhi-api` and `sakhi-chat`
(`server/supabase/functions/`).

## What Sakhi protects, and its known limits

- **The diary stays on the phone.** The server never receives it. Android's backup is turned off for the app
  (`android:allowBackup="false"`).
- **The app does not encrypt the diary itself.** It relies on Android's app sandbox and the phone's own encryption.
  The app lock stops someone opening Sakhi by chance on a shared phone; it is not encryption, and the app says so.
- **The backup code** (`SAKHI1.`) is the diary encrypted with AES-GCM-256, using a key made from the PIN she chooses
  (PBKDF2-SHA256, 150,000 rounds). She copies it herself and it never goes to the server. Someone who has the code can
  try to guess a short PIN offline, so the app warns her to choose a longer one.
- **The server** holds her account only: phone number, sign-up details and the last day she opened the app. Every
  table in the `sakhi` schema has row-level security with no policies, and the schema is not exposed through the
  public REST API: only the Edge Functions read it.
- **What leaves the phone:**
  - her number and sign-up code (by SMS or WhatsApp);
  - the optional "Ask Qura to call me" request, with only the diary parts she ticks;
  - in the Play build, Firebase Analytics events (screen names and tap places, never her words) while she leaves
    "Share how I use Sakhi" on; the open build has no Firebase code;
  - in the Ask Sakhi prototype only (team test builds made with `SAKHI_CHAT`, never the Play build): her question,
    with email addresses and phone numbers scrubbed (on the phone and again on the server), goes to the `sakhi-chat` function and on to Anthropic's API to write
    the answer. The server keeps daily totals only, never the question or the answer.
- **Signing keys and secrets** are never in git: the Android keystores, their passwords (the build reads them from the
  environment or the Mac's keychain), `google-services.json`, and the server's secrets (set in Supabase; names only in
  `server/DEPLOY.md`).
