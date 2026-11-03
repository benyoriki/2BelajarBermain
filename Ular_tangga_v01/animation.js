/* Animasi: sleep sadar-jeda, langkah bidak, tangga, ular, perayaan. Menghormati prefers-reduced-motion. */
(function (U) {
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduce() { return !!(mq && mq.matches); }
  var live = [], epoch = 0;                       // animasi WAAPI yang sedang berjalan (agar bisa dijeda)
  U.paused = false;
  U.sleep = function (ms) {
    if (reduce()) ms = ms * 0.5;
    return new Promise(function (res) {
      var t = 0, iv = setInterval(function () {
        if (U.paused) return;
        t += 40; if (t >= ms) { clearInterval(iv); res(); }
      }, 40);
    });
  };
  /* Satu pintu untuk jeda: menghentikan timer (sleep), transisi bidak, dan animasi WAAPI. */
  U.setPaused = function (p) {
    U.paused = !!p;
    if (U.Board) { if (p) U.Board.freeze(); else U.Board.unfreeze(); }
    live.forEach(function (a) { try { if (p) a.pause(); else a.play(); } catch (e) {} });
    if (U.Audio) U.Audio.duck(p);
  };
  function play(el, frames, dur, ease) {
    if (!el || !el.animate || reduce()) return null;
    var a = el.animate(frames, { duration: dur, easing: ease || 'ease-in-out' });
    live.push(a);
    var done = function () { var i = live.indexOf(a); if (i > -1) live.splice(i, 1); };
    a.onfinish = a.oncancel = done; if (U.paused) a.pause();
    return a;
  }
  var HOP = [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(-34%) scale(.93,1.1)', offset: .4 },
             { transform: 'translateY(0) scale(1.1,.88)', offset: .85 }, { transform: 'translateY(0) scale(1,1)' }];
  U.Anim = {
    cancelAll: function () { epoch++; live.slice().forEach(function (a) { try { a.cancel(); } catch (e) {} }); live.length = 0; },
    walk: async function (i, steps) {
      var img = U.Board.pawnImg(i), e = epoch;
      for (var k = 0; k < steps.length; k++) {
        if (e !== epoch) return;
        U.Audio.step(); U.Board.setPos(i, steps[k]); play(img, HOP, 250);
        await U.sleep(270);
      }
    },
    jump: async function (i, j) {
      var img = U.Board.pawnImg(i), g = U.Board.jumpEl(j.from), e = epoch;
      if (g) g.classList.add('hot');
      await U.sleep(300); if (e !== epoch) return;
      if (j.type === 'ladder') {
        U.Audio.ladder(); U.Board.setPos(i, j.to, 1200);
        play(img, [{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(0)' }], 1200, 'linear');
        await U.sleep(1300);
      } else {
        U.Audio.snake(); U.Board.setPos(i, j.to, 1400);
        play(img, [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(180deg) scale(.8)', offset: .5 }, { transform: 'rotate(360deg) scale(1)' }], 1400, 'ease-in');
        await U.sleep(1500);
      }
      if (g) g.classList.remove('hot');
    },
    cheer: function (i) { var d = U.Board.pawnEl(i); if (d) d.classList.add('cheer'); },
    confetti: function () {
      var box = document.getElementById('confetti'); box.innerHTML = '';
      if (reduce()) return;
      var cols = ['#ff4b4b', '#ffc61a', '#34c24a', '#2f8cff', '#7a3cff', '#ff8a1f'];
      for (var i = 0; i < 30; i++) {
        var s = document.createElement('i');
        s.style.left = Math.random() * 100 + '%'; s.style.background = cols[i % 6];
        s.style.animationDelay = Math.random() * 1.2 + 's'; s.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
        box.appendChild(s);
      }
      setTimeout(function () { box.innerHTML = ''; }, 5200);
    },
    clearFx: function () { document.getElementById('confetti').innerHTML = ''; }
  };
})(window.UTD);
