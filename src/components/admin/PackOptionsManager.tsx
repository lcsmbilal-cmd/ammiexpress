import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Tag,
  Check,
  RotateCcw,
  Eye,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';
import { Product, ProductPackOption } from '../../types';
import { adminFetch } from '../../utils/adminApi';

interface PackOptionsEditableTableProps {
  packOptions: ProductPackOption[];
  defaultSalePrice?: number;
  defaultRegularPrice?: number;
  onChange: (next: ProductPackOption[]) => void;
  onRequestClearAll?: () => void;
}

export const PackOptionsEditableTable: React.FC<PackOptionsEditableTableProps> = ({
  packOptions,
  defaultSalePrice = 3200,
  defaultRegularPrice = 4200,
  onChange,
  onRequestClearAll
}) => {
  const handleUpdateRow = (index: number, patch: Partial<ProductPackOption>) => {
    const next = packOptions.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const handleSetDefault = (index: number) => {
    const next = packOptions.map((item, idx) => ({
      ...item,
      isDefault: idx === index
    }));
    onChange(next);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= packOptions.length) return;
    const next = [...packOptions];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  };

  const handleDeleteRow = (index: number) => {
    const next = packOptions.filter((_, idx) => idx !== index);
    if (next.length > 0 && !next.some((p) => p.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const handleAddRow = () => {
    const newRow: ProductPackOption = {
      id: `pack-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: '1 KG',
      sublabel: '',
      price: Number(defaultSalePrice) || 3200,
      regularPrice: Number(defaultRegularPrice) || 4200,
      discountText: '',
      badge: '',
      inStock: true,
      isDefault: packOptions.length === 0
    };
    onChange([...packOptions, newRow]);
  };

  const handleLoadDesiGheePreset = () => {
    const base = Number(defaultSalePrice) || 3200;
    const reg = Number(defaultRegularPrice) || 4200;
    const half = Math.round((base / 2 + 100) / 50) * 50;
    const halfReg = Math.round((reg / 2) / 50) * 50;
    const preset: ProductPackOption[] = [
      {
        id: 'pack-500g',
        label: '500g',
        sublabel: 'Half KG Jar',
        price: half,
        regularPrice: halfReg,
        discountText: '',
        badge: 'Trial Pack',
        inStock: true,
        isDefault: false
      },
      {
        id: 'pack-1kg',
        label: '1 KG',
        sublabel: 'Standard 1 KG Jar',
        price: base,
        regularPrice: reg,
        discountText: '',
        badge: 'Most Popular',
        inStock: true,
        isDefault: true
      },
      {
        id: 'pack-2kg',
        label: '2 KG',
        sublabel: 'Family Pack (2 x 1 KG)',
        price: Math.max(0, base * 2 - 200),
        regularPrice: reg * 2,
        discountText: 'Discount Offer • Save Rs. 200',
        badge: 'Discount Offer',
        inStock: true,
        isDefault: false
      },
      {
        id: 'pack-3kg',
        label: '3 KG',
        sublabel: 'Mega Family Pack (3 x 1 KG)',
        price: Math.max(0, base * 3 - 500),
        regularPrice: reg * 3,
        discountText: 'Best Discount Offer • Save Rs. 500',
        badge: 'Best Offer',
        inStock: true,
        isDefault: false
      }
    ];
    onChange(preset);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5">
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
            Pack Sizes &amp; Discount Offers Table
          </h4>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Edit weights, prices, or discount offers directly in the table. Leave empty or remove all rows to hide this frame on the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#F5B800] text-white hover:text-black rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          {packOptions.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDesiGheePreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load 500g / 1 KG / Offers Preset</span>
            </button>
          )}

          {packOptions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onRequestClearAll) {
                  onRequestClearAll();
                } else {
                  onChange([]);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All</span>
            </button>
          )}
        </div>
      </div>

      {/* Editable Table */}
      {packOptions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">No Pack Sizes or Discount Offers Added</p>
            <p className="text-xs text-gray-500 mt-1">
              The Pack Size &amp; Discount Offer frame is currently hidden on the storefront. Click &quot;Add Row&quot; or load the preset to display it.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-2 bg-[#171717] text-white rounded-xl text-xs font-bold hover:bg-[#F5B800] hover:text-black transition cursor-pointer"
            >
              + Add Custom Row
            </button>
            <button
              type="button"
              onClick={handleLoadDesiGheePreset}
              className="px-3.5 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-200 transition cursor-pointer"
            >
              Load Desi Ghee Standard Table
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-2.5 w-16 text-center">Order</th>
                  <th className="py-3 px-2.5 w-32">Weight / Label</th>
                  <th className="py-3 px-2.5 w-40">Sub-Label</th>
                  <th className="py-3 px-2.5 w-28">Sale Price (Rs.)</th>
                  <th className="py-3 px-2.5 w-28">Regular (Rs.)</th>
                  <th className="py-3 px-2.5">Discount Offer Text</th>
                  <th className="py-3 px-2.5 w-20 text-center">Default</th>
                  <th className="py-3 px-2.5 w-20 text-center">In Stock</th>
                  <th className="py-3 px-2.5 w-16 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {packOptions.map((pack, idx) => (
                  <tr
                    key={pack.id || idx}
                    className={`transition-colors ${
                      pack.isDefault ? 'bg-amber-50/40' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    {/* Order */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveRow(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRow(idx, 'down')}
                          disabled={idx === packOptions.length - 1}
                          title="Move Down"
                          className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Weight / Label */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        value={pack.label}
                        onChange={(e) => handleUpdateRow(idx, { label: e.target.value })}
                        placeholder="e.g. 1 KG"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                      />
                    </td>

                    {/* Sub-Label */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        value={pack.sublabel || ''}
                        onChange={(e) => handleUpdateRow(idx, { sublabel: e.target.value })}
                        placeholder="e.g. Half KG Jar"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                      />
                    </td>

                    {/* Sale Price */}
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min={0}
                        value={pack.price}
                        onChange={(e) => handleUpdateRow(idx, { price: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                      />
                    </td>

                    {/* Regular Price */}
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min={0}
                        value={pack.regularPrice ?? ''}
                        onChange={(e) =>
                          handleUpdateRow(idx, {
                            regularPrice: e.target.value === '' ? undefined : Number(e.target.value) || 0
                          })
                        }
                        placeholder="Optional"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                      />
                    </td>

                    {/* Discount Offer Text */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        value={pack.discountText || ''}
                        onChange={(e) => handleUpdateRow(idx, { discountText: e.target.value })}
                        placeholder="Empty = standard box | e.g. Discount Offer • Save Rs. 200"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                      />
                    </td>

                    {/* Default Radio */}
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="radio"
                        name="packDefaultRadio"
                        checked={!!pack.isDefault}
                        onChange={() => handleSetDefault(idx)}
                        aria-label={`Set ${pack.label} as default`}
                        className="w-4 h-4 text-[#F5B800] focus:ring-[#F5B800] cursor-pointer"
                      />
                    </td>

                    {/* In Stock Checkbox */}
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={pack.inStock !== false}
                        onChange={(e) => handleUpdateRow(idx, { inStock: e.target.checked })}
                        aria-label={`${pack.label} in stock`}
                        className="w-4 h-4 rounded text-[#16803D] focus:ring-[#16803D] cursor-pointer"
                      />
                    </td>

                    {/* Delete Row */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        title="Delete Row"
                        className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface PackOptionsManagerProps {
  products: Product[];
  activeProduct: Product | null;
  onRefreshProducts: () => Promise<void>;
  onProductUpdated: (product: Product) => void;
}

export const PackOptionsManager: React.FC<PackOptionsManagerProps> = ({
  products,
  activeProduct,
  onRefreshProducts,
  onProductUpdated
}) => {
  const availableProducts = products.filter((p) => p.status !== 'trash');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    activeProduct?.id || availableProducts[0]?.id || ''
  );

  const selectedProduct =
    availableProducts.find((p) => p.id === selectedProductId) ||
    activeProduct ||
    availableProducts[0] ||
    null;

  const [packRows, setPackRows] = useState<ProductPackOption[]>(
    Array.isArray(selectedProduct?.packOptions) ? selectedProduct!.packOptions! : []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!selectedProductId && (activeProduct?.id || availableProducts[0]?.id)) {
      setSelectedProductId(activeProduct?.id || availableProducts[0]?.id || '');
    }
  }, [activeProduct?.id, availableProducts.length]);

  useEffect(() => {
    if (selectedProduct) {
      setPackRows(Array.isArray(selectedProduct.packOptions) ? selectedProduct.packOptions : []);
      setDirty(false);
    }
  }, [selectedProduct?.id, selectedProduct?.updatedAt]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const persistPackRows = async (rowsToSave: ProductPackOption[], successMessage: string) => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const cleaned = rowsToSave
        .filter((r) => r.label && r.label.trim().length > 0)
        .map((r) => ({
          ...r,
          label: r.label.trim(),
          sublabel: (r.sublabel || '').trim(),
          discountText: (r.discountText || '').trim(),
          price: Number(r.price) || 0,
          regularPrice: r.regularPrice !== undefined ? Number(r.regularPrice) || 0 : undefined
        }));

      const res = await adminFetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          packOptions: cleaned
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update pack options');

      setPackRows(cleaned);
      setDirty(false);
      if (data.product) {
        onProductUpdated(data.product);
      }
      await onRefreshProducts();
      showToast('success', successMessage);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving pack options');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await persistPackRows(
      packRows,
      'Pack Sizes & Discount Offers saved and published to live storefront!'
    );
  };

  const handleConfirmClearAll = async () => {
    setShowClearModal(false);
    await persistPackRows(
      [],
      'All Pack Sizes & Discount Offers removed. Frame is now hidden from storefront!'
    );
  };

  if (!selectedProduct) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
        No active product found. Please publish or create a product in Product Catalog first.
      </div>
    );
  }

  const standardPreview = packRows.filter((p) => !p.discountText || !p.discountText.trim());
  const offerPreview = packRows.filter((p) => p.discountText && p.discountText.trim());
  const activePreview =
    packRows.find((p) => p.isDefault && p.inStock !== false) ||
    packRows.find((p) => p.inStock !== false) ||
    packRows[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Pack Sizes &amp; Discount Offers Editor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage 500g, 1 KG, and multi-pack discount offers shown next to the product photo &amp; in checkout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {availableProducts.length > 1 && (
            <select
              value={selectedProduct.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.status === 'published' ? '(Live)' : `(${p.status})`}
                </option>
              ))}
            </select>
          )}

          {packRows.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All / Hide</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#171717] rounded-xl text-xs font-black shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : dirty ? 'Save Changes *' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editable Table */}
      <PackOptionsEditableTable
        packOptions={packRows}
        defaultSalePrice={selectedProduct.salePrice}
        defaultRegularPrice={selectedProduct.regularPrice}
        onChange={(next) => {
          setPackRows(next);
          setDirty(true);
        }}
        onRequestClearAll={() => setShowClearModal(true)}
      />

      {/* Storefront Frame Live Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-gray-800">
            <Eye className="w-4 h-4 text-[#F5B800]" />
            <span>Live Storefront Side Frame Preview</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">
            Product: {selectedProduct.title}
          </span>
        </div>

        {packRows.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 text-center">
            This frame will <strong>not</strong> appear on the storefront because all rows are removed. Save changes to update the live store.
          </div>
        ) : (
          <div className="max-w-lg rounded-2xl border-2 border-[#E7C973] bg-gradient-to-br from-[#FFFEFA] via-white to-[#FFF8E1]/75 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#EFE3BD]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Pack Size:</span>
                <span className="text-sm font-black text-[#171717]">
                  {activePreview?.label} — Rs. {(activePreview?.price ?? 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#16803D]">Choose Weight &amp; Offer</span>
            </div>

            {standardPreview.length > 0 && (
              <div className={`grid gap-2.5 ${standardPreview.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {standardPreview.map((pack) => {
                  const isSel = activePreview?.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      className={`rounded-xl p-3 border-2 ${
                        pack.inStock === false
                          ? 'opacity-50 bg-neutral-100 border-neutral-200'
                          : isSel
                          ? 'border-[#171717] bg-[#FFF9E6] ring-2 ring-[#F5B800]/35'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-black text-[#171717] block">{pack.label}</span>
                          {pack.sublabel && (
                            <span className="text-[11px] text-neutral-500 block">{pack.sublabel}</span>
                          )}
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSel ? 'bg-[#171717] border-[#171717] text-[#F5B800]' : 'border-neutral-300'
                          }`}
                        >
                          {isSel && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#171717]">Rs. {Number(pack.price || 0).toLocaleString()}</span>
                        {pack.regularPrice && pack.regularPrice > pack.price && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            Rs. {Number(pack.regularPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {offerPreview.length > 0 && (
              <div className={`space-y-2 ${standardPreview.length > 0 ? 'mt-2.5' : ''}`}>
                {offerPreview.map((pack) => {
                  const isSel = activePreview?.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      className={`rounded-xl px-3.5 py-2.5 border-2 flex items-center justify-between gap-2 ${
                        pack.inStock === false
                          ? 'opacity-50 bg-neutral-100 border-neutral-200'
                          : isSel
                          ? 'border-[#171717] bg-gradient-to-r from-[#FFF9E6] to-[#ECFDF5]/60'
                          : 'border-[#E6D5A7] bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                            isSel ? 'bg-[#171717] border-[#171717] text-[#F5B800]' : 'border-neutral-300'
                          }`}
                        >
                          {isSel && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <div>
                          <div className="text-sm font-black text-[#171717]">
                            {pack.label} {pack.sublabel ? <span className="text-xs font-medium text-neutral-500">· {pack.sublabel}</span> : null}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-extrabold text-[#16803D]">
                            <Tag className="w-3 h-3" />
                            <span>{pack.discountText}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#171717] block">Rs. {Number(pack.price || 0).toLocaleString()}</span>
                        {pack.regularPrice && pack.regularPrice > pack.price && (
                          <span className="text-[11px] text-neutral-400 line-through block">
                            Rs. {Number(pack.regularPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Remove All */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Remove All Pack Sizes &amp; Offers?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Are you sure you want to permanently remove all {packRows.length} pack rows from <strong>{selectedProduct.title}</strong>? This will immediately hide the Pack Size &amp; Discount Offer frame from the storefront. You can always re-add rows later.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={saving}
                className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Removing...' : 'Yes, Remove All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
