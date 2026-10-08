import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Medicine, MedicineCategory } from '../types';
import {
  Search,
  Filter,
  Pill,
  ShoppingBag,
  Plus,
  Check,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  X,
  Sparkles,
} from 'lucide-react';

interface MedicinesPageProps {
  navigate: (path: string) => void;
  onSelectMedicine?: (medicineId: string) => void;
}

const CATEGORIES: MedicineCategory[] = [
  'Fever & Pain',
  'Cold & Cough',
  'Diabetes',
  'Blood Pressure',
  'Vitamins & Supplements',
  'Digestive Care',
  'Skin Care',
  'Baby Care',
  'Personal Care',
  'First Aid',
  'Medical Devices',
  'Other',
];

export const MedicinesPage: React.FC<MedicinesPageProps> = ({
  navigate,
  onSelectMedicine,
}) => {
  const { medicines, cart, addToCart, setIsCartOpen } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [selectedMedicineForModal, setSelectedMedicineForModal] = useState<Medicine | null>(null);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'All' && m.category !== selectedCategory) {
        return false;
      }

      // Prescription
      if (prescriptionFilter === 'otc' && m.prescriptionRequired) return false;
      if (prescriptionFilter === 'rx' && !m.prescriptionRequired) return false;

      return true;
    });
  }, [medicines, search, selectedCategory, prescriptionFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
            <Pill className="w-3.5 h-3.5" />
            <span>Pharmacy & Dispensary Catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Medicines & Healthcare Products
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Browse genuine pharmaceutical products available at Raj Medicare, Talcher. Add items to
            your list to request local delivery or pharmacy pickup.
          </p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>View Enquiry List ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Main Search Input with Clear Button */}
        <div className="relative">
          <Search className="w-5 h-5 text-teal-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specific medicine by name, brand, generic salt (e.g. Dolo 650, Paracetamol, Telma, Pantocid)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 text-sm sm:text-base focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-slate-50/70 placeholder:text-slate-400 font-medium transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick popular search tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Popular:
          </span>
          {['Dolo 650', 'Combiflam', 'Alex Syrup', 'Telma 40', 'Glycomet', 'Pantocid', 'Shelcal 500'].map((term) => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                search.toLowerCase() === term.toLowerCase()
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200/60'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Categories Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'All'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription filter & search summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Prescription Filter:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setPrescriptionFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  prescriptionFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPrescriptionFilter('otc')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  prescriptionFilter === 'otc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Over The Counter (OTC)
              </button>
              <button
                onClick={() => setPrescriptionFilter('rx')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  prescriptionFilter === 'rx'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Prescription (Rx)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            {search && (
              <span className="text-teal-700 font-semibold">
                Searching for: "{search}"
              </span>
            )}
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
              {filteredMedicines.length} of {medicines.length} medicines
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Medicines */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredMedicines.map((med) => {
            const inCart = cart.find((item) => item.medicine.id === med.id);

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Image & Rx badge */}
                  <div
                    onClick={() => setSelectedMedicineForModal(med)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 cursor-pointer group"
                  >
                    <img
                      src={
                        med.imageUrl ||
                        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={med.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {med.prescriptionRequired ? (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                        Rx
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        OTC
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {med.category}
                  </span>

                  <h3
                    onClick={() => setSelectedMedicineForModal(med)}
                    className="font-bold text-slate-900 text-sm leading-snug mt-0.5 truncate hover:text-teal-700 cursor-pointer"
                  >
                    {med.name}
                  </h3>

                  <p className="text-[11px] text-teal-800 font-medium truncate mt-0.5">
                    {med.brand}
                  </p>

                  {med.genericName && (
                    <p className="text-[10px] text-slate-400 truncate italic">{med.genericName}</p>
                  )}

                  <p className="text-[11px] text-slate-500 mt-1">{med.packSize}</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-extrabold text-slate-900 text-sm">₹{med.price}</span>
                    {med.discount && med.discount > 0 && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{med.price + med.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Enquiry / Cart Button */}
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => addToCart(med)}
                    className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                      inCart
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        <span>In Enquiry List ({inCart.quantity})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
          <Pill className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No medicines match your criteria</h3>
          <p className="text-xs text-slate-500">
            If you need a specific medicine not listed here, contact our store directly and our
            pharmacist will arrange it for you.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setPrescriptionFilter('all');
            }}
            className="text-xs font-bold text-teal-700 hover:underline pt-2 inline-block"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Medicine Details Modal */}
      {selectedMedicineForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedMedicineForModal.imageUrl ||
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={selectedMedicineForModal.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    {selectedMedicineForModal.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">
                    {selectedMedicineForModal.brand}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {selectedMedicineForModal.packSize}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMedicineForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info details */}
            <div className="space-y-3 text-xs">
              {selectedMedicineForModal.genericName && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Generic Composition:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedMedicineForModal.genericName}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] text-slate-500 block">Product Description:</span>
                <p className="text-slate-600 leading-relaxed mt-0.5">
                  {selectedMedicineForModal.description}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-100">
                <div>
                  <span className="text-slate-500 text-[11px] block">Price</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{selectedMedicineForModal.price}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block text-right">Prescription</span>
                  <span
                    className={`font-bold ${
                      selectedMedicineForModal.prescriptionRequired
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {selectedMedicineForModal.prescriptionRequired
                      ? 'Doctor Rx Required'
                      : 'Over the Counter (OTC)'}
                  </span>
                </div>
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Medicine information is provided for general reference. Please consult a qualified
                  healthcare professional before using prescription medicines.
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  addToCart(selectedMedicineForModal);
                  setSelectedMedicineForModal(null);
                  setIsCartOpen(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Add to Enquiry & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
