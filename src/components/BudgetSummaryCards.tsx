'use strict';
'use client';

import React from 'react';
import { BudgetCalculationResult } from '@/types/finance';
import { IndianRupee, Flame, CalendarClock, ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon, TrendingDown } from 'lucide-react';

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
  const isBurnHot = currentDailyBurnRate > dailyDiscretionaryAllowance;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Remaining Discretionary Budget */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Remaining Budget
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
            <span className="text-teal-400 font-bold">₹</span>
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
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Cycle Utilized</span>
            <span className="font-semibold text-slate-200">{budgetUtilizationPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden" style={{ height: '8px', background: '#1e293b', borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-500 ${
                budgetUtilizationPercentage > 90
                  ? 'bg-rose-500'
                  : budgetUtilizationPercentage > 75
                  ? 'bg-amber-400'
                  : 'bg-teal-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, budgetUtilizationPercentage))}%`,
                height: '100%',
                backgroundColor: budgetUtilizationPercentage > 90 ? '#f43f5e' : budgetUtilizationPercentage > 75 ? '#f59e0b' : '#14b8a6',
                borderRadius: '4px',
              }}
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
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
            Safe Spending Limit
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-300 flex items-baseline gap-1.5">
            <span className="font-bold">₹</span>
            <span>{Math.round(dailyDiscretionaryAllowance).toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 font-normal"> / day</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spread strictly over {daysUntilPayday} remaining days
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Payday Horizon:</span>
          <span className="font-semibold text-slate-200">
            {daysUntilPayday} days left
          </span>
        </div>
      </div>

      {/* 3. Current Burn Rate */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Burn Rate
          </span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isBurnHot ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-teal-500/20 text-teal-300 border-teal-500/40'}`}>
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{isBurnHot ? 'Burning Fast' : 'Steady Pace'}</span>
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
            <span className="text-slate-400 font-bold">₹</span>
            <span className={isBurnHot ? 'text-amber-300' : 'text-white'}>
              {Math.round(currentDailyBurnRate).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-normal"> / day</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Actual average spending across past {daysElapsedInCycle} days
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Comparison:</span>
          <span className={`font-semibold ${isBurnHot ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isBurnHot ? `+₹${Math.round(currentDailyBurnRate - dailyDiscretionaryAllowance)}/day over cap` : 'Within safe allowance'}
          </span>
        </div>
      </div>

      {/* 4. Net Outflows */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Net Outflows
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Past {daysElapsedInCycle} Days
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
            <span className="text-slate-400 font-bold">₹</span>
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
    </div>
  );
}
