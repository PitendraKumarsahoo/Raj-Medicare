import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  Shield,
  Heart,
  Calendar,
  Pill,
} from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStore();

  const cleanPhone = settings.phone.replace(/\D/g, '');
  const cleanWhatsApp = settings.whatsappNumber.replace(/\D/g, '');

  const handleLink = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4v16m-8-8h16" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  {settings.businessName}
                </span>
                <p className="text-xs text-teal-400 font-medium">Talcher, Odisha</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your reliable neighborhood pharmacy and visiting doctor consultation center.
              Providing authentic medicines, scheduled expert doctors, and compassionate healthcare
              for Talcher residents.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Call Store</span>
              </a>
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20have%20an%20enquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-medium border border-emerald-800/60 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Directions</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Healthcare Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handleLink('/doctors')}
                  className="hover:text-teal-400 transition"
                >
                  Visiting Doctor Timetable
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/book')}
                  className="hover:text-teal-400 transition font-semibold text-teal-300"
                >
                  Book Doctor Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/medicines')}
                  className="hover:text-teal-400 transition"
                >
                  Browse Medicine Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/my-appointments')}
                  className="hover:text-teal-400 transition"
                >
                  My Booked Appointments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/about')}
                  className="hover:text-teal-400 transition"
                >
                  About Raj Medicare
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/contact')}
                  className="hover:text-teal-400 transition"
                >
                  Contact & Store Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Store Hours & Delivery */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Store Timings & Delivery
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Opening Hours</span>
                  <p className="mt-0.5">{settings.openingHours}</p>
                  <p className="text-[11px] text-teal-400 mt-0.5">Open All 7 Days</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Local Delivery Areas</span>
                  <p className="mt-0.5 leading-relaxed">{settings.deliveryAreas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Address */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Store Location
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="leading-relaxed text-slate-300 font-medium">{settings.address}</p>

              <div className="pt-1">
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                <span>Landmark: Bharatpur Market Complex, FCI Township</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency notice */}
        <div className="mt-12 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500 text-center max-w-4xl mx-auto leading-relaxed">
            <strong className="text-slate-400">Medical Disclaimer:</strong>{' '}
            {settings.emergencyDisclaimer}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Raj Medicare, Talcher. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleLink('/privacy')}
              className="hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleLink('/terms')}
              className="hover:text-slate-300 transition"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => handleLink('/admin')}
              className="hover:text-teal-400 text-slate-400 flex items-center gap-1 transition"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
