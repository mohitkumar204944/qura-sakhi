# Care near me: where the data comes from (22 Oct 2026)

"Care near me" (B2 in `feature-research-2026-10-22.md`) shows the nearest government health centres and hospitals for her PIN
code. It works offline and sends nothing. The app side is built and tested; the rules are in `web/MODULE_API.md` section 30.
What it still needs is the data, and getting that takes one step only Mohit can do.

## 1. What is built

- **`web/tools/care-data.mjs`** turns two government lists into small files in `web/care/`:
  - India Post's PIN code directory: PIN, district, state and a map location;
  - the NIN list of health facilities: name, type, address and map location.
  - It keeps sub-centres, PHCs, urban PHCs, CHCs, sub-district and district hospitals, and medical colleges.
  - It drops other types and rows with no usable location. It fixes rows whose latitude and longitude are the wrong way round.
  - It prints counts, so the result can be checked.
- **The app:**
  - Her account's PIN code is filled in. She can type another one, for example her mother's home for the birth.
  - The phone finds the PIN's district and works out the three nearest health centres and the three nearest hospitals
    within 50 km, each with its distance, its address and a Directions link.
  - Only the few files around her PIN are read. Nothing is sent.
- **`android/build-apk.sh`** bundles `web/care/` when it exists, and says so when it doesn't.
- **Tests:** `node test/plans.mjs`, section 4. It runs the builder on made-up files (every name starts with TEST) and checks
  the card, a PIN with no location, a PIN not in the list, Hindi, and that the loader only ever loads the app's own files.
- **Without the data** (the web prototype today, or a build without `web/care`), the card keeps its old text: the live app
  will list real facilities here, and this prototype doesn't invent them.

## 2. What Mohit needs to do (one of two ways)

Both lists are on data.gov.in under the Government Open Data License – India (GODL), which allows reuse with attribution.
The app shows the source and the date. But data.gov.in has no plain download link:
- its Download box asks for a purpose and a CAPTCHA;
- its API needs a personal key.

Claude can't fill in a CAPTCHA or create an account, so this step is yours.

**Way A: an API key (best, because each refresh is then one command).**
1. Sign in at https://www.data.gov.in (it uses Jan Parichay). The account needs an e-mail address.
2. My Account → Generate API Key.
3. In your own terminal, from the repo folder. The first line asks for the key without showing it, so it stays out of your
   shell history; the builder never prints or saves it.

   ```
   read -rs "DATA_GOV_IN_KEY?data.gov.in key: " && export DATA_GOV_IN_KEY && echo
   node web/tools/care-data.mjs --api
   ```

