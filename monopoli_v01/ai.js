/* ai.js - lawan CPU: 3 tingkat kesulitan (mudah, normal, sulit) */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const B = MD.Board, E = MD.Eco;
  const S = () => MD.Game.S;
  const LV = {
    mudah: { buyP: 0.5, reserve: 0, build: 0.3, keep: 600, unm: false, trade: false, tradeGain: 0.9 },
    normal: { buyP: 0.9, reserve: 250, build: 0.75, keep: 300, unm: true, trade: true, tradeGain: 1.0 },
    sulit: { buyP: 1, reserve: 150, build: 1, keep: 200, unm: true, trade: true, tradeGain: 1.15 }
  };
  const lv = () => LV[S().difficulty] || LV.normal;

  function completes(p, id) {
    const g = E.groupOf(id);
    return g.length > 1 && g.every((i) => i === id || S().tiles[i].o === p.id);
  }
  function blocksOpponent(p, id) {
    const g = E.groupOf(id);
    if (g.length < 2) return false;
    const others = g.filter((i) => i !== id);
    const o = S().tiles[others[0]].o;
    return o >= 0 && o !== p.id && others.every((i) => S().tiles[i].o === o);
  }

  function decideBuy(p, id) {
    const T = B.TILES[id], L = lv();
    if (p.money < T.price) return false;
    if (completes(p, id)) return true;
    const after = p.money - T.price;
    if (after < L.reserve) return false;
    if (blocksOpponent(p, id) && S().difficulty !== 'mudah') return true;
    return Math.random() < L.buyP;
  }

  function manage(p) {
    const L = lv();
    if (L.unm) {
      E.owned(p.id).forEach((i) => {
        if (S().tiles[i].m && p.money - B.unmortgageCost(i) > L.keep + 200) E.unmortgage(p.id, i);
      });
    }
    for (let k = 0; k < 6; k++) {
      const c = E.owned(p.id).filter((i) => E.canBuild(p.id, i) === true && p.money - B.houseCost(i) >= L.keep);
      if (!c.length || Math.random() > L.build) break;
      c.sort((a, b) => (S().tiles[a].h - S().tiles[b].h) || (B.TILES[b].price - B.TILES[a].price));
      E.build(p.id, c[0]);
    }
  }

  function raiseCash(p, need) {
    let guard = 120;
    while (p.money < need && guard-- > 0) {
      const own = E.owned(p.id);
      let m = own.filter((i) => E.canMortgage(p.id, i) && !E.monopoly(p.id, i));
      if (m.length) { m.sort((a, b) => B.TILES[a].price - B.TILES[b].price); E.mortgage(p.id, m[0]); continue; }
      const sb = own.filter((i) => E.canSellBuilding(p.id, i));
      if (sb.length) { sb.sort((a, b) => S().tiles[b].h - S().tiles[a].h); E.sellBuilding(p.id, sb[0]); continue; }
      m = own.filter((i) => E.canMortgage(p.id, i));
      if (m.length) { m.sort((a, b) => B.TILES[a].price - B.TILES[b].price); E.mortgage(p.id, m[0]); continue; }
      break;
    }
  }

  function jailChoice(p) {
    if (p.jf.length) return 'card';
    if (S().difficulty === 'mudah') return 'roll';
    if (p.money > 800 && Math.random() < (S().difficulty === 'sulit' ? 0.8 : 0.4)) return 'pay';
    return 'roll';
  }

  /* nilai petak bagi pemain p */
  function val(p, id) { return B.TILES[id].price * (completes(p, id) ? 1.9 : 1); }

  /* offer dari sudut pandang pengaju: give = diberikan pengaju, get = diterima pengaju. p = penerima tawaran */
  function respondTrade(p, fromId, offer) {
    const L = lv();
    let gain = offer.give.cash, loss = offer.get.cash;
    offer.give.props.forEach((i) => { gain += val(p, i); });
    for (const i of offer.get.props) {
      if (E.monopoly(p.id, i)) return false; // jangan lepas monopoli
      loss += val(p, i) + (blocksOpponent(p, i) ? 0 : 0);
    }
    if (p.money + offer.give.cash - offer.get.cash < 100) return false;
    return gain >= loss * L.tradeGain;
  }

  function proposeTrade(p) {
    if (!lv().trade) return null;
    const s = S();
    for (const g of Object.keys(B.GROUP_IDS)) {
      const ids = B.GROUP_IDS[g];
      const mine = ids.filter((i) => s.tiles[i].o === p.id);
      if (mine.length !== ids.length - 1) continue;
      const miss = ids.find((i) => s.tiles[i].o !== p.id);
      const o = s.tiles[miss].o;
      if (o < 0 || s.players[o].out || ids.some((i) => s.tiles[i].h > 0)) continue;
      const price = B.TILES[miss].price;
      const cash = Math.round(price * 1.8 / 10) * 10;
      if (p.money - cash < 250) continue;
      return { to: o, offer: { give: { props: [], cash: cash }, get: { props: [miss], cash: 0 } } };
    }
    return null;
  }

  async function turn() {
    const G = MD.Game, p = G.cur(), sl = G.sleep;
    await sl(650);
    if (lv().unm) manage(p);
    if (p.jail && S().phase === 'roll') {
      const c = jailChoice(p);
      if (c === 'card') G.useJailCard(); else if (c === 'pay') await G.payFine();
      await sl(300);
    }
    let guard = 0;
    while (!S().over && S().cur === p.id && S().phase === 'roll' && guard++ < 6) { await G.roll(); await sl(350); }
    if (S().over || S().cur !== p.id) return;
    manage(p);
    if (lv().trade && (S().turn % 3 === 0)) {
      const pr = proposeTrade(p);
      if (pr) await G.runTrade(p.id, pr.to, pr.offer);
    }
    await sl(300);
    if (!S().over && S().cur === p.id) await G.endTurn();
  }

  MD.AI = { decideBuy, manage, raiseCash, jailChoice, respondTrade, proposeTrade, turn };
})(window.MD);
