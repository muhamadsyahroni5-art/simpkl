import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CalendarCheck,
  Award,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { Student, AttendanceRecord, Assessment, AppUser } from '../../types';
import { DocumentType } from '../../components/PrintOfficialModal';

interface AdminReportsViewProps {
  currentUser: AppUser;
  students: Student[];
  attendanceList: AttendanceRecord[];
  assessments: Assessment[];
  onOpenPrintModal: (
    type: DocumentType,
    student?: Student,
    rekapFilter?: { status: string; month: string; year: string }
  ) => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  currentUser,
  students,
  attendanceList,
  assessments,
  onOpenPrintModal,
}) => {
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';

  const availableStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  // Filter students who have been assessed for Lembar Nilai & Sertifikat Magang
  const assessedStudents = availableStudents.filter((s) =>
    assessments.some(
      (ass) =>
        (ass.studentId && s.id && ass.studentId === s.id) ||
        (ass.nisn && s.nisn && ass.nisn === s.nisn) ||
        (ass.studentNama && s.nama && ass.studentNama.toLowerCase().trim() === s.nama.toLowerCase().trim())
    )
  );

  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState<string>(
    availableStudents[0]?.id || ''
  );
  const [selectedStudentForActivity, setSelectedStudentForActivity] = useState<string>(
    availableStudents[0]?.id || ''
  );
  const [selectedStudentForAssessment, setSelectedStudentForAssessment] = useState<string>(
    assessedStudents[0]?.id || ''
  );
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] = useState<string>(
    assessedStudents[0]?.id || ''
  );
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Filter state for Rekapitulasi Data Siswa PKL / Magang
  const [rekapStatusFilter, setRekapStatusFilter] = useState<string>('Aktif');
  const [rekapMonthFilter, setRekapMonthFilter] = useState<string>('Semua');
  const [rekapYearFilter, setRekapYearFilter] = useState<string>(String(new Date().getFullYear()));

  // Calculate filtered students count for Card 3
  const filteredRekapCount = availableStudents.filter((s) => {
    // Status filter
    if (rekapStatusFilter !== 'Semua' && rekapStatusFilter !== 'Semua Status') {
      if (rekapStatusFilter === 'Non-Aktif') {
        if (s.status === 'Aktif') return false;
      } else {
        if (s.status !== rekapStatusFilter) return false;
      }
    }

    // Year filter
    if (rekapYearFilter !== 'Semua' && rekapYearFilter !== 'Semua Tahun') {
      const startYear = s.tanggalMulai ? s.tanggalMulai.split('-')[0] : s.tahun;
      const endYear = s.tanggalSelesai ? s.tanggalSelesai.split('-')[0] : s.tahun;
      const matchYear = s.tahun === rekapYearFilter || startYear === rekapYearFilter || endYear === rekapYearFilter;
      if (!matchYear) return false;
    }

    // Month filter
    if (rekapMonthFilter !== 'Semua' && rekapMonthFilter !== 'Semua Bulan') {
      const monthFormatted = rekapMonthFilter.padStart(2, '0');
      const startMonth = s.tanggalMulai ? s.tanggalMulai.split('-')[1] : '';
      const endMonth = s.tanggalSelesai ? s.tanggalSelesai.split('-')[1] : '';
      let matchMonth = startMonth === monthFormatted || endMonth === monthFormatted;

      if (!matchMonth && s.tanggalMulai && s.tanggalSelesai) {
        const y = rekapYearFilter !== 'Semua' ? parseInt(rekapYearFilter, 10) : new Date().getFullYear();
        const m = parseInt(rekapMonthFilter, 10);
        const startDate = new Date(s.tanggalMulai);
        const endDate = new Date(s.tanggalSelesai);
        const targetStart = new Date(y, m - 1, 1);
        const targetEnd = new Date(y, m, 0);
        if (startDate <= targetEnd && endDate >= targetStart) {
          matchMonth = true;
        }
      }

      if (!matchMonth) return false;
    }

    return true;
  }).length;

  // Excel Export Handler
  const handleExportExcel = () => {
    // Generate CSV with BOM so Excel displays Indonesian characters properly
    const headers = [
      'No',
      'Nama Siswa/Mahasiswa',
      'NISN',
      'Asal Sekolah / Perguruan Tinggi',
      'Program Keahlian',
      'Tempat Penugasan (Seksi)',
      'Pembimbing Sekolah',
      'No HP Pembimbing Sekolah',
      'Pembimbing Kantor Kemenag',
      'NIP Pembimbing Kantor',
      'Status Magang',
      'Tahun PKL'
    ];

    const rows = availableStudents.map((s, idx) => [
      idx + 1,
      `"${s.nama}"`,
      `'${s.nisn}`,
      `"${s.asalSekolah}"`,
      `"${s.programKeahlian}"`,
      `"${s.tempatPenugasan}"`,
      `"${s.pembimbingSekolah}"`,
      `"${s.noHpPembimbing}"`,
      `"${s.pembimbingKantor}"`,
      `'${s.nipPembimbing}`,
      s.status,
      s.tahun,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap_siswa_pkl_kemenag_lebak_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Laporan Resmi &amp; Modul Cetak Dokumen Dinas
          </h2>
          <p className="text-xs text-slate-500">
            Format resmi Kop Surat Kementerian Agama RI, penomoran otomatis B-[NISN]/Kk.28.02.1/KS.00/bulan/tahun, dan tanda tangan dinas.
          </p>
        </div>

        {/* Download Excel Button */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Rekap Data Excel (.CSV)</span>
        </button>
      </div>

      {/* 5 Main Printable Official Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Document 1: Rekap Kehadiran Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Rekapitulasi Kehadiran Siswa
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dilengkapi filter bulan &amp; tahun, filter rentang tanggal, nomor dinas resmi, serta penandatangan Pembimbing Kantor &amp; Siswa.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Pilih Siswa:</label>
              <select
                value={selectedStudentForAttendance}
                onChange={(e) => setSelectedStudentForAttendance(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const std = availableStudents.find((s) => s.id === selectedStudentForAttendance);
                onOpenPrintModal('rekap_kehadiran_siswa', std);
              }}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Pratinjau &amp; Cetak</span>
            </button>
          </div>
        </div>

        {/* Document 2: Laporan Jurnal Kegiatan Harian Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Laporan Jurnal Kegiatan Harian
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tabel jurnal tugas, jam operasional, output capaian, kendala, serta penandatangan Pembimbing Kantor &amp; Siswa.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Pilih Siswa:</label>
              <select
                value={selectedStudentForActivity}
                onChange={(e) => setSelectedStudentForActivity(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const std = availableStudents.find((s) => s.id === selectedStudentForActivity);
                onOpenPrintModal('rekap_kegiatan_siswa', std);
              }}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Pratinjau &amp; Cetak</span>
            </button>
          </div>
        </div>

        {/* Document 3: Rekapitulasi Data Siswa PKL/ Magang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Rekapitulasi Data Siswa PKL/ Magang
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Laporan kolektif seluruh siswa PKL/Magang berdasarkan filter status, bulan, dan tahun penugasan di Kemenag Lebak dengan tanda tangan Kasubbag TU.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            {/* Filters: Status Siswa, Bulan, Tahun */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Status Siswa:</label>
                <select
                  value={rekapStatusFilter}
                  onChange={(e) => setRekapStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-semibold focus:bg-white focus:outline-blue-600"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Berhenti/Pindah">Non-Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Bulan:</label>
                <select
                  value={rekapMonthFilter}
                  onChange={(e) => setRekapMonthFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-semibold focus:bg-white focus:outline-blue-600"
                >
                  <option value="Semua">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Tahun:</label>
                <select
                  value={rekapYearFilter}
                  onChange={(e) => setRekapYearFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-semibold focus:bg-white focus:outline-blue-600"
                >
                  <option value="Semua">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700 text-[11px]">
              Terdapat <strong>{filteredRekapCount} Siswa</strong> ditemukan berdasarkan filter terpilih.
            </div>

            <button
              onClick={() => onOpenPrintModal('rekap_kehadiran_aktif', undefined, {
                status: rekapStatusFilter,
                month: rekapMonthFilter,
                year: rekapYearFilter,
              })}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap Kolektif</span>
            </button>
          </div>
        </div>

        {/* Document 4: Cetak Lembar Penilaian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Cetak Lembar Nilai Resmi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sertifikat nilai 6 aspek, grade A-D &amp; predikat, bertandatangan Kasubbag TU &amp; Pembimbing Kantor Kemenag Lebak.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Pilih Siswa (Sudah Dinilai):</label>
              <select
                value={selectedStudentForAssessment}
                onChange={(e) => setSelectedStudentForAssessment(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                {assessedStudents.length === 0 ? (
                  <option value="">(Belum Ada Siswa Dinilai)</option>
                ) : (
                  assessedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={() => {
                const std = assessedStudents.find((s) => s.id === selectedStudentForAssessment);
                onOpenPrintModal('cetak_penilaian', std);
              }}
              disabled={assessedStudents.length === 0}
              className={`w-full py-2 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                assessedStudents.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Nilai</span>
            </button>
          </div>
        </div>

        {/* Document 5: Cetak Sertifikat Magang (Bolak-Balik / 2 Lembar) - HANYA UNTUK SUPER_ADMIN & ADMIN */}
        {!isRestricted && (
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-600 transition-all bg-emerald-50/20">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  Cetak Sertifikat Magang
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                  Bolak-Balik
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Format 2 lembar: Lembar Depan (Sertifikat ttd Kepala Kantor Kemenag Lebak) &amp; Lembar Belakang (Transkrip nilai 6 aspek ttd Pembimbing Kantor).
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-emerald-100 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Pilih Siswa (Sudah Dinilai):</label>
                <select
                  value={selectedStudentForCertificate}
                  onChange={(e) => setSelectedStudentForCertificate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600"
                >
                  {assessedStudents.length === 0 ? (
                    <option value="">(Belum Ada Siswa Dinilai)</option>
                  ) : (
                    assessedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nisn})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={() => {
                  const std = assessedStudents.find((s) => s.id === selectedStudentForCertificate);
                  onOpenPrintModal('sertifikat_magang', std);
                }}
                disabled={assessedStudents.length === 0}
                className={`w-full py-2 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer ${
                  assessedStudents.length === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-emerald-800 hover:bg-emerald-900'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sertifikat (2 Lembar)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official Standards Reference Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Format Tata Naskah Dinas &amp; Kop Surat Resmi</span>
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Semua dokumen cetak yang dihasilkan telah disesuaikan secara presisi dengan format naskah dinas Kementerian Agama RI:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li><strong>Kop Surat Baris 1:</strong> KEMENTERIAN AGAMA REPUBLIK INDONESIA (Arial 14pt Tebal)</li>
          <li><strong>Kop Surat Baris 2:</strong> KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK (Arial 12pt Tebal)</li>
          <li><strong>Alamat &amp; Kontak:</strong> Jl. Siliwangi No. 2 Rangkasbitung &bull; (0252) 201319 (Arial 9pt)</li>
          <li><strong>Penomoran Dokumen:</strong> Format otomatis <code>B-[NISN]/Kk.28.02.1/KS.00/[bulan]/[tahun]</code></li>
          <li><strong>Legalitas Penandatanganan Rekap Kehadiran:</strong> Pembimbing Kantor Kemenag Kab. Lebak (sebelah kiri) dan Siswa PKL/Magang (sebelah kanan).</li>
          <li><strong>Legalitas Penandatanganan Jurnal Kegiatan Harian:</strong> Pembimbing Kantor Kemenag Kab. Lebak (sebelah kiri) dan Siswa PKL/Magang (sebelah kanan).</li>
          <li><strong>Legalitas Penandatanganan Lembar Nilai:</strong> Kepala Subbag Tata Usaha (sebelah kiri) dan Pembimbing Kantor Kemenag Kab. Lebak (sebelah kanan).</li>
        </ul>
      </div>
    </div>
  );
};
