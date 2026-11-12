// Bundle of PHP and MySQL code ready for XAMPP / Laragon

export const DATABASE_SQL = `-- ==============================================================
-- DATABASE: sim_pkl_kemenag
-- SISTEM INFORMASI MANAJEMEN DATA SISWA PKL / MAGANG
-- KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK (SIMAGANG LEBAK)
-- Cocok untuk dijalankan di phpMyAdmin / MySQL di XAMPP & Laragon
-- ==============================================================

CREATE DATABASE IF NOT EXISTS \`sim_pkl_kemenag\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`sim_pkl_kemenag\`;

-- --------------------------------------------------------
-- Table structure for \`users\` (Pegawai / Admin)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama\` VARCHAR(150) NOT NULL,
  \`nip\` VARCHAR(30) NOT NULL UNIQUE,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`jabatan\` VARCHAR(100) NOT NULL,
  \`seksi\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('super_admin', 'admin', 'admin_seksi', 'opr_pembimbing') NOT NULL DEFAULT 'opr_pembimbing',
  \`no_hp\` VARCHAR(20) NOT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`students\` (Siswa / Mahasiswa PKL)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`photo\` VARCHAR(255) DEFAULT 'assets/img/default-avatar.png',
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama\` VARCHAR(150) NOT NULL,
  \`nisn\` VARCHAR(20) NOT NULL UNIQUE,
  \`tempat_lahir\` VARCHAR(100) NOT NULL,
  \`tanggal_lahir\` DATE NOT NULL,
  \`kelas\` VARCHAR(50) NOT NULL,
  \`program_keahlian\` VARCHAR(100) NOT NULL,
  \`no_hp\` VARCHAR(20) NOT NULL,
  \`asal_sekolah\` VARCHAR(150) NOT NULL,
  \`pembimbing_sekolah\` VARCHAR(150) NOT NULL,
  \`no_hp_pembimbing\` VARCHAR(20) NOT NULL,
  \`alamat\` TEXT NOT NULL,
  \`tempat_penugasan\` VARCHAR(100) NOT NULL,
  \`pembimbing_kantor\` VARCHAR(150) NOT NULL,
  \`nip_pembimbing\` VARCHAR(30) NOT NULL,
  \`status\` ENUM('Aktif', 'Selesai', 'Berhenti/Pindah') NOT NULL DEFAULT 'Aktif',
  \`tahun\` VARCHAR(4) NOT NULL DEFAULT '2026',
  \`tanggal_mulai\` DATE DEFAULT NULL,
  \`tanggal_selesai\` DATE DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`attendance\` (Absensi Masuk & Pulang)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`attendance\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_id\` INT NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`jam_masuk\` VARCHAR(10) DEFAULT '-',
  \`jam_pulang\` VARCHAR(10) DEFAULT '-',
  \`status\` ENUM('Hadir', 'Sakit', 'Alfa', 'Izin') NOT NULL DEFAULT 'Hadir',
  \`keterangan\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`activities\` (Jurnal Kegiatan Harian)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`activities\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_id\` INT NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`uraian_kegiatan\` TEXT NOT NULL,
  \`jam_mulai\` VARCHAR(10) NOT NULL,
  \`jam_selesai\` VARCHAR(10) NOT NULL,
  \`output_kegiatan\` TEXT NOT NULL,
  \`kendala\` TEXT DEFAULT NULL,
  \`status_verifikasi\` ENUM('Disetujui', 'Menunggu', 'Perlu Revisi') NOT NULL DEFAULT 'Menunggu',
  \`catatan_pembimbing\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`assessments\` (Penilaian Prestasi)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`assessments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_id\` INT NOT NULL UNIQUE,
  \`kedisiplinan\` INT NOT NULL DEFAULT 0,
  \`inisiatif\` INT NOT NULL DEFAULT 0,
  \`kerjasama\` INT NOT NULL DEFAULT 0,
  \`tanggung_jawab\` INT NOT NULL DEFAULT 0,
  \`kebersihan\` INT NOT NULL DEFAULT 0,
  \`nama_bidang_keahlian\` VARCHAR(150) NOT NULL,
  \`nilai_bidang_keahlian\` INT NOT NULL DEFAULT 0,
  \`nilai_rata_rata\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  \`grade\` CHAR(1) NOT NULL DEFAULT 'D',
  \`predikat\` VARCHAR(20) NOT NULL DEFAULT 'Kurang',
  \`catatan\` TEXT DEFAULT NULL,
  \`tanggal_penilaian\` DATE NOT NULL,
  \`penilai_nama\` VARCHAR(150) NOT NULL,
  \`penilai_nip\` VARCHAR(30) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`settings_running_text\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`settings_running_text\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`text\` TEXT NOT NULL,
  \`speed_seconds\` INT NOT NULL DEFAULT 20,
  \`theme\` ENUM('emerald', 'dark', 'gold') NOT NULL DEFAULT 'emerald',
  \`is_enabled\` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`settings_auto_logout\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`settings_auto_logout\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`timeout_minutes\` INT NOT NULL DEFAULT 15,
  \`is_enabled\` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for \`settings_gps_location\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`settings_gps_location\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`latitude\` DECIMAL(10,8) NOT NULL DEFAULT -6.36791,
  \`longitude\` DECIMAL(11,8) NOT NULL DEFAULT 106.26853,
  \`radius_meters\` INT NOT NULL DEFAULT 100,
  \`office_name\` VARCHAR(150) NOT NULL DEFAULT 'Kantor Kementerian Agama Kabupaten Lebak',
  \`office_address\` TEXT DEFAULT NULL,
  \`is_enabled\` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- SEED DATA
-- --------------------------------------------------------
INSERT INTO \`settings_running_text\` (\`id\`, \`text\`, \`speed_seconds\`, \`theme\`, \`is_enabled\`)
VALUES (1, 'Selamat Datang di SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang) Kantor Kementerian Agama Kabupaten Lebak • Ikhlas Beramal • Melayani dengan Sepenuh Hati • Jl. Siliwangi No. 2 Rangkasbitung', 20, 'emerald', 1)
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

INSERT INTO \`settings_auto_logout\` (\`id\`, \`timeout_minutes\`, \`is_enabled\`)
VALUES (1, 15, 1)
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

INSERT INTO \`settings_gps_location\` (\`id\`, \`latitude\`, \`longitude\`, \`radius_meters\`, \`office_name\`, \`office_address\`, \`is_enabled\`)
VALUES (1, -6.36791, 106.26853, 100, 'Kantor Kementerian Agama Kabupaten Lebak', 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314', 1)
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

-- Default Users (Password default: 'password123' di-hash MD5)
INSERT INTO \`users\` (\`nama\`, \`nip\`, \`username\`, \`password\`, \`jabatan\`, \`seksi\`, \`role\`, \`no_hp\`, \`email\`) VALUES
('H. Badrussalam, S.Ag., M.Si.', '197508142000031002', 'superadmin', MD5('password123'), 'Kepala Kantor Kemenag Kab. Lebak', 'Semua Subbag / Seksi', 'super_admin', '081288991200', 'kemenag2802@gmail.com'),
('Hj. Sudirah, S.Sos., M.M.', '197902182006042005', 'admin', MD5('password123'), 'Kepala Subbag Tata Usaha', 'Semua Subbag / Seksi', 'admin', '081399881122', 'tu_lebak@kemenag.go.id'),
('Dian Permana, S.Kom.', '199104192019031006', 'admin_pusdatin', MD5('password123'), 'Pranata Komputer Ahli Muda', 'Subbag TU - Pusdatin', 'admin_seksi', '085712345678', 'pusdatin_lebak@kemenag.go.id'),
('Asep Saepullah, S.Pd.I.', '198406202009121004', 'opr_penma', MD5('password123'), 'Pengelola Program Pembinaan Madrasah', 'Seksi Pendidikan Madrasah', 'opr_pembimbing', '081987654321', 'penma_lebak@kemenag.go.id')
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

-- Default Students
INSERT INTO \`students\` (\`nama\`, \`nisn\`, \`username\`, \`password\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`kelas\`, \`program_keahlian\`, \`no_hp\`, \`asal_sekolah\`, \`pembimbing_sekolah\`, \`no_hp_pembimbing\`, \`alamat\`, \`tempat_penugasan\`, \`pembimbing_kantor\`, \`nip_pembimbing\`, \`status\`, \`tahun\`, \`tanggal_mulai\`, \`tanggal_selesai\`) VALUES
('Muhammad Rizky Ramadhan', '0067481920', 'rizky', MD5('password123'), 'Lebak', '2006-09-14', 'XII TKJ 2', 'Teknik Komputer dan Jaringan', '089678123456', 'SMK Negeri 1 Rangkasbitung', 'Dedi Kurniawan, S.Pd.T.', '081298765432', 'Jl. Jenderal Sudirman No. 45, Rangkasbitung', 'Subbag TU - Pusdatin', 'Dian Permana, S.Kom.', '199104192019031006', 'Aktif', '2026', '2026-01-05', '2026-04-30'),
('Nur Aini Maulida', '0068912340', 'nuraini', MD5('password123'), 'Rangkasbitung', '2006-03-22', 'XII OTKP 1', 'Otomatisasi & Tata Kelola Perkantoran', '085811223344', 'SMK Negeri 2 Rangkasbitung', 'Rina Marlina, M.Pd.', '087788990011', 'Kp. Narimbang Mulia RT 02/04, Kec. Rangkasbitung', 'Subbag TU - PTSP', 'Hj. Sudirah, S.Sos., M.M.', '197902182006042005', 'Aktif', '2026', '2026-01-05', '2026-04-30')
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;
`;

export const PHP_KONEKSI = `<?php
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
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage() . "<br>Pastikan MySQL di Laragon / XAMPP sudah berjalan dan database 'sim_pkl_kemenag' sudah di-import.");
}

// 13 Pilihan Subbag / Seksi Kemenag Lebak
$SUBBAG_SEKSI_OPTIONS = [
    'Subbag TU - PTSP',
    'Subbag TU - Umum dan Kerumahtanggaan',
    'Subbag TU - Keuangan dan BMN',
    'Subbag TU - SDM/Kepegawaian',
    'Subbag TU - Pusdatin',
    'Subbag TU - Perencanaan',
    'Subbag TU - Kehumasan',
    'Subbag TU - Arsiparis',
    'Seksi Bimas Islam',
    'Penyelenggaraan Zakat dan Wakaf',
    'Seksi Pendidikan Madrasah',
    'Seksi Pendidikan Agama Islam',
    'Seksi Pendidikan Diniyah dan Pondok Pesantren'
];
`;

