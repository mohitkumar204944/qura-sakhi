# Third-party notices

Qura Sakhi's own code is under the MIT licence ([LICENSE](LICENSE)) and its content under CC BY 4.0
([LICENSE-content.md](LICENSE-content.md)). These pieces come from others and keep their own terms.

## Shipped in the app

| Piece | Where | Licence |
|---|---|---|
| Fonts: Cormorant Garamond, DM Sans, Kalam, Noto Sans Devanagari | `web/fonts/` | SIL Open Font License 1.1 (the four `OFL-*.txt` files alongside) |
| 3D figure assets: MakeHuman | `web/fig/` (see `web/fig/CREDITS.md`) | CC0. Rendered with Blender; Blender's GPL does not cover its output |
| Sleep sounds (3) from Freesound: "sing bowl wave bird relaxtion meditation music" by smilecat77; "Wandering" and "Dunes" by Andrewkn | `web/sounds/music/` (see `web/sounds/CREDITS.md`) | CC0 |
| Health-centre data: "NIN health facilities" (geo-coded), data.gov.in | `web/care/`, built by `web/tools/care-data.mjs` | Government Open Data License – India (GODL-India) |
| PIN code data: India Post, "All India Pincode Directory", data.gov.in | `web/care/`, built by `web/tools/care-data.mjs` | Government Open Data License – India (GODL-India) |
| Food facts | `web/mods/food.js` | Facts drawn from ICMR-National Institute of Nutrition (2024) |

### Attribution for the government data (GODL-India)

The "Care near me" data contains information from two datasets published on the Open Government Data (OGD) Platform
India, used under the Government Open Data License – India (https://data.gov.in/government-open-data-license-india):

- "All India Pincode Directory", Department of Posts, Ministry of Communications, Government of India:
  https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month
- "NIN health facilities geo-code and additional parameters", Ministry of Health and Family Welfare, Government of
  India: https://www.data.gov.in/resource/nin-health-faclities-geo-code-and-additional-parameters-updated-till-last-month

Sakhi keeps 147,742 of the list's 192,905 facilities and splits both lists into small files; the content is otherwise
unchanged. The app credits the lists and the licence on its "Care near me" page. `web/care/` is not in
git: build it with `web/tools/care-data.mjs`, from the CSV files or with your own data.gov.in API key (see the README).

## Used by the server

| Piece | Where | Licence |
|---|---|---|
| postgres (postgres.js) 3.4.5 | `sakhi-api` and `sakhi-chat` | Unlicense |
| @anthropic-ai/sdk 1.6.0 | `sakhi-chat` only (the Ask Sakhi prototype) | MIT |

## Used only to build or test (not shipped)

| Piece | Licence |
|---|---|
| Playwright 1.59.1 | Apache-2.0 |
| @electric-sql/pglite 0.5.8 | Apache-2.0 |
| Gradle wrapper | Apache-2.0 |

## In the Play build only

| Piece | Licence |
|---|---|
| Google Firebase Analytics (Firebase BoM 35.1.0) | Google's terms; closed source |

The Play build includes Google's closed-source Firebase SDK for "Share how I use Sakhi" (events only, which she can
turn off). The open build leaves it out: without `android/google-services.json` (not in git), the app is built with
`android/usage/none` and contains no Firebase code.

## Not licensed

- The names "Qura" and "Sakhi" and the Sakhi logo are trademarks of Trinaya Wellness LLP.
- The voice clips in `web/sounds/voice/` (the trainer's voice, made with a voice clone of a real person, and the
  Bhramari hum, a real person humming) are left out of every licence here until both people agree in writing. See
  [LICENSE-content.md](LICENSE-content.md).
