import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Truck, Thermometer, Bell, CheckCheck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';

export const ActivityAlertsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const markAllNotificationsAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical'>('all');

  // Severity helper
  const getSeverity = (type: string): 'critical' | 'warning' | 'info' | 'success' => {
    if (type === 'conflict' || type === 'critical') return 'critical';
    if (type === 'threshold' || type === 'temperature' || type === 'warning') return 'warning';
    if (type === 'pickup' || type === 'confirmed' || type === 'success') return 'success';
    return 'info';
  };

  // Filtered notifications
  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'critical') return getSeverity(n.type) === 'critical';
    return true;
  });

  // Group by Today vs Earlier
  const todayList = filtered.filter((n) => {
    const ts = (n.timestamp || '').toLowerCase();
    return ts.includes('ago') || ts.includes('just now') || ts.includes('today') || ts.includes('hour') || ts.includes('min');
  });

  const earlierList = filtered.filter((n) => !todayList.includes(n));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderCard = (notif: (typeof notifications)[0]) => {
    const severity = getSeverity(notif.type);

    const severityBorder = {
      critical: 'border-l-4 border-l-[#B5472B]',
      warning: 'border-l-4 border-l-[#C2410C]',
      info: 'border-l-4 border-l-[#1E5E3A]',
      success: 'border-l-4 border-l-[#14532D]',
    };

    const iconStyle = {
      critical: 'bg-[#FBEBE7] text-[#B5472B]',
      warning: 'bg-[#FFF2EB] text-[#C2410C]',
      info: 'bg-[#E7F5EE] text-[#1E5E3A]',
      success: 'bg-[#E7F5EE] text-[#14532D]',
    };

    const icon =
      severity === 'critical' ? (
        <AlertTriangle size={18} strokeWidth={2.2} />
      ) : notif.type === 'pickup' ? (
        <Truck size={18} strokeWidth={2.2} />
      ) : notif.type === 'temperature' ? (
        <Thermometer size={18} strokeWidth={2.2} />
      ) : (
        <Bell size={18} strokeWidth={2.2} />
      );

    return (
      <div
        key={notif.id}
        onClick={() => markNotificationAsRead(notif.id)}
        className={`p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.04)] space-y-3 transition-all ${
          severityBorder[severity]
        } ${!notif.read ? 'ring-1 ring-[#14532D]/15' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyle[severity]}`}>
              {icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#B5472B] shrink-0" title="Unread" />
                )}
                <h3 className={`text-sm ${!notif.read ? 'font-bold text-[#1C2420]' : 'font-medium text-[#1C2420]'}`}>
                  {isTa ? notif.titleTa : notif.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#5B6660]">
                <Clock size={12} className="shrink-0" />
                <span className="truncate">{notif.timestamp}</span>
              </div>
            </div>
          </div>

          {severity === 'critical' && (
            <Tag variant="danger">
              {isTa ? 'நடவடிக்கை தேவை' : 'Action Required'}
            </Tag>
          )}
        </div>

        <p className="text-xs text-[#5B6660] leading-relaxed pl-13">
          {isTa ? notif.messageTa : notif.message}
        </p>

        {/* One clear CTA per card */}
        {notif.linkUrl && (
          <div className="pt-1 pl-13">
            {severity === 'critical' ? (
              <Button
                variant="primary"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  markNotificationAsRead(notif.id);
                  navigate(notif.linkUrl || '/activity');
                }}
              >
                {isTa ? 'சிக்கலை சரிபார்க்க' : 'Review Discrepancy'}
              </Button>
            ) : (
              <Button
                variant="tertiary"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  markNotificationAsRead(notif.id);
                  navigate(notif.linkUrl || '/activity');
                }}
              >
                {isTa ? 'காண்க' : 'View'}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full pb-28 pt-3 px-4 text-[#1C2420] select-none space-y-5">
      {/* Top Filter Bar + Mark all read */}
      <div className="flex items-center justify-between gap-2">
        {/* Filter Chips: All, Unread, Critical */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#14532D] text-white border-[#14532D]'
                : 'bg-white text-[#5B6660] border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            {isTa ? 'அனைத்தும்' : 'All'}
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-[#14532D] text-white border-[#14532D]'
                : 'bg-white text-[#5B6660] border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            <span>{isTa ? 'படிக்காதவை' : 'Unread'}</span>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                activeFilter === 'unread' ? 'bg-white text-[#14532D]' : 'bg-[#B5472B] text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              activeFilter === 'critical'
                ? 'bg-[#B5472B] text-white border-[#B5472B]'
                : 'bg-white text-[#5B6660] border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            {isTa ? 'முக்கியமானவை' : 'Critical'}
          </button>
        </div>

        {/* Mark All Read */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#14532D] hover:underline cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>{isTa ? 'அனைத்தும் படிக்கப்பட்டது' : 'Mark all read'}</span>
          </button>
        )}
      </div>

      {/* Notifications Grouped List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#DFE4DC] space-y-2 mt-4">
          <Bell size={32} className="mx-auto text-[#5B6660]/40" />
          <h3 className="text-sm font-semibold text-[#1C2420]">
            {isTa ? 'அறிவிப்புகள் ஏதுமில்லை' : 'No notifications'}
          </h3>
          <p className="text-xs text-[#5B6660]">
            {activeFilter === 'unread'
              ? (isTa ? 'எல்லா அறிவிப்புகளும் படிக்கப்பட்டுவிட்டன.' : 'All notifications have been read.')
              : (isTa ? 'புதிய எச்சரிக்கைகள் எதுவும் இல்லை.' : 'You have no new alerts.')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {todayList.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#5B6660] uppercase tracking-wider block">
                {isTa ? 'இன்று' : 'Today'}
              </span>
              <div className="space-y-2.5">
                {todayList.map(renderCard)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierList.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#5B6660] uppercase tracking-wider block">
                {isTa ? 'முந்தையவை' : 'Earlier'}
              </span>
              <div className="space-y-2.5">
                {earlierList.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
