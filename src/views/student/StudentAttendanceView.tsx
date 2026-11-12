import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Globe,
  MapPin,
  Compass,
  Navigation,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Student, AttendanceRecord, GpsLocationConfig } from '../../types';
import {
  getJakartaDateString,
  getJakartaTimeString,
  getJakartaFormattedDate,
  getKemenagWorkSchedule,
} from '../../utils/timeUtils';
import { calculateDistanceMeters } from '../../utils/gpsUtils';
import { GpsMapPreview } from '../../components/GpsMapPreview';

interface StudentAttendanceViewProps {
  student: Student;
  attendanceList: AttendanceRecord[];
  onAddOrUpdateAttendance: (record: Partial<AttendanceRecord>) => void;
  gpsConfig?: GpsLocationConfig;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  student,
  attendanceList,
  onAddOrUpdateAttendance,
  gpsConfig,
}) => {
  const [currentTime, setCurrentTime] = useState(() => getJakartaTimeString(true));
  const [currentDateFormatted, setCurrentDateFormatted] = useState(() => getJakartaFormattedDate());
  const [todayStr, setTodayStr] = useState(() => getJakartaDateString());

  const schedule = getKemenagWorkSchedule();

  // GPS State
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getJakartaTimeString(true));
      setCurrentDateFormatted(getJakartaFormattedDate());
      setTodayStr(getJakartaDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayRecord = attendanceList.find(
    (a) => (a.studentId === student.id || a.nisn === student.nisn) && a.tanggal === todayStr
  );

  const [status, setStatus] = useState<'Hadir' | 'Sakit' | 'Alfa' | 'Izin'>(
    todayRecord ? todayRecord.status : 'Hadir'
  );
  const [keterangan, setKeterangan] = useState(todayRecord ? todayRecord.keterangan : '');
  const [successMsg, setSuccessMsg] = useState('');

  const myHistory = attendanceList.filter(
    (a) => a.studentId === student.id || a.nisn === student.nisn
  );

  // Cek apakah sudah absen masuk dan absen pulang
  const hasClockIn = todayRecord && todayRecord.jamMasuk && todayRecord.jamMasuk !== '-';
  const hasClockOut = todayRecord && todayRecord.jamPulang && todayRecord.jamPulang !== '-';

  // Function to fetch device location and validate against gpsConfig
  const fetchDeviceGps = (): Promise<{ lat: number; lng: number; dist: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Browser Anda tidak mendukung layanan lokasi Geolocation.');
        return;
      }

      setGpsLoading(true);
      setGpsErrorMsg(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);

          const officeLat = gpsConfig?.latitude ?? -6.36791;
          const officeLng = gpsConfig?.longitude ?? 106.26853;
          const dist = calculateDistanceMeters(lat, lng, officeLat, officeLng);
          setDistanceMeters(dist);
          setGpsLoading(false);
          resolve({ lat, lng, dist });
        },
        (err) => {
          setGpsLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            reject('Akses GPS/Lokasi ditolak. Mohon aktifkan izin lokasi di browser Anda untuk melakukan absensi.');
          } else {
            reject(`Gagal mendeteksi sinyal GPS: ${err.message}`);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSimulateOfficeGps = () => {
    setUserLat(gpsConfig?.latitude ?? -6.36791);
    setUserLng(gpsConfig?.longitude ?? 106.26853);
    setDistanceMeters(0);
    setGpsErrorMsg(null);
    setSuccessMsg('Simulasi GPS berhasil diatur tepat di Kantor Kemenag Lebak (Jarak 0m). Silakan klik tombol Absen Masuk/Pulang.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleClockIn = async () => {
    if (hasClockIn) return;
    setGpsErrorMsg(null);

    let gpsNote = '';

    // If GPS Validation is active
    if (gpsConfig?.isEnabled) {
      try {
        const { dist } = await fetchDeviceGps();
        if (dist > gpsConfig.radiusMeters) {
          setGpsErrorMsg(
            `Absensi Masuk Ditolak! Posisi Anda berada ${dist} meter dari kantor Kemenag Lebak (Maksimal Radius: ${gpsConfig.radiusMeters} meter).`
          );
          return;
        }
        gpsNote = ` [GPS Terverifikasi: ${dist}m dari kantor]`;
      } catch (err: any) {
        setGpsErrorMsg(typeof err === 'string' ? err : 'Gagal memverifikasi lokasi GPS.');
        return;
      }
    }

    const timeNow = getJakartaTimeString(false);
    const dateNow = getJakartaDateString();
    const isLate = timeNow > schedule.scheduledIn;

    onAddOrUpdateAttendance({
      studentId: student.id,
      studentNama: student.nama,
      nisn: student.nisn,
      seksi: student.tempatPenugasan,
      tanggal: dateNow,
      jamMasuk: timeNow,
      jamPulang: todayRecord?.jamPulang || '-',
      status: todayRecord?.status || 'Hadir',
      keterangan: (keterangan || (isLate ? `Masuk melewati batas jam ${schedule.scheduledIn} WIB` : 'Hadir mengikuti dinas')) + gpsNote,
      pembimbingSekolah: student.pembimbingSekolah,
      noHpPembimbing: student.noHpPembimbing,
    });

    setSuccessMsg(`Absensi Masuk berhasil dicatat pada pukul ${timeNow} WIB (Jadwal Masuk: ${schedule.scheduledIn} WIB)!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleClockOut = async () => {
    if (hasClockOut) return;
    setGpsErrorMsg(null);

    let gpsNote = '';

    if (gpsConfig?.isEnabled) {
      try {
        const { dist } = await fetchDeviceGps();
        if (dist > gpsConfig.radiusMeters) {
          setGpsErrorMsg(
            `Absensi Pulang Ditolak! Posisi Anda berada ${dist} meter dari kantor Kemenag Lebak (Maksimal Radius: ${gpsConfig.radiusMeters} meter).`
          );
          return;
        }
        gpsNote = ` [GPS Terverifikasi: ${dist}m dari kantor]`;
      } catch (err: any) {
        setGpsErrorMsg(typeof err === 'string' ? err : 'Gagal memverifikasi lokasi GPS.');
        return;
      }
    }

    const timeNow = getJakartaTimeString(false);
    const dateNow = getJakartaDateString();

    onAddOrUpdateAttendance({
      studentId: student.id,
      studentNama: student.nama,
      nisn: student.nisn,
      seksi: student.tempatPenugasan,
      tanggal: dateNow,
      jamMasuk: todayRecord?.jamMasuk || schedule.scheduledIn,
      jamPulang: timeNow,
      status: todayRecord?.status || 'Hadir',
      keterangan: (keterangan || todayRecord?.keterangan || 'Presensi kepulangan lengkap') + gpsNote,
      pembimbingSekolah: student.pembimbingSekolah,
      noHpPembimbing: student.noHpPembimbing,
    });

    setSuccessMsg(`Absensi Pulang berhasil dicatat pada pukul ${timeNow} WIB (Jadwal Pulang ${schedule.dayName}: ${schedule.scheduledOut} WIB)!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Presensi Kehadiran Siswa PKL</h2>
          <p className="text-xs text-slate-500">
            Catat jam masuk dan jam pulang Anda setiap hari kerja di Kantor Kemenag Lebak.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[11px] font-semibold w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sinkron Server: GMT + 7 (WIB Jakarta, Indonesia)</span>
        </div>
      </div>

      {/* GPS Status Geofence Notice */}
      {gpsConfig?.isEnabled && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Validasi Presensi GPS Kantor Aktif</p>
              <p className="text-[11px] text-emerald-800">
                Absensi hanya dapat dilakukan jika Anda berada dalam radius <strong>{gpsConfig.radiusMeters} meter</strong> dari Kantor Kemenag Lebak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchDeviceGps()}
            disabled={gpsLoading}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:bg-slate-400"
          >
            <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Mendeteksi Lokasi...' : 'Cek Lokasi GPS Saya'}</span>
          </button>
        </div>
      )}



      {gpsErrorMsg && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-950 text-sm mb-0.5">Validasi Geofencing GPS Ditolak</h4>
              <p className="leading-relaxed">{gpsErrorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulateOfficeGps}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Gunakan Lokasi Kantor (Simulasi)</span>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Clock Cards & Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Real-time Clock Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-lg space-y-4 text-center">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
            Jam Digital Real-Time WIB
          </span>

          <div className="text-4xl font-black font-mono tracking-tight text-amber-300 drop-shadow-md">
            {currentTime}
          </div>

          <div className="text-xs text-slate-300 font-medium">
            {currentDateFormatted}
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-300">Jadwal Kerja Dinas {schedule.dayName}:</p>
            <p>Jam Masuk: <strong className="text-white">{schedule.scheduledIn} WIB</strong></p>
            <p>Jam Pulang: <strong className="text-white">{schedule.scheduledOut} WIB</strong></p>
          </div>

          {/* Clock In / Out Action Buttons */}
          <div className="pt-2 space-y-2">
            {!hasClockIn ? (
              <button
                type="button"
                onClick={handleClockIn}
                disabled={gpsLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-500"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{gpsLoading ? 'Mendeteksi GPS...' : 'ABSEN MASUK SEKARANG'}</span>
              </button>
            ) : !hasClockOut ? (
              <button
                type="button"
                onClick={handleClockOut}
                disabled={gpsLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-500"
              >
                <Clock className="w-4 h-4" />
                <span>{gpsLoading ? 'Mendeteksi GPS...' : 'ABSEN PULANG SEKARANG'}</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-900/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold text-center">
                Presensi Hari Ini Lengkap &amp; Terverifikasi
              </div>
            )}
          </div>
        </div>

        {/* Right: Map & Status Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <GpsMapPreview
              centerLat={gpsConfig?.latitude ?? -6.36791}
              centerLng={gpsConfig?.longitude ?? 106.26853}
              radiusMeters={gpsConfig?.radiusMeters ?? 100}
              officeName={gpsConfig?.officeName ?? 'Kantor Kemenag Kab. Lebak'}
              userLat={userLat}
              userLng={userLng}
              distanceMeters={distanceMeters}
              heightClass="h-60"
            />
          </div>

          {/* History List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Riwayat Presensi Saya</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Jam Masuk</th>
                    <th className="p-2.5">Jam Pulang</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        Belum ada riwayat presensi.
                      </td>
                    </tr>
                  ) : (
                    myHistory.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-800 font-medium">{att.tanggal}</td>
                        <td className="p-2.5 font-mono text-emerald-800 font-bold">{att.jamMasuk}</td>
                        <td className="p-2.5 font-mono text-indigo-800 font-bold">{att.jamPulang}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
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
                        <td className="p-2.5 text-slate-600 max-w-xs truncate">{att.keterangan}</td>
                      </tr>
                    ))
                  )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};