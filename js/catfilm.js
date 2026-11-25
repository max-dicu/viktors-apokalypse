'use strict';
// Kurzfilm beim Klick auf „Spielen“: Die Katze Massig wird überfahren, fliegt in den Himmel, wird zu Loki und hält die Zeitlinien zusammen –
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
    return out;
  }
  function play(done) {
    const D = 14.5;
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:fixed;inset:0;z-index:300;background:#000;cursor:pointer';
    wrap.innerHTML = '<div id="cfSay" style="position:absolute;left:50%;bottom:14%;transform:translateX(-50%);font:900 clamp(20px,4vw,44px) Arial;color:#fff;-webkit-text-stroke:1px #000;text-shadow:0 3px 0 #000,0 0 20px #3a8a3a;opacity:0;transition:opacity .5s;text-align:center;white-space:nowrap"></div><div style="position:absolute;right:14px;bottom:10px;color:#fff;opacity:.5;font:12px Arial">Tippen = überspringen</div><div id="cfFade" style="position:absolute;inset:0;background:#000;opacity:1;transition:opacity .8s;pointer-events:none"></div>';
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
    let A = null, out = null; try { L.initAudio && L.initAudio(); A = L.audio && L.audio.ctx; if (A) out = sound(A, A.currentTime + 0.05); } catch (e) { /* ohne Ton */ }
    const say = wrap.querySelector('#cfSay'), fade = wrap.querySelector('#cfFade'); requestAnimationFrame(() => { fade.style.opacity = '0'; });
    const t0 = performance.now() / 1000; let ended = false, spoke = false, fly = null;
    const end = () => { if (ended) return; ended = true; try { if (out) out.gain.setTargetAtTime(0, A.currentTime, 0.2); speechSynthesis.cancel(); } catch (e) { /* egal */ } fade.style.opacity = '1'; setTimeout(() => { wrap.remove(); R.dispose(); done(); }, 700); };
    wrap.addEventListener('pointerdown', end);
    function frame() {
      if (ended) return;
      const t = performance.now() / 1000 - t0;
      S.background = sky.clone().lerp(sky2, ease((t - 4) / 2));
      if (t < 3.05) {
        // Massig läuft über die Straße, das Auto kommt
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
        // Zoom auf Loki-Massig
        const u = (t - 6.6) / 2.7; beam.material.opacity = Math.max(0, 0.35 - u * 0.4); cat.g.rotation.set(0, Math.PI * 2, 0); cat.g.position.y = 18 + Math.sin(t * 2) * 0.1;
        cat.cape.rotation.x = 1.4 + Math.sin(t * 4) * 0.08; cat.body.rotation.x = -0.1 * u; cat.g.rotation.x = -0.5 * ease(u);
        cam.position.set(cat.g.position.x + lerp(4, 0.2, ease(u)), cat.g.position.y + lerp(1, 0.75, u), lerp(6, 1.4, ease(u))); cam.lookAt(cat.g.position.x, cat.g.position.y + 0.5, 0);
      } else {
        // hält die Zeitlinien zusammen
        const u = t - 9.3; beam.visible = false; tl.position.set(cat.g.position.x, cat.g.position.y + 0.45, 0.35); tl.rotation.z += 0.004; tlM.opacity = Math.min(0.9, u * 0.8); tl.scale.setScalar(Math.min(1, u * 0.7) * (1 + Math.sin(t * 3) * 0.02));
        cat.g.rotation.x = -0.9; cat.legs[0].rotation.x = cat.legs[1].rotation.x = -2.2; cat.cape.rotation.x = 1.4 + Math.sin(t * 4) * 0.08;
        cam.position.set(cat.g.position.x + 0.6, cat.g.position.y + 1.2, 3.6); cam.lookAt(cat.g.position.x, cat.g.position.y + 0.7, 0);
        if (!spoke && u > 1.2) { spoke = true; say.textContent = '„Deswegen kannst du spielen.“'; say.style.opacity = '1'; try { const s = new SpeechSynthesisUtterance('Deswegen kannst du spielen.'); s.lang = 'de-DE'; s.pitch = 1.4; s.rate = 0.95; speechSynthesis.speak(s); } catch (e) { /* egal */ } }
      }
      R.render(S, cam); if (L._cfSnap) L._cfSnap(t, R.domElement);
      if (t > D) { end(); return; }
      requestAnimationFrame(frame);
    }
    frame();
  }
  L.playCatFilm = play;
  // vor jedem Spielstart abspielen
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('#btnPlay');
    if (!b || L._catBypass || L.state === 'game') return;
    e.stopImmediatePropagation(); e.preventDefault();
    play(() => { L._catBypass = true; b.click(); setTimeout(() => { L._catBypass = false; }, 0); });
  }, true);
})();
