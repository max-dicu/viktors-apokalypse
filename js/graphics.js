'use strict';
// Grafik-Qualität: Ultra / Hoch / Normal – Leuchten (Bloom), Auflösung, Schatten, Textur-Schärfe.
(function () {
  const L = window.L, T = THREE;
  const S = () => L.S();
  if (S().grafik === undefined) { S().grafik = L.isTouch ? 'normal' : 'ultra'; }
  const PRE = {
    ultra: { pr: 2, shadow: 4096, bloom: 0.75, aniso: 8 },
    hoch: { pr: 1.5, shadow: 2048, bloom: 0.5, aniso: 4 },
    normal: { pr: 1.15, shadow: 1024, bloom: 0, aniso: 1 }
  };
  let applied = null, composer = null, bloomPass = null, renderPass = null, anisoT = 0;
  const hasPost = () => !!(T.EffectComposer && T.RenderPass && T.UnrealBloomPass);
  function apply() {
    const q = PRE[S().grafik] || PRE.hoch, r = L.renderer; if (!r) return;
    applied = S().grafik;
    const dpr = window.devicePixelRatio || 1;
    r.setPixelRatio(Math.min(dpr, L.isTouch ? Math.min(q.pr, 1.5) : q.pr));
    r.setSize(window.innerWidth, window.innerHeight, false);
    const sun = L.env && L.env.sun;
    if (sun && sun.shadow && sun.shadow.mapSize.x !== q.shadow) { sun.shadow.mapSize.set(q.shadow, q.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    if (q.bloom > 0 && hasPost()) {
      if (!composer) {
        composer = new T.EffectComposer(r);
        renderPass = new T.RenderPass(L.scene, L.camera); composer.addPass(renderPass);
        bloomPass = new T.UnrealBloomPass(new T.Vector2(window.innerWidth, window.innerHeight), q.bloom, 0.55, 0.78); composer.addPass(bloomPass);
      }
      bloomPass.strength = q.bloom;
      composer.setPixelRatio ? composer.setPixelRatio(r.getPixelRatio()) : null;
      composer.setSize(window.innerWidth, window.innerHeight);
    }
    anisoT = 0;
  }
  addEventListener('resize', () => { if (composer) composer.setSize(window.innerWidth, window.innerHeight); });
  // schärfere Texturen aus schrägen Winkeln
  function sharpen() {
    const q = PRE[S().grafik] || PRE.hoch, max = Math.min(q.aniso, L.renderer.capabilities.getMaxAnisotropy ? L.renderer.capabilities.getMaxAnisotropy() : 1);
    if (max <= 1) return;
    L.scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m.map && m.map.anisotropy !== max && m.map.magFilter !== T.NearestFilter) { m.map.anisotropy = max; m.map.needsUpdate = true; } });
  }
  // statt renderer.render: mit Leuchten, wenn eingeschaltet
  L.renderFrame = function (scene, camera) {
    if (applied !== S().grafik) apply();
    anisoT -= 1 / 60; if (anisoT <= 0) { anisoT = 8; try { sharpen(); } catch (e) { /* egal */ } }
    const q = PRE[S().grafik] || PRE.hoch;
    if (q.bloom > 0 && composer && !L.underwater) { renderPass.scene = scene; renderPass.camera = camera; composer.render(); }
    else L.renderer.render(scene, camera);
  };
})();
