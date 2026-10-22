import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home,
  Snowflake,
  Package,
  Bell,
  User,
  BarChart3,
  CalendarCheck,
  ArrowRightLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface BottomTabProps {
  to: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  badgeCount?: number;
}

const BottomTab: React.FC<BottomTabProps> = ({
  to,
  icon: Icon,
  label,
  badgeCount,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/farmer/home' && location.pathname.startsWith(to));

  return (
    <NavLink
      to={to}
      className="flex flex-col items-center justify-center flex-1 h-full select-none py-1 group focus:outline-hidden"
      aria-label={label}
    >
      <div
        className={`relative flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-150 ${
          isActive ? 'bg-[#E7F5EE] text-[#14532D]' : 'text-[#5B6660] hover:text-[#14532D]'
        }`}
      >
        {/* 24px Icon Container with Badge */}
        <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
          <Icon size={24} strokeWidth={isActive ? 2.3 : 1.8} />
          {badgeCount && badgeCount > 0 ? (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#B5472B] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          ) : null}
        </div>

        {/* 12px Label (always on one line, active in forest green) */}
        <span
          className={`text-[12px] leading-tight mt-1 whitespace-nowrap truncate max-w-[68px] ${
            isActive ? 'font-bold text-[#14532D]' : 'font-medium text-[#5B6660]'
          }`}
        >
          {label}
        </span>
      </div>
    </NavLink>
  );
};

export const BottomNav: React.FC = () => {
  const { language, role, notifications } = useApp();
  const isTa = language === 'ta';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="fixed bottom-3 left-0 right-0 z-40 max-w-[430px] mx-auto px-3 pointer-events-none pb-safe"
      aria-label="Bottom Navigation"
    >
      <div className="h-16 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(15,61,46,0.12)] border border-[#DFE4DC] flex items-center justify-around px-1 pointer-events-auto">
        {/* FARMER PERSONA: Exactly 5 Tabs */}
        {role === 'farmer' && (
          <>
            <BottomTab
              to="/farmer/home"
              icon={Home}
              label={isTa ? 'முகப்பு' : 'Home'}
            />
            <BottomTab
              to="/discovery"
              icon={Snowflake}
              label={isTa ? 'குளிர்சாதனம்' : 'Cold Storage'}
            />
            <BottomTab
              to="/farmer/dry-inventory"
              icon={Package}
              label={isTa ? 'இருப்பு' : 'Inventory'}
            />
            <BottomTab
              to="/activity"
              icon={Bell}
              label={isTa ? 'அறிவிப்புகள்' : 'Alerts'}
              badgeCount={unreadCount}
            />
            <BottomTab
              to="/profile"
              icon={User}
              label={isTa ? 'சுயவிவரம்' : 'Profile'}
            />
          </>
        )}

        {/* OWNER PERSONA: 5 Tabs */}
        {role === 'owner' && (
          <>
            <BottomTab
              to="/owner/dashboard"
              icon={BarChart3}
              label={isTa ? 'கண்ணோட்டம்' : 'Overview'}
            />
            <BottomTab
              to="/owner/bookings"
              icon={CalendarCheck}
              label={isTa ? 'முன்பதிவுகள்' : 'Bookings'}
            />
            <BottomTab
              to="/owner/inventory"
              icon={Package}
              label={isTa ? 'சரக்கிருப்பு' : 'Inventory'}
            />
            <BottomTab
              to="/owner/inventory/history"
              icon={ArrowRightLeft}
              label={isTa ? 'வரலாறு' : 'History'}
            />
            <BottomTab
              to="/owner/ai-insights"
              icon={Sparkles}
              label={isTa ? 'AI ஆய்வு' : 'Insights'}
            />
          </>
        )}

        {/* ADMIN PERSONA: 4 Tabs */}
        {role === 'admin' && (
          <>
            <BottomTab
              to="/admin/dashboard"
              icon={BarChart3}
              label={isTa ? 'நிர்வாகம்' : 'Admin'}
            />
            <BottomTab
              to="/discovery"
              icon={Snowflake}
              label={isTa ? 'மையங்கள்' : 'Facilities'}
            />
            <BottomTab
              to="/owner/inventory"
              icon={Package}
              label={isTa ? 'இருப்பு' : 'Inventory'}
            />
            <BottomTab
              to="/admin/audit"
              icon={ShieldAlert}
              label={isTa ? 'தணிக்கை' : 'Audit'}
            />
          </>
        )}
      </div>
    </nav>
  );
};
