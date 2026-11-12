<?php
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

    // Cek bentrok jam pada tanggal yang sama
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

// Check if any unapproved activities exist for alert
$stmtPending = $pdo->prepare("SELECT COUNT(*) FROM activities WHERE student_id = ? AND status_verifikasi != 'Disetujui'");
$stmtPending->execute([$student_id]);
$has_unapproved = $stmtPending->fetchColumn() > 0;

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
    <aside class="w-64 bg-emerald-950 text-white p-4 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800">
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
        <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-slate-900">Input Jurnal Kegiatan Harian (Format 24 Jam)</h1>
            <button onclick="handlePrintPreview()" class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
                Pratinjau &amp; Cetak Jurnal Kegiatan
            </button>
        </div>

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
                    <textarea name="uraian_kegiatan" rows="2" required placeholder="Tuliskan uraian pekerjaan yang dilakukan..." class="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"></textarea>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Output / Hasil Kegiatan *</label>
                    <input type="text" name="output_kegiatan" required placeholder="Contoh: Terinput 20 data berkas" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium">
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
                        <th class="p-3">Tanggal &amp; Waktu</th>
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
                        <td class="p-3">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $act['status_verifikasi'] === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' : ($act['status_verifikasi'] === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800') ?>">
                                <?= $act['status_verifikasi'] ?>
                            </span>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <script>
        function handlePrintPreview() {
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
