// Phone walk helper (6 Nov 2026, the launch QA walk), for a test copy of the app built with WebView debugging on (never the
// real app): runs JavaScript in the phone's WebView over the Chrome DevTools protocol and prints the result.
// First: adb forward tcp:9333 localabstract:webview_devtools_remote_$(adb shell pidof com.quranutrition.sakhi.e2e)
// Usage (from web/): node test/adb-cdp.mjs '<expression>'      e.g. 'scrollY' or 'location.hash'
//                    node test/adb-cdp.mjs --file script.js     (the file's last expression is printed)
import fs from 'node:fs';
import { chromium } from './pw.mjs';

const arg = process.argv[2] === '--file' ? fs.readFileSync(process.argv[3], 'utf8') : process.argv.slice(2).join(' ');
const browser = await chromium.connectOverCDP('http://localhost:' + (process.env.CDP_PORT || 9333));
const page = browser.contexts()[0].pages()[0];
try {
  const out = await page.evaluate((src) => { const r = (0, eval)(src); return r instanceof Promise ? r.then((v) => JSON.stringify(v, null, 1)) : JSON.stringify(r, null, 1); }, arg);
  console.log(out);
} catch (e) { console.log('ERROR ' + e.message); process.exitCode = 1; }
await browser.close().catch(() => {});
