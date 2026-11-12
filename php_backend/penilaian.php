<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] === 'siswa') {
    header('Location: index.php');
    exit;
}

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_save_grade'])) {
    $student_id = (int)$_POST['student_id'];
    $disiplin = (float)$_POST['disiplin_waktu'];
    $tanggung_jawab = (float)$_POST['tanggung_jawab'];
    $kebersihan = (float)$_POST['kebersihan_kerapihan'];
    $kemampuan = (float)$_POST['kemampuan_kerja'];
    $kerjasama = (float)$_POST['kerjasama_tim'];
    $etika = (float)$_POST['etika_kesopanan'];

    $rata = ($disiplin + $tanggung_jawab + $kebersihan + $kemampuan + $kerjasama + $etika) / 6.0;
    $grade = $rata >= 90 ? 'A' : ($rata >= 80 ? 'B' : ($rata >= 70 ? 'C' : 'D'));
    $predikat = $grade === 'A' ? 'Sangat Baik' : ($grade === 'B' ? 'Baik' : ($grade === 'C' ? 'Cukup' : 'Kurang'));

    $stmtC = $pdo->prepare("SELECT id FROM assessments WHERE student_id = ?");
    $stmtC->execute([$student_id]);
    $exist = $stmtC->fetch();

    if ($exist) {
        $stmtU = $pdo->prepare("UPDATE assessments SET disiplin_waktu=?, tanggung_jawab=?, kebersihan_kerapihan=?, kemampuan_kerja=?, kerjasama_tim=?, etika_kesopanan=?, nilai_rata_rata=?, grade=?, predikat=? WHERE student_id=?");
        $stmtU->execute([$disiplin, $tanggung_jawab, $kebersihan, $kemampuan, $kerjasama, $etika, $rata, $grade, $predikat, $student_id]);
    } else {
        $stmtI = $pdo->prepare("INSERT INTO assessments (student_id, disiplin_waktu, tanggung_jawab, kebersihan_kerapihan, kemampuan_kerja, kerjasama_tim, etika_kesopanan, nilai_rata_rata, grade, predikat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtI->execute([$student_id, $disiplin, $tanggung_jawab, $kebersihan, $kemampuan, $kerjasama, $etika, $rata, $grade, $predikat]);
    }
    $msg = "Penilaian prestasi siswa berhasil disimpan! (Rata-rata: " . number_format($rata, 1) . " - Grade $grade)";
}

