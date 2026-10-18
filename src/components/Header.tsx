import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Bell, MapPin } from 'lucide-react';

interface HeaderProps {
  customTitle?: string;
  customStatus?: string;
  isTerracotta?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ customTitle, customStatus }) => {
  const { language, setLanguage, user, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' || location.pathname === '/farmer/home';
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Short single-language title for screen
  const getScreenTitle = () => {
    if (customTitle) return customTitle;
    const path = location.pathname;
    if (isHome) return language === 'ta' ? 'முகப்பு' : 'Home';
    if (path.startsWith('/discovery') || path.startsWith('/facility')) {
      return language === 'ta' ? 'அறைகள்' : 'Chambers';
    }
    if (path.startsWith('/farmer/inventory') || path.startsWith('/central/inventory')) {
      return language === 'ta' ? 'சரக்கிருப்பு' : 'Inventory';
    }
    if (path.startsWith('/ai-arbitrage')) {
      return language === 'ta' ? 'விலை கணிப்பு' : 'Prices';
    }
    if (path.includes('confirmation') || path.includes('gate-pass')) {
      return language === 'ta' ? 'நுழைவுச் சீட்டு' : 'Gate Pass';
    }
    if (path.includes('conflict')) {
      return language === 'ta' ? 'இடப்பற்றாக்குறை' : 'Capacity Conflict';
    }
    if (path.includes('style-guide')) {
      return language === 'ta' ? 'வடிவமைப்பு' : 'Style Guide';
    }
    return language === 'ta' ? 'சேமிப்பகம்' : 'Storage';
  };

  const getGreetingText = () => {
    return language === 'ta' ? 'காலை வணக்கம்,' : 'Good morning,';
  };

  const getUserName = () => {
    return language === 'ta' ? 'முருகன் எஸ்.' : (user?.name || 'Murugan S.');
  };

  const getLocationStatus = () => {
    if (customStatus) return customStatus;
    return language === 'ta' ? 'ஒட்டன்சத்திரம் · 3 கி.மீ மையம்' : 'Oddanchatram · 3 km hub';
  };

  return (
    <header className="relative w-full select-none z-30 bg-[#F7F4EC] pt-[max(10px,env(safe-area-inset-top))]">
      {/* 1. TOP TOOLBAR: Minimal Floating Capsule Design (~52-56px tall) */}
      <div className="px-3.5 sm:px-4 pt-1.5 pb-2">
        <div className="flex items-center justify-between gap-2 min-h-[48px] sm:min-h-[52px]">
          {/* Left: AgriSync brand logo + AgriSync brand name in the navbar */}
          <div className="flex items-center flex-shrink-0">
            {isHome ? (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 group active:scale-95 transition-transform cursor-pointer focus:outline-none"
                aria-label="AgriSync Home"
                title="AgriSync"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#0F3D2E]/10 shadow-[0_2px_8px_rgba(15,61,46,0.05)] flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                  <img
                    src="/agrisync-icon.png"
                    alt="AgriSync Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center font-extrabold text-[17px] sm:text-[18px] leading-none tracking-tight">
                    <span className="text-[#134E35]">Agri</span>
                    <span className="text-[#368638]">Sync</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-[#5B6660] tracking-tight mt-0.5">
                    Smart Farming
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#0F3D2E]/10 shadow-[0_2px_8px_rgba(15,61,46,0.05)] active:scale-95 flex items-center justify-center text-[#0F3D2E] hover:bg-[#FAF8F3] transition-all cursor-pointer focus:outline-none flex-shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} strokeWidth={2.2} />
                </button>
                <div className="flex items-center font-extrabold text-[16px] sm:text-[17px] leading-none tracking-tight">
                  <span className="text-[#134E35]">Agri</span>
                  <span className="text-[#368638]">Sync</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Language switch, Notification bell, Profile avatar in a single row with 8-12px gaps */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Language Selector: Compact white pill "அ | A" */}
            <div
              className="h-9 p-0.5 bg-white rounded-full flex items-center border border-[#0F3D2E]/10 shadow-[0_2px_8px_rgba(15,61,46,0.04)] flex-shrink-0"
              role="radiogroup"
              aria-label="Language Switcher"
            >
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`min-w-[30px] sm:min-w-[34px] h-8 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  language === 'ta'
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'text-[#5B6660] hover:text-[#0F3D2E]'
                }`}
                aria-label="Tamil Language"
              >
                அ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`min-w-[30px] sm:min-w-[34px] h-8 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'text-[#5B6660] hover:text-[#0F3D2E]'
                }`}
                aria-label="English Language"
              >
                A
              </button>
            </div>

            {/* Notification Bell: 40-44px touch target with small golden-orange unread indicator */}
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F3] border border-[#0F3D2E]/10 shadow-[0_2px_8px_rgba(15,61,46,0.04)] active:scale-95 flex items-center justify-center text-[#0F3D2E] relative transition-all cursor-pointer focus:outline-none flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C8923A] ring-2 ring-white" />
              )}
            </button>

            {/* Profile Avatar: Circular, 40-44px diameter */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#C8923A]/80 shadow-[0_2px_8px_rgba(15,61,46,0.06)] active:scale-95 transition-transform cursor-pointer flex-shrink-0"
              aria-label="User Profile"
            >
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
                }
                alt={user?.name || 'Murugan S.'}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle fine divider between toolbar and greeting */}
      <div className="w-full h-px bg-[#0F3D2E]/6" />

      {/* 2. SEPARATE GREETING & LOCATION SECTION on normal background */}
      <div className="px-3.5 sm:px-4 pt-3 pb-1">
        {isHome ? (
          <div className="flex flex-col items-start gap-1">
            {/* Greeting: "Good morning, Murugan S." */}
            <p className="text-sm sm:text-base text-[#1C2420] tracking-tight">
              <span className="text-[#5B6660] font-normal">{getGreetingText()}</span>{' '}
              <span className="font-bold text-[#1C2420]">{getUserName()}</span>
            </p>

            {/* Compact Location Badge */}
            <div className="pt-0.5 flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#0F3D2E]/10 text-[#1C2420] text-[11px] sm:text-xs font-medium shadow-2xs">
                <MapPin size={12} className="text-[#C8923A] flex-shrink-0" />
                <span className="truncate">{getLocationStatus()}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1">
            {/* Screen Title for child pages */}
            <h1
              className={`text-2xl sm:text-[26px] font-bold text-[#0F3D2E] leading-tight tracking-tight text-left truncate max-w-full ${
                language === 'ta' ? 'font-tamil-serif' : 'font-serif-hero'
              }`}
            >
              {getScreenTitle()}
            </h1>

            {/* Location Badge */}
            <div className="pt-0.5 flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#0F3D2E]/10 text-[#1C2420] text-[11px] sm:text-xs font-medium shadow-2xs">
                <MapPin size={12} className="text-[#C8923A] flex-shrink-0" />
                <span className="truncate">{getLocationStatus()}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

