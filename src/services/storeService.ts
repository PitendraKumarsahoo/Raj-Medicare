import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import {
  Doctor,
  DoctorSchedule,
  AppointmentSlot,
  Appointment,
  Medicine,
  MedicineRequest,
  StoreSettings,
  AuditLog,
  PatientReview,
} from '../types';
import {
  getTodayISTDateString,
  isScheduleExpired,
  generateTimeSlots,
  computeEffectiveScheduleStatus,
  getNowInIST,
} from '../utils/time';

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 'main_settings',
  businessName: 'Raj Medicare',
  tagline: 'Licensed Pharmacy & Visiting Specialist Clinics in Talcher',
  phone: '+91 94371 88920',
  whatsappNumber: '+91 94371 88920',
  email: 'rajmedicare.talcher@gmail.com',
  address: 'Shop No. 39, Bharatpur Market Complex, N.S. Nagar, FCI Township, Talcher, Angul, Odisha - 759148',
  googleMapsUrl: 'https://maps.google.com/?q=Bharatpur+Market+Complex+Talcher+Odisha+759148',
  openingHours: 'Every day: 7:00 AM to 11:00 PM',
  aboutText: 'Raj Medicare serves the FCI Township, Bharatpur, and greater Talcher community with dependable pharmacy essentials and scheduled visits from experienced consultant physicians and specialists. We provide verified medicines, compassionate patient care, and convenient appointment booking right in your neighborhood.',
  heroHeading: 'Licensed Pharmacy & Visiting Doctor Clinics in Talcher',
  heroSubheading: 'Book confirmed consultation slots with qualified visiting physicians at Bharatpur Market Complex. Order authentic medicines with local delivery across FCI Township.',
  emergencyDisclaimer: "For medical emergencies, please contact emergency services (108/112) or visit the nearest hospital emergency department. Raj Medicare's online appointment system is not an emergency service.",
  deliveryAvailable: true,
  deliveryAreas: 'FCI Township, Bharatpur, N.S. Nagar, Talcher Town, Handidhua, Deulabeda & Nearby Localities',
  cancellationWindowHours: 2,
  customDomain: 'rajmedicare.in',
  updatedAt: new Date().toISOString(),
};

// Initial Seed Doctors
export const INITIAL_DOCTORS: Omit<Doctor, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'doc-patnaik',
    name: 'Dr. B. K. Patnaik',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    specialization: 'General Physician',
    qualification: 'MBBS, MD (Medicine)',
    experienceYears: 14,
    gender: 'male',
    bio: 'Senior physician with over 14 years of clinical experience in managing chronic adult illnesses, lifestyle disorders, hypertension, diabetes, and acute infectious conditions.',
    areasOfConsultation: 'Diabetes, Hypertension, Seasonal Infections, Adult Health, Preventive Health Checkups',
    consultationFee: 500,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 1,
  },
  {
    id: 'doc-mishra',
    name: 'Dr. Smruti Rekha Mishra',
    photoUrl: 'https://images.unsplash.com/photo-1594824813583-057088b9016c?w=400&auto=format&fit=crop&q=80',
    specialization: 'Gynecologist & Obstetrician',
    qualification: 'MBBS, MS (O&G), DGO',
    experienceYears: 11,
    gender: 'female',
    bio: 'Dedicated women’s health specialist with extensive expertise in maternal care, adolescent gynecology, fertility advice, and hormonal balance.',
    areasOfConsultation: 'Antenatal Care, PCOD/PCOS Management, Infertility, Women Wellness, Menstrual Disorders',
    consultationFee: 600,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 2,
  },
  {
    id: 'doc-sahoo',
    name: 'Dr. Ashish Kumar Sahoo',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    specialization: 'Pediatrician & Child Specialist',
    qualification: 'MBBS, MD (Pediatrics)',
    experienceYears: 9,
    gender: 'male',
    bio: 'Caring child specialist focusing on newborn care, developmental milestones, childhood immunizations, asthma, and common pediatric infections.',
    areasOfConsultation: 'Newborn Care, Child Vaccination, Pediatric Nutrition, Seasonal Allergies, Growth Monitoring',
    consultationFee: 500,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 3,
  },
  {
    id: 'doc-mohapatra',
    name: 'Dr. R. K. Mohapatra',
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
    specialization: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Ortho), DNB',
    experienceYears: 16,
    gender: 'male',
    bio: 'Experienced orthopedic consultant treating joint pain, sports injuries, arthritis, back pain, and bone density disorders.',
    areasOfConsultation: 'Knee & Joint Pain, Arthritis, Spine & Back Care, Fracture Management, Sports Injuries',
    consultationFee: 650,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 4,
  },
  {
    id: 'doc-das',
    name: 'Dr. Priyadarshini Das',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    specialization: 'Dermatologist & Cosmetologist',
    qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 8,
    gender: 'female',
    bio: 'Expert dermatologist specializing in skin allergies, acne, eczema, fungal infections, hair fall solutions, and clinical cosmetology.',
    areasOfConsultation: 'Acne & Scars, Chronic Eczema, Psoriasis, Fungal Infections, Hair Loss, Skin Pigmentation',
    consultationFee: 600,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 5,
  },
  {
    id: 'doc-tripathy',
    name: 'Dr. Subrat Tripathy',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experienceYears: 15,
    gender: 'male',
    bio: 'Visiting cardiologist providing comprehensive cardiovascular consultation, hypertension control, ECG interpretation, and heart wellness advice.',
    areasOfConsultation: 'Heart Disease Prevention, Chest Discomfort Evaluation, Post-Angioplasty Care, Cholesterol Management',
    consultationFee: 800,
    phone: '+91 94371 88920',
    status: 'active',
    displayOrder: 6,
  },
];