export const PHP_INDEX = `<?php
session_start();
require_once 'config/koneksi.php';

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'siswa') {
        header('Location: dashboard_siswa.php');
    } else {
        header('Location: dashboard_admin.php');
    }
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_type = $_POST['login_type'] ?? 'admin';
    $username   = trim($_POST['username'] ?? '');
    $password   = trim($_POST['password'] ?? '');
    $pass_hash  = md5($password);

    if ($login_type === 'siswa') {
        $stmt = $pdo->prepare("SELECT * FROM students WHERE username = ? AND password = ?");
        $stmt->execute([$username, $pass_hash]);
        $student = $stmt->fetch();

        if ($student) {
            $_SESSION['user_id'] = $student['id'];
            $_SESSION['nama']    = $student['nama'];
            $_SESSION['nisn']    = $student['nisn'];
            $_SESSION['role']    = 'siswa';
            $_SESSION['seksi']   = $student['tempat_penugasan'];
            header('Location: dashboard_siswa.php');
            exit;
        } else {
            $error = 'Username atau Password Siswa tidak ditemukan!';
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$username, $pass_hash]);
        $user = $stmt->fetch();

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['nama']    = $user['nama'];
            $_SESSION['nip']     = $user['nip'];
            $_SESSION['role']    = $user['role'];
            $_SESSION['seksi']   = $user['seksi'];
            header('Location: dashboard_admin.php');
            exit;
        } else {
            $error = 'Username atau Password Pegawai / Admin tidak ditemukan!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 min-h-screen flex flex-col justify-between p-4 text-slate-100">
    <div class="max-w-md w-full mx-auto my-auto py-6">
        <div class="bg-white text-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white text-center">
                <img src="assets/img/kemenag-logo.png" alt="Logo Kemenag" class="w-16 h-16 mx-auto mb-2 object-contain">
                <h1 class="text-xl font-black tracking-tight text-white uppercase">SIMAGANG KEMENAG LEBAK</h1>
                <p class="text-xs text-emerald-200 font-semibold mt-0.5">(Sistem Informasi Anak Magang)</p>
                <p class="text-[10px] text-emerald-300/80 mt-1">Ikhlas Beramal • Jl. Siliwangi No. 2 Rangkasbitung</p>
            </div>

            <div class="p-6 sm:p-7 space-y-4">
                <?php if ($error): ?>
                    <div class="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Tipe Pengguna:</label>
                        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                            <label class="py-2 text-center rounded-lg font-bold text-xs cursor-pointer text-slate-700 has-[:checked]:bg-white has-[:checked]:text-emerald-900 has-[:checked]:shadow-sm">
                                <input type="radio" name="login_type" value="admin" checked class="hidden">
                                <span>Pegawai / Admin</span>
                            </label>
                            <label class="py-2 text-center rounded-lg font-bold text-xs cursor-pointer text-slate-700 has-[:checked]:bg-white has-[:checked]:text-emerald-900 has-[:checked]:shadow-sm">
                                <input type="radio" name="login_type" value="siswa" class="hidden">
                                <span>Siswa Magang</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Username Akun</label>
                        <input type="text" name="username" required placeholder="Contoh: superadmin / rizky" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                        <input type="password" name="password" required placeholder="Masukkan password" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600">
                    </div>

                    <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md">
                        Masuk ke SIMAGANG
                    </button>
                </form>

                <div class="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
                    Akun Demo Default:<br>
                    Admin: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">superadmin / password123</code><br>
                    Siswa: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">rizky / password123</code>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const PHP_LOGOUT = `<?php
/**
 * SIMAGANG KEMENAG LEBAK
 * File: logout.php
 * Logout Handler Session Destroyer
 */
session_start();
$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();
header('Location: index.php');
exit;
`;

export const PHP_DASHBOARD_ADMIN = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$user_role = $_SESSION['role'];
$user_seksi = $_SESSION['seksi'];
$is_restricted = in_array($user_role, ['admin_seksi', 'opr_pembimbing']);

if ($is_restricted) {
    $stmtSiswa = $pdo->prepare("SELECT COUNT(*) FROM students WHERE tempat_penugasan = ?");
    $stmtSiswa->execute([$user_seksi]);
    $total_siswa = $stmtSiswa->fetchColumn();

    $stmtHadir = $pdo->prepare("SELECT COUNT(*) FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.tempat_penugasan = ? AND a.tanggal = CURDATE() AND a.status = 'Hadir'");
    $stmtHadir->execute([$user_seksi]);
    $total_hadir_hari_ini = $stmtHadir->fetchColumn();
} else {
    $total_siswa = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
    $total_hadir_hari_ini = $pdo->query("SELECT COUNT(*) FROM attendance WHERE tanggal = CURDATE() AND status = 'Hadir'")->fetchColumn();
}

$total_kegiatan = $pdo->query("SELECT COUNT(*) FROM activities")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Admin - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Sistem Informasi Anak Magang</p>
                </div>
            </div>

            <nav class="space-y-1 text-xs">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 bg-emerald-800 rounded-xl font-bold text-white">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300 font-semibold">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 font-semibold mt-4">Keluar / Logout</a>
            </nav>
        </div>

        <div class="pt-4 border-t border-emerald-900 text-xs">
            <p class="font-bold"><?= htmlspecialchars($_SESSION['nama']) ?></p>
            <p class="text-[10px] text-emerald-400 capitalize"><?= htmlspecialchars($_SESSION['role']) ?> &bull; <?= htmlspecialchars($_SESSION['seksi']) ?></p>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl">
        <header class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-xl font-bold text-slate-900">Dashboard Analisis Performa Magang</h1>
                <p class="text-xs text-slate-500">Kantor Kementerian Agama Kabupaten Lebak</p>
            </div>
            <div class="text-xs bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl font-bold text-slate-700">
                <?= date('d F Y') ?>
            </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p class="text-xs font-semibold text-slate-500">Total Siswa Magang</p>
                <h3 class="text-3xl font-extrabold text-emerald-800 mt-1"><?= $total_siswa ?> Siswa</h3>
                <p class="text-[11px] text-slate-400 mt-1"><?= $is_restricted ? "Unit: $user_seksi" : "Seluruh Subbag & Seksi" ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p class="text-xs font-semibold text-slate-500">Hadir Hari Ini</p>
                <h3 class="text-3xl font-extrabold text-blue-700 mt-1"><?= $total_hadir_hari_ini ?> Siswa</h3>
                <p class="text-[11px] text-slate-400 mt-1">Presensi Masuk Terverifikasi</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p class="text-xs font-semibold text-slate-500">Total Log Kegiatan</p>
                <h3 class="text-3xl font-extrabold text-amber-700 mt-1"><?= $total_kegiatan ?> Entri</h3>
                <p class="text-[11px] text-slate-400 mt-1">Format 24 Jam Teratat</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 class="font-bold text-sm text-slate-800">Daftar Siswa Magang Terbaru</h2>
                <a href="siswa.php" class="text-xs text-emerald-700 font-bold hover:underline">Lihat Semua Data Siswa &rarr;</a>
            </div>
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa</th>
                        <th class="p-3">NISN</th>
                        <th class="p-3">Asal Sekolah / Kampus</th>
                        <th class="p-3">Unit Penugasan</th>
                        <th class="p-3">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php
                    $query = $is_restricted 
                        ? "SELECT * FROM students WHERE tempat_penugasan = ? ORDER BY id DESC LIMIT 5"
                        : "SELECT * FROM students ORDER BY id DESC LIMIT 5";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute($is_restricted ? [$user_seksi] : []);
                    while ($s = $stmt->fetch()):
                    ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($s['nama']) ?></td>
                        <td class="p-3 font-mono text-slate-700"><?= htmlspecialchars($s['nisn']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                        <td class="p-3 font-semibold text-emerald-800"><?= htmlspecialchars($s['tempat_penugasan']) ?></td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold"><?= $s['status'] ?></span></td>
                    </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_DASHBOARD_SISWA = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'siswa') {
    header('Location: index.php');
    exit;
}

$student_id = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
$stmt->execute([$student_id]);
$student = $stmt->fetch();

$today = date('Y-m-d');
$stmtAtt = $pdo->prepare("SELECT * FROM attendance WHERE student_id = ? AND tanggal = ?");
$stmtAtt->execute([$student_id, $today]);
$today_att = $stmtAtt->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Siswa - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Portal Siswa Magang</p>
                </div>
            </div>

            <nav class="space-y-1 text-xs font-bold">
                <a href="dashboard_siswa.php" class="block py-2.5 px-3 bg-emerald-800 rounded-xl text-white">Dashboard Siswa</a>
                <a href="absensi_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Presensi Kehadiran</a>
                <a href="kegiatan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Jurnal Kegiatan Harian</a>
                <a href="laporan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Laporan &amp; Nilai Saya</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>

        <div class="pt-4 border-t border-emerald-900 text-xs">
            <p class="font-bold"><?= htmlspecialchars($student['nama']) ?></p>
            <p class="text-[10px] text-emerald-300">NISN: <?= htmlspecialchars($student['nisn']) ?></p>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-5xl space-y-6">
        <div class="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <img src="assets/img/kemenag-logo.png" class="w-14 h-14 object-contain">
                <div>
                    <div class="text-[11px] font-bold text-emerald-800 uppercase">Kemenag Kab. Lebak</div>
                    <h1 class="text-xl font-black text-slate-900">SIMAGANG KEMENAG LEBAK</h1>
                    <p class="text-xs text-slate-600 font-medium">Penugasan: <?= htmlspecialchars($student['tempat_penugasan']) ?></p>
                </div>
            </div>
            <div class="text-right text-xs">
                <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">Status: <?= htmlspecialchars($student['status']) ?></span>
            </div>
        </div>

        <div class="bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 rounded-2xl text-white">
            <h2 class="text-lg font-bold">Selamat Datang, <?= htmlspecialchars($student['nama']) ?></h2>
            <p class="text-xs text-emerald-200 mt-1"><?= htmlspecialchars($student['program_keahlian']) ?> &bull; <?= htmlspecialchars($student['asal_sekolah']) ?></p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 class="font-bold text-sm text-slate-800 mb-2">Status Presensi Hari Ini (<?= date('d-m-Y') ?>)</h3>
            <?php if ($today_att): ?>
                <div class="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold">
                    Tercatat <strong><?= htmlspecialchars($today_att['status']) ?></strong> (Masuk: <?= htmlspecialchars($today_att['jam_masuk']) ?> &bull; Pulang: <?= htmlspecialchars($today_att['jam_pulang']) ?>)
                </div>
            <?php else: ?>
                <div class="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold">
                    Anda belum mengisi presensi kehadiran hari ini.
                </div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
`;

export const PHP_ABSENSI_SISWA = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'siswa') {
    header('Location: index.php');
    exit;
}

