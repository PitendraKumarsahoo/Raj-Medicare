import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import { PatientReview } from '../types';
import {
  Calendar,
  Pill,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Truck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star,
  Quote,
  MessageSquarePlus,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Stethoscope,
  X,
} from 'lucide-react';
import {
  getTodayISTDateString,
  formatScheduleDateLabel,
  formatTime12Hour,
  computeEffectiveScheduleStatus,
} from '../utils/time';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectDoctorForBooking?: (doctorId: string, scheduleId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSelectDoctorForBooking }) => {
  const { settings, doctors, schedules, medicines, addToCart, setIsCartOpen, showToast } = useStore();

  const todayStr = getTodayISTDateString();

  // Filter today's schedules
  const todaysSchedules = schedules.filter((s) => s.date === todayStr);

  // Group upcoming schedules (next 7 days)
  const upcomingSchedules = schedules.filter((s) => s.date > todayStr);

  const cleanPhone = settings.phone.replace(/\D/g, '');
  const cleanWhatsApp = settings.whatsappNumber.replace(/\D/g, '');

  const featuredMedicines = medicines.slice(0, 4);

  // Reviews state
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Form Fields
  const [revName, setRevName] = useState('');
  const [revLocality, setRevLocality] = useState('');
  const [revServiceType, setRevServiceType] = useState<PatientReview['serviceType']>('doctor_consultation');
  const [revDoctorName, setRevDoctorName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');

  useEffect(() => {
    storeService.getApprovedReviews().then((data) => setReviews(data)).catch(() => {});
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revTitle.trim() || !revComment.trim()) {
      showToast('Please fill in your name, review headline, and comments', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const newRev = await storeService.submitReview({
        patientName: revName,
        locality: revLocality || 'Talcher, Odisha',
        serviceType: revServiceType,
        doctorName: revDoctorName || undefined,
        rating: revRating,
        title: revTitle,
        comment: revComment,
      });

      setReviews((prev) => [newRev, ...prev]);
      setShowReviewModal(false);
      setRevName('');
      setRevLocality('');
      setRevTitle('');
      setRevComment('');
      showToast('Thank you for sharing your experience! Your testimonial has been published.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-slate-50 to-white pt-10 sm:pt-16 pb-14 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-100/80 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-sm bg-teal-600 animate-pulse" />
                <span>Shop No. 39, Bharatpur Market Complex, Talcher</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
                {settings.heroHeading}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {settings.heroSubheading}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/book')}
                  className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Doctor Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => navigate('/doctors')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>View Visiting Doctors</span>
                </button>
              </div>

              {/* Factual Value Props */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">7:00 AM to 11:00 PM</h4>
                    <p className="text-[11px] text-slate-500">Open 7 days a week</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Visiting Doctors</h4>
                    <p className="text-[11px] text-slate-500">Qualified specialists</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Local Delivery</h4>
                    <p className="text-[11px] text-slate-500">FCI & Talcher town</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Medical Card Visual */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 4v16m-8-8h16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Raj Medicare Clinic</h3>
                      <p className="text-[11px] text-slate-500">Bharatpur Market Complex, Talcher</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Open Now
                  </span>
                </div>

                {/* Quick Store Snapshot */}
                <div className="py-4 space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>Today's Visiting Specialists</span>
                      <span className="font-bold text-teal-700">{todaysSchedules.length} Scheduled</span>
                    </div>

                    {todaysSchedules.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {todaysSchedules.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{s.doctorName}</span>
                              <span className="text-[11px] text-slate-500 block">
                                {s.doctorSpecialization}
                              </span>
                            </div>
                            <span className="text-teal-700 font-semibold text-[11px]">
                              {formatTime12Hour(s.startTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-1">
                        Consultation schedules updated daily. Check upcoming slots below.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 text-xs">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>{settings.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20have%20an%20enquiry.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Registered Medical Dispensary</span>
                  <span>Angul District, Odisha</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Book Doctor */}
          <button
            onClick={() => navigate('/book')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">
                Book Doctor
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Find a visiting doctor and reserve an appointment.
              </p>
            </div>
          </button>

          {/* Card 2: Medicines */}
          <button
            onClick={() => navigate('/medicines')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition">
                Medicines
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Browse available medicines and healthcare products.
              </p>
            </div>
          </button>

          {/* Card 3: Call Us */}
          <a
            href={`tel:${cleanPhone}`}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                Call Us
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Quickly contact Raj Medicare dispensary staff.
              </p>
            </div>
          </a>

          {/* Card 4: Get Directions */}
          <a
            href={settings.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-500 hover:shadow-md transition text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-700 transition">
                Get Directions
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Open store location in Google Maps (Bharatpur).
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* 3. TODAY'S VISITING DOCTORS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Consultation Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Visiting Doctors Today
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Consult qualified doctors visiting Raj Medicare dispensary today.
            </p>
          </div>

          <button
            onClick={() => navigate('/doctors')}
            className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            <span>View All Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {todaysSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todaysSchedules.map((schedule) => {
              const statusInfo = computeEffectiveScheduleStatus(
                schedule.status,
                schedule.date,
                schedule.startTime,
                schedule.endTime,
                schedule.bookedCount,
                schedule.maxPatients
              );
              const remainingSlots = Math.max(0, schedule.maxPatients - schedule.bookedCount);

              return (
                <div
                  key={schedule.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header badge & status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                        Today ({formatScheduleDateLabel(schedule.date)})
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          schedule.doctorPhotoUrl ||
                          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={schedule.doctorName}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                          {schedule.doctorName}
                        </h3>
                        <p className="text-xs font-semibold text-teal-700 mt-0.5">
                          {schedule.doctorSpecialization}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ₹{schedule.consultationFee} Consultation
                        </p>
                      </div>
                    </div>

                    {/* Schedule Time & Capacity */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          Visiting Time:
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatTime12Hour(schedule.startTime)} to{' '}
                          {formatTime12Hour(schedule.endTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Available Slots:</span>
                        <span
                          className={`font-semibold ${
                            remainingSlots <= 2 ? 'text-amber-700' : 'text-teal-700'
                          }`}
                        >
                          {remainingSlots} slots remaining (max {schedule.maxPatients})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (onSelectDoctorForBooking) {
                          onSelectDoctorForBooking(schedule.doctorId, schedule.id);
                        } else {
                          navigate(`/book?doc=${schedule.doctorId}&sch=${schedule.id}`);
                        }
                      }}
                      disabled={statusInfo.status === 'fully_booked' || statusInfo.status === 'completed'}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {statusInfo.status === 'fully_booked'
                          ? 'Fully Booked'
                          : 'Book Appointment'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-teal-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              No visiting doctors are scheduled for today
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our visiting physicians arrive on scheduled calendar days. Please check upcoming dates
              below to reserve your consultation slot in advance.
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <span>View Upcoming Doctors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 4. UPCOMING DOCTOR SCHEDULES (Next 7 Days) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Advance Appointments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Upcoming Doctor Schedules
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Plan ahead and book your consultation with visiting specialists.
            </p>
          </div>
        </div>

        {upcomingSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {formatScheduleDateLabel(schedule.date)}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      Upcoming
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={
                        schedule.doctorPhotoUrl ||
                        'https://images.unsplash.com/photo-1594824813583-057088b9016c?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={schedule.doctorName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {schedule.doctorName}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">
                        {schedule.doctorSpecialization}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fee: ₹{schedule.consultationFee}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Visiting Time:</span>
                      <span className="font-bold text-slate-900">
                        {formatTime12Hour(schedule.startTime)} to {formatTime12Hour(schedule.endTime)}
                      </span>
                    </div>
                    {schedule.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-0.5">{schedule.notes}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onSelectDoctorForBooking) {
                        onSelectDoctorForBooking(schedule.doctorId, schedule.id);
                      } else {
                        navigate(`/book?doc=${schedule.doctorId}&sch=${schedule.id}`);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book For {formatScheduleDateLabel(schedule.date)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
            No future dates published yet. More visiting doctor dates will be posted soon.
          </div>
        )}
      </section>

      {/* 5. HOW APPOINTMENT BOOKING WORKS */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Appointment Booking Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Three simple steps to consult your preferred doctor at Raj Medicare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Find a Doctor</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Check today's and upcoming visiting doctors, their credentials, consultation fees,
                and visiting dates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Choose a Slot</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Select your preferred date and an available 15-minute consultation time slot. Fill
                basic patient details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Visit Raj Medicare</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Come to Shop No. 39, Bharatpur Market Complex at your confirmed time. Check in with
                reception using your Appointment ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED MEDICINES & PHARMACY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Pill className="w-3.5 h-3.5" />
              <span>Pharmacy Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Medicines & Healthcare Essentials
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse genuine medicines. Add to enquiry list for local home delivery in Talcher.
            </p>
          </div>

          <button
            onClick={() => navigate('/medicines')}
            className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredMedicines.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                  <img
                    src={
                      med.imageUrl ||
                      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={med.name}
                    className="w-full h-full object-cover"
                  />
                  {med.prescriptionRequired && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                      Rx
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {med.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug mt-0.5 truncate">
                  {med.name}
                </h3>
                <p className="text-[11px] text-slate-500">{med.packSize}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-extrabold text-slate-900 text-sm">₹{med.price}</span>
                  {med.discount && med.discount > 0 && (
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{med.price + med.discount}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => addToCart(med)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Add to Enquiry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LOCAL DELIVERY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Talcher Local Service
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Need Medicines Delivered at Home?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We provide prompt local delivery across FCI Township, Bharatpur, N.S. Nagar, and
              neighboring colonies. Select items, attach prescription if required, and our team will
              confirm.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition text-center"
            >
              Request Medicine Delivery
            </button>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20want%20to%20order%20medicines%20for%20delivery.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. STATS & DATA VISUALIZATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
            <Activity className="w-3.5 h-3.5" />
            <span>Operational Scale and Clinical Capacity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Healthcare Services in Talcher
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Verifiable clinical presence and pharmacy services operating at Shop No. 39, Bharatpur
            Market Complex, FCI Township.
          </p>
        </div>

        {/* 4 Factual Operational Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Stat 1: Visiting Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Verified Roster
              </span>
            </div>

            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight block">
                {doctors.filter((d) => d.status === 'active').length} Specialists
              </span>
              <h4 className="font-bold text-xs text-slate-800 mt-0.5">Visiting Consultants</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Medicine, Gynecology, Pediatrics, Orthopedics, Dermatology, Cardiology.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div className="bg-teal-600 h-full rounded-sm w-full" />
            </div>
          </div>

          {/* Stat 2: Scheduled Clinics */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                15-Min Slots
              </span>
            </div>

            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight block">
                {schedules.length} Published
              </span>
              <h4 className="font-bold text-xs text-slate-800 mt-0.5">Clinic Sessions</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Organized arrival times with confirmed queue numbers and zero booking fees.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div className="bg-sky-600 h-full rounded-sm w-full" />
            </div>
          </div>

          {/* Stat 3: Medicines Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                GST Invoices
              </span>
            </div>

            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight block">
                {medicines.length}+ Catalog Items
              </span>
              <h4 className="font-bold text-xs text-slate-800 mt-0.5">Authentic Formulations</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Sourced from authorized pharmaceutical distributors with batch barcodes.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-sm w-full" />
            </div>
          </div>

          {/* Stat 4: Store Hours */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                All 7 Days
              </span>
            </div>

            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight block">
                16 Hours
              </span>
              <h4 className="font-bold text-xs text-slate-800 mt-0.5">Daily Dispensary (7 AM to 11 PM)</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Emergency medicine access and evening visiting doctor OPDs.
              </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div className="bg-amber-600 h-full rounded-sm w-full" />
            </div>
          </div>
        </div>

        {/* Data Visualization Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Visual 1: Department Consultation Capacities (Data Visualization) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Visiting Specialist Departments & Capacities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consultation slot quota configured per clinical session at Raj Medicare
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    General Medicine & Diabetes (Dr. B. K. Patnaik)
                  </span>
                  <span className="font-bold text-teal-700">12 slots / session (15 min/slot)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-sm w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    Obstetrics & Gynecology (Dr. Smruti Rekha Mishra)
                  </span>
                  <span className="font-bold text-sky-700">10 slots / session (15 min/slot)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-sm w-[67%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    Pediatrics & Child Care (Dr. Ashish Kumar Sahoo)
                  </span>
                  <span className="font-bold text-amber-700">15 slots / session (12 min/slot)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-sm w-[100%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    Orthopedics & Joint Care (Dr. R. K. Mohapatra)
                  </span>
                  <span className="font-bold text-indigo-700">12 slots / session (15 min/slot)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-sm w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    Dermatology & Cosmetology (Dr. Priyadarshini Das)
                  </span>
                  <span className="font-bold text-rose-700">10 slots / session (15 min/slot)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-sm w-[67%]" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Direct doctor consultation fee: ₹500 to ₹800 (Paid at clinic desk)</span>
              <span className="font-semibold text-teal-700">0 Platform Surcharge</span>
            </div>
          </div>

          {/* Visual 2: Local Community Coverage & Response Matrix */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider mb-2">
                Local Talcher Coverage
              </div>
              <h3 className="font-extrabold text-white text-base">
                Community Footprint in Talcher
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Clinical services and medicine dispatch radius from Shop No. 39:
              </p>
            </div>

            {/* Locality bars */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-200 font-medium">Bharatpur Market Complex (On-Site OPD)</span>
                  <span className="font-bold text-teal-300">Walk-in & Reserved</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-sm w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-200 font-medium">FCI Township & Colony Quarters</span>
                  <span className="font-bold text-teal-300">Doorstep Delivery (30-45m)</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-sm w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-200 font-medium">N.S. Nagar Residential Area</span>
                  <span className="font-bold text-teal-300">Doorstep Delivery (30-45m)</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-sm w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-200 font-medium">Handidhua & Deulabeda Corridor</span>
                  <span className="font-bold text-teal-300">Daily Delivery Route</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-sm w-[60%]" />
                </div>
              </div>
            </div>

            {/* Bottom trust pills */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Zero Booking Fees</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>7:00 AM to 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PATIENT TESTIMONIALS & COMMUNITY TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Community Trust & Patient Stories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Patient Experiences at Raj Medicare
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Authentic feedback from residents of FCI Township, Bharatpur, N.S. Nagar, and
              greater Talcher on our visiting doctor consultations and medicine delivery.
            </p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-teal-600" />
            <span>Share Your Experience</span>
          </button>
        </div>

        {/* Community Trust Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-5 text-white mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm border border-slate-800 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-extrabold text-lg text-white">4.9 / 5</span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Patient Satisfaction</span>
          </div>

          <div>
            <div className="font-extrabold text-lg text-teal-300 mb-0.5">1,200+</div>
            <span className="text-[11px] text-slate-300 font-medium">Consultations Coordinated</span>
          </div>

          <div>
            <div className="font-extrabold text-lg text-emerald-400 mb-0.5">100%</div>
            <span className="text-[11px] text-slate-300 font-medium">Genuine Pharmacy Stock</span>
          </div>

          <div>
            <div className="font-extrabold text-lg text-white mb-0.5">16 Hours</div>
            <span className="text-[11px] text-slate-300 font-medium">Daily Store (7:00 AM to 11:00 PM)</span>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating & Service Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Patient</span>
                  </span>
                </div>

                {/* Review Headline & Comment */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    "{rev.title}"
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 italic">
                    "{rev.comment}"
                  </p>
                </div>
              </div>

              {/* Patient Attribution & Service tag */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{rev.patientName}</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600" />
                    {rev.locality}
                  </span>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {rev.serviceType === 'doctor_consultation'
                      ? rev.doctorName
                        ? `Visiting ${rev.doctorName}`
                        : 'Doctor OPD'
                      : rev.serviceType === 'pharmacy_delivery'
                      ? 'Medicine Delivery'
                      : 'Pharmacy Care'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHY RAJ MEDICARE (Factual Benefits) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Why Raj Medicare</h2>
          <p className="text-sm text-slate-600 mt-2">
            Committed to reliable healthcare services in the Talcher community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Genuine & Verified Medicines</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Procured directly from authorized pharmaceutical distributors. Correct storage and
              uncompromised quality control.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Experienced Visiting Doctors</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consult specialists in medicine, gynecology, pediatrics, orthopedics, and dermatology
              without traveling far from Talcher.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Extended Hours (7:00 AM to 11:00 PM)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open 16 hours every day including weekends, so you always have access to essential
              first-aid, prescription refills, and medical supplies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Real-time Slot Booking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Know exactly when a doctor visits and avoid long waiting queues by booking a scheduled
              consultation time slot.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Central Bharatpur Location</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conveniently located at Shop No. 39 in Bharatpur Market Complex, FCI Township, with
              easy parking and quick road access.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Friendly Local Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dedicated staff to assist with medicine usage instructions, dosage guidelines, and
              appointment check-ins.
            </p>
          </div>
        </div>
      </section>

      {/* 9. STORE LOCATION & CONTACT CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Store Location & Timings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Visit Raj Medicare in Talcher
            </h2>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-medium text-slate-800 text-sm">{settings.address}</p>
              <p className="text-slate-500">
                Landmark: Bharatpur Market Complex, FCI Township, Talcher
              </p>
              <div className="pt-2 flex items-center gap-2 text-teal-700 font-bold">
                <Clock className="w-4 h-4" />
                <span>Open Everyday: {settings.openingHours}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Store</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">FCI Township & Bharatpur</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Centrally accessible for residents of FCI Colony, Handidhua, N.S. Nagar, and
                surrounding Angul mining & thermal plant corridors.
              </p>
            </div>
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold hover:underline"
            >
              <span>View On Interactive Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* PATIENT EXPERIENCE / TESTIMONIAL SUBMISSION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Share Your Patient Experience
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your feedback helps families in Talcher find trustworthy healthcare care.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Rating selection */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className="p-1 hover:scale-110 transition focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= revRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {revRating} out of 5 stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    placeholder="e.g. Subrat Mohanty"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Locality / Colony in Talcher
                  </label>
                  <input
                    type="text"
                    value={revLocality}
                    onChange={(e) => setRevLocality(e.target.value)}
                    placeholder="e.g. FCI Township, Sector 2"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={revServiceType}
                    onChange={(e) => setRevServiceType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="doctor_consultation">Visiting Doctor Consultation</option>
                    <option value="pharmacy_delivery">Medicine Delivery & Pharmacy</option>
                    <option value="general_care">General Healthcare Store Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Consulting Doctor (Optional)
                  </label>
                  <input
                    type="text"
                    value={revDoctorName}
                    onChange={(e) => setRevDoctorName(e.target.value)}
                    placeholder="e.g. Dr. B. K. Patnaik"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Review Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="e.g. Very smooth appointment and quick doctor consultation"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Your Detailed Experience *
                </label>
                <textarea
                  rows={3}
                  required
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Share details about the waiting time, doctor consultation, medicine availability, or delivery service..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {submittingReview ? 'Publishing...' : 'Publish Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
