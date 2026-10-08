import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import { Doctor, DoctorSchedule, AppointmentSlot } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  formatScheduleDateLabel,
  formatTime12Hour,
  computeEffectiveScheduleStatus,
} from '../utils/time';

interface DoctorDetailsPageProps {
  doctorId: string;
  navigate: (path: string) => void;
  onBookSchedule: (doctorId: string, scheduleId: string, slotId?: string) => void;
}

export const DoctorDetailsPage: React.FC<DoctorDetailsPageProps> = ({
  doctorId,
  navigate,
  onBookSchedule,
}) => {
  const { doctors, schedules, settings } = useStore();

  const doctor = doctors.find((d) => d.id === doctorId);
  const docSchedules = schedules.filter((s) => s.doctorId === doctorId);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    docSchedules[0]?.id || ''
  );
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedScheduleId) {
      loadSlots(selectedScheduleId);
    } else if (docSchedules.length > 0) {
      setSelectedScheduleId(docSchedules[0].id);
      loadSlots(docSchedules[0].id);
    }
  }, [selectedScheduleId, docSchedules.length]);

  const loadSlots = async (scheduleId: string) => {
    setLoadingSlots(true);
    try {
      const data = await storeService.getSlotsForSchedule(scheduleId);
      setSlots(data);
    } catch {
      // ignore
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested doctor profile could not be located.
        </p>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const selectedSchedule = docSchedules.find((s) => s.id === selectedScheduleId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={
              doctor.photoUrl ||
              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
            }
            alt={doctor.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
          />

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {doctor.specialization}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {doctor.experienceYears}+ Years Clinical Experience
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {doctor.name}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                {doctor.qualification}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="font-extrabold text-base text-slate-900">
                  ₹{doctor.consultationFee}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-500 block">Consultation Mode</span>
                <span className="font-bold text-teal-700">In-Person at Raj Medicare</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Areas of Consultation */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              About Doctor
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Areas of Consultation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {doctor.areasOfConsultation ||
                'Comprehensive medical diagnosis, prescription advice, chronic disease follow-ups, and health guidance.'}
            </p>
          </div>
        </div>
      </div>

      {/* Visiting Schedules & Slot Picker */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Visiting Schedule at Talcher Clinic
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Available Consultation Dates & Slots
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select a visiting date below to view open appointment slots.
          </p>
        </div>

        {docSchedules.length > 0 ? (
          <div className="space-y-6">
            {/* Schedule Date Selection Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {docSchedules.map((sch) => {
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
                  <button
                    key={sch.id}
                    onClick={() => setSelectedScheduleId(sch.id)}
                    className={`p-3 rounded-2xl border text-left shrink-0 transition min-w-[170px] ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {formatScheduleDateLabel(sch.date)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {formatTime12Hour(sch.startTime)} to {formatTime12Hour(sch.endTime)}
                    </span>
                    <span className="text-[10px] text-teal-700 font-semibold block mt-1">
                      Fee: ₹{sch.consultationFee}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slots for selected schedule */}
            {selectedSchedule && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block sm:inline mr-2">
                      Schedule Details:
                    </span>
                    <span>
                      {formatScheduleDateLabel(selectedSchedule.date)} |{' '}
                      {formatTime12Hour(selectedSchedule.startTime)} to{' '}
                      {formatTime12Hour(selectedSchedule.endTime)}
                    </span>
                    {selectedSchedule.notes && (
                      <span className="block sm:inline text-slate-500 text-[11px] sm:ml-2">
                        • {selectedSchedule.notes}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-teal-800">
                    Max Capacity: {selectedSchedule.maxPatients} Patients
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Select a Time Slot
                  </h4>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                      Loading available slots...
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {slots.map((slot) => {
                        const isBooked = slot.status === 'booked';
                        return (
                          <button
                            key={slot.id}
                            disabled={isBooked}
                            onClick={() =>
                              onBookSchedule(doctor.id, selectedSchedule.id, slot.id)
                            }
                            className={`p-2.5 rounded-xl text-center text-xs font-semibold transition border ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : 'bg-white hover:bg-teal-600 hover:text-white hover:border-teal-600 text-slate-800 border-slate-200 shadow-xs'
                            }`}
                          >
                            <span>{formatTime12Hour(slot.startTime)}</span>
                            <span className="block text-[10px] font-normal opacity-70">
                              {isBooked ? 'Booked' : 'Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Slots will be generated upon booking. Click the button below to reserve.
                    </div>
                  )}
                </div>

                {/* Primary CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    <span>* Walk-ins depend on emergency slot availability. Online booking guarantees reservation.</span>
                  </div>

                  <button
                    onClick={() => onBookSchedule(doctor.id, selectedSchedule.id)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Proceed to Book Appointment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Currently Unavailable</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {doctor.name} does not have an active visiting timetable for the upcoming days.
              Please check back soon or call Raj Medicare store for offline clinic inquiry.
            </p>
            <div className="pt-2">
              <a
                href={`tel:${settings.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Raj Medicare Store</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
