'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BrainCircuit, Mail, Lock, User, Building2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  
  const [bName, setBName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bName || !name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password, bName);
    setLoading(false);

    if (!success) {
      setError('Registration failed. The email might already be taken.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 select-none relative font-sans text-slate-200">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        
        {/* Brand header */}
        <div className="text-center space-y-2.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg w-12 h-12 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Register Your Business</h2>
          <p className="text-xs text-slate-400">Initialize your BizBrain SME advisory account</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl flex gap-2 text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Registered Name</label>
            <div className="relative">
              <Building2 className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
              <input
                type="text" required placeholder="e.g. Stark Industries Ltd"
                value={bName} onChange={(e) => setBName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Owner / Manager Name</label>
            <div className="relative">
              <User className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
              <input
                type="text" required placeholder="Sarah Connor"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Business Email</label>
            <div className="relative">
              <Mail className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
              <input
                type="email" required placeholder="ceo@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Set Password</label>
            <div className="relative">
              <Lock className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
              <input
                type="password" required placeholder="Choose a password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all"
          >
            {loading ? 'Creating business ledger...' : 'Register Corporate Ledger'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}
