'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Users, 
  Package, 
  Coins, 
  Check, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Is BizBrain AI compatible with local accounting formats?", a: "Yes. BizBrain exports tables in standard Excel/CSV spreadsheets and generates print-ready tax invoices compliant with GST guidelines." },
    { q: "How does the AI assistant access my ERP catalog?", a: "BizBrain AI has read-only access to inventory metrics and client segmentation variables. Your sensitive passwords and keys remain fully encrypted." },
    { q: "Can I try BizBrain AI without a Gemini API Key?", a: "Yes. Out of the box, BizBrain runs a rule-based AI simulation, allowing you to demo CRM predictions and billing generators instantly." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans select-none overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background neon gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center border-b border-slate-900 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow shadow-blue-500/20">
            <BrainCircuit className="w-5.5 h-5.5" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">BizBrain AI</span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Core Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing plans</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 transition-all flex items-center gap-1 group"
          >
            Start Free <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center space-y-8 relative">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Hackathon Launch Q2
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Your Intelligent Business Copilot.<br />
          Built for Modern SMEs.
        </h1>
        
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          BizBrain AI is a next-generation ERP that consolidates CRM client lists, inventory warehouse valuations, GST-ready invoicing, and custom landing page building into one AI-driven dashboard.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link 
            href="/register" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-600/20 transition-all flex items-center gap-1.5 group"
          >
            Deploy BizBrain Free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dashboard illustration mockup */}
        <div className="pt-16 max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-cyan-500/0 to-emerald-500/5 pointer-events-none z-10"></div>
            <div className="bg-slate-950/80 rounded-xl overflow-hidden aspect-video border border-slate-800/40 p-4 flex flex-col justify-between text-left">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">https://app.bizbrain.ai/dashboard</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center py-20">
                <div className="space-y-3">
                  <Bot className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                  <h4 className="font-bold text-lg text-white">BizBrain Advisory Dashboard Active</h4>
                  <p className="text-xs text-slate-500 max-w-sm">Mock CRM ledgers, stock movements, and financial graphs compile on login.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-900 space-y-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">All Your Business Divisions. Guided by AI.</h2>
          <p className="text-xs text-slate-500">Why balance multiple software bills? BizBrain links everything.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-blue-500/20 transition-all space-y-4">
            <span className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl inline-block"><Bot className="w-6 h-6" /></span>
            <h3 className="font-bold text-base text-white">AI Copilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask Copilot to draft supplier restock email inquiries, analyze Q2 profit sheets, or predict seasonal spikes.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-cyan-500/20 transition-all space-y-4">
            <span className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl inline-block"><Users className="w-6 h-6" /></span>
            <h3 className="font-bold text-base text-white">CRM & Customer Retention</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Segment accounts into &quot;At Risk&quot; or &quot;High Value&quot; lists. Target retention coupons and track timeline details.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-emerald-500/20 transition-all space-y-4">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl inline-block"><Package className="w-6 h-6" /></span>
            <h3 className="font-bold text-base text-white">Stock Warnings & Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor inventory counts across regional warehouse depots. Run automated reorders based on product velocities.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing plans */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 border-t border-slate-900 space-y-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Simple, Predictable Pricing</h2>
          <p className="text-xs text-slate-500">Pick a scaling plan. Cancel any time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Starter Plan */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-3xl flex flex-col justify-between space-y-6 hover:border-blue-500/10 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Startup Starter</span>
              <h4 className="text-4xl font-extrabold text-white">$49<span className="text-sm font-normal text-slate-500">/month</span></h4>
              <p className="text-xs text-slate-400">Perfect for scaling shops and small storefront teams.</p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Standard AI Chat Copilot</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> CRM & Inventory alerts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> 18% GST Invoicing pos desk</li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all block"
            >
              Get Starter Plan
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 bg-gradient-to-b from-blue-950/20 to-slate-950 border border-blue-500/20 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[9px] font-extrabold tracking-widest text-white rounded-bl uppercase">
              RECOMMENDED
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Business Enterprise</span>
              <h4 className="text-4xl font-extrabold text-white">$199<span className="text-sm font-normal text-slate-500">/month</span></h4>
              <p className="text-xs text-slate-400">For multi-warehouse, department-managed firms.</p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-500" /> Custom System AI Instructions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-500" /> Unlimited regional depots</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-500" /> Detailed HR payroll Attendance</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-500" /> Priority API endpoints</li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all block"
            >
              Start Enterprise Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-900 space-y-12">
        <h2 className="text-2xl font-bold text-center text-white">Frequently Asked Questions</h2>
        
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-slate-900/30 border border-slate-900/60 rounded-xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-left text-xs font-bold text-slate-200"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-[11px] text-slate-400 leading-relaxed border-t border-slate-950/20 pt-2">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-center text-slate-500 text-xs">
        <p>&copy; 2026 BizBrain AI. Developed for SME Hackathon challenges. Built in Next.js + Tailwind CSS.</p>
      </footer>

    </div>
  );
}
