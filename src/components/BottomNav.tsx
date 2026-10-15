import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home,
  Snowflake,
  Package,
  CalendarCheck,
  BarChart3,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { language, role, showToast } = useApp();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const isTa = language === 'ta';

  const handleCallHelpline = () => {
    showToast(
      isTa
        ? 'உழவர் உதவி மையத்துடன் இணைக்கப்படுகிறது: 1800-425-1556'
        : 'Connecting to Kisan AgriSync Helpline: 1800-425-1556',
      'info'
    );
    setShowHelpModal(false);
  };

  return (
    <>
      <nav
        className="fixed bottom-2.5 sm:bottom-3 left-0 right-0 z-40 max-w-[500px] mx-auto px-3.5 sm:px-4 pointer-events-none pb-safe"
        aria-label="Bottom Navigation"
      >
        <div className="h-14 sm:h-15 w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-[0_4px_24px_rgba(15,61,46,0.14)] border border-[#E2E8F0] flex items-center justify-around px-2 pointer-events-auto">
          {/* FARMER PERSONA NAVIGATION */}
          {role === 'farmer' && (
            <>
              <NavLink
                to="/farmer/home"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Home size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'முகப்பு' : 'Home'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/discovery"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Snowflake size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'அறைகள்' : 'Storage'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/farmer/bookings"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <CalendarCheck size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'பதிவுகள்' : 'Bookings'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/farmer/inventory"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Package size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'இருப்பு' : 'Inventory'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/ai-arbitrage"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Sparkles size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'விலை AI' : 'Prices'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>
            </>
          )}

          {/* STORAGE OWNER PERSONA NAVIGATION */}
          {role === 'owner' && (
            <>
              <NavLink
                to="/owner/dashboard"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <BarChart3 size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'கண்ணோட்டம்' : 'Overview'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/owner/bookings"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <CalendarCheck size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'முன்பதிவுகள்' : 'Bookings'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/owner/inventory"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Package size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'சரக்கிருப்பு' : 'Inventory'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/owner/inventory/history"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <ArrowRightLeft size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'வரலாறு' : 'History'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/owner/ai-insights"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Sparkles size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'AI எச்சரிக்கை' : 'AI Insights'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>
            </>
          )}

          {/* ADMIN PERSONA NAVIGATION */}
          {role === 'admin' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <BarChart3 size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'நிர்வாகம்' : 'Admin'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/discovery"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Snowflake size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'மையங்கள்' : 'Facilities'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/owner/inventory"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <Package size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'இருப்பு' : 'Inventory'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>

              <NavLink
                to="/admin/audit"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full select-none ${
                    isActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative flex flex-col items-center">
                    <ShieldAlert size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] sm:text-[11px] leading-none mt-1">
                      {isTa ? 'தணிக்கை' : 'Audit'}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] absolute -bottom-1.5" />}
                  </div>
                )}
              </NavLink>
            </>
          )}

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full select-none text-[#64748B] hover:text-[#14532D] transition-colors cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle size={19} strokeWidth={1.8} />
            <span className="text-[10px] sm:text-[11px] leading-none mt-1">
              {isTa ? 'உதவி' : 'Help'}
            </span>
          </button>
        </div>
      </nav>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14532D] flex items-center gap-2">
                <HelpCircle size={20} className="text-[#C8923A]" />
                <span>{isTa ? 'உழவர் உதவி மையம்' : 'AgriSync Kisan Helpline'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-[#64748B] hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#5B6660]">
              {isTa
                ? 'தமிழ்நாடு குளிர்பதன கிடங்கு ஒதுக்கீடு, வாயில் எடைப்பதிவு மற்றும் விலை முன்னறிவிப்பு விபரங்களுக்கு எங்களை தொடர்பு கொள்ளவும்.'
                : 'Direct support for Tamil Nadu solar cold chain booking, weighing bridge gate pass, and Mandi price forecasting.'}
            </p>
            <div className="p-3 rounded-xl bg-[#F4FBF3] border border-[#AFF2C2] text-xs font-semibold text-[#14532D]">
              📞 Toll Free: 1800-425-1556 (Tamil / English)
            </div>
            <button
              type="button"
              onClick={handleCallHelpline}
              className="w-full h-11 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-colors"
            >
              {isTa ? 'அழைக்கவும்' : 'Call Support Line'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
