'use strict';
// TikTok-Trailer 5 (~32 s): kurz geschnitten, alles vorgeladen (kein Ruckeln), nur Intro-/Outro-Text (+ „JOYOR PREISLEISTUNG“).
// Nur auf dem Gerät mit dem Krücken-Code, einmalig.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

  // ---------- Musik + Effekte ----------
  function music(A, t0, E) {
    const out = A.createGain(); out.gain.value = 0.85; const comp = A.createDynamicsCompressor(); out.connect(comp); comp.connect(A.destination);
    const rv = A.createConvolver(), ir = A.createBuffer(2, A.sampleRate * 2, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); } rv.buffer = ir; const rg = A.createGain(); rg.gain.value = 0.28; rv.connect(rg); rg.connect(out);
    const nb = A.createBuffer(1, A.sampleRate * 3, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const at = (x) => t0 + x;
    const osc = (type, f, s, d, v, f2, cut, rev) => { const o = A.createOscillator(), g = A.createGain(), fl = A.createBiquadFilter(); o.type = type; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); fl.type = 'lowpass'; fl.frequency.value = cut || 8000; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + d); o.connect(fl); fl.connect(g); g.connect(out); if (rev) g.connect(rv); o.start(s); o.stop(s + d + 0.05); return fl; };
    const noise = (s, d, v, type, f, f2, q) => { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; fl.type = type || 'lowpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f || 1000, s); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, s + d); g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(0.0001, s + d); n.connect(fl); fl.connect(g); g.connect(out); g.connect(rv); n.start(s, Math.random()); n.stop(s + d + 0.05); };
    const kick = (s, v) => osc('sine', 150, s, 0.35, v || 0.9, 40);
    const snare = (s) => { noise(s, 0.18, 0.5, 'bandpass', 1800, 1200, 0.8); osc('triangle', 220, s, 0.1, 0.25, 120); };
    const hat = (s, v) => noise(s, 0.05, v || 0.12, 'highpass', 8000);
    const braam = (s, d) => { [36.7, 55, 73.4, 87.3, 110].forEach((f, i) => { const fl = osc('sawtooth', f, s, d, 0.22 / (1 + i * 0.4), 0, 200, true); fl.frequency.setValueAtTime(200, s); fl.frequency.exponentialRampToValueAtTime(2400, s + 0.25); fl.frequency.exponentialRampToValueAtTime(300, s + d); }); kick(s, 1); };
    const whoosh = (s) => noise(s, 0.45, 0.3, 'bandpass', 600, 3000, 1.5);
    const impact = (s) => { osc('sine', 90, s, 1.2, 1, 28); noise(s, 0.6, 0.7, 'lowpass', 2500, 200); };
    const B = 60 / 150, bass = [36.7, 36.7, 43.6, 32.7], pat = [293.7, 293.7, 349.2, 293.7, 329.6, 293.7, 261.6, 293.7];
    braam(at(0.1), 2.4);
    for (let b = 0; 2.5 + b * B < E.outro; b++) {
      const x = 2.5 + b * B, drop = x > E.drop;
      kick(at(x), drop ? 1 : 0.8); if (b % 2) snare(at(x)); hat(at(x + B / 2)); if (drop) { hat(at(x + B / 4), 0.08); hat(at(x + B * 0.75), 0.08); }
      if (b % 4 === 0) osc('sawtooth', bass[(b / 4) % 4], at(x), B * 3.8, 0.28, 0, 260);
      osc('sawtooth', pat[b % 8], at(x), 0.14, 0.05, 0, 1500); osc('sawtooth', pat[(b + 4) % 8], at(x + B / 2), 0.12, 0.04, 0, 1500);
    }
    E.cuts.forEach((x) => whoosh(at(x - 0.2))); E.hits.forEach((x) => impact(at(x))); E.braams.forEach((x) => braam(at(x), 2.5));
    [146.8, 174.6, 220, 293.7].forEach((f) => osc('triangle', f, at(E.outro), 4, 0.05, 0, 3000, true)); braam(at(E.outro), 3.5);
    return out;
  }

  function start() {
    const keep = { char: L.save.char, gaunt: L.save.gauntlet };
    L.save.char = Object.assign({}, L.DEFAULT_CHAR, { special: 'h_marlon', hk: L.heroToken('marlon') });
    L._catBypass = true; document.getElementById('btnPlay').click(); L._catBypass = false;
    const css = document.createElement('style');
    css.textContent = `body.trl5>*:not(#c):not(#trl5){visibility:hidden!important}#trl5{position:fixed;inset:0;z-index:500;pointer-events:none}
    #t5Dip{position:absolute;inset:0;background:#000;opacity:1}#t5Fl{position:absolute;inset:0;background:#fff;opacity:0}#t5In{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8e2cc;text-align:center}
    #t5Joy{position:absolute;left:0;right:0;top:38%;text-align:center;font:900 clamp(34px,8vw,96px) Impact,'Arial Black';color:#ffde20;-webkit-text-stroke:3px #000;text-shadow:0 6px 0 #000;transform:scale(.3) rotate(-6deg);opacity:0}
    #t5Joy.on{animation:t5p .3s cubic-bezier(.2,1.7,.4,1) forwards}@keyframes t5p{to{transform:scale(1) rotate(-6deg);opacity:1}}#t5Prep{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:700 22px Arial;background:#000;pointer-events:auto;cursor:pointer;text-align:center;gap:12px}`;
    document.head.appendChild(css);
    const wrap = document.createElement('div'); wrap.id = 'trl5'; wrap.innerHTML = '<div id="t5Dip"></div><div id="t5In"></div><div id="t5Joy"></div><div id="t5Fl"></div><div id="t5Prep"><div>⏳ Trailer wird vorbereitet …</div><div id="t5Bar" style="font-size:16px;opacity:.7">0 %</div></div>';
    document.body.appendChild(wrap);
    const q = (id) => wrap.querySelector(id);
    const U = { wrap, css, dip: q('#t5Dip'), fl: q('#t5Fl'), intro: q('#t5In'), joy: q('#t5Joy'), prep: q('#t5Prep'), bar: q('#t5Bar') };
    U.dipIt = () => { U.dip.style.transition = 'none'; U.dip.style.opacity = '1'; requestAnimationFrame(() => { U.dip.style.transition = 'opacity .25s'; U.dip.style.opacity = '0'; }); };
    U.flash = (o) => { U.fl.style.transition = 'none'; U.fl.style.opacity = String(o || 1); requestAnimationFrame(() => { U.fl.style.transition = 'opacity .45s'; U.fl.style.opacity = '0'; }); };
    setTimeout(() => go(keep, U), 1500);
  }

  function go(keep, U) {
    document.body.classList.add('trl5');
    try { L.renderer.setPixelRatio(1); } catch (e) { /* egal */ }
    L.mGodOn = true; L.mGodNoTag = true; P.spawnProt = 9999; L.save.gauntlet = true;
    const tp = (x, z, y) => { if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true); P.vehicle = null; P.x = x; P.z = z; P.y = y || 0; P.vx = P.vz = P.vy = 0; P.flying = 0; P.air = false; };
    const sky = (time, w) => { L.env.time = time; if (L.setWeather) L.setWeather(w); L.env.wT = 999; L.env.rain = /regen|gewitter/.test(w) ? 1 : 0; };
    const fire = (slot, type) => { P.hot[slot] = { type, count: 1, mag: 1 }; P.sel = slot; P.fireCd = 0; try { L.weaponFire(P.hot[slot], L.ITEMS[type]); } catch (e) { /* egal */ } };
    const mon = (k, x, z) => { try { return L._spawnMonster(k, x, z); } catch (e) { return null; } };
    const used = []; const meadow = (rad, seed) => { for (let k = 0; k < 1500; k++) { const a = (k + seed * 37) * 0.53, d = 450 + (k % 18) * 50, cx = Math.sin(a) * d, cz = Math.cos(a) * d; if (Math.abs(cx) > 1350 || Math.abs(cz) > 1350) continue; let ok = true; try { ok = !L.queryBoxes(cx, cz, rad).some((b) => b.h > 1.5) && !L.queryBoxes(cx, cz + 90, rad * 0.6).some((b) => b.h > 1.5); } catch (e) { ok = true; } if (ok && used.every((p) => Math.hypot(p[0] - cx, p[1] - cz) > 160)) { used.push([cx, cz]); return [cx, cz]; } } return [900, 900]; };
    const SP = {}; ['u', 'm', 'w', 'n', 'c', 'g', 'r', 'j', 'f', 'v', 'p'].forEach((k) => { SP[k] = meadow(k === 'w' ? 40 : 60, k.charCodeAt(0)); });
    const tpS = (k) => tp(SP[k][0], SP[k][1]);
    const props = []; const prop = (o, x, y, z, s) => { if (!o) return null; const r = o.rig ? o.rig.root : (o.root || o.g || o); if (!r || !r.isObject3D) return null; if (r.parent) r.parent.remove(r); if (s) r.scale.setScalar(s); r.position.set(x, y, z); r.traverse((m) => { m.frustumCulled = false; }); L.scene.add(r); props.push(r); return r; };
    // ---------- Darsteller vorab bauen (kein Nachladen während der Aufnahme) ----------
    const A0 = {};
    const W = { kill: 0 };
    // Masik mit Zauberkreis
    A0.massig = L.buildMasik ? L.buildMasik() : null; if (A0.massig) { A0.massig.cape.visible = A0.massig.horns.visible = true; prop(A0.massig.g, SP.m[0], 6, SP.m[1], 6); }
    A0.mring = new T.Mesh(new T.TorusGeometry(9, 0.25, 8, 64), new T.MeshBasicMaterial({ color: 0x60ff90, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false })); A0.mring.rotation.x = Math.PI / 2; A0.mring.position.set(SP.m[0], 0.3, SP.m[1]); L.scene.add(A0.mring); props.push(A0.mring);
    // fliegende Walrosse
    A0.wal = []; for (let i = 0; i < 6; i++) { const w = L.buildWalross(); prop(w, SP.w[0] + (i - 2.5) * 14, 30 + (i % 2) * 8, SP.w[1] - i * 10, 3 + (i % 3)); A0.wal.push(w); }
    // NINA + Walrosse aus dem Boden
    A0.nina = prop(L._buildIslandBoss && L._buildIslandBoss('nina'), SP.n[0], 0, SP.n[1] + 40);
    A0.nwal = []; for (let i = 0; i < 5; i++) { const w = L.buildWalross(); prop(w, SP.n[0] + (i - 2) * 9, -8, SP.n[1] + 22 + (i % 2) * 6, 1.6); A0.nwal.push(w); }
    // Fahrzeuge
    const veh = (type, x, z, yaw) => { try { L._g.spawnVehicle({ type, x, z, yaw }); const vs = L.ents.vehicles; return vs[vs.length - 1]; } catch (e) { return null; } };
    A0.veh = veh;
    // Bifröst-Säule in Asgard
    { const ob = L.ASGARD.obs || L.ASGARD; A0.bif = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, 400, 24, 1, true), new T.MeshBasicMaterial({ map: L.rainbowTex ? L.rainbowTex() : null, transparent: true, opacity: 0.75, side: T.BackSide, blending: T.AdditiveBlending, depthWrite: false })); A0.bif.position.set(ob.x + 4, L.ASGARD.y + 200, ob.z + 4); L.scene.add(A0.bif); props.push(A0.bif); }
    // ---------- Szenen ----------
    const omniXZ = () => (L.omni ? [L.omni.x, L.omni.z] : [SP.u[0], SP.u[1] + 70]);
    const SH = [
      // Masik – Loki-Katze mit Zauberkreis
      { d: 1.5, place() { tpS('m'); sky(21, 'klar'); }, cam(u) { const M = A0.massig; if (M) { M.g.position.y = 6 + Math.sin(u * 3) * 0.4; M.g.rotation.y = Math.sin(u) * 0.3; M.cape.rotation.x = 1.3 + Math.sin(u * 6) * 0.1; } A0.mring.rotation.z += 0.05; return { x: SP.m[0] + lerp(2, 1.2, u / 1.5), y: 9.5, z: SP.m[1] + lerp(10, 6, u / 1.5), lx: SP.m[0], ly: 8.5, lz: SP.m[1] }; } },
      // Viktor & Daniel rennen auf die Kamera zu
      { d: 1.3, place() { tpS('v'); sky(23.5, 'nebel'); P.camYaw = 0; }, spawn() { ['viktor', 'daniel', 'viktor', 'daniel', 'rollerviktor'].forEach((k, i) => mon(k, P.x + (i - 2) * 4, P.z + 20 + (i % 2) * 4)); }, cam(u) { return { x: P.x + 1, y: 1.2, z: P.z + 2 + u * 0.5, lx: P.x, ly: 1.8, lz: P.z + 20 }; } },
      // Infinity-Ultron gegen Infinity-Koloss: Hand hoch
      { d: 2.0, place() { tpS('u'); sky(19.5, 'klar'); }, cam(u) { const O = L.omni, H2 = O && O.hulk; const hx = H2 ? H2.x : P.x, hz = H2 ? H2.z : P.z, [ox, oz] = omniXZ(); const fx = ox - hx, fz = oz - hz, d = Math.hypot(fx, fz) || 1; return { x: hx - fx / d * 60 + fz / d * 85, y: 40, z: hz - fz / d * 60 - fx / d * 85, lx: (hx + ox) / 2, ly: 70, lz: (hz + oz) / 2 }; } },
      // The Strongest Battlegrounds: Faust-Kombo + Speed-Lines
      { d: 1.4, place() { tpS('g'); sky(14, 'klar'); P.camYaw = 0; P.sel = -1; }, spawn() { ['greifer', 'viktor', 'daniel'].forEach((k, i) => mon(k, P.x + (i - 1) * 4, P.z + 10 + i * 2)); setTimeout(() => { fire(3, 'kr_beben'); L.speedLines && L.speedLines(0.4); }, 120); setTimeout(() => { P.camYaw = 0; fire(0, 'kr_wurf'); L.speedLines && L.speedLines(0.5); }, 750); }, cam(u) { return { x: P.x + 5, y: 2.6, z: P.z - 3 + u * 2, lx: P.x, ly: 2, lz: P.z + 8 }; } },
      // Krücken-Tornado
      { d: 1.3, place() { tpS('j'); sky(17.5, 'gewitter'); }, spawn() { ['viktor', 'blockling', 'marsianer'].forEach((k, i) => mon(k, P.x + Math.sin(i * 2) * 6, P.z + Math.cos(i * 2) * 6)); setTimeout(() => fire(1, 'kr_tornado'), 60); }, cam(u) { return { x: P.x - 22, y: 9, z: P.z - 16, lx: P.x, ly: 10, lz: P.z }; } },
      // fliegende Walrosse – ohne Reiter
      { d: 1.2, place() { tp(SP.w[0], SP.w[1] + 40); sky(11, 'klar'); }, cam(u) { A0.wal.forEach((w, i) => { const r = w.root; r.position.z = SP.w[1] - i * 10 + u * 35; r.rotation.set(0.1, 0, Math.sin(u * 6 + i) * 0.2); if (r.userData.walrus && r.userData.walrus.flips) r.userData.walrus.flips.forEach((f, k) => { f.rotation.z = (k ? 1 : -1) * (0.4 + Math.sin(u * 14 + i) * 0.9); }); }); return { x: SP.w[0] + 30, y: 28, z: SP.w[1] + 40, lx: SP.w[0], ly: 32, lz: SP.w[1] + u * 30 }; } },
      // Asgard: Heimdall schickt dich durch den Bifröst
      { d: 1.3, place() { const ob = L.ASGARD.obs || L.ASGARD; tp(ob.x + 4, ob.z + 4, L.ASGARD.y); sky(19, 'klar'); }, cam(u) { A0.bif.rotation.y += 0.1; const lift = Math.max(0, u - 0.5) * 20; P.y = L.ASGARD.y + lift; return { x: P.x + 24, y: L.ASGARD.y + 8 + lift * 0.6, z: P.z + 18, lx: P.x, ly: L.ASGARD.y + 3 + lift, lz: P.z }; }, end() { U.flash(1); } },
      // Backrooms
      { d: 1.0, place() { try { L.backEnter(0); } catch (e) { /* egal */ } P.camYaw = 0; }, cam(u) { return { x: P.x, y: 1.6, z: P.z - 2 + u * 1.5, lx: P.x + Math.sin(u) * 2, ly: 1.5, lz: P.z + 10 }; } },
      // NINA beschwört Walrosse
      { d: 1.2, place() { tpS('n'); sky(15.5, 'wolkig'); }, cam(u) { A0.nwal.forEach((w, i) => { w.root.position.y = Math.min(0, -8 + Math.max(0, u - i * 0.12) * 14); }); return { x: SP.n[0] + 6, y: 8, z: SP.n[1] - 6, lx: SP.n[0], ly: 14, lz: SP.n[1] + 32 }; } },
      // Richard entsteht (Ruslan-Walross-Film)
      { d: 1.7, place() { tpS('r'); sky(13, 'klar'); }, cam() { const C = L.ruslanBoss && L.ruslanBoss.cam; return C && (C.x || C.y) ? C : { x: P.x, y: 30, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; } },
      // Autos, E-Roller, fliegender E-Roller, teleportierender E-Roller
      { d: 1.6, place() { tpS('c'); sky(12, 'klar'); }, spawn() { if (!A0.car) { A0.car = veh('sportwagen', SP.c[0] - 6, SP.c[1], 0); A0.joy = veh('joyort10', SP.c[0], SP.c[1], 0); A0.joy6 = veh('joyort6e', SP.c[0] + 6, SP.c[1], 0); } }, cam(u) { const z0 = SP.c[1]; if (A0.car) { A0.car.z = z0 + u * 30; A0.car.rig.root.position.set(A0.car.x, 0, A0.car.z); } if (A0.joy) { A0.joy.z = z0 + u * 24; const y = Math.max(0, (u - 0.4) * 9); A0.joy.rig.root.position.set(A0.joy.x, y, A0.joy.z); } if (A0.joy6) { const tpd = u > 0.8 ? 18 : 0; A0.joy6.z = z0 + u * 22 + tpd; A0.joy6.rig.root.position.set(A0.joy6.x, 0, A0.joy6.z); if (u > 0.8 && !this.tpd) { this.tpd = true; U.flash(0.5); } } return { x: SP.c[0] + 14, y: 4, z: z0 - 6 + u * 20, lx: SP.c[0], ly: 2, lz: z0 + 8 + u * 22 }; } },
      // BIG MAMA: Suplex auf Bernhard
      { d: 2.4, place() { tp(SP.r[0], SP.r[1] + 200); sky(12, 'klar'); }, cam() { const V = L._iva && L._iva(); return V && V.cam && (V.cam.x || V.cam.y) ? V.cam : { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; } },
      // JOYOR-Crash
      { d: 1.2, place() { tp(SP.f[0] - 3, SP.f[1] - 6); sky(16, 'klar'); }, spawn() { if (!A0.crash) A0.crash = veh('joyort10', SP.f[0], SP.f[1], 0); }, cam(u) { const v = A0.crash; if (v) { const k = Math.min(1, u / 0.45); v.x = SP.f[0]; v.z = SP.f[1] + k * 10; v.speed = 0; v.rig.root.visible = true; v.rig.root.position.set(v.x, k < 1 ? 0.2 : Math.sin(Math.min(1, (u - 0.45) * 2) * Math.PI) * 2, v.z); if (u > 0.45) { v.rig.root.rotation.set((u - 0.45) * 12, 0, (u - 0.45) * 6); if (!this.cr) { this.cr = true; L.shake = 1.5; U.flash(0.6); U.joy.textContent = 'JOYOR PREISLEISTUNG'; U.joy.classList.add('on'); for (let k2 = 0; k2 < 30; k2++) L.fx(L.pick(['#ffd040', '#ffffff', '#ff6020']), SP.f[0], 1, SP.f[1] + 10, 6, 12, { basic: true, size: 0.4, life: 0.7 }); L.snd.explosion && L.snd.explosion({ x: SP.f[0], y: 1, z: SP.f[1] + 10 }); } } } return { x: SP.f[0] + 3.5, y: 1.6, z: SP.f[1] + 4, lx: SP.f[0], ly: 0.7, lz: SP.f[1] + 8 }; }, end() { U.joy.classList.remove('on'); U.joy.textContent = ''; } },
      // Ich-Perspektive: Schnipp mit dem Ewigkeitshandschuh – die Welt zerbricht
      { d: 1.4, place() { tpS('p'); sky(12, 'klar'); P.camYaw = 0; P.hot[4] = { type: 'ewigkeitshandschuh', count: 1, mag: 1 }; P.sel = 4; if (P.rig && P.rig.head) P.rig.head.visible = false; },
        spawn() { setTimeout(() => { try { L._gStone && L._gStone(6); P.fireCd = 0; L.weaponFire(P.hot[4], L.ITEMS.ewigkeitshandschuh); } catch (e) { /* egal */ } U.flash(1); L.shake = 3; for (let k = 0; k < 14; k++) setTimeout(() => { const a = Math.random() * 6.283, d = 40 + Math.random() * 200; L.fx(L.pick(['#ff6020', '#ffb030', '#ffffff']), P.x + Math.sin(a) * d, 10, P.z + Math.cos(a) * d, 40, 40, { basic: true, size: 4, life: 1.4 }); L.snd.explosion && L.snd.explosion({ x: P.x + Math.sin(a) * d, y: 5, z: P.z + Math.cos(a) * d }); }, k * 40); }, 700); },
        cam(u) { const h = new T.Vector3(); if (P.rig && P.rig.hand) P.rig.hand.getWorldPosition(h); else h.set(P.x, 1.3, P.z + 0.5); const fy = (P.y || 0) + 1.65; return { x: P.x + 0.05, y: fy, z: P.z - 0.35, lx: h.x, ly: h.y + 0.05, lz: h.z + 0.6 }; }, end() { if (P.rig && P.rig.head) P.rig.head.visible = true; } },
      // Infinity-Koloss: SMASH + Krater
      { d: 1.8, place() { tpS('u'); sky(19.5, 'klar'); }, cam(u) { const O = L.omni, H2 = O && O.hulk; const cx = H2 && H2.cx ? H2.cx : omniXZ()[0], cz = H2 && H2.cz ? H2.cz : omniXZ()[1]; return { x: cx + 160 - u * 10, y: 25 + u * 40, z: cz + 110, lx: cx, ly: 20, lz: cz }; } },
      // POV vom Mond: die Erde zerbricht
      { d: 1.2, place() { tp(L.MOON.x - 260, L.MOON.z + 220); sky(22, 'klar'); }, spawn() { setTimeout(() => { try { const I = L._moonDbg && L._moonDbg.isl(); if (!I || !I.earth) return; const Ep = I.earth.position.clone(); I.earth.visible = false; if (I.atmo) I.atmo.visible = false; for (let k = 0; k < 20; k++) { const f = new T.Mesh(new T.DodecahedronGeometry(250 + Math.random() * 450), new T.MeshBasicMaterial({ color: k % 3 ? 0x2a6ac0 : 0x3a8a3a, fog: false })); f.position.copy(Ep); f.userData.v = new T.Vector3(L.rand(-1, 1), L.rand(-0.4, 1), L.rand(-1, 1)).multiplyScalar(2200); L.scene.add(f); props.push(f); A0.frags = (A0.frags || []).concat([f]); } U.flash(0.8); } catch (e) { /* egal */ } }, 250); },
        cam(u) { (A0.frags || []).forEach((f) => { f.position.addScaledVector(f.userData.v, 1 / 60); f.rotation.x += 0.05; }); return { x: P.x + 2, y: 1.7, z: P.z + 3, lx: P.x - 900, ly: 420, lz: P.z - 1100 }; } },
      // Jupiter-Vorfall 2011
      { d: 1.4, place() { try { L._jupShow && L._jupShow(8); } catch (e) { /* egal */ } }, cam(u) { return { x: P.x - 6, y: 3.5, z: P.z - 8 + u, lx: P.x + 4, ly: 2, lz: P.z + 8 }; } },
      // Portal + Turm
      { d: 1.2, place() { tp(L.TOWER.x + 30, L.TOWER.z + 30); sky(18.5, 'klar'); P.camYaw = Math.PI * 1.25; }, spawn() { try { L.suitPortalTo(L.ASGARD.x, L.ASGARD.z, 'Asgard'); } catch (e) { /* egal */ } }, cam(u) { return { x: L.TOWER.x + 70 - u * 10, y: 14 + u * 6, z: L.TOWER.z + 60, lx: L.TOWER.x + 10, ly: 30, lz: L.TOWER.z + 10 }; } }
    ];
    // Zeitplan
    const INTRO = 2.5; let tt = INTRO; SH.forEach((s) => { s.t = tt; tt += s.d; });
    const OUTRO = tt, END = OUTRO + 3.8;
    // Ereignisse, die zeitlich passen müssen: Koloss-Hand (Kill + 2,7–5,5 s), Smash (Kill + 21,3 s), Suplex (IVA-Start + 17,2–20,5 s), Richard (Ruslan-Start + 11,2 s)
    const iHand = 2, iSmash = 14, iIva = 11, iRich = 9;
    const killAt = SH[iHand].t - 2.75, ivaAt = SH[iIva].t - 17.6, rusAt = SH[iRich].t - 11.0;
    const E = { outro: OUTRO, drop: SH[12].t, cuts: SH.map((s) => s.t), hits: [SH[3].t + 0.2, SH[3].t + 0.9, SH[iHand].t + 1.55, SH[12].t + 0.55, SH[13].t + 0.7, killAt + 21.3], braams: [SH[iHand].t, SH[13].t + 0.7] };
    // ---------- Vorladen ----------
    const prepList = SH.map((s) => s);
    let pi = 0, pcam = null;
    const shot = () => {
      if (!ready) return pcam || { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 };
      const t = performance.now() / 1000 - t0;
      // zeitkritische Hintergrund-Ereignisse
      if (!W.omni && t >= killAt - 1.2) { W.omni = true; try { if (!L.omni) L.spawnOmni(); const O = L.omni; if (O) { O.rise = 1; O.x = SP.u[0]; O.z = SP.u[1] + 70; if (O.rift) { L.scene.remove(O.rift); O.rift = null; } } } catch (e) { /* egal */ } }
      if (!W.kill && t >= killAt) { W.kill = true; try { if (L.omni && !L.omni.dead) { L._gauntletFiring = true; L.damageEnt(L.omni, 1e9, P.x, P.z, P); } } catch (e) { /* egal */ } L._gauntletFiring = false; }
      if (!W.iva && t >= ivaAt) { W.iva = true; try { L._ivaShow && L._ivaShow(); } catch (e) { /* egal */ } }
      if (!W.rus && t >= rusAt) { W.rus = true; try { const B = L.ruslanBoss; B.x = SP.r[0]; B.z = SP.r[1] + 30; B.yaw = 0; L._ruslanWalrus && L._ruslanWalrus(); } catch (e) { /* egal */ } }
      if (t < INTRO) return { x: SP.m[0], y: 300, z: SP.m[1], lx: SP.m[0], ly: 0, lz: SP.m[1] + 1 };
      if (t < OUTRO) {
        const i = SH.findIndex((s) => t >= s.t && t < s.t + s.d);
        if (i >= 0 && i !== cur) { if (cur >= 0 && SH[cur].end) { try { SH[cur].end(); } catch (e) { /* egal */ } } cur = i; U.dipIt(); if (i === 0) U.intro.innerHTML = ''; try { SH[i].place(); if (SH[i].spawn) SH[i].spawn(); } catch (e) { /* egal */ } }
        try { return SH[cur].cam(t - SH[cur].t); } catch (e) { return { x: P.x, y: 20, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; }
      }
      if (t < END) {
        // Outro: aus der Stadt herauszoomen
        if (!U.out) { U.out = true; if (cur >= 0 && SH[cur].end) { try { SH[cur].end(); } catch (e) { /* egal */ } } tp(0, 60); sky(17.8, 'klar'); U.dipIt(); setTimeout(() => { U.intro.innerHTML = '<div style="font:900 clamp(34px,7vw,90px) Impact,Arial Black;letter-spacing:3px;color:#fff;text-shadow:0 0 30px rgba(200,40,40,.8),0 4px 0 #000">VIKTORS APOKALYPSE</div><div style="font:900 clamp(18px,3.4vw,40px) Arial;color:#ffe040;margin-top:24px;-webkit-text-stroke:1px #000;text-shadow:0 3px 0 #000">Dieses und weitere Spiele</div><div style="font:900 clamp(18px,3.4vw,40px) Arial;color:#ffe040;-webkit-text-stroke:1px #000;text-shadow:0 3px 0 #000">🔗 in der Bio</div>'; }, 900); }
        const k = ease((t - OUTRO) / 3.4); return { x: lerp(20, 600, k), y: lerp(8, 900, k), z: 60 + lerp(20, 600, k), lx: 0, ly: 0, lz: 60 };
      }
      finish(true); return null;
    };
    let ready = false, t0 = 0, cur = -1, ended = false, out = null; const AC = L.audio && L.audio.ctx;
    function finish(done) {
      if (ended) return; ended = true;
      try { if (out) out.gain.setTargetAtTime(0, AC.currentTime, 0.3); } catch (e) { /* egal */ }
      L.save.char = keep.char; L.save.gauntlet = keep.gaunt; L.mGodOn = false; L.mGodNoTag = false; if (done) L.save.trailer5Seen = 1; L.persist && L.persist();
      setTimeout(() => location.reload(), 900);
    }
    const keepCine = () => { if (ended) return; if (!L.cine || L.cine.tr5 !== true) L.cine = { t: 0, dur: 1e9, checked: true, tr5: true, shot }; L.cine.t = 0.5; requestAnimationFrame(keepCine); };
    keepCine();
    addEventListener('keydown', (e) => { if (e.code === 'Escape') finish(false); });
    // Vorladen: jede Szene einmal besuchen und rendern (Welten bauen, Shader kompilieren)
    const step = () => {
      if (ended) return;
      if (pi < prepList.length) {
        const s = prepList[pi]; try { s.place(); pcam = s.cam(0.5); } catch (e) { pcam = null; }
        U.bar.textContent = Math.round(pi / prepList.length * 100) + ' %'; pi++; setTimeout(step, 650); return;
      }
      // Monden/Asgard/Backrooms sind jetzt gebaut – Shader einmal komplett kompilieren
      try { L.renderer.compile(L.scene, L.camera); } catch (e) { /* egal */ }
      if (P.rig && P.rig.head) P.rig.head.visible = true; tp(SP.m[0], SP.m[1]); pcam = { x: SP.m[0], y: 300, z: SP.m[1], lx: SP.m[0], ly: 0, lz: SP.m[1] + 1 };
      U.prep.innerHTML = '<div style="font-size:30px">✅ Bereit!</div><div>Starte jetzt die Bildschirmaufnahme (Windows + Alt + R)</div><div style="font-size:18px;opacity:.75">… und dann hier klicken / tippen</div>';
      U.prep.onclick = () => {
        U.prep.remove(); U.dip.style.opacity = '1';
        U.intro.innerHTML = '<div id="t5a" style="font:600 clamp(14px,2.6vw,26px) Georgia,serif;letter-spacing:8px;color:#d8d0b8;opacity:0;transition:opacity .6s">MAXI D. STUDIO PRESENTS</div><div id="t5b" style="font:900 clamp(40px,9vw,110px) Impact,Arial Black;letter-spacing:4px;color:#e8e2cc;text-shadow:0 0 30px rgba(200,40,40,.6);opacity:0;transform:scale(1.25);transition:opacity .7s,transform 1.6s ease-out;margin-top:16px">VIKTORS APOKALYPSE</div>';
        setTimeout(() => { const a = U.intro.querySelector('#t5a'); if (a) a.style.opacity = 1; }, 50); setTimeout(() => { const a = U.intro.querySelector('#t5a'); if (a) a.style.opacity = 0; }, 1000); setTimeout(() => { const b = U.intro.querySelector('#t5b'); if (b) { b.style.opacity = 1; b.style.transform = 'scale(1)'; } }, 1100);
        try { L.initAudio && L.initAudio(); if (AC) out = music(AC, AC.currentTime + 0.05, E); } catch (e) { /* ohne Ton */ }
        t0 = performance.now() / 1000; ready = true;
      };
    };
    setTimeout(step, 300);
  }
  function addBtn() {
    const c = document.getElementById('btnPlay'); if (!c || document.getElementById('btnTrailer5')) return;
    if (!(L.heroToken && L.heroToken('marlon')) || (L.save && L.save.trailer5Seen)) return;
    ['btnTrailer', 'btnTrailer2', 'btnTrailer3', 'btnTrailer4'].forEach((id) => { const o = document.getElementById(id); if (o) o.remove(); });
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'btnTrailer5'; b.textContent = '🎬 TikTok-Trailer 5 (nur 1×)'; b.style.cssText = 'background:linear-gradient(90deg,#ff2a6a,#25f4ee);color:#000;font-weight:900';
    b.onclick = () => { if (!confirm('Trailer 5 (ca. 36 Sek.) läuft nur EIN Mal. Erst wird alles vorgeladen, dann startest du die Aufnahme und tippst zum Start. Esc = abbrechen (zählt dann nicht).')) return; start(); };
    c.before(b);
  }
  L.playTrailer5 = start;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(addBtn, 1300)); else setTimeout(addBtn, 1300);
})();
