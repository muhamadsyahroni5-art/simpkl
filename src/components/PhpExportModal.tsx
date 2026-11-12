import React, { useState } from 'react';
import {
  FolderDown,
  X,
  FileCode,
  Database,
  Copy,
  CheckCircle,
  Download,
  Terminal,
  ExternalLink,
  Server
} from 'lucide-react';
import JSZip from 'jszip';
import {
  DATABASE_SQL,
  PHP_KONEKSI,
  PHP_INDEX,
  PHP_LOGOUT,
  PHP_DASHBOARD_ADMIN,
  PHP_DASHBOARD_SISWA,
  PHP_ABSENSI_SISWA,
  PHP_KEGIATAN_SISWA,
  PHP_LAPORAN_SISWA,
  PHP_SISWA,
  PHP_ABSENSI,
  PHP_KEGIATAN,
  PHP_PENILAIAN,
  PHP_LAPORAN,
  PHP_USERS,
  PHP_RUNNING_TEXT,
  PHP_CETAK_DOKUMEN,
  PHP_README,
} from '../utils/phpSourceBundle';

interface PhpExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhpExportModal: React.FC<PhpExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const files = [
    { name: 'database.sql', content: DATABASE_SQL, icon: Database, lang: 'sql', desc: 'Struktur Database & Seed Data Kemenag Lebak' },
    { name: 'config/koneksi.php', content: PHP_KONEKSI, icon: FileCode, lang: 'php', desc: 'Koneksi PDO MySQL (Localhost root)' },
    { name: 'index.php', content: PHP_INDEX, icon: FileCode, lang: 'php', desc: 'Halaman Login Siswa & Pegawai' },
    { name: 'logout.php', content: PHP_LOGOUT, icon: FileCode, lang: 'php', desc: 'Handler Logout Session PHP' },
    { name: 'dashboard_admin.php', content: PHP_DASHBOARD_ADMIN, icon: FileCode, lang: 'php', desc: 'Dashboard & Sidebar Kiri Admin' },
    { name: 'dashboard_siswa.php', content: PHP_DASHBOARD_SISWA, icon: FileCode, lang: 'php', desc: 'Dashboard Siswa & Ringkasan Status' },
    { name: 'absensi_siswa.php', content: PHP_ABSENSI_SISWA, icon: FileCode, lang: 'php', desc: 'Presensi Kehadiran Siswa (Masuk/Pulang)' },
    { name: 'kegiatan_siswa.php', content: PHP_KEGIATAN_SISWA, icon: FileCode, lang: 'php', desc: 'Jurnal Kegiatan Harian Siswa (Format 24 Jam & Popup Validasi)' },
    { name: 'laporan_siswa.php', content: PHP_LAPORAN_SISWA, icon: FileCode, lang: 'php', desc: 'Laporan Dokumen & Nilai Prestasi Siswa' },
    { name: 'siswa.php', content: PHP_SISWA, icon: FileCode, lang: 'php', desc: 'Manajemen Data Siswa Magang & Filter Seksi' },
    { name: 'absensi.php', content: PHP_ABSENSI, icon: FileCode, lang: 'php', desc: 'Rekapitulasi Absensi & Kirim WA Pembimbing' },
    { name: 'kegiatan.php', content: PHP_KEGIATAN, icon: FileCode, lang: 'php', desc: 'Jurnal Kegiatan Harian (Format 24 Jam)' },
    { name: 'penilaian.php', content: PHP_PENILAIAN, icon: FileCode, lang: 'php', desc: 'Penilaian Prestasi Akhir (6 Aspek, Grade A-D)' },
    { name: 'laporan.php', content: PHP_LAPORAN, icon: FileCode, lang: 'php', desc: 'Laporan Dokumen Resmi & Download Excel' },
    { name: 'users.php', content: PHP_USERS, icon: FileCode, lang: 'php', desc: 'Manajemen User Admin & Hak Akses Seksi' },
    { name: 'running_text.php', content: PHP_RUNNING_TEXT, icon: FileCode, lang: 'php', desc: 'Setting Running Text Marquee & Timers' },
    { name: 'cetak_dokumen.php', content: PHP_CETAK_DOKUMEN, icon: FileCode, lang: 'php', desc: 'Cetak Dokumen Resmi Kop Surat & TTD' },
    { name: 'README.md', content: PHP_README, icon: Terminal, lang: 'markdown', desc: 'Petunjuk Instalasi di Laragon & XAMPP' },
  ];

  const [activeFileName, setActiveFileName] = useState('database.sql');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name.replace('/', '_');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add files to zip
      zip.file('database.sql', DATABASE_SQL);
      zip.folder('config')?.file('koneksi.php', PHP_KONEKSI);
      zip.file('index.php', PHP_INDEX);
      zip.file('logout.php', PHP_LOGOUT);
      zip.file('dashboard_admin.php', PHP_DASHBOARD_ADMIN);
      zip.file('dashboard_siswa.php', PHP_DASHBOARD_SISWA);
      zip.file('absensi_siswa.php', PHP_ABSENSI_SISWA);
      zip.file('kegiatan_siswa.php', PHP_KEGIATAN_SISWA);
      zip.file('laporan_siswa.php', PHP_LAPORAN_SISWA);
      zip.file('siswa.php', PHP_SISWA);
      zip.file('absensi.php', PHP_ABSENSI);
      zip.file('kegiatan.php', PHP_KEGIATAN);
      zip.file('penilaian.php', PHP_PENILAIAN);
      zip.file('laporan.php', PHP_LAPORAN);
      zip.file('users.php', PHP_USERS);
      zip.file('running_text.php', PHP_RUNNING_TEXT);
      zip.file('cetak_dokumen.php', PHP_CETAK_DOKUMEN);
      zip.file('README.md', PHP_README);

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'simagang-kemenag-lebak-php-mysql.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs no-print">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 sm:p-5 border-b border-emerald-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Paket Source Code PHP &amp; MySQL</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Laragon &amp; XAMPP Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sistem Informasi Manajemen Siswa PKL Kemenag Lebak (PHP 8.x + MySQL / MariaDB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg font-bold text-xs shadow-lg transition-all"
            >
              <FolderDown className="w-4 h-4" />
              <span>{isZipping ? 'Menyiapkan ZIP...' : 'Download ZIP Lengkap'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Explorer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/80 border-r border-slate-800/80 p-3 overflow-y-auto shrink-0 space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Daftar File PHP &amp; SQL
            </div>

            {files.map((file) => {
              const Icon = file.icon;
              const isSelected = activeFileName === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setActiveFileName(file.name)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{file.desc}</p>
                  </div>
                </button>
              );
            })}

            {/* Instruction box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Panduan Cepat:</span>
              </p>
              <p>
                1. Klik <b>Download ZIP Lengkap</b> di kanan atas.
              </p>
              <p>
                2. Ekstrak ke <code className="text-amber-300">c:/xampp/htdocs/</code> atau <code className="text-amber-300">c:/laragon/www/</code>
              </p>
              <p>
                3. Import file <code className="text-amber-300">database.sql</code> di phpMyAdmin.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File toolbar */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 font-mono text-emerald-300">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>{activeFile.name}</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  ({activeFile.desc})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadSingle}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File Ini</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/40">
              <pre className="whitespace-pre">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
