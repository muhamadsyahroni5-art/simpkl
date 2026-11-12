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

$msg = '';
$err = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $del_id = (int)$_GET['id'];
    $stmtD = $pdo->prepare("DELETE FROM students WHERE id = ?");
    $stmtD->execute([$del_id]);
    header('Location: siswa.php?msg=Data+siswa+berhasil+dihapus!');
    exit;
}

if (isset($_GET['msg'])) {
    $msg = $_GET['msg'];
}

// Handle Add & Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action_save'])) {
        $id = (int)($_POST['id'] ?? 0);
        $nama = trim($_POST['nama']);
        $nisn = trim($_POST['nisn']);
        $username = trim($_POST['username']);
        $password_raw = trim($_POST['password'] ?? '');
        $tempat_lahir = trim($_POST['tempat_lahir']);
        $tanggal_lahir = $_POST['tanggal_lahir'];
        $kelas = trim($_POST['kelas']);
        $program_keahlian = trim($_POST['program_keahlian']);
        $no_hp = trim($_POST['no_hp']);
        $asal_sekolah = trim($_POST['asal_sekolah']);
        $pembimbing_sekolah = trim($_POST['pembimbing_sekolah']);
        $no_hp_pembimbing = trim($_POST['no_hp_pembimbing']);
        $alamat = trim($_POST['alamat']);
        $tempat_penugasan = $is_restricted ? $user_seksi : $_POST['tempat_penugasan'];
        $pembimbing_kantor = trim($_POST['pembimbing_kantor']);
        $nip_pembimbing = trim($_POST['nip_pembimbing'] ?? '197405122003121002');

        if ($id > 0) {
            // Edit Student
            if (!empty($password_raw)) {
                $pass_hash = md5($password_raw);
                $stmt = $pdo->prepare("UPDATE students SET nama=?, nisn=?, username=?, password=?, tempat_lahir=?, tanggal_lahir=?, kelas=?, program_keahlian=?, no_hp=?, asal_sekolah=?, pembimbing_sekolah=?, no_hp_pembimbing=?, alamat=?, tempat_penugasan=?, pembimbing_kantor=?, nip_pembimbing=? WHERE id=?");
                $stmt->execute([$nama, $nisn, $username, $pass_hash, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE students SET nama=?, nisn=?, username=?, tempat_lahir=?, tanggal_lahir=?, kelas=?, program_keahlian=?, no_hp=?, asal_sekolah=?, pembimbing_sekolah=?, no_hp_pembimbing=?, alamat=?, tempat_penugasan=?, pembimbing_kantor=?, nip_pembimbing=? WHERE id=?");
                $stmt->execute([$nama, $nisn, $username, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing, $id]);
            }
            $msg = "Data siswa $nama berhasil diperbarui!";
        } else {
            // Add Student
            $pass_hash = md5(!empty($password_raw) ? $password_raw : 'siswa123');
            $stmt = $pdo->prepare("INSERT INTO students (nama, nisn, username, password, tempat_lahir, tanggal_lahir, kelas, program_keahlian, no_hp, asal_sekolah, pembimbing_sekolah, no_hp_pembimbing, alamat, tempat_penugasan, pembimbing_kantor, nip_pembimbing, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')");
            $stmt->execute([$nama, $nisn, $username, $pass_hash, $tempat_lahir, $tanggal_lahir, $kelas, $program_keahlian, $no_hp, $asal_sekolah, $pembimbing_sekolah, $no_hp_pembimbing, $alamat, $tempat_penugasan, $pembimbing_kantor, $nip_pembimbing]);
            $msg = "Siswa baru $nama berhasil ditambahkan!";
        }
    }
}

