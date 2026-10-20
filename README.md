# Qura Sakhi

A free reproductive-health companion app for Indian women, in English and Hindi, made by Qura. Prototype version 0.21-demo.

- `web/`: the app. Open `web/index.html`, or double-click `../Open prototype.command`.
- `android/`: the Android wrapper. Build the APK with `android/build-apk.sh`.
- `server/`: the accounts server (a Supabase Edge Function), with its spec (`SERVER_SPEC.md`) and deploy steps (`DEPLOY.md`).
- `docs/history.md`: what each version changed.

Tests: `npm test` runs them all (the app's suites in `web/test`, the server's in `server/test`). The rules for working on
Sakhi are in `CLAUDE.md`.
