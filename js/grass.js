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
    vulkan: { d: 0.35, h: [0.15, 0.35], c: [[0.12, 0.1, 0.08], [0.28, 0.22, 0.16], [0.4, 0.3, 0.2]], wind: 0.5, tuft: true }
  };
  function styleAt(x, z) {
    const w = L.worldOf ? L.worldOf(x, z) : 'home';
    if (w === 'home') return ST.home;
    if (w === 'fairy') return ST.fairy;
    if (w === 'back' || w === 'jupiter' || w === 'titan' || w === 'moon' || w === 'dim') return null;
    return ST[w] || null;
  }
  // Gültige Stelle? (Land, keine Straße, kein See, kein Haus/Fels, nicht zu steil) – pro 1-m-Zelle zwischengespeichert
  const cache = new Map();
  function okCell(cx, cz) {
    const k = cx * 100003 + cz; let v = cache.get(k); if (v !== undefined) return v;
    v = 0; const x = cx + 0.5, z = cz + 0.5;
    try {
      const st = styleAt(x, z);
      if (st && (x > 40000 || L.seaFloor(x, z) === 0) && !(L.onRoad && L.onRoad(x, z))) {
        const lk = L.lake; const inLake = lk && x > lk.x1 - 1 && x < lk.x2 + 1 && z > lk.z1 - 1 && z < lk.z2 + 1;
        const mh = L.mountainH ? L.mountainH(x, z) : 0;
        if (!inLake && mh < 2.5 && !(L.queryBoxes && L.queryBoxes(x, z, 0.9).some((b) => (b.y0 || 0) < 1.5))) v = 1;
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
  const tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpS = new T.Vector3(), tmpP = new T.Vector3(), tmpC = new T.Color(), UP = new T.Vector3(0, 1, 0);
  function quality() { const S = L.S ? L.S() : {}; const q = S.gfx || S.quality || S.grafik || ''; if (L.isTouch) return 0.45; if (/niedrig|low/.test(q)) return 0.4; if (/ultra/.test(q)) return 1.25; return 1; }
  function build() {
    const q = quality(); MAX = Math.round(24000 * q); R = 30 * Math.sqrt(q);
    mesh = new T.InstancedMesh(bladeGeo(), grassMat(), MAX); mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0; mesh.receiveShadow = true;
    mesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    L.scene.add(mesh);
    flowers = new T.InstancedMesh(new T.SphereGeometry(0.05, 6, 4), new T.MeshLambertMaterial({ emissive: 0x111111 }), 1500); flowers.frustumCulled = false; flowers.count = 0; flowers.instanceColor = new T.InstancedBufferAttribute(new Float32Array(1500 * 3), 3); L.scene.add(flowers);
  }
  function refill(cx, cz) {
    let n = 0, fN = 0; const r2 = R * R, x0 = Math.floor(cx - R), x1 = Math.ceil(cx + R), z0 = Math.floor(cz - R), z1 = Math.ceil(cz + R);
    for (let gx = x0; gx <= x1 && n < MAX; gx++) for (let gz = z0; gz <= z1 && n < MAX; gz++) {
      const dx = gx + 0.5 - cx, dz = gz + 0.5 - cz, dd = dx * dx + dz * dz; if (dd > r2) continue;
      if (!okCell(gx, gz)) continue;
      const st = styleAt(gx + 0.5, gz + 0.5); if (!st) continue;
      // nach außen dünner, damit die Menge reicht
      const fall = 1 - Math.min(1, Math.sqrt(dd) / R) * 0.55;
      let cnt = st.d * fall; const fr = cnt - Math.floor(cnt); cnt = Math.floor(cnt) + (rnd(gx, gz, 99) < fr ? 1 : 0);
      if (st.tuft && rnd(gx, gz, 7) > 0.25) cnt = 0; else if (st.tuft) cnt = Math.max(cnt, 5);
      for (let k = 0; k < cnt && n < MAX; k++) {
        const px = gx + (st.tuft ? 0.5 + (rnd(gx, gz, k) - 0.5) * 0.35 : rnd(gx, gz, k)), pz = gz + (st.tuft ? 0.5 + (rnd(gz, gx, k + 7) - 0.5) * 0.35 : rnd(gz, gx, k + 11));
        const h = st.h[0] + (st.h[1] - st.h[0]) * rnd(gx, k, gz), w = 0.8 + rnd(k, gz, gx) * 0.7;
        tmpQ.setFromAxisAngle(UP, rnd(gx, gz, k + 31) * 6.283); tmpP.set(px, 0, pz); tmpS.set(w, h, w); tmpM.compose(tmpP, tmpQ, tmpS); mesh.setMatrixAt(n, tmpM);
        const t = rnd(gz, k, gx + 5); const a = st.c[0], b = st.c[1], c = st.c[2]; const u = t < 0.5 ? t * 2 : (t - 0.5) * 2, from = t < 0.5 ? a : b, to = t < 0.5 ? b : c;
        tmpC.setRGB(from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u).multiplyScalar(1.7); mesh.setColorAt(n, tmpC); n++;
        if (st.fl && fN < 1500 && rnd(gx, gz, k + 51) < st.flP) { tmpS.set(1, 1, 1); tmpP.set(px, h * 0.92, pz); tmpM.compose(tmpP, tmpQ, tmpS); flowers.setMatrixAt(fN, tmpM); tmpC.setHex(st.fl[Math.floor(rnd(gx, k, gz + 3) * st.fl.length)]); flowers.setColorAt(fN, tmpC); fN++; }
      }
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    flowers.count = fN; flowers.instanceMatrix.needsUpdate = true; if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  }
  const oue = L.updateEnv;
  L.updateEnv = function (dt, cam, focus, paused) {
    oue.apply(this, arguments);
    try {
      const on = L.state === 'game' && cam && (!L.S || L.S().grass !== false);
      if (!on) { if (mesh) { mesh.visible = false; flowers.visible = false; } return; }
      if (!mesh) build();
      mesh.visible = flowers.visible = true;
      U.uTime.value += (dt || 0.016); const E = L.env || {}; U.uWind.value = (/sturm|gewitter/.test(E.weather || '') ? 2.4 : /regen|schauer/.test(E.weather || '') ? 1.5 : 1) * ((styleAt(cam.position.x, cam.position.z) || ST.home).wind || 1);
      U.uPlayer.value.set(P.x || 0, P.y || 0, P.z || 0);
      const cx = cam.position.x, cz = cam.position.z, high = cam.position.y - (P.y || 0) > 60;
      if (high) { mesh.visible = flowers.visible = false; return; }
      if (Math.hypot(cx - center.x, cz - center.z) > R * 0.22) { center.x = cx; center.z = cz; refill(cx, cz); }
    } catch (e) { /* Gras ist nur Deko */ }
  };
  // bei neuer Runde Zwischenspeicher leeren (Häuser/Kisten können sich geändert haben)
  const osr = L.startRound;
  if (osr) L.startRound = function () { cache.clear(); center.x = 1e9; return osr.apply(this, arguments); };
  L.grassRefresh = () => { cache.clear(); center.x = 1e9; };
})();
