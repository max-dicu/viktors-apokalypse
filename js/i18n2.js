'use strict';
// Übersetzung der Meldungen im Spiel (Englisch/Rumänisch): erst ganze Sätze, sonst Wort für Wort. Boss- und Monsternamen bleiben gleich.
(function () {
  const L = window.L;
  // [Deutsch, Englisch, Rumänisch]
  const PH = [
    ['Monster sind hier friedlich – außer du greifst sie an.', 'Monsters are peaceful here – unless you attack them.', 'Monștrii sunt pașnici aici – dacă nu îi ataci.'],
    ['Du bist gestorben', 'You died', 'Ai murit'], ['Mit Freund spielen', 'Play with friends', 'Joacă cu prietenii'], ['Sekunden', 'seconds', 'secunde'], ['Minuten', 'minutes', 'minute'],
    ['hineingehen', 'enter', 'intră'], ['verlassen', 'leave', 'ieși'], ['einsteigen', 'get in', 'urcă'], ['aufsteigen', 'mount', 'urcă'], ['aussteigen', 'get out', 'coboară'], ['aufheben', 'pick up', 'ridică'],
    ['hochklettern', 'climb up', 'urcă'], ['runterklettern', 'climb down', 'coboară'], ['hinsetzen', 'sit down', 'așază-te'], ['hinlegen', 'lie down', 'întinde-te'], ['reden', 'talk', 'vorbește'],
    ['zähmen und reiten', 'tame and ride', 'îmblânzește și călărește'], ['streicheln', 'pet', 'mângâie'], ['öffnen', 'open', 'deschide'], ['Zuflucht', 'shelter', 'adăpost'], ['Turm', 'tower', 'turn']
  ];
  const W = { Monster: ['monster', 'monstru'], Münzen: ['coins', 'monede'], Leben: ['life', 'viață'], Spieler: ['player', 'jucător'], Mitspieler: ['teammate', 'coechipier'], Boss: ['boss', 'boss'], Bosse: ['bosses', 'boși'],
    besiegt: ['defeated', 'învins'], BESIEGT: ['DEFEATED', 'ÎNVINS'], ist: ['is', 'este'], sind: ['are', 'sunt'], da: ['here', 'aici'], kommt: ['comes', 'vine'], gleich: ['soon', 'imediat'], jetzt: ['now', 'acum'],
    und: ['and', 'și'], oder: ['or', 'sau'], mit: ['with', 'cu'], ohne: ['without', 'fără'], nicht: ['not', 'nu'], kein: ['no', 'niciun'], keine: ['no', 'nicio'], nur: ['only', 'doar'], noch: ['still', 'încă'], schon: ['already', 'deja'],
    du: ['you', 'tu'], Du: ['You', 'Tu'], dich: ['you', 'te'], dir: ['you', 'ție'], dein: ['your', 'tău'], deine: ['your', 'ta'], deinen: ['your', 'tău'], sie: ['she', 'ea'], er: ['he', 'el'], es: ['it', 'el'], wir: ['we', 'noi'], ihr: ['you', 'voi'],
    der: ['the', ''], die: ['the', ''], das: ['the', ''], den: ['the', ''], dem: ['the', ''], ein: ['a', 'un'], eine: ['a', 'o'], einen: ['a', 'un'], im: ['in the', 'în'], in: ['in', 'în'], auf: ['on', 'pe'], zum: ['to the', 'la'], zur: ['to the', 'la'], zu: ['to', 'la'], von: ['from', 'de la'], vom: ['from the', 'de la'], aus: ['out of', 'din'], für: ['for', 'pentru'], über: ['over', 'peste'], unter: ['under', 'sub'], nach: ['to', 'spre'], bei: ['at', 'la'], an: ['at', 'la'],
    Hause: ['home', 'acasă'], Heimat: ['home', 'acasă'], Insel: ['island', 'insulă'], Welt: ['world', 'lume'], Mond: ['moon', 'lună'], Stadt: ['city', 'oraș'], Karte: ['map', 'hartă'], Portal: ['portal', 'portal'], Tür: ['door', 'ușă'],
    Schloss: ['castle', 'castel'], Dorf: ['village', 'sat'], Wald: ['forest', 'pădure'], See: ['lake', 'lac'], Höhle: ['cave', 'peșteră'], Drache: ['dragon', 'dragon'], Drachen: ['dragons', 'dragoni'], Einhorn: ['unicorn', 'unicorn'], Einhörner: ['unicorns', 'unicorni'],
    Waffe: ['weapon', 'armă'], Munition: ['ammo', 'muniție'], Kiste: ['crate', 'ladă'], Schlüssel: ['key', 'cheie'], Auto: ['car', 'mașină'], Fahrzeug: ['vehicle', 'vehicul'], Polizei: ['police', 'poliție'], Hubschrauber: ['helicopter', 'elicopter'],
    Tod: ['death', 'moarte'], tot: ['dead', 'mort'], getroffen: ['hit', 'lovit'], Schaden: ['damage', 'daune'], Angriff: ['attack', 'atac'], fliegen: ['fly', 'zbori'], laufen: ['run', 'fugi'], rennen: ['run', 'aleargă'], schleichen: ['sneak', 'furișează-te'], springen: ['jump', 'sari'],
    Schleich: ['sneak', 'furișare'], Achtung: ['Warning', 'Atenție'], ACHTUNG: ['WARNING', 'ATENȚIE'], Warnung: ['warning', 'avertisment'], Hilfe: ['help', 'ajutor'], hier: ['here', 'aici'], dort: ['there', 'acolo'], weg: ['away', 'departe'],
    geht: ['goes', 'merge'], gehen: ['go', 'mergi'], hat: ['has', 'are'], haben: ['have', 'au'], wird: ['will', 'va'], werden: ['become', 'devin'], kann: ['can', 'poate'], kannst: ['can', 'poți'], musst: ['must', 'trebuie'], soll: ['should', 'trebuie'],
    alle: ['all', 'toți'], Alle: ['All', 'Toți'], alles: ['everything', 'totul'], jeden: ['every', 'fiecare'], Tag: ['day', 'zi'], Nacht: ['night', 'noapte'], Zeit: ['time', 'timp'], Stufe: ['level', 'nivel'], Level: ['level', 'nivel'],
    neue: ['new', 'nou'], neuen: ['new', 'noi'], groß: ['big', 'mare'], riesig: ['huge', 'uriaș'], schnell: ['fast', 'rapid'], langsam: ['slow', 'încet'], sicher: ['safe', 'în siguranță'], gefährlich: ['dangerous', 'periculos'], leise: ['quietly', 'încet'],
    Quest: ['quest', 'misiune'], Quests: ['quests', 'misiuni'], geschafft: ['done', 'reușit'], GESCHAFFT: ['DONE', 'REUȘIT'], Belohnung: ['reward', 'recompensă'], gewonnen: ['won', 'câștigat'], verloren: ['lost', 'pierdut'],
    Schnipp: ['Snap', 'Pocnet'], Stein: ['stone', 'piatră'], Steine: ['stones', 'pietre'], Handschuh: ['gauntlet', 'mănușă'], Ewigkeitshandschuh: ['Infinity gauntlet', 'Mănușa infinitului'], Strahl: ['beam', 'rază'],
    Sprachchat: ['voice chat', 'chat vocal'], an: ['on', 'pornit'], aus: ['off', 'oprit'], Tipp: ['Tip', 'Sfat'], Wasser: ['water', 'apă'], Luft: ['air', 'aer'], Boden: ['ground', 'pământ'], Himmel: ['sky', 'cer'], Feuer: ['fire', 'foc'], zittert: ['shakes', 'tremură'], erwacht: ['awakens', 'se trezește'], Riese: ['giant', 'uriaș'], Riesen: ['giants', 'uriași'], Gott: ['god', 'zeu'], ins: ['into the', 'în'], beim: ['at the', 'la'], wieder: ['again', 'din nou'], zurück: ['back', 'înapoi'], Zurück: ['Back', 'Înapoi'], erscheint: ['appears', 'apare'], aufgetaucht: ['appeared', 'a apărut'], Königsschloss: ['royal castle', 'castelul regal'], Kristallhalle: ['crystal hall', 'sala de cristal'], Rapunzelturm: ['Rapunzel tower', 'turnul lui Rapunzel'], Märchenwelt: ['fairy world', 'lumea basmelor'], Riesin: ['giantess', 'uriașă'], friedliche: ['peaceful', 'pașnică'], Hand: ['hand', 'mână'], Zopf: ['braid', 'coadă'], goldenen: ['golden', 'aurie'], Ranke: ['vine', 'vrej'], Riesenbohnenranke: ['giant beanstalk', 'vrejul uriaș'], wartet: ['waits', 'așteaptă'], jagt: ['hunts', 'vânează'], gefressen: ['eaten', 'mâncat'], gefangen: ['caught', 'prins'], Gefangen: ['Caught', 'Prins'], wegen: ['because of', 'din cauza'], dauert: ['lasts', 'durează'], lädt: ['charges', 'se încarcă'], bereit: ['ready', 'gata'], Treffer: ['hit', 'lovitură'], Spiel: ['game', 'joc'], Runde: ['round', 'rundă'], Stunde: ['hour', 'oră'], heilt: ['heals', 'vindecă'], heilst: ['heal', 'te vindeci'], langsam: ['slowly', 'încet'], bringt: ['brings', 'aduce'], Code: ['code', 'cod'], Feenkreis: ['fairy ring', 'cerc de zâne'], Schnell: ['Fast', 'Rapid']
  };
  const idx = (lang) => (lang === 'en' ? 0 : 1);
  function tr(s) {
    const lang = L.lang ? L.lang() : 'de'; if (lang === 'de' || typeof s !== 'string' || !s) return s;
    const k = idx(lang); let o = s;
    const toks = []; if (L.trSentencesTok) o = L.trSentencesTok(o, k, toks);
    for (const p of PH) if (o.includes(p[0])) o = o.split(p[0]).join(p[k + 1]);
    o = o.replace(/[A-Za-zÄÖÜäöüß]+/g, (w) => { if (W[w]) return W[w][k]; const lw = w.toLowerCase(), e = W[lw]; if (!e) return w; const t = e[k]; return w === w.toUpperCase() && w.length > 1 ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1); });
    o = o.replace(/⟦([0-9]+)⟧/g, (m, i) => toks[+i]);
    return o.replace(/ {2,}/g, ' ');
  }
  L.trText = tr;
  setTimeout(() => {
    const om = L.msg, ob = L.banner, oh = L.crateHint;
    L.msg = (t, ms) => om(tr(t), ms); L.banner = (a, b) => ob(tr(a), tr(b));
    // Hinweise (E: …) werden beim Anzeigen übersetzt
    setInterval(() => { if (!L.crateHint || L.crateHint._tr) return; const h = L.crateHint; L.crateHint = function () { return tr(h()); }; L.crateHint._tr = true; }, 1000);
    void oh;
  }, 50);
})();
