import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { InventoryBatch } from '../types';

export const FarmerInventoryPage: React.FC = () => {
  const { batches, movements, performPartialWithdrawal, refreshTelemetry, language, t } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'stored' | 'transit' | 'ready'>('all');
  const [selectedBatchForWithdrawal, setSelectedBatchForWithdrawal] = useState<InventoryBatch | null>(null);
  const [withdrawKg, setWithdrawKg] = useState<number>(100);
  const [withdrawReason, setWithdrawReason] = useState<string>('Mandi sales order dispatch');
  const [selectedTimelineBatch, setSelectedTimelineBatch] = useState<InventoryBatch | null>(null);

  const filteredBatches = batches.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'stored') return b.status === 'in_storage';
    if (filter === 'transit') return b.status === 'in_transit';
    if (filter === 'ready') return b.status === 'ready_to_collect' || b.dayTotal - b.dayCurrent <= 6;
    return true;
  });

  const totalStoredKg = batches
    .filter((b) => b.status === 'in_storage')
    .reduce((sum, b) => sum + b.currentStockKg, 0);

  const totalTransitKg = batches
    .filter((b) => b.status === 'in_transit')
    .reduce((sum, b) => sum + b.currentStockKg, 0);

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForWithdrawal) return;

    const crates = Math.ceil(withdrawKg / 25);
    const success = performPartialWithdrawal(
      selectedBatchForWithdrawal.batchCode,
      withdrawKg,
      crates,
      withdrawReason
    );
    if (success) {
      setSelectedBatchForWithdrawal(null);
    }
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Sub-header & State sync status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e5e3a]">
                {t('produceInventory')}
              </h1>
              <span className="text-xs text-[#404941] font-medium">{t('activeLots')}</span>
            </div>
            <p className="text-xs text-[#404941] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#006c49]">cloud_done</span>
              <span>
                {language === 'ta'
                  ? 'தமிழ்நாடு வேளாண் கட்டமைப்புடன் இணைக்கப்பட்டது • 2 நிமிடங்களுக்கு முன்'
                  : 'TN-Agri Grid Synced • 2 mins ago'}
              </span>
            </p>
          </div>
          <button
            onClick={refreshTelemetry}
            aria-label="Refresh Inventory Data"
            className="w-10 h-10 rounded-full bg-[#e9f0e8] hover:bg-[#e3eae2] flex items-center justify-center text-[#1e5e3a] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </button>
        </div>

        {/* Discrepancy / Attention Alert Banner */}
        <div
          onClick={() => navigate('/capacity-conflict')}
          className="w-full bg-[#844000]/10 p-3.5 rounded-xl shadow-xs flex items-start gap-2.5 border border-[#ffb786]/60 cursor-pointer hover:bg-[#844000]/15 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#844000]/20 flex items-center justify-center flex-shrink-0 text-[#844000] mt-0.5">
            <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#844000] uppercase tracking-wide">
                {t('actionNeeded')}
              </span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-[#844000] text-[#ffdcc6] font-semibold">
                {t('pendingCount')}
              </span>
            </div>
            <p className="text-xs text-[#161d18] mt-0.5 font-medium leading-snug truncate">
              {t('gateVerificationNotice')}
            </p>
            <p className="text-[11px] text-[#404941] truncate">{t('uzhavarPalaniHub')}</p>
          </div>
          <button className="text-[#844000] p-1 flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

        {/* Unified Produce Overview Summary Cards (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* Active Batches */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-[#dfe4dc] flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#1e5e3a]/10 flex items-center justify-center text-[#1e5e3a] mb-2">
              <span className="material-symbols-outlined text-[16px]">layers</span>
            </div>
            <div>
              <span className="text-xs text-[#404941] block font-medium">{t('batchesStat')}</span>
              <span className="text-[10px] text-[#404941]/80 block leading-none">Active Lots</span>
              <span className="text-lg font-bold text-[#1e5e3a] mt-1 block">{batches.length}</span>
            </div>
          </div>

          {/* Verified Stored */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-[#dfe4dc] flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#006c49]/10 flex items-center justify-center text-[#006c49] mb-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
            <div>
              <span className="text-xs text-[#404941] block font-medium">{t('storedStat')}</span>
              <span className="text-[10px] text-[#404941]/80 block leading-none">Cold Chambers</span>
              <span className="text-lg font-bold text-[#006c49] mt-1 block">
                {totalStoredKg.toLocaleString()}
                <span className="text-xs font-normal text-[#404941] ml-0.5">kg</span>
              </span>
            </div>
          </div>

          {/* In-Transit / Booked */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-[#dfe4dc] flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#844000]/10 flex items-center justify-center text-[#844000] mb-2">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
            <div>
              <span className="text-xs text-[#404941] block font-medium">{t('inTransitStat')}</span>
              <span className="text-[10px] text-[#404941]/80 block leading-none">En Route</span>
              <span className="text-lg font-bold text-[#844000] mt-1 block">
                {totalTransitKg.toLocaleString()}
                <span className="text-xs font-normal text-[#404941] ml-0.5">kg</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Chips with Counter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
              filter === 'all'
                ? 'bg-[#1e5e3a] text-white shadow-xs'
                : 'bg-[#e9f0e8] text-[#161d18] hover:bg-[#e3eae2]'
            }`}
          >
            <span>{t('allTab')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ml-0.5 ${
                filter === 'all' ? 'bg-[#aff2c2] text-[#00210f]' : 'bg-[#dde4dd] text-[#404941]'
              }`}
            >
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('stored')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
              filter === 'stored'
                ? 'bg-[#1e5e3a] text-white shadow-xs'
                : 'bg-[#e9f0e8] text-[#161d18] hover:bg-[#e3eae2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#006c49]">ac_unit</span>
            <span>{t('inStorageTab')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                filter === 'stored' ? 'bg-[#aff2c2] text-[#00210f]' : 'bg-[#dde4dd] text-[#404941]'
              }`}
            >
              {batches.filter((b) => b.status === 'in_storage').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('transit')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
              filter === 'transit'
                ? 'bg-[#1e5e3a] text-white shadow-xs'
                : 'bg-[#e9f0e8] text-[#161d18] hover:bg-[#e3eae2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#844000]">sync_alt</span>
            <span>{t('inTransitStat')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                filter === 'transit' ? 'bg-[#aff2c2] text-[#00210f]' : 'bg-[#dde4dd] text-[#404941]'
              }`}
            >
              {batches.filter((b) => b.status === 'in_transit').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('ready')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
              filter === 'ready'
                ? 'bg-[#1e5e3a] text-white shadow-xs'
                : 'bg-[#e9f0e8] text-[#161d18] hover:bg-[#e3eae2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#1e5e3a]">outbox</span>
            <span>{t('readyToCollectTab')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                filter === 'ready' ? 'bg-[#aff2c2] text-[#00210f]' : 'bg-[#dde4dd] text-[#404941]'
              }`}
            >
              1
            </span>
          </button>
        </div>

        {/* Produce Batch Stack Cards */}
        <div className="flex flex-col gap-3.5 w-full">
          {filteredBatches.map((batch) => {
            const elapsedPercent = Math.min(100, Math.round((batch.dayCurrent / batch.dayTotal) * 100));

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl shadow-sm border border-[#dfe4dc] overflow-hidden"
              >
                <div className="p-4 flex flex-col gap-3">
                  {/* Top row: Crop meta + status tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#e9f0e8] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          alt={batch.cropName}
                          src={batch.cropImageUrl}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-[#161d18] truncate">
                            {language === 'ta' ? batch.cropNameTa : batch.cropName}
                          </span>
                          <span className="text-xs text-[#404941] font-medium">{batch.grade}</span>
                        </div>
                        <span className="text-xs text-[#006c49] font-mono font-semibold block">
                          {batch.batchCode}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#86f8c2]/60 text-[#00734e] text-xs font-bold flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                      <span>
                        Day {batch.dayCurrent}/{batch.dayTotal}
                      </span>
                    </span>
                  </div>

                  {/* Telemetry & Chamber Specs */}
                  <div className="bg-[#eef6ed] rounded-lg p-2.5 flex items-center justify-between text-[#161d18]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-[#1e5e3a] flex-shrink-0">
                        warehouse
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{batch.facilityName}</p>
                        <p className="text-[11px] text-[#404941]">{batch.chamberName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                      <div className="flex items-center gap-1 text-[#1e5e3a] text-xs font-bold bg-white px-2 py-1 rounded-md shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">thermostat</span>
                        {batch.currentTemp}°C
                      </div>
                      <div className="flex items-center gap-1 text-[#1e5e3a] text-xs font-bold bg-white px-2 py-1 rounded-md shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">humidity_mid</span>
                        {batch.currentHumidity}%
                      </div>
                    </div>
                  </div>

                  {/* Weight and Lot stats */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="bg-[#e9f0e8]/60 rounded-lg p-2 flex flex-col justify-center">
                      <span className="text-[11px] text-[#404941]">
                        {batch.status === 'in_storage' ? 'Verified Intake' : 'Inbound Weight'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-[#1e5e3a]">
                          {batch.currentStockKg}
                        </span>
                        <span className="text-xs text-[#404941]">
                          kg ({batch.currentStockCrates} crates)
                        </span>
                      </div>
                      <span className="text-[10px] text-[#006c49] font-semibold mt-0.5 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        <span>100% Match</span>
                      </span>
                    </div>

                    <div className="bg-[#e9f0e8]/60 rounded-lg p-2 flex flex-col justify-center">
                      <span className="text-[11px] text-[#404941]">Target Collect</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-[#161d18]">
                          {batch.targetCollectDate.split('-')[2]} Oct
                        </span>
                        <span className="text-xs text-[#404941]">2026</span>
                      </div>
                      <span className="text-[10px] text-[#404941] mt-0.5 truncate">
                        {batch.dayTotal - batch.dayCurrent} Days left
                      </span>
                    </div>
                  </div>

                  {/* Storage Shelf-life Visual Progress Bar */}
                  <div className="w-full flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#404941] font-medium">Optimal Storage Window</span>
                      <span className="text-[#006c49] font-bold">{elapsedPercent}% Elapsed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#e9f0e8] overflow-hidden">
                      <div
                        className="h-full bg-[#006c49] rounded-full transition-all duration-300"
                        style={{ width: `${elapsedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to="/booking/SRS-TN-8492/confirmation"
                      className="flex-1 h-11 bg-[#1e5e3a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#16462b] active:scale-98 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                      <span>{t('gatePassBtn')}</span>
                    </Link>

                    <button
                      onClick={() => setSelectedBatchForWithdrawal(batch)}
                      className="h-11 px-3 bg-[#e9f0e8] text-[#1e5e3a] rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#e3eae2] active:scale-98 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">output</span>
                      <span>{t('partialWithdrawalBtn')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedTimelineBatch(batch)}
                      className="h-11 px-3 bg-[#e9f0e8] text-[#404941] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#e3eae2] active:scale-98 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      <span>{t('timelineBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partial Withdrawal Dialog */}
      {selectedBatchForWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#dde4dd]">
              <div>
                <h3 className="font-bold text-lg text-[#161d18]">Partial Produce Withdrawal</h3>
                <p className="text-xs text-[#404941]">
                  Batch {selectedBatchForWithdrawal.batchCode} • {selectedBatchForWithdrawal.cropName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForWithdrawal(null)}
                className="text-[#707971] hover:text-[#161d18]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="bg-[#eef6ed] p-3 rounded-xl flex items-center justify-between text-xs">
                <span>Available Stock:</span>
                <span className="font-bold text-[#1e5e3a]">
                  {selectedBatchForWithdrawal.currentStockKg} kg ({selectedBatchForWithdrawal.currentStockCrates} crates)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161d18] mb-1">
                  Withdrawal Quantity (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawKg((prev) => Math.max(25, prev - 25))}
                    className="w-12 h-12 rounded-xl bg-[#e9f0e8] text-xl font-bold flex items-center justify-center hover:bg-[#e3eae2]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={withdrawKg}
                    min={1}
                    max={selectedBatchForWithdrawal.currentStockKg}
                    onChange={(e) => setWithdrawKg(Number(e.target.value))}
                    className="flex-1 h-12 text-center text-lg font-bold border border-[#c0c9bf] rounded-xl focus:border-[#1e5e3a] focus:ring-1 focus:ring-[#1e5e3a] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setWithdrawKg((prev) =>
                        Math.min(selectedBatchForWithdrawal.currentStockKg, prev + 25)
                      )
                    }
                    className="w-12 h-12 rounded-xl bg-[#e9f0e8] text-xl font-bold flex items-center justify-center hover:bg-[#e3eae2]"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-[#404941] mt-1">
                  ~{Math.ceil(withdrawKg / 25)} standard transport crates
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161d18] mb-1">
                  Reason for Movement
                </label>
                <input
                  type="text"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full h-11 px-3 text-xs border border-[#c0c9bf] rounded-xl focus:border-[#1e5e3a] outline-hidden"
                  placeholder="e.g. Dispatched to Oddanchatram wholesale market"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForWithdrawal(null)}
                  className="flex-1 h-11 bg-[#e9f0e8] rounded-xl font-bold text-xs text-[#161d18] hover:bg-[#e3eae2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#1e5e3a] text-white rounded-xl font-bold text-xs hover:bg-[#16462b] shadow-xs"
                >
                  Confirm &amp; Issue Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Timeline History Modal */}
      {selectedTimelineBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#dde4dd]">
              <div>
                <h3 className="font-bold text-lg text-[#161d18]">Batch Movement Ledger</h3>
                <p className="text-xs text-[#404941]">
                  Audit trail for {selectedTimelineBatch.batchCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedTimelineBatch(null)}
                className="text-[#707971] hover:text-[#161d18]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {movements
                .filter((m) => m.batchCode === selectedTimelineBatch.batchCode)
                .map((mov) => (
                  <div
                    key={mov.id}
                    className="p-3 bg-[#eef6ed] rounded-xl border border-[#dde4dd] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[#006c49]">
                        {mov.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#404941]">
                        {new Date(mov.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-[#161d18]">
                      {mov.quantityKg} kg ({mov.quantityCrates} crates)
                    </div>
                    <p className="text-[#404941]">{mov.reason}</p>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Ref: {mov.receiptNumber} • Auth: {mov.authorizedBy}
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectedTimelineBatch(null)}
              className="w-full h-11 bg-[#1e5e3a] text-white rounded-xl font-bold text-xs hover:bg-[#16462b]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
