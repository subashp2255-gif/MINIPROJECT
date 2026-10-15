import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Scale,
  CalendarCheck,
  Package,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  History,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { facilities, bookings, batches, movements, calculateCapacityLedger, verifyIntake, language } = useApp();
  const isTa = language === 'ta';

  const facility = facilities[0];
  const ledger = calculateCapacityLedger(facility.id);

  // State for gate weighing scale quick verification
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>('#SRS-TN-8492');
  const [scaleGrossKg, setScaleGrossKg] = useState<number>(495);
  const [crateCount, setCrateCount] = useState<number>(20);
  const [intakeChamber, setIntakeChamber] = useState<string>('Chamber 1 (Chilled)');
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyIntake(selectedBookingCode, scaleGrossKg, crateCount, intakeChamber);
    setShowIntakeModal(false);
  };

  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_storage').length;

  return (
    <div className="flex flex-col relative w-full pt-4 pb-28 bg-[#F4FBF3] min-h-screen text-[#1C2420]">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                {isTa ? 'கிடங்கு செயல்பாடுகள் மையம்' : 'Storage Owner Operations Center'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#AFF2C2] text-[#00210F] text-xs font-bold border border-[#7BE39D]">
                {facility.name}
              </span>
            </div>
            <p className="text-xs text-[#5B6660]">
              Oddanchatram Rural Bypass • 3 Chambers • Dual Solar Hybrid Inverter Active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/owner/inventory"
              className="h-10 px-3.5 rounded-xl bg-white border border-[#DFE4DC] text-[#14532D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#EEF6ED] shadow-2xs"
            >
              <Package size={15} />
              <span>{isTa ? 'சரக்கிருப்பு மேலாண்மை' : 'Inventory Dashboard'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowIntakeModal(true)}
              className="h-10 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <Scale size={15} />
              <span>{isTa ? 'வாயில் எடை பதிவு' : 'Gate Intake Scale'}</span>
            </button>
          </div>
        </div>

        {/* DUAL CAPACITY LEDGER: Physically occupied vs Reserved capacity */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#C8923A]" />
              <h2 className="text-sm font-bold text-[#0F3D2E]">
                {isTa ? 'இருவேறு கொள்ளளவு பதிவேடுகள் (Dual Capacity Ledger)' : 'Dual Capacity Accounting: Physical Occupancy vs. Reserved Capacity'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] border border-[#AFF2C2]">
              Strictly Separated Ledgers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F4FBF3] p-4 rounded-2xl border border-[#AFF2C2]">
              <span className="text-[10px] text-[#5B6660] uppercase tracking-wider font-bold block">
                Total Rated Capacity
              </span>
              <span className="text-xl font-extrabold text-[#14532D] mt-1 block">
                {(ledger.totalRatedCapacityKg / 1000).toFixed(0)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.totalRatedCapacityCrates} Crates Max</span>
            </div>

            <div className="bg-[#F4FBF3] p-4 rounded-2xl border border-[#AFF2C2]">
              <span className="text-[10px] text-[#14532D] uppercase tracking-wider font-bold block">
                Physical Occupancy
              </span>
              <span className="text-xl font-extrabold text-[#14532D] mt-1 block">
                {ledger.currentPhysicalOccupancyKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#14532D] font-bold">
                {ledger.utilizationPhysicalPercentage}% physical stock present
              </span>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E7D7BE]">
              <span className="text-[10px] text-[#C8923A] uppercase tracking-wider font-bold block">
                Reserved Capacity (Today)
              </span>
              <span className="text-xl font-extrabold text-[#C8923A] mt-1 block">
                {ledger.reservedCapacityKgToday} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#C8923A] font-bold">
                {ledger.utilizationReservedPercentage}% committed in bookings
              </span>
            </div>

            <div className="bg-[#F7F4EC] p-4 rounded-2xl border border-[#DFE4DC]">
              <span className="text-[10px] text-[#404941] uppercase tracking-wider font-bold block">
                Available Physical Space
              </span>
              <span className="text-xl font-extrabold text-[#1C2420] mt-1 block">
                {(ledger.availablePhysicalCapacityKg / 1000).toFixed(1)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.availablePhysicalCapacityCrates} crates ready</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-[11px] text-[#5B6660] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#14532D] flex-shrink-0" />
            <span>
              <strong>Non-Negotiable Architecture Invariant:</strong> Creating or modifying bookings only updates reserved capacity over a duration. Physical inventory intake operates independently and works without any mandatory booking ID.
            </span>
          </div>
        </div>

        {/* Module Quick Nav Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/owner/bookings"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <CalendarCheck size={20} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                {activeBookingsCount} Active
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Booking Management</span>
              <span className="text-[10px] text-[#5B6660]">Reservations &amp; approvals</span>
            </div>
          </Link>

          <Link
            to="/owner/inventory"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Package size={20} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#C8923A] bg-[#FFFBF0] px-2 py-0.5 rounded-full">
                {batches.length} Batches
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Normal Inventory</span>
              <span className="text-[10px] text-[#5B6660]">Walk-in, intake &amp; withdrawal</span>
            </div>
          </Link>

          <Link
            to="/owner/locations"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Thermometer size={20} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                3 Chambers
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Storage Locations</span>
              <span className="text-[10px] text-[#5B6660]">Chambers &amp; maintenance</span>
            </div>
          </Link>

          <Link
            to="/owner/ai-insights"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Sparkles size={20} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                2 Notices
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">AI Insights &amp; Alerts</span>
              <span className="text-[10px] text-[#5B6660]">Arbitrage &amp; near-expiry</span>
            </div>
          </Link>
        </div>

        {/* Live Chamber Telemetry Tiles */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161D18] flex items-center gap-1.5">
              <Thermometer size={18} className="text-[#14532D]" />
              <span>Chamber Status &amp; IoT Sensor Telemetry</span>
            </h2>
            <span className="text-[11px] text-[#14532D] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#14532D] animate-ping" />
              Sensors Online
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {facility.chambers.map((cham) => (
              <div
                key={cham.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                  cham.isMaintenance ? 'bg-[#FFDCC6]/20 border-[#FFB786]' : 'bg-[#EEF6ED] border-[#DDE4DD]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#161D18]">{cham.name.split('(')[0]}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cham.isMaintenance ? 'bg-[#844000] text-white' : 'bg-[#86F8C2] text-[#00210F]'
                      }`}
                    >
                      {cham.isMaintenance ? 'Calibrating' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#404941] mt-0.5">
                    Range: {cham.tempMin}°C - {cham.tempMax}°C
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#DDE4DD] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14532D]">{cham.currentTemp}°C</span>
                  <span className="font-semibold text-[#5B6660]">{cham.humidity}% RH</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements Table */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161D18] flex items-center gap-1.5">
              <History size={18} className="text-[#14532D]" />
              <span>Recent Physical Stock Movements</span>
            </h2>
            <Link to="/owner/inventory/history" className="text-xs font-bold text-[#14532D] hover:underline">
              View All Movements
            </Link>
          </div>

          <div className="divide-y divide-[#EEF6ED]">
            {movements.slice(0, 4).map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">
                    {m.batchCode} • {m.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[10px] text-[#5B6660]">{m.reason}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#14532D]">
                    {m.type === 'intake' ? '+' : '-'}{m.quantityKg} kg
                  </div>
                  <div className="text-[10px] text-[#5B6660]">
                    {new Date(m.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Weighing Scale Modal */}
        {showIntakeModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#14532D] flex items-center gap-2">
                  <Scale size={20} className="text-[#C8923A]" />
                  <span>Gate Intake Weighing Scale</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#5B6660]">
                Weigh farm truck at gate scale. Only verified gross weight will be recorded into chamber inventory.
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#404941]">Booking Reference</label>
                  <select
                    value={selectedBookingCode}
                    onChange={(e) => setSelectedBookingCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-mono bg-[#F4FBF3]"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.bookingCode}>
                        {b.bookingCode} - {b.cropName} ({b.bookedKg} kg booked by {b.farmerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Scale Weight (kg)</label>
                    <input
                      type="number"
                      value={scaleGrossKg}
                      onChange={(e) => setScaleGrossKg(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Crate Count</label>
                    <input
                      type="number"
                      value={crateCount}
                      onChange={(e) => setCrateCount(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#404941]">Destination Chamber</label>
                  <select
                    value={intakeChamber}
                    onChange={(e) => setIntakeChamber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                  >
                    {facility.chambers.map((c) => (
                      <option key={c.id} value={c.name} disabled={c.isMaintenance}>
                        {c.name} {c.isMaintenance ? '(Maintenance)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E]"
                  >
                    Verify &amp; Create Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
