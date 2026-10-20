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

`db push` applies the one Sakhi migration. This is Sakhi's own project, so nothing of Qura's is touched.

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
