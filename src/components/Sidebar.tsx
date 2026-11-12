import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  BookOpen,
  Award,
  FileText,
  Settings,
  LogOut,
  FolderDown,
  ChevronRight,
  ShieldAlert,
  User,
  Users,
  KeyRound
} from 'lucide-react';
import { AppUser, Student, UserRole } from '../types';

interface SidebarProps {
  currentUser: AppUser | (Student & { role: 'siswa' });
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenPhpExport: () => void;
  isCompletedStudent?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
  onOpenPhpExport,
  isCompletedStudent = false,
}) => {
  const isStudent = currentUser.role === 'siswa';

  const isStudentFinished =
    isStudent &&
    (('status' in currentUser && currentUser.status === 'Selesai') || isCompletedStudent);

  const studentMenuItems = isStudentFinished
    ? [
        { id: 'dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
        { id: 'siswa_laporan', label: 'Laporan & Nilai Saya', icon: FileText },
        { id: 'siswa_password', label: 'Ubah Password', icon: KeyRound },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
        { id: 'siswa_profile', label: 'Biodata & Profil', icon: User },
        { id: 'siswa_absensi', label: 'Absensi Masuk & Pulang', icon: CalendarCheck },
        { id: 'siswa_kegiatan', label: 'Jurnal Kegiatan Harian', icon: BookOpen },
        { id: 'siswa_laporan', label: 'Laporan & Nilai Saya', icon: FileText },
        { id: 'siswa_password', label: 'Ubah Password', icon: KeyRound },
      ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard Analisis', icon: LayoutDashboard },
    { id: 'admin_siswa', label: 'Manajemen Data Siswa', icon: Users },
    { id: 'admin_absensi', label: 'Manajemen Absensi & WA', icon: CalendarCheck },
    { id: 'admin_kegiatan', label: 'Laporan Kegiatan Siswa', icon: BookOpen },
    { id: 'admin_penilaian', label: 'Penilaian Siswa', icon: Award },
    { id: 'admin_laporan', label: 'Laporan & Cetak Dokumen', icon: FileText },
    { id: 'admin_settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  const menuItems = isStudent ? studentMenuItems : adminMenuItems;

  const roleLabelMap: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin TU',
    admin_seksi: 'Admin Seksi',
    opr_pembimbing: 'Opr. Pembimbing',
    siswa: 'Siswa PKL / Magang',
  };

  const roleColorBadge: Record<UserRole, string> = {
    super_admin: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    admin: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    admin_seksi: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    opr_pembimbing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    siswa: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 text-slate-100 flex flex-col border-r border-emerald-900/60 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 flex items-center justify-center shadow-inner border border-white/15 shrink-0">
            <img
              src="/assets/aistudio/media_1792507912355_fb074e24_71599073.png"
              alt="Logo Kemenag"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight leading-tight truncate">
                SIMAGANG
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                LEBAK
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold truncate">
              Sistem Informasi Anak Magang
            </p>
            <p className="text-[9px] text-slate-400 truncate">
              Kemenag Kab. Lebak &bull; Ikhlas Beramal
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-emerald-800/50 flex items-center justify-center border border-emerald-500/30 shrink-0">
              {'photo' in currentUser && currentUser.photo ? (
                <img
                  src={currentUser.photo}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.nama}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                    roleColorBadge[currentUser.role]
                  }`}
                >
                  {roleLabelMap[currentUser.role]}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate">
              {'tempatPenugasan' in currentUser
                ? currentUser.tempatPenugasan
                : currentUser.seksi}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isStudent ? 'Menu Siswa / Magang' : 'Menu Manajemen'}
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
              </button>
            );
          })}

          {/* PHP Source Code Download button for Laragon & XAMPP */}
          <div className="pt-4 mt-3 border-t border-white/10">
            <p className="px-3 py-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span>Paket XAMPP / Laragon</span>
            </p>
            <button
              onClick={() => {
                onOpenPhpExport();
                setIsOpenMobile(false);
              }}
              className="w-full mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderDown className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">File PHP & MySQL</span>
              </div>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-mono">
                ZIP
              </span>
            </button>
          </div>
        </div>

        {/* Footer Actions / Logout */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout</span>
          </button>
          <div className="mt-2 text-center text-[10px] text-slate-500">
            <span>Versi Web &amp; PHP 8.x Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
