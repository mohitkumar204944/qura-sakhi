#!/bin/bash
# Copies Qura's WhatsApp and SMS sending keys into Sakhi's own Supabase project, where the server reads them as
# SAKHI_META_TOKEN, SAKHI_WA_PHONE_ID, SAKHI_AUTHKEY_KEY and SAKHI_AUTHKEY_OTP_SID.
# Paste each value from Vercel (Qura's production project → Settings → Environment Variables). The two keys stay hidden
# as you paste, and nothing is written to disk or shell history. Before saving, it asks Meta whether the token and the
# number ID belong together, so a wrong paste stops here instead of failing on a woman's phone.
# Run it again whenever Qura rotates its Meta token or AuthKey key.
set -euo pipefail
export LC_ALL=C   # byte-wise checks: a Meta token is plain ASCII letters and digits
REF="${SAKHI_PROJECT_REF:-jovplellzaxebcdekpax}"   # qura-sakhi; never Qura's own project

stop() { echo "$1 Stopped; no keys were changed." >&2; exit 1; }
# The app's Terminal panel may not be allowed into Desktop folders, which also breaks Homebrew's PATH set-up and any
# tool that reads its working directory. Nothing here needs a folder, so work from home and find Homebrew's supabase.
cd "$HOME"
command -v supabase >/dev/null || PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
command -v supabase >/dev/null || stop "Can't find the supabase command."
# ask VAR "prompt" [hidden|shown] [optional]: one pasted line, forgiving of quotes, a stray CR or a whole NAME=value line.
ask() {
  local v=''
  if [ "${3:-}" = hidden ]; then read -r -s -p "$2: " v || true; echo >&2; else read -r -p "$2: " v || true; fi
  v="${v//$'\r'/}"
  if [[ "$v" =~ ^[[:upper:][:digit:]_]+= ]]; then v="${v#*=}"; fi
  v="${v#\"}"; v="${v%\"}"; v="${v#\'}"; v="${v%\'}"
  if [ -z "$v" ] && [ "${4:-}" != optional ]; then stop "Nothing was pasted."; fi
  printf -v "$1" '%s' "$v"
}

ask META  'META_WA_ACCESS_TOKEN (hidden)' hidden
ask PHONE 'META_WA_PHONE_NUMBER_ID'
ask AKEY  'AUTHKEY_API_KEY (hidden)' hidden
ask ASID  'AUTHKEY_OTP_SID'
ask GV    'META_GRAPH_VERSION, only if Vercel has it (Enter to skip)' shown optional
[[ "$META" =~ ^EAA[A-Za-z0-9]+$ ]] || stop "That isn't a whole Meta token (${#META} characters; a token starts EAA and has only letters and digits). Copy it again with Vercel's copy button."
[[ "$PHONE" =~ ^[0-9]+$ ]] || stop "META_WA_PHONE_NUMBER_ID is Meta's long ID for the number, not the phone number itself."
[ -z "$GV" ] || [[ "$GV" =~ ^v[0-9]+[.][0-9]+$ ]] || stop "META_GRAPH_VERSION should look like v21.0."

echo "Asking Meta about the token…"
r=$(curl -s -m 20 -H "Authorization: Bearer $META" "https://graph.facebook.com/${GV:-v21.0}/$PHONE?fields=display_phone_number,verified_name") || stop "Couldn't reach Meta."
case "$r" in
  *'"display_phone_number"'*) echo "OK: Meta says this token sends from $(printf '%s' "$r" | sed -E 's/.*"display_phone_number":"([^"]*)".*/\1/')." ;;
  *) # Only Meta's error number is shown, never its text: the "Malformed access token" error repeats the token.
     code=$(printf '%s' "$r" | sed -nE 's/.*"code":([0-9]+).*/\1/p')
     [ "$code" != 190 ] || stop "Meta says this token doesn't work (error 190): cut off, expired or revoked. Copy it again with Vercel's copy button."
     echo "Meta wouldn't show this number's details to this token (error ${code:-unknown})." >&2
     # A token that can send but not read number details lands here, so let the person decide.
     ok=''; read -r -p "Save the keys anyway? (y/N) " ok || true
     [ "$ok" = y ] || [ "$ok" = Y ] || stop "Check the values in Vercel and run this again." ;;
esac

set -- "SAKHI_META_TOKEN=$META" "SAKHI_WA_PHONE_ID=$PHONE" "SAKHI_AUTHKEY_KEY=$AKEY" "SAKHI_AUTHKEY_OTP_SID=$ASID"
[ -z "$GV" ] || set -- "$@" "SAKHI_META_GRAPH_VERSION=$GV"
supabase secrets set --project-ref "$REF" "$@"
echo "Sakhi's server now has these keys (names only):"
supabase secrets list --project-ref "$REF" 2>/dev/null | awk -F'|' '$1 ~ /SAKHI_/ { gsub(/ /, "", $1); print "  " $1 }'
