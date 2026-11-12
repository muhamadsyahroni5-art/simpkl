import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Building2,
  Phone,
  School,
  Lock,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Award,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  Student,
  AppUser,
  SUBBAG_SEKSI_OPTIONS,
  SubbagSeksiType,
  StudentStatus,
  Assessment,
  SUPERVISOR_PRESETS,
  SupervisorOption
} from '../../types';

interface AdminStudentsViewProps {
  currentUser: AppUser;
  students: Student[];
  assessments?: Assessment[];
  allUsers?: AppUser[];
  onAddStudent: (std: Omit<Student, 'id'>) => void;
  onUpdateStudent: (std: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({
  currentUser,
  students,
  assessments = [],
  allUsers = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';

  // Section-restricted access enforcement
  const availableStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeksiFilter, setSelectedSeksiFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedAssessmentFilter, setSelectedAssessmentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultSeksi = (isRestricted && currentUser.seksi !== 'Semua Subbag / Seksi'
    ? currentUser.seksi
    : SUBBAG_SEKSI_OPTIONS[0]) as SubbagSeksiType;

  const defaultSupervisor = SUPERVISOR_PRESETS[defaultSeksi]?.[0] || {
    nama: currentUser.nama || 'Dian Permana, S.Kom.',
    nip: currentUser.nip || '199104192019031006',
    jabatan: 'Pembimbing Instansi',
  };

  // Form State
  const initialForm = {
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=266&fit=crop&q=80',
    username: '',
    password: 'password123',
    nama: '',
    nisn: '',
    tempatLahir: 'Lebak',
    tanggalLahir: '2006-05-15',
    kelas: 'XII',
    programKeahlian: '',
    noHp: '',
    asalSekolah: '',
    pembimbingSekolah: '',
    noHpPembimbing: '',
    alamat: '',
    tempatPenugasan: defaultSeksi,
    pembimbingKantor: defaultSupervisor.nama,
    nipPembimbing: defaultSupervisor.nip,
    status: 'Aktif' as StudentStatus,
    tahun: '2026',
    tanggalMulai: '2026-08-15',
    tanggalSelesai: '2026-12-15',
  };

  const [formData, setFormData] = useState(initialForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, photo: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter students by search, seksi, status magang, and status penilaian
  const filteredStudents = availableStudents.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeksi =
      selectedSeksiFilter === 'all' || s.tempatPenugasan === selectedSeksiFilter;
    const matchesStatus =
      selectedStatusFilter === 'all' || s.status === selectedStatusFilter;

    // Check assessment status: Sudah Dinilai vs Belum Dinilai
    const ass = assessments.find((a) => a.studentId === s.id || a.nisn === s.nisn);
    const hasScore = ass && ass.nilaiRataRata > 0;
    const matchesAssessment =
      selectedAssessmentFilter === 'all' ||
      (selectedAssessmentFilter === 'sudah' && hasScore) ||
      (selectedAssessmentFilter === 'belum' && !hasScore);

    return matchesSearch && matchesSeksi && matchesStatus && matchesAssessment;
  });

  // Supervisors available for the selected tempatPenugasan
  const availableSupervisors = useMemo(() => {
    const preset = SUPERVISOR_PRESETS[formData.tempatPenugasan] || [];
    // Also include any users assigned to this seksi
    const matchingUsers: SupervisorOption[] = allUsers
      .filter((u) => u.seksi === formData.tempatPenugasan)
      .map((u) => ({
        nama: u.nama,
        nip: u.nip,
        jabatan: u.jabatan,
      }));

    // Deduplicate by NIP
    const combined = [...preset];
    matchingUsers.forEach((u) => {
      if (!combined.some((c) => c.nip === u.nip)) {
        combined.push(u);
      }
    });

    return combined;
  }, [formData.tempatPenugasan, allUsers]);

  // When section changes, automatically update pembimbingKantor & nipPembimbing
  const handleSectionChange = (newSeksi: SubbagSeksiType) => {
    const supervisors = SUPERVISOR_PRESETS[newSeksi] || [];
    const firstSup = supervisors[0] || {
      nama: currentUser.nama || 'Dian Permana, S.Kom.',
      nip: currentUser.nip || '199104192019031006',
    };

    setFormData((prev) => ({
      ...prev,
      tempatPenugasan: newSeksi,
      pembimbingKantor: firstSup.nama,
      nipPembimbing: firstSup.nip,
    }));
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      photo: student.photo,
      username: student.username,
      password: student.password || 'password123',
      nama: student.nama,
      nisn: student.nisn,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      kelas: student.kelas,
      programKeahlian: student.programKeahlian,
      noHp: student.noHp,
      asalSekolah: student.asalSekolah,
      pembimbingSekolah: student.pembimbingSekolah,
      noHpPembimbing: student.noHpPembimbing,
      alamat: student.alamat,
      tempatPenugasan: student.tempatPenugasan,
      pembimbingKantor: student.pembimbingKantor,
      nipPembimbing: student.nipPembimbing,
      status: student.status,
      tahun: student.tahun,
      tanggalMulai: student.tanggalMulai || '2026-08-15',
      tanggalSelesai: student.tanggalSelesai || '2026-12-15',
    });
    setIsModalOpen(true);
  };

