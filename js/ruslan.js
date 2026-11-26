'use strict';
// Mystery Island mit RUSLAN (eigener Entwurf): Held im blau-weißen Anzug mit Flaggen-Schild und Flaggen-Umhang,
// fährt einen riesigen Bagger. Intro: Schildwurf, dann steigt der Bagger aus dem Boden. 5 Minuten Jagd, 10 Minuten Pause.
// Zuflucht: kleines blau-weiß gestreiftes Häuschen mit goldener Kuppel. Danach: BIG MAMA in goldener Super-Form – Ruslan überfährt sie.
// Außerdem: Roller-Unfall „JOYOR QUALITY“ (man stirbt nicht) und Roller-Viktors, die Werbung rufen.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const I = { id: 'mystery', name: 'Mystery Island', icon: '❓', x: -6500, z: 6500, r: 650, ground: ['#7aa858', '#6a9a4a'], beach: '#f0e2b0', tint: '#b8e0ff', sky: '#a8d0f0', weather: 'klar',
    tree: 'dschungel', treeCol: ['#2e7a3a', '#3a8a40'], bld: 'huette', bldCol: ['#e8e2d0', '#d8d0c0'], mon: ['viktor', 'daniel', 'rollerviktor', 'blockling', 'schwelle', 'starrende'], monTint: '#a0c8ff',
    npc: { top: ['hemd', 'tshirt', 'polo'], topColor: ['#f2f2f2', '#2a6ac0', '#1a3a7a'], hat: ['keine', 'cap'] }, veh: ['jeep', 'pickup', 'motorrad'], vehCol: '#2a6ac0', music: ['tension', 'wander'] };
  L.ISL.push(I); L.ISLANDS.push(I);
  const BS = 1.7, TOP = 23 * BS;
  const SAFE = { x: I.x + 120, z: I.z - 80 }, CENTER = { x: I.x - 60, z: I.z + 60 };
  const onIsland = () => L.curIsland === I || Math.hypot(P.x - I.x, P.z - I.z) < I.r;
  const inSafe = (x, z) => Math.hypot(x - SAFE.x, z - SAFE.z) < 6.5;
  const basic = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const ease = (u) => { u = L.clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const part = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, typeof m === 'string' ? L.mat(m) : m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
  function cv(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return new T.CanvasTexture(c); }
  // Flagge: weiß, zwei blaue Streifen, Davidstern in der Mitte
  function star(g, cx, cy, r, lw, col) { g.strokeStyle = col; g.lineWidth = lw; for (const rot of [0, Math.PI]) { g.beginPath(); for (let k = 0; k < 3; k++) { const a = rot - Math.PI / 2 + k * 2 * Math.PI / 3; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.stroke(); } }
  const flagTex = () => cv(256, 180, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#0038b8'; g.fillRect(0, h * 0.1, w, h * 0.15); g.fillRect(0, h * 0.75, w, h * 0.15); star(g, w / 2, h / 2, h * 0.2, 7, '#0038b8'); });
  const shieldTex = () => cv(256, 256, (g, w, h) => { g.fillStyle = '#0038b8'; g.beginPath(); g.arc(128, 128, 126, 0, 6.3); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 100, 0, 6.3); g.fill(); g.fillStyle = '#0038b8'; g.beginPath(); g.arc(128, 128, 78, 0, 6.3); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 58, 0, 6.3); g.fill(); star(g, 128, 128, 40, 8, '#0038b8'); });

  // ---------- Modelle ----------
  function buildRuslan() {
    const r = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { name: 'Ruslan', skin: '#e2b896', hair: 'kurz', hairColor: '#2a1a10', eyes: '#3a2a1a', brows: 'dick', mouth: 'ernst', beard: 'stoppel', top: 'trikot', topColor: '#1e3f9a', pants: 'skinny', pantsColor: '#1e3f9a', shoeType: 'stiefel', shoes: '#f2f2f2', build: 'kraeftig', height: 'gross' }), true);
    const white = L.mat('#f4f6fa'), blue = L.mat('#1e3f9a');
    // Anzug: weiße Brust mit blauen Streifen, Stern auf der Brust, weiße Handschuhe, Maske
    part(L.GEO.box, white, 0.5, 0.36, 0.26, 0, 0.36, 0.02, r.torso);
    for (const y of [0.26, 0.48]) part(L.GEO.box, blue, 0.51, 0.05, 0.27, 0, y, 0.02, r.torso);
    const st = new T.Mesh(new T.PlaneGeometry(0.2, 0.2), new T.MeshBasicMaterial({ map: cv(64, 64, (g) => { g.clearRect(0, 0, 64, 64); star(g, 32, 32, 26, 6, '#0038b8'); }), transparent: true })); st.position.set(0, 0.37, 0.155); r.torso.add(st);
    part(L.GEO.box, blue, 0.3, 0.12, 0.31, 0, 0.18, 0.005, r.head);
    for (const s of [-1, 1]) { part(L.GEO.box, white, 0.03, 0.08, 0.02, s * 0.15, 0.26, 0.02, r.head); }
    for (const a of r.arms) part(L.GEO.box, white, 0.13, 0.1, 0.13, 0, -0.36, 0, a.elbow);
    // Flaggen-Umhang auf dem Rücken
    const cape = new T.Group(); cape.position.set(0, 0.6, -0.17); r.torso.add(cape);
    const flag = new T.Mesh(new T.PlaneGeometry(0.62, 1.25), new T.MeshLambertMaterial({ map: flagTex(), side: T.DoubleSide })); flag.position.y = -0.63; flag.rotation.y = Math.PI; cape.add(flag); r.cape = cape;
    // Schild am linken Arm
    const sh = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 0.04, 32), [new T.MeshLambertMaterial({ color: 0xc8ccd4 }), new T.MeshLambertMaterial({ map: shieldTex() }), new T.MeshLambertMaterial({ color: 0x8a8e96 })]);
    sh.rotation.x = Math.PI / 2; sh.position.set(0, -0.2, 0.14); r.arms[1].elbow.add(sh); r.shield = sh;
    r.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return r;
  }
  function buildBagger() {
    const g = new T.Group(), yel = L.mat('#e8b020'), dark = L.mat('#2a2a2a'), steel = L.mat('#5a5e64');
    // Ketten
    for (const s of [-1, 1]) {
      part(L.GEO.box, dark, 14, 9, 70, s * 22, 4.5, 0, g);
      for (let k = 0; k < 24; k++) part(L.GEO.box, '#3a3a3a', 14.4, 1.2, 1.4, s * 22, 9, -33 + k * 2.9, g);
      for (let k = 0; k < 5; k++) { const w = part(L.GEO.cyl, steel, 3.6, 15, 3.6, s * 22, 4.5, -26 + k * 13, g); w.rotation.z = Math.PI / 2; }
    }
    const upper = new T.Group(); upper.position.y = 9; g.add(upper);
    part(L.GEO.box, yel, 42, 14, 46, 0, 7, -4, upper);
    part(L.GEO.box, '#c89010', 42, 10, 18, 0, 5, -28, upper); // Gegengewicht
    const cab = part(L.GEO.box, yel, 14, 14, 14, -12, 21, 8, upper);
    part(L.GEO.box, basic(0x80c8ff, { transparent: true, opacity: 0.6 }), 12, 9, 0.3, -12, 23, 15.1, upper);
    part(L.GEO.cyl, dark, 1.4, 12, 1.4, 12, 20, -18, upper);
    // Ausleger, Stiel, Schaufel
    const boom = new T.Group(); boom.position.set(8, 14, 16); upper.add(boom);
    part(L.GEO.box, yel, 6, 6, 48, 0, 0, 24, boom);
    const stick = new T.Group(); stick.position.set(0, 0, 48); boom.add(stick);
    part(L.GEO.box, yel, 5, 5, 34, 0, -2, 17, stick);
    const bucket = new T.Group(); bucket.position.set(0, -4, 34); stick.add(bucket);
    part(L.GEO.box, steel, 16, 10, 8, 0, -5, 3, bucket);
    for (let k = 0; k < 5; k++) part(L.GEO.cone, '#c8c8c8', 1.2, 4, 1.2, -6 + k * 3, -12, 6, bucket).rotation.x = Math.PI;
    for (const s of [-1, 1]) part(L.GEO.cyl, '#8a8e94', 1, 30, 1, s * 4, 4, 20, boom).rotation.x = Math.PI / 2 - 0.3;
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.scale.setScalar(BS); // gigantisch: so groß, dass er Hochhäuser plattmachen könnte
    return { g, upper, boom, stick, bucket, cab };
  }
  function buildSafeHouse() {
    // begehbares Häuschen: feste Wände mit Tür vorne, geschlossenes Dach, innen ein gekachelter Behandlungsraum
    const g = new T.Group(); g.position.set(SAFE.x, 0, SAFE.z);
    const W = 9, H = 7, TH = 0.4, DW = 2.4, DH = 3.4;
    const stripes = cv(256, 256, (c) => { for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? '#2a6ac8' : '#f4f6fa'; c.fillRect(k * 16, 0, 16, 256); } });
    const tiles = cv(256, 256, (c) => { c.fillStyle = '#dfe8e4'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#b8c8c2'; for (let k = 0; k <= 256; k += 32) { c.fillRect(k, 0, 2, 256); c.fillRect(0, k, 256, 2); } for (let k = 0; k < 60; k++) { c.fillStyle = 'rgba(90,70,50,' + (Math.random() * 0.08).toFixed(3) + ')'; c.fillRect(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 10, 3 + Math.random() * 18); } });
    tiles.wrapS = tiles.wrapT = T.RepeatWrapping; tiles.repeat.set(3, 2.4);
    const floorT = cv(256, 256, (c) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#3a4a5a' : '#e8ecee'; c.fillRect(x * 32, y * 32, 32, 32); } });
    const outM = new T.MeshLambertMaterial({ map: stripes }), inM = new T.MeshLambertMaterial({ map: tiles, side: T.DoubleSide });
    const boxes = [];
    const wall = (x1, z1, x2, z2, y0, y1) => {
      const w = Math.abs(x2 - x1), d = Math.abs(z2 - z1), m = new T.Mesh(L.GEO.box, outM); m.scale.set(w, y1 - y0, d); m.position.set((x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2); m.castShadow = true; g.add(m);
      boxes.push(L.addBoxY(SAFE.x + Math.min(x1, x2), SAFE.z + Math.min(z1, z2), SAFE.x + Math.max(x1, x2), SAFE.z + Math.max(z1, z2), y0, y1, 'building'));
    };
    const h = W / 2;
    wall(-h, -h, h, -h + TH, 0, H); wall(-h, -h, -h + TH, h, 0, H); wall(h - TH, -h, h, h, 0, H);
    wall(-h, h - TH, -DW / 2, h, 0, H); wall(DW / 2, h - TH, h, h, 0, H); wall(-DW / 2, h - TH, DW / 2, h, DH, H);
    const lin = (w, hh, x, y, z, ry) => { const p = new T.Mesh(new T.PlaneGeometry(w, hh), inM); p.position.set(x, y, z); p.rotation.y = ry; g.add(p); return p; };
    lin(W - 2 * TH, H, 0, H / 2, -h + TH + 0.01, 0); lin(W - 2 * TH, H, -h + TH + 0.01, H / 2, 0, Math.PI / 2); lin(W - 2 * TH, H, h - TH - 0.01, H / 2, 0, -Math.PI / 2);
    for (const sx of [-1, 1]) lin((W - DW) / 2 - TH, H, sx * (DW / 2 + ((W - DW) / 2 - TH) / 2), H / 2, h - TH - 0.01, Math.PI);
    lin(DW, H - DH, 0, (H + DH) / 2, h - TH - 0.01, Math.PI);
    const fl = new T.Mesh(new T.PlaneGeometry(W - 2 * TH, W - 2 * TH), new T.MeshLambertMaterial({ map: floorT })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.02; g.add(fl);
    const ce = new T.Mesh(new T.PlaneGeometry(W, W), new T.MeshLambertMaterial({ color: 0xe8ece8 })); ce.rotation.x = Math.PI / 2; ce.position.y = H - 0.02; g.add(ce);
    part(L.GEO.box, '#1a3a7a', W + 0.6, 0.6, W + 0.6, 0, H + 0.3, 0, g);
    boxes.push(L.addBoxY(SAFE.x - h - 0.3, SAFE.z - h - 0.3, SAFE.x + h + 0.3, SAFE.z + h + 0.3, H, H + 0.6, 'building'));
    const dome = new T.Mesh(new T.SphereGeometry(3.6, 24, 12, 0, 6.283, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0xe8b830, metalness: 0.7, roughness: 0.3 })); dome.position.y = H + 0.6; g.add(dome);
    part(L.GEO.cone, '#e8b830', 0.25, 1.6, 0.25, 0, H + 5, 0, g);
    const sign = new T.Mesh(new T.PlaneGeometry(6, 1.2), new T.MeshBasicMaterial({ map: L.textTex('🛡️ ZUFLUCHT', 512, 100, '#0a1a3a', '#ffffff', 'bold 62px Arial') })); sign.position.set(0, H + 1.6, h + 0.32); g.add(sign);
    // ---- Behandlungsraum ----
    const vinyl = L.mat('#2a8a8a'), metal = L.mat('#9aa0a8'), dark = L.mat('#2a2e34');
    const chair = new T.Group(); chair.position.set(0, 0, -1.2); g.add(chair);
    part(L.GEO.cylB, metal, 0.5, 0.5, 0.5, 0, 0, 0, chair); part(L.GEO.cylB, metal, 0.12, 0.6, 0.12, 0, 0.5, 0, chair);
    part(L.GEO.box, vinyl, 0.9, 0.18, 1.0, 0, 1.15, 0.1, chair);
    const back = part(L.GEO.box, vinyl, 0.9, 1.3, 0.18, 0, 1.75, -0.55, chair); back.rotation.x = -0.55;
    const head = part(L.GEO.box, vinyl, 0.5, 0.3, 0.16, 0, 2.45, -0.92, chair); head.rotation.x = -0.55;
    const foot = part(L.GEO.box, vinyl, 0.8, 0.14, 1.0, 0, 0.95, 0.95, chair); foot.rotation.x = 0.45;
    for (const sx of [-1, 1]) part(L.GEO.box, dark, 0.12, 0.08, 0.7, sx * 0.55, 1.45, 0.05, chair);
    part(L.GEO.cylB, metal, 0.07, 2.6, 0.07, 1.1, 0, -0.6, chair);
    const arm = part(L.GEO.box, metal, 0.08, 0.08, 1.2, 0.8, 2.6, -0.2, chair); arm.rotation.y = 0.5;
    part(L.GEO.cyl, '#f4f4f4', 0.28, 0.14, 0.28, 0.45, 2.5, 0.25, chair);
    part(L.GEO.cyl, new T.MeshBasicMaterial({ color: 0xfffbe0 }), 0.22, 0.02, 0.22, 0.45, 2.42, 0.25, chair);
    const tray = new T.Group(); tray.position.set(-1.4, 0, -0.6); g.add(tray);
    part(L.GEO.cylB, metal, 0.05, 1.2, 0.05, 0, 0, 0, tray); part(L.GEO.box, metal, 0.7, 0.04, 0.45, 0, 1.22, 0, tray);
    for (let k = 0; k < 5; k++) part(L.GEO.box, '#d8dce0', 0.03, 0.02, 0.28, -0.25 + k * 0.12, 1.26, 0, tray);
    part(L.GEO.box, '#f2f2f0', 2.6, 1.0, 0.6, -2.4, 0.5, -h + TH + 0.32, g); part(L.GEO.box, '#c8ccd0', 2.6, 0.06, 0.62, -2.4, 1.03, -h + TH + 0.32, g);
    part(L.GEO.box, '#e8ecee', 0.6, 2.1, 1.6, h - TH - 0.32, 1.05, -2.4, g);
    part(L.GEO.box, new T.MeshBasicMaterial({ color: 0xf4fff8 }), 2.2, 0.05, 0.3, 0, H - 0.06, 0, g);
    const lt = new T.PointLight(0xe8fff4, 1.1, 14, 1.6); lt.position.set(0, H - 0.5, 0); g.add(lt);
    // Gesichtsmasken an den Wänden
    const face = (k) => cv(128, 160, (c) => {
      c.clearRect(0, 0, 128, 160); const tone = ['#f2e4d6', '#e8d0bc', '#f4f0ea', '#d8c0a8', '#efe2d2'][k % 5];
      c.fillStyle = tone; c.beginPath(); c.ellipse(64, 80, 50, 70, 0, 0, 6.3); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(64, 104, 40, 40, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#141414'; const sad = k % 3;
      c.beginPath(); c.ellipse(44, 66, 11, sad ? 6 : 9, sad ? 0.2 : 0, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(84, 66, 11, sad ? 6 : 9, sad ? -0.2 : 0, 0, 6.3); c.fill();
      c.strokeStyle = '#8a7060'; c.lineWidth = 3; c.beginPath(); c.moveTo(64, 74); c.lineTo(60, 96); c.lineTo(68, 98); c.stroke();
      c.fillStyle = '#2a1a1a'; c.beginPath();
      if (k % 4 === 0) c.ellipse(64, 120, 14, 9, 0, 0, 6.3); else if (k % 4 === 1) c.ellipse(64, 122, 18, 3, 0, 0, 6.3); else if (k % 4 === 2) c.ellipse(64, 124, 8, 12, 0, 0, 6.3); else c.ellipse(64, 118, 20, 6, 0, 0, Math.PI);
      c.fill();
    });
    let k = 0;
    const hang = (x, y, z, ry) => { const m = new T.Mesh(new T.PlaneGeometry(0.7, 0.9), new T.MeshLambertMaterial({ map: face(k++), transparent: true, side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); };
    for (let n = 0; n < 4; n++) hang(-3 + n * 2, 4.6 - (n % 2) * 0.4, -h + TH + 0.03, 0);
    for (let n = 0; n < 3; n++) { hang(-h + TH + 0.03, 4.3 + (n % 2) * 0.5, -2.5 + n * 2.2, Math.PI / 2); hang(h - TH - 0.03, 4.5 - (n % 2) * 0.5, -1.9 + n * 2.2, -Math.PI / 2); }
    L.scene.add(g); g.userData.boxes = boxes; return g;
  }

  // ---------- Zustand ----------
  const B = { state: 'pause', t: 0, pauseT: 40, rig: null, bag: null, x: CENTER.x, z: CENTER.z, yaw: 0, hp: 15000, max: 15000, cd: 3, smashCd: 6, fx: [], cam: { x: 0, y: 0, z: 0, lx: 0, ly: 0, lz: 0 }, house: null };
  L.ruslanBoss = B;
  const ent = { kind: 'ruslan', x: 0, z: 0, y: 10, hp: 1, dead: false, hitR: 150, bigR: 50, rig: { root: null } };
  L.ruslanTargets = () => (B.state === 'hunt' && onIsland() ? [ent] : []);
  L.ruslanHit = function (dmg, src) {
    if (B.state !== 'hunt') return;
    B.hp -= dmg * 0.6; if (L.showBossHp) L.showBossHp('🛡️ RUSLAN', Math.max(0, B.hp), B.max);
    if (B.hp <= 0) { B.state = 'defeat'; B.t = 0; if (src === P && L.gotBossCoins) L.gotBossCoins(1500, 'Ruslan'); L.banner('🛡️ RUSLAN IST BESIEGT', 'Der Riesenbagger bleibt stehen … +1500 Münzen'); }
  };
  function cleanupModels() { if (B.rig) L.scene.remove(B.rig.root); if (B.bag) L.scene.remove(B.bag.g); B.rig = null; B.bag = null; ent.rig.root = null; if (B.shield) { L.scene.remove(B.shield); B.shield = null; } if (B.iva) { L.scene.remove(B.iva.root); B.iva = null; } for (const f of B.fx) L.scene.remove(f.m); B.fx.length = 0; }
  L._buildRuslan = () => buildRuslan();
  function startIntro() {
    cleanupModels();
    B.rig = buildRuslan(); B.rig.root.scale.setScalar(12); L.scene.add(B.rig.root);
    const a = Math.atan2(P.x - CENTER.x, P.z - CENTER.z); B.x = CENTER.x; B.z = CENTER.z; B.yaw = a;
    B.rig.root.position.set(B.x, 0, B.z); B.rig.root.rotation.y = a;
    B.bag = buildBagger(); B.bag.g.position.set(B.x - Math.sin(a) * 60, -60, B.z - Math.cos(a) * 60); B.bag.g.rotation.y = a; L.scene.add(B.bag.g); ent.rig.root = B.bag.g;
    B.state = 'intro'; B.t = 0; B.hp = B.max;
    L.banner('🛡️ RUSLAN', 'Der Held von Mystery Island – und sein Riesenbagger!');
    L.startCine('🛡️ RUSLAN', 9.5, () => B.cam);
  }
  function rigShield(on) {
    if (on && !B.shield) { B.shield = new T.Mesh(new T.CylinderGeometry(1.6, 1.6, 0.2, 32), [new T.MeshLambertMaterial({ color: 0xc8ccd4 }), new T.MeshLambertMaterial({ map: shieldTex() }), new T.MeshLambertMaterial({ color: 0x8a8e96 })]); L.scene.add(B.shield); }
    if (B.rig && B.rig.shield) B.rig.shield.visible = !on;
    if (B.shield) B.shield.visible = on;
  }
  function updIntro(dt) {
    const t = B.t, R = B.rig, a = B.yaw, fx = Math.sin(a), fz = Math.cos(a);
    L.animHuman(R, { mode: 'walk', phase: 0, speed: 0 });
    // Umhang weht immer, beim Sprung stark
    if (R.cape) R.cape.rotation.x = 0.3 + Math.abs(Math.sin(t * 7)) * 0.3 + Math.sin(t * 13) * 0.08 + (t > 8 ? 0.9 : 0);
    R.torso.rotation.y = t < 0.5 ? -0.7 * (t / 0.5) : t < 0.8 ? -0.7 + (t - 0.5) / 0.3 * 1.1 : t < 2.8 ? 0.4 * (1 - (t - 0.8) / 2) : 0;
    // 0–2,8 s: Schild in deine Richtung werfen und zurückfangen
    if (t < 2.8) {
      const u = t / 2.8, d = Math.sin(u * Math.PI) * 110, hand = new T.Vector3(); R.arms[1].elbow.getWorldPosition(hand);
      if (t > 0.5) { rigShield(true); B.shield.position.set(hand.x + fx * d + Math.cos(a) * Math.sin(u * 6.28) * 8, hand.y + Math.sin(u * Math.PI) * 4, hand.z + fz * d - Math.sin(a) * Math.sin(u * 6.28) * 8); B.shield.rotation.set(Math.PI / 2, t * 18, 0); }
      R.arms[1].arm.rotation.x = t < 0.5 ? 0.6 + t * 1.6 : t < 0.8 ? 1.4 - (t - 0.5) / 0.3 * 3 : t < 2.5 ? -1.6 : -1.6 + (t - 2.5) * 2; R.arms[1].arm.rotation.z = t < 0.5 ? -0.3 : 0.6;
      if (t > 0.5 && B.shield) { for (let k = 0; k < 2; k++) L.fx(k ? '#ffffff' : '#3a6aff', B.shield.position.x, B.shield.position.y, B.shield.position.z, 1, 1, { basic: true, size: 0.9, life: 0.5 }); }
      if (t > 2.6 && t - dt <= 2.6) { L.shake = Math.max(L.shake, 0.8); L.snd.stomp && L.snd.stomp({ x: B.x, y: 20, z: B.z }); }
      Object.assign(B.cam, { x: B.x + fx * 140 + Math.cos(a) * 45, y: 26, z: B.z + fz * 140 - Math.sin(a) * 45, lx: B.shield && t > 0.5 ? B.shield.position.x : B.x, ly: 22, lz: B.shield && t > 0.5 ? B.shield.position.z : B.z });
      if (t > 0.5 && t - dt <= 0.5) L.nz && L.nz({ dur: 1, f: 2000, fTo: 600, type: 'bandpass', vol: 0.3 });
      return;
    }
    rigShield(false);
    // 2,8–8 s: der Riesenbagger steigt langsam aus dem Boden
    const u = ease((t - 3) / 4.5), bg = B.bag.g;
    bg.position.y = -60 + u * 60;
    if (Math.random() < dt * 30 && u < 1) { L.fx('#7a6a50', bg.position.x + L.rand(-40, 40), 1, bg.position.z + L.rand(-40, 40), 4, 10, { size: 1.6, life: 1.6 }); L.shake = Math.max(L.shake, 0.6); }
    if (t - dt < 3) { L.snd.bossRoar && L.snd.bossRoar({ x: bg.position.x, y: 10, z: bg.position.z }); L.decal && L.decal(bg.position.x, bg.position.z, 50, '#2a2018'); }
    B.bag.boom.rotation.x = -0.35 + Math.sin(t) * 0.1;
    Object.assign(B.cam, { x: B.x + fx * 130 + Math.cos(a) * 60, y: 30 + u * 25, z: B.z + fz * 130 - Math.sin(a) * 60, lx: bg.position.x, ly: 20 + u * 25, lz: bg.position.z });
    // 8–9,5 s: Ruslan springt hinauf
    if (t > 8) { const k = ease((t - 8) / 1.2); R.root.scale.setScalar(L.lerp(12, 5, k)); R.root.position.set(L.lerp(B.x, bg.position.x, k), L.lerp(0, TOP + Math.sin(k * Math.PI) * 15, k), L.lerp(B.z, bg.position.z, k)); }
    if (t > 9.5 || (!L.cine && t > 0.3)) { if (L.cine && L.endCine) L.endCine(); B.state = 'hunt'; B.t = 0; R.root.scale.setScalar(5); B.x = bg.position.x; B.z = bg.position.z; B.bag.g.position.y = 0; L.banner('🚜 RUSLAN JAGT DICH – 5 MINUTEN', 'Rette dich ins blau-weiße Häuschen (🛡️ Zuflucht)!'); }
  }
  function hurt(dmg, why, kx, kz) { if (!P.alive || inSafe(P.x, P.z)) return; L.hurtPlayer(dmg, why); if (kx !== undefined) { P.vx = kx; P.vz = kz; P.vy = 7; P.air = true; P.knockT = 0.6; } L.shake = Math.max(L.shake, 0.7); }
  function telegraph(x, z, r, dur, cb) { const m = new T.Mesh(new T.RingGeometry(r * 0.85, r, 40).rotateX(-Math.PI / 2), basic(0xff2020, { transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false })); m.position.set(x, 0.1, z); L.scene.add(m); B.fx.push({ m, t: 0, dur, cb, kind: 'tele' }); }
  function updHunt(dt) {
    const bg = B.bag, R = B.rig, here = onIsland() && P.alive;
    B.t += dt; B.cd -= dt; B.smashCd -= dt;
    const safe = inSafe(P.x, P.z), tx = here && !safe ? P.x : CENTER.x, tz = here && !safe ? P.z : CENTER.z;
    const dx = tx - B.x, dz = tz - B.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz);
    B.yaw += L.angDiff(B.yaw, want) * Math.min(1, dt * 0.8);
    const sp = here && !safe ? 13 : 5, stopD = safe ? Math.hypot(SAFE.x - B.x, SAFE.z - B.z) < 95 : d < 8;
    if (!stopD) { B.x += Math.sin(B.yaw) * sp * dt; B.z += Math.cos(B.yaw) * sp * dt; }
    if (safe && Math.hypot(SAFE.x - B.x, SAFE.z - B.z) < 95) { const a = Math.atan2(B.x - SAFE.x, B.z - SAFE.z); B.x = SAFE.x + Math.sin(a) * 95; B.z = SAFE.z + Math.cos(a) * 95; }
    { const r = Math.hypot(B.x - I.x, B.z - I.z); if (r > I.r - 70) { B.x = I.x + (B.x - I.x) / r * (I.r - 70); B.z = I.z + (B.z - I.z) / r * (I.r - 70); } }
    bg.g.position.set(B.x, 0, B.z); bg.g.rotation.y = B.yaw;
    bg.upper.rotation.y = Math.sin(B.t * 0.7) * 0.25;
    bg.boom.rotation.x = -0.3 + Math.sin(B.t * 1.3) * 0.12;
    R.root.position.set(B.x - Math.sin(B.yaw) * 4 * BS, TOP, B.z - Math.cos(B.yaw) * 4 * BS); R.root.rotation.y = B.yaw; R.root.scale.setScalar(5);
    L.animHuman(R, { mode: 'walk', phase: 0, speed: 0 }); if (R.cape) R.cape.rotation.x = 0.3 + Math.sin(B.t * 3) * 0.15;
    ent.x = B.x; ent.z = B.z; ent.hp = B.hp;
    if (Math.random() < dt * 3) L.snd.ruferStep && L.snd.ruferStep({ x: B.x, y: 0, z: B.z });
    if (!here || safe) return;
    // überrollen: unter den Ketten
    const lx = (P.x - B.x) * Math.cos(B.yaw) - (P.z - B.z) * Math.sin(B.yaw), lz = (P.x - B.x) * Math.sin(B.yaw) + (P.z - B.z) * Math.cos(B.yaw);
    if (Math.abs(lx) < 30 * BS && Math.abs(lz) < 36 * BS && (P.y || 0) < 12 * BS) { B.crushT = (B.crushT || 0) - dt; if (B.crushT <= 0) { B.crushT = 0.5; const a = Math.atan2(P.x - B.x, P.z - B.z); hurt(30, 'Vom Riesenbagger überrollt', Math.sin(a) * 18, Math.cos(a) * 18); } }
    // Schaufel-Schlag mit Warnkreis
    if (B.smashCd <= 0 && d < 90) { B.smashCd = 6; const x = P.x, z = P.z; telegraph(x, z, 12, 1.3, () => { L.shake = Math.max(L.shake, 1.2); L.snd.explosion && L.snd.explosion({ x, y: 1, z }); L.fx('#7a6a50', x, 1, z, 30, 12, { size: 1.2, life: 1.2 }); L.decal && L.decal(x, z, 10, '#2a2018'); if (Math.hypot(P.x - x, P.z - z) < 12) hurt(50, 'Von der Baggerschaufel zerquetscht'); }); B.smashAnim = 1.3; }
    if (B.smashAnim > 0) { B.smashAnim -= dt; bg.boom.rotation.x = B.smashAnim > 0.3 ? -0.7 : 0.25; }
    // Schild werfen
    if (B.cd <= 0 && d < 120) {
      B.cd = 4; rigShield(true); const hp = new T.Vector3(B.x, TOP + 6, B.z), tp = new T.Vector3(P.x, (P.y || 0) + 1.2, P.z);
      B.throwS = { t: 0, a: hp, b: tp, hit: false };
    }
    if (B.throwS) {
      const S0 = B.throwS; S0.t += dt; const u = S0.t / 1.4, k = u < 0.5 ? u * 2 : 2 - u * 2, p = new T.Vector3().lerpVectors(S0.a, S0.b, k);
      B.shield.position.copy(p); B.shield.rotation.set(Math.PI / 2, S0.t * 20, 0);
      if (!S0.hit && p.distanceTo(new T.Vector3(P.x, (P.y || 0) + 1.2, P.z)) < 3) { S0.hit = true; hurt(25, 'Vom Flaggen-Schild getroffen'); L.nz && L.nz({ dur: 0.2, f: 1800, vol: 0.4 }); }
      if (u >= 1) { B.throwS = null; rigShield(false); }
    }
  }
  // Schlussfilm: BIG MAMA in goldener Super-Form – Ruslan überfährt sie
  // ---------- Kurzfilm: ein riesiges, extrem behaartes Walross springt auf Ruslan, rollt sich auf ihm, explodiert – Richard steigt aus dem Licht ----------
  function phonk(dur) {
    try {
      L.initAudio && L.initAudio(); const A = L.audio && L.audio.ctx; if (!A) return; const t0 = A.currentTime + 0.05, B = 60 / 130 / 2;
      const out = A.createGain(); out.gain.value = 0.55; out.connect(A.destination);
      const osc = (type, f, s, d, v, f2, bp) => { const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, s + d); let n = o; if (bp) { const fl = A.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = bp; fl.Q.value = 2; o.connect(fl); n = fl; } n.connect(g); g.connect(out); o.start(s); o.stop(s + d + 0.05); };
      const nb = A.createBuffer(1, A.sampleRate * 0.2, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const hat = (s) => { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; fl.type = 'highpass'; fl.frequency.value = 7000; g.gain.setValueAtTime(0.12, s); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.05); n.connect(fl); fl.connect(g); g.connect(out); n.start(s); n.stop(s + 0.06); };
      const bell = [0, 0, 3, 0, 5, 3, 0, 7, 0, 0, 3, 0, 8, 7, 5, 3];
      for (let i = 0; i * B < dur; i++) {
        const s = t0 + i * B, semi = bell[i % 16], f = 587 * Math.pow(2, semi / 12);
        osc('square', f, s, 0.22, 0.08, 0, 1600); osc('square', f * 1.48, s, 0.22, 0.05, 0, 2400); // Kuhglocke
        if (i % 2 === 0) hat(s); if (i % 8 === 0 || i % 8 === 3) osc('sine', 55, s, 0.5, 0.7, 38); // 808
        if (i % 8 === 4) { const n = A.createBufferSource(), g = A.createGain(); n.buffer = nb; g.gain.setValueAtTime(0.3, s); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.15); n.connect(g); g.connect(out); n.start(s); n.stop(s + 0.16); }
      }
    } catch (e) { /* ohne Ton */ }
  }
  function startWalrusEnd() {
    if (B.bag && B.bag.g) B.bag.g.visible = false;
    if (B.iva && B.iva.root) { L.scene.remove(B.iva.root); B.iva = null; }
    if (!B.rig) { B.rig = buildRuslan(); L.scene.add(B.rig.root); }
    B.rig.root.scale.setScalar(14); B.rig.root.position.set(B.x, 0, B.z); B.rig.root.rotation.set(0, B.yaw, 0); B.rig.root.visible = true;
    const a = B.yaw + 2.2, wx = B.x + Math.sin(a) * 140, wz = B.z + Math.cos(a) * 140;
    const w = L.buildWalross(); w.root.scale.setScalar(16); w.root.position.set(wx, 0, wz); L.scene.add(w.root);
    // extrem viel Fell
    w.root.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(w.root), sz = bb.getSize(new T.Vector3()), S = 16;
    const furM = [L.mat('#4a3424'), L.mat('#5e4430'), L.mat('#3a281a'), L.mat('#6e5038')];
    for (let k = 0; k < 520; k++) {
      const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1) * 0.9, rx = sz.x / S * 0.5, ry = sz.y / S * 0.5, rz = sz.z / S * 0.5;
      const dir = new T.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const m = new T.Mesh(L.GEO.cone, furM[k % 4]); const len = 0.12 + Math.random() * 0.22; m.scale.set(0.035, len, 0.035);
      m.position.set(dir.x * rx * 0.95, ry + dir.y * ry * 0.95, dir.z * rz * 0.95); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().add(new T.Vector3((Math.random() - 0.5) * 0.6, -0.3, (Math.random() - 0.5) * 0.6)).normalize());
      w.root.add(m);
    }
    w.root.traverse((o) => { o.frustumCulled = false; });
    B.wal = { w, wx, wz, rich: null, light: null, aura: null, boom: false, half: Math.max(sz.x, sz.z) * 0.5 };
    B.state = 'walrus'; B.t = 0;
    L.startCine('🦭 THE GIANT WALRUS', 19, () => B.cam);
  }
  function updWalrusEnd(dt) {
    const t = B.t, V = B.wal, w = V.w, R = B.rig, RS = 14, END = 19;
    const fx = Math.sin(B.yaw), fz = Math.cos(B.yaw);
    const front = { x: B.x + fx * 20, z: B.z + fz * 20 }, far = { x: B.x + fx * 150, z: B.z + fz * 150 };
    if (R && t < 7.8) { R.root.visible = true; R.root.scale.setScalar(RS); R.root.position.set(B.x, 0, B.z); R.root.rotation.set(0, B.yaw, 0); }
    const look = (x, z) => { w.root.rotation.y = Math.atan2(x - w.root.position.x, z - w.root.position.z); };
    const arms = (x, z2) => { if (R && R.arms) R.arms.forEach((q) => { q.arm.rotation.set(x, 0, z2 || 0); q.elbow.rotation.x = 0; }); };
    if (t < 1.8) {
      // Walross kommt angerannt
      const u = t / 1.8; w.root.position.set(L.lerp(V.wx, front.x, u), Math.abs(Math.sin(u * 9)) * 2, L.lerp(V.wz, front.z, u)); look(B.x, B.z);
      if (t - dt <= 0) { L.snd.bossRoar && L.snd.bossRoar({ x: V.wx, y: 10, z: V.wz }); L.banner('🦭 EIN RIESIGES WALROSS!', '… und es ist EXTREM behaart.'); }
      if (R) R.root.position.set(B.x, 0, B.z); arms(-0.4);
    } else if (t < 3.4) {
      // Ruslan packt es an den Stoßzähnen
      w.root.position.set(front.x, 6 * Math.min(1, (t - 1.8) * 2), front.z); look(B.x, B.z); w.root.rotation.x = -0.3; arms(-1.55);
      if (t - dt < 1.9) { L.shake = 1.2; L.msg('🛡️ Ruslan packt das Walross an den Stoßzähnen!', 2500); }
    } else if (t < 5.2) {
      // … und wirft es weg
      const u = (t - 3.4) / 1.8; w.root.position.set(L.lerp(front.x, far.x, u), Math.sin(u * Math.PI) * 70 + 6 * (1 - u), L.lerp(front.z, far.z, u)); w.root.rotation.x = -0.3 - u * 6; arms(-2.8 + u * 0.6);
      if (u >= 0.95 && !V.land1) { V.land1 = true; L.shake = 2.5; L.snd.stomp && L.snd.stomp({ x: far.x, y: 0, z: far.z }); for (let k = 0; k < 30; k++) L.fx('#8a7a60', far.x + L.rand(-25, 25), 2, far.z + L.rand(-25, 25), 8, 30, { size: 3, life: 1.5 }); }
    } else if (t < 6.2) {
      w.root.position.set(far.x, 0, far.z); w.root.rotation.x = 0; look(B.x, B.z); arms(-0.5);
      if (t - dt < 5.3) L.snd.bossRoar && L.snd.bossRoar({ x: far.x, y: 10, z: far.z });
    } else if (t < 7.8) {
      // springt zurück – auf Ruslan
      const u = (t - 6.2) / 1.6; w.root.position.set(L.lerp(far.x, B.x, u), Math.sin(u * Math.PI) * 90, L.lerp(far.z, B.z, u)); look(B.x, B.z); w.root.rotation.x = -0.4 + u * 0.6; arms(-2.6);
    } else if (t < 11.2) {
      // drauf – dreht sich auf ihm
      if (t - dt < 7.8) { L.shake = 3; L.snd.stomp && L.snd.stomp({ x: B.x, y: 0, z: B.z }); L.snd.explosion && L.snd.explosion({ x: B.x, y: 0, z: B.z }); for (let k = 0; k < 40; k++) L.fx('#8a7a60', B.x + L.rand(-30, 30), 2, B.z + L.rand(-30, 30), 8, 30, { size: 3, life: 1.6 }); }
      const u = t - 7.8; w.root.position.set(B.x, 0, B.z); w.root.rotation.set(Math.sin(u * 3) * 0.12, w.root.rotation.y + dt * 2.4, Math.sin(u * 5) * 0.2);
      if (R) { R.root.scale.set(RS, RS * 0.1, RS); }
      if (Math.random() < dt * 5) { L.shake = Math.max(L.shake, 0.8); L.fx('#5e4430', B.x + L.rand(-25, 25), L.rand(2, 20), B.z + L.rand(-25, 25), 4, 12, { size: 1, life: 1 }); }
    } else {
      // ===== Geburt: Richard kommt hinten aus dem Walross =====
      const u = t - 11.2;
      if (!V.birth) {
        V.birth = true; if (R) R.root.visible = false;
        w.root.rotation.set(0, w.root.rotation.y, 0); V.yaw = w.root.rotation.y; const back = V.yaw + Math.PI; V.back = back;
        V.rear = { x: B.x + Math.sin(back) * V.half * 0.92, y: 7, z: B.z + Math.cos(back) * V.half * 0.92 };
        // goldene Lichtstrahlen aus dem Hinterteil
        V.rays = new T.Group(); V.rays.position.set(V.rear.x, V.rear.y, V.rear.z); V.rays.rotation.y = back; L.scene.add(V.rays);
        for (let k = 0; k < 10; k++) { const c = new T.Mesh(new T.ConeGeometry(0.9, 1, 8, 1, true).translate(0, 0.5, 0), new T.MeshBasicMaterial({ color: k % 2 ? 0xfff2b0 : 0xffc840, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); const ang = k / 10 * 6.283; c.rotation.set(Math.PI / 2 + Math.cos(ang) * 0.55, 0, Math.sin(ang) * 0.55); c.scale.set(1, 0.01, 1); V.rays.add(c); }
        V.pl = new T.PointLight(0xffe0a0, 0, 160, 2); V.pl.position.set(V.rear.x, V.rear.y + 2, V.rear.z); L.scene.add(V.pl);
        const rich = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { special: 'richard' }), true); rich.root.scale.setScalar(6.5); rich.root.visible = false; rich.root.rotation.set(0, back, 0); L.scene.add(rich.root);
        const aura = new T.Group(); rich.root.add(aura); aura.position.y = 1; aura.visible = false;
        const AC = [0x9a5cff, 0xffffff, 0x5a3aff, 0xd0a0ff];
        for (let k = 0; k < 18; k++) { const c = new T.Mesh(L.GEO.cone, new T.MeshBasicMaterial({ color: AC[k % 4], transparent: true, opacity: 0.2, blending: T.AdditiveBlending, depthWrite: false })); const ang = Math.PI * 0.5 + (k / 17) * Math.PI; c.userData.h = 1.8 + (k % 3) * 0.7; c.scale.set(0.22, c.userData.h, 0.22); c.position.set(Math.sin(ang) * 0.75, 0.9, Math.cos(ang) * 0.75 - 0.15); c.rotation.set(Math.cos(ang) * 0.35, 0, -Math.sin(ang) * 0.35); aura.add(c); }
        { const halo = new T.Mesh(new T.RingGeometry(0.55, 0.62, 40), new T.MeshBasicMaterial({ color: 0xc8a0ff, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); halo.position.set(0, 1.35, -0.45); aura.add(halo); aura.userData.halo = halo; }
        rich.root.traverse((o) => { o.frustumCulled = false; });
        V.rich = rich; V.aura = aura;
        L.tn && L.tn({ f: 120, fTo: 900, dur: 2.2, type: 'sine', vol: 0.22 }); L.tn && L.tn({ f: 240, fTo: 1800, dur: 2.2, type: 'triangle', vol: 0.08 });
      }
      const R2 = V.rich, back = V.back, bx = Math.sin(back), bz = Math.cos(back);
      if (u < 1.2) {
        // Wehen: das Walross presst, das Hinterteil glüht, Lichtstrahlen brechen heraus
        const k = u / 1.2; w.root.position.set(B.x, 0, B.z); w.root.rotation.set(Math.sin(u * 22) * 0.02, V.yaw, 0);
        const sq = 1 + Math.sin(u * 14) * 0.05 * k; w.root.scale.set(16 * (1 - (sq - 1) * 0.5), 16 * sq, 16 * (1 + (sq - 1)));
        V.pl.intensity = k * 6; V.rays.children.forEach((c, i) => { c.material.opacity = 0.45 * k; c.scale.set(0.7 + k * 0.6, 3 + k * 16 + Math.sin(u * 20 + i) * 1.5, 0.7 + k * 0.6); }); V.rays.rotation.z += dt * 0.6;
        if (Math.random() < dt * 25) L.fx(L.pick(['#fff4c0', '#ffd040', '#ffffff']), V.rear.x + L.rand(-2, 2), V.rear.y + L.rand(-2, 2), V.rear.z + L.rand(-2, 2), 4, 10, { basic: true, size: 0.5, life: 0.8 });
        L.shake = Math.max(L.shake, 0.3 * k);
      } else if (u < 2.5) {
        // Richard rutscht zusammengerollt heraus …
        const k = Math.min(1, (u - 1.2) / 1.1); R2.root.visible = true;
        const d = -2 + k * 16, y = Math.max(0.2, V.rear.y - 1.2 - k * k * 6 + Math.sin(k * Math.PI) * 3);
        R2.root.position.set(V.rear.x + bx * d, y, V.rear.z + bz * d); R2.root.rotation.set(0.9 * (1 - k * 0.3), back, Math.sin(u * 6) * 0.2);
        if (R2.body) R2.body.rotation.x = 0.6; if (R2.legs) R2.legs.forEach((l) => { l.leg.rotation.x = -1.4; l.knee.rotation.x = 1.8; }); if (R2.arms) R2.arms.forEach((q) => { q.arm.rotation.set(-1.8, 0, 0); q.elbow.rotation.x = -1.5; });
        w.root.scale.set(16, 16 * (1 - k * 0.04), 16 * (1 + Math.sin(k * Math.PI) * 0.1));
        V.pl.intensity = 6 + Math.sin(u * 30) * 1.5; V.rays.children.forEach((c) => { c.material.opacity = 0.6; });
        if (Math.random() < dt * 30) L.fx(L.pick(['#fff4c0', '#ffd040', '#f2e6c0']), R2.root.position.x + L.rand(-2, 2), R2.root.position.y + L.rand(0, 3), R2.root.position.z + L.rand(-2, 2), 3, 6, { size: 0.6, life: 1, g: -6 });
        if (k >= 1 && !V.plop) { V.plop = true; L.shake = 1.4; L.tn && L.tn({ f: 600, fTo: 140, dur: 0.18, type: 'sine', vol: 0.4 }); L.snd.stomp && L.snd.stomp({ x: R2.root.position.x, y: 0, z: R2.root.position.z }); for (let n = 0; n < 40; n++) L.fx(L.pick(['#fff4c0', '#ffd040', '#ffffff']), R2.root.position.x, 1, R2.root.position.z, 10, 18, { basic: true, size: 0.8, life: 1.1 }); L.banner('✨ RICHARD', '… ist geboren. Mit purer Aura.'); }
      } else {
        // … richtet sich im Licht auf, das Walross fällt in sich zusammen und explodiert
        const k = Math.min(1, (u - 2.5) / 1.2); R2.root.rotation.set(0.9 * 0.7 * (1 - k), back, 0); V.aura.visible = true;
        R2.root.position.y = 0;
        if (R2.body) R2.body.rotation.x = 0.6 * (1 - k); if (R2.legs) R2.legs.forEach((l) => { l.leg.rotation.x = -1.4 * (1 - k); l.knee.rotation.x = 1.8 * (1 - k); });
        if (R2.arms) { const f2 = Math.max(0, Math.min(1, (u - 3.9) / 0.6)); R2.arms[0].arm.rotation.set(-1.8 * (1 - k), 0, -1.5 * f2); R2.arms[1].arm.rotation.set(-1.8 * (1 - k), 0, 1.5 * f2); R2.arms[0].elbow.rotation.x = R2.arms[1].elbow.rotation.x = -1.5 * (1 - k) - 1.9 * f2; }
        V.rays.children.forEach((c) => { c.material.opacity = Math.max(0, 0.6 - (u - 2.5) * 0.4); });
        if (!V.boom) { const def = Math.min(1, (u - 2.5) / 1.4); w.root.scale.set(16 * (1 - def * 0.2), 16 * (1 - def * 0.35), 16 * (1 - def * 0.2)); }
        if (u > 3.9 && !V.boom) { V.boom = true; w.root.visible = false; L.scene.remove(V.rays); L.shake = 3.5; L.snd.explosion && L.snd.explosion({ x: B.x, y: 10, z: B.z }); for (let n = 0; n < 110; n++) L.fx(L.pick(['#ffb030', '#ff6020', '#ffffff', '#5e4430', '#3a281a']), B.x + L.rand(-10, 10), L.rand(5, 40), B.z + L.rand(-10, 10), 14, 60, { basic: n % 3 !== 0, size: 3, life: 2 }); L.decal && L.decal(B.x, B.z, 30, '#1a120a'); }
        { const beat = Math.pow(Math.max(0, Math.sin((u - 2.5) * Math.PI * 130 / 60)), 6); V.aura.children.forEach((c, n) => { if (c.userData.h) { c.scale.y = c.userData.h * (0.85 + Math.random() * 0.25 + beat * 0.35); c.material.opacity = 0.14 + beat * 0.16; } }); const hl = V.aura.userData.halo; if (hl) { hl.rotation.z += dt; hl.scale.setScalar(1 + beat * 0.25); } if (!V.phonk && u > 2.6) { V.phonk = true; phonk(4.6); } }
        V.pl.position.set(R2.root.position.x - Math.sin(back) * 6, 9, R2.root.position.z - Math.cos(back) * 6); V.pl.color.setHex(0xb080ff); V.pl.intensity = 1.6;
        if (Math.random() < dt * 10) L.fx(L.pick(['#fff4c0', '#ffd040']), R2.root.position.x + L.rand(-5, 5), L.rand(1, 16), R2.root.position.z + L.rand(-5, 5), 3, 8, { basic: true, size: 0.6, life: 1 });
      }
    }
    // Kamera
    let cx = B.x + Math.sin(B.yaw) * 10, cz = B.z + Math.cos(B.yaw) * 10, cd = 85, cy = 20, ly = 16;
    if (t >= 6.2 && t < 11.2) { cd = 110; cy = 30; }
    if (t >= 3.4 && t < 6.2) { cx = (B.x + far.x) / 2; cz = (B.z + far.z) / 2; cd = 170; cy = 34; }
    const cA = B.yaw + 1.4 + t * 0.05;
    if (V.birth && t < 13.7) { const bx2 = Math.sin(V.back), bz2 = Math.cos(V.back), sx = Math.cos(V.back), sz2 = -Math.sin(V.back), dd = 52 - (t - 11.2) * 6; Object.assign(B.cam, { x: V.rear.x + bx2 * dd + sx * 18, y: 9, z: V.rear.z + bz2 * dd + sz2 * 18, lx: V.rear.x + bx2 * 6, ly: 5, lz: V.rear.z + bz2 * 6 }); }
    else if (V.birth) { const p = V.rich.root.position, a2 = V.back + 0.6 + (t - 13.7) * 0.12, dd = 30; Object.assign(B.cam, { x: p.x + Math.sin(a2) * dd, y: 7, z: p.z + Math.cos(a2) * dd, lx: p.x, ly: 7, lz: p.z }); }
    else Object.assign(B.cam, { x: cx + Math.sin(cA) * cd, y: cy, z: cz + Math.cos(cA) * cd, lx: cx, ly, lz: cz });
    if (t > END || (!L.cine && t > 0.5)) {
      if (L.cine && L.endCine) L.endCine();
      for (const o of [w.root, V.pl, V.rays, V.rich && V.rich.root]) if (o) L.scene.remove(o);
      B.wal = null; cleanupModels(); B.state = 'pause'; B.pauseT = 600;
    }
  }
  // einmalig, nur auf dem Gerät mit dem Krücken-Code: direkt auf Mystery Island – Ruslan stirbt sofort, das Walross kommt
  { const ohs0 = L.heroStart; L.heroStart = function () { if (ohs0) ohs0.apply(this, arguments);
    if (!L.save || L.save.rusWalOnce || !(L.heroToken && L.heroToken('marlon'))) return;
    L.save.rusWalOnce = 1; L.persist && L.persist();
    setTimeout(() => { try { if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true); P.x = I.x + 60; P.z = I.z + 60; P.y = 0; P.vx = P.vz = P.vy = 0; P.spawnProt = Math.max(P.spawnProt || 0, 30); cleanupModels(); B.x = I.x + 110; B.z = I.z + 110; B.yaw = Math.atan2(P.x - B.x, P.z - B.z); L.banner('🛡️ RUSLAN IST BESIEGT', '… doch da kommt etwas Riesiges.'); setTimeout(() => startWalrusEnd(), 1500); } catch (e) { /* egal */ } }, 2500);
  }; }
  L._ruslanWalrus = () => { if (!B.x && B.x !== 0) return; startWalrusEnd(); };
  function startEnding() {
    B.state = 'ending'; B.t = 0;
    const a = B.yaw, ix = B.x + Math.sin(a) * 160, iz = B.z + Math.cos(a) * 160;
    const rig = L.buildKoloss(); rig.root.children.forEach((c) => { if (c !== rig.hull) c.visible = false; }); rig.root.scale.setScalar(3.2); rig.root.position.set(ix, -80, iz); rig.root.rotation.y = a + Math.PI; L.scene.add(rig.root);
    // goldene Aura mit Zacken
    const aura = new T.Group(); rig.root.add(aura); aura.position.y = 20;
    for (let k = 0; k < 26; k++) { const c = new T.Mesh(L.GEO.cone, basic(k % 2 ? 0xffe040 : 0xffb000, { transparent: true, opacity: 0.32, blending: T.AdditiveBlending, depthWrite: false })); const ang = k / 26 * 6.283; c.scale.set(3, 18 + (k % 3) * 6, 3); c.position.set(Math.sin(ang) * 10, 8 + (k % 4) * 3, Math.cos(ang) * 10); c.rotation.set(Math.cos(ang) * 0.4, 0, -Math.sin(ang) * 0.4); aura.add(c); }
    const glow = new T.PointLight(0xffd040, 3, 200, 2); glow.position.y = 30; rig.root.add(glow);
    rig.root.traverse((o) => { o.frustumCulled = false; });
    B.iva = { root: rig.root, rig, aura, ix, iz };
    L.banner('⚡ BIG MAMA – SUPER STUFE 100', 'Sie hat ihre goldene Endform erreicht …');
    L.startCine('⚡ RUSLAN GEGEN BIG MAMA (SUPER STUFE 100)', 14, () => B.cam);
  }
  function updEnding(dt) {
    const t = B.t, V = B.iva, bg = B.bag, a = B.yaw, fx = Math.sin(a), fz = Math.cos(a);
    V.aura.rotation.y += dt * 2; V.aura.children.forEach((c, k) => { c.scale.y = (18 + (k % 3) * 6) * (0.8 + Math.random() * 0.5); });
    if (Math.random() < dt * 8) { L.env.bolt = 0.5; }
    let ivx = V.ix, ivz = V.iz;
    if (t < 3) V.root.position.y = -80 + ease(t / 3) * 80;
    else if (t < 6.5) { const u = ease((t - 3) / 3.5); ivx = L.lerp(V.ix, B.x + fx * 70, u); ivz = L.lerp(V.iz, B.z + fz * 70, u); V.root.position.set(ivx, 0, ivz); if (Math.random() < dt * 6) L.shake = Math.max(L.shake, 0.8); }
    else if (t < 9) {
      // Zusammenstoß: sie fällt nach hinten, der Bagger fährt über sie
      const u = ease((t - 6.5) / 2.5); ivx = B.x + fx * 70; ivz = B.z + fz * 70; V.root.position.set(ivx, 0, ivz);
      V.root.rotation.x = -u * 1.45; const bx = L.lerp(B.x, ivx + fx * 30, u), bz = L.lerp(B.z, ivz + fz * 30, u); bg.g.position.set(bx, Math.sin(u * Math.PI * 4) * 2, bz); B.rig.root.position.set(bx, TOP, bz);
      if (t - dt < 6.6) { L.shake = 2.5; L.snd.explosion && L.snd.explosion({ x: ivx, y: 10, z: ivz }); L.snd.bossRoar && L.snd.bossRoar({ x: ivx, y: 20, z: ivz }); }
      if (u > 0.5) V.root.scale.set(3.2, 3.2 * Math.max(0.15, 1 - (u - 0.5) * 1.8), 3.2);
      if (Math.random() < dt * 20) L.fx('#ffd040', ivx + L.rand(-20, 20), L.rand(1, 15), ivz + L.rand(-20, 20), 3, 10, { basic: true, size: 0.8, life: 1 });
    } else {
      // platt – die Aura verlischt, Ruslan hebt den Schild
      V.aura.visible = Math.random() > (t - 9) / 3; V.root.scale.y = 3.2 * 0.15;
      B.rig.arms[1].arm.rotation.x = -3; if (B.rig.cape) B.rig.cape.rotation.x = 0.6;
      if (t - dt < 9) L.banner('🛡️ RUSLAN HAT GEWONNEN', 'BIG MAMA wurde vom Riesenbagger plattgewalzt.');
    }
    B.bag.boom.rotation.x = t > 9 ? -0.9 : -0.3;
    const cA = a + 1.3 + t * 0.06, cd = 230 - t * 5;
    Object.assign(B.cam, { x: B.x + Math.sin(cA) * cd, y: 35 + Math.max(0, 10 - t) * 2, z: B.z + Math.cos(cA) * cd, lx: (ivx + bg.g.position.x) / 2, ly: 18, lz: (ivz + bg.g.position.z) / 2 });
    if (t > 14 || (!L.cine && t > 0.3)) { if (L.cine && L.endCine) L.endCine(); if (onIsland() && P.alive && L.gotBossCoins) L.gotBossCoins(500, 'das Überleben gegen Ruslan'); if (onIsland() && P.alive) startWalrusEnd(); else { cleanupModels(); B.state = 'pause'; B.pauseT = 600; } }
  }

  // ---------- jedes Bild ----------
  L.updateRuslan = function (dt) {
    if (!B.house && L.curIsland === I) B.house = buildSafeHouse();
    // drinnen: Kamera bleibt im Raum
    if (B.house && Math.abs(P.x - SAFE.x) < 4.1 && Math.abs(P.z - SAFE.z) < 4.1 && (P.y || 0) < 6.5 && !P.vehicle) L.indoor = { ceil: 6.95, shelter: true };
    for (let i = B.fx.length - 1; i >= 0; i--) { const f = B.fx[i]; f.t += dt; f.m.material.opacity = 0.4 + Math.sin(f.t * 20) * 0.4; if (f.t >= f.dur) { L.scene.remove(f.m); B.fx.splice(i, 1); if (f.cb) f.cb(); } }
    if (B.state === 'pause') { if (onIsland()) { B.pauseT -= dt; if (B.pauseT <= 0 && P.alive && !L.cine) startIntro(); } return; }
    if (B.state === 'intro') { B.t += dt; updIntro(dt); return; }
    if (B.state === 'hunt') { updHunt(dt); if (B.t > 300) { if (onIsland() && P.alive && !L.cine) startEnding(); else { cleanupModels(); B.state = 'pause'; B.pauseT = 600; } } return; }
    if (B.state === 'ending') { B.t += dt; updEnding(dt); return; }
    if (B.state === 'walrus') { B.t += dt; updWalrusEnd(dt); return; }
    if (B.state === 'defeat') { B.t += dt; B.bag.g.position.y = -B.t * 2; B.rig.root.position.y = TOP - B.t * 2; if (B.t > 12) { if (onIsland() && P.alive && !L.cine) startWalrusEnd(); else { cleanupModels(); B.state = 'pause'; B.pauseT = 600; } } }
  };
  // Anzeige oben
  const oibt = L.islandBossText;
  L.islandBossText = function () {
    if (L.curIsland === I) return B.state === 'hunt' ? '🛡️ RUSLAN jagt dich – noch ' + L.fmt(300 - B.t) + ' · 🛡️ Zuflucht = blau-weißes Häuschen' : B.state === 'pause' ? '🛡️ Ruslan kommt in ' + L.fmt(Math.max(0, B.pauseT)) : '🛡️ RUSLAN';
    return oibt ? oibt() : null;
  };
  const oin = L.islandNav;
  L.islandNav = function () { if (L.curIsland === I && B.state === 'hunt' && !inSafe(P.x, P.z)) return { x: SAFE.x, z: SAFE.z }; return oin ? oin() : null; };
  L.clearRuslan = function () { cleanupModels(); B.state = 'pause'; B.pauseT = 40; };

  // ---------- Roller-Unfall: „JOYOR QUALITY“ ----------
  let jq = null;
  L.onPlayerCrash = function (v, kmh) {
    if (!v.t.scooter || kmh < 18) return;
    L.crashSafeT = performance.now() + 4000; // man stirbt nicht
    if (!jq) {
      jq = document.createElement('div');
      jq.style.cssText = 'position:fixed;inset:0;z-index:55;pointer-events:none;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.25)';
      jq.innerHTML = '<div style="font:900 clamp(40px,9vw,120px) Impact,Arial Black,sans-serif;color:#ffd23a;-webkit-text-stroke:4px #000;text-shadow:0 6px 0 #000,0 0 30px rgba(0,0,0,.8);letter-spacing:.04em;transform:scale(1.4);transition:transform .5s,opacity .5s;opacity:0">JOYOR QUALITY</div>';
      document.body.appendChild(jq);
    }
    const txt = jq.firstChild; jq.style.display = 'flex'; L.canvas.style.filter = 'grayscale(1) contrast(1.15)';
    requestAnimationFrame(() => { txt.style.opacity = '1'; txt.style.transform = 'scale(1)'; });
    L.tn && L.tn({ f: 90, fTo: 40, dur: 1.6, type: 'sawtooth', vol: 0.3 });
    setTimeout(() => { txt.style.opacity = '0'; }, 3000);
    setTimeout(() => { jq.style.display = 'none'; L.canvas.style.filter = ''; txt.style.transform = 'scale(1.4)'; }, 3500);
  };
  L.crashSafe = () => (L.crashSafeT || 0) > performance.now();

  // ---------- Roller-Viktors rufen Werbung ----------
  let sayT = 4;
  const bubbles = [];
  function say(m) {
    const tex = L.textTex('„Joyor – Preis-Leistung beste!“', 512, 90, 'rgba(255,255,255,0.92)', '#1a1a1a', 'bold 38px Arial');
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); s.scale.set(5, 0.9, 1); s.renderOrder = 998; L.scene.add(s);
    bubbles.push({ s, m, t: 0 });
    if (window.speechSynthesis && Math.hypot(m.x - P.x, m.z - P.z) < 30) { try { const u = new SpeechSynthesisUtterance('Joyor – Preis-Leistung beste!'); u.lang = 'de-DE'; u.rate = 1.05; u.pitch = 0.6; u.volume = Math.max(0.2, 1 - Math.hypot(m.x - P.x, m.z - P.z) / 30) * (L.S().sfx === undefined ? 1 : L.S().sfx); speechSynthesis.speak(u); } catch (e) { /* egal */ } }
  }
  L.updateJoyorTalk = function (dt) {
    for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t += dt; b.s.position.set(b.m.x, 4.2, b.m.z); b.s.material.opacity = Math.min(1, (3.5 - b.t) * 2); if (b.t > 3.5 || b.m.dead) { L.scene.remove(b.s); b.s.material.map.dispose(); bubbles.splice(i, 1); } }
    sayT -= dt; if (sayT > 0) return; sayT = L.rand(6, 12);
    const near = L.ents.monsters.filter((m) => !m.dead && m.kind === 'rollerviktor' && Math.hypot(m.x - P.x, m.z - P.z) < 60);
    if (near.length) say(L.pick(near));
  };
})();
