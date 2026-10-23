/**
 * PaisaPilot AI - Financial Decision Replay Engine
 * 
 * Distinctive Innovation for PromptWars 2026:
 * Replays past spending choices, isolates drivers of overspending,
 * projects runway risk, and formulates 2-3 actionable corrective levers
 * with explicit mathematical proofs and transparent assumptions.
 */

import {
  BudgetCalculationResult,
  SpendingForecast,
  FinancialDecisionReplay,
  CorrectiveActionScenario,
  TransactionCategory,
} from '@/types/finance';

/**
 * Builds the Financial Decision Replay analysis for the current pay period.
 */
export function generateDecisionReplay(
  budget: BudgetCalculationResult,
  forecast: SpendingForecast
): FinancialDecisionReplay {
  const {
    monthlySalary,
    remainingMonthlyIncome,
    plannedSavingsAllocation,
    netPlannedDiscretionaryBudget,
    netDiscretionarySpent,
    remainingDiscretionaryBudget,
    daysElapsedInCycle,
    daysUntilPayday,
    dailyDiscretionaryAllowance,
    currentDailyBurnRate,
    categoryBreakdown,
  } = budget;

  // 1. Identify Top Overspending Categories
  const categoryKeys: TransactionCategory[] = [
    'food',
    'groceries',
    'shopping',
    'transport',
    'subscriptions',
    'bills',
    'other',
  ];

  // Benchmark ideal discretionary proportion for young salaried Indian:
  // Food: ~30%, Groceries: ~25%, Shopping: ~15%, Transport: ~15%, Subscriptions: ~5%, Bills: ~5%, Other: ~5%
  const idealWeights: Record<TransactionCategory, number> = {
    food: 0.30,
    groceries: 0.25,
    shopping: 0.15,
    transport: 0.15,
    subscriptions: 0.05,
    bills: 0.05,
    other: 0.05,
  };

  const topOverspendingCategories = categoryKeys
    .map((cat) => {
      const item = categoryBreakdown[cat];
      const idealBudgetForCat = netPlannedDiscretionaryBudget * idealWeights[cat];
      const excess = item.amount - idealBudgetForCat;
      return {
        category: cat,
        spent: item.amount,
        sharePercent: item.percentageOfSpend,
        excess,
        item,
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)
    .map((cat) => {
      let insight = '';
      if (cat.category === 'food') {
        insight = `Accounts for ₹${cat.spent.toLocaleString('en-IN')} (${cat.sharePercent}% of total discretionary spend) across ${cat.item.transactionCount} transactions (avg ₹${Math.round(cat.item.averageTransactionAmount)}/order). High frequency of food delivery orders.`;
      } else if (cat.category === 'groceries') {
        insight = `Quick-commerce & grocery spends totaled ₹${cat.spent.toLocaleString('en-IN')} (${cat.sharePercent}%) with ${cat.item.transactionCount} cart checkouts. Instant delivery convenience fees and impulse add-ons compound rapidly.`;
      } else if (cat.category === 'shopping') {
        insight = `E-commerce orders consumed ₹${cat.spent.toLocaleString('en-IN')} (${cat.sharePercent}%). Non-essential purchases accelerated burn rate.`;
      } else if (cat.category === 'transport') {
        insight = `Cab and transit expenses reached ₹${cat.spent.toLocaleString('en-IN')} (${cat.sharePercent}%). Peak-hour surge pricing contributed to excess spend.`;
      } else {
        insight = `Totaled ₹${cat.spent.toLocaleString('en-IN')} (${cat.sharePercent}%). Recurring charges add up over the 30-day cycle.`;
      }
      return {
        category: cat.category,
        spent: cat.spent,
        sharePercent: cat.sharePercent,
        insight,
      };
    });

  // 2. Synthesize "What Happened" Summary
  const whatHappenedSummary = `Over the past ${daysElapsedInCycle} days, you received a take-home salary of ₹${monthlySalary.toLocaleString('en-IN')}. After reserving ₹${budget.fixedObligations.toLocaleString('en-IN')} for fixed rent/obligations and ₹${plannedSavingsAllocation.toLocaleString('en-IN')} for planned savings, your spendable discretionary budget was ₹${netPlannedDiscretionaryBudget.toLocaleString('en-IN')}. To date, you have made ${Object.values(categoryBreakdown).reduce((acc, c) => acc + c.transactionCount, 0)} discretionary purchases totaling ₹${netDiscretionarySpent.toLocaleString('en-IN')} (burn rate: ₹${Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day). Remaining discretionary balance is ₹${remainingDiscretionaryBudget.toLocaleString('en-IN')}.`;

  // 3. Synthesize "What May Happen" Projection
  let whatMayHappenProjection = '';
  let exhaustionWarning: string | null = null;

  if (forecast.isExhaustionLikely && forecast.budgetExhaustionDate) {
    exhaustionWarning = forecast.warningMessage || null;
    whatMayHappenProjection = `If your current spending pace of ₹${Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day continues, your remaining budget of ₹${remainingDiscretionaryBudget.toLocaleString('en-IN')} will run out on ${forecast.budgetExhaustionDate} — leaving you with ₹0 for the final ${daysUntilPayday - Math.floor(forecast.daysOfRunwayRemaining)} days before payday. You risk falling into a month-end deficit of ₹${Math.abs(forecast.projectedDeficitOrSurplus).toLocaleString('en-IN')}.`;
  } else if (remainingDiscretionaryBudget <= 0) {
    exhaustionWarning = 'Your discretionary budget is currently depleted.';
    whatMayHappenProjection = `Your discretionary budget is at ₹${remainingDiscretionaryBudget.toLocaleString('en-IN')}. Any additional non-essential spending directly erodes your planned savings target of ₹${plannedSavingsAllocation.toLocaleString('en-IN')} or relies on credit.`;
  } else {
    whatMayHappenProjection = `At your current pace of ₹${Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day, you are on track to reach payday with a surplus buffer of approximately ₹${Math.max(0, forecast.projectedEndBalance).toLocaleString('en-IN')}. Your calculated daily spending allowance is ₹${Math.round(dailyDiscretionaryAllowance).toLocaleString('en-IN')}/day for the remaining ${daysUntilPayday} days.`;
  }

  // 4. Formulate 2-3 Actionable Corrective Scenarios
  const duration = Math.max(1, Math.min(daysUntilPayday, 14));
  const correctiveActions: CorrectiveActionScenario[] = [];

  // Scenario 1: Food Delivery Trimming
  const foodSpent = categoryBreakdown.food.amount;
  if (foodSpent > 0 && daysUntilPayday > 0) {
    const dailyTrim = Math.min(300, Math.max(150, Math.round(foodSpent / Math.max(1, daysElapsedInCycle) * 0.4 / 50) * 50));
    const projectedSavings = dailyTrim * duration;
    const newProjectedEndBalance = forecast.projectedEndBalance + projectedSavings;
    const newRemainingBudget = remainingDiscretionaryBudget + projectedSavings;
    const newDailyAllowance = daysUntilPayday > 0 ? Math.round((newRemainingBudget / daysUntilPayday) * 100) / 100 : 0;

    correctiveActions.push({
      id: 'reduce_delivery',
      title: 'Cap Food Delivery & Cook 2 Extra Meals/Week',
      category: 'food',
      description: `Reduce food-delivery orders by ₹${dailyTrim} per day over the next ${duration} days (e.g., skip 1 delivery order or dine at cafeteria).`,
      dailyReduction: dailyTrim,
      durationDays: duration,
      projectedTotalSavings: projectedSavings,
      newProjectedEndBalance,
      newDailyAllowance,
      evidenceAndAssumptions: `If you reduce planned food-delivery spending by ₹${dailyTrim}/day for the next ${duration} days, your projected spending decreases by ₹${projectedSavings.toLocaleString('en-IN')}, assuming this reduction is achieved and all other spending categories remain unchanged.`,
      actionType: 'reduce_delivery',
    });
  }

  // Scenario 2: Quick-Commerce Batching
  const grocerySpent = categoryBreakdown.groceries.amount;
  if (grocerySpent > 0 && daysUntilPayday > 0) {
    const dailyTrim = Math.min(250, Math.max(100, Math.round(grocerySpent / Math.max(1, daysElapsedInCycle) * 0.35 / 50) * 50));
    const projectedSavings = dailyTrim * duration;
    const newProjectedEndBalance = forecast.projectedEndBalance + projectedSavings;
    const newRemainingBudget = remainingDiscretionaryBudget + projectedSavings;
    const newDailyAllowance = daysUntilPayday > 0 ? Math.round((newRemainingBudget / daysUntilPayday) * 100) / 100 : 0;

    correctiveActions.push({
      id: 'batch_groceries',
      title: 'Batch Quick-Commerce Orders Weekly',
      category: 'groceries',
      description: `Replace daily 10-minute micro-deliveries (Zepto/Blinkit) with 1 planned weekly market run, saving ₹${dailyTrim}/day on delivery fees and impulse purchases.`,
      dailyReduction: dailyTrim,
      durationDays: duration,
      projectedTotalSavings: projectedSavings,
      newProjectedEndBalance,
      newDailyAllowance,
      evidenceAndAssumptions: `Consolidating quick-commerce orders saves an estimated ₹${dailyTrim}/day in cart surcharges and impulse add-ons, yielding ₹${projectedSavings.toLocaleString('en-IN')} over ${duration} days, assuming orders are reduced to weekly batches and other spending remains unchanged.`,
      actionType: 'pause_quick_commerce',
    });
  }

  // Scenario 3: Discretionary Freeze / Mindful Transit
  const dailyTrimAll = Math.max(100, Math.round(currentDailyBurnRate * 0.25 / 50) * 50);
  const projectedSavingsAll = dailyTrimAll * duration;
  const newProjectedEndBalanceAll = forecast.projectedEndBalance + projectedSavingsAll;
  const newRemainingBudgetAll = remainingDiscretionaryBudget + projectedSavingsAll;
  const newDailyAllowanceAll = daysUntilPayday > 0 ? Math.round((newRemainingBudgetAll / daysUntilPayday) * 100) / 100 : 0;

  correctiveActions.push({
    id: 'mindful_freeze',
    title: 'Discretionary Cooling-off & Public Transit',
    category: 'all',
    description: `Institute a 48-hour pause on non-essential online shopping and utilize metro/bus instead of peak-hour cabs for non-urgent commutes.`,
    dailyReduction: dailyTrimAll,
    durationDays: duration,
    projectedTotalSavings: projectedSavingsAll,
    newProjectedEndBalance: newProjectedEndBalanceAll,
    newDailyAllowance: newDailyAllowanceAll,
    evidenceAndAssumptions: `Trimming ₹${dailyTrimAll}/day across non-essential shopping and transport recovers ₹${projectedSavingsAll.toLocaleString('en-IN')} over ${duration} days, assuming non-urgent transit and impulse shopping remain paused.`,
    actionType: 'custom',
  });

  return {
    periodTitle: `Current Pay Cycle Replay (${daysElapsedInCycle} days completed, ${daysUntilPayday} days to payday)`,
    whatHappenedSummary,
    topOverspendingCategories,
    whatMayHappenProjection,
    exhaustionWarning,
    correctiveActions,
    replayGeneratedAt: new Date().toISOString(),
  };
}
