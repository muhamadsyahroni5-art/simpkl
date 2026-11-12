<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['super_admin', 'admin'])) {
    header('Location: index.php');
    exit;
}

$msg = '';

// Handle save GPS config
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_save_gps'])) {
    $is_enabled = isset($_POST['is_enabled']) ? 1 : 0;
    $latitude = (float)$_POST['latitude'];
    $longitude = (float)$_POST['longitude'];
    $radius_meters = (int)$_POST['radius_meters'];
    $office_name = trim($_POST['office_name'] ?? 'Kantor Kementerian Agama Kabupaten Lebak');
    $office_address = trim($_POST['office_address'] ?? 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314');

    $stmt = $pdo->prepare("INSERT INTO gps_config (id, is_enabled, latitude, longitude, radius_meters, office_name, office_address) 
                           VALUES (1, ?, ?, ?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE is_enabled=?, latitude=?, longitude=?, radius_meters=?, office_name=?, office_address=?");
    $stmt->execute([$is_enabled, $latitude, $longitude, $radius_meters, $office_name, $office_address,
                    $is_enabled, $latitude, $longitude, $radius_meters, $office_name, $office_address]);

    $msg = "Pengaturan titik koordinat dan radius geofencing GPS berhasil disimpan!";
}

// Fetch current GPS config
$gps = $pdo->query("SELECT * FROM gps_config WHERE id = 1")->fetch();
if (!$gps) {
    $gps = [
        'is_enabled' => 1,
        'latitude' => -6.367910,
        'longitude' => 106.268530,
        'radius_meters' => 100,
        'office_name' => 'Kantor Kementerian Agama Kabupaten Lebak',
        'office_address' => 'Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314'
    ];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pengaturan GPS Kantor - SIMAGANG LEBAK</title>
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
                    <p class="text-[10px] text-emerald-300">Pengaturan GPS Kantor</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="gps_config.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Setting Titik GPS</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-5xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Pengaturan Titik Koordinat Kantor &amp; Radius GPS</h1>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <form method="POST" action="" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <input type="hidden" name="action_save_gps" value="1">
                
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <span class="font-bold text-slate-800 block">Saklar Status Validasi GPS (On/Off)</span>
                        <span class="text-[11px] text-slate-500">Aktifkan batas radius absensi siswa</span>
                    </div>
                    <input type="checkbox" name="is_enabled" value="1" <?= $gps['is_enabled'] ? 'checked' : '' ?> class="w-5 h-5 accent-emerald-600 cursor-pointer">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Latitude / Lintang (-6.36791) *</label>
                    <input type="number" step="0.00001" name="latitude" value="<?= $gps['latitude'] ?>" required class="w-full px-3 py-2 border rounded-xl font-mono font-bold">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Longitude / Bujur (106.26853) *</label>
                    <input type="number" step="0.00001" name="longitude" value="<?= $gps['longitude'] ?>" required class="w-full px-3 py-2 border rounded-xl font-mono font-bold">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Radius Jangkauan Absensi (Meter) *</label>
                    <input type="number" name="radius_meters" value="<?= $gps['radius_meters'] ?>" required class="w-full px-3 py-2 border rounded-xl font-bold">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nama Kantor / Institusi *</label>
                    <input type="text" name="office_name" value="<?= htmlspecialchars($gps['office_name']) ?>" required class="w-full px-3 py-2 border rounded-xl">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Alamat Kantor *</label>
                    <input type="text" name="office_address" value="<?= htmlspecialchars($gps['office_address']) ?>" required class="w-full px-3 py-2 border rounded-xl">
                </div>

                <button type="submit" class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md w-full">
                    Simpan Pengaturan Koordinat GPS
                </button>
            </form>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 class="font-bold text-slate-800 text-sm">Pratinjau Peta Lokasi Kantor</h3>
                <div class="w-full h-80 rounded-xl overflow-hidden border border-slate-300">
                    <iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=<?= $gps['latitude'] ?>,<?= $gps['longitude'] ?>&z=17&output=embed"></iframe>
                </div>
                <div class="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 border border-emerald-200">
                    <strong>Status Geofencing:</strong> <?= $gps['is_enabled'] ? 'AKTIF (Siswa Wajib Berada Dalam Radius '.$gps['radius_meters'].'m)' : 'NONAKTIF (Absensi Bebas Dari Mana Saja)' ?>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
