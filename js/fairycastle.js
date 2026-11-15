'use strict';
// Innenräume der Märchenschlösser – zum Chillen:
//  • Königsschloss (Tür vorn am Palast): Thronsaal mit zwei Thronen, Kronleuchtern und Kamin, Lounge mit Sofas, Bücherregalen,
//    Klavier und Teetafel, Schlafgemach mit Himmelbett.
//  • Kristallschloss (Tür am großen Kristallturm): Kristallhalle mit Kristallthron, warmem Kristall-Pool, Liegen und Polarlicht.
// E an einem Sitz/Bett: hinsetzen, hinlegen oder ins warme Wasser – dabei heilst du langsam. Laufen (WASD) = aufstehen.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const G = () => L.GEO;
  const QA = { x: 69000, z: 3200 }, QB = { x: 69000, z: -3200 };   // Lage der Innenräume (weit weg, eigene Böden)
  const RA = { x1: QA.x - 46, x2: QA.x + 46, z1: QA.z - 32, z2: QA.z + 32 }, RB = { x: QB.x, z: QB.z, r: 30 };
  const inA = (x, z) => x > RA.x1 - 1 && x < RA.x2 + 1 && z > RA.z1 - 1 && z < RA.z2 + 1, inB = (x, z) => Math.hypot(x - RB.x, z - RB.z) < RB.r + 1;
  L.inFairyCastle = (x, z) => inA(x, z) || inB(x, z);
  setTimeout(() => { const od = L.dimLand; L.dimLand = (x, z) => (inA(x, z) || inB(x, z) ? true : od ? od(x, z) : false); }, 0);

  let g = null, built = false;
  const seats = [], doors = [], fires = [], spins = [], lights = [];
  function add(geo, m, sx, sy, sz, x, y, z, par, o) { const o2 = new T.Mesh(geo, typeof m === 'string' ? L.mat(m, o) : m); o2.scale.set(sx, sy, sz); o2.position.set(x, y, z); o2.castShadow = !(o && o.noShadow); o2.receiveShadow = true; (par || g).add(o2); return o2; }
  const solid = (x1, z1, x2, z2, h) => L.addBox(Math.min(x1, x2), Math.min(z1, z2), Math.max(x1, x2), Math.max(z1, z2), h || 16, 'building');
  function cvTex(w, h, fn, rx, ry) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; }
  const gold = () => new T.MeshStandardMaterial({ color: 0xf0c850, metalness: 0.85, roughness: 0.3, emissive: 0x2a1a00 });
  function label(text, col, sc) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
    x.font = 'bold 54px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 9; x.strokeStyle = 'rgba(40,10,40,.85)'; x.strokeText(text, 256, 64); x.fillStyle = col || '#fff'; x.fillText(text, 256, 64);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false, fog: false })); sp.scale.set(4 * (sc || 1), 1 * (sc || 1), 1); g.add(sp); return sp;
  }
  // Wand mit optionaler Türöffnung (gap: Mitte + Breite entlang der Wand)
  function wall(x1, z1, x2, z2, h, mat, gapC, gapW) {
    const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1), a = alongX ? Math.min(x1, x2) : Math.min(z1, z2), b = alongX ? Math.max(x1, x2) : Math.max(z1, z2);
    const segs = gapC === undefined ? [[a, b]] : [[a, gapC - gapW / 2], [gapC + gapW / 2, b]];
    for (const [s, e] of segs) {
      if (e - s < 0.1) continue; const m = (s + e) / 2, len = e - s;
      if (alongX) { add(G().boxB, mat, len, h, 0.8, m, 0, z1); solid(s, z1 - 0.4, e, z1 + 0.4, h); } else { add(G().boxB, mat, 0.8, h, len, x1, 0, m); solid(x1 - 0.4, s, x1 + 0.4, e, h); }
    }
    if (gapC !== undefined) { if (alongX) add(G().box, mat, gapW, h - 6, 0.8, gapC, 6 + (h - 6) / 2, z1); else add(G().box, mat, 0.8, h - 6, gapW, x1, 6 + (h - 6) / 2, gapC); }
  }
  // Möbel
  function throne(x, z, yaw, col, name) {
    const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t); const gm = gold();
    add(G().boxB, gm, 2.2, 0.6, 1.8, 0, 0, 0, t); add(G().boxB, col, 1.8, 0.35, 1.4, 0, 0.6, 0.05, t);
    add(G().boxB, gm, 2.2, 4.2, 0.35, 0, 0.6, -0.75, t); add(G().boxB, col, 1.6, 3.3, 0.1, 0, 1.1, -0.55, t);
    add(G().cone, gm, 0.5, 1.0, 0.2, 0, 5.3, -0.75, t); for (const sd of [-1, 1]) { add(G().boxB, gm, 0.3, 1.2, 1.6, sd * 1.0, 0.6, 0, t); add(G().sph, gm, 0.25, 0.25, 0.25, sd * 1.0, 4.85, -0.75, t); }
    seats.push({ x, z, y: 0.55, yaw: yaw, mode: 'sit', name, r: 2.6 });
    solid(x - 1.0, z - 1.0, x + 1.0, z - 0.4, 4.5);
  }
  function sofa(x, z, yaw, col, n) {
    const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t); const w = n * 1.1 + 0.6;
    add(G().boxB, '#6a3a1a', w, 0.45, 1.2, 0, 0, 0, t); add(G().boxB, col, w - 0.3, 0.3, 1.0, 0, 0.45, 0.05, t); add(G().boxB, col, w, 1.0, 0.3, 0, 0.45, -0.5, t);
    for (const sd of [-1, 1]) add(G().boxB, col, 0.3, 0.75, 1.2, sd * (w / 2 - 0.15), 0.45, 0, t);
    for (let k = 0; k < n; k++) { const px = -(n - 1) * 0.55 + k * 1.1; add(G().box, L.mat(['#ffd0e8', '#fff0c0', '#c8e0ff'][k % 3]), 0.55, 0.45, 0.15, px, 1.05, -0.3, t).rotation.x = -0.2;
      const cy = Math.cos(yaw), sy = Math.sin(yaw); seats.push({ x: x + px * cy, z: z - px * sy, y: 0.45, yaw, mode: 'sit', name: 'Sofa', r: 1.2 }); }
  }
  function bed(x, z, yaw) {
    const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t); const gm = gold();
    add(G().boxB, '#7a4a2a', 3.4, 0.6, 4.4, 0, 0, 0, t); add(G().boxB, '#fff8f0', 3.2, 0.35, 4.2, 0, 0.6, 0, t);
    add(G().boxB, '#e890b8', 3.25, 0.15, 2.8, 0, 0.95, 0.7, t); for (const sd of [-1, 1]) add(G().box, '#ffffff', 1.2, 0.35, 0.7, sd * 0.75, 1.15, -1.6, t);
    add(G().boxB, '#7a4a2a', 3.4, 2.4, 0.3, 0, 0.6, -2.2, t);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(G().cylB, gm, 0.1, 5, 0.1, sx * 1.65, 0, sz * 2.15, t);
    add(G().boxB, '#d870a8', 3.6, 0.2, 4.6, 0, 5, 0, t);
    for (const sd of [-1, 1]) { const c = add(G().box, new T.MeshLambertMaterial({ color: 0xffc8e0, transparent: true, opacity: 0.6, side: T.DoubleSide }), 0.05, 4.2, 4.3, sd * 1.72, 2.9, 0, t, { noShadow: true }); c.rotation.z = sd * 0.04; }
    seats.push({ x, z, y: 1.0, yaw: yaw, mode: 'lie', name: 'Himmelbett', r: 2.6, bed: true });
    solid(x - 1.8, z - 2.3, x + 1.8, z + 2.3, 0.95);
  }
  function fireplace(x, z, yaw) {
    const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t);
    add(G().boxB, '#b8b0a8', 5, 4.2, 1.2, 0, 0, 0, t); add(G().boxB, '#1a1210', 3, 2.2, 1.0, 0, 0, 0.25, t); add(G().boxB, '#d8d0c8', 5.6, 0.4, 1.5, 0, 4.2, 0.1, t);
    for (let k = 0; k < 3; k++) add(G().cyl, '#5a3a22', 0.18, 1.6, 0.18, -0.4 + k * 0.4, 0.25, 0.6, t).rotation.z = Math.PI / 2;
    const fl = []; for (let k = 0; k < 5; k++) fl.push(add(G().cone, new T.MeshBasicMaterial({ color: k % 2 ? 0xffa030 : 0xff5a10, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }), 0.3, 1, 0.3, -0.8 + k * 0.4, 0.8, 0.6, t, { noShadow: true }));
    const pl = new T.PointLight(0xff9040, 1.6, 30, 2); pl.position.set(0, 1.4, 2); t.add(pl);
    fires.push({ fl, pl }); return t;
  }
  function chandelier(x, y, z) {
    const c = new T.Group(); c.position.set(x, y, z); g.add(c); const gm = gold();
    add(G().cyl, gm, 0.05, 4, 0.05, 0, 2, 0, c); add(new T.TorusGeometry(1.8, 0.1, 8, 24), gm, 1, 1, 1, 0, 0, 0, c).rotation.x = Math.PI / 2;
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; add(G().cylB, '#fff8e8', 0.07, 0.4, 0.07, Math.sin(a) * 1.8, 0.05, Math.cos(a) * 1.8, c); add(G().sph, new T.MeshBasicMaterial({ color: 0xffd080 }), 0.08, 0.14, 0.08, Math.sin(a) * 1.8, 0.55, Math.cos(a) * 1.8, c, { noShadow: true }); }
    for (let k = 0; k < 6; k++) add(new T.OctahedronGeometry(0.15), new T.MeshBasicMaterial({ color: 0xe8f8ff }), 1, 1.6, 1, Math.sin(k) * 1.2, -0.6, Math.cos(k) * 1.2, c, { noShadow: true });
  }
  function bookshelf(x, z, yaw) {
    const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t);
    add(G().boxB, '#6a3a1a', 4, 6, 0.8, 0, 0, 0, t);
    const BC = ['#c02a2a', '#2a6ac0', '#3a8a3a', '#e8c020', '#6a3a8a', '#d07020', '#1e2f5a'];
    for (let r = 0; r < 5; r++) for (let k = 0; k < 12; k++) add(G().boxB, BC[(r * 5 + k * 3) % 7], 0.24, 0.8 + ((k * 7 + r) % 3) * 0.12, 0.6, -1.65 + k * 0.3, 0.25 + r * 1.15, 0.12, t, { noShadow: true });
  }
  // Teppich, Fenster, Bilder
  const carpetTex = () => cvTex(64, 256, (c, w, h) => { c.fillStyle = '#a8102a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f0c850'; c.fillRect(0, 0, 5, h); c.fillRect(w - 5, 0, 5, h); for (let y = 16; y < h; y += 32) { c.beginPath(); c.moveTo(w / 2, y - 8); c.lineTo(w / 2 + 8, y); c.lineTo(w / 2, y + 8); c.lineTo(w / 2 - 8, y); c.fill(); } });
  function painting(x, y, z, yaw, draw, w, h) {
    const t = new T.Group(); t.position.set(x, y, z); t.rotation.y = yaw; g.add(t);
    add(G().box, gold(), w + 0.5, h + 0.5, 0.2, 0, 0, 0, t);
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshLambertMaterial({ map: cvTex(256, Math.round(256 * h / w), draw) })); m.position.z = 0.12; t.add(m);
  }

  // ---------- Königsschloss ----------
  function buildRoyal() {
    const A = QA, H = 16;
    const marble = cvTex(128, 128, (c, w, h) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = (x + y) % 2 ? '#f4f0ea' : '#d8d0e8'; c.fillRect(x * 64, y * 64, 64, 64); } c.strokeStyle = 'rgba(160,150,170,.35)'; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(Math.random() * w, Math.random() * h); c.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h); c.stroke(); } }, 24, 16);
    const fl = new T.Mesh(new T.PlaneGeometry(RA.x2 - RA.x1, RA.z2 - RA.z1), new T.MeshStandardMaterial({ map: marble, roughness: 0.25, metalness: 0.1 })); fl.rotation.x = -Math.PI / 2; fl.position.set(A.x, 0.02, A.z); fl.receiveShadow = true; g.add(fl);
    const wallM = L.mat('#f6eef4'), wallL = L.mat('#e8d8c8'), wallB = L.mat('#f0e0ec');
    const ceil = new T.Mesh(new T.PlaneGeometry(RA.x2 - RA.x1, RA.z2 - RA.z1), new T.MeshLambertMaterial({ color: 0xf8f0f8, side: T.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.set(A.x, H, A.z); g.add(ceil);
    // Thronsaal (Mitte): x ±20, z ±30; Lounge links (x −46…−20), Schlafgemach rechts (x 20…46), je z ±14
    const tx1 = A.x - 20, tx2 = A.x + 20, tz1 = A.z - 30, tz2 = A.z + 30;
    wall(tx1, tz1, tx2, tz1, H, wallM); wall(tx1, tz2, tx2, tz2, H, wallM, A.x, 6);
    wall(tx1, tz1, tx1, tz2, H, wallM, A.z, 6); wall(tx2, tz1, tx2, tz2, H, wallM, A.z, 6);
    const lz1 = A.z - 14, lz2 = A.z + 14;
    wall(RA.x1, lz1, tx1, lz1, H, wallL); wall(RA.x1, lz2, tx1, lz2, H, wallL); wall(RA.x1, lz1, RA.x1, lz2, H, wallL);
    wall(tx2, lz1, RA.x2, lz1, H, wallB); wall(tx2, lz2, RA.x2, lz2, H, wallB); wall(RA.x2, lz1, RA.x2, lz2, H, wallB);
    // Teppich, Säulen, Fenster, Banner
    const cp = new T.Mesh(new T.PlaneGeometry(7, 56), new T.MeshLambertMaterial({ map: carpetTex() })); cp.material.map.repeat.set(1, 4); cp.material.map.wrapT = T.RepeatWrapping; cp.rotation.x = -Math.PI / 2; cp.position.set(A.x, 0.05, A.z + 1); g.add(cp);
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) { const px = A.x + sd * 12, pz = A.z - 20 + k * 10; add(G().cylB, '#fbf8f4', 0.9, H, 0.9, px, 0, pz); add(G().cylB, gold(), 1.2, 0.6, 1.2, px, H - 0.6, pz); add(G().cylB, gold(), 1.2, 0.5, 1.2, px, 0, pz); solid(px - 0.9, pz - 0.9, px + 0.9, pz + 0.9, H); }
    const winM = new T.MeshStandardMaterial({ color: 0xbfe0ff, emissive: 0x8ac0ff, emissiveIntensity: 0.3 });
    for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) { const pz = A.z - 24 + k * 15, wx = sd > 0 ? tx2 - 0.45 : tx1 + 0.45; if (Math.abs(pz - A.z) < 5) continue; add(G().box, winM, 0.1, 8, 3.5, wx, 7.5, pz); add(G().box, gold(), 0.15, 0.3, 3.8, wx, 11.6, pz); add(G().cone, winM, 1.9, 1.6, 0.1, wx, 12.3, pz).rotation.x = 0; }
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const b = add(G().box, sd > 0 ? '#2a4ab0' : '#c02a5a', 2.2, 6, 0.1, A.x + sd * 6 + (k - 1) * 0, 9, tz1 + 0.5); b.position.x = A.x + sd * (5 + k * 4); add(G().sph, gold(), 0.5, 0.5, 0.1, b.position.x, 10, tz1 + 0.58); }
    // Podest mit zwei Thronen
    add(G().boxB, '#c8b8d8', 14, 0.12, 7, A.x, 0, A.z - 25); add(G().boxB, '#a8102a', 12, 0.14, 5, A.x, 0, A.z - 25);
    throne(A.x - 2.2, A.z - 26, 0, L.mat('#d870a8'), 'BEYZAS Thron'); throne(A.x + 2.2, A.z - 26, 0, L.mat('#2a4ab0'), 'Thron des Prinzen');
    for (const g2 of seats.slice(-2)) g2.y += 0.12;
    painting(A.x, 11, tz1 + 0.6, 0, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffd8ec'); gr.addColorStop(1, '#a8c8ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2214'; c.beginPath(); c.ellipse(w * 0.36, h * 0.38, 26, 34, 0, 0, 6.3); c.fill(); c.fillStyle = '#eec7a4'; c.beginPath(); c.arc(w * 0.36, h * 0.36, 18, 0, 6.3); c.fill(); c.fillStyle = '#eaa6cc'; c.fillRect(w * 0.27, h * 0.5, 46, h * 0.5); c.fillStyle = '#6e4426'; c.beginPath(); c.arc(w * 0.64, h * 0.33, 21, 0, 6.3); c.fill(); c.fillStyle = '#e6b892'; c.beginPath(); c.arc(w * 0.64, h * 0.37, 17, 0, 6.3); c.fill(); c.fillStyle = '#1e3a8a'; c.fillRect(w * 0.55, h * 0.5, 46, h * 0.5); c.fillStyle = '#ff4a8a'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.fillText('♥', w / 2, h * 0.28); c.fillStyle = '#5a3a20'; c.font = 'bold 16px Arial'; c.fillText('BEYZA & PRINZ', w / 2, h * 0.94); }, 7, 5);
    chandelier(A.x, H - 4, A.z - 12); chandelier(A.x, H - 4, A.z + 10);
    const l1 = new T.PointLight(0xffe0b0, 1.3, 60, 2); l1.position.set(A.x, H - 5, A.z - 5); g.add(l1); lights.push(l1);
    label('👑 THRONSAAL', '#ffe0a0', 2).position.set(A.x, 13.5, tz2 - 2);
    // Lounge
    const lx = (RA.x1 + tx1) / 2;
    const rug = new T.Mesh(new T.CircleGeometry(7, 32), L.mat('#5a2a6a')); rug.rotation.x = -Math.PI / 2; rug.position.set(lx, 0.04, A.z); g.add(rug);
    fireplace(RA.x1 + 1.0, A.z, Math.PI / 2);
    sofa(lx - 4, A.z, Math.PI / 2, '#c84a7a', 3); sofa(lx + 1, A.z - 6.5, 0, '#7a4ac8', 3); sofa(lx + 1, A.z + 6.5, Math.PI, '#4a7ac8', 3);
    add(G().cylB, '#7a4a2a', 1.8, 0.8, 1.8, lx + 1, 0, A.z); add(G().cylB, '#fff8f0', 1.9, 0.05, 1.9, lx + 1, 0.8, A.z); solid(lx - 0.6, A.z - 1.6, lx + 2.6, A.z + 1.6, 0.85);
    for (let k = 0; k < 3; k++) add(G().cylB, ['#fff0f8', '#ffd0e8', '#ffb0d0'][k], 0.7 - k * 0.18, 0.35, 0.7 - k * 0.18, lx + 1, 0.85 + k * 0.35, A.z);
    add(G().sph, '#ff3a5a', 0.12, 0.12, 0.12, lx + 1, 1.95, A.z); add(G().sph, '#ffffff', 0.4, 0.35, 0.4, lx + 2.2, 1.15, A.z + 0.7); for (let k = 0; k < 3; k++) add(G().cylB, '#f4f0e8', 0.15, 0.2, 0.15, lx + 0.2 + k * 0.5, 0.85, A.z - 1);
    bookshelf(lx - 2, lz1 + 0.8, 0); bookshelf(lx + 4, lz1 + 0.8, 0);
    // Klavier
    const pn = new T.Group(); pn.position.set(lx + 5, 0, lz2 - 2.5); pn.rotation.y = Math.PI; g.add(pn);
    add(G().boxB, '#0e0e12', 3, 1.0, 1.6, 0, 0.8, 0, pn); add(G().box, '#f4f4f0', 2.6, 0.06, 0.4, 0, 1.82, 0.7, pn); for (let k = 0; k < 13; k++) add(G().box, '#0e0e12', 0.08, 0.05, 0.22, -1.2 + k * 0.2, 1.87, 0.62, pn, { noShadow: true });
    const lid = add(G().box, '#0e0e12', 3, 0.08, 1.6, 0, 2.1, -0.1, pn); lid.rotation.x = -0.5;
    for (const [sx, sz] of [[-1.3, -0.6], [1.3, -0.6], [0, 0.6]]) add(G().cylB, '#0e0e12', 0.1, 0.8, 0.1, sx, 0, sz, pn);
    doors.push({ x: lx + 5, z: lz2 - 4.6, kind: 'piano', r: 2.2 }); solid(lx + 3.5, lz2 - 3.4, lx + 6.5, lz2 - 1.6, 1.8);
    const l2 = new T.PointLight(0xffd8b0, 1.0, 40, 2); l2.position.set(lx, H - 4, A.z); g.add(l2); lights.push(l2);
    label('🛋️ LOUNGE', '#ffd0f0', 1.6).position.set(lx, 9, A.z);
    // Schlafgemach
    const bx = (tx2 + RA.x2) / 2;
    const rug2 = new T.Mesh(new T.PlaneGeometry(14, 10), L.mat('#f0c8dc')); rug2.rotation.x = -Math.PI / 2; rug2.position.set(bx, 0.04, A.z); g.add(rug2);
    bed(bx + 6, A.z, -Math.PI / 2);
    add(G().boxB, '#7a4a2a', 3, 5, 1.2, bx - 3, 0, lz1 + 1); add(G().box, gold(), 0.1, 0.4, 0.1, bx - 3.1, 2.6, lz1 + 1.65); solid(bx - 4.5, lz1 + 0.4, bx - 1.5, lz1 + 1.6, 5);
    add(G().box, gold(), 1.6, 2.6, 0.12, bx + 2, 3, lz2 - 0.5); add(G().box, new T.MeshStandardMaterial({ color: 0xe8f4ff, metalness: 1, roughness: 0.05 }), 1.3, 2.3, 0.05, bx + 2, 3, lz2 - 0.58);
    sofa(bx - 4, A.z + 6, Math.PI, '#e8a0c8', 2);
    const l3 = new T.PointLight(0xffc8e8, 1.0, 40, 2); l3.position.set(bx, H - 4, A.z); g.add(l3); lights.push(l3);
    label('🛏️ SCHLAFGEMACH', '#ffd0e8', 1.6).position.set(bx, 9, A.z);
    // Ausgang
    doors.push({ x: A.x, z: tz2 - 1.5, kind: 'exitA', r: 3.5 });
    add(G().box, '#5a3a22', 6, 7, 0.3, A.x, 3.5, tz2 + 0.5); label('🚪 Ausgang (E)', '#ffffff', 1).position.set(A.x, 7.8, tz2 - 0.6);
  }

  // ---------- Kristallschloss ----------
  let pool = null, aurora = [];
  function buildCrystal() {
    const B = QB, R = RB.r, H = 20;
    const cm = new T.MeshStandardMaterial({ color: 0xa8e8ff, metalness: 0.2, roughness: 0.1, emissive: 0x2a80c0, emissiveIntensity: 0.3, transparent: true, opacity: 0.8, side: T.DoubleSide });
    const flT = cvTex(128, 128, (c, w, h) => { c.fillStyle = '#d8f4ff'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,200,255,.5)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { c.beginPath(); const x = Math.random() * w, y = Math.random() * h; for (let q = 0; q < 6; q++) { const a = q / 6 * 6.283; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); } c.stroke(); } }, 10);
    const fl = new T.Mesh(new T.CircleGeometry(R, 48), new T.MeshStandardMaterial({ map: flT, emissive: 0x3a90c0, emissiveIntensity: 0.3, roughness: 0.15 })); fl.rotation.x = -Math.PI / 2; fl.position.set(B.x, 0.02, B.z); g.add(fl);
    const wl = new T.Mesh(new T.CylinderGeometry(R, R, H, 48, 1, true), cm); wl.position.set(B.x, H / 2, B.z); g.add(wl);
    const dome = new T.Mesh(new T.SphereGeometry(R, 32, 12, 0, 6.283, 0, Math.PI / 2), cm); dome.position.set(B.x, H, B.z); g.add(dome);
    for (let k = 0; k < 32; k++) { const a = k / 32 * 6.283, a2 = (k + 1) / 32 * 6.283; const x1 = B.x + Math.sin(a) * R, z1 = B.z + Math.cos(a) * R, x2 = B.x + Math.sin(a2) * R, z2 = B.z + Math.cos(a2) * R; if (Math.abs(Math.sin(a)) < 0.12 && Math.cos(a) > 0) continue; L.addBox(Math.min(x1, x2) - 0.4, Math.min(z1, z2) - 0.4, Math.max(x1, x2) + 0.4, Math.max(z1, z2) + 0.4, H, 'building'); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + 0.2, x = B.x + Math.sin(a) * (R - 4), z = B.z + Math.cos(a) * (R - 4); add(G().cylB, cm, 1, H, 1, x, 0, z); add(G().cone, cm, 1.3, 3, 1.3, x, H + 1.5, z); }
    // schwebende Kristalle, Polarlicht unter der Kuppel
    for (let k = 0; k < 14; k++) { const m = add(new T.OctahedronGeometry(1), cm, 0.7, 1.4, 0.7, B.x + Math.sin(k * 2.4) * (8 + k % 3 * 5), 8 + (k % 4) * 2.5, B.z + Math.cos(k * 2.4) * (8 + k % 3 * 5), null, { noShadow: true }); spins.push({ m, y: m.position.y, ph: k }); }
    const auT = cvTex(4, 64, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,255,200,0)'); gr.addColorStop(0.5, 'rgba(120,255,200,.7)'); gr.addColorStop(0.8, 'rgba(180,120,255,.5)'); gr.addColorStop(1, 'rgba(180,120,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    for (let k = 0; k < 3; k++) { const a = new T.Mesh(new T.PlaneGeometry(40, 6, 20, 1), new T.MeshBasicMaterial({ map: auT, transparent: true, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending, fog: false })); a.position.set(B.x, 17 + k * 1.5, B.z - 6 + k * 6); a.rotation.y = k * 0.6; g.add(a); aurora.push(a); }
    // Kristallthron
    const tg = new T.Group(); tg.position.set(B.x, 0, B.z - 20); g.add(tg);
    add(G().boxB, cm, 2.4, 0.7, 2, 0, 0, 0, tg); add(G().boxB, L.mat('#80c8ff'), 2, 0.3, 1.6, 0, 0.7, 0, tg);
    for (let k = 0; k < 5; k++) add(new T.OctahedronGeometry(1), cm, 0.3, 2 + (2 - Math.abs(k - 2)) * 0.8, 0.2, -0.9 + k * 0.45, 2.5 + (2 - Math.abs(k - 2)) * 0.5, -0.85, tg);
    seats.push({ x: B.x, z: B.z - 20, y: 1.0, yaw: 0, mode: 'sit', name: 'Kristallthron', r: 2.2 }); solid(B.x - 1.2, B.z - 21, B.x + 1.2, B.z - 19, 0.7);
    // warmer Kristall-Pool
    const pT = cvTex(64, 64, (c, w, h) => { c.fillStyle = '#4ac8e8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.35).toFixed(2) + ')'; c.fillRect(Math.random() * w, Math.random() * h, 5, 1); } }, 4);
    add(new T.TorusGeometry(7, 0.6, 8, 40), cm, 1, 1, 1, B.x, 0.35, B.z + 2).rotation.x = Math.PI / 2;
    pool = new T.Mesh(new T.CircleGeometry(7, 40), new T.MeshStandardMaterial({ map: pT, color: 0x9ae8ff, emissive: 0x2aa0d0, emissiveIntensity: 0.5, roughness: 0.05, transparent: true, opacity: 0.88 })); pool.rotation.x = -Math.PI / 2; pool.position.set(B.x, 0.3, B.z + 2); g.add(pool);
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; seats.push({ x: B.x + Math.sin(a) * 4.5, z: B.z + 2 + Math.cos(a) * 4.5, y: -0.55, yaw: a + Math.PI, mode: 'bath', name: 'Kristall-Pool', r: 2.4 }); }
    // Liegen
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * 0.8 + Math.PI / 2, x = B.x + Math.sin(a) * 17, z = B.z + Math.cos(a) * 17, t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = a + Math.PI; g.add(t);
      add(G().boxB, cm, 1.2, 0.5, 3, 0, 0, 0, t); add(G().boxB, L.mat('#e0f4ff'), 1.1, 0.15, 2.4, 0, 0.5, 0.2, t); const bk = add(G().box, L.mat('#e0f4ff'), 1.1, 0.15, 1.1, 0, 0.9, -1.2, t); bk.rotation.x = 0.7;
      seats.push({ x, z, y: 0.65, yaw: a + Math.PI, mode: 'lie', name: 'Kristall-Liege', r: 1.8 }); }
    const l4 = new T.PointLight(0x9ae0ff, 1.6, 70, 2); l4.position.set(B.x, 14, B.z); g.add(l4); lights.push(l4);
    label('💎 KRISTALLHALLE', '#c8f0ff', 2).position.set(B.x, 12, B.z + 22);
    doors.push({ x: B.x, z: B.z + R - 2, kind: 'exitB', r: 3.5 }); label('🚪 Ausgang (E)', '#ffffff', 1).position.set(B.x, 6.5, B.z + R - 1.5);
    doors.push({ x: B.x, z: B.z + 14, kind: 'musicbox', r: 2 }); const mb = new T.Group(); mb.position.set(B.x, 0, B.z + 14); g.add(mb); add(G().cylB, cm, 0.6, 1.1, 0.6, 0, 0, 0, mb); add(G().boxB, gold(), 0.9, 0.5, 0.7, 0, 1.1, 0, mb); add(G().sph, L.mat('#ff90d0', { emissive: '#ff70c0', ei: 0.6 }), 0.15, 0.3, 0.15, 0, 1.75, 0, mb);
  }
  // Außen: Türen an den Schlössern
  function buildOutsideDoors() {
    const Lc = L.FAIRY_LOC; if (!Lc) return;
    const dA = { x: Lc.schloss.x, z: Lc.schloss.z - 83.2 }, dB = { x: Lc.eis.x, z: Lc.eis.z + 9.4 };
    const glow = new T.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.55 });
    add(G().box, glow, 5.6, 8.6, 0.1, dA.x, 4.3, dA.z + 0.3, null, { noShadow: true });
    label('🚪 Königsschloss – E: hineingehen', '#ffe8a0', 1.6).position.set(dA.x, 10.5, dA.z + 1);
    add(G().box, new T.MeshBasicMaterial({ color: 0xc8f4ff, transparent: true, opacity: 0.7 }), 4, 7, 0.2, dB.x, 3.5, dB.z, null, { noShadow: true });
    label('🚪 Kristallhalle – E: hineingehen', '#c8f4ff', 1.6).position.set(dB.x, 9, dB.z + 1);
    doors.push({ x: dA.x, z: dA.z + 2.5, kind: 'enterA', r: 5 }, { x: dB.x, z: dB.z + 2, kind: 'enterB', r: 5 });
    doors.outsideA = dA; doors.outsideB = dB;
  }
  function build() { built = true; g = new T.Group(); L.scene.add(g); buildRoyal(); buildCrystal(); buildOutsideDoors(); }

  // ---------- Chillen ----------
  let chill = null, trans = null, chillMsgT = 0;
  function startChill(s) {
    chill = s; P.vx = P.vz = P.vy = 0; P.x = s.x; P.z = s.z; P.y = Math.max(0, s.y); P.yaw = s.yaw;
    const txt = s.mode === 'lie' ? (s.bed ? '😴 Du kuschelst dich ins Himmelbett …' : '😌 Du legst dich gemütlich hin …') : s.mode === 'bath' ? '♨️ Ahh … das warme Kristallwasser ist herrlich.' : '😌 Du machst es dir bequem: ' + s.name + '.';
    L.msg(txt + ' (Laufen = aufstehen · heilt langsam)', 4000);
    if (s.bed) { L.msg('🌙 Bleib liegen, um zu schlafen …', 3000); s.sleepT = 0; }
  }
  function stopChill() { if (!chill) return; const s = chill; chill = null; P.y = 0; P.x = s.x + Math.sin(s.yaw) * 1.6; P.z = s.z + Math.cos(s.yaw) * 1.6; }
  L.fairyChill = () => chill;
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (!chill || P.vehicle) return;
    const s = chill;
    if (s.mode === 'lie') { L.animHuman(r, { mode: 'idle', phase: performance.now() / 1000 }); r.root.position.set(s.x, s.y + 0.25, s.z); r.root.rotation.set(-Math.PI / 2, s.yaw, 0, 'YXZ'); r.root.position.y = s.y + 0.3; }
    else { L.animHuman(r, { mode: 'sit', phase: 0 }); r.root.position.set(s.x, s.y, s.z); r.root.rotation.set(0, s.yaw, 0); }
  };
  function updateChill(dt) {
    const s = chill;
    const mv = L.keys && (L.keys.KeyW || L.keys.KeyA || L.keys.KeyS || L.keys.KeyD || L.keys.Space) || (L.touchMove && (Math.abs(L.touchMove.x || 0) + Math.abs(L.touchMove.y || 0) > 0.3));
    if (mv || !P.alive) { stopChill(); return; }
    P.vx = P.vz = P.vy = 0; P.x = s.x; P.z = s.z; P.y = Math.max(0, s.y); P.air = false;
    P.hp = Math.min(100, P.hp + dt * (s.mode === 'bath' ? 6 : s.bed ? 8 : 3));
    if (P.food !== undefined) P.food = Math.min(100, P.food + dt * 0.5);
    chillMsgT -= dt;
    if (s.mode === 'bath' && Math.random() < dt * 6) L.fx('#ffffff', s.x + L.rand(-1, 1), 0.5, s.z + L.rand(-1, 1), 1, 0.6, { basic: true, size: 0.25, life: 1.6, g: -1 });
    if (s.bed) { s.sleepT += dt; if (s.sleepT > 6 && !s.slept) { s.slept = true; doSleep(); } }
  }
  function doSleep() {
    const f = L.backFade; if (f) { f.style.background = '#0a0820'; f.style.opacity = '0.92'; }
    P.hp = 100; if (P.food !== undefined) P.food = 100; if (P.water !== undefined) P.water = 100;
    const solo = !(L.net && L.net.connected);
    if (solo && L.env) L.env.time = 8;
    setTimeout(() => { if (f) f.style.opacity = '0'; L.banner('☀️ GUTEN MORGEN!', 'Du hast im Himmelbett geschlafen – Leben, Hunger und Durst sind voll.' + (solo ? ' Es ist jetzt 8 Uhr.' : '')); }, 1600);
  }
  // Musik: kleine Melodie (Klavier / Spieluhr)
  function melody(kind) {
    if (!L.tn) return; const notes = kind === 'piano' ? [523, 659, 784, 659, 698, 880, 784, 659, 587, 523, 587, 659, 523] : [1047, 1319, 1568, 1319, 1175, 1397, 1760, 1568, 1319, 1175, 1047];
    notes.forEach((f, i) => L.tn({ f, fTo: f, dur: kind === 'piano' ? 0.5 : 0.35, type: kind === 'piano' ? 'triangle' : 'sine', vol: 0.18, delay: i * (kind === 'piano' ? 0.32 : 0.26) }));
    L.msg(kind === 'piano' ? '🎹 Du spielst eine kleine Märchen-Melodie auf dem Klavier.' : '🎶 Die Spieluhr klimpert eine zarte Melodie.', 3500);
  }
  // Türen und Sitze: E
  function nearSpot() {
    if (!built || P.vehicle || trans) return null;
    for (const d of doors) if (Math.hypot(P.x - d.x, P.z - d.z) < d.r && (P.y || 0) < 3) return d;
    if (!chill) { let best = null, bd = 9; for (const s of seats) { const dd = Math.hypot(P.x - s.x, P.z - s.z); if (dd < s.r && dd < bd) { bd = dd; best = s; } } if (best) return { seat: best }; }
    return null;
  }
  const och = L.crateHint, oci = L.crateInteract;
  L.crateHint = () => {
    if (chill) return chill.mode === 'lie' ? '😌 Liegen … (Laufen = aufstehen)' : '😌 Chillen … (Laufen = aufstehen)';
    const n = nearSpot();
    if (n) { if (n.seat) return 'E: ' + (n.seat.mode === 'lie' ? '🛏️ hinlegen' : n.seat.mode === 'bath' ? '♨️ ins warme Wasser' : '🪑 hinsetzen') + ' (' + n.seat.name + ')';
      return { enterA: 'E: 🏰 Ins Königsschloss gehen', enterB: 'E: 💎 In die Kristallhalle gehen', exitA: 'E: 🚪 Schloss verlassen', exitB: 'E: 🚪 Kristallhalle verlassen', piano: 'E: 🎹 Klavier spielen', musicbox: 'E: 🎶 Spieluhr aufziehen' }[n.kind]; }
    return och ? och() : null;
  };
  L.crateInteract = function () {
    const n = nearSpot(); if (!n) return oci ? oci() : false;
    if (n.seat) { startChill(n.seat); return true; }
    if (n.kind === 'piano' || n.kind === 'musicbox') { melody(n.kind); return true; }
    const to = n.kind === 'enterA' ? { x: QA.x, z: QA.z + 26, yaw: Math.PI, txt: '👑 Willkommen im Königsschloss – Thronsaal, Lounge und Schlafgemach. Setz dich hin und chill!' }
      : n.kind === 'enterB' ? { x: QB.x, z: QB.z + RB.r - 5, yaw: Math.PI, txt: '💎 Willkommen in der Kristallhalle – warmer Pool, Liegen und der Kristallthron.' }
      : n.kind === 'exitA' ? { x: doors.outsideA.x, z: doors.outsideA.z + 6, yaw: 0, txt: '' } : { x: doors.outsideB.x, z: doors.outsideB.z + 6, yaw: 0, txt: '' };
    trans = { t: 0, to };
    return true;
  };
  function updateTrans(dt) {
    const tr = trans, f = L.backFade; tr.t += dt; P.vx = P.vz = 0;
    if (f) { f.style.background = '#fff8f0'; f.style.opacity = String(tr.t < 0.35 ? tr.t / 0.35 : Math.max(0, 1 - (tr.t - 0.5) / 0.4)); }
    if (tr.t > 0.4 && !tr.done) { tr.done = true; P.x = tr.to.x; P.z = tr.to.z; P.y = 0; P.vy = 0; P.yaw = P.camYaw = tr.to.yaw; P.spawnProt = Math.max(P.spawnProt || 0, 2); L.snd.door && L.snd.door(); if (tr.to.txt) L.msg(tr.to.txt, 5000); }
    if (tr.t > 0.95) { trans = null; if (f) f.style.opacity = '0'; }
  }
  L.updateFairyCastle = function (dt) {
    if (!(L.inFairy && L.inFairy(P.x, P.z))) { if (chill) stopChill(); return; }
    if (!built) build();
    if (trans) updateTrans(dt);
    if (chill) updateChill(dt);
    const t = performance.now() / 1000, close = L.inFairyCastle(P.x, P.z);
    g.visible = true;
    if (!close) return;
    for (const f of fires) { f.fl.forEach((m, k) => { m.scale.y = 0.8 + Math.sin(t * 11 + k * 1.7) * 0.35; m.scale.x = 0.3 + Math.sin(t * 7 + k) * 0.06; }); f.pl.intensity = 1.4 + Math.sin(t * 13) * 0.25 + Math.random() * 0.15; }
    for (const s of spins) { s.m.rotation.y += dt * 0.6; s.m.position.y = s.y + Math.sin(t + s.ph) * 0.5; }
    aurora.forEach((a, k) => { const p = a.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, (i < p.count / 2 ? 3 : -3) + Math.sin(t * 0.8 + p.getX(i) * 0.15 + k) * 1.2); p.needsUpdate = true; });
    if (pool) pool.material.map.offset.x += dt * 0.02;
  };
  L.clearFairyCastle = function () { chill = null; trans = null; };
})();
