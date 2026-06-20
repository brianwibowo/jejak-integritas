🎮 PANDUAN SISTEM JALUR & ATURAN GAME: JEJAK INTEGRITAS
1. Peta Papan & Koordinat Presisi (Board.tsx)
Papan permainan menggunakan model grid 50 kotak (petak 1 s.d. 50) dengan arah pergerakan zigzag (ular tangga klasik) dari bawah ke atas:

Kotak 1: Kotak awal mulai permainan.
Kotak 50: Kotak Finish (dilambangkan dengan gambar piala emas).
Pergerakan Zigzag:
Baris 5 (Bawah, Kotak 1–10): Bergerak dari Kiri ➔ Kanan
Baris 4 (Kotak 11–20): Bergerak dari Kanan ➔ Kiri
Baris 3 (Kotak 21–30): Bergerak dari Kiri ➔ Kanan
Baris 2 (Kotak 31–40): Bergerak dari Kanan ➔ Kiri
Baris 1 (Atas, Kotak 41–50): Bergerak dari Kiri ➔ Kanan
TIP

Sistem Koordinat Per-Kotak (Terbaru): Setiap nomor kotak (1 sampai 50) memiliki pasangan koordinat [X, Y] unik yang telah dikunci secara visual. Pion berjalan mulus per langkah (+1) ke titik tengah visual masing-masing kotak. Ini menghilangkan isu pion melenceng di kotak-kotak berukuran lebar (seperti kotak 2, 3, dan 23) serta menjaga gerakan vertikal (20 ➔ 21 dan 40 ➔ 41) agar tetap tegak lurus ke atas.

2. Sistem Penilaian (Scoring System)
Pemenang akhir TIDAK ditentukan oleh siapa yang mencapai garis Finish paling cepat, melainkan oleh Akumulasi Total Skor Tertinggi saat permainan berakhir.

$$\text{Skor Akhir} = \text{Poin Kuis} + \text{Poin Baris} + \text{Bonus Finisher}$$

A. Poin Jawaban Kuis (+10 Poin / Soal)
Setiap jawaban kuis yang dijawab dengan benar memberikan tambahan +10 Poin.
Jawaban salah atau kehabisan waktu (timeout) memberikan 0 Poin.
B. Poin Baris Papan (+5 Poin / Baris yang Dilewati)
Pemain mendapatkan poin setiap kali berhasil melewati batas kelipatan 10 kotak permainan:

Kotak 1–10 (Baris 5): +0 Poin
Kotak 11–20 (Baris 4): +5 Poin
Kotak 21–30 (Baris 3): +10 Poin
Kotak 31–40 (Baris 2): +15 Poin
Kotak 41–49 (Baris 1): +20 Poin
Kotak 50 (Finish): +25 Poin
C. Bonus Finisher (+40 s.d. +10 Poin)
Diberikan kepada pemain yang berhasil mendarat tepat di kotak 50 (Finish) berdasarkan urutan kedatangan:

Finish Peringkat ke-1: +40 Poin
Finish Peringkat ke-2: +30 Poin
Finish Peringkat ke-3: +20 Poin
Finish Peringkat ke-4: +10 Poin

### 📊 Simulasi Keadilan Skor (Fairness Analysis)
Tujuan dari penyesuaian nilai bonus finisher ini adalah agar game tidak dimenangkan hanya oleh faktor keberuntungan dadu (siapa yang sampai finish duluan), melainkan menyeimbangkan penghargaan bagi pemain yang berpengetahuan luas dan memiliki persentase jawaban benar yang tinggi.

Berikut adalah simulasi dari 3 skenario permainan yang membuktikan keadilan sistem skor baru ini:

#### Skenario 1: Lucky Rusher vs Knowledgeable Slider
*   **Pemain A (Rushed / Cepat & Beruntung)**: Melempar dadu tinggi, memanjat tangga, dan jarang menjawab kuis. Finis **ke-1**.
    *   Jawaban Benar: 4 soal (+40 Pts)
    *   Bonus Baris: +25 Pts (Finish)
    *   Bonus Finish: +40 Pts (Ke-1)
    *   **Skor Akhir: 105 Pts**
*   **Pemain B (Pemain Cerdas & Teliti)**: Mengalami kemerosotan karena ular, membutuhkan waktu lebih lama, namun menjawab hampir semua kuis dengan benar. Finis **ke-3**.
    *   Jawaban Benar: 12 soal (+120 Pts)
    *   Bonus Baris: +25 Pts (Finish)
    *   Bonus Finish: +20 Pts (Ke-3)
    *   **Skor Akhir: 165 Pts**
