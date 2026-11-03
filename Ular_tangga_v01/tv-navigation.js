/* Navigasi remote/keyboard: panah = pindah fokus spasial, Enter = pilih, Esc/Backspace = kembali. */
(function (U) {
  var SEL = 'a[href],button:not([disabled]):not([aria-disabled="true"]),input:not([disabled]),[tabindex="0"]';
  function scope() { return U.UI.top() || document.querySelector('.screen.active'); }
  function vis(e) { var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }
  function items(root) { return Array.prototype.slice.call((root || scope()).querySelectorAll(SEL)).filter(vis); }
  function isText(e) { return e && e.tagName === 'INPUT' && /text|search/.test(e.type || 'text'); }
  function isRange(e) { return e && e.tagName === 'INPUT' && e.type === 'range'; }
  var BACK = { Escape: 1, Backspace: 1, BrowserBack: 1, GoBack: 1, XF86Back: 1 };
  var BACK_CODES = { 27: 1, 8: 1, 10009: 1, 461: 1, 166: 1 };

  function focusFirst(root) {
    root = root || scope(); if (!root) return;
    var l = items(root); var pref = root.querySelector('[data-autofocus]');
    var t = pref && vis(pref) ? pref : l[0];
    if (t) t.focus({ preventScroll: true });
  }
  function move(key) {
    var l = items(), cur = document.activeElement;
    if (l.indexOf(cur) < 0) { focusFirst(); return; }
    var a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, best = null, bs = 1e9;
    l.forEach(function (e) {
      if (e === cur) return;
      var r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - ax, dy = r.top + r.height / 2 - ay, prim, sec;
      if (key === 'ArrowRight') { prim = dx; sec = Math.abs(dy); }
      else if (key === 'ArrowLeft') { prim = -dx; sec = Math.abs(dy); }
      else if (key === 'ArrowDown') { prim = dy; sec = Math.abs(dx); }
      else { prim = -dy; sec = Math.abs(dx); }
      if (prim < 4) return;
      var s = prim + sec * 2.5; if (s < bs) { bs = s; best = e; }
    });
    if (best) { best.focus({ preventScroll: true }); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); }
  }
  document.addEventListener('keydown', function (ev) {
    var k = ev.key, t = ev.target; U.kbd = true;
    if (k === 'Tab') {                                   // jebakan fokus: tetap di dalam dialog / layar aktif
      var l = items(); if (!l.length) return;
      var i = l.indexOf(document.activeElement), n = ev.shiftKey ? (i <= 0 ? l.length - 1 : i - 1) : (i < 0 || i === l.length - 1 ? 0 : i + 1);
      ev.preventDefault(); l[n].focus({ preventScroll: true }); return;
    }
    if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
      if ((isText(t) || isRange(t)) && (k === 'ArrowLeft' || k === 'ArrowRight')) return;
      ev.preventDefault(); move(k); return;
    }
    if (k === 'Enter') {
      if (t && t.getAttribute && t.getAttribute('tabindex') === '0' && t.tagName !== 'BUTTON') { ev.preventDefault(); t.click(); }
      else if (isText(t)) { ev.preventDefault(); t.blur(); }
      return;
    }
    if (BACK[k] || BACK_CODES[ev.keyCode]) {
      if (k === 'Backspace' && isText(t)) return;
      ev.preventDefault(); if (U.goBack) U.goBack(k);
    }
  });
  /* Jaga agar fokus tidak hilang (mis. setelah tombol dinonaktifkan atau layar berganti). */
  document.addEventListener('focusout', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if ((!a || a === document.body) && (U.kbd || document.body.classList.contains('tv'))) focusFirst();
    }, 60);
  });
  document.addEventListener('pointerdown', function () { U.kbd = false; }, true);
  U.TV = { focusFirst: focusFirst, move: move };
})(window.UTD);
