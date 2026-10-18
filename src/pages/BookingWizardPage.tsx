import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building2, Calendar, Scale, Receipt, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const BookingWizardPage: React.FC = () => {
  const { facilities, createBooking, user, language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTa = language === 'ta';
  const preselectedFacId = searchParams.get('facilityId') || facilities[0].id;

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(preselectedFacId);
  const facility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const [selectedChamberId, setSelectedChamberId] = useState<string>(facility.chambers[0]?.id || '');
  const [selectedCrop, setSelectedCrop] = useState<string>('Fresh Tomato (Hybrid)');
  const [variety, setVariety] = useState<string>('Shivam Variety');
  const [quantityCrates, setQuantityCrates] = useState<number>(50);
  const [durationDays, setDurationDays] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quantityKg = quantityCrates * 25;
  const chamber = facility.chambers.find((c) => c.id === selectedChamberId) || facility.chambers[0];

  // Cost Breakdown
  const baseStorageCost = quantityCrates * facility.pricePerCrateDay * durationDays;
  const handlingCost = quantityCrates * 2; // ₹2/crate intake palletizing
  const solarBackupFee = facility.solarPowered ? quantityCrates * 0.5 * durationDays : 0;
  const totalCost = Math.round(baseStorageCost + handlingCost + solarBackupFee);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate chamber capacity
    if (chamber.isMaintenance) {
      setErrorMsg(`${chamber.name} is currently blocked for maintenance calibration.`);
      return;
    }

    if (quantityCrates > chamber.availableCapacityCrates) {
      setErrorMsg(
        `Requested ${quantityCrates} crates exceeds available capacity of ${chamber.availableCapacityCrates} crates in ${chamber.name}.`
      );
      return;
    }

    setSubmitting(true);

    const endDate = new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    setTimeout(() => {
      const newBooking = createBooking({
        farmerId: user.id,
        farmerName: user.name,
        farmerPhone: user.phone,
        facilityId: facility.id,
        facilityName: facility.name,
        chamberId: chamber.id,
        chamberName: chamber.name,
        cropName: selectedCrop,
        cropNameTa: 'நவீன தக்காளி வகை',
        variety,
        grade: 'Grade A',
        bookedCrates: quantityCrates,
        bookedKg: quantityKg,
        startDate,
        durationDays,
        endDate,
        dailyRateCrate: facility.pricePerCrateDay,
        totalEstimatedCost: totalCost,
        cropImageUrl:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      });

      setSubmitting(false);
      navigate(`/booking/${newBooking.bookingCode.replace('#', '')}/confirmation`);
    }, 600);
  };

  return (
    <div className="flex flex-col relative w-full pt-6 pb-32 bg-[#F4FBF3] min-h-screen text-[#1C2420]">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Header with Back button */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/discovery"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1C2420] shadow-2xs border border-[#DFE4DC] hover:bg-[#F7F4EC] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#14532D]">
              {isTa ? 'குளிர்பதன இட முன்பதிவு' : 'Book Cold Storage Capacity'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa
                ? 'உறுதிசெய்யப்பட்ட சூரிய மின் அறை முன்பதிவு • உடனடி டிஜிட்டல் கேட் பாஸ்'
                : 'Guaranteed solar chamber reservation with instant digital gate pass'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {/* Step 1: Facility Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-[#DFE4DC] space-y-3">
            <h3 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={16} className="text-[#14532D]" />
              <span>1. {isTa ? 'கிடங்கு & குளிர்சாதன அறை தேர்வு' : 'Select Facility & Chamber'}</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#404941]">Warehouse Facility</label>
              <select
                value={selectedFacilityId}
                onChange={(e) => {
                  setSelectedFacilityId(e.target.value);
                  const newFac = facilities.find((f) => f.id === e.target.value);
                  if (newFac && newFac.chambers[0]) setSelectedChamberId(newFac.chambers[0].id);
                }}
                className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden focus:border-[#1e5e3a]"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.location} • ₹{f.pricePerCrateDay}/crate)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#404941]">Target Storage Chamber</label>
              <select
                value={selectedChamberId}
                onChange={(e) => setSelectedChamberId(e.target.value)}
                className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden focus:border-[#1e5e3a]"
              >
                {facility.chambers.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.isMaintenance}>
                    {c.name} ({c.currentTemp}°C • {c.availableCapacityCrates} crates free)
                    {c.isMaintenance ? ' - [MAINTENANCE BLOCKED]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Crop & Quantity */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-[#DFE4DC] space-y-3">
            <h3 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={16} className="text-[#14532D]" />
              <span>2. {isTa ? 'பயிர் விவரம் & கூடைகள் அளவு' : 'Crop Specifications & Quantity'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                >
                  <option value="Fresh Tomato (Hybrid)">Hybrid Tomato</option>
                  <option value="Potato (Kufri Jyoti)">Potato (Jyoti)</option>
                  <option value="Small Onion (Shallots)">Small Onion (Shallots)</option>
                  <option value="Green Chillies">Green Chillies</option>
                  <option value="Capsicum">Capsicum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">Variety / Strain</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-medium bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#161d18] mb-1">
                Quantity in Crates (25 kg each)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantityCrates((prev) => Math.max(5, prev - 5))}
                  className="w-12 h-12 rounded-xl bg-[#e9f0e8] text-xl font-bold flex items-center justify-center hover:bg-[#e3eae2]"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantityCrates}
                  min={1}
                  max={chamber.availableCapacityCrates || 500}
                  onChange={(e) => setQuantityCrates(Number(e.target.value))}
                  className="flex-1 h-12 text-center text-lg font-extrabold border border-[#c0c9bf] rounded-xl outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setQuantityCrates((prev) => prev + 5)}
                  className="w-12 h-12 rounded-xl bg-[#e9f0e8] text-xl font-bold flex items-center justify-center hover:bg-[#e3eae2]"
                >
                  +
                </button>
              </div>
              <div className="flex justify-between text-[11px] text-[#404941] mt-1 font-medium">
                <span>Total Weight: {quantityKg.toLocaleString()} kg</span>
                <span className="text-[#006c49]">Chamber Free: {chamber.availableCapacityCrates} crates</span>
              </div>
            </div>
          </div>

          {/* Step 3: Dates & Duration */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-[#DFE4DC] space-y-3">
            <h3 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={16} className="text-[#14532D]" />
              <span>3. {isTa ? 'சேமிப்புக் காலம்' : 'Storage Window'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">
                  {isTa ? 'சேமிப்புத் தொடக்க தேதி' : 'Inbound Date'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-semibold bg-[#F4FBF3] border border-[#C0C9BF] rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">
                  {isTa ? 'நாட்கள் அளவு' : 'Duration (Days)'}
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full h-11 px-3 text-xs font-semibold bg-[#F4FBF3] border border-[#C0C9BF] rounded-xl outline-hidden"
                >
                  <option value={7}>7 Days (Mandi dip hold)</option>
                  <option value={10}>10 Days (Optimal freshness)</option>
                  <option value={14}>14 Days (Two-week hold)</option>
                  <option value={30}>30 Days (Extended vault)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 4: Transparent Cost Breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-[#DFE4DC] space-y-2.5">
            <h3 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt size={16} className="text-[#14532D]" />
              <span>4. {isTa ? 'வெளிப்படையான கட்டண விவரம்' : 'Transparent Billing Breakdown'}</span>
            </h3>

            <div className="space-y-1.5 text-xs text-[#5B6660]">
              <div className="flex justify-between">
                <span>
                  Base Storage ({quantityCrates} crates × ₹{facility.pricePerCrateDay} × {durationDays} days):
                </span>
                <span className="font-semibold text-[#1C2420]">₹{baseStorageCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Intake Palletizing &amp; Sanitization:</span>
                <span className="font-semibold text-[#1C2420]">₹{handlingCost.toFixed(2)}</span>
              </div>
              {facility.solarPowered && (
                <div className="flex justify-between text-[#14532D]">
                  <span>Solar Hybrid Power Backup Surcharge:</span>
                  <span className="font-semibold">₹{solarBackupFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#DFE4DC] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">
                  {isTa ? 'மொத்த மதிப்பீட்டு கட்டணம்' : 'Estimated Total Cost'}
                </span>
                <span className="text-[10px] text-[#5B6660]">
                  {isTa ? 'வாயில் விநியோகத்தின்போது அல்லது சந்தை விற்பனையின்போது செலுத்தலாம்' : 'Pay upon gate collection or post-harvest sale'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-[#14532D]">
                ₹{totalCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-[#14532D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-[#0F3D2E] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>
              {submitting
                ? (isTa ? 'முன்பதிவு செய்யப்படுகிறது...' : 'Confirming Chamber Reservation...')
                : (isTa ? 'முன்பதிவை உறுதிசெய்து கேட் பாஸ் பெறவும்' : 'Confirm Booking & Generate Gate Pass')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
