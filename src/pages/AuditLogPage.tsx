import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { movements, bookings, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  // Construct audit events from movements and bookings
  const auditEvents = [
    ...movements.map((m) => ({
      id: m.id,
      timestamp: m.timestamp,
      action: m.type.toUpperCase(),
      entity: `Batch ${m.batchCode}`,
      details: `${m.quantityKg} kg / ${m.quantityCrates} crates - ${m.reason}`,
      user: m.authorizedBy,
      type: 'inventory',
    })),
    ...bookings.map((b) => ({
      id: `audit-${b.id}`,
      timestamp: b.createdAt,
      action: 'CAPACITY_RESERVATION',
      entity: `Booking ${b.bookingCode}`,
      details: `Reserved ${b.bookedCrates} crates (${b.bookedKg} kg) for ${b.cropName}`,
      user: b.farmerName,
      type: 'booking',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="w-9 h-9 rounded-xl bg-white border border-[#DFE4DC] flex items-center justify-center text-[#14532D] hover:bg-[#F7F4EC]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
              {isTa ? 'கள தணிக்கை பதிவேடு' : 'Platform Audit History'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'அனைத்து முன்பதிவு மற்றும் சரக்கு நகர்வுகளின் அதிகாரப்பூர்வ பதிவு' : 'Authoritative compliance trail for APMC and storage operators'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#DFE4DC] p-5 shadow-xs divide-y divide-[#EEF6ED]">
          {auditEvents.map((evt) => (
            <div key={evt.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      evt.type === 'booking' ? 'bg-[#E7F5EE] text-[#14532D]' : 'bg-[#FDFBF7] text-[#C8923A]'
                    }`}
                  >
                    {evt.action}
                  </span>
                  <span className="font-bold text-[#1C2420]">{evt.entity}</span>
                </div>
                <p className="text-[#5B6660]">{evt.details}</p>
                <div className="text-[11px] text-[#8C9690] flex items-center gap-2">
                  <User size={12} />
                  <span>Authorized by: <strong>{evt.user}</strong></span>
                </div>
              </div>

              <span className="text-[11px] text-[#5B6660] whitespace-nowrap">
                {new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
