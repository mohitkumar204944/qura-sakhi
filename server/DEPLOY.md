# Deploying Sakhi's server

The server is built and tested on this Mac (`npm run test:server`). These steps put it on Sakhi's own free Supabase
project. It costs ₹0.

**Where it stands (20 Oct 2026):** steps 1 to 5 are done. WhatsApp and SMS codes both reached a staff phone. The project
is `qura-sakhi` (ref `jovplellzaxebcdekpax`, Mumbai), in the free "Qura Sakhi" organisation. What's left is the
staff-phone test with 0.22-demo (step 6). That APK is built and points at this server.

## 1. Create the free project (Supabase dashboard)

1. If Qura's Supabase organisation is on a paid plan, first create a new **Free** organisation, for example "Qura Sakhi".
   Free projects can only live in a free organisation.
2. Create a new project in it:
   - name `qura-sakhi`;
   - region **Mumbai (ap-south-1)**;
   - a strong database password, kept in your password manager.
3. Copy the project reference: the `abcd…` part of `https://abcd….supabase.co`.

## 2. Create the tables

Run these from the `server` folder. `supabase login` opens your browser once.

```bash
cd ~/Desktop/QuraSakhi/sakhi/server
```

```bash
supabase login
```

```bash
supabase link --project-ref jovplellzaxebcdekpax
```

```bash
supabase db push
```

`db push` applies every Sakhi migration not yet on the project. This is Sakhi's own project, so nothing of Qura's is touched.

**Version 30 (22 Oct 2026):** `20261022120000_sakhi_usage.sql` adds the two tables for the opt-in "what helps" counts
(SERVER_SPEC section 5.9). Applied to the live project on 23 Oct 2026, with the function that has the `usage` route.

**Version 33 (23 Oct 2026):** `20261023120000_sakhi_call_requests.sql` adds `call_requests` for "Ask Qura to call me"
(SERVER_SPEC section 10.1). Applied on 23 Oct 2026 together with the Version 30 changes; the hand-off was switched on the
same day.

## 3. Set the secrets

1. The server's own two keys. They are made up on the spot and nobody needs to know them:

   ```bash
   supabase secrets set SAKHI_OTP_PEPPER="$(openssl rand -hex 32)" SAKHI_IP_SALT_SEED="$(openssl rand -hex 32)"
   ```

   Changing them later is harmless. It only cancels codes sent in the last 10 minutes and restarts today's per-IP counts.

2. Qura's four sending keys. Open Vercel (Qura's production project → Settings → Environment Variables), then run:

   ```bash
   ~/Desktop/QuraSakhi/sakhi/server/scripts/set-qura-keys.sh
   ```

   - It asks for `META_WA_ACCESS_TOKEN`, `META_WA_PHONE_NUMBER_ID`, `AUTHKEY_API_KEY` and `AUTHKEY_OTP_SID`, plus
     `META_GRAPH_VERSION` if Qura has one.
   - It checks the Meta pair with Meta, then saves them as `SAKHI_META_TOKEN`, `SAKHI_WA_PHONE_ID`, `SAKHI_AUTHKEY_KEY`
     and `SAKHI_AUTHKEY_OTP_SID`. Nothing is written to disk.
   - It never prints a key. It refuses a token that isn't letters and digits, or that Meta calls broken (error 190).
   - If the app's Terminal panel answers "Operation not permitted", macOS is keeping the panel out of Desktop folders. Run
     it from the Mac's Terminal app instead, or from a copy outside Desktop.
   - Without a graph version the server uses `v21.0`, the same default as Qura's code.

3. **When Qura rotates its Meta token or AuthKey key, run the script again.**

4. **The doctor-call hand-off (Version 33), once Qura's endpoint is merged and live.** Qura's side was built on 23 Oct
   (branch `feat/sakhi-call-requests`, env `SAKHI_PARTNER_KEY`). Without these two secrets the hand-off stays off: the server
   answers `available: false` and the app keeps the booking link. The same key goes in both places, and it never appears on
   screen.
   1. Put a new key on the clipboard:

      ```bash
      openssl rand -hex 24 | tr -d '\n' | pbcopy
      ```

   2. Paste it into Vercel as `SAKHI_PARTNER_KEY` (Production, and Preview if testing there), then redeploy Qura.
   3. Set Sakhi's key from the same clipboard. On its own it changes nothing: the hand-off stays off until the address is set
      too.

      ```bash
      cd ~/Desktop/QuraSakhi/sakhi/server && supabase secrets set --project-ref jovplellzaxebcdekpax SAKHI_QURA_KEY="$(pbpaste)"
      ```

   4. Copy something else, so the key leaves the clipboard.
   5. **Only once Qura's endpoint is merged and live in production** (and Sakhi's function is deployed), switch it on. Before
      that, every request would hit a 404 and fail.

      ```bash
      cd ~/Desktop/QuraSakhi/sakhi/server && supabase secrets set --project-ref jovplellzaxebcdekpax SAKHI_QURA_HANDOFF_URL=https://quranutrition.com/api/partners/sakhi/v1/call-requests
      ```

   Notes:
   - Use exactly this URL: with `www.` or a trailing `/` Qura answers with a 308 redirect.
   - The key must be 32 characters or more (this one is 48), and the address https, or the hand-off stays off.
   - Turning it off again: `supabase secrets unset SAKHI_QURA_HANDOFF_URL`. Requests already waiting fail after 24 hours, and
     the app offers the booking link.

