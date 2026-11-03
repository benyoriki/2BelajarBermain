# Dino Family Play — Homepage 2026 (Bright Fantasy UI)
HTML5 + CSS3 + JavaScript vanilla. Tanpa build, tanpa npm, siap GitHub Pages.

## Struktur
```
index.html  style.css  app.js  README.md  .gitignore  .nojekyll
assets/            (semua gambar & ikon portal, tanpa subfolder)
Ular_tangga_v01/   (game Ular Tangga Dino — mandiri, lihat README di dalamnya)
  index.html  style.css  responsive.css  script.js  game-engine.js  board.js
  dice.js  player.js  animation.js  audio.js  tv-navigation.js  storage.js
  settings.js  manifest.json  service-worker.js  README.md
  assets/images/   (gambar game)
```
## Upload ke GitHub Pages
1. Ekstrak ZIP, salin **isi** folder `DinoFamilyPlay` ke root repository (index.html harus di root).
2. Gabungkan dengan folder game lama (mis. `ular-tangga/`, `monopoli/`). Jangan timpa folder game.
3. Commit & push → Settings → Pages → Deploy from branch → `main` / root.
4. Pastikan file `CNAME` (belajarbermain2.online) tetap ada.

## Menghubungkan game
Edit array `GAMES` di `app.js`. Ular Tangga sudah terhubung ke `Ular_tangga_v01/index.html` (huruf besar-kecil harus persis sama di GitHub Pages). Monopoli terhubung ke `monopoli_v01/index.html`. `href` kosong = kartu "Segera Hadir".

## Mode Smart TV
Aktif otomatis di browser TV (Android TV, Tizen, WebOS), atau tambahkan `?tv=1` untuk uji di PC. D-pad (panah) memindahkan fokus, OK = Enter, Back/Esc menutup modal.

## Aset
Aset di `assets/` berasal dari Asset Upgrade Pack 2026 (hero-family-play.webp, thumbnail game bersih, Dino Pink asli). Judul game ditulis di HTML.

## Ganti aset
Timpa file di `assets/` dengan nama sama. Thumbnail game saat ini placeholder otomatis (`assets/`); karakter Dino Pink dibuat dari Dino Biru (ganti dengan ilustrasi asli bila ada).

## Tahap berikutnya
Halaman Semua Game, Misi Keluarga & Pencapaian fungsional (localStorage), pencarian, profil pemain, thumbnail game final, audio.

## Checklist testing
- HP 360/390/430: tanpa scroll horizontal, menu hamburger terbuka dengan background terang, tombol ≥48px.
- Tablet 768/1024: kategori & game 3 kolom.
- Desktop 1366/1920: hero 2 kolom, game 4 kolom.
- TV: buka `?tv=1`; panah = pindah fokus, Enter = pilih, Esc/Back = tutup modal; fokus ungu + cincin kuning.

## Update: Game Launcher UI
Hero memakai karakter PNG transparan di atas `hero-jungle.webp`; 7 kategori; 8 game card (Petualangan Dino & Halma Dino = Segera Hadir). Mode TV: sidebar kiri, game card horizontal, fokus awal di "Mulai Bermain". Tombol Pengaturan/Pencarian/Profil saat ini membuka modal "Segera Hadir".

## Update: hero HD & navigasi HP
Hero memakai `assets/hero-family-play.webp` (ilustrasi HD, tepi bersih) yang menyatu dengan background jungle. Ditambah bagian "Fitur Utama" dan tab bar bawah di HP.

## Update v04: Redesain UI 2026
Tampilan baru: header kaca melayang, hero gelap dengan headline besar, strip statistik, kategori gaya bento, kartu game putih dengan status "Siap main"/"Segera", bagian "Cara Main", Misi Keluarga interaktif (ketuk misi, tersimpan per hari di `localStorage`), showcase multi perangkat, FAQ, dan CTA penutup. HP punya tab bar bawah. Smart TV: sidebar kiri + game card horizontal + fokus besar (aktif otomatis di browser TV, `?tv=1`, atau tombol "Coba Mode TV"). Font: Fredoka + Nunito (Google Fonts); jika offline otomatis memakai font sistem.
`og:image` memakai URL absolut `https://benyoriki.github.io/2BelajarBermain/assets/preview.jpg` — ganti jika domain berubah.

## Update v05: poles berdasarkan tampilan HP asli
Hero HP lebih ringkas (gambar naik ke layar pertama), header lebih solid + garis progres scroll, strip marquee nama game, bagian "Game Unggulan" (link otomatis dari `GAMES[0]`), breakpoint tablet / "situs desktop" di HP (game 3 kolom, langkah 3 kolom), filter game & kartu "Segera Hadir" berupa carousel geser di HP.

## Update v06
Perbaikan: menu hamburger HP (sebelumnya terpotong), garis kosong di atas header, bagian "Satu portal, semua layar" disembunyikan di HP. Baru: loading screen 3 detik (murni CSS, ringan) dan kredit "Dikembangkan oleh tim benyoriki.com" (tautan tab baru) di loading screen & footer.

