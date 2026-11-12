import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  X,
  FileCheck,
  Printer
} from 'lucide-react';
import { DailyActivity, Student, AppUser } from '../../types';
import { DocumentType } from '../../components/PrintOfficialModal';

interface AdminActivityViewProps {
  currentUser: AppUser;
  students: Student[];
  activityList: DailyActivity[];
  onUpdateActivity: (act: DailyActivity) => void;
  onOpenPrintModal?: (type: DocumentType, student?: Student) => void;
}

export const AdminActivityView: React.FC<AdminActivityViewProps> = ({
  currentUser,
  students,
  activityList,
  onUpdateActivity,
  onOpenPrintModal,
}) => {
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';

  // Section restriction
  const availableStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  const availableStudentIds = new Set(availableStudents.map((s) => s.id));
  const availableStudentNisns = new Set(availableStudents.map((s) => s.nisn));

  const filteredActivitiesByRole = activityList.filter(
    (a) => availableStudentIds.has(a.studentId) || availableStudentNisns.has(a.nisn)
  );

  const [searchStudent, setSearchStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'Disetujui' | 'Menunggu' | 'Perlu Revisi'>('Disetujui');
  const [catatanPembimbing, setCatatanPembimbing] = useState('');

  const displayList = filteredActivitiesByRole.filter((act) => {
    const matchesSearch =
      act.studentNama.toLowerCase().includes(searchStudent.toLowerCase()) ||
      act.nisn.includes(searchStudent) ||
      act.uraianKegiatan.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesStatus = filterStatus === 'all' || act.statusVerifikasi === filterStatus;
    const matchesDate = !filterDate || act.tanggal === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const openVerificationModal = (act: DailyActivity) => {
    setSelectedActivity(act);
    setVerificationStatus(act.statusVerifikasi);
    setCatatanPembimbing(act.catatanPembimbing || '');
  };

  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    onUpdateActivity({
      ...selectedActivity,
      statusVerifikasi: verificationStatus,
      catatanPembimbing,
    });

    setSelectedActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Laporan Kegiatan Harian Siswa</h2>
          <p className="text-xs text-slate-500">
            Tinjau catatan uraian tugas harian, hasil output kerja, kendala teknis, serta berikan verifikasi dan umpan balik pembimbing.
          </p>
        </div>

        {onOpenPrintModal && (
          <button
            onClick={() => onOpenPrintModal('rekap_kegiatan_siswa', availableStudents[0])}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi (Kop Surat)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, uraian..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 w-48 sm:w-60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tanggal:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Verifikasi:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-xs ml-auto">
          Total Log: {displayList.length}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            Tidak ada laporan kegiatan yang sesuai filter.
          </div>
        ) : (
          displayList.map((act) => (
            <div
              key={act.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{act.studentNama}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NISN: {act.nisn} &bull; Unit: {act.seksi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {act.tanggal}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {act.jamMulai} - {act.jamSelesai} WIB
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      act.statusVerifikasi === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.statusVerifikasi === 'Perlu Revisi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {act.statusVerifikasi}
                  </span>

                  <button
                    onClick={() => openVerificationModal(act)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Verifikasi / Catatan</span>
                  </button>
                </div>
              </div>

              {/* Uraian Kegiatan */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Uraian Kegiatan:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {act.uraianKegiatan}
                </p>
              </div>

              {/* Output and Kendala */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                  <span className="font-bold block text-[11px] text-emerald-800 mb-0.5">
                    Output Hasil Kegiatan:
                  </span>
                  <p>{act.outputKegiatan}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-950">
                  <span className="font-bold block text-[11px] text-amber-800 mb-0.5">
                    Kendala yang Dihadapi:
                  </span>
                  <p>{act.kendala || 'Tidak ada kendala.'}</p>
                </div>
              </div>

              {/* Feedback if any */}
              {act.catatanPembimbing && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Umpan Balik Pembimbing: </span>
                    <span className="italic">{act.catatanPembimbing}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Verification Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Verifikasi Jurnal Kegiatan</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVerification} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="text-slate-400 block text-[10px]">Siswa:</span>
                <span className="font-bold text-slate-900">{selectedActivity.studentNama}</span>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  "{selectedActivity.uraianKegiatan}"
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Status Verifikasi Pembimbing *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Disetujui', 'Menunggu', 'Perlu Revisi'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setVerificationStatus(st)}
                      className={`py-2 px-1 text-center font-bold text-xs rounded-xl border transition-all ${
                        verificationStatus === st
                          ? st === 'Disetujui'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : st === 'Perlu Revisi'
                            ? 'bg-rose-700 text-white border-rose-700'
                            : 'bg-amber-700 text-white border-amber-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Evaluasi Pembimbing untuk Siswa:
                </label>
                <textarea
                  rows={3}
                  value={catatanPembimbing}
                  onChange={(e) => setCatatanPembimbing(e.target.value)}
                  placeholder="Beri motivasi atau arahan perbaikan tugas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
