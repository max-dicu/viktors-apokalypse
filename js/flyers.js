'use strict';
// Deko am Himmel: Vogelschwärme, 100 fliegende Walrösser (alle Varianten, viele mit extrem langen Fingernägeln)
// und fliegende Zimtschnecken. Sie tun niemandem etwas – keine Treffer, kein Schaden, keine Kollision.
// Dazu Windspuren hinter nahen Walrössern, Rauschen beim Vorbeifliegen und ab und zu ein langes „Aaaah!“.
(function () {
  const L = window.L, T = THREE;
  const mat = (c, o) => (L.mat ? L.mat(c, o) : new T.MeshLambertMaterial({ color: c }));
  const S = () => L.GEO.sph, B = () => L.GEO.box, C = () => L.GEO.cone;
  function mesh(geo, col, sx, sy, sz, x, y, z, parent) { const m = new T.Mesh(geo, mat(col)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); parent.add(m); return m; }

  // ---------- viele Teile zu EINEM Mesh zusammenbacken (Farben als Vertex-Farben) → wenig Grafiklast ----------
  const VC = new T.MeshLambertMaterial({ vertexColors: true });
  function bake(root) {
    root.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(root.matrixWorld).invert(), pos = [], nor = [], col = [], m4 = new T.Matrix4();
    root.traverse((o) => {
      if (!o.isMesh || !o.visible || Array.isArray(o.material)) return;
      const c = (o.material.color || new T.Color(1, 1, 1)).clone(); if (o.material.emissive && o.material.emissiveIntensity) c.add(o.material.emissive.clone().multiplyScalar(0.3));
      const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); m4.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(m4);
      const p = g.attributes.position, n = g.attributes.normal;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); if (n) nor.push(n.getX(i), n.getY(i), n.getZ(i)); else nor.push(0, 1, 0); col.push(c.r, c.g, c.b); }
      g.dispose();
    });
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    geo.computeBoundingSphere();
    const m = new T.Mesh(geo, VC); m.frustumCulled = true; return m;
  }

  // ---------- Vogel ----------
  const BIRD_COLS = [['#2a2a2e', '#1a1a1e'], ['#f2f2f0', '#b8bcc4'], ['#6a4a30', '#4a3020'], ['#3a4a6a', '#2a3448']];
  function buildBird(cols) {
    const root = new T.Group(), [c1, c2] = cols;
    mesh(S(), c1, 0.16, 0.14, 0.4, 0, 0, 0, root);
    mesh(S(), c1, 0.12, 0.12, 0.12, 0, 0.05, 0.36, root);
    const beak = mesh(C(), '#e8a030', 0.04, 0.12, 0.04, 0, 0.04, 0.5, root); beak.rotation.x = Math.PI / 2;
    mesh(B(), c2, 0.18, 0.03, 0.2, 0, 0, -0.45, root);
    const wings = [-1, 1].map((sd) => { const p = new T.Group(); p.position.set(sd * 0.1, 0.05, 0.02); root.add(p); mesh(B(), c2, 0.62, 0.03, 0.28, sd * 0.31, 0, 0, p); mesh(B(), c1, 0.3, 0.025, 0.2, sd * 0.75, 0, -0.04, p); return { p, sd }; });
    root.scale.setScalar(1.7);
    return { root, wings };
  }

  // ---------- fliegendes Walross (Variante + optional extrem lange Fingernägel) ----------
  const NAIL_COLS = ['#f4e4d4', '#ff3a6a', '#d02040', '#ffd040', '#8a40ff', '#30d0a0'];
  function wingGroup(sd) {
    const p = new T.Group();
    mesh(B(), '#e8e6e0', 2.6, 0.12, 1.5, sd * 1.35, 0, 0, p);
    mesh(B(), '#c8c6c0', 1.8, 0.1, 1.1, sd * 2.9, -0.05, -0.15, p);
    for (let k = 0; k < 5; k++) mesh(B(), k % 2 ? '#f6f4ee' : '#d8d6d0', 0.35, 0.08, 1.3, sd * (0.8 + k * 0.75), -0.06, -0.85, p);
    return p;
  }
  function buildFlyWalrus(variant, nails) {
    const w = L.buildWalross();
    try { if (variant && L.decorateWalross) L.decorateWalross(w, variant); } catch (e) { /* ohne Deko */ }
    // extrem lange Fingernägel an beiden Vorderflossen
    if (nails && w.flips) {
      const len = 2.5 + Math.random() * 5.5, nc = NAIL_COLS[Math.floor(Math.random() * NAIL_COLS.length)];
      w.flips.forEach((f) => { for (let k = 0; k < 4; k++) { const n = new T.Mesh(L.GEO.cone, mat(nc)); n.scale.set(0.07, len, 0.07); n.position.set(0.05, -0.8 - len / 2, -0.3 + k * 0.2); n.rotation.set((k - 1.5) * 0.08, 0, 0.12); n.rotation.x += Math.PI; f.add(n); } });
    }
    const root = new T.Group(), body = bake(w.root); root.add(body);
    const wings = [-1, 1].map((sd) => { const g = wingGroup(sd), wm = bake(g), pv = new T.Group(); pv.position.set(sd * 1.1, 1.85, 0.3); pv.add(wm); root.add(pv); return { p: pv, sd }; });
    const s = 0.55 + Math.random() * 0.6; root.scale.setScalar(s);
    return { root, wings, s, nails };
  }

  // ---------- fliegende Zimtschnecke ----------
  function buildRoll() {
    const g = new T.Group(), pts = [];
    for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 6, r = 0.15 + a * 0.13; pts.push(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    const curve = new T.CatmullRomCurve3(pts);
    const dough = new T.Mesh(new T.TubeGeometry(curve, 160, 0.34, 8, false), new T.MeshLambertMaterial({ color: '#c8843e' })); dough.scale.y = 1.6; g.add(dough);
    const icing = new T.Mesh(new T.TubeGeometry(curve, 160, 0.09, 5, false), new T.MeshLambertMaterial({ color: '#fff6e6' })); icing.position.y = 0.48; g.add(icing);
    for (let k = 0; k < 12; k++) { const a = Math.random() * 6.283, r = Math.random() * 2.2; const d = new T.Mesh(L.GEO.sph, new T.MeshLambertMaterial({ color: '#7a4018' })); d.scale.setScalar(0.08); d.position.set(Math.cos(a) * r, 0.55, Math.sin(a) * r); g.add(d); }
    const m = bake(g); g.traverse((o) => { if (o.geometry && o.geometry !== L.GEO.sph) o.geometry.dispose(); });
    const root = new T.Group(); root.add(m); root.scale.setScalar(1.4 + Math.random() * 1.6); return { root };
  }

  // ---------- Windspuren ----------
  const TRAILS = 60, TSEG = 8;
  let trailGeo = null, trailLines = null;
  function makeTrails() {
    trailGeo = new T.BufferGeometry(); trailGeo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(TRAILS * TSEG * 2 * 3), 3));
    trailLines = new T.LineSegments(trailGeo, new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38, depthWrite: false })); trailLines.frustumCulled = false; L.scene.add(trailLines);
  }

  // ---------- Bewegung ----------
  const flocks = [], walrusses = [], rolls = [];
  let built = false, chirpT = 4, ahhT = 6, whooshT = 0;
  const P = () => L.player;
  const visibleWorld = () => { const p = P(); if (!p || !L.worldOf) return false; const w = L.worldOf(p.x, p.z); return !/^(back|shadow|moon|dim|jupiter|titan)$/.test(w); };
  function newCenter(f, far, spread) { const p = P(), a = Math.random() * 6.283, d = far ? (spread || 300) * (0.8 + Math.random() * 0.5) : Math.random() * (spread || 260); f.cx = p.x + Math.sin(a) * d; f.cz = p.z + Math.cos(a) * d; }
  function build() {
    built = true;
    for (let i = 0; i < 14; i++) {
      const cols = BIRD_COLS[i % BIRD_COLS.length], n = 6 + Math.floor(Math.random() * 5), f = { members: [], r: 25 + Math.random() * 35, ang: Math.random() * 6.283, spd: (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.12), h: 22 + Math.random() * 55 };
      newCenter(f);
      for (let k = 0; k < n; k++) { const b = buildBird(cols); L.scene.add(b.root); f.members.push({ b, ox: (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 2.2, oz: -Math.ceil(k / 2) * 2.4, oy: (Math.random() - 0.5) * 1.5, ph: Math.random() * 6.283, fs: 9 + Math.random() * 4 }); }
      flocks.push(f);
    }
    const VARS = (L.WALROSS_VARS || ['']).slice();
    for (let i = 0; i < 100; i++) {
      const v = VARS[i % VARS.length], nails = v === 'naegel' || Math.random() < 0.55;
      const w = buildFlyWalrus(v, nails); L.scene.add(w.root);
      const f = { w, r: 25 + Math.random() * 90, ang: Math.random() * 6.283, spd: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.09), h: 30 + Math.random() * 130, ph: Math.random() * 6.283, hist: [[], []] };
      newCenter(f, false, 520); walrusses.push(f);
    }
    for (let i = 0; i < 30; i++) {
      const z = buildRoll(); L.scene.add(z.root);
      const f = { z, r: 15 + Math.random() * 60, ang: Math.random() * 6.283, spd: (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.1), h: 18 + Math.random() * 90, ph: Math.random() * 6.283, spin: (Math.random() - 0.5) * 2 };
      newCenter(f, false, 400); rolls.push(f);
    }
    makeTrails();
  }
  function place(root, f, bob, dx, dy, dz) {
    const x = f.cx + Math.cos(f.ang) * f.r, z = f.cz + Math.sin(f.ang) * f.r, yaw = Math.atan2(-Math.sin(f.ang) * Math.sign(f.spd), Math.cos(f.ang) * Math.sign(f.spd));
    const s = Math.sin(yaw), c = Math.cos(yaw);
    root.position.set(x + dx * c + dz * s, f.h + bob + dy, z - dx * s + dz * c); root.rotation.set(0, yaw, -Math.sign(f.spd) * 0.18);
  }
  const tmp = new T.Vector3();
  // alle Flieger kurz zu einem Punkt holen (für den Trailer)
  L.flyersHere = function (x, z) { if (!built) { try { build(); } catch (e) { return; } } for (const f of [...flocks, ...walrusses, ...rolls]) { f.cx = x + (Math.random() - 0.5) * 120; f.cz = z + 60 + Math.random() * 80; } };
  L.updateFlyers = function (dt) {
    if (L.state !== 'game' || !L.scene || !L.GEO) return;
    if (!built) { try { build(); } catch (e) { console.error(e); return; } }
    const show = visibleWorld(), t = performance.now() / 1000, p = P(), cam = L.camera ? L.camera.position : p;
    for (const f of flocks) {
      f.ang += f.spd * dt;
      if (show && Math.hypot(f.cx - p.x, f.cz - p.z) > 420) newCenter(f, true);
      for (const m of f.members) {
        m.b.root.visible = show; if (!show) continue;
        place(m.b.root, f, Math.sin(t * 0.7 + m.ph) * 1.2, m.ox, m.oy, m.oz);
        const flap = Math.sin(t * m.fs + m.ph), glide = Math.sin(t * 0.4 + m.ph) > 0.6;
        m.b.wings.forEach((w) => { w.p.rotation.z = w.sd * (glide ? 0.08 : flap * 0.75); });
      }
    }
    // Walrösser + Windspuren
    const arr = trailGeo.attributes.position.array; let ti = 0, nearest = 1e9;
    for (const f of walrusses) {
      f.ang += f.spd * dt; const r = f.w.root;
      const dist = Math.hypot(f.cx - p.x, f.cz - p.z);
      r.visible = show && dist < 760; if (!show) continue;
      if (dist > 640) newCenter(f, true, 420);
      place(r, f, Math.sin(t * 0.6 + f.ph) * 2.5, 0, 0, 0);
      const flap = Math.sin(t * 2.6 + f.ph);
      f.w.wings.forEach((w) => { w.p.rotation.z = w.sd * flap * 0.6; });
      const d3 = r.position.distanceTo(cam); nearest = Math.min(nearest, d3);
      // Windspuren an den Flügelspitzen (nur bei nahen Walrössern)
      if (d3 < 140 && ti < TRAILS) {
        for (let k = 0; k < 2 && ti < TRAILS; k++) {
          const w = f.w.wings[k]; tmp.set(w.sd * 4.6, 0, -0.6); w.p.localToWorld(tmp);
          const h = f.hist[k]; h.unshift(tmp.clone()); if (h.length > TSEG + 1) h.pop();
          for (let s = 0; s < TSEG; s++) { const a = h[Math.min(s, h.length - 1)], b = h[Math.min(s + 1, h.length - 1)], o = (ti * TSEG + s) * 6; arr[o] = a.x; arr[o + 1] = a.y; arr[o + 2] = a.z; arr[o + 3] = b.x; arr[o + 4] = b.y; arr[o + 5] = b.z; }
          ti++;
        }
      } else { f.hist[0].length = 0; f.hist[1].length = 0; }
    }
    for (let i = ti * TSEG * 6; i < arr.length; i++) arr[i] = 0;
    trailGeo.attributes.position.needsUpdate = true; trailLines.visible = show;
    // Zimtschnecken
    for (const f of rolls) {
      f.ang += f.spd * dt; const r = f.z.root; const dist = Math.hypot(f.cx - p.x, f.cz - p.z);
      r.visible = show && dist < 640; if (!show) continue;
      if (dist > 520) newCenter(f, true, 320);
      place(r, f, Math.sin(t * 0.9 + f.ph) * 1.5, 0, 0, 0); r.rotation.y += t * f.spin; r.rotation.x = Math.sin(t * 0.5 + f.ph) * 0.4;
    }
    if (!show) return;
    // Geräusche: Rauschen, wenn eins nah vorbeifliegt, und manchmal ein langes „Aaaah!“
    whooshT -= dt; if (nearest < 30 && whooshT <= 0) { whooshT = 2.5; try { L.nz && L.nz({ dur: 1.2, f: 300, fTo: 1400, type: 'bandpass', q: 0.8, vol: 0.18 }); } catch (e) { /* egal */ } }
    ahhT -= dt;
    if (nearest < 60 && ahhT <= 0) {
      ahhT = 10 + Math.random() * 14;
      try { if (window.speechSynthesis && !speechSynthesis.speaking) { const u = new SpeechSynthesisUtterance(Math.random() < 0.5 ? 'Aaaaaaaah!' : 'Aaaaaahhh!'); u.lang = 'de-DE'; u.pitch = 0.3 + Math.random() * 0.4; u.rate = 0.7; u.volume = 0.7 * (L.S && L.S().sfx !== undefined ? L.S().sfx : 1); speechSynthesis.speak(u); } } catch (e) { /* ohne Stimme */ }
    }
    chirpT -= dt; if (chirpT <= 0) { chirpT = 6 + Math.random() * 10; try { L.snd && L.snd.bird && L.snd.bird(); } catch (e) { /* egal */ } }
  };
})();
