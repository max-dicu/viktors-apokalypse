'use strict';
// Faustkampf im Battlegrounds-Stil (leere Hand): Combo Jab → Haken → Tritt → Uppercut, Blocken (B halten, perfekter Block = Konter),
// Ultimate (U, Leiste füllt sich mit Treffern): Sprung in die Luft und Meteor-Schlag.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const MOVES = [
    { n: 'jab', dur: 0.32, hit: 0.45, dmg: 22, r: 3.2 }, { n: 'haken', dur: 0.36, hit: 0.5, dmg: 26, r: 3.2 },
    { n: 'tritt', dur: 0.42, hit: 0.5, dmg: 32, r: 3.6 }, { n: 'uppercut', dur: 0.55, hit: 0.45, dmg: 55, r: 3.4 }
  ];
  const M = { cur: null, t: 0, idx: 0, last: 0, hitDone: false, block: false, blockT: 0, ult: 0, ultT: -1 };
  const free = () => L.state === 'game' && P.alive && !P.vehicle && !L.uiBlock && !L.cine && !(L.selType && L.selType()) && !(P.rig && P.rig.monsterKind);
  // Leiste
  const bar = document.createElement('div'); bar.style.cssText = 'position:fixed;left:50%;bottom:82px;transform:translateX(-50%);width:180px;height:9px;border-radius:5px;background:rgba(0,0,0,.5);border:1px solid #ffd040;z-index:13;display:none;overflow:hidden';
  bar.innerHTML = '<div style="height:100%;width:0;background:linear-gradient(90deg,#ff8a20,#ffe040)"></div><span style="position:absolute;left:0;right:0;top:-16px;text-align:center;font:900 11px Arial;color:#ffe040;text-shadow:0 1px 2px #000"></span>';
  document.body.appendChild(bar); const fill = bar.firstChild, lab = bar.lastChild;
  const cs = document.createElement('style'); cs.textContent = 'body.cinema #ultBar{visibility:hidden}'; document.head.appendChild(cs); bar.id = 'ultBar';
  function hitFront(mv) {
    const fx = Math.sin(P.camYaw), fz = Math.cos(P.camYaw); let n = 0;
    for (const e of (L._targets ? L._targets() : [])) {
      if (e.dead) continue; const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz), br = e.bigR || 0;
      if (d > mv.r + br || (dx * fx + dz * fz) / (d || 1) < 0.35) continue;
      L.damageEnt(e, mv.dmg, P.x, P.z, P); n++;
      if (mv.n === 'uppercut' && L.MK && L.MK[e.kind]) e.launchT = 0.8;
    }
    if (n) { M.ult = Math.min(100, M.ult + 6 * n); L.snd.hammerHit && L.snd.hammerHit({ x: P.x, y: 1, z: P.z }); L.makeNoise && L.makeNoise(P.x, P.z, 14, P); }
    else L.nz && L.nz({ dur: 0.12, f: 900, type: 'bandpass', vol: 0.12 });
  }
  // Block: weniger Schaden, perfekter Block = Konter
  const oh = L.hurtPlayer;
  L.hurtPlayer = function (dmg, why) {
    if (M.block && free() && dmg < 9000) {
      const perfect = performance.now() - M.blockT < 280;
      if (perfect) {
        L.msg('🛡️ KONTER!', 1200); L.fovKick = 6; L.shake = Math.max(L.shake, 0.5);
        for (const e of (L._targets ? L._targets() : [])) { if (e.dead || Math.hypot(e.x - P.x, e.z - P.z) > 5 + (e.bigR || 0)) continue; L.damageEnt(e, 40, P.x, P.z, P); if (L.MK && L.MK[e.kind]) { const a = Math.atan2(e.x - P.x, e.z - P.z); e.x += Math.sin(a) * 7; e.z += Math.cos(a) * 7; e.stunT = 1.5; } }
        M.ult = Math.min(100, M.ult + 15); return;
      }
      L.fx('#a0d0ff', P.x + Math.sin(P.camYaw) * 0.7, (P.y || 0) + 1.3, P.z + Math.cos(P.camYaw) * 0.7, 8, 4, { basic: true, size: 0.15, life: 0.3 });
      return oh(dmg * 0.25, why);
    }
    return oh(dmg, why);
  };
  // Posen
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (!r || !r.arms || r.arms.length < 2 || P.vehicle) return;
    const [R, Lf] = r.arms;
    if (M.ultT >= 0) { const u = M.ultT; const up = u < 0.6; R.arm.rotation.x = Lf.arm.rotation.x = up ? -2.9 : -0.4; R.elbow.rotation.x = Lf.elbow.rotation.x = up ? -0.3 : -1.6; if (r.legs) r.legs.forEach((l) => { l.leg.rotation.x = up ? -0.6 : 0.3; l.knee.rotation.x = up ? 1.1 : 0.4; }); return; }
    if (M.block && free()) { R.arm.rotation.set(-1.5, 0, -0.5); Lf.arm.rotation.set(-1.5, 0, 0.5); R.elbow.rotation.x = Lf.elbow.rotation.x = -1.9; if (r.torso) r.torso.rotation.x = 0.12; return; }
    if (!M.cur) return;
    const u = Math.min(1, M.t / M.cur.dur), sw = u < M.cur.hit ? u / M.cur.hit : 1 - (u - M.cur.hit) / (1 - M.cur.hit);
    const g = Math.max(0, sw);
    if (M.cur.n === 'jab') { R.arm.rotation.set(-1.55 * g - 0.2, 0, 0.1); R.elbow.rotation.x = -1.4 * (1 - g); Lf.arm.rotation.set(-1.2, 0, 0.3); Lf.elbow.rotation.x = -1.6; if (r.torso) r.torso.rotation.y = -0.3 * g; }
    else if (M.cur.n === 'haken') { Lf.arm.rotation.set(-1.4, 0, 0.4 + 0.9 * g); Lf.elbow.rotation.x = -1.2; R.arm.rotation.set(-1.2, 0, -0.3); R.elbow.rotation.x = -1.6; if (r.torso) r.torso.rotation.y = 0.55 * g; }
    else if (M.cur.n === 'tritt') { if (r.legs && r.legs[0]) { r.legs[0].leg.rotation.x = -1.5 * g; r.legs[0].knee.rotation.x = 0.4 * (1 - g); } R.arm.rotation.set(-0.6, 0, -0.6 * g); Lf.arm.rotation.set(-0.8, 0, 0.6 * g); if (r.torso) r.torso.rotation.x = -0.2 * g; }
    else { R.arm.rotation.set(-0.3 - 2.6 * g, 0, 0.1); R.elbow.rotation.x = -1.6 * (1 - g); Lf.arm.rotation.set(-1.1, 0, 0.3); Lf.elbow.rotation.x = -1.6; if (r.torso) r.torso.rotation.x = -0.25 * g; if (r.body) r.body.position.y = 0.2 * g; }
  };
  L.updateMoves = function (dt) {
    const ok = free(), K = L.keys || {};
    const kb = !!K.KeyB && !L.chatOpen; if (kb && !M.block) M.blockT = performance.now(); M.block = kb;
    const ku = !!K.KeyU; if (ku && !M.uPrev && ok && M.ult >= 100 && M.ultT < 0) { M.ult = 0; M.ultT = 0; L.banner('⚡ ULTIMATE: METEOR-SCHLAG', ''); L.fovKick = 8; } M.uPrev = ku;
    bar.style.display = ok || M.ult > 0 ? 'block' : 'none';
    fill.style.width = M.ult + '%'; lab.textContent = M.ult >= 100 ? '⚡ ULTIMATE BEREIT – U' : 'Ultimate ' + Math.floor(M.ult) + '%';
    if (M.ultT >= 0) {
      M.ultT += dt; const u = M.ultT;
      if (u < 0.6) { P.vy = 14; P.air = true; P.vx = P.vz = 0; if (Math.random() < 0.5) L.fx('#ffd040', P.x, (P.y || 0) + 1, P.z, 2, 3, { basic: true, size: 0.2, life: 0.4 }); }
      else if (!M.slam) { M.slam = true; P.vy = -45; }
      if (M.slam && !P.air && !M.boomed) {
        M.boomed = true; L.shake = 2; L.fovKick = 10; L.snd.stomp && L.snd.stomp({ x: P.x, y: 0, z: P.z }); L.snd.explosion && L.snd.explosion({ x: P.x, y: 1, z: P.z });
        for (let k = 0; k < 36; k++) { const a = k / 36 * 6.283; L.fx(k % 2 ? '#ffb030' : '#ffffff', P.x + Math.sin(a) * 6, 0.5, P.z + Math.cos(a) * 6, 4, 16, { basic: true, size: 0.5, life: 0.9 }); }
        for (const e of (L._targets ? L._targets() : [])) { if (e.dead || Math.hypot(e.x - P.x, e.z - P.z) > 14 + (e.bigR || 0)) continue; L.damageEnt(e, 260, P.x, P.z, P); if (L.MK && L.MK[e.kind]) e.launchT = 0.9; }
      }
      if (M.boomed || u > 4) { M.ultT = -1; M.slam = false; M.boomed = false; }
      return;
    }
    if (M.cur) { M.t += dt; if (!M.hitDone && M.t >= M.cur.dur * M.cur.hit) { M.hitDone = true; hitFront(M.cur); } if (M.t >= M.cur.dur) M.cur = null; }
    if (ok && !M.block && !M.cur && L.mouse && L.mouse.click) {
      const now = performance.now() / 1000; M.idx = now - M.last < 0.7 ? (M.idx + 1) % 4 : 0; M.last = now;
      M.cur = MOVES[M.idx]; M.t = 0; M.hitDone = false; L.snd.swing && L.snd.swing();
    }
    if (!ok) { M.cur = null; }
  };
  L.clearMoves = function () { M.cur = null; M.ult = 0; M.ultT = -1; M.block = false; };
})();
