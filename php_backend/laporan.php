<?php
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
                            <th class="p-3 text-center">Cetak Lembar Nilai Kop Surat</th>
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
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=sertifikat" target="_blank" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs inline-block shadow-xs">
                                    Cetak Sertifikat (2 Hal)
                                </a>
                            </td>
                            <td class="p-3 text-center">
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=penilaian" target="_blank" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs inline-block shadow-xs">
                                    Cetak Nilai Kop Surat
                                </a>
                            </td>
                            <td class="p-3 text-center">
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=kegiatan" target="_blank" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs inline-block shadow-xs">
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
