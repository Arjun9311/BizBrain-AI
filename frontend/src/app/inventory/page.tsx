'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Warehouse, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  TrendingUp, 
  Calendar, 
  Plus,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface Movement {
  id: string;
  productId: string;
  quantity: number;
  type: string;
  reason: string;
  warehouse: string;
  createdAt: string;
  product: { name: string; sku: string };
}

interface ReorderAdvice {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  supplier: string;
  daysUntilOut: number;
  recommendedOrder: number;
  priority: string;
}

export default function InventoryPage() {
  const { token } = useAuth();
  
  const [movements, setMovements] = useState<Movement[]>([]);
  const [reorders, setReorders] = useState<ReorderAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual movement adjustments state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState('IN');
  const [adjustReason, setAdjustReason] = useState('Adjustment');
  const [adjustWarehouse, setAdjustWarehouse] = useState('Main Warehouse');

  const fetchInventoryData = async () => {
    try {
      const moveRes = await fetch('http://localhost:5000/api/inventory/movement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const forecastRes = await fetch('http://localhost:5000/api/inventory/forecasting', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodRes = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (moveRes.ok && forecastRes.ok && prodRes.ok) {
        const moves = await moveRes.json();
        const fore = await forecastRes.json();
        const prods = await prodRes.json();
        
        setMovements(moves);
        setReorders(fore);
        setProducts(prods);
        if (prods.length > 0) {
          setSelectedProductId(prods[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInventoryData();
    }
  }, [token]);

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      // Fetch details of product to get current stock and warehouse
      const prod = products.find(p => p.id === selectedProductId);
      const currentStock = prod ? prod.stock : 0;
      const nextStock = adjustType === 'IN' ? currentStock + adjustQty : currentStock - adjustQty;

      // Update product stock level in database
      const updateRes = await fetch(`http://localhost:5000/api/products/${selectedProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          stock: nextStock,
          warehouse: adjustWarehouse
        })
      });

      if (updateRes.ok) {
        fetchInventoryData();
        setShowAdjustModal(false);
        setAdjustQty(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerReorder = async (productId: string, reorderQty: number, currentWarehouse: string) => {
    try {
      const prod = products.find(p => p.id === productId);
      const currentStock = prod ? prod.stock : 0;
      
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          stock: currentStock + reorderQty,
          warehouse: currentWarehouse
        })
      });

      if (res.ok) {
        alert(`Successfully ordered ${reorderQty} units. Inventory logs have been updated.`);
        fetchInventoryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Controls</h1>
          <p className="text-xs text-slate-500 mt-1">Track stocks forecasting models, log movements, and issue supply orders.</p>
        </div>
        
        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Stock Adjustment
        </button>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Forecast and Reorders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Forecasting Widget */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 rounded-2xl border border-blue-500/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-blue-500/10 pointer-events-none">
              <Sparkles className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-2.5 mb-4">
              <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">AI Reorder Forecasting</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Analyzing sales run rates and inventory depletion speeds. Below are items that should be reordered to avoid stockouts.
            </p>

            {loading ? (
              <div className="text-xs text-slate-500 animate-pulse">Computing models...</div>
            ) : reorders.length === 0 ? (
              <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-slate-400">
                All inventory categories are well-stocked. No reorder triggers active.
              </div>
            ) : (
              <div className="space-y-4">
                {reorders.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase ${
                          item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        SKU: {item.sku} | Supplier: {item.supplier}
                      </p>
                      <div className="flex gap-4 mt-2.5 text-[10px] text-slate-400">
                        <span>Current Stock: <strong className="text-white">{item.currentStock}</strong></span>
                        <span>Min Stock: <strong className="text-white">{item.minStock}</strong></span>
                        <span>Estimated Stockout: <strong className="text-red-400">{item.daysUntilOut} days</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Recommended</span>
                        <strong className="text-xs text-emerald-400 font-extrabold">{item.recommendedOrder} units</strong>
                      </div>
                      <button
                        onClick={() => handleTriggerReorder(item.id, item.recommendedOrder, 'Main Warehouse')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow shadow-blue-600/10 transition-colors"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warehouse Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Depot & Warehouse Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Main Warehouse</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Silicon Valley Depot</p>
                  </div>
                  <span className="text-xs font-bold text-blue-500">Active</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Categories</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">Electronics, Accessories</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">West Wing Depot</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Furniture Distribution</p>
                  </div>
                  <span className="text-xs font-bold text-blue-500">Active</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Categories</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">Office Furniture</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent movements feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col h-[calc(100vh-230px)] overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Stock Movements Ledger</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 divide-y divide-slate-100 dark:divide-slate-800/40">
            {loading ? (
              <div className="text-center text-xs text-slate-500 animate-pulse py-8">Loading log...</div>
            ) : movements.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">No movements logged</div>
            ) : (
              movements.map((m, idx) => (
                <div key={m.id} className={`flex items-start justify-between gap-2 pt-4 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
                  <div className="truncate pr-2 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{m.product?.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono">{m.product?.sku}</span>
                      <span>•</span>
                      <span>{m.reason}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                      m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {m.type === 'IN' ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{m.quantity}
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5" /> -{m.quantity}
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1">{m.warehouse}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Manual adjustments Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-slide-in">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Manual Stock Adjustment</h3>
            
            <form onSubmit={handleManualAdjustment} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="IN">Increase (+) Stock</option>
                    <option value="OUT">Decrease (-) Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number" min={1} required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reason/Trigger</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Purchase">Purchase replenishment</option>
                    <option value="Sale">Sale deduction</option>
                    <option value="Adjustment">Manual cycle count</option>
                    <option value="Expiry">Expiry/Damage scrap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Depot</label>
                  <select
                    value={adjustWarehouse}
                    onChange={(e) => setAdjustWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="West Wing Depot">West Wing Depot</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
