# Build prompt for a Claude session in the Qura project: the Sakhi download page (23 Oct 2026)

Paste everything below the line into a Claude session opened in `~/Desktop/qura_nutrition-version1`. It is self-contained.

It builds the page Mohit asked for on 23 Oct ("i want to add a new page on qura website from where app can be downloaded with
app features and utility values along with screenshots of app"), from the mockup in `marketing/download-page/`. Two defaults
are Mohit's to change before pasting:
- The page is **unlisted** while Sakhi is in pilot: no nav or footer link, `noindex`, and not in the sitemap. To list it,
  change "UNLISTED" under DECISIONS to "LISTED".
- The APK lives in Qura's own `public/` folder, so a new Sakhi release means a commit to Qura's repo and a redeploy.

---

Add a download page for Sakhi to quranutrition.com. Work in a new git worktree from origin/main (the local checkout may be
behind), on a branch named feat/sakhi-download-page. Make only the changes listed here. Don't push, merge or deploy until I
say so.

WHAT IT IS
Sakhi is Qura's free reproductive-health app for Indian women: a period and pregnancy diary in Hindi and English that keeps
the diary on her phone, with Qura's "Ask Qura to call me" for a free first doctor call. It's an Android app (an APK), not on
the Play Store yet, so women download the file from this page and install it themselves. Most will arrive on an Android
phone from a WhatsApp link.

THE MOCKUP (read it first; it's the spec)
Sakhi's repo has a finished mockup of this page in Qura's theme. Read these files and nothing else in that repo, and don't
change anything there:
- ~/Desktop/QuraSakhi/sakhi/marketing/download-page/index.html: layout, sections, copy, alt text
- ~/Desktop/QuraSakhi/sakhi/marketing/download-page/shots/*.png: 9 app screenshots (780x1688) and app-icon.png (192x192).
  They show the app's built-in sample women, never a real person's diary. Use only these images of the app.
- ~/Desktop/QuraSakhi/sakhi/marketing/download-page/preview-desktop.jpg and preview-phone.jpg: how it should look
The mockup copied the header, footer, colours and fonts from the live site by hand. Build with the site's real header,
footer, layout, theme tokens and components instead, and use the mockup's CSS only as a layout reference. Leave out its
top "Mockup" banner.

FIRST, READ AND TELL ME (no code yet)
1. How pages are added: the router, the shared layout, and how EN/हि works (locale routing, message files, middleware).
2. Whether the locale or auth middleware, rewrites or redirects would touch /sakhi or /downloads/qura-sakhi.apk, and how
   to exclude the APK path.
3. How static files in public/ are served on Vercel (Content-Type and caching for an .apk), whether the repo has a rule
   or a size limit against committing a 5.3 MB binary, and whether it uses Git LFS.
4. The site's analytics on page views and clicks (first-party, Clarity, GA, Meta pixel), and where each is wired.
5. The existing WhatsApp button and link, so the page can reuse the same number.
Then propose the smallest plan (files to add and change) and wait for my OK.

DECISIONS (already made)
- Path: /sakhi. Visibility: UNLISTED. If UNLISTED: `noindex, nofollow`, not in the sitemap, and no nav or footer link
  (keep adding them a one-line change). If LISTED: add "Sakhi App" to the main nav after "PMOS Program" and to the footer's
  Quick Links, as in the mockup, and leave it indexable.
- The APK: copy ~/Desktop/QuraSakhi/Qura-Sakhi-0.34.1.apk to public/downloads/qura-sakhi.apk. Keep that file name for
  every release, so links already shared on WhatsApp keep working.
- One small release record (a JSON or TS file, whichever fits the codebase) that the page reads, so a new release only means
  replacing the APK and editing this record:
    versionName "0.34.1-pilot", versionCode 39, bytes 5349310,
    sha256 "992eb705145fba113330dca3d43414b4934f60f21ae977880e22da790cb45017",
    minAndroid "7.0", released "2026-10-23", path "/downloads/qura-sakhi.apk"
  The page shows the size from it ("About 5 MB") and the Android version. It doesn't need to show the version name or hash.
- The APK's response headers: Content-Type application/vnd.android.package-archive, Content-Disposition attachment;
  filename="Qura-Sakhi.apk", X-Content-Type-Options nosniff. Add them only if Vercel doesn't already send them, in whichever
  config the site already uses (next.config or vercel.json).
- Download buttons are plain links to the APK path, with the download attribute. On an iPhone or iPad (a user-agent check
  in the browser is enough), each download button becomes the line "Sakhi works on Android phones for now."
- "Ask us on WhatsApp" and the floating button use the site's existing WhatsApp number, with the pre-filled text
  "Hi, please send me the Sakhi app".
- Analytics: the page view as on every other page. One click event for the download, through the site's first-party
  analytics, with no parameters about the visitor. Don't add a Meta pixel event for it, and add no new trackers. Sakhi's rule
  is that no health signal goes to Meta.
- Metadata (English):
    title: "Sakhi: free period and pregnancy diary app | Qura"
    description: "Free Android app from Qura for Indian women: a period and pregnancy diary in Hindi and English that stays
    on your phone, with your first call to a Qura doctor free."
  Open Graph image: shots/home.png, or the site's usual OG pattern if it has one.

COPY
- Use the mockup's English copy word for word. It's written in Dr. Megha's voice and passed through the humanizer skill.
  If something has to change to fit a component, run the change through .claude/skills/humanizer/SKILL.md and list it in your
  report. Don't rewrite health lines. Those need a doctor's OK, and I'll get it.
- Keep the numbers as they are: 69 guides, 1.47 lakh government health centres, a free 20-minute first call, ₹0, Android 7
  or newer, about 5 MB. They come from the app.
- Hindi: follow the site's i18n pattern. If the हि version needs strings, wire the keys to fall back to English and list
  them for me. Don't machine-translate the page.

IMAGES AND PERFORMANCE
- Copy shots/*.png into public/images/sakhi/ and serve them through the site's image component, with their real width and
  height and the mockup's alt text. The top section's two phones load eagerly; everything below loads lazily.
- The phone frames are CSS around the screenshot. Don't add a notch: the screenshots have no status bar.
- Mobile first: at 390 px wide there's no sideways scroll, buttons are full width, and the two-phone rows stay side by side.

DON'T TOUCH
The legal pages, campaign_leads and the Sakhi call-request endpoint (/api/partners/sakhi), the remarketing and audience
scripts, and any other page.

CHECK BEFORE YOU REPORT
1. The site's own lint, type check, build and tests pass.
2. Locally, at 390 x 844 and 1440 x 900: the page matches the previews and has no horizontal scroll. The EN/हि toggle,
   header and footer behave as on other pages.
3. `curl -sI <local>/downloads/qura-sakhi.apk` returns 200, the Content-Type above and Content-Length 5349310, without a
   locale redirect. A downloaded copy's sha256 equals the one in the release record.
4. With an iPhone user agent, the buttons show the Android-only line instead.
5. If UNLISTED: the page's HTML has the noindex meta, and /sakhi isn't in the sitemap or any nav.

REPORT
The branch and worktree path, the files added and changed, the checks above with their results, every copy change and why,
any Hindi keys that are falling back to English, and what I have to do next (merge, deploy, and anything to set in Vercel).
Also add a short "Releasing a new Sakhi APK" note wherever the repo keeps docs:
1. Replace public/downloads/qura-sakhi.apk with the new file. It must be signed with the same Sakhi key, or phones refuse
   the update.
2. Update the release record (versionName, versionCode, bytes, sha256, released).
3. Commit and deploy, then check the headers and the sha256 with curl.
