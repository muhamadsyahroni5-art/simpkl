<?php
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
    <aside class="w-64 bg-emerald-950 text-white p-4 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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

        <!-- Informasi Jadwal Work Hours -->
        <div class="bg-emerald-900 text-white p-4 rounded-2xl text-xs space-y-1 shadow-xs">
            <p class="font-bold border-b border-emerald-800 pb-1">Jadwal Masuk &amp; Pulang Kantor Kemenag Kab. Lebak:</p>
            <p>&bull; <strong>Senin s.d. Kamis:</strong> Masuk Jam 07:30 WIB | Pulang Jam 16:00 WIB</p>
            <p>&bull; <strong>Jumat:</strong> Masuk Jam 07:30 WIB | Pulang Jam 16:30 WIB</p>
        </div>

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
                    Absen Sekarang (Jam Server: <?= date('H:i') ?> WIB)
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
