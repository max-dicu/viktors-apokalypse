'use strict';
// Bau – ein kleines, rundes, lila Monster (eigener Entwurf): Tupfen, zwei Hörnchen, riesige Kulleraugen,
// ein breites Grinsen voller Zähne und lange, dünne Arme mit dunklen Krallen. Schnell, kichernd, nervig.
(function () {
  const L = window.L, T = THREE;
  const G = () => L.GEO;
  function part(geo, color, sx, sy, sz, x, y, z, parent, o) { const m = new T.Mesh(geo, L.mat(color, o)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = !(o && o.noShadow); if (parent) parent.add(m); return m; }
  const grp = (parent, x, y, z) => { const g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(g); return g; };
  const glow = { basic: true, noShadow: true };
  function limb(parent, x, y, z, w, l1, l2, color, color2, foot) {
    const a = grp(parent, x, y, z); part(G().sph, color, w, l1 * 0.55, w, 0, -l1 / 2, 0, a);
    const b = grp(a, 0, -l1, 0); part(G().sph, color2 || color, w * 0.9, l2 * 0.55, w * 0.9, 0, -l2 / 2, 0, b);
    if (foot) part(G().sph, foot, w * 1.3, w * 0.6, w * 1.9, 0, -l2, w * 0.6, b);
    return { a, b };
  }
  const SK = '#a48ad8', LT = '#c6b2f2', DK = '#7a62b0', CLAW = '#2a2236', HORN = '#4a3470';
  L.buildBau = function () {
    const root = new T.Group(), body = grp(root), hipY = 0.3, hips = grp(body, 0, hipY, 0), sph = G().sph, box = G().box, cone = G().cone;
    const legs = [-1, 1].map((s) => limb(hips, s * 0.22, 0.05, 0, 0.12, 0.16, 0.14, SK, DK, DK));
    const torso = grp(hips);
    // runder Körper = Kopf (wie ein lila Ball)
    part(sph, SK, 0.62, 0.6, 0.58, 0, 0.55, 0, torso);
    // Tupfen: helle und dunkle Flecken auf der Haut
    let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let k = 0; k < 26; k++) {
      const u = rnd() * 1.6 - 0.6, a = rnd() * 6.283, c = Math.sqrt(1 - u * u), dx = c * Math.cos(a), dz = c * Math.sin(a);
      if (dz > 0.55 && u < 0.45 && u > -0.45) continue; // Gesicht frei lassen
      const r = 0.035 + rnd() * 0.05; part(sph, k % 3 ? LT : DK, r, r * 0.6, r, dx * 0.6, 0.55 + u * 0.58, dz * 0.56, torso).lookAt(dx * 3, 0.55 + u * 3, dz * 3);
    }
    // kleiner Kamm oben
    for (let k = 0; k < 3; k++) part(sph, LT, 0.07 - k * 0.012, 0.07 - k * 0.012, 0.07 - k * 0.012, 0, 1.13 - k * 0.04, 0.12 - k * 0.16, torso);
    // lange dünne Arme mit vier Fingern und dunklen Krallen
    const arms = [-1, 1].map((sd) => {
      const l = limb(torso, sd * 0.56, 0.62, 0.06, 0.075, 0.36, 0.34, SK, DK);
      const hand = grp(l.b, 0, -0.36, 0.02);
      for (let f = 0; f < 4; f++) {
        const fg = grp(hand, (f - 1.5) * 0.045, 0, 0); fg.rotation.z = (f - 1.5) * 0.18;
        part(sph, SK, 0.022, 0.09, 0.022, 0, -0.08, 0, fg);
        const cl = part(cone, CLAW, 0.022, 0.06, 0.022, 0, -0.19, 0.01, fg); cl.rotation.x = Math.PI;
      }
      return l;
    });
    // Gesicht (eigene Gruppe, damit es sich bewegen kann)
    const head = grp(torso, 0, 0.55, 0);
    for (const sd of [-1, 1]) {
      part(sph, '#f6f6fa', 0.15, 0.16, 0.12, sd * 0.18, 0.18, 0.5, head);                 // Augapfel
      part(sph, '#2f8ae8', 0.085, 0.09, 0.05, sd * 0.175, 0.17, 0.6, head);               // blaue Iris
      part(sph, '#0a0a12', 0.042, 0.045, 0.03, sd * 0.172, 0.17, 0.635, head);            // Pupille
      part(sph, '#ffffff', 0.016, 0.016, 0.01, sd * 0.15, 0.2, 0.655, head, glow);         // Glanzpunkt
      const brow = part(sph, DK, 0.13, 0.035, 0.05, sd * 0.19, 0.38, 0.5, head); brow.rotation.z = sd * -0.25;
      const horn = part(cone, HORN, 0.07, 0.24, 0.07, sd * 0.33, 0.52, -0.02, head); horn.rotation.set(-0.15, 0, sd * -0.55);
    }
    // breites Grinsen: dunkler Mund, obere und untere Zahnreihe, Zunge
    const mouth = part(sph, '#4a0e1e', 0.34, 0.15, 0.1, 0, -0.14, 0.5, head);
    for (let k = 0; k < 11; k++) {
      const x = -0.27 + k * 0.054, curve = (x * x) * 1.1;
      part(box, '#fbf8ef', 0.035, 0.05, 0.02, x, -0.04 - curve * 0.4, 0.585 - curve * 0.35, head);
      if (k % 2 === 0 && k > 1 && k < 9) part(box, '#fbf8ef', 0.03, 0.04, 0.02, x, -0.24 + curve * 0.4, 0.565 - curve * 0.35, head);
    }
    part(sph, '#e0607a', 0.13, 0.05, 0.06, 0, -0.2, 0.56, head);
    const r = { root, body, hips, torso, head, mouth, legs: legs.map((l) => ({ leg: l.a, knee: l.b })), arms: arms.map((l) => ({ arm: l.a, elbow: l.b })), hipY, kind: 'bau' };
    root.traverse((o) => { if (o.isMesh && o.castShadow !== false) o.castShadow = true; });
    return r;
  };
  // kichern
  const giggle = (p, vol) => { for (let i = 0; i < 4; i++) L.tn && L.tn({ f: 700 + i * 60 + Math.random() * 80, fTo: 1100 + i * 40, dur: 0.07, type: 'triangle', vol: vol, pos: p, delay: i * 0.09 }); };
  if (L.MK) L.MK.bau = {
    build: () => L.buildBau(), anim: (r, st) => { L.animBeast(r, st); const ph = st.phase || 0; r.torso.scale.set(1 + Math.sin(ph * 2) * 0.03, 1 - Math.sin(ph * 2) * 0.03, 1); r.mouth.scale.y = 0.15 * (st.mode === 'attack' || st.mode === 'run' ? 1.4 : 1); },
    spd: [2.6, 7.5, 11.5], hp: 70, r: 0.5, reach: 2.2, grab: 2, atk: 0.6, wind: 0.3, dmg: 22, veh: 20, knock: 8, up: 4, view: 240,
    cause: 'Bau hat dich angegrinst … und dann gebissen', voice: (p) => giggle(p, 0.14), idle: (p) => giggle(p, 0.06), hit: [[0.6, 0.6, 1], [0.95, 0.4, 2]],
  };
  // Karte: mit dem Admin-Skin siehst du alle Baus als lila Punkte
  const ome = L.mapExtra;
  L.mapExtra = function (g, toM, big) {
    if (ome) ome(g, toM, big);
    if (!(L.suitOn && L.suitOn()) || !L.ents) return;
    const P = L.player, w = L.worldOf ? L.worldOf(P.x, P.z) : 'home';
    for (const m of L.ents.monsters) {
      if (m.dead || m.kind !== 'bau') continue;
      if (L.worldOf && L.worldOf(m.x, m.z) !== w) continue;
      if (!big && (Math.abs(m.x - P.x) > 200 || Math.abs(m.z - P.z) > 200)) continue;
      const [x, y] = toM(m.x, m.z), r = big ? 5 : 3.5;
      g.fillStyle = '#1a0a2a'; g.beginPath(); g.arc(x, y, r + 1.5, 0, 6.283); g.fill();
      g.fillStyle = '#b48cff'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      if (big) { g.fillStyle = '#fff'; g.fillRect(x - 2, y - 1.5, 1.5, 1.5); g.fillRect(x + 0.5, y - 1.5, 1.5, 1.5); }
    }
  };
})();
