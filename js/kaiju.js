'use strict';
// DIE URZEIT-ECHSE: Riesen-Boss der Heimat (eigener Entwurf). Steigt aus dem Boden, stampft durch die Stadt,
// lädt ihre leuchtenden Rückenstacheln auf und feuert einen blauen Strahl aus dem Maul.
// Läuft in der Boss-Reihe mit BIG MAMA, Riesen-Viktor, Riesen-Walross und Riesen-Daniel.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const G = () => L.GEO;
  const glowMat = new T.MeshStandardMaterial({ color: 0x7ae8ff, emissive: 0x2ab8ff, emissiveIntensity: 0.4, roughness: 0.4 });
  function part(geo, m, sx, sy, sz, x, y, z, par) { const o = new T.Mesh(geo, typeof m === 'string' ? L.mat(m) : m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; }
  const grp = (par, x, y, z) => { const g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); par.add(g); return g; };
  // Maße in Einheiten (wird mit S ≈ 15 skaliert → etwa 55 m hoch)
  L.buildEchse = function () {
    const root = new T.Group(), body = grp(root, 0, 0, 0);
    const skin = L.mat('#3c4a3a'), dark = L.mat('#2a342a'), belly = L.mat('#6a6a52'), claw = L.mat('#d8d0b8');
    const hips = grp(body, 0, 1.55, 0);
    // Rumpf (leicht nach vorn geneigt, aufrecht)
    const torso = grp(hips, 0, 0.1, 0.05); torso.rotation.x = 0.18;
    part(G().sph, skin, 0.78, 1.05, 0.72, 0, 0.75, 0, torso);
    part(G().sph, belly, 0.6, 0.95, 0.5, 0, 0.7, 0.28, torso);
    for (let k = 0; k < 6; k++) part(G().box, L.mat('#7a7a60'), 0.7 - k * 0.04, 0.05, 0.1, 0, 0.2 + k * 0.22, 0.74 - Math.abs(k - 2.5) * 0.04, torso);
    part(G().sph, skin, 0.72, 0.6, 0.66, 0, 0.0, -0.05, hips);
    // Hals und Kopf
    const neck = grp(torso, 0, 1.55, 0.18);
    part(G().sph, skin, 0.42, 0.5, 0.42, 0, 0.1, 0, neck);
    const head = grp(neck, 0, 0.5, 0.12);
    part(G().box, skin, 0.55, 0.42, 0.75, 0, 0.05, 0.2, head);
    part(G().box, dark, 0.58, 0.12, 0.6, 0, 0.27, 0.12, head);
    for (const sd of [-1, 1]) { part(G().sph, new T.MeshBasicMaterial({ color: 0xffd040 }), 0.05, 0.045, 0.03, sd * 0.2, 0.15, 0.52, head); part(G().box, dark, 0.14, 0.06, 0.16, sd * 0.2, 0.22, 0.48, head); }
    const upT = []; for (let k = 0; k < 7; k++) { const t = part(G().cone, claw, 0.035, 0.1, 0.035, -0.21 + k * 0.07, -0.18, 0.5 - Math.abs(k - 3) * 0.02, head); t.rotation.x = Math.PI; upT.push(t); }
    const jaw = grp(head, 0, -0.12, 0.0);
    part(G().box, skin, 0.5, 0.14, 0.7, 0, -0.08, 0.22, jaw); part(G().box, belly, 0.42, 0.06, 0.6, 0, -0.14, 0.22, jaw);
    for (let k = 0; k < 6; k++) part(G().cone, claw, 0.03, 0.09, 0.03, -0.17 + k * 0.07, 0.03, 0.5, jaw);
    const mouthGlow = part(G().sph, new T.MeshBasicMaterial({ color: 0x9af0ff, transparent: true, opacity: 0 }), 0.18, 0.1, 0.2, 0, -0.08, 0.45, head);
    // Arme (kurz, mit Krallen)
    const arms = [];
    for (const sd of [-1, 1]) {
      const arm = grp(torso, sd * 0.68, 1.1, 0.35); part(G().sph, skin, 0.2, 0.42, 0.2, 0, -0.3, 0, arm);
      const fore = grp(arm, 0, -0.6, 0); part(G().sph, skin, 0.15, 0.32, 0.15, 0, -0.22, 0.05, fore);
      for (let k = 0; k < 3; k++) { const c = part(G().cone, claw, 0.035, 0.14, 0.035, (k - 1) * 0.07, -0.55, 0.12, fore); c.rotation.x = 2.6; }
      arm.rotation.x = -0.6; fore.rotation.x = -0.7; arms.push({ arm, fore, sd });
    }
    // Beine (dick, Säulen)
    const legs = [];
    for (const sd of [-1, 1]) {
      const leg = grp(hips, sd * 0.5, -0.05, 0); part(G().sph, skin, 0.42, 0.62, 0.48, 0, -0.35, 0.05, leg);
      const shin = grp(leg, 0, -0.85, 0.1); part(G().cyl, skin, 0.27, 0.75, 0.3, 0, -0.32, -0.05, shin);
      const foot = grp(shin, 0, -0.7, 0); part(G().box, dark, 0.5, 0.18, 0.7, 0, 0, 0.12, foot);
      for (let k = 0; k < 3; k++) { const c = part(G().cone, claw, 0.06, 0.18, 0.06, (k - 1) * 0.16, -0.02, 0.5, foot); c.rotation.x = Math.PI / 2; }
      legs.push({ leg, shin, foot, sd });
    }
    // Schwanz (lang, schleift fast am Boden)
    const tail = []; let par = hips, sc = 1;
    for (let k = 0; k < 9; k++) { const t = grp(par, 0, k ? -0.02 : -0.1, k ? -0.42 : -0.55); t.rotation.x = k ? 0.06 : 0.55; part(G().sph, skin, 0.42 * sc, 0.38 * sc, 0.4, 0, 0, -0.2, t); tail.push(t); par = t; sc *= 0.86; }
    // Rückenstacheln (leuchten beim Aufladen)
    const spines = [];
    const plate = new T.CylinderGeometry(0, 1, 1, 4, 1).rotateY(Math.PI / 4).scale(0.35, 1, 1);
    const addSp = (p2, x, y, z, h, rx) => { const m = new T.Mesh(plate, glowMat); m.scale.set(h * 0.75, h * 1.5, h * 0.8); m.position.set(x, y, z); m.rotation.x = rx || 0; m.castShadow = true; p2.add(m); spines.push(m); };
    for (let k = 0; k < 5; k++) for (const sd of [-0.18, 0, 0.18]) addSp(torso, sd, 0.4 + k * 0.28, -0.6 + k * 0.03, (sd ? 0.3 : 0.42) * (1 - Math.abs(k - 2) * 0.12), -0.3);
    for (const sd of [-0.1, 0.1]) addSp(neck, sd, 0.3, -0.32, 0.22, -0.4);
    tail.forEach((t, k) => { if (k < 8) addSp(t, 0, 0.32 * Math.pow(0.86, k), -0.2, 0.3 * Math.pow(0.88, k), -0.2); });
    // Strahl (wird in der Welt gezeichnet)
    const beam = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 14, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: 0x8af0ff, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
    beam.visible = false; beam.frustumCulled = false;
    const core = new T.Mesh(beam.geometry, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false })); core.visible = false; core.frustumCulled = false;
    root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    return { root, body, hips, torso, neck, head, jaw, arms, legs, tail, spines, mouthGlow, beam, core, kind: 'echse' };
  };
  // Stimme: tiefes, langes Brüllen mit Kreischen am Ende
  function voice(p) {
    if (!L.tn) return;
    L.tn({ f: 95, fTo: 60, dur: 1.6, type: 'sawtooth', vol: 0.45, pos: p, rev: true, ref: 80 });
    L.tn({ f: 420, fTo: 820, dur: 0.9, type: 'square', vol: 0.12, pos: p, delay: 0.5, rev: true, ref: 80 });
    L.tn({ f: 820, fTo: 300, dur: 1.1, type: 'sawtooth', vol: 0.14, pos: p, delay: 1.3, rev: true, ref: 80 });
    L.nz && L.nz({ dur: 1.8, f: 500, type: 'bandpass', q: 1.5, vol: 0.3, pos: p, ref: 80 });
  }
  const V = new T.Vector3(), V2 = new T.Vector3();
  // Haltung: gehen, und beim Angriff (u 0 … 1): Stacheln laden (0–0,55), Kopf hoch, dann Strahl nach vorn auf den Boden
  function pose(w, moving, u) {
    const r = w.rig, ph = w.ph, t = performance.now() / 1000;
    const walk = moving ? 1 : 0;
    r.legs.forEach((l) => { const s = Math.sin(ph * 0.9 + (l.sd > 0 ? 0 : Math.PI)) * 0.45 * walk; l.leg.rotation.x = s; l.shin.rotation.x = Math.max(0, -s) * 0.7; l.foot.rotation.x = -s * 0.4; });
    r.body.position.y = moving ? Math.abs(Math.sin(ph * 0.9)) * 0.06 : 0;
    r.torso.rotation.z = Math.sin(ph * 0.9) * 0.05 * walk;
    r.tail.forEach((q, k) => { q.rotation.y = Math.sin(t * 0.9 - k * 0.5) * 0.09 * (1 + walk); });
    r.arms.forEach((a) => { a.arm.rotation.x = -0.6 + Math.sin(ph * 0.9 + (a.sd > 0 ? Math.PI : 0)) * 0.15 * walk; });
    const charge = u > 0 ? L.clamp(u / 0.55, 0, 1) : 0, fire = u > 0.55 ? (u - 0.55) / 0.45 : 0;
    r.neck.rotation.x = -charge * 0.35 * (1 - fire) + fire * 0.25;
    r.head.rotation.x = -charge * 0.25 + fire * 0.35;
    const roar = w.roarAnim > 0 ? Math.sin(Math.min(1, w.roarAnim) * Math.PI) : 0;
    r.jaw.rotation.x = Math.max(charge * 0.25, fire > 0 ? 0.55 : 0, roar * 0.6, moving ? 0 : Math.max(0, Math.sin(t * 0.7)) * 0.08);
    // Stacheln leuchten von hinten nach vorn auf
    glowMat.emissiveIntensity = 0.35 + charge * 2.2 + (fire > 0 ? 1.5 + Math.random() * 0.8 : 0) + Math.sin(t * 2) * 0.08;
    r.spines.forEach((s, k) => { s.scale.y = (s.userData.h || (s.userData.h = s.scale.y)) * (1 + (charge > 1 - k / r.spines.length ? 0.12 : 0)); });
    r.mouthGlow.material.opacity = charge * 0.6 + (fire > 0 ? 0.9 : 0);
    // Strahl
    if (!r.beam.parent) { L.scene.add(r.beam); L.scene.add(r.core); }
    const on = fire > 0 && fire < 1;
    r.beam.visible = r.core.visible = on;
    if (on) {
      r.root.updateMatrixWorld(true); r.mouthGlow.getWorldPosition(V);
      const S = w.S, G0 = L.GBT.echse; V2.set(w.x + Math.sin(w.yaw) * S * G0.front * Math.min(1, fire * 1.6), 0.5, w.z + Math.cos(w.yaw) * S * G0.front * Math.min(1, fire * 1.6));
      const len = V.distanceTo(V2), thick = S * (0.09 + Math.sin(t * 40) * 0.01);
      for (const m of [r.beam, r.core]) { m.position.copy(V); m.lookAt(V2); }
      r.beam.scale.set(thick, thick, len); r.core.scale.set(thick * 0.4, thick * 0.4, len);
      if (Math.random() < 0.6) L.fx(Math.random() < 0.5 ? '#9af0ff' : '#ffffff', V2.x + L.rand(-4, 4), 1, V2.z + L.rand(-4, 4), 3, 14, { basic: true, size: 0.9, life: 0.7 });
      if (!w.fireSnd) { w.fireSnd = true; L.nz && L.nz({ dur: 1.4, f: 1800, type: 'bandpass', q: 0.8, vol: 0.4, pos: { x: V.x, y: V.y, z: V.z }, ref: 100 }); L.tn && L.tn({ f: 300, fTo: 1400, dur: 1.2, type: 'sawtooth', vol: 0.15, pos: { x: V.x, y: V.y, z: V.z }, ref: 100 }); }
    } else w.fireSnd = false;
    if (w.roarAnim > 0) w.roarAnim -= 1 / 60;
  }
  // Ende: zieht sich in den Boden zurück – oder fällt um, wenn ihr sie besiegt habt
  let leaving = null;
  function end(w) {
    const killed = w.hp <= 0 || w.dead;
    leaving = { rig: w.rig, x: w.x, z: w.z, yaw: w.yaw, S: w.S, t: 0, killed, ph: w.ph };
    if (w.rig.beam) w.rig.beam.visible = w.rig.core.visible = false;
    voice({ x: w.x, y: 30, z: w.z });
    const txt = killed ? ['🦖 DIE URZEIT-ECHSE IST BESIEGT!', 'Sie bricht zusammen und versinkt in der Erde.'] : ['🦖 DIE URZEIT-ECHSE ZIEHT SICH ZURÜCK', 'Mit einem letzten Brüllen versinkt sie wieder im Boden …'];
    if (L.atHome && L.atHome()) L.banner(txt[0], txt[1]);
    if (killed && L.atHome && L.atHome() && L.gotBossCoins) L.gotBossCoins(900, 'die Urzeit-Echse');
  }
  L.updateKaiju = function (dt) {
    if (!leaving) return;
    const q = leaving; q.t += dt; const r = q.rig;
    if (q.killed) { r.root.rotation.set(0, q.yaw, Math.min(1.4, q.t * 0.6)); r.root.position.set(q.x, -Math.max(0, q.t - 3) * q.S * 0.25, q.z); }
    else { q.ph += dt * 3; r.root.position.set(q.x, -q.t * q.S * 0.18, q.z); r.jaw.rotation.x = q.t < 2 ? Math.sin(q.t / 2 * Math.PI) * 0.6 : 0; }
    if (Math.random() < dt * 12) L.fx('#5a4630', q.x + L.rand(-25, 25), 1, q.z + L.rand(-25, 25), 3, 10, { size: 1.2, life: 2 });
    if (Math.hypot(P.x - q.x, P.z - q.z) < 400) L.shake = Math.max(L.shake, 0.3);
    if (q.t > 11) { L.scene.remove(r.root); if (r.beam) { L.scene.remove(r.beam); L.scene.remove(r.core); } leaving = null; }
  };
  L.clearKaiju = function () { if (leaving) { L.scene.remove(leaving.rig.root); if (leaving.rig.beam) { L.scene.remove(leaving.rig.beam); L.scene.remove(leaving.rig.core); } leaving = null; } };
  // Boss-Eintrag
  L.GBT.echse = { name: 'DIE URZEIT-ECHSE', short: 'URZEIT-ECHSE', icon: '🦖', lvl: 'echLvl', S: 15, speed: 6, hp: 10000, front: 2.6, top: 3.4,
    build: () => L.buildEchse(), voice: (p) => voice(p), cause: 'Vom Strahl der Urzeit-Echse getroffen', pose, end };
})();
