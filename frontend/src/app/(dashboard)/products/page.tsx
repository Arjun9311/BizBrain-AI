'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  QrCode, 
  Barcode as BarcodeIcon, 
  Edit, 
  Trash2,
  Sparkles,
  Warehouse,
  Coins
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  warehouse: string;
  expiryDate: string | null;
  category?: { name: string };
  supplier?: { name: string };
  categoryId?: string;
  supplierId?: string;
}

export default function ProductsPage() {
  const { token } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals / Details states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Barcode visualization modal
  const [activeBarcode, setActiveBarcode] = useState<{
    name: string;
    sku: string;
    barcode: string;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct.id}`
      : 'http://localhost:5000/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name, sku, barcode, description, price, cost, stock, minStock, warehouse
        })
      });

      if (res.ok) {
        fetchProducts();
        setShowAddModal(false);
        setEditingProduct(null);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setDescription(p.description || '');
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setMinStock(p.minStock);
    setWarehouse(p.warehouse);
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setDescription('');
    setPrice(0);
    setCost(0);
    setStock(0);
    setMinStock(5);
    setWarehouse('Main Warehouse');
  };

  // Filter and Pagination States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categoriesList = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));
  const warehousesList = Array.from(new Set(products.map(p => p.warehouse).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategoryFilter ? (p.category?.name === selectedCategoryFilter) : true;
    const matchesWarehouse = selectedWarehouseFilter ? (p.warehouse === selectedWarehouseFilter) : true;
    return matchesSearch && matchesCategory && matchesWarehouse;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage stock inventory, pricing ledger, and SKU barcodes.</p>
        </div>
        
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow shadow-blue-500/15 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Analytics alerts banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-500/10 border border-amber-500/15 p-4 rounded-xl flex items-center gap-3">
          <span className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500">Low Stock Indicators</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {products.filter(p => p.stock <= p.minStock).length} products require restocking orders.
            </p>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/15 p-4 rounded-xl flex items-center gap-3">
          <span className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
            <Warehouse className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-500">Warehouses Active</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Main Warehouse, West Wing Depot.
            </p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/15 p-4 rounded-xl flex items-center gap-3">
          <span className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Coins className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-500">Total Portfolio Value</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ${products.reduce((sum, p) => sum + (p.stock * p.cost), 0).toFixed(2)} valuation asset.
            </p>
          </div>
        </div>
      </div>

      {/* Core catalog list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-100/40 dark:shadow-none">
        
        {/* Search tool */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedWarehouseFilter}
              onChange={(e) => {
                setSelectedWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Warehouses</option>
              {warehousesList.map(wh => (
                <option key={wh} value={wh}>{wh}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-right">Cost</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">No products registered yet.</td>
                </tr>
              ) : (
                paginatedProducts.map(p => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                      <td className="p-4 font-mono font-semibold">{p.sku}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="p-4">{p.warehouse}</td>
                      <td className="p-4">{p.supplier?.name || 'Logitech Global'}</td>
                      <td className="p-4 text-right">${p.cost.toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold">${p.price.toFixed(2)}</td>
                      <td className="p-4 text-center font-bold">{p.stock}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                          isLow ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveBarcode({ name: p.name, sku: p.sku, barcode: p.barcode || p.sku })}
                            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500"
                            title="Generate QR/Barcode"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-500"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p.id)}
                            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded shadow disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold transition-all"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded shadow disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal popup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 animate-slide-in">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Catalog New Product'}
            </h3>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Name</label>
                  <input
                    type="text" required placeholder="e.g. Ergonomic Keyboard"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">SKU identifier</label>
                  <input
                    type="text" required placeholder="e.g. ACC-KEY-ERG"
                    value={sku} onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Supplier Cost ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={cost} onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Selling Price ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Barcode Code</label>
                  <input
                    type="text" placeholder="e.g. 97831614..."
                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Current Stock</label>
                  <input
                    type="number" required
                    value={stock} onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Warning Stock</label>
                  <input
                    type="number" required
                    value={minStock} onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Warehouse Depot</label>
                  <input
                    type="text" placeholder="Main Warehouse"
                    value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2} placeholder="Write specifications of product..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  {editingProduct ? 'Save Changes' : 'Catalog Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & QR Code Visual Generator popup */}
      {activeBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 text-center animate-slide-in space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">BizBrain Barcode Generator</h3>
            <p className="text-xs text-slate-500">Asset: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeBarcode.name}</span></p>
            
            {/* Barcode Simulation */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center mx-auto space-y-3 shadow-inner">
              <div className="flex h-12 gap-0.5">
                {[1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 2, 1, 3, 2, 1, 4, 1].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="bg-black h-full"
                    style={{ width: `${w * 1.8}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-slate-900 tracking-widest">{activeBarcode.barcode}</span>
            </div>

            {/* QR Code simulation side-by-side */}
            <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400">
              <QrCode className="w-3.5 h-3.5" />
              <span>SKU mapping: {activeBarcode.sku}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveBarcode(null)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200"
              >
                Close Visualizer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
