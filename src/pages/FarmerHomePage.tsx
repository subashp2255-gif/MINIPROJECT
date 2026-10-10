import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const FarmerHomePage: React.FC = () => {
  const { serviceMode, setServiceMode, t, language, batches, showToast, refreshTelemetry } = useApp();
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);

  const activeBatch = batches.find((b) => b.batchCode === '#TN-DDG-088') || batches[0];

  const handleConfirmArrival = () => {
    showToast('Gate Arrival Confirmed! Bay #3 entry pass activated.', 'success');
  };

  const handleReschedule = () => {
    showToast('Reschedule request sent to Dindigul Hub supervisor.', 'info');
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* 1. Farmer Context & Greeting Banner (Exact Stitch Recreation) */}
        <section className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden border border-[#dfe4dc]">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#86f8c2]/30 pointer-events-none"></div>
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e9f0e8] text-[#006c49] text-xs font-semibold mb-1">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                <span>{language === 'ta' ? 'ஒட்டன்சத்திரம், திண்டுக்கல்' : 'Oddanchatram, Dindigul'}</span>
                <span className="text-[#404941] font-normal">
                  {language === 'ta' ? '• 3 கி.மீ மையம்' : '• 3 km hub'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#161d18] tracking-tight">
                {language === 'ta' ? 'வணக்கம், முருகன் எஸ்.' : 'Welcome, Murugan S.'}
              </h1>
              <p className="text-xs text-[#404941] font-medium mt-0.5">
                {language === 'ta'
                  ? 'உழவர் அடையாள எண் #OD-4091 • ஒட்டன்சத்திரம்'
                  : 'Farmer ID #OD-4091 • Oddanchatram'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#aff2c2] text-[#1e5e3a] font-bold shadow-sm">
                <span className="material-symbols-outlined text-[26px]">eco</span>
              </span>
            </div>
          </div>

          {/* Live Telemetry Switcher & Sync Indicator */}
          <div className="mt-4 pt-2 bg-[#eef6ed] rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="inline-flex bg-white p-0.5 rounded-lg shadow-sm">
              <button
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  serviceMode === 'cold'
                    ? 'bg-[#1e5e3a] text-white shadow-xs'
                    : 'text-[#404941]'
                }`}
                onClick={() => setServiceMode('cold')}
              >
                {t('serviceColdStorage')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  serviceMode === 'inventory'
                    ? 'bg-[#1e5e3a] text-white shadow-xs'
                    : 'text-[#404941]'
                }`}
                onClick={() => {
                  setServiceMode('inventory');
                  navigate('/farmer/inventory');
                }}
              >
                {t('serviceCentralInv')}
              </button>
            </div>

            <button
              onClick={refreshTelemetry}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#e9f0e8] hover:bg-[#e3eae2] text-[#404941] text-[11px] transition-colors"
              title="Click to sync telemetry"
            >
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-ping"></span>
              <span className="truncate font-medium">{t('tnAgriSync')}</span>
            </button>
          </div>
        </section>

        {/* 2. Primary Focal Point: Active Stored Produce Summary */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#dfe4dc]">
          <div className="p-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1e5e3a]/10 text-[#1e5e3a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shelves</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#161d18] leading-tight">
                    {t('produceInCold')}
                  </h2>
                  <p className="text-xs text-[#404941]">{t('activeVaultStatus')}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#86f8c2] text-[#002113] text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>{t('statusSafe')}</span>
              </span>
            </div>

            {/* Main Commodity Card Banner */}
            <div className="bg-[#eef6ed] rounded-xl p-3.5 mb-3.5 border border-[#dde4dd]">
              <div className="flex items-center gap-3">
                <img
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                  alt="Hybrid Tomatoes in plastic crates"
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#161d18] truncate">
                      {language === 'ta' ? activeBatch.cropNameTa : activeBatch.cropName}
                    </span>
                    <span className="text-xs font-extrabold text-[#1e5e3a]">
                      {activeBatch.currentStockCrates} {language === 'ta' ? 'கூடைகள்' : 'Crates'}
                    </span>
                  </div>
                  <p className="text-xs text-[#404941] font-medium mt-0.5">
                    {activeBatch.currentStockKg} kg • Batch {activeBatch.batchCode}
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] text-[#006c49] font-semibold mt-1">
                    <span className="material-symbols-outlined text-[14px]">nest_multi_room</span>
                    <span>{activeBatch.facilityName} • {activeBatch.chamberName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Micro-Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3.5">
              <div className="bg-[#e9f0e8] rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#404941]">
                  <span className="material-symbols-outlined text-[18px] text-[#1e5e3a]">thermostat</span>
                  <span className="text-xs font-semibold">{t('chamberTemp')}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xl font-extrabold text-[#161d18]">{activeBatch.currentTemp}°C</span>
                  <span className="text-[11px] text-[#006c49] font-bold ml-1">{t('optimal')}</span>
                </div>
                <span className="text-[10px] text-[#404941] font-medium">{activeBatch.currentHumidity}% Humidity</span>
              </div>

              <div className="bg-[#e9f0e8] rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#404941]">
                  <span className="material-symbols-outlined text-[18px] text-[#844000]">hourglass_top</span>
                  <span className="text-xs font-semibold">{t('retentionPeriod')}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xl font-extrabold text-[#161d18]">
                    Day {activeBatch.dayCurrent}{' '}
                    <span className="text-[#404941] font-normal text-xs">/ {activeBatch.dayTotal}</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#404941] font-medium">
                  {activeBatch.dayTotal - activeBatch.dayCurrent} days remaining
                </span>
              </div>
            </div>

            {/* Spoilage Risk Gauge */}
            <div className="bg-[#eef6ed] rounded-xl p-3 mb-3.5 flex items-center justify-between gap-2 border border-[#dde4dd]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#86f8c2] flex items-center justify-center text-[#002113]">
                  <span className="material-symbols-outlined text-[17px]">solar_power</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#161d18]">{t('spoilageVariance')}</div>
                  <div className="text-[11px] text-[#404941]">{t('solarActive')}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#006c49] font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{t('ultraLowRisk')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/live-inspection/${activeBatch.batchCode.replace('#', '')}`}
                className="h-12 px-3 rounded-xl bg-[#e9f0e8] text-[#1e5e3a] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e3eae2] active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">videocam</span>
                <span>{t('liveInspect')}</span>
              </Link>
              <button
                onClick={() => setShowQrModal(true)}
                className="h-12 px-3 rounded-xl bg-[#e9f0e8] text-[#161d18] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e3eae2] active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">qr_code_2</span>
                <span>{t('batchQr')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Upcoming Action & Collection Reminder (Pickup Alert) */}
        <section className="bg-[#ffdcc6] rounded-2xl p-4 text-[#311300] shadow-sm border border-[#ffb786]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#844000] text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wide bg-[#844000]/15 text-[#723600] px-2 py-0.5 rounded-md">
                  {t('pickupAlert')}
                </span>
                <span className="text-xs font-semibold text-[#311300]">{t('pickupTime')}</span>
              </div>
              <h3 className="text-base font-bold text-[#311300] mt-1">{t('potatoPickupTitle')}</h3>
              <p className="text-xs text-[#723600] mt-0.5 leading-snug">{t('potatoPickupSubtitle')}</p>

              <div className="flex flex-col sm:flex-row gap-2 mt-3.5">
                <button
                  onClick={handleConfirmArrival}
                  className="h-11 px-4 rounded-xl bg-[#844000] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>{t('confirmArrival')}</span>
                </button>
                <button
                  onClick={handleReschedule}
                  className="h-11 px-4 rounded-xl bg-white/80 text-[#311300] text-xs font-semibold flex items-center justify-center hover:bg-white active:scale-98 transition-colors"
                >
                  {t('reschedule')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AI Crop Price Advisory & Feasibility Preview */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#86f8c2] text-[#00210f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#161d18]">{t('mandiAiForecast')}</h2>
                <p className="text-xs text-[#404941]">{t('dindigulAi')}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#aff2c2] text-[#00210f] text-[11px] font-bold">
              {t('netGain58')}
            </span>
          </div>

          {/* Comparative Metric Card */}
          <div className="bg-[#eef6ed] rounded-xl p-3.5 flex items-center justify-between gap-3 mb-3 border border-[#dde4dd]">
            <div className="min-w-0">
              <span className="text-xs text-[#404941] block">{t('spotPrice')}</span>
              <span className="text-lg font-bold text-[#161d18]">
                ₹24<span className="text-xs font-normal text-[#404941]">/kg</span>
              </span>
              <span className="text-[11px] text-[#ba1a1a] font-medium block">{t('lowDemandToday')}</span>
            </div>
            <div className="flex flex-col items-center px-1">
              <span className="material-symbols-outlined text-[#1e5e3a] text-[22px]">arrow_forward</span>
              <span className="text-[10px] text-[#404941] font-semibold">{t('in6Days')}</span>
            </div>
            <div className="text-right min-w-0">
              <span className="text-xs text-[#404941] block">{t('projectedPeak')}</span>
              <span className="text-lg font-bold text-[#006c49]">
                ₹38<span className="text-xs font-normal text-[#404941]">/kg</span>
              </span>
              <span className="text-[11px] text-[#006c49] font-bold block">{t('weekendSpike')}</span>
            </div>
          </div>

          {/* Storage Cost Feasibility Breakdown */}
          <div className="px-1 py-1.5 mb-3 flex items-center justify-between text-[#404941] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#1e5e3a]">currency_rupee</span>
              <span>{t('storageCostDaily')}</span>
            </div>
            <div className="text-[#1e5e3a] font-bold">{t('netBenefitCalc')}</div>
          </div>

          <Link
            to="/ai-arbitrage"
            className="w-full h-11 rounded-xl bg-[#e9f0e8] flex items-center justify-between px-3.5 text-[#1e5e3a] hover:bg-[#e3eae2] active:scale-98 transition-all text-xs font-bold"
          >
            <span>{t('viewFullTrends')}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </section>

        {/* 5. Quick Actions Grid */}
        <section className="space-y-2.5">
          <Link
            to="/wizard"
            className="w-full h-14 rounded-2xl bg-[#1e5e3a] text-white font-bold text-sm flex items-center justify-between px-5 shadow-sm hover:bg-[#16462b] active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">add_box</span>
              <div className="text-left">
                <span className="block leading-tight">{t('bookNewSlot')}</span>
                <span className="text-[11px] font-normal opacity-90 block leading-tight">
                  {t('bookNewSlotSubtitle')}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
          </Link>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/farmer/inventory"
              className="h-13 rounded-2xl bg-white text-[#161d18] font-bold text-xs flex items-center justify-start gap-2 shadow-xs hover:bg-[#e9f0e8] active:scale-98 transition-colors p-3 border border-[#dfe4dc]"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006c49]">inventory</span>
              <div className="text-left min-w-0">
                <span className="block truncate">{t('logFarmStock')}</span>
                <span className="text-[10px] text-[#404941] font-medium block truncate">
                  {t('dailyInventory')}
                </span>
              </div>
            </Link>

            <a
              href="tel:18004251661"
              className="h-13 rounded-2xl bg-white text-[#161d18] font-bold text-xs flex items-center justify-start gap-2 shadow-xs hover:bg-[#e9f0e8] active:scale-98 transition-colors p-3 border border-[#dfe4dc]"
            >
              <span className="material-symbols-outlined text-[20px] text-[#1e5e3a]">support_agent</span>
              <div className="text-left min-w-0">
                <span className="block truncate">{t('kisanHelpdesk')}</span>
                <span className="text-[10px] text-[#404941] font-medium block truncate">1800-425-1661</span>
              </div>
            </a>
          </div>
        </section>

        {/* 6. Nearby Cold Hubs Teaser */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#161d18]">{t('nearbyHubs')}</h2>
              <p className="text-xs text-[#404941]">{t('nearestChambers')}</p>
            </div>
            <Link
              to="/discovery?view=map"
              className="text-xs text-[#1e5e3a] font-bold hover:underline"
            >
              {t('mapView')}
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Hub 1 */}
            <Link
              to="/facility/fac-1"
              className="p-3 rounded-xl bg-[#eef6ed] flex items-center justify-between gap-3 hover:bg-[#e3eae2] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#1e5e3a] flex-shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">solar_power</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#161d18] truncate">{t('hub14Name')}</h4>
                  <p className="text-[11px] text-[#404941] truncate">{t('hub14Loc')}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full bg-[#86f8c2] text-[#00210f] text-[11px] font-bold block">
                  180 {t('cratesFree')}
                </span>
                <span className="text-[10px] text-[#404941] mt-0.5 block">2.0°C to 4.5°C</span>
              </div>
            </Link>

            {/* Hub 2 */}
            <Link
              to="/facility/fac-2"
              className="p-3 rounded-xl bg-[#eef6ed] flex items-center justify-between gap-3 hover:bg-[#e3eae2] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#1e5e3a] flex-shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">warehouse</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#161d18] truncate">{t('dindigulTerminal')}</h4>
                  <p className="text-[11px] text-[#404941] truncate">{t('bypassRoad')}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full bg-[#e9f0e8] text-[#404941] text-[11px] font-bold block">
                  42 {t('cratesFree')}
                </span>
                <span className="text-[10px] text-[#404941] mt-0.5 block">Grain &amp; Tuber Dry</span>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Batch QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#eef6ed] text-[#1e5e3a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#161d18]">Batch QR Pass</h3>
              <p className="text-xs text-[#404941] mt-1">Batch {activeBatch.batchCode} • {activeBatch.cropName}</p>
            </div>

            <div className="bg-[#eef6ed] p-4 rounded-xl inline-block border border-[#dde4dd]">
              <svg className="w-40 h-40 text-[#161d18]" fill="currentColor" viewBox="0 0 160 160">
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
                <rect height="8" rx="1.5" width="12" x="80" y="14" />
                <rect height="12" rx="1.5" width="8" x="74" y="26" />
                <rect height="16" rx="1.5" width="8" x="52" y="42" />
                <rect height="8" rx="1.5" width="16" x="68" y="42" />
                <rect height="8" rx="1.5" width="14" x="32" y="52" />
                <rect height="8" rx="1.5" width="16" x="130" y="52" />
                <rect height="8" rx="1.5" width="18" x="28" y="66" />
                <circle cx="80" cy="80" fill="white" r="16" />
                <circle cx="80" cy="80" fill="#1e5e3a" r="13" />
                <path d="M76 83C76 77 84 73 84 73C84 73 84 81 80 84C78 85.5 76 84.5 76 83Z" fill="white" />
              </svg>
              <div className="mt-2 text-xs font-mono font-bold text-[#1e5e3a]">PIN: 4892</div>
            </div>

            <p className="text-[11px] text-[#404941]">
              Scan at gate intake bridge or chamber bay for instant verification.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full h-11 bg-[#1e5e3a] text-white rounded-xl font-bold text-xs hover:bg-[#16462b]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
