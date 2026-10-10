import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { t, notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="fixed bottom-0 w-full z-40 pb-safe bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#c0c9bf]/30 md:hidden"
      data-active-classes="text-[#1e5e3a] font-bold"
    >
      <div className="h-16 px-1 flex items-center justify-around">
        {/* Home */}
        <NavLink
          to="/farmer/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-w-[48px] transition-colors ${
              isActive ? 'text-[#1e5e3a] font-bold' : 'text-[#404941] hover:text-[#161d18]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-label-sm text-[11px] mt-0.5 text-center leading-none">
            {t('navHome')}
          </span>
        </NavLink>

        {/* Chambers / Discovery */}
        <NavLink
          to="/discovery"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-w-[48px] transition-colors ${
              isActive ? 'text-[#1e5e3a] font-bold' : 'text-[#404941] hover:text-[#161d18]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">ac_unit</span>
          <span className="font-label-sm text-[11px] mt-0.5 text-center leading-none">
            {t('navChambers')}
          </span>
        </NavLink>

        {/* Inventory */}
        <NavLink
          to="/farmer/inventory"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-w-[48px] transition-colors ${
              isActive ? 'text-[#1e5e3a] font-bold' : 'text-[#404941] hover:text-[#161d18]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          <span className="font-label-sm text-[11px] mt-0.5 text-center leading-none">
            {t('navInventory')}
          </span>
        </NavLink>

        {/* Activity / Alerts with badge */}
        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-w-[48px] transition-colors relative ${
              isActive ? 'text-[#1e5e3a] font-bold' : 'text-[#404941] hover:text-[#161d18]'
            }`
          }
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="font-label-sm text-[11px] mt-0.5 text-center leading-none">
            {t('navActivity')}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};
