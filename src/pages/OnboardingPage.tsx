import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Snowflake, Package, Bell, ArrowRight, ArrowLeft, Check, Globe } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Snowflake size={40} className="text-[#134E35]" />,
      badge: isTa ? 'அடி 1 • குளிர்பதன முன்பதிவு' : 'Step 1 • Cold Storage',
      title: isTa ? 'அழுகக்கூடிய விளைபொருட்களுக்கு குளிர்பதன அறை' : 'Find & Book Cold Storage for Perishables',
      desc: isTa
        ? 'தக்காளி, வெங்காயம், காய்கறிகள் போன்ற அழுகும் பயிர்களுக்கு தகுதியான சூரிய மின் குளிர்சாதன அறைகளைக் கண்டறிந்து, இடப்பற்றாக்குறை இல்லாமல் முன்கூட்டியே பதிவு செய்யுங்கள்.'
        : 'Discover multi-chamber cold storage facilities with real-time temperature control. Avoid distress selling by reserving rated capacity near your farm.',
      illustration: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    },
    {
      icon: <Package size={40} className="text-[#C8923A]" />,
      badge: isTa ? 'அடி 2 • தானிய இருப்பு மேலாண்மை' : 'Step 2 • Dry Inventory',
      title: isTa ? 'உலர்ந்த தானியங்கள் மற்றும் பயிர்களை எளிதாக நிர்வகிக்கவும்' : 'Record & Manage Dry Agricultural Stock Easily',
      desc: isTa
        ? 'நெல், கோதுமை, பருப்பு வகைகள் மற்றும் தானியங்களை குளிர்பதன முன்பதிவு தேவையின்றி தனியாக பதிவு செய்து, இருப்பு வரவு/செலவு மற்றும் மாற்றங்களை கண்காணிக்கலாம்.'
        : 'Manage your dry farm harvest — paddy, wheat, pulses, and grains — with zero cold storage prerequisite. Track multi-unit movements, godowns, and transfers.',
      illustration: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      icon: <Bell size={40} className="text-[#368638]" />,
      badge: isTa ? 'அடி 3 • நினைவூட்டல்கள் & கண்காணிப்பு' : 'Step 3 • Alerts & Reminders',
      title: isTa ? 'பயனுள்ள நினைவூட்டல்கள் & முக்கிய நடவடிக்கைகள்' : 'Receive Useful Reminders & Track Activities',
      desc: isTa
        ? 'வாயில் வருகை, டிஜிட்டல் எடை சரிபார்ப்பு, குறைந்த இருப்பு எச்சரிக்கை மற்றும் திரும்பப் பெறும் தேதிகளை உடனடியாக அறிந்து கொள்ளுங்கள்.'
        : 'Get timely alerts for gate check-in, verified scale intake, pickup schedules, and low-stock triggers before your warehouse runs out.',
      illustration: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFinish = () => {
    localStorage.setItem('srs_onboarded', 'true');
    navigate('/login');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const current = steps[currentStep];

  return (
    <div className="w-full min-h-screen bg-[#F4FBF3] text-[#1C2420] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header: Language Switch & Skip Button */}
      <div className="flex items-center justify-between max-w-lg mx-auto w-full pt-2">
        {/* Language selector (Screen 3) */}
        <div className="flex items-center gap-1 bg-white border border-[#DFE4DC] rounded-full p-1 shadow-xs">
          <Globe size={14} className="text-[#134E35] ml-2" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              language === 'en' ? 'bg-[#134E35] text-white shadow-xs' : 'text-[#5B6660]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              language === 'ta' ? 'bg-[#134E35] text-white shadow-xs' : 'text-[#5B6660]'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-bold text-[#5B6660] hover:text-[#134E35] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {isTa ? 'தவிர்க்க (Skip)' : 'Skip'}
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center items-center text-center py-6 space-y-6">
        {/* Visual Media Card */}
        <div className="relative w-full h-52 sm:h-60 rounded-3xl overflow-hidden shadow-md border border-[#DFE4DC] bg-white">
          <img
            src={current.illustration}
            alt={current.title}
            className="w-full h-full object-cover transition-all duration-500 transform hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
              {current.icon}
            </div>
          </div>
        </div>

        {/* Badge & Text */}
        <div className="space-y-2.5">
          <span className="inline-block px-3 py-1 rounded-full bg-[#E7F5EE] text-[#134E35] text-xs font-bold tracking-wide">
            {current.badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F3D2E] leading-tight">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6660] leading-relaxed max-w-sm mx-auto">
            {current.desc}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 pt-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentStep === idx ? 'w-8 bg-[#134E35]' : 'w-2 bg-[#C0C9BF]'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between gap-3 pb-4">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="w-1/3 py-3 px-4 rounded-xl border border-[#DFE4DC] bg-white text-xs font-bold text-[#5B6660] hover:bg-[#EEF6ED] transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{isTa ? 'முந்தையது' : 'Back'}</span>
          </button>
        ) : (
          <div className="w-1/3" />
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-6 rounded-xl bg-[#134E35] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0F3D2E] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <span>{isTa ? 'தொடங்குக' : 'Get Started'}</span>
              <Check size={16} />
            </>
          ) : (
            <>
              <span>{isTa ? 'அடுத்தது' : 'Next'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
