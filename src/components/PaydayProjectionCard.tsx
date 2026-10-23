'use strict';
'use client';

import React from 'react';
import { BudgetCalculationResult, SpendingForecast } from '@/types/finance';
import { TrendingUp, AlertTriangle, ShieldCheck, Clock, Compass } from 'lucide-react';

interface PaydayProjectionCardProps {
  budget: BudgetCalculationResult;
  forecast: SpendingForecast;
}

export function PaydayProjectionCard({ budget, forecast }: PaydayProjectionCardProps) {
  const {
    currentDailyBurnRate,
    daysUntilPayday,
    dailyDiscretionaryAllowance,
    netPlannedDiscretionaryBudget,
    remainingDiscretionaryBudget,
  } = budget;

  const {
    projectedPeriodSpending,
    projectedDeficitOrSurplus,
    projectedEndBalance,
    budgetExhaustionDate,
    daysOfRunwayRemaining,
    isExhaustionLikely,
    calculationMethod,
    warningMessage,
  } = forecast;

  return (
    <div className={`glass-panel rounded-2xl p-5 sm:p-6 mb-6 ${isExhaustionLikely ? 'border-amber-500/40' : 'border-teal-500/20'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExhaustionLikely ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'}`}>
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Payday Runway & Exhaustion Projection
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic linear forecast derived from verified daily pace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExhaustionLikely ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Exhaustion Predicted: {budgetExhaustionDate}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sufficient Runway Until Payday</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Banner if early exhaustion is likely */}
      {warningMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
              Runway Shortfall Warning
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-relaxed">
              {warningMessage}
            </p>
          </div>
        </div>
      )}

      {/* Grid of projection metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            Projected End-of-Cycle Spend
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            ₹{projectedPeriodSpending.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            vs planned budget ₹{netPlannedDiscretionaryBudget.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            Expected Payday Balance
          </span>
          <div className={`text-xl sm:text-2xl font-extrabold ${projectedEndBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {projectedEndBalance < 0 ? `-₹${Math.abs(projectedEndBalance).toLocaleString('en-IN')}` : `+₹${projectedEndBalance.toLocaleString('en-IN')}`}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {projectedEndBalance < 0 ? 'Projected month-end deficit' : 'Projected surplus buffer'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            Estimated Runway Remaining
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-300">
            {daysOfRunwayRemaining} Days
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {daysOfRunwayRemaining < daysUntilPayday ? `${daysUntilPayday - Math.floor(daysOfRunwayRemaining)} days short of payday` : 'Covers entire cycle'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <span>Method: {calculationMethod}</span>
        <span>Daily burn: ₹{Math.round(currentDailyBurnRate)}/day | Sustainable: ₹{Math.round(dailyDiscretionaryAllowance)}/day</span>
      </div>
    </div>
  );
}