// Initial Medicines Catalog
export const INITIAL_MEDICINES: Omit<Medicine, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'med-dolo650',
    name: 'Dolo 650 Tablet',
    brand: 'Micro Labs Ltd',
    genericName: 'Paracetamol 650mg',
    category: 'Fever & Pain',
    description: 'Relieves mild to moderate pain and reduces high fever. Gentle on the stomach when taken as advised.',
    packSize: '15 Tablets / Strip',
    price: 34,
    discount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: 'med-combiflam',
    name: 'Combiflam Tablet',
    brand: 'Sanofi India',
    genericName: 'Ibuprofen 400mg + Paracetamol 325mg',
    category: 'Fever & Pain',
    description: 'Dual-action combination for fast relief from headache, muscular pain, dental aches, and joint discomfort.',
    packSize: '20 Tablets / Strip',
    price: 48,
    discount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: 'med-alex-syrup',
    name: 'Alex Cough Syrup',
    brand: 'Glenmark Pharmaceuticals',
    genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine',
    category: 'Cold & Cough',
    description: 'Effective soothing formula for relief from dry cough, allergic throat tickle, and blocked nose.',
    packSize: '100 ml Bottle',
    price: 135,
    discount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: 'med-glycomet',
    name: 'Glycomet-GP 1 Tablet',
    brand: 'USV Pvt Ltd',
    genericName: 'Metformin 500mg + Glimepiride 1mg',
    category: 'Diabetes',
    description: 'Oral anti-diabetic medicine prescribed for the management of type 2 diabetes along with proper diet and exercise.',
    packSize: '15 Tablets / Strip',
    price: 145,
    discount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: true,
    stockStatus: 'in_stock',
    featured: false,
  },
  {
    id: 'med-telma40',
    name: 'Telma 40 Tablet',
    brand: 'Glenmark Pharmaceuticals',
    genericName: 'Telmisartan 40mg',
    category: 'Blood Pressure',
    description: 'Cardiovascular medication used to lower high blood pressure and protect kidney function in hypertensive patients.',
    packSize: '30 Tablets / Pack',
    price: 245,
    discount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: true,
    stockStatus: 'in_stock',
    featured: false,
  },
  {
    id: 'med-shelcal500',
    name: 'Shelcal 500 Tablet',
    brand: 'Torrent Pharmaceuticals',
    genericName: 'Calcium 500mg + Vitamin D3 250 IU',
    category: 'Vitamins & Supplements',
    description: 'Supports bone strength, joint mobility, and maintains healthy calcium levels in adults and elderly.',
    packSize: '15 Tablets / Strip',
    price: 128,
    discount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: 'med-pantocid40',
    name: 'Pantocid 40 Tablet',
    brand: 'Sun Pharma',
    genericName: 'Pantoprazole 40mg',
    category: 'Digestive Care',
    description: 'Proton-pump inhibitor providing long-lasting relief from acid reflux, heartburn, and gastric ulcers.',
    packSize: '15 Tablets / Strip',
    price: 165,
    discount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: true,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: 'med-betadine',
    name: 'Betadine 10% Antiseptic Ointment',
    brand: 'Win-Medicare',
    genericName: 'Povidone-Iodine 10% w/w',
    category: 'First Aid',
    description: 'Broad-spectrum microbicidal antiseptic ointment for preventing infection in cuts, wounds, abrasions, and burns.',
    packSize: '20g Tube',
    price: 115,
    discount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: false,
  },
  {
    id: 'med-bp-monitor',
    name: 'Dr. Morepen Digital Blood Pressure Monitor BP-02',
    brand: 'Dr. Morepen',
    genericName: 'Fully Automatic Upper Arm BP Monitor',
    category: 'Medical Devices',
    description: 'Accurate clinical-grade digital blood pressure monitor with WHO blood pressure indicator and large LCD display.',
    packSize: '1 Unit',
    price: 1450,
    discount: 250,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    prescriptionRequired: false,
    stockStatus: 'in_stock',
    featured: true,
  },
];

