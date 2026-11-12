import React from 'react';
import {
  Users,
  CalendarCheck,
  BookOpen,
  Award,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { AppUser, Student, AttendanceRecord, DailyActivity, Assessment } from '../../types';

interface AdminDashboardViewProps {
  currentUser: AppUser;
  students: Student[];
  attendanceList: AttendanceRecord[];
  activityList: DailyActivity[];
  assessments: Assessment[];
  onNavigateTab: (tabId: string) => void;
  onOpenWaModal: (record: AttendanceRecord, student: Student) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  students,
  attendanceList,
  activityList,
  assessments,
  onNavigateTab,
  onOpenWaModal,
}) => {
  // If user is Admin Seksi or Opr Pembimbing, filter students by their section
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';
  const relevantStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  const relevantStudentIds = new Set(relevantStudents.map((s) => s.id));
  const relevantStudentNisns = new Set(relevantStudents.map((s) => s.nisn));

  const relevantAttendance = attendanceList.filter(
    (a) => relevantStudentIds.has(a.studentId) || relevantStudentNisns.has(a.nisn)
  );

  const relevantActivities = activityList.filter(
    (act) => relevantStudentIds.has(act.studentId) || relevantStudentNisns.has(act.nisn)
  );

  const unverifiedActivities = relevantActivities.filter(
    (act) => act.statusVerifikasi === 'Menunggu' || !act.statusVerifikasi
  );

  const totalHadir = relevantAttendance.filter((a) => a.status === 'Hadir').length;
  const totalSakit = relevantAttendance.filter((a) => a.status === 'Sakit').length;
  const totalAlfa = relevantAttendance.filter((a) => a.status === 'Alfa').length;
  const totalIzin = relevantAttendance.filter((a) => a.status === 'Izin').length;

  const attendanceRate =
    relevantAttendance.length > 0
      ? ((totalHadir / relevantAttendance.length) * 100).toFixed(1)
      : '100';

  const relevantAssessments = assessments.filter(
    (ass) => relevantStudentIds.has(ass.studentId) || relevantStudentNisns.has(ass.nisn)
  );

  const avgScore =
    relevantAssessments.length > 0
      ? (
          relevantAssessments.reduce((acc, curr) => acc + curr.nilaiRataRata, 0) /
          relevantAssessments.length
        ).toFixed(1)
      : '-';

  // Sections distribution
  const seksiCounts: Record<string, number> = {};
  relevantStudents.forEach((s) => {
    seksiCounts[s.tempatPenugasan] = (seksiCounts[s.tempatPenugasan] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Dashboard Analisis Performa Siswa PKL / Magang
          </h2>
          <p className="text-xs text-slate-500">
            {isRestricted ? (
              <span className="text-emerald-700 font-semibold">
                Unit Kerja: {currentUser.seksi} &bull; Menampilkan data siswa binaan seksi Anda
              </span>
            ) : (
              'Monitoring Terpadu Seluruh Unit Sub Bagian dan Seksi Kantor Kemenag Kabupaten Lebak'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('admin_siswa')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            + Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('admin_siswa')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Siswa PKL</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {relevantStudents.length}
            </span>
            <span className="text-xs text-slate-500">Peserta</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {relevantStudents.filter((s) => s.status === 'Aktif').length} Berstatus Aktif
          </p>
        </div>

        {/* Tingkat Kehadiran */}
        <div
          onClick={() => onNavigateTab('admin_absensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tingkat Kehadiran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {attendanceRate}%
            </span>
            <span className="text-xs text-slate-500">Persentase</span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            {totalHadir} Hadir &bull; {totalSakit} Sakit &bull; {totalAlfa} Alfa
          </p>
        </div>

        {/* Nilai Rata-rata */}
        <div
          onClick={() => onNavigateTab('admin_penilaian')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rata-rata Nilai Prestasi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {avgScore}
            </span>
            <span className="text-xs text-slate-500">Skala 100</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {relevantAssessments.length} Siswa Sudah Dinilai
          </p>
        </div>

        {/* Total Log Kegiatan & Notifikasi Belum Diverifikasi */}
        <div
          onClick={() => onNavigateTab('admin_kegiatan')}
          className={`bg-white p-5 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            unverifiedActivities.length > 0
              ? 'border-amber-300 ring-2 ring-amber-400/30 hover:border-amber-400'
              : 'border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Jurnal Aktivitas Harian</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              unverifiedActivities.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-purple-50 text-purple-700'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {relevantActivities.length}
            </span>
            <span className="text-xs text-slate-500">Log Masuk</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {unverifiedActivities.length > 0 ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {unverifiedActivities.length} Belum Diverifikasi
              </span>
            ) : (
              <p className="text-[11px] text-emerald-700 font-medium">
                {relevantActivities.filter((a) => a.statusVerifikasi === 'Disetujui').length} Log Diverifikasi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ALERT SECTION: Jurnal Aktivitas Harian Siswa Belum Diverifikasi */}
      {unverifiedActivities.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>Perhatian: Ada {unverifiedActivities.length} Jurnal Kegiatan Siswa Belum Diverifikasi</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                    Menunggu Verifikasi
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Pembimbing Kantor dan Admin Seksi diharapkan meninjau serta memverifikasi capaian output tugas harian siswa.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('admin_kegiatan')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verifikasi Semua di Menu Kegiatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-amber-200/60 text-xs">
            {unverifiedActivities.slice(0, 4).map((act) => {
              const matchedStudent = students.find(
                (s) => s.id === act.studentId || s.nisn === act.nisn
              );
              return (
                <div
                  key={act.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-amber-300 shrink-0 mt-0.5">
                      <img
                        src={matchedStudent?.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                        alt={act.studentNama}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 font-bold">{act.studentNama}</strong>
                        <span className="text-[10px] font-mono text-slate-500">NISN: {act.nisn}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-700 border border-amber-200 font-medium">
                          {act.seksi}
                        </span>
                        <span className="text-[10px] font-mono text-amber-900 font-semibold">
                          {act.tanggal} ({act.jamMulai} - {act.jamSelesai})
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium mt-1 leading-snug">
                        {act.uraianKegiatan}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        <strong className="text-slate-700">Output:</strong> {act.outputKegiatan}
                        {act.kendala && (
                          <span className="text-rose-700 italic ml-2">&bull; Kendala: {act.kendala}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('admin_kegiatan')}
                    className="self-end sm:self-center px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    Tinjau Jurnal &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Alerts / Sakit / Alfa Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Perhatian: Status Ketidakhadiran Siswa (Kirim Notifikasi WA)
            </h3>
            <p className="text-xs text-slate-500">
              Kirimkan pemberitahuan resmi instansi ke Guru / Dosen Pembimbing Sekolah via WhatsApp
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin_absensi')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Buka Kelola Absensi &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {relevantAttendance
            .filter((a) => a.status === 'Sakit' || a.status === 'Alfa' || a.status === 'Izin')
            .slice(0, 4)
            .map((att) => {
              const matchedStudent = students.find(
                (s) => s.id === att.studentId || s.nisn === att.nisn
              );
              return (
                <div
                  key={att.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        att.status === 'Sakit'
                          ? 'bg-amber-100 text-amber-800'
                          : att.status === 'Alfa'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {att.status}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{att.studentNama}</p>
                      <p className="text-slate-500 text-[11px]">
                        {att.tanggal} &bull; {att.seksi} &bull; Ket: {att.keterangan || '-'}
                      </p>
                    </div>
                  </div>

                  {matchedStudent && (
                    <button
                      onClick={() => onOpenWaModal(att, matchedStudent)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim WA ke Pembimbing</span>
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Distribution per Seksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="font-bold text-sm text-slate-800 mb-1">
          Distribusi Penempatan Siswa Magang Berdasarkan Subbag / Seksi
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pemetaan 13 unit kerja di lingkungan Kantor Kemenag Kabupaten Lebak
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {Object.entries(seksiCounts).map(([seksiName, count]) => (
            <div
              key={seksiName}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{seksiName}</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                {count} Siswa
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
