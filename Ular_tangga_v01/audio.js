/* Audio original (Web Audio API). Satu timer musik, di-duck saat jeda, ditangguhkan saat tab tidak aktif. */
(function (U) {
  var ctx, master, musicBus, sfxBus, timer = null, n = 0, ducked = false;
  var MEL = [523, 0, 659, 784, 659, 0, 587, 659, 523, 0, 659, 880, 784, 0, 659, 587];
  var BASS = [131, 131, 196, 196, 175, 175, 196, 196];
  function ensure() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.connect(master); sfxBus = ctx.createGain(); sfxBus.connect(master); setVol();
    }
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
    return ctx;
  }
  function setVol() { if (master) master.gain.value = U.Store.get('volume'); if (musicBus) musicBus.gain.value = ducked ? 0.08 : 0.28; }
  function tone(f, t0, d, type, v, f2, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(dest || sfxBus); o.start(t0); o.stop(t0 + d + 0.03);
  }
  function sfx(fn) { if (!U.Store.get('sfx') || !ensure() || ctx.state !== 'running') return; fn(ctx.currentTime); }
  function startMusic() {
    if (timer || !ensure()) return;
    timer = setInterval(function () {
      if (!ctx || ctx.state !== 'running' || document.hidden) return;
      var t = ctx.currentTime, i = n++ % 16;
      if (MEL[i]) tone(MEL[i], t, 0.26, 'triangle', 0.5, 0, musicBus);
      if (i % 2 === 0) tone(BASS[(i / 2) | 0], t, 0.4, 'sine', 0.6, 0, musicBus);
    }, 260);
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = null; }
  U.Audio = {
    unlock: function () { ensure(); U.Audio.sync(); },
    sync: function () { if (U.Store.get('music')) { if (ctx) startMusic(); } else stopMusic(); },
    setVolume: function (v) { U.Store.set('volume', v); setVol(); },
    duck: function (on) { ducked = !!on; setVol(); },
    dice: function () { sfx(function (t) { for (var i = 0; i < 8; i++) tone(180 + Math.random() * 260, t + i * 0.08, 0.06, 'square', 0.07); }); },
    step: function () { sfx(function (t) { tone(520, t, 0.09, 'triangle', 0.16, 720); }); },
    ladder: function () { sfx(function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.1, 0.18, 'triangle', 0.2); }); }); },
    snake: function () { sfx(function (t) { tone(760, t, 0.9, 'sawtooth', 0.1, 110); }); },
    win: function () { sfx(function (t) { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.15, 0.32, 'triangle', 0.22); }); }); },
    click: function () { sfx(function (t) { tone(660, t, 0.06, 'sine', 0.12); }); },
    /* Putuskan semua efek yang masih berbunyi/terjadwal (dipakai saat keluar permainan). */
    cancelSfx: function () { if (!ctx) return; try { sfxBus.disconnect(); } catch (e) {} sfxBus = ctx.createGain(); sfxBus.connect(master); },
    stopMusic: stopMusic
  };
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { stopMusic(); try { ctx.suspend(); } catch (e) {} }
    else { try { ctx.resume(); } catch (e) {} U.Audio.sync(); }
  });
  window.addEventListener('pagehide', stopMusic);
})(window.UTD);