// Initial Verified Patient & Community Testimonials
export const INITIAL_REVIEWS: Omit<PatientReview, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'rev-mohanty',
    patientName: 'Subrat Mohanty',
    locality: 'FCI Township, Sector 2',
    serviceType: 'doctor_consultation',
    doctorName: 'Dr. B. K. Patnaik',
    rating: 5,
    title: 'No need to travel to Cuttack for routine consultation',
    comment: 'Earlier we had to travel all the way to Cuttack or Angul for Dr. Patnaik’s opinion. Having his visiting OPD right here at Bharatpur Market Complex saved extensive travel for my mother’s diabetic management.',
    verifiedVisit: true,
    status: 'approved',
  },
  {
    id: 'rev-pradhan',
    patientName: 'Deepika Pradhan',
    locality: 'N.S. Nagar, Talcher',
    serviceType: 'pharmacy_delivery',
    rating: 5,
    title: 'Prompt medicine delivery in FCI Colony',
    comment: 'Ordered regular BP tablets and calcium strips via the website enquiry. Pharmacist called within 15 minutes, verified the prescription, and delivered to our home in under an hour with proper GST bill.',
    verifiedVisit: true,
    status: 'approved',
  },
  {
    id: 'rev-sahu',
    patientName: 'Alok Kumar Sahu',
    locality: 'Bharatpur Market Area',
    serviceType: 'doctor_consultation',
    doctorName: 'Dr. Ashish Kumar Sahoo',
    rating: 5,
    title: 'Child specialist appointment was completely on time',
    comment: 'The time slot reservation is reliable. We selected a 6:45 PM slot, checked in with our appointment number at reception, and consulted Dr. Sahoo without sitting in crowded waiting areas.',
    verifiedVisit: true,
    status: 'approved',
  },
  {
    id: 'rev-behera',
    patientName: 'Manoranjan Behera',
    locality: 'Handidhua, Talcher',
    serviceType: 'doctor_consultation',
    doctorName: 'Dr. R. K. Mohapatra',
    rating: 5,
    title: 'Exceptional orthopedic consultation',
    comment: 'Consulted Dr. Mohapatra for chronic knee stiffness and arthritis. He explained the exercises patiently and prescribed effective medication. All prescribed tablets were available right at the counter.',
    verifiedVisit: true,
    status: 'approved',
  },
  {
    id: 'rev-rout',
    patientName: 'Priyanka Rout',
    locality: 'FCI Township',
    serviceType: 'general_care',
    rating: 5,
    title: 'Reliable 7 AM to 11 PM emergency pharmacy',
    comment: 'Needed pediatric nebulizer drops at 10 PM. Most other medical shops in the area were closed, but Raj Medicare was open and had the exact prescribed medication in stock.',
    verifiedVisit: true,
    status: 'approved',
  },
];

// Helper to seed initial sample schedules
export function generateInitialSchedules(doctors: Doctor[]): {
  schedule: Omit<DoctorSchedule, 'createdAt' | 'updatedAt'>;
  slots: { startTime: string; endTime: string }[];
}[] {
  const todayStr = getTodayISTDateString();
  const [y, m, d] = todayStr.split('-').map(Number);

  // Tomorrow
  const tomDate = new Date(y, m - 1, d + 1);
  const tomorrowStr = `${tomDate.getFullYear()}-${String(tomDate.getMonth() + 1).padStart(2, '0')}-${String(tomDate.getDate()).padStart(2, '0')}`;

  // Day after tomorrow
  const datDate = new Date(y, m - 1, d + 2);
  const datStr = `${datDate.getFullYear()}-${String(datDate.getMonth() + 1).padStart(2, '0')}-${String(datDate.getDate()).padStart(2, '0')}`;

  const schedulesToCreate = [
    // Today evening schedule 1
    {
      id: `sch-${todayStr}-patnaik`,
      doctorId: 'doc-patnaik',
      doctorName: 'Dr. B. K. Patnaik',
      doctorSpecialization: 'General Physician',
      doctorPhotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      date: todayStr,
      startTime: '17:00',
      endTime: '20:00',
      slotDurationMinutes: 15,
      maxPatients: 12,
      consultationFee: 500,
      bookedCount: 2,
      status: 'available' as const,
      notes: 'Evening visiting clinic. Walk-ins subject to slot availability.',
    },
    // Today evening schedule 2
    {
      id: `sch-${todayStr}-sahoo`,
      doctorId: 'doc-sahoo',
      doctorName: 'Dr. Ashish Kumar Sahoo',
      doctorSpecialization: 'Pediatrician & Child Specialist',
      doctorPhotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
      date: todayStr,
      startTime: '18:30',
      endTime: '20:30',
      slotDurationMinutes: 15,
      maxPatients: 8,
      consultationFee: 500,
      bookedCount: 1,
      status: 'available' as const,
      notes: 'Child immunization & fever consultation clinic.',
    },
    // Tomorrow schedule 1
    {
      id: `sch-${tomorrowStr}-mishra`,
      doctorId: 'doc-mishra',
      doctorName: 'Dr. Smruti Rekha Mishra',
      doctorSpecialization: 'Gynecologist & Obstetrician',
      doctorPhotoUrl: 'https://images.unsplash.com/photo-1594824813583-057088b9016c?w=400&auto=format&fit=crop&q=80',
      date: tomorrowStr,
      startTime: '16:00',
      endTime: '19:00',
      slotDurationMinutes: 20,
      maxPatients: 9,
      consultationFee: 600,
      bookedCount: 0,
      status: 'upcoming' as const,
      notes: 'Women wellness & antenatal checkup clinic.',
    },
    // Tomorrow schedule 2
    {
      id: `sch-${tomorrowStr}-mohapatra`,
      doctorId: 'doc-mohapatra',
      doctorName: 'Dr. R. K. Mohapatra',
      doctorSpecialization: 'Orthopedic Surgeon',
      doctorPhotoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
      date: tomorrowStr,
      startTime: '17:30',
      endTime: '20:30',
      slotDurationMinutes: 15,
      maxPatients: 12,
      consultationFee: 650,
      bookedCount: 0,
      status: 'upcoming' as const,
      notes: 'Joint pain, arthritis & spine evaluation clinic.',
    },
    // Day after tomorrow schedule
    {
      id: `sch-${datStr}-tripathy`,
      doctorId: 'doc-tripathy',
      doctorName: 'Dr. Subrat Tripathy',
      doctorSpecialization: 'Cardiologist',
      doctorPhotoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
      date: datStr,
      startTime: '10:00',
      endTime: '13:00',
      slotDurationMinutes: 20,
      maxPatients: 9,
      consultationFee: 800,
      bookedCount: 0,
      status: 'upcoming' as const,
      notes: 'Special monthly cardiac screening clinic in Talcher.',
    },
  ];

  return schedulesToCreate.map((sch) => {
    const slots = generateTimeSlots(sch.startTime, sch.endTime, sch.slotDurationMinutes, sch.maxPatients);
    return { schedule: sch, slots };
  });
}

