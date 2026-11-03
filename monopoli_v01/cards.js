/* cards.js - dek kartu & efek: Kesempatan, Kejutan, Aksi, Pajak, Bebas Penjara */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const D = {
    kesempatan: { name: 'Kartu Kesempatan', color: '#f26a1b', img: 'assets/kartu-kesempatan.png', cards: [
      { t: 'Maju ke MULAI dan ambil Rp 300.', fx: { k: 'moveTo', to: 0, collect: true } },
      { t: 'Dino hijau menemukan fosil langka! Terima Rp 150.', fx: { k: 'gain', n: 150 } },
      { t: 'Maju ke Gunung Api. Jika melewati MULAI, ambil Rp 300.', fx: { k: 'moveTo', to: 24, collect: true } },
      { t: 'Maju ke stasiun terdekat.', fx: { k: 'nearest', type: 'rail' } },
      { t: 'Mundur 3 langkah.', fx: { k: 'moveBy', n: -3 } },
      { t: 'Langsung masuk Penjara! Tidak melewati MULAI.', fx: { k: 'jail' } },
      { t: 'Kartu Bebas Penjara. Simpan sampai dibutuhkan.', fx: { k: 'jailfree' } },
      { t: 'Perbaikan jalan: bayar Rp 100 per rumah dan Rp 250 per hotel.', fx: { k: 'repair', house: 100, hotel: 250 } },
      { t: 'Menang lomba lari dino! Terima Rp 200.', fx: { k: 'gain', n: 200 } },
      { t: 'Denda membuang telur sembarangan. Bayar Rp 80.', fx: { k: 'pay', n: 80 } },
      { t: 'Maju ke Pantai Fosil. Jika melewati MULAI, ambil Rp 300.', fx: { k: 'moveTo', to: 10, collect: true } },
      { t: 'Ulang tahun Dino! Terima Rp 50 dari setiap pemain.', fx: { k: 'gainAll', n: 50 } }
    ] },
    kejutan: { name: 'Kartu Kejutan', color: '#8e4fe6', img: 'assets/kartu-kejutan.png', cards: [
      { t: 'Hadiah kejutan dari Bank: terima Rp 120.', fx: { k: 'gain', n: 120 } },
      { t: 'Salah jalan! Mundur 2 langkah.', fx: { k: 'moveBy', n: -2 } },
      { t: 'Biaya dokter dino. Bayar Rp 100.', fx: { k: 'pay', n: 100 } },
      { t: 'Kartu Bebas Penjara. Simpan sampai dibutuhkan.', fx: { k: 'jailfree' } },
      { t: 'Kristal berhasil terjual! Terima Rp 180.', fx: { k: 'gain', n: 180 } },
      { t: 'Jalan-jalan ke Kota Dino. Jika melewati MULAI, ambil Rp 300.', fx: { k: 'moveTo', to: 32, collect: true } },
      { t: 'Traktir teman makan daun. Bayar Rp 40 ke setiap pemain.', fx: { k: 'payAll', n: 40 } },
      { t: 'Warisan dari Dino Kakek: terima Rp 250.', fx: { k: 'gain', n: 250 } },
      { t: 'Gempa kecil! Perbaikan Rp 60 per rumah dan Rp 200 per hotel.', fx: { k: 'repair', house: 60, hotel: 200 } },
      { t: 'Tersesat ke Penjara. Tidak melewati MULAI.', fx: { k: 'jail' } },
      { t: 'Maju ke Taman Fosil. Jika melewati MULAI, ambil Rp 300.', fx: { k: 'moveTo', to: 6, collect: true } },
      { t: 'Pengembalian pajak: terima Rp 90.', fx: { k: 'gain', n: 90 } }
    ] },
    aksi: { name: 'Kartu Aksi', color: '#2f8cff', img: 'assets/kartu-aksi.png', cards: [
      { t: 'Lempar dadu sekali lagi!', fx: { k: 'extraRoll' } },
      { t: 'Maju 3 langkah.', fx: { k: 'moveBy', n: 3 } },
      { t: 'Mundur 2 langkah.', fx: { k: 'moveBy', n: -2 } },
      { t: 'Rumah gratis! Satu rumah dipasang di propertimu (jika memenuhi syarat). Jika tidak, terima Rp 100.', fx: { k: 'freeHouse' } },
      { t: 'Curi telur! Ambil Rp 60 dari pemain terkaya.', fx: { k: 'steal', n: 60 } },
      { t: 'Bonus lari pagi: terima Rp 100.', fx: { k: 'gain', n: 100 } },
      { t: 'Naik kendaraan ke stasiun terdekat.', fx: { k: 'nearest', type: 'rail' } },
      { t: 'Perbaiki sarang. Bayar Rp 70.', fx: { k: 'pay', n: 70 } },
      { t: 'Tukar posisi dengan pemain yang paling jauh di depan.', fx: { k: 'swap' } }
    ] },
    pajak: { name: 'Kartu Pajak', color: '#e8a90f', img: 'assets/kartu-pajak.png', cards: [
      { t: 'Pajak bumi dino. Bayar Rp 150.', fx: { k: 'pay', n: 150 } },
      { t: 'Pajak air sungai. Bayar Rp 100.', fx: { k: 'pay', n: 100 } },
      { t: 'Pajak bangunan: Rp 40 per rumah dan Rp 115 per hotel.', fx: { k: 'repair', house: 40, hotel: 115 } },
      { t: 'Pajak 10% dari uang tunai (minimal Rp 50).', fx: { k: 'percent', n: 10 } },
      { t: 'Pajak pembangunan. Bayar Rp 200.', fx: { k: 'pay', n: 200 } },
      { t: 'Keringanan pajak! Bayar hanya Rp 50.', fx: { k: 'pay', n: 50 } },
      { t: 'Pajak jalan raya dino. Bayar Rp 120.', fx: { k: 'pay', n: 120 } }
    ] }
  };
  const BY_ID = {};
  Object.keys(D).forEach((k) => D[k].cards.forEach((c, i) => { c.id = k + '-' + i; c.deck = k; BY_ID[c.id] = c; }));

  MD.Cards = {
    DECKS: D,
    byId(id) { return BY_ID[id]; },
    newDecks() {
      const o = {};
      Object.keys(D).forEach((k) => { o[k] = MD.util.shuffle(D[k].cards.map((c) => c.id)); });
      return o;
    },
    /* ambil kartu teratas; kartu Bebas Penjara tidak kembali ke dek sampai dipakai */
    draw(S, deck) {
      const q = S.decks[deck];
      const id = q.shift();
      const card = BY_ID[id];
      if (card.fx.k !== 'jailfree') q.push(id);
      return card;
    },
    returnJailCard(S, id) { const c = BY_ID[id]; if (c) S.decks[c.deck].push(id); }
  };
})(window.MD);
