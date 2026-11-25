'use strict';
// TikTok-Trailer 3 (40 s, nur Intro- und Outro-Text) – in der ECHTEN Spielwelt: viele Welten, Monster, Bosse, Portale, Ewigkeitshandschuh, Wetter + Tageszeiten.
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
    const spot = {}; const tpo = (key, x, z, rad) => { if (!spot[key]) spot[key] = open(x, z, rad); tp(spot[key][0], spot[key][1]); };
    const mon = (k, dx, dz) => { try { return L._spawnMonster(k, P.x + dx, P.z + dz); } catch (e) { return null; } };
    const H = { x: 0, z: 60 }, OFF = 1.5;
    { const q = (id) => U.intro.querySelector(id); setTimeout(() => { q('#t2a').style.opacity = 1; }, 200); setTimeout(() => { q('#t2a').style.opacity = 0; }, 1900); setTimeout(() => { q('#t2b').style.opacity = 1; q('#t2b').style.transform = 'scale(1)'; }, 2300); setTimeout(() => { q('#t2c').style.opacity = 1; }, 3200); }
    const SH = [
      { t: 3.5, d: 5, place() { tp(H.x, H.z); sky(7.8, 'klar'); P.camYaw = 0; }, spawn() { U.capt('VIKTORS<br>APOKALYPSE', 'Eine Stadt. Ein Turm. Und Monster überall.'); },
        cam(u) { const k = ease(u / 5); return { x: P.x + lerp(-170, -7, k), y: lerp(110, 3, k), z: P.z + lerp(-170, -9, k), lx: P.x, ly: 1.5, lz: P.z }; } },
      { t: 8.5, d: 4.5, place() { tpo('n', H.x + 120, H.z - 40); sky(23.4, 'nebel'); P.camYaw = 0; P.flash = false; }, spawn() { ['viktor', 'langer', 'starrende', 'schwelle', 'blockling'].forEach((k, i) => mon(k, (i - 2) * 6, 16 + (i % 2) * 6)); U.capt('NACHTS<br>KOMMEN SIE…', 'Sie hören jedes Geräusch'); },
        cam(u) { return { x: P.x + 2.5, y: 2.4, z: P.z - 7 + u * 0.6, lx: P.x, ly: 2, lz: P.z + 20 }; } },
      { t: 13, d: 4.5, place() { tpo('f', H.x - 120, H.z + 40); sky(13, 'klar'); P.camYaw = 0; P.flash = false; }, spawn() { mon('greifer', 0, 18); mon('daniel', -5, 22); mon('viktor', 5, 20); U.capt('🩼 KRÜCKEN-<br>KÄMPFER', 'Krückenwurf · Beben · Knie'); setTimeout(() => fire(0, 'kr_wurf'), 400); setTimeout(() => fire(3, 'kr_beben'), 2700); },
        cam(u) { const a = 0.8 + u * 0.25; return { x: P.x + Math.sin(a) * 9, y: 3.5, z: P.z + Math.cos(a) * 9 - 2, lx: P.x, ly: 2, lz: P.z + 8 }; } },
      { t: 17.5, d: 4.5, place() { tpo('s', H.x + 300, H.z + 200, 40); sky(17.5, 'gewitter'); }, spawn() { L.spawnTornado && L.spawnTornado(P.x + 90, P.z + 40); ['viktor', 'blockling', 'rollerviktor', 'marsianer'].forEach((k, i) => mon(k, Math.sin(i * 1.6) * 7, Math.cos(i * 1.6) * 7)); setTimeout(() => fire(1, 'kr_tornado'), 500); U.capt('⛈️ STÜRME &<br>TORNADOS'); },
        cam(u) { return { x: P.x - 28 + u * 2, y: 10, z: P.z - 22, lx: P.x + 30, ly: 14, lz: P.z + 20 }; } },
      { t: 22, d: 4, place() { tpo('p', H.x - 40, H.z - 60, 18); sky(10, 'wolkig'); P.camYaw = 0.4; }, spawn() { try { L.suitPortalTo(L.ASGARD.x, L.ASGARD.z, 'Asgard'); } catch (e) { /* egal */ } U.capt('🌀 PORTALE<br>ÜBERALL HIN'); },
        cam(u) { const a = 2.2 + u * 0.45, cx = P.x + Math.sin(0.4) * 4, cz = P.z + Math.cos(0.4) * 4; return { x: cx + Math.sin(a) * 9, y: 3, z: cz + Math.cos(a) * 9, lx: cx, ly: 2.2, lz: cz }; } },
      { t: 26, d: 4.5, place() { tp(L.ASGARD.x, L.ASGARD.z, L.ASGARD.y); sky(19.2, 'klar'); }, spawn() { U.capt('⚡ ASGARD'); },
        cam(u) { const a = u * 0.35; return { x: P.x + Math.sin(a) * 90, y: P.y + 45 - u * 4, z: P.z + Math.cos(a) * 90, lx: P.x, ly: P.y + 8, lz: P.z }; } },
      { t: 30.5, d: 4.5, place() { try { L.backEnter(0); } catch (e) { tp(81012.5, 12.5); } P.camYaw = 0; }, spawn() { U.capt('🟨 DIE<br>BACKROOMS', 'Kein Ausgang…'); },
        cam(u) { return { x: P.x, y: 1.6, z: P.z - 2 + u * 1.2, lx: P.x + Math.sin(u * 0.6) * 2, ly: 1.5, lz: P.z + 10 }; } },
      { t: 35, d: 4.5, place() { tp(L.TITAN.x + 150, L.TITAN.z); sky(15, 'klar'); }, spawn() { U.capt('🪐 DER<br>TITANENMOND'); },
        cam(u) { const a = 1 + u * 0.25; return { x: P.x + Math.sin(a) * 70, y: 26, z: P.z + Math.cos(a) * 70, lx: P.x, ly: 6, lz: P.z }; } },
      { t: 39.5, d: 5.5, place() { tpo('g', H.x + 60, H.z + 250, 40); sky(12.5, 'wolkig'); P.camYaw = 0; }, spawn() { ['greifer', 'rufer', 'marsianer', 'daniel'].forEach((k, i) => mon(k, (i - 1.5) * 9, 30 + i * 4)); U.capt('🧤 DER EWIGKEITS-<br>HANDSCHUH', 'Sechs Steine. Unendliche Macht.'); for (let i = 0; i < 5; i++) setTimeout(() => { P.camYaw = 0; fire(4, 'ewigkeitshandschuh'); dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN' })); }, 400 + i * 1000); },
        cam(u) { return { x: P.x - 1.6, y: 2.4, z: P.z - 4.5, lx: P.x + 1, ly: 2.2, lz: P.z + 25 }; } },
      { t: 45, d: 5, place() { tpo('b', H.x + 100, H.z - 120, 60); sky(16, 'regen'); P.camYaw = Math.PI / 2; }, spawn() { try { L.spawnGiantBoss(L.pick(['walross', 'viktor', 'daniel'])); } catch (e) { /* egal */ } U.capt('👹 RIESIGE<br>BOSSE'); },
        cam(u) { const w = L.wboss && (L.wboss.rig ? L.wboss.rig.root.position : L.wboss), bx = w && w.x !== undefined ? w.x : P.x + 260, bz = w && w.z !== undefined ? w.z : P.z, dx = P.x - bx, dz = P.z - bz, d = Math.hypot(dx, dz) || 1, cd = 90 - u * 6; return { x: bx + dx / d * cd + dz / d * 25, y: 6 + u * 2, z: bz + dz / d * cd - dx / d * 25, lx: bx, ly: 35, lz: bz }; } },
      { t: 50, d: 6, place() { tpo('o', H.x - 200, H.z + 100, 50); sky(20.3, 'klar'); }, spawn() { try { if (!L.omni) L.spawnOmni(); } catch (e) { /* egal */ } U.capt('♾️ INFINITY-<br>OMNITRON', 'Jede Stunde. Für alle.'); },
        cam(u) { const O = L.omni; const ox = O ? O.x : P.x + 300, oz = O ? O.z : P.z; return { x: P.x - (ox - P.x) * 0.15, y: 4, z: P.z - (oz - P.z) * 0.15, lx: ox, ly: O && O.rig ? O.rig.root.position.y + 80 : 80, lz: oz }; } },
      { t: 0, d: 2.6, place() { tp(-1250, 0); sky(11, 'klar'); P.camYaw = Math.PI / 2; }, spawn() { try { L._g.spawnVehicle({ type: 'walross_ride', x: P.x + 2, z: P.z, yaw: Math.PI / 2 }); const vs = L.ents.vehicles, w = vs[vs.length - 1]; if (w && w.type === 'walross_ride') { L._enterVehicle(w); L.walrusSetTop && L.walrusSetTop(w, 5000); this.w = w; this.x0 = w.x; this.z0 = w.z; } } catch (e) { this.w = null; } },
        cam(u) { const w = this.w; let x = P.x, z = P.z, y = P.y || 0, yw = Math.PI / 2; if (w) { w.yaw = yw; w.alt = Math.min(70, 4 + u * 45); w.speed = 1389; w.x = this.x0 + Math.max(0, u - 0.3) * 1389 * Math.min(1, u); w.z = this.z0; x = w.x; z = w.z; y = w.alt; if (w.rig) { w.rig.root.position.set(x, y, z); w.rig.root.rotation.y = yw; } if (P.rig) { P.x = x; P.z = z; P.y = y + 1.2; P.rig.root.position.set(x, y + 1.2, z); P.rig.root.rotation.y = yw; } } return { x: x - Math.sin(yw) * 13 + Math.cos(yw) * 3, y: y + 5, z: z - Math.cos(yw) * 13 - Math.sin(yw) * 3, lx: x + Math.sin(yw) * 20, ly: y + 2, lz: z + Math.cos(yw) * 20 }; } },
      { t: 56, d: 5, place() { if (P.vehicle && L._leaveVehicle) L._leaveVehicle(true); P.vehicle = null; P.seat = 0; tp(L.MOON.x - 260, L.MOON.z + 220); sky(22, 'klar'); }, spawn() { U.capt('🌕 BIS ZUM<br>MOND', '…und noch viel weiter'); },
        cam(u) { return { x: P.x + 6, y: 2.5 + u * 0.4, z: P.z + 9, lx: P.x - 900, ly: 420 - u * 30, lz: P.z - 1100 }; } }
    ];
    { const DU = [2.2, 2.2, 2.8, 2.4, 2, 2.2, 2, 2, 2.8, 2.4, 2.6, 2.6, 2]; let tt = 3.5; SH.forEach((s, i) => { s.t = tt + OFF; s.d = DU[i] || 2; tt += s.d; }); }
    const MEND = SH[SH.length - 1].t + SH[SH.length - 1].d;
    const END = { off: OFF, title: MEND, cuts: SH.map((s) => s.t), hits: [SH[2].t + 0.6, SH[2].t + 2.2, SH[3].t + 0.7, SH[8].t + 0.5, SH[8].t + 1.5, SH[8].t + 2.5, SH[10].t + 0.3], sec: [SH[4].t - OFF, SH[10].t - OFF] };
    const MONT = [0, 1, 2, 3, 5, 6, 7, 8, 10];
    const A = L.audio && L.audio.ctx; let out = null; try { L.initAudio && L.initAudio(); if (A) out = music(A, A.currentTime + 0.05, END); } catch (e) { /* ohne Ton */ }
    const t0 = performance.now() / 1000; let cur = -1, mI = -1, ended = false;
    const shot = () => {
      const t = performance.now() / 1000 - t0;
      if (t < 3.5 + OFF) return { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 };
      if (t < MEND) { const i = SH.findIndex((s) => t >= s.t && t < s.t + s.d); if (i >= 0 && i !== cur) { cur = i; U.dipIt(); if (i === 0) U.intro.innerHTML = ''; SH[i].place(); SH[i].spawn(); } return SH[Math.max(0, cur)].cam(t - SH[Math.max(0, cur)].t); }
      if (t < END.title) { const k = Math.floor((t - 61 - OFF) / 0.85); if (k !== mI) { mI = k; const s = SH[MONT[k % MONT.length]]; s.place(); U.dipIt(); U.flash(0.25); if (k === 0) U.capt('UND NOCH<br>SO VIEL MEHR…', 'Portale · Inseln · Fahrzeuge · Mehrspieler'); } const s = SH[MONT[mI % MONT.length]]; return s.cam(((t - 61 - OFF) % 0.85) + s.d * 0.4); }
      if (t < END.title + 5) { if (!U.titled) { U.titled = true; U.dip.style.transition = 'opacity .3s'; U.dip.style.opacity = '1'; U.cap.classList.remove('on'); U.sub.style.opacity = '0'; U.flash(1); U.intro.innerHTML = '<div style="font:900 clamp(30px,7vh,80px) Impact,Arial Black;letter-spacing:3px;text-shadow:0 0 30px rgba(200,40,40,.8);line-height:1">VIKTORS<br>APOKALYPSE</div><div style="font:italic 700 clamp(14px,2.6vh,26px) Georgia;color:#c8a0ff;margin-top:14px;letter-spacing:3px">in the Sina Sina Multiverse</div><div style="font:900 clamp(16px,3vh,30px) Arial;color:#ffe040;margin-top:40px">JETZT KOSTENLOS SPIELEN</div><div style="font:700 clamp(12px,2.2vh,22px) Arial;margin-top:8px;opacity:.85">🔗 Link in Bio</div>'; } return { x: P.x, y: 300, z: P.z, lx: P.x, ly: 0, lz: P.z + 1 }; }
      finish(true); return null;
    };
    function finish(done) {
      if (ended) return; ended = true;
      try { if (out) out.gain.setTargetAtTime(0, A.currentTime, 0.3); } catch (e) { /* egal */ }
      L.save.char = keep.char; L.save.gauntlet = keep.gaunt; L.mGodOn = false; L.mGodNoTag = false; if (done) L.save.trailer3Seen = 1; L.persist && L.persist();
      setTimeout(() => location.reload(), 900);
    }
    // eigene Kamera über das Kino-System (Prüfung „andere Welt“ abgeschaltet), lässt sich nicht wegtippen
    const keepCine = () => { if (ended) return; if (!L.cine || L.cine.tr2 !== true) L.cine = { t: 0, dur: 1e9, checked: true, tr2: true, shot }; L.cine.t = 0.5; requestAnimationFrame(keepCine); };
    keepCine();
    addEventListener('keydown', (e) => { if (e.code === 'Escape') finish(false); });
  }
  // Knopf im Menü – nur auf diesem Gerät, einmalig
  function addBtn() {
    const c = document.getElementById('btnPlay'); if (!c || document.getElementById('btnTrailer3')) return;
    if (!(L.heroToken && L.heroToken('marlon')) || (L.save && L.save.trailer3Seen)) return;
    ['btnTrailer', 'btnTrailer2'].forEach((id) => { const o = document.getElementById(id); if (o) o.remove(); });
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'btnTrailer3'; b.textContent = '🎬 TikTok-Trailer 3 (nur 1×)'; b.style.cssText = 'background:linear-gradient(90deg,#ff2a6a,#25f4ee);color:#000;font-weight:900';
    b.onclick = () => { if (!confirm('Der neue Trailer (40 Sek., Vollbild) läuft nur EIN Mal in der echten Spielwelt. Bildschirmaufnahme bereit? Esc = abbrechen (zählt dann nicht).')) return; start(); };
    c.before(b);
  }
  L.playTrailer3 = start;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(addBtn, 900)); else setTimeout(addBtn, 900);
})();
