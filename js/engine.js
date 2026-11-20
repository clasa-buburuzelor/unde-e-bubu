/*
 * engine.js — canvas, game loop, input and shared effects.
 *
 * The game uses a logical stage of 1600 x 900 units, scaled so that it fits
 * the window: everything important stays inside it. To fill the whole screen
 * (no black bars), backgrounds are continued to the edges of the window:
 * E.view is the visible area in stage units (it can be wider or taller than
 * 1600 x 900). Scenes draw in these units and receive pointer events already
 * converted to them.
 *
 * Scene interface (all optional):
 *   enter(), leave(), update(dt), draw(ctx), down(x, y), move(x, y, pressed),
 *   hint() -> {x, y} | null   (where the helping hand should point)
 *
 * Performance (the game runs on old school computers): backgrounds are drawn
 * once into an offscreen canvas, snow is a single path, the loop stops when
 * the tab is hidden, and fewer particles are used with prefers-reduced-motion.
 */
(function () {
  'use strict';

  const W = 1600, H = 900;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const E = {
    W, H, ctx, reduced,
    scene: null,
    time: 0,            // seconds since start
    lastInput: 0,       // time of the last click (for the idle hand)
    scale: 1, ox: 0, oy: 0, dpr: 1,
    pointer: { x: W / 2, y: H / 2, pressed: false },
    font: '"Baloo 2", "Comic Sans MS", system-ui, sans-serif'
  };

  // ------------------------------------------------------------ helpers
  E.rand = (a, b) => a + Math.random() * (b - a);
  E.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  E.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  E.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  E.lerp = (a, b, t) => a + (b - a) * t;
  E.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  E.easeOutBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  E.easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // ------------------------------------------------------------ sizing
  const bgCache = new Map();
  function resize() {
    const cw = window.innerWidth, ch = window.innerHeight;
    E.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * E.dpr);
    canvas.height = Math.round(ch * E.dpr);
    E.scale = Math.min(cw / W, ch / H);
    E.ox = (cw - W * E.scale) / 2;
    E.oy = (ch - H * E.scale) / 2;
    E.view = { x: -E.ox / E.scale, y: -E.oy / E.scale, w: cw / E.scale, h: ch / E.scale };
    bgCache.clear();
  }
  window.addEventListener('resize', resize);
  resize();

  /** Fills the whole visible area (also outside the 1600 x 900 stage). */
  E.fillView = function (c) {
    const v = E.view;
    c.fillRect(v.x, v.y, v.w, v.h);
  };

  /**
   * Draws a static background once into an offscreen canvas, then reuses it.
   * Outside the stage, the first / last columns (and rows) of the background
   * are stretched to the edges of the screen: walls, floors and skies simply
   * continue, so there are no bars at the sides.
   */
  E.cachedBg = function (key, drawFn) {
    let off = bgCache.get(key);
    if (!off) {
      const k = E.scale * E.dpr;
      off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(W * k));
      off.height = Math.max(1, Math.round(H * k));
      const o = off.getContext('2d');
      o.setTransform(k, 0, 0, k, 0, 0);
      drawFn(o);
      bgCache.set(key, off);
    }
    ctx.drawImage(off, 0, 0, W, H);
    const v = E.view, ow = off.width, oh = off.height, e = 2;
    if (v.x < 0) {
      ctx.drawImage(off, 1, 0, e, oh, v.x, 0, -v.x + 0.5, H);
      ctx.drawImage(off, ow - 1 - e, 0, e, oh, W - 0.5, 0, v.x + v.w - W + 0.5, H);
    }
    if (v.y < 0) {
      ctx.drawImage(off, 0, 1, ow, e, 0, v.y, W, -v.y + 0.5);
      ctx.drawImage(off, 0, oh - 1 - e, ow, e, 0, H - 0.5, W, v.y + v.h - H + 0.5);
    }
  };

  // ------------------------------------------------------------ input
  function toStage(e) {
    return { x: (e.clientX - E.ox) / E.scale, y: (e.clientY - E.oy) / E.scale };
  }
  canvas.addEventListener('pointerdown', e => {
    const p = toStage(e);
    E.pointer.x = p.x; E.pointer.y = p.y; E.pointer.pressed = true;
    E.lastInput = E.time;
    E.hand.until = 0;
    if (E.scene && E.scene.down) E.scene.down(p.x, p.y);
  });
  canvas.addEventListener('pointermove', e => {
    const p = toStage(e);
    E.pointer.x = p.x; E.pointer.y = p.y;
    if (E.scene && E.scene.move) E.scene.move(p.x, p.y, E.pointer.pressed);
  });
  window.addEventListener('pointerup', () => { E.pointer.pressed = false; });
  window.addEventListener('pointercancel', () => { E.pointer.pressed = false; });

  // ------------------------------------------------------------ scenes
  E.go = function (scene) {
    if (E.scene && E.scene.leave) E.scene.leave();
    E.scene = scene;
    E.particles.length = 0;
    E.pops.length = 0;
    E.hand.until = 0;
    E.lastInput = E.time;
    if (scene.enter) scene.enter();
  };

  // ------------------------------------------------------------ snow
  const flakes = [];
  const FLAKES = reduced ? 25 : 70;
  for (let i = 0; i < FLAKES; i++) {
    flakes.push({ x: E.rand(0, W), y: E.rand(0, H), r: E.rand(2, 5.5), v: E.rand(30, 70), ph: E.rand(0, 6.28) });
  }
  E.snow = { on: true, wind: 0 };
  function drawSnow(dt) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    const v = E.view;
    for (const f of flakes) {
      f.y += f.v * dt;
      f.x += (Math.sin(E.time * 0.8 + f.ph) * 18 + E.snow.wind) * dt;
      if (f.y > v.y + v.h + 8) { f.y = v.y - 8; f.x = E.rand(v.x, v.x + v.w); }
      if (f.x > v.x + v.w + 8) f.x = v.x - 8; else if (f.x < v.x - 8) f.x = v.x + v.w + 8;
      ctx.moveTo(f.x + f.r, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // ------------------------------------------------------------ particles
  E.particles = [];
  /** Burst of little stars/dots. */
  E.burst = function (x, y, colors, n, speed) {
    n = reduced ? Math.ceil((n || 18) / 3) : (n || 18);
    for (let i = 0; i < n && E.particles.length < 260; i++) {
      const a = Math.random() * Math.PI * 2, s = E.rand(0.3, 1) * (speed || 320);
      E.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80,
        life: 0, max: E.rand(0.6, 1.1), size: E.rand(5, 11),
        color: Array.isArray(colors) ? E.pick(colors) : (colors || '#ffd54f'),
        star: Math.random() < 0.5
      });
    }
  };
  function drawParticles(dt) {
    for (let i = E.particles.length - 1; i >= 0; i--) {
      const p = E.particles[i];
      p.life += dt;
      if (p.life >= p.max) { E.particles.splice(i, 1); continue; }
      p.vy += 420 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - p.life / p.max;
      ctx.fillStyle = p.color;
      if (p.star) Art.star(ctx, p.x, p.y, p.size, p.size * 0.45, 5);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------ big popping numbers / emoji
  E.pops = [];
  /** Shows a big number (or emoji) that grows and fades: used for counting. */
  E.pop = function (text, x, y, opts) {
    E.pops.push(Object.assign({ text: String(text), x, y, t: 0, max: 1.3, size: 150, color: '#ffd23f' }, opts || {}));
  };
  function drawPops(dt) {
    for (let i = E.pops.length - 1; i >= 0; i--) {
      const p = E.pops[i];
      p.t += dt;
      if (p.t >= p.max) { E.pops.splice(i, 1); continue; }
      const k = p.t / p.max;
      const s = E.easeOutBack(Math.min(1, p.t / 0.35));
      ctx.save();
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      ctx.translate(p.x, p.y - k * 60);
      ctx.scale(s, s);
      ctx.font = `800 ${p.size}px ${E.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!p.emoji) {
        ctx.lineWidth = p.size * 0.12;
        ctx.strokeStyle = '#7a1010';
        ctx.lineJoin = 'round';
        ctx.strokeText(p.text, 0, 0);
        ctx.fillStyle = p.color;
      }
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------ helping hand
  // A pointing hand that taps a target: the children cannot read, so this is
  // how every stop explains itself (at the start and after 8 idle seconds).
  E.hand = { x: 0, y: 0, until: 0, start: 0 };
  E.IDLE_HINT = 8;
  // from: optional {x, y} — the hand then slides from there to (x, y)
  // ("move the mouse like this") instead of tapping.
  E.showHand = function (x, y, seconds, from) {
    E.hand.x = x; E.hand.y = y;
    E.hand.from = from || null;
    E.hand.start = E.time;
    E.hand.until = E.time + (seconds || 3);
  };
  E.help = function () {
    const h = E.scene && E.scene.hint && E.scene.hint();
    if (h) E.showHand(h.x, h.y, h.from ? 4 : 3.2, h.from);
  };
  function drawHand() {
    if (E.time > E.hand.until) {
      if (E.scene && E.scene.hint && E.time - E.lastInput > E.IDLE_HINT) {
        E.lastInput = E.time;           // repeat every IDLE_HINT seconds
        E.help();
      }
      if (E.time > E.hand.until) return;
    }
    const t = E.time - E.hand.start;
    let tap = (Math.sin(t * 6) + 1) / 2;            // 0..1, tapping motion
    let { x, y } = E.hand;
    const fade = Math.min(1, t * 4, (E.hand.until - E.time) * 3);
    ctx.save();
    ctx.globalAlpha = fade;
    if (E.hand.from) {
      // sliding hand: from -> target, again and again, with a dotted trail
      const k = E.easeInOut(Math.min(1, (t % 1.8) / 1.3));
      const fx = E.hand.from.x, fy = E.hand.from.y;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 6;
      ctx.setLineDash([4, 14]);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(E.lerp(fx, x, k), E.lerp(fy, y, k)); ctx.stroke();
      ctx.setLineDash([]);
      x = E.lerp(fx, x, k); y = E.lerp(fy, y, k);
      tap = 1;
    }
    // ring where the finger touches
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (!E.hand.from) { ctx.arc(x, y, 20 + (1 - tap) * 36, 0, Math.PI * 2); ctx.stroke(); }
    // the hand: emoji, fingertip on the target
    ctx.font = '110px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.fillText('👆', x + 12, y - 8 + tap * 26);
    ctx.restore();
  }

  // ------------------------------------------------------------ loop
  let last = performance.now();
  let raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    E.time += dt;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b1a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const k = E.scale * E.dpr;
    ctx.setTransform(k, 0, 0, k, E.ox * E.dpr, E.oy * E.dpr);
    ctx.save();

    const s = E.scene;
    if (s) {
      if (s.update) s.update(dt);
      if (s.draw) s.draw(ctx);
    }
    if (E.snow.on) drawSnow(dt);
    if (s && s.drawTop) s.drawTop(ctx);
    drawParticles(dt);
    drawPops(dt);
    drawHand();
    ctx.restore();
  }
  E.start = function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  E.stop = function () { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => { document.hidden ? E.stop() : E.start(); });

  window.E = E;
})();
