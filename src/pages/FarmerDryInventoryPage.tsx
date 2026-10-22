import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { DryProduct, DryCropCategory, DryCropUnit } from '../types';
import {
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  MapPin,
  MoveRight,
  Archive,
  X,
  Edit2,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tag, statusToTagVariant } from '../components/ui/Tag';
import { CropThumbnail } from '../components/ui/CropThumbnail';
import { Input } from '../components/ui/Input';
import { formatDate, formatQuantity, formatCurrency } from '../lib/formatters';

export const FarmerDryInventoryPage: React.FC = () => {
  const {
    dryProducts,
    addDryProduct,
    addStockDryProduct,
    removeStockDryProduct,
    adjustStockDryProduct,
    transferDryProduct,
    archiveDryProduct,
    updateDryProductThreshold,
    language,
    showToast,
  } = useApp();

  const isTa = language === 'ta';

  // Navigation / Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Selected Product for Details Bottom Sheet
  const [activeProduct, setActiveProduct] = useState<DryProduct | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRemoveStockModal, setShowRemoveStockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<DryProduct | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  // Form states for Add Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameTa, setNewProdNameTa] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<DryCropCategory>('rice');
  const [newProdVariety, setNewProdVariety] = useState('');
  const [newProdQty, setNewProdQty] = useState<number>(10);
  const [newProdUnit, setNewProdUnit] = useState<DryCropUnit>('quintal');
  const [newProdLocation, setNewProdLocation] = useState('Farm Godown #1, Oddanchatram');
  const [newProdBatch, setNewProdBatch] = useState('');
  const [newProdHarvestDate, setNewProdHarvestDate] = useState('2026-09-10');
  const [newProdCost, setNewProdCost] = useState<number>(3200);
  const [newProdThreshold, setNewProdThreshold] = useState<number>(3);
  const [newProdNotes, setNewProdNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Action Form States
  const [actionQty, setActionQty] = useState<number>(5);
  const [actionReason, setActionReason] = useState<string>('Mandi Wholesale Sale');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [transferDest, setTransferDest] = useState<string>('Central Silo 2, Palani');
  const [verifiedQty, setVerifiedQty] = useState<number>(0);
  const [newThresholdValue, setNewThresholdValue] = useState<number>(5);

  // Quick Preset Crops for Farmers
  const PRESET_CROPS = [
    { name: 'Ponni Raw Rice', nameTa: 'பொன்னி பச்சரிசி', category: 'rice' as DryCropCategory, unit: 'quintal' as DryCropUnit },
    { name: 'Samba Paddy', nameTa: 'சம்பா நெல்', category: 'rice' as DryCropCategory, unit: 'bag' as DryCropUnit },
    { name: 'Toor Dal (Red Gram)', nameTa: 'துவரம் பருப்பு', category: 'pulses' as DryCropCategory, unit: 'kg' as DryCropUnit },
    { name: 'Black Gram (Urad)', nameTa: 'கருப்பு உளுந்து', category: 'pulses' as DryCropCategory, unit: 'kg' as DryCropUnit },
    { name: 'Bengal Gram (Chana)', nameTa: 'கொண்டைக்கடலை', category: 'pulses' as DryCropCategory, unit: 'kg' as DryCropUnit },
    { name: 'Sharbati Wheat', nameTa: 'ஷர்பதி கோதுமை', category: 'wheat' as DryCropCategory, unit: 'bag' as DryCropUnit },
    { name: 'Pearl Millet (Kambu)', nameTa: 'கம்பு (பஜ்ரா)', category: 'grains' as DryCropCategory, unit: 'quintal' as DryCropUnit },
    { name: 'Finger Millet (Ragi)', nameTa: 'கேழ்வரகு (ராகி)', category: 'grains' as DryCropCategory, unit: 'quintal' as DryCropUnit },
  ];

  // Summary Card: Total lots, Total weight (single unit, converted), Low-stock count
  const summary = useMemo(() => {
    const active = dryProducts.filter((p) => !p.isArchived);
    const totalLots = active.length;
    const lowStockCount = active.filter((p) => p.status === 'low_stock').length;

    // Convert all to equivalent quintals for unified weight representation:
    // 1 quintal = 100 kg, 1 bag = 50 kg = 0.5 quintal, 1 tonne = 10 quintals
    let totalWeightInQuintals = 0;
    active.forEach((p) => {
      if (p.unit === 'quintal') totalWeightInQuintals += p.quantity;
      else if (p.unit === 'kg') totalWeightInQuintals += p.quantity / 100;
      else if (p.unit === 'bag') totalWeightInQuintals += p.quantity * 0.5;
      else if (p.unit === 'tonne') totalWeightInQuintals += p.quantity * 10;
    });

    return {
      totalLots,
      totalWeight: Math.round(totalWeightInQuintals),
      lowStockCount,
    };
  }, [dryProducts]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return dryProducts.filter((p) => {
      if (showArchived) {
        if (!p.isArchived) return false;
      } else {
        if (p.isArchived) return false;
      }
      if (onlyLowStock && p.status !== 'low_stock') return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.nameTa.toLowerCase().includes(q) ||
          p.batchLotId.toLowerCase().includes(q) ||
          p.storageLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dryProducts, showArchived, onlyLowStock, selectedCategory, searchQuery]);

  // Recent movements
  const allRecentMovements = useMemo(() => {
    const list = dryProducts.flatMap((p) =>
      p.transactions.map((tx) => ({
        ...tx,
        productName: p.name,
        productNameTa: p.nameTa,
      }))
    );
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [dryProducts]);

  const handleSelectPreset = (crop: typeof PRESET_CROPS[0]) => {
    setNewProdName(crop.name);
    setNewProdNameTa(crop.nameTa);
    setNewProdCategory(crop.category);
    setNewProdUnit(crop.unit);
  };

  const handleOpenDetail = (p: DryProduct) => {
    setActiveProduct(p);
    setShowDetailSheet(true);
    setShowOverflowMenu(false);
  };

  // Submit Add Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newProdName.trim()) {
      errors.name = isTa ? 'தயவுசெய்து விளைபொருள் பெயரை உள்ளிடவும்.' : 'Product name is required.';
    }
    if (newProdQty <= 0) {
      errors.qty = isTa ? 'அளவு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.' : 'Quantity must be greater than zero.';
    }
    if (!newProdLocation.trim()) {
      errors.location = isTa ? 'சேமிப்பக இடத்தை உள்ளிடவும்.' : 'Storage location is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const created = addDryProduct({
      name: newProdName.trim(),
      nameTa: newProdNameTa.trim() || newProdName.trim(),
      category: newProdCategory,
      variety: newProdVariety.trim() || undefined,
      quantity: Number(newProdQty),
      unit: newProdUnit,
      storageLocation: newProdLocation.trim(),
      batchLotId: newProdBatch.trim() || undefined,
      harvestDate: newProdHarvestDate,
      unitCost: Number(newProdCost) || undefined,
      lowStockThreshold: Number(newProdThreshold) || undefined,
      notes: newProdNotes.trim() || undefined,
    });

    setShowAddModal(false);
    setShowConfirmModal(created);
    setActiveProduct(created);

    setNewProdName('');
    setNewProdNameTa('');
    setNewProdVariety('');
    setNewProdBatch('');
    setNewProdNotes('');
  };

  // Submit Add Stock
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0) {
      showToast(isTa ? 'அளவு நேர்மறையாக இருக்க வேண்டும்' : 'Quantity must be positive', 'error');
      return;
    }
    const success = addStockDryProduct(activeProduct.id, actionQty, activeProduct.unit, actionReason, actionNotes);
    if (success) {
      setShowAddStockModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Remove Stock
  const handleRemoveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0) {
      showToast(isTa ? 'அளவு நேர்மறையாக இருக்க வேண்டும்' : 'Quantity must be positive', 'error');
      return;
    }
    if (actionQty > activeProduct.quantity) {
      showToast(`Cannot remove ${actionQty} ${activeProduct.unit}: only ${activeProduct.quantity} available!`, 'error');
      return;
    }
    const success = removeStockDryProduct(activeProduct.id, actionQty, actionReason, actionNotes);
    if (success) {
      setShowRemoveStockModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Adjust Stock
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (verifiedQty < 0) {
      showToast(isTa ? 'எண்ணிக்கை பூஜ்ஜியத்தை விட குறையக் கூடாது' : 'Verified balance cannot be negative', 'error');
      return;
    }
    const success = adjustStockDryProduct(activeProduct.id, verifiedQty, actionReason);
    if (success) {
      setShowAdjustModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Transfer Stock
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0 || actionQty > activeProduct.quantity) {
      showToast(isTa ? 'தவறான இடமாற்ற அளவு' : 'Invalid transfer quantity', 'error');
      return;
    }
    if (!transferDest.trim()) {
      showToast(isTa ? 'சேருமிடம் தேவை' : 'Destination location required', 'error');
      return;
    }
    const success = transferDryProduct(activeProduct.id, actionQty, transferDest.trim(), actionReason);
    if (success) {
      setShowTransferModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Threshold Update
  const handleThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    updateDryProductThreshold(activeProduct.id, newThresholdValue);
    setShowThresholdModal(false);
    const updated = dryProducts.find((p) => p.id === activeProduct.id);
    if (updated) setActiveProduct(updated);
  };

  // Archive / Restore Handler
  const handleArchive = (product: DryProduct) => {
    if (product.quantity > 0) {
      if (confirm(`Notice: ${product.name} still has ${product.quantity} ${product.unit} remaining. Archive anyway?`)) {
        archiveDryProduct(product.id, true);
        setShowDetailSheet(false);
      }
    } else {
      archiveDryProduct(product.id, false);
      setShowDetailSheet(false);
    }
  };

  return (
    <div className="w-full pb-28 pt-3 px-4 text-[#1C2420] select-none space-y-5">
      {/* =========================================================================
          STANDARD HEADER ACTION BAR (Replacing the previous gold banner)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#8C5D17] flex items-center justify-center shrink-0">
            <Package size={22} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#1C2420] truncate font-ui">
              {isTa ? 'தானிய இருப்பு மேலாண்மை' : 'Dry Harvest Inventory'}
            </h1>
            <p className="text-xs text-[#5B6660] truncate">
              {isTa ? 'நெல், பருப்பு, கோதுமை மற்றும் சிறுதானியங்கள்' : 'Paddy, pulses, wheat and millets'}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => {
            setNewProdQty(10);
            setShowAddModal(true);
          }}
        >
          {isTa ? 'பயிர் சேர்க்க' : 'Add product'}
        </Button>
      </div>

      {/* =========================================================================
          SUMMARY CARD: 3 Equal Tiles with Consistent Label / Number / Caption
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {/* Tile 1: Total Lots */}
          <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-center flex flex-col justify-between h-[88px]">
            <span className="text-xs text-[#5B6660] font-medium block truncate">
              {isTa ? 'மொத்த வகைகள்' : 'Total lots'}
            </span>
            <span className="font-serif-hero text-2xl font-bold text-[#1C2420] tabular-nums leading-none">
              {summary.totalLots}
            </span>
            <span className="text-xs text-[#5B6660] truncate">
              {isTa ? 'செயலில் உள்ளவை' : 'Active batches'}
            </span>
          </div>

          {/* Tile 2: Total Weight (Single unit, converted to quintals) */}
          <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-center flex flex-col justify-between h-[88px]">
            <span className="text-xs text-[#5B6660] font-medium block truncate">
              {isTa ? 'மொத்த எடை' : 'Total weight'}
            </span>
            <span className="font-serif-hero text-2xl font-bold text-[#1C2420] tabular-nums leading-none">
              {summary.totalWeight}
            </span>
            <span className="text-xs text-[#5B6660] truncate">
              {isTa ? 'குவிண்டால்' : 'quintals'}
            </span>
          </div>

          {/* Tile 3: Low-stock Count */}
          <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-center flex flex-col justify-between h-[88px]">
            <span className="text-xs text-[#5B6660] font-medium block truncate">
              {isTa ? 'குறைந்த இருப்பு' : 'Low stock'}
            </span>
            <span className={`font-serif-hero text-2xl font-bold tabular-nums leading-none ${summary.lowStockCount > 0 ? 'text-[#C2410C]' : 'text-[#14532D]'}`}>
              {summary.lowStockCount}
            </span>
            <span className="text-xs text-[#5B6660] truncate">
              {summary.lowStockCount > 0 ? (isTa ? 'கவனம் தேவை' : 'Needs attention') : (isTa ? 'போதுமானது' : 'Optimal')}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & EDGE-TO-EDGE FILTER CHIPS (Low stock as a filter chip)
          ========================================================================= */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search size={18} className="absolute left-3.5 top-3.5 text-[#5B6660] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTa ? 'பயிர் பெயர், தொகுதி, இடம் தேட...' : 'Search crop name, lot ID, location...'}
            className="w-full h-12 pl-11 pr-9 rounded-xl border border-[#DFE4DC] bg-white text-base text-[#1C2420] placeholder:text-[#5B6660]/60 outline-hidden focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/20 shadow-[0_2px_8px_rgba(15,61,46,0.04)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-[#5B6660] hover:text-[#1C2420]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Edge-to-edge scrolling filter chips */}
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {/* Low stock filter chip */}
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              onlyLowStock
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{isTa ? 'குறைந்த இருப்பு' : 'Low stock'}</span>
          </button>

          {/* Category Chips */}
          {[
            { id: 'all', label: isTa ? 'அனைத்தும்' : 'All' },
            { id: 'rice', label: isTa ? 'நெல் & அரிசி' : 'Paddy & Rice' },
            { id: 'pulses', label: isTa ? 'பருப்பு வகைகள்' : 'Pulses & Dal' },
            { id: 'wheat', label: isTa ? 'கோதுமை' : 'Wheat' },
            { id: 'grains', label: isTa ? 'சிறுதானியங்கள்' : 'Millets' },
            { id: 'oilseeds', label: isTa ? 'எண்ணெய் வித்து' : 'Oilseeds' },
          ].map((cat) => {
            const isSelected = !onlyLowStock && selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setOnlyLowStock(false);
                  setSelectedCategory(cat.id);
                }}
                className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          PRODUCT LIST (Identical layout per row, 56px thumbnail, taps open detail)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5B6660] uppercase tracking-wider">
            {isTa ? 'தானியப் பட்டியல்' : 'Harvest stock'} ({filteredProducts.length})
          </span>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`text-xs font-semibold hover:underline cursor-pointer ${
              showArchived ? 'text-[#B5472B]' : 'text-[#5B6660]'
            }`}
          >
            {showArchived ? (isTa ? 'செயலில் உள்ளவை' : 'Active items') : (isTa ? 'காப்பகம்' : 'Archived items')}
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#DFE4DC] space-y-3">
            <Package size={32} className="mx-auto text-[#5B6660]/40" />
            <h3 className="text-sm font-semibold text-[#1C2420]">
              {isTa ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No items match your criteria'}
            </h3>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'வடிகட்டிகளை மாற்றவும் அல்லது புதிய பயிர் சேர்க்கவும்.' : 'Clear search or add a new dry agricultural product.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map((p) => {
              const isSelected = activeProduct?.id === p.id && showDetailSheet;
              const isLow = p.status === 'low_stock';

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-[0_2px_8px_rgba(15,61,46,0.04)] ${
                    isSelected
                      ? 'border-[#14532D] bg-[#E7F5EE]/40 shadow-sm'
                      : 'border-[#DFE4DC] hover:border-[#14532D]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 56px Thumbnail */}
                    <CropThumbnail
                      size={56}
                      category={p.category}
                      name={p.name}
                      imageUrl={p.imageUrl}
                    />

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {/* Name on 1 line with ellipsis */}
                          <h3 className="text-sm font-bold text-[#1C2420] truncate font-ui">
                            {isTa ? p.nameTa : p.name}
                          </h3>
                          {/* Variety as quiet caption */}
                          <span className="text-xs text-[#5B6660] block truncate">
                            {p.variety ? `${p.variety}` : (isTa ? 'விவசாய கிடங்கு பயிர்' : 'Standard grade harvest')}
                          </span>
                        </div>

                        {/* Status Tag aligned right */}
                        <div className="shrink-0">
                          <Tag variant={statusToTagVariant(p.status)} dot>
                            {isLow ? (isTa ? 'குறைந்த இருப்பு' : 'Low stock') : (isTa ? 'இருப்பில் உள்ளது' : 'In stock')}
                          </Tag>
                        </div>
                      </div>

                      {/* Quantity & Meta Row */}
                      <div className="flex items-end justify-between gap-2 mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif-hero text-xl font-bold text-[#1C2420] tabular-nums">
                            {p.quantity.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-[#5B6660]">{p.unit}</span>
                        </div>

                        {/* Meta row: Location (icon + truncated) & Lot ID (mono 12px) */}
                        <div className="flex items-center gap-2 text-xs text-[#5B6660] min-w-0">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <MapPin size={12} className="shrink-0 text-[#14532D]" />
                            <span className="truncate">{p.storageLocation}</span>
                          </span>
                          <span className="font-mono text-xs text-[#1C2420] shrink-0 font-medium bg-[#F7F4EC] px-1.5 py-0.5 rounded-md border border-[#DFE4DC]">
                            {p.batchLotId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          IMMUTABLE AUDIT LEDGER PREVIEW
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5B6660] uppercase tracking-wider">
            {isTa ? 'இருப்புப் பதிவேடு' : 'Movement ledger'}
          </span>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="text-xs font-semibold text-[#14532D] hover:underline cursor-pointer"
          >
            {isTa ? 'முழு பதிவேடு காண்க' : 'See full ledger'}
          </button>
        </div>

        <div className="space-y-2">
          {allRecentMovements.map((tx) => {
            const isAdd = tx.type === 'initial' || tx.type === 'add';
            const isRemove = tx.type === 'remove';
            const isTransfer = tx.type === 'transfer';

            const iconBg = isAdd
              ? 'bg-[#E7F5EE] text-[#14532D]'
              : isRemove
              ? 'bg-[#FBEBE7] text-[#B5472B]'
              : isTransfer
              ? 'bg-blue-50 text-blue-700'
              : 'bg-[#FEF3C7] text-[#8C5D17]';

            return (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    {isAdd ? (
                      <TrendingUp size={16} />
                    ) : isRemove ? (
                      <TrendingDown size={16} />
                    ) : isTransfer ? (
                      <MoveRight size={16} />
                    ) : (
                      <Edit2 size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[#1C2420] block truncate">
                      {isTa ? tx.productNameTa : tx.productName} • {tx.reason}
                    </span>
                    <span className="text-xs text-[#5B6660]">
                      {tx.receiptNumber} • {formatDate(tx.date)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-bold block tabular-nums ${
                      isAdd ? 'text-[#14532D]' : isRemove ? 'text-[#B5472B]' : 'text-[#1C2420]'
                    }`}
                  >
                    {isRemove ? '-' : '+'}
                    {tx.quantity}&nbsp;{tx.unit}
                  </span>
                  <span className="text-xs text-[#5B6660] tabular-nums">
                    {tx.previousBalance} → {tx.newBalance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          DETAIL BOTTOM SHEET (Opened by tapping a product row)
          ========================================================================= */}
      {showDetailSheet && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-5 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[#DFE4DC] mx-auto sm:hidden" />

            {/* Header: Name and Lot on separate lines */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#1C2420] leading-tight font-ui truncate">
                  {isTa ? activeProduct.nameTa : activeProduct.name}
                </h2>
                <span className="font-mono text-xs text-[#5B6660] block mt-0.5">
                  Lot: {activeProduct.batchLotId}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Overflow Menu Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                    className="w-9 h-9 rounded-xl bg-[#F7F4EC] hover:bg-[#DFE4DC] text-[#1C2420] flex items-center justify-center cursor-pointer"
                    aria-label="More actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {showOverflowMenu && (
                    <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-[#DFE4DC] py-1 z-20">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOverflowMenu(false);
                          setShowThresholdModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-[#1C2420] hover:bg-[#F7F4EC] flex items-center gap-2 cursor-pointer"
                      >
                        <AlertTriangle size={14} className="text-[#8C5D17]" />
                        <span>{isTa ? 'எச்சரிக்கை அளவு' : 'Edit alert level'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOverflowMenu(false);
                          handleArchive(activeProduct);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-[#B5472B] hover:bg-[#FBEBE7] flex items-center gap-2 cursor-pointer border-t border-[#DFE4DC]/50"
                      >
                        <Archive size={14} />
                        <span>{activeProduct.isArchived ? (isTa ? 'மீட்டெடு' : 'Restore product') : (isTa ? 'காப்பகத்தில் சேர்' : 'Archive product')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailSheet(false)}
                  className="w-9 h-9 rounded-xl bg-[#F7F4EC] hover:bg-[#DFE4DC] text-[#5B6660] flex items-center justify-center cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Warning Explanation if Low Stock */}
            {activeProduct.status === 'low_stock' && (
              <div className="p-3 rounded-xl bg-[#FFF2EB] border border-[#FED7AA] flex items-center gap-2 text-xs text-[#C2410C]">
                <AlertTriangle size={16} className="shrink-0" />
                <span>
                  {isTa
                    ? `மறுவரிசை நிலைக்கு கீழே உள்ளது: ${activeProduct.lowStockThreshold} ${activeProduct.unit}`
                    : `Below reorder level: ${activeProduct.lowStockThreshold} ${activeProduct.unit}`}
                </span>
              </div>
            )}

            {/* 2x2 Info Grid: Available, Location, Estimated Value, Harvest Date */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 space-y-0.5">
                <span className="text-[#5B6660] block font-medium">
                  {isTa ? 'கிடைக்கக்கூடிய இருப்பு' : 'Available stock'}
                </span>
                <span className="font-serif-hero text-lg font-bold text-[#1C2420] tabular-nums block">
                  {formatQuantity(activeProduct.quantity, activeProduct.unit)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 space-y-0.5">
                <span className="text-[#5B6660] block font-medium">
                  {isTa ? 'கிடங்கு இருப்பிடம்' : 'Storage location'}
                </span>
                <span className="text-xs font-semibold text-[#1C2420] truncate block" title={activeProduct.storageLocation}>
                  {activeProduct.storageLocation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 space-y-0.5">
                <span className="text-[#5B6660] block font-medium">
                  {isTa ? 'மதிப்பிடப்பட்ட மதிப்பு' : 'Estimated value'}
                </span>
                <span className="font-serif-hero text-lg font-bold text-[#14532D] tabular-nums block">
                  {formatCurrency(activeProduct.totalValue || (activeProduct.unitCost || 0) * activeProduct.quantity)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 space-y-0.5">
                <span className="text-[#5B6660] block font-medium">
                  {isTa ? 'அறுவடை தேதி' : 'Harvest date'}
                </span>
                <span className="text-xs font-semibold text-[#1C2420] block">
                  {formatDate(activeProduct.harvestDate)}
                </span>
              </div>
            </div>

            {/* Actions: Add Stock (Primary LG full-width), Remove Stock (Secondary MD), Adjust & Transfer (Tertiary) */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<Plus size={20} />}
                onClick={() => {
                  setActionQty(5);
                  setActionReason('Harvest Lot Addition');
                  setShowAddStockModal(true);
                }}
              >
                {isTa ? 'இருப்பு சேர்' : 'Add stock'}
              </Button>

              <Button
                variant="secondary"
                size="md"
                fullWidth
                icon={<TrendingDown size={20} />}
                onClick={() => {
                  setActionQty(Math.min(5, activeProduct.quantity));
                  setActionReason('Mandi Wholesale Sale');
                  setShowRemoveStockModal(true);
                }}
              >
                {isTa ? 'இருப்பு எடு' : 'Remove stock'}
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="tertiary"
                  size="md"
                  icon={<Edit2 size={18} />}
                  onClick={() => {
                    setVerifiedQty(activeProduct.quantity);
                    setActionReason('Monthly Physical Count Verification');
                    setShowAdjustModal(true);
                  }}
                >
                  {isTa ? 'சரிசெய்' : 'Adjust'}
                </Button>

                <Button
                  variant="tertiary"
                  size="md"
                  icon={<MoveRight size={18} />}
                  onClick={() => {
                    setActionQty(Math.min(5, activeProduct.quantity));
                    setActionReason('Inter-facility godown relocation');
                    setShowTransferModal(true);
                  }}
                >
                  {isTa ? 'இடம் மாற்று' : 'Transfer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD PRODUCT MODAL
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14532D] font-ui">
                  {isTa ? 'உலர்ந்த தானியப் பதிவு' : 'Register Dry Crop Harvest'}
                </h3>
                <p className="text-xs text-[#5B6660]">
                  {isTa ? 'விவசாய கிடங்கு பதிவு' : 'Record new crop lot on your farm'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#5B6660] block">
                {isTa ? 'விரைவுப் பரிந்துரைகள்:' : 'Quick Crop Presets:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CROPS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectPreset(c)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F4EC] hover:bg-[#E7F5EE] border border-[#DFE4DC] text-xs font-semibold text-[#1C2420] cursor-pointer"
                  >
                    {isTa ? c.nameTa : c.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 pt-1">
              <Input
                label={isTa ? 'பயிரின் பெயர் *' : 'Product Name *'}
                placeholder="e.g. Deluxe Ponni Raw Rice"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                error={formErrors.name}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-semibold text-[#1C2420]">
                    {isTa ? 'பிரிவு *' : 'Category *'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as DryCropCategory)}
                    className="w-full h-12 px-3 rounded-xl border border-[#DFE4DC] text-base font-medium bg-white text-[#1C2420] outline-hidden focus:border-[#14532D]"
                  >
                    <option value="rice">Rice / Paddy</option>
                    <option value="pulses">Pulses & Dal</option>
                    <option value="wheat">Wheat</option>
                    <option value="grains">Millets & Grains</option>
                    <option value="oilseeds">Oilseeds</option>
                    <option value="spices">Spices</option>
                    <option value="other">Other Dry Goods</option>
                  </select>
                </div>

                <Input
                  label={isTa ? 'ரகம்' : 'Variety'}
                  placeholder="e.g. Grade A / BPT"
                  value={newProdVariety}
                  onChange={(e) => setNewProdVariety(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={isTa ? 'இருப்பு அளவு *' : 'Opening Quantity *'}
                  type="number"
                  min="1"
                  value={newProdQty}
                  onChange={(e) => setNewProdQty(Number(e.target.value))}
                  error={formErrors.qty}
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-semibold text-[#1C2420]">
                    {isTa ? 'அலகு *' : 'Unit *'}
                  </label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value as DryCropUnit)}
                    className="w-full h-12 px-3 rounded-xl border border-[#DFE4DC] text-base font-medium bg-white text-[#1C2420] outline-hidden focus:border-[#14532D]"
                  >
                    <option value="quintal">Quintals (100 kg)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="bag">Gunny Bags (50 kg)</option>
                    <option value="tonne">Metric Tonnes</option>
                  </select>
                </div>
              </div>

              <Input
                label={isTa ? 'சேமிப்பக இடம் *' : 'Storage Location *'}
                placeholder="e.g. Farm Godown #1"
                value={newProdLocation}
                onChange={(e) => setNewProdLocation(e.target.value)}
                error={formErrors.location}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={isTa ? 'எச்சரிக்கை வரம்பு' : 'Alert Level'}
                  type="number"
                  min="1"
                  value={newProdThreshold}
                  onChange={(e) => setNewProdThreshold(Number(e.target.value))}
                />

                <Input
                  label={isTa ? 'அறுவடை தேதி' : 'Harvest Date'}
                  type="date"
                  value={newProdHarvestDate}
                  onChange={(e) => setNewProdHarvestDate(e.target.value)}
                />
              </div>

              <Input
                label={isTa ? 'மதிப்பு (₹/Unit)' : 'Unit Cost (₹)'}
                type="number"
                min="0"
                value={newProdCost}
                onChange={(e) => setNewProdCost(Number(e.target.value))}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowAddModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'சேமி' : 'Save product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL AFTER REGISTRATION
          ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E7F5EE] text-[#14532D] mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <Tag variant="success">{isTa ? 'பதிவு முடிந்தது' : 'Product Registered'}</Tag>
              <h3 className="text-base font-bold text-[#1C2420] mt-2 font-ui">
                {isTa ? showConfirmModal.nameTa : showConfirmModal.name}
              </h3>
              <p className="text-xs text-[#5B6660] font-mono mt-0.5">
                {showConfirmModal.batchLotId}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F4EC] text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'தொடக்க இருப்பு:' : 'Opening balance:'}</span>
                <span className="font-bold text-[#1C2420] tabular-nums">{showConfirmModal.quantity} {showConfirmModal.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'இடம்:' : 'Location:'}</span>
                <span className="font-medium text-[#1C2420] truncate">{showConfirmModal.storageLocation}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setShowConfirmModal(null)}
            >
              {isTa ? 'முடிந்தது' : 'Done'}
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD STOCK MODAL
          ========================================================================= */}
      {showAddStockModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14532D] font-ui">
                {isTa ? 'இருப்பு சேர்த்தல்' : 'Add Stock'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStockModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#E7F5EE] text-xs flex justify-between items-center">
              <span className="text-[#5B6660]">{isTa ? 'நடப்பு இருப்பு:' : 'Current balance:'}</span>
              <span className="text-sm font-bold text-[#14532D] tabular-nums">
                {activeProduct.quantity} {activeProduct.unit}
              </span>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3">
              <Input
                label={isTa ? 'சேர்க்க வேண்டிய அளவு *' : 'Quantity to Add *'}
                type="number"
                min="1"
                value={actionQty}
                onChange={(e) => setActionQty(Number(e.target.value))}
              />

              <Input
                label={isTa ? 'ஆதாரம் / காரணம் *' : 'Source / Reason *'}
                placeholder="e.g. Harvest lot intake"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />

              <Input
                label={isTa ? 'குறிப்புகள் (விருப்பப்படி)' : 'Notes (optional)'}
                placeholder="e.g. Verified by farm manager"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />

              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs flex justify-between font-bold">
                <span className="text-[#5B6660]">{isTa ? 'புதிய இருப்பு:' : 'Expected new balance:'}</span>
                <span className="text-[#14532D] tabular-nums">{activeProduct.quantity + actionQty} {activeProduct.unit}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowAddStockModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'உறுதிசெய்' : 'Confirm addition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          REMOVE STOCK MODAL
          ========================================================================= */}
      {showRemoveStockModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420] font-ui">
                {isTa ? 'இருப்பு கழித்தல்' : 'Remove Stock'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRemoveStockModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F4EC] text-xs flex justify-between items-center">
              <span className="text-[#5B6660]">{isTa ? 'கிடைக்கும் இருப்பு:' : 'Available:'}</span>
              <span className="text-sm font-bold text-[#1C2420] tabular-nums">
                {activeProduct.quantity} {activeProduct.unit}
              </span>
            </div>

            <form onSubmit={handleRemoveStockSubmit} className="space-y-3">
              <Input
                label={isTa ? 'கழிக்க வேண்டிய அளவு *' : 'Quantity to Remove *'}
                type="number"
                min="1"
                max={activeProduct.quantity}
                value={actionQty}
                onChange={(e) => setActionQty(Number(e.target.value))}
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-semibold text-[#1C2420]">
                  {isTa ? 'காரணம் *' : 'Reason *'}
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-[#DFE4DC] text-base font-medium bg-white text-[#1C2420] outline-hidden focus:border-[#14532D]"
                >
                  <option value="Mandi Wholesale Sale">Mandi Wholesale Sale</option>
                  <option value="Direct Farm Retail Dispatch">Direct Farm Retail Dispatch</option>
                  <option value="Self / Household Consumption">Self / Household Consumption</option>
                  <option value="Seed Retention">Seed Retention</option>
                  <option value="Pest / Spoilage Loss">Pest / Spoilage Loss</option>
                </select>
              </div>

              <Input
                label={isTa ? 'குறிப்புகள் (விருப்பப்படி)' : 'Notes (optional)'}
                placeholder="e.g. Dispatched to trader"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />

              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs flex justify-between font-bold">
                <span className="text-[#5B6660]">{isTa ? 'எஞ்சிய இருப்பு:' : 'Remaining balance:'}</span>
                <span className={`tabular-nums ${activeProduct.quantity - actionQty <= activeProduct.lowStockThreshold ? 'text-[#C2410C]' : 'text-[#1C2420]'}`}>
                  {activeProduct.quantity - actionQty} {activeProduct.unit}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowRemoveStockModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'உறுதிசெய்' : 'Confirm removal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADJUST STOCK MODAL
          ========================================================================= */}
      {showAdjustModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420] font-ui">
                {isTa ? 'இருப்பு சரிபார்த்தல்' : 'Adjust Stock'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5B6660]">
              {isTa ? 'நேரடி எண்ணிக்கைக்குப் பின் சரிபார்க்கப்பட்ட இருப்பை உள்ளிடவும்.' : 'Enter verified count following physical audit.'}
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <Input
                label={isTa ? 'சரிபார்க்கப்பட்ட நேரடி இருப்பு *' : 'Verified Physical Count *'}
                type="number"
                min="0"
                value={verifiedQty}
                onChange={(e) => setVerifiedQty(Number(e.target.value))}
              />

              <Input
                label={isTa ? 'சரிசெய்தலுக்கான காரணம் *' : 'Adjustment Reason *'}
                placeholder="e.g. Weighbridge calibration difference"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowAdjustModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'பதிவு செய்' : 'Record adjustment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TRANSFER LOCATION MODAL
          ========================================================================= */}
      {showTransferModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420] font-ui">
                {isTa ? 'இடமாற்றம்' : 'Transfer Location'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F4EC] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'தற்போதைய இடம்:' : 'Source:'}</span>
                <span className="font-semibold text-[#1C2420] truncate">{activeProduct.storageLocation}</span>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <Input
                label={isTa ? 'இடமாற்ற அளவு *' : 'Transfer Quantity *'}
                type="number"
                min="1"
                max={activeProduct.quantity}
                value={actionQty}
                onChange={(e) => setActionQty(Number(e.target.value))}
              />

              <Input
                label={isTa ? 'புதிய சேருமிடம் *' : 'Destination Storage *'}
                placeholder="e.g. Palani Central Silo #3"
                value={transferDest}
                onChange={(e) => setTransferDest(e.target.value)}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowTransferModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'இடமாற்று' : 'Confirm transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          THRESHOLD MODAL
          ========================================================================= */}
      {showThresholdModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420] font-ui">
                {isTa ? 'எச்சரிக்கை வரம்பு' : 'Low-Stock Alert Level'}
              </h3>
              <button
                type="button"
                onClick={() => setShowThresholdModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleThresholdSubmit} className="space-y-3">
              <Input
                label={`${isTa ? 'எச்சரிக்கை அளவு' : 'Threshold'} (${activeProduct.unit})`}
                type="number"
                min="1"
                value={newThresholdValue}
                onChange={(e) => setNewThresholdValue(Number(e.target.value))}
                helperText={isTa ? 'இருப்பு இந்த அளவுக்குக் குறையும்போது எச்சரிக்கை வரும்' : 'Alert triggers when stock falls below this quantity'}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowThresholdModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'சேமி' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL HISTORY LEDGER MODAL
          ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1C2420] font-ui">
                  {isTa ? 'முழு இருப்புப் பதிவேடு' : 'Stock Movement Ledger'}
                </h3>
                <p className="text-xs text-[#5B6660]">
                  {isTa ? 'அனைத்து பரிவர்த்தனை பதிவுகள்' : 'Append-only audit trail'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EC] flex items-center justify-center text-[#5B6660] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {allRecentMovements.map((tx) => (
                <div key={tx.id} className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC]/60 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#1C2420]">
                      {isTa ? tx.productNameTa : tx.productName}
                    </span>
                    <span className="font-bold text-[#14532D] tabular-nums">
                      {tx.type === 'remove' ? '-' : '+'}{tx.quantity} {tx.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#5B6660]">
                    <span>{tx.reason}</span>
                    <span className="tabular-nums">{tx.previousBalance} → {tx.newBalance}</span>
                  </div>
                  <div className="text-xs text-[#5B6660] font-mono">
                    {tx.receiptNumber} • {formatDate(tx.date)}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowHistoryModal(false)}
            >
              {isTa ? 'மூடுக' : 'Close'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
