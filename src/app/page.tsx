'use strict';
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FinancialProfile,
  Transaction,
  BudgetCalculationResult,
  SpendingForecast,
  FinancialDecisionReplay,
  AIReasoningInsight,
  CorrectiveActionScenario,
} from '@/types/finance';
import { DEMO_FINANCIAL_PROFILE, DEMO_TRANSACTIONS } from '@/lib/data/demoDataset';
import { calculateBudget } from '@/lib/engine/budgetEngine';
import { calculateForecast } from '@/lib/engine/forecastEngine';
import { generateDecisionReplay } from '@/lib/engine/decisionReplay';
import { detectDuplicates } from '@/lib/engine/duplicateDetector';
import { buildDeterministicFallbackInsight } from '@/lib/ai/geminiClient';

import { Header } from '@/components/Header';
import { FinancialProfileForm } from '@/components/FinancialProfileForm';
import { BudgetSummaryCards } from '@/components/BudgetSummaryCards';
import { SpendingBreakdownChart } from '@/components/SpendingBreakdownChart';
import { PaydayProjectionCard } from '@/components/PaydayProjectionCard';
import { DecisionReplayCard } from '@/components/DecisionReplayCard';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { AIAssistantCard } from '@/components/AIAssistantCard';
import { TransactionManager } from '@/components/TransactionManager';
import { PrivacyNoticeModal } from '@/components/PrivacyNoticeModal';
import { ExportReportModal } from '@/components/ExportReportModal';

