import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { CartDrawer } from './components/CartDrawer';
import { EmergencyDisclaimer } from './components/EmergencyDisclaimer';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailsPage } from './pages/DoctorDetailsPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage, TermsPage } from './pages/PoliciesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const { isAdmin } = useStore();

  // Navigation state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [bookingParams, setBookingParams] = useState<{
    doctorId?: string;
    scheduleId?: string;
    slotId?: string;
  }>({});

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Handle URL changes & back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Check if query params exist in path e.g. /book?doc=...&sch=...
    const [pathname, search] = path.split('?');
    if (search) {
      const params = new URLSearchParams(search);
      const doc = params.get('doc');
      const sch = params.get('sch');
      const slot = params.get('slot');
      setBookingParams({
        doctorId: doc || undefined,
        scheduleId: sch || undefined,
        slotId: slot || undefined,
      });
    }

    try {
      window.history.pushState({}, '', path);
    } catch {
      // ignore
    }
    setCurrentPath(pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctorForDetails = (docId: string) => {
    setSelectedDoctorId(docId);
    navigate(`/doctors/${docId}`);
  };

  const handleBookDoctorFromDirectory = (docId: string, schId?: string) => {
    setBookingParams({ doctorId: docId, scheduleId: schId });
    navigate('/book');
  };

  const handleBookScheduleFromDoctorDetails = (
    docId: string,
    schId: string,
    slotId?: string
  ) => {
    setBookingParams({ doctorId: docId, scheduleId: schId, slotId });
    navigate('/book');
  };

  const isCurrentAdminRoute = currentPath.startsWith('/admin');

  // Render appropriate view based on path
  const renderCurrentPage = () => {
    if (currentPath === '/admin') {
      if (!isAdmin) {
        return <AdminLoginPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    if (currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/doctors/')) {
      const docId = selectedDoctorId || currentPath.replace('/doctors/', '');
      return (
        <DoctorDetailsPage
          doctorId={docId}
          navigate={navigate}
          onBookSchedule={handleBookScheduleFromDoctorDetails}
        />
      );
    }

    switch (currentPath) {
      case '/doctors':
        return (
          <DoctorsPage
            navigate={navigate}
            onSelectDoctor={handleSelectDoctorForDetails}
            onBookDoctor={handleBookDoctorFromDirectory}
          />
        );
      case '/book':
        return (
          <BookAppointmentPage
            initialDoctorId={bookingParams.doctorId}
            initialScheduleId={bookingParams.scheduleId}
            initialSlotId={bookingParams.slotId}
            navigate={navigate}
          />
        );
      case '/medicines':
        return <MedicinesPage navigate={navigate} />;
      case '/my-appointments':
        return <MyAppointmentsPage navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/privacy':
        return <PrivacyPolicyPage />;
      case '/terms':
        return <TermsPage />;
      case '/':
      default:
        return (
          <HomePage
            navigate={navigate}
            onSelectDoctorForBooking={(docId, schId) => {
              setBookingParams({ doctorId: docId, scheduleId: schId });
              navigate('/book');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Discreet medical emergency notice */}
      {!isCurrentAdminRoute && <EmergencyDisclaimer />}

      {/* Main Public Navigation */}
      {!isCurrentAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}

      {/* Page Body */}
      <main className="flex-1">{renderCurrentPage()}</main>

      {/* Medicine Delivery Enquiry Drawer */}
      <CartDrawer />

      {/* Global Toast Feedback */}
      <ToastContainer />

      {/* Sticky Mobile Conversion Bar */}
      {!isCurrentAdminRoute && <StickyMobileBar navigate={navigate} />}

      {/* Footer */}
      {!isCurrentAdminRoute && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
