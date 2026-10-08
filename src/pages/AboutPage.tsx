import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Heart,
  Award,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          About Raj Medicare, Talcher
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Trusted Neighborhood Healthcare & Pharmacy Partner
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {settings.aboutText}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Authentic Dispensary</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We store and dispense 100% genuine pharmaceutical drugs, cold-chain biologics, baby
            care products, surgical disposables, and personal health supplies with strict
            expiration tracking.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Visiting Doctor Consultations</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminating the need to travel long distances for quality clinical consultations. We
            host visiting medical specialists on pre-scheduled days with organized appointment
            queues.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Open 16 Hours Every Day</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Open from 7:00 AM to 11:00 PM throughout the year. Whether you need immediate morning
            antipyretics or late-night prescription emergency supplies, our team is at your
            service.
          </p>
        </div>
      </div>

      {/* Facilities & Setup */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Store Facilities & Patient Amenities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Built for comfort, privacy, and hygiene at Bharatpur Market Complex.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Private Consultation Chamber</span>
              <p className="text-slate-500 mt-0.5">
                Clean, quiet doctor examination chamber equipped with examination couch and primary
                diagnostic tools.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Air-Conditioned Waiting Lounge</span>
              <p className="text-slate-500 mt-0.5">
                Comfortable seating for visiting patients, elderly individuals, and pregnant women
                with digital queue display.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Controlled Temperature Storage</span>
              <p className="text-slate-500 mt-0.5">
                Dedicated medical refrigerators for insulins, vaccines, and heat-sensitive drops
                with 24/7 power backup.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Computerized Billing & Records</span>
              <p className="text-slate-500 mt-0.5">
                Transparent itemized GST invoices, instant digital check-ins, and accurate medicine
                lot tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location / Action CTA */}
      <div className="bg-teal-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold">Have questions or need to see a doctor?</h3>
          <p className="text-xs sm:text-sm text-teal-200">
            Book an appointment online or visit our store in FCI Township today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/book')}
            className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Book Appointment
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            Store Directions
          </button>
        </div>
      </div>
    </div>
  );
};
