import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { InventoryBatch } from '../types';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Truck,
  Scale,
  X,
  Calendar,
  Layers
} from 'lucide-react';

export const FarmerInventoryPage: React.FC = () => {
  const { batches, language, showToast, performPartialWithdrawal } = useApp();
  const navigate = useNavigate();

  const isTa = language === 'ta';

  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawKg, setWithdrawKg] = useState(100);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [verifiedWeight] = useState(420);

  // Total summary: 1 hero metric + 2 supporting values
  const totalKg = batches.reduce((sum, b) => sum + b.currentStockKg, 0);
  const totalCrates = batches.reduce((sum, b) => sum + b.currentStockCrates, 0);
  const totalLots = batches.length;

  const handleRequestPickup = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setShowWithdrawModal(true);
  };

  const handleConfirmWeight = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setShowWeightModal(true);
  };

  const submitPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    const crates = Math.ceil(withdrawKg / 25);
    const success = performPartialWithdrawal(
      selectedBatch.batchCode,
      withdrawKg,
      crates,
      'Farmer request for Mandi dispatch'
    );
    if (success) {
      setShowWithdrawModal(false);
      showToast(isTa ? 'மீட்பு கோரிக்கை பதிவு செய்யப்பட்டது!' : 'Pickup request confirmed!', 'success');
    }
  };

  const submitWeightVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWeightModal(false);
    showToast(isTa ? `எடை ${verifiedWeight} கிலோ சரிபார்க்கப்பட்டு பதிவு செய்யப்பட்டது!` : `Weight verified: ${verifiedWeight} kg synced with digital scale!`, 'success');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Inventory container: 16px margins */}
      <div className="px-4 pt-3 space-y-5">

        {/* 1. HERO SUMMARY: 1 Hero Metric + 2 Supporting Values (Declutter rule) */}
        <section className="card-heritage p-5 space-y-3" aria-label="Inventory Hero Summary">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6660]">
            {isTa ? 'மொத்த சேமிப்பு இருப்பு' : 'Total stored inventory'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-hero text-[40px] font-bold text-[#0F3D2E] leading-none">
              {totalKg}
            </span>
            <span className="text-base font-bold text-[#5B6660]">kg</span>
          </div>

          <div className="pt-2 border-t border-[#F7F4EC] grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#C8923A]" />
              <div>
                <span className="text-[#5B6660] block">{isTa ? 'கூடைகள்' : 'Total Crates'}</span>
                <span className="font-bold text-[#1C2420]">{totalCrates} {isTa ? 'கூடைகள்' : 'crates'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#14532D]" />
              <div>
                <span className="text-[#5B6660] block">{isTa ? 'தொகுதிகள்' : 'Active Batches'}</span>
                <span className="font-bold text-[#1C2420]">{totalLots} {isTa ? 'தொகுதிகள்' : 'lots'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Attention notice banner if any batch has capacity conflict or pending intake */}
        <div
          onClick={() => navigate('/capacity-conflict')}
          className="p-3.5 rounded-2xl bg-[#B5472B]/10 border border-[#B5472B]/30 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B5472B]/15 text-[#B5472B] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#B5472B] uppercase tracking-wide">
                {isTa ? 'நடவடிக்கை தேவை • அறை கொள்ளளவு குறைவு' : 'Action needed • Capacity discrepancy'}
              </h4>
              <p className="text-xs text-[#1C2420] font-medium">
                {isTa ? 'தொகுதி #TN-PLN-014 தீர்வை தேர்வு செய்க' : 'Review resolution for Batch #TN-PLN-014'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#B5472B]" />
        </div>

        {/* 2. INVENTORY LIST ROWS */}
        <section className="space-y-3" aria-label="Produce Lots">
          <h2 className="text-base font-bold text-[#1C2420]">
            {isTa ? 'சேமிப்பு விளைபொருள் விவரம்' : 'Stored produce lots'}
          </h2>

          <div className="space-y-3">
            {batches.map((batch) => {
              const daysLeft = Math.max(0, batch.dayTotal - batch.dayCurrent);
              const isUrgent = daysLeft <= 3;

              return (
                <div
                  key={batch.id}
                  className="card-heritage p-4 space-y-3"
                >
                  {/* Tap row for detail drawer */}
                  <div
                    onClick={() => setSelectedBatch(batch)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Crop thumbnail: 16px rounded real photo */}
                      <img
                        src={
                          batch.cropImageUrl ||
                          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={batch.cropName}
                        className="w-14 h-14 rounded-2xl object-cover shadow-xs flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-[#1C2420]">
                            {isTa ? batch.cropNameTa : batch.cropName}
                          </h3>
                          <span className="text-xs text-[#5B6660]">({batch.batchCode})</span>
                        </div>
                        {/* Quantity in bold */}
                        <p className="text-sm font-bold text-[#0F3D2E] mt-0.5">
                          {batch.currentStockKg} kg <span className="font-normal text-[#5B6660]">• {batch.currentStockCrates} {isTa ? 'கூடைகள்' : 'crates'}</span>
                        </p>
                        {/* Days left */}
                        <div className="flex items-center gap-1 text-xs text-[#5B6660] mt-0.5">
                          <Calendar size={13} />
                          <span>
                            {daysLeft} {isTa ? 'நாட்கள் மீதம்' : 'days left'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status icon + label */}
                    <div className="flex flex-col items-end gap-1">
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B5472B]/10 text-[#B5472B] text-xs font-semibold">
                          <AlertTriangle size={13} strokeWidth={2} />
                          <span>{isTa ? 'விரைவில்' : 'Expiring'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-semibold">
                          <CheckCircle2 size={13} strokeWidth={2} />
                          <span>{isTa ? 'பாதுகாப்பானது' : 'Safe'}</span>
                        </span>
                      )}
                      <ChevronRight size={16} className="text-[#5B6660]" />
                    </div>
                  </div>

                  {/* Action buttons row: "Request pickup", "Confirm weight" */}
                  <div className="pt-2 border-t border-[#F7F4EC] grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRequestPickup(batch)}
                      className="btn-secondary h-11 text-sm flex items-center justify-center gap-1.5"
                    >
                      <Truck size={16} />
                      <span>{isTa ? 'மீட்பு கோரிக்கை' : 'Request pickup'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmWeight(batch)}
                      className="btn-primary h-11 text-sm flex items-center justify-center gap-1.5"
                    >
                      <Scale size={16} />
                      <span>{isTa ? 'எடை உறுதிசெய்' : 'Confirm weight'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* FLOATING "+" BUTTON FOR ACTIONS */}
      <button
        type="button"
        onClick={() => navigate('/discovery')}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#14532D] text-white shadow-[0_8px_24px_rgba(20,83,45,0.4)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Add Produce Slot"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Detail Bottom Sheet Drawer */}
      {selectedBatch && !showWithdrawModal && !showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C2420]">
                  {isTa ? selectedBatch.cropNameTa : selectedBatch.cropName}
                </h3>
                <span className="text-xs text-[#5B6660]">{selectedBatch.batchCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F4EC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'கிடங்கு மையம்' : 'Cold Hub'}:</span>
                <span className="font-semibold text-[#1C2420]">{selectedBatch.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'அறை எண்' : 'Chamber'}:</span>
                <span className="font-semibold text-[#1C2420]">{selectedBatch.chamberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'வெப்பநிலை' : 'Live Temp'}:</span>
                <span className="font-semibold text-[#14532D]">{selectedBatch.currentTemp}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'ஈரப்பதம்' : 'Humidity'}:</span>
                <span className="font-semibold text-[#1C2420]">{selectedBatch.currentHumidity}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const code = selectedBatch.batchCode.replace('#', '');
                setSelectedBatch(null);
                navigate(`/booking/${code}/confirmation`);
              }}
              className="btn-primary w-full"
            >
              {isTa ? 'நுழைவுச் சீட்டு காண்க' : 'View digital pass'}
            </button>
          </div>
        </div>
      )}

      {/* Pickup Modal */}
      {showWithdrawModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <form onSubmit={submitPickup} className="w-full max-w-[390px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C2420]">
                  {isTa ? 'மீட்பு கோரிக்கை' : 'Request produce pickup'}
                </h3>
                <span className="text-xs text-[#5B6660]">{selectedBatch.cropName} • {selectedBatch.batchCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5B6660] block mb-1">
                {isTa ? 'எடுத்துச்செல்லும் எடை (கிலோ)' : 'Withdrawal weight (kg)'}
              </label>
              <input
                type="number"
                min="25"
                max={selectedBatch.currentStockKg}
                step="25"
                value={withdrawKg}
                onChange={(e) => setWithdrawKg(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-[#0F3D2E]/20 text-lg font-bold text-[#1C2420] focus:outline-none"
              />
              <span className="text-[11px] text-[#5B6660] mt-1 block">
                {isTa ? `மீதம் உள்ள இருப்பு: ${selectedBatch.currentStockKg} கிலோ` : `Max available: ${selectedBatch.currentStockKg} kg`}
              </span>
            </div>

            <button type="submit" className="btn-primary w-full">
              {isTa ? 'கோரிக்கையை உறுதிசெய்' : 'Request pickup'}
            </button>
          </form>
        </div>
      )}

      {/* Weight Verification Modal */}
      {showWeightModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <form onSubmit={submitWeightVerification} className="w-full max-w-[390px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C2420]">
                  {isTa ? 'எடை சரிபார்ப்பு' : 'Confirm digital weight'}
                </h3>
                <span className="text-xs text-[#5B6660]">{selectedBatch.cropName} • {selectedBatch.batchCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#E7F5EE] text-center space-y-1">
              <span className="text-xs text-[#5B6660] font-medium">
                {isTa ? 'வாயில் எடை மேடை அளவீடு' : 'Gate weighing bridge reading'}
              </span>
              <div className="font-serif-hero text-3xl font-bold text-[#14532D]">
                {verifiedWeight} kg
              </div>
              <span className="text-[11px] text-[#14532D] font-semibold">
                {isTa ? 'டிஜிட்டல் முத்திரையிடப்பட்டது' : 'Digital scale verified'}
              </span>
            </div>

            <button type="submit" className="btn-primary w-full">
              {isTa ? 'எடையை உறுதிசெய்' : 'Confirm weight'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
