'use strict';
// Code-Skin „👑 Prinzessin Beyza“: sieht aus wie BEYZA aus der Märchenwelt (lange dunkelbraune Locken, rosa Ballkleid,
// Blumenkranz mit Diadem) – nur in normaler Größe. Beim Laufen glitzert eine kleine Feenstaub-Spur hinter ihr.
// Wird über das Helden-Code-System freigeschaltet (gespeichert wird nur ein Hash).
(function () {
  const L = window.L, T = THREE, P = L.player;
  const ID = 'beyza', PK = '27s0vmuhiy5';
  const ok = (app) => !!(app && typeof app.hk === 'string' && L.hash53(app.hk) === PK);
  const oTok = L.heroToken, oChk = L.heroCheck;
  L.heroToken = (id) => { if (id !== ID) return oTok ? oTok(id) : null; const k = L.save && L.save.heroKeys && L.save.heroKeys[ID]; return k && L.hash53(L.hash53(k)) === PK ? L.hash53(k) : null; };
  L.heroCheck = (code) => (L.hash53(L.hash53(code)) === PK ? ID : oChk ? oChk(code) : null);
  L.SKINS.push(['h_' + ID, '👑 Prinzessin Beyza']);
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    if (app && app.special === 'h_' + ID) {
      if (!force && !ok(app)) return obh(Object.assign({}, app, { special: '' }), force);
      if (!L.buildBeyzaRig) return obh(Object.assign({}, app, { special: '' }), force);
      const rig = L.buildBeyzaRig();
      rig.app = Object.assign({}, rig.app, app); rig.princess = true;
      return rig;
    }
    return obh(app, force);
  };
  // Glitzerspur beim Laufen
  let st = 0;
  const oapa = L.afterPlayerAnim;
  L.afterPlayerAnim = function (r, dt) {
    if (oapa) oapa(r, dt);
    if (!r || !r.princess) return;
    st -= dt; const sp = Math.hypot(P.vx || 0, P.vz || 0);
    if (sp > 0.5 && st <= 0) { st = 0.05; L.fx(L.pick(['#ffd0f0', '#ffe070', '#c8e8ff', '#ffffff']), P.x + L.rand(-0.3, 0.3), (P.y || 0) + 0.15, P.z + L.rand(-0.3, 0.3), 1, 0.4, { basic: true, size: 0.08, life: 0.8 }); }
  };
})();
