/*
 * art.js — everything that is drawn: Bubu, gifts, reindeer, trees, houses…
 * Simple flat shapes (cheap to draw, friendly for small children). Emoji are
 * used only for the little surprise animals/toys.
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const Art = {};

  Art.COLORS = {
    red: '#e53935', yellow: '#fbc02d', blue: '#1e88e5', green: '#43a047',
    purple: '#8e44ad', orange: '#fb8c00', pink: '#ec407a', gold: '#ffc107'
  };
  Art.SPARKS = ['#ffd54f', '#ffffff', '#ff8a80', '#80d8ff', '#b9f6ca'];

  // ------------------------------------------------------------ basics
  Art.star = function (c, x, y, R, r, n) {
    n = n || 5;
    c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n;
      const rad = i % 2 ? r : R;
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath();
    c.fill();
  };

  Art.roundRect = function (c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  };

  Art.emoji = function (c, ch, x, y, size) {
    c.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#000';          // opaque: some browsers apply the fill alpha to emoji
    c.fillText(ch, x, y);
  };

  /** Shapes used in the workshop: star, heart, circle, triangle. */
  Art.shape = function (c, type, x, y, s, color) {
    c.fillStyle = color || '#fff';
    if (type === 'star') Art.star(c, x, y, s, s * 0.45, 5);
    else if (type === 'circle') { c.beginPath(); c.arc(x, y, s * 0.8, 0, TAU); c.fill(); }
    else if (type === 'triangle') {
      c.beginPath(); c.moveTo(x, y - s * 0.9); c.lineTo(x + s, y + s * 0.75); c.lineTo(x - s, y + s * 0.75); c.closePath(); c.fill();
    } else if (type === 'heart') {
      c.beginPath();
      c.moveTo(x, y + s * 0.85);
      c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
      c.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.85);
      c.fill();
    }
  };

  // ------------------------------------------------------------ gift
  /**
   * A wrapped gift centered at (x, y). opts: { lid: 0..1 (open), shape, glow, ribbon }
   */
  Art.gift = function (c, x, y, s, color, opts) {
    opts = opts || {};
    const ribbon = opts.ribbon || (color === Art.COLORS.yellow || color === Art.COLORS.gold ? '#e53935' : '#ffd54f');
    const w = s, h = s * 0.8;
    if (opts.glow) {
      c.fillStyle = `rgba(255,240,150,${0.25 + 0.2 * Math.sin(E.time * 5)})`;
      c.beginPath(); c.arc(x, y, s * 0.95, 0, TAU); c.fill();
    }
    // box
    c.fillStyle = color;
    c.fillRect(x - w / 2, y - h / 2 + s * 0.12, w, h - s * 0.12);
    c.fillStyle = 'rgba(0,0,0,0.12)';
    c.fillRect(x, y - h / 2 + s * 0.12, w / 2, h - s * 0.12);
    c.fillStyle = ribbon;
    c.fillRect(x - s * 0.08, y - h / 2 + s * 0.12, s * 0.16, h - s * 0.12);
    if (opts.shape) Art.shape(c, opts.shape, x - w * 0.27, y + h * 0.14, s * 0.15, opts.shapeColor || '#fff');
    // lid (lifts up when opened)
    const lift = (opts.lid || 0) * s * 0.9;
    c.save();
    c.translate(x + (opts.lid || 0) * s * 0.8, y - h / 2 + s * 0.12 - lift);
    c.rotate((opts.lid || 0) * 0.9);
    c.globalAlpha *= 1 - (opts.lid || 0);
    c.fillStyle = color;
    c.fillRect(-w * 0.56, -s * 0.18, w * 1.12, s * 0.2);
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.fillRect(-w * 0.56, -s * 0.18, w * 1.12, s * 0.06);
    c.fillStyle = ribbon;
    c.fillRect(-s * 0.08, -s * 0.18, s * 0.16, s * 0.2);
    // bow
    c.beginPath();
    c.ellipse(-s * 0.16, -s * 0.27, s * 0.17, s * 0.1, -0.5, 0, TAU);
    c.ellipse(s * 0.16, -s * 0.27, s * 0.17, s * 0.1, 0.5, 0, TAU);
    c.fill();
    c.beginPath(); c.arc(0, -s * 0.2, s * 0.07, 0, TAU); c.fill();
    c.restore();
  };

  /** Empty outline of a gift (progress counter). */
  Art.giftSlot = function (c, x, y, s, filled, color) {
    if (filled) { Art.gift(c, x, y, s, color || Art.COLORS.red); return; }
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 3;
    c.setLineDash([7, 6]);
    c.strokeRect(x - s / 2, y - s * 0.4 + s * 0.08, s, s * 0.72);
    c.setLineDash([]);
  };

  /** Row of gift slots at the top center: shows how many are still needed. */
  Art.counter = function (c, n, total, colors) {
    const s = total > 10 ? 44 : 54, gap = s * 1.3;
    const w = gap * total + 30;
    const x0 = 800 - w / 2;
    c.fillStyle = 'rgba(11,26,58,0.55)';
    Art.roundRect(c, x0, 14, w, s + 34, 26);
    c.fill();
    for (let i = 0; i < total; i++) {
      Art.giftSlot(c, x0 + 15 + gap * (i + 0.5), 14 + (s + 34) / 2 + 4, s, i < n, colors ? colors[i] : null);
    }
  };

  // ------------------------------------------------------------ Bubu
  const bubuImg = new Image();
  bubuImg.src = 'assets/bubu.webp';
  Art.bubuImg = bubuImg;

  Art.hat = function (c, s) {
    c.save();
    c.translate(s * 0.05, -s * 0.36);
    c.rotate(0.28);
    c.fillStyle = '#d32f2f';
    c.beginPath();
    c.moveTo(-s * 0.26, 0);
    c.quadraticCurveTo(-s * 0.05, -s * 0.5, s * 0.34, -s * 0.36);
    c.lineTo(s * 0.26, 0);
    c.closePath();
    c.fill();
    c.fillStyle = '#fff';
    Art.roundRect(c, -s * 0.31, -s * 0.07, s * 0.62, s * 0.14, s * 0.07);
    c.fill();
    c.beginPath(); c.arc(s * 0.35, -s * 0.36, s * 0.08, 0, TAU); c.fill();
    c.restore();
  };

  /** Creates Bubu: she flies smoothly towards (tx, ty). */
  Art.makeBubu = function (x, y) {
    return {
      x, y, tx: x, ty: y, size: 140, dir: 1, hat: true, tilt: 0,
      flying: true, sleeping: false, carry: null, speed: 900, wave: false,
      moving: false,
      flyTo(tx, ty) { this.tx = tx; this.ty = ty; },
      arrived() { return E.dist(this.x, this.y, this.tx, this.ty) < 6; },
      update(dt) {
        const dx = this.tx - this.x, dy = this.ty - this.y;
        const d = Math.hypot(dx, dy);
        this.moving = d > 2;
        if (d > 0.5) {
          const step = Math.min(d, Math.max(160, Math.min(this.speed, d * 4)) * dt);
          this.x += dx / d * step;
          this.y += dy / d * step;
          if (Math.abs(dx) > 4) this.dir = dx > 0 ? 1 : -1;
        }
        const want = this.moving ? E.clamp(dx / 600, -0.25, 0.25) : 0;
        this.tilt += (want - this.tilt) * Math.min(1, dt * 8);
      },
      draw(c) {
        const s = this.size;
        const bob = this.flying && !this.sleeping ? Math.sin(E.time * 4) * 6 : 0;
        c.save();
        c.translate(this.x, this.y + bob);
        c.rotate(this.wave ? Math.sin(E.time * 6) * 0.15 : this.tilt);
        if (this.carry) {
          Art.gift(c, 0, s * 0.5, s * 0.45, this.carry.color, this.carry);
        }
        // wings (only while flying)
        if (this.flying && !this.sleeping) {
          const f = 0.35 + 0.65 * Math.abs(Math.sin(E.time * 22));
          c.fillStyle = 'rgba(225,240,255,0.65)';
          c.strokeStyle = 'rgba(255,255,255,0.9)';
          c.lineWidth = 2;
          for (const side of [-1, 1]) {
            c.save();
            c.translate(side * s * 0.3, -s * 0.22);
            c.rotate(side * -0.6);
            c.scale(1, f);
            c.beginPath(); c.ellipse(side * s * 0.18, 0, s * 0.3, s * 0.16, 0, 0, TAU);
            c.fill(); c.stroke();
            c.restore();
          }
        }
        c.scale(this.dir, 1);
        if (bubuImg.complete && bubuImg.naturalWidth) c.drawImage(bubuImg, -s / 2, -s / 2, s, s);
        else { c.fillStyle = '#e53935'; c.beginPath(); c.arc(0, 0, s * 0.45, 0, TAU); c.fill(); }
        if (this.hat) Art.hat(c, s);
        c.restore();
        if (this.sleeping) {
          c.fillStyle = '#fff';
          c.font = `800 ${s * 0.3}px ${E.font}`;
          c.textAlign = 'center';
          for (let i = 0; i < 3; i++) {
            const t = (E.time * 0.6 + i / 3) % 1;
            c.globalAlpha = 1 - t;
            c.fillText('z', this.x + s * 0.4 + t * 50, this.y - s * 0.4 - t * 90);
          }
          c.globalAlpha = 1;
        }
      }
    };
  };

  // ------------------------------------------------------------ scenery
  Art.sky = function (c, top, bottom) {
    const g = c.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, top || '#071233');
    g.addColorStop(1, bottom || '#24467f');
    c.fillStyle = g;
    c.fillRect(0, 0, 1600, 900);
    // fixed little stars (seeded so they are the same each redraw)
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    c.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 90; i++) {
      c.beginPath(); c.arc(rnd() * 1600, rnd() * 520, rnd() * 1.8 + 0.5, 0, TAU); c.fill();
    }
  };

  Art.moon = function (c, x, y, r) {
    c.fillStyle = 'rgba(255,250,220,0.15)';
    c.beginPath(); c.arc(x, y, r * 1.7, 0, TAU); c.fill();
    c.fillStyle = '#fff6d5';
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.06)';
    c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.2, 0, TAU); c.arc(x + r * 0.3, y + r * 0.3, r * 0.14, 0, TAU); c.fill();
  };

  Art.hills = function (c, y, color, amp, seedOff) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, 900);
    for (let x = 0; x <= 1600; x += 40) {
      c.lineTo(x, y + Math.sin(x / 210 + (seedOff || 0)) * amp + Math.sin(x / 90 + (seedOff || 0) * 2) * amp * 0.3);
    }
    c.lineTo(1600, 900);
    c.closePath();
    c.fill();
  };

  Art.pine = function (c, x, y, h, color, snow) {
    const w = h * 0.55;
    c.fillStyle = '#5d4037';
    c.fillRect(x - h * 0.05, y - h * 0.12, h * 0.1, h * 0.14);
    for (let i = 0; i < 3; i++) {
      const ty = y - h * 0.1 - i * h * 0.27;
      const tw = w * (1 - i * 0.24);
      c.fillStyle = color || '#1b5e3a';
      c.beginPath();
      c.moveTo(x - tw / 2, ty); c.lineTo(x + tw / 2, ty); c.lineTo(x, ty - h * 0.42); c.closePath();
      c.fill();
      if (snow !== false) {
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.beginPath();
        c.moveTo(x - tw * 0.18, ty - h * 0.3); c.lineTo(x, ty - h * 0.42); c.lineTo(x + tw * 0.18, ty - h * 0.3);
        c.quadraticCurveTo(x, ty - h * 0.26, x - tw * 0.18, ty - h * 0.3);
        c.fill();
      }
    }
  };

  Art.house = function (c, x, y, w, h, wall, roof) {
    c.fillStyle = wall;
    c.fillRect(x, y - h, w, h);
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(x - 18, y - h); c.lineTo(x + w / 2, y - h - w * 0.5); c.lineTo(x + w + 18, y - h); c.closePath(); c.fill();
    // snow on the roof
    c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(x - 18, y - h); c.lineTo(x + w / 2, y - h - w * 0.5); c.lineTo(x + w + 18, y - h);
    c.lineTo(x + w + 10, y - h + 10); c.lineTo(x + w / 2, y - h - w * 0.5 + 16); c.lineTo(x - 10, y - h + 10); c.closePath(); c.fill();
    // chimney
    c.fillStyle = '#8d4b3a';
    c.fillRect(x + w * 0.68, y - h - w * 0.42, w * 0.13, w * 0.25);
    // lit windows
    c.fillStyle = '#ffe082';
    const ww = w * 0.22;
    c.fillRect(x + w * 0.15, y - h * 0.7, ww, ww);
    c.fillRect(x + w * 0.63, y - h * 0.7, ww, ww);
    c.fillStyle = '#6d4c41';
    c.fillRect(x + w * 0.4, y - h * 0.45, w * 0.2, h * 0.45);
  };

  Art.snowman = function (c, x, y, s) {
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(x, y - s * 0.35, s * 0.38, 0, TAU); c.fill();
    c.beginPath(); c.arc(x, y - s * 0.95, s * 0.27, 0, TAU); c.fill();
    c.fillStyle = '#222';
    c.beginPath(); c.arc(x - s * 0.09, y - s * 1.0, s * 0.035, 0, TAU); c.arc(x + s * 0.09, y - s * 1.0, s * 0.035, 0, TAU); c.fill();
    c.fillStyle = '#ff7043';
    c.beginPath(); c.moveTo(x, y - s * 0.95); c.lineTo(x + s * 0.22, y - s * 0.92); c.lineTo(x, y - s * 0.89); c.fill();
    c.fillStyle = '#c62828';
    c.fillRect(x - s * 0.26, y - s * 0.74, s * 0.52, s * 0.08);
    c.fillStyle = '#263238';
    c.fillRect(x - s * 0.2, y - s * 1.32, s * 0.4, s * 0.12);
    c.fillRect(x - s * 0.13, y - s * 1.55, s * 0.26, s * 0.25);
  };

  Art.cloud = function (c, x, y, s, alpha) {
    c.fillStyle = `rgba(230,238,255,${alpha || 0.85})`;
    c.beginPath();
    c.arc(x, y, s * 0.5, 0, TAU);
    c.arc(x + s * 0.5, y - s * 0.2, s * 0.45, 0, TAU);
    c.arc(x + s * 1.0, y, s * 0.4, 0, TAU);
    c.arc(x + s * 0.5, y + s * 0.15, s * 0.45, 0, TAU);
    c.fill();
  };

  /** Snow mound in the forest (may hide a gift). */
  Art.mound = function (c, x, y, w, h) {
    c.fillStyle = '#c5d6ef';
    c.beginPath(); c.ellipse(x, y, w / 2, h * 0.32, 0, 0, TAU); c.fill();
    c.fillStyle = '#eef4ff';
    c.beginPath();
    c.moveTo(x - w / 2, y);
    c.bezierCurveTo(x - w * 0.45, y - h * 1.05, x + w * 0.45, y - h * 1.05, x + w / 2, y);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.ellipse(x - w * 0.12, y - h * 0.55, w * 0.18, h * 0.16, -0.3, 0, TAU); c.fill();
  };

  // ------------------------------------------------------------ workshop / barn
  Art.sack = function (c, x, y, s, color, shape, open) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x - s * 0.35, y - s * 0.45);
    c.quadraticCurveTo(x - s * 0.75, y + s * 0.35, x - s * 0.45, y + s * 0.5);
    c.lineTo(x + s * 0.45, y + s * 0.5);
    c.quadraticCurveTo(x + s * 0.75, y + s * 0.35, x + s * 0.35, y - s * 0.45);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(x, y - s * 0.45, s * 0.38, s * 0.1, 0, 0, TAU); c.fill();
    if (open) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(x, y - s * 0.45, s * 0.3, s * 0.07, 0, 0, TAU); c.fill(); }
    // rope
    c.strokeStyle = '#ffe0a3';
    c.lineWidth = s * 0.05;
    c.beginPath(); c.moveTo(x - s * 0.36, y - s * 0.3); c.quadraticCurveTo(x, y - s * 0.22, x + s * 0.36, y - s * 0.3); c.stroke();
    if (shape) {
      c.fillStyle = 'rgba(255,255,255,0.95)';
      c.beginPath(); c.arc(x, y + s * 0.1, s * 0.27, 0, TAU); c.fill();
      Art.shape(c, shape, x, y + s * 0.12, s * 0.17, shape === 'heart' ? '#e53935' : shape === 'star' ? '#f9a825' : shape === 'circle' ? '#1e88e5' : '#43a047');
    }
  };

  Art.carrot = function (c, x, y, s, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot || 0);
    c.fillStyle = '#fb8c00';
    c.beginPath(); c.moveTo(-s * 0.18, -s * 0.4); c.lineTo(s * 0.18, -s * 0.4); c.lineTo(0, s * 0.5); c.closePath(); c.fill();
    c.strokeStyle = '#e65100'; c.lineWidth = s * 0.04;
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.15); c.lineTo(0, -s * 0.13); c.moveTo(s * 0.08, s * 0.08); c.lineTo(0, s * 0.1); c.stroke();
    c.fillStyle = '#43a047';
    c.beginPath(); c.ellipse(-s * 0.08, -s * 0.52, s * 0.06, s * 0.16, -0.4, 0, TAU); c.ellipse(s * 0.08, -s * 0.52, s * 0.06, s * 0.16, 0.4, 0, TAU); c.fill();
    c.restore();
  };

  /** Dots 1..5 arranged like on a dice (easier to recognize at a glance). */
  Art.dots = function (c, n, x, y, r, color) {
    const P = {
      1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]
    }[n] || [];
    c.fillStyle = color || '#c62828';
    for (const [dx, dy] of P) { c.beginPath(); c.arc(x + dx * r * 2.3, y + dy * r * 2.3, r, 0, TAU); c.fill(); }
  };

  /** Reindeer head and neck, front view. tag = {dots|digit}. */
  Art.reindeer = function (c, x, y, s, fur, mood, nose, tag) {
    const dark = 'rgba(0,0,0,0.18)';
    // neck
    c.fillStyle = fur;
    c.fillRect(x - s * 0.22, y + s * 0.1, s * 0.44, s * 0.6);
    // antlers
    c.strokeStyle = '#8d6e63';
    c.lineWidth = s * 0.06;
    c.lineCap = 'round';
    for (const d of [-1, 1]) {
      c.beginPath();
      c.moveTo(x + d * s * 0.16, y - s * 0.42);
      c.quadraticCurveTo(x + d * s * 0.3, y - s * 0.75, x + d * s * 0.5, y - s * 0.9);
      c.moveTo(x + d * s * 0.26, y - s * 0.62); c.lineTo(x + d * s * 0.46, y - s * 0.62);
      c.moveTo(x + d * s * 0.36, y - s * 0.78); c.lineTo(x + d * s * 0.36, y - s * 1.0);
      c.stroke();
    }
    // ears
    c.fillStyle = fur;
    for (const d of [-1, 1]) {
      c.beginPath(); c.ellipse(x + d * s * 0.38, y - s * 0.28, s * 0.16, s * 0.07, d * 0.5, 0, TAU); c.fill();
    }
    // head
    c.beginPath(); c.ellipse(x, y - s * 0.12, s * 0.32, s * 0.38, 0, 0, TAU); c.fill();
    c.fillStyle = '#efdcc5';
    c.beginPath(); c.ellipse(x, y + s * 0.1, s * 0.22, s * 0.18, 0, 0, TAU); c.fill();
    // eyes
    c.fillStyle = '#1b1b1b';
    if (mood === 'happy') {
      c.strokeStyle = '#1b1b1b'; c.lineWidth = s * 0.03;
      for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * s * 0.13, y - s * 0.18, s * 0.06, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    } else {
      for (const d of [-1, 1]) {
        c.beginPath(); c.arc(x + d * s * 0.13, y - s * 0.18, s * 0.055, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(x + d * s * 0.13 + s * 0.02, y - s * 0.2, s * 0.018, 0, TAU); c.fill();
        c.fillStyle = '#1b1b1b';
      }
    }
    // mouth
    c.strokeStyle = '#5d4037'; c.lineWidth = s * 0.025;
    c.beginPath();
    if (mood === 'munch') { c.ellipse(x, y + s * 0.18, s * 0.06, s * (0.02 + 0.03 * Math.abs(Math.sin(E.time * 12))), 0, 0, TAU); }
    else c.arc(x, y + s * 0.13, s * 0.08, 0.2 * Math.PI, 0.8 * Math.PI);
    c.stroke();
    // nose (glows red when the reindeer is happy)
    if (nose) {
      c.fillStyle = `rgba(255,60,60,${0.25 + 0.15 * Math.sin(E.time * 6)})`;
      c.beginPath(); c.arc(x, y + s * 0.02, s * 0.17, 0, TAU); c.fill();
    }
    c.fillStyle = nose ? '#ff1744' : '#4e342e';
    c.beginPath(); c.ellipse(x, y + s * 0.02, s * 0.075, s * 0.06, 0, 0, TAU); c.fill();
    // collar + tag
    c.fillStyle = '#c62828';
    c.fillRect(x - s * 0.24, y + s * 0.36, s * 0.48, s * 0.09);
    c.fillStyle = dark;
    c.fillRect(x - s * 0.24, y + s * 0.42, s * 0.48, s * 0.03);
    if (tag) {
      c.fillStyle = '#ffd54f';
      c.beginPath(); c.arc(x, y + s * 0.56, s * 0.16, 0, TAU); c.fill();
      c.fillStyle = '#fff8e1';
      c.beginPath(); c.arc(x, y + s * 0.56, s * 0.13, 0, TAU); c.fill();
      if (tag.digit) {
        c.fillStyle = '#c62828';
        c.font = `800 ${s * 0.22}px ${E.font}`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(String(tag.digit), x, y + s * 0.575);
      } else Art.dots(c, tag.dots, x, y + s * 0.56, s * 0.022);
    }
  };

  Art.sleigh = function (c, x, y, s) {
    c.fillStyle = '#c62828';
    c.beginPath();
    c.moveTo(x - s * 0.5, y - s * 0.3);
    c.lineTo(x + s * 0.35, y - s * 0.3);
    c.quadraticCurveTo(x + s * 0.55, y - s * 0.3, x + s * 0.5, y);
    c.lineTo(x - s * 0.45, y);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffd54f';
    c.fillRect(x - s * 0.5, y - s * 0.34, s * 0.85, s * 0.06);
    c.strokeStyle = '#ffd54f';
    c.lineWidth = s * 0.04;
    c.beginPath();
    c.moveTo(x - s * 0.5, y + s * 0.12); c.lineTo(x + s * 0.5, y + s * 0.12);
    c.quadraticCurveTo(x + s * 0.68, y + s * 0.12, x + s * 0.62, y - s * 0.05);
    c.moveTo(x - s * 0.3, y); c.lineTo(x - s * 0.3, y + s * 0.12);
    c.moveTo(x + s * 0.3, y); c.lineTo(x + s * 0.3, y + s * 0.12);
    c.stroke();
  };

  // ------------------------------------------------------------ decorations (rewards)
  Art.DECOS = ['ball', 'cone', 'star', 'bell', 'lights'];
  Art.deco = function (c, type, x, y, s, lit) {
    if (type === 'ball') {
      c.fillStyle = '#ffd54f'; c.fillRect(x - s * 0.1, y - s * 0.55, s * 0.2, s * 0.12);
      const g = c.createRadialGradient(x - s * 0.15, y - s * 0.15, s * 0.05, x, y, s * 0.45);
      g.addColorStop(0, '#ff8a80'); g.addColorStop(1, '#c62828');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, s * 0.45, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(x - s * 0.15, y - s * 0.18, s * 0.1, s * 0.06, -0.6, 0, TAU); c.fill();
    } else if (type === 'cone') {
      c.fillStyle = '#c99700';
      c.beginPath(); c.ellipse(x, y, s * 0.28, s * 0.45, 0, 0, TAU); c.fill();
      c.fillStyle = '#ffd54f';
      for (let r = 0; r < 4; r++) for (let k = 0; k < 3 - (r % 2); k++) {
        const px = x + (k - (2 - (r % 2)) / 2) * s * 0.17, py = y - s * 0.3 + r * s * 0.19;
        c.beginPath(); c.ellipse(px, py, s * 0.08, s * 0.06, 0, 0, Math.PI); c.fill();
      }
      c.fillStyle = '#5d4037'; c.fillRect(x - s * 0.04, y - s * 0.58, s * 0.08, s * 0.14);
    } else if (type === 'star') {
      c.fillStyle = 'rgba(255,230,120,0.35)'; c.beginPath(); c.arc(x, y, s * 0.65, 0, TAU); c.fill();
      c.fillStyle = '#ffc107'; Art.star(c, x, y, s * 0.55, s * 0.24, 5);
      c.fillStyle = '#fff59d'; Art.star(c, x, y, s * 0.3, s * 0.13, 5);
    } else if (type === 'bell') {
      c.fillStyle = '#ffc107';
      c.beginPath();
      c.moveTo(x - s * 0.42, y + s * 0.3);
      c.quadraticCurveTo(x - s * 0.3, y + s * 0.2, x - s * 0.28, y - s * 0.1);
      c.quadraticCurveTo(x - s * 0.25, y - s * 0.45, x, y - s * 0.45);
      c.quadraticCurveTo(x + s * 0.25, y - s * 0.45, x + s * 0.28, y - s * 0.1);
      c.quadraticCurveTo(x + s * 0.3, y + s * 0.2, x + s * 0.42, y + s * 0.3);
      c.closePath(); c.fill();
      c.fillStyle = '#e6a100'; c.beginPath(); c.arc(x, y + s * 0.36, s * 0.1, 0, TAU); c.fill();
      c.fillStyle = '#c62828';
      c.beginPath(); c.ellipse(x - s * 0.13, y - s * 0.5, s * 0.14, s * 0.08, -0.4, 0, TAU); c.ellipse(x + s * 0.13, y - s * 0.5, s * 0.14, s * 0.08, 0.4, 0, TAU); c.fill();
    } else if (type === 'lights') {
      c.strokeStyle = '#2e7d32'; c.lineWidth = s * 0.04;
      c.beginPath(); c.moveTo(x - s * 0.6, y - s * 0.1); c.quadraticCurveTo(x, y + s * 0.35, x + s * 0.6, y - s * 0.1); c.stroke();
      const cols = ['#ff5252', '#ffd740', '#40c4ff', '#69f0ae', '#ff80ab'];
      for (let i = 0; i < 5; i++) {
        const t = i / 4, px = x - s * 0.6 + t * s * 1.2;
        const py = y - s * 0.1 + 4 * t * (1 - t) * s * 0.22 + s * 0.1;
        const on = lit === undefined || lit ? 1 : 0.4;
        c.globalAlpha = on;
        c.fillStyle = cols[i];
        c.beginPath(); c.ellipse(px, py, s * 0.08, s * 0.12, 0, 0, TAU); c.fill();
        c.globalAlpha = 1;
      }
    }
  };

  /** The big tree of the last stop. */
  Art.bigTree = function (c, x, y, h) {
    c.fillStyle = '#6d4c41';
    c.fillRect(x - h * 0.06, y - h * 0.1, h * 0.12, h * 0.12);
    const layers = 4;
    for (let i = 0; i < layers; i++) {
      const by = y - h * 0.08 - i * h * 0.2;
      const w = h * (0.78 - i * 0.16);
      c.fillStyle = i % 2 ? '#2e8b4f' : '#24784a';
      c.beginPath();
      c.moveTo(x - w / 2, by);
      c.quadraticCurveTo(x, by + h * 0.05, x + w / 2, by);
      c.lineTo(x, by - h * 0.34);
      c.closePath();
      c.fill();
    }
  };

  /**
   * Reindeer seen from the side, facing right, galloping (phase = time).
   * (x, y) is the middle of the body; s is the body length.
   */
  Art.reindeerSide = function (c, x, y, s, phase, redNose) {
    const fur = '#9c6236', dark = '#6d4022', light = '#e9d2b4';
    // legs (back pair, then front pair), swinging while galloping
    c.strokeStyle = dark;
    c.lineCap = 'round';
    c.lineWidth = s * 0.07;
    const legs = [[-0.3, 0], [-0.22, 1.6], [0.25, 3.1], [0.33, 4.7]];
    for (const [lx, off] of legs) {
      const a = Math.sin(phase * 9 + off) * 0.55;
      const hx = x + lx * s, hy = y + s * 0.1;
      const kx = hx + Math.sin(a) * s * 0.22, ky = hy + Math.cos(a) * s * 0.22;
      const fx = kx + Math.sin(a * 0.4 - 0.2) * s * 0.22, fy = ky + Math.cos(a * 0.4) * s * 0.2;
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    }
    // tail
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(x - s * 0.47, y - s * 0.1, s * 0.07, s * 0.05, -0.6, 0, Math.PI * 2); c.fill();
    // body
    c.fillStyle = fur;
    c.beginPath(); c.ellipse(x, y, s * 0.45, s * 0.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = light;
    c.beginPath(); c.ellipse(x + s * 0.02, y + s * 0.1, s * 0.32, s * 0.08, 0, 0, Math.PI * 2); c.fill();
    // neck
    c.fillStyle = fur;
    c.beginPath();
    c.moveTo(x + s * 0.22, y - s * 0.12);
    c.lineTo(x + s * 0.5, y - s * 0.48);
    c.lineTo(x + s * 0.64, y - s * 0.38);
    c.lineTo(x + s * 0.42, y + s * 0.05);
    c.closePath(); c.fill();
    // antlers
    c.strokeStyle = '#7a5a43';
    c.lineWidth = s * 0.035;
    c.beginPath();
    c.moveTo(x + s * 0.55, y - s * 0.55); c.quadraticCurveTo(x + s * 0.45, y - s * 0.8, x + s * 0.32, y - s * 0.85);
    c.moveTo(x + s * 0.47, y - s * 0.72); c.lineTo(x + s * 0.55, y - s * 0.86);
    c.moveTo(x + s * 0.4, y - s * 0.8); c.lineTo(x + s * 0.42, y - s * 0.95);
    c.stroke();
    // ear
    c.fillStyle = dark;
    c.beginPath(); c.ellipse(x + s * 0.5, y - s * 0.55, s * 0.08, s * 0.035, -0.5, 0, Math.PI * 2); c.fill();
    // head + snout
    c.fillStyle = fur;
    c.beginPath(); c.ellipse(x + s * 0.62, y - s * 0.5, s * 0.14, s * 0.1, 0.35, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x + s * 0.74, y - s * 0.44, s * 0.09, s * 0.065, 0.35, 0, Math.PI * 2); c.fill();
    // eye
    c.fillStyle = '#1b1b1b';
    c.beginPath(); c.arc(x + s * 0.63, y - s * 0.54, s * 0.022, 0, Math.PI * 2); c.fill();
    // nose (red and glowing for the leading reindeer)
    if (redNose) {
      c.fillStyle = `rgba(255,60,60,${0.25 + 0.15 * Math.sin(phase * 6)})`;
      c.beginPath(); c.arc(x + s * 0.82, y - s * 0.41, s * 0.09, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = redNose ? '#ff1744' : '#3e2723';
    c.beginPath(); c.arc(x + s * 0.82, y - s * 0.41, s * (redNose ? 0.045 : 0.035), 0, Math.PI * 2); c.fill();
    // harness with a little golden bell
    c.fillStyle = '#c62828';
    c.fillRect(x + s * 0.12, y - s * 0.2, s * 0.08, s * 0.4);
    c.fillStyle = '#ffd54f';
    c.beginPath(); c.arc(x + s * 0.16, y + s * 0.22, s * 0.045, 0, Math.PI * 2); c.fill();
  };

  window.Art = Art;
})();
