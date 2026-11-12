<?php
session_start();
require_once 'config/koneksi.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$id = (int)($_GET['id'] ?? 0);
$tipe = $_GET['tipe'] ?? 'penilaian';
$lembar = $_GET['lembar'] ?? 'all'; // '1', '2', or 'all'

$stmtS = $pdo->prepare("SELECT * FROM students WHERE id = ?");
$stmtS->execute([$id]);
$student = $stmtS->fetch();

if (!$student) {
    echo "Data siswa tidak ditemukan!";
    exit;
}

$stmtAss = $pdo->prepare("SELECT * FROM assessments WHERE student_id = ?");
$stmtAss->execute([$id]);
$ass = $stmtAss->fetch();

$stmtAct = $pdo->prepare("SELECT * FROM activities WHERE student_id = ? ORDER BY tanggal ASC, jam_mulai ASC");
$stmtAct->execute([$id]);
$activities = $stmtAct->fetchAll();

$doc_no = "B-{$student['nisn']}/Kk.28.02.1/KS.00/" . date('m/Y');
$today_str = date('d F Y');

$n_disiplin = (float)($ass['disiplin_waktu'] ?? 90);
$n_tanggung = (float)($ass['tanggung_jawab'] ?? 90);
$n_kebersihan = (float)($ass['kebersihan_kerapihan'] ?? 89);
$n_kemampuan = (float)($ass['kemampuan_kerja'] ?? 92);
$n_kerjasama = (float)($ass['kerjasama_tim'] ?? 92);
$n_etika = (float)($ass['etika_kesopanan'] ?? 89);
$n_rata = (float)($ass['nilai_rata_rata'] ?? (($n_disiplin + $n_tanggung + $n_kebersihan + $n_kemampuan + $n_kerjasama + $n_etika) / 6));

function getGradeLetter($val) {
    if ($val >= 90) return 'A';
    if ($val >= 80) return 'B';
    if ($val >= 70) return 'C';
    return 'D';
}

function getPredikatName($val) {
    if ($val >= 90) return 'SANGAT BAIK';
    if ($val >= 80) return 'BAIK';
    if ($val >= 70) return 'CUKUP';
    return 'KURANG';
}

$grade_akhir = $ass['grade'] ?? getGradeLetter($n_rata);
$predikat_akhir = getPredikatName($n_rata);
$is_sertifikat = ($tipe === 'sertifikat' || $tipe === 'sertifikat_magang');
$is_lulus = ($n_rata >= 70);

function render_certificate_qrcode($nama, $nisn, $tgl) {
    $payload = "{$nama} | {$nisn} | {$tgl}";
    $size = 21;
    $cellSize = 100 / $size;
    $rects = "";

    for ($r = 0; $r < $size; $r++) {
        for ($c = 0; $c < $size; $c++) {
            $isBit = false;
            if ($r <= 6 && $c <= 6) {
                if (($r === 0 || $r === 6 || $c === 0 || $c === 6) || ($r >= 2 && $r <= 4 && $c >= 2 && $c <= 4)) $isBit = true;
            } else if ($r <= 6 && $c >= 14) {
                $c2 = $c - 14;
                if (($r === 0 || $r === 6 || $c2 === 0 || $c2 === 6) || ($r >= 2 && $r <= 4 && $c2 >= 2 && $c2 === 4)) $isBit = true;
            } else if ($r >= 14 && $c <= 6) {
                $r2 = $r - 14;
                if (($r2 === 0 || $r2 === 6 || $c === 0 || $c === 6) || ($r2 >= 2 && $r2 <= 4 && $c === 2 && $c === 4)) $isBit = true;
            } else if ($r === 6) {
                $isBit = ($c % 2 === 0);
            } else if ($c === 6) {
                $isBit = ($r % 2 === 0);
            } else if (($r === 8 && ($c <= 8 || $c >= 13)) || ($c === 8 && ($r <= 8 || $r >= 13))) {
                $isBit = (($r + $c) % 3 === 0);
            } else if ($r >= 14 && $r <= 18 && $c >= 14 && $c <= 18) {
                $r2 = $r - 14; $c2 = $c - 14;
                if ($r2 === 0 || $r2 === 4 || $c2 === 0 || $c2 === 4 || ($r2 === 2 && $c2 === 2)) $isBit = true;
            } else {
                $hash = 0;
                $len = strlen($payload);
                for ($i = 0; $i < $len; $i++) {
                    $hash = (($hash << 5) - $hash + ord($payload[$i]) * ($r * 21 + $c + 1)) & 0xFFFFFFF;
                }
                $val = abs(($hash ^ ($r * 31 + $c * 17)) % 100);
                $isBit = ($val > 42);
            }

            if ($isBit) {
                $x = number_format($c * $cellSize, 2, '.', '');
                $y = number_format($r * $cellSize, 2, '.', '');
                $w = number_format($cellSize, 2, '.', '');
                $rects .= "<rect x='{$x}' y='{$y}' width='{$w}' height='{$w}' fill='#0F172A'/>";
            }
        }
    }

    return "<svg class='w-10 h-10 shrink-0' viewBox='0 0 100 100' fill='none' aria-label='QR Code Verifikasi: ".htmlspecialchars($payload)."'>"
         . "<rect width='100' height='100' rx='6' fill='#F8FAFC' stroke='#CBD5E1' stroke-width='2'/>"
         . $rects
         . "</svg>";
}

