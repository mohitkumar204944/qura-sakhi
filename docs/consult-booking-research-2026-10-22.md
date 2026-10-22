# Free doctor consults and other free services from Sakhi (22 Oct 2026)

Mohit asked: "are there any apis available that can make users book doctor consults in a scheme for free using qura sakhi
only, do a check on if we can extend service offerings".

Two research agents checked official sources on 22 Oct 2026. The UHI launch was spot-checked against PIB's release. Every
option was judged against Sakhi's rules:
- free for her, and no new spend;
- the diary stays on the phone;
- reproductive health only;
- no automating CAPTCHA portals.

## 1. The short answer

**No API lets Sakhi book a free consult inside the app without new spend.**
- **eSanjeevani** is the free national telemedicine service, with Obs & Gynae OPDs in several states. It has no public API,
  SDK or partner programme, and its site is behind a CAPTCHA.
- **UHI is the only official way an outside app can book.** UHI is ABDM's open network; it launched on 29 Jun 2026.
  - Its live services are blood-bank search, PM-JAY hospital search, Jan Aushadhi store search, ambulance booking and
    in-person doctor consults. ORS government-hospital slots are on it too, according to the ORS site.
  - Government programmes such as eSanjeevani teleconsults are listed for the "next phase".
  - Joining needs ABDM certification: ABHA login in Sakhi, a server in India, a paid functional test and a paid WASA
    security audit, and months of work.
- **What Sakhi can do with no spend** is send her to the official site or app with links (https, `tel:`, Play Store) and say
  exactly what to pick there. Nothing from the diary goes anywhere, but Sakhi can't confirm the booking or show its status.
- **The only consult Sakhi could book end to end is Qura's own,** through the planned doctor hand-off (`server/SERVER_SPEC.md`
  section 10.1).

## 2. Booking a free doctor consult

