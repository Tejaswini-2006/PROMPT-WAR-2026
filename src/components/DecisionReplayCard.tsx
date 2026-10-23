'use strict';
'use client';

import React, { useState } from 'react';
import { FinancialDecisionReplay, CorrectiveActionScenario } from '@/types/finance';
import { History, ArrowRight, Check, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface DecisionReplayCardProps {
  decisionReplay: FinancialDecisionReplay;
  onAdoptAction?: (action: CorrectiveActionScenario) => void;
  adoptedActionId?: string | null;
}

export function DecisionReplayCard({
  decisionReplay,
  onAdoptAction,
  adoptedActionId,
}: DecisionReplayCardProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    adoptedActionId || decisionReplay.correctiveActions[0]?.id || null
  );

  const activeScenario = decisionReplay.correctiveActions.find((a) => a.id === selectedScenarioId);

  return (
    <div className="glass-panel-glow rounded-2xl p-5 sm:p-7 mb-6 border-teal-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-teal-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Financial Decision Replay
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                Distinctive Feature
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Retrospective diagnosis, runway projection, and actionable corrective levers
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {decisionReplay.periodTitle}
        </span>
      </div>

      {/* 1. What Happened */}
      <div className="my-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>1. What Happened This Pay Period</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {decisionReplay.whatHappenedSummary}
        </p>
      </div>

      {/* 2. Top Contributing Categories */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          2. Primary Drivers of Budget Depletion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {decisionReplay.topOverspendingCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white capitalize">{cat.category}</span>
                  <span className="text-sm font-extrabold text-teal-300">
                    ₹ {cat.spent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                  {cat.sharePercent}% of total discretionary spend
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {cat.insight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. What May Happen */}
      <div className="mb-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>3. What May Happen If Current Pace Continues</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {decisionReplay.whatMayHappenProjection}
        </p>
      </div>

      {/* 4. Corrective Action Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>4. Corrective Action Scenarios (Interactive Replay)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Select a lever to preview financial outcome
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
          {decisionReplay.correctiveActions.map((action) => {
            const isSelected = selectedScenarioId === action.id;
            const isAdopted = adoptedActionId === action.id;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setSelectedScenarioId(action.id)}
                className={`text-left p-4 rounded-xl transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-400 shadow-lg shadow-teal-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {action.title}
                    </span>
                    {isAdopted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Adopted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mb-3 leading-normal">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Savings</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      +₹ {action.projectedTotalSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">New Daily Cap</span>
                    <span className="text-xs font-extrabold text-teal-300">
                      ₹ {Math.round(action.newDailyAllowance)} / day
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Scenario Proof & Evidence Drawer */}
        {activeScenario && (
          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">
                Mathematical Proof & Evidence
              </span>

              {onAdoptAction && (
                <button
                  type="button"
                  onClick={() => onAdoptAction(activeScenario)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    adoptedActionId === activeScenario.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{adoptedActionId === activeScenario.id ? 'Adopted Plan' : 'Adopt Recommendation'}</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-teal-100 italic leading-relaxed">
              &ldquo;{activeScenario.evidenceAndAssumptions}&rdquo;
            </p>

            <div className="mt-3 pt-2 border-t border-teal-500/20 text-[11px] text-teal-300/80">
              * Note: PaisaPilot AI provides advisory simulation only. We never initiate payments, debit funds, or cancel purchases automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
