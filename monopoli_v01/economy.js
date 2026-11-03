/* economy.js - uang, sewa, beli, bangun, gadai, jual, tukar, bangkrut */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const B = MD.Board;
  const S = () => MD.Game.S;
  const notify = (o) => MD.Game.notify(o);

  function owned(pi) { const out = []; S().tiles.forEach((t, i) => { if (t.o === pi) out.push(i); }); return out; }
  function groupOf(id) { const g = B.TILES[id].group; return g ? B.GROUP_IDS[g] : []; }
  function monopoly(pi, id) { const T = B.TILES[id]; return T.type === 'prop' && groupOf(id).every((i) => S().tiles[i].o === pi); }
  function groupHouses(id) { return groupOf(id).map((i) => S().tiles[i].h); }

  function rent(id) {
    const T = B.TILES[id], st = S().tiles[id];
    if (st.o < 0 || st.m) return 0;
    if (T.type === 'rail') { const n = owned(st.o).filter((i) => B.TILES[i].type === 'rail').length; return T.rent[n - 1]; }
    if (st.h > 0) return T.rent[st.h];
    return monopoly(st.o, id) ? T.rent[0] * 2 : T.rent[0];
  }

  /* ---------- transaksi uang ---------- */
  function transfer(from, to, amt, opts) {
    amt = Math.round(amt);
    if (amt <= 0) return true;
    const s = S();
    if (from >= 0 && s.players[from].money < amt) return false;
    if (from >= 0) { s.players[from].money -= amt; }
    if (to >= 0) { s.players[to].money += amt; }
    const d = [];
    if (from >= 0) d.push([from, -amt]);
    if (to >= 0) d.push([to, amt]);
    if (opts && opts.rent) {
      if (from >= 0) s.players[from].stats.rentPaid += amt;
      if (to >= 0) s.players[to].stats.rentGot += amt;
    }
    if (opts && opts.tax && from >= 0) s.players[from].stats.taxPaid += amt;
    notify({ deltas: d });
    return true;
  }

  /* ---------- beli ---------- */
  function buy(pi, id) {
    const s = S(), T = B.TILES[id], st = s.tiles[id], p = s.players[pi];
    if (!(T.type === 'prop' || T.type === 'rail') || st.o !== -1 || p.money < T.price || p.out) return false;
    transfer(pi, -1, T.price);
    st.o = pi; p.stats.bought++;
    notify({ tiles: [id] });
    return true;
  }

  /* ---------- bangun ---------- */
  function canBuild(pi, id) {
    const s = S(), T = B.TILES[id], st = s.tiles[id], p = s.players[pi];
    if (T.type !== 'prop') return 'Hanya properti biasa yang bisa dibangun';
    if (st.o !== pi) return 'Bukan propertimu';
    if (!monopoly(pi, id)) return 'Butuh semua petak satu warna';
    if (groupOf(id).some((i) => s.tiles[i].m)) return 'Ada petak digadaikan di grup ini';
    if (st.h >= 5) return 'Sudah hotel';
    if (st.h > Math.min.apply(null, groupHouses(id))) return 'Bangun merata dulu di petak lain';
    if (p.money < B.houseCost(id)) return 'Uang kurang';
    return true;
  }
  function build(pi, id, free) {
    if (canBuild(pi, id) !== true && !(free && canBuild(pi, id) === 'Uang kurang')) return false;
    const st = S().tiles[id];
    if (!free) transfer(pi, -1, B.houseCost(id));
    st.h++; S().players[pi].stats.built++;
    MD.Sound.play('build');
    notify({ tiles: [id] });
    return true;
  }
  function canSellBuilding(pi, id) {
    const st = S().tiles[id];
    if (st.o !== pi || st.h <= 0) return false;
    return st.h >= Math.max.apply(null, groupHouses(id));
  }
  function sellBuilding(pi, id) {
    if (!canSellBuilding(pi, id)) return false;
    S().tiles[id].h--;
    transfer(-1, pi, B.houseCost(id) / 2);
    notify({ tiles: [id] });
    return true;
  }

  /* ---------- gadai / tebus / jual ---------- */
  function canMortgage(pi, id) {
    const st = S().tiles[id];
    const T = B.TILES[id];
    if (!(T.type === 'prop' || T.type === 'rail') || st.o !== pi || st.m) return false;
    return !groupOf(id).some((i) => S().tiles[i].h > 0);
  }
  function mortgage(pi, id) {
    if (!canMortgage(pi, id)) return false;
    S().tiles[id].m = true;
    transfer(-1, pi, B.mortgageValue(id));
    notify({ tiles: [id] });
    return true;
  }
  function canUnmortgage(pi, id) {
    const st = S().tiles[id];
    return st.o === pi && st.m && S().players[pi].money >= B.unmortgageCost(id);
  }
  function unmortgage(pi, id) {
    if (!canUnmortgage(pi, id)) return false;
    transfer(pi, -1, B.unmortgageCost(id));
    S().tiles[id].m = false;
    notify({ tiles: [id] });
    return true;
  }
  function canSellProp(pi, id) {
    const st = S().tiles[id];
    const T = B.TILES[id];
    if (!(T.type === 'prop' || T.type === 'rail') || st.o !== pi || st.m) return false;
    return !groupOf(id).some((i) => S().tiles[i].h > 0);
  }
  function sellProp(pi, id) {
    if (!canSellProp(pi, id)) return false;
    S().tiles[id].o = -1;
    transfer(-1, pi, B.mortgageValue(id));
    notify({ tiles: [id] });
    return true;
  }

  /* ---------- nilai ---------- */
  function liquidValue(pi) {
    const p = S().players[pi];
    let v = p.money;
    owned(pi).forEach((i) => {
      const st = S().tiles[i];
      v += st.h * B.houseCost(i) / 2;
      if (!st.m) v += B.mortgageValue(i);
    });
    return v;
  }
  function netWorth(pi) {
    let v = S().players[pi].money;
    owned(pi).forEach((i) => {
      const st = S().tiles[i];
      v += (st.m ? B.TILES[i].price / 2 : B.TILES[i].price) + (B.TILES[i].type === 'prop' ? st.h * B.houseCost(i) : 0);
    });
    return v;
  }

  /* ---------- tukar ---------- */
  function validateTrade(a, b, offer) {
    const s = S();
    const pa = s.players[a], pb = s.players[b];
    if (a === b || pa.out || pb.out) return 'Pemain tidak valid';
    const give = offer.give, get = offer.get;
    if (!give.props.length && !get.props.length && !give.cash && !get.cash) return 'Tawaran kosong';
    if (give.cash < 0 || get.cash < 0) return 'Uang tidak valid';
    if (give.cash > pa.money) return pa.name + ' tidak cukup uang';
    if (get.cash > pb.money) return pb.name + ' tidak cukup uang';
    for (const i of give.props) { if (s.tiles[i].o !== a || groupOf(i).some((g) => s.tiles[g].h > 0)) return 'Properti tidak bisa ditukar (ada bangunan)'; }
    for (const i of get.props) { if (s.tiles[i].o !== b || groupOf(i).some((g) => s.tiles[g].h > 0)) return 'Properti tidak bisa ditukar (ada bangunan)'; }
    return true;
  }
  function executeTrade(a, b, offer) {
    if (validateTrade(a, b, offer) !== true) return false;
    const s = S(), ids = [];
    offer.give.props.forEach((i) => { s.tiles[i].o = b; ids.push(i); });
    offer.get.props.forEach((i) => { s.tiles[i].o = a; ids.push(i); });
    transfer(a, b, offer.give.cash);
    transfer(b, a, offer.get.cash);
    notify({ tiles: ids });
    return true;
  }

  /* ---------- bangkrut ---------- */
  function bankrupt(pi, creditor) {
    const s = S(), p = s.players[pi], ids = [];
    owned(pi).forEach((i) => {
      const st = s.tiles[i];
      p.money += st.h * B.houseCost(i) / 2; // bangunan dijual ke bank
      st.h = 0;
      ids.push(i);
    });
    const cash = p.money;
    if (creditor >= 0 && !s.players[creditor].out) {
      s.players[creditor].money += cash;
      owned(pi).forEach((i) => { s.tiles[i].o = creditor; });
      notify({ deltas: [[creditor, cash]] });
    } else {
      owned(pi).forEach((i) => { s.tiles[i] = { o: -1, h: 0, m: false }; });
    }
    p.jf.forEach((id) => MD.Cards.returnJailCard(s, id));
    p.jf = []; p.money = 0; p.out = true; p.jail = false; p.jailTurns = 0;
    notify({ tiles: ids });
  }

  MD.Eco = { owned, groupOf, monopoly, rent, transfer, buy, canBuild, build, canSellBuilding, sellBuilding, canMortgage, mortgage, canUnmortgage, unmortgage, canSellProp, sellProp, liquidValue, netWorth, validateTrade, executeTrade, bankrupt };
})(window.MD);
