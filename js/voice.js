'use strict';
// Sprachchat für 2–4 Spieler: jeder hört jeden – egal, wo auf der Karte (gleich laut).
// Die Stimme läuft über dieselbe Verbindung wie das Spiel (direkt oder über den Server-Umweg aus relay.js),
// darum klappt sie überall dort, wo auch das Mehrspieler-Spiel klappt. Ein- und Ausschalten: 🎤-Knopf oder Taste K.
// Technik: Mikrofon → 8 kHz, μ-law (8 Bit) → kleine Pakete (nur wenn du sprichst) → bei den anderen über WebAudio abgespielt.
(function () {
  const L = window.L, N = L.net;
  const V = { on: false, mute: false, stream: null, src: null, proc: null, sink: null, out: new Map(), heard: new Set() };
  L.voice = V;
  const RATE = 8000;
  const send = (m) => { if (L.mp && L.mp.send && N.connected) L.mp.send(m); };

  // ---------- Knopf und Anzeige (rechts neben dem 💬-Chat-Knopf, damit der Chat frei bleibt) ----------
  const btn = document.createElement('button'); btn.id = 'voiceBtn'; btn.hidden = true;
  btn.style.cssText = 'position:fixed;left:110px;bottom:100px;z-index:13;padding:6px 12px;border-radius:10px;border:2px solid #8aff9a;background:rgba(0,0,0,.6);color:#fff;font-weight:700;cursor:pointer;white-space:nowrap';
  const who = document.createElement('div'); who.id = 'voiceWho';
  who.style.cssText = 'position:fixed;left:110px;bottom:72px;z-index:13;font:bold 13px Arial,sans-serif;color:#fff;text-shadow:0 1px 3px #000;pointer-events:none;white-space:nowrap';
  document.body.appendChild(btn); document.body.appendChild(who);
  const cs = document.createElement('style'); cs.textContent = 'body.touch #voiceBtn{bottom:auto!important;top:240px;left:16px!important} body.touch #voiceWho{bottom:auto!important;top:280px;left:16px!important} body.cinema #voiceBtn,body.cinema #voiceWho{visibility:hidden}'; document.head.appendChild(cs);
  function label() { btn.textContent = !V.on ? '🎤 Sprachchat an (K)' : V.mute ? '🔇 Stumm (antippen = reden)' : '🎙️ Du sprichst · aus = K'; btn.style.borderColor = V.on && !V.mute ? '#40ff60' : '#8a8a8a'; }
  function place() {
    if (document.body.classList.contains('touch')) return;
    const cb = document.getElementById('chatBtn'), r = cb && !cb.hidden ? cb.getBoundingClientRect() : null;
    const x = r && r.width ? Math.round(r.right + 8) : 16; btn.style.left = x + 'px'; who.style.left = x + 'px';
  }
  btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (!V.on) start(); else if (V.mute) setMute(false); else stop(); };
  addEventListener('keydown', (e) => {
    if (e.code !== 'KeyK' || e.repeat || L.chatOpen || L.uiBlock || !N.connected || L.state !== 'game') return;
    if (!V.on) start(); else stop();
  });
  setInterval(() => { const on = !!(N.connected && L.state === 'game'); if (btn.hidden === on) btn.hidden = !on; if (!on && V.on && !N.connected) stop(true); label(); if (on) place(); }, 500);

  // ---------- μ-law ----------
  function mulawEnc(s) { let x = Math.max(-1, Math.min(1, s)) * 32635; const sign = x < 0 ? 0x80 : 0; if (x < 0) x = -x; x += 132; let exp = 7; for (let m = 0x4000; (x & m) === 0 && exp > 0; m >>= 1) exp--; const man = (x >> (exp + 3)) & 0x0f; return ~(sign | (exp << 4) | man) & 0xff; }
  const DEC = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const u = ~i & 0xff, sign = u & 0x80, exp = (u >> 4) & 7, man = u & 0x0f; let x = ((man << 3) + 132) << exp; x -= 132; DEC[i] = (sign ? -x : x) / 32768; }
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); };
  const unb64 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const ctx = () => { if (L.initAudio) L.initAudio(); const c = L.audio && L.audio.ctx; if (c && c.state === 'suspended') c.resume(); return c; };

  // ---------- Mikrofon → Pakete ----------
  let acc = [], accPos = 0, hang = 0, seq = 0;
  async function start() {
    if (V.on) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { L.msg('🎤 Dein Browser erlaubt hier kein Mikrofon (die Seite braucht https).', 5000); return; }
    const c = ctx(); if (!c) { L.msg('🎤 Kein Ton möglich – tippe einmal ins Spiel und versuch es nochmal.', 4000); return; }
    try { V.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { L.msg('🎤 Kein Mikrofon-Zugriff – bitte im Browser „Zulassen“ drücken (Schloss-Symbol neben der Adresse).', 6000); return; }
    V.src = c.createMediaStreamSource(V.stream);
    V.proc = c.createScriptProcessor(2048, 1, 1);
    V.sink = c.createGain(); V.sink.gain.value = 0;
    V.src.connect(V.proc); V.proc.connect(V.sink); V.sink.connect(c.destination);
    const ratio = c.sampleRate / RATE; acc = []; accPos = 0;
    V.proc.onaudioprocess = (ev) => {
      if (!V.on || V.mute) return;
      const inp = ev.inputBuffer.getChannelData(0);
      // runterrechnen auf 8 kHz (Mittelwert je Schritt)
      let rms = 0;
      for (let i = 0; i < inp.length; i++) rms += inp[i] * inp[i];
      rms = Math.sqrt(rms / inp.length);
      let p = accPos;
      for (; p < inp.length; p += ratio) { const i0 = Math.floor(p), i1 = Math.min(inp.length - 1, Math.floor(p + ratio)); let s = 0, n = 0; for (let i = i0; i <= i1; i++) { s += inp[i]; n++; } acc.push(s / n); }
      accPos = p - inp.length;
      // nur senden, wenn du sprichst (plus kurz danach)
      if (rms > 0.012) hang = 0.5; else hang -= inp.length / c.sampleRate;
      if (acc.length >= 640) {
        const chunk = acc.splice(0, acc.length);
        if (hang > 0) { const u = new Uint8Array(chunk.length); for (let i = 0; i < chunk.length; i++) u[i] = mulawEnc(chunk[i] * 1.6); send({ t: 'vd', d: b64(u), q: seq++ }); }
      }
    };
    V.on = true; V.mute = false; label();
    send({ t: 'von' });
    L.msg('🎙️ Sprachchat an – alle Mitspieler hören dich überall auf der Karte. Tipp: Kopfhörer gegen Echo. Aus: K oder Knopf.', 6000);
  }
  function stop(silent) {
    V.on = false;
    try { if (V.proc) { V.proc.onaudioprocess = null; V.proc.disconnect(); } if (V.src) V.src.disconnect(); if (V.sink) V.sink.disconnect(); } catch (e) { /* egal */ }
    V.proc = V.src = V.sink = null;
    if (V.stream) for (const t of V.stream.getTracks()) t.stop();
    V.stream = null;
    send({ t: 'voff' }); label();
    if (!silent) L.msg('🔇 Sprachchat aus.', 2000);
  }
  function setMute(m) { V.mute = m; label(); }

  // ---------- Pakete → Lautsprecher ----------
  // Jeder hört die anderen, sobald sie reden (auch wenn das eigene Mikrofon aus ist).
  function play(from, d) {
    const c = ctx(); if (!c) return;
    let o = V.out.get(from);
    if (!o) { const gn = c.createGain(); gn.gain.value = 1.4; gn.connect(c.destination); o = { gn, next: 0, lvl: 0, t: 0 }; V.out.set(from, o); }
    const u = unb64(d), UP = 3, n = u.length * UP, buf = c.createBuffer(1, n, RATE * UP), ch = buf.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < u.length; i++) { const a = DEC[u[i]], b = DEC[u[Math.min(u.length - 1, i + 1)]]; for (let k = 0; k < UP; k++) ch[i * UP + k] = a + (b - a) * k / UP; peak = Math.max(peak, Math.abs(a)); }
    const now = c.currentTime;
    if (o.next < now + 0.05 || o.next > now + 0.8) o.next = now + 0.15; // kleiner Puffer gegen Ruckeln, nie zu viel Verzögerung
    const s = c.createBufferSource(); s.buffer = buf; s.connect(o.gn); s.start(o.next); o.next += buf.duration;
    o.lvl = peak; o.t = performance.now();
    if (!V.heard.has(from)) { V.heard.add(from); const r = L.remotes && L.remotes.get(from); if (!V.on) L.msg('🔊 ' + (r ? r.name : 'Ein Mitspieler') + ' spricht – drück K (oder 🎤), um zu antworten.', 5000); }
  }
  L.voiceMsg = function (m, from) {
    if (m.t === 'vd') { if (typeof m.d === 'string' && m.d.length < 20000) play(from, m.d); }
    else if (m.t === 'voff') { const o = V.out.get(from); if (o) { try { o.gn.disconnect(); } catch (e) { /* egal */ } V.out.delete(from); } }
  };
  // Anzeige: wer gerade spricht
  setInterval(() => {
    const rows = [], now = performance.now();
    for (const [pid, o] of V.out) {
      if (now - o.t > 4000) continue;
      const r = L.remotes && L.remotes.get(pid), nm = r ? r.name : 'Spieler ' + (pid + 1);
      rows.push((now - o.t < 400 && o.lvl > 0.03 ? '🔊 ' : '🔈 ') + nm);
    }
    who.textContent = rows.join('   ');
  }, 150);
  L.voiceLeft = (pid) => { const o = V.out.get(pid); if (o) { try { o.gn.disconnect(); } catch (e) { /* egal */ } V.out.delete(pid); } V.heard.delete(pid); };
})();
