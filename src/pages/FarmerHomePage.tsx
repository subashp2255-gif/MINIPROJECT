import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Clock,
  TrendingUp,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Calendar
} from 'lucide-react';

export const FarmerHomePage: React.FC = () => {
  const { language, batches, showToast } = useApp();
  const navigate = useNavigate();

  const isTa = language === 'ta';

  // Active batch data
  const activeBatch = batches[0] || {
    batchCode: '#TN-DDG-088',
    cropName: 'Tomato',
    cropNameTa: 'தக்காளி',
    cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    currentStockKg: 420,
    currentStockCrates: 17,
    currentTemp: 2.8,
    currentHumidity: 89,
    dayCurrent: 4,
    dayTotal: 10,
    status: 'in_storage',
  };

  const handleConfirmArrival = () => {
    showToast(isTa ? 'வருகை உறுதி செய்யப்பட்டது! பே #3 நுழைவு அனுமதி தயார்.' : 'Arrival confirmed! Bay #3 entry pass active.', 'success');
  };

  const handleReschedule = () => {
    showToast(isTa ? 'நேரம் மாற்றும் கோரிக்கை திண்டுக்கல் மையத்திற்கு அனுப்பப்பட்டது.' : 'Reschedule request sent to Dindigul Hub.', 'info');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Main Content Area - Aligned cleanly below the separate greeting section */}
      <div className="px-3.5 sm:px-4 pt-3 space-y-5 sm:space-y-6">

        {/* 1. TELEMETRY CARD: Active Chamber Telemetry */}
        <section
          onClick={() => navigate('/farmer/inventory')}
          className="card-dashboard p-4 sm:p-5 relative cursor-pointer"
          aria-label="Active Chamber Telemetry"
        >
          {/* Header: Section label on left, Optimal badge on right */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6660]">
              {isTa ? 'செயலில் உள்ள சேமிப்பக அறை' : 'Active chamber telemetry'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-semibold flex-shrink-0">
              <CheckCircle2 size={13} strokeWidth={2} />
              <span>{isTa ? 'சரியானது' : 'Optimal'}</span>
            </span>
          </div>

          {/* Chamber Information: Readable title */}
          <h2 className="text-base sm:text-lg font-bold text-[#1C2420] mt-1.5 leading-snug">
            {isTa ? 'உழவர் சூரிய மின் மையம் · அறை 1' : 'Uzhavar Solar Hub · Chamber 1'}
          </h2>

          {/* Temperature (prominent left) and Humidity (proportional right gauge) */}
          <div className="my-3.5 sm:my-4 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="font-serif-hero text-4xl sm:text-[42px] font-bold text-[#0F3D2E] tracking-tight leading-none">
                  {activeBatch.currentTemp ?? 2.8}
                </span>
                <span className="text-2xl font-bold text-[#5B6660]">°C</span>
              </div>
              <span className="text-xs text-[#5B6660] mt-1.5 font-medium">
                {isTa ? 'இலக்கு வரம்பு: 2.5°C முதல் 4.0°C வரை' : 'Target range: 2.5°C to 4.0°C'}
              </span>
            </div>

            {/* Circular Humidity Indicator */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
              <svg className="w-18 h-18 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[#E7F5EE]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Value Progress Ring (89% humidity) */}
                <path
                  className="text-[#C8923A]"
                  strokeDasharray="89, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-[#1C2420] leading-none">89%</span>
                <span className="text-[10px] text-[#5B6660] font-medium mt-0.5 leading-none">
                  {isTa ? 'ஈரப்பதம்' : 'Humidity'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Solar Grid Status and Details action */}
          <div className="pt-3 border-t border-[#E5E9E4] flex items-center justify-between text-xs text-[#5B6660]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap size={14} className="text-[#C8923A] flex-shrink-0" />
              <span className="truncate">{isTa ? 'சூரிய மின்கட்டமைப்பு 100% இயங்குகிறது' : 'Solar grid 100% active'}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[#14532D] font-semibold flex-shrink-0">
              <span>{isTa ? 'விவரம்' : 'Details'}</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </section>

        {/* 2. SCHEDULED PICKUP CARD */}
        <section
          className="card-dashboard p-4 sm:p-5 border-l-4 border-l-[#C8923A] space-y-3.5"
          aria-label="Next Scheduled Pickup"
        >
          {/* Pickup Header: Clock icon, label, date/time, and status badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center flex-shrink-0">
                <Clock size={18} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8923A] block truncate">
                  {isTa ? 'அடுத்த மீட்பு நேரம்' : 'Next scheduled pickup'}
                </span>
                <span className="text-xs text-[#5B6660] font-medium block truncate">
                  {isTa ? 'நாளை, காலை 09:30' : 'Tomorrow, 09:30 AM'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8923A]/15 text-[#C8923A] text-xs font-semibold flex-shrink-0">
              <AlertTriangle size={12} strokeWidth={2} />
              <span>{isTa ? 'நாளை' : 'Tomorrow'}</span>
            </span>
          </div>

          {/* Pickup Details: Quantity, crop type, and terminal information */}
          <div>
            <h3 className="text-base font-bold text-[#1C2420]">
              {isTa ? '50 கூடைகள் உருளைக்கிழங்கு மீட்பு' : '50 Crates Potato Intake'}
            </h3>
            <p className="text-xs text-[#5B6660] leading-relaxed mt-1">
              {isTa
                ? 'திண்டுக்கல் முனையம் பே #3 · டிஜிட்டல் நுழைவுச் சீட்டு QR-ஐ தயாராக வைக்கவும்'
                : 'Dindigul Terminal Bay #3 · Present digital gate pass QR at inbound desk'}
            </p>
          </div>

          {/* Actions: Primary "Confirm arrival" + secondary "Reschedule" */}
          <div className="pt-1 flex flex-col gap-1.5 items-center">
            <button
              type="button"
              onClick={handleConfirmArrival}
              className="btn-urgent w-full"
            >
              {isTa ? 'வருகையை உறுதிசெய்' : 'Confirm arrival'}
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              className="btn-text-link"
            >
              {isTa ? 'நேரத்தை மாற்றியமைக்க' : 'Reschedule'}
            </button>
          </div>
        </section>

        {/* 3. PRODUCE SECTION: "My produce" list */}
        <section className="space-y-3" aria-label="My Produce Section">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1C2420]">
              {isTa ? 'எனது விளைபொருட்கள்' : 'My produce'}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/farmer/inventory')}
              className="text-xs sm:text-sm font-semibold text-[#14532D] hover:underline cursor-pointer"
            >
              {isTa ? 'அனைத்தும் காண்க' : 'View all'}
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Item 1: Tomato */}
            <div
              onClick={() => navigate('/farmer/inventory')}
              className="card-dashboard p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80"
                  alt="Tomato crop"
                  className="w-14 h-14 rounded-xl object-cover shadow-2xs flex-shrink-0"
                />
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#1C2420] truncate">
                    {isTa ? 'வீரிய தக்காளி' : 'Hybrid Tomato'}
                  </h3>
                  <p className="text-xs text-[#5B6660] truncate">
                    <span className="font-semibold text-[#1C2420]">420 kg</span> · 17 {isTa ? 'கூடைகள்' : 'crates'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5B6660]">
                    <Calendar size={12} className="text-[#14532D] flex-shrink-0" />
                    <span className="truncate">
                      {isTa ? '6 நாட்கள் மீதம்' : '6 days remaining'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#94A3B8] flex-shrink-0" />
            </div>

            {/* Item 2: Red Onion */}
            <div
              onClick={() => navigate('/farmer/inventory')}
              className="card-dashboard p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=200&q=80"
                  alt="Onion crop"
                  className="w-14 h-14 rounded-xl object-cover shadow-2xs flex-shrink-0"
                />
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#1C2420] truncate">
                    {isTa ? 'சின்ன வெங்காயம்' : 'Shallots (Red Onion)'}
                  </h3>
                  <p className="text-xs text-[#5B6660] truncate">
                    <span className="font-semibold text-[#1C2420]">350 kg</span> · 14 {isTa ? 'கூடைகள்' : 'crates'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5B6660]">
                    <Calendar size={12} className="text-[#14532D] flex-shrink-0" />
                    <span className="truncate">
                      {isTa ? '12 நாட்கள் மீதம்' : '12 days remaining'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#94A3B8] flex-shrink-0" />
            </div>
          </div>
        </section>

        {/* 4. MANDI PRICE FORECAST CARD */}
        <section
          onClick={() => navigate('/ai-arbitrage')}
          className="card-dashboard p-4 sm:p-5 space-y-3 cursor-pointer"
          aria-label="Mandi Price Forecast"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#1C2420] truncate">
                  {isTa ? 'மண்டி விலை கணிப்பு' : 'Mandi price forecast'}
                </h3>
                <span className="text-[11px] text-[#5B6660] block truncate">
                  {isTa ? 'ஒட்டன்சத்திரம் சந்தை' : 'Oddanchatram Market'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-bold flex-shrink-0">
              <TrendingUp size={13} strokeWidth={2} />
              <span>+58%</span>
            </span>
          </div>

          <div className="flex items-end justify-between pt-1 gap-2">
            <div>
              <span className="text-xs text-[#5B6660] block font-medium">
                {isTa ? 'எதிர்பார்க்கப்படும் உச்ச விலை' : 'Projected peak price'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-hero text-3xl sm:text-[34px] font-bold text-[#C8923A] leading-none">
                  ₹38.50
                </span>
                <span className="text-xs text-[#5B6660] font-semibold">/ kg</span>
              </div>
              <span className="text-[11px] text-[#5B6660] mt-1 block">
                {isTa ? '5 நாட்களில் வார இறுதி ஏற்றம்' : 'In 5 days · Weekend spike'}
              </span>
            </div>

            {/* Sparkline SVG */}
            <div className="w-24 h-11 flex items-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <polyline
                  fill="none"
                  stroke="#C8923A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="5,35 25,32 45,26 65,18 85,8 95,5"
                />
                <circle cx="95" cy="5" r="3.5" fill="#C8923A" />
              </svg>
            </div>
          </div>
        </section>

        {/* 5. PRIMARY ACTION BUTTON */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => navigate('/discovery')}
            className="btn-primary w-full shadow-sm flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            <span>{isTa ? 'அறை முன்பதிவு செய்' : 'Book slot'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
