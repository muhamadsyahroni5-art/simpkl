import React, { useState, useEffect } from 'react';
import {
  AppUser,
  Student,
  AttendanceRecord,
  DailyActivity,
  Assessment,
  RunningTextConfig,
  AutoLogoutConfig,
  GpsLocationConfig,
  UserRole
} from './types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS,
  INITIAL_RUNNING_TEXT,
  INITIAL_AUTO_LOGOUT,
  INITIAL_GPS_CONFIG,
} from './data/initialData';

// Components
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { RunningTextBar } from './components/RunningTextBar';
import { Footer } from './components/Footer';
import { PrintOfficialModal, DocumentType } from './components/PrintOfficialModal';
import { getJakartaDateString } from './utils/timeUtils';
import { WaMessageModal } from './components/WaMessageModal';
import { PhpExportModal } from './components/PhpExportModal';

// Views
import { LoginView } from './views/auth/LoginView';
import { StudentDashboardView } from './views/student/StudentDashboardView';
import { StudentProfileView } from './views/student/StudentProfileView';
import { StudentPasswordView } from './views/student/StudentPasswordView';
import { StudentAttendanceView } from './views/student/StudentAttendanceView';
import { StudentActivityView } from './views/student/StudentActivityView';
import { StudentReportView } from './views/student/StudentReportView';

import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminStudentsView } from './views/admin/AdminStudentsView';
import { AdminAttendanceView } from './views/admin/AdminAttendanceView';
import { AdminActivityView } from './views/admin/AdminActivityView';
import { AdminAssessmentView } from './views/admin/AdminAssessmentView';
import { AdminReportsView } from './views/admin/AdminReportsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

