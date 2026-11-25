'use strict';
// Eigene Animation pro Skin in der Charakter-Vorschau (nicht für den eigenen Charakter und nicht für den Krücken-Skin).
(function () {
  const L = window.L;
  const cl = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { v = cl(v); return v * v * (3 - 2 * v); };
  function base(r) {
    if (r.arms) r.arms.forEach((a, i) => { a.arm.rotation.set(0, 0, (i ? 1 : -1) * 0.08); a.elbow.rotation.set(0, 0, 0); });
    if (r.legs) r.legs.forEach((l) => { l.leg.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); });
    if (r.torso) r.torso.rotation.set(0, 0, 0); if (r.head) r.head.rotation.set(0, 0, 0); if (r.body) r.body.position.y = 0;
  }
  const A = {
    // grüner Koloss: Arme hoch, Sprung, SMASH in den Boden
    h_koloss(r, p, R, Lf, root) { const up = ease(p / 1.1), jump = p > 1.1 && p < 1.7 ? Math.sin((p - 1.1) / 0.6 * Math.PI) : 0, smash = p >= 1.6 && p < 2.6 ? 1 - ease((p - 2.2) / 0.4) : 0;
      const ra = smash ? -0.8 : -2.9 * up; R.arm.rotation.x = Lf.arm.rotation.x = ra; R.elbow.rotation.x = Lf.elbow.rotation.x = smash ? 0 : -0.4 * up; root.position.y = jump * 0.6; if (r.torso) r.torso.rotation.x = smash * 0.55; if (r.legs) r.legs.forEach((l) => { l.leg.rotation.x = -smash * 0.7; l.knee.rotation.x = smash * 1.1; }); root.position.y -= smash * 0.18; },
    // Netzläufer: Hocke, Netz schießen, kleine Sprünge
    h_netz(r, p, R, Lf, root) { const sh = Math.sin(p * 3.14) ; R.arm.rotation.set(-1.5, 0, -0.2); R.elbow.rotation.x = 0; Lf.arm.rotation.x = -0.6; if (r.legs) r.legs.forEach((l) => { l.leg.rotation.x = -0.6; l.knee.rotation.x = 1.0; }); root.position.y = -0.2 + Math.max(0, sh) * 0.25; if (r.torso) r.torso.rotation.x = 0.3; R.arm.rotation.z = -0.2 + Math.sin(p * 12) * 0.05; },
    // Thor: Hammer hochreißen, Blitz-Pose
    h_thor(r, p, R, Lf) { const up = ease(p / 0.8) * (1 - ease((p - 3) / 0.6)); R.arm.rotation.x = -3 * up; R.arm.rotation.z = -0.1; Lf.arm.rotation.z = 0.4 * up; if (r.head) r.head.rotation.x = -0.35 * up; R.elbow.rotation.x = -0.1; },
    // Loki: Verbeugung, dann Zauber-Geste
    h_loki(r, p, R, Lf) { const bow = p < 1.6 ? Math.sin(p / 1.6 * Math.PI) : 0, mag = p > 1.8 ? Math.sin((p - 1.8) * 4) : 0; if (r.torso) r.torso.rotation.x = bow * 0.6; R.arm.rotation.set(-0.6 * bow - 1.2 * (p > 1.8 ? 1 : 0), 0, -0.6 * bow); Lf.arm.rotation.set(-1.2 * (p > 1.8 ? 1 : 0), 0, 0.5 + mag * 0.2); R.elbow.rotation.x = -1.2 * bow; },
    // Walross: Bauch wackeln und klatschen
    h_walross(r, p, R, Lf, root) { const c = Math.sin(p * 9); R.arm.rotation.set(-1.2, 0, -0.5 + c * 0.35); Lf.arm.rotation.set(-1.2, 0, 0.5 - c * 0.35); root.position.y = Math.abs(Math.sin(p * 4.5)) * 0.08; if (r.torso) r.torso.rotation.z = Math.sin(p * 4.5) * 0.08; },
    // Prinzessin: Drehung mit ausgebreiteten Armen, dann Knicks
    h_beyza(r, p, R, Lf, root) { const sp = p < 2 ? ease(p / 2) : 1; root.rotation.y = sp * 6.283; R.arm.rotation.z = -1.2 * (p < 2 ? Math.sin(p / 2 * Math.PI) : 0); Lf.arm.rotation.z = 1.2 * (p < 2 ? Math.sin(p / 2 * Math.PI) : 0); const k = p > 2.4 ? Math.sin((p - 2.4) / 1.2 * Math.PI) : 0; if (r.legs) { r.legs[1].leg.rotation.x = 0.4 * k; r.legs[1].knee.rotation.x = 0.6 * k; r.legs[0].knee.rotation.x = 0.4 * k; } root.position.y = -0.08 * k; if (r.head) r.head.rotation.x = 0.3 * k; },
    // Wächter: Wache, dann Axt-Hieb von oben
    waechter(r, p, R, Lf) { const up = p < 1.5 ? ease((p - 0.5)) : 0, hit = p >= 1.5 && p < 2.4 ? 1 : 0; R.arm.rotation.x = hit ? -0.4 : -3 * up; if (r.torso) r.torso.rotation.x = hit * 0.35; Lf.arm.rotation.set(-0.8, 0, 0.3); R.elbow.rotation.x = -0.2; },
    // Titan-Rüstung: Repulsor-Schüsse abwechselnd, leichtes Schweben
    titan(r, p, R, Lf, root) { const a = Math.floor(p * 1.5) % 2; R.arm.rotation.x = a ? -1.55 : -0.3; Lf.arm.rotation.x = a ? -0.3 : -1.55; R.elbow.rotation.x = Lf.elbow.rotation.x = 0; root.position.y = 0.12 + Math.sin(p * 3) * 0.05; },
    // Viktor: unheimliches Zucken, Kopf schief, Krabbel-Haltung
    viktor(r, p, R, Lf, root) { const tw = Math.sin(p * 37) * (Math.sin(p * 2.3) > 0.6 ? 0.25 : 0.02); if (r.head) { r.head.rotation.z = 0.5 + tw; r.head.rotation.x = 0.2; } R.arm.rotation.x = -0.9 + tw; Lf.arm.rotation.x = -0.7 - tw; if (r.torso) r.torso.rotation.x = 0.4; if (r.legs) r.legs.forEach((l) => { l.leg.rotation.x = -0.5; l.knee.rotation.x = 0.9; }); root.position.y = -0.15; },
    // Daniel: schwerer Stampfer + Brust trommeln
    daniel(r, p, R, Lf, root) { const st = Math.sin(p * 3.14); if (r.legs) r.legs[p % 2 < 1 ? 0 : 1].leg.rotation.x = -Math.max(0, st) * 0.7; R.arm.rotation.set(-1.4, 0, 0.6 + Math.sin(p * 14) * 0.15); Lf.arm.rotation.set(-1.4, 0, -0.6 - Math.sin(p * 14 + 1) * 0.15); R.elbow.rotation.x = Lf.elbow.rotation.x = -1.3; root.position.y = -Math.max(0, -st) * 0.04; },
    // Richard: Bizeps zeigen
    richard(r, p, R, Lf) { const f = ease(p / 0.6) * (1 - ease((p - 3.2) / 0.5)); R.arm.rotation.set(0, 0, -1.5 * f); Lf.arm.rotation.set(0, 0, 1.5 * f); R.elbow.rotation.x = Lf.elbow.rotation.x = -1.9 * f + Math.sin(p * 8) * 0.05 * f; if (r.torso) r.torso.rotation.x = -0.1 * f; },
    // Pinker Bär: winken und tanzen
    baer(r, p, R, Lf, root) { R.arm.rotation.set(-2.6, 0, -0.3 + Math.sin(p * 8) * 0.4); R.elbow.rotation.x = -0.4; Lf.arm.rotation.z = 0.3 + Math.sin(p * 4) * 0.2; root.position.y = Math.abs(Math.sin(p * 4)) * 0.1; if (r.torso) r.torso.rotation.z = Math.sin(p * 4) * 0.12; }
  };
  L.menuAnim = function (r, sp, t) {
    if (!r || !r.root || !sp || sp === 'h_marlon') return false;
    const f = A[sp]; if (!f || !r.arms || r.arms.length < 2) return false;
    base(r); r.root.position.y = 0; r.root.rotation.y = sp === 'h_beyza' ? 0 : Math.sin(t * 0.5) * 0.35;
    try { f(r, t % 4, r.arms[0], r.arms[1], r.root); } catch (e) { return false; }
    return true;
  };
})();
