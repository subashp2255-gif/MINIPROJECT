import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const DiscoveryPage: React.FC = () => {
  const { facilities, language } = useApp();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [solarOnly, setSolarOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialView);
  const [selectedPinFacility, setSelectedPinFacility] = useState<string | null>(facilities[0].id);

  const crops = ['all', 'Tomato', 'Potato', 'Onion', 'Chillies', 'Banana'];

  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop =
      selectedCrop === 'all' ||
      fac.supportedCrops.some((c) => c.toLowerCase().includes(selectedCrop.toLowerCase()));

    const matchesSolar = !solarOnly || fac.solarPowered;

    return matchesSearch && matchesCrop && matchesSolar;
  });

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Search & Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e5e3a]">Find Cold Storage</h1>
            <p className="text-xs text-[#404941]">Oddanchatram, Dindigul &amp; Palani Agro Cluster</p>
          </div>

          {/* List / Map View Toggle */}
          <div className="flex items-center bg-[#e9f0e8] p-1 rounded-full border border-[#c0c9bf]/30">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-[#1e5e3a] text-white shadow-xs' : 'text-[#404941]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-[#1e5e3a] text-white shadow-xs' : 'text-[#404941]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#707971] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, village, or town..."
            className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-[#c0c9bf] text-xs font-medium focus:border-[#1e5e3a] focus:ring-1 focus:ring-[#1e5e3a] outline-hidden shadow-2xs"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
                selectedCrop === crop
                  ? 'bg-[#1e5e3a] text-white shadow-xs'
                  : 'bg-[#e9f0e8] text-[#404941] hover:bg-[#e3eae2]'
              }`}
            >
              {crop === 'all' ? 'All Crops' : crop}
            </button>
          ))}

          <button
            onClick={() => setSolarOnly(!solarOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 flex items-center gap-1 border transition-colors ${
              solarOnly
                ? 'bg-[#86f8c2] text-[#00210f] border-[#006c49]'
                : 'bg-white text-[#404941] border-[#c0c9bf]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">solar_power</span>
            <span>Solar Powered</span>
          </button>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-2xl p-4 border border-[#dfe4dc] shadow-sm space-y-3">
            <div className="relative h-64 bg-[#eef6ed] rounded-xl overflow-hidden border border-[#dde4dd] flex items-center justify-center">
              {/* Illustrated Regional GIS Map */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e5e3a_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Road lines */}
              <svg className="absolute inset-0 w-full h-full text-emerald-300 stroke-current" strokeWidth="2">
                <line x1="20" y1="50" x2="180" y2="120" />
                <line x1="180" y1="120" x2="350" y2="90" />
                <line x1="180" y1="120" x2="220" y2="220" />
              </svg>

              {/* Facility Markers */}
              {filteredFacilities.map((fac, idx) => (
                <button
                  key={fac.id}
                  onClick={() => setSelectedPinFacility(fac.id)}
                  style={{ top: `${35 + idx * 25}%`, left: `${25 + idx * 30}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-md transition-all ${
                    selectedPinFacility === fac.id
                      ? 'bg-[#1e5e3a] text-white scale-125 z-10 ring-4 ring-[#86f8c2]'
                      : 'bg-white text-[#1e5e3a] hover:scale-110'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">warehouse</span>
                </button>
              ))}

              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-[#1e5e3a]">
                Dindigul APMC Agri Corridor GIS
              </div>
            </div>

            {/* Selected Map Card */}
            {selectedPinFacility && (() => {
              const fac = facilities.find((f) => f.id === selectedPinFacility);
              if (!fac) return null;
              return (
                <div className="p-3 bg-[#eef6ed] rounded-xl flex items-center justify-between gap-3 border border-[#dde4dd]">
                  <div>
                    <h4 className="text-xs font-bold text-[#161d18]">{fac.name}</h4>
                    <p className="text-[11px] text-[#404941]">{fac.location} • {fac.distanceKm} km away</p>
                    <span className="text-[10px] font-bold text-[#006c49]">₹{fac.pricePerCrateDay}/crate/day</span>
                  </div>
                  <Link
                    to={`/facility/${fac.id}`}
                    className="px-3 py-1.5 bg-[#1e5e3a] text-white rounded-lg text-xs font-bold shadow-xs hover:bg-[#16462b]"
                  >
                    View Details
                  </Link>
                </div>
              );
            })()}
          </div>
        )}

        {/* List of Facilities */}
        <div className="space-y-3">
          {filteredFacilities.map((facility) => {
            const availableCrates = facility.chambers.reduce(
              (acc, c) => acc + c.availableCapacityCrates,
              0
            );

            return (
              <div
                key={facility.id}
                className="bg-white rounded-2xl shadow-sm border border-[#dfe4dc] overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {facility.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#006c49] text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        TN-Agri Verified
                      </span>
                    )}
                    {facility.solarPowered && (
                      <span className="px-2 py-0.5 rounded-full bg-[#aff2c2] text-[#00210f] text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">solar_power</span>
                        Solar Backup
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-xs font-bold">
                    ★ {facility.rating} ({facility.reviewCount})
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#161d18]">
                        {language === 'ta' ? facility.nameTa : facility.name}
                      </h3>
                      <p className="text-xs text-[#404941]">
                        {facility.location} • <span className="font-semibold text-[#1e5e3a]">{facility.distanceKm} km away</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#1e5e3a]">
                        ₹{facility.pricePerCrateDay}
                      </span>
                      <span className="text-[10px] text-[#404941] block">/ crate / day</span>
                    </div>
                  </div>

                  {/* Chamber availability strip */}
                  <div className="bg-[#eef6ed] rounded-xl p-2.5 flex items-center justify-between text-xs border border-[#dde4dd]">
                    <div className="flex items-center gap-1.5 text-[#006c49] font-bold">
                      <span className="material-symbols-outlined text-[16px]">shelves</span>
                      <span>{availableCrates} Crates Available</span>
                    </div>
                    <span className="text-[10px] text-[#404941]">
                      Updated {facility.lastUpdatedMinutesAgo} mins ago
                    </span>
                  </div>

                  {/* Supported crops tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {facility.supportedCrops.slice(0, 3).map((crop) => (
                      <span
                        key={crop}
                        className="px-2 py-0.5 rounded-md bg-[#e9f0e8] text-[#404941] text-[10px] font-medium"
                      >
                        {crop}
                      </span>
                    ))}
                    {facility.supportedCrops.length > 3 && (
                      <span className="text-[10px] text-gray-500 font-semibold">
                        +{facility.supportedCrops.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#dde4dd]">
                    <Link
                      to={`/facility/${facility.id}`}
                      className="flex-1 h-11 rounded-xl bg-[#e9f0e8] text-[#1e5e3a] text-xs font-bold flex items-center justify-center hover:bg-[#e3eae2] transition-colors"
                    >
                      Facility Details
                    </Link>
                    <Link
                      to={`/wizard?facilityId=${facility.id}`}
                      className="flex-1 h-11 rounded-xl bg-[#1e5e3a] text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#16462b] shadow-xs transition-colors"
                    >
                      <span>Book Space</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
