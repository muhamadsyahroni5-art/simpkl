<?php
/**
 * SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang)
 * File: config/koneksi.php
 * Koneksi Database MySQL (Kompatibel XAMPP dan Laragon)
 */

$host = 'localhost';
$user = 'root';
$pass = ''; // Default XAMPP / Laragon kosong
$db   = 'sim_pkl_kemenag';

// Set Timezone Server Indonesia Barat (GMT+7)
date_default_timezone_set('Asia/Jakarta');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // Auto-create gps_config table if missing (prevents SQL Error 1146 & 1101)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `gps_config` (
      `id` INT PRIMARY KEY DEFAULT 1,
      `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
      `latitude` DECIMAL(10,6) NOT NULL DEFAULT -6.367910,
      `longitude` DECIMAL(10,6) NOT NULL DEFAULT 106.268530,
      `radius_meters` INT NOT NULL DEFAULT 100,
      `office_name` VARCHAR(255) NOT NULL DEFAULT 'Kantor Kementerian Agama Kabupaten Lebak',
      `office_address` VARCHAR(500) NOT NULL DEFAULT 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314',
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("INSERT INTO `gps_config` (`id`, `is_enabled`, `latitude`, `longitude`, `radius_meters`, `office_name`, `office_address`)
                VALUES (1, 1, -6.367910, 106.268530, 100, 'Kantor Kementerian Agama Kabupaten Lebak', 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314')
                ON DUPLICATE KEY UPDATE `id`=`id`");
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage() . "<br>Pastikan MySQL di Laragon / XAMPP sudah berjalan dan database 'sim_pkl_kemenag' sudah di-import.");
}

// 13 Pilihan Subbag / Seksi Kemenag Lebak
$SUBBAG_SEKSI_OPTIONS = [
    'Subbag TU - PTSP',
    'Subbag TU - Umum dan Kerumahtanggaan',
    'Subbag TU - Keuangan dan Perencanaan',
    'Subbag TU - Kepegawaian dan Hukum',
    'Subbag TU - Pusdatin',
    'Seksi Pendidikan Madrasah',
    'Seksi Pendidikan Agama Islam',
    'Seksi Pendidikan Diniyah dan Pondok Pesantren',
    'Seksi Penyelenggaraan Haji dan Umrah',
    'Seksi Bimbingan Masyarakat Islam',
    'Penyelenggara Zakat dan Wakaf',
    'Kelompok Jabatan Fungsional (KJF)',
    'Sekretariat PWI / Pokjaluh'
];
