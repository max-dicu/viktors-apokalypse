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
  const tr = (t) => { const k = t.trim(); const e = D[k] || (L.T4 && L.T4[k]); return e ? t.replace(k, e[LI[lang] || 0]) : t; };
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
  #introV .c{font:italic 700 clamp(14px,3vw,26px) Georgia,serif;letter-spacing:5px;opacity:0;transition:opacity 1.4s;color:#c8a0ff;margin-top:8px}@keyframes ivFlick{50%{opacity:.15}}@keyframes ivGlitch{0%{text-shadow:7px 0 #f00,-7px 0 #0ff;filter:blur(1px)}20%{text-shadow:-6px 0 #f00,6px 0 #0ff}40%{text-shadow:4px 0 #f00,-4px 0 #0ff;filter:none}60%{text-shadow:-2px 0 #f00,2px 0 #0ff}100%{text-shadow:0 0 30px rgba(200,40,40,.6)}}#introV{overflow:hidden}#introV small{position:absolute;bottom:16px;opacity:.5;font-size:12px}`;
  document.head.appendChild(css);
  function sound() {
    // „Sie hören alles“: Stille, Atmen, Schritte, ein knackender Ast – dann klickt etwas in der Dunkelheit zurück … und der Titel schlägt ein.
    try {
      L.initAudio && L.initAudio(); const A = L.audio && L.audio.ctx; if (!A) return; if (A.state === 'suspended' && A.resume) A.resume();
      const t0 = A.currentTime + 0.08;
      const out = A.createGain(); out.gain.value = 0.95; const comp = A.createDynamicsCompressor(); out.connect(comp); comp.connect(A.destination); L._introOut = out;
      const rv = A.createConvolver(), ir = A.createBuffer(2, A.sampleRate * 4, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); } rv.buffer = ir; const rg = A.createGain(); rg.gain.value = 0.6; rv.connect(rg); rg.connect(out);
      const nb = A.createBuffer(1, A.sampleRate * 4, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const env = (g, s, a, hold, rel, v) => { g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + a); g.gain.setValueAtTime(v, s + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, s + a + hold + rel); };
      const pan = (n, p) => { if (!A.createStereoPanner) return n; const sp = A.createStereoPanner(); sp.pan.value = p; n.connect(sp); return sp; };
      const tone = (type, f, s, a, hold, rel, v, o) => { o = o || {}; const os = A.createOscillator(), g = A.createGain(), fl = A.createBiquadFilter(); os.type = type; os.frequency.setValueAtTime(f, s); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, s + a + hold + rel); if (o.det) os.detune.value = o.det; fl.type = o.ft || 'lowpass'; fl.frequency.value = o.cut || 6000; fl.Q.value = o.q || 0.7; os.connect(fl); fl.connect(g); const end = pan(g, o.pan || 0); end.connect(out); if (o.rev !== false) end.connect(rv); env(g, s, a, hold, rel, v); os.start(s); os.stop(s + a + hold + rel + 0.1); return { os, g, fl }; };
      const noise = (s, a, hold, rel, v, ft, f, f2, q, o) => { o = o || {}; const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; n.loop = true; fl.type = ft; fl.frequency.setValueAtTime(f, s); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, s + a + hold + rel); fl.Q.value = q || 1; n.connect(fl); fl.connect(g); const end = pan(g, o.pan || 0); end.connect(out); if (o.rev !== false) end.connect(rv); env(g, s, a, hold, rel, v); n.start(s, Math.random() * 2); n.stop(s + a + hold + rel + 0.1); return g; };
      const T = (x) => t0 + x;
      // 1) Stille: Tinnitus-Pfeifen und Raumrauschen, dazu dein Atem
      tone('sine', 7350, T(0), 1.5, 3, 1, 0.006, { rev: false });
      noise(T(0), 1.5, 4.5, 0.4, 0.018, 'lowpass', 400, 300, 0.7, { rev: false });
      for (let k = 0; k < 3; k++) { noise(T(0.3 + k * 1.35), 0.55, 0.05, 0.4, 0.05, 'bandpass', 700, 1100, 1.4, { rev: false }); noise(T(0.95 + k * 1.35), 0.15, 0.1, 0.55, 0.04, 'bandpass', 1000, 600, 1.2, { rev: false }); }
      // 2) Schritte … und ein knackender Ast
      const step = (x, v, p) => { noise(T(x), 0.005, 0.02, 0.14, v, 'lowpass', 900, 250, 0.8, { pan: p }); tone('sine', 90, T(x), 0.005, 0.02, 0.12, v * 0.8, { to: 50, pan: p }); };
      step(2.5, 0.25, -0.3); step(3.25, 0.35, 0.2);
      noise(T(4.0), 0.001, 0.015, 0.09, 0.9, 'highpass', 2500, 1800, 0.7); noise(T(4.03), 0.001, 0.01, 0.07, 0.6, 'bandpass', 3800, 2000, 2); tone('triangle', 1900, T(4.0), 0.001, 0.005, 0.06, 0.15, { to: 700 });
      // 3) totenstill … dann klickt etwas zurück (wie Viktor)
      for (let k = 0; k < 14; k++) { const x = 4.65 + k * 0.075 + (k > 6 ? 0.25 : 0); noise(T(x), 0.001, 0.004, 0.025, 0.25 + (k % 3) * 0.05, 'bandpass', 2600 + (k % 4) * 300, 0, 8, { pan: 0.55 }); }
      { const g = tone('sawtooth', 68, T(4.9), 0.5, 0.4, 0.4, 0.08, { cut: 500, pan: 0.5, to: 52 }); const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = 9; lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.g.gain); lfo.start(T(4.9)); lfo.stop(T(6.3)); }
      // 4) Kreischen + Einsaugen → TITEL
      noise(T(4.95), 0.6, 0.02, 0.03, 0.45, 'bandpass', 300, 7000, 2);
      for (const f of [1400, 1483, 1571, 1666, 2100]) tone('sawtooth', f, T(5.05), 0.5, 0.05, 0.4, 0.04, { cut: 4000, ft: 'bandpass', q: 4, to: f * 0.7 });
      const H = T(5.6);
      tone('sine', 72, H, 0.004, 0.1, 2.8, 1, { to: 24, rev: false }); noise(H, 0.003, 0.05, 1.8, 0.9, 'lowpass', 3500, 110, 0.7);
      [196, 277, 392, 554, 784].forEach((f) => tone('triangle', f, H, 0.003, 0.02, 3.5, 0.045, { cut: 7000 }));
      for (const [f, d] of [[36.7, 0], [55, 9], [73.4, -9], [77.8, 0], [110, 6]]) { const n = tone('sawtooth', f, H, 0.02, 0.8, 4, 0.09, { cut: 2600, det: d }); n.fl.frequency.setValueAtTime(2600, H); n.fl.frequency.exponentialRampToValueAtTime(220, H + 4.6); }
      // 5) danach: Dröhnen, Herzschlag, entfernte Klicks, eine kaputte Spieluhr
      for (const [f, d] of [[41.2, 0], [43.6, 0], [61.7, -12]]) tone('sawtooth', f, T(6.0), 2, 3.6, 2, 0.06, { cut: 210, det: d });
      for (let k = 0; k < 6; k++) { const x = 6.5 + k * 0.82; tone('sine', 60, T(x), 0.01, 0.05, 0.22, 0.45, { to: 40, rev: false }); tone('sine', 54, T(x + 0.2), 0.01, 0.04, 0.2, 0.32, { to: 38, rev: false }); }
      for (let k = 0; k < 8; k++) { const x = 8.3 + k * 0.09; noise(T(x), 0.001, 0.004, 0.025, 0.08, 'bandpass', 2800, 0, 8, { pan: -0.7 }); }
      [659.3, 622.3, 587.3, 466.2, 493.9].forEach((f, i) => tone('triangle', f * (0.985 - i * 0.012), T(7.4 + i * 0.7), 0.004, 0.02, 1.6, 0.05, { cut: 4200 }));
      tone('sine', 55, T(11.2), 0.004, 0.08, 1.5, 0.5, { to: 26, rev: false }); noise(T(11.2), 0.003, 0.03, 1.2, 0.3, 'lowpass', 1600, 100, 0.7);
    } catch (e) { /* ohne Ton */ }
  }
  function intro(done) {
    const TAG = { de: 'Sie hören jedes Geräusch.', en: 'They hear every sound.', ro: 'Ei aud orice sunet.', bg: 'Те чуват всеки звук.', tr: 'Her sesi duyarlar.', ru: 'Они слышат каждый звук.' }[lang] || 'They hear every sound.';
    const v = document.createElement('div'); v.id = 'introV';
    v.innerHTML = '<canvas id="introC" style="position:absolute;inset:0;width:100%;height:100%"></canvas><div class="a" style="position:relative">MAXI D. STUDIO PRESENTS</div><div class="b" style="margin-top:28px;position:relative">VIKTORS APOKALYPSE</div><div class="c" style="position:relative">in the Sina Sina Multiverse</div><div class="d" style="position:relative;font:italic 600 clamp(13px,2.2vw,20px) Georgia,serif;letter-spacing:4px;color:#b8b0a0;opacity:0;transition:opacity 1.6s;margin-top:22px">' + TAG + '</div><small>tap to skip</small>';
    document.body.appendChild(v); sound();
    // während des Intros: keine Spielmusik, keine Wind-/Umgebungsgeräusche
    L.introOn = true; const AU = L.audio; let keepVol = 1; try { if (AU && AU.master) { keepVol = AU.master.gain.value || 1; AU.master.gain.setTargetAtTime(0.0001, AU.ctx.currentTime, 0.05); } } catch (e) { /* egal */ }
    const unmute = () => { L.introOn = false; try { if (AU && AU.master) AU.master.gain.setTargetAtTime(keepVol, AU.ctx.currentTime, 0.6); } catch (e) { /* egal */ } };
    const cv = v.querySelector('#introC'), g = cv.getContext('2d'), a = v.querySelector('.a'), b = v.querySelector('.b'), c = v.querySelector('.c'), d = v.querySelector('.d');
    // Schallwellen (wie in „Leise“: was laut ist, sieht man) + Augen in der Dunkelheit
    const rings = []; const ring = (x, y, max, col, w) => rings.push({ x, y, r: 0, max, col, w, t: 0 });
    let eyes = 0, shake = 0, t0 = performance.now(), fin = false;
    const at = (s, f) => setTimeout(() => { if (!fin) f(); }, s * 1000);
    at(1.2, () => { a.style.opacity = '1'; }); at(2.4, () => { a.style.animation = 'ivFlick .35s steps(2) 3'; }); at(3.6, () => { a.style.opacity = '0'; });
    at(2.5, () => ring(0.42, 0.86, 0.35, '200,210,230', 2)); at(3.25, () => ring(0.56, 0.86, 0.45, '200,210,230', 3));
    at(4.0, () => { ring(0.5, 0.84, 1.1, '255,255,255', 5); shake = 0.25; });
    at(4.6, () => { eyes = 1; }); at(5.0, () => ring(0.78, 0.45, 0.6, '255,60,40', 3));
    at(5.6, () => { eyes = 2; shake = 1; b.style.transition = 'none'; b.style.opacity = '1'; b.style.transform = 'scale(1.6)'; requestAnimationFrame(() => { b.style.transition = 'transform .35s cubic-bezier(.2,1.6,.4,1)'; b.style.transform = 'scale(1)'; }); b.style.animation = 'ivGlitch 1.4s steps(8) 1'; for (let k = 0; k < 3; k++) at(k * 0.12, () => ring(0.5, 0.5, 1.4, '255,70,50', 6 - k)); v.style.background = '#2a0505'; at(0.12, () => { v.style.transition = 'background 1.2s'; v.style.background = '#000'; }); });
    at(7.2, () => { c.style.opacity = '1'; }); at(8.6, () => { d.style.opacity = '0.85'; }); at(8.3, () => ring(0.18, 0.5, 0.5, '255,60,40', 2));
    const draw = () => {
      if (fin) return; const W = cv.width = cv.clientWidth, Hh = cv.height = cv.clientHeight, s = Math.min(W, Hh), tt = (performance.now() - t0) / 1000;
      g.clearRect(0, 0, W, Hh);
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += 1 / 60; r.r = r.max * (1 - Math.pow(1 - Math.min(1, r.t / 1.4), 3)); const al = Math.max(0, 1 - r.t / 1.4); g.strokeStyle = 'rgba(' + r.col + ',' + (al * 0.8).toFixed(3) + ')'; g.lineWidth = r.w; g.beginPath(); g.arc(r.x * W, r.y * Hh, r.r * s, 0, 6.283); g.stroke(); if (al <= 0) rings.splice(i, 1); }
      if (eyes) { const ex = W * 0.78, ey = Hh * 0.45, sz = s * (eyes === 2 ? 0.02 : 0.012), bl = Math.sin(tt * 3) > 0.96 ? 0.15 : 1; for (const o of [-1, 1]) { const gr = g.createRadialGradient(ex + o * sz * 2.6, ey, 0, ex + o * sz * 2.6, ey, sz * 3); gr.addColorStop(0, 'rgba(255,240,220,' + bl + ')'); gr.addColorStop(0.3, 'rgba(255,60,30,' + 0.8 * bl + ')'); gr.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(ex + o * sz * 2.6, ey, sz * 3, 0, 6.283); g.fill(); } }
      // Vignette + Filmkorn
      const vg = g.createRadialGradient(W / 2, Hh / 2, s * 0.25, W / 2, Hh / 2, Math.max(W, Hh) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.85)'); g.fillStyle = vg; g.fillRect(0, 0, W, Hh);
      g.fillStyle = 'rgba(255,255,255,0.035)'; for (let k = 0; k < 140; k++) g.fillRect(Math.random() * W, Math.random() * Hh, 1.5, 1.5);
      if (shake > 0) { shake = Math.max(0, shake - 0.03); v.style.transform = 'translate(' + ((Math.random() - 0.5) * 18 * shake) + 'px,' + ((Math.random() - 0.5) * 18 * shake) + 'px)'; } else v.style.transform = '';
      requestAnimationFrame(draw);
    };
    draw();
    const end = () => { if (fin) return; fin = true; unmute(); try { if (L._introOut) L._introOut.gain.setTargetAtTime(0.0001, L.audio.ctx.currentTime, 0.5); } catch (e) { /* egal */ } v.style.transition = 'opacity .8s'; v.style.opacity = '0'; setTimeout(() => { v.remove(); done(); }, 800); };
    setTimeout(end, 12600);
    v.addEventListener('pointerdown', end);
  }
  function pick() {
    const p = document.createElement('div'); p.id = 'langPick';
    p.innerHTML = '<h1>🌍 Choose your language</h1><button data-l="de">🇩🇪 Deutsch</button><button data-l="en">🇬🇧 English</button><button data-l="ro">🇷🇴 Română</button><button data-l="bg">🇧🇬 Български</button><button data-l="tr">🇹🇷 Türkçe</button><button data-l="ru">🇷🇺 Русский</button>';
    document.body.appendChild(p);
    p.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; lang = b.dataset.l; document.documentElement.lang = lang; try { localStorage.setItem('leise.lang', lang); } catch (x) { /* egal */ } p.remove(); translateDom(); intro(() => {}); });
  }
  L.translateDom = translateDom;
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', pick); else pick();
  setInterval(() => { if (lang !== 'de') translateDom(); }, 1500);
})();
