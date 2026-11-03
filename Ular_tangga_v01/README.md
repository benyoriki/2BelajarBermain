# Ular Tangga Dino 2026 — v3.2 (terintegrasi Dino Family Play)

Game ini berada di folder `Ular_tangga_v01/` pada proyek portal Dino Family Play. Tombol kembali (←) di menu membuka `../index.html#game`.

Game ular tangga keluarga (1–4 pemain), responsif untuk HP, tablet, laptop/PC, dan Smart TV. Tanpa build, tanpa dependensi, bisa offline (PWA).

## Struktur
Semua file kode ada di root. Hanya gambar yang berada di `assets/images/`.

## Upload ke GitHub Pages
Jika memakai portal Dino Family Play: cukup salin folder ini sebagai `Ular_tangga_v01/` di root repository (di samping `index.html` portal). Panduan di bawah untuk memakai game sebagai situs mandiri.
1. Buat repository baru di GitHub.
2. Upload **isi** folder ini ke root repository (`index.html`, semua `.js`, `.css`, `manifest.json`, `README.md`, folder `assets/`).
3. Settings → Pages → *Deploy from a branch* → `main` → `/ (root)` → Save.
4. Buka `https://USERNAME.github.io/NAMA-REPO/` (cukup sekali dengan internet agar cache offline terisi).

Semua path relatif, jadi aman di subpath repository maupun domain sendiri.

## Mengubah ular & tangga
Edit `U.CONFIG` di bagian atas `board.js`. Validator menolak konfigurasi yang salah (tangga menurun, ular menaik, kotak ganda, rantai perpindahan, di luar 1–100).

## Kontrol
- Sentuh / mouse: tekan tombol.
- Keyboard / remote TV: panah = pindah fokus, Enter/OK = pilih, Esc/Backspace/Back = kembali. Tab terkunci di dalam dialog.
- Mode TV: otomatis pada browser TV, atau `?tv=1`, atau Pengaturan → Mode layar.

## Keamanan data
Nama pemain dibersihkan (maks. 12 karakter, tanpa `< > & " ' \``) dan hanya ditampilkan lewat `textContent` / DOM API. Data localStorage divalidasi saat dimuat.

## Menguji lokal
`python3 -m http.server 8000` lalu buka `http://localhost:8000` (service worker butuh http/https, bukan `file://`).

## Setelah mengubah file
Naikkan `VERSION` di `service-worker.js` agar cache pengguna diperbarui.

## Perubahan v3.0
- **Visual:** logo transparan (`logo_dino_transparan.webp`) yang menyatu dengan latar; maskot dengan pudaran alas + bayangan lembut; tombol datar modern (tanpa kilap berlebihan); papan berpalet pelangi harmonis dengan petak 3D.
- **Papan:** angka kotak kini di lapisan paling atas (di atas bidak, ular, tangga) dan selalu terbaca; ular/tangga digeser menjauhi lencana angka; bidak dibersihkan tepinya.
- **Pemilihan pemain (HP):** satu kartu besar per tab (pratinjau karakter besar), bar tombol solid yang tidak menimpa kartu, validasi nama berpindah ke tab yang bermasalah.
- **Audio:** efek suara lewat bus tersendiri yang diputus saat keluar permainan; musik tetap satu timer.
- **Performa:** tanpa `backdrop-filter`; animasi idle hanya maskot menu; penanda giliran berhenti saat dialog terbuka.
- **PWA:** cache `utd-2026-v3.0` (28 file); naikkan `VERSION` setiap mengubah file.

## Riwayat
v2.0: engine stabil (pause/keluar/CPU), keamanan nama, tab setup awal. v1.0: versi pertama.

## v3.2
- Tombol **Kembali** (ikon + tulisan) ke layar utama di menu, dan tombol **Layar Utama** di dialog jeda.
- Ikon dadu 3D baru (`ikon_dadu_3d.svg`) pada tombol Lempar Dadu; dadu di panel dibuat glossy dengan lingkar warna pemain yang sedang giliran.
- Cache service worker `utd-2026-v3.2`.
