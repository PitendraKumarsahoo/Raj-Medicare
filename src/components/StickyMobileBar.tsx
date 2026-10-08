import React from 'react';
import { useStore } from '../context/StoreContext';
import { Calendar, Phone, MessageCircle } from 'lucide-react';

interface StickyMobileBarProps {
  navigate: (path: string) => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ navigate }) => {
  const { settings } = useStore();

  const cleanPhone = settings.phone.replace(/\D/g, '');
  const cleanWhatsApp = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-2xl">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Book Appointment CTA */}
        <button
          onClick={() => {
            navigate('/book');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Book Appointment</span>
        </button>

        {/* Quick Call */}
        <a
          href={`tel:${cleanPhone}`}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
          aria-label="Call Store"
        >
          <Phone className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Call</span>
        </a>

        {/* Quick WhatsApp */}
        <a
          href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20have%20an%20enquiry.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
        </a>
      </div>
    </div>
  );
};
