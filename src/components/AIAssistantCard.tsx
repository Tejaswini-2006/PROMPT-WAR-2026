'use strict';
'use client';

import React from 'react';
import { AIReasoningInsight } from '@/types/finance';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, CheckCircle, RefreshCw, Cpu } from 'lucide-react';

interface AIAssistantCardProps {
  insight: AIReasoningInsight | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function AIAssistantCard({ insight, isLoading, onRefresh }: AIAssistantCardProps) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 mb-6 flex flex-col items-center justify-center py-12 border-teal-500/20">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-3" />
        <h3 className="text-sm font-bold text-white">Analyzing Financial Signals...</h3>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating burn rate, runway constraints, and personalized habit adjustments
        </p>
      </div>
    );
  }

  if (!insight) return null;

  const isGemini = insight.provider === 'gemini';

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-6 border-teal-500/30 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Predictive Financial Copilot
              </h2>
              {isGemini ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Gemini 2.5 Flash</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30">
                  <Cpu className="w-3 h-3 text-teal-400" />
                  <span>Deterministic Engine</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Verified financial reasoning & disciplined spending advisory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Headline & Health verdict */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-bold text-teal-300 leading-snug">
            {insight.headline}
          </span>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              insight.healthAssessment === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : insight.healthAssessment === 'caution'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {insight.healthAssessment}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {insight.spendingAnalysis}
        </p>
      </div>

      {/* Top Triggers */}
      {insight.topTriggers && insight.topTriggers.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Identified Overspending Triggers
          </h3>
          <div className="space-y-2">
            {insight.topTriggers.map((trigger, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300"
              >
                <span className="text-teal-400 font-bold">•</span>
                <span>{trigger}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action Plan */}
      {insight.recommendedActionPlan && insight.recommendedActionPlan.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Suggested Corrective Adjustments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insight.recommendedActionPlan.map((action, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{action.title}</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      +₹{action.impactInINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal mb-2">
                    {action.actionableStep}
                  </p>
                </div>
                <div className="text-[10px] text-teal-400 capitalize pt-2 border-t border-slate-800/60 font-medium">
                  Target: {action.targetCategory}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty & Assumptions Disclosure */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 text-[11px] text-slate-400">
        <strong className="text-slate-300">Uncertainty & Data Limitations: </strong>
        {insight.uncertaintyAndLimitations}
      </div>
    </div>
  );
}
