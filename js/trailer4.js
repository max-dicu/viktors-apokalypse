'use strict';
// TikTok-Trailer 4 (~52 s, nur Intro- und Outro-Text) – in der ECHTEN Spielwelt: viele Welten, Monster, Bosse, Portale, Ewigkeitshandschuh, Wetter + Tageszeiten.
// Nur auf dem Gerät mit dem Krücken-Code, einmalig. Vollbild-Ausschnitt (9:16), eigene Musik + Effekte.
(function () {
  const L = window.L, T = THREE, P = L.player;
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

  // ---------- Musik ----------
  function music(A, t0, END) {
    const out = A.createGain(); out.gain.value = 0.85; const comp = A.createDynamicsCompressor(); out.connect(comp); comp.connect(A.destination);
    const rv = A.createConvolver(), ir = A.createBuffer(2, A.sampleRate * 2.2, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); } rv.buffer = ir; const rg = A.createGain(); rg.gain.value = 0.3; rv.connect(rg); rg.connect(out);
    const nb = A.createBuffer(1, A.sampleRate * 3, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const osc = (type, f, s, d, v, f2, cut, rev) => { const o = A.createOscillator(), g = A.createGain(), fl = A.createBiquadFilter(); o.type = type; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); fl.type = 'lowpass'; fl.frequency.value = cut || 8000; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + d); o.connect(fl); fl.connect(g); g.connect(out); if (rev) g.connect(rv); o.start(s); o.stop(s + d + 0.05); return fl; };
    const noise = (s, d, v, type, f, f2, q) => { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; fl.type = type || 'lowpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f || 1000, s); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, s + d); g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(0.0001, s + d); n.connect(fl); fl.connect(g); g.connect(out); g.connect(rv); n.start(s, Math.random()); n.stop(s + d + 0.05); };
    const at = (x) => t0 + x;
    const kick = (s, v) => osc('sine', 150, s, 0.35, v || 0.9, 40);
    const snare = (s) => { noise(s, 0.18, 0.5, 'bandpass', 1800, 1200, 0.8); osc('triangle', 220, s, 0.1, 0.25, 120); };
    const hat = (s, v) => noise(s, 0.05, v || 0.12, 'highpass', 8000);
    const braam = (s, d) => { [36.7, 55, 73.4, 87.3, 110].forEach((f, i) => { const fl = osc('sawtooth', f, s, d, 0.22 / (1 + i * 0.4), 0, 200, true); fl.frequency.setValueAtTime(200, s); fl.frequency.exponentialRampToValueAtTime(2400, s + 0.25); fl.frequency.exponentialRampToValueAtTime(300, s + d); }); kick(s, 1); };
    const riser = (s, d) => noise(s, d, 0.3, 'bandpass', 300, 7000, 3);
    const whoosh = (s) => noise(s, 0.5, 0.32, 'bandpass', 600, 3000, 1.5);
    const impact = (s) => { osc('sine', 90, s, 1.2, 1, 28); noise(s, 0.6, 0.7, 'lowpass', 2500, 200); };
    const B = 60 / 140, bass = [36.7, 36.7, 43.6, 32.7], pat = [293.7, 293.7, 349.2, 293.7, 329.6, 293.7, 261.6, 293.7];
    braam(at(0.3), 3.2); riser(at(2.2), 1.5); braam(at(3.7), 4); const o = END.off; riser(at(5.6 + 0), 1.9);
    for (let b = 0; 3.5 + o + b * B < END.title; b++) {
      const x = 3.5 + o + b * B, xr = x - o, sec = xr < END.sec[0] ? 1 : xr < END.sec[1] ? 2 : 5;
      if (sec === 4 && b % 2) continue;
      kick(at(x), sec === 5 ? 1 : 0.8); if (sec >= 2 && sec !== 4 && b % 2 === 1) snare(at(x));
      hat(at(x + B / 2)); if (sec === 5) { hat(at(x + B / 4), 0.08); hat(at(x + B * 0.75), 0.08); }
      if (b % 4 === 0) osc('sawtooth', bass[(b / 4) % 4], at(x), B * 3.8, 0.28, 0, 260);
      if (sec !== 4) { osc('sawtooth', pat[b % 8], at(x), 0.16, 0.05, 0, 1400); osc('sawtooth', pat[(b + 4) % 8], at(x + B / 2), 0.14, 0.04, 0, 1400); } else osc('triangle', pat[b % 8] * 2, at(x), 0.4, 0.06, 0, 4000, true);
    }
    END.cuts.forEach((x) => whoosh(at(x - 0.25)));
    [END.sec[0] + o, END.sec[1] + o, END.title].forEach((x) => braam(at(x), 3)); riser(at(END.sec[1] + o - 2), 2); riser(at(END.title - 2.3), 2.3);
    END.hits.forEach((x) => impact(at(x)));
    [146.8, 174.6, 220, 293.7].forEach((f) => osc('triangle', f, at(END.title + 0.1), 7, 0.05, 0, 3000, true));
    return out;
  }

  // ---------- Regie ----------
  function start() {
    const keep = { char: L.save.char, gaunt: L.save.gauntlet };
    L.save.char = Object.assign({}, L.DEFAULT_CHAR, { special: 'h_marlon', hk: L.heroToken('marlon') });
    L._catBypass = true; document.getElementById('btnPlay').click(); L._catBypass = false;
    const css = document.createElement('style');
    css.textContent = `body.trl2>*:not(#c):not(#trl2){visibility:hidden!important}#trl2{position:fixed;inset:0;z-index:500;pointer-events:none}
    #t2F{position:absolute;inset:0;overflow:hidden}#t2Cap{position:absolute;left:4%;right:4%;top:16%;text-align:center;font:900 clamp(26px,7vh,76px) Impact,'Arial Black',sans-serif;color:#fff;-webkit-text-stroke:2px #000;text-shadow:0 4px 0 #000,0 0 24px rgba(0,0,0,.7);line-height:1.05;transform:scale(.4);opacity:0}
    #t2Cap.on{animation:t2Pop .35s cubic-bezier(.2,1.6,.4,1) forwards}@keyframes t2Pop{to{transform:scale(1);opacity:1}}#t2Sub{position:absolute;left:5%;right:5%;bottom:13%;text-align:center;font:800 clamp(14px,2.8vh,28px) Arial;color:#ffe040;-webkit-text-stroke:1px #000;text-shadow:0 2px 0 #000;opacity:0;transition:opacity .4s}
    #t2Dip{position:absolute;inset:0;background:#000;opacity:1}#t2Fl{position:absolute;inset:0;background:#fff;opacity:0}#t2In{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8e2cc;text-align:center}`;
    document.head.appendChild(css);
    const wrap = document.createElement('div'); wrap.id = 'trl2'; wrap.innerHTML = '<div id="t2F"><div id="t2Dip"></div><div id="t2In"></div><div id="t2Cap"></div><div id="t2Sub"></div><div id="t2Fl"></div></div>'; document.body.appendChild(wrap);
    const $ = (id) => wrap.querySelector(id), cap = $('#t2Cap'), sub = $('#t2Sub'), dip = $('#t2Dip'), fl = $('#t2Fl'), intro = $('#t2In');
    intro.innerHTML = '<div id="t2a" style="font:600 clamp(16px,3vw,28px) Georgia,serif;letter-spacing:8px;color:#d8d0b8;opacity:0;transition:opacity 1.2s">MAXI D. STUDIO PRESENTS</div><div id="t2b" style="font:900 clamp(40px,9vw,110px) Impact,Arial Black;letter-spacing:4px;color:#e8e2cc;text-shadow:0 0 30px rgba(200,40,40,.6);opacity:0;transform:scale(1.25);transition:opacity 1.4s,transform 4s ease-out;margin-top:20px">VIKTORS APOKALYPSE</div><div id="t2c" style="font:italic 700 clamp(16px,3vw,30px) Georgia;letter-spacing:5px;color:#c8a0ff;opacity:0;transition:opacity 1.2s;margin-top:10px">in the Sina Sina Multiverse</div>';
    const capt = () => {}; const capt0 = (txt, s2) => { cap.classList.remove('on'); void cap.offsetWidth; cap.innerHTML = txt; cap.classList.add('on'); sub.textContent = s2 || ''; sub.style.opacity = s2 ? '1' : '0'; };
    const dipIt = () => { dip.style.transition = 'none'; dip.style.opacity = '1'; requestAnimationFrame(() => { dip.style.transition = 'opacity .35s'; dip.style.opacity = '0'; }); };
    const flash = (o) => { fl.style.transition = 'none'; fl.style.opacity = String(o || 1); requestAnimationFrame(() => { fl.style.transition = 'opacity .5s'; fl.style.opacity = '0'; }); };
    setTimeout(() => go(keep, { capt, dipIt, flash, dip, intro, cap, sub, wrap, css }), 1800);
  }
  function go(keep, U) {
    document.body.classList.add('trl2');
    L.mGodOn = true; L.mGodNoTag = true; P.spawnProt = 9999; L.save.gauntlet = true;
    const tp = (x, z, y) => { if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true); P.x = x; P.z = z; P.y = y || 0; P.vx = P.vz = P.vy = 0; P.flying = 0; P.air = false; };
    const sky = (time, w) => { L.env.time = time; if (L.setWeather) L.setWeather(w); L.env.wT = 999; L.env.rain = /regen|gewitter/.test(w) ? 1 : 0; };
    const fire = (slot, type) => { P.hot[slot] = { type, count: 1, mag: 1 }; P.sel = slot; P.fireCd = 0; try { L.weaponFire(P.hot[slot], L.ITEMS[type]); } catch (e) { /* egal */ } };
    const open = (x, z, rad) => { for (let i = 0; i < 400; i++) { const a = i * 2.4, d = i * 6, cx = L.clamp(x + Math.sin(a) * d, -1350, 1350), cz = L.clamp(z + Math.cos(a) * d, -1350, 1350); let ok = true; try { ok = !L.queryBoxes(cx, cz, rad || 28).some((b) => b.h > 1.5); } catch (e) { ok = true; } if (ok) return [cx, cz]; } return [x, z]; };
    const meadow = (rad, seed) => { for (let k = 0; k < 400; k++) { const a = (k + seed * 37) * 0.53, d = 480 + (k % 14) * 55, cx = Math.sin(a) * d, cz = Math.cos(a) * d; if (Math.abs(cx) > 1350 || Math.abs(cz) > 1350) continue; let ok = true; try { ok = !L.queryBoxes(cx, cz, rad).some((b) => b.h > 1.5) && !L.queryBoxes(cx, cz + 100, rad * 0.6).some((b) => b.h > 1.5); } catch (e) { ok = true; } if (ok) return [cx, cz]; } return null; };
    const spot = {}; const tpo = (key, x, z, rad) => { if (!spot[key]) spot[key] = (rad >= 60 && meadow(rad, key.charCodeAt(0))) || open(x, z, rad); tp(spot[key][0], spot[key][1]); };
    const mon = (k, dx, dz) => { try { return L._spawnMonster(k, P.x + dx, P.z + dz); } catch (e) { return null; } };
    const H = { x: 0, z: 60 }, OFF = 1.5;
    { const q = (id) => U.intro.querySelector(id); setTimeout(() => { q('#t2a').style.opacity = 1; }, 200); setTimeout(() => { q('#t2a').style.opacity = 0; }, 1900); setTimeout(() => { q('#t2b').style.opacity = 1; q('#t2b').style.transform = 'scale(1)'; }, 2300); setTimeout(() => { q('#t2c').style.opacity = 1; }, 3200); }
    const W = { kill: 0, iva: 0 };
    const omniPos = () => (L.omni ? { x: L.omni.x, z: L.omni.z } : { x: P.x + 60, z: P.z });
    const dropBoss = () => { try { if (L.wboss) { if (L.wboss.rig) L.scene.remove(L.wboss.rig.root); L.wboss.dead = true; if (L.byId) L.byId.delete('wboss'); L.wboss = null; } } catch (e) { /* egal */ } };
    const bossCam = (u) => { const w = L.wboss && (L.wboss.rig ? L.wboss.rig.root.position : L.wboss), bx = w && w.x !== undefined ? w.x : P.x + 260, bz = w && w.z !== undefined ? w.z : P.z, dx = P.x - bx, dz = P.z - bz, d = Math.hypot(dx, dz) || 1, cd = 150 - u * 10; return { x: bx + dx / d * cd + dz / d * 40, y: 70 - u * 4, z: bz + dz / d * cd - dx / d * 25, lx: bx, ly: 20, lz: bz }; };
    const props = []; const prop = (o, x, z, s) => { if (!o) return null; const r = o.rig ? o.rig.root : (o.root || o.g || o); if (!r || !r.isObject3D) return null; if (r.parent) r.parent.remove(r); if (s) r.scale.setScalar(s); r.position.set(x, 0, z); L.scene.add(r); props.push(r); return r; };
    let guard = null, oldRig = null;
    const SH = [
      // Stadt bei Tag
      { place() { tp(H.x, H.z); sky(8.5, 'klar'); P.camYaw = 0; }, spawn() {},
        cam(u) { const k = ease(u / 1.8); return { x: P.x + lerp(-150, -60, k), y: lerp(95, 55, k), z: P.z + lerp(-150, -60, k), lx: P.x, ly: 10, lz: P.z }; } },
      // Mond – Erde am Himmel (und BIG MAMA vs. Bernhard startet im Hintergrund)
      { place() { tp(L.MOON.x - 260, L.MOON.z + 220); sky(22, 'klar'); }, spawn() { let n = 0; const tryIva = () => { try { if (!W.iva && L._ivaShow && L._ivaShow()) { W.iva = performance.now() / 1000; return; } } catch (e) { /* egal */ } if (++n < 12) setTimeout(tryIva, 200); }; setTimeout(tryIva, 250); },
        cam(u) { return { x: P.x + 6, y: 2.5 + u * 0.4, z: P.z + 9, lx: P.x - 900, ly: 420 - u * 30, lz: P.z - 1100 }; } },
      // Nacht – Monster
      { place() { tpo('n', H.x + 120, H.z - 40); sky(23.4, 'nebel'); P.camYaw = 0; }, spawn() { ['viktor', 'langer', 'starrende', 'schwelle', 'blockling', 'daniel'].forEach((k, i) => mon(k, (i - 2.5) * 5, 14 + (i % 2) * 5)); },
        cam(u) { return { x: P.x + 2.5, y: 2.4, z: P.z - 7 + u * 0.8, lx: P.x, ly: 2, lz: P.z + 20 }; } },
      // Krücken-Attacken auf Infinity-Ultron, danach fällt er
      { place() { tpo('u', H.x - 260, H.z + 160, 70); sky(19.5, 'klar'); P.camYaw = 0; }, spawn() { try { if (!L.omni) L.spawnOmni(); const O = L.omni; if (O) { O.rise = 1; O.x = P.x; O.z = P.z + 70; if (O.rift) { L.scene.remove(O.rift); O.rift = null; } } } catch (e) { /* egal */ } setTimeout(() => fire(0, 'kr_wurf'), 150); setTimeout(() => fire(3, 'kr_beben'), 1300); setTimeout(() => { try { P.camYaw = 0; fire(2, 'kr_orthese'); } catch (e) { /* egal */ } }, 1900); setTimeout(() => { try { if (L.omni && !L.omni.dead) { L._gauntletFiring = true; L.damageEnt(L.omni, 1e9, P.x, P.z, P); L._gauntletFiring = false; W.kill = performance.now() / 1000; } } catch (e) { L._gauntletFiring = false; } }, 2500); },
        cam(u) { const o = omniPos(); return { x: P.x - 14, y: 4 + u * 3, z: P.z - 16, lx: (P.x + o.x) / 2, ly: 30 + u * 8, lz: (P.z + o.z) / 2 }; } },
      // Gewitter + Tornado
      { place() { tpo('s', H.x + 300, H.z + 200, 40); sky(17.5, 'gewitter'); }, spawn() { L.spawnTornado && L.spawnTornado(P.x + 70, P.z + 40); ['viktor', 'blockling', 'rollerviktor', 'marsianer'].forEach((k, i) => mon(k, Math.sin(i * 1.6) * 7, Math.cos(i * 1.6) * 7)); setTimeout(() => fire(1, 'kr_tornado'), 200); },
        cam(u) { return { x: P.x - 28 + u * 2, y: 10, z: P.z - 22, lx: P.x + 25, ly: 14, lz: P.z + 20 }; } },
      // Infinity Colossus hebt die Hand – Ultron bricht zusammen
      { place() { tpo('u', H.x - 260, H.z + 160, 70); sky(19.5, 'klar'); }, spawn() {},
        cam(u) { const O = L.omni, H2 = O && O.hulk; const hx = H2 ? H2.x : P.x, hz = H2 ? H2.z : P.z, ox = O ? O.x : P.x, oz = O ? O.z : P.z; const fx = ox - hx, fz = oz - hz, d = Math.hypot(fx, fz) || 1; return { x: hx - fx / d * 70 + fz / d * 90, y: 45, z: hz - fz / d * 70 - fx / d * 90, lx: (hx + ox) / 2, ly: 70, lz: (hz + oz) / 2 }; } },
      // Giant Walrus
      { place() { tpo('b', H.x + 100, H.z - 120, 130); sky(16, 'regen'); P.camYaw = Math.PI / 2; }, spawn() { const G0 = L.GBT && L.GBT.walross; if (G0) this.b = prop(G0.build(), P.x, P.z + 70, G0.S); },
        cam(u) { if (this.b) { this.b.rotation.y = Math.PI + Math.sin(u * 3) * 0.2; this.b.position.y = Math.abs(Math.sin(u * 5)) * 2; } return { x: P.x + lerp(-35, -15, u / 2), y: 8 + u * 2, z: P.z + 5, lx: P.x, ly: 14, lz: P.z + 70 }; } },
      // Giant Viktor
      { place() { tpo('v', H.x - 300, H.z - 250, 130); sky(13, 'wolkig'); P.camYaw = Math.PI / 2; }, spawn() { const G0 = L.GBT && L.GBT.viktor; if (G0) this.b = prop(G0.build(), P.x, P.z + 80, G0.S); },
        cam(u) { if (this.b) { this.b.rotation.y = Math.PI + Math.sin(u * 2) * 0.15; } return { x: P.x + lerp(25, 10, u / 2), y: 5 + u * 3, z: P.z + 8, lx: P.x, ly: 25, lz: P.z + 80 }; } },
      // Admin-Skin fliegt
      { place() { tpo('a', H.x + 50, H.z + 400, 30); sky(10, 'klar'); P.camYaw = 0; }, spawn() { try { guard = L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, L.GUARD_APP || {}, { special: 'waechter' }), true); oldRig = P.rig; L.scene.remove(oldRig.root); P.rig = guard; L.scene.add(guard.root); this.y0 = P.y || 0; this.x0 = P.x; this.z0 = P.z; P.flying = 1; } catch (e) { guard = null; } },
        cam(u) { if (guard) { P.flying = 1; P.y = (this.y0 || 0) + 2 + u * 14; P.z = (this.z0 || P.z) + u * 22; P.x = this.x0 || P.x; P.vx = P.vz = P.vy = 0; guard.root.position.set(P.x, P.y, P.z); guard.root.rotation.set(0.5, 0, 0); if (guard.arms) { guard.arms[0].arm.rotation.set(-3, 0, 0); guard.arms[1].arm.rotation.set(0.2, 0, 0); } } return { x: P.x + 5, y: P.y + 1.5, z: P.z - 7, lx: P.x, ly: P.y + 1, lz: P.z + 6 }; },
        end() { if (guard && oldRig) { L.scene.remove(guard.root); P.rig = oldRig; L.scene.add(oldRig.root); guard = null; P.flying = 0; } } },
      // BIG MAMA: Suplex auf Bernhard
      { place() { tpo('i', H.x, H.z + 300, 30); sky(12, 'klar'); }, spawn() {},
        cam(u) { const V = L._iva && L._iva(); if (V && V.cam && (V.cam.y || V.cam.x)) return V.cam; return { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; } },
      // Ewigkeitshandschuh nah + Schnipp
      { place() { tpo('g', H.x + 60, H.z + 250, 40); sky(14.5, 'klar'); P.camYaw = 0; }, spawn() { ['greifer', 'rufer', 'marsianer', 'daniel', 'viktor'].forEach((k, i) => mon(k, (i - 2) * 8, 26 + i * 3)); P.hot[4] = { type: 'ewigkeitshandschuh', count: 1, mag: 1 }; P.sel = 4;
          const shoot = (st, ms) => setTimeout(() => { try { L._gStone && L._gStone(st); P.camYaw = 0; P.fireCd = 0; L.weaponFire(P.hot[4], L.ITEMS.ewigkeitshandschuh); } catch (e) { /* egal */ } }, ms); shoot(0, 300); shoot(2, 900); shoot(1, 1500); shoot(6, 2100); },
        cam(u) { return { x: P.x - 1.7 + u * 0.15, y: (P.y || 0) + 2.1, z: P.z - 3.4 + u * 0.3, lx: P.x + 0.4, ly: (P.y || 0) + 1.3, lz: P.z + 8 }; } },
      // Asgard – Heimdall öffnet den Bifröst
      { place() { const O2 = L.ASGARD.obs || L.ASGARD; tp(O2.x + 4, O2.z + 4, L.ASGARD.y); sky(19, 'klar'); }, spawn() { try { const cyl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 400, 24, 1, true), new THREE.MeshBasicMaterial({ map: L.rainbowTex ? L.rainbowTex() : null, color: 0xffffff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); cyl.position.set(P.x, (P.y || 0) + 200, P.z); L.scene.add(cyl); props.push(cyl); this.cyl = cyl; } catch (e) { this.cyl = null; } },
        cam(u) { if (this.cyl) this.cyl.rotation.y += 0.08; const lift = Math.max(0, u - 1.2) * 18; P.y = L.ASGARD.y + lift; return { x: P.x + 26, y: L.ASGARD.y + 9 + lift * 0.6, z: P.z + 20, lx: P.x, ly: L.ASGARD.y + 3 + lift, lz: P.z }; },
        end() { U.flash(1); } },
      // Infinity Colossus SMASH + Krater
      { place() { tpo('u', H.x - 260, H.z + 160, 70); sky(19.5, 'klar'); }, spawn() {},
        cam(u) { const O = L.omni, H2 = O && O.hulk; const cx = H2 && H2.cx ? H2.cx : (O ? O.x : P.x), cz = H2 && H2.cz ? H2.cz : (O ? O.z : P.z); return { x: cx + 170 - u * 10, y: 30 + u * 40, z: cz + 120, lx: cx, ly: 20, lz: cz }; } },
      // Backrooms
      { place() { try { L.backEnter(0); } catch (e) { tp(81012.5, 12.5); } P.camYaw = 0; }, spawn() {},
        cam(u) { return { x: P.x, y: 1.6, z: P.z - 2 + u * 1.5, lx: P.x + Math.sin(u * 0.8) * 2, ly: 1.5, lz: P.z + 10 }; } },
      // Jupiter-Vorfall 2011
      { place() { try { L._jupShow && L._jupShow(8); } catch (e) { /* egal */ } }, spawn() {},
        cam(u) { return { x: P.x - 6, y: 3.5, z: P.z - 8 + u, lx: P.x + 4, ly: 2, lz: P.z + 8 }; } },
      // NINA, Ruslan und weitere Bosse
      { place() { tpo('l', H.x - 100, H.z - 420, 130); sky(15.5, 'wolkig'); P.camYaw = 0; }, spawn() { prop(L._buildIslandBoss && L._buildIslandBoss('nina'), P.x - 22, P.z + 95); prop(L._buildRuslan && L._buildRuslan(), P.x + 22, P.z + 95, 9); },
        cam(u) { return { x: P.x + lerp(-20, 20, u / 2), y: 14, z: P.z, lx: P.x, ly: 26, lz: P.z + 95 }; } },
      { place() { tpo('k', H.x + 380, H.z - 380, 130); sky(11, 'klar'); P.camYaw = 0; }, spawn() { ['thor', 'loki', 'ymir', 'lava'].forEach((id, i) => prop(L._buildIslandBoss && L._buildIslandBoss(id), P.x + (i - 1.5) * 30, P.z + 110 + (i % 2) * 12)); },
        cam(u) { return { x: P.x + lerp(-30, 30, u / 2), y: 16, z: P.z, lx: P.x, ly: 24, lz: P.z + 110 }; } },
      // Titanenmond
      { place() { tp(L.TITAN.x + 150, L.TITAN.z); sky(15, 'klar'); }, spawn() {},
        cam(u) { const a = 1 + u * 0.3; return { x: P.x + Math.sin(a) * 70, y: 26, z: P.z + Math.cos(a) * 70, lx: P.x, ly: 6, lz: P.z }; } }
    ];
    { const DU = [1.8, 2.0, 1.8, 2.8, 2.4, 2.8, 2.0, 2.0, 2.4, 3.2, 2.8, 2.4, 2.8, 1.8, 2.6, 2.2, 2.0, 1.8]; let tt = 3.5; SH.forEach((s, i) => { s.t = tt + OFF; s.d = DU[i] || 2; tt += s.d; }); }
    const MEND = SH[SH.length - 1].t + SH[SH.length - 1].d;
    const END = { off: OFF, title: MEND, cuts: SH.map((s) => s.t), hits: [SH[3].t + 0.3, SH[3].t + 1.4, SH[3].t + 2.5, SH[5].t + 1.6, SH[9].t + 2, SH[10].t + 0.3, SH[10].t + 0.9, SH[10].t + 1.5, SH[10].t + 2.1, SH[12].t + 1.0], sec: [SH[3].t - OFF, SH[9].t - OFF] };
    const MONT = [0, 1, 2, 3, 5, 6, 7, 8, 10];
    const A = L.audio && L.audio.ctx; let out = null; try { L.initAudio && L.initAudio(); if (A) out = music(A, A.currentTime + 0.05, END); } catch (e) { /* ohne Ton */ }
    const t0 = performance.now() / 1000; let cur = -1, mI = -1, ended = false;
    const shot = () => {
      const t = performance.now() / 1000 - t0;
      if (t < 3.5 + OFF) return { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 };
      if (t < MEND) { const i = SH.findIndex((s) => t >= s.t && t < s.t + s.d); if (i >= 0 && i !== cur) { if (cur >= 0 && SH[cur].end) { try { SH[cur].end(); } catch (e) { /* egal */ } } cur = i; U.dipIt(); if (i === 0) U.intro.innerHTML = ''; SH[i].place(); SH[i].spawn(); } return SH[Math.max(0, cur)].cam(t - SH[Math.max(0, cur)].t); }
      if (t < END.title) { const k = Math.floor((t - 61 - OFF) / 0.85); if (k !== mI) { mI = k; const s = SH[MONT[k % MONT.length]]; s.place(); U.dipIt(); U.flash(0.25); if (k === 0) U.capt('UND NOCH<br>SO VIEL MEHR…', 'Portale · Inseln · Fahrzeuge · Mehrspieler'); } const s = SH[MONT[mI % MONT.length]]; return s.cam(((t - 61 - OFF) % 0.85) + s.d * 0.4); }
      if (t < END.title + 5) { if (!U.titled) { U.titled = true; U.dip.style.transition = 'opacity .3s'; U.dip.style.opacity = '1'; U.cap.classList.remove('on'); U.sub.style.opacity = '0'; U.flash(1); U.intro.innerHTML = '<div style="font:900 clamp(30px,7vh,80px) Impact,Arial Black;letter-spacing:3px;text-shadow:0 0 30px rgba(200,40,40,.8);line-height:1">VIKTORS<br>APOKALYPSE</div><div style="font:italic 700 clamp(14px,2.6vh,26px) Georgia;color:#c8a0ff;margin-top:14px;letter-spacing:3px">in the Sina Sina Multiverse</div><div style="font:900 clamp(16px,3vh,30px) Arial;color:#ffe040;margin-top:40px">JETZT KOSTENLOS SPIELEN</div><div style="font:700 clamp(12px,2.2vh,22px) Arial;margin-top:8px;opacity:.85">🔗 Link in Bio</div>'; } return { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; }
      finish(true); return null;
    };
    function finish(done) {
      if (ended) return; ended = true; try { const e = SH.find((q) => q.end); if (guard && oldRig) { L.scene.remove(guard.root); P.rig = oldRig; } void e; } catch (x) { /* egal */ }
      try { if (out) out.gain.setTargetAtTime(0, A.currentTime, 0.3); } catch (e) { /* egal */ }
      L.save.char = keep.char; L.save.gauntlet = keep.gaunt; L.mGodOn = false; L.mGodNoTag = false; if (done) L.save.trailer4Seen = 1; L.persist && L.persist();
      setTimeout(() => location.reload(), 900);
    }
    // eigene Kamera über das Kino-System (Prüfung „andere Welt“ abgeschaltet), lässt sich nicht wegtippen
    const keepCine = () => { if (ended) return; if (!L.cine || L.cine.tr2 !== true) L.cine = { t: 0, dur: 1e9, checked: true, tr2: true, shot }; L.cine.t = 0.5; requestAnimationFrame(keepCine); };
    keepCine();
    addEventListener('keydown', (e) => { if (e.code === 'Escape') finish(false); });
  }
  // Knopf im Menü – nur auf diesem Gerät, einmalig
  function addBtn() {
    return; // TikTok-Trailer-Buttons sind dauerhaft aus
    const c = document.getElementById('btnPlay'); if (!c || document.getElementById('btnTrailer4')) return;
    if (!(L.heroToken && L.heroToken('marlon')) || (L.save && L.save.trailer4Seen)) return;
    ['btnTrailer', 'btnTrailer2', 'btnTrailer3'].forEach((id) => { const o = document.getElementById(id); if (o) o.remove(); });
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'btnTrailer4'; b.textContent = '🎬 TikTok-Trailer 4 (nur 1×)'; b.style.cssText = 'background:linear-gradient(90deg,#ff2a6a,#25f4ee);color:#000;font-weight:900';
    b.onclick = () => { if (!confirm('Der neue Trailer (ca. 50 Sek., Vollbild) läuft nur EIN Mal in der echten Spielwelt. Bildschirmaufnahme bereit? Esc = abbrechen (zählt dann nicht).')) return; start(); };
    c.before(b);
  }
  L.playTrailer4 = start;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(addBtn, 1100)); else setTimeout(addBtn, 1100);
})();
