'use strict';
// OMNITRON – Der Unendliche (eigener Entwurf): riesiger Roboter (~150 m), kommt jede Stunde in die Heimat.
// Nur der Ewigkeitshandschuh schadet ihm richtig, alles andere kratzt kaum. Angriffe: Augenlaser, Stampf-Welle, Stein-Regen.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const EVERY = 3600, HP = 40000, LIFE = 600, SC = 150 / 10;
  let O = null, clock = EVERY, hurtMsgT = 0;
  const STONES = [0xff2a2a, 0xffd020, 0x2a7aff, 0x30e070, 0xa040ff, 0xff8a20];
  const isClient = () => L.net && L.net.role === 'client';
  function build() {
    const root = new T.Group(), body = new T.Group(); root.add(body); body.scale.setScalar(SC);
    const mt = new T.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.9, roughness: 0.28 }), dk = new T.MeshStandardMaterial({ color: 0x3a2a5a, metalness: 0.8, roughness: 0.35 });
    const glow = (c) => new T.MeshBasicMaterial({ color: c });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; (par || body).add(o); return o; };
    const G = L.GEO, legs = [], arms = [];
    for (const s of [-1, 1]) { const lg = new T.Group(); lg.position.set(s * 0.8, 4.4, 0); body.add(lg); P3(G.cyl, mt, 0.45, 2.2, 0.5, 0, -1.1, 0, lg); P3(G.sph, dk, 0.5, 0.5, 0.5, 0, -2.2, 0, lg); const sh = new T.Group(); sh.position.y = -2.2; lg.add(sh); P3(G.cyl, mt, 0.38, 2.1, 0.42, 0, -1.05, 0, sh); P3(G.box, dk, 0.8, 0.3, 1.2, 0, -2.15, 0.2, sh); legs.push({ lg, sh }); }
    P3(new T.CylinderGeometry(0.75, 0.55, 1.2, 16), dk, 1, 1, 0.75, 0, 4.7, 0); P3(new T.CylinderGeometry(1.75, 0.85, 2.8, 20), mt, 1, 1, 0.55, 0, 6.4, 0); P3(G.sph, mt, 1.9, 0.45, 0.85, 0, 7.75, 0); for (const s2 of [-1, 1]) P3(new T.CylinderGeometry(0.06, 0.06, 2.6, 6), dk, 1, 1, 1, s2 * 0.5, 6.3, 0.62).rotation.z = s2 * 0.25;
    // Brustkern mit sechs Steinen
    P3(new T.TorusGeometry(0.55, 0.12, 8, 24), dk, 1, 1, 1, 0, 6.5, 0.72);
    const gems = STONES.map((c, k) => { const a = k / 6 * 6.283; return P3(new T.OctahedronGeometry(0.17), glow(c), 1, 1.3, 1, Math.sin(a) * 0.55, 6.5 + Math.cos(a) * 0.55, 0.78); });
    const core = P3(G.sph, glow(0xffffff), 0.32, 0.32, 0.12, 0, 6.5, 0.75);
    for (const s of [-1, 1]) {
      P3(G.sph, dk, 0.75, 0.6, 0.75, s * 1.85, 7.6, 0);
      const ar = new T.Group(); ar.position.set(s * 1.85, 7.4, 0); body.add(ar); P3(G.cyl, mt, 0.38, 2, 0.42, 0, -1, 0, ar);
      const fo = new T.Group(); fo.position.y = -2; ar.add(fo); P3(G.cyl, mt, 0.34, 1.8, 0.38, 0, -0.9, 0, fo); P3(G.box, dk, 0.6, 0.55, 0.45, 0, -1.95, 0, fo);
      arms.push({ ar, fo, s });
    }
    const head = new T.Group(); head.position.y = 8.3; body.add(head);
    P3(G.sph, mt, 0.5, 0.68, 0.55, 0, 0.45, 0, head); P3(G.sph, dk, 0.38, 0.42, 0.2, 0, 0.32, 0.4, head);
    for (const s of [-1, 1]) { const ey = P3(G.box, glow(0xff2a20), 0.2, 0.05, 0.05, s * 0.17, 0.52, 0.5, head); ey.rotation.z = s * -0.3; P3(G.sph, mt, 0.12, 0.35, 0.18, s * 0.42, 0.55, 0, head); }
    P3(G.box, glow(0xff2a20), 0.26, 0.025, 0.04, 0, 0.17, 0.56, head);
    P3(new T.OctahedronGeometry(0.09), glow(0xffd020), 1, 1.3, 0.8, 0, 0.82, 0.48, head); STONES.forEach((c, k) => { const a = -1.1 + k * 0.44; P3(new T.OctahedronGeometry(0.045), glow(c), 1, 1.3, 0.8, Math.sin(a) * 0.48, 0.92 + Math.cos(a) * 0.08, Math.cos(a) * 0.42, head); });
    P3(G.cone, mt, 0.18, 0.55, 0.3, 0, 1.15, -0.1, head).rotation.x = -0.4;
    for (let k = 0; k < 4; k++) { P3(G.box, glow(0xa040ff), 0.05, 2.2, 0.04, -0.9 + k * 0.6, 6.3, 0.72); }
    for (const s2 of [-1, 1]) { P3(G.box, glow(0xa040ff), 0.04, 0.5, 0.04, s2 * 1.85, 7.6, 0.72); P3(G.cone, dk, 0.25, 0.9, 0.25, s2 * 1.85, 8.3, 0); }
    const aura = new T.PointLight(0xa060ff, 3, 400, 2); aura.position.set(0, 6.5 * SC, 20); root.add(aura);
    root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    L.scene.add(root);
    return { root, body, legs, arms, head, gems, core, aura };
  }
  const beams = [];
  function beam(from, to, col, life) {
    const len = from.distanceTo(to), m = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 10, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    m.position.copy(from); m.lookAt(to); m.scale.set(3, 3, len); m.frustumCulled = false; L.scene.add(m); beams.push({ m, t: 0, life });
  }
  function spawn() {
    if (O) return;
    const A = (L._players ? L._players() : [P]).find((p) => L.worldOf && L.worldOf(p.x, p.z) === 'home') || { x: 0, z: 0 };
    const a = Math.random() * 6.283, x = L.clamp(A.x + Math.sin(a) * 500, -1300, 1300), z = L.clamp(A.z + Math.cos(a) * 500, -1300, 1300);
    const np = Math.max(1, (L._players ? L._players() : [P]).length), MX = HP * (1 + 0.75 * (np - 1));
    O = { kind: 'omni', key: 'omni', rig: build(), x, z, yaw: 0, hp: MX, max: MX, life: LIFE, cd: 6, atk: null, atkT: 0, ph: 0, dead: false, deadT: 0, hitR: 260, bigR: 22, hy: 70, y: 0, rise: 0 };
    L.omni = O;
    O.rift = new T.Mesh(new T.TorusGeometry(90, 14, 10, 48), new T.MeshBasicMaterial({ color: 0xa040ff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false, fog: false })); O.rift.rotation.x = Math.PI / 2; O.rift.position.set(x, 720, z); L.scene.add(O.rift);
    O.rig.gems.forEach((g) => g.scale.setScalar(0.01));
    if (L.atHome && L.atHome()) {
      L.banner('♾️ INFINITY-OMNITRON', 'Ein Titan aus Metall mit sechs Steinen in der Brust. Nur der 🧤 Ewigkeitshandschuh kann ihn besiegen!');
      L.snd.bossRoar && L.snd.bossRoar({ x, y: 80, z });
      const a0 = Math.atan2(P.x - x, P.z - z);
      L.startCine && L.startCine('♾️ INFINITY-OMNITRON', 8, (t) => { if (!O) return null; const aa = a0 + 0.4 - t * 0.08, d = 320 - t * 20; return { x: O.x + Math.sin(aa) * d, y: 30 + t * 8, z: O.z + Math.cos(aa) * d, lx: O.x, ly: 90 + 500 * (1 - Math.min(1, O.rise)), lz: O.z }; });
    }
  }
  L.spawnOmni = spawn;
  L.omniHit = function (dmg, src) {
    if (!O || O.dead) return;
    const g = !!(L._gauntletFiring || L._marlonFiring);
    O.hp -= g ? dmg * 1.5 : dmg * 0.002;
    if (!g && src === P && performance.now() > hurtMsgT) { hurtMsgT = performance.now() + 6000; L.msg('♾️ Das kratzt ihn kaum – nur der 🧤 Ewigkeitshandschuh hilft!', 3000); }
    L.fx(g ? '#c080ff' : '#ffd060', O.x, 60 + Math.random() * 60, O.z, 10, 10, { basic: true, size: 1.5, life: 0.6 });
    if (L.showBossHp) L.showBossHp('♾️ INFINITY-OMNITRON', Math.max(0, O.hp), O.max);
    if (O.hp <= 0) die(src);
  };
  // ---------- Kurzfilm: INFINITY-KOLOSS (eigener Entwurf, grüner Riese mit Stein-Faust) ----------
  function buildHulk() {
    const root = new T.Group(), body = new T.Group(); root.add(body); body.scale.setScalar(11);
    const sk = new T.MeshStandardMaterial({ color: 0x6d8656, roughness: 0.85, metalness: 0.02 }), rot = L.mat('#3a3a24'), bone = L.mat('#d8cfae'), eyeM = new T.MeshBasicMaterial({ color: 0xe8ff40 }), sh = new T.MeshStandardMaterial({ color: 0x4a2a6a, roughness: 0.9 }), hr = L.mat('#151515'), gd = new T.MeshStandardMaterial({ color: 0xe0b030, metalness: 0.9, roughness: 0.3 });
    const G = L.GEO, P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; (par || body).add(o); return o; };
    const legs = [], arms = [];
    for (const s of [-1, 1]) { const lg = new T.Group(); lg.position.set(s * 0.6, 3.3, 0); body.add(lg); P3(G.cyl, sk, 0.6, 1.7, 0.65, 0, -0.85, 0, lg); const sn = new T.Group(); sn.position.y = -1.7; lg.add(sn); P3(G.cyl, sk, 0.5, 1.5, 0.55, 0, -0.75, 0, sn); P3(G.box, sk, 0.6, 0.25, 0.9, 0, -1.55, 0.15, sn); legs.push({ lg, sn }); }
    P3(G.box, sh, 1.7, 0.9, 1.1, 0, 3.4, 0); for (let k = 0; k < 6; k++) P3(G.box, sh, 0.25, 0.3, 0.2, -0.7 + k * 0.28, 2.85 - (k % 2) * 0.12, 0.45);
    P3(G.sph, sk, 1.2, 1.0, 0.85, 0, 4.4, 0); P3(G.sph, sk, 1.75, 1.35, 1.05, 0, 5.6, 0);
    for (const s of [-1, 1]) P3(G.sph, sk, 0.75, 0.55, 0.4, s * 0.62, 5.9, 0.75);
    for (let k = 0; k < 6; k++) P3(G.sph, sk, 0.32, 0.22, 0.2, (k % 2 ? 0.3 : -0.3), 4.9 - Math.floor(k / 2) * 0.38, 0.8);
    const head = new T.Group(); head.position.y = 7.1; body.add(head);
    P3(G.cyl, sk, 0.55, 0.5, 0.55, 0, -0.35, 0, head); P3(G.sph, sk, 0.52, 0.6, 0.55, 0, 0.25, 0.05, head); P3(G.sph, hr, 0.56, 0.4, 0.58, 0, 0.55, -0.05, head);
    P3(G.box, hr, 0.6, 0.1, 0.12, 0, 0.42, 0.5, head).rotation.x = 0.2; P3(G.box, sk, 0.5, 0.2, 0.3, 0, -0.02, 0.45, head);
    for (const s of [-1, 1]) { P3(G.sph, eyeM, 0.12, 0.08, 0.05, s * 0.2, 0.3, 0.55, head); P3(G.sph, rot, 0.18, 0.14, 0.06, s * 0.2, 0.28, 0.52, head); }
    for (let k = 0; k < 7; k++) P3(G.box, bone, 0.06, 0.1, 0.05, -0.18 + k * 0.06, -0.02, 0.62, head);
    P3(G.sph, bone, 0.2, 0.15, 0.1, 0.3, 0.5, 0.35, head);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { P3(G.box, bone, 0.07, 0.07, 0.6, s * (1.2 - k * 0.05), 5.9 - k * 0.32, 0.25, body).rotation.y = s * 0.5; P3(G.box, rot, 0.08, 0.3, 0.55, s * (1.15 - k * 0.05), 5.75 - k * 0.32, 0.22, body); }
    for (let k = 0; k < 26; k++) { const a = Math.random() * 6.283, y = 3 + Math.random() * 4; P3(G.sph, rot, 0.25 + Math.random() * 0.25, 0.2 + Math.random() * 0.3, 0.12, Math.sin(a) * 1.55, y, Math.cos(a) * 0.95, body); }
    const aura = new T.PointLight(0xc060ff, 4, 300, 2); aura.position.set(0, 60, 30); root.add(aura);
    const mouth = P3(G.box, L.mat('#2a0a0a'), 0.3, 0.06, 0.05, 0, 0.05, 0.6, head);
    for (const s of [-1, 1]) {
      P3(G.sph, sk, 0.85, 0.75, 0.8, s * 1.7, 6.3, 0);
      const ar = new T.Group(); ar.position.set(s * 1.85, 6.3, 0); body.add(ar); P3(G.cyl, sk, 0.6, 1.9, 0.65, 0, -0.95, 0, ar);
      const fo = new T.Group(); fo.position.y = -1.9; ar.add(fo); P3(G.cyl, sk, 0.62, 1.7, 0.66, 0, -0.85, 0, fo); P3(G.sph, sk, 0.65, 0.6, 0.65, 0, -1.95, 0, fo);
      if (s > 0) { P3(G.box, gd, 0.8, 0.7, 0.8, 0, -1.9, 0, fo); P3(G.cyl, gd, 0.7, 0.9, 0.72, 0, -1.2, 0, fo); STONES.forEach((c, k) => P3(new T.OctahedronGeometry(0.14), new T.MeshBasicMaterial({ color: c }), 1, 1.3, 1, -0.24 + (k % 3) * 0.24, -1.7 - Math.floor(k / 3) * 0.35, 0.42, fo)); } else { P3(G.box, bone, 0.15, 0.8, 0.15, 0.3, -1, 0.3, fo); P3(G.sph, rot, 0.35, 0.6, 0.3, 0.25, -0.9, 0.2, fo); }
      arms.push({ ar, fo, s });
    }
    root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    L.scene.add(root);
    return { root, body, legs, arms, head, mouth };
  }
  function craterTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, '#0a0604'); gr.addColorStop(0.35, '#1e140c'); gr.addColorStop(0.62, '#3e2e1c'); gr.addColorStop(0.8, '#6a5638'); gr.addColorStop(1, 'rgba(90,75,50,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 2; for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + Math.random() * 0.3; g.beginPath(); g.moveTo(128 + Math.cos(a) * 30, 128 + Math.sin(a) * 30); g.lineTo(128 + Math.cos(a + 0.1) * 80, 128 + Math.sin(a + 0.1) * 80); g.lineTo(128 + Math.cos(a - 0.05) * 124, 128 + Math.sin(a - 0.05) * 124); g.stroke(); }
    return new T.CanvasTexture(c);
  }
  function makeCrater(x, z) {
    const g = new T.Group(); g.position.set(x, 0, z);
    const d = new T.Mesh(new T.CircleGeometry(170, 48), new T.MeshBasicMaterial({ map: craterTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); d.rotation.x = -Math.PI / 2; d.position.y = 0.4; d.renderOrder = 2; g.add(d);
    const rim = new T.Mesh(new T.TorusGeometry(150, 16, 8, 40), L.mat('#5a4a32')); rim.rotation.x = Math.PI / 2; rim.scale.z = 0.5; rim.position.y = 2; g.add(rim);
    for (let k = 0; k < 46; k++) { const a = Math.random() * 6.283, rr = 135 + Math.random() * 45, s = 4 + Math.random() * 12; const m = new T.Mesh(new T.DodecahedronGeometry(s), L.mat(k % 3 ? '#5a4a36' : '#3a3026')); m.position.set(Math.sin(a) * rr, s * 0.4, Math.cos(a) * rr); m.rotation.set(Math.random() * 3, Math.random() * 3, 0); g.add(m); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + Math.random() * 0.4, len = 120 + Math.random() * 160; const m = new T.Mesh(new T.PlaneGeometry(3 + Math.random() * 3, len), new T.MeshBasicMaterial({ color: 0x140c06, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); m.rotation.set(-Math.PI / 2, 0, -a); m.position.set(Math.sin(a) * (150 + len / 2), 0.5, Math.cos(a) * (150 + len / 2)); g.add(m); }
    L.scene.add(g); return g;
  }
  function startHulk() {
    const ox = O.x, oz = O.z, a = O.yaw, hx = ox + Math.sin(a) * 170, hz = oz + Math.cos(a) * 170;
    const H = buildHulk(); O.hulk = { H, x: hx, z: hz, y: 700, sx: hx, sz: hz, yaw: Math.atan2(ox - hx, oz - hz), ev: {}, flung: null };
    O.rig.root.rotation.order = 'YXZ'; O.yaw = Math.atan2(hx - ox, hz - oz); O.rig.root.rotation.y = O.yaw;
    L.startCine && L.startCine('🧟 INFINITY-KOLOSS', 28, (t) => hulkCam(t));
  }
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  function hulkCam(t) {
    if (!O || !O.hulk) return null; if (t >= 8.5) t -= 4; else if (t >= 2.5) { const U2 = O.hulk, sx2 = Math.cos(U2.yaw), sz2 = -Math.sin(U2.yaw), fx2 = Math.sin(U2.yaw), fz2 = Math.cos(U2.yaw); if (t < 5) return { x: U2.x + fx2 * 70 + sx2 * 40, y: 60, z: U2.z + fz2 * 70 + sz2 * 40, lx: U2.x, ly: 95, lz: U2.z }; return { x: (U2.x + O.x) / 2 + sx2 * 300, y: 60, z: (U2.z + O.z) / 2 + sz2 * 300, lx: O.x - fx2 * 40, ly: 50, lz: O.z - fz2 * 40 }; }
    const U = O.hulk, ox = O.x, oz = O.z, sx = Math.cos(U.yaw), sz = -Math.sin(U.yaw), fx = Math.sin(U.yaw), fz = Math.cos(U.yaw);
    const mx = (U.x + ox) / 2, mz = (U.z + oz) / 2;
    if (t < 2.5) return { x: mx + sx * 330, y: 40, z: mz + sz * 330, lx: U.x, ly: U.y + 40, lz: U.z };
    if (t < 4.5) return { x: U.x + fx * 75 + sx * 20, y: 70, z: U.z + fz * 75 + sz * 20, lx: U.x, ly: 80, lz: U.z };
    if (t < 7) return { x: U.x + sx * 180, y: 50, z: U.z + sz * 180, lx: U.x, ly: 50, lz: U.z };
    if (t < 12) return { x: U.x - fx * 110 + sx * 50, y: 95, z: U.z - fz * 110 + sz * 50, lx: ox, ly: 85, lz: oz };
    if (t < 14.5) return { x: mx + sx * 260, y: 70, z: mz + sz * 260, lx: mx, ly: 60, lz: mz };
    if (t < 17.3) return { x: ox + sx * 120 - fx * 60, y: 12, z: oz + sz * 120 - fz * 60, lx: U.x, ly: U.y + 50, lz: U.z };
    const k = (t - 17.3) / 6.7, cx = U.cx || ox, cz = U.cz || oz;
    return { x: cx + sx * lerp(160, 260, k), y: lerp(25, 320, k), z: cz + sz * lerp(160, 260, k), lx: cx, ly: 0, lz: cz };
  }
  function handPhase(U, H, r, t, dt) {
    const ev = U.ev, once = (n) => (ev[n] ? false : (ev[n] = true)), A = H.arms.find((a) => a.s > 0), B = H.arms.find((a) => a.s < 0), fx = Math.sin(U.yaw), fz = Math.cos(U.yaw);
    H.legs.forEach((l) => { l.lg.rotation.x = 0; l.sn.rotation.x = 0; }); B.ar.rotation.set(0, 0, -0.15); B.fo.rotation.x = -0.3; H.body.rotation.x = 0;
    const up = Math.min(1, (t - 2.5) / 1.2); A.ar.rotation.set(-2.9 * up, 0, 0.2); A.fo.rotation.x = -0.15; H.head.rotation.x = -0.2 * up; H.mouth.scale.y = 0.06;
    const hp = new T.Vector3(); A.fo.getWorldPosition(hp);
    if (t < 4.3 && Math.random() < dt * 25) L.fx(L.pick(['#ff2a2a', '#ffd020', '#2a7aff', '#30e070', '#a040ff', '#ff8a20']), hp.x, hp.y + 20, hp.z, 6, 30, { basic: true, size: 2.5, life: 0.7 });
    if (t >= 4.3 && once('pulse')) {
      L.shake = Math.max(L.shake, 2.5); L.tn && L.tn({ f: 1400, fTo: 80, dur: 1.4, type: 'sine', vol: 0.25 }); L.snd.bossRoar && L.snd.bossRoar({ x: O.x, y: 60, z: O.z });
      for (let k = 0; k < 6; k++) beam(hp.clone().setY(hp.y + 20), new T.Vector3(O.x + L.rand(-15, 15), 70 + k * 8, O.z + L.rand(-15, 15)), STONES[k], 0.8);
      for (let k = 0; k < 60; k++) { const a = k / 60 * 6.283; L.fx('#c080ff', O.x + Math.sin(a) * 70, 40, O.z + Math.cos(a) * 70, 20, 40, { basic: true, size: 3, life: 1.2 }); }
      L.msg('🧟✋ Der Koloss hebt nur die Hand – und Omnitron bricht zusammen!', 3500);
    }
    if (t >= 4.3) { const f = Math.min(1, (t - 4.3) / 1.4), g = t > 6.8 ? Math.min(1, (t - 6.8) / 1.6) : 0; r.root.rotation.x = -1.45 * f * f * (1 - g); r.root.position.y = 0; if (f >= 1 && once('fall0')) { L.shake = 3; L.snd.stomp && L.snd.stomp({ x: O.x, y: 0, z: O.z }); for (let k = 0; k < 50; k++) L.fx('#8a7a60', O.x - fx * L.rand(0, 140), 4, O.z - fz * L.rand(0, 140), 10, 25, { size: 3, life: 1.5 }); } if (t > 6.8 && once('roar0')) { L.snd.bossRoar && L.snd.bossRoar({ x: U.x, y: 60, z: U.z }); L.msg('🤖 Omnitron rappelt sich auf …', 2500); } }
  }
  function hulkFilm(dt) {
    const U = O.hulk, H = U.H, r = O.rig; let t = O.deadT;
    if (t >= 2.5 && t < 8.5 && U.ev.land) { handPhase(U, H, r, t, dt); H.root.position.set(U.x, U.y, U.z); H.root.rotation.y = U.yaw; return; }
    if (t >= 8.5) t -= 4;
    const ev = U.ev, once = (n) => (ev[n] ? false : (ev[n] = true));
    if (t >= 4.5 && once('up0')) r.root.rotation.x = 0;
    const ox = O.x, oz = O.z, fx = Math.sin(U.yaw), fz = Math.cos(U.yaw);
    const roar = () => { L.snd.bossRoar && L.snd.bossRoar({ x: U.x, y: 60, z: U.z }); L.tn && L.tn({ f: 90, fTo: 50, dur: 1.6, type: 'sawtooth', vol: 0.22 }); };
    const hit = (x, y, z, big) => { L.shake = Math.max(L.shake, big ? 2.2 : 1.2); L.snd.stomp && L.snd.stomp({ x, y, z }); for (let k = 0; k < (big ? 40 : 18); k++) L.fx(L.pick(['#ffd040', '#ff6020', '#a040ff', '#ffffff']), x, y, z, big ? 30 : 16, 30, { basic: true, size: 2.5, life: 0.9 }); };
    H.arms.forEach((a) => { a.ar.rotation.set(0, 0, a.s * 0.15); a.fo.rotation.x = -0.3; }); H.legs.forEach((l) => { l.lg.rotation.x = 0; l.sn.rotation.x = 0; }); H.head.rotation.x = 0; H.body.rotation.x = 0;
    if (t < 2.5) { U.y = 700 * Math.pow(1 - t / 2.5, 2); H.arms.forEach((a) => { a.ar.rotation.z = a.s * 1.2; }); H.legs[0].lg.rotation.x = -0.6; H.legs[0].sn.rotation.x = 0.8; }
    else { U.y = Math.max(0, U.y); }
    if (t >= 2.5 && once('land')) { U.y = 0; hit(U.x, 2, U.z, true); for (let k = 0; k < 40; k++) { const a = k / 40 * 6.283; L.fx('#8a7a60', U.x + Math.sin(a) * 50, 3, U.z + Math.cos(a) * 50, 8, 25, { size: 3, life: 1.6 }); } L.banner('😡 INFINITY-KOLOSS', 'Der grüne Riese mit der Stein-Faust ist gelandet …'); }
    if (false) { const k = 0; H.arms.forEach((a) => { a.ar.rotation.z = a.s * 1.3 * k; a.fo.rotation.x = -1.2 * k; }); H.head.rotation.x = -0.5 * k; H.mouth.scale.y = 0.06 + 0.2 * k; H.body.rotation.x = -0.15 * k; if (once('roar1')) roar(); }
    else H.mouth.scale.y = 0.06;
    if (t >= 4.5 && t < 7) { const k = (t - 4.5) / 2.5, d0 = 170, d1 = 55; const d = lerp(d0, d1, k); U.x = ox + Math.sin(O.yaw) * d; U.z = oz + Math.cos(O.yaw) * d; const ph = t * 9; H.legs.forEach((l, i) => { const s = Math.sin(ph + i * Math.PI); l.lg.rotation.x = s * 0.8; l.sn.rotation.x = Math.max(0, -s) * 1.1; }); H.arms.forEach((a, i) => { a.ar.rotation.x = Math.sin(ph + (i ? 0 : Math.PI)) * 0.9; }); H.body.rotation.x = 0.3; if (Math.random() < dt * 8) L.shake = Math.max(L.shake, 0.6); }
    // Schlag-Kombo
    if (t >= 7 && t < 12) {
      const i = Math.floor((t - 7) / 0.75), p = ((t - 7) % 0.75) / 0.75, a = H.arms[i % 2], sw = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6;
      a.ar.rotation.x = -1.6 * sw; a.fo.rotation.x = -0.2; H.body.rotation.y = (i % 2 ? 0.3 : -0.3) * sw;
      if (p > 0.35 && once('p' + i)) { const hy = 80 + (i % 3) * 10; hit(ox, hy, oz, i % 3 === 2); r.body.rotation.z = (i % 2 ? 0.18 : -0.18); r.head.rotation.y = (i % 2 ? 0.6 : -0.6); }
      r.body.rotation.z *= 0.92; r.head.rotation.y *= 0.92; r.body.rotation.x = -0.08;
      if (t > 10.5 && once('rip')) { const arm = r.arms[0].ar; L.scene.attach(arm); U.flung = { m: arm, v: new T.Vector3(-fz * 90 + L.rand(-20, 20), 120, fx * 90), sp: new T.Vector3(3, 1, 4) }; hit(ox, 100, oz, true); L.msg('💥 Der Koloss reißt Omnitron einen Arm ab!', 3000); }
    }
    if (U.flung) { const F = U.flung; F.v.y -= 120 * dt; F.m.position.addScaledVector(F.v, dt); F.m.rotation.x += F.sp.x * dt; F.m.rotation.z += F.sp.z * dt; if (F.m.position.y < 5) { F.m.position.y = 5; if (F.v.y < 0) { if (Math.abs(F.v.y) > 30) hit(F.m.position.x, 3, F.m.position.z, false); F.v.set(0, 0, 0); F.sp.set(0, 0, 0); } } if (Math.random() < dt * 10) L.fx('#ffa030', F.m.position.x, F.m.position.y, F.m.position.z, 5, 10, { basic: true, size: 1.5, life: 0.6 }); }
    // Uppercut, Omnitron kippt nach hinten
    if (t >= 12 && t < 14.5) { const k = (t - 12) / 0.4; H.arms[1].ar.rotation.x = -2.6 * Math.min(1, k); H.legs[1].lg.rotation.x = -0.4; if (t > 12.35 && once('upper')) { hit(ox, 110, oz, true); L.msg('😡 UPPERCUT!', 2000); } const f = Math.max(0, Math.min(1, (t - 12.35) / 1.8)); r.root.rotation.x = -1.45 * f * f; r.root.position.y = Math.sin(f * Math.PI) * 40; if (f >= 1 && once('fall')) { hit(ox - fx * 70, 5, oz - fz * 70, true); for (let k2 = 0; k2 < 50; k2++) L.fx('#8a7a60', ox - fx * L.rand(0, 140), 4, oz - fz * L.rand(0, 140), 10, 25, { size: 3, life: 1.5 }); } }
    if (t >= 14.5) { r.root.rotation.x = -1.45; }
    // Sprung und SMASH
    if (t >= 14.5 && t < 17.3) {
      U.cx = ox - fx * 75; U.cz = oz - fz * 75;
      if (t < 16.5) { const k = (t - 14.5) / 2; U.x = lerp(U.x, U.cx, dt * 2); U.z = lerp(U.z, U.cz, dt * 2); U.y = Math.sin(k * Math.PI * 0.5) * 380; H.arms.forEach((a) => { a.ar.rotation.x = -3.0; a.ar.rotation.z = -a.s * 0.3; }); H.legs.forEach((l) => { l.lg.rotation.x = -1.2; l.sn.rotation.x = 1.6; }); if (once('jump')) { hit(U.x, 2, U.z, false); roar(); } }
      else { const k = (t - 16.5) / 0.8; U.x = U.cx; U.z = U.cz; U.y = 380 * (1 - k * k); const sw = Math.min(1, k * 1.5); H.arms.forEach((a) => { a.ar.rotation.x = -3.0 + sw * 1.6; a.ar.rotation.z = -a.s * 0.3; }); H.body.rotation.x = 0.5 * sw; }
    }
    if (t >= 17.3 && once('smash')) {
      U.x = U.cx; U.z = U.cz; U.y = -12; L.shake = 4; O.crater = makeCrater(U.cx, U.cz);
      r.root.position.y = -28; r.body.scale.set(SC * 1.05, SC * 0.8, SC * 1.05);
      L.snd.stomp && L.snd.stomp({ x: U.cx, y: 0, z: U.cz }); L.snd.bossRoar && L.snd.bossRoar({ x: U.cx, y: 0, z: U.cz }); L.tn && L.tn({ f: 60, fTo: 25, dur: 2.5, type: 'square', vol: 0.3 });
      for (let k = 0; k < 120; k++) { const a = Math.random() * 6.283, rr = Math.random() * 170; L.fx(L.pick(['#8a7a60', '#6a5a40', '#ffd040', '#a040ff']), U.cx + Math.sin(a) * rr, 5, U.cz + Math.cos(a) * rr, 30, 60, { size: 4, life: 2.2 }); }
      L.banner('💥 HULK-SMASH! OMNITRON IST ZERSCHMETTERT', 'Ein riesiger Krater bleibt zurück …');
    }
    if (t >= 17.3 && t < 30) { if (U.y < 0) U.y = Math.min(0, U.y + dt * 4); H.body.rotation.x = t < 19 ? 0.6 : 0; H.arms.forEach((a) => { a.ar.rotation.x = t < 19 ? -1.4 : -0.9 + Math.sin(t * 8) * (t > 20 && t < 23 ? 0.5 : 0); a.ar.rotation.z = a.s * 0.3; a.fo.rotation.x = -1.4; }); if (t > 19.5 && once('roar2')) roar(); if (t > 19.5 && t < 22) { H.head.rotation.x = -0.6; H.mouth.scale.y = 0.26; } if (Math.random() < dt * 6) L.fx('#6a5a40', U.cx + L.rand(-150, 150), 6, U.cz + L.rand(-150, 150), 4, 30, { size: 4, life: 2 }); }
    if (t >= 36) { U.y += dt * 200; H.arms.forEach((a) => { a.ar.rotation.x = -3; }); if (once('away')) { hit(U.x, 2, U.z, false); L.msg('😡 Der Koloss springt davon …', 3000); } }
    H.root.position.set(U.x, U.y, U.z); H.root.rotation.y = U.yaw;
  }
  function die(src) {
    O.dead = true; O.deadT = 0; try { startHulk(); } catch (e) { O.hulk = null; }
    if (L.atHome && L.atHome()) { L.banner('♾️ INFINITY-OMNITRON IST BESIEGT!', 'Die sechs Steine zerspringen – unglaublich!'); const np = O.max / HP, tb = 0.6 + 0.9 * Math.max(0, O.life) / LIFE, c = Math.round(5000 * np * tb / 50) * 50; if (L.gotBossCoins) L.gotBossCoins(c, 'Omnitron'); L.msg('💰 ' + c + ' Münzen – ' + (np > 1 ? 'stärkerer Omnitron (' + Math.round(np * 100) + '% HP)' : 'normaler Omnitron') + (tb > 1.2 ? ', schnell besiegt!' : ''), 6000); }
  }
  function hurtNear(x, z, r, dmg, why) {
    if (!(L.atHome && L.atHome()) || !P.alive || (P.spawnProt > 0)) return;
    if (Math.hypot(P.x - x, P.z - z) < r && (P.y || 0) < 8) L.hurtPlayer(dmg, why);
  }
  L.updateOmnitron = function (dt) {
    if (L.state !== 'game') return;
    for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.t += dt; b.m.material.opacity = 0.85 * (1 - b.t / b.life); if (b.t > b.life) { L.scene.remove(b.m); beams.splice(i, 1); } }
    if (!O && L._omniFinale && P.alive && !L.cine) { L._omniFinale -= dt; if (L._omniFinale <= 0) { L._omniFinale = 0; spawn(); O.rise = 1; O.life = LIFE * 0.5; if (O.rift) { L.scene.remove(O.rift); O.rift = null; } O.rig.root.position.set(O.x, 0, O.z); O.rig.root.rotation.y = O.yaw; O.rig.gems.forEach((g) => g.scale.setScalar(1)); L.banner('♾️ OMNITRON – LETZTE SEKUNDEN', 'Er hat kaum noch Kraft …'); O.finT = 2.5; } return; }
    if (!O) { if (!isClient()) { if (L._omniSoon) { L._omniSoon = false; clock = 10; L.msg('♾️ In 10 Sekunden kommt OMNITRON!', 5000); } if (L.save && !L.save.omniEarly && L.heroToken && L.heroToken('marlon')) { L.save.omniEarly = 1; L.persist && L.persist(); clock = Math.min(clock, 120); L.msg('♾️ Etwas reißt den Himmel auf … in 2 Minuten kommt OMNITRON!', 6000); } clock -= dt; if (clock <= 0) { clock = EVERY; spawn(); } } return; }
    const r = O.rig, t = performance.now() / 1000;
    if (O.dead && O.hulk) { O.deadT += dt; hulkFilm(dt); if (O.deadT > 50) clear(); return; }
    if (O.dead) { O.deadT += dt; r.root.rotation.z = Math.min(1.4, O.deadT * 0.25); r.root.position.y = -Math.max(0, O.deadT - 5) * 15; if (Math.random() < dt * 10) L.fx(L.pick(['#ff6020', '#ffd040', '#a040ff']), O.x + L.rand(-40, 40), L.rand(10, 120), O.z + L.rand(-40, 40), 6, 20, { basic: true, size: 2, life: 1 }); if (O.deadT > 14) clear(); return; }
    if (O.finT) { O.finT -= dt; if (O.finT <= 0) { O.finT = 0; if (L.cine && L.endCine) L.endCine(); O.hp = 0; die(P); return; } }
    O.life -= dt; const wasR = O.rise; O.rise = Math.min(1, O.rise + dt / 7);
    if (O.rift) { O.rift.rotation.z += dt * 2; O.rift.material.opacity = O.rise < 1 ? 0.9 : Math.max(0, O.rift.material.opacity - dt * 0.4); if (O.rift.material.opacity <= 0) { L.scene.remove(O.rift); O.rift = null; } if (O.rise < 1 && Math.random() < dt * 10) L.fx(L.pick(['#c080ff', '#ffffff', '#60a0ff']), O.x + L.rand(-80, 80), L.rand(200, 700), O.z + L.rand(-80, 80), 3, 20, { basic: true, size: 2, life: 1 }); }
    if (wasR < 1 && O.rise >= 1) { L.shake = Math.max(L.shake, 2.5); L.snd.stomp && L.snd.stomp({ x: O.x, y: 0, z: O.z }); L.snd.bossRoar && L.snd.bossRoar({ x: O.x, y: 80, z: O.z }); for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283; L.fx('#b080ff', O.x + Math.sin(a) * 90, 3, O.z + Math.cos(a) * 90, 6, 30, { basic: true, size: 2.5, life: 1.5 }); } }
    if (O.life <= 0) { if (L.atHome && L.atHome()) L.banner('♾️ INFINITY-OMNITRON ZIEHT WEITER', 'Er verschwindet in einem Riss im Himmel …'); clear(); return; }
    // Ziel: nächster Spieler in der Heimat
    let tg = null, bd = 1e9; for (const p of (L._players ? L._players() : [P])) { if (L.worldOf && L.worldOf(p.x, p.z) !== 'home') continue; const d = Math.hypot(p.x - O.x, p.z - O.z); if (d < bd) { bd = d; tg = p; } }
    O.ph += dt * 1.2; const walk = tg && bd > 90 && !O.atk;
    if (tg) { O.yaw += L.angDiff(O.yaw, Math.atan2(tg.x - O.x, tg.z - O.z)) * Math.min(1, dt * 0.8); if (walk) { O.x += Math.sin(O.yaw) * 9 * dt; O.z += Math.cos(O.yaw) * 9 * dt; } }
    r.legs.forEach((l, k) => { const s = walk ? Math.sin(O.ph + k * Math.PI) * 0.35 : 0; l.lg.rotation.x = s; l.sh.rotation.x = Math.max(0, -s) * 0.6; });
    r.arms.forEach((a) => { a.ar.rotation.x = walk ? Math.sin(O.ph + (a.s > 0 ? 0 : Math.PI)) * 0.25 : -0.2; a.fo.rotation.x = -0.4; });
    if (walk && Math.sin(O.ph) * Math.sin(O.ph - dt * 1.2) < 0 && bd < 600) { L.shake = Math.max(L.shake, 0.6 * (1 - bd / 600)); L.snd.stomp && L.snd.stomp({ x: O.x, y: 0, z: O.z }); }
    if (O.rise >= 1) r.gems.forEach((g, k) => { g.rotation.y += dt * 2; g.scale.setScalar(1 + Math.sin(t * 4 + k) * 0.15); });
    r.core.material.color.setHSL((t * 0.2) % 1, 0.6, 0.75); r.aura.intensity = 2.5 + Math.sin(t * 3) * 0.8;
    r.root.position.set(O.x, 650 * Math.pow(1 - O.rise, 2), O.z);
    if (O.rise < 1) r.gems.forEach((g, k) => { g.scale.setScalar(O.rise > 0.3 + k * 0.1 ? 1 : 0.01); }); r.root.rotation.y = O.yaw;
    // Angriffe
    O.cd -= dt;
    if (!O.atk && O.cd <= 0 && tg && O.rise >= 1) { O.atk = ['laser', 'stomp', 'stones'][Math.floor(Math.random() * 3)]; O.atkT = 0; O.tx = tg.x; O.tz = tg.z; if (L.atHome && L.atHome()) L.msg(O.atk === 'laser' ? '🔴 Omnitron lädt seine Augenlaser!' : O.atk === 'stomp' ? '💥 Omnitron hebt den Fuß – spring oder lauf weg!' : '💎 Die Steine leuchten – Stein-Regen!', 2000); }
    if (O.atk) {
      O.atkT += dt; const at = O.atkT;
      if (O.atk === 'laser') {
        r.head.rotation.x = 0.35;
        if (at > 1.2 && at < 2.6 && Math.random() < dt * 12) { const hp = new T.Vector3(); r.head.getWorldPosition(hp); hp.y += 8; const to = new T.Vector3(O.tx + L.rand(-6, 6), 0.5, O.tz + L.rand(-6, 6)); beam(hp, to, 0xff2020, 0.25); L.fx('#ff4020', to.x, 1, to.z, 6, 8, { basic: true, size: 0.8, life: 0.6 }); hurtNear(to.x, to.z, 9, 25, 'Von Omnitrons Augenlaser verdampft'); }
        if (at > 3) { O.atk = null; O.cd = 5; r.head.rotation.x = 0; }
      } else if (O.atk === 'stomp') {
        r.legs[0].lg.rotation.x = at < 1.3 ? -0.7 * (at / 1.3) : -0.7 + Math.min(1, (at - 1.3) / 0.2) * 0.7;
        if (at > 1.5 && !O.hitDone) { O.hitDone = true; L.shake = Math.max(L.shake, 2); L.snd.stomp && L.snd.stomp({ x: O.x, y: 0, z: O.z }); for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283; L.fx('#8a7a60', O.x + Math.sin(a) * 60, 2, O.z + Math.cos(a) * 60, 4, 14, { size: 2, life: 1.2 }); } hurtNear(O.x, O.z, 110, 55, 'Von Omnitrons Stampf-Welle zerschmettert'); }
        if (at > 2.5) { O.atk = null; O.hitDone = false; O.cd = 6; }
      } else {
        if (at > 0.8 && Math.random() < dt * 8 && at < 3.5) { const c = L.pick(STONES), x = O.tx + L.rand(-40, 40), z = O.tz + L.rand(-40, 40); const from = new T.Vector3(O.x, 6.5 * SC, O.z); beam(from, new T.Vector3(x, 0.5, z), c, 0.35); L.fx('#' + new T.Color(c).getHexString(), x, 1, z, 12, 12, { basic: true, size: 1, life: 0.8 }); hurtNear(x, z, 10, 30, 'Von einem Unendlichkeits-Stein getroffen'); }
        if (at > 4) { O.atk = null; O.cd = 6; }
      }
    }
  };
  function clear() { if (O) { if (O.rift) L.scene.remove(O.rift); if (O.hulk) { L.scene.remove(O.hulk.H.root); if (O.hulk.flung) L.scene.remove(O.hulk.flung.m); } if (O.crater) L.scene.remove(O.crater); L.scene.remove(O.rig.root); O = null; L.omni = null; } for (const b of beams) L.scene.remove(b.m); beams.length = 0; }
  const oue = L.updateEnv; L.updateEnv = function () { const res = oue.apply(this, arguments); if (L._clearFilm && O && O.hulk && L.scene.fog) { L.scene.fog.near = 3000; L.scene.fog.far = 14000; } if (L._clearFilm && !O && !L._omniFinale && L.cine == null) L._clearFilm = !!O; return res; };
  L.omniTargets = () => (O && !O.dead && L.atHome && L.atHome() ? [O] : []);
  L.omniText = () => (O && !O.dead ? '♾️ OMNITRON ist da – nur der Ewigkeitshandschuh hilft · noch ' + L.fmt(O.life) : '♾️ Omnitron kommt in ' + L.fmt(clock));
  L.clearOmnitron = function () { clear(); clock = EVERY; };
})();
