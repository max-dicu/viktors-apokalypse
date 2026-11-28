'use strict';
// Kampf im „Battlegrounds“-Stil: jeder Skin hat EIGENE Spezialangriffe (R, F) und eine eigene Ultimate (U).
// Dazu für alle Treffer: Impact-Frames, Zeitlupe, Kamera-Stöße, Treffer-Funken, Schadenszahlen, Combo-Zähler, Schleuder-Spuren.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const free = () => L.state === 'game' && P.alive && !P.vehicle && !L.uiBlock && !L.cine && !(L.selType && L.selType()) && !(P.rig && P.rig.monsterKind);
  const targets = () => (L._targets ? L._targets() : []).filter((e) => !e.dead);
  const fwd = () => ({ x: Math.sin(P.camYaw), z: Math.cos(P.camYaw) });
  const handPos = () => { const v = new T.Vector3(); if (P.rig && P.rig.hand) P.rig.hand.getWorldPosition(v); else { const f = fwd(); v.set(P.x + f.x * 0.6, (P.y || 0) + 1.3, P.z + f.z * 0.6); } return v; };
  const addFx = (o, life, upd) => { L.scene.add(o); fxs.push({ o, t: 0, life, upd }); return o; };
  const fxs = [];
  const add = (col, op) => new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op == null ? 1 : op, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });

  // ---------- Grundeffekte ----------
  const cv = () => (L.renderer && L.renderer.domElement);
  function impactFrame(ms) { const c = cv(); if (!c) return; c.style.filter = 'invert(1) contrast(1.6) saturate(0)'; setTimeout(() => { c.style.filter = 'contrast(1.8) saturate(1.6)'; setTimeout(() => { c.style.filter = ''; }, 45); }, ms || 60); }
  let slowT = 0; function slowmo(dur, k) { slowT = dur; L.timeScale = k || 0.3; }
  function camPunch(f, s) { L.fovKick = Math.max(L.fovKick || 0, f); L.shake = Math.max(L.shake || 0, s); }
  function sparks(p, col, n, len) {
    const g = new T.Group(); g.position.copy(p);
    for (let i = 0; i < (n || 10); i++) { const m = new T.Mesh(new T.BoxGeometry(0.05, 0.05, len || 1.2), add(col)); const d = new T.Vector3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize(); m.lookAt(d); m.position.copy(d.multiplyScalar(0.3)); m.userData.d = d.clone().normalize(); g.add(m); }
    g.lookAt(L.camera.position); addFx(g, 0.22, (o, k) => { o.children.forEach((m) => { m.position.addScaledVector(m.userData.d, 0.25); m.material.opacity = 1 - k; m.scale.z = 1 - k * 0.6; }); });
  }
  function ring(p, col, r, dur, flat) {
    const m = new T.Mesh(new T.TorusGeometry(1, 0.07, 6, 40), add(col, 0.95)); m.position.copy(p); if (flat) m.rotation.x = Math.PI / 2; else m.lookAt(L.camera.position);
    addFx(m, dur, (o, k) => { o.scale.setScalar(0.2 + k * r); o.material.opacity = 0.95 * (1 - k); });
  }
  function flashBall(p, col, r, dur) { const m = new T.Mesh(new T.SphereGeometry(1, 16, 12), add(col, 0.9)); m.position.copy(p); addFx(m, dur, (o, k) => { o.scale.setScalar(r * (0.3 + k)); o.material.opacity = 0.9 * (1 - k); }); }
  function dmgNum(x, y, z, n, col) {
    const v = new T.Vector3(x, y, z).project(L.camera); if (v.z > 1) return;
    const d = document.createElement('div'); d.textContent = Math.round(n);
    d.style.cssText = `position:fixed;left:${(v.x * 0.5 + 0.5) * innerWidth}px;top:${(-v.y * 0.5 + 0.5) * innerHeight}px;transform:translate(-50%,-50%) scale(1.4);font:900 ${n > 100 ? 34 : 24}px Impact,Arial Black;color:${col || '#fff'};-webkit-text-stroke:2px #000;pointer-events:none;z-index:40;transition:transform .5s ease-out,opacity .5s,top .6s ease-out`;
    document.body.appendChild(d); requestAnimationFrame(() => { d.style.transform = 'translate(-50%,-50%) scale(1)'; d.style.top = (parseFloat(d.style.top) - 60) + 'px'; d.style.opacity = '0'; }); setTimeout(() => d.remove(), 700);
  }
  // Combo-Zähler
  const combo = document.createElement('div'); combo.style.cssText = 'position:fixed;right:24px;top:38%;font:900 46px Impact,Arial Black;color:#fff;-webkit-text-stroke:2px #000;text-shadow:0 4px 0 #000;pointer-events:none;z-index:40;opacity:0;transition:opacity .3s;text-align:right';
  document.body.appendChild(combo); let comboN = 0, comboT = 0;
  function countHit(n) { comboN += n; comboT = 2; combo.innerHTML = comboN + '<div style="font-size:18px">HIT COMBO</div>'; combo.style.opacity = '1'; combo.animate([{ transform: 'scale(1.5) rotate(-6deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 160 }); }

  // Treffer: Schaden + Effekte + Schleudern
  function hit(e, dmg, col, launch, push, fromX, fromZ) {
    L.damageEnt(e, dmg, fromX == null ? P.x : fromX, fromZ == null ? P.z : fromZ, P);
    const y = (e.y || 0) + 1.2 + (e.bigR ? 2 : 0), p = new T.Vector3(e.x, y, e.z);
    sparks(p, col, 9, 1.1); ring(p, col, 2.4, 0.25); dmgNum(e.x, y + 0.6, e.z, dmg, '#' + new T.Color(col).getHexString());
    if (L.MK && L.MK[e.kind]) { if (launch) e.launchT = launch; if (push) { const a = Math.atan2(e.x - (fromX == null ? P.x : fromX), e.z - (fromZ == null ? P.z : fromZ)); e.x += Math.sin(a) * push; e.z += Math.cos(a) * push; } e.stunT = Math.max(e.stunT || 0, 0.6); e.trailT = 0.5; }
    countHit(1);
  }
  const inCone = (e, r, cos) => { const f = fwd(), dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); return d < r + (e.bigR || 0) && (d < 1 || (dx * f.x + dz * f.z) / d > cos); };
  const near = (x, z, r) => targets().filter((e) => Math.hypot(e.x - x, e.z - z) < r + (e.bigR || 0));
  const nearestFront = (r) => { let best = null, bd = 1e9; for (const e of targets()) { if (!inCone(e, r, 0.5)) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < bd) { bd = d; best = e; } } return best; };

  // ---------- Angriffs-Bausteine ----------
  const A = {
    // Schlag-Hagel: viele schnelle Treffer nach vorne
    flurry(c, big) { const n = big ? 14 : 8; for (let i = 0; i < n; i++) setTimeout(() => { const f = fwd(), p = new T.Vector3(P.x + f.x * 1.6 + (Math.random() - 0.5), (P.y || 0) + 1 + Math.random() * 0.8, P.z + f.z * 1.6 + (Math.random() - 0.5)); flashBall(p, c.col, 0.35, 0.12); for (const e of targets()) if (inCone(e, 3.4, 0.4)) hit(e, c.dmg / n * 1.6, c.col, 0, 0.3); camPunch(2, 0.25); if (i === n - 1) { for (const e of targets()) if (inCone(e, 3.6, 0.4)) hit(e, c.dmg, c.col, 0.7, 7); impactFrame(); camPunch(10, 1); } }, i * (big ? 55 : 80)); },
    // Ansturm: nach vorne rasen, alles umrennen
    charge(c, big) { const f = fwd(), len = big ? 26 : 14, steps = 10; for (let i = 0; i <= steps; i++) setTimeout(() => { P.x += f.x * len / steps; P.z += f.z * len / steps; if (L.clampWorld) L.clampWorld(P); ghost(c.col); for (const e of near(P.x, P.z, 2.6)) if (!e._hitBy) { e._hitBy = 1; hit(e, c.dmg, c.col, 0.6, 9); setTimeout(() => { e._hitBy = 0; }, 400); } if (i === steps) { ring(new T.Vector3(P.x, (P.y || 0) + 1, P.z), c.col, 6, 0.35); camPunch(8, 0.8); } }, i * 22); L.speedLines && L.speedLines(0.4); },
    // Kegel-Druckwelle (Klatschen / Schildstoß / Brüllen)
    cone(c, big) { const f = fwd(), r = big ? 22 : 11, hp = handPos(); for (let k = 0; k < 6; k++) setTimeout(() => ring(new T.Vector3(hp.x + f.x * k * r / 6, hp.y, hp.z + f.z * k * r / 6), c.col, 1.5 + k * (big ? 1.6 : 0.8), 0.35), k * 40); for (const e of targets()) if (inCone(e, r, 0.55)) hit(e, c.dmg, c.col, 0.5, big ? 14 : 8); impactFrame(); camPunch(12, 1.1); },
    // Strahl (Laser / Speer / Blitz-Wurf)
    beam(c, big) { const hp = handPos(), f = fwd(), len = big ? 60 : 32, w = big ? 1.4 : 0.5; const m = new T.Mesh(new T.CylinderGeometry(w, w, len, 12, 1, true), add(c.col, 0.95)); m.rotation.x = Math.PI / 2; const g = new T.Group(); g.add(m); m.position.z = len / 2; g.position.copy(hp); g.rotation.y = P.camYaw; const core = new T.Mesh(new T.CylinderGeometry(w * 0.4, w * 0.4, len, 8, 1, true), add(0xffffff)); core.rotation.x = Math.PI / 2; core.position.z = len / 2; g.add(core);
      addFx(g, big ? 0.9 : 0.45, (o, k) => { o.scale.set(1 - k * 0.7, 1 - k * 0.7, 1); o.children.forEach((x) => { x.material.opacity = 1 - k; }); });
      for (const e of targets()) { const dx = e.x - P.x, dz = e.z - P.z, along = dx * f.x + dz * f.z, side = Math.abs(dx * f.z - dz * f.x); if (along > 0 && along < len && side < w + 1.4 + (e.bigR || 0)) hit(e, c.dmg, c.col, 0.4, 6); }
      flashBall(hp, c.col, big ? 3 : 1.4, 0.3); impactFrame(); camPunch(big ? 14 : 9, big ? 1.4 : 0.8); },
    // Geschoss (Rakete / Netz / Dolche)
    shot(c, big) { const n = big ? 7 : 1; for (let i = 0; i < n; i++) setTimeout(() => { const hp = handPos(), f = fwd(), spread = n > 1 ? (i - (n - 1) / 2) * 0.12 : 0; const d = new T.Vector3(Math.sin(P.camYaw + spread), 0, Math.cos(P.camYaw + spread)); const m = new T.Mesh(new T.SphereGeometry(big ? 0.6 : 0.4, 12, 8), add(c.col)); m.position.copy(hp); let done = false;
      addFx(m, 1.3, (o, k, dt) => { if (done) { o.visible = false; return; } o.position.addScaledVector(d, 50 * dt); if (Math.random() < 0.6) L.fx && L.fx('#' + new T.Color(c.col).getHexString(), o.position.x, o.position.y, o.position.z, 1, 1, { basic: true, size: 0.2, life: 0.25 }); const hs = near(o.position.x, o.position.z, 1.8); if (hs.length) { done = true; for (const e of near(o.position.x, o.position.z, big ? 5 : 3.5)) hit(e, c.dmg, c.col, 0.5, 6, o.position.x - d.x, o.position.z - d.z); ring(o.position.clone(), c.col, big ? 8 : 5, 0.35); flashBall(o.position.clone(), c.col, 2.2, 0.3); camPunch(6, 0.5); } }); }, i * 70); },
    // Bodenschlag mit Felsspitzen
    slam(c, big) { const f = fwd(), cx = P.x + f.x * (big ? 0 : 3), cz = P.z + f.z * (big ? 0 : 3), r = big ? 18 : 8; const p = new T.Vector3(cx, 0.2, cz); ring(p, c.col, r * 1.1, 0.5, true); ring(p, 0xffffff, r * 0.6, 0.35, true); flashBall(p, c.col, 3, 0.25);
      const n = big ? 26 : 12; for (let k = 0; k < n; k++) { const a = k / n * 6.283, d = r * (0.4 + Math.random() * 0.6), sp = new T.Mesh(new T.ConeGeometry(0.5 + Math.random() * 0.6, 1, 5), new T.MeshLambertMaterial({ color: 0x5a5048 })); sp.position.set(cx + Math.sin(a) * d, 0, cz + Math.cos(a) * d); sp.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5); const h = 2 + Math.random() * (big ? 5 : 3); setTimeout(() => addFx(sp, 1.4, (o, k2) => { o.scale.set(1, k2 < 0.15 ? h * k2 / 0.15 : k2 > 0.8 ? h * (1 - k2) / 0.2 : h, 1); o.position.y = o.scale.y / 2 - 0.2; }), k * 15); }
      for (const e of near(cx, cz, r)) hit(e, c.dmg, c.col, 1.0, 5, cx, cz); L.decal && L.decal(cx, cz, r * 0.35, '#2a2018'); impactFrame(); camPunch(14, 1.6); L.snd && L.snd.stomp && L.snd.stomp({ x: cx, y: 0, z: cz }); },
    // Blitz/Strahl vom Himmel auf Gegner vor dir
    sky(c, big) { const list = big ? targets().filter((e) => Math.hypot(e.x - P.x, e.z - P.z) < 40).slice(0, 10) : [nearestFront(35)].filter(Boolean); if (!list.length) { const f = fwd(); list.push({ x: P.x + f.x * 10, z: P.z + f.z * 10, fake: true }); }
      list.forEach((e, i) => setTimeout(() => { const pts = []; let x = e.x, z = e.z; for (let y = 60; y >= 0; y -= 6) { pts.push(new T.Vector3(x + (y ? (Math.random() - 0.5) * 3 : 0), y, z + (y ? (Math.random() - 0.5) * 3 : 0))); } const g = new T.Group(); for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], b = pts[k + 1], len = a.distanceTo(b), m = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, len, 6), add(c.col)); m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); m.rotateX(Math.PI / 2); g.add(m); } addFx(g, 0.35, (o, k) => o.children.forEach((m) => { m.material.opacity = Math.random() < 0.3 ? 0.2 : 1 - k; }));
        const p = new T.Vector3(e.x, 0.4, e.z); ring(p, c.col, 7, 0.4, true); flashBall(p, 0xffffff, 3, 0.25); if (!e.fake) for (const t of near(e.x, e.z, 4)) hit(t, c.dmg, c.col, 0.6, 3, e.x, e.z); impactFrame(40); camPunch(8, 0.9); L.snd && L.snd.explosion && L.snd.explosion({ x: e.x, y: 1, z: e.z }); }, i * 160)); },
    // Gegner zu dir ziehen und wegtreten
    pull(c) { const e = nearestFront(30); if (!e) return A.shot(c); const hp = handPos(); const line = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 1, 6), add(c.col)); addFx(line, 0.35, (o) => { const b = new T.Vector3(e.x, (e.y || 0) + 1.2, e.z); o.position.copy(hp).add(b).multiplyScalar(0.5); o.scale.y = hp.distanceTo(b); o.lookAt(b); o.rotateX(Math.PI / 2); });
      if (L.MK && L.MK[e.kind]) { const f = fwd(); for (let k = 0; k < 8; k++) setTimeout(() => { e.x += (P.x + f.x * 2 - e.x) * 0.35; e.z += (P.z + f.z * 2 - e.z) * 0.35; }, k * 30); } setTimeout(() => { hit(e, c.dmg, c.col, 0.9, 12); impactFrame(); camPunch(10, 1); }, 280); },
    // Doppelgänger: Illusionen rasen los und explodieren
    clones(c, big) { const n = big ? 6 : 3; for (let i = 0; i < n; i++) { const a = P.camYaw + (i - (n - 1) / 2) * 0.45, g = ghostMesh(c.col, 0.7); if (!g) continue; const d = { x: Math.sin(a), z: Math.cos(a) }; let boomed = false;
      addFx(g, 0.9, (o, k, dt) => { o.position.x += d.x * 30 * dt; o.position.z += d.z * 30 * dt; o.traverse((m) => { if (m.isMesh) m.material.opacity = 0.7 * (1 - k * 0.5); }); if (!boomed && (k > 0.85 || near(o.position.x, o.position.z, 1.5).length)) { boomed = true; const p = o.position.clone(); p.y += 1; flashBall(p, c.col, 3.5, 0.35); ring(p, c.col, 7, 0.35); for (const e of near(p.x, p.z, 4.5)) hit(e, c.dmg, c.col, 0.6, 6, p.x, p.z); camPunch(6, 0.6); o.visible = false; } }); } },
    // Wirbel: drehen und alles ringsum treffen
    spin(c, big) { const r = big ? 12 : 5.5, n = big ? 6 : 3; for (let i = 0; i < n; i++) setTimeout(() => { const p = new T.Vector3(P.x, (P.y || 0) + 1, P.z); ring(p, c.col, r, 0.3, true); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + i; L.fx && L.fx('#' + new T.Color(c.col).getHexString(), P.x + Math.sin(a) * r * 0.6, (P.y || 0) + 1, P.z + Math.cos(a) * r * 0.6, 2, 4, { basic: true, size: 0.25, life: 0.3 }); } for (const e of near(P.x, P.z, r)) hit(e, c.dmg / n * 1.5, c.col, i === n - 1 ? 0.8 : 0, i === n - 1 ? 10 : 1); camPunch(4, 0.4); if (i === n - 1) impactFrame(); }, i * 120); },
    // Herbeirufen: Dinge stürzen vom Himmel (Walrösser!)
    summon(c, big) { const n = big ? 8 : 3, f = fwd(); for (let i = 0; i < n; i++) setTimeout(() => { const x = P.x + f.x * (8 + Math.random() * 10) + (Math.random() - 0.5) * 12, z = P.z + f.z * (8 + Math.random() * 10) + (Math.random() - 0.5) * 12; let o; try { const w = L.buildWalross(); if (L.decorateWalross && L.WALROSS_VARS) L.decorateWalross(w, L.WALROSS_VARS[i % L.WALROSS_VARS.length]); o = w.root; o.scale.setScalar(big ? 2.2 : 1.5); } catch (e) { o = new T.Mesh(new T.SphereGeometry(2, 12, 8), add(c.col)); } o.position.set(x, 45, z); o.rotation.y = Math.random() * 6; let landed = false;
      addFx(o, 2.2, (m, k, dt) => { if (!landed) { m.position.y -= 70 * dt; m.rotation.x += dt * 2; if (m.position.y <= 0) { m.position.y = 0; landed = true; const p = new T.Vector3(x, 0.3, z); ring(p, c.col, 9, 0.45, true); flashBall(p, 0xffffff, 3, 0.25); for (const e of near(x, z, 6)) hit(e, c.dmg, c.col, 1, 6, x, z); camPunch(9, 1.2); impactFrame(40); L.snd && L.snd.stomp && L.snd.stomp({ x, y: 0, z }); } } else if (k > 0.8) m.scale.multiplyScalar(0.9); }); }, i * 200); },
  };

  // Nachbilder (Afterimages)
  function ghostMesh(col, op) { if (!P.rig) return null; const g = P.rig.root.clone(true); g.traverse((o) => { if (o.isMesh) { o.material = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op || 0.35, depthWrite: false, blending: T.AdditiveBlending }); o.castShadow = false; } }); g.position.copy(P.rig.root.position); g.rotation.copy(P.rig.root.rotation); return g; }
  function ghost(col) { const g = ghostMesh(col, 0.4); if (g) addFx(g, 0.3, (o, k) => o.traverse((m) => { if (m.isMesh) m.material.opacity = 0.4 * (1 - k); })); }

  // ---------- jeder Skin: eigene Moves ----------
  const K = (n1, t1, n2, t2, nu, tu, col, pose1, pose2, poseU) => ({ s1: { n: n1, t: t1, pose: pose1 }, s2: { n: n2, t: t2, pose: pose2 }, u: { n: nu, t: tu, pose: poseU }, col });
  const KITS = {
    '': K('Serienschläge', 'flurry', 'Schulter-Ramme', 'charge', 'Ernsthafter Schlag', 'cone', 0xffe8a0, 'punch', 'charge', 'punch'),
    waechter: K('Schildstoß', 'cone', 'Lichtspeer', 'beam', 'Bastion des Lichts', 'sky', 0x60c8ff, 'cast', 'throw', 'raise'),
    titan: K('Repulsor', 'beam', 'Raketenfaust', 'shot', 'Unibeam', 'beam', 0x40e0ff, 'cast', 'punch', 'cast'),
    h_koloss: K('Donnerklatschen', 'cone', 'Gamma-Bodenschlag', 'slam', 'Weltenbrecher', 'slam', 0x60ff40, 'clap', 'slam', 'slam'),
    h_netz: K('Netzzug', 'pull', 'Netzschuss', 'shot', 'Netzsturm', 'spin', 0xf0f0ff, 'cast', 'throw', 'spin'),
    h_thor: K('Hammerwurf', 'beam', 'Blitzschlag', 'sky', 'Donnergott', 'sky', 0x80c8ff, 'throw', 'raise', 'raise'),
    h_loki: K('Illusionen', 'clones', 'Dolchwirbel', 'spin', 'Zepter der Täuschung', 'clones', 0x40ff80, 'cast', 'spin', 'cast'),
    h_walross: K('Bauchplatscher', 'slam', 'Stoßzahn-Ansturm', 'charge', 'Walross-Regen', 'summon', 0xd8a080, 'slam', 'charge', 'raise'),
    h_beyza: K('Sternenschauer', 'shot', 'Herzwelle', 'cone', 'Glanz der Königin', 'sky', 0xff80d0, 'cast', 'cast', 'raise'),
    h_marlon: K('Krücken-Wirbel', 'spin', 'Infinity-Stoß', 'beam', 'Sechs Steine', 'sky', 0xb060ff, 'spin', 'punch', 'raise'),
    baer: K('Tatzenhieb', 'flurry', 'Kuschel-Rolle', 'charge', 'Bärenbrüllen', 'cone', 0xff9ad0, 'punch', 'charge', 'roar'),
    viktor: K('Kriech-Biss', 'charge', 'Zombie-Schrei', 'cone', 'Horde', 'clones', 0x9aff60, 'charge', 'roar', 'roar'),
    daniel: K('Knüppel-Hagel', 'flurry', 'Polizei-Rammbock', 'charge', 'Großeinsatz', 'sky', 0x6090ff, 'punch', 'charge', 'raise'),
    richard: K('Schrot-Salve', 'cone', 'Muskel-Ansturm', 'charge', 'Richards Zorn', 'slam', 0xffa040, 'cast', 'charge', 'slam'),
  };
  const skin = () => { const s = (P.rig && P.rig.app && P.rig.app.special) || (L.save && L.save.char && L.save.char.special) || ''; return KITS[s] ? s : ''; };
  const DMG = { s1: 70, s2: 90, u: 420 }, CD = { s1: 5, s2: 8 };
  const S = { cd: { s1: 0, s2: 0 }, pose: null, poseT: 0, poseD: 0 };

  function useMove(slot) {
    const kit = KITS[skin()], mv = slot === 'u' ? kit.u : kit[slot], big = slot === 'u';
    S.pose = mv.pose; S.poseT = 0; S.poseD = big ? 1.0 : 0.55;
    const c = { col: kit.col, dmg: DMG[slot] };
    // Anlauf: kurz Zeitlupe + Zoom bei der Ultimate, dann zuschlagen
    if (big) { slowmo(0.55, 0.25); camPunch(14, 0.3); L.banner && L.banner('⚡ ' + mv.n.toUpperCase(), ''); ring(new T.Vector3(P.x, (P.y || 0) + 1, P.z), kit.col, 5, 0.5, true); flashBall(new T.Vector3(P.x, (P.y || 0) + 1.2, P.z), kit.col, 2.5, 0.5); }
    else { label(mv.n, kit.col); }
    setTimeout(() => { try { A[mv.t](c, big); } catch (e) { console.error(e); } }, big ? 380 : 140);
    L.snd && L.snd.swing && L.snd.swing(); L.nz && L.nz({ dur: big ? 0.8 : 0.3, f: 400, fTo: 2400, type: 'bandpass', vol: big ? 0.35 : 0.2 });
  }
  // Name des Moves kurz einblenden
  const lab = document.createElement('div'); lab.style.cssText = 'position:fixed;left:50%;top:24%;transform:translateX(-50%);font:900 30px Impact,Arial Black;letter-spacing:2px;-webkit-text-stroke:1.5px #000;text-shadow:0 3px 0 #000;pointer-events:none;z-index:40;opacity:0;transition:opacity .4s';
  document.body.appendChild(lab);
  function label(n, col) { lab.textContent = n.toUpperCase(); lab.style.color = '#' + new T.Color(col).getHexString(); lab.style.opacity = '1'; lab.animate([{ transform: 'translateX(-50%) scale(1.6)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 180 }); clearTimeout(lab._t); lab._t = setTimeout(() => { lab.style.opacity = '0'; }, 900); }

  // Leiste mit den Moves (unten)
  const hud = document.createElement('div'); hud.id = 'skillHud'; hud.style.cssText = 'position:fixed;left:50%;bottom:98px;transform:translateX(-50%);display:flex;gap:8px;pointer-events:none;z-index:30;font:700 12px Arial;color:#fff';
  document.body.appendChild(hud);
  const cs = document.createElement('style'); cs.textContent = 'body.cinema #skillHud{visibility:hidden}.skb{position:relative;min-width:96px;padding:5px 8px;border-radius:8px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.25);text-align:center;overflow:hidden}.skb b{color:#ffe040}.skb i{position:absolute;left:0;bottom:0;height:3px;background:#ffe040}'; document.head.appendChild(cs);
  let hudSkin = null;
  function drawHud() { const s = skin(), kit = KITS[s]; if (hudSkin !== s) { hudSkin = s; hud.innerHTML = `<div class="skb"><b>R</b> ${kit.s1.n}<i></i></div><div class="skb"><b>F</b> ${kit.s2.n}<i></i></div><div class="skb"><b>U</b> ${kit.u.n}</div>`; }
    const bars = hud.querySelectorAll('i'); bars[0].style.width = (100 - S.cd.s1 / CD.s1 * 100) + '%'; bars[1].style.width = (100 - S.cd.s2 / CD.s2 * 100) + '%'; }

  // Tasten: R / F (nur mit leerer Hand), Ultimate läuft über U (Leiste aus dem Faustkampf)
  const vehNear = () => (L.ents.vehicles || []).some((v) => Math.hypot(v.x - P.x, v.z - P.z) < 5);
  addEventListener('keydown', (e) => {
    if (e.repeat || L.chatOpen || !free()) return;
    if (e.code === 'KeyR' && S.cd.s1 <= 0) { S.cd.s1 = CD.s1; useMove('s1'); }
    if (e.code === 'KeyF' && S.cd.s2 <= 0 && !vehNear()) { S.cd.s2 = CD.s2; useMove('s2'); }
  });
  // Ultimate: die bestehende Meteor-Ultimate (U) wird pro Skin ersetzt
  L.skillUlt = () => { if (skin() === '') return false; useMove('u'); return true; }; // eigener Skin: Meteor-Schlag bleibt

  // Handy: zwei Knöpfe
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
    const tb = document.createElement('div'); tb.style.cssText = 'position:fixed;right:96px;bottom:170px;display:flex;flex-direction:column;gap:10px;z-index:31';
    for (const [k, t] of [['KeyR', 'R'], ['KeyF', 'F']]) { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'width:54px;height:54px;border-radius:50%;border:2px solid #ffe040;background:rgba(0,0,0,.5);color:#ffe040;font:900 20px Arial'; b.addEventListener('touchstart', (ev) => { ev.preventDefault(); dispatchEvent(new KeyboardEvent('keydown', { code: k })); }, { passive: false }); tb.appendChild(b); }
    document.body.appendChild(tb); L._skillTouch = tb;
  }

  // Posen der Spezialangriffe
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (!S.pose || !r || !r.arms || r.arms.length < 2 || P.vehicle) return;
    const u = Math.min(1, S.poseT / S.poseD), g = Math.sin(u * Math.PI), [R, Lf] = r.arms;
    switch (S.pose) {
      case 'punch': R.arm.rotation.set(-1.6 * g, 0, 0.1); R.elbow.rotation.x = -0.2; Lf.arm.rotation.set(-1, 0, 0.3); Lf.elbow.rotation.x = -1.6; if (r.torso) r.torso.rotation.y = -0.5 * g; break;
      case 'cast': R.arm.rotation.set(-1.55 * g, 0, -0.15); Lf.arm.rotation.set(-1.55 * g, 0, 0.15); R.elbow.rotation.x = Lf.elbow.rotation.x = -0.1; if (r.torso) r.torso.rotation.x = 0.15 * g; break;
      case 'clap': R.arm.rotation.set(-1.5 * g, 0, -0.9 * (1 - u)); Lf.arm.rotation.set(-1.5 * g, 0, 0.9 * (1 - u)); break;
      case 'throw': R.arm.rotation.set(u < 0.4 ? -2.8 * (u / 0.4) : -2.8 + (u - 0.4) * 3.8, 0, 0.1); Lf.arm.rotation.set(-0.8, 0, 0.4); if (r.torso) r.torso.rotation.y = u < 0.4 ? 0.5 : -0.4; break;
      case 'raise': R.arm.rotation.set(-3.0 * g, 0, 0.1); Lf.arm.rotation.set(-0.5, 0, 0.6 * g); if (r.torso) r.torso.rotation.x = -0.2 * g; break;
      case 'slam': { const up = u < 0.45; R.arm.rotation.x = Lf.arm.rotation.x = up ? -3 * (u / 0.45) : -3 + (u - 0.45) * 5; if (r.torso) r.torso.rotation.x = up ? -0.2 : 0.5 * g; if (r.body) r.body.position.y = up ? 0.4 * (u / 0.45) : 0; break; }
      case 'spin': if (r.body) r.body.rotation.y = u * 6.283 * 2; R.arm.rotation.set(-0.2, 0, -1.4); Lf.arm.rotation.set(-0.2, 0, 1.4); break;
      case 'charge': if (r.torso) r.torso.rotation.x = 0.6 * g; R.arm.rotation.set(0.8 * g, 0, -0.2); Lf.arm.rotation.set(0.8 * g, 0, 0.2); break;
      case 'roar': R.arm.rotation.set(-0.6, 0, -1.3 * g); Lf.arm.rotation.set(-0.6, 0, 1.3 * g); if (r.torso) r.torso.rotation.x = -0.35 * g; if (r.head) r.head.rotation.x = -0.4 * g; break;
    }
  };

  // ---------- jedes Bild ----------
  L.updateBattle = function (dt) {
    const real = dt / (L.timeScale || 1);
    if (slowT > 0) { slowT -= real; if (slowT <= 0) L.timeScale = 1; }
    S.cd.s1 = Math.max(0, S.cd.s1 - real); S.cd.s2 = Math.max(0, S.cd.s2 - real);
    if (S.pose) { S.poseT += real; if (S.poseT >= S.poseD) { S.pose = null; if (P.rig && P.rig.body) P.rig.body.rotation.y = 0; } }
    for (let i = fxs.length - 1; i >= 0; i--) { const f = fxs[i]; f.t += real; const k = Math.min(1, f.t / f.life); try { f.upd && f.upd(f.o, k, real); } catch (e) { /* egal */ } if (k >= 1) { L.scene.remove(f.o); fxs.splice(i, 1); } }
    // Schleuder-Spuren hinter getroffenen Gegnern
    for (const m of L.ents.monsters) { if (!(m.trailT > 0) || !m.rig) continue; m.trailT -= real; if (Math.random() < 0.7) L.fx && L.fx('#ffffff', m.rig.root.position.x, m.rig.root.position.y + 1, m.rig.root.position.z, 1, 1, { basic: true, size: 0.3, life: 0.3 }); }
    comboT -= real; if (comboT <= 0 && comboN) { comboN = 0; combo.style.opacity = '0'; }
    const show = free(); hud.style.display = show ? 'flex' : 'none'; if (L._skillTouch) L._skillTouch.style.display = show ? 'flex' : 'none';
    if (show) drawHud();
  };
  L.battleHit = (e, dmg, col) => hit(e, dmg, col || 0xffffff);
  L.battleKits = KITS; L.battleA = A; L.battleFx = { ring, flashBall, sparks, camPunch, impactFrame, slowmo, ghost, ghostMesh, near, inCone, nearestFront, targets, fwd, handPos, hit, addFx, label };
  L.impactFrame = impactFrame;
})();