**Way B: download the two files by hand.**
1. Open each dataset page and use its Download button. It asks for a usage type, a purpose and a CAPTCHA.
   - [All India Pincode Directory](https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month): CSV,
     about 24 MB.
   - [NIN health facilities](https://www.data.gov.in/resource/nin-health-faclities-geo-code-and-additional-parameters-updated-till-last-month).
     Its file link points at nhp.gov.in, which was down on 22 Oct, so Way A may be the only way for this one.
2. Then run the builder, with the "Updated" date shown on each dataset page:

   ```
   node web/tools/care-data.mjs --pins pincode.csv --facilities nin.csv --pins-updated 2026-08-10 --fac-updated 2026-08-11
   ```

After either way, tell Claude. It will check the counts and the facility types the builder prints, look at a few PIN codes
you know, and rebuild the APK. `web/care/` is not in git, because each refresh would add its full size to the history.

**Decision 2 in the research doc** asked whether to bundle open data and refresh it each release. This build assumes yes.

**Done on 22 Oct (Way A).**
- Mohit generated a key on his data.gov.in account (My Account → API Key → Generate Key) and copied it.
- Claude ran the builder with the key read straight from the clipboard: `DATA_GOV_IN_KEY="$(pbpaste)"`. Before that it
  checked only the key's length and characters.
- The key was never printed, saved in a file, or shown in the chat. The key page was never screenshotted after the key
  appeared.
- **Next refresh:** copy the key from the same account page, then run, from the repo root:

  ```
  DATA_GOV_IN_KEY="$(pbpaste)" node web/tools/care-data.mjs --api
  ```

  Clear the clipboard afterwards.

## 3. The first real build (22 Oct 2026)

The full download took about 12 minutes, roughly 360 pages. The builder now cleans the locations: six rules, explained in
MODULE_API section 30, because both lists place some offices and centres in the wrong spot. It kept 19,586 PIN codes and
147,967 of 192,905 facilities, in 394 files totalling 12.3 MB. The APK grows from 2.0 to about 6 MB.

**Personal details removed:** 119 facilities had a staff member's mobile number, a landline or an e-mail in their name or
address. The builder takes these out before anything is bundled or published.

**A known limit:** an error of one district isn't caught. Narsra sub-centre, of Sikar district, is placed in Jaipur. That's
one more reason the card says to check with the ASHA or 104 before going.

**Spot checks:**
- Jaipur 302020: Jaipuria Hospital about 5 km, and JK Lon and SMS about 6 km.
- Hyderabad 500001: King Koti district hospital, and the Government Maternity Hospital in Sultan Bazar.
- Panaji: UHC Panaji and Goa Medical College.
- Central Kolkata: Belgachia PHC and Howrah District Hospital. Before the cleaning, India Post's misplaced offices put
  rural South 24 Parganas there.

**Where the list is thin.** NIN has 2 facilities for all of Kerala and about a fifth of Gujarat's. Arunachal Pradesh is
also thin, and Andaman and Nicobar and Lakshadweep have none. For PIN codes there, the card says the list is missing most
centres and points to the ASHA, 104 and the official links. Big city hospitals can be missing even in covered states
(Patna's PMCH, for example), which is why the card says a centre may be missing.

## 4. What the data is like (checked 22 Oct 2026)

| List | How to get it | Size | Freshness |
|---|---|---|---|
| India Post PIN code directory | Download box (CAPTCHA) or API key | 165,627 post offices, about 19,000 PIN codes; some have no map location | Updated monthly; page says 10 Aug 2026 |
| NIN health facilities | API key; the file link is dead | 192,905 rows with type and map location | **The API dates its copy 27 August 2019.** The catalogue shows a revision in December 2021, and its 2026 date is a bulk metadata change. The card says "last revised in 2019". |

The list's age is why the card says it was last revised in 2019, so a centre may be missing, or may have moved, closed or
changed, and that she should check with her ASHA or call 104 before going. No newer open list exists:
- the ABDM facility registry has no open export, and its search needs a CAPTCHA;
- the old NHP hospital directory downloads freely, but it has no usable facility types.

**Expected size in the APK:** a few MB. The builder prints the real figure. `--no-subcentres` makes it much smaller, but
sub-centres are the closest care for most women, so they are kept by default.

## 5. Lists that need permission first

These are public on official sites, but their terms say not to reproduce them without asking. Until a reply comes, the card
keeps the official links, which are already there.

| List | Terms | What to ask for |
|---|---|---|
| Jan Aushadhi Kendras (21,541) | "may be reproduced free of charge after taking proper permission by sending a mail to us" (janaushadhi.gov.in/copyright) | A CSV of Kendra code, address, PIN and map location, without owner names or phone numbers |
| One Stop Centres (1,000) | Mission Shakti's terms: personal, non-commercial use only; no reproducing without permission | Permission to show the list with map locations |
| NACO ICTC and DSRC (HIV and STI testing) | No licence stated on the PDFs | Permission, and a CSV if they have one |

**Drafts for Mohit to send himself, if he wants to** (from Trinaya Wellness LLP; fill in each office's address from its
contact page):

> **Subject: Permission to show [Jan Aushadhi Kendra / One Stop Centre / ICTC and DSRC] locations in a free health app**
>
> Dear Sir or Madam,
>
> Trinaya Wellness LLP makes Qura Sakhi, a free Hindi and English app for women's reproductive health. It has no ads and
> charges nothing. One of its screens helps a woman find free government care near her PIN code. That screen works on her
> phone without the internet, so it needs the list on the phone itself.
>
> We would like to include the [Jan Aushadhi Kendra / One Stop Centre / ICTC and DSRC] list from [site], showing for each
> centre its name, address, PIN code and map location. We would credit [the Bureau / the Ministry / NACO] as the source with
> the date, and link to your official page so that she can check it. We would leave out personal details such as owners'
> names and phone numbers. We would refresh the list with each release of the app.
>
> May we have your permission? If a CSV file is available, that would help us keep it accurate.
>
> Yours sincerely,
> Mohit Sihag
> Trinaya Wellness LLP

## 6. Checked on the first run, and still open

- **Checked:**
  - The NIN API id works.
  - The type labels are matched: maternity homes and mother-and-child welfare centres get their own labels.
  - Pages of 1,000 rows worked at about 2 seconds a page.
- **Open:**
  - Whether a bigger page size works, which would make refreshes faster.
  - Whether a newer national facility list will become open; the ABDM registry has no open export yet.
  - Kerala and Gujarat need another source. The state health departments' own lists would need their licence checked.
