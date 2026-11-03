/* script.js - aplikasi: layar, modal, panel aksi, pengaturan, panduan, setup, layar menang */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const B = MD.Board, E = MD.Eco, U = MD.util, K = B.CONST;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = U.esc, fmt = U.fmt;
  const S = () => MD.Game.S;
  const UI = {};
  let settings = MD.Storage.getSettings();

  /* =============== pengaturan =============== */
  function isTVAgent() {
    return /SMART-TV|SmartTV|Tizen|Web0S|WebOS|Android ?TV|AFTM|AFTT|BRAVIA|HbbTV|CrKey|NetCast|Roku|GoogleTV|Viera|Philips/i.test(navigator.userAgent) || /[?&]tv=1/.test(location.search);
  }
  function applySettings() {
    const tv = settings.tv === 'on' || (settings.tv === 'auto' && isTVAgent());
    document.documentElement.classList.toggle('tv-mode', tv);
    document.documentElement.classList.toggle('big-text', !!settings.bigText);
    MD.Sound.setEnabled(settings.sound);
    MD.tvMode = tv;
  }
  function setSetting(k, v) { settings[k] = v; MD.Storage.saveSettings(settings); applySettings(); }

  /* =============== layar =============== */
  function showScreen(name) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
    if (MD.TV) MD.TV.focusScreen();
  }

  /* =============== modal =============== */
  const modals = [];
  function syncInert() {
    const app = $('#app');
    if (app) { if (modals.length) app.setAttribute('inert', ''); else app.removeAttribute('inert'); }
  }
  /* opts: {title, html, cls, dismiss(value saat Esc/null=tidak bisa), buttons:[{label,value,cls,primary,collect,validate}], onOpen(el), refresh(el), noFocus} */
  function modal(opts) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'modal';
      wrap.innerHTML = '<div class="mback"></div><div class="mbox ' + (opts.cls || '') + '" role="dialog" aria-modal="true">' +
        (opts.title ? '<h2 class="mtitle">' + opts.title + '</h2>' : '') + '<div class="mbody">' + (opts.html || '') + '</div><p class="merr" role="alert"></p>' +
        '<div class="mfoot">' + (opts.buttons || []).map((b, i) => '<button type="button" class="btn ' + (b.cls || 'blue') + '" data-i="' + i + '"' + (b.primary ? ' data-primary data-autofocus' : '') + '>' + b.label + '</button>').join('') + '</div></div>';
      const m = { el: wrap, opts, prev: document.activeElement, done: false };
      m.close = (v) => {
        if (m.done) return;
        m.done = true;
        const i = modals.indexOf(m);
        if (i >= 0) modals.splice(i, 1);
        wrap.remove();
        syncInert();
        if (m.timer) clearTimeout(m.timer);
        resolve(v);
        if (MD.TV) MD.TV.restore(m.prev);
      };
      wrap.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.mfoot .btn');
        if (btn && wrap.contains(btn)) {
          MD.Sound.play('click');
          const b = opts.buttons[+btn.dataset.i];
          let val = b.value;
          if (b.collect) val = b.collect(wrap);
          if (b.validate) { const r = b.validate(wrap, val); if (r !== true) { $('.merr', wrap).textContent = r || 'Tidak valid'; return; } }
          m.close(val);
        } else if (ev.target.classList.contains('mback') && opts.dismiss !== null && opts.dismiss !== undefined && !opts.noBackdropClose) m.close(opts.dismiss);
      });
      m.dismiss = () => { if (opts.dismiss !== null && opts.dismiss !== undefined) { m.close(opts.dismiss); return true; } return false; };
      modals.push(m);
      $('#modal-root').appendChild(wrap);
      syncInert();
      requestAnimationFrame(() => wrap.classList.add('open'));
      if (opts.onOpen) opts.onOpen(wrap, m);
      if (MD.TV) MD.TV.focusModal(wrap);
    });
  }
  UI.modal = modal;
  UI.topModal = () => modals[modals.length - 1] || null;
  UI.closeAllModals = () => { modals.slice().forEach((m) => m.close('abort')); };
  UI.hasModal = () => modals.length > 0;
  UI.refreshOpen = () => { modals.forEach((m) => { if (m.opts.refresh && !m.done) m.opts.refresh(m.el); }); };
  function confirmBox(title, text, yes, no) {
    return modal({ title, html: '<p>' + text + '</p>', dismiss: false, buttons: [{ label: no || 'Batal', value: false, cls: 'gray' }, { label: yes || 'Ya', value: true, cls: 'red', primary: true }] });
  }

  /* =============== toast =============== */
  UI.toast = function (msg, kind) {
    const root = $('#toast-root');
    if (!root) return;
    while (root.children.length >= 3) root.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  };
  UI.centerMsg = (m) => B.center(m);

  /* =============== kartu properti (deed) =============== */
  function deedHTML(id) {
    const T = B.TILES[id], s = S(), st = s ? s.tiles[id] : null, e = esc;
    if (T.type === 'prop') {
      const g = B.GROUPS[T.group];
      const rows = ['Sewa dasar', 'Satu grup lengkap', '1 rumah', '2 rumah', '3 rumah', '4 rumah', 'Hotel'];
      const vals = [T.rent[0], T.rent[0] * 2, T.rent[1], T.rent[2], T.rent[3], T.rent[4], T.rent[5]];
      return '<div class="deed" style="--gc:' + g.color + '"><div class="dhead">' + e(T.name) + '</div><div class="dsub">' + g.name + ' - Harga ' + fmt(T.price) + '</div><table class="rents">' +
        rows.map((r, i) => '<tr><td>' + r + '</td><td>' + fmt(vals[i]) + '</td></tr>').join('') + '</table><p class="dnote">Biaya rumah ' + fmt(B.houseCost(id)) + ' - Gadai ' + fmt(B.mortgageValue(id)) + '</p>' + ownerLine(st) + '</div>';
    }
    if (T.type === 'rail') {
      return '<div class="deed" style="--gc:#3b82f6"><div class="dhead">' + e(T.name) + '</div><div class="dsub">Transportasi - Harga ' + fmt(T.price) + '</div><table class="rents">' +
        T.rent.map((r, i) => '<tr><td>Punya ' + (i + 1) + ' transportasi</td><td>' + fmt(r) + '</td></tr>').join('') + '</table><p class="dnote">Gadai ' + fmt(B.mortgageValue(id)) + '</p>' + ownerLine(st) + '</div>';
    }
    const txt = {
      start: 'Setiap melewati atau berhenti di MULAI, terima ' + fmt(K.START_BONUS) + '.', jail: 'Hanya lewat. Pemain yang masuk penjara berada di sini.',
      park: 'Tempat istirahat. Tidak ada yang terjadi.', gotojail: 'Berhenti di sini? Langsung masuk Penjara!',
      chance: 'Ambil Kartu Kesempatan.', surprise: 'Ambil Kartu Kejutan.', action: 'Ambil Kartu Aksi.', tax: 'Ambil Kartu Pajak dan bayar sesuai kartu.', bonus: 'Terima bonus ' + fmt(K.BONUS) + ' dari Bank.'
    }[T.type];
    return '<div class="deed" style="--gc:#8e7cff"><div class="dhead">' + e(T.name) + '</div><p class="dnote big">' + txt + '</p></div>';
    function ownerLine(stt) {
      if (!stt || !s) return '';
      if (stt.o < 0) return '<p class="down">Belum ada pemilik</p>';
      return '<p class="down" style="--pc:' + s.players[stt.o].color + '">Milik ' + e(s.players[stt.o].name) + (stt.m ? ' (digadaikan)' : '') + (stt.h ? ' - ' + (stt.h >= 5 ? 'Hotel' : stt.h + ' rumah') : '') + '</p>';
    }
  }
  function showDeed(id) { return modal({ html: deedHTML(id), cls: 'deedbox', dismiss: true, buttons: [{ label: 'Tutup', value: true, cls: 'blue', primary: true }] }); }

  /* =============== dialog permainan =============== */
  UI.buyPrompt = function (p, id) {
    const T = B.TILES[id];
    return modal({
      title: p.name + ', beli ' + esc(T.name) + '?', html: deedHTML(id) + '<p class="bal">Saldo kamu: <b>' + fmt(p.money) + '</b></p>', dismiss: false, cls: 'deedbox',
      buttons: [{ label: 'Lewati', value: false, cls: 'gray' }, { label: 'Beli ' + fmt(T.price), value: true, cls: 'green', primary: true }]
    });
  };
  UI.showCard = function (card, p) {
    const D = MD.Cards.DECKS[card.deck];
    const auto = p.cpu;
    const prom = modal({
      title: esc(D.name), cls: 'cardbox', dismiss: true, html: '<div class="gcard" style="--cc:' + D.color + '"><img alt="" src="' + D.img + '"><p>' + esc(card.t) + '</p><small>' + esc(p.name) + '</small></div>',
      buttons: [{ label: 'OK', value: true, cls: 'blue', primary: true }],
      onOpen: (el, m) => { if (auto) m.timer = setTimeout(() => m.close(true), MD.turbo ? 0 : 1900 * (settings.speed === 'fast' ? 0.5 : 1)); }
    });
    return prom;
  };
  UI.tradeProposal = function (a, b, offer) {
    const list = (o) => (o.props.map((i) => esc(B.TILES[i].name)).concat(o.cash ? [fmt(o.cash)] : [])).join(', ') || '(tidak ada)';
    return modal({
      title: b.name + ', ada tawaran tukar!', dismiss: false,
      html: '<p><b>' + esc(a.name) + '</b> memberi: ' + list(offer.give) + '</p><p><b>' + esc(a.name) + '</b> meminta: ' + list(offer.get) + '</p><p class="bal">Saldo ' + esc(b.name) + ': <b>' + fmt(b.money) + '</b></p>',
      buttons: [{ label: 'Tolak', value: false, cls: 'red' }, { label: 'Terima', value: true, cls: 'green', primary: true }]
    });
  };

  /* ---------- kelola aset (bangun / gadai / jual) ---------- */
  function manageHTML(p, tab) {
    const s = S();
    const ids = E.owned(p.id);
    if (!ids.length) return '<div class="empty-card"><img alt="" src="assets/kartu-properti.png"><b>Belum punya properti</b><span>Berhenti di petak kosong, lalu tekan Beli untuk mulai mengoleksi.</span></div>';
    return '<ul class="mlist">' + ids.map((i) => {
      const T = B.TILES[i], st = s.tiles[i];
      const col = T.type === 'prop' ? B.GROUPS[T.group].color : '#3b82f6';
      const chips = (st.m ? '<span class="tag warn">Gadai</span>' : '') + (st.h >= 5 ? '<span class="tag ok">Hotel</span>' : st.h > 0 ? '<span class="tag ok">' + st.h + ' rumah</span>' : '') + (E.monopoly(p.id, i) ? '<span class="tag">Monopoli</span>' : '');
      let btns = '';
      if (tab === 'bangun' && T.type === 'prop') {
        const r = E.canBuild(p.id, i);
        btns = '<button class="btn mini green" data-act="build" data-id="' + i + '"' + (r === true ? '' : ' disabled title="' + esc(r) + '"') + '>+ ' + fmt(B.houseCost(i)) + '</button>' +
          '<button class="btn mini orange" data-act="sellb" data-id="' + i + '"' + (E.canSellBuilding(p.id, i) ? '' : ' disabled') + '>- ' + fmt(B.houseCost(i) / 2) + '</button>';
      } else if (tab === 'gadai') {
        btns = (st.m ? '<button class="btn mini blue" data-act="unm" data-id="' + i + '"' + (E.canUnmortgage(p.id, i) ? '' : ' disabled') + '>Tebus ' + fmt(B.unmortgageCost(i)) + '</button>'
          : '<button class="btn mini orange" data-act="mort" data-id="' + i + '"' + (E.canMortgage(p.id, i) ? '' : ' disabled') + '>Gadai +' + fmt(B.mortgageValue(i)) + '</button>') +
          '<button class="btn mini red" data-act="sell" data-id="' + i + '"' + (E.canSellProp(p.id, i) ? '' : ' disabled') + '>Jual +' + fmt(B.mortgageValue(i)) + '</button>';
      } else { btns = '<button class="btn mini gray" data-act="deed" data-id="' + i + '">Lihat</button>'; }
      return '<li class="mrow"><i class="dot" style="background:' + col + '"></i><div class="mname"><b>' + esc(T.name) + '</b><span>' + chips + '</span></div><div class="mbtns">' + btns + '</div></li>';
    }).join('') + '</ul>';
  }
  function bindManage(root, p, getTab) {
    root.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const id = +b.dataset.id, act = b.dataset.act;
      if (act === 'deed') { showDeed(id); return; }
      const ok = { build: () => E.build(p.id, id), sellb: () => E.sellBuilding(p.id, id), mort: () => E.mortgage(p.id, id), unm: () => E.unmortgage(p.id, id), sell: () => E.sellProp(p.id, id) }[act]();
      MD.Sound.play(ok ? 'coin' : 'click');
    });
  }
  UI.manage = function (tab) {
    const s = S(), p = MD.Game.cur();
    if (!s || p.cpu) return;
    let cur = tab || 'aset';
    const tabs = [['aset', 'Aset'], ['bangun', 'Bangun'], ['gadai', 'Gadai & Jual']];
    const draw = (el) => {
      $('.mtabs', el).innerHTML = tabs.map((t) => '<button class="btn mini ' + (t[0] === cur ? 'blue' : 'gray') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('');
      $('.mhead b', el).textContent = fmt(p.money);
      $('.mwrap', el).innerHTML = manageHTML(p, cur) + (cur === 'bangun' ? '<p class="hint">Syarat: miliki semua petak satu warna. Bangun merata (maks. 4 rumah lalu hotel).</p>' : cur === 'gadai' ? '<p class="hint">Gadai hanya jika tidak ada bangunan di grup warna itu.</p>' : '');
    };
    return modal({
      title: 'Aset ' + esc(p.name), cls: 'managebox', dismiss: true, html: '<div class="mhead">Saldo: <b></b></div><div class="mtabs"></div><div class="mwrap"></div>',
      buttons: [{ label: 'Selesai', value: true, cls: 'blue', primary: true }],
      onOpen: (el) => {
        draw(el); bindManage(el, p);
        $('.mtabs', el).addEventListener('click', (ev) => { const t = ev.target.closest('[data-tab]'); if (t) { cur = t.dataset.tab; draw(el); if (MD.TV) MD.TV.ensureFocus(el); } });
      },
      refresh: draw
    });
  };

  UI.debt = function (p, amt, cred, reason) {
    const s = S();
    const to = cred >= 0 ? s.players[cred].name : 'Bank';
    let cur = 'gadai';
    const draw = (el) => {
      $('.mhead b', el).textContent = fmt(p.money);
      $('.mwrap', el).innerHTML = manageHTML(p, cur === 'bangun' ? 'bangun' : 'gadai');
      const pay = $('[data-i="1"]', el);
      if (pay) pay.disabled = p.money < amt;
      $('.dneed', el).textContent = p.money >= amt ? 'Uangmu cukup. Tekan Bayar.' : 'Kurang ' + fmt(amt - p.money) + '. Gadai/jual aset, atau menyerah.';
    };
    return modal({
      title: esc(p.name) + ' harus membayar ' + fmt(amt), cls: 'managebox debt', dismiss: null, noBackdropClose: true,
      html: '<p class="dsub2">Kepada ' + esc(to) + ' - ' + esc(reason) + '</p><div class="mhead">Saldo: <b></b></div><p class="dneed"></p><div class="mwrap"></div>',
      buttons: [{ label: 'Menyerah (Bangkrut)', value: 'bankrupt', cls: 'red' }, { label: 'Bayar ' + fmt(amt), value: 'paid', cls: 'green', primary: true }],
      onOpen: (el) => { draw(el); bindManage(el, p); },
      refresh: draw
    });
  };

  /* ---------- tukar properti ---------- */
  UI.trade = function () {
    const s = S(), p = MD.Game.cur();
    if (!s || p.cpu) return;
    const others = s.players.filter((q) => q.id !== p.id && !q.out);
    let partner = others[0].id;
    const tradable = (pi) => E.owned(pi).filter((i) => !E.groupOf(i).some((g) => s.tiles[g].h > 0));
    const draw = (el) => {
      const q = s.players[partner];
      $('.tpartners', el).innerHTML = others.map((o) => '<button class="btn mini ' + (o.id === partner ? 'blue' : 'gray') + '" data-pt="' + o.id + '"><img alt="" src="' + o.img + '">' + esc(o.name) + '</button>').join('');
      const col = (pl, key) => '<div class="tcol"><h3>' + (key === 'give' ? 'Kamu beri' : 'Kamu minta') + '</h3>' + (tradable(pl.id).map((i) => '<label class="chk"><input type="checkbox" data-k="' + key + '" value="' + i + '"><span>' + esc(B.TILES[i].name) + '</span></label>').join('') || '<p class="empty">Tidak ada properti yang bisa ditukar</p>') +
        '<label class="cash">Uang <input type="number" inputmode="numeric" min="0" step="50" value="0" data-cash="' + key + '"></label></div>';
      $('.tcols', el).innerHTML = col(p, 'give') + col(q, 'get');
    };
    return modal({
      title: 'Tukar dengan pemain lain', cls: 'managebox tradebox', dismiss: false,
      html: '<div class="tpartners"></div><div class="tcols"></div>',
      buttons: [{ label: 'Batal', value: null, cls: 'gray' }, {
        label: 'Ajukan Tawaran', cls: 'green', primary: true,
        collect: (el) => {
          const pick = (k) => $$('input[data-k="' + k + '"]:checked', el).map((c) => +c.value);
          const cash = (k) => Math.max(0, Math.round(+($('input[data-cash="' + k + '"]', el).value) || 0));
          return { to: partner, offer: { give: { props: pick('give'), cash: cash('give') }, get: { props: pick('get'), cash: cash('get') } } };
        },
        validate: (el, v) => E.validateTrade(p.id, v.to, v.offer)
      }],
      onOpen: (el) => { draw(el); el.addEventListener('click', (ev) => { const b = ev.target.closest('[data-pt]'); if (b) { partner = +b.dataset.pt; draw(el); if (MD.TV) MD.TV.ensureFocus(el); } }); }
    }).then((r) => { if (r && r.offer) return MD.Game.runTrade(p.id, r.to, r.offer); return false; });
  };

  UI.cardsInfo = function () {
    const p = MD.Game.cur();
    const D = MD.Cards.DECKS;
    modal({
      title: 'Kartu Permainan', dismiss: true, cls: 'cardsinfo',
      html: '<div class="deckrow">' + Object.keys(D).map((k) => '<div class="deckmini" style="--cc:' + D[k].color + '"><img alt="" src="' + D[k].img + '"><b>' + D[k].name.replace('Kartu ', '') + '</b></div>').join('') + '</div>' +
        '<p>Kartu Bebas Penjara milik ' + esc(p.name) + ': <b>' + p.jf.length + '</b></p><p class="hint">Berhenti di petak Kesempatan, Kejutan, Aksi, atau Pajak untuk mengambil kartu.</p>',
      buttons: [{ label: 'Tutup', value: true, cls: 'blue', primary: true }]
    });
  };

  /* =============== dadu =============== */
  UI.rollDice = function (d1, d2) {
    const ds = B.dice();
    return new Promise((res) => {
      const fast = MD.turbo;
      if (fast || !ds[0]) { B.setFace(ds[0] || document.createElement('div'), d1); B.setFace(ds[1] || document.createElement('div'), d2); return setTimeout(res, 0); }
      ds.forEach((d) => d.classList.add('rolling'));
      let n = 0;
      const max = settings.speed === 'fast' ? 5 : 9;
      const iv = setInterval(() => {
        n++;
        B.setFace(ds[0], U.rnd(6) + 1); B.setFace(ds[1], U.rnd(6) + 1);
        if (n >= max) {
          clearInterval(iv);
          B.setFace(ds[0], d1); B.setFace(ds[1], d2);
          ds.forEach((d) => d.classList.remove('rolling'));
          setTimeout(res, 250);
        }
      }, 80);
    });
  };

  const IC = {
    cards: '<svg viewBox="0 0 24 24"><path d="M5 4h9a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm13 2.5a2 2 0 011.9 2V18a2.5 2.5 0 01-2.5 2.5H8"/></svg>',
    assets: '<svg viewBox="0 0 24 24"><path d="M12 3l9.5 8.2h-3V21h-5.5v-6h-2v6H5.5v-9.8h-3z"/></svg>',
    trade: '<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3 1.4-1.4L22 8l-5.6 5.4L15 12l3-3H7zM17 17H6l3 3-1.4 1.4L2 16l5.6-5.4L9 12l-3 3h11z"/></svg>',
    build: '<svg viewBox="0 0 24 24"><path d="M14.5 3.5l6 6-2.6 2.6-1.8-1.8-8.2 8.2-3-3 8.2-8.2-1.8-1.8z"/></svg>',
    sell: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-1.2c-1.3-.2-2.3-.9-2.6-2.2h1.9c.2.5.7.8 1.4.8.8 0 1.3-.4 1.3-.9 0-.6-.5-.8-1.6-1.1-1.5-.4-2.8-.9-2.8-2.5 0-1.1.8-2 2-2.2V6h2v1.2c1.2.2 2 1 2.2 2.1h-1.8c-.2-.5-.6-.8-1.2-.8-.7 0-1.1.3-1.1.8 0 .5.4.7 1.5 1 1.6.4 2.9.9 2.9 2.6 0 1.2-.9 2.1-2.2 2.3z"/></svg>',
    guide: '<svg viewBox="0 0 24 24"><path d="M3 4.5h7a3 3 0 013 3V21a2 2 0 00-2-2H3zM21 4.5h-6.2A3 3 0 0013 5v16a2 2 0 012-2h6z"/></svg>'
  };

  /* =============== panel game =============== */
  UI.log = function (msg) {
    const ul = $('#log');
    if (ul) { const li = document.createElement('li'); li.textContent = msg; ul.appendChild(li); while (ul.children.length > 40) ul.firstChild.remove(); ul.scrollTop = ul.scrollHeight; }
    const t = $('#ticker'); if (t) t.textContent = msg;
  };
  UI.refreshPanels = function () { if (S()) MD.Players.renderPanels(S(), $('#players')); };
  UI.onChange = function () {
    UI.refreshOpen();
    renderActions();
    if (S() && !MD.Game.isBusy()) MD.Game.save();
  };

  function renderActions() {
    const s = S(), box = $('#actions');
    if (!s || !box) return;
    const p = MD.Game.cur(), busy = MD.Game.isBusy();
    const human = !p.cpu && !s.over;
    const free = human && !busy;
    $('#turnLabel').innerHTML = s.over ? 'Permainan selesai' : '<img alt="" src="' + p.img + '"> Giliran ' + esc(p.name);
    $('#turnLabel').style.setProperty('--pc', p.color);
    let h = '';
    if (s.over) h = '<button class="btn green big" data-act="results" data-primary>Lihat Hasil</button>';
    else if (!free) h = '<div class="wait">' + (p.cpu ? esc(p.name) + ' (CPU) sedang bermain...' : 'Sedang berjalan...') + '</div>';
    else if (s.phase === 'roll') {
      h = '<button class="btn green big" data-act="roll" data-primary><img alt="" src="assets/dadu-putih.png">Lempar Dadu</button>';
      if (p.jail) {
        h += '<div class="jailrow"><span class="tag warn">Di Penjara (' + p.jailTurns + '/3)</span><button class="btn mini orange" data-act="fine">Bayar ' + fmt(K.JAIL_FINE) + '</button>' + (p.jf.length ? '<button class="btn mini blue" data-act="jfcard">Pakai Kartu Bebas</button>' : '') + '</div>';
      }
    } else h = '<button class="btn orange big" data-act="end" data-primary>Akhiri Giliran</button>';
    const dis = free ? '' : ' disabled';
    const ab = (act, cls, label) => '<button class="btn ab ' + cls + (act === 'guide' ? ' guide' : '') + '" data-act="' + act + '"' + (act === 'guide' ? '' : dis) + '>' + IC[{ cards: 'cards', assets: 'assets', trade: 'trade', build: 'build', sell: 'sell', guide: 'guide' }[act]] + '<span>' + label + '</span></button>';
    h += '<div class="sec">' + ab('cards', 'blue', 'Kartu') + ab('assets', 'blue', 'Aset') + ab('trade', 'purple', 'Tukar') + ab('build', 'green', 'Bangun') + ab('sell', 'red', 'Jual') + ab('guide', 'gray', 'Panduan') + '</div>';
    const dz = $('.dice-zone'); if (dz) dz.classList.toggle('ready', free && s.phase === 'roll');
    const hadFocus = box.contains(document.activeElement);
    box.innerHTML = h;
    if (hadFocus && MD.TV) MD.TV.ensureFocus($('#screen-game'));
  }
  UI.render = function () {
    const s = S();
    if (!s) return;
    UI.refreshPanels();
    B.layoutTokens(s);
    renderActions();
  };

  function onAction(act) {
    const G = MD.Game, s = S();
    if (!s) return;
    MD.Sound.play('click');
    const p = G.cur();
    switch (act) {
      case 'roll': G.roll(); break;
      case 'end': G.endTurn(); break;
      case 'fine': G.payFine(); break;
      case 'jfcard': G.useJailCard(); break;
      case 'assets': if (!G.isBusy() && !p.cpu) UI.manage('aset'); break;
      case 'build': if (!G.isBusy() && !p.cpu) UI.manage('bangun'); break;
      case 'sell': if (!G.isBusy() && !p.cpu) UI.manage('gadai'); break;
      case 'trade': if (!G.isBusy() && !p.cpu) UI.trade(); break;
      case 'cards': if (!G.isBusy() && !p.cpu) UI.cardsInfo(); break;
      case 'guide': UI.guide(); break;
      case 'results': UI.gameOver(); break;
      default: break;
    }
  }

  UI.enterGame = function () {
    const s = S();
    showScreen('game');
    B.render($('#board'));
    B.buildTokens(s);
    B.updateAll(s);
    const ul = $('#log'); ul.innerHTML = '';
    s.log.slice(-30).forEach((m) => { const li = document.createElement('li'); li.textContent = m; ul.appendChild(li); });
    $('#ticker').textContent = s.log[s.log.length - 1] || '';
    UI.render();
    B.center('Giliran ' + MD.Game.cur().name);
  };

  /* =============== pause / keluar =============== */
  UI.pause = async function () {
    const r = await modal({
      title: 'Menu', cls: 'menubox', dismiss: 'resume',
      html: '', buttons: [
        { label: 'Lanjutkan', value: 'resume', cls: 'green', primary: true },
        { label: 'Panduan', value: 'guide', cls: 'blue' },
        { label: 'Pengaturan', value: 'settings', cls: 'purple' },
        { label: 'Simpan & Menu Utama', value: 'exit', cls: 'red' }
      ]
    });
    if (r === 'guide') UI.guide();
    else if (r === 'settings') UI.settings();
    else if (r === 'exit') { MD.Game.save(); MD.Game.stop(); refreshLanding(); showScreen('landing'); }
  };
  UI.back = function () {
    const m = UI.topModal();
    if (m) { m.dismiss(); return true; }
    const scr = document.body.dataset.screen;
    if (scr === 'game') { UI.pause(); return true; }
    if (scr === 'setup') { showScreen('landing'); return true; }
    return false;
  };

  /* =============== panduan & pengaturan =============== */
  UI.guide = function () {
    return modal({
      title: 'Panduan Bermain', cls: 'guidebox', dismiss: true,
      html: '<div class="guide"><h3>Tujuan</h3><p>Jadilah pemain terakhir yang bertahan. Beli properti dino, tarik sewa, dan buat lawan bangkrut.</p>' +
        '<h3>Giliran</h3><p>Lempar dua dadu dan jalan sesuai angkanya. Double boleh lempar lagi; tiga kali double berturut-turut masuk Penjara. Lewati MULAI untuk menerima ' + fmt(K.START_BONUS) + '.</p>' +
        '<h3>Properti</h3><p>Petak kosong bisa dibeli. Jika berhenti di properti lawan, bayar sewa. Punya semua petak satu warna membuat sewa dasar dua kali lipat dan membuka pembangunan rumah (maks. 4) lalu hotel.</p>' +
        '<h3>Gadai, Jual, Tukar</h3><p>Gadai properti untuk uang cepat (tebus dengan tambahan 10%). Jual bangunan setengah harga. Tukar properti dan uang dengan pemain lain lewat tombol Tukar.</p>' +
        '<h3>Penjara</h3><p>Keluar dengan double, bayar ' + fmt(K.JAIL_FINE) + ', atau Kartu Bebas Penjara. Setelah 3 giliran wajib bayar denda.</p>' +
        '<h3>Kartu</h3><p>Petak Kesempatan, Kejutan, Aksi, dan Pajak mengambil kartu dengan efek nyata.</p>' +
        '<h3>Remote Smart TV</h3><p>Panah = pindah fokus, OK/Enter = pilih, Kembali/Esc = mundur, Spasi = aksi utama.</p></div>',
      buttons: [{ label: 'Mengerti', value: true, cls: 'green', primary: true }]
    });
  };
  UI.settings = function () {
    const seg = (key, opts) => '<div class="seg" data-key="' + key + '">' + opts.map((o) => '<button class="btn mini ' + (String(settings[key]) === String(o[0]) ? 'blue' : 'gray') + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
    const html = () => '<div class="setrow"><span>Efek suara</span>' + seg('sound', [[true, 'Nyala'], [false, 'Mati']]) + '</div>' +
      '<div class="setrow"><span>Kecepatan animasi</span>' + seg('speed', [['normal', 'Normal'], ['fast', 'Cepat']]) + '</div>' +
      '<div class="setrow"><span>Kesulitan CPU</span>' + seg('difficulty', [['mudah', 'Mudah'], ['normal', 'Normal'], ['sulit', 'Sulit']]) + '</div>' +
      '<div class="setrow"><span>Uang awal</span>' + seg('startMoney', [[2000, '2.000'], [3000, '3.000'], [5000, '5.000']]) + '</div>' +
      '<div class="setrow"><span>Mode Smart TV</span>' + seg('tv', [['auto', 'Otomatis'], ['on', 'Aktif'], ['off', 'Mati']]) + '</div>' +
      '<div class="setrow"><span>Teks besar</span>' + seg('bigText', [[true, 'Ya'], [false, 'Tidak']]) + '</div>' +
      (MD.Storage.hasGame() ? '<div class="setrow"><span>Data simpanan</span><button class="btn mini red" data-del>Hapus Save</button></div>' : '');
    return modal({
      title: 'Pengaturan', cls: 'settingsbox', dismiss: true, html: '<div class="setwrap">' + html() + '</div>',
      buttons: [{ label: 'Selesai', value: true, cls: 'green', primary: true }],
      onOpen: (el) => {
        el.addEventListener('click', async (ev) => {
          const b = ev.target.closest('[data-v]');
          if (b) {
            const key = b.parentNode.dataset.key; let v = b.dataset.v;
            if (v === 'true') v = true; else if (v === 'false') v = false; else if (key === 'startMoney') v = +v;
            setSetting(key, v); MD.Sound.play('click');
            $('.setwrap', el).innerHTML = html(); if (MD.TV) MD.TV.ensureFocus(el);
          }
          if (ev.target.closest('[data-del]')) { if (await confirmBox('Hapus data simpanan?', 'Permainan yang tersimpan akan dihapus permanen.', 'Hapus', 'Batal')) { MD.Storage.deleteGame(); refreshLanding(); $('.setwrap', el) && ($('.setwrap', el).innerHTML = html()); } }
        });
      }
    });
  };

  /* =============== setup permainan =============== */
  const setup = { mode: 'solo', count: 4, slots: [], difficulty: 'normal' };
  function initSlots() {
    const D = MD.Players.DINOS;
    setup.slots = [0, 1, 2, 3].map((i) => ({ dino: D[i].id, name: D[i].name, cpu: setup.mode === 'solo' ? i > 0 : false, custom: false }));
  }
  function drawSetup() {
    const D = MD.Players.DINOS, e = esc;
    $('#setupMode').innerHTML = [['solo', 'Solo vs CPU'], ['multi', 'Multiplayer Lokal']].map((m) => '<button class="btn ' + (setup.mode === m[0] ? 'blue' : 'gray') + '" data-mode="' + m[0] + '">' + m[1] + '</button>').join('');
    $('#setupCount').innerHTML = [2, 3, 4].map((n) => '<button class="btn mini ' + (setup.count === n ? 'blue' : 'gray') + '" data-count="' + n + '">' + n + ' Pemain</button>').join('');
    $('#setupDiff').innerHTML = [['mudah', 'Mudah'], ['normal', 'Normal'], ['sulit', 'Sulit']].map((d) => '<button class="btn mini ' + (setup.difficulty === d[0] ? 'orange' : 'gray') + '" data-diff="' + d[0] + '">' + d[1] + '</button>').join('');
    $('#setupSlots').innerHTML = setup.slots.slice(0, setup.count).map((sl, i) => {
      const d = D.find((x) => x.id === sl.dino);
      return '<div class="slot" style="--pc:' + d.color + '"><button class="btn mini gray arrow" data-prev="' + i + '" aria-label="Dino sebelumnya">&lt;</button>' +
        '<img class="sdino" alt="' + e(d.name) + '" src="' + d.img + '"><button class="btn mini gray arrow" data-next="' + i + '" aria-label="Dino berikutnya">&gt;</button>' +
        '<div class="sinfo"><input type="text" maxlength="14" value="' + e(sl.name) + '" data-name="' + i + '" aria-label="Nama pemain ' + (i + 1) + '"><button class="btn mini ' + (sl.cpu ? 'purple' : 'green') + '" data-type="' + i + '">' + (sl.cpu ? 'CPU' : 'Manusia') + '</button></div></div>';
    }).join('');
    $('#setupDiffRow').style.display = setup.slots.slice(0, setup.count).some((s) => s.cpu) ? '' : 'none';
  }
  function openSetup(mode) {
    setup.mode = mode; setup.count = mode === 'solo' ? 3 : 4; setup.difficulty = settings.difficulty; initSlots();
    drawSetup(); showScreen('setup');
  }
  function cycleDino(i, dir) {
    const D = MD.Players.DINOS, used = setup.slots.slice(0, setup.count).map((s, k) => (k === i ? null : s.dino));
    let idx = D.findIndex((d) => d.id === setup.slots[i].dino);
    for (let k = 0; k < D.length; k++) {
      idx = (idx + dir + D.length) % D.length;
      if (used.indexOf(D[idx].id) < 0) break;
    }
    const sl = setup.slots[i];
    const wasDefault = !sl.custom;
    sl.dino = D[idx].id; if (wasDefault) sl.name = D[idx].name;
  }
  function startFromSetup() {
    const slots = setup.slots.slice(0, setup.count);
    if (!slots.some((s) => !s.cpu)) { UI.toast('Minimal satu pemain harus manusia', 'bad'); return; }
    const names = {};
    const cfg = {
      players: slots.map((s, i) => {
        let n = (s.name || '').trim() || MD.Players.dinoById(s.dino).name;
        if (names[n]) n = n + ' ' + (i + 1);
        names[n] = 1;
        return { name: n, dino: s.dino, cpu: s.cpu };
      }),
      difficulty: setup.difficulty, startMoney: settings.startMoney
    };
    settings.difficulty = setup.difficulty; MD.Storage.saveSettings(settings);
    MD.Game.start(cfg);
  }

  /* =============== layar hasil =============== */
  UI.gameOver = function () {
    const s = S();
    if (!s || !s.over) return;
    const w = s.players[s.winner];
    const rank = s.players.map((p) => ({ p, nw: E.netWorth(p.id) })).sort((a, b) => (a.p.out - b.p.out) || (b.nw - a.nw));
    const rows = rank.map((r) => {
      const p = r.p, props = s.tiles.filter((t) => t.o === p.id).length;
      return '<tr class="' + (p.id === s.winner ? 'win' : p.out ? 'out' : '') + '"><td><img alt="" src="' + p.img + '"> ' + esc(p.name) + '</td><td>' + (p.out ? 'Bangkrut' : fmt(p.money)) + '</td><td>' + (p.out ? '-' : fmt(r.nw)) + '</td><td>' + props + '</td><td>' + fmt(p.stats.rentGot) + '</td><td>' + fmt(p.stats.rentPaid) + '</td><td>' + p.stats.laps + '</td></tr>';
    }).join('');
    modal({
      title: w ? 'Pemenang: ' + esc(w.name) + '!' : 'Permainan selesai', cls: 'winbox', dismiss: null, noBackdropClose: true,
      html: '<div class="winhero">' + (w ? '<img class="winimg" alt="" src="' + w.img + '">' : '') + '<img class="wintrophy" alt="" src="assets/trofi.png"></div><p class="wins">Selesai dalam ' + s.turn + ' putaran giliran.</p>' +
        '<div class="tblwrap"><table class="stats"><thead><tr><th>Pemain</th><th>Saldo</th><th>Total aset</th><th>Properti</th><th>Sewa masuk</th><th>Sewa bayar</th><th>Putaran</th></tr></thead><tbody>' + rows + '</tbody></table></div>',
      buttons: [{ label: 'Menu Utama', value: 'menu', cls: 'gray' }, { label: 'Main Lagi', value: 'again', cls: 'green', primary: true }],
      onOpen: () => confetti()
    }).then((r) => {
      const cfg = s.cfg;
      if (r === 'again' && cfg) MD.Game.start(cfg);
      else if (r === 'menu') { MD.Game.stop(); refreshLanding(); showScreen('landing'); }
    });
  };
  function confetti() {
    if (MD.turbo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#ffc61a', '#2f8cff', '#f2453d', '#2fc653', '#ff8a1f', '#a05af2'];
    for (let i = 0; i < 40; i++) { const c = document.createElement('i'); c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % 6]; c.style.animationDelay = Math.random() * 1.2 + 's'; c.style.animationDuration = 2 + Math.random() * 2 + 's'; box.appendChild(c); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 5000);
  }

  /* =============== landing =============== */
  function refreshLanding() {
    const has = MD.Storage.hasGame();
    $('#resumeRow').hidden = !has;
    if (has) {
      try {
        const g = MD.Storage.getGame(), pl = g.players || [], p = pl[g.cur] || pl[0];
        $('#resumeInfo').textContent = pl.length + ' pemain \u00b7 putaran ' + (g.turn || 1);
        if (p && p.img) $('#resumeImg').src = p.img;
      } catch (e) { /* data lama: pakai teks bawaan */ }
    }
  }

  /* =============== inisialisasi =============== */
  function bind() {
    document.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-go]');
      if (t) {
        MD.Sound.play('click');
        const g = t.dataset.go;
        if (g === 'start') openSetup('solo');
        else if (g === 'solo') openSetup('solo');
        else if (g === 'multi') openSetup('multi');
        else if (g === 'guide') UI.guide();
        else if (g === 'settings') UI.settings();
        else if (g === 'home') { showScreen('landing'); }
        else if (g === 'startgame') startFromSetup();
        else if (g === 'menu') UI.pause();
        else if (g === 'sound') { setSetting('sound', !settings.sound); MD.Sound.play('click'); $('#soundBtn').classList.toggle('off', !settings.sound); }
        else if (g === 'resume') { if (!MD.Game.resume()) { UI.toast('Data simpanan tidak ditemukan atau rusak', 'bad'); refreshLanding(); } }
        else if (g === 'delete') { confirmBox('Hapus data simpanan?', 'Permainan yang tersimpan akan dihapus permanen.', 'Hapus', 'Batal').then((y) => { if (y) { MD.Storage.deleteGame(); refreshLanding(); UI.toast('Data simpanan dihapus'); } }); }
        return;
      }
      const a = ev.target.closest('#actions [data-act]');
      if (a && !a.disabled) { onAction(a.dataset.act); return; }
      const dzc = ev.target.closest('#board .dice-zone.ready');
      if (dzc) { onAction('roll'); return; }
      const tile = ev.target.closest('#board .tile');
      if (tile) { MD.Sound.play('click'); showDeed(+tile.dataset.id); return; }
      const p = ev.target.closest('#players .pcard');
      if (p) return;
      // setup screen
      const sm = ev.target.closest('[data-mode]'); if (sm) { setup.mode = sm.dataset.mode; initSlots(); setup.count = setup.mode === 'solo' ? 3 : 4; drawSetup(); MD.Sound.play('click'); if (MD.TV) MD.TV.ensureFocus($('#screen-setup')); return; }
      const sc = ev.target.closest('[data-count]'); if (sc) { setup.count = +sc.dataset.count; drawSetup(); MD.Sound.play('click'); return; }
      const sd = ev.target.closest('[data-diff]'); if (sd) { setup.difficulty = sd.dataset.diff; drawSetup(); MD.Sound.play('click'); return; }
      const pv = ev.target.closest('[data-prev]'); if (pv) { cycleDino(+pv.dataset.prev, -1); drawSetup(); MD.Sound.play('click'); return; }
      const nx = ev.target.closest('[data-next]'); if (nx) { cycleDino(+nx.dataset.next, 1); drawSetup(); MD.Sound.play('click'); return; }
      const ty = ev.target.closest('[data-type]'); if (ty) { const sl = setup.slots[+ty.dataset.type]; sl.cpu = !sl.cpu; drawSetup(); MD.Sound.play('click'); return; }
    });
    $('#setupSlots').addEventListener('input', (ev) => {
      const n = ev.target.closest('[data-name]');
      if (n) { const sl = setup.slots[+n.dataset.name]; sl.name = n.value; sl.custom = true; }
    });
  }

  function init() {
    applySettings();
    bind();
    $('#soundBtn').classList.toggle('off', !settings.sound);
    refreshLanding();
    showScreen('landing');
  }
  MD.UI = UI;
  MD.settings = () => settings;
  document.addEventListener('DOMContentLoaded', init);
})(window.MD);
