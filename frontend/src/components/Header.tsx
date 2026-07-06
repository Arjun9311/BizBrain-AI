'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  FileText, 
  Package, 
  Users, 
  ShoppingCart,
  Command,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    customers: any[];
    products: any[];
    invoices: any[];
    orders: any[];
  } | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Global search error:', err);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  const handleResultClick = (path: string) => {
    router.push(path);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md" ref={searchRef}>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search products, customers, invoices... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Global Search Results Dropdown */}
          {showSearchDropdown && searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[380px] overflow-y-auto z-50">
              <div className="p-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span>Search Results</span>
                <span className="flex items-center gap-1 font-normal"><Command className="w-3 h-3" />K</span>
              </div>
              
              {/* No results state */}
              {Object.values(searchResults).every(arr => arr.length === 0) && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matches found for &quot;{searchQuery}&quot;
                </div>
              )}

              {/* Customers result */}
              {searchResults.customers.length > 0 && (
                <div className="border-b border-slate-100 dark:border-slate-800/60 p-2">
                  <h4 className="text-[10px] font-bold text-blue-500 px-3 py-1 flex items-center gap-1.5 uppercase">
                    <Users className="w-3 h-3" /> Customers
                  </h4>
                  {searchResults.customers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleResultClick(`/customers?id=${c.id}`)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex justify-between items-center"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products result */}
              {searchResults.products.length > 0 && (
                <div className="border-b border-slate-100 dark:border-slate-800/60 p-2">
                  <h4 className="text-[10px] font-bold text-cyan-500 px-3 py-1 flex items-center gap-1.5 uppercase">
                    <Package className="w-3 h-3" /> Products
                  </h4>
                  {searchResults.products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleResultClick(`/products`)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex justify-between items-center"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">Stock: {p.stock}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Invoices result */}
              {searchResults.invoices.length > 0 && (
                <div className="p-2">
                  <h4 className="text-[10px] font-bold text-emerald-500 px-3 py-1 flex items-center gap-1.5 uppercase">
                    <FileText className="w-3 h-3" /> Invoices
                  </h4>
                  {searchResults.invoices.map(i => (
                    <button
                      key={i.id}
                      onClick={() => handleResultClick(`/finance`)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex justify-between items-center"
                    >
                      <span className="font-medium">{i.invoiceNumber}</span>
                      <span className={`text-[10px] font-bold ${i.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>{i.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown Panel */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-55 hover:bg-slate-100/40 dark:hover:bg-slate-800/30 cursor-pointer transition-all ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/15 border-l-2 border-l-blue-500' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</h5>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile details shortcut */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/10">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{user.name}</p>
              <span className="text-[9px] font-medium text-slate-400">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
