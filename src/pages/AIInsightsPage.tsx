import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { demandForecastService } from '../services/demandForecastService';
import { inventoryForecastService } from '../services/inventoryForecastService';
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldCheck,
  Package,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const { facilities, bookings, dryProducts, getAIInsights, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [activeTab, setActiveTab] = useState<'demand' | 'inventory' | 'market'>('demand');

  const baseInsights = getAIInsights('fac-1');
  const demandResult = useMemo(
    () => demandForecastService.generateDemandForecast(bookings, facilities),
    [bookings, facilities]
  );
  const inventoryResult = useMemo(
    () => inventoryForecastService.analyzeInventory(dryProducts),
    [dryProducts]
  );

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/owner/inventory')}
              className="w-9 h-9 rounded-xl bg-white border border-[#DFE4DC] flex items-center justify-center text-[#14532D] hover:bg-[#F7F4EC]"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                  {isTa ? 'செயற்கை நுண்ணறிவு பகுப்பாய்வு மையம்' : 'AI Intelligence & Predictive Analytics'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FFFBF0] text-[#C8923A] border border-[#F0D590] text-[10px] font-bold">
                  Decision Support
                </span>
              </div>
              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? 'தேவை கணிப்பு, தானிய பயன்பாடு & ஒழுங்கின்மை ஆய்வு'
                  : 'Demand forecasting, consumption burn-down & statistical anomaly detection'}
              </p>
            </div>
          </div>
        </div>

        {/* Non-Negotiable Invariant Banner */}
        <div className="p-3.5 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] flex items-start gap-2.5 text-xs text-[#14532D]">
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-[#14532D]" />
          <div>
            <span className="font-bold block">Strict Non-Autonomous Architecture Guarantee</span>
            <span className="text-[11px] text-[#246A42]">
              AI recommendations are strictly advisory decision support. AI never silently confirms/cancels bookings, alters physical inventory balances, or modifies financial charges without explicit human operator confirmation.
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#DFE4DC] pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('demand')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'demand'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            <TrendingUp size={14} />
            <span>{isTa ? '1. குளிர் கிடங்கு தேவை' : '1. Cold Storage Demand'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            <Package size={14} />
            <span>
              {isTa ? '2. தானிய இருப்பு & ஒழுங்கின்மை' : '2. Inventory & Anomalies'}
              {inventoryResult.anomalies.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[9px]">
                  {inventoryResult.anomalies.length}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'market'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            <Sparkles size={14} />
            <span>{isTa ? '3. சந்தை விலை & தரம்' : '3. Mandi Market & Spoilage'}</span>
          </button>
        </div>

        {/* TAB 1: COLD STORAGE DEMAND FORECASTING */}
        {activeTab === 'demand' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EEF6ED] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#161D18]">
                    {isTa ? 'குளிர்பதனக் கிடங்கு தேவை கணிப்பு (14 நாட்கள்)' : 'Cold Storage Demand Forecast (14 Days)'}
                  </h2>
                  <p className="text-xs text-[#5B6660]">
                    Model: {demandResult.modelVersion} • Split: Chronological (70/30)
                  </p>
                </div>
                <span className="text-[10px] text-[#5B6660]">
                  Generated: {new Date(demandResult.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!demandResult.hasSufficientData ? (
                <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#F0D590] space-y-2">
                  <div className="flex items-start gap-2 text-xs text-[#8C6218]">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {isTa ? 'வரலாற்று தரவு போதாது (< 5 சுழற்சிகள்)' : 'Insufficient Historical Data (< 5 Booking Cycles)'}
                      </span>
                      <p className="text-[11px] text-[#704F12] mt-0.5">
                        {isTa
                          ? `கணினியில் ${demandResult.sampleCount} முன்பதிவு பதிவுகள் மட்டுமே உள்ளன. தவறான கணிப்புகளைத் தவிர்த்து, உண்மையான கொள்ளளவு விவரம் கீழே தரப்பட்டுள்ளது.`
                          : `Currently ${demandResult.sampleCount} recorded booking cycle(s) in system. Displaying verified facility baseline rather than simulated predictions.`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                demandResult.evaluation && (
                  <div className="p-3 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#14532D]">
                      Validation: Train({demandResult.evaluation.trainSize}) / Test({demandResult.evaluation.testSize})
                    </span>
                    <span className="text-[#246A42]">
                      Model MAE: <strong>{demandResult.evaluation.mae} kg</strong> vs Baseline MAE: <strong>{demandResult.evaluation.baselineMae} kg</strong>
                    </span>
                  </div>
                )
              )}

              {/* Facility Capacity Pressure Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {demandResult.facilityPressures.map((p) => (
                  <div key={p.facilityId} className="p-4 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#14532D]">{p.facilityName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.pressureLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {p.pressureLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#5B6660]">Projected Occupancy:</span>
                        <span className="font-bold text-[#1C2420]">{p.projectedOccupancyPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#14532D] rounded-full transition-all"
                          style={{ width: `${p.projectedOccupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#5B6660] leading-relaxed">
                      {isTa ? p.advisoryMessageTa : p.advisoryMessage}
                    </p>
                  </div>
                ))}
              </div>

              {/* Limitations note */}
              <div className="text-[10px] text-[#8C9690] space-y-1 pt-2 border-t border-[#EEF6ED]">
                <span className="font-bold block uppercase tracking-wider text-[#5B6660]">Model Limitations:</span>
                {demandResult.limitations.map((lim, idx) => (
                  <p key={idx}>• {lim}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY BURNDOWN & ANOMALIES */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Anomalies alert banner */}
            {inventoryResult.anomalies.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-red-800 block">
                  {isTa ? 'அசாதாரண வெளியீடுகள் ஆய்வு தேவை' : 'Statistical Anomalies Detected for Operator Review'}
                </span>
                {inventoryResult.anomalies.map((anom) => (
                  <div key={anom.anomalyId} className="p-4 rounded-2xl bg-red-50/40 border border-red-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900">{anom.productName} ({anom.type})</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase">
                        {anom.severity} Outlier
                      </span>
                    </div>
                    <p className="text-[#5B6660]">{isTa ? anom.reasonTa : anom.reasonEn}</p>
                    <p className="font-semibold text-[#14532D]">Action: {isTa ? anom.reviewActionTa : anom.reviewAction}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#E7F5EE] border border-[#AFF2C2] text-xs text-[#14532D] flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>All recent inventory dispatches are within standard statistical variance. No anomalies detected.</span>
              </div>
            )}

            {/* Inventory Burn-Down Forecasts */}
            <div className="bg-white rounded-3xl p-5 border border-[#DFE4DC] shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-[#161D18]">
                {isTa ? 'தானிய இருப்பு பயன்பாடு & தீர்வு காலம்' : 'Dry Inventory Consumption Burn-Down'}
              </h2>
              <div className="space-y-2.5">
                {inventoryResult.forecasts.map((f) => (
                  <div key={f.productId} className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-[#1C2420]">{f.productName}</span>
                        <span className="text-[10px] text-[#5B6660] block">
                          Safety: {f.lowStockThreshold} {f.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-[#8C9690] block">Actual Balance</span>
                        <span className="font-bold text-base text-[#14532D]">{f.currentStock} {f.unit}</span>
                      </div>
                    </div>

                    {f.isSufficientData && (
                      <div className="grid grid-cols-3 gap-2 text-center py-1">
                        <div className="bg-white p-2 rounded-xl border border-[#DFE4DC]">
                          <span className="text-[9px] text-[#5B6660] block">+7 Days</span>
                          <span className="font-bold text-[#1C2420]">{f.projectedStock7d} {f.unit}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-[#DFE4DC]">
                          <span className="text-[9px] text-[#5B6660] block">+14 Days</span>
                          <span className="font-bold text-[#1C2420]">{f.projectedStock14d} {f.unit}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-[#DFE4DC]">
                          <span className="text-[9px] text-[#5B6660] block">+30 Days</span>
                          <span className="font-bold text-[#1C2420]">{f.projectedStock30d} {f.unit}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-[#246A42]">
                      {isTa ? f.advisoryNoteTa : f.advisoryNoteEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANDI MARKET & SPOILAGE */}
        {activeTab === 'market' && (
          <div className="space-y-3">
            {baseInsights.map((item) => {
              const isWarning = item.severity === 'warning';
              const isCritical = item.severity === 'critical';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs space-y-3 ${
                    isCritical
                      ? 'border-red-300 bg-red-50/10'
                      : isWarning
                      ? 'border-amber-300 bg-amber-50/10'
                      : 'border-[#DFE4DC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-100 text-red-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#E7F5EE] text-[#14532D]'
                      }`}
                    >
                      {isCritical ? <AlertTriangle size={12} /> : isWarning ? <Clock size={12} /> : <TrendingUp size={12} />}
                      <span>{item.category.replace('_', ' ')}</span>
                    </span>

                    <span className="text-[10px] text-[#5B6660] font-mono">
                      Model Confidence: <strong>{(item.confidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#161D18]">{item.title}</h3>
                    <p className="text-xs text-[#5B6660] mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#5B6660] block">Recommended Action</span>
                    <p className="font-semibold text-[#14532D]">{item.recommendedAction}</p>
                    <span className="text-[10px] text-[#8C9690] block mt-1">Data Source: {item.dataSource}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