export default function PaisaPilotApp() {
  // 1. Core State (Initializes with Demo Data by default)
  const [profile, setProfile] = useState<FinancialProfile>(DEMO_FINANCIAL_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    detectDuplicates(DEMO_TRANSACTIONS)
  );
  const [isDemoActive, setIsDemoActive] = useState<boolean>(true);

  // Adopted Corrective Action State from Decision Replay
  const [adoptedAction, setAdoptedAction] = useState<CorrectiveActionScenario | null>(null);

  // AI Copilot State
  const [aiInsight, setAiInsight] = useState<AIReasoningInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Modals State
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 2. Deterministic Financial Math (Pure, instant, local)
  const budget: BudgetCalculationResult = useMemo(() => {
    return calculateBudget(profile, transactions);
  }, [profile, transactions]);

  const forecast: SpendingForecast = useMemo(() => {
    return calculateForecast(budget);
  }, [budget]);

  const decisionReplay: FinancialDecisionReplay = useMemo(() => {
    return generateDecisionReplay(budget, forecast);
  }, [budget, forecast]);

  // 3. Fetch AI Reasoning from Server-Side Copilot Endpoint
  const fetchAiInsight = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, transactions }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.aiInsight) {
          setAiInsight(json.data.aiInsight);
          return;
        }
      }
      // Fallback if network or server error
      setAiInsight(buildDeterministicFallbackInsight(budget, forecast));
    } catch {
      setAiInsight(buildDeterministicFallbackInsight(budget, forecast));
    } finally {
      setIsAiLoading(false);
    }
  }, [profile, transactions, budget, forecast]);

  // Initial load of AI insight
  useEffect(() => {
    fetchAiInsight();
  }, [fetchAiInsight]);

  // Demo toggle handlers
  const handleLoadDemo = () => {
    setProfile(DEMO_FINANCIAL_PROFILE);
    setTransactions(detectDuplicates(DEMO_TRANSACTIONS));
    setAdoptedAction(null);
    setIsDemoActive(true);
  };

  const handleReset = () => {
    const cleanProfile: FinancialProfile = {
      monthlySalary: 50000,
      salaryDay: 1,
      nextPayday: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      fixedObligations: 18000,
      savingsTarget: 10000,
      otherPlannedExpenses: 2000,
      existingMtdSpending: 0,
      updatedAt: new Date().toISOString(),
    };
    setProfile(cleanProfile);
    setTransactions([]);
    setAdoptedAction(null);
    setIsDemoActive(false);
  };

  // Adopt corrective action simulation
  const handleAdoptAction = (action: CorrectiveActionScenario) => {
    if (adoptedAction?.id === action.id) {
      setAdoptedAction(null);
    } else {
      setAdoptedAction(action);
    }
  };

  // Factored budget for adopted scenario
  const effectiveBudget = useMemo(() => {
    if (!adoptedAction) return budget;

    const bonusSavings = adoptedAction.projectedTotalSavings;
    const adjustedRemaining = budget.remainingDiscretionaryBudget + bonusSavings;
    const adjustedDaily = budget.daysUntilPayday > 0
      ? Math.max(0, Math.round((adjustedRemaining / budget.daysUntilPayday) * 100) / 100)
      : 0;

    return {
      ...budget,
      remainingDiscretionaryBudget: adjustedRemaining,
      dailyDiscretionaryAllowance: adjustedDaily,
      budgetHealthStatus: adjustedRemaining > 0 && budget.budgetHealthStatus === 'critical' ? 'caution' : budget.budgetHealthStatus,
    };
  }, [budget, adoptedAction]);

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      {/* Top Navigation */}
      <Header
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        isDemoActive={isDemoActive}
        daysUntilPayday={budget.daysUntilPayday}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Adopted Action Banner (if active) */}
        {adoptedAction && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Active Simulation
                </span>
                <strong className="text-sm font-bold text-white">{adoptedAction.title}</strong>
              </div>
              <p className="text-xs text-emerald-300/90 mt-1">
                Projected savings of +₹{adoptedAction.projectedTotalSavings.toLocaleString('en-IN')} applied! Daily allowance increased to ₹{Math.round(effectiveBudget.dailyDiscretionaryAllowance)}/day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdoptedAction(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-300 hover:bg-slate-800 transition-colors self-start sm:self-auto"
            >
              Cancel Simulation
            </button>
          </div>
        )}

        {/* 1. Financial Profile & Income Split Form */}
        <FinancialProfileForm
          profile={profile}
          onChange={(newProfile) => {
            setProfile(newProfile);
            setIsDemoActive(false);
          }}
        />

        {/* 2. Hero Budget Summary Cards */}
        <BudgetSummaryCards budget={effectiveBudget} />

        {/* 3. Distinctive Feature: Financial Decision Replay */}
        <DecisionReplayCard
          decisionReplay={decisionReplay}
          onAdoptAction={handleAdoptAction}
          adoptedActionId={adoptedAction?.id || null}
        />

        {/* 4. Payday Runway & Exhaustion Projection */}
        <PaydayProjectionCard budget={effectiveBudget} forecast={forecast} />

        {/* 5. Predictive AI Copilot Reasoning */}
        <AIAssistantCard
          insight={aiInsight}
          isLoading={isAiLoading}
          onRefresh={fetchAiInsight}
        />

        {/* 6. What-If Spending Habits Simulator */}
        <WhatIfSimulator budget={effectiveBudget} />

        {/* 7. Category Spending Breakdown */}
        <SpendingBreakdownChart budget={effectiveBudget} />

        {/* 8. Transaction Manager (Manual entry, CSV import, duplicates, refunds) */}
        <TransactionManager
          transactions={transactions}
          onChange={(newTxs) => {
            setTransactions(newTxs);
            setIsDemoActive(false);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-400">PaisaPilot AI</strong> — Your Predictive Financial Copilot for PromptWars 2026
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-teal-400 transition-colors">
              Privacy & Security
            </button>
            <button onClick={() => setIsExportOpen(true)} className="hover:text-teal-400 transition-colors">
              Export Audit
            </button>
            <a
              href="https://github.com/Tejaswini-2006/PROMPT-WAR-2026"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-400 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyNoticeModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        profile={profile}
        transactions={transactions}
        budget={effectiveBudget}
        forecast={forecast}
        decisionReplay={decisionReplay}
        aiInsight={aiInsight}
      />
    </div>
  );
}
