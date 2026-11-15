'use strict';
// Eigene Karten für jede Welt: Märchenwelt, Mond, Titanenmond, Dimension, Backrooms und jede Insel.
// Die große Karte (M) und die Minikarte zeigen immer die Welt, in der du gerade bist.
// Mit dem Admin-Anzug klickst du auf die Karte und öffnest dort ein Portal; sonst setzt ein Klick einen Wegpunkt.
(function () {
  const L = window.L, P = L.player;
  const circle = (g, x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, 6.283); g.fill(); };
  function seeded(n) { let s = n; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  // ---------- Beschreibung der aktuellen Welt ----------
  function fairyMap() {
    const F = L.FAIRY, LOC = L.FAIRY_LOC; if (!F || !LOC) return null;
    return {
      name: '🏰 MÄRCHENWELT', cx: F.x, cz: F.z, R: F.r + 120, tp: true,
      bg(g, toM, s) {
        const [cx, cy] = toM(F.x, F.z);
        circle(g, cx, cy, (F.r + 40) * s, '#cfe8ff'); circle(g, cx, cy, F.r * s, '#6cc04a');
        // Zauberwald und Nadelwald
        g.fillStyle = 'rgba(30,110,40,0.55)'; { const [a, b] = toM(F.x - 1500, F.z - 450), [c, d] = toM(F.x - 280, F.z + 850); g.fillRect(a, b, c - a, d - b); }
        g.fillStyle = 'rgba(20,80,40,0.6)'; { const [a, b] = toM(F.x - 1450, F.z - 1100), [c, d] = toM(F.x - 700, F.z - 350); g.fillRect(a, b, c - a, d - b); }
        // Wege
        g.strokeStyle = '#ecd8a4'; g.lineWidth = Math.max(1.5, 7 * s); g.lineCap = 'round';
        for (const k of ['dorf', 'schloss', 'eis', 'hoehle', 'lebkuchen', 'oma', 'rapunzel', 'bohne', 'see', 'mine']) { const [a, b] = toM(LOC.platz.x, LOC.platz.z), [c, d] = toM(LOC[k].x, LOC[k].z); g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
        { const [a, b] = toM(LOC.dorf.x, LOC.dorf.z), [c, d] = toM(LOC.muehle.x, LOC.muehle.z); g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
        // See, Schloss, Kristallschloss, Höhle, Dorfplatz
        { const [x, y] = toM(LOC.see.x, LOC.see.z); circle(g, x, y, 160 * s, '#5ab8e8'); }
        { const [a, b] = toM(LOC.schloss.x - 105, LOC.schloss.z - 165), [c, d] = toM(LOC.schloss.x + 105, LOC.schloss.z + 5); g.fillStyle = '#f4eefa'; g.fillRect(a, b, c - a, d - b); }
        { const [x, y] = toM(LOC.eis.x, LOC.eis.z); circle(g, x, y, 60 * s, '#bfeaff'); }
        { const [x, y] = toM(LOC.hoehle.x, LOC.hoehle.z); circle(g, x, y, 160 * s, '#8a7a70'); circle(g, x, y, 46 * s, '#4a3e3a'); }
        { const [x, y] = toM(LOC.mine.x, LOC.mine.z); circle(g, x, y, 70 * s, '#8a7a6a'); }
        { const [x, y] = toM(LOC.dorf.x, LOC.dorf.z); circle(g, x, y, 46 * s, '#e8dcc8'); }
      },
      marks() {
        const out = [];
        for (const k of ['dorf', 'brett', 'ring', 'schloss', 'eis', 'hoehle', 'lebkuchen', 'oma', 'rapunzel', 'bohne', 'see', 'mine', 'muehle', 'fee', 'platz']) { const o = LOC[k], i = o.n.indexOf(' '); out.push([o.x, o.z, o.n.slice(0, i), o.n.slice(i + 1)]); }
        if (L.fairyBeyza) { const b = L.fairyBeyza(); if (b) out.push([b.x, b.z, '💖', 'BEYZA', '#ff9ad0']); }
        return out;
      }
    };
  }
  function moonMap() {
    const M = L.MOON; if (!M) return null; const MR = 1400;
    return {
      name: '🌕 MOND', cx: M.x, cz: M.z, R: MR + 150, tp: true,
      bg(g, toM, s) {
        const [cx, cy] = toM(M.x, M.z); circle(g, cx, cy, MR * s, '#9a9a9e');
        const r = seeded(7); for (let k = 0; k < 60; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * (MR - 80), cr = 15 + r() * 70; const [x, y] = toM(M.x + Math.sin(a) * d, M.z + Math.cos(a) * d); circle(g, x, y, cr * s, '#7e7e84'); circle(g, x - cr * s * 0.15, y - cr * s * 0.15, cr * s * 0.75, '#8a8a90'); }
      },
      marks: () => (L.moonTargets ? L.moonTargets().map((q) => [q[0], q[1], q[2], q[3]]) : [])
    };
  }
  function titanMap() {
    const TT = L.TITAN; if (!TT) return null; const TR = 1100;
    return {
      name: '🪐 TITANENMOND', cx: TT.x, cz: TT.z, R: TR + 150, tp: true,
      bg(g, toM, s) {
        const [cx, cy] = toM(TT.x, TT.z); circle(g, cx, cy, TR * s, '#7a4228');
        const r = seeded(11); for (let k = 0; k < 140; k++) { const a = r() * 6.283, d = 60 + Math.sqrt(r()) * (TR - 90); const [x, y] = toM(TT.x + Math.sin(a) * d, TT.z + Math.cos(a) * d); circle(g, x, y, (2 + r() * 6) * s, '#5a3a2c'); }
        const [ax, ay] = toM(TT.x + 150, TT.z); g.strokeStyle = 'rgba(255,122,48,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(ax, ay, 58 * s, 0, 6.283); g.stroke();
      },
      marks: () => (L.titanWaypoints ? L.titanWaypoints().map((q) => [q[0], q[1], q[2], q[3]]) : [])
    };
  }
  function dimMap() {
    const D = L.DIM; if (!D) return null;
    return {
      name: '🌌 DIMENSION', cx: D.x, cz: D.z, R: 1100, tp: true, bgCol: '#0a0418',
      bg(g, toM, s) {
        const [cx, cy] = toM(D.x, D.z);
        g.strokeStyle = '#b090e0'; g.lineWidth = Math.max(2, 30 * s);
        for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + 0.3; const [x, y] = toM(D.x + Math.sin(a) * 760, D.z + Math.cos(a) * 760); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); circle(g, x, y, 150 * s, '#d8b8ff'); }
        circle(g, cx, cy, 520 * s, '#e8c8f0');
        const r = seeded(5); g.fillStyle = '#fff'; for (let k = 0; k < 120; k++) { const [x, y] = toM(D.x + (r() - 0.5) * 2200, D.z + (r() - 0.5) * 2200); g.fillRect(x, y, 1, 1); }
      },
      marks() { const o = []; if (L.DIM_PORTAL) o.push([L.DIM_PORTAL.x, L.DIM_PORTAL.z, '🌀', 'Heimweg']); if (L.dimCheckpoint) { const c = L.dimCheckpoint(); o.push([c.x, c.z, '✅', 'Checkpoint']); } return o; }
    };
  }
  function islandMap(I) {
    let cx = I.x, cz = I.z, R = I.r + 260;
    if (I.id === 'asgard' && L.ASGARD) { const A = L.ASGARD; cx = (I.x + A.x) / 2; cz = (I.z + A.z) / 2; R = Math.hypot(A.x - I.x, A.z - I.z) / 2 + 520; }
    return {
      name: (I.icon || '🏝️') + ' ' + I.name.toUpperCase(), cx, cz, R, tp: true, bgCol: '#1e4a66',
      bg(g, toM, s) {
        const [x, y] = toM(I.x, I.z); circle(g, x, y, (I.r + 30) * s, I.beach || '#e8d8a0'); circle(g, x, y, I.r * s, (I.ground && I.ground[0]) || '#6aa04a');
        const r = seeded(I.x * 7 + I.z + 99); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 90; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * (I.r - 40); const [px, py] = toM(I.x + Math.sin(a) * d, I.z + Math.cos(a) * d); g.beginPath(); g.arc(px, py, Math.max(1, (4 + r() * 10) * s), 0, 6.283); g.fill(); }
        if (I.vol) { const [vx, vy] = toM(I.vol.x, I.vol.z); circle(g, vx, vy, 100 * s, '#3a2a26'); circle(g, vx, vy, 30 * s, '#ff5a1e'); }
      },
      marks() {
        const o = [[I.x, I.z, '✅', 'Checkpoint']];
        if (I.shelter) o.push([I.shelter.x, I.shelter.z, '🛡️', 'Zuflucht', '#7cf']);
        if (I.vol) o.push([I.vol.x, I.vol.z, '🌋', 'Vulkan']);
        if (I.id === 'asgard' && L.ASGARD) { o.push([L.ASGARD.x, L.ASGARD.z, '🌈', 'Asgard']); if (L.ASGARD.obs) o.push([L.ASGARD.obs.x, L.ASGARD.obs.z, '🗡️', 'Heimdall']); }
        for (const v of L.ents.vehicles) if (v.isl === I || Math.hypot(v.x - I.x, v.z - I.z) < I.r) { if (v.t.plane || v.t.heli || v.t.special) o.push([v.x, v.z, v.t.plane ? '✈️' : v.t.heli ? '🚁' : '🏎️', v.t.name]); else o.push([v.x, v.z, '·', '', '#ddd']); }
        return o;
      }
    };
  }
  function backMap() {
    return { name: '🟨 BACKROOMS', cx: P.x, cz: P.z, R: 300, tp: false, back: true, bgCol: '#3a3410', bg() {}, marks: () => [] };
  }
  L.localMap = function () {
    const x = P.x, z = P.z;
    if (L.inBack && L.inBack(x)) return backMap();
    if (L.inFairy && L.inFairy(x, z)) return fairyMap();
    if (L.inTitan && L.inTitan(x, z)) return titanMap();
    if (L.inMoon && L.inMoon(x)) return moonMap();
    if (L.inDim(x)) return dimMap();
    const I = L.curIsland || (L.islandAt && L.islandAt(x, z));
    if (I && !I.dim) return islandMap(I);
    return null;
  };

  // ---------- Zeichnen ----------
  function arrow(g, x, y, yaw, size, col) {
    g.save(); g.translate(x, y); g.rotate(Math.atan2(Math.cos(yaw), Math.sin(yaw))); g.fillStyle = col; g.strokeStyle = '#000'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(size, 0); g.lineTo(-size * 0.7, size * 0.6); g.lineTo(-size * 0.4, 0); g.lineTo(-size * 0.7, -size * 0.6); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  function sameWorld(x, z) { return L.worldOf ? L.worldOf(x, z) === L.worldOf(P.x, P.z) : true; }
  function players(g, toM, big) {
    for (const fr of (L.remotes ? L.remotes.values() : [])) {
      if (!fr.inRound || fr.gone || !sameWorld(fr.x, fr.z)) continue;
      const [fx, fy] = toM(fr.x, fr.z), col = L.mp && L.mp.color ? L.mp.color(fr.pid) : '#8cf';
      arrow(g, fx, fy, fr.yaw, big ? 10 : 8, fr.alive ? col : '#777');
      if (big) { g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText(fr.name, fx + 1, fy - 13); g.fillStyle = col; g.fillText(fr.name, fx, fy - 14); }
    }
  }
  function marks(g, toM, list, big, S) {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const m of list) {
      const [x, y] = toM(m[0], m[1]); if (x < -20 || y < -20 || x > S + 20 || y > S + 20) continue;
      if (m[2] === '·') { g.fillStyle = m[4] || '#ddd'; g.fillRect(x - 2, y - 2, 4, 4); continue; }
      g.font = (big ? 22 : 15) + 'px sans-serif'; g.fillStyle = '#fff'; g.fillText(m[2], x, y);
      if (big && m[3]) { g.font = 'bold 12px sans-serif'; g.fillStyle = '#000'; g.fillText(m[3], x + 1, y + 17); g.fillStyle = m[4] || '#fff'; g.fillText(m[3], x, y + 16); }
    }
    if (L.waypoint && sameWorld(L.waypoint.x, L.waypoint.z)) { const [x, y] = toM(L.waypoint.x, L.waypoint.z); g.font = (big ? 24 : 16) + 'px sans-serif'; g.fillText('📍', x, y - 6); }
  }
  // große Karte
  L.drawLocalBig = function (c, lm) {
    const g = c.getContext('2d'), S = c.width, k = S / (lm.R * 2), ox = lm.R - lm.cx, oz = lm.R - lm.cz;
    const toM = (x, z) => [(x + ox) * k, (z + oz) * k];
    g.fillStyle = lm.bgCol || '#bfe0f8'; g.fillRect(0, 0, S, S);
    L.bigMapXform = { k, ox, oz };
    if (lm.back) {
      g.fillStyle = '#fff6c8'; g.textAlign = 'center'; g.font = 'bold 22px sans-serif'; g.fillText('🟨 BACKROOMS – keine Karte', S / 2, S / 2 - 20);
      g.font = '15px sans-serif'; g.fillText('Die Räume verschieben sich ständig. Suche Türen 🚪 – Heimweg: Pause-Menü → 🌈 Zurück beamen', S / 2, S / 2 + 12);
      L.bigMapXform = null; return;
    }
    lm.bg(g, toM, k);
    if (L.mapExtra) { try { L.mapExtra(g, toM, true); } catch (e) { /* egal */ } }
    marks(g, toM, lm.marks(), true, S);
    players(g, toM, true);
    const [px, py] = toM(P.x, P.z); arrow(g, px, py, P.vehicle ? P.vehicle.yaw : P.camYaw, 11, '#ffe080');
    g.textAlign = 'center'; g.font = 'bold 16px sans-serif'; g.fillStyle = '#000'; g.fillText(lm.name, S / 2 + 1, 19); g.fillStyle = '#ffe080'; g.fillText(lm.name, S / 2, 18);
    g.font = '13px sans-serif'; g.textAlign = 'left'; g.fillStyle = '#fff';
    const km = Math.round(lm.R * 2 / 100) / 10;
    g.fillText((lm.tp && L.suitOn && L.suitOn() ? '🛡️ Klick = Portal dorthin öffnen' : 'Klick = Wegpunkt 📍') + ' · Norden ist oben · ' + km + ' × ' + km + ' km', 10, S - 12);
  };
  // Minikarte (rund, mit dir in der Mitte)
  L.drawLocalMini = function (g, S, view, lm) {
    const s = S / view, toM = (x, z) => [S / 2 + (x - P.x) * s, S / 2 + (z - P.z) * s];
    g.save(); g.clearRect(0, 0, S, S);
    g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.clip();
    g.fillStyle = lm.bgCol || '#bfe0f8'; g.fillRect(0, 0, S, S);
    if (!lm.back) { lm.bg(g, toM, s); marks(g, toM, lm.marks(), false, S); players(g, toM, false); }
    else { g.fillStyle = '#d8c050'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText('??? keine Karte', S / 2, S / 2 + 30); }
    arrow(g, S / 2, S / 2, P.vehicle ? P.vehicle.yaw : P.camYaw, 9, '#ffe080');
    g.restore();
    g.fillStyle = '#fff'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center'; g.fillText('N', S / 2, 9);
  };
})();
