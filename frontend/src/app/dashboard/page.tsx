'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  Activity, 
  Lightbulb, 
  Sparkles,
  ArrowRight,
  Package,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardStats {
  revenue: number;
  expenses: number;
  profit: number;
  outstandingPayments: number;
  lowStockAlerts: number;
  todayOrdersCount: number;
  healthScore: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function DashboardPage() {
  const { token, business } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // Drag & drop layout simulation (Card order indices)
  const [cardOrder, setCardOrder] = useState<string[]>([
    'metrics',
    'charts',
    'healthAndAI',
    'tables'
  ]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const analyticsRes = await fetch('http://localhost:5000/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.ok && analyticsRes.ok) {
        const statsJson = await statsRes.json();
        const analyticsJson = await analyticsRes.json();
        setStats(statsJson);
        setAnalyticsData(analyticsJson);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleSwapOrder = (idxA: number, idxB: number) => {
    const newOrder = [...cardOrder];
    const temp = newOrder[idxA];
    newOrder[idxA] = newOrder[idxB];
    newOrder[idxB] = temp;
    setCardOrder(newOrder);
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // AI recommendations static list matching seeded data
  const aiSuggestions = [
    {
      title: "Optimize Laptops Stock",
      desc: "BizPro Laptop 16\" is below minimum threshold (4 left, limit 5). We recommend placing an order for 10 units with Intel Corp Supply.",
      impact: "Prevents Q3 pipeline order blockages",
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Invoice Overdue Reminder",
      desc: "INV-2026-004 for Acme Corporation ($908.58) is overdue by 35 days. Tapping 'Send Reminder' might expedite collection.",
      impact: "Improves cash flow by +$908.58",
      color: "from-amber-600 to-red-500"
    },
    {
      title: "Furniture Category Expansion",
      desc: "Standing desks sales grew 14.8% this month. Restock mechanical accessories to package with standing desks.",
      impact: "Estimated cross-sell uplift of +$1,200",
      color: "from-emerald-600 to-teal-500"
    }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Welcome back, Business Admin!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            BizBrain AI has compiled your SME performance indices for <span className="font-semibold">{business?.name}</span>.
          </p>
        </div>
        
        {/* Layout Customizer widget */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-xs text-slate-500">
          <Layers className="w-3.5 h-3.5" />
          <span>Simulate Drag & Drop:</span>
          <button 
            onClick={() => handleSwapOrder(0, 1)}
            className="px-2 py-1 bg-white dark:bg-slate-800 rounded shadow hover:text-blue-500 transition-colors"
          >
            Swap top cards
          </button>
        </div>
      </div>

      {/* Render sections according to cardOrder configuration state */}
      {cardOrder.map((sectionId, sectionIndex) => {
        if (sectionId === 'metrics') {
          return (
            <div key="metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none group hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-16 h-16 text-blue-500" />
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-500">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.4% vs last month</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none group hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-16 h-16 text-cyan-500" />
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outbound Expenses</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">${stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-cyan-500">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Within Q2 budget limits</span>
                </div>
              </div>

              {/* Profit */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none group hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Activity className="w-16 h-16 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Operational Profit</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">${stats.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-500">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Stable cash flows</span>
                </div>
              </div>

              {/* Pending / Overdue */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-16 h-16 text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outstanding Receivables</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">${stats.outstandingPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-500">
                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                  <span>{stats.lowStockAlerts} stock alerts pending</span>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'charts') {
          return (
            <div key="charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Revenue & Expenses Trend</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monthly breakdown for BizBrain HQ fiscal year</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">Annual View</span>
                </div>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData?.monthlySales || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff', 
                          fontSize: '12px' 
                        }} 
                      />
                      <Area type="monotone" dataKey="Sales" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" dataKey="Expenses" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory category share */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Stock Distribution</h3>
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.categoryDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(analyticsData?.categoryDistribution || []).map((entry: any, index: number) => {
                          const colors = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {(analyticsData?.categoryDistribution || []).map((c: any, idx: number) => {
                    const colors = ['bg-blue-600', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{c.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.value} units</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'healthAndAI') {
          return (
            <div key="healthAndAI" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Circular Health Score */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col items-center justify-center text-center">
                <h4 className="font-bold text-slate-800 dark:text-white self-start">Business Health</h4>
                <div className="relative w-36 h-36 mt-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="58" strokeWidth="10" stroke="currentColor" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                    <circle cx="72" cy="72" r="58" strokeWidth="10" stroke="currentColor" className="text-emerald-500" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - stats.healthScore / 100)} fill="transparent" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col justify-center items-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.healthScore}%</span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">EXCELLENT</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Cash solvency is high. Check inventory levels to push optimization indices even higher.
                </p>
              </div>

              {/* AI Copilot Advisor */}
              <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 rounded-2xl border border-blue-500/10 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-6 text-blue-500/20 pointer-events-none">
                  <Sparkles className="w-24 h-24 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                      <Lightbulb className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-sm tracking-wide uppercase text-blue-400">BizBrain AI Suggestions</h4>
                  </div>
                  
                  {/* Rotating AI advice widget */}
                  <div className="min-h-[110px] transition-all">
                    <h5 className="font-bold text-lg text-white">{aiSuggestions[activeSuggestionIndex].title}</h5>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{aiSuggestions[activeSuggestionIndex].desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Impact: {aiSuggestions[activeSuggestionIndex].impact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/40">
                  <div className="flex gap-1">
                    {aiSuggestions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSuggestionIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === activeSuggestionIndex ? 'bg-blue-400 w-4' : 'bg-slate-700'}`}
                      ></button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveSuggestionIndex((prev) => (prev + 1) % aiSuggestions.length)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group"
                  >
                    Next Suggestion <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'tables') {
          return (
            <div key="tables" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders log */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Today&apos;s Order Timeline</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {stats.recentOrders.map(o => (
                        <tr key={o.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="py-3 font-semibold">{o.orderNumber}</td>
                          <td className="py-3">{o.customer?.name || 'Walk-in'}</td>
                          <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 font-bold">${o.total.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low Stock Watchlist */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white">Low Stock Watchlist</h3>
                  <span className="p-1 bg-amber-500/15 text-amber-500 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="space-y-4">
                  {stats.lowStockProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 hover:border-amber-500/30 transition-all">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Warehouse: {p.warehouse}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-500">{p.stock} units left</span>
                        <p className="text-[9px] text-slate-400">Min: {p.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
