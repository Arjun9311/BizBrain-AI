'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Coins, 
  Contact, 
  BarChart3, 
  Globe, 
  LifeBuoy, 
  FileText, 
  Settings, 
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user, business } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Copilot', path: '/copilot', icon: Bot, highlight: true },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Warehouse },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Finance', path: '/finance', icon: Coins },
    { name: 'Employees', path: '/employees', icon: Contact },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Website Builder', path: '/website-builder', icon: Globe },
    { name: 'Support', path: '/support', icon: LifeBuoy },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">BizBrain AI</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">ERP Copilot Platform</p>
          </div>
        </div>

        {/* Business details */}
        {business && (
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/40 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold text-slate-300 truncate">{business.name}</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/10'
                    : item.highlight
                    ? 'text-cyan-400 hover:bg-slate-800/70 hover:text-cyan-300 border border-cyan-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded uppercase tracking-wider scale-90">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
        {user && (
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                {user.name.slice(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
