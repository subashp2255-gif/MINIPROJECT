import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Snowflake,
  Package,
  Sparkles,
  Zap,
  Home,
  HelpCircle
} from 'lucide-react';

export const StyleGuidePage: React.FC = () => {
  const { language, setLanguage } = useApp();
  const isTa = language === 'ta';
  const [selectedChip, setSelectedChip] = useState<'all' | 'solar' | 'nearby'>('solar');

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Style Guide container */}
      <div className="px-4 pt-3 space-y-6">

        {/* Introduction */}
        <section className="card-heritage p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C8923A]">
            Design System Documentation
          </span>
          <h2 className="text-2xl font-bold font-serif-hero text-[#0F3D2E]">
            Heritage Harvest
          </h2>
          <p className="text-xs text-[#5B6660] leading-relaxed">
            A high-end agri-fintech design language crafted for Tamil-speaking farmers and cold storage operators. Calm, confident, high contrast, generous whitespace, one focal point per screen.
          </p>
        </section>

        {/* 1. COLOR PALETTE */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">1. Color Palette</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Cream */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] border border-[#0F3D2E]/20 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Warm Cream</span>
                <span className="text-[11px] text-[#5B6660]">#F7F4EC (Canvas)</span>
              </div>
            </div>

            {/* Deep Forest */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Deep Forest</span>
                <span className="text-[11px] text-[#5B6660]">#0F3D2E (Primary)</span>
              </div>
            </div>

            {/* Forest Mid */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14532D] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Forest Green</span>
                <span className="text-[11px] text-[#5B6660]">#14532D (Buttons)</span>
              </div>
            </div>

            {/* Harvest Gold */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8923A] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Harvest Gold</span>
                <span className="text-[11px] text-[#5B6660]">#C8923A (Accent)</span>
              </div>
            </div>

            {/* Terracotta */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B5472B] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Terracotta</span>
                <span className="text-[11px] text-[#5B6660]">#B5472B (Alerts)</span>
              </div>
            </div>

            {/* Urgent Orange */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C2410C] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Urgent Orange</span>
                <span className="text-[11px] text-[#5B6660]">#C2410C (Actions)</span>
              </div>
            </div>

            {/* Charcoal */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C2420] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Charcoal</span>
                <span className="text-[11px] text-[#5B6660]">#1C2420 (Primary Text)</span>
              </div>
            </div>

            {/* Secondary Gray */}
            <div className="card-heritage p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B6660] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1C2420] block">Secondary</span>
                <span className="text-[11px] text-[#5B6660]">#5B6660 (Subtext)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TYPOGRAPHY SCALE */}
        <section className="card-heritage p-5 space-y-4">
          <h3 className="text-base font-bold text-[#1C2420]">2. Typography Scale</h3>

          {/* Hero Numbers (Fraunces Serif 40px) */}
          <div className="border-b border-[#F7F4EC] pb-3">
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
              Hero Metric / Price (Fraunces 40px)
            </span>
            <div className="font-serif-hero text-[40px] font-bold text-[#0F3D2E] leading-none">
              ₹38.50 <span className="text-[#C8923A]">2.8°C</span>
            </div>
          </div>

          {/* Title 28px */}
          <div className="border-b border-[#F7F4EC] pb-3">
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
              Screen Title (28px)
            </span>
            <h1 className="font-serif-hero text-[28px] font-semibold text-[#1C2420] leading-tight">
              {isTa ? 'குளிர்பதன சேமிப்பகம்' : 'Smart Cold Storage'}
            </h1>
          </div>

          {/* Section 20px */}
          <div className="border-b border-[#F7F4EC] pb-3">
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
              Section Header (20px)
            </span>
            <h2 className="text-xl font-bold text-[#1C2420]">
              {isTa ? 'விளைபொருள் விவரம்' : 'Produce Inventory'}
            </h2>
          </div>

          {/* Body 16px */}
          <div className="border-b border-[#F7F4EC] pb-3">
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
              Body Text (16px)
            </span>
            <p className="text-base text-[#1C2420] leading-relaxed">
              {isTa
                ? 'சூரிய மின்சார குளிர்பதன அறைகள் விளைபொருட்களின் ஆயுளை 3 மடங்கு நீட்டிக்கின்றன.'
                : 'Solar cold storage extends crop freshness while preventing distress market sales.'}
            </p>
          </div>

          {/* Secondary 14px & Caption 12px */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
                Secondary (14px)
              </span>
              <p className="text-sm text-[#5B6660]">Oddanchatram Hub • 3.2 km</p>
            </div>
            <div>
              <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
                Caption (12px min)
              </span>
              <p className="text-xs text-[#5B6660]">Target range: 2.5°C to 4.0°C</p>
            </div>
          </div>
        </section>

        {/* 3. BUTTON SYSTEM */}
        <section className="card-heritage p-5 space-y-4">
          <h3 className="text-base font-bold text-[#1C2420]">3. Buttons &amp; CTA System</h3>

          {/* Primary */}
          <div>
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1.5">
              Primary Button (Solid #14532D, 52px high, 12px radius)
            </span>
            <button type="button" className="btn-primary">
              <span>Book slot</span>
            </button>
          </div>

          {/* Urgent */}
          <div>
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1.5">
              Urgent Button (Solid #C2410C, 52px high)
            </span>
            <button type="button" className="btn-urgent">
              <span>Confirm arrival</span>
            </button>
          </div>

          {/* Secondary */}
          <div>
            <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1.5">
              Secondary Button (White fill, 1.5px #14532D border)
            </span>
            <button type="button" className="btn-secondary">
              <span>Request pickup</span>
            </button>
          </div>

          {/* Text Links */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
                Text Link
              </span>
              <button type="button" className="btn-text-link">
                <span>Reschedule</span>
              </button>
            </div>
            <div>
              <span className="text-[11px] text-[#5B6660] uppercase tracking-wider block mb-1">
                Destructive Link
              </span>
              <button type="button" className="btn-destructive-link">
                <span>Cancel booking</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. LANGUAGE SWITCH PILL */}
        <section className="card-heritage p-5 space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">4. Segmented Language Switch</h3>
          <p className="text-xs text-[#5B6660]">
            Single compact 80×36px segmented pill showing &quot;அ | A&quot;. Lives ONLY in the header.
          </p>
          <div className="p-4 rounded-2xl bg-[#0F3D2E] flex items-center justify-between">
            <span className="text-xs text-[#F7F4EC] font-medium">Header Preview:</span>
            <div className="w-20 h-9 p-0.5 bg-black/30 rounded-full flex items-center justify-between border border-white/20">
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`w-[37px] h-8 rounded-full text-xs font-bold transition-all ${
                  language === 'ta'
                    ? 'bg-[#F7F4EC] text-[#0F3D2E] shadow-sm'
                    : 'text-[#F7F4EC]/70'
                }`}
              >
                அ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`w-[37px] h-8 rounded-full text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-[#F7F4EC] text-[#0F3D2E] shadow-sm'
                    : 'text-[#F7F4EC]/70'
                }`}
              >
                A
              </button>
            </div>
          </div>
        </section>

        {/* 5. FILTER CHIPS */}
        <section className="card-heritage p-5 space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">5. Filter Chips (Max 3)</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedChip('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                selectedChip === 'all'
                  ? 'bg-[#14532D] text-white'
                  : 'bg-white text-[#5B6660] border border-[#0F3D2E]/15'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedChip('solar')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                selectedChip === 'solar'
                  ? 'bg-[#14532D] text-white'
                  : 'bg-white text-[#5B6660] border border-[#0F3D2E]/15'
              }`}
            >
              <Zap size={14} className="text-[#C8923A]" />
              <span>Solar powered</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChip('nearby')}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                selectedChip === 'nearby'
                  ? 'bg-[#14532D] text-white'
                  : 'bg-white text-[#5B6660] border border-[#0F3D2E]/15'
              }`}
            >
              &lt; 5 km
            </button>
          </div>
        </section>

        {/* 6. STATUS COMPONENTS (Always Icon + Text + Color) */}
        <section className="card-heritage p-5 space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">6. Status Components</h3>
          <p className="text-xs text-[#5B6660]">
            Never rely on color alone. Color is always paired with a line icon and text label.
          </p>
          <div className="space-y-2">
            {/* Normal / Safe */}
            <div className="p-3 rounded-xl bg-[#E7F5EE] flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D]">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>Normal / Optimal (Green)</span>
              </span>
              <span className="text-[11px] text-[#14532D]">Telemetry synced</span>
            </div>

            {/* Needs Action / Alert */}
            <div className="p-3 rounded-xl bg-[#C8923A]/15 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E1B]">
                <AlertTriangle size={16} strokeWidth={2} />
                <span>Needs Action / Warning (Harvest Gold)</span>
              </span>
              <span className="text-[11px] text-[#8C5E1B]">Pickup tomorrow</span>
            </div>

            {/* Critical */}
            <div className="p-3 rounded-xl bg-[#B5472B]/15 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B5472B]">
                <XCircle size={16} strokeWidth={2} />
                <span>Critical Only / Discrepancy (Terracotta)</span>
              </span>
              <span className="text-[11px] text-[#B5472B]">Chamber cut 40%</span>
            </div>
          </div>
        </section>

        {/* 7. LINE ICON SYSTEM */}
        <section className="card-heritage p-5 space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">7. Line Icon System</h3>
          <p className="text-xs text-[#5B6660]">
            24px, 1.75px stroke, inside soft tinted circles. No emojis as icons.
          </p>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center">
                <Thermometer size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] text-[#5B6660]">Sensors</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#C8923A]/15 text-[#C8923A] flex items-center justify-center">
                <Snowflake size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] text-[#5B6660]">Chambers</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#14532D]/10 text-[#14532D] flex items-center justify-center">
                <Package size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] text-[#5B6660]">Batches</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#B5472B]/15 text-[#B5472B] flex items-center justify-center">
                <Sparkles size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] text-[#5B6660]">AI Price</span>
            </div>
          </div>
        </section>

        {/* 8. FLOATING PILL NAVIGATION */}
        <section className="card-heritage p-5 space-y-3">
          <h3 className="text-base font-bold text-[#1C2420]">8. Floating Pill Navigation</h3>
          <p className="text-xs text-[#5B6660]">
            Floating 12px above bottom, blur background, 4 tabs (Home, Chambers, Inventory, Help), gold active dot.
          </p>
          <div className="h-16 w-full bg-white rounded-full shadow-md border border-[#0F3D2E]/10 flex items-center justify-around px-2">
            <div className="flex flex-col items-center">
              <Home size={22} strokeWidth={1.75} color="#C8923A" />
              <span className="text-[12px] font-bold text-[#0F3D2E]">Home</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8923A] mt-0.5" />
            </div>
            <div className="flex flex-col items-center">
              <Snowflake size={22} strokeWidth={1.75} color="#5B6660" />
              <span className="text-[12px] text-[#5B6660]">Chambers</span>
            </div>
            <div className="flex flex-col items-center">
              <Package size={22} strokeWidth={1.75} color="#5B6660" />
              <span className="text-[12px] text-[#5B6660]">Inventory</span>
            </div>
            <div className="flex flex-col items-center">
              <HelpCircle size={22} strokeWidth={1.75} color="#5B6660" />
              <span className="text-[12px] text-[#5B6660]">Help</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
