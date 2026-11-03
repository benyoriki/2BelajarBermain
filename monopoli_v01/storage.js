/* storage.js - save game & pengaturan (localStorage, key: monopolidino_save_v1) */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const KEY = 'monopolidino_save_v1';
  const BAK = KEY + '_bak';
  const mem = {};
  const DEFAULTS = { sound: true, speed: 'normal', tv: 'auto', difficulty: 'normal', startMoney: 3000, bigText: false };

  function rd(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } }
  function wr(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function rm(k) { try { localStorage.removeItem(k); } catch (e) {} delete mem[k]; }
  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; }
  function pack(obj) { const b = JSON.stringify(obj); return JSON.stringify({ c: hash(b), b: b }); }
  function unpack(txt) {
    if (!txt) return null;
    try {
      const o = JSON.parse(txt);
      if (!o || typeof o.b !== 'string' || hash(o.b) !== o.c) return null;
      const d = JSON.parse(o.b);
      return d && d.version === 1 ? d : null;
    } catch (e) { return null; }
  }

  let data = null;
  function load() {
    if (data) return data;
    data = unpack(rd(KEY)) || unpack(rd(BAK)) || { version: 1, settings: {}, game: null };
    data.settings = Object.assign({}, DEFAULTS, data.settings || {});
    return data;
  }
  function flush() {
    data.savedAt = Date.now();
    const cur = rd(KEY);
    if (cur && unpack(cur)) wr(BAK, cur); // cadangan hanya dari save yang valid
    wr(KEY, pack(data));
  }

  MD.Storage = {
    DEFAULTS,
    getSettings() { return load().settings; },
    saveSettings(s) { load().settings = Object.assign({}, DEFAULTS, s); flush(); },
    hasGame() { return !!load().game; },
    getGame() { return load().game ? JSON.parse(JSON.stringify(load().game)) : null; },
    saveGame(g) { load(); data.game = JSON.parse(JSON.stringify(g)); flush(); },
    deleteGame() { load(); data.game = null; flush(); }
  };
})(window.MD);
