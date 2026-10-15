import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';

export const StockAdjustmentPage: React.FC = () => {
  const { batches, adjustStock, language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTa = language === 'ta';

  const preselected = searchParams.get('batch') || batches[0]?.batchCode || '';
  const [selectedBatchCode, setSelectedBatchCode] = useState(preselected);

  const activeBatch = batches.find((b) => b.batchCode === selectedBatchCode) || batches[0];

  const [adjustedKg, setAdjustedKg] = useState<number>(activeBatch ? activeBatch.currentStockKg : 200);
  const [adjustedCrates, setAdjustedCrates] = useState<number>(Math.ceil(adjustedKg / 25));
  const [reasonCategory, setReasonCategory] = useState<string>('Physical-count discrepancy');
  const [detailedNotes, setDetailedNotes] = useState<string>('Routine weekly scale audit reconciliation');
  const [condition, setCondition] = useState<string>(activeBatch?.condition || 'good');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No batch selected.');
      return;
    }

    if (adjustedKg < 0) {
      setErrorMsg('Stock quantity cannot be negative.');
      return;
    }

    const fullReason = `${reasonCategory}: ${detailedNotes}`;
    const success = adjustStock(activeBatch.batchCode, adjustedKg, adjustedCrates, fullReason, condition);
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
              {isTa ? 'இருப்பு தணிக்கை & சேத திருத்தம்' : 'Stock Adjustment & Damage Auditing'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'உண்மை நிலை சரிபார்ப்பு, சேதம், அழுகல் மற்றும் தணிக்கை திருத்தம்' : 'Record discrepancy reconciliations with mandatory audit reasons'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Existing Balance Header */}
        {activeBatch && (
          <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                Recorded Ledger Balance Before Adjustment
              </span>
              <span className="text-xl font-extrabold text-red-950 block mt-0.5">
                {activeBatch.currentStockKg} kg ({activeBatch.currentStockCrates} crates)
              </span>
              <span className="text-xs text-[#5B6660]">
                {activeBatch.cropName} • {activeBatch.chamberName} • {activeBatch.batchCode}
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-red-200 text-red-700">
              Audit Required
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Select Crop Batch</label>
            <select
              value={selectedBatchCode}
              onChange={(e) => {
                setSelectedBatchCode(e.target.value);
                const b = batches.find((item) => item.batchCode === e.target.value);
                if (b) {
                  setAdjustedKg(b.currentStockKg);
                  setAdjustedCrates(b.currentStockCrates);
                  setCondition(b.condition || 'good');
                }
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.batchCode}>
                  {b.batchCode} - {b.cropName} ({b.currentStockKg} kg in {b.chamberName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Verified Physical Weight (kg)</label>
              <input
                type="number"
                value={adjustedKg}
                onChange={(e) => {
                  const kg = Number(e.target.value);
                  setAdjustedKg(kg);
                  setAdjustedCrates(Math.ceil(kg / 25));
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Physical Crates Count</label>
              <input
                type="number"
                value={adjustedCrates}
                onChange={(e) => setAdjustedCrates(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Reason Category (Mandatory)</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              >
                <option value="Physical-count discrepancy">Physical-count discrepancy</option>
                <option value="Produce spoilage / rot write-off">Produce spoilage / rot write-off</option>
                <option value="Handling damage / crate drop">Handling damage / crate drop</option>
                <option value="Moisture weight loss (Shrinkage)">Moisture weight loss (Shrinkage)</option>
                <option value="Data entry correction">Data entry correction</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Produce Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              >
                <option value="good">Good / Fresh</option>
                <option value="fair">Standard (Aging)</option>
                <option value="damaged">Damaged / Bruised</option>
                <option value="spoiled">Spoiled (Requires Quarantine)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Auditor Notes &amp; Justification</label>
            <input
              type="text"
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            <span>Apply Stock Adjustment &amp; Record Audit Log</span>
          </button>
        </form>
      </div>
    </div>
  );
};
