'use strict';
'use client';

import React, { useState } from 'react';
import { BudgetCalculationResult, TransactionCategory } from '@/types/finance';
import { Sliders, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { ALL_CATEGORIES } from '@/lib/engine/budgetEngine';

interface WhatIfSimulatorProps {
  budget: BudgetCalculationResult;
}

export function WhatIfSimulator({ budget }: WhatIfSimulatorProps) {
  const {
    remainingDiscretionaryBudget,
    daysUntilPayday,
    dailyDiscretionaryAllowance,
  } = budget;

  const [targetCategory, setTargetCategory] = useState<TransactionCategory | 'all'>('food');
  const [dailyReduction, setDailyReduction] = useState<number>(200);
  const [durationDays, setDurationDays] = useState<number>(Math.max(1, Math.min(daysUntilPayday, 10)));

  // Deterministic math
  const projectedSavings = dailyReduction * durationDays;
  const simulatedRemainingBudget = remainingDiscretionaryBudget + projectedSavings;
  const simulatedDailyAllowance = daysUntilPayday > 0
    ? Math.max(0, Math.round((simulatedRemainingBudget / daysUntilPayday) * 100) / 100)
    : 0;

  const resetDefaults = () => {
    setTargetCategory('food');
    setDailyReduction(200);
    setDurationDays(Math.max(1, Math.min(daysUntilPayday, 10)));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Interactive What-If Spending Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Test proposed habit adjustments and observe impact on daily spending allowance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetDefaults}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Focus Spending Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTargetCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  targetCategory === 'all'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                All Spending
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTargetCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    targetCategory === cat
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Reduction Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Daily Spend Reduction</span>
              <span className="text-teal-400 font-extrabold text-sm">₹{dailyReduction} / day</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={dailyReduction}
              onChange={(e) => setDailyReduction(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹50 (e.g. skip 1 delivery fee)</span>
              <span>₹1,500 (aggressive freeze)</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Application Duration</span>
              <span className="text-teal-400 font-extrabold text-sm">{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, daysUntilPayday)}
              step="1"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Day</span>
              <span>{daysUntilPayday} Days (until payday)</span>
            </div>
          </div>
        </div>

        {/* Output Outcome Column */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/20 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Calculated Outcome
            </span>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Projected Net Savings</span>
                <div className="text-2xl font-extrabold text-emerald-400">
                  +₹{projectedSavings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  (₹{dailyReduction}/day × {durationDays} days)
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">New Daily Allowance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-teal-300">
                    ₹{Math.round(simulatedDailyAllowance)}/day
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{Math.round(dailyDiscretionaryAllowance)}/day
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                  +₹{Math.round(simulatedDailyAllowance - dailyDiscretionaryAllowance)}/day boost
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
            Deterministic formula: (Current Remaining ₹{remainingDiscretionaryBudget.toLocaleString('en-IN')} + ₹{projectedSavings.toLocaleString('en-IN')}) ÷ {daysUntilPayday} days
          </div>
        </div>
      </div>
    </div>
  );
}
