/**
 * PaisaPilot AI - Deterministic Spending Forecasting Engine
 * 
 * Provides transparent, data-backed projections without black-box approximations.
 * Computes projected period spending, runway days, and exact budget exhaustion dates.
 */

import {
  BudgetCalculationResult,
  SpendingForecast,
} from '@/types/finance';

/**
 * Calculates deterministic spending projections based on verified transaction data.
 * 
 * Formula:
 * - Run-rate = netDiscretionarySpent / daysElapsedInCycle
 * - Projected Additional Spend = Run-rate * daysUntilPayday
 * - Projected Total Period Spend = netDiscretionarySpent + Projected Additional Spend
 * - Projected End Balance = remainingDiscretionaryBudget - Projected Additional Spend
 * - Runway Days = remainingDiscretionaryBudget / Run-rate (if Run-rate > 0)
 */
export function calculateForecast(
  budget: BudgetCalculationResult,
  referenceDate: Date = new Date()
): SpendingForecast {
  const {
    netDiscretionarySpent,
    remainingDiscretionaryBudget,
    daysElapsedInCycle,
    daysUntilPayday,
    currentDailyBurnRate,
    netPlannedDiscretionaryBudget,
  } = budget;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  // If already exhausted
  if (remainingDiscretionaryBudget <= 0) {
    const exhaustionDateStr = today.toISOString().split('T')[0];
    return {
      projectedPeriodSpending: Math.round(netDiscretionarySpent + (currentDailyBurnRate * daysUntilPayday)),
      projectedDeficitOrSurplus: Math.round(remainingDiscretionaryBudget - (currentDailyBurnRate * daysUntilPayday)),
      projectedEndBalance: Math.round(remainingDiscretionaryBudget - (currentDailyBurnRate * daysUntilPayday)),
      budgetExhaustionDate: exhaustionDateStr,
      daysOfRunwayRemaining: 0,
      isExhaustionLikely: true,
      confidenceScore: 0.95,
      calculationMethod: 'Historical daily burn rate applied to remaining cycle days.',
      warningMessage: 'Discretionary budget is currently at or below ₹0. Every new purchase deepens month-end deficit.',
    };
  }

  // If zero spending yet or zero days elapsed
  if (currentDailyBurnRate <= 0 || netDiscretionarySpent <= 0) {
    return {
      projectedPeriodSpending: 0,
      projectedDeficitOrSurplus: remainingDiscretionaryBudget,
      projectedEndBalance: remainingDiscretionaryBudget,
      budgetExhaustionDate: null,
      daysOfRunwayRemaining: daysUntilPayday,
      isExhaustionLikely: false,
      confidenceScore: 0.4,
      calculationMethod: 'Zero spending recorded yet in current cycle; pace assumed within planned budget.',
    };
  }

  // Calculate projected spend to end of cycle
  const projectedAdditionalSpend = currentDailyBurnRate * daysUntilPayday;
  const projectedPeriodSpending = Math.round((netDiscretionarySpent + projectedAdditionalSpend) * 100) / 100;
  const projectedEndBalance = Math.round((remainingDiscretionaryBudget - projectedAdditionalSpend) * 100) / 100;
  const projectedDeficitOrSurplus = projectedEndBalance;

  // Calculate runway in days
  const rawRunwayDays = remainingDiscretionaryBudget / currentDailyBurnRate;
  const daysOfRunwayRemaining = Math.max(0, Math.round(rawRunwayDays * 10) / 10);

  let budgetExhaustionDate: string | null = null;
  let isExhaustionLikely = false;
  let warningMessage: string | undefined;

  // If runway is shorter than days left until next payday
  if (rawRunwayDays < daysUntilPayday) {
    isExhaustionLikely = true;
    const daysToAdd = Math.floor(rawRunwayDays);
    const exhaustionDate = new Date(today);
    exhaustionDate.setDate(exhaustionDate.getDate() + daysToAdd);
    budgetExhaustionDate = exhaustionDate.toISOString().split('T')[0];

    const daysShort = daysUntilPayday - Math.floor(rawRunwayDays);
    warningMessage = `At your current burn rate of ₹${Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day, your budget will run out ${daysShort} day${daysShort > 1 ? 's' : ''} before payday on ${budgetExhaustionDate}.`;
  }

  // Confidence is proportional to cycle elapsed (more days = higher confidence)
  const confidenceScore = Math.min(
    0.95,
    Math.max(0.3, Math.round((daysElapsedInCycle / 30) * 100) / 100)
  );

  return {
    projectedPeriodSpending,
    projectedDeficitOrSurplus,
    projectedEndBalance,
    budgetExhaustionDate,
    daysOfRunwayRemaining,
    isExhaustionLikely,
    confidenceScore,
    calculationMethod: `Deterministic Linear Run-rate: ₹${Math.round(currentDailyBurnRate).toLocaleString('en-IN')}/day pace across ${daysUntilPayday} remaining days.`,
    warningMessage,
  };
}
