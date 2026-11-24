'use strict';
// 🪐 JUPITER-VORFALL 2011 – Mission nach dem Mond (erst nachdem man Bernhard überlebt/besiegt hat).
// Expedition mit Speedy und Big C (eigene Figuren). Gelbe Haustürschlüssel mit geschmolzenen Gesichtern jagen euch und kreischen.
// Ein Wegweiser zeigt den Schlüssel-Schmelzer – damit vernichtest du sie. 25 erledigt = Mission geschafft, Rakete zurück zur Erde.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const J = { x: 86000, z: 0, r: 1050 }, GOAL = 25;
  L.inJupiter = (x, z) => x > 84300 && x < 87700 && Math.abs(z || 0) < 4000;
  L.inSpecialWorld = (x, z) => !!((L.inFairy && L.inFairy(x, z)) || L.inJupiter(x, z));
  setTimeout(() => { const od = L.dimLand; L.dimLand = (x, z) => (L.inJupiter(x, z) ? Math.hypot(x - J.x, z - J.z) < J.r : od ? od(x, z) : false); }, 0);
  const PAD = { x: J.x - 700, z: J.z + 150 };
  const M = { on: false, kills: 0, done: false, weapon: null, keys: [], comp: [], built: null, trip: null, spawnT: 0, talkT: 0 };
  L._jup = M;
  L.jupiterUnlocked = () => !!(L.save && L.save.jupiter);
  L.unlockJupiter = function () { if (L.save.jupiter) return; L.save.jupiter = true; L.persist(); setTimeout(() => L.banner('🔓 NEUE MISSION FREIGESCHALTET', '🪐 Jupiter-Vorfall 2011 – an der Rakete auf dem Mond wählbar.'), 2500); };
  // ---------- Welt ----------
  function cv(w, h, fn, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); } return t; }
  function build() {
    const g = new T.Group(); L.scene.add(g);
    const bands = cv(64, 512, (c, w, h) => { const C = ['#c88a52', '#e8c89a', '#a8643a', '#f0dcb8', '#b87848', '#d8a870', '#8a4a2a']; for (let y = 0; y < h; y += 8) { c.fillStyle = C[Math.floor(Math.abs(Math.sin(y * 0.03)) * C.length)]; c.fillRect(0, y, w, 8 + Math.random() * 6); } for (let i = 0; i < 600; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.12).toFixed(2) + ')'; c.fillRect(Math.random() * w, Math.random() * h, 6, 2); } }, 6);
    const ground = new T.Mesh(new T.CylinderGeometry(J.r, J.r * 0.9, 40, 80), [L.mat('#7a4a2a'), new T.MeshLambertMaterial({ map: bands }), L.mat('#5a3420')]); ground.position.set(J.x, -20.02, J.z); g.add(ground);
    // Ammoniak-Eis und Felsen
    for (let i = 0; i < 260; i++) { const a = Math.random() * 6.283, d = 60 + Math.sqrt(Math.random()) * (J.r - 100), x = J.x + Math.sin(a) * d, z = J.z + Math.cos(a) * d; if (Math.hypot(x - PAD.x, z - PAD.z) < 40) continue; const ice = Math.random() < 0.4, s = 2 + Math.random() * 6; const m = new T.Mesh(ice ? new T.OctahedronGeometry(1) : new T.DodecahedronGeometry(1), ice ? new T.MeshLambertMaterial({ color: 0xe8f0ff, emissive: 0x405870, transparent: true, opacity: 0.85 }) : L.mat(i % 2 ? '#6a3a22' : '#8a5a3a')); m.scale.set(s, s * (ice ? 2.2 : 1), s); m.position.set(x, s * (ice ? 1.6 : 0.6), z); m.rotation.set(Math.random(), Math.random() * 3, 0); g.add(m); L.addBox(x - s * 0.7, z - s * 0.7, x + s * 0.7, z + s * 0.7, s * 1.6, 'building'); }
    // Landeplatz
    const pad = new T.Mesh(new T.CylinderGeometry(16, 16, 0.4, 32), L.mat('#888a90')); pad.position.set(PAD.x, 0.2, PAD.z); g.add(pad);
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, l = new T.Mesh(L.GEO.box, new T.MeshBasicMaterial({ color: 0xffd040 })); l.scale.set(0.6, 0.2, 0.6); l.position.set(PAD.x + Math.sin(a) * 15, 0.5, PAD.z + Math.cos(a) * 15); g.add(l); }
    const rk = rocket(); rk.position.set(PAD.x, 0, PAD.z); g.add(rk);
    // Himmel: Großer Roter Fleck, Monde, Blitze
    const sky = new T.Group(); g.add(sky);
    const spot = new T.Mesh(new T.CircleGeometry(900, 48), new T.MeshBasicMaterial({ map: cv(256, 256, (c) => { for (let r = 128; r > 0; r -= 6) { c.fillStyle = r % 12 ? '#c04a2a' : '#e8a070'; c.beginPath(); c.ellipse(128, 128, r, r * 0.6, 0, 0, 6.3); c.fill(); } }), transparent: true, opacity: 0.9, fog: false, side: T.DoubleSide }));
    spot.position.set(J.x + 800, 1400, J.z - 2600); spot.lookAt(J.x, 0, J.z); sky.add(spot);
    for (const [c, s, x, y] of [['#f0e0a0', 180, -2200, 900], ['#d8c8b8', 120, 1800, 1500], ['#a0a8b8', 90, -900, 1800]]) { const m = new T.Mesh(new T.SphereGeometry(s, 24, 16), new T.MeshBasicMaterial({ color: c, fog: false })); m.position.set(J.x + x, y, J.z - 3200); sky.add(m); }
    sky.traverse((o) => { o.frustumCulled = false; });
    const lightC = new T.PointLight(0xffe0c0, 0, 3000, 1); lightC.position.set(J.x, 600, J.z); g.add(lightC);
    return { g, rk, spot, lightC };
  }
  function rocket() {
    const r = new T.Group(), m = (geo, c, sx, sy, sz, x, y, z) => { const o = new T.Mesh(geo, L.mat(c)); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; r.add(o); return o; };
    m(L.GEO.cylB, '#e8e8ec', 3, 22, 3, 0, 0, 0); m(L.GEO.cone, '#c02a2a', 3, 7, 3, 0, 25.5, 0); for (let k = 0; k < 4; k++) { const f = m(L.GEO.box, '#c02a2a', 0.3, 6, 3.5, Math.sin(k * 1.57) * 3, 3, Math.cos(k * 1.57) * 3); f.rotation.y = k * 1.57; }
    m(L.GEO.sph, '#60a0ff', 0.9, 0.9, 0.4, 0, 16, 2.9); const fl = m(L.GEO.cone, '#ffa030', 2, 6, 2, 0, -3, 0); fl.rotation.x = Math.PI; fl.visible = false; r.userData.flame = fl; return r;
  }
  // ---------- Begleiter ----------
  function companions() {
    const mk = (app, tag, col) => { const rig = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, app), true); L.scene.add(rig.root); const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.lineWidth = 6; x.strokeStyle = '#000'; x.strokeText(tag, 128, 42); x.fillStyle = col; x.fillText(tag, 128, 42); const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(2.4, 0.6, 1); s.position.y = 2.4; rig.root.add(s); return { rig, x: PAD.x + 4, z: PAD.z + 4, ph: 0, off: 0 };
    };
    const a = mk({ name: 'Speedy', skin: '#7a4a2e', hair: 'buzz', hairColor: '#1a1a1a', top: 'trikot', topColor: '#c02a2a', pants: 'kurz', pantsColor: '#1a1a1a', shoeType: 'sneaker', shoes: '#f2f2f2', build: 'schmal', mouth: 'offen' }, '⚡ Speedy', '#ff5050');
    const b = mk({ name: 'Big C', skin: '#e3b48f', hair: 'kurz', hairColor: '#4a2f1c', top: 'hoodie', topColor: '#7a7a7a', pants: 'jogging', pantsColor: '#3a3a3a', shoeType: 'sneaker', shoes: '#1a1a1a', build: 'kraeftig', height: 'gross', beard: 'stoppel', mouth: 'laecheln', hat: 'beanie', hatColor: '#2a6ac0' }, '🍔 Big C', '#60c0ff');
    a.off = 1; b.off = -1; b.x -= 6; return [a, b];
  }
  const SPEEDY = ['AAAAAH! DIE SCHLÜSSEL!!!', 'BRO WAS IST DAS?!', 'LAUF! LAUF! LAUF!', 'ICH HAB ANGST, CHAT!', 'NEIN NEIN NEIN NEIN!'], BIGC = ['Bro, ich kann nicht so schnell rennen…', 'Warum schreien die Schlüssel?!', 'Hol die Waffe, ich halt sie auf! …nein doch nicht.', 'Das ist der schlimmste Ausflug ever.'];
  // ---------- Schlüssel mit geschmolzenen Gesichtern ----------
  const yel = new T.MeshStandardMaterial({ color: 0xf0c020, metalness: 0.85, roughness: 0.3, emissive: 0x302000 });
  function buildKey() {
    const g = new T.Group(), P3 = (geo, m, sx, sy, sz, x, y, z) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); g.add(o); return o; };
    P3(new T.TorusGeometry(0.55, 0.16, 8, 20), yel, 1, 1, 1, 0, 0.9, 0); P3(L.GEO.cyl, yel, 0.55, 0.12, 0.55, 0, 0.9, 0).rotation.x = Math.PI / 2;
    P3(L.GEO.box, yel, 0.22, 1.4, 0.1, 0, -0.35, 0); for (let k = 0; k < 4; k++) P3(L.GEO.box, yel, 0.2, 0.1 + (k % 2) * 0.08, 0.1, 0.18, -0.6 - k * 0.18, 0);
    const blk = L.mat('#1a0a04'), drip = L.mat('#c89010');
    for (const s of [-1, 1]) { P3(L.GEO.sph, blk, 0.12, 0.2, 0.05, s * 0.2, 1.0, 0.07); P3(L.GEO.sph, blk, 0.05, 0.16, 0.04, s * 0.2, 0.78, 0.07); P3(L.GEO.sph, drip, 0.06, 0.18, 0.05, s * 0.34, 0.5, 0.05); }
    P3(L.GEO.sph, blk, 0.16, 0.14, 0.05, 0.02, 0.68, 0.07); P3(L.GEO.sph, drip, 0.08, 0.25, 0.06, -0.05, 0.42, 0.05);
    g.scale.setScalar(1.3); L.scene.add(g); return g;
  }
  function spawnKey() {
    const a = Math.random() * 6.283, d = 60 + Math.random() * 40, x = L.clamp(P.x + Math.sin(a) * d, J.x - J.r + 40, J.x + J.r - 40), z = L.clamp(P.z + Math.cos(a) * d, J.z - J.r + 40, J.z + J.r - 40);
    M.keys.push({ m: buildKey(), x, z, y: 2, ph: Math.random() * 6, sp: 9 + Math.random() * 4, cd: 0, scr: Math.random() * 3, dead: false, melt: 0 });
  }
  function scream(k) { const d = Math.hypot(k.x - P.x, k.z - P.z); if (d > 45) return; const v = 0.14 * (1 - d / 45); L.tn && L.tn({ f: 2200 + Math.random() * 500, fTo: 3100, dur: 0.5, type: 'sawtooth', vol: v }); L.tn && L.tn({ f: 1600, fTo: 2600, dur: 0.45, type: 'square', vol: v * 0.5, delay: 0.05 }); }
  // ---------- Waffe ----------
  L.ITEMS.schmelzer = { name: 'Schlüssel-Schmelzer', slot: 'waffe', icon: '🔥', dmg: 0, rate: 0.12, noise: 40, range: 20, ammo: null, mag: 1, spread: 0, energy: true, auto: true, jup: true };
  const owf = L.weaponFire;
  L.weaponFire = function (w, d) {
    if (!d || !d.jup) return owf(w, d);
    P.fireCd = d.rate; const fx = Math.sin(P.camYaw), fz = Math.cos(P.camYaw);
    for (let k = 0; k < 6; k++) { const r = Math.random() * 18; L.fx(k % 2 ? '#ff8020' : '#ffd040', P.x + fx * r + (Math.random() - 0.5) * r * 0.4, (P.y || 0) + 1.3 + (Math.random() - 0.5), P.z + fz * r + (Math.random() - 0.5) * r * 0.4, 1, 2, { basic: true, size: 0.35, life: 0.35 }); }
    for (const k of M.keys) { if (k.dead) continue; const dx = k.x - P.x, dz = k.z - P.z, dd = Math.hypot(dx, dz); if (dd > 20 || (dx * fx + dz * fz) / (dd || 1) < 0.8) continue; k.melt += 0.35; if (k.melt >= 1 && !k.dead) { k.dead = true; k.deadT = 0; M.kills++; L.tn && L.tn({ f: 2800, fTo: 300, dur: 0.6, type: 'sawtooth', vol: 0.12 }); if (M.kills >= GOAL && !M.done) win(); } }
    return true;
  };
  function win() { M.done = true; L.banner('✅ JUPITER-VORFALL ÜBERLEBT!', 'Alle Schlüssel geschmolzen. Zurück zur 🚀 Rakete – ab nach Hause!'); if (L.gotBossCoins) L.gotBossCoins(2500, 'den Jupiter-Vorfall 2011'); L.msg('⚡ Speedy: „WIR HABEN ES GESCHAFFT, CHAT!!!“', 5000); for (const k of M.keys) if (!k.dead) { k.dead = true; k.deadT = 0; } }
  // ---------- Reise ----------
  function startTrip(to) {
    if (M.trip || L.cine) return;
    if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true);
    const from = { x: P.x, z: P.z };
    if (!M.built) M.built = build();
    const rk = rocket(); rk.position.set(from.x + 6, 0, from.z); L.scene.add(rk); rk.userData.flame.visible = true;
    M.trip = { to, t: 0, rk, from, cam: { x: from.x + 50, y: 10, z: from.z + 40, lx: from.x, ly: 15, lz: from.z } };
    L.banner('🚀 3 … 2 … 1 … START!', to === 'jupiter' ? '🪐 Nächste Mission: Jupiter-Vorfall 2011' : 'Zurück zur Erde!');
    L.snd.explosion && L.snd.explosion({ x: from.x, y: 0, z: from.z });
    L.startCine(to === 'jupiter' ? '🪐 JUPITER-VORFALL 2011' : '🚀 RÜCKFLUG ZUR ERDE', 9, () => M.trip && M.trip.cam);
  }
  function updTrip(dt) {
    const tr = M.trip; tr.t += dt; const t = tr.t, f = L.backFade;
    if (t < 3) { const h = t * t * 6; tr.rk.position.y = h; P.x = tr.from.x + 6; P.z = tr.from.z; P.y = h + 4; P.vy = 0; P.air = true; if (P.rig) P.rig.root.visible = false; Object.assign(tr.cam, { x: tr.from.x + 50, y: 10 + h * 0.3, z: tr.from.z + 40, lx: tr.rk.position.x, ly: h + 12, lz: tr.rk.position.z }); L.shake = Math.max(L.shake, 0.4); }
    if (t > 2.6 && t < 3.4 && f) { f.style.background = '#000'; f.style.opacity = String(Math.min(1, (t - 2.6) / 0.4)); }
    if (t >= 3.4 && !tr.landed) {
      tr.landed = true; L.scene.remove(tr.rk);
      const dest = tr.to === 'jupiter' ? { x: PAD.x, z: PAD.z } : (L.ROCKET ? { x: L.ROCKET.x + 20, z: L.ROCKET.z } : { x: 0, z: 0 });
      tr.dest = dest; tr.rk2 = rocket(); tr.rk2.position.set(dest.x + 25, 120, dest.z); tr.rk2.userData.flame.visible = true; L.scene.add(tr.rk2);
      if (tr.to === 'jupiter') arrive(); else leaveJupiter();
    }
    if (t >= 3.4) {
      const u = Math.min(1, (t - 3.4) / 4.5), rk = tr.rk2, d = tr.dest; rk.position.y = 120 * Math.pow(1 - u, 2);
      if (f) f.style.opacity = String(Math.max(0, 1 - (t - 3.4) / 0.6));
      P.x = d.x + 25; P.z = d.z + 6; P.y = rk.position.y + 4; P.vy = 0; P.air = true;
      Object.assign(tr.cam, { x: d.x + 25 + Math.sin(t * 0.4) * 60, y: 18 + rk.position.y * 0.4, z: d.z + Math.cos(t * 0.4) * 60, lx: d.x + 25, ly: rk.position.y + 8, lz: d.z });
      if (u >= 1 && !tr.touch) { tr.touch = true; L.shake = 1; L.snd.stomp && L.snd.stomp({ x: d.x, y: 0, z: d.z }); rk.userData.flame.visible = false; }
    }
    if (t > 8.9 || (!L.cine && t > 0.2)) {
      if (!tr.landed) { tr.landed = true; L.scene.remove(tr.rk); if (tr.to === 'jupiter') arrive(); else leaveJupiter(); tr.dest = tr.to === 'jupiter' ? PAD : (L.ROCKET || { x: 0, z: 0 }); }
      if (tr.rk2) L.scene.remove(tr.rk2); if (f) f.style.opacity = '0'; if (P.rig) P.rig.root.visible = true;
      P.x = tr.dest.x + 25; P.z = tr.dest.z + 6; P.y = 1; P.spawnProt = Math.max(P.spawnProt || 0, 4);
      if (L.cine && L.endCine) L.endCine(); M.trip = null;
      if (tr.to === 'jupiter') { L.banner('🪐 JUPITER-VORFALL 2011', 'Expedition mit Speedy und Big C … Hörst du das Kreischen? Hol den 🔥 Schlüssel-Schmelzer (Pfeil)!'); setTimeout(() => L.msg('⚡ Speedy: „CHAT, wir sind auf JUPITER! Was ist das für ein Geräusch …?“', 5000), 2500); }
      else L.banner('🌍 ZURÜCK AUF DER ERDE', 'Was für ein Ausflug.');
    }
  }
  function arrive() {
    M.on = true; M.kills = 0; M.done = false; M.spawnT = 4;
    for (const k of M.keys) L.scene.remove(k.m); M.keys = [];
    for (const c of M.comp) L.scene.remove(c.rig.root); M.comp = companions();
    const a = Math.random() * 6.283, d = 380 + Math.random() * 200;
    if (M.weapon) L.scene.remove(M.weapon.g);
    const wx = J.x + Math.sin(a) * d * 0.9, wz = J.z + Math.cos(a) * d * 0.9, wg = new T.Group(); wg.position.set(wx, 0, wz); L.scene.add(wg);
    const box = new T.Mesh(L.GEO.box, L.mat('#2a2a30')); box.scale.set(1.6, 0.8, 1); box.position.y = 0.4; wg.add(box);
    const gun = new T.Mesh(L.GEO.cyl, new T.MeshBasicMaterial({ color: 0xff8020 })); gun.scale.set(0.18, 1.4, 0.18); gun.rotation.z = Math.PI / 2; gun.position.y = 1.2; wg.add(gun);
    const beam = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 200, 12, 1, true), new T.MeshBasicMaterial({ color: 0xff9030, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, fog: false })); beam.position.y = 100; wg.add(beam);
    M.weapon = { g: wg, x: wx, z: wz, taken: false };
  }
  function leaveJupiter() { M.on = false; for (const k of M.keys) L.scene.remove(k.m); M.keys = []; for (const c of M.comp) L.scene.remove(c.rig.root); M.comp = []; if (M.weapon) { L.scene.remove(M.weapon.g); M.weapon = null; } if (P.hot) for (let i = 0; i < P.hot.length; i++) if (P.hot[i] && P.hot[i].type === "schmelzer") P.hot[i] = null; }
  // ---------- Rakete auf dem Mond: Auswahl ----------
  let pick = null;
  function moonRocketNear() { return L.inMoon && L.inMoon(P.x) && L.moonCheckpoint && Math.hypot(P.x - L.moonCheckpoint().x, P.z - L.moonCheckpoint().z) < 22 && !P.vehicle; }
  function showPick() {
    if (!pick) { pick = document.createElement('div'); pick.style.cssText = 'position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(5,5,20,.6)'; document.body.appendChild(pick); }
    pick.innerHTML = '<div style="background:#15131c;border:3px solid #e8c040;border-radius:16px;padding:18px;width:min(440px,92vw);color:#fff;font:15px Arial;text-align:center"><div style="font-size:20px;font-weight:bold;margin-bottom:10px">🚀 Wohin?</div><button data-g="earth" style="display:block;width:100%;margin:6px 0;padding:12px;border:0;border-radius:10px;font:bold 16px Arial;background:#3a8aff;color:#fff;cursor:pointer">🌍 Zurück zur Erde</button><button data-g="jup" style="display:block;width:100%;margin:6px 0;padding:12px;border:0;border-radius:10px;font:bold 16px Arial;background:linear-gradient(90deg,#c88a52,#e8c89a);color:#2a1408;cursor:pointer">🪐 Nächste Mission: Jupiter-Vorfall 2011</button><button data-g="" style="margin-top:6px;padding:8px 16px;border:0;border-radius:8px;background:#555;color:#fff;cursor:pointer">Abbrechen</button></div>';
    pick.style.display = 'flex'; L.uiBlock = true; if (L.unlock) L.unlock();
    pick.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; pick.style.display = 'none'; L.uiBlock = false; if (L.state === 'game' && L.lock) L.lock(); if (b.dataset.g === 'earth') { L._skipPick = true; L.moonInteract && L.moonInteract(); L._skipPick = false; } else if (b.dataset.g === 'jup') startTrip('jupiter'); };
  }
  const omh = L.moonHint, omi = L.moonInteract;
  setTimeout(() => {
    const mh = L.moonHint, mi = L.moonInteract;
    L.moonHint = () => { if (moonRocketNear() && L.jupiterUnlocked()) return 'E: 🚀 Rakete: Erde oder 🪐 Jupiter-Vorfall 2011'; return mh ? mh() : null; };
    L.moonInteract = function () { if (!L._skipPick && moonRocketNear() && L.jupiterUnlocked()) { showPick(); return true; } return mi ? mi() : false; };
  }, 0);
  void omh; void omi;
  // E auf Jupiter: Waffe nehmen, Rakete
  const och = L.crateHint, oci = L.crateInteract;
  function nearJ() {
    if (!M.on || !L.inJupiter(P.x, P.z) || P.vehicle) return null;
    if (M.weapon && !M.weapon.taken && Math.hypot(P.x - M.weapon.x, P.z - M.weapon.z) < 4) return 'weapon';
    if (Math.hypot(P.x - PAD.x, P.z - PAD.z) < 20) return 'rocket';
    return null;
  }
  L.crateHint = () => { const n = nearJ(); if (n === 'weapon') return 'E: 🔥 Schlüssel-Schmelzer nehmen'; if (n === 'rocket') return M.done ? 'E: 🚀 Zurück zur Erde (Mission geschafft)' : '🚀 Erst alle Schlüssel schmelzen (' + M.kills + '/' + GOAL + ')'; return och ? och() : null; };
  L.crateInteract = function () {
    const n = nearJ(); if (!n) return oci ? oci() : false;
    if (n === 'weapon') { M.weapon.taken = true; L.scene.remove(M.weapon.g); let i = P.hot.findIndex((h) => !h); if (i < 0) i = 1; P.hot[i] = { type: 'schmelzer', count: 1, mag: 1 }; P.sel = i; L.banner('🔥 SCHLÜSSEL-SCHMELZER', 'Halte die Maustaste gedrückt – schmilz die Schlüssel! (' + GOAL + ' Stück)'); L.msg('🍔 Big C: „Endlich! Mach sie fertig!“', 4000); }
    else if (n === 'rocket' && M.done) startTrip('earth');
    return true;
  };
  // Wegweiser + Anzeige
  L.jupiterWaypoints = () => { const o = []; if (M.weapon && !M.weapon.taken) o.push([M.weapon.x, M.weapon.z, '🔥', 'Waffe']); o.push([PAD.x, PAD.z, '🚀', 'Rakete']); return o; };
  L.jupiterText = () => (M.done ? '✅ Mission geschafft – zurück zur 🚀 Rakete' : '🔑 Schlüssel geschmolzen: ' + M.kills + '/' + GOAL + (M.weapon && !M.weapon.taken ? ' · 🔥 Waffe holen (Pfeil)!' : ''));
  // ---------- jedes Bild ----------
  L.updateJupiter = function (dt) {
    if (M.trip) updTrip(dt);
    const here = L.inJupiter(P.x, P.z);
    if (M.built) M.built.g.visible = here || !!M.trip;
    if (!M.on || !here) return;
    const t = performance.now() / 1000;
    // Blitze
    if (Math.random() < dt * 0.15) { L.env.bolt = 0.9; M.built.lightC.intensity = 3; setTimeout(() => { if (M.built) M.built.lightC.intensity = 0; }, 120); L.snd.thunder && L.snd.thunder(1); }
    M.built.spot.rotation.z += dt * 0.02;
    // Schlüssel
    if (!M.done) { M.spawnT -= dt; if (M.spawnT <= 0 && M.keys.filter((k) => !k.dead).length < 14) { M.spawnT = 1.6; spawnKey(); } }
    const tg = [P].concat(M.comp.map((c) => ({ x: c.x, z: c.z, comp: c })));
    for (let i = M.keys.length - 1; i >= 0; i--) {
      const k = M.keys[i];
      if (k.dead) { k.deadT += dt; k.m.scale.set(1.3 * (1 - k.deadT), 1.3 * Math.max(0.05, 1 - k.deadT * 1.5), 1.3); k.m.position.y = Math.max(0, k.y - k.deadT * 3); if (Math.random() < 0.5) L.fx('#e0a010', k.x, k.m.position.y, k.z, 2, 1, { size: 0.2, life: 0.8 }); if (k.deadT > 1) { L.scene.remove(k.m); M.keys.splice(i, 1); } continue; }
      let best = P, bd = Math.hypot(P.x - k.x, P.z - k.z); for (const o of tg) { const d = Math.hypot(o.x - k.x, o.z - k.z); if (d < bd - 5) { bd = d; best = o; } }
      const dx = best.x - k.x, dz = best.z - k.z, d = Math.hypot(dx, dz) || 1;
      k.x += dx / d * k.sp * dt; k.z += dz / d * k.sp * dt; k.ph += dt * 6; k.y = 1.6 + Math.sin(k.ph) * 0.5;
      k.m.position.set(k.x, k.y, k.z); k.m.rotation.set(Math.sin(k.ph) * 0.3, Math.atan2(dx, dz), Math.sin(k.ph * 0.7) * 0.4);
      k.scr -= dt; if (k.scr <= 0) { k.scr = 2 + Math.random() * 3; scream(k); }
      k.cd -= dt;
      if (best === P && d < 1.8 && k.cd <= 0 && P.alive) { k.cd = 1; L.hurtPlayer(16, 'Von kreischenden Hausschlüsseln auf dem Jupiter zerstochen'); P.vx = -dx / d * 8; P.vz = -dz / d * 8; L.shake = Math.max(L.shake, 0.5); }
      if (best.comp && d < 1.8 && k.cd <= 0) { k.cd = 1; best.comp.panic = 2; }
    }
    // Begleiter folgen, rennen, schreien
    M.comp.forEach((c, n) => {
      const a = P.camYaw + Math.PI + c.off * 0.7, gx = P.x + Math.sin(a) * 4, gz = P.z + Math.cos(a) * 4, dx = gx - c.x, dz = gz - c.z, d = Math.hypot(dx, dz);
      const sp = d > 3 ? Math.min(14, d * 2) : 0; if (d > 0.1) { c.x += dx / d * sp * dt; c.z += dz / d * sp * dt; }
      if (d > 120) { c.x = gx; c.z = gz; }
      c.ph += dt * (sp > 0 ? 10 : 2); c.rig.root.position.set(c.x, 0, c.z); c.rig.root.rotation.y = sp > 0 ? Math.atan2(dx, dz) : P.camYaw;
      L.animHuman(c.rig, { mode: sp > 7 ? 'run' : sp > 0 ? 'walk' : 'idle', phase: c.ph, speed: 1 });
      if (c.panic > 0 || M.keys.some((k) => !k.dead && Math.hypot(k.x - c.x, k.z - c.z) < 12)) { c.rig.arms.forEach((ar, i2) => { ar.arm.rotation.x = -2.8 + Math.sin(t * 20 + i2) * 0.3; }); c.panic = Math.max(0, (c.panic || 0) - dt); }
    });
    M.talkT -= dt;
    if (M.talkT <= 0 && M.keys.some((k) => !k.dead && Math.hypot(k.x - P.x, k.z - P.z) < 25)) { M.talkT = 7; const s = Math.random() < 0.6; L.msg(s ? '⚡ Speedy: „' + L.pick(SPEEDY) + '“' : '🍔 Big C: „' + L.pick(BIGC) + '“', 3500); }
    // von der Kante gefallen
    if (P.alive && (P.y || 0) < -60) { P.x = PAD.x + 25; P.z = PAD.z; P.y = 2; P.vy = 0; L.hurtPlayer(20, 'Vom Jupiter-Felsen gestürzt'); }
  };
  // Licht und Himmel
  const oue = L.updateEnv;
  L.updateEnv = function (dt, cam, focus, paused) {
    oue(dt, cam, focus, paused);
    if (!cam || !L.inJupiter(cam.position.x, cam.position.z) || cam.position.y > 1000) return;
    const E2 = L.env; L.scene.background.set('#b87848'); L.scene.fog.color.set('#c88a5a'); L.scene.fog.near = 150; L.scene.fog.far = 1400;
    if (E2.stars) E2.stars.material.opacity = 0.1; if (E2.sunDisc) E2.sunDisc.material.opacity = 0; if (E2.moon) E2.moon.material.opacity = 0; if (E2.rainMesh) E2.rainMesh.visible = false;
    E2.hemi.intensity = 0.6; E2.hemi.color.set('#ffd0a0'); E2.hemi.groundColor.set('#6a3a1a'); E2.sun.intensity = 0.7; E2.sun.color.set('#ffb070');
  };
  L.clearJupiter = function () { if (M.trip) { if (M.trip.rk) L.scene.remove(M.trip.rk); if (M.trip.rk2) L.scene.remove(M.trip.rk2); M.trip = null; } leaveJupiter(); if (P.rig) P.rig.root.visible = true; };
})();
