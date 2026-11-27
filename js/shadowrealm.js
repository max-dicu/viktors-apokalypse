'use strict';
// SCHATTENREICH – eine neue Dark-Fantasy-Dimension.
// Erreichbar durch ein dunkles Portal tief in einem Berg in der Heimat. Zwei Wege führen hinein:
// 1) ein Bergeingang, 2) eine Höhle mit unterirdischem Tunnel. Im Schattenreich leben Kristall-Bestien.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const RX = -70000, RZ = 0, RR = 950;          // Schattenreich (eigene Welt, weit weg)
  L.inShadow = (x) => x < -40000;
  const REALM = { id: 'shadow', x: RX, z: RZ, r: RR, dim: true };
  const SH = { built: false, M: null, R: null, inCave: false, parts: null, beastT: 0 };
  // ---------- Hilfen ----------
  const HN = (x, y, z) => { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return v - Math.floor(v); };
  const rnd = (() => { let s = 1337; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  function rockTex(dark) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = dark ? '#1a1620' : '#3a3632'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { const v = (dark ? 20 : 45) + Math.random() * (dark ? 40 : 55); g.fillStyle = 'rgba(' + v + ',' + (v - 3) + ',' + (v + (dark ? 12 : -2)) + ',' + (0.25 + Math.random() * 0.5).toFixed(2) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 5, 1 + Math.random() * 4); }
    g.strokeStyle = dark ? 'rgba(140,60,220,0.18)' : 'rgba(0,0,0,0.35)'; for (let i = 0; i < 40; i++) { g.lineWidth = 1 + Math.random() * 2; g.beginPath(); let x = Math.random() * 256, y = Math.random() * 256; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 50; y += (Math.random() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  }
  const rockM = () => new T.MeshStandardMaterial({ color: 0x8a8580, map: rockTex(false), roughness: 0.95, metalness: 0.02, side: T.DoubleSide, flatShading: true });
  const darkRockM = () => new T.MeshStandardMaterial({ color: 0x6a6070, map: rockTex(true), roughness: 0.85, metalness: 0.1, side: T.DoubleSide, flatShading: true });
  // Felsen-Klumpen mit unregelmäßiger Oberfläche
  function lump(r, mat, sy) { const g = new T.IcosahedronGeometry(r, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const f = 0.82 + Math.random() * 0.32; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f * (sy || 1), p.getZ(i) * f); } g.computeVertexNormals(); const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m; }
  // halbe Kuppel (Berg) mit Öffnung; Vertices verrauscht → natürlicher Fels
  function dome(r, h, phiStart, phiLen, mat) {
    const g = new T.SphereGeometry(r, 40, 18, phiStart, phiLen, 0, Math.PI / 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + (Math.sin(x * 0.21) * Math.cos(z * 0.17) + Math.sin(y * 0.33 + x * 0.05)) * 0.06 + (HN(Math.round(x * 10), Math.round(y * 10), Math.round(z * 10)) - 0.5) * 0.05; p.setXYZ(i, x * n, y * n * (h / r), z * n); }
    g.computeVertexNormals(); const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
  // ---------- Platz für den Berg finden (Land, keine Straße, keine Häuser) ----------
  function freeArea(x, z, r) {
    for (let i = -r; i <= r; i += 12) for (let j = -r; j <= r; j += 12) { if (i * i + j * j > r * r) continue; const px = x + i, pz = z + j; if (L.seaFloor(px, pz) !== 0) return false; if (L.onRoad && L.onRoad(px, pz)) return false; if (L.queryBoxes(px, pz, 4).length) return false; const lk = L.lake; if (lk && px > lk.x1 - 10 && px < lk.x2 + 10 && pz > lk.z1 - 10 && pz < lk.z2 + 10) return false; }
    return true;
  }
  function findSpot() {
    for (let k = 0; k < 900; k++) {
      const a = k * 0.61, d = 620 + (k % 12) * 55, x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (Math.abs(x) > 1300 || Math.abs(z) > 1300) continue;
      const yaw = Math.atan2(-x, -z); // Bergeingang schaut zur Stadt
      const bx = x - Math.sin(yaw) * 150, bz = z - Math.cos(yaw) * 150; // Höhleneingang hinten
      if (!freeArea(x, z, 64)) continue;
      let ok = true; for (let s = 70; s <= 160 && ok; s += 18) ok = freeArea(x - Math.sin(yaw) * s, z - Math.cos(yaw) * s, 16);
      if (!ok || !freeArea(x + Math.sin(yaw) * 80, z + Math.cos(yaw) * 80, 12)) continue;
      return { x, z, yaw, bx, bz };
    }
    return { x: -1000, z: 1150, yaw: Math.PI, bx: -1000, bz: 1300 };
  }
  // ---------- Portal (dunkler, verzierter Ring + Strudel + Block-Partikel) ----------
  function vortexTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.translate(128, 128);
    const gr = g.createRadialGradient(0, 0, 5, 0, 0, 128); gr.addColorStop(0, '#000000'); gr.addColorStop(0.4, '#140624'); gr.addColorStop(0.75, '#3a0f5a'); gr.addColorStop(1, '#7a2ac0'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 128, 0, 6.283); g.fill();
    for (let k = 0; k < 7; k++) { g.strokeStyle = k % 2 ? 'rgba(170,90,255,0.55)' : 'rgba(60,200,255,0.35)'; g.lineWidth = 3; g.beginPath(); for (let t = 0; t < 1; t += 0.01) { const a = t * 9 + k * 0.9, r = t * 124; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); }
    return new T.CanvasTexture(c);
  }
  function buildPortal(scale) {
    // Steinernes Torportal (wie Bild 2), aber dunkel & mystisch: Säulen, Querbalken mit Emblem, tote Ranken,
    // leuchtende Fläche, runde Stufen-Plattform – und überall rieseln Blöcke heraus.
    const g = new T.Group(); g.scale.setScalar(scale || 1);
    const stone = new T.MeshStandardMaterial({ color: 0x6a6472, map: rockTex(true), roughness: 0.9, metalness: 0.05, flatShading: true });
    const stone2 = new T.MeshStandardMaterial({ color: 0x8a8494, map: rockTex(false), roughness: 0.9, flatShading: true });
    const base = new T.MeshStandardMaterial({ color: 0x2a2630, roughness: 0.95, flatShading: true });
    const metal = new T.MeshStandardMaterial({ color: 0x1c2230, metalness: 0.85, roughness: 0.3, emissive: 0x0a0418 });
    const gold = new T.MeshStandardMaterial({ color: 0x8a6a28, metalness: 0.9, roughness: 0.3, emissive: 0x1a0c00 });
    const vine = new T.MeshStandardMaterial({ color: 0x2a3a1c, roughness: 0.9 }), leafM = new T.MeshStandardMaterial({ color: 0x3a2a4a, roughness: 0.8, side: T.DoubleSide });
    const glowM = new T.MeshBasicMaterial({ color: 0xb070ff });
    const B = (w, h, d, x, y, z, m, ry) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (ry) o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
    // runde Plattform mit 3 Stufen
    for (let k = 0; k < 3; k++) { const c = new T.Mesh(new T.CylinderGeometry(15.5 - k * 2.2, 16 - k * 2.2, 0.9, 40), k % 2 ? stone : base); c.position.y = 0.45 + k * 0.9; c.receiveShadow = true; g.add(c); for (let s = 0; s < 18; s++) { const a = s / 18 * 6.283; B(0.08, 0.92, 0.6, Math.sin(a) * (15.6 - k * 2.2), 0.45 + k * 0.9, Math.cos(a) * (15.6 - k * 2.2), base, a); } }
    const Y0 = 2.7, GAP = 5, PH = 20;
    // Säulen: dunkler Sockelblock, Schaft mit Ringen, Kapitell
    for (const sx of [-1, 1]) {
      const x = sx * (GAP + 1.6);
      B(4.6, 2.6, 4.6, x, Y0 + 1.3, 0, base); B(4.0, 1.4, 4.0, x, Y0 + 3.2, 0, stone);
      const sh = new T.Mesh(new T.CylinderGeometry(1.45, 1.6, PH - 5, 10), stone2); sh.position.set(x, Y0 + 3.9 + (PH - 5) / 2, 0); sh.castShadow = true; g.add(sh);
      for (const yy of [Y0 + 7, Y0 + 11]) { const ring = new T.Mesh(new T.TorusGeometry(1.6, 0.22, 6, 14), metal); ring.rotation.x = Math.PI / 2; ring.position.set(x, yy, 0); g.add(ring); }
      B(3.8, 1.2, 3.8, x, Y0 + PH - 0.6, 0, stone);
    }
    // Querbalken (zwei Blöcke) + Emblem mit Kristall
    B(GAP * 2 + 8, 2.6, 4.2, 0, Y0 + PH + 1.3, 0, stone2); B(GAP * 2 + 6, 0.6, 3.6, 0, Y0 + PH + 2.9, 0, stone);
    const em = new T.Group(); em.position.set(0, Y0 + PH + 1.6, 2.3); g.add(em);
    const dia = new T.Mesh(new T.OctahedronGeometry(2.4), metal); dia.scale.set(1, 1.25, 0.35); em.add(dia);
    const ring = new T.Mesh(new T.TorusGeometry(1.25, 0.28, 8, 24), gold); ring.position.z = 0.6; em.add(ring);
    const core = new T.Mesh(new T.SphereGeometry(0.75, 16, 12), glowM); core.position.z = 0.6; em.add(core);
    const spike = new T.Mesh(new T.ConeGeometry(0.6, 2.4, 6), metal); spike.position.set(0, 3.6, 0); em.add(spike);
    // heruntergefallene Steinblöcke
    for (const [x, z, r] of [[-5.5, 3.5, 0.3], [-3.2, 4.4, -0.4], [6.8, 4, 0.6]]) B(2 + Math.random(), 1.2, 1.6, x, Y0 + 0.6, z, stone2, r);
    // tote Ranken über Balken und Säulen
    const vineCurve = (pts) => { const t = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], p[1], p[2]))), 40, 0.16, 5, false), vine); g.add(t); for (let k = 0; k < 10; k++) { const p = pts[Math.floor(Math.random() * pts.length)]; const lf = new T.Mesh(new T.PlaneGeometry(0.7, 0.45), leafM); lf.position.set(p[0] + (Math.random() - 0.5), p[1] + (Math.random() - 0.5), p[2] + 0.2); lf.rotation.set(Math.random(), Math.random() * 3, Math.random()); g.add(lf); } };
    vineCurve([[-11, Y0 + PH + 2.6, 2.2], [-8, Y0 + PH + 3.1, 2.3], [-5, Y0 + PH + 1, 2.3], [-3, Y0 + PH + 2.8, 2.2]]);
    vineCurve([[4, Y0 + PH + 2.6, 2.2], [7, Y0 + PH + 0.6, 2.3], [9.5, Y0 + PH + 2.4, 2.2], [10.5, Y0 + PH - 2, 1.8], [9.6, Y0 + 9, 1.7], [10.2, Y0 + 5, 1.6]]);
    vineCurve([[-9.5, Y0 + PH, 1.7], [-8.6, Y0 + 11, 1.7], [-9.7, Y0 + 7, 1.6]]);
    // leuchtende Portalfläche (zwei Schichten)
    const c = document.createElement('canvas'); c.width = 128; c.height = 256; const cx = c.getContext('2d');
    const gr = cx.createRadialGradient(64, 128, 8, 64, 128, 150); gr.addColorStop(0, '#f0e0ff'); gr.addColorStop(0.25, '#b070ff'); gr.addColorStop(0.6, '#4a1a8a'); gr.addColorStop(1, '#0a0418'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 256);
    for (let k = 0; k < 40; k++) { cx.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '200,150,255' : '90,220,255') + ',' + (0.15 + Math.random() * 0.3).toFixed(2) + ')'; cx.lineWidth = 1 + Math.random() * 2; cx.beginPath(); let x = Math.random() * 128, y = 256; cx.moveTo(x, y); while (y > 0) { y -= 12; x += (Math.random() - 0.5) * 14; cx.lineTo(x, y); } cx.stroke(); }
    const vt = new T.CanvasTexture(c); vt.wrapS = vt.wrapT = T.RepeatWrapping;
    const PW = GAP * 2 - 0.3, PHh = PH - 3.2, PY = Y0 + 3.2 + PHh / 2 - 0.3;
    const v1 = new T.Mesh(new T.PlaneGeometry(PW, PHh), new T.MeshBasicMaterial({ map: vt, side: T.DoubleSide })); v1.position.set(0, PY, 0); g.add(v1);
    const vt2 = vt.clone(); vt2.needsUpdate = true; vt2.wrapS = vt2.wrapT = T.RepeatWrapping;
    const v2 = new T.Mesh(new T.PlaneGeometry(PW, PHh), new T.MeshBasicMaterial({ map: vt2, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); v2.position.set(0, PY, 0.08); g.add(v2);
    const light = new T.PointLight(0xa060ff, 3, 70, 2); light.position.set(0, PY, 4); g.add(light);
    // Block-Partikel aus der ganzen Portalfläche
    const N = 420, cubes = new T.InstancedMesh(new T.BoxGeometry(0.32, 0.32, 0.32), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), N); cubes.instanceColor = new T.InstancedBufferAttribute(new Float32Array(N * 3), 3); cubes.frustumCulled = false; g.add(cubes);
    const ps = []; const COLS = [0x9a40ff, 0x5a1aa0, 0x2a0a40, 0x40c8ff, 0x000000, 0xd090ff];
    const spawnP = (p) => { p.x = (Math.random() - 0.5) * PW; p.y = PY + (Math.random() - 0.5) * PHh; p.z = 0; const side = Math.random() < 0.5 ? -1 : 1; p.vx = (Math.random() - 0.5) * 1.6; p.vy = (Math.random() - 0.3) * 1.4; p.vz = side * (1 + Math.random() * 2.6); p.life = 0; p.max = 1.6 + Math.random() * 2.2; p.rx = Math.random() * 6; p.ry = Math.random() * 6; p.s = 0.5 + Math.random() * 1.2; };
    const tq = new T.Quaternion(), te = new T.Euler(), tm = new T.Matrix4(), tp = new T.Vector3(), ts = new T.Vector3(), tc = new T.Color();
    for (let i = 0; i < N; i++) { const p = {}; spawnP(p); p.life = Math.random() * p.max; ps.push(p); tc.setHex(COLS[i % COLS.length]); cubes.setColorAt(i, tc); }
    g.userData.update = (dt, t) => {
      vt.offset.y -= dt * 0.15; vt2.offset.y += dt * 0.27; vt2.offset.x = Math.sin(t * 0.7) * 0.1; core.scale.setScalar(1 + Math.sin(t * 3) * 0.12); light.intensity = 2.6 + Math.sin(t * 3) * 0.6; em.rotation.z = Math.sin(t * 0.8) * 0.04;
      for (let i = 0; i < N; i++) { const p = ps[i]; p.life += dt; if (p.life > p.max) spawnP(p); p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rx += dt * 2; p.ry += dt * 1.5; const k = 1 - p.life / p.max, s = p.s * Math.min(1, p.life * 4) * k; te.set(p.rx, p.ry, 0); tq.setFromEuler(te); tp.set(p.x, p.y, p.z); ts.set(s, s, s); tm.compose(tp, tq, ts); cubes.setMatrixAt(i, tm); }
      cubes.instanceMatrix.needsUpdate = true;
    };
    g.traverse((o) => { o.frustumCulled = false; });
    return g;
  }
  const PLATS = [];
  function solidPortal(p, sc) {
    p.updateMatrixWorld(true); const c = new T.Vector3(0, 0, 0).applyMatrix4(p.matrixWorld); PLATS.push({ x: c.x, z: c.z, s: sc });
    for (const sx of [-1, 1]) { const q = new T.Vector3(sx * 6.6, 0, 0).applyMatrix4(p.matrixWorld); const hw = 2.3 * sc; L.addBox(q.x - hw, q.z - hw, q.x + hw, q.z + hw, 30 * sc, 'pillar'); }
  }
  const ofa = L.floorAt;
  L.floorAt = function (x, z, y) {
    for (const q of PLATS) { const d = Math.hypot(x - q.x, z - q.z) / q.s; if (d > 16) continue; const h = (d < 11.8 ? 2.7 : d < 13.9 ? 1.8 : 0.9) * q.s; if ((y || 0) >= h - 1.2) return h; }
    return ofa ? ofa(x, z, y) : null;
  };
  // ---------- Berg mit Portalkammer, Bergeingang und Höhlentunnel ----------
  const NOGRASS = [];
  L.noGrass = (x, z) => { for (const f of NOGRASS) if (f(x, z)) return true; return false; };
  function buildMountain() {
    const S = findSpot(); SH.M = S;
    const g = new T.Group(); g.position.set(S.x, 0, S.z); g.rotation.y = S.yaw; L.scene.add(g);
    const fw = { x: Math.sin(S.yaw), z: Math.cos(S.yaw) }, rt = { x: Math.cos(S.yaw), z: -Math.sin(S.yaw) };
    const W = (lx, lz) => ({ x: S.x + rt.x * lx + fw.x * lz, z: S.z + rt.z * lx + fw.z * lz }); // lokal → Welt (z = nach vorne/Stadt)
    const RM = rockM();
    const R = 48, OF = 0.18, OB = 0.115, OPEN = OF; // Kammer-Radius, halbe Öffnungsbreite vorne/hinten (rad)
    // Kuppel in zwei Teilen: vorne (Bergeingang) und hinten (Tunnel) offen. Lokal: +z = vorne (phi = π/2 zeigt nach +z)
    const front = Math.PI / 2, back = -Math.PI / 2;
    const segA = dome(R, 44, front + OF, (back + 2 * Math.PI - OB) - (front + OF), RM); g.add(segA);
    const segB = dome(R, 44, back + OB, (front - OF) - (back + OB), RM); g.add(segB);
    // äußere Bergflanken + Gipfel
    for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283; const ca = Math.cos(a), sa = Math.sin(a); const d = R + 12 + rnd() * 18; if (sa > 0.9 || sa < -0.9) continue; const m = lump(Math.min(16 + rnd() * 14, d - R - 3), RM, 1.2 + rnd() * 0.8); m.position.set(ca * d, 6 + rnd() * 10, sa * d); m.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(m); }
    for (let k = 0; k < 6; k++) { const ch = 45 + rnd() * 45; const c = new T.Mesh(new T.ConeGeometry(10 + rnd() * 10, ch, 7), RM); c.position.set((rnd() - 0.5) * 50, 41 + ch / 2 - 4, (rnd() - 0.5) * 50); c.rotation.set((rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.4); c.castShadow = true; g.add(c); }
    // Bergeingang: kurzer Felsgang nach vorne (Bogen aus Halbzylindern)
    const arch = (z0, z1, rad, mat, parent) => { const len = z1 - z0; const geo = new T.CylinderGeometry(rad, rad, len, 22, Math.max(4, Math.round(len / 3)), true, -Math.PI / 2, Math.PI); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), ang = Math.atan2(x, zz), edge = Math.min(1, Math.abs(Math.abs(ang) - Math.PI / 2) * 3); const f = 1 + (Math.sin(ang * 5 + (y + z0) * 0.35) * 0.05 + (HN(Math.round(ang * 20), Math.round((y + z0) * 3), 1) - 0.5) * 0.05) * edge; p.setXYZ(i, x * f, y, zz * f); } geo.computeVertexNormals(); const m = new T.Mesh(geo, mat); m.rotation.x = Math.PI / 2; m.position.set(0, 0, (z0 + z1) / 2); m.rotation.order = 'XYZ'; (parent || g).add(m); return m; };
    // Halbzylinder: Achse nach z, Bogen oben (y ≥ 0)
    const archZ = (z0, z1, rad, mat, ox) => { const m = arch(z0, z1, rad, mat); m.rotation.set(-Math.PI / 2, 0, 0); m.position.x = ox || 0; return m; };
    archZ(R - 6, R + 16, 9, RM);
    for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3; const m = lump(5 + rnd() * 3, RM, 1.3); m.position.set(Math.sin(a) * 11, 3 + Math.cos(a) * 9, R + 14 + rnd() * 2); g.add(m); }
    // Tunnel nach hinten (unter einem Erdwall), Höhleneingang am Ende
    const TL = 150, TR = 6;
    archZ(-TL, -R + 6, TR, RM);
    const earth = new T.MeshStandardMaterial({ color: 0x4e5e34, map: rockTex(false), roughness: 1, flatShading: true, side: T.DoubleSide });
    { const mw = archZ(-TL + 4, -R + 2, 12, earth); const p = mw.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const f = 1 + (Math.sin(p.getY(i) * 0.25) * Math.cos(p.getX(i) * 0.4)) * 0.14 + (Math.random() - 0.5) * 0.18; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f); } mw.geometry.computeVertexNormals(); for (let z = -R - 12; z > -TL + 8; z -= 9) { const m = lump(2 + rnd() * 3, RM, 0.8); m.position.set((rnd() - 0.5) * 16, 9 + rnd() * 3, z); g.add(m); const b = lump(1.6 + rnd() * 1.4, new T.MeshStandardMaterial({ color: 0x2e4a22, roughness: 1, flatShading: true }), 0.8); b.position.set((rnd() - 0.5) * 14, 11, z + 4); g.add(b); } } for (let z = -R - 8; z > -TL + 10; z -= 14) { const m = lump(4 + rnd() * 2, earth, 0.7); m.position.set((rnd() - 0.5) * 5, 11.5, z); g.add(m); }
    // Höhleneingang: Felsbrocken um das dunkle Loch
    for (let k = 0; k < 9; k++) { const a = -1.4 + k * 0.35; const m = lump(5 + rnd() * 4, RM, 1.2); m.position.set(Math.sin(a) * 9, Math.max(1.5, 3 + Math.cos(a) * 7), -TL - 1 + rnd() * 2); g.add(m); }
    for (let k = 0; k < 5; k++) { const m = lump(4 + rnd() * 5, RM, 0.9); m.position.set((rnd() - 0.5) * 30, 1, -TL - 8 - rnd() * 12); g.add(m); }
    // Boden in Kammer und Tunnel (dunkler Stein), Stalaktiten, leuchtende Kristalle, Fackeln
    const floorM = new T.MeshStandardMaterial({ color: 0x3a3530, map: rockTex(false), roughness: 1 });
    const fl = new T.Mesh(new T.CircleGeometry(R - 1, 40), floorM); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.03; g.add(fl);
    const tf = new T.Mesh(new T.PlaneGeometry(TR * 2 - 1, TL - R + 8), floorM); tf.rotation.x = -Math.PI / 2; tf.position.set(0, 0.03, -(R + TL) / 2); g.add(tf);
    const ef = new T.Mesh(new T.PlaneGeometry(17, 24), floorM); ef.rotation.x = -Math.PI / 2; ef.position.set(0, 0.03, R + 5); g.add(ef);
    const cry = [new T.MeshBasicMaterial({ color: 0x9a50ff }), new T.MeshBasicMaterial({ color: 0x40c8ff })];
    for (let k = 0; k < 26; k++) { const a = rnd() * 6.283, d = 8 + rnd() * (R - 14); if (Math.cos(a) > 0.8 && d > R - 20) continue; const m = new T.Mesh(new T.ConeGeometry(0.35 + rnd() * 0.8, 1.5 + rnd() * 4, 5), cry[k % 2]); m.position.set(Math.sin(a) * d, 0.8, Math.cos(a) * d - 4); m.rotation.set((rnd() - 0.5) * 0.6, 0, (rnd() - 0.5) * 0.6); g.add(m); }
    for (let k = 0; k < 40; k++) { const a = rnd() * 6.283, d = rnd() * (R - 8); const st = new T.Mesh(new T.ConeGeometry(0.6 + rnd() * 1.2, 3 + rnd() * 7, 6), RM); st.rotation.x = Math.PI; st.position.set(Math.sin(a) * d, 34 - d * 0.45 - rnd() * 4, Math.cos(a) * d); g.add(st); }
    for (let z = -R - 10; z > -TL; z -= 24) { const c = new T.Mesh(new T.OctahedronGeometry(0.5), cry[0]); c.position.set(TR - 1.2, 2.2, z); g.add(c); }
    const torch = (lx, lz) => { const f = new T.Mesh(new T.ConeGeometry(0.35, 1.1, 6), new T.MeshBasicMaterial({ color: 0xff8a30 })); f.position.set(lx, 3.4, lz); g.add(f); SH.torches = (SH.torches || []).concat([f]); };
    torch(-7, R + 8); torch(7, R + 8); torch(-4, -TL + 4); torch(4, -TL + 4);
    // Portal in der Kammer (zum Bergeingang gedreht), mit Steinsockel
    const portal = buildPortal(1.15); portal.position.set(0, 0, -2); g.add(portal); SH.portal = portal;
    g.updateMatrixWorld(true); solidPortal(portal, 1.15);
    g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    // Kollision: Kammerwand als Ring (mit 2 Öffnungen), Tunnelwände, Bergflanken
    const box = (lx, lz, hw, hd, h) => { const c = W(lx, lz); L.addBox(c.x - hw, c.z - hd, c.x + hw, c.z + hd, h, 'mountain'); };
    const ad = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    for (let k = 0; k < 72; k++) { const a = k / 72 * 6.283; if (ad(a, front) < 0.17 || ad(a, back) < 0.11) continue; box(Math.cos(a) * (R + 1), Math.sin(a) * (R + 1), 2.6, 2.6, 60); }
    for (let z = R; z < R + 16; z += 3) { box(-9.5, z, 1.2, 2, 30); box(9.5, z, 1.2, 2, 30); }
    for (let z = -R; z > -TL; z -= 3) { box(-TR - 0.6, z, 1, 2, 30); box(TR + 0.6, z, 1, 2, 30); }
    // Kein Gras in Berg, Tunnel und Gang
    NOGRASS.push((x, z) => { const dx = x - S.x, dz = z - S.z, lz = dx * fw.x + dz * fw.z, lx = dx * rt.x + dz * rt.z; if (Math.hypot(lx, lz) < R + 30) return true; if (Math.abs(lx) < 14 && lz < 0 && lz > -TL - 4) return true; if (Math.abs(lx) < 14 && lz > 0 && lz < R + 20) return true; return false; });
    L.grassRefresh && L.grassRefresh();
    // Wo ist man? (für dunkles Licht drinnen)
    SH.local = (x, z) => { const dx = x - S.x, dz = z - S.z; return { lz: dx * fw.x + dz * fw.z, lx: dx * rt.x + dz * rt.z }; };
    SH.insideCave = (x, z) => { const q = SH.local(x, z); return Math.hypot(q.lx, q.lz) < R - 2 || (Math.abs(q.lx) < TR && q.lz < -R + 4 && q.lz > -TL + 6) || (Math.abs(q.lx) < 9 && q.lz > R - 6 && q.lz < R + 10); };
    SH.portalPos = () => { const c = W(0, -2); return { x: c.x, z: c.z, y: 12.6 }; };
    SH.chamberOut = () => { const c = W(0, 22); return { x: c.x, z: c.z }; };
    // Karte/Wegpunkte
    if (L.POIS) { const e = W(0, R + 16), cv = W(0, -TL - 6); L.POIS.push({ id: 'dunkelberg', name: 'Dunkelberg – Eingang zum Portal', x: e.x, z: e.z, r: 8, icon: '🌑', sub: true }); L.POIS.push({ id: 'dunkelhoehle', name: 'Dunkelberg – Höhle (Tunnel zum Portal)', x: cv.x, z: cv.z, r: 8, icon: '🕳️', sub: true }); }
    SH.mGroup = g;
  }
  // ---------- Das Schattenreich ----------
  function buildRealm() {
    const g = new T.Group(); g.position.set(RX, 0, RZ); L.scene.add(g); SH.R = g;
    const DM = darkRockM();
    // Boden: dunkle Asche mit violetten Adern
    const c = document.createElement('canvas'); c.width = c.height = 512; const gg = c.getContext('2d'); gg.fillStyle = '#16121c'; gg.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const v = 14 + Math.random() * 30; gg.fillStyle = 'rgba(' + v + ',' + (v - 4) + ',' + (v + 10) + ',0.6)'; gg.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
    gg.strokeStyle = 'rgba(150,60,255,0.35)'; for (let i = 0; i < 60; i++) { gg.lineWidth = 1 + Math.random() * 2; gg.beginPath(); let x = Math.random() * 512, y = Math.random() * 512; gg.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (Math.random() - 0.5) * 70; y += (Math.random() - 0.5) * 70; gg.lineTo(x, y); } gg.stroke(); }
    const gt = new T.CanvasTexture(c); gt.wrapS = gt.wrapT = T.RepeatWrapping; gt.repeat.set(40, 40);
    const ground = new T.Mesh(new T.CircleGeometry(RR, 96), new T.MeshStandardMaterial({ map: gt, color: 0x9a90a8, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
    // glühende Lava-Risse
    const lava = new T.MeshBasicMaterial({ color: 0xff4a20 });
    for (let k = 0; k < 70; k++) { const a = rnd() * 6.283, d = 60 + rnd() * (RR - 120), m = new T.Mesh(new T.BoxGeometry(0.5 + rnd() * 0.8, 0.05, 8 + rnd() * 30), lava); m.position.set(Math.sin(a) * d, 0.04, Math.cos(a) * d); m.rotation.y = rnd() * 3; g.add(m); }
    // Obsidian-Türme, tote Bäume, Kristalle, Ruinen, schwebende Felsen
    for (let k = 0; k < 90; k++) { const a = rnd() * 6.283, d = 70 + rnd() * (RR - 100), h = 12 + rnd() * 70; const m = new T.Mesh(new T.ConeGeometry(3 + rnd() * 7, h, 6), DM); m.position.set(Math.sin(a) * d, h / 2 - 1, Math.cos(a) * d); m.rotation.set((rnd() - 0.5) * 0.25, rnd() * 3, (rnd() - 0.5) * 0.25); m.castShadow = true; g.add(m); const p = { x: RX + m.position.x, z: RZ + m.position.z }; L.addBox(p.x - 2.5, p.z - 2.5, p.x + 2.5, p.z + 2.5, h, 'rock'); }
    const bark = new T.MeshStandardMaterial({ color: 0x1a1414, roughness: 1 });
    for (let k = 0; k < 60; k++) { const a = rnd() * 6.283, d = 40 + rnd() * (RR - 70), t = new T.Group(); t.position.set(Math.sin(a) * d, 0, Math.cos(a) * d); g.add(t); const tr = new T.Mesh(new T.CylinderGeometry(0.25, 0.6, 9, 6), bark); tr.position.y = 4.5; tr.rotation.z = (rnd() - 0.5) * 0.3; t.add(tr); for (let b = 0; b < 4; b++) { const br = new T.Mesh(new T.CylinderGeometry(0.08, 0.2, 4, 5), bark); br.position.set(0, 5 + b * 1.1, 0); br.rotation.set((rnd() - 0.5) * 1.8, rnd() * 6, (rnd() - 0.5) * 1.8); br.translateY(1.6); t.add(br); } }
    const cr = [new T.MeshBasicMaterial({ color: 0x9a50ff }), new T.MeshBasicMaterial({ color: 0x40c8ff }), new T.MeshBasicMaterial({ color: 0xff40c0 })];
    for (let k = 0; k < 80; k++) { const a = rnd() * 6.283, d = 20 + rnd() * (RR - 40), cl = new T.Group(); cl.position.set(Math.sin(a) * d, 0, Math.cos(a) * d); g.add(cl); for (let j = 0; j < 4; j++) { const m = new T.Mesh(new T.ConeGeometry(0.4 + rnd() * 0.9, 2 + rnd() * 5, 5), cr[k % 3]); m.position.set((rnd() - 0.5) * 2, 1.2, (rnd() - 0.5) * 2); m.rotation.set((rnd() - 0.5) * 0.7, 0, (rnd() - 0.5) * 0.7); cl.add(m); } }
    for (let k = 0; k < 24; k++) { const a = rnd() * 6.283, d = 80 + rnd() * (RR - 100); for (let j = 0; j < 3; j++) { const col = new T.Mesh(new T.CylinderGeometry(1.3, 1.5, 6 + rnd() * 12, 8), DM); col.position.set(Math.sin(a) * d + j * 5, 4, Math.cos(a) * d); g.add(col); } }
    const floats = []; for (let k = 0; k < 30; k++) { const m = lump(6 + rnd() * 14, DM, 0.7); m.position.set((rnd() - 0.5) * RR * 1.6, 60 + rnd() * 140, (rnd() - 0.5) * RR * 1.6); g.add(m); floats.push(m); }
    // blutroter Mond und Sterne
    const moon = new T.Mesh(new T.SphereGeometry(120, 32, 20), new T.MeshBasicMaterial({ color: 0x7a1020, fog: false })); moon.position.set(500, 420, -1400); g.add(moon);
    const sg = new T.BufferGeometry(), sp = new Float32Array(3000 * 3); for (let i = 0; i < 3000; i++) { const a = rnd() * 6.283, b = Math.asin(rnd() * 2 - 1); sp[i * 3] = Math.cos(a) * Math.cos(b) * 3800; sp[i * 3 + 1] = Math.sin(b) * 3800; sp[i * 3 + 2] = Math.sin(a) * Math.cos(b) * 3800; } sg.setAttribute('position', new T.BufferAttribute(sp, 3)); g.add(new T.Points(sg, new T.PointsMaterial({ color: 0xc8a0ff, size: 3, fog: false })));
    // ===== Weltall: die Insel schwebt – felsige Unterseite mit Zacken, Nebel, ferne Inseln, Sterne =====
    const under = new T.ConeGeometry(RR, 620, 64, 10, true); under.rotateX(Math.PI); { const p = under.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = Math.sin(x * 0.02) * Math.cos(z * 0.025) * 28 + Math.sin(x * 0.07 + z * 0.05) * 12; if (y < 309) { const k = 1 + n / Math.max(80, Math.hypot(x, z)); p.setX(i, x * k); p.setZ(i, z * k); p.setY(i, y + n * 0.6); } } under.computeVertexNormals(); }
    const underM = new T.MeshStandardMaterial({ color: 0x5a4878, emissive: 0x24123a, roughness: 0.9, metalness: 0.05, flatShading: true });
    const um = new T.Mesh(under, underM); um.position.y = -312; g.add(um);
    // Zacken am Rand (nach oben, außen und unten) + hängende Felsnadeln unten
    for (let k = 0; k < 140; k++) { const a = k / 140 * 6.283 + rnd() * 0.03, h = 18 + rnd() * 70, up = rnd() < 0.55, c = new T.Mesh(new T.ConeGeometry(4 + rnd() * 9, h, 5), DM); c.position.set(Math.sin(a) * (RR - 4), up ? h * 0.35 : -h * 0.4, Math.cos(a) * (RR - 4)); c.rotation.set(up ? (rnd() - 0.5) * 0.6 : Math.PI + (rnd() - 0.5) * 0.6, a, (up ? -1 : 1) * (0.35 + rnd() * 0.5)); c.rotation.order = 'YXZ'; c.rotation.y = a; c.rotation.x = up ? -0.45 - rnd() * 0.4 : Math.PI + 0.45 + rnd() * 0.4; g.add(c); }
    for (let k = 0; k < 70; k++) { const a = rnd() * 6.283, d = rnd() * RR * 0.8, h = 40 + rnd() * 160, c = new T.Mesh(new T.ConeGeometry(6 + rnd() * 14, h, 6), DM); c.rotation.x = Math.PI; const yb = -312 - (1 - d / RR) * 0 ; c.position.set(Math.sin(a) * d, -(620 * (1 - d / RR)) - h / 2 + 20, Math.cos(a) * d); g.add(c); }
    // leuchtende Kristalladern an der Unterseite
    const veinM = new T.MeshBasicMaterial({ color: 0x9a50ff, fog: false });
    for (let k = 0; k < 40; k++) { const a = rnd() * 6.283, d = RR * (0.3 + rnd() * 0.65), m = new T.Mesh(new T.OctahedronGeometry(3 + rnd() * 6), veinM); m.position.set(Math.sin(a) * d, -2 - 620 * (1 - d / RR) - 2, Math.cos(a) * d); g.add(m); }
    // Weltraum-Nebel (weiche Farbwolken) und ferne schwebende Inseln
    const nebTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c); })();
    for (let k = 0; k < 14; k++) { const a = rnd() * 6.283, b = (rnd() - 0.4) * 1.2, s = new T.Sprite(new T.SpriteMaterial({ map: nebTex, color: [0x6a20c0, 0x2050c0, 0xc02080, 0x20a0a0][k % 4], transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, fog: false })); s.position.set(Math.cos(a) * Math.cos(b) * 4200, Math.sin(b) * 4200, Math.sin(a) * Math.cos(b) * 4200); s.scale.setScalar(1600 + rnd() * 1800); g.add(s); }
    for (let k = 0; k < 9; k++) { const a = rnd() * 6.283, d = RR + 500 + rnd() * 1800, r = 60 + rnd() * 160, isl = new T.Group(); const top = new T.Mesh(new T.CylinderGeometry(r, r * 0.9, 12, 18), new T.MeshStandardMaterial({ color: 0x3a3048, roughness: 1, flatShading: true })); isl.add(top); const bot = new T.Mesh(new T.ConeGeometry(r * 0.9, r * 1.4, 18), underM); bot.rotation.x = Math.PI; bot.position.y = -6 - r * 0.7; isl.add(bot); for (let j = 0; j < 8; j++) { const sp = new T.Mesh(new T.ConeGeometry(3 + rnd() * 5, 20 + rnd() * 40, 5), DM); const aa = rnd() * 6.283; sp.position.set(Math.sin(aa) * r * 0.6, 12, Math.cos(aa) * r * 0.6); isl.add(sp); } isl.position.set(Math.sin(a) * d, -150 + rnd() * 500, Math.cos(a) * d); isl.rotation.y = rnd() * 6; g.add(isl); }
    // Rückkehr-Portal
    const back = buildPortal(1.0); back.position.set(0, 0, -25); g.add(back); SH.backPortal = back; solidPortal(back, 1);
    g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    SH.floats = floats;
    // dunkle Drachen kreisen über dem Reich (eigene Modelle aus der Märchenwelt, dunkel eingefärbt)
    SH.dragons = [];
    if (L.buildDragon) { const COLS = [["#1a1424", "#5a2a7a", "#8a30ff"], ["#2a0a14", "#a02040", "#ff3060"], ["#0a1a24", "#2a6a8a", "#30d0ff"], ["#141414", "#4a4a50", "#a040ff"]]; for (let k = 0; k < 32; k++) { const c = COLS[k % COLS.length], D = L.buildDragon(1.8 + rnd() * 2.6, c[0], c[1], c[2]); D.root.traverse((o) => { if (o.isMesh) o.castShadow = false; }); g.add(D.root); SH.dragons.push({ D, r: 80 + rnd() * (RR + 400), ang: rnd() * 6.283, spd: (rnd() < 0.5 ? -1 : 1) * (0.06 + rnd() * 0.06), h: 35 + rnd() * 220, ph: rnd() * 6.283, fireT: 2 + rnd() * 12 }); } }
  }
  // ---------- Kristall-Bestie (Monster im Schattenreich) ----------
  function buildBeast() {
    const root = new T.Group(), body = new T.Group(); root.add(body);
    const hide = new T.MeshStandardMaterial({ color: 0x3a2a50, emissive: 0x1a0c2c, roughness: 0.6, metalness: 0.3, flatShading: true });
    const crys = new T.MeshStandardMaterial({ color: 0x7a30d0, emissive: 0x5a18b0, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.5, flatShading: true });
    const gem = new T.MeshBasicMaterial({ color: 0x40b8ff }), chainM = new T.MeshStandardMaterial({ color: 0x5a5a64, metalness: 0.9, roughness: 0.3 });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; (par || body).add(o); return o; };
    const S = new T.SphereGeometry(1, 12, 8), C = new T.ConeGeometry(1, 1, 5), O = new T.OctahedronGeometry(1);
    const hips = new T.Group(); hips.position.y = 1.9; body.add(hips);
    P3(S, hide, 1.1, 0.9, 1.9, 0, 0.2, 0, hips); P3(S, hide, 1.25, 1.1, 1.0, 0, 0.45, 1.2, hips);
    const head = new T.Group(); head.position.set(0, 0.9, 2.3); hips.add(head);
    P3(S, hide, 0.6, 0.55, 0.85, 0, 0, 0.4, head); const jaw = new T.Group(); jaw.position.set(0, -0.25, 0.3); head.add(jaw); P3(S, hide, 0.5, 0.18, 0.7, 0, -0.05, 0.45, jaw);
    for (let k = 0; k < 6; k++) P3(C, new T.MeshStandardMaterial({ color: 0xe8e0d0 }), 0.05, 0.2, 0.05, -0.25 + k * 0.1, -0.12, 0.9, head).rotation.x = Math.PI;
    for (const s of [-1, 1]) { P3(S, gem, 0.09, 0.06, 0.05, s * 0.28, 0.15, 0.95, head); P3(C, crys, 0.18, 0.9, 0.18, s * 0.35, 0.5, 0.1, head).rotation.set(-0.6, 0, s * 0.5); }
    // Kristall-Stacheln auf dem Rücken
    for (let k = 0; k < 14; k++) { const z = -1.6 + k * 0.25, h = 0.8 + Math.sin(k * 0.7) * 0.5 + 0.5; for (const s of [-1, 0, 1]) { if (s && k % 2) continue; P3(O, crys, 0.18, h, 0.18, s * 0.45, 0.9 + h * 0.4, z, hips).rotation.set(-0.5, 0, s * 0.45); } }
    // schwebende Edelsteine + Kette
    const gems = []; for (let k = 0; k < 5; k++) gems.push(P3(O, gem, 0.18, 0.28, 0.18, 0, 2.2, 0, hips));
    for (let k = 0; k < 8; k++) P3(new T.TorusGeometry(0.12, 0.035, 5, 10), chainM, 1, 1, 1, 0.9 - k * 0.06, 0.2 - k * 0.12, 1.1 + k * 0.05, hips).rotation.y = k % 2 ? Math.PI / 2 : 0;
    const legs = []; for (const [x, z] of [[0.75, 1.3], [-0.75, 1.3], [0.75, -1.2], [-0.75, -1.2]]) { const lg = new T.Group(); lg.position.set(x, 0.1, z); hips.add(lg); P3(S, hide, 0.32, 1.0, 0.36, 0, -0.75, 0, lg); const sh = new T.Group(); sh.position.y = -1.55; lg.add(sh); P3(S, hide, 0.24, 0.6, 0.26, 0, -0.1, 0.1, sh); P3(C, crys, 0.12, 0.35, 0.12, 0, -0.55, 0.3, sh).rotation.x = 1.6; legs.push({ lg, sh }); }
    const tail = new T.Group(); tail.position.set(0, 0.3, -1.8); hips.add(tail); for (let k = 0; k < 5; k++) P3(O, k > 2 ? crys : hide, 0.25 - k * 0.03, 0.25, 0.4, 0, k * 0.08, -k * 0.45, tail);
    root.scale.setScalar(1.25);
    root.traverse((o) => { o.frustumCulled = false; });
    return { root, body, hips, head, jaw, legs, tail, gems };
  }
  function animBeast(r, st) {
    const ph = st.phase || 0, m = st.mode;
    if (m === 'dead') { r.body.rotation.z = Math.min(1.5, (r.body.rotation.z || 0) + 0.05); r.body.position.y = -0.6; return; }
    r.body.rotation.z = 0; r.body.position.y = 0;
    const run = m === 'run' || m === 'chase', walk = m === 'walk' || run, sp = run ? 2.2 : 1;
    r.legs.forEach((l, i) => { const s = walk ? Math.sin(ph * sp + (i === 0 || i === 3 ? 0 : Math.PI)) : 0; l.lg.rotation.x = s * (run ? 0.8 : 0.45); l.sh.rotation.x = Math.max(0, -s) * 0.7; });
    r.hips.position.y = 1.9 + (walk ? Math.abs(Math.sin(ph * sp)) * 0.12 : Math.sin(ph * 0.5) * 0.04);
    r.head.rotation.x = m === 'attack' ? -0.4 : Math.sin(ph * 0.4) * 0.08; r.jaw.rotation.x = m === 'attack' || run ? 0.45 + Math.sin(ph * 6) * 0.15 : 0.05;
    r.tail.rotation.y = Math.sin(ph * 1.3) * 0.5;
    r.gems.forEach((g, k) => { const a = ph * 0.8 + k * 1.256; g.position.set(Math.cos(a) * 1.6, 2.2 + Math.sin(ph * 2 + k) * 0.25, Math.sin(a) * 1.6); g.rotation.y += 0.05; });
  }
  if (L.MK) L.MK.kristallbestie = { build: () => buildBeast(), anim: animBeast, spd: [2.2, 6.5, 11], hp: 420, r: 1.4, reach: 3.6, grab: 3, atk: 1, wind: 0.45, dmg: 45, veh: 50, knock: 14, up: 6, heavy: true, view: 320,
    cause: 'Von einer Kristall-Bestie zerrissen', voice: (p) => { L.tn && L.tn({ f: 110, fTo: 60, dur: 0.9, type: 'sawtooth', vol: 0.18, pos: p }); L.tn && L.tn({ f: 1400, fTo: 700, dur: 0.4, type: 'triangle', vol: 0.05, pos: p }); }, idle: (p) => { L.tn && L.tn({ f: 900 + Math.random() * 600, fTo: 1800, dur: 0.25, type: 'sine', vol: 0.04, pos: p }); }, hit: [[2.2, 1.4, 1], [2.9, 0.7, 2]] };
  // ---------- Welt-Grenzen und Boden ----------
  const osf = L.seaFloor;
  L.seaFloor = function (x, z) { if (x < -40000) return Math.hypot(x - RX, z - RZ) < RR ? 0 : -5000; return osf(x, z); };
  // kein offenes Meer (keine Haie, Wellen, Strudel) im Schattenreich
  setTimeout(() => { const oos = L.openSea; if (oos) L.openSea = function (x, z) { return x < -40000 ? 0 : oos.apply(this, arguments); }; }, 0);
  // ---------- Teleport ----------
  let cool = 0;
  function flash(col) { const f = document.createElement('div'); f.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;background:' + col + ';opacity:1;transition:opacity 1.2s'; document.body.appendChild(f); requestAnimationFrame(() => { f.style.opacity = '0'; }); setTimeout(() => f.remove(), 1300); }
  function go(x, z, msgA, msgB) {
    if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true);
    P.x = x; P.z = z; P.y = 0; P.vx = P.vz = P.vy = 0; P.flying = 0; P.spawnProt = Math.max(P.spawnProt || 0, 3); cool = 3;
    flash('#2a0a40'); L.tn && L.tn({ f: 80, fTo: 600, dur: 1.2, type: 'sawtooth', vol: 0.2 }); L.tn && L.tn({ f: 1600, fTo: 300, dur: 1, type: 'sine', vol: 0.08 });
    L.banner(msgA, msgB); L.grassRefresh && L.grassRefresh();
  }
  // ---------- Update ----------
  const beasts = [];
  L.updateShadowRealm = function (dt) {
    if (L.state !== 'game') return;
    if (!SH.built) { SH.built = true; try { buildMountain(); } catch (e) { console.error(e); } }
    const t = performance.now() / 1000; cool = Math.max(0, cool - dt);
    // Portale nur animieren, wenn man in der Nähe ist
    if (SH.portal && SH.M && Math.hypot(P.x - SH.M.x, P.z - SH.M.z) < 260) SH.portal.userData.update(dt, t);
    if (SH.torches) SH.torches.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 13 + i) * 0.15, 1 + Math.sin(t * 9 + i * 2) * 0.25, 1); });
    SH.inCave = !!(SH.insideCave && SH.insideCave(P.x, P.z));
    // ins Portal im Berg gehen
    if (SH.portalPos && cool <= 0 && P.alive) { const pp = SH.portalPos(); if (Math.hypot(P.x - pp.x, P.z - pp.z) < 5 && (P.y || 0) < 20) { if (!SH.R) buildRealm(); go(RX + 0, RZ + 10, '🌑 DAS SCHATTENREICH', 'Eine Dimension aus Dunkelheit und Kristall. Etwas beobachtet dich …'); } }
    if (!L.inShadow(P.x)) return;
    if (!SH.R) buildRealm();
    SH.backPortal.userData.update(dt, t); SH.floats.forEach((m, i) => { m.position.y += Math.sin(t * 0.4 + i) * 0.02; m.rotation.y += dt * 0.03; });
    // zurück durch das Portal im Schattenreich
    if (cool <= 0 && Math.hypot(P.x - RX, P.z - (RZ - 25)) < 5) { const o = SH.chamberOut(); go(o.x, o.z, '🏔️ ZURÜCK IM DUNKELBERG', 'Das Portal hat dich zurückgebracht.'); return; }
    // Drachen fliegen, schlagen mit den Flügeln und speien ab und zu lila Feuer in die Tiefe (harmlos)
    if (SH.dragons) for (const d of SH.dragons) { d.ang += d.spd * dt; const x = Math.cos(d.ang) * d.r, z = Math.sin(d.ang) * d.r, y = d.h + Math.sin(t * 0.5 + d.ph) * 6; d.D.root.position.set(x, y, z); d.D.root.rotation.set(0, Math.atan2(-Math.sin(d.ang) * Math.sign(d.spd), Math.cos(d.ang) * Math.sign(d.spd)), -Math.sign(d.spd) * 0.25); if (L.dragonFlap) L.dragonFlap(d.D, t * 2.2 + d.ph, 0.6); d.fireT -= dt; if (d.fireT <= 0) { d.fireT = 5 + Math.random() * 9; const wx = RX + x, wz = RZ + z, fx = Math.sin(d.D.root.rotation.y), fz = Math.cos(d.D.root.rotation.y); for (let k = 0; k < 26; k++) setTimeout(() => { L.fx && L.fx(k % 3 ? '#a040ff' : '#ff60c0', wx + fx * (8 + k * 1.6), y - 2 - k * 1.2, wz + fz * (8 + k * 1.6), 3, 6, { basic: true, size: 0.9, life: 0.8 }); }, k * 25); if (Math.hypot(wx - P.x, wz - P.z) < 220) { L.nz && L.nz({ dur: 1.4, f: 180, fTo: 60, type: 'lowpass', vol: 0.3 }); L.tn && L.tn({ f: 90, fTo: 45, dur: 1.2, type: 'sawtooth', vol: 0.12 }); } } }
    // unsichtbare Grenze am Rand: nicht ins Nichts laufen/fahren
    { const o = P.vehicle || P, dr = Math.hypot(o.x - RX, o.z - RZ); if (dr > RR - 12) { const a = Math.atan2(o.x - RX, o.z - RZ); o.x = RX + Math.sin(a) * (RR - 12); o.z = RZ + Math.cos(a) * (RR - 12); if (o !== P) { P.x = o.x; P.z = o.z; } if (!(SH.edgeT > 0)) { SH.edgeT = 4; L.msg('🌑 Dahinter ist nur Leere.', 2000); } } SH.edgeT = (SH.edgeT || 0) - dt; }
    // vom Rand ins Nichts gefallen
    if (P.alive && (P.y || 0) < -50) { P.x = RX; P.z = RZ + 10; P.y = 0; P.vy = 0; L.hurtPlayer && L.hurtPlayer(20, 'In die Leere des Schattenreichs gestürzt'); }
    // Kristall-Bestien
    SH.beastT -= dt;
    for (let i = beasts.length - 1; i >= 0; i--) if (!beasts[i] || beasts[i].dead) beasts.splice(i, 1);
    if (SH.beastT <= 0 && beasts.length < 30 && L._spawnMonster && L.MK && L.MK.kristallbestie) { SH.beastT = beasts.length < 12 ? 0.6 : 2.2; const a = Math.random() * 6.283, d = 110 + Math.random() * 120; const x = L.clamp(P.x + Math.sin(a) * d, RX - RR + 30, RX + RR - 30), z = L.clamp(P.z + Math.cos(a) * d, RZ - RR + 30, RZ + RR - 30); if (Math.hypot(x - RX, z - RZ) < RR - 30 && Math.hypot(x - P.x, z - P.z) > 90 && Math.hypot(x - RX, z - (RZ + 10)) > 70) { const m = L._spawnMonster('kristallbestie', x, z); if (m) { m.isl = REALM; beasts.push(m); } } }
    for (const m of beasts) { if (Math.hypot(m.tx - RX, m.tz - RZ) > RR - 40) { const q = L.islandWander ? L.islandWander(m) : { x: RX, z: RZ }; m.tx = q.x; m.tz = q.z; } if (Math.hypot(m.x - RX, m.z - RZ) > RR - 20) { const a = Math.atan2(m.x - RX, m.z - RZ); m.x = RX + Math.sin(a) * (RR - 25); m.z = RZ + Math.cos(a) * (RR - 25); } }
    if (L.respawnQueue) for (let i = L.respawnQueue.length - 1; i >= 0; i--) if (L.respawnQueue[i].kind === 'kristallbestie') L.respawnQueue.splice(i, 1);
  };
  // dunkles Licht in Höhle/Berg und im Schattenreich
  const oue = L.updateEnv;
  L.updateEnv = function (dt, cam, focus, paused) {
    oue.apply(this, arguments);
    try {
      if (!cam) return; const E = L.env;
      if (L.inShadow(cam.position.x)) { L.scene.background.set('#030208'); L.scene.fog.color.set('#0c0818'); L.scene.fog.near = 90; L.scene.fog.far = 1500; E.hemi.intensity = 1.05; E.hemi.color.set('#b8a8f0'); E.hemi.groundColor.set('#4a3460'); E.sun.intensity = 1.0; E.sun.color.set('#d8ccff'); if (E.stars) E.stars.material.opacity = 0; if (E.sunDisc) E.sunDisc.material.opacity = 0; if (E.moon) E.moon.material.opacity = 0; if (E.rainMesh) E.rainMesh.visible = false; return; }
      if (SH.inCave && SH.insideCave && SH.insideCave(cam.position.x, cam.position.z)) { L.scene.fog.color.set('#0a0810'); L.scene.fog.near = 8; L.scene.fog.far = 120; E.hemi.intensity = Math.min(E.hemi.intensity, 0.3); E.hemi.color.set("#b8a8e0"); E.sun.intensity = Math.min(E.sun.intensity, 0.08); if (E.rainMesh) E.rainMesh.visible = false; }
    } catch (e) { /* egal */ }
  };
  L.shadowRealm = SH;
})();
