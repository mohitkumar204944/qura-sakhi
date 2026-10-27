// Version 39.10: joining the way a woman does it, for the suites that join from a new install (MODULE_API section 53):
// her language, Start, about you (name, then decade and year), her stage (7 tiles), up to 3 goals, a few details for her
// stage, then who uses this phone. Sign-up follows in each suite, with its own server.
//   join(page, { lang, name, dec, y, m, tile, goals, lp, lpd, lpm, gap, dx, pill, hfor, dates, dlen, heavy, pain, edd, lmp, birth,
//                bf, mp, share, kitOff, stop, under18, onScreen })
//   Version 39.26: dates: her period starts, oldest first, tapped on the calendar (with dlen, heavy, pain); without them, the
//   quick choices behind "I don't remember the dates" (lp, lpd, lpm), as before. hfor: on the pill, since when.
//   tile: cycle | pmos | ttc | preg | post | mid | meno (default cycle). goals: in the order she picks them (default: the tile's
//   first goal). lp: a last-period chip (default '7'). stop: 'stage' | 'goals' | 'details' | 'share' ends on that screen.
//   onScreen(name): called on each screen before it is answered ('about', 'stage', 'goals', 'details', 'share').
export const FIRST_GOAL = { cycle: 'track', pmos: 'irregular', ttc: 'ready', preg: 'food', post: 'recovery', mid: 'hot', meno: 'hot' };
const click = (page, sel) => page.$eval(sel, (el) => el.click());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function join(page, o = {}) {
  const at = async (sel) => { await page.waitForSelector(sel, { timeout: 10000 }); await click(page, sel); };
  const tick = (sel) => page.$eval(sel, (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
  const date = async (sel, val) => { await page.waitForSelector(sel); await page.fill(sel, val); await page.$eval(sel, (e) => e.dispatchEvent(new Event('change', { bubbles: true }))); };
  const onScreen = o.onScreen || (async () => {});
  if (o.lang !== false) await at('[data-ob-lang="' + (o.lang || 'en') + '"]');
  await at('#w-start');
  await page.waitForSelector('#ob-name'); await onScreen('about');
  if (o.name) await page.fill('#ob-name', o.name);
  if (o.under18) { await at('[data-ob-dec="post"]'); return; }
  await at('[data-ob-dec="' + (o.dec || 1990) + '"]'); await at('[data-ob-y="' + (o.y || 1994) + '"]');
  if (o.m) await at('[data-ob-m="' + o.m + '"]');
  await page.waitForSelector('[data-ob-st]'); await onScreen('stage');
  if (o.stop === 'stage') return;
  const tile = o.tile || 'cycle';
  await at('[data-ob-st="' + tile + '"]');
  await page.waitForSelector('[data-ob-goal]'); await onScreen('goals');
  if (o.stop === 'goals') return;
  for (const g of (o.goals || [FIRST_GOAL[tile]])) await at('[data-ob-goal="' + g + '"]');
  await at('#ob-next');
  await sleep(150); await onScreen('details');
  if (o.stop === 'details') return;
  if (tile === 'preg') {
    const k = o.edd ? 'edd' : (o.lmp ? 'lmp' : null);
    if (k) { await at('[data-ob-pq="' + k + '"]'); await date('#ob-' + k, o[k]); await at('#ob-next'); } else await at('[data-ob-pq="later"]');
  } else if (tile === 'post') {
    await date('#ob-birth', o.birth); if (o.bf) await at('[data-ob-bf="' + o.bf + '"]'); await at('#ob-next');
  } else if (tile === 'meno') await at('[data-ob-mp="' + (o.mp || '1') + '"]');
  else {
    if (o.dates) {
      const tapDay = async (d) => { for (let i = 0; i < 26 && !(await page.$('[data-jd-day="' + d + '"]')); i++) { const first = await page.$eval('[data-jd-day]', (b) => b.dataset.jdDay); await click(page, d < first ? '#jd-prev' : '#jd-next'); await sleep(40); } await at('[data-jd-day="' + d + '"]'); };
      for (const d of o.dates) await tapDay(d);
      for (let i = 5; i < (o.dlen || 5); i++) await at('#jd-plus');
      for (let i = o.dlen || 5; i < 5; i++) await at('#jd-minus');
      if (o.heavy) await tick('[data-jd-tick="heavy"]');
      if (o.pain) await tick('[data-jd-tick="pain"]');
    } else {
      if (await page.$('#jd-none')) await at('#jd-none');
      await at('[data-ob-lp="' + (o.lp || '7') + '"]');
      if (o.lpd) await date('#ob-lpd', o.lpd);
      if (o.lpm) await at('[data-ob-lpm="' + o.lpm + '"]');
    }
    if (o.gap) await at('[data-ob-gap="' + o.gap + '"]');
    if (o.dx) await at('[data-ob-dx="' + o.dx + '"]');
    if (o.pill) { await tick('#ob-pill'); if (o.hfor) await at('[data-ob-hfor="' + o.hfor + '"]'); }
    await at('#ob-next');
  }
  await page.waitForSelector('[data-ob-sh]'); await onScreen('share');
  if (o.stop === 'share') return;
  await at('[data-ob-sh="' + (o.share || 'me') + '"]');
  if (o.share && o.share !== 'me') {
    for (const k of (o.kitOff || [])) await page.$eval('[data-ob-kit="' + k + '"]', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); });
    await at('#ob-done');
  }
}
