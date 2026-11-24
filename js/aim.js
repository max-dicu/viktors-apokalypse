'use strict';
// Zielen je nach Waffe (Fernrohr, Leuchtpunkt, Kreuz, Streukreis, Granaten-Flugbahn), Schulter-Kamera beim Zielen,
// bessere Waffeneffekte (Mündungsblitz, Rauch, Hülsen, Einschläge) und Blut bei jedem Treffer.
(function () {
  const L = window.L, T = THREE, P = L.player, I = L.ITEMS;
  const kindOf = (st) => { if (!st || !I[st]) return null; const d = I[st]; if (d.zoom >= 2.5 || /sniper|scharf/i.test(st)) return 'scope'; if (d.pellets) return 'shot'; if (d.throwable || st === 'granate' || st === 'molotow' || st === 'blendgranate') return 'throw'; if (L.isGun && L.isGun(st)) return d.auto || /gewehr|lmg|mp|armbrust/i.test(st) ? 'dot' : 'cross'; return null; };
  // ---------- Overlay ----------
  const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:11;display:none'; document.body.appendChild(ov);
  const css = document.createElement('style'); css.textContent = 'body.cinema #aimOv{display:none!important}'; document.head.appendChild(css); ov.id = 'aimOv';
  const HTML = {
    scope: '<div style="position:absolute;inset:0;background:radial-gradient(circle at center, transparent 0 34vmin, rgba(0,0,0,.92) 34.4vmin)"></div><div style="position:absolute;left:50%;top:50%;width:68vmin;height:68vmin;transform:translate(-50%,-50%);border-radius:50%;box-shadow:inset 0 0 40px rgba(0,0,0,.8)"><div style="position:absolute;left:0;right:0;top:50%;height:2px;background:#000"></div><div style="position:absolute;top:0;bottom:0;left:50%;width:2px;background:#000"></div>' + [-4, -3, -2, -1, 1, 2, 3, 4].map((k) => '<div style="position:absolute;left:calc(50% + ' + k * 3.5 + 'vmin - 3px);top:calc(50% - 3px);width:6px;height:6px;border-radius:50%;background:#000"></div><div style="position:absolute;top:calc(50% + ' + k * 3.5 + 'vmin - 3px);left:calc(50% - 3px);width:6px;height:6px;border-radius:50%;background:#000"></div>').join('') + '<div style="position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:#ff2020"></div></div>',
    dot: '<div style="position:absolute;left:50%;top:50%;width:7px;height:7px;margin:-3.5px;border-radius:50%;background:#ff2a2a;box-shadow:0 0 8px 2px rgba(255,40,40,.8)"></div><div style="position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:2px solid rgba(255,60,60,.35)"></div>',
    cross: '<div style="position:absolute;left:50%;top:50%">' + [[0, -16, 2, 10], [0, 6, 2, 10], [-16, 0, 10, 2], [6, 0, 10, 2]].map(([x, y, w, h]) => '<div style="position:absolute;left:' + (x - (w > 2 ? 0 : 1)) + 'px;top:' + (y - (h > 2 ? 0 : 1)) + 'px;width:' + w + 'px;height:' + h + 'px;background:#fff;box-shadow:0 0 2px #000"></div>').join('') + '</div>',
    shot: '<div style="position:absolute;left:50%;top:50%;width:90px;height:90px;margin:-45px;border-radius:50%;border:2px solid rgba(255,255,255,.8);box-shadow:0 0 3px #000"></div><div style="position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;background:#fff"></div>'
  };
  let curK = null;
  // ---------- Granaten-Flugbahn ----------
  const arc = []; for (let i = 0; i < 26; i++) { const m = new T.Mesh(L.GEO.sph, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })); m.scale.setScalar(0.07); m.visible = false; m.renderOrder = 5; arc.push(m); }
  let arcAdded = false;
  function showArc(on) {
    if (!arcAdded && L.scene) { arc.forEach((m) => L.scene.add(m)); arcAdded = true; }
    if (!on) { arc.forEach((m) => { m.visible = false; }); return; }
    const dir = new T.Vector3(); L.camera.getWorldDirection(dir);
    let x = P.x + Math.sin(P.yaw) * 0.5, y = (P.y || 0) + 1.7, z = P.z + Math.cos(P.yaw) * 0.5, vx = dir.x * 17 + P.vx, vy = dir.y * 17 + 4, vz = dir.z * 17 + P.vz; let hit = false;
    arc.forEach((m, i) => { for (let s = 0; s < 3; s++) { vy -= 9.8 * 0.035; x += vx * 0.035; y += vy * 0.035; z += vz * 0.035; if (y < 0.1) { y = 0.1; hit = true; } } m.position.set(x, y, z); m.visible = !hit || i === 0; m.material.color.set(i % 2 ? 0xffd040 : 0xffffff); if (hit && !m.visible) m.visible = false; });
  }
  // ---------- Kamera über die Schulter ----------
  let sh = 0;
  const ouc = L.updateCamera;
  L.updateCamera = function (dt) {
    ouc(dt);
    const st = L.selType && L.selType(), k = kindOf(st);
    const want = P.aiming && k && k !== 'scope' && !P.vehicle && !L.cine && (P.camDist || 4) > 0.6 ? 1 : 0;
    sh += (want - sh) * Math.min(1, dt * 10);
    if (sh > 0.01 && !L.cine) { const cam = L.camera, r = new T.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), f = new T.Vector3(); cam.getWorldDirection(f); cam.position.addScaledVector(r, 0.75 * sh).addScaledVector(f, 1.1 * sh); cam.position.y += 0.15 * sh; }
  };
  const owz = L.weaponZoom;
  L.weaponZoom = function () { const z = owz ? owz() : 1; if (z !== 1) return z; const k = kindOf(L.selType && L.selType()); return P.aiming && k ? (k === 'dot' ? 1.3 : k === 'shot' ? 1.1 : 1.18) : 1; };
  // ---------- Waffeneffekte ----------
  let starTex = null;
  const star = () => { if (starTex) return starTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.3, 'rgba(255,200,80,.9)'); gr.addColorStop(1, 'rgba(255,120,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); starTex = new T.CanvasTexture(c); return starTex; };
  const shells = []; let lastMuzzle = 0;
  const brass = L.mat('#c8a040', { metal: 0.9, rough: 0.3 });
  const otr = L.tracer;
  L.tracer = function (a, b) {
    otr(a, b);
    const now = performance.now();
    if (now - lastMuzzle > 40) {
      lastMuzzle = now;
      const s = new T.Sprite(new T.SpriteMaterial({ map: star(), transparent: true, blending: T.AdditiveBlending, depthWrite: false })); s.position.copy(a); s.scale.setScalar(0.9 + Math.random() * 0.5); L.scene.add(s); setTimeout(() => { L.scene.remove(s); s.material.dispose(); }, 50);
      L.fx('#9a9a9a', a.x, a.y, a.z, 3, 0.6, { size: 0.12, life: 0.7, g: -0.5 });
      if (shells.length < 30) { const m = new T.Mesh(L.GEO.cyl, brass); m.scale.set(0.02, 0.06, 0.02); m.position.copy(a); L.scene.add(m); const yaw = P.camYaw + Math.PI / 2; shells.push({ m, vx: Math.sin(yaw) * 2.5 + (Math.random() - 0.5), vy: 2.5 + Math.random(), vz: Math.cos(yaw) * 2.5 + (Math.random() - 0.5), t: 0 }); }
    }
    L.fx(Math.random() < 0.5 ? '#ffe080' : '#ffffff', b.x, b.y, b.z, 4, 3, { basic: true, size: 0.06, life: 0.25 });
    L.fx('#b0a080', b.x, b.y, b.z, 3, 1.2, { size: 0.12, life: 0.6 });
  };
  // ---------- Blut bei jedem Treffer ----------
  const METAL = { walker: 1, omni: 1, flieger: 1, greifer: 1 };
  const od = L.damageEnt;
  L.damageEnt = function (e, dmg, fx, fz, src) {
    const was = e && e.dead; od(e, dmg, fx, fz, src);
    if (!e || was || !(dmg > 0) || e.kind === 'remote' || e.kind === 'npc' && false) return;
    const y = e.kind === 'walker' ? (e.hy || 8) : e.kind === 'boss' ? (e.hy || 20) : e.kind === 'omni' ? 80 : Math.min(e.hy || 1.4, 30);
    const big = e.bigR || 0, x = e.x + (Math.random() - 0.5) * big * 0.5, z = e.z + (Math.random() - 0.5) * big * 0.5;
    if (METAL[e.kind]) { L.fx('#ffd060', x, y, z, 10, 6, { basic: true, size: 0.12, life: 0.4 }); L.fx('#555', x, y, z, 4, 2, { size: 0.3, life: 0.8 }); return; }
    const n = Math.min(40, 6 + Math.round(dmg / 8));
    L.blood && L.blood(x, y, z, n, dmg > 60);
    if (Math.random() < 0.35 && L.decal) L.decal(e.x + (Math.random() - 0.5) * 2, e.z + (Math.random() - 0.5) * 2, 0.6 + Math.min(2, dmg / 60));
  };
  const splat = document.createElement('div'); splat.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:12;opacity:0;transition:opacity .9s'; document.body.appendChild(splat);
  const oh = L.hurtPlayer;
  L.hurtPlayer = function (dmg, why) {
    const h0 = P.hp, r = oh(dmg, why);
    if (P.hp < h0 && h0 - P.hp >= 4) {
      L.blood && L.blood(P.x, (P.y || 0) + 1.3, P.z, Math.min(30, 6 + (h0 - P.hp) / 2), (h0 - P.hp) > 30);
      const blobs = []; for (let k = 0; k < 4; k++) { const ex = Math.random() < 0.5 ? Math.random() * 25 : 75 + Math.random() * 25, ey = Math.random() * 100, s = 10 + Math.random() * 18; blobs.push('radial-gradient(circle at ' + ex + '% ' + ey + '%, rgba(150,0,0,.65) 0, rgba(120,0,0,.4) ' + s * 0.5 + 'vmin, transparent ' + s + 'vmin)'); }
      splat.style.transition = 'none'; splat.style.background = blobs.join(','); splat.style.opacity = '1'; requestAnimationFrame(() => { splat.style.transition = 'opacity 1.2s'; splat.style.opacity = '0'; });
    }
    return r;
  };
  // ---------- jedes Bild ----------
  L.updateAim = function (dt) {
    const st = L.selType && L.selType(), k = kindOf(st), aiming = !!P.aiming && !!k && !P.vehicle && L.state === 'game';
    const want = aiming ? k : null;
    if (want !== curK) { curK = want; ov.innerHTML = want ? HTML[want] || '' : ''; ov.style.display = want ? 'block' : 'none'; }
    if (curK === 'scope') { const t = performance.now() / 1000; ov.firstChild.nextSibling.style.transform = 'translate(calc(-50% + ' + Math.sin(t * 1.3) * 6 + 'px), calc(-50% + ' + Math.sin(t * 1.7) * 5 + 'px))'; }
    showArc(k === 'throw' && L.mouse && L.mouse.right && !P.vehicle && L.state === 'game');
    for (let i = shells.length - 1; i >= 0; i--) { const s = shells[i]; s.t += dt; s.vy -= 9.8 * dt; s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt; s.m.rotation.x += dt * 15; if (s.m.position.y < 0.03) { s.m.position.y = 0.03; s.vy = -s.vy * 0.3; s.vx *= 0.5; s.vz *= 0.5; } if (s.t > 3) { L.scene.remove(s.m); shells.splice(i, 1); } }
  };
  L.clearAim = function () { for (const s of shells) L.scene.remove(s.m); shells.length = 0; showArc(false); };
})();