## 4. Deploy the function

```bash
supabase functions deploy sakhi-api --no-verify-jwt
```

Docker isn't needed. Without it, the CLI uploads the files and Supabase bundles them. The address is
`https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api`.

## 5. Check it

The first command should answer `204` with `access-control-allow-origin: *`:

```bash
curl -i -X OPTIONS https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api/v1/me
```

The second uses a made-up session, so it should answer `401`. A `500` means the function can't reach its database:

```bash
curl -s -w ' [%{http_code}]\n' https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api/v1/me -H "authorization: Bearer $(openssl rand -hex 32)"
```

The third sends a real WhatsApp code to that number. Use a staff number only:

```bash
curl -s -X POST https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api/v1/otp/start -H 'content-type: application/json' -d '{"phone":"+91XXXXXXXXXX"}'
```

What it answers:

- `"channel":"whatsapp"`: WhatsApp worked.
- `"channel":"sms"`: WhatsApp failed and the SMS went instead. The logs say why (`whatsapp_failed`).
- `send_failed`: both failed.

## 6. Point the app at it and test with staff phones

```bash
cd ~/Desktop/QuraSakhi/sakhi/android && SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=22 VERSION_NAME=0.22-demo ./build-apk.sh
```

1. On a staff phone, sign up, edit your details, log out, sign back in with "Send by SMS", then delete the account.
2. Watch the rows appear and disappear in the dashboard (Table Editor → schema `sakhi`).
3. If something fails, the function's logs are in the dashboard under Edge Functions → sakhi-api → Logs. They never contain
   codes, tokens or request bodies.

The app built this way is still signed with the prototype key. A public release needs the real signing key first.

## 7. Optional: district and state from PIN codes

1. Download the All India Pincode Directory CSV from data.gov.in.
2. Turn it into SQL:

   ```bash
   cd ~/Desktop/QuraSakhi/sakhi && node server/scripts/load-pincodes.mjs ~/Downloads/<directory>.csv > ~/Downloads/pincodes.sql
   ```

3. Run `pincodes.sql` in the project's SQL editor.

## Every week: export the accounts (the free plan has no reliable backups)

The export holds phone numbers. Keep it in an encrypted folder, never in git.

```bash
cd ~/Desktop/QuraSakhi/sakhi/server && supabase db dump --data-only --schema sakhi -f ~/<encrypted-folder>/sakhi-$(date +%F).sql
```

## Good to know

- **Pausing:** a free project pauses after 7 days with no database activity. Restoring it is one click in the dashboard.
  While it's paused, the app shows "Couldn't reach Qura" and lets women "Continue for now"; their diaries are unaffected.
- **No cron needed:** daily clean-up runs inside the function. The first code request after 24 hours clears old codes, rate
  counters and dead sessions.
- **Code changes:** run `npm run test:server` before every deploy.
- **"What helps" (Version 30):** when Mohit says yes, `supabase db push`, then deploy the function (section 4), then check that
  a request with a token is refused:

  ```bash
  curl -s -X POST https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api/v1/usage -H 'content-type: application/json' -H 'authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxx' -d '{"month":"2026-09","counts":{"iron":"1"}}'
  ```

  It should answer `{"error":"no_token_here"}`. Don't send a real report by hand: it would count in the totals.
- **"Ask Qura to call me" (Version 33):** after the deploy, check it answers without a token and says whether it is on:

  ```bash
  curl -s https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api/v1/requests
  ```

  `{"available":false}` until the two secrets in section 3 are set, then `{"available":true}`. Test a real request with a
  staff phone on a test build, never with a woman's account. In the dashboard, the `call_requests` row should show `sent`
  with a null `topic` and `shared_data` a moment later.
- **Hand-off retries:** there is no cron. A request waiting for Qura is tried again when the API is used (her app asks for
  its status when she opens Sakhi, and any woman's daily visit). With few women in a pilot that can be hours apart; a request
  nothing tried for 25 hours fails as `expired` and the app offers the booking link.
