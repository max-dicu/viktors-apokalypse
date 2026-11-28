'use strict';
// Code-Skin „🌀 Gummi-Kapitän“ (eigener Entwurf): sein Körper ist aus Gummi.
// R = Gummi-Faust (Arm schnellt 18 m nach vorn) · F = Gummi-Rakete (Arme greifen weit vor, er schleudert sich hin)
// U = Riesenfaust (Faust bläst sich riesig auf + Faust-Hagel) · Rennen (Shift) = Dampf-Modus (rosa Dampf, schneller)
// Dazu: gummiartiges Wippen beim Laufen, Federn beim Landen.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const ID = 'gummi', PK = 'ddmbpz6anm';
  const ok = (app) => !!(app && typeof app.hk === 'string' && L.hash53(app.hk) === PK);
  const oTok = L.heroToken, oChk = L.heroCheck;
  L.heroToken = (id) => { if (id !== ID) return oTok ? oTok(id) : null; const k = L.save && L.save.heroKeys && L.save.heroKeys[ID]; return k && L.hash53(L.hash53(k)) === PK ? L.hash53(k) : null; };
  L.heroCheck = (code) => (L.hash53(L.hash53(code)) === PK ? ID : oChk ? oChk(code) : null);
  L.SKINS.push(['h_' + ID, '🌀 Gummi-Kapitän']);
  const LOOK = { name: 'Gummi-Kapitän', koerper: 'mann', skin: '#d9a57c', hair: 'wuschel', hairColor: '#1a1410', eyes: '#2a1a10', brows: 'dick', mouth: 'grinsen', nose: 'normal', beard: 'kein',
    hat: 'bandana', hatColor: '#1f8a8a', top: 'weste', topColor: '#2f5a3a', pants: 'cargoshorts', pantsColor: '#c8b07a', shoeType: 'sandale', shoes: '#6a4a2a', build: 'schmal', height: 'mittel', scar: 'wange' };
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    if (!app || app.special !== 'h_' + ID) return obh(app, force);
    if (!force && !ok(app)) return obh(Object.assign({}, app, { special: '' }), force);
    const r = obh(Object.assign({}, app, LOOK, { special: '' }), force);
    r.app = Object.assign({}, r.app, app); r.gummi = true;
    // Kapitäns-Mantel über den Schultern
    const coat = new T.Mesh(new T.PlaneGeometry(0.62, 0.78, 4, 6), new T.MeshStandardMaterial({ color: 0x14161c, roughness: 0.8, side: T.DoubleSide }));
    coat.position.set(0, 0.36, -0.17); coat.rotation.x = 0.08; if (r.torso) r.torso.add(coat); r.coat = coat;
    for (const sd of [-1, 1]) { const ep = new T.Mesh(L.GEO.box, new T.MeshStandardMaterial({ color: 0xd8b040, metalness: 0.8, roughness: 0.3 })); ep.scale.set(0.16, 0.03, 0.12); ep.position.set(sd * 0.2, 0.66, -0.06); if (r.torso) r.torso.add(ep); }
    return r;
  };
  const me = () => !!(P.rig && P.rig.gummi);

  // ---------- Fähigkeiten (über das Kampfsystem R / F / U) ----------
  const FX = () => L.battleFx;
  const G = { stretch: 0, stretchArm: 0, giant: 0, rocket: null, steam: 0 };
  const COL = 0xff4060;
  function stretchTo(len, dur, arm) { G.stretchArm = arm || 0; G.stretchLen = len; G.stretchT = 0; G.stretchD = dur; }
  function hitLine(len, w, dmg, launch, push) {
    const F = FX(), f = F.fwd(); let n = 0;
    for (const e of F.targets()) { const dx = e.x - P.x, dz = e.z - P.z, along = dx * f.x + dz * f.z, side = Math.abs(dx * f.z - dz * f.x); if (along > 0 && along < len && side < w + (e.bigR || 0)) { F.hit(e, dmg, COL, launch, push); n++; } }
    return n;
  }
  function install() {
    if (!L.battleKits || !L.battleA) return setTimeout(install, 300);
    const A = L.battleA;
    A.gFaust = () => { stretchTo(18, 0.55, 0); setTimeout(() => { const n = hitLine(18, 1.6, 110, 0.7, 10); const F = FX(), f = F.fwd(), p = new T.Vector3(P.x + f.x * 18, (P.y || 0) + 1.3, P.z + f.z * 18); F.ring(p, COL, n ? 5 : 3, 0.3); F.flashBall(p, 0xffffff, n ? 2.2 : 1.2, 0.2); if (n) { F.impactFrame(); F.camPunch(9, 0.8); } }, 220); };
    A.gRakete = () => {
      const F = FX(), f = F.fwd(), e = F.nearestFront(40), dist = e ? Math.max(6, Math.hypot(e.x - P.x, e.z - P.z) - 2) : 28;
      stretchTo(dist, 0.5, 2);
      setTimeout(() => { G.rocket = { t: 0, d: 0.35, x0: P.x, z0: P.z, x1: P.x + f.x * dist, z1: P.z + f.z * dist }; L.speedLines && L.speedLines(0.4); }, 300);
    };
    A.gRiese = () => {
      const F = FX(); G.giant = 0.001; F.slowmo(0.5, 0.3);
      // erst Faust-Hagel …
      for (let i = 0; i < 16; i++) setTimeout(() => { stretchTo(10 + Math.random() * 4, 0.12, i % 2); const f = F.fwd(), p = new T.Vector3(P.x + f.x * (4 + Math.random() * 7) + (Math.random() - 0.5) * 2, (P.y || 0) + 0.8 + Math.random() * 1.2, P.z + f.z * (4 + Math.random() * 7)); F.flashBall(p, 0xffd0d8, 0.6, 0.12); hitLine(13, 2.2, 18, 0, 0.4); F.camPunch(2, 0.2); }, 200 + i * 55);
      // … dann die Riesenfaust
      setTimeout(() => { G.giant = 1; stretchTo(16, 0.9, 0); }, 1150);
      setTimeout(() => { const n = hitLine(18, 5, 420, 1.2, 18); const f = F.fwd(), p = new T.Vector3(P.x + f.x * 14, (P.y || 0) + 1.5, P.z + f.z * 14); F.ring(p, COL, 14, 0.5); F.ring(p, 0xffffff, 8, 0.35); F.flashBall(p, 0xffe0e8, 6, 0.3); F.impactFrame(80); F.camPunch(16, 1.8); L.snd && L.snd.explosion && L.snd.explosion({ x: p.x, y: 1, z: p.z }); }, 1550);
      setTimeout(() => { G.giant = 0; }, 2400);
    };
    L.battleKits.h_gummi = { s1: { n: 'Gummi-Faust', t: 'gFaust', pose: 'gummi' }, s2: { n: 'Gummi-Rakete', t: 'gRakete', pose: 'gummi' }, u: { n: 'Riesenfaust', t: 'gRiese', pose: 'gummi' }, col: COL };
  }
  install();

  // ---------- Animation: Arme dehnen, Riesenfaust, Gummi-Wippen ----------
  const oapa = L.afterPlayerAnim;
  let wob = 0, lastY = 0, land = 0;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (!r || !r.gummi || P.vehicle) return;
    const arms = r.arms || [];
    // Gummi-Wippen beim Laufen + Federn beim Landen
    const moving = Math.hypot(P.vx || 0, P.vz || 0) > 1; wob += dt * (moving ? 9 : 2);
    const y = P.y || 0; if (lastY > 0.6 && y < 0.05) land = 1; lastY = y; land = Math.max(0, land - dt * 3);
    const sq = (moving ? Math.sin(wob) * 0.04 : 0) - land * 0.22 * Math.sin(land * Math.PI);
    r.root.scale.set(1 - sq * 0.6, 1 + sq, 1 - sq * 0.6);
    if (r.coat) r.coat.rotation.x = 0.08 + (moving ? 0.35 : 0.05) + Math.sin(wob * 0.7) * 0.06;
    // gedehnter Arm
    if (G.stretchD) {
      G.stretchT += dt; const u = Math.min(1, G.stretchT / G.stretchD), k = u < 0.4 ? u / 0.4 : 1 - (u - 0.4) / 0.6, len = 1 + (G.stretchLen / 0.6 - 1) * Math.max(0, k);
      const use = G.stretchArm === 2 ? [0, 1] : [G.stretchArm]; for (const i of use) { const a = arms[i]; if (!a) continue; a.arm.rotation.set(-1.57, 0, i ? 0.05 : -0.05); a.elbow.rotation.x = 0; a.arm.scale.y = len; }
      if (u >= 1) { G.stretchD = 0; for (const a of arms) a.arm.scale.y = 1; }
    }
    // Riesenfaust: Hand wird riesig
    if (r.hand) { const tgt = G.giant ? 7 : 1; r.hand.scale.setScalar(r.hand.scale.x + (tgt - r.hand.scale.x) * Math.min(1, dt * 8)); }
  };

  // ---------- jedes Bild: Raketen-Flug und Dampf-Modus ----------
  L.updateGummi = function (dt) {
    if (!me() || L.state !== 'game') return;
    if (G.rocket) { const R = G.rocket; R.t += dt; const u = Math.min(1, R.t / R.d), e = u * u * (3 - 2 * u); P.x = R.x0 + (R.x1 - R.x0) * e; P.z = R.z0 + (R.z1 - R.z0) * e; P.y = Math.sin(u * Math.PI) * 3; if (L.battleFx && Math.random() < 0.8) { const g = L.battleFx.ghostMesh(COL, 0.35); if (g) L.battleFx.addFx(g, 0.25, (o, k) => o.traverse((m) => { if (m.isMesh) m.material.opacity = 0.35 * (1 - k); })); }
      if (u >= 1) { G.rocket = null; P.y = 0; const F = L.battleFx; for (const t of F.near(P.x, P.z, 4.5)) F.hit(t, 140, COL, 0.9, 12); F.ring(new T.Vector3(P.x, 0.3, P.z), COL, 8, 0.4, true); F.impactFrame(); F.camPunch(11, 1.1); } }
    // Dampf-Modus: Q halten beim Rennen → schneller, rosa Dampf
    const K = L.keys || {}, on = (K.ShiftLeft || K.ShiftRight) && Math.hypot(P.vx || 0, P.vz || 0) > 3 && P.alive && !P.vehicle;
    G.steam = on ? Math.min(1, G.steam + dt * 3) : Math.max(0, G.steam - dt * 2);
    if (G.steam > 0) { P.x += (P.vx || 0) * dt * 0.8 * G.steam; P.z += (P.vz || 0) * dt * 0.8 * G.steam; if (Math.random() < 0.7) L.fx && L.fx('#ffb0c0', P.x + (Math.random() - 0.5) * 0.8, (P.y || 0) + 0.6 + Math.random() * 1.4, P.z + (Math.random() - 0.5) * 0.8, 1, 1.5, { basic: true, size: 0.35, life: 0.6 }); }
  };
})();
