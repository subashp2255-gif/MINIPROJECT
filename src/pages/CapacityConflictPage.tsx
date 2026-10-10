import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ConflictNotice } from '../types';

export const CapacityConflictPage: React.FC = () => {
  const { conflictNotice, resolveConflict, t } = useApp();
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState<ConflictNotice['selectedOption']>('accept_partial');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    setSubmitting(true);
    setTimeout(() => {
      resolveConflict(selectedOption);
      setSubmitting(false);
      navigate('/farmer/home');
    }, 600);
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Status & Incident Strip */}
        <div className="flex items-center justify-between text-[#404941] text-xs pt-1">
          <span className="flex items-center gap-1 font-semibold text-[#844000]">
            <span className="w-2 h-2 rounded-full bg-[#844000] animate-ping"></span>
            <span>Booking {conflictNotice.bookingCode}</span>
          </span>
          <span className="text-[#404941] font-medium">Gate In: {conflictNotice.gateInTime}</span>
        </div>

        {/* Warning / Capacity Conflict Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#ffdcc6] text-[#311300] p-4 shadow-sm border border-[#ffb786]">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#844000]/10 pointer-events-none"></div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#844000] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-[#311300] tracking-tight">
                  {t('conflictTitle')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#844000] text-white text-[10px] font-bold tracking-wide uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-[#723600] font-medium mt-0.5">
                {t('conflictSubtitle')}
              </p>

              <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-white/80 text-[#161d18]">
                <span className="material-symbols-outlined text-[#844000] text-[18px] flex-shrink-0">
                  domain
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-[#161d18]">
                    {conflictNotice.facilityName} - {conflictNotice.chamberName}
                  </p>
                  <p className="text-[11px] text-[#404941] truncate">
                    Madurai-Oddanchatram Rural Bypass • Maintenance Inspection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Discrepancy Breakdown Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#eef6ed] flex items-center justify-center text-[#1e5e3a]">
                <span className="material-symbols-outlined text-[18px]">scale</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#161d18]">{t('spaceVariance')}</h2>
                <p className="text-[11px] text-[#404941]">Comparison of booked vs physical slot capacity</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
              -{conflictNotice.spaceCutPercentage}% Space Cut
            </span>
          </div>

          {/* Meter Visual Bar */}
          <div className="space-y-1.5 my-1">
            <div className="h-3 w-full bg-[#e9f0e8] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#006c49] transition-all"
                style={{ width: `${100 - conflictNotice.spaceCutPercentage}%` }}
                title={`Physically Available: ${conflictNotice.availableKg}kg`}
              ></div>
              <div
                className="h-full bg-[#ba1a1a]/80 transition-all pattern-diagonal"
                style={{ width: `${conflictNotice.spaceCutPercentage}%` }}
                title={`Deficit: ${conflictNotice.deficitKg}kg`}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#006c49] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
                <span>{conflictNotice.availableKg} kg Available</span>
              </span>
              <span className="text-[#ba1a1a] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                <span>{conflictNotice.deficitKg} kg Deficit</span>
              </span>
            </div>
          </div>

          {/* 3 Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 bg-[#eef6ed] rounded-xl p-2.5">
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] text-[#404941]">{t('bookedMetric')}</span>
              <span className="text-base font-bold text-[#161d18] mt-0.5">
                {conflictNotice.bookedKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#404941]">20 Crates Tomato</span>
            </div>
            <div className="flex flex-col items-center text-center bg-white rounded-lg py-1 shadow-2xs">
              <span className="text-[11px] text-[#006c49] font-semibold">{t('availableMetric')}</span>
              <span className="text-base font-bold text-[#006c49] mt-0.5">
                {conflictNotice.availableKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#006c49] font-semibold">12 Crates Max</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] text-[#ba1a1a] font-semibold">{t('deficitMetric')}</span>
              <span className="text-base font-bold text-[#ba1a1a] mt-0.5">
                {conflictNotice.deficitKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#ba1a1a] font-medium">8 Crates Short</span>
            </div>
          </div>

          {/* Facility Manager Voice / Log Note */}
          <div className="mt-3 p-3 rounded-xl bg-[#e9f0e8] text-[#161d18] flex items-start gap-3">
            <img
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              alt="Arumugam Facility Manager"
              src={conflictNotice.managerImage}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#161d18]">{conflictNotice.managerName}</span>
                <span className="text-[10px] text-[#404941]">25m ago</span>
              </div>
              <p className="text-xs text-[#404941] mt-1 leading-snug">
                "{conflictNotice.managerNote}"
              </p>
            </div>
          </div>
        </div>

        {/* Resolution Options Form */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#161d18] tracking-tight">
                {t('selectResolution')}
              </h2>
              <p className="text-xs text-[#404941]">
                Choose how you would like to proceed with your booking today
              </p>
            </div>
            <span className="text-xs text-[#1e5e3a] font-bold bg-[#aff2c2]/50 px-2.5 py-0.5 rounded-full">
              4 Choices
            </span>
          </div>

          <form onSubmit={handleResolutionSubmit} className="space-y-3">
            {/* Option A (Recommended) */}
            <label
              className={`block relative cursor-pointer rounded-xl p-3.5 transition-all border-2 ${
                selectedOption === 'accept_partial'
                  ? 'bg-[#eef6ed] border-[#1e5e3a] shadow-xs'
                  : 'bg-white border-[#dde4dd] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="resolution_choice"
                value="accept_partial"
                checked={selectedOption === 'accept_partial'}
                onChange={() => setSelectedOption('accept_partial')}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'accept_partial'
                        ? 'border-[#1e5e3a] bg-[#1e5e3a] text-white'
                        : 'border-[#707971]'
                    }`}
                  >
                    {selectedOption === 'accept_partial' && <span className="text-[10px]">✓</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#161d18]">
                        {t('optPartial')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#86f8c2] text-[#00734e] text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-[#404941] mt-0.5">{t('optPartialDesc')}</p>
                  </div>
                </div>
              </div>
            </label>

            {/* Option B: Reroute */}
            <label
              className={`block relative cursor-pointer rounded-xl p-3.5 transition-all border-2 ${
                selectedOption === 'reroute'
                  ? 'bg-[#eef6ed] border-[#1e5e3a] shadow-xs'
                  : 'bg-white border-[#dde4dd] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="resolution_choice"
                value="reroute"
                checked={selectedOption === 'reroute'}
                onChange={() => setSelectedOption('reroute')}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'reroute'
                        ? 'border-[#1e5e3a] bg-[#1e5e3a] text-white'
                        : 'border-[#707971]'
                    }`}
                  >
                    {selectedOption === 'reroute' && <span className="text-[10px]">✓</span>}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#161d18]">
                      {t('optReroute')}
                    </span>
                    <p className="text-xs text-[#404941] mt-0.5">{t('optRerouteDesc')}</p>
                  </div>
                </div>
              </div>
            </label>

            {/* Option C: Reschedule */}
            <label
              className={`block relative cursor-pointer rounded-xl p-3.5 transition-all border-2 ${
                selectedOption === 'reschedule'
                  ? 'bg-[#eef6ed] border-[#1e5e3a] shadow-xs'
                  : 'bg-white border-[#dde4dd] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="resolution_choice"
                value="reschedule"
                checked={selectedOption === 'reschedule'}
                onChange={() => setSelectedOption('reschedule')}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'reschedule'
                        ? 'border-[#1e5e3a] bg-[#1e5e3a] text-white'
                        : 'border-[#707971]'
                    }`}
                  >
                    {selectedOption === 'reschedule' && <span className="text-[10px]">✓</span>}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#161d18]">
                      {t('optReschedule')}
                    </span>
                    <p className="text-xs text-[#404941] mt-0.5">{t('optRescheduleDesc')}</p>
                  </div>
                </div>
              </div>
            </label>

            {/* Option D: Cancel & Full Refund */}
            <label
              className={`block relative cursor-pointer rounded-xl p-3.5 transition-all border-2 ${
                selectedOption === 'cancel_refund'
                  ? 'bg-[#ffdad6]/40 border-[#ba1a1a] shadow-xs'
                  : 'bg-white border-[#dde4dd] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="resolution_choice"
                value="cancel_refund"
                checked={selectedOption === 'cancel_refund'}
                onChange={() => setSelectedOption('cancel_refund')}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === 'cancel_refund'
                        ? 'border-[#ba1a1a] bg-[#ba1a1a] text-white'
                        : 'border-[#707971]'
                    }`}
                  >
                    {selectedOption === 'cancel_refund' && <span className="text-[10px]">✓</span>}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#93000a]">
                      {t('optCancel')}
                    </span>
                    <p className="text-xs text-[#404941] mt-0.5">{t('optCancelDesc')}</p>
                  </div>
                </div>
              </div>
            </label>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-[#1e5e3a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#16462b] active:scale-98 transition-all shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>
                  {submitting ? 'Applying Resolution...' : t('confirmResolutionConsent')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
