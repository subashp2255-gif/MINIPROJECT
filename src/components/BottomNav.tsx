import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, Snowflake, Package, HelpCircle, PhoneCall, X, Volume2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { language, showToast } = useApp();
  const location = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const isHomeActive = location.pathname === '/' || location.pathname === '/farmer/home';
  const isChambersActive = location.pathname.startsWith('/discovery') || location.pathname.startsWith('/facility') || location.pathname.startsWith('/wizard');
  const isInventoryActive = location.pathname.startsWith('/farmer/inventory') || location.pathname.startsWith('/central/inventory');

  const navLabels = {
    home: language === 'ta' ? 'முகப்பு' : 'Home',
    chambers: language === 'ta' ? 'அறைகள்' : 'Chambers',
    inventory: language === 'ta' ? 'சரக்கு' : 'Inventory',
    help: language === 'ta' ? 'உதவி' : 'Help',
  };

  const handleCallHelpline = () => {
    showToast(language === 'ta' ? 'உழவர் உதவி மையத்துடன் இணைக்கப்படுகிறது: 1800-425-1556' : 'Connecting to Kisan Helpline: 1800-425-1556', 'info');
    setShowHelpModal(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation: 10-12px above bottom, safe-area padded */}
      <nav
        className="fixed bottom-2.5 sm:bottom-3 left-0 right-0 z-40 max-w-[430px] mx-auto px-3.5 sm:px-4 pointer-events-none pb-safe"
        aria-label="Bottom Navigation"
      >
        <div className="h-14 sm:h-15 w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-[0_4px_24px_rgba(15,61,46,0.10)] border border-[#E2E8F0] flex items-center justify-around px-1 pointer-events-auto">
          {/* 1. Home */}
          <NavLink
            to="/farmer/home"
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors select-none"
          >
            <div className="relative flex flex-col items-center">
              <Home
                size={20}
                strokeWidth={isHomeActive ? 2.2 : 1.8}
                color={isHomeActive ? '#14532D' : '#64748B'}
                className="transition-transform group-hover:scale-105"
              />
              <span
                className={`text-[11px] leading-none mt-1 tracking-tight ${
                  isHomeActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                }`}
              >
                {navLabels.home}
              </span>
              {isHomeActive && (
                <span className="w-1 h-1 rounded-full bg-[#14532D] absolute -bottom-1.5" />
              )}
            </div>
          </NavLink>

          {/* 2. Chambers */}
          <NavLink
            to="/discovery"
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors select-none"
          >
            <div className="relative flex flex-col items-center">
              <Snowflake
                size={20}
                strokeWidth={isChambersActive ? 2.2 : 1.8}
                color={isChambersActive ? '#14532D' : '#64748B'}
                className="transition-transform group-hover:scale-105"
              />
              <span
                className={`text-[11px] leading-none mt-1 tracking-tight ${
                  isChambersActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                }`}
              >
                {navLabels.chambers}
              </span>
              {isChambersActive && (
                <span className="w-1 h-1 rounded-full bg-[#14532D] absolute -bottom-1.5" />
              )}
            </div>
          </NavLink>

          {/* 3. Inventory */}
          <NavLink
            to="/farmer/inventory"
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors select-none"
          >
            <div className="relative flex flex-col items-center">
              <Package
                size={20}
                strokeWidth={isInventoryActive ? 2.2 : 1.8}
                color={isInventoryActive ? '#14532D' : '#64748B'}
                className="transition-transform group-hover:scale-105"
              />
              <span
                className={`text-[11px] leading-none mt-1 tracking-tight ${
                  isInventoryActive ? 'text-[#14532D] font-bold' : 'text-[#64748B] font-medium'
                }`}
              >
                {navLabels.inventory}
              </span>
              {isInventoryActive && (
                <span className="w-1 h-1 rounded-full bg-[#14532D] absolute -bottom-1.5" />
              )}
            </div>
          </NavLink>

          {/* 4. Help */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors cursor-pointer focus:outline-none select-none"
          >
            <div className="relative flex flex-col items-center">
              <HelpCircle
                size={20}
                strokeWidth={1.8}
                color="#64748B"
                className="transition-transform group-hover:scale-105"
              />
              <span className="text-[11px] leading-none mt-1 tracking-tight text-[#64748B] font-medium">
                {navLabels.help}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* Kisan Help Bottom Sheet Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white rounded-[24px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#0F3D2E]">
                  <HelpCircle size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1C2420]">
                    {language === 'ta' ? 'உழவர் உதவி மையம்' : 'Kisan Helpdesk'}
                  </h3>
                  <p className="text-xs text-[#5B6660]">
                    {language === 'ta' ? '24/7 இலவச விவசாய ஆலோசனை' : '24/7 Toll-free voice assistance'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F4EC] flex items-start gap-3">
              <Volume2 size={20} className="text-[#C8923A] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#1C2420] leading-relaxed">
                {language === 'ta'
                  ? 'குளிர்பதன கிடங்கு முன்பதிவு, வாயில் அனுமதி சீட்டு அல்லது கட்டண விபரங்களுக்கு உங்கள் தாய்மொழியில் பேசலாம்.'
                  : 'Get immediate guidance for chamber slots, gate intake QR pass, or price forecasts in Tamil & English.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCallHelpline}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <PhoneCall size={18} />
              <span>{language === 'ta' ? 'உதவி மையத்தை அழைக்கவும்' : 'Call helpline'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