## Update v07: Ular Tangga Dino terhubung
- Game Ular Tangga Dino V3 masuk ke folder `Ular_tangga_v01/` dan tombol **Mainkan** di portal membuka game itu.
- Tampilan game diselaraskan dengan portal: font Fredoka + Nunito, tombol pil oranye, panel navy, header melayang berbentuk pil, fokus kuning (sama seperti portal).
- Menu game punya tombol kembali (←) ke `../index.html#game`; di game, tombol Back/Esc pada menu juga kembali ke portal. Tombol **Semua Game** ada di halaman Tentang.
- **Mode TV dibagi:** pilihan "Coba Mode TV" portal (`dfp-tv`) dan `?tv=1` diteruskan ke game dan sebaliknya.
- Thumbnail `assets/ular-tangga.webp` diganti dengan komposisi dari papan game asli.
- Game punya service worker sendiri (cakupan folder `Ular_tangga_v01/` saja), jadi bisa dimainkan offline setelah dibuka sekali; portal tidak terpengaruh.
- Semua path relatif: aman di `https://USERNAME.github.io/NAMA-REPO/` maupun domain sendiri.

## Update v08
- **Loading screen baru:** papan ular tangga mini sebagai bar progres (ubin pelangi menyala satu per satu, Dino Biru berjalan dan melompat ke piala), deretan bidak dino yang melompat bergelombang, bintang berkedip, latar aurora ringan (tanpa `filter: blur`). Hanya memakai animasi `transform`/`opacity`, dan mengikuti `prefers-reduced-motion` (tampil statis lalu hilang lebih cepat).
- **Loading tidak diulang saat kembali dari game:** dilewati bila URL memakai `#game` atau datang dari halaman lain di situs ini. Tambahkan `?boot=1` pada URL untuk memaksa loading tampil.
- **Ikon dadu baru:** `assets/dice.svg` diganti dengan dadu 3D isometrik (muka bergradasi ungu-putih, mata dadu permata, kilau dan bintang kecil). Otomatis dipakai di pil hero, chip "Ular Tangga siap main", dan dadu melayang di bagian sorotan.
- **Tombol Kembali di game:** ikon panah + tulisan "Kembali" (oranye) di menu game, dan tombol "Layar Utama" di dialog jeda; keduanya membuka `../index.html#game` (membawa `?tv=1` bila Mode TV aktif).

## Update v09
- **Dino tidak terpotong:** `assets/dino-blue.png` dan `assets/dino-pink.png` diganti dengan gambar utuh (395×520, latar transparan). Dipakai di game unggulan, kategori, misi, loading screen, dan CTA. Di game unggulan, bidak diturunkan sedikit supaya alasnya tidak terpotong bingkai.
- **Dadu diganti karakter:** di game unggulan, dadu melayang diganti Pterodactyl + trio Dino Hijau, Merah, Kuning di tengah.
- **HP:** gambar latar hutan pada blok "Siap main bareng keluarga?" (tepat di bawah Tanya Jawab) dihapus, diganti gradasi navy polos.
- **Loading screen 4 detik:** animasi jalan Dino Biru, lompatan, teks, dan fade-out disesuaikan (fade mulai detik ke-4, elemen dihapus ~4,7 dtk).
- **Menu Dukungan:** menu "Dukung" di header/menu HP/footer, bagian `#dukung`, dan dialog donasi (tab QRIS + Transfer BCA, tombol Unduh QRIS, tombol Salin Nomor Rekening). Ganti data di `index.html` (cari `id="donate"`), gambar QRIS di `assets/qris.png`.

## Update v10
- **FAQ disembunyikan di HP** (≤860px): bagian "Pertanyaan yang sering muncul", link menu, dan link footer. Tetap tampil di tablet/PC dan Mode TV.
- **Profil Pemain:** tombol Profil (tab bar HP, ikon di header PC) membuka dialog berisi avatar dengan cincin level, nama pemain, 4 statistik (total bintang, bintang hari ini, hari beruntun, game dimainkan), pilihan 6 karakter, 6 lencana, dan tombol atur ulang. Level naik tiap 5 bintang. Data di `localStorage` (`dfp-profile`, `dfp-hist`), bintang diambil dari Misi Keluarga.
- **Dino Kuning, Merah, Hijau diganti** dengan gambar utuh yang bersih (tepi rapi, tanpa pinggiran berwarna). Ukuran atribut gambar dan susunan loading screen/hero disesuaikan.

## Update v11: Profil Pemain didesain ulang
Kartu pemain gaya 2026: hero aurora yang warnanya mengikuti karakter pilihan, avatar dengan cincin progres dan lencana level, bar XP, bento statistik (total bintang, bintang hari ini, game dimainkan), strip aktivitas 7 hari, pilihan karakter berupa kartu, lencana dengan progres, tombol Bagikan (Web Share / salin teks), dan dock tombol tetap di bawah. Konfirmasi "Atur ulang profil" kini tampil di dalam desain (tidak lagi memakai dialog bawaan browser).
