import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import { Doctor, DoctorSchedule, AppointmentSlot, Appointment } from '../types';
import QRCode from 'qrcode';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Download,
  Copy,
  ChevronRight,
} from 'lucide-react';
import {
  formatScheduleDateLabel,
  formatFullDate,
  formatTime12Hour,
  computeEffectiveScheduleStatus,
} from '../utils/time';

interface BookAppointmentPageProps {
  initialDoctorId?: string;
  initialScheduleId?: string;
  initialSlotId?: string;
  navigate: (path: string) => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  initialDoctorId,
  initialScheduleId,
  initialSlotId,
  navigate,
}) => {
  const { doctors, schedules, settings, showToast } = useStore();

  // Wizard Step: 1 = Doctor, 2 = Date/Schedule, 3 = Slot, 4 = Patient Info, 5 = Confirmation
  const [step, setStep] = useState<number>(() => {
    if (initialScheduleId && initialSlotId) return 4;
    if (initialScheduleId) return 3;
    if (initialDoctorId) return 2;
    return 1;
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || '');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(initialScheduleId || '');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(initialSlotId || '');

  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Info Form
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // If initial doctor or schedule changed via props
  useEffect(() => {
    if (initialDoctorId) setSelectedDoctorId(initialDoctorId);
    if (initialScheduleId) setSelectedScheduleId(initialScheduleId);
    if (initialSlotId) setSelectedSlotId(initialSlotId);
  }, [initialDoctorId, initialScheduleId, initialSlotId]);

  // Load slots when schedule changes
  useEffect(() => {
    if (selectedScheduleId) {
      loadSlots(selectedScheduleId);
    }
  }, [selectedScheduleId]);

  const loadSlots = async (schId: string) => {
    setLoadingSlots(true);
    try {
      const data = await storeService.getSlotsForSchedule(schId);
      setSlots(data);
      if (initialSlotId && data.some((s) => s.id === initialSlotId && s.status === 'available')) {
        setSelectedSlotId(initialSlotId);
      } else if (!selectedSlotId) {
        // pick first available slot
        const firstAvail = data.find((s) => s.status === 'available');
        if (firstAvail) setSelectedSlotId(firstAvail.id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const availableSchedulesForDoc = schedules.filter(
    (s) => s.doctorId === selectedDoctorId && s.status !== 'cancelled'
  );
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // Generate QR code when appointment confirmed
  useEffect(() => {
    if (confirmedAppointment) {
      const qrPayload = JSON.stringify({
        appId: confirmedAppointment.appointmentNumber,
        patient: confirmedAppointment.patientName,
        doctor: confirmedAppointment.doctorName,
        date: confirmedAppointment.date,
        time: confirmedAppointment.time,
        status: confirmedAppointment.status,
      });

      QRCode.toDataURL(qrPayload, { width: 220, margin: 2 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [confirmedAppointment]);

  const handleDoctorSelect = (docId: string) => {
    setSelectedDoctorId(docId);
    const docSchedules = schedules.filter((s) => s.doctorId === docId);
    if (docSchedules.length > 0) {
      setSelectedScheduleId(docSchedules[0].id);
      setStep(2);
    } else {
      setSelectedScheduleId('');
      setStep(2);
    }
  };

  const handleScheduleSelect = (schId: string) => {
    setSelectedScheduleId(schId);
    setSelectedSlotId('');
    setStep(3);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
    setStep(4);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedScheduleId) {
      showToast('Please select a visiting schedule', 'error');
      setStep(2);
      return;
    }

    if (!selectedSlotId) {
      showToast('Please select a time slot', 'error');
      setStep(3);
      return;
    }

    if (!patientName.trim()) {
      showToast('Please enter patient name', 'error');
      return;
    }

    const cleanPhone = patientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const ageNum = parseInt(patientAge, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      showToast('Please enter a valid age between 1 and 120', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = await storeService.bookAppointment({
        scheduleId: selectedScheduleId,
        slotId: selectedSlotId,
        patientName,
        patientAge: ageNum,
        patientGender,
        patientPhone: cleanPhone,
        patientEmail,
        patientAddress,
        reasonForVisit,
        isExistingPatient,
        emergencyContact,
      });

      setConfirmedAppointment(appointment);
      try {
        const stored = JSON.parse(localStorage.getItem('raj_medicare_saved_appointments') || '[]');
        const updated = [appointment, ...stored.filter((a: any) => a.id !== appointment.id)];
        localStorage.setItem('raj_medicare_saved_appointments', JSON.stringify(updated.slice(0, 10)));
      } catch {
        // ignore local storage error
      }
      setStep(5);
      showToast('Appointment booked successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAppointmentNumber = () => {
    if (confirmedAppointment) {
      navigator.clipboard.writeText(confirmedAppointment.appointmentNumber);
      showToast('Appointment ID copied to clipboard', 'success');
    }
  };

  const cleanStorePhone = settings.phone.replace(/\D/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Step Indicator Header (if not confirmed) */}
      {step < 5 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Raj Medicare Clinic
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Book Doctor Appointment
              </h1>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Step {step} of 4
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`py-2 px-1 rounded-lg border transition ${
                step === 1
                  ? 'bg-teal-600 text-white border-teal-600'
                  : step > 1
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              1. Doctor
            </button>
            <button
              onClick={() => selectedDoctorId && setStep(2)}
              disabled={!selectedDoctorId}
              className={`py-2 px-1 rounded-lg border transition ${
                step === 2
                  ? 'bg-teal-600 text-white border-teal-600'
                  : step > 2
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              2. Date
            </button>
            <button
              onClick={() => selectedScheduleId && setStep(3)}
              disabled={!selectedScheduleId}
              className={`py-2 px-1 rounded-lg border transition ${
                step === 3
                  ? 'bg-teal-600 text-white border-teal-600'
                  : step > 3
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              3. Time Slot
            </button>
            <button
              onClick={() => selectedSlotId && setStep(4)}
              disabled={!selectedSlotId}
              className={`py-2 px-1 rounded-lg border transition ${
                step === 4
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              4. Patient Info
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Select Doctor */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 1: Select Visiting Doctor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the consulting specialist you wish to visit at Raj Medicare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors
              .filter((d) => d.status === 'active')
              .map((doc) => {
                const docSchedules = schedules.filter((s) => s.doctorId === doc.id);
                const isSelected = doc.id === selectedDoctorId;

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDoctorSelect(doc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={
                        doc.photoUrl ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={doc.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {doc.qualification}
                      </p>
                      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-900">₹{doc.consultationFee} Fee</span>
                        <span className="text-[11px] text-slate-500">
                          {docSchedules.length} dates available
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* STEP 2: Select Date / Schedule */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Select Visiting Date</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Doctor: <strong>{selectedDoctor?.name}</strong> ({selectedDoctor?.specialization})
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Change Doctor
            </button>
          </div>

          {availableSchedulesForDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableSchedulesForDoc.map((sch) => {
                const statusInfo = computeEffectiveScheduleStatus(
                  sch.status,
                  sch.date,
                  sch.startTime,
                  sch.endTime,
                  sch.bookedCount,
                  sch.maxPatients
                );
                const isSelected = sch.id === selectedScheduleId;

                return (
                  <div
                    key={sch.id}
                    onClick={() => handleScheduleSelect(sch.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {formatScheduleDateLabel(sch.date)} ({formatFullDate(sch.date)})
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {formatTime12Hour(sch.startTime)} to {formatTime12Hour(sch.endTime)}
                      </span>
                      <span className="font-bold text-slate-900">₹{sch.consultationFee}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>Capacity: {sch.maxPatients} patients</span>
                      <span className="text-teal-700 font-semibold">
                        {Math.max(0, sch.maxPatients - sch.bookedCount)} slots left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Schedules for this Doctor</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedDoctor?.name} does not have an upcoming schedule published. Please select
                another visiting specialist.
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
              >
                Choose Another Doctor
              </button>
            </div>
          )}

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Time Slot */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Select Available Slot</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDoctor?.name} •{' '}
                {selectedSchedule && formatFullDate(selectedSchedule.date)}
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Change Date
            </button>
          </div>

          {loadingSlots ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading available slots...
            </div>
          ) : slots.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {slots.map((slot) => {
                  const isBooked = slot.status === 'booked';
                  const isSelected = slot.id === selectedSlotId;

                  return (
                    <button
                      key={slot.id}
                      disabled={isBooked}
                      onClick={() => handleSlotSelect(slot.id)}
                      className={`p-3 rounded-xl text-center text-xs font-semibold transition border ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
                          : isBooked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : 'bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-800 border-slate-200 shadow-xs'
                      }`}
                    >
                      <span className="block font-bold">{formatTime12Hour(slot.startTime)}</span>
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                        {isBooked ? 'Occupied' : 'Open'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-white border border-slate-300" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-600" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200" />
                  <span>Booked</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No slots available for this schedule.
            </div>
          )}

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            {selectedSlotId && (
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Patient Information Form */}
      {step === 4 && (
        <form
          onSubmit={handleSubmitBooking}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
        >
          {/* Summary Box */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-teal-900 font-bold text-sm">
              <span>Appointment Summary</span>
              <span className="font-extrabold text-teal-700">₹{selectedDoctor?.consultationFee}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Doctor</span>
                <span className="font-semibold">{selectedDoctor?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Date</span>
                <span className="font-semibold">
                  {selectedSchedule && formatFullDate(selectedSchedule.date)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Time Slot</span>
                <span className="font-semibold text-teal-700">
                  {selectedSlot && formatTime12Hour(selectedSlot.startTime)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 4: Patient Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please enter accurate patient details to confirm your consultation slot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Priyabrata Mohapatra"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Age (Years) *</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g. 34"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender *</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Mobile Number * (10 digits)
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="e.g. 9437123456"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="e.g. patient@gmail.com"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Residential Address / Colony in Talcher (Optional)
              </label>
              <input
                type="text"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                placeholder="e.g. Qtr No. C-12, FCI Township, Talcher"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Reason for Visit / Primary Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="e.g. Fever for 3 days, regular diabetes checkup, knee pain"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Emergency Contact Number (Optional)
              </label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Family member phone"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isExisting"
                checked={isExistingPatient}
                onChange={(e) => setIsExistingPatient(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="isExisting" className="text-slate-700 font-medium cursor-pointer">
                I am an existing patient at Raj Medicare
              </label>
            </div>
          </div>

          {/* Medical Emergency Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <strong>Notice:</strong> This appointment system is for scheduling outpatient doctor
            consultations only. It is not an emergency medical service. For emergencies, please call
            108 or proceed to the nearest hospital casualty.
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              {isSubmitting ? (
                'Confirming Reservation...'
              ) : (
                <>
                  <span>Confirm Appointment</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Beautiful Appointment Confirmation Screen */}
      {step === 5 && confirmedAppointment && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 animate-in fade-in-50">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              Confirmed & Reserved
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Appointment Confirmed!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your consultation booking with Raj Medicare has been recorded. Please arrive 10
              minutes before your scheduled slot.
            </p>
          </div>

          {/* Ticket / Confirmation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Details */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Appointment ID
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-lg font-extrabold text-teal-800">
                      {confirmedAppointment.appointmentNumber}
                    </span>
                    <button
                      onClick={handleCopyAppointmentNumber}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                      title="Copy Appointment ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Consultation Fee
                  </span>
                  <span className="block font-bold text-slate-900 text-base">
                    ₹{confirmedAppointment.consultationFee}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Doctor:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {confirmedAppointment.doctorName}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {confirmedAppointment.doctorSpecialization}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {confirmedAppointment.patientName} ({confirmedAppointment.patientAge}y,{' '}
                    {confirmedAppointment.patientGender})
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {confirmedAppointment.patientPhone}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Consultation Date:</span>
                  <span className="font-bold text-slate-900">
                    {formatFullDate(confirmedAppointment.date)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Scheduled Time Slot:</span>
                  <span className="font-bold text-teal-700 text-sm">
                    {formatTime12Hour(confirmedAppointment.time)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Location: {settings.address}</span>
              </div>
            </div>

            {/* Right: QR Code for Reception Check-in */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 text-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Check-in QR Code"
                  className="w-36 h-36 rounded-lg object-contain"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-100 rounded-lg animate-pulse" />
              )}
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                Reception Check-in QR
              </span>
              <span className="text-[10px] text-slate-400">
                Show at reception desk on arrival
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/my-appointments')}
              className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition"
            >
              View My Appointments
            </button>

            <a
              href={`tel:${cleanStorePhone}`}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Call Raj Medicare</span>
            </a>

            <button
              onClick={() => {
                setConfirmedAppointment(null);
                setStep(1);
                setSelectedDoctorId('');
                setSelectedScheduleId('');
                setSelectedSlotId('');
                setPatientName('');
                setPatientPhone('');
              }}
              className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
