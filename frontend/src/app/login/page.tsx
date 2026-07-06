'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BrainCircuit, Mail, Lock, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  
  // Login form states
  const [email, setEmail] = useState('admin@bizbrain.ai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Mock States
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulate rememberMe
    if (rememberMe) {
      localStorage.setItem('bizbrain_remember', email);
    } else {
      localStorage.removeItem('bizbrain_remember');
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Invalid email or password. Hint: admin@bizbrain.ai / password123');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await loginWithGoogle('guest@google.com', 'Guest Admin');
    setLoading(false);
    if (!success) {
      setError('Google Single Sign-On failed.');
    }
  };

  const handleRequestOtp = () => {
    setShowOtpView(true);
    alert('Mock verification code sent: 123456');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456') {
      login('admin@bizbrain.ai', 'password123');
    } else {
      setError('Incorrect OTP code. Try entering 123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 select-none relative font-sans text-slate-200">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        
        {/* Brand header */}
        <div className="text-center space-y-2.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25 w-12 h-12 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">BizBrain AI Sign In</h2>
          <p className="text-xs text-slate-400">Your Intelligent Business Copilot</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl flex gap-2 text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Conditionally render form depending on OTP checklist */}
        {!showOtpView ? (
          /* 1. Normal Login Form */
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Email</label>
              <div className="relative">
                <Mail className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
                <input
                  type="email" required
                  placeholder="admin@bizbrain.ai"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Forgot Password / Use OTP?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-500" />
                <input
                  type="password" required
                  placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Submit buttons */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all"
            >
              {loading ? 'Entering Portal...' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          /* 2. OTP Verification Mock Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Enter OTP Verification Code</label>
                <button
                  type="button"
                  onClick={() => setShowOtpView(false)}
                  className="text-[10px] text-slate-400 font-semibold"
                >
                  Back to Password
                </button>
              </div>
              <input
                type="text" required placeholder="Enter code 123456"
                value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest font-mono py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute border-t border-slate-800 w-full"></div>
          <span className="relative px-3 bg-slate-900 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            OR JOIN VIA
          </span>
        </div>

        {/* Single Sign On */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Login with Mock Google Credentials</span>
        </button>

        {/* Footer signups link */}
        <div className="text-center text-xs text-slate-500">
          Don&apos;t have a business account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Register Business
          </Link>
        </div>

      </div>
    </div>
  );
}
