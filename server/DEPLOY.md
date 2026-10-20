# Deploying Sakhi's server

The server is built and tested on this Mac (`npm run test:server`). These steps put it on Sakhi's own free Supabase
project. Steps 1–3 involve your accounts and keys, so you run them. It takes about 20 minutes and costs ₹0.

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
supabase link --project-ref <your-project-ref>
```

```bash
supabase db push
```

`db push` applies the one Sakhi migration. This is Sakhi's own project, so nothing of Qura's is touched.

## 3. Set the secrets

1. Create `server/.env.sakhi`. Git ignores it, so it is never committed. Fill it in like this:

   ```
   SAKHI_OTP_PEPPER=<output of: openssl rand -hex 32>
   SAKHI_IP_SALT_SEED=<output of: openssl rand -hex 32>
   SAKHI_META_TOKEN=<Qura's META_WA_ACCESS_TOKEN>
   SAKHI_WA_PHONE_ID=<Qura's META_WA_PHONE_NUMBER_ID>
   SAKHI_AUTHKEY_KEY=<Qura's AUTHKEY_API_KEY>
   SAKHI_AUTHKEY_OTP_SID=<Qura's AUTHKEY_OTP_SID>
   ```

   - The four Qura values are in Vercel, under the production environment variables.
   - If Qura sets `META_GRAPH_VERSION`, also add `SAKHI_META_GRAPH_VERSION=<the same value>`. Without it the server uses
     `v21.0`, the same default as Qura's code.

2. Load the secrets into the project:

   ```bash
   supabase secrets set --env-file .env.sakhi
   ```

3. Move `.env.sakhi` into your password manager and delete it from disk.
4. **When Qura rotates its Meta token or AuthKey key, update them here too.**

## 4. Deploy the function

Docker must be running; the CLI uses it to bundle the function.

```bash
supabase functions deploy sakhi-api --no-verify-jwt
```

The address is `https://<your-project-ref>.supabase.co/functions/v1/sakhi-api`.

## 5. Check it

The first command should answer `204` with `access-control-allow-origin: *`:

```bash
curl -i -X OPTIONS https://<your-project-ref>.supabase.co/functions/v1/sakhi-api/v1/me
```

The second sends a real WhatsApp code to that number. Use a staff number only:

```bash
curl -s -X POST https://<your-project-ref>.supabase.co/functions/v1/sakhi-api/v1/otp/start -H 'content-type: application/json' -d '{"phone":"+91XXXXXXXXXX"}'
```

## 6. Point the app at it and test with staff phones

```bash
cd ~/Desktop/QuraSakhi/sakhi/android && SAKHI_API=https://<your-project-ref>.supabase.co/functions/v1/sakhi-api VERSION_CODE=22 VERSION_NAME=0.22-demo ./build-apk.sh
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
