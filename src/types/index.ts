export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  gender?: 'male' | 'female' | 'other';
  bio: string;
  areasOfConsultation?: string;
  consultationFee: number;
  phone?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleStatus =
  | 'upcoming'
  | 'available'
  | 'almost_full'
  | 'fully_booked'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'hidden';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorPhotoUrl?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h or formatted)
  endTime: string; // HH:mm
  slotDurationMinutes: number;
  maxPatients: number;
  consultationFee: number;
  bookedCount: number;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SlotStatus = 'available' | 'booked' | 'cancelled' | 'blocked';

export interface AppointmentSlot {
  id: string;
  scheduleId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  appointmentId?: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  appointmentNumber: string; // RM-YYYYMMDD-XXX
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorPhotoUrl?: string;
  scheduleId: string;
  slotId: string;
  date: string;
  time: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  reasonForVisit?: string;
  isExistingPatient: boolean;
  emergencyContact?: string;
  consultationFee: number;
  status: AppointmentStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicineCategory =
  | 'Fever & Pain'
  | 'Cold & Cough'
  | 'Diabetes'
  | 'Blood Pressure'
  | 'Vitamins & Supplements'
  | 'Digestive Care'
  | 'Skin Care'
  | 'Baby Care'
  | 'Personal Care'
  | 'First Aid'
  | 'Medical Devices'
  | 'Other';

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  genericName?: string;
  category: MedicineCategory;
  description: string;
  packSize: string;
  price: number;
  discount?: number;
  imageUrl?: string;
  isAvailable: boolean;
  prescriptionRequired: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export type MedicineRequestStatus =
  | 'new_request'
  | 'prescription_review'
  | 'accepted'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface MedicineRequest {
  id: string;
  requestNumber: string; // MED-YYYYMMDD-XXX
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  pincode: string;
  notes?: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    price: number;
    packSize: string;
  }[];
  prescriptionUrl?: string;
  prescriptionFileName?: string;
  status: MedicineRequestStatus;
  estimatedTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  id: string;
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  openingHours: string;
  aboutText: string;
  heroHeading: string;
  heroSubheading: string;
  emergencyDisclaimer: string;
  deliveryAvailable: boolean;
  deliveryAreas: string;
  cancellationWindowHours: number;
  customDomain?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export type ReviewServiceType = 'doctor_consultation' | 'pharmacy_delivery' | 'general_care';
export type ReviewStatus = 'approved' | 'pending' | 'hidden';

export interface PatientReview {
  id: string;
  patientName: string;
  locality: string; // e.g. "FCI Township", "Bharatpur Colony", "N.S. Nagar", "Talcher Town"
  serviceType: ReviewServiceType;
  doctorName?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedVisit: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

