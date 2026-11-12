export type UserRole = 'super_admin' | 'admin' | 'admin_seksi' | 'opr_pembimbing' | 'siswa';

export const SUBBAG_SEKSI_OPTIONS = [
  'Subbag TU - PTSP',
  'Subbag TU - Umum dan Kerumahtanggaan',
  'Subbag TU - Keuangan dan BMN',
  'Subbag TU - SDM/Kepegawaian',
  'Subbag TU - Pusdatin',
  'Subbag TU - Perencanaan',
  'Subbag TU - Kehumasan',
  'Subbag TU - Arsiparis',
  'Seksi Bimas Islam',
  'Penyelenggaraan Zakat dan Wakaf',
  'Seksi Pendidikan Madrasah',
  'Seksi Pendidikan Agama Islam',
  'Seksi Pendidikan Diniyah dan Pondok Pesantren'
] as const;

export type SubbagSeksiType = typeof SUBBAG_SEKSI_OPTIONS[number];

export interface AppUser {
  id: string;
  nama: string;
  nip: string;
  username: string;
  password?: string;
  jabatan: string;
  seksi: SubbagSeksiType | 'Semua Subbag / Seksi';
  role: UserRole;
  noHp: string;
  email?: string;
}

export type StudentStatus = 'Aktif' | 'Selesai' | 'Berhenti/Pindah';

export interface Student {
  id: string;
  photo: string;
  username: string;
  password?: string;
  nama: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  kelas: string;
  programKeahlian: string;
  noHp: string;
  asalSekolah: string;
  pembimbingSekolah: string;
  noHpPembimbing: string;
  alamat: string;
  tempatPenugasan: SubbagSeksiType;
  pembimbingKantor: string;
  nipPembimbing: string;
  status: StudentStatus;
  tahun: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentNama: string;
  nisn: string;
  seksi: SubbagSeksiType;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string;
  jamPulang: string;
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin';
  keterangan: string;
  pembimbingSekolah: string;
  noHpPembimbing: string;
}

export interface DailyActivity {
  id: string;
  studentId: string;
  studentNama: string;
  nisn: string;
  seksi: SubbagSeksiType;
  tanggal: string; // YYYY-MM-DD
  uraianKegiatan: string;
  jamMulai: string;
  jamSelesai: string;
  outputKegiatan: string;
  kendala: string;
  statusVerifikasi: 'Disetujui' | 'Menunggu' | 'Perlu Revisi';
  catatanPembimbing?: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  studentNama: string;
  nisn: string;
  seksi: SubbagSeksiType;
  kedisiplinan: number;
  inisiatif: number;
  kerjasama: number;
  tanggungJawab: number;
  kebersihan: number;
  namaBidangKeahlian: string;
  nilaiBidangKeahlian: number;
  nilaiRataRata: number;
  grade: 'A' | 'B' | 'C' | 'D';
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatan: string;
  tanggalPenilaian: string;
  penilaiNama: string;
  penilaiNip: string;
}

export interface RunningTextConfig {
  text: string;
  speedSeconds: number;
  theme: 'emerald' | 'dark' | 'gold';
  isEnabled: boolean;
}

export interface AutoLogoutConfig {
  isEnabled: boolean;
  timeoutMinutes: number; // e.g. 5, 10, 15, 30, 60
}

export interface GpsLocationConfig {
  isEnabled: boolean;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  officeName: string;
  officeAddress: string;
}

export interface SupervisorOption {
  nama: string;
  nip: string;
  jabatan: string;
}