  // Auto transition to Selesai if tanggal selesai has arrived or passed
  const handleEndDateChange = (endDate: string) => {
    let newStatus = formData.status;
    if (endDate && todayStr >= endDate && formData.status === 'Aktif') {
      newStatus = 'Selesai';
    }
    setFormData({
      ...formData,
      tanggalSelesai: endDate,
      status: newStatus,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Rule: Bila batas waktu tanggal selesai magang telah tiba maka buat status magang menjadi Selesai.
    let finalStatus = formData.status;
    if (formData.tanggalSelesai && todayStr >= formData.tanggalSelesai && formData.status === 'Aktif') {
      finalStatus = 'Selesai';
    }

    const payload = {
      ...formData,
      status: finalStatus,
    };

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...payload,
      });
    } else {
      onAddStudent(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data siswa: ${nama}? Semua riwayat absensi dan kegiatan juga akan terhapus.`)) {
      onDeleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Data Siswa PKL / Magang</h2>
          <p className="text-xs text-slate-500">
            {isRestricted ? (
              <span className="text-emerald-700 font-semibold">
                Unit {currentUser.seksi} &bull; Menampilkan data siswa penugasan seksi Anda
              </span>
            ) : (
              'Kelola identitas, periode magang, status magang (Aktif, Selesai, Berhenti/Pindah), dan penempatan unit seksi.'
            )}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, atau sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {!isRestricted && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-700 shrink-0" />
              <select
                value={selectedSeksiFilter}
                onChange={(e) => setSelectedSeksiFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-emerald-600 w-48"
              >
                <option value="all">Semua Subbag / Seksi</option>
                {SUBBAG_SEKSI_OPTIONS.map((seksi) => (
                  <option key={seksi} value={seksi}>
                    {seksi}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-emerald-600"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
              <option value="Berhenti/Pindah">Berhenti/Pindah</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Penilaian:</span>
            <select
              value={selectedAssessmentFilter}
              onChange={(e) => setSelectedAssessmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-emerald-600"
            >
              <option value="all">Semua Penilaian</option>
              <option value="sudah">Sudah Dinilai</option>
              <option value="belum">Belum Dinilai</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-xs ml-auto">
          Total: {filteredStudents.length} Siswa
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3 w-16 text-center">Foto</th>
                <th className="p-3">Nama Lengkap &amp; Akun</th>
                <th className="p-3">NISN &amp; Sekolah</th>
                <th className="p-3">Tempat Penugasan</th>
                <th className="p-3">Waktu Pelaksanaan</th>
                <th className="p-3 text-center">Status Magang</th>
                <th className="p-3 text-center">Status Penilaian</th>
                <th className="p-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const stdAss = assessments.find(
                    (a) => a.studentId === std.id || a.nisn === std.nisn
                  );
                  const isAssessed = stdAss && stdAss.nilaiRataRata > 0;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-center">
                        <div className="w-10 h-13 rounded-lg overflow-hidden border border-slate-200 mx-auto shadow-xs bg-slate-100">
                          <img
                            src={std.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                            alt={std.nama}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{std.nama}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1 py-0.2 rounded">user: {std.username}</span>
                          <span>&bull;</span>
                          <span>{std.noHp}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-semibold text-slate-800">{std.nisn}</div>
                        <div className="text-[11px] text-slate-600">{std.asalSekolah}</div>
                        <div className="text-[10px] text-slate-400">{std.programKeahlian}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {std.tempatPenugasan}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Pembimbing: {std.pembimbingKantor}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        <div>{std.tanggalMulai || '-'} s.d.</div>
                        <div>{std.tanggalSelesai || '-'}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            std.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : std.status === 'Selesai'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isAssessed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Sudah Dinilai ({stdAss.nilaiRataRata.toFixed(1)} &bull; {stdAss.grade})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[10px] bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Belum Dinilai</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(std)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(std.id, std.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm text-white">
                {editingStudent ? 'Edit Data Siswa PKL / Magang' : 'Tambah Data Siswa PKL / Magang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Photo & Auth Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Foto Siswa (Pas Foto 3x4)
                  </label>
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-20 rounded-xl border-2 border-slate-300 overflow-hidden bg-white shrink-0 shadow-xs relative">
                      <img
                        src={formData.photo || '/assets/aistudio/media_1792507912355_fb074e24_71599073.png'}
                        alt="Preview 3x4"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih &amp; Upload File Foto</span>
                      </button>

                      <input
                        type="url"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        placeholder="Atau tempel URL foto..."
                        className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-[11px] bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username Login Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: farhan26"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Login *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Personal Data */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-3 pb-1 border-b border-slate-100 uppercase tracking-wider text-emerald-800">
                  Data Identitas Siswa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Contoh: MUHAMMAD FARHAN"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NISN / NIM Siswa *</label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="Contoh: 20241003"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formData.kelas}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      placeholder="Contoh: XII"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Program Keahlian *</label>
                    <input
                      type="text"
                      required
                      value={formData.programKeahlian}
                      onChange={(e) => setFormData({ ...formData, programKeahlian: e.target.value })}
                      placeholder="Contoh: Teknik Komputer dan Jaringan"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP / WA Siswa *</label>
                    <input
                      type="text"
                      required
                      value={formData.noHp}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alamat Tinggal</label>
                    <input
                      type="text"
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* School and School Supervisor */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-3 pb-1 border-b border-slate-100 uppercase tracking-wider text-emerald-800">
                  Data Asal Sekolah &amp; Pembimbing Sekolah
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah / Kampus *</label>
                    <input
                      type="text"
                      required
                      value={formData.asalSekolah}
                      onChange={(e) => setFormData({ ...formData, asalSekolah: e.target.value })}
                      placeholder="Contoh: SMKN 2 Rangkasbitung"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Pembimbing Sekolah</label>
                    <input
                      type="text"
                      value={formData.pembimbingSekolah}
                      onChange={(e) => setFormData({ ...formData, pembimbingSekolah: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP/WA Pembimbing Sekolah *</label>
                    <input
                      type="text"
                      required
                      value={formData.noHpPembimbing}
                      onChange={(e) => setFormData({ ...formData, noHpPembimbing: e.target.value })}
                      placeholder="08..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Periode Magang & Status Magang (Sesuai Permintaan User) */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Periode Waktu Pelaksanaan &amp; Status Magang</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tanggal Mulai Magang *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalMulai}
                      onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tanggal Selesai Magang *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalSelesai}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Magang *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-bold text-slate-800 focus:outline-emerald-600"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Berhenti/Pindah">Berhenti/Pindah</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-800 flex items-start gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aturan Otomatis:</strong> Bila batas waktu tanggal selesai magang telah tiba atau terlewat (hari ini &ge; tanggal selesai), sistem akan secara otomatis mengalihkan status siswa menjadi <strong>Selesai</strong>.
                  </span>
                </div>
              </div>

              {/* Penugasan 13 Seksi & Pembimbing Kantor */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs pb-1 border-b border-slate-200 uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>Tempat Penugasan &amp; Pembimbing Kantor Kemenag</span>
                  <span className="text-[10px] text-slate-500 font-normal normal-case">
                    *Nama pembimbing otomatis menyesuaikan unit seksi terpilih
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tempat Penugasan (13 Pilihan Subbag / Seksi) *
                    </label>
                    <select
                      value={formData.tempatPenugasan}
                      disabled={isRestricted && currentUser.seksi !== 'Semua Subbag / Seksi'}
                      onChange={(e) => handleSectionChange(e.target.value as SubbagSeksiType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600"
                    >
                      {SUBBAG_SEKSI_OPTIONS.map((seksi) => (
                        <option key={seksi} value={seksi}>
                          {seksi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pilih Pembimbing Kantor (Otomatis Sesuai Seksi) *
                    </label>
                    <select
                      value={`${formData.pembimbingKantor}__${formData.nipPembimbing}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          const [nama, nip] = val.split('__');
                          setFormData({ ...formData, pembimbingKantor: nama, nipPembimbing: nip });
                        }
                      }}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50/60 font-bold text-emerald-900 focus:outline-emerald-600 shadow-xs"
                    >
                      {availableSupervisors.map((sup) => (
                        <option key={sup.nip} value={`${sup.nama}__${sup.nip}`}>
                          {sup.nama} &bull; NIP. {sup.nip} ({sup.jabatan})
                        </option>
                      ))}
                      <option value="custom">-- Input Manual / Pembimbing Lain --</option>
                    </select>
                  </div>
                </div>

                {/* Auto-filled confirmation & custom override fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Pembimbing Kantor</label>
                    <input
                      type="text"
                      required
                      value={formData.pembimbingKantor}
                      onChange={(e) => setFormData({ ...formData, pembimbingKantor: e.target.value })}
                      placeholder="Contoh: DEDEN FIRDAUS, S.AG"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIP Pembimbing Kantor</label>
                    <input
                      type="text"
                      required
                      value={formData.nipPembimbing}
                      onChange={(e) => setFormData({ ...formData, nipPembimbing: e.target.value })}
                      placeholder="Contoh: 197811202005011004"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan Siswa' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
