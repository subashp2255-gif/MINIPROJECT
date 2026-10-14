import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { AlertTriangle } from 'lucide-react';

export const CapacityConflictPage: React.FC = () => {
  const { resolveConflict, language, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [selectedOption, setSelectedOption] = useState<'accept_partial' | 'reroute' | 'reschedule'>('accept_partial');

  const handleConfirmChoice = () => {
    resolveConflict(selectedOption);
    showToast(isTa ? 'உங்கள் தேர்வு பதிவு செய்யப்பட்டு புதுப்பிக்கப்பட்டது!' : 'Choice recorded! Terms and gate pass updated.', 'success');
    navigate('/farmer/home');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Terracotta Alert Header variant as required by art direction */}
      <Header
        customTitle={isTa ? 'இடப்பற்றாக்குறை அறிவிப்பு' : 'Capacity Conflict'}
        customStatus={isTa ? 'முன்பதிவு #SRS-TN-9921' : 'Booking #SRS-TN-9921'}
        isTerracotta={true}
      />

      {/* Conflict container */}
      <div className="px-4 pt-3 space-y-5">

        {/* 1. HERO DEFICIT METRIC CARD */}
        <section className="card-heritage p-5 space-y-3" aria-label="Capacity Deficit Summary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B5472B]">
              {isTa ? 'அவசர பராமரிப்பு அறிவிப்பு' : 'Mandatory inspection notice'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B5472B]/10 text-[#B5472B] text-xs font-bold">
              <AlertTriangle size={13} strokeWidth={2} />
              <span>-40% {isTa ? 'குறைவு' : 'deficit'}</span>
            </span>
          </div>

          <p className="text-xs text-[#5B6660] leading-relaxed">
            {isTa
              ? 'உழவர் சூரிய மின் மையம் அறை 1 இல் கட்டாய பராமரிப்பு காரணமாக 200 கிலோ கொள்ளளவு தற்காலிகமாக குறைக்கப்பட்டுள்ளது.'
              : 'Chamber 1 cooling compressor maintenance requires reducing slot intake by 200 kg for safety.'}
          </p>

          {/* 3 Metric pills */}
          <div className="pt-2 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
              <span className="text-[11px] text-[#5B6660] block">{isTa ? 'பதிவு செய்தது' : 'Booked'}</span>
              <span className="font-serif-hero text-lg font-bold text-[#1C2420]">500 kg</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E7F5EE]">
              <span className="text-[11px] text-[#14532D] block font-semibold">{isTa ? 'இப்போது தயார்' : 'Available'}</span>
              <span className="font-serif-hero text-lg font-bold text-[#14532D]">300 kg</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#B5472B]/10">
              <span className="text-[11px] text-[#B5472B] block font-semibold">{isTa ? 'பற்றாக்குறை' : 'Deficit'}</span>
              <span className="font-serif-hero text-lg font-bold text-[#B5472B]">200 kg</span>
            </div>
          </div>
        </section>

        {/* 2. THREE RADIO-CARD OPTIONS WITH PRICE IMPACT */}
        <section className="space-y-3" aria-label="Resolution Options">
          <h2 className="text-base font-bold text-[#1C2420]">
            {isTa ? 'உங்கள் தீர்வைத் தேர்ந்தெடுக்கவும்' : 'Select resolution choice'}
          </h2>

          <div className="space-y-3">
            {/* Option 1: Accept revised 300 kg */}
            <div
              onClick={() => setSelectedOption('accept_partial')}
              className={`card-heritage p-4 cursor-pointer border-2 transition-all ${
                selectedOption === 'accept_partial'
                  ? 'border-[#14532D] bg-[#E7F5EE]/30'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      selectedOption === 'accept_partial'
                        ? 'border-[#14532D] bg-[#14532D]'
                        : 'border-[#5B6660]'
                    }`}
                  >
                    {selectedOption === 'accept_partial' && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C2420]">
                      {isTa ? '300 கிலோவை ஏற்கவும்' : 'Accept revised 300 kg'}
                    </h3>
                    <p className="text-xs text-[#5B6660] mt-0.5">
                      {isTa
                        ? '300 கிலோ தக்காளி சேமிக்கப்படும்; விடுபட்ட 200 கிலோவிற்கான பணம் உடனே திரும்பத் தரப்படும்.'
                        : 'Store 300 kg today. Instant auto-refund of ₹580 for 200 kg to UPI account.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price impact badge */}
              <div className="mt-3 pt-2 border-t border-[#F7F4EC] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14532D]">
                  {isTa ? 'உடனடி ரீபண்ட்: +₹580' : 'Instant Refund: +₹580'}
                </span>
                <span className="text-[#5B6660]">{isTa ? '15 நிமிடங்களில் வங்கிக்கு' : 'Within 15 mins'}</span>
              </div>
            </div>

            {/* Option 2: Reroute 200 kg to Nearby Hub #18 */}
            <div
              onClick={() => setSelectedOption('reroute')}
              className={`card-heritage p-4 cursor-pointer border-2 transition-all ${
                selectedOption === 'reroute'
                  ? 'border-[#14532D] bg-[#E7F5EE]/30'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      selectedOption === 'reroute'
                        ? 'border-[#14532D] bg-[#14532D]'
                        : 'border-[#5B6660]'
                    }`}
                  >
                    {selectedOption === 'reroute' && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C2420]">
                      {isTa ? '200 கிலோவை மையம் #18-க்கு மாற்று' : 'Reroute 200 kg to Hub #18'}
                    </h3>
                    <p className="text-xs text-[#5B6660] mt-0.5">
                      {isTa
                        ? 'அருகிலுள்ள உழவர் மையம் #18 (4.2 கி.மீ) கூடுதல் கட்டணமின்றி ஒதுக்கப்படும்.'
                        : 'Split batch with Uzhavar Hub #18 (4.2 km away) at guaranteed zero extra fee.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price impact badge */}
              <div className="mt-3 pt-2 border-t border-[#F7F4EC] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#C8923A]">
                  {isTa ? 'கூடுதல் கட்டணம்: ₹0' : 'Extra Charge: ₹0 (Free Transfer)'}
                </span>
                <span className="text-[#5B6660]">4.2 km {isTa ? 'தூரம்' : 'away'}</span>
              </div>
            </div>

            {/* Option 3: Reschedule whole batch to tomorrow */}
            <div
              onClick={() => setSelectedOption('reschedule')}
              className={`card-heritage p-4 cursor-pointer border-2 transition-all ${
                selectedOption === 'reschedule'
                  ? 'border-[#14532D] bg-[#E7F5EE]/30'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      selectedOption === 'reschedule'
                        ? 'border-[#14532D] bg-[#14532D]'
                        : 'border-[#5B6660]'
                    }`}
                  >
                    {selectedOption === 'reschedule' && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C2420]">
                      {isTa ? 'முழு தொகுதியையும் நாளைக்கு மாற்று' : 'Reschedule all to tomorrow'}
                    </h3>
                    <p className="text-xs text-[#5B6660] mt-0.5">
                      {isTa
                        ? 'நாளை காலை 08:00 மணிக்கு அறை 1 முழு கொள்ளளவுடன் தயாராகும்.'
                        : 'Shift entire 500 kg batch intake to tomorrow morning 08:00 AM without penalty.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price impact badge */}
              <div className="mt-3 pt-2 border-t border-[#F7F4EC] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#5B6660]">
                  {isTa ? 'கட்டண மாற்றம் இல்லை' : 'No price change'}
                </span>
                <span className="text-[#5B6660]">{isTa ? 'நாளை காலை 08:00' : 'Tomorrow 08:00 AM'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ONE "CONFIRM CHOICE" BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmChoice}
            className="btn-primary w-full"
          >
            {isTa ? 'தேர்வை உறுதிசெய்' : 'Confirm choice'}
          </button>
        </div>

      </div>
    </div>
  );
};
