import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { facilities, bookings, batches, movements, language } = useApp();
  const isTa = language === 'ta';

  const totalKg = batches.reduce((acc, b) => acc + b.currentStockKg, 0);
  const totalBookingsValue = bookings.reduce((acc, b) => acc + b.totalEstimatedCost, 0);

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                {isTa ? 'அக்ரிசின்க் தலைமை நிர்வாக மையம்' : 'AgriSync Platform Administration'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14532D] text-white text-[10px] font-bold">
                TN Agro Board
              </span>
            </div>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'தமிழ்நாடு வேளாண் குளிர்பதன மையங்களின் ஒருங்கிணைந்த மேற்பார்வை' : 'Statewide cluster monitoring, audit trails, and multi-tenant facility governance'}
            </p>
          </div>

          <Link
            to="/admin/audit"
            className="h-9 px-3 rounded-xl bg-white border border-[#DFE4DC] text-xs font-bold text-[#14532D] flex items-center gap-1.5 hover:bg-[#F7F4EC]"
          >
            <Activity size={14} />
            <span>Audit History</span>
          </Link>
        </div>

        {/* Hero Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-[#DFE4DC] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] block">
              Active Facilities
            </span>
            <span className="text-2xl font-extrabold text-[#14532D] block mt-1">
              {facilities.length}
            </span>
            <span className="text-[10px] text-[#5B6660]">100% Certified Solar</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#DFE4DC] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] block">
              Total Reservations
            </span>
            <span className="text-2xl font-extrabold text-[#14532D] block mt-1">
              {bookings.length}
            </span>
            <span className="text-[10px] text-[#14532D] font-bold">₹{totalBookingsValue.toLocaleString()} volume</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#DFE4DC] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] block">
              Physical Inventory Stored
            </span>
            <span className="text-2xl font-extrabold text-[#C8923A] block mt-1">
              {totalKg} <span className="text-xs font-normal">kg</span>
            </span>
            <span className="text-[10px] text-[#5B6660]">{batches.length} active batches</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#DFE4DC] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6660] block">
              Audit Operations
            </span>
            <span className="text-2xl font-extrabold text-[#1C2420] block mt-1">
              {movements.length}
            </span>
            <span className="text-[10px] text-[#5B6660]">Immutable ledger</span>
          </div>
        </div>

        {/* Facilities Table */}
        <div className="bg-white rounded-3xl border border-[#DFE4DC] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F3D2E] flex items-center gap-1.5">
              <Building2 size={17} className="text-[#14532D]" />
              <span>Certified Regional Cold Chain Facilities</span>
            </h2>
          </div>

          <div className="space-y-3">
            {facilities.map((fac) => {
              const totalCapKg = fac.chambers.reduce((acc, c) => acc + c.totalCapacityKg, 0);
              const totalMaint = fac.chambers.filter((c) => c.isMaintenance).length;

              return (
                <div
                  key={fac.id}
                  className="p-4 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-bold text-sm text-[#14532D]">{fac.name}</h3>
                    <p className="text-xs text-[#5B6660]">{fac.location} • {fac.district}</p>
                    <div className="text-[11px] text-[#5B6660] flex items-center gap-2 mt-1">
                      <span>{fac.chambers.length} Chambers ({(totalCapKg / 1000).toFixed(0)} Tonnes)</span>
                      <span>•</span>
                      <span className={totalMaint > 0 ? 'text-amber-700 font-bold' : 'text-[#14532D] font-bold'}>
                        {totalMaint > 0 ? `${totalMaint} Chamber in Maintenance` : 'All Chambers Active'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/facility/${fac.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DFE4DC] text-xs font-bold text-[#14532D] hover:bg-[#EEF6ED]"
                    >
                      View Chambers
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
