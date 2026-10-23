'use strict';
'use client';

import React from 'react';
import { BudgetCalculationResult, TransactionCategory } from '@/types/finance';
import { ALL_CATEGORIES } from '@/lib/engine/budgetEngine';
import { Utensils, ShoppingBag, ShoppingCart, Car, Tv, Zap, MoreHorizontal } from 'lucide-react';

interface SpendingBreakdownChartProps {
  budget: BudgetCalculationResult;
}

const CATEGORY_ICONS: Record<TransactionCategory, React.ElementType> = {
  food: Utensils,
  groceries: ShoppingCart,
  shopping: ShoppingBag,
  transport: Car,
  subscriptions: Tv,
  bills: Zap,
  other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<TransactionCategory, { bar: string; text: string; bg: string }> = {
  food: { bar: 'bg-teal-400', text: 'text-teal-400', bg: 'bg-teal-500/10' },
  groceries: { bar: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  shopping: { bar: 'bg-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  transport: { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  subscriptions: { bar: 'bg-purple-400', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  bills: { bar: 'bg-rose-400', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  other: { bar: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export function SpendingBreakdownChart({ budget }: SpendingBreakdownChartProps) {
  const { categoryBreakdown, topSpendingCategory } = budget;

  // Sort categories by highest spend first
  const sortedCategories = [...ALL_CATEGORIES].sort(
    (a, b) => categoryBreakdown[b].amount - categoryBreakdown[a].amount
  );

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Discretionary Category Breakdown
          </h2>
          <p className="text-xs text-slate-400">
            Micro-spending aggregated by merchant category (net of refunds)
          </p>
        </div>

        {topSpendingCategory && categoryBreakdown[topSpendingCategory].amount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>Primary Drain:</span>
            <strong className="text-white capitalize">{topSpendingCategory}</strong>
            <span>({categoryBreakdown[topSpendingCategory].percentageOfSpend}%)</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sortedCategories.map((catKey) => {
          const item = categoryBreakdown[catKey];
          const colors = CATEGORY_COLORS[catKey];
          const IconComponent = CATEGORY_ICONS[catKey];

          return (
            <div key={catKey} className="group">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white capitalize">{catKey}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {item.transactionCount} tx{item.transactionCount === 1 ? '' : 's'}
                      {item.transactionCount > 0 && ` (avg ₹${Math.round(item.averageTransactionAmount)})`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-white">₹{item.amount.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 ml-2">({item.percentageOfSpend}%)</span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full ${colors.bar} transition-all duration-500`}
                  style={{ width: `${Math.min(100, item.percentageOfSpend)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
