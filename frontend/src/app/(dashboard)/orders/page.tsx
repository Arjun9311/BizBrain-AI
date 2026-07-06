'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Truck,
  PlusCircle,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; sku: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  trackingCode: string | null;
  orderDate: string;
  customer?: { name: string; email: string };
  items: OrderItem[];
}

export default function OrdersPage() {
  const { token } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // checkout drawer modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderType, setOrderType] = useState('OFFLINE');
  const [notes, setNotes] = useState('');
  
  // Cart items list [{ productId, quantity, price }]
  const [cart, setCart] = useState<{ productId: string; quantity: number; price: number }[]>([]);

  const fetchOrdersAndAssets = async () => {
    try {
      const ordRes = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const custRes = await fetch('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodRes = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (ordRes.ok && custRes.ok && prodRes.ok) {
        setOrders(await ordRes.json());
        setCustomers(await custRes.json());
        const prods = await prodRes.json();
        setProducts(prods);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrdersAndAssets();
    }
  }, [token]);

  const handleAddToCart = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setCart(prev => [...prev, {
      productId: defaultProduct.id,
      quantity: 1,
      price: defaultProduct.price
    }]);
  };

  const handleCartItemChange = (index: number, key: 'productId' | 'quantity', value: any) => {
    const updated = [...cart];
    updated[index] = { ...updated[index], [key]: value };
    
    // Auto-update price if product changes
    if (key === 'productId') {
      const selected = products.find(p => p.id === value);
      if (selected) {
        updated[index].price = selected.price;
      }
    }
    setCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: selectedCustomerId || null,
          type: orderType,
          notes,
          items: cart
        })
      });

      if (res.ok) {
        fetchOrdersAndAssets();
        setShowCheckoutModal(false);
        setCart([]);
        setSelectedCustomerId('');
        setNotes('');
      } else {
        const errData = await res.json();
        alert(`Checkout Failed: ${errData.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer && o.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  const calculateCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sales Pipeline & Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Dispatch local orders, log invoices, and trace shipping delivery statuses.</p>
        </div>
        
        <button
          onClick={() => {
            if (products.length > 0) {
              setCart([{ productId: products[0].id, quantity: 1, price: products[0].price }]);
            }
            setShowCheckoutModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales count</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">{orders.length}</h4>
          </div>
          <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><ShoppingCart className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Orders</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </h4>
          </div>
          <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Orders</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">
              {orders.filter(o => o.status === 'PENDING').length}
            </h4>
          </div>
          <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Clock className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Digital Orders</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">
              {orders.filter(o => o.type === 'ONLINE').length}
            </h4>
          </div>
          <span className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg"><Truck className="w-5 h-5" /></span>
        </div>
      </div>

      {/* Orders log table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-100/40 dark:shadow-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / SKU List</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Invoice Sum</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Tracking Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading order timeline...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No orders compiled.</td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                    <td className="p-4 font-semibold">{o.orderNumber}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{o.customer?.name || 'Walk-in Customer'}</td>
                    <td className="p-4 font-medium max-w-[200px] truncate">
                      {o.items?.map(it => `${it.product?.name} (x${it.quantity})`).join(', ') || 'General Item'}
                    </td>
                    <td className="p-4">{new Date(o.orderDate).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold">{o.type}</td>
                    <td className="p-4 text-right font-bold">${o.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                        o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                        o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-rose-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{o.trackingCode || 'MOCK-TRK-PENDING'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Wizard Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 animate-slide-in flex flex-col max-h-[90vh]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">New Checkout Invoice Wizard</h3>
            
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Walk-in Client (No CRM history)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.segment})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Channel</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="OFFLINE">Offline Desk POS</option>
                    <option value="ONLINE">Online Portal/Stripe API</option>
                  </select>
                </div>
              </div>

              {/* Items checkout block */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Cart items</label>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add item
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 border border-dashed rounded-lg text-center">Cart is empty</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                        
                        <div className="col-span-6">
                          <select
                            value={item.productId}
                            onChange={(e) => handleCartItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-250"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.sku} - {p.name} (${p.price})</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number" min={1} required
                            value={item.quantity}
                            onChange={(e) => handleCartItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-xs text-center text-slate-800 dark:text-slate-250"
                          />
                        </div>

                        <div className="col-span-2 text-right font-bold text-xs">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total calculations visual */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${calculateCartSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">GST (18% standard):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${(calculateCartSubtotal() * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-950 dark:text-white">
                  <span>Grand Total (with Tax):</span>
                  <span>${(calculateCartSubtotal() * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Check-out Notes</label>
                <textarea
                  rows={2} placeholder="Add checkout comment instructions..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow shadow-blue-600/10 disabled:opacity-40"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
