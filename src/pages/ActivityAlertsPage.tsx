import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ActivityAlertsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, language } = useApp();

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e5e3a]">Activity &amp; Alerts</h1>
            <p className="text-xs text-[#404941]">Gate pass alerts, telemetry triggers &amp; notices</p>
          </div>
          <span className="text-xs font-bold text-[#006c49] bg-[#86f8c2]/50 px-2.5 py-1 rounded-full">
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl shadow-sm border transition-all ${
                !notif.read
                  ? 'bg-white border-[#86f8c2] ring-1 ring-[#86f8c2]/40'
                  : 'bg-white/70 border-[#dfe4dc]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'conflict'
                      ? 'bg-[#ffdcc6] text-[#844000]'
                      : notif.type === 'pickup'
                      ? 'bg-[#aff2c2] text-[#00210f]'
                      : notif.type === 'temperature'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-[#eef6ed] text-[#1e5e3a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {notif.type === 'conflict'
                      ? 'warning'
                      : notif.type === 'pickup'
                      ? 'local_shipping'
                      : notif.type === 'temperature'
                      ? 'thermostat'
                      : 'notifications'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#161d18] truncate">
                      {language === 'ta' ? notif.titleTa : notif.title}
                    </h3>
                    <span className="text-[10px] text-[#404941] flex-shrink-0">{notif.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#404941] mt-0.5 leading-snug">
                    {language === 'ta' ? notif.messageTa : notif.message}
                  </p>

                  {notif.linkUrl && (
                    <div className="mt-2">
                      <Link
                        to={notif.linkUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1e5e3a] hover:underline"
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
