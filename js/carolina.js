'use strict';
// Militärbasis: 9 m hohe Glaswände (mit dem Auto zerbrechlich – sehr laut!) und THE TRUE CAROLINA.
// Sie ist das einzige Monster in der Basis und kann nicht hinaus. Sie hört Laufen nur aus der Nähe, Rennen weiter,
// Schleichen gar nicht – Autos, Schüsse und Glas dagegen sehr weit. Wenn sie dich erwischt: ein Schlag, tot (außer Admin).
(function () {
  const L = window.L, T = THREE, P = L.player, E = L.ents;
  const RES = { x: 0, z: 0 };
  // ---------- Glaswände ----------
  let panels = null;
  const glassMat = new T.MeshPhongMaterial({ color: 0xbfe6f5, transparent: true, opacity: 0.26, shininess: 120, specular: 0xffffff, depthWrite: false, side: T.DoubleSide });
  const frameMat = new T.MeshLambertMaterial({ color: 0x4a4e54 });
  const H = 9, PW = 6;
  function wall(x1, z1, x2, z2) {
    const len = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.round(len / PW)), alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n, ax = L.lerp(x1, x2, a), az = L.lerp(z1, z2, a), bx = L.lerp(x1, x2, b), bz = L.lerp(z1, z2, b), cx = (ax + bx) / 2, cz = (az + bz) / 2, w = len / n;
      const m = new T.Mesh(L.GEO.boxB, glassMat); m.scale.set(alongX ? w : 0.15, H, alongX ? 0.15 : w); m.position.set(cx, 0, cz); m.renderOrder = 2; L.scene.add(m);
      const post = new T.Mesh(L.GEO.boxB, frameMat); post.scale.set(0.35, H + 0.3, 0.35); post.position.set(ax, 0, az); L.scene.add(post);
      const bx1 = alongX ? Math.min(ax, bx) : cx - 0.25, bx2 = alongX ? Math.max(ax, bx) : cx + 0.25, bz1 = alongX ? cz - 0.25 : Math.min(az, bz), bz2 = alongX ? cz + 0.25 : Math.max(az, bz);
      const box = L.addBox(bx1, bz1, bx2, bz2, H, 'building');
      panels.push({ i: panels.length, m, box, ax, az, bx, bz, cx, cz, broken: false });
    }
    const top = new T.Mesh(L.GEO.boxB, frameMat); top.scale.set(alongX ? len : 0.4, 0.35, alongX ? 0.4 : len); top.position.set((x1 + x2) / 2, H, (z1 + z2) / 2); L.scene.add(top);
  }
  function buildWalls() {
    const M = L.MIL; panels = [];
    wall(M.x1, M.z1, M.x2, M.z1); wall(M.x1, M.z1, M.x1, M.z2); wall(M.x2, M.z1, M.x2, M.z2);
    wall(M.x1, M.z2, M.gate - 8, M.z2); wall(M.gate + 8, M.z2, M.x2, M.z2);
  }
  function segDist(px, pz, p) { const dx = p.bx - p.ax, dz = p.bz - p.az, l2 = dx * dx + dz * dz, t = L.clamp(((px - p.ax) * dx + (pz - p.az) * dz) / l2, 0, 1); return Math.hypot(px - (p.ax + dx * t), pz - (p.az + dz * t)); }
  function shatter(p, net) {
    if (p.broken) return; p.broken = true; p.m.visible = false; L.removeBox(p.box);
    for (let k = 0; k < 5; k++) L.fx(k % 2 ? '#e8fbff' : '#a8dcf0', p.cx + L.rand(-2, 2), L.rand(0.5, 7), p.cz + L.rand(-2, 2), 14, 7, { basic: true, size: 0.18, life: 1.4 });
    const d = Math.hypot(P.x - p.cx, P.z - p.cz), v = Math.max(0.1, 1 - d / 400);
    L.snd.crash && L.snd.crash(1, { x: p.cx, y: 2, z: p.cz });
    L.nz && L.nz({ dur: 1.4, f: 5200, type: 'highpass', vol: 0.55 * v }); L.nz && L.nz({ dur: 0.6, f: 2600, type: 'bandpass', q: 1, vol: 0.4 * v });
    L.shake = Math.max(L.shake, 0.5 * v);
    alertTo(p.cx, p.cz, true);
    if (!net) { L.msg('💥 KLIRRR! Die Glaswand ist zerbrochen – das war SEHR laut! Steig aus und schleich, sonst findet sie dich!', 6000); if (L.mp && L.mp.send && L.net && L.net.connected) L.mp.send({ t: 'glass', i: p.i }); }
  }
  L.glassRemote = (i) => { if (panels && panels[i]) shatter(panels[i], true); };
  function restoreWalls() { if (!panels) return; for (const p of panels) if (p.broken) { p.broken = false; p.m.visible = true; p.box = L.addBox(p.box.x1, p.box.z1, p.box.x2, p.box.z2, H, 'building'); } }
  // Auto fährt in die Glaswand: kurz vorher zerbrechen (sonst prallt es ab)
  function carVsGlass() {
    const v = P.vehicle; if (!v || !panels || Math.abs(v.speed) < 5 || (v.alt || 0) > H) return;
    const fx = Math.sin(v.yaw) * Math.sign(v.speed), fz = Math.cos(v.yaw) * Math.sign(v.speed), look = v.t.len * 0.5 + Math.abs(v.speed) * 0.12 + 0.6;
    const px = v.x + fx * look, pz = v.z + fz * look;
    if (!L.inMil(px, pz, 6)) return;
    for (const p of panels) if (!p.broken && Math.abs(p.cx - v.x) < 40 && Math.abs(p.cz - v.z) < 40 && (segDist(px, pz, p) < (v.t.wid || 2) * 0.5 + 0.6 || segDist(v.x, v.z, p) < 1)) { shatter(p); v.speed *= 0.75; v.hp -= 8; }
  }

  // ---------- Die wahre Carolina ----------
  let C = null;
  const HP = 4000, SZ = 3; // SZ: Größe (3x so groß wie vorher)
  function build() {
    const app = Object.assign({}, L.DEFAULT_CHAR, { name: 'Carolina', skin: '#e8d2c4', hair: 'emo', hairColor: '#0e0e12', eyes: '#3a2a3a', brows: 'boese', mouth: 'ernst',
      top: 'tanktop', topColor: '#141418', pants: 'skinny', pantsColor: '#141418', shoeType: 'stiefel', shoes: '#0e0e0e', build: 'extrem', height: 'sehr_gross' });
    const r = L.buildHuman(app, true), skin = L.mat('#e8d2c4'), blk = L.mat('#0e0e12');
    const add = (par, geo, mt, sx, sy, sz, x, y, z) => { const m = new T.Mesh(geo, mt); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
    // großer hängender Bauch (unter dem kurzen Top heraus)
    const belly = new T.Group(); belly.position.set(0, 0.05, 0.12); r.torso.add(belly);
    add(belly, L.GEO.sph, skin, 0.42, 0.36, 0.34, 0, -0.08, 0.1); add(belly, L.GEO.sph, skin, 0.36, 0.26, 0.3, 0, -0.3, 0.12);
    add(belly, L.GEO.sph, L.mat('#c8a898'), 0.03, 0.03, 0.02, 0, -0.1, 0.43);
    r.belly = belly;
    // Maul (für die Fress-Szene): Rachen, obere/untere Zahnreihe, Zunge, Kinn, das nach unten klappt
    const M0 = new T.Group(); M0.position.set(0, 0.075, 0.133); r.head.add(M0); M0.visible = false;
    const throat = add(M0, L.GEO.sph, L.mat('#2a0206'), 1, 1, 1, 0, 0, 0);
    const gum = L.mat('#a8283a'), tooth = L.mat('#f4f0e2'), up = [], lo = [];
    const lipU = add(M0, L.GEO.box, L.mat('#7a2a3a'), 0.17, 0.02, 0.02, 0, 0, 0.004), lipL = add(M0, L.GEO.box, L.mat('#7a2a3a'), 0.15, 0.02, 0.02, 0, 0, 0.004);
    const gumU = add(M0, L.GEO.box, gum, 0.15, 0.012, 0.012, 0, 0, 0.002), gumL = add(M0, L.GEO.box, gum, 0.13, 0.012, 0.012, 0, 0, 0.002);
    for (let k = 0; k < 8; k++) { const x = (k - 3.5) * 0.018, big = k === 1 || k === 6; const tt = add(M0, L.GEO.cone, tooth, big ? 0.009 : 0.007, big ? 0.03 : 0.018, 0.006, x, 0, 0.006); tt.rotation.x = Math.PI; up.push(tt); }
    for (let k = 0; k < 7; k++) { const x = (k - 3) * 0.018; lo.push(add(M0, L.GEO.cone, tooth, 0.007, 0.016, 0.006, x, 0, 0.006)); }
    const tongue = add(M0, L.GEO.sph, L.mat('#d85a78'), 0.045, 0.012, 0.03, 0, 0, -0.005);
    const chin = add(r.head, L.GEO.box, skin, 0.16, 0.05, 0.05, 0, 0.03, 0.115); chin.visible = false;
    r.mouth = { g: M0, throat, up, lo, lipU, lipL, gumU, gumL, tongue, chin };
    // Schluck-Beule (wandert vom Hals in den Bauch)
    r.gulp = add(r.torso, L.GEO.sph, skin, 0.09, 0.09, 0.08, 0, 0.6, 0.1); r.gulp.visible = false;
    // breite Hüften, Nietengürtel
    add(r.hips, L.GEO.sph, blk, 0.44, 0.22, 0.32, 0, -0.02, 0);
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; add(r.hips, L.GEO.sph, L.mat('#c8c8d0'), 0.025, 0.025, 0.025, Math.sin(a) * 0.43, 0.08, Math.cos(a) * 0.31); }
    // Emo: Pony über einem Auge, dunkle Schminke, Piercings, pinke Strähne, gestreifte Armstulpen
    add(r.head, L.GEO.box, blk, 0.2, 0.16, 0.04, -0.05, 0.22, 0.15).rotation.z = 0.4;
    add(r.head, L.GEO.box, L.mat('#ff3a9a'), 0.03, 0.18, 0.04, 0.07, 0.24, 0.14);
    for (const s of [-1, 1]) add(r.head, L.GEO.box, blk, 0.07, 0.035, 0.01, s * 0.06, 0.155, 0.152);
    add(r.head, L.GEO.sph, L.mat('#d0d0d8'), 0.012, 0.012, 0.012, 0.02, 0.06, 0.155);
    add(r.head, L.GEO.sph, L.mat('#d0d0d8'), 0.01, 0.01, 0.01, 0.075, 0.2, 0.13);
    for (const a of r.arms) for (let k = 0; k < 4; k++) add(a.elbow, L.GEO.box, L.mat(k % 2 ? '#c02a2a' : '#141418'), 0.13, 0.05, 0.13, 0, -0.06 - k * 0.055, 0);
    r.root.scale.set(2.9 * SZ, 1.9 * SZ, 2.5 * SZ);
    r.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    L.scene.add(r.root);
    return r;
  }
  function spawnC() {
    const M = L.MIL, rig = build();
    C = { kind: 'carolina', rig, x: (M.x1 + M.x2) / 2, z: (M.z1 + M.z2) / 2, yaw: 0, hp: HP, state: 'wander', tx: 0, tz: 0, t: 0, ph: 0, searchT: 0, cd: 0, bigR: 6, hitR: 60, stepT: 0, growlT: 0, dead: false, deadT: 0 };
    pickGoal();
  }
  function pickGoal() { const M = L.MIL; C.tx = L.rand(M.x1 + 15, M.x2 - 15); C.tz = L.rand(M.z1 + 15, M.z2 - 15); }
  function alertTo(x, z, loud) {
    if (!C || C.dead) return;
    const M = L.MIL; C.tx = L.clamp(x, M.x1 + 3, M.x2 - 3); C.tz = L.clamp(z, M.z1 + 3, M.z2 - 3);
    C.state = 'chase'; C.searchT = 0; if (loud) C.rage = 6;
    if (C.growlT <= 0 && Math.hypot(P.x - C.x, P.z - C.z) < 150) { C.growlT = 3; L.snd.bossRoar ? L.snd.bossRoar({ x: C.x, y: 3, z: C.z }) : L.tn && L.tn({ f: 90, fTo: 50, dur: 1.2, type: 'sawtooth', vol: 0.25 }); }
  }
  // Schüsse, Explosionen … (laute Geräusche) hört sie weit
  const omn = L.makeNoise;
  L.makeNoise = function (x, z, inten, src) {
    const r = omn ? omn(x, z, inten, src) : undefined;
    if (C && !C.dead && inten >= 40 && L.MIL && L.inMil(x, z, 40) && Math.hypot(x - C.x, z - C.z) < inten * 0.9) alertTo(x, z, inten > 150);
    return r;
  };
  // Geräusche des Spielers
  function playerNoise() {
    if (!P.alive || P.gone || L.cine) return 0;
    const v = P.vehicle; if (v) return Math.abs(v.speed) > 1.5 ? 70 : 25;
    const hsp = Math.hypot(P.vx, P.vz);
    if (P.flying || hsp < 0.4) return 0;
    if (P.stance === 'crouch' || P.stance === 'crawl') return 0;
    return P.mode === 'run' ? 24 : 9;
  }
  function updateC(dt) {
    if (!C) return;
    const M = L.MIL, rig = C.rig;
    if (C.dead) { C.deadT += dt; L.animHuman(rig, { mode: 'dead' }); rig.root.position.set(C.x, 0, C.z); if (C.deadT > 240) { L.scene.remove(rig.root); spawnC(); } return; }
    if (C.eat) { updateEat(dt); return; }
    C.t += dt; C.cd -= dt; C.growlT -= dt; C.rage = Math.max(0, (C.rage || 0) - dt);
    // nur in der Nähe aktiv rechnen
    const dP = Math.hypot(P.x - C.x, P.z - C.z);
    const nr = playerNoise();
    if (nr > 0 && dP < nr) alertTo(P.x, P.z, false);
    // Bewegung
    const spd = C.state === 'chase' ? (C.rage > 0 ? 10 : 8) : C.state === 'search' ? 3 : 3;
    let dx = C.tx - C.x, dz = C.tz - C.z, d = Math.hypot(dx, dz);
    if (C.state === 'search') { C.searchT -= dt; C.yaw += Math.sin(C.t * 1.3) * dt; if (C.searchT <= 0) { C.state = 'wander'; pickGoal(); } }
    else if (d < 2) { if (C.state === 'chase') { C.state = 'search'; C.searchT = 6; } else pickGoal(); }
    else {
      const want = Math.atan2(dx, dz); C.yaw += L.angDiff(C.yaw, want) * Math.min(1, dt * 5);
      const nx = C.x + Math.sin(C.yaw) * spd * dt, nz = C.z + Math.cos(C.yaw) * spd * dt;
      L.collide(nx, nz, 3, undefined, RES);
      const moved = Math.hypot(RES.x - C.x, RES.z - C.z);
      C.x = L.clamp(RES.x, M.x1 + 4, M.x2 - 4); C.z = L.clamp(RES.z, M.z1 + 4, M.z2 - 4);
      if (moved < spd * dt * 0.2) { C.stuck = (C.stuck || 0) + dt; if (C.stuck > 1.5) { C.stuck = 0; if (C.state === 'wander') pickGoal(); else { C.x = L.clamp(nx, M.x1 + 4, M.x2 - 4); C.z = L.clamp(nz, M.z1 + 4, M.z2 - 4); } } } else C.stuck = 0;
    }
    // Erwischt: ein Schlag (Admin bleibt heil)
    const reach = 6.5 + (P.vehicle ? P.vehicle.t.len * 0.4 : 0);
    if (P.alive && !P.gone && dP < reach && Math.abs((P.y || 0) - 0) < 12 && C.cd <= 0 && (C.state === 'chase' || dP < 4.5)) {
      C.cd = 1.2; C.yaw = Math.atan2(P.x - C.x, P.z - C.z); L.shake = Math.max(L.shake, 1);
      L.snd.stomp && L.snd.stomp({ x: C.x, y: 1, z: C.z });
      if (P.vehicle && L._leaveVehicle && !(L.suitOn && L.suitOn())) L._leaveVehicle(true);
      if (L.suitOn && L.suitOn()) L.msg('🛡️ Carolina schlägt zu – aber der Anzug hält.', 2000);
      else startEat();
    }
    // Aussehen
    C.ph += dt * (C.state === 'chase' ? 4.2 : 2.2);
    rig.root.position.set(C.x, 0, C.z); rig.root.rotation.set(0, C.yaw, 0);
    L.animHuman(rig, { mode: C.state === 'chase' ? 'run' : 'walk', phase: C.ph, speed: C.state === 'search' ? 0.1 : 1 });
    if (rig.belly) { const j = Math.sin(C.ph * 2) * (C.state === 'chase' ? 0.06 : 0.03); rig.belly.scale.set(1 - j * 0.5, 1 + j, 1); rig.belly.position.y = 0.05 - Math.abs(j) * 0.3; }
    // schwere Schritte
    C.stepT -= dt * (C.state === 'chase' ? 1.4 : 0.7);
    if (C.stepT <= 0 && C.state !== 'search') { C.stepT = 0.9; if (dP < 90) { L.tn && L.tn({ f: 55, fTo: 30, dur: 0.35, vol: Math.max(0.03, 0.3 * (1 - dP / 60)), pos: { x: C.x, y: 0, z: C.z } }); if (dP < 30) L.shake = Math.max(L.shake, 0.08 * (1 - dP / 30)); } }
  }
  // ---------- Fress-Szene ----------
  const ease = (u) => { u = L.clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  // open: 0 = zu, 1 = ganz weit auf
  function setMouth(rig, open) {
    const m = rig.mouth; if (!m) return;
    const o = L.clamp(open, 0, 1.2), on = o > 0.02; m.g.visible = on; m.chin.visible = on;
    const h = 0.012 + o * 0.095, w = 0.07 + o * 0.05;
    m.throat.scale.set(w, h, 0.02); m.throat.position.set(0, -h * 0.35, -0.006);
    m.lipU.position.y = h * 0.62; m.gumU.position.y = h * 0.6 - 0.006; m.lipL.position.y = -h * 1.3; m.gumL.position.y = -h * 1.28 + 0.006;
    m.up.forEach((t) => { t.position.y = h * 0.6 - 0.006 - t.scale.y * 0.5; });
    m.lo.forEach((t) => { t.position.y = -h * 1.28 + 0.006 + t.scale.y * 0.5; });
    m.tongue.position.y = -h * 1.0; m.tongue.scale.x = 0.04 + o * 0.015;
    m.chin.position.y = 0.03 - h * 1.25;
  }
  function startEat() {
    C.eat = { t: 0, cam: { x: 0, y: 0, z: 0, lx: 0, ly: 0, lz: 0 }, from: { x: P.x, y: P.y || 0, z: P.z } };
    P.vx = P.vz = 0;
    L.startCine('🖤 THE TRUE CAROLINA HAT DICH', 6.4, () => (C && C.eat ? C.eat.cam : null));
    if (!L.cine) { C.eat = null; L.hurtPlayer(99999, 'Die wahre Carolina hat dich gefunden'); return; }
    L.snd.bossRoar ? L.snd.bossRoar({ x: C.x, y: 8, z: C.z }) : null;
  }
  // Ablauf (6,4 s): Brüllen → bückt sich und packt dich → hebt dich vors Gesicht (du zappelst) → Maul weit auf → schnappt zu →
  // kaut, schluckt (Beule wandert in den Bauch), Bauch wird dicker, sie klopft drauf und rülpst.
  function updateEat(dt) {
    const E0 = C.eat, rig = C.rig; E0.t += dt; const t = E0.t, f = E0.from;
    C.yaw += L.angDiff(C.yaw, Math.atan2(f.x - C.x, f.z - C.z)) * Math.min(1, dt * 6);
    rig.root.position.set(C.x, 0, C.z); rig.root.rotation.set(0, C.yaw, 0);
    L.animHuman(rig, { mode: 'idle', phase: t });
    const fx = Math.sin(C.yaw), fz = Math.cos(C.yaw), sx = Math.cos(C.yaw), sz = -Math.sin(C.yaw);
    const roar = t < 0.9 ? Math.sin(Math.PI * L.clamp(t / 0.9, 0, 1)) : 0;
    const bend = ease((t - 0.8) / 0.45) * (1 - ease((t - 1.45) / 0.5)); // bückt sich nach vorn
    const lift = ease((t - 1.45) / 0.9);                                 // hebt dich hoch
    const toss = ease((t - 2.75) / 0.25);                                // wirft dich ins Maul
    const [grab, other] = rig.arms;
    // Körper
    rig.torso.rotation.x = bend * 0.55 - roar * 0.15; rig.head.rotation.x = -roar * 0.45 + bend * 0.2 - ease((t - 2.2) / 0.4) * 0.12 * (1 - ease((t - 3.2) / 0.3));
    rig.head.rotation.z = t > 3.2 && t < 4.6 ? Math.sin(t * 9) * 0.04 : 0;
    // Arme: beim Brüllen ausgebreitet, dann greift der eine, der andere klopft später auf den Bauch
    const pat = t > 4.6 ? Math.abs(Math.sin((t - 4.6) * 7)) : 0;
    const down = ease((t - 3.2) / 0.7); // Arm danach wieder runter
    grab.arm.rotation.x = (-0.5 * roar - 0.9 * bend - 1.55 * lift - 0.2 * toss) * (1 - down);
    grab.arm.rotation.z = (-0.9 * roar + 0.25 * lift) * (1 - down); grab.elbow.rotation.x = (-0.2 - 0.7 * lift - 0.9 * toss) * (1 - down);
    other.arm.rotation.x = -0.5 * roar - 0.3 * bend + (t > 4.4 ? -0.5 : 0); other.arm.rotation.z = 0.9 * roar + (t > 4.4 ? -0.35 : 0);
    other.elbow.rotation.x = t > 4.4 ? -1.2 - pat * 0.35 : -0.3;
    rig.root.updateMatrixWorld(true);
    const hp = new T.Vector3(); rig.head.getWorldPosition(hp);
    const mw = new T.Vector3(0, 0.075, 0.16); rig.head.localToWorld(mw);
    const hand = new T.Vector3(); (rig.hand || grab.elbow).getWorldPosition(hand);
    // Maul
    let open = roar * 0.6;
    if (t > 2.2 && t < 2.95) open = ease((t - 2.2) / 0.45) * 1.15;
    else if (t >= 2.95 && t < 3.1) open = 1.15 * (1 - (t - 2.95) / 0.15);
    else if (t >= 3.1 && t < 4.3) open = 0.12 + Math.abs(Math.sin((t - 3.1) * 8)) * 0.3; // kauen
    else if (t >= 5.2 && t < 5.7) open = 0.5 * Math.sin(Math.PI * (t - 5.2) / 0.5); // Rülpser
    setMouth(rig, open);
    // du: gepackt, hochgehoben, zappelst, fliegst ins Maul
    if (P.rig) {
      const pr = P.rig.root;
      if (t < 1.2) { pr.visible = true; pr.position.set(f.x, f.y, f.z); pr.rotation.set(0, C.yaw + Math.PI, 0); L.animHuman(P.rig, { mode: t < 0.5 ? 'idle' : 'walk', phase: t * 14, speed: 1 }); }
      else if (t < 3.0) {
        pr.visible = true;
        const hold = new T.Vector3(hand.x, hand.y - 1.9, hand.z);
        const into = new T.Vector3(mw.x - fx * 0.4, mw.y - 0.9, mw.z - fz * 0.4);
        const p0 = t < 1.45 ? new T.Vector3().lerpVectors(new T.Vector3(f.x, f.y, f.z), hold, ease((t - 1.2) / 0.25)) : hold.lerp(into, toss);
        pr.position.copy(p0); pr.rotation.set(-0.2 - toss * 1.3, C.yaw + Math.PI + Math.sin(t * 5) * 0.2, Math.sin(t * 13) * 0.22 * (1 - toss));
        pr.scale.setScalar(1 - toss * 0.35);
        L.animHuman(P.rig, { mode: 'tumble', tumble: 0.3, phase: t * 16 });
        if (t > 1.6 && !E0.scr) { E0.scr = true; L.snd.scream && L.snd.scream({ x: hand.x, y: hand.y, z: hand.z }); }
      } else { pr.visible = false; pr.scale.setScalar(1); }
    }
    // Biss
    if (t > 3.0 && !E0.chomp) {
      E0.chomp = true; L.shake = Math.max(L.shake, 1.3); L.blood && L.blood(mw.x, mw.y, mw.z, 18, true);
      L.snd.splat && L.snd.splat({ x: mw.x, y: mw.y, z: mw.z }); L.snd.stomp && L.snd.stomp({ x: C.x, y: 5, z: C.z });
      if (L.backFade) { L.backFade.style.background = '#3a0006'; L.backFade.style.opacity = '0.55'; setTimeout(() => { if (L.backFade) L.backFade.style.opacity = '0'; }, 140); }
    }
    if (t > 3.1 && t < 4.2 && Math.random() < dt * 6) L.blood && L.blood(mw.x, mw.y - 0.3, mw.z, 2);
    // Kauen-Geräusche, Schlucken, Rülpser
    if (t > 3.2 && t < 4.3 && Math.floor(t * 4) !== E0.chewN) { E0.chewN = Math.floor(t * 4); L.nz && L.nz({ dur: 0.12, f: 700, type: 'bandpass', q: 2, vol: 0.25 }); }
    if (t > 4.3 && !E0.gulp) { E0.gulp = true; L.tn && L.tn({ f: 180, fTo: 60, dur: 0.5, type: 'sine', vol: 0.4 }); }
    if (t > 5.2 && !E0.burp) { E0.burp = true; L.tn && L.tn({ f: 95, fTo: 70, dur: 0.6, type: 'sawtooth', vol: 0.3 }); L.tn && L.tn({ f: 140, fTo: 90, dur: 0.5, type: 'square', vol: 0.12 }); L.msg('🖤 Carolina: „*RÜLPS* … lecker.“', 3000); }
    // Schluck-Beule wandert vom Hals in den Bauch, Bauch wird dicker und wackelt beim Klopfen
    const gu = L.clamp((t - 4.3) / 0.6, 0, 1);
    if (rig.gulp) { rig.gulp.visible = gu > 0 && gu < 1; rig.gulp.position.set(0, 0.6 - gu * 0.62, 0.11 + gu * 0.22); }
    if (rig.belly) { const big = 1 + ease((t - 4.75) / 0.4) * 0.3, j = pat * 0.05; rig.belly.scale.set(big + j, big - j, big + j * 0.5); }
    // Kamera: 1) von unten zu ihr hoch  2) über deine Schulter in ihr Gesicht  3) zurück, ganze Figur
    const cam = E0.cam;
    if (t < 1.45) { const a = C.yaw + Math.PI / 2 + 0.35, mx = (C.x + f.x) / 2, mz = (C.z + f.z) / 2, d = 26 - t * 3; Object.assign(cam, { x: mx + Math.sin(a) * d, y: 4 + t * 2, z: mz + Math.cos(a) * d, lx: C.x, ly: L.lerp(hp.y * 0.75, hand.y * 0.6, bend), lz: C.z }); }
    else if (t < 3.3) { const u = ease((t - 1.45) / 1.0); Object.assign(cam, { x: mw.x + fx * 9 + sx * L.lerp(5, 2.5, u), y: mw.y + L.lerp(-1, 0.6, u), z: mw.z + fz * 9 + sz * L.lerp(5, 2.5, u), lx: mw.x, ly: mw.y - 0.8 + u * 0.6, lz: mw.z }); }
    else { const u = ease((t - 3.3) / 1.6), d = L.lerp(12, 24, u), a = C.yaw + L.lerp(0.4, 0.9, u); Object.assign(cam, { x: C.x + Math.sin(a) * d, y: L.lerp(mw.y, hp.y * 0.55, u), z: C.z + Math.cos(a) * d, lx: C.x, ly: L.lerp(mw.y - 0.5, hp.y * 0.55, u), lz: C.z }); }
    if (t > 6.2 || (!L.cine && t > 0.1)) {
      C.eat = null; setMouth(rig, 0); if (rig.gulp) rig.gulp.visible = false; rig.torso.rotation.x = 0; rig.head.rotation.set(0, 0, 0);
      if (rig.belly) rig.belly.scale.set(1, 1, 1);
      if (P.rig) P.rig.root.scale.setScalar(1);
      if (L.cine && L.endCine) L.endCine();
      L.hurtPlayer(99999, 'Die wahre Carolina hat dich gefressen');
      if (P.rig) P.rig.root.visible = false;
    }
  }
  L.extraTargets = () => (C && !C.dead && L.MIL ? [C] : []);
  L.carolinaHit = function (dmg, src) {
    if (!C || C.dead || !(dmg > 0)) return;
    C.hp -= dmg; L.blood && L.blood(C.x, 7, C.z, 10);
    if (L.showBossHp) L.showBossHp('🖤 THE TRUE CAROLINA', C.hp, HP);
    if (src) alertTo(src.x, src.z, true);
    if (C.hp <= 0) {
      C.dead = true; C.deadT = 0; L.banner('🖤 THE TRUE CAROLINA IST BESIEGT', 'In 4 Minuten ist sie wieder da …');
      if (src === P && L.gotBossCoins) L.gotBossCoins(400, 'die wahre Carolina');
      for (const t of ['sniper', 'scharfmuni', 'lmg', 'medkit']) L.spawnItem(t, C.x + L.rand(-3, 3), C.z + L.rand(-3, 3), 1);
    }
  };
  // andere Monster kommen nicht in die Basis
  // Zaun um die Basis (jedes Bild): wer an die Grenze kommt, bleibt außen stehen und verliert die Spur.
  // Gilt für alle Monster, Laser-Roboter, Tentakel-Maschinen, BIG MAMA und den Walross-Boss.
  function fence(m, pad) {
    if (!m || m.dead || m === C || typeof m.x !== 'number' || !L.inMil(m.x, m.z, pad)) return false;
    const M = L.MIL, dl = m.x - (M.x1 - pad), dr = M.x2 + pad - m.x, dt2 = m.z - (M.z1 - pad), db = M.z2 + pad - m.z, mn = Math.min(dl, dr, dt2, db);
    if (mn === dl) m.x = M.x1 - pad; else if (mn === dr) m.x = M.x2 + pad; else if (mn === dt2) m.z = M.z1 - pad; else m.z = M.z2 + pad;
    const root = m.rig && m.rig.root; if (root && root.position) { root.position.x = m.x; root.position.z = m.z; }
    return true;
  }
  const lose = (m, st) => { if (st && m.state !== st && (m.kind === 'walker' ? L.inMil(m.aimX, m.aimZ, 4) : true)) m.state = st; if (m.prey && L.inMil(m.prey.x, m.prey.z, 2)) { m.prey = null; if (m.state !== 'dead') m.state = 'search'; m.timer = 3; } if (m.tx !== undefined && L.inMil(m.tx, m.tz, 2)) { m.tx = m.x; m.tz = m.z; } };
  function keepMonstersOut() {
    for (const m of E.monsters) if (fence(m, 1.5)) lose(m); else if (!m.dead && m.prey && L.inMil(m.prey.x, m.prey.z, 2) && Math.hypot(m.x - m.prey.x, m.z - m.prey.z) > 30) lose(m);
    for (const w of E.walkers) if (fence(w, 6)) lose(w, 'patrol');
    if (L.tentacleEnts) for (const t of L.tentacleEnts) if (fence(t, 12)) lose(t);
    if (L.boss && !L.boss.dead) fence(L.boss, 25);
    if (L.wboss && !L.wboss.dead) fence(L.wboss, 15);
  }
  L.milFence = keepMonstersOut;
  L._caro = () => C;
  let toldT = 0;
  L.updateCarolina = function (dt) {
    if (!L.MIL || L.state !== 'game') return;
    if (!panels) buildWalls();
    if (!C) spawnC();
    carVsGlass();
    if (!L._isClient || !L._isClient()) keepMonstersOut();
    updateC(dt);
    toldT -= dt;
    if (toldT <= 0 && L.inMil(P.x, P.z, 4) && P.alive) { toldT = 120; L.banner('🖤 HIER LEBT THE TRUE CAROLINA', 'Sie hört dich laufen – aber nicht schleichen (C). Nicht rennen, nicht schießen!'); }
  };
  L.clearCarolina = function () { restoreWalls(); if (C) { L.scene.remove(C.rig.root); C = null; } toldT = 0; };
})();
