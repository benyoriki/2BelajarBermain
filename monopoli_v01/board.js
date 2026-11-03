/* board.js - data papan (36 petak), render HTML/CSS, posisi & animasi bidak */
window.MD = window.MD || {};
(function (MD) {
  'use strict';

  /* ---------- util umum ---------- */
  MD.util = {
    fmt(n) { n = Math.round(n); const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (n < 0 ? '-' : '') + 'Rp ' + s; },
    esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    rnd(n) { return Math.floor(Math.random() * n); },
    shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  };

  const CONST = { N: 36, START_BONUS: 300, JAIL_FINE: 100, JAIL_POS: 9, BONUS: 150 };

  const GROUPS = {
    g1: { name: 'Hijau Rimba', color: '#2fc653', house: 50 },
    g2: { name: 'Ungu Kristal', color: '#a05af2', house: 50 },
    g3: { name: 'Biru Pantai', color: '#2f9bff', house: 100 },
    g4: { name: 'Kuning Savana', color: '#ffc61a', house: 100 },
    g5: { name: 'Toska Pulau', color: '#16c9b6', house: 150 },
    g6: { name: 'Merah Lava', color: '#f2453d', house: 150 },
    g7: { name: 'Oranye Bukit', color: '#ff8a1f', house: 200 },
    g8: { name: 'Pink Kota', color: '#ff5cae', house: 200 }
  };

  const r5 = (x) => Math.round(x / 5) * 5;
  function P(id, name, price, group) {
    return { id, name, type: 'prop', price, group, rent: [r5(price * 0.1), r5(price * 0.5), r5(price * 1.4), r5(price * 3.2), r5(price * 4.4), r5(price * 5.4)] };
  }
  function R(id, name) { return { id, name, type: 'rail', price: 400, rent: [50, 100, 200, 400] }; }
  function X(id, name, type) { return { id, name, type }; }

  const TILES = [
    X(0, 'MULAI', 'start'),
    P(1, 'Hutan Dino', 200, 'g1'), X(2, 'Kesempatan', 'chance'), P(3, 'Kebun Pakis', 220, 'g1'),
    X(4, 'Pajak', 'tax'), R(5, 'Kereta Dino'), P(6, 'Taman Fosil', 260, 'g2'),
    X(7, 'Kejutan', 'surprise'), P(8, 'Gua Kristal', 280, 'g2'),
    X(9, 'PENJARA', 'jail'),
    P(10, 'Pantai Fosil', 300, 'g3'), X(11, 'Bonus', 'bonus'), P(12, 'Danau Dino', 320, 'g3'),
    P(13, 'Sungai Purba', 340, 'g3'), R(14, 'Perahu Purba'), P(15, 'Padang Rumput', 380, 'g4'),
    X(16, 'Aksi', 'action'), P(17, 'Lembah Dino', 400, 'g4'),
    X(18, 'PARKIR GRATIS', 'park'),
    P(19, 'Pulau Dino', 420, 'g5'), X(20, 'Kesempatan', 'chance'), P(21, 'Hutan Purba', 440, 'g5'),
    P(22, 'Taman Jurassic', 460, 'g5'), R(23, 'Balon Ptero'), P(24, 'Gunung Api', 500, 'g6'),
    X(25, 'Kejutan', 'surprise'), P(26, 'Ladang Lava', 520, 'g6'),
    X(27, 'MASUK PENJARA', 'gotojail'),
    P(28, 'Bukit Dino', 560, 'g7'), X(29, 'Aksi', 'action'), P(30, 'Telur Dino', 580, 'g7'),
    X(31, 'Pajak', 'tax'), P(32, 'Kota Dino', 650, 'g8'), R(33, 'Kereta Jurassic'),
    P(34, 'Pasar Dino', 750, 'g8'), X(35, 'Bonus', 'bonus')
  ];

  const GROUP_IDS = {};
  TILES.forEach((t) => { if (t.group) (GROUP_IDS[t.group] = GROUP_IDS[t.group] || []).push(t.id); });

  const ICON = {
    start: 'assets/finish.png', jail: 'assets/penjara.png', gotojail: 'assets/bendera.png',
    chance: 'assets/kartu-kesempatan.png', surprise: 'assets/kartu-kejutan.png',
    action: 'assets/kartu-aksi.png', tax: 'assets/kartu-pajak.png', bonus: 'assets/koin.png',
    park: 'assets/mahkota.png'
  };
  const TRAIN_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="16" rx="5" fill="#3b82f6" stroke="#12356b" stroke-width="2"/><rect x="9" y="10" width="6" height="6" rx="1.5" fill="#dff1ff"/><rect x="17" y="10" width="6" height="6" rx="1.5" fill="#dff1ff"/><circle cx="11" cy="25" r="3" fill="#ffc61a" stroke="#12356b" stroke-width="1.5"/><circle cx="21" cy="25" r="3" fill="#ffc61a" stroke="#12356b" stroke-width="1.5"/></svg>';

  /* posisi grid petak: kolom/baris 0..9; MULAI di kanan-bawah, searah jarum jam terbalik */
  function colrow(i) {
    if (i === 0) return [9, 9];
    if (i <= 8) return [9 - i, 9];
    if (i === 9) return [0, 9];
    if (i <= 17) return [0, 9 - (i - 9)];
    if (i === 18) return [0, 0];
    if (i <= 26) return [i - 18, 0];
    if (i === 27) return [9, 0];
    return [9, i - 27];
  }
  function side(i) { if (i % 9 === 0) return 'corner'; if (i < 9) return 'b'; if (i < 18) return 'l'; if (i < 27) return 't'; return 'r'; }
  // total lebar grid: 1.5 + 8 + 1.5 = 11 fr
  function axis(c) { return c === 0 ? 0.75 / 11 : c === 9 ? (1.5 + 8 + 0.75) / 11 : (1.5 + (c - 1) + 0.5) / 11; }
  function xy(i) { const [c, r] = colrow(i); return { x: axis(c) * 100, y: axis(r) * 100 }; }

  const SHORT = { chance: 'Kese&shy;mpatan', surprise: 'Kejutan', action: 'Aksi', tax: 'Pajak' };
  const el = {};
  let root = null;

  function tileHTML(t) {
    const [c, r] = colrow(t.id);
    const sd = side(t.id);
    const style = 'grid-column:' + (c + 1) + ';grid-row:' + (r + 1);
    let inner = '';
    let cls = 'tile s-' + sd + ' t-' + t.type;
    const e = MD.util.esc;
    if (t.type === 'prop') {
      inner = '<div class="band" style="background:' + GROUPS[t.group].color + '"><span class="bld"></span></div><div class="tbody"><b class="tname">' + e(t.name) + '</b><span class="tprice">' + MD.util.fmt(t.price).replace('Rp ', '') + '</span></div>';
    } else if (t.type === 'rail') {
      inner = '<div class="tbody"><span class="ticon svg">' + TRAIN_SVG + '</span><b class="tname">' + e(t.name) + '</b><span class="tprice">' + t.price + '</span></div>';
    } else if (t.type === 'start') {
      inner = '<div class="tbody"><img class="ticon" alt="" src="' + ICON.start + '"><b class="tname big">MULAI</b><span class="tprice">+' + CONST.START_BONUS + '</span></div>';
    } else if (t.type === 'jail') {
      inner = '<div class="tbody"><img class="ticon" alt="" src="' + ICON.jail + '"><b class="tname">PENJARA</b><span class="tprice">Hanya lewat</span></div>';
    } else if (t.type === 'park') {
      inner = '<div class="tbody"><span class="ticon p">P</span><b class="tname">PARKIR GRATIS</b></div>';
    } else if (t.type === 'gotojail') {
      inner = '<div class="tbody"><img class="ticon" alt="" src="' + ICON.gotojail + '"><b class="tname">MASUK PENJARA</b></div>';
    } else if (t.type === 'bonus') {
      inner = '<div class="tbody"><img class="ticon" alt="" src="' + ICON.bonus + '"><b class="tname">Bonus</b><span class="tprice">+' + CONST.BONUS + '</span></div>';
    } else {
      inner = '<div class="tbody"><img class="ticon card" alt="" src="' + ICON[t.type] + '"><b class="tname">' + SHORT[t.type] + '</b></div>';
    }
    inner += '<i class="own"></i>';
    return '<div class="' + cls + '" data-id="' + t.id + '" data-nav tabindex="-1" role="button" aria-label="' + e(t.name) + '" style="' + style + '">' + inner + '</div>';
  }

  function render(container) {
    root = container;
    let h = '<div class="tiles">' + TILES.map(tileHTML).join('') + '</div>';
    h += '<div class="center"><div class="center-art"></div>' +
      '<div class="dice-zone"><div class="die" id="die1"></div><div class="die" id="die2"></div></div>' +
      '<div class="center-msg" id="centerMsg"></div></div><div class="tokens" id="tokens"></div>';
    container.innerHTML = h;
    ['die1', 'die2'].forEach((id) => {
      const d = container.querySelector('#' + id);
      d.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
      setFace(d, id === 'die1' ? 5 : 2);
    });
    el.tokens = container.querySelector('#tokens');
    el.tiles = {};
    container.querySelectorAll('.tile').forEach((n) => { el.tiles[n.dataset.id] = n; });
  }

  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  function setFace(d, n) {
    d.dataset.face = n;
    const on = PIPS[n] || [];
    Array.prototype.forEach.call(d.children, (p, i) => p.classList.toggle('on', on.indexOf(i + 1) >= 0));
  }

  function updateTile(id, S) {
    const n = el.tiles && el.tiles[id];
    if (!n) return;
    const st = S.tiles[id];
    const T = TILES[id];
    if (T.type !== 'prop' && T.type !== 'rail') return;
    const own = n.querySelector('.own');
    if (st.o >= 0) {
      own.style.background = S.players[st.o].color;
      own.className = 'own on';
      n.dataset.owner = st.o;
      n.style.setProperty('--oc', S.players[st.o].color);
    } else { own.className = 'own'; n.removeAttribute('data-owner'); n.style.removeProperty('--oc'); }
    n.classList.toggle('mortgaged', !!st.m);
    const b = n.querySelector('.bld');
    if (b) {
      if (st.h >= 5) b.innerHTML = '<img alt="Hotel" src="assets/hotel.png">';
      else b.innerHTML = '<img alt="Rumah" src="assets/rumah.png">'.repeat(st.h);
    }
  }

  function updateAll(S) { for (let i = 0; i < CONST.N; i++) updateTile(i, S); }

  function buildTokens(S) {
    el.tokens.innerHTML = S.players.map((p, i) => '<img class="token" data-p="' + i + '" alt="' + MD.util.esc(p.name) + '" src="' + p.img + '">').join('');
    layoutTokens(S);
  }

  function layoutTokens(S) {
    if (!el.tokens) return;
    const groups = {};
    S.players.forEach((p) => { if (!p.out) (groups[p.pos] = groups[p.pos] || []).push(p.id); });
    Object.keys(el.tiles || {}).forEach((k) => { el.tiles[k].classList.toggle('occupied', !!groups[k]); });
    S.players.forEach((p) => {
      const t = el.tokens.querySelector('.token[data-p="' + p.id + '"]');
      if (!t) return;
      t.style.display = p.out ? 'none' : '';
      const c = xy(p.pos);
      const g = groups[p.pos] || [p.id];
      const k = g.indexOf(p.id);
      const off = (k - (g.length - 1) / 2);
      t.style.left = (c.x + off * 3.2) + '%';
      t.style.top = (c.y + (g.length > 1 ? (k % 2 ? 1.2 : -1.2) : 0) - 1.2) + '%';
      t.style.zIndex = 10 + k;
      t.classList.toggle('active', S.cur === p.id);
    });
  }

  function hop(i) {
    const t = el.tokens && el.tokens.querySelector('.token[data-p="' + i + '"]');
    if (!t) return;
    t.classList.remove('hop'); void t.offsetWidth; t.classList.add('hop');
  }

  MD.Board = {
    CONST, GROUPS, TILES, GROUP_IDS, ICON,
    render, updateTile, updateAll, buildTokens, layoutTokens, hop, setFace, xy,
    center(msg) { const m = document.getElementById('centerMsg'); if (m) m.textContent = msg || ''; },
    dice() { return [root && root.querySelector('#die1'), root && root.querySelector('#die2')]; },
    houseCost(id) { const g = GROUPS[TILES[id].group]; return g ? g.house : 0; },
    mortgageValue(id) { return TILES[id].price / 2; },
    unmortgageCost(id) { return Math.ceil(TILES[id].price * 0.55 / 5) * 5; },
    nearest(type, pos) { for (let k = 1; k <= CONST.N; k++) { const i = (pos + k) % CONST.N; if (TILES[i].type === type) return i; } return pos; },
    tileEl(id) { return el.tiles && el.tiles[id]; }
  };
})(window.MD);
