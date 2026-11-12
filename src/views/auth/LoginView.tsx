import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppUser, Student, UserRole } from '../../types';

interface LoginViewProps {
  allUsers: AppUser[];
  allStudents: Student[];
  onLoginSuccess: (user: AppUser | (Student & { role: 'siswa' })) => void;
  onOpenPhpExport: () => void;
  idleLogoutNotice?: string | null;
  onClearIdleNotice?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  allUsers,
  allStudents,
  onLoginSuccess,
  onOpenPhpExport,
  idleLogoutNotice,
  onClearIdleNotice,
}) => {
  const [loginType, setLoginType] = useState<'admin' | 'siswa'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (loginType === 'siswa') {
      const student = allStudents.find(
        (s) => s.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (student) {
        onLoginSuccess({ ...student, role: 'siswa' });
      } else {
        setErrorMsg('Username atau Password Siswa tidak ditemukan! Silakan gunakan akun demo di bawah.');
      }
    } else {
      const user = allUsers.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('Username atau Password Pegawai tidak ditemukan! Silakan gunakan akun demo di bawah.');
      }
    }
  };

  const handleQuickLogin = (role: UserRole, targetId?: string) => {
    if (role === 'siswa') {
      const st = allStudents.find((s) => (targetId ? s.id === targetId : true)) || allStudents[0];
      onLoginSuccess({ ...st, role: 'siswa' });
    } else {
      const u = allUsers.find((user) => (targetId ? user.id === targetId : user.role === role)) || allUsers[0];
      onLoginSuccess(u);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / XAMPP bundle link */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between text-xs py-2 shrink-0">
        <div className="flex items-center gap-2 text-emerald-300 font-medium">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Kantor Kementerian Agama Kabupaten Lebak</span>
        </div>
        <button
          onClick={onOpenPhpExport}
          className="text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Unduh Source Code PHP &amp; MySQL</span>
          <span className="text-[10px] bg-amber-500/30 px-1 rounded">XAMPP</span>
        </button>
      </div>

      {/* Idle Logout Notice Banner */}
      {idleLogoutNotice && (
        <div className="max-w-md w-full mx-auto mb-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-amber-500/20 border border-amber-400/50 backdrop-blur-md rounded-2xl p-4 text-amber-200 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-300">Sesi Otomatis Berakhir (Auto-Logout)</p>
              <p className="mt-0.5 text-amber-100/90 leading-relaxed">{idleLogoutNotice}</p>
            </div>
            {onClearIdleNotice && (
              <button
                onClick={onClearIdleNotice}
                className="text-amber-300/80 hover:text-white p-1 rounded-lg"
                title="Tutup Pesan"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Brand Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white text-center relative">
            <div className="w-18 h-18 mx-auto mb-2 p-2 bg-white/10 rounded-2xl border border-white/20 shadow-md">
              <img
                src="/assets/aistudio/media_1792507912355_fb074e24_71599073.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              SIMAGANG KEMENAG LEBAK
            </h1>
            <p className="text-xs text-emerald-200 font-semibold mt-0.5">
              (Sistem Informasi Anak Magang)
            </p>
            <p className="text-[10px] text-emerald-300/80 mt-1">
              Ikhlas Beramal &bull; Jl. Siliwangi No. 2 Rangkasbitung
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-7 space-y-5 text-xs">
            {/* Login Type Switch */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">
                Pilih Tipe Pengguna:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('admin');
                    setUsername('superadmin');
                    setPassword('password123');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                    loginType === 'admin'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pegawai / Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('siswa');
                    setUsername('rizky');
                    setPassword('password123');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                    loginType === 'siswa'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Siswa / Mahasiswa
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username Akun
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={loginType === 'admin' ? 'Contoh: superadmin / admin' : 'Contoh: rizky / nuraini'}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke SIMAGANG</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Login Fast Switcher */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Atau Masuk Cepat dengan Akun Demo (1-Click):
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('super_admin')}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition-colors"
                >
                  <span className="font-bold block">Super Admin</span>
                  <span className="text-[10px] text-emerald-700 block truncate">H. Badrussalam (Kakankemenag)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition-colors"
                >
                  <span className="font-bold block">Admin TU</span>
                  <span className="text-[10px] text-emerald-700 block truncate">Hj. Sudirah (Kasubbag TU)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin_seksi', 'usr-3')}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left transition-colors"
                >
                  <span className="font-bold block">Admin Seksi</span>
                  <span className="text-[10px] text-blue-700 block truncate">Dian Permana (Pusdatin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('opr_pembimbing', 'usr-4')}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-left transition-colors"
                >
                  <span className="font-bold block">Opr Pembimbing</span>
                  <span className="text-[10px] text-purple-700 block truncate">Asep Saepullah (Penma)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('siswa', 'std-1')}
                  className="col-span-2 p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold block">Siswa PKL: Muhammad Rizky</span>
                    <span className="text-[10px] text-amber-800">SMKN 1 Rangkasbitung &bull; Subbag Pusdatin</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/80 font-bold px-2 py-0.5 rounded text-amber-900">
                    Siswa Demo &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-slate-400 py-3 shrink-0">
        <p>© 2026 Pusdatin Kemenag Lebak &bull; Jl. Siliwangi No. 2 Rangkasbitung &bull; Telp: (0252) 201319</p>
      </div>
    </div>
  );
};
