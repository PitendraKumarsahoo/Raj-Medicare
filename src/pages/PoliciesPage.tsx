import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-slate-600 leading-relaxed">
      <div>
        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Privacy Policy</h1>
        <p className="text-slate-400 text-[11px] mt-1">
          Last updated: October 2026 • Raj Medicare, Talcher
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Information Collection & Minimal Data Principle
          </h2>
          <p>
            Raj Medicare ("we", "our", "us") operates the website for visiting doctor appointment
            scheduling and local medicine delivery requests in Talcher, Odisha. We only collect the
            minimum necessary patient information required to coordinate your clinic consultation:
            Patient Name, Age, Gender, Contact Phone Number, and Optional Residential Address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            2. Confidentiality & Medical Privacy
          </h2>
          <p>
            Patient contact details and appointment records are treated with the highest
            confidentiality. We do not sell, rent, or publicly display patient identities, phone
            numbers, or symptom records. Reception staff and consulting doctors access only the
            information necessary to facilitate the consultation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Prescription Handling
          </h2>
          <p>
            Uploaded doctor prescriptions are transmitted securely and accessed solely by
            authorized dispensary pharmacists for dosage verification and regulatory compliance.
            Prescription images are not shared with third-party advertising networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            4. Contact Information
          </h2>
          <p>
            For any questions or privacy inquiries regarding your appointment data, you may visit
            our dispensary at Shop No. 39, Bharatpur Market Complex, FCI Township, Talcher, Angul,
            Odisha - 759148.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-slate-600 leading-relaxed">
      <div>
        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Terms & Conditions</h1>
        <p className="text-slate-400 text-[11px] mt-1">
          Last updated: October 2026 • Raj Medicare, Talcher
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Nature of the Service & Medical Emergency Disclaimer
          </h2>
          <p className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 font-medium">
            Raj Medicare's online platform is strictly a scheduling and enquiry tool for visiting
            consultants and store inventory. IT IS NOT AN EMERGENCY MEDICAL SERVICE. In the event of
            acute chest pain, severe trauma, shortness of breath, poisoning, or medical
            emergencies, contact government emergency ambulances (108/112) or immediately proceed to
            the nearest hospital.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            2. Visiting Doctor Consultations & Timing
          </h2>
          <p>
            Visiting doctors are independent medical practitioners consulting at Raj Medicare on
            designated dates. While every effort is made to maintain exact time slot schedules,
            delays may occasionally occur due to clinical examination depth or emergencies. Patients
            are requested to check in 10 minutes prior to their slot.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Prescription Medicines & Dispensing
          </h2>
          <p>
            Under Indian Drugs and Cosmetics Rules, Schedule H, H1, and X medicines cannot be
            dispensed or delivered without a valid registered medical practitioner’s prescription.
            Raj Medicare reserves the right to reject delivery requests if an authentic physical or
            digital prescription is unavailable upon pharmacist inspection.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            4. Cancellations & Rescheduling
          </h2>
          <p>
            Patients may cancel their appointment up to 2 hours prior to the scheduled visiting time
            via the 'My Appointments' portal or by telephoning the store desk.
          </p>
        </section>
      </div>
    </div>
  );
};
