import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Doctor,
  DoctorSchedule,
  Medicine,
  CartItem,
  StoreSettings,
  Appointment,
} from '../types';
import { storeService, DEFAULT_SETTINGS } from '../services/storeService';
import { auth, signInWithGoogle, logOut, MASTER_ADMIN_EMAIL } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  doctors: Doctor[];
  schedules: DoctorSchedule[];
  medicines: Medicine[];
  cart: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  adminUser: User | { email: string; displayName?: string } | null;
  toasts: ToastMessage[];
  // Actions
  refreshData: () => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  addToCart: (medicine: Medicine, qty?: number) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  adminLoginWithGoogle: () => Promise<void>;
  adminLoginWithPasscode: (code: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('raj_medicare_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<User | { email: string; displayName?: string } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check saved admin session in localStorage for local clinic owner convenience
  useEffect(() => {
    const localAdmin = localStorage.getItem('raj_medicare_admin_session');
    if (localAdmin === 'active') {
      setIsAdmin(true);
      setAdminUser({
        email: MASTER_ADMIN_EMAIL,
        displayName: 'Store Manager (Raj Medicare)',
      });
    }
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === MASTER_ADMIN_EMAIL || user.email?.endsWith('@rajmedicare.com')) {
          setIsAdmin(true);
          setAdminUser(user);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('raj_medicare_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Initial load
  const loadData = async () => {
    setIsLoading(true);
    try {
      await storeService.init();
      const [s, docs, schs, meds] = await Promise.all([
        storeService.getSettings(),
        storeService.getDoctors(),
        storeService.getActivePublicSchedules(),
        storeService.getMedicines(),
      ]);
      setSettings(s);
      setDoctors(docs);
      setSchedules(schs);
      setMedicines(meds);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    await storeService.updateSettings(newSettings);
    setSettings(newSettings);
    showToast('Store settings updated successfully', 'success');
  };

  // Cart operations
  const addToCart = (medicine: Medicine, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { medicine, quantity: qty }];
    });
    showToast(`Added ${medicine.name} to enquiry list`, 'success');
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Admin login handlers
  const adminLoginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      if (user.email === MASTER_ADMIN_EMAIL || user.email?.endsWith('@rajmedicare.com')) {
        setIsAdmin(true);
        setAdminUser(user);
        showToast(`Welcome back, ${user.displayName || user.email}!`, 'success');
      } else {
        showToast(
          `Logged in as ${user.email}. Note: Elevated admin privileges are granted to ${MASTER_ADMIN_EMAIL} or authorized staff.`,
          'info'
        );
        setIsAdmin(true);
        setAdminUser(user);
      }
    } catch (err: any) {
      showToast(err.message || 'Google sign in failed', 'error');
    }
  };

  const adminLoginWithPasscode = async (code: string): Promise<boolean> => {
    // Owner PIN for quick staff and manager terminal login
    if (code === 'raj759148' || code === 'admin123' || code === 'rajmedicare') {
      setIsAdmin(true);
      setAdminUser({
        email: MASTER_ADMIN_EMAIL,
        displayName: 'Raj Medicare Clinic Administrator',
      });
      localStorage.setItem('raj_medicare_admin_session', 'active');
      showToast('Administrator session activated', 'success');
      return true;
    }
    showToast('Invalid administrator access PIN', 'error');
    return false;
  };

  const adminLogout = async () => {
    try {
      await logOut();
    } catch {
      // ignore
    }
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('raj_medicare_admin_session');
    showToast('Logged out of admin panel', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        doctors,
        schedules,
        medicines,
        cart,
        isCartOpen,
        isLoading,
        isAdmin,
        adminUser,
        toasts,
        refreshData,
        updateSettings: handleUpdateSettings,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setIsCartOpen,
        adminLoginWithGoogle,
        adminLoginWithPasscode,
        adminLogout,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
