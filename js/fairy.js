'use strict';
// Die Märchenwelt: Heimdall (asgard.js) beamt dich auf Wunsch hierher. Eine riesige, schwebende Wiesenwelt (5-mal so groß wie eine Insel)
// mit Königsschloss, Kristallschloss, Drachenhöhle, Zauberwald, Lebkuchenhaus, Großmutters Haus, Rapunzelturm, Riesenbohnenranke
// mit Wolkenpalast, Spiegelsee, Zwergenmine, Windmühle, Feenkreis, Einhörnern, Drachen und schwebenden Inseln.
// Hier läuft BEYZA (BEYY) herum – eine riesige, friedliche Riesin. Monster sind hier friedlich, außer man greift sie an.
// Jeden Tag gibt es an der Quest-Tafel im Dorf neue Nebenquests (allein oder mit Freunden), je schwerer, desto mehr Münzen.
// Alles eigene Entwürfe nach alten Volksmärchen.
(function () {
  const L = window.L, T = THREE, P = L.player, E = L.ents;
  const FX = 72000, FZ = 0, FR = 1600;
  const W = (dx, dz) => ({ x: FX + dx, z: FZ + dz });
  L.inFairy = (x, z) => x > 68000 && x < 76000 && Math.abs(z || 0) < 5000;
  L.FAIRY = { x: FX, z: FZ, r: FR };
  setTimeout(() => { const od = L.dimLand; L.dimLand = (x, z) => (L.inFairy(x, z) ? Math.hypot(x - FX, z - FZ) < FR : od ? od(x, z) : false); }, 0);
  // „Insel“-Objekt für Monster (friedlich, eigene Gruppe für das Wiederkommen)
  const FW = { id: 'fairy', name: 'der Märchenwelt', icon: '🏰', x: FX, z: FZ, r: FR - 40, peace: true, populated: false, monTint: '#ffc8f0' };
  L.FAIRY_ISL = FW;
  const isClient = () => L.net && L.net.role === 'client';
  const inF = () => L.inFairy(P.x, P.z);

  // ---------- Orte ----------
  const LOC = {
    dorf: { ...W(0, 1150), n: '🏘️ Märchendorf' }, brett: { ...W(14, 1128), n: '📜 Quest-Tafel' }, ring: { ...W(-46, 1205), n: '🍄 Feenkreis (Heimweg)' },
    schloss: { ...W(0, -880), n: '🏰 Königsschloss' }, eis: { ...W(1050, -450), n: '💎 Kristallschloss' }, hoehle: { ...W(-1050, -700), n: '🐉 Drachenhöhle' },
    lebkuchen: { ...W(-700, 450), n: '🍭 Lebkuchenhaus' }, oma: { ...W(-1050, 150), n: '🧺 Großmutters Haus' }, rapunzel: { ...W(650, 650), n: '🗼 Rapunzelturm' },
    bohne: { ...W(300, -250), n: '🌱 Riesenbohnenranke' }, wolke: { ...W(300, -250), n: '☁️ Wolkenpalast', y: 165 }, see: { ...W(950, 250), n: '🦢 Spiegelsee' },
    mine: { ...W(-450, -1250), n: '⛏️ Zwergenmine' }, muehle: { ...W(520, 1150), n: '🌾 Windmühle' }, brunnen: { ...W(-60, 1100), n: '⛲ Froschkönig-Brunnen' },
    baby: { ...W(80, 1185), n: '🐲 Babydrache Funki' }, fee: { ...W(-600, 100), n: '🧚 Fee Lumina' }, platz: { ...W(0, 0), n: '✨ Wunschplatz' }
  };
  L.FAIRY_LOC = LOC;
  const TOWER = { x: LOC.rapunzel.x, z: LOC.rapunzel.z, h: 46, r: 7 };
  const STALK = { x: LOC.bohne.x, z: LOC.bohne.z, top: 165, r: 58 };
  const LAKE = { x: LOC.see.x, z: LOC.see.z, r: 160 };
  const CAVE = { x: LOC.hoehle.x, z: LOC.hoehle.z, r: 46 };
  const ARRIVE = () => ({ x: LOC.ring.x + 10, z: LOC.ring.z - 6 });

  // Böden: Rapunzelturm-Spitze, Wolkenplattform
  function fairyFloor(x, z, y) {
    if (!L.inFairy(x, z)) return null;
    if (y > 150 && Math.hypot(x - STALK.x, z - STALK.z) < STALK.r && STALK.top <= y + 1.3) return STALK.top;
    if (y > 38 && Math.hypot(x - TOWER.x, z - TOWER.z) < 9.5 && TOWER.h <= y + 1.3) return TOWER.h;
    return null;
  }
  const ofa = L.floorAt;
  L.floorAt = function (x, z, y) { const f = fairyFloor(x, z, y); if (f !== null) return f; return ofa ? ofa(x, z, y) : null; };

  // ---------- Bau-Helfer ----------
  let built = null, g = null, s = 4242;
  const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const RR = (a, b) => a + R() * (b - a);
  const G = () => L.GEO;
  function add(geo, color, sx, sy, sz, x, y, z, par, o) { const m = new T.Mesh(geo, typeof color === 'string' ? L.mat(color, o) : color); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = !(o && o.noShadow); m.receiveShadow = true; (par || g).add(m); return m; }
  const solid = (x, z, hx, hz, h, y0) => { const b = L.addBox(x - hx, z - hz, x + hx, z + hz, h, 'building'); if (y0) b.y0 = y0; return b; };
  const prismGeo = new T.CylinderGeometry(1, 1, 1, 3).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).translate(0, 0.5, 0);
  function roof(x, y, z, len, w, h, col, ry, par) { const m = add(prismGeo, col, len, h / 1.5, w / 2 / 0.866, x, y, z, par); m.rotation.y = ry || 0; return m; }
  function cvTex(w, h, fn, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); } return t; }
  function label(text, col, sc) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
    x.font = 'bold 60px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = 'rgba(40,10,40,.85)'; x.strokeText(text, 256, 64); x.fillStyle = col || '#fff'; x.fillText(text, 256, 64);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false, fog: false })); sp.scale.set(4 * (sc || 1), 1 * (sc || 1), 1); return sp;
  }
  function tower(x, z, r, h, wall, roofC, y0, par, noSolid) {
    y0 = y0 || 0;
    add(G().cylB, wall, r, h, r, x, y0, z, par);
    add(G().cylB, wall, r * 1.15, 1.2, r * 1.15, x, y0 + h, z, par);
    add(G().cone, roofC, r * 1.3, r * 2.4, r * 1.3, x, y0 + h + 1.2 + r * 1.2, z, par);
    add(G().cone, '#f0c840', 0.25, 2.4, 0.25, x, y0 + h + 1.2 + r * 2.4 + 1, z, par, { metal: 0.8, rough: 0.3 });
    const fl = add(G().box, roofC, 0.05, 0.9, 1.6, x, y0 + h + 1.2 + r * 2.4 + 2.2, z + 0.8, par, { noShadow: true }); fl.userData.flag = true;
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.4; add(G().box, '#3a4a9a', 0.9, 1.6, 0.3, x + Math.sin(a) * r * 1.0, y0 + h * 0.72, z + Math.cos(a) * r * 1.0, par, { emissive: '#6a7aff', ei: 0.4 }).rotation.y = a; }
    if (!noSolid) solid(x, z, r * 0.85, r * 0.85, y0 + h + 1, y0 ? y0 : 0);
  }
  // Schloss: Mauerring mit Ecktürmen und Tor nach Süden (+z), in der Mitte der Palast mit hohen Türmen
  function castle(cx, cz, w, d, o) {
    const wall = o.wall, h = o.h || 14, th = 3.5;
    const seg = (x1, z1, x2, z2) => { const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, len = Math.hypot(x2 - x1, z2 - z1), ry = Math.atan2(x2 - x1, z2 - z1); const m = add(G().boxB, wall, th, h, len, mx, 0, mz); m.rotation.y = ry; for (let k = 0; k < len / 3; k++) { const t = (k + 0.5) / Math.ceil(len / 3); if (k % 2) continue; add(G().box, wall, th + 0.4, 1.6, 1.6, x1 + (x2 - x1) * t, h + 0.8, z1 + (z2 - z1) * t).rotation.y = ry; } solid(mx, mz, Math.abs(x2 - x1) / 2 + th / 2, Math.abs(z2 - z1) / 2 + th / 2, h); };
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, gw = o.gate || 16;
    seg(x0, z0, x1, z0); seg(x0, z0, x0, z1); seg(x1, z0, x1, z1); seg(x0, z1, cx - gw / 2, z1); seg(cx + gw / 2, z1, x1, z1);
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) tower(x, z, 7, h + 12, wall, o.roof1);
    for (const sd of [-1, 1]) tower(cx + sd * (gw / 2 + 5), z1, 5, h + 6, wall, o.roof2);
    add(G().box, '#f0c840', gw + 2, 1.4, th + 1, cx, h + 1, z1, null, { metal: 0.7, rough: 0.35 });
    // Palast
    const pw = w * 0.45, pd = d * 0.32, pz = cz - d * 0.18, ph = o.ph || 28;
    add(G().boxB, wall, pw, ph, pd, cx, 0, pz); solid(cx, pz, pw / 2, pd / 2, ph);
    roof(cx, ph, pz, pw, pd, 12, o.roof1);
    for (let k = 0; k < 7; k++) add(G().box, '#4a5ab0', 2, 4, 0.3, cx - pw / 2 + (k + 0.5) * pw / 7, ph * 0.55, pz + pd / 2 + 0.1, null, { emissive: '#8a9aff', ei: 0.5 });
    add(G().box, '#5a3a2a', 6, 9, 0.4, cx, 4.5, pz + pd / 2 + 0.15);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tower(cx + sx * pw / 2, pz + sz * pd / 2, 5, ph + 16, wall, sz > 0 ? o.roof2 : o.roof1);
    tower(cx, pz - pd * 0.1, 8, ph + 38, wall, o.roof2);
    for (const sd of [-1, 1]) tower(cx + sd * pw * 0.28, pz - pd * 0.3, 4.5, ph + 24, wall, o.roof1);
  }
  function cottage(x, z, ry, wall, roofC, sz) {
    const c = new T.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); sz = sz || 1;
    const w = 9 * sz, d = 7 * sz, h = 5 * sz;
    add(G().boxB, wall, w, h, d, 0, 0, 0, c);
    for (const sx of [-1, 1]) add(G().box, '#5a3a22', 0.35, h, 0.35, sx * w / 2, h / 2, d / 2 + 0.05, c);
    add(G().box, '#5a3a22', w, 0.35, 0.3, 0, h * 0.55, d / 2 + 0.05, c);
    add(G().box, '#6a4428', 1.6, 2.8, 0.2, 0, 1.4, d / 2 + 0.1, c);
    for (const sx of [-1, 1]) add(G().box, '#ffe9a0', 1.3, 1.2, 0.2, sx * w * 0.3, h * 0.6, d / 2 + 0.1, c, { emissive: '#ffcf60', ei: 0.4 });
    roof(0, h, 0, w + 1, d + 1.4, 4.5 * sz, roofC, Math.PI / 2 * 0, c).rotation.y = 0;
    add(G().boxB, '#8a5a4a', 1, 3, 1, w * 0.3, h + 1, -d * 0.15, c);
    const cs = Math.cos(ry), sn = Math.sin(ry), hx = Math.abs(cs) * w / 2 + Math.abs(sn) * d / 2, hz = Math.abs(sn) * w / 2 + Math.abs(cs) * d / 2;
    solid(x, z, hx, hz, h + 3);
    return c;
  }

  // ---------- Figuren ----------
  function buildDragon(sc, col, belly, wingC) {
    const r = new T.Group(), body = new T.Group(); r.add(body);
    const M = L.mat(col), Mb = L.mat(belly), Mw = new T.MeshLambertMaterial({ color: wingC, side: T.DoubleSide, transparent: true, opacity: 0.92 });
    const s3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx * sc, sy * sc, sz * sc); o.position.set(x * sc, y * sc, z * sc); o.castShadow = true; (par || body).add(o); return o; };
    s3(G().sph, M, 1.5, 1.25, 3.0, 0, 0, 0); s3(G().sph, Mb, 1.25, 1.0, 2.6, 0, -0.35, 0.1);
    for (let k = 0; k < 7; k++) s3(G().cone, Mb, 0.22, 0.6, 0.22, 0, 1.15 - k * 0.02, 2.0 - k * 0.65);
    const front = new T.Group(); front.position.set(0, 0.4 * sc, 2.4 * sc); body.add(front);
    for (let k = 0; k < 5; k++) s3(G().sph, k % 2 ? M : M, 0.7 - k * 0.06, 0.7 - k * 0.06, 0.8, 0, 0.35 + k * 0.55, 0.4 + k * 0.6, front);
    const head = new T.Group(); head.position.set(0, 3.2 * sc, 3.6 * sc); front.add(head);
    s3(G().box, M, 1.1, 0.85, 1.4, 0, 0, 0, head); s3(G().box, M, 0.85, 0.55, 1.2, 0, -0.12, 1.1, head); s3(G().box, Mb, 0.75, 0.2, 1.1, 0, -0.42, 0.95, head);
    for (const sd of [-1, 1]) {
      s3(G().sph, L.mat('#ffe040', { emissive: '#ffb000', ei: 0.9 }), 0.16, 0.13, 0.1, sd * 0.45, 0.18, 0.55, head);
      const hn = s3(G().cone, L.mat('#f4ecd8'), 0.14, 0.9, 0.14, sd * 0.35, 0.55, -0.45, head); hn.rotation.x = -0.9; hn.rotation.z = -sd * 0.25;
      s3(G().sph, L.mat('#2a1a1a'), 0.07, 0.06, 0.05, sd * 0.22, 0.02, 1.72, head);
    }
    const tail = []; let par = body, z0 = -2.6;
    for (let k = 0; k < 8; k++) { const t = new T.Group(); t.position.set(0, k ? 0 : -0.1 * sc, (k ? -0.85 : z0) * sc); par.add(t); s3(G().sph, M, 0.62 - k * 0.07, 0.55 - k * 0.06, 0.6, 0, 0, -0.4, t); s3(G().cone, Mb, 0.14, 0.4, 0.14, 0, 0.5 - k * 0.05, -0.4, t); tail.push(t); par = t; }
    const sp = s3(G().cone, M, 0.5, 0.9, 0.12, 0, 0, -1.1, par); sp.rotation.x = -Math.PI / 2;
    const legs = [];
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new T.Group(); lg.position.set(sx * 1.0 * sc, -0.6 * sc, sz * 1.5 * sc); body.add(lg); s3(G().cyl, M, 0.32, 1.4, 0.32, 0, -0.6, 0, lg); s3(G().box, Mb, 0.5, 0.25, 0.7, 0, -1.3, 0.15, lg); legs.push(lg); }
    const sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(3.5, 1.6); sh.lineTo(7.5, 1.0); sh.lineTo(9.5, -0.8); sh.lineTo(7.2, -1.2); sh.lineTo(6.2, -2.6); sh.lineTo(4.6, -2.0); sh.lineTo(3.2, -3.2); sh.lineTo(1.8, -2.4); sh.lineTo(0, -2.2); sh.lineTo(0, 0);
    const wg = new T.ShapeGeometry(sh).rotateX(-Math.PI / 2);
    const wings = [];
    for (const sd of [-1, 1]) {
      const pv = new T.Group(); pv.position.set(sd * 1.0 * sc, 0.9 * sc, 1.2 * sc); body.add(pv);
      const m = new T.Mesh(wg, Mw); m.scale.set(sd * sc, sc, sc); m.castShadow = true; pv.add(m);
      const bone = s3(G().cyl, M, 0.12, 9.5, 0.12, sd * 4.7, 0.05, -0.2, pv); bone.rotation.z = Math.PI / 2; bone.rotation.y = sd * 0.1;
      wings.push({ pv, sd });
    }
    r.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    return { root: r, body, front, head, tail, legs, wings };
  }
  function flap(D, t, amp, fold) {
    for (const w of D.wings) { w.pv.rotation.z = w.sd * (fold !== undefined ? fold : Math.sin(t) * amp); w.pv.rotation.y = fold !== undefined ? w.sd * 0.9 : 0; }
    D.tail.forEach((q, k) => { q.rotation.y = Math.sin(t * 0.5 - k * 0.6) * 0.12; });
  }
  function buildUnicorn(body, wingsOn) {
    const r = new T.Group(), b = new T.Group(); r.add(b);
    const wh = L.mat(body || '#fbf8ff'), gold = L.mat('#f2c84a', { emissive: '#a07010', ei: 0.4 }), RAIN = ['#ff5a8a', '#ffa04a', '#ffe04a', '#6ae06a', '#5ab8ff', '#a070ff'];
    add(G().box, wh, 0.9, 0.9, 2.0, 0, 1.55, 0, b);
    const neck = add(G().box, wh, 0.55, 1.3, 0.6, 0, 2.3, 0.95, b); neck.rotation.x = 0.5;
    const head = new T.Group(); head.position.set(0, 2.95, 1.35); b.add(head);
    add(G().box, wh, 0.5, 0.55, 0.95, 0, 0, 0.2, head); add(G().box, L.mat('#ffd8e8'), 0.42, 0.3, 0.3, 0, -0.12, 0.62, head);
    const horn = add(G().cone, gold, 0.1, 0.85, 0.1, 0, 0.55, 0.35, head); horn.rotation.x = 0.35;
    for (const sd of [-1, 1]) { add(G().box, L.mat('#2a2050'), 0.05, 0.1, 0.1, sd * 0.26, 0.08, 0.38, head); add(G().cone, wh, 0.1, 0.28, 0.08, sd * 0.15, 0.36, -0.12, head); }
    for (let k = 0; k < 6; k++) add(G().box, RAIN[k], 0.2, 0.4, 0.22, 0, 2.95 - k * 0.22, 0.95 - k * 0.16, b);
    for (let k = 0; k < 6; k++) { const t = add(G().box, RAIN[k], 0.18, 0.9, 0.14, (k - 2.5) * 0.06, 1.2, -1.15 - k * 0.02, b); t.rotation.x = -0.35; }
    const legs = [];
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new T.Group(); lg.position.set(sx * 0.3, 1.2, sz * 0.75); b.add(lg); add(G().box, wh, 0.22, 1.1, 0.22, 0, -0.55, 0, lg); add(G().box, gold, 0.26, 0.15, 0.26, 0, -1.12, 0, lg); legs.push(lg); }
    let wings = null;
    if (wingsOn) {
      const fm = new T.MeshLambertMaterial({ color: 0xffffff, side: T.DoubleSide }), fm2 = new T.MeshLambertMaterial({ color: 0xffe8f4, side: T.DoubleSide });
      wings = [];
      for (const sd of [-1, 1]) {
        const pv = new T.Group(); pv.position.set(sd * 0.45, 1.95, 0.35); b.add(pv);
        for (let k = 0; k < 6; k++) { const fe = new T.Mesh(G().box, k % 2 ? fm2 : fm); fe.scale.set(1.9 - k * 0.22, 0.04, 0.36); fe.position.set(sd * (0.95 - k * 0.11), 0, -k * 0.24); pv.add(fe); }
        wings.push({ pv, sd });
      }
    }
    r.scale.setScalar(1.15);
    return { root: r, legs, head, wings };
  }
  function npc(app, x, z, ry, sc) {
    const rig = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, app), true);
    rig.root.position.set(x, 0, z); rig.root.rotation.y = ry || 0; if (sc) rig.root.scale.setScalar(sc); g.add(rig.root); return rig;
  }
  // BEYZA (BEYY): riesige, wunderschöne, friedliche Riesin mit langen dunkelbraunen Locken
  const BEY_S = 22;
  L.buildBeyzaRig = function () {
    const rig = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { name: 'BEYZA', koerper: 'frau', lippen: 'rosa', skin: '#eec7a4', hair: 'lang', hairColor: '#3a2214', eyes: '#5a3418', brows: 'gebogen', mouth: 'laecheln', nose: 'klein', beard: 'kein', glasses: 'keine', hat: 'keine', top: 'pullover', topColor: '#e8a0c8', pants: 'rock', pantsColor: '#e8a0c8', shoeType: 'lackschuh', shoes: '#f0c8e0', build: 'schmal', height: 'mittel' }), true);
    const gown = L.mat('#eaa6cc'), gown2 = L.mat('#f6d0e6'), gold = new T.MeshStandardMaterial({ color: 0xf0c850, metalness: 0.85, roughness: 0.3, emissive: 0x3a2800 });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
    // langes Ballkleid (über den Beinen)
    P3(new T.CylinderGeometry(0.17, 0.5, 0.98, 20, 1, true), new T.MeshLambertMaterial({ color: 0xeaa6cc, side: T.DoubleSide }), 1, 1, 1, 0, -0.5, 0, rig.hips);
    P3(new T.CylinderGeometry(0.5, 0.52, 0.04, 20), gold, 1, 1, 1, 0, -0.99, 0, rig.hips);
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; const f = P3(G().box, gown2, 0.05, 0.85, 0.02, Math.sin(a) * 0.36, -0.52, Math.cos(a) * 0.36, rig.hips); f.rotation.y = a; f.rotation.x = -Math.cos(a) * 0.3; f.rotation.z = Math.sin(a) * 0.3; }
    P3(G().box, gold, 0.34, 0.05, 0.22, 0, 0.02, 0, rig.torso);
    P3(G().box, gown, 0.36, 0.3, 0.23, 0, 0.18, 0, rig.torso);
    // Locken: viele kleine Kugeln, die in Spiralen bis zur Hüfte fallen
    const hc = ['#3a2214', '#2c180e', '#4a2c1a', '#56341e'];
    for (let st = 0; st < 17; st++) {
      const a = -2.0 + st * 0.25, side = Math.abs(a) > 1.45, n = side ? 9 : 15;
      for (let k = 0; k < n; k++) {
        const y = (side ? 0.2 : 0.3) - k * 0.062, rr = 0.15 + Math.min(k, 5) * 0.008 + Math.sin(k * 1.4 + st) * 0.022, aw = a + Math.cos(k * 1.4 + st) * 0.08;
        const rad = 0.034 + (k % 3) * 0.006;
        P3(G().sph, L.mat(hc[(st + k) % 4]), rad, rad, rad, Math.sin(aw) * rr, y, -Math.cos(aw) * rr * (side ? 0.8 : 1) - (side ? 0 : 0.01), rig.head);
      }
    }
    for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; P3(G().sph, L.mat(hc[k % 4]), 0.05, 0.04, 0.05, Math.sin(a) * 0.12, 0.31, Math.cos(a) * 0.12 - 0.02, rig.head); }
    // Blumenkranz mit Diadem, Ohrringe, Halskette
    const FL = ['#ffffff', '#ffb8d8', '#ffe070', '#c8a0ff'];
    for (let k = 0; k < 12; k++) { const a = -1.7 + k * 0.31; P3(G().sph, L.mat(FL[k % 4], { emissive: FL[k % 4], ei: 0.25 }), 0.025, 0.025, 0.025, Math.sin(a) * 0.145, 0.3, Math.cos(a) * 0.145, rig.head); }
    P3(G().cone, gold, 0.03, 0.08, 0.02, 0, 0.35, 0.13, rig.head);
    P3(G().sph, new T.MeshBasicMaterial({ color: 0xff70c0 }), 0.015, 0.015, 0.015, 0, 0.35, 0.145, rig.head);
    for (const sd of [-1, 1]) P3(G().sph, gold, 0.012, 0.02, 0.012, sd * 0.135, 0.09, 0.0, rig.head);
    P3(new T.TorusGeometry(0.075, 0.006, 6, 20), gold, 1, 1, 1, 0, 0.6, 0.04, rig.torso).rotation.x = 1.25;
    // Wimpern und Rouge
    for (const sd of [-1, 1]) { P3(G().box, L.mat('#1a0e08'), 0.07, 0.01, 0.012, sd * 0.058, 0.205, 0.139, rig.head); P3(G().box, L.mat('#f0a0a0'), 0.04, 0.02, 0.005, sd * 0.085, 0.12, 0.132, rig.head); }
    return rig;
  };
  function buildBeyza() {
    const rig = L.buildBeyzaRig();
    rig.root.scale.setScalar(BEY_S);
    rig.root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    const tag = label('💖 BEYZA', '#ffd0ec', 3.2); tag.position.set(0, 2.25, 0); tag.scale.multiplyScalar(1 / BEY_S * 3.2); rig.root.add(tag);
    return rig;
  }

  // Der Prinz: minimal größer als BEYZA, mittelbraune Locken mit blonden Strähnen, königsblaue Uniform mit Gold
  const PR_S = BEY_S * 1.05;
  function buildPrince() {
    const rig = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { name: 'Prinz', skin: '#e6b892', hair: 'kurzlocken', hairColor: '#6e4426', eyes: '#3a6a3a', brows: 'normal', mouth: 'laecheln', nose: 'normal', beard: 'stoppel', glasses: 'keine', hat: 'keine', top: 'anzug', topColor: '#1e3a8a', pants: 'anzughose', pantsColor: '#f4f0e8', shoeType: 'stiefel', shoes: '#2a1a10', build: 'kraeftig', height: 'mittel' }), true);
    const gold = new T.MeshStandardMaterial({ color: 0xf0c850, metalness: 0.85, roughness: 0.3, emissive: 0x3a2800 });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, typeof m === 'string' ? L.mat(m) : m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
    // Locken: mittelbraun, jede dritte Strähne blond
    const BR = ['#6e4426', '#7a4c2a', '#5e3a20'], BL = ['#d8b060', '#e8c878'];
    for (let st = 0; st < 19; st++) {
      const a = -2.25 + st * 0.25, side = Math.abs(a) > 1.5, n = side ? 3 : 5, blond = st % 3 === 1;
      for (let k = 0; k < n; k++) {
        const y = 0.31 - k * 0.055, rr = 0.145 + Math.sin(k * 1.5 + st) * 0.015, aw = a + Math.cos(k * 1.5 + st) * 0.07, rad = 0.036 + (k % 2) * 0.006;
        P3(G().sph, blond ? BL[k % 2] : BR[(st + k) % 3], rad, rad, rad, Math.sin(aw) * rr, y, -Math.cos(aw) * rr * (side ? 0.85 : 1), rig.head);
      }
    }
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, r = k % 2 ? 0.07 : 0.12; P3(G().sph, k % 4 === 1 ? BL[0] : BR[k % 3], 0.045, 0.04, 0.045, Math.sin(a) * r, 0.33, Math.cos(a) * r - 0.01, rig.head); }
    for (let k = 0; k < 5; k++) P3(G().sph, k === 2 ? BL[1] : BR[k % 3], 0.035, 0.03, 0.03, -0.09 + k * 0.045, 0.3, 0.12, rig.head);
    // schmales goldenes Diadem
    P3(new T.TorusGeometry(0.135, 0.008, 6, 24), gold, 1, 1, 1, 0, 0.29, -0.005, rig.head).rotation.x = Math.PI / 2;
    P3(G().cone, gold, 0.018, 0.04, 0.012, 0, 0.32, 0.13, rig.head); P3(G().sph, new T.MeshBasicMaterial({ color: 0x40a0ff }), 0.012, 0.012, 0.012, 0, 0.31, 0.142, rig.head);
    // Uniform: goldene Schulterstücke, Knöpfe, rote Schärpe, Gürtel, Umhang
    for (const sd of [-1, 1]) { P3(G().box, gold, 0.1, 0.03, 0.12, sd * 0.2, 0.6, 0, rig.torso); for (let k = 0; k < 4; k++) P3(G().sph, gold, 0.012, 0.012, 0.012, sd * 0.012 + 0.03 * sd, 0.5 - k * 0.09, 0.115, rig.torso); }
    const sash = P3(G().box, '#c02a3a', 0.07, 0.62, 0.02, 0, 0.32, 0.12, rig.torso); sash.rotation.z = 0.6;
    P3(G().box, '#2a1a10', 0.44, 0.05, 0.25, 0, 0.0, 0, rig.torso); P3(G().box, gold, 0.06, 0.05, 0.02, 0, 0.0, 0.13, rig.torso);
    const cape = P3(G().box, '#8a1a2a', 0.5, 0.95, 0.02, 0, 0.1, -0.15, rig.torso); cape.rotation.x = 0.12;
    P3(G().box, gold, 0.5, 0.03, 0.025, 0, 0.58, -0.14, rig.torso);
    rig.cape = cape;
    rig.root.scale.setScalar(PR_S);
    rig.root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    const tag = label('🤴 PRINZ', '#cfe0ff', 3.2); tag.position.set(0, 2.3, 0); tag.scale.multiplyScalar(1 / PR_S * 3.2); rig.root.add(tag);
    return rig;
  }

  // ---------- Die Welt bauen ----------
  function build() {
    g = new T.Group(); L.scene.add(g);
    const W0 = { g };
    // Himmel
    const skyT = cvTex(4, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6aa8ff'); gr.addColorStop(0.35, '#a8c8ff'); gr.addColorStop(0.5, '#ffd8ec'); gr.addColorStop(0.56, '#ffe8c8'); gr.addColorStop(1, '#f8d0e8'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    W0.sky = new T.Mesh(new T.SphereGeometry(6000, 32, 16), new T.MeshBasicMaterial({ map: skyT, side: T.BackSide, fog: false, depthWrite: false })); W0.sky.renderOrder = -10; W0.sky.frustumCulled = false; L.scene.add(W0.sky); W0.sky.visible = false;
    const sun = new T.Sprite(new T.SpriteMaterial({ map: cvTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.25, 'rgba(255,240,200,.9)'); gr.addColorStop(1, 'rgba(255,200,220,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }), fog: false, depthWrite: false, transparent: true })); sun.scale.set(900, 900, 1); W0.sky.add(sun); sun.position.set(2600, 1900, -3800); W0.sun = sun;
    const moonT = cvTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,250,1)'); gr.addColorStop(0.42, 'rgba(240,240,255,1)'); gr.addColorStop(0.5, 'rgba(200,210,255,.45)'); gr.addColorStop(1, 'rgba(160,170,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); c.fillStyle = 'rgba(180,185,210,.5)'; for (const [x, y, r] of [[52, 50, 9], [74, 66, 6], [60, 78, 7], [80, 46, 4]]) { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); } });
    const moon = new T.Sprite(new T.SpriteMaterial({ map: moonT, fog: false, depthWrite: false, transparent: true, opacity: 0 })); moon.scale.set(700, 700, 1); moon.position.set(-2400, 2100, -3600); W0.sky.add(moon); W0.moon = moon;
    W0.cloudM = [];
    const cloudT = cvTex(128, 64, (c) => { for (let k = 0; k < 9; k++) { const x = 20 + Math.random() * 88, y = 28 + Math.random() * 16, r = 14 + Math.random() * 16; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,240,250,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 64); } });
    W0.clouds = [];
    for (let k = 0; k < 46; k++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, fog: false, opacity: 0.9 })); const a = R() * 6.283, d = 600 + R() * 2600, sc = 160 + R() * 260; sp.scale.set(sc * 2, sc, 1); sp.position.set(FX + Math.sin(a) * d, 260 + R() * 500, FZ + Math.cos(a) * d); g.add(sp); W0.clouds.push(sp); W0.cloudM.push(sp.material); }
    // unter der Welt: Wolkenmeer
    for (let k = 0; k < 40; k++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, fog: false, opacity: 0.85 })); const a = R() * 6.283, d = R() * 3200, sc = 400 + R() * 400; sp.scale.set(sc * 2, sc, 1); sp.position.set(FX + Math.sin(a) * d, -260 - R() * 200, FZ + Math.cos(a) * d); g.add(sp); W0.cloudM.push(sp.material); }
    // Boden: Wiese mit Blumen, Felsrand, Wurzeln unten
    const gt = cvTex(256, 256, (c, w, h) => { c.fillStyle = '#5cb848'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(60,150,50,.35)' : 'rgba(170,230,110,.35)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 3); } for (let i = 0; i < 90; i++) { c.fillStyle = ['#ffffff', '#ffe060', '#ff90c0', '#c0a0ff'][i % 4]; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, 160);
    const ground = new T.Mesh(new T.CylinderGeometry(FR, FR * 0.93, 40, 96), [new T.MeshLambertMaterial({ color: 0x8a6a4a }), new T.MeshLambertMaterial({ map: gt }), new T.MeshLambertMaterial({ color: 0x6a4a3a })]);
    ground.position.set(FX, -20.02, FZ); ground.receiveShadow = true; g.add(ground);
    const under = new T.Mesh(new T.ConeGeometry(FR * 0.93, 1100, 48), L.mat('#7a5a44')); under.rotation.x = Math.PI; under.position.set(FX, -590, FZ); g.add(under);
    for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283, rt = add(G().cone, '#5a7a3a', 14, 160 + R() * 140, 14, FX + Math.sin(a) * FR * 0.85, -200, FZ + Math.cos(a) * FR * 0.85); rt.rotation.x = Math.PI; }
    // Wasserfälle am Rand
    const wft = cvTex(32, 128, (c, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = Math.random(); c.fillStyle = v < 0.3 ? '#ffffff' : v < 0.7 ? '#bfe8ff' : '#8ad0ff'; c.fillRect(x, y, 1, 1); } }); wft.wrapS = wft.wrapT = T.RepeatWrapping; wft.repeat.set(2, 6);
    W0.wft = wft;
    const wfm = new T.MeshBasicMaterial({ map: wft, transparent: true, opacity: 0.85, side: T.DoubleSide, fog: false });
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + 0.2, m = new T.Mesh(new T.PlaneGeometry(30, 500), wfm); m.position.set(FX + Math.sin(a) * (FR + 2), -250, FZ + Math.cos(a) * (FR + 2)); m.rotation.y = a; g.add(m); }
    // Wege
    const pathM = L.mat('#e6d2a0');
    const path = (a, b, wd) => { const len = Math.hypot(b.x - a.x, b.z - a.z), m = new T.Mesh(new T.PlaneGeometry(wd || 7, len), pathM); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(b.x - a.x, b.z - a.z) + Math.PI; m.position.set((a.x + b.x) / 2, 0.03, (a.z + b.z) / 2); m.receiveShadow = true; g.add(m); paths.push([a, b]); };
    const paths = [];
    for (const k of ['dorf', 'schloss', 'eis', 'hoehle', 'lebkuchen', 'oma', 'rapunzel', 'bohne', 'see', 'mine']) path(LOC.platz, LOC[k], k === 'dorf' || k === 'schloss' ? 10 : 6);
    path(LOC.dorf, LOC.muehle, 5);
    const segD = (x, z, a, b) => { const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz, t = L.clamp(((x - a.x) * dx + (z - a.z) * dz) / l2, 0, 1); return Math.hypot(x - a.x - dx * t, z - a.z - dz * t); };
    // Keine Bäume auf Orten und Wegen
    const keep = [[LOC.dorf, 150], [LOC.schloss, 170], [LOC.eis, 200], [CAVE, 230], [LOC.lebkuchen, 40], [LOC.oma, 45], [TOWER, 35], [STALK, 30], [LAKE, LAKE.r + 25], [LOC.mine, 130], [LOC.muehle, 30], [LOC.platz, 60], [LOC.fee, 25], [W(0, -720), 130]];
    const free = (x, z, m) => { if (Math.hypot(x - FX, z - FZ) > FR - 30) return false; for (const [p, r] of keep) if (Math.hypot(x - p.x, z - p.z) < r + (m || 0)) return false; for (const [a, b] of paths) if (segD(x, z, a, b) < 9) return false; return true; };
    W0.free = free;
    // ---- Bäume (instanziert) ----
    const NT = 1500, trunkI = new T.InstancedMesh(G().cylB, L.mat('#7a5232'), NT), crownI = new T.InstancedMesh(G().sph, new T.MeshLambertMaterial({ color: 0xffffff }), NT * 2), pineI = new T.InstancedMesh(G().cone, new T.MeshLambertMaterial({ color: 0xffffff }), NT);
    const dm = new T.Object3D(), col = new T.Color(); let nT = 0, nC = 0, nP = 0;
    const putTree = (x, z, kind) => {
      const h = RR(5, 9), sc = RR(0.8, 1.4);
      dm.position.set(x, 0, z); dm.rotation.set(0, 0, 0); dm.scale.set(0.45 * sc, h * sc, 0.45 * sc); dm.updateMatrix(); trunkI.setMatrixAt(nT++, dm.matrix);
      if (kind === 'pine') { for (let k = 0; k < 2 && nP < NT; k++) { dm.position.set(x, (h * 0.7 + 3 + k * 3) * sc, z); dm.scale.set((3.6 - k * 1.2) * sc, 6 * sc, (3.6 - k * 1.2) * sc); dm.updateMatrix(); pineI.setMatrixAt(nP, dm.matrix); pineI.setColorAt(nP++, col.set(k ? '#3a8a4a' : '#2f7a40')); } }
      else {
        const cc = kind === 'blossom' ? ['#ffc0dc', '#ffd8ea', '#ffb0d0'] : kind === 'magic' ? ['#70c8ff', '#a0a0ff', '#80e8e0'] : ['#5ab84a', '#6ac850', '#4aa040', '#7ad060'];
        for (let k = 0; k < 2; k++) { dm.position.set(x + (k ? RR(-1.2, 1.2) : 0), (h + 1.5 + k * 1.6) * sc, z + (k ? RR(-1.2, 1.2) : 0)); const r = (3.4 - k * 0.9) * sc; dm.scale.set(r, r * 0.85, r); dm.updateMatrix(); crownI.setMatrixAt(nC, dm.matrix); crownI.setColorAt(nC++, col.set(cc[(R() * cc.length) | 0])); }
      }
      L.addBox(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 6, 'tree');
    };
    for (let i = 0; i < 6000 && nT < NT; i++) {
      const a = R() * 6.283, d = Math.sqrt(R()) * (FR - 40), x = FX + Math.sin(a) * d, z = FZ + Math.cos(a) * d, dx = x - FX, dz = z - FZ;
      const forest = dx < -280 && dz > -450 && dz < 850, pines = dx < -700 && dz < -350, orchard = Math.hypot(dx, dz + 720) < 120;
      if (!forest && !pines && R() < 0.82) continue;
      if (!free(x, z, 2)) continue;
      putTree(x, z, pines ? 'pine' : forest ? (R() < 0.3 ? 'magic' : 'oak') : Math.hypot(dx, dz - 1100) < 500 || orchard ? 'blossom' : R() < 0.4 ? 'blossom' : 'oak');
    }
    // Obstgarten vor dem Schloss (goldene Äpfel)
    const appleI = new T.InstancedMesh(G().sph, L.mat('#ffd040', { emissive: '#c08000', ei: 0.5 }), 200); let nA = 0;
    for (let k = 0; k < 24; k++) {
      const x = FX + (k % 2 ? -1 : 1) * RR(25, 110), z = FZ - 720 + RR(-90, 90); if (nT >= NT) break;
      putTree(x, z, 'oak');
      for (let q = 0; q < 6; q++) { dm.position.set(x + RR(-3, 3), RR(6.5, 10), z + RR(-3, 3)); dm.scale.setScalar(0.35); dm.updateMatrix(); appleI.setMatrixAt(nA++, dm.matrix); }
    }
    for (const [m, n] of [[trunkI, nT], [crownI, nC], [pineI, nP], [appleI, nA]]) { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; m.receiveShadow = true; g.add(m); }
    // Blumen und leuchtende Pilze
    const NF = 6000, flI = new T.InstancedMesh(G().sph, new T.MeshLambertMaterial({ color: 0xffffff }), NF); let nF = 0;
    const FC = ['#ffffff', '#ffe060', '#ff80b0', '#b080ff', '#ff6060', '#80c0ff', '#ffb050'];
    for (let i = 0; i < 14000 && nF < NF; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * (FR - 30), x = FX + Math.sin(a) * d, z = FZ + Math.cos(a) * d; if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 3) continue; dm.position.set(x, 0.22, z); dm.scale.set(0.28, 0.16, 0.28); dm.updateMatrix(); flI.setMatrixAt(nF, dm.matrix); flI.setColorAt(nF++, col.set(FC[(R() * FC.length) | 0])); }
    flI.count = nF; flI.instanceMatrix.needsUpdate = true; flI.instanceColor.needsUpdate = true; g.add(flI);
    const NM = 500, muI = new T.InstancedMesh(G().sph, new T.MeshBasicMaterial({ color: 0xffffff }), NM), stI = new T.InstancedMesh(G().cylB, L.mat('#f4ecd8'), NM); let nM = 0;
    for (let i = 0; i < 4000 && nM < NM; i++) { const x = FX + RR(-1450, -300), z = FZ + RR(-400, 850); if (!free(x, z)) continue; const h = RR(0.3, 1.4); dm.position.set(x, 0, z); dm.scale.set(0.12 * h, h, 0.12 * h); dm.updateMatrix(); stI.setMatrixAt(nM, dm.matrix); dm.position.set(x, h, z); dm.scale.set(0.5 * h, 0.3 * h, 0.5 * h); dm.updateMatrix(); muI.setMatrixAt(nM, dm.matrix); muI.setColorAt(nM++, col.set(['#60e8ff', '#ff70d0', '#a0ff80', '#ffd060'][(R() * 4) | 0])); }
    for (const m of [muI, stI]) { m.count = nM; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; g.add(m); }
    // ---- Wunschplatz in der Mitte ----
    { const c = LOC.platz; add(G().cylB, '#e8e0f0', 40, 0.2, 40, c.x, 0, c.z); add(G().cylB, '#d0c8e0', 9, 1.2, 9, c.x, 0, c.z); add(G().cylB, '#7ad0ff', 8, 0.1, 8, c.x, 1.15, c.z, null, { emissive: '#3aa0ff', ei: 0.4 }); add(G().cylB, '#e8e0f0', 1.2, 5, 1.2, c.x, 0, c.z); add(G().sph, '#ffe0f0', 2, 2, 2, c.x, 6.5, c.z, null, { emissive: '#ff80c0', ei: 0.6 }); solid(c.x, c.z, 8, 8, 1.2); W0.wish = add(G().sph, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false }), 3.2, 3.2, 3.2, c.x, 6.5, c.z); }
    // ---- Märchendorf ----
    { const D = LOC.dorf; const WL = ['#fff4e0', '#ffe8d0', '#f8f0ff', '#fff0f0'], RF = ['#c85040', '#d8705a', '#a84a6a', '#6a7ab8'];
      for (let k = 0; k < 11; k++) { const a = k / 11 * 6.283 + 0.25, d = 62 + (k % 3) * 18, x = D.x + Math.sin(a) * d, z = D.z + Math.cos(a) * d; if (Math.abs(x - LOC.muehle.x) < 30) continue; cottage(x, z, a + Math.PI, WL[k % 4], RF[k % 4], 0.9 + (k % 3) * 0.15); }
      add(G().cylB, '#e8dcc8', 46, 0.15, 46, D.x, 0, D.z);
      // Marktstände
      for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.78, x = D.x + Math.sin(a) * 30, z = D.z + Math.cos(a) * 30; add(G().boxB, '#a07040', 4, 1.1, 2.2, x, 0, z); for (const sx of [-1, 1]) add(G().cylB, '#7a5232', 0.12, 3, 0.12, x + sx * 1.9, 0, z); const aw = add(G().box, ['#ff7aa0', '#ffd060', '#7ac8ff', '#a0e070'][k], 4.6, 0.2, 2.8, x, 3.1, z); aw.rotation.z = 0.08; for (let q = 0; q < 5; q++) add(G().sph, ['#ff4040', '#ffd040', '#60d060', '#ff9030'][q % 4], 0.22, 0.22, 0.22, x - 1.6 + q * 0.8, 1.3, z); solid(x, z, 2.2, 1.3, 1.2); }
      // Quest-Tafel
      const B = LOC.brett; for (const sx of [-1, 1]) add(G().cylB, '#6a4428', 0.2, 3.4, 0.2, B.x + sx * 1.8, 0, B.z);
      add(G().box, '#8a5a30', 4, 2.4, 0.25, B.x, 2.2, B.z); add(G().box, '#f4ead0', 3.6, 2.0, 0.05, B.x, 2.2, B.z + 0.15); roof(B.x, 3.4, B.z, 4.6, 1.2, 0.8, '#c85040');
      for (let k = 0; k < 6; k++) add(G().box, ['#fff8e0', '#ffe8c0', '#ffd8e8'][k % 3], 0.8, 0.6, 0.03, B.x - 1.2 + (k % 3) * 1.2, 2.6 - Math.floor(k / 3) * 0.8, B.z + 0.19);
      const tl = label('📜 QUEST-TAFEL', '#fff0a0', 1.4); tl.position.set(B.x, 5, B.z); g.add(tl); solid(B.x, B.z, 2, 0.4, 3.4);
      // Brunnen
      const Br = LOC.brunnen; add(G().cylB, '#b0a898', 2.4, 1.2, 2.4, Br.x, 0, Br.z); add(G().cylB, '#3a8ac8', 2.1, 0.05, 2.1, Br.x, 1.1, Br.z); for (const sx of [-1, 1]) add(G().boxB, '#6a4428', 0.25, 3.6, 0.25, Br.x + sx * 2, 0, Br.z); roof(Br.x, 3.6, Br.z, 5, 3, 1.4, '#c85040', Math.PI / 2); add(G().sph, '#5ac040', 0.35, 0.25, 0.35, Br.x + 1.6, 1.35, Br.z + 1.5); add(G().cone, '#f0c840', 0.2, 0.25, 0.2, Br.x + 1.6, 1.65, Br.z + 1.5); solid(Br.x, Br.z, 2.4, 2.4, 1.2);
      // Feenkreis (Heimweg)
      const Rg = LOC.ring; W0.ringGlow = []; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; add(G().cylB, '#f4ecd8', 0.25, 0.8, 0.25, Rg.x + Math.sin(a) * 6, 0, Rg.z + Math.cos(a) * 6); W0.ringGlow.push(add(G().sph, new T.MeshBasicMaterial({ color: k % 2 ? 0xff70d0 : 0x70e0ff }), 0.7, 0.4, 0.7, Rg.x + Math.sin(a) * 6, 0.9, Rg.z + Math.cos(a) * 6)); }
      W0.ringCol = new T.Mesh(new T.CylinderGeometry(6, 6, 30, 32, 1, true), new T.MeshBasicMaterial({ color: 0xffb0f0, transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })); W0.ringCol.position.set(Rg.x, 15, Rg.z); g.add(W0.ringCol);
      const rl = label('🍄 FEENKREIS → ASGARD', '#ffd0f8', 1.4); rl.position.set(Rg.x, 6, Rg.z); g.add(rl);
      // Dorfbewohner
      W0.folk = [
        npc({ name: 'Bäckerin Gretl', skin: '#f1d2b6', hair: 'dutt', hairColor: '#d8b46a', top: 'kittel', topColor: '#f2f2f2', pants: 'rock', pantsColor: '#a83a1c', mouth: 'laecheln' }, D.x + 22, D.z + 20, 2.4),
        npc({ name: 'Ritter Kunibert', skin: '#e3b48f', hair: 'kurz', hat: 'helm', hatColor: '#c8c8d0', top: 'weste', topColor: '#7a7a8a', pants: 'anzughose', pantsColor: '#3a3a4a', shoeType: 'stiefel', beard: 'vollbart', build: 'kraeftig', height: 'gross' }, B.x - 6, B.z + 3, 0.3),
        npc({ name: 'Rotkäppchen', skin: '#f6dcc6', hair: 'zoepfe', hairColor: '#d8b46a', hat: 'muetze', hatColor: '#c02a2a', top: 'mantel', topColor: '#c02a2a', pants: 'rock', pantsColor: '#f2f2f2', height: 'klein', mouth: 'laecheln' }, D.x - 18, D.z - 26, 3.2),
        npc({ name: 'Müller Hans', skin: '#d49e74', hair: 'wuschel', hairColor: '#7a7a7a', hat: 'sonnenhut', hatColor: '#d8b46a', top: 'hemd', topColor: '#f2f2f2', pants: 'latzhose', pantsColor: '#2a6ac0', beard: 'schnurrbart' }, D.x + 40, D.z - 8, -1.2)
      ];
    }
    { const vl = new T.PointLight(0xffc070, 0, 160, 2); vl.position.set(LOC.dorf.x, 14, LOC.dorf.z); g.add(vl); W0.villageL = vl; }
    // Windmühle
    { const M = LOC.muehle; add(G().cylB, '#f0e8d8', 6, 16, 6, M.x, 0, M.z); add(G().cone, '#a84a3a', 7, 7, 7, M.x, 19.5, M.z); solid(M.x, M.z, 5, 5, 17); const hub = new T.Group(); hub.position.set(M.x, 15, M.z + 6.6); g.add(hub); for (let k = 0; k < 4; k++) { const b = add(G().box, '#f8f4ec', 1.6, 12, 0.2, 0, 6.5, 0, null); const p = new T.Group(); p.rotation.z = k * 1.5708; p.add(b); hub.add(p); } add(G().cyl, '#5a3a22', 0.6, 1, 0.6, 0, 0, 0, hub).rotation.x = Math.PI / 2; W0.mill = hub; }
    // Babydrache
    W0.baby = buildDragon(0.55, '#a070e0', '#ffd0f0', '#ff90d0'); W0.baby.root.position.set(LOC.baby.x, 1, LOC.baby.z); g.add(W0.baby.root);
    const bl = label('🐲 FUNKI', '#e8c8ff', 1); bl.position.set(0, 3.6, 0); W0.baby.root.add(bl);
    // ---- Königsschloss ----
    castle(LOC.schloss.x, LOC.schloss.z - 80, 210, 170, { wall: '#f6f0fa', roof1: '#6a86e8', roof2: '#ec8ab8', h: 15, ph: 30, gate: 18 });
    // Kürbiskutsche
    { const x = LOC.schloss.x + 24, z = LOC.schloss.z + 30; add(G().sph, '#ff9a30', 2.6, 2.2, 2.8, x, 3.2, z); for (let k = 0; k < 6; k++) { const r = add(G().sph, '#ffb050', 0.35, 2.25, 2.85, x + Math.sin(k) * 0.1, 3.2, z); r.rotation.y = k / 6 * Math.PI; } add(G().box, '#ffe9a0', 1.2, 1.2, 0.2, x, 3.5, z + 2.7, null, { emissive: '#ffd060', ei: 0.5 }); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const w = add(new T.TorusGeometry(1, 0.12, 6, 16), '#f0c840', 1, 1, 1, x + sx * 2.5, 1.1, z + sz * 1.8); w.rotation.y = Math.PI / 2; } add(G().cone, '#5ac040', 0.4, 1, 0.4, x, 5.8, z); solid(x, z, 2.6, 2.8, 5); }
    // ---- Kristallschloss ----
    { const C = LOC.eis; const cm = new T.MeshStandardMaterial({ color: 0xa8e8ff, metalness: 0.2, roughness: 0.1, emissive: 0x2a80c0, emissiveIntensity: 0.45, transparent: true, opacity: 0.85 });
      add(G().cylB, '#d8f0ff', 60, 1, 60, C.x, 0, C.z);
      const spire = (x, z, r, h) => { add(G().cylB, cm, r, h, r, x, 0, z); add(G().cone, cm, r * 1.1, r * 4, r * 1.1, x, h + r * 2, z); solid(x, z, r * 0.8, r * 0.8, h); };
      spire(C.x, C.z, 9, 70); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; spire(C.x + Math.sin(a) * 30, C.z + Math.cos(a) * 30, 4 + (k % 2) * 2, 30 + (k % 3) * 14); }
      for (let k = 0; k < 120; k++) { const a = R() * 6.283, d = 70 + R() * 170, x = C.x + Math.sin(a) * d, z = C.z + Math.cos(a) * d; const c2 = add(new T.OctahedronGeometry(1), cm, RR(0.6, 2), RR(2, 6), RR(0.6, 2), x, 1, z); c2.rotation.set(RR(-0.3, 0.3), R() * 3, RR(-0.3, 0.3)); }
      const l = new T.PointLight(0x80d8ff, 2, 260, 2); l.position.set(C.x, 40, C.z); g.add(l); W0.crystalL = l; }
    // ---- Drachenhöhle: offene Grotte im Berg ----
    { const C = CAVE, face = Math.atan2(FX - C.x, FZ - C.z), rock = new T.MeshLambertMaterial({ color: 0x7a6a62, side: T.DoubleSide });
      const dome = new T.Mesh(new T.SphereGeometry(C.r, 32, 16, face + Math.PI / 2 + 0.35, Math.PI * 2 - 0.7, 0, Math.PI / 2), rock); dome.position.set(C.x, 0, C.z); dome.castShadow = true; dome.receiveShadow = true; g.add(dome);
      for (let k = 0; k < 14; k++) { const a = face + Math.PI / 2 + 0.4 + k / 13 * (Math.PI * 2 - 0.8); solid(C.x + Math.sin(a) * (C.r + 2), C.z + Math.cos(a) * (C.r + 2), 7, 7, 40); }
      for (let k = 0; k < 9; k++) { const a = face + Math.PI + (k - 4) * 0.42, d = C.r + 95 + R() * 60, h = 120 + R() * 150, r = 70 + R() * 30; add(G().cone, k % 2 ? '#6a5a54' : '#7a6a60', r, h, r, C.x + Math.sin(a) * d, h / 2 - 2, C.z + Math.cos(a) * d); add(G().cone, '#ffffff', r * 0.28, h * 0.25, r * 0.28, C.x + Math.sin(a) * d, h * 0.9, C.z + Math.cos(a) * d); solid(C.x + Math.sin(a) * d, C.z + Math.cos(a) * d, r * 0.6, r * 0.6, h * 0.6); }
      add(G().cylB, '#4a3e3a', C.r, 0.1, C.r, C.x, 0, C.z);
      for (let k = 0; k < 18; k++) { const a = R() * 6.283, d = R() * 28, st = add(G().cone, '#8a7a70', RR(1, 2.4), RR(4, 10), RR(1, 2.4), C.x + Math.sin(a) * d, C.r * 0.9 - 4, C.z + Math.cos(a) * d); st.rotation.x = Math.PI; }
      // Goldschatz
      const gm = new T.MeshStandardMaterial({ color: 0xf0c040, metalness: 0.9, roughness: 0.25, emissive: 0x4a3000 });
      for (let k = 0; k < 70; k++) { const a = R() * 6.283, d = R() * 14, x = C.x - Math.sin(face) * 14 + Math.sin(a) * d, z = C.z - Math.cos(face) * 14 + Math.cos(a) * d; add(G().cyl, gm, 0.5, 0.12, 0.5, x, RR(0.1, Math.max(0.2, 3 - d * 0.2)), z).rotation.set(R(), R(), R()); }
      add(G().sph, gm, 9, 2.5, 9, C.x - Math.sin(face) * 14, 0, C.z - Math.cos(face) * 14);
      for (let k = 0; k < 4; k++) { const ch = new T.Group(); ch.position.set(C.x - Math.sin(face) * 14 + RR(-10, 10), 0, C.z - Math.cos(face) * 14 + RR(-10, 10)); ch.rotation.y = R() * 6; g.add(ch); add(G().boxB, '#7a4a22', 1.6, 1, 1, 0, 0, 0, ch); add(G().box, gm, 1.65, 0.15, 1.05, 0, 1, 0, ch); }
      const l = new T.PointLight(0xffa040, 2.2, 90, 2); l.position.set(C.x - Math.sin(face) * 10, 12, C.z - Math.cos(face) * 10); g.add(l);
      const dl = label('🐉 DRACHENHÖHLE', '#ffd080', 2.2); dl.position.set(C.x + Math.sin(face) * (C.r + 6), 16, C.z + Math.cos(face) * (C.r + 6)); g.add(dl);
      W0.sleeper = buildDragon(2.2, '#c83a30', '#f0c060', '#a02a40'); W0.sleeper.root.position.set(C.x - Math.sin(face) * 10, 2.6, C.z - Math.cos(face) * 10); W0.sleeper.root.rotation.y = face + 1.2; g.add(W0.sleeper.root);
      W0.sleeper.front.rotation.x = 0.9; W0.sleeper.front.rotation.y = -0.5; flap(W0.sleeper, 0, 0, -0.4);
      W0.caveFace = face;
    }
    // ---- Lebkuchenhaus ----
    { const H = LOC.lebkuchen; const c = new T.Group(); c.position.set(H.x, 0, H.z); c.rotation.y = Math.atan2(FX - H.x, FZ - H.z); g.add(c);
      add(G().boxB, '#b0702e', 12, 7, 10, 0, 0, 0, c); roof(0, 7, 0, 13, 12, 5.5, '#ffd0e0', 0, c);
      for (let k = 0; k < 14; k++) add(G().sph, ['#ff4060', '#40c0ff', '#ffe040', '#60e060', '#ff80ff'][k % 5], 0.45, 0.45, 0.2, -5.5 + k * 0.85, 6.6, 5.05, c);
      for (let k = 0; k < 8; k++) add(G().box, '#ffffff', 12.2, 0.18, 0.12, 0, 0.8 + k * 0.85, 5.04, c, { noShadow: true });
      add(G().box, '#6a3a1a', 2, 3.4, 0.3, 0, 1.7, 5.1, c); for (const sx of [-1, 1]) add(G().box, '#ffe8f0', 1.8, 1.6, 0.2, sx * 3.5, 4, 5.1, c, { emissive: '#ffc0e0', ei: 0.3 });
      for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283, x = Math.sin(a) * 11, z = Math.cos(a) * 11 + 2; add(G().cylB, '#ffffff', 0.12, 2.6, 0.12, x, 0, z, c); add(G().cyl, ['#ff4060', '#40c0ff', '#ffe040', '#ff80ff'][k % 4], 0.9, 0.2, 0.9, x, 3, z, c).rotation.x = Math.PI / 2; }
      for (let k = 0; k < 6; k++) { const cn = add(new T.TorusGeometry(0.6, 0.14, 6, 12, Math.PI), k % 2 ? '#ff3040' : '#ffffff', 1, 1, 1, -5 + k * 2, 2.2, 7.5, c); add(G().cylB, k % 2 ? '#ff3040' : '#ffffff', 0.14, 2.2, 0.14, -5.6 + k * 2, 0, 7.5, c); cn.position.x += 0; }
      solid(H.x, H.z, 7, 7, 9); }
    // ---- Großmutters Haus ----
    { const H = LOC.oma; const c = cottage(H.x, H.z, Math.atan2(FX - H.x, FZ - H.z), '#fff4e4', '#c8a050', 1.25); for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283; add(G().boxB, '#f4f0e8', 0.2, 1.1, 0.2, H.x + Math.sin(a) * 16, 0, H.z + Math.cos(a) * 16); } add(G().cylB, '#ff90b0', 3, 0.5, 3, H.x + 8, 0, H.z + 8); void c; }
    // ---- Rapunzelturm ----
    { const Tw = TOWER, face = Math.atan2(FX - Tw.x, FZ - Tw.z);
      add(G().cylB, '#d8cfc0', Tw.r, Tw.h, Tw.r, Tw.x, 0, Tw.z); solid(Tw.x, Tw.z, Tw.r * 0.8, Tw.r * 0.8, Tw.h);
      add(G().cylB, '#c8bfb0', 9.5, 0.8, 9.5, Tw.x, Tw.h - 0.8, Tw.z);
      for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; if (Math.abs(L.angDiff ? L.angDiff(a, face) : 0) < 0.25) continue; add(G().box, '#d8cfc0', 1.6, 1.2, 0.6, Tw.x + Math.sin(a) * 9.1, Tw.h + 0.6, Tw.z + Math.cos(a) * 9.1).rotation.y = a; }
      for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.78; add(G().cylB, '#d8cfc0', 0.5, 6, 0.5, Tw.x + Math.sin(a) * 7.5, Tw.h, Tw.z + Math.cos(a) * 7.5); }
      add(G().cone, '#9a5ac8', 11, 12, 11, Tw.x, Tw.h + 12, Tw.z); add(G().cone, '#f0c840', 0.3, 3, 0.3, Tw.x, Tw.h + 19, Tw.z);
      for (let k = 0; k < 4; k++) add(G().box, '#3a4a9a', 1, 2, 0.3, Tw.x + Math.sin(face + 1.57 * k) * 7, 12 + k * 8, Tw.z + Math.cos(face + 1.57 * k) * 7, null, { emissive: '#8a9aff', ei: 0.3 }).rotation.y = face + 1.57 * k;
      // goldener Zopf
      const bx = Tw.x + Math.sin(face) * 9.6, bz = Tw.z + Math.cos(face) * 9.6;
      for (let k = 0; k < 46; k++) add(G().sph, k % 2 ? '#f6d060' : '#e8b840', 0.42, 0.62, 0.42, bx + Math.sin(k * 0.9) * 0.12, Tw.h + 0.5 - k * 1.0, bz);
      add(G().sph, '#ff70a0', 0.5, 0.5, 0.5, bx, 0.6, bz);
      W0.braid = { x: bx, z: bz };
      // Turmzimmer unter dem Dach: Wände mit Fenster zum Zopf, Einrichtung
      const RT = Tw.h, wallM = L.mat('#e8dccc');
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * 6.283, da = Math.atan2(Math.sin(a - face), Math.cos(a - face)); if (Math.abs(da) < 0.3) continue;
        const wx = Tw.x + Math.sin(a) * 8.7, wz = Tw.z + Math.cos(a) * 8.7, sg = add(G().boxB, wallM, 3.5, 6, 0.5, wx, RT, wz); sg.rotation.y = a;
        const b2 = L.addBox(wx - 1.3, wz - 1.3, wx + 1.3, wz + 1.3, RT + 6, 'building'); b2.y0 = RT;
      }
      add(G().cylB, '#9a5ac8', 8.6, 0.2, 8.6, Tw.x, RT + 5.9, Tw.z);
      add(G().cylB, '#c890e8', 4.5, 0.06, 4.5, Tw.x, RT + 0.01, Tw.z);
      const loc = (u, v) => ({ x: Tw.x + Math.sin(face) * u + Math.cos(face) * v, z: Tw.z + Math.cos(face) * u - Math.sin(face) * v });
      const room = new T.Group(); room.position.set(Tw.x, RT, Tw.z); room.rotation.y = face; g.add(room);
      // Bett (gegenüber dem Fenster)
      add(G().boxB, '#8a5a3a', 2.4, 0.5, 3.4, -2.5, 0, -5.6, room); add(G().boxB, '#fff4e8', 2.3, 0.3, 3.3, -2.5, 0.5, -5.6, room); add(G().boxB, '#b880e0', 2.35, 0.12, 2.0, -2.5, 0.8, -5.0, room); add(G().box, '#ffffff', 1.2, 0.28, 0.6, -2.5, 0.95, -6.8, room);
      // Schminktisch mit Spiegel und Bürste
      add(G().boxB, '#f4e8f8', 2, 1, 0.9, 3.5, 0, -6.2, room); add(G().box, new T.MeshStandardMaterial({ color: 0xe8f4ff, metalness: 1, roughness: 0.05 }), 1.2, 1.5, 0.06, 3.5, 2.0, -6.6, room); add(new T.TorusGeometry(0.8, 0.06, 6, 24), L.mat('#f0c840'), 0.85, 1.05, 1, 3.5, 2.0, -6.58, room); add(G().box, '#c08040', 0.5, 0.06, 0.15, 3.2, 1.05, -6.0, room);
      // Staffelei mit Bild, Bücherregal, Blumen, Sessel
      const ez = new T.Group(); ez.position.set(5.3, 0, -1.5); ez.rotation.y = -1.2; room.add(ez); for (const sd of [-1, 1]) add(G().box, '#8a5a3a', 0.08, 2.6, 0.08, sd * 0.5, 1.3, 0, ez).rotation.z = -sd * 0.12; add(G().box, '#fff8e8', 1.3, 1, 0.05, 0, 1.8, 0.08, ez); add(G().sph, '#ffd040', 0.18, 0.18, 0.02, 0.3, 2.05, 0.12, ez); add(G().box, '#5ab0ff', 1.1, 0.25, 0.02, 0, 1.45, 0.12, ez); add(G().box, '#4aa040', 1.1, 0.12, 0.02, 0, 1.38, 0.12, ez);
      const sh = new T.Group(); sh.position.set(-5.8, 0, -1.8); sh.rotation.y = 1.25; room.add(sh); add(G().boxB, '#8a5a3a', 2.4, 3.2, 0.6, 0, 0, 0, sh); for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 8; k++) add(G().boxB, ['#c02a2a', '#2a6ac0', '#3a8a3a', '#e8c020', '#6a3a8a'][(k + r2) % 5], 0.22, 0.65, 0.45, -0.8 + k * 0.23, 0.15 + r2 * 1.05, 0.05, sh);
      for (let k = 0; k < 5; k++) { const a = -2.2 + k * 0.55, px = Math.sin(a) * 7.6, pz = Math.cos(a) * 7.6; add(G().cylB, '#c06a3a', 0.35, 0.5, 0.35, px, 0, pz, room); for (let q = 0; q < 4; q++) add(G().sph, ['#ff70a0', '#ffd040', '#ffffff', '#a070ff'][q], 0.15, 0.15, 0.15, px + Math.sin(q * 1.6) * 0.2, 0.75 + (q % 2) * 0.15, pz + Math.cos(q * 1.6) * 0.2, room); }
      add(G().boxB, '#c890e8', 1.3, 0.55, 1.2, -4.5, 0, 2.5, room); add(G().boxB, '#c890e8', 1.3, 1.2, 0.3, -4.5, 0.55, 2.0, room);
      // schwebende Laternen
      W0.lanterns = []; for (let k = 0; k < 7; k++) { const ln = new T.Group(); ln.position.set(Math.sin(k * 0.9) * 4.5, 3.6 + (k % 3) * 0.5, Math.cos(k * 0.9) * 4.5); room.add(ln); add(G().box, L.mat('#ffd890', { emissive: '#ffb040', ei: 0.9 }), 0.35, 0.45, 0.35, 0, 0, 0, ln, { noShadow: true }); add(G().box, '#8a5a3a', 0.4, 0.05, 0.4, 0, 0.25, 0, ln, { noShadow: true }); W0.lanterns.push({ g: ln, y: ln.position.y, ph: k }); }
      const rl2 = new T.PointLight(0xffc880, 1.2, 30, 2); rl2.position.set(0, 4, 0); room.add(rl2);
      // Rapunzel: sehr langer goldener Zopf, lila Kleid
      const rp = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { name: 'Rapunzel', koerper: 'frau', lippen: 'rosa', skin: '#f6dcc6', hair: 'lang', hairColor: '#f2c84a', eyes: '#3a8a3a', brows: 'gebogen', mouth: 'laecheln', nose: 'stups', top: 'kleid', topColor: '#9a5ac8', shoeType: 'barfuss', height: 'klein', schmuck: 'kein' }), true);
      const gH = L.mat('#f2c84a'), gH2 = L.mat('#e0b038');
      let bp = rp.head, by = 0.05, bz2 = -0.15;
      for (let k = 0; k < 10; k++) { const sg2 = add(G().sph, k % 2 ? gH : gH2, 0.09, 0.11, 0.09, 0, by - k * 0.16, bz2 - 0.02 * k, rp.head); if (k % 3 === 0) add(G().sph, '#ff90c0', 0.025, 0.025, 0.025, 0.06, by - k * 0.16, bz2 - 0.02 * k + 0.05, rp.head); void sg2; }
      rp.root.position.set(0, 0, 3.0); rp.root.rotation.y = Math.PI; room.add(rp.root);
      // Zopf liegt in Schlingen auf dem Boden
      for (let k = 0; k < 90; k++) { const a = k * 0.32, rr = 0.6 + k * 0.035; add(G().sph, k % 2 ? '#f2c84a' : '#e0b038', 0.14, 0.09, 0.14, Math.sin(a) * rr, 0.09, 1.0 - Math.cos(a) * rr * 0.8, room); }
      W0.rap = rp; W0.rapPos = loc(3.0, 0);
      const rl3 = label('👸 RAPUNZEL', '#ffe8a0', 0.9); rl3.position.set(0, 2.1, 0); rp.root.add(rl3);
      const rl = label('🗼 RAPUNZELTURM', '#e8d0ff', 1.6); rl.position.set(Tw.x, 8, Tw.z); g.add(rl);
    }
    // ---- Riesenbohnenranke + Wolkenpalast ----
    { const S0 = STALK, vm = L.mat('#4aa83a'), lm = L.mat('#6ad050');
      let px = S0.x, pz = S0.z, py = 0;
      for (let k = 0; k < 120; k++) { const t = (k + 1) / 120, y = t * S0.top, a = k * 0.32, x = S0.x + Math.sin(a) * 2.2, z = S0.z + Math.cos(a) * 2.2; const len = Math.hypot(x - px, y - py, z - pz), m = add(G().cyl, vm, 1.6 - t * 0.7, len + 0.4, 1.6 - t * 0.7, (x + px) / 2, (y + py) / 2, (z + pz) / 2); m.lookAt(x, y, z); m.rotateX(Math.PI / 2); px = x; py = y; pz = z; if (k % 3 === 0) { const lf = add(G().sph, lm, 2.6, 0.25, 1.4, x + Math.sin(a + 1.5) * 2.6, y, z + Math.cos(a + 1.5) * 2.6); lf.rotation.y = a; } }
      solid(S0.x, S0.z, 3, 3, S0.top - 2);
      const cm = L.mat('#ffffff', { emissive: '#ffe8f8', ei: 0.35 });
      for (let k = 0; k < 40; k++) { const a = R() * 6.283, d = Math.sqrt(R()) * S0.r, r = RR(10, 20); add(G().sph, cm, r, r * 0.35, r, S0.x + Math.sin(a) * d, S0.top - r * 0.3, S0.z + Math.cos(a) * d); }
      add(G().cylB, cm, S0.r, 0.4, S0.r, S0.x, S0.top - 0.4, S0.z);
      // Pavillon mit goldener Kuppel und Harfe
      const px0 = S0.x + 18, pz0 = S0.z; add(G().cylB, '#fff8e8', 12, 0.8, 12, px0, S0.top, pz0);
      for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; add(G().cylB, '#fff4f8', 0.6, 12, 0.6, px0 + Math.sin(a) * 10.5, S0.top + 0.8, pz0 + Math.cos(a) * 10.5); }
      add(new T.SphereGeometry(1, 20, 10, 0, 6.283, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0xf0c850, metalness: 0.85, roughness: 0.3 }), 11.5, 7, 11.5, px0, S0.top + 12.8, pz0);
      const hp = new T.Group(); hp.position.set(px0, S0.top + 0.8, pz0); g.add(hp); add(new T.TorusGeometry(1.4, 0.15, 6, 16, Math.PI * 1.3), '#f0c840', 1, 1, 1, 0, 2.2, 0, hp); for (let k = 0; k < 7; k++) add(G().box, '#ffffff', 0.03, 2 - Math.abs(k - 3) * 0.2, 0.03, -0.9 + k * 0.3, 1.9, 0, hp);
      const wl = label('☁️ WOLKENPALAST', '#ffffff', 2); wl.position.set(px0, S0.top + 24, pz0); g.add(wl);
      const sl = label('🌱 BOHNENRANKE – E: hochklettern', '#c8ffb0', 1.5); sl.position.set(S0.x, 6, S0.z + 4); g.add(sl);
    }
    // ---- Spiegelsee ----
    { const Lk = LAKE; const wt = cvTex(128, 128, (c, w, h) => { c.fillStyle = '#5ab8e8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.35).toFixed(2) + ')'; c.fillRect(Math.random() * w, Math.random() * h, 6, 1); } }, 14);
      W0.lakeT = wt;
      const wm = new T.Mesh(new T.CircleGeometry(Lk.r, 64), new T.MeshStandardMaterial({ map: wt, color: 0xbfe8ff, metalness: 0.6, roughness: 0.08, emissive: 0x1a5070, emissiveIntensity: 0.4, transparent: true, opacity: 0.92 })); wm.rotation.x = -Math.PI / 2; wm.position.set(Lk.x, 0.06, Lk.z); g.add(wm);
      add(new T.RingGeometry(Lk.r, Lk.r + 7, 64).rotateX(-Math.PI / 2), '#f0e0b0', 1, 1, 1, Lk.x, 0.05, Lk.z);
      for (let k = 0; k < 40; k++) { const a = R() * 6.283, d = RR(20, Lk.r - 10); add(G().cyl, '#4aa040', RR(1, 2), 0.08, RR(1, 2), Lk.x + Math.sin(a) * d, 0.12, Lk.z + Math.cos(a) * d); if (k % 3 === 0) add(G().sph, '#ffa0d0', 0.5, 0.35, 0.5, Lk.x + Math.sin(a) * d, 0.35, Lk.z + Math.cos(a) * d); }
      W0.swans = [];
      for (let k = 0; k < 5; k++) { const sw = new T.Group(); add(G().sph, '#ffffff', 0.8, 0.55, 1.2, 0, 0.5, 0, sw); const nk = add(G().cyl, '#ffffff', 0.15, 1.4, 0.15, 0, 1.3, 0.8, sw); nk.rotation.x = -0.25; add(G().sph, '#ffffff', 0.25, 0.25, 0.3, 0, 2, 0.95, sw); add(G().cone, '#ff9020', 0.08, 0.3, 0.08, 0, 2, 1.25, sw).rotation.x = Math.PI / 2; g.add(sw); W0.swans.push({ g: sw, a: R() * 6.283, d: RR(40, Lk.r - 25), sp: RR(0.03, 0.07) }); }
      // Regenbogen über dem See
      const RB = ['#ff4060', '#ff9a30', '#ffe040', '#50d050', '#40a8ff', '#8060ff'];
      for (let k = 0; k < 6; k++) { const rb = new T.Mesh(new T.TorusGeometry(380 - k * 9, 4.5, 6, 64, Math.PI), new T.MeshBasicMaterial({ color: RB[k], transparent: true, opacity: 0.38, fog: false, depthWrite: false })); rb.position.set(Lk.x + 120, -40, Lk.z - 180); rb.rotation.y = 0.9; g.add(rb); }
    }
    // ---- Zwergenmine ----
    { const M = LOC.mine;
      for (let k = 0; k < 6; k++) { const a = Math.PI + (k - 2.5) * 0.4, d = 60 + R() * 20, h = 50 + R() * 60, r = 40 + R() * 20; add(new T.DodecahedronGeometry(1), '#7a6a5a', r, h * 0.5, r, M.x + Math.sin(a) * d, h * 0.2, M.z + Math.cos(a) * d * 0.6); solid(M.x + Math.sin(a) * d, M.z + Math.cos(a) * d * 0.6, r * 0.7, r * 0.7, h * 0.5); }
      add(G().boxB, '#2a2018', 9, 9, 3, M.x, 0, M.z + 6); for (const sx of [-1, 1]) add(G().boxB, '#6a4428', 1, 10, 1, M.x + sx * 5, 0, M.z + 7.5); add(G().box, '#6a4428', 11, 1, 1, M.x, 10, M.z + 7.5);
      const sg = label('⛏️ ZWERGENMINE', '#ffe0a0', 1.6); sg.position.set(M.x, 13, M.z + 8); g.add(sg);
      for (let k = 0; k < 40; k++) { for (const sx of [-1, 1]) add(G().box, '#8a8a90', 0.15, 0.15, 2.2, M.x + sx * 1, 0.08, M.z + 9 + k * 2); add(G().box, '#6a4428', 2.6, 0.12, 0.35, M.x, 0.05, M.z + 9 + k * 2); }
      const gem = ['#ff4080', '#40e0ff', '#60ff80', '#ffe040'];
      for (let k = 0; k < 3; k++) { const z = M.z + 18 + k * 12; add(G().boxB, '#5a5a62', 2, 1.4, 3, M.x, 0.3, z); for (let q = 0; q < 6; q++) add(new T.OctahedronGeometry(0.4), L.mat(gem[q % 4], { emissive: gem[q % 4], ei: 0.6 }), 1, 1, 1, M.x + RR(-0.6, 0.6), 1.9, z + RR(-1, 1)); solid(M.x, z, 1, 1.5, 1.7); }
      // Zwergenhäuser (runde Hütten mit Pilzdach) und Zwerge
      for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3, x = M.x + Math.sin(a) * 75, z = M.z + 95 + Math.cos(a) * 18; add(G().cylB, '#f4ead8', 3, 3, 3, x, 0, z); add(G().sph, '#d83a3a', 4.4, 2.6, 4.4, x, 3, z); for (let q = 0; q < 5; q++) add(G().sph, '#ffffff', 0.5, 0.3, 0.5, x + Math.sin(q * 1.3) * 3, 4.4, z + Math.cos(q * 1.3) * 3); add(G().box, '#6a4428', 1, 1.8, 0.2, x, 0.9, z + 3); solid(x, z, 3, 3, 4); }
      W0.dwarfs = []; const DC = ['#c02a2a', '#2a6ac0', '#3a8a3a', '#e8c020', '#6a3a8a', '#e07020', '#d04a9a'];
      for (let k = 0; k < 7; k++) W0.dwarfs.push(npc({ name: 'Zwerg', skin: '#f1d2b6', hair: 'kurz', hairColor: '#f2f2f2', beard: 'langbart', hat: 'muetze', hatColor: DC[k], top: 'kittel', topColor: DC[(k + 3) % 7], pants: 'anzughose', pantsColor: '#4a2f1c', shoeType: 'stiefel', build: 'kraeftig', height: 'sehr_klein' }, M.x - 20 + k * 6.5, M.z + 70, 0, 0.65));
    }
    // ---- Fee Lumina im Zauberwald ----
    { const F = LOC.fee; W0.fairy = npc({ name: 'Fee Lumina', skin: '#f6dcc6', hair: 'lang', hairColor: '#e8c020', eyes: '#3a8a3a', mouth: 'laecheln', hat: 'krone', hatColor: '#f2f2f2', top: 'pullover', topColor: '#80d0ff', pants: 'rock', pantsColor: '#80d0ff', shoeType: 'barfuss', height: 'klein' }, F.x, F.z, 0.8);
      const wm = new T.MeshBasicMaterial({ color: 0xc0f0ff, transparent: true, opacity: 0.45, side: T.DoubleSide, depthWrite: false });
      W0.fairyWings = []; for (const sd of [-1, 1]) { const w = new T.Mesh(new T.CircleGeometry(0.55, 12), wm); w.scale.set(1, 1.6, 1); w.position.set(sd * 0.32, 1.3, -0.18); w.rotation.y = sd * 0.6; W0.fairy.root.add(w); W0.fairyWings.push(w); }
      const fl = label('🧚 FEE LUMINA', '#c8f0ff', 0.9); fl.position.set(0, 2.6, 0); W0.fairy.root.add(fl);
    }
    // ---- Glühwürmchen / Feenstaub ----
    { const N = 700, pos = new Float32Array(N * 3), base = []; for (let i = 0; i < N; i++) { const inF2 = i < 450, x = inF2 ? FX + RR(-1400, -300) : FX + RR(-1500, 1500), z = inF2 ? FZ + RR(-400, 850) : FZ + RR(-1500, 1500); base.push([x, RR(0.5, 6), z, R() * 6.283]); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      const dotT = cvTex(32, 32, (c) => { const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,240,160,.8)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, 32, 32); });
      const pts = new T.Points(geo, W0.fliesM = new T.PointsMaterial({ size: 0.9, map: dotT, color: 0xfff0a0, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); pts.frustumCulled = false; g.add(pts); W0.flies = { geo, pos, base };
    }
    // ---- schwebende Inseln mit Wasserfällen ----
    W0.floaters = [];
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * 6.283 + 0.5, d = 900 + R() * 900, x = FX + Math.sin(a) * d, z = FZ + Math.cos(a) * d, y = 110 + R() * 140, r = 30 + R() * 40;
      const fg = new T.Group(); fg.position.set(x, y, z); g.add(fg);
      add(G().cylB, '#7ccf5a', r, 3, r, 0, 0, 0, fg); const c2 = add(G().cone, '#8a6a4a', r, r * 1.6, r, 0, -r * 0.8, 0, fg); c2.rotation.x = Math.PI;
      for (let q = 0; q < 6; q++) { const tx = RR(-r * 0.6, r * 0.6), tz = RR(-r * 0.6, r * 0.6); add(G().cylB, '#7a5232', 0.5, 5, 0.5, tx, 3, tz, fg); add(G().sph, q % 2 ? '#ffc0dc' : '#5ab84a', 3, 2.6, 3, tx, 9, tz, fg); }
      const wf = new T.Mesh(new T.PlaneGeometry(8, y + 3), wfm); wf.position.set(r * 0.7, -(y + 3) / 2 + 3, 0); wf.rotation.y = Math.PI / 2; fg.add(wf);
      W0.floaters.push({ g: fg, y, ph: R() * 6 });
    }
    // ---- Drachen am Himmel ----
    W0.dragons = [['#3a9a5a', '#d8f0a0', '#2a7a6a'], ['#3a6ad8', '#c0e0ff', '#5a3ab8'], ['#e8b030', '#fff0b0', '#d0601a']].map((c, k) => { const D = buildDragon(3 + k * 0.6, c[0], c[1], c[2]); g.add(D.root); return { D, cx: FX + [-600, 700, 100][k], cz: FZ + [-300, -600, 400][k], r: [380, 300, 520][k], h: [120, 160, 95][k], sp: [0.05, -0.065, 0.04][k], a: k * 2, fire: 3 + k * 4 }; });
    // ---- Einhörner ----
    W0.unis = [];
    { const BODY = ['#fbf8ff', '#fbf8ff', '#ffe0ee', '#e0eaff', '#efe0ff', '#fff4d8'];
      for (let h = 0; h < 7; h++) { const ha = R() * 6.283, hd = 300 + R() * 1000, hx = FX + Math.sin(ha) * hd, hz = FZ + Math.cos(ha) * hd;
        for (let q = 0; q < 4; q++) { const foal = q === 3, U = buildUnicorn(BODY[(h + q) % BODY.length]); if (foal) U.root.scale.setScalar(0.7);
          U.x = hx + (R() - 0.5) * 30; U.z = hz + (R() - 0.5) * 30; U.tx = U.x; U.tz = U.z; U.ph = R() * 6; U.wait = R() * 4; U.id = W0.unis.length; U.foal = foal; g.add(U.root); W0.unis.push(U); } } }
    // ---- BEYZA ----
    W0.bey = buildBeyza(); g.add(W0.bey.root);
    W0.prince = buildPrince(); g.add(W0.prince.root);
    g.traverse((o) => { if (o.isMesh && o.material && o.material.map === undefined) { /* nichts */ } });
    built = W0;
  }

  // ---------- BEYZA: läuft auf einer großen Runde durch die Welt (für alle Spieler gleich, nach der Uhrzeit) ----------
  const BR = 700, BSPD = 2.4;
  const beyAng = (t) => (t * BSPD / BR) % 6.283;
  const beyPos = (t) => { const a = beyAng(t), w = BR + Math.sin(a * 3) * 90; return { x: FX + Math.sin(a) * w, z: FZ + Math.cos(a) * w }; };
  let beyPh = 0, beyStepSide = 0, beyTalkT = 0;
  const BEY_LINES = ['„Hallo, kleiner Mensch! Ist es nicht wunderschön hier?“', '„Pass auf meine Füße auf – ich will niemanden zertreten!“', '„Ich bin BEYZA. Meine Freunde nennen mich BEYY.“', '„Hast du schon den Wolkenpalast gesehen? Ich kann fast hineinschauen!“', '„Die Drachen sind meine Freunde. Der rote schläft am liebsten.“', '„Das ist mein Prinz. Wir gehen jeden Tag Hand in Hand spazieren.“', '„Ich mag Einhörner. Sie kitzeln an den Knöcheln.“', '„Schau mal an der Quest-Tafel im Dorf vorbei – da gibt es jeden Tag neue Abenteuer.“'];
  function updateBeyza(dt) {
    const B = built.bey, now = Date.now() / 1000, p = beyPos(now), p2 = beyPos(now + 1), yaw = Math.atan2(p2.x - p.x, p2.z - p.z);
    B.root.position.set(p.x, 0, p.z); B.root.rotation.y = yaw;
    beyPh += dt * 1.15; L.animHuman(B, { mode: 'walk', phase: beyPh, speed: 1 });
    // Prinz läuft an ihrer linken Seite (lokal +x), beide halten sich an der Hand
    const PRc = built.prince, rx = Math.cos(yaw), rz = -Math.sin(yaw), HA = 0.32, GAP = 0.24 * BEY_S + 0.27 * PR_S + 0.7 * (BEY_S + PR_S) * Math.sin(HA);
    const px2 = p.x + rx * GAP, pz2 = p.z + rz * GAP;
    PRc.root.position.set(px2, 0, pz2); PRc.root.rotation.y = yaw;
    L.animHuman(PRc, { mode: 'walk', phase: beyPh, speed: 1 });
    const sw = Math.sin(beyPh) * 0.12;
    { const a = B.arms[1]; a.arm.rotation.set(-0.12 + sw, 0, HA); a.elbow.rotation.x = -0.12; }
    { const a = PRc.arms[0]; a.arm.rotation.set(-0.12 + sw, 0, -HA); a.elbow.rotation.x = -0.12; }
    if (PRc.cape) PRc.cape.rotation.x = 0.15 + Math.abs(Math.sin(beyPh)) * 0.08;
    // ab und zu schauen sie sich verliebt an
    const look = Math.max(0, Math.sin(now * 0.25)) ** 3;
    B.head.rotation.y = look * 0.6; PRc.head.rotation.y = -look * 0.6;
    const d = Math.hypot(P.x - p.x, P.z - p.z), dPr = Math.hypot(P.x - px2, P.z - pz2);
    // winkt, wenn du in der Nähe bist, und schaut dich an
    if (d < 120) { const want = Math.atan2(P.x - p.x, P.z - p.z) - yaw; B.head.rotation.y = L.clamp(Math.atan2(Math.sin(want), Math.cos(want)), -0.8, 0.8); B.head.rotation.x = -L.clamp((80 - d) / 200, 0, 0.35) * -1; const a = B.arms[0]; if (a) { a.arm.rotation.x = -2.6 + Math.sin(now * 3) * 0.25; a.arm.rotation.z = -0.5 + Math.sin(now * 4) * 0.25; a.elbow.rotation.x = -0.4; } }
    // Schritte: sanftes Beben
    const side = Math.sin(beyPh * 2) > 0 ? 1 : -1;
    if (side !== beyStepSide) { beyStepSide = side; if (d < 160) { L.shake = Math.max(L.shake, 0.25 * (1 - d / 160)); L.snd.stomp && L.snd.stomp({ x: p.x, y: 0, z: p.z }); } }
    // Füße schieben dich sanft zur Seite (keine Verletzung)
    if (d < 9 && !P.vehicle && (P.y || 0) < 6) { const k = (9 - d) / 9; P.x += (P.x - p.x) / (d || 1) * k * 0.6; P.z += (P.z - p.z) / (d || 1) * k * 0.6; }
    if (dPr < 9 && !P.vehicle && (P.y || 0) < 6) { const k = (9 - dPr) / 9; P.x += (P.x - px2) / (dPr || 1) * k * 0.6; P.z += (P.z - pz2) / (dPr || 1) * k * 0.6; }
    if (dPr < 120 && look < 0.2) { const want = Math.atan2(P.x - px2, P.z - pz2) - yaw; PRc.head.rotation.y = L.clamp(Math.atan2(Math.sin(want), Math.cos(want)), -0.8, 0.8); }
    beyTalkT -= dt;
    if (d < 60 && beyTalkT <= 0) { beyTalkT = 45; L.msg('💖 BEYZA: ' + BEY_LINES[(Math.random() * BEY_LINES.length) | 0], 6000); }
    return d;
  }
  const PR_LINES = ['„Seid gegrüßt, Reisender! Ist meine BEYZA nicht die Schönste im ganzen Märchenland?“', '„Ich lasse ihre Hand nie los – nicht einmal, wenn die Drachen über uns fliegen.“', '„Wir spazieren jeden Tag um das ganze Reich. Kommt doch ein Stück mit!“', '„Habt Ihr schon die Quest-Tafel im Dorf gesehen? Das Königreich braucht mutige Helden.“', '„Vorsicht mit unseren Füßen – wir sind ein bisschen groß geraten.“'];
  const nearPrince = () => built && Math.hypot(P.x - built.prince.root.position.x, P.z - built.prince.root.position.z) < 40;
  const nearBeyza = () => built && Math.hypot(P.x - built.bey.root.position.x, P.z - built.bey.root.position.z) < 40;

  // ---------- Tiere und Leben ----------
  function updateLife(dt, t) {
    const W0 = built;
    for (const q of W0.dragons) {
      q.a += dt * q.sp; const x = q.cx + Math.sin(q.a) * q.r, z = q.cz + Math.cos(q.a) * q.r, y = q.h + Math.sin(q.a * 3) * 18;
      const D = q.D; D.root.position.set(x, y, z); D.root.rotation.set(0, q.a + (q.sp > 0 ? Math.PI / 2 : -Math.PI / 2), (q.sp > 0 ? -1 : 1) * 0.3);
      flap(D, t * 2.4 + q.a, 0.7); D.front.rotation.x = Math.sin(t * 0.7) * 0.1;
      q.fire -= dt; const dP = Math.hypot(P.x - x, P.z - z);
      if (q.fire < 0) { q.fire = 6 + Math.random() * 8; if (dP < 700) { q.fireT = 1.4; if (dP < 300 && L.snd.flame) L.snd.flame({ x, y, z }); } }
      if (q.fireT > 0) { q.fireT -= dt; const hp = new T.Vector3(); D.head.getWorldPosition(hp); const dir = new T.Vector3(); D.head.getWorldDirection(dir); for (let k = 0; k < 3; k++) L.fx(Math.random() < 0.5 ? '#ffb030' : '#ff5020', hp.x + dir.x * 4, hp.y + dir.y * 4, hp.z + dir.z * 4, 2, 8, { basic: true, size: 0.9, life: 0.8 }); }
    }
    // Schlafender Drache atmet, Zzz
    const S = W0.sleeper; S.body.scale.y = 1 + Math.sin(t * 0.9) * 0.04; S.body.scale.x = 1 + Math.sin(t * 0.9) * 0.025;
    if (Math.random() < dt * 0.6 && Math.hypot(P.x - CAVE.x, P.z - CAVE.z) < 200) { const hp = new T.Vector3(); S.head.getWorldPosition(hp); L.fx('#ffffff', hp.x, hp.y + 2, hp.z, 1, 1.5, { basic: true, size: 0.5, life: 2 }); }
    // Babydrache hüpft und flattert
    const Bd = W0.baby, hop = Math.abs(Math.sin(t * 2.2)); Bd.root.position.y = 1 + hop * 0.8; Bd.root.rotation.y = Math.sin(t * 0.4) * 1.5; flap(Bd, t * 9, 0.5);
    // Einhörner grasen und laufen
    for (const U of W0.unis) {
      U.wait -= dt;
      const dx = U.tx - U.x, dz = U.tz - U.z, dd = Math.hypot(dx, dz);
      if (U.foal && W0.unis[U.id - 1]) { const M = W0.unis[U.id - 1]; if (Math.hypot(M.x - U.x, M.z - U.z) > 4) { U.tx = M.x - 2; U.tz = M.z - 2; } }
      if (dd < 2) { if (U.wait <= 0 && !U.foal) { const a = Math.random() * 6.283, d = 300 + Math.random() * 1100; const nx = FX + Math.sin(a) * d, nz = FZ + Math.cos(a) * d; if (built.free(nx, nz)) { U.tx = nx; U.tz = nz; } U.wait = 4 + Math.random() * 8; } U.head.rotation.x = 0.5 + Math.sin(t * 2 + U.id) * 0.1; U.legs.forEach((l) => { l.rotation.x = 0; }); }
      else { const sp = 3.2 * dt; U.x += dx / dd * sp; U.z += dz / dd * sp; U.root.rotation.y = Math.atan2(dx, dz); U.ph += dt * 7; U.legs.forEach((l, k) => { l.rotation.x = Math.sin(U.ph + (k === 0 || k === 3 ? 0 : Math.PI)) * 0.5; }); U.head.rotation.x = 0; }
      U.root.position.set(U.x, 0, U.z);
    }
    for (const sw of W0.swans) { sw.a += dt * sw.sp; sw.g.position.set(LAKE.x + Math.sin(sw.a) * sw.d, 0.05, LAKE.z + Math.cos(sw.a) * sw.d); sw.g.rotation.y = sw.a + Math.PI / 2; }
    for (const f of W0.floaters) f.g.position.y = f.y + Math.sin(t * 0.3 + f.ph) * 4;
    W0.mill.rotation.z -= dt * 0.6;
    W0.wft.offset.y -= dt * 1.5; W0.lakeT.offset.x += dt * 0.01;
    W0.wish.scale.setScalar(3.2 + Math.sin(t * 2) * 0.4);
    W0.ringGlow.forEach((m, k) => { m.scale.y = 0.4 + Math.sin(t * 3 + k) * 0.12; }); W0.ringCol.rotation.y += dt * 0.5;
    if (W0.fairy) { W0.fairy.root.position.y = 1.2 + Math.sin(t * 1.6) * 0.4; L.animHuman(W0.fairy, { mode: 'idle', phase: t }); W0.fairyWings.forEach((w, k) => { w.rotation.y = (k ? 1 : -1) * (0.6 + Math.sin(t * 20) * 0.5); }); }
    for (const r of W0.folk) L.animHuman(r, { mode: 'idle', phase: t + r.root.position.x });
    for (const r of W0.dwarfs) L.animHuman(r, { mode: 'idle', phase: t * 1.4 + r.root.position.x });
    if (W0.rap) {
      L.animHuman(W0.rap, { mode: 'idle', phase: t });
      const a = W0.rap.arms[0]; if (a) { a.arm.rotation.x = -2.4 + Math.sin(t * 2.2) * 0.25; a.arm.rotation.z = -0.3; a.elbow.rotation.x = -1.2; } // bürstet ihr Haar
      W0.rap.head.rotation.z = Math.sin(t * 0.8) * 0.08;
      for (const l of W0.lanterns) { l.g.position.y = l.y + Math.sin(t * 0.7 + l.ph) * 0.25; l.g.rotation.y += dt * 0.3; }
      const dR = Math.hypot(P.x - W0.rapPos.x, P.z - W0.rapPos.z);
      W0.rapT = (W0.rapT || 0) - dt;
      if (dR < 10 && (P.y || 0) > 40 && W0.rapT <= 0) { W0.rapT = 40; L.msg('👸 Rapunzel: „Oh, Besuch! Endlich jemand, der den Zopf hochgeklettert ist!“ ♪', 5000); for (const [k, fr] of [523, 659, 784, 1047, 784, 659].entries()) L.tn && L.tn({ f: fr, fTo: fr, dur: 0.45, type: 'sine', vol: 0.12, delay: k * 0.35 }); }
    }
    // Glühwürmchen
    const F = W0.flies; for (let i = 0; i < F.base.length; i++) { const b = F.base[i]; F.pos[i * 3] = b[0] + Math.sin(t * 0.5 + b[3]) * 3; F.pos[i * 3 + 1] = b[1] + Math.sin(t * 0.9 + b[3] * 2) * 1.2; F.pos[i * 3 + 2] = b[2] + Math.cos(t * 0.4 + b[3]) * 3; } F.geo.attributes.position.needsUpdate = true;
    for (const fl of W0.g.children) if (fl.userData && fl.userData.flag) fl.rotation.y = Math.sin(t * 2 + fl.position.x) * 0.3;
  }

  // ---------- Märchen-Fahrzeuge ----------
  // Kürbiskutsche (4 Plätze), Einhorn (reiten), fliegender Teppich, Hexenbesen und Reitdrache (fliegen: E hoch, C/Shift runter)
  Object.assign(L.VTYPES, {
    mf_kutsche: { name: 'Kürbiskutsche', vmax: 120, acc: 7, hp: 220, kind: 'car', open: true, len: 7.5, wid: 2.6, off: 1, h: 3.2, fairy: true },
    mf_einhorn: { name: 'Einhorn', vmax: 150, acc: 11, hp: 160, kind: 'bike', len: 2.6, wid: 0.9, off: 1, fairy: true },
    mf_teppich: { name: 'Fliegender Teppich', vmax: 180, acc: 10, hp: 120, kind: 'car', open: true, fly: true, len: 3.4, wid: 2.2, off: 1, h: 0.6, fairy: true },
    mf_besen: { name: 'Hexenbesen', vmax: 220, acc: 16, hp: 70, kind: 'bike', fly: true, len: 2.4, wid: 0.5, off: 1, fairy: true },
    mf_pegasus: { name: 'Flügel-Einhorn', vmax: 260, acc: 15, hp: 200, kind: 'bike', fly: true, len: 2.6, wid: 1, off: 1, fairy: true },
    mf_drache: { name: 'Reitdrache', vmax: 320, acc: 18, hp: 400, kind: 'bike', fly: true, len: 6, wid: 3, off: 1, fairy: true }
  });
  const wheelGeo = new T.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2);
  function horse(par, x, z, col) {
    const hg = new T.Group(); hg.position.set(x, 0, z); par.add(hg);
    const M = L.mat(col);
    add(G().box, M, 0.7, 0.75, 1.7, 0, 1.45, 0, hg); const nk = add(G().box, M, 0.4, 1.0, 0.45, 0, 2.05, 0.8, hg); nk.rotation.x = 0.5;
    add(G().box, M, 0.38, 0.42, 0.8, 0, 2.55, 1.15, hg); add(G().box, L.mat('#f0c840'), 0.75, 0.12, 0.2, 0, 1.75, 0.4, hg);
    for (let k = 0; k < 5; k++) add(G().box, L.mat('#f4e8c0'), 0.12, 0.3, 0.16, 0, 2.55 - k * 0.16, 0.85 - k * 0.12, hg);
    add(G().box, L.mat('#ff90c0'), 0.15, 0.35, 0.15, 0, 2.95, 1.0, hg);
    const legs = [];
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new T.Group(); lg.position.set(sx * 0.24, 1.15, sz * 0.65); hg.add(lg); add(G().box, M, 0.17, 1.05, 0.17, 0, -0.52, 0, lg); add(G().box, L.mat('#f0c840'), 0.2, 0.12, 0.2, 0, -1.08, 0, lg); legs.push(lg); }
    return legs;
  }
  const obv = L.buildVehicle;
  L.buildVehicle = function (type, cust) {
    if (!type || type.slice(0, 3) !== 'mf_') return obv(type, cust);
    const root = new T.Group(), wheels = [], steer = [], fa = { legs: [], wings: null, type };
    let seat, seats;
    if (type === 'mf_kutsche') {
      const gold = new T.MeshStandardMaterial({ color: 0xf0c850, metalness: 0.85, roughness: 0.3, emissive: 0x2a1a00 });
      const body = new T.Group(); body.position.set(0, 0, -1.3); root.add(body);
      add(G().sph, '#ff9a30', 1.6, 1.4, 1.8, 0, 2.0, 0, body);
      for (let k = 0; k < 8; k++) { const r = add(G().sph, '#ffb050', 0.25, 1.42, 1.82, 0, 2.0, 0, body); r.rotation.y = k / 8 * Math.PI; }
      for (const sd of [-1, 1]) add(G().box, L.mat('#ffe9a0', { emissive: '#ffcf60', ei: 0.4 }), 0.1, 0.8, 0.9, sd * 1.55, 2.2, 0, body);
      add(G().cone, '#4aa83a', 0.25, 0.7, 0.25, 0, 3.6, 0, body); const lf = add(G().sph, '#5ac040', 0.5, 0.08, 0.3, 0.35, 3.45, 0, body); lf.rotation.z = -0.4;
      add(G().box, gold, 2.2, 0.12, 2.6, 0, 0.75, 0, body);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const piv = new T.Group(); piv.position.set(sx * 1.25, 0.75, -1.3 + sz * 1.1); root.add(piv); const w = new T.Mesh(wheelGeo, gold); w.scale.set(0.14, 0.75, 0.75); piv.add(w); for (let q = 0; q < 4; q++) { const sp = add(G().box, gold, 0.06, 1.4, 0.06, 0, 0, 0, w); sp.scale.set(0.5, 1.9, 0.5); sp.rotation.x = q * 0.785; } wheels.push(w); if (sz > 0) steer.push(piv); }
      // Kutschbock und Deichsel, zwei Schimmel
      add(G().box, '#8a4a20', 1.6, 0.2, 0.9, 0, 1.35, 0.55, root); add(G().box, '#c02a5a', 1.4, 0.15, 0.7, 0, 1.5, 0.55, root);
      add(G().box, '#6a3a1a', 0.12, 0.12, 2.6, 0, 1.0, 1.9, root);
      fa.legs = horse(root, -0.55, 2.6, '#fbf8ff').concat(horse(root, 0.55, 2.6, '#fbf8ff'));
      seat = { x: 0, y: 1.0, z: 0.5 };
      seats = [seat, { x: -0.55, y: 0.95, z: -1.3 }, { x: 0.55, y: 0.95, z: -1.3 }, { x: 0, y: 0.95, z: -2.0 }];
    } else if (type === 'mf_einhorn') {
      const U = buildUnicorn(); root.add(U.root); fa.legs = U.legs;
      add(G().box, '#c02a5a', 0.7, 0.12, 0.8, 0, 2.18 / 1.15, -0.05, U.root); add(G().box, '#f0c840', 0.72, 0.04, 0.82, 0, 2.25 / 1.15, -0.05, U.root);
      seat = { x: 0, y: 1.5, z: -0.15 }; seats = [seat, { x: 0, y: 1.5, z: -0.75 }];
    } else if (type === 'mf_pegasus') {
      const U = buildUnicorn(L.pick(['#fbf8ff', '#ffe0ee', '#e0eaff']), true); root.add(U.root); fa.legs = U.legs; fa.peg = U.wings;
      add(G().box, '#2a6ac0', 0.7, 0.12, 0.8, 0, 2.18 / 1.15, -0.05, U.root); add(G().box, '#f0c840', 0.72, 0.04, 0.82, 0, 2.25 / 1.15, -0.05, U.root);
      seat = { x: 0, y: 1.5, z: -0.15 }; seats = [seat, { x: 0, y: 1.5, z: -0.75 }];
    } else if (type === 'mf_teppich') {
      const ct = cvTex(64, 96, (c, w, h) => { c.fillStyle = '#9a1a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f0c840'; c.lineWidth = 4; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = '#1a3a8a'; c.fillRect(12, 12, w - 24, h - 24); c.fillStyle = '#f0c840'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(w / 2, 18 + k * 14); c.lineTo(w / 2 + 10, 25 + k * 14); c.lineTo(w / 2, 32 + k * 14); c.lineTo(w / 2 - 10, 25 + k * 14); c.fill(); } c.fillStyle = '#e04a6a'; c.fillRect(8, 0, 2, h); c.fillRect(w - 10, 0, 2, h); });
      const geo = new T.PlaneGeometry(2.2, 3.4, 8, 12); geo.rotateX(-Math.PI / 2);
      const cm = new T.Mesh(geo, new T.MeshLambertMaterial({ map: ct, side: T.DoubleSide })); cm.position.y = 0.6; cm.castShadow = true; root.add(cm);
      for (const sz of [-1, 1]) for (let k = 0; k < 8; k++) add(G().box, '#f0c840', 0.06, 0.02, 0.25, -1 + k * 0.28, 0.6, sz * 1.8, root);
      fa.carpet = { geo, base: geo.attributes.position.array.slice() };
      seat = { x: 0, y: 0.1, z: 0.3 }; seats = [seat, { x: 0.55, y: 0.1, z: -0.8 }, { x: -0.55, y: 0.1, z: -0.8 }];
    } else if (type === 'mf_besen') {
      const st = add(G().cyl, '#7a4a22', 0.07, 2.2, 0.07, 0, 1.0, 0.2, root); st.rotation.x = Math.PI / 2 - 0.08;
      const br = new T.Group(); br.position.set(0, 0.95, -1.0); root.add(br);
      for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283, r = 0.05 + (k % 3) * 0.06; const tw = add(G().cyl, k % 2 ? '#c8a040' : '#a88028', 0.025, 0.9, 0.025, Math.sin(a) * r, Math.cos(a) * r, -0.35, br); tw.rotation.x = Math.PI / 2 + Math.cos(a) * 0.25; tw.rotation.z = Math.sin(a) * 0.25; }
      add(G().cyl, '#c02a5a', 0.12, 0.12, 0.12, 0, 0, 0.05, br).rotation.x = Math.PI / 2;
      fa.sparkle = true;
      seat = { x: 0, y: 0.15, z: -0.1 }; seats = [seat, { x: 0, y: 0.15, z: -0.6 }];
    } else {
      const Dr = buildDragon(1.25, L.pick(['#3a9a5a', '#3a6ad8', '#a070e0', '#e8b030']), '#f8e8c0', '#c84a8a'); root.add(Dr.root); Dr.root.position.y = 2.4; fa.dragon = Dr; fa.legs = Dr.legs;
      add(G().box, '#8a3a1a', 0.9, 0.18, 1.0, 0, 1.55, 0.3, Dr.body);
      seat = { x: 0, y: 3.25, z: 0.35 }; seats = [seat, { x: 0, y: 3.25, z: -0.6 }];
    }
    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    root.userData.fairy = fa;
    return { root, wheels, steer, seat, seats, glassZ: 0, color: '#ff9a30' };
  };
  // Bewegung der Märchen-Fahrzeuge: Beine laufen, Flügel schlagen, Teppich wellt sich, Besen funkelt
  function updateFairyVehicles(dt, t) {
    for (const v of E.vehicles) {
      const fa = v.rig && v.rig.root.userData.fairy; if (!fa || Math.hypot(v.x - P.x, v.z - P.z) > 300) continue;
      const sp = Math.abs(v.speed || 0), air = (v.alt || 0) > 0.6;
      v.fPh = (v.fPh || 0) + dt * Math.min(14, 2 + sp * 0.45);
      if (fa.peg) fa.peg.forEach((w) => { w.pv.rotation.z = w.sd * (air ? Math.sin(t * 5) * 0.6 : 0.25); w.pv.rotation.y = air ? 0 : w.sd * -0.5; });
      if (fa.legs.length && !fa.dragon) fa.legs.forEach((l, k) => { l.rotation.x = sp > 0.4 ? Math.sin(v.fPh + (k % 4 === 0 || k % 4 === 3 ? 0 : Math.PI)) * Math.min(0.7, 0.2 + sp * 0.03) : 0; });
      if (fa.dragon) {
        const D = fa.dragon; flap(D, air ? t * (sp > 20 ? 6 : 4) : t * 0.8, air ? 0.75 : 0.08, air ? undefined : -0.5);
        D.legs.forEach((l, k) => { l.rotation.x = air ? -0.9 : sp > 0.4 ? Math.sin(v.fPh + (k % 3 ? Math.PI : 0)) * 0.6 : 0; });
        D.front.rotation.x = air ? -0.15 : Math.sin(t * 1.2) * 0.05;
        if (air && Math.random() < dt * 0.4 && L.keys && L.keys.Space && P.vehicle === v) { const hp = new T.Vector3(); D.head.getWorldPosition(hp); for (let k = 0; k < 14; k++) L.fx(k % 2 ? '#ffb030' : '#ff5020', hp.x + Math.sin(v.yaw) * 3, hp.y, hp.z + Math.cos(v.yaw) * 3, 2, 10, { basic: true, size: 0.8, life: 0.7 }); }
      }
      if (fa.carpet) { const a = fa.carpet.geo.attributes.position, b = fa.carpet.base; for (let i = 0; i < a.count; i++) a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 4 + b[i * 3 + 2] * 1.6) * (air ? 0.12 : 0.04); a.needsUpdate = true; }
      if (fa.sparkle && air && Math.random() < dt * 25) L.fx(L.pick(['#ffe060', '#ff80d0', '#a0e0ff']), v.x - Math.sin(v.yaw) * 1.3, (v.alt || 0) + 0.9, v.z - Math.cos(v.yaw) * 1.3, 1, 0.6, { basic: true, size: 0.15, life: 0.9 });
    }
  }
  // Wo die Fahrzeuge stehen
  const VSPOTS = [['mf_kutsche', 'dorf', 30, -45, 0], ['mf_kutsche', 'schloss', -30, 40, 0], ['mf_einhorn', 'dorf', -50, -40, 0.5], ['mf_einhorn', 'dorf', -56, -36, 0.4], ['mf_einhorn', 'see', -170, 0, 1.2], ['mf_einhorn', 'fee', 15, 10, 2],
    ['mf_teppich', 'dorf', 55, 20, -1], ['mf_teppich', 'platz', 20, 25, 0], ['mf_besen', 'lebkuchen', 12, 14, 0.3], ['mf_besen', 'dorf', -30, 50, 2.2], ['mf_drache', 'dorf', 90, 40, -0.6], ['mf_drache', 'hoehle', 120, 140, 0.8], ['mf_drache', 'eis', -90, 120, 2.5],
    ['mf_einhorn', 'schloss', 40, 45, 0.3], ['mf_einhorn', 'rapunzel', 25, -15, 1], ['mf_einhorn', 'platz', -25, 30, 2.5], ['mf_einhorn', 'oma', 25, 15, 0.8],
    ['mf_pegasus', 'dorf', -70, 10, 1.5], ['mf_pegasus', 'see', -175, 30, 0.2], ['mf_pegasus', 'eis', -110, 60, 3]];
  function spawnFairyVehicles(g2) {
    for (const [type, at, dx, dz, yaw] of VSPOTS) {
      const p = LOC[at]; g2.spawnVehicle({ type, x: p.x + dx, z: p.z + dz, yaw });
      const v = E.vehicles[E.vehicles.length - 1]; if (v && v.type === type) v.isl = FW;
    }
  }

  // ---------- Monster: friedlich ----------
  const KINDS = [['viktor', 12], ['daniel', 6], ['blockling', 6], ['capydaniel', 6], ['walross', 5], ['marsianer', 4], ['rollerviktor', 4], ['langer', 2], ['greifer', 2], ['rufer', 2]];
  function populate() {
    FW.populated = true;
    if (isClient()) return;
    const g2 = L._g; if (!g2) return;
    const spot = () => { for (let k = 0; k < 40; k++) { const a = Math.random() * 6.283, d = 80 + Math.sqrt(Math.random()) * (FR - 160), x = FX + Math.sin(a) * d, z = FZ + Math.cos(a) * d; if (!L.queryBoxes(x, z, 2).length && Math.hypot(x - LOC.dorf.x, z - LOC.dorf.z) > 120 && Math.hypot(x - P.x, z - P.z) > 60) return [x, z]; } return [FX + 200, FZ]; };
    for (const [k, n] of KINDS) for (let i = 0; i < n; i++) {
      if (!L.MK || !L.MK[k]) continue;
      const [x, z] = spot(), m = g2.spawnMonster(k, x, z, k === 'viktor' ? L.pick(['grey', 'red', 'blue', 'lange']) : k === 'walross' && L.WALROSS_VARS ? L.pick(L.WALROSS_VARS) : undefined);
      m.isl = FW; if (k !== 'walross') L.tintRig(m.rig.root, FW.monTint, 0.35);
    }
    if (g2.spawnVehicle) spawnFairyVehicles(g2);
  }

  // ---------- Tägliche Nebenquests ----------
  let dayFmt = null; try { dayFmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }); } catch (e) { dayFmt = null; }
  const today = () => (dayFmt ? dayFmt.format(new Date()) : new Date().toDateString());
  const TIERS = [{ id: 1, n: '⭐ Leicht', c: '#7ae07a' }, { id: 2, n: '⭐⭐ Mittel', c: '#ffd860' }, { id: 3, n: '⭐⭐⭐ Schwer', c: '#ff9a50' }, { id: 4, n: '👑 Episch', c: '#d890ff' }];
  const ITEMS = {
    pilz: { n: 'Zauberpilze', i: '🍄', c: '#ff60d0', at: () => ({ x: FX - 700, z: FZ + 200, r: 320 }) },
    blume: { n: 'Mondblumen', i: '🌸', c: '#a0c8ff', at: () => ({ x: LAKE.x, z: LAKE.z, r: LAKE.r + 90, ring: LAKE.r + 10 }) },
    apfel: { n: 'goldene Äpfel', i: '🍎', c: '#ffd040', at: () => ({ x: FX, z: FZ - 720, r: 120 }) },
    kristall: { n: 'Eiskristalle', i: '💎', c: '#80e8ff', at: () => ({ x: LOC.eis.x, z: LOC.eis.z, r: 240, ring: 70 }) },
    schuppe: { n: 'Drachenschuppen', i: '🐉', c: '#ff5040', at: () => ({ x: CAVE.x, z: CAVE.z, r: CAVE.r - 6 }) },
    stern: { n: 'Sternenstaub', i: '⭐', c: '#fff070', at: () => ({ x: STALK.x, z: STALK.z, r: STALK.r - 8, y: STALK.top, ring: 8 }) },
    edel: { n: 'Zwergen-Edelsteine', i: '💠', c: '#60ff90', at: () => ({ x: LOC.mine.x, z: LOC.mine.z + 60, r: 70 }) }
  };
  const PLACES = ['schloss', 'eis', 'hoehle', 'lebkuchen', 'oma', 'rapunzel', 'wolke', 'see', 'mine', 'muehle', 'brunnen', 'fee'];
  const MON_N = { viktor: 'Viktoren', daniel: 'Daniels', blockling: 'Blocklinge', capydaniel: 'Capybara-Daniels', walross: 'Walrosse', marsianer: 'Marsianer', rollerviktor: 'Roller-Viktoren', greifer: 'Greifer' };
  function rng(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  function makeQuests(day) {
    const r = rng('maerchen-' + day), pick = (a) => a[Math.floor(r() * a.length)], out = [];
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const gens = {
      1: [
        () => { const it = pick(['pilz', 'blume']), n = 5 + Math.floor(r() * 3); return { type: 'collect', item: it, need: n, title: n + ' ' + ITEMS[it].n + ' sammeln', desc: ITEMS[it].i + ' Sammle ' + n + ' ' + ITEMS[it].n + (it === 'pilz' ? ' im Zauberwald.' : ' am Ufer des Spiegelsees.') }; },
        () => { const n = 3 + Math.floor(r() * 2); return { type: 'kill', need: n, title: n + ' Monster besiegen', desc: '⚔️ Besiege ' + n + ' Monster in der Märchenwelt. (Sie sind friedlich, bis du angreifst!)' }; },
        () => { const p = pick(['oma', 'lebkuchen', 'brunnen', 'muehle', 'fee']); return { type: 'visit', places: [p], need: 1, title: (p === 'oma' ? 'Korb zu Großmutter bringen' : 'Besuche: ' + LOC[p].n.replace(/^\S+ /, '')), desc: p === 'oma' ? '🧺 Rotkäppchen ist krank – bring ihren Korb zu Großmutters Haus im Westen.' : '🗺️ Geh zu ' + LOC[p].n + '.' }; },
        () => ({ type: 'pet', need: 2, title: '2 Einhörner streicheln', desc: '🦄 Finde 2 Einhörner auf den Wiesen und streichle sie (E).' }),
        () => ({ type: 'beyza', need: 1, title: 'Sag BEYZA Hallo', desc: '💖 Finde die Riesin BEYZA und sprich mit ihr (E in der Nähe ihrer Füße).' })
      ],
      2: [
        () => { const it = pick(['apfel', 'kristall', 'edel']), n = 8 + Math.floor(r() * 4); return { type: 'collect', item: it, need: n, title: n + ' ' + ITEMS[it].n + ' sammeln', desc: ITEMS[it].i + ' Sammle ' + n + ' ' + ITEMS[it].n + (it === 'apfel' ? ' im Obstgarten vor dem Königsschloss.' : it === 'kristall' ? ' rund um das Kristallschloss.' : ' bei der Zwergenmine.') }; },
        () => { const n = 8 + Math.floor(r() * 4); return { type: 'kill', need: n, title: n + ' Monster besiegen', desc: '⚔️ Besiege ' + n + ' Monster. Zusammen mit Freunden zählt jeder Treffer in der Nähe!' }; },
        () => { const ps = shuffle(PLACES.filter((p) => p !== 'wolke' && p !== 'hoehle')).slice(0, 3); return { type: 'visit', places: ps, need: 3, title: 'Märchen-Rundreise (3 Orte)', desc: '🗺️ Besuche: ' + ps.map((p) => LOC[p].n).join(', ') + '.' }; },
        () => ({ type: 'climb', places: ['rapunzel'], need: 1, title: 'Auf den Rapunzelturm', desc: '🗼 Klettere am goldenen Zopf auf den Rapunzelturm (E am Zopf).' }),
        () => ({ type: 'collect', item: 'apfel', need: 3, then: 'baby', title: 'Babydrache Funki füttern', desc: '🐲 Pflücke 3 goldene Äpfel im Obstgarten und bring sie Funki ins Dorf (E bei Funki).' }),
        () => ({ type: 'pet', need: 5, title: '5 Einhörner streicheln', desc: '🦄 Streichle 5 verschiedene Einhörner (E).' })
      ],
      3: [
        () => { const n = 6 + Math.floor(r() * 3); return { type: 'collect', item: 'schuppe', need: n, title: n + ' Drachenschuppen', desc: '🐉 Schleich in die Drachenhöhle und sammle ' + n + ' Schuppen – ohne den roten Drachen zu wecken!' }; },
        () => { const n = 6 + Math.floor(r() * 3); return { type: 'collect', item: 'stern', need: n, title: n + '× Sternenstaub', desc: '⭐ Kletter die Riesenbohnenranke hoch und sammle ' + n + '× Sternenstaub im Wolkenpalast.' }; },
        () => { const n = 15 + Math.floor(r() * 6); return { type: 'kill', need: n, title: n + ' Monster besiegen', desc: '⚔️ Besiege ' + n + ' Monster – am besten mit Freunden.' }; },
        () => { const k = pick(['greifer', 'walross', 'marsianer', 'capydaniel']), n = k === 'greifer' ? 2 : 4; return { type: 'kill', kind: k, need: n, title: n + ' ' + MON_N[k] + ' besiegen', desc: '⚔️ Jage gezielt ' + n + ' ' + MON_N[k] + ' in der Märchenwelt.' }; },
        () => { const ps = shuffle(PLACES).slice(0, 5); return { type: 'visit', places: ps, need: 5, time: 420, title: 'Wettlauf: 5 Orte in 7 Minuten', desc: '⏱️ Besuche in 7 Minuten: ' + ps.map((p) => LOC[p].n).join(', ') + '.' }; }
      ],
      4: [
        () => ({ type: 'kill', need: 30, title: 'Monsterjäger: 30 Monster', desc: '👑 Besiege 30 Monster in der Märchenwelt. Mit Freunden geht es schneller!' }),
        () => ({ type: 'collect', item: 'schuppe', need: 12, time: 480, title: 'Drachenschatz in 8 Minuten', desc: '👑 Sammle 12 Drachenschuppen in nur 8 Minuten.' }),
        () => { const ps = PLACES.slice(); return { type: 'visit', places: ps, need: ps.length, time: 900, title: 'Große Märchenreise (alle Orte)', desc: '👑 Besuche in 15 Minuten alle ' + ps.length + ' Orte – auch Wolkenpalast und Drachenhöhle.' }; }
      ]
    };
    const plan = [[1, 4], [2, 4], [3, 3], [4, 1]], REW = { 1: [120, 220], 2: [320, 520], 3: [750, 1150], 4: [1900, 2600] };
    let idx = 0;
    for (const [tier, n] of plan) { const gl = shuffle(gens[tier]); for (let i = 0; i < n; i++) { const q = gl[i % gl.length](); q.tier = tier; q.reward = Math.round((REW[tier][0] + r() * (REW[tier][1] - REW[tier][0])) / 10) * 10; q.id = day + '#' + idx++; out.push(q); } }
    return out;
  }
  let QD = null; // { day, list, active: Map(id → state) }
  function qstate() {
    const d = today();
    if (!QD || QD.day !== d) {
      const sv = L.save.fq && L.save.fq.day === d ? L.save.fq : { day: d, done: [], active: {} };
      L.save.fq = sv; QD = { day: d, list: makeQuests(d), sv };
      for (const id of Object.keys(sv.active)) if (!QD.list.find((q) => q.id === id)) delete sv.active[id];
      clearPickups(); for (const id of Object.keys(sv.active)) spawnPickups(QD.list.find((q) => q.id === id), sv.active[id]);
    }
    return QD;
  }
  const qById = (id) => qstate().list.find((q) => q.id === id);
  // Sammel-Gegenstände
  const pickups = [];
  function clearPickups(id) { for (let i = pickups.length - 1; i >= 0; i--) if (!id || pickups[i].qid === id) { if (g) g.remove(pickups[i].m); pickups.splice(i, 1); } }
  function itemMesh(it) {
    const I = ITEMS[it], grp = new T.Group(), em = { emissive: I.c, ei: 0.8 };
    if (it === 'pilz') { add(G().cylB, '#f4ecd8', 0.12, 0.4, 0.12, 0, 0, 0, grp); add(G().sph, I.c, 0.35, 0.22, 0.35, 0, 0.4, 0, grp, em); }
    else if (it === 'blume') { for (let k = 0; k < 5; k++) add(G().sph, I.c, 0.18, 0.06, 0.3, Math.sin(k * 1.256) * 0.2, 0.5, Math.cos(k * 1.256) * 0.2, grp, em).rotation.y = k * 1.256; add(G().cylB, '#4aa040', 0.04, 0.5, 0.04, 0, 0, 0, grp); }
    else if (it === 'apfel') add(G().sph, I.c, 0.3, 0.3, 0.3, 0, 0.4, 0, grp, em);
    else if (it === 'schuppe') add(new T.CylinderGeometry(0.4, 0.4, 0.08, 6), I.c, 1, 1, 1, 0, 0.5, 0, grp, em).rotation.x = 1.2;
    else add(new T.OctahedronGeometry(0.35), I.c, 1, 1.4, 1, 0, 0.6, 0, grp, em);
    const halo = new T.Mesh(G().sph, new T.MeshBasicMaterial({ color: I.c, transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(0.8); halo.position.y = 0.5; grp.add(halo);
    return grp;
  }
  function spawnPickups(q, st) {
    if (!q || q.type !== 'collect' || !g) return;
    const A = ITEMS[q.item].at(), left = q.need - (st.prog || 0); let made = 0, tries = 0;
    while (made < left + 3 && tries++ < 400) {
      const a = Math.random() * 6.283, d = (A.ring || 0) + Math.sqrt(Math.random()) * (A.r - (A.ring || 0)), x = A.x + Math.sin(a) * d, z = A.z + Math.cos(a) * d;
      if (!A.y && L.queryBoxes(x, z, 0.8).length) continue;
      const m = itemMesh(q.item); m.position.set(x, (A.y || 0) + 0.1, z); g.add(m); pickups.push({ qid: q.id, m, x, z, y: A.y || 0, ph: Math.random() * 6 }); made++;
    }
  }
  function persistQ() { if (L.persist) L.persist(); }
  function acceptQuest(id) {
    const S = qstate(), q = qById(id); if (!q || S.sv.done.includes(id) || S.sv.active[id]) return;
    if (Object.keys(S.sv.active).length >= 3) { L.msg('📜 Du kannst höchstens 3 Quests gleichzeitig haben.', 3000); return; }
    const st = { prog: 0, t0: Date.now(), seen: [] }; S.sv.active[id] = st; spawnPickups(q, st); persistQ();
    L.msg('📜 Quest angenommen: ' + q.title, 3000); L.snd.pickup && L.snd.pickup();
    if (L.mp && L.mp.send && L.net && L.net.connected) L.mp.send({ t: 'msg', text: '📜 ' + ((L.save.char || {}).name || 'Ein Mitspieler') + ' hat die Quest „' + q.title + '“ angenommen – macht mit!' });
  }
  function dropQuest(id) { const S = qstate(); delete S.sv.active[id]; clearPickups(id); persistQ(); renderBoard(); }
  function friendsHere() { let n = 0; for (const r of (L.remotes ? L.remotes.values() : [])) if (r.inRound && !r.gone && L.inFairy(r.x, r.z)) n++; return n; }
  function completeQuest(q) {
    const S = qstate(); delete S.sv.active[q.id]; S.sv.done.push(q.id); clearPickups(q.id);
    const fr = friendsHere(), coins = Math.round(q.reward * (fr ? 1.3 : 1));
    L.banner('✅ QUEST GESCHAFFT!', q.title + ' – +' + coins + ' Münzen' + (fr ? ' (Freunde-Bonus +30 %)' : ''));
    if (L.gotBossCoins) L.gotBossCoins(coins, 'die Quest „' + q.title + '“'); else { L.save.coins = (L.save.coins || 0) + coins; }
    if (L.snd.codeOk) L.snd.codeOk();
    for (let k = 0; k < 30; k++) L.fx(['#ff80c0', '#ffe060', '#80e0ff', '#a0ff80'][k % 4], P.x, (P.y || 0) + 1.5, P.z, 1, 6, { basic: true, size: 0.25, life: 1.4 });
    persistQ(); renderBoard();
  }
  function progress(q, st, n) { st.prog = Math.min(q.need, (st.prog || 0) + (n || 1)); persistQ(); if (st.prog >= q.need && !q.then) completeQuest(q); else L.msg('📜 ' + q.title + ': ' + st.prog + ' / ' + q.need + (st.prog >= q.need && q.then ? ' – jetzt zu ' + LOC[q.then].n + '!' : ''), 1800); }
  // Kills zählen: alle Monster der Märchenwelt, die in deiner Nähe sterben (auch durch Freunde)
  const deadSeen = new Set();
  function checkKills() {
    for (const m of E.monsters) {
      if (!m.dead || deadSeen.has(m.key)) continue;
      deadSeen.add(m.key);
      if (!L.inFairy(m.x, m.z) || Math.hypot(m.x - P.x, m.z - P.z) > 220) continue;
      const S = qstate();
      for (const id of Object.keys(S.sv.active)) { const q = qById(id), st = S.sv.active[id]; if (q && q.type === 'kill' && (!q.kind || q.kind === m.kind)) progress(q, st); }
    }
    if (deadSeen.size > 2000) deadSeen.clear();
  }
  function visitedAt(p) {
    const Lc = LOC[p]; if (!Lc) return false;
    const d = Math.hypot(P.x - Lc.x, P.z - Lc.z);
    if (p === 'wolke') return d < 40 && (P.y || 0) > 150;
    if (p === 'rapunzel') return d < 12;
    if (p === 'hoehle') return Math.hypot(P.x - CAVE.x, P.z - CAVE.z) < CAVE.r;
    if (p === 'schloss') return d < 90;
    if (p === 'eis' || p === 'mine') return d < 80;
    if (p === 'see') return d < LAKE.r + 15;
    return d < 25;
  }
  function updateQuests(dt) {
    const S = qstate();
    checkKills();
    for (const id of Object.keys(S.sv.active)) {
      const q = qById(id), st = S.sv.active[id]; if (!q) continue;
      if (q.time && (Date.now() - st.t0) / 1000 > q.time) { delete S.sv.active[id]; clearPickups(id); persistQ(); L.banner('⏱️ ZEIT ABGELAUFEN', q.title + ' – du kannst sie an der Quest-Tafel neu starten.'); continue; }
      if (q.type === 'visit') for (const p of q.places) if (!st.seen.includes(p) && visitedAt(p)) { st.seen.push(p); progress(q, st); if (!S.sv.active[id]) break; }
      if (q.type === 'climb' && (P.y || 0) > 40 && Math.hypot(P.x - TOWER.x, P.z - TOWER.z) < 12) progress(q, st, q.need);
    }
    // Gegenstände einsammeln
    const t = performance.now() / 1000;
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i]; p.m.rotation.y += dt * 2; p.m.position.y = p.y + 0.1 + Math.sin(t * 2 + p.ph) * 0.15;
      if (Math.hypot(P.x - p.x, P.z - p.z) < 2.2 && Math.abs((P.y || 0) - p.y) < 3 && P.alive) {
        const q = qById(p.qid), st = S.sv.active[p.qid]; if (!q || !st) { g.remove(p.m); pickups.splice(i, 1); continue; }
        if (st.prog >= q.need) continue;
        g.remove(p.m); pickups.splice(i, 1); L.snd.pickup && L.snd.pickup();
        for (let k = 0; k < 10; k++) L.fx(ITEMS[q.item].c, p.x, p.y + 0.6, p.z, 1, 3, { basic: true, size: 0.15, life: 0.8 });
        if (q.item === 'schuppe' && Math.random() < 0.25) L.msg('🐉 Der Drache schnarcht laut … pssst!', 2000);
        progress(q, st);
      }
    }
    renderTracker();
  }
  // Quest-Anzeige rechts
  const trk = document.createElement('div'); trk.id = 'fqTrk';
  trk.style.cssText = 'position:fixed;right:10px;top:130px;z-index:25;pointer-events:none;font:13px Arial,sans-serif;color:#fff;background:rgba(60,20,70,.55);border:1px solid rgba(255,190,240,.5);padding:6px 10px;border-radius:10px;max-width:260px;display:none;text-shadow:0 1px 2px #000';
  document.body.appendChild(trk);
  const cst = document.createElement('style'); cst.textContent = 'body.cinema #fqTrk{visibility:hidden} #fqBoard{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;background:rgba(20,5,30,.6)} #fqBoard .bx{background:linear-gradient(#fff8ec,#f4e4cc);color:#3a2418;border:4px solid #8a5a30;border-radius:14px;width:min(720px,94vw);max-height:86vh;overflow:auto;padding:14px 16px;font:14px Arial,sans-serif;box-shadow:0 10px 40px #000} #fqBoard h2{margin:0 0 4px;font-size:22px} #fqBoard .q{display:flex;gap:10px;align-items:center;border-radius:10px;padding:8px 10px;margin:6px 0;background:#fff;border-left:6px solid #ccc} #fqBoard .q .t{flex:1} #fqBoard .q b{font-size:15px} #fqBoard .q small{display:block;color:#6a5040;margin-top:2px} #fqBoard button{font:bold 13px Arial;padding:7px 12px;border-radius:8px;border:0;cursor:pointer;background:#8a5a30;color:#fff;white-space:nowrap} #fqBoard button.dn{background:#5aa05a} #fqBoard button.x{background:#a84040} #fqBoard .hd{display:flex;justify-content:space-between;align-items:center;gap:8px}';
  document.head.appendChild(cst);
  let trkHtml = '';
  function renderTracker() {
    if (!inF() || L.state !== 'game') { trk.style.display = 'none'; return; }
    const S = qstate(), ids = Object.keys(S.sv.active);
    let h = '<b>📜 Märchen-Quests</b> <span style="opacity:.8">(' + S.sv.done.length + '/' + S.list.length + ' heute)</span>';
    if (!ids.length) h += '<br><span style="opacity:.85">Nimm Quests an der 📜 Quest-Tafel im Dorf an.</span>';
    for (const id of ids) { const q = qById(id), st = S.sv.active[id]; if (!q) continue; const tl = q.time ? ' ⏱️' + L.fmt(q.time - (Date.now() - st.t0) / 1000) : ''; h += '<br>• ' + q.title + ': <b>' + (st.prog || 0) + '/' + q.need + '</b>' + tl + (q.type === 'visit' ? '<br><span style="opacity:.8;font-size:11px">&nbsp;&nbsp;offen: ' + q.places.filter((p) => !st.seen.includes(p)).map((p) => LOC[p].n).join(', ') + '</span>' : ''); }
    if (h !== trkHtml) { trkHtml = h; trk.innerHTML = h; }
    trk.style.display = 'block';
  }
  // Quest-Tafel
  const board = document.createElement('div'); board.id = 'fqBoard'; document.body.appendChild(board);
  function renderBoard() {
    if (board.style.display !== 'flex') return;
    const S = qstate(), nA = Object.keys(S.sv.active).length;
    let h = '<div class="bx"><div class="hd"><h2>📜 Quest-Tafel der Märchenwelt</h2><button class="x" data-c="1">✖ Schließen</button></div>';
    h += '<div>Jeden Tag neue Abenteuer (Neustart um Mitternacht). Höchstens 3 gleichzeitig · aktiv: <b>' + nA + '/3</b> · geschafft heute: <b>' + S.sv.done.length + '/' + S.list.length + '</b><br>👥 Mit Freunden: Monster, die eure Gruppe in deiner Nähe besiegt, zählen für alle – und es gibt +30 % Münzen.</div>';
    for (const T0 of TIERS) {
      h += '<h3 style="margin:10px 0 2px;color:#5a3a20">' + T0.n + '</h3>';
      for (const q of S.list.filter((x) => x.tier === T0.id)) {
        const done = S.sv.done.includes(q.id), act = S.sv.active[q.id];
        h += '<div class="q" style="border-left-color:' + T0.c + '"><div class="t"><b>' + q.title + '</b> <span style="color:#a07010;font-weight:bold">🪙 ' + q.reward + '</span><small>' + q.desc + '</small></div>' +
          (done ? '<button class="dn" disabled>✅ Geschafft</button>' : act ? '<button class="x" data-d="' + q.id + '">Abbrechen (' + (act.prog || 0) + '/' + q.need + ')</button>' : '<button data-a="' + q.id + '"' + (nA >= 3 ? ' disabled style="opacity:.5"' : '') + '>Annehmen</button>') + '</div>';
      }
    }
    board.innerHTML = h + '</div>';
  }
  board.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) { if (e.target === board) closeBoard(); return; } if (b.dataset.c) closeBoard(); else if (b.dataset.a) { acceptQuest(b.dataset.a); renderBoard(); } else if (b.dataset.d) dropQuest(b.dataset.d); });
  function openBoard() { board.style.display = 'flex'; L.uiBlock = true; if (L.unlock) L.unlock(); renderBoard(); }
  function closeBoard() { if (board.style.display !== 'flex') return; board.style.display = 'none'; L.uiBlock = false; if (L.state === 'game' && !L.paused && L.lock) L.lock(); }
  addEventListener('keydown', (e) => { if (board.style.display === 'flex' && (e.code === 'Escape' || e.code === 'KeyE')) { closeBoard(); e.preventDefault(); e.stopPropagation(); } }, true);
  L.fairyOpenBoard = openBoard;
  // Wegweiser
  L.fairyWaypoints = function () {
    const out = [], S = qstate();
    for (const id of Object.keys(S.sv.active)) {
      const q = qById(id), st = S.sv.active[id]; if (!q) continue;
      if (q.type === 'visit' || q.type === 'climb') { for (const p of q.places) if (!st.seen.includes(p)) out.push([LOC[p].x, LOC[p].z, LOC[p].n.split(' ')[0], LOC[p].n.replace(/^\S+ /, '')]); }
      else if (q.type === 'collect') { if (st.prog >= q.need && q.then) out.push([LOC[q.then].x, LOC[q.then].z, '🐲', 'Funki']); else { const A = ITEMS[q.item].at(); out.push([A.x, A.z, ITEMS[q.item].i, ITEMS[q.item].n]); } }
      else if (q.type === 'beyza' && built) out.push([built.bey.root.position.x, built.bey.root.position.z, '💖', 'BEYZA']);
    }
    out.push([LOC.brett.x, LOC.brett.z, '📜', 'Quest-Tafel']);
    if (!out.length || Math.hypot(P.x - LOC.ring.x, P.z - LOC.ring.z) > 300) out.push([LOC.ring.x, LOC.ring.z, '🍄', 'Heimweg']);
    return out;
  };

  // ---------- E-Taste: Tafel, Feenkreis, BEYZA, Einhörner, Funki, Zopf, Ranke ----------
  let climb = null;
  function nearThing() {
    if (!built || !inF() || P.vehicle || climb) return null;
    const y = P.y || 0;
    if (Math.hypot(P.x - LOC.brett.x, P.z - LOC.brett.z) < 5) return { k: 'board', t: 'E: 📜 Quest-Tafel ansehen' };
    if (Math.hypot(P.x - LOC.ring.x, P.z - LOC.ring.z) < 7) return { k: 'ring', t: 'E: 🍄 Feenkreis – zurück nach Asgard beamen' };
    if (y < 3 && Math.hypot(P.x - built.braid.x, P.z - built.braid.z) < 5) return { k: 'up', t: 'E: 🗼 Am goldenen Zopf hochklettern' };
    if (built.rap && y > 40 && Math.hypot(P.x - built.rapPos.x, P.z - built.rapPos.z) < 2.5) return { k: 'rap', t: 'E: 👸 Mit Rapunzel reden' };
    if (y > 40 && Math.hypot(P.x - (built.braid.x * 0.85 + TOWER.x * 0.15), P.z - (built.braid.z * 0.85 + TOWER.z * 0.15)) < 3.2) return { k: 'down', t: 'E: 🗼 Am Zopf wieder runterklettern' };
    if (y < 3 && Math.hypot(P.x - STALK.x, P.z - STALK.z) < 7) return { k: 'stalkUp', t: 'E: 🌱 Die Riesenbohnenranke hochklettern' };
    if (y > 150 && Math.hypot(P.x - STALK.x, P.z - STALK.z) < 8) return { k: 'stalkDown', t: 'E: 🌱 Die Ranke wieder runterklettern' };
    if (Math.hypot(P.x - LOC.baby.x, P.z - LOC.baby.z) < 5) return { k: 'baby', t: 'E: 🐲 Funki streicheln / füttern' };
    if (nearBeyza() && !(nearPrince() && Math.hypot(P.x - built.prince.root.position.x, P.z - built.prince.root.position.z) < Math.hypot(P.x - built.bey.root.position.x, P.z - built.bey.root.position.z))) return { k: 'bey', t: 'E: 💖 Mit BEYZA reden' };
    if (nearPrince()) return { k: 'prinz', t: 'E: 🤴 Mit dem Prinzen reden' };
    if (built.fairy && Math.hypot(P.x - LOC.fee.x, P.z - LOC.fee.z) < 5) return { k: 'fee', t: 'E: 🧚 Mit Fee Lumina reden' };
    if (built.rap && y > 40 && Math.hypot(P.x - built.rapPos.x, P.z - built.rapPos.z) < 3.5) return { k: 'rap', t: 'E: 👸 Mit Rapunzel reden' };
    for (const U of built.unis) if (Math.hypot(P.x - U.x, P.z - U.z) < 3.5) return { k: 'uni', u: U, t: 'E: 🦄 Einhorn streicheln' };
    return null;
  }
  const och = L.crateHint, oci = L.crateInteract;
  L.crateHint = () => { const n = nearThing(); return n ? n.t : och ? och() : null; };
  function startClimb(toY, x, z, txt) { climb = { t: 0, toY, x, z }; L.msg(txt, 2000); if (L.backFade) L.backFade.style.background = '#fff8f0'; }
  L.crateInteract = function () {
    const n = nearThing(); if (!n) return oci ? oci() : false;
    const S = qstate(), act = (type) => Object.keys(S.sv.active).map((id) => [qById(id), S.sv.active[id]]).filter(([q]) => q && q.type === type);
    if (n.k === 'board') openBoard();
    else if (n.k === 'ring') { if (L.beamHome) L.beamHome(); }
    else if (n.k === 'up') startClimb(TOWER.h + 0.2, TOWER.x + 3, TOWER.z, '🗼 Du kletterst am goldenen Zopf hoch …');
    else if (n.k === 'down') startClimb(0, built.braid.x + (built.braid.x - TOWER.x) * 0.3, built.braid.z + (built.braid.z - TOWER.z) * 0.3, '🗼 Du rutschst am Zopf hinunter …');
    else if (n.k === 'stalkUp') startClimb(STALK.top + 0.2, STALK.x + 9, STALK.z, '🌱 Du kletterst die Riesenbohnenranke hoch – bis über die Wolken!');
    else if (n.k === 'stalkDown') startClimb(0, STALK.x + 6, STALK.z + 6, '🌱 Du kletterst die Ranke wieder hinunter …');
    else if (n.k === 'baby') {
      const fq = Object.keys(S.sv.active).map((id) => [qById(id), S.sv.active[id]]).find(([q, st]) => q && q.then === 'baby' && st.prog >= q.need);
      if (fq) { L.msg('🐲 Funki mampft die goldenen Äpfel und pustet vor Freude kleine Funken!', 3500); for (let k = 0; k < 20; k++) L.fx('#ffb030', LOC.baby.x, 2.5, LOC.baby.z, 1, 5, { basic: true, size: 0.3, life: 1 }); completeQuest(fq[0]); }
      else L.msg('🐲 Funki schnurrt wie eine Katze und pustet eine winzige Rauchwolke.', 3000);
    } else if (n.k === 'bey') {
      L.msg('💖 BEYZA: ' + BEY_LINES[(Math.random() * BEY_LINES.length) | 0], 6000);
      for (const [q, st] of act('beyza')) progress(q, st, 1);
      const gd = today(); if (L.save.beyGift !== gd) { L.save.beyGift = gd; persistQ(); setTimeout(() => { if (L.gotBossCoins) L.gotBossCoins(150, 'BEYZAS Geschenk des Tages'); }, 1200); }
    } else if (n.k === 'prinz') { L.msg('🤴 Prinz: ' + PR_LINES[(Math.random() * PR_LINES.length) | 0], 6000); for (const [q, st] of act('beyza')) progress(q, st, 1); }
    else if (n.k === 'rap') { const RL = ['„Mein Haar ist 21 Meter lang – das Bürsten dauert jeden Morgen eine Stunde!“', '„Siehst du die schwebenden Laternen? Ich habe sie alle selbst gebastelt.“', '„Von hier oben sehe ich BEYZA und ihren Prinzen jeden Tag spazieren gehen.“', '„Ich male am liebsten den Sonnenaufgang über dem Spiegelsee.“']; L.msg('👸 Rapunzel: ' + RL[(Math.random() * RL.length) | 0], 6000); }
    else if (n.k === 'fee') L.msg('🧚 Fee Lumina: „Im Zauberwald wachsen Zauberpilze, am Spiegelsee die Mondblumen. Und wer die Ranke hochklettert, findet Sternenstaub!“', 7000);
    else if (n.k === 'uni') {
      L.msg('🦄 Das Einhorn schnaubt glücklich und funkelt in allen Regenbogenfarben!', 2500);
      for (let k = 0; k < 14; k++) L.fx(['#ff5a8a', '#ffe04a', '#5ab8ff', '#a070ff'][k % 4], n.u.x, 2.5, n.u.z, 1, 3, { basic: true, size: 0.2, life: 1 });
      for (const [q, st] of act('pet')) { const key = 'u' + n.u.id; if (!st.seen.includes(key)) { st.seen.push(key); progress(q, st); } }
    }
    return true;
  };
  function updateClimb(dt) {
    const c = climb; c.t += dt; const f = L.backFade;
    if (f) f.style.opacity = String(c.t < 0.6 ? c.t / 0.6 : Math.max(0, 1 - (c.t - 0.9) / 0.6));
    P.vx = P.vz = 0;
    if (c.t > 0.7 && !c.done) { c.done = true; P.x = c.x; P.z = c.z; P.y = c.toY; P.vy = 0; P.air = c.toY > 0.5; P.spawnProt = Math.max(P.spawnProt || 0, 2); }
    if (c.t > 1.6) { climb = null; if (f) f.style.opacity = '0'; }
  }

  // ---------- betreten / verlassen ----------
  let wasIn = false;
  L.fairyEnter = function () {
    if (!built) build();
    const s0 = ARRIVE(); P.x = s0.x; P.z = s0.z; P.y = 2; P.vx = P.vz = P.vy = 0; P.air = true; P.flying = 0; P.swim = false;
    P.spawnProt = Math.max(P.spawnProt || 0, 5);
  };
  L.fairyLeft = function () { renderTracker(); };
  function onEnter() {
    if (!built) build();
    if (!FW.populated) populate();
    L.banner('🏰 DIE MÄRCHENWELT', 'Monster sind hier friedlich – außer du greifst sie an. Die 📜 Quest-Tafel im Dorf hat jeden Tag neue Abenteuer. Heimweg: 🍄 Feenkreis oder Pause-Menü.');
    setTimeout(() => { if (inF()) L.msg('💖 Irgendwo hier spaziert BEYZA herum – die riesige, liebe Riesin. Sag ihr Hallo!', 6000); }, 5000);
    setTimeout(() => { if (inF()) L.msg('🦄 Märchen-Fahrzeuge: Kürbiskutsche, Einhörner, fliegende Teppiche, Hexenbesen und Reitdrachen (fliegen: E hoch, C runter).', 7000); }, 11000);
    L.music && L.music.set && L.music.set('calm');
  }
  function beamBtn(on) { const b = L.$ && L.$('pBeam'); if (!b) return; if (on) b.hidden = false; else if (!(L.inBack && L.inBack(P.x))) b.hidden = true; }

  // ---------- jedes Bild ----------
  L.updateFairy = function (dt) {
    const here = inF();
    // Host: Monster erst anlegen, wenn jemand (auch ein Mitspieler) hier ist
    if (!FW.populated && !isClient() && L._g && L._g.players && L._g.players().some((p) => L.inFairy(p.x, p.z))) { if (!built) build(); populate(); }
    if (here !== wasIn) { wasIn = here; if (here) onEnter(); else L.fairyLeft(); beamBtn(here); }
    if (!built) { trk.style.display = 'none'; return; }
    const camIn = L.camera && L.inFairy(L.camera.position.x, L.camera.position.z) && L.camera.position.y < 1000;
    built.g.visible = camIn || here; built.sky.visible = camIn;
    if (!here && !camIn) { trk.style.display = 'none'; return; }
    const t = performance.now() / 1000;
    if (climb) updateClimb(dt);
    updateLife(dt, t);
    updateFairyVehicles(dt, t);
    updateBeyza(dt);
    updateQuests(dt);
    // von der Welt gefallen → zurück ins Dorf
    if (here && P.alive && (P.y || 0) < -60 && !P.vehicle) { const s0 = ARRIVE(); P.x = s0.x; P.z = s0.z; P.y = 2; P.vy = 0; P.air = true; L.hurtPlayer && L.hurtPlayer(15, 'Von der Märchenwelt gefallen'); L.msg('☁️ Du bist von der Welt gefallen – eine Fee hat dich ins Dorf zurückgebracht.', 4000); }
  };
  L.fairyBeyza = () => (built ? { x: built.bey.root.position.x, z: built.bey.root.position.z } : null);
  L.fairyText = function () {
    if (!built) return '💖 BEYZA spaziert durch die Märchenwelt';
    const d = Math.hypot(P.x - built.bey.root.position.x, P.z - built.bey.root.position.z);
    return '💖 BEYZA & 🤴 ihr Prinz – Hand in Hand · ' + (d > 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m') + ' entfernt';
  };
  // Licht und Himmel
  const oue = L.updateEnv, C1 = new T.Color(), C2 = new T.Color();
  // Fenster und Leuchtteile (gemeinsame Materialien), die nachts heller werden
  const GLOW = [['#ffe9a0', { emissive: '#ffcf60', ei: 0.4 }], ['#3a4a9a', { emissive: '#6a7aff', ei: 0.4 }], ['#4a5ab0', { emissive: '#8a9aff', ei: 0.5 }], ['#ffe8f0', { emissive: '#ffc0e0', ei: 0.3 }], ['#3a4a9a', { emissive: '#8a9aff', ei: 0.3 }]];
  L.updateEnv = function (dt, cam, focus, paused) {
    oue(dt, cam, focus, paused);
    if (!cam || !L.inFairy(cam.position.x, cam.position.z) || cam.position.y > 1000) return;
    const E2 = L.env;
    // gleiche Uhrzeit wie in der Heimat: Tag, Abendrot, Sternennacht mit großem Mond
    const a = ((E2.time || 12) - 6) / 24 * Math.PI * 2, el = Math.sin(a), day = L.clamp(el * 4 + 0.25, 0, 1), night = 1 - day, dusk = L.clamp(1 - Math.abs(el) * 5, 0, 1) * 0.85;
    const mix3 = (d, du, n) => C1.set(n).lerp(C2.set(d), day).lerp(C2.set(du), dusk * Math.max(day, 0.35));
    L.scene.background.copy(mix3('#a8c8ff', '#f0a080', '#0a0e2a'));
    L.scene.fog.color.copy(mix3('#f6dcf0', '#ffb890', '#141638')); L.scene.fog.near = 500; L.scene.fog.far = 4200 - night * 1200;
    if (E2.stars) E2.stars.material.opacity = L.clamp(night * 1.3 - 0.2, 0, 1); if (E2.sunDisc) E2.sunDisc.material.opacity = 0; if (E2.moon) E2.moon.material.opacity = 0; if (E2.rainMesh) E2.rainMesh.visible = false;
    E2.hemi.intensity = 0.38 + day * 0.34; E2.hemi.color.copy(mix3('#fff0f4', '#ffc8a8', '#7a80d8')); E2.hemi.groundColor.copy(mix3('#d8c4b8', '#c09080', '#302a58'));
    E2.sun.intensity = 0.3 + day * 0.55; E2.sun.color.copy(mix3('#ffecd8', '#ffa070', '#a8b8ff'));
    if (built && built.sky) {
      const W0 = built; W0.sky.position.copy(cam.position);
      W0.sky.material.color.copy(mix3('#ffffff', '#ffc0a0', '#1c2250'));
      W0.sun.material.opacity = day; W0.sun.position.y = 300 + day * 1600; W0.moon.material.opacity = L.clamp(night * 1.4 - 0.3, 0, 1);
      const cc = mix3('#ffffff', '#ffd0b8', '#4a5088'); for (const m of W0.cloudM) m.color.copy(cc);
      // nachts leuchtet alles Magische stärker
      W0.fliesM.size = 0.9 + night * 1.1; W0.fliesM.opacity = 0.6 + night * 0.4;
      W0.ringCol.material.opacity = (0.14 + Math.sin(performance.now() / 500) * 0.06) * (1 + night * 1.6);
      W0.crystalL.intensity = 2 + night * 3; W0.villageL.intensity = night * 1.2;
      for (const [c, o] of GLOW) L.mat(c, o).emissiveIntensity = o.ei + night * 1.3;
    }
  };
  // Pause-Menü-Taste „Zurück beamen“ auch hier
  L.clearFairy = function () {
    FW.populated = false; deadSeen.clear(); climb = null; wasIn = false; closeBoard(); trk.style.display = 'none';
  };
})();
