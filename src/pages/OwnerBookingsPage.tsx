import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertTriangle
} from 'lucide-react';

export const OwnerBookingsPage: React.FC = () => {
  const {
    bookings,
    verifyIntake,
    pickupRequests,
    approvePickupRequest,
    rejectPickupRequest,
    completePickupWithdrawal,
    language,
    showToast,
  } = useApp();

  const isTa = language === 'ta';

  // Section Toggle: 'bookings' vs 'pickups'
  const [section, setSection] = useState<'bookings' | 'pickups'>('bookings');

  // Booking filters & scale modal
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingCode, setSelectedBookingCode] = useState<string | null>(null);
  const [scaleKg, setScaleKg] = useState<number>(500);
  const [scaleCrates, setScaleCrates] = useState<number>(20);
  const [chamberName, setChamberName] = useState<string>('Chamber 1');

  // Pickup Release Modal (Screen CS15)
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  const [actualWithdrawKg, setActualWithdrawKg] = useState<number>(100);
  const [actualWithdrawCrates, setActualWithdrawCrates] = useState<number>(4);
  const [recipientName, setRecipientName] = useState<string>('Murugan S. (Farmer)');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Chamber retrieval window conflict, reschedule advised');

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
    showToast(`Physical scale verified: ${scaleKg} kg admitted into ${chamberName}`, 'success');
  };

  const handleOpenReleaseModal = (req: typeof pickupRequests[0]) => {
    setActivePickupId(req.id);
    setActualWithdrawKg(req.requestedKg);
    setActualWithdrawCrates(req.requestedCrates);
    setRecipientName(req.farmerName);
  };

  const handleConfirmRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePickupId) return;
    const ok = completePickupWithdrawal(activePickupId, actualWithdrawKg, actualWithdrawCrates, recipientName);
    if (ok) {
      setActivePickupId(null);
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalId) return;
    rejectPickupRequest(rejectModalId, rejectReason);
    setRejectModalId(null);
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
              {isTa ? 'கிடங்கு முன்பதிவு & மீட்பு மேலாண்மை' : 'Facility Reservations & Gate Intake'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'உழவர் முன்பதிவுகள், கேட் நுழைவு அனுமதி & எடைச் சரிபார்ப்பு' : 'Monitor farmer reservations, verify gate intake, and authorize physical dispatches'}
            </p>
          </div>

          {/* Section Toggle */}
          <div className="flex bg-[#F7F4EC] p-1 rounded-xl border border-[#DFE4DC] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSection('bookings')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                section === 'bookings' ? 'bg-[#14532D] text-white shadow-xs' : 'text-[#5B6660]'
              }`}
            >
              {isTa ? 'முன்பதிவுகள் (Bookings)' : 'Bookings'}
            </button>
            <button
              type="button"
              onClick={() => setSection('pickups')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                section === 'pickups' ? 'bg-[#C8923A] text-white shadow-xs' : 'text-[#5B6660]'
              }`}
            >
              <Truck size={14} />
              <span>{isTa ? 'மீட்புக் கோரிக்கைகள்' : 'Pickup Requests (CS14)'}</span>
              {pickupRequests.filter((p) => p.status === 'pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECTION A: FARMER BOOKINGS & SCALE INTAKE
            ========================================================================= */}
        {section === 'bookings' && (
          <div className="space-y-4">
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

              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                    {b.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleOpenScale(b.bookingCode, b.bookedKg, b.bookedCrates, b.chamberName)}
                        className="h-9 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] shadow-2xs transition-all active:scale-98 cursor-pointer"
                      >
                        <Scale size={15} />
                        <span>{isTa ? 'எடை சரிபார்த்தல் (CS10)' : 'Verify Gate Intake'}</span>
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
          </div>
        )}

        {/* =========================================================================
            SECTION B: PICKUP REQUESTS (SCREEN CS14 & CS15)
            ========================================================================= */}
        {section === 'pickups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6660]">
                {isTa ? 'உழவர் பயிர் மீட்புக் கோரிக்கைகள்' : 'Farmer Scheduled Pickup Queue'}
              </span>
              <span className="text-xs font-semibold text-[#C8923A] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {pickupRequests.length} {isTa ? 'கோரிக்கைகள்' : 'Requests'}
              </span>
            </div>

            {pickupRequests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#DFE4DC] space-y-2">
                <Truck size={28} className="mx-auto text-amber-500" />
                <span className="text-xs font-bold text-[#1C2420] block">
                  {isTa ? 'மீட்புக் கோரிக்கைகள் ஏதுமில்லை' : 'No active pickup requests'}
                </span>
                <p className="text-[11px] text-[#5B6660]">
                  {isTa
                    ? 'விவசாயிகள் தங்கள் சேமிக்கப்பட்ட விளைபொருட்களை மீட்கக் கோரும்போது இங்கு தோன்றும்.'
                    : 'Requests submitted by farmers under My Stored Crops will appear here for review.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pickupRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFE4DC] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#8C5D17] bg-amber-100 px-2 py-0.5 rounded-md">
                          {req.requestCode}
                        </span>
                        <span className="text-xs text-[#5B6660]">
                          Batch: <strong className="font-mono text-[#1C2420]">{req.batchCode}</strong>
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'completed'
                            ? 'bg-[#E7F5EE] text-[#14532D]'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#1C2420]">
                        {req.requestedKg} kg ({req.requestedCrates} crates) • {req.cropName}
                      </h4>
                      <p className="text-xs text-[#5B6660]">
                        Farmer: <strong>{req.farmerName}</strong> | Collection: <strong>{req.collectionDate} at {req.collectionTime}</strong>
                      </p>
                      {req.notes && (
                        <p className="text-[11px] text-[#5B6660] italic">
                          "{req.notes}"
                        </p>
                      )}
                      {req.rejectionReason && (
                        <p className="text-[11px] text-red-600 font-medium">
                          Rejection Reason: {req.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* CS14 & CS15 Actions */}
                    <div className="pt-2 border-t border-[#DFE4DC] flex items-center justify-between gap-2 flex-wrap">
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => approvePickupRequest(req.id)}
                            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check size={14} />
                            <span>{isTa ? 'அங்கீகரி (CS14)' : 'Approve Pickup (CS14)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectModalId(req.id)}
                            className="py-2 px-3 rounded-xl border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer"
                          >
                            {isTa ? 'நிராகரி' : 'Reject'}
                          </button>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReleaseModal(req)}
                          className="w-full sm:w-auto py-2 px-4 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#A67527] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Scale size={14} />
                          <span>{isTa ? 'நேரடி வாயில் வெளியீடு பதிவு (CS15)' : 'Record Physical Withdrawal (CS15)'}</span>
                        </button>
                      )}

                      {req.status === 'completed' && (
                        <div className="flex items-center gap-1 text-xs font-bold text-[#14532D]">
                          <CheckCircle2 size={15} />
                          <span>{isTa ? 'முழுமையாக விடுவிக்கப்பட்டு பதிவேட்டில் பதியப்பட்டது.' : 'Stock released & batch occupancy deducted.'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCREEN CS10: GATE SCALE INTAKE MODAL */}
        {selectedBookingCode && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#14532D] flex items-center gap-2">
                  <Scale size={20} className="text-[#C8923A]" />
                  <span>{isTa ? 'வாயில் எடை தராசு சரிபார்ப்பு (CS10)' : 'Gate Weighbridge Intake (CS10)'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedBookingCode(null)}
                  className="w-8 h-8 rounded-full bg-[#F4FBF3] flex items-center justify-center text-gray-500 font-bold cursor-pointer"
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
                    className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] cursor-pointer"
                  >
                    Confirm Physical Intake
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SCREEN CS15: PHYSICAL WITHDRAWAL / GATE RELEASE MODAL */}
        {activePickupId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#C8923A] flex items-center gap-2">
                  <Truck size={18} />
                  <span>{isTa ? 'உண்மையான பயிர் வெளியேற்றம் (CS15)' : 'Actual Produce Gate Release (CS15)'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActivePickupId(null)}
                  className="w-8 h-8 rounded-full bg-[#F4FBF3] flex items-center justify-center text-gray-500 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? 'வாயில் தராசில் வெளியேறும் எடையை சரிபார்த்து பதிவு செய்யவும். இது சேமிப்பக இருப்பை உடனே கழிக்கும்.'
                  : 'Record actual quantity physically dispatched at gate. Remaining stored batch quantity will be updated atomically.'}
              </p>

              <form onSubmit={handleConfirmRelease} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404941]">Released Weight (kg)</label>
                    <input
                      type="number"
                      min="1"
                      value={actualWithdrawKg}
                      onChange={(e) => setActualWithdrawKg(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404941]">Crates Released</label>
                    <input
                      type="number"
                      min="1"
                      value={actualWithdrawCrates}
                      onChange={(e) => setActualWithdrawCrates(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">Authorized Recipient / Driver</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Murugan S. (Mini-Truck TN-57-B-9812)"
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#A67527] transition-all cursor-pointer shadow-xs"
                >
                  {isTa ? 'வெளியேற்றத்தைப் பதிவு செய் (ரசீது உருவாக்கம்)' : 'Confirm Gate Withdrawal & Generate Receipt'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {rejectModalId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>{isTa ? 'மீட்புக் கோரிக்கையை நிராகரி' : 'Reject Pickup Request'}</span>
              </div>
              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? 'நிராகரிப்பிற்கான காரணத்தை விவசாயிக்குத் தெரியப்படுத்த உள்ளிடவும்.'
                  : 'State the operational reason for rejecting this pickup time or quantity.'}
              </p>
              <form onSubmit={handleConfirmReject} className="space-y-3">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs"
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalId(null)}
                    className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Confirm Rejection
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
