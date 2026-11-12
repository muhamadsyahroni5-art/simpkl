<?php
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
                <button type="submit" class="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">Tampilkan Data</button>
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