/**
 * Service singleton
 */
class StoreService {
  private localDoctors: Doctor[] = [];
  private localSchedules: DoctorSchedule[] = [];
  private localMedicines: Medicine[] = [];
  private localReviews: PatientReview[] = [];
  private localAppointments: Appointment[] = [];
  private localSettings: StoreSettings = DEFAULT_SETTINGS;
  private isInitialized = false;

  /**
   * Initializes store with database check & auto-seeding if Firestore is empty
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Fetch settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'main_settings'));
      if (settingsDoc.exists()) {
        this.localSettings = settingsDoc.data() as StoreSettings;
      } else {
        // Seed default settings
        try {
          await setDoc(doc(db, 'settings', 'main_settings'), DEFAULT_SETTINGS);
          this.localSettings = DEFAULT_SETTINGS;
        } catch {
          this.localSettings = DEFAULT_SETTINGS;
        }
      }

      // 2. Fetch doctors
      const doctorsSnap = await getDocs(collection(db, 'doctors'));
      if (!doctorsSnap.empty) {
        this.localDoctors = doctorsSnap.docs.map((d) => d.data() as Doctor);
      } else {
        // Seed doctors
        const seededDocs: Doctor[] = [];
        for (const docData of INITIAL_DOCTORS) {
          const item: Doctor = {
            ...docData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, 'doctors', item.id), item);
          } catch {
            // fallback locally
          }
          seededDocs.push(item);
        }
        this.localDoctors = seededDocs;
      }

      // 3. Fetch schedules
      const schedulesSnap = await getDocs(collection(db, 'doctor_schedules'));
      if (!schedulesSnap.empty) {
        this.localSchedules = schedulesSnap.docs.map((d) => d.data() as DoctorSchedule);
      } else {
        // Seed schedules and slots
        const seededSchedules: DoctorSchedule[] = [];
        const initialSchs = generateInitialSchedules(this.localDoctors);
        for (const item of initialSchs) {
          const schRecord: DoctorSchedule = {
            ...item.schedule,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, 'doctor_schedules', schRecord.id), schRecord);
            // write slots to subcollection
            for (let i = 0; i < item.slots.length; i++) {
              const slotTime = item.slots[i];
              const slotId = `slot-${i + 1}`;
              const slotDoc: AppointmentSlot = {
                id: slotId,
                scheduleId: schRecord.id,
                doctorId: schRecord.doctorId,
                date: schRecord.date,
                startTime: slotTime.startTime,
                endTime: slotTime.endTime,
                status: i < schRecord.bookedCount ? 'booked' : 'available',
              };
              await setDoc(doc(db, 'doctor_schedules', schRecord.id, 'slots', slotId), slotDoc);
            }
          } catch {
            // fallback
          }
          seededSchedules.push(schRecord);
        }
        this.localSchedules = seededSchedules;
      }

      // 4. Fetch medicines
      const medicinesSnap = await getDocs(collection(db, 'medicines'));
      if (!medicinesSnap.empty) {
        this.localMedicines = medicinesSnap.docs.map((d) => d.data() as Medicine);
      } else {
        const seededMeds: Medicine[] = [];
        for (const medData of INITIAL_MEDICINES) {
          const item: Medicine = {
            ...medData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, 'medicines', item.id), item);
          } catch {
            // fallback
          }
          seededMeds.push(item);
        }
        this.localMedicines = seededMeds;
      }

      // 5. Fetch reviews
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      if (!reviewsSnap.empty) {
        this.localReviews = reviewsSnap.docs.map((d) => d.data() as PatientReview);
      } else {
        const seededRevs: PatientReview[] = [];
        for (const revData of INITIAL_REVIEWS) {
          const item: PatientReview = {
            ...revData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, 'reviews', item.id), item);
          } catch {
            // fallback
          }
          seededRevs.push(item);
        }
        this.localReviews = seededRevs;
      }

      // 6. Fetch appointments
      const appointmentsSnap = await getDocs(collection(db, 'appointments'));
      if (!appointmentsSnap.empty) {
        this.localAppointments = appointmentsSnap.docs.map((d) => d.data() as Appointment);
      } else {
        const tomorrow = new Date(Date.now() + 86400000);
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        const sampleNumber = `RM-${tomorrowStr.replace(/-/g, '')}-101`;
        const sampleAppointment: Appointment = {
          id: 'apt-sample-upcoming',
          appointmentNumber: sampleNumber,
          doctorId: 'doc-mishra',
          doctorName: 'Dr. Smruti Rekha Mishra',
          doctorSpecialization: 'Gynecologist & Obstetrician',
          doctorPhotoUrl: 'https://images.unsplash.com/photo-1594824813583-057088b9016c?w=400&auto=format&fit=crop&q=80',
          scheduleId: `sch-${tomorrowStr}-mishra`,
          slotId: 'slot-1',
          date: tomorrowStr,
          time: '16:00',
          patientName: 'Sasmita Sahoo',
          patientAge: 32,
          patientGender: 'female',
          patientPhone: '9437188920',
          patientEmail: 'patient@example.com',
          patientAddress: 'Bharatpur, Talcher',
          reasonForVisit: 'Routine wellness & antenatal checkup',
          isExistingPatient: true,
          emergencyContact: '+91 94371 88920',
          consultationFee: 600,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'appointments', sampleAppointment.id), sampleAppointment);
        } catch {
          // fallback
        }
        this.localAppointments = [sampleAppointment];
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('Firestore initial sync note (will use in-memory state if offline):', err);
      // Ensure we have at least local fallback data
      const tomorrow = new Date(Date.now() + 86400000);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      if (this.localAppointments.length === 0) {
        this.localAppointments = [
          {
            id: 'apt-sample-upcoming',
            appointmentNumber: `RM-${tomorrowStr.replace(/-/g, '')}-101`,
            doctorId: 'doc-mishra',
            doctorName: 'Dr. Smruti Rekha Mishra',
            doctorSpecialization: 'Gynecologist & Obstetrician',
            doctorPhotoUrl: 'https://images.unsplash.com/photo-1594824813583-057088b9016c?w=400&auto=format&fit=crop&q=80',
            scheduleId: `sch-${tomorrowStr}-mishra`,
            slotId: 'slot-1',
            date: tomorrowStr,
            time: '16:00',
            patientName: 'Sasmita Sahoo',
            patientAge: 32,
            patientGender: 'female',
            patientPhone: '9437188920',
            patientEmail: 'patient@example.com',
            patientAddress: 'Bharatpur, Talcher',
            reasonForVisit: 'Routine wellness & antenatal checkup',
            isExistingPatient: true,
            emergencyContact: '+91 94371 88920',
            consultationFee: 600,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      if (this.localDoctors.length === 0) {
        this.localDoctors = INITIAL_DOCTORS.map((d) => ({
          ...d,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      if (this.localSchedules.length === 0) {
        this.localSchedules = generateInitialSchedules(this.localDoctors).map((s) => ({
          ...s.schedule,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      if (this.localMedicines.length === 0) {
        this.localMedicines = INITIAL_MEDICINES.map((m) => ({
          ...m,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      if (this.localReviews.length === 0) {
        this.localReviews = INITIAL_REVIEWS.map((r) => ({
          ...r,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      this.isInitialized = true;
    }
  }

  // Settings
  async getSettings(): Promise<StoreSettings> {
    await this.init();
    return this.localSettings;
  }

  async updateSettings(settings: StoreSettings): Promise<void> {
    const updated = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'settings', 'main_settings'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/main_settings');
    }
    this.localSettings = updated;
    await this.addAuditLog('Updated website and contact settings', 'settings', 'main_settings');
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'doctors'));
      if (!snap.empty) {
        this.localDoctors = snap.docs.map((d) => d.data() as Doctor);
      }
    } catch {
      // return local cached
    }
    return [...this.localDoctors].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    const doctors = await this.getDoctors();
    return doctors.find((d) => d.id === id);
  }

  async saveDoctor(doctor: Omit<Doctor, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Doctor> {
    const isNew = !doctor.id;
    const docId = doctor.id || `doc-${Date.now()}`;
    const now = new Date().toISOString();

    const existing = this.localDoctors.find((d) => d.id === docId);
    const fullDoctor: Doctor = {
      ...doctor,
      id: docId,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'doctors', docId), fullDoctor);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `doctors/${docId}`);
    }

    if (existing) {
      this.localDoctors = this.localDoctors.map((d) => (d.id === docId ? fullDoctor : d));
      await this.addAuditLog(`Updated doctor profile: ${fullDoctor.name}`, 'doctor', docId);
    } else {
      this.localDoctors.push(fullDoctor);
      await this.addAuditLog(`Added new doctor: ${fullDoctor.name}`, 'doctor', docId);
    }

    return fullDoctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'doctors', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `doctors/${id}`);
    }
    this.localDoctors = this.localDoctors.filter((d) => d.id !== id);
    await this.addAuditLog(`Deleted doctor ID ${id}`, 'doctor', id);
  }

  // Doctor Schedules
  async getAllSchedules(): Promise<DoctorSchedule[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'doctor_schedules'));
      if (!snap.empty) {
        this.localSchedules = snap.docs.map((d) => d.data() as DoctorSchedule);
      }
    } catch {
      // return cached
    }
    return [...this.localSchedules].sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    });
  }

  /**
   * CRITICAL REQUIREMENT:
   * Automatic Schedule Expiration & Public Visibility.
   * If current time in IST has passed the doctor's end time, the schedule is marked Completed
   * and automatically hidden from public booking.
   */
  async getActivePublicSchedules(): Promise<DoctorSchedule[]> {
    const all = await this.getAllSchedules();
    const todayStr = getTodayISTDateString();

    return all.filter((schedule) => {
      // Filter out hidden or cancelled
      if (schedule.status === 'hidden' || schedule.status === 'cancelled') {
        return false;
      }
      // Check expiration in IST
      if (isScheduleExpired(schedule.date, schedule.endTime)) {
        return false;
      }
      // Only show today or future dates
      if (schedule.date < todayStr) {
        return false;
      }
      return true;
    });
  }

