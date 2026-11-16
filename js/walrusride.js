'use strict';
// Walrosse reiten: Geh zu einem normalen Walross (keine Bosse) und drück E – es wird gezähmt, bekommt einen Sattel und du sitzt drauf.
// Reit-Walrosse fliegen (E hoch, C/Shift runter); die Flossen schlagen wie Flügel.
// Höchsttempo einstellbar von 100 bis 5000 km/h: + / − (oder Mausrad), am Handy mit den Knöpfen.
// Im Mehrspieler: Mitspieler bitten den Host ums Zähmen; neue Fahrzeuge des Hosts erscheinen bei allen.
(function () {
  const L = window.L, T = THREE, P = L.player, E = L.ents;
  const TYPE = 'walross_ride', MIN = 100, MAX = 5000;
  L.VTYPES[TYPE] = { name: 'Reit-Walross', vmax: 300, acc: 30, hp: 400, kind: 'bike', fly: true, len: 4.2, wid: 2.6, off: 1, walrus: true };
  const isClient = () => L.net && L.net.role === 'client';
  const isHost = () => L.net && L.net.role === 'host' && L.net.connected;
  // ---------- Modell ----------
  const obv = L.buildVehicle;
  L.buildVehicle = function (type, cust) {
    if (type !== TYPE) return obv(type, cust);
    const root = new T.Group(), r = L.buildWalross();
    if (L.decorateWalross && L.WALROSS_VARS) { try { L.decorateWalross(r, (cust && cust.wv) || L.pick(L.WALROSS_VARS)); } catch (e) { /* egal */ } }
    root.add(r.root);
    const add = (geo, c, sx, sy, sz, x, y, z, par) => { const m = new T.Mesh(geo, L.mat(c)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
    add(L.GEO.box, '#7a3a1a', 1.3, 0.18, 1.5, 0, 1.12, 0.1, r.body); add(L.GEO.box, '#c02a2a', 1.35, 0.06, 1.55, 0, 1.22, 0.1, r.body);
    add(L.GEO.box, '#f0c840', 1.36, 0.05, 0.08, 0, 1.25, 0.86, r.body);
    for (const s of [-1, 1]) { add(L.GEO.box, '#3a2a1a', 0.04, 0.9, 0.04, s * 0.7, 0.7, 0.1, r.body); add(L.GEO.box, '#888', 0.18, 0.06, 0.25, s * 0.72, 0.24, 0.1, r.body); }
    for (const s of [-1, 1]) { const rein = add(L.GEO.box, '#3a2a1a', 0.03, 0.03, 1.2, s * 0.25, 1.15, 1.45, r.body); rein.rotation.x = -0.35; }
    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    root.userData.walrus = r;
    return { root, wheels: [], steer: [], seat: { x: 0, y: 1.55, z: 0.05 }, seats: [{ x: 0, y: 1.55, z: 0.05 }, { x: 0, y: 1.6, z: -0.8 }], glassZ: 0, color: '#7a5a4c' };
  };
  // ---------- Neue Fahrzeuge des Hosts an alle schicken ----------
  setTimeout(() => {
    const g = L._g; if (!g || g._vaddWrapped) return; g._vaddWrapped = true;
    const osv = g.spawnVehicle;
    g.spawnVehicle = function (sp) {
      osv(sp);
      const v = E.vehicles[E.vehicles.length - 1];
      if (v && isHost() && L.state === 'game' && L.mp && L.mp.send) L.mp.send({ t: 'vadd', id: v.id, type: v.type, x: v.x, z: v.z, yaw: v.yaw, cust: v.cust || null });
      return v;
    };
  }, 0);
  L.vaddRemote = function (m) {
    if (!isClient() || L.byId.get('v' + m.id) || !L.VTYPES[m.type] || !L._g) return;
    L._g.spawnVehicle({ id: m.id, type: m.type, x: m.x, z: m.z, yaw: m.yaw, cust: m.cust || undefined });
    if (pendingTame && pendingTame.vid === m.id) tryEnterPending();
  };
  // ---------- Zähmen ----------
  function nearWalrus() {
    if (P.vehicle || !P.alive || L.cine) return null;
    let best = null, bd = 4.5;
    for (const m of E.monsters) { if (m.dead || m.kind !== 'walross') continue; const d = Math.hypot(m.x - P.x, m.z - P.z); if (d < bd && Math.abs((P.y || 0)) < 3) { bd = d; best = m; } }
    return best;
  }
  function tame(m) {
    // Monster verschwindet (kommt später woanders wieder), an seiner Stelle steht das Reit-Walross
    m.dead = true; m.deadT = 99; if (m.rig) { L.scene.remove(m.rig.root); m.rig.root.visible = false; }
    const i = E.monsters.indexOf(m); if (i >= 0) E.monsters.splice(i, 1);
    if (L.byId) L.byId.delete(m.key);
    if (L.respawnQueue) L.respawnQueue.push({ kind: 'walross', variant: m.variant, isl: m.isl || null, t: 60 });
    L._g.spawnVehicle({ type: TYPE, x: m.x, z: m.z, yaw: m.yaw || 0, cust: { wv: m.variant || null } });
    return E.vehicles[E.vehicles.length - 1];
  }
  let pendingTame = null;
  function tryEnterPending() {
    const p = pendingTame; if (!p) return;
    const v = L.byId.get('v' + p.vid); if (!v) return;
    pendingTame = null; P.x = v.x + 1; P.z = v.z; L._enterVehicle(v); hello(v);
  }
  function hello(v) {
    L.msg('🦭 Das Walross ist gezähmt! Fliegen: E hoch, C runter · Tempo ' + (v.wTop || 300) + ' km/h – mit + / − (oder Mausrad) zwischen 100 und 5000 km/h einstellen.', 7000);
    L.snd.walross ? L.snd.walross({ x: v.x, y: 2, z: v.z }) : (L.tn && L.tn({ f: 120, fTo: 90, dur: 0.4, type: 'sawtooth', vol: 0.2 }));
  }
  L.tameRemote = function (m, from) {
    if (isClient()) return;
    const mo = L.byId.get(m.id); if (!mo || mo.dead || mo.kind !== 'walross') return;
    const v = tame(mo); if (v && L.mp && L.mp.sendTo) L.mp.sendTo(from, { t: 'tamed', vid: v.id });
  };
  L.tamedReply = function (m) { pendingTame = { vid: m.vid, t: performance.now() }; tryEnterPending(); };
  const och = L.crateHint, oci = L.crateInteract;
  L.crateHint = () => { const m = nearWalrus(); return m ? 'E: 🦭 Walross zähmen und reiten (fliegt bis 5000 km/h!)' : och ? och() : null; };
  L.crateInteract = function () {
    const m = nearWalrus(); if (!m) return oci ? oci() : false;
    if (isClient()) { if (L.mp && L.mp.send) L.mp.send({ t: 'tame', id: m.key }); L.msg('🦭 Du versuchst, das Walross zu zähmen …', 2000); return true; }
    const v = tame(m); if (v) { L._enterVehicle(v); hello(v); }
    return true;
  };
  // ---------- Tempo einstellen ----------
  function rideV() { const v = P.vehicle; return v && v.type === TYPE && !(P.seat > 0) ? v : null; }
  function setTop(v, val) {
    v.wTop = Math.round(L.clamp(val, MIN, MAX) / 50) * 50;
    if (!v.tOwn) { v.t = Object.assign({}, v.t); v.tOwn = true; }
    v.t.vmax = v.wTop; v.t.acc = Math.max(30, v.wTop / 9);
    L.msg('🦭 Höchsttempo: ' + v.wTop + ' km/h', 1200);
  }
  const step = (v) => (v.wTop >= 1000 ? 250 : v.wTop >= 400 ? 100 : 50);
  addEventListener('keydown', (e) => {
    const v = rideV(); if (!v || L.chatOpen || L.uiBlock) return;
    if (e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '+') { setTop(v, (v.wTop || 300) + step(v)); e.preventDefault(); }
    else if (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.key === '-') { setTop(v, (v.wTop || 300) - step(v)); e.preventDefault(); }
  });
  addEventListener('wheel', (e) => { const v = rideV(); if (!v || L.uiBlock) return; setTop(v, (v.wTop || 300) + (e.deltaY < 0 ? 1 : -1) * step(v)); }, { passive: true });
  // Handy: zwei Knöpfe + Anzeige
  const ui = document.createElement('div');
  ui.style.cssText = 'position:fixed;right:12px;top:45%;z-index:14;display:none;flex-direction:column;gap:6px;align-items:center;font:900 13px Arial,sans-serif;color:#fff;text-shadow:0 1px 3px #000';
  ui.innerHTML = '<button data-d="1" style="width:52px;height:44px;border-radius:12px;border:2px solid #ffd040;background:rgba(0,0,0,.55);color:#fff;font:900 22px Arial">+</button><span id="wTopTxt">300 km/h</span><button data-d="-1" style="width:52px;height:44px;border-radius:12px;border:2px solid #ffd040;background:rgba(0,0,0,.55);color:#fff;font:900 22px Arial">−</button>';
  document.body.appendChild(ui);
  ui.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); e.stopPropagation(); const v = rideV(); if (v) setTop(v, (v.wTop || 300) + (+b.dataset.d) * step(v)); });
  const cs = document.createElement('style'); cs.textContent = 'body.cinema #wTopUi{visibility:hidden}'; document.head.appendChild(cs); ui.id = 'wTopUi';
  // ---------- jedes Bild: Animation, Tempo-Anzeige ----------
  L.updateWalrusRide = function (dt) {
    const v = rideV();
    ui.style.display = v ? 'flex' : 'none';
    if (v) { if (!v.wTop) setTop(v, 300); const tx = document.getElementById('wTopTxt'); if (tx) tx.textContent = v.wTop + ' km/h'; }
    const t = performance.now() / 1000;
    for (const w of E.vehicles) {
      if (w.type !== TYPE) continue;
      const r = w.rig && w.rig.root.userData.walrus; if (!r || Math.hypot(w.x - P.x, w.z - P.z) > 400) continue;
      const air = (w.alt || 0) > 0.6, sp = Math.abs(w.speed || 0);
      w.wPh = (w.wPh || 0) + dt * (air ? 9 + Math.min(20, sp * 0.02) : 2 + sp * 0.4);
      if (L.animWalross) L.animWalross(r, w.wPh, air ? { rear: -0.1, hop: 0, headX: -0.15, flip: 0 } : sp > 0.5 ? { hop: Math.abs(Math.sin(w.wPh)) * 0.2, rear: -Math.sin(w.wPh) * 0.08, flip: Math.sin(w.wPh) * 0.4 } : { headY: Math.sin(t * 0.4) * 0.4 });
      r.flips.forEach((f, i) => { if (air) { f.rotation.x = 0; f.rotation.z = (i ? 1 : -1) * (0.4 + Math.sin(w.wPh) * 0.9); } else f.rotation.z = i ? 1 : -1; });
      if (air && sp > 300 && Math.random() < dt * 30) L.fx('#ffffff', w.x - Math.sin(w.yaw) * 3, (w.alt || 0) + 1.5, w.z - Math.cos(w.yaw) * 3, 2, 2, { basic: true, size: 0.3, life: 0.5 });
    }
    if (pendingTame && performance.now() - pendingTame.t > 4000) pendingTame = null; else if (pendingTame) tryEnterPending();
  };
})();
