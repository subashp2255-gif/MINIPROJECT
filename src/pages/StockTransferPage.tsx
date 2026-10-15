import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, ArrowLeft } from 'lucide-react';

export const StockTransferPage: React.FC = () => {
  const { facilities, batches, transferStock, language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTa = language === 'ta';

  const facility = facilities[0];
  const preselected = searchParams.get('batch') || batches[0]?.batchCode || '';
  const [selectedBatchCode, setSelectedBatchCode] = useState(preselected);

  const activeBatch = batches.find((b) => b.batchCode === selectedBatchCode) || batches[0];

  const [destinationChamber, setDestinationChamber] = useState(
    facility.chambers.find((c) => c.name !== activeBatch?.chamberName)?.name || 'Chamber 2 (Cool)'
  );
  const [transferKg, setTransferKg] = useState<number>(activeBatch ? Math.min(100, activeBatch.currentStockKg) : 50);
  const [transferCrates, setTransferCrates] = useState<number>(Math.ceil(transferKg / 25));
  const [reason, setReason] = useState('Chamber temperature re-balancing & space optimization');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const destChamberObj = facility.chambers.find((c) => c.name === destinationChamber);
  const destBatches = batches.filter((b) => b.chamberName === destinationChamber && b.status === 'in_storage');
  const destOccupancy = destBatches.reduce((acc, b) => acc + b.currentStockKg, 0);
  const destAvailableSpace = destChamberObj ? Math.max(0, destChamberObj.totalCapacityKg - destOccupancy) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No batch selected.');
      return;
    }

    if (transferKg <= 0) {
      setErrorMsg('Transfer weight must be greater than zero.');
      return;
    }

    if (transferKg > activeBatch.currentStockKg) {
      setErrorMsg(`Transfer quantity (${transferKg} kg) exceeds source stock (${activeBatch.currentStockKg} kg).`);
      return;
    }

    if (transferKg > destAvailableSpace) {
      setErrorMsg(`Destination chamber ${destinationChamber} only has ${destAvailableSpace} kg available space.`);
      return;
    }

    const success = transferStock(
      activeBatch.batchCode,
      activeBatch.chamberName,
      destinationChamber,
      transferKg,
      transferCrates,
      reason
    );

    if (success) {
      navigate('/owner/inventory');
    }
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/owner/inventory')}
            className="w-9 h-9 rounded-xl bg-white border border-[#DFE4DC] flex items-center justify-center text-[#14532D] hover:bg-[#F7F4EC]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F3D2E]">
              {isTa ? 'அறைகளுக்கு இடையேயான இடமாற்றம்' : 'Transfer Stock Between Chambers'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'முழு கிடங்கு இருப்பை மாற்றாமல் அறைகளை மாற்றுதல்' : 'Relocate produce internally without creating duplicate facility stock'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Select Crop Batch to Relocate</label>
            <select
              value={selectedBatchCode}
              onChange={(e) => {
                setSelectedBatchCode(e.target.value);
                const b = batches.find((item) => item.batchCode === e.target.value);
                if (b) {
                  setTransferKg(Math.min(100, b.currentStockKg));
                  setTransferCrates(Math.ceil(Math.min(100, b.currentStockKg) / 25));
                }
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            >
              {batches
                .filter((b) => b.currentStockKg > 0)
                .map((b) => (
                  <option key={b.id} value={b.batchCode}>
                    {b.batchCode} - {b.cropName} ({b.currentStockKg} kg currently in {b.chamberName})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC]">
              <span className="text-[10px] uppercase font-bold text-[#5B6660] block">Source Location</span>
              <span className="text-sm font-bold text-[#1C2420] block mt-0.5">{activeBatch?.chamberName}</span>
              <span className="text-xs text-[#14532D] font-bold">{activeBatch?.currentStockKg} kg balance</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2]">
              <span className="text-[10px] uppercase font-bold text-[#5B6660] block">Destination Space</span>
              <span className="text-sm font-bold text-[#14532D] block mt-0.5">{destinationChamber}</span>
              <span className="text-xs text-[#14532D] font-bold">{destAvailableSpace} kg available</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Destination Chamber</label>
            <select
              value={destinationChamber}
              onChange={(e) => setDestinationChamber(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            >
              {facility.chambers
                .filter((c) => c.name !== activeBatch?.chamberName)
                .map((c) => (
                  <option key={c.id} value={c.name} disabled={c.isMaintenance}>
                    {c.name} {c.isMaintenance ? '(Blocked for Maintenance)' : ''}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Transfer Quantity (kg)</label>
              <input
                type="number"
                value={transferKg}
                onChange={(e) => {
                  const kg = Number(e.target.value);
                  setTransferKg(kg);
                  setTransferCrates(Math.ceil(kg / 25));
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Crates Count</label>
              <input
                type="number"
                value={transferCrates}
                onChange={(e) => setTransferCrates(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Reason for Transfer</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft size={16} />
            <span>Transfer Stock &amp; Update Location Balances</span>
          </button>
        </form>
      </div>
    </div>
  );
};
