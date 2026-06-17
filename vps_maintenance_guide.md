# Panduan Monitoring & Maintenance VPS Jejak Integritas
Dokumen ini berisi panduan untuk monitoring, pemeliharaan (maintenance) aplikasi Docker dan non-Docker, serta langkah migrasi jika kamu sudah membeli domain baru untuk backend.

---

## 1. Panduan Monitoring VPS & Aplikasi

### A. Monitoring Sumber Daya VPS (Hardware)
Gunakan perintah ini secara berkala untuk memantau kesehatan server:
* **Cek Sisa RAM**:
  ```bash
  free -h
  ```
  *Perhatikan kolom `available` (sisa RAM yang siap digunakan).*
* **Cek Sisa Memori Penyimpanan (Piringan/Disk)**:
  ```bash
  df -h
  ```
  *Pastikan partisi utama `/` tidak mencapai 90%+. Jika penuh, Docker bisa berhenti mendadak.*
* **Cek Proses Terberat (CPU & RAM)**:
  ```bash
  htop
  ```
  *(Jika `htop` belum terinstall, gunakan perintah standar `top` atau install htop dengan `apt install htop` / `yum install htop`).*

### B. Monitoring Aplikasi Docker
* **Cek Container yang Berjalan**:
  ```bash
  docker ps
  ```
* **Cek Penggunaan RAM & CPU per Container**:
  ```bash
  docker stats
  ```
  *Tekan `Ctrl + C` untuk keluar.*
* **Melihat Log Kontainer Backend (Real-time)**:
  ```bash
  docker logs -f jejak-integritas-backend
  ```
  *Gunakan ini untuk melihat apakah ada error/crash pada aplikasi Socket.io backend.*

### C. Monitoring Nginx & Aplikasi Non-Docker
* **Cek Status Nginx**:
  ```bash
  systemctl status nginx
  ```
* **Melihat Log Error Nginx**:
  ```bash
  tail -n 50 /var/log/nginx/error.log
  ```
* **Melihat Log Akses Nginx**:
  ```bash
  tail -n 50 /var/log/nginx/access.log
  ```
* **Jika aplikasi non-Docker menggunakan PM2 (biasanya untuk Next.js/Node.js)**:
  ```bash
  pm2 list
  pm2 status
  pm2 logs --lines 50
  ```

---

## 2. Panduan Maintenance (Pemeliharaan)

### A. Membersihkan Sampah Docker (Sangat Penting jika Disk Penuh)
Docker sering meninggalkan cache build dan file container tidak terpakai yang memakan ruang harddisk.
* **Hapus Cache & Kontainer Mati**:
  ```bash
  docker system prune -a --volumes
  ```
  *Tekan `y` untuk mengonfirmasi. Ini akan membersihkan ruang disk tanpa menghapus kontainer yang sedang berjalan.*

### B. Restart Aplikasi saat Update Kode
* **Aplikasi Docker (Jejak Integritas Backend)**:
  Jika kamu melakukan `git pull` update kode terbaru di folder `/root/jejak-integritas/backend`:
  ```bash
  cd /root/jejak-integritas/backend
  docker compose down
  docker compose up -d --build
  ```
* **Aplikasi Non-Docker (Nginx / Web Node.js)**:
  ```bash
  systemctl restart nginx
  # Atau jika pakai PM2:
  pm2 restart nama_aplikasi
  ```

### C. Perpanjangan SSL Otomatis
Sertifikat SSL Let's Encrypt hanya berlaku selama 90 hari, tetapi Certbot secara otomatis menjadwalkan perpanjangan.
* **Cek apakah perpanjangan otomatis bekerja**:
  ```bash
  certbot renew --dry-run
  ```
  *Jika tidak ada error, SSL kamu aman dan akan diperpanjang otomatis selamanya.*

---

## 3. Langkah jika Sudah Membeli Domain Baru

Jika kamu nanti sudah membeli domain baru (misal: `jejakintegritas.com` atau subdomain `api.jejakintegritas.com`), lakukan langkah migrasi berikut:

### Langkah A: Arahkan DNS Domain Baru
1. Masuk ke DNS Manager tempat kamu membeli domain.
2. Tambahkan **A Record** baru:
   * **Host**: `@` (untuk domain utama) atau `api` (jika ingin pakai subdomain `api.namadomain.com`)
   * **Value/Points To**: `203.175.11.198`

### Langkah B: Ubah Konfigurasi Nginx di VPS
1. Edit file konfigurasi Nginx di VPS:
   ```bash
   nano /etc/nginx/conf.d/jejak-integritas.conf
   ```
2. Ubah bagian `server_name` dari `audira.space` ke domain baru kamu:
   ```nginx
   server {
       listen 80;
       server_name domainbaru.com; # Ganti ke domain baru Anda

       location / {
           proxy_pass http://127.0.0.1:5001;
           ...
       }
   }
   ```
3. Simpan (`Ctrl + O`, `Enter`, `Ctrl + X`).
4. Uji syntax Nginx lalu reload:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

### Langkah C: Daftarkan SSL Baru dengan Certbot
1. Jalankan perintah certbot untuk domain baru:
   ```bash
   certbot --nginx -d domainbaru.com
   ```
2. Ikuti instruksi sampai sukses.

### Langkah D: Update di Vercel
1. Buka Vercel -> **Settings** -> **Environment Variables**.
2. Ubah nilai `NEXT_PUBLIC_BACKEND_URL` menjadi:
   * **`https://domainbaru.com`**
3. Klik **Save** lalu lakukan **Redeploy** pada project frontend kamu di Vercel.
