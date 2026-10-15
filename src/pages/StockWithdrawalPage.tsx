import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MinusCircle, ArrowLeft } from 'lucide-react';

export const StockWithdrawalPage: React.FC = () => {
  const { batches, performPartialWithdrawal, language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTa = language === 'ta';

  const preselectedBatch = searchParams.get('batch') || batches[0]?.batchCode || '';
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>(preselectedBatch);

  const activeBatch = batches.find((b) => b.batchCode === selectedBatchCode) || batches[0];

  const [withdrawKg, setWithdrawKg] = useState<number>(activeBatch ? Math.min(100, activeBatch.currentStockKg) : 50);
  const [withdrawCrates, setWithdrawCrates] = useState<number>(Math.ceil(withdrawKg / 25));
  const [reason, setReason] = useState<string>('Farmer request for wholesale APMC auction dispatch');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeBatch) {
      setWithdrawKg(Math.min(100, activeBatch.currentStockKg));
      setWithdrawCrates(Math.ceil(Math.min(100, activeBatch.currentStockKg) / 25));
    }
  }, [selectedBatchCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No active batch selected.');
      return;
    }

    if (withdrawKg <= 0) {
      setErrorMsg('Withdrawal quantity must be greater than zero.');
      return;
    }

    if (withdrawKg > activeBatch.currentStockKg) {
      setErrorMsg(
        `Withdrawal requested (${withdrawKg} kg) exceeds available physical stock (${activeBatch.currentStockKg} kg) in batch ${activeBatch.batchCode}. Negative stock is strictly prohibited.`
      );
      return;
    }

    const success = performPartialWithdrawal(activeBatch.batchCode, withdrawKg, withdrawCrates, reason);
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
              {isTa ? 'சரக்கு மீட்பு / விடுவிப்பு' : 'Record Stock Withdrawal'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'மண்டி விற்பனைக்கான சரக்கு வெளியேற்றம் (Negative stock prevented)' : 'Dispatches physical produce from chamber storage with balance deduction'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Selected Batch Balance Display */}
        {activeBatch && (
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E7D7BE] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#C8923A] uppercase tracking-wider block">
                Current Physical Stock Balance
              </span>
              <span className="text-xl font-extrabold text-[#4A3319] block mt-0.5">
                {activeBatch.currentStockKg} kg ({activeBatch.currentStockCrates} crates)
              </span>
              <span className="text-xs text-[#5B6660]">
                {activeBatch.cropName} • {activeBatch.chamberName} • {activeBatch.farmerName}
              </span>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#DFE4DC]">
              {activeBatch.batchCode}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Select Crop Batch to Withdraw From</label>
            <select
              value={selectedBatchCode}
              onChange={(e) => setSelectedBatchCode(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            >
              {batches
                .filter((b) => b.currentStockKg > 0)
                .map((b) => (
                  <option key={b.id} value={b.batchCode}>
                    {b.batchCode} - {b.cropName} ({b.currentStockKg} kg available in {b.chamberName})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Quantity to Withdraw (kg)</label>
              <input
                type="number"
                value={withdrawKg}
                onChange={(e) => {
                  const kg = Number(e.target.value);
                  setWithdrawKg(kg);
                  setWithdrawCrates(Math.ceil(kg / 25));
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Crates to Deduct</label>
              <input
                type="number"
                value={withdrawCrates}
                onChange={(e) => setWithdrawCrates(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Withdrawal Reason / Recipient</label>
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
            className="w-full h-12 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#b07d2c] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MinusCircle size={16} />
            <span>Confirm Withdrawal &amp; Release Gate Out Pass</span>
          </button>
        </form>
      </div>
    </div>
  );
};
