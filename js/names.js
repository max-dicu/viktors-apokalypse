'use strict';
// Namen ändern: Monster, Bosse und Endbosse (keine Spieler-Skins) gegen Münzen umbenennen – mit Profilbild.
(function () {
  const L = window.L, T = THREE;
  const MON = [
    ['viktor', 'Viktor', '🧟'], ['daniel', 'Daniel', '👮'], ['rollerviktor', 'Roller-Viktor', '🛴'], ['capydaniel', 'Capybara-Daniel', '🦫'], ['langer', 'Gesichtslose', '👤'],
    ['rufer', 'Rufer', '📣'], ['blockling', 'Blockling', '🧱'], ['schwelle', 'Schwellengänger', '🚪'], ['greifer', 'Greifer', '🦾'], ['marsianer', 'Marsianer', '👽'],
    ['starrende', 'Starrende', '👁️'], ['walross', 'Walross', '🦭'], ['flieger', 'Flugmaschine', '🛸']
  ].map(([k, n, e]) => ({ k, n, e, cat: 'Monster', price: Math.round((200 + ((L.MK && L.MK[k] && L.MK[k].hp) || 150)) / 50) * 50, build: () => L.MK[k].build() }));
  const BOS = [
    ['BIG MAMA', '👹', 3000], ['RIESEN-WALROSS', '🦭', 2000, () => L.buildWalross()], ['RIESEN-VIKTOR', '🧟', 2000, () => L.buildViktor()], ['GIGA-CAPY', '🦫', 2200, () => L.buildGigaCapy()],
    ['URZEIT-ECHSE', '🦖', 2600, () => L.buildEchse()], ['CAROLINA', '🖤', 1800], ['RUSLAN', '🛡️', 2200], ['THOR', '⚡', 1800], ['ODIN', '🔱', 1800], ['LOKI', '🐍', 1600],
    ['YMIR', '❄️', 1800], ['LAVATITAN', '🌋', 2000], ['GEISTERKÖNIGIN', '👻', 1800], ['SANDWURM', '🪱', 1800], ['URWALDWÄCHTER', '🌳', 1800], ['SPORENKÖNIG', '🍄', 1600],
    ['KRISTALLGOLEM', '💎', 2000], ['NINA', '🧹', 1500]
  ].map(([n, e, price, build]) => ({ k: n, n, e, cat: 'Bosse', price, build }));
  const END = [['BERNHARD', '😈', 9000], ['OMNITRON', '♾️', 12000], ['THANATOS', '🟣', 8000], ['LEERENWURM', '🪱', 7000], ['WAHRE CAROLINA', '🖤', 6000]]
    .map(([n, e, price]) => ({ k: n, n, e, cat: 'Endbosse', price }));
  const ALL = MON.concat(BOS, END);
  const names = () => { L.save.names = L.save.names || {}; return L.save.names; };
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let rules = [];
  function rebuild() {
    const N = names(); rules = ALL.filter((a) => N[a.k]).sort((a, b) => b.n.length - a.n.length).map((a) => ({ re: new RegExp(esc(a.n), 'gi'), to: N[a.k] }));
  }
  function apply(s) {
    if (!rules.length || typeof s !== 'string' || !s) return s;
    let o = s; for (const r of rules) o = o.replace(r.re, (m) => (m.length > 1 && m === m.toUpperCase() && /[A-ZÄÖÜ]/.test(m) ? r.to.toUpperCase() : r.to)); return o;
  }
  L.applyNames = apply;
  // Meldungen und Banner (vor der Übersetzung)
  setTimeout(() => { rebuild(); const om = L.msg, ob = L.banner; L.msg = (t, ms) => om(apply(t), ms); L.banner = (a, b) => ob(apply(a), apply(b)); }, 300);
  // HUD-Texte direkt beim Ändern umschreiben
  let busy = false;
  const mo = new MutationObserver((list) => {
    if (busy || !rules.length) return; busy = true;
    try { for (const m of list) { const nodes = m.type === 'characterData' ? [m.target] : Array.from(m.addedNodes); for (const n of nodes) fixNode(n); } } finally { busy = false; }
  });
  function fixNode(n) {
    if (!n) return; if (n.nodeType === 3) { const p = n.parentElement; if (!p || p.closest('#namesScr,script,style,input,textarea')) return; const v = apply(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; return; }
    if (n.nodeType === 1 && !n.closest('#namesScr')) { const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let x; while ((x = w.nextNode())) fixNode(x); }
  }
  addEventListener('DOMContentLoaded', () => mo.observe(document.body, { subtree: true, childList: true, characterData: true }));
  // ---------- Profilbilder ----------
  const pics = {}; let rr = null;
  function emojiPic(a) {
    const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
    const gr = g.createRadialGradient(48, 40, 6, 48, 48, 48); gr.addColorStop(0, a.cat === 'Endbosse' ? '#6a2050' : a.cat === 'Bosse' ? '#5a3a10' : '#20405a'); gr.addColorStop(1, '#0c0c12'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
    g.font = '54px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a.e, 48, 52); return c.toDataURL();
  }
  function rigPic(a) {
    try {
      if (!rr) { rr = { r: new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }), s: new T.Scene(), cam: new T.PerspectiveCamera(30, 1, 0.05, 5000) }; rr.r.setSize(96, 96); rr.s.add(new T.HemisphereLight(0xffffff, 0x404050, 1)); const dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(2, 3, 4); rr.s.add(dl); }
      const b = a.build(); const o = b && (b.root || b.g || b); if (!o || !o.isObject3D) return null;
      if (o.parent) o.parent.remove(o); rr.s.add(o); o.position.set(0, 0, 0); o.rotation.set(0, 0.5, 0); o.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(o), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3()), h = Math.max(sz.x, sz.y, sz.z) || 2;
      const top = new T.Vector3(c.x, bb.max.y - sz.y * 0.22, c.z);
      rr.cam.position.set(top.x, top.y + h * 0.05, top.z + h * 1.1); rr.cam.lookAt(top); rr.cam.near = h * 0.02; rr.cam.far = h * 10; rr.cam.updateProjectionMatrix();
      rr.r.setClearColor(a.cat === 'Bosse' ? 0x3a2a10 : 0x18283a, 1); rr.r.render(rr.s, rr.cam); const url = rr.r.domElement.toDataURL(); rr.s.remove(o); return url;
    } catch (e) { return null; }
  }
  const picOf = (a) => pics[a.k] || (pics[a.k] = (a.build && rigPic(a)) || emojiPic(a));
  // ---------- Menü ----------
  const css = document.createElement('style');
  css.textContent = `#namesScr{position:fixed;inset:0;z-index:120;background:rgba(8,8,14,.96);color:#fff;font-family:Arial,sans-serif;overflow:auto;padding:16px}
  #namesScr h2{margin:6px 0 4px;font-size:22px}#namesScr h3{margin:18px 0 8px;color:#e8c040;font-size:17px}#namesScr .row{display:flex;align-items:center;gap:10px;background:#16151f;border:1px solid #2c2a3a;border-radius:12px;padding:8px;margin:6px 0;flex-wrap:wrap}
  #namesScr img{width:56px;height:56px;border-radius:50%;border:2px solid #e8c040;flex:none;object-fit:cover}#namesScr .nm{flex:1;min-width:140px}#namesScr .nm b{display:block;font-size:16px}#namesScr .nm small{opacity:.6}
  #namesScr input{width:150px;padding:7px;border-radius:8px;border:1px solid #555;background:#0e0e14;color:#fff}#namesScr button{padding:7px 10px;border-radius:8px;border:0;background:#e8c040;font-weight:800;cursor:pointer}#namesScr button.g{background:#444;color:#fff}
  #namesScr .top{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-16px;background:rgba(8,8,14,.98);padding:6px 0;z-index:2}`;
  document.head.appendChild(css);
  function open() {
    let d = document.getElementById('namesScr'); if (d) d.remove();
    d = document.createElement('div'); d.id = 'namesScr'; document.body.appendChild(d);
    const N = names();
    let h = '<div class="top"><h2>✏️ Namen ändern</h2><div>🪙 <b id="nmCoins">' + Math.floor(L.save.coins || 0) + '</b> &nbsp;<button class="g" id="nmBack">Zurück</button></div></div><div style="opacity:.7;font-size:13px">Gib Monstern und Bossen eigene Namen. Stärkere Gegner kosten mehr. Skins von Spielern kann man nicht umbenennen.</div>';
    for (const cat of ['Monster', 'Bosse', 'Endbosse']) {
      h += '<h3>' + (cat === 'Monster' ? '👾 Monster' : cat === 'Bosse' ? '👹 Bosse' : '💀 Endbosse') + '</h3>';
      ALL.filter((a) => a.cat === cat).forEach((a) => { const i = ALL.indexOf(a); h += '<div class="row"><img data-i="' + i + '" alt=""><div class="nm"><b>' + (N[a.k] ? N[a.k].replace(/</g, '') : a.n) + '</b><small>' + (N[a.k] ? 'eigentlich: ' + a.n : 'Originalname') + '</small></div><input maxlength="22" placeholder="Neuer Name" data-i="' + i + '"><button data-buy="' + i + '">Ändern · ' + a.price + ' 🪙</button>' + (N[a.k] ? '<button class="g" data-rs="' + i + '">↺</button>' : '') + '</div>'; });
    }
    d.innerHTML = h;
    d.querySelector('#nmBack').onclick = () => d.remove();
    d.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.buy) { const a = ALL[+b.dataset.buy], inp = d.querySelector('input[data-i="' + b.dataset.buy + '"]'), v = (inp.value || '').replace(/[<>]/g, '').trim();
        if (!v) { inp.focus(); return; } if ((L.save.coins || 0) < a.price) { alert('Nicht genug Münzen – du brauchst ' + a.price + ' 🪙.'); return; }
        L.save.coins -= a.price; names()[a.k] = v; L.persist && L.persist(); rebuild(); open(); }
      if (b.dataset.rs) { delete names()[ALL[+b.dataset.rs].k]; L.persist && L.persist(); rebuild(); open(); }
    });
    // Bilder nach und nach (blockiert das Menü nicht)
    const imgs = Array.from(d.querySelectorAll('img[data-i]')); let k = 0;
    const next = () => { if (k >= imgs.length || !document.body.contains(d)) return; const im = imgs[k++]; im.src = picOf(ALL[+im.dataset.i]); setTimeout(next, 10); }; next();
  }
  L.openNames = open;
  function addBtn() {
    const c = document.getElementById('btnChar'); if (!c || document.getElementById('btnNames')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'btnNames'; b.textContent = '✏️ Namen ändern'; b.onclick = open; c.after(b);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', addBtn); else addBtn();
})();
