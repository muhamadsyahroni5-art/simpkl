import React, { useState } from 'react';
import { Menu, Calendar, UserCheck, Shield, ChevronDown, LogOut, Check } from 'lucide-react';
import { AppUser, Student, UserRole } from '../types';

interface NavbarProps {
  currentUser: AppUser | (Student & { role: 'siswa' });
  onToggleMobileSidebar: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: AppUser[];
  allStudents: Student[];
  onLogout: () => void;
  activeTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleMobileSidebar,
  onSwitchUser,
  allUsers,
  allStudents,
  onLogout,
  activeTitle,
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const roleLabelMap: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin TU',
    admin_seksi: 'Admin Seksi',
    opr_pembimbing: 'Opr. Pembimbing',
    siswa: 'Siswa PKL',
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div
        className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
        style={{ backgroundColor: '#2aa6dc' }}
      >
        {/* Left: Mobile hamburger & breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {activeTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="font-bold text-emerald-900">Kemenag Lebak</span>
              <span>&middot;</span>
              <span className="truncate font-medium">SIMAGANG (Sistem Informasi Anak Magang)</span>
            </div>
          </div>
        </div>

        {/* Right: Date, Quick Switcher, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Today Date */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-medium capitalize">{todayStr}</span>
          </div>

          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Ganti Akun Demo Pengujian"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Simulasi Role:</span>
              <span className="font-bold underline decoration-emerald-500">
                {roleLabelMap[currentUser.role]}
              </span>
              <ChevronDown className="w-3 h-3 ml-0.5 text-emerald-700" />
            </button>

            {showSwitchDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSwitchDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="font-bold text-slate-800">Pilih Akun Role Pengujian</p>
                    <p className="text-[11px] text-slate-500">
                      Uji fungsi otorisasi dan hak akses seksi
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Admins */}
                    <div className="p-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Akun Admin &amp; Pegawai
                      </p>
                      {allUsers.map((u) => {
                        const isCurrent = currentUser.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setShowSwitchDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate font-medium">{u.nama}</p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {roleLabelMap[u.role]} &bull; {u.seksi}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Students */}
                    <div className="p-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Akun Siswa PKL / Magang
                      </p>
                      {allStudents.map((s) => {
                        const isCurrent = currentUser.id === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              onSwitchUser(s.id);
                              setShowSwitchDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate font-medium">{s.nama}</p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {s.asalSekolah} &bull; {s.tempatPenugasan}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
