'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { BrainCircuit } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 mb-6 animate-bounce">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-xl shadow-blue-500/20">
            <BrainCircuit className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BizBrain AI
          </h2>
        </div>
        
        {/* Loading skeleton loader cards */}
        <div className="w-80 space-y-4">
          <div className="h-4 bg-slate-800 rounded-md w-3/4 mx-auto animate-pulse"></div>
          <div className="h-3 bg-slate-800 rounded-md w-1/2 mx-auto animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div className="h-8 bg-slate-800 rounded animate-pulse"></div>
            <div className="h-8 bg-slate-800 rounded animate-pulse"></div>
            <div className="h-8 bg-slate-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Awaiting redirection
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="relative animate-slide-in">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* Right Column Content Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
