'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Bot
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  category: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TCK-1', subject: 'Invoice Billing Discrepancy Q2', customerName: 'Stark Industries', priority: 'HIGH', status: 'OPEN', createdAt: '2026-07-05', category: 'Billing' },
    { id: 'TCK-2', subject: 'Keyboard SKU Restock delays', customerName: 'Wayne Enterprises', priority: 'MEDIUM', status: 'OPEN', createdAt: '2026-07-04', category: 'Shipping' },
    { id: 'TCK-3', subject: 'Account Login Password Reset', customerName: 'Peter Parker', priority: 'LOW', status: 'RESOLVED', createdAt: '2026-07-02', category: 'Portal Access' }
  ]);
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TCK-1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat state for the right hand Chatbot simulator
  const [chatLog, setChatLog] = useState<any[]>([
    { role: 'bot', message: 'Hello! I am BizBrain Customer Support Bot. I can analyze ticket data to draft answers. Try submitting a response.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [botLoading, setBotLoading] = useState(false);

  // FAQ states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleResolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
    alert(`Ticket ${id} marked as RESOLVED.`);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatLog(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');
    setBotLoading(true);

    setTimeout(() => {
      let reply = "I have queued this ticket with our main operations desk. We will notify you shortly.";
      
      const lower = userMessage.toLowerCase();
      if (lower.includes('invoice') || lower.includes('bill')) {
        reply = "Looking up accounts: Stark Industries has a pending invoice INV-2026-003 of $3,539.97. Let me know if you would like me to trigger a reminder email to Stark's accounts desk.";
      } else if (lower.includes('delay') || lower.includes('shipping')) {
        reply = "Logistic updates: Logitech Mechanical Keyboards have a standard lead restock speed of 3 days. We expect fulfillment status updates by Friday.";
      }
      
      setChatLog(prev => [...prev, { role: 'bot', message: reply }]);
      setBotLoading(false);
    }, 1000);
  };

  const faqs = [
    { q: "How do I change the corporate tax standard percentage?", a: "Go to Settings on the left, check the GST details field, and toggle the standard tax rate input. BizBrain supports custom rates (defaults at 18%)." },
    { q: "How are CRM segmentation codes determined?", a: "AI models scan purchase frequencies. Customers ordering above $3000 are categorized as 'High Value'. Inactive clients are marked 'At Risk'." },
    { q: "Can I download analytical data sheets?", a: "Yes. Navigate to the Reports module on the sidebar to download tabular PDF and Excel formatted business logs." }
  ];

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col lg:flex-row gap-6 select-none overflow-hidden animate-fade-in">
      
      {/* Left Column: Tickets & FAQ */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Ticket queue grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-3/5">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-blue-500" /> Active Support Tickets
            </h3>
            <div className="relative w-52">
              <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-[10px] outline-none text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {filteredTickets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`w-full text-left p-4 hover:bg-slate-55 hover:bg-slate-100/40 dark:hover:bg-slate-800/35 transition-all flex justify-between items-center ${
                  selectedTicketId === t.id ? 'bg-blue-50/40 dark:bg-slate-800/30 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{t.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Client: {t.customerName} | Category: {t.category}</p>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase ${
                    t.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                    t.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-slate-100 dark:bg-slate-850 text-slate-500'
                  }`}>
                    {t.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                    t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge base FAQs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-2/5 overflow-y-auto">
          <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Support Knowledge Base FAQs</h3>
          
          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-800/60 pb-2">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center py-1 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: AI chatbot response planner simulator */}
      <div className="w-full lg:w-96 shrink-0 h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI Support chatbot Agent</h3>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wide">TICKET RESOLUTION BOT</p>
            </div>
          </div>
          
          {selectedTicket && selectedTicket.status === 'OPEN' && (
            <button
              onClick={() => handleResolveTicket(selectedTicket.id)}
              className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-500 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Resolve Ticket
            </button>
          )}
        </div>

        {/* Selected ticket metadata chip */}
        {selectedTicket && (
          <div className="p-3 bg-blue-500/5 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
            <span>Ticket Active: <strong>{selectedTicket.subject}</strong></span>
            <span className="text-slate-400">Owner: {selectedTicket.customerName}</span>
          </div>
        )}

        {/* Message Log box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {chatLog.map((chat, idx) => {
            const isBot = chat.role === 'bot';
            return (
              <div key={idx} className={`flex items-start gap-2.5 max-w-[85%] ${!isBot ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center text-white font-bold shrink-0 ${
                  isBot ? 'bg-slate-700 text-cyan-400' : 'bg-blue-600'
                }`}>
                  {isBot ? <Sparkles className="w-3.5 h-3.5" /> : 'ME'}
                </div>
                <div className={`p-3 rounded-xl text-xs border ${
                  isBot 
                    ? 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border-slate-100 dark:border-slate-800 rounded-tl-none' 
                    : 'bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-sm'
                }`}>
                  {chat.message}
                </div>
              </div>
            );
          })}
          {botLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="h-6 bg-slate-50 dark:bg-slate-950 border rounded-xl flex items-center px-3 gap-0.5">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping"></span>
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping delay-75"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input response forms */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <form onSubmit={handleSendResponse} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-1">
            <input
              type="text"
              placeholder="Ask bot: 'Search invoices' or type response..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs outline-none text-slate-800 dark:text-slate-250 py-1.5 px-2"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || botLoading}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
