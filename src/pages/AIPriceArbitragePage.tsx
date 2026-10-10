import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

interface CropOption {
  id: string;
  name: string;
  nameTa: string;
  variety: string;
  varietyTa: string;
  todayPrice: number;
  projectedPriceDay7: number;
  projectedPriceMax: number;
  dailyStorageRateCrate: number;
  icon: string;
}

const CROPS: CropOption[] = [
  {
    id: 'tomato',
    name: 'Tomato (Hybrid)',
    nameTa: 'தக்காளி (ஹைப்ரிட்)',
    variety: 'Shivam Variety',
    varietyTa: 'சிவம் ரகம்',
    todayPrice: 24,
    projectedPriceDay7: 38,
    projectedPriceMax: 42,
    dailyStorageRateCrate: 2.9,
    icon: 'nutrition',
  },
  {
    id: 'potato',
    name: 'Potato (Jyoti)',
    nameTa: 'உருளைக்கிழங்கு',
    variety: 'Kufri Jyoti A-Grade',
    varietyTa: 'குப்ரி ஜோதி தரம் A',
    todayPrice: 28,
    projectedPriceDay7: 39,
    projectedPriceMax: 44,
    dailyStorageRateCrate: 3.2,
    icon: 'spa',
  },
  {
    id: 'onion',
    name: 'Small Onion (Shallots)',
    nameTa: 'சின்ன வெங்காயம்',
    variety: 'CO-4 Perambalur',
    varietyTa: 'கோ-4 பெரம்பலூர்',
    todayPrice: 42,
    projectedPriceDay7: 64,
    projectedPriceMax: 70,
    dailyStorageRateCrate: 3.0,
    icon: 'eco',
  },
];

const MANDIS = [
  { id: 'oddanchatram', name: 'Oddanchatram & Dindigul Central', nameTa: 'ஒட்டன்சத்திரம் & திண்டுக்கல்' },
  { id: 'madurai', name: 'Madurai Mattuthavani Wholesale', nameTa: 'மதுரை மாட்டுத்தாவணி சந்தை' },
  { id: 'palani', name: 'Palani Regulated Market', nameTa: 'பழனி ஒழுங்குமுறை விற்பனைக்கூடம்' },
];

