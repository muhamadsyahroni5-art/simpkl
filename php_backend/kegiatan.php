<?php
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
                                <button type="submit" name="status" value="Disetujui" class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10px]">Setujui</button>
                                <button type="submit" name="status" value="Ditolak" class="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold text-[10px]">Tolak</button>
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
