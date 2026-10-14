import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Zap, Calculator, X, Volume2 } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const { facilities, language, createBooking, showToast } = useApp();
  const navigate = useNavigate();

  const isTa = language === 'ta';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'solar' | 'nearby'>('all');
  const [selectedFacilityForEst, setSelectedFacilityForEst] = useState<(typeof facilities)[0] | null>(null);

  // Estimator state for bottom sheet
  const [estCrates, setEstCrates] = useState(25);
  const [estDays, setEstDays] = useState(7);
  const [estCrop] = useState('Tomato');

  // Filter list with max 3 chips
  const filteredFacilities = facilities.filter((fac) => {
    const matchesQuery =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.district.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (activeFilter === 'solar') return fac.solarPowered;
    if (activeFilter === 'nearby') return fac.distanceKm <= 5.0;
    return true;
  });

  const handleBookDirect = (facilityId: string) => {
    navigate(`/wizard?facility=${facilityId}`);
  };

  const handleOpenEstimator = (facility: (typeof facilities)[0]) => {
    setSelectedFacilityForEst(facility);
  };

  const handleConfirmReservation = () => {
    if (!selectedFacilityForEst) return;
    const chamber = selectedFacilityForEst.chambers[0];
    const rate = selectedFacilityForEst.pricePerCrateDay || 2.8;
    const totalCost = estCrates * rate * estDays;

    createBooking({
      farmerId: 'far-1',
      farmerName: 'Murugan S.',
      farmerPhone: '+91 98421 77301',
      facilityId: selectedFacilityForEst.id,
      facilityName: selectedFacilityForEst.name,
      chamberId: chamber?.id || 'cham-1',
      chamberName: chamber?.name || 'Solar Chamber 1',
      cropName: estCrop,
      cropNameTa: isTa ? 'தக்காளி' : 'Tomato',
      variety: 'Shivam Hybrid',
      grade: 'Grade A',
      cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      bookedKg: estCrates * 25,
      bookedCrates: estCrates,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + estDays * 86400000).toISOString().split('T')[0],
      durationDays: estDays,
      dailyRateCrate: rate,
      totalEstimatedCost: Math.round(totalCost),
    });

    const bookingCode = '#SRS-TN-7721';
    setSelectedFacilityForEst(null);
    navigate(`/booking/${bookingCode.replace('#', '')}/confirmation`);
  };

  return (
    <div className="w-full pb-28 text-[#1C2420]">
      {/* Search and facility cards container */}
      <div className="px-4 pt-3 space-y-5">

        {/* 1. Search Bar with Voice Assist affordance */}
        <div className="card-heritage p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#0F3D2E]/10 flex items-center justify-center text-[#0F3D2E] flex-shrink-0">
            <Search size={18} strokeWidth={2} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTa ? 'கிராமம் அல்லது கிடங்கு பெயர்...' : 'Search village or cold storage...'}
            className="flex-1 bg-transparent text-sm font-medium text-[#1C2420] placeholder-[#5B6660] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => showToast(isTa ? 'குரல் தேடல் இயக்கப்பட்டது. பேசுங்கள்...' : 'Voice search active. Speak now...', 'info')}
            className="w-9 h-9 rounded-full bg-[#F7F4EC] text-[#5B6660] hover:text-[#0F3D2E] flex items-center justify-center flex-shrink-0"
            aria-label="Voice search"
          >
            <Volume2 size={18} />
          </button>
        </div>

        {/* 2. Filter Chips (Max 3 as per Declutter Rules) */}
        <div className="flex items-center gap-2">
          {/* Chip 1: All */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#0F3D2E]/10 hover:bg-[#F7F4EC]'
            }`}
          >
            {isTa ? 'அனைத்தும்' : 'All hubs'}
          </button>

          {/* Chip 2: Solar */}
          <button
            type="button"
            onClick={() => setActiveFilter('solar')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'solar'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#0F3D2E]/10 hover:bg-[#F7F4EC]'
            }`}
          >
            <Zap size={14} className={activeFilter === 'solar' ? 'text-[#C8923A]' : 'text-[#5B6660]'} />
            <span>{isTa ? 'சூரிய மின்சாரம்' : 'Solar powered'}</span>
          </button>

          {/* Chip 3: < 5 km Nearby */}
          <button
            type="button"
            onClick={() => setActiveFilter('nearby')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'nearby'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#0F3D2E]/10 hover:bg-[#F7F4EC]'
            }`}
          >
            <MapPin size={14} />
            <span>&lt; 5 km</span>
          </button>
        </div>

        {/* 3. Facility Photo Cards */}
        <div className="space-y-4">
          {filteredFacilities.map((facility) => {
            const chamber = facility.chambers[0];
            const price = facility.pricePerCrateDay || 2.8;
            const availableCrates = chamber?.availableCapacityCrates || 240;
            const totalCrates = chamber?.totalCapacityCrates || 600;
            const availablePercent = Math.round((availableCrates / totalCrates) * 100);

            return (
              <div
                key={facility.id}
                className="card-heritage overflow-hidden flex flex-col justify-between"
              >
                {/* Real Chamber Photography with soft dark gradient overlay for text */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={
                      facility.imageUrl ||
                      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Overlaid Badges: Max 2 badges per card rule */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {facility.solarPowered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#14532D]/90 text-white text-[11px] font-bold backdrop-blur-md">
                        <Zap size={12} className="text-[#C8923A]" />
                        <span>{isTa ? 'சூரிய மின்' : 'Solar 100%'}</span>
                      </span>
                    )}
                  </div>

                  {/* Facility Name & Distance over photo */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold text-[#F7F4EC] leading-tight drop-shadow-xs">
                      {isTa ? facility.nameTa : facility.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/80 mt-1">
                      <MapPin size={13} className="text-[#C8923A]" />
                      <span>{facility.location} • {facility.distanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Price per day in gold serif */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-[#5B6660] uppercase tracking-wider font-semibold block">
                        {isTa ? 'கட்டணம் / கூடை' : 'Daily rate per crate'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-serif-hero text-[28px] font-bold text-[#C8923A] leading-none">
                          ₹{price.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#5B6660] font-semibold">
                          {isTa ? '/ நாள்' : '/ day'}
                        </span>
                      </div>
                    </div>

                    {/* Estimate Cost text link affordance */}
                    <button
                      type="button"
                      onClick={() => handleOpenEstimator(facility)}
                      className="text-xs font-semibold text-[#14532D] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Calculator size={14} />
                      <span>{isTa ? 'கட்டணக் கணக்கீடு' : 'Estimate cost'}</span>
                    </button>
                  </div>

                  {/* Availability: Slim 8px progress bar with value label */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#5B6660] mb-1.5 font-medium">
                      <span>{isTa ? 'கிடைக்கும் இடம்' : 'Chamber capacity'}</span>
                      <span className="font-bold text-[#1C2420]">
                        {availableCrates} {isTa ? 'கூடைகள் மீதம்' : 'crates left'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F7F4EC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14532D] rounded-full transition-all duration-300"
                        style={{ width: `${availablePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* One Primary "Book slot" Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleBookDirect(facility.id)}
                      className="btn-primary w-full"
                    >
                      {isTa ? 'இடத்தை முன்பதிவு செய்' : 'Book slot'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Estimate Cost" Bottom Sheet */}
      {selectedFacilityForEst && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C2420]">
                  {isTa ? 'கட்டண மதிப்பீடு' : 'Estimate storage cost'}
                </h3>
                <p className="text-xs text-[#5B6660]">{selectedFacilityForEst.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacilityForEst(null)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs: Crates and Days */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#5B6660] block mb-1">
                  {isTa ? 'கூடைகளின் எண்ணிக்கை' : 'Number of crates'}
                </label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4EC]">
                  <button
                    type="button"
                    onClick={() => setEstCrates(Math.max(5, estCrates - 5))}
                    className="w-9 h-9 rounded-lg bg-white font-bold text-lg text-[#0F3D2E] shadow-xs"
                  >
                    -
                  </button>
                  <span className="font-serif-hero text-xl font-bold text-[#1C2420]">
                    {estCrates} {isTa ? 'கூடை' : 'crates'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEstCrates(estCrates + 5)}
                    className="w-9 h-9 rounded-lg bg-white font-bold text-lg text-[#0F3D2E] shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5B6660] block mb-1">
                  {isTa ? 'சேமிப்பு நாட்கள்' : 'Storage duration'}
                </label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4EC]">
                  <button
                    type="button"
                    onClick={() => setEstDays(Math.max(1, estDays - 1))}
                    className="w-9 h-9 rounded-lg bg-white font-bold text-lg text-[#0F3D2E] shadow-xs"
                  >
                    -
                  </button>
                  <span className="font-serif-hero text-xl font-bold text-[#1C2420]">
                    {estDays} {isTa ? 'நாட்கள்' : 'days'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEstDays(estDays + 1)}
                    className="w-9 h-9 rounded-lg bg-white font-bold text-lg text-[#0F3D2E] shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3.5 rounded-2xl bg-[#E7F5EE] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5B6660] font-medium block">
                    {isTa ? 'மதிப்பிடப்பட்ட மொத்தக் கட்டணம்' : 'Estimated total cost'}
                  </span>
                  <span className="font-serif-hero text-2xl font-bold text-[#14532D]">
                    ₹{Math.round(estCrates * (selectedFacilityForEst.pricePerCrateDay || 2.8) * estDays)}
                  </span>
                </div>
                <span className="text-[11px] text-[#14532D] font-semibold bg-white/70 px-2.5 py-1 rounded-full">
                  {isTa ? 'சூரிய மின் காப்பீடுடன்' : 'Incl. Solar Backup'}
                </span>
              </div>
            </div>

            {/* Reserve Slot Button */}
            <button
              type="button"
              onClick={handleConfirmReservation}
              className="btn-primary w-full"
            >
              {isTa ? 'இடத்தை முன்பதிவு செய்' : 'Reserve slot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
