<?php
session_start();
require_once 'config/koneksi.php';

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'siswa') {
        header('Location: dashboard_siswa.php');
    } else {
        header('Location: dashboard_admin.php');
    }
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_type = $_POST['login_type'] ?? 'admin';
    $username   = trim($_POST['username'] ?? '');
    $password   = trim($_POST['password'] ?? '');
    $pass_hash  = md5($password);

    if ($login_type === 'siswa') {
        $stmt = $pdo->prepare("SELECT * FROM students WHERE username = ? AND password = ?");
        $stmt->execute([$username, $pass_hash]);
        $student = $stmt->fetch();

        if ($student) {
            $_SESSION['user_id'] = $student['id'];
            $_SESSION['nama']    = $student['nama'];
            $_SESSION['nisn']    = $student['nisn'];
            $_SESSION['role']    = 'siswa';
            $_SESSION['seksi']   = $student['tempat_penugasan'];
            header('Location: dashboard_siswa.php');
            exit;
        } else {
            $error = 'Username atau Password Siswa tidak ditemukan!';
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$username, $pass_hash]);
        $user = $stmt->fetch();

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['nama']    = $user['nama'];
            $_SESSION['nip']     = $user['nip'];
            $_SESSION['role']    = $user['role'];
            $_SESSION['seksi']   = $user['seksi'];
            header('Location: dashboard_admin.php');
            exit;
        } else {
            $error = 'Username atau Password Pegawai / Admin tidak ditemukan!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SIMAGANG KEMENAG LEBAK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 min-h-screen flex flex-col justify-between p-4 text-slate-100">
    <div class="max-w-md w-full mx-auto my-auto py-6">
        <div class="bg-white text-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white text-center">
                <img src="assets/img/kemenag-logo.png" alt="Logo Kemenag" class="w-16 h-16 mx-auto mb-2 object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png'">
                <h1 class="text-xl font-black tracking-tight text-white uppercase">SIMAGANG KEMENAG LEBAK</h1>
                <p class="text-xs text-emerald-200 font-semibold mt-0.5">(Sistem Informasi Anak Magang)</p>
                <p class="text-[10px] text-emerald-300/80 mt-1">Ikhlas Beramal • Jl. Siliwangi No. 2 Rangkasbitung</p>
            </div>

            <div class="p-6 sm:p-7 space-y-4">
                <?php if ($error): ?>
                    <div class="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Tipe Pengguna:</label>
                        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                            <label class="py-2 text-center rounded-lg font-bold text-xs cursor-pointer text-slate-700 has-[:checked]:bg-white has-[:checked]:text-emerald-900 has-[:checked]:shadow-sm">
                                <input type="radio" name="login_type" value="admin" checked class="hidden">
                                <span>Pegawai / Admin</span>
                            </label>
                            <label class="py-2 text-center rounded-lg font-bold text-xs cursor-pointer text-slate-700 has-[:checked]:bg-white has-[:checked]:text-emerald-900 has-[:checked]:shadow-sm">
                                <input type="radio" name="login_type" value="siswa" class="hidden">
                                <span>Siswa Magang</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Username / NISN</label>
                        <input type="text" name="username" required placeholder="Contoh: admin / 0067481920" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                        <input type="password" name="password" required placeholder="Masukkan password" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600">
                    </div>

                    <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md">
                        Masuk ke SIMAGANG
                    </button>
                </form>

                <div class="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 leading-relaxed">
                    Akun Demo Default:<br>
                    Admin: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin / admin123</code><br>
                    Siswa: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">0067481920 / siswa123</code>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
