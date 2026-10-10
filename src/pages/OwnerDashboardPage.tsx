import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const OwnerDashboardPage: React.FC = () => {
  const { facilities, bookings, verifyIntake } = useApp();
  const facility = facilities[0]; // Uzhavar Solar Hub #14

  // State for quick intake verification modal
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>('#SRS-24-9104');
  const [scaleGrossKg, setScaleGrossKg] = useState<number>(495);
  const [crateCount, setCrateCount] = useState<number>(20);
  const [intakeChamber, setIntakeChamber] = useState<string>('Chamber 1');
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);

  // Calculate capacities
  const totalCapacityKg = facility.chambers.reduce((a, b) => a + b.totalCapacityKg, 0);
  const availableCapacityKg = facility.chambers.reduce((a, b) => a + b.availableCapacityKg, 0);
  const occupiedKg = totalCapacityKg - availableCapacityKg;
  const utilizationPercent = Math.round((occupiedKg / totalCapacityKg) * 100);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyIntake(selectedBookingCode, scaleGrossKg, crateCount, intakeChamber);
    setShowIntakeModal(false);
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e5e3a]">
                Owner Operations Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#aff2c2] text-[#00210f] text-xs font-bold">
                Uzhavar Solar Hub #14
              </span>
            </div>
            <p className="text-xs text-[#404941]">
              Oddanchatram Rural Bypass • 3 Chambers • Dual Solar Hybrid Inverter Active
            </p>
          </div>

          <button
            onClick={() => setShowIntakeModal(true)}
            className="h-11 px-4 rounded-xl bg-[#1e5e3a] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#16462b] shadow-xs active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">scale</span>
            <span>Gate Intake Scale</span>
          </button>
        </div>

        {/* Capacity Analytics Grid (Stitch Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-[#dfe4dc] shadow-sm">
            <span className="text-[11px] text-[#404941] uppercase tracking-wider font-semibold block">
              Total Capacity
            </span>
            <span className="text-xl font-extrabold text-[#161d18] mt-1 block">
              {(totalCapacityKg / 1000).toFixed(0)} <span className="text-xs font-normal">Tonnes</span>
            </span>
            <span className="text-[10px] text-[#404941]">1,200 Crates Max</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#dfe4dc] shadow-sm">
            <span className="text-[11px] text-[#006c49] uppercase tracking-wider font-semibold block">
              Available Space
            </span>
            <span className="text-xl font-extrabold text-[#006c49] mt-1 block">
              {(availableCapacityKg / 1000).toFixed(1)} <span className="text-xs font-normal">Tonnes</span>
            </span>
            <span className="text-[10px] text-[#006c49] font-medium">430 Crates Ready</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#dfe4dc] shadow-sm">
            <span className="text-[11px] text-[#1e5e3a] uppercase tracking-wider font-semibold block">
              Occupied Slots
            </span>
            <span className="text-xl font-extrabold text-[#1e5e3a] mt-1 block">
              {utilizationPercent}%
            </span>
            <span className="text-[10px] text-[#1e5e3a] font-medium">
              {(occupiedKg / 1000).toFixed(1)} Tonnes Stored
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#dfe4dc] shadow-sm">
            <span className="text-[11px] text-[#844000] uppercase tracking-wider font-semibold block">
              Maint. Blocked
            </span>
            <span className="text-xl font-extrabold text-[#844000] mt-1 block">
              1.0 <span className="text-xs font-normal">T</span>
            </span>
            <span className="text-[10px] text-[#844000] font-medium">Chamber 2 Sub-Cooling</span>
          </div>
        </div>

        {/* Live Chamber Telemetry Tiles */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161d18] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#1e5e3a]">nest_multi_room</span>
              <span>Chamber Status &amp; IoT Telemetry</span>
            </h2>
            <span className="text-[11px] text-[#006c49] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-ping"></span>
              Sensors Online
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {facility.chambers.map((cham) => (
              <div
                key={cham.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  cham.isMaintenance
                    ? 'bg-[#ffdcc6]/20 border-[#ffb786]'
                    : 'bg-[#eef6ed] border-[#dde4dd]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#161d18]">{cham.name.split('(')[0]}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cham.isMaintenance ? 'bg-[#844000] text-white' : 'bg-[#86f8c2] text-[#00210f]'
                      }`}
                    >
                      {cham.isMaintenance ? 'Calibrating' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#404941] mt-0.5">
                    Range: {cham.tempMin}°C - {cham.tempMax}°C
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#dde4dd]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-extrabold text-[#1e5e3a]">{cham.currentTemp}°C</span>
                    <span className="text-xs font-bold text-[#404941]">{cham.humidity}% RH</span>
                  </div>
                  <div className="text-[10px] text-[#404941] mt-1">
                    Free: {cham.availableCapacityCrates} crates ({cham.availableCapacityKg} kg)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Farmer Reservations & Intake Management */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161d18]">Incoming Farmer Bookings &amp; Intake</h2>
            <span className="text-xs text-[#1e5e3a] font-bold">{bookings.length} Bookings</span>
          </div>

          <div className="space-y-2.5">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-[#eef6ed] rounded-xl flex items-center justify-between gap-3 border border-[#dde4dd]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#161d18]">{b.bookingCode}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-[#86f8c2] text-[#00734e]'
                          : b.status === 'in_storage'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'needs_resolution'
                          ? 'bg-[#ffdcc6] text-[#844000]'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {b.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#404941] mt-0.5">
                    {b.farmerName} ({b.farmerPhone}) • {b.cropName} ({b.bookedKg} kg)
                  </p>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Batch PIN: {b.batchPin} • Assigned: {b.chamberName}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setSelectedBookingCode(b.bookingCode);
                        setScaleGrossKg(b.bookedKg);
                        setCrateCount(b.bookedCrates);
                        setShowIntakeModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1e5e3a] text-white text-xs font-bold hover:bg-[#16462b]"
                    >
                      Weigh &amp; Admit
                    </button>
                  )}
                  {b.status === 'needs_resolution' && (
                    <Link
                      to="/capacity-conflict"
                      className="px-3 py-1.5 rounded-lg bg-[#844000] text-white text-xs font-bold hover:bg-[#612d00]"
                    >
                      View Notice
                    </Link>
                  )}
                  {b.status === 'in_storage' && (
                    <span className="text-xs text-[#006c49] font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[15px]">done_all</span>
                      Stored
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Gate Intake Modal */}
        {showIntakeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#dde4dd]">
                <div>
                  <h3 className="font-bold text-lg text-[#161d18]">Gate Intake Weighing Scale</h3>
                  <p className="text-xs text-[#404941]">Gross Platform Scale Intake Verification</p>
                </div>
                <button onClick={() => setShowIntakeModal(false)} className="text-[#707971]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#404941] mb-1">
                    Booking Reference
                  </label>
                  <select
                    value={selectedBookingCode}
                    onChange={(e) => setSelectedBookingCode(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.bookingCode}>
                        {b.bookingCode} - {b.farmerName} ({b.cropName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#404941] mb-1">
                      Scale Gross Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={scaleGrossKg}
                      onChange={(e) => setScaleGrossKg(Number(e.target.value))}
                      className="w-full h-11 px-3 text-sm font-bold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#404941] mb-1">
                      Verified Crates
                    </label>
                    <input
                      type="number"
                      value={crateCount}
                      onChange={(e) => setCrateCount(Number(e.target.value))}
                      className="w-full h-11 px-3 text-sm font-bold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#404941] mb-1">
                    Slot into Chamber
                  </label>
                  <select
                    value={intakeChamber}
                    onChange={(e) => setIntakeChamber(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                  >
                    <option value="Chamber 1">Chamber 1 (2.8°C Vegetables)</option>
                    <option value="Chamber 2" disabled>Chamber 2 [CALIBRATION LOCKED]</option>
                    <option value="Chamber 3">Chamber 3 (7.2°C Atmosphere)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    className="flex-1 h-11 bg-[#e9f0e8] text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-[#1e5e3a] text-white text-xs font-bold rounded-xl hover:bg-[#16462b]"
                  >
                    Admit Produce &amp; Issue Batch Pass
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
