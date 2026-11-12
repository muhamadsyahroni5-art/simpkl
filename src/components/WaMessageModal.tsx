import React, { useState } from 'react';
import { MessageSquare, X, Send, Phone, CheckCircle, Copy } from 'lucide-react';
import { AttendanceRecord, Student } from '../types';

interface WaMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  student: Student | null;
}

export const WaMessageModal: React.FC<WaMessageModalProps> = ({
  isOpen,
  onClose,
  record,
  student,
}) => {
  if (!isOpen || !record || !student) return null;

  const initialPhone = student.noHpPembimbing || record.noHpPembimbing || '';
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [copied, setCopied] = useState(false);

  const defaultMessage = `Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu Pembimbing Sekolah (${student.pembimbingSekolah || 'Bapak/Ibu Guru'})
Asal Sekolah/Kampus: ${student.asalSekolah}

Kami dari Kantor Kementerian Agama Kabupaten Lebak memberitahukan status kehadiran siswa bimbingan Bapak/Ibu:

• Nama Siswa : ${student.nama}
• NISN       : ${student.nisn}
• Penugasan  : ${student.tempatPenugasan}
• Tanggal    : ${record.tanggal}
• Status     : ${record.status.toUpperCase()}
• Keterangan : ${record.keterangan || 'Tidak ada keterangan'}

Mohon konfirmasi atau koordinasi lebih lanjut jika ada informasi yang perlu disampaikan. Terima kasih atas kerjasama yang baik.

Wassalamu'alaikum Wr. Wb.
Pembimbing PKL/Magang
Kantor Kemenag Kabupaten Lebak
Jl. Siliwangi No. 2 Rangkasbitung`;

  const [message, setMessage] = useState(defaultMessage);

  // Format phone to international 62
  const formatPhoneForWa = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const handleSendWa = () => {
    const formattedPhone = formatPhoneForWa(phoneNumber);
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/60 flex items-center justify-center border border-emerald-400/40">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Kirim Pesan Notifikasi WA
              </h3>
              <p className="text-[11px] text-emerald-200">
                Pemberitahuan Status Ketidakhadiran ke Pembimbing Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-600/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Student Status Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Nama Siswa</span>
              <span className="font-semibold text-slate-900">{student.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status Absensi</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  record.status === 'Sakit'
                    ? 'bg-amber-100 text-amber-800'
                    : record.status === 'Alfa'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {record.status} ({record.tanggal})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pembimbing Sekolah</span>
              <span className="font-medium text-slate-800">{student.pembimbingSekolah}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Asal Sekolah</span>
              <span className="font-medium text-slate-800 truncate block">{student.asalSekolah}</span>
            </div>
          </div>

          {/* Target Phone Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Pembimbing Sekolah:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081298765432"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Format nomor otomatis dikonversi ke kode negara (62).
            </p>
          </div>

          {/* Message template editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Pesan Notifikasi (Dapat Diedit):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 text-[11px]"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-emerald-600 font-sans text-xs leading-relaxed text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSendWa}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs transition-colors text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Pesan via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