  async getScheduleById(id: string): Promise<DoctorSchedule | undefined> {
    const all = await this.getAllSchedules();
    return all.find((s) => s.id === id);
  }

  async createSchedule(params: {
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    maxPatients: number;
    consultationFee: number;
    notes?: string;
  }): Promise<DoctorSchedule> {
    const doctor = await this.getDoctorById(params.doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const scheduleId = `sch-${params.date}-${doctor.id}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newSchedule: DoctorSchedule = {
      id: scheduleId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorPhotoUrl: doctor.photoUrl,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      slotDurationMinutes: params.slotDurationMinutes,
      maxPatients: params.maxPatients,
      consultationFee: params.consultationFee,
      bookedCount: 0,
      status: 'upcoming',
      notes: params.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    // Generate slots
    const generatedSlots = generateTimeSlots(
      params.startTime,
      params.endTime,
      params.slotDurationMinutes,
      params.maxPatients
    );

    try {
      await setDoc(doc(db, 'doctor_schedules', scheduleId), newSchedule);

      for (let i = 0; i < generatedSlots.length; i++) {
        const slot = generatedSlots[i];
        const slotId = `slot-${i + 1}`;
        const slotRecord: AppointmentSlot = {
          id: slotId,
          scheduleId,
          doctorId: doctor.id,
          date: params.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'available',
        };
        await setDoc(doc(db, 'doctor_schedules', scheduleId, 'slots', slotId), slotRecord);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `doctor_schedules/${scheduleId}`);
    }

    this.localSchedules.push(newSchedule);
    await this.addAuditLog(
      `Published schedule for ${doctor.name} on ${params.date} (${params.startTime} - ${params.endTime})`,
      'schedule',
      scheduleId
    );

    return newSchedule;
  }

  async updateScheduleStatus(id: string, status: DoctorSchedule['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'doctor_schedules', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `doctor_schedules/${id}`);
    }
    this.localSchedules = this.localSchedules.map((s) => (s.id === id ? { ...s, status } : s));
    await this.addAuditLog(`Updated schedule ${id} status to ${status}`, 'schedule', id);
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'doctor_schedules', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `doctor_schedules/${id}`);
    }
    this.localSchedules = this.localSchedules.filter((s) => s.id !== id);
    await this.addAuditLog(`Deleted schedule ${id}`, 'schedule', id);
  }

  // Appointment Slots
  async getSlotsForSchedule(scheduleId: string): Promise<AppointmentSlot[]> {
    try {
      const snap = await getDocs(collection(db, 'doctor_schedules', scheduleId, 'slots'));
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as AppointmentSlot)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    } catch {
      // Fallback: generate virtual slots based on schedule
    }

    const schedule = await this.getScheduleById(scheduleId);
    if (!schedule) return [];

    const generated = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDurationMinutes,
      schedule.maxPatients
    );

    return generated.map((s, idx) => ({
      id: `slot-${idx + 1}`,
      scheduleId,
      doctorId: schedule.doctorId,
      date: schedule.date,
      startTime: s.startTime,
      endTime: s.endTime,
      status: 'available',
    }));
  }

  // Appointments Booking & Anti-Duplication
  async bookAppointment(params: {
    scheduleId: string;
    slotId: string;
    patientName: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    patientPhone: string;
    patientEmail?: string;
    patientAddress?: string;
    reasonForVisit?: string;
    isExistingPatient: boolean;
    emergencyContact?: string;
  }): Promise<Appointment> {
    const schedule = await this.getScheduleById(params.scheduleId);
    if (!schedule) {
      throw new Error('Selected visiting schedule does not exist.');
    }

    if (schedule.status === 'cancelled') {
      throw new Error('This doctor visiting schedule has been cancelled.');
    }

    if (isScheduleExpired(schedule.date, schedule.endTime)) {
      throw new Error('This visiting schedule has already ended. Please select another upcoming schedule.');
    }

    // Anti-duplication check: check if same phone already booked this schedule
    const appointmentsSnap = await getDocs(
      query(collection(db, 'appointments'), where('scheduleId', '==', params.scheduleId))
    );
    const existingForPhone = appointmentsSnap.docs.find(
      (d) =>
        (d.data() as Appointment).patientPhone === params.patientPhone &&
        (d.data() as Appointment).status !== 'cancelled'
    );

    if (existingForPhone) {
      throw new Error(
        `A consultation appointment is already booked under phone ${params.patientPhone} for this schedule (${(existingForPhone.data() as Appointment).appointmentNumber}).`
      );
    }

    const dateCompact = schedule.date.replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const appointmentNumber = `RM-${dateCompact}-${randomSuffix}`;
    const appointmentId = `apt-${appointmentNumber.toLowerCase()}`;
    const now = new Date().toISOString();

    const newAppointment: Appointment = {
      id: appointmentId,
      appointmentNumber,
      doctorId: schedule.doctorId,
      doctorName: schedule.doctorName,
      doctorSpecialization: schedule.doctorSpecialization,
      doctorPhotoUrl: schedule.doctorPhotoUrl,
      scheduleId: schedule.id,
      slotId: params.slotId,
      date: schedule.date,
      time: '',
      patientName: params.patientName.trim(),
      patientAge: Number(params.patientAge),
      patientGender: params.patientGender,
      patientPhone: params.patientPhone.trim(),
      patientEmail: params.patientEmail?.trim() || '',
      patientAddress: params.patientAddress?.trim() || '',
      reasonForVisit: params.reasonForVisit?.trim() || '',
      isExistingPatient: params.isExistingPatient,
      emergencyContact: params.emergencyContact?.trim() || '',
      consultationFee: schedule.consultationFee,
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    };

    // Slot update and appointment creation
    try {
      const slotRef = doc(db, 'doctor_schedules', params.scheduleId, 'slots', params.slotId);
      const slotSnap = await getDoc(slotRef);
      if (slotSnap.exists()) {
        const slotData = slotSnap.data() as AppointmentSlot;
        if (slotData.status === 'booked') {
          throw new Error('This time slot was just booked by another patient. Please choose another slot.');
        }
        newAppointment.time = slotData.startTime;
        await updateDoc(slotRef, {
          status: 'booked',
          appointmentId,
        });
      } else {
        newAppointment.time = schedule.startTime;
      }

      await setDoc(doc(db, 'appointments', appointmentId), newAppointment);

      // Increment bookedCount on schedule
      const newBookedCount = (schedule.bookedCount || 0) + 1;
      await updateDoc(doc(db, 'doctor_schedules', schedule.id), {
        bookedCount: newBookedCount,
        status: newBookedCount >= schedule.maxPatients ? 'fully_booked' : schedule.status,
      });

      this.localSchedules = this.localSchedules.map((s) =>
        s.id === schedule.id ? { ...s, bookedCount: newBookedCount } : s
      );
    } catch (err: any) {
      if (err.message && err.message.includes('slot was just booked')) {
        throw err;
      }
      handleFirestoreError(err, OperationType.WRITE, `appointments/${appointmentId}`);
    }

    return newAppointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'appointments'));
      if (!snap.empty) {
        this.localAppointments = snap.docs.map((d) => d.data() as Appointment);
        return [...this.localAppointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch {
      // return empty if query fails
    }
    return [...this.localAppointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async lookupAppointment(appointmentNumber: string, phone: string): Promise<Appointment | null> {
    await this.init();
    const cleanNumber = appointmentNumber.trim().toUpperCase();
    const cleanPhone = phone.trim();

    try {
      const snap = await getDocs(
        query(collection(db, 'appointments'), where('appointmentNumber', '==', cleanNumber))
      );
      if (!snap.empty) {
        const apt = snap.docs[0].data() as Appointment;
        // Verify phone matches (last 10 digits comparison)
        const aptPhoneClean = apt.patientPhone.replace(/\D/g, '').slice(-10);
        const queryPhoneClean = cleanPhone.replace(/\D/g, '').slice(-10);
        if (aptPhoneClean === queryPhoneClean) {
          return apt;
        }
      }
    } catch {
      // fail gracefully
    }

    // Fallback in-memory search
    const foundLocal = this.localAppointments.find((a) => {
      const numMatch = a.appointmentNumber.toUpperCase() === cleanNumber;
      const aptPhoneClean = a.patientPhone.replace(/\D/g, '').slice(-10);
      const queryPhoneClean = cleanPhone.replace(/\D/g, '').slice(-10);
      return numMatch && aptPhoneClean === queryPhoneClean;
    });

    return foundLocal || null;
  }

  async getSampleAppointment(): Promise<Appointment | null> {
    await this.init();
    return this.localAppointments[0] || null;
  }

  async updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
    reason?: string
  ): Promise<void> {
    try {
      const updatePayload: Record<string, any> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (reason) updatePayload.cancellationReason = reason;

      await updateDoc(doc(db, 'appointments', id), updatePayload);

      // If cancelling, free up the slot
      if (status === 'cancelled') {
        const aptDoc = await getDoc(doc(db, 'appointments', id));
        if (aptDoc.exists()) {
          const apt = aptDoc.data() as Appointment;
          if (apt.scheduleId && apt.slotId) {
            try {
              await updateDoc(doc(db, 'doctor_schedules', apt.scheduleId, 'slots', apt.slotId), {
                status: 'available',
                appointmentId: '',
              });
              const sch = await this.getScheduleById(apt.scheduleId);
              if (sch && sch.bookedCount > 0) {
                await updateDoc(doc(db, 'doctor_schedules', sch.id), {
                  bookedCount: Math.max(0, sch.bookedCount - 1),
                });
              }
            } catch {
              // ignore slot release error
            }
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
    }

    await this.addAuditLog(`Updated appointment ${id} status to ${status}`, 'appointment', id);
  }

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'medicines'));
      if (!snap.empty) {
        this.localMedicines = snap.docs.map((d) => d.data() as Medicine);
      }
    } catch {
      // return local
    }
    return this.localMedicines;
  }

  async getMedicineById(id: string): Promise<Medicine | undefined> {
    const meds = await this.getMedicines();
    return meds.find((m) => m.id === id);
  }

  async saveMedicine(medicine: Omit<Medicine, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Medicine> {
    const isNew = !medicine.id;
    const medId = medicine.id || `med-${Date.now()}`;
    const now = new Date().toISOString();

    const existing = this.localMedicines.find((m) => m.id === medId);
    const fullMed: Medicine = {
      ...medicine,
      id: medId,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'medicines', medId), fullMed);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `medicines/${medId}`);
    }

    if (existing) {
      this.localMedicines = this.localMedicines.map((m) => (m.id === medId ? fullMed : m));
      await this.addAuditLog(`Updated medicine: ${fullMed.name}`, 'medicine', medId);
    } else {
      this.localMedicines.push(fullMed);
      await this.addAuditLog(`Added medicine: ${fullMed.name}`, 'medicine', medId);
    }

    return fullMed;
  }

  async deleteMedicine(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'medicines', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `medicines/${id}`);
    }
    this.localMedicines = this.localMedicines.filter((m) => m.id !== id);
    await this.addAuditLog(`Deleted medicine ID ${id}`, 'medicine', id);
  }

  // Medicine Delivery Requests
  async createMedicineRequest(params: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    landmark?: string;
    pincode: string;
    notes?: string;
    items: MedicineRequest['items'];
    prescriptionUrl?: string;
    prescriptionFileName?: string;
    estimatedTotal: number;
  }): Promise<MedicineRequest> {
    const todayCompact = getTodayISTDateString().replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const requestNumber = `MED-${todayCompact}-${rand}`;
    const requestId = `req-${requestNumber.toLowerCase()}`;
    const now = new Date().toISOString();

    const newRequest: MedicineRequest = {
      id: requestId,
      requestNumber,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      deliveryAddress: params.deliveryAddress.trim(),
      landmark: params.landmark?.trim() || '',
      pincode: params.pincode.trim(),
      notes: params.notes?.trim() || '',
      items: params.items,
      prescriptionUrl: params.prescriptionUrl,
      prescriptionFileName: params.prescriptionFileName,
      status: params.prescriptionUrl ? 'prescription_review' : 'new_request',
      estimatedTotal: params.estimatedTotal,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'medicine_requests', requestId), newRequest);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `medicine_requests/${requestId}`);
    }

    return newRequest;
  }

  async getAllMedicineRequests(): Promise<MedicineRequest[]> {
    try {
      const snap = await getDocs(collection(db, 'medicine_requests'));
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as MedicineRequest)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch {
      // return empty
    }
    return [];
  }

  async updateMedicineRequestStatus(
    id: string,
    status: MedicineRequest['status']
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'medicine_requests', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `medicine_requests/${id}`);
    }
    await this.addAuditLog(`Updated medicine delivery request ${id} to ${status}`, 'medicine_request', id);
  }

  // Audit Logs
  async addAuditLog(action: string, entityType: string, entityId: string, details: string = ''): Promise<void> {
    const user = auth.currentUser;
    const adminEmail = user?.email || 'admin@rajmedicare.local';
    const logId = `log-${Date.now()}`;
    const logRecord: AuditLog = {
      id: logId,
      adminEmail,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'audit_logs', logId), logRecord);
    } catch {
      // ignore log write failure
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(collection(db, 'audit_logs'));
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as AuditLog)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch {
      // return empty
    }
    return [];
  }

  // Reviews & Testimonials
  async getApprovedReviews(): Promise<PatientReview[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      if (!snap.empty) {
        this.localReviews = snap.docs.map((d) => d.data() as PatientReview);
      }
    } catch {
      // return cached
    }
    return this.localReviews
      .filter((r) => r.status === 'approved')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAllReviews(): Promise<PatientReview[]> {
    await this.init();
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      if (!snap.empty) {
        this.localReviews = snap.docs.map((d) => d.data() as PatientReview);
      }
    } catch {
      // return cached
    }
    return [...this.localReviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async submitReview(params: {
    patientName: string;
    locality?: string;
    serviceType: PatientReview['serviceType'];
    doctorName?: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<PatientReview> {
    const revId = `rev-${Date.now()}`;
    const now = new Date().toISOString();

    const newReview: PatientReview = {
      id: revId,
      patientName: params.patientName.trim(),
      locality: params.locality?.trim() || 'Talcher, Odisha',
      serviceType: params.serviceType,
      doctorName: params.doctorName?.trim() || undefined,
      rating: Math.max(1, Math.min(5, Math.round(params.rating))),
      title: params.title.trim(),
      comment: params.comment.trim(),
      verifiedVisit: true,
      status: 'approved', // auto-approve for seamless MVP community trust, admin can moderate
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'reviews', revId), newReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${revId}`);
    }

    this.localReviews.unshift(newReview);
    return newReview;
  }

  async updateReviewStatus(id: string, status: PatientReview['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'reviews', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
    }
    this.localReviews = this.localReviews.map((r) => (r.id === id ? { ...r, status } : r));
    await this.addAuditLog(`Updated review ${id} status to ${status}`, 'review', id);
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
    }
    this.localReviews = this.localReviews.filter((r) => r.id !== id);
    await this.addAuditLog(`Deleted review ${id}`, 'review', id);
  }
}

export const storeService = new StoreService();