$student_id = $_SESSION['user_id'];
$today = date('Y-m-d');
$now_time = date('H:i');

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_attend'])) {
    $status = $_POST['status'] ?? 'Hadir';
    $keterangan = trim($_POST['keterangan'] ?? 'Hadir tepat waktu');

    // Cek apakah sudah absen hari ini
    $check = $pdo->prepare("SELECT * FROM attendance WHERE student_id = ? AND tanggal = ?");
    $check->execute([$student_id, $today]);
    $existing = $check->fetch();

    if ($existing) {
        // Update jam pulang
        $stmt = $pdo->prepare("UPDATE attendance SET jam_pulang = ? WHERE id = ?");
        $stmt->execute([$now_time, $existing['id']]);
        $msg = "Presensi pulang berhasil dicatat jam $now_time WIB!";
    } else {
        // Insert presensi masuk
        $stmt = $pdo->prepare("INSERT INTO attendance (student_id, tanggal, jam_masuk, jam_pulang, status, keterangan) VALUES (?, ?, ?, '-', ?, ?)");
        $stmt->execute([$student_id, $today, $now_time, $status, $keterangan]);
        $msg = "Presensi masuk berhasil dicatat jam $now_time WIB!";
    }
}

// Fetch Riwayat Absensi
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE student_id = ? ORDER BY tanggal DESC");
$stmt->execute([$student_id]);
$records = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Presensi Kehadiran - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Presensi Kehadiran</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-bold">
                <a href="dashboard_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard Siswa</a>
                <a href="absensi_siswa.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl">Presensi Kehadiran</a>
                <a href="kegiatan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Jurnal Kegiatan Harian</a>
                <a href="laporan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Laporan &amp; Nilai Saya</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-5xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Presensi Kehadiran Siswa (Server Time GMT+7)</h1>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 class="font-bold text-sm text-slate-800">Form Presensi Kehadiran (Hari Ini: <?= date('d F Y') ?>)</h2>
            <form method="POST" action="" class="space-y-3 text-xs">
                <input type="hidden" name="action_attend" value="1">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Status Kehadiran *</label>
                    <select name="status" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white">
                        <option value="Hadir">Hadir</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alfa">Alfa / Tanpa Keterangan</option>
                        <option value="Izin">Izin</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Keterangan *</label>
                    <input type="text" name="keterangan" value="Hadir tepat waktu di kantor" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium">
                </div>
                <button type="submit" class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md">
                    Absen Sekarang (Jam: <?= date('H:i') ?> WIB)
                </button>
            </form>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">Riwayat Presensi Saya</div>
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Tanggal</th>
                        <th class="p-3">Jam Masuk</th>
                        <th class="p-3">Jam Pulang</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Keterangan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($records as $r): ?>
                    <tr>
                        <td class="p-3 font-bold font-mono text-slate-800"><?= $r['tanggal'] ?></td>
                        <td class="p-3 font-mono text-emerald-800 font-bold"><?= $r['jam_masuk'] ?></td>
                        <td class="p-3 font-mono text-blue-800 font-bold"><?= $r['jam_pulang'] ?></td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold"><?= $r['status'] ?></span></td>
                        <td class="p-3 text-slate-600"><?= htmlspecialchars($r['keterangan']) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_KEGIATAN_SISWA = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'siswa') {
    header('Location: index.php');
    exit;
}

$student_id = $_SESSION['user_id'];
$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_save'])) {
    $tanggal = $_POST['tanggal'];
    $jam_mulai = trim($_POST['jam_mulai']);
    $jam_selesai = trim($_POST['jam_selesai']);
    $uraian_kegiatan = trim($_POST['uraian_kegiatan']);
    $output_kegiatan = trim($_POST['output_kegiatan']);
    $kendala = trim($_POST['kendala']);

    // Cek bentrok jam
    $stmtC = $pdo->prepare("SELECT * FROM activities WHERE student_id = ? AND tanggal = ?");
    $stmtC->execute([$student_id, $tanggal]);
    $existing = $stmtC->fetchAll();

    $startMinutes = (int)substr($jam_mulai,0,2)*60 + (int)substr($jam_mulai,3,2);
    $endMinutes = (int)substr($jam_selesai,0,2)*60 + (int)substr($jam_selesai,3,2);

    $is_overlap = false;
    foreach ($existing as $ex) {
        $exStart = (int)substr($ex['jam_mulai'],0,2)*60 + (int)substr($ex['jam_mulai'],3,2);
        $exEnd = (int)substr($ex['jam_selesai'],0,2)*60 + (int)substr($ex['jam_selesai'],3,2);
        if (max($startMinutes, $exStart) < min($endMinutes, $exEnd)) {
            $is_overlap = true;
            break;
        }
    }

    if ($is_overlap) {
        $err = "pada tanggal dan jam tersebut telah dilakukan entry data, periksa kembali laporan kegiatan nya!";
    } else {
        $stmtIns = $pdo->prepare("INSERT INTO activities (student_id, tanggal, jam_mulai, jam_selesai, uraian_kegiatan, output_kegiatan, kendala, status_verifikasi) VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')");
        $stmtIns->execute([$student_id, $tanggal, $jam_mulai, $jam_selesai, $uraian_kegiatan, $output_kegiatan, $kendala]);
        $msg = "Jurnal kegiatan harian berhasil ditambahkan!";
    }
}

$stmtAct = $pdo->prepare("SELECT * FROM activities WHERE student_id = ? ORDER BY tanggal DESC, jam_mulai DESC");
$stmtAct->execute([$student_id]);
$my_activities = $stmtAct->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Jurnal Kegiatan Siswa - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Jurnal Kegiatan Harian</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-bold">
                <a href="dashboard_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard Siswa</a>
                <a href="absensi_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Presensi Kehadiran</a>
                <a href="kegiatan_siswa.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl">Jurnal Kegiatan Harian</a>
                <a href="laporan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Laporan &amp; Nilai Saya</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-5xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Input Jurnal Kegiatan Harian (Format 24 Jam)</h1>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <?php if ($err): ?>
            <div class="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-4 rounded-2xl font-bold">
                “<?= htmlspecialchars($err) ?>”
            </div>
        <?php endif; ?>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <form method="POST" action="" class="space-y-4 text-xs">
                <input type="hidden" name="action_save" value="1">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Tanggal *</label>
                        <input type="date" name="tanggal" value="<?= date('Y-m-d') ?>" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Jam Mulai (24 Jam) *</label>
                        <input type="time" name="jam_mulai" value="08:00" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Jam Selesai (24 Jam) *</label>
                        <input type="time" name="jam_selesai" value="12:00" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Uraian Kegiatan *</label>
                    <textarea name="uraian_kegiatan" rows="2" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"></textarea>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Output / Hasil Kegiatan *</label>
                    <input type="text" name="output_kegiatan" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Kendala / Masalah (Opsional)</label>
                    <input type="text" name="kendala" placeholder="Tuliskan kendala jika ada" class="w-full px-3 py-2 border border-slate-300 rounded-xl">
                </div>

                <button type="submit" class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md">
                    Tambahkan Jurnal Kegiatan
                </button>
            </form>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">Daftar Kegiatan Harian Saya</div>
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Tanggal & Waktu</th>
                        <th class="p-3">Uraian Kegiatan</th>
                        <th class="p-3">Output</th>
                        <th class="p-3">Status Verifikasi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($my_activities as $act): ?>
                    <tr>
                        <td class="p-3 font-mono">
                            <div class="font-bold text-slate-900"><?= $act['tanggal'] ?></div>
                            <div class="text-[10px] text-slate-500"><?= $act['jam_mulai'] ?> - <?= $act['jam_selesai'] ?> WIB</div>
                        </td>
                        <td class="p-3 font-medium text-slate-800"><?= htmlspecialchars($act['uraian_kegiatan']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($act['output_kegiatan']) ?></td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold"><?= $act['status_verifikasi'] ?></span></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_LAPORAN_SISWA = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'siswa') {
    header('Location: index.php');
    exit;
}

$student_id = $_SESSION['user_id'];
$stmtS = $pdo->prepare("SELECT * FROM students WHERE id = ?");
$stmtS->execute([$student_id]);
$student = $stmtS->fetch();

$stmtAss = $pdo->prepare("SELECT * FROM assessments WHERE student_id = ?");
$stmtAss->execute([$student_id]);
$assessment = $stmtAss->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan & Nilai Saya - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Laporan &amp; Nilai Saya</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-bold">
                <a href="dashboard_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard Siswa</a>
                <a href="absensi_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Presensi Kehadiran</a>
                <a href="kegiatan_siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Jurnal Kegiatan Harian</a>
                <a href="laporan_siswa.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl">Laporan &amp; Nilai Saya</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-5xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Laporan &amp; Lembar Penilaian Saya</h1>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 class="font-bold text-sm text-slate-800 border-b pb-2">Cetak Dokumen Laporan Saya</h2>
            <div class="flex flex-wrap gap-3">
                <a href="cetak_dokumen.php?id=<?= $student_id ?>&tipe=sertifikat" target="_blank" class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md">
                    Cetak Sertifikat Magang (Bolak-Balik 2 Lembar)
                </a>
                <button disabled title="User siswa hanya bisa melihat nilai (tidak bisa cetak nilai)" class="px-4 py-2.5 bg-slate-200 text-slate-500 border border-slate-300 rounded-xl text-xs font-bold cursor-not-allowed opacity-80">
                    Cetak Lembar Nilai (Disabled)
                </button>
                <a href="cetak_dokumen.php?id=<?= $student_id ?>&tipe=kegiatan" target="_blank" class="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md">
                    Cetak Laporan Jurnal Kegiatan Harian
                </a>
            </div>
        </div>

        <?php if ($assessment): ?>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 class="font-bold text-sm text-slate-800">Prestasi Nilai Akhir Saya:</h3>
                <div class="flex items-center gap-4 text-emerald-900 bg-emerald-50 p-4 rounded-xl font-bold text-sm">
                    <div>Nilai Rata-Rata: <span class="font-mono text-xl"><?= number_format($assessment['nilai_rata_rata'], 1) ?></span></div>
                    <div>Grade: <?= $assessment['grade'] ?> (<?= $assessment['predikat'] ?>)</div>
                </div>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