// Fetch Students List
$sql = "SELECT * FROM students";
$params = [];
if ($is_restricted) {
    $sql .= " WHERE tempat_penugasan = ?";
    $params[] = $user_seksi;
}
$sql .= " ORDER BY id DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Siswa Magang - SIMAGANG KEMENAG LEBAK</title>
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
                    <p class="text-[10px] text-emerald-300">Data Siswa PKL</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
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
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-xl font-bold text-slate-900">Manajemen Data Siswa Magang / PKL</h1>
                <p class="text-xs text-slate-500">Kantor Kementerian Agama Kabupaten Lebak</p>
            </div>
            <button onclick="openFormModal()" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2">
                + Tambah Siswa Baru
            </button>
        </div>

        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 class="font-bold text-sm text-slate-800">Daftar Siswa (Total: <?= count($students) ?>)</h2>
            </div>
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa / NISN</th>
                        <th class="p-3">Asal Sekolah</th>
                        <th class="p-3">Program Keahlian</th>
                        <th class="p-3">Penugasan Seksi</th>
                        <th class="p-3">Pembimbing Kantor</th>
                        <th class="p-3">No. HP</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($students as $s): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900">
                            <?= htmlspecialchars($s['nama']) ?><br>
                            <span class="font-mono text-[10px] text-slate-500">NISN: <?= htmlspecialchars($s['nisn']) ?></span>
                        </td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['program_keahlian']) ?></td>
                        <td class="p-3 font-semibold text-emerald-800"><?= htmlspecialchars($s['tempat_penugasan']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['pembimbing_kantor']) ?></td>
                        <td class="p-3 font-mono text-slate-600"><?= htmlspecialchars($s['no_hp']) ?></td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick='editStudent(<?= json_encode($s) ?>)' class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[10px]">Edit</button>
                            <a href="siswa.php?action=delete&id=<?= $s['id'] ?>" onclick="return confirm('Yakin menghapus data siswa ini?')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]">Hapus</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal Form Input/Edit Siswa -->
    <div id="studentModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 id="modalTitle" class="font-bold text-base text-slate-900">Tambah Siswa Magang Baru</h3>
                <button onclick="closeFormModal()" class="text-slate-400 font-bold hover:text-slate-600 text-base">&times;</button>
            </div>
            <form method="POST" action="" class="space-y-3">
                <input type="hidden" name="action_save" value="1">
                <input type="hidden" name="id" id="student_id" value="0">

                <!-- Foto Siswa File Upload -->
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-3">
                    <label class="block font-bold text-slate-700">Foto Siswa Pas Foto 3x4 (Upload File Gambar)</label>
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-18 rounded-lg border border-slate-300 overflow-hidden bg-white shrink-0">
                            <img id="s_photo_preview" src="assets/img/default-avatar.png" alt="Preview 3x4" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 space-y-1">
                            <input type="file" id="s_photo_file" accept="image/*" onchange="previewPhotoFile(this)" class="w-full text-xs border rounded-lg p-1.5 bg-white cursor-pointer">
                            <input type="hidden" name="photo" id="s_photo" value="assets/img/default-avatar.png">
                            <p class="text-[10px] text-slate-500">Pilih file gambar dari komputer/HP (JPG, PNG, WEBP).</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                        <input type="text" name="nama" id="s_nama" required class="w-full px-3 py-2 border rounded-xl font-medium">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">NISN / NIM *</label>
                        <input type="text" name="nisn" id="s_nisn" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Username Login *</label>
                        <input type="text" name="username" id="s_username" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Password (Kosongkan jika tak diubah)</label>
                        <input type="password" name="password" placeholder="Password siswa" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Tempat Lahir *</label>
                        <input type="text" name="tempat_lahir" id="s_tempat_lahir" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
                        <input type="date" name="tanggal_lahir" id="s_tanggal_lahir" value="2006-01-01" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Kelas *</label>
                        <input type="text" name="kelas" id="s_kelas" placeholder="Contoh: XII TKJ 1" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Program Keahlian *</label>
                        <input type="text" name="program_keahlian" id="s_program_keahlian" placeholder="Contoh: Teknik Komputer" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Asal Sekolah / Kampus *</label>
                        <input type="text" name="asal_sekolah" id="s_asal_sekolah" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">No. HP Siswa *</label>
                        <input type="text" name="no_hp" id="s_no_hp" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Pembimbing Sekolah *</label>
                        <input type="text" name="pembimbing_sekolah" id="s_pembimbing_sekolah" required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">No. HP Pembimbing Sekolah *</label>
                        <input type="text" name="no_hp_pembimbing" id="s_no_hp_pembimbing" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Tempat Penugasan Seksi Kemenag *</label>
                    <select name="tempat_penugasan" id="s_tempat_penugasan" class="w-full px-3 py-2 border rounded-xl font-bold bg-white">
                        <?php foreach ($SUBBAG_SEKSI_OPTIONS as $opt): ?>
                            <option value="<?= htmlspecialchars($opt) ?>"><?= htmlspecialchars($opt) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Pembimbing Kantor Kemenag *</label>
                        <input type="text" name="pembimbing_kantor" id="s_pembimbing_kantor" value="Dian Permana, S.Kom." required class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">NIP Pembimbing Kantor *</label>
                        <input type="text" name="nip_pembimbing" id="s_nip_pembimbing" value="199104192019031006" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal *</label>
                    <textarea name="alamat" id="s_alamat" rows="2" required class="w-full px-3 py-2 border rounded-xl"></textarea>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t">
                    <button type="button" onclick="closeFormModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">Batal</button>
                    <button type="submit" class="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan Data Siswa</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function previewPhotoFile(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('s_photo_preview').src = e.target.result;
                    document.getElementById('s_photo').value = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        function openFormModal() {
            document.getElementById('modalTitle').innerText = "Tambah Siswa Magang Baru";
            document.getElementById('student_id').value = "0";
            document.getElementById('s_nama').value = "";
            document.getElementById('s_nisn').value = "";
            document.getElementById('s_username').value = "";
            document.getElementById('s_tempat_lahir').value = "";
            document.getElementById('s_tanggal_lahir').value = "2006-01-01";
            document.getElementById('s_kelas').value = "";
            document.getElementById('s_program_keahlian').value = "";
            document.getElementById('s_asal_sekolah').value = "";
            document.getElementById('s_no_hp').value = "";
            document.getElementById('s_pembimbing_sekolah').value = "";
            document.getElementById('s_no_hp_pembimbing').value = "";
            document.getElementById('s_pembimbing_kantor').value = "Dian Permana, S.Kom.";
            document.getElementById('s_nip_pembimbing').value = "199104192019031006";
            document.getElementById('s_alamat').value = "";
            document.getElementById('s_photo_preview').src = "assets/img/default-avatar.png";
            document.getElementById('s_photo').value = "assets/img/default-avatar.png";
            if (document.getElementById('s_photo_file')) { document.getElementById('s_photo_file').value = ""; }
            document.getElementById('studentModal').classList.remove('hidden');
        }

        function closeFormModal() {
            document.getElementById('studentModal').classList.add('hidden');
        }

        function editStudent(data) {
            document.getElementById('modalTitle').innerText = "Edit Data Siswa: " + data.nama;
            document.getElementById('student_id').value = data.id;
            document.getElementById('s_nama').value = data.nama;
            document.getElementById('s_nisn').value = data.nisn;
            document.getElementById('s_username').value = data.username;
            document.getElementById('s_tempat_lahir').value = data.tempat_lahir;
            document.getElementById('s_tanggal_lahir').value = data.tanggal_lahir;
            document.getElementById('s_kelas').value = data.kelas;
            document.getElementById('s_program_keahlian').value = data.program_keahlian;
            document.getElementById('s_asal_sekolah').value = data.asal_sekolah;
            document.getElementById('s_no_hp').value = data.no_hp;
            document.getElementById('s_pembimbing_sekolah').value = data.pembimbing_sekolah;
            document.getElementById('s_no_hp_pembimbing').value = data.no_hp_pembimbing;
            document.getElementById('s_tempat_penugasan').value = data.tempat_penugasan;
            document.getElementById('s_pembimbing_kantor').value = data.pembimbing_kantor;
            document.getElementById('s_nip_pembimbing').value = data.nip_pembimbing;
            document.getElementById('s_alamat').value = data.alamat;
            document.getElementById('s_photo_preview').src = data.photo || "assets/img/default-avatar.png";
            document.getElementById('s_photo').value = data.photo || "assets/img/default-avatar.png";
            if (document.getElementById('s_photo_file')) { document.getElementById('s_photo_file').value = ""; }
            document.getElementById('studentModal').classList.remove('hidden');
        }
    </script>
</body>
</html>
