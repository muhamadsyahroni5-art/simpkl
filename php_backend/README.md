# PANDUAN INSTALASI SIMAGANG KEMENAG LEBAK
## Sistem Informasi Anak Magang / PKL
**Kantor Kementerian Agama Kabupaten Lebak**

---

### CARA INSTALASI PADA XAMPP / LARAGON

1. **Persyaratan System:**
   - Web Server: Apache / Nginx
   - PHP Version: 7.4 / 8.0 / 8.1 / 8.2 / 8.3
   - Database: MySQL / MariaDB

2. **Langkah-langkah Instalasi:**
   - Download dan ekstrak file ZIP ini ke direktori web server Anda:
     * **Laragon:** `C:\laragon\www\simagang-kemenag-lebak`
     * **XAMPP:** `C:\xampp\htdocs\simagang-kemenag-lebak`
   
3. **Membuat & Import Database:**
   - Buka browser dan akses **phpMyAdmin** (`http://localhost/phpmyadmin`).
   - Buat database baru dengan nama `sim_pkl_kemenag`.
   - Pilih database `sim_pkl_kemenag`, lalu klik menu **Import**.
   - Pilih file `database.sql` yang ada dalam folder project ini, lalu klik **Go / Kirim**.

4. **Konfigurasi Database (Jika Diperlukan):**
   - File konfigurasi terdapat pada `config/koneksi.php`.
   - Secara default:
     * Host: `localhost`
     * Database: `sim_pkl_kemenag`
     * User: `root`
     * Password: `` (kosong)

5. **Akses Aplikasi:**
   - Buka browser dan ketik alamat:
     * Laragon: `http://localhost/simagang-kemenag-lebak` atau `http://simagang-kemenag-lebak.test`
     * XAMPP: `http://localhost/simagang-kemenag-lebak`

---

### AKUN LOGIN DEFAULT

1. **Admin / Pembimbing (Pegawai Kemenag):**
   - Username: `admin`
   - Password: `admin123`

2. **Super Admin:**
   - Username: `superadmin`
   - Password: `admin123`

3. **Siswa Magang (Login Menggunakan NISN):**
   - Username: `0067481920` (Muhammad Rizky Ramadhan)
   - Password: `siswa123`

---

### DOKUMEN & FORMAT RESMI
- **Jadwal Jam Masuk & Pulang:**
  * Senin - Kamis: **07:30 - 16:00 WIB**
  * Jumat: **07:30 - 16:30 WIB**
- **Format Jam Input Kegiatan:** 24 Jam (HH:mm)
- **Format Nomor Dokumen Penilaian:** `B-[NISN]/Kk.28.02.1/KS.00/[Bulan]/[Tahun]`
