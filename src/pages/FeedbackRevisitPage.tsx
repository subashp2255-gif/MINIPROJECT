import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FeedbackRevisitPage: React.FC = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const { bookings, facilities, submitReview, showToast } = useApp();
  const navigate = useNavigate();

  const cleanCode = bookingCode ? (bookingCode.startsWith('#') ? bookingCode : `#${bookingCode}`) : '#SRS-TN-8492';
  const booking = bookings.find((b) => b.bookingCode === cleanCode) || bookings[0];

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [complaintCategory, setComplaintCategory] = useState<string>('Temperature Fluctuation');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [revisitScheduled, setRevisitScheduled] = useState<boolean>(false);

  const isSatisfied = rating >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(
      booking.bookingCode,
      rating,
      comment || (isSatisfied ? 'Storage and temperature maintenance was excellent.' : 'Dispute filed regarding produce storage.'),
      !isSatisfied,
      !isSatisfied ? complaintCategory : undefined
    );
    setSubmitted(true);
  };

  const handleBookAgain = () => {
    navigate(`/wizard?facilityId=${booking.facilityId}`);
  };

  return (
    <div className="flex flex-col relative w-full pt-3 pb-28 text-[#1C2420]">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/home"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#14532D] shadow-xs border border-[#DFE4DC] hover:bg-[#EEF6ED] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#14532D]">Feedback &amp; Repeat Booking</h1>
            <p className="text-xs text-[#526055]">
              Post-harvest storage evaluation for {booking.bookingCode}
            </p>
          </div>
        </div>

        {/* Rating Submission Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dfe4dc] space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-[#161d18]">
              How was your cold storage experience at {booking.facilityName}?
            </h2>
            <p className="text-xs text-[#404941]">
              {booking.cropName} • {booking.chamberName} • {booking.bookedKg} kg
            </p>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl sm:text-4xl transition-transform hover:scale-110 active:scale-95 focus:outline-hidden"
              >
                <span className={star <= rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
              </button>
            ))}
          </div>

          <div className="text-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSatisfied ? 'bg-[#86f8c2] text-[#00734e]' : 'bg-[#ffdcc6] text-[#844000]'
              }`}
            >
              {rating === 5 && 'Outstanding Storage Quality'}
              {rating === 4 && 'Good Freshness Retained'}
              {rating === 3 && 'Average Experience'}
              {rating <= 2 && 'Issue Encountered / Dissatisfied'}
            </span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              {!isSatisfied && (
                <div>
                  <label className="block text-xs font-bold text-[#161d18] mb-1">
                    Select Issue Category
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                  >
                    <option>Chamber Temperature Fluctuation</option>
                    <option>Crate Physical Spoilage / Mold</option>
                    <option>Gate Weighing Discrepancy</option>
                    <option>Delayed Intake / Gate Access Issue</option>
                    <option>Billing Rate Mismatch</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">
                  {isSatisfied ? 'Feedback / Notes for Facility Owner' : 'Describe the incident in detail'}
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isSatisfied
                      ? 'e.g. Tomatoes stayed firm with zero weight loss over 10 days...'
                      : 'Provide specifics so the regional agri inspector can verify...'
                  }
                  className="w-full p-3 text-xs border border-[#c0c9bf] rounded-xl outline-hidden focus:border-[#1e5e3a]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#166534] active:scale-98 transition-all shadow-xs"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="p-3 bg-[#eef6ed] rounded-xl text-center text-xs text-[#14532D] font-bold">
              ✓ Your feedback has been recorded on the verified blockchain ledger.
            </div>
          )}
        </div>

        {/* SATISFIED PATH: Revisit Booking & Slot Reservation */}
        {isSatisfied && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dfe4dc] space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#14532D]" />
              <div>
                <h3 className="text-sm font-bold text-[#161d18]">Book This Chamber Again</h3>
                <p className="text-xs text-[#404941]">Pre-fill with your favorite lot settings</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#eef6ed] rounded-xl border border-[#dde4dd] text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-[#161d18]">
                <span>Chamber Slot:</span>
                <span>{booking.facilityName} - {booking.chamberName}</span>
              </div>
              <div className="flex justify-between text-[#404941]">
                <span>Recommended Crop:</span>
                <span>{booking.cropName} (Shivam Variety)</span>
              </div>
              <div className="flex justify-between text-[#14532D] font-bold">
                <span>Published Rate:</span>
                <span>₹{booking.dailyRateCrate} / crate / day (Guaranteed)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setRevisitScheduled(true);
                  showToast('Pickup reminder scheduled on WhatsApp/SMS!', 'info');
                }}
                className="w-1/2 h-12 bg-[#EEF6ED] text-[#14532D] text-xs font-bold rounded-xl hover:bg-[#e3eae2] transition-colors"
              >
                {revisitScheduled ? '✓ Reminder Scheduled' : 'Set Harvest Reminder'}
              </button>

              <button
                onClick={handleBookAgain}
                className="w-1/2 h-12 bg-[#14532D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Reserve Next Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* DISSATISFIED PATH: Trackable Complaint Ticket & Alternative Hubs */}
        {!isSatisfied && (
          <div className="space-y-4 animate-in fade-in">
            {/* Complaint Ticket Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#ffb786] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#844000] uppercase tracking-wide">
                  Complaint Ticket #DISP-2024-88
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdcc6] text-[#844000] text-[10px] font-bold">
                  Under Review
                </span>
              </div>
              <p className="text-xs text-[#161d18] font-medium">
                Issue: {complaintCategory} at {booking.facilityName}
              </p>
              <p className="text-[11px] text-[#404941]">
                Owner Arumugam P. has been given 24 hours to review IoT telemetry logs and provide compensation or remediation.
              </p>
            </div>

            {/* Alternative Verified Hubs */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
              <h3 className="text-xs font-bold text-[#161d18] uppercase tracking-wider">
                Alternative Certified Facilities Nearby
              </h3>

              <div className="space-y-2">
                {facilities
                  .filter((f) => f.id !== booking.facilityId)
                  .map((altFac) => (
                    <div
                      key={altFac.id}
                      className="p-3 rounded-xl bg-[#eef6ed] flex items-center justify-between gap-3 border border-[#dde4dd]"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#161d18]">{altFac.name}</h4>
                        <p className="text-[11px] text-[#404941]">
                          {altFac.location} • {altFac.distanceKm} km • ★ {altFac.rating}
                        </p>
                      </div>
                      <Link
                        to={`/wizard?facilityId=${altFac.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#1e5e3a] text-white text-xs font-bold hover:bg-[#16462b]"
                      >
                        Book Here
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
