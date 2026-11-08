/* Qura Sakhi pictures. Everything is inline SVG drawn here (no image files, so the app works offline), and every colour is an
   --art-* or --h-* token from app.css, so the pictures follow light and dark mode.
     S.art.produce(week)           the fruit, vegetable or kitchen staple for a pregnancy week (64x64)
     S.art.food(key)               a food or kitchen measure by name (Version 39.8): roti, dal, dahi, milk, egg, saag, the
                                   produce drawings and more (64x64); S.art.hasFood(key)
     S.art.sign(key)               a danger-sign pictogram for Help (Version 39.8): bleed, water, fever, head, fits, swell, moves...
     S.art.flower(month, petals)   that month's flower with 0-12 petals (the petal garden)
     S.art.spot(key)               a small coloured picture for a Care topic or a Learn group
     S.art.badge(icon, hue, on)    a rosette badge
     S.art.sakhi({ pose, look })   Sakhi herself: 'hi', 'calm' or 'cheer', in one of four looks
   Loaded after app.js and before the modules. */
(function (S) {
  'use strict';
  if (!S) return;
  let uid = 0;
  const fill = (c, extra) => ' style="fill:var(--art-' + c + ')' + (extra ? ';' + extra : '') + '"';
  const line = (c, w, extra) => ' style="fill:none;stroke:var(--art-' + c + ');stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round' + (extra ? ';' + extra : '') + '"';
  const wrap = (vb, body, cls, label) => '<svg class="art' + (cls ? ' ' + cls : '') + '" viewBox="' + vb + '"' + (label ? ' role="img" aria-label="' + S.esc(label) + '"' : ' aria-hidden="true" focusable="false"') + '>' + body + '</svg>';
  const shadow = (rx) => '<ellipse cx="32" cy="57" rx="' + (rx || 17) + '" ry="3"' + fill('shadow') + '/>';
  const shine = (cx, cy, rx, ry, rot) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + fill('white', 'opacity:.42') + '/>';
  const leaf = (d, c) => '<path d="' + d + '"' + fill(c || 'leaf') + '/>';
  const dots = (pts, r, c, extra) => pts.map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"' + fill(c, extra) + '/>').join('');

  /* ---------- tiny seeds sit under a magnifying glass ---------- */
  const lens = (inner) => '<circle cx="28" cy="28" r="19"' + fill('cream') + '/>' + inner +
    '<circle cx="28" cy="28" r="19"' + line('glass', 3.5) + '/><path d="M42 42l11 11"' + line('glass', 6) + '/>' +
    '<path d="M16.6 22.4a12.5 12.5 0 0 1 6.8-6.8"' + line('white', 2.6, 'opacity:.85') + '/>';

  /* ---------- one drawing per thing the pregnancy weeks compare the baby to ---------- */
  const P = {
    khaskhas: () => lens('<path d="M24 28.4c0-2.6 2.4-4.1 4.8-3.6 2.2.5 2.8 2.6 1.5 3.9 1.4 1.1 1.1 3.3-1.1 3.8-2.7.6-5.2-1.3-5.2-4.1z"' + fill('tan-2') + '/>'),
    rai: () => lens('<circle cx="28" cy="28" r="3.8"' + fill('brown-2') + '/><circle cx="26.8" cy="26.7" r="1.1"' + fill('white', 'opacity:.6') + '/>'),
    masoor: () => lens('<ellipse cx="28" cy="28" rx="6.4" ry="4.6"' + fill('orange') + '/><ellipse cx="28" cy="28" rx="6.4" ry="4.6"' + line('orange-2', 1) + '/><ellipse cx="26" cy="26.6" rx="2.3" ry="1.1"' + fill('white', 'opacity:.5') + '/>'),
    chana: () => shadow(14) + '<path d="M24 21.5C26.6 19.6 29.2 18.8 32 18.8 41 18.8 47 25.4 47 33.6 47 42 40.6 48.6 32 48.6 23.4 48.6 17 42 17 33.6 17 29 19.2 24.6 22.8 22Z"' + fill('tan') + '/>' +
      '<path d="M22.6 22.4C23.4 19.6 25.4 17.6 28.4 17 28 19.4 26.2 21.4 23.6 22.6Z"' + fill('tan-2') + '/>' +
      '<path d="M25.5 27.5c3.2-2.4 8.6-2.6 12 .6"' + line('tan-2', 1.8) + '/>' + shine(38, 31, 3.4, 2.2, -20),
    rajma: () => shadow(17) + '<path d="M14 35C14 25.5 21.5 19 30.5 19.5 35.5 19.8 37.5 23.2 41.5 23.2 46.5 23.2 50 27.2 50 32.4 50 41.5 42 47.5 32 47.5 21.5 47.5 14 42.5 14 35Z"' + fill('red-2') + '/>' +
      '<path d="M21 30c1.8-4.2 5.6-6.4 9.8-6.4"' + line('white', 2.6, 'opacity:.4') + '/>' + dots([[38, 38], [27, 40], [43, 32]], 1, 'white', 'opacity:.25'),
    angoor: () => shadow(13) + '<path d="M32 23.6C33 18.4 34.4 15.6 36.6 13.8"' + line('brown', 2.4) + '/>' +
      leaf('M36 14.6C40.4 9.4 47 9.8 49.6 12.6 46.2 17 40.4 17.6 36 14.6Z') + '<path d="M38 14.2C41.6 13 44.8 12.6 47.6 12.8"' + line('leaf-2', 1) + '/>' +
      '<ellipse cx="32" cy="38" rx="12.5" ry="14.5"' + fill('lime') + '/><path d="M33 24.4c6 2.8 8.6 8.4 8.4 14"' + line('lime-2', 1.4, 'opacity:.5') + '/>' + shine(27.4, 32, 3.4, 5, -15),
    amla: () => shadow(15) + '<path d="M32 21v-4.6"' + line('brown', 2.4) + '/>' + leaf('M32.6 17.4C35.6 12.6 41 11.8 44 13.8 41.4 17.6 36.6 18.8 32.6 17.4Z') +
      '<circle cx="32" cy="36.4" r="15.5"' + fill('lime') + '/><circle cx="32" cy="36.4" r="15.5"' + fill('cream', 'opacity:.32') + '/>' +
      '<path d="M32 21C26.6 27.4 26.6 45.4 32 51.8M32 21C37.4 27.4 37.4 45.4 32 51.8M32 21C22.6 26.2 20.6 46.4 32 51.8M32 21C41.4 26.2 43.4 46.4 32 51.8"' + line('lime-2', 1.2, 'opacity:.5') + '/>' + shine(26, 30.4, 3.2, 4.6, -25),
    nimbu: () => shadow(17) + leaf('M29.6 21.4C25.2 14 29.6 8.4 37.4 8.6 37.4 15.8 34.6 20.4 29.6 21.4Z') + '<path d="M30.4 20.2C32 16.4 34 13 36.6 10.2"' + line('leaf-2', 1.1) + '/>' +
      '<ellipse cx="13.6" cy="34.5" rx="2.4" ry="2"' + fill('lime-2') + '/><ellipse cx="50.6" cy="34.5" rx="2.6" ry="2.1"' + fill('lime-2') + '/>' +
      '<ellipse cx="32" cy="34.5" rx="18" ry="14"' + fill('lime') + '/>' + shine(24, 28.5, 5, 2.6, -15) + dots([[38, 38], [42, 33], [28, 40], [35, 31]], 0.9, 'lime-2', 'opacity:.6'),
    chiku: () => shadow(15) + '<path d="M32 22.5V18"' + line('brown-2', 2.4) + '/>' + leaf('M32.6 18.6C35 14.4 39.8 13.6 42.4 15.4 40.2 18.8 36 20 32.6 18.6Z') +
      '<ellipse cx="32" cy="36" rx="15" ry="14"' + fill('brown') + '/>' + dots([[26, 30], [36, 28], [40, 38], [30, 42], [24, 38], [34, 35], [44, 32], [38, 45]], 1, 'brown-2', 'opacity:.45') + shine(26, 29, 3.6, 2.4, -25),
    matar: () => shadow(20) + '<path d="M9.5 38.5C6.6 37.6 5.6 34.6 7.6 32.4"' + line('leaf-2', 2) + '/>' +
      '<path d="M9.5 38.5C17.5 25.5 34 19.5 55 21.5 49 34 32.5 44.5 9.5 38.5Z"' + fill('leaf') + '/>' +
      '<path d="M14 36.2C22 28.6 34 25.4 49.4 25 44.4 32.2 31.4 39.2 14 36.2Z"' + fill('lime') + '/>' +
      [[21, 33.4], [28, 31.2], [35, 29.6], [42, 28]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6"' + fill('leaf') + '/><circle cx="' + (p[0] - 1.1) + '" cy="' + (p[1] - 1.1) + '" r="1"' + fill('white', 'opacity:.5') + '/>').join(''),
    amrood: () => shadow(16) + '<path d="M32 19.6C32 16.4 33 14.2 35 12.6"' + line('brown', 2.2) + '/>' + leaf('M34.6 13.4C38.6 8.6 45 8.6 47.6 11.4 44.4 15.6 38.8 16.4 34.6 13.4Z') +
      '<path d="M32 19C42.4 19 49.4 27 48.6 37 47.8 46 40.6 51 32 51 23.4 51 16.2 46 15.4 37 14.6 27 21.6 19 32 19Z"' + fill('lime') + '/>' +
      '<ellipse cx="37" cy="39" rx="10.5" ry="9"' + fill('yellow', 'opacity:.3') + '/><path d="M29.8 50.6l2.2-2.4 2.2 2.4"' + line('lime-2', 1.6) + '/>' + shine(25, 29, 3.6, 5.4, -25),
    tamatar: () => shadow(18) + '<path d="M32 21C43 21 50 27.5 50 36.5 50 45.5 42 51 32 51 22 51 14 45.5 14 36.5 14 27.5 21 21 32 21Z"' + fill('red') + '/>' +
      '<path d="M24 23.5C21.5 30 21.5 42 25 49.6M40 23.5C42.5 30 42.5 42 39 49.6"' + line('red-2', 1.3, 'opacity:.35') + '/>' +
      '<path d="M32 17.5l2.8 4.6 5.4-.9-3.6 3.8 2.8 4.1-5.1-1.5-2.3 4.4-2.3-4.4-5.1 1.5 2.8-4.1-3.6-3.8 5.4.9Z"' + fill('leaf') + '/>' +
      '<path d="M32 19v-5"' + line('leaf-2', 2.6) + '/>' + shine(23.5, 33, 4, 2.6, -35),
    seb: () => shadow(17) + '<path d="M32 23.5C32 19.4 33 16.6 35.2 14.2"' + line('brown-2', 2.4) + '/>' + leaf('M34.6 17C38.4 11 45 10.8 47.6 13.8 43.8 18.2 38.4 19.2 34.6 17Z') +
      '<path d="M32 24C27 18.6 15 20.4 15 33.4 15 44.4 23.6 52.6 29.8 50.4 31 50 33 50 34.2 50.4 40.4 52.6 49 44.4 49 33.4 49 20.4 37 18.6 32 24Z"' + fill('red') + '/>' + shine(23.4, 32, 3.6, 6, -10),
    anaar: () => shadow(16) + '<path d="M26.6 24L27.2 15.4 29.8 19.6 32 14 34.2 19.6 36.8 15.4 37.4 24Z"' + fill('red-2') + '/>' +
      '<circle cx="32" cy="37" r="15.5"' + fill('red') + '/><path d="M43.4 28.6C48.6 37.4 44.8 48.4 33.6 52.2 41.2 47.2 44.8 38.4 43.4 28.6Z"' + fill('red-2', 'opacity:.55') + '/>' +
      '<ellipse cx="32" cy="22.8" rx="5.4" ry="1.8"' + fill('red-2') + '/>' + shine(24.6, 31, 3.4, 5.2, -20),
    shakarkandi: () => shadow(21) + '<path d="M9.6 35.4C6.6 35.6 4.4 34.4 3 32.4"' + line('plum', 1.6) + '/>' +
      '<path d="M9.4 35.6C13 27.6 25 23.6 37.6 24.4 48.4 25 54.8 29.2 56 32.6 54.8 37.2 46.4 42.8 34 43.6 21.6 44.4 12.8 41.4 9.4 35.6Z"' + fill('plum') + '/>' +
      '<path d="M22 31.4c2.4-.8 5-1.2 7.6-1.2M36 36.6c2.6-.2 5-.8 7.2-1.8M28 39c1.6.2 3.2.2 4.8 0"' + line('plum-2', 1.3, 'opacity:.6') + '/>' + shine(26, 29, 6, 1.8, -6),
    aam: () => shadow(18) + '<path d="M23.4 21.4C22.6 18.6 22.6 16.4 23.6 14.2"' + line('brown-2', 2.2) + '/>' + leaf('M23.6 14.8C29.4 8.8 39.4 7.8 45.6 10 39.6 15.4 31.6 17.2 23.6 14.8Z') + '<path d="M26.4 14.4C32.4 12.4 38.4 11.2 43.6 10.6"' + line('leaf-2', 1) + '/>' +
      '<path d="M23 21.4C35.4 15.2 51 23.8 50.6 37.4 50.4 46.6 42.4 51.8 33.2 50.8 26 50 23 45.6 21.2 40.6 19.4 35.6 13.6 32 14.4 26.6 15 22.8 18.6 21 23 21.4Z"' + fill('yellow') + '/>' +
      '<path d="M37.6 22.6C45.6 25.4 50.6 31 50.6 37.4 46 33.8 41.4 29 37.6 22.6Z"' + fill('orange', 'opacity:.75') + '/>' + shine(27, 33, 3.2, 6, -30),
    baingan: () => shadow(18) + '<path d="M32 20V11.6C32 10.6 33 9.6 34.6 9.2"' + line('leaf-2', 3) + '/>' +
      '<path d="M32 22C44.6 22 51.6 31 50.6 40.4 49.6 48.6 41.4 53.6 32 53.6 22.6 53.6 14.4 48.6 13.4 40.4 12.4 31 19.4 22 32 22Z"' + fill('purple') + '/>' +
      '<path d="M21.4 27C23.6 20.6 27.6 18.2 32 18.2 36.4 18.2 40.4 20.6 42.6 27 38.6 24.6 36 25.4 34.2 27.6 33.2 25.6 30.8 25.6 29.8 27.6 28 25.4 25.4 24.6 21.4 27Z"' + fill('leaf') + '/>' +
      '<path d="M20.6 38.6C21.4 33 24.6 29.4 29 28.2"' + line('white', 2.8, 'opacity:.32') + '/>',
    kheera: () => shadow(20) + '<path d="M12.4 44.6C10.4 40.6 12.4 36.2 16.6 34.2L44.4 18.4C48.4 16.2 52.6 17.2 53.8 21 55 24.8 52.8 28.2 48.8 30.2L20.6 46C16.6 48.2 14 47.6 12.4 44.6Z"' + fill('leaf') + '/>' +
      '<path d="M17.8 40.4L46 24.6M20.6 43.4L47.8 28"' + line('lime', 1.8, 'opacity:.55') + '/>' +
      dots([[24, 38.6], [31, 35], [38, 31], [44, 27.2], [28, 40.4], [35, 36.4], [42, 32.4]], 0.9, 'leaf-2') +
      '<ellipse cx="52.4" cy="22.4" rx="2.4" ry="3" transform="rotate(35 52.4 22.4)"' + fill('lime') + '/>',
    papita: () => shadow(16) + '<path d="M32 9.6v-3"' + line('leaf-2', 2.6) + '/>' +
      '<path d="M32 9.6C42 9.6 48.4 19.6 48.4 32 48.4 45 41.4 54.4 32 54.4 22.6 54.4 15.6 45 15.6 32 15.6 19.6 22 9.6 32 9.6Z"' + fill('lime') + '/>' +
      '<path d="M32 12.8C40.2 12.8 45.4 21.6 45.4 32 45.4 43.4 39.4 51.4 32 51.4 24.6 51.4 18.6 43.4 18.6 32 18.6 21.6 23.8 12.8 32 12.8Z"' + fill('orange') + '/>' +
      '<path d="M32 21.6C35.8 21.6 38.2 26.8 38.2 33 38.2 40 35.4 45.2 32 45.2 28.6 45.2 25.8 40 25.8 33 25.8 26.8 28.2 21.6 32 21.6Z"' + fill('orange-2') + '/>' +
      dots([[30, 26.6], [34, 27.4], [29, 31], [33, 31.4], [35.6, 34.6], [30, 35.2], [33, 38.4], [30.6, 40.8], [33.6, 42], [28.4, 38]], 1.4, 'seed'),
    lauki: () => shadow(20) + '<path d="M53.4 15.6C55.2 13.8 56.2 11.6 56.2 9.4"' + line('leaf-2', 2.4) + '/>' +
      '<path d="M10 46.4C8.4 41.4 11.4 36.4 16.4 34.2 22.4 31.4 26.4 30.2 31.8 26.2 37.6 21.8 41.6 16 46.8 13.8 50.8 12.2 54 13.8 54 17 54 20.2 51.2 22.2 48.2 24.4 43.4 27.6 40.4 32.6 35.4 37.4 31.2 41.4 26.4 46.4 20.4 49.2 15.4 51.4 11.4 50.4 10 46.4Z"' + fill('lime') + '/>' +
      '<path d="M14.8 42.4C19.6 38.6 26.6 36 31.4 32.4M33.6 30.4C38 26.4 42.4 21 47.6 17.6"' + line('white', 1.8, 'opacity:.35') + '/>' +
      [[22, 41], [30, 36.6], [40, 28], [46, 21.6], [17, 46]].map((p) => '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.2" ry=".8"' + fill('cream', 'opacity:.55') + '/>').join(''),
    phoolgobhi: () => shadow(19) +
      leaf('M10.6 41.6C11.4 29 19.6 23.6 26 29.6 22 35.6 18 42 13.6 46.6Z') + leaf('M53.4 41.6C52.6 29 44.4 23.6 38 29.6 42 35.6 46 42 50.4 46.6Z') +
      [[24, 31, 7.6], [40, 31, 7.6], [32, 25.6, 8], [21.6, 38.4, 6.6], [42.4, 38.4, 6.6], [32, 36, 8.6], [27, 32.4, 6.2], [37, 32.4, 6.2]].map((c) => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"' + fill('cream') + '/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"' + line('cream-2', 1) + '/>').join('') +
      dots([[29, 24], [35, 26], [24, 30], [40, 30], [31, 34], [36, 37], [27, 38]], 0.9, 'cream-2') +
      '<path d="M15 47.4C21 40.6 28.4 42.4 32 50.4 26 52.6 19.6 51.6 15 47.4Z"' + fill('leaf-2') + '/><path d="M49 47.4C43 40.6 35.6 42.4 32 50.4 38 52.6 44.4 51.6 49 47.4Z"' + fill('leaf-2') + '/>' +
      '<path d="M18.6 47.2C22.4 46.4 26.4 47.4 30 50M45.4 47.2C41.6 46.4 37.6 47.4 34 50"' + line('lime', 1, 'opacity:.7') + '/>',
    pattagobhi: () => shadow(18) + '<circle cx="32" cy="35" r="17"' + fill('lime') + '/>' +
      '<path d="M15 35C15 24.4 22.4 17.6 32 17.6 26.4 22.4 22.6 30 23.2 39.4 23.6 45.6 26.2 49.6 30 52 21 51 15 44.2 15 35Z"' + fill('leaf') + '/>' +
      '<path d="M49 35C49 24.4 41.6 17.6 32 17.6 37.6 22.4 41.4 30 40.8 39.4 40.4 45.6 37.8 49.6 34 52 43 51 49 44.2 49 35Z"' + fill('leaf') + '/>' +
      '<path d="M32 50.6C31 42.6 31 30.6 34 22.4M32 40C28.6 37.6 27 34 26.6 30M32.4 33.4C35.4 31.6 37.2 29 38 26"' + line('white', 1.4, 'opacity:.5') + '/>',
    chawal: (kg) => shadow(17) + '<path d="M19 23C17 31 15 42 16.4 50.2 17.2 54.2 21.4 55.4 32 55.4 42.6 55.4 46.8 54.2 47.6 50.2 49 42 47 31 45 23Z"' + fill('cream') + '/>' +
      '<path d="M19 23C17 31 15 42 16.4 50.2 17.2 54.2 21.4 55.4 32 55.4 42.6 55.4 46.8 54.2 47.6 50.2 49 42 47 31 45 23Z"' + line('cream-2', 1.4) + '/>' +
      '<path d="M20.6 23.4C24.6 19.4 27.4 14.6 26.6 10.2L37.4 10.2C36.6 14.6 39.4 19.4 43.4 23.4Z"' + fill('cream-2') + '/><path d="M24 18.6h16"' + line('brown', 2.4) + '/>' +
      '<rect x="22" y="29.4" width="20" height="18" rx="3.5"' + fill('white') + '/><rect x="22" y="29.4" width="20" height="18" rx="3.5"' + line('cream-2', 1) + '/>' +
      [[27.4, 34.6, -30], [32, 33.4, 10], [36.6, 34.6, 40]].map((g) => '<ellipse cx="' + g[0] + '" cy="' + g[1] + '" rx="1.4" ry="2.6" transform="rotate(' + g[2] + ' ' + g[0] + ' ' + g[1] + ')"' + fill('tan-2') + '/>').join('') +
      '<text x="32" y="44.6" text-anchor="middle" style="font:700 7px var(--font-body);fill:var(--art-brown-2)">' + (kg || 1) + ' kg</text>',
    atta: (kg) => shadow(17) + '<path d="M18.6 17.4H45.4L47.6 54.4H16.4Z"' + fill('tan') + '/><path d="M18.6 17.4H45.4L43.8 12H20.2Z"' + fill('tan-2') + '/>' +
      '<rect x="22" y="24.4" width="20" height="20.4" rx="3.5"' + fill('cream') + '/><path d="M32 41.6V28.4"' + line('yellow-2', 1.4) + '/>' +
      [[29.6, 30.6, -35], [34.4, 30.6, 35], [29.6, 34.4, -35], [34.4, 34.4, 35], [29.6, 38.2, -35], [34.4, 38.2, 35]].map((g) => '<ellipse cx="' + g[0] + '" cy="' + g[1] + '" rx="1.5" ry="2.6" transform="rotate(' + g[2] + ' ' + g[0] + ' ' + g[1] + ')"' + fill('yellow-2') + '/>').join('') +
      '<text x="32" y="51.4" text-anchor="middle" style="font:700 7px var(--font-body);fill:var(--art-brown-2)">' + (kg || 2) + ' kg</text>',
    nariyal: () => shadow(18) + '<path d="M32 13.6C43 13.6 50.4 23.8 50.4 35 50.4 46.4 42.4 53.6 32 53.6 21.6 53.6 13.6 46.4 13.6 35 13.6 23.8 21 13.6 32 13.6Z"' + fill('brown') + '/>' +
      '<path d="M32 13.6C28.4 22 27.4 40 30 53.4M32 13.6C36.6 22 38.4 40 36.4 53.2M32 13.6C23.4 20 19.6 36 21.6 50M32 13.6C41.4 20 45 36 43.2 49.6"' + line('brown-2', 1.2, 'opacity:.55') + '/>' +
      '<path d="M28.6 15.4C30.2 12.6 33.8 12.6 35.4 15.4 33.4 14.6 30.6 14.6 28.6 15.4Z"' + fill('brown-2') + '/>' + shine(24.6, 28, 2.8, 6, -15),
    ananas: () => {
      const id = 'saart' + (++uid); let lines = '';
      for (let k = -36; k <= 36; k += 7) lines += 'M' + (12 + k) + ' 22L' + (52 + k) + ' 62M' + (52 - k) + ' 22L' + (12 - k) + ' 62';
      return shadow(14) + '<path d="M30.6 27.4C26 24 22 20.4 19.4 16.2 24.8 18.4 28.4 21 32 24.8Z"' + fill('leaf-2') + '/><path d="M33.4 27.4C38 24 42 20.4 44.6 16.2 39.2 18.4 35.6 21 32 24.8Z"' + fill('leaf-2') + '/>' +
        '<path d="M32 27.4L25.6 11.6 30.4 18.4 32 7.6 33.6 18.4 38.4 11.6Z"' + fill('leaf') + '/>' +
        '<clipPath id="' + id + '"><ellipse cx="32" cy="41" rx="12.6" ry="15.2"/></clipPath><ellipse cx="32" cy="41" rx="12.6" ry="15.2"' + fill('yellow') + '/>' +
        '<g clip-path="url(#' + id + ')"><path d="' + lines + '"' + line('yellow-2', 1.3) + '/></g>' + shine(26.4, 35, 2.4, 5, -15);
    },
    kharbooza: () => shadow(18) + '<path d="M32 18.6V14.4"' + line('brown', 2.2) + '/><circle cx="32" cy="36" r="17.4"' + fill('tan') + '/>' +
      '<path d="M32 18.6C24 24 22 46 32 53.4M32 18.6C40 24 42 46 32 53.4M32 18.6C18 22 15 46 32 53.4M32 18.6C46 22 49 46 32 53.4"' + line('lime-2', 1.3, 'opacity:.6') + '/>' +
      '<path d="M22 30l3 2M38 28l3-2M26 42l3 1M40 41l-3 2M30 34l2 2M35 46l2-1M20 38l2 1M44 35l-2 1"' + line('tan-2', 1.1) + '/>' + shine(24, 29, 3.2, 5, -25),
    kaddu: () => shadow(20) + '<path d="M32 25C32 20.6 33.2 17.4 36.4 15"' + line('leaf-2', 3.4) + '/><path d="M36.4 15C40 13.6 42.6 14.6 43.4 17"' + line('leaf', 1.6) + '/>' +
      '<ellipse cx="21" cy="39" rx="10.6" ry="13.4"' + fill('orange-2') + '/><ellipse cx="43" cy="39" rx="10.6" ry="13.4"' + fill('orange-2') + '/><ellipse cx="32" cy="39" rx="11.6" ry="14.4"' + fill('orange') + '/>' + shine(27, 32, 2.6, 6, -10),
    tarbooz: () => {
      const id = 'saart' + (++uid);
      return shadow(21) + '<clipPath id="' + id + '"><ellipse cx="32" cy="37" rx="21" ry="15.6"/></clipPath><ellipse cx="32" cy="37" rx="21" ry="15.6"' + fill('leaf') + '/>' +
        '<g clip-path="url(#' + id + ')"><path d="M10 28C18 25 26 27 32 25 38 23 46 26 54 24M10 37C18 34.6 26 37.4 32 35.4 38 33.4 46 36.4 54 34M10 46C18 43.6 26 46.4 32 44.4 38 42.4 46 45.4 54 43"' + line('leaf-2', 3.2) + '/></g>' +
        shine(22, 30.6, 6, 2.2, -12) + '<path d="M52.6 35.6l3-1.4"' + line('brown', 2) + '/>';
    },
    kathal: () => {
      const id = 'saart' + (++uid); const pts = [];
      for (let y = 15, r = 0; y <= 56; y += 3.6, r++) for (let x = 16 + (r % 2) * 1.8; x <= 48; x += 3.6) pts.push([x.toFixed(1), y.toFixed(1)]);
      return shadow(16) + '<path d="M32 15V10.4"' + line('brown', 2.6) + '/><clipPath id="' + id + '"><ellipse cx="32" cy="35" rx="15" ry="20"/></clipPath><ellipse cx="32" cy="35" rx="15" ry="20"' + fill('lime-2') + '/>' +
        '<g clip-path="url(#' + id + ')">' + dots(pts, 1.2, 'leaf-2', 'opacity:.55') + '</g>' + shine(25.6, 27, 2.6, 6, -12);
    },
    sprout: () => shadow(17) + '<path d="M14 50C20 43.6 44 43.6 50 50Z"' + fill('brown') + '/><path d="M32 46V28"' + line('leaf-2', 2.6) + '/>' +
      leaf('M32 33C26 33 20.6 29 20 22.6 26.4 22.4 31.4 26.4 32 33Z') + leaf('M32 29C33 22.6 38.4 18.4 45 18.6 44.4 25 38.6 29.4 32 29Z')
  };
  /* week -> [drawing, scale, label on a packet]; "small"/"big" in the size text become a smaller or fuller drawing */
  const WEEK = { 4: ['khaskhas'], 5: ['rai'], 6: ['masoor'], 7: ['chana'], 8: ['rajma'], 9: ['angoor'], 10: ['amla'], 11: ['nimbu'], 12: ['chiku'], 13: ['matar'],
    14: ['amrood', 0.86], 15: ['tamatar'], 16: ['seb'], 17: ['anaar'], 18: ['shakarkandi'], 19: ['aam'], 20: ['baingan'], 21: ['kheera'], 22: ['papita', 0.84], 23: ['lauki', 0.84],
    24: ['phoolgobhi', 0.86], 25: ['pattagobhi'], 26: ['phoolgobhi'], 27: ['chawal', 1, 1], 28: ['nariyal'], 29: ['ananas'], 30: ['lauki'], 31: ['kharbooza'], 32: ['atta', 1, 2],
    33: ['papita'], 34: ['kaddu', 0.86], 35: ['tarbooz', 0.82], 36: ['kathal', 0.9], 37: ['chawal', 1, 3], 38: ['tarbooz', 0.92], 39: ['kaddu'], 40: ['tarbooz'], 41: ['tarbooz'], 42: ['tarbooz'] };
  const scaled = (k, body) => (!k || k === 1 ? body : '<g transform="translate(32 40) scale(' + k + ') translate(-32 -40)">' + body + '</g>');
  function produce(week, label) {
    const w = Math.round(week); const e = WEEK[w] || (w > 42 ? WEEK[42] : null);
    return wrap('0 0 64 64', e ? scaled(e[1], P[e[0]](e[2])) : P.sprout(), 'produce', label);
  }

  /* ---------- Version 39.8 (diet audit DIET-10, VD-01 to VD-03, VD-08, VD-10): food, kitchen measures and the danger signs,
     drawn in the same 64x64 style. A food picture is neutral, so it shows on a shared phone too. ---------- */
  const rim = (c) => '<ellipse cx="32" cy="36" rx="20.5" ry="5.6"' + fill(c) + '/>';
  const katori = (inner) => shadow(18) + '<path d="M11.5 36h41c-1.2 10-9.6 17.4-20.5 17.4S12.7 46 11.5 36Z"' + fill('steel') + '/>' +
    '<path d="M15 41.5c3.4 5.6 9.4 8.8 17 8.8"' + line('white', 1.6, 'opacity:.55') + '/>' + (inner || rim('steel-2')) + '<ellipse cx="32" cy="36" rx="20.5" ry="5.6"' + line('steel-2', 1.2) + '/>';
  const plate = (inner) => shadow(22) + '<ellipse cx="32" cy="42" rx="25" ry="10"' + fill('steel') + '/><ellipse cx="32" cy="41" rx="19" ry="7"' + fill('steel-2', 'opacity:.35') + '/>' + (inner || '');
  const glass = (c, top) => shadow(11) + '<path d="M21 14h22l-3 39.5c-.1 1.4-1.3 2.5-2.7 2.5H26.7c-1.4 0-2.6-1.1-2.7-2.5Z"' + fill('water', 'opacity:.35') + '/>' +
    (c ? '<path d="M22.2 ' + (top || 24) + 'h19.6l-2.3 29.4c-.1 1-1 1.8-2 1.8H26.5c-1 0-1.9-.8-2-1.8Z"' + fill(c) + '/>' : '') +
    '<path d="M21 14h22l-3 39.5c-.1 1.4-1.3 2.5-2.7 2.5H26.7c-1.4 0-2.6-1.1-2.7-2.5Z"' + line('glass', 1.6) + '/><path d="M25 18.5l1.8 31"' + line('white', 1.8, 'opacity:.6') + '/>';
  const F = {
    roti: () => shadow(20) + '<circle cx="32" cy="35" r="19"' + fill('tan') + '/><circle cx="32" cy="35" r="19"' + line('tan-2', 1.2) + '/>' +
      dots([[25, 29], [37, 27], [30, 39], [41, 38], [24, 41], [34, 46], [42, 31]], 1.9, 'brown', 'opacity:.55') + dots([[28, 33], [39, 43], [33, 30]], 1.2, 'brown-2', 'opacity:.5') + shine(26, 28, 6, 2.6, -30),
    bhakri: () => shadow(20) + '<circle cx="32" cy="35" r="18.5"' + fill('tan-2') + '/><circle cx="32" cy="35" r="18.5"' + line('brown', 1.3) + '/>' +
      '<path d="M22 30c4 1.4 7.4 1 10-1.2M30 44c3-1.8 7-2 10-.4M38 30.5c1.8 2 2 4.6 1 6.8"' + line('brown-2', 1.2, 'opacity:.6') + '/>' + dots([[27, 37], [36, 39], [33, 25]], 1.6, 'brown-2', 'opacity:.6'),
    ragi: () => shadow(19) + '<circle cx="24.5" cy="39" r="11"' + fill('brown') + '/><circle cx="40" cy="39.5" r="11"' + fill('brown') + '/><circle cx="32.4" cy="28" r="10"' + fill('brown-2') + '/>' + shine(28.6, 24.6, 3.4, 1.6, -30) + shine(21, 35.4, 3.2, 1.5, -30) + shine(36.6, 35.6, 3.2, 1.5, -30),
    chawal_k: () => katori('<path d="M12.6 36c2-8.4 10.4-13.2 19.4-13.2S49.4 27.6 51.4 36Z"' + fill('white') + '/>' + rim('white') +
      '<path d="M22 31l2 .8M29 27.4l2 .3M37 29l2-.6M27 33l2 .6M41 33.4l1.8-.8M33.6 31.6l1.6.8"' + line('cream-2', 1.4) + '/>'),
    dal: () => katori(rim('yellow') + dots([[24, 36], [31, 34.6], [38, 36.4], [44, 35], [28, 38.2]], 1.3, 'yellow-2') + '<path d="M22 34.4c2-1 4.6-1.2 6.6-.4"' + line('white', 1.2, 'opacity:.5') + '/>'),
    dahi: () => katori(rim('white') + '<path d="M22 35.6c4.6-2.4 10.6-2.6 15.4-.8 3 1.2 5.6 1.2 7.6.2"' + line('cream-2', 1.4) + '/>'),
    sabzi: () => katori(rim('leaf') + dots([[24, 35.4], [36, 34], [42, 36.6]], 2.1, 'orange') + dots([[30, 37], [39, 37.6], [27, 33.6]], 1.7, 'lime') + dots([[33, 35.4]], 1.6, 'yellow')),
    khichdi: () => katori(rim('yellow') + dots([[25, 35.2], [37, 36.6], [42, 34.4]], 1.6, 'lime-2') + '<path d="M28 34.4l1.8.6M33 37l1.8.2M39 33.6l1.6.6M23 37.4l1.6-.2"' + line('white', 1.3) + '/>'),
    sprouts: () => katori(rim('lime') + '<path d="M24 34.6c-1.2-2.6-.6-4.6 1.2-5.6M31 33.6c.4-2.8 1.8-4.4 3.8-4.6M38 35c1-2.4 2.8-3.4 4.8-3.2M28 37.4c-1.6-1.6-1.8-3.4-.8-5"' + line('cream', 1.4) + '/>' + dots([[24, 36], [31, 35], [38, 36.4], [28, 38], [43, 36.4], [34.6, 37.6]], 1.9, 'lime-2')),
    poha: () => plate('<path d="M14 41c3-6.4 10.4-10 18-10s15 3.6 18 10c-4 4-10.4 6-18 6s-14-2-18-6Z"' + fill('yellow') + '/>' + dots([[22, 39], [30, 36], [38, 38], [44, 41], [27, 43]], 1.8, 'lime-2') + dots([[34, 42], [41, 36], [25, 36]], 1.6, 'brown') + leaf('M36 33c2-2.6 5-3 7-1.6-2 2.4-4.6 2.8-7 1.6Z')),
    upma: () => plate('<path d="M15 41c2.4-8 9.6-12.6 17-12.6S46.6 33 49 41c-4 3.6-10 5.4-17 5.4S19 44.6 15 41Z"' + fill('cream') + '/>' + dots([[24, 37], [36, 34], [42, 39], [30, 41]], 1.7, 'orange') + dots([[28, 35], [39, 38]], 1.5, 'lime-2')),
    idli: () => plate('<path d="M14 40c0-6.8 4.8-11 10.4-11S34.6 33.2 34.6 40Z"' + fill('white') + '/><path d="M14 40c0-6.8 4.8-11 10.4-11S34.6 33.2 34.6 40Z"' + line('cream-2', 1.5) + '/><path d="M30 40.6c0-6.8 4.8-11 10.4-11s10.4 4.2 10.4 11Z"' + fill('white') + '/><path d="M30 40.6c0-6.8 4.8-11 10.4-11s10.4 4.2 10.4 11Z"' + line('cream-2', 1.5) + '/>' + dots([[20, 35], [26, 33.6], [36, 36], [43, 34.4]], 0.8, 'cream-2')),
    dosa: () => plate('<path d="M9 42.4C18 33 34 29.6 55 31.4 47.6 39.2 30 44.6 9 42.4Z"' + fill('yellow-2') + '/><path d="M12 41.6c13.6-.6 27-4.4 39.4-9.4"' + line('orange-2', 1.3, 'opacity:.6') + '/>' + shine(26, 38, 7, 1.6, -12)),
    milk: () => glass('white', 22),
    chaas: () => glass('cream', 23) + leaf('M37 19.6c2.6-4.6 7-6 10.6-4.6-2.4 4.4-6.6 5.8-10.6 4.6Z'),
    water: () => glass('water', 25),
    ors: () => glass('orange', 25) + '<path d="M28.6 33.6h6.8M32 30.2v6.8"' + line('white', 1.6, 'opacity:.7') + '/>',
    egg: () => shadow(19) + '<ellipse cx="23.5" cy="38" rx="10.4" ry="13"' + fill('white') + '/><circle cx="23.5" cy="39" r="5.6"' + fill('yellow') + '/>' +
      '<ellipse cx="41" cy="38" rx="10.4" ry="13"' + fill('white') + '/><circle cx="41" cy="39" r="5.6"' + fill('yellow') + '/>' + '<ellipse cx="23.5" cy="38" rx="10.4" ry="13"' + line('cream-2', 1.2) + '/><ellipse cx="41" cy="38" rx="10.4" ry="13"' + line('cream-2', 1.2) + '/>' + shine(21.6, 37.2, 1.8, 1, -30),
    fish: () => shadow(19) + '<path d="M10 35c6-8.6 18-11.6 28-7.6l9-6.4-1.6 10.6 4 3.2-4 3.2 1.6 10.6-9-6.4c-10 4-22 1-28-7.2Z"' + fill('orange') + '/>' +
      '<circle cx="18.4" cy="33" r="1.8"' + fill('seed') + '/><path d="M25 30.4c1.6 3 1.6 6.4 0 9.4M31 30c1.4 3.2 1.4 6.8 0 10"' + line('orange-2', 1.3) + '/>' + shine(20, 29.6, 4, 1.4, -18),
    chicken: () => shadow(17) + '<path d="M38.6 38.8 46.4 46.6"' + line('cream', 5.2) + '/><circle cx="48" cy="48.2" r="3.4"' + fill('cream') + '/><circle cx="45.4" cy="50.6" r="3"' + fill('cream') + '/>' +
      '<path d="M16 23.8c4-6.8 14-8 20.4-2.6 6.2 5.2 6 14.6-.4 19-5.6 3.8-13.4 2.8-17.8-2.2C15 34.4 13.8 28 16 23.8Z"' + fill('brown') + '/>' + shine(22.6, 22.6, 4.6, 2, -30),
    paneer: () => shadow(20) + [[0, 0], [22, 3]].map((o) => '<g transform="translate(' + o[0] + ' ' + o[1] + ')"><path d="M11 30l9-4.6 9 4.6-9 4.6Z"' + fill('cream') + '/><path d="M11 30v11l9 4.6v-11Z"' + fill('cream-2') + '/><path d="M29 30v11l-9 4.6v-11Z"' + fill('tan', 'opacity:.7') + '/><path d="M11 30l9-4.6 9 4.6v11l-9 4.6-9-4.6Z"' + line('tan-2', 1.1) + '/></g>').join(''),
    saag: () => shadow(18) + '<path d="M32 54V34M32 46l-7-9M32 42l8-10"' + line('leaf-2', 2) + '/>' + leaf('M32 36c-9-1-15-9-13-20 9 1 15 9 13 20Z', 'leaf') + leaf('M32 36c1-10 8-17 18-17 0 10-7 16-18 17Z', 'leaf-2') +
      leaf('M25 37c-8 2-14-1-17-8 7-3 14 0 17 8Z', 'lime-2') + leaf('M40 32.6c7-4.6 14-3.4 17 2.6-6.6 4-13.4 2.6-17-2.6Z', 'lime-2'),
    salad: () => plate('<circle cx="24" cy="39" r="6.4"' + fill('lime') + '/><circle cx="24" cy="39" r="4"' + fill('lime-2', 'opacity:.35') + '/>' +
      '<circle cx="38" cy="37" r="6.6"' + fill('red') + '/><path d="M38 31v12M32 37h12"' + line('red-2', 1, 'opacity:.6') + '/><circle cx="33" cy="45" r="5"' + fill('lime') + '/>' + dots([[44, 43], [19, 45]], 2.2, 'white')),
    moongfali: () => shadow(19) + [[20, 40, -20], [33, 31, 10], [43, 42, 35]].map((p) => '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-9 0c0-3.4 2.4-5.4 5-5.4 2 0 3.2 1.2 4 1.2s2-1.2 4-1.2c2.6 0 5 2 5 5.4s-2.4 5.4-5 5.4c-2 0-3.2-1.2-4-1.2s-2 1.2-4 1.2C-6.6 5.4-9 3.4-9 0Z"' + fill('tan') + '/><path d="M-5-1.6v3.2M0-2v4M5-1.6v3.2"' + line('tan-2', 1) + '/></g>').join(''),
    til: () => shadow(19) + '<path d="M12 50c3-9.6 11-15.6 20-15.6S49 40.4 52 50Z"' + fill('cream-2') + '/>' +
      dots([[20, 47], [26, 43.6], [32, 41], [38, 43.6], [44, 47], [29, 47.6], [35, 47.4], [23, 49.6], [41, 49.6], [32, 45]], 1.1, 'seed') + dots([[24, 46], [36, 44.6], [30, 43.4], [40, 46.6]], 1, 'white', 'opacity:.8'),
    kela: () => shadow(17) + '<path d="M13 30c3 12 13 19 26 18 6-.4 10-3 12-7-6 3-12 3.6-18 1.4C24.6 39.6 18.6 34.4 16 27Z"' + fill('yellow') + '/>' +
      '<path d="M16 27c-.8-2.4-.6-4.4.6-6"' + line('brown', 2.4) + '/><path d="M18 33c4 5.6 9.6 9 16.4 9.6"' + line('yellow-2', 1.4) + '/>',
    gud: () => shadow(17) + '<path d="M16 30l14-8 18 6v15l-14 8-18-6Z"' + fill('brown') + '/><path d="M16 30l18 6 14-8M34 36v15"' + line('brown-2', 1.6) + '/>' + dots([[24, 40], [28, 44], [40, 42]], 1.1, 'yellow-2', 'opacity:.6'),
    khajur: () => shadow(18) + [[22, 40, -20], [34, 36, 8], [44, 42, 30]].map((p) => '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6.4" ry="10.6" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"' + fill('brown-2') + '/>' + shine(p[0] - 2, p[1] - 4, 1.6, 3.4, p[2])).join(''),
    thali: () => shadow(26) + '<ellipse cx="32" cy="37" rx="28" ry="17"' + fill('steel') + '/><ellipse cx="32" cy="37" rx="28" ry="17"' + line('steel-2', 1.4) + '/>' +
      '<circle cx="19" cy="34" r="7"' + fill('steel-2') + '/><circle cx="19" cy="33" r="5.4"' + fill('yellow') + '/>' + '<circle cx="34" cy="28" r="6.4"' + fill('steel-2') + '/><circle cx="34" cy="27.2" r="5"' + fill('leaf') + '/>' +
      '<circle cx="45" cy="40" r="9"' + fill('tan') + '/>' + dots([[42, 38], [47, 42], [44, 43]], 1.1, 'brown', 'opacity:.5') + '<ellipse cx="26" cy="44.4" rx="8" ry="4.4"' + fill('white') + '/>',
    /* kitchen measures */
    katori: () => katori(),
    karchi: () => shadow(13) + '<path d="M44 12 30.6 34.6"' + line('steel-2', 3.2) + '/><path d="M18 34h19c0 6.4-4.2 11.6-9.5 11.6S18 40.4 18 34Z"' + fill('steel') + '/><ellipse cx="27.5" cy="34" rx="9.5" ry="2.8"' + fill('steel-2') + '/>',
    chammach: () => shadow(12) + '<path d="M40.6 13.4 30 38"' + line('steel-2', 2.6) + '/><ellipse cx="27" cy="44.6" rx="6.4" ry="8.6" transform="rotate(22 27 44.6)"' + fill('steel') + '/><ellipse cx="26.2" cy="43.2" rx="2.4" ry="4" transform="rotate(22 26.2 43.2)"' + fill('white', 'opacity:.5') + '/>',
    gilas: () => glass(null),
    /* the iron tablet: one red tablet, and a strip with some taken */
    tablet: () => shadow(15) + '<ellipse cx="32" cy="35" rx="15" ry="9.4"' + fill('red') + '/><ellipse cx="32" cy="35" rx="15" ry="9.4"' + line('red-2', 1.2) + '/><path d="M20 35h24"' + line('red-2', 1.2, 'opacity:.6') + '/>' + shine(26, 31.4, 5, 1.8, -10),
    strip: () => shadow(22) + '<rect x="9" y="20" width="46" height="30" rx="4"' + fill('steel') + '/>' +
      [[18, 29], [32, 29], [46, 29], [18, 41], [32, 41], [46, 41]].map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.6"' + fill(i < 2 ? 'steel-2' : 'red') + '/>').join(''),   /* two taken, four left */
    /* the foods to have less often, or not at all, so every plate tile has a picture */
    laddoo: () => plate([[24, 40], [40, 40], [32, 30]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8.4"' + fill('yellow-2') + '/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="8.4"' + line('orange-2', 1.1) + '/>' + dots([[p[0] - 3, p[1] - 2], [p[0] + 2.4, p[1] + 1.6], [p[0] - .6, p[1] + 3.6]], 0.9, 'orange-2', 'opacity:.7')).join('') + shine(29, 27, 1.6, 2.6, -20)),
    chai: () => shadow(16) + '<path d="M44 31.5c4.6 0 7 2.4 7 5.4s-2.6 5.6-7.4 5.6"' + line('cream-2', 3) + '/><path d="M16 28h28v12c0 7-5.6 12-14 12s-14-5-14-12Z"' + fill('white') + '/>' +
      '<ellipse cx="30" cy="28" rx="14" ry="3.6"' + fill('tan-2') + '/><path d="M16 28h28v12c0 7-5.6 12-14 12s-14-5-14-12Z"' + line('cream-2', 1.2) + '/>' +
      '<path d="M24 22c-1.6-2 1.6-4 0-6.4M31 21c-1.6-2 1.6-4 0-6.4M38 22c-1.6-2 1.6-4 0-6.4"' + line('steel-2', 1.4, 'opacity:.7') + '/>',
    bread: () => shadow(20) + '<path d="M12 26c0-6 5-9 10-9 3 0 4.6 1 6 1s3-1 6-1c5 0 10 3 10 9 0 3-2 4.6-3 5.4V50H15V31.4C14 30.6 12 29 12 26Z"' + fill('cream') + '/>' +
      '<path d="M12 26c0-6 5-9 10-9 3 0 4.6 1 6 1s3-1 6-1c5 0 10 3 10 9 0 3-2 4.6-3 5.4V50H15V31.4C14 30.6 12 29 12 26Z"' + line('tan', 2.2) + '/>' +
      '<circle cx="45" cy="45" r="9"' + fill('tan') + '/><circle cx="45" cy="45" r="9"' + line('tan-2', 1.1) + '/>' + dots([[42, 42], [48, 43], [44, 48], [47.6, 48.4]], 1.1, 'brown-2', 'opacity:.6'),
    colddrink: () => shadow(12) + '<path d="M27 10h10v5c0 2 4 4.4 4 9v27.4c0 2-1.6 3.6-3.6 3.6H26.6c-2 0-3.6-1.6-3.6-3.6V24c0-4.6 4-7 4-9Z"' + fill('plum-2') + '/>' +
      '<rect x="23" y="30" width="18" height="10"' + fill('red') + '/><rect x="26.6" y="7" width="10.8" height="4.4" rx="1"' + fill('red-2') + '/>' + shine(27, 24, 1.4, 5, 0) + dots([[30, 46], [34, 50], [33, 44.4]], 1, 'white', 'opacity:.55'),
    samosa: () => shadow(20) + '<path d="M32 15 51 47H13Z"' + fill('yellow-2') + '/><path d="M32 15 51 47H13Z"' + line('orange-2', 1.6) + '/><path d="M32 15 29 47M32 15l3 32"' + line('orange-2', 1, 'opacity:.35') + '/>' +
      dots([[24, 41], [38, 40], [31, 31], [42, 44.6]], 1.1, 'orange-2', 'opacity:.5') + shine(26.6, 34, 1.8, 5, 30),
    chips: () => shadow(16) + '<path d="M17 13h30l-1.6 3.4L47 20v26l-1.6 3.6L47 53H17l1.6-3.4L17 46V20l1.6-3.6Z"' + fill('orange') + '/><rect x="17" y="20" width="30" height="3.4"' + fill('red') + '/>' +
      '<ellipse cx="32" cy="35" rx="10" ry="7.6"' + fill('yellow') + '/><path d="M25.6 35.4c2-3 4.2-3.6 6.4-2.4M31 38.6c2-3 4.2-3.6 6.4-2.4"' + line('orange-2', 1.3) + '/>',
    achaar: () => shadow(15) + '<rect x="19" y="20" width="26" height="33" rx="6"' + fill('glass', 'opacity:.45') + '/><path d="M20 30h24v17c0 3.4-2.6 6-6 6H26c-3.4 0-6-2.6-6-6Z"' + fill('orange') + '/>' +
      dots([[26, 38], [34, 36], [38, 44], [29, 46.4], [24.6, 43.6]], 2.2, 'red-2', 'opacity:.7') + '<rect x="21" y="13" width="22" height="8" rx="2"' + fill('red') + '/><rect x="19" y="20" width="26" height="33" rx="6"' + line('glass', 1.4) + '/>' + shine(24, 27, 1.4, 3.6, 0),
    dalda: () => shadow(17) + '<path d="M17 18h30v32c0 2.4-6.6 4.4-15 4.4S17 52.4 17 50Z"' + fill('yellow') + '/><path d="M17 30c4 1.6 9.6 2.4 15 2.4s11-.8 15-2.4v12c-4 1.6-9.6 2.4-15 2.4s-11-.8-15-2.4Z"' + fill('leaf') + '/>' +
      '<ellipse cx="32" cy="18" rx="15" ry="4.4"' + fill('steel') + '/><ellipse cx="32" cy="18" rx="15" ry="4.4"' + line('steel-2', 1.2) + '/><path d="M28 39c1.6-3 4.4-4.4 7.4-4"' + line('yellow', 1.6) + '/>',
    sattu: () => katori('<path d="M12.6 36c2-7 10.4-11 19.4-11S49.4 29 51.4 36Z"' + fill('tan') + '/>' + rim('tan') + dots([[24, 33], [30, 30], [38, 32], [44, 34.6], [34, 34]], 0.9, 'tan-2', 'opacity:.7')),
    khali: () => plate('<ellipse cx="32" cy="41" rx="11" ry="3.6"' + fill('steel-2', 'opacity:.25') + '/>'),
    pills: () => shadow(15) + '<rect x="18" y="22" width="24" height="31" rx="4"' + fill('white') + '/><rect x="18" y="22" width="24" height="31" rx="4"' + line('cream-2', 1.3) + '/>' +
      '<rect x="16" y="14" width="28" height="9" rx="2"' + fill('purple') + '/><rect x="22" y="31" width="16" height="12" rx="2"' + fill('plum', 'opacity:.35') + '/>' +
      '<rect x="42" y="44" width="14" height="6.4" rx="3.2" transform="rotate(-30 49 47.2)"' + fill('red') + '/>'
  };
  /* the danger signs (Help's pictograms): plain shapes that read on a shared phone */
  const D = {
    bleed: () => '<path d="M32 10C24 22 19 30 19 37a13 13 0 0 0 26 0c0-7-5-15-13-27Z"' + fill('red') + '/>' + shine(27, 34, 2.6, 4.6, -12),
    water: () => [[24, 18], [40, 26], [28, 38]].map((p) => '<path d="M' + p[0] + ' ' + (p[1] - 10) + 'c-4 6.4-6.4 10.4-6.4 14a6.4 6.4 0 0 0 12.8 0c0-3.6-2.4-7.6-6.4-14Z"' + fill('water') + '/><path d="M' + p[0] + ' ' + (p[1] - 10) + 'c-4 6.4-6.4 10.4-6.4 14a6.4 6.4 0 0 0 12.8 0c0-3.6-2.4-7.6-6.4-14Z"' + line('water-2', 1.4) + '/>').join('') + '<path d="M18 54h28"' + line('water-2', 2.4, 'opacity:.7') + '/>',
    fever: () => '<rect x="27" y="8" width="10" height="34" rx="5"' + fill('white') + '/><rect x="27" y="8" width="10" height="34" rx="5"' + line('glass', 1.6) + '/><rect x="30" y="20" width="4" height="24"' + fill('red') + '/>' +
      '<circle cx="32" cy="47" r="8.4"' + fill('red') + '/><path d="M42 16h5M42 22h4M42 28h5"' + line('glass', 1.6) + '/>',
    head: () => '<circle cx="28" cy="30" r="15"' + fill('skin-2') + '/><path d="M16 22c2-9 9-13 15-13 8 0 13 5 14 11-6-3-17-3-29 2Z"' + fill('hair') + '/><path d="M16 22c2-9 9-13 15-13 8 0 13 5 14 11-6-3-17-3-29 2Z"' + line('hair-edge', 1.4) + '/>' +
      '<path d="M47 14l-5 9h6l-6 10"' + line('red', 2.6) + '/><path d="M22 31.6c1.4-1 3-1 4.4 0M30 31.6c1.4-1 3-1 4.4 0"' + line('seed', 1.6) + '/>' +
      '<path d="M8 50c2-5 6-7.6 11-7.6M48 50c-2-5-6-7.6-11-7.6"' + line('glass', 2, 'opacity:.5') + '/>',
    fits: () => '<circle cx="32" cy="32" r="20"' + fill('halo') + '/><path d="M36 10 24 33h9l-6 21 15-27h-9Z"' + fill('yellow-2') + '/><path d="M36 10 24 33h9l-6 21 15-27h-9Z"' + line('orange-2', 1.4) + '/>',
    swell: () => '<path d="M20 52V30c0-2.4 1.8-4.2 4.2-4.2s4.2 1.8 4.2 4.2V22c0-2.4 1.8-4.2 4.2-4.2s4.2 1.8 4.2 4.2v5c0-2.4 1.8-4.2 4.2-4.2s4.2 1.8 4.2 4.2V40c0 7.8-6.2 13.8-14 13.8h-3c-4.4 0-8.2-.8-8.2-1.8Z"' + fill('skin-2') + '/>' +
      '<path d="M14 34c-2 4-2 8 0 12M50 30c2.4 4 2.6 8.4.4 12.6"' + line('red', 2.2) + '/>',
    moves: () => '<circle cx="28" cy="35" r="19"' + fill('pink') + '/><circle cx="23" cy="29.6" r="5.4"' + fill('skin-2') + '/><path d="M26.4 34c4 1.4 7.6 4.6 8.6 9.4-3.6 3-9.4 3.4-13.4.6"' + fill('skin-2') + '/><path d="M55 16v18M50 29l5 5.6 5-5.6"' + line('red', 2.8) + '/>',
    breath: () => '<path d="M32 12v14"' + line('pink-2', 3) + '/><path d="M30 24c-8-2-15 4-16 16-.6 7 2 12 7 12 6 0 9-6 9-14Z"' + fill('pink') + '/><path d="M34 24c8-2 15 4 16 16 .6 7-2 12-7 12-6 0-9-6-9-14Z"' + fill('pink') + '/>' +
      '<path d="M22 34c2 4 2 8 0 12M42 34c-2 4-2 8 0 12"' + line('pink-2', 1.6, 'opacity:.7') + '/>',
    dizzy: () => '<path d="M32 32c0-1.6 1.6-2.4 3-1.6 2.6 1.4 2 5.2-.8 6.2-4 1.4-7.8-1.6-7.8-5.8 0-5.6 5.6-9.2 10.8-7.8 7 1.8 10 9.6 7 15.8-3.6 7.6-13.4 10.2-20.4 6"' + line('purple', 2.6) + '/>' + dots([[48, 14], [14, 18], [50, 48]], 2.2, 'yellow-2'),
    belly: () => '<path d="M21 9c-1.6 9-6 16.6-6 27 0 10.4 7.4 18 17 18s17-7.6 17-18c0-10.4-4.4-18-6-27Z"' + fill('skin-2') + '/><circle cx="32" cy="34" r="1.7"' + fill('skin-2s') + '/><path d="M39 41l7-4M40 46h8M39 51l7 4"' + line('red', 2.6) + '/><circle cx="36" cy="46" r="3.4"' + fill('red', 'opacity:.75') + '/>',
    phone: () => '<rect x="20" y="8" width="24" height="46" rx="5"' + fill('steel-2') + '/><rect x="23" y="13" width="18" height="32" rx="2"' + fill('water') + '/><circle cx="32" cy="49.4" r="2"' + fill('steel') + '/>'
  };
  /* her plate's foods: an id of mods/food.js (or a produce name) to a drawing */
  const FOOD_ART = { roti: 'roti', atta: 'roti', bajra: 'bhakri', jowar: 'bhakri', bhakri: 'bhakri', nachni: 'ragi', ragi: 'ragi', rice: 'chawal_k', chawal: 'chawal_k', brown_rice: 'chawal_k', dal: 'dal', moong: 'dal', toor: 'dal', masoor_dal: 'dal', dahi: 'dahi', curd: 'dahi', raita: 'dahi', sabzi: 'sabzi', veg: 'sabzi', khichdi: 'khichdi', sprouts: 'sprouts', poha: 'poha', upma: 'upma', idli: 'idli', dosa: 'dosa', milk: 'milk', doodh: 'milk', chaas: 'chaas', buttermilk: 'chaas', water: 'water', ors: 'ors', egg: 'egg', anda: 'egg', fish: 'fish', chicken: 'chicken', meat: 'chicken', paneer: 'paneer', tofu: 'paneer', saag: 'saag', palak: 'saag', methi: 'saag', greens: 'saag', salad: 'salad', peanuts: 'moongfali', moongfali: 'moongfali', til: 'til', sesame: 'til', banana: 'kela', kela: 'kela', gud: 'gud', jaggery: 'gud', dates: 'khajur', khajur: 'khajur', thali: 'thali', tea: 'chai', biscuit: 'bread', pickle: 'achaar', vanaspati: 'dalda' };
  function food(key, label) {
    const k = FOOD_ART[key] || key;
    if (F[k]) return wrap('0 0 64 64', F[k](), 'produce food', label);
    if (P[k]) return wrap('0 0 64 64', P[k](), 'produce food', label);
    return '';
  }
  const hasFood = (key) => !!(F[FOOD_ART[key] || key] || P[FOOD_ART[key] || key]);
  function sign(key, label) { return D[key] ? wrap('0 0 64 64', D[key](), 'sign', label) : ''; }

  /* ---------- the petal garden: one Indian flower for each month ---------- */
  const PETAL = {
    round: 'M0-7C-11-12-13.5-33 0-41 13.5-33 11-12 0-7Z',
    point: 'M0-7C-10-14-10.5-29 0-43 10.5-29 10-14 0-7Z',
    long: 'M0-7C-5-15-6.4-35 0-43 6.4-35 5-15 0-7Z',
    heart: 'M0-7C-12-12-15-35-5.6-40.6-2.6-42 0-39.4 0-37 0-39.4 2.6-42 5.6-40.6 15-35 12-12 0-7Z',
    ruffle: 'M0-7C-12-12-14.6-29-10.6-37.4L-7-34.4-4-40.4-.2-35.6 3.4-40.6 6.6-34.6 10.6-37.6C14.6-29 12-12 0-7Z',
    claw: 'M0-7C-9-13-12-27-8-38.6-3.6-44 4-43 7.6-38 4.6-33 6.6-21 0-7Z'
  };
  const FLOWERS = [
    { k: 'sarson', en: 'Sarson', hi: 'सरसों', shape: 'round', c1: 'yellow', c2: 'yellow-2', mid: 'orange-2' },
    { k: 'palash', en: 'Palash', hi: 'पलाश', shape: 'claw', c1: 'orange', c2: 'red', mid: 'red-2' },
    { k: 'mogra', en: 'Mogra', hi: 'मोगरा', shape: 'point', c1: 'white', c2: 'cream-2', mid: 'yellow', edge: 'cream-2' },
    { k: 'gulmohar', en: 'Gulmohar', hi: 'गुलमोहर', shape: 'heart', c1: 'red', c2: 'orange', mid: 'yellow' },
    { k: 'champa', en: 'Champa', hi: 'चंपा', shape: 'round', c1: 'cream', c2: 'yellow', mid: 'yellow-2', edge: 'cream-2' },
    { k: 'kamal', en: 'Kamal (lotus)', hi: 'कमल', shape: 'point', c1: 'pink', c2: 'pink-2', mid: 'yellow' },
    { k: 'gudhal', en: 'Gudhal (hibiscus)', hi: 'गुड़हल', shape: 'round', c1: 'red', c2: 'red-2', mid: 'yellow' },
    { k: 'kaner', en: 'Kaner', hi: 'कनेर', shape: 'heart', c1: 'pink', c2: 'red', mid: 'yellow-2' },
    { k: 'harsingar', en: 'Harsingar', hi: 'हरसिंगार', shape: 'long', c1: 'white', c2: 'cream-2', mid: 'orange', edge: 'cream-2' },
    { k: 'genda', en: 'Genda (marigold)', hi: 'गेंदा', shape: 'ruffle', c1: 'orange', c2: 'orange-2', mid: 'orange-2' },
    { k: 'guldaudi', en: 'Guldaudi', hi: 'गुलदाउदी', shape: 'long', c1: 'purple', c2: 'pink-2', mid: 'yellow' },
    { k: 'gulab', en: 'Gulab (rose)', hi: 'गुलाब', shape: 'round', c1: 'pink-2', c2: 'red', mid: 'red-2' }
  ];
  /* month: 0-11. petals: 0-12. opts: { fresh: index of a petal that grows in, grow: all petals grow in turn, leaves: false, bg: true, label, cls } */
  function flower(month, petals, opts) {
    const o = opts || {}; const f = FLOWERS[((month % 12) + 12) % 12]; const p = PETAL[f.shape]; const n = Math.max(0, Math.min(12, petals | 0));
    let s = o.bg ? '<circle r="53"' + fill('halo') + '/>' : '';
    if (o.leaves !== false) s += leaf('M-3 33C-21 43-42 37-50 22-33 15-14 20-3 33Z') + leaf('M3 33C21 43 42 37 50 22 33 15 14 20 3 33Z') + '<path d="M-6 31C-19 30-33 26-44 22M6 31C19 30 33 26 44 22"' + line('leaf-2', 1.3, 'opacity:.55') + '/>';
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      if (i < n) s += '<g transform="rotate(' + a + ')"><g class="pet' + (o.fresh === i || o.grow ? ' fresh' : '') + '"' + (o.grow ? ' style="animation-delay:' + (150 + i * 70) + 'ms"' : '') + '><path d="' + p + '"' + fill(f.c1, f.edge ? 'stroke:var(--art-' + f.edge + ');stroke-width:1' : '') + '/><path d="' + p + '" transform="scale(.56)"' + fill(f.c2, 'opacity:.8') + '/></g></g>';
      else s += '<g transform="rotate(' + a + ')"><path d="' + p + '" class="pet-empty"/></g>';
    }
    s += '<circle r="11.5"' + fill(f.mid) + '/>';
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; s += '<circle cx="' + (Math.cos(a) * 6.6).toFixed(2) + '" cy="' + (Math.sin(a) * 6.6).toFixed(2) + '" r="1.5"' + fill('cream', 'opacity:.85') + '/>'; }
    s += '<circle cx="-3" cy="-3.4" r="2.4"' + fill('white', 'opacity:.5') + '/>';
    return wrap('-54 -54 108 108', s, 'flower' + (o.cls ? ' ' + o.cls : ''), o.label);
  }
  const flowerName = (month) => { const f = FLOWERS[((month % 12) + 12) % 12]; return S.tx({ en: f.en, hi: f.hi }); };

  /* ---------- small coloured pictures for topics, Learn groups and cards ---------- */
  const SPOT = {
    periods: ['rose', 'drop'], contra: ['teal', 'pill'], pregtest: ['sky', 'check'], ttc: ['green', 'flower'], preg: ['orange', 'baby'], post: ['plum', 'heart'], loss: ['purple', 'leaf'],
    intimate: ['rose', 'lock'], cond: ['gold', 'chart'], screen: ['sky', 'ribbon'], meno: ['purple', 'moon'], teen: ['green', 'users'], tools: ['teal', 'bell'],
    free: ['teal', 'steth'], plans: ['green', 'bell'], records: ['sky', 'file'], support: ['plum', 'leaf'], fun: ['orange', 'sparkle'],
    cycle: ['rose', 'drop'], mind_body: ['purple', 'sparkle'], pmos: ['gold', 'chart'], conceive: ['green', 'flower'], pregnancy: ['orange', 'baby'], midlife: ['purple', 'moon'], services: ['teal', 'map'], joy: ['orange', 'flower']
  };
  const BLOBS = ['M33 5C47 5 59 15 58 31 57 46 46 59 30 58 15 57 5 46 6 31 7 16 19 5 33 5Z', 'M30 6C44 4 58 14 58 29 58 45 48 57 33 58 17 59 6 48 6 32 6 18 16 8 30 6Z', 'M34 6C49 7 59 19 57 34 55 48 43 58 29 57 15 56 6 45 7 30 8 16 20 5 34 6Z'];
  const hueOf = (key) => (SPOT[key] || ['rose'])[0];
  function spot(key, opts) {
    const o = opts || {}; const hue = o.hue || hueOf(key); const ic = o.icon || (SPOT[key] || [0, 'leaf'])[1]; const H = 'var(--h-' + hue + ')';
    let s = '<path d="' + BLOBS[String(key || '').length % 3] + '" style="fill:' + (o.blob || 'var(--h-' + hue + '-soft)') + '"/>' +
      '<circle cx="52" cy="13" r="3" style="fill:' + H + ';opacity:.35"/><circle cx="11" cy="50" r="2.2" style="fill:' + H + ';opacity:.3"/><circle cx="57" cy="44" r="1.6" style="fill:' + H + ';opacity:.4"/>' +
      '<path d="M8.6 16.4C11.6 11.4 16.6 10.4 19.6 12.4 16.6 16.4 12.6 17.4 8.6 16.4Z" style="fill:' + H + ';opacity:.3"/>';
    s += String(S.I[ic] || ic).replace('<svg ', '<svg x="15" y="15" width="34" height="34" style="color:' + H + '" ');
    return wrap('0 0 64 64', s, 'spot', o.label);
  }

  /* ---------- rosette badges ---------- */
  function badge(icon, hue, on, label) {
    const H = on ? 'var(--h-' + hue + ')' : 'var(--peach)'; const soft = on ? 'var(--h-' + hue + '-soft)' : 'var(--card-2)';
    let s = on ? '<path d="M-13 15L-19 35-11.6 31-7.4 38-3.6 19Z" style="fill:' + H + ';opacity:.8"/><path d="M13 15L19 35 11.6 31 7.4 38 3.6 19Z" style="fill:' + H + ';opacity:.8"/>' : '';
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8; s += '<circle cx="' + (Math.cos(a) * 22).toFixed(2) + '" cy="' + (Math.sin(a) * 22).toFixed(2) + '" r="6.2" style="fill:' + H + '"/>'; }
    s += '<circle r="22.6" style="fill:' + H + '"/><circle r="18" style="fill:' + soft + '"/><circle r="15.4" style="fill:none;stroke:' + (on ? H : 'var(--peach)') + ';stroke-width:1;stroke-dasharray:1.6 2.4;opacity:.7"/>';
    s += String(S.I[icon] || S.I.sparkle).replace('<svg ', '<svg x="-11" y="-11" width="22" height="22" style="color:' + (on ? H : 'var(--muted)') + '" ');
    return wrap('-34 -34 68 74', s, 'badge' + (on ? ' on' : ' off'), label);
  }

  /* ---------- Sakhi, the friend in the app: tips, empty days and the garden use her ----------
     Four looks she can pick in Me (skin, hair, clothes). Poses: 'hi' (waving), 'calm', 'cheer' (both hands up).
     Skin and hair keep their natural colours in dark mode; her clothes follow the theme. */
  const LOOKS = [
    { skin: 1, hair: 'braid', kurta: 'teal', dupatta: 'rose' },
    { skin: 2, hair: 'bun', kurta: 'purple', dupatta: 'gold' },
    { skin: 3, hair: 'bob', kurta: 'orange', dupatta: 'sky' },
    { skin: 4, hair: 'veil', kurta: 'green', dupatta: 'plum' }
  ];
  const star = (x, y, r, c) => '<path d="M' + x + ' ' + (y - r) + 'L' + (x + r * 0.28) + ' ' + (y - r * 0.28) + 'L' + (x + r) + ' ' + y + 'L' + (x + r * 0.28) + ' ' + (y + r * 0.28) + 'L' + x + ' ' + (y + r) + 'L' + (x - r * 0.28) + ' ' + (y + r * 0.28) + 'L' + (x - r) + ' ' + y + 'L' + (x - r * 0.28) + ' ' + (y - r * 0.28) + 'Z"' + fill(c) + '/>';
  function sakhi(opts) {
    const o = opts || {}; const lk = LOOKS[(((o.look | 0) % 4) + 4) % 4]; const pose = o.pose || 'hi';
    const SK = 'var(--art-skin-' + lk.skin + ')', SK2 = 'var(--art-skin-' + lk.skin + 's)', K = 'var(--h-' + lk.kurta + ')', D = 'var(--h-' + lk.dupatta + ')';
    const F = (c, extra) => ' style="fill:' + c + (extra ? ';' + extra : '') + '"';
    const ST = (c, w, extra) => ' style="fill:none;stroke:' + c + ';stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round' + (extra ? ';' + extra : '') + '"';
    const HAIR = ' style="fill:var(--art-hair);stroke:var(--art-hair-edge);stroke-width:.8"';
    const arm = (side) => { const m = side < 0; const x = (v) => (m ? 100 - v : v);
      return '<path d="M' + x(73) + ' 93C' + x(77) + ' 83 ' + x(80) + ' 74 ' + x(81.4) + ' 65.5"' + ST(K, 9.5) + '/>' +
        '<ellipse cx="' + x(82.4) + '" cy="58.6" rx="4.6" ry="5.4"' + F(SK) + '/><path d="M' + x(78.2) + ' 59.6l' + (m ? 2.6 : -2.6) + '-2.2"' + ST(SK, 2.6) + '/>'; };
    const id = 'sk' + (++uid); let s = '';
    if (o.bg !== false) s += '<defs><clipPath id="' + id + '"><circle cx="50" cy="50" r="48"/></clipPath></defs><circle cx="50" cy="50" r="48"' + F('var(--h-' + lk.kurta + '-soft)') + '/><g clip-path="url(#' + id + ')">';
    /* hair behind the head */
    if (lk.hair === 'braid') s += '<path d="M34.4 44C33 55 34.6 61.6 38 63.4L42.4 63C38.8 58 37 52.4 36.8 46ZM65.6 44C67 55 65.4 61.6 62 63.4L57.6 63C61.2 58 63 52.4 63.2 46Z"' + HAIR + '/>';
    if (lk.hair === 'bun') s += '<circle cx="50" cy="24.6" r="7.6"' + HAIR + '/><path d="M34.6 44C34 51 35 55.6 37.4 57.4L39.6 55C38 52 37.2 48.6 37 45ZM65.4 44C66 51 65 55.6 62.6 57.4L60.4 55C62 52 62.8 48.6 63 45Z"' + HAIR + '/>';
    if (lk.hair === 'bob') s += '<path d="M33 42C31.4 54 32.4 60.4 36 61.8L64 61.8C67.6 60.4 68.6 54 67 42Z"' + HAIR + '/>';
    /* neck, shoulders, clothes */
    s += '<path d="M44.6 57L44.6 70.4 50 77 55.4 70.4 55.4 57Z"' + F(SK) + '/><path d="M44.6 59.6C47 62.6 53 62.6 55.4 59.6L55.4 63.2C53 65.8 47 65.8 44.6 63.2Z"' + F(SK2, 'opacity:.55') + '/>';
    s += '<path d="M12 101C13 87 24 77 38 73L44.6 70.6 50 79 55.4 70.6 62 73C76 77 87 87 88 101Z"' + F(K) + '/>';
    s += '<path d="M44.6 70.6L50 79 55.4 70.6"' + ST(D, 1.8) + '/>';
    s += '<path d="M23.6 80C29.6 75 35.6 73 41 72L45.4 76C37.6 79 31.4 85 28.4 101L18.6 101C18.6 93 20.4 85.6 23.6 80Z"' + F(D) + '/>';
    if (lk.hair === 'braid') { [[64.6, 62.4], [66, 68], [67, 73.6], [67.6, 79.2], [67.8, 84.6]].forEach((p) => { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="3.7" ry="3.3" transform="rotate(-20 ' + p[0] + ' ' + p[1] + ')"' + HAIR + '/>'; }); s += '<circle cx="68" cy="88.6" r="2.1"' + F(D) + '/><path d="M68 90.6l-1.4 5M68 90.6l1.4 5"' + ST('var(--art-hair)', 1.4) + '/>'; }
    /* head */
    if (lk.hair !== 'veil') s += '<ellipse cx="35.2" cy="46.4" rx="2.8" ry="4.2"' + F(SK2) + '/><ellipse cx="64.8" cy="46.4" rx="2.8" ry="4.2"' + F(SK2) + '/><circle cx="35.4" cy="52" r="1.7"' + fill('yellow-2') + '/><circle cx="64.6" cy="52" r="1.7"' + fill('yellow-2') + '/>';
    s += '<ellipse cx="50" cy="44.4" rx="15" ry="17.4"' + F(SK) + '/>';
    if (lk.hair === 'veil') s += '<path d="M37.6 44C38.4 37.6 43.4 34.4 50 34.4S61.6 37.6 62.4 44C59.6 39.8 55 38.2 50 38.2S40.4 39.8 37.6 44Z"' + HAIR + '/>' +
      '<path d="M33 48C31 31 40 21.4 50 21.4S69 31 67 48C67.6 58 70 66 75.4 73.4L66.8 75.6C64 67 63 58 63.4 48 63 39 58 33.6 50 33.6S37 39 36.6 48C37 58 36 67 33.2 75.6L24.6 73.4C30 66 32.4 58 33 48Z"' + F(D) + '/>';
    else s += '<path d="M34.6 46C33.4 31 41 25.4 50 25.4S66.6 31 65.4 46C63.6 38.6 58.6 34.6 52 34 51 32.4 49 32.4 48 34 41.4 34.6 36.4 38.6 34.6 46Z"' + HAIR + '/>';
    /* face */
    s += '<path d="M40.6 41.4q2.8-1.6 5.6-.2M53.8 41.2q2.8-1.4 5.6.2"' + ST('var(--art-hair)', 1.3) + '/>';
    if (pose === 'cheer') s += '<path d="M40.8 47q2.6-2.8 5.2 0M54 47q2.6-2.8 5.2 0"' + ST('var(--art-seed)', 1.7) + '/>';
    else s += '<ellipse cx="43.4" cy="46.4" rx="1.55" ry="1.95"' + fill('seed') + '/><ellipse cx="56.6" cy="46.4" rx="1.55" ry="1.95"' + fill('seed') + '/><circle cx="43.9" cy="45.7" r=".55"' + fill('white') + '/><circle cx="57.1" cy="45.7" r=".55"' + fill('white') + '/>';
    s += '<path d="M50 48.8q1.1 2.6-.5 3.3"' + ST(SK2, 1.2) + '/><circle cx="40.4" cy="52.2" r="2.8"' + fill('pink', 'opacity:.38') + '/><circle cx="59.6" cy="52.2" r="2.8"' + fill('pink', 'opacity:.38') + '/>';
    s += pose === 'cheer' ? '<path d="M45.2 54.8q4.8 6.2 9.6 0Z"' + fill('plum-2') + '/>' : '<path d="M45.6 55.4q4.4 3.6 8.8 0"' + ST('var(--art-plum-2)', 1.6) + '/>';
    /* hands */
    if (pose === 'hi') s += '<g class="sk-wave">' + arm(1) + '</g>';
    if (pose === 'cheer') s += arm(-1) + arm(1) + star(21, 26, 4, 'yellow') + star(80, 22, 3.2, 'pink') + star(70, 9, 2.4, 'yellow');
    if (o.bg !== false) s += '</g>';
    return wrap('0 0 100 100', s, 'sakhi ' + pose, o.label);
  }

  /* ---------- Version 39.84 (L6, docs/teach-and-show-advice-2026-11-08.md; MODULE_API section 127): the cycle in pictures ----------
     Flat teaching drawings of the womb, its tubes and the ovaries, seen from the front (never a body seen through), in the art
     tokens, so they follow light and dark. The caller gives the label in her language: the Learn library's own sentence.
       build   the lining builds up after a period         egg     an egg leaves an ovary
       after   the lining full, the egg gone              period  the lining comes away as a period
       pmos    many small follicles that started and paused  long    a long cycle: follicles still growing, no egg yet */
  const BODY_KEYS = ['build', 'egg', 'after', 'period', 'pmos', 'long'];
  const UT = 'M88 44C88 30 102 24 120 24S152 30 152 44C152 64 144 82 133 96L130 112C129 118 125 122 120 122S111 118 110 112L107 96C96 82 88 64 88 44Z';
  const CAV = 'M101 46C109 51 131 51 139 46C135 62 128 76 123 87L120 96L117 87C112 76 105 62 101 46Z';
  const drop = (x, y, r) => '<path d="M' + x + ' ' + (y - r * 1.7) + 'C' + (x + r * 0.5) + ' ' + (y - r * 0.7) + ' ' + (x + r) + ' ' + (y - r * 0.2) + ' ' + (x + r) + ' ' + (y + r * 0.35) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x - r) + ' ' + (y + r * 0.35) + 'C' + (x - r) + ' ' + (y - r * 0.2) + ' ' + (x - r * 0.5) + ' ' + (y - r * 0.7) + ' ' + x + ' ' + (y - r * 1.7) + 'Z"' + fill('red') + '/>';
  const fingers = (x, y, dir) => [[-6, -5], [-8, 1], [-6, 6]].map((p) => '<path d="M' + x + ' ' + y + 'l' + (p[0] * dir) + ' ' + p[1] + '"' + line('pink-2', 2.4) + '/>').join('');
  const foll = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + fill('cream') + '/><circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + line('tan-2', 1.2) + '/>';
  function bodyPic(key, label) {
    const k = BODY_KEYS.indexOf(key) >= 0 ? key : 'build';
    const big = k === 'pmos'; const rx = big ? 19 : 16, ry = big ? 13 : 11;
    const lin = { build: 4, egg: 6, after: 9, period: 5, pmos: 5, long: 5 }[k];
    let s = '';
    /* the tubes, their fingers and the ovaries */
    s += '<path d="M90 44C76 36 62 30 52 36"' + line('pink-2', 4) + '/><path d="M150 44C164 36 178 30 188 36"' + line('pink-2', 4) + '/>';
    s += fingers(50, 37, 1) + fingers(190, 37, -1);
    [46, 194].forEach((cx) => { s += '<ellipse cx="' + cx + '" cy="58" rx="' + rx + '" ry="' + ry + '"' + fill('tan') + '/><ellipse cx="' + cx + '" cy="58" rx="' + rx + '" ry="' + ry + '"' + line('tan-2', 1.5) + '/>'; });
    if (k === 'pmos') [46, 194].forEach((cx) => { for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; s += foll((cx + Math.cos(a) * (rx - 5.5)).toFixed(1), (58 + Math.sin(a) * (ry - 4.6)).toFixed(1), 2.6); } });
    else if (k === 'long') s += foll(40, 56, 3) + foll(50, 61, 4) + foll(188, 55, 4.5) + foll(199, 61, 3.2) + foll(193, 52, 2.6);
    else if (k === 'build') s += foll(41, 57, 2.6) + foll(51, 60, 3.2) + foll(191, 57, 5.4);
    else if (k === 'egg') s += foll(41, 57, 2.6) + '<circle cx="196" cy="54" r="5"' + line('tan-2', 1.4) + '/><path d="M193 50C189 45 185 42 180 41"' + line('yellow-2', 1.6, 'stroke-dasharray:2 3') + '/>' +
      '<circle cx="176" cy="40" r="9"' + fill('yellow', 'opacity:.35') + '/><circle cx="176" cy="40" r="4.6"' + fill('yellow') + '/><circle cx="176" cy="40" r="4.6"' + line('yellow-2', 1.2) + '/>';
    else if (k === 'after') s += foll(41, 57, 2.6) + '<circle cx="195" cy="57" r="5.4"' + fill('yellow-2') + '/><circle cx="160" cy="40" r="2.6"' + fill('yellow', 'opacity:.55') + '/>';
    else s += foll(42, 58, 2.6) + foll(196, 58, 2.6);
    /* the womb: its wall, the lining (thick before a period), the cavity, and the way out */
    s += '<path d="' + UT + '"' + fill('pink', 'opacity:.55') + '/><path d="' + UT + '"' + line('pink-2', 2) + '/>';
    s += '<path d="' + CAV + '"' + fill('plum', k === 'period' ? 'opacity:.55' : 'opacity:.85') + '/>';
    const f = (1 - lin / 26).toFixed(3);
    s += '<path d="' + CAV + '" transform="translate(120 60) scale(' + f + ') translate(-120 -60)"' + fill('cream') + '/>';
    s += '<path d="M120 122V137"' + line('pink-2', 5) + '/>';
    if (k === 'period') s += '<ellipse cx="117" cy="80" rx="3" ry="2"' + fill('red') + '/><ellipse cx="124" cy="72" rx="2.4" ry="1.6"' + fill('red') + '/>' + drop(114, 143, 3.4) + drop(126, 146, 2.6);
    return wrap('0 0 240 152', s, 'body ' + k, label);
  }

  S.art = { body: bodyPic, bodyKeys: BODY_KEYS, food: food, hasFood: hasFood, sign: sign, produce: produce, produceKey: (w) => (WEEK[Math.round(w)] || ['sprout'])[0], flower: flower, flowers: FLOWERS, flowerName: flowerName, spot: spot, hueOf: hueOf, badge: badge, sakhi: sakhi, looks: LOOKS.length };
})(window.Saathi);
