'use strict';
// Kampf-Gefühl (Battlegrounds-Stil): Schadenszahlen, Treffer-Blitz + Funken, Kamera-Kick, Rückstoß + Zusammenzucken,
// Nahkampf-Combos (4. Schlag schleudert weg), roter Rand bei Treffern, Sprint-Dash (Z) mit Nachbildern.
(function () {
  const L = window.L, T = THREE, P = L.player;
  L.fovKick = 0;
  const nums = [], wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:13;overflow:hidden'; document.body.appendChild(wrap);
  const vig = document.createElement('div'); vig.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:12;opacity:0;transition:opacity .35s;box-shadow:inset 0 0 160px 40px rgba(220,0,0,.75)'; document.body.appendChild(vig);
  const cs = document.createElement('style'); cs.textContent = '.dmgN{position:absolute;font:900 22px Impact,"Arial Black",sans-serif;color:#fff;text-shadow:0 0 4px #000,2px 2px 0 #000;transform:translate(-50%,-50%);white-space:nowrap}.dmgN.big{font-size:34px;color:#ffd040}.dmgN.combo{font-size:28px;color:#ff60a0}body.cinema .dmgN{display:none}'; document.head.appendChild(cs);
  const V = new T.Vector3();
  function num(text, x, y, z, cls) { const d = document.createElement('div'); d.className = 'dmgN ' + (cls || ''); d.textContent = text; wrap.appendChild(d); nums.push({ d, x, y, z, t: 0, vx: (Math.random() - 0.5) * 40 }); if (nums.length > 40) { const o = nums.shift(); o.d.remove(); } }
  let starTex = null;
  function star() { if (starTex) return starTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,220,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; g.beginPath(); g.moveTo(32 + Math.cos(a) * 6, 32 + Math.sin(a) * 6); g.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); g.stroke(); } starTex = new T.CanvasTexture(c); return starTex; }
  function impact(x, y, z, big) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: star(), color: big ? 0xfff0c0 : 0xffffff, transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    s.position.set(x, y, z); s.scale.setScalar(big ? 3.2 : 1.6); L.scene.add(s); let k = 1;
    const iv = setInterval(() => { k -= 0.2; s.material.opacity = Math.max(0, k); s.scale.multiplyScalar(1.18); if (k <= 0) { clearInterval(iv); L.scene.remove(s); s.material.dispose(); } }, 30);
    L.fx(big ? '#ffd060' : '#ffffff', x, y, z, big ? 18 : 8, big ? 12 : 7, { basic: true, size: big ? 0.25 : 0.15, life: 0.35 });
  }
  // Combos
  const C = { n: 0, t: 0 };
  const od = L.damageEnt;
  L.damageEnt = function (e, dmg, fx, fz, src) {
    const wasDead = e && e.dead; od(e, dmg, fx, fz, src);
    if (!e || src !== P || wasDead || !(dmg > 0) || e.kind === 'remote') return;
    const d = Math.hypot(e.x - P.x, e.z - P.z), melee = d < 7 + (e.bigR || 0) * 0.5, hy = e.kind === 'walker' ? (e.hy || 6) : e.kind === 'boss' ? (e.hy || 20) : (e.hy || 1.4);
    const now = performance.now() / 1000;
    if (melee) { C.n = now - C.t < 0.9 ? C.n + 1 : 1; C.t = now; }
    const fin = melee && C.n >= 4;
    num(dmg >= 1e6 ? '💀' : String(Math.round(dmg)), e.x, (e.y || 0) + Math.min(hy, 12) + 0.6, e.z, fin || dmg >= 500 ? 'big' : '');
    if (melee) {
      const ix = P.x + (e.x - P.x) * 0.6, iz = P.z + (e.z - P.z) * 0.6; impact(ix, (P.y || 0) + 1.3, iz, fin);
      L.fovKick = Math.max(L.fovKick, fin ? 7 : 3); L.shake = Math.max(L.shake, fin ? 0.7 : 0.25);
      // Rückstoß + Zusammenzucken (normale Monster/NPCs)
      if (!e.dead && (L.MK && L.MK[e.kind] || e.kind === 'npc')) { const a = Math.atan2(e.x - P.x, e.z - P.z), k = fin ? 9 : 0.7; e.x += Math.sin(a) * k; e.z += Math.cos(a) * k; e.flinchT = fin ? 0.6 : 0.25; e.stunT = Math.max(e.stunT || 0, fin ? 1.2 : 0.25); if (fin) e.launchT = 0.6; }
      if (fin) { num('COMBO x4!', e.x, (e.y || 0) + 3.2, e.z, 'combo'); C.n = 0; L.snd.stomp && L.snd.stomp({ x: e.x, y: 1, z: e.z }); }
    }
  };
  // Treffer am Spieler: roter Rand + Ruck
  const oh = L.hurtPlayer;
  L.hurtPlayer = function (dmg, why) { const hp0 = P.hp; const r = oh(dmg, why); if (P.hp < hp0) { vig.style.opacity = String(Math.min(1, 0.35 + (hp0 - P.hp) / 60)); setTimeout(() => { vig.style.opacity = '0'; }, 220); L.fovKick = Math.max(L.fovKick, 2); } return r; };
  // Dash (Z)
  const D = { cd: 0, t: 0, dir: null };
  addEventListener('keydown', (e) => {
    if (e.code !== 'KeyZ' || e.repeat || L.chatOpen || L.uiBlock || L.state !== 'game' || P.vehicle || !P.alive || D.cd > 0) return;
    const a = P.camYaw; D.dir = { x: Math.sin(a), z: Math.cos(a) }; D.t = 0.22; D.cd = 1.2; L.fovKick = Math.max(L.fovKick, 6);
    L.nz && L.nz({ dur: 0.25, f: 1200, fTo: 300, type: 'bandpass', vol: 0.25 });
  });
  function ghost() {
    if (!P.rig) return; const g = P.rig.root.clone(true); g.traverse((o) => { if (o.isMesh) { o.material = new T.MeshBasicMaterial({ color: 0x80c8ff, transparent: true, opacity: 0.35, depthWrite: false }); o.castShadow = false; } });
    L.scene.add(g); let k = 0.35; const iv = setInterval(() => { k -= 0.05; g.traverse((o) => { if (o.isMesh) o.material.opacity = Math.max(0, k); }); if (k <= 0) { clearInterval(iv); L.scene.remove(g); } }, 30);
  }
  L.dashKey = () => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ' })); };
  L.updateCombat = function (dt) {
    L.fovKick = Math.max(0, L.fovKick - dt * 30);
    D.cd = Math.max(0, D.cd - dt);
    if (D.t > 0) { D.t -= dt; const sp = 38; P.x += D.dir.x * sp * dt; P.z += D.dir.z * sp * dt; if (L.clampWorld) L.clampWorld(P); if (Math.random() < 0.6) ghost(); }
    // Zusammenzucken / Wegschleudern der Getroffenen
    for (const m of L.ents.monsters) { if (!(m.flinchT > 0) || !m.rig) continue; m.flinchT -= dt; const r = m.rig.root; r.rotation.x = -Math.max(0, m.flinchT) * 1.2; if (m.launchT > 0) { m.launchT -= dt; r.position.y = Math.sin(Math.max(0, m.launchT) / 0.6 * Math.PI) * 2.5; } }
    // Zahlen nach oben schweben lassen
    const cam = L.camera, w = innerWidth, h = innerHeight;
    for (let i = nums.length - 1; i >= 0; i--) {
      const n = nums[i]; n.t += dt; V.set(n.x, n.y + n.t * 1.6, n.z).project(cam);
      if (n.t > 0.9 || V.z > 1) { n.d.remove(); nums.splice(i, 1); continue; }
      n.d.style.left = ((V.x + 1) / 2 * w + n.vx * n.t) + 'px'; n.d.style.top = ((1 - V.y) / 2 * h) + 'px'; n.d.style.opacity = String(Math.min(1, (0.9 - n.t) * 3));
      n.d.style.transform = 'translate(-50%,-50%) scale(' + (n.t < 0.12 ? 1.6 - n.t * 5 : 1) + ')';
    }
  };
  L.clearCombat = function () { for (const n of nums) n.d.remove(); nums.length = 0; C.n = 0; };
})();
