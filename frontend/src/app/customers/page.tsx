'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  DollarSign, 
  FileText,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  segment: string;
  loyaltyScore: number;
  outstandingAmount: number;
  createdAt: string;
  orders?: any[];
}

export default function CustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form states for creating new customer
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSegment, setNewSegment] = useState('General');

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomerDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token]);

  useEffect(() => {
    if (selectedCustomerId && token) {
      fetchCustomerDetail(selectedCustomerId);
    }
  }, [selectedCustomerId, token]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          address: newAddress,
          segment: newSegment,
          loyaltyScore: 10
        })
      });

      if (res.ok) {
        const newCust = await res.json();
        setCustomers(prev => [newCust, ...prev]);
        setSelectedCustomerId(newCust.id);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewAddress('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Relationship Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage client profiles, loyalty tiers, segment analysis, and billing logs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-230px)] overflow-hidden">
        
        {/* Left Side: List of customers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-xs outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500 animate-pulse">Loading list...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No customers found</div>
            ) : (
              filteredCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex justify-between items-center transition-all ${
                    selectedCustomerId === c.id ? 'bg-blue-50/50 dark:bg-slate-800/40 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="truncate pr-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{c.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.email || 'No email'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold tracking-wide uppercase ${
                      c.segment === 'High Value' ? 'bg-emerald-500/10 text-emerald-500' :
                      c.segment === 'Loyal' ? 'bg-blue-500/10 text-blue-500' :
                      c.segment === 'At Risk' ? 'bg-red-500/10 text-red-500' :
                      'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {c.segment}
                    </span>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">${c.outstandingAmount.toFixed(2)} due</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Customer Detail Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-full overflow-hidden flex flex-col">
          {detailLoading || !selectedCustomerDetail ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs animate-pulse">
              Loading client details...
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
              
              {/* Client header details */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                    {selectedCustomerDetail.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomerDetail.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold uppercase tracking-wider">{selectedCustomerDetail.segment} Account</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Loyalty Tier: {selectedCustomerDetail.loyaltyScore} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Outstanding balance indicators */}
                <div className="flex gap-4 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Receivables</span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">${selectedCustomerDetail.outstandingAmount.toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              {/* Core Information Panel */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-150 dark:border-slate-800/60">
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Contact Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{selectedCustomerDetail.email || 'No email registered'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{selectedCustomerDetail.phone || 'No phone registered'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{selectedCustomerDetail.address || 'No address specified'}</span>
                    </div>
                  </div>
                </div>

                {/* AI Retention Recommendations */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-5 rounded-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-blue-500/10 pointer-events-none">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI CRM Segment Analysis</span>
                  </div>
                  
                  {selectedCustomerDetail.segment === 'At Risk' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Acme Corp hasn&apos;t completed an order in 66 days. Accounts receivable shows an overdue invoice INV-2026-004 ($908.58).
                      </p>
                      <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 p-2 rounded-lg border border-amber-500/10 mt-2">
                        Advice: Trigger payment reminder email and attach a 5% loyalty coupon for their next restock request.
                      </div>
                    </div>
                  ) : selectedCustomerDetail.segment === 'High Value' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Stark Industries is your largest source of revenue ($3,599.96 logged).
                      </p>
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10 mt-2">
                        Advice: Prime for standing desk bundles or high-performance custom order discount tiers.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Healthy general client account with good order conversion ratios.
                      </p>
                      <div className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/10 mt-2">
                        Advice: Keep engaged via general newsletter updates and automated billing receipts.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order and Purchase history */}
              <div className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Purchase History & Billing Logs</h3>
                
                {selectedCustomerDetail.orders?.length === 0 ? (
                  <p className="text-xs text-slate-500">No order history recorded</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomerDetail.orders?.map((o: any) => (
                      <div key={o.id} className="flex justify-between items-center p-3.5 border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-500/20 transition-colors text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{o.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold ${
                              o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>{o.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Order Date: {new Date(o.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-200">${o.total.toFixed(2)}</span>
                          <p className="text-[10px] text-slate-400 mt-1">{o.items?.length || 1} items cataloged</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Add Customer Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-slide-in">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Register New Customer</h3>
            
            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company/Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Office Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Segment</label>
                <select
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="General">General</option>
                  <option value="Loyal">Loyal</option>
                  <option value="High Value">High Value</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow shadow-blue-500/10"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
