import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

export const Header: React.FC = () => {
  const { user, role, setRole, language, toggleLanguage, t, isDemoMode, setIsDemoMode } =
    useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setShowRoleMenu(false);
    if (newRole === 'owner') {
      navigate('/owner/dashboard');
    } else if (newRole === 'farmer') {
      navigate('/farmer/home');
    } else {
      navigate('/central/inventory');
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f4fbf3]/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#c0c9bf]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between gap-3">
          {/* Logo & Brand title */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#1e5e3a]/15 flex items-center justify-center flex-shrink-0 text-[#1e5e3a] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">warehouse</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-headline text-base sm:text-lg text-[#1e5e3a] tracking-tight font-extrabold truncate">
                  {language === 'ta' ? 'ஸ்மார்ட் கிராமப்புற சேமிப்பு' : 'Smart Rural Storage'}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#86f8c2]/50 text-[#00734e] text-[10px] font-bold leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse"></span>
                  <span>{t('liveHub')}</span>
                </span>
              </div>
              <span className="text-[11px] leading-tight text-[#404941] font-medium truncate">
                {language === 'ta' ? 'விவசாய குளிர்சங்கிலி மற்றும் இருப்பு' : 'Farmer Cold Chain & Inventory'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#404941]">
            <Link
              to="/farmer/home"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/farmer/home' || location.pathname === '/'
                  ? 'bg-[#e9f0e8] text-[#1e5e3a] font-bold'
                  : 'hover:bg-[#e9f0e8]/50'
              }`}
            >
              {t('navHome')}
            </Link>
            <Link
              to="/discovery"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/discovery' ? 'bg-[#e9f0e8] text-[#1e5e3a] font-bold' : 'hover:bg-[#e9f0e8]/50'
              }`}
            >
              {t('navChambers')}
            </Link>
            <Link
              to="/farmer/inventory"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/farmer/inventory' ? 'bg-[#e9f0e8] text-[#1e5e3a] font-bold' : 'hover:bg-[#e9f0e8]/50'
              }`}
            >
              {t('navInventory')}
            </Link>
            <Link
              to="/ai-arbitrage"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/ai-arbitrage' ? 'bg-[#e9f0e8] text-[#1e5e3a] font-bold' : 'hover:bg-[#e9f0e8]/50'
              }`}
            >
              {t('navAiArbitrage')}
            </Link>
            <Link
              to="/owner/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname.startsWith('/owner') ? 'bg-[#e9f0e8] text-[#1e5e3a] font-bold' : 'hover:bg-[#e9f0e8]/50'
              }`}
            >
              {t('navOwnerOps')}
            </Link>
          </nav>

          {/* Actions: Bilingual Toggle & Profile Role Switch */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Toggle */}
            <button
              aria-label="Language Toggle English or Tamil"
              className="h-9 p-0.5 bg-[#e9f0e8] rounded-full flex items-center gap-0.5 hover:bg-[#e3eae2] transition-all shadow-sm border border-[#c0c9bf]/30 cursor-pointer"
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              type="button"
            >
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm transition-all ${
                  language === 'en'
                    ? 'bg-[#1e5e3a] text-white'
                    : 'text-[#404941] font-medium'
                }`}
                id="badge-en"
              >
                EN
              </span>
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                  language === 'ta'
                    ? 'bg-[#1e5e3a] text-white font-bold'
                    : 'text-[#404941]'
                }`}
                id="badge-ta"
              >
                தமிழ்
              </span>
            </button>

            {/* Role switch avatar trigger */}
            <div className="relative">
              <button
                aria-label="Farmer Profile and Role Switch"
                className="w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-[#1e5e3a]/25 hover:ring-[#1e5e3a] transition-all overflow-hidden"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                type="button"
              >
                <img
                  alt={user.name}
                  className="w-full h-full object-cover"
                  src={user.avatarUrl}
                />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#c0c9bf]/40 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#dde4dd]">
                    <div className="font-bold text-sm text-[#161d18]">{user.name}</div>
                    <div className="text-xs text-[#404941]">{user.location}</div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#aff2c2] text-[#00210f]">
                      {role} profile
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleRoleSelect('farmer')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        role === 'farmer' ? 'bg-[#eef6ed] text-[#1e5e3a]' : 'hover:bg-gray-50 text-[#161d18]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">agriculture</span>
                      <div>
                        <div>Farmer: Murugan S.</div>
                        <div className="text-[10px] text-gray-500 font-normal">Book storage &amp; inventory lots</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('owner')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        role === 'owner' ? 'bg-[#eef6ed] text-[#1e5e3a]' : 'hover:bg-gray-50 text-[#161d18]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">warehouse</span>
                      <div>
                        <div>Storage Owner: Arumugam</div>
                        <div className="text-[10px] text-gray-500 font-normal">Chamber capacity &amp; gate intake</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        role === 'admin' ? 'bg-[#eef6ed] text-[#1e5e3a]' : 'hover:bg-gray-50 text-[#161d18]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <div>
                        <div>Agri Admin: Dr. Jayakumar</div>
                        <div className="text-[10px] text-gray-500 font-normal">TN-Agri regional dashboard</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#dde4dd] flex items-center justify-between px-2">
                    <span className="text-[11px] text-gray-500">Demo Data Mode</span>
                    <button
                      onClick={() => setIsDemoMode(!isDemoMode)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isDemoMode ? 'Active (TN Mock)' : 'Supabase Live'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-strip with Mode & Live Sync Indicator */}
        <div className="pb-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e9f0e8] text-[#404941] text-[11px] font-medium border border-[#c0c9bf]/30">
            <span className="w-2 h-2 rounded-full bg-[#1e5e3a] animate-pulse"></span>
            <span className="truncate">
              {role === 'farmer' && t('modeFarmer')}
              {role === 'owner' && t('modeOwner')}
              {role === 'admin' && t('modeAdmin')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/service-selection"
              className="text-[11px] font-bold text-[#1e5e3a] hover:underline flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span className="hidden sm:inline">Switch Service</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
