import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, ArrowLeft } from 'lucide-react';

export const StockNewBatchPage: React.FC = () => {
  const { facilities, registerBatch, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const facility = facilities[0];

  const [cropName, setCropName] = useState('Kufri Jyoti Potato');
  const [chamberName, setChamberName] = useState(facility.chambers[0]?.name || 'Chamber 1 (Chilled)');
  const [initialStockKg, setInitialStockKg] = useState<number>(250);
  const [crates, setCrates] = useState<number>(10);
  const [farmerName, setFarmerName] = useState('Walk-in Farmer');
  const [supplierName, setSupplierName] = useState('Local APMC Trader');
  const [condition, setCondition] = useState('good');
  const [expiryDays, setExpiryDays] = useState<number>(20);
  const [notes, setNotes] = useState('Direct field intake without prior booking.');
  const [optionalBookingCode, setOptionalBookingCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (initialStockKg <= 0) {
      setErrorMsg('Initial physical stock must be greater than zero.');
      return;
    }

    try {
      const expiryDate = new Date(Date.now() + expiryDays * 86400000).toISOString().split('T')[0];

      registerBatch({
        facilityId: facility.id,
        chamberName,
        cropName,
        initialStockKg,
        initialStockCrates: crates,
        farmerName,
        supplierName,
        condition,
        expiryDate,
        notes,
        bookingId: optionalBookingCode.trim() || undefined,
      });

      navigate('/owner/inventory');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register batch.');
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
              {isTa ? 'புதிய பயிர் தொகுதி பதிவு' : 'Register New Crop Batch'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'முன்பதிவு இன்றியே நேரடி வரவு (Walk-in stock)' : 'Independent batch registration with optional booking reference'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Crop / Produce Name</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Storage Chamber</label>
              <select
                value={chamberName}
                onChange={(e) => setChamberName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              >
                {facility.chambers.map((c) => (
                  <option key={c.id} value={c.name} disabled={c.isMaintenance}>
                    {c.name} {c.isMaintenance ? '(Blocked for Maintenance)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Initial Weight (kg)</label>
              <input
                type="number"
                value={initialStockKg}
                onChange={(e) => {
                  const kg = Number(e.target.value);
                  setInitialStockKg(kg);
                  setCrates(Math.ceil(kg / 25));
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Physical Crates</label>
              <input
                type="number"
                value={crates}
                onChange={(e) => setCrates(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Farmer / Producer Name</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Supplier / Source</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              >
                <option value="good">Grade A (Good / Fresh)</option>
                <option value="fair">Standard (Fair)</option>
                <option value="damaged">Damaged / Flagged</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Expected Shelf Life (Days)</label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              />
            </div>
          </div>

          {/* Optional Booking Reference */}
          <div className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] space-y-1">
            <label className="block text-xs font-bold text-[#14532D]">
              Optional Booking Reference ID (Leave blank if walk-in)
            </label>
            <input
              type="text"
              value={optionalBookingCode}
              onChange={(e) => setOptionalBookingCode(e.target.value)}
              placeholder="#SRS-TN-XXXX (Optional)"
              className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-mono bg-white"
            />
            <p className="text-[10px] text-[#5B6660]">
              * Non-negotiable rule: Booking ID is never required. Creating a batch increases physical stock regardless of booking presence.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Notes / Scale Inspector Remark</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Register Batch & Record Initial Intake</span>
          </button>
        </form>
      </div>
    </div>
  );
};
