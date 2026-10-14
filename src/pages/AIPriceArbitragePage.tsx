import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, X } from 'lucide-react';

export const AIPriceArbitragePage: React.FC = () => {
  const { language, showToast } = useApp();
  const isTa = language === 'ta';

  const [timeHorizon, setTimeHorizon] = useState<'7' | '30'>('7');
  const [showTrendsModal, setShowTrendsModal] = useState(false);

  // 7-day vs 30-day chart points
  const data7 = [
    { day: isTa ? 'இன்று' : 'Today', price: 24, low: 24, high: 24 },
    { day: isTa ? 'நாள் 2' : 'D2', price: 26, low: 25, high: 28 },
    { day: isTa ? 'நாள் 3' : 'D3', price: 29, low: 27, high: 31 },
    { day: isTa ? 'நாள் 4' : 'D4', price: 33, low: 30, high: 35 },
    { day: isTa ? 'நாள் 5' : 'D5', price: 36, low: 34, high: 39 },
    { day: isTa ? 'நாள் 6' : 'D6', price: 38, low: 36, high: 41 },
    { day: isTa ? 'நாள் 7' : 'D7 (Peak)', price: 42, low: 39, high: 44 },
  ];

  const data30 = [
    { day: isTa ? 'வாரம் 1' : 'W1', price: 24, low: 24, high: 24 },
    { day: isTa ? 'வாரம் 2' : 'W2', price: 34, low: 31, high: 37 },
    { day: isTa ? 'வாரம் 3' : 'W3', price: 42, low: 38, high: 45 },
    { day: isTa ? 'வாரம் 4' : 'W4', price: 46, low: 42, high: 49 },
  ];

  const chartData = timeHorizon === '7' ? data7 : data30;

  const handleHoldStock = () => {
    showToast(isTa ? 'சேமிப்பு காலம் 5 நாட்கள் நீட்டிக்கப்பட்டது. லாப எச்சரிக்கை அமைக்கப்பட்டது!' : 'Stock held for 5 more days! Profit trigger activated.', 'success');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Arbitrage container */}
      <div className="px-4 pt-3 space-y-5">

        {/* 1. PLAIN-LANGUAGE SUMMARY BANNER */}
        <section
          className="card-heritage p-5 border-2 border-[#C8923A]/80 shadow-[0_8px_24px_rgba(200,146,58,0.12)] space-y-3"
          aria-label="Arbitrage Advice"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-semibold">
              <Sparkles size={13} className="text-[#C8923A]" />
              <span>{isTa ? 'செயற்கை நுண்ணறிவு ஆலோசனை' : 'AI recommendation'}</span>
            </span>
            <span className="text-xs font-bold text-[#14532D] flex items-center gap-1">
              <TrendingUp size={14} />
              <span>+58% {isTa ? 'லாபம்' : 'gain'}</span>
            </span>
          </div>

          <h2
            className={`text-xl font-bold text-[#0F3D2E] leading-snug ${
              isTa ? 'font-tamil-serif' : 'font-serif-hero'
            }`}
          >
            {isTa
              ? 'இன்னும் 5 நாட்கள் சேமித்தால் சுமார் ₹4,200 கூடுதல் லாபம்'
              : 'Hold 5 more days for about ₹4,200 more'}
          </h2>

          <p className="text-xs text-[#5B6660] leading-relaxed">
            {isTa
              ? 'திண்டுக்கல் மற்றும் ஒட்டன்சத்திரம் சந்தைகளில் வரத்து குறையும் என எதிர்பார்க்கப்படுகிறது. வார இறுதியில் விலை உச்சத்தை எட்டும்.'
              : 'Arrivals from Madurai will drop this weekend, creating high buyer demand at Oddanchatram wholesale mandi.'}
          </p>
        </section>

        {/* 2. PRICE FORECAST CHART WITH 7/30-DAY TOGGLE */}
        <section className="card-heritage p-5 space-y-4" aria-label="Price Forecast Chart">
          {/* Header Row: Current Spot Price & 7/30-day Segmented Toggle */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6660] block">
                {isTa ? 'தக்காளி உச்ச விலை கணிப்பு' : 'Projected peak price'}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif-hero text-[40px] font-bold text-[#C8923A] leading-none">
                  ₹42.00
                </span>
                <span className="text-xs font-semibold text-[#5B6660]">/ kg</span>
              </div>
            </div>

            {/* 7 / 30 day toggle */}
            <div className="bg-[#F7F4EC] p-1 rounded-full flex items-center border border-[#0F3D2E]/10">
              <button
                type="button"
                onClick={() => setTimeHorizon('7')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  timeHorizon === '7'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-[#5B6660]'
                }`}
              >
                7 {isTa ? 'நாள்' : 'Days'}
              </button>
              <button
                type="button"
                onClick={() => setTimeHorizon('30')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  timeHorizon === '30'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-[#5B6660]'
                }`}
              >
                30 {isTa ? 'நாள்' : 'Days'}
              </button>
            </div>
          </div>

          {/* Clean Line / Area Chart */}
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8923A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C8923A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#5B6660"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#F7F4EC' }}
                />
                <YAxis
                  stroke="#5B6660"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 4', 'dataMax + 4']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0F3D2E] text-white p-2 rounded-xl text-xs shadow-lg">
                          <span className="font-bold">₹{payload[0].value}/kg</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  fill="url(#goldGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#C8923A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#C8923A' }}
                  activeDot={{ r: 6, fill: '#0F3D2E', stroke: '#C8923A', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6660] pt-1 border-t border-[#F7F4EC]">
            <span>{isTa ? 'இன்றைய விலை: ₹24/kg' : 'Today spot: ₹24/kg'}</span>
            <span className="font-semibold text-[#14532D]">
              {isTa ? 'சேமிப்பு செலவு: ₹2.90/நாள்' : 'Storage cost: ₹2.90/day'}
            </span>
          </div>
        </section>

        {/* 3. PRIMARY "HOLD STOCK" BUTTON & "SEE TRENDS" TEXT LINK */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleHoldStock}
            className="btn-primary w-full"
          >
            {isTa ? 'சரக்கை சேமிப்பில் வை' : 'Hold stock'}
          </button>
          <button
            type="button"
            onClick={() => setShowTrendsModal(true)}
            className="btn-text-link"
          >
            {isTa ? 'சந்தை போக்குகளைக் காண்க' : 'See trends'}
          </button>
        </div>

      </div>

      {/* Sub-screen Drawer: Trends & Mandi Comparison */}
      {showTrendsModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C2420]">
                  {isTa ? 'மண்டி விலை ஒப்பீடு' : 'Mandi price comparison'}
                </h3>
                <span className="text-xs text-[#5B6660]">
                  {isTa ? 'நேரலை அரசு மண்டி பதிவேடு' : 'Live regulated wholesale mandis'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrendsModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] text-[#5B6660] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#F7F4EC] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1C2420]">
                    {isTa ? 'ஒட்டன்சத்திரம் மண்டி' : 'Oddanchatram Wholesale'}
                  </h4>
                  <span className="text-xs text-[#5B6660]">3.2 km • {isTa ? 'அதிக தேவை' : 'High Demand'}</span>
                </div>
                <span className="font-serif-hero text-lg font-bold text-[#C8923A]">₹38.50/kg</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F4EC] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1C2420]">
                    {isTa ? 'மதுரை மாட்டுத்தாவணி' : 'Madurai Mattuthavani'}
                  </h4>
                  <span className="text-xs text-[#5B6660]">68 km • {isTa ? 'மிதமான தேவை' : 'Moderate'}</span>
                </div>
                <span className="font-serif-hero text-lg font-bold text-[#5B6660]">₹34.00/kg</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F4EC] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1C2420]">
                    {isTa ? 'பழனி ஒழுங்குமுறை கூடம்' : 'Palani Regulated'}
                  </h4>
                  <span className="text-xs text-[#5B6660]">24 km • {isTa ? 'வழக்கமான தேவை' : 'Regular'}</span>
                </div>
                <span className="font-serif-hero text-lg font-bold text-[#5B6660]">₹32.50/kg</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTrendsModal(false)}
              className="btn-primary w-full"
            >
              {isTa ? 'முடிந்தது' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
