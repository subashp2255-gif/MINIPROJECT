import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Snowflake,
  Package,
  Bell,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  User,
  ArrowRight
} from 'lucide-react';

export const FarmerHomePage: React.FC = () => {
  const { user, language, bookings, batches, dryProducts, notifications, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  // Active bookings count
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_storage');
  
  // Dry products summary
  const totalDryItems = dryProducts.length;
  const lowStockDryItems = dryProducts.filter((p) => p.status === 'low_stock').length;

  // Unread notifications
  const unreadNotifs = notifications.filter((n) => !n.read).slice(0, 2);

  // Active cold batch
  const activeColdBatch = batches[0] || {
    batchCode: '#TN-DDG-088',
    cropName: 'Tomato',
    cropNameTa: 'தக்காளி',
    cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    currentStockKg: 420,
    currentStockCrates: 17,
    currentTemp: 2.8,
    currentHumidity: 89,
    dayCurrent: 4,
    dayTotal: 10,
    status: 'in_storage',
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Top Banner & Profile Bar */}
      <div className="bg-[#134E35] text-white px-4 pt-5 pb-7 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-11 h-11 rounded-full border-2 border-[#A3E635] object-cover"
            />
            <div>
              <span className="text-[11px] font-medium text-[#A3E635] uppercase tracking-wider block">
                {isTa ? 'வணக்கம், உழவர்' : 'Welcome back'}
              </span>
              <h1 className="text-lg font-bold leading-tight">{user.name}</h1>
              <span className="text-xs text-white/70">{user.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-white" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-[#134E35]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Profile"
            >
              <User size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-3.5 sm:px-4 pt-4 space-y-5 sm:space-y-6 -mt-3">
        {/* =========================================================================
            SCREEN 6: TWO EQUALLY ACCESSIBLE SERVICE CARDS
            Card A: Cold Storage (Perishables)
            Card B: Enhanced Inventory Management (Dry Crops)
            ========================================================================= */}
        <section className="space-y-3" aria-label="Core Agriculture Services">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6660]">
              {isTa ? 'வேளாண் சேவைகள்' : 'Agricultural Services'}
            </span>
            <span className="text-[11px] font-semibold text-[#134E35] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
              {isTa ? 'தனித்தனி அமைப்புகள்' : 'Decoupled Modules'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* CARD A — COLD STORAGE */}
            <div className="card-dashboard p-5 border-t-4 border-t-[#134E35] flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#E7F5EE] text-[#134E35] flex items-center justify-center">
                    <Snowflake size={22} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#134E35] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                    <span>{activeBookings.length}</span>
                    <span>{isTa ? 'முன்பதிவுகள்' : 'Active'}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#0F3D2E]">
                    {isTa ? 'குளிர்பதன முன்பதிவு' : 'Cold Storage Booking'}
                  </h2>
                  <p className="text-xs text-[#5B6660] mt-1 leading-relaxed">
                    {isTa
                      ? 'குளிர்பதனம் தேவைப்படும் பழங்கள் மற்றும் காய்கறிகளை சேமிக்க முன்பதிவு செய்யவும்.'
                      : 'Book storage for fruits and vegetables that need cooling.'}
                  </p>
                </div>

                {/* Sub-metrics */}
                <div className="p-2.5 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] flex items-center justify-between text-xs">
                  <span className="text-[#5B6660]">{isTa ? 'சேமிக்கப்பட்ட காய்கறி:' : 'Stored Produce:'}</span>
                  <span className="font-bold text-[#1C2420]">420 kg · 2.8°C</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/discovery')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#134E35] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{isTa ? 'குளிர்பதனத்தைத் திறக்கவும்' : 'Open Cold Storage'}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/bookings')}
                  className="w-full py-1.5 text-center text-xs font-semibold text-[#134E35] hover:underline cursor-pointer"
                >
                  {isTa ? 'எனது முன்பதிவுகள் காண்க' : 'View My Bookings'}
                </button>
              </div>
            </div>

            {/* CARD B — INVENTORY MANAGEMENT */}
            <div className="card-dashboard p-5 border-t-4 border-t-[#C8923A] flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center">
                    <Package size={22} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C8923A] bg-[#C8923A]/15 px-2 py-0.5 rounded-full">
                    <span>{totalDryItems}</span>
                    <span>{isTa ? 'தானிய வகைகள்' : 'Dry Products'}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#1C2420]">
                    {isTa ? 'தானிய இருப்பு மேலாண்மை' : 'Enhanced Inventory Management'}
                  </h2>
                  <p className="text-xs text-[#5B6660] mt-1 leading-relaxed">
                    {isTa
                      ? 'உலர்ந்த தானியங்கள், பருப்பு மற்றும் நெல் வகைகளை பதிவு செய்து நிர்வகிக்கவும்.'
                      : 'Record and manage dry crops, grains and other stock.'}
                  </p>
                </div>

                {/* Sub-metrics */}
                <div className="p-2.5 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] flex items-center justify-between text-xs">
                  <span className="text-[#5B6660]">{isTa ? 'குறைந்த இருப்பு எச்சரிக்கை:' : 'Low Stock Alerts:'}</span>
                  <span className={`font-bold ${lowStockDryItems > 0 ? 'text-[#B5472B]' : 'text-[#14532D]'}`}>
                    {lowStockDryItems} {isTa ? 'பயிர்கள்' : 'Items'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/dry-inventory')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#A67527] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{isTa ? 'எனது இருப்பைத் திறக்கவும்' : 'Open My Inventory'}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/dry-inventory')}
                  className="w-full py-1.5 text-center text-xs font-semibold text-[#C8923A] hover:underline cursor-pointer"
                >
                  {isTa ? 'தானிய இருப்புப் பட்டியல் காண்க' : 'View Dry Stock Ledger'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. NOTIFICATIONS & RECENT ALERTS */}
        {unreadNotifs.length > 0 && (
          <section className="space-y-2.5" aria-label="Recent Alerts">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6660]">
                {isTa ? 'முக்கிய அறிவிப்புகள்' : 'Recent Notifications'}
              </span>
              <button
                type="button"
                onClick={() => navigate('/activity')}
                className="text-xs font-bold text-[#134E35] hover:underline cursor-pointer"
              >
                {isTa ? 'அனைத்தும் காண்க' : 'View all'}
              </button>
            </div>

            <div className="space-y-2">
              {unreadNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => navigate(n.linkUrl || '/activity')}
                  className="p-3.5 rounded-2xl bg-white border border-[#DFE4DC] hover:border-[#134E35] flex items-center justify-between gap-3 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E7F5EE] text-[#134E35] flex items-center justify-center flex-shrink-0">
                      <Bell size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1C2420] truncate">
                        {isTa ? n.titleTa : n.title}
                      </h4>
                      <p className="text-[11px] text-[#5B6660] truncate">
                        {isTa ? n.messageTa : n.message}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#94A3B8] flex-shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. CHAMBER TELEMETRY CARD */}
        <section
          onClick={() => navigate('/farmer/inventory')}
          className="card-dashboard p-4 sm:p-5 relative cursor-pointer"
          aria-label="Active Chamber Telemetry"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6660]">
              {isTa ? 'செயலில் உள்ள சேமிப்பக அறை' : 'Active Chamber Telemetry'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-semibold flex-shrink-0">
              <CheckCircle2 size={13} strokeWidth={2} />
              <span>{isTa ? 'சரியானது' : 'Optimal'}</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-[#1C2420] mt-1.5 leading-snug">
            {isTa ? 'உழவர் சூரிய மின் மையம் · அறை 1' : 'Uzhavar Solar Hub · Chamber 1'}
          </h3>

          <div className="my-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-hero text-3xl sm:text-4xl font-bold text-[#0F3D2E] leading-none">
                  {activeColdBatch.currentTemp ?? 2.8}
                </span>
                <span className="text-xl font-bold text-[#5B6660]">°C</span>
              </div>
              <span className="text-xs text-[#5B6660] font-medium mt-1 block">
                {isTa ? 'இலக்கு: 2.5°C முதல் 4.0°C வரை' : 'Target: 2.5°C to 4.0°C'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-[#C8923A]">89%</span>
              <span className="text-[10px] text-[#5B6660] block">{isTa ? 'ஈரப்பதம்' : 'Humidity'}</span>
            </div>
          </div>
        </section>

        {/* 4. MANDI PRICE FORECAST (ADVISORY AI) */}
        <section
          onClick={() => navigate('/ai-arbitrage')}
          className="card-dashboard p-4 sm:p-5 space-y-3 cursor-pointer"
          aria-label="Mandi Price Forecast"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-[#1C2420] truncate">
                  {isTa ? 'மண்டி விலை கணிப்பு (ஆலோசனை)' : 'Mandi Price Forecast (Advisory)'}
                </h3>
                <span className="text-[10px] text-[#5B6660] block truncate">
                  {isTa ? 'ஒட்டன்சத்திரம் சந்தை' : 'Oddanchatram APMC Market'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-xs font-bold flex-shrink-0">
              <TrendingUp size={13} strokeWidth={2} />
              <span>+58%</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-[#5B6660]">{isTa ? 'எதிர்பார்க்கப்படும் உச்ச விலை:' : 'Projected Peak:'}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-hero text-2xl sm:text-3xl font-bold text-[#C8923A]">₹38.50</span>
                <span className="text-xs text-[#5B6660]">/ kg</span>
              </div>
            </div>
            <span className="text-[11px] text-[#5B6660] text-right">
              {isTa ? 'வார இறுதி விலையேற்றம்' : 'Weekend Demand Surge'}
            </span>
          </div>
        </section>

        {/* 5. HELP & SUPPORT + PROFILE LINKS */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              showToast(isTa ? 'கிசான் இலவச உதவி மையம்: 1800-180-1551' : 'Kisan Helpline Toll-Free: 1800-180-1551', 'info');
            }}
            className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-2.5 text-left hover:bg-[#F7F4EC] transition-all cursor-pointer"
          >
            <HelpCircle size={18} className="text-[#134E35] flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#1C2420] block">{isTa ? 'உதவி மையம்' : 'Help & Support'}</span>
              <span className="text-[10px] text-[#5B6660]">1800-180-1551</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-2.5 text-left hover:bg-[#F7F4EC] transition-all cursor-pointer"
          >
            <User size={18} className="text-[#C8923A] flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#1C2420] block">{isTa ? 'சுயவிவரம்' : 'My Profile'}</span>
              <span className="text-[10px] text-[#5B6660]">{isTa ? 'அமைப்புகள் & மொழி' : 'Settings & Lang'}</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