$students = $pdo->query("SELECT s.*, a.disiplin_waktu, a.tanggung_jawab, a.kebersihan_kerapihan, a.kemampuan_kerja, a.kerjasama_tim, a.etika_kesopanan, a.nilai_rata_rata, a.grade, a.predikat FROM students s LEFT JOIN assessments a ON s.id = a.student_id ORDER BY s.nama ASC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Penilaian Prestasi Siswa - SIMAGANG KEMENAG LEBAK</title>
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
                    <p class="text-[10px] text-emerald-300">Penilaian Prestasi</p>
                </div>
            </div>
            <nav class="space-y-1 text-xs font-semibold">
                <a href="dashboard_admin.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Dashboard</a>
                <a href="siswa.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Data Siswa</a>
                <a href="absensi.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Absensi &amp; Kirim WA</a>
                <a href="kegiatan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Kegiatan Harian</a>
                <a href="penilaian.php" class="block py-2.5 px-3 bg-emerald-800 text-white rounded-xl font-bold">Penilaian Siswa</a>
                <a href="laporan.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Cetak Laporan Resmi</a>
                <a href="users.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Manajemen User</a>
                <a href="running_text.php" class="block py-2.5 px-3 hover:bg-emerald-900 rounded-xl text-slate-300">Setting Running Text</a>
                <a href="logout.php" class="block py-2.5 px-3 hover:bg-rose-900/60 rounded-xl text-rose-300 mt-4">Keluar / Logout</a>
            </nav>
        </div>
    </aside>

    <main class="flex-1 p-6 max-w-7xl space-y-6">
        <h1 class="text-xl font-bold text-slate-900">Penilaian Prestasi Akhir (6 Aspek Penilaian)</h1>
        <?php if ($msg): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                    <tr>
                        <th class="p-3">Nama Siswa / NISN</th>
                        <th class="p-3">Asal Sekolah</th>
                        <th class="p-3">Nilai Rata-Rata</th>
                        <th class="p-3">Grade</th>
                        <th class="p-3">Predikat</th>
                        <th class="p-3 text-center">Aksi Input / Cetak</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($students as $s): ?>
                    <tr>
                        <td class="p-3 font-bold text-slate-900"><?= htmlspecialchars($s['nama']) ?></td>
                        <td class="p-3 text-slate-700"><?= htmlspecialchars($s['asal_sekolah']) ?></td>
                        <td class="p-3 font-mono text-base font-bold text-emerald-800"><?= $s['nilai_rata_rata'] ? number_format($s['nilai_rata_rata'], 1) : '-' ?></td>
                        <td class="p-3 font-bold"><?= $s['grade'] ?? '-' ?></td>
                        <td class="p-3 font-semibold text-slate-700"><?= $s['predikat'] ?? '-' ?></td>
                        <td class="p-3 text-center space-x-1">
                            <button onclick='openGradeModal(<?= json_encode($s) ?>)' class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] cursor-pointer">Input / Edit Nilai</button>
                            <?php if ($s['nilai_rata_rata']): ?>
                                <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=penilaian" target="_blank" class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] inline-block">Cetak Lembar Nilai</a>
                                <?php if (in_array($_SESSION['role'], ['superadmin', 'admin'])): ?>
                                    <a href="cetak_dokumen.php?id=<?= $s['id'] ?>&tipe=sertifikat_magang&lembar=all" target="_blank" class="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-[10px] inline-block">Cetak Sertifikat</a>
                                <?php endif; ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal Form Penilaian 6 Aspek -->
    <div id="gradeModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 id="gradeModalTitle" class="font-bold text-sm text-slate-900">Form Penilaian Prestasi Siswa</h3>
                <button onclick="closeGradeModal()" class="text-slate-400 font-bold hover:text-slate-600 text-base">&times;</button>
            </div>
            <form method="POST" action="" class="space-y-3">
                <input type="hidden" name="action_save_grade" value="1">
                <input type="hidden" name="student_id" id="g_student_id" value="0">

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">1. Kedisiplinan &amp; Ketepatan Waktu (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="disiplin_waktu" id="g_disiplin" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">2. Tanggung Jawab Pekerjaan (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="tanggung_jawab" id="g_tj" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">3. Kebersihan &amp; Kerapihan (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="kebersihan_kerapihan" id="g_kebersihan" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">4. Kemampuan &amp; Hasil Kerja (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="kemampuan_kerja" id="g_kemampuan" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">5. Kerjasama Dalam Tim (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="kerjasama_tim" id="g_kerjasama" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">6. Etika, Sopan Santun &amp; Akhlak (0-100)</label>
                        <input type="number" step="0.1" min="0" max="100" name="etika_kesopanan" id="g_etika" value="85" required class="w-full px-3 py-2 border rounded-xl font-mono">
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t">
                    <button type="button" onclick="closeGradeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">Batal</button>
                    <button type="submit" class="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan Penilaian</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openGradeModal(student) {
            document.getElementById('gradeModalTitle').innerText = "Input Penilaian: " + student.nama;
            document.getElementById('g_student_id').value = student.id;
            document.getElementById('g_disiplin').value = student.disiplin_waktu || 85;
            document.getElementById('g_tj').value = student.tanggung_jawab || 85;
            document.getElementById('g_kebersihan').value = student.kebersihan_kerapihan || 85;
            document.getElementById('g_kemampuan').value = student.kemampuan_kerja || 85;
            document.getElementById('g_kerjasama').value = student.kerjasama_tim || 85;
            document.getElementById('g_etika').value = student.etika_kesopanan || 85;
            document.getElementById('gradeModal').classList.remove('hidden');
        }

        function closeGradeModal() {
            document.getElementById('gradeModal').classList.add('hidden');
        }
    </script>
</body>
</html>
