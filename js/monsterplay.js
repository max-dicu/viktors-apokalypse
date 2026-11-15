'use strict';
// Als Monster spielen: im Hauptmenü „Spielen als“ wählen (kein Freischalten nötig).
// Du hast den Körper und die Bewegung des Monsters, eigene Werte (Tempo, Zähigkeit) und zwei Angriffe:
// Biss/Klaue (Taste 1) und Schrei (Taste 2, lähmt Menschen). Die anderen Monster greifen dich nicht an.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const KINDS = [['viktor', '🧟 Viktor'], ['daniel', '👮 Daniel'], ['langer', '🦒 Langer Viktor'], ['rollerviktor', '🛴 Roller-Viktor'], ['capydaniel', '🦫 Capybara-Daniel'], ['walross', '🦭 Walross'],
    ['rufer', '📢 Der Rufer'], ['starrende', '👁️ Der Gesichtslose'], ['blockling', '🧊 Blockling'], ['schwelle', '🚪 Schwellengänger'], ['greifer', '🦾 Greifer'], ['marsianer', '👽 Marsianer']];
  L.MONSTER_KINDS = KINDS;
  const MK = () => L.MK || {};
  const kindOf = () => { const k = L.save && L.save.char && L.save.char.monsterKind; return k && MK()[k] ? k : null; };
  L.monsterKind = () => (P.rig && P.rig.monsterKind) || null;

  // ---------- Figur ----------
  const obh = L.buildHuman;
  L.buildHuman = function (app, force) {
    const k = app && app.monsterKind;
    if (k && MK()[k]) {
      const r = MK()[k].build(k === 'viktor' ? 'grey' : undefined);
      r.monsterKind = k; r.app = Object.assign({}, app); r.arms = r.arms || []; r.legs = r.legs || [];
      if (!r.hand) { r.hand = new T.Group(); r.root.add(r.hand); r.hand.position.set(0.3, 1.2, 0.3); }
      r.root.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(r.root); r.monH = Math.max(1, bb.max.y - bb.min.y);
      return r;
    }
    return obh(app, force);
  };
  // Animation: Monster-Bewegung statt Menschen-Animation
  const oah = L.animHuman;
  L.animHuman = function (r, s) {
    if (r && r.monsterKind) {
      const D = MK()[r.monsterKind]; if (!D) return;
      const m = s.mode, mode = m === 'dead' ? 'dead' : r === P.rig && H.atkT > 0 ? 'attack' : m === 'run' ? 'run' : (m === 'walk' && (s.speed || 0) > 0.15) ? 'walk' : m === 'crouch' || m === 'crawl' ? 'crawl' : m === 'jump' ? 'run' : 'idle';
      D.anim(r, { mode, phase: (s.phase || 0) * 0.55, atk: r === P.rig ? 1 - H.atkT / 0.5 : 0, speed: s.speed });
      return;
    }
    return oah(r, s);
  };
  const osh = L.setHeld;
  L.setHeld = function (rig, type) { if (rig && rig.monsterKind) { rig.heldType = null; return; } return osh(rig, type); };

  // ---------- Werte ----------
  const H = { atkT: 0, roarCd: 0 };
  const stat = () => { const k = L.monsterKind(); if (!k) return null; const D = MK()[k]; return { D, run: (D.spd ? D.spd[2] : 9) / 6.5, tough: L.clamp(110 / (D.hp || 110), 0.25, 1.1), h: P.rig.monH || 2 }; };
  const ohs = L.heroSpeed; L.heroSpeed = () => { const s = stat(); return s ? L.clamp(s.run, 0.8, 2.2) : (ohs ? ohs() : 1); };
  const ohd = L.heroDmgMul; L.heroDmgMul = () => { const s = stat(); return s ? s.tough : (ohd ? ohd() : 1); };
  const ohi = L.heroInvis; L.heroInvis = () => !!L.monsterKind() || (ohi ? ohi() : false); // die anderen Monster halten dich für einen von ihnen
  const ohz = L.heroSize; L.heroSize = () => { const s = stat(); return s ? Math.max(1, s.h / 2.8) : (ohz ? ohz() : 1); };

  // ---------- Angriffe ----------
  const A = (name, icon, rate, extra) => Object.assign({ name, slot: 'waffe', icon, dmg: 0, rate, noise: 60, range: 4, ammo: null, mag: 1, spread: 0, energy: true, mon: true }, extra || {});
  Object.assign(L.ITEMS, { mbiss: A('Biss / Klaue', '🦷', 0.7), mschrei: A('Schrei', '📢', 8, { noise: 150, range: 25 }) });
  L.monsterStart = function () {
    const k = L.monsterKind(); if (!k) return;
    for (let i = 0; i < P.hot.length; i++) P.hot[i] = null;
    P.hot[0] = { type: 'mbiss', count: 1, mag: 1 }; P.hot[1] = { type: 'mschrei', count: 1, mag: 1 }; P.sel = 0;
    const nm = (KINDS.find((q) => q[0] === k) || [k, k])[1];
    setTimeout(() => L.banner('👾 DU BIST ' + nm.toUpperCase(), 'Die Monster halten dich für einen von ihnen. Taste 1 = Biss/Klaue · Taste 2 = Schrei. Jag die Menschen!'), 800);
  };
  const enemies = () => (L._targets ? L._targets() : []).filter((e) => !(MK()[e.kind]) && !e.dead);
  const owf = L.weaponFire;
  L.weaponFire = function (w, d) {
    if (!d || !d.mon) return owf(w, d);
    const s = stat(); if (!s) return true;
    P.fireCd = d.rate;
    const f = new T.Vector3(); L.camera.getWorldDirection(f); f.y = 0; f.normalize();
    if (w.type === 'mbiss') {
      H.atkT = 0.5; const reach = (s.D.reach || 2.8) + 0.5, dmg = Math.max(30, (s.D.dmg || 35) * 1.6), cx = P.x + f.x * reach * 0.6, cz = P.z + f.z * reach * 0.6;
      let n = 0;
      for (const e of enemies()) { const dd = L.heroDistTo ? L.heroDistTo(e, cx, (P.y || 0) + 1.2, cz) : Math.hypot(e.x - cx, e.z - cz); if (dd > reach) continue; L.damageEnt(e, dmg, P.x, P.z, P); n++; }
      if (n) { L.blood && L.blood(cx, 1.3, cz, 8); L.shake = Math.max(L.shake, 0.3); }
      s.D.voice && s.D.voice({ x: P.x, y: 2, z: P.z });
    } else if (w.type === 'mschrei') {
      H.atkT = 0.9; const now = performance.now();
      if (now < H.roarCd) { L.msg('⏳ Der Schrei lädt noch …', 900); return true; }
      H.roarCd = now + 8000;
      L.snd.bossRoar ? L.snd.bossRoar({ x: P.x, y: 2, z: P.z }) : null; L.shake = Math.max(L.shake, 0.5);
      let n = 0;
      for (const e of enemies()) { if (Math.hypot(e.x - P.x, e.z - P.z) > 25) continue; if (e.kind === 'npc') { e.stunT = Math.max(e.stunT || 0, 4); e.alertT = 0; e.hostile = false; } L.damageEnt(e, 15, P.x, P.z, P); n++; }
      L.msg('📢 Schrei: ' + n + ' Menschen erstarren vor Angst!', 2000);
    }
    L.makeNoise(P.x, P.z, d.noise, P);
    return true;
  };
  L.updateMonsterPlay = function (dt) { H.atkT = Math.max(0, H.atkT - dt); };

  // ---------- Auswahl im Hauptmenü ----------
  function addMenu() {
    const btn = document.getElementById('btnChar'); if (!btn || document.getElementById('playAs')) return;
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;align-items:center;gap:8px;justify-content:center;margin:6px 0;font-weight:700;color:#e8e2cc';
    wrap.innerHTML = '<label for="playAs">👾 Spielen als</label>';
    const sel = document.createElement('select'); sel.id = 'playAs'; sel.style.cssText = 'padding:6px 10px;border-radius:8px;background:#1a1b20;color:#fff;border:1px solid #555;font-weight:700';
    sel.innerHTML = '<option value="">🙂 Mensch</option>' + KINDS.map(([k, n]) => '<option value="' + k + '">' + n + '</option>').join('');
    sel.value = kindOf() || '';
    sel.onchange = () => { const c = Object.assign({}, L.DEFAULT_CHAR, L.save.char || {}); if (sel.value) c.monsterKind = sel.value; else delete c.monsterKind; L.save.char = c; L.persist(); };
    wrap.appendChild(sel);
    const row = btn.parentElement; row.parentElement.insertBefore(wrap, row.nextSibling);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', addMenu); else addMenu();
  setInterval(addMenu, 2000);
})();
