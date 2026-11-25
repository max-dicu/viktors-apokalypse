'use strict';
// Code-Skin „🩼 Marlon“: groß, moderner Mullet (braun), Baggy-Old-Money-Look, Knieorthese aus Vibranium & Adamantium (rechtes Knie),
// zwei Unterarmkrücken mit je drei Unendlichkeits-Steinen. Eigene Humpel-Animation (Kreuzband + Meniskus).
// Waffe „Stein-Krücken“: Strahl aus den Steinen – schadet auch dem Infinity-Omnitron voll.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const ID = 'marlon', PK = '1emktb9fuah';
  const ok = (app) => !!(app && typeof app.hk === 'string' && L.hash53(app.hk) === PK);
  const oTok = L.heroToken, oChk = L.heroCheck;
  L.heroToken = (id) => { if (id !== ID) return oTok ? oTok(id) : null; const k = L.save && L.save.heroKeys && L.save.heroKeys[ID]; return k && L.hash53(L.hash53(k)) === PK ? L.hash53(k) : null; };
  L.heroCheck = (code) => (L.hash53(L.hash53(code)) === PK ? ID : oChk ? oChk(code) : null);
  L.SKINS.push(['h_' + ID, '🩼 Krücken-Kämpfer aus Sina Sina']);
  const STONES = [0xff2a2a, 0xffd020, 0x2a7aff, 0x30e070, 0xa040ff, 0xff8a20];
  const LOOK = { name: 'Krücken-Kämpfer', koerper: 'mann', skin: '#e3b48f', hair: 'mullet', hairColor: '#5a3a22', eyes: '#4a2f1c', brows: 'normal', mouth: 'laecheln', nose: 'normal', beard: 'kein',
    top: 'hoodie', topColor: '#c3c4c8', pants: 'jogging', pantsColor: '#3b3c41', shoeType: 'sandale', shoes: '#111111', build: 'muskuloes', height: 'sehr_gross', schmuck: 'kein' };
  // Texturen: Vibranium (dunkles Sechseck-Gitter, lila Adern) und Adamantium (gebürsteter Stahl)
  let vibT = null, adaT = null;
  function vibTex() { if (vibT) return vibT; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#17131f'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#7a4ad0'; g.lineWidth = 2; const r = 10; for (let y = 0; y < 150; y += r * 1.5) for (let x = 0; x < 150; x += r * 1.732) { const ox = x + ((y / (r * 1.5)) % 2 ? r * 0.866 : 0); g.beginPath(); for (let k = 0; k < 7; k++) { const an = Math.PI / 3 * k + Math.PI / 6; g.lineTo(ox + Math.cos(an) * r, y + Math.sin(an) * r); } g.stroke(); } vibT = new T.CanvasTexture(c); vibT.wrapS = vibT.wrapT = T.RepeatWrapping; vibT.repeat.set(2, 2); return vibT; }
  function adaTex() { if (adaT) return adaT; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); for (let y = 0; y < 128; y++) { const v = 170 + Math.floor(Math.random() * 60); g.fillStyle = 'rgb(' + v + ',' + (v + 4) + ',' + (v + 10) + ')'; g.fillRect(0, y, 128, 1); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(Math.random() * 128, Math.random() * 128, 20 + Math.random() * 60, 1); } adaT = new T.CanvasTexture(c); adaT.wrapS = adaT.wrapT = T.RepeatWrapping; return adaT; }
  let sdT = null, sgT = null;
  function sidePaint(g, glow) {
    g.clearRect(0, 0, 128, 150); g.fillStyle = glow ? '#000' : '#8a9098'; g.fillRect(0, 0, 128, 150);
    if (!glow) { const gr = g.createLinearGradient(0, 0, 128, 150); gr.addColorStop(0, '#b8bec6'); gr.addColorStop(0.5, '#7a8088'); gr.addColorStop(1, '#a4aab2'); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 6); g.lineTo(122, 40); g.lineTo(122, 110); g.lineTo(64, 144); g.lineTo(6, 110); g.lineTo(6, 40); g.closePath(); g.fill(); g.strokeStyle = '#4a4e56'; g.lineWidth = 4; g.stroke(); }
    g.strokeStyle = glow ? '#b080ff' : '#3e4249'; g.lineWidth = glow ? 3 : 5; g.beginPath(); g.moveTo(64, 20); g.lineTo(96, 58); g.lineTo(74, 75); g.lineTo(100, 128); g.moveTo(64, 20); g.lineTo(32, 58); g.lineTo(54, 75); g.lineTo(28, 128); g.stroke();
    g.beginPath(); g.ellipse(52, 75, 12, 8, 0, 0, 6.3); g.ellipse(76, 75, 12, 8, 0, 0, 6.3); g.stroke();
  }
  function sideTex() { if (sdT) return sdT; const c = document.createElement('canvas'); c.width = 128; c.height = 150; sidePaint(c.getContext('2d'), false); sdT = new T.CanvasTexture(c); return sdT; }
  function sideGlow() { if (sgT) return sgT; const c = document.createElement('canvas'); c.width = 128; c.height = 150; sidePaint(c.getContext('2d'), true); sgT = new T.CanvasTexture(c); return sgT; }
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    if (!app || app.special !== 'h_' + ID) return obh(app, force);
    if (!force && !ok(app)) return obh(Object.assign({}, app, { special: '' }), force);
    const r = obh(Object.assign({}, app, LOOK, { special: '' }), force);
    r.app = Object.assign({}, r.app, app); r.marlon = true;
    const SM = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, metalness: 0 }, o || {}));
    const vib = SM(0x2a2238, { map: vibTex(), emissive: 0x3a1870, emissiveMap: vibTex(), emissiveIntensity: 0.7, metalness: 0.75, roughness: 0.3 });
    const ada = SM(0xe0e4ea, { map: adaTex(), metalness: 1, roughness: 0.22 });
    const hood = SM(0xb6b7bc, { roughness: 0.95 }), hoodD = SM(0x9c9da2, { roughness: 0.95 }), tee = SM(0xf4f4f2), pant = SM(0x3b3c41, { roughness: 0.95 }), pantD = SM(0x2c2d31, { roughness: 0.95 });
    const blk = SM(0x111111, { roughness: 0.6 }), sock = SM(0xf2f2f2, { roughness: 1 }), grey = SM(0x9a9ca2, { metalness: 0.6, roughness: 0.35 }), zip = SM(0xcfd2d8, { metalness: 0.9, roughness: 0.3 });
    const G = L.GEO;
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
    const fz = 0.18;
    // --- Athletischer Sleeper-Build: breite Schultern, Rücken, Schlüsselbeine (unter dem Hoodie) ---
    P3(G.box, hood, 0.68, 0.2, 0.3, 0, 0.5, 0, r.torso);
    P3(G.box, hood, 0.62, 0.14, 0.3, 0, 0.36, 0, r.torso);
    P3(G.box, hood, 0.42, 0.24, 0.3, 0, 0.18, 0, r.torso);
    for (const sd of [-1, 1]) { const cl = P3(G.box, hoodD, 0.16, 0.012, 0.012, sd * 0.1, 0.6, fz + 0.005, r.torso); cl.rotation.z = sd * -0.18; }
    // Reißverschluss bis etwa zur Brustmitte offen (etwas weiter offen als ein Quarter-Zip), weißes T-Shirt sichtbar
    P3(G.box, tee, 0.12, 0.2, 0.01, 0, 0.52, fz + 0.004, r.torso);
    for (const sd of [-1, 1]) {
      const f = P3(G.box, hood, 0.075, 0.24, 0.014, sd * 0.07, 0.52, fz + 0.008, r.torso); f.rotation.z = sd * 0.2;
      P3(G.box, zip, 0.007, 0.22, 0.007, sd * 0.042, 0.52, fz + 0.016, r.torso).rotation.z = sd * 0.2;
      const k = P3(G.box, hood, 0.08, 0.08, 0.03, sd * 0.1, 0.66, 0.08, r.torso); k.rotation.z = sd * 0.45;
    }
    P3(G.box, zip, 0.007, 0.32, 0.007, 0, 0.26, fz + 0.007, r.torso);
    P3(G.box, zip, 0.024, 0.04, 0.008, 0, 0.405, fz + 0.014, r.torso); P3(G.box, SM(0x222222), 0.012, 0.035, 0.006, 0, 0.375, fz + 0.016, r.torso);
    // Kapuze: fällt sauber nach hinten bis zu den Schultern
    { const hb = P3(G.box, hood, 0.4, 0.26, 0.07, 0, 0.5, -0.2, r.torso); hb.rotation.x = -0.18; const rl = P3(G.cyl, hood, 0.075, 0.42, 0.06, 0, 0.64, -0.17, r.torso); rl.rotation.z = Math.PI / 2; P3(G.box, hoodD, 0.3, 0.16, 0.012, 0, 0.53, -0.162, r.torso).rotation.x = -0.18; P3(G.sph, hoodD, 0.2, 0.08, 0.05, 0, 0.38, -0.21, r.torso);
      for (const sd of [-1, 1]) { const dr = P3(G.box, hood, 0.08, 0.05, 0.22, sd * 0.19, 0.65, -0.06, r.torso); dr.rotation.set(0, sd * -0.25, sd * -0.35); } }
    // Kängurutasche verdecken, zwei normale Seitentaschen
    P3(G.box, hood, 0.4, 0.24, 0.012, 0, 0.18, fz + 0.002, r.torso); P3(G.box, hood, 0.5, 0.36, 0.01, 0, 0.4, fz - 0.004, r.torso);
    for (const sd of [-1, 1]) { const p = P3(G.box, hoodD, 0.012, 0.13, 0.01, sd * 0.2, 0.2, fz + 0.016, r.torso); p.rotation.z = sd * 0.35; }
    P3(G.box, hoodD, 0.42, 0.05, 0.27, 0, 0.06, 0, r.torso);
    // Ärmel: oversized, Bündchen fallen über die Hände
    (r.arms || []).forEach((a2) => {
      P3(G.sph, hood, 0.105, 0.095, 0.11, 0, -0.03, 0, a2.arm);
      P3(G.box, hood, 0.145, 0.32, 0.155, 0, -0.16, 0, a2.arm);
      P3(G.box, hood, 0.14, 0.3, 0.15, 0, -0.15, 0, a2.elbow);
      P3(G.box, hoodD, 0.135, 0.09, 0.145, 0, -0.33, 0, a2.elbow);
    });
    // Lockere dunkelgraue Jogginghose, weiße Socken, schwarze Slides
    (r.legs || []).forEach((lg) => {
      P3(G.box, pant, 0.17, 0.44, 0.18, 0, -0.22, 0, lg.leg);
      P3(G.box, pant, 0.165, 0.34, 0.175, 0, -0.18, 0, lg.knee);
      P3(G.box, pantD, 0.16, 0.06, 0.17, 0, -0.37, 0, lg.knee);
      P3(G.box, sock, 0.13, 0.08, 0.125, 0, -0.42, 0, lg.knee);
      P3(G.box, sock, 0.135, 0.06, 0.24, 0, -0.465, 0.05, lg.knee);
      P3(G.box, blk, 0.16, 0.05, 0.29, 0, -0.505, 0.05, lg.knee);
      P3(G.box, blk, 0.155, 0.055, 0.12, 0, -0.455, 0.11, lg.knee);
      for (let k = 0; k < 3; k++) P3(G.box, SM(0x2a2a2a), 0.157, 0.006, 0.02, 0, -0.44 - k * 0.015, 0.11, lg.knee);
    });
    // Knieorthese rechts – doppelt so groß, über der Hose, mittig am Knie, Grautöne + Seiten-Design
    const lg = r.legs && r.legs[0];
    if (lg) {
      const g1 = SM(0x6a6e76, { map: vibTex(), metalness: 0.8, roughness: 0.32, emissive: 0x2a1a48, emissiveMap: vibTex(), emissiveIntensity: 0.35 });
      const g2 = SM(0x8e939c, { map: adaTex(), metalness: 1, roughness: 0.25 }), g3 = SM(0x44474e, { metalness: 0.7, roughness: 0.4 }), g4 = SM(0xb8bcc4, { map: adaTex(), metalness: 1, roughness: 0.18 });
      const side = SM(0x9aa0a8, { map: sideTex(), metalness: 0.85, roughness: 0.3, emissive: 0x6040c0, emissiveMap: sideGlow(), emissiveIntensity: 0.9, transparent: true });
      const cuff = (par, y, h) => { const m = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 22, 1, true), g1); m.scale.set(0.118, h, 0.118); m.position.set(0, y, 0); m.material.side = T.DoubleSide; m.castShadow = true; par.add(m); P3(G.box, g3, 0.245, 0.03, 0.245, 0, y + h / 2 - 0.015, 0, par); P3(G.box, g3, 0.245, 0.03, 0.245, 0, y - h / 2 + 0.015, 0, par); return m; };
      cuff(lg.leg, -0.3, 0.22); cuff(lg.knee, -0.17, 0.22);
      for (const sd of [-1, 1]) {
        P3(G.box, g2, 0.03, 0.4, 0.06, sd * 0.125, -0.27, 0, lg.leg);
        P3(G.box, g2, 0.03, 0.36, 0.06, sd * 0.125, -0.14, 0, lg.knee);
        P3(G.box, g4, 0.012, 0.36, 0.02, sd * 0.142, -0.27, 0.02, lg.leg);
        const h = P3(G.cyl, g4, 0.09, 0.04, 0.09, sd * 0.13, 0.0, 0, lg.knee); h.rotation.z = Math.PI / 2;
        const h2 = P3(G.cyl, g3, 0.055, 0.046, 0.055, sd * 0.135, 0.0, 0, lg.knee); h2.rotation.z = Math.PI / 2;
        const h3 = P3(G.cyl, g1, 0.03, 0.05, 0.03, sd * 0.14, 0.0, 0, lg.knee); h3.rotation.z = Math.PI / 2;
        // cooles Seiten-Design: Platten mit eingeprägtem Muster und leuchtender Linie
        for (const [par, y] of [[lg.leg, -0.3], [lg.knee, -0.17]]) { const pl = new T.Mesh(new T.PlaneGeometry(0.17, 0.2), side); pl.position.set(sd * 0.158, y, 0); pl.rotation.y = sd * Math.PI / 2; par.add(pl); }
      }
      P3(G.sph, g4, 0.13, 0.14, 0.06, 0, 0.0, 0.11, lg.knee);
      P3(new T.TorusGeometry(0.13, 0.016, 6, 24), g3, 1, 1.08, 1, 0, 0, 0.115, lg.knee);
      for (let k = 0; k < 3; k++) P3(G.box, g3, 0.2 - k * 0.04, 0.012, 0.01, 0, 0.06 - k * 0.06, 0.17, lg.knee);
    }
    // Krücken: grau, schwarze Griffe und Stopper, Steine kreisen um den Griff
    r.crutches = (r.arms || []).map((a2, i) => {
      const c = new T.Group(); c.position.set(i ? 0.05 : -0.05, -0.35, 0.02); a2.elbow.add(c);
      const tor = P3(new T.TorusGeometry(0.098, 0.016, 8, 18, Math.PI * 1.35), grey, 1, 1, 1, i ? -0.05 : 0.05, 0.34, -0.01, c); tor.rotation.set(Math.PI / 2, 0, Math.PI * 0.85);
      P3(G.cyl, grey, 0.022, 0.36, 0.022, 0, 0.16, -0.035, c);
      P3(G.cyl, grey, 0.024, 1.04, 0.024, 0, -0.52, -0.035, c);
      const gp = P3(G.cyl, blk, 0.03, 0.2, 0.03, 0, 0, 0.06, c); gp.rotation.x = Math.PI / 2;
      P3(G.cyl, blk, 0.045, 0.09, 0.045, 0, -1.08, -0.035, c);
      const orb = new T.Group(); orb.position.set(0, 0, 0.19); c.add(orb); c.userData.orb = orb;
      for (let k = 0; k < 6; k++) { const an = k / 6 * 6.283, st = new T.Mesh(new T.OctahedronGeometry(0.022), new T.MeshBasicMaterial({ color: STONES[(k + i * 3) % 6] })); st.scale.y = 1.4; st.position.set(Math.cos(an) * 0.075, Math.sin(an) * 0.075, 0); orb.add(st); }
      return c;
    });
    return r;
  };
  // ---------- Humpeln ----------
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (r && r.crutches) r.crutches.forEach((c) => { if (c.userData.orb) { c.userData.orb.rotation.z += (dt || 0.016) * 3; c.userData.orb.children.forEach((st) => { st.rotation.y += (dt || 0.016) * 4; }); } });
    if (!r || !r.marlon || P.vehicle || P.flying) return;
    const sp = Math.hypot(P.vx || 0, P.vz || 0);
    if (sp < 0.3) { r.arms.forEach((a) => { a.arm.rotation.x = -0.15; a.arm.rotation.z = a === r.arms[0] ? 0.08 : -0.08; a.elbow.rotation.x = -0.1; }); if (r.legs[0]) { r.legs[0].knee.rotation.x = 0.05; r.legs[0].leg.rotation.x = -0.15; } return; }
    const ph = (P.phase || 0) * 0.8, s = Math.sin(ph);
    // Krücken gehen gemeinsam nach vorn, wenn das kaputte Bein (rechts) auftritt
    const cr = -0.35 - Math.max(0, s) * 0.45;
    r.arms.forEach((a, i) => { a.arm.rotation.x = cr; a.arm.rotation.z = i ? -0.12 : 0.12; a.elbow.rotation.x = -0.15; });
    if (r.legs[0]) { r.legs[0].leg.rotation.x = -0.25 + s * 0.25; r.legs[0].knee.rotation.x = 0.06; }
    if (r.legs[1]) { r.legs[1].leg.rotation.x = -s * 0.55; r.legs[1].knee.rotation.x = Math.max(0, s) * 0.8; }
    if (r.body) { r.body.rotation.z = s * 0.09; r.body.position.y = -Math.max(0, s) * 0.06; }
    if (r.torso) r.torso.rotation.x = 0.12 + Math.max(0, s) * 0.08;
  };
  const isM = () => !!(P.rig && P.rig.marlon);
  const ohs = L.heroSpeed; L.heroSpeed = () => (isM() ? 0.9 : ohs ? ohs() : 1);
  // ---------- Waffe: Stein-Krücken ----------
  L.ITEMS.steinkruecken = { name: 'Stein-Krücken', slot: 'waffe', icon: '🩼', dmg: 0, rate: 0.45, noise: 50, range: 250, ammo: null, mag: 1, spread: 0, energy: true, mk: true };
  const owf = L.weaponFire;
  L.weaponFire = function (w, d) {
    if (!d || !d.mk) return owf(w, d);
    P.fireCd = d.rate;
    const dir = new T.Vector3(); L.camera.getWorldDirection(dir);
    const from = new T.Vector3(P.x, (P.y || 0) + 1.3, P.z), col = STONES[Math.floor(Math.random() * 6)];
    const to = from.clone().addScaledVector(dir, 250);
    const m = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 1, 8, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false }));
    m.position.copy(from); m.lookAt(to); m.scale.set(1, 1, 250); L.scene.add(m); let o = 0.9; const iv = setInterval(() => { o -= 0.15; m.material.opacity = o; if (o <= 0) { clearInterval(iv); L.scene.remove(m); } }, 40);
    L._marlonFiring = true;
    try {
      for (const e of (L._targets ? L._targets() : [])) {
        const vx = e.x - from.x, vz = e.z - from.z, tt = vx * dir.x + vz * dir.z; if (tt < 0 || tt > 250) continue;
        const px = from.x + dir.x * tt, pz = from.z + dir.z * tt, rr = 2.5 + (e.bigR || 0);
        if (Math.hypot(e.x - px, e.z - pz) < rr) L.damageEnt(e, 220, P.x, P.z, P);
      }
    } finally { L._marlonFiring = false; }
    L.fx('#' + new T.Color(col).getHexString(), to.x, to.y, to.z, 10, 6, { basic: true, size: 0.5, life: 0.5 });
    L.makeNoise && L.makeNoise(P.x, P.z, d.noise, P);
    return true;
  };
  const ohst = L.heroStart;
  L.heroStart = function () {
    if (ohst) ohst();
    L.mGodOn = false; L.mGodNoTag = false;
    if (!isM()) return;
    if (L.save && !L.save.mGodUsed2 && L.heroToken && L.heroToken(ID)) { L.save.mGodUsed2 = 1; L.mGodNoTag = true; L._omniSoon = true; L.persist && L.persist(); L.mGodOn = true; setTimeout(() => L.msg('⭐ Nur diese Runde: unsterblich + Teleport (T / Karte) – danach nie wieder!', 7000), 6500); }
    if (L.save && !L.save.omniFinale2 && L.heroToken && L.heroToken(ID)) { L.save.omniFinale = L.save.omniFinale2 = 1; L.persist && L.persist(); L._omniFinale = 3; L._clearFilm = true; }
    P.hot[1] = { type: 'steinkruecken', count: 1, mag: 1 }; P.sel = 1;
    L.msg('🩼 Krücken-Kämpfer: Stein-Krücken auf Taste 2 – der Strahl schadet sogar dem Infinity-Omnitron!', 6000);
  };
})();
