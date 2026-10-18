import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  QrCode,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
} from 'lucide-react';

export const FarmerBookingsPage: React.FC = () => {
  const {
    bookings,
    cancelBooking,
    confirmWeightVerification,
    reportWeightDiscrepancy,
    requestPickup,
    batches,
    language,
    showToast,
  } = useApp();

  const isTa = language === 'ta';

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Harvest delayed by weather conditions');

  // Discrepancy Reporting Modal (Screen CS11)
  const [discrepancyBooking, setDiscrepancyBooking] = useState<string | null>(null);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('Physical scale weight is lower than measured at farm gate');
  const [discrepancyObservedKg, setDiscrepancyObservedKg] = useState<number>(400);

  // Pickup Request Modal (Screen CS13)
  const [pickupBooking, setPickupBooking] = useState<{
    bookingCode: string;
    cropName: string;
    maxKg: number;
    batchCode: string;
  } | null>(null);
  const [pickupKg, setPickupKg] = useState<number>(100);
  const [pickupDate, setPickupDate] = useState<string>('2026-10-20');
  const [pickupTime, setPickupTime] = useState<string>('09:30 AM');
  const [pickupNotes, setPickupNotes] = useState<string>('Mini-truck arriving for Oddanchatram Mandi morning auction');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return b.status === 'confirmed' || b.status === 'in_storage' || b.status === 'needs_resolution';
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

  const handleDiscrepancySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discrepancyBooking) return;
    reportWeightDiscrepancy(discrepancyBooking, discrepancyReason, discrepancyObservedKg);
    setDiscrepancyBooking(null);
  };

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupBooking) return;
    if (pickupKg <= 0 || pickupKg > pickupBooking.maxKg) {
      showToast(`Invalid quantity: maximum available is ${pickupBooking.maxKg} kg`, 'error');
      return;
    }
    const crates = Math.ceil(pickupKg / 25);
    requestPickup({
      batchCode: pickupBooking.batchCode,
      requestedKg: pickupKg,
      requestedCrates: crates,
      collectionDate: pickupDate,
      collectionTime: pickupTime,
      notes: pickupNotes,
    });
    setPickupBooking(null);
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-3xl mx-auto">
        {/* Header & New Booking CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
              {isTa ? 'எனது குளிர்சாதன முன்பதிவுகள்' : 'My Cold Storage Bookings'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'செயலில் உள்ள அறை ஒதுக்கீடுகள், கேட் பாஸ் & எடை சரிபார்ப்பு' : 'Reserved cold storage capacity, gate passes & weight verification'}
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

        {/* SCREEN CS9: BEFORE-DELIVERY REMINDER BANNER */}
        <div className="p-4 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#14532D] text-white flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                {isTa ? 'வருகை நினைவூட்டல்' : 'Delivery Intake Reminder'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#14532D] bg-white px-2 py-0.5 rounded-full border border-[#AFF2C2]">
              {isTa ? 'அடுத்த 24 மணி நேரம்' : 'Next 24 Hours'}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <h4 className="font-bold text-[#0F3D2E]">
              {isTa ? 'முன்பதிவு #SRS-TN-8492 — உழவர் சூரிய மின் மையம் #14' : 'Booking #SRS-TN-8492 — Uzhavar Solar Hub #14'}
            </h4>
            <p className="text-[#5B6660]">
              {isTa
                ? 'ஒட்டன்சத்திரம் புறவழிச்சாலை • நுழைவு வாயில் பே #1 • காலை 06:00 - இரவு 10:00 வரை இயங்குகிறது'
                : 'Oddanchatram Bypass Road • Inbound Bay #1 • Operating Hours: 06:00 AM - 10:00 PM'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#AFF2C2]/60 text-xs">
            <span className="text-[#5B6660] font-medium">
              {isTa ? 'எதிர்பார்க்கப்படும் எடை: 50 கூடைகள் (1,250 kg)' : 'Expected Produce: 50 crates (1,250 kg)'}
            </span>
            <Link
              to="/booking/SRS-TN-8492/confirmation"
              className="text-[#14532D] font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{isTa ? 'QR கேட் பாஸ்' : 'View Gate Pass'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
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
              const isNeedsResolution = b.status === 'needs_resolution';
              const isInStorage = b.status === 'in_storage';

              // Find associated batch if stored
              const linkedBatch = batches.find((bat) => bat.bookingId === b.id || bat.cropName === b.cropName);

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs space-y-3 transition-all ${
                    isCancelled
                      ? 'opacity-70 border-red-200 bg-red-50/20'
                      : isNeedsResolution
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-[#DFE4DC]'
                  }`}
                >
                  {/* Top Bar: Code, PIN & Status */}
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
                          : isNeedsResolution
                          ? 'bg-amber-100 text-amber-800'
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

                  {/* WEIGHBRIDGE INTAKE VERIFICATION */}
                  {b.verifiedKg && b.status !== 'completed' && (
                    <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#14532D]">
                          <Scale size={14} />
                          <span>{isTa ? 'வாயில் எடை சரிபார்ப்பு' : 'Weighbridge Intake Verified'}</span>
                        </div>
                        <span className="font-bold text-[#1C2420]">
                          {b.verifiedKg} kg ({b.verifiedCrates || Math.round(b.verifiedKg / 25)} crates)
                        </span>
                      </div>

                      {b.status === 'confirmed' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => confirmWeightVerification(b.bookingCode)}
                            className="flex-1 h-10 rounded-lg bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <CheckCircle2 size={13} />
                            <span>{isTa ? 'எடையை உறுதிசெய்' : 'Confirm Weight'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiscrepancyBooking(b.bookingCode);
                              setDiscrepancyObservedKg(b.bookedKg);
                            }}
                            className="h-10 px-3 rounded-lg border border-amber-300 bg-white text-amber-800 text-xs font-bold hover:bg-amber-50 cursor-pointer flex items-center justify-center"
                          >
                            {isTa ? 'முரண்பாட்டைப் புகாரளி' : 'Report Discrepancy'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-[#14532D] font-semibold">
                          <CheckCircle2 size={12} />
                          <span>{isTa ? 'விவசாயியால் எடை உறுதிசெய்யப்பட்டது.' : 'Weight accepted by farmer.'}</span>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Action Buttons: Digital Gate Pass, Pickup Request, Reviews */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <Link
                      to={`/booking/${b.bookingCode.replace('#', '')}/confirmation`}
                      className="h-10 px-3 rounded-xl bg-[#EEF6ED] text-[#14532D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E3EAE2] transition-colors"
                    >
                      <QrCode size={15} />
                      <span>{isTa ? 'கேட் பாஸ்' : 'Gate Pass'}</span>
                    </Link>

                    {/* REQUEST PRODUCE PICKUP */}
                    {isInStorage && linkedBatch && (
                      <button
                        type="button"
                        onClick={() => {
                          setPickupBooking({
                            bookingCode: b.bookingCode,
                            cropName: b.cropName,
                            maxKg: linkedBatch.currentStockKg,
                            batchCode: linkedBatch.batchCode,
                          });
                          setPickupKg(Math.min(100, linkedBatch.currentStockKg));
                        }}
                        className="h-10 px-3.5 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Truck size={14} />
                        <span>{isTa ? 'பயிர் மீட்பு' : 'Request Pickup'}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {!isCancelled && !isCompleted && b.status !== 'in_storage' && (
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
                        <span>{isTa ? 'கருத்து' : 'Feedback'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WEIGHT DISCREPANCY REPORTING MODAL */}
        {discrepancyBooking && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <AlertTriangle size={18} />
                  <span>{isTa ? 'எடை முரண்பாடு அறிக்கை' : 'Report Weight Discrepancy'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDiscrepancyBooking(null)}
                  className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? `${discrepancyBooking} எடை முரண்பாடு உள்ளதா? உங்கள் குறிப்பை பதிவிட்டால் கிடங்கு மேற்பார்வையாளர் மறுசரிபார்ப்பு நடத்துவார்.`
                  : `Report discrepancies between farm dispatch weight and terminal weighbridge for ${discrepancyBooking}.`}
              </p>

              <form onSubmit={handleDiscrepancySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'காரணம் *' : 'Discrepancy Reason *'}
                  </label>
                  <select
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-white"
                  >
                    <option value="Physical scale weight lower than farm gate gross">Physical scale weight lower than farm gate gross</option>
                    <option value="Damaged crates rejected at inspection bay">Damaged crates rejected at inspection bay</option>
                    <option value="Scale tare weight deducted incorrectly">Scale tare weight deducted incorrectly</option>
                    <option value="Moisture shrinkage over transit">Moisture shrinkage over transit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'விவசாயி கணக்கீட்டு எடை (kg)' : 'Expected Weight by Farmer (kg)'}
                  </label>
                  <input
                    type="number"
                    value={discrepancyObservedKg}
                    onChange={(e) => setDiscrepancyObservedKg(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscrepancyBooking(null)}
                    className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                  >
                    {isTa ? 'ரத்து' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 h-12 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isTa ? 'வழக்கை பதிவு செய்' : 'Submit Review Case'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST PICKUP MODAL */}
        {pickupBooking && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8C5D17] font-bold text-sm">
                  <Truck size={18} />
                  <span>{isTa ? 'பயிர் மீட்பு கோரிக்கை' : 'Schedule Produce Pickup'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPickupBooking(null)}
                  className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4EC] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B6660]">{isTa ? 'பயிர்:' : 'Crop:'}</span>
                  <strong className="text-[#1C2420]">{pickupBooking.cropName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6660]">{isTa ? 'கிடைக்கக்கூடிய இருப்பு:' : 'Available in Chamber:'}</span>
                  <strong className="text-[#14532D]">{pickupBooking.maxKg} kg</strong>
                </div>
              </div>

              <form onSubmit={handlePickupSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'மீட்க வேண்டிய அளவு (kg) *' : 'Pickup Quantity (kg) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={pickupBooking.maxKg}
                    value={pickupKg}
                    onChange={(e) => setPickupKg(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                  />
                  <span className="text-[10px] text-[#5B6660]">
                    ≈ {Math.ceil(pickupKg / 25)} crates
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404941]">
                      {isTa ? 'தேதி' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full h-11 px-2 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404941]">
                      {isTa ? 'நேரம்' : 'Time'}
                    </label>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="w-full h-11 px-2 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'குறிப்புகள் (வாகனம் / சந்தை விவரம்)' : 'Dispatch Notes (Vehicle / Auction)'}
                  </label>
                  <input
                    type="text"
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    placeholder="e.g. Mini-truck arriving for Mandi morning auction"
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupBooking(null)}
                    className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                  >
                    {isTa ? 'ரத்து' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    {isTa ? 'மீட்புக் கோரிக்கை செய்' : 'Submit Pickup Request'}
                  </button>
                </div>
              </form>
            </div>
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
                  className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  {isTa ? 'பின்செல்' : 'Go Back'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
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
