# Dino Family Play — Homepage 2026 (Bright Fantasy UI)
HTML5 + CSS3 + JavaScript vanilla. Tanpa build, tanpa npm, siap GitHub Pages.

## Struktur
```
index.html  style.css  app.js  README.md  .gitignore  .nojekyll
assets/   (semua gambar & ikon, tanpa subfolder)
```
## Upload ke GitHub Pages
1. Ekstrak ZIP, salin **isi** folder `DinoFamilyPlay` ke root repository (index.html harus di root).
2. Gabungkan dengan folder game lama (mis. `ular-tangga/`, `monopoli/`). Jangan timpa folder game.
3. Commit & push → Settings → Pages → Deploy from branch → `main` / root.
4. Pastikan file `CNAME` (belajarbermain2.online) tetap ada.

## Menghubungkan game
Edit array `GAMES` di `app.js`. Isi `href` dengan path game (default: `ular-tangga/index.html`, `monopoli/index.html` — **sesuaikan dengan path asli**). `href` kosong = kartu "Segera Hadir".

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
