# 📊 Sistem Skorisasi — Jejak Integritas

Dokumen ini menjelaskan bagaimana skor dihitung dalam permainan **Jejak Integritas**, serta analisis keadilan sistem penilaian yang diterapkan.

---

## 1. Cara Menghitung Skor

Skor setiap pemain dihitung dari **tiga komponen**:

| Komponen | Penjelasan | Poin |
|----------|-----------|------|
| **Jawaban Benar** | Setiap jawaban benar mendapat poin | **+10 poin** per jawaban benar |
| **Poin Kemajuan (Row Points)** | Bonus yang bertambah seiring pemain maju ke baris lebih tinggi | **0 – 25 poin** (lihat tabel di bawah) |
| **Bonus Selesai (Finish)** | Bonus tambahan bagi pemain yang berhasil mencapai kotak FINISH | Juara 1: **+20**, Juara 2: **+15**, Juara 3: **+10**, Juara 4: **+5** |

### Total Skor:

> **Skor = (Jawaban Benar × 10) + Poin Kemajuan + Bonus Finish**

---

## 2. Poin Kemajuan per Baris

Papan permainan memiliki **50 kotak** yang terbagi dalam **5 baris**. Semakin tinggi posisi pemain, semakin besar poin kemajuan yang didapat:

| Baris | Kotak | Warna | Kategori Soal | Poin Kemajuan |
|-------|-------|-------|---------------|---------------|
| Baris 1 (bawah) | 1 – 10 | 🔵 Biru | Kotak Nilai PAK | **0 poin** |
| Baris 2 | 11 – 20 | 🔴 Merah | Kotak Pelanggaran | **5 poin** |
| Baris 3 | 21 – 30 | 🟡 Kuning | Kotak Dilema Moral | **10 poin** |
| Baris 4 | 31 – 40 | 🟢 Hijau | Kotak Kearifan Lokal | **15 poin** |
| Baris 5 (atas) | 41 – 50 | 🟣 Ungu | Kotak Aksi | **20 poin** |
| FINISH | 50 | — | — | **25 poin** |

---

## 3. Pengaruh Tangga dan Ular terhadap Skor

### 🪜 Tangga (Jawaban Benar + Ada Tangga)

Jika pemain menjawab **benar** dan berada di kotak tangga, pemain **naik** ke kotak yang lebih tinggi. Poin kemajuan ikut naik karena posisi berpindah ke baris yang lebih tinggi.

| Dari Kotak | Naik ke Kotak |
|-----------|--------------|
| 11 | 30 |
| 15 | 26 |
| 19 | 38 |
| 36 | 46 |

### 🐍 Ular (Jawaban Salah + Ada Ular)

Jika pemain menjawab **salah** dan berada di kotak ular, pemain **turun** ke kotak yang lebih rendah. Poin kemajuan ikut turun karena posisi berpindah ke baris yang lebih rendah.

| Dari Kotak | Turun ke Kotak |
|-----------|---------------|
| 24 | 7 |
| 35 | 12 |
| 44 | 21 |
| 48 | 34 |

### Ringkasan Konsekuensi:

| Kondisi | Apa yang Terjadi |
|---------|-----------------|
| Jawaban **benar**, tidak ada tangga | Tetap di posisi, **+10 poin** jawaban |
| Jawaban **benar**, ada tangga | Naik ke kotak tangga, **+10 poin** jawaban + poin kemajuan naik |
| Jawaban **salah**, tidak ada ular | Tetap di posisi, tidak ada penambahan poin |
| Jawaban **salah**, ada ular | Turun ke kotak ular, poin kemajuan ikut turun |

---

## 4. Contoh Perhitungan Skor

### Pemain A — Performa Baik

