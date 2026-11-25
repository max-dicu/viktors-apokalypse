'use strict';
// TikTok-Trailer (9:16, ~60 s) – nur auf dem Gerät mit dem Krücken-Code, einmalig. Eigene Musik + Soundeffekte.
(function () {
  const L = window.L, T = THREE;
  const DUR = 60;
  const STONES = [0xff2a2a, 0xffd020, 0x2a7aff, 0x30e070, 0xa040ff, 0xff8a20];
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  const take = (o) => { const r = o && (o.root || o); if (r && r.parent) r.parent.remove(r); return o; };

  // ---------- Musik + Effekte ----------
  function audio(A, t0) {
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
    const whoosh = (s) => noise(s, 0.5, 0.35, 'bandpass', 600, 3000, 1.5);
    const impact = (s) => { osc('sine', 90, s, 1.2, 1, 28); noise(s, 0.6, 0.7, 'lowpass', 2500, 200); };
    const roar = (s) => { osc('sawtooth', 120, s, 1.4, 0.35, 60, 700, true); noise(s, 1.2, 0.35, 'lowpass', 900, 300); };
    const laser = (s) => { osc('sawtooth', 1800, s, 1.2, 0.18, 300, 4000); osc('square', 900, s, 1.2, 0.08, 200, 3000); };
    const B = 60 / 140;
    // Intro
    braam(at(0.3), 3.2); riser(at(1.8), 1.7);
    // Beat 3.5 – 53
    const bass = [36.7, 36.7, 43.6, 32.7];
    for (let b = 0; at(3.5 + b * B) < at(53); b++) {
      const x = 3.5 + b * B, sec = x < 23 ? 1 : x < 36 ? 2 : x < 47 ? 3 : 4;
      if (sec === 3 && b % 2) continue;
      kick(at(x), sec === 4 ? 1 : 0.8);
      if (sec >= 2 && b % 2 === 1) snare(at(x));
      hat(at(x + B / 2)); if (sec === 4) { hat(at(x + B / 4), 0.08); hat(at(x + B * 0.75), 0.08); }
      if (b % 4 === 0) osc('sawtooth', bass[(b / 4) % 4], at(x), B * 3.8, 0.28, 0, 260);
      // dunkles Ostinato
      const pat = [293.7, 293.7, 349.2, 293.7, 329.6, 293.7, 261.6, 293.7];
      if (sec !== 3) { osc('sawtooth', pat[b % 8], at(x), 0.16, 0.05, 0, 1400); osc('sawtooth', pat[(b + 4) % 8], at(x + B / 2), 0.14, 0.04, 0, 1400); }
      else { osc('triangle', pat[b % 8] * 2, at(x), 0.3, 0.06, 0, 4000); }
    }
    // Schnitte + Effekte
    [3.5, 8.5, 13.5, 18, 23, 29, 36, 42, 47].forEach((x) => whoosh(at(x - 0.25)));
    [23, 47, 53.3].forEach((x) => braam(at(x), 3)); riser(at(44.5), 2.5); riser(at(51), 2.3);
    roar(at(9)); roar(at(23.6)); roar(at(31)); impact(at(15.8)); impact(at(30.2)); impact(at(35.3)); impact(at(53.3)); laser(at(26));
    for (let k = 0; k < 10; k++) noise(at(18.3 + k * 0.45), 0.9, 0.25, 'bandpass', 400, 900, 1);
    for (let k = 0; k < 8; k++) osc('sawtooth', 2200 + Math.random() * 500, at(36.4 + k * 0.7), 0.45, 0.08, 3100, 6000);
    for (let k = 0; k < 10; k++) noise(at(42.2 + k * 0.5), 0.6, 0.2, 'bandpass', 1500, 600, 1);
    // Schluss-Fläche
    [146.8, 174.6, 220, 293.7].forEach((f) => osc('triangle', f, at(53.4), 6.5, 0.05, 0, 3000, true));
    return out;
  }
  function sayKeys(delay) { setTimeout(() => { try { const u = new SpeechSynthesisUtterance('KEYS!'); u.lang = 'en-US'; u.pitch = 2; u.rate = 1.35; speechSynthesis.speak(u); } catch (e) { /* ohne Stimme */ } }, delay * 1000); }

  // ---------- Szene ----------
  function play(onEnd) {
    L.initAudio && L.initAudio();
    const css = document.createElement('style');
    css.textContent = `#trl{position:fixed;inset:0;z-index:400;background:#000;display:flex;align-items:center;justify-content:center}#trlF{position:relative;height:100vh;width:min(100vw,56.25vh);overflow:hidden;background:#000}
    #trlF canvas{width:100%;height:100%;display:block}#trlCap{position:absolute;left:4%;right:4%;top:17%;text-align:center;font:900 clamp(22px,6.2vh,64px) Impact,'Arial Black',sans-serif;color:#fff;-webkit-text-stroke:2px #000;text-shadow:0 4px 0 #000,0 0 24px rgba(0,0,0,.7);letter-spacing:1px;line-height:1.05;transform:scale(.4);opacity:0}
    #trlCap.on{animation:trlPop .35s cubic-bezier(.2,1.6,.4,1) forwards}@keyframes trlPop{to{transform:scale(1);opacity:1}}#trlSub{position:absolute;left:5%;right:5%;bottom:12%;text-align:center;font:800 clamp(14px,3vh,30px) Arial;color:#ffe040;-webkit-text-stroke:1px #000;text-shadow:0 2px 0 #000;opacity:0;transition:opacity .4s}
    #trlFlash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}#trlBlack{position:absolute;inset:0;background:#000;pointer-events:none;transition:opacity .6s}#trlIntro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8e2cc;text-align:center;pointer-events:none}`;
    document.head.appendChild(css);
    const wrap = document.createElement('div'); wrap.id = 'trl'; wrap.innerHTML = '<div id="trlF"><div id="trlBlack"></div><div id="trlIntro"></div><div id="trlCap"></div><div id="trlSub"></div><div id="trlFlash"></div></div>'; document.body.appendChild(wrap);
    const F = wrap.firstChild, cap = F.querySelector('#trlCap'), sub = F.querySelector('#trlSub'), flash = F.querySelector('#trlFlash'), black = F.querySelector('#trlBlack'), intro = F.querySelector('#trlIntro');
    const R = new T.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); F.insertBefore(R.domElement, F.firstChild);
    const S = new T.Scene(), cam = new T.PerspectiveCamera(55, 9 / 16, 0.1, 8000); S.fog = new T.Fog(0x8fb0d0, 200, 2500);
    const hemi = new T.HemisphereLight(0xffffff, 0x404040, 0.9), sun = new T.DirectionalLight(0xffffff, 0.9); sun.position.set(80, 200, 60); S.add(hemi, sun);
    const size = () => { const r = F.getBoundingClientRect(); R.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
    const ground = new T.Mesh(new T.PlaneGeometry(6000, 6000), new T.MeshLambertMaterial({ color: 0x5a7a3a })); ground.rotation.x = -Math.PI / 2; S.add(ground);
    // Stadt-Kulisse
    const city = new T.Group(); S.add(city); for (let i = 0; i < 70; i++) { const h = 8 + Math.random() * 40, b = new T.Mesh(L.GEO.box, L.mat(['#6a6e78', '#7a7468', '#5a606a', '#8a8478'][i % 4])); b.scale.set(8 + Math.random() * 10, h, 8 + Math.random() * 10); const sd = i % 2 ? 1 : -1; b.position.set(sd * (45 + Math.random() * 150), h / 2, 60 - Math.random() * 360); city.add(b); }
    const road = new T.Mesh(new T.PlaneGeometry(14, 600), L.mat('#3a3a3e')); road.rotation.x = -Math.PI / 2; road.position.y = 0.02; city.add(road);
    // Darsteller
    const hero = take(L.buildHuman(Object.assign({}, L.DEFAULT_CHAR, { special: 'h_marlon', hk: L.heroToken && L.heroToken('marlon') }), true)); S.add(hero.root);
    const monsters = ['viktor', 'daniel', 'rufer', 'greifer', 'marsianer', 'blockling', 'langer'].map((k) => { const r = take(L.MK[k].build()); S.add(r.root); return { k, r }; });
    const rufer = monsters[2];
    const omni = L.buildOmniRig ? take(L.buildOmniRig()) : null; if (omni) S.add(omni.root);
    const kol = L.buildKolossRig ? take(L.buildKolossRig()) : null; if (kol) S.add(kol.root);
    const keys = []; for (let i = 0; i < 14; i++) { const k = L.buildJupKey ? L.buildJupKey() : null; if (k) { if (k.parent) k.parent.remove(k); S.add(k); keys.push({ m: k, a: Math.random() * 6.283, r: 4 + Math.random() * 10, y: 1 + Math.random() * 4, s: 0.6 + Math.random() }); } }
    const wal = L.buildWalross ? take(L.buildWalross()) : null; if (wal) S.add(wal.root || wal);
    const tor = L.makeTornadoFx ? L.makeTornadoFx(26, 12) : null; if (tor) S.add(tor.g);
    const crater = new T.Mesh(new T.CircleGeometry(150, 40), new T.MeshBasicMaterial({ color: 0x1a120a, transparent: true, opacity: 0.85 })); crater.rotation.x = -Math.PI / 2; crater.position.y = 0.3; S.add(crater);
    const laser = new T.Mesh(new T.CylinderGeometry(2.5, 2.5, 1, 10, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false })); S.add(laser);
    const clouds = []; for (let i = 0; i < 40; i++) { const c = new T.Mesh(new T.SphereGeometry(1, 10, 8), new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })); c.scale.set(20 + Math.random() * 30, 8 + Math.random() * 8, 20 + Math.random() * 20); S.add(c); clouds.push(c); }
    const parts = []; const spark = (x, y, z, col, n, sp) => { for (let i = 0; i < n; i++) { const m = new T.Mesh(new T.SphereGeometry(0.15 * (sp > 20 ? 4 : 1), 5, 4), new T.MeshBasicMaterial({ color: col, transparent: true })); m.position.set(x, y, z); S.add(m); parts.push({ m, v: new T.Vector3((Math.random() - 0.5) * sp, Math.random() * sp * 0.7, (Math.random() - 0.5) * sp), life: 1 }); } };
    const all = [city, hero.root, ...monsters.map((m) => m.r.root), omni && omni.root, kol && kol.root, ...keys.map((k) => k.m), wal && (wal.root || wal), tor && tor.g, crater, laser, ...clouds].filter(Boolean);
    const show = (...list) => { all.forEach((o) => { o.visible = false; }); list.forEach((o) => { if (o) o.visible = true; }); };
    const env = (sky, fog, gr, near, far, hi) => { R.setClearColor(sky); S.fog.color.set(fog); S.fog.near = near || 200; S.fog.far = far || 2500; ground.material.color.set(gr); hemi.intensity = hi || 0.9; };
    const capt = (txt, subT) => { cap.classList.remove('on'); void cap.offsetWidth; cap.innerHTML = txt; cap.classList.add('on'); sub.textContent = subT || ''; sub.style.opacity = subT ? '1' : '0'; };
    const flashIt = (o) => { flash.style.transition = 'none'; flash.style.opacity = String(o || 1); requestAnimationFrame(() => { flash.style.transition = 'opacity .5s'; flash.style.opacity = '0'; }); };
    let shake = 0;
    const heroAnim = (mode, ph) => { L.animHuman(hero, { mode, phase: ph, speed: 1 }); if (hero.crutches) hero.crutches.forEach((c) => { if (c.userData.orb) c.userData.orb.rotation.z += 0.05; }); };
    const monAnim = (m, ph, mode) => { try { L.MK[m.k].anim(m.r, { mode: mode || 'run', phase: ph, ph, speed: 1, t: ph }); } catch (e) { /* egal */ } };
    // ---------- Shots ----------
    const SH = [
      { t: 0, d: 3.5, set() { show(); black.style.opacity = '1'; intro.innerHTML = '<div style="font:600 clamp(14px,2.6vh,26px) Georgia,serif;letter-spacing:6px">MAXI D. STUDIO</div><div style="font:600 clamp(12px,2vh,20px) Georgia;letter-spacing:5px;margin-top:6px;opacity:.7">PRESENTS</div>'; }, up() {} },
      { t: 3.5, d: 5, set() { black.style.opacity = '0'; intro.innerHTML = ''; env(0x8fb0d0, 0x9ab8d8, 0x5a7a3a); show(city, hero.root); capt('🩼 DER<br>KRÜCKEN-KÄMPFER', 'aus Sina Sina'); },
        up(u) { const z = lerp(-14, -3, u / 5); hero.root.position.set(0, 0, z); hero.root.rotation.set(0, 0, 0); hero.root.scale.setScalar(1); heroAnim('walk', u * 7); cam.position.set(lerp(2.2, 1.1, u / 5), 0.55, 0.5); cam.lookAt(0, 1.3, z); } },
      { t: 8.5, d: 5, set() { show(city, hero.root, ...monsters.map((m) => m.r.root)); capt('SIE HÖREN<br>JEDES GERÄUSCH…'); },
        up(u) { hero.root.position.set(0, 0, 0); hero.root.rotation.y = Math.PI; heroAnim('idle', u); monsters.forEach((m, i) => { m.r.root.visible = true; m.r.root.rotation.set(0, 0, 0); m.r.root.position.set((i - 3) * 4.5, 0, lerp(-70, -12, u / 5) - (i % 2) * 6); monAnim(m, u * 8 + i); }); cam.position.set(3, 3.2, 7); cam.lookAt(0, 2.2, -25); } },
      { t: 13.5, d: 4.5, set() { show(city, hero.root, rufer.r.root); capt('🦿 ALAMANTIUM-<br>KNIE'); },
        up(u, sl) { rufer.r.root.rotation.set(0, Math.PI, 0); const hit = u > 2.3; const fly = hit ? Math.min(1, (u - 2.3) / 1.2) : 0; rufer.r.root.position.set(0, fly * 6, 10 + fly * 25); rufer.r.root.rotation.x = -fly * 1.2; monAnim(rufer, u * 3, 'idle');
          const run = Math.min(1, u / 1.7), jump = u > 1.7 ? Math.min(1, (u - 1.7) / 0.6) : 0; hero.root.rotation.set(0, 0, 0); hero.root.position.set(0, Math.sin(jump * Math.PI / 2) * 6.5 * (u < 3.2 ? 1 : Math.max(0, 1 - (u - 3.2))), lerp(-6, 7, run));
          heroAnim(jump ? 'idle' : 'run', u * 10); if (jump && hero.legs) { hero.legs[0].leg.rotation.x = -1.7; hero.legs[0].knee.rotation.x = hit ? 0.2 : 1.9; }
          if (hit && !this.done) { this.done = true; shake = 1.5; flashIt(0.8); spark(0, 7.5, 9, 0xffffff, 30, 25); spark(0, 7.5, 9, 0xb080ff, 20, 18); sl(0.25, 0.9); }
          cam.position.set(9, 4 + jump * 3, 2 + run * 3); cam.lookAt(0, 3 + jump * 3, 6); } },
      { t: 18, d: 5, set() { show(city, hero.root, tor && tor.g, ...monsters.slice(0, 5).map((m) => m.r.root)); capt('🌪️ KRÜCKEN-<br>TORNADO'); },
        up(u) { hero.root.position.set(0, 2, 0); hero.root.rotation.set(0, u * 22, 0); heroAnim('idle', 0); if (hero.arms) { hero.arms[0].arm.rotation.z = -1.5; hero.arms[1].arm.rotation.z = 1.5; } if (tor) { tor.g.position.set(0, 0, 0); tor.g.scale.setScalar(Math.min(1, u)); tor.update(1 / 30 * 2.2); }
          monsters.slice(0, 5).forEach((m, i) => { const a = u * 3 + i * 1.25, r = 8 + i, y = Math.min(18, u * 4 + i); m.r.root.position.set(Math.sin(a) * r, y, Math.cos(a) * r); m.r.root.rotation.set(u * 4 + i, a, u * 3); });
          cam.position.set(Math.sin(u * 0.4) * 26, 9, Math.cos(u * 0.4) * 26); cam.lookAt(0, 9, 0); } },
      { t: 23, d: 6, set() { env(0x3a1a3a, 0x4a2040, 0x3a3a30, 300, 3000, 0.7); show(city, omni && omni.root, laser); capt('♾️ INFINITY-<br>OMNITRON'); },
        up(u) { if (!omni) return; omni.root.position.set(0, 0, -160); omni.root.rotation.set(0, 0, 0); const ph = u * 1.2; omni.legs.forEach((l, k) => { l.lg.rotation.x = Math.sin(ph + k * Math.PI) * 0.3; }); omni.arms.forEach((a, k) => { a.ar.rotation.x = Math.sin(ph + k) * 0.2; }); omni.gems.forEach((g, k) => { g.rotation.y += 0.1; g.scale.setScalar(1 + Math.sin(u * 4 + k) * 0.15); });
          if (Math.sin(ph) * Math.sin(ph - 0.05) < 0) shake = 0.8;
          laser.visible = u > 3 && u < 4.4; if (laser.visible) { const hp = new T.Vector3(); omni.head.getWorldPosition(hp); const to = new T.Vector3(20, 0, -30); laser.position.copy(hp); laser.lookAt(to); laser.scale.set(1, 1, hp.distanceTo(to)); if (Math.random() < 0.5) spark(to.x, 1, to.z, 0xff6020, 6, 30); shake = 0.6; }
          cam.position.set(lerp(60, 30, u / 6), 3, lerp(80, 40, u / 6)); cam.lookAt(0, 90, -160); } },
      { t: 29, d: 7, set() { env(0x3a1a3a, 0x4a2040, 0x3a3a30, 300, 3000, 0.7); show(omni && omni.root, kol && kol.root); this.cr = false; capt('🧟 INFINITY-<br>KOLOSS'); },
        up(u, sl) { if (!omni || !kol) return; omni.root.position.set(0, 0, -160); omni.root.rotation.order = 'YXZ'; const fall = u > 3.5 ? Math.min(1, (u - 3.5) / 1.4) : 0; omni.root.rotation.set(-1.45 * fall * fall, 0, 0);
          let ky = u < 1.2 ? 700 * Math.pow(1 - u / 1.2, 2) : 0, kz = -20; if (u > 5) { const j = (u - 5) / 1.3; kz = lerp(-20, -230, Math.min(1, j)); ky = j < 0.8 ? Math.sin(j / 0.8 * Math.PI * 0.5) * 300 : 300 * (1 - (j - 0.8) / 0.2); if (ky < 0) ky = 0; }
          kol.root.position.set(0, Math.max(0, ky), kz); kol.root.rotation.y = Math.PI;
          const A2 = kol.arms.find((a) => a.s > 0); kol.arms.forEach((a) => { a.ar.rotation.set(0, 0, a.s * 0.15); }); if (u > 1.6 && u < 3.8) A2.ar.rotation.x = -2.9 * Math.min(1, (u - 1.6) / 0.8); if (u > 5) kol.arms.forEach((a) => { a.ar.rotation.x = u < 6.1 ? -3 : -1.2; });
          if (u > 1.2 && !this.land) { this.land = true; shake = 2; spark(0, 3, -20, 0x8a7a60, 40, 40); }
          if (u > 3.4 && !this.pulse) { this.pulse = true; flashIt(0.5); STONES.forEach((c) => spark(0, 120, -40, c, 8, 40)); }
          if (u > 6.3 && !this.cr) { this.cr = true; crater.visible = true; crater.position.set(0, 0.3, -230); shake = 3; flashIt(1); spark(0, 5, -230, 0x8a7a60, 80, 60); capt('💥 SMASH!!!'); sl(0.2, 0.7); }
          if (u < 5) { cam.position.set(90, 25, 60); cam.lookAt(0, 70, -60); } else { cam.position.set(120, lerp(30, 160, (u - 5) / 2), 0); cam.lookAt(0, 30, -200); } } },
      { t: 36, d: 6, set() { env(0x8c7d6a, 0x9a8a74, 0xa89478, 80, 900, 0.75); show(hero.root, ...keys.map((k) => k.m)); capt('🪐 JUPITER-<br>VORFALL 2011', '🔑 KEYS! KEYS! KEYS!'); sayKeys(0.6); sayKeys(2.2); sayKeys(3.6); sayKeys(4.9); },
        up(u) { hero.root.position.set(0, 0, lerp(0, -40, u / 6)); hero.root.rotation.set(0, Math.PI, 0); heroAnim('run', u * 11); keys.forEach((k, i) => { k.a += 0.05 * k.s; const z = hero.root.position.z + 14 - u * 0.5 + Math.sin(k.a) * 3; k.m.position.set(Math.sin(k.a + i) * k.r, k.y + Math.sin(u * 6 + i) * 0.6, z + i * 1.2); k.m.rotation.set(Math.sin(u * 5 + i) * 0.4, Math.PI, Math.sin(u * 4 + i) * 0.5); }); cam.position.set(4, 3, hero.root.position.z - 9); cam.lookAt(0, 2, hero.root.position.z + 6); } },
      { t: 42, d: 5, set() { env(0x6aa8e8, 0xa8d0f0, 0x6aa8e8, 100, 1200, 1); show(wal && (wal.root || wal), hero.root, ...clouds); clouds.forEach((c) => { c.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 120, -Math.random() * 1200); }); capt('🦭 5000 KM/H<br>AUF EINEM WALROSS'); },
        up(u) { const w = wal.root || wal; w.position.set(0, Math.sin(u * 2) * 1.5, 0); w.rotation.set(Math.sin(u * 1.5) * 0.1, Math.PI, Math.sin(u * 2.3) * 0.15); hero.root.position.set(0, 2.1 + Math.sin(u * 2) * 1.5, 0.3); hero.root.rotation.set(0, Math.PI, 0); heroAnim('idle', 0); if (hero.legs) hero.legs.forEach((l, i) => { l.leg.rotation.set(-1.4, 0, (i ? 1 : -1) * 0.5); l.knee.rotation.x = 1.4; });
          clouds.forEach((c) => { c.position.z += 18; if (c.position.z > 60) c.position.z -= 1200; }); cam.position.set(6, 4, -10); cam.lookAt(0, 2, 0); } }
    ];
    const MONT = [1, 2, 3, 4, 5, 6, 7, 8];
    let cur = -1, mIdx = -1, slowT = 0, slowF = 1, lt = 0, endT = 0, ended = false;
    const t0 = performance.now() / 1000, A = L.audio && L.audio.ctx; let out = null; try { if (A) out = audio(A, A.currentTime + 0.05); } catch (e) { /* ohne Ton */ }
    const sl = (dur, f) => { slowT = dur; slowF = 1 - f; };
    let last = t0;
    function frame() {
      if (ended) return;
      const now = performance.now() / 1000, t = now - t0, rdt = Math.min(0.05, now - last); last = now;
      if (slowT > 0) slowT -= rdt; const dt = rdt * (slowT > 0 ? slowF : 1);
      if (t < 47) { const i = SH.findIndex((s) => t >= s.t && t < s.t + s.d); if (i !== cur && i >= 0) { cur = i; lt = 0; SH[i].done = SH[i].land = SH[i].pulse = false; SH[i].set(); } lt += dt; if (cur >= 0) SH[cur].up(lt, sl); }
      else if (t < 53) { const k = Math.floor((t - 47) / 0.6); if (k !== mIdx) { mIdx = k; const s = SH[MONT[k % MONT.length]]; s.done = s.land = s.pulse = false; s.set(); s.lt = Math.random() * s.d * 0.7; flashIt(0.35); if (k === 0) capt('UND NOCH<br>VIEL MEHR…'); else cap.classList.add('on'); } const s = SH[MONT[mIdx % MONT.length]]; s.lt += dt; s.up(s.lt, () => {}); }
      else { if (!endT) { endT = 1; show(); black.style.opacity = '1'; cap.classList.remove('on'); sub.style.opacity = '0'; flashIt(1); intro.innerHTML = '<div style="font:900 clamp(30px,7vh,80px) Impact,Arial Black;letter-spacing:3px;text-shadow:0 0 30px rgba(200,40,40,.8);line-height:1">VIKTORS<br>APOKALYPSE</div><div style="font:italic 700 clamp(14px,2.6vh,26px) Georgia;color:#c8a0ff;margin-top:14px;letter-spacing:3px">in the Sina Sina Multiverse</div><div style="font:900 clamp(16px,3vh,30px) Arial;color:#ffe040;margin-top:40px">JETZT KOSTENLOS SPIELEN</div><div style="font:700 clamp(12px,2.2vh,22px) Arial;margin-top:8px;opacity:.85">🔗 Link in Bio</div>'; }
        if (t > DUR) { finish(true); return; } }
      // Partikel
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= rdt * 1.2; p.v.y -= 30 * rdt; p.m.position.addScaledVector(p.v, rdt); p.m.material.opacity = Math.max(0, p.life); if (p.life <= 0) { S.remove(p.m); parts.splice(i, 1); } }
      if (shake > 0) { shake = Math.max(0, shake - rdt * 2.5); cam.position.x += (Math.random() - 0.5) * shake; cam.position.y += (Math.random() - 0.5) * shake; }
      if (t > 3.5 && t < 53) { R.render(S, cam); if (L._trlSnap) L._trlSnap(t, R.domElement, F); }
      requestAnimationFrame(frame);
    }
    function finish(done) { if (ended) return; ended = true; try { if (out) out.gain.setTargetAtTime(0, A.currentTime, 0.2); } catch (e) { /* egal */ } try { speechSynthesis.cancel(); } catch (e) { /* egal */ } wrap.style.transition = 'opacity .8s'; wrap.style.opacity = '0'; setTimeout(() => { wrap.remove(); css.remove(); R.dispose(); removeEventListener('keydown', esc); }, 900); onEnd && onEnd(done); }
    const esc = (e) => { if (e.code === 'Escape') finish(false); }; addEventListener('keydown', esc);
    frame();
  }
  L.playTrailer = play;
  // Knopf im Menü – nur auf diesem Gerät (Krücken-Code), nur einmal
  function addBtn() {
    const c = document.getElementById('btnPlay'); if (!c || document.getElementById('btnTrailer')) return;
    if (!(L.heroToken && L.heroToken('marlon')) || (L.save && L.save.trailerSeen)) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'btnTrailer'; b.textContent = '🎬 TikTok-Trailer (nur 1×)'; b.style.cssText = 'background:linear-gradient(90deg,#ff2a6a,#25f4ee);color:#000;font-weight:900';
    b.onclick = () => { if (!confirm('Der Trailer läuft nur EIN Mal (ca. 60 Sek., Hochformat). Bildschirmaufnahme bereit? Esc = abbrechen (zählt dann nicht).')) return; play((done) => { if (done) { L.save.trailerSeen = 1; L.persist && L.persist(); b.remove(); } }); };
    c.before(b);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(addBtn, 500)); else setTimeout(addBtn, 500);
})();
