# Qura Sakhi

A free reproductive-health companion app for Indian women, in English and Hindi, made by Qura. Prototype version 0.21-demo.

- `web/`: the app. Open `web/index.html`, or double-click `../Open prototype.command`.
- `android/`: the Android wrapper. Build the APK with `android/build-apk.sh`.
- `server/SERVER_SPEC.md`: the spec for the accounts server (not built yet).
- `docs/history.md`: what each version changed.

Tests: `cd web && node test/signup.mjs`, plus `maths.mjs`, `smoke.mjs .` and `check.mjs all --quick`. The rules for working on
Sakhi are in `CLAUDE.md`.
