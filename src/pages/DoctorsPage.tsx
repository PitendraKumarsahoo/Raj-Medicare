import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Doctor } from '../types';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  getTodayISTDateString,
  formatScheduleDateLabel,
  formatTime12Hour,
  computeEffectiveScheduleStatus,
} from '../utils/time';

interface DoctorsPageProps {
  navigate: (path: string) => void;
  onSelectDoctor: (doctorId: string) => void;
  onBookDoctor: (doctorId: string, scheduleId?: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  navigate,
  onSelectDoctor,
  onBookDoctor,
}) => {
  const { doctors, schedules } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('all'); // 'all', 'today', 'upcoming'
  const [selectedGender, setSelectedGender] = useState('all');
  const [sortBy, setSortBy] = useState<'availability' | 'name' | 'fee'>('availability');

  const todayStr = getTodayISTDateString();

  // Extract unique specialties
  const specialties = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.specialization)));
    return ['All', ...list];
  }, [doctors]);

  // Associate doctors with their active schedules
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        if (doc.status !== 'active') return false;

        // Search text matching name, specialty, bio
        const matchesSearch =
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.qualification.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Specialty filter
        if (selectedSpecialty !== 'All' && doc.specialization !== selectedSpecialty) {
          return false;
        }

        // Gender filter
        if (selectedGender !== 'all' && doc.gender !== selectedGender) {
          return false;
        }

        // Schedules for this doctor
        const docSchedules = schedules.filter((s) => s.doctorId === doc.id);

        // Availability filter
        if (selectedAvailability === 'today') {
          const hasToday = docSchedules.some((s) => s.date === todayStr);
          if (!hasToday) return false;
        } else if (selectedAvailability === 'upcoming') {
          const hasUpcoming = docSchedules.some((s) => s.date > todayStr);
          if (!hasUpcoming) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'fee') {
          return a.consultationFee - b.consultationFee;
        }
        // Default: sort by earliest availability
        const nextA = schedules.find((s) => s.doctorId === a.id);
        const nextB = schedules.find((s) => s.doctorId === b.id);
        if (nextA && nextB) {
          return nextA.date.localeCompare(nextB.date);
        }
        if (nextA) return -1;
        if (nextB) return 1;
        return a.displayOrder - b.displayOrder;
      });
  }, [
    doctors,
    schedules,
    searchTerm,
    selectedSpecialty,
    selectedAvailability,
    selectedGender,
    sortBy,
    todayStr,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Visiting Consultants & Physicians</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Visiting Doctors at Raj Medicare
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          Consult experienced physicians, pediatricians, gynecologists, orthopedics, and
          specialists visiting our Talcher center. View active consultation schedules and reserve
          your time slot online.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, specialization (e.g. Gynecologist, Physician, Pediatrician)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
          />
        </div>

        {/* Specialty filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider mr-1">
            Specialty:
          </span>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Sub filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Availability */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Visiting:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="upcoming">Upcoming Days</option>
              </select>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Gender:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="availability">Earliest Availability</option>
              <option value="name">Doctor Name</option>
              <option value="fee">Consultation Fee (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            // Find active schedules for this doctor
            const docSchedules = schedules.filter((s) => s.doctorId === doc.id);
            const nextSchedule = docSchedules[0];

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Doctor Profile Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        doc.photoUrl ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={doc.name}
                      className="w-18 h-18 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs font-bold text-teal-700 mt-1">
                        {doc.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {doc.qualification}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {doc.experienceYears}+ Yrs Exp
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          ₹{doc.consultationFee} Fee
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  {/* Next Visiting Schedule Card */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                    {nextSchedule ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Next Visiting Date:
                          </span>
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 text-[11px]">
                            {formatScheduleDateLabel(nextSchedule.date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            Time Slot:
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatTime12Hour(nextSchedule.startTime)} to{' '}
                            {formatTime12Hour(nextSchedule.endTime)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="py-1 text-center text-slate-500 text-[11px] italic">
                        Currently no active visiting dates. Click profile to check clinic schedule.
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDoctor(doc.id)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onBookDoctor(doc.id, nextSchedule?.id)}
                    disabled={!nextSchedule}
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs shadow-xs transition text-center"
                  >
                    {nextSchedule ? 'Book Slot' : 'Unavailable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
          <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No matching doctors found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search keywords, clearing specialty filters, or selecting "All Dates".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('All');
              setSelectedAvailability('all');
              setSelectedGender('all');
            }}
            className="text-xs font-bold text-teal-700 hover:underline pt-2 inline-block"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
