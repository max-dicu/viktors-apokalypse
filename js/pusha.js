'use strict';
// Pusha – ein weiser, grauer Hund (fast doppelt so groß wie ein Mensch) mit Schnurrbart. Er sitzt beim Turm und stellt 6 Fragen.
// Alle richtig → Masiks Schutz für diese Runde (jede Runde neu beantworten).
(function () {
  const L = window.L, T = THREE, P = L.player;
  const QS = [
    ['Welche Fähigkeit hatte das erste Walross?', 'Lange Fingernägel', ['Gestaltwandlung', 'Kosmischer Hunger']],
    ['Wofür ist Pusha bekannt?', 'Pusha Blue', ['Ein Hund zu sein', 'Nicht mächtig zu sein']],
    ['Wie viele Walrosse gibt es?', '1000 – fast unmöglich zu zählen in einem See', ['2', 'Eine Million']],
    ['Wer zähmt die Walrosse – und wie?', 'Nina mit ihrem Besen', ['Nina mit ihrem Stock', 'Ruslan']],
    ['Wer war der erste Charakter des Nasna-Universums?', 'Der Verschlucker', ['Das Walross', 'Die wahre Carolina']],
    ['Welche Sinasina-Theorie wurde Hamaya erzählt?', 'Die der wahren Carolina', ['Die des Walrosses', 'Die von Pusha']],
  ];
  const DARK = new T.Color('#2b2c30'), MID = new T.Color('#404147'), LIGHT = new T.Color('#5d5e66'), PALE = new T.Color('#8a8b93');
  const mat = (c, r) => new T.MeshStandardMaterial({ color: c, roughness: r == null ? 1 : r, metalness: 0 });
  const rnd = (() => { let s = 77; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

  // ---------- Modell: sitzender, flauschiger Hund aus vielen Fell-Locken ----------
  function furCloud(parts, n) {
    // parts: [cx, cy, cz, rx, ry, rz, puffSize, lightBias]
    const geo = new T.IcosahedronGeometry(1, 1), list = [];
    for (const p of parts) { const cnt = Math.round(n * p[3] * p[4] * p[5] * 2.2) + 6; for (let i = 0; i < cnt; i++) { const u = rnd() * 2 - 1, a = rnd() * 6.283, s = Math.sqrt(1 - u * u), d = [s * Math.cos(a), u, s * Math.sin(a)]; if (p[8] && d[2] > 0.42 && d[1] > -0.55 && d[1] < 0.7) continue; list.push([p[0] + d[0] * p[3], p[1] + d[1] * p[4], p[2] + d[2] * p[5], p[6] * (0.7 + rnd() * 0.6), d[1] * 0.5 + (p[7] || 0) + (rnd() - 0.5) * 0.5]); } }
    const m = new T.InstancedMesh(geo, mat('#ffffff'), list.length), o = new T.Object3D(), c = new T.Color();
    list.forEach((q, i) => { o.position.set(q[0], q[1], q[2]); o.scale.setScalar(q[3]); o.rotation.set(rnd() * 6, rnd() * 6, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); const k = q[4]; c.copy(k > 0.45 ? LIGHT : k > 0 ? MID : DARK); if (k > 0.8) c.copy(PALE); m.setColorAt(i, c); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; return m;
  }
  function buildPusha() {
    const root = new T.Group(), body = new T.Group(), head = new T.Group(), tail = new T.Group(); root.add(body); body.add(head); body.add(tail);
    // Körper, Brust, Beine, Pfoten, Hinterläufe
    body.add(furCloud([
      [0, 1.1, -0.3, 0.95, 0.95, 1.0, 0.24, -0.1], [0, 1.6, 0.3, 0.72, 0.8, 0.58, 0.22, 0.1],
      [0.42, 0.6, 0.6, 0.24, 0.62, 0.24, 0.17, -0.2], [-0.42, 0.6, 0.6, 0.24, 0.62, 0.24, 0.17, -0.2],
      [0.44, 0.14, 0.74, 0.28, 0.15, 0.32, 0.14, 0], [-0.44, 0.14, 0.74, 0.28, 0.15, 0.32, 0.14, 0],
      [0.78, 0.55, -0.15, 0.38, 0.48, 0.68, 0.2, -0.15], [-0.78, 0.55, -0.15, 0.38, 0.48, 0.68, 0.2, -0.15],
    ], 26));
    const core = new T.Mesh(new T.SphereGeometry(1, 16, 12), mat(DARK)); core.scale.set(0.9, 1.0, 0.95); core.position.set(0, 1.25, -0.1); body.add(core);
    // Kopf (eigene Gruppe, damit er sich neigen kann)
    head.position.set(0, 2.55, 0.45);
    head.add(furCloud([[0, 0.25, 0.05, 0.72, 0.64, 0.66, 0.2, 0.15, true], [0, -0.05, 0.66, 0.34, 0.24, 0.3, 0.07, 0.25, true]], 30));
    const muz = new T.Mesh(new T.SphereGeometry(1, 16, 12), mat(MID)); muz.scale.set(0.36, 0.27, 0.36); muz.position.set(0, -0.04, 0.62); head.add(muz);
    const hcore = new T.Mesh(new T.SphereGeometry(1, 16, 12), mat(DARK)); hcore.scale.set(0.68, 0.62, 0.62); hcore.position.set(0, 0.22, 0.05); head.add(hcore);
    // Schlappohren
    for (const s of [-1, 1]) { const ear = furCloud([[s * 0.72, -0.25, 0.02, 0.26, 0.72, 0.3, 0.15, -0.45], [s * 0.78, -0.85, 0.05, 0.22, 0.25, 0.26, 0.13, -0.3]], 40); ear.rotation.z = s * 0.12; head.add(ear);
      const eCore = new T.Mesh(new T.SphereGeometry(1, 12, 10), mat(DARK)); eCore.scale.set(0.22, 0.7, 0.26); eCore.position.set(s * 0.72, -0.3, 0.02); eCore.rotation.z = s * 0.12; head.add(eCore); }
    // Nase, Augen (dunkel glänzend), buschige Brauen
    const nose = new T.Mesh(new T.SphereGeometry(0.12, 12, 10), mat('#141417', 0.35)); nose.scale.set(1.2, 0.85, 1); nose.position.set(0, 0.04, 0.97); head.add(nose);
    for (const s of [-1, 1]) {
      const eye = new T.Mesh(new T.SphereGeometry(0.1, 12, 10), mat('#1d1712', 0.15)); eye.position.set(s * 0.25, 0.33, 0.6); head.add(eye);
      const glint = new T.Mesh(new T.SphereGeometry(0.025, 8, 6), new T.MeshBasicMaterial({ color: '#9fa0a8' })); glint.position.set(s * 0.23, 0.37, 0.69); head.add(glint);
      const brow = furCloud([[s * 0.28, 0.48, 0.6, 0.2, 0.05, 0.07, 0.07, 0.9]], 400); brow.rotation.z = s * -0.35; head.add(brow);
    }
    // weiser Schnurrbart: zwei lange, hängende Strähnen + Kinnbart (hellgrau, kein Weiß)
    for (const s of [-1, 1]) {
      const pts = [[s * 0.1, -0.06, 0.95], [s * 0.3, -0.12, 0.9], [s * 0.5, -0.32, 0.82], [s * 0.6, -0.65, 0.74], [s * 0.58, -0.95, 0.7]];
      const curve = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], p[1], p[2])));
      const SEG = 40, RAD = 10, tg = new T.TubeGeometry(curve, SEG, 0.085, RAD, false), pos = tg.attributes.position;
      for (let i = 0; i <= SEG; i++) { const k = i / SEG, c = curve.getPointAt(k), f = 1 - k * 0.85; for (let j = 0; j <= RAD; j++) { const v = i * (RAD + 1) + j; pos.setXYZ(v, c.x + (pos.getX(v) - c.x) * f, c.y + (pos.getY(v) - c.y) * f, c.z + (pos.getZ(v) - c.z) * f); } }
      pos.needsUpdate = true; tg.computeVertexNormals(); head.add(new T.Mesh(tg, mat(PALE, 0.8)));
    }
    head.add(furCloud([[0, -0.36, 0.66, 0.2, 0.22, 0.14, 0.08, 0.7]], 120));
    // Ringelschwanz
    tail.position.set(0, 1.0, -1.15);
    for (let i = 0; i < 14; i++) { const a = i / 13 * Math.PI * 1.3; const b = new T.Mesh(new T.IcosahedronGeometry(0.2 - i * 0.006, 1), mat(i % 3 ? MID : LIGHT)); b.position.set(Math.sin(a) * 0.15, Math.sin(a) * 0.55 + i * 0.02, -Math.cos(a) * 0.35 + 0.1); tail.add(b); }
    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return { root, body, head, tail };
  }
  // „?“-Zeichen über dem Kopf
  function qSprite() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(30,40,90,.85)'; g.beginPath(); g.arc(64, 64, 56, 0, 6.283); g.fill(); g.strokeStyle = '#ffd24a'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#ffd24a'; g.font = 'bold 84px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 64, 70);
    const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.setScalar(1.3); s.renderOrder = 9; return s;
  }

  // ---------- Platz beim Turm ----------
  let D = null, sign = null, beam = null, spot = null;
  function place() {
    const Tw = L.TOWER || { x: 38, z: 38 };
    for (let r = 40; r < 160 && !spot; r += 6) for (let k = 0; k < 16; k++) {
      const a = k / 16 * 6.283, x = Tw.x + Math.sin(a) * r, z = Tw.z + Math.cos(a) * r;
      if (L.queryBoxes(x, z, 6).length || (L.mountainH && L.mountainH(x, z) > 0) || (L.waterDepth && L.waterDepth(x, z) > 0) || (L.inTower && L.inTower(x, z, 8)) || (L.onRoad && L.onRoad(x, z))) continue;
      spot = { x, z, yaw: Math.atan2(Tw.x - x, Tw.z - z) + Math.PI }; break;
    }
    if (!spot) spot = { x: Tw.x + 60, z: Tw.z, yaw: Math.PI / 2 };
    D = buildPusha(); D.root.position.set(spot.x, 0, spot.z); D.root.rotation.y = spot.yaw; L.scene.add(D.root);
    sign = qSprite(); L.scene.add(sign);
    beam = new T.Mesh(new T.CylinderGeometry(0.6, 0.9, 90, 10, 1, true), new T.MeshBasicMaterial({ color: 0x6aa8ff, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    beam.position.set(spot.x, 45, spot.z); L.scene.add(beam);
    if (L.addBox) L.addBox(spot.x - 1.2, spot.z - 1.2, spot.x + 1.2, spot.z + 1.2, 3, 'building');
    L.pushaSpot = spot;
  }
  const passed = () => !!L._massigRound;
  const near = () => D && !P.vehicle && L.worldOf && L.worldOf(P.x, P.z) === 'home' && Math.hypot(P.x - spot.x, P.z - spot.z) < 6.5;

  // ---------- Stimme ----------
  function speak(t) { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.pitch = 0.55; u.rate = 0.92; u.volume = L.S && L.S().sfx !== undefined ? Math.max(0.2, L.S().sfx) : 1; speechSynthesis.speak(u); } catch (e) { /* ohne Stimme */ } }

  // ---------- Fragen-Fenster ----------
  let box = null, qi = 0, order = [];
  const css = 'display:block;width:100%;margin:7px 0;padding:12px;border:0;border-radius:10px;font:bold 15px Arial;cursor:pointer;';
  function close() { if (!box || box.style.display === 'none') return; box.style.display = 'none'; L.uiBlock = false; try { speechSynthesis.cancel(); } catch (e) { /* egal */ } if (L.state === 'game' && !L.paused && L.lock) L.lock(); }
  function frame(inner) {
    box.firstChild.innerHTML = '<div style="font-size:22px;font-weight:bold;margin-bottom:2px">🐕 Pusha</div><div style="opacity:.7;font-size:12px;margin-bottom:12px">der weise Hund</div>' + inner +
      '<button data-a="x" style="margin-top:10px;padding:8px 16px;border:0;border-radius:8px;background:#555;color:#fff;font:bold 13px Arial;cursor:pointer">Schließen</button>';
  }
  function ask() {
    const q = QS[qi]; order = [q[1], ...q[2]].sort(() => Math.random() - 0.5);
    frame('<div style="opacity:.8;margin-bottom:4px">Frage ' + (qi + 1) + ' / ' + QS.length + '</div><div style="font-size:18px;margin-bottom:10px">„' + q[0] + '“</div>' +
      order.map((a, i) => '<button data-a="' + i + '" style="' + css + 'background:linear-gradient(90deg,#3a4a8a,#5a3a8a);color:#fff">' + a + '</button>').join(''));
    speak(q[0]);
  }
  function open() {
    if (!box) {
      box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;background:rgba(8,10,24,.55)';
      box.innerHTML = '<div style="background:linear-gradient(#2c3046,#15172a);border:3px solid #9aa0b8;border-radius:16px;padding:18px;width:min(480px,92vw);color:#fff;font:15px Arial,sans-serif;text-align:center;box-shadow:0 10px 40px #000"></div>';
      box.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) { if (e.target === box) close(); return; }
        const a = b.dataset.a; if (a === 'x') { close(); return; }
        if (a === 'again') { qi = 0; ask(); return; }
        if (order[+a] === QS[qi][1]) {
          L.tn && L.tn({ f: 520, fTo: 880, dur: 0.18, type: 'triangle', vol: 0.18 });
          qi++; if (qi < QS.length) { ask(); return; }
          frame('<div style="font-size:18px;margin:8px 0 12px">„Du kennst die Geschichten. Masik wird dich in dieser Runde beschützen.“</div><div style="color:#7dffa0;font-weight:bold">🐈‍⬛ MASIKS SCHUTZ – kein Schaden + Auge des Agamotto (nur diese Runde)</div>');
          speak('Du kennst die Geschichten. Masik wird dich in dieser Runde beschützen.');
          if (L.grantMassig) L.grantMassig();
        } else {
          L.tn && L.tn({ f: 300, fTo: 120, dur: 0.35, type: 'sawtooth', vol: 0.15 });
          frame('<div style="font-size:18px;margin:8px 0 12px">„Nein … das stimmt nicht.“</div><div style="opacity:.8;margin-bottom:8px">Pusha schüttelt langsam den Kopf. Du musst wieder bei Frage 1 anfangen.</div><button data-a="again" style="' + css + 'background:#d8c050;color:#2a2008">🔁 Nochmal von vorn</button>');
          speak('Nein. Das stimmt nicht. Fang von vorne an.'); shakeT = 1.2;
        }
      });
      addEventListener('keydown', (e) => { if (box.style.display === 'flex' && (e.code === 'Escape' || e.code === 'KeyE')) { close(); e.preventDefault(); e.stopPropagation(); } }, true);
      document.body.appendChild(box);
    }
    box.style.display = 'flex'; L.uiBlock = true; if (L.unlock) L.unlock();
    if (passed()) { frame('<div style="font-size:18px;margin:8px 0">„Du hast meine Prüfung in dieser Runde schon bestanden. Masik ist bei dir.“</div>'); speak('Du hast meine Prüfung in dieser Runde schon bestanden.'); return; }
    qi = 0; ask();
  }
  const och = L.crateHint, oci = L.crateInteract;
  L.crateHint = () => (near() ? (passed() ? 'E: 🐕 Pusha (Prüfung bestanden)' : 'E: 🐕 Pusha: „Beantworte meine 6 Fragen …“') : och ? och() : null);
  L.crateInteract = function () { if (!near()) return oci ? oci() : false; open(); return true; };

  // Hinweis zu Rundenbeginn
  const ohs = L.heroStart; L.heroStart = function () { if (ohs) ohs(); setTimeout(() => { if (L.state === 'game') L.msg('🐕 Pusha wartet beim Turm (blaues Licht) – beantworte seine 6 Fragen für Masiks Schutz in dieser Runde.', 7000); }, 9000); };

  // ---------- jedes Bild ----------
  let shakeT = 0;
  L.updatePusha = function (dt) {
    if (L.state !== 'game') return;
    if (!D) { try { place(); } catch (e) { console.error(e); return; } }
    const t = performance.now() / 1000, d = Math.hypot(P.x - spot.x, P.z - spot.z), show = d < 900;
    D.root.visible = show; beam.visible = show && !passed() && d > 25; sign.visible = show && !passed();
    if (!show) return;
    D.body.scale.set(1, 1 + Math.sin(t * 1.6) * 0.012, 1);
    D.tail.rotation.y = Math.sin(t * (near() ? 7 : 2.5)) * 0.45;
    // Kopf schaut zum Spieler, wenn er nah ist; bei falscher Antwort Kopfschütteln
    let want = 0; if (d < 25) { const a = Math.atan2(P.x - spot.x, P.z - spot.z) - spot.yaw; want = Math.atan2(Math.sin(a), Math.cos(a)); want = Math.max(-0.7, Math.min(0.7, want)); }
    D.head.rotation.y += (want - D.head.rotation.y) * Math.min(1, dt * 3);
    if (shakeT > 0) { shakeT -= dt; D.head.rotation.y += Math.sin(t * 16) * 0.12; }
    D.head.rotation.z = Math.sin(t * 0.7) * 0.06; D.head.rotation.x = Math.sin(t * 1.1) * 0.03;
    sign.position.set(spot.x, 4.9 + Math.sin(t * 2) * 0.15, spot.z);
    beam.material.opacity = 0.16 + Math.sin(t * 2) * 0.06;
  };
})();
