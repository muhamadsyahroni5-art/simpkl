import React from 'react';
import {
  CalendarCheck,
  BookOpen,
  Award,
  Clock,
  Building2,
  UserCheck,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Student, AttendanceRecord, DailyActivity, Assessment } from '../../types';
import { getJakartaDateString } from '../../utils/timeUtils';

interface StudentDashboardViewProps {
  student: Student;
  attendanceList: AttendanceRecord[];
  activityList: DailyActivity[];
  assessments: Assessment[];
  onNavigateTab: (tabId: string) => void;
  onQuickAttend: (status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin', ket: string) => void;
  isCompletedStudent?: boolean;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  attendanceList,
  activityList,
  assessments,
  onNavigateTab,
  onQuickAttend,
  isCompletedStudent = false,
}) => {
  const todayStr = getJakartaDateString();
  const todayAttendance = attendanceList.find(
    (a) => (a.studentId === student.id || a.nisn === student.nisn) && a.tanggal === todayStr
  );

  const studentActivities = activityList.filter(
    (act) => act.studentId === student.id || act.nisn === student.nisn
  );

  const myAssessment = assessments.find(
    (ass) => ass.studentId === student.id || ass.nisn === student.nisn
  );

  const isCompleted =
    student.status === 'Selesai' ||
    isCompletedStudent ||
    (myAssessment && myAssessment.nilaiRataRata > 0);

  const totalHadir = attendanceList.filter(
    (a) => (a.studentId === student.id || a.nisn === student.nisn) && a.status === 'Hadir'
  ).length;

  return (
    <div className="space-y-6">
      {/* Official SIMAGANG Header with Kemenag Logo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 p-1.5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-center">
            <img
              src="/assets/aistudio/media_1792507912355_fb074e24_71599073.png"
              alt="Logo Kementerian Agama Republik Indonesia"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
              Kementerian Agama Republik Indonesia &bull; Kantor Kab. Lebak
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              SIMAGANG KEMENAG LEBAK
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Sistem Informasi Anak Magang &bull; Penugasan {student.tempatPenugasan}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center sm:text-right">
            <div className="text-[10px] text-emerald-700 font-bold uppercase">Tahun Penugasan</div>
            <div className="text-sm font-black text-emerald-900">{student.tahun || '2026'}</div>
          </div>
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center sm:text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Status Magang</div>
            <div className="text-xs font-bold text-slate-800">{student.status || 'Aktif'}</div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg border border-emerald-700/40">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 p-1 border-2 border-emerald-400/40 shadow-inner shrink-0">
              <img
                src={student.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                alt={student.nama}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-300" />
                    Status: Magang Telah Selesai
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase tracking-wider">
                    Peserta PKL Aktif &bull; {student.tahun}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
                Selamat Datang, {student.nama}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                {student.programKeahlian} &bull; {student.asalSekolah}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-100">
                <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Penugasan: <strong className="text-white">{student.tempatPenugasan}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            {isCompleted ? (
              <button
                onClick={() => onNavigateTab('siswa_laporan')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Lihat Lembar Nilai</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('siswa_profile')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Edit Biodata Saya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* When completed: Show Graduation / Completed Card; Otherwise show Today's Attendance Bar */}
      {isCompleted ? (
        <div
          className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-6 rounded-2xl border border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderColor: '#b8d1f4' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                  Masa Magang / PKL Telah Selesai &amp; Nilai Resmi Telah Diterbitkan
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                  Selesai
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                Masa penugasan Anda di Kantor Kementerian Agama Kabupaten Lebak telah dinyatakan selesai.
                {myAssessment && myAssessment.nilaiRataRata > 0 ? (
                  <span>
                    {' '}Hasil evaluasi akhir Anda memperoleh predikat{' '}
                    <strong>
                      Grade {myAssessment.grade} ({myAssessment.predikat} &bull; Nilai Rata-rata: {myAssessment.nilaiRataRata.toFixed(1)})
                    </strong>.
                  </span>
                ) : (
                  <span> Nilai resmi telah disahkan oleh Pembimbing dan Kasubbag TU.</span>
                )}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1 italic">
                Formulir absensi kehadiran harian dan penginputan jurnal kegiatan harian telah ditutup secara otomatis. Anda dapat melihat serta mencetak Lembar Sertifikat Penilaian dan Rekapitulasi Resmi di menu Laporan &amp; Nilai Saya.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('siswa_laporan')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Buka Laporan &amp; Nilai Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          style={{ borderColor: '#b8d1f4' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                todayAttendance
                  ? todayAttendance.status === 'Hadir'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Status Kehadiran Hari Ini ({todayStr})
                </h2>
                {todayAttendance ? (
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Tercatat <strong>{todayAttendance.status}</strong> (Masuk: {todayAttendance.jamMasuk} &bull; Pulang: {todayAttendance.jamPulang})
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Anda belum mengisi presensi kehadiran hari ini.</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('siswa_absensi')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Riwayat Kehadiran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance counter */}
        <div
          onClick={() => onNavigateTab('siswa_absensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
          style={{ borderWidth: '1.8px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Hari Hadir</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalHadir}</span>
            <span className="text-xs text-slate-500">Hari Kerja</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Presensi Aktif &rarr;</p>
        </div>

        {/* Daily activities counter */}
        <div
          onClick={() => onNavigateTab('siswa_kegiatan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
          style={{ borderWidth: '1.8px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jurnal Kegiatan Harian</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{studentActivities.length}</span>
            <span className="text-xs text-slate-500">Aktivitas Terinput</span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Isi &amp; Kelola Jurnal &rarr;</p>
        </div>

        {/* Assessment & Grade */}
        <div
          onClick={() => onNavigateTab('siswa_laporan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
          style={{ borderWidth: '1.8px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nilai Prestasi Akhir</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {myAssessment ? (
              <>
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{myAssessment.nilaiRataRata.toFixed(1)}</span>
                <span className="text-xs font-bold text-emerald-700">Grade {myAssessment.grade} ({myAssessment.predikat})</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-400">Proses Penilaian</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Buka Lembar Penilaian &rarr;</p>
        </div>
      </div>

      {/* Info Pembimbing & Penugasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supervisor Kantor */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          style={{ borderWidth: '1.8px' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pembimbing Kantor Kemenag Kab. Lebak
              </h3>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {student.pembimbingKantor || 'Dian Permana, S.Kom.'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                NIP. {student.nipPembimbing || '199104192019031006'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Unit Kerja Penugasan:</span>
            <span className="font-semibold text-emerald-800">{student.tempatPenugasan}</span>
          </div>
        </div>

        {/* Supervisor Sekolah */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          style={{ borderWidth: '1.8px' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Guru / Dosen Pembimbing Sekolah
              </h3>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {student.pembimbingSekolah || 'Dedi Kurniawan, S.Pd.T.'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                No. WA: {student.noHpPembimbing || '081298765432'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Asal Sekolah / Kampus:</span>
            <span className="font-semibold text-slate-800 truncate">{student.asalSekolah}</span>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Jurnal Kegiatan Harian Terbaru</h3>
            <p className="text-xs text-slate-500">Catatan aktivitas magang yang telah Anda laporkan</p>
          </div>
          <button
            onClick={() => onNavigateTab('siswa_kegiatan')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {studentActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada jurnal kegiatan yang dicatat. Klik "Tambah Kegiatan" untuk mencatat aktivitas hari ini.
            </div>
          ) : (
            studentActivities.slice(0, 3).map((act) => (
              <div key={act.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {act.tanggal}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {act.jamMulai} - {act.jamSelesai}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      act.statusVerifikasi === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.statusVerifikasi === 'Perlu Revisi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {act.statusVerifikasi}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-2">
                  {act.uraianKegiatan}
                </p>
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Output: </span>
                  {act.outputKegiatan}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