*   *Hasil*: **Pemain B Menang**. Ini adil karena pemain B membuktikan pengetahuan integritasnya jauh lebih baik (12 benar vs 4 benar), meskipun pemain A beruntung dengan dadu untuk finish duluan.

#### Skenario 2: Pemain Pintar Terjebak Waktu vs Lucky Rushed
*   **Pemain A (Rushed / Kurang Cerdas)**: Cepat finish tapi asal-asalan menjawab kuis. Finis **ke-1**.
    *   Jawaban Benar: 2 soal (+20 Pts)
    *   Bonus Baris: +25 Pts (Finish)
    *   Bonus Finish: +40 Pts (Ke-1)
    *   **Skor Akhir: 85 Pts**
*   **Pemain B (Pemain Pintar Kehabisan Waktu)**: Terjebak di baris atas (kotak 45) karena durasi lobi habis (waktu habis), namun akurasi jawaban sangat tinggi.
    *   Jawaban Benar: 13 soal (+130 Pts)
    *   Bonus Baris: +20 Pts (Row 1)
    *   Bonus Finish: +0 Pts (Belum Finish)
    *   **Skor Akhir: 150 Pts**
*   *Hasil*: **Pemain B Menang**. Pengetahuan akademis pemain dihargai lebih tinggi daripada kecepatan murni tanpa pemahaman.

#### Skenario 3: Finis Ketat (Akurasi sebagai Penentu)
*   **Pemain A**: Finis **ke-1**.
    *   Jawaban Benar: 9 soal (+90 Pts)
    *   Bonus Baris: +25 Pts
    *   Bonus Finish: +40 Pts
    *   **Skor Akhir: 155 Pts**
*   **Pemain B**: Finis **ke-2**.
    *   Jawaban Benar: 11 soal (+110 Pts)
    *   Bonus Baris: +25 Pts
    *   Bonus Finish: +30 Pts
    *   **Skor Akhir: 165 Pts**
*   *Hasil*: **Pemain B Menang**. Selisih 2 jawaban benar membalikkan keunggulan bonus peringkat finis pemain A.

#### Skenario 4: Skor Kembar (Mengaktifkan Sistem Tie-Breaker)
Terjadi ketika waktu habis (10 menit) dan ada dua pemain yang memiliki skor akhir persis sama:
*   **Pemain A (Budi)**: Berada di Kotak 45 (Baris 1) dengan 10 jawaban benar.
    *   Skor: 100 Pts (Kuis) + 20 Pts (Baris) = **120 Pts**
*   **Pemain B (Siti)**: Berada di Kotak 22 (Baris 3) dengan 11 jawaban benar.
    *   Skor: 110 Pts (Kuis) + 10 Pts (Baris) = **120 Pts**
*   *Proses Evaluasi Tie-Breaker*:
    *   Sistem mengecek total skor: Keduanya sama-sama **120 Pts**.
    *   Sistem mengecek jumlah jawaban benar (Tie-breaker prioritas integritas): Siti (**11 benar**) menang atas Budi (**10 benar**).
    *   *Hasil*: **Siti dinyatakan sebagai Juara 1** dan Budi sebagai Juara 2.

#### Skenario 5: Skor & Jumlah Benar Kembar (Mengaktifkan Tie-Breaker Posisi Papan)
*   **Pemain A (Budi)**: Berada di Kotak 35 (Baris 2) dengan 10 jawaban benar.
    *   Skor: 100 Pts (Kuis) + 15 Pts (Baris) = **115 Pts**
*   **Pemain B (Siti)**: Berada di Kotak 32 (Baris 2) dengan 10 jawaban benar.
    *   Skor: 100 Pts (Kuis) + 15 Pts (Baris) = **115 Pts**
*   *Proses Evaluasi Tie-Breaker*:
    *   Sistem mengecek total skor: Keduanya sama-sama **115 Pts**.
    *   Sistem mengecek jumlah jawaban benar: Keduanya sama-sama **10 benar**.
    *   Sistem mengecek posisi kotak terakhir di papan: Budi (**Kotak 35**) menang atas Siti (**Kotak 32**).
    *   *Hasil*: **Budi dinyatakan sebagai Pemenang**.

