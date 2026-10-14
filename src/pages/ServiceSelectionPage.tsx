import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppLogo } from '../components/AppLogo';
import { Snowflake, PackageCheck, ArrowRight } from 'lucide-react';

export const ServiceSelectionPage: React.FC = () => {
  const { language, setLanguage, setServiceMode } = useApp();
  const navigate = useNavigate();

  const handleSelectService = (mode: 'cold' | 'inventory') => {
    setServiceMode(mode);
    if (mode === 'cold') {
      navigate('/farmer/home');
    } else {
      navigate('/farmer/inventory');
    }
  };

  const isTa = language === 'ta';

  return (
    <div className="relative min-h-screen w-full bg-[#0F3D2E] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Full-bleed farm landscape photo with deep green gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
          alt="Tamil Nadu lush farmland landscape"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D2E]/85 via-[#0F3D2E]/90 to-[#0F3D2E]" />
        <div className="absolute inset-0 bg-leaf-pattern opacity-40 pointer-events-none" />
      </div>

      {/* Simulated 44px top status bar */}
      <div className="relative z-10 h-11 px-5 flex items-center justify-between text-white/80 text-[13px] font-medium tracking-tight">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
          </svg>
          <div className="w-5 h-2.5 rounded-sm border border-white/80 p-0.5 flex items-center">
            <div className="h-full w-3/4 bg-white rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-4 py-4 flex-1 flex flex-col justify-center max-w-[390px] mx-auto w-full">
        {/* Logo and Brand */}
        <div className="flex flex-col items-start gap-3">
          <AppLogo size={48} className="ring-2 ring-[#C8923A]/50 shadow-lg" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C8923A] text-xs font-semibold tracking-wide backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8923A] animate-pulse"></span>
            {isTa ? 'வேளாண் குளிர்பதன கட்டமைப்பு' : 'Agri Cold & Storage Network'}
          </span>
          <h1
            className={`text-[32px] leading-[1.2] font-semibold text-[#F7F4EC] tracking-tight ${
              isTa ? 'font-tamil-serif' : 'font-serif-hero'
            }`}
          >
            {isTa ? 'ஸ்மார்ட் கிராமப்புற\nசேமிப்பகம்' : 'Smart Rural\nStorage'}
          </h1>
          <p className="text-sm text-white/80 font-normal leading-relaxed">
            {isTa
              ? 'விவசாயிகளுக்கான சூரிய மின் குளிர்பதன கிடங்கு மற்றும் சரக்கு மேலாண்மை.'
              : 'Preserve harvest quality, prevent distress sales, and maximize mandi profits.'}
          </p>
        </div>

        {/* First-launch Language Selector: TWO LARGE CARDS "தமிழ்" and "English" */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 block">
            {isTa ? 'மொழியைத் தேர்ந்தெடுக்கவும்' : 'Choose language'}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                language === 'ta'
                  ? 'bg-[#F7F4EC] text-[#0F3D2E] border-[#C8923A] shadow-md font-bold'
                  : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'
              }`}
            >
              <span className="font-tamil-serif text-lg font-bold">தமிழ்</span>
              <span className={`text-[11px] ${language === 'ta' ? 'text-[#0F3D2E]/80' : 'text-white/60'}`}>
                Tamil
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                language === 'en'
                  ? 'bg-[#F7F4EC] text-[#0F3D2E] border-[#C8923A] shadow-md font-bold'
                  : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'
              }`}
            >
              <span className="font-serif-hero text-lg font-bold">English</span>
              <span className={`text-[11px] ${language === 'en' ? 'text-[#0F3D2E]/80' : 'text-white/60'}`}>
                ஆங்கிலம்
              </span>
            </button>
          </div>
        </div>

        {/* Two Stacked Service Cards (Manage Inventory / Find Cold Storage) */}
        <div className="mt-6 space-y-3">
          {/* Service Card 1: Find Cold Storage */}
          <div className="card-heritage bg-[#FFFFFF] text-[#1C2420] p-4 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center flex-shrink-0">
                <Snowflake size={22} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#1C2420]">
                  {isTa ? 'குளிர்பதன கிடங்கு தேடு' : 'Find cold storage'}
                </h2>
                <p className="text-xs text-[#5B6660] mt-0.5 line-clamp-1">
                  {isTa
                    ? 'சூரிய மின் அறைகள் மற்றும் நேரலை வெப்பநிலை'
                    : 'Reserve solar chambers with live IoT sensors'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleSelectService('cold')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>{isTa ? 'கிடங்கு முன்பதிவு செய்' : 'Find storage'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Service Card 2: Manage Inventory */}
          <div className="card-heritage bg-[#FFFFFF] text-[#1C2420] p-4 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center flex-shrink-0">
                <PackageCheck size={22} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#1C2420]">
                  {isTa ? 'சரக்கிருப்பு மேலாண்மை' : 'Manage inventory'}
                </h2>
                <p className="text-xs text-[#5B6660] mt-0.5 line-clamp-1">
                  {isTa
                    ? 'விளைபொருள் தொகுதிகள் மற்றும் வாயில் நுழைவுச் சீட்டு'
                    : 'Track crates, batch lifespan & gate QR passes'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleSelectService('inventory')}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <span>{isTa ? 'சரக்கிருப்பை நிர்வகி' : 'Manage inventory'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Direct Link to Style Guide */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/style-guide')}
            className="text-xs text-[#C8923A] hover:underline cursor-pointer"
          >
            {isTa ? '🎨 வடிவமைப்பு வழிகாட்டியைக் காண்க (Style Guide)' : '🎨 View Design Style Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
