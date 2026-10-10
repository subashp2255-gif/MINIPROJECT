import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { facilities, language, reviews } = useApp();

  const facility = facilities.find((f) => f.id === facilityId) || facilities[0];
  const facilityReviews = reviews.filter((r) => r.facilityId === facility.id);

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Back Link & Header */}
        <div className="flex items-center gap-2">
          <Link
            to="/discovery"
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#161d18] shadow-xs border border-[#dfe4dc]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#161d18]">
              {language === 'ta' ? facility.nameTa : facility.name}
            </h1>
            <p className="text-xs text-[#404941]">{facility.location} • {facility.distanceKm} km</p>
          </div>
        </div>

        {/* Hero Image & Verified Status */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-sm border border-[#dfe4dc]">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#006c49] text-xs font-bold flex items-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              TN-Agri Certified Hub
            </span>
            {facility.solarPowered && (
              <span className="px-2.5 py-1 rounded-full bg-[#aff2c2] text-[#00210f] text-xs font-bold flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[15px]">solar_power</span>
                Solar Backup Active
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1">
            <span>★ {facility.rating}</span>
            <span className="text-gray-300 font-normal">({facility.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Key Operational Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl border border-[#dfe4dc] shadow-2xs text-center">
            <span className="text-[10px] text-[#404941] uppercase tracking-wider font-semibold block">
              Base Rate
            </span>
            <span className="text-base font-extrabold text-[#1e5e3a] mt-0.5 block">
              ₹{facility.pricePerCrateDay}
            </span>
            <span className="text-[10px] text-[#404941]">/ crate / day</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#dfe4dc] shadow-2xs text-center">
            <span className="text-[10px] text-[#404941] uppercase tracking-wider font-semibold block">
              Available
            </span>
            <span className="text-base font-extrabold text-[#006c49] mt-0.5 block">
              {facility.chambers.reduce((a, b) => a + b.availableCapacityCrates, 0)}
            </span>
            <span className="text-[10px] text-[#404941]">Crates Ready</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#dfe4dc] shadow-2xs text-center">
            <span className="text-[10px] text-[#404941] uppercase tracking-wider font-semibold block">
              Telemetry
            </span>
            <span className="text-base font-extrabold text-[#161d18] mt-0.5 block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-ping"></span>
              Live
            </span>
            <span className="text-[10px] text-[#404941]">4m sync</span>
          </div>
        </div>

        {/* Chambers Specifications */}
        <div className="bg-white rounded-2xl p-4 border border-[#dfe4dc] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161d18] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#1e5e3a]">nest_multi_room</span>
              Chambers &amp; Storage Units
            </h2>
            <span className="text-xs text-[#404941]">{facility.chambers.length} Units</span>
          </div>

          <div className="space-y-2.5">
            {facility.chambers.map((cham) => (
              <div
                key={cham.id}
                className={`p-3 rounded-xl border transition-all ${
                  cham.isMaintenance
                    ? 'bg-[#ffdcc6]/20 border-[#ffb786]'
                    : 'bg-[#eef6ed] border-[#dde4dd]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#161d18]">{cham.name}</h4>
                    <p className="text-[11px] text-[#404941]">
                      Target Range: {cham.tempMin}°C - {cham.tempMax}°C
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cham.isMaintenance
                        ? 'bg-[#844000] text-white'
                        : 'bg-[#86f8c2] text-[#00210f]'
                    }`}
                  >
                    {cham.isMaintenance ? 'Calibration Block' : 'Active Sensor'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#dde4dd]/60 text-xs">
                  <div className="flex items-center gap-1 text-[#1e5e3a] font-bold">
                    <span className="material-symbols-outlined text-[14px]">thermostat</span>
                    {cham.currentTemp}°C
                  </div>
                  <div className="flex items-center gap-1 text-[#1e5e3a] font-bold">
                    <span className="material-symbols-outlined text-[14px]">humidity_mid</span>
                    {cham.humidity}% RH
                  </div>
                  <div className="text-[11px] text-[#404941] ml-auto font-medium">
                    {cham.availableCapacityCrates} of {cham.totalCapacityCrates} crates free
                  </div>
                </div>

                {cham.isMaintenance && (
                  <p className="text-[11px] text-[#844000] font-medium mt-1">
                    ⚠️ {cham.maintenanceReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Manager & Contact */}
        <div className="bg-white rounded-2xl p-4 border border-[#dfe4dc] shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={facility.managerImage}
              alt={facility.managerName}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h4 className="text-xs font-bold text-[#161d18]">{facility.managerName}</h4>
              <p className="text-[11px] text-[#404941]">Facility Supervisor</p>
              <p className="text-[11px] text-[#1e5e3a] font-semibold">{facility.operatingHours}</p>
            </div>
          </div>
          <a
            href={`tel:${facility.contactPhone}`}
            className="w-10 h-10 rounded-full bg-[#e9f0e8] text-[#1e5e3a] flex items-center justify-center hover:bg-[#e3eae2]"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </a>
        </div>

        {/* Verified Reviews */}
        <div className="bg-white rounded-2xl p-4 border border-[#dfe4dc] shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#161d18]">Verified Farmer Reviews</h2>
          <div className="space-y-2.5">
            {facilityReviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-[#eef6ed] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#161d18]">{rev.farmerName}</span>
                  <span className="text-[#006c49] font-bold">★ {rev.rating}.0</span>
                </div>
                <p className="text-[#404941]">{rev.comment}</p>
                <span className="text-[10px] text-gray-500 font-mono block">
                  Verified Booking #{rev.bookingCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Bottom Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            to={`/live-inspection/TN-DDG-088?facilityId=${facility.id}`}
            className="h-12 rounded-xl bg-[#e9f0e8] text-[#1e5e3a] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#e3eae2] active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            <span>Schedule Inspection</span>
          </Link>

          <Link
            to={`/wizard?facilityId=${facility.id}`}
            className="h-12 rounded-xl bg-[#1e5e3a] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#16462b] active:scale-98 transition-all shadow-xs"
          >
            <span>Book Capacity</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
