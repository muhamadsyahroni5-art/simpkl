import React, { useState } from 'react';
import {
  Settings,
  Users,
  Volume2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Shield,
  RotateCcw,
  Save,
  Eye,
  Sliders,
  Clock,
  Timer,
  X,
  MapPin,
  Compass,
  Navigation,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  AppUser,
  RunningTextConfig,
  AutoLogoutConfig,
  GpsLocationConfig,
  SUBBAG_SEKSI_OPTIONS,
  SubbagSeksiType,
  UserRole
} from '../../types';
import {
  INITIAL_RUNNING_TEXT,
  INITIAL_AUTO_LOGOUT,
  INITIAL_GPS_CONFIG
} from '../../data/initialData';
import { GpsMapPreview } from '../../components/GpsMapPreview';
import { calculateDistanceMeters, toDMSLatitude, toDMSLongitude } from '../../utils/gpsUtils';

interface AdminSettingsViewProps {
  currentUser: AppUser;
  users: AppUser[];
  runningTextConfig: RunningTextConfig;
  onUpdateRunningText: (cfg: RunningTextConfig) => void;
  autoLogoutConfig: AutoLogoutConfig;
  onUpdateAutoLogout: (cfg: AutoLogoutConfig) => void;
  gpsConfig: GpsLocationConfig;
  onUpdateGpsConfig: (cfg: GpsLocationConfig) => void;
  onAddUser: (user: Omit<AppUser, 'id'>) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentUser,
  users,
  runningTextConfig,
  onUpdateRunningText,
  autoLogoutConfig,
  onUpdateAutoLogout,
  gpsConfig,
  onUpdateGpsConfig,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const isSuperOrAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'users' | 'running_text' | 'gps_location'>('users');

  // Users displayed: if not super_admin or admin, ONLY display current user!
  const visibleUsers = isSuperOrAdmin
    ? users
    : users.filter((u) => u.id === currentUser.id);

