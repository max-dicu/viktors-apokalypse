'use strict';
// Marlon-Skin: sehr stark (aber nicht unzerstörbar), kein Hunger/Durst, 5 Krücken-Attacken mit Animationen:
// 1 Krückenwurf (≈ ¼ Leben), 2 Krücken-Tornado, 3 Alamantium-Orthese (Humpel-Sprint + Kniekick), 4 Krücken-Beben, 5 Stein-Strahl.
// Gegen den Infinity-Omnitron wirkt alles deutlich schwächer (Bosskampf bleibt schwer).
(function () {
  const L = window.L, T = THREE, P = L.player;
  const isM = () => !!(P.rig && P.rig.marlon);
  const ohd = L.heroDmgMul; L.heroDmgMul = () => (isM() ? 0.2 : ohd ? ohd() : 1);
  const A = (name, icon, rate) => ({ name, slot: 'waffe', icon, dmg: 0, rate, noise: 80, range: 60, ammo: null, mag: 1, spread: 0, energy: true, kr: true });
  Object.assign(L.ITEMS, { kr_wurf: A('Krückenwurf', '🦯', 4), kr_tornado: A('Krücken-Tornado', '🌪️', 8), kr_orthese: A('Alamantium-Orthese', '🦿', 6), kr_beben: A('Krücken-Beben', '💥', 7) });
  const ohs = L.heroStart;
  L.heroStart = function () { if (ohs) ohs(); if (!isM()) return; P.hot[0] = { type: 'kr_wurf', count: 1, mag: 1 }; P.hot[1] = { type: 'kr_tornado', count: 1, mag: 1 }; P.hot[2] = { type: 'kr_orthese', count: 1, mag: 1 }; P.hot[3] = { type: 'kr_beben', count: 1, mag: 1 }; P.hot[4] = { type: 'steinkruecken', count: 1, mag: 1 }; P.sel = 0; L.msg('🩼 Marlon: 1 Krückenwurf · 2 Tornado · 3 Alamantium-Orthese · 4 Krücken-Beben · 5 Stein-Strahl', 7000); };
  // ---------- Schaden: Anteil am maximalen Leben ----------
  const isOmni = (e) => e.kind === 'omni';
  function maxHp(e) { if (typeof e.hp === 'number') e._mx = Math.max(e._mx || 0, e.max || 0, e.hp); return e._mx || 600; }
  function hurt(e, frac, omniFrac) {
    if (!e || e.dead) return;
    let d = maxHp(e) * (isOmni(e) ? omniFrac : frac);
    L._marlonFiring = true;
    try { if (isOmni(e)) { d /= 1.5; if (Math.random() < 0.4) L.msg('♾️ Omnitron: „Diese Krücken nerven!“', 1500); } L.damageEnt(e, Math.max(30, d), P.x, P.z, P); } finally { L._marlonFiring = false; }
  }
  const targets = () => (L._targets ? L._targets() : []).filter((e) => !e.dead && e.kind !== 'remote');
  function pick(range) {
    const fx = Math.sin(P.camYaw), fz = Math.cos(P.camYaw); let best = null, bd = 1e9;
    for (const e of targets()) { const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz) - (e.bigR || 0); if (d > range || (dx * fx + dz * fz) / (Math.hypot(dx, dz) || 1) < 0.5) continue; if (d < bd) { bd = d; best = e; } }
    return best;
  }
  function heightOf(e) { if (e._h) return e._h; let h = 2; try { if (e.rig && e.rig.root) { const bb = new T.Box3().setFromObject(e.rig.root); h = Math.max(1, bb.max.y - bb.min.y); } } catch (x) { /* egal */ } e._h = Math.min(h, 60); return e._h; }
  // Effekte
  function ring(x, y, z, col, r, dur) { const m = new T.Mesh(new T.TorusGeometry(1, 0.12, 6, 40), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); L.scene.add(m); let t = 0; const iv = setInterval(() => { t += 0.03; const u = t / dur; m.scale.setScalar(0.3 + u * r); m.material.opacity = 0.9 * (1 - u); if (u >= 1) { clearInterval(iv); L.scene.remove(m); } }, 30); }
  function spikes(x, z, r) { for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, c = new T.Mesh(L.GEO.cone, L.mat('#6a5a48')); c.scale.set(0.6, 0.01, 0.6); c.position.set(x + Math.sin(a) * r * 0.6, 0, z + Math.cos(a) * r * 0.6); L.scene.add(c); let t = 0; const iv = setInterval(() => { t += 0.04; c.scale.y = t < 0.3 ? t / 0.3 * 2.2 : Math.max(0.01, 2.2 * (1 - (t - 0.3) / 0.7)); c.position.y = c.scale.y / 2; if (t >= 1) { clearInterval(iv); L.scene.remove(c); } }, 30); } }
  let flying = null; // geworfene Krücke
  function crutchMesh() { const g = new T.Group(); const m = (geo, c, sx, sy, sz, y) => { const o = new T.Mesh(geo, L.mat(c)); o.scale.set(sx, sy, sz); o.position.y = y; g.add(o); }; m(L.GEO.cyl, '#3a3048', 0.05, 2.2, 0.05, 0); m(L.GEO.box, '#d8dce4', 0.14, 0.08, 0.3, 0.6); for (let k = 0; k < 3; k++) { const s = new T.Mesh(new T.OctahedronGeometry(0.07), new T.MeshBasicMaterial({ color: [0xff2a2a, 0xffd020, 0x2a7aff][k] })); s.position.y = 0.1 - k * 0.25; g.add(s); } L.scene.add(g); return g; }
  // ---------- Aktionen ----------
  const ACT = { cur: null };
  const owf = L.weaponFire;
  L.weaponFire = function (w, d) {
    if (!d || !d.kr) return owf(w, d);
    if (ACT.cur) return true;
    P.fireCd = d.rate;
    const kind = w.type, tg = kind === 'kr_wurf' ? pick(60) : kind === 'kr_orthese' ? pick(40) : null;
    if ((kind === 'kr_wurf' || kind === 'kr_orthese') && !tg) { L.msg('🎯 Kein Gegner vor dir in Reichweite.', 1200); P.fireCd = 0.3; return true; }
    ACT.cur = { kind, t: 0, tg, x0: P.x, z0: P.z, y0: P.y || 0, hits: 0 };
    L.makeNoise && L.makeNoise(P.x, P.z, 80, P);
    const names = { kr_wurf: '🦯 KRÜCKENWURF', kr_tornado: '🌪️ KRÜCKEN-TORNADO', kr_orthese: '🦿 ALAMANTIUM-ORTHESE', kr_beben: '💥 KRÜCKEN-BEBEN' };
    L.msg(names[kind], 1200);
    return true;
  };
  function endAct() { const c = ACT.cur; ACT.cur = null; if (flying) { L.scene.remove(flying); flying = null; } if (P.rig && P.rig.crutches) P.rig.crutches.forEach((q) => { q.visible = true; }); if (P.rig) { P.rig.root.rotation.x = 0; } void c; }
  L.updateMarlon2 = function (dt) {
    if (isM()) { P.food = Math.max(P.food, 100); P.water = Math.max(P.water, 100); }
    const c = ACT.cur; if (!c) return;
    if (!isM() || !P.alive) { endAct(); return; }
    c.t += dt; const t = c.t, e = c.tg;
    if (c.kind === 'kr_wurf') {
      if (e && e.dead && t < 0.9) { endAct(); return; }
      const tx = e ? e.x : P.x, tz = e ? e.z : P.z, th = e ? Math.min(heightOf(e), 20) : 2;
      if (t > 0.35 && !flying) { flying = crutchMesh(); if (P.rig && P.rig.crutches) P.rig.crutches[0].visible = false; L.nz && L.nz({ dur: 0.4, f: 1500, fTo: 400, type: 'bandpass', vol: 0.3 }); }
      if (flying && t < 0.9) { const u = (t - 0.35) / 0.55, sx = c.x0, sz = c.z0, mx = (sx + tx) / 2, mz = (sz + tz) / 2; flying.position.set(L.lerp(sx, mx, u), (c.y0 + 1.8) + Math.sin(u * Math.PI) * 8 + u * th * 0.5, L.lerp(sz, mz, u)); flying.rotation.set(t * 18, 0, t * 6); }
      // Sprung zur Krücke, in der Luft fangen, auf den Gegner
      if (t > 0.6 && t < 1.15) { const u = (t - 0.6) / 0.55, ox = tx - Math.sin(P.camYaw) * 1.5, oz = tz - Math.cos(P.camYaw) * 1.5; P.x = L.lerp(c.x0, ox, u); P.z = L.lerp(c.z0, oz, u); P.y = c.y0 + Math.sin(u * Math.PI) * (6 + th * 0.4) + u * Math.max(0, th * 0.4 - 1); P.vy = 0; P.air = true; P.vx = P.vz = 0; }
      if (t > 0.9 && flying) { L.scene.remove(flying); flying = null; if (P.rig && P.rig.crutches) P.rig.crutches[0].visible = true; L.msg('🦯 Gefangen!', 600); }
      // brutal zustechen (3x)
      if (t > 1.15) { P.vx = P.vz = 0; const n = Math.floor((t - 1.15) / 0.18); if (n > c.hits && c.hits < 3 && e && !e.dead) { c.hits++; hurt(e, 0.25 / 3, 0.03 / 3); L.blood && L.blood(e.x, Math.min(th, 6) * 0.6, e.z, 18, true); L.shake = Math.max(L.shake, 0.7); L.fovKick = 6; L.snd.splat && L.snd.splat({ x: e.x, y: 1, z: e.z }); } }
      if (t > 1.8) endAct();
    } else if (c.kind === 'kr_tornado') {
      P.vx = P.vz = 0; P.y = c.y0 + Math.min(2, t * 3); P.vy = 0; P.air = true;
      if (!c.fx) { c.fx = new T.Mesh(new T.ConeGeometry(14, 22, 24, 1, true), new T.MeshBasicMaterial({ color: 0xd8e0ff, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); c.fx.rotation.x = Math.PI; L.scene.add(c.fx); }
      c.fx.position.set(P.x, 11, P.z); c.fx.rotation.y += dt * 12; c.fx.material.opacity = 0.35 * Math.min(1, t * 2) * Math.max(0, 1 - (t - 2) / 0.4);
      for (let k = 0; k < 6; k++) { const a = t * 14 + k, r = 2 + ((t * 7 + k) % 12); L.fx(k % 2 ? '#ffffff' : '#9aa8c0', P.x + Math.sin(a) * r, 0.5 + ((t * 10 + k * 3) % 18), P.z + Math.cos(a) * r, 1, 1, { basic: true, size: 0.35, life: 0.4 }); }
      c.tick = (c.tick || 0) - dt;
      if (c.tick <= 0 && t < 2.2) { c.tick = 0.2; L.shake = Math.max(L.shake, 0.35); for (const o of targets()) { const d = Math.hypot(o.x - P.x, o.z - P.z); if (d > 14 + (o.bigR || 0)) continue; hurt(o, 0.018, 0.0025); if (L.MK && L.MK[o.kind]) { const a = Math.atan2(o.x - P.x, o.z - P.z) + 1.2; o.x -= Math.sin(a) * 1.2; o.z -= Math.cos(a) * 1.2; o.launchT = 0.4; o.stunT = 0.5; } } }
      if (t > 2.4) { L.scene.remove(c.fx); endAct(); }
    } else if (c.kind === 'kr_orthese') {
      if (!e || (e.dead && t < 0.9)) { endAct(); return; }
      const th = heightOf(e), chest = Math.min(th * 0.62, 40), dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz) - (e.bigR || 0) * 0.6;
      if (t < 0.9 && d > 3) { const sp = 24; P.x += dx / (Math.hypot(dx, dz) || 1) * sp * dt; P.z += dz / (Math.hypot(dx, dz) || 1) * sp * dt; P.vx = P.vz = 0; P.camYaw = P.yaw = Math.atan2(dx, dz); if (Math.random() < 0.4) L.fx('#c0c8d8', P.x, 0.2, P.z, 2, 2, { size: 0.3, life: 0.5 }); }
      else if (!c.jumped) { c.jumped = true; c.jt = t; c.jx = P.x; c.jz = P.z; L.nz && L.nz({ dur: 0.3, f: 800, fTo: 2000, type: 'bandpass', vol: 0.25 }); }
      if (c.jumped) { const u = Math.min(1, (t - c.jt) / 0.3); P.y = (c.y0) + chest * Math.sin(Math.min(1, u) * Math.PI / 2); P.vy = 0; P.air = true;
        if (u >= 1 && !c.kicked) { c.kicked = true; hurt(e, 0.17, 0.02); const hx = P.x + Math.sin(P.yaw) * 1.2, hz = P.z + Math.cos(P.yaw) * 1.2; ring(hx, P.y + 1, hz, 0xc0d0ff, 6, 0.5); L.fx('#ffffff', hx, P.y + 1, hz, 25, 10, { basic: true, size: 0.3, life: 0.5 }); L.shake = Math.max(L.shake, 1.2); L.fovKick = 9; L.snd.stomp && L.snd.stomp({ x: hx, y: P.y, z: hz }); if (L.MK && L.MK[e.kind]) { e.x += Math.sin(P.yaw) * 10; e.z += Math.cos(P.yaw) * 10; e.launchT = 0.8; e.stunT = 1.5; } L.msg('🦿 ALAMANTIUM-KNIE!', 900); }
        if (t - c.jt > 0.8) { P.vy = -10; endAct(); } }
      if (t > 3) endAct();
    } else if (c.kind === 'kr_beben') {
      P.vx = P.vz = 0;
      if (t > 0.6 && !c.slam) { c.slam = true; L.shake = 1.6; L.fovKick = 8; L.snd.stomp && L.snd.stomp({ x: P.x, y: 0, z: P.z }); L.snd.explosion && L.snd.explosion({ x: P.x, y: 0, z: P.z }); ring(P.x, 0.3, P.z, 0xa060ff, 16, 0.7); ring(P.x, 0.3, P.z, 0xffd040, 10, 0.5); spikes(P.x, P.z, 16);
        for (const o of targets()) { if (Math.hypot(o.x - P.x, o.z - P.z) > 16 + (o.bigR || 0)) continue; hurt(o, 0.1, 0.012); o.stunT = Math.max(o.stunT || 0, 2); if (L.MK && L.MK[o.kind]) o.launchT = 0.7; } }
      if (t > 1.2) endAct();
    }
  };
  // Posen
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    const c = ACT.cur; if (!c || !r || !r.marlon || !r.arms) return;
    const [R, Lf] = r.arms, t = c.t;
    if (c.kind === 'kr_wurf') {
      if (t < 0.35) { R.arm.rotation.set(-0.4 - t * 6, 0, 0.2); R.elbow.rotation.x = -1.2; }
      else if (t < 0.6) { R.arm.rotation.set(-2.6 + (t - 0.35) * 8, 0, 0.1); R.elbow.rotation.x = 0; }
      else if (t < 1.15) { R.arm.rotation.set(-2.8, 0, 0.3); Lf.arm.rotation.set(-2.2, 0, -0.3); if (r.legs) r.legs.forEach((l) => { l.leg.rotation.x = -0.8; l.knee.rotation.x = 1.2; }); }
      else { const s = Math.sin((t - 1.15) / 0.18 * Math.PI); R.arm.rotation.set(-2.9 + s * 1.6, 0, 0.1); R.elbow.rotation.x = -0.3 - s * 0.6; if (r.torso) r.torso.rotation.x = 0.3 + s * 0.3; }
    } else if (c.kind === 'kr_tornado') { R.arm.rotation.set(0, 0, 1.5); Lf.arm.rotation.set(0, 0, -1.5); R.elbow.rotation.x = Lf.elbow.rotation.x = 0; r.root.rotation.y = t * 22; }
    else if (c.kind === 'kr_orthese') {
      if (!c.jumped) { const s = Math.sin(t * 22); R.arm.rotation.x = Lf.arm.rotation.x = -0.9 - Math.max(0, s) * 0.6; if (r.legs) { r.legs[0].leg.rotation.x = -0.3; r.legs[1].leg.rotation.x = -s * 0.8; } if (r.torso) r.torso.rotation.x = 0.35; }
      else { if (r.legs) { r.legs[0].leg.rotation.x = -1.7; r.legs[0].knee.rotation.x = c.kicked ? 0.2 : 1.9; r.legs[1].leg.rotation.x = 0.4; r.legs[1].knee.rotation.x = 1.0; } R.arm.rotation.set(-0.6, 0, 0.6); Lf.arm.rotation.set(-0.6, 0, -0.6); }
    } else if (c.kind === 'kr_beben') { const up = t < 0.6; R.arm.rotation.set(up ? -3 : -0.9, 0, 0.1); Lf.arm.rotation.set(up ? -3 : -0.9, 0, -0.1); R.elbow.rotation.x = Lf.elbow.rotation.x = up ? -0.2 : 0; if (r.torso) r.torso.rotation.x = up ? -0.2 : 0.5; }
  };
  L.clearMarlon2 = endAct;
})();
