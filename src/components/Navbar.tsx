import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  MessageCircle,
  Menu,
  X,
  Calendar,
  Pill,
  ShoppingBag,
  Shield,
  Clock,
  MapPin,
  Search,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { settings, cart, setIsCartOpen, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Visiting Doctors', path: '/doctors' },
    { label: 'Medicines', path: '/medicines' },
    { label: 'My Appointments', path: '/my-appointments' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = settings.phone.replace(/\D/g, '');
  const cleanWhatsApp = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro bar: Store timing & Quick Contact */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>{settings.openingHours}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="truncate max-w-md">Bharatpur Market Complex, FCI Township, Talcher</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <Phone className="w-3 h-3 text-teal-400" />
              <span>{settings.phone}</span>
            </a>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20have%20an%20enquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-800 text-teal-200 text-[11px] font-semibold hover:bg-teal-700 transition"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 group-hover:bg-teal-700 text-white flex items-center justify-center shadow-sm shadow-teal-600/30 transition">
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
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition">
                {settings.businessName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Talcher
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Pharmacy & Visiting Doctors</p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart / Enquiry Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            title="Medicine Enquiry List"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-[11px] font-bold w-5 h-5 rounded-md flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA: Book Doctor Appointment */}
          <button
            onClick={() => handleNav('/book')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm shadow-teal-600/30 transition hover:shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNav('/book')}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${cleanPhone}`}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>Call Store</span>
              </a>
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20want%20to%20enquire%20about%20visiting%20doctors.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-50"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => handleNav('/admin')}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clinic Staff & Admin Login →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