  // User form modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const initialUserForm = {
    nama: '',
    nip: '',
    username: '',
    password: 'password123',
    jabatan: '',
    seksi: SUBBAG_SEKSI_OPTIONS[0] as SubbagSeksiType,
    role: 'opr_pembimbing' as UserRole,
    noHp: '',
    email: '',
  };

  const [userFormData, setUserFormData] = useState(initialUserForm);

  // Running text local state for live preview
  const [tempRunningText, setTempRunningText] = useState<RunningTextConfig>({
    ...runningTextConfig,
  });
  const [runningTextSavedMsg, setRunningTextSavedMsg] = useState(false);

  // GPS Location local state
  const [tempGps, setTempGps] = useState<GpsLocationConfig>({
    ...gpsConfig,
  });
  const [gpsSavedMsg, setGpsSavedMsg] = useState(false);

  // Test GPS position on device
  const [testUserLat, setTestUserLat] = useState<number | null>(null);
  const [testUserLng, setTestUserLng] = useState<number | null>(null);
  const [testDistance, setTestDistance] = useState<number | null>(null);
  const [gpsTestingLoading, setGpsTestingLoading] = useState(false);
  const [gpsTestError, setGpsTestError] = useState<string | null>(null);

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData(initialUserForm);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: AppUser) => {
    setEditingUser(u);
    setUserFormData({
      nama: u.nama,
      nip: u.nip,
      username: u.username,
      password: u.password || 'password123',
      jabatan: u.jabatan,
      seksi: u.seksi as SubbagSeksiType,
      role: u.role,
      noHp: u.noHp,
      email: u.email || '',
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...userFormData,
      });
    } else {
      onAddUser(userFormData);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string, nama: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    if (confirm(`Hapus pengguna: ${nama}?`)) {
      onDeleteUser(id);
    }
  };

  const handleSaveRunningText = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRunningText(tempRunningText);
    setRunningTextSavedMsg(true);
    setTimeout(() => setRunningTextSavedMsg(false), 3000);
  };

  const handleResetRunningText = () => {
    setTempRunningText(INITIAL_RUNNING_TEXT);
    onUpdateRunningText(INITIAL_RUNNING_TEXT);
    setRunningTextSavedMsg(true);
    setTimeout(() => setRunningTextSavedMsg(false), 3000);
  };

  const handleSaveGpsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGpsConfig(tempGps);
    setGpsSavedMsg(true);
    setTimeout(() => setGpsSavedMsg(false), 3000);
  };

  const handleResetGpsConfig = () => {
    setTempGps(INITIAL_GPS_CONFIG);
    onUpdateGpsConfig(INITIAL_GPS_CONFIG);
    setGpsSavedMsg(true);
    setTimeout(() => setGpsSavedMsg(false), 3000);
  };

  const handleTestDeviceGps = () => {
    setGpsTestingLoading(true);
    setGpsTestError(null);

    if (!navigator.geolocation) {
      setGpsTestError('Browser Anda tidak mendukung layanan Geolocation.');
      setGpsTestingLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setTestUserLat(uLat);
        setTestUserLng(uLng);

        const dist = calculateDistanceMeters(
          uLat,
          uLng,
          tempGps.latitude,
          tempGps.longitude
        );
        setTestDistance(dist);
        setGpsTestingLoading(false);
      },
      (err) => {
        setGpsTestingLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsTestError('Izin lokasi ditolak oleh browser. Mohon izinkan akses lokasi pada browser Anda.');
        } else {
          setGpsTestError(`Gagal mendapatkan lokasi GPS: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const roleLabelMap: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin TU',
    admin_seksi: 'Admin Seksi',
    opr_pembimbing: 'Opr Pembimbing',
    siswa: 'Siswa Magang',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs text-slate-500">
            {isSuperOrAdmin
              ? 'Kelola pengguna sistem, hak akses seksi, running text, serta koordinat lokasi kantor & radius absensi GPS.'
              : 'Perbarui data akun profil Anda di lingkungan Kementerian Agama Kabupaten Lebak.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen User (Pengguna)</span>
        </button>

        {isSuperOrAdmin && (
          <>
            <button
              onClick={() => setActiveTab('running_text')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'running_text'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Manajemen Running Text</span>
            </button>

            <button
              onClick={() => setActiveTab('gps_location')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'gps_location'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Titik Koordinat &amp; Radius GPS</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: MANAJEMEN USER */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {!isSuperOrAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hak Akses Terbatas:</strong> Anda memiliki role {roleLabelMap[currentUser.role]}. Sesuai ketentuan, Anda hanya dapat mengakses dan mengedit data akun Anda sendiri.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              {isSuperOrAdmin ? 'Daftar Pegawai & Pengguna Sistem' : 'Profil Pengguna Saya'}
            </h3>

            {isSuperOrAdmin && (
              <button
                onClick={openAddUserModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah User Baru</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Nama Pegawai &amp; NIP</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3">Unit Subbag / Seksi</th>
                    <th className="p-3">Hak Akses / Role</th>
                    <th className="p-3">No. HP / WA</th>
                    <th className="p-3 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{u.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP. {u.nip}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{u.username}</td>
                      <td className="p-3 text-slate-800 font-medium">{u.jabatan}</td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          {u.seksi}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.role === 'super_admin'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'admin'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'admin_seksi'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {roleLabelMap[u.role]}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{u.noHp}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isSuperOrAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.nama)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN RUNNING TEXT */}
      {activeTab === 'running_text' && isSuperOrAdmin && (
        <div className="space-y-6">
          {runningTextSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan Running Text berhasil disimpan dan diterapkan!</span>
            </div>
          )}

          {/* Interactive Live Preview Box */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Live Preview Interaktif (Real-Time)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Kecepatan: {tempRunningText.speedSeconds} Detik &bull; Tema: {tempRunningText.theme}
              </span>
            </div>

            {/* Marquee Preview */}
            <div className="rounded-xl overflow-hidden shadow-inner border border-white/10">
              {tempRunningText.isEnabled ? (
                <div
                  className={`w-full overflow-hidden text-xs py-2 px-3 flex items-center ${
                    tempRunningText.theme === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100'
                      : tempRunningText.theme === 'dark'
                      ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100'
                      : 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100'
                  }`}
                  style={{
                    '--marquee-duration': `${Math.max(5, tempRunningText.speedSeconds)}s`,
                  } as React.CSSProperties}
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20 mr-3 shrink-0 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Preview
                  </span>
                  <div className="relative overflow-hidden w-full flex items-center">
                    <div className="animate-marquee whitespace-nowrap font-medium tracking-wide">
                      <span className="inline-block px-4">{tempRunningText.text}</span>
                      <span className="inline-block px-4">{tempRunningText.text}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 text-slate-400 text-xs py-3 text-center italic">
                  Running text sedang dimatikan (Status: OFF).
                </div>
              )}
            </div>
          </div>

          {/* Form Settings */}
          <form
            onSubmit={handleSaveRunningText}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs"
          >
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
              Konfigurasi Teks Berjalan
            </h3>

            {/* Switch ON/OFF */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  Saklar Status Running Text (On / Off)
                </span>
                <span className="text-[11px] text-slate-500">
                  Aktifkan atau nonaktifkan running text di bagian atas aplikasi sewaktu-waktu
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempRunningText.isEnabled}
                  onChange={(e) =>
                    setTempRunningText({ ...tempRunningText, isEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Text Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Konten Pesan / Pengumuman Running Text:
              </label>
              <textarea
                rows={3}
                required
                value={tempRunningText.text}
                onChange={(e) =>
                  setTempRunningText({ ...tempRunningText, text: e.target.value })
                }
                placeholder="Tuliskan teks pengumuman dinas yang akan berjalan di marquee atas..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600 leading-relaxed font-sans"
              />
            </div>

            {/* Speed & Theme Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    Durasi Kecepatan Putaran (Detik):
                  </label>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {tempRunningText.speedSeconds} Detik
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={tempRunningText.speedSeconds}
                  onChange={(e) =>
                    setTempRunningText({
                      ...tempRunningText,
                      speedSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-semibold text-slate-700 block">
                  Pilihan Tema Warna Marquee:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'emerald', label: 'Emerald Kemenag', bg: 'bg-emerald-900 text-white' },
                    { id: 'dark', label: 'Dark Executive', bg: 'bg-slate-900 text-white' },
                    { id: 'gold', label: 'Gold Amber', bg: 'bg-amber-900 text-white' },
                  ].map((thm) => (
                    <button
                      type="button"
                      key={thm.id}
                      onClick={() =>
                        setTempRunningText({ ...tempRunningText, theme: thm.id as any })
                      }
                      className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all cursor-pointer ${
                        tempRunningText.theme === thm.id
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-300 opacity-80 hover:opacity-100'
                      } ${thm.bg}`}
                    >
                      {thm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetRunningText}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kembalikan ke Default</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Running Text</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TITIK KOORDINAT KANTOR & RADIUS ABSENSI GPS */}
      {activeTab === 'gps_location' && isSuperOrAdmin && (
        <div className="space-y-6">
          {gpsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan titik koordinat &amp; radius absensi GPS berhasil disimpan!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form (7 cols) */}
            <form
              onSubmit={handleSaveGpsConfig}
              className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs"
            >
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Titik Koordinat Lokasi Kantor &amp; Radius Absensi</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Konfigurasi lokasi Geofence untuk membatasi absensi presensi siswa magang berbasis lokasi GPS.
                  </p>
                </div>
              </div>

              {/* Saklar ON/OFF Absensi GPS */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  tempGps.isEnabled
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>Saklar Validasi Geofencing GPS:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tempGps.isEnabled
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {tempGps.isEnabled ? 'ON (AKTIF)' : 'OFF (NONAKTIF)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {tempGps.isEnabled
                      ? 'Proses absensi siswa hanya dapat dilakukan jika posisi GPS perangkat siswa berada di dalam radius yang telah ditentukan.'
                      : 'Proses absensi dapat dilakukan bebas dari lokasi mana saja tanpa pembatasan radius GPS.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={tempGps.isEnabled}
                    onChange={(e) =>
                      setTempGps({ ...tempGps, isEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              {/* Input Latitude & Longitude */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Latitude / Lintang Kantor (Contoh: -6.36791): *
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={tempGps.latitude}
                    onChange={(e) =>
                      setTempGps({ ...tempGps, latitude: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    DMS: {toDMSLatitude(tempGps.latitude)}
                  </p>
                </div>

                {/* Longitude */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Longitude / Bujur Kantor (Contoh: 106.26853): *
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={tempGps.longitude}
                    onChange={(e) =>
                      setTempGps({ ...tempGps, longitude: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    DMS: {toDMSLongitude(tempGps.longitude)}
                  </p>
                </div>
              </div>

              {/* Radius Jangkauan Absensi */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">
                      Batas Luas Jangkauan / Radius Absensi (Meter):
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Siswa dinyatakan di dalam kantor bila jarak &le; {tempGps.radiusMeters} Meter
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-700 text-white font-mono font-black text-sm rounded-lg shadow-xs shrink-0">
                    {tempGps.radiusMeters} Meter
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={tempGps.radiusMeters}
                  onChange={(e) =>
                    setTempGps({ ...tempGps, radiusMeters: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-700 cursor-pointer"
                />

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Pilihan Cepat Radius:</span>
                  {[50, 100, 200, 300, 500, 1000].map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => setTempGps({ ...tempGps, radiusMeters: rad })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        tempGps.radiusMeters === rad
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {rad}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama & Alamat Kantor */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Instansi / Kantor: *</label>
                  <input
                    type="text"
                    required
                    value={tempGps.officeName}
                    onChange={(e) => setTempGps({ ...tempGps, officeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Kantor: *</label>
                  <input
                    type="text"
                    required
                    value={tempGps.officeAddress}
                    onChange={(e) => setTempGps({ ...tempGps, officeAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetGpsConfig}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Kemenag Lebak</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Titik GPS</span>
                </button>
              </div>
            </form>

            {/* Right Map Preview & Device Test (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <GpsMapPreview
                  centerLat={tempGps.latitude}
                  centerLng={tempGps.longitude}
                  radiusMeters={tempGps.radiusMeters}
                  officeName={tempGps.officeName}
                  userLat={testUserLat}
                  userLng={testUserLng}
                  distanceMeters={testDistance}
                  heightClass="h-80"
                  onSelectCoordinates={(lat, lng) => {
                    setTempGps({
                      ...tempGps,
                      latitude: Number(lat.toFixed(5)),
                      longitude: Number(lng.toFixed(5)),
                    });
                  }}
                />

                <p className="text-[10px] text-slate-500 italic">
                  * Tips: Anda dapat mengklik titik manapun pada peta di atas untuk memperbarui koordinat Latitude &amp; Longitude secara presisi.
                </p>

                {/* Device GPS Testing Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Uji Coba GPS Perangkat Anda</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleTestDeviceGps}
                      disabled={gpsTestingLoading}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:bg-slate-400"
                    >
                      <Compass className={`w-3.5 h-3.5 ${gpsTestingLoading ? 'animate-spin' : ''}`} />
                      <span>{gpsTestingLoading ? 'Mengambil GPS...' : 'Cek Lokasi Saya'}</span>
                    </button>
                  </div>

                  {gpsTestError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{gpsTestError}</span>
                    </div>
                  )}

                  {testDistance != null && testUserLat != null && testUserLng != null && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        testDistance <= tempGps.radiusMeters
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Hasil Perhitungan Jarak:</span>
                        <span className="font-mono text-sm">{testDistance} Meter</span>
                      </div>
                      <p className="text-[11px]">
                        {testDistance <= tempGps.radiusMeters ? (
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Lokasi Anda DI DALAM jangkauan absensi ({tempGps.radiusMeters}m).
                          </span>
                        ) : (
                          <span className="font-bold text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Lokasi Anda DI LUAR jangkauan absensi ({testDistance - tempGps.radiusMeters}m dari batas luar).
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Sistem Baru'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pegawai *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.nama}
                    onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Pegawai *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.nip}
                    onChange={(e) => setUserFormData({ ...userFormData, nip: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan Pegawai *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.jabatan}
                    onChange={(e) => setUserFormData({ ...userFormData, jabatan: e.target.value })}
                    placeholder="Contoh: Pranata Komputer / Kasi"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.noHp}
                    onChange={(e) => setUserFormData({ ...userFormData, noHp: e.target.value })}
                    placeholder="08..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* 13 Seksi Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit Sub Bagian / Seksi (Dropdown 13 Pilihan Lengkap) *
                </label>
                <select
                  value={userFormData.seksi}
                  disabled={!isSuperOrAdmin}
                  onChange={(e) => setUserFormData({ ...userFormData, seksi: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600"
                >
                  {SUBBAG_SEKSI_OPTIONS.map((seksi) => (
                    <option key={seksi} value={seksi}>
                      {seksi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hak Akses / Role Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilihan Hak Akses / Role:
                </label>
                <select
                  value={userFormData.role}
                  disabled={!isSuperOrAdmin}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold focus:outline-emerald-600"
                >
                  <option value="super_admin">Super Admin (Akses Seluruh Menu &amp; Seksi)</option>
                  <option value="admin">Admin (Akses Seluruh Menu &amp; Seksi)</option>
                  <option value="admin_seksi">Admin Seksi (Hanya Mengakses Siswa di Seksi Tersebut)</option>
                  <option value="opr_pembimbing">Opr Pembimbing (Hanya Mengakses Siswa di Seksi Tersebut)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Simpan Data Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
