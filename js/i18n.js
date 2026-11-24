'use strict';
// Sprache (Deutsch / English / Română) bei jedem Start wählen, danach Intro „Maxi D. Studio Presents“ und dann das Menü.
// Boss- und Monsternamen bleiben gleich.
(function () {
  const L = window.L;
  const D = {
    'Ein Schleich-Horrorspiel': ['A stealth horror game', 'Un joc horror de furișare'], 'Die Nacht der Stelzer': ['The Night of the Stilters', 'Noaptea Picioroangelor'],
    'Viktor und Daniel hören jedes Geräusch. Über ihnen staksen die Stelzer. Und alle 10 Minuten erhebt sich MAMA IVA.': ['Viktor and Daniel hear every sound. Above them stalk the Stilters. And every 10 minutes MAMA IVA rises.', 'Viktor și Daniel aud orice sunet. Deasupra lor pășesc Picioroangele. Și la fiecare 10 minute se ridică MAMA IVA.'],
    'Spielen': ['Play', 'Joacă'], 'Charakter': ['Character', 'Personaj'], 'Versteck': ['Hideout', 'Ascunzătoare'], 'Einstellungen': ['Settings', 'Setări'], 'Mit Freund spielen': ['Play with friends', 'Joacă cu prietenii'], 'Anleitung': ['How to play', 'Instrucțiuni'],
    'Dein Charakter': ['Your character', 'Personajul tău'], '🎲 Zufällig': ['🎲 Random', '🎲 Aleatoriu'], 'Speichern': ['Save', 'Salvează'], 'Zurück': ['Back', 'Înapoi'], 'Dein Versteck': ['Your hideout', 'Ascunzătoarea ta'], 'Losgehen': ['Go', 'Pornește'], 'Fertig': ['Done', 'Gata'],
    'Raum erstellen': ['Create room', 'Creează cameră'], '– oder –': ['– or –', '– sau –'], 'Beitreten': ['Join', 'Intră'], 'Runde starten': ['Start round', 'Începe runda'], 'Verbindung trennen': ['Disconnect', 'Deconectează'],
    'Steuerung': ['Controls', 'Control'], 'Inventar': ['Inventory', 'Inventar'], 'Tab schließen': ['Tab to close', 'Tab închide'], 'Ausrüstung': ['Equipment', 'Echipament'], '🔒 Tresor-Platz': ['🔒 Safe slot', '🔒 Loc în seif'], 'bleibt auch, wenn du stirbst': ['stays even if you die', 'rămâne chiar dacă mori'],
    '🎒 Rucksack': ['🎒 Backpack', '🎒 Rucsac'], 'Karte': ['Map', 'Hartă'], 'Klick/Tippen = Wegpunkt setzen (nochmal = entfernen) · M schließen': ['Click/tap = set waypoint (again = remove) · M to close', 'Click/atinge = punct de traseu (din nou = șterge) · M închide'],
    'Weiter (E)': ['Continue (E)', 'Continuă (E)'], 'Weiter': ['Continue', 'Continuă'], 'Pause': ['Pause', 'Pauză'], '🌈 Zurück beamen': ['🌈 Beam back', '🌈 Teleportează înapoi'], 'Runde aufgeben': ['Give up round', 'Renunță la rundă'],
    'Aufgeben zählt wie Sterben: Deine Sachen sind weg, nur der Tresor-Platz bleibt.': ['Giving up counts as dying: your items are gone, only the safe slot stays.', 'Renunțarea contează ca moarte: lucrurile tale dispar, doar locul din seif rămâne.'],
    'Die Welt wird gebaut ...': ['Building the world ...', 'Se construiește lumea ...'], 'Leise sein': ['Stay quiet', 'Fii silențios'], 'Fliehen': ['Escape', 'Evadează'], 'Stelzer': ['Stilters', 'Picioroange'],
    'laufen ·': ['walk ·', 'mergi ·'], 'umsehen ·': ['look around ·', 'privește ·'], 'rennen': ['run', 'aleargă'], 'schleichen ·': ['sneak ·', 'furișează-te ·'], 'kriechen ·': ['crawl ·', 'târăște-te ·'], 'springen': ['jump', 'sari'],
    'Linksklick': ['Left click', 'Click stânga'], 'Rechtsklick': ['Right click', 'Click dreapta'], 'zielen ·': ['aim ·', 'țintește ·'], 'nachladen ·': ['reload ·', 'reîncarcă ·'], 'Granate werfen': ['throw grenade', 'aruncă grenada'], 'Leertaste': ['Space', 'Spațiu'], 'Maus': ['Mouse', 'Mouse'], 'Mausrad': ['Mouse wheel', 'Rotița'],
    'benutzen (Hammer, Schießen, Werfen, Essen)': ['use (hammer, shoot, throw, eat)', 'folosește (ciocan, trage, aruncă, mănâncă)'], 'Verband benutzen': ['use bandage', 'folosește bandaj'], 'aufheben / benutzen / einsteigen ·': ['pick up / use / get in ·', 'ridică / folosește / urcă ·'], 'ein- und aussteigen': ['get in and out', 'urcă și coboară'],
    'Taschenlampe': ['Flashlight', 'Lanternă'], 'Viktor und Daniel sind blind, hören aber gut.': ['Viktor and Daniel are blind, but hear well.', 'Viktor și Daniel sunt orbi, dar aud bine.'], 'Kriechen und Schleichen hören sie nicht.': ["They can't hear crawling and sneaking.", 'Nu aud târâtul și furișatul.'],
    'Code, z. B. WOLF-42': ['Code, e.g. WOLF-42', 'Cod, ex. WOLF-42'], 'Nachricht … (Enter senden, Esc abbrechen)': ['Message … (Enter send, Esc cancel)', 'Mesaj … (Enter trimite, Esc anulează)'], '🚶 Gehen': ['🚶 Walk', '🚶 Mers'], 'leise': ['quiet', 'liniștit'], 'ZUM TURM': ['TO THE TOWER', 'SPRE TURN'], 'WEGPUNKT': ['WAYPOINT', 'PUNCT']
  };
  // häufige Meldungen im Spiel (Teil-Übersetzung)
  const MSG = [[/Willkommen/g, ['Welcome', 'Bun venit']], [/Sekunden Schutz nach dem Start/g, ['seconds of protection after start', 'secunde de protecție după start']], [/Münzen/g, ['coins', 'monede']], [/Neue Runde/g, ['New round', 'Rundă nouă']]];
  let lang = 'de';
  L.lang = () => lang;
  const tr = (t) => { const k = t.trim(); const e = D[k]; return e ? t.replace(k, e[lang === 'en' ? 0 : 1]) : t; };
  function translateDom(root) {
    if (lang === 'de') return;
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (n.parentElement && /SCRIPT|STYLE/.test(n.parentElement.tagName)) continue; const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    for (const el of (root || document.body).querySelectorAll('[title],[placeholder]')) { for (const a of ['title', 'placeholder']) { const v = el.getAttribute(a); if (v) { const t2 = tr(v); if (t2 !== v) el.setAttribute(a, t2); } } }
  }
  const wrapTxt = (s) => { if (lang === 'de' || typeof s !== 'string') return s; let o = s; for (const [re, v] of MSG) o = o.replace(re, v[lang === 'en' ? 0 : 1]); return tr(o); };
  const om = L.msg, ob = L.banner;
  setTimeout(() => { const om2 = L.msg, ob2 = L.banner; L.msg = (t, ms) => om2(wrapTxt(t), ms); L.banner = (a, b) => ob2(wrapTxt(a), wrapTxt(b)); }, 0);
  void om; void ob;
  // ---------- Sprachwahl + Intro ----------
  const css = document.createElement('style');
  css.textContent = `#langPick,#introV{position:fixed;inset:0;z-index:200;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif}
  #langPick h1{font:900 clamp(22px,5vw,40px) Arial;margin:0 0 24px;letter-spacing:2px}#langPick button{font:800 22px Arial;width:min(320px,80vw);padding:14px;margin:8px;border-radius:14px;border:2px solid #e8c040;background:#15131c;color:#fff;cursor:pointer}
  #langPick button:hover{background:#2a2410}#introV .a{font:600 clamp(16px,3vw,26px) Georgia,serif;letter-spacing:8px;opacity:0;transition:opacity 1.2s;color:#d8d0b8}
  #introV .b{font:900 clamp(34px,8vw,92px) Impact,'Arial Black',sans-serif;letter-spacing:4px;opacity:0;transform:scale(1.25);transition:opacity 1.2s,transform 3s ease-out;text-align:center;color:#e8e2cc;text-shadow:0 0 30px rgba(200,40,40,.6)}
  #introV .c{font:italic 700 clamp(14px,3vw,26px) Georgia,serif;letter-spacing:5px;opacity:0;transition:opacity 1.4s;color:#c8a0ff;margin-top:8px}#introV small{position:absolute;bottom:16px;opacity:.5;font-size:12px}`;
  document.head.appendChild(css);
  function sound() {
    try {
      L.initAudio && L.initAudio(); const A = L.audio && L.audio.ctx; if (!A) return; const t = A.currentTime;
      // tiefer Kino-Gong mit aufsteigendem Akkord
      [55, 82.4, 110, 164.8, 220].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.type = i < 2 ? 'sawtooth' : 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 3.5); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 5); o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + 5.2); });
      const n = A.createBufferSource(), b = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const nf = A.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 400; const ng = A.createGain(); ng.gain.value = 0.5; n.buffer = b; n.connect(nf); nf.connect(ng); ng.connect(A.destination); n.start(t + 2.6);
    } catch (e) { /* ohne Ton */ }
  }
  function intro(done) {
    const v = document.createElement('div'); v.id = 'introV';
    v.innerHTML = '<div class="a">MAXI D. STUDIO PRESENTS</div><div class="b" style="margin-top:28px">VIKTORS APOKALYPSE</div><div class="c">in the Sina Sina Multiverse</div><small>tap to skip</small>';
    document.body.appendChild(v); sound();
    const [a, b, c] = v.children; let fin = false;
    const end = () => { if (fin) return; fin = true; v.style.transition = 'opacity .8s'; v.style.opacity = '0'; setTimeout(() => { v.remove(); done(); }, 800); };
    setTimeout(() => { a.style.opacity = '1'; }, 200); setTimeout(() => { a.style.opacity = '0'; }, 2400);
    setTimeout(() => { b.style.opacity = '1'; b.style.transform = 'scale(1)'; }, 3000); setTimeout(() => { c.style.opacity = '1'; }, 3900); setTimeout(end, 7400);
    v.addEventListener('pointerdown', end);
  }
  function pick() {
    const p = document.createElement('div'); p.id = 'langPick';
    p.innerHTML = '<h1>🌍 Sprache · Language · Limbă</h1><button data-l="de">🇩🇪 Deutsch</button><button data-l="en">🇬🇧 English</button><button data-l="ro">🇷🇴 Română</button>';
    document.body.appendChild(p);
    p.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; lang = b.dataset.l; document.documentElement.lang = lang; try { localStorage.setItem('leise.lang', lang); } catch (x) { /* egal */ } p.remove(); translateDom(); intro(() => {}); });
  }
  L.translateDom = translateDom;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', pick); else pick();
  setInterval(() => { if (lang !== 'de') translateDom(); }, 1500);
})();