export default function App() {
  // Persistent or initial state
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('sim_pkl_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sim_pkl_students');
    const rawList: Student[] = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    const today = new Date().toISOString().split('T')[0];
    return rawList.map((s) => {
      if (s.status === 'Aktif' && s.tanggalSelesai && today >= s.tanggalSelesai) {
        return { ...s, status: 'Selesai' as const };
      }
      return s;
    });
  });

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sim_pkl_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [activityList, setActivityList] = useState<DailyActivity[]>(() => {
    const saved = localStorage.getItem('sim_pkl_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('sim_pkl_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [runningTextConfig, setRunningTextConfig] = useState<RunningTextConfig>(() => {
    const saved = localStorage.getItem('sim_pkl_running_text');
    return saved ? JSON.parse(saved) : INITIAL_RUNNING_TEXT;
  });

  const [autoLogoutConfig, setAutoLogoutConfig] = useState<AutoLogoutConfig>(() => {
    const saved = localStorage.getItem('simagang_auto_logout');
    return saved ? JSON.parse(saved) : INITIAL_AUTO_LOGOUT;
  });

  const [gpsConfig, setGpsConfig] = useState<GpsLocationConfig>(() => {
    const saved = localStorage.getItem('sim_pkl_gps_config');
    return saved ? JSON.parse(saved) : INITIAL_GPS_CONFIG;
  });

  // Current logged in user (Default to null so LoginView is displayed when not logged in)
  const [currentUser, setCurrentUser] = useState<
    AppUser | (Student & { role: 'siswa' }) | null
  >(() => {
    const saved = localStorage.getItem('sim_pkl_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Login screen presented by default
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [idleLogoutNotice, setIdleLogoutNotice] = useState<string | null>(null);

  // Modals state
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    type: DocumentType;
    student: Student | null;
    rekapFilter?: {
      status: string;
      month: string;
      year: string;
    };
  }>({
    isOpen: false,
    type: 'rekap_kehadiran_siswa',
    student: null,
  });

  const [waModalState, setWaModalState] = useState<{
    isOpen: boolean;
    record: AttendanceRecord | null;
    student: Student | null;
  }>({
    isOpen: false,
    record: null,
    student: null,
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sim_pkl_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_activities', JSON.stringify(activityList));
  }, [activityList]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_running_text', JSON.stringify(runningTextConfig));
  }, [runningTextConfig]);

  useEffect(() => {
    localStorage.setItem('simagang_auto_logout', JSON.stringify(autoLogoutConfig));
  }, [autoLogoutConfig]);

  useEffect(() => {
    localStorage.setItem('sim_pkl_gps_config', JSON.stringify(gpsConfig));
  }, [gpsConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sim_pkl_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sim_pkl_current_user');
    }
  }, [currentUser]);

  // Inactivity Auto Logout listener
  useEffect(() => {
    if (!currentUser || !autoLogoutConfig.isEnabled) return;

    let lastActivity = Date.now();
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      const maxIdleMs = autoLogoutConfig.timeoutMinutes * 60 * 1000;
      if (idleTime >= maxIdleMs) {
        localStorage.removeItem('sim_pkl_current_user');
        setCurrentUser(null);
        setIdleLogoutNotice(
          `Anda telah otomatis keluar dari SIMAGANG KEMENAG LEBAK karena tidak ada aktivitas selama ${autoLogoutConfig.timeoutMinutes} menit.`
        );
      }
    }, 2000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
      clearInterval(checkInterval);
    };
  }, [currentUser, autoLogoutConfig]);

  // Auth Handlers
  const handleLoginSuccess = (user: AppUser | (Student & { role: 'siswa' })) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setIdleLogoutNotice(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('sim_pkl_current_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIdleLogoutNotice(null);
  };

  // Instant user switcher for testing
  const handleSwitchUser = (userId: string) => {
    const userFound = users.find((u) => u.id === userId);
    if (userFound) {
      setCurrentUser(userFound);
      setActiveTab('dashboard');
      setIdleLogoutNotice(null);
      return;
    }
    const studentFound = students.find((s) => s.id === userId);
    if (studentFound) {
      setCurrentUser({ ...studentFound, role: 'siswa' });
      setActiveTab('dashboard');
      setIdleLogoutNotice(null);
    }
  };

  // Student CRUD
  const handleAddStudent = (newStd: Omit<Student, 'id'>) => {
    const today = new Date().toISOString().split('T')[0];
    const finalStatus =
      newStd.status === 'Aktif' && newStd.tanggalSelesai && today >= newStd.tanggalSelesai
        ? ('Selesai' as const)
        : newStd.status;
    const id = 'std-' + (Date.now() % 100000);
    const created: Student = { ...newStd, status: finalStatus, id };
    setStudents([created, ...students]);

    // Rule: Nilai default untuk penilaian pada saat tambah siswa magang yaitu 0
    const defaultAssessment: Assessment = {
      id: 'ass-' + id,
      studentId: id,
      studentNama: created.nama,
      nisn: created.nisn,
      seksi: created.tempatPenugasan,
      kedisiplinan: 0,
      inisiatif: 0,
      kerjasama: 0,
      tanggungJawab: 0,
      kebersihan: 0,
      namaBidangKeahlian: created.programKeahlian
        ? `Kompetensi Kejuruan ${created.programKeahlian}`
        : 'Kompetensi Kejuruan',
      nilaiBidangKeahlian: 0,
      nilaiRataRata: 0,
      grade: 'D',
      predikat: 'Kurang',
      catatan: '',
      tanggalPenilaian: today,
      penilaiNama: created.pembimbingKantor,
      penilaiNip: created.nipPembimbing,
    };
    setAssessments((prev) => [defaultAssessment, ...prev]);
  };

  const handleUpdateStudent = (updated: Student) => {
    const today = new Date().toISOString().split('T')[0];
    const finalStatus =
      updated.status === 'Aktif' && updated.tanggalSelesai && today >= updated.tanggalSelesai
        ? ('Selesai' as const)
        : updated.status;
    const finalStudent: Student = { ...updated, status: finalStatus };

    setStudents(students.map((s) => (s.id === finalStudent.id ? finalStudent : s)));
    // If current user is this student, sync profile
    if (currentUser && currentUser.role === 'siswa' && currentUser.id === finalStudent.id) {
      setCurrentUser({ ...finalStudent, role: 'siswa' });
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    setAssessments((prev) => prev.filter((a) => a.studentId !== id));
    setAttendanceList((prev) => prev.filter((a) => a.studentId !== id));
  };

  // Attendance CRUD
  const handleAddOrUpdateAttendance = (rec: Partial<AttendanceRecord>) => {
    const todayStr = getJakartaDateString();
    const targetDate = rec.tanggal || todayStr;
    const existingIndex = attendanceList.findIndex(
      (a) =>
        (a.studentId === rec.studentId || a.nisn === rec.nisn) &&
        a.tanggal === targetDate
    );

    if (existingIndex >= 0) {
      const updated = [...attendanceList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...rec,
      } as AttendanceRecord;
      setAttendanceList(updated);
    } else {
      const newRecord: AttendanceRecord = {
        id: 'att-' + Date.now(),
        studentId: rec.studentId || '',
        studentNama: rec.studentNama || '',
        nisn: rec.nisn || '',
        seksi: rec.seksi || 'Subbag TU - Pusdatin',
        tanggal: targetDate,
        jamMasuk: rec.jamMasuk || '07:30',
        jamPulang: rec.jamPulang || '-',
        status: rec.status || 'Hadir',
        keterangan: rec.keterangan || '',
        pembimbingSekolah: rec.pembimbingSekolah || '',
        noHpPembimbing: rec.noHpPembimbing || '',
      };
      setAttendanceList([newRecord, ...attendanceList]);
    }
  };

  // Activity CRUD
  const handleAddActivity = (act: Omit<DailyActivity, 'id'>) => {
    const newAct: DailyActivity = {
      ...act,
      id: 'act-' + Date.now(),
    };
    setActivityList([newAct, ...activityList]);
  };

  const handleUpdateActivity = (act: DailyActivity) => {
    setActivityList(activityList.map((a) => (a.id === act.id ? act : a)));
  };

  const handleDeleteActivity = (id: string) => {
    setActivityList(activityList.filter((a) => a.id !== id));
  };

  // Assessment CRUD
  const handleSaveAssessment = (ass: Assessment) => {
    const existingIndex = assessments.findIndex(
      (a) => a.studentId === ass.studentId || a.nisn === ass.nisn
    );
    if (existingIndex >= 0) {
      const updated = [...assessments];
      updated[existingIndex] = ass;
      setAssessments(updated);
    } else {
      setAssessments([ass, ...assessments]);
    }
  };

  // User CRUD
  const handleAddUser = (user: Omit<AppUser, 'id'>) => {
    const id = 'usr-' + (Date.now() % 100000);
    setUsers([...users, { ...user, id }]);
  };

  const handleUpdateUser = (user: AppUser) => {
    setUsers(users.map((u) => (u.id === user.id ? user : u)));
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  // Title translation
  const getPageTitle = () => {
    if (!currentUser) return 'Login SIMAGANG KEMENAG LEBAK';
    if (currentUser.role === 'siswa') {
      switch (activeTab) {
        case 'dashboard':
          return 'Dashboard Siswa';
        case 'siswa_profile':
          return 'Biodata & Profil Siswa';
        case 'siswa_absensi':
          return 'Presensi Kehadiran';
        case 'siswa_kegiatan':
          return 'Jurnal Kegiatan Harian';
        case 'siswa_laporan':
          return 'Laporan & Prestasi Siswa';
        case 'siswa_password':
          return 'Ubah Password Akun Siswa';
        default:
          return 'Dashboard Siswa';
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return 'Dashboard Analisis Performa';
        case 'admin_siswa':
          return 'Manajemen Data Siswa';
        case 'admin_absensi':
          return 'Manajemen Absensi & Kirim WA';
        case 'admin_kegiatan':
          return 'Laporan Kegiatan Siswa';
        case 'admin_penilaian':
          return 'Penilaian Siswa PKL';
        case 'admin_laporan':
          return 'Laporan & Cetak Dokumen Resmi';
        case 'admin_settings':
          return 'Pengaturan Sistem';
        default:
          return 'Dashboard Admin';
      }
    }
  };

  const isStudent = currentUser?.role === 'siswa';

  // Check if current student is completed or has already been assessed
  const currentStudentData = isStudent && currentUser
    ? students.find((s) => s.id === currentUser.id) || (currentUser as Student)
    : null;
  const currentStudentAssessment = currentStudentData
    ? assessments.find(
        (ass) => ass.studentId === currentStudentData.id || ass.nisn === currentStudentData.nisn
      )
    : null;

  // Student is considered finished if status is 'Selesai' OR already evaluated (nilaiRataRata > 0)
  const isStudentCompletedOrAssessed = Boolean(
    isStudent &&
      (currentStudentData?.status === 'Selesai' ||
        (currentStudentAssessment && currentStudentAssessment.nilaiRataRata > 0))
  );

  // Guard: if student has completed or has been evaluated, they can only access dashboard, laporan & nilai saya, and ubah password
  useEffect(() => {
    if (
      currentUser &&
      isStudentCompletedOrAssessed &&
      (activeTab === 'siswa_absensi' || activeTab === 'siswa_kegiatan' || activeTab === 'siswa_profile')
    ) {
      setActiveTab('dashboard');
    }
  }, [currentUser, isStudentCompletedOrAssessed, activeTab]);

  // If not logged in, render modern Login View
  if (!currentUser) {
    return (
      <>
        <LoginView
          allUsers={users}
          allStudents={students}
          onLoginSuccess={handleLoginSuccess}
          onOpenPhpExport={() => setIsPhpModalOpen(true)}
          idleLogoutNotice={idleLogoutNotice}
          onClearIdleNotice={() => setIdleLogoutNotice(null)}
        />
        <PhpExportModal
          isOpen={isPhpModalOpen}
          onClose={() => setIsPhpModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Running Text Marquee at the very top */}
      <RunningTextBar config={runningTextConfig} />

      {/* Main Workspace Layout with Sidebar on the Left */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Nav (Left) */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          onOpenPhpExport={() => setIsPhpModalOpen(true)}
          isCompletedStudent={isStudentCompletedOrAssessed}
        />

        {/* Content Viewport (offset by 288px on lg screens for fixed sidebar) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
          {/* Top Navbar */}
          <Navbar
            currentUser={currentUser}
            onToggleMobileSidebar={() => setIsOpenMobile(true)}
            onSwitchUser={handleSwitchUser}
            allUsers={users}
            allStudents={students}
            onLogout={handleLogout}
            activeTitle={getPageTitle()}
          />

          {/* Main Views Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {/* SISWA VIEWS */}
            {isStudent && (
              <>
                {activeTab === 'dashboard' && (
                  <StudentDashboardView
                    student={currentStudentData || (currentUser as Student)}
                    attendanceList={attendanceList}
                    activityList={activityList}
                    assessments={assessments}
                    onNavigateTab={setActiveTab}
                    isCompletedStudent={isStudentCompletedOrAssessed}
                    onQuickAttend={(status, ket) =>
                      handleAddOrUpdateAttendance({
                        studentId: currentUser.id,
                        studentNama: currentUser.nama,
                        nisn: (currentUser as Student).nisn,
                        seksi: (currentUser as Student).tempatPenugasan,
                        status,
                        keterangan: ket,
                        pembimbingSekolah: (currentUser as Student).pembimbingSekolah,
                        noHpPembimbing: (currentUser as Student).noHpPembimbing,
                      })
                    }
                  />
                )}

                {activeTab === 'siswa_profile' && (
                  <StudentProfileView
                    student={currentStudentData || (currentUser as Student)}
                    onUpdateStudent={handleUpdateStudent}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'siswa_password' && (
                  <StudentPasswordView
                    student={currentStudentData || (currentUser as Student)}
                    onUpdateStudent={handleUpdateStudent}
                  />
                )}

                {activeTab === 'siswa_absensi' && (
                  <StudentAttendanceView
                    student={currentStudentData || (currentUser as Student)}
                    attendanceList={attendanceList}
                    onAddOrUpdateAttendance={handleAddOrUpdateAttendance}
                    gpsConfig={gpsConfig}
                  />
                )}

                {activeTab === 'siswa_kegiatan' && (
                  <StudentActivityView
                    student={currentStudentData || (currentUser as Student)}
                    activityList={activityList}
                    onAddActivity={handleAddActivity}
                    onUpdateActivity={handleUpdateActivity}
                    onDeleteActivity={handleDeleteActivity}
                  />
                )}

                {activeTab === 'siswa_laporan' && (
                  <StudentReportView
                    student={currentStudentData || (currentUser as Student)}
                    attendanceList={attendanceList}
                    activityList={activityList}
                    assessments={assessments}
                    onOpenPrintModal={(type) =>
                      setPrintModalState({
                        isOpen: true,
                        type,
                        student: currentStudentData || (currentUser as Student),
                      })
                    }
                  />
                )}
              </>
            )}

            {/* ADMIN / PEGAWAI VIEWS */}
            {!isStudent && (
              <>
                {activeTab === 'dashboard' && (
                  <AdminDashboardView
                    currentUser={currentUser as AppUser}
                    students={students}
                    attendanceList={attendanceList}
                    activityList={activityList}
                    assessments={assessments}
                    onNavigateTab={setActiveTab}
                    onOpenWaModal={(record, student) =>
                      setWaModalState({
                        isOpen: true,
                        record,
                        student,
                      })
                    }
                  />
                )}

                {activeTab === 'admin_siswa' && (
                  <AdminStudentsView
                    currentUser={currentUser as AppUser}
                    students={students}
                    assessments={assessments}
                    allUsers={users}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}

                {activeTab === 'admin_absensi' && (
                  <AdminAttendanceView
                    currentUser={currentUser as AppUser}
                    students={students}
                    attendanceList={attendanceList}
                    onAddAttendance={handleAddOrUpdateAttendance}
                    onOpenWaModal={(record, student) =>
                      setWaModalState({
                        isOpen: true,
                        record,
                        student,
                      })
                    }
                  />
                )}

                {activeTab === 'admin_kegiatan' && (
                  <AdminActivityView
                    currentUser={currentUser as AppUser}
                    students={students}
                    activityList={activityList}
                    onUpdateActivity={handleUpdateActivity}
                    onOpenPrintModal={(type, student) =>
                      setPrintModalState({
                        isOpen: true,
                        type,
                        student: student || null,
                      })
                    }
                  />
                )}

                {activeTab === 'admin_penilaian' && (
                  <AdminAssessmentView
                    currentUser={currentUser as AppUser}
                    students={students}
                    assessments={assessments}
                    onSaveAssessment={handleSaveAssessment}
                    onUpdateStudent={handleUpdateStudent}
                    onOpenPrintModal={(type, student) =>
                      setPrintModalState({
                        isOpen: true,
                        type,
                        student: student || null,
                      })
                    }
                  />
                )}

                {activeTab === 'admin_laporan' && (
                  <AdminReportsView
                    currentUser={currentUser as AppUser}
                    students={students}
                    attendanceList={attendanceList}
                    assessments={assessments}
                    onOpenPrintModal={(type, student, rekapFilter) =>
                      setPrintModalState({
                        isOpen: true,
                        type,
                        student: student || null,
                        rekapFilter,
                      })
                    }
                  />
                )}

                {activeTab === 'admin_settings' && (
                  <AdminSettingsView
                    currentUser={currentUser as AppUser}
                    users={users}
                    runningTextConfig={runningTextConfig}
                    onUpdateRunningText={setRunningTextConfig}
                    autoLogoutConfig={autoLogoutConfig}
                    onUpdateAutoLogout={setAutoLogoutConfig}
                    gpsConfig={gpsConfig}
                    onUpdateGpsConfig={setGpsConfig}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
              </>
            )}
          </main>

          {/* Official Footer at the bottom of every page */}
          <Footer />
        </div>
      </div>

      {/* Official Print Modal (With Kop Surat and Official Layout) */}
      <PrintOfficialModal
        isOpen={printModalState.isOpen}
        onClose={() => setPrintModalState({ ...printModalState, isOpen: false })}
        documentType={printModalState.type}
        selectedStudent={printModalState.student}
        rekapFilter={printModalState.rekapFilter}
        allStudents={students}
        allAttendance={attendanceList}
        allAssessments={assessments}
        allActivities={activityList}
        isStudent={isStudent}
        userRole={currentUser?.role}
      />

      {/* WhatsApp Message Modal */}
      <WaMessageModal
        isOpen={waModalState.isOpen}
        onClose={() => setWaModalState({ ...waModalState, isOpen: false })}
        record={waModalState.record}
        student={waModalState.student}
      />

      {/* PHP & MySQL Source Code Package Modal for Laragon & XAMPP */}
      <PhpExportModal
        isOpen={isPhpModalOpen}
        onClose={() => setIsPhpModalOpen(false)}
      />
    </div>
  );
}