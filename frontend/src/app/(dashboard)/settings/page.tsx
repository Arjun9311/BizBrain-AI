'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Settings, 
  Building2, 
  Key, 
  Sliders, 
  Bell, 
  Check, 
  RefreshCw,
  GitBranch
} from 'lucide-react';

export default function SettingsPage() {
  const { business, token, updateBusiness } = useAuth();
  
  // Settings forms
  const [bName, setBName] = useState(business?.name || 'BizBrain HQ');
  const [gstNum, setGstNum] = useState(business?.gstNumber || '29AAAAA1111A1Z1');
  const [address, setAddress] = useState(business?.address || '100 Innovation Way, Silicon Valley, CA 94025');
  
  // Api keys state
  const [geminiKey, setGeminiKey] = useState('');
  const [clSecret, setClSecret] = useState('cloud_preset_bizbrain_secret_2026');

  // AI settings
  const [aiRules, setAiRules] = useState('Analyze warehouse quantities weekly and flag overdue client balances.');
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.business) {
            setBName(data.business.name || '');
            setGstNum(data.business.gstNumber || '');
            setAddress(data.business.address || '');
          }
          if (data.settings && Array.isArray(data.settings)) {
            for (const item of data.settings) {
              if (item.key === 'gemini_api_key') {
                setGeminiKey(item.value || '');
              } else if (item.key === 'ai_custom_rules') {
                setAiRules(item.value || '');
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: bName,
          gstNumber: gstNum,
          address,
          settingsArray: [
            { key: 'api_mode', value: geminiKey ? 'live' : 'mock_fallback' },
            { key: 'ai_custom_rules', value: aiRules },
            { key: 'gemini_api_key', value: geminiKey }
          ]
        })
      });

      if (res.ok) {
        updateBusiness({ name: bName, gstNumber: gstNum, address });
        
        // Simulating updating .env variables if key is submitted
        if (geminiKey) {
          console.log("Gemini Key set successfully.");
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" /> Platform Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure company profiles, registers, API endpoints, and AI guidelines.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. Business Profile */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4.5 h-4.5 text-blue-500" /> Business Profile & GSTIN Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Registered Name</label>
              <input
                type="text" required
                value={bName} onChange={(e) => setBName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">GSTIN Number (Tax Registry)</label>
              <input
                type="text"
                value={gstNum} onChange={(e) => setGstNum(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Physical HQ Address</label>
            <input
              type="text"
              value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* 2. API Integration Keys */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Key className="w-4.5 h-4.5 text-cyan-500" /> Integrations & API Credentials
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gemini AI API Key</label>
              <input
                type="password"
                placeholder={geminiKey ? "••••••••••••••••" : "Paste your Gemini API key here..."}
                value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
              <span className="text-[9px] text-slate-500 mt-1 block">
                Leave empty to run using the Local AI Simulator (Hackathon Dev Mode).
              </span>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cloudinary storage secret</label>
              <input
                type="password"
                value={clSecret} onChange={(e) => setClSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 3. AI Copilot Parameters */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4.5 h-4.5 text-purple-500" /> AI System prompt Rules
          </h3>
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Custom instructions context</label>
            <textarea
              rows={3}
              value={aiRules} onChange={(e) => setAiRules(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* 4. Branch offices */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <GitBranch className="w-4.5 h-4.5 text-emerald-500" /> Branch & Logistics Depots
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150">
              <span className="font-bold block text-slate-900 dark:text-white">Silicon Valley HQ</span>
              <p className="text-[10px] text-slate-400 mt-1">Main Warehouse: Electronics & Accessories</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150">
              <span className="font-bold block text-slate-900 dark:text-white">West Wing Depot</span>
              <p className="text-[10px] text-slate-400 mt-1">Regional Warehouse: Standing Desks</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between">
          {success && (
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4" /> Company profile settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 flex items-center gap-2 disabled:opacity-40"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save settings configuration'}
          </button>
        </div>

      </form>
    </div>
  );
}
