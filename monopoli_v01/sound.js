/* sound.js - efek suara via Web Audio API (tanpa file audio, tanpa autoplay) */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(c, freq, start, dur, type, vol, endFreq) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    const t0 = c.currentTime + start;
    o.frequency.setValueAtTime(freq, t0);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  const FX = {
    click: (c) => tone(c, 620, 0, 0.07, 'triangle', 0.12, 880),
    dice: (c) => { for (let i = 0; i < 7; i++) tone(c, 180 + Math.random() * 220, i * 0.07, 0.05, 'square', 0.06); },
    step: (c) => tone(c, 300, 0, 0.08, 'sine', 0.12, 220),
    buy: (c) => { tone(c, 523, 0, 0.1, 'triangle', 0.15); tone(c, 784, 0.1, 0.18, 'triangle', 0.15); },
    card: (c) => { tone(c, 440, 0, 0.1, 'sine', 0.12); tone(c, 660, 0.09, 0.1, 'sine', 0.12); tone(c, 880, 0.18, 0.16, 'sine', 0.12); },
    rent: (c) => { tone(c, 330, 0, 0.12, 'sawtooth', 0.08, 200); tone(c, 220, 0.12, 0.18, 'sawtooth', 0.08, 140); },
    coin: (c) => { tone(c, 988, 0, 0.07, 'square', 0.07); tone(c, 1319, 0.07, 0.16, 'square', 0.07); },
    build: (c) => { tone(c, 200, 0, 0.06, 'square', 0.1); tone(c, 260, 0.08, 0.06, 'square', 0.1); tone(c, 392, 0.16, 0.14, 'triangle', 0.12); },
    jail: (c) => { tone(c, 180, 0, 0.25, 'sawtooth', 0.1, 90); },
    win: (c) => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(c, f, i * 0.13, 0.2, 'triangle', 0.16)); },
    lose: (c) => { [392, 330, 262, 196].forEach((f, i) => tone(c, f, i * 0.18, 0.25, 'sawtooth', 0.09)); }
  };

  MD.Sound = {
    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },
    play(name) {
      if (!enabled || !FX[name]) return;
      const c = ac();
      if (!c) return;
      try { FX[name](c); } catch (e) { /* audio opsional */ }
    }
  };
})(window.MD);
