import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  QrCode,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const FarmerBookingsPage: React.FC = () => {
  const { bookings, cancelBooking, language } = useApp();
  const isTa = language === 'ta';

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Harvest delayed by weather conditions');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return b.status === 'confirmed' || b.status === 'in_storage';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancellingCode) return;
    const ok = cancelBooking(cancellingCode, cancelReason);
    if (ok) {
      setCancellingCode(null);
    }
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-3xl mx-auto">
        {/* Header & New Booking CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
              {isTa ? 'எனது முன்பதிவுகள்' : 'My Storage Bookings'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'செயலில் உள்ள அறை ஒதுக்கீடுகள் மற்றும் கேட் பாஸ்' : 'Reserved cold storage capacity & gate passes'}
            </p>
          </div>

          <Link
            to="/wizard"
            className="h-10 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>{isTa ? 'புதிய பதிவு' : 'New Booking'}</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 border-b border-[#DFE4DC] pb-2 overflow-x-auto no-scrollbar">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => {
            const labels = {
              all: isTa ? 'அனைத்தும்' : 'All',
              active: isTa ? 'செயலில் உள்ளவை' : 'Active',
              completed: isTa ? 'முடிந்தவை' : 'Completed',
              cancelled: isTa ? 'ரத்து செய்யப்பட்டவை' : 'Cancelled',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'bg-white text-[#5B6660] hover:bg-[#EEF6ED] border border-[#DFE4DC]'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#DFE4DC] space-y-3">
            <Calendar size={32} className="mx-auto text-[#C8923A]" />
            <div className="font-bold text-sm text-[#1C2420]">
              {isTa ? 'முன்பதிவுகள் ஏதுமில்லை' : 'No bookings found in this category'}
            </div>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'அறுவடை சேமிப்பிற்கு புதிய அறையை முன்பதிவு செய்யுங்கள்.' : 'Explore available solar cold storage facilities in your area.'}
            </p>
            <Link
              to="/discovery"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14532D] text-white text-xs font-bold"
            >
              <span>{isTa ? 'அறைகளைத் தேடுக' : 'Find Cold Storage'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => {
              const isCancelled = b.status === 'cancelled';
              const isCompleted = b.status === 'completed';

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs space-y-3 transition-all ${
                    isCancelled ? 'opacity-70 border-red-200 bg-red-50/20' : 'border-[#DFE4DC]'
                  }`}
                >
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-md">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs text-[#5B6660]">
                        PIN: <strong className="text-[#C8923A] font-mono">{b.batchPin}</strong>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-red-100 text-red-700'
                          : isCompleted
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-[#AFF2C2] text-[#00210F]'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Crop & Chamber Details */}
                  <div className="flex items-start gap-3">
                    <img
                      src={b.cropImageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'}
                      alt={b.cropName}
                      className="w-14 h-14 rounded-xl object-cover border border-[#DFE4DC] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#1C2420] truncate">{b.cropName}</h3>
                      <p className="text-xs text-[#5B6660] truncate">{b.facilityName} • {b.chamberName}</p>
                      <div className="flex items-center gap-3 text-xs mt-1 text-[#14532D] font-bold">
                        <span>{b.bookedCrates} crates ({b.bookedKg} kg)</span>
                        <span>•</span>
                        <span>₹{b.totalEstimatedCost} total</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Schedule info */}
                  <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs grid grid-cols-2 gap-2 text-[#5B6660]">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Start Date</span>
                      <span className="font-bold text-[#1C2420]">{b.startDate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">End Date ({b.durationDays} days)</span>
                      <span className="font-bold text-[#1C2420]">{b.endDate}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <Link
                      to={`/booking/${b.bookingCode.replace('#', '')}/confirmation`}
                      className="h-9 px-3 rounded-xl bg-[#EEF6ED] text-[#14532D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E3EAE2] transition-colors"
                    >
                      <QrCode size={15} />
                      <span>{isTa ? 'டிஜிட்டல் கேட் பாஸ்' : 'View Gate Pass'}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      {!isCancelled && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => setCancellingCode(b.bookingCode)}
                          className="h-9 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {isTa ? 'ரத்து செய்' : 'Cancel'}
                        </button>
                      )}

                      <Link
                        to={`/feedback-revisit/${b.bookingCode.replace('#', '')}`}
                        className="h-9 px-3 rounded-xl bg-white border border-[#DFE4DC] text-[#404941] hover:bg-[#FAF8F3] text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>{isTa ? 'கருத்து / மறுபதிவு' : 'Review / Rebook'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingCode && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertCircle size={20} />
                <span>{isTa ? 'முன்பதிவை ரத்து செய்கிறீர்களா?' : 'Confirm Booking Cancellation'}</span>
              </div>
              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? `${cancellingCode} முன்பதிவு ரத்து செய்யப்பட்டு ஒதுக்கப்பட்ட அறை கொள்ளளவு விடுவிக்கப்படும். physical inventory பாதிக்கப்படாது.`
                  : `Are you sure you want to cancel booking ${cancellingCode}? Reserved chamber capacity will be immediately released.`}
              </p>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#404941]">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-10 px-2 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                >
                  <option value="Harvest delayed by weather">Harvest delayed by weather</option>
                  <option value="Mandi spot sale preferred">Sold immediately at local APMC</option>
                  <option value="Logistics truck unavailable">Transport truck unavailable</option>
                  <option value="Other personal reasons">Other personal reasons</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingCode(null)}
                  className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  {isTa ? 'பின்செல்' : 'Go Back'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  {isTa ? 'ரத்து உறுதிசெய்' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
