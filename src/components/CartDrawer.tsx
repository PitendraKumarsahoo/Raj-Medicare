import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';
import {
  X,
  Plus,
  Minus,
  Trash2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity, clearCart, showToast } =
    useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('759148');
  const [notes, setNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);

  const hasPrescriptionItems = cart.some((item) => item.medicine.prescriptionRequired);

  const totalEstimatedAmount = cart.reduce(
    (sum, item) => sum + item.medicine.price * item.quantity,
    0
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Prescription image must be under 5MB', 'error');
        return;
      }
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please provide a valid 10-digit phone number', 'error');
      return;
    }

    if (!deliveryAddress.trim()) {
      showToast('Please enter your delivery address in Talcher', 'error');
      return;
    }

    if (hasPrescriptionItems && !prescriptionFile) {
      showToast(
        'Some items require a doctor prescription. Please attach an image of your prescription.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        quantity: item.quantity,
        price: item.medicine.price,
        packSize: item.medicine.packSize,
      }));

      const newOrder = await storeService.createMedicineRequest({
        customerName,
        customerPhone,
        deliveryAddress,
        landmark,
        pincode,
        notes,
        items: orderItems,
        prescriptionUrl: prescriptionPreview || undefined,
        prescriptionFileName: prescriptionFile?.name,
        estimatedTotal: totalEstimatedAmount,
      });

      setSubmittedOrder(newOrder);
      clearCart();
      showToast('Medicine enquiry received! Our pharmacist will review it.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit enquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (submittedOrder) {
      setSubmittedOrder(null);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setLandmark('');
      setNotes('');
      setPrescriptionFile(null);
      setPrescriptionPreview(null);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Medicine Enquiry</h3>
                <p className="text-xs text-slate-500">Local Delivery in Talcher</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {submittedOrder ? (
              <div className="text-center py-8 px-2 space-y-4">
                <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Enquiry Submitted!</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Your request number is{' '}
                    <span className="font-mono font-bold text-teal-700">
                      {submittedOrder.requestNumber}
                    </span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-semibold">{submittedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold">{submittedOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Address:</span>
                    <span className="font-semibold text-right max-w-[200px]">
                      {submittedOrder.deliveryAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Initial Status:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                      {submittedOrder.status === 'prescription_review'
                        ? 'Prescription Review'
                        : 'New Request'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our pharmacist at Raj Medicare will verify product availability and call your
                  phone number shortly to confirm pricing, delivery slot, and instructions.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm shadow-xs transition"
                >
                  Done
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base">Your list is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse our pharmacy catalog and add medicines or healthcare essentials to request
                  delivery or enquiry.
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Selected Items ({cart.length})
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {cart.map((item) => (
                      <div key={item.medicine.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-slate-900 text-sm truncate">
                            {item.medicine.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{item.medicine.packSize}</span>
                            {item.medicine.prescriptionRequired && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Rx Required
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-teal-700 mt-1">
                            ₹{item.medicine.price} × {item.quantity} = ₹
                            {item.medicine.price * item.quantity}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQuantity(item.medicine.id, item.quantity - 1)}
                            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.medicine.id, item.quantity + 1)}
                            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.medicine.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Estimated Total:</span>
                    <span className="text-base font-bold text-slate-900">₹{totalEstimatedAmount}</span>
                  </div>
                </div>

                {/* Prescription Notice */}
                {hasPrescriptionItems && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Doctor Prescription Required</span>
                      <p className="mt-0.5 text-amber-800">
                        One or more selected medicines require a valid doctor prescription. Please
                        upload a photo or document below before requesting delivery.
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Form */}
                <form onSubmit={handleSubmitEnquiry} className="space-y-3.5 pt-2">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Talcher Delivery Details
                  </h5>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Nayak"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 94371XXXXX"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Address in Talcher *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Quarter / House No, Street, Colony (e.g. Qtr B-24, FCI Township, Talcher)"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near Market Complex"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="759148"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Prescription Upload */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {hasPrescriptionItems ? 'Attach Prescription *' : 'Prescription (Optional)'}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {prescriptionFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-teal-700 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{prescriptionFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xs font-medium text-slate-700">
                            Upload Prescription (JPG, PNG, PDF)
                          </span>
                          <span className="text-[11px] text-slate-400">Max size 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Special Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call before delivery, delivery after 5 PM"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      Raj Medicare pharmacist will manually verify the prescription and call you
                      to confirm before packing. Cash or UPI payment on delivery.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Submitting Enquiry...'
                    ) : (
                      <>
                        <span>Submit Delivery Enquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
