import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  FileCheck,
  Calendar
} from 'lucide-react';
import { Student, DailyActivity } from '../../types';
import { getJakartaDateString } from '../../utils/timeUtils';

interface StudentActivityViewProps {
  student: Student;
  activityList: DailyActivity[];
  onAddActivity: (act: Omit<DailyActivity, 'id'>) => void;
  onUpdateActivity: (act: DailyActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export const StudentActivityView: React.FC<StudentActivityViewProps> = ({
  student,
  activityList,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);

  const todayStr = getJakartaDateString();

  const [tanggal, setTanggal] = useState(todayStr);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('15:00');
  const [uraianKegiatan, setUraianKegiatan] = useState('');
  const [outputKegiatan, setOutputKegiatan] = useState('');
  const [kendala, setKendala] = useState('');
  const [formError, setFormError] = useState('');

  // State untuk popup bentrok jam kegiatan
  const [showOverlapPopup, setShowOverlapPopup] = useState(false);
  const [overlapConflict, setOverlapConflict] = useState<DailyActivity | null>(null);

  const myActivities = activityList.filter(
    (a) => a.studentId === student.id || a.nisn === student.nisn
  );

  const toMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const openAddModal = () => {
    setEditingActivity(null);
    setTanggal(getJakartaDateString());
    setJamMulai('08:00');
    setJamSelesai('15:00');
    setUraianKegiatan('');
    setOutputKegiatan('');
    setKendala('');
    setFormError('');
    setShowOverlapPopup(false);
    setOverlapConflict(null);
    setIsModalOpen(true);
  };

  const openEditModal = (act: DailyActivity) => {
    setEditingActivity(act);
    setTanggal(act.tanggal);
    setJamMulai(act.jamMulai);
    setJamSelesai(act.jamSelesai);
    setUraianKegiatan(act.uraianKegiatan);
    setOutputKegiatan(act.outputKegiatan);
    setKendala(act.kendala || '');
    setFormError('');
    setShowOverlapPopup(false);
    setOverlapConflict(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!uraianKegiatan.trim() || !outputKegiatan.trim()) {
      setFormError('Mohon lengkapi uraian kegiatan dan output kegiatan.');
      return;
    }

    // Validasi format ketat 24 Jam (HH:MM)
    const time24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!time24Regex.test(jamMulai) || !time24Regex.test(jamSelesai)) {
      setFormError('Format jam harus menggunakan format 24 jam yang valid (contoh: 08:00, 15:30).');
      return;
    }

    const startMinutes = toMinutes(jamMulai);
    const endMinutes = toMinutes(jamSelesai);

    if (startMinutes >= endMinutes) {
      setFormError('Jam selesai harus lebih akhir dari jam mulai kegiatan.');
      return;
    }

    // Aturan Validasi: Pada tanggal yang sama, jam kegiatan tidak boleh beririsan dengan kegiatan yang telah dientry sebelumnya
    const conflicting = myActivities.find((existing) => {
      if (editingActivity && existing.id === editingActivity.id) {
        return false;
      }
      if (existing.tanggal !== tanggal) {
        return false;
      }

      const existingStart = toMinutes(existing.jamMulai);
      const existingEnd = toMinutes(existing.jamSelesai);

      return Math.max(startMinutes, existingStart) < Math.min(endMinutes, existingEnd);
    });

    if (conflicting) {
      setOverlapConflict(conflicting);
      setShowOverlapPopup(true);
      return;
    }

    if (editingActivity) {
      onUpdateActivity({
        ...editingActivity,
        tanggal,
        jamMulai,
        jamSelesai,
        uraianKegiatan,
        outputKegiatan,
        kendala,
      });
    } else {
      onAddActivity({
        studentId: student.id,
        studentNama: student.nama,
        nisn: student.nisn,
        seksi: student.tempatPenugasan,
        tanggal,
        jamMulai,
        jamSelesai,
        uraianKegiatan,
        outputKegiatan,
        kendala,
        statusVerifikasi: 'Menunggu',
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, deskripsi: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kegiatan ini?\n"${deskripsi.substring(0, 50)}..."`)) {
      onDeleteActivity(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Jurnal Kegiatan Harian Magang</h2>
          <p className="text-xs text-slate-500">
            Laporkan rincian pekerjaan, jam kerja, output, serta kendala yang Anda hadapi setiap hari.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Kegiatan Baru</span>
        </button>
      </div>

      {/* Activity Cards List */}
      <div className="space-y-4">
        {myActivities.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Belum Ada Jurnal Kegiatan</p>
            <p className="text-xs max-w-sm mx-auto">
              Silakan klik tombol "Input Kegiatan Baru" di atas untuk mencatat tugas dan aktivitas dinas hari ini.
            </p>
          </div>
        ) : (
          myActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
                    {act.tanggal}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.jamMulai} - {act.jamSelesai} WIB (24 Jam)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    <button
                      onClick={() => openEditModal(act)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Kegiatan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id, act.uraianKegiatan)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Data Kegiatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

              {/* Output & Kendala Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                  <span className="font-bold block text-[11px] text-emerald-800 mb-0.5">
                    Output / Hasil Kegiatan:
                  </span>
                  <p>{act.outputKegiatan}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-950">
                  <span className="font-bold block text-[11px] text-amber-800 mb-0.5">
                    Kendala yang Dihadapi:
                  </span>
                  <p>{act.kendala || 'Tidak ada kendala yang berarti.'}</p>
                </div>
              </div>

              {/* Catatan Pembimbing jika ada */}
              {act.catatanPembimbing && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Catatan Pembimbing: </span>
                    <span>{act.catatanPembimbing}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Activity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingActivity ? 'Edit Jurnal Kegiatan' : 'Input Jurnal Kegiatan Harian (Format 24 Jam)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-600/40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">Format 00:00 - 23:59</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    step="60"
                    required
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">Format 00:00 - 23:59</span>
                </div>
              </div>

              {/* Quick 24-Hour Presets */}
              {/*<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-slate-500 mr-1">Preset Waktu (24 Jam):</span>
                {[
                  { label: '07:30 - 12:00', start: '07:30', end: '12:00' },
                  { label: '08:00 - 12:00', start: '08:00', end: '12:00' },
                  { label: '13:00 - 16:00', start: '13:00', end: '16:00' },
                  { label: '13:00 - 16:30', start: '13:00', end: '16:30' },
                  { label: '07:30 - 16:00', start: '07:30', end: '16:00' },
                  { label: '08:00 - 17:00', start: '08:00', end: '17:00' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setJamMulai(preset.start);
                      setJamSelesai(preset.end);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                      jamMulai === preset.start && jamSelesai === preset.end
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>*/}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Kegiatan *</label>
                <textarea
                  rows={3}
                  required
                  value={uraianKegiatan}
                  onChange={(e) => setUraianKegiatan(e.target.value)}
                  placeholder="Jelaskan secara rinci tugas atau pekerjaan yang Anda lakukan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Output / Hasil Kegiatan *</label>
                <textarea
                  rows={2}
                  required
                  value={outputKegiatan}
                  onChange={(e) => setOutputKegiatan(e.target.value)}
                  placeholder="Contoh: 15 dokumen terselesaikan, arsip tersimpan, 3 unit PC terinstal..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kendala yang Dihadapi (Opsional)</label>
                <textarea
                  rows={2}
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  placeholder="Contoh: Koneksi internet melambat, format file tidak terbaca..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  {editingActivity ? 'Simpan Perubahan' : 'Tambahkan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Bentrok Jam Kegiatan */}
      {showOverlapPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-rose-300 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Peringatan Jadwal Beririsan
              </h3>
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl font-semibold text-xs leading-relaxed">
                “pada tanggal dan jam tersebut telah dilakukan entry data, periksa kembali laporan kegiatan nya!”
              </div>
            </div>

            {overlapConflict && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Kegiatan yang telah tercatat sebelumnya:
                </span>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-500">Tanggal:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{overlapConflict.tanggal}</span>
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-500">Rentang Waktu:</span>{' '}
                  <span className="font-mono font-bold text-rose-700">
                    {overlapConflict.jamMulai} - {overlapConflict.jamSelesai} WIB
                  </span>
                </p>
                <p className="text-slate-700 truncate">
                  <span className="font-semibold text-slate-500">Uraian Tugas:</span>{' '}
                  <span className="italic">{overlapConflict.uraianKegiatan}</span>
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowOverlapPopup(false)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                OK, Periksa Kembali Jadwal Kegiatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};