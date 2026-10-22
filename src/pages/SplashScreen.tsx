import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Snowflake, RefreshCw, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

export const SplashScreen: React.FC = () => {
  const { role, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [checkingSession, setCheckingSession] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  const checkSessionAndRoute = () => {
    setCheckingSession(true);
    setNetworkError(false);

    // Simulate session & network check
    setTimeout(() => {
      if (!navigator.onLine) {
        setNetworkError(true);
        setCheckingSession(false);
        return;
      }

      const hasOnboarded = localStorage.getItem('srs_onboarded') === 'true';
      const userPhone = localStorage.getItem('srs_user_phone');

      if (!hasOnboarded) {
        navigate('/onboarding');
      } else if (userPhone) {
        if (role === 'farmer') {
          navigate('/farmer/home');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        navigate('/login');
      }
    }, 1200);
  };

  useEffect(() => {
    checkSessionAndRoute();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0F3D2E] via-[#134E35] to-[#0A291E] text-white flex flex-col justify-between items-center p-6 sm:p-10 select-none">
      {/* Top Tag */}
      <div className="w-full flex justify-end">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wider text-[#A3E635]">
          <ShieldCheck size={13} />
          <span>{isTa ? 'தமிழ்நாடு வேளாண் சங்கிலி' : 'TN Agro-Cluster Grid'}</span>
        </div>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white shadow-2xl p-2 flex items-center justify-center transform transition-transform hover:scale-105">
            <AppLogo size={68} showText={false} className="justify-center" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#C8923A] text-white flex items-center justify-center shadow-lg border-2 border-[#0F3D2E]">
            <Snowflake size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center text-4xl sm:text-5xl font-black tracking-tight leading-none">
            <span className="text-white">Agri</span>
            <span className="text-[#A3E635]">Sync</span>
          </div>
          <p className="text-base sm:text-lg font-medium text-[#E2E8F0] tracking-wide">
            {isTa ? 'ஸ்மார்ட் சேமிப்பு, சிறந்த விவசாயம்' : 'Smart Storage, Better Farming'}
          </p>
          <p className="text-xs text-white/60 max-w-xs mx-auto">
            {isTa
              ? 'சூரிய மின் குளிர்பதன முன்பதிவு & தானிய இருப்பு மேலாண்மை அமைப்பு'
              : 'Rural Cold Storage & Dry Harvest Inventory'}
          </p>
        </div>

        {/* Loading Spinner or Network Error State */}
        <div className="pt-4 w-full">
          {checkingSession && !networkError && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-3 border-white/20 border-t-[#A3E635] rounded-full animate-spin" />
              <span className="text-xs text-white/70 font-medium">
                {isTa ? 'அமர்வை சரிபார்க்கிறது...' : 'Verifying authenticated session...'}
              </span>
            </div>
          )}

          {networkError && (
            <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-2xl space-y-3 backdrop-blur-md">
              <div className="flex items-center gap-2 text-red-300 text-xs font-bold justify-center">
                <AlertCircle size={16} />
                <span>{isTa ? 'இணைய இணைப்பு கிடைக்கவில்லை' : 'Network Unavailable'}</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                {isTa
                  ? 'சர்வர் இணைக்க முடியவில்லை. தயவுசெய்து உங்கள் இணையத்தை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
                  : 'Unable to verify server session. Please check your connection and retry.'}
              </p>
              <button
                type="button"
                onClick={checkSessionAndRoute}
                className="w-full py-2 px-4 rounded-xl bg-white text-[#0F3D2E] text-xs font-bold hover:bg-[#A3E635] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>{isTa ? 'மீண்டும் முயற்சிக்க' : 'Retry Connection'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="w-full max-w-sm flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#A3E635] text-[#0F3D2E] text-sm font-extrabold hover:bg-[#BEF264] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isTa ? 'தொடங்குக' : 'Get Started'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
