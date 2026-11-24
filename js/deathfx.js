'use strict';
// Tod-Effekte: je nach Todesursache ein eigener großer Schriftzug, Farbe und Effekt (Explosion, Blitz, Graustufen …)
(function () {
  const L = window.L, P = L.player;
  const KINDS = [
    [/joyor/i, 'JOYOR QUALITY', '#ffd23f', 'boom'], [/polizei/i, 'FESTGENOMMEN', '#4a8aff', 'siren'],
    [/gefressen|verschluck|maul|biss/i, 'GEFRESSEN', '#c0102a', 'blood'], [/unfall|crash|aufprall|auto|zug|überfahren|bagger/i, 'TOTALSCHADEN', '#ff8020', 'boom'],
    [/explo|granate|rakete|bombe/i, 'IN DIE LUFT GEFLOGEN', '#ff6010', 'boom'], [/leere|gefallen|sturz|abgestürzt|tief/i, 'ABGESTÜRZT', '#9a9aff', 'fall'],
    [/ertrunk|wasser|tsunami|welle|wirbel/i, 'ERTRUNKEN', '#30a0ff', 'water'], [/strahl|laser|verdampf|blitz|stein/i, 'VERDAMPFT', '#60f0ff', 'zap'],
    [/platt|zerquetsch|zertrümmer|zermalm|zerschmetter|stampf/i, 'ZERQUETSCHT', '#d0a060', 'boom'], [/erschossen|schuss|getroffen/i, 'ERLEDIGT', '#ff3030', 'blood'],
    [/hunger|verhungert/i, 'VERHUNGERT', '#c0a060', 'fade'], [/durst|verdurstet/i, 'VERDURSTET', '#c0a060', 'fade']
  ];
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;z-index:55;pointer-events:none;display:none;align-items:center;justify-content:center;flex-direction:column';
  el.innerHTML = '<div id="dfxT" style="font:900 clamp(40px,11vw,120px) Impact,\'Arial Black\',sans-serif;letter-spacing:4px;text-shadow:0 0 18px rgba(0,0,0,.9),3px 3px 0 #000"></div><div id="dfxS" style="font:700 clamp(14px,3vw,22px) Arial,sans-serif;color:#fff;text-shadow:0 2px 4px #000;margin-top:6px"></div>';
  document.body.appendChild(el);
  const cv = () => document.querySelector('canvas');
  L.deathFx = function (cause) {
    const c = String(cause || ''), k = KINDS.find((q) => q[0].test(c)) || [null, 'GESTORBEN', '#e02020', 'fade'];
    const [, title, col, fx] = k, x = P.x, y = (P.y || 0) + 1, z = P.z;
    const T = document.getElementById('dfxT'); T.textContent = title; T.style.color = col; T.style.transform = 'scale(2.2)'; T.style.opacity = '0'; T.style.transition = 'transform .45s cubic-bezier(.2,1.6,.4,1), opacity .3s';
    document.getElementById('dfxS').textContent = c;
    el.style.display = 'flex'; requestAnimationFrame(() => { T.style.transform = 'scale(1)'; T.style.opacity = '1'; });
    const g = cv(); if (g) { g.style.transition = 'filter 1.2s'; g.style.filter = fx === 'water' ? 'grayscale(.6) hue-rotate(160deg) brightness(.8)' : fx === 'zap' ? 'grayscale(.7) brightness(1.3)' : 'grayscale(1) contrast(1.15)'; }
    if (fx === 'boom') { for (let i = 0; i < 4; i++) L.fx(['#ffd040', '#ff7020', '#ff3010', '#555'][i], x, y, z, 30, 14, { basic: i < 3, size: 0.6, life: 1.2 }); L.shake = Math.max(L.shake, 1.4); L.snd.crash && L.snd.crash(1, { x, y, z }); }
    else if (fx === 'blood') { L.blood && L.blood(x, y, z, 50, true); L.shake = Math.max(L.shake, 0.8); }
    else if (fx === 'zap') { L.fx('#80f8ff', x, y, z, 40, 12, { basic: true, size: 0.4, life: 1 }); L.fx('#ffffff', x, y, z, 20, 6, { basic: true, size: 0.6, life: 0.6 }); }
    else if (fx === 'water') L.fx('#a0d8ff', x, y, z, 30, 6, { basic: true, size: 0.3, life: 1.2 });
    else if (fx === 'siren') { let n = 0; const iv = setInterval(() => { el.style.background = n % 2 ? 'rgba(255,0,0,.18)' : 'rgba(0,60,255,.18)'; if (++n > 8) { clearInterval(iv); el.style.background = ''; } }, 180); }
    L.tn && L.tn({ f: 220, fTo: 55, dur: 1.4, type: 'sawtooth', vol: 0.18 });
    setTimeout(() => { el.style.display = 'none'; el.style.background = ''; if (g) g.style.filter = ''; }, 3800);
  };
})();
