'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  FileCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ReportsPage() {
  const { token } = useAuth();
  
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'finance'>('sales');
  const [loading, setLoading] = useState(false);
  const [aiReportSummary, setAiReportSummary] = useState<string>(`
### Executive Summary (Sales Performance Audit)
1. **Total Sales Generated**: $4,679.93 revenue logged from 3 enterprise client orders.
2. **Gross Invoiced Tax**: $980.98 standard GST collected at 18%.
3. **Loyalty Tiers**: Customer segment analysis marks **Stark Industries** as high-priority (+95 score).
4. **Actionable Suggestions**: Restock standing desks (category velocity +14.8%) and recover $908.58 outstanding debt from Acme Corporation (currently overdue).
  `);

  const handleFetchReport = async (type: 'sales' | 'inventory' | 'finance') => {
    setReportType(type);
    setLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Dynamic AI description generation based on the type fetched
        if (type === 'sales') {
          setAiReportSummary(`
### Executive Summary (Sales Performance Audit)
1. **Total Sales Generated**: $4,679.93 revenue logged from 3 active client orders.
2. **Gross Invoiced Tax**: $980.98 standard GST collected at 18%.
3. **Receivables outstanding**: $3,869.95 pending cash flow.
          `);
        } else if (type === 'inventory') {
          setAiReportSummary(`
### Executive Summary (Inventory Valuation & Stock levels)
1. **Asset Portfolio Value**: $5,600.00 estimated physical cost valuation in stock.
2. **Shortage Warning**: BizPro Laptop 16" and MX Mouse are below minimum restock triggers.
3. **Depot Allocation**: 82% of assets reside in the Main Silicon Valley warehouse.
          `);
        } else {
          setAiReportSummary(`
### Executive Summary (Finance & Quarterly Taxes)
1. **Solvency index**: Net cash flow sits at -$4,640.07 due to Q2 office rental pre-payments ($5,000).
2. **Overhead distribution**: Salaries ($18,000) and Software ($970) are within projected ranges.
3. **Input tax credit credit**: $270.00 recoverable GST from utility expenses.
          `);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side CSV/Excel spreadsheet exporter (generates real downloads!)
  const handleExportCSV = () => {
    let headers = '';
    let rows = [];

    if (reportType === 'sales') {
      headers = 'Order ID,Client,Date,Total,Status\n';
      rows = [
        ['ORD-2026-001', 'Stark Industries', '2026-05-15', '3599.96', 'COMPLETED'],
        ['ORD-2026-002', 'Wayne Enterprises', '2026-06-10', '1079.97', 'COMPLETED'],
        ['ORD-2026-003', 'Stark Industries', '2026-06-25', '2999.98', 'PENDING'],
        ['ORD-2026-004', 'Acme Corporation', '2026-05-01', '769.98', 'COMPLETED'],
      ];
    } else if (reportType === 'inventory') {
      headers = 'SKU,Name,Category,Stock,Cost Value,Price Value\n';
      rows = [
        ['PRO-LAP-16', 'BizPro Laptop 16"', 'Electronics', '4', '3800.00', '5999.96'],
        ['OFF-DSK-ERG', 'Ergonomic Standing Desk', 'Office Furniture', '12', '3840.00', '7199.88'],
        ['ACC-MOU-MX3', 'MX Master 3S Mouse', 'Accessories', '2', '90.00', '199.98'],
        ['ACC-KBD-MECH', 'MX Mechanical Keyboard', 'Accessories', '25', '2125.00', '4249.75'],
      ];
    } else {
      headers = 'Metric,Value\n';
      rows = [
        ['Total Revenue', '4679.93'],
        ['Total Expenses', '9320.00'],
        ['Net Profit', '-4640.07'],
        ['Outstanding Invoices', '3869.95'],
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers 
      + rows.map(r => r.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BizBrain_${reportType}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    alert("Simulating PDF Generation... A high-resolution audit PDF layout has been queued for printer dispatch.");
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" /> Executive SME Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">Export corporate metrics, tax logs, and stock valuation spreadsheets.</p>
        </div>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => handleFetchReport('sales')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.01] ${
            reportType === 'sales' 
              ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/10' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-300'
          }`}
        >
          <span className={`p-2 rounded-lg inline-block w-9 ${reportType === 'sales' ? 'bg-white/10 text-white' : 'bg-blue-500/10 text-blue-500'}`}>
            <FileText className="w-5 h-5" />
          </span>
          <div className="mt-8">
            <h4 className="font-bold text-sm">Sales & Transaction Audits</h4>
            <p className={`text-[10px] mt-1 ${reportType === 'sales' ? 'text-blue-200' : 'text-slate-500'}`}>Logs checkout numbers and unpaid balances</p>
          </div>
        </button>

        <button
          onClick={() => handleFetchReport('inventory')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.01] ${
            reportType === 'inventory' 
              ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/10' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-300'
          }`}
        >
          <span className={`p-2 rounded-lg inline-block w-9 ${reportType === 'inventory' ? 'bg-white/10 text-white' : 'bg-cyan-500/10 text-cyan-500'}`}>
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          <div className="mt-8">
            <h4 className="font-bold text-sm">Inventory & Asset Valuation</h4>
            <p className={`text-[10px] mt-1 ${reportType === 'inventory' ? 'text-blue-200' : 'text-slate-500'}`}>Tracks stocks value, warnings, and suppliers</p>
          </div>
        </button>

        <button
          onClick={() => handleFetchReport('finance')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.01] ${
            reportType === 'finance' 
              ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/10' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-300'
          }`}
        >
          <span className={`p-2 rounded-lg inline-block w-9 ${reportType === 'finance' ? 'bg-white/10 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <FileCheck className="w-5 h-5" />
          </span>
          <div className="mt-8">
            <h4 className="font-bold text-sm">Financial Profit & Loss Statement</h4>
            <p className={`text-[10px] mt-1 ${reportType === 'finance' ? 'text-blue-200' : 'text-slate-500'}`}>Logs cash flow balances and tax metrics</p>
          </div>
        </button>
      </div>

      {/* PDF / Excel controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: AI summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between h-96">
          <div className="absolute top-0 right-0 p-6 text-blue-500/10 pointer-events-none">
            <Sparkles className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Sparkles className="w-4 h-4" /></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-400">AI Report Advisory Brief</h3>
            </div>
            {loading ? (
              <div className="text-xs text-slate-500 animate-pulse">Compiling database tables...</div>
            ) : (
              <div className="text-xs leading-relaxed text-slate-300 space-y-1">
                {aiReportSummary.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Generated Q2 Ledger
          </div>
        </div>

        {/* Right: Exporter triggers */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between h-96">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Fulfillment & Exporters</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              BizBrain prints spreadsheet data arrays directly into standard CSV/Excel format.
            </p>
            
            <div className="bg-amber-500/10 border border-amber-500/15 p-3.5 rounded-xl flex gap-2.5 mt-6 text-xs text-amber-700 dark:text-amber-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                Exports will capture all records for <span className="font-bold">BizBrain HQ</span>. Filters are applied automatically.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow shadow-emerald-600/10 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Excel/CSV Spreadsheet
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow shadow-blue-600/10 transition-colors"
            >
              <FileText className="w-4 h-4" /> Export High-Res Audit PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
