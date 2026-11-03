/* Dadu: 1–6 dengan animasi putar yang bisa dibatalkan. */
(function (U) {
  var FACE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  var el, pips = [], run = 0;
  function show(n) { for (var i = 0; i < 9; i++) pips[i].className = FACE[n].indexOf(i) > -1 ? 'on' : ''; }
  U.Dice = {
    init: function () {
      el = document.getElementById('dice'); el.innerHTML = '';
      for (var i = 0; i < 9; i++) { var s = document.createElement('span'); el.appendChild(s); pips.push(s); }
      show(1);
    },
    /* Batalkan roll yang sedang berjalan (mis. saat keluar permainan). */
    cancel: function () { run++; el.classList.remove('rolling', 'land'); },
    roll: async function (n) {
      var id = ++run;
      el.classList.remove('land'); el.classList.add('rolling');
      for (var k = 0; k < 8; k++) { show(1 + Math.floor(Math.random() * 6)); await U.sleep(80); if (id !== run) return false; }
      show(n); el.classList.remove('rolling'); void el.offsetWidth; el.classList.add('land');
      await U.sleep(300); return id === run;
    },
    set: function (n) { U.Dice.cancel(); show(n); }
  };
})(window.UTD);
