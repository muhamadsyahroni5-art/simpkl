import React, { useState } from 'react';
import {
  CalendarCheck,
  MessageSquare,
  Filter,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { AttendanceRecord, Student, AppUser, SubbagSeksiType } from '../../types';

interface AdminAttendanceViewProps {
  currentUser: AppUser;
  students: Student[];
  attendanceList: AttendanceRecord[];
  onAddAttendance: (rec: Omit<AttendanceRecord, 'id'>) => void;
  onOpenWaModal: (record: AttendanceRecord, student: Student) => void;
}

export const AdminAttendanceView: React.FC<AdminAttendanceViewProps> = ({
  currentUser,
  students,
  attendanceList,
  onAddAttendance,
  onOpenWaModal,
}) => {
  const isRestricted = currentUser.role === 'admin_seksi' || currentUser.role === 'opr_pembimbing';

  // Section restriction
  const availableStudents = isRestricted
    ? students.filter((s) => s.tempatPenugasan === currentUser.seksi)
    : students;

  const availableStudentIds = new Set(availableStudents.map((s) => s.id));
  const availableStudentNisns = new Set(availableStudents.map((s) => s.nisn));

  const filteredAttendanceByRole = attendanceList.filter(
    (a) => availableStudentIds.has(a.studentId) || availableStudentNisns.has(a.nisn)
  );

  const [searchStudent, setSearchStudent] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual record form
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedStudentId, setSelectedStudentId] = useState(availableStudents[0]?.id || '');
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualJamMasuk, setManualJamMasuk] = useState('07:30');
  const [manualJamPulang, setManualJamPulang] = useState('16:00');
  const [manualStatus, setManualStatus] = useState<'Hadir' | 'Sakit' | 'Alfa' | 'Izin'>('Hadir');
  const [manualKeterangan, setManualKeterangan] = useState('');

  const displayList = filteredAttendanceByRole.filter((att) => {
    const matchesSearch =
      att.studentNama.toLowerCase().includes(searchStudent.toLowerCase()) ||
      att.nisn.includes(searchStudent);
    const matchesDate = !filterDate || att.tanggal === filterDate;
    const matchesStatus = filterStatus === 'all' || att.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    onAddAttendance({
      studentId: st.id,
      studentNama: st.nama,
      nisn: st.nisn,
      seksi: st.tempatPenugasan,
      tanggal: manualDate,
      jamMasuk: manualStatus === 'Hadir' ? manualJamMasuk : '-',
      jamPulang: manualStatus === 'Hadir' ? manualJamPulang : '-',
      status: manualStatus,
      keterangan: manualKeterangan || `Presensi ${manualStatus} oleh Pembimbing`,
      pembimbingSekolah: st.pembimbingSekolah,
      noHpPembimbing: st.noHpPembimbing,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Manajemen Absensi Masuk &amp; Pulang Siswa
          </h2>
          <p className="text-xs text-slate-500">
            Pantau kehadiran real-time dan kirimkan status ketidakhadiran langsung ke WhatsApp pembimbing sekolah.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Presensi Manual</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa atau NISN..."
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
            <span className="text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
              <option value="Alfa">Alfa</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-xs ml-auto">
          Total Log: {displayList.length}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Tanggal &amp; Waktu</th>
                <th className="p-3">Nama Siswa &amp; NISN</th>
                <th className="p-3">Unit Penugasan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Keterangan Presensi</th>
                <th className="p-3 text-center">Notifikasi WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada rekaman absensi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                displayList.map((att) => {
                  const student = students.find(
                    (s) => s.id === att.studentId || s.nisn === att.nisn
                  );
                  const isAbsent = att.status === 'Sakit' || att.status === 'Alfa' || att.status === 'Izin';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-900">{att.tanggal}</div>
                        <div className="text-[10px] text-slate-500">
                          {att.jamMasuk} - {att.jamPulang} WIB
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{att.studentNama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NISN: {att.nisn}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-700">{att.seksi}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
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
                      <td className="p-3 text-slate-600 max-w-xs">{att.keterangan || '-'}</td>
                      <td className="p-3 text-center">
                        {student && (
                          <button
                            onClick={() => onOpenWaModal(att, student)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isAbsent
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
                            }`}
                            title="Kirim Pesan WhatsApp ke Pembimbing Sekolah"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isAbsent ? 'Kirim WA Ketidakhadiran' : 'Kirim WA'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Manual Attendance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Input Presensi Manual Siswa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-emerald-600"
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn} - {s.tempatPenugasan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Presensi *</label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kehadiran *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Hadir', 'Sakit', 'Izin', 'Alfa'].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setManualStatus(st as any)}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        manualStatus === st
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {manualStatus === 'Hadir' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Masuk</label>
                    <input
                      type="time"
                      value={manualJamMasuk}
                      onChange={(e) => setManualJamMasuk(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Pulang</label>
                    <input
                      type="time"
                      value={manualJamPulang}
                      onChange={(e) => setManualJamPulang(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Presensi</label>
                <textarea
                  rows={2}
                  value={manualKeterangan}
                  onChange={(e) => setManualKeterangan(e.target.value)}
                  placeholder="Catatan / alasan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
