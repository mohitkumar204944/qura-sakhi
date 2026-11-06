#!/bin/sh
# Makes Sakhi's upload key for Google Play, once: sakhi-upload.keystore (not in git) with a long random password that only
# goes into this Mac's keychain, as "Qura Sakhi upload key". PLAY=1 ./build-apk.sh signs every bundle with it.
# Play keeps the key that signs what phones install (Play App Signing); this one only proves an upload is ours. Losing it
# isn't the end (Play Console can reset an upload key, which takes a few days), but back up the file and the password.
set -e
cd "$(dirname "$0")"
KS="${SAKHI_UPLOAD_KEYSTORE:-sakhi-upload.keystore}"
ITEM="Qura Sakhi upload key"
[ ! -f "$KS" ] || { echo "$KS already exists: keep using it. Never make a second one once Play has the first."; exit 1; }
if security find-generic-password -s "$ITEM" -a sakhi >/dev/null 2>&1; then
  echo "The keychain already holds \"$ITEM\", but $KS is missing: restore the file from your backup instead."; exit 1
fi
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"

SAKHI_UPLOAD_PASS="$(openssl rand -base64 48 | tr -d '/+=\n' | cut -c1-40)"
[ ${#SAKHI_UPLOAD_PASS} -eq 40 ] || { echo "Couldn't make a password."; exit 1; }
export SAKHI_UPLOAD_PASS
# The keychain first: a key whose password was lost would be no use.
security add-generic-password -s "$ITEM" -a sakhi -j "Google Play upload key for Qura Sakhi (android/$KS)" -w "$SAKHI_UPLOAD_PASS"
if ! keytool -genkeypair -keystore "$KS" -storetype PKCS12 -storepass:env SAKHI_UPLOAD_PASS -keypass:env SAKHI_UPLOAD_PASS \
     -alias upload -keyalg RSA -keysize 4096 -validity 10000 -dname "CN=Qura Sakhi, O=Trinaya Wellness LLP, C=IN" >/dev/null 2>&1; then
  security delete-generic-password -s "$ITEM" -a sakhi >/dev/null 2>&1 || true
  rm -f "$KS"; echo "keytool couldn't make the key; nothing was kept."; exit 1
fi
chmod 600 "$KS"
echo "Made $(pwd)/$KS, valid for 27 years. Its password is in the keychain as \"$ITEM\" (Keychain Access, Show password)."
echo "Its certificate (public, safe to share):"
keytool -list -v -keystore "$KS" -storepass:env SAKHI_UPLOAD_PASS -alias upload | grep -E "SHA256:|Valid from"
echo "Back up both off this Mac now: the file, and the password in your password manager."
