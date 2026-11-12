<?php
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
$setting = $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
$running_text = $setting['running_text'] ?? 'Selamat Datang di SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang) Kantor Kementerian Agama Kabupaten Lebak';
$auto_logout = $setting['auto_logout_minutes'] ?? 15;
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
        <!-- Running Text Banner -->
        <div class="bg-emerald-900 text-emerald-100 p-2.5 rounded-xl mb-6 text-xs font-bold shadow-sm overflow-hidden flex items-center gap-3">
            <span class="bg-emerald-800 text-white px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wider text-[10px]">Info Terbaru</span>
            <marquee behavior="scroll" direction="left" class="w-full font-medium"><?= htmlspecialchars($running_text) ?></marquee>
        </div>

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
                <p class="text-[11px] text-slate-400 mt-1">Format 24 Jam Tercatat</p>
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
