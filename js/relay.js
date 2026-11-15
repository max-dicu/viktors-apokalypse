'use strict';
// Ersatzweg für Mehrspieler: Klappt die direkte Verbindung (WebRTC) nicht – z. B. zwischen zwei Handys im WLAN –,
// laufen die Spieldaten über einen öffentlichen Nachrichten-Server (MQTT über WebSocket). Keine Anmeldung nötig.
// Für mp.js sieht so eine Verbindung genauso aus wie eine normale PeerJS-Verbindung (on/send/close/open).
(function () {
  const L = window.L;
  const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
  const topic = (code) => 'vapo-r7q2/' + String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
  let clients = [], hostTimer = null;
  L.relayReady = false;
  function mkConn(sendFn, closeFn) {
    const h = {};
    const emit = (ev, a) => (h[ev] || []).slice().forEach((f) => { try { f(a); } catch (e) { console.error(e); } });
    const c = { open: false, relay: true, last: performance.now(),
      on(ev, cb) { (h[ev] = h[ev] || []).push(cb); return c; },
      send(o) { if (c.open) sendFn(o); },
      close() { if (!c.open) return; c.open = false; try { closeFn && closeFn(); } catch (e) { /* egal */ } emit('close'); },
      _emit: emit };
    return c;
  }
  const parse = (buf) => { try { return JSON.parse(typeof buf === 'string' ? buf : new TextDecoder().decode(buf)); } catch (e) { return null; } };
  L.relayClose = function () {
    for (const cl of clients) { try { cl.end(true); } catch (e) { /* egal */ } }
    clients = []; L.relayReady = false; if (hostTimer) { clearInterval(hostTimer); hostTimer = null; }
  };
  // Host: auf zwei Servern lauschen; jeder neue Mitspieler bekommt eine eigene „Verbindung“
  L.relayHost = function (code, onConn) {
    L.relayClose(); if (typeof mqtt === 'undefined') return;
    const base = topic(code), conns = new Map();
    for (const url of BROKERS.slice(0, 2)) {
      let cl; try { cl = mqtt.connect(url, { connectTimeout: 8000, reconnectPeriod: 4000, clean: true }); } catch (e) { continue; }
      clients.push(cl);
      cl.on('connect', () => { cl.subscribe(base + '/h'); L.relayReady = true; });
      cl.on('message', (tp, buf) => {
        const m = parse(buf); if (!m || !m.id) return;
        let c = conns.get(m.id);
        if (m.k === 'open') {
          cl.publish(base + '/c/' + m.id, JSON.stringify({ __ack: 1 }));
          if (c) return;
          c = mkConn((o) => cl.publish(base + '/c/' + m.id, JSON.stringify(o)), () => cl.publish(base + '/c/' + m.id, JSON.stringify({ __close: 1 })));
          conns.set(m.id, c); onConn(c); c.open = true; c._emit('open'); return;
        }
        if (!c) return;
        c.last = performance.now();
        if (m.k === 'close') { conns.delete(m.id); c.open = false; c._emit('close'); }
        else if (m.k === 'd') c._emit('data', m.d);
      });
    }
    // wer 15 s nichts mehr schickt, ist weg
    hostTimer = setInterval(() => { const now = performance.now(); for (const [id, c] of conns) if (now - c.last > 15000) { conns.delete(id); if (c.open) { c.open = false; c._emit('close'); } } }, 3000);
  };
  // Mitspieler: Server der Reihe nach probieren, auf Bestätigung vom Host warten
  L.relayJoin = function (code, onOpen, onFail) {
    if (typeof mqtt === 'undefined') { onFail && onFail('nolib'); return; }
    const base = topic(code), id = Math.random().toString(36).slice(2, 10); let i = 0, finished = false;
    const tryNext = () => {
      if (finished) return;
      if (i >= 2) { finished = true; onFail && onFail('none'); return; }
      const url = BROKERS[i++]; let cl, acked = false, connected = false;
      try { cl = mqtt.connect(url, { connectTimeout: 7000, reconnectPeriod: 0, clean: true }); } catch (e) { tryNext(); return; }
      clients.push(cl);
      const give = () => { if (acked || finished) return; try { cl.end(true); } catch (e) { /* egal */ } tryNext(); };
      cl.on('connect', () => {
        connected = true;
        cl.subscribe(base + '/c/' + id, () => {
          const c = mkConn((o) => cl.publish(base + '/h', JSON.stringify({ id, k: 'd', d: o })), () => cl.publish(base + '/h', JSON.stringify({ id, k: 'close' })));
          cl.on('message', (tp, buf) => {
            const m = parse(buf); if (!m) return;
            if (m.__ack) { if (!acked) { acked = true; finished = true; c.open = true; const hb = setInterval(() => { if (!c.open) { clearInterval(hb); return; } cl.publish(base + '/h', JSON.stringify({ id, k: 'ping' })); }, 3000); onOpen(c); } return; }
            if (m.__close) { c.open = false; c._emit('close'); return; }
            c._emit('data', m);
          });
          cl.publish(base + '/h', JSON.stringify({ id, k: 'open' }));
          setTimeout(() => { if (!acked) give(); }, 6000); // kein Host auf diesem Server
        });
      });
      cl.on('error', () => { if (!connected) give(); });
      setTimeout(() => { if (!connected) give(); }, 7500);
    };
    tryNext();
  };
})();
