import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Clock,
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const { bookings, language, showToast } = useApp();
  const navigate = useNavigate();

  const isTa = language === 'ta';

  const cleanCode = bookingCode
    ? bookingCode.startsWith('#')
      ? bookingCode
      : `#${bookingCode}`
    : '#SRS-TN-7721';

  const booking = bookings.find((b) => b.bookingCode === cleanCode) || bookings[0] || {
    bookingCode: '#SRS-TN-7721',
    batchPin: '4091',
    facilityName: 'Uzhavar Solar Hub #14',
    chamberName: 'Solar Chamber 1',
    cropName: 'Hybrid Tomato',
    cropNameTa: 'வீரிய தக்காளி',
    bookedKg: 420,
    bookedCrates: 17,
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    durationDays: 10,
    totalEstimatedCost: 493,
    totalAmount: 493,
  };

  const [showTimeline, setShowTimeline] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleDownload = () => {
    window.print();
    showToast(isTa ? 'அனுமதிச் சீட்டு பதிவிறக்கம் செய்யப்படுகிறது!' : 'Downloading official gate pass PDF...', 'success');
  };

  const handleCancelBooking = () => {
    if (window.confirm(isTa ? 'நிச்சயமாக முன்பதிவை ரத்து செய்ய வேண்டுமா?' : 'Are you sure you want to cancel this booking?')) {
      showToast(isTa ? 'முன்பதிவு ரத்து செய்யப்பட்டது. முழுப் பணம் ரீபண்ட் செய்யப்படும்.' : 'Booking cancelled. Full refund initiated.', 'info');
      navigate('/farmer/home');
    }
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Booking confirmation container */}
      <div className="px-4 pt-3 space-y-5">

        {/* 1. TICKET-STYLE CARD WITH NOTCHED EDGES */}
        <section
          className="relative bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,61,46,0.08)] overflow-hidden"
          aria-label="Digital Gate Pass Ticket"
        >
          {/* Top Ticket Section: Large QR & Booking Code */}
          <div className="p-6 flex flex-col items-center text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-bold">
              <CheckCircle2 size={14} strokeWidth={2} />
              <span>{isTa ? 'முன்பதிவு உறுதி செய்யப்பட்டது' : 'Booking Confirmed'}</span>
            </span>

            {/* Large QR Code Display */}
            <div className="w-48 h-48 p-3 rounded-2xl bg-[#F7F4EC] border-2 border-[#0F3D2E]/10 flex flex-col items-center justify-center relative shadow-inner">
              {/* Clean high contrast SVG QR representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#0F3D2E] fill-current">
                {/* 3 Position Detection Patterns */}
                <rect x="5" y="5" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="11" width="12" height="12" rx="1.5" />
                <rect x="71" y="5" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="77" y="11" width="12" height="12" rx="1.5" />
                <rect x="5" y="71" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="77" width="12" height="12" rx="1.5" />
                {/* QR Data Grid Matrix */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="48" y="12" width="6" height="6" />
                <rect x="58" y="6" width="6" height="6" />
                <rect x="38" y="24" width="6" height="6" />
                <rect x="50" y="26" width="6" height="6" />
                <rect x="8" y="38" width="6" height="6" />
                <rect x="22" y="44" width="6" height="6" />
                <rect x="36" y="38" width="6" height="6" />
                <rect x="46" y="46" width="6" height="6" />
                <rect x="62" y="38" width="6" height="6" />
                <rect x="76" y="44" width="6" height="6" />
                <rect x="86" y="38" width="6" height="6" />
                <rect x="38" y="58" width="6" height="6" />
                <rect x="50" y="62" width="6" height="6" />
                <rect x="64" y="54" width="6" height="6" />
                <rect x="42" y="76" width="6" height="6" />
                <rect x="56" y="74" width="6" height="6" />
                <rect x="70" y="82" width="6" height="6" />
                <rect x="84" y="76" width="6" height="6" />
              </svg>
            </div>

            {/* PIN label */}
            <div className="pt-1">
              <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block font-semibold">
                {isTa ? 'வாயில் கடவு எண்' : 'Gate Inbound PIN'}
              </span>
              <span className="font-serif-hero text-2xl font-bold text-[#C8923A] tracking-widest">
                {booking.batchPin || '4091'}
              </span>
            </div>
          </div>

          {/* NOTCHED EDGES + DASHED DIVIDER */}
          <div className="relative w-full h-8 flex items-center justify-between">
            {/* Left Notch */}
            <div className="w-5 h-8 rounded-r-full bg-[#F7F4EC] shadow-inner" />
            {/* Dashed Line */}
            <div className="flex-1 border-b-2 border-dashed border-[#F7F4EC] mx-2" />
            {/* Right Notch */}
            <div className="w-5 h-8 rounded-l-full bg-[#F7F4EC] shadow-inner" />
          </div>

          {/* Bottom Ticket Section: Key Details */}
          <div className="p-6 space-y-4">
            {/* Key Detail 1: Booking ID */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5B6660] font-medium">
                {isTa ? 'முன்பதிவு எண்' : 'Booking ID'}
              </span>
              <span className="font-serif-hero text-base font-bold text-[#0F3D2E]">
                {booking.bookingCode}
              </span>
            </div>

            {/* Key Detail 2: Chamber */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5B6660] font-medium">
                {isTa ? 'கிடங்கு அறை' : 'Cold Chamber'}
              </span>
              <div className="text-right">
                <span className="text-xs font-bold text-[#1C2420] block">
                  {booking.chamberName || 'Solar Chamber 1'}
                </span>
                <span className="text-[11px] text-[#5B6660]">
                  {booking.facilityName}
                </span>
              </div>
            </div>

            {/* Key Detail 3: Time */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5B6660] font-medium">
                {isTa ? 'வருகை நேரம்' : 'Intake Schedule'}
              </span>
              <span className="text-xs font-bold text-[#14532D]">
                {isTa ? 'நாளை, காலை 08:30' : 'Tomorrow, 08:30 AM'}
              </span>
            </div>

            {/* Produce detail */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F7F4EC]">
              <span className="text-xs text-[#5B6660] font-medium">
                {isTa ? 'விளைபொருள்' : 'Produce Quantity'}
              </span>
              <span className="text-xs font-bold text-[#1C2420]">
                {isTa ? booking.cropNameTa || 'தக்காளி' : booking.cropName} • {booking.bookedKg} kg ({booking.bookedCrates} {isTa ? 'கூடைகள்' : 'crates'})
              </span>
            </div>
          </div>
        </section>

        {/* 2. COLLAPSIBLE TIMELINE */}
        <section className="card-heritage overflow-hidden" aria-label="Intake Timeline">
          <button
            type="button"
            onClick={() => setShowTimeline(!showTimeline)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#0F3D2E]" />
              <span className="text-sm font-bold text-[#1C2420]">
                {isTa ? 'நுழைவு செயல்முறை காலவரிசை' : 'Intake process timeline'}
              </span>
            </div>
            {showTimeline ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showTimeline && (
            <div className="px-4 pb-4 space-y-3 text-xs text-[#5B6660] border-t border-[#F7F4EC] pt-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#14532D] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-[#1C2420]">
                    {isTa ? 'வாயில் QR ஸ்கேன்' : 'Gate QR Verification'}
                  </h4>
                  <p>{isTa ? 'பாதுகாப்பு வாயிலில் QR-ஐ காட்டவும்' : 'Present QR or PIN at inbound security station'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#14532D] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-[#1C2420]">
                    {isTa ? 'தானியங்கி எடை மேடை' : 'Automated Weighing'}
                  </h4>
                  <p>{isTa ? 'கூடைகள் எடை சரிபார்க்கப்பட்டு பதிவு செய்யப்படும்' : 'Scale automatically records tare & gross weights'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#14532D] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-[#1C2420]">
                    {isTa ? 'அறை ஒதுக்கீடு' : 'Chamber Slotting'}
                  </h4>
                  <p>{isTa ? 'அறை 1 இல் கூடைகள் அடுக்கப்படும்' : 'Produce loaded into pre-cooled Bay #3'}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. COLLAPSIBLE PAYMENT DETAILS */}
        <section className="card-heritage overflow-hidden" aria-label="Payment Breakdown">
          <button
            type="button"
            onClick={() => setShowPayment(!showPayment)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-[#C8923A]" />
              <span className="text-sm font-bold text-[#1C2420]">
                {isTa ? 'கட்டண விவரங்கள் (ரசீது)' : 'Payment & receipt details'}
              </span>
            </div>
            {showPayment ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showPayment && (
            <div className="px-4 pb-4 space-y-2 text-xs text-[#5B6660] border-t border-[#F7F4EC] pt-3">
              <div className="flex justify-between">
                <span>{isTa ? 'சேமிப்பு கட்டணம் (10 நாட்கள்)' : 'Storage fee (10 days)'}:</span>
                <span className="font-semibold text-[#1C2420]">₹{booking.totalEstimatedCost || 493}</span>
              </div>
              <div className="flex justify-between">
                <span>{isTa ? 'சூரிய மின் காப்பீடு' : 'Solar backup insurance'}:</span>
                <span className="font-semibold text-[#14532D]">{isTa ? 'இலவசம் (மானியம்)' : 'Free (Govt subsidy)'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F7F4EC] font-bold text-sm text-[#0F3D2E]">
                <span>{isTa ? 'செலுத்தப்பட்ட தொகை' : 'Total Paid'}:</span>
                <span>₹{booking.totalEstimatedCost || 493}</span>
              </div>
            </div>
          )}
        </section>

        {/* 4. PRIMARY "DOWNLOAD PASS" BUTTON & RED "CANCEL BOOKING" TEXT LINK */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={20} />
            <span>{isTa ? 'அனுமதிச் சீட்டை பதிவிறக்கு' : 'Download pass'}</span>
          </button>

          <button
            type="button"
            onClick={handleCancelBooking}
            className="btn-destructive-link"
          >
            {isTa ? 'முன்பதிவை ரத்துசெய்' : 'Cancel booking'}
          </button>
        </div>

      </div>
    </div>
  );
};
