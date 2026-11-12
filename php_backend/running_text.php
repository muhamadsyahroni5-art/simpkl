<?php
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
                <img src="assets/img/kemenag-logo.png" class="w-10 h-10 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
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
                    <label class="block font-bold text-slate-800 mb-1">Teks Pengumuman Berjalan (Running Text Marquee):</label>
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
