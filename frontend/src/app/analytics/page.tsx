'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Layers, 
  Calendar,
  Sparkles,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  ComposedChart,
  Area
} from 'recharts';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('monthly');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Weekly comparative mock database
  const weeklySalesData = [
    { day: 'Mon', lastWeek: 400, thisWeek: 600 },
    { day: 'Tue', lastWeek: 300, thisWeek: 800 },
    { day: 'Wed', lastWeek: 500, thisWeek: 400 },
    { day: 'Thu', lastWeek: 200, thisWeek: 900 },
    { day: 'Fri', lastWeek: 600, thisWeek: 1100 },
    { day: 'Sat', lastWeek: 800, thisWeek: 700 },
    { day: 'Sun', lastWeek: 100, thisWeek: 200 },
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" /> Business Intelligence & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review comparative revenue curves, customer acquisition velocity, and stock turnover.</p>
        </div>
        
        {/* Timeframe Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-950/40 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Weekly Review
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-950/40 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Monthly Ledger
          </button>
        </div>
      </div>

      {/* Primary Analytics Charts Container */}
      {timeframe === 'monthly' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sales Profit Margin Composed Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Revenue, Expenses, and Profit Margin</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Summary of fiscal operations</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} />
                  <YAxis fontSize={11} stroke="#888888" tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Sales" barSize={24} fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" barSize={14} fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="Profit" stroke="#10B981" strokeWidth={2.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth Acquisition Curve */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Customer Acquisition Speed</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">CRM monthly signup totals</p>
              </div>
              <Users className="w-4 h-4 text-blue-500" />
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} />
                  <YAxis fontSize={11} stroke="#888888" tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="active" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* Weekly Review View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">This Week vs Last Week Sales</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Daily comparisons</p>
              </div>
              <Calendar className="w-4 h-4 text-cyan-500" />
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="day" fontSize={11} stroke="#888888" tickLine={false} />
                  <YAxis fontSize={11} stroke="#888888" tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="lastWeek" name="Last Week" fill="#888888" opacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="thisWeek" name="This Week" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Weekly Operational Velocity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This week logged a **+34.6%** increase in checkout volume compared to the previous week, driven by early Stark Industries orders.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
              <div className="flex justify-between text-xs">
                <span>Peak Sales Day:</span>
                <strong className="text-slate-800 dark:text-slate-200">Friday ($1,100.00)</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span>Lowest Conversion Day:</span>
                <strong className="text-slate-800 dark:text-slate-200">Sunday ($200.00)</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span>AOV (Average Order Value):</span>
                <strong className="text-slate-800 dark:text-slate-200">$671.43 this week</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Linear Growth Forecast Graph (Recharts Area representation) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><Sparkles className="w-4 h-4" /></span>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">AI Sales Forecast & Predictions</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Q3 Predictive analysis curves</p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.forecast}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
              <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} />
              <YAxis fontSize={11} stroke="#888888" tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="sales" name="Predicted Sales Volume" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
