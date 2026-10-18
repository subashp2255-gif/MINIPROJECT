import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, AlertTriangle, Calendar, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveInspectionPage: React.FC = () => {
  const { batchCode } = useParams<{ batchCode: string }>();
  const { batches, scheduleInspection, showToast } = useApp();

  const cleanBatch = batchCode ? (batchCode.startsWith('#') ? batchCode : `#${batchCode}`) : '#TN-DDG-088';
  const batch = batches.find((b) => b.batchCode === cleanBatch) || batches[0];

  const [activeCameraAngle, setActiveCameraAngle] = useState<'A1' | 'B2' | 'Top'>('A1');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>('11:00 AM');
  const [discrepancyNote, setDiscrepancyNote] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInspection(batch.batchCode, batch.cropName, batch.facilityId, scheduledDate, scheduledTime);
  };

  const handleDiscrepancySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Discrepancy report filed for Batch ${batch.batchCode}. Supervisor alerted.`, 'warning');
    setShowReportModal(false);
    setDiscrepancyNote('');
  };

  const handleSnapshot = () => {
    showToast(`Optical chamber snapshot saved to your inspection gallery!`, 'success');
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-32 bg-[#F4FBF3] min-h-screen">
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
            <h1 className="text-xl font-bold text-[#14532D]">Chamber Live Inspection</h1>
            <p className="text-xs text-[#526055]">
              Optical IoT Telemetry &amp; Video Inspection Booth • {batch.batchCode}
            </p>
          </div>
        </div>

        {/* Live Camera Feed Screen (Simulated PTZ Booth) */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-md relative border border-gray-800">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden flex items-center justify-center bg-gray-950">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
              alt="Cold Chamber Camera"
              className="w-full h-full object-cover opacity-80 transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />

            {/* Live Camera Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                LIVE REC
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                CAM {activeCameraAngle} • PTZ-04
              </span>
            </div>

            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-emerald-400 font-mono text-xs flex items-center gap-2">
              <span>{batch.currentTemp}°C</span>
              <span>•</span>
              <span>{batch.currentHumidity}% RH</span>
            </div>

            {/* Target Reticle */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border border-dashed border-emerald-400/50 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-emerald-300 font-mono bg-black/40 px-1 rounded">
                  {batch.batchCode}
                </span>
              </div>
            </div>

            {/* Camera Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md p-2 rounded-xl flex items-center justify-between text-white text-xs">
              {/* Angles */}
              <div className="flex items-center gap-1">
                {(['A1', 'B2', 'Top'] as const).map((ang) => (
                  <button
                    key={ang}
                    onClick={() => setActiveCameraAngle(ang)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                      activeCameraAngle === ang ? 'bg-[#1e5e3a] text-white' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Angle {ang}
                  </button>
                ))}
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  className="w-7 h-7 bg-gray-800 rounded-md flex items-center justify-center text-sm font-bold"
                >
                  -
                </button>
                <span className="font-mono text-[11px] px-1">{zoomLevel}x</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                  className="w-7 h-7 bg-gray-800 rounded-md flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* Snapshot */}
              <button
                onClick={handleSnapshot}
                className="p-1.5 bg-[#14532D] rounded-md text-white flex items-center justify-center hover:bg-[#166534] transition-colors"
                title="Capture Frame"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Batch Inspection Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#161d18]">Batch {batch.batchCode} Overview</h2>
              <p className="text-xs text-[#404941]">
                {batch.cropName} • {batch.currentStockKg} kg • {batch.facilityName}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#86f8c2] text-[#00734e] text-xs font-bold">
              Quality Score: {batch.qualityScore}%
            </span>
          </div>

          <div className="p-3 bg-[#eef6ed] rounded-xl text-xs text-[#404941] border border-[#dde4dd]">
            <p className="font-semibold text-[#1e5e3a] mb-0.5">Automated Optical Sensor Verdict:</p>
            <p>
              Crate condensation levels normal. Zero skin wrinkling or fungal discoloration detected by
              AI visual classifier in the last 6-hour scan cycle.
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full h-12 rounded-xl bg-[#ffdcc6] text-[#844000] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#ffb786] transition-colors"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Report Quality Discrepancy or Damage</span>
          </button>
        </div>

        {/* Schedule Formal In-Person / Guided Inspection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <h2 className="text-base font-bold text-[#161d18]">Schedule Guided Inspection Session</h2>
          <p className="text-xs text-[#404941]">
            Request the facility supervisor to conduct a physical quality sampling on video call.
          </p>

          <form onSubmit={handleSchedule} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#404941] mb-1">Preferred Time</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-semibold bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
                >
                  <option value="10:00 AM">10:00 AM (Morning inspection)</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:30 PM">02:30 PM (Post-mandi arrival)</option>
                  <option value="04:30 PM">04:30 PM (Evening round)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#166534] active:scale-98 transition-all shadow-xs"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Confirm Guided Inspection Slot</span>
            </button>
          </form>
        </div>
      </div>

      {/* Discrepancy Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#dde4dd]">
              <div>
                <h3 className="font-bold text-lg text-[#161d18]">Report Storage Discrepancy</h3>
                <p className="text-xs text-[#404941]">Incident report for {batch.batchCode}</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#707971] hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDiscrepancySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#161d18] mb-1">Issue Category</label>
                <select className="w-full h-11 px-3 text-xs bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden font-medium">
                  <option>Visual Rot / Spoilage in Crate</option>
                  <option>Excessive Chamber Condensation</option>
                  <option>Physical Crate Damage / Stack Tilt</option>
                  <option>Temperature Variance Mismatch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161d18] mb-1">Detailed Observation</label>
                <textarea
                  rows={3}
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  placeholder="Describe your observation from the camera view..."
                  className="w-full p-3 text-xs border border-[#c0c9bf] rounded-xl outline-hidden focus:border-[#1e5e3a]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-1/3 h-12 bg-[#EEF6ED] text-[#526055] text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 bg-[#8C5D17] text-white text-xs font-bold rounded-xl hover:bg-[#724a12] transition-colors"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