export const AIPriceArbitragePage: React.FC = () => {
  const { language } = useApp();
  const [selectedCrop, setSelectedCrop] = useState<CropOption>(CROPS[0]);
  const [selectedMandi, setSelectedMandi] = useState(MANDIS[0]);
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 30>(7);
  const [batchWeightKg, setBatchWeightKg] = useState<number>(1000);

  // Generate chart data dynamically based on selection
  const chartData = [
    { day: 'Day 1 (Today)', spot: selectedCrop.todayPrice, lower: selectedCrop.todayPrice, upper: selectedCrop.todayPrice, cost: 0.12 },
    { day: 'Day 2', spot: selectedCrop.todayPrice + 1.5, lower: selectedCrop.todayPrice, upper: selectedCrop.todayPrice + 3, cost: 0.24 },
    { day: 'Day 3', spot: selectedCrop.todayPrice + 3.8, lower: selectedCrop.todayPrice + 2, upper: selectedCrop.todayPrice + 6, cost: 0.36 },
    { day: 'Day 4', spot: selectedCrop.todayPrice + 7.0, lower: selectedCrop.todayPrice + 4, upper: selectedCrop.todayPrice + 10, cost: 0.48 },
    { day: 'Day 5', spot: selectedCrop.todayPrice + 10.5, lower: selectedCrop.todayPrice + 7, upper: selectedCrop.todayPrice + 13, cost: 0.60 },
    { day: 'Day 6', spot: selectedCrop.todayPrice + 13.0, lower: selectedCrop.todayPrice + 9, upper: selectedCrop.todayPrice + 16, cost: 0.72 },
    { day: 'Day 7 (Peak)', spot: selectedCrop.projectedPriceDay7, lower: selectedCrop.projectedPriceDay7 - 3, upper: selectedCrop.projectedPriceMax, cost: 0.84 },
  ];

  // Simulation calculations
  const crates = Math.ceil(batchWeightKg / 25);
  const todayRevenue = batchWeightKg * selectedCrop.todayPrice;
  const avgPeakPrice = (selectedCrop.projectedPriceDay7 + selectedCrop.projectedPriceMax) / 2;
  const day7Revenue = batchWeightKg * avgPeakPrice;
  const storageCost = crates * selectedCrop.dailyStorageRateCrate * horizonDays;
  const netProfit = day7Revenue - todayRevenue - storageCost;
  const percentGain = Math.round(((day7Revenue - todayRevenue) / todayRevenue) * 100);

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* 1. Header & Crop/Mandi Selector Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex p-1.5 rounded-lg bg-[#1e5e3a] text-white">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#161d18]">
                  {language === 'ta' ? 'AI விலை & சேமிப்பு ஆலோசனை' : 'AI Price & Storage Advisory'}
                </span>
                <span className="text-[11px] text-[#404941]">
                  {language === 'ta' ? 'விலை கணிப்பு மற்றும் சேமிப்பு லாபம்' : 'Predictive Price & Arbitrage Margin'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86f8c2] text-[#00210f] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse"></span>
              <span>94% Accuracy</span>
            </span>
          </div>

          {/* Crop & Mandi Selectors Row */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Crop Selector Button */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#eef6ed] border border-[#dde4dd]">
              <div className="w-9 h-9 rounded-full bg-[#ffdcc6] flex items-center justify-center shrink-0 text-[#844000]">
                <span className="material-symbols-outlined text-[20px]">{selectedCrop.icon}</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] text-[#404941] uppercase tracking-wider font-semibold">CROP</span>
                <select
                  value={selectedCrop.id}
                  onChange={(e) => {
                    const found = CROPS.find((c) => c.id === e.target.value);
                    if (found) setSelectedCrop(found);
                  }}
                  className="text-xs font-bold text-[#161d18] bg-transparent outline-hidden cursor-pointer truncate"
                >
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'ta' ? c.nameTa : c.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#404941] truncate">{selectedCrop.variety}</span>
              </div>
            </div>

            {/* Mandi Selector Button */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#eef6ed] border border-[#dde4dd]">
              <div className="w-9 h-9 rounded-full bg-[#aff2c2] flex items-center justify-center shrink-0 text-[#1e5e3a]">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] text-[#404941] uppercase tracking-wider font-semibold">MANDI</span>
                <select
                  value={selectedMandi.id}
                  onChange={(e) => {
                    const found = MANDIS.find((m) => m.id === e.target.value);
                    if (found) setSelectedMandi(found);
                  }}
                  className="text-xs font-bold text-[#161d18] bg-transparent outline-hidden cursor-pointer truncate"
                >
                  {MANDIS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {language === 'ta' ? m.nameTa : m.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#404941] truncate">TN Regulated APMC</span>
              </div>
            </div>
          </div>

          {/* Time Horizon Pill Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#404941] font-semibold">Forecast Horizon:</span>
            <div className="flex items-center gap-1 bg-[#e9f0e8] rounded-full p-0.5 border border-[#c0c9bf]/30">
              <button
                onClick={() => setHorizonDays(7)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  horizonDays === 7 ? 'bg-[#1e5e3a] text-white shadow-xs' : 'text-[#404941]'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setHorizonDays(14)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  horizonDays === 14 ? 'bg-[#1e5e3a] text-white shadow-xs' : 'text-[#404941]'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => setHorizonDays(30)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  horizonDays === 30 ? 'bg-[#1e5e3a] text-white shadow-xs' : 'text-[#404941]'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        {/* 2. Price Arbitrage Calculator (Store vs Sell Now) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#86f8c2]/30 blur-2xl pointer-events-none"></div>

          {/* Section Title & Verdict Badge */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#161d18]">Arbitrage Profit Calculator</span>
              <span className="text-xs text-[#404941]">Analysis: Cold Storage vs. Sell Today</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#86f8c2] text-[#00734e] flex items-center gap-1 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">recommend</span>
              <span>Store Recommended</span>
            </div>
          </div>

          {/* Comparative Stat Cards */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Sell Today Card */}
            <div className="p-3 rounded-xl bg-[#eef6ed] flex flex-col justify-between border border-[#dde4dd]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#404941]">Today's Price</span>
                <span className="material-symbols-outlined text-[#707971] text-[18px]">trending_flat</span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold text-[#161d18]">
                  ₹{selectedCrop.todayPrice}
                  <span className="text-xs font-normal text-[#404941]"> / kg</span>
                </div>
                <span className="text-[11px] text-[#ba1a1a] font-medium">Glut Supply Dip</span>
              </div>
            </div>

            {/* Projected Peak Price */}
            <div className="p-3 rounded-xl bg-[#86f8c2]/30 flex flex-col justify-between border border-[#86f8c2]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#00734e] font-semibold">Day 7 Forecast</span>
                <span className="material-symbols-outlined text-[#006c49] text-[20px]">trending_up</span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold text-[#1e5e3a]">
                  ₹{selectedCrop.projectedPriceDay7} - ₹{selectedCrop.projectedPriceMax}
                  <span className="text-xs font-normal text-[#404941]"> / kg</span>
                </div>
                <span className="text-[11px] text-[#006c49] font-bold">+{percentGain}% Expected Rise</span>
              </div>
            </div>
          </div>

          {/* Storage Fee Pill */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#eef6ed] border border-[#dde4dd]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1e5e3a] text-[18px]">ac_unit</span>
              <span className="text-xs text-[#161d18]">Daily Cold Chamber Rental Fee</span>
            </div>
            <span className="text-xs font-bold text-[#161d18]">
              ₹{selectedCrop.dailyStorageRateCrate}
              <span className="text-[11px] text-[#404941] font-normal"> / crate (~₹0.12/kg)</span>
            </span>
          </div>

          {/* Interactive Weight Slider */}
          <div className="p-3 rounded-xl bg-gray-50 border border-[#dde4dd]">
            <div className="flex justify-between items-center text-xs font-bold text-[#161d18] mb-1">
              <span>Lot Weight Simulation:</span>
              <span className="text-[#1e5e3a]">{batchWeightKg.toLocaleString()} kg ({crates} crates)</span>
            </div>
            <input
              type="range"
              min={200}
              max={5000}
              step={100}
              value={batchWeightKg}
              onChange={(e) => setBatchWeightKg(Number(e.target.value))}
              className="w-full accent-[#1e5e3a] cursor-pointer"
            />
          </div>

          {/* Simulation Detail Drawer (for entered lot) */}
          <div className="p-4 rounded-xl bg-[#1e5e3a] text-white flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94d5a8] uppercase tracking-wider font-bold">
                {batchWeightKg} KG BATCH SIMULATION
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#aff2c2]/20 text-[#aff2c2] font-bold">
                {horizonDays}-Day Hold
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-emerald-100">
              <div className="flex items-center justify-between">
                <span>Sell Today Revenue:</span>
                <span className="font-semibold text-white">₹{todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sell Day 7 Revenue (@ ₹{avgPeakPrice.toFixed(0)} avg):</span>
                <span className="font-semibold text-white">₹{day7Revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#ffdcc6]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">remove_circle_outline</span>
                  <span>Cold Storage &amp; Handling Cost:</span>
                </span>
                <span className="font-semibold">-₹{storageCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 mt-1 flex items-center justify-between border-t border-emerald-700/60">
              <div className="flex flex-col">
                <span className="text-xs text-[#94d5a8]">Net Additional Profit by Storing</span>
                <span className="text-lg sm:text-xl font-extrabold text-[#86f8c2] leading-tight">
                  +₹{netProfit.toLocaleString()} Extra Gain
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recharts AI Price Trajectory & Confidence Interval Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#161d18]">Predicted Price Trajectory (₹/kg)</h3>
              <p className="text-[11px] text-[#404941]">95% Bayesian confidence band &amp; storage cost line</p>
            </div>
            <span className="text-[10px] text-[#006c49] font-bold bg-[#eef6ed] px-2 py-0.5 rounded-md">
              Oddanchatram APMC
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9f0e8" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#404941' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#404941' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#86f8c2"
                  fillOpacity={0.3}
                  name="Upper Band"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#f4fbf3"
                  fillOpacity={0.8}
                  name="Lower Band"
                />
                <Line
                  type="monotone"
                  dataKey="spot"
                  stroke="#1e5e3a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1e5e3a' }}
                  name="Mandi Price (₹/kg)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Bilingual AI Agronomist Chat Advisor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e5e3a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#161d18]">AI Kisan Agronomist Advice</h3>
              <p className="text-[10px] text-[#404941]">Tamil Nadu Agricultural University Cold Chain Model</p>
            </div>
          </div>

          <div className="bg-[#eef6ed] rounded-xl p-3 text-xs text-[#161d18] leading-relaxed border border-[#dde4dd]">
            <p className="font-semibold text-[#1e5e3a] mb-1">
              {language === 'ta' ? 'அறுவடை ஆலோசனை:' : 'Storage Strategy Recommendation:'}
            </p>
            <p>
              {language === 'ta'
                ? 'தற்போது ஒட்டன்சத்திரத்தில் தினசரி வரத்து 4,200 பெட்டிகள் உள்ளது. அடுத்த 5 நாட்களில் சப்ளை 30% குறையும் என்பதால் தக்காளிக்கு 7-10 நாட்கள் குளிர்சாதன சேமிப்பு பரிந்துரைக்கப்படுகிறது. 2.5°C முதல் 4°C வெப்பநிலையில் வைக்கவும்.'
                : 'Current Oddanchatram arrival volume is elevated due to neighboring taluk harvests. Local inflows will decline in 4 days. Storing hybrid tomatoes for 7–10 days at 2.8°C will protect margins and unlock a net profit arbitrage of ~₹13.7k per tonne.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
