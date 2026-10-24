# Check prompt for a Claude session in the Qura project (23 Oct 2026)

For when the Sakhi endpoint was merged but production still answered 404. Paste everything below the line into a Claude
session opened in `~/Desktop/qura_nutrition-version1`.

---

The Sakhi call-request endpoint (branch feat/sakhi-call-requests) was merged, but production doesn't serve it yet. At
10:24 UTC on 23 Oct, every request to POST https://quranutrition.com/api/partners/sakhi/v1/call-requests answered 404 (the
Next.js not-found page). The home page answered 200 from Vercel (bom1). Find out why and get it live. Read first; ask me
before changing anything.

1. GIT: Is the merge commit on origin/main? Does src/app/api/partners/sakhi/v1/call-requests/route.js exist there? Give the
   commit hash.
2. VERCEL: What is the current production deployment: its commit, status (building, error, ready), and when it was
   created? Is it behind origin/main? If the merge started no build, or the build failed, say so, with the error.
3. THE KEY:
   - Is SAKHI_PARTNER_KEY set for Production? Name only, never the value.
   - Was the current production deployment created after the key was set? Vercel only applies it to new deployments.
   - Check it matches the key Sakhi holds without showing it. The SHA-256 of Sakhi's key (hex of the exact 48-character
     value, no newline) is:
     038953efa98365ef9c41f0ca2c41bdaf11e3fb40e92a196e8fb2a42b24692d42
   - If you need the production value to compare, pull it to a temporary file, hash only that variable's value, delete the
     file at once, and never print the value. Tell me only "matches" or "doesn't match".
4. FIX: Propose the smallest fix (redeploy main, or promote the right deployment), and wait for my OK. If the key was set
   after the current deployment, the fix must make a new production deployment.
5. VERIFY, after the fix, only with requests that can't create a lead:
   - POST with a wrong X-Sakhi-Key: expect 401.
   - GET: expect 405.
   - If the code checks the key before the body (confirm from the code first): POST with the right key and an invalid body
     ({"ref":"QC-PROBE2"} or best_time "nope"). Expect 400, not 401, which proves the key matches end to end. Don't print
     the key; read it from the environment in your command.
   - Never send a valid body: that would create a real lead.
6. Tell me: the commit live in production, the status codes you saw, and "matches" or "doesn't match" for the key.
