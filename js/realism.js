'use strict';
// Realistische Grafik (nur Grafik „Ultra“/„Hoch“ am PC): Film-Farbgebung (ACES), weiche Schatten, Himmels-Spiegelungen,
// physikalische Materialien (PBR) mit feiner Oberflächenstruktur für Kleidung, Haut, Stein und Metall. Figuren bleiben im gleichen Stil.
(function () {
  const L = window.L, T = THREE;
  const on = () => !L.isTouch && L.S && ['ultra', 'hoch'].includes(L.S().grafik);
  let env = null, bump = null, active = false, scanT = 0;
  const conv = new WeakMap();
  function makeBump() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), d = g.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const i = (y * 128 + x) * 4, weave = (Math.sin(x * 0.8) + Math.sin(y * 0.8)) * 18, n = 128 + weave + (Math.random() - 0.5) * 50; d.data[i] = d.data[i + 1] = d.data[i + 2] = n; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3); return t;
  }
  function makeEnv(r) {
    const s = new T.Scene(), c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#9ec4ef'); gr.addColorStop(0.48, '#dfe8f2'); gr.addColorStop(0.52, '#8a8070'); gr.addColorStop(1, '#3a342c'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
    s.add(new T.Mesh(new T.SphereGeometry(10, 32, 16), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), side: T.BackSide })));
    const pm = new T.PMREMGenerator(r); const rt = pm.fromScene(s, 0.04); pm.dispose(); return rt.texture;
  }
  function convert(m, mesh) {
    if (!m || m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isShaderMaterial || m.isPointsMaterial || m.isSpriteMaterial || m.isLineBasicMaterial) return m;
    if (!m.isMeshLambertMaterial && !m.isMeshPhongMaterial) return m;
    let n = conv.get(m); if (n) return n;
    const metalish = m.isMeshPhongMaterial && m.shininess > 60;
    n = new T.MeshStandardMaterial({ color: m.color, map: m.map || null, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap || null,
      transparent: m.transparent, opacity: m.opacity, side: m.side, alphaTest: m.alphaTest, depthWrite: m.depthWrite, vertexColors: m.vertexColors, fog: m.fog,
      roughness: metalish ? 0.3 : m.transparent ? 0.15 : 0.82, metalness: metalish ? 0.6 : 0.02, envMapIntensity: 0.28 });
    if (!m.map && !m.transparent) { n.bumpMap = bump; n.bumpScale = 0.012; }
    n.name = m.name; conv.set(m, n); return n;
  }
  function scan() {
    L.scene.traverse((o) => {
      if (!o.isMesh || o.userData.noReal) return;
      if (Array.isArray(o.material)) o.material = o.material.map((m) => convert(m, o)); else o.material = convert(o.material, o);
    });
  }
  // neue Materialien direkt realistisch erzeugen
  const omat = L.mat;
  L.mat = function (color, o) { const m = omat(color, o); return active ? convert(m) : m; };
  L.updateRealism = function (dt) {
    const want = on(), r = L.renderer; if (!r || !L.scene) return;
    if (want && !active) {
      active = true; bump = bump || makeBump(); env = env || makeEnv(r);
      r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.82; r.shadowMap.type = T.PCFSoftShadowMap; r.shadowMap.needsUpdate = true;
      L.scene.environment = env; scan();
    } else if (!want && active) { active = false; r.toneMapping = T.NoToneMapping; L.scene.environment = null; }
    if (active && (scanT -= dt) <= 0) { scanT = 2; scan(); }
  };
  setInterval(() => { if (L.state !== 'game') L.updateRealism(0.5); }, 500);
})();