| Momen | Posisi | Jawaban | Total Benar | Poin Kemajuan | Skor |
|-------|--------|---------|------------|---------------|------|
| Ronde 1 | Kotak 5 | ✅ Benar | 1 | 0 | **10** |
| Ronde 2 | Kotak 11 → 🪜 naik ke 30 | ✅ Benar | 2 | 10 | **30** |
| Ronde 3 | Kotak 35 | ✅ Benar | 3 | 15 | **45** |
| Ronde 4 | Kotak 44 | ✅ Benar | 4 | 20 | **60** |
| FINISH | Kotak 50 (Juara 1) | — | 4 | 25 + Bonus 20 | **85** |

### Pemain B — Ada Kesalahan

| Momen | Posisi | Jawaban | Total Benar | Poin Kemajuan | Skor |
|-------|--------|---------|------------|---------------|------|
| Ronde 1 | Kotak 8 | ✅ Benar | 1 | 0 | **10** |
| Ronde 2 | Kotak 15 → 🪜 naik ke 26 | ✅ Benar | 2 | 10 | **30** |
| Ronde 3 | Kotak 35 → 🐍 turun ke 12 | ❌ Salah | 2 | 5 | **25** |
| Ronde 4 | Kotak 19 → 🪜 naik ke 38 | ✅ Benar | 3 | 15 | **45** |
| FINISH | Kotak 50 (Juara 2) | — | 5 | 25 + Bonus 15 | **90** |

> **Catatan**: Meskipun Pemain B sempat menjawab salah dan turun karena ular, ia bisa menyusul dengan lebih banyak menjawab benar di ronde selanjutnya.

---

## 5. Kategori Soal per Baris

Setiap baris di papan memunculkan **jenis soal yang berbeda**, sehingga semakin tinggi posisi pemain, semakin beragam aspek yang diuji:

| Baris | Warna | Kategori | Aspek yang Diukur |
|-------|-------|----------|------------------|
| 1 | 🔵 Biru | Kotak Nilai PAK | Pemahaman konsep nilai-nilai Pancasila & Anti Korupsi |
| 2 | 🔴 Merah | Kotak Pelanggaran | Kemampuan mengidentifikasi perilaku menyimpang |
| 3 | 🟡 Kuning | Kotak Dilema Moral | Penalaran moral dalam situasi yang tidak hitam-putih |
| 4 | 🟢 Hijau | Kotak Kearifan Lokal | Pemahaman nilai budaya Jawa & kearifan lokal |
| 5 | 🟣 Ungu | Kotak Aksi | Komitmen tindakan nyata dalam kehidupan sehari-hari |

**Jumlah Soal**: 90 soal total (9 tema × 10 soal per tema)

**9 Tema**: Jujur, Disiplin, Tanggung Jawab, Kerja Keras, Sederhana, Mandiri, Adil, Berani, Peduli

---

## 6. Analisis Keadilan Sistem Skor

### ✅ Mengapa Sistem Ini Adil

1. **Formula yang sama untuk semua pemain** — Tidak ada pemain yang diuntungkan oleh formula berbeda. Semua dihitung dengan rumus yang identik.

2. **Pengetahuan dihargai** — Jawaban benar selalu memberi +10 poin. Pemain yang lebih paham materi akan cenderung mendapat skor lebih tinggi.

3. **Konsekuensi yang jelas** — Jawaban salah di kotak ular berarti turun (dan skor turun). Jawaban benar di kotak tangga berarti naik (dan skor naik). Ini mengajarkan bahwa **setiap keputusan memiliki konsekuensi**.

4. **Bonus Finish yang bertingkat** — Pemain yang tiba duluan mendapat bonus lebih besar, memotivasi semua pemain untuk terus berusaha.

---

### ⚠️ Hal yang Perlu Dipahami

Berikut adalah beberapa hal yang mungkin ditanyakan oleh peserta didik atau rekan guru terkait keadilan:

#### 1. Skor Bisa Turun

Poin Kemajuan dihitung berdasarkan posisi **saat ini**. Jika pemain kena ular dari kotak 35 (Poin Kemajuan = 15) ke kotak 12 (Poin Kemajuan = 5), maka skornya turun 10 poin.

