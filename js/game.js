/*
 * game.js — Unde e Bubu?
 *
 * Hide and seek at Christmas, in eight places, inside and outside in turn:
 * the room with the tree, the snowy forest, the kitchen, the village square,
 * Santa's workshop, the frozen lake, the reindeer stable and the North Pole.
 * It snows only in the outdoor places. In each place Bubu hides 3 times behind
 * one of the things there; the child clicks on things: a little friend peeks
 * out of the empty places, Bubu giggles and jumps out when found.
 * 8 places x 3 rounds = 24 rounds (about 7-8 minutes).
 *
 * Made for 6-year-olds after one computer lesson: only clicks, big targets,
 * no mistakes, nothing to read, no voice, no pointing hand. As soon as the
 * lights come back on, Bubu peeks out of her hiding place: her red hat and the
 * top of her head show (always, from the first moment: a delayed clue
 * confused the children).
 */
(function () {
  'use strict';

  const PER_SCENE = 3;               // rounds in each place
  const WINDOW = { x: 1060, y: 110, w: 320, h: 320 };
  const Game = {};

  // ------------------------------------------------------------ the hiding places
  // hit: clickable rectangle · from/to: where the hidden one waits / peeks out
  // (it is drawn BEFORE the object, so it comes out from behind it) ·
  // tip: where Bubu peeks out while hiding (see drawBubuPeek).
  function roomPlaces() {
    return [
      {
        id: 'curtain', noShadow: true, hit: { x: 985, y: 95, w: 120, h: 390 },
        from: { x: 1045, y: 300 }, to: { x: 1160, y: 300 }, tip: { x: 1082, y: 320, a: 0 },
        draw(c) {
          c.fillStyle = '#b71c1c';
          c.beginPath();
          c.moveTo(990, 100); c.lineTo(1100, 100);
          c.quadraticCurveTo(1070, 300, 1095, 470);
          c.lineTo(990, 470);
          c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.18)';
          for (let x = 1010; x < 1090; x += 26) c.fillRect(x, 100, 9, 370);
          c.fillStyle = '#ffd54f';
          c.fillRect(988, 280, 100, 14);
        }
      },
      {
        id: 'snowman', hit: { x: 1190, y: 220, w: 160, h: 210 }, clip: WINDOW,
        from: { x: 1275, y: 360 }, to: { x: 1158, y: 330 }, tip: { x: 1228, y: 345, a: -2.4, s: 100 },
        draw(c) { Art.snowman(c, 1275, 428, 150); }
      },
      {
        id: 'stocking', noShadow: true, hit: { x: 585, y: 405, w: 120, h: 170 },
        from: { x: 640, y: 500 }, to: { x: 640, y: 350 }, tip: { x: 640, y: 424, a: -1.57, s: 80 },
        draw(c) {
          c.fillStyle = '#d32f2f';
          c.beginPath();
          c.moveTo(605, 440); c.lineTo(675, 440); c.lineTo(675, 520);
          c.quadraticCurveTo(700, 560, 660, 572); c.lineTo(600, 572);
          c.quadraticCurveTo(575, 560, 600, 535); c.lineTo(605, 520);
          c.closePath(); c.fill();
          c.fillStyle = '#fff';
          Art.roundRect(c, 597, 420, 86, 30, 12); c.fill();
          c.fillStyle = '#43a047';
          Art.star(c, 640, 505, 16, 7);
        }
      },
      {
        id: 'tree', hit: { x: 90, y: 280, w: 320, h: 570 },
        from: { x: 230, y: 650 }, to: { x: 95, y: 560 }, tip: { x: 325, y: 565, a: 0, s: 100 },
        draw(c) {
          Art.bigTree(c, 250, 850, 560);
          const balls = [[200, 440, '#e53935'], [300, 520, '#1e88e5'], [180, 620, '#fbc02d'], [330, 680, '#8e44ad'], [250, 360, '#43a047'], [140, 740, '#ec407a'], [280, 760, '#fb8c00']];
          for (const [x, y, col] of balls) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 15, 0, Math.PI * 2); c.fill(); }
          c.fillStyle = '#ffc107';
          Art.star(c, 250, 300, 40, 17);
        }
      },
      {
        id: 'armchair', hit: { x: 1170, y: 540, w: 240, h: 300 },
        from: { x: 1290, y: 660 }, to: { x: 1290, y: 500 }, tip: { x: 1290, y: 566, a: -1.6 },
        draw(c) {
          c.fillStyle = '#2e6b8f';
          Art.roundRect(c, 1195, 560, 190, 200, 40); c.fill();          // backrest
          c.fillStyle = '#245a78';
          Art.roundRect(c, 1180, 700, 220, 90, 26); c.fill();           // seat
          c.fillStyle = '#2e6b8f';
          Art.roundRect(c, 1165, 660, 50, 140, 22); c.fill();           // arms
          Art.roundRect(c, 1365, 660, 50, 140, 22); c.fill();
          c.fillStyle = '#4e342e';
          c.fillRect(1190, 790, 16, 40); c.fillRect(1374, 790, 16, 40);
          c.fillStyle = '#ffcc80';                                       // cushion
          Art.roundRect(c, 1240, 640, 100, 70, 20); c.fill();
        }
      },
      {
        id: 'basket', hit: { x: 745, y: 690, w: 210, h: 160 },
        from: { x: 850, y: 790 }, to: { x: 850, y: 650 }, tip: { x: 880, y: 722, a: -1.5 },
        draw(c) {
          // toys sticking out
          c.fillStyle = '#e53935'; c.beginPath(); c.arc(800, 720, 30, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#fff'; c.fillRect(772, 714, 56, 10);
          c.fillStyle = '#fbc02d'; c.beginPath(); c.arc(890, 716, 26, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#1e88e5'; c.fillRect(838, 690, 26, 50);
          // the basket
          c.fillStyle = '#b07a3f';
          c.beginPath(); c.moveTo(755, 730); c.lineTo(945, 730); c.lineTo(920, 845); c.lineTo(780, 845); c.closePath(); c.fill();
          c.strokeStyle = '#8a5a2b'; c.lineWidth = 6;
          for (let y = 755; y < 845; y += 25) { c.beginPath(); c.moveTo(760 + (y - 730) * 0.2, y); c.lineTo(940 - (y - 730) * 0.2, y); c.stroke(); }
          c.fillStyle = '#c99256'; Art.roundRect(c, 745, 718, 210, 24, 12); c.fill();
        }
      },
      {
        id: 'gift', hit: { x: 395, y: 670, w: 175, h: 180 },
        from: { x: 482, y: 770 }, to: { x: 482, y: 620 }, tip: { x: 440, y: 702, a: -1.7 },
        draw(c) { Art.gift(c, 482, 775, 165, '#43a047'); }
      },
      {
        id: 'pile', hit: { x: 1430, y: 590, w: 165, h: 260 },
        from: { x: 1510, y: 740 }, to: { x: 1510, y: 560 }, tip: { x: 1440, y: 800, a: 3.14 },
        draw(c) {
          Art.gift(c, 1510, 800, 140, '#1e88e5');
          Art.gift(c, 1500, 702, 105, '#e53935');
          Art.gift(c, 1515, 628, 75, '#fbc02d');
        }
      }
    ];
  }

  // ------------------------------------------------------------ the room (static, drawn once)
  function drawRoom(o) {
    // wall with a soft wallpaper pattern
    o.fillStyle = '#7d3434'; o.fillRect(0, 0, 1600, 650);
    o.fillStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < 1600; x += 80) for (let y = 30; y < 650; y += 80) Art.star(o, x + ((y / 80) % 2) * 40, y, 10, 4);
    o.fillStyle = 'rgba(255,255,255,0.035)';
    for (let x = 0; x < 1600; x += 120) o.fillRect(x, 0, 60, 650);
    // window: night outside, snow on the ground
    const W = WINDOW;
    const g = o.createLinearGradient(0, W.y, 0, W.y + W.h);
    g.addColorStop(0, '#0b1a3a'); g.addColorStop(1, '#2a4c8f');
    o.fillStyle = g; o.fillRect(W.x, W.y, W.w, W.h);
    o.fillStyle = '#fff';
    for (let i = 0; i < 24; i++) { o.beginPath(); o.arc(W.x + 10 + (i * 67) % 300, W.y + 10 + (i * 41) % 230, 2.5, 0, 6.3); o.fill(); }
    Art.moon(o, W.x + 70, W.y + 60, 26);
    o.fillStyle = '#eef4ff'; o.fillRect(W.x, W.y + W.h - 40, W.w, 40);
    // fireplace
    o.fillStyle = '#8d6e63'; o.fillRect(540, 400, 320, 250);
    o.fillStyle = '#6d4c41';
    for (let y = 410; y < 650; y += 30) for (let x = 545 + ((y / 30) % 2) * 25; x < 855; x += 50) o.fillRect(x, y, 44, 24);
    o.fillStyle = '#1b0f0a'; Art.roundRect(o, 610, 480, 180, 170, 60); o.fill();
    o.fillStyle = '#5d4037'; o.fillRect(520, 385, 360, 30);           // mantle
    // candles on the mantle
    for (const x of [560, 840]) { o.fillStyle = '#fff3e0'; o.fillRect(x - 8, 345, 16, 40); o.fillStyle = '#ffb300'; o.beginPath(); o.ellipse(x, 336, 6, 11, 0, 0, 6.3); o.fill(); }
    // floor and rug
    o.fillStyle = '#a8794e'; o.fillRect(0, 650, 1600, 250);
    o.fillStyle = 'rgba(0,0,0,0.1)';
    for (let y = 690; y < 900; y += 45) o.fillRect(0, y, 1600, 3);
    o.fillStyle = '#c62828'; o.beginPath(); o.ellipse(840, 830, 360, 60, 0, 0, 6.3); o.fill();
    o.strokeStyle = '#ffd54f'; o.lineWidth = 6; o.beginPath(); o.ellipse(840, 830, 330, 48, 0, 0, 6.3); o.stroke();
    // garland along the top of the wall
    o.strokeStyle = '#2e7d32'; o.lineWidth = 16;
    o.beginPath(); o.moveTo(0, 30);
    for (let x = 0; x <= 1600; x += 200) o.quadraticCurveTo(x + 100, 95, x + 200, 30);
    o.stroke();
    const bulbs = ['#ff5252', '#ffd740', '#40c4ff', '#69f0ae'];
    for (let i = 0; i < 16; i++) { o.fillStyle = bulbs[i % 4]; o.beginPath(); o.arc(i * 100 + 50, 30 + (i % 2 ? 4 : 32), 9, 0, 6.3); o.fill(); }
  }

  function drawFire(c) {
    const cols = ['#ff6d00', '#ffab00', '#ffd600'];
    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 3; k++) {
        const x = 650 + k * 50, h = (70 - i * 18) * (0.85 + 0.15 * Math.sin(E.time * 9 + k * 2 + i));
        c.fillStyle = cols[i];
        c.beginPath(); c.moveTo(x - 26 + i * 6, 645); c.quadraticCurveTo(x, 645 - h * 1.6, x + 26 - i * 6, 645); c.fill();
      }
    }
    c.fillStyle = '#4e342e'; c.fillRect(630, 638, 140, 12);
  }

  // Bubu with her hat (not flying: no wings)
  function drawBubu(c, x, y, size, wave) {
    c.save();
    c.translate(x, y);
    if (wave) c.rotate(Math.sin(E.time * 8) * 0.15);
    if (Art.bubuImg.complete && Art.bubuImg.naturalWidth) c.drawImage(Art.bubuImg, -size / 2, -size / 2, size, size);
    Art.hat(c, size);
    c.restore();
  }

  // ================================================================ the snowy forest
  function drawForest(o) {
    Art.sky(o, '#071233', '#2a4c8f');
    Art.moon(o, 1220, 250, 45);
    mountains(o, 470, '#7f9cc7');
    Art.hills(o, 470, '#9fb8dc', 30, 1);
    for (let i = 0; i < 12; i++) Art.pine(o, 40 + i * 140, 500 + (i % 3) * 10, 130 + (i % 3) * 30, '#1d4f45');
    o.fillStyle = '#e6eef9'; o.fillRect(0, 540, 1600, 360);
    Art.hills(o, 545, '#eef4ff', 14, 3);
    o.fillStyle = 'rgba(160,185,220,0.35)';
    for (let i = 0; i < 9; i++) { o.beginPath(); o.ellipse(100 + i * 180, 700 + (i % 2) * 90, 90, 14, 0, 0, 6.3); o.fill(); }
  }

  function forestPlaces() {
    return [
      {
        id: 'cabin', hit: { x: 1235, y: 370, w: 280, h: 260 },
        from: { x: 1375, y: 540 }, to: { x: 1375, y: 330 }, tip: { x: 1490, y: 560, a: 0 },
        draw(c) {
          c.fillStyle = '#8d5a33'; c.fillRect(1260, 470, 230, 150);
          c.strokeStyle = '#6d4022'; c.lineWidth = 4;
          for (let y = 490; y < 620; y += 26) { c.beginPath(); c.moveTo(1260, y); c.lineTo(1490, y); c.stroke(); }
          c.fillStyle = '#5d3a22'; c.fillRect(1430, 400, 30, 60);                // chimney
          c.fillStyle = '#fff';
          c.beginPath(); c.moveTo(1235, 480); c.lineTo(1375, 380); c.lineTo(1515, 480); c.closePath(); c.fill();
          c.fillStyle = '#ffe082'; c.fillRect(1290, 510, 60, 50);                // window
          c.fillStyle = '#5d3a22'; c.fillRect(1395, 525, 60, 95);                // door
        }
      },
      {
        id: 'birdhouse', noShadow: true, hit: { x: 925, y: 235, w: 170, h: 370 },
        from: { x: 1010, y: 360 }, to: { x: 1010, y: 195 }, tip: { x: 1080, y: 360, a: 0, s: 100 },
        draw(c) {
          c.fillStyle = '#6d4c41'; c.fillRect(1000, 400, 20, 210);
          c.fillStyle = '#c0392b'; c.fillRect(940, 300, 140, 115);
          c.fillStyle = '#3e2723'; c.beginPath(); c.arc(1010, 350, 20, 0, 6.3); c.fill();
          c.fillStyle = '#fff';
          c.beginPath(); c.moveTo(925, 305); c.lineTo(1010, 240); c.lineTo(1095, 305); c.closePath(); c.fill();
        }
      },
      {
        id: 'rock', hit: { x: 1050, y: 545, w: 200, h: 125 },
        from: { x: 1150, y: 640 }, to: { x: 1150, y: 500 }, tip: { x: 1150, y: 562, a: -1.57 },
        draw(c) {
          c.fillStyle = '#78909c';
          c.beginPath(); c.moveTo(1055, 665); c.quadraticCurveTo(1045, 570, 1125, 555); c.quadraticCurveTo(1235, 545, 1250, 665); c.closePath(); c.fill();
          c.fillStyle = '#fff';
          c.beginPath(); c.moveTo(1075, 590); c.quadraticCurveTo(1125, 540, 1225, 585); c.quadraticCurveTo(1155, 575, 1075, 590); c.fill();
        }
      },
      {
        id: 'stump', hit: { x: 700, y: 585, w: 140, h: 105 },
        from: { x: 770, y: 660 }, to: { x: 770, y: 540 }, tip: { x: 775, y: 600, a: -1.57, s: 100 },
        draw(c) {
          c.fillStyle = '#795548'; c.fillRect(710, 610, 120, 75);
          c.fillStyle = '#d7b38c'; c.beginPath(); c.ellipse(770, 610, 60, 16, 0, 0, 6.3); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(760, 604, 48, 10, 0, 0, 6.3); c.fill();
        }
      },
      {
        id: 'pine', hit: { x: 70, y: 300, w: 320, h: 570 },
        from: { x: 230, y: 650 }, to: { x: 85, y: 560 }, tip: { x: 322, y: 775, a: 0, s: 100 },
        draw(c) { Art.pine(c, 230, 880, 560, '#1b5e3a'); }
      },
      {
        id: 'snowman', hit: { x: 510, y: 520, w: 180, h: 340 },
        from: { x: 600, y: 730 }, to: { x: 735, y: 720 }, tip: { x: 676, y: 800, a: -0.2, s: 100 },
        draw(c) { Art.snowman(c, 600, 860, 210); }
      },
      {
        id: 'sled', hit: { x: 840, y: 740, w: 240, h: 120 },
        from: { x: 955, y: 800 }, to: { x: 955, y: 680 }, tip: { x: 990, y: 752, a: -1.57 },
        draw(c) { Art.sleigh(c, 955, 830, 230); }
      },
      {
        id: 'mound', hit: { x: 1120, y: 715, w: 270, h: 145 },
        from: { x: 1255, y: 820 }, to: { x: 1255, y: 680 }, tip: { x: 1240, y: 745, a: -1.65 },
        draw(c) { Art.mound(c, 1255, 850, 280, 140); }
      }
    ];
  }

  // ================================================================ Santa's workshop
  function drawWorkshop(o) {
    o.fillStyle = '#8a5a3b'; o.fillRect(0, 0, 1600, 900);
    for (let x = 0; x < 1600; x += 80) { o.fillStyle = x % 160 ? '#94633f' : '#7f5235'; o.fillRect(x, 0, 78, 620); }
    o.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < 1600; x += 80) o.fillRect(x + 4, 0, 6, 620);
    // window with snow
    o.fillStyle = '#16305e'; o.fillRect(140, 120, 240, 200);
    o.fillStyle = '#fff'; for (let i = 0; i < 20; i++) { o.beginPath(); o.arc(150 + (i * 53) % 220, 130 + (i * 37) % 180, 3, 0, 6.3); o.fill(); }
    o.strokeStyle = '#5d3a22'; o.lineWidth = 14; o.strokeRect(140, 120, 240, 200);
    o.beginPath(); o.moveTo(260, 120); o.lineTo(260, 320); o.moveTo(140, 220); o.lineTo(380, 220); o.stroke();
    // shelf with toys
    o.fillStyle = '#5d3a22'; o.fillRect(520, 250, 520, 16);
    ['🧸', '🚂', '🪀', '🎺', '🪁', '🤖'].forEach((e, i) => Art.emoji(o, e, 560 + i * 88, 215, 56));
    // garland
    o.strokeStyle = '#2e7d32'; o.lineWidth = 14;
    o.beginPath(); o.moveTo(0, 40); for (let x = 0; x <= 1600; x += 200) o.quadraticCurveTo(x + 100, 100, x + 200, 40); o.stroke();
    // floor
    o.fillStyle = '#c49a6c'; o.fillRect(0, 620, 1600, 280);
    o.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 660; y < 900; y += 50) o.fillRect(0, y, 1600, 4);
  }

  function workshopPlaces() {
    return [
      {
        id: 'cupboard', hit: { x: 1170, y: 170, w: 260, h: 460 },
        from: { x: 1300, y: 400 }, to: { x: 1495, y: 400 }, tip: { x: 1420, y: 330, a: 0, s: 110 },
        draw(c) {
          c.fillStyle = '#6d4c41'; c.fillRect(1180, 180, 240, 445);
          c.fillStyle = '#8d6e63'; c.fillRect(1192, 195, 104, 415); c.fillRect(1304, 195, 104, 415);
          c.fillStyle = '#ffd54f'; c.beginPath(); c.arc(1284, 410, 8, 0, 6.3); c.arc(1316, 410, 8, 0, 6.3); c.fill();
          c.fillStyle = '#5d4037'; c.fillRect(1170, 170, 260, 18);
        }
      },
      {
        id: 'table', hit: { x: 500, y: 470, w: 420, h: 240 },
        from: { x: 710, y: 620 }, to: { x: 710, y: 440 }, tip: { x: 690, y: 542, a: -1.57 },
        draw(c) {
          // things on the table
          c.fillStyle = '#e53935'; c.fillRect(560, 495, 50, 45);
          c.fillStyle = '#1e88e5'; c.beginPath(); c.arc(820, 515, 26, 0, 6.3); c.fill();
          // table with a checked tablecloth down to the floor
          c.fillStyle = '#fff'; c.fillRect(510, 540, 400, 165);
          c.fillStyle = '#e53935';
          for (let x = 510; x < 910; x += 40) for (let y = 540; y < 705; y += 40) if (((x - 510) / 40 + (y - 540) / 40) % 2 === 0) c.fillRect(x, y, 40, 40);
        }
      },
      {
        id: 'sack', hit: { x: 120, y: 580, w: 260, h: 280 },
        from: { x: 250, y: 720 }, to: { x: 250, y: 545 }, tip: { x: 250, y: 612, a: -1.57 },
        draw(c) { Art.sack(c, 250, 745, 300, '#a1887f'); }
      },
      {
        id: 'drum', hit: { x: 395, y: 715, w: 150, h: 145 },
        from: { x: 470, y: 800 }, to: { x: 470, y: 665 }, tip: { x: 470, y: 745, a: -1.57, s: 100 },
        draw(c) {
          c.fillStyle = '#c62828'; c.fillRect(405, 745, 130, 100);
          c.strokeStyle = '#ffd54f'; c.lineWidth = 5;
          c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(405 + i * 43, 745); c.lineTo(405 + i * 43 + 43, 845); } c.stroke();
          c.fillStyle = '#f5f5f5'; c.beginPath(); c.ellipse(470, 745, 65, 18, 0, 0, 6.3); c.fill();
          c.fillStyle = '#ffd54f'; c.fillRect(405, 838, 130, 10);
        }
      },
      {
        id: 'chest', hit: { x: 930, y: 660, w: 240, h: 195 },
        from: { x: 1050, y: 760 }, to: { x: 1050, y: 600 }, tip: { x: 1050, y: 690, a: -1.57 },
        draw(c) {
          c.fillStyle = '#8d5a33'; c.fillRect(945, 720, 210, 125);
          c.fillStyle = '#a66b3d';
          c.beginPath(); c.moveTo(945, 725); c.quadraticCurveTo(1050, 650, 1155, 725); c.closePath(); c.fill();
          c.fillStyle = '#ffc107'; c.fillRect(985, 690, 14, 155); c.fillRect(1101, 690, 14, 155);
          c.fillRect(1037, 735, 26, 30);
        }
      },
      {
        id: 'boxes', hit: { x: 1430, y: 580, w: 165, h: 280 },
        from: { x: 1510, y: 740 }, to: { x: 1510, y: 520 }, tip: { x: 1452, y: 720, a: 3.14, s: 100 },
        draw(c) {
          const box = (x, y, w, h) => {
            c.fillStyle = '#c8a26b'; c.fillRect(x, y, w, h);
            c.fillStyle = '#a8834f'; c.fillRect(x, y + h / 2 - 5, w, 10);
            c.strokeStyle = '#8d6e3f'; c.lineWidth = 3; c.strokeRect(x, y, w, h);
          };
          box(1440, 760, 150, 90);
          box(1452, 680, 125, 80);
          box(1465, 615, 100, 65);
        }
      }
    ];
  }

  // ================================================================ the kitchen
  function drawKitchen(o) {
    o.fillStyle = '#f3e3c3'; o.fillRect(0, 0, 1600, 640);
    // wallpaper with little hearts
    for (let x = 30; x < 1600; x += 90) for (let y = 40; y < 360; y += 90) Art.shape(o, 'heart', x + ((y - 40) / 90 % 2) * 45, y, 9, 'rgba(229,57,53,0.13)');
    // tiles behind the counter
    o.fillStyle = '#e8d2a8';
    for (let x = 0; x < 1600; x += 60) for (let y = 360; y < 640; y += 60) if ((x / 60 + y / 60) % 2 === 0) o.fillRect(x, y, 60, 60);
    // window with snow
    o.fillStyle = '#16305e'; o.fillRect(620, 110, 260, 190);
    o.fillStyle = '#fff'; for (let i = 0; i < 18; i++) { o.beginPath(); o.arc(630 + (i * 61) % 240, 120 + (i * 43) % 170, 3, 0, 6.3); o.fill(); }
    o.strokeStyle = '#fff'; o.lineWidth = 12; o.strokeRect(620, 110, 260, 190);
    o.beginPath(); o.moveTo(750, 110); o.lineTo(750, 300); o.stroke();
    // counter along the wall
    o.fillStyle = '#8d6e63'; o.fillRect(0, 520, 1600, 120);
    o.fillStyle = '#5d4037'; o.fillRect(0, 505, 1600, 20);
    // gingerbread cookies on the counter
    o.fillStyle = '#b5651d';
    for (const x of [950, 1010]) { o.beginPath(); o.arc(x, 480, 18, 0, 6.3); o.fill(); o.fillRect(x - 14, 490, 28, 14); }
    // checked floor
    for (let x = 0; x < 1600; x += 80) for (let y = 640; y < 900; y += 65) {
      o.fillStyle = (x / 80 + Math.round((y - 640) / 65)) % 2 ? '#d9534f' : '#fdf3e7'; o.fillRect(x, y, 80, 65);
    }
    // garland
    o.strokeStyle = '#2e7d32'; o.lineWidth = 14;
    o.beginPath(); o.moveTo(0, 40); for (let x = 0; x <= 1600; x += 200) o.quadraticCurveTo(x + 100, 100, x + 200, 40); o.stroke();
  }

  function kitchenPlaces() {
    return [
      {
        id: 'cabinet', noShadow: true, hit: { x: 130, y: 110, w: 300, h: 230 },
        from: { x: 280, y: 225 }, to: { x: 480, y: 225 }, tip: { x: 420, y: 220, a: 0, s: 100 },
        draw(c) {
          c.fillStyle = '#a1887f'; c.fillRect(140, 120, 280, 210);
          c.fillStyle = '#bcaaa4'; c.fillRect(152, 132, 124, 186); c.fillRect(284, 132, 124, 186);
          c.fillStyle = '#5d4037'; c.beginPath(); c.arc(262, 225, 7, 0, 6.3); c.arc(298, 225, 7, 0, 6.3); c.fill();
        }
      },
      {
        id: 'fridge', hit: { x: 1250, y: 170, w: 200, h: 480 },
        from: { x: 1350, y: 400 }, to: { x: 1515, y: 400 }, tip: { x: 1440, y: 300, a: 0 },
        draw(c) {
          c.fillStyle = '#eceff1'; Art.roundRect(c, 1260, 180, 180, 465, 22); c.fill();
          c.fillStyle = '#cfd8dc'; c.fillRect(1260, 370, 180, 8);
          c.fillStyle = '#90a4ae'; c.fillRect(1280, 260, 12, 70); c.fillRect(1280, 410, 12, 90);
          Art.emoji(c, '⛄', 1370, 290, 40);
        }
      },
      {
        id: 'pot', noShadow: true, hit: { x: 560, y: 360, w: 240, h: 160 },
        from: { x: 680, y: 450 }, to: { x: 680, y: 310 }, tip: { x: 700, y: 392, a: -1.57, s: 110 },
        draw(c) {
          c.fillStyle = '#455a64'; c.fillRect(580, 400, 200, 110);
          c.fillStyle = '#607d8b'; c.fillRect(570, 392, 220, 18);
          c.fillRect(548, 420, 30, 14); c.fillRect(782, 420, 30, 14);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(590, 410, 18, 90);
        },
        anim(c) {
          c.fillStyle = 'rgba(255,255,255,0.5)';
          c.beginPath(); c.arc(640 + Math.sin(E.time * 2) * 6, 360, 16, 0, 6.3); c.arc(700, 345 + Math.sin(E.time * 2.5) * 6, 12, 0, 6.3); c.fill();
        }
      },
      {
        id: 'table', hit: { x: 140, y: 560, w: 420, h: 240 },
        from: { x: 350, y: 700 }, to: { x: 350, y: 510 }, tip: { x: 420, y: 574, a: -1.57 },
        draw(c) {
          c.fillStyle = '#795548'; c.beginPath(); c.ellipse(260, 560, 34, 14, 0, 0, 6.3); c.fill();   // plate
          c.fillStyle = '#b5651d'; c.beginPath(); c.arc(260, 548, 16, 0, 6.3); c.fill();
          c.fillStyle = '#c8e6c9'; c.fillRect(150, 570, 400, 220);
          c.fillStyle = '#43a047';
          for (let x = 150; x < 550; x += 40) c.fillRect(x, 570, 20, 220);
        }
      },
      {
        id: 'flour', hit: { x: 860, y: 640, w: 230, h: 220 },
        from: { x: 975, y: 760 }, to: { x: 975, y: 600 }, tip: { x: 990, y: 665, a: -1.57 },
        draw(c) {
          Art.sack(c, 975, 765, 230, '#f5f5f5');
          Art.emoji(c, '🌾', 975, 790, 50);
        }
      },
      {
        id: 'chair', hit: { x: 1150, y: 560, w: 170, h: 300 },
        from: { x: 1235, y: 700 }, to: { x: 1235, y: 520 }, tip: { x: 1240, y: 572, a: -1.57 },
        draw(c) {
          c.fillStyle = '#8d5a33';
          Art.roundRect(c, 1160, 570, 150, 150, 18); c.fill();
          c.fillStyle = '#a66b3d'; c.fillRect(1150, 715, 170, 30);
          c.fillStyle = '#6d4022'; c.fillRect(1160, 745, 16, 105); c.fillRect(1294, 745, 16, 105);
          c.fillStyle = '#ffcc80'; Art.roundRect(c, 1185, 600, 100, 90, 14); c.fill();
        }
      }
    ];
  }

  // ================================================================ the reindeer stable
  function drawStable(o) {
    o.fillStyle = '#6d4228'; o.fillRect(0, 0, 1600, 900);
    for (let x = 0; x < 1600; x += 100) { o.fillStyle = (x / 100) % 2 ? '#7a4b2e' : '#71452a'; o.fillRect(x, 0, 98, 640); }
    o.fillStyle = '#4e2f1c'; o.fillRect(0, 90, 1600, 30);
    o.fillStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < 1600; x += 100) o.fillRect(x + 6, 120, 8, 520);
    // window with the night outside
    o.fillStyle = '#0f2450'; o.fillRect(620, 170, 240, 170);
    Art.moon(o, 810, 215, 24);
    o.strokeStyle = '#3e2414'; o.lineWidth = 14; o.strokeRect(620, 170, 240, 170);
    // lantern
    o.fillStyle = '#ffe082'; o.beginPath(); o.arc(1000, 230, 26, 0, 6.3); o.fill();
    o.fillStyle = 'rgba(255,224,130,0.18)'; o.beginPath(); o.arc(1000, 230, 80, 0, 6.3); o.fill();
    // hay on the floor
    o.fillStyle = '#e8c56a'; o.fillRect(0, 640, 1600, 260);
    o.strokeStyle = '#c9a043'; o.lineWidth = 3;
    for (let i = 0; i < 160; i++) { const x = (i * 97) % 1600, y = 650 + (i * 53) % 240; o.beginPath(); o.moveTo(x, y); o.lineTo(x + 26, y - 8); o.stroke(); }
  }

  function stablePlaces() {
    return [
      {
        id: 'gate', hit: { x: 1240, y: 400, w: 260, h: 340 },
        from: { x: 1370, y: 560 }, to: { x: 1370, y: 360 }, tip: { x: 1420, y: 418, a: -1.57 },
        draw(c) {
          c.fillStyle = '#8d5a33'; c.fillRect(1250, 420, 240, 300);
          c.strokeStyle = '#5d3a22'; c.lineWidth = 8;
          c.strokeRect(1250, 420, 240, 300);
          c.beginPath(); c.moveTo(1250, 420); c.lineTo(1490, 720); c.moveTo(1490, 420); c.lineTo(1250, 720); c.stroke();
        }
      },
      {
        id: 'bales', hit: { x: 120, y: 520, w: 340, h: 340 },
        from: { x: 290, y: 690 }, to: { x: 290, y: 470 }, tip: { x: 300, y: 550, a: -1.57, s: 110 },
        draw(c) {
          const bale = (x, y) => {
            c.fillStyle = '#e6b94a'; c.fillRect(x, y, 160, 100);
            c.strokeStyle = '#b8892b'; c.lineWidth = 3;
            for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x, y + k * 20); c.lineTo(x + 160, y + k * 20); c.stroke(); }
            c.fillStyle = '#8d5a33'; c.fillRect(x + 40, y, 8, 100); c.fillRect(x + 112, y, 8, 100);
          };
          bale(130, 750); bale(290, 750); bale(210, 650); bale(210, 550);
        }
      },
      {
        id: 'barrel', hit: { x: 490, y: 620, w: 150, h: 230 },
        from: { x: 565, y: 740 }, to: { x: 565, y: 580 }, tip: { x: 565, y: 632, a: -1.57, s: 100 },
        draw(c) {
          c.fillStyle = '#8d5a33';
          c.beginPath(); c.moveTo(505, 640); c.quadraticCurveTo(490, 745, 505, 850); c.lineTo(625, 850); c.quadraticCurveTo(640, 745, 625, 640); c.closePath(); c.fill();
          c.fillStyle = '#455a64'; c.fillRect(498, 670, 134, 10); c.fillRect(495, 810, 140, 10);
          c.fillStyle = '#a66b3d'; c.beginPath(); c.ellipse(565, 640, 60, 14, 0, 0, 6.3); c.fill();
        }
      },
      {
        id: 'carrots', hit: { x: 660, y: 640, w: 210, h: 230 },
        from: { x: 765, y: 760 }, to: { x: 765, y: 600 }, tip: { x: 690, y: 680, a: -1.7, s: 100 },
        draw(c) {
          for (let i = 0; i < 4; i++) Art.carrot(c, 730 + i * 24, 650 - (i % 2) * 10, 70, -0.3 + i * 0.2);
          Art.sack(c, 765, 770, 210, '#ef6c00');
        }
      },
      {
        id: 'sleigh', hit: { x: 900, y: 680, w: 330, h: 190 },
        from: { x: 1050, y: 800 }, to: { x: 1050, y: 620 }, tip: { x: 990, y: 735, a: -1.57 },
        draw(c) { Art.sleigh(c, 1060, 840, 320); }
      },
      {
        id: 'haypile', hit: { x: 1400, y: 690, w: 200, h: 180 },
        from: { x: 1500, y: 800 }, to: { x: 1500, y: 640 }, tip: { x: 1500, y: 705, a: -1.65, s: 100 },
        draw(c) {
          c.fillStyle = '#e6b94a';
          c.beginPath(); c.moveTo(1405, 870); c.quadraticCurveTo(1430, 690, 1500, 700); c.quadraticCurveTo(1580, 690, 1600, 870); c.closePath(); c.fill();
          c.strokeStyle = '#b8892b'; c.lineWidth = 3;
          for (let i = 0; i < 12; i++) { const x = 1430 + (i * 37) % 150, y = 740 + (i * 23) % 110; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 22, y - 10); c.stroke(); }
        }
      }
    ];
  }

  // ================================================================ the North Pole
  function drawNorthPole(o) {
    const g = o.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0, '#061433'); g.addColorStop(1, '#1d4d7a');
    o.fillStyle = g; o.fillRect(0, 0, 1600, 900);
    mountains(o, 520, '#9fc3e6');
    // northern lights (soft)
    o.filter = 'blur(14px)';
    const bands = [['rgba(105,240,174,0.22)', 160], ['rgba(64,196,255,0.18)', 230], ['rgba(179,136,255,0.15)', 290]];
    for (const [col, y] of bands) {
      o.fillStyle = col;
      o.beginPath(); o.moveTo(0, y);
      for (let x = 0; x <= 1600; x += 100) o.lineTo(x, y + Math.sin(x / 180 + y) * 40);
      for (let x = 1600; x >= 0; x -= 100) o.lineTo(x, y + 70 + Math.sin(x / 150 + y) * 30);
      o.closePath(); o.fill();
    }
    o.filter = 'none';
    o.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { o.beginPath(); o.arc((i * 167) % 1600, (i * 71) % 420, 1.6, 0, 6.3); o.fill(); }
    Art.hills(o, 520, '#cfe3f7', 26, 2);
    o.fillStyle = '#eef6ff'; o.fillRect(0, 580, 1600, 320);
    Art.hills(o, 585, '#f7fbff', 12, 4);
    // the North Pole itself (red and white)
    for (let y = 300; y < 640; y += 40) { o.fillStyle = (y / 40) % 2 ? '#e53935' : '#fff'; o.fillRect(1530, y, 28, 40); }
    o.fillStyle = '#ffd54f'; o.beginPath(); o.arc(1544, 295, 18, 0, 6.3); o.fill();
  }

  function northPlaces() {
    return [
      {
        id: 'iceberg', hit: { x: 560, y: 360, w: 320, h: 260 },
        from: { x: 720, y: 520 }, to: { x: 720, y: 330 }, tip: { x: 790, y: 490, a: -0.58 },
        draw(c) {
          c.fillStyle = '#b3e5fc';
          c.beginPath(); c.moveTo(570, 610); c.lineTo(640, 420); c.lineTo(720, 380); c.lineTo(800, 450); c.lineTo(870, 610); c.closePath(); c.fill();
          c.fillStyle = '#e1f5fe';
          c.beginPath(); c.moveTo(640, 420); c.lineTo(720, 380); c.lineTo(700, 610); c.lineTo(610, 610); c.closePath(); c.fill();
        }
      },
      {
        id: 'igloo', hit: { x: 1090, y: 430, w: 380, h: 280 },
        from: { x: 1280, y: 600 }, to: { x: 1280, y: 400 }, tip: { x: 1300, y: 522, a: -1.57 },
        draw(c) {
          c.fillStyle = '#ffffff';
          c.beginPath(); c.arc(1280, 700, 180, Math.PI, 0); c.closePath(); c.fill();
          c.strokeStyle = '#b0cfe8'; c.lineWidth = 4;
          for (let r = 0; r < 3; r++) { c.beginPath(); c.arc(1280, 700, 180, Math.PI + 0.1, -0.1); c.stroke(); }
          for (const y of [640, 580]) { c.beginPath(); c.moveTo(1280 - Math.sqrt(180 * 180 - (700 - y) ** 2), y); c.lineTo(1280 + Math.sqrt(180 * 180 - (700 - y) ** 2), y); c.stroke(); }
          c.fillStyle = '#1b2a44'; c.beginPath(); c.arc(1280, 700, 55, Math.PI, 0); c.closePath(); c.fill();
        }
      },
      {
        id: 'blocks', hit: { x: 140, y: 520, w: 320, h: 270 },
        from: { x: 300, y: 680 }, to: { x: 300, y: 480 }, tip: { x: 300, y: 540, a: -1.57, s: 110 },
        draw(c) {
          const blk = (x, y) => { c.fillStyle = '#d6efff'; c.fillRect(x, y, 140, 80); c.strokeStyle = '#9cc9ea'; c.lineWidth = 4; c.strokeRect(x, y, 140, 80); };
          blk(160, 700); blk(300, 700); blk(230, 620); blk(230, 540);
        }
      },
      {
        id: 'mailbox', hit: { x: 870, y: 500, w: 160, h: 310 },
        from: { x: 950, y: 600 }, to: { x: 1075, y: 590 }, tip: { x: 1015, y: 590, a: 0, s: 100 },
        draw(c) {
          c.fillStyle = '#5d4037'; c.fillRect(940, 650, 20, 160);
          c.fillStyle = '#e53935'; Art.roundRect(c, 885, 520, 130, 140, 30); c.fill();
          c.fillStyle = '#b71c1c'; c.fillRect(905, 570, 90, 12);
          Art.emoji(c, '✉️', 950, 615, 40);
        }
      },
      {
        id: 'drift', hit: { x: 480, y: 720, w: 320, h: 150 },
        from: { x: 640, y: 830 }, to: { x: 640, y: 680 }, tip: { x: 640, y: 745, a: -1.57 },
        draw(c) { Art.mound(c, 640, 860, 320, 150); }
      },
      {
        id: 'giftpile', hit: { x: 1360, y: 680, w: 230, h: 190 },
        from: { x: 1470, y: 790 }, to: { x: 1470, y: 620 }, tip: { x: 1365, y: 815, a: 3.14, s: 100 },
        draw(c) {
          Art.gift(c, 1420, 820, 110, '#8e44ad');
          Art.gift(c, 1530, 825, 100, '#43a047');
          Art.gift(c, 1475, 735, 90, '#fb8c00');
        }
      }
    ];
  }


  // ================================================================ storybook look
  // Soft lights, a vignette and little details on every background, a dark
  // "drawn" outline around every hiding place and a soft shadow under it.

  function glow(o, x, y, r, color) {
    const g = o.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    o.fillStyle = g;
    o.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /** Fine grain over the whole picture (like paper / a photo). */
  function grain(o, alpha) {
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9000; i++) {
      o.fillStyle = i % 2 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      o.fillRect(rnd() * 1600, rnd() * 900, 2, 2);
    }
  }

  /** Wavy wood grain lines in a rectangle. */
  function woodGrain(o, x, y, w, h, vertical) {
    o.strokeStyle = 'rgba(0,0,0,0.07)';
    o.lineWidth = 2;
    const n = Math.floor((vertical ? w : h) / 14);
    for (let i = 0; i < n; i++) {
      o.beginPath();
      if (vertical) {
        const gx = x + 7 + i * 14;
        o.moveTo(gx, y);
        for (let t = 0; t <= h; t += 40) o.lineTo(gx + Math.sin((t + i * 37) / 60) * 3, y + t);
      } else {
        const gy = y + 7 + i * 14;
        o.moveTo(x, gy);
        for (let t = 0; t <= w; t += 40) o.lineTo(x + t, gy + Math.sin((t + i * 53) / 70) * 3);
      }
      o.stroke();
    }
  }

  /** Darker ceiling and floor edge (light coming from the middle of the room). */
  function roomLight(o, wallBottom) {
    const g = o.createLinearGradient(0, 0, 0, wallBottom);
    g.addColorStop(0, 'rgba(0,0,0,0.22)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.12)');
    o.fillStyle = g; o.fillRect(0, 0, 1600, wallBottom);
    const f = o.createLinearGradient(0, wallBottom, 0, 900);
    f.addColorStop(0, 'rgba(0,0,0,0.28)');
    f.addColorStop(0.25, 'rgba(0,0,0,0.05)');
    f.addColorStop(1, 'rgba(255,255,255,0.06)');
    o.fillStyle = f; o.fillRect(0, wallBottom, 1600, 900 - wallBottom);
  }

  function vignette(o) {
    const g = o.createRadialGradient(800, 450, 420, 800, 450, 1000);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(25,10,30,0.32)');
    o.fillStyle = g;
    o.fillRect(0, 0, 1600, 900);
  }

  function sparkles(o, y0, y1, n) {
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      o.fillStyle = i % 3 ? 'rgba(255,255,255,0.95)' : 'rgba(150,200,255,0.9)';
      Art.star(o, rnd() * 1600, y0 + rnd() * (y1 - y0), 4 + rnd() * 3, 1.5, 4);
    }
  }

  function mountains(o, base, color) {
    const peaks = [[120, 300], [380, 250], [640, 320], [900, 260], [1180, 300], [1450, 240]];
    for (const [x, h] of peaks) {
      o.fillStyle = color;
      o.beginPath(); o.moveTo(x - 260, base); o.lineTo(x, base - h); o.lineTo(x + 260, base); o.closePath(); o.fill();
      o.fillStyle = 'rgba(255,255,255,0.9)';
      o.beginPath(); o.moveTo(x - 60, base - h + 55); o.lineTo(x, base - h); o.lineTo(x + 60, base - h + 55);
      o.lineTo(x + 25, base - h + 45); o.lineTo(x, base - h + 62); o.lineTo(x - 25, base - h + 45); o.closePath(); o.fill();
    }
  }

  function decorRoom(o) {
    // baseboard, floor planks, window sill
    o.fillStyle = '#5a2424'; o.fillRect(0, 640, 1600, 14);
    const fg = o.createLinearGradient(0, 654, 0, 720);
    fg.addColorStop(0, 'rgba(0,0,0,0.25)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
    o.fillStyle = fg; o.fillRect(0, 654, 1600, 66);
    o.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 654, r = 0; y < 900; y += 45, r++) for (let x = (r % 2) * 110; x < 1600; x += 220) o.fillRect(x, y, 3, 45);
    o.fillStyle = '#f5f5f5'; o.fillRect(1045, 428, 350, 16);
    o.fillStyle = 'rgba(0,0,0,0.15)'; o.fillRect(1045, 444, 350, 6);
    // stars on the rug
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      o.fillStyle = '#ffd54f';
      Art.star(o, 840 + Math.cos(a) * 270, 830 + Math.sin(a) * 36, 10, 4);
    }
    // warm lights: fire, candles, garland bulbs
    glow(o, 700, 560, 430, 'rgba(255,150,50,0.22)');
    glow(o, 560, 336, 60, 'rgba(255,200,80,0.35)');
    glow(o, 840, 336, 60, 'rgba(255,200,80,0.35)');
    const bulbs = ['rgba(255,82,82,0.35)', 'rgba(255,215,64,0.35)', 'rgba(64,196,255,0.35)', 'rgba(105,240,174,0.35)'];
    for (let i = 0; i < 16; i++) glow(o, i * 100 + 50, 30 + (i % 2 ? 4 : 32), 30, bulbs[i % 4]);
    woodGrain(o, 0, 654, 1600, 246, false);
    roomLight(o, 650);
    grain(o, 0.035);
    vignette(o);
  }

  function decorForest(o) {
    glow(o, 1220, 250, 260, 'rgba(255,250,220,0.18)');
    sparkles(o, 560, 900, 70);
    // soft snow drifts in the corners
    o.fillStyle = '#ffffff';
    o.beginPath(); o.ellipse(-40, 900, 300, 90, 0, 0, Math.PI * 2); o.fill();
    o.beginPath(); o.ellipse(1640, 900, 300, 90, 0, 0, Math.PI * 2); o.fill();
    const sg = o.createLinearGradient(0, 540, 0, 900);
    sg.addColorStop(0, 'rgba(70,100,160,0.18)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = sg; o.fillRect(0, 540, 1600, 360);
    grain(o, 0.03);
    vignette(o);
  }

  function decorKitchen(o) {
    // curtain frill above the window
    o.fillStyle = '#e53935';
    for (let x = 610; x < 890; x += 40) { o.beginPath(); o.arc(x + 20, 112, 20, 0, Math.PI); o.fill(); }
    o.fillRect(605, 92, 290, 22);
    // jars on a shelf
    o.fillStyle = '#8d6e63'; o.fillRect(930, 270, 260, 14);
    [['#ef9a9a', 960], ['#fff59d', 1020], ['#a5d6a7', 1080], ['#90caf9', 1140]].forEach(([col, x]) => {
      o.fillStyle = col; Art.roundRect(o, x - 22, 210, 44, 60, 10); o.fill();
      o.fillStyle = '#e53935'; o.fillRect(x - 24, 202, 48, 12);
    });
    // gingerbread house on the counter
    o.fillStyle = '#b5651d'; o.fillRect(1090, 445, 100, 62);
    o.fillStyle = '#fff';
    o.beginPath(); o.moveTo(1078, 450); o.lineTo(1140, 400); o.lineTo(1202, 450); o.closePath(); o.fill();
    o.fillStyle = '#e53935'; o.fillRect(1128, 470, 24, 37);
    o.fillStyle = '#43a047'; o.beginPath(); o.arc(1108, 465, 7, 0, 6.3); o.arc(1172, 465, 7, 0, 6.3); o.fill();
    // hanging lamp over the table
    o.strokeStyle = '#5d4037'; o.lineWidth = 4;
    o.beginPath(); o.moveTo(500, 0); o.lineTo(500, 330); o.stroke();
    o.fillStyle = '#e53935';
    o.beginPath(); o.moveTo(450, 380); o.quadraticCurveTo(500, 300, 550, 380); o.closePath(); o.fill();
    glow(o, 500, 400, 280, 'rgba(255,220,120,0.3)');
    o.fillStyle = 'rgba(255,255,255,0.18)'; o.fillRect(0, 505, 1600, 5);      // shine on the counter
    roomLight(o, 640);
    grain(o, 0.03);
    vignette(o);
  }

  function decorWorkshop(o) {
    // bunting flags
    const cols = ['#e53935', '#fbc02d', '#43a047', '#1e88e5'];
    o.strokeStyle = '#5d3a22'; o.lineWidth = 3;
    o.beginPath(); o.moveTo(420, 120); o.quadraticCurveTo(800, 175, 1160, 120); o.stroke();
    for (let i = 0; i < 14; i++) {
      const t = (i + 0.5) / 14, x = 420 + t * 740, y = 120 + Math.sin(t * Math.PI) * 27;
      o.fillStyle = cols[i % 4];
      o.beginPath(); o.moveTo(x - 18, y); o.lineTo(x + 18, y); o.lineTo(x, y + 36); o.closePath(); o.fill();
    }
    // tools on the wall
    o.fillStyle = '#5d4037'; o.fillRect(1500, 220, 12, 110); o.fillStyle = '#90a4ae'; o.fillRect(1480, 210, 52, 26);
    o.fillStyle = '#5d4037'; o.fillRect(1460, 360, 90, 12);
    // lamp light and a rug
    glow(o, 260, 220, 260, 'rgba(180,210,255,0.15)');
    glow(o, 800, 380, 520, 'rgba(255,210,120,0.18)');
    o.fillStyle = '#2e7d32'; o.beginPath(); o.ellipse(760, 830, 420, 50, 0, 0, 6.3); o.fill();
    o.strokeStyle = '#ffd54f'; o.lineWidth = 5; o.beginPath(); o.ellipse(760, 830, 390, 38, 0, 0, 6.3); o.stroke();
    woodGrain(o, 0, 0, 1600, 620, true);
    woodGrain(o, 0, 620, 1600, 280, false);
    roomLight(o, 620);
    grain(o, 0.035);
    vignette(o);
  }

  function decorStable(o) {
    // wreath with a red bow
    o.strokeStyle = '#2e7d32'; o.lineWidth = 22;
    o.beginPath(); o.arc(380, 260, 55, 0, 6.3); o.stroke();
    o.fillStyle = '#e53935';
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; o.beginPath(); o.arc(380 + Math.cos(a) * 55, 260 + Math.sin(a) * 55, 6, 0, 6.3); o.fill(); }
    o.beginPath(); o.ellipse(362, 318, 18, 11, -0.4, 0, 6.3); o.ellipse(398, 318, 18, 11, 0.4, 0, 6.3); o.fill();
    // golden horseshoe above the window
    o.strokeStyle = '#ffc107'; o.lineWidth = 12; o.lineCap = 'round';
    o.beginPath(); o.arc(740, 130, 26, 0.15 * Math.PI, 0.85 * Math.PI, true); o.stroke();
    // lantern light
    glow(o, 1000, 230, 380, 'rgba(255,200,90,0.28)');
    const hg = o.createLinearGradient(0, 640, 0, 900);
    hg.addColorStop(0, 'rgba(120,70,20,0.25)'); hg.addColorStop(0.3, 'rgba(0,0,0,0)');
    o.fillStyle = hg; o.fillRect(0, 640, 1600, 260);
    woodGrain(o, 0, 120, 1600, 520, true);
    roomLight(o, 640);
    grain(o, 0.04);
    vignette(o);
  }

  function decorNorth(o) {
    sparkles(o, 590, 900, 80);
    glow(o, 1544, 295, 120, 'rgba(255,215,80,0.35)');
    const ng = o.createLinearGradient(0, 580, 0, 900);
    ng.addColorStop(0, 'rgba(70,110,170,0.2)'); ng.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = ng; o.fillRect(0, 580, 1600, 320);
    grain(o, 0.03);
    vignette(o);
  }

  // ================================================================ the village square
  function drawSquare(o) {
    Art.sky(o, '#081538', '#2c4f8c');
    Art.moon(o, 300, 140, 42);
    // houses around the square
    const houses = [[0, 230, '#c97b5a'], [230, 200, '#e0b05c'], [430, 240, '#8e6aa8'], [670, 210, '#5f9e8a'],
      [880, 230, '#d4766b'], [1110, 220, '#e7c27a'], [1330, 270, '#7a8fc4']];
    for (const [x, w, col] of houses) {
      const top = 300 + ((x / 10) % 3) * 25;
      o.fillStyle = col; o.fillRect(x, top, w, 560 - top);
      o.fillStyle = '#fff';
      o.beginPath(); o.moveTo(x - 6, top); o.lineTo(x + w / 2, top - 70); o.lineTo(x + w + 6, top); o.closePath(); o.fill();
      o.fillStyle = 'rgba(0,0,0,0.15)'; o.fillRect(x + w - 8, top, 8, 560 - top);
      for (let wy = top + 40; wy < 500; wy += 80) for (let wx = x + 30; wx < x + w - 50; wx += 70) {
        o.fillStyle = '#ffe082'; o.fillRect(wx, wy, 34, 44);
        o.fillStyle = 'rgba(0,0,0,0.25)'; o.fillRect(wx + 15, wy, 4, 44);
      }
    }
    // snowy square
    o.fillStyle = '#e8eff9'; o.fillRect(0, 560, 1600, 340);
    o.fillStyle = 'rgba(150,170,200,0.25)';
    for (let r = 0; r < 6; r++) for (let x = (r % 2) * 50; x < 1600; x += 100) { o.beginPath(); o.ellipse(x, 600 + r * 52, 40, 12, 0, 0, 6.3); o.fill(); }
    // string of lights between the houses
    const cols = ['#ff5252', '#ffd740', '#40c4ff', '#69f0ae'];
    const halo = ['rgba(255,82,82,0.4)', 'rgba(255,215,64,0.4)', 'rgba(64,196,255,0.4)', 'rgba(105,240,174,0.4)'];
    o.strokeStyle = '#333'; o.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x0 = i * 400, y0 = 260;
      o.beginPath(); o.moveTo(x0, y0); o.quadraticCurveTo(x0 + 200, y0 + 70, x0 + 400, y0); o.stroke();
      for (let k = 1; k < 8; k++) {
        const t = k / 8, bx = x0 + t * 400, by = y0 + 4 * t * (1 - t) * 35;
        glow(o, bx, by + 6, 22, halo[k % 4]);
        o.fillStyle = cols[k % 4]; o.beginPath(); o.arc(bx, by + 6, 6, 0, 6.3); o.fill();
      }
    }
  }

  function squarePlaces() {
    return [
      {
        id: 'stall', hit: { x: 1110, y: 370, w: 320, h: 280 },
        from: { x: 1270, y: 520 }, to: { x: 1490, y: 520 }, tip: { x: 1412, y: 500, a: 0, s: 110 },
        draw(c) {
          c.fillStyle = '#8d5a33'; c.fillRect(1130, 470, 280, 170);
          c.fillStyle = '#a66b3d'; c.fillRect(1120, 540, 300, 26);
          // goods on the counter
          [['#e53935', 1170], ['#fbc02d', 1230], ['#43a047', 1290], ['#1e88e5', 1350]].forEach(([col, x]) => {
            c.fillStyle = col; c.beginPath(); c.arc(x, 525, 16, 0, 6.3); c.fill();
          });
          // striped awning
          for (let i = 0; i < 8; i++) {
            c.fillStyle = i % 2 ? '#fff' : '#e53935';
            c.beginPath(); c.moveTo(1115 + i * 39, 470); c.lineTo(1154 + i * 39, 470); c.lineTo(1150 + i * 39, 390); c.lineTo(1125 + i * 39, 390); c.closePath(); c.fill();
            c.beginPath(); c.arc(1134 + i * 39, 470, 20, 0, Math.PI); c.fill();
          }
          c.fillStyle = '#fff'; c.fillRect(1120, 378, 300, 16);
        }
      },
      {
        id: 'towntree', hit: { x: 570, y: 200, w: 380, h: 510 },
        from: { x: 760, y: 600 }, to: { x: 955, y: 560 }, tip: { x: 915, y: 625, a: 0, s: 110 },
        draw(c) {
          Art.bigTree(c, 760, 710, 480);
          const balls = [[720, 360, '#e53935'], [800, 430, '#fbc02d'], [690, 500, '#1e88e5'], [830, 560, '#e53935'], [740, 610, '#8e44ad'], [650, 640, '#fbc02d'], [870, 650, '#43a047']];
          for (const [x, y, col] of balls) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 14, 0, 6.3); c.fill(); }
          c.fillStyle = '#ffc107'; Art.star(c, 760, 215, 36, 15);
        }
      },
      {
        id: 'well', hit: { x: 1440, y: 560, w: 160, h: 220 },
        from: { x: 1520, y: 690 }, to: { x: 1520, y: 545 }, tip: { x: 1522, y: 645, a: -1.57, s: 110 },
        draw(c) {
          c.fillStyle = '#90a4ae'; c.fillRect(1455, 650, 135, 120);
          c.fillStyle = '#78909c';
          for (let y = 660; y < 770; y += 28) for (let x = 1455 + ((y - 660) / 28 % 2) * 22; x < 1590; x += 45) c.fillRect(x, y, 40, 22);
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(1522, 650, 72, 16, 0, 0, 6.3); c.fill();
        }
      },
      {
        id: 'bench', hit: { x: 150, y: 590, w: 280, h: 180 },
        from: { x: 290, y: 690 }, to: { x: 290, y: 545 }, tip: { x: 300, y: 606, a: -1.57 },
        draw(c) {
          c.fillStyle = '#6d4c41';
          c.fillRect(170, 700, 14, 60); c.fillRect(396, 700, 14, 60);
          c.fillStyle = '#8d5a33';
          c.fillRect(160, 610, 260, 22); c.fillRect(160, 645, 260, 22); c.fillRect(150, 690, 280, 18);
          c.fillStyle = '#fff'; c.fillRect(160, 604, 260, 8); c.fillRect(150, 684, 280, 8);
        }
      },
      {
        id: 'bush', hit: { x: 410, y: 720, w: 220, h: 150 },
        from: { x: 520, y: 820 }, to: { x: 520, y: 680 }, tip: { x: 540, y: 728, a: -1.57, s: 100 },
        draw(c) {
          c.fillStyle = '#2e7d32';
          c.beginPath(); c.arc(470, 810, 55, 0, 6.3); c.arc(540, 790, 65, 0, 6.3); c.arc(590, 820, 45, 0, 6.3); c.fill();
          c.fillStyle = '#fff';
          for (const [x, y, rx, ry] of [[470, 765, 40, 14], [540, 735, 48, 15], [595, 785, 30, 10]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.3); c.fill(); }
          c.fillStyle = '#e53935'; for (const [x, y] of [[460, 800], [520, 780], [560, 830], [600, 810]]) { c.beginPath(); c.arc(x, y, 6, 0, 6.3); c.fill(); }
        }
      },
      {
        id: 'cart', hit: { x: 1140, y: 640, w: 280, h: 220 },
        from: { x: 1270, y: 780 }, to: { x: 1270, y: 610 }, tip: { x: 1152, y: 765, a: 3.14, s: 100 },
        draw(c) {
          Art.gift(c, 1220, 700, 90, '#e53935');
          Art.gift(c, 1310, 705, 80, '#1e88e5');
          Art.gift(c, 1265, 655, 60, '#fbc02d');
          c.fillStyle = '#8d5a33'; c.fillRect(1150, 730, 260, 70);
          c.fillStyle = '#6d4022'; c.fillRect(1150, 760, 260, 8);
          c.fillStyle = '#4e342e';
          for (const x of [1195, 1365]) { c.beginPath(); c.arc(x, 815, 38, 0, 6.3); c.fill(); }
          c.fillStyle = '#a1887f';
          for (const x of [1195, 1365]) { c.beginPath(); c.arc(x, 815, 12, 0, 6.3); c.fill(); }
        }
      }
    ];
  }

  // ================================================================ the frozen lake
  function drawLake(o) {
    Art.sky(o, '#0a1a40', '#3a5d99');
    Art.moon(o, 820, 130, 40);
    mountains(o, 470, '#86a5cf');
    for (let i = 0; i < 14; i++) Art.pine(o, 30 + i * 120, 500 + (i % 3) * 8, 110 + (i % 3) * 25, '#1d4f45');
    o.fillStyle = '#e9f1fb'; o.fillRect(0, 500, 1600, 400);
    // the frozen lake
    const g = o.createLinearGradient(0, 540, 0, 760);
    g.addColorStop(0, '#9fd3f2'); g.addColorStop(1, '#cdeafc');
    o.fillStyle = g;
    o.beginPath(); o.ellipse(800, 650, 620, 120, 0, 0, 6.3); o.fill();
    o.strokeStyle = 'rgba(255,255,255,0.8)'; o.lineWidth = 3;
    for (const [x, y, r] of [[600, 640, 90], [700, 670, 60], [980, 630, 110], [1050, 680, 50]]) { o.beginPath(); o.ellipse(x, y, r, r * 0.25, 0, 0.2, 5.5); o.stroke(); }
    o.fillStyle = 'rgba(255,255,255,0.35)';
    o.beginPath(); o.ellipse(700, 610, 260, 18, -0.05, 0, 6.3); o.fill();
  }

  function lakePlaces() {
    return [
      {
        id: 'hut', hit: { x: 1170, y: 370, w: 300, h: 240 },
        from: { x: 1320, y: 530 }, to: { x: 1505, y: 530 }, tip: { x: 1200, y: 540, a: 3.14 },
        draw(c) {
          c.fillStyle = '#7b4a2a'; c.fillRect(1200, 460, 240, 145);
          c.strokeStyle = '#5d3a22'; c.lineWidth = 4;
          for (let y = 482; y < 605; y += 24) { c.beginPath(); c.moveTo(1200, y); c.lineTo(1440, y); c.stroke(); }
          c.fillStyle = '#fff';
          c.beginPath(); c.moveTo(1180, 470); c.lineTo(1320, 380); c.lineTo(1460, 470); c.closePath(); c.fill();
          c.fillStyle = '#ffe082'; c.fillRect(1230, 500, 50, 44);
          c.fillStyle = '#4e2f1c'; c.fillRect(1340, 515, 56, 90);
        }
      },
      {
        id: 'fort', hit: { x: 940, y: 600, w: 220, h: 170 },
        from: { x: 1050, y: 720 }, to: { x: 1050, y: 570 }, tip: { x: 1065, y: 662, a: -1.57 },
        draw(c) {
          c.fillStyle = '#f5f9ff'; c.fillRect(950, 660, 200, 100);
          for (let x = 950; x < 1150; x += 50) c.fillRect(x, 630, 30, 32);
          c.strokeStyle = '#c7d9ee'; c.lineWidth = 3;
          for (let y = 685; y < 760; y += 25) { c.beginPath(); c.moveTo(950, y); c.lineTo(1150, y); c.stroke(); }
        }
      },
      {
        id: 'woodpile', hit: { x: 140, y: 620, w: 300, h: 190 },
        from: { x: 290, y: 740 }, to: { x: 290, y: 580 }, tip: { x: 320, y: 635, a: -1.57 },
        draw(c) {
          const rows = [[160, 760, 6], [190, 712, 5], [220, 664, 4]];
          for (const [x0, y, n] of rows) for (let i = 0; i < n; i++) {
            const x = x0 + i * 48;
            c.fillStyle = '#8d5a33'; c.beginPath(); c.arc(x + 24, y, 24, 0, 6.3); c.fill();
            c.fillStyle = '#d7b38c'; c.beginPath(); c.arc(x + 24, y, 17, 0, 6.3); c.fill();
            c.strokeStyle = '#a07850'; c.lineWidth = 2; c.beginPath(); c.arc(x + 24, y, 9, 0, 6.3); c.stroke();
          }
          c.fillStyle = '#fff'; c.beginPath(); c.ellipse(316, 642, 100, 14, 0, 0, 6.3); c.fill();
        }
      },
      {
        id: 'snowman', hit: { x: 450, y: 420, w: 150, h: 290 },
        from: { x: 520, y: 620 }, to: { x: 630, y: 615 }, tip: { x: 580, y: 660, a: -0.25, s: 100 },
        draw(c) {
          Art.snowman(c, 520, 705, 170);
          c.fillStyle = '#43a047'; c.fillRect(470, 570, 100, 14); c.fillRect(540, 570, 16, 50);
        }
      },
      {
        id: 'boat', hit: { x: 610, y: 750, w: 320, h: 120 },
        from: { x: 770, y: 830 }, to: { x: 770, y: 690 }, tip: { x: 770, y: 790, a: -1.57, s: 100 },
        draw(c) {
          c.fillStyle = '#c62828';
          c.beginPath(); c.moveTo(620, 860); c.quadraticCurveTo(770, 720, 920, 860); c.closePath(); c.fill();
          c.fillStyle = '#fff'; c.fillRect(640, 845, 260, 10);
          c.fillStyle = 'rgba(255,255,255,0.9)';
          c.beginPath(); c.ellipse(770, 795, 70, 12, 0, Math.PI, 0); c.fill();
        }
      },
      {
        id: 'lakepine', hit: { x: 1380, y: 480, w: 220, h: 400 },
        from: { x: 1490, y: 780 }, to: { x: 1345, y: 765 }, tip: { x: 1420, y: 780, a: 3.14, s: 100 },
        draw(c) { Art.pine(c, 1490, 885, 380, '#1b5e3a'); }
      }
    ];
  }

  function decorSquare(o) {
    glow(o, 300, 140, 200, 'rgba(255,250,220,0.15)');
    for (let i = 0; i < 7; i++) glow(o, 120 + i * 230, 420, 150, 'rgba(255,220,130,0.12)');
    sparkles(o, 570, 900, 60);
    grain(o, 0.03);
    vignette(o);
  }

  function decorLake(o) {
    glow(o, 820, 130, 200, 'rgba(255,250,220,0.15)');
    sparkles(o, 520, 900, 70);
    const sg = o.createLinearGradient(0, 500, 0, 900);
    sg.addColorStop(0, 'rgba(70,100,160,0.18)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = sg; o.fillRect(0, 500, 1600, 400);
    grain(o, 0.03);
    vignette(o);
  }

  // places get a drawn outline: each one is drawn once into a "sticker"
  // (an offscreen canvas) and then just copied every frame (also faster)
  let stickers = new WeakMap(), stickerK = 0;
  function sticker(p) {
    const k = E.scale * E.dpr;
    if (k !== stickerK) { stickers = new WeakMap(); stickerK = k; }
    let st = stickers.get(p);
    if (st) return st;
    const m = 70, b = p.hit;
    const x0 = b.x - m, y0 = b.y - m, w = b.w + m * 2, h = b.h + m * 2;
    const cw = Math.max(1, Math.ceil(w * k)), ch = Math.max(1, Math.ceil(h * k));
    const a = document.createElement('canvas'); a.width = cw; a.height = ch;
    const ac = a.getContext('2d');
    ac.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    if (p.clip) { ac.beginPath(); ac.rect(p.clip.x, p.clip.y, p.clip.w, p.clip.h); ac.clip(); }
    p.draw(ac);
    // volume: light from the top-left, shade towards the bottom (only on the object)
    ac.save();
    ac.setTransform(1, 0, 0, 1, 0, 0);
    ac.globalCompositeOperation = 'source-atop';
    const lg = ac.createLinearGradient(cw * 0.2, 0, cw * 0.55, ch);
    lg.addColorStop(0, 'rgba(255,255,255,0.22)');
    lg.addColorStop(0.45, 'rgba(255,255,255,0)');
    lg.addColorStop(1, 'rgba(0,0,0,0.30)');
    ac.fillStyle = lg;
    ac.fillRect(0, 0, cw, ch);
    ac.restore();
    let img = a;
    if (!p.clip) {
      const o = document.createElement('canvas'); o.width = cw; o.height = ch;
      const oc = o.getContext('2d');
      const r = 2.4 * k;
      for (let i = 0; i < 12; i++) { const ang = i / 12 * Math.PI * 2; oc.drawImage(a, Math.cos(ang) * r, Math.sin(ang) * r); }
      oc.globalCompositeOperation = 'source-in';
      oc.fillStyle = 'rgba(40,22,12,0.8)';
      oc.fillRect(0, 0, cw, ch);
      oc.globalCompositeOperation = 'source-over';
      oc.drawImage(a, 0, 0);
      img = o;
    }
    st = { img, x0, y0, w, h };
    stickers.set(p, st);
    return st;
  }

  function drawShadow(c, p, color) {
    if (p.clip || p.noShadow) return;
    const b = p.hit, cx = b.x + b.w / 2, cy = b.y + b.h - 8, rx = b.w * 0.55;
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, color || 'rgba(40,20,10,0.38)');
    g.addColorStop(0.6, color ? color.replace(/[\d.]+\)$/, '0.12)') : 'rgba(40,20,10,0.14)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save();
    c.translate(cx, cy); c.scale(1, 22 / rx); c.translate(-cx, -cy);
    c.fillStyle = g;
    c.beginPath(); c.arc(cx, cy, rx, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function drawPlace(c, p, dx) {
    const st = sticker(p);
    c.drawImage(st.img, st.x0 + (dx || 0), st.y0, st.w, st.h);
    if (p.anim) { c.save(); c.translate(dx || 0, 0); p.anim(c); c.restore(); }
  }

  // ================================================================ the eight places
  // indoor and outdoor places alternate; it snows only outside
  const SCENES = [
    { key: 'room', icon: '🏠', bg: o => { drawRoom(o); decorRoom(o); }, extra: drawFire, places: roomPlaces,
      friends: ['🐱', '🐭', '🐶', '🐹', '🐰', '🦉', '🐧', '🐻'] },
    { key: 'forest', icon: '🌲', outdoor: true, shadow: 'rgba(60,90,150,0.35)', bg: o => { drawForest(o); decorForest(o); }, places: forestPlaces,
      friends: ['🦊', '🐰', '🦉', '🐿️', '🦌', '🐦', '🦔', '🐻'] },
    { key: 'kitchen', icon: '🍪', bg: o => { drawKitchen(o); decorKitchen(o); }, places: kitchenPlaces,
      friends: ['🐱', '🐭', '🐶', '🐹', '🐥', '🐰'] },
    { key: 'square', icon: '🏘️', outdoor: true, shadow: 'rgba(60,90,150,0.35)', bg: o => { drawSquare(o); decorSquare(o); }, places: squarePlaces,
      friends: ['🐶', '🐱', '🐦', '🐰', '🦊', '🐿️'] },
    { key: 'workshop', icon: '🎁', bg: o => { drawWorkshop(o); decorWorkshop(o); }, places: workshopPlaces,
      friends: ['🧸', '🤖', '🐶', '🐱', '🦆', '🐭', '🐵', '🐼'] },
    { key: 'lake', icon: '⛸️', outdoor: true, shadow: 'rgba(60,90,150,0.35)', bg: o => { drawLake(o); decorLake(o); }, places: lakePlaces,
      friends: ['🦆', '🐟', '🐰', '🦊', '🦉', '🐦'] },
    { key: 'stable', icon: '🦌', bg: o => { drawStable(o); decorStable(o); }, places: stablePlaces,
      friends: ['🐴', '🐑', '🐮', '🐔', '🐱', '🐭', '🦌'] },
    { key: 'north', icon: '🐧', outdoor: true, shadow: 'rgba(60,90,150,0.35)', bg: o => { drawNorthPole(o); decorNorth(o); }, places: northPlaces,
      friends: ['🐧', '🐰', '🦊', '🦉', '🐳', '🐟', '🐦', '🐻'] }
  ];
  const ALL_FRIENDS = ['🐱', '🦊', '🐰', '🦉', '🐿️', '🧸', '🐧', '🦌', '🐶', '🐭'];

  /** Progress at the top: the places, then the stars for this place. */
  const STAR_X = i => 930 + i * 68;
  function drawProgress(c, sceneIdx, found) {
    c.fillStyle = 'rgba(30,10,10,0.45)';
    Art.roundRect(c, 380, 12, 740, 76, 38); c.fill();
    SCENES.forEach((s, i) => {
      const x = 425 + i * 60;
      c.globalAlpha = i <= sceneIdx ? 1 : 0.35;
      c.fillStyle = i < sceneIdx ? '#ffd54f' : i === sceneIdx ? '#ffffff' : 'rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(x, 50, 25, 0, Math.PI * 2); c.fill();
      Art.emoji(c, s.icon, x, 52, 30);
      c.globalAlpha = 1;
    });
    for (let i = 0; i < PER_SCENE; i++) {
      c.fillStyle = i < found ? '#ffd54f' : 'rgba(255,255,255,0.22)';
      Art.star(c, STAR_X(i), 50, i < found ? 30 + Math.sin(E.time * 4 + i) * 2 : 26, 12);
    }
  }

  /**
   * Bubu peeks out of her hiding place with her red hat on and wiggles
   * (easy-medium: the hat and the top of her head show, the rest of her
   * stays behind the object). t = { x, y, a, s? }: the point on the edge of
   * the object where she peeks out, the direction she leans out (radians)
   * and her size (smaller behind small things).
   * She is drawn BEFORE the object, so the object hides her body; the part
   * of her that is behind the edge is also cut off, so it never shows next
   * to a thin object.
   */
  function drawBubuPeek(c, t) {
    const S = t.s || 120;
    const out = 2 + Math.sin(E.time * 4) * 7;          // slides a little out and in
    c.save();
    c.translate(t.x, t.y);
    c.rotate(t.a + Math.PI / 2);                        // from here on, "up" is out of the hiding place
    c.beginPath(); c.rect(-S * 1.5, -S * 2, S * 3, S * 2 + 6); c.clip();
    c.translate(0, -out);
    c.rotate(Math.sin(E.time * 3) * 0.12);
    drawBubu(c, 0, -S * 0.12, S, false);
    c.restore();
  }

  // ------------------------------------------------------------ start screen
  Game.start = function () {
    const places = roomPlaces();
    return {
      enter() { E.snow.on = false; },        // the room is inside: no snow
      draw(c) {
        E.cachedBg('room', SCENES[0].bg);
        drawFire(c);
        for (const p of places) { drawShadow(c, p); drawPlace(c, p); }
        drawBubu(c, 830, 700 + Math.abs(Math.sin(E.time * 3)) * -14, 190, true);
      }
    };
  };

  // ------------------------------------------------------------ the game
  Game.play = function (onEnd) {
    let sceneIdx = 0, scene = null, places = null, order = null;
    let round = 0, found = 0;        // within the current place
    let hideIn = null;               // where Bubu is now
    let state = 'dark', st = 0.6, darkLen = 0.6, darkIcon = '🙈';
    const peeks = new Map();         // place -> { who, t } (a friend or Bubu coming out)
    let flyStar = null;
    let party = 0;

    function loadScene(i) {
      sceneIdx = i;
      scene = SCENES[i];
      places = scene.places();
      E.snow.on = !!scene.outdoor;
      order = E.shuffle(places.map((_, k) => k)).slice(0, PER_SCENE);
      round = 0;
      found = 0;
    }

    function newRound() {
      hideIn = places[order[round]];
      const fr = E.shuffle(scene.friends);
      places.forEach((p, i) => { p.friend = fr[i % fr.length]; p.shake = 0; });
      peeks.clear();
    }

    function lightsOff(seconds, icon) {
      state = 'dark';
      st = darkLen = seconds;
      darkIcon = icon;
    }

    loadScene(0);
    newRound();

    return {
      update(dt) {
        st -= dt;
        for (const p of places) p.shake = Math.max(0, p.shake - dt);
        for (const [p, k] of peeks) {
          k.t += dt;
          if (k.who !== 'bubu' && k.t > 1.6) peeks.delete(p);   // friends go back
        }
        // in the middle of "lights off" the new place appears
        if (state === 'dark' && this.pendingScene !== undefined && st < darkLen / 2) {
          loadScene(this.pendingScene);
          newRound();
          this.pendingScene = undefined;
        }
        if (state === 'dark' && st <= 0) state = 'seek';
        if (flyStar) {
          flyStar.t += dt / 0.9;
          if (flyStar.t >= 1) { flyStar = null; found++; }
        }
        if (state === 'found' && st < -2.2) {
          round++;
          if (round < PER_SCENE) {
            // lights off: Bubu hides somewhere else
            newRound();
            lightsOff(1.3, '🙈');
          } else if (sceneIdx < SCENES.length - 1) {
            // this place is done: go to the next one
            this.pendingScene = sceneIdx + 1;
            lightsOff(2.2, SCENES[sceneIdx + 1].icon);
          } else {
            state = 'end'; st = 0;
            peeks.clear();
          }
        }
        if (state === 'end') {
          party += dt;
          if (Math.random() < dt * 5) E.burst(E.rand(150, 1450), E.rand(150, 550), Art.SPARKS, 12, 300);
          if (party > 2.2 && onEnd) { const f = onEnd; onEnd = null; f(); }
        }
      },
      draw(c) {
        E.cachedBg(scene.key, scene.bg);
        if (scene.extra) scene.extra(c);
        // Bubu peeks out (hat and head) from the moment the lights come on
        const bubuPeek = (state === 'seek' || (state === 'dark' && this.pendingScene === undefined)) && !peeks.has(hideIn);
        for (const p of places) {
          const dx = p.shake > 0 ? Math.sin(p.shake * 45) * 8 : 0;
          drawShadow(c, p, scene.shadow);
          if (p.clip) { c.save(); c.beginPath(); c.rect(p.clip.x, p.clip.y, p.clip.w, p.clip.h); c.clip(); }
          // who is behind this place (drawn first, so it comes out from behind)
          const pk = peeks.get(p);
          if (pk) {
            const k = pk.who === 'bubu' ? E.easeOutBack(Math.min(1, pk.t / 0.45))
              : Math.min(E.easeOutBack(Math.min(1, pk.t / 0.35)), (1.6 - pk.t) / 0.3);
            const x = E.lerp(p.from.x, p.to.x, Math.max(0, k)), y = E.lerp(p.from.y, p.to.y, Math.max(0, k));
            if (pk.who === 'bubu') drawBubu(c, x, y + (state === 'found' ? Math.abs(Math.sin(E.time * 7)) * -12 : 0), 125, true);
            else Art.emoji(c, pk.who, x, y, 96);
          } else if (bubuPeek && p === hideIn) {
            drawBubuPeek(c, p.tip);
          }
          if (p.clip) c.restore();
          drawPlace(c, p, dx);
        }
        if (state === 'end') {
          // everybody comes out to party with Bubu
          const s = E.easeOutBack(Math.min(1, party / 0.8));
          ALL_FRIENDS.slice(0, 8).forEach((f, i) => {
            const a = Math.PI + (i / 7) * Math.PI;
            c.save();
            c.translate(800 + Math.cos(a) * 330 * s, 560 + Math.sin(a) * 200 * s + Math.abs(Math.sin(E.time * 6 + i)) * -18);
            Art.emoji(c, f, 0, 0, 90);
            c.restore();
          });
          drawBubu(c, 800, 600 + Math.abs(Math.sin(E.time * 5)) * -30, 230 * s, true);
        }
        // lights off while Bubu hides (or while we go to the next place)
        if (state === 'dark') {
          const a = Math.max(0, Math.min(1, st / 0.3, (darkLen - st) / 0.3));
          c.fillStyle = `rgba(5,8,20,${0.9 * a})`;
          E.fillView(c);
          c.globalAlpha = a;
          Art.emoji(c, darkIcon, 800, 450, darkIcon === '🙈' ? 120 : 170);
          c.globalAlpha = 1;
        }
      },
      drawTop(c) {
        if (state !== 'end') drawProgress(c, sceneIdx, found);
        if (flyStar) {
          const k = E.easeInOut(Math.min(1, flyStar.t));
          c.fillStyle = '#ffd54f';
          Art.star(c, E.lerp(flyStar.x0, STAR_X(flyStar.i), k), E.lerp(flyStar.y0, 50, k) - Math.sin(k * Math.PI) * 120, E.lerp(50, 30, k), 20);
        }
        if (state === 'end' && party > 0.8) {
          const s = E.easeOutBack(Math.min(1, (party - 0.8) / 0.6));
          c.save();
          c.translate(800, 200);
          c.scale(s, s);
          c.font = `800 96px ${E.font}`;
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.lineWidth = 14; c.strokeStyle = '#7a1010'; c.lineJoin = 'round';
          c.strokeText('Crăciun fericit!', 0, 0);
          c.fillStyle = '#ffd23f';
          c.fillText('Crăciun fericit!', 0, 0);
          c.restore();
        }
      },
      down(x, y) {
        if (state !== 'seek') return;
        // topmost place under the click (places are listed back to front)
        let hit = null;
        for (const p of places) {
          const h = p.hit;
          if (x > h.x - 15 && x < h.x + h.w + 15 && y > h.y - 15 && y < h.y + h.h + 15) hit = p;
        }
        if (!hit || peeks.has(hit)) return;
        hit.shake = 0.35;
        if (hit === hideIn) {
          peeks.set(hit, { who: 'bubu', t: 0 });
          state = 'found';
          st = 0;
          E.burst(hit.to.x, hit.to.y, Art.SPARKS, 30, 420);
          flyStar = { x0: hit.to.x, y0: hit.to.y, t: 0, i: found };
        } else {
          peeks.set(hit, { who: hit.friend, t: 0 });
        }
      }
      // no hint(): the game never shows the pointing hand
    };
  };

  window.Game = Game;
})();
