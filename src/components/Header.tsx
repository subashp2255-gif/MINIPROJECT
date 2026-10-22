import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Bell } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  customTitle?: string;
  customStatus?: string;
  isTerracotta?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ customTitle }) => {
  const { language, setLanguage, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasScrolled, setHasScrolled] = useState(false);

  const isTa = language === 'ta';
  const path = location.pathname;

  // Track scroll position for subtle bottom border
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main tab screens where back arrow is NEVER shown
  const isTabScreen =
    path === '/' ||
    path === '/farmer/home' ||
    path === '/discovery' ||
    path === '/farmer/dry-inventory' ||
    path === '/activity' ||
    path === '/profile' ||
    path === '/owner/dashboard' ||
    path === '/owner/bookings' ||
    path === '/owner/inventory' ||
    path === '/owner/ai-insights' ||
    path === '/admin/dashboard' ||
    path === '/admin/audit';

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Contextual screen title for drill-down pages (never generic "Storage")
  const getContextualTitle = (): string => {
    if (customTitle) return customTitle;
    if (path.startsWith('/facility/')) return isTa ? 'கிடங்கு விபரம்' : 'Facility Details';
    if (path.startsWith('/wizard')) return isTa ? 'முன்பதிவு வழிகாட்டி' : 'Book Storage';
    if (path.includes('confirmation')) return isTa ? 'முன்பதிவு உறுதி' : 'Booking Gate Pass';
    if (path.startsWith('/farmer/bookings')) return isTa ? 'எனது முன்பதிவுகள்' : 'My Bookings';
    if (path.startsWith('/farmer/inventory')) return isTa ? 'குளிர்பதன இருப்பு' : 'Cold Produce';
    if (path.startsWith('/ai-arbitrage')) return isTa ? 'விலை முன்னறிவிப்பு' : 'Mandi Forecast';
    if (path.startsWith('/live-inspection')) return isTa ? 'நேரடி பரிசோதனை' : 'Produce Inspection';
    if (path.startsWith('/feedback-revisit')) return isTa ? 'மதிப்பாய்வு' : 'Chamber Feedback';
    if (path.startsWith('/owner/inventory/new')) return isTa ? 'புதிய இருப்பு' : 'New Stock Batch';
    if (path.startsWith('/owner/inventory/intake')) return isTa ? 'உள்வரும் இருப்பு' : 'Stock Intake';
    if (path.startsWith('/owner/inventory/withdrawal')) return isTa ? 'வெளியேறும் இருப்பு' : 'Stock Withdrawal';
    if (path.startsWith('/owner/inventory/transfer')) return isTa ? 'இடம் மாற்றம்' : 'Stock Transfer';
    if (path.startsWith('/owner/inventory/adjust')) return isTa ? 'இருப்பு சரிபார்த்தல்' : 'Stock Adjustment';
    if (path.startsWith('/owner/inventory/history')) return isTa ? 'இருப்பு வரலாறு' : 'Movement Ledger';
    if (path.startsWith('/owner/locations')) return isTa ? 'கிடங்கு இடங்கள்' : 'Storage Locations';
    if (path.startsWith('/style-guide')) return isTa ? 'வடிவமைப்பு வழிகாட்டி' : 'Design System';
    return isTa ? 'விவரம்' : 'Details';
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full h-14 bg-[#F7F4EC] select-none transition-all duration-200 ${
        hasScrolled ? 'border-b border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.04)]' : ''
      }`}
    >
      <div className="h-full px-4 flex items-center justify-between gap-3 max-w-[430px] mx-auto">
        {/* LEFT SLOT */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isTabScreen ? (
            <button
              type="button"
              onClick={() => navigate('/farmer/home')}
              className="flex items-center text-left focus:outline-hidden"
              aria-label="AgriSync Home"
            >
              <AppLogo size={34} showText={true} showSubtitle={false} />
            </button>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] active:scale-95 flex items-center justify-center text-[#14532D] hover:bg-[#E7F5EE] transition-all cursor-pointer focus:outline-hidden shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={20} strokeWidth={2.2} />
              </button>
              <h1 className="text-base font-bold text-[#1C2420] truncate font-ui">
                {getContextualTitle()}
              </h1>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS: 1) EN | த segmented control, 2) Bell with numeric badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Language Switcher: 32px high, active filled forest green */}
          <div
            className="h-8 p-0.5 bg-white rounded-full flex items-center border border-[#DFE4DC] shadow-[0_2px_6px_rgba(15,61,46,0.04)] shrink-0"
            role="radiogroup"
            aria-label="Language"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                language === 'en'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-[#5B6660] hover:text-[#14532D]'
              }`}
              aria-label="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                language === 'ta'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-[#5B6660] hover:text-[#14532D]'
              }`}
              aria-label="தமிழ்"
            >
              த
            </button>
          </div>

          {/* Bell Icon: 44px target with red numeric badge */}
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="w-11 h-11 rounded-xl bg-white hover:bg-[#E7F5EE] border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.04)] active:scale-95 flex items-center justify-center text-[#14532D] relative transition-all cursor-pointer focus:outline-hidden shrink-0"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell size={19} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B5472B] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
