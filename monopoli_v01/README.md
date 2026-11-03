# Monopoli Dino

Game papan Monopoli bertema dinosaurus: **Bermain • Belajar • Bersama Keluarga**.
Vanilla JavaScript + CSS, tanpa build, tanpa framework, tanpa CDN, tanpa backend.

## Fitur
- Papan 36 petak interaktif (HTML/CSS, bukan gambar statis), 18 properti dalam 8 grup warna + 4 transportasi
- 2-4 pemain: Solo vs CPU (Mudah / Normal / Sulit) dan Multiplayer lokal bergantian
- Dadu, double, penjara, beli/sewa, bangun rumah & hotel, gadai, jual, tukar, bangkrut, layar menang + statistik
- Kartu Kesempatan, Kejutan, Aksi, Pajak, dan Bebas Penjara dengan efek nyata
- Autosave, Lanjutkan, Game Baru, Hapus Save (dengan konfirmasi) - key `monopolidino_save_v1`
- Responsif: PC, HP, tablet, Smart TV (navigasi remote/D-pad)
- Efek suara via Web Audio (bisa dimatikan, tidak ada autoplay)
- Tampilan 2026 "Senja Jurassic": latar senja + gunung api vektor (ringan), panel kaca, tombol modern dengan CTA amber, bingkai papan emas, dock aksi berikon, dadu bisa diketuk untuk melempar
- Layout adaptif: HP potret/landscape, tablet, PC (2 kolom), dan TV (skala otomatis di layar >1500px + mode TV)

## Struktur
```
index.html  style.css  game.css  responsive.css
script.js (UI)  game.js (mesin)  board.js  player.js  economy.js
cards.js  ai.js  storage.js  tv-navigation.js  sound.js
assets/  (SEMUA file aset ada langsung di dalam satu folder ini, tanpa subfolder: logo, karakter, dadu, kartu, ikon, font, latar, dll)
docs/GAME_RULES.md
```

## Menjalankan
Buka `index.html` langsung di browser, atau jalankan server statis apa pun (`python3 -m http.server`).
Semua path relatif, jadi aman di subfolder GitHub Pages.

## Deploy ke GitHub Pages
1. Buat repository `monopoli-dino`, upload **isi** folder ini ke root repository.
2. Settings > Pages > Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Buka `https://USERNAME.github.io/monopoli-dino/`.

## Kontrol
- Mouse/sentuh: klik tombol dan petak (petak menampilkan kartu detail).
- Remote/keyboard: Panah = pindah fokus, Enter/OK = pilih, Esc/Back = kembali, Spasi = aksi utama.
- Mode TV otomatis pada UA Smart TV, atau paksa lewat Pengaturan atau `?tv=1`.

## Catatan aset & keterbatasan
- Aset dipotong dari lembar referensi (resolusi rendah, ~130-200 px per karakter). Cukup untuk bidak dan HUD, akan terlihat agak lembut jika diperbesar. Ganti file di `assets/` dengan versi beresolusi tinggi bernama sama bila tersedia.
- Pack tidak berisi audio; efek suara dibuat dengan Web Audio. Mode "Online Room" pada gambar referensi tidak dibuat karena memerlukan backend.
- Tidak ada lelang; properti yang tidak dibeli tetap kosong. Tidak ada batas stok rumah/hotel.
- Save hanya ditulis pada titik stabil (awal giliran / setelah aksi). Jika browser ditutup di tengah animasi, game lanjut dari titik tersimpan terakhir.
- Font: Fredoka (SIL OFL), disertakan lokal di `assets/`.
