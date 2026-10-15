import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Scale,
  MinusCircle,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Sparkles,
  Download,
  Search,
  Thermometer,
  Layers,
} from 'lucide-react';

export const OwnerInventoryPage: React.FC = () => {
  const { batches, movements, archiveBatch, calculateCapacityLedger, language, showToast } = useApp();
  const isTa = language === 'ta';

  const [search, setSearch] = useState('');
  const [chamberFilter, setChamberFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  const ledger = calculateCapacityLedger('fac-1');

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      b.cropName.toLowerCase().includes(search.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(search.toLowerCase());
    const matchesChamber = chamberFilter === 'all' || b.chamberName.toLowerCase().includes(chamberFilter.toLowerCase());
    const matchesCond = conditionFilter === 'all' || b.condition === conditionFilter;
    return matchesSearch && matchesChamber && matchesCond;
  });

  const handleArchive = (batchCode: string) => {
    archiveBatch(batchCode);
  };

  const handleExportCsv = () => {
    const headers = 'BatchCode,Crop,Farmer/Supplier,Chamber,StockKg,StockCrates,Status,Condition,IntakeDate\n';
    const rows = batches
      .map(
        (b) =>
          `${b.batchCode},"${b.cropName}","${b.farmerName}","${b.chamberName}",${b.currentStockKg},${b.currentStockCrates},${b.status},${b.condition || 'good'},${b.intakeDate}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSync_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Inventory audit ledger exported to CSV successfully!', 'success');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                {isTa ? 'சுதந்திரமான கிடங்கு இருப்பு மேலாண்மை' : 'Normal Inventory Management'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-bold border border-[#AFF2C2]">
                Uzhavar Solar Hub #14
              </span>
            </div>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'முன்பதிவு இல்லாத நேரடி வரவு, சரக்கு மீட்பு, இடமாற்றம் & தணிக்கை' : 'Authoritative physical batch tracking, walk-in intakes, chamber transfers & audits'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-9 px-3 rounded-xl bg-white border border-[#DFE4DC] text-xs font-bold text-[#14532D] hover:bg-[#F7F4EC] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <Link
              to="/owner/inventory/intake"
              className="h-9 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] shadow-xs transition-colors"
            >
              <Plus size={15} />
              <span>{isTa ? 'சரக்கு வரவு (Intake)' : 'Record Intake'}</span>
            </Link>
          </div>
        </div>

        {/* 10-Operation Menu Grid */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#DFE4DC] shadow-xs space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6660] block">
            {isTa ? 'கிடங்கு செயல்பாடுகள் மெனு' : 'Inventory Operations Menu'}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <Link
              to="/owner/inventory/new"
              className="p-3 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]/60 hover:border-[#14532D] transition-all flex flex-col gap-1.5 text-left group"
            >
              <Plus size={18} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#0F3D2E] leading-tight">1. Add New Batch</span>
              <span className="text-[10px] text-[#5B6660]">Walk-in / Supplier</span>
            </Link>

            <Link
              to="/owner/inventory/intake"
              className="p-3 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]/60 hover:border-[#14532D] transition-all flex flex-col gap-1.5 text-left group"
            >
              <Scale size={18} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#0F3D2E] leading-tight">2. Record Intake</span>
              <span className="text-[10px] text-[#5B6660]">Physical scale entry</span>
            </Link>

            <Link
              to="/owner/inventory/withdrawal"
              className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E7D7BE] hover:border-[#C8923A] transition-all flex flex-col gap-1.5 text-left group"
            >
              <MinusCircle size={18} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#4A3319] leading-tight">3. Stock Withdrawal</span>
              <span className="text-[10px] text-[#5B6660]">Farmer Mandi dispatch</span>
            </Link>

            <Link
              to="/owner/inventory/transfer"
              className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E7D7BE] hover:border-[#C8923A] transition-all flex flex-col gap-1.5 text-left group"
            >
              <ArrowRightLeft size={18} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#4A3319] leading-tight">4. Transfer Stock</span>
              <span className="text-[10px] text-[#5B6660]">Between chambers</span>
            </Link>

            <Link
              to="/owner/inventory/adjust"
              className="p-3 rounded-2xl bg-[#FFF5F5] border border-red-200 hover:border-red-400 transition-all flex flex-col gap-1.5 text-left group"
            >
              <SlidersHorizontal size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-red-900 leading-tight">5. Adjust Stock</span>
              <span className="text-[10px] text-[#5B6660]">Damage / Spoilage</span>
            </Link>

            <Link
              to="/owner/inventory/history"
              className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] hover:border-[#14532D] transition-all flex flex-col gap-1.5 text-left group"
            >
              <History size={18} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#0F3D2E] leading-tight">6. Movement Ledger</span>
              <span className="text-[10px] text-[#5B6660]">Audit transaction history</span>
            </Link>

            <Link
              to="/owner/locations"
              className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] hover:border-[#14532D] transition-all flex flex-col gap-1.5 text-left group"
            >
              <Thermometer size={18} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#0F3D2E] leading-tight">7. Storage Locations</span>
              <span className="text-[10px] text-[#5B6660]">Chambers & Telemetry</span>
            </Link>

            <Link
              to="/owner/ai-insights"
              className="p-3 rounded-2xl bg-[#FFFBF0] border border-[#F0D590] hover:border-[#C8923A] transition-all flex flex-col gap-1.5 text-left group"
            >
              <Sparkles size={18} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#634800] leading-tight">8. AI Insights</span>
              <span className="text-[10px] text-[#5B6660]">Expiry & Demand</span>
            </Link>

            <button
              type="button"
              onClick={handleExportCsv}
              className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] hover:border-[#14532D] transition-all flex flex-col gap-1.5 text-left group cursor-pointer"
            >
              <Download size={18} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#0F3D2E] leading-tight">9. Export CSV</span>
              <span className="text-[10px] text-[#5B6660]">Download records</span>
            </button>

            <div className="p-3 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2] flex flex-col justify-center text-left">
              <span className="text-[10px] uppercase font-bold text-[#5B6660]">Active Lots</span>
              <span className="text-xl font-bold text-[#14532D]">{batches.length}</span>
              <span className="text-[10px] text-[#5B6660]">{movements.length} movements logged</span>
            </div>
          </div>
        </div>

        {/* DUAL CAPACITY LEDGER: Clearly distinct Physical Occupancy vs Reserved Capacity */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F3D2E] flex items-center gap-1.5">
              <Layers size={17} className="text-[#C8923A]" />
              <span>{isTa ? 'கொள்ளளவு ஒப்பீடு: உடல் இருப்பு vs முன்பதிவு' : 'Capacity Accounting: Physical Occupancy vs. Reserved Capacity'}</span>
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D]">
              Dual Ledger Model
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]">
              <span className="text-[10px] uppercase font-bold text-[#5B6660] block">Rated Total Capacity</span>
              <span className="text-lg font-extrabold text-[#14532D] block mt-1">
                {(ledger.totalRatedCapacityKg / 1000).toFixed(0)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.totalRatedCapacityCrates} crates max</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]">
              <span className="text-[10px] uppercase font-bold text-[#14532D] block">Physical Occupancy</span>
              <span className="text-lg font-extrabold text-[#14532D] block mt-1">
                {ledger.currentPhysicalOccupancyKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#14532D] font-bold">{ledger.utilizationPhysicalPercentage}% actual physical stock</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E7D7BE]">
              <span className="text-[10px] uppercase font-bold text-[#C8923A] block">Reserved Capacity</span>
              <span className="text-lg font-extrabold text-[#C8923A] block mt-1">
                {ledger.reservedCapacityKgToday} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#C8923A] font-bold">{ledger.utilizationReservedPercentage}% committed in bookings</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC]">
              <span className="text-[10px] uppercase font-bold text-[#5B6660] block">Available Physical Space</span>
              <span className="text-lg font-extrabold text-[#1C2420] block mt-1">
                {(ledger.availablePhysicalCapacityKg / 1000).toFixed(1)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.availablePhysicalCapacityCrates} crates ready</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-[#5B6660]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch ID, crop name, farmer..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-white focus:border-[#14532D] outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={chamberFilter}
              onChange={(e) => setChamberFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#DFE4DC] text-xs font-semibold bg-white text-[#404941]"
            >
              <option value="all">All Chambers</option>
              <option value="Chamber 1">Chamber 1 (Chilled)</option>
              <option value="Chamber 2">Chamber 2 (Cool)</option>
              <option value="Chamber 3">Chamber 3 (Controlled)</option>
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#DFE4DC] text-xs font-semibold bg-white text-[#404941]"
            >
              <option value="all">All Conditions</option>
              <option value="good">Good Condition</option>
              <option value="damaged">Damaged / Flagged</option>
              <option value="spoiled">Spoiled</option>
            </select>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-3xl border border-[#DFE4DC] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF6ED] text-[#161D18] border-b border-[#DDE4DD]">
                <tr>
                  <th className="p-3.5 font-bold">Batch ID</th>
                  <th className="p-3.5 font-bold">Produce / Grade</th>
                  <th className="p-3.5 font-bold">Farmer / Source</th>
                  <th className="p-3.5 font-bold">Chamber Location</th>
                  <th className="p-3.5 font-bold">Current Physical Stock</th>
                  <th className="p-3.5 font-bold">Condition</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DD]">
                {filteredBatches.map((b) => {
                  const isDamaged = b.condition === 'damaged' || b.condition === 'spoiled';
                  const isZeroStock = b.currentStockKg === 0;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-md">
                          {b.batchCode}
                        </span>
                        {b.bookingId ? (
                          <span className="block text-[10px] text-[#5B6660] mt-0.5 font-mono">Ref: Booking</span>
                        ) : (
                          <span className="block text-[10px] text-[#C8923A] font-bold mt-0.5">Walk-in</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#161D18]">{b.cropName}</div>
                        <div className="text-[10px] text-[#5B6660]">{b.grade}</div>
                      </td>

                      <td className="p-3.5 font-medium text-[#1C2420]">
                        {b.farmerName}
                      </td>

                      <td className="p-3.5 font-semibold text-[#14532D]">
                        {b.chamberName}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-sm text-[#0F3D2E]">
                          {b.currentStockKg} <span className="text-xs font-normal">kg</span>
                        </span>
                        <span className="text-[10px] text-[#5B6660] block">
                          {b.currentStockCrates} crates
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDamaged
                              ? 'bg-red-100 text-red-700'
                              : 'bg-[#AFF2C2] text-[#00210F]'
                          }`}
                        >
                          {(b.condition || 'good').toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          to={`/owner/inventory/withdrawal?batch=${b.batchCode}`}
                          className="px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#E7D7BE] text-[#C8923A] font-bold hover:bg-white text-[11px]"
                        >
                          Withdraw
                        </Link>

                        <Link
                          to={`/owner/inventory/transfer?batch=${b.batchCode}`}
                          className="px-2.5 py-1 rounded-lg bg-[#F7F4EC] border border-[#DFE4DC] text-[#404941] font-bold hover:bg-white text-[11px]"
                        >
                          Transfer
                        </Link>

                        {isZeroStock && (
                          <button
                            type="button"
                            onClick={() => handleArchive(b.batchCode)}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 text-[11px]"
                          >
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
