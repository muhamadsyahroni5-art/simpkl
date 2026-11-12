import React, { useState } from 'react';
import {
  Award,
  Save,
  Printer,
  CheckCircle2,
  User,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  Edit3,
  FileText,
  XCircle,
  Table,
  Check
} from 'lucide-react';
import { Student, Assessment, AppUser } from '../../types';
import { DocumentType } from '../../components/PrintOfficialModal';

interface AdminAssessmentViewProps {
  currentUser: AppUser;
  students: Student[];
  assessments: Assessment[];
  onSaveAssessment: (ass: Assessment) => void;
  onOpenPrintModal: (type: DocumentType, student: Student) => void;
  onUpdateStudent?: (std: Student) => void;
}

export const AdminAssessmentView: React.FC<AdminAssessmentViewProps> = ({
  currentUser,
  students,
  assessments,
  onSaveAssessment,
  onOpenPrintModal,
  onUpdateStudent,
}) => {
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';
  const canPrintCertificate = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  const availableStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    availableStudents[0]?.id || ''
  );

  const selectedStudent = availableStudents.find((s) => s.id === selectedStudentId) || availableStudents[0];

  const existingAssessment = assessments.find(
    (a) => selectedStudent && (a.studentId === selectedStudent.id || a.nisn === selectedStudent.nisn)
  );

  const isFinished = selectedStudent?.status === 'Selesai';

  // State Rekap Table Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Form State: Nilai default untuk penilaian yaitu 0 jika belum ada
  const [kedisiplinan, setKedisiplinan] = useState<number>(existingAssessment?.kedisiplinan ?? 0);
  const [inisiatif, setInisiatif] = useState<number>(existingAssessment?.inisiatif ?? 0);
  const [kerjasama, setKerjasama] = useState<number>(existingAssessment?.kerjasama ?? 0);
  const [tanggungJawab, setTanggungJawab] = useState<number>(existingAssessment?.tanggungJawab ?? 0);
  const [kebersihan, setKebersihan] = useState<number>(existingAssessment?.kebersihan ?? 0);
  const [namaBidangKeahlian, setNamaBidangKeahlian] = useState<string>(
    existingAssessment?.namaBidangKeahlian ||
      (selectedStudent?.programKeahlian
        ? `Kompetensi Kejuruan ${selectedStudent.programKeahlian}`
        : 'Kompetensi Kejuruan')
  );
  const [nilaiBidangKeahlian, setNilaiBidangKeahlian] = useState<number>(
    existingAssessment?.nilaiBidangKeahlian ?? 0
  );
  const [catatan, setCatatan] = useState<string>(existingAssessment?.catatan || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form when selected student changes
  const handleStudentChange = (stdId: string) => {
    setSelectedStudentId(stdId);
    const targetStudent = availableStudents.find((s) => s.id === stdId);
    const targetAss = assessments.find(
      (a) => targetStudent && (a.studentId === targetStudent.id || a.nisn === targetStudent.nisn)
    );

    if (targetAss) {
      setKedisiplinan(targetAss.kedisiplinan);
      setInisiatif(targetAss.inisiatif);
      setKerjasama(targetAss.kerjasama);
      setTanggungJawab(targetAss.tanggungJawab);
      setKebersihan(targetAss.kebersihan);
      setNamaBidangKeahlian(targetAss.namaBidangKeahlian);
      setNilaiBidangKeahlian(targetAss.nilaiBidangKeahlian);
      setCatatan(targetAss.catatan);
    } else {
      // Nilai default 0 saat siswa belum dinilai
      setKedisiplinan(0);
      setInisiatif(0);
      setKerjasama(0);
      setTanggungJawab(0);
      setKebersihan(0);
      setNamaBidangKeahlian(
        targetStudent?.programKeahlian
          ? `Kompetensi Kejuruan ${targetStudent.programKeahlian}`
          : 'Kompetensi Kejuruan'
      );
      setNilaiBidangKeahlian(0);
      setCatatan('');
    }
  };

  const handleSelectFromTable = (stdId: string) => {
    handleStudentChange(stdId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculation: average of 6 aspects
  const totalScore =
    Number(kedisiplinan) +
    Number(inisiatif) +
    Number(kerjasama) +
    Number(tanggungJawab) +
    Number(kebersihan) +
    Number(nilaiBidangKeahlian);
  const avg = totalScore > 0 ? totalScore / 6 : 0;

  // Grade & Predicate logic:
  // 90-100 grade A, 80-89 grade B, 70-79 grade C, dan di bawah 70 grade D
  const getGradeAndPredikat = (score: number) => {
    if (score >= 90) return { grade: 'A' as const, predikat: 'Amat Baik' as const };
    if (score >= 80) return { grade: 'B' as const, predikat: 'Baik' as const };
    if (score >= 70) return { grade: 'C' as const, predikat: 'Cukup' as const };
    return { grade: 'D' as const, predikat: 'Kurang' as const };
  };

  const { grade, predikat } = getGradeAndPredikat(avg);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!isFinished) {
      alert('Pemberian penilaian siswa magang hanya dapat diberikan bila status magang selesai.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newAss: Assessment = {
      id: existingAssessment?.id || 'ass-' + Date.now(),
      studentId: selectedStudent.id,
      studentNama: selectedStudent.nama,
      nisn: selectedStudent.nisn,
      seksi: selectedStudent.tempatPenugasan,
      kedisiplinan: Number(kedisiplinan),
      inisiatif: Number(inisiatif),
      kerjasama: Number(kerjasama),
      tanggungJawab: Number(tanggungJawab),
      kebersihan: Number(kebersihan),
      namaBidangKeahlian,
      nilaiBidangKeahlian: Number(nilaiBidangKeahlian),
      nilaiRataRata: Number(avg.toFixed(2)),
      grade,
      predikat,
      catatan,
      tanggalPenilaian: todayStr,
      penilaiNama: currentUser.nama || selectedStudent.pembimbingKantor,
      penilaiNip: currentUser.nip || selectedStudent.nipPembimbing,
    };

    onSaveAssessment(newAss);
    setSaveSuccess(true);
    alert('nilai siswa telah tersimpan');
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Filter Data Rekapitulasi Siswa
  const filteredRekapStudents = availableStudents.filter((student) => {
    const ass = assessments.find(
      (a) => a.studentId === student.id || a.nisn === student.nisn
    );

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.nama.toLowerCase().includes(q) ||
      student.nisn.toLowerCase().includes(q) ||
      student.asalSekolah.toLowerCase().includes(q) ||
      (student.tempatPenugasan && student.tempatPenugasan.toLowerCase().includes(q));

    let matchesGrade = true;
    if (gradeFilter === 'dinilai') {
      matchesGrade = !!ass;
    } else if (gradeFilter === 'belum_dinilai') {
      matchesGrade = !ass;
    } else if (['A', 'B', 'C', 'D'].includes(gradeFilter)) {
      matchesGrade = ass?.grade === gradeFilter;
    }

    return matchesSearch && matchesGrade;
  });

  // Statistik Data Penilaian
  const totalAvailable = availableStudents.length;
  const assessedList = availableStudents.filter((s) =>
    assessments.some((a) => a.studentId === s.id || a.nisn === s.nisn)
  );
  const totalDinilai = assessedList.length;
  const totalBelumDinilai = totalAvailable - totalDinilai;

  const assessedScores = assessments
    .filter((a) => availableStudents.some((s) => s.id === a.studentId || s.nisn === a.nisn))
    .map((a) => a.nilaiRataRata);

  const avgOverall =
    assessedScores.length > 0
      ? (assessedScores.reduce((acc, curr) => acc + curr, 0) / assessedScores.length).toFixed(1)
      : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Penilaian Prestasi Siswa PKL</h2>
          <p className="text-xs text-slate-500">
            Penilaian 6 aspek resmi Kemenag Lebak dengan konversi grade (A, B, C, D) dan predikat otomatis.
          </p>
        </div>

        {selectedStudent && (
          <button
            onClick={() => onOpenPrintModal('cetak_penilaian', selectedStudent)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Nilai Resmi (Kop Surat)</span>
          </button>
        )}
      </div>

      {/* Lock Notice if student status is not Selesai */}
      {!isFinished && selectedStudent && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-amber-200/70 rounded-xl text-amber-800 shrink-0">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-sm">
                Pemberian Penilaian Terkunci: Status Siswa Masih "{selectedStudent.status}"
              </h4>
              <p className="text-amber-800 leading-relaxed max-w-2xl">
                Sesuai ketentuan, <strong>pemberian penilaian siswa magang hanya dapat diberikan bila status magang Selesai</strong>.{' '}
                Siswa <strong>{selectedStudent.nama}</strong> saat ini masih berstatus <span className="font-bold underline">{selectedStudent.status}</span>.
              </p>
            </div>
          </div>

          {onUpdateStudent && (
            <button
              type="button"
              onClick={() => {
                onUpdateStudent({ ...selectedStudent, status: 'Selesai' });
              }}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesaikan Magang Sekarang</span>
            </button>
          )}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>nilai siswa telah tersimpan</span>
        </div>
      )}

      {/* Main Grid: Student Selector & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Selector & Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Siswa yang Dinilai:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600"
            >
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.nisn} - {s.asalSekolah})
                </option>
              ))}
            </select>

            {selectedStudent && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-14 h-18 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                  <img
                    src={selectedStudent.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                    alt={selectedStudent.nama}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-slate-900 truncate">{selectedStudent.nama}</p>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {selectedStudent.nisn}</p>
                  <p className="text-[11px] text-slate-600 truncate">{selectedStudent.asalSekolah}</p>
                  <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200 truncate">
                    {selectedStudent.tempatPenugasan}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-emerald-800/80 text-center space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
              Kalkulator Nilai Otomatis
            </span>
            <div className="text-5xl font-black font-mono tracking-tight text-white tabular-nums">
              {avg.toFixed(2)}
            </div>
            <div className="pt-2">
              <span className="text-xs text-slate-300 font-medium">Predikat Prestasi:</span>
              <div className="text-xl font-bold text-amber-300 mt-0.5">
                Grade {grade} &bull; {predikat}
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-slate-400 space-y-0.5">
              <p>90 - 100 : Grade A (Amat Baik)</p>
              <p>80 - 89 : Grade B (Baik)</p>
              <p>70 - 79 : Grade C (Cukup)</p>
              <p>&lt; 70 : Grade D (Kurang)</p>
            </div>
          </div>
        </div>

        {/* Right: Form of 6 Aspects */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs"
          >
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Formulir 6 Aspek Penilaian Prestasi</span>
              <span className="text-xs text-emerald-700 font-mono">Skala: 0 - 100</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Kedisiplinan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Kedisiplinan &amp; Kehadiran (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={kedisiplinan}
                  onChange={(e) => setKedisiplinan(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* 2. Inisiatif */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Inisiatif &amp; Kreativitas (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={inisiatif}
                  onChange={(e) => setInisiatif(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* 3. Kerjasama */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Kerjasama &amp; Komunikasi (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={kerjasama}
                  onChange={(e) => setKerjasama(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* 4. Tanggung Jawab */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Tanggung Jawab Penugasan (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={tanggungJawab}
                  onChange={(e) => setTanggungJawab(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* 5. Kebersihan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  5. Kebersihan &amp; Kerapian Kerja (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={kebersihan}
                  onChange={(e) => setKebersihan(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* 6. Nilai Bidang Keahlian */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6. Nilai Keahlian Khusus (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  disabled={!isFinished}
                  value={nilaiBidangKeahlian}
                  onChange={(e) => setNilaiBidangKeahlian(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Nama Bidang Keahlian yang diisi secara manual */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <label className="block font-bold text-emerald-900 mb-1">
                Nama Aspek Bidang Keahlian (Diisi Manual Sesuai Jurusan Siswa) *
              </label>
              <input
                type="text"
                required
                disabled={!isFinished}
                value={namaBidangKeahlian}
                onChange={(e) => setNamaBidangKeahlian(e.target.value)}
                placeholder="Contoh: Administrasi Perkantoran & Pelayanan PTSP / Jaringan LAN & Troubleshooting PC..."
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="text-[10px] text-emerald-700 mt-1">
                Akan dicantumkan pada poin nomor 6 lembar sertifikat nilai resmi Kemenag Lebak.
              </p>
            </div>

            {/* Catatan / Evaluasi Pembimbing */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Evaluasi / Rekomendasi Pembimbing
              </label>
              <textarea
                rows={3}
                disabled={!isFinished}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Beri apresiasi atau catatan perkembangan siswa selama magang di Kemenag Lebak..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            {/* Penilai Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block">Pejabat / Pembimbing Penilai:</span>
                <span className="font-bold text-slate-900">
                  {currentUser.nama || selectedStudent?.pembimbingKantor}
                </span>
                <span className="block font-mono text-[10px]">
                  NIP. {currentUser.nip || selectedStudent?.nipPembimbing}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Lokasi Penanggalan:</span>
                <span className="font-semibold text-slate-800">Rangkasbitung, Lebak</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={!isFinished}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                  isFinished
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {isFinished ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Penilaian Siswa</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Terkunci (Hanya Dapat Dinilai Bila Status Selesai)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =================================================================================== */}
      {/* TABEL REKAPITULASI DATA PENILAIAN SISWA PKL / MAGANG (OTOMATIS TERUPDATE SAAT SIMPAN) */}
      {/* =================================================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Rekap Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Tabel Rekapitulasi Data Penilaian Siswa PKL / Magang
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan seluruh rekap data nilai prestasi siswa yang telah disimpan oleh Pembimbing / Admin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa, NISN, sekolah..."
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600 w-48 sm:w-60"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="dinilai">Sudah Dinilai ({totalDinilai})</option>
                <option value="belum_dinilai">Belum Dinilai ({totalBelumDinilai})</option>
                <option value="A">Grade A (Amat Baik)</option>
                <option value="B">Grade B (Baik)</option>
                <option value="C">Grade C (Cukup)</option>
                <option value="D">Grade D (Kurang)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Total Siswa PKL</span>
              <span className="text-base font-bold text-slate-900">{totalAvailable} Siswa</span>
            </div>
            <User className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-700 block font-medium">Sudah Dinilai</span>
              <span className="text-base font-bold text-emerald-900">{totalDinilai} Siswa</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-700 block font-medium">Belum Dinilai</span>
              <span className="text-base font-bold text-amber-900">{totalBelumDinilai} Siswa</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>

          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-indigo-700 block font-medium">Rata-Rata Seluruh Nilai</span>
              <span className="text-base font-mono font-extrabold text-indigo-900">{avgOverall}</span>
            </div>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3">Nama Siswa / NISN</th>
                <th className="p-3">Asal Sekolah</th>
                <th className="p-3">Seksi Penugasan</th>
                <th className="p-3 text-center">Rata-Rata Nilai</th>
                <th className="p-3 text-center">Grade &amp; Predikat</th>
                <th className="p-3 text-center">Tanggal Penilaian</th>
                <th className="p-3 text-center">Aksi / Cetak Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRekapStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredRekapStudents.map((student, idx) => {
                  const ass = assessments.find(
                    (a) => a.studentId === student.id || a.nisn === student.nisn
                  );
                  const isSelected = student.id === selectedStudentId;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                            alt={student.nama}
                            className="w-8 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{student.nama}</span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 block">
                              NISN: {student.nisn}
                            </span>
                            {student.programKeahlian && (
                              <span className="text-[10px] text-slate-500 truncate block">
                                {student.programKeahlian}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-medium text-slate-700">{student.asalSekolah}</td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded-md border border-slate-200 text-[11px] inline-block">
                          {student.tempatPenugasan}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {ass ? (
                          <span className="font-mono text-base font-black text-emerald-900">
                            {ass.nilaiRataRata.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        {ass ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                ass.grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : ass.grade === 'B'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : ass.grade === 'C'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              Grade {ass.grade} ({ass.predikat})
                            </span>
                            {ass.nilaiRataRata < 70 && (
                              <span className="text-[9px] text-rose-600 font-bold mt-0.5 uppercase">
                                TIDAK LULUS
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-semibold">
                            Belum Dinilai
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center text-slate-600 font-mono text-[11px]">
                        {ass ? ass.tanggalPenilaian || '-' : '-'}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Button 1: Pilih / Input Nilai */}
                          <button
                            onClick={() => handleSelectFromTable(student.id)}
                            title="Pilih Siswa Ini untuk Input / Edit Nilai"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-slate-300 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Input / Edit</span>
                          </button>

                          {/* Button 2: Cetak Lembar Nilai */}
                          {ass && (
                            <button
                              onClick={() => onOpenPrintModal('cetak_penilaian', student)}
                              title="Cetak Lembar Nilai Resmi Kemenag"
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Lembar Nilai</span>
                            </button>
                          )}

                          {/* Button 3: Cetak Sertifikat (Hanya Superadmin & Admin) */}
                          {ass && canPrintCertificate && (
                            <button
                              onClick={() => onOpenPrintModal('sertifikat_magang', student)}
                              title="Cetak Sertifikat Magang Resmi (Bolak-Balik A4)"
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Sertifikat</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