function render_certificate_barcode($nama, $nisn, $tgl) {
    $str = $nisn . $nama . $tgl;
    $rects = "<rect width='160' height='50' fill='#FFFFFF'/>";
    $rects .= "<rect x='6' y='5' width='2' height='40' fill='#000000'/>";
    $rects .= "<rect x='9' y='5' width='1' height='40' fill='#000000'/>";
    $currX = 12;
    $len = strlen($str);
    for ($i = 0; $i < $len && $currX < 145; $i++) {
        $code = ord($str[$i]);
        $w = ($code % 4) + 1;
        $gap = (($code * 3) % 3) + 1;
        $rects .= "<rect x='{$currX}' y='5' width='{$w}' height='40' fill='#000000'/>";
        $currX += ($w + $gap);
    }
    $rects .= "<rect x='148' y='5' width='2' height='40' fill='#000000'/>";
    $rects .= "<rect x='152' y='5' width='2' height='40' fill='#000000'/>";
    return "<svg class='h-10 w-32 shrink-0' viewBox='0 0 160 50' aria-label='Barcode Verifikasi: ".htmlspecialchars($nama)." ".htmlspecialchars($nisn)."'>"
         . $rects
         . "</svg>";
}

// Sertifikat magang hanya dapat dicetak oleh super_admin dan admin
if ($is_sertifikat && !in_array($_SESSION['role'] ?? '', ['super_admin', 'admin'])) {
    die("
    <!DOCTYPE html>
    <html lang='id'>
    <head><meta charset='UTF-8'><title>Akses Dibatasi</title><script src='https://cdn.tailwindcss.com'></script></head>
    <body class='bg-slate-100 flex items-center justify-center min-h-screen p-4 font-sans'>
        <div class='bg-white p-8 rounded-2xl shadow-xl border border-rose-200 max-w-md w-full text-center space-y-4'>
            <div class='w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold'>!</div>
            <h2 class='text-lg font-bold text-slate-900'>Akses Cetak Dibatasi</h2>
            <p class='text-xs text-slate-600 leading-relaxed'>Dokumen Sertifikat Magang Resmi hanya dapat dicetak oleh <strong>Super Admin</strong> dan <strong>Admin Subbag TU</strong>.</p>
            <button onclick='window.close()' class='px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer'>Tutup Halaman</button>
        </div>
    </body>
    </html>
    ");
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Dokumen - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #000; }
        @media print {
            .no-print { display: none !important; }
            @page { size: A4 portrait !important; margin: 0.8cm !important; }
            .page-break { page-break-before: always; break-before: page; }
        }
    </style>
</head>
<body class="p-6 max-w-4xl mx-auto space-y-6">

    <div class="no-print flex flex-wrap justify-between items-center bg-slate-900 text-white p-4 rounded-xl mb-6 shadow-md gap-3">
        <div>
            <h2 class="font-bold text-sm">Pratinjau Cetak Dokumen Resmi Kemenag Lebak</h2>
            <p class="text-xs text-slate-400">
                <?= $is_sertifikat ? 'Format Cetak Sertifikat A4 Portrait (21 cm x 29,7 cm)' : 'Klik tombol di kanan untuk mencetak langsung ke PDF / Printer' ?>
            </p>
        </div>
        
        <div class="flex items-center gap-2">
            <?php if ($is_sertifikat): ?>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=1" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Lembar 1
                </a>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=2" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Lembar 2
                </a>
                <a href="cetak_dokumen.php?id=<?= $id ?>&tipe=sertifikat_magang&lembar=all" onclick="setTimeout(function(){ window.print(); }, 300);" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded-lg shadow-md cursor-pointer text-white">
                    Cetak Semua (1 &amp; 2)
                </a>
            <?php else: ?>
                <button onclick="window.print()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg shadow-md cursor-pointer">
                    Cetak Sekarang (Print / PDF)
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- KOP SURAT RESMI (HANYA UNTUK DOKUMEN NON-SERTIFIKAT) -->
    <?php if (!$is_sertifikat): ?>
    <div class="border-b-4 border-double border-slate-900 pb-4 flex items-center gap-4">
        <img src="assets/img/kemenag-logo.png" class="w-20 h-20 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
        <div class="text-center flex-1">
            <h3 class="text-base font-bold uppercase tracking-wide">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
            <h2 class="text-lg font-black uppercase tracking-wider">KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK</h2>
            <p class="text-xs">Jl. Siliwangi No. 2 Rangkasbitung, Kab. Lebak, Banten 42314</p>
            <p class="text-[11px] text-slate-600">Telepon (0252) 201083 | Email: kablebak@kemenag.go.id</p>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($is_sertifikat): ?>
        <!-- ============================================================== -->
        <!-- DOKUMEN SERTIFIKAT MAGANG (BOLAK-BALIK / 2 LEMBAR PORTRAIT A4)  -->
        <!-- ============================================================== -->

        <?php if ($lembar === 'all' || $lembar === '1'): ?>
        <!-- LEMBAR DEPAN (HALAMAN 1) - PORTRAIT A4 -->
        <div class="border-4 border-double border-amber-900/40 p-5 sm:p-7 rounded-2xl bg-amber-50/10 space-y-3.5 relative min-h-[26cm] flex flex-col justify-between overflow-hidden">
            <!-- Header Halaman 1: Logo Center & Nama Instansi Capital (Font Size 12pt, Jarak 1) -->
            <div class="text-center relative z-10 space-y-1">
                <img src="assets/img/kemenag-logo.png" class="w-20 h-20 mx-auto object-contain drop-shadow-xs mb-1" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
                <h2 class="font-extrabold text-[12pt] uppercase tracking-wider text-slate-900 mt-1">
                    KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK
                </h2>
                <div class="border-b border-slate-900 w-full my-2"></div>
            </div>

            <!-- Judul 2 Baris (Font Size 14pt) & Nomor Sertifikat -->
            <div class="text-center relative z-10 space-y-1">
                <h1 class="text-[14pt] font-bold uppercase tracking-wide text-slate-900 leading-snug">SERTIFIKAT<br>PRAKTEK KERJA LAPANGAN / MAGANG</h1>
                <p class="text-xs font-mono font-bold text-slate-800">Nomor : B-<?= htmlspecialchars($student['nisn']) ?>/Kk.28.02.1/KS.00/<?= date('m/Y') ?></p>
            </div>

            <div class="text-center relative z-10 space-y-3 text-xs leading-relaxed max-w-4xl mx-auto">
                <p class="text-xs text-justify leading-normal">Berdasarkan UU No. 20 tahun 2003 tentang Sisdiknas dan Permendikbud No. 50 Tahun 2020 tentang Praktek Kerja Lapangan (PKL) serta ketentuan - ketentuan pelaksanaannya lainnya, maka dengan ini Kepala Kantor Kementerian Agama Kabupaten Lebak menyatakan bahwa :</p>

                <div class="max-w-2xl mx-auto text-left border border-slate-300 p-3 rounded-xl bg-white/95 space-y-1 shadow-xs text-xs">
                    <table class="w-full">
                        <tr><td class="w-48 font-semibold py-0.5">N a m a</td><td class="w-4">:</td><td class="font-bold uppercase tracking-wide text-slate-900"><?= htmlspecialchars(strtoupper($student['nama'])) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">NISN/NIM</td><td>:</td><td class="font-mono font-bold"><?= htmlspecialchars($student['nisn']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Tempat dan Tanggal Lahir</td><td>:</td><td class="font-semibold uppercase text-slate-900"><?= htmlspecialchars(strtoupper($student['tempat_lahir'] ?: 'LEBAK')) ?>, <?= strtoupper(date('d F Y', strtotime($student['tanggal_lahir'] ?: '2000-10-07'))) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Prodi / Jurusan</td><td>:</td><td class="font-semibold uppercase"><?= htmlspecialchars(strtoupper($student['program_keahlian'] ?: 'MANAJEMEN')) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Asal Sekolah</td><td>:</td><td class="font-semibold"><?= htmlspecialchars($student['asal_sekolah']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Tempat Penugasan</td><td>:</td><td class="font-bold text-emerald-900"><?= htmlspecialchars($student['tempat_penugasan']) ?></td></tr>
                        <tr><td class="font-semibold py-0.5">Waktu Pelaksanaan</td><td>:</td><td class="font-mono"><?= $student['tanggal_mulai'] ?: '01 Januari 2026' ?> s.d <?= $student['tanggal_selesai'] ?: '31 Juli 2026' ?></td></tr>
                    </table>
                </div>

                <p class="text-xs">Telah mengikuti dan menyelesaikan Praktek Kerja Lapangan / Magang di Kantor Kementerian Agama Kabupaten Lebak dengan predikat:</p>

                <!-- Format sorotan kelulusan: NAIK NILAI >= 70 LULUS (SANGAT BAIK/BAIK/CUKUP), < 70 TIDAK LULUS -->
                <div class="py-2.5 px-6 my-1 -mt-2 border-2 rounded-2xl max-w-md mx-auto text-center shadow-xs <?= $is_lulus ? 'bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-amber-500 text-slate-900' : 'bg-gradient-to-r from-rose-50 via-red-100 to-rose-50 border-rose-600 text-rose-900' ?>">
                    <span class="text-sm sm:text-base font-extrabold tracking-wide inline-block">
                        <?php if ($is_lulus): ?>
                            LULUS dengan Nilai : <span class="underline text-emerald-900 font-black"><?= $predikat_akhir ?></span>
                        <?php else: ?>
                            <span class="text-rose-700 font-black tracking-wider text-sm sm:text-base uppercase">TIDAK LULUS dengan Nilai : KURANG</span>
                        <?php endif; ?>
                    </span>
                </div>

                <p class="text-xs italic text-slate-600">Sertifikat ini diberikan sebagai bukti kelulusan dan penghargaan atas dedikasi serta kontribusi kerja yang telah diberikan.</p>
            </div>

            <!-- Bottom Row: Pojok Kiri = Barcode Batang SVG Linear + QR, Pojok Kanan = Tanda Tangan Kepala Kantor (TANPA TULISAN WATERMARK STEMPEL) -->
            <div class="relative z-10 pt-2 flex items-end justify-between gap-6 text-xs">
                <!-- Barcode Batang SVG Linear + QR Code SVG (Menggunakan data Nama Siswa, NISN, dan Tanggal Sertifikat) -->
                <div class="bg-white/95 p-2 rounded-xl border border-slate-300 shadow-xs inline-flex items-center gap-2 shrink-0">
                    <?= render_certificate_barcode($student['nama'], $student['nisn'], $today_str) ?>
                    <?= render_certificate_qrcode($student['nama'], $student['nisn'], $today_str) ?>
                </div>

                <!-- Tanda Tangan Kepala Kantor (TANPA TULISAN WATERMARK STEMPEL) -->
                <div class="text-center space-y-0.5 w-80 shrink-0">
                    <p>Rangkasbitung, <?= $today_str ?></p>
                    <p class="font-bold">Kepala Kantor,</p>
                    <div class="h-16 flex items-center justify-center"></div>
                    <p class="font-bold underline uppercase text-slate-900 text-[11pt]">H. BADRUSSALAM, S.AG., M.SI.</p>
                    <p class="font-mono text-[10px]">NIP. 197508142000031002</p>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <?php if ($lembar === 'all' || $lembar === '2'): ?>
        <!-- LEMBAR BELAKANG (HALAMAN 2 - TRANSKRIP NILAI) - PORTRAIT A4 -->
        <div style="page-break-before: always; break-before: page;" class="pt-6 space-y-5 relative min-h-[26cm] flex flex-col justify-between overflow-hidden">
            <!-- Watermark Logo Kemenag 8cm x 8cm di Tengah Halaman 2 -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <img src="assets/img/kemenag-logo.png" class="w-[8cm] h-[8cm] object-contain opacity-[0.08] filter grayscale select-none" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
            </div>

            <div class="space-y-4 relative z-10">
                <div class="border-b-2 border-slate-900 pb-2 text-center space-y-1">
                    <h2 class="text-base font-extrabold uppercase underline tracking-wide">DAFTAR NILAI PRAKTEK KERJA LAPANGAN / MAGANG</h2>
                    <p class="text-xs font-mono font-medium">Lampiran Sertifikat Magang Nomor: <?= $doc_no ?></p>
                </div>

                <!-- Ringkasan Data Siswa (Revisi Label: Asal Sekolah & Program Studi/Jurusan) -->
                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-300">
                    <div>Nama Siswa: <strong class="uppercase"><?= htmlspecialchars($student['nama']) ?></strong></div>
                    <div>NISN: <strong class="font-mono"><?= htmlspecialchars($student['nisn']) ?></strong></div>
                    <div>Asal Sekolah: <strong><?= htmlspecialchars($student['asal_sekolah']) ?></strong></div>
                    <div>Program Studi/Jurusan: <strong class="text-emerald-900 uppercase"><?= htmlspecialchars(strtoupper($student['program_keahlian'] ?: 'MANAJEMEN')) ?></strong></div>
                </div>

                <table class="w-full text-xs border border-slate-900 border-collapse bg-white/90">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-900">
                            <th class="border border-slate-900 p-2 text-center w-12">No</th>
                            <th class="border border-slate-900 p-2 text-left">Aspek Penilaian Prestasi</th>
                            <th class="border border-slate-900 p-2 text-center w-28">Nilai Angka</th>
                            <th class="border border-slate-900 p-2 text-center w-24">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td class="border border-slate-900 p-2 text-center">1</td><td class="border border-slate-900 p-2 font-medium">Kedisiplinan Waktu &amp; Ketepatan Presensi</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_disiplin, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_disiplin) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">2</td><td class="border border-slate-900 p-2 font-medium">Tanggung Jawab Pekerjaan &amp; Penugasan</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_tanggung, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_tanggung) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">3</td><td class="border border-slate-900 p-2 font-medium">Kebersihan &amp; Kerapihan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kebersihan, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kebersihan) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">4</td><td class="border border-slate-900 p-2 font-medium">Kemampuan &amp; Hasil Penguasaan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kemampuan, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kemampuan) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">5</td><td class="border border-slate-900 p-2 font-medium">Kerjasama Dalam Tim &amp; Komunikasi</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kerjasama, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_kerjasama) ?></td></tr>
                        <tr><td class="border border-slate-900 p-2 text-center">6</td><td class="border border-slate-900 p-2 font-semibold">Keahlian: <?= !empty($ass['nama_bidang_keahlian']) ? htmlspecialchars($ass['nama_bidang_keahlian']) : 'Kompetensi / Bidang Keahlian' ?></td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_etika, 1) ?></td><td class="border border-slate-900 p-2 text-center font-bold"><?= getGradeLetter($n_etika) ?></td></tr>
                        <tr class="bg-slate-50 font-bold">
                            <td colspan="2" class="border border-slate-900 p-2 text-right">Nilai Rata-Rata Akhir:</td>
                            <td class="border border-slate-900 p-2 text-center font-mono text-sm font-black"><?= number_format($n_rata, 1) ?></td>
                            <td class="border border-slate-900 p-2 text-center">GRADE <?= $grade_akhir ?> (<?= $predikat_akhir ?>)</td>
                        </tr>
                    </tbody>
                </table>

                <div class="p-3 border border-slate-900 bg-slate-50 text-[11px] space-y-1">
                    <strong class="block font-bold">Tabel Legenda Kriteria Nilai:</strong>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-white p-1.5 rounded border"><strong>90 – 100</strong><br><span class="text-emerald-800 font-bold">Grade A (Sangat Baik)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>80 – 89</strong><br><span class="text-blue-800 font-bold">Grade B (Baik)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>70 – 79</strong><br><span class="text-amber-800 font-bold">Grade C (Cukup)</span></div>
                        <div class="bg-white p-1.5 rounded border"><strong>&lt; 70</strong><br><span class="text-rose-800 font-bold">Grade D (Kurang)</span></div>
                    </div>
                </div>

                <div class="text-xs space-y-1">
                    <strong>Catatan Evaluasi Pembimbing Instansi:</strong>
                    <p class="italic text-slate-800 p-2.5 bg-slate-50 border rounded-lg">
                        "<?= htmlspecialchars($ass['catatan'] ?? 'Siswa menunjukkan kedisiplinan dan kinerja yang sangat baik selama masa magang.') ?>"
                    </p>
                </div>
            </div>

            <!-- Tanda Tangan Pembimbing Kantor -->
            <div class="relative z-10 flex justify-end text-xs pt-4">
                <div class="text-center space-y-0.5 w-80 shrink-0">
                    <p>Rangkasbitung, <?= $today_str ?></p>
                    <p class="font-bold">Pembimbing Kantor</p>
                    <p class="font-bold">Kementerian Agama Kabupaten Lebak</p>
                    <div class="h-20"></div>
                    <p class="font-bold underline uppercase"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
                    <p class="font-mono text-[10px]">NIP. <?= htmlspecialchars($student['nip_pembimbing'] ?: '197811202005011004') ?></p>
                </div>
            </div>
        </div>
        <?php endif; ?>

    <?php elseif ($tipe === 'penilaian'): ?>
        <div class="text-center space-y-1 my-4">
            <h2 class="text-base font-extrabold uppercase underline">LEMBAR PENILAIAN PRAKTIK KERJA LAPANGAN / MAGANG</h2>
            <p class="text-xs font-mono">Nomor Dokumen: <?= $doc_no ?></p>
        </div>

        <table class="w-full text-xs space-y-1">
            <tr><td class="w-36 font-bold py-1">Nama Siswa</td><td>: <?= htmlspecialchars($student['nama']) ?></td></tr>
            <tr><td class="font-bold py-1">NISN / NIM</td><td>: <?= htmlspecialchars($student['nisn']) ?></td></tr>
            <tr><td class="font-bold py-1">Asal Sekolah</td><td>: <?= htmlspecialchars($student['asal_sekolah']) ?></td></tr>
            <tr><td class="font-bold py-1">Program Keahlian</td><td>: <?= htmlspecialchars($student['program_keahlian']) ?></td></tr>
            <tr><td class="font-bold py-1">Tempat Penugasan</td><td>: <?= htmlspecialchars($student['tempat_penugasan']) ?></td></tr>
        </table>

        <table class="w-full text-xs border border-slate-900 border-collapse mt-4">
            <thead>
                <tr class="bg-slate-100 border-b border-slate-900">
                    <th class="border border-slate-900 p-2 text-center w-12">No</th>
                    <th class="border border-slate-900 p-2 text-left">Aspek Penilaian Prestasi</th>
                    <th class="border border-slate-900 p-2 text-center w-24">Nilai (0-100)</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="border border-slate-900 p-2 text-center">1</td><td class="border border-slate-900 p-2">Kedisiplinan &amp; Ketepatan Waktu</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_disiplin, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">2</td><td class="border border-slate-900 p-2">Tanggung Jawab Pekerjaan</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_tanggung, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">3</td><td class="border border-slate-900 p-2">Kebersihan &amp; Kerapihan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kebersihan, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">4</td><td class="border border-slate-900 p-2">Kemampuan &amp; Hasil Penguasaan Kerja</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kemampuan, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">5</td><td class="border border-slate-900 p-2">Kerjasama Dalam Tim</td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_kerjasama, 1) ?></td></tr>
                <tr><td class="border border-slate-900 p-2 text-center">6</td><td class="border border-slate-900 p-2">Keahlian: <?= !empty($ass['nama_bidang_keahlian']) ? htmlspecialchars($ass['nama_bidang_keahlian']) : 'Etika, Sopan Santun & Akhlak' ?></td><td class="border border-slate-900 p-2 text-center font-bold font-mono"><?= number_format($n_etika, 1) ?></td></tr>
                <tr class="bg-slate-50 font-bold">
                    <td colspan="2" class="border border-slate-900 p-2 text-right">Nilai Rata-Rata Akhir:</td>
                    <td class="border border-slate-900 p-2 text-center font-mono text-sm font-black"><?= number_format($n_rata, 1) ?></td>
                </tr>
            </tbody>
        </table>

        <!-- TANDA TANGAN LEMBAR PENILAIAN -->
        <div class="grid grid-cols-2 gap-8 text-xs pt-8">
            <div class="text-center space-y-16">
                <p>Mengetahui,<br><strong>Kasubbag Tata Usaha</strong></p>
                <p class="font-bold underline">H. Sudirman, S.Ag., M.Si<br><span class="font-normal no-underline font-mono text-[10px]">NIP. 197405122003121002</span></p>
            </div>
            <div class="text-center space-y-16">
                <p>Rangkasbitung, <?= date('d F Y') ?><br><strong>Pembimbing Kantor Kemenag Lebak</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
            </div>
        </div>
    <?php else: ?>
        <div class="text-center space-y-1 my-4">
            <h2 class="text-base font-extrabold uppercase underline">LAPORAN REKAPITULASI JURNAL KEGIATAN HARIAN</h2>
            <p class="text-xs">Siswa: <strong><?= htmlspecialchars($student['nama']) ?></strong> (NISN: <?= $student['nisn'] ?>)</p>
        </div>

        <table class="w-full text-xs border border-slate-900 border-collapse mt-4">
            <thead>
                <tr class="bg-slate-100 border-b border-slate-900">
                    <th class="border border-slate-900 p-2 text-center w-10">No</th>
                    <th class="border border-slate-900 p-2 text-left w-24">Tanggal</th>
                    <th class="border border-slate-900 p-2 text-center w-28">Waktu (24 Jam)</th>
                    <th class="border border-slate-900 p-2 text-left">Uraian Kegiatan</th>
                    <th class="border border-slate-900 p-2 text-left">Output / Hasil</th>
                    <th class="border border-slate-900 p-2 text-center w-20">Verifikasi</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; foreach ($activities as $a): ?>
                <tr>
                    <td class="border border-slate-900 p-2 text-center"><?= $no++ ?></td>
                    <td class="border border-slate-900 p-2 font-mono"><?= $a['tanggal'] ?></td>
                    <td class="border border-slate-900 p-2 text-center font-mono"><?= $a['jam_mulai'] ?> - <?= $a['jam_selesai'] ?></td>
                    <td class="border border-slate-900 p-2"><?= htmlspecialchars($a['uraian_kegiatan']) ?></td>
                    <td class="border border-slate-900 p-2"><?= htmlspecialchars($a['output_kegiatan']) ?></td>
                    <td class="border border-slate-900 p-2 text-center font-bold"><?= $a['status_verifikasi'] ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- TANDA TANGAN JURNAL KEGIATAN -->
        <div class="grid grid-cols-2 gap-8 text-xs pt-8">
            <div class="text-center space-y-16">
                <p>Mengetahui,<br><strong>Pembimbing Kantor Kemenag Lebak</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['pembimbing_kantor'] ?: 'DEDEN FIRDAUS, S.AG') ?></p>
            </div>
            <div class="text-center space-y-16">
                <p>Rangkasbitung, <?= date('d F Y') ?><br><strong>Siswa Magang / PKL</strong></p>
                <p class="font-bold underline"><?= htmlspecialchars($student['nama']) ?></p>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>
