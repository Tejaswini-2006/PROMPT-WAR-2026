'use strict';
'use client';

import React from 'react';
import {
  FinancialProfile,
  Transaction,
  BudgetCalculationResult,
  SpendingForecast,
  FinancialDecisionReplay,
  AIReasoningInsight,
} from '@/types/finance';
import { Download, FileJson, FileSpreadsheet, X, Check } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  transactions: Transaction[];
  budget: BudgetCalculationResult;
  forecast: SpendingForecast;
  decisionReplay: FinancialDecisionReplay;
  aiInsight: AIReasoningInsight | null;
}

export function ExportReportModal({
  isOpen,
  onClose,
  profile,
  transactions,
  budget,
  forecast,
  decisionReplay,
  aiInsight,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  // 1. Export Transactions as CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Payment Mode', 'Amount (INR)', 'Is Refund', 'Is Duplicate Candidate', 'Notes'];
    const rows = transactions.map((t) => [
      `"${t.date}"`,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.paymentMode}"`,
      t.isRefund ? -t.amount : t.amount,
      t.isRefund ? 'YES' : 'NO',
      t.isDuplicateCandidate ? 'YES' : 'NO',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PaisaPilot_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export Complete Financial Dossier as JSON
  const handleExportJSON = () => {
    const auditReport = {
      app: 'PaisaPilot AI - Predictive Financial Copilot',
      generatedAt: new Date().toISOString(),
      profile,
      budgetSummary: budget,
      spendingForecast: forecast,
      decisionReplay,
      aiInsight,
      transactionCount: transactions.length,
      transactions,
    };

    const jsonString = JSON.stringify(auditReport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PaisaPilot_Audit_Dossier_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-teal-500/30 p-6 text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 id="export-modal-title" className="text-base font-bold text-white">
              Export Audit Reports
            </h2>
            <p className="text-xs text-slate-400">
              Download structured data for tax review, offline audits, or records
            </p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          {/* CSV Option */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all group flex items-start gap-3.5"
          >
            <FileSpreadsheet className="w-6 h-6 text-teal-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Download CSV Ledger</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                  Spreadsheet
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Formatted CSV with all {transactions.length} transactions, categories, refund flags, and duplicate indicators.
              </p>
            </div>
          </button>

          {/* JSON Option */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all group flex items-start gap-3.5"
          >
            <FileJson className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Download JSON Audit Dossier</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  Full Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Complete structured JSON including profile, budget calculations, runway forecast, decision replay, and AI insights.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
