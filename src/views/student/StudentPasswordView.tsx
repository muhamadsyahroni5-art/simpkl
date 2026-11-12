import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Student } from '../../types';

interface StudentPasswordViewProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export const StudentPasswordView: React.FC<StudentPasswordViewProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 4) {
      setErrorMsg('Password baru minimal harus 4 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru!');
      return;
    }

    // Update student's password
    const updatedStudent: Student = {
      ...student,
      password: newPassword,
    };

    onUpdateStudent(updatedStudent);
    setSuccessMsg('Password akun Anda berhasil diperbarui! Silakan gunakan password baru ini untuk login berikutnya.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-700" />
          <span>Pengaturan Ubah Password Siswa</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Perbarui kata sandi akun login Anda untuk menjaga keamanan akses sistem informasi PKL / Magang.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center gap-3 border-b border-emerald-900/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Formulir Kata Sandi Baru</h3>
            <p className="text-[11px] text-emerald-200">
              Pengguna: <strong className="text-white">{student.nama}</strong> ({student.nisn})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Username (Read Only) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username Akun Anda (Tetap)
            </label>
            <input
              type="text"
              disabled
              value={student.username}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono text-xs cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Username login Anda tidak dapat diubah.</p>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password Baru *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Konfirmasi Password Baru *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru..."
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-emerald-600 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Tips */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Petunjuk Keamanan:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
              <li>Gunakan kombinasi huruf dan angka agar password tidak mudah ditebak.</li>
              <li>Jangan bagikan password kepada rekan sesama siswa atau pihak lain.</li>
              <li>Setelah berhasil diubah, gunakan kata sandi baru saat login kembali.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Simpan &amp; Perbarui Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
