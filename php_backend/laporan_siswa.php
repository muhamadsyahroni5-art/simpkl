<?php
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

// Check unapproved kegiatan
$stmtPending = $pdo->prepare("SELECT COUNT(*) FROM activities WHERE student_id = ? AND status_verifikasi != 'Disetujui'");
$stmtPending->execute([$student_id]);
$has_unapproved = $stmtPending->fetchColumn() > 0;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan &amp; Nilai Saya - SIMAGANG KEMENAG LEBAK</title>
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
        <h1 class="text-xl font-bold text-slate-900">Laporan &amp; Sertifikat Penilaian Saya</h1>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 class="font-bold text-sm text-slate-800 border-b pb-2">Cetak Dokumen Laporan Resmi Saya</h2>
            <div class="flex flex-wrap gap-3">
                <a href="cetak_dokumen.php?id=<?= $student_id ?>&tipe=sertifikat" target="_blank" class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md">
                    Cetak Sertifikat Magang (Bolak-Balik 2 Lembar)
                </a>
                <button disabled title="User siswa hanya bisa melihat nilai (tidak bisa cetak nilai)" class="px-4 py-2.5 bg-slate-200 text-slate-500 border border-slate-300 rounded-xl text-xs font-bold cursor-not-allowed opacity-80">
                    Cetak Lembar Nilai (Disabled)
                </button>
                <button onclick="handlePrintActivities()" class="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
                    Cetak Laporan Jurnal Kegiatan Harian
                </button>
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

    <script>
        function handlePrintActivities() {
            const hasUnapproved = <?= $has_unapproved ? 'true' : 'false' ?>;
            if (hasUnapproved) {
                alert("Ada kegiatan yang belum di verifikasi/disetujui, silakan hubungi Pembimbing anda!");
            } else {
                window.open('cetak_dokumen.php?id=<?= $student_id ?>&tipe=kegiatan', '_blank');
            }
        }
    </script>
</body>
</html>
