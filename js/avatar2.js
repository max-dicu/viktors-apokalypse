'use strict';
// Avatar: Mann oder Frau. Bei „Frau“ gibt es Kleider, Blusen, Croptops, Lippenstift und einen weiblichen Körperbau.
// Für alle: Taschen (Handtasche, Umhängetasche, Clutch, Rucksack) und Schmuck (Kette, Perlen, Ohrringe, Armbänder).
(function () {
  const L = window.L, T = THREE;
  const G = () => L.GEO;
  const PAL = L.PALETTE;
  const DRESS = { kleid: 1, sommerkleid: 1, ballkleid: 1 }, FEM_TOP = { bluse: 1, croptop: 1, kleid: 1, sommerkleid: 1, ballkleid: 1 };
  // Optionen: „Körper“ ganz nach vorn, die neuen ans Ende
  L.CHAR_OPTS = Object.assign({ koerper: ['mann', 'frau'] }, L.CHAR_OPTS, {
    lippen: ['natur', 'rosa', 'rot', 'pink', 'dunkel'],
    tasche: ['keine', 'handtasche', 'umhaengetasche', 'clutch', 'rucksack'], taschenFarbe: PAL,
    schmuck: ['kein', 'kette', 'perlen', 'ohrringe', 'armbaender', 'alles'], schmuckFarbe: ['#f0c850', '#d8d8e0', '#ffb0c8', '#1a1a1a']
  });
  L.CHAR_OPTS.top = L.CHAR_OPTS.top.concat(['bluse', 'croptop', 'kleid', 'sommerkleid', 'ballkleid']);
  Object.assign(L.DEFAULT_CHAR, { koerper: 'mann', lippen: 'natur', tasche: 'keine', taschenFarbe: '#c02a2a', schmuck: 'kein', schmuckFarbe: '#f0c850' });
  L.CHAR_LABELS_X = { koerper: '🚻 Körper', lippen: '💄 Lippen', tasche: '👜 Tasche', taschenFarbe: 'Farbe Tasche', schmuck: '💍 Schmuck', schmuckFarbe: 'Farbe Schmuck' };
  L.WORDS_X = { mann: '👨 Mann', frau: '👩 Frau', natur: 'natürlich', rosa: 'Rosa', rot: 'Rot', pink: 'Pink', dunkel: 'Dunkel', keine: 'keine', handtasche: 'Handtasche', umhaengetasche: 'Umhängetasche', clutch: 'Clutch', rucksack: 'Rucksack',
    kein: 'kein', kette: 'Kette', perlen: 'Perlenkette', ohrringe: 'Ohrringe', armbaender: 'Armbänder', alles: 'alles', bluse: 'Bluse', croptop: 'Croptop', kleid: 'Kleid', sommerkleid: 'Sommerkleid', ballkleid: 'Ballkleid' };
  // Was im Menü sichtbar ist: Kleider/Lippen nur bei Frauen, Bart nur bei Männern
  L.charKeyOk = (key, app) => { const f = app.koerper === 'frau'; if (key === 'beard') return !f; if (key === 'lippen') return f; if (key === 'taschenFarbe') return app.tasche && app.tasche !== 'keine'; if (key === 'schmuckFarbe') return app.schmuck && app.schmuck !== 'kein'; return true; };
  L.charOptOk = (key, v, app) => !(key === 'top' && FEM_TOP[v] && app.koerper !== 'frau');
  L.charOptChanged = (key, v, app) => {
    if (key !== 'koerper') return;
    if (v === 'frau') { app.beard = 'kein'; if (['kurz', 'fade', 'buzz', 'glatze', 'undercut', 'stachel', 'irokese'].includes(app.hair)) app.hair = 'lang'; if (app.top === 'anzug' || app.top === 'kittel') app.top = 'bluse'; }
    else { if (FEM_TOP[app.top]) app.top = 'tshirt'; app.lippen = 'natur'; }
  };
  // NPCs: Frauen bekommen auch Kleider und keinen Bart
  const ora = L.randomAppearance;
  L.randomAppearance = function () {
    const a = ora();
    if (a.koerper === 'frau') { a.beard = 'kein'; if (Math.random() < 0.6) a.hair = L.pick(['lang', 'wellig', 'locken', 'bob', 'zopf', 'hoherzopf', 'dutt', 'flechtzopf']); if (Math.random() < 0.6) a.lippen = 'natur'; }
    else { if (FEM_TOP[a.top]) a.top = L.pick(['tshirt', 'hoodie', 'jacke', 'hemd']); a.lippen = 'natur'; }
    if (Math.random() < 0.6) a.tasche = 'keine'; if (Math.random() < 0.5) a.schmuck = 'kein';
    return a;
  };
  // ---------- Aussehen ----------
  const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, typeof m === 'string' ? L.mat(m) : m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
  const metal = (c) => new T.MeshStandardMaterial({ color: new T.Color(c), metalness: c === '#1a1a1a' ? 0.3 : 0.85, roughness: 0.3 });
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    if (!app || app.special || app.monsterKind) return obh(app, force);
    const A = Object.assign({}, L.DEFAULT_CHAR, app), fem = A.koerper === 'frau';
    // Grundfigur: Kleider/Bluse/Croptop auf vorhandene Teile abbilden
    const base = Object.assign({}, A);
    if (DRESS[A.top]) { base.top = A.top === 'kleid' ? 'tshirt' : 'tanktop'; base.pants = 'rock'; base.pantsColor = A.topColor; }
    else if (A.top === 'bluse') base.top = 'hemd'; else if (A.top === 'croptop') base.top = 'tanktop';
    if (fem) base.beard = 'kein';
    const rig = obh(base, force);
    rig.app = Object.assign({}, rig.app, A);
    if (!rig.torso || !rig.head || !rig.hips) return rig;
    const topM = L.mat(A.topColor), skin = L.mat(A.skin);
    if (fem) {
      // weibliche Figur: Brust, Taille, Hüfte, Wimpern, Lippen
      P3(G().sph, topM, 0.15, 0.06, 0.045, 0, 0.42, 0.1, rig.torso);
      P3(G().sph, DRESS[A.top] ? topM : L.mat(A.pantsColor), 0.2, 0.11, 0.14, 0, -0.04, 0, rig.hips);
      for (const sd of [-1, 1]) P3(G().box, '#1a0e08', 0.068, 0.01, 0.012, sd * 0.058, 0.205, 0.139, rig.head);
      const LIP = { rosa: '#e88a9a', rot: '#c01a2a', pink: '#ff4aa0', dunkel: '#6a1a2a' }[A.lippen];
      if (LIP) P3(G().box, LIP, 0.062, 0.02, 0.008, 0, 0.083, 0.134, rig.head);
      if (A.top === 'croptop') P3(G().box, skin, 0.33, 0.1, 0.2, 0, 0.06, 0.005, rig.torso);
      if (A.top === 'bluse') { P3(G().box, '#ffffff', 0.14, 0.05, 0.02, 0, 0.6, 0.12, rig.torso); for (let k = 0; k < 4; k++) P3(G().sph, '#f4f0e8', 0.01, 0.01, 0.01, 0, 0.5 - k * 0.1, 0.122, rig.torso); }
    }
    // Kleider
    if (DRESS[A.top]) {
      const long = A.top === 'ballkleid', short = A.top === 'sommerkleid', len = long ? 0.98 : short ? 0.42 : 0.55, rB = long ? 0.5 : short ? 0.34 : 0.3;
      P3(new T.CylinderGeometry(0.18, rB, len, 18, 1, true), new T.MeshLambertMaterial({ color: new T.Color(A.topColor), side: T.DoubleSide }), 1, 1, 1, 0, -len / 2 + 0.02, 0, rig.hips);
      if (long) { P3(G().box, metal('#f0c850'), 0.34, 0.04, 0.22, 0, 0.02, 0, rig.torso); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, f = P3(G().box, L.mat('#ffffff'), 0.04, 0.8, 0.015, Math.sin(a) * 0.33, -0.5, Math.cos(a) * 0.33, rig.hips); f.rotation.y = a; f.rotation.x = -Math.cos(a) * 0.3; f.rotation.z = Math.sin(a) * 0.3; f.material = new T.MeshLambertMaterial({ color: new T.Color(A.topColor).lerp(new T.Color('#ffffff'), 0.35) }); } }
      if (short) for (let k = 0; k < 10; k++) P3(G().sph, ['#ffffff', '#ffe070', '#ff90c0'][k % 3], 0.025, 0.025, 0.01, Math.sin(k * 0.63) * 0.25, -0.15 - (k % 3) * 0.08, Math.cos(k * 0.63) * 0.25, rig.hips);
    }
    // Schmuck
    const S = A.schmuck, jm = metal(A.schmuckFarbe || '#f0c850'), all = S === 'alles';
    if (S === 'kette' || all) { P3(new T.TorusGeometry(0.085, 0.006, 6, 24), jm, 1, 1, 1, 0, 0.6, 0.035, rig.torso).rotation.x = 1.25; P3(G().sph, jm, 0.018, 0.022, 0.012, 0, 0.53, 0.115, rig.torso); }
    if (S === 'perlen' || all) for (let k = 0; k < 16; k++) { const a = -1.5 + k * 0.2; P3(G().sph, '#f8f6f0', 0.013, 0.013, 0.013, Math.sin(a) * 0.09, 0.575 - Math.cos(a) * 0.035 * 0 + (Math.abs(a) < 1 ? -0.02 * Math.cos(a) : 0), Math.cos(a) * 0.09 + 0.02, rig.torso); }
    if (S === 'ohrringe' || all) for (const sd of [-1, 1]) { P3(new T.TorusGeometry(0.02, 0.004, 6, 14), jm, 1, 1, 1, sd * 0.137, 0.07, 0.0, rig.head).rotation.y = Math.PI / 2; }
    if (S === 'armbaender' || all) for (const a of rig.arms || []) P3(new T.TorusGeometry(0.06, 0.008, 6, 16), jm, 1, 1, 1, 0, -0.27, 0, a.elbow).rotation.x = Math.PI / 2;
    // Taschen
    const B = A.tasche, bm = L.mat(A.taschenFarbe || '#c02a2a'), gm = metal('#f0c850');
    const left = rig.arms && rig.arms[1];
    if (B === 'handtasche' && left) { const t = new T.Group(); t.position.set(0.04, -0.2, 0.02); left.elbow.add(t); P3(G().box, bm, 0.08, 0.17, 0.24, 0.03, -0.12, 0, t); P3(new T.TorusGeometry(0.07, 0.008, 6, 14, Math.PI), gm, 1, 1, 1, 0.03, -0.035, 0, t).rotation.y = Math.PI / 2; P3(G().box, gm, 0.085, 0.02, 0.04, 0.03, -0.06, 0, t); }
    if (B === 'clutch' && left) { const t = new T.Group(); t.position.set(0.05, -0.33, 0.06); left.elbow.add(t); P3(G().box, bm, 0.05, 0.1, 0.2, 0, 0, 0, t); P3(G().box, gm, 0.055, 0.015, 0.2, 0, 0.04, 0, t); }
    if (B === 'umhaengetasche') { const st = P3(G().box, bm, 0.03, 0.75, 0.02, 0, 0.32, 0.12, rig.torso); st.rotation.z = -0.62; const st2 = P3(G().box, bm, 0.03, 0.75, 0.02, 0, 0.32, -0.12, rig.torso); st2.rotation.z = -0.62; P3(G().box, bm, 0.08, 0.2, 0.26, -0.24, -0.02, 0, rig.torso); P3(G().box, gm, 0.085, 0.03, 0.06, -0.24, 0.05, 0.1, rig.torso); }
    if (B === 'rucksack') { P3(G().box, bm, 0.3, 0.36, 0.14, 0, 0.32, -0.19, rig.torso); P3(G().box, L.mat('#2a2a2a'), 0.26, 0.12, 0.04, 0, 0.22, -0.27, rig.torso); for (const sd of [-1, 1]) P3(G().box, '#2a2a2a', 0.03, 0.4, 0.02, sd * 0.1, 0.38, 0.11, rig.torso); }
    rig.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return rig;
  };
})();
