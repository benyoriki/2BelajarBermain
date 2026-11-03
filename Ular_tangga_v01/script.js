/* Orkestrasi: layar, pemilihan pemain, alur giliran (satu pintu, dapat dibatalkan), dialog, PWA. */
(function (U) {
  var $ = function (id) { return document.getElementById(id); };
  var E = U.Engine, S = U.Store;
  var G = { token: 0, busy: false, active: false, players: [], timer: null, pending: false };

  /* DOM helper — semua teks dari pengguna lewat textContent, tidak pernah innerHTML. */
  function h(tag, cls, text, attrs) {
    var el = document.createElement(tag);
    if (cls) el.className = cls; if (text != null) el.textContent = text;
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function icon(src) { return h('img', null, null, { src: src, alt: '' }); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  U.h = h;

  /* ---------- Layar ---------- */
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    document.body.dataset.screen = id;
    var sc = $(id); if (sc) sc.scrollTop = 0;
    if (id === 'game') { U.Board.fit(); }
    if (id === 'setup') renderSetup();
    if (id === 'scores') renderScores();
    U.TV.focusFirst();
  }

  /* ---------- Pemilihan pemain ---------- */
  var mode = S.get('mode') || 2, popIdx = -1, curTab = 0;
  function total() { return mode === 1 ? 2 : mode; }
  function fixChars() {
    var chars = S.get('chars').slice(), used = {};
    for (var i = 0; i < 4; i++) {
      if (!U.CHARS[chars[i]] || used[chars[i]]) chars[i] = U.CHAR_ORDER.filter(function (c) { return !used[c]; })[0];
      used[chars[i]] = 1;
    }
    S.set('chars', chars);
  }
  var MODE_TXT = ['', 'Melawan komputer', 'Bermain bersama dua orang', 'Bermain bersama tiga orang', 'Bermain bersama empat orang'];
  function renderSetup() {
    fixChars(); $('setupErr').hidden = true;
    var m = $('modes'); clear(m);
    for (var n = 1; n <= 4; n++) {
      var b = h('button', 'btn c-purple mode', null, { 'data-mode': n, 'aria-pressed': String(n === mode) });
      b.appendChild(h('b', null, n)); b.appendChild(h('span', null, ' Pemain')); m.appendChild(b);
    }
    $('modeHint').textContent = MODE_TXT[mode];
    var chars = S.get('chars'), names = S.get('names'), box = $('pcards'); clear(box);
    var cnt = total(); if (curTab >= cnt) curTab = 0;
    var tabs = $('ptabs'); clear(tabs);
    for (var t = 0; t < cnt; t++) {
      var tc = U.CHARS[chars[t]], tcpu = mode === 1 && t === 1;
      var tb = h('button', 'ptab' + (t === curTab ? ' on' : ''), null, { role: 'tab', 'data-tab': t, 'aria-selected': String(t === curTab), 'aria-label': (tcpu ? 'Komputer' : 'Pemain ' + (t + 1)) + ', ' + tc.name });
      tb.style.setProperty('--pc', tc.color); tb.appendChild(icon(tc.img)); tb.appendChild(h('span', null, tcpu ? 'PC' : 'P' + (t + 1))); tabs.appendChild(tb);
    }
    for (var i = 0; i < cnt; i++) {
      var cpu = mode === 1 && i === 1, c = U.CHARS[chars[i]];
      var card = h('div', 'pcard' + (cpu ? ' is-cpu' : '') + (i === curTab ? ' cur' : ''), null, { 'data-i': i });
      card.style.setProperty('--pc', c.color);
      var prev = h('div', 'pc-prev'); var av = h('img', 'pc-av', null, { src: c.img, alt: c.name }); prev.appendChild(av);
      prev.appendChild(h('span', 'tag ' + (cpu ? 'cpu' : 'human'), cpu ? 'Komputer' : 'Manusia'));
      var body = h('div', 'pc-body');
      var top = h('div', 'pc-top'); top.appendChild(h('span', 'pc-lbl', cpu ? 'Lawan' : 'Pemain ' + (i + 1))); top.appendChild(h('span', 'pc-ch', c.name));
      body.appendChild(top);
      if (cpu) body.appendChild(h('div', 'pc-name cpu', 'Komputer'));
      else {
        var inp = h('input', 'pc-name', null, { type: 'text', maxlength: 12, placeholder: c.name, autocomplete: 'off', autocapitalize: 'words', enterkeyhint: 'done', 'aria-label': 'Nama pemain ' + (i + 1) });
        inp.value = names[i] || '';
        inp.addEventListener('input', function (e) { var v = e.target.value.replace(/[\u0000-\u001f<>&"'`]/g, ''); if (v !== e.target.value) e.target.value = v; e.target.classList.remove('bad'); $('setupErr').hidden = true; document.querySelectorAll('.ptab.bad').forEach(function (t) { t.classList.remove('bad'); }); });
        body.appendChild(inp);
      }
      var row = h('div', 'pc-chars', null, { role: 'radiogroup', 'aria-label': 'Karakter pemain ' + (i + 1) });
      U.CHAR_ORDER.forEach(function (id) {
        var owner = -1; for (var j = 0; j < cnt; j++) if (j !== i && chars[j] === id) owner = j;
        var cb = h('button', 'chbtn', null, { role: 'radio', 'data-char': id, 'aria-checked': String(id === chars[i]), 'aria-label': U.CHARS[id].name + (owner > -1 ? ' (dipakai pemain ' + (owner + 1) + ')' : '') });
        if (owner > -1) { cb.setAttribute('aria-disabled', 'true'); cb.appendChild(h('span', 'own', owner === 1 && mode === 1 ? 'PC' : 'P' + (owner + 1))); cb.style.setProperty('--oc', U.CHARS[id].color); }
        cb.appendChild(icon(U.CHARS[id].img)); row.appendChild(cb);
      });
      body.appendChild(row); card.appendChild(prev); card.appendChild(body); box.appendChild(card);
    }
    if (popIdx > -1) { var a = box.querySelector('.pcard[data-i="' + popIdx + '"] .pc-av'); if (a && a.animate && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) a.animate([{ transform: 'scale(.6) rotate(-8deg)' }, { transform: 'scale(1.15) rotate(4deg)', offset: .6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' }); popIdx = -1; }
  }
  function showTab(i) {
    curTab = i;
    document.querySelectorAll('.pcard').forEach(function (c) { c.classList.toggle('cur', +c.dataset.i === i); });
    document.querySelectorAll('.ptab').forEach(function (t) { var on = +t.dataset.tab === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); });
  }
  function readNames() {
    var names = S.get('names').slice();
    document.querySelectorAll('.pcard input.pc-name').forEach(function (inp) { names[+inp.closest('.pcard').dataset.i] = U.cleanName(inp.value); });
    S.set('names', names); return names;
  }
  /* Validasi: nama unik (tanpa membedakan huruf besar/kecil) dan tidak bentrok dengan "Komputer". */
  function validateSetup() {
    var names = readNames(), chars = S.get('chars'), seen = {}, cnt = total();
    for (var i = 0; i < cnt; i++) {
      var cpu = mode === 1 && i === 1, nm = cpu ? 'Komputer' : (names[i] || U.CHARS[chars[i]].name), key = nm.toLowerCase();
      if (seen[key] !== undefined) return { i: i, msg: 'Nama "' + nm + '" sudah dipakai. Ganti salah satu nama.' };
      seen[key] = i;
    }
    return null;
  }
  function buildPlayers() {
    var chars = S.get('chars'), names = S.get('names'), out = [];
    for (var i = 0; i < total(); i++) { var cpu = mode === 1 && i === 1; out.push(U.makePlayer(cpu ? 'Komputer' : names[i], chars[i], cpu)); }
    return out;
  }

  /* ---------- Permainan ---------- */
  function clearTimer() { if (G.timer) { clearTimeout(G.timer); G.timer = null; } G.pending = false; }
  function startGame(players) {
    stopAll();
    G.token++; G.active = true; G.players = players;
    E.init(players); U.Board.build($('board')); U.Board.setPawns(players); U.Dice.set(1);
    $('diceInfo').textContent = 'Lempar dadunya!'; clear($('log'));
    U.UI.closeAll(); show('game'); renderPlayers(); setTurn();
  }
  /* Hentikan semua proses: timer CPU, dadu, animasi, jeda. Dipakai saat keluar / mulai ulang. */
  function stopAll() {
    G.settingsPaused = false; G.token++; G.active = false; G.busy = false; clearTimer();
    U.Dice.cancel(); U.Anim.cancelAll(); U.Anim.clearFx(); U.Audio.cancelSfx(); U.setPaused(false);
  }
  function renderPlayers() {
    var ul = $('playerList'); clear(ul);
    E.state.players.forEach(function (p, i) {
      var li = h('li', i === E.state.turn && !E.state.over ? 'on' : ''); li.style.setProperty('--pc', p.color);
      li.appendChild(icon(p.img)); li.appendChild(h('span', 'pn', p.name));
      if (p.cpu) li.appendChild(h('span', 'pcb', 'PC'));
      li.appendChild(h('span', 'pp', 'Kotak ' + p.pos)); ul.appendChild(li);
    });
  }
  function say(t) { var l = $('log'); l.insertBefore(h('div', null, t), l.firstChild); while (l.children.length > 4) l.removeChild(l.lastChild); }
  function lockRoll(lock) { var b = $('rollBtn'); b.setAttribute('aria-disabled', lock ? 'true' : 'false'); b.classList.toggle('busy', !!lock); }
  function setTurn() {
    clearTimer(); if (!G.active || E.state.over) return;
    var p = E.current(), idx = E.state.turn, tk = G.token;
    $('turnMsg').textContent = 'Sekarang giliran ' + p.name + '!'; $('turnMsg').style.setProperty('--pc', p.color); $('dice').style.setProperty('--pc', p.color);
    $('posInfo').textContent = 'Posisi: ' + p.pos;
    U.Board.setActive(idx); renderPlayers(); lockRoll(p.cpu || G.busy || U.paused);
    if (p.cpu) {
      $('diceInfo').textContent = 'Komputer sedang berpikir…';
      G.timer = setTimeout(function () { G.timer = null; cpuRun(tk, idx); }, 1100 + Math.random() * 900);
    } else if (!U.UI.top() && (document.body.classList.contains('tv') || U.kbd || document.activeElement === document.body || document.activeElement.id === 'rollBtn')) {
      $('rollBtn').focus({ preventScroll: true });
    }
  }
  function cpuRun(tk, idx) {
    if (tk !== G.token || !G.active || E.state.over || E.state.turn !== idx || !E.current().cpu) return;
    if (U.paused || G.busy) { G.pending = true; return; }     // ditunda sampai resume
    playTurn(true);
  }
  async function playTurn(byCpu) {
    if (G.busy || !G.active || E.state.over || U.paused) return;
    var cur = E.current(); if (cur.cpu && !byCpu) return;      // manusia tidak bisa melempar untuk komputer
    var tk = G.token, i = E.state.turn, p = cur;
    G.busy = true; lockRoll(true); clearTimer();
    var dice = E.rollDie(); U.Audio.dice();
    $('diceInfo').textContent = p.name + ' melempar…';
    var ok = await U.Dice.roll(dice); if (!ok || tk !== G.token) return;
    $('diceInfo').textContent = 'Hasil dadu: ' + dice;
    var plan = E.step(dice); if (!plan) { G.busy = false; return; }
    if (plan.bounced) { say(p.name + ': butuh angka pas untuk 100. Tetap di ' + plan.from + '.'); await U.sleep(900); }
    else {
      await U.Anim.walk(i, plan.steps); if (tk !== G.token) return;
      if (plan.jump) {
        say(p.name + (plan.jump.type === 'ladder' ? ' naik tangga ' : ' turun ular ') + plan.jump.from + ' → ' + plan.jump.to);
        await U.Anim.jump(i, plan.jump); if (tk !== G.token) return;
      }
    }
    G.busy = false;
    if (plan.win) return win(i, tk);
    setTurn();
  }
  async function win(i, tk) {
    var p = E.state.players[i];
    G.active = false; renderPlayers(); lockRoll(true); U.Board.setActive(-1); U.Anim.cheer(i);
    S.addWin({ name: p.name, char: p.char, players: E.state.players.length, moves: E.state.moves, date: Date.now() });
    $('winTitle').textContent = p.name + ' menang!';
    var wp = $('winPawn'); wp.src = p.img; wp.alt = p.name; $('dlg-win').style.setProperty('--pc', p.color);
    U.Audio.win(); U.Anim.confetti();
    await U.sleep(1100); if (tk !== G.token) return;
    U.UI.open('dlg-win');
  }
  function leaveGame() { stopAll(); U.UI.closeAll(); show('menu'); }

  /* ---------- Skor ---------- */
  function renderScores() {
    var ul = $('scoreList'), hs = S.get('history'); clear(ul);
    if (!hs.length) { ul.appendChild(h('li', 'empty', 'Belum ada kemenangan. Ayo main dulu!')); return; }
    hs.slice(0, 12).forEach(function (r) {
      var c = U.CHARS[r.char], d = new Date(r.date), li = h('li'); li.style.setProperty('--pc', c.color);
      li.appendChild(icon(c.img)); li.appendChild(h('span', 'pn', r.name));
      li.appendChild(h('span', 'pp', r.players + ' pemain · ' + r.moves + ' lemparan · ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })));
      ul.appendChild(li);
    });
  }

  /* Setelah resume: jadwalkan ulang komputer jika gilirannya, dan sinkronkan tombol dadu. */
  function afterResume() {
    if (!G.active) return;
    if (G.busy) { lockRoll(true); return; }
    var cpu = E.current().cpu; lockRoll(cpu);
    if (cpu) { var tk = G.token, idx = E.state.turn; clearTimer(); G.timer = setTimeout(function () { G.timer = null; cpuRun(tk, idx); }, 700); }
  }

  /* ---------- Aksi tombol ---------- */
  var ACT = {
    start: function () { U.Audio.unlock(); show('setup'); },
    howto: function () { show('howto'); }, about: function () { show('about'); },
    scores: function () { show('scores'); }, menu: function () { show('menu'); },
    settings: function () {
      if (G.active && !U.paused) { U.setPaused(true); G.settingsPaused = true; }   // membuka pengaturan saat bermain = jeda
      U.UI.open('dlg-settings');
    },
    closeDlg: function () {
      U.UI.close('dlg-settings');
      if (G.settingsPaused) { G.settingsPaused = false; if (!U.UI.top()) { U.setPaused(false); afterResume(); } }
    },
    begin: function () {
      var err = validateSetup();
      if (err) {
        var box = $('setupErr'); box.textContent = err.msg; box.hidden = false;
        showTab(err.i);
        var card = document.querySelector('.pcard[data-i="' + err.i + '"]'), inp = card && card.querySelector('input');
        var bt = document.querySelector('.ptab[data-tab="' + err.i + '"]'); if (bt) bt.classList.add('bad');
        if (inp) { inp.classList.add('bad'); inp.focus(); }
        if (card && card.animate) card.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        return;
      }
      S.set('mode', mode); U.Audio.unlock(); startGame(buildPlayers());
    },
    pause: function () { if (!G.active || U.UI.top()) return; U.setPaused(true); U.UI.open('dlg-pause'); },
    resume: function () { U.UI.close('dlg-pause'); U.setPaused(false); afterResume(); },
    quit: function () { U.UI.confirm('Keluar?', 'Permainan ini akan berhenti dan kembali ke menu.', leaveGame); },
    clearScores: function () { U.UI.confirm('Hapus riwayat?', 'Semua riwayat kemenangan akan dihapus dari perangkat ini.', function () { S.clearHistory(); renderScores(); }); },
    confYes: function () { var f = U.UI._yes; U.UI._yes = null; U.UI.close('dlg-confirm'); if (f) f(); },
    confNo: function () { U.UI._yes = null; U.UI.close('dlg-confirm'); },
    again: function () { U.UI.close('dlg-win'); startGame(G.players); },
    toMenu: function () { leaveGame(); }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-mode],[data-char],[data-tab],#rollBtn'); if (!el) return;
    if (el.getAttribute('aria-disabled') === 'true') return;
    U.Audio.click();
    if (el.id === 'rollBtn') { U.Audio.unlock(); return playTurn(false); }
    if (el.dataset.tab) { showTab(+el.dataset.tab); return; }
    if (el.dataset.mode) { readNames(); mode = +el.dataset.mode; S.set('mode', mode); renderSetup(); var nb = document.querySelector('[data-mode="' + mode + '"]'); if (nb) nb.focus(); return; }
    if (el.dataset.char) {
      readNames(); var i = +el.closest('.pcard').dataset.i, chars = S.get('chars').slice(); chars[i] = el.dataset.char; S.set('chars', chars); popIdx = i; curTab = i; renderSetup();
      var nb2 = document.querySelector('.pcard[data-i="' + i + '"] [data-char="' + el.dataset.char + '"]'); if (nb2) nb2.focus(); return;
    }
    var a = el.dataset.act;
    if (U.Settings.act(a)) return;
    if (ACT[a]) ACT[a]();
  });

  U.goBack = function (key) {
    var m = U.UI.top();
    if (m) {
      if (m.id === 'dlg-settings') return ACT.closeDlg();
      if (m.id === 'dlg-pause') return ACT.resume();
      if (m.id === 'dlg-confirm') return ACT.confNo();
      if (m.id === 'dlg-win') return ACT.toMenu();
      return;
    }
    var s = document.querySelector('.screen.active'), b = s && s.dataset.back;
    if (b === 'portal') { if (key !== 'Backspace') { var pl = document.querySelector('.portal-link'); location.href = pl ? pl.getAttribute('href') : '../index.html#game'; } return; }   // Back/Esc di menu = kembali ke Dino Family Play
    if (b === 'pause') ACT.pause(); else if (b) show(b);
  };

  /* ---------- Mulai ---------- */
  U.Dice.init(); U.Board.build($('board'));
  document.addEventListener('pointerdown', function () { U.Audio.unlock(); }, { once: true });
  document.addEventListener('keydown', function () { U.Audio.unlock(); }, { once: true });
  /* Tab disembunyikan saat bermain → jeda otomatis. */
  document.addEventListener('visibilitychange', function () { if (document.hidden && G.active) ACT.pause(); });
  function net() { $('offline').hidden = navigator.onLine; }
  window.addEventListener('online', net); window.addEventListener('offline', net); net();
  if (document.body.classList.contains('tv')) U.TV.focusFirst();   // di HP/PC tidak ada cincin fokus saat pertama dibuka
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('./service-worker.js').catch(function () {}); });
  }
  U._debug = { G: G, show: show, ACT: ACT };
})(window.UTD);
