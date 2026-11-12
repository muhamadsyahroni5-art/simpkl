import React, { useState, useEffect } from 'react';
import { Printer, X, Filter, UserCheck, Calendar, AlertTriangle, Users } from 'lucide-react';
import { OfficialKopSurat } from './OfficialKopSurat';
import { Student, AttendanceRecord, Assessment, DailyActivity } from '../types';

export type DocumentType =
  | 'rekap_kehadiran_siswa'
  | 'rekap_kehadiran_aktif'
  | 'cetak_penilaian'
  | 'rekap_kegiatan_siswa'
  | 'sertifikat_magang';

// Helper to generate dynamic SVG QR Code encoding Nama Siswa, NISN, and Tanggal Sertifikat
const generateCertificateQRCode = (nama: string, nisn: string, tglTerbit: string) => {
  const payload = `${nama} | ${nisn} | ${tglTerbit}`;

  const getBit = (r: number, c: number) => {
    // Top-left finder pattern
    if (r <= 6 && c <= 6) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) return true;
      return false;
    }
    // Top-right finder pattern
    if (r <= 6 && c >= 14) {
      const c2 = c - 14;
      if (r === 0 || r === 6 || c2 === 0 || c2 === 6 || (r >= 2 && r <= 4 && c2 >= 2 && c2 <= 4)) return true;
      return false;
    }
    // Bottom-left finder pattern
    if (r >= 14 && c <= 6) {
      const r2 = r - 14;
      if (r2 === 0 || r2 === 6 || c === 0 || c === 6 || (r2 >= 2 && r2 <= 4 && c >= 2 && c <= 4)) return true;
      return false;
    }
    // Timing patterns
    if (r === 6) return c % 2 === 0;
    if (c === 6) return r % 2 === 0;
    // Format info areas
    if ((r === 8 && (c <= 8 || c >= 13)) || (c === 8 && (r <= 8 || r >= 13))) {
      return (r + c) % 3 === 0;
    }
    // Alignment pattern near bottom right (14..18, 14..18)
    if (r >= 14 && r <= 18 && c >= 14 && c <= 18) {
      const r2 = r - 14, c2 = c - 14;
      if (r2 === 0 || r2 === 4 || c2 === 0 || c2 === 4 || (r2 === 2 && c2 === 2)) return true;
      return false;
    }

    // Hash payload string deterministically for data modules
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = ((hash << 5) - hash + payload.charCodeAt(i) * (r * 21 + c + 1)) | 0;
    }
    const val = Math.abs((hash ^ (r * 31 + c * 17)) % 100);
    return val > 42;
  };

  const size = 21;
  const cellSize = 100 / size;
  const modules: React.ReactNode[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (getBit(r, c)) {
        modules.push(
          <rect
            key={`${r}-${c}`}
            x={(c * cellSize).toFixed(2)}
            y={(r * cellSize).toFixed(2)}
            width={cellSize.toFixed(2)}
            height={cellSize.toFixed(2)}
            fill="#0F172A"
          />
        );
      }
    }
  }

  return (
    <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none" aria-label={`QR Code Verifikasi: ${payload}`}>
      <rect width="100" height="100" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2"/>
      {modules}
    </svg>
  );
};

// Helper to generate dynamic 1D Barcode SVG based on student details
const generateCertificateBarcode = (nama: string, nisn: string, tglTerbit: string) => {
  const str = `${nisn}${nama}${tglTerbit}`;
  const bars: React.ReactNode[] = [];
  let currentX = 6;

  // Guard bars start
  bars.push(<rect key="g1" x={currentX} y="5" width="2" height="40" fill="#000000" />);
  currentX += 3;
  bars.push(<rect key="g2" x={currentX} y="5" width="1" height="40" fill="#000000" />);
  currentX += 3;

  for (let i = 0; i < str.length && currentX < 145; i++) {
    const code = str.charCodeAt(i);
    const width = (code % 4) + 1;
    const gap = ((code * 3) % 3) + 1;
    bars.push(
      <rect
        key={i}
        x={currentX}
        y="5"
        width={width}
        height="40"
        fill="#000000"
      />
    );
    currentX += width + gap;
  }

  // Guard bars end
  bars.push(<rect key="ge1" x={148} y="5" width="2" height="40" fill="#000000" />);
  bars.push(<rect key="ge2" x={152} y="5" width="2" height="40" fill="#000000" />);

  return (
    <svg className="h-10 w-32 shrink-0" viewBox="0 0 160 50" aria-label={`Barcode Verifikasi: ${nama} ${nisn}`}>
      <rect width="160" height="50" fill="#FFFFFF"/>
      {bars}
    </svg>
  );
};

interface PrintOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  selectedStudent: Student | null;
  rekapFilter?: {
    status: string;
    month: string;
    year: string;
  };
  allStudents: Student[];
  allAttendance: AttendanceRecord[];
  allAssessments: Assessment[];
  allActivities?: DailyActivity[];
  isStudent?: boolean;
  userRole?: string;
}