export const SUPERVISOR_PRESETS: Record<SubbagSeksiType, SupervisorOption[]> = {
  'Subbag TU - PTSP': [
    { nama: 'Hj. Sudirah, S.Sos., M.M.', nip: '197902182006042005', jabatan: 'Koordinator PTSP & Subbag TU' },
    { nama: 'M. Ilyas, S.Pd.I.', nip: '198703122014031002', jabatan: 'Petugas Front Office PTSP' },
  ],
  'Subbag TU - Umum dan Kerumahtanggaan': [
    { nama: 'Ahmad Baihaqi, S.Sos.', nip: '198205102008011015', jabatan: 'Pengelola Urusan Rumah Tangga' },
    { nama: 'H. Tb. Syarifudin, S.Ag.', nip: '197609142005011003', jabatan: 'Pranata Sarana & Prasarana' },
  ],
  'Subbag TU - Keuangan dan BMN': [
    { nama: 'Siti Rahmawati, S.E.', nip: '198503142010012008', jabatan: 'Bendahara Pengeluaran' },
    { nama: 'H. Sudirman, S.Ag., M.Si.', nip: '197405122000031002', jabatan: 'Kepala Subbag Tata Usaha' },
  ],
  'Subbag TU - SDM/Kepegawaian': [
    { nama: 'H. Mulyadi, S.Pd.I., M.Pd.', nip: '197808202006041007', jabatan: 'Analis Kepegawaian Ahli Muda' },
    { nama: 'Yuli Astuti, S.E.', nip: '198907152015032004', jabatan: 'Pengelola Data Kepegawaian' },
  ],
  'Subbag TU - Pusdatin': [
    { nama: 'Dian Permana, S.Kom.', nip: '199104192019031006', jabatan: 'Pranata Komputer Ahli Muda' },
    { nama: 'Rizki Fauzi, S.Kom.', nip: '199312052020121008', jabatan: 'Pengelola TI & Jaringan' },
  ],
  'Subbag TU - Perencanaan': [
    { nama: 'H. Ependi, S.Ag., M.M.', nip: '197604182003121002', jabatan: 'Perencana Ahli Muda' },
    { nama: 'Fajar Nugraha, S.E.', nip: '198811232014021003', jabatan: 'Penyusun Rencana Program' },
  ],
  'Subbag TU - Kehumasan': [
    { nama: 'Dra. Hj. Nunung Nurjanah', nip: '197103251996032001', jabatan: 'Pranata Humas Ahli Muda' },
    { nama: 'Aris Munandar, S.I.Kom.', nip: '199008122019021004', jabatan: 'Pengelola Media Publikasi' },
  ],
  'Subbag TU - Arsiparis': [
    { nama: 'Hj. Imas Masitoh, S.Pd.I.', nip: '198006122007012011', jabatan: 'Arsiparis Ahli Pertama' },
    { nama: 'Suhendar, A.Md.', nip: '198601052011011009', jabatan: 'Pengelola Kearsipan' },
  ],
  'Seksi Bimas Islam': [
    { nama: 'DEDEN FIRDAUS, S.AG', nip: '197811202005011004', jabatan: 'Pembimbing Seksi Bimas Islam' },
    { nama: 'Drs. H. Mumu Murtadlo', nip: '197311051998031001', jabatan: 'Kasi Bimas Islam' },
  ],
  'Penyelenggaraan Zakat dan Wakaf': [
    { nama: 'H. Babay Suhaemi, S.Ag., M.Si.', nip: '197509122002121001', jabatan: 'Penyelenggara Zakat & Wakaf' },
    { nama: 'Iwan Ridwan, S.E.', nip: '198402172009011005', jabatan: 'Pengelola Pemberdayaan Wakaf' },
  ],
  'Seksi Pendidikan Madrasah': [
    { nama: 'Asep Saepullah, S.Pd.I.', nip: '198406202009121004', jabatan: 'Pengelola Program Pembinaan Madrasah' },
    { nama: 'H. Slamet, S.Pd.I., M.Pd.', nip: '197703152003121003', jabatan: 'Kasi Pendidikan Madrasah' },
  ],
  'Seksi Pendidikan Agama Islam': [
    { nama: 'Hj. Anis Fuadah, S.Ag., M.Pd.I.', nip: '197410082000032002', jabatan: 'Kasi Pendidikan Agama Islam' },
    { nama: 'Nanang Kosasih, S.Pd.I.', nip: '198305212008011006', jabatan: 'Pengawas PAI' },
  ],
  'Seksi Pendidikan Diniyah dan Pondok Pesantren': [
    { nama: 'H. Sudrajat, S.Ag., M.Si.', nip: '197607192005011005', jabatan: 'Kasi PD Pontren' },
    { nama: 'Tb. Mahpudin, S.Pd.I.', nip: '198110092007101002', jabatan: 'Pengelola Data Kelembagaan Pontren' },
  ],
};

