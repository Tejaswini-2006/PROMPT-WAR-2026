import { describe, it, expect } from 'vitest';
import { buildDeterministicFallbackInsight, getFinancialCopilotInsight } from '@/lib/ai/geminiClient';
import { calculateBudget } from '@/lib/engine/budgetEngine';
import { calculateForecast } from '@/lib/engine/forecastEngine';
import { generateDecisionReplay } from '@/lib/engine/decisionReplay';
import { FinancialProfile, Transaction } from '@/types/finance';

describe('PaisaPilot AI & Deterministic Fallback Engine', () => {
  const profile: FinancialProfile = {
    monthlySalary: 75000,
    salaryDay: 1,
    nextPayday: '2026-11-01',
    fixedObligations: 25000,
    savingsTarget: 15000,
    otherPlannedExpenses: 5000,
    existingMtdSpending: 0,
  };

  const transactions: Transaction[] = [
    { id: '1', date: '2026-10-05', amount: 12000, merchant: 'Swiggy & Dining', category: 'food', paymentMode: 'upi', isRefund: false, createdAt: '' },
    { id: '2', date: '2026-10-10', amount: 8000, merchant: 'Blinkit & Zepto', category: 'groceries', paymentMode: 'upi', isRefund: false, createdAt: '' },
  ];

  const refDate = new Date('2026-10-22T00:00:00Z');
  const budget = calculateBudget(profile, transactions, refDate);
  const forecast = calculateForecast(budget, refDate);

  it('generates fully populated deterministic insights without GEMINI_API_KEY', async () => {
    // When GEMINI_API_KEY is unset or default, getFinancialCopilotInsight must never crash
    delete process.env.GEMINI_API_KEY;

    const insight = await getFinancialCopilotInsight(budget, forecast);

    expect(insight).toBeDefined();
    expect(insight.provider).toBe('deterministic_fallback');
    expect(insight.headline).toBeTruthy();
    expect(insight.spendingAnalysis).toBeTruthy();
    expect(insight.topTriggers.length).toBeGreaterThan(0);
    expect(insight.recommendedActionPlan.length).toBeGreaterThan(0);
    expect(insight.uncertaintyAndLimitations).toContain('recurring fixed expenses');
  });

  it('ensures AI claims mathematically align with financial calculation engine', () => {
    const fallback = buildDeterministicFallbackInsight(budget, forecast);

    // Analysis must quote exact verified amounts
    expect(fallback.spendingAnalysis).toContain(budget.netDiscretionarySpent.toLocaleString('en-IN'));
    expect(fallback.spendingAnalysis).toContain(budget.netPlannedDiscretionaryBudget.toLocaleString('en-IN'));
  });

  it('generates complete Financial Decision Replay with 3 actionable scenarios', () => {
    const replay = generateDecisionReplay(budget, forecast);

    expect(replay.periodTitle).toBeTruthy();
    expect(replay.whatHappenedSummary).toContain('75,000');
    expect(replay.topOverspendingCategories.length).toBeGreaterThan(0);
    expect(replay.correctiveActions.length).toBeGreaterThanOrEqual(2);

    // Each action must contain evidence and assumptions
    replay.correctiveActions.forEach((action) => {
      expect(action.projectedTotalSavings).toBe(action.dailyReduction * action.durationDays);
      expect(action.evidenceAndAssumptions).toContain(action.dailyReduction.toString());
      expect(action.evidenceAndAssumptions).toContain('assuming');
    });
  });
});