`;

export const PHP_SISWA = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$user_role = $_SESSION['role'];
$user_seksi = $_SESSION['seksi'];
$is_restricted = in_array($user_role, ['admin_seksi', 'opr_pembimbing']);

$msg = '';
$err = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $del_id = (int)$_GET['id'];
    $stmtD = $pdo->prepare("DELETE FROM students WHERE id = ?");
    $stmtD->execute([$del_id]);
    header('Location: siswa.php?msg=Data+siswa+berhasil+dihapus!');
    exit;
}

if (isset($_GET['msg'])) {
    $msg = $_GET['msg'];
}

// Handle Add & Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action_save'])) {
        $id = (int)($_POST['id'] ?? 0);
        $nama = trim($_POST['nama']);
        $nisn = trim($_POST['nisn']);
        $username = trim($_POST['username']);
        $password_raw = trim($_POST['password'] ?? '');
        $tempat_lahir = trim($_POST['tempat_lahir']);
        $tanggal_lahir = $_POST['tanggal_lahir'];
        $kelas = trim($_POST['kelas']);
        $program_keahlian = trim($_POST['program_keahlian']);
        $no_hp = trim($_POST['no_hp']);
        $asal_sekolah = trim($_POST['asal_sekolah']);
        $pembimbing_sekolah = trim($_POST['pembimbing_sekolah']);
        $no_hp_pembimbing = trim($_POST['no_hp_pembimbing']);
        $alamat = trim($_POST['alamat']);
        $tempat_penugasan = $is_restricted ? $user_seksi : $_POST['tempat_penugasan'];
        $pembimbing_kantor = trim($_POST['pembimbing_kantor']);
        $nip_pembimbing = trim($_POST['nip_pembimbing'] ?? '197405122003121002');

        if ($id > 0) {
            // Edit Student
            if (!empty($password_raw)) {
                $pass_hash = md5($password_raw);
                $stmt = $pdo->prepare("UPDATE students SET nama=?, nisn=?, username=?, password=?, tempat_lahir=?, tanggal_lahir=?, kelas=?, program_keahlian=?, no_hp=?, asal_sekolah=?, pembimbing_sekolah=?, no_hp_pembimbing=?, alamat=?, tempat_penugasan=?, pembimbing_kantor=?, nip_pembimbing=? WHERE id=?");
                $stmt->execute([$nama, $nisn, $username, $pass_hash, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE students SET nama=?, nisn=?, username=?, tempat_lahir=?, tanggal_lahir=?, kelas=?, program_keahlian=?, no_hp=?, asal_sekolah=?, pembimbing_sekolah=?, no_hp_pembimbing=?, alamat=?, tempat_penugasan=?, pembimbing_kantor=?, nip_pembimbing=? WHERE id=?");
                $stmt->execute([$nama, $nisn, $username, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing, $id]);
            }
            $msg = "Data siswa $nama berhasil diperbarui!";
        } else {
            // Add Student
            $pass_hash = md5(!empty($password_raw) ? $password_raw : 'siswa123');
            $stmt = $pdo->prepare("INSERT INTO students (nama, nisn, username, password, tempat_lahir, tanggal_lahir, kelas, program_keahlian, no_hp, asal_sekolah, pembimbing_sekolah, no_hp_pembimbing, alamat, tempat_penugasan, pembimbing_kantor, nip_pembimbing, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')");
            $stmt->execute([$nama, $nisn, $username, $pass_hash, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing]);
            $msg = "Siswa baru $nama berhasil ditambahkan!";
        }
    }
}

// Fetch Students List
$sql = "SELECT * FROM students";
$params = [];
if ($is_restricted) {
    $sql .= " WHERE tempat_penugasan = ?";
    $params[] = $user_seksi;
}
$sql .= " ORDER BY id DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Siswa Magang - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Data Siswa PKL</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-xl font-bold text-slate-900">Manajemen Data Siswa Magang / PKL</h1>
                <p class="text-xs text-slate-500">Kantor Kementerian Agama Kabupaten Lebak</p>
            </div>
            <button onclick="openFormModal()" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2">
                + Tambah Siswa Baru
            </button>
        </div>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 class="font-bold text-sm text-slate-800">Daftar Siswa (Total: <?= count($students) ?>)</h2>
            </div>
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa / NISN</th>
                        <th class="p-3">Asal Sekolah</th>
                        <th class="p-3">Program Keahlian</th>
                        <th class="p-3">Penugasan Seksi</th>
                        <th class="p-3">Pembimbing Kantor</th>
                        <th class="p-3">No. HP</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($students as $s): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900">
                            <?= htmlspecialchars($s['nama']) ?><br>
                            <span class="font-mono text-[10px] text-slate-500">NISN: <?= htmlspecialchars($s['nisn']) ?></span>
                        </td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['program_keahlian']) ?></td>
                        <td class="p-3 font-semibold text-emerald-800"><?= htmlspecialchars($s['tempat_penugasan']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['pembimbing_kantor']) ?></td>
                        <td class="p-3 font-mono text-slate-600"><?= htmlspecialchars($s['no_hp']) ?></td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick='editStudent(<?= json_encode($s) ?>)' class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[10px]">Edit</button>
                            <a href="siswa.php?action=delete&id=<?= $s['id'] ?>" onclick="return confirm('Yakin menghapus data siswa ini?')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]">Hapus</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal Form Input/Edit Siswa -->
    <div id="studentModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 id="modalTitle" class="font-bold text-base text-slate-900">Tambah Siswa Magang Baru</h3>
                <button onclick="closeFormModal()" class="text-slate-400 font-bold hover:text-slate-600 text-base">&times;</button>
            </div>
            <form method="POST" action="" class="space-y-3">
                <input type="hidden" name="action_save" value="1">
                <input type="hidden" name="id" id="student_id" value="0">

                <!-- Foto Siswa File Upload -->
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-3">
                    <label class="block font-bold text-slate-700">Foto Siswa Pas Foto 3x4 (Upload File Gambar)</label>
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-18 rounded-lg border border-slate-300 overflow-hidden bg-white shrink-0">
                            <img id="s_photo_preview" src="assets/img/default-avatar.png" alt="Preview 3x4" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 space-y-1">
                            <input type="file" id="s_photo_file" accept="image/*" onchange="previewPhotoFile(this)" class="w-full text-xs border rounded-lg p-1.5 bg-white cursor-pointer">
                            <input type="hidden" name="photo" id="s_photo" value="assets/img/default-avatar.png">
                            <p class="text-[10px] text-slate-500">Pilih file gambar dari komputer/HP (JPG, PNG, WEBP).</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                        <input type="text" name="nama" id="s_nama" required class="w-full px-3 py-2 border rounded-xl font-medium">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">NISN / NIM *</label>
                        <input type="text" name="nisn" id="s_nisn" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Username Login *</label>
                        <input type="text" name="username" id="s_username" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Password (Kosongkan jika tak diubah)</label>
                        <input type="password" name="password" placeholder="Password siswa" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Tempat Lahir *</label>
                        <input type="text" name="tempat_lahir" id="s_tempat_lahir" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
                        <input type="date" name="tanggal_lahir" id="s_tanggal_lahir" value="2006-01-01" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Kelas *</label>
                        <input type="text" name="kelas" id="s_kelas" placeholder="Contoh: XII TKJ 1" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Program Keahlian *</label>
                        <input type="text" name="program_keahlian" id="s_program_keahlian" placeholder="Contoh: Teknik Komputer" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Asal Sekolah / Kampus *</label>
                        <input type="text" name="asal_sekolah" id="s_asal_sekolah" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">No. HP Siswa *</label>
                        <input type="text" name="no_hp" id="s_no_hp" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Pembimbing Sekolah *</label>
                        <input type="text" name="pembimbing_sekolah" id="s_pembimbing_sekolah" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">No. HP Pembimbing Sekolah *</label>
                        <input type="text" name="no_hp_pembimbing" id="s_no_hp_pembimbing" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Tempat Penugasan Seksi Kemenag *</label>
                    <select name="tempat_penugasan" id="s_tempat_penugasan" class="w-full px-3 py-2 border rounded-xl font-bold bg-white">
                        <?php foreach ($SUBBAG_SEKSI_OPTIONS as $opt): ?>
                            <option value="<?= htmlspecialchars($opt) ?>"><?= htmlspecialchars($opt) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Pembimbing Kantor Kemenag *</label>
                        <input type="text" name="pembimbing_kantor" id="s_pembimbing_kantor" value="Dian Permana, S.Kom." required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">NIP Pembimbing Kantor *</label>
                        <input type="text" name="nip_pembimbing" id="s_nip_pembimbing" value="199104192019031006" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal *</label>
                    <textarea name="alamat" id="s_alamat" rows="2" required class="w-full px-3 py-2 border rounded-xl"></textarea>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t">
                    <button type="button" onclick="closeFormModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">Batal</button>
                    <button type="submit" class="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan Data Siswa</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function previewPhotoFile(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('s_photo_preview').src = e.target.result;
                    document.getElementById('s_photo').value = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        function openFormModal() {
            document.getElementById('modalTitle').innerText = "Tambah Siswa Magang Baru";
            document.getElementById('student_id').value = "0";
            document.getElementById('s_nama').value = "";
            document.getElementById('s_nisn').value = "";
            document.getElementById('s_username').value = "";
            document.getElementById('s_tempat_lahir').value = "";
            document.getElementById('s_tanggal_lahir').value = "2006-01-01";
            document.getElementById('s_kelas').value = "";
            document.getElementById('s_program_keahlian').value = "";
            document.getElementById('s_asal_sekolah').value = "";
            document.getElementById('s_no_hp').value = "";
            document.getElementById('s_pembimbing_sekolah').value = "";
            document.getElementById('s_no_hp_pembimbing').value = "";
            document.getElementById('s_pembimbing_kantor').value = "Dian Permana, S.Kom.";
            document.getElementById('s_nip_pembimbing').value = "199104192019031006";
            document.getElementById('s_alamat').value = "";
            document.getElementById('s_photo_preview').src = "assets/img/default-avatar.png";
            document.getElementById('s_photo').value = "assets/img/default-avatar.png";
            if (document.getElementById('s_photo_file')) { document.getElementById('s_photo_file').value = ""; }
            document.getElementById('studentModal').classList.remove('hidden');
        }

        function closeFormModal() {
            document.getElementById('studentModal').classList.add('hidden');
        }

        function editStudent(data) {
            document.getElementById('modalTitle').innerText = "Edit Data Siswa: " + data.nama;
            document.getElementById('student_id').value = data.id;
            document.getElementById('s_nama').value = data.nama;
            document.getElementById('s_nisn').value = data.nisn;
            document.getElementById('s_username').value = data.username;
            document.getElementById('s_tempat_lahir').value = data.tempat_lahir;
            document.getElementById('s_tanggal_lahir').value = data.tanggal_lahir;
            document.getElementById('s_kelas').value = data.kelas;
            document.getElementById('s_program_keahlian').value = data.program_keahlian;
            document.getElementById('s_asal_sekolah').value = data.asal_sekolah;
            document.getElementById('s_no_hp').value = data.no_hp;
            document.getElementById('s_pembimbing_sekolah').value = data.pembimbing_sekolah;
            document.getElementById('s_no_hp_pembimbing').value = data.no_hp_pembimbing;
            document.getElementById('s_tempat_penugasan').value = data.tempat_penugasan;
            document.getElementById('s_pembimbing_kantor').value = data.pembimbing_kantor;
            document.getElementById('s_nip_pembimbing').value = data.nip_pembimbing;
            document.getElementById('s_alamat').value = data.alamat;
            document.getElementById('s_photo_preview').src = data.photo || "assets/img/default-avatar.png";
            document.getElementById('s_photo').value = data.photo || "assets/img/default-avatar.png";
            if (document.getElementById('s_photo_file')) { document.getElementById('s_photo_file').value = ""; }
            document.getElementById('studentModal').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

export const PHP_ABSENSI = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$user_seksi = $_SESSION['seksi'];
$is_restricted = in_array($_SESSION['role'], ['admin_seksi', 'opr_pembimbing']);

$filter_tanggal = $_GET['tanggal'] ?? date('Y-m-d');

$sql = "SELECT a.*, s.nama, s.nisn, s.asal_sekolah, s.tempat_penugasan, s.no_hp_pembimbing FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.tanggal = ?";
$params = [$filter_tanggal];

if ($is_restricted) {
    $sql .= " AND s.tempat_penugasan = ?";
    $params[] = $user_seksi;
}
$sql .= " ORDER BY a.jam_masuk ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$list = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Absensi - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Absensi &amp; Kirim WA</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Rekapitulasi Kehadiran &amp; Kirim WA Pembimbing</h1>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <form method="GET" class="flex items-center gap-3 text-xs font-bold">
                <label>Filter Tanggal Absen:</label>
                <input type="date" name="tanggal" value="<?= htmlspecialchars($filter_tanggal) ?>" class="px-3 py-1.5 border border-slate-300 rounded-xl font-mono">
                <button type="submit" class="px-4 py-1.5 bg-emerald-700 text-white rounded-xl">Tampilkan</button>
            </form>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa</th>
                        <th class="p-3">Seksi Penugasan</th>
                        <th class="p-3">Jam Masuk</th>
                        <th class="p-3">Jam Pulang</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Kirim Laporan WA</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($list as $row): ?>
                    <?php 
                        $waText = urlencode("Yth. Pembimbing Sekolah {$row['asal_sekolah']},\nMelaporkan presensi siswa *{$row['nama']}* (NISN: {$row['nisn']}) pada tanggal {$row['tanggal']}:\nStatus: *{$row['status']}*\nJam Masuk: {$row['jam_masuk']} WIB\nJam Pulang: {$row['jam_pulang']} WIB\n\n_Sistem SIMAGANG KEMENAG LEBAK_");
                        $waUrl = "https://wa.me/" . preg_replace('/[^0-9]/', '', $row['no_hp_pembimbing']) . "?text=" . $waText;
                    ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($row['nama']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($row['tempat_penugasan']) ?></td>
                        <td class="p-3 font-mono font-bold text-emerald-800"><?= $row['jam_masuk'] ?> WIB</td>
                        <td class="p-3 font-mono font-bold text-blue-800"><?= $row['jam_pulang'] ?> WIB</td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold"><?= $row['status'] ?></span></td>
                        <td class="p-3">
                            <a href="<?= $waUrl ?>" target="_blank" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1">
                                Kirim WA Pembimbing
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_KEGIATAN = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$user_seksi = $_SESSION['seksi'];
$is_restricted = in_array($_SESSION['role'], ['admin_seksi', 'opr_pembimbing']);

if (isset($_POST['action_verify'])) {
    $act_id = $_POST['act_id'];
    $status = $_POST['status'];
    $stmtU = $pdo->prepare("UPDATE activities SET status_verifikasi = ? WHERE id = ?");
    $stmtU->execute([$status, $act_id]);
}

$sql = "SELECT a.*, s.nama, s.nisn, s.tempat_penugasan FROM activities a JOIN students s ON a.student_id = s.id";
$params = [];
if ($is_restricted) {
    $sql .= " WHERE s.tempat_penugasan = ?";
    $params[] = $user_seksi;
}
$sql .= " ORDER BY a.tanggal DESC, a.jam_mulai DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$activities = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Jurnal Kegiatan Admin - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Verifikasi Kegiatan</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Verifikasi Jurnal Kegiatan Harian Siswa (Format 24 Jam)</h1>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Siswa &amp; Tanggal</th>
                        <th class="p-3">Jam (24h)</th>
                        <th class="p-3">Uraian Kegiatan</th>
                        <th class="p-3">Output Hasil</th>
                        <th class="p-3">Status Verifikasi</th>
                        <th class="p-3">Aksi Verifikasi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($activities as $act): ?>
                    <tr>
                        <td class="p-3">
                            <div class="font-bold text-slate-900"><?= htmlspecialchars($act['nama']) ?></div>
                            <div class="text-[10px] text-slate-500 font-mono"><?= $act['tanggal'] ?></div>
                        </td>
                        <td class="p-3 font-mono font-bold text-slate-800"><?= $act['jam_mulai'] ?> - <?= $act['jam_selesai'] ?> WIB</td>
                        <td class="p-3 font-medium text-slate-800"><?= htmlspecialchars($act['uraian_kegiatan']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($act['output_kegiatan']) ?></td>
                        <td class="p-3">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $act['status_verifikasi'] === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' : ($act['status_verifikasi'] === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800') ?>">
                                <?= $act['status_verifikasi'] ?>
                            </span>
                        </td>
                        <td class="p-3">
                            <form method="POST" action="" class="flex gap-1">
                                <input type="hidden" name="action_verify" value="1">
                                <input type="hidden" name="act_id" value="<?= $act['id'] ?>">
                                <button type="submit" name="status" value="Disetujui" class="px-2 py-1 bg-emerald-700 text-white rounded font-bold text-[10px]">Setujui</button>
                                <button type="submit" name="status" value="Ditolak" class="px-2 py-1 bg-rose-700 text-white rounded font-bold text-[10px]">Tolak</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_PENILAIAN = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_save_grade'])) {
    $student_id = $_POST['student_id'];
    $disiplin = (float)$_POST['disiplin_waktu'];
    $tanggung_jawab = (float)$_POST['tanggung_jawab'];
    $kebersihan = (float)$_POST['kebersihan_kerapihan'];
    $kemampuan = (float)$_POST['kemampuan_kerja'];
    $kerjasama = (float)$_POST['kerjasama_tim'];
    $etika = (float)$_POST['etika_kesopanan'];

    $rata = ($disiplin + $tanggung_jawab + $kebersihan + $kemampuan + $kerjasama + $etika) / 6.0;
    $grade = $rata >= 90 ? 'A' : ($rata >= 80 ? 'B' : ($rata >= 70 ? 'C' : 'D'));
    $predikat = $grade === 'A' ? 'Sangat Baik' : ($grade === 'B' ? 'Baik' : ($grade === 'C' ? 'Cukup' : 'Kurang'));

    $stmtC = $pdo->prepare("SELECT id FROM assessments WHERE student_id = ?");
    $stmtC->execute([$student_id]);
    $exist = $stmtC->fetch();

    if ($exist) {
        $stmtU = $pdo->prepare("UPDATE assessments SET disiplin_waktu=?, tanggung_jawab=?, kebersihan_kerapihan=?, kemampuan_kerja=?, kerjasama_tim=?, etika_kesopanan=?, nilai_rata_rata=?, grade=?, predikat=? WHERE student_id=?");
        $stmtU->execute([$disiplin, $tanggung_jawab, $kebersihan, $kemampuan, $kerjasama, $etika, $rata, $grade, $predikat, $student_id]);
    } else {
        $stmtI = $pdo->prepare("INSERT INTO assessments (student_id, disiplin_waktu, tanggung_jawab, kebersihan_kerapihan, kemampuan_kerja, kerjasama_tim, etika_kesopanan, nilai_rata_rata, grade, predikat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtI->execute([$student_id, $disiplin, $tanggung_jawab, $kebersihan, $kemampuan, $kerjasama, $etika, $rata, $grade, $predikat]);
    }
    $msg = "Penilaian prestasi siswa berhasil disimpan! (Rata-rata: " . number_format($rata, 1) . " - Grade $grade)";
}

$students = $pdo->query("SELECT s.*, a.nilai_rata_rata, a.grade, a.predikat FROM students s LEFT JOIN assessments a ON s.id = a.student_id ORDER BY s.nama ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Penilaian Prestasi Siswa - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Penilaian Prestasi</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Penilaian Prestasi Akhir (6 Aspek Penilaian)</h1>
        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa / NISN</th>
                        <th class="p-3">Asal Sekolah</th>
                        <th class="p-3">Nilai Rata-Rata</th>
                        <th class="p-3">Grade</th>
                        <th class="p-3">Predikat</th>
                        <th class="p-3">Aksi Input / Cetak</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($students as $s): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($s['nama']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                        <td class="p-3 font-mono text-base font-bold text-emerald-800"><?= $s['nilai_rata_rata'] ? number_format($s['nilai_rata_rata'], 1) : '-' ?></td>
                        <td class="p-3 font-bold"><?= $s['grade'] ?? '-' ?></td>
                        <td class="p-3 font-semibold text-slate-700"><?= $s['predikat'] ?? '-' ?></td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick='openGradeModal(<?= json_encode($s) ?>)' class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] cursor-pointer">Input / Edit Nilai</button>
                            <?php if ($s['nilai_rata_rata']): ?>
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=penilaian" target="_blank" class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] inline-block">Cetak Lembar Nilai</a>
                                <?php if (in_array($_SESSION['role'], ['superadmin', 'admin'])): ?>
                                    <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=sertifikat_magang&lembar=all" target="_blank" class="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-[10px] inline-block">Cetak Sertifikat</a>
                                <?php endif; ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_LAPORAN = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$students = $pdo->query("SELECT * FROM students ORDER BY nama ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Laporan - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Cetak Laporan Resmi</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Cetak Laporan &amp; Dokumen Resmi Magang</h1>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">Pilih Dokumen Siswa yang Ingin Dicetak</div>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                        <tr>
                            <th class="p-3">Nama Siswa</th>
                            <th class="p-3">Asal Sekolah</th>
                            <th class="p-3">Seksi Penugasan</th>
                            <th class="p-3 text-center">Cetak Sertifikat Magang (Bolak-Balik)</th>
                            <th class="p-3 text-center">Cetak Penilaian PKL</th>
                            <th class="p-3 text-center">Cetak Jurnal Kegiatan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php foreach ($students as $s): ?>
                        <tr>
                            <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($s['nama']) ?><br><span class="font-mono text-[10px] text-slate-500">NISN: <?= htmlspecialchars($s['nisn']) ?></span></td>
                            <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                            <td class="p-3 font-semibold text-emerald-800"><?= htmlspecialchars($s['tempat_penugasan']) ?></td>
                            <td class="p-3 text-center">
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=sertifikat" target="_blank" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs inline-block">
                                    Cetak Sertifikat (2 Hal)
                                </a>
                            </td>
                            <td class="p-3 text-center">
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=penilaian" target="_blank" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs inline-block">
                                    Cetak Penilaian Kop Surat
                                </a>
                            </td>
                            <td class="p-3 text-center">
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=kegiatan" target="_blank" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs inline-block">
                                    Cetak Jurnal Kegiatan
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>
</html>
`;

