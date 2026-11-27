'use strict';
// Masiks Schutz: wer Pushas 6 Fragen richtig beantwortet, nimmt in DIESER Runde keinen Schaden mehr und bekommt
// das „Auge des Agamotto“ – einen mächtigeren Zeitstein: Zeit anhalten, zurückspulen (heilen), grüne Zauberkreise.
(function () {
  const L = window.L, T = THREE, P = L.player, GOAL = 100;
  const has = () => !!L._massigRound; // gilt nur für die aktuelle Runde
  L.massigProgress = () => Math.min(GOAL, (L.save && L.save.massigKills) || 0);
  L.onMonsterKill = function () { /* Schutz gibt es jetzt nur noch über Pushas Fragen */ };
  function unlock() {
    L._massigRound = true;
    L.banner('🐈‍⬛ MASIKS SCHUTZ', 'Für diese Runde: kein Schaden – und das Auge des Agamotto!');
    L.tn && L.tn({ f: 300, fTo: 1200, dur: 1.2, type: 'triangle', vol: 0.25 });
    giveEye(); ring(P.x, (P.y || 0) + 1.2, P.z, 6, 1.2, true);
  }
  // ---------- Auge des Agamotto ----------
  L.ITEMS.agamotto = { name: 'Auge des Agamotto (Zeitstein)', slot: 'waffe', icon: '🟢', dmg: 0, rate: 1, noise: 40, range: 80, ammo: null, mag: 1, spread: 0, energy: true, agamotto: true };
  function giveEye() {
    if (!P.hot) return; if (P.hot.some((h) => h && h.type === 'agamotto')) return;
    let i = P.hot.findIndex((h) => !h); if (i < 0) i = P.hot.length - 1; P.hot[i] = { type: 'agamotto', count: 1, mag: 1 };
    setTimeout(() => L.msg('🟢 Auge des Agamotto auf Taste ' + (i + 1) + ' – Schuss: Zeit anhalten · alle Gegner frieren ein, du wirst geheilt', 6000), 1500);
  }
  L.grantMassig = unlock;
  const ohs = L.heroStart; L.heroStart = function () { L._massigRound = false; if (ohs) ohs(); }; // jede Runde neu bei Pusha beantworten
  // Zauberkreis-Textur (grüne Runen wie Doctor Strange)
  let rTex = null;
  function runeTex() {
    if (rTex) return rTex; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.translate(128, 128);
    g.strokeStyle = '#7dffa0'; g.shadowColor = '#40ff80'; g.shadowBlur = 8;
    for (const [r, w] of [[120, 4], [104, 2], [70, 3], [40, 2]]) { g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke(); }
    g.lineWidth = 2; for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + k * Math.PI / 4; g.lineTo(Math.cos(a) * 104, Math.sin(a) * 104); } g.closePath(); g.stroke(); }
    g.font = 'bold 13px serif'; g.fillStyle = '#9dffb8'; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; g.save(); g.rotate(a); g.fillText('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'[i % 24], -4, -108); g.restore(); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.beginPath(); g.arc(Math.cos(a) * 87, Math.sin(a) * 87, 9, 0, 6.283); g.stroke(); }
    rTex = new T.CanvasTexture(c); return rTex;
  }
  const rings = [];
  function ring(x, y, z, size, life, flat, follow) {
    const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: runeTex(), transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    m.scale.setScalar(size); m.position.set(x, y, z); if (flat) m.rotation.x = -Math.PI / 2; L.scene.add(m); rings.push({ m, t: 0, life, spin: (Math.random() < 0.5 ? -1 : 1) * 1.5, follow, size });
  }
  const owf = L.weaponFire;
  let cdUntil = 0, freezeT = 0, frozen = [];
  L.weaponFire = function (w, d) {
    if (!d || !d.agamotto) return owf(w, d);
    const now = performance.now() / 1000; P.fireCd = 0.6;
    if (now < cdUntil) { L.msg('🟢 Das Auge lädt noch ' + Math.ceil(cdUntil - now) + ' s', 900); return true; }
    cdUntil = now + 14;
    // Zauberkreise an den Händen + großer Kreis am Boden
    const fx = Math.sin(P.camYaw), fz = Math.cos(P.camYaw), y = (P.y || 0) + 1.3;
    for (const sd of [-1, 1]) ring(P.x + fx * 0.8 + fz * sd * 0.4, y, P.z + fz * 0.8 - fx * sd * 0.4, 1.1, 8, false, { side: sd });
    ring(P.x, (P.y || 0) + 0.05, P.z, 14, 8, true); ring(P.x, (P.y || 0) + 30, P.z, 60, 8, true);
    // Zeit anhalten: alle Gegner in der Nähe frieren ein
    frozen = []; for (const e of (L._targets ? L._targets() : [])) { if (e.dead || Math.hypot(e.x - P.x, e.z - P.z) > 80 + (e.bigR || 0)) continue; e.stunT = Math.max(e.stunT || 0, 8); frozen.push({ e, x: e.x, z: e.z }); try { L.damageEnt(e, 150, P.x, P.z, P); } catch (x) { /* egal */ } }
    freezeT = 8;
    // Zeit zurückspulen: du wirst geheilt
    P.hp = 100; P.food = Math.max(P.food || 0, 80); P.water = Math.max(P.water || 0, 80);
    L.banner('🟢 ZEIT ANGEHALTEN', frozen.length + ' Gegner eingefroren – du bist geheilt.');
    L.tn && L.tn({ f: 900, fTo: 120, dur: 1.4, type: 'sine', vol: 0.25 }); L.tn && L.tn({ f: 1800, fTo: 600, dur: 1, type: 'triangle', vol: 0.12, delay: 0.1 });
    L.fovKick = 8; L.shake = Math.max(L.shake, 0.4);
    tint(true); setTimeout(() => tint(false), 8000);
    return true;
  };
  let tintEl = null; function tint(on) { if (!tintEl) { tintEl = document.createElement('div'); tintEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:11;background:radial-gradient(circle,rgba(40,255,120,0) 40%,rgba(40,255,120,.22));transition:opacity .6s;opacity:0'; document.body.appendChild(tintEl); } tintEl.style.opacity = on ? '1' : '0'; }
  // Kein Schaden mit Masiks Schutz
  const ohp = L.hurtPlayer;
  let shieldT = 0;
  L.hurtPlayer = function (dmg, why) {
    if (has() && P.alive) { const now = performance.now(); if (now - shieldT > 600) { shieldT = now; ring(P.x, (P.y || 0) + 1.1, P.z, 2.2, 0.5, false); } return; }
    return ohp(dmg, why);
  };
  // Geist-Masik schwebt über dir
  let spirit = null;
  L.updateMasik = function (dt) {
    for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; r.m.rotation.z += dt * r.spin; if (r.follow) { const fx = Math.sin(P.camYaw), fz = Math.cos(P.camYaw); r.m.position.set(P.x + fx * 0.8 + fz * r.follow.side * 0.4, (P.y || 0) + 1.3, P.z + fz * 0.8 - fx * r.follow.side * 0.4); r.m.lookAt(P.x + fx * 10, (P.y || 0) + 1.3, P.z + fz * 10); }
      const k = r.t / r.life; r.m.material.opacity = 0.95 * (k < 0.85 ? 1 : (1 - k) / 0.15); if (k >= 1) { L.scene.remove(r.m); r.m.geometry.dispose(); rings.splice(i, 1); } }
    if (freezeT > 0) { freezeT -= dt; for (const f of frozen) { if (f.e.dead) continue; f.e.x = f.x; f.e.z = f.z; f.e.stunT = Math.max(f.e.stunT || 0, 0.3); } if (freezeT <= 0) frozen = []; }
    if (!has() || L.state !== 'game') { if (spirit) spirit.g.visible = false; return; }
    if (!spirit && L.buildMasik) { spirit = L.buildMasik(); spirit.cape.visible = true; spirit.horns.visible = true; spirit.g.scale.setScalar(0.7); spirit.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.85; } }); L.scene.add(spirit.g); }
    if (spirit) { const t = performance.now() / 1000; spirit.g.visible = !P.vehicle; spirit.g.position.set(P.x + Math.cos(P.camYaw) * 0.9, (P.y || 0) + 2.6 + Math.sin(t * 2) * 0.12, P.z - Math.sin(P.camYaw) * 0.9); spirit.g.rotation.y = P.camYaw; spirit.cape.rotation.x = 1.3 + Math.sin(t * 4) * 0.1; spirit.tail.rotation.x = Math.sin(t * 2) * 0.3; }
  };
})();
