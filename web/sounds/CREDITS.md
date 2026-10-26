# Sounds in Sakhi (Version 39.21)

Everything here ships inside the app and plays offline. Nothing is streamed.

## Sounds for sleep (`music/`)

All three are CC0 (public domain) recordings from Freesound, picked by Mohit on 26 Oct 2026. Each was checked as
"Creative Commons 0" on its page the day it was downloaded. They were converted to mono Opus at 48 kbps and set to
-23 LUFS.

| File | Freesound recording | By | Licence |
|---|---|---|---|
| `music/bowl.ogg` | "sing bowl wave bird relaxtion meditation music", https://freesound.org/people/smilecat77/sounds/479206/ | smilecat77 | CC0 |
| `music/wandering.ogg` | "Wandering", https://freesound.org/people/Andrewkn/sounds/455855/ | Andrewkn | CC0 |
| `music/dunes.ogg` | "Dunes", https://freesound.org/people/Andrewkn/sounds/447511/ | Andrewkn | CC0 |

CC0 asks for no credit; we credit them anyway.

## Dr. Megha's voice (`voice/en`, `voice/hi`)

- What it is: slow breaths, Bhramari and yoga nidra (`breaths`, `bhramari`, `nidra`) and each relief routine step
  (`rl-<step>`), in English and Hindi.
- How it was made: with MiniMax speech-02-hd (through Replicate) from a voice clone of Dr. Megha's sample, chosen by Mohit
  on 26 Oct 2026. The calm emotion was used at 0.9 speed.
- The scripts are in `web/tools/voice/sessions.json`. The tools that joined and timed the clips are in the same folder.
- The voice IDs and the Replicate key live outside the repo.
- Each file is mono Opus at 32 kbps.
- `timelines.js` holds the times the animations follow. `web/tools/voice/timeline.mjs` measured them from the files.

## Bhramari's hum

The 9.8-second hum in both Bhramari sessions is a real person humming, from a voice note Mohit gave on 26 Oct 2026
(`Amaron.m4a`). It is used at its full length.