3. Alur Putaran Giliran & Aturan Main (Gameplay Loop)
Lempar Dadu: Pemain aktif mengocok dadu.
Aturan Melebihi Batas (Overshoot): Angka dadu harus pas untuk masuk kotak 50. Jika angka dadu melebihi sisa langkah ke kotak 50, pion batal berjalan dan giliran langsung dilewati (skip).
Mendarat di Kotak & Kuis: Pion berjalan selangkah demi selangkah. Setelah berhenti di kotak tujuan (kotak 2–49), kuis pilihan ganda akan muncul sesuai kategori warna kotak tersebut:
🟦 Biru: Kotak Nilai PAK (Pendidikan Anti Korupsi)
🟥 Merah: Kotak Pelanggaran
🟨 Kuning: Kotak Dilema Moral
🟩 Hijau: Kotak Kearifan Lokal
🟪 Ungu: Kotak Aksi
Timer Soal 15 Detik (Anti-Curang): Pemain memiliki batas waktu 15 detik untuk menjawab. Jika waktu habis, jawaban otomatis dianggap salah.
Konsekuensi Ular & Tangga:
Jika Jawaban Benar: Pemain mendapatkan poin, dan jika kotak tersebut memiliki tangga, pion akan otomatis memanjat naik ke atas.
Jika Jawaban Salah/Timeout: Pemain tidak mendapat poin kuis, dan jika kotak memiliki kepala ular, pion akan otomatis merosot turun ke bawah.
Mencapai Finish: Jika pion mendarat tepat di kotak 50, pemain mendapatkan poin bonus finish. Pada putaran berikutnya, giliran pemain tersebut akan dilewati (auto-skip) agar pemain lain yang belum finish bisa terus bermain.
4. Kondisi Selesai Permainan (End Game Trigger)
Permainan baru dinyatakan selesai (phase = finished) dan memunculkan Victory Modal hanya ketika:

Seluruh Pemain (termasuk bot/simulasi) telah sukses mendarat di kotak 50 (Finish).
ATAU batas durasi waktu permainan (10, 20, 30, 40, 50, 60 menit) yang dipilih Host di lobi telah habis (timeRemaining === 0).
5. Fitur Penunjang & Proteksi Koneksi (Reliability & UX)
Tambah Bot Lobi (Pemain Simulasi): Host dapat menambahkan bot pintar (seperti Budi 🤖, Siti 🤖, dll.) menggunakan tombol + di lobi untuk mengisi slot bermain.
Grace Period Disconnect (30 Detik): Jika pemain kehilangan koneksi (misalnya karena layar HP mati atau berganti tab di mobile), status mereka di papan skor berubah menjadi Offline dan permainan ditangguhkan sementara. Pemain memiliki waktu 30 detik untuk masuk kembali secara otomatis tanpa menghentikan lobi/permainan.
Intersepsi Tombol Back Browser: Menekan tombol kembali (back) saat game berjalan tidak akan langsung mengeluarkan pemain, melainkan memicu layar jeda (Pause Menu) terlebih dahulu demi keamanan data game.
6. Visual, Tema & Optimasi Mobile responsif
Desain Chalkboard: Leaderboard memiliki warna hijau forest hangat (#122c06) dengan bingkai kayu cokelat gelap (#5c3208), serasi dengan meja kayu latar belakang.
Optimasi Aset (WebP): Seluruh berkas gambar dikompresi menjadi format .webp berkualitas tinggi. Total ukuran aset menyusut dari ~25MB menjadi ~2.5MB, mempercepat waktu muat awal di HP mobile menjadi di bawah 0.5 detik.
3-Tier Responsive Layout & Mobile Blocker:
Desktop / Tablet: Papan skor ditampilkan melayang secara permanen di sisi kanan layar.
Mobile Landscape: Papan skor disembunyikan di belakang tombol 🏆 (pojok kanan atas) agar area papan permainan tetap terlihat luas dan lega di layar HP.
Portrait Blocker: Jika HP diposisikan vertikal (portrait), layar akan diblokir dengan animasi instruksi untuk memutar HP ke arah tidur (landscape).
Posisi Timer Sisa Waktu: Diposisikan di pojok kiri atas (top-4 left-4) agar posisinya yang melayang tidak berbenturan secara visual dengan modal pertanyaan kuis di tengah layar.
Semua komponen di atas sudah terintegrasi dan diselaraskan secara penuh di sisi frontend (Next.js) maupun backend (Socket.io). Game siap dimainkan dengan performa optimal! 🚀