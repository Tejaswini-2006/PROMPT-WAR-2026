'use strict';
'use client';

import React, { useState } from 'react';
import { FinancialProfile } from '@/types/finance';
import { Wallet, Calendar, ShieldCheck, ArrowRight, PiggyBank, Briefcase } from 'lucide-react';

interface FinancialProfileFormProps {
  profile: FinancialProfile;
  onChange: (updated: FinancialProfile) => void;
}

export function FinancialProfileForm({ profile, onChange }: FinancialProfileFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = (field: keyof FinancialProfile, value: unknown) => {
    onChange({
      ...profile,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Deterministic preview calculations
  const monthlySalary = Number(profile.monthlySalary) || 0;
  const fixedObligations = Number(profile.fixedObligations) || 0;
  const savingsTarget = Number(profile.savingsTarget) || 0;
  const otherPlannedExpenses = Number(profile.otherPlannedExpenses) || 0;
  const existingMtdSpending = Number(profile.existingMtdSpending) || 0;

  const remainingIncome = Math.max(0, monthlySalary - fixedObligations);
  const netDiscretionaryPlanned = Math.max(0, remainingIncome - savingsTarget - otherPlannedExpenses);

  const applyPreset = (salary: number, fixed: number, savings: number, other: number) => {
    onChange({
      ...profile,
      monthlySalary: salary,
      fixedObligations: fixed,
      savingsTarget: savings,
      otherPlannedExpenses: other,
      existingMtdSpending: 0,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Financial Baseline & Income Split
            </h2>
            <p className="text-xs text-slate-400">
              User-entered commitments vs mathematically sequestered budget
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick presets */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(45000, 16000, 9000, 2000)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              ₹45K Junior
            </button>
            <button
              type="button"
              onClick={() => applyPreset(75000, 28000, 15000, 4000)}
              className="px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors"
            >
              ₹75K Tech (Demo)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(130000, 45000, 30000, 8000)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              ₹1.3L Senior
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors"
          >
            {isOpen ? 'Collapse Editor' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Real-time Math Breakdown (Always Visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Monthly Take-Home
          </span>
          <span className="text-sm sm:text-base font-bold text-white">
            ₹{monthlySalary.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-teal-400 block mt-0.5">User Entered</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Fixed Rent & EMIs
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-200">
            ₹{fixedObligations.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-400 block mt-0.5">Deducted First</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Savings Target
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-400">
            ₹{savingsTarget.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-500 block mt-0.5">Protected Nest-Egg</span>
        </div>

        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30">
          <span className="text-[11px] font-medium text-teal-300 block mb-1">
            Spendable Discretionary
          </span>
          <span className="text-sm sm:text-base font-bold text-teal-300">
            ₹{netDiscretionaryPlanned.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-teal-400 block mt-0.5">Calculated Limit</span>
        </div>
      </div>

      {/* Collapsible Form Editor */}
      {isOpen && (
        <form className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Take-Home Salary (₹)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={profile.monthlySalary || ''}
              onChange={(e) => updateField('monthlySalary', Number(e.target.value))}
              placeholder="e.g. 75000"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Net credited to bank</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Next Payday Date
            </label>
            <input
              type="date"
              value={profile.nextPayday}
              onChange={(e) => updateField('nextPayday', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Upcoming salary credit day</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fixed Rent & Commitments (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={profile.fixedObligations || ''}
              onChange={(e) => updateField('fixedObligations', Number(e.target.value))}
              placeholder="e.g. 28000"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Rent, society, WiFi, loan EMIs</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Savings Allocation (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={profile.savingsTarget || ''}
              onChange={(e) => updateField('savingsTarget', Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Mutual funds, emergency fund, PPF</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Other Planned Buffer (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={profile.otherPlannedExpenses || ''}
              onChange={(e) => updateField('otherPlannedExpenses', Number(e.target.value))}
              placeholder="e.g. 4000"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Planned insurance, travel, festivals</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pre-Tracked MTD Spend (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={profile.existingMtdSpending || ''}
              onChange={(e) => updateField('existingMtdSpending', Number(e.target.value))}
              placeholder="e.g. 0"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-teal-400 focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Spent prior to tracking in app</span>
          </div>
        </form>
      )}
    </div>
  );
}
