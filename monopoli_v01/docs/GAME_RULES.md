# Aturan Monopoli Dino

## Dasar
- 2-4 pemain, uang awal Rp 3.000 (bisa 2.000 / 5.000 di Pengaturan). Melewati atau mendarat di MULAI: +Rp 300.
- Papan 36 petak (indeks 0-35, searah jarum jam terbalik dari MULAI): MULAI, Penjara (9), Parkir Gratis (18), Masuk Penjara (27).

## Giliran
1. Lempar 2 dadu dan maju sesuai jumlah.
2. Double: lempar lagi. Double 3 kali berturut-turut: langsung ke Penjara.
3. Setelah petak diselesaikan, tekan **Akhiri Giliran**. Kelola aset (Bangun, Jual/Gadai, Tukar) bisa dilakukan saat giliranmu.

## Petak
| Petak | Efek |
|---|---|
| Properti / Transportasi kosong | Boleh dibeli seharga petak (tombol Lewati = tidak beli) |
| Properti milik lawan | Bayar sewa (tidak ada sewa jika digadaikan) |
| Kesempatan / Kejutan / Aksi / Pajak | Ambil kartu dan jalankan efeknya |
| Bonus | +Rp 150 dari Bank |
| Parkir Gratis | Tidak ada efek |
| Masuk Penjara | Langsung ke Penjara |

## Sewa
- Sewa dasar = 10% harga. Memiliki semua petak satu warna: sewa dasar x2.
- Dengan bangunan: 1, 2, 3, 4 rumah, hotel (= 5 tingkat) mengikuti tabel di kartu properti.
- Transportasi: Rp 50 / 100 / 200 / 400 sesuai jumlah transportasi yang dimiliki.

## Membangun
- Wajib punya semua petak satu grup warna, tidak ada yang digadaikan.
- Bangun merata antar petak di grup (selisih maksimal 1). Maks 4 rumah, lalu hotel.
- Biaya per rumah: Rp 50 (grup 1-2), 100 (grup 3-4), 150 (grup 5-6), 200 (grup 7-8). Menjual bangunan: 50% harga, juga merata.

## Gadai, Jual, Tukar
- Gadai: terima 50% harga. Hanya jika tidak ada bangunan di grup. Tebus: 55% harga (50% + 10%).
- Jual properti ke Bank: 50% harga, hanya jika tidak digadaikan dan tidak ada bangunan di grup.
- Tukar: pilih pemain, tentukan properti + uang kedua pihak. Pihak lawan menerima/menolak (CPU menilai nilai tawaran). Properti di grup yang punya bangunan tidak bisa ditukar.

## Penjara
- Masuk karena: petak Masuk Penjara, kartu, atau 3x double.
- Keluar: lempar double, bayar Rp 100, atau Kartu Bebas Penjara. Setelah 3 giliran gagal wajib bayar Rp 100 lalu jalan.

## Utang & Bangkrut
- Jika tidak cukup uang, pemain (manusia) diberi kesempatan menjual bangunan / menggadai, atau menyerah. CPU melakukannya otomatis.
- Bangkrut ke pemain: semua properti dan uang pindah ke penagih. Bangkrut ke Bank: properti kembali kosong.
- Pemain terakhir yang bertahan menang; layar hasil menampilkan saldo, total aset, dan statistik.

## CPU
- **Mudah**: membeli acak ~50%, jarang membangun, tidak menukar, simpan uang besar.
- **Normal**: membeli jika sisa uang aman, membangun, menebus gadai, sesekali mengajukan tukar.
- **Sulit**: membeli hampir semua, memblokir monopoli lawan, membangun agresif, aktif mengajukan tukar untuk melengkapi grup.
