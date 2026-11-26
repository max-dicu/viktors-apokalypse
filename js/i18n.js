'use strict';
// Sprache (Deutsch / English / Română) bei jedem Start wählen, danach Intro „Maxi D. Studio Presents“ und dann das Menü.
// Boss- und Monsternamen bleiben gleich.
(function () {
  const L = window.L;
  const D = {
    'Ein Schleich-Horrorspiel': ['A stealth horror game', 'Un joc horror de furișare'], 'Die Nacht der Stelzer': ['The Night of the Stilters', 'Noaptea Picioroangelor'],
    'Viktor und Daniel hören jedes Geräusch. Über ihnen staksen die Stelzer. Und alle 10 Minuten erhebt sich BIG MAMA.': ['Viktor and Daniel hear every sound. Above them stalk the Stilters. And every 10 minutes BIG MAMA rises.', 'Viktor și Daniel aud orice sunet. Deasupra lor pășesc Picioroangele. Și la fiecare 10 minute se ridică BIG MAMA.'],
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
  { const X = [["Хорър игра с промъкване","Gizlilik korku oyunu"],["Нощта на кокилоходците","Stilter'ların Gecesi"],["Виктор и Даниел чуват всеки звук. Над тях крачат кокилоходците. А на всеки 10 минути се надига BIG MAMA.","Viktor ve Daniel her sesi duyar. Üstlerinde Stilter'lar dolaşır. Ve her 10 dakikada bir BIG MAMA yükselir."],["Играй","Oyna"],["Герой","Karakter"],["Скривалище","Saklanma yeri"],["Настройки","Ayarlar"],["Играй с приятели","Arkadaşlarla oyna"],["Как се играе","Nasıl oynanır"],["Твоят герой","Karakterin"],["🎲 Случаен","🎲 Rastgele"],["Запази","Kaydet"],["Назад","Geri"],["Твоето скривалище","Saklanma yerin"],["Тръгвай","Başla"],["Готово","Tamam"],["Създай стая","Oda oluştur"],["– или –","– veya –"],["Влез","Katıl"],["Започни рунд","Turu başlat"],["Прекъсни връзката","Bağlantıyı kes"],["Управление","Kontroller"],["Инвентар","Envanter"],["Tab затваря","Tab ile kapat"],["Екипировка","Ekipman"],["🔒 Място в сейфа","🔒 Kasa yuvası"],["остава, дори ако умреш","ölsen bile kalır"],["🎒 Раница","🎒 Sırt çantası"],["Карта","Harita"],["Клик/докосване = точка (пак = премахни) · M затваря","Tıkla/dokun = yol noktası (tekrar = kaldır) · M ile kapat"],["Продължи (E)","Devam (E)"],["Продължи","Devam"],["Пауза","Duraklat"],["🌈 Телепортирай обратно","🌈 Geri ışınlan"],["Откажи се от рунда","Turdan vazgeç"],["Отказът е като смърт: нещата ти изчезват, остава само мястото в сейфа.","Vazgeçmek ölmek sayılır: eşyaların gider, sadece kasa yuvası kalır."],["Светът се строи ...","Dünya inşa ediliyor ..."],["Пази тишина","Sessiz ol"],["Избягай","Kaç"],["Кокилоходци","Stilter'lar"],["ходене ·","yürü ·"],["оглеждане ·","etrafa bak ·"],["тичане","koş"],["промъкване ·","gizlice ilerle ·"],["пълзене ·","sürün ·"],["скок","zıpla"],["Ляв клик","Sol tık"],["Десен клик","Sağ tık"],["прицелване ·","nişan al ·"],["презареждане ·","yeniden doldur ·"],["хвърли граната","el bombası at"],["Интервал","Boşluk"],["Мишка","Fare"],["Колелце","Fare tekerleği"],["използвай (чук, стрелба, хвърляне, ядене)","kullan (çekiç, ateş, fırlat, ye)"],["използвай превръзка","bandaj kullan"],["вземи / използвай / качи се ·","al / kullan / bin ·"],["качване и слизане","bin ve in"],["Фенерче","El feneri"],["Виктор и Даниел са слепи, но чуват добре.","Viktor ve Daniel kör, ama iyi duyarlar."],["Не чуват пълзене и промъкване.","Sürünmeyi ve gizlice ilerlemeyi duyamazlar."],["Код, напр. WOLF-42","Kod, örn. WOLF-42"],["Съобщение … (Enter изпраща, Esc отказ)","Mesaj … (Enter gönder, Esc iptal)"],["🚶 Ходене","🚶 Yürü"],["тихо","sessiz"],["КЪМ КУЛАТА","KULEYE"],["ТОЧКА","YOL NOKTASI"]]; Object.keys(D).forEach((k, i) => D[k].push(X[i][0], X[i][1])); }
  { const XR = ["Хоррор-игра про скрытность","Ночь Ходулочников","Виктор и Даниэль слышат каждый звук. Над ними шагают Ходулочники. А каждые 10 минут поднимается BIG MAMA.","Играть","Персонаж","Убежище","Настройки","Играть с друзьями","Как играть","Твой персонаж","🎲 Случайно","Сохранить","Назад","Твоё убежище","Вперёд","Готово","Создать комнату","– или –","Войти","Начать раунд","Отключиться","Управление","Инвентарь","Tab – закрыть","Снаряжение","🔒 Ячейка сейфа","остаётся, даже если ты погибнешь","🎒 Рюкзак","Карта","Клик/касание = точка маршрута (ещё раз = убрать) · M – закрыть","Дальше (E)","Дальше","Пауза","🌈 Перенестись назад","Сдаться","Сдаться = погибнуть: вещи пропадут, останется только ячейка сейфа.","Мир строится ...","Не шуми","Сбежать","Ходулочники","идти ·","осмотреться ·","бежать","красться ·","ползти ·","прыгать","Левый клик","Правый клик","прицелиться ·","перезарядить ·","бросить гранату","Пробел","Мышь","Колесо мыши","использовать (молоток, выстрел, бросок, еда)","использовать бинт","поднять / использовать / сесть ·","сесть и выйти","Фонарик","Виктор и Даниэль слепые, но хорошо слышат.","Ползание и крадущиеся шаги они не слышат.","Код, напр. WOLF-42","Сообщение … (Enter – отправить, Esc – отмена)","🚶 Идти","тихо","К БАШНЕ","ТОЧКА"]; Object.keys(D).forEach((k, i) => D[k].push(XR[i])); }
  // häufige Meldungen im Spiel (Teil-Übersetzung)
  const MSG = [[/Willkommen/g, ['Welcome', 'Bun venit', 'Добре дошъл', 'Hoş geldin', 'Добро пожаловать']], [/Sekunden Schutz nach dem Start/g, ['seconds of protection after start', 'secunde de protecție după start', 'секунди защита след старта', 'saniye başlangıç koruması', 'секунд защиты после старта']], [/Münzen/g, ['coins', 'monede', 'монети', 'jeton', 'монет']], [/Neue Runde/g, ['New round', 'Rundă nouă', 'Нов рунд', 'Yeni tur', 'Новый раунд']]];
  let lang = 'de'; const LI = { en: 0, ro: 1, bg: 2, tr: 3, ru: 4 };
  L.lang = () => lang;
  const tr = (t) => { const k = t.trim(); const e = D[k]; return e ? t.replace(k, e[LI[lang] || 0]) : t; };
  function translateDom(root) {
    if (lang === 'de') return;
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (n.parentElement && /SCRIPT|STYLE/.test(n.parentElement.tagName)) continue; const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    for (const el of (root || document.body).querySelectorAll('[title],[placeholder]')) { for (const a of ['title', 'placeholder']) { const v = el.getAttribute(a); if (v) { const t2 = tr(v); if (t2 !== v) el.setAttribute(a, t2); } } }
  }
  const wrapTxt = (s) => { if (lang === 'de' || typeof s !== 'string') return s; let o = s; for (const [re, v] of MSG) o = o.replace(re, v[LI[lang] || 0]); return tr(o); };
  const om = L.msg, ob = L.banner;
  setTimeout(() => { const om2 = L.msg, ob2 = L.banner; L.msg = (t, ms) => om2(wrapTxt(t), ms); L.banner = (a, b) => ob2(wrapTxt(a), wrapTxt(b)); }, 0);
  void om; void ob;
  // ---------- Sprachwahl + Intro ----------
  const css = document.createElement('style');
  css.textContent = `#langPick,#introV{position:fixed;inset:0;z-index:200;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Arial,sans-serif}
  #langPick h1{font:900 clamp(22px,5vw,40px) Arial;margin:0 0 24px;letter-spacing:2px}#langPick button{font:800 22px Arial;width:min(320px,80vw);padding:14px;margin:8px;border-radius:14px;border:2px solid #e8c040;background:#15131c;color:#fff;cursor:pointer}
  #langPick button:hover{background:#2a2410}#introV .a{font:600 clamp(16px,3vw,26px) Georgia,serif;letter-spacing:8px;opacity:0;transition:opacity 1.2s;color:#d8d0b8}
  #introV .b{font:900 clamp(34px,8vw,92px) Impact,'Arial Black',sans-serif;letter-spacing:4px;opacity:0;transform:scale(1.25);transition:opacity 1.6s,transform 5s ease-out;text-align:center;color:#e8e2cc;text-shadow:0 0 30px rgba(200,40,40,.6)}
  #introV .c{font:italic 700 clamp(14px,3vw,26px) Georgia,serif;letter-spacing:5px;opacity:0;transition:opacity 1.4s;color:#c8a0ff;margin-top:8px}#introV small{position:absolute;bottom:16px;opacity:.5;font-size:12px}`;
  document.head.appendChild(css);
  function sound() {
    // Trailer-Musik: dunkles Ostinato, Pauken, Riser, BRAAM beim Titel, Schlussschlag
    try {
      L.initAudio && L.initAudio(); const A = L.audio && L.audio.ctx; if (!A) return; const t0 = A.currentTime + 0.05;
      const out = A.createGain(); out.gain.value = 0.9; const comp = A.createDynamicsCompressor(); out.connect(comp); comp.connect(A.destination);
      const rv = A.createConvolver(), ir = A.createBuffer(2, A.sampleRate * 2.5, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5); } rv.buffer = ir; const rg = A.createGain(); rg.gain.value = 0.35; rv.connect(rg); rg.connect(out);
      const note = (f, s, d, v, type, cut, rev) => { const o = A.createOscillator(), g = A.createGain(), fl = A.createBiquadFilter(); o.type = type || 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut || 900; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + d); o.connect(fl); fl.connect(g); g.connect(out); if (rev) g.connect(rv); o.start(s); o.stop(s + d + 0.05); return fl; };
      const noiseBuf = A.createBuffer(1, A.sampleRate * 3, A.sampleRate), nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const drum = (s, v) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, s); o.frequency.exponentialRampToValueAtTime(38, s + 0.35); g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.9); o.connect(g); g.connect(out); g.connect(rv); o.start(s); o.stop(s + 1);
        const n = A.createBufferSource(), nf = A.createBiquadFilter(), ng = A.createGain(); n.buffer = noiseBuf; nf.type = 'lowpass'; nf.frequency.value = 700; ng.gain.setValueAtTime(v * 0.6, s); ng.gain.exponentialRampToValueAtTime(0.0001, s + 0.25); n.connect(nf); nf.connect(ng); ng.connect(out); n.start(s, Math.random()); n.stop(s + 0.3); };
      // Ostinato in d-Moll (Sechzehntel), wird lauter
      const pat = [73.4, 73.4, 87.3, 73.4, 82.4, 73.4, 65.4, 73.4], sb = 0.13;
      for (let k = 0; k < 82; k++) { const s = t0 + 0.4 + k * sb; if (s > t0 + 10.9) break; const up = s > t0 + 5 ? 1 : (s - t0) / 5; note(pat[k % 8] * (k % 16 > 11 ? 1.189 : 1), s, 0.12, 0.05 + 0.08 * up, 'sawtooth', 500 + up * 1400); if (s > t0 + 5) note(pat[k % 8] * 2, s, 0.1, 0.035, 'square', 1800); }
      // Pauken
      [0.4, 1.44, 2.48, 3.0, 3.52, 4.04, 4.3, 4.56, 4.82].forEach((x, i) => drum(t0 + x, 0.35 + i * 0.05));
      for (let k = 0; k < 12; k++) drum(t0 + 5.6 + k * 0.52, k % 4 === 0 ? 0.8 : 0.45);
      // Riser vor dem Titel
      const rs = A.createBufferSource(), rf = A.createBiquadFilter(), rgn = A.createGain(); rs.buffer = noiseBuf; rf.type = 'bandpass'; rf.Q.value = 3; rf.frequency.setValueAtTime(300, t0 + 2.8); rf.frequency.exponentialRampToValueAtTime(6000, t0 + 5); rgn.gain.setValueAtTime(0.0001, t0 + 2.8); rgn.gain.exponentialRampToValueAtTime(0.35, t0 + 4.95); rgn.gain.exponentialRampToValueAtTime(0.0001, t0 + 5.05); rs.connect(rf); rf.connect(rgn); rgn.connect(out); rs.start(t0 + 2.8); rs.stop(t0 + 5.1);
      // BRAAM beim Titel + Schlussschlag
      const braam = (s, d, v) => { [36.7, 55, 73.4, 87.3, 110].forEach((f, i) => { const fl = note(f, s, d, v / (1 + i * 0.4), 'sawtooth', 200, true); fl.frequency.setValueAtTime(200, s); fl.frequency.exponentialRampToValueAtTime(2200, s + 0.25); fl.frequency.exponentialRampToValueAtTime(300, s + d); }); drum(s, 1); };
      braam(t0 + 5, 3.5, 0.3); braam(t0 + 9.8, 2.2, 0.32);
      // hohe Streicher-Fläche über dem Titel
      [293.7, 349.2, 440].forEach((f) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + 5.2); g.gain.exponentialRampToValueAtTime(0.03, t0 + 6.5); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 11.5); o.connect(g); g.connect(out); g.connect(rv); o.start(t0 + 5.2); o.stop(t0 + 11.6); });
    } catch (e) { /* ohne Ton */ }
  }
  function intro(done) {
    const v = document.createElement('div'); v.id = 'introV';
    v.innerHTML = '<div class="a">MAXI D. STUDIO PRESENTS</div><div class="b" style="margin-top:28px">VIKTORS APOKALYPSE</div><div class="c">in the Sina Sina Multiverse</div><small>tap to skip</small>';
    document.body.appendChild(v); sound();
    const [a, b, c] = v.children; let fin = false;
    const end = () => { if (fin) return; fin = true; v.style.transition = 'opacity .8s'; v.style.opacity = '0'; setTimeout(() => { v.remove(); done(); }, 800); };
    setTimeout(() => { a.style.opacity = '1'; }, 300); setTimeout(() => { a.style.opacity = '0'; }, 4200);
    setTimeout(() => { b.style.opacity = '1'; b.style.transform = 'scale(1)'; }, 5000); setTimeout(() => { c.style.opacity = '1'; }, 6600); setTimeout(end, 11500);
    v.addEventListener('pointerdown', end);
  }
  function pick() {
    const p = document.createElement('div'); p.id = 'langPick';
    p.innerHTML = '<h1>🌍 Sprache · Language · Limbă · Език · Dil · Язык</h1><button data-l="de">🇩🇪 Deutsch</button><button data-l="en">🇬🇧 English</button><button data-l="ro">🇷🇴 Română</button><button data-l="bg">🇧🇬 Български</button><button data-l="tr">🇹🇷 Türkçe</button><button data-l="ru">🇷🇺 Русский</button>';
    document.body.appendChild(p);
    p.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; lang = b.dataset.l; document.documentElement.lang = lang; try { localStorage.setItem('leise.lang', lang); } catch (x) { /* egal */ } p.remove(); translateDom(); intro(() => {}); });
  }
  L.translateDom = translateDom;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', pick); else pick();
  setInterval(() => { if (lang !== 'de') translateDom(); }, 1500);
})();
