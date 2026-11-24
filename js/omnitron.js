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
    P3(G.box, dk, 2.1, 0.8, 1.1, 0, 4.6, 0); P3(G.box, mt, 2.6, 2.6, 1.4, 0, 6.3, 0); P3(G.box, mt, 3.4, 0.7, 1.5, 0, 7.6, 0);
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
    P3(G.box, mt, 0.95, 1.05, 0.9, 0, 0.4, 0, head); P3(G.cone, dk, 0.25, 0.8, 0.12, -0.32, 1.05, -0.1, head).rotation.z = 0.4; P3(G.cone, dk, 0.25, 0.8, 0.12, 0.32, 1.05, -0.1, head).rotation.z = -0.4;
    for (const s of [-1, 1]) P3(G.box, glow(0xff2020), 0.26, 0.07, 0.05, s * 0.22, 0.5, 0.46, head);
    P3(G.box, dk, 0.5, 0.06, 0.05, 0, 0.18, 0.46, head);
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
    O = { kind: 'omni', key: 'omni', rig: build(), x, z, yaw: 0, hp: HP, life: LIFE, cd: 6, atk: null, atkT: 0, ph: 0, dead: false, deadT: 0, hitR: 260, bigR: 22, hy: 70, y: 0, rise: 0 };
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
    if (L.showBossHp) L.showBossHp('♾️ INFINITY-OMNITRON', Math.max(0, O.hp), HP);
    if (O.hp <= 0) die(src);
  };
  function die(src) {
    O.dead = true; O.deadT = 0;
    if (L.atHome && L.atHome()) { L.banner('♾️ INFINITY-OMNITRON IST BESIEGT!', 'Die sechs Steine zerspringen – unglaublich!'); if (L.gotBossCoins) L.gotBossCoins(5000, 'Omnitron'); }
  }
  function hurtNear(x, z, r, dmg, why) {
    if (!(L.atHome && L.atHome()) || !P.alive || (P.spawnProt > 0)) return;
    if (Math.hypot(P.x - x, P.z - z) < r && (P.y || 0) < 8) L.hurtPlayer(dmg, why);
  }
  L.updateOmnitron = function (dt) {
    if (L.state !== 'game') return;
    for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.t += dt; b.m.material.opacity = 0.85 * (1 - b.t / b.life); if (b.t > b.life) { L.scene.remove(b.m); beams.splice(i, 1); } }
    if (!O) { if (!isClient()) { clock -= dt; if (clock <= 0) { clock = EVERY; spawn(); } } return; }
    const r = O.rig, t = performance.now() / 1000;
    if (O.dead) { O.deadT += dt; r.root.rotation.z = Math.min(1.4, O.deadT * 0.25); r.root.position.y = -Math.max(0, O.deadT - 5) * 15; if (Math.random() < dt * 10) L.fx(L.pick(['#ff6020', '#ffd040', '#a040ff']), O.x + L.rand(-40, 40), L.rand(10, 120), O.z + L.rand(-40, 40), 6, 20, { basic: true, size: 2, life: 1 }); if (O.deadT > 14) clear(); return; }
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
  function clear() { if (O) { if (O.rift) L.scene.remove(O.rift); L.scene.remove(O.rig.root); O = null; L.omni = null; } for (const b of beams) L.scene.remove(b.m); beams.length = 0; }
  L.omniTargets = () => (O && !O.dead && L.atHome && L.atHome() ? [O] : []);
  L.omniText = () => (O && !O.dead ? '♾️ OMNITRON ist da – nur der Ewigkeitshandschuh hilft · noch ' + L.fmt(O.life) : '♾️ Omnitron kommt in ' + L.fmt(clock));
  L.clearOmnitron = function () { clear(); clock = EVERY; };
})();
