import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const { getAIInsights, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const insights = getAIInsights('fac-1');

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
                  {isTa ? 'செயற்கை நுண்ணறிவு பகுப்பாய்வு & எச்சரிக்கைகள்' : 'AI Insights & Predictive Alerts'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FFFBF0] text-[#C8923A] border border-[#F0D590] text-[10px] font-bold">
                  AI-Assisted
                </span>
              </div>
              <p className="text-xs text-[#5B6660]">
                {isTa ? 'அறுவடை விலை உயர்வு கணிப்பு, அழுகல் தடுப்பு & கொள்ளளவு எச்சரிக்கைகள்' : 'Deterministic inventory safety rules + Mandi wholesale price econometric models'}
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
              AI recommendations are strictly advisory and provide decision support. AI never silently confirms/cancels bookings, alters physical inventory balances, or modifies financial charges without explicit human operator confirmation.
            </span>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="space-y-3">
          {insights.map((item) => {
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
      </div>
    </div>
  );
};
