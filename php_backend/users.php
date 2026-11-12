<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'super_admin') {
    header('Location: index.php');
    exit;
}

$msg = '';

// Handle Delete User
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $del_id = (int)$_GET['id'];
    $stmtD = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmtD->execute([$del_id]);
    header('Location: users.php?msg=Akun+user+berhasil+dihapus!');
    exit;
}

if (isset($_GET['msg'])) {
    $msg = $_GET['msg'];
}

// Handle Add User
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_add_user'])) {
    $nama = trim($_POST['nama']);
    $nip = trim($_POST['nip']);
    $username = trim($_POST['username']);
    $password = md5(trim($_POST['password']));
    $jabatan = trim($_POST['jabatan']);
    $seksi = $_POST['seksi'];
    $role = $_POST['role'];
    $no_hp = trim($_POST['no_hp']);
    $email = trim($_POST['email']);

    $stmt = $pdo->prepare("INSERT INTO users (nama, nip, username, password, jabatan, seksi, role, no_hp, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nama, $nip, $username, $password, $jabatan, $seksi, $role, $no_hp, $email]);
    $msg = "Akun user $nama berhasil dibuat!";
}

$users = $pdo->query("SELECT * FROM users ORDER BY id DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manajemen User - SIMAGANG KEMENAG LEBAK</title>
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
                    <p class="text-[10px] text-emerald-300">Manajemen User Admin</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-xl font-bold text-slate-900">Manajemen Akun Admin &amp; Pembimbing Seksi</h1>
                <p class="text-xs text-slate-500">Kelola pengguna dengan berbagai hak akses peran</p>
            </div>
            <button onclick="openUserModal()" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md">
                + Tambah User Admin Baru
            </button>
        </div>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama &amp; NIP</th>
                        <th class="p-3">Username</th>
                        <th class="p-3">Jabatan &amp; Seksi</th>
                        <th class="p-3">Role Hak Akses</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($users as $u): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($u['nama']) ?><br><span class="font-mono text-[10px] text-slate-500">NIP: <?= htmlspecialchars($u['nip']) ?></span></td>
                        <td class="p-3 font-mono font-bold text-emerald-800"><?= htmlspecialchars($u['username']) ?></td>
                        <td class="p-3 font-medium text-slate-700"><?= htmlspecialchars($u['jabatan']) ?> &bull; <?= htmlspecialchars($u['seksi']) ?></td>
                        <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase"><?= $u['role'] ?></span></td>
                        <td class="p-3 text-center">
                            <?php if ($u['username'] !== 'superadmin'): ?>
                                <a href="users.php?action=delete&id=<?= $u['id'] ?>" onclick="return confirm('Yakin menghapus user ini?')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]">Hapus</a>
                            <?php else: ?>
                                <span class="text-[10px] text-slate-400 font-bold">Utama</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal Form Tambah User Admin -->
    <div id="userModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 class="font-bold text-sm text-slate-900">Tambah Akun Admin Baru</h3>
                <button onclick="closeUserModal()" class="text-slate-400 font-bold hover:text-slate-600 text-base">&times;</button>
            </div>
            <form method="POST" action="" class="space-y-3">
                <input type="hidden" name="action_add_user" value="1">

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input type="text" name="nama" required class="w-full px-3 py-2 border rounded-xl font-medium">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">NIP *</label>
                        <input type="text" name="nip" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Username *</label>
                        <input type="text" name="username" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Password *</label>
                    <input type="password" name="password" required class="w-full px-3 py-2 border rounded-xl">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Jabatan *</label>
                    <input type="text" name="jabatan" required placeholder="Contoh: Pembimbing Seksi" class="w-full px-3 py-2 border rounded-xl">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Seksi Penugasan *</label>
                    <select name="seksi" class="w-full px-3 py-2 border rounded-xl font-bold bg-white">
                        <option value="Semua Subbag / Seksi">Semua Subbag / Seksi</option>
                        <?php foreach ($SUBBAG_SEKSI_OPTIONS as $opt): ?>
                            <option value="<?= htmlspecialchars($opt) ?>"><?= htmlspecialchars($opt) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Role Hak Akses *</label>
                    <select name="role" class="w-full px-3 py-2 border rounded-xl font-bold bg-white">
                        <option value="admin">Admin Subbag/Kantor</option>
                        <option value="admin_seksi">Admin Seksi Khusus</option>
                        <option value="opr_pembimbing">Operator / Pembimbing</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">No. HP *</label>
                        <input type="text" name="no_hp" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t">
                    <button type="button" onclick="closeUserModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">Batal</button>
                    <button type="submit" class="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan Akun</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openUserModal() { document.getElementById('userModal').classList.remove('hidden'); }
        function closeUserModal() { document.getElementById('userModal').classList.add('hidden'); }
    </script>
</body>
</html>
