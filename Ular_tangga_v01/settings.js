/* Pengaturan (musik, efek, volume, mode TV), layar penuh, dan manajer dialog. */
(function (U) {
  var $ = function (id) { return document.getElementById(id); };
  var stack = [];
  var TV_UA = /smart-?tv|tizen|web0s|webos|hbbtv|netcast|viera|bravia|googletv|android tv|aftb|aftt|aftm|crkey|roku|appletv/i;
  var TV_LBL = { auto: 'Otomatis', on: 'Layar TV', off: 'Biasa' };
  var fsEl = document.documentElement;
  var fsOK = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen);

  /* Latar belakang tidak bisa difokuskan saat dialog terbuka. */
  function bg(on) { var a = $('app'); if (!a) return; if (on) { a.setAttribute('inert', ''); a.setAttribute('aria-hidden', 'true'); } else { a.removeAttribute('inert'); a.removeAttribute('aria-hidden'); } }
  U.UI = {
    open: function (id) {
      var m = $(id); if (!m || !m.hidden) return;
      m._ret = document.activeElement; m.hidden = false; stack.push(m);
      document.body.classList.add('has-modal'); bg(true); U.Settings.refresh();
      if (U.TV) U.TV.focusFirst(m);
    },
    close: function (id) {
      var m = $(id); if (!m || m.hidden) return;
      m.hidden = true; stack = stack.filter(function (x) { return x !== m; });
      if (!stack.length) { document.body.classList.remove('has-modal'); bg(false); }
      var r = m._ret; m._ret = null;
      if (r && document.body.contains(r) && r.offsetParent !== null) r.focus(); else if (U.TV) U.TV.focusFirst();
    },
    top: function () { return stack[stack.length - 1] || null; },
    closeAll: function () { stack.slice().forEach(function (m) { m.hidden = true; }); stack = []; document.body.classList.remove('has-modal'); bg(false); },
    confirm: function (title, msg, yes) {
      $('t-conf').textContent = title; $('confMsg').textContent = msg; U.UI._yes = yes; U.UI.open('dlg-confirm');
    }
  };

  U.Settings = {
    applyTV: function () {
      var m = U.Store.get('tv'), q = /[?&]tv=1/.test(location.search), pref = null;
      try { pref = localStorage.getItem('dfp-tv'); } catch (e) {}          // pilihan Mode TV dari portal Dino Family Play dipakai bersama
      var on = m === 'on' || (m === 'auto' && (q || pref === '1' || (TV_UA.test(navigator.userAgent) && pref !== '0')));
      document.body.classList.toggle('tv', on);
      var href = '../index.html' + (on ? '?tv=1' : '') + '#game';             // semua tautan ke portal ikut membawa Mode TV
      document.querySelectorAll('.portal-link,.to-portal').forEach(function (l) { l.setAttribute('href', href); });
      if (U.Board) setTimeout(function () { U.Board.fit(); }, 50);
    },
    refresh: function () {
      ['music', 'sfx'].forEach(function (k) {
        var on = U.Store.get(k);
        document.querySelectorAll('[data-act="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', on); b.classList.toggle('off', !on); });
        document.querySelectorAll('[data-v="' + k + '"]').forEach(function (s) { s.textContent = on ? 'Nyala' : 'Mati'; });
      });
      document.querySelectorAll('[data-v="tv"]').forEach(function (s) { s.textContent = TV_LBL[U.Store.get('tv')]; });
      $('vol').value = Math.round(U.Store.get('volume') * 100);
      document.body.classList.toggle('no-fs', !fsOK);
    },
    act: function (a) {
      if (a === 'music' || a === 'sfx') { U.Store.set(a, !U.Store.get(a)); if (a === 'music') U.Audio.sync(); U.Audio.unlock(); if (a === 'sfx') U.Audio.click(); }
      else if (a === 'tvmode') { var o = ['auto', 'on', 'off']; U.Store.set('tv', o[(o.indexOf(U.Store.get('tv')) + 1) % 3]); U.Settings.applyTV(); }
      else if (a === 'fullscreen') { U.Settings.fullscreen(); return true; }
      else return false;
      U.Settings.refresh(); return true;
    },
    fullscreen: function () {
      var d = document, on = d.fullscreenElement || d.webkitFullscreenElement;
      try {
        var p = on ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl);
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }
  };
  $('vol').addEventListener('input', function (e) { U.Audio.setVolume(e.target.value / 100); });
  document.addEventListener('fullscreenchange', function () { setTimeout(function () { U.Board.fit(); }, 120); });
  U.Settings.applyTV(); U.Settings.refresh();
})(window.UTD);
