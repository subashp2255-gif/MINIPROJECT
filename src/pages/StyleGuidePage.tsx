import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { CropThumbnail } from '../components/ui/CropThumbnail';
import { formatPlural, formatDate, formatQuantity, formatCurrency } from '../lib/formatters';

export const StyleGuidePage: React.FC = () => {
  const { language } = useApp();
  const isTa = language === 'ta';

  const [inputVal, setInputVal] = useState('Farm Godown #1');
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <div className="w-full pb-28 pt-3 px-4 text-[#1C2420] select-none space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-2">
        <Tag variant="advisory">AgriSync Design System v2.0</Tag>
        <h1 className="text-xl font-bold text-[#14532D] font-ui">
          {isTa ? 'வடிவமைப்பு அமைப்பு வழிகாட்டி' : 'Heritage Harvest Design System'}
        </h1>
        <p className="text-xs text-[#5B6660] leading-relaxed">
          {isTa
            ? 'தமிழ்நாடு உழவர்கள் மற்றும் குளிர்பதன உரிமையாளர்களுக்கான உயர்தர அக்ரி-டெக் வடிவமைப்பு.'
            : 'Portfolio-grade design system crafted for Tamil & English farmers and cold chain warehouse operators. Calm, confident, high contrast, 430px max shell.'}
        </p>
      </div>

      {/* 1. COLOR TOKENS */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          1. Color Tokens
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Primary */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14532D] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Primary</span>
              <span className="text-xs text-[#5B6660] font-mono">#14532D</span>
            </div>
          </div>

          {/* Primary Dark */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Primary Dark</span>
              <span className="text-xs text-[#5B6660] font-mono">#0F3D2E</span>
            </div>
          </div>

          {/* Tint */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F5EE] border border-[#AFF2C2] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Tint &amp; Border</span>
              <span className="text-xs text-[#5B6660] font-mono">#E7F5EE</span>
            </div>
          </div>

          {/* Bronze Accent */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C5D17] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Bronze (Dry Inv)</span>
              <span className="text-xs text-[#5B6660] font-mono">#8C5D17</span>
            </div>
          </div>

          {/* Background Cream */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Canvas Cream</span>
              <span className="text-xs text-[#5B6660] font-mono">#F7F4EC</span>
            </div>
          </div>

          {/* Surface */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#DFE4DC] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Surface Card</span>
              <span className="text-xs text-[#5B6660] font-mono">#FFFFFF</span>
            </div>
          </div>

          {/* Critical */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B5472B] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Critical</span>
              <span className="text-xs text-[#5B6660] font-mono">#B5472B</span>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C2410C] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1C2420] block truncate">Warning</span>
              <span className="text-xs text-[#5B6660] font-mono">#C2410C</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TYPOGRAPHY SCALE */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          2. Typography Scale (Min 12px)
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-4">
          <div>
            <span className="text-xs text-[#5B6660] block font-mono">Display 28/34 Fraunces (Hero Numbers Only)</span>
            <span className="font-serif-hero text-[28px] leading-[34px] font-bold text-[#0F3D2E] tabular-nums">
              420 kg · 2.8°C
            </span>
          </div>

          <div className="pt-2 border-t border-[#DFE4DC]/60">
            <span className="text-xs text-[#5B6660] block font-mono">H1 22/28 Manrope Bold</span>
            <h1 className="text-[22px] leading-[28px] font-bold text-[#1C2420] font-ui">
              Murugan S. — AgriSync
            </h1>
          </div>

          <div className="pt-2 border-t border-[#DFE4DC]/60">
            <span className="text-xs text-[#5B6660] block font-mono">H2 18/24 Manrope Bold</span>
            <h2 className="text-[18px] leading-[24px] font-bold text-[#1C2420] font-ui">
              Cold Storage &amp; Dry Inventory
            </h2>
          </div>

          <div className="pt-2 border-t border-[#DFE4DC]/60">
            <span className="text-xs text-[#5B6660] block font-mono">Body 15/22 Manrope</span>
            <p className="text-[15px] leading-[22px] text-[#1C2420]">
              Solar cold storage reservation and independent dry harvest inventory for rural farming clusters.
            </p>
          </div>

          <div className="pt-2 border-t border-[#DFE4DC]/60">
            <span className="text-xs text-[#5B6660] block font-mono">Caption 12/16 (Strict minimum font size)</span>
            <p className="text-[12px] leading-[16px] text-[#5B6660]">
              Lot: #DRY-PON-001 · Last inspected 15 Aug 2026 · Weighbridge calibrated
            </p>
          </div>
        </div>
      </section>

      {/* 3. BUTTON SYSTEM (4 Variants, 2 Sizes, Single-line labels) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          3. Button System
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-[#5B6660] block">Size LG (52px, 16px label):</span>
            <Button variant="primary" size="lg" fullWidth icon={<Plus size={20} />}>
              Primary LG — Add Stock
            </Button>
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-xs text-[#5B6660] block">Size MD (44px, 14px label):</span>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" size="md" icon={<ArrowRight size={18} />}>
                Primary MD
              </Button>
              <Button variant="secondary" size="md">
                Secondary
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="tertiary" size="md">
              Tertiary Ghost
            </Button>
            <Button variant="destructive" size="md" icon={<Trash2 size={16} />}>
              Destructive
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
            >
              {btnLoading ? 'Processing...' : 'Click to test loading state'}
            </Button>
          </div>
        </div>
      </section>

      {/* 4. TAG COMPONENT */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          4. Tag Component (24px high, 12px font)
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] flex flex-wrap gap-2">
          <Tag variant="success" dot>Success Active</Tag>
          <Tag variant="warning" dot>Warning Low Stock</Tag>
          <Tag variant="danger" dot>Action Required</Tag>
          <Tag variant="info" icon={<Sparkles size={13} />}>Info Verified</Tag>
          <Tag variant="advisory">Advisory AI</Tag>
          <Tag variant="neutral">Neutral Draft</Tag>
        </div>
      </section>

      {/* 5. INPUT COMPONENT */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          5. Input Component (48px height, white fill, 16px text)
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-3">
          <Input
            label="Storage Location"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            helperText="Godown or cold storage chamber designation"
          />

          <Input
            label="Batch Lot ID"
            placeholder="Enter batch code..."
            error="Batch ID must start with #TN-"
          />
        </div>
      </section>

      {/* 6. AVATARS & CROP THUMBNAILS */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          6. Avatars &amp; Category Thumbnails
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-4">
          <div>
            <span className="text-xs text-[#5B6660] block mb-2 font-medium">Initials Avatars (sm, md, lg, xl):</span>
            <div className="flex items-center gap-3">
              <Avatar name="Murugan S." size="sm" />
              <Avatar name="Murugan S." size="md" />
              <Avatar name="Murugan S." size="lg" />
              <Avatar name="Murugan S." size="xl" />
            </div>
          </div>

          <div className="pt-2 border-t border-[#DFE4DC]/60">
            <span className="text-xs text-[#5B6660] block mb-2 font-medium">56px Crop Category Fallbacks:</span>
            <div className="flex items-center gap-3">
              <CropThumbnail category="rice" size={56} />
              <CropThumbnail category="pulses" size={56} />
              <CropThumbnail category="wheat" size={56} />
              <CropThumbnail category="grains" size={56} />
            </div>
          </div>
        </div>
      </section>

      {/* 7. FORMATTING HELPERS */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#5B6660] uppercase tracking-wider">
          7. Formatting Helpers (Tabular Numerals &amp; Plurals)
        </h2>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#5B6660]">Date Format:</span>
            <span className="font-semibold text-[#1C2420]">{formatDate('2026-10-22')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6660]">Quantity (non-breaking unit):</span>
            <span className="font-semibold text-[#1C2420] tabular-nums">{formatQuantity(1420, 'quintal')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6660]">Currency Format:</span>
            <span className="font-semibold text-[#14532D] tabular-nums">{formatCurrency(48500)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6660]">Pluralization (English):</span>
            <span className="font-semibold text-[#1C2420]">{formatPlural(1, 'lot', 'lots')} / {formatPlural(4, 'lot', 'lots')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
