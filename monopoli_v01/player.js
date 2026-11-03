/* player.js - daftar dino, pembuatan pemain, panel info pemain */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const DINOS = [
    { id: 'biru', name: 'Dino Biru', img: 'assets/dino-biru.png', color: '#2f8cff' },
    { id: 'merah', name: 'Dino Merah', img: 'assets/dino-merah.png', color: '#f2453d' },
    { id: 'kuning', name: 'Dino Kuning', img: 'assets/dino-kuning.png', color: '#ffc61a' },
    { id: 'hijau', name: 'Dino Hijau', img: 'assets/dino-hijau.png', color: '#2fc653' },
    { id: 'ptero', name: 'Pterosaurus Oranye', img: 'assets/dino-ptero.png', color: '#ff8a1f' }
  ];
  const dinoById = (id) => DINOS.find((d) => d.id === id) || DINOS[0];

  function create(cfgs, startMoney) {
    return cfgs.map((c, i) => {
      const d = dinoById(c.dino);
      return {
        id: i, name: (c.name || d.name).slice(0, 14), dino: d.id, img: d.img, color: d.color, cpu: !!c.cpu,
        money: startMoney, pos: 0, jail: false, jailTurns: 0, jf: [], out: false,
        stats: { rentPaid: 0, rentGot: 0, bought: 0, built: 0, laps: 0, turns: 0, taxPaid: 0 }
      };
    });
  }

  let host = null;
  function renderPanels(S, el) {
    host = el || host;
    if (!host || !S) return;
    const e = MD.util.esc;
    host.innerHTML = S.players.map((p) => {
      const props = S.tiles.reduce((n, t) => n + (t.o === p.id ? 1 : 0), 0);
      const tags = (p.cpu ? '<span class="tag">CPU</span>' : '') + (p.jail ? '<span class="tag warn">Penjara</span>' : '') + (p.jf.length ? '<span class="tag ok">Bebas x' + p.jf.length + '</span>' : '') + (p.out ? '<span class="tag bad">Bangkrut</span>' : '');
      return '<div class="pcard' + (S.cur === p.id && !S.over ? ' turn' : '') + (p.out ? ' out' : '') + '" data-p="' + p.id + '" style="--pc:' + p.color + '">' +
        '<img class="pav" alt="" src="' + p.img + '"><div class="pinfo"><b class="pname">' + e(p.name) + '</b>' +
        '<span class="pmoney">' + MD.util.fmt(p.money) + '</span><span class="pmeta">' + props + ' properti ' + tags + '</span></div></div>';
    }).join('');
  }

  function flash(S, pi, delta) {
    if (!host || !delta) return;
    const card = host.querySelector('.pcard[data-p="' + pi + '"]');
    if (!card) return;
    const f = document.createElement('span');
    f.className = 'flash ' + (delta > 0 ? 'plus' : 'minus');
    f.textContent = (delta > 0 ? '+' : '-') + MD.util.fmt(Math.abs(delta)).replace('Rp ', '');
    card.appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }

  MD.Players = { DINOS, dinoById, create, renderPanels, flash };
})(window.MD);
