/* Karakter dan pemain. Warna identitas mengikuti warna dasar bidak. */
(function (U) {
  var P = 'assets/images/';
  U.CHARS = {
    biru:   { id: 'biru',   name: 'Dino Biru',   color: '#2f8cff', img: P + 'bidak_dino_biru.png' },
    merah:  { id: 'merah',  name: 'Dino Merah',  color: '#ff4b4b', img: P + 'bidak_dino_merah_triceratops.png' },
    kuning: { id: 'kuning', name: 'Dino Kuning', color: '#ffc61a', img: P + 'bidak_dino_kuning_leher_panjang.png' },
    hijau:  { id: 'hijau',  name: 'Dino Hijau',  color: '#34c24a', img: P + 'bidak_dino_hijau.png' },
    oranye: { id: 'oranye', name: 'Dino Oranye', color: '#ff8a1f', img: P + 'bidak_pterodactyl_oranye.png' }
  };
  U.CHAR_ORDER = ['biru', 'merah', 'kuning', 'hijau', 'oranye'];
  U.makePlayer = function (name, charId, cpu) {
    var c = U.CHARS[charId];
    return { name: (name || '').trim() || c.name, char: charId, color: c.color, img: c.img, cpu: !!cpu, pos: 1 };
  };
})(window.UTD);
