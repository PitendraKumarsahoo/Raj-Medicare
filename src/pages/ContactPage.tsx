import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Doctor Appointment Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cleanPhone = settings.phone.replace(/\D/g, '');
  const cleanWhatsApp = settings.whatsappNumber.replace(/\D/g, '');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitted(true);
    showToast('Your message has been sent to Raj Medicare staff!', 'success');
  };

  const whatsappInquiryUrl = `https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20my%20name%20is%20${encodeURIComponent(
    name || 'Patient'
  )}.%20I%20have%20an%20enquiry:%20${encodeURIComponent(message || 'visiting doctors and medicines.')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Talcher, Angul, Odisha</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact Raj Medicare
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Get in touch with our pharmacy dispensary or visiting doctor clinic. Call directly, send a
          WhatsApp message, or get directions to our store in FCI Township.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact & Location Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {settings.businessName}
              </h3>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                Shop No. 39, Bharatpur Market Complex
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Store Address</span>
                  <p className="mt-0.5 leading-relaxed text-slate-600">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Opening Timings</span>
                  <p className="mt-0.5 text-slate-600">{settings.openingHours}</p>
                  <p className="text-[11px] text-teal-700 font-medium">Open Every Day (7:00 AM to 11:00 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Phone Consultation</span>
                  <p className="mt-0.5 text-slate-600">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Email</span>
                  <p className="mt-0.5 text-slate-600">{settings.email}</p>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call Store</span>
                </a>

                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Raj%20Medicare,%20I%20have%20an%20enquiry%20regarding%20visiting%20doctors.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Local Area Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">Delivery Coverage in Talcher</h4>
            <p className="leading-relaxed text-slate-500">{settings.deliveryAreas}</p>
          </div>
        </div>

        {/* Right Column: Interactive Contact & Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Send an Enquiry</h2>
              <p className="text-xs text-slate-500 mt-1">
                Have a question about doctor visiting dates, medicine stock, or local home delivery?
                Fill out the form below.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 text-center bg-teal-50 rounded-2xl border border-teal-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Enquiry Sent Successfully</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{name}</strong>. Raj Medicare staff will review your message
                  and respond via phone or WhatsApp shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Subrat Mohanty"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 94371XXXXX"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Enquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Doctor Appointment Enquiry">Doctor Appointment Enquiry</option>
                    <option value="Visiting Doctor Timetable">Visiting Doctor Timetable</option>
                    <option value="Medicine Stock Availability">Medicine Stock Availability</option>
                    <option value="Local Delivery Status">Local Delivery Status</option>
                    <option value="Other Feedback">Other Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query or requirement..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Enquiry</span>
                  </button>

                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Send via WhatsApp Instead</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