| Service | Free? | Route for Sakhi | What it would take | Live? |
|---|---|---|---|---|
| **eSanjeevani** (teleconsult; Ayushman Arogya Mandir hub-and-spoke) | Yes | **Links only.** Sign-in: `esanjeevani.mohfw.gov.in/#/patient/signin`. OPD timings: `…/#/opd-timing`. Android app `hied.esanjeevaniabopd.com`. No API; the site's own calls are behind reCAPTCHA | Nothing, for links. In-app booking only through UHI, when eSanjeevani joins (NHA said around Feb 2025 that it would) | Yes: 50 crore consults, 57% of users are women. Obs & Gynae OPDs: Delhi, Kerala, Punjab, Rajasthan, UP, Karnataka, Maharashtra, J&K, Jharkhand (Thursday 2–3), central hospitals, AIIMS Rajkot and Rishikesh, ESIC. Other states have the General OPD. At an Arogya Mandir the health officer books it |
| **ORS** (OPD slots at government hospitals, including AIIMS) | Generally free | **Link:** `ors.gov.in/orsportal/` (image CAPTCHA, mobile OTP or ABHA). The site says it works in Aarogya Setu 2.0 and other UHI apps | Through UHI only | Yes: 2,124 hospitals, 1.47 crore bookings |
| **Aarogya Setu 2.0** (the government's own UHI app) | Yes | **App link:** `nic.goi.aarogyasetu`. Doctor discovery, Scan & Share, UHI booking | Nothing | Yes, relaunched 29 Jun 2026 |
| **Scan & Share** (OPD token at the hospital counter) | Yes | Only in certified health-record apps (the ABHA app, Aarogya Setu and 35 others) | Full health-record app status. Not worth building: it only queues her at the counter | Yes: 23 crore tokens |
| **UHI End User App** (booking inside Sakhi) | Depends on the provider | Become an End User App | Steps below (section 4) | Network live; government teleconsults not yet |
| **Tele-MANAS** (mental health, including after a birth) | Yes | `tel:14416`, `tel:18008914416`, and the app `org.telemanas.citizen` | Nothing | Yes |
| **104** (health advice, run by each state) | Yes | `tel:104` (Sakhi already lists it) | Nothing | Yes |
| **PMSMA** (a free doctor check-up in pregnancy on the 9th) | Yes | Walk-in. Facility finder: `pmsma.mohfw.gov.in/pmsma-nearest-health-facility/` (no login) | Nothing; Sakhi's plan already reminds her on the 9th | Yes |

## 3. Other free services Sakhi could point to

| What she could do | Route | Notes |
|---|---|---|
| Book Td in pregnancy and her baby's vaccines (U-WIN) | `uwinselfregistration.mohfw.gov.in/login` (OTP). No API | Link it from the Td and vaccine reminders |
| Find a hospital where a birth or C-section is free (PM-JAY) | `hem.nha.gov.in/search`; card check at `beneficiary.nha.gov.in` (OTP, CAPTCHA) or the Ayushman app `com.beneficiaryapp` | C-section and high-risk delivery packages are "primarily for government facilities" (HBP 2.2); a private hospital needs a referral |
| Free ambulance (102/108, JSSK transport) | `tel:102`, `tel:108`, `tel:112`; state apps (TN Avasaram 108, 108 Gujarat, UP 108) | No API; the call goes to the state |
| One Stop Centre visit, Women Helpline, NCW | `missionshakti.wcd.gov.in/appointmentBooking` (CAPTCHA); `tel:181`, NCW `tel:14490`; Mission Shakti app `com.mwcd.missionshakti` | Keep behind the app lock, next to the safety pages |
| Cheap medicines and pads (Jan Aushadhi) | Locator and MRP list on janaushadhi.gov.in; Sugam app `in.gov.pmbjp` | An "ask for" list with product codes, if the doctor approves it: combined pill 1308/1307, levonorgestrel 1.5 mg 2044, ferrous ascorbate with folic acid 498, calcium with D3 220, Suvidha pads ₹1. No ordering API |
| Take-home rations, pregnancy calls, HIV and syphilis tests | Poshan helpline `tel:1515`; Kilkari `tel:14423`; NACO `tel:1097` and the NACO app | Links only |
| State programmes | TN PICME 3.0 (`picme3.tn.gov.in`, register a pregnancy for the Muthulakshmi Reddy benefit); Gujarat `1000d.gujarat.gov.in` | Show by her state |
| Keep the doctor report in DigiLocker | She saves the PDF and uploads it herself | The partner API needs NeGD approval, a paid STQC audit and Sakhi's server in the middle |

Not possible for any of these: booking, eligibility checks or ordering inside Sakhi, and any API for ambulance dispatch,
eRaktKosh, NCW or 181. Calling the sites' internal endpoints would be scraping.

## 4. What booking inside Sakhi through UHI would take

1. ABDM sandbox access (free). Access is revoked after a year with no progress.
2. Health Tech Committee approval.
3. **ABHA login (milestone M1) inside Sakhi.**
4. A server in India for UHI callbacks.
5. A functional test by an NHA-empanelled agency (fee not published).
6. A WASA "safe to host" audit by a CERT-In empanelled firm, roughly ₹0.5–2 lakh by vendor estimates.
7. A Health Tech Committee demo, and an exit form with a GSTIN and a signed undertaking sent by courier.
8. UHI self-certification: tested with at least 2 providers, with 95% success over the last 20 transactions.
9. The app must offer specialty search, slots, a payment page, cancel and reschedule, chat, a video link and feedback.

**Data that would leave the phone:** searches (specialty and place) go to the gateway and every provider. A booking sends her
ABHA address, name, date of birth, gender and phone. An "Obs & Gynae" search is itself health information.

**Verdict:** not now. It breaks "no new spend" and takes months. The one free teleconsult worth booking, eSanjeevani, isn't on
UHI yet. Revisit if eSanjeevani joins UHI and Qura budgets the audit.

## 5. Recommendation

**Built on 22 Oct 2026 as Version 29**, the "Free doctor and care" section (item 1). The details are in `web/MODULE_API.md`
section 31, and the new wording is in `docs/wording-review-v28.md` section 6.

1. **Now, at no cost (a small version):** a "Free doctor and care" section built from sections 2 and 3:
   - eSanjeevani, with "choose your state's Obs & Gynae OPD, or the General OPD";
   - ORS and Aarogya Setu 2.0;
   - the PMSMA finder;
   - Tele-MANAS (app and 14416);
   - U-WIN from the Td reminders;
   - 102/108 with the JSSK line;
   - the PM-JAY hospital finder with the C-section note;
   - One Stop Centre booking, 181 and 14490 on the safety pages.

   Rules:
   - Links open in the phone's browser or app, never framed inside Sakhi.
   - No personal data in any link.
   - New wording goes to the doctor first.
2. **Real booking with status:** the Qura doctor hand-off (B3, SERVER_SPEC 10.1). She asks, and Qura's team confirms a time
   in the app. It needs the Qura-side endpoint and a named coordinator, which is decision 6 in the research doc.
3. **Only with budget, later:** a UHI End User App, once eSanjeevani is on the network.

## 6. Not verified

- Whether eSanjeevani is bookable in Aarogya Setu 2.0, and how a patient picks an OPD after logging in.
- UHI's participant list, market rules ("coming soon") and approval time. Official fees for the functional test and the
  WASA audit.
- Which ORS hospitals take gynae bookings. Whether ESIC's eSanjeevani OPDs serve women who aren't insured with ESIC.
- Tele-MANAS video consults nationwide, and any pathway for mood after a birth.
- DigiLocker fees, and whether the STQC audit is still required.
- Deep links into U-WIN beyond the login page, and Td sessions in every state.
- Whether hem.nha.gov.in/search works without a login, and whether Rajasthan's MAA voucher still runs in 2026.
- On 22 Oct these sites didn't respond: suman.nhp.gov.in, meraaspataal, 112.gov.in, pmjay.gov.in.

## 7. Sources (read 22 Oct 2026)

- **UHI launch:** PIB, 29 Jun 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2278987
- **ABDM backgrounder:** PIB, 6 Jul 2026:
  https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jul/doc202676912801.pdf
- **eSanjeevani:**
  - PIB, 6 Oct 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2319427
  - OPD timings: https://esanjeevani.mohfw.gov.in/#/opd-timing
  - Play: https://play.google.com/store/apps/details?id=hied.esanjeevaniabopd.com
  - Report on its move to UHI:
    https://www.digitalhealthnews.com/central-govt-to-integrate-telemedicine-services-under-unified-health-interface
- **ABDM onboarding:**
  - sandbox exit: https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=SandboxExit
  - UHI Starter Guide:
    https://sandboxcms.abdm.gov.in/uploads/Unified_Health_Interface_Starter_Guide_v_F_21acedb49c.pdf
  - integrator FAQ, Nov 2025: https://sandboxcms.abdm.gov.in/uploads/FAQ_20_11_2025_808a25df64.pdf
  - sandbox inactivity advisory, 14 Oct 2026:
    https://sandboxcms.abdm.gov.in/uploads/Advisory_regarding_status_in_abdm_3095564f71.pdf
  - partners: https://abdm.gov.in/our-partners
  - audit cost estimate (a vendor, not official): https://codingclave.com/guides/abdm-m1-m2-m3-certification-guide-india-2026
- **Scan & Share:** https://abdm.gov.in/strapicms/uploads/ABDM_Scan_and_Share_Onboarding_Manual_18_01_2023_1_0600fe7747.pdf
- **ORS:** https://ors.gov.in/orsportal/
- **Aarogya Setu 2.0:** https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu
- **Tele-MANAS:** https://telemanas.mohfw.gov.in/
- **PMSMA:**
  - PIB, 8 Jun 2026: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202668887301.pdf
  - facility finder: https://pmsma.mohfw.gov.in/pmsma-nearest-health-facility/
- **U-WIN:** https://uwin.mohfw.gov.in
- **PM-JAY package rules (HBP 2.2):**
  https://bsmedia.business-standard.com/_media/bs/data/general-file-upload/2025-04/Ayuhman%20Bharat%20Health%20Benefit%20Package%20HBP-2.2-manual.pdf
- **Jan Aushadhi medicines list:** PIB, Feb 2026:
  https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/feb/doc202626781701.pdf
- **JSSK and SUMAN:** https://www.nhm.gov.in/images/pdf/maternal-health/iec/Print-material/Suman_Brochure.pdf
- **NCW 14490:** PIB, Jul 2026: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jul/doc202673909801.pdf
- **DigiLocker:**
  - partner SOP: https://cf-media.api-setu.in/resources/Partners-SOP.pdf
  - API spec: https://apis.guru/apis/digitallocker.gov.in/authpartner
- **TN PICME:** https://picme3.tn.gov.in/api/react2/commonImages/FAQ.pdf
- **Free diagnostics:** https://nhsrcindia.org/fdsi-map-table
