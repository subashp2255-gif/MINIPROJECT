import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const { bookings, t, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const cleanCode = bookingCode ? (bookingCode.startsWith('#') ? bookingCode : `#${bookingCode}`) : '#SRS-TN-8492';
  const booking = bookings.find((b) => b.bookingCode === cleanCode) || bookings[0];

  useEffect(() => {
    // Confetti burst on load
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e5e3a', '#006c49', '#86f8c2', '#ffdcc6'],
      });
    } catch {
      // fallback
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    showToast(`Copied ${booking.bookingCode} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Smart Rural Storage Gate Pass\nBooking ID: ${booking.bookingCode}\nBatch PIN: ${booking.batchPin}\nProduce: ${booking.cropName} (${booking.bookedKg} kg)\nFacility: ${booking.facilityName}\nChamber: ${booking.chamberName}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Top Quick Notification Banner with Pulse Indicator */}
        <div className="w-full bg-[#86f8c2]/80 text-[#002113] rounded-xl p-3 flex items-center justify-between shadow-xs border border-[#69dba8]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#006c49]"></span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs truncate font-bold text-[#002113]">{t('chamberBayReserved')}</span>
              <span className="text-[11px] text-[#005236] truncate">{t('chamberReservedSub')}</span>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#006c49] font-bold flex-shrink-0 shadow-2xs">
            Auto-Synced
          </span>
        </div>

        {/* Booking Header / Status Hub Card */}
        <section className="w-full bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden border border-[#dfe4dc]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-[#404941] uppercase tracking-wider font-semibold">
                {t('bookingIdLabel')}
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl text-[#1e5e3a] font-extrabold tracking-tight">
                  {booking.bookingCode}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-full hover:bg-[#e9f0e8] transition-colors text-[#707971] active:scale-95"
                  title="Copy ID"
                  aria-label="Copy booking reference number"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#86f8c2] text-[#00734e] text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>{t('bookingConfirmed')}</span>
              </span>
              <span className="text-[11px] text-[#006c49] mt-1 font-semibold">
                {t('allChecksValidated')}
              </span>
            </div>
          </div>
        </section>

        {/* Digital QR Gate Pass Card */}
        <section className="w-full bg-white rounded-2xl overflow-hidden shadow-sm relative border border-[#dfe4dc]">
          {/* Top Decorative Harvest Strip */}
          <div className="h-2.5 w-full bg-gradient-to-r from-[#1e5e3a] via-[#006c49] to-[#94d5a7]"></div>

          <div className="p-4 sm:p-5 flex flex-col space-y-4">
            {/* Title & Bilingual Subtitle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-[#aff2c2] flex items-center justify-center text-[#1e5e3a]">
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#161d18]">{t('digitalGatePass')}</h2>
                  <p className="text-[11px] text-[#404941]">{t('validForGateIntake')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#404941] uppercase tracking-wider block font-semibold">
                  {t('batchPinLabel')}
                </span>
                <span className="text-lg font-extrabold tracking-widest text-[#844000] bg-[#ffdcc6] px-2.5 py-0.5 rounded-lg inline-block">
                  {booking.batchPin}
                </span>
              </div>
            </div>

            {/* QR Display & Camera Scanner Area */}
            <div className="bg-[#eef6ed] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#dde4dd]">
              <div className="relative bg-white p-3 rounded-xl shadow-xs flex flex-col items-center">
                {/* High Contrast SVG QR Code */}
                <svg className="w-44 h-44 text-[#161d18]" fill="currentColor" viewBox="0 0 160 160">
                  <rect fill="currentColor" height="36" rx="4" width="36" x="10" y="10" />
                  <rect fill="white" height="24" rx="2" width="24" x="16" y="16" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="22" y="22" />
                  <rect fill="currentColor" height="36" rx="4" width="36" x="114" y="10" />
                  <rect fill="white" height="24" rx="2" width="24" x="120" y="16" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="126" y="22" />
                  <rect fill="currentColor" height="36" rx="4" width="36" x="10" y="114" />
                  <rect fill="white" height="24" rx="2" width="24" x="16" y="120" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="22" y="126" />
                  <rect height="8" rx="1.5" width="8" x="52" y="14" />
                  <rect height="8" rx="1.5" width="8" x="64" y="14" />
                  <rect height="8" rx="1.5" width="12" x="80" y="14" />
                  <rect height="8" rx="1.5" width="8" x="96" y="14" />
                  <rect height="8" rx="1.5" width="12" x="52" y="26" />
                  <rect height="12" rx="1.5" width="8" x="74" y="26" />
                  <rect height="8" rx="1.5" width="16" x="88" y="26" />
                  <rect height="16" rx="1.5" width="8" x="52" y="42" />
                  <rect height="8" rx="1.5" width="16" x="68" y="42" />
                  <rect height="8" rx="1.5" width="8" x="92" y="42" />
                  <rect height="8" rx="1.5" width="12" x="14" y="52" />
                  <rect height="8" rx="1.5" width="14" x="32" y="52" />
                  <rect height="8" rx="1.5" width="10" x="114" y="52" />
                  <rect height="8" rx="1.5" width="16" x="130" y="52" />
                  <rect height="14" rx="1.5" width="8" x="14" y="66" />
                  <rect height="8" rx="1.5" width="18" x="28" y="66" />
                  <rect height="8" rx="1.5" width="20" x="114" y="66" />
                  <rect height="14" rx="1.5" width="8" x="140" y="66" />
                  <circle cx="80" cy="80" fill="white" r="16" />
                  <circle cx="80" cy="80" fill="#1e5e3a" r="13" />
                  <path d="M76 83C76 77 84 73 84 73C84 73 84 81 80 84C78 85.5 76 84.5 76 83Z" fill="white" />
                  <path d="M84 83C84 78 78 75 78 75C78 75 78 82 82 84C83.5 85 84 84 84 83Z" fill="#86F8C2" />
                </svg>
                <div className="mt-2 text-center">
                  <span className="text-[11px] text-[#404941] font-medium">{t('scanAtGateStation')}</span>
                </div>
              </div>
            </div>

            {/* Itemized Produce & Location Details Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#eef6ed] rounded-xl p-3 flex flex-col justify-between border border-[#dde4dd]">
                <div className="flex items-center space-x-1.5 text-[#404941]">
                  <span className="material-symbols-outlined text-[18px] text-[#612d00]">nutrition</span>
                  <span className="text-[11px] uppercase tracking-wide font-semibold">{t('produceLot')}</span>
                </div>
                <div className="mt-1.5">
                  <span className="text-xs font-bold text-[#161d18] block truncate">{booking.cropName}</span>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[#1e5e3a] text-[11px] font-bold shadow-2xs">
                    {booking.bookedCrates} Crates / {booking.bookedKg} kg
                  </div>
                </div>
              </div>

              <div className="bg-[#eef6ed] rounded-xl p-3 flex flex-col justify-between border border-[#dde4dd]">
                <div className="flex items-center space-x-1.5 text-[#404941]">
                  <span className="material-symbols-outlined text-[18px] text-[#1e5e3a]">warehouse</span>
                  <span className="text-[11px] uppercase tracking-wide font-semibold">Chamber Bay</span>
                </div>
                <div className="mt-1.5">
                  <span className="text-xs font-bold text-[#161d18] block truncate">{booking.facilityName}</span>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[#006c49] text-[11px] font-bold shadow-2xs">
                    {booking.chamberName} (2.8°C)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gate Pass Lifecycle Timeline Tracker */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc]">
          <h3 className="text-sm font-bold text-[#161d18] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#1e5e3a]">timeline</span>
            <span>Gate Pass Lifecycle Timeline</span>
          </h3>

          <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#86f8c2]">
            {/* Step 1: Reserved */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#1e5e3a] text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
              <div className="text-xs font-bold text-[#161d18]">Chamber Bay Reserved (Confirmed)</div>
              <p className="text-[11px] text-[#404941]">Slot locked in IoT ledger. Advance terms verified.</p>
            </div>

            {/* Step 2: In Transit */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#006c49] text-white flex items-center justify-center text-[10px] animate-pulse">
                •
              </div>
              <div className="text-xs font-bold text-[#006c49]">En Route to Hub</div>
              <p className="text-[11px] text-[#404941]">Farmer preparing crates for morning gate intake.</p>
            </div>

            {/* Step 3: Weighing Bridge */}
            <div className="relative opacity-60">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#e9f0e8] border border-[#c0c9bf] flex items-center justify-center text-[10px]">
                3
              </div>
              <div className="text-xs font-semibold text-[#161d18]">Gate Weighing &amp; Quality Check</div>
              <p className="text-[11px] text-[#404941]">Supervisor logs actual gross weight on platform scale.</p>
            </div>

            {/* Step 4: Chamber Slotted */}
            <div className="relative opacity-60">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#e9f0e8] border border-[#c0c9bf] flex items-center justify-center text-[10px]">
                4
              </div>
              <div className="text-xs font-semibold text-[#161d18]">Cold Chamber Slotted</div>
              <p className="text-[11px] text-[#404941]">Continuous temperature and humidity tracking live.</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPdf}
              className="h-12 rounded-xl bg-[#1e5e3a] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#16462b] active:scale-98 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>{t('downloadPdf')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-12 rounded-xl bg-[#006c49] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-98 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>{t('shareWhatsApp')}</span>
            </button>
          </div>

          <Link
            to={`/feedback-revisit/${booking.bookingCode.replace('#', '')}`}
            className="w-full h-12 rounded-xl bg-white text-[#1e5e3a] border border-[#1e5e3a] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#eef6ed] active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>Review Storage Experience or Book Again</span>
          </Link>
        </section>
      </div>
    </div>
  );
};
