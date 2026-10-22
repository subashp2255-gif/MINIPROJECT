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
  MapPin,
  ArrowRight,
  AlertTriangle,
  Truck,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { formatPlural } from '../lib/formatters';

export const FarmerHomePage: React.FC = () => {
  const { user, language, bookings, batches, dryProducts, notifications } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  // Active bookings count
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_storage');

  // Dry products summary
  const totalDryItems = dryProducts.length;
  const lowStockDryItems = dryProducts.filter((p) => p.status === 'low_stock').length;

  // Unread notifications (top 2)
  const recentNotifs = notifications.slice(0, 2);

  // Active cold batch telemetry
  const activeColdBatch = batches[0] || {
    batchCode: '#TN-DDG-088',
    cropName: 'Tomato',
    cropNameTa: 'தக்காளி',
    currentStockKg: 420,
    currentStockCrates: 17,
    currentTemp: 2.8,
    currentHumidity: 89,
    status: 'in_storage',
  };

  // Time-based greeting (never "Welcome back")
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isTa ? 'காலை வணக்கம்' : 'Good morning';
    if (hour < 17) return isTa ? 'மதிய வணக்கம்' : 'Good afternoon';
    return isTa ? 'மாலை வணக்கம்' : 'Good evening';
  };

  return (
    <div className="w-full pb-28 text-[#1C2420] select-none">
      {/* 8px space from 56px sticky header */}
      <div className="pt-2 px-4 space-y-6">

        {/* =========================================================================
            MERGED HERO CARD: One Card, 16px side margin, radius 24, Forest Gradient
            ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14532D] to-[#0F3D2E] text-white p-5 shadow-[0_12px_32px_rgba(15,61,46,0.18)]">
          {/* Subtle leaf contour texture (6% opacity) */}
          <div className="absolute inset-0 bg-leaf-pattern opacity-60 pointer-events-none" />

          <div className="relative z-10 flex flex-col space-y-4">
            {/* Top row: Greeting, Name, and Location */}
            <div>
              <span className="text-xs font-medium text-white/80 block leading-tight">
                {getGreeting()}
              </span>
              <h1 className="text-[22px] font-bold text-white tracking-tight mt-0.5 leading-snug font-ui truncate">
                {user?.name || (isTa ? 'முருகன் எஸ்.' : 'Murugan S.')}
              </h1>
              {/* Location row: Map pin + text on ONE line with ellipsis */}
              <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs">
                <MapPin size={13} className="text-[#AFF2C2] shrink-0" />
                <span className="truncate max-w-[280px]">
                  {isTa ? 'ஒட்டன்சத்திரம், திண்டுக்கல் · 3 கி.மீ மையம்' : 'Oddanchatram, Dindigul · 3 km from hub'}
                </span>
              </div>
            </div>

            {/* Thin Divider */}
            <div className="w-full h-px bg-white/15" />

            {/* 3-Up Status Strip (tappable numbers and 12px labels) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/farmer/bookings')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-left cursor-pointer"
                aria-label="Active Bookings"
              >
                <span className="font-serif-hero text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                  {activeBookings.length}
                </span>
                <span className="text-[12px] text-white/80 mt-1 leading-tight font-medium">
                  {isTa ? 'செயலில் முன்பதிவு' : formatPlural(activeBookings.length, 'booking', 'bookings')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/farmer/dry-inventory')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-left cursor-pointer"
                aria-label="Low Stock Items"
              >
                <span className={`font-serif-hero text-xl sm:text-2xl font-bold tabular-nums leading-none ${lowStockDryItems > 0 ? 'text-[#FFD7C2]' : 'text-white'}`}>
                  {lowStockDryItems}
                </span>
                <span className="text-[12px] text-white/80 mt-1 leading-tight font-medium">
                  {isTa ? 'குறைந்த இருப்பு' : formatPlural(lowStockDryItems, 'low-stock item', 'low-stock items')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/farmer/inventory')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-left cursor-pointer"
                aria-label="Active Chamber Temperature"
              >
                <span className="font-serif-hero text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                  {activeColdBatch.currentTemp ?? 2.8}°C
                </span>
                <span className="text-[12px] text-white/80 mt-1 leading-tight font-medium">
                  {isTa ? 'குளிர்பதன அறை' : 'chamber'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SERVICES SECTION: 24px space from hero card, "Services" heading (14px/600)
            ========================================================================= */}
        <section className="space-y-3" aria-label="Services">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#5B6660] tracking-wide">
              {isTa ? 'சேவைகள்' : 'Services'}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* CARD 1: COLD STORAGE */}
            <Card padding="md" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E7F5EE] text-[#14532D] flex items-center justify-center shrink-0">
                    <Snowflake size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1C2420] font-ui leading-tight">
                      {isTa ? 'குளிர்பதன சேமிப்பகம்' : 'Cold Storage'}
                    </h3>
                    <p className="text-xs text-[#5B6660] mt-0.5 leading-snug line-clamp-1">
                      {isTa
                        ? 'அழுகக்கூடிய காய்கறிகள், பழங்களுக்கான சூரிய மின் குளிரூட்டி'
                        : 'Solar cold storage for fruits, vegetables & flowers'}
                    </p>
                  </div>
                </div>
                <Tag variant="success" dot>
                  {isTa ? `${activeBookings.length} செயலில்` : `${activeBookings.length} active`}
                </Tag>
              </div>

              {/* Stat row - cleanly aligned, simple key-value readout without fake-button box */}
              <div className="pt-2 border-t border-[#DFE4DC]/60 flex items-center justify-between text-xs">
                <span className="text-[#5B6660]">
                  {isTa ? 'சேமிக்கப்பட்ட விளைபொருள்' : 'Stored produce'}
                </span>
                <span className="font-semibold text-[#1C2420] tabular-nums">
                  420&nbsp;kg stored · 2.8&nbsp;°C
                </span>
              </div>

              {/* Action Buttons: 1 primary CTA + 1 tertiary link */}
              <div className="pt-1 space-y-1.5">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                  onClick={() => navigate('/discovery')}
                >
                  {isTa ? 'குளிர்பதன முன்பதிவு' : 'Book Cold Storage'}
                </Button>
                <Button
                  variant="tertiary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/farmer/bookings')}
                >
                  {isTa ? 'எனது முன்பதிவுகள் காண்க' : 'View My Bookings'}
                </Button>
              </div>
            </Card>

            {/* CARD 2: DRY INVENTORY */}
            <Card padding="md" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#8C5D17] flex items-center justify-center shrink-0">
                    <Package size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1C2420] font-ui leading-tight">
                      {isTa ? 'தானிய இருப்பு மேலாண்மை' : 'Dry Inventory'}
                    </h3>
                    <p className="text-xs text-[#5B6660] mt-0.5 leading-snug line-clamp-1">
                      {isTa
                        ? 'நெல், பருப்பு, கோதுமை, தானிய வகைகளின் பதிவு'
                        : 'Farm stock tracking for paddy, pulses, wheat & millets'}
                    </p>
                  </div>
                </div>
                <Tag variant={lowStockDryItems > 0 ? 'warning' : 'success'} dot>
                  {isTa ? `${totalDryItems} பயிர்கள்` : formatPlural(totalDryItems, 'item', 'items')}
                </Tag>
              </div>

              {/* Stat row - cleanly aligned, simple key-value readout without fake-button box */}
              <div className="pt-2 border-t border-[#DFE4DC]/60 flex items-center justify-between text-xs">
                <span className="text-[#5B6660]">
                  {isTa ? 'இருப்பு நிலை' : 'Inventory status'}
                </span>
                <span className={`font-semibold tabular-nums ${lowStockDryItems > 0 ? 'text-[#C2410C]' : 'text-[#14532D]'}`}>
                  {lowStockDryItems > 0
                    ? `${lowStockDryItems} low-stock item`
                    : (isTa ? 'அனைத்தும் போதுமானது' : 'All items optimal')}
                </span>
              </div>

              {/* Action Buttons: 1 primary CTA + 1 tertiary link (no gold fills) */}
              <div className="pt-1 space-y-1.5">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                  onClick={() => navigate('/farmer/dry-inventory')}
                >
                  {isTa ? 'தானிய இருப்பு திறக்கவும்' : 'Manage Dry Inventory'}
                </Button>
                <Button
                  variant="tertiary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/farmer/dry-inventory')}
                >
                  {isTa ? 'இருப்புப் பதிவேடு காண்க' : 'View Stock Ledger'}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            CHAMBER TELEMETRY & MANDI PRICE ADVISORY FORECAST
            ========================================================================= */}
        <section className="space-y-4">
          {/* Chamber Telemetry: Humidity uses neutral text, not gold */}
          <Card
            padding="md"
            onClick={() => navigate('/farmer/inventory')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#5B6660] uppercase tracking-wider">
                {isTa ? 'செயலில் உள்ள குளிர்பதன அறை' : 'Active Chamber Telemetry'}
              </span>
              <Tag variant="success" icon={<CheckCircle2 size={13} strokeWidth={2.5} />}>
                {isTa ? 'சரியானது' : 'Optimal'}
              </Tag>
            </div>

            <h3 className="text-base font-semibold text-[#1C2420] mt-2 font-ui">
              {isTa ? 'உழவர் சூரிய மின் மையம் · அறை 1' : 'Uzhavar Solar Hub · Chamber 1'}
            </h3>

            <div className="my-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif-hero text-3xl sm:text-4xl font-bold text-[#0F3D2E] leading-none tabular-nums">
                    {activeColdBatch.currentTemp ?? 2.8}
                  </span>
                  <span className="text-lg font-bold text-[#5B6660]">°C</span>
                </div>
                <span className="text-xs text-[#5B6660] mt-1 block">
                  {isTa ? 'இலக்கு: 2.5°C முதல் 4.0°C வரை' : 'Target: 2.5°C to 4.0°C'}
                </span>
              </div>

              {/* Neutral text for humidity (gold reserved for advisory) */}
              <div className="text-right">
                <span className="text-base font-bold text-[#1C2420] tabular-nums">89%</span>
                <span className="text-xs text-[#5B6660] block">{isTa ? 'ஈரப்பதம்' : 'Humidity'}</span>
              </div>
            </div>
          </Card>

          {/* Mandi Price Forecast: Advisory Tag + +58% vs last week explanation */}
          <Card
            padding="md"
            onClick={() => navigate('/ai-arbitrage')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#8C5D17] flex items-center justify-center shrink-0">
                  <Sparkles size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#1C2420] font-ui truncate">
                    {isTa ? 'மண்டி விலை கணிப்பு' : 'Mandi Price Forecast'}
                  </h3>
                  <span className="text-xs text-[#5B6660] block truncate">
                    {isTa ? 'ஒட்டன்சத்திரம் சந்தை' : 'Oddanchatram APMC Market'}
                  </span>
                </div>
              </div>
              <Tag variant="advisory">
                {isTa ? 'ஆலோசனை' : 'Advisory'}
              </Tag>
            </div>

            <div className="flex items-baseline justify-between pt-3">
              <div>
                <span className="text-xs text-[#5B6660]">
                  {isTa ? 'எதிர்பார்க்கப்படும் உச்ச விலை:' : 'Projected peak:'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-serif-hero text-2xl font-bold text-[#8C5D17] tabular-nums">₹38.50</span>
                  <span className="text-xs text-[#5B6660]">/ kg</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#14532D]">
                  <TrendingUp size={13} strokeWidth={2.5} />
                  <span>+58%</span>
                </span>
                <span className="text-xs text-[#5B6660] block">
                  {isTa ? 'கடந்த வாரத்தை விட' : 'vs last week'}
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* =========================================================================
            RECENT NOTIFICATIONS (Type-specific icons with severity & unread dot)
            ========================================================================= */}
        {recentNotifs.length > 0 && (
          <section className="space-y-3" aria-label="Recent Alerts">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#5B6660] tracking-wide">
                {isTa ? 'அறிவிப்புகள்' : 'Recent Notifications'}
              </h2>
              <button
                type="button"
                onClick={() => navigate('/activity')}
                className="text-xs font-semibold text-[#14532D] hover:underline cursor-pointer"
              >
                {isTa ? 'அனைத்தும்' : 'View all'}
              </button>
            </div>

            <div className="space-y-2">
              {recentNotifs.map((n) => {
                const isCritical = n.type === 'conflict' || n.type === 'temperature';
                const isPickup = n.type === 'pickup';
                const isInspection = n.type === 'inspection';

                const icon = isCritical ? (
                  <AlertTriangle size={16} />
                ) : isPickup ? (
                  <Truck size={16} />
                ) : isInspection ? (
                  <FileCheck2 size={16} />
                ) : (
                  <Bell size={16} />
                );

                const iconBg = isCritical
                  ? 'bg-[#FBEBE7] text-[#B5472B]'
                  : isPickup
                  ? 'bg-[#E7F5EE] text-[#14532D]'
                  : 'bg-[#F7F4EC] text-[#5B6660]';

                return (
                  <div
                    key={n.id}
                    onClick={() => navigate(n.linkUrl || '/activity')}
                    className="p-3.5 rounded-2xl bg-white border border-[#DFE4DC] hover:border-[#14532D]/40 flex items-center justify-between gap-3 cursor-pointer shadow-[0_2px_8px_rgba(15,61,46,0.04)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#B5472B] shrink-0" />
                          )}
                          <h4 className={`text-xs truncate ${!n.read ? 'font-bold text-[#1C2420]' : 'font-medium text-[#5B6660]'}`}>
                            {isTa ? n.titleTa : n.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[#5B6660] truncate mt-0.5">
                          {isTa ? n.messageTa : n.message}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#5B6660]/60 shrink-0" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
