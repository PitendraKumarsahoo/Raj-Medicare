import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import { Appointment } from '../types';
import QRCode from 'qrcode';
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  formatFullDate,
  formatTime12Hour,
  getNowInIST,
} from '../utils/time';

interface MyAppointmentsPageProps {
  navigate: (path: string) => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({ navigate }) => {
  const { settings, showToast } = useStore();

  const [appointmentIdInput, setAppointmentIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedAppointment, setSearchedAppointment] = useState<Appointment | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentIdInput.trim() || !phoneInput.trim()) {
      showToast('Please enter both Appointment ID and your registered phone number', 'error');
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);
    try {
      const result = await storeService.lookupAppointment(appointmentIdInput, phoneInput);
      setSearchedAppointment(result);
      if (result) {
        const payload = JSON.stringify({
          appId: result.appointmentNumber,
          patient: result.patientName,
          doctor: result.doctorName,
          date: result.date,
          time: result.time,
          status: result.status,
        });
        const qr = await QRCode.toDataURL(payload, { width: 200, margin: 2 });
        setQrCodeUrl(qr);
        showToast('Appointment found!', 'success');
      } else {
        showToast('No matching appointment found. Please check details.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lookup failed', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!searchedAppointment) return;

    setIsCancelling(true);
    try {
      await storeService.updateAppointmentStatus(
        searchedAppointment.id,
        'cancelled',
        cancellationReason || 'Cancelled by patient'
      );
      setSearchedAppointment({
        ...searchedAppointment,
        status: 'cancelled',
        cancellationReason: cancellationReason || 'Cancelled by patient',
      });
      setShowCancelModal(false);
      showToast('Appointment cancelled successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 animate-pulse">
            Checked In at Clinic
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            No Show
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Patient Appointment Lookup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Check Your Appointment</h1>
        <p className="text-sm text-slate-600 mt-2">
          Enter your Appointment ID (e.g. <code>RM-20261012-001</code>) and registered mobile number
          to view status, check-in QR code, or manage your booking.
        </p>
      </div>

      {/* Lookup Card */}
      <form
        onSubmit={handleLookup}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Appointment ID *
            </label>
            <input
              type="text"
              required
              value={appointmentIdInput}
              onChange={(e) => setAppointmentIdInput(e.target.value)}
              placeholder="e.g. RM-20261012-123"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Registered Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. 94371XXXXX"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
        >
          {isSearching ? (
            'Searching Appointment Records...'
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Appointment</span>
            </>
          )}
        </button>
      </form>

      {/* Result Card */}
      {searchedAppointment ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Appointment Reference
              </span>
              <h3 className="font-mono text-xl font-extrabold text-teal-800">
                {searchedAppointment.appointmentNumber}
              </h3>
            </div>
            <div>{getStatusBadge(searchedAppointment.status)}</div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Visiting Doctor</span>
                <span className="font-bold text-slate-900 text-sm">
                  {searchedAppointment.doctorName}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {searchedAppointment.doctorSpecialization}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Date & Time</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatFullDate(searchedAppointment.date)} at{' '}
                  {formatTime12Hour(searchedAppointment.time)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Patient Name & Age</span>
                <span className="font-semibold text-slate-800">
                  {searchedAppointment.patientName} ({searchedAppointment.patientAge} yrs,{' '}
                  {searchedAppointment.patientGender})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Consultation Fee</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{searchedAppointment.consultationFee}
                </span>
              </div>

              {searchedAppointment.cancellationReason && (
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-rose-800 text-[11px]">
                  <strong>Cancellation Note:</strong> {searchedAppointment.cancellationReason}
                </div>
              )}
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Check-in QR"
                  className="w-36 h-36 rounded-lg object-contain bg-white p-1"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-200 rounded-lg animate-pulse" />
              )}
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                Reception Check-in QR
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scan or display at Raj Medicare front desk
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Need assistance? Call clinic at {settings.phone}
            </span>

            {searchedAppointment.status === 'confirmed' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition"
              >
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      ) : searchAttempted && !isSearching ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No Appointment Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please ensure you have entered the exact Appointment ID (format: RM-YYYYMMDD-XXX) and the
            exact 10-digit mobile number used during booking.
          </p>
        </div>
      ) : null}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Cancel Appointment</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel appointment{' '}
              <strong>{searchedAppointment?.appointmentNumber}</strong>? Your reserved slot will be
              released for other waiting patients.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, travelling"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelAppointment}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
