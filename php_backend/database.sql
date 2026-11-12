-- ==============================================================
-- DATABASE: sim_pkl_kemenag
-- SISTEM INFORMASI MANAJEMEN DATA SISWA PKL / MAGANG
-- KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK (SIMAGANG LEBAK)
-- Cocok untuk dijalankan di phpMyAdmin / MySQL di XAMPP & Laragon
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `sim_pkl_kemenag` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sim_pkl_kemenag`;

-- --------------------------------------------------------
-- Table structure for `users` (Pegawai / Admin)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(150) NOT NULL,
  `nip` VARCHAR(30) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `jabatan` VARCHAR(100) NOT NULL,
  `seksi` VARCHAR(100) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'admin_seksi', 'opr_pembimbing') NOT NULL DEFAULT 'opr_pembimbing',
  `no_hp` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `students` (Siswa / Mahasiswa PKL)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `photo` VARCHAR(255) DEFAULT 'assets/img/default-avatar.png',
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `nisn` VARCHAR(20) NOT NULL UNIQUE,
  `tempat_lahir` VARCHAR(100) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `kelas` VARCHAR(50) NOT NULL,
  `program_keahlian` VARCHAR(100) NOT NULL,
  `no_hp` VARCHAR(20) NOT NULL,
  `asal_sekolah` VARCHAR(150) NOT NULL,
  `pembimbing_sekolah` VARCHAR(150) NOT NULL,
  `no_hp_pembimbing` VARCHAR(20) NOT NULL,
  `alamat` TEXT NOT NULL,
  `tempat_penugasan` VARCHAR(100) NOT NULL,
  `pembimbing_kantor` VARCHAR(150) NOT NULL,
  `nip_pembimbing` VARCHAR(30) NOT NULL,
  `status` ENUM('Aktif', 'Selesai', 'Berhenti/Pindah') NOT NULL DEFAULT 'Aktif',
  `tahun` VARCHAR(4) NOT NULL DEFAULT '2026',
  `tanggal_mulai` DATE DEFAULT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `attendance` (Absensi Masuk & Pulang)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `jam_masuk` VARCHAR(10) DEFAULT '-',
  `jam_pulang` VARCHAR(10) DEFAULT '-',
  `status` ENUM('Hadir', 'Sakit', 'Alfa', 'Izin') NOT NULL DEFAULT 'Hadir',
  `keterangan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `activities` (Jurnal Kegiatan Harian)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `uraian_kegiatan` TEXT NOT NULL,
  `jam_mulai` VARCHAR(10) NOT NULL,
  `jam_selesai` VARCHAR(10) NOT NULL,
  `output_kegiatan` TEXT NOT NULL,
  `kendala` TEXT DEFAULT NULL,
  `status_verifikasi` ENUM('Disetujui', 'Menunggu', 'Perlu Revisi') NOT NULL DEFAULT 'Menunggu',
  `catatan_pembimbing` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `assessments` (Penilaian Prestasi)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `disiplin_waktu` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `tanggung_jawab` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `kebersihan_kerapihan` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `kemampuan_kerja` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `kerjasama_tim` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `etika_kesopanan` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `nilai_rata_rata` DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  `grade` VARCHAR(5) NOT NULL DEFAULT 'B',
  `predikat` VARCHAR(50) NOT NULL DEFAULT 'Baik',
  `catatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `running_text` TEXT NOT NULL,
  `auto_logout_minutes` INT NOT NULL DEFAULT 15,
  `gps_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `gps_lat` DECIMAL(10,8) NOT NULL DEFAULT -6.36791,
  `gps_lng` DECIMAL(11,8) NOT NULL DEFAULT 106.26853,
  `gps_radius` INT NOT NULL DEFAULT 100,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `settings_gps_location`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings_gps_location` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `latitude` DECIMAL(10,8) NOT NULL DEFAULT -6.36791,
  `longitude` DECIMAL(11,8) NOT NULL DEFAULT 106.26853,
  `radius_meters` INT NOT NULL DEFAULT 100,
  `office_name` VARCHAR(150) NOT NULL DEFAULT 'Kantor Kementerian Agama Kabupaten Lebak',
  `office_address` TEXT DEFAULT NULL,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- SEED DATA
-- --------------------------------------------------------
INSERT INTO `settings` (`id`, `running_text`, `auto_logout_minutes`, `gps_enabled`, `gps_lat`, `gps_lng`, `gps_radius`)
VALUES (1, 'Selamat Datang di SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang) Kantor Kementerian Agama Kabupaten Lebak • Ikhlas Beramal • Melayani dengan Sepenuh Hati • Jl. Siliwangi No. 2 Rangkasbitung', 15, 1, -6.36791, 106.26853, 100)
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `settings_gps_location` (`id`, `latitude`, `longitude`, `radius_meters`, `office_name`, `office_address`, `is_enabled`)
VALUES (1, -6.36791, 106.26853, 100, 'Kantor Kementerian Agama Kabupaten Lebak', 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314', 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Default Users (Password default: 'admin123' di-hash MD5)
INSERT INTO `users` (`nama`, `nip`, `username`, `password`, `jabatan`, `seksi`, `role`, `no_hp`, `email`) VALUES
('H. Sudirman, S.Ag., M.Si.', '197405122003121002', 'superadmin', MD5('admin123'), 'Kepala Subbag Tata Usaha', 'Semua Subbag / Seksi', 'super_admin', '081288991200', 'kemenag2802@gmail.com'),
('Dian Permana, S.Kom.', '199104192019031006', 'admin', MD5('admin123'), 'Pranata Komputer Ahli Muda', 'Subbag TU - Pusdatin', 'admin', '085712345678', 'pusdatin_lebak@kemenag.go.id')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Default Students
INSERT INTO `students` (`nama`, `nisn`, `username`, `password`, `tempat_lahir`, `tanggal_lahir`, `kelas`, `program_keahlian`, `no_hp`, `asal_sekolah`, `pembimbing_sekolah`, `no_hp_pembimbing`, `alamat`, `tempat_penugasan`, `pembimbing_kantor`, `nip_pembimbing`, `status`, `tahun`, `tanggal_mulai`, `tanggal_selesai`) VALUES
('Muhammad Rizky Ramadhan', '0067481920', '0067481920', MD5('siswa123'), 'Lebak', '2006-09-14', 'XII TKJ 2', 'Teknik Komputer dan Jaringan', '089678123456', 'SMK Negeri 1 Rangkasbitung', 'Dedi Kurniawan, S.Pd.T.', '081298765432', 'Jl. Jenderal Sudirman No. 45, Rangkasbitung', 'Subbag TU - Pusdatin', 'Dian Permana, S.Kom.', '199104192019031006', 'Aktif', '2026', '2026-01-05', '2026-04-30'),
('Nur Aini Maulida', '0068912340', '0068912340', MD5('siswa123'), 'Rangkasbitung', '2006-03-22', 'XII OTKP 1', 'Otomatisasi & Tata Kelola Perkantoran', '085811223344', 'SMK Negeri 2 Rangkasbitung', 'Rina Marlina, M.Pd.', '087788990011', 'Kp. Narimbang Mulia RT 02/04, Kec. Rangkasbitung', 'Subbag TU - PTSP', 'Hj. Sudirah, S.Sos., M.M.', '197902182006042005', 'Aktif', '2026', '2026-01-05', '2026-04-30')
ON DUPLICATE KEY UPDATE `id`=`id`;
