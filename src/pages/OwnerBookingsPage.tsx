import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const OwnerBookingsPage: React.FC = () => {
  const { bookings, verifyIntake, language } = useApp();
  const isTa = language === 'ta';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingCode, setSelectedBookingCode] = useState<string | null>(null);
  const [scaleKg, setScaleKg] = useState<number>(500);
  const [scaleCrates, setScaleCrates] = useState<number>(20);
  const [chamberName, setChamberName] = useState<string>('Chamber 1');

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      b.cropName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenScale = (bookingCode: string, bookedKg: number, bookedCrates: number, cham: string) => {
    setSelectedBookingCode(bookingCode);
    setScaleKg(bookedKg);
    setScaleCrates(bookedCrates);
    setChamberName(cham);
  };

  const handleConfirmScale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingCode) return;
    verifyIntake(selectedBookingCode, scaleKg, scaleCrates, chamberName);
    setSelectedBookingCode(null);
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
              {isTa ? 'முன்பதிவு மேலாண்மை' : 'Facility Booking Management'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'உழவர் முன்பதிவுகள், கேட் நுழைவு அனுமதி & எடைச் சரிபார்ப்பு' : 'Monitor farmer reservations, verify gate intake, and manage chamber allocations'}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-[#5B6660]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTa ? 'பதிவு எண், விவசாயி அல்லது பயிர் பெயர் தேடுக...' : 'Search booking code, farmer, crop...'}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-white focus:border-[#14532D] outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'confirmed', 'in_storage', 'completed', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 h-10 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'bg-white text-[#5B6660] hover:bg-[#EEF6ED] border border-[#DFE4DC]'
                }`}
              >
                {st === 'all' ? (isTa ? 'அனைத்தும்' : 'All') : st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / Cards */}
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DFE4DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-md">
                    {b.bookingCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-[#AFF2C2] text-[#00210F]'
                        : b.status === 'in_storage'
                        ? 'bg-blue-100 text-blue-700'
                        : b.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-[#5B6660] font-mono">
                    PIN: <strong className="text-[#C8923A]">{b.batchPin}</strong>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#1C2420] truncate">
                  {b.cropName} • {b.farmerName} ({b.farmerPhone})
                </h3>
                <p className="text-xs text-[#5B6660]">
                  Chamber: <strong>{b.chamberName}</strong> | Reserved: {b.bookedCrates} crates ({b.bookedKg} kg)
                </p>
                <div className="text-[11px] text-[#5B6660] flex items-center gap-2">
                  <Clock size={13} />
                  <span>Period: {b.startDate} to {b.endDate} ({b.durationDays} days) • ₹{b.totalEstimatedCost}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                {b.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleOpenScale(b.bookingCode, b.bookedKg, b.bookedCrates, b.chamberName)}
                    className="h-9 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] shadow-2xs transition-all active:scale-98 cursor-pointer"
                  >
                    <Scale size={15} />
                    <span>{isTa ? 'எடை சரிபார்த்தல் & சரக்கு பதிவு' : 'Verify Gate Intake'}</span>
                  </button>
                )}

                {b.status === 'in_storage' && (
                  <span className="text-xs font-bold text-[#14532D] flex items-center gap-1 bg-[#E7F5EE] px-2.5 py-1 rounded-xl">
                    <CheckCircle2 size={14} />
                    <span>In Chamber Storage</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Gate Scale Intake Modal */}
        {selectedBookingCode && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#14532D] flex items-center gap-2">
                  <Scale size={20} className="text-[#C8923A]" />
                  <span>{isTa ? 'வாயில் எடை தராசு சரிபார்ப்பு' : 'Gate Weighing Bridge Intake'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedBookingCode(null)}
                  className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? `${selectedBookingCode} முன்பதிவிற்கான உண்மையான எடை மற்றும் கூடைகளை டிஜிட்டல் தராசில் அளந்து பதிவு செய்யவும்.`
                  : `Record verified gross weight for booking ${selectedBookingCode}. Physical inventory batch will be created with actual delivered stock.`}
              </p>

              <form onSubmit={handleConfirmScale} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Verified Gross Weight (kg)</label>
                    <input
                      type="number"
                      value={scaleKg}
                      onChange={(e) => setScaleKg(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Physical Crates</label>
                    <input
                      type="number"
                      value={scaleCrates}
                      onChange={(e) => setScaleCrates(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#404941]">Destination Chamber</label>
                  <input
                    type="text"
                    value={chamberName}
                    onChange={(e) => setChamberName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingCode(null)}
                    className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E]"
                  >
                    Confirm Physical Intake
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
