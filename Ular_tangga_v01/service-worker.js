/* Service worker v2: path relatif (aman di subpath GitHub Pages), pra-cache tahan-gagal, fallback offline. */
var VERSION = 'utd-2026-v3.2';
var CORE = ['./', 'index.html', 'style.css', 'responsive.css', 'script.js', 'game-engine.js', 'board.js', 'dice.js', 'player.js',
  'animation.js', 'audio.js', 'tv-navigation.js', 'storage.js', 'settings.js', 'manifest.json'];
var IMGS = ['background_hutan_dino_utama.webp', 'logo_dino_transparan.webp', 'badge_selamat_menang.webp', 'panel_pesan_dan_maskot.webp',
  'bidak_dino_biru.png', 'bidak_dino_merah_triceratops.png', 'bidak_dino_kuning_leher_panjang.png', 'bidak_dino_hijau.png', 'bidak_pterodactyl_oranye.png',
  'ikon_dadu.png', 'ikon_dadu_3d.svg', 'ikon_piala_juara.png', 'icon-192.png', 'icon-512.png', 'dfp-logo.png'].map(function (n) { return 'assets/images/' + n; });

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    /* File inti wajib berhasil; gambar dicoba satu per satu agar satu file hilang tidak menggagalkan instalasi. */
    return c.addAll(CORE).then(function () {
      return Promise.all(IMGS.map(function (u) { return c.add(u).catch(function () { /* abaikan */ }); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('utd-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {            // halaman: jaringan dulu (agar update cepat), cache bila offline
    e.respondWith(fetch(req).then(function (res) {
      var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put('index.html', cp); }); return res;
    }).catch(function () { return caches.match('index.html').then(function (r) { return r || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, cp); }); }
      return res;
    }).catch(function () { return Response.error(); });
  }));
});
