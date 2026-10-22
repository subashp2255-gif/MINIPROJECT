import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, Video, Star, Building2, Thermometer, Droplets, Phone } from 'lucide-react';

export const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { facilities, language, reviews } = useApp();
  const isTa = language === 'ta';

  const facility = facilities.find((f) => f.id === facilityId) || facilities[0];
  const facilityReviews = reviews.filter((r) => r.facilityId === facility.id);

  return (
    <div className="flex flex-col relative w-full pt-3 pb-28 text-[#1C2420]">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Back Link & Header */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/discovery"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1C2420] shadow-2xs border border-[#DFE4DC] hover:bg-[#F7F4EC] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1C2420]">
              {isTa ? facility.nameTa : facility.name}
            </h1>
            <p className="text-xs text-[#5B6660]">{facility.location} • {facility.distanceKm} km</p>
          </div>
        </div>

        {/* Hero Image & Verified Status */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-sm border border-[#DFE4DC]">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#14532D] text-xs font-bold flex items-center gap-1 shadow-2xs">
              <ShieldCheck size={14} className="text-[#14532D]" />
              TN-Agri Certified Hub
            </span>
            {facility.solarPowered && (
              <span className="px-2.5 py-1 rounded-full bg-[#AFF2C2] text-[#00210F] text-xs font-bold flex items-center gap-1 shadow-2xs">
                <Zap size={14} className="text-[#14532D]" />
                Solar Backup Active
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1">
            <Star size={13} className="text-[#C8923A] fill-[#C8923A]" />
            <span>{facility.rating}</span>
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
        <div className="bg-white rounded-2xl p-4 border border-[#DFE4DC] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C2420] flex items-center gap-1.5">
              <Building2 size={16} className="text-[#14532D]" />
              <span>{isTa ? 'குளிர்சாதன அறைகள்' : 'Chambers & Storage Units'}</span>
            </h2>
            <span className="text-xs text-[#5B6660]">{facility.chambers.length} {isTa ? 'அறைகள்' : 'Units'}</span>
          </div>

          <div className="space-y-2.5">
            {facility.chambers.map((cham) => (
              <div
                key={cham.id}
                className={`p-3 rounded-xl border transition-all ${
                  cham.isMaintenance
                    ? 'bg-[#FFDCC6]/20 border-[#FFB786]'
                    : 'bg-[#EEF6ED] border-[#DDE4DD]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2420]">{cham.name}</h4>
                    <p className="text-[11px] text-[#5B6660]">
                      Target Range: {cham.tempMin}°C - {cham.tempMax}°C
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cham.isMaintenance
                        ? 'bg-[#844000] text-white'
                        : 'bg-[#86F8C2] text-[#00210F]'
                    }`}
                  >
                    {cham.isMaintenance ? 'Calibration Block' : 'Active Sensor'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#DDE4DD]/60 text-xs">
                  <div className="flex items-center gap-1 text-[#14532D] font-bold">
                    <Thermometer size={14} />
                    <span>{cham.currentTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#14532D] font-bold">
                    <Droplets size={14} />
                    <span>{cham.humidity}% RH</span>
                  </div>
                  <div className="text-[11px] text-[#5B6660] ml-auto font-medium">
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
        <div className="bg-white rounded-2xl p-4 border border-[#DFE4DC] shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={facility.managerImage}
              alt={facility.managerName}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h4 className="text-xs font-bold text-[#1C2420]">{facility.managerName}</h4>
              <p className="text-[11px] text-[#5B6660]">{isTa ? 'கிடங்கு மேற்பார்வையாளர்' : 'Facility Supervisor'}</p>
              <p className="text-[11px] text-[#14532D] font-semibold">{facility.operatingHours}</p>
            </div>
          </div>
          <a
            href={`tel:${facility.contactPhone}`}
            className="w-10 h-10 rounded-full bg-[#EEF6ED] text-[#14532D] flex items-center justify-center hover:bg-[#E3EAE2] transition-colors"
            title="Call supervisor"
          >
            <Phone size={18} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <Link
            to={`/live-inspection/TN-DDG-088?facilityId=${facility.id}`}
            className="h-12 rounded-xl border border-[#DFE4DC] bg-white text-[#14532D] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F4FBF3] active:scale-98 transition-all cursor-pointer shadow-2xs"
          >
            <Video size={16} />
            <span>{isTa ? 'நேரடி வீடியோ ஆய்வு' : 'Schedule Video Inspection'}</span>
          </Link>

          <Link
            to={`/wizard?facilityId=${facility.id}`}
            className="h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0F3D2E] active:scale-98 transition-all shadow-xs cursor-pointer"
          >
            <span>{isTa ? 'குளிர்பதன முன்பதிவு' : 'Book Cold Storage'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