export const PHP_USERS = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'super_admin') {
    header('Location: index.php');
    exit;
}

$users = $pdo->query("SELECT * FROM users ORDER BY id DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manajemen User - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Manajemen User Admin</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Manajemen Akun Admin &amp; Pembimbing Seksi</h1>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama &amp; NIP</th>
                        <th class="p-3">Username</th>
                        <th class="p-3">Jabatan &amp; Seksi</th>
                        <th class="p-3">Role Hak Akses</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($users as $u): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($u['nama']) ?><br><span class="font-mono text-[10px] text-slate-500">NIP: <?= htmlspecialchars($u['nip']) ?></span></td>
                        <td class="p-3 font-mono font-bold text-emerald-800"><?= htmlspecialchars($u['username']) ?></td>
                        <td class="p-3 font-medium text-slate-700"><?= htmlspecialchars($u['jabatan']) ?> &bull; <?= htmlspecialchars($u['seksi']) ?></td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase"><?= $u['role'] ?></span></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>
`;

export const PHP_RUNNING_TEXT = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $text = trim($_POST['running_text']);
    $timeout = (int)$_POST['auto_logout_minutes'];
    $stmtU = $pdo->prepare("UPDATE settings SET running_text = ?, auto_logout_minutes = ? WHERE id = 1");
    $stmtU->execute([$text, $timeout]);
    $msg = "Pengaturan running text & timer auto-logout berhasil disimpan!";
}

$setting = $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Setting Running Text &amp; Timer - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex min-h-screen">
    <aside class="w-64 bg-emerald-950 text-white min-h-screen p-4 flex flex-col justify-between shrink-0">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain">
                <div>
                    <h2 class="font-black text-sm leading-tight">SIMAGANG LEBAK</h2>
                    <p class="text-[10px] text-emerald-300">Setting Running Text</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-4xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Pengaturan Marquee Running Text &amp; Timer Inaktivitas</h1>
        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <form method="POST" action="" class="space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-800 mb-1">Teks Pengumuman Berjalan (Running Text):</label>
                    <textarea name="running_text" rows="3" required class="w-full p-3 border border-slate-300 rounded-xl font-medium"><?= htmlspecialchars($setting['running_text'] ?? '') ?></textarea>
                </div>

                <div>
                    <label class="block font-bold text-slate-800 mb-1">Timer Otomatis Logout Jika Tidak Ada Aktivitas (Menit):</label>
                    <input type="number" name="auto_logout_minutes" value="<?= $setting['auto_logout_minutes'] ?? 15 ?>" min="1" max="120" required class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono">
                </div>

                <button type="submit" class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md">Simpan Perubahan Pengaturan</button>
            </form>
        </div>
    </main>
</body>
</html>
`;

export const PHP_CETAK_DOKUMEN = `<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$id = (int)($_GET['id'] ?? 0);
$tipe = $_GET['tipe'] ?? 'penilaian';
$lembar = $_GET['lembar'] ?? 'all'; // '1', '2', or 'all'

$stmtS = $pdo->prepare("SELECT * FROM students WHERE id = ?");
$stmtS->execute([$id]);
$student = $stmtS->fetch();

if (!$student) {
    echo "Data siswa tidak ditemukan!";
    exit;
}

$stmtAss = $pdo->prepare("SELECT * FROM assessments WHERE student_id = ?");
$stmtAss->execute([$id]);
$ass = $stmtAss->fetch();

$stmtAct = $pdo->prepare("SELECT * FROM activities WHERE student_id = ? ORDER BY tanggal ASC, jam_mulai ASC");
$stmtAct->execute([$id]);
$activities = $stmtAct->fetchAll();

$doc_no = "B-{$student['nisn']}/Kk.28.02.1/KS.00/" . date('m/Y');
$today_str = date('d F Y');

$n_disiplin = (float)($ass['disiplin_waktu'] ?? 90);
$n_tanggung = (float)($ass['tanggung_jawab'] ?? 90);
$n_kebersihan = (float)($ass['kebersihan_kerapihan'] ?? 89);
$n_kemampuan = (float)($ass['kemampuan_kerja'] ?? 92);
$n_kerjasama = (float)($ass['kerjasama_tim'] ?? 92);
$n_etika = (float)($ass['etika_kesopanan'] ?? 89);
$n_rata = (float)($ass['nilai_rata_rata'] ?? (($n_disiplin + $n_tanggung + $n_kebersihan + $n_kemampuan + $n_kerjasama + $n_etika) / 6));

function getGradeLetter($val) {
    if ($val >= 90) return 'A';
    if ($val >= 80) return 'B';
    if ($val >= 70) return 'C';
    return 'D';
}

function getPredikatName($val) {
    if ($val >= 90) return 'SANGAT BAIK';
    if ($val >= 80) return 'BAIK';
    if ($val >= 70) return 'CUKUP';
    return 'KURANG';
}

$grade_akhir = $ass['grade'] ?? getGradeLetter($n_rata);
$predikat_akhir = strtoupper($ass['predikat'] ?? getPredikatName($n_rata));
$is_sertifikat = ($tipe === 'sertifikat' || $tipe === 'sertifikat_magang');
$is_lulus = ($n_rata >= 70);

function render_certificate_qrcode($nama, $nisn, $tgl) {
    $payload = "{$nama} | {$nisn} | {$tgl}";
    $size = 21;
    $cellSize = 100 / $size;
    $rects = "";

    for ($r = 0; $r < $size; $r++) {
        for ($c = 0; $c < $size; $c++) {
            $isBit = false;
            if ($r <= 6 && $c <= 6) {
                if (($r === 0 || $r === 6 || $c === 0 || $c === 6) || ($r >= 2 && $r <= 4 && $c >= 2 && $c <= 4)) $isBit = true;
            } else if ($r <= 6 && $c >= 14) {
                $c2 = $c - 14;
                if (($r === 0 || $r === 6 || $c2 === 0 || $c2 === 6) || ($r >= 2 && $r <= 4 && $c2 >= 2 && $c2 === 4)) $isBit = true;
            } else if ($r >= 14 && $c <= 6) {
                $r2 = $r - 14;
                if (($r2 === 0 || $r2 === 6 || $c === 0 || $c === 6) || ($r2 >= 2 && $r2 <= 4 && $c === 2 && $c === 4)) $isBit = true;
            } else if ($r === 6) {
                $isBit = ($c % 2 === 0);
            } else if ($c === 6) {
                $isBit = ($r % 2 === 0);
            } else if (($r === 8 && ($c <= 8 || $c >= 13)) || ($c === 8 && ($r <= 8 || $r >= 13))) {
                $isBit = (($r + $c) % 3 === 0);
            } else if ($r >= 14 && $r <= 18 && $c >= 14 && $c <= 18) {
                $r2 = $r - 14; $c2 = $c - 14;
                if ($r2 === 0 || $r2 === 4 || $c2 === 0 || $c2 === 4 || ($r2 === 2 && $c2 === 2)) $isBit = true;
            } else {
                $hash = 0;
                $len = strlen($payload);
                for ($i = 0; $i < $len; $i++) {
                    $hash = (($hash << 5) - $hash + ord($payload[$i]) * ($r * 21 + $c + 1)) & 0xFFFFFFF;
                }
                $val = abs(($hash ^ ($r * 31 + $c * 17)) % 100);
                $isBit = ($val > 42);
            }

            if ($isBit) {
                $x = number_format($c * $cellSize, 2, '.', '');
                $y = number_format($r * $cellSize, 2, '.', '');
                $w = number_format($cellSize, 2, '.', '');
                $rects .= "<rect x='{$x}' y='{$y}' width='{$w}' height='{$w}' fill='#0F172A'/>";
            }
        }
    }

    return "<svg class='w-10 h-10 shrink-0' viewBox='0 0 100 100' fill='none' aria-label='QR Code Verifikasi: ".htmlspecialchars($payload)."'>"
         . "<rect width='100' height='100' rx='6' fill='#F8FAFC' stroke='#CBD5E1' stroke-width='2'/>"
         . $rects
         . "</svg>";
}

function render_certificate_barcode($nama, $nisn, $tgl) {
    $str = $nisn . $nama . $tgl;
    $rects = "<rect width='160' height='50' fill='#FFFFFF'/>";
    $rects .= "<rect x='6' y='5' width='2' height='40' fill='#000000'/>";
    $rects .= "<rect x='9' y='5' width='1' height='40' fill='#000000'/>";
    $currX = 12;
    $len = strlen($str);
    for ($i = 0; $i < $len && $currX < 145; $i++) {
        $code = ord($str[$i]);
        $w = ($code % 4) + 1;
        $gap = (($code * 3) % 3) + 1;
        $rects .= "<rect x='{$currX}' y='5' width='{$w}' height='40' fill='#000000'/>";
        $currX += ($w + $gap);
    }
    $rects .= "<rect x='148' y='5' width='2' height='40' fill='#000000'/>";
    $rects .= "<rect x='152' y='5' width='2' height='40' fill='#000000'/>";
    return "<svg class='h-10 w-32 shrink-0' viewBox='0 0 160 50' aria-label='Barcode Verifikasi: ".htmlspecialchars($nama)." ".htmlspecialchars($nisn)."'>"
         . $rects
         . "</svg>";
}

if ($is_sertifikat && !in_array($_SESSION['role'] ?? '', ['super_admin', 'admin'])) {
    die("
    <!DOCTYPE html>
    <html lang='id'>
    <head><meta charset='UTF-8'><title>Akses Dibatasi</title><script src='https://cdn.tailwindcss.com'></script></head>
    <body class='bg-slate-100 flex items-center justify-center min-h-screen p-4 font-sans'>
        <div class='bg-white p-8 rounded-2xl shadow-xl border border-rose-200 max-w-md w-full text-center space-y-4'>
            <div class='w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold'>!</div>
            <h2 class='text-lg font-bold text-slate-900'>Akses Cetak Dibatasi</h2>
            <p class='text-xs text-slate-600 leading-relaxed'>Dokumen Sertifikat Magang Resmi hanya dapat dicetak oleh <strong>Super Admin</strong> dan <strong>Admin Subbag TU</strong>.</p>
            <button onclick='window.close()' class='px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer'>Tutup Halaman</button>
        </div>
    </body>
    </html>
    ");
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Dokumen - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #000; }
        @media print {
            .no-print { display: none !important; }
            @page { size: A4 portrait !important; margin: 0.8cm !important; }
            .page-break { page-break-before: always; break-before: page; }
        }
    </style>
</head>
<body class="p-6 max-w-4xl mx-auto space-y-6">

    <div class="no-print flex flex-wrap justify-between items-center bg-slate-900 text-white p-4 rounded-xl mb-6 shadow-md gap-3">
        <div>
            <h2 class="font-bold text-sm">Pratinjau Cetak Dokumen Resmi Kemenag Lebak</h2>
            <p class="text-xs text-slate-400">
                <?= $is_sertifikat ? 'Format Cetak Sertifikat A4 Portrait (21 cm x 29,7 cm)' : 'Klik tombol di kanan untuk mencetak langsung ke PDF / Printer' ?>
            </p>
        </div>
        
        <div class="flex items-center gap-2">
            <?php if ($is_sertifikat): ?>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=1" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Lembar 1
                </a>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=2" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Lembar 2
                </a>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=all" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Semua (1 &amp; 2)
                </a>
            <?php else: ?>
                <button onclick="window.print()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg shadow-md cursor-pointer">
                    Cetak Sekarang (Print / PDF)
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- KOP SURAT RESMI (HANYA UNTUK DOKUMEN NON-SERTIFIKAT) -->
    <?php if (!$is_sertifikat): ?>
    <div class="border-b-4 border-double border-slate-900 pb-4 flex items-center gap-4">
        <img src="assets/img/kemenag-logo.png" class="w-20 h-20 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
        <div class="text-center flex-1">
            <h3 class="text-base font-bold uppercase tracking-wide">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
            <h2 class="text-lg font-black uppercase tracking-wider">KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK</h2>
            <p class="text-xs">Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314</p>
            <p class="text-[11px] text-slate-600">Telepon (0252) 201083 | Email: kablebak@kemenag.go.id</p>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($is_sertifikat): ?>
        <!-- ============================================================== -->
        <!-- DOKUMEN SERTIFIKAT MAGANG (BOLAK-BALIK / 2 LEMBAR PORTRAIT A4)  -->
        <!-- ============================================================== -->

        <?php if ($lembar === 'all' || $lembar === '1'): ?>
        <!-- LEMBAR DEPAN (HALAMAN 1) - PORTRAIT A4 -->
        <div class="border-4 border-double border-amber-900/40 p-5 sm:p-7 rounded-2xl bg-amber-50/10 space-y-3.5 relative min-h-[26cm] flex flex-col justify-between overflow-hidden">
            <!-- Header Halaman 1: Logo Center & Nama Instansi Capital (Font Size 12pt, Jarak 1) -->
            <div class="text-center relative z-10 space-y-1">
                <img src="assets/img/kemenag-logo.png" class="w-20 h-20 mx-auto object-contain drop-shadow-xs mb-1" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
                <h2 class="font-extrabold text-[12pt] uppercase tracking-wider text-slate-900 mt-1">
                    KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK
                </h2>
                <div class="border-b border-slate-900 w-full my-2"></div>
            </div>

            <!-- Judul 2 Baris (Font Size 14pt) & Nomor Sertifikat -->
            <div class="text-center relative z-10 space-y-1">
                <h1 class="text-[14pt] font-bold uppercase tracking-wide text-slate-900 leading-snug">SERTIFIKAT<br>PRAKTEK KERJA LAPANGAN / MAGANG</h1>
                <p class="text-xs font-mono font-bold text-slate-800">Nomor : B-<?= htmlspecialchars($student['nisn']) ?>/Kk.28.02.1/KS.00/<?= date('m/Y') ?></p>
            </div>

            <div class="text-center relative z-10 space-y-3 text-xs leading-relaxed max-w-4xl mx-auto">
                <p class="text-xs text-justify leading-normal">Berdasarkan UU No. 20 tahun 2003 tentang Sisdiknas dan Permendikbud No. 50 Tahun 2020 tentang Praktek Kerja Lapangan (PKL) serta ketentuan - ketentuan pelaksanaannya lainnya, maka dengan ini Kepala Kantor Kementerian Agama Kabupaten Lebak menyatakan bahwa :</p>

                <div class="max-w-2xl mx-auto text-left border border-slate-300 p-3 rounded-xl bg-white/95 space-y-1 shadow-xs text-xs">
                    <table class="w-full">
                        <tr><td class="w-48 font-semibold py-0.5">N a m a</td><td class="w-4">:</td><td class="font-bold uppercase tracking-wide text-slate-900"><?= htmlspecialchars(strtoupper($student['nama'])) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">NISN/NIM</td><td>:</td><td class="font-mono font-bold"><?= htmlspecialchars($student['nisn']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Tempat dan Tanggal Lahir</td><td>:</td><td class="font-semibold uppercase text-slate-900"><?= htmlspecialchars(strtoupper($student['tempat_lahir'] ?: 'LEBAK')) ?>, <?= strtoupper(date('d F Y', strtotime($student['tanggal_lahir'] ?: '2000-10-07'))) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Prodi / Jurusan</td><td>:</td><td class="font-semibold uppercase"><?= htmlspecialchars(strtoupper($student['program_keahlian'] ?: 'MANAJEMEN')) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Asal Sekolah</td><td>:</td><td class="font-semibold"><?= htmlspecialchars($student['asal_sekolah']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Tempat Penugasan</td><td>:</td><td class="font-bold text-emerald-900"><?= htmlspecialchars($student['tempat_penugasan']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Waktu Pelaksanaan</td><td>:</td><td class="font-mono"><?= $student['tanggal_mulai'] ?: '01 Januari 2026' ?> s.d <?= $student['tanggal_selesai'] ?: '31 Juli 2026' ?></td></tr>
                    </table>
                </div>

                <p class="text-xs">Telah mengikuti dan menyelesaikan Praktek Kerja Lapangan / Magang di Kantor Kementerian Agama Kabupaten Lebak dengan predikat:</p>

                <!-- Format sorotan kelulusan: NAIK NILAI >= 70 LULUS, < 70 TIDAK LULUS -->
                <div class="py-2.5 px-6 my-1 -mt-2 border-2 rounded-2xl max-w-md mx-auto text-center shadow-xs <?= $is_lulus ? 'bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-amber-500 text-slate-900' : 'bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 border-rose-500 text-rose-900' ?>">
                    <span class="text-sm sm:text-base font-extrabold tracking-wide inline-block">
                        <?php if ($is_lulus): ?>
                            LULUS dengan Nilai : <span class="underline text-emerald-900 font-black"><?= $predikat_akhir ?></span>
                        <?php else: ?>
                            <span class="text-rose-700 font-black tracking-wider text-sm sm:text-base uppercase">TIDAK LULUS dengan Nilai : KURANG</span>
                        <?php endif; ?>
                    </span>
                </div>

                <p class="text-xs italic text-slate-600">Sertifikat ini diberikan sebagai bukti kelulusan dan penghargaan atas dedikasi serta kontribusi kerja yang telah diberikan.</p>
            </div>

            <!-- Bottom Row: Pojok Kiri = Barcode Batang SVG Linear + QR, Pojok Kanan = Tanda Tangan Kepala Kantor (TANPA TULISAN WATERMARK STEMPEL) -->
            <div class="relative z-10 pt-2 flex items-end justify-between gap-6 text-xs">
                <!-- Barcode Batang SVG Linear + QR Code SVG (Menggunakan data Nama Siswa, NISN, dan Tanggal Sertifikat) -->
                <div class="bg-white/95 p-2 rounded-xl border border-slate-300 shadow-xs inline-flex items-center gap-2 shrink-0">
                    <?= render_certificate_barcode($student['nama'], $student['nisn'], $today_str) ?>
                    <?= render_certificate_qrcode($student['nama'], $student['nisn'], $today_str) ?>
                </div>

                <!-- Tanda Tangan Kepala Kantor (TANPA TULISAN WATERMARK STEMPEL) -->
                <div class="text-center space-y-0.5 w-80 shrink-0">
                    <p>Rangkasbitung, <?= $today_str ?></p>
                    <p class="font-bold">Kepala Kantor,</p>
                    <div class="h-16 flex items-center justify-center"></div>
                    <p class="font-bold underline uppercase text-slate-900 text-[11pt]">H. BADRUSSALAM, S.AG., M.SI.</p>
                    <p class="font-mono text-[10px]">NIP. 197508142000031002</p>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <?php if ($lembar === 'all' || $lembar === '2'): ?>
        <!-- LEMBAR BELAKANG (HALAMAN 2 - TRANSKRIP NILAI) - PORTRAIT A4 -->
        <div style="page-break-before: always; break-before: page;" class="pt-6 space-y-5 relative min-h-[26cm] flex flex-col justify-between overflow-hidden">
            <!-- Watermark Logo Kemenag 8cm x 8cm di Tengah Halaman 2 -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <img src="assets/img/kemenag-logo.png" class="w-[8cm] h-[8cm] object-contain opacity-[0.08] filter grayscale select-none" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
            </div>

            <div class="space-y-4 relative z-10">
                <div class="border-b-2 border-slate-900 pb-2 text-center space-y-1">
                    <h2 class="text-base font-extrabold uppercase underline tracking-wide">DAFTAR NILAI PRAKTEK KERJA LAPANGAN / MAGANG</h2>
                    <p class="text-xs font-mono font-medium">Lampiran Sertifikat Magang Nomor: <?= $doc_no ?></p>
                </div>

                <!-- Ringkasan Data Siswa (Revisi Label: Asal Sekolah & Program Studi/Jurusan) -->
                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-300">
                    <div>Nama Siswa: <strong class="uppercase"><?= htmlspecialchars($student['nama']) ?></strong></div>
                    <div>NISN: <strong class="font-mono"><?= htmlspecialchars($student['nisn']) ?></strong></div>
                    <div>Asal Sekolah: <strong><?= htmlspecialchars($student['asal_sekolah']) ?></strong></div>
                    <div>Program Studi/Jurusan: <strong class="text-emerald-900 uppercase"><?= htmlspecialchars(strtoupper($student['program_keahlian'] ?: 'MANAJEMEN')) ?></strong></div>
                </div>

                <table class="w-full text-xs border border-slate-900 border-collapse bg-white/90">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-900">
                            <th class="border border-slate-900 p-2 text-center w-12">No</th>
                            <th class="border border-slate-900 p-2 text-left">Aspek Penilaian Prestasi</th>
                            <th class="border border-slate-900 p-2 text-center w-28">Nilai Angka</th>
                            <th class="border border-slate-900 p-2 text-center w-24">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td class="border border-slate-900 p-2 text-center">1</td><td class="border border-slate-900 p-2 font-medium">Kedisiplinan Waktu &amp; Ketepatan Presensi</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_disiplin, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_disiplin) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">2</td><td class="border border-slate-900 p-2 font-medium">Tanggung Jawab Pekerjaan &amp; Penugasan</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_tanggung, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_tanggung) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">3</td><td class="border border-slate-900 p-2 font-medium">Kebersihan &amp; Kerapihan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kebersihan, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kebersihan) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">4</td><td class="border border-slate-900 p-2 font-medium">Kemampuan &amp; Hasil Penguasaan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kemampuan, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kemampuan) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">5</td><td class="border border-slate-900 p-2 font-medium">Kerjasama Dalam Tim &amp; Komunikasi</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kerjasama, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kerjasama) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">6</td><td class="border border-slate-900 p-2 font-semibold">Keahlian: <?= !empty($ass['nama_bidang_keahlian']) ? htmlspecialchars($ass['nama_bidang_keahlian']) : 'Kompetensi / Bidang Keahlian' ?></td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_etika, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_etika) ?></td></tr>
                        <tr class="bg-slate-50 font-bold">
                            <td colspan="2" class="border border-slate-900 p-2 text-right">Nilai Rata-Rata Akhir:</td>
                            <td class="border border-slate-900 p-2 text-center font-mono text-sm font-black"><?= number_format($n_rata, 1) ?></td>
                            <td class="border border-slate-900 p-2 text-center">GRADE <?= $grade_akhir ?> (<?= $predikat_akhir ?>)</td>
                        </tr>
                    </tbody>
                </table>

                <div class="p-3 border border-slate-900 bg-slate-50 text-[11px] space-y-1">
                    <strong class="block font-bold">Tabel Legenda Kriteria Nilai:</strong>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-white p-1.5 rounded border"><strong>90 – 100</strong><br><span class="text-emerald-800 font-bold">Grade A (Sangat Baik)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>80 – 89</strong><br><span class="text-blue-800 font-bold">Grade B (Baik)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>70 – 79</strong><br><span class="text-amber-800 font-bold">Grade C (Cukup)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>&lt; 70</strong><br><span class="text-rose-800 font-bold">Grade D (Kurang)</span></div>
                    </div>
                </div>

                <div class="text-xs space-y-1">
                    <strong>Catatan Evaluasi Pembimbing Instansi:</strong>
                    <p class="italic text-slate-800 p-2.5 bg-slate-50 border rounded-lg">
                        "<?= htmlspecialchars($ass['catatan'] ?? 'Siswa menunjukkan kedisiplinan dan kinerja yang sangat baik selama masa magang.') ?>"
                    </p>
                </div>
            </div>

            <!-- Tanda Tangan Pembimbing Kantor -->
            <div class="relative z-10 flex justify-end text-xs pt-4">
                <div class="text-center space-y-0.5 w-80 shrink-0">
                    <p>Rangkasbitung, <?= $today_str ?></p>
                    <p class="font-bold">Pembimbing Kantor</p>
                    <p class="font-bold">Kementerian Agama Kabupaten Lebak</p>
                    <div class="h-20"></div>
                    <p class="font-bold underline uppercase"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
                    <p class="font-mono text-[10px]">NIP. <?= htmlspecialchars($student['nip_pembimbing'] ?: '197811202005011004') ?></p>
                </div>
            </div>
        </div>
        <?php endif; ?>

    <?php elseif ($tipe === 'penilaian'): ?>
        <div class="text-center space-y-1 my-4">
            <h2 class="text-base font-extrabold uppercase underline">LEMBAR PENILAIAN PRAKTIK KERJA LAPANGAN / MAGANG</h2>
            <p class="text-xs font-mono">Nomor Dokumen: <?= $doc_no ?></p>
        </div>

        <table class="w-full text-xs space-y-1">
            <tr><td class="w-36 font-bold py-1">Nama Siswa</td><td>: <?= htmlspecialchars($student['nama']) ?></td></tr>
            <tr><td class="font-bold py-1">NISN / NIM</td><td>: <?= htmlspecialchars($student['nisn']) ?></td></tr>
            <tr><td class="font-bold py-1">Asal Sekolah</td><td>: <?= htmlspecialchars($student['asal_sekolah']) ?></td></tr>
            <tr><td class="font-bold py-1">Program Keahlian</td><td>: <?= htmlspecialchars($student['program_keahlian']) ?></td></tr>
            <tr><td class="font-bold py-1">Tempat Penugasan</td><td>: <?= htmlspecialchars($student['tempat_penugasan']) ?></td></tr>
        </table>

        <table class="w-full text-xs border border-slate-900 border-collapse mt-4">
            <thead>
                <tr class="bg-slate-100 border-b border-slate-900">
                    <th class="border border-slate-900 p-2 text-center w-12">No</th>
                    <th class="border border-slate-900 p-2 text-left">Aspek Penilaian Prestasi</th>
                    <th class="border border-slate-900 p-2 text-center w-24">Nilai (0-100)</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="border border-slate-900 p-2 text-center">1</td><td class="border border-slate-900 p-2">Kedisiplinan &amp; Ketepatan Waktu</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_disiplin, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">2</td><td class="border border-slate-900 p-2">Tanggung Jawab Pekerjaan</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_tanggung, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">3</td><td class="border border-slate-900 p-2">Kebersihan &amp; Kerapihan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kebersihan, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">4</td><td class="border border-slate-900 p-2">Kemampuan &amp; Hasil Penguasaan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kemampuan, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">5</td><td class="border border-slate-900 p-2">Kerjasama Dalam Tim</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kerjasama, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">6</td><td class="border border-slate-900 p-2">Keahlian: <?= !empty($ass['nama_bidang_keahlian']) ? htmlspecialchars($ass['nama_bidang_keahlian']) : 'Etika, Sopan Santun & Akhlak' ?></td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_etika, 1) ?></td></tr>
                <tr class="bg-slate-50 font-bold">
                    <td colspan="2" class="border border-slate-900 p-2 text-right">Nilai Rata-Rata Akhir:</td>
                    <td class="border border-slate-900 p-2 text-center font-mono text-sm font-black"><?= number_format($n_rata, 1) ?></td>
                </tr>
            </tbody>
        </table>

        <!-- TANDA TANGAN LEMBAR PENILAIAN -->
        <div class="grid grid-cols-2 gap-8 text-xs pt-8">
            <div class="text-center space-y-16">
                <p>Mengetahui,<br><strong>Kasubbag Tata Usaha</strong></p>
                <p class="font-bold underline">H. Sudirman, S.Ag., M.Si<br><span class="font-normal no-underline font-mono text-[10px]">NIP. 197405122003121002</span></p>
            </div>
            <div class="text-center space-y-16">
                <p>Rangkasbitung, <?= date('d F Y') ?><br><strong>Pembimbing Kantor Kemenag Lebak</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
            </div>
        </div>
    <?php else: ?>
        <div class="text-center space-y-1 my-4">
            <h2 class="text-base font-extrabold uppercase underline">LAPORAN REKAPITULASI JURNAL KEGIATAN HARIAN</h2>
            <p class="text-xs">Siswa: <strong><?= htmlspecialchars($student['nama']) ?></strong> (NISN: <?= $student['nisn'] ?>)</p>
        </div>

        <table class="w-full text-xs border border-slate-900 border-collapse mt-4">
            <thead>
                <tr class="bg-slate-100 border-b border-slate-900">
                    <th class="border border-slate-900 p-2 text-center w-10">No</th>
                    <th class="border border-slate-900 p-2 text-left w-24">Tanggal</th>
                    <th class="border border-slate-900 p-2 text-center w-28">Waktu (24 Jam)</th>
                    <th class="border border-slate-900 p-2 text-left">Uraian Kegiatan</th>
                    <th class="border border-slate-900 p-2 text-left">Output / Hasil</th>
                    <th class="border border-slate-900 p-2 text-center w-20">Verifikasi</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($activities as $a): ?>
                <tr>
                    <td class="border border-slate-900 p-2 text-center"><?= $no++ ?></td>
                    <td class="border border-slate-900 p-2 font-mono"><?= $a['tanggal'] ?></td>
                    <td class="border border-slate-900 p-2 text-center font-mono"><?= $a['jam_mulai'] ?> - <?= $a['jam_selesai'] ?></td>
                    <td class="border border-slate-900 p-2"><?= htmlspecialchars($a['uraian_kegiatan']) ?></td>
                    <td class="border border-slate-900 p-2"><?= htmlspecialchars($a['output_kegiatan']) ?></td>
                    <td class="border border-slate-900 p-2 text-center font-bold"><?= $a['status_verifikasi'] ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- TANDA TANGAN JURNAL KEGIATAN -->
        <div class="grid grid-cols-2 gap-8 text-xs pt-8">
            <div class="text-center space-y-16">
                <p>Mengetahui,<br><strong>Pembimbing Kantor Kemenag Lebak</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
            </div>
            <div class="text-center space-y-16">
                <p>Rangkasbitung, <?= date('d F Y') ?><br><strong>Siswa Magang / PKL</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['nama']) ?></p>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>
`;

export const PHP_README = `# PANDUAN INSTALASI SIMAGANG KEMENAG LEBAK
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
     * **Laragon:** \`C:\\laragon\\www\\simagang-kemenag-lebak\`
     * **XAMPP:** \`C:\\xampp\\htdocs\\simagang-kemenag-lebak\`
   
3. **Membuat & Import Database:**
   - Buka browser dan akses **phpMyAdmin** (\`http://localhost/phpmyadmin\`).
   - Buat database baru dengan nama \`sim_pkl_kemenag\`.
   - Pilih database \`sim_pkl_kemenag\`, lalu klik menu **Import**.
   - Pilih file \`database.sql\` yang ada dalam folder project ini, lalu klik **Go / Kirim**.

4. **Konfigurasi Database (Jika Diperlukan):**
   - File konfigurasi terdapat pada \`config/koneksi.php\`.
   - Secara default:
     * Host: \`localhost\`
     * Database: \`sim_pkl_kemenag\`
     * User: \`root\`
     * Password: \`\` (kosong)

5. **Akses Aplikasi:**
   - Buka browser dan ketik alamat:
     * Laragon: \`http://localhost/simagang-kemenag-lebak\` atau \`http://simagang-kemenag-lebak.test\`
     * XAMPP: \`http://localhost/simagang-kemenag-lebak\`

---

### AKUN LOGIN DEFAULT

1. **Admin / Pembimbing (Pegawai Kemenag):**
   - Username: \`admin\`
   - Password: \`admin123\`

2. **Siswa Magang (Login Menggunakan NISN):**
   - Username: \`1234567890\` (Contoh Ahmad Dahlan)
   - Password: \`siswa123\`

---

### DOKUMEN & FORMAT RESMI
- **Jadwal Jam Masuk & Pulang:**
  * Senin - Kamis: **07:30 - 16:00 WIB**
  * Jumat: **07:30 - 16:30 WIB**
- **Format Jam Input Kegiatan:** 24 Jam (HH:mm)
- **Format Nomor Dokumen Penilaian:** \`B-[NISN]/Kk.28.02.1/KS.00/[Bulan]/[Tahun]\`
`;

