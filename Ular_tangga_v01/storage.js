/* Penyimpanan lokal (localStorage). Semua data dibersihkan saat dimuat. Tidak menyimpan data sensitif. */
(function (U) {
  var KEY = 'utd2026.v1', CH = ['biru', 'merah', 'kuning', 'hijau', 'oranye'];
  var def = { music: true, sfx: true, volume: 0.7, tv: 'auto', mode: 2,
    names: ['', '', '', ''], chars: ['biru', 'merah', 'kuning', 'hijau'], history: [] };
  var data = {}, k;
  for (k in def) data[k] = def[k];
  function clean(s) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12); }
  U.cleanName = clean;
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (typeof o.music === 'boolean') data.music = o.music;
      if (typeof o.sfx === 'boolean') data.sfx = o.sfx;
      if (typeof o.volume === 'number' && o.volume >= 0 && o.volume <= 1) data.volume = o.volume;
      if (['auto', 'on', 'off'].indexOf(o.tv) > -1) data.tv = o.tv;
      if (o.mode >= 1 && o.mode <= 4) data.mode = o.mode | 0;
      if (Array.isArray(o.names)) data.names = [0, 1, 2, 3].map(function (i) { return clean(o.names[i]); });
      if (Array.isArray(o.chars)) data.chars = [0, 1, 2, 3].map(function (i) { return CH.indexOf(o.chars[i]) > -1 ? o.chars[i] : def.chars[i]; });
      if (Array.isArray(o.history)) data.history = o.history.filter(function (r) { return r && CH.indexOf(r.char) > -1; }).slice(0, 50)
        .map(function (r) { return { name: clean(r.name) || 'Pemain', char: r.char, players: (r.players | 0) || 2, moves: (r.moves | 0) || 0, date: +r.date || 0 }; });
    }
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  U.Store = {
    get: function (key) { return data[key]; },
    set: function (key, v) { data[key] = v; save(); },
    addWin: function (rec) { data.history.unshift(rec); data.history = data.history.slice(0, 50); save(); },
    clearHistory: function () { data.history = []; save(); }
  };
})(window.UTD = window.UTD || {});
