'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Plus, 
  FileText, 
  Percent, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer?: { name: string; email: string };
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  referenceNo: string | null;
}

export default function FinancePage() {
  const { token } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'tax'>('invoices');

  // Add Expense states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Rent');
  const [expRef, setExpRef] = useState('');

  const fetchFinanceData = async () => {
    try {
      const invRes = await fetch('http://localhost:5000/api/finance/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const expRes = await fetch('http://localhost:5000/api/finance/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (invRes.ok && expRes.ok) {
        setInvoices(await invRes.json());
        setExpenses(await expRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFinanceData();
    }
  }, [token]);

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/finance/invoices/${invoiceId}/send-reminder`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;

    try {
      const res = await fetch('http://localhost:5000/api/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: expTitle,
          amount: parseFloat(expAmount),
          category: expCategory,
          referenceNo: expRef,
          status: 'PAID'
        })
      });

      if (res.ok) {
        fetchFinanceData();
        setShowAddExpense(false);
        setExpTitle('');
        setExpAmount('');
        setExpRef('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tax calculations & Helpers
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const gstCollected = invoices.reduce((sum, i) => sum + (i.total * 0.18 / 1.18), 0); // Back-calculated GST
  const netCashFlow = totalInvoiced - totalExpenses;

  const downloadInvoicesCSV = () => {
    let csv = 'Invoice #,Client Name,Issue Date,Due Date,Total Amount,Status,Payment Method\n';
    invoices.forEach(inv => {
      csv += `${inv.invoiceNumber},"${inv.customer?.name || 'Client'}",${new Date(inv.issueDate).toLocaleDateString()},${new Date(inv.dueDate).toLocaleDateString()},${inv.total},${inv.status},${inv.paymentMethod}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'invoices_report.csv');
    a.click();
  };

  const downloadExpensesCSV = () => {
    let csv = 'Expense ID,Title,Amount,Category,Date,Status,Reference No\n';
    expenses.forEach(exp => {
      csv += `${exp.id},"${exp.title}",${exp.amount},${exp.category},${new Date(exp.date).toLocaleDateString()},${exp.status},${exp.referenceNo || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expenses_report.csv');
    a.click();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Finance & Accounts Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Audit cash flow logs, monitor business overheads, and dispatch payment requests.</p>
        </div>
        
        {activeTab === 'expenses' && (
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        )}
      </div>

      {/* Finance summary statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoiced Sales</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">${totalInvoiced.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h4>
          </div>
          <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><ArrowUpRight className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Expenses</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h4>
          </div>
          <span className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><ArrowDownLeft className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Cash Flow</span>
            <h4 className={`text-xl font-bold mt-1 ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </h4>
          </div>
          <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><DollarSign className="w-5 h-5" /></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GST Liability (Est.)</span>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">${gstCollected.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h4>
          </div>
          <span className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Percent className="w-5 h-5" /></span>
        </div>
      </div>

      {/* AI Financial Advisor Suggestions */}
      <div className="bg-gradient-to-br from-blue-900/10 via-slate-900 to-slate-950 p-4 border border-blue-500/15 rounded-xl flex gap-3 text-xs relative overflow-hidden">
        <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl h-fit">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            BizBrain Financial Advisor Insights <span className="px-1.5 py-0.5 bg-blue-500/25 text-blue-400 text-[8px] rounded uppercase font-bold tracking-wide">Autonomous</span>
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-[11px]">
            Your current Net Cash Flow is positive at <strong className="text-emerald-500">${netCashFlow.toLocaleString()}</strong>. However, outstanding accounts receivables on invoices equal <strong className="text-amber-500">${invoices.filter(i => i.status === 'UNPAID').reduce((s,i) => s+i.total, 0).toLocaleString()}</strong>.
            We recommend triggering SMS notifications for unpaid invoices or implementing early payment discount terms (e.g. 2/10 net 30) to increase liquid capital reserves.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'invoices' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Customer Invoices
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'expenses' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          Overhead Expenses
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'tax' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          GST & Tax Filings
        </button>
      </div>

      {/* Active tab contents */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-100/40 dark:shadow-none">
        
        {/* Table Toolbar Header with Exporters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
          <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
            {activeTab === 'invoices' ? 'Invoiced Accounts' : activeTab === 'expenses' ? 'Expense Audits' : 'GST Declarations'}
          </h3>
          {activeTab === 'invoices' && (
            <button
              onClick={downloadInvoicesCSV}
              className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-[10px] font-bold transition-all"
            >
              Export CSV Report
            </button>
          )}
          {activeTab === 'expenses' && (
            <button
              onClick={downloadExpensesCSV}
              className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-[10px] font-bold transition-all"
            >
              Export CSV Report
            </button>
          )}
        </div>

        {/* 1. Invoices tab */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Invoiced Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 animate-pulse">Loading ledger...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">No invoices logged.</td></tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                      <td className="p-4 font-semibold">{inv.invoiceNumber}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.customer?.name || 'Walk-in client'}</td>
                      <td className="p-4">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="p-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="p-4 text-right font-bold">${inv.total.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                          inv.status === 'OVERDUE' ? 'bg-red-500/10 text-rose-500 animate-pulse' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>{inv.status}</span>
                      </td>
                      <td className="p-4 text-center">
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => handleSendReminder(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded font-bold transition-all"
                          >
                            <Send className="w-3 h-3" /> Remind
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Settled Cash</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Expenses tab */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">Expense Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Reference txn</th>
                  <th className="p-4 text-right">Debit amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading ledger...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No expenses cataloged yet.</td></tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                      <td className="p-4">{exp.category}</td>
                      <td className="p-4">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="p-4 font-mono">{exp.referenceNo || 'Internal allocation'}</td>
                      <td className="p-4 text-right font-bold text-rose-500">-${exp.amount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-[4px] text-[10px] font-bold">
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. GST Tax Summary tab */}
        {activeTab === 'tax' && (
          <div className="p-6 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-500" /> GST Tax Reconciliation (Q2)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Output GST (Collected)</span>
                <h4 className="text-xl font-bold mt-1 text-slate-850 dark:text-slate-100">${(totalInvoiced * 0.18).toFixed(2)}</h4>
                <p className="text-[9px] text-slate-400 mt-2">18% standard GST collected on customer invoices</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Input GST (Expenses Credit)</span>
                <h4 className="text-xl font-bold mt-1 text-slate-850 dark:text-slate-100">${(totalExpenses * 0.18).toFixed(2)}</h4>
                <p className="text-[9px] text-slate-400 mt-2">GST input credit from supplier and utility debits</p>
              </div>

              <div className="p-4 bg-purple-500/10 border rounded-xl border-purple-500/25">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Net Tax Payable</span>
                <h4 className="text-xl font-bold mt-1 text-purple-500">${((totalInvoiced - totalExpenses) * 0.18).toFixed(2)}</h4>
                <p className="text-[9px] text-slate-400 mt-2">Net tax due for the quarterly filing period</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Next GST Filing Deadline: July 20, 2026</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Export your Q2 sales audit and submit form GSTR-1 to prevent penalties. Connect with your accountant (Natasha Romanoff) for validations.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-slide-in">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Declare Office Expense</h3>
            
            <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expense Title</label>
                <input
                  type="text" required placeholder="e.g. AWS Cloud Invoice"
                  value={expTitle} onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={expCategory} onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Rent">Rent lease</option>
                    <option value="Utilities">Utilities & software</option>
                    <option value="Salaries">Employee Payroll</option>
                    <option value="Marketing">Marketing Ads</option>
                    <option value="Inventory">Inventory restock</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Debit Amount ($)</label>
                  <input
                    type="number" step="0.01" required placeholder="0.00"
                    value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transaction Ref #</label>
                <input
                  type="text" placeholder="TXN-998822"
                  value={expRef} onChange={(e) => setExpRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow shadow-blue-500/10"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
