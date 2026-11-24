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
    top: 'oversize', topColor: '#eee4cf', pants: 'baggy', pantsColor: '#cbb994', shoeType: 'lackschuh', shoes: '#5a3a22', build: 'normal', height: 'sehr_gross', schmuck: 'kette', schmuckFarbe: '#f0c850' };
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    if (!app || app.special !== 'h_' + ID) return obh(app, force);
    if (!force && !ok(app)) return obh(Object.assign({}, app, { special: '' }), force);
    const r = obh(Object.assign({}, app, LOOK, { special: '' }), force);
    r.app = Object.assign({}, r.app, app); r.marlon = true;
    const M = (c, o) => (o ? new T.MeshStandardMaterial(Object.assign({ color: c }, o)) : L.mat(c));
    const vib = M(0x3a3048, { metalness: 0.9, roughness: 0.25, emissive: 0x2a1050, emissiveIntensity: 0.4 }), ada = M(0xd8dce4, { metalness: 1, roughness: 0.18 });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, typeof m === 'string' ? L.mat(m) : m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
    // Old Money: Kragen, Zopfmuster-Linien, Gürtel
    P3(L.GEO.box, '#ffffff', 0.18, 0.04, 0.03, 0, 0.62, 0.12, r.torso);
    for (let k = 0; k < 4; k++) P3(L.GEO.box, '#ddd2b8', 0.012, 0.42, 0.01, -0.09 + k * 0.06, 0.3, 0.135, r.torso);
    P3(L.GEO.box, '#5a3a22', 0.4, 0.04, 0.24, 0, 0.02, 0, r.torso);
    // Knieorthese rechts (legs[0])
    const lg = r.legs[0];
    if (lg) {
      for (const sd of [-1, 1]) { P3(L.GEO.box, ada, 0.025, 0.36, 0.035, sd * 0.1, -0.2, 0, lg.leg); P3(L.GEO.box, ada, 0.025, 0.34, 0.035, sd * 0.1, -0.18, 0, lg.knee); P3(L.GEO.cyl, vib, 0.05, 0.03, 0.05, sd * 0.11, 0, 0, lg.knee).rotation.z = Math.PI / 2; }
      P3(L.GEO.box, vib, 0.23, 0.06, 0.2, 0, -0.18, 0, lg.leg); P3(L.GEO.box, vib, 0.21, 0.06, 0.19, 0, -0.32, 0, lg.knee);
      P3(L.GEO.box, '#1a1a22', 0.22, 0.04, 0.2, 0, -0.08, 0, lg.leg); P3(L.GEO.sph, ada, 0.06, 0.06, 0.03, 0, -0.02, 0.1, lg.knee);
    }
    // Krücken mit Steinen
    r.crutches = (r.arms || []).map((a, i) => {
      const c = new T.Group(); c.position.set(0, -0.3, 0.06); a.elbow.add(c);
      P3(new T.TorusGeometry(0.06, 0.012, 6, 14, Math.PI * 1.4), ada, 1, 1, 1, 0, 0.25, 0, c).rotation.x = Math.PI / 2;
      P3(L.GEO.cyl, ada, 0.022, 0.3, 0.022, 0, 0.12, -0.02, c); P3(L.GEO.box, vib, 0.035, 0.035, 0.14, 0, 0, 0.04, c);
      P3(L.GEO.cyl, vib, 0.024, 1.05, 0.024, 0, -0.52, 0, c); P3(L.GEO.cyl, '#1a1a1a', 0.035, 0.06, 0.035, 0, -1.06, 0, c);
      for (let k = 0; k < 3; k++) P3(new T.OctahedronGeometry(0.035), new T.MeshBasicMaterial({ color: STONES[i * 3 + k] }), 1, 1.4, 1, 0.028, -0.25 - k * 0.12, 0.02, c);
      return c;
    });
    return r;
  };
  // ---------- Humpeln ----------
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
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
    if (L.save && !L.save.omniFinale && L.heroToken && L.heroToken(ID)) { L.save.omniFinale = 1; L.persist && L.persist(); L._omniFinale = 3; }
    P.hot[1] = { type: 'steinkruecken', count: 1, mag: 1 }; P.sel = 1;
    L.msg('🩼 Krücken-Kämpfer: Stein-Krücken auf Taste 2 – der Strahl schadet sogar dem Infinity-Omnitron!', 6000);
  };
})();