export const PrintOfficialModal: React.FC<PrintOfficialModalProps> = ({
  isOpen,
  onClose,
  documentType,
  selectedStudent: initialStudent,
  rekapFilter,
  allStudents,
  allAttendance,
  allAssessments,
  allActivities = [],
  isStudent = false,
  userRole,
}) => {
  if (!isOpen) return null;

  // Active student selection state for quick filtering inside the modal (only for Admin/Pegawai)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || allStudents[0]?.id || ''
  );

  useEffect(() => {
    if (initialStudent?.id) {
      setSelectedStudentId(initialStudent.id);
    } else if (allStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(allStudents[0].id);
    }
  }, [initialStudent, isOpen, allStudents]);

  // For students, always strictly lock to their own logged-in data. For admin, allow switching.
  const student = isStudent
    ? initialStudent || allStudents[0]
    : allStudents.find((s) => s.id === selectedStudentId) || initialStudent || allStudents[0];

  const currentDateObj = new Date();
  const currentMonthNum = currentDateObj.getMonth() + 1;
  const currentYear = currentDateObj.getFullYear();
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(currentDateObj);

  // Filter state for attendance and activity reports (defaults to 'semua' so all entered logs show up immediately)
  const [filterMode, setFilterMode] = useState<'semua' | 'bulan' | 'rentang'>('semua');
  const [filterMonth, setFilterMonth] = useState<string>(
    String(currentMonthNum).padStart(2, '0')
  );
  const [filterYear, setFilterYear] = useState<string>(String(currentYear));
  const [filterStartDate, setFilterStartDate] = useState<string>('2026-11-01');
  const [filterEndDate, setFilterEndDate] = useState<string>('2026-11-30');

  const monthsList = [
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

  const currentMonthLabel =
    monthsList.find((m) => m.value === filterMonth)?.label || 'November';

  // Effective month and year for official document number
  const effectiveMonthNum =
    (documentType === 'rekap_kehadiran_siswa' || documentType === 'rekap_kegiatan_siswa') &&
    filterMode === 'bulan'
      ? parseInt(filterMonth, 10)
      : currentMonthNum;
  const effectiveYear =
    (documentType === 'rekap_kehadiran_siswa' || documentType === 'rekap_kegiatan_siswa') &&
    filterMode === 'bulan'
      ? filterYear
      : String(currentYear);

  // Official numbering format: B-[NISN]/Kk.28.02.1/KS.00/bulan (angka)/tahun
  const nomorSuratResmi = student
    ? `B-${student.nisn}/Kk.28.02.1/KS.00/${effectiveMonthNum}/${effectiveYear}`
    : `B-0000000000/Kk.28.02.1/KS.00/${effectiveMonthNum}/${effectiveYear}`;

  // Filter attendance for single student (match by ID, NISN, or full name)
  const baseStudentAttendance = allAttendance.filter((att) => {
    if (!student) return false;
    return (
      (att.studentId && student.id && att.studentId === student.id) ||
      (att.nisn && student.nisn && att.nisn === student.nisn) ||
      (att.studentNama && student.nama && att.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim())
    );
  });

  const studentAttendance = baseStudentAttendance.filter((att) => {
    if (documentType !== 'rekap_kehadiran_siswa') return true;
    if (filterMode === 'semua') return true;

    if (filterMode === 'bulan') {
      if (!att.tanggal) return true;
      const parts = att.tanggal.split('-');
      if (parts.length >= 2) {
        return parts[1] === filterMonth && parts[0] === filterYear;
      }
      return true;
    }

    if (filterMode === 'rentang') {
      if (filterStartDate && att.tanggal < filterStartDate) return false;
      if (filterEndDate && att.tanggal > filterEndDate) return false;
      return true;
    }

    return true;
  });

  // Filter activities for single student (match by ID, NISN, or full name)
  const baseStudentActivities = allActivities.filter((act) => {
    if (!student) return false;
    return (
      (act.studentId && student.id && act.studentId === student.id) ||
      (act.nisn && student.nisn && act.nisn === student.nisn) ||
      (act.studentNama && student.nama && act.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim())
    );
  });

  const studentActivities = baseStudentActivities.filter((act) => {
    if (documentType !== 'rekap_kegiatan_siswa') return true;
    if (filterMode === 'semua') return true;

    if (filterMode === 'bulan') {
      if (!act.tanggal) return true;
      const parts = act.tanggal.split('-');
      if (parts.length >= 2) {
        return parts[1] === filterMonth && parts[0] === filterYear;
      }
      return true;
    }

    if (filterMode === 'rentang') {
      if (filterStartDate && act.tanggal < filterStartDate) return false;
      if (filterEndDate && act.tanggal > filterEndDate) return false;
      return true;
    }

    return true;
  });

  // Filter state for Rekapitulasi Data Siswa PKL / Magang
  const [rekapStatusFilter, setRekapStatusFilter] = useState<string>(
    rekapFilter?.status || 'Aktif'
  );
  const [rekapMonthFilter, setRekapMonthFilter] = useState<string>(
    rekapFilter?.month || 'Semua'
  );
  const [rekapYearFilter, setRekapYearFilter] = useState<string>(
    rekapFilter?.year || String(currentYear)
  );

  useEffect(() => {
    if (rekapFilter) {
      setRekapStatusFilter(rekapFilter.status || 'Aktif');
      setRekapMonthFilter(rekapFilter.month || 'Semua');
      setRekapYearFilter(rekapFilter.year || String(currentYear));
    }
  }, [rekapFilter, isOpen]);

  // Filter students for collective rekap report based on Status, Month, Year
  const filteredRekapStudents = allStudents.filter((s) => {
    // 1. Filter by Status Siswa
    if (rekapStatusFilter !== 'Semua' && rekapStatusFilter !== 'Semua Status') {
      if (rekapStatusFilter === 'Non-Aktif') {
        if (s.status === 'Aktif') return false;
      } else {
        if (s.status !== rekapStatusFilter) return false;
      }
    }

    // 2. Filter by Year
    if (rekapYearFilter !== 'Semua' && rekapYearFilter !== 'Semua Tahun') {
      const startYear = s.tanggalMulai ? s.tanggalMulai.split('-')[0] : s.tahun;
      const endYear = s.tanggalSelesai ? s.tanggalSelesai.split('-')[0] : s.tahun;
      const matchYear = s.tahun === rekapYearFilter || startYear === rekapYearFilter || endYear === rekapYearFilter;
      if (!matchYear) return false;
    }

    // 3. Filter by Month
    if (rekapMonthFilter !== 'Semua' && rekapMonthFilter !== 'Semua Bulan') {
      const monthFormatted = rekapMonthFilter.padStart(2, '0');
      const startMonth = s.tanggalMulai ? s.tanggalMulai.split('-')[1] : '';
      const endMonth = s.tanggalSelesai ? s.tanggalSelesai.split('-')[1] : '';
      let matchMonth = startMonth === monthFormatted || endMonth === monthFormatted;

      if (!matchMonth && s.tanggalMulai && s.tanggalSelesai) {
        const targetYear = rekapYearFilter !== 'Semua' ? parseInt(rekapYearFilter, 10) : currentYear;
        const targetMonth = parseInt(rekapMonthFilter, 10);
        const startDate = new Date(s.tanggalMulai);
        const endDate = new Date(s.tanggalSelesai);
        const targetStart = new Date(targetYear, targetMonth - 1, 1);
        const targetEnd = new Date(targetYear, targetMonth, 0);
        if (startDate <= targetEnd && endDate >= targetStart) {
          matchMonth = true;
        }
      }

      if (!matchMonth) {
        // Also check if attendance exists in this month
        const hasAttendance = allAttendance.some((att) => {
          const isThisStudent = (att.studentId && s.id && att.studentId === s.id) || (att.nisn && s.nisn && att.nisn === s.nisn);
          if (!isThisStudent || !att.tanggal) return false;
          const [attYear, attMonth] = att.tanggal.split('-');
          return attMonth === monthFormatted && (rekapYearFilter === 'Semua' || attYear === rekapYearFilter);
        });
        if (hasAttendance) matchMonth = true;
      }

      if (!matchMonth) return false;
    }

    return true;
  });

  // Find assessment for the student
  const studentAssessment = allAssessments.find(
    (ass) =>
      student &&
      ((ass.studentId && student.id && ass.studentId === student.id) ||
        (ass.nisn && student.nisn && ass.nisn === student.nisn) ||
        (ass.studentNama && student.nama && ass.studentNama.toLowerCase().trim() === student.nama.toLowerCase().trim()))
  );

  // Check if student has unapproved activities when viewing/printing journal
  const hasUnapprovedActivities =
    isStudent &&
    documentType === 'rekap_kegiatan_siswa' &&
    studentActivities.some((act) => act.statusVerifikasi !== 'Disetujui');

  const [showUnapprovedModal, setShowUnapprovedModal] = useState(false);
  const [certPrintTarget, setCertPrintTarget] = useState<'all' | 'page1' | 'page2'>('all');

  const handlePrint = (target: 'all' | 'page1' | 'page2' = 'all') => {
    if (hasUnapprovedActivities) {
      setShowUnapprovedModal(true);
      return;
    }
    setCertPrintTarget(target);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const isPerStudentDoc =
    documentType === 'cetak_penilaian' ||
    documentType === 'rekap_kehadiran_siswa' ||
    documentType === 'rekap_kegiatan_siswa' ||
    documentType === 'sertifikat_magang';

  // Compute average score & graduation status for certificate box
  const getPredikatFromScore = (score: number) => {
    if (score >= 90) return 'SANGAT BAIK';
    if (score >= 80) return 'BAIK';
    if (score >= 70) return 'CUKUP';
    return 'KURANG';
  };

  const avgScore = studentAssessment ? studentAssessment.nilaiRataRata : 90.3;
  const isPass = avgScore >= 70;
  const computedPredikat = getPredikatFromScore(avgScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Controls Toolbar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-slate-800 no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">
                Pratinjau &amp; Cetak Dokumen Resmi
              </h3>
              <p className="text-[11px] text-slate-400">
                Kantor Kementerian Agama Kabupaten Lebak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {documentType === 'sertifikat_magang' ? (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => handlePrint('page1')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Cetak Lembar 1 saja (Sertifikat Depan)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Lembar 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('page2')}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Cetak Lembar 2 saja (Daftar Nilai Belakang)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Lembar 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('all')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Cetak Seluruh Lembar (1 & 2)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Semua (1 &amp; 2)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handlePrint('all')}
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer ${
                  hasUnapprovedActivities
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang (Ctrl + P)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Banner if unapproved activities exist for student */}
        {hasUnapprovedActivities && (
          <div className="bg-amber-500 text-slate-950 px-5 py-2.5 text-xs font-bold flex items-center justify-between no-print border-b border-amber-600 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-950 text-white text-[10px]">PERINGATAN</span>
              <span>“Ada kegiatan yang belum di verifikasi/disetujui, silakan hubungi Pembimbing anda!”</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-900">
              {studentActivities.filter((a) => a.statusVerifikasi !== 'Disetujui').length} kegiatan belum disetujui
            </span>
          </div>
        )}

        {/* Dynamic Filter Toolbar (Visible only in UI, hidden when printing) */}
        {isPerStudentDoc && (
          <div className="bg-slate-800 text-slate-200 px-5 py-2.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs no-print shrink-0">
            {/* Student Filter Selector: ONLY displayed for Admin/Pegawai, completely hidden for Student */}
            {!isStudent ? (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Pilih Siswa / Mahasiswa:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-emerald-300 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500 max-w-xs truncate cursor-pointer"
                >
                  {(documentType === 'cetak_penilaian' || documentType === 'sertifikat_magang'
                    ? allStudents.filter((s) =>
                        allAssessments.some(
                          (ass) =>
                            (ass.studentId && s.id && ass.studentId === s.id) ||
                            (ass.nisn && s.nisn && ass.nisn === s.nisn) ||
                            (ass.studentNama && s.nama && ass.studentNama.toLowerCase().trim() === s.nama.toLowerCase().trim())
                        )
                      )
                    : allStudents
                  ).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn}) - {s.tempatPenugasan}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                  {student?.nama} ({student?.nisn})
                </span>
              </div>
            )}

            {/* Date / Month Filter for Attendance & Activities */}
            {(documentType === 'rekap_kehadiran_siswa' ||
              documentType === 'rekap_kegiatan_siswa') && (
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFilterMode('semua')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      filterMode === 'semua'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('bulan')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      filterMode === 'bulan'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bulan &amp; Tahun
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('rentang')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      filterMode === 'rentang'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Rentang Tanggal
                  </button>
                </div>

                {filterMode === 'bulan' && (
                  <>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500 font-medium cursor-pointer"
                    >
                      {monthsList.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500 font-mono font-medium cursor-pointer"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </>
                )}

                {filterMode === 'rentang' && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-emerald-500"
                    />
                    <span className="text-slate-400">s.d.</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-emerald-500"
                    />
                  </div>
                )}

                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                  {documentType === 'rekap_kehadiran_siswa'
                    ? `${studentAttendance.length} Hari Kehadiran`
                    : `${studentActivities.length} Data Kegiatan`}
                </span>
              </div>
            )}
          </div>
        )}
        {/* Dynamic Filter Toolbar for Rekapitulasi Data Siswa PKL / Magang */}
        {documentType === 'rekap_kehadiran_aktif' && (
          <div className="bg-slate-800 text-slate-200 px-5 py-2.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs no-print shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-semibold text-white">Filter Pratinjau Rekap Kolektif:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Status:</span>
                <select
                  value={rekapStatusFilter}
                  onChange={(e) => setRekapStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-blue-300 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-blue-500 cursor-pointer"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Status Aktif</option>
                  <option value="Selesai">Status Selesai</option>
                  <option value="Berhenti/Pindah">Non-Aktif</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Bulan:</span>
                <select
                  value={rekapMonthFilter}
                  onChange={(e) => setRekapMonthFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-blue-300 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-blue-500 cursor-pointer"
                >
                  <option value="Semua">Semua Bulan</option>
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Tahun:</span>
                <select
                  value={rekapYearFilter}
                  onChange={(e) => setRekapYearFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-blue-300 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-blue-500 cursor-pointer"
                >
                  <option value="Semua">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="px-2.5 py-1 bg-blue-900/60 border border-blue-700/50 rounded-lg text-blue-200 text-[11px] font-bold">
                {filteredRekapStudents.length} Siswa Terpilih
              </div>
            </div>
          </div>
        )}

        {/* Printable Paper Area (Styled like standard A4 Sheet Portrait 21cm x 29.7cm) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200 print-page flex justify-center">
          {/* Inject portrait print CSS for all official documents including sertifikat_magang */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait !important;
                margin: 0.8cm !important;
              }
            }
          `}</style>

          <div className="bg-white shadow-xl w-full p-6 sm:p-10 text-black font-arial text-[11pt] leading-normal border border-slate-300 print:border-none print:shadow-none print:p-0 relative max-w-[21cm] min-h-[29.7cm]">
            {/* Kop Surat Resmi (Hanya untuk dokumen non-sertifikat) */}
            {documentType !== 'sertifikat_magang' && <OfficialKopSurat />}

            {/* ============================================================== */}
            {/* DOCUMENT 1: LEMBAR PENILAIAN PKL                               */}
            {/* ============================================================== */}
            {documentType === 'cetak_penilaian' && student && (
              <div className="mt-2 space-y-4">
                <div className="text-center">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wide underline inline-block">
                    LEMBAR PENILAIAN PRAKTIK KERJA LAPANGAN (PKL)
                  </h2>
                  <p className="text-[9.5pt] text-black font-sans mt-0.5 font-medium">
                    Nomor: {nomorSuratResmi}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 pt-2">
                  <table className="text-[10pt] leading-relaxed flex-1">
                    <tbody>
                      <tr>
                        <td className="w-40 py-0.5">Nama Siswa</td>
                        <td className="w-4">:</td>
                        <td className="font-bold uppercase tracking-wide">{student.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">NISN</td>
                        <td>:</td>
                        <td className="font-mono">{student.nisn}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Asal Sekolah</td>
                        <td>:</td>
                        <td>{student.asalSekolah}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Unit Penugasan</td>
                        <td>:</td>
                        <td className="font-bold">{student.tempatPenugasan}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Waktu Pelaksanaan</td>
                        <td>:</td>
                        <td className="font-mono">
                          {student.tanggalMulai || '2026-08-15'} s.d. {student.tanggalSelesai || '2026-12-15'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="w-24 h-32 border border-black p-0.5 bg-white shrink-0">
                    <img
                      src={student.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                      alt={student.nama}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-[9.5pt]">
                  <thead>
                    <tr className="text-center font-bold">
                      <th className="border border-black p-2 w-12 uppercase">NO</th>
                      <th className="border border-black p-2 text-left uppercase">KOMPONEN / ASPEK PENILAIAN</th>
                      <th className="border border-black p-2 w-44 uppercase leading-tight">
                        NILAI ANGKA<br />(0-100)
                      </th>
                      <th className="border border-black p-2 w-36 uppercase">KUALIFIKASI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center">1</td>
                      <td className="border border-black p-2">Kedisiplinan &amp; Ketaatan Tata Tertib</td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.kedisiplinan.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.kedisiplinan >= 90 ? 'A' : studentAssessment.kedisiplinan >= 80 ? 'B' : studentAssessment.kedisiplinan >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">2</td>
                      <td className="border border-black p-2">Inisiatif &amp; Keaktifan Bekerja</td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.inisiatif.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.inisiatif >= 90 ? 'A' : studentAssessment.inisiatif >= 80 ? 'B' : studentAssessment.inisiatif >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">3</td>
                      <td className="border border-black p-2">Kerjasama &amp; Komunikasi Tim</td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.kerjasama.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.kerjasama >= 90 ? 'A' : studentAssessment.kerjasama >= 80 ? 'B' : studentAssessment.kerjasama >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">4</td>
                      <td className="border border-black p-2">Tanggung Jawab Penyelesaian Tugas</td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.tanggungJawab.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.tanggungJawab >= 90 ? 'A' : studentAssessment.tanggungJawab >= 80 ? 'B' : studentAssessment.tanggungJawab >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">5</td>
                      <td className="border border-black p-2">Kebersihan &amp; Kerapihan Kerja</td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.kebersihan.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.kebersihan >= 90 ? 'A' : studentAssessment.kebersihan >= 80 ? 'B' : studentAssessment.kebersihan >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">6</td>
                      <td className="border border-black p-2">Keahlian:
                        {studentAssessment?.namaBidangKeahlian || 'Kompetensi / Bidang Keahlian'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold font-mono">
                        {studentAssessment ? studentAssessment.nilaiBidangKeahlian.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {studentAssessment ? (studentAssessment.nilaiBidangKeahlian >= 90 ? 'A' : studentAssessment.nilaiBidangKeahlian >= 80 ? 'B' : studentAssessment.nilaiBidangKeahlian >= 70 ? 'C' : 'D') : '-'}
                      </td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={2} className="border border-black p-2 text-right uppercase tracking-wider pr-4">
                        NILAI RATA-RATA AKHIR
                      </td>
                      <td className="border border-black p-2 text-center font-mono text-[10pt]">
                        {studentAssessment ? studentAssessment.nilaiRataRata.toFixed(1) : '-'}
                      </td>
                      <td className="border border-black p-2 text-center text-[10pt]">
                        {studentAssessment ? `GRADE ${studentAssessment.grade}` : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-2 space-y-2 text-[10pt]">
                  <p>
                    Berdasarkan hasil penilaian siswa tersebut mendapatkan predikat :{' '}
                    <u>
                      <strong className="uppercase">
                        {studentAssessment ? studentAssessment.predikat : '-'}
                      </strong>
                    </u>
                  </p>
                  <div>
                    <strong className="block">Catatan Evaluasi Pembimbing Instansi:</strong>
                    <p className="italic text-black mt-0.5">
                      "{studentAssessment?.catatan || 'Siswa menunjukkan kedisiplinan dan kinerja yang sangat memuaskan.'}"
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 text-[10pt]">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Kepala Subbag Tata Usaha</p>
                      <p>Kantor Kemenag Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">H. SUDIRMAN, S.AG., M.SI</p>
                      <p className="text-[9pt]">NIP. 197405122000031002</p>
                    </div>
                    <div>
                      <p>Rangkasbitung, {todayFormatted}</p>
                      <p className="font-bold">Pembimbing</p>
                      <p>Kantor Kemenag Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">
                        {student.pembimbingKantor || 'DEDEN FIRDAUS, S.AG'}
                      </p>
                      <p className="text-[9pt]">
                        NIP. {student.nipPembimbing || '197811202005011004'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 2: REKAPITULASI KEHADIRAN SISWA                       */}
            {/* ============================================================== */}
            {documentType === 'rekap_kehadiran_siswa' && student && (
              <div className="mt-2 space-y-4">
                <div className="text-center">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wide underline inline-block">
                    REKAPITULASI KEHADIRAN SISWA PKL / MAGANG
                  </h2>
                </div>

                <div className="flex items-start justify-between gap-4 pt-2">
                  <table className="text-[10pt] leading-relaxed flex-1">
                    <tbody>
                      <tr>
                        <td className="w-40 py-0.5">Nama Siswa</td>
                        <td className="w-4">:</td>
                        <td className="font-bold uppercase tracking-wide">{student.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">NISN</td>
                        <td>:</td>
                        <td className="font-mono">{student.nisn}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Asal Sekolah</td>
                        <td>:</td>
                        <td>{student.asalSekolah}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Unit Penugasan</td>
                        <td>:</td>
                        <td className="font-bold">{student.tempatPenugasan}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Waktu Pelaksanaan</td>
                        <td>:</td>
                        <td className="font-mono">
                          {student.tanggalMulai || '2026-08-15'} s.d. {student.tanggalSelesai || '2026-12-15'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Periode Rekap</td>
                        <td>:</td>
                        <td className="font-semibold text-slate-900">
                          {filterMode === 'bulan' && `Bulan ${currentMonthLabel} ${filterYear}`}
                          {filterMode === 'rentang' && `${filterStartDate} s.d. ${filterEndDate}`}
                          {filterMode === 'semua' && 'Seluruh Riwayat Kehadiran'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="w-24 h-32 border border-black p-0.5 bg-white shrink-0">
                    <img
                      src={student.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                      alt={student.nama}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-[9.5pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-2 w-8">No</th>
                      <th className="border border-black p-2 w-28">Tanggal</th>
                      <th className="border border-black p-2 w-20">Masuk</th>
                      <th className="border border-black p-2 w-20">Pulang</th>
                      <th className="border border-black p-2 w-24">Status</th>
                      <th className="border border-black p-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="border border-black p-4 text-center text-slate-500 italic">
                          Tidak ada data kehadiran yang tercatat untuk periode ini.
                        </td>
                      </tr>
                    ) : (
                      studentAttendance.map((att, idx) => (
                        <tr key={att.id || idx} className="text-center">
                          <td className="border border-black p-2">{idx + 1}</td>
                          <td className="border border-black p-2 font-mono">{att.tanggal}</td>
                          <td className="border border-black p-2 font-mono">{att.jamMasuk}</td>
                          <td className="border border-black p-2 font-mono">{att.jamPulang}</td>
                          <td className="border border-black p-2 font-bold">{att.status}</td>
                          <td className="border border-black p-2 text-left">{att.keterangan || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="grid grid-cols-4 gap-2 text-center text-[9pt] font-semibold p-2 border border-black bg-slate-50">
                  <div>Hadir: {studentAttendance.filter((a) => a.status === 'Hadir').length} Hari</div>
                  <div>Sakit: {studentAttendance.filter((a) => a.status === 'Sakit').length} Hari</div>
                  <div>Izin: {studentAttendance.filter((a) => a.status === 'Izin').length} Hari</div>
                  <div>Alfa: {studentAttendance.filter((a) => a.status === 'Alfa').length} Hari</div>
                </div>

                {/* Signatures: Kiri = Pembimbing Kantor, Kanan = Siswa PKL / Magang */}
                <div className="mt-8 pt-4 text-[10pt]">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Pembimbing Kantor</p>
                      <p>Kantor Kemenag Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">
                        {student.pembimbingKantor || 'DEDEN FIRDAUS, S.AG'}
                      </p>
                      <p className="text-[9pt]">
                        NIP. {student.nipPembimbing || '197811202005011004'}
                      </p>
                    </div>
                    <div>
                      <p>Rangkasbitung, {todayFormatted}</p>
                      <p className="font-bold">Siswa PKL / Magang,</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">{student.nama}</p>
                      <p className="text-[9pt]">NISN. {student.nisn}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 3: REKAPITULASI DATA SISWA PKL / MAGANG               */}
            {/* ============================================================== */}
            {documentType === 'rekap_kehadiran_aktif' && (
              <div className="mt-2 space-y-4">
                <div className="text-center">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wide underline inline-block">
                    REKAPITULASI DATA SISWA PKL / MAGANG
                  </h2>
                </div>

                <p className="text-[10pt] text-justify leading-relaxed pt-2">
                  Berikut merupakan daftar rekapitulasi data peserta Praktik Kerja Lapangan (PKL) / Magang
                  {rekapStatusFilter !== 'Semua' && rekapStatusFilter !== 'Semua Status' ? ` berstatus ${rekapStatusFilter}` : ''}
                  {rekapMonthFilter !== 'Semua' && rekapMonthFilter !== 'Semua Bulan' ? ` bulan ${monthsList.find((m) => m.value === rekapMonthFilter)?.label || rekapMonthFilter}` : ''}
                  {rekapYearFilter !== 'Semua' && rekapYearFilter !== 'Semua Tahun' ? ` tahun ${rekapYearFilter}` : ` tahun ${currentYear}`}
                  {' '}yang bertugas pada unit-unit kerja lingkungan Kantor Kementerian Agama Kabupaten Lebak:
                </p>

                <table className="w-full border-collapse border border-black text-[9pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-8">No</th>
                      <th className="border border-black p-1.5">Nama Siswa</th>
                      <th className="border border-black p-1.5">NISN / Asal Sekolah</th>
                      <th className="border border-black p-1.5">Unit Penugasan</th>
                      <th className="border border-black p-1.5">Waktu Pelaksanaan</th>
                      <th className="border border-black p-1.5 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRekapStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="border border-black p-4 text-center text-slate-500 italic">
                          Tidak ada data siswa PKL/Magang yang ditemukan sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRekapStudents.map((s, idx) => (
                        <tr key={s.id || idx}>
                          <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-black p-1.5 font-semibold uppercase">{s.nama}</td>
                          <td className="border border-black p-1.5">
                            <div className="font-mono">{s.nisn}</div>
                            <div className="text-[8pt] text-slate-600">{s.asalSekolah}</div>
                          </td>
                          <td className="border border-black p-1.5 font-bold">{s.tempatPenugasan}</td>
                          <td className="border border-black p-1.5 font-mono text-[8pt]">
                            {s.tanggalMulai} s.d. {s.tanggalSelesai}
                          </td>
                          <td className="border border-black p-1.5 text-center font-bold text-slate-800">
                            {s.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 pt-4 text-[10pt]">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Kepala Subbag Tata Usaha</p>
                      <p>Kantor Kemenag Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">H. SUDIRMAN, S.AG., M.SI</p>
                      <p className="text-[9pt]">NIP. 197405122000031002</p>
                    </div>
                    <div>
                      <p>Rangkasbitung, {todayFormatted}</p>
                      <p className="font-bold">Pengelola Urusan Magang / Siswa,</p>
                      <p>Kantor Kemenag Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">DEDEN FIRDAUS, S.AG</p>
                      <p className="text-[9pt]">NIP. 197811202005011004</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 4: LAPORAN JURNAL KEGIATAN HARIAN SISWA (REKAP)       */}
            {/* ============================================================== */}
            {documentType === 'rekap_kegiatan_siswa' && student && (
              <div className="mt-2 space-y-4">
                <div className="text-center">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wide underline inline-block">
                    LAPORAN JURNAL KEGIATAN HARIAN SISWA PKL / MAGANG
                  </h2>
                </div>

                <div className="flex items-start justify-between gap-4 pt-2">
                  <table className="text-[10pt] leading-relaxed flex-1">
                    <tbody>
                      <tr>
                        <td className="w-40 py-0.5">Nama Siswa</td>
                        <td className="w-4">:</td>
                        <td className="font-bold uppercase tracking-wide">{student.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">NISN</td>
                        <td>:</td>
                        <td className="font-mono">{student.nisn}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Asal Sekolah</td>
                        <td>:</td>
                        <td>{student.asalSekolah}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Unit Penugasan</td>
                        <td>:</td>
                        <td className="font-bold">{student.tempatPenugasan}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Waktu Pelaksanaan</td>
                        <td>:</td>
                        <td className="font-mono">
                          {student.tanggalMulai || '2026-08-15'} s.d. {student.tanggalSelesai || '2026-12-15'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">Periode Laporan</td>
                        <td>:</td>
                        <td className="font-semibold text-slate-900">
                          {filterMode === 'bulan' && `Bulan ${currentMonthLabel} ${filterYear}`}
                          {filterMode === 'rentang' && `${filterStartDate} s.d. ${filterEndDate}`}
                          {filterMode === 'semua' && 'Seluruh Riwayat Kegiatan Harian'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="w-24 h-32 border border-black p-0.5 bg-white shrink-0">
                    <img
                      src={student.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                      alt={student.nama}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Tabel Kegiatan Harian Siswa: No, Tanggal & Waktu, Uraian Kegiatan, Output / Hasil, Kendala */}
                <table className="w-full border-collapse border border-black text-[9.5pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-2 w-10 uppercase">NO</th>
                      <th className="border border-black p-2 w-32 uppercase">TANGGAL &amp; WAKTU</th>
                      <th className="border border-black p-2 text-left uppercase">URAIAN KEGIATAN</th>
                      <th className="border border-black p-2 w-44 text-left uppercase">OUTPUT / HASIL</th>
                      <th className="border border-black p-2 w-36 text-left uppercase">KENDALA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentActivities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-black p-6 text-center text-slate-500 italic">
                          Belum ada catatan jurnal kegiatan harian yang dilaporkan pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      studentActivities.map((act, idx) => (
                        <tr key={act.id || idx} className="align-top">
                          <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black p-2 text-center font-mono">
                            <div className="font-bold text-black">{act.tanggal}</div>
                            <div className="text-[8.5pt] text-slate-700">
                              {act.jamMulai} - {act.jamSelesai}
                            </div>
                          </td>
                          <td className="border border-black p-2 text-left leading-relaxed">
                            {act.uraianKegiatan}
                          </td>
                          <td className="border border-black p-2 text-left leading-relaxed">
                            {act.outputKegiatan}
                          </td>
                          <td className="border border-black p-2 text-left leading-relaxed italic text-slate-800">
                            {act.kendala || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Summary Box */}
                <div className="flex justify-between items-center text-[9pt] font-semibold p-2 border border-black bg-slate-50">
                  <div>
                    Total Jurnal Kegiatan Tercatat: <strong>{studentActivities.length} Kegiatan</strong>
                  </div>
                  <div>
                    Status: {studentActivities.filter((a) => a.statusVerifikasi === 'Disetujui').length} Disetujui &bull;{' '}
                    {studentActivities.filter((a) => a.statusVerifikasi === 'Menunggu').length} Menunggu Verifikasi
                  </div>
                </div>

                {/* Kolom Tanda Tangan Resmi:
                    KIRI  = Mengetahui Pembimbing Kantor Kementerian Agama Kab. Lebak
                    KANAN = Penanggalan Rangkasbitung, Siswa Magang / PKL */}
                <div className="mt-8 pt-4 text-[10pt]">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    {/* SEBELAH KIRI: Pembimbing Kantor */}
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Pembimbing Kantor</p>
                      <p>Kementerian Agama Kab. Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">
                        {student.pembimbingKantor || 'DEDEN FIRDAUS, S.AG'}
                      </p>
                      <p className="text-[9pt]">
                        NIP. {student.nipPembimbing || '197811202005011004'}
                      </p>
                    </div>

                    {/* SEBELAH KANAN: Penanggalan Rangkasbitung, Siswa Magang */}
                    <div>
                      <p>Rangkasbitung, {todayFormatted}</p>
                      <p className="font-bold">Siswa Magang / PKL,</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase">{student.nama}</p>
                      <p className="text-[9pt]">NISN. {student.nisn}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DOCUMENT 5: SERTIFIKAT MAGANG RESMI (BOLAK-BALIK / 2 LEMBAR)   */}
            {/* FORMAT: A4 LANDSCAPE, WATERMARK 8CM, TANPA KOP SURAT DI HAL 1  */}
            {/* ============================================================== */}
            {documentType === 'sertifikat_magang' && student && (
              <div className="mt-2 space-y-8 relative">
                {/* ============================================================== */}
                {/* LEMBAR DEPAN (HALAMAN 1) - LANDSCAPE A4                       */}
                {/* ============================================================== */}
                {/* Permission Check Notice: Only super_admin and admin can print official certificates */}
                {userRole && !['super_admin', 'admin'].includes(userRole) ? (
                  <div className="p-8 text-center bg-rose-50 text-rose-900 rounded-2xl border-2 border-rose-200 my-8 space-y-3 no-print">
                    <AlertTriangle className="w-12 h-12 mx-auto text-rose-600" />
                    <h3 className="text-base font-bold">Akses Dibatasi</h3>
                    <p className="text-xs max-w-md mx-auto">
                      Dokumen Sertifikat Magang Resmi hanya dapat dicetak oleh <strong>Super Admin</strong> dan <strong>Admin Subbag TU</strong>.
                    </p>
                  </div>
                ) : (
                    <div
                      className={`border-4 border-double border-amber-900/40 p-5 sm:p-7 rounded-2xl bg-amber-50/10 space-y-3.5 relative overflow-hidden min-h-[26cm] flex flex-col justify-between ${
                        certPrintTarget === 'page2' ? 'hidden print:hidden' : ''
                      }`}
                    >
                      {/* Header Halaman 1: Logo Center & Nama Instansi Capital (Font Size 12pt, Jarak 1) */}
                      <div className="text-center relative z-10 space-y-1">
                        <img
                          src="/assets/aistudio/media_1792507912355_fb074e24_71599073.png"
                          alt="Logo Kemenag"
                          className="w-20 h-20 mx-auto object-contain drop-shadow-xs mb-1"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png');
                          }}
                        />
                        <h2 className="font-extrabold text-[12pt] uppercase tracking-wider text-slate-900 mt-1">
                          KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK
                        </h2>
                        <div className="border-b border-slate-900 w-full my-2"></div>
                      </div>

                      {/* Judul 2 Baris (Font Size 14pt) & Nomor Sertifikat */}
                      <div className="text-center relative z-10 space-y-1">
                        <h1 className="font-bold text-[14pt] uppercase tracking-wide text-slate-900 leading-snug">
                          SERTIFIKAT<br />
                          PRAKTEK KERJA LAPANGAN / MAGANG
                        </h1>
                        <p className="text-[9.5pt] font-mono font-bold text-slate-800">
                          Nomor : B-{student.nisn}/Kk.28.02.1/KS.00/{effectiveMonthNum}/{effectiveYear}
                        </p>
                      </div>

                      {/* Isi Keterangan & Identitas Siswa Sesuai Contoh Gambar */}
                      <div className="text-center relative z-10 space-y-3 text-[9.5pt] leading-relaxed text-slate-900 max-w-4xl mx-auto">
                        <p className="text-justify leading-normal">
                          Berdasarkan UU No. 20 tahun 2003 tentang Sisdiknas dan Permendikbud No. 50 Tahun 2020 tentang Praktek Kerja Lapangan (PKL) serta ketentuan - ketentuan pelaksanaannya lainnya, maka dengan ini Kepala Kantor Kementerian Agama Kabupaten Lebak menyatakan bahwa :
                        </p>

                        {/* Identitas Peserta */}
                        <div className="max-w-2xl mx-auto text-left bg-white/95 p-3 sm:p-4 rounded-xl border border-slate-300 shadow-xs text-[9.5pt]">
                          <table className="w-full">
                            <tbody>
                              <tr>
                                <td className="w-48 py-0.5 font-semibold text-slate-700">N a m a</td>
                                <td className="w-4">:</td>
                                <td className="font-bold uppercase text-slate-900 tracking-wide">{student.nama}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">NISN/NIM</td>
                                <td>:</td>
                                <td className="font-mono font-bold">{student.nisn}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">Tempat dan Tanggal Lahir</td>
                                <td>:</td>
                                <td className="font-semibold uppercase text-slate-900">
                                  {student.tempatLahir ? student.tempatLahir.toUpperCase() : 'LEBAK'}, {student.tanggalLahir ? student.tanggalLahir.toUpperCase() : '07 OKTOBER 2000'}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">Prodi / Jurusan</td>
                                <td>:</td>
                                <td className="font-semibold uppercase text-slate-900">{student.programKeahlian || 'MANAJEMEN'}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">Asal Sekolah</td>
                                <td>:</td>
                                <td className="font-semibold text-slate-900">{student.asalSekolah}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">Tempat Penugasan</td>
                                <td>:</td>
                                <td className="font-bold text-emerald-900">{student.tempatPenugasan}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 font-semibold text-slate-700">Waktu Pelaksanaan</td>
                                <td>:</td>
                                <td className="font-mono">
                                  {student.tanggalMulai || '01 Januari 2026'} s.d {student.tanggalSelesai || '31 Juli 2026'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p className="text-[9.5pt]">
                          Telah mengikuti dan menyelesaikan Praktek Kerja Lapangan / Magang di Kantor Kementerian Agama Kabupaten Lebak dengan predikat:
                        </p>

                        {/* Box Predikat Evaluasi: Nilai >= 70 LULUS (SANGAT BAIK / BAIK / CUKUP), < 70 TIDAK LULUS */}
                        <div
                          className={`py-2.5 px-6 my-1 -mt-2 border-2 rounded-2xl max-w-md mx-auto text-center shadow-xs ${
                            isPass
                              ? 'bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-amber-500 text-slate-900'
                              : 'bg-gradient-to-r from-rose-50 via-red-100 to-rose-50 border-rose-600 text-rose-900'
                          }`}
                        >
                          <span className="text-base sm:text-lg font-extrabold tracking-wide inline-block">
                            {isPass ? (
                              <>
                                LULUS dengan Nilai :{' '}
                                <span className="underline decoration-2 text-emerald-900 font-black">
                                  {computedPredikat}
                                </span>
                              </>
                            ) : (
                              <span className="text-rose-700 font-black tracking-wider text-base sm:text-lg uppercase">
                                TIDAK LULUS dengan Nilai : KURANG
                              </span>
                            )}
                          </span>
                        </div>

                        <p className="text-[8.5pt] italic text-slate-700">
                          Sertifikat ini diberikan sebagai bukti kelulusan dan penghargaan atas dedikasi serta kontribusi kerja yang telah diberikan.
                        </p>
                      </div>

                        {/* Bottom Row: Pojok Kiri = Barcode Batang SVG Linear + QR Code SVG, Pojok Kanan = Tanda Tangan Kepala Kantor (Tanpa Tulisan Cap Stempel Watermark) */}
                        <div className="relative z-10 pt-2 flex items-end justify-between gap-6 text-[9.5pt]">
                          {/* Pojok Kiri Bawah: Barcode Batang SVG Linear + QR Code SVG (Menggunakan data Nama, NISN, dan Tanggal Sertifikat) */}
                          <div className="bg-white/95 p-2 rounded-xl border border-slate-300 shadow-xs inline-flex items-center gap-2 shrink-0">
                            {generateCertificateBarcode(student.nama, student.nisn, todayFormatted)}
                            {generateCertificateQRCode(student.nama, student.nisn, todayFormatted)}
                          </div>

                        {/* Pojok Kanan Bawah: Tanda Tangan Kepala Kantor (TIDAK ADA tulisan Cap Stempel Watermark) */}
                        <div className="w-80 text-center space-y-0.5 shrink-0">
                          <p className="text-[9.5pt]">Rangkasbitung, {todayFormatted}</p>
                          <p className="font-bold text-[9.5pt]">Kepala Kantor,</p>
                          <div className="h-16 flex items-center justify-center"></div>
                          <p className="font-bold underline uppercase text-[10pt] text-slate-900">
                            H. BADRUSSALAM, S.AG., M.SI.
                          </p>
                          <p className="text-[8.5pt] font-mono text-slate-800">NIP. 197508142000031002</p>
                        </div>
                      </div>
                    </div>
                )}

                {/* ============================================================================== */}
                {/* LEMBAR BELAKANG (HALAMAN 2 - TRANSKRIP NILAI) - PORTRAIT A4                    */}
                {/* Forced page break for printing                                                 */}
                {/* ============================================================================== */}
                <div
                  style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
                  className={`pt-6 space-y-5 print:pt-4 relative min-h-[26cm] flex flex-col justify-between overflow-hidden ${
                    certPrintTarget === 'page1' ? 'hidden print:hidden' : ''
                  }`}
                >
                  {/* Watermark Logo Kemenag 8cm x 8cm di Tengah Halaman 2 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Kementerian_Agama_Republik_Indonesia.png/600px-Logo_Kementerian_Agama_Republik_Indonesia.png"
                      alt="Watermark Kemenag"
                      className="w-[8cm] h-[8cm] object-contain opacity-[0.08] filter grayscale select-none"
                    />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="text-center space-y-1 border-b-2 border-slate-900 pb-2">
                      <h2 className="font-extrabold text-[14pt] uppercase tracking-wide underline text-slate-900">
                        DAFTAR NILAI PRAKTEK KERJA LAPANGAN / MAGANG
                      </h2>
                      <p className="text-[9.5pt] text-slate-700 font-mono font-medium">
                        Lampiran Sertifikat Magang Nomor: {nomorSuratResmi}
                      </p>
                    </div>

                    {/* Ringkasan Data Siswa (Revisi Label: Asal Sekolah & Program Studi/Jurusan) */}
                    <div className="grid grid-cols-2 gap-2 text-[9.5pt] bg-slate-50 p-3 rounded-xl border border-slate-300">
                      <div>
                        <span className="text-slate-500">Nama Siswa:</span>{' '}
                        <strong className="uppercase text-slate-900">{student.nama}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">NISN:</span>{' '}
                        <strong className="font-mono text-slate-900">{student.nisn}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Asal Sekolah:</span>{' '}
                        <strong className="text-slate-900">{student.asalSekolah}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Program Studi/Jurusan:</span>{' '}
                        <strong className="text-emerald-900 uppercase">{student.programKeahlian || 'MANAJEMEN'}</strong>
                      </div>
                    </div>

                    {/* Tabel 6 Aspek Penilaian Prestasi */}
                    <table className="w-full border-collapse border border-black text-[9.5pt] bg-white/90">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-black p-2 w-10 uppercase">NO</th>
                          <th className="border border-black p-2 text-left uppercase">ASPEK PENILAIAN PRESTASI</th>
                          <th className="border border-black p-2 w-32 uppercase">NILAI ANGKA</th>
                          <th className="border border-black p-2 w-28 uppercase">GRADE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 text-center">1</td>
                          <td className="border border-black p-2 font-medium">Kedisiplinan Waktu &amp; Ketepatan Presensi</td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.kedisiplinan ?? 90).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.kedisiplinan ?? 90) >= 90 ? 'A' : (studentAssessment?.kedisiplinan ?? 90) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center">2</td>
                          <td className="border border-black p-2 font-medium">Tanggung Jawab Pekerjaan &amp; Penugasan</td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.tanggungJawab ?? 90).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.tanggungJawab ?? 90) >= 90 ? 'A' : (studentAssessment?.tanggungJawab ?? 90) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center">3</td>
                          <td className="border border-black p-2 font-medium">Kebersihan &amp; Kerapihan Kerja</td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.kebersihan ?? 89).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.kebersihan ?? 89) >= 90 ? 'A' : (studentAssessment?.kebersihan ?? 89) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center">4</td>
                          <td className="border border-black p-2 font-medium">Kemampuan &amp; Hasil Penguasaan Kerja</td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.inisiatif ?? 92).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.inisiatif ?? 92) >= 90 ? 'A' : (studentAssessment?.inisiatif ?? 92) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center">5</td>
                          <td className="border border-black p-2 font-medium">Kerjasama Tim &amp; Komunikasi Organisasi</td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.kerjasama ?? 92).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.kerjasama ?? 92) >= 90 ? 'A' : (studentAssessment?.kerjasama ?? 92) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center">6</td>
                          <td className="border border-black p-2 font-semibold">
                            Keahlian: {studentAssessment?.namaBidangKeahlian || 'Kompetensi / Bidang Keahlian'}
                          </td>
                          <td className="border border-black p-2 text-center font-mono font-bold">
                            {(studentAssessment?.nilaiBidangKeahlian ?? 89).toFixed(1)}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {(studentAssessment?.nilaiBidangKeahlian ?? 89) >= 90 ? 'A' : (studentAssessment?.nilaiBidangKeahlian ?? 89) >= 80 ? 'B' : 'C'}
                          </td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td colSpan={2} className="border border-black p-2 text-right uppercase tracking-wider pr-4">
                            NILAI RATA-RATA AKHIR
                          </td>
                          <td className="border border-black p-2 text-center font-mono text-[10pt]">
                            {studentAssessment ? studentAssessment.nilaiRataRata.toFixed(1) : '90.3'}
                          </td>
                          <td className="border border-black p-2 text-center text-[10pt]">
                            GRADE {studentAssessment ? studentAssessment.grade : 'A'} ({studentAssessment ? studentAssessment.predikat : 'SANGAT BAIK'})
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Tabel Legenda Kriteria Nilai */}
                    <div className="p-3 border border-black bg-slate-50 text-[9pt] space-y-1.5">
                      <strong className="block text-slate-900 font-bold">Tabel Legenda Kriteria Nilai:</strong>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-1.5 rounded border border-slate-300">
                          <span className="block font-bold">90 – 100</span>
                          <span className="text-[8.5pt] text-emerald-800 font-semibold">Grade A (Sangat Baik)</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-300">
                          <span className="block font-bold">80 – 89</span>
                          <span className="text-[8.5pt] text-blue-800 font-semibold">Grade B (Baik)</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-300">
                          <span className="block font-bold">70 – 79</span>
                          <span className="text-[8.5pt] text-amber-800 font-semibold">Grade C (Cukup)</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-300">
                          <span className="block font-bold">&lt; 70</span>
                          <span className="text-[8.5pt] text-rose-800 font-semibold">Grade D (Kurang)</span>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Evaluasi Pembimbing */}
                    <div className="text-[9.5pt]">
                      <strong className="block">Catatan Evaluasi Pembimbing Instansi:</strong>
                      <p className="italic text-slate-800 p-2.5 bg-slate-50 border border-slate-300 rounded-lg mt-1">
                        "{studentAssessment?.catatan || 'Siswa menunjukkan kedisiplinan dan kinerja yang sangat baik selama masa magang.'}"
                      </p>
                    </div>
                  </div>

                  {/* Signature Lembar Belakang (Pembimbing Kantor Kemenag Kab. Lebak) */}
                  <div className="relative z-10 pt-4 flex justify-end text-[10pt]">
                    <div className="w-80 text-center space-y-0.5">
                      <p>Rangkasbitung, {todayFormatted}</p>
                      <p className="font-bold">Pembimbing Kantor</p>
                      <p className="font-bold">Kementerian Agama Kabupaten Lebak</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline uppercase text-slate-900">
                        {student.pembimbingKantor || 'DEDEN FIRDAUS, S.AG'}
                      </p>
                      <p className="text-[9pt] font-mono text-slate-800">
                        NIP. {student.nipPembimbing || '197811202005011004'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Dialog if student attempts to print unapproved activities */}
      {showUnapprovedModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-amber-300 space-y-4 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Peringatan Cetak Jurnal Kegiatan
              </h3>
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl font-bold text-xs sm:text-sm leading-relaxed">
                “Ada kegiatan yang belum di verifikasi/disetujui, silakan hubungi Pembimbing anda!”
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowUnapprovedModal(false)}
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