/*
 * main.js — game flow (start → play → end → play again), buttons and the
 * story book that the teacher opens with 📖 and reads on the board.
 */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  // ------------------------------------------------------------ story (read by the teacher)
  const PAGES = [
    {
      art: '<span class="a" style="bottom:12%;left:8%;font-size:1.4em">🎄</span><span class="a" style="bottom:14%;right:10%">🎁</span><span class="a" style="top:10%;right:12%">🧦</span><span class="a wiggle" style="top:14%;left:16%">🔥</span>',
      text: 'În Ajunul Crăciunului, <b>Bubu</b> a venit în vizită în camera cu bradul. Ce frumos era! Bradul strălucea, focul ardea în șemineu, iar peste tot erau cadouri.'
    },
    {
      art: '<img class="float" src="assets/bubu.webp" alt=""><span class="a" style="top:8%;right:10%">🙈</span>',
      text: 'Bubu iubește jocul de-a v-ați ascunselea. „Hai să ne jucăm! Eu mă ascund, iar voi mă căutați!”, a chicotit ea. <i>Hi-hi-hi!</i>'
    },
    {
      art: '<span class="a float" style="top:12%;left:12%">🐱</span><span class="a float" style="top:14%;right:14%;animation-delay:-1s">🐭</span><span class="a float" style="bottom:14%;left:16%;animation-delay:-2s">🐰</span><span class="a float" style="bottom:12%;right:12%;animation-delay:-.5s">🦉</span>',
      text: 'Bubu se ascunde în multe locuri: în <b>casa cu bradul</b>, în <b>pădure</b>, în <b>bucătărie</b>, în <b>piața satului</b>, în <b>atelierul lui Moș Crăciun</b>, pe <b>lacul înghețat</b>, la <b>grajdul renilor</b>, în <b>țara dulciurilor</b>, în <b>clasă</b> și chiar la <b>Polul Nord</b>! Dar atenție: s-au ascuns și <b>alți prieteni</b>!'
    },
    {
      art: '<span class="a" style="top:16%;left:14%">🖱️</span><span class="a float" style="bottom:16%;right:14%">⭐</span><span class="a wiggle" style="top:40%;left:44%">👀</span>',
      text: 'Copii, <b>faceți clic</b> pe locul unde s-a ascuns Bubu. Uitați-vă bine: Bubu nu stă cuminte și îi iese mereu <b>căciulița roșie</b> de după ascunzătoare! De fiecare dată când o găsiți primiți o <b>steluță</b>.'
    }
  ];

  // ------------------------------------------------------------ flow
  function showStart() {
    $('start').hidden = false;
    $('btnAgain').hidden = true;
    E.go(Game.start());
  }

  // three levels, each one harder; after the last one the game starts again
  let level = 1;
  const nextLevel = () => (level < Game.LEVELS ? level + 1 : 1);

  // for testing: index.html?nivel=3&plansa=9 starts at that level and place
  // (place 1..10); only the first game uses them, the next levels start at place 1
  const params = new URLSearchParams(location.search);
  const num = (name, max) => {
    const v = parseInt(params.get(name), 10);
    return v >= 1 && v <= max ? v : 1;
  };
  let testScene = num('plansa', Game.SCENES) - 1;
  const firstLevel = num('nivel', Game.LEVELS);

  function play(lvl) {
    level = lvl;
    $('start').hidden = true;
    $('btnAgain').hidden = true;
    E.go(Game.play(showAgain, level, testScene));
    testScene = 0;
  }

  /** The end button shows Bubu, an arrow and the stars of the next level. */
  function showAgain() {
    const next = nextLevel();
    $('againStars').textContent = '⭐'.repeat(next);
    $('againArrow').textContent = next > 1 ? '▶' : '🔁';
    $('btnAgain').setAttribute('aria-label', next > 1 ? 'Joacă din nou, mai greu' : 'Joacă din nou de la început');
    $('btnAgain').hidden = false;
  }

  $('btnPlay').addEventListener('click', () => play(firstLevel));
  $('btnAgain').addEventListener('click', () => play(nextLevel()));

  $('btnFullscreen').addEventListener('click', () => {
    const d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else {
      const el = d.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    }
  });

  // ------------------------------------------------------------ story book
  let page = 0;
  const book = $('book');
  const dots = $('bookDots');
  dots.innerHTML = PAGES.map(() => '<span></span>').join('');

  function renderPage() {
    const p = PAGES[page];
    $('bookArt').innerHTML = p.art;
    $('bookText').innerHTML = p.text;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === page));
    $('bookPrev').disabled = page === 0;
    const last = page === PAGES.length - 1;
    $('bookNext').classList.toggle('is-start', last);
    $('bookNext').setAttribute('aria-label', last ? 'Începe jocul' : 'Pagina următoare');
  }
  function openBook() { page = 0; renderPage(); book.hidden = false; E.stop(); }
  function closeBook() { book.hidden = true; E.start(); }

  function turned() { renderPage(); }

  $('btnBook').addEventListener('click', openBook);
  $('bookPrev').addEventListener('click', () => { if (page > 0) { page--; turned(); } });
  $('bookNext').addEventListener('click', () => {
    if (page < PAGES.length - 1) { page++; turned(); }
    else { closeBook(); play(firstLevel); }
  });
  $('bookClose').addEventListener('click', closeBook);
  document.addEventListener('keydown', e => {
    if (book.hidden) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); $('bookNext').click(); }
    else if (e.key === 'ArrowLeft') $('bookPrev').click();
    else if (e.key === 'Escape') closeBook();
  });

  showStart();
  E.start();
})();
