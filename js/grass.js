'use strict';
// Echtes 3D-Gras: tausende Halme rund um die Kamera, wehen im Wind, werden beim Drüberlaufen niedergedrückt.
// Je nach Welt anders: Heimat saftig grün, Dschungel hoch und dicht, Wüste trockene Büschel, Eisland bereift,
// Pilzinsel lila, Kristallinsel eisblau, Geisterinsel grau und tot, Asgard golden, Omas Garten + Märchenwelt mit Blumen.
(function () {
  const L = window.L, T = THREE, P = L.player;
  // Aussehen pro Welt: dichte (Halme pro m²), Höhe, Farben (unten → oben), Blumen
  const ST = {
    home: { d: 9, h: [0.3, 0.7], c: [[0.2, 0.4, 0.1], [0.36, 0.6, 0.18], [0.5, 0.7, 0.24]], wind: 1 },
    fairy: { d: 9, h: [0.4, 0.85], c: [[0.3, 0.55, 0.22], [0.55, 0.85, 0.4], [0.7, 0.9, 0.5]], wind: 0.8, fl: [0xff9ad8, 0xffffff, 0xc8a0ff, 0xfff080], flP: 0.05 },
    oma: { d: 8.5, h: [0.3, 0.65], c: [[0.22, 0.45, 0.14], [0.45, 0.72, 0.3], [0.58, 0.78, 0.32]], wind: 0.9, fl: [0xff6a8a, 0xffffff, 0xffe040, 0xa070ff], flP: 0.06 },
    asgard: { d: 8, h: [0.35, 0.8], c: [[0.3, 0.45, 0.15], [0.62, 0.7, 0.28], [0.85, 0.75, 0.3]], wind: 0.9, fl: [0xffd040, 0xfff2b0], flP: 0.03 },
    dschungel: { d: 11, h: [0.7, 1.6], c: [[0.08, 0.25, 0.06], [0.2, 0.48, 0.14], [0.3, 0.6, 0.2]], wind: 1.2 },
    wueste: { d: 0.7, h: [0.25, 0.55], c: [[0.45, 0.38, 0.18], [0.72, 0.62, 0.32], [0.82, 0.72, 0.42]], wind: 1.4, tuft: true },
    eis: { d: 2.2, h: [0.18, 0.4], c: [[0.62, 0.72, 0.7], [0.78, 0.86, 0.9], [0.95, 0.98, 1]], wind: 0.4 },
    pilz: { d: 5, h: [0.4, 0.9], c: [[0.22, 0.12, 0.28], [0.5, 0.28, 0.6], [0.75, 0.5, 0.85]], wind: 0.7, fl: [0xff60c0, 0x80ffd0], flP: 0.03 },
    kristall: { d: 3.5, h: [0.3, 0.7], c: [[0.25, 0.4, 0.55], [0.5, 0.78, 0.95], [0.8, 0.95, 1]], wind: 0.3 },
    geist: { d: 2.5, h: [0.25, 0.6], c: [[0.18, 0.18, 0.16], [0.36, 0.36, 0.32], [0.5, 0.5, 0.46]], wind: 0.6 },
    // Ruslans Mystery Island: dichtes, zotteliges Walrosshaar statt Gras
    mystery: { d: 15, h: [0.2, 0.55], c: [[0.18, 0.12, 0.07], [0.36, 0.25, 0.16], [0.5, 0.38, 0.26]], wind: 0.7, tilt: 1.1, wMul: 2.2 },
    // Dimension: leuchtendes Alien-Gras
    dim: { d: 5, h: [0.3, 0.9], c: [[0.12, 0.05, 0.25], [0.35, 0.2, 0.8], [0.3, 0.95, 0.9]], wind: 0.5, glow: true, fl: [0x60fff0, 0xff60ff], flP: 0.04 },
    // Titanenmond: vereinzelte rote, trockene Büschel
    titan: { d: 0.5, h: [0.2, 0.5], c: [[0.3, 0.1, 0.05], [0.6, 0.25, 0.12], [0.78, 0.42, 0.2]], wind: 0.9, tuft: true },
    vulkan: { d: 0.35, h: [0.15, 0.35], c: [[0.12, 0.1, 0.08], [0.28, 0.22, 0.16], [0.4, 0.3, 0.2]], wind: 0.5, tuft: true }
  };
  function styleAt(x, z) {
    const w = L.worldOf ? L.worldOf(x, z) : 'home';
    if (w === 'home') return ST.home;
    if (w === 'fairy') return ST.fairy;
    if (w === 'back' || w === 'jupiter' || w === 'moon') return null;
    if (w === 'dim') return L.dimLand && L.dimLand(x, z) ? ST.dim : null;
    return ST[w] || null;
  }
  // Gültige Stelle? (Land, keine Straße, kein See, kein Haus/Fels, nicht zu steil) – pro 1-m-Zelle zwischengespeichert
  const cache = new Map(), zc = {};
  function okCell(cx, cz) {
    const k = cx * 100003 + cz; let v = cache.get(k); if (v !== undefined) return v;
    v = 0; const x = cx + 0.5, z = cz + 0.5;
    try {
      const st = styleAt(x, z);
      if (st && (x > 40000 ? (st !== ST.dim || (L.dimLand && L.dimLand(x, z))) : L.seaFloor(x, z) === 0) && !(L.onRoad && L.onRoad(x, z))) {
        const lk = L.lake; const inLake = lk && x > lk.x1 - 1 && x < lk.x2 + 1 && z > lk.z1 - 1 && z < lk.z2 + 1;
        const mh = L.mountainH ? L.mountainH(x, z) : 0;
        if (!inLake && mh < 2.5 && !(L.queryBoxes && L.queryBoxes(x, z, 0.9).some((b) => (b.y0 || 0) < 1.5))) {
          v = 1;
          // Heimat: nur wo der Boden wirklich grün ist (keine Stadt-Pflaster, kein Sand, keine Feldwege, kein Militärgelände)
          if (st === ST.home && L.zoneColor) { L.zoneColor(x, z, zc); const green = zc.g - Math.max(zc.r, zc.b); v = green < 0.035 ? 0 : Math.min(1, (green - 0.035) / 0.06); }
          // Inseln: kein Gras am Strand
          else if (st !== ST.fairy && st !== ST.dim && L.islandAt) { const I = L.islandAt(x, z); if (I && I.r && Math.hypot(x - I.x, z - I.z) > I.r - 28) v = 0; }
        }
      }
    } catch (e) { v = 0; }
    if (cache.size > 250000) cache.clear(); cache.set(k, v); return v;
  }
  // Pseudo-Zufall (immer gleich pro Stelle)
  const rnd = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; h ^= h >>> 16; return ((h >>> 0) % 100000) / 100000; };
  // Halm: schmal zulaufend, leicht gebogen, 4 Abschnitte
  function bladeGeo() {
    const pos = [], col = [], nor = [], idx = [], N = 4;
    for (let i = 0; i <= N; i++) { const y = i / N, w = 0.032 * (1 - y * 0.9), bend = y * y * 0.12, g = 0.62 + y * 0.38; pos.push(-w, y, bend, w, y, bend); col.push(g, g, g, g, g, g); nor.push(0, 1, 0, 0, 1, 0); }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.setIndex(idx); return g;
  }
  const U = { uTime: { value: 0 }, uWind: { value: 1 }, uPlayer: { value: new T.Vector3() } };
  function grassMat() {
    const m = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'uniform float uTime; uniform float uWind; uniform vec3 uPlayer;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float gh = position.y; vec4 gp = instanceMatrix[3];
        float gw = sin(uTime * 1.6 + gp.x * 0.31 + gp.z * 0.23) * 0.55 + sin(uTime * 3.7 + gp.x * 1.3 + gp.z * 0.7) * 0.18;
        transformed.x += gw * gh * gh * 0.35 * uWind; transformed.z += gw * gh * gh * 0.2 * uWind;
        float gd = distance(gp.xz, uPlayer.xz); float gt = 1.0 - smoothstep(0.25, 1.3, gd);
        transformed.y *= 1.0 - gt * 0.65; transformed.z += gt * gh * 0.6;`);
    };
    return m;
  }
  let mesh = null, flowers = null, MAX = 0, R = 0, center = { x: 1e9, z: 1e9, s: null }, active = false;
  const tmpE = new T.Euler(), tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpS = new T.Vector3(), tmpP = new T.Vector3(), tmpC = new T.Color(), UP = new T.Vector3(0, 1, 0);
  function quality() { const S = L.S ? L.S() : {}; const q = S.gfx || S.quality || S.grafik || ''; if (L.isTouch) return 0.45; if (/niedrig|low/.test(q)) return 0.4; if (/ultra/.test(q)) return 1.25; return 1; }
  let tint = null, gy = 0; let far = null, MAXF = 0, RF = 0; const centerF = { x: 1e9, z: 1e9, t: 0 };
  function build() {
    const q = quality(); MAX = Math.round(24000 * q); R = 30 * Math.sqrt(q);
    // Fernbereich: bis ans Ende der Sicht (am Laptop weit, am Handy kürzer)
    MAXF = L.isTouch ? 9000 : Math.round(60000 * Math.min(1.2, q)); RF = L.isTouch ? 110 : q >= 1.2 ? 420 : q >= 1 ? 340 : 200;
    const mk = (n) => { const m = new T.InstancedMesh(bladeGeo(), grassMat(), n); m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.frustumCulled = false; m.count = 0; m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3); L.scene.add(m); return m; };
    mesh = mk(MAX); mesh.receiveShadow = true; far = mk(MAXF);
    flowers = new T.InstancedMesh(new T.SphereGeometry(0.05, 6, 4), new T.MeshLambertMaterial({ emissive: 0x111111 }), 1500); flowers.frustumCulled = false; flowers.count = 0; flowers.instanceColor = new T.InstancedBufferAttribute(new Float32Array(1500 * 3), 3); L.scene.add(flowers);
  }
  function setBlade(M, n, st, px, pz, k, gx, gz, hMul, wMul2) {
    const h = (st.h[0] + (st.h[1] - st.h[0]) * rnd(gx, k, gz)) * hMul, w = (0.8 + rnd(k, gz, gx) * 0.7) * wMul2;
    tmpQ.setFromAxisAngle(UP, rnd(gx, gz, k + 31) * 6.283); if (st.tilt) { tmpE.set((rnd(k, gx, gz + 9) - 0.5) * st.tilt * 2, rnd(gx, gz, k + 31) * 6.283, (rnd(gz, k, gx + 4) - 0.5) * st.tilt * 2); tmpQ.setFromEuler(tmpE); }
    tmpP.set(px, gy, pz); tmpS.set(w * (st.wMul || 1), h, w * (st.wMul || 1)); tmpM.compose(tmpP, tmpQ, tmpS); M.setMatrixAt(n, tmpM);
    const t = rnd(gz, k, gx + 5); const a = st.c[0], b = st.c[1], c = st.c[2]; const u = t < 0.5 ? t * 2 : (t - 0.5) * 2, from = t < 0.5 ? a : b, to = t < 0.5 ? b : c;
    tmpC.setRGB(from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u);
    if (tint) { const k2 = 0.55; tmpC.r += (tint.r * 1.15 - tmpC.r) * k2; tmpC.g += (tint.g * 1.15 - tmpC.g) * k2; tmpC.b += (tint.b * 1.15 - tmpC.b) * k2; }
    tmpC.multiplyScalar(st.glow ? 2.6 : 1.7); M.setColorAt(n, tmpC);
    return h;
  }
  function refill(cx, cz) {
    let n = 0, fN = 0; const r2 = R * R, x0 = Math.floor(cx - R), x1 = Math.ceil(cx + R), z0 = Math.floor(cz - R), z1 = Math.ceil(cz + R);
    for (let gx = x0; gx <= x1 && n < MAX; gx++) for (let gz = z0; gz <= z1 && n < MAX; gz++) {
      const dx = gx + 0.5 - cx, dz = gz + 0.5 - cz, dd = dx * dx + dz * dz; if (dd > r2) continue;
      const ok = okCell(gx, gz); if (!ok) continue;
      const st = styleAt(gx + 0.5, gz + 0.5); if (!st) continue;
      const fall = 1 - Math.min(1, Math.sqrt(dd) / R) * 0.55;
      let cnt = st.d * fall * ok;
      tint = null; if (st === ST.home && L.zoneColor) { L.zoneColor(gx + 0.5, gz + 0.5, zc); tint = zc; }
      gy = L.mountainH ? L.mountainH(gx + 0.5, gz + 0.5) : 0; const fr = cnt - Math.floor(cnt); cnt = Math.floor(cnt) + (rnd(gx, gz, 99) < fr ? 1 : 0);
      if (st.tuft && rnd(gx, gz, 7) > 0.25) cnt = 0; else if (st.tuft) cnt = Math.max(cnt, 5);
      for (let k = 0; k < cnt && n < MAX; k++) {
        const px = gx + (st.tuft ? 0.5 + (rnd(gx, gz, k) - 0.5) * 0.35 : rnd(gx, gz, k)), pz = gz + (st.tuft ? 0.5 + (rnd(gz, gx, k + 7) - 0.5) * 0.35 : rnd(gz, gx, k + 11));
        const h = setBlade(mesh, n, st, px, pz, k, gx, gz, 1, 1); n++;
        if (st.fl && fN < 1500 && rnd(gx, gz, k + 51) < st.flP) { tmpS.set(1, 1, 1); tmpP.set(px, gy + h * 0.92, pz); tmpM.compose(tmpP, tmpQ, tmpS); flowers.setMatrixAt(fN, tmpM); tmpC.setHex(st.fl[Math.floor(rnd(gx, k, gz + 3) * st.fl.length)]); flowers.setColorAt(fN, tmpC); fN++; }
      }
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    flowers.count = fN; flowers.instanceMatrix.needsUpdate = true; if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  }
  // Fernbereich: größere, lockerere Halme in 3-m-Zellen, damit die Wiese bis zum Horizont geht
  function refillFar(cx, cz, rIn) {
    let n = 0; const C = 3, ri2 = Math.max(0, rIn - 3) ** 2, ro2 = RF * RF, x0 = Math.floor((cx - RF) / C), x1 = Math.ceil((cx + RF) / C), z0 = Math.floor((cz - RF) / C), z1 = Math.ceil((cz + RF) / C);
    for (let ix = x0; ix <= x1 && n < MAXF; ix++) for (let iz = z0; iz <= z1 && n < MAXF; iz++) {
      const gx = ix * C, gz = iz * C, dx = gx + 1.5 - cx, dz = gz + 1.5 - cz, dd = dx * dx + dz * dz; if (dd > ro2 || dd < ri2) continue;
      const ok = okCell(gx + 1, gz + 1); if (!ok) continue;
      const st = styleAt(gx + 1.5, gz + 1.5); if (!st) continue;
      const fall = 1 - Math.sqrt(dd) / RF * 0.6;
      let cnt = st.d * 0.55 * fall * ok;
      tint = null; if (st === ST.home && L.zoneColor) { L.zoneColor(gx + 1.5, gz + 1.5, zc); tint = zc; }
      gy = L.mountainH ? L.mountainH(gx + 1.5, gz + 1.5) : 0; const fr = cnt - Math.floor(cnt); cnt = Math.floor(cnt) + (rnd(ix, iz, 97) < fr ? 1 : 0);
      if (st.tuft) cnt = rnd(ix, iz, 7) < 0.3 ? 2 : 0;
      for (let k = 0; k < cnt && n < MAXF; k++) setBlade(far, n++, st, gx + rnd(ix, iz, k) * C, gz + rnd(iz, ix, k + 11) * C, k, ix, iz, 1.35, 2.6);
    }
    far.count = n; far.instanceMatrix.needsUpdate = true; if (far.instanceColor) far.instanceColor.needsUpdate = true;
  }
  const oue = L.updateEnv;
  L.updateEnv = function (dt, cam, focus, paused) {
    oue.apply(this, arguments);
    try {
      const on = L.state === 'game' && cam && (!L.S || L.S().grass !== false);
      if (!on) { if (mesh) { mesh.visible = far.visible = flowers.visible = false; } return; }
      if (!mesh) build();
      U.uTime.value += (dt || 0.016); const E = L.env || {}; U.uWind.value = (/sturm|gewitter/.test(E.weather || '') ? 2.4 : /regen|schauer/.test(E.weather || '') ? 1.5 : 1) * ((styleAt(cam.position.x, cam.position.z) || ST.home).wind || 1);
      U.uPlayer.value.set(P.x || 0, P.y || 0, P.z || 0);
      const cx = cam.position.x, cz = cam.position.z, alt = cam.position.y;
      // beim Fliegen: nahe Halme ab 35 m Höhe weglassen (zu klein), die Wiese aus der Ferne bleibt bis 260 m Höhe
      const nearOn = alt < 35, farOn = alt < 260;
      mesh.visible = flowers.visible = nearOn; far.visible = farOn;
      if (nearOn && Math.hypot(cx - center.x, cz - center.z) > R * 0.22) { center.x = cx; center.z = cz; refill(cx, cz); }
      const now = performance.now();
      if (farOn && ((Math.hypot(cx - centerF.x, cz - centerF.z) > (alt > 35 ? 45 : 24) && now - centerF.t > 280) || centerF.near !== nearOn)) { centerF.x = cx; centerF.z = cz; centerF.t = now; centerF.near = nearOn; refillFar(cx, cz, nearOn ? R : 0); }
    } catch (e) { /* Gras ist nur Deko */ }
  };
  // bei neuer Runde Zwischenspeicher leeren (Häuser/Kisten können sich geändert haben)
  const osr = L.startRound;
  if (osr) L.startRound = function () { cache.clear(); center.x = 1e9; centerF.x = 1e9; return osr.apply(this, arguments); };
  L.grassRefresh = () => { cache.clear(); center.x = 1e9; centerF.x = 1e9; };
})();
