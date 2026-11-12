import React, { useState } from 'react';
import { User, Save, Lock, CheckCircle2, ShieldCheck, MapPin, School, Phone, KeyRound } from 'lucide-react';
import { Student } from '../../types';

interface StudentProfileViewProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onUpdateStudent,
  onNavigateTab,
}) => {
  const [formData, setFormData] = useState<Student>({ ...student });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudent(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Biodata &amp; Profil Siswa Magang</h2>
          <p className="text-xs text-slate-500">
            Perbarui data identitas pribadi Anda. Penugasan kantor dikelola oleh administrator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('siswa_password')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>Menu Ubah Password</span>
            </button>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tersimpan!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Photo & Basic Badge Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-emerald-600/40 shadow-md bg-white">
              <img
                src={formData.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=266&fit=crop&q=80'}
                alt={formData.nama}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-emerald-800 text-[9px] text-white font-bold uppercase shadow-xs">
              Foto 3x4
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">{formData.nama}</h3>
            <p className="text-xs text-slate-500 font-mono">NISN: {formData.nisn} &bull; {formData.asalSekolah}</p>
            <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                {formData.tempatPenugasan}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                Tahun {formData.tahun}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Identitas Pribadi */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Identitas Pribadi Siswa / Mahasiswa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NISN / NIM *</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp Siswa *</label>
                <input
                  type="text"
                  required
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Foto Profil (3x4)</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sekolah & Pembimbing Sekolah */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-700" />
              <span>Asal Sekolah &amp; Guru/Dosen Pembimbing</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah / Kampus *</label>
                <input
                  type="text"
                  required
                  value={formData.asalSekolah}
                  onChange={(e) => setFormData({ ...formData, asalSekolah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas / Tingkat</label>
                <input
                  type="text"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Contoh: XII TKJ 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Keahlian / Jurusan *</label>
                <input
                  type="text"
                  required
                  value={formData.programKeahlian}
                  onChange={(e) => setFormData({ ...formData, programKeahlian: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Guru / Dosen Pembimbing</label>
                <input
                  type="text"
                  value={formData.pembimbingSekolah}
                  onChange={(e) => setFormData({ ...formData, pembimbingSekolah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. HP / WA Pembimbing Sekolah</label>
                <input
                  type="text"
                  value={formData.noHpPembimbing}
                  onChange={(e) => setFormData({ ...formData, noHpPembimbing: e.target.value })}
                  placeholder="Contoh: 081298765432"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Data Penugasan Kantor (Ditetapkan Admin - Read Only) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-700 text-xs mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Data Penugasan Kemenag (Ditetapkan oleh Admin Kantor)
              </span>
              <span className="text-[10px] text-slate-400 italic">Hanya dapat diubah Administrator</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              <div>
                <span className="block text-[10px] text-slate-400">Unit Sub Bagian / Seksi:</span>
                <span className="font-semibold text-slate-800">{formData.tempatPenugasan}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Pembimbing Kantor:</span>
                <span className="font-semibold text-slate-800">{formData.pembimbingKantor}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">NIP Pembimbing:</span>
                <span className="font-mono text-slate-800">{formData.nipPembimbing}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Waktu Pelaksanaan:</span>
                <span className="font-mono text-slate-800">
                  {formData.tanggalMulai || '2026-08-15'} s.d. {formData.tanggalSelesai || '2026-12-15'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Status Magang:</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  formData.status === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800'
                    : formData.status === 'Selesai'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Save Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Biodata</span>
          </button>
        </div>
      </form>
    </div>
  );
};
