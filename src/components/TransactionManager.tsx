'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { Transaction, TransactionCategory, PaymentMode, CSVImportResult } from '@/types/finance';
import { parseTransactionsCSV } from '@/lib/engine/csvParser';
import { detectDuplicates } from '@/lib/engine/duplicateDetector';
import { ALL_CATEGORIES } from '@/lib/engine/budgetEngine';
import {
  Plus,
  Upload,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Copy,
  RotateCcw,
  Tag,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  onChange: (updated: Transaction[]) => void;
}

export function TransactionManager({ transactions, onChange }: TransactionManagerProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [showRefundsOnly, setShowRefundsOnly] = useState(false);

  // Manual Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<TransactionCategory>('food');
  const [newPaymentMode, setNewPaymentMode] = useState<PaymentMode>('upi');
  const [newIsRefund, setNewIsRefund] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Handle Manual Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchant || !newAmount || Number(newAmount) <= 0) return;

    const newTx: Transaction = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: newDate,
      amount: Math.round(Number(newAmount) * 100) / 100,
      merchant: newMerchant.trim(),
      category: newCategory,
      paymentMode: newPaymentMode,
      isRefund: newIsRefund,
      notes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = detectDuplicates([newTx, ...transactions]);
    onChange(updated);

    // Reset form
    setNewMerchant('');
    setNewAmount('');
    setNewNotes('');
    setNewIsRefund(false);
    setIsAddOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    const updated = detectDuplicates(transactions.filter((tx) => tx.id !== id));
    onChange(updated);
  };

  // Handle CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseTransactionsCSV(content);
      setCsvResult(result);
      setIsCsvModalOpen(true);

      if (result.success && result.transactions.length > 0) {
        const combined = detectDuplicates([...result.transactions, ...transactions]);
        onChange(combined);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchMerchant = tx.merchant.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchMerchant && !matchNotes) return false;
    }
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
      return false;
    }
    if (showDuplicatesOnly && !tx.isDuplicateCandidate) {
      return false;
    }
    if (showRefundsOnly && !tx.isRefund) {
      return false;
    }
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              Transaction Manager
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {transactions.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manual entry, CSV statement import, refund audit, and duplicate detection
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Hidden CSV Input */}
          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search merchant or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-teal-400 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Duplicate Toggle Filter */}
        <button
          type="button"
          onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            showDuplicatesOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Flagged Duplicates Only</span>
        </button>

        {/* Refund Toggle Filter */}
        <button
          type="button"
          onClick={() => setShowRefundsOnly(!showRefundsOnly)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            showRefundsOnly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refunds Only</span>
        </button>
      </div>

      {/* Transaction Table / List */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Merchant / Narration</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Flags</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{tx.merchant}</div>
                    {tx.notes && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">{tx.notes}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] capitalize font-medium">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 uppercase text-[10px]">
                    {tx.paymentMode}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                    {tx.isRefund ? (
                      <span className="text-emerald-400">+₹{tx.amount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-slate-100">₹{tx.amount.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {tx.isRefund && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Refund
                        </span>
                      )}
                      {tx.isDuplicateCandidate && (
                        <span
                          className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold cursor-help"
                          title={tx.duplicateReason || 'Potential duplicate'}
                        >
                          Duplicate?
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Entry Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-teal-500/30 p-6 text-slate-200">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Record New Transaction</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Merchant / Narration
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Blinkit, Uber"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 420"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none capitalize"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={newPaymentMode}
                    onChange={(e) => setNewPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none uppercase"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Netbanking</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Is Refund Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is-refund-checkbox"
                  checked={newIsRefund}
                  onChange={(e) => setNewIsRefund(e.target.checked)}
                  className="rounded accent-teal-400"
                />
                <label htmlFor="is-refund-checkbox" className="text-xs text-slate-300 cursor-pointer">
                  This transaction is a <strong className="text-emerald-400">Refund Credit</strong> (+₹)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch with team"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Result Feedback Modal */}
      {isCsvModalOpen && csvResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-teal-500/30 p-6 text-slate-200">
            <button
              onClick={() => setIsCsvModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  CSV Import Report
                </h3>
                <p className="text-[11px] text-slate-400">
                  Parsed and sanitized with strict resource guards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Rows Processed</span>
                <span className="text-base font-bold text-white">{csvResult.totalRowsProcessed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Imported Successfully</span>
                <span className="text-base font-bold text-teal-400">{csvResult.importedCount}</span>
              </div>
            </div>

            {csvResult.errors.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <strong>Validation Errors ({csvResult.errors.length}):</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  {csvResult.errors.slice(0, 4).map((err, i) => (
                    <li key={i}>Row {err.row}: {err.message}</li>
                  ))}
                  {csvResult.errors.length > 4 && (
                    <li>...and {csvResult.errors.length - 4} more rows skipped.</li>
                  )}
                </ul>
              </div>
            )}

            {csvResult.warnings.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <strong>Warnings ({csvResult.warnings.length}):</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  {csvResult.warnings.slice(0, 3).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
