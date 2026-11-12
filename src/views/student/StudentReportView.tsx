import React, { useState } from 'react';
import {
  CalendarCheck,
  BookOpen,
  Award,
  Printer,
  Filter,
  CheckCircle2,
  FileText,
  AlertTriangle,
  UserCheck,
  Lock,
  Info
} from 'lucide-react';
import { Student, AttendanceRecord, DailyActivity, Assessment } from '../../types';
import { DocumentType } from '../../components/PrintOfficialModal';

interface StudentReportViewProps {
  student: Student;
  attendanceList: AttendanceRecord[];
  activityList: DailyActivity[];
  assessments: Assessment[];
  onOpenPrintModal: (type: DocumentType) => void;
}

export const StudentReportView: React.FC<StudentReportViewProps> = ({
  student,
  attendanceList,
  activityList,
  assessments,
  onOpenPrintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'kehadiran' | 'kegiatan' | 'penilaian'>('kehadiran');
  const [filterMode, setFilterMode] = useState<'bulan' | 'rentang' | 'semua'>('bulan');
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filterYear, setFilterYear] = useState('2026');
  const [filterStartDate, setFilterStartDate] = useState('2026-11-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-11-30');

  // State untuk popup peringatan kegiatan belum diverifikasi
  const [showUnapprovedPopup, setShowUnapprovedPopup] = useState(false);

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  // Filter kehadiran berdasarkan siswa yang sedang login dan filter waktu yang dipilih
  const myAttendance = attendanceList.filter((a) => {
    const isMe =
      (a.studentId && student.id && a.studentId === student.id) ||
      (a.nisn && student.nisn && a.nisn === student.nisn) ||
      (a.studentNama && student.nama && a.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim());
    if (!isMe) return false;
    if (filterMode === 'semua') return true;

    if (filterMode === 'bulan') {
      const parts = a.tanggal.split('-');
      if (parts.length >= 2) {
        return parts[1] === filterMonth && parts[0] === filterYear;
      }
      return true;
    }

    if (filterMode === 'rentang') {
      if (filterStartDate && a.tanggal < filterStartDate) return false;
      if (filterEndDate && a.tanggal > filterEndDate) return false;
      return true;
    }

    return true;
  });

  // [PERBAIKAN UTAMA] Memfilter kegiatan harian secara ketat sesuai user siswa yang sedang aktif
  const myActivities = activityList.filter((a) => {
    return (
      (a.studentId && student.id && a.studentId === student.id) ||
      (a.nisn && student.nisn && a.nisn === student.nisn) ||
      (a.studentNama && student.nama && a.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim())
    );
  });

  const myAssessment = assessments.find(
    (ass) =>
      (ass.studentId && student.id && ass.studentId === student.id) ||
      (ass.nisn && student.nisn && ass.nisn === student.nisn) ||
      (ass.studentNama && student.nama && ass.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim())
  );

  // Cek apakah ada kegiatan siswa yang belum disetujui / diverifikasi oleh pembimbing atau admin seksi
  const unapprovedActivities = myActivities.filter(
    (act) => act.statusVerifikasi !== 'Disetujui'
  );

  const handlePrintKegiatan = () => {
    // Aturan: bila ada kegiatan yang belum disetujui, munculkan pesan popup khusus
    if (unapprovedActivities.length > 0) {
      setShowUnapprovedPopup(true);
      return;
    }
    onOpenPrintModal('rekap_kegiatan_siswa');
  };

  const handlePrintClick = () => {
    if (activeTab === 'penilaian') {
      onOpenPrintModal('cetak_penilaian');
    } else if (activeTab === 'kegiatan') {
      handlePrintKegiatan();
    } else {
      onOpenPrintModal('rekap_kehadiran_siswa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laporan &amp; Prestasi Magang</h2>
          <p className="text-xs text-slate-500">
            Rekapitulasi riwayat kehadiran, jurnal kegiatan harian, dan lembar sertifikat penilaian akhir resmi.
          </p>
        </div>

        {/* Print Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeTab === 'penilaian' && !myAssessment ? (
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
              Belum dilakukan penilaian oleh Pembimbing / Admin Seksi
            </span>
          ) : activeTab === 'penilaian' ? (
            <button
              disabled
              title="User siswa hanya bisa melihat nilai (tidak bisa cetak nilai)"
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 border border-slate-300 rounded-xl text-xs font-bold shadow-none cursor-not-allowed opacity-80"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Cetak Lembar Nilai (Disabled)</span>
            </button>
          ) : (
            <button
              onClick={handlePrintClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {activeTab === 'kegiatan'
                  ? 'Cetak Jurnal Kegiatan'
                  : 'Cetak Rekap Kehadiran'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('kehadiran')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'kehadiran'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Tab Report Kehadiran</span>
        </button>

        <button
          onClick={() => setActiveTab('kegiatan')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'kegiatan'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tab Report Kegiatan Harian</span>
        </button>

        <button
          onClick={() => setActiveTab('penilaian')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'penilaian'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tab Report Penilaian</span>
        </button>
      </div>

      {/* TAB 1: REPORT KEHADIRAN */}
      {activeTab === 'kehadiran' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-emerald-700" />
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFilterMode('bulan')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    filterMode === 'bulan'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan &amp; Tahun
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('rentang')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    filterMode === 'rentang'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rentang Tanggal
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('semua')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    filterMode === 'semua'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
              </div>

              {filterMode === 'bulan' && (
                <div className="flex items-center gap-1.5 ml-1">
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-emerald-600"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              )}

              {filterMode === 'rentang' && (
                <div className="flex items-center gap-1 font-mono text-[11px] ml-1">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                  <span className="text-slate-400">s.d.</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Hadir: {myAttendance.filter((a) => a.status === 'Hadir').length}
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Sakit: {myAttendance.filter((a) => a.status === 'Sakit').length}
              </span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Izin: {myAttendance.filter((a) => a.status === 'Izin').length}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Alfa: {myAttendance.filter((a) => a.status === 'Alfa').length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Pulang</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada rekaman kehadiran untuk filter terpilih.
                    </td>
                  </tr>
                ) : (
                  myAttendance.map((att, idx) => (
                    <tr key={att.id || idx} className="hover:bg-slate-50/80">
                      <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold font-mono text-slate-900">{att.tanggal}</td>
                      <td className="p-3 font-mono">{att.jamMasuk}</td>
                      <td className="p-3 font-mono">{att.jamPulang}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            att.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'Sakit'
                              ? 'bg-amber-100 text-amber-800'
                              : att.status === 'Izin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{att.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REPORT KEGIATAN HARIAN */}
      {activeTab === 'kegiatan' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Rekapitulasi Seluruh Jurnal Kegiatan Harian
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daftar seluruh tugas, jam operasional, output capaian, dan kendala lapangan yang tercatat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                Total {myActivities.length} Kegiatan
              </span>
              <button
                onClick={handlePrintKegiatan}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Pratinjau &amp; Cetak Jurnal Resmi</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3 w-8 text-center">No</th>
                    <th className="p-3 w-28">Tanggal &amp; Waktu</th>
                    <th className="p-3">Uraian Tugas / Kegiatan</th>
                    <th className="p-3">Output Hasil</th>
                    <th className="p-3">Kendala</th>
                    <th className="p-3 w-28">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Belum ada data jurnal kegiatan yang dilaporkan.
                      </td>
                    </tr>
                  ) : (
                    myActivities.map((act, idx) => (
                      <tr key={act.id || idx} className="hover:bg-slate-50/80">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono">
                          <div className="font-semibold text-slate-900">{act.tanggal}</div>
                          <div className="text-[10px] text-slate-500">{act.jamMulai} - {act.jamSelesai}</div>
                        </td>
                        <td className="p-3 text-slate-800 max-w-sm">{act.uraianKegiatan}</td>
                        <td className="p-3 text-slate-700">{act.outputKegiatan}</td>
                        <td className="p-3 text-slate-500 italic">{act.kendala || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              act.statusVerifikasi === 'Disetujui'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {act.statusVerifikasi}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT PENILAIAN */}
      {activeTab === 'penilaian' && (
        <div className="space-y-6">
          {myAssessment ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Notice Hak Akses Siswa */}
              <div className="p-3 bg-slate-100 border-b border-slate-200 text-slate-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>Akses Siswa (Hanya Lihat Nilai):</strong> Anda dapat melihat rincian 6 unsur nilai magang. Dokumen cetak lembar nilai resmi hanya dapat dicetak oleh Pembimbing / Admin.
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[10px] shrink-0">
                  Cetak Disabled
                </span>
              </div>

              {/* Score Header */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Hasil Penilaian Akhir Resmi
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{student.nama}</h3>
                  <p className="text-xs text-emerald-200">
                    Penilai: {myAssessment.penilaiNama} (NIP. {myAssessment.penilaiNip})
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/15">
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-200 uppercase block">Nilai Rata-rata</span>
                    <span className="text-3xl font-black font-mono tabular-nums text-white">
                      {myAssessment.nilaiRataRata.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-200 uppercase block">Predikat</span>
                    <span className="text-lg font-bold text-amber-300">
                      Grade {myAssessment.grade} ({myAssessment.predikat})
                    </span>
                  </div>
                </div>
              </div>

              {/* 6 Aspects breakdown */}
              <div className="p-6 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
                  Rincian 6 Unsur Aspek Penilaian Kemenag Lebak
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: '1. Kedisiplinan & Kehadiran', score: myAssessment.kedisiplinan },
                    { label: '2. Inisiatif & Kreativitas', score: myAssessment.inisiatif },
                    { label: '3. Kerjasama & Komunikasi', score: myAssessment.kerjasama },
                    { label: '4. Tanggung Jawab Penugasan', score: myAssessment.tanggungJawab },
                    { label: '5. Kebersihan & Kerapian', score: myAssessment.kebersihan },
                    {
                      label: `6. Bidang Keahlian: ${myAssessment.namaBidangKeahlian}`,
                      score: myAssessment.nilaiBidangKeahlian,
                      isSpecial: true,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        item.isSpecial
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-slate-600 font-medium block truncate">{item.label}</span>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                          {item.score}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.score >= 90 ? 'Grade A' : item.score >= 80 ? 'Grade B' : item.score >=70 ? 'Grade C' : 'Grade D'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Catatan Pembimbing */}
                {myAssessment.catatan && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Catatan Evaluasi Pembimbing:</span>
                    <p className="text-slate-600 leading-relaxed italic">{myAssessment.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 sm:p-14 rounded-2xl border-2 border-dashed border-amber-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Belum Dilakukan Penilaian
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Pembimbing Kantor atau Admin Seksi belum melakukan penilaian prestasi magang untuk Anda. Formulir rincian nilai dan lembar sertifikat nilai resmi tidak ditampilkan sampai penilaian diterbitkan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Popup: Bila ada kegiatan yang belum disetujui pembimbing / admin seksi */}
      {showUnapprovedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-amber-300 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Peringatan Cetak Jurnal Kegiatan
              </h3>
              {/* Pesan Popup Sesuai Permintaan Persis */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl font-bold text-xs sm:text-sm leading-relaxed">
                “Ada kegiatan yang belum di verifikasi/disetujui, silakan hubungi Pembimbing anda!”
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Kegiatan Belum Disetujui:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono text-[11px]">
                  {unapprovedActivities.length} Kegiatan
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Laporan jurnal kegiatan hanya dapat dicetak dalam format resmi apabila seluruh riwayat aktivitas telah diverifikasi &amp; disetujui (Disetujui) oleh Pembimbing Kantor atau Admin Seksi.
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Pembimbing Kantor:</span>{' '}
                  {student.pembimbingKantor || 'Dian Permana, S.Kom.'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">No. WA / HP:</span>{' '}
                  <span className="font-mono font-bold text-emerald-700">
                    {student.noHpPembimbing || '081298765432'}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowUnapprovedPopup(false)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tutup &amp; Hubungi Pembimbing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};