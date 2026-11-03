/* Papan 10x10 (HTML + CSS Grid): petak, SVG ular & tangga, lapisan angka, bidak. */
(function (U) {
  /* ====== KONFIGURASI ULAR & TANGGA — ubah di sini (divalidasi otomatis) ====== */
  U.CONFIG = {
    ladders: { 4: 14, 9: 31, 20: 38, 28: 50, 40: 59, 51: 67, 63: 81, 71: 91 },
    snakes:  { 17: 7, 54: 34, 62: 19, 64: 60, 87: 57, 93: 73, 95: 75, 99: 78 }
  };
  var SNAKE_COL = ['#2fbf4a', '#a15cff', '#2f8cff', '#ffc61a', '#ff5a5a', '#16c7a6', '#ff7ab6', '#ff9a2a'];
  /* Palet pelangi harmonis: satu rona per baris (hijau di bawah → kuning di atas), petak selang-seling terang/gelap. */
  var HUES = [138, 165, 192, 218, 248, 280, 318, 350, 22, 46];
  function tile(r, c) {
    var h = HUES[r], alt = (r + c) % 2;
    var L = alt ? 66 : 60, S = alt ? 78 : 72;
    return ['hsl(' + h + ',' + (S + 8) + '%,' + (L + 10) + '%)', 'hsl(' + h + ',' + S + '%,' + L + '%)', 'hsl(' + h + ',' + (S - 8) + '%,' + (L - 17) + '%)'];
  }
  var NS = 'http://www.w3.org/2000/svg';

  function pos(p) {
    var idx = p - 1, row = Math.floor(idx / 10), c = idx % 10, col = row % 2 === 0 ? c : 9 - c;
    return { col: col, row: row, x: col * 10 + 5, y: (9 - row) * 10 + 5 };
  }
  /* Titik jangkar visual ular/tangga: sedikit ke kanan-bawah pusat petak agar tidak menimpa lencana angka. */
  function anchor(p) { var q = pos(p); return { x: q.x + 1.1, y: q.y + 1.7 }; }
  function validate(cfg) {
    var e = [], starts = {}, ends = {};
    function chk(map, kind) {
      Object.keys(map).forEach(function (k) {
        var a = +k, b = map[k];
        if (!(a >= 2 && a <= 99 && b >= 1 && b <= 100 && a % 1 === 0 && b % 1 === 0)) e.push(kind + ' ' + a + '→' + b + ' di luar 1–100');
        if (a === b) e.push(kind + ' ' + a + ' awal = akhir');
        if (kind === 'tangga' && b <= a) e.push('tangga ' + a + '→' + b + ' menurun');
        if (kind === 'ular' && b >= a) e.push('ular ' + a + '→' + b + ' menaik');
        if (starts[a]) e.push('kotak ' + a + ' dipakai dua kali');
        starts[a] = 1; ends[b] = 1;
      });
    }
    chk(cfg.ladders, 'tangga'); chk(cfg.snakes, 'ular');
    Object.keys(ends).forEach(function (b) { if (starts[b]) e.push('rantai perpindahan di kotak ' + b); });
    return e;
  }

  var root, svg, layer, pawns = [], posArr = [], jumpEls = {}, built = false, frozen = false, ro = null, activeIdx = -1;
  function mk(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el); return el;
  }
  function div(cls, parent, text) { var d = document.createElement('div'); d.className = cls; if (text != null) d.textContent = text; if (parent) parent.appendChild(d); return d; }
  function f(n) { return Math.round(n * 100) / 100; }

  /* Tangga kayu 3D: bayangan, rel bergradasi, anak tangga bersorot. */
  function drawLadder(a, b, g) {
    var A = anchor(a), B = anchor(b), dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len, uy = dy / len, nx = -uy * 1.35, ny = ux * 1.35;
    var x1 = A.x + ux * 2.4, y1 = A.y + uy * 2.4, x2 = B.x - ux * 2.4, y2 = B.y - uy * 2.4;
    var L = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), cnt = Math.max(3, Math.floor(L / 3.8));
    function railD(ox, oy, s) {
      return 'M' + f(x1 + nx * s + ox) + ' ' + f(y1 + ny * s + oy) + 'L' + f(x2 + nx * s + ox) + ' ' + f(y2 + ny * s + oy);
    }
    function rungD(ox, oy, k) {
      var d = '';
      for (var i = 0; i < cnt; i++) {
        var t = (i + 0.5) / cnt, cx = x1 + (x2 - x1) * t + ox, cy = y1 + (y2 - y1) * t + oy;
        d += 'M' + f(cx + nx * k) + ' ' + f(cy + ny * k) + 'L' + f(cx - nx * k) + ' ' + f(cy - ny * k);
      }
      return d;
    }
    function p(d, st, w) { mk('path', { d: d, stroke: st, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, g); }
    p(railD(0.6, 0.9, 1) + railD(0.6, 0.9, -1) + rungD(0.6, 0.9, 1), 'rgba(0,0,0,.25)', 1.3);
    p(railD(0, 0, 1) + railD(0, 0, -1), '#5a2d0c', 1.55);
    p(rungD(0, 0, 1), '#5a2d0c', 1.05);
    p(railD(0, 0, 1) + railD(0, 0, -1), '#c27a34', 1.05);
    p(rungD(0, 0, 1), '#e0a050', 0.65);
    p(railD(-0.18, -0.2, 1) + railD(-0.18, -0.2, -1) + rungD(0, -0.18, 1), 'rgba(255,230,170,.75)', 0.25);
  }
  /* Ular lucu: badan berpita, kepala besar dengan mata berkilau, pipi merah muda, senyum, lidah. */
  function drawSnake(a, b, g, col) {
    var H = anchor(a), T = anchor(b), dx = T.x - H.x, dy = T.y - H.y, len = Math.sqrt(dx * dx + dy * dy);
    var nx = -dy / len, ny = dx / len, N = 40, k = Math.max(2, Math.round(len / 14)), amp = 3.2, pts = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, o = Math.sin(t * Math.PI * k) * amp * Math.pow(Math.sin(Math.PI * Math.min(t * 1.06, 1)), 0.5);
      pts.push([H.x + dx * t + nx * o, H.y + dy * t + ny * o]);
    }
    function path(from, to) { var d = ''; for (var i = from; i <= to; i++) d += (i === from ? 'M' : 'L') + f(pts[i][0]) + ' ' + f(pts[i][1]); return d; }
    function seg(from, to, w, st, extra) {
      var at = { d: path(from, to), stroke: st, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      for (var q in extra) at[q] = extra[q];
      mk('path', at, g);
    }
    var i1 = Math.floor(N * 0.66), i2 = Math.floor(N * 0.86), shade = 'rgba(20,10,60,.35)';
    seg(0, i1, 4.2, shade); seg(i1, i2, 3.3, shade); seg(i2, N, 2.2, shade);       // kontur
    seg(0, i1, 3.2, col); seg(i1, i2, 2.4, col); seg(i2, N, 1.4, col);              // badan
    seg(0, i1, 3.2, 'rgba(0,0,0,.16)', { 'stroke-dasharray': '1.1 2.6', 'stroke-linecap': 'butt' }); // pita
    seg(0, i1, 1.1, 'rgba(255,255,255,.5)', { transform: 'translate(-.35 -.35)' }); // sorot perut
    var ang = Math.atan2(H.y - pts[2][1], H.x - pts[2][0]) * 180 / Math.PI;
    var h = mk('g', { transform: 'translate(' + f(H.x) + ' ' + f(H.y) + ') rotate(' + f(ang) + ')' }, g);
    mk('path', { d: 'M2.6 0L5.2 -.8M2.6 0L5.2 .8', stroke: '#e0243a', 'stroke-width': .4, fill: 'none', 'stroke-linecap': 'round' }, h);
    mk('ellipse', { cx: 0, cy: 0, rx: 3.5, ry: 3.1, fill: shade }, h);
    mk('ellipse', { cx: -.1, cy: -.1, rx: 3.3, ry: 2.9, fill: col }, h);
    mk('ellipse', { cx: -.4, cy: -1.3, rx: 1.8, ry: .8, fill: 'rgba(255,255,255,.4)' }, h);
    [-1.3, 1.3].forEach(function (y) {
      mk('circle', { cx: .6, cy: y, r: 1.2, fill: '#fff' }, h);
      mk('circle', { cx: .9, cy: y, r: .68, fill: '#1a1a2e' }, h);
      mk('circle', { cx: 1.15, cy: y - .25, r: .24, fill: '#fff' }, h);
      mk('ellipse', { cx: -.6, cy: y * 1.75, rx: .7, ry: .45, fill: 'rgba(255,90,140,.55)' }, h);
    });
    mk('path', { d: 'M2 -.9Q2.7 0 2 .9', stroke: '#6a1020', 'stroke-width': .35, fill: 'none', 'stroke-linecap': 'round' }, h);
  }

  U.Board = {
    pos: pos, validate: validate,
    build: function (rootEl) {
      root = rootEl; root.innerHTML = ''; frozen = false; activeIdx = -1;
      var grid = div('grid', root), nums = document.createElement('div'); nums.className = 'nums';
      for (var vr = 0; vr < 10; vr++) for (var c = 0; c < 10; c++) {
        var r = 9 - vr, p = r % 2 === 0 ? r * 10 + c + 1 : r * 10 + 10 - c, t = tile(r, c);
        var d = div('cell', grid); d.dataset.n = p;
        d.style.setProperty('--a', t[0]); d.style.setProperty('--b', t[1]); d.style.setProperty('--d', t[2]);
        if (p === 1) d.classList.add('start');
        if (p === 100) {
          d.classList.add('finish');
          var tr = document.createElement('img'); tr.src = 'assets/images/ikon_piala_juara.png'; tr.alt = ''; tr.className = 'trophy'; d.appendChild(tr);
        }
        div('num', nums, p);
      }
      svg = mk('svg', { viewBox: '0 0 100 100', class: 'jumps', 'aria-hidden': 'true' });
      jumpEls = {};
      Object.keys(U.CONFIG.ladders).forEach(function (a) { var g = mk('g', { class: 'jump' }, svg); drawLadder(+a, U.CONFIG.ladders[a], g); jumpEls[a] = g; });
      Object.keys(U.CONFIG.snakes).forEach(function (a, i) { var g = mk('g', { class: 'jump' }, svg); drawSnake(+a, U.CONFIG.snakes[a], g, SNAKE_COL[i % SNAKE_COL.length]); jumpEls[a] = g; });
      root.appendChild(svg);
      layer = div('pawns', root); pawns = []; posArr = [];
      root.appendChild(nums);                         // angka di atas bidak: selalu terbaca
      div('tag-start', root, 'START');
      var fin = div('tag-finish', root); fin.appendChild(div('', fin, 'FINISH')); fin.firstChild.className = 'sm'; fin.appendChild(document.createTextNode('100'));
      built = true;
      if (!ro && window.ResizeObserver) { ro = new ResizeObserver(function () { U.Board.fit(); }); ro.observe(root.parentNode); }
      U.Board.fit();
    },
    /* Papan persegi terbesar yang muat di slot (disisakan ruang untuk papan FINISH di atas). */
    fit: function () {
      if (!built) return;
      var slot = root.parentNode, w = slot.clientWidth, h = slot.clientHeight, s = Math.floor(Math.min(w, h / 1.04));
      if (s < 50) return;
      if (root._s === s) return; root._s = s;
      root.style.width = root.style.height = s + 'px'; root.style.marginTop = Math.round(s * 0.035) + 'px';
      root.style.setProperty('--u', (s / 100) + 'px');
    },
    setPawns: function (players) {
      layer.innerHTML = ''; pawns = []; posArr = []; activeIdx = -1;
      players.forEach(function (p) {
        var d = div('pawn', layer), im = document.createElement('img');
        im.alt = p.name; im.src = p.img; d.appendChild(im);       // DOM API: nama tidak pernah masuk ke HTML mentah
        d.style.setProperty('--pc', p.color); pawns.push(d); posArr.push(1);
      });
      U.Board.layout();
    },
    setActive: function (i) { activeIdx = i; pawns.forEach(function (d, k) { d.classList.toggle('active', k === i); }); },
    setPos: function (i, p, ms) { posArr[i] = p; pawns[i].style.setProperty('--dur', (ms || 240) + 'ms'); U.Board.layout(); },
    pawnEl: function (i) { return pawns[i]; },
    pawnImg: function (i) { return pawns[i] && pawns[i].firstChild; },
    jumpEl: function (a) { return jumpEls[a]; },
    /* Jeda: bekukan transisi bidak di posisi saat ini, lanjutkan saat resume. */
    freeze: function () {
      if (frozen) return; frozen = true;
      pawns.forEach(function (d) { var cs = getComputedStyle(d); d.style.transition = 'none'; d.style.left = cs.left; d.style.top = cs.top; });
    },
    unfreeze: function () {
      if (!frozen) return; frozen = false;
      pawns.forEach(function (d) { void d.offsetWidth; d.style.transition = ''; }); U.Board.layout();
    },
    layout: function () {
      if (frozen) return;
      var groups = {};
      posArr.forEach(function (p, i) { (groups[p] = groups[p] || []).push(i); });
      Object.keys(groups).forEach(function (p) {
        var ids = groups[p], n = ids.length, xy = pos(+p);
        var slots = n === 1 ? [[0, 0]] : n === 2 ? [[-2.6, .6], [2.6, -.6]] :
          n === 3 ? [[-2.8, 1.2], [2.8, 1.2], [0, -1.8]] : [[-2.8, 1.8], [2.8, 1.8], [-2.8, -1.8], [2.8, -1.8]];
        ids.forEach(function (i, k) {
          var d = pawns[i], s = slots[k];
          d.style.left = (xy.x + s[0]) + '%'; d.style.top = (xy.y + s[1] + 3.4) + '%';
          d.style.zIndex = Math.round((xy.y + s[1]) * 10) + (i === activeIdx ? 5 : 0);
          d.classList.toggle('small', n > 1);
        });
      });
    }
  };
})(window.UTD);
