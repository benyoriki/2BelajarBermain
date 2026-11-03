/* game.js - mesin permainan: giliran, dadu, gerak, landing, kartu, utang, bangkrut, save/resume */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const B = MD.Board, E = MD.Eco, C = MD.Cards, K = B.CONST, U = MD.util;
  const ABORT = { aborted: true };
  let epoch = 0, busy = false, cpuRunning = false;
  const G = { S: null, ABORT };
  const S = () => G.S;
  const cur = () => G.S.players[G.S.cur];

  function speed() {
    if (MD.turbo) return 0;
    const m = { normal: 1, fast: 0.45 };
    const v = m[MD.Storage.getSettings().speed];
    return v === undefined ? 1 : v;
  }
  function sleep(ms) {
    const e = epoch, t = ms * speed();
    return new Promise((res, rej) => {
      const f = () => (e === epoch ? res() : rej(ABORT));
      if (t <= 0) setTimeout(f, 0); else setTimeout(f, t);
    });
  }
  async function ui(promise) { const e = epoch; const v = await promise; if (e !== epoch) throw ABORT; return v; }

  /* ---------- state ---------- */
  function newState(cfg) {
    return {
      v: 1, players: MD.Players.create(cfg.players, cfg.startMoney),
      tiles: Array.from({ length: K.N }, () => ({ o: -1, h: 0, m: false })),
      cur: 0, phase: 'roll', doubles: 0, extra: false, last: [1, 1], turn: 1,
      difficulty: cfg.difficulty, startMoney: cfg.startMoney, decks: C.newDecks(),
      log: [], over: false, winner: -1, startedAt: Date.now(), cfg: cfg
    };
  }

  function validate(g) {
    try {
      if (!g || g.v !== 1 || !Array.isArray(g.players) || g.players.length < 2 || g.players.length > 4) return false;
      if (!Array.isArray(g.tiles) || g.tiles.length !== K.N) return false;
      if (g.over || (g.phase !== 'roll' && g.phase !== 'action')) return false;
      const n = g.players.length;
      for (const p of g.players) {
        if (!Number.isFinite(p.money) || p.money < 0 || !Number.isInteger(p.pos) || p.pos < 0 || p.pos >= K.N) return false;
        if (!Array.isArray(p.jf) || !MD.Players.DINOS.some((d) => d.id === p.dino)) return false;
      }
      for (let i = 0; i < K.N; i++) {
        const t = g.tiles[i], T = B.TILES[i];
        if (!(t.o >= -1 && t.o < n) || !Number.isInteger(t.h) || t.h < 0 || t.h > 5) return false;
        if (T.type !== 'prop' && (t.h > 0)) return false;
        if (T.type !== 'prop' && T.type !== 'rail' && (t.o !== -1 || t.m)) return false;
        if (t.o >= 0 && g.players[t.o].out) return false;
      }
      if (!(g.cur >= 0 && g.cur < n) || g.players[g.cur].out) return false;
      if (g.players.filter((p) => !p.out).length < 2) return false;
      for (const k of Object.keys(C.DECKS)) { if (!Array.isArray(g.decks[k])) return false; }
      return true;
    } catch (e) { return false; }
  }

  function log(msg) {
    if (!G.S) return;
    G.S.log.push(msg);
    if (G.S.log.length > 60) G.S.log.shift();
    if (MD.UI && MD.UI.log) MD.UI.log(msg);
  }
  function save() {
    if (!G.S || G.S.over || MD.turbo) return;
    try { MD.Storage.saveGame(G.S); } catch (e) { /* penyimpanan penuh: abaikan */ }
  }
  function notify(o) {
    if (!G.S) return;
    o = o || {};
    (o.tiles || []).forEach((id) => B.updateTile(id, G.S));
    if (MD.UI && MD.UI.refreshPanels) MD.UI.refreshPanels();
    (o.deltas || []).forEach((d) => MD.Players.flash(G.S, d[0], d[1]));
    if (MD.UI && MD.UI.onChange) MD.UI.onChange(o);
  }
  function render() { if (MD.UI && MD.UI.render) MD.UI.render(); }

  /* ---------- mulai / lanjut / berhenti ---------- */
  function stop() { epoch++; busy = false; cpuRunning = false; G.S = null; if (MD.UI && MD.UI.closeAllModals) MD.UI.closeAllModals(); }
  function start(cfg) {
    stop();
    G.S = newState(cfg);
    log('Permainan dimulai! ' + G.S.players.map((p) => p.name).join(', '));
    MD.UI.enterGame();
    save(); kick();
  }
  function resume() {
    const g = MD.Storage.getGame();
    if (!validate(g)) { MD.Storage.deleteGame(); return false; }
    stop();
    G.S = g;
    log('Permainan dilanjutkan.');
    MD.UI.enterGame();
    kick();
    return true;
  }

  /* ---------- CPU ---------- */
  function kick() {
    if (!G.S || G.S.over || cpuRunning || busy) return;
    if (!cur().cpu || cur().out) return;
    const e = epoch;
    cpuRunning = true;
    MD.AI.turn().catch((err) => { if (err !== ABORT) console.error(err); }).then(() => {
      if (e !== epoch) return;
      cpuRunning = false;
      if (!G.S || G.S.over) return;
      if (cur().cpu && G.S.phase === 'action' && !busy) advance(); // pengaman: CPU tidak boleh menggantung
      setTimeout(kick, 0);
    });
  }

  /* ---------- giliran ---------- */
  function advance() {
    const s = G.S, n = s.players.length;
    s.players[s.cur].stats.turns++;
    s.doubles = 0; s.extra = false;
    do { s.cur = (s.cur + 1) % n; if (s.cur === 0) s.turn++; } while (s.players[s.cur].out);
    s.phase = 'roll';
    MD.Board.layoutTokens(s);
    save(); render();
    MD.UI.centerMsg('Giliran ' + cur().name);
  }
  async function endTurn() {
    if (!G.S || busy || G.S.over || G.S.phase !== 'action') return;
    advance();
    kick();
  }

  function checkWinner() {
    const s = G.S;
    const alive = s.players.filter((p) => !p.out);
    if (alive.length > 1) return false;
    s.over = true; s.phase = 'over'; s.winner = alive.length ? alive[0].id : -1;
    MD.Storage.deleteGame();
    MD.Sound.play('win');
    render();
    MD.UI.gameOver();
    return true;
  }

  /* ---------- gerak ---------- */
  async function passStart(p) {
    p.stats.laps++;
    E.transfer(-1, p.id, K.START_BONUS);
    MD.Sound.play('coin');
    log(p.name + ' melewati MULAI, +' + U.fmt(K.START_BONUS));
  }
  async function move(p, steps) {
    for (let i = 0; i < steps; i++) {
      p.pos = (p.pos + 1) % K.N;
      B.layoutTokens(G.S); B.hop(p.id); MD.Sound.play('step');
      if (p.pos === 0) await passStart(p);
      await sleep(190);
    }
  }
  async function moveBack(p, steps) {
    for (let i = 0; i < steps; i++) {
      p.pos = (p.pos - 1 + K.N) % K.N;
      B.layoutTokens(G.S); B.hop(p.id); MD.Sound.play('step');
      await sleep(190);
    }
  }
  async function moveTo(p, to) { await move(p, (to - p.pos + K.N) % K.N); }
  async function sendToJail(p) {
    p.jail = true; p.jailTurns = 0; p.pos = K.JAIL_POS;
    G.S.doubles = 0; G.S.extra = false;
    B.layoutTokens(G.S); B.hop(p.id); MD.Sound.play('jail');
    log(p.name + ' masuk Penjara!');
    notify({});
    await sleep(600);
  }
  function release(p) { p.jail = false; p.jailTurns = 0; notify({}); }

  /* ---------- pembayaran dengan penanganan utang ---------- */
  async function settle(pi, amt, cred, reason, opts) {
    const s = G.S, p = s.players[pi];
    amt = Math.round(amt);
    if (amt <= 0) return true;
    if (p.money < amt) {
      if (p.cpu) MD.AI.raiseCash(p, amt);
      else {
        const r = await ui(MD.UI.debt(p, amt, cred, reason));
        if (r === 'bankrupt') { await goBankrupt(pi, cred); return false; }
      }
      if (p.money < amt) { await goBankrupt(pi, cred); return false; }
    }
    E.transfer(pi, cred, amt, opts);
    MD.Sound.play(opts && opts.rent ? 'rent' : 'coin');
    return true;
  }
  async function goBankrupt(pi, cred) {
    const p = G.S.players[pi];
    log(p.name + ' BANGKRUT dan keluar dari permainan!');
    E.bankrupt(pi, cred);
    B.layoutTokens(G.S);
    MD.Sound.play('lose');
    MD.UI.toast(p.name + ' bangkrut!', 'bad');
    checkWinner();
    await sleep(600);
  }

  /* ---------- landing ---------- */
  async function land(p, opts) {
    opts = opts || {};
    const id = p.pos, T = B.TILES[id];
    switch (T.type) {
      case 'prop': case 'rail': await landProperty(p, id, opts); break;
      case 'chance': await drawCard(p, 'kesempatan'); break;
      case 'surprise': await drawCard(p, 'kejutan'); break;
      case 'action': await drawCard(p, 'aksi'); break;
      case 'tax': await drawCard(p, 'pajak'); break;
      case 'bonus': E.transfer(-1, p.id, K.BONUS); MD.Sound.play('coin'); log(p.name + ' dapat bonus ' + U.fmt(K.BONUS)); MD.UI.toast(p.name + ' +' + U.fmt(K.BONUS) + ' (Bonus)', 'good'); await sleep(450); break;
      case 'gotojail': await sendToJail(p); break;
      case 'park': log(p.name + ' beristirahat di Parkir Gratis'); await sleep(300); break;
      default: break;
    }
  }
  async function landProperty(p, id, opts) {
    const s = G.S, T = B.TILES[id], st = s.tiles[id];
    if (st.o === -1) {
      if (p.money < T.price) { log(p.name + ' tidak cukup uang untuk membeli ' + T.name); MD.UI.toast('Uang ' + p.name + ' kurang untuk membeli ' + T.name); await sleep(500); return; }
      const yes = p.cpu ? MD.AI.decideBuy(p, id) : await ui(MD.UI.buyPrompt(p, id));
      if (p.cpu) await sleep(500);
      if (yes && E.buy(p.id, id)) { MD.Sound.play('buy'); log(p.name + ' membeli ' + T.name + ' ' + U.fmt(T.price)); MD.UI.toast(p.name + ' membeli ' + T.name, 'good'); }
      else log(p.name + ' tidak membeli ' + T.name);
    } else if (st.o !== p.id) {
      if (st.m) { log(T.name + ' digadaikan, tidak ada sewa'); MD.UI.toast(T.name + ' digadaikan: bebas sewa'); await sleep(400); return; }
      let amt = E.rent(id);
      if (opts.mult) amt *= opts.mult;
      const owner = s.players[st.o];
      log(p.name + ' harus bayar sewa ' + U.fmt(amt) + ' ke ' + owner.name);
      MD.UI.toast(p.name + ' bayar sewa ' + U.fmt(amt) + ' ke ' + owner.name, 'bad');
      await sleep(450);
      await settle(p.id, amt, owner.id, 'Sewa ' + T.name, { rent: true });
    }
  }

  /* ---------- kartu ---------- */
  async function drawCard(p, deck) {
    const card = C.draw(G.S, deck);
    MD.Sound.play('card');
    log(p.name + ' mengambil ' + C.DECKS[deck].name + ': ' + card.t);
    await ui(MD.UI.showCard(card, p));
    await applyCard(p, card);
  }
  function repairCost(p, f) {
    let sum = 0;
    E.owned(p.id).forEach((i) => { const h = G.S.tiles[i].h; if (h >= 5) sum += f.hotel; else sum += h * f.house; });
    return sum;
  }
  async function applyCard(p, card) {
    const s = G.S, f = card.fx, tax = card.deck === 'pajak';
    switch (f.k) {
      case 'gain': E.transfer(-1, p.id, f.n); MD.Sound.play('coin'); break;
      case 'pay': await settle(p.id, f.n, -1, card.t, { tax }); break;
      case 'percent': await settle(p.id, Math.max(50, Math.round(p.money * f.n / 100 / 5) * 5), -1, card.t, { tax }); break;
      case 'repair': { const c = repairCost(p, f); if (c > 0) await settle(p.id, c, -1, 'Biaya perbaikan', { tax }); else log(p.name + ' tidak punya bangunan, bebas biaya'); break; }
      case 'moveTo': await moveTo(p, f.to); await land(p); break;
      case 'nearest': await moveTo(p, B.nearest(f.type, p.pos)); await land(p, { mult: 2 }); break;
      case 'moveBy': if (f.n > 0) await move(p, f.n); else await moveBack(p, -f.n); await land(p); break;
      case 'jail': await sendToJail(p); break;
      case 'jailfree': p.jf.push(card.id); notify({}); break;
      case 'extraRoll': s.extra = true; break;
      case 'gainAll':
        for (const q of s.players) { if (q.id !== p.id && !q.out && !p.out) await settle(q.id, f.n, p.id, 'Ulang tahun ' + p.name); }
        break;
      case 'payAll':
        for (const q of s.players) { if (q.id !== p.id && !q.out && !p.out) await settle(p.id, f.n, q.id, card.t); }
        break;
      case 'freeHouse': {
        const c = E.owned(p.id).filter((i) => { const r = E.canBuild(p.id, i); return r === true || r === 'Uang kurang'; });
        if (c.length) { c.sort((a, b) => s.tiles[a].h - s.tiles[b].h); E.build(p.id, c[0], true); log(p.name + ' dapat rumah gratis di ' + B.TILES[c[0]].name); }
        else { E.transfer(-1, p.id, 100); MD.Sound.play('coin'); }
        break;
      }
      case 'steal': {
        const v = s.players.filter((q) => q.id !== p.id && !q.out).sort((a, b) => b.money - a.money)[0];
        if (v) E.transfer(v.id, p.id, Math.min(f.n, v.money));
        break;
      }
      case 'swap': {
        const o = s.players.filter((q) => q.id !== p.id && !q.out).sort((a, b) => ((b.pos - p.pos + K.N) % K.N) - ((a.pos - p.pos + K.N) % K.N))[0];
        if (o && !o.jail) { const t = p.pos; p.pos = o.pos; o.pos = t; B.layoutTokens(s); await sleep(500); await land(p); }
        break;
      }
      default: break;
    }
  }

  /* ---------- lempar dadu ---------- */
  async function roll() {
    if (!G.S || busy || G.S.over || G.S.phase !== 'roll') return false;
    busy = true; render();
    const s = G.S;
    try {
      const p = cur();
      const d1 = U.rnd(6) + 1, d2 = U.rnd(6) + 1, dbl = d1 === d2, tot = d1 + d2;
      s.last = [d1, d2];
      MD.Sound.play('dice');
      await ui(MD.UI.rollDice(d1, d2));
      log(p.name + ' melempar ' + d1 + ' + ' + d2 + ' = ' + tot + (dbl ? ' (double!)' : ''));
      let again = false;
      if (p.jail) {
        if (dbl) { log(p.name + ' dapat double dan keluar Penjara!'); release(p); await move(p, tot); await land(p); }
        else {
          p.jailTurns++;
          if (p.jailTurns >= 3) {
            log(p.name + ' wajib membayar denda Penjara.');
            if (await settle(p.id, K.JAIL_FINE, -1, 'Denda Penjara')) { release(p); await move(p, tot); await land(p); }
          } else { log(p.name + ' gagal double, tetap di Penjara (' + p.jailTurns + '/3).'); MD.UI.toast('Belum double, tetap di Penjara'); await sleep(400); }
        }
      } else {
        s.doubles = dbl ? s.doubles + 1 : 0;
        if (dbl && s.doubles >= 3) { log(p.name + ' double 3 kali berturut-turut: masuk Penjara!'); await sendToJail(p); }
        else { await move(p, tot); await land(p); again = dbl && !p.jail && !p.out; }
      }
      if (s.extra) { again = !p.jail && !p.out; s.extra = false; }
      if (!s.over) {
        if (p.out) advance();
        else { s.phase = again ? 'roll' : 'action'; if (again) log(p.name + ' boleh melempar lagi!'); }
      }
    } catch (err) {
      busy = false;
      if (err === ABORT) return false;
      console.error(err);
      if (G.S && !G.S.over) G.S.phase = 'action';
    }
    busy = false;
    if (G.S && !G.S.over) { save(); render(); MD.UI.centerMsg(G.S.phase === 'roll' ? 'Giliran ' + cur().name : ''); kick(); }
    return true;
  }

  /* ---------- penjara (aksi manual) ---------- */
  async function payFine() {
    if (!G.S || busy || G.S.phase !== 'roll' || !cur().jail) return;
    busy = true; render();
    try {
      const p = cur();
      if (await settle(p.id, K.JAIL_FINE, -1, 'Denda Penjara')) { release(p); log(p.name + ' membayar denda dan bebas.'); }
      else if (!G.S.over) advance();
    } catch (err) { busy = false; if (err === ABORT) return; console.error(err); }
    busy = false;
    if (G.S && !G.S.over) { save(); render(); kick(); }
  }
  function useJailCard() {
    if (!G.S || busy || G.S.phase !== 'roll') return;
    const p = cur();
    if (!p.jail || !p.jf.length) return;
    C.returnJailCard(G.S, p.jf.pop());
    release(p); log(p.name + ' memakai Kartu Bebas Penjara.');
    save(); render();
  }

  /* ---------- tukar ---------- */
  async function runTrade(fromId, toId, offer) {
    const s = G.S, a = s.players[fromId], b = s.players[toId];
    const v = E.validateTrade(fromId, toId, offer);
    if (v !== true) { MD.UI.toast(v, 'bad'); return false; }
    let ok;
    if (b.cpu) { await sleep(400); ok = MD.AI.respondTrade(b, fromId, offer); }
    else ok = await ui(MD.UI.tradeProposal(a, b, offer));
    if (ok && E.executeTrade(fromId, toId, offer)) { log(a.name + ' dan ' + b.name + ' bertukar properti.'); MD.UI.toast('Tukar berhasil!', 'good'); MD.Sound.play('buy'); save(); render(); return true; }
    log(b.name + ' menolak tawaran ' + a.name + '.'); MD.UI.toast(b.name + ' menolak tawaran', 'bad');
    return false;
  }

  /* ---------- audit (untuk pengujian) ---------- */
  function audit() {
    const s = G.S, bad = [];
    if (!s) return ['tidak ada game'];
    s.players.forEach((p) => {
      if (p.money < 0) bad.push('saldo minus: ' + p.name + ' ' + p.money);
      if (p.pos < 0 || p.pos >= K.N) bad.push('posisi di luar papan');
      if (!Number.isFinite(p.money)) bad.push('saldo NaN');
      if (p.out && p.money !== 0) bad.push('pemain bangkrut masih punya uang');
    });
    s.tiles.forEach((t, i) => {
      if (t.o >= 0 && s.players[t.o].out) bad.push('properti milik pemain bangkrut: ' + i);
      if (t.h > 0 && B.TILES[i].type !== 'prop') bad.push('bangunan di petak non-properti');
      if (t.h > 0 && !E.monopoly(t.o, i)) bad.push('bangunan tanpa monopoli: ' + i);
    });
    if (!busy && !s.over && s.players[s.cur].out) bad.push('giliran pemain bangkrut');
    return bad;
  }

  Object.assign(G, { cur, newState, validate, start, resume, stop, kick, roll, endTurn, payFine, useJailCard, runTrade, notify, sleep, log, audit, save, render, isBusy: () => busy });
  MD.Game = G;
  window.addEventListener('pagehide', () => { if (G.S && !G.S.over && !busy) save(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.S && !G.S.over && !busy) save(); });
})(window.MD);
