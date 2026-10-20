// Playwright for the tests: this repo's own copy once `npm install` has run in the sakhi folder, otherwise the copy
// already installed in Qura's folder (a dev tool only; the app itself depends on nothing from Qura).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const from = (pkg) => { try { return createRequire(pkg)('playwright'); } catch (e) { return null; } };
const pw = from(path.resolve(here, '../../package.json')) || from('/Users/mohitkumar/Desktop/qura_nutrition-version1/package.json');
if (!pw) throw new Error('Playwright not found: run `npm install` in the sakhi folder');
export const chromium = pw.chromium;
