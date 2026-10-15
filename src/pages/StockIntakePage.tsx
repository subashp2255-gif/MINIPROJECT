import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, ArrowLeft } from 'lucide-react';

export const StockIntakePage: React.FC = () => {
  const { facilities, batches, recordIntake, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const facility = facilities[0];

  const [selectedBatchCode, setSelectedBatchCode] = useState<string>('');
  const [cropName, setCropName] = useState<string>('Red Tomatoes');
  const [chamberName, setChamberName] = useState<string>(facility.chambers[0]?.name || 'Chamber 1');
  const [quantityKg, setQuantityKg] = useState<number>(300);
  const [crates, setCrates] = useState<number>(12);
  const [source, setSource] = useState<string>('Farm Gate Truck Arrival');
  const [optionalBookingCode, setOptionalBookingCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check destination chamber physical capacity
  const targetChamber = facility.chambers.find((c) => c.name === chamberName) || facility.chambers[0];
  const chamberBatches = batches.filter((b) => b.chamberName === chamberName && b.status === 'in_storage');
  const currentChamberOccupancyKg = chamberBatches.reduce((acc, b) => acc + b.currentStockKg, 0);
  const availableChamberCapacityKg = Math.max(0, targetChamber.totalCapacityKg - currentChamberOccupancyKg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantityKg <= 0) {
      setErrorMsg('Intake quantity must be greater than zero.');
      return;
    }

    if (quantityKg > availableChamberCapacityKg) {
      setErrorMsg(
        `Destination chamber ${chamberName} only has ${availableChamberCapacityKg} kg physical space available. Requested ${quantityKg} kg.`
      );
      return;
    }

    recordIntake({
      batchCode: selectedBatchCode || undefined,
      facilityId: facility.id,
      chamberName,
      cropName,
      quantityKg,
      quantityCrates: crates,
      source,
      bookingCode: optionalBookingCode.trim() || undefined,
    });

    navigate('/owner/inventory');
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
              {isTa ? 'உடல் சரக்கு வரவு பதிவு' : 'Record Physical Stock Intake'}
            </h1>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'வாயில் எடை தராசில் சரிபார்க்கப்பட்ட சரக்கை மட்டும் பதிவேற்றவும்' : 'Only physically verified produce increases recorded stock balance'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Live Chamber Available Capacity Indicator */}
        <div className="p-3.5 rounded-2xl bg-[#F4FBF3] border border-[#AFF2C2] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#5B6660] block font-medium">Destination Space: {chamberName}</span>
            <span className="text-base font-bold text-[#14532D]">
              {availableChamberCapacityKg} kg Available
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#14532D] border border-[#AFF2C2]">
            Capacity Validated
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Existing Batch (Optional)</label>
            <select
              value={selectedBatchCode}
              onChange={(e) => {
                setSelectedBatchCode(e.target.value);
                const b = batches.find((item) => item.batchCode === e.target.value);
                if (b) {
                  setCropName(b.cropName);
                  setChamberName(b.chamberName);
                }
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            >
              <option value="">-- Create As New Batch / Walk-in --</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchCode}>
                  {b.batchCode} - {b.cropName} ({b.currentStockKg} kg current in {b.chamberName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Produce / Crop Name</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Destination Chamber</label>
              <select
                value={chamberName}
                onChange={(e) => setChamberName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
              >
                {facility.chambers.map((c) => (
                  <option key={c.id} value={c.name} disabled={c.isMaintenance}>
                    {c.name} {c.isMaintenance ? '(Under Maintenance)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Physically Received Weight (kg)</label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => {
                  const kg = Number(e.target.value);
                  setQuantityKg(kg);
                  setCrates(Math.ceil(kg / 25));
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">Crates Count</label>
              <input
                type="number"
                value={crates}
                onChange={(e) => setCrates(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">Inbound Source / Farmer</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] space-y-1">
            <label className="block text-xs font-bold text-[#14532D]">
              Optional Associated Booking Code (Leave blank if walk-in)
            </label>
            <input
              type="text"
              value={optionalBookingCode}
              onChange={(e) => setOptionalBookingCode(e.target.value)}
              placeholder="#SRS-TN-XXXX (Optional)"
              className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-mono bg-white"
            />
            <p className="text-[10px] text-[#5B6660]">
              * Associating an optional booking validates facility alignment, but stock increases ONLY by verified gross weight.
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scale size={16} />
            <span>Confirm Physical Intake &amp; Update Stock Ledger</span>
          </button>
        </form>
      </div>
    </div>
  );
};
