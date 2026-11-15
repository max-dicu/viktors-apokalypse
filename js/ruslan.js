'use strict';
// Mystery Island mit RUSLAN (eigener Entwurf): Held im blau-weißen Anzug mit Flaggen-Schild und Flaggen-Umhang,
// fährt einen riesigen Bagger. Intro: Schildwurf, dann steigt der Bagger aus dem Boden. 5 Minuten Jagd, 10 Minuten Pause.
// Zuflucht: kleines blau-weiß gestreiftes Häuschen mit goldener Kuppel. Danach: MAMA IVA in goldener Super-Form – Ruslan überfährt sie.
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
    const g = new T.Group(); g.position.set(SAFE.x, 0, SAFE.z);
    const stripes = cv(256, 256, (c) => { for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? '#2a6ac8' : '#f4f6fa'; c.fillRect(k * 16, 0, 16, 256); } });
    const walls = new T.Mesh(new T.BoxGeometry(9, 7, 9), [new T.MeshLambertMaterial({ map: stripes }), new T.MeshLambertMaterial({ map: stripes }), new T.MeshLambertMaterial({ color: 0x2a6ac8 }), new T.MeshLambertMaterial({ color: 0xffffff }), new T.MeshLambertMaterial({ map: stripes }), new T.MeshLambertMaterial({ map: stripes })]);
    walls.position.y = 3.5; g.add(walls);
    part(L.GEO.box, '#1a3a7a', 9.6, 0.6, 9.6, 0, 7.2, 0, g);
    const dome = new T.Mesh(new T.SphereGeometry(3.6, 24, 12, 0, 6.283, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0xe8b830, metalness: 0.7, roughness: 0.3 })); dome.position.y = 7.4; g.add(dome);
    part(L.GEO.cone, '#e8b830', 0.25, 1.6, 0.25, 0, 11.6, 0, g);
    part(L.GEO.box, '#3a2a1a', 2.2, 4, 0.2, 0, 2, 4.55, g);
    const sign = new T.Mesh(new T.PlaneGeometry(6, 1.2), new T.MeshBasicMaterial({ map: L.textTex('🛡️ ZUFLUCHT', 512, 100, '#0a1a3a', '#ffffff', 'bold 62px Arial') })); sign.position.set(0, 9, 4.7); g.add(sign);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    L.scene.add(g); return g;
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
  function startIntro() {
    cleanupModels();
    B.rig = buildRuslan(); B.rig.root.scale.setScalar(5); L.scene.add(B.rig.root);
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
    // 0–2,8 s: Schild in deine Richtung werfen und zurückfangen
    if (t < 2.8) {
      const u = t / 2.8, d = Math.sin(u * Math.PI) * 70, hand = new T.Vector3(); R.arms[1].elbow.getWorldPosition(hand);
      if (t > 0.5) { rigShield(true); B.shield.position.set(hand.x + fx * d + Math.cos(a) * Math.sin(u * 6.28) * 8, hand.y + Math.sin(u * Math.PI) * 4, hand.z + fz * d - Math.sin(a) * Math.sin(u * 6.28) * 8); B.shield.rotation.set(Math.PI / 2, t * 18, 0); }
      R.arms[1].arm.rotation.x = t < 0.5 ? -0.5 - t * 3 : -1.6; R.arms[1].arm.rotation.z = 0.6;
      Object.assign(B.cam, { x: B.x + fx * 90 + Math.cos(a) * 25, y: 14, z: B.z + fz * 90 - Math.sin(a) * 25, lx: B.x + fx * 30, ly: 12, lz: B.z + fz * 30 });
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
    if (t > 8) { const k = ease((t - 8) / 1.2); R.root.position.set(L.lerp(B.x, bg.position.x, k), L.lerp(0, TOP + Math.sin(k * Math.PI) * 15, k), L.lerp(B.z, bg.position.z, k)); }
    if (t > 9.5 || (!L.cine && t > 0.3)) { if (L.cine && L.endCine) L.endCine(); B.state = 'hunt'; B.t = 0; B.x = bg.position.x; B.z = bg.position.z; B.bag.g.position.y = 0; L.banner('🚜 RUSLAN JAGT DICH – 5 MINUTEN', 'Rette dich ins blau-weiße Häuschen (🛡️ Zuflucht)!'); }
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
  // Schlussfilm: MAMA IVA in goldener Super-Form – Ruslan überfährt sie
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
    L.banner('⚡ MAMA IVA – SUPER STUFE 100', 'Sie hat ihre goldene Endform erreicht …');
    L.startCine('⚡ RUSLAN GEGEN MAMA IVA (SUPER STUFE 100)', 14, () => B.cam);
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
      if (t - dt < 9) L.banner('🛡️ RUSLAN HAT GEWONNEN', 'MAMA IVA wurde vom Riesenbagger plattgewalzt.');
    }
    B.bag.boom.rotation.x = t > 9 ? -0.9 : -0.3;
    const cA = a + 1.3 + t * 0.06, cd = 230 - t * 5;
    Object.assign(B.cam, { x: B.x + Math.sin(cA) * cd, y: 35 + Math.max(0, 10 - t) * 2, z: B.z + Math.cos(cA) * cd, lx: (ivx + bg.g.position.x) / 2, ly: 18, lz: (ivz + bg.g.position.z) / 2 });
    if (t > 14 || (!L.cine && t > 0.3)) { if (L.cine && L.endCine) L.endCine(); if (onIsland() && P.alive && L.gotBossCoins) L.gotBossCoins(500, 'das Überleben gegen Ruslan'); cleanupModels(); B.state = 'pause'; B.pauseT = 600; }
  }

  // ---------- jedes Bild ----------
  L.updateRuslan = function (dt) {
    if (!B.house && L.curIsland === I) B.house = buildSafeHouse();
    for (let i = B.fx.length - 1; i >= 0; i--) { const f = B.fx[i]; f.t += dt; f.m.material.opacity = 0.4 + Math.sin(f.t * 20) * 0.4; if (f.t >= f.dur) { L.scene.remove(f.m); B.fx.splice(i, 1); if (f.cb) f.cb(); } }
    if (B.state === 'pause') { if (onIsland()) { B.pauseT -= dt; if (B.pauseT <= 0 && P.alive && !L.cine) startIntro(); } return; }
    if (B.state === 'intro') { B.t += dt; updIntro(dt); return; }
    if (B.state === 'hunt') { updHunt(dt); if (B.t > 300) { if (onIsland() && P.alive && !L.cine) startEnding(); else { cleanupModels(); B.state = 'pause'; B.pauseT = 600; } } return; }
    if (B.state === 'ending') { B.t += dt; updEnding(dt); return; }
    if (B.state === 'defeat') { B.t += dt; B.bag.g.position.y = -B.t * 2; B.rig.root.position.y = TOP - B.t * 2; if (B.t > 12) { cleanupModels(); B.state = 'pause'; B.pauseT = 600; } }
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
