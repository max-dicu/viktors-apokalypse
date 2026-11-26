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
    // Horror-Intro: tiefes Dröhnen, verstimmte Spieluhr, Herzschlag, Flüstern, Kreischen, großer Schlag beim Titel
    try {
      L.initAudio && L.initAudio(); const A = L.audio && L.audio.ctx; if (!A) return; if (A.state === 'suspended' && A.resume) A.resume();
      const t0 = A.currentTime + 0.08;
      const out = A.createGain(); out.gain.value = 0.9; const comp = A.createDynamicsCompressor(); out.connect(comp); comp.connect(A.destination); L._introOut = out;
      const rv = A.createConvolver(), ir = A.createBuffer(2, A.sampleRate * 3.5, A.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2); } rv.buffer = ir; const rg = A.createGain(); rg.gain.value = 0.55; rv.connect(rg); rg.connect(out);
      const nb = A.createBuffer(1, A.sampleRate * 4, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const env = (g, s, a, hold, rel, v) => { g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v, s + a); g.gain.setValueAtTime(v, s + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, s + a + hold + rel); };
      const tone = (type, f, s, a, hold, rel, v, opt) => { const o = A.createOscillator(), g = A.createGain(), fl = A.createBiquadFilter(); o.type = type; o.frequency.setValueAtTime(f, s); if (opt && opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, s + a + hold + rel); if (opt && opt.det) o.detune.value = opt.det; fl.type = (opt && opt.ft) || 'lowpass'; fl.frequency.value = (opt && opt.cut) || 6000; fl.Q.value = (opt && opt.q) || 0.7; o.connect(fl); fl.connect(g); g.connect(out); if (!opt || opt.rev !== false) g.connect(rv); env(g, s, a, hold, rel, v); o.start(s); o.stop(s + a + hold + rel + 0.1); return { o, g, fl }; };
      const noise = (s, a, hold, rel, v, ft, f, f2, q) => { const n = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); n.buffer = nb; n.loop = true; fl.type = ft; fl.frequency.setValueAtTime(f, s); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, s + a + hold + rel); fl.Q.value = q || 1; n.connect(fl); fl.connect(g); g.connect(out); g.connect(rv); env(g, s, a, hold, rel, v); n.start(s, Math.random() * 2); n.stop(s + a + hold + rel + 0.1); return g; };
      const T = (x) => t0 + x;
      // tiefes, schwebendes Dröhnen (verstimmt = unheimlich)
      for (const [f, d] of [[41.2, 0], [43.6, 0], [61.7, -12], [82.4, 9]]) tone('sawtooth', f, T(0), 3.5, 6, 2.5, 0.07, { cut: 220, det: d });
      tone('sine', 30, T(0.5), 4, 5.5, 2, 0.35, { rev: false });
      // Wind / Atmen
      noise(T(0), 2.5, 7, 2.5, 0.08, 'bandpass', 300, 900, 0.8);
      // verstimmte Spieluhr (e-Moll, mit Tritonus) – leiert immer mehr aus
      const box = [659.3, 784, 932.3, 880, 659.3, 622.3, 587.3, 466.2, 493.9, 659.3];
      box.forEach((f, i) => { const s = T(0.7 + i * 0.42), wob = 1 - i * 0.004; tone('triangle', f * wob, s, 0.005, 0.02, 1.4, 0.07, { cut: 5000 }); tone('sine', f * 2.01 * wob, s, 0.005, 0.01, 0.8, 0.025); });
      [659.3, 622.3, 587.3, 554.4, 523.3].forEach((f, i) => { const s = T(6.4 + i * 0.75), wob = 0.97 - i * 0.012; tone('triangle', f * wob, s, 0.005, 0.02, 1.8, 0.05, { cut: 4000 }); });
      // Herzschlag, der schneller wird
      let hb = 2.2, gap = 0.95; while (hb < 4.75) { tone('sine', 62, T(hb), 0.01, 0.05, 0.22, 0.55, { to: 40, rev: false }); tone('sine', 55, T(hb + 0.2), 0.01, 0.04, 0.2, 0.4, { to: 38, rev: false }); hb += gap; gap = Math.max(0.42, gap * 0.86); }
      // Flüstern
      for (let k = 0; k < 7; k++) { const s = T(1.2 + k * 0.6 + Math.random() * 0.3); noise(s, 0.15, 0.25 + Math.random() * 0.3, 0.3, 0.05, 'bandpass', 1800 + Math.random() * 1500, 2600 + Math.random() * 1500, 6); }
      // Ansaugen vor dem Titel + kreischende Geigen
      noise(T(3.4), 1.55, 0.02, 0.05, 0.4, 'bandpass', 200, 6500, 2);
      for (const f of [1180, 1251, 1325, 1404]) tone('sawtooth', f, T(3.9), 1.05, 0.02, 0.08, 0.035, { cut: 3000, ft: 'bandpass', q: 3, to: f * 1.12 });
      // TITEL: großer Schlag – Boom, Metall, verzerrtes Blech
      const H = T(5.0);
      tone('sine', 70, H, 0.005, 0.1, 2.6, 1, { to: 26, rev: false }); noise(H, 0.005, 0.05, 1.6, 0.8, 'lowpass', 3000, 120, 0.7);
      [220, 331, 467, 589, 834].forEach((f) => tone('triangle', f, H, 0.003, 0.02, 3.2, 0.05, { cut: 7000 }));
      for (const [f, d] of [[36.7, 0], [55, 7], [73.4, -7], [82.4, 0], [110, 5]]) { const n = tone('sawtooth', f, H, 0.02, 0.6, 3.6, 0.09, { cut: 2400, det: d }); n.fl.frequency.setValueAtTime(2400, H); n.fl.frequency.exponentialRampToValueAtTime(260, H + 4); }
      // danach: dunkler, langsamer Nachhall, Knarzen
      for (const [f, d] of [[38.9, 0], [41.2, 14], [58.3, -9]]) tone('sawtooth', f, T(5.4), 2, 3.5, 2.4, 0.06, { cut: 180, det: d });
      tone('sawtooth', 210, T(7.2), 0.4, 0.6, 0.6, 0.03, { cut: 900, to: 140 });
      noise(T(8.4), 0.3, 0.4, 0.8, 0.06, 'bandpass', 2400, 1400, 5);
      // leiser Schluss-Schlag
      tone('sine', 55, T(9.7), 0.005, 0.08, 1.6, 0.6, { to: 28, rev: false }); noise(T(9.7), 0.005, 0.03, 1.2, 0.35, 'lowpass', 1800, 100, 0.7);
    } catch (e) { /* ohne Ton */ }
  }
  function intro(done) {
    const v = document.createElement('div'); v.id = 'introV';
    v.innerHTML = '<div class="a">MAXI D. STUDIO PRESENTS</div><div class="b" style="margin-top:28px">VIKTORS APOKALYPSE</div><div class="c">in the Sina Sina Multiverse</div><small>tap to skip</small>';
    document.body.appendChild(v); sound();
    // während des Intros: keine Spielmusik, keine Wind-/Umgebungsgeräusche
    L.introOn = true; const AU = L.audio; let keepVol = 1; try { if (AU && AU.master) { keepVol = AU.master.gain.value || 1; AU.master.gain.setTargetAtTime(0.0001, AU.ctx.currentTime, 0.05); } } catch (e) { /* egal */ }
    const unmute = () => { L.introOn = false; try { if (AU && AU.master) AU.master.gain.setTargetAtTime(keepVol, AU.ctx.currentTime, 0.6); } catch (e) { /* egal */ } };
    const [a, b, c] = v.children; let fin = false;
    const end = () => { if (fin) return; fin = true; unmute(); try { if (L._introOut) L._introOut.gain.setTargetAtTime(0.0001, L.audio.ctx.currentTime, 0.5); } catch (e) { /* egal */ } v.style.transition = 'opacity .8s'; v.style.opacity = '0'; setTimeout(() => { v.remove(); done(); }, 800); };
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
