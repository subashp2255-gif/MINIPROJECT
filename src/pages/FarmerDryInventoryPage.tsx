import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { DryProduct, DryCropCategory, DryCropUnit } from '../types';
import {
  Package,
  Plus,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  History,
  MoveRight,
  Archive,
  RefreshCw,
  X,
  FileSpreadsheet,
  Edit2,
  ShieldCheck,
} from 'lucide-react';

export const FarmerDryInventoryPage: React.FC = () => {
  const {
    dryProducts,
    addDryProduct,
    addStockDryProduct,
    removeStockDryProduct,
    adjustStockDryProduct,
    transferDryProduct,
    archiveDryProduct,
    restoreDryProduct,
    updateDryProductThreshold,
    language,
    showToast,
  } = useApp();

  const isTa = language === 'ta';

  // State for Navigation / Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Selected Product for Details View (INV6)
  const [activeProduct, setActiveProduct] = useState<DryProduct | null>(dryProducts[0] || null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRemoveStockModal, setShowRemoveStockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<DryProduct | null>(null);

  // Form states for Add Product (INV2)
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

  // Category summary calculations (Screen INV1 - separated by units)
  const unitBreakdown = useMemo(() => {
    const active = dryProducts.filter((p) => !p.isArchived);
    const quintals = active.filter((p) => p.unit === 'quintal').reduce((sum, p) => sum + p.quantity, 0);
    const kgs = active.filter((p) => p.unit === 'kg').reduce((sum, p) => sum + p.quantity, 0);
    const bags = active.filter((p) => p.unit === 'bag').reduce((sum, p) => sum + p.quantity, 0);
    const tonnes = active.filter((p) => p.unit === 'tonne').reduce((sum, p) => sum + p.quantity, 0);
    return { quintals, kgs, bags, tonnes, totalItems: active.length };
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

  // Recent movements across all dry products
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

  // Select Preset Handler
  const handleSelectPreset = (crop: typeof PRESET_CROPS[0]) => {
    setNewProdName(crop.name);
    setNewProdNameTa(crop.nameTa);
    setNewProdCategory(crop.category);
    setNewProdUnit(crop.unit);
  };

  // Submit Add Product (INV2, INV3, INV4)
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

    // Reset fields
    setNewProdName('');
    setNewProdNameTa('');
    setNewProdVariety('');
    setNewProdBatch('');
    setNewProdNotes('');
  };

  // Submit Add Stock (INV7)
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0) {
      showToast('Quantity must be positive', 'error');
      return;
    }
    const success = addStockDryProduct(activeProduct.id, actionQty, activeProduct.unit, actionReason, actionNotes);
    if (success) {
      setShowAddStockModal(false);
      // Refresh activeProduct
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Remove Stock (INV8)
  const handleRemoveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0) {
      showToast('Quantity must be positive', 'error');
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

  // Submit Adjust Stock (INV9)
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (verifiedQty < 0) {
      showToast('Verified balance cannot be negative', 'error');
      return;
    }
    const success = adjustStockDryProduct(activeProduct.id, verifiedQty, actionReason);
    if (success) {
      setShowAdjustModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Transfer Stock (INV10)
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (actionQty <= 0 || actionQty > activeProduct.quantity) {
      showToast('Invalid transfer quantity', 'error');
      return;
    }
    if (!transferDest.trim()) {
      showToast('Destination location required', 'error');
      return;
    }
    const success = transferDryProduct(activeProduct.id, actionQty, transferDest.trim(), actionReason);
    if (success) {
      setShowTransferModal(false);
      const updated = dryProducts.find((p) => p.id === activeProduct.id);
      if (updated) setActiveProduct(updated);
    }
  };

  // Submit Threshold Update (INV12)
  const handleThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    updateDryProductThreshold(activeProduct.id, newThresholdValue);
    setShowThresholdModal(false);
    const updated = dryProducts.find((p) => p.id === activeProduct.id);
    if (updated) setActiveProduct(updated);
  };

  // Archive / Restore Handler (INV13)
  const handleArchive = (product: DryProduct) => {
    if (product.quantity > 0) {
      if (confirm(`Notice: ${product.name} still has ${product.quantity} ${product.unit} remaining. Archive anyway?`)) {
        archiveDryProduct(product.id, true);
      }
    } else {
      archiveDryProduct(product.id, false);
    }
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      {/* Top Banner */}
      <div className="bg-[#A67527] text-white px-4 pt-5 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center p-2">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                {isTa ? 'தனித்தனி தானிய இருப்பு அமைப்பு' : 'Decoupled Dry Goods Module'}
              </span>
              <h1 className="text-lg font-extrabold leading-tight">
                {isTa ? 'எனது தானிய இருப்பு மேலாண்மை' : 'Enhanced Dry Inventory'}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewProdQty(10);
              setShowAddModal(true);
            }}
            className="py-2 px-3.5 rounded-xl bg-white text-[#8C5D17] text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>{isTa ? 'பயிர் சேர்க்க' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      <div className="px-3.5 sm:px-4 pt-4 space-y-5 -mt-3">
        {/* =========================================================================
            SCREEN INV1: TOTAL RECORDED STOCK BY UNIT & METRICS (No conflating units)
            ========================================================================= */}
        <section className="card-dashboard p-4 sm:p-5 space-y-3" aria-label="Stock Breakdown Summary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6660]">
              {isTa ? 'பதிவு செய்யப்பட்ட தானிய இருப்பு' : 'Recorded Dry Harvest Summary'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14532D] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
              <ShieldCheck size={12} />
              <span>{unitBreakdown.totalItems} {isTa ? 'விளைபொருட்கள்' : 'Active Lots'}</span>
            </span>
          </div>

          {/* Unit Separation Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-center">
              <span className="text-xs text-[#5B6660] block font-medium">Quintals</span>
              <span className="font-serif-hero text-2xl font-bold text-[#1C2420] mt-0.5 block">
                {unitBreakdown.quintals}
              </span>
              <span className="text-[10px] text-[#5B6660]">{isTa ? 'குவிண்டால்' : 'Paddy & Millet'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-center">
              <span className="text-xs text-[#5B6660] block font-medium">Kilograms</span>
              <span className="font-serif-hero text-2xl font-bold text-[#1C2420] mt-0.5 block">
                {unitBreakdown.kgs}
              </span>
              <span className="text-[10px] text-[#5B6660]">{isTa ? 'கிலோ' : 'Pulses & Dal'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EC] border border-[#DFE4DC] text-center">
              <span className="text-xs text-[#5B6660] block font-medium">Gunny Bags</span>
              <span className="font-serif-hero text-2xl font-bold text-[#1C2420] mt-0.5 block">
                {unitBreakdown.bags}
              </span>
              <span className="text-[10px] text-[#5B6660]">{isTa ? 'மூட்டைகள்' : 'Wheat & Grains'}</span>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Bar */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-[#5B6660]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTa ? 'பயிர் பெயர், தொகுதி, இடம் தேட...' : 'Search product, batch lot, location...'}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#DFE4DC] bg-white text-xs font-medium focus:border-[#C8923A] outline-hidden shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#5B6660] hover:text-[#1C2420]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                onlyLowStock
                  ? 'bg-[#B5472B] text-white border-[#B5472B]'
                  : 'bg-white text-[#5B6660] border-[#DFE4DC] hover:bg-[#F7F4EC]'
              }`}
            >
              <AlertTriangle size={14} />
              <span>{isTa ? 'குறைந்த இருப்பு' : 'Low Stock'}</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['all', 'rice', 'pulses', 'wheat', 'grains', 'oilseeds'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#8C5D17] text-white shadow-xs'
                    : 'bg-white text-[#5B6660] border border-[#DFE4DC] hover:bg-[#F7F4EC]'
                }`}
              >
                {cat === 'all'
                  ? isTa ? 'அனைத்தும்' : 'All Products'
                  : cat === 'rice'
                  ? isTa ? 'நெல் & அரிசி' : 'Rice / Paddy'
                  : cat === 'pulses'
                  ? isTa ? 'பருப்பு வகைகள்' : 'Pulses & Dal'
                  : cat === 'wheat'
                  ? isTa ? 'கோதுமை' : 'Wheat'
                  : cat === 'grains'
                  ? isTa ? 'தானியங்கள் (Millet)' : 'Millets & Grains'
                  : isTa ? 'எண்ணெய் வித்துக்கள்' : 'Oilseeds'}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SCREEN INV5: MY INVENTORY LIST
            ========================================================================= */}
        <section className="space-y-3" aria-label="Products List">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1C2420]">
              {isTa ? 'சேமிக்கப்பட்ட தானியப் பட்டியல்' : 'Dry Goods Catalog'}
              <span className="ml-1.5 text-xs text-[#5B6660] font-normal">({filteredProducts.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`text-xs font-semibold hover:underline cursor-pointer ${
                  showArchived ? 'text-[#B5472B]' : 'text-[#5B6660]'
                }`}
              >
                {showArchived ? (isTa ? 'செயலில் உள்ளவை' : 'Active Items') : (isTa ? 'காப்பகப் பட்டியல்' : 'Archived Items')}
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card-dashboard p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-[#8C5D17] mx-auto flex items-center justify-center">
                <Package size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#1C2420]">
                {isTa ? 'இருப்புப் பொருட்கள் இல்லை' : 'No Dry Products Found'}
              </h4>
              <p className="text-xs text-[#5B6660] max-w-xs mx-auto">
                {isTa
                  ? 'உங்கள் அறுவடை நெல், தானியம் அல்லது பருப்பு வகைகளை சேர்க்க "பயிர் சேர்க்க" பொத்தானை அழுத்தவும்.'
                  : 'Start recording your farm harvest stock. No cold storage booking required.'}
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="py-2 px-4 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] transition-all cursor-pointer"
              >
                {isTa ? 'புதிய பயிர் சேர்க்க' : 'Add First Product'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((p) => {
                const isSelected = activeProduct?.id === p.id;
                const isLow = p.status === 'low_stock';
                const isDepleted = p.quantity === 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProduct(p)}
                    className={`card-dashboard p-4 transition-all cursor-pointer border-l-4 ${
                      isSelected
                        ? 'border-l-[#8C5D17] ring-1 ring-[#8C5D17]/40 shadow-sm'
                        : isLow
                        ? 'border-l-[#B5472B]'
                        : 'border-l-[#14532D]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#DFE4DC] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-[#1C2420] truncate">
                              {isTa ? p.nameTa : p.name}
                            </h4>
                            {p.variety && (
                              <span className="text-[10px] text-[#5B6660] bg-[#F7F4EC] px-1.5 py-0.5 rounded-md">
                                {p.variety}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-serif-hero text-xl font-bold text-[#1C2420]">
                              {p.quantity}
                            </span>
                            <span className="text-xs font-bold text-[#5B6660]">{p.unit}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5B6660]">
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin size={11} className="text-[#8C5D17] flex-shrink-0" />
                              <span className="truncate">{p.storageLocation}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{p.batchLotId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            <AlertTriangle size={11} />
                            <span>{isTa ? 'குறைந்தது' : 'Low Stock'}</span>
                          </span>
                        ) : isDepleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                            {isTa ? 'தீர்ந்தது' : 'Depleted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7F5EE] text-[#14532D] text-[10px] font-bold">
                            <CheckCircle2 size={11} />
                            <span>{isTa ? 'இருப்பு உள்ளது' : 'Optimal'}</span>
                          </span>
                        )}

                        <span className="text-[10px] text-[#5B6660]">
                          {p.transactions.length} {isTa ? 'பரிவர்த்தனைகள்' : 'Movements'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
            SCREEN INV6: PRODUCT DETAILS & ACTION CONTROLS
            ========================================================================= */}
        {activeProduct && (
          <section className="card-dashboard p-5 border-t-4 border-t-[#8C5D17] space-y-4 shadow-sm" aria-label="Product Operations Console">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5D17] block">
                  {isTa ? 'தேர்ந்தெடுக்கப்பட்ட பயிர் செயல்பாடுகள்' : 'Selected Product Console'}
                </span>
                <h3 className="text-base font-extrabold text-[#1C2420]">
                  {isTa ? activeProduct.nameTa : activeProduct.name} ({activeProduct.batchLotId})
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(true)}
                  className="p-2 rounded-xl bg-[#F7F4EC] hover:bg-amber-100 text-[#8C5D17] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="Configure Alert Threshold"
                >
                  <AlertTriangle size={14} />
                  <span>{activeProduct.lowStockThreshold} {activeProduct.unit}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="p-2 rounded-xl bg-[#F7F4EC] hover:bg-[#EEF6ED] text-[#134E35] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="View History Ledger"
                >
                  <History size={14} />
                  <span>{isTa ? 'வரலாறு' : 'Ledger'}</span>
                </button>
              </div>
            </div>

            {/* Balances & Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block">{isTa ? 'நடப்பு இருப்பு' : 'Available Stock'}</span>
                <span className="text-base font-extrabold text-[#1C2420]">
                  {activeProduct.quantity} {activeProduct.unit}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block">{isTa ? 'இருப்பிடக் கிடங்கு' : 'Location'}</span>
                <span className="font-bold text-[#1C2420] truncate block" title={activeProduct.storageLocation}>
                  {activeProduct.storageLocation}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block">{isTa ? 'மதிப்பீடு' : 'Estimated Value'}</span>
                <span className="font-bold text-[#14532D]">
                  ₹{(activeProduct.totalValue || (activeProduct.unitCost || 0) * activeProduct.quantity).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block">{isTa ? 'அறுவடை தேதி' : 'Harvest Date'}</span>
                <span className="font-bold text-[#1C2420]">{activeProduct.harvestDate || '2026-08-15'}</span>
              </div>
            </div>

            {/* Core Action Buttons: Add, Remove, Adjust, Transfer */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionQty(5);
                  setActionReason('Harvest Lot Addition');
                  setShowAddStockModal(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>{isTa ? 'இருப்பு சேர்' : 'Add Stock'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionQty(Math.min(5, activeProduct.quantity));
                  setActionReason('Mandi Wholesale Sale');
                  setShowRemoveStockModal(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#A67527] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <TrendingDown size={14} />
                <span>{isTa ? 'இருப்பு எடு' : 'Remove Stock'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerifiedQty(activeProduct.quantity);
                  setActionReason('Monthly Physical Count Verification');
                  setShowAdjustModal(true);
                }}
                className="py-2.5 px-3 rounded-xl border border-[#DFE4DC] bg-white text-[#1C2420] text-xs font-bold hover:bg-[#F7F4EC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 size={14} />
                <span>{isTa ? 'சரிசெய்' : 'Adjust Stock'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionQty(Math.min(5, activeProduct.quantity));
                  setActionReason('Inter-facility godown relocation');
                  setShowTransferModal(true);
                }}
                className="py-2.5 px-3 rounded-xl border border-[#DFE4DC] bg-white text-[#1C2420] text-xs font-bold hover:bg-[#F7F4EC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MoveRight size={14} />
                <span>{isTa ? 'இடம் மாற்று' : 'Transfer'}</span>
              </button>
            </div>

            {/* Archive / Restore Button */}
            <div className="pt-1 flex justify-end">
              {activeProduct.isArchived ? (
                <button
                  type="button"
                  onClick={() => restoreDryProduct(activeProduct.id)}
                  className="text-xs font-bold text-[#14532D] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>{isTa ? 'மீண்டும் செயல்படுத்து (Restore)' : 'Restore to Active'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleArchive(activeProduct)}
                  className="text-xs font-semibold text-[#5B6660] hover:text-[#B5472B] flex items-center gap-1 cursor-pointer"
                >
                  <Archive size={13} />
                  <span>{isTa ? 'காப்பகத்தில் சேர் (Archive)' : 'Archive Product'}</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN INV11: IMMUTABLE AUDIT LEDGER PREVIEW
            ========================================================================= */}
        <section className="space-y-3" aria-label="Recent Inventory Transactions">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6660]">
              {isTa ? 'சமீபத்திய இருப்புப் பதிவேடு' : 'Recent Movement Ledger'}
            </span>
            <span className="text-[11px] font-medium text-[#5B6660]">
              {isTa ? 'மாற்ற முடியாத பதிவுகள்' : 'Append-Only Transactions'}
            </span>
          </div>

          <div className="space-y-2">
            {allRecentMovements.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-white border border-[#DFE4DC] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'initial' || tx.type === 'add'
                        ? 'bg-[#E7F5EE] text-[#14532D]'
                        : tx.type === 'remove'
                        ? 'bg-amber-100 text-[#8C5D17]'
                        : tx.type === 'transfer'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tx.type === 'initial' || tx.type === 'add' ? (
                      <TrendingUp size={14} />
                    ) : tx.type === 'remove' ? (
                      <TrendingDown size={14} />
                    ) : tx.type === 'transfer' ? (
                      <MoveRight size={14} />
                    ) : (
                      <Edit2 size={14} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[#1C2420] block truncate">
                      {isTa ? tx.productNameTa : tx.productName} • {tx.reason}
                    </span>
                    <span className="text-[10px] text-[#5B6660]">
                      {tx.receiptNumber} • {tx.date} • {tx.authorizedBy}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`font-bold block ${
                      tx.type === 'initial' || tx.type === 'add'
                        ? 'text-[#14532D]'
                        : tx.type === 'remove'
                        ? 'text-[#B5472B]'
                        : 'text-[#1C2420]'
                    }`}
                  >
                    {tx.type === 'remove' ? '-' : '+'}
                    {tx.quantity} {tx.unit}
                  </span>
                  <span className="text-[10px] text-[#5B6660]">
                    {tx.previousBalance} → {tx.newBalance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* =========================================================================
          SCREEN INV2 & INV3: ADD PRODUCT MODAL & VALIDATION
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D17] block">
                  {isTa ? 'புதிய தானியப் பதிவு' : 'New Harvest Intake'}
                </span>
                <h3 className="text-base font-extrabold text-[#1C2420]">
                  {isTa ? 'உலர்ந்த வேளாண் பொருள் பதிவு' : 'Register Dry Agricultural Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Common Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#5B6660] block">
                {isTa ? 'விரைவுப் பரிந்துரைகள் (1-கிளிக் தேர்வு):' : 'Select Common Tamil Nadu Dry Crops:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CROPS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectPreset(c)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F4EC] hover:bg-amber-100 border border-[#DFE4DC] text-[11px] font-bold text-[#1C2420] transition-colors cursor-pointer"
                  >
                    {isTa ? c.nameTa : c.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 pt-1">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'பயிரின் பெயர் *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Deluxe Ponni Raw Rice"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                />
                {formErrors.name && (
                  <span className="text-[11px] text-red-600 block">{formErrors.name}</span>
                )}
              </div>

              {/* Category & Variety */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'பிரிவு (Category) *' : 'Category *'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as DryCropCategory)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden bg-white"
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'ரகம் (Variety)' : 'Variety (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newProdVariety}
                    onChange={(e) => setNewProdVariety(e.target.value)}
                    placeholder="e.g. Grade A / BPT 5204"
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                  />
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'தொடக்க இருப்பு அளவு *' : 'Opening Quantity *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold focus:border-[#8C5D17] outline-hidden"
                  />
                  {formErrors.qty && (
                    <span className="text-[11px] text-red-600 block">{formErrors.qty}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'அலகு (Unit) *' : 'Measurement Unit *'}
                  </label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value as DryCropUnit)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold focus:border-[#8C5D17] outline-hidden bg-white"
                  >
                    <option value="quintal">Quintals (100 kg)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="bag">Standard Bags (50 kg)</option>
                    <option value="tonne">Metric Tonnes</option>
                  </select>
                </div>
              </div>

              {/* Storage Location & Low-Stock Threshold */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'சேமிப்பக இடம் *' : 'Storage Location *'}
                  </label>
                  <input
                    type="text"
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    placeholder="e.g. Farm Godown #1"
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                  />
                  {formErrors.location && (
                    <span className="text-[11px] text-red-600 block">{formErrors.location}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'குறைந்த இருப்பு எச்சரிக்கை' : 'Low Stock Alert Level'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProdThreshold}
                    onChange={(e) => setNewProdThreshold(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                  />
                </div>
              </div>

              {/* Harvest Date & Unit Cost */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'அறுவடை தேதி' : 'Harvest Date'}
                  </label>
                  <input
                    type="date"
                    value={newProdHarvestDate}
                    onChange={(e) => setNewProdHarvestDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'செலவு / விலை (₹/Unit)' : 'Unit Cost (₹/Unit)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    placeholder="3200"
                    className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold focus:border-[#8C5D17] outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isTa ? 'பொருளைப் பதிவு செய்' : 'Validate & Save Product'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SAVE CONFIRMATION MODAL
          ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E7F5EE] text-[#14532D] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]">
                {isTa ? 'பயிர் பதிவு உறுதி செய்யப்பட்டது' : 'Product Registered Successfully'}
              </span>
              <h3 className="text-lg font-bold text-[#1C2420]">
                {isTa ? showConfirmModal.nameTa : showConfirmModal.name}
              </h3>
              <p className="text-xs text-[#5B6660]">
                {isTa
                  ? 'பயிர் பதிவு எண்: '
                  : 'Record ID: '}
                <strong className="font-mono text-[#1C2420]">{showConfirmModal.productCode}</strong>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EC] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'தொடக்க இருப்பு:' : 'Opening Stock:'}</span>
                <strong className="text-[#1C2420]">{showConfirmModal.quantity} {showConfirmModal.unit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'சேமிப்பகம்:' : 'Storage Location:'}</span>
                <span className="font-medium text-[#1C2420]">{showConfirmModal.storageLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'தொகுதி எண்:' : 'Batch Lot:'}</span>
                <span className="font-mono text-[#1C2420]">{showConfirmModal.batchLotId}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(null)}
                className="w-full h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] cursor-pointer flex items-center justify-center shadow-xs"
              >
                {isTa ? 'இருப்புப் பட்டியலுக்குச் செல்' : 'Go to Inventory'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(null);
                  setShowAddModal(true);
                }}
                className="w-full h-10 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] text-xs font-semibold text-[#5B6660] hover:bg-white cursor-pointer flex items-center justify-center"
              >
                {isTa ? 'மற்றொரு பயிர் சேர்க்க' : 'Add Another Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD STOCK MODAL
          ========================================================================= */}
      {showAddStockModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14532D]">
                {isTa ? 'இருப்பு சேர்த்தல்' : 'Add Harvest Stock'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStockModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#E7F5EE] text-xs">
              <span className="text-[#5B6660] block">{isTa ? 'தற்போதைய இருப்பு:' : 'Current Balance:'}</span>
              <strong className="text-base text-[#14532D]">{activeProduct.quantity} {activeProduct.unit}</strong>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'சேர்க்க வேண்டிய அளவு *' : 'Quantity to Add *'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'காரணம் / ஆதாரம் *' : 'Reason / Source *'}
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. New harvest lot intake"
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'குறிப்புகள் / குறிப்புரை' : 'Notes / Remarks (Optional)'}
                </label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Verified bag count"
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs flex justify-between font-bold">
                <span className="text-[#5B6660]">{isTa ? 'புதிய எதிர்பார்க்கப்படும் இருப்பு:' : 'Expected New Balance:'}</span>
                <span className="text-[#14532D]">{activeProduct.quantity + actionQty} {activeProduct.unit}</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTa ? 'சேர்த்தலை உறுதிசெய்' : 'Confirm Stock Addition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          REMOVE STOCK MODAL (Non-negative enforcement)
          ========================================================================= */}
      {showRemoveStockModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#8C5D17]">
                {isTa ? 'இருப்பு கழித்தல் / விநியோகம்' : 'Remove Stock / Dispatch'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRemoveStockModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 text-xs">
              <span className="text-[#5B6660] block">{isTa ? 'கிடைக்கக்கூடிய இருப்பு:' : 'Available Stock:'}</span>
              <strong className="text-base text-[#8C5D17]">{activeProduct.quantity} {activeProduct.unit}</strong>
            </div>

            <form onSubmit={handleRemoveStockSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'கழிக்க வேண்டிய அளவு *' : 'Quantity to Remove *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeProduct.quantity}
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'காரணம் *' : 'Reason *'}
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-white"
                >
                  <option value="Mandi Wholesale Sale">Mandi Wholesale Sale</option>
                  <option value="Direct Farm Retail Dispatch">Direct Farm Retail Dispatch</option>
                  <option value="Self / Household Consumption">Self / Household Consumption</option>
                  <option value="Seed Retention">Seed Retention</option>
                  <option value="Pest / Spoilage Loss">Pest / Spoilage Loss</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs flex justify-between font-bold">
                <span className="text-[#5B6660]">{isTa ? 'எஞ்சிய இருப்பு:' : 'Remaining Balance:'}</span>
                <span className={activeProduct.quantity - actionQty <= activeProduct.lowStockThreshold ? 'text-red-700' : 'text-[#1C2420]'}>
                  {activeProduct.quantity - actionQty} {activeProduct.unit}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveStockModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTa ? 'கழித்தலை உறுதிசெய்' : 'Confirm Stock Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADJUST STOCK MODAL (Physical Audit Verification)
          ========================================================================= */}
      {showAdjustModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420]">
                {isTa ? 'நேரடி இருப்பு தணிக்கை' : 'Physical Stock Audit Adjustment'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5B6660]">
              {isTa
                ? 'நேரடி எண்ணிக்கைக்குப் பின் இருப்பை சரிசெய்யவும். இந்த மாற்றம் பதிவேட்டில் தணிக்கை செய்யப்படும்.'
                : 'Use this only after a verified physical audit. The correction will be logged as an immutable audit event.'}
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs flex justify-between">
                <span className="text-[#5B6660]">{isTa ? 'பதிவில் உள்ள இருப்பு:' : 'Recorded Balance:'}</span>
                <strong className="text-[#1C2420]">{activeProduct.quantity} {activeProduct.unit}</strong>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'சரிபார்க்கப்பட்ட நேரடி இருப்பு *' : 'Verified Physical Balance *'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={verifiedQty}
                  onChange={(e) => setVerifiedQty(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'சரிசெய்தலுக்கான காரணம் *' : 'Adjustment Reason *'}
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Weighbridge calibration difference"
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#1C2420] text-white text-xs font-bold hover:bg-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTa ? 'தணிக்கை உறுதிசெய்' : 'Record Audit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TRANSFER LOCATION MODAL
          ========================================================================= */}
      {showTransferModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420]">
                {isTa ? 'கிடங்கு இடமாற்றம்' : 'Transfer Between Locations'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-[#F7F4EC] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B6660]">{isTa ? 'தற்போதைய இடம்:' : 'Source Location:'}</span>
                  <strong className="text-[#1C2420]">{activeProduct.storageLocation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6660]">{isTa ? 'கிடைக்கும் இருப்பு:' : 'Available:'}</span>
                  <strong className="text-[#1C2420]">{activeProduct.quantity} {activeProduct.unit}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'இடமாற்ற அளவு *' : 'Transfer Quantity *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeProduct.quantity}
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? 'புதிய சேருமிடம் *' : 'Destination Storage Location *'}
                </label>
                <input
                  type="text"
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  placeholder="e.g. Palani Central Silo #3"
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTa ? 'இடமாற்றத்தை உறுதிசெய்' : 'Confirm Location Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIGURE LOW-STOCK THRESHOLD MODAL
          ========================================================================= */}
      {showThresholdModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1C2420]">
                {isTa ? 'குறைந்த இருப்பு எச்சரிக்கை வரம்பு' : 'Configure Low-Stock Alert'}
              </h3>
              <button
                type="button"
                onClick={() => setShowThresholdModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5B6660] leading-relaxed">
              {isTa
                ? `${activeProduct.nameTa} இருப்பு இந்த அளவுக்கு குறையும்போது அறிவிப்பு அனுப்பப்படும்.`
                : `Set minimum balance for ${activeProduct.name}. An alert triggers when stock crosses below this threshold.`}
            </p>

            <form onSubmit={handleThresholdSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#404941]">
                  {isTa ? `எச்சரிக்கை அளவு (${activeProduct.unit})` : `Threshold in ${activeProduct.unit}`}
                </label>
                <input
                  type="number"
                  min="1"
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(false)}
                  className="w-1/3 h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-semibold text-[#5B6660] hover:bg-[#F7F4EC] cursor-pointer"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 rounded-xl bg-[#8C5D17] text-white text-xs font-bold hover:bg-[#704910] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTa ? 'வரம்பை சேமி' : 'Save Alert Threshold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCT TRANSACTION HISTORY MODAL
          ========================================================================= */}
      {showHistoryModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE4DC]">
              <div>
                <h3 className="text-base font-bold text-[#1C2420]">
                  {isTa ? 'முழு பரிவர்த்தனை பதிவேடு' : 'Stock Movement Ledger'}
                </h3>
                <span className="text-xs text-[#5B6660]">{activeProduct.name} ({activeProduct.batchLotId})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-10 h-10 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660] hover:bg-[#E7F5EE] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
              {activeProduct.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#F7F4EC] border border-[#DFE4DC] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#1C2420] block">{tx.reason}</span>
                    <span className="text-[10px] text-[#5B6660] block">
                      {tx.receiptNumber} • {tx.date} • {tx.authorizedBy}
                    </span>
                    {tx.sourceLocation && tx.destinationLocation && (
                      <span className="text-[10px] text-blue-700 block font-medium">
                        {tx.sourceLocation} → {tx.destinationLocation}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        tx.type === 'remove' ? 'text-[#B5472B]' : 'text-[#14532D]'
                      }`}
                    >
                      {tx.type === 'remove' ? '-' : '+'}
                      {tx.quantity} {tx.unit}
                    </span>
                    <span className="text-[10px] text-[#5B6660]">
                      {tx.previousBalance} → {tx.newBalance}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                showToast(isTa ? 'CSV பதிவேடு பதிவிறக்கப்பட்டது!' : 'Transaction ledger exported to CSV format.', 'success');
              }}
              className="w-full h-12 rounded-xl border border-[#DFE4DC] bg-white text-xs font-bold text-[#1C2420] hover:bg-[#F7F4EC] flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet size={16} />
              <span>{isTa ? 'CSV கோப்பாக பதிவிறக்கு' : 'Export Movement Ledger (CSV)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
