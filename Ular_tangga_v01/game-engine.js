/* Mesin permainan murni (tanpa DOM): giliran, dadu, ular, tangga, menang. */
(function (U) {
  var S = null;
  U.Engine = {
    get state() { return S; },
    init: function (players) {
      var errs = U.Board.validate(U.CONFIG);
      if (errs.length) { console.error('Konfigurasi papan tidak valid:', errs); throw new Error(errs.join('; ')); }
      S = { players: players.map(function (p) { var q = {}; for (var k in p) q[k] = p[k]; q.pos = 1; return q; }),
            turn: 0, over: false, winner: -1, moves: 0 };
      return S;
    },
    current: function () { return S.players[S.turn]; },
    rollDie: function () { return 1 + Math.floor(Math.random() * 6); },
    /* Terapkan hasil dadu untuk pemain aktif. Mengembalikan rencana animasi. */
    step: function (dice) {
      if (!S || S.over) return null;
      if (dice !== (dice | 0) || dice < 1 || dice > 6) throw new Error('Hasil dadu tidak valid: ' + dice);
      var i = S.turn, p = S.players[i], from = p.pos, target = from + dice;
      var plan = { player: i, dice: dice, from: from, steps: [], jump: null, final: from, bounced: false, win: false };
      if (target > 100) { plan.bounced = true; }
      else {
        for (var q = from + 1; q <= target; q++) plan.steps.push(q);
        var L = U.CONFIG.ladders[target], Sn = U.CONFIG.snakes[target];
        if (L) plan.jump = { type: 'ladder', from: target, to: L };
        else if (Sn) plan.jump = { type: 'snake', from: target, to: Sn };
        plan.final = plan.jump ? plan.jump.to : target;
      }
      p.pos = plan.final; S.moves++;
      if (plan.final === 100) { plan.win = true; S.over = true; S.winner = i; }
      else S.turn = (S.turn + 1) % S.players.length;
      plan.next = S.turn;
      return plan;
    }
  };
})(window.UTD);
