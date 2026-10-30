import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { demandForecastService } from '../services/demandForecastService';
import {
  Scale,
  CalendarCheck,
  Package,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  History,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { facilities, bookings, batches, movements, calculateCapacityLedger, verifyIntake, language } = useApp();
  const isTa = language === 'ta';

  const facility = facilities[0];
  const ledger = calculateCapacityLedger(facility.id);

  // State for gate weighing scale quick verification
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>('#SRS-TN-8492');
  const [scaleGrossKg, setScaleGrossKg] = useState<number>(495);
  const [crateCount, setCrateCount] = useState<number>(20);
  const [intakeChamber, setIntakeChamber] = useState<string>('Chamber 1 (Chilled)');
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyIntake(selectedBookingCode, scaleGrossKg, crateCount, intakeChamber);
    setShowIntakeModal(false);
  };

  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_storage').length;
  const forecastResult = demandForecastService.generateDemandForecast(bookings, facilities);

  return (
    <div className="flex flex-col relative w-full pt-3 pb-28 text-[#1C2420]">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                {isTa ? 'கிடங்கு செயல்பாடுகள் மையம்' : 'Storage Owner Operations Center'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#AFF2C2] text-[#00210F] text-xs font-bold border border-[#7BE39D]">
                {facility.name}
              </span>
            </div>
            <p className="text-xs text-[#5B6660]">
              Oddanchatram Rural Bypass • 3 Chambers • Dual Solar Hybrid Inverter Active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/owner/inventory"
              className="h-10 px-3.5 rounded-xl bg-white border border-[#DFE4DC] text-[#14532D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#EEF6ED] shadow-2xs"
            >
              <Package size={15} />
              <span>{isTa ? 'சரக்கிருப்பு மேலாண்மை' : 'Inventory Dashboard'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowIntakeModal(true)}
              className="h-10 px-3.5 rounded-xl bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0F3D2E] shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <Scale size={15} />
              <span>{isTa ? 'வாயில் எடை பதிவு' : 'Gate Intake Scale'}</span>
            </button>
          </div>
        </div>

        {/* DUAL CAPACITY LEDGER: Physically occupied vs Reserved capacity */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#C8923A]" />
              <h2 className="text-sm font-bold text-[#0F3D2E]">
                {isTa ? 'இருவேறு கொள்ளளவு பதிவேடுகள் (Dual Capacity Ledger)' : 'Dual Capacity Accounting: Physical Occupancy vs. Reserved Capacity'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] border border-[#AFF2C2]">
              Strictly Separated Ledgers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F4FBF3] p-4 rounded-2xl border border-[#AFF2C2]">
              <span className="text-[10px] text-[#5B6660] uppercase tracking-wider font-bold block">
                Total Rated Capacity
              </span>
              <span className="text-xl font-extrabold text-[#14532D] mt-1 block">
                {(ledger.totalRatedCapacityKg / 1000).toFixed(0)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.totalRatedCapacityCrates} Crates Max</span>
            </div>

            <div className="bg-[#F4FBF3] p-4 rounded-2xl border border-[#AFF2C2]">
              <span className="text-[10px] text-[#14532D] uppercase tracking-wider font-bold block">
                Physical Occupancy
              </span>
              <span className="text-xl font-extrabold text-[#14532D] mt-1 block">
                {ledger.currentPhysicalOccupancyKg} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#14532D] font-bold">
                {ledger.utilizationPhysicalPercentage}% physical stock present
              </span>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E7D7BE]">
              <span className="text-[10px] text-[#C8923A] uppercase tracking-wider font-bold block">
                Reserved Capacity (Today)
              </span>
              <span className="text-xl font-extrabold text-[#C8923A] mt-1 block">
                {ledger.reservedCapacityKgToday} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-[#C8923A] font-bold">
                {ledger.utilizationReservedPercentage}% committed in bookings
              </span>
            </div>

            <div className="bg-[#F7F4EC] p-4 rounded-2xl border border-[#DFE4DC]">
              <span className="text-[10px] text-[#404941] uppercase tracking-wider font-bold block">
                Available Physical Space
              </span>
              <span className="text-xl font-extrabold text-[#1C2420] mt-1 block">
                {(ledger.availablePhysicalCapacityKg / 1000).toFixed(1)} <span className="text-xs font-normal">Tonnes</span>
              </span>
              <span className="text-[10px] text-[#5B6660]">{ledger.availablePhysicalCapacityCrates} crates ready</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-[11px] text-[#5B6660] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#14532D] flex-shrink-0" />
            <span>
              <strong>Non-Negotiable Architecture Invariant:</strong> Creating or modifying bookings only updates reserved capacity over a duration. Physical inventory intake operates independently and works without any mandatory booking ID.
            </span>
          </div>
        </div>

        {/* Module Quick Nav Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/owner/bookings"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <CalendarCheck size={20} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                {activeBookingsCount} Active
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Booking Management</span>
              <span className="text-[10px] text-[#5B6660]">Reservations &amp; approvals</span>
            </div>
          </Link>

          <Link
            to="/owner/inventory"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Package size={20} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#C8923A] bg-[#FFFBF0] px-2 py-0.5 rounded-full">
                {batches.length} Batches
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Normal Inventory</span>
              <span className="text-[10px] text-[#5B6660]">Walk-in, intake &amp; withdrawal</span>
            </div>
          </Link>

          <Link
            to="/owner/locations"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Thermometer size={20} className="text-[#14532D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                3 Chambers
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">Storage Locations</span>
              <span className="text-[10px] text-[#5B6660]">Chambers &amp; maintenance</span>
            </div>
          </Link>

          <Link
            to="/owner/ai-insights"
            className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-2xs hover:border-[#14532D] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <Sparkles size={20} className="text-[#C8923A] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                2 Notices
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-[#0F3D2E] block">AI Insights &amp; Alerts</span>
              <span className="text-[10px] text-[#5B6660]">Arbitrage &amp; near-expiry</span>
            </div>
          </Link>
        </div>

        {/* Live Chamber Telemetry Tiles */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161D18] flex items-center gap-1.5">
              <Thermometer size={18} className="text-[#14532D]" />
              <span>Chamber Status &amp; IoT Sensor Telemetry</span>
            </h2>
            <span className="text-[11px] text-[#14532D] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#14532D] animate-ping" />
              Sensors Online
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {facility.chambers.map((cham) => (
              <div
                key={cham.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between ${cham.isMaintenance ? 'bg-[#FFDCC6]/20 border-[#FFB786]' : 'bg-[#EEF6ED] border-[#DDE4DD]'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#161D18]">{cham.name.split('(')[0]}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cham.isMaintenance ? 'bg-[#844000] text-white' : 'bg-[#86F8C2] text-[#00210F]'
                        }`}
                    >
                      {cham.isMaintenance ? 'Calibrating' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#404941] mt-0.5">
                    Range: {cham.tempMin}°C - {cham.tempMax}°C
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#DDE4DD] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14532D]">{cham.currentTemp}°C</span>
                  <span className="font-semibold text-[#5B6660]">{cham.humidity}% RH</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Demand Forecasting & Capacity Pressure (Strictly Advisory) */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEF6ED] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E7F5EE] flex items-center justify-center text-[#14532D]">
                  <TrendingUp size={16} />
                </div>
                <h2 className="text-sm font-bold text-[#161D18]">
                  {isTa ? 'செயற்கை நுண்ணறிவு தேவை & கொள்ளளவு கணிப்பு' : 'AI Cold Storage Demand Forecast'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FFFBF0] text-[#C8923A] border border-[#F0D590] text-[10px] font-bold">
                  {forecastResult.modelVersion}
                </span>
              </div>
              <p className="text-[11px] text-[#5B6660] mt-0.5">
                {isTa
                  ? 'வரலாற்று முன்பதிவு போக்கு மற்றும் காலவரிசை மாதிரி அடிப்படையில் கணிக்கப்பட்டது'
                  : 'Time-series double exponential smoothing evaluated with chronological validation'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#5B6660]">
              <Info size={12} className="text-[#C8923A]" />
              <span>Horizon: 14 Days • Generated: {new Date(forecastResult.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Insufficient Data vs Model Forecast Card */}
          {!forecastResult.hasSufficientData ? (
            <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#F0D590] space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-[#C8923A] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#8C6218] block">
                    {isTa ? 'வரலாற்று தரவுகள் போதுமானதாக இல்லை' : 'Insufficient Historical Data for Machine Learning Forecast'}
                  </span>
                  <p className="text-[11px] text-[#704F12] leading-relaxed">
                    {isTa
                      ? `கணினியில் ${forecastResult.sampleCount} முன்பதிவு பதிவுகள் மட்டுமே உள்ளன (நம்பகமான கணிப்பிற்கு குறைந்தது ${forecastResult.minimumRequired} தேவை). தவறான தரவுகளை உருவாக்காமல், உண்மையான தற்போதைய கொள்ளளவு விவரம் கீழே காட்டப்பட்டுள்ளது.`
                      : `Only ${forecastResult.sampleCount} recorded booking cycle(s) exist in database (minimum ${forecastResult.minimumRequired} required). Rather than inventing fake numbers, showing verified capacity baseline below.`}
                  </p>
                </div>
              </div>

              {/* Historical summary if any */}
              {forecastResult.historicalDailySummary.length > 0 && (
                <div className="pt-2 border-t border-[#F0D590]/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6218] block mb-1">
                    Recorded Historical Demand:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {forecastResult.historicalDailySummary.map((h, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/80 border border-[#F0D590] text-[10px] font-medium text-[#404941]">
                        {h.date}: {h.totalKg} kg
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chronological Validation Scorecard */}
              {forecastResult.evaluation && (
                <div className="p-3 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#14532D]" />
                    <span className="text-[#14532D] font-bold">
                      Chronological Evaluation (Train: {forecastResult.evaluation.trainSize} | Test: {forecastResult.evaluation.testSize})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#246A42]">Model MAE: <strong>{forecastResult.evaluation.mae} kg</strong></span>
                    <span className="text-[#5B6660]">Baseline MAE: <strong>{forecastResult.evaluation.baselineMae} kg</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#14532D] font-bold text-[10px] border border-[#AFF2C2]">
                      {forecastResult.evaluation.modelBetterThanBaseline ? '✓ Outperforms Baseline' : 'Comparable to Baseline'}
                    </span>
                  </div>
                </div>
              )}

              {/* Crop Demand Forecast breakdown */}
              {forecastResult.cropForecasts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#1C2420] block">
                    {isTa ? 'பயிர் வாரியான தேவை கணிப்பு' : 'Crop-wise Projected Demand'}
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {forecastResult.cropForecasts.map((c, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#14532D] text-sm">{c.cropName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.trend === 'increasing' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {c.trend.toUpperCase()} TREND
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center py-1">
                          <div className="bg-white p-1.5 rounded-xl border border-[#DFE4DC]">
                            <span className="text-[9px] text-[#5B6660] block">7-Day</span>
                            <span className="font-bold text-[#1C2420]">{c.projectedKg7d} kg</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-[#DFE4DC]">
                            <span className="text-[9px] text-[#5B6660] block">14-Day</span>
                            <span className="font-bold text-[#14532D]">{c.projectedKg14d} kg</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-[#DFE4DC]">
                            <span className="text-[9px] text-[#5B6660] block">30-Day</span>
                            <span className="font-bold text-[#1C2420]">{c.projectedKg30d} kg</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8C9690] block text-right">
                          90% Confidence: {c.confidenceLowerKg} kg - {c.confidenceUpperKg} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Facility Capacity Pressure Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1C2420] block">
              {isTa ? 'கிடங்கு கொள்ளளவு அழுத்தம்' : 'Facility Capacity Pressure & Utilization Outlook'}
            </span>
            <div className="grid sm:grid-cols-2 gap-3">
              {forecastResult.facilityPressures.map((p) => {
                const isCrit = p.pressureLevel === 'critical';
                const isMod = p.pressureLevel === 'moderate';
                return (
                  <div
                    key={p.facilityId}
                    className={`p-3.5 rounded-2xl border space-y-2 ${isCrit
                        ? 'bg-red-50/20 border-red-300'
                        : isMod
                          ? 'bg-amber-50/20 border-amber-300'
                          : 'bg-[#F7F4EC] border-[#DFE4DC]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#161D18]">{p.facilityName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCrit
                            ? 'bg-red-100 text-red-800'
                            : isMod
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {p.pressureLevel} Pressure
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#5B6660]">Projected Occupancy:</span>
                        <span className="font-bold text-[#1C2420]">{p.projectedOccupancyPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCrit ? 'bg-red-500' : isMod ? 'bg-amber-500' : 'bg-[#14532D]'
                            }`}
                          style={{ width: `${p.projectedOccupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#5B6660] leading-relaxed">
                      {isTa ? p.advisoryMessageTa : p.advisoryMessage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Farmer Advisory Tip */}
          <div className="p-3 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] text-xs space-y-1">
            <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider block">
              Farmer-Facing Advisory Notice:
            </span>
            <p className="text-[#246A42]">
              {isTa ? forecastResult.farmerAdvisory.messageTa : forecastResult.farmerAdvisory.messageEn}
            </p>
          </div>

          {/* Strict Invariant Disclaimer */}
          <div className="text-[10px] text-[#8C9690] flex items-start gap-1.5 pt-1">
            <ShieldCheck size={13} className="text-[#14532D] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Non-Autonomous Architecture:</strong> Forecasts are purely advisory for operator logistics. AI never confirms or rejects bookings, modifies prices, or reserves chamber space without operator input.
            </span>
          </div>
        </div>

        {/* Recent Stock Movements Table */}
        <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161D18] flex items-center gap-1.5">
              <History size={18} className="text-[#14532D]" />
              <span>Recent Physical Stock Movements</span>
            </h2>
            <Link to="/owner/inventory/history" className="text-xs font-bold text-[#14532D] hover:underline">
              View All Movements
            </Link>
          </div>

          <div className="divide-y divide-[#EEF6ED]">
            {movements.slice(0, 4).map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">
                    {m.batchCode} • {m.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[10px] text-[#5B6660]">{m.reason}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#14532D]">
                    {m.type === 'intake' ? '+' : '-'}{m.quantityKg} kg
                  </div>
                  <div className="text-[10px] text-[#5B6660]">
                    {new Date(m.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Weighing Scale Modal */}
        {showIntakeModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#14532D] flex items-center gap-2">
                  <Scale size={20} className="text-[#C8923A]" />
                  <span>Gate Intake Weighing Scale</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#5B6660]">
                Weigh farm truck at gate scale. Only verified gross weight will be recorded into chamber inventory.
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#404941]">Booking Reference</label>
                  <select
                    value={selectedBookingCode}
                    onChange={(e) => setSelectedBookingCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-mono bg-[#F4FBF3]"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.bookingCode}>
                        {b.bookingCode} - {b.cropName} ({b.bookedKg} kg booked by {b.farmerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Scale Weight (kg)</label>
                    <input
                      type="number"
                      value={scaleGrossKg}
                      onChange={(e) => setScaleGrossKg(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#404941]">Crate Count</label>
                    <input
                      type="number"
                      value={crateCount}
                      onChange={(e) => setCrateCount(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold bg-[#F4FBF3]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#404941]">Destination Chamber</label>
                  <select
                    value={intakeChamber}
                    onChange={(e) => setIntakeChamber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3]"
                  >
                    {facility.chambers.map((c) => (
                      <option key={c.id} value={c.name} disabled={c.isMaintenance}>
                        {c.name} {c.isMaintenance ? '(Maintenance)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E]"
                  >
                    Verify &amp; Create Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
