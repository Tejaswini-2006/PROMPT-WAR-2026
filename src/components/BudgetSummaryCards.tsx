'use strict';
'use client';

import React from 'react';
import { BudgetCalculationResult } from '@/types/finance';
import { IndianRupee, Flame, CalendarClock, ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface BudgetSummaryCardsProps {
  budget: BudgetCalculationResult;
}

export function BudgetSummaryCards({ budget }: BudgetSummaryCardsProps) {
  const {
    remainingDiscretionaryBudget,
    netPlannedDiscretionaryBudget,
    netDiscretionarySpent,
    totalRefunds,
    dailyDiscretionaryAllowance,
    currentDailyBurnRate,
    daysUntilPayday,
    daysElapsedInCycle,
    budgetUtilizationPercentage,
    budgetHealthStatus,
  } = budget;

  // Status badge config
  const statusConfig = {
    surplus: {
      label: 'Strong Surplus',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
    },
    on_track: {
      label: 'On Track',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: CheckCircle2,
    },
    caution: {
      label: 'Caution Pace',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Critical Runway',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: ShieldAlert,
    },
    exhausted: {
      label: 'Budget Depleted',
      color: 'bg-red-600/30 text-red-200 border-red-500/60',
      icon: AlertOctagon,
    },
  }[budgetHealthStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Remaining Discretionary Budget */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Remaining Budget
          </span>
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span className="text-teal-400">₹</span>
            <span className={remainingDiscretionaryBudget <= 0 ? 'text-rose-400' : 'text-white'}>
              {Math.abs(remainingDiscretionaryBudget).toLocaleString('en-IN')}
            </span>
            {remainingDiscretionaryBudget < 0 && (
              <span className="text-xs font-bold text-rose-400 uppercase ml-1">Deficit</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            of ₹{netPlannedDiscretionaryBudget.toLocaleString('en-IN')} spendable cap
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Cycle Utilized</span>
            <span className="font-semibold text-slate-200">{budgetUtilizationPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetUtilizationPercentage > 90
                  ? 'bg-rose-500'
                  : budgetUtilizationPercentage > 75
                  ? 'bg-amber-400'
                  : 'bg-teal-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, budgetUtilizationPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Daily Discretionary Allowance */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Daily Allowance
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300">
            Safe Spending Limit
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-300 flex items-baseline gap-1">
            <span>₹</span>
            <span>{Math.round(dailyDiscretionaryAllowance).toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 font-normal">/ day</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict allocation spread over {daysUntilPayday} remaining days
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Current Burn:</span>
          <span className={`font-semibold ${currentDailyBurnRate > dailyDiscretionaryAllowance ? 'text-amber-400' : 'text-slate-200'}`}>
            ₹{Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day
          </span>
        </div>
      </div>

      {/* 3. Month-to-Date Net Spend */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Net Outflows
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Past {daysElapsedInCycle} Days
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span className="text-slate-400">₹</span>
            <span>{netDiscretionarySpent.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total discretionary debits minus refunds
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Credited Refunds:</span>
          <span className="font-semibold text-emerald-400">
            +₹{totalRefunds.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* 4. Days to Payday & Burn Rate */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Payday Horizon
          </span>
          <CalendarClock className="w-4 h-4 text-teal-400" />
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span className="text-teal-400">{daysUntilPayday}</span>
            <span className="text-sm font-semibold text-slate-300 ml-1">Days Left</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cycle day {daysElapsedInCycle} of 30
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Pace vs Target:</span>
          <span className="font-semibold text-slate-200">
            {currentDailyBurnRate > dailyDiscretionaryAllowance ? 'Burning 1.4x faster' : 'Within bounds'}
          </span>
        </div>
      </div>
    </div>
  );
}
