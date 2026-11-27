'use strict';
// Deko am Himmel: Vogelschwärme und fliegende Walrösser mit Flügeln. Sie tun niemandem etwas –
// keine Treffer, kein Schaden, keine Kollision. Sie kreisen einfach über der Welt rund um den Spieler.
(function () {
  const L = window.L, T = THREE;
  const mat = (c, o) => (L.mat ? L.mat(c, o) : new T.MeshLambertMaterial({ color: c }));
  const S = () => L.GEO.sph, B = () => L.GEO.box, C = () => L.GEO.cone;
  function mesh(geo, col, sx, sy, sz, x, y, z, parent) { const m = new T.Mesh(geo, mat(col)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); parent.add(m); return m; }

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
  // ---------- fliegendes Walross ----------
  function buildFlyWalrus() {
    const w = L.buildWalross(), body = w.body;
    const wings = [-1, 1].map((sd) => {
      const p = new T.Group(); p.position.set(sd * 1.1, 0.75, 0.3); body.add(p);
      mesh(B(), '#e8e6e0', 2.6, 0.12, 1.5, sd * 1.35, 0, 0, p);
      mesh(B(), '#c8c6c0', 1.8, 0.1, 1.1, sd * 2.9, -0.05, -0.15, p);
      for (let k = 0; k < 5; k++) mesh(B(), k % 2 ? '#f6f4ee' : '#d8d6d0', 0.35, 0.08, 1.3, sd * (0.8 + k * 0.75), -0.06, -0.85, p);
      return { p, sd };
    });
    w.root.scale.setScalar(0.75);
    w.root.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    return { root: w.root, wings, rig: w };
  }

  // ---------- Schwärme ----------
  const flocks = [], walrusses = [];
  let built = false, chirpT = 4;
  const P = () => L.player;
  const visibleWorld = () => { const p = P(); if (!p || !L.worldOf) return false; const w = L.worldOf(p.x, p.z); return !/^(back|shadow|moon|dim|jupiter|titan)$/.test(w); };
  function newCenter(f, far) { const p = P(), a = Math.random() * 6.283, d = far ? 260 + Math.random() * 120 : 40 + Math.random() * 220; f.cx = p.x + Math.sin(a) * d; f.cz = p.z + Math.cos(a) * d; }
  function build() {
    built = true;
    for (let i = 0; i < 14; i++) {
      const cols = BIRD_COLS[i % BIRD_COLS.length], n = 6 + Math.floor(Math.random() * 5), f = { members: [], r: 25 + Math.random() * 35, ang: Math.random() * 6.283, spd: (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.12), h: 22 + Math.random() * 55 };
      newCenter(f);
      for (let k = 0; k < n; k++) { const b = buildBird(cols); L.scene.add(b.root); f.members.push({ b, ox: (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 2.2, oz: -Math.ceil(k / 2) * 2.4, oy: (Math.random() - 0.5) * 1.5, ph: Math.random() * 6.283, fs: 9 + Math.random() * 4 }); }
      flocks.push(f);
    }
    for (let i = 0; i < 18; i++) {
      const w = buildFlyWalrus(); L.scene.add(w.root);
      const f = { w, r: 45 + Math.random() * 60, ang: Math.random() * 6.283, spd: (Math.random() < 0.5 ? -1 : 1) * (0.07 + Math.random() * 0.05), h: 35 + Math.random() * 70, ph: Math.random() * 6.283 };
      newCenter(f); walrusses.push(f);
    }
  }
  function place(root, f, t, bob, dx, dy, dz) {
    const x = f.cx + Math.cos(f.ang) * f.r, z = f.cz + Math.sin(f.ang) * f.r, yaw = Math.atan2(-Math.sin(f.ang) * Math.sign(f.spd), Math.cos(f.ang) * Math.sign(f.spd));
    const s = Math.sin(yaw), c = Math.cos(yaw);
    root.position.set(x + dx * c + dz * s, f.h + bob + dy, z - dx * s + dz * c); root.rotation.set(0, yaw, -Math.sign(f.spd) * 0.18);
  }
  L.updateFlyers = function (dt) {
    if (L.state !== 'game' || !L.scene || !L.GEO) return;
    if (!built) { try { build(); } catch (e) { console.error(e); return; } }
    const show = visibleWorld(), t = performance.now() / 1000, p = P();
    for (const f of flocks) {
      f.ang += f.spd * dt;
      if (show && Math.hypot(f.cx - p.x, f.cz - p.z) > 420) newCenter(f, true); // weit weg → wieder in die Nähe fliegen
      for (const m of f.members) {
        m.b.root.visible = show; if (!show) continue;
        place(m.b.root, f, t, Math.sin(t * 0.7 + m.ph) * 1.2, m.ox, m.oy, m.oz);
        const flap = Math.sin(t * m.fs + m.ph), glide = Math.sin(t * 0.4 + m.ph) > 0.6;
        m.b.wings.forEach((w) => { w.p.rotation.z = w.sd * (glide ? 0.08 : flap * 0.75); });
      }
    }
    for (const f of walrusses) {
      f.ang += f.spd * dt; const r = f.w.root; r.visible = show; if (!show) continue;
      if (Math.hypot(f.cx - p.x, f.cz - p.z) > 480) newCenter(f, true);
      place(r, f, t, Math.sin(t * 0.6 + f.ph) * 2.5, 0, 0, 0);
      const flap = Math.sin(t * 2.6 + f.ph);
      f.w.wings.forEach((w) => { w.p.rotation.z = w.sd * flap * 0.6; });
      const rg = f.w.rig; if (rg.flips) rg.flips.forEach((fl, i) => { fl.rotation.x = Math.sin(t * 2.6 + f.ph + i) * 0.3; });
      if (rg.tail) rg.tail.rotation.y = Math.sin(t * 1.3 + f.ph) * 0.25;
      if (rg.head) rg.head.rotation.x = Math.sin(t * 0.8 + f.ph) * 0.1;
    }
    // ab und zu Vogelgezwitscher
    chirpT -= dt; if (show && chirpT <= 0) { chirpT = 6 + Math.random() * 10; try { L.snd && L.snd.bird && L.snd.bird(); } catch (e) { /* egal */ } }
  };
})();
