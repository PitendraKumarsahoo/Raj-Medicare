import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import {
  Doctor,
  DoctorSchedule,
  AppointmentSlot,
  Appointment,
  Medicine,
  MedicineRequest,
  StoreSettings,
  AuditLog,
  PatientReview,
} from '../types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  Truck,
  Settings,
  Shield,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  LogOut,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  FileText,
  UserCheck,
  Star,
  X,
} from 'lucide-react';
import {
  getTodayISTDateString,
  getCurrentISTTimeString,
  formatScheduleDateLabel,
  formatFullDate,
  formatTime12Hour,
  computeEffectiveScheduleStatus,
} from '../utils/time';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const {
    settings,
    doctors,
    schedules,
    medicines,
    isAdmin,
    adminUser,
    adminLogout,
    updateSettings,
    refreshData,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'day_view'
    | 'check_in'
    | 'doctors'
    | 'schedules'
    | 'appointments'
    | 'medicines'
    | 'requests'
    | 'reviews'
    | 'settings'
    | 'audit_logs'
  >('overview');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminReviews, setAdminReviews] = useState<PatientReview[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Today in IST
  const todayStr = getTodayISTDateString();
  const currentISTTime = getCurrentISTTimeString();

  // Load all admin records
  const loadAdminRecords = async () => {
    setLoadingData(true);
    try {
      const [allApts, allReqs, allLogs, allRevs] = await Promise.all([
        storeService.getAllAppointments(),
        storeService.getAllMedicineRequests(),
        storeService.getAuditLogs(),
        storeService.getAllReviews(),
      ]);
      setAppointments(allApts);
      setRequests(allReqs);
      setAuditLogs(allLogs);
      setAdminReviews(allRevs);
    } catch (err: any) {
      showToast(err.message || 'Error loading records', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAdminRecords();
  }, []);

  // Quick Stats
  const todaysAppointments = appointments.filter((a) => a.date === todayStr);
  const todaysSchedules = schedules.filter((s) => s.date === todayStr);
  const totalSlotsToday = todaysSchedules.reduce((sum, s) => sum + s.maxPatients, 0);
  const bookedSlotsToday = todaysSchedules.reduce((sum, s) => sum + s.bookedCount, 0);
  const pendingMedicineRequests = requests.filter(
    (r) => r.status === 'new_request' || r.status === 'prescription_review'
  );

  // --------------------------------------------------------------------------
  // DOCTOR MODAL (Add / Edit)
  // --------------------------------------------------------------------------
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor> | null>(null);

  const handleOpenDoctorModal = (docToEdit?: Doctor) => {
    if (docToEdit) {
      setEditingDoctor(docToEdit);
    } else {
      setEditingDoctor({
        name: 'Dr. ',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experienceYears: 10,
        consultationFee: 500,
        gender: 'male',
        bio: '',
        areasOfConsultation: '',
        phone: settings.phone,
        status: 'active',
        displayOrder: doctors.length + 1,
        photoUrl:
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      });
    }
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor?.name || !editingDoctor?.specialization) {
      showToast('Doctor name and specialization are required', 'error');
      return;
    }

    try {
      await storeService.saveDoctor({
        ...(editingDoctor as any),
        name: editingDoctor.name.trim(),
        consultationFee: Number(editingDoctor.consultationFee || 500),
        experienceYears: Number(editingDoctor.experienceYears || 5),
        displayOrder: Number(editingDoctor.displayOrder || 1),
      });
      await refreshData();
      setShowDoctorModal(false);
      setEditingDoctor(null);
      showToast('Doctor profile saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save doctor', 'error');
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await storeService.deleteDoctor(id);
        await refreshData();
        showToast('Doctor deleted', 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete', 'error');
      }
    }
  };

  // --------------------------------------------------------------------------
  // SCHEDULE CREATION MODAL (Simple, Auto Slots)
  // --------------------------------------------------------------------------
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDoctorId, setScheduleDoctorId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(todayStr);
  const [scheduleStartTime, setScheduleStartTime] = useState('17:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('20:00');
  const [scheduleSlotDuration, setScheduleSlotDuration] = useState(15);
  const [scheduleMaxPatients, setScheduleMaxPatients] = useState(12);
  const [scheduleFee, setScheduleFee] = useState(500);
  const [scheduleNotes, setScheduleNotes] = useState('');

  const handleOpenScheduleModal = (docId?: string) => {
    const dId = docId || doctors[0]?.id || '';
    setScheduleDoctorId(dId);
    const selectedDoc = doctors.find((d) => d.id === dId);
    if (selectedDoc) setScheduleFee(selectedDoc.consultationFee);
    setShowScheduleModal(true);
  };

  const handlePublishSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDoctorId) {
      showToast('Please select a doctor', 'error');
      return;
    }
    if (scheduleStartTime >= scheduleEndTime) {
      showToast('End time must be later than start time', 'error');
      return;
    }

    try {
      await storeService.createSchedule({
        doctorId: scheduleDoctorId,
        date: scheduleDate,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        slotDurationMinutes: Number(scheduleSlotDuration),
        maxPatients: Number(scheduleMaxPatients),
        consultationFee: Number(scheduleFee),
        notes: scheduleNotes,
      });
      await refreshData();
      setShowScheduleModal(false);
      showToast('Doctor schedule published immediately!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish schedule', 'error');
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (window.confirm('Cancel this visiting schedule? Public booking will be closed.')) {
      try {
        await storeService.updateScheduleStatus(id, 'cancelled');
        await refreshData();
        showToast('Schedule cancelled', 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to update schedule', 'error');
      }
    }
  };

  // --------------------------------------------------------------------------
  // RECEPTION CHECK-IN TOOL
  // --------------------------------------------------------------------------
  const [checkInQuery, setCheckInQuery] = useState('');
  const [checkInResult, setCheckInResult] = useState<Appointment | null>(null);

  const handleCheckInSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = checkInQuery.trim().toUpperCase();
    if (!q) return;

    // Search by appointmentNumber or phone
    const found = appointments.find(
      (a) =>
        a.appointmentNumber.toUpperCase() === q ||
        a.patientPhone.replace(/\D/g, '') === q.replace(/\D/g, '')
    );

    if (found) {
      setCheckInResult(found);
      showToast('Appointment found for check-in', 'success');
    } else {
      setCheckInResult(null);
      showToast('No matching appointment found', 'error');
    }
  };

  const handlePerformCheckIn = async (appointmentId: string) => {
    try {
      await storeService.updateAppointmentStatus(appointmentId, 'checked_in');
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'checked_in' } : a))
      );
      if (checkInResult?.id === appointmentId) {
        setCheckInResult({ ...checkInResult, status: 'checked_in' });
      }
      showToast('Patient marked Checked In! Sent to doctor chamber queue.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // MEDICINE MODAL (Add / Edit)
  // --------------------------------------------------------------------------
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Partial<Medicine> | null>(null);

  const handleOpenMedicineModal = (medToEdit?: Medicine) => {
    if (medToEdit) {
      setEditingMedicine(medToEdit);
    } else {
      setEditingMedicine({
        name: '',
        brand: '',
        genericName: '',
        category: 'Fever & Pain',
        description: '',
        packSize: '10 Tablets / Strip',
        price: 50,
        discount: 0,
        imageUrl:
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        isAvailable: true,
        prescriptionRequired: false,
        stockStatus: 'in_stock',
        featured: false,
      });
    }
    setShowMedModal(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine?.name || !editingMedicine?.brand) {
      showToast('Medicine name and brand are required', 'error');
      return;
    }

    try {
      await storeService.saveMedicine({
        ...(editingMedicine as any),
        price: Number(editingMedicine.price || 0),
        discount: Number(editingMedicine.discount || 0),
      });
      await refreshData();
      setShowMedModal(false);
      setEditingMedicine(null);
      showToast('Medicine catalog item saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save medicine', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // SETTINGS FORM
  // --------------------------------------------------------------------------
  const [editSettingsState, setEditSettingsState] = useState<StoreSettings>(settings);

  useEffect(() => {
    setEditSettingsState(settings);
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(editSettingsState);
      showToast('Store contact and website settings updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  // Filter appointments tab
  const [aptDateFilter, setAptDateFilter] = useState('all');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');
  const [aptSearch, setAptSearch] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    if (aptDateFilter === 'today' && apt.date !== todayStr) return false;
    if (aptStatusFilter !== 'all' && apt.status !== aptStatusFilter) return false;
    if (aptSearch.trim()) {
      const q = aptSearch.toLowerCase();
      const match =
        apt.appointmentNumber.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q) ||
        apt.doctorName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black text-sm">
            RM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                Raj Medicare Admin
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-900 text-teal-300 border border-teal-700">
                Talcher Clinic
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Logged in as {adminUser?.displayName || adminUser?.email || 'Administrator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Website</span>
          </button>

          <button
            onClick={adminLogout}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar Navigation */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
            Clinic Operations
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-600" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('day_view')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'day_view'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Today's Live Day View</span>
            {todaysSchedules.length > 0 && (
              <span className="ml-auto text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                {todaysSchedules.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('check_in')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'check_in'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Reception Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'appointments'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>All Appointments</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
              {appointments.length}
            </span>
          </button>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 pt-3 mb-1">
            Doctor & Schedule Setup
          </div>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'doctors'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Visiting Doctors</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
              {doctors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'schedules'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Doctor Schedules</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
              {schedules.length}
            </span>
          </button>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 pt-3 mb-1">
            Pharmacy & Delivery
          </div>

          <button
            onClick={() => setActiveTab('medicines')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'medicines'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Medicine Inventory</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
              {medicines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'requests'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4 text-teal-600" />
            <span>Delivery Enquiries</span>
            {pendingMedicineRequests.length > 0 && (
              <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                {pendingMedicineRequests.length} new
              </span>
            )}
          </button>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 pt-3 mb-1">
            Configuration & Community
          </div>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'reviews'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Patient Reviews</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
              {adminReviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-teal-600" />
            <span>Website & Contact</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'audit_logs'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Audit Logs</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Quick Actions Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Today's Clinic Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    IST Time: <strong>{currentISTTime}</strong> • {formatFullDate(todayStr)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenDoctorModal()}
                    className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Doctor</span>
                  </button>

                  <button
                    onClick={() => handleOpenScheduleModal()}
                    className="py-2 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Publish Schedule</span>
                  </button>

                  <button
                    onClick={() => handleOpenMedicineModal()}
                    className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <Pill className="w-4 h-4" />
                    <span>Add Medicine</span>
                  </button>

                  <button
                    onClick={() => loadAdminRecords()}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Today's Appointments
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {todaysAppointments.length}
                    </span>
                    <span className="text-xs text-teal-700 font-medium">Scheduled</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Visiting Doctors Today
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {todaysSchedules.length}
                    </span>
                    <span className="text-xs text-slate-500">Active Clinics</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Capacity Occupancy
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-teal-700">
                      {bookedSlotsToday} / {totalSlotsToday}
                    </span>
                    <span className="text-xs text-slate-500">Slots Booked</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Pending Medicine Orders
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-extrabold text-amber-700">
                      {pendingMedicineRequests.length}
                    </span>
                    <span className="text-xs text-slate-500">To Review</span>
                  </div>
                </div>
              </div>

              {/* Today's Doctors & Day View Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Today's Visiting Doctors & Active Clinics
                  </h3>
                  <button
                    onClick={() => setActiveTab('day_view')}
                    className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>Open Detailed Day View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {todaysSchedules.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {todaysSchedules.map((sch) => {
                      const statusInfo = computeEffectiveScheduleStatus(
                        sch.status,
                        sch.date,
                        sch.startTime,
                        sch.endTime,
                        sch.bookedCount,
                        sch.maxPatients
                      );

                      return (
                        <div
                          key={sch.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                sch.doctorPhotoUrl ||
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                              }
                              alt={sch.doctorName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">
                                {sch.doctorName}
                              </span>
                              <span className="text-slate-500">{sch.doctorSpecialization}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-slate-500 block text-[11px]">Visiting Time</span>
                              <span className="font-semibold text-slate-800">
                                {formatTime12Hour(sch.startTime)} to {formatTime12Hour(sch.endTime)}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-500 block text-[11px]">Booked / Max</span>
                              <span className="font-bold text-teal-700">
                                {sch.bookedCount} / {sch.maxPatients}
                              </span>
                            </div>

                            <div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.badgeClass}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    No visiting doctors scheduled for today. Click "Publish Schedule" to add one.
                  </div>
                )}
              </div>

              {/* Today's Appointments Table Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Today's Patient Appointments ({todaysAppointments.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    View All Appointments
                  </button>
                </div>

                {todaysAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Time</th>
                          <th className="p-2.5">Patient</th>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">Doctor</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {todaysAppointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-teal-800">
                              {apt.appointmentNumber}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-900">
                              {formatTime12Hour(apt.time)}
                            </td>
                            <td className="p-2.5 font-semibold">{apt.patientName}</td>
                            <td className="p-2.5">{apt.patientPhone}</td>
                            <td className="p-2.5">{apt.doctorName}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  apt.status === 'checked_in'
                                    ? 'bg-teal-100 text-teal-800'
                                    : apt.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>
                            <td className="p-2.5">
                              {apt.status === 'confirmed' && (
                                <button
                                  onClick={() => handlePerformCheckIn(apt.id)}
                                  className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px]"
                                >
                                  Check In
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    No appointments booked yet for today.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TODAY'S DAY VIEW (Live slot-by-slot tracker) */}
          {activeTab === 'day_view' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Today's Doctor Visiting Timetable (Day View)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live reception schedule for {formatFullDate(todayStr)}. Track arriving patients,
                  check-ins, and free consultation slots.
                </p>
              </div>

              {todaysSchedules.length > 0 ? (
                <div className="space-y-6">
                  {todaysSchedules.map((sch) => {
                    const schAppointments = appointments.filter((a) => a.scheduleId === sch.id);

                    return (
                      <div
                        key={sch.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                sch.doctorPhotoUrl ||
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                              }
                              alt={sch.doctorName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base">
                                {sch.doctorName}
                              </h3>
                              <p className="text-xs text-teal-700 font-semibold">
                                {sch.doctorSpecialization} • Visiting:{' '}
                                {formatTime12Hour(sch.startTime)} to {formatTime12Hour(sch.endTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {sch.bookedCount} / {sch.maxPatients} Patients
                            </span>
                          </div>
                        </div>

                        {/* Appointments list for this doctor */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Booked Patient Queue
                          </span>

                          {schAppointments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {schAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900">
                                      {formatTime12Hour(apt.time)}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                        apt.status === 'checked_in'
                                          ? 'bg-teal-100 text-teal-800'
                                          : apt.status === 'completed'
                                          ? 'bg-slate-200 text-slate-700'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {apt.status}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="font-semibold text-slate-900 block truncate">
                                      {apt.patientName} ({apt.patientAge}y)
                                    </span>
                                    <span className="text-slate-500 text-[11px]">
                                      {apt.patientPhone}
                                    </span>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 flex gap-1.5">
                                    {apt.status === 'confirmed' && (
                                      <button
                                        onClick={() => handlePerformCheckIn(apt.id)}
                                        className="flex-1 py-1 rounded bg-teal-600 text-white font-semibold text-[11px]"
                                      >
                                        Check In
                                      </button>
                                    )}
                                    {apt.status === 'checked_in' && (
                                      <button
                                        onClick={async () => {
                                          await storeService.updateAppointmentStatus(
                                            apt.id,
                                            'completed'
                                          );
                                          loadAdminRecords();
                                          showToast('Marked completed', 'success');
                                        }}
                                        className="flex-1 py-1 rounded bg-slate-800 text-white font-semibold text-[11px]"
                                      >
                                        Done
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">
                              No online bookings yet for this doctor schedule.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p>No doctor visiting schedules active for today ({todayStr}).</p>
                  <button
                    onClick={() => handleOpenScheduleModal()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-xs"
                  >
                    Publish Today's Schedule
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECEPTION CHECK-IN TOOL */}
          {activeTab === 'check_in' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Reception Check-In Terminal</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter patient Appointment ID (from ticket/SMS) or mobile number to quickly check in
                  arriving patients.
                </p>
              </div>

              <form
                onSubmit={handleCheckInSearch}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scan / Enter Appointment ID or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={checkInQuery}
                      onChange={(e) => setCheckInQuery(e.target.value)}
                      placeholder="e.g. RM-20261012-123 or 94371XXXXX"
                      className="w-full text-sm pl-4 pr-24 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Find
                    </button>
                  </div>
                </div>
              </form>

              {checkInResult && (
                <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md space-y-5 animate-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase">
                        Patient Verified
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">
                        {checkInResult.patientName} ({checkInResult.patientAge} yrs,{' '}
                        {checkInResult.patientGender})
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold ${
                        checkInResult.status === 'checked_in'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {checkInResult.status === 'checked_in' ? 'Already Checked In' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Appointment ID:</span>
                      <span className="font-mono font-bold text-teal-800">
                        {checkInResult.appointmentNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Doctor:</span>
                      <span className="font-bold text-slate-900">
                        {checkInResult.doctorName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Date & Time:</span>
                      <span className="font-bold text-slate-800">
                        {checkInResult.date} at {formatTime12Hour(checkInResult.time)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Phone:</span>
                      <span className="font-semibold text-slate-800">
                        {checkInResult.patientPhone}
                      </span>
                    </div>
                  </div>

                  {checkInResult.status === 'confirmed' ? (
                    <button
                      onClick={() => handlePerformCheckIn(checkInResult.id)}
                      className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Check-In (Send to Doctor Queue)</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium text-center">
                      Patient is currently marked Checked In at Raj Medicare.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ALL APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Appointments Management</h2>
                  <p className="text-xs text-slate-500">
                    Total: {appointments.length} appointments booked
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={aptSearch}
                      onChange={(e) => setAptSearch(e.target.value)}
                      placeholder="Search patient, phone, ID..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <select
                    value={aptDateFilter}
                    onChange={(e) => setAptDateFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today Only</option>
                  </select>

                  <select
                    value={aptStatusFilter}
                    onChange={(e) => setAptStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <span className="text-slate-400 text-[11px]">
                  Showing {filteredAppointments.length} records
                </span>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Patient</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Doctor</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-teal-800">
                            {apt.appointmentNumber}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">
                            {apt.patientName} ({apt.patientAge}y)
                          </td>
                          <td className="p-3">{apt.patientPhone}</td>
                          <td className="p-3">{apt.doctorName}</td>
                          <td className="p-3">
                            {apt.date} • {formatTime12Hour(apt.time)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                apt.status === 'checked_in'
                                  ? 'bg-teal-100 text-teal-800'
                                  : apt.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {apt.status === 'confirmed' && (
                                <button
                                  onClick={() => handlePerformCheckIn(apt.id)}
                                  className="px-2 py-1 rounded bg-teal-600 text-white font-semibold text-[10px]"
                                >
                                  Check In
                                </button>
                              )}
                              {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Cancel this appointment?')) {
                                      await storeService.updateAppointmentStatus(
                                        apt.id,
                                        'cancelled',
                                        'Cancelled by Admin'
                                      );
                                      loadAdminRecords();
                                      showToast('Appointment cancelled', 'info');
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px]"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Visiting Doctors Directory</h2>
                  <p className="text-xs text-slate-500">
                    Manage consultant profiles, qualifications, and consultation fees.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenDoctorModal()}
                  className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Doctor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            doc.photoUrl ||
                            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={doc.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {doc.name}
                          </h4>
                          <span className="text-xs font-semibold text-teal-700 block">
                            {doc.specialization}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {doc.qualification}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">Fee: ₹{doc.consultationFee}</span>
                        <span className="text-slate-500">{doc.experienceYears} Years Exp</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleOpenScheduleModal(doc.id)}
                        className="text-teal-700 hover:underline font-semibold"
                      >
                        + Add Schedule
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenDoctorModal(doc)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Doctor Visiting Schedules</h2>
                  <p className="text-xs text-slate-500">
                    Schedules automatically generate 15-minute consultation slots. Once the end time
                    passes, they automatically complete and disappear from public view.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenScheduleModal()}
                  className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Schedule</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Doctor</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Visiting Hours</th>
                        <th className="p-3">Slot Duration</th>
                        <th className="p-3">Booked / Max</th>
                        <th className="p-3">Calculated Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {schedules.map((sch) => {
                        const statusInfo = computeEffectiveScheduleStatus(
                          sch.status,
                          sch.date,
                          sch.startTime,
                          sch.endTime,
                          sch.bookedCount,
                          sch.maxPatients
                        );

                        return (
                          <tr key={sch.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">
                                {sch.doctorName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {sch.doctorSpecialization}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {sch.date} ({formatScheduleDateLabel(sch.date)})
                            </td>
                            <td className="p-3">
                              {formatTime12Hour(sch.startTime)} to {formatTime12Hour(sch.endTime)}
                            </td>
                            <td className="p-3">{sch.slotDurationMinutes} mins</td>
                            <td className="p-3 font-bold text-teal-700">
                              {sch.bookedCount} / {sch.maxPatients}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusInfo.badgeClass}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="p-3">
                              {sch.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelSchedule(sch.id)}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px]"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MEDICINES */}
          {activeTab === 'medicines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pharmacy Medicine Catalog</h2>
                  <p className="text-xs text-slate-500">
                    Manage stock, prices, prescription badges, and pack sizes.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenMedicineModal()}
                  className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Pack Size</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Prescription</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {medicines.map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{med.name}</span>
                            <span className="text-[11px] text-teal-800">{med.brand}</span>
                          </td>
                          <td className="p-3">{med.category}</td>
                          <td className="p-3">{med.packSize}</td>
                          <td className="p-3 font-extrabold text-slate-900">₹{med.price}</td>
                          <td className="p-3">
                            {med.prescriptionRequired ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Rx Required
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {med.stockStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenMedicineModal(med)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete ${med.name}?`)) {
                                    await storeService.deleteMedicine(med.id);
                                    await refreshData();
                                    showToast('Medicine deleted', 'info');
                                  }
                                }}
                                className="p-1 text-rose-600 hover:text-rose-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DELIVERY ENQUIRIES */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Local Medicine Delivery Enquiries ({requests.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Review customer orders, check attached prescriptions, and manage delivery status.
                </p>
              </div>

              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="font-mono font-bold text-teal-800 text-sm">
                            {req.requestNumber}
                          </span>
                          <span className="text-slate-400 text-[11px] block">
                            Customer: <strong>{req.customerName}</strong> • Phone:{' '}
                            <strong>{req.customerPhone}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <select
                            value={req.status}
                            onChange={async (e) => {
                              await storeService.updateMedicineRequestStatus(
                                req.id,
                                e.target.value as any
                              );
                              loadAdminRecords();
                              showToast('Order status updated', 'success');
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold text-xs"
                          >
                            <option value="new_request">New Request</option>
                            <option value="prescription_review">Prescription Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                            Ordered Medicines
                          </span>
                          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {req.items.map((i, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {i.medicineName} ({i.packSize}) × {i.quantity}
                                </span>
                                <span className="font-semibold">₹{i.price * i.quantity}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                              <span>Estimated Total:</span>
                              <span>₹{req.estimatedTotal}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                              Delivery Location in Talcher
                            </span>
                            <p className="text-slate-800 font-medium mt-0.5">
                              {req.deliveryAddress}
                            </p>
                            {req.landmark && (
                              <p className="text-slate-500 text-[11px]">
                                Landmark: {req.landmark} • Pincode: {req.pincode}
                              </p>
                            )}
                          </div>

                          {req.prescriptionUrl && (
                            <div className="pt-1">
                              <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                                Attached Doctor Prescription
                              </span>
                              <a
                                href={req.prescriptionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-teal-700 font-semibold hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View Prescription Document</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No medicine delivery requests received yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Website Content & Contact Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update business phone, WhatsApp number, address, opening hours, and emergency
                  disclaimer. Changes update immediately across the live site.
                </p>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.businessName}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, businessName: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={editSettingsState.tagline}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, tagline: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Store Contact Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.phone}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, phone: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      WhatsApp Number (for direct chat) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.whatsappNumber}
                      onChange={(e) =>
                        setEditSettingsState({
                          ...editSettingsState,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Store Physical Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.address}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, address: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Google Maps Destination URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.googleMapsUrl}
                      onChange={(e) =>
                        setEditSettingsState({
                          ...editSettingsState,
                          googleMapsUrl: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Opening Hours *</label>
                    <input
                      type="text"
                      required
                      value={editSettingsState.openingHours}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, openingHours: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Local Delivery Areas
                    </label>
                    <input
                      type="text"
                      value={editSettingsState.deliveryAreas}
                      onChange={(e) =>
                        setEditSettingsState({
                          ...editSettingsState,
                          deliveryAreas: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">About Text</label>
                    <textarea
                      rows={3}
                      value={editSettingsState.aboutText}
                      onChange={(e) =>
                        setEditSettingsState({ ...editSettingsState, aboutText: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Emergency Disclaimer Notice
                    </label>
                    <textarea
                      rows={2}
                      value={editSettingsState.emergencyDisclaimer}
                      onChange={(e) =>
                        setEditSettingsState({
                          ...editSettingsState,
                          emergencyDisclaimer: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Custom Domain Settings Card */}
                  <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-teal-600" />
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Custom Domain Configuration
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                        Active & Ready
                      </span>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Primary Custom Domain
                      </label>
                      <input
                        type="text"
                        value={editSettingsState.customDomain || 'rajmedicare.in'}
                        onChange={(e) =>
                          setEditSettingsState({
                            ...editSettingsState,
                            customDomain: e.target.value,
                          })
                        }
                        placeholder="e.g. rajmedicare.in"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                      />
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white rounded-lg p-3 border border-slate-200 space-y-1.5">
                      <p className="font-semibold text-slate-800">DNS Setup Instructions:</p>
                      <p>
                        1. Point your domain DNS A Record or CNAME to your production hosting server.
                      </p>
                      <p>
                        2. SSL/TLS certificates will automatically provision and renew for <strong>{editSettingsState.customDomain || 'rajmedicare.in'}</strong> and <strong>www.{editSettingsState.customDomain || 'rajmedicare.in'}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Save All Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PATIENT REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Patient Testimonials & Community Reviews ({adminReviews.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Moderate patient feedback. Approved reviews are displayed on the public
                    homepage to build community trust in Talcher.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {adminReviews.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {adminReviews.map((rev) => (
                      <div key={rev.id} className="p-4 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {rev.patientName}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{rev.locality}</span>
                            <div className="flex items-center gap-0.5 ml-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'fill-slate-200 text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {rev.status === 'approved' ? 'Live on Website' : 'Hidden'}
                            </span>

                            <button
                              onClick={async () => {
                                const nextStatus =
                                  rev.status === 'approved' ? 'hidden' : 'approved';
                                await storeService.updateReviewStatus(rev.id, nextStatus);
                                setAdminReviews((prev) =>
                                  prev.map((r) => (r.id === rev.id ? { ...r, status: nextStatus } : r))
                                );
                                showToast(
                                  `Review marked as ${nextStatus === 'approved' ? 'Public' : 'Hidden'}`,
                                  'info'
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition"
                            >
                              {rev.status === 'approved' ? 'Hide' : 'Approve'}
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this testimonial permanently?')) {
                                  await storeService.deleteReview(rev.id);
                                  setAdminReviews((prev) => prev.filter((r) => r.id !== rev.id));
                                  showToast('Review deleted', 'info');
                                }
                              }}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">"{rev.title}"</h4>
                          <p className="text-slate-600 mt-1 leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span>
                            Service:{' '}
                            <strong className="text-slate-600">
                              {rev.serviceType === 'doctor_consultation'
                                ? rev.doctorName
                                  ? `Doctor OPD (${rev.doctorName})`
                                  : 'Doctor Consultation'
                                : rev.serviceType === 'pharmacy_delivery'
                                ? 'Pharmacy Delivery'
                                : 'General Care'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No reviews received yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Administrative Audit Trail</h2>
                <p className="text-xs text-slate-500">
                  Real-time recording of doctor additions, schedule publications, and status changes.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {auditLogs.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3.5 flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>Admin: {log.adminEmail}</span>
                            <span>•</span>
                            <span className="capitalize">{log.entityType}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No audit records registered yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DOCTOR CREATE/EDIT MODAL */}
      {showDoctorModal && editingDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDoctor}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingDoctor.id ? 'Edit Doctor Profile' : 'Add Visiting Doctor'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  placeholder="e.g. Dr. B. K. Patnaik"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.specialization || ''}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, specialization: e.target.value })
                  }
                  placeholder="e.g. General Physician, Gynecologist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Qualifications *</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.qualification || ''}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, qualification: e.target.value })
                  }
                  placeholder="e.g. MBBS, MD (Medicine)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  required
                  value={editingDoctor.experienceYears || 5}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      experienceYears: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={editingDoctor.consultationFee || 500}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      consultationFee: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={editingDoctor.gender || 'male'}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, gender: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Doctor Photo URL</label>
                <input
                  type="url"
                  value={editingDoctor.photoUrl || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">About Doctor / Bio</label>
                <textarea
                  rows={2}
                  value={editingDoctor.bio || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  placeholder="Doctor's background, training and practice areas..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Areas of Consultation
                </label>
                <input
                  type="text"
                  value={editingDoctor.areasOfConsultation || ''}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      areasOfConsultation: e.target.value,
                    })
                  }
                  placeholder="e.g. Diabetes, Hypertension, Seasonal Infections"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
              >
                Save Doctor Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCHEDULE CREATE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePublishSchedule}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Publish Doctor Visiting Schedule
                </h3>
                <p className="text-[11px] text-slate-500">
                  Slots will be automatically generated and made available on the website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Doctor *</label>
                <select
                  required
                  value={scheduleDoctorId}
                  onChange={(e) => {
                    setScheduleDoctorId(e.target.value);
                    const doc = doctors.find((d) => d.id === e.target.value);
                    if (doc) setScheduleFee(doc.consultationFee);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  {doctors
                    .filter((d) => d.status === 'active')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Visiting Date (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduleStartTime}
                    onChange={(e) => setScheduleStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="60"
                    value={scheduleSlotDuration}
                    onChange={(e) => setScheduleSlotDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Patients</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={scheduleMaxPatients}
                    onChange={(e) => setScheduleMaxPatients(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={scheduleFee}
                    onChange={(e) => setScheduleFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Public Notes (Optional)
                </label>
                <input
                  type="text"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Evening clinic. Walk-ins subject to available slots."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
              >
                Publish Schedule Immediately
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MEDICINE CREATE/EDIT MODAL */}
      {showMedModal && editingMedicine && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMedicine}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingMedicine.id ? 'Edit Medicine' : 'Add Medicine to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={editingMedicine.name || ''}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                  placeholder="e.g. Dolo 650 Tablet"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Brand / Company *</label>
                <input
                  type="text"
                  required
                  value={editingMedicine.brand || ''}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, brand: e.target.value })}
                  placeholder="e.g. Micro Labs Ltd"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Generic Name / Composition
                </label>
                <input
                  type="text"
                  value={editingMedicine.genericName || ''}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, genericName: e.target.value })
                  }
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editingMedicine.category || 'Fever & Pain'}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value="Fever & Pain">Fever & Pain</option>
                  <option value="Cold & Cough">Cold & Cough</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                  <option value="Digestive Care">Digestive Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Medical Devices">Medical Devices</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pack Size</label>
                <input
                  type="text"
                  value={editingMedicine.packSize || ''}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, packSize: e.target.value })
                  }
                  placeholder="e.g. 15 Tablets / Strip"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={editingMedicine.price || 0}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  value={editingMedicine.discount || 0}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, discount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingMedicine.imageUrl || ''}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingMedicine.description || ''}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={editingMedicine.prescriptionRequired || false}
                  onChange={(e) =>
                    setEditingMedicine({
                      ...editingMedicine,
                      prescriptionRequired: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="rxReq" className="text-slate-700 font-medium">
                  Prescription Required (Rx)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvail"
                  checked={editingMedicine.isAvailable !== false}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="isAvail" className="text-slate-700 font-medium">
                  Available in Stock
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
              >
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
