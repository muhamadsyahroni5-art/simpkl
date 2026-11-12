<?php
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

$setting = $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
$running_text = $setting['running_text'] ?? 'Selamat Datang di SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang) Kantor Kementerian Agama Kabupaten Lebak';
$auto_logout = $setting['auto_logout_minutes'] ?? 15;
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
        <!-- Running Text Banner -->
        <div class="bg-emerald-900 text-emerald-100 p-2.5 rounded-xl text-xs font-bold shadow-sm overflow-hidden flex items-center gap-3">
            <span class="bg-emerald-800 text-white px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wider text-[10px]">Info Terbaru</span>
            <marquee behavior="scroll" direction="left" class="w-full font-medium"><?= htmlspecialchars($running_text) ?></marquee>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <img src="assets/img/kemenag-logo.png" class="w-14 h-14 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
                <div>
                    <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Kemenag Kab. Lebak</div>
                    <h1 class="text-xl font-black text-slate-900">SIMAGANG KEMENAG LEBAK</h1>
                    <p class="text-xs text-slate-600 font-medium">Unit Penugasan Seksi: <?= htmlspecialchars($student['tempat_penugasan']) ?></p>
                </div>
            </div>
            <div class="text-right text-xs">
                <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">Status: <?= htmlspecialchars($student['status']) ?></span>
            </div>
        </div>

        <div class="bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 rounded-2xl text-white shadow-md">
            <h2 class="text-lg font-bold">Selamat Datang, <?= htmlspecialchars($student['nama']) ?></h2>
            <p class="text-xs text-emerald-200 mt-1"><?= htmlspecialchars($student['program_keahlian']) ?> &bull; <?= htmlspecialchars($student['asal_sekolah']) ?></p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 class="font-bold text-sm text-slate-800 mb-2">Status Presensi Hari Ini (<?= date('d-m-Y') ?>)</h3>
            <?php if ($today_att): ?>
                <div class="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                    <div>
                        Tercatat <strong><?= htmlspecialchars($today_att['status']) ?></strong> (Masuk: <?= htmlspecialchars($today_att['jam_masuk']) ?> WIB &bull; Pulang: <?= htmlspecialchars($today_att['jam_pulang']) ?> WIB)
                    </div>
                    <a href="absensi_siswa.php" class="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm">Lihat Presensi</a>
                </div>
            <?php else: ?>
                <div class="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                    <div>
                        Anda belum mengisi presensi kehadiran hari ini. (Jadwal: Senin-Kamis 07:30 - 16:00 WIB | Jumat 07:30 - 16:30 WIB)
                    </div>
                    <a href="absensi_siswa.php" class="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm">Absen Sekarang &rarr;</a>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <!-- Auto Logout Timer Script -->
    <script>
        let inactivityTime = function () {
            let time;
            const timeoutMinutes = <?= (int)$auto_logout ?>;
            const timeoutMs = timeoutMinutes * 60 * 1000;

            window.onload = resetTimer;
            document.onmousemove = resetTimer;
            document.onkeypress = resetTimer;
            document.ontouchstart = resetTimer;

            function logout() {
                alert("Anda otomatis ter-logout dari SIMAGANG KEMENAG LEBAK karena tidak ada aktivitas selama " + timeoutMinutes + " menit.");
                window.location.href = 'logout.php';
            }

            function resetTimer() {
                clearTimeout(time);
                time = setTimeout(logout, timeoutMs);
            }
        };
        inactivityTime();
    </script>
</body>
</html>