> **Ini bukan ketidakadilan, melainkan konsekuensi dari jawaban yang salah.** Sama seperti dalam kehidupan nyata: perilaku yang tidak berintegritas dapat membuat seseorang "turun" dari posisinya. Ini justru memperkuat pesan edukatif permainan.

#### 2. Faktor Keberuntungan Dadu

Pemain yang selalu menjawab benar bisa saja kalah dari pemain yang beruntung mendapatkan banyak tangga. Sebaliknya, pemain bisa sial mendarat di banyak ular meskipun jawabannya benar.

> **Ini adalah karakteristik alami permainan ular tangga** dan bukan kecacatan sistem. Dalam kehidupan nyata, keberhasilan juga dipengaruhi oleh faktor di luar kendali. Namun, secara statistik, **pemain yang lebih banyak menjawab benar akan cenderung mendapat skor lebih tinggi** karena komponen jawaban benar (×10) sangat dominan dalam formula.

#### 3. Soal Acak dalam Kategori yang Sama

Dua pemain yang berada di baris yang sama bisa mendapatkan soal yang berbeda, meskipun kategorinya sama. Hal ini bisa berarti satu pemain mendapat soal yang lebih mudah daripada yang lain.

> **Ini disengaja untuk variasi dan menghindari kebosanan.** Seluruh soal dalam satu kategori telah dirancang dengan tingkat kesulitan yang setara, sehingga perbedaannya minimal. Selain itu, pengacakan memastikan permainan tetap segar meskipun dimainkan berulang kali.

---

## 7. Panduan Guru — Penilaian Kelas

### Saran Rubrik Penilaian:

Guru dapat menggunakan skor game sebagai **salah satu komponen** penilaian, dikombinasikan dengan aspek lain:

| Komponen Penilaian | Bobot | Sumber Data |
|-------------------|-------|-------------|
| Skor Game (Jejak Integritas) | 40% | Otomatis dari sistem |
| Partisipasi & Kerja Sama | 20% | Observasi guru |
| Refleksi Tertulis | 20% | Lembar refleksi siswa |
| Diskusi Kelas | 20% | Partisipasi diskusi |

### Konversi Skor Game ke Predikat:

| Rentang Skor | Predikat | Keterangan |
|-------------|---------|------------|
| ≥ 100 | Sangat Baik (A) | Pemahaman mendalam terhadap nilai integritas |
| 70 – 99 | Baik (B) | Pemahaman baik dengan sedikit kekeliruan |
| 40 – 69 | Cukup (C) | Perlu penguatan pemahaman pada beberapa aspek |
| < 40 | Perlu Bimbingan (D) | Perlu pembinaan lebih lanjut |

> **Catatan**: Konversi ini bersifat sugestif. Guru dapat menyesuaikan berdasarkan konteks kelas, jumlah pemain, dan kurikulum yang berlaku.

---

## 8. Kesimpulan

Sistem skorisasi **Jejak Integritas** dirancang untuk:

- ✅ **Menghargai pengetahuan** — jawaban benar selalu diberi poin
- ✅ **Memberikan konsekuensi** — jawaban salah bisa berakibat turun dan skor berkurang
- ✅ **Memotivasi kemajuan** — semakin maju posisi, semakin besar poin kemajuan
- ✅ **Mendorong kompetisi sehat** — bonus finish memberi insentif untuk terus berusaha
- ✅ **Menjaga variasi** — soal acak membuat permainan tetap menarik

Sistem ini **adil secara keseluruhan** karena menggunakan formula yang konsisten untuk semua pemain, dengan penekanan utama pada **pengetahuan dan pemahaman materi** sebagai penentu skor tertinggi.

---

*Dokumen ini disusun sebagai panduan penilaian untuk media pembelajaran Jejak Integritas.*
