'use strict';
// Kurzfilm beim Klick auf „Spielen“: Die Katze Masik wird überfahren, fliegt in den Himmel, wird zu Loki und hält die Zeitlinien zusammen –
// „Deswegen kannst du spielen.“ Antippen = überspringen.
(function () {
  const L = window.L, T = THREE;
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  function buildCat() {
    const g = new T.Group(), blk = new T.MeshLambertMaterial({ color: 0x141414 }), wht = new T.MeshLambertMaterial({ color: 0xf4f4f0 });
    const P3 = (geo, m, sx, sy, sz, x, y, z, par) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); (par || g).add(o); return o; };
    const S = new T.SphereGeometry(1, 16, 12), C = new T.CylinderGeometry(1, 1, 1, 10), K = new T.ConeGeometry(1, 1, 4);
    const body = new T.Group(); body.position.y = 0.32; g.add(body);
    P3(S, blk, 0.2, 0.17, 0.38, 0, 0, 0, body); P3(S, wht, 0.15, 0.11, 0.26, 0, -0.07, 0.04, body);
    [[0.08, 0.1, -0.1], [-0.06, 0.12, 0.08], [0.05, 0.13, 0.2], [-0.09, 0.09, -0.22]].forEach(([x, y, z]) => P3(S, wht, 0.035, 0.02, 0.035, x, y, z, body));
    const head = new T.Group(); head.position.set(0, 0.12, 0.36); body.add(head);
    P3(S, blk, 0.15, 0.13, 0.14, 0, 0, 0, head); P3(S, wht, 0.08, 0.06, 0.05, 0, -0.05, 0.11, head); P3(S, new T.MeshBasicMaterial({ color: 0xff9aa8 }), 0.018, 0.012, 0.01, 0, -0.01, 0.145, head);
    for (const s of [-1, 1]) { const e = P3(K, blk, 0.05, 0.1, 0.03, s * 0.08, 0.13, -0.01, head); e.rotation.z = -s * 0.25; P3(S, new T.MeshBasicMaterial({ color: 0xc8e040 }), 0.028, 0.03, 0.01, s * 0.055, 0.025, 0.125, head); P3(S, new T.MeshBasicMaterial({ color: 0x000000 }), 0.008, 0.022, 0.01, s * 0.055, 0.025, 0.133, head);
      for (let k = 0; k < 3; k++) { const w = P3(C, new T.MeshBasicMaterial({ color: 0xffffff }), 0.002, 0.14, 0.002, s * 0.09, -0.03 - k * 0.012, 0.12, head); w.rotation.z = Math.PI / 2 + s * (k - 1) * 0.15; } }
    const legs = []; for (const [x, z] of [[0.11, 0.24], [-0.11, 0.24], [0.11, -0.24], [-0.11, -0.24]]) { const l = new T.Group(); l.position.set(x, 0.32, z); g.add(l); P3(C, blk, 0.04, 0.26, 0.04, 0, -0.13, 0, l); P3(S, wht, 0.05, 0.035, 0.06, 0, -0.28, 0.02, l); legs.push(l); }
    const tail = new T.Group(); tail.position.set(0, 0.42, -0.36); g.add(tail); for (let k = 0; k < 5; k++) { const t = P3(C, blk, 0.03, 0.1, 0.03, 0, k * 0.08, -k * 0.03, tail); t.rotation.x = -0.4 + k * 0.12; }
    // Loki-Umhang und Hörner (erst unsichtbar)
    const cape = new T.Mesh(new T.PlaneGeometry(0.5, 0.7, 6, 8), new T.MeshLambertMaterial({ color: 0x1f6a2a, side: T.DoubleSide })); cape.position.set(0, 0.42, -0.2); cape.rotation.x = 1.25; cape.visible = false; g.add(cape);
    const gold = new T.MeshStandardMaterial({ color: 0xe0b030, metalness: 0.9, roughness: 0.25, emissive: 0x302000 });
    const horns = new T.Group(); horns.visible = false; head.add(horns); for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) { const h = P3(C, gold, 0.022 - k * 0.002, 0.07, 0.022 - k * 0.002, s * (0.05 + k * 0.012), 0.12 + k * 0.05, 0.08 - k * 0.035, horns); h.rotation.x = -0.6 - k * 0.15; h.rotation.z = -s * 0.15; } }
    P3(new T.TorusGeometry(0.13, 0.012, 6, 20, Math.PI), gold, 1, 1, 1, 0, 0.06, 0.03, horns).rotation.x = -0.3;
    return { g, body, head, legs, tail, cape, horns };
  }
  function buildCar() {
    const g = new T.Group(), m = new T.MeshLambertMaterial({ color: 0x2a4a9a });
    const b = new T.Mesh(new T.BoxGeometry(1.8, 0.6, 4), m); b.position.y = 0.6; g.add(b); const c = new T.Mesh(new T.BoxGeometry(1.6, 0.5, 2), new T.MeshLambertMaterial({ color: 0x9ab0c8 })); c.position.set(0, 1.1, -0.2); g.add(c);
    for (const [x, z] of [[0.9, 1.3], [-0.9, 1.3], [0.9, -1.3], [-0.9, -1.3]]) { const w = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 0.25, 14), new T.MeshLambertMaterial({ color: 0x111111 })); w.rotation.z = Math.PI / 2; w.position.set(x, 0.35, z); g.add(w); }
    for (const x of [-0.6, 0.6]) { const h = new T.Mesh(new T.SphereGeometry(0.12, 8, 6), new T.MeshBasicMaterial({ color: 0xfff8d0 })); h.position.set(x, 0.65, 2.01); g.add(h); }
    const sl = new T.SpotLight(0xfff0c0, 3, 40, 0.5, 0.5); sl.position.set(0, 0.7, 2); sl.target.position.set(0, 0, 12); g.add(sl); g.add(sl.target);
    return g;
  }
  function sound(A, t0) {
    const out = A.createGain(); out.gain.value = 0.8; out.connect(A.destination);
    const nb = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const osc = (type, f, s, d, v, f2) => { const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0 + s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + s + d); g.gain.setValueAtTime(0.0001, t0 + s); g.gain.exponentialRampToValueAtTime(v, t0 + s + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d); o.connect(g); g.connect(out); o.start(t0 + s); o.stop(t0 + s + d + 0.05); };
    const noise = (s, d, v, type, f, f2) => { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; fl.type = type; fl.frequency.setValueAtTime(f, t0 + s); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + s + d); g.gain.setValueAtTime(v, t0 + s); g.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d); n.connect(fl); fl.connect(g); g.connect(out); n.start(t0 + s); n.stop(t0 + s + d); };
    osc('sawtooth', 60, 0.5, 2.6, 0.12, 120); // Motor
    osc('sine', 700, 0.4, 0.25, 0.08, 900); osc('sine', 900, 0.75, 0.2, 0.06, 700); // Miau
    noise(2.6, 0.5, 0.35, 'bandpass', 3000, 2000); // Bremsen
    osc('sine', 90, 3.05, 0.6, 0.9, 30); noise(3.05, 0.3, 0.6, 'lowpass', 1500, 200); // Aufprall
    [261.6, 329.6, 392, 523.3].forEach((f, i) => osc('triangle', f, 4 + i * 0.25, 5, 0.05)); // Himmel-Chor
    noise(5.6, 1.2, 0.25, 'highpass', 4000, 9000); // Funkeln
    [146.8, 220, 293.7, 349.2].forEach((f) => osc('sawtooth', f, 9.5, 4.5, 0.025)); osc('sine', 55, 9.5, 4.5, 0.25); // Zeitlinien-Brummen
    noise(14.9, 1.5, 0.5, 'bandpass', 200, 6000); osc('sine', 60, 15.2, 2, 0.6, 30); // Dimensionssprung
    osc('sine', 48, 22.7, 2.2, 0.9, 25); noise(22.7, 1.6, 0.6, 'lowpass', 4000, 150); noise(22.6, 2.5, 0.25, 'highpass', 3000, 9000); // Lichtausbruch
    for (let k = 0; k < 10; k++) noise(16.5 + k * 0.5, 0.25, 0.18, 'lowpass', 600, 120); // schwere Schritte
    winterTheme(A, t0, out, 16.2, 26.2);
    return out;
  }
  // Mystische Klangwelt (eigene Klänge): tiefes Dröhnen, Geister-Chor, Wind, Funkeln, Wusch-Geräusche, Anschwellen vor dem Lichtausbruch
  function winterTheme(A, t0, dest, from, to) {
    const bus = A.createGain(), dry = A.createGain(), wet = A.createGain(), rv = A.createConvolver();
    const ir = A.createBuffer(2, A.sampleRate * 5, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.8); } rv.buffer = ir;
    dry.gain.value = 0.5; wet.gain.value = 0.8; bus.connect(dry); bus.connect(rv); rv.connect(wet); dry.connect(dest); wet.connect(dest);
    const T0 = t0 + from, T1 = t0 + to, D = to - from;
    bus.gain.setValueAtTime(0.0001, T0); bus.gain.exponentialRampToValueAtTime(0.9, T0 + 2.2); bus.gain.setValueAtTime(0.9, T1 - 2.8); bus.gain.exponentialRampToValueAtTime(0.0001, T1);
    const nb = A.createBuffer(1, A.sampleRate * 4, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const lfo = (target, rate, depth, s, d) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(target); o.start(s); o.stop(s + d); };
    // 1) tiefes Dröhnen mit langsam wanderndem Filter
    for (const [f, v] of [[55, 0.16], [55.6, 0.12], [82.4, 0.07]]) { const o = A.createOscillator(), fl = A.createBiquadFilter(), g = A.createGain(); o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 240; fl.Q.value = 3; lfo(fl.frequency, 0.12, 140, T0, D); g.gain.value = v; o.connect(fl); fl.connect(g); g.connect(bus); o.start(T0); o.stop(T1 + 0.2); }
    // 2) Geister-Chor: „Aah“-Stimmen (Dreiecke durch Vokal-Filter, mit Vibrato), wechselnde mystische Akkorde
    const chords = [[146.8, 220, 293.7, 349.2], [130.8, 196, 261.6, 311.1], [116.5, 174.6, 233.1, 293.7], [138.6, 207.7, 277.2, 329.6]];
    const len = D / chords.length;
    chords.forEach((ch, i) => { const s = T0 + i * len; ch.forEach((f, k) => { for (const det of [-6, 7]) { const o = A.createOscillator(), f1 = A.createBiquadFilter(), f2 = A.createBiquadFilter(), g = A.createGain(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; lfo(o.frequency, 4.5 + k * 0.3, f * 0.006, s, len + 1.5);
      f1.type = 'bandpass'; f1.frequency.value = 750; f1.Q.value = 4; f2.type = 'bandpass'; f2.frequency.value = 1150; f2.Q.value = 5; const m = A.createGain(); m.gain.value = 1; o.connect(f1); o.connect(f2); f1.connect(m); f2.connect(m); m.connect(g);
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.05 / (k + 1) + 0.02, s + 1.3); g.gain.setValueAtTime(0.05 / (k + 1) + 0.02, s + len - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, s + len + 1.4); g.connect(bus); o.start(s); o.stop(s + len + 1.5); } }); });
    // 3) Wind: rauschendes Band, das langsam auf und ab weht
    { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; n.loop = true; fl.type = 'bandpass'; fl.frequency.value = 500; fl.Q.value = 1.2; lfo(fl.frequency, 0.17, 380, T0, D); g.gain.value = 0.07; lfo(g.gain, 0.23, 0.04, T0, D); n.connect(fl); fl.connect(g); g.connect(bus); n.start(T0); n.stop(T1 + 0.2); }
    // 4) Funkeln: hohe, gläserne Töne mit langem Nachhall
    for (let k = 0; k < Math.floor(D * 2.2); k++) { const s = T0 + 0.6 + Math.random() * (D - 2.5), f = [1174.7, 1396.9, 1760, 2093, 2349.3, 2793.8][Math.floor(Math.random() * 6)], o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.025, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.8); o.connect(g); g.connect(bus); o.start(s); o.stop(s + 1.9); }
    // 5) Wusch-Geräusche (Energie zieht vorbei)
    for (let k = 0; k < 6; k++) { const s = T0 + 1 + k * (D / 6), n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; fl.type = 'bandpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(300, s); fl.frequency.exponentialRampToValueAtTime(2600, s + 1.1); g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.09, s + 0.55); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.2); n.connect(fl); fl.connect(g); g.connect(bus); n.start(s); n.stop(s + 1.3); }
    // 6) Anschwellen kurz vor dem Lichtausbruch (22,7 s)
    { const s = t0 + 20.8, n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(), o = A.createOscillator(), og = A.createGain(); n.buffer = nb; fl.type = 'highpass'; fl.frequency.setValueAtTime(200, s); fl.frequency.exponentialRampToValueAtTime(6000, s + 1.9); g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.22, s + 1.85); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.95); n.connect(fl); fl.connect(g); g.connect(bus); n.start(s); n.stop(s + 2);
      o.type = 'sawtooth'; o.frequency.setValueAtTime(110, s); o.frequency.exponentialRampToValueAtTime(440, s + 1.9); og.gain.setValueAtTime(0.0001, s); og.gain.exponentialRampToValueAtTime(0.05, s + 1.85); og.gain.exponentialRampToValueAtTime(0.0001, s + 1.95); o.connect(og); og.connect(bus); o.start(s); o.stop(s + 2); }
  }
  function play(done) {
    const D = 30.5;
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:fixed;inset:0;z-index:300;background:#000;cursor:pointer';
    wrap.innerHTML = '<div id="cfSay" style="position:absolute;left:50%;bottom:14%;transform:translateX(-50%);max-width:92vw;white-space:normal!important;font:900 clamp(20px,4vw,44px) Arial;color:#fff;-webkit-text-stroke:1px #000;text-shadow:0 3px 0 #000,0 0 20px #3a8a3a;opacity:0;transition:opacity .5s;text-align:center;white-space:nowrap"></div><div style="position:absolute;right:14px;bottom:10px;color:#fff;opacity:.5;font:12px Arial">Tippen = überspringen</div><div id="cfFade" style="position:absolute;inset:0;background:#000;opacity:1;transition:opacity .8s;pointer-events:none"></div>';
    document.body.appendChild(wrap);
    const R = new T.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 1.5)); R.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; wrap.insertBefore(R.domElement, wrap.firstChild);
    const S = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.05, 2000); S.fog = new T.Fog(0x2a2a48, 30, 120);
    const size = () => { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }; size();
    const hemi = new T.HemisphereLight(0x9ab0ff, 0x302020, 0.7), dl = new T.DirectionalLight(0xffd0a0, 0.7); dl.position.set(5, 10, 3); S.add(hemi, dl);
    const road = new T.Mesh(new T.PlaneGeometry(10, 200), new T.MeshLambertMaterial({ color: 0x2e2e34 })); road.rotation.x = -Math.PI / 2; road.rotation.z = Math.PI / 2; S.add(road);
    for (const z of [-6, 6]) { const sw = new T.Mesh(new T.BoxGeometry(200, 0.2, 3), new T.MeshLambertMaterial({ color: 0x6a6a70 })); sw.position.set(0, 0.1, z); S.add(sw); }
    for (let i = -10; i < 10; i++) { const l = new T.Mesh(new T.PlaneGeometry(2, 0.2), new T.MeshBasicMaterial({ color: 0xdddddd })); l.rotation.x = -Math.PI / 2; l.position.set(i * 5, 0.01, 0); S.add(l); }
    for (let i = 0; i < 24; i++) { const h = 6 + Math.random() * 14, b = new T.Mesh(new T.BoxGeometry(6, h, 6), new T.MeshLambertMaterial({ color: [0x4a4a58, 0x5a4a48, 0x3a4a5a][i % 3] })); b.position.set(-60 + i * 5.2, h / 2, i % 2 ? -11 : 11); S.add(b); }
    const ground = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshLambertMaterial({ color: 0x2a3a2a })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; S.add(ground);
    const cat = buildCat(); cat.g.rotation.y = 0; S.add(cat.g);
    const car = buildCar(); car.rotation.y = Math.PI / 2; S.add(car);
    // Himmel: Sterne + Licht
    const stars = new T.Points((() => { const gg = new T.BufferGeometry(), p = new Float32Array(1500 * 3); for (let i = 0; i < 1500; i++) { p[i * 3] = (Math.random() - 0.5) * 400; p[i * 3 + 1] = 20 + Math.random() * 200; p[i * 3 + 2] = (Math.random() - 0.5) * 400; } gg.setAttribute('position', new T.BufferAttribute(p, 3)); return gg; })(), new T.PointsMaterial({ color: 0xffffff, size: 0.4 })); S.add(stars);
    const beam = new T.Mesh(new T.CylinderGeometry(0.6, 1.2, 80, 20, 1, true), new T.MeshBasicMaterial({ color: 0xfff8d0, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); beam.position.set(0, 40, -2); S.add(beam);
    // Zeitlinien (wie bei Loki): leuchtende, verzweigte Fäden
    const tl = new T.Group(); S.add(tl); const tlM = new T.MeshBasicMaterial({ color: 0x60ff80, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
    for (let k = 0; k < 26; k++) { const pts = []; let x = 0, y = 0, z = 0; const a = k / 26 * 6.283; for (let i = 0; i < 14; i++) { pts.push(new T.Vector3(x, y, z)); x += Math.cos(a) * 0.6 + (Math.random() - 0.5) * 0.3; y += Math.sin(a) * 0.6 + (Math.random() - 0.5) * 0.3; z += (Math.random() - 0.5) * 0.4; } const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.02 + Math.random() * 0.02, 5, false), tlM); tl.add(tube); }
    const sky = new T.Color(0x2a2a48), sky2 = new T.Color(0x05050f);
    const keep = new Set([hemi, dl, cat.g, tl]); const worldObjs = S.children.filter((o) => !keep.has(o));
    const dim = new T.Group(); dim.visible = false; S.add(dim);
    const dimP = new T.Points((() => { const gg = new T.BufferGeometry(), p = new Float32Array(2500 * 3); for (let i = 0; i < 2500; i++) { p[i * 3] = (Math.random() - 0.5) * 300; p[i * 3 + 1] = Math.random() * 120 - 20; p[i * 3 + 2] = (Math.random() - 0.5) * 300; } gg.setAttribute('position', new T.BufferAttribute(p, 3)); return gg; })(), new T.PointsMaterial({ color: 0x80ffb0, size: 0.35, transparent: true, opacity: 0.8 })); dim.add(dimP);
    const path = new T.Mesh(new T.PlaneGeometry(6, 60), new T.MeshBasicMaterial({ color: 0x1a4a2a, transparent: true, opacity: 0.85 })); path.rotation.x = -Math.PI / 2; path.position.set(0, -0.01, -22); dim.add(path);
    for (let k = 0; k < 14; k++) { const l = new T.Mesh(new T.PlaneGeometry(6.2, 0.15), new T.MeshBasicMaterial({ color: 0x80ffb0 })); l.rotation.x = -Math.PI / 2; l.position.set(0, 0, -k * 4); dim.add(l); }
    const goldT = new T.MeshStandardMaterial({ color: 0xd8a830, metalness: 0.9, roughness: 0.25, emissive: 0x2a1a00 }), greenT = new T.MeshStandardMaterial({ color: 0x1f6a2a, metalness: 0.4, roughness: 0.5 });
    const throne = new T.Group(); throne.position.set(0, 0, -44); dim.add(throne);
    const bx = (m, w, h, d, x, y, z) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); throne.add(o); return o; };
    bx(goldT, 6, 1.2, 5, 0, 0.6, 0); bx(goldT, 5, 1.6, 4, 0, 1.9, 0); bx(greenT, 4.2, 0.4, 3.4, 0, 2.9, 0.2); bx(goldT, 5, 9, 0.8, 0, 6.4, -1.8); bx(greenT, 3.8, 7.4, 0.3, 0, 6.6, -1.35);
    for (const sd of [-1, 1]) { bx(goldT, 0.7, 2.4, 3.8, sd * 2.4, 3.4, 0); for (let k = 0; k < 5; k++) { const h = new T.Mesh(new T.CylinderGeometry(0.3 - k * 0.04, 0.34 - k * 0.04, 1.4, 8), goldT); h.position.set(sd * (1.8 + k * 0.35), 10.8 + k * 1.1, -1.8 - k * 0.2); h.rotation.z = -sd * (0.3 + k * 0.12); throne.add(h); } }
    const tree = new T.Group(); tree.position.set(0, 0, -50); tree.scale.setScalar(0.01); dim.add(tree);
    const treeM = new T.MeshBasicMaterial({ color: 0x60ff80, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false });
    tree.add(new T.Mesh(new T.CylinderGeometry(1.2, 2.2, 60, 12, 1, true), treeM)); tree.children[0].position.y = 30;
    for (let k = 0; k < 46; k++) { const a = k / 46 * 6.283 * 3.1, h0 = 12 + (k / 46) * 44, pts = [new T.Vector3(0, h0, 0)]; let x = 0, y = h0, z = 0; for (let i = 0; i < 9; i++) { x += Math.cos(a) * (2.4 + i * 0.3) + (Math.random() - 0.5); z += Math.sin(a) * (2.4 + i * 0.3) + (Math.random() - 0.5); y += 1.4 - i * 0.12 + (Math.random() - 0.5) * 0.6; pts.push(new T.Vector3(x, y, z)); } tree.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.15 + Math.random() * 0.12, 5, false), treeM)); }
    for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283, pts = [new T.Vector3(0, 0, 0)]; let x = 0, z = 0; for (let i = 0; i < 6; i++) { x += Math.cos(a) * 3; z += Math.sin(a) * 3; pts.push(new T.Vector3(x, -0.2 - i * 0.1, z)); } tree.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 20, 0.3, 5, false), treeM)); }
    const glowL = new T.PointLight(0x80ffb0, 0, 200, 1.5); glowL.position.set(0, 30, -50); dim.add(glowL);
    // Energie-Funken, die um Masik wirbeln
    const NE = 500, eGeo = new T.BufferGeometry(), eP = new Float32Array(NE * 3), eD = Array.from({ length: NE }, () => ({ a: Math.random() * 6.283, r: 2.2 + Math.random() * 6, h: Math.random() * 9, s: 0.4 + Math.random() * 1.4 }));
    eGeo.setAttribute('position', new T.BufferAttribute(eP, 3));
    const energy = new T.Points(eGeo, new T.PointsMaterial({ color: 0x9affc0, size: 0.09, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); dim.add(energy);
    // leuchtende Ringe bei jedem Schritt
    const rings = Array.from({ length: 10 }, () => { const m = new T.Mesh(new T.RingGeometry(0.8, 1, 48), new T.MeshBasicMaterial({ color: 0x80ffb0, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.userData.t = 99; dim.add(m); return m; });
    let ringI = 0, lastStep = -1;
    const stepRing = (x, z) => { const r = rings[ringI++ % rings.length]; r.position.set(x, 0.05, z); r.userData.t = 0; };
    // Lichtstrahlen hinter dem Thron
    const rays = new T.Group(); rays.position.set(0, 8, -47); dim.add(rays);
    for (let k = 0; k < 9; k++) { const c = new T.Mesh(new T.ConeGeometry(2.2, 70, 12, 1, true), new T.MeshBasicMaterial({ color: 0x7affa8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); c.position.y = 35; c.rotation.z = (k - 4) * 0.22; const p = new T.Group(); p.add(c); rays.add(p); }
    // Umhang weht (Wellen in der Fläche)
    const capeBase = cat.cape.geometry.attributes.position.array.slice();
    const waveCape = (t, amp) => { const p = cat.cape.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = capeBase[i * 3], y = capeBase[i * 3 + 1], k = (0.35 - y) / 0.7; p.setZ(i, Math.sin(t * 7 + y * 9 + x * 6) * amp * k + Math.sin(t * 3.1 + x * 4) * amp * 0.5 * k); } p.needsUpdate = true; cat.cape.geometry.computeVertexNormals(); };
    let shake = 0;
    let A = null, out = null; try { L.initAudio && L.initAudio(); A = L.audio && L.audio.ctx; if (A) out = sound(A, A.currentTime + 0.05); } catch (e) { /* ohne Ton */ }
    const say = wrap.querySelector('#cfSay'), fade = wrap.querySelector('#cfFade'); requestAnimationFrame(() => { fade.style.opacity = '0'; });
    const t0 = performance.now() / 1000; let ended = false, spoke = false, fly = null, treeSaid = false, sp1 = false, sp2 = false;
    const talk = (html, text) => { say.innerHTML = html; say.style.opacity = '1'; try { speechSynthesis.cancel(); const s = new SpeechSynthesisUtterance(text); s.lang = 'de-DE'; s.pitch = 1.4; s.rate = 1; speechSynthesis.speak(s); } catch (e) { /* egal */ } };
    const flashOn = () => { fade.style.transition = 'none'; fade.style.background = '#fff'; fade.style.opacity = '1'; requestAnimationFrame(() => { fade.style.transition = 'opacity .8s'; fade.style.opacity = '0'; setTimeout(() => { fade.style.background = '#000'; }, 900); }); };
    const end = () => { if (ended) return; ended = true; try { if (out) out.gain.setTargetAtTime(0, A.currentTime, 0.2); speechSynthesis.cancel(); } catch (e) { /* egal */ } fade.style.opacity = '1'; setTimeout(() => { wrap.remove(); R.dispose(); done(); }, 700); };
    wrap.addEventListener('pointerdown', end);
    function frame() {
      if (ended) return;
      const t = performance.now() / 1000 - t0;
      S.background = sky.clone().lerp(sky2, ease((t - 4) / 2));
      if (t < 3.05) {
        // Masik läuft über die Straße, das Auto kommt
        const u = t / 3.05; cat.g.position.set(0, 0, lerp(4.5, 0, u)); cat.g.rotation.set(0, Math.PI, 0); cat.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 12 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.6; }); cat.tail.rotation.x = Math.sin(t * 3) * 0.2;
        car.position.set(lerp(-60, 0, ease(u * 1.02)), 0, 0); cam.position.set(4, 1.2, 6); cam.lookAt(0, 0.4, 0);
      } else if (t < 4.2) {
        // Aufprall
        if (!fly) { fly = true; car.userData.v = 18; }
        const u = t - 3.05; car.position.x += 18 * 0.016; cat.g.position.set(u * 6, 0.2 + Math.sin(Math.min(1, u) * Math.PI) * 2.5, 0); cat.g.rotation.set(u * 9, Math.PI, u * 5);
        cam.position.set(4, 1.2, 6); cam.lookAt(cat.g.position.x * 0.6, 0.6, 0);
      } else if (t < 6.6) {
        // in den Himmel
        const u = (t - 4.2) / 2.4; car.position.x += 0.3; beam.position.set(cat.g.position.x, 40, 0); beam.material.opacity = Math.min(0.6, u * 1.5);
        cat.g.position.y = lerp(0.3, 18, ease(u)); cat.g.rotation.set(0, Math.PI + u * 6, 0); cat.legs.forEach((l) => { l.rotation.x = 0.3; });
        if (u > 0.7) { cat.cape.visible = true; cat.horns.visible = true; }
        cam.position.set(cat.g.position.x + 5, lerp(1.5, cat.g.position.y - 2, u), 7); cam.lookAt(cat.g.position.x, cat.g.position.y, 0);
      } else if (t < 9.3) {
        // Zoom auf Loki-Masik
        const u = (t - 6.6) / 2.7; beam.material.opacity = Math.max(0, 0.35 - u * 0.4); cat.g.rotation.set(0, Math.PI * 2, 0); cat.g.position.y = 18 + Math.sin(t * 2) * 0.1;
        cat.cape.rotation.x = 1.4 + Math.sin(t * 4) * 0.08; cat.body.rotation.x = -0.1 * u; cat.g.rotation.x = -0.5 * ease(u);
        cam.position.set(cat.g.position.x + lerp(4, 0.2, ease(u)), cat.g.position.y + lerp(1, 0.75, u), lerp(6, 1.4, ease(u))); cam.lookAt(cat.g.position.x, cat.g.position.y + 0.5, 0);
      } else if (t < 14.5) {
        // hält die Zeitlinien zusammen
        const u = t - 9.3; beam.visible = false; tl.position.set(cat.g.position.x, cat.g.position.y + 0.45, 0.35); tl.rotation.z += 0.004; tlM.opacity = Math.min(0.9, u * 0.8); tl.scale.setScalar(Math.min(1, u * 0.7) * (1 + Math.sin(t * 3) * 0.02));
        cat.g.rotation.x = -0.9; cat.legs[0].rotation.x = cat.legs[1].rotation.x = -2.2; cat.cape.rotation.x = 1.4 + Math.sin(t * 4) * 0.08;
        cam.position.set(cat.g.position.x + 0.6, cat.g.position.y + 1.2, 3.6); cam.lookAt(cat.g.position.x, cat.g.position.y + 0.7, 0);
        if (!spoke && u > 1.2) { spoke = true; talk('„Deswegen kannst du spielen.“', 'Deswegen kannst du spielen.'); }
      } else if (t < 16.5) {
        // Masik wird größer – Übergang in eine andere Dimension
        const u = (t - 14.5) / 2;
        if (!dim.visible && u > 0.45) { dim.visible = true; worldObjs.forEach((o) => { o.visible = false; }); stars.visible = false; S.fog.color.set(0x0a0418); S.fog.near = 40; S.fog.far = 260; cat.g.position.set(0, 0, 0); cat.g.rotation.set(0, Math.PI, 0); flashOn(); say.style.opacity = '0'; }
        S.background = new T.Color(dim.visible ? 0x0a0418 : 0x05050f); cat.g.scale.setScalar(1 + ease(u) * 3); tlM.opacity = 0.9;
        tl.position.set(cat.g.position.x, cat.g.position.y + 0.45 * cat.g.scale.x, cat.g.position.z + (dim.visible ? 0.8 : 0.35)); tl.scale.setScalar(cat.g.scale.x * 0.6);
        cam.position.set(cat.g.position.x + 3 + u * 6, cat.g.position.y + 2 + u * 3, cat.g.position.z + 6 + u * 6); cam.lookAt(cat.g.position.x, cat.g.position.y + 1.2 * cat.g.scale.x, cat.g.position.z);
      } else if (t < 21.5) {
        // steht auf und läuft aufrecht zum Thron – trägt die Zeitlinien mit beiden Pfoten vor sich
        const u = (t - 16.5) / 5, up = ease((t - 16.5) / 0.9); S.background = new T.Color(0x0a0418);
        cat.g.scale.setScalar(4); const z = lerp(0, -37, ease(u) * 0.35 + u * 0.65);
        cat.g.rotation.set(up * 1.12, Math.PI, Math.sin(t * 3.5) * 0.05 * up); cat.g.position.set(Math.sin(t * 3.5) * 0.15, up * 1.05 + Math.abs(Math.sin(t * 3.5)) * 0.12, z);
        const st = Math.sin(t * 3.5);
        cat.legs[2].rotation.x = -up * 1.12 + st * 0.55; cat.legs[3].rotation.x = -up * 1.12 - st * 0.55;
        cat.legs[0].rotation.x = cat.legs[1].rotation.x = lerp(0, -1.75, up) + Math.sin(t * 2) * 0.05; cat.legs[0].rotation.z = -0.25 * up; cat.legs[1].rotation.z = 0.25 * up;
        cat.head.rotation.x = 0.95 * up; cat.tail.rotation.x = 0.6 * up + Math.sin(t * 2.5) * 0.2;
        cat.cape.rotation.x = lerp(1.25, 0.25, up) + Math.sin(t * 3) * 0.08; waveCape(t, 0.08);
        const stepN = Math.floor((t - 16.5) * 3.5 / Math.PI); if (stepN !== lastStep && up > 0.5) { lastStep = stepN; stepRing(cat.g.position.x, z); shake = 0.25; }
        tl.position.set(cat.g.position.x, 3.3 + Math.sin(t * 2) * 0.1, z - 1.3); tl.rotation.set(0, t * 0.6, t * 0.25); tl.scale.setScalar(0.28 + Math.sin(t * 4) * 0.02); tlM.opacity = 0.95; dimP.rotation.y += 0.0015;
        energy.material.opacity = Math.min(0.9, (t - 16.5) * 0.8); rays.children.forEach((r, k) => { r.children[0].material.opacity = 0.05 + 0.05 * Math.sin(t * 2 + k) + u * 0.08; r.rotation.y = t * 0.1 + k * 0.7; });
        goldT.emissiveIntensity = 1 + Math.sin(t * 4) * 0.5 + u * 2;
        if (t < 18) { const k = (t - 16.5) / 1.5; cam.position.set(1.2 - k * 0.6, 0.9 + k * 0.4, z - 7.5 + k * 1.2); cam.lookAt(cat.g.position.x, 3.4, z); }
        else if (t < 19.5) { const k = (t - 18) / 1.5; cam.position.set(6.5 - k * 1.5, 3.6, z - 3.2); cam.lookAt(cat.g.position.x, 3.2, z - 0.8); }
        else { const k = ease((t - 19.5) / 2); cam.position.set(lerp(3, 0, k), lerp(4, 16, k), z + lerp(7, 16, k)); cam.lookAt(0, lerp(4, 7, k), -42); }
      } else if (t < 25) {
        // dreht sich um, setzt sich, hebt beide Pfoten – Lichtausbruch, die Zeitlinien wachsen zum Baum des Wissens
        const sit = ease((t - 21.5) / 1.1), burst = t - 22.7;
        cat.g.position.set(0, lerp(1.05, 3.6, sit), lerp(-37, -42.3, sit)); cat.g.rotation.set(lerp(1.12, -1.0, sit), lerp(Math.PI, Math.PI * 2, sit), 0); cat.g.scale.setScalar(4);
        cat.legs[2].rotation.x = cat.legs[3].rotation.x = lerp(-1.12, -0.15, sit);
        const raise = ease((t - 22.2) / 0.5) - ease((t - 23.9) / 0.8); cat.legs[0].rotation.x = cat.legs[1].rotation.x = t < 23.9 ? lerp(-1.75, -2.9, raise) : lerp(-0.75, -2.9, raise); cat.legs[0].rotation.z = -0.25 - raise * 0.35; cat.legs[1].rotation.z = 0.25 + raise * 0.35;
        cat.head.rotation.x = lerp(0.95, 0.9, sit); cat.cape.rotation.x = 0.4 + Math.sin(t * 3) * 0.1; waveCape(t, 0.1 + (burst > 0 && burst < 1.5 ? 0.15 : 0));
        if (burst > 0 && !treeSaid) { treeSaid = true; sky2.set(0x0a0418); flashOn(); shake = 1.2; for (let k = 0; k < rings.length; k++) setTimeout(() => stepRing(0, -43), k * 90); }
        tl.position.set(0, 4.8 + Math.max(0, burst) * 6, -43); tl.scale.setScalar(2.2 * (burst > 0 ? Math.max(0, 1 - burst * 0.8) : 1)); tl.rotation.z += 0.03;
        const g2 = ease(burst / 2); tree.scale.setScalar(Math.max(0.01, g2)); glowL.intensity = g2 * 4; tree.rotation.y += 0.003;
        rays.children.forEach((r, k) => { r.children[0].material.opacity = (burst > 0 ? 0.25 : 0.1) + 0.06 * Math.sin(t * 3 + k); r.rotation.y = t * 0.15 + k * 0.7; }); goldT.emissiveIntensity = 3 + Math.sin(t * 6);
        energy.material.opacity = 0.9;
        if (t < 22.7) { const k = (t - 21.5) / 1.2; cam.position.set(lerp(6, 3, k), lerp(6, 5, k), -32 + k * 2); cam.lookAt(0, 4.5, -43); }
        else { const k = ease((t - 22.7) / 2.3); cam.position.set(lerp(14, 26, k), lerp(8, 30, k), lerp(-22, -8, k)); cam.lookAt(0, lerp(7, 26, k), -46); }
      } else {
        // Nahaufnahme – das Versprechen
        cat.legs[2].rotation.x = cat.legs[3].rotation.x = -0.15; cat.legs[0].rotation.x = cat.legs[1].rotation.x = -0.75 + Math.sin(t * 1.5) * 0.06; cat.legs[0].rotation.z = -0.3; cat.legs[1].rotation.z = 0.3; cat.g.position.z = -42.3; cat.g.position.y = 3.6;
        const u = t - 25; tl.visible = false; tree.scale.setScalar(1); tree.rotation.y += 0.002;
        const hy = 3.1 + 0.45 * 4 + 0.5; cam.position.set(0.9, hy + 0.5, -44 + 7.2 - Math.min(1, u * 0.4) * 1.5); cam.lookAt(0, hy - 0.4, -44);
        say.style.bottom = 'auto'; say.style.top = '8%';
        if (!sp1) { sp1 = true; talk('🐈‍⬛ „Ich beschütze dich für immer.“', 'Ich beschütze dich für immer.'); }
        if (u > 2.4 && !sp2) { sp2 = true; talk('„Geh zu Pusha beim Turm und beantworte seine 6 Fragen – dann bekommst du MASIKS SCHUTZ:<br>kein Schaden mehr und von Pusha den Zeitstein – das Auge des Agamotto.“', 'Geh zu Pusha beim Turm und beantworte seine sechs Fragen. Dann bekommst du meinen Schutz. Du nimmst keinen Schaden mehr, und Pusha gibt dir den Zeitstein, das Auge des Agamotto.'); }
      }
      if (dim.visible) {
        const cx = cat.g.position.x, cz = cat.g.position.z, burst = t - 22.7;
        for (let i = 0; i < NE; i++) { const d = eD[i]; d.a += 0.016 * d.s * (burst > 0 && burst < 3 ? 3 : 1); const rr = d.r * (burst > 0 ? 1 + Math.min(2, burst) * 0.8 : 1), hh = (d.h + t * d.s * 1.2) % 10; eP[i * 3] = cx + Math.cos(d.a) * rr; eP[i * 3 + 1] = hh + (burst > 0 ? Math.min(3, burst) * d.s * 3 : 0); eP[i * 3 + 2] = cz + Math.sin(d.a) * rr; }
        eGeo.attributes.position.needsUpdate = true;
        rings.forEach((r) => { r.userData.t += 0.016; const k = r.userData.t; r.material.opacity = k < 1 ? 0.8 * (1 - k) : 0; r.scale.setScalar(1 + k * 9); });
      }
      if (shake > 0) { shake = Math.max(0, shake - 0.03); cam.position.x += (Math.random() - 0.5) * shake * 0.6; cam.position.y += (Math.random() - 0.5) * shake * 0.6; }
      R.render(S, cam); if (L._cfSnap) L._cfSnap(t, R.domElement);
      if (t > D && (!sp2 || !window.speechSynthesis || !speechSynthesis.speaking || t > D + 25)) { end(); return; }
      requestAnimationFrame(frame);
    }
    frame();
  }
  L.playCatFilm = play; L.buildMasik = buildCat;
  // vor jedem Spielstart abspielen
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('#btnPlay');
    if (!b || L._catBypass || L.state === 'game') return;
    e.stopImmediatePropagation(); e.preventDefault();
    play(() => { L._catBypass = true; b.click(); setTimeout(() => { L._catBypass = false; }, 0); });
  }, true);
})();
