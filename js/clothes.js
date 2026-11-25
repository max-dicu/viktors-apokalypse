'use strict';
// Realistischere Kleidung für alle Figuren: Stoff-Struktur je nach Kleidungsstück (Strick, Jeans, Baumwolle, Leder, Anzug),
// Falten an Ellbogen/Knien/Bund und Nähte. Wird nach dem Bau jeder Figur angewendet.
(function () {
  const L = window.L, T = THREE;
  const texC = {};
  function tex(kind) {
    if (texC[kind]) return texC[kind];
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    const px = (x, y, a, dark) => { g.fillStyle = (dark ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + a + ')'; g.fillRect(x, y, 1, 1); };
    if (kind === 'denim') { for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const d = ((x + y) % 4 < 2); px(x, y, d ? 0.16 : 0.04, d); } for (let i = 0; i < 260; i++) px(Math.random() * 128 | 0, Math.random() * 128 | 0, 0.35, false); }
    else if (kind === 'knit') { for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.ellipse(x + 2, y + 2, 1.4, 2, 0.5 * ((x / 4) % 2 ? 1 : -1), 0, 6.3); g.fill(); } }
    else if (kind === 'leather') { for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.12).toFixed(2) + ')'; g.fillRect(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 3, 1); } }
    else if (kind === 'suit') { for (let x = 0; x < 128; x += 3) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(x, 0, 1, 128); } }
    else if (kind === 'puffer') { for (let y = 0; y < 128; y += 16) { const gr = g.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, 'rgba(0,0,0,0.25)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = gr; g.fillRect(0, y, 128, 16); } }
    else { for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) if ((x * 7 + y * 13) % 5 === 0) px(x, y, 0.06, true); for (let i = 0; i < 300; i++) px(Math.random() * 128 | 0, Math.random() * 128 | 0, 0.08, true); }
    // sanfte Stoff-Unregelmäßigkeit
    for (let i = 0; i < 18; i++) { const gr = g.createRadialGradient(Math.random() * 128, Math.random() * 128, 0, 64, 64, 90); gr.addColorStop(0, 'rgba(0,0,0,0.03)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(kind === 'denim' ? 3 : 2, kind === 'denim' ? 3 : 2); texC[kind] = t; return t;
  }
  const matC = {};
  function fabricMat(hex, kind) {
    const k = hex + kind; if (matC[k]) return matC[k];
    const shiny = kind === 'leather';
    const m = shiny ? new T.MeshStandardMaterial({ color: hex, map: tex(kind), roughness: 0.45, metalness: 0.1 }) : new T.MeshLambertMaterial({ color: hex, map: tex(kind) });
    matC[k] = m; return m;
  }
  const TOPK = { hoodie: 'knit', pullover: 'knit', trainingsjacke: 'cotton', lederjacke: 'leather', anzug: 'suit', mantel: 'suit', puffer: 'puffer', regenjacke: 'leather', weste: 'suit', flanell: 'cotton' };
  const PANTK = { jeans: 'denim', baggy: 'denim', skinny: 'denim', zerrissen: 'denim', schlag: 'denim', kurz: 'denim', anzughose: 'suit', latzhose: 'denim', jogging: 'knit' };
  const hexOf = (c) => { try { return new T.Color(c).getHex(); } catch (e) { return -1; } };
  const shade = (hex, f) => { const c = new T.Color(hex); c.multiplyScalar(f); return c.getHex(); };
  function biggest(group, hex) { let best = null; group.children.forEach((o) => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === hex && (!best || o.scale.y * o.scale.x > best.scale.y * best.scale.x)) best = o; }); return best; }
  function crease(par, ref, hex, ys, tilt) {
    if (!ref) return; const m = L.mat('#' + new T.Color(shade(hex, 0.72)).getHexString());
    ys.forEach((dy, i) => { const o = new T.Mesh(L.GEO.box, m); o.scale.set(ref.scale.x * 1.04, 0.009, ref.scale.z * 1.04); o.position.set(ref.position.x, ref.position.y + dy, ref.position.z); o.rotation.z = (i % 2 ? -1 : 1) * tilt; par.add(o); });
  }
  function seam(par, ref, hex, side) {
    if (!ref) return; const m = L.mat('#' + new T.Color(shade(hex, 0.6)).getHexString());
    const o = new T.Mesh(L.GEO.box, m); o.scale.set(0.006, ref.scale.y * 0.96, 0.006); o.position.set(ref.position.x + side * ref.scale.x * 0.505, ref.position.y, ref.position.z); par.add(o);
  }
  function dress(r) {
    const A = r.app || {}; if (!r.torso || !r.arms || !r.legs) return;
    const top = hexOf(A.topColor), pant = hexOf(A.pantsColor), skin = hexOf(A.skin);
    const tk = TOPK[A.top] || 'cotton', pk = PANTK[A.pants] || 'cotton';
    // Stoff-Struktur auf Oberteil und Hose (Kopf und Haut bleiben)
    const skip = new Set(); if (r.head) r.head.traverse((o) => skip.add(o));
    const apply = (root, hex, kind) => root.traverse((o) => { if (!o.isMesh || skip.has(o) || !o.material || !o.material.color || o.material.map || o.material.isMeshBasicMaterial) return; const h = o.material.color.getHex(); if (h === skin) return; if (h === hex) o.material = fabricMat(h, kind); });
    if (top >= 0 && top !== skin) { apply(r.torso, top, tk); r.arms.forEach((a) => apply(a.arm, top, tk)); }
    if (pant >= 0 && pant !== skin) { if (r.hips) r.hips.children.forEach((c) => { if (c.isMesh) apply(c, pant, pk); }); r.legs.forEach((l) => { apply(l.leg, pant, pk); apply(l.knee, pant, pk); }); }
    // Falten an den Ellbogen (lange Ärmel) und Knien, Nähte an der Hose
    r.arms.forEach((a) => { const ref = biggest(a.elbow, top); if (ref) crease(a.elbow, ref, top, [ref.scale.y * 0.42, ref.scale.y * 0.3], 0.12); const up = biggest(a.arm, top); if (up) crease(a.arm, up, top, [-up.scale.y * 0.42], 0.08); });
    r.legs.forEach((l, i) => { const k = biggest(l.knee, pant); if (k) { crease(l.knee, k, pant, [k.scale.y * 0.42, k.scale.y * 0.3, -k.scale.y * 0.45], 0.1); seam(l.knee, k, pant, i ? 1 : -1); } const th = biggest(l.leg, pant); if (th) { seam(l.leg, th, pant, i ? 1 : -1); crease(l.leg, th, pant, [th.scale.y * 0.35], 0.15); } });
    // Bund-Falten am Oberteil
    const tb = biggest(r.torso, top); if (tb && tk !== 'suit') crease(r.torso, tb, top, [-tb.scale.y * 0.43], 0.04);
  }
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    const r = obh(app, force);
    try { if (r && r.kind === 'human' && !(L.isTouch && L.S && L.S().quality === 'niedrig')) dress(r); } catch (e) { /* Kleidung bleibt einfach */ }
    return r;
  };
})();
