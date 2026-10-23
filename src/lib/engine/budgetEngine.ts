/**
 * PaisaPilot AI - Deterministic Financial Budgeting Engine
 * 
 * Implements strict, reproducible financial mathematics for young salaried Indians.
 * Accurately models UPI micro-spending, salary deduction schedules, fixed obligations,
 * savings allocations, and remaining discretionary daily runway.
 * 
 * NEVER divides salary by 30 blindly: protects fixed commitments and savings goals first.
 */

import {
  FinancialProfile,
  Transaction,
  BudgetCalculationResult,
  CategoryBreakdownItem,
  TransactionCategory,
} from '@/types/finance';

export const ALL_CATEGORIES: TransactionCategory[] = [
  'food',
  'groceries',
  'shopping',
  'transport',
  'subscriptions',
  'bills',
  'other',
];

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food: 'Food & Dining (Swiggy, Zomato, Cafes)',
  groceries: 'Quick-Commerce & Groceries (Blinkit, Zepto, Instamart)',
  shopping: 'Shopping & E-Commerce',
  transport: 'Cab & Transit (Uber, Ola, Metro)',
  subscriptions: 'OTT & Digital Subscriptions',
  bills: 'Utilities & Recharge',
  other: 'Other Discretionary',
};

/**
 * Computes calendar days remaining between current date and next payday.
 * Handles invalid strings, timezones, and negative differences gracefully.
 */
export function calculateDaysUntilPayday(
  nextPaydayStr: string,
  referenceDate: Date = new Date()
): { daysUntilPayday: number; daysElapsed: number; daysInCycle: number } {
  try {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    const payday = new Date(nextPaydayStr);
    payday.setHours(0, 0, 0, 0);

    if (isNaN(payday.getTime())) {
      // Fallback default: assume 10 days remaining in cycle
      return { daysUntilPayday: 10, daysElapsed: 20, daysInCycle: 30 };
    }

    const diffMs = payday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Assume standard 30-day pay cycle for reference
    const daysInCycle = 30;
    const daysUntilPayday = Math.max(0, diffDays);
    const daysElapsed = Math.max(1, Math.min(daysInCycle, daysInCycle - daysUntilPayday));

    return { daysUntilPayday, daysElapsed, daysInCycle };
  } catch {
    return { daysUntilPayday: 10, daysElapsed: 20, daysInCycle: 30 };
  }
}

/**
 * Aggregates transactions by category, accounting for refunds.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[]
): Record<TransactionCategory, CategoryBreakdownItem> {
  // Initialize breakdown map
  const breakdown: Record<TransactionCategory, CategoryBreakdownItem> = {
    food: { category: 'food', label: CATEGORY_LABELS.food, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    groceries: { category: 'groceries', label: CATEGORY_LABELS.groceries, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    shopping: { category: 'shopping', label: CATEGORY_LABELS.shopping, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    transport: { category: 'transport', label: CATEGORY_LABELS.transport, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    subscriptions: { category: 'subscriptions', label: CATEGORY_LABELS.subscriptions, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    bills: { category: 'bills', label: CATEGORY_LABELS.bills, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
    other: { category: 'other', label: CATEGORY_LABELS.other, amount: 0, percentageOfSpend: 0, transactionCount: 0, averageTransactionAmount: 0 },
  };

  let totalPositiveSpend = 0;

  for (const tx of transactions) {
    const cat = ALL_CATEGORIES.includes(tx.category) ? tx.category : 'other';
    const numAmount = Number(tx.amount);
    if (isNaN(numAmount)) continue;

    if (tx.isRefund) {
      // Deduct refund from category net amount
      breakdown[cat].amount = Math.max(0, breakdown[cat].amount - numAmount);
    } else {
      breakdown[cat].amount += numAmount;
      breakdown[cat].transactionCount += 1;
      totalPositiveSpend += numAmount;
    }
  }

  // Calculate percentages and averages
  for (const cat of ALL_CATEGORIES) {
    const item = breakdown[cat];
    item.amount = Math.round(item.amount * 100) / 100;
    item.percentageOfSpend = totalPositiveSpend > 0
      ? Math.round((item.amount / totalPositiveSpend) * 1000) / 10
      : 0;
    item.averageTransactionAmount = item.transactionCount > 0
      ? Math.round((item.amount / item.transactionCount) * 100) / 100
      : 0;
  }

  return breakdown;
}

/**
 * Main Deterministic Budget Calculation Function
 */
export function calculateBudget(
  profile: FinancialProfile,
  transactions: Transaction[],
  referenceDate: Date = new Date()
): BudgetCalculationResult {
  const assumptions: string[] = [];

  // 1. Sanitize Profile Values
  const monthlySalary = Math.max(0, Number(profile.monthlySalary) || 0);
  const fixedObligations = Math.max(0, Number(profile.fixedObligations) || 0);
  const savingsTarget = Math.max(0, Number(profile.savingsTarget) || 0);
  const otherPlannedExpenses = Math.max(0, Number(profile.otherPlannedExpenses) || 0);
  const existingMtdSpending = Math.max(0, Number(profile.existingMtdSpending) || 0);

  // 2. Fundamental Income Split
  const remainingMonthlyIncome = Math.max(0, monthlySalary - fixedObligations);
  assumptions.push('Fixed obligations (rent, EMI, maintenance) are deducted before calculating spendable budget.');

  const netPlannedDiscretionaryBudget = Math.max(
    0,
    remainingMonthlyIncome - savingsTarget - otherPlannedExpenses
  );
  assumptions.push('Planned savings allocation and other planned commitments are sequestered from discretionary allowance.');

  // 3. Transactions Summation (Debits vs Refunds)
  let totalDiscretionarySpent = 0;
  let totalRefunds = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (amount <= 0) continue;

    if (tx.isRefund) {
      totalRefunds += amount;
    } else {
      totalDiscretionarySpent += amount;
    }
  }

  // Net spend includes tracked debits minus refunds plus prior month-to-date spending
  const trackedNet = Math.max(0, totalDiscretionarySpent - totalRefunds);
  const netDiscretionarySpent = trackedNet + existingMtdSpending;

  // 4. Remaining Discretionary Budget
  const remainingDiscretionaryBudget = netPlannedDiscretionaryBudget - netDiscretionarySpent;

  // 5. Runway Calculation
  const { daysUntilPayday, daysElapsed, daysInCycle } = calculateDaysUntilPayday(
    profile.nextPayday,
    referenceDate
  );

  let dailyDiscretionaryAllowance = 0;
  if (daysUntilPayday <= 0) {
    dailyDiscretionaryAllowance = remainingDiscretionaryBudget > 0 ? remainingDiscretionaryBudget : 0;
    assumptions.push('Payday is today or in the past; allowance reflects remaining balance for the day.');
  } else if (remainingDiscretionaryBudget <= 0) {
    dailyDiscretionaryAllowance = 0;
    assumptions.push('Remaining discretionary budget is exhausted (<= ₹0); daily allowance set to ₹0.');
  } else {
    // Normal case: Spread remaining budget strictly over remaining days until next payday
    dailyDiscretionaryAllowance = Math.round((remainingDiscretionaryBudget / daysUntilPayday) * 100) / 100;
    assumptions.push(`Daily allowance spreads remaining ₹${remainingDiscretionaryBudget.toLocaleString('en-IN')} over ${daysUntilPayday} days until payday.`);
  }

  // 6. Burn Rate
  const currentDailyBurnRate = daysElapsed > 0
    ? Math.round((netDiscretionarySpent / daysElapsed) * 100) / 100
    : 0;

  // 7. Category Breakdown
  const categoryBreakdown = calculateCategoryBreakdown(transactions);

  // Find top spending category
  let topSpendingCategory: TransactionCategory | null = null;
  let maxSpent = 0;
  for (const cat of ALL_CATEGORIES) {
    if (categoryBreakdown[cat].amount > maxSpent) {
      maxSpent = categoryBreakdown[cat].amount;
      topSpendingCategory = cat;
    }
  }

  // 8. Health and Utilization
  const budgetUtilizationPercentage = netPlannedDiscretionaryBudget > 0
    ? Math.round((netDiscretionarySpent / netPlannedDiscretionaryBudget) * 1000) / 10
    : netDiscretionarySpent > 0 ? 100 : 0;

  const isOverBudget = remainingDiscretionaryBudget < 0;

  let budgetHealthStatus: BudgetCalculationResult['budgetHealthStatus'] = 'on_track';
  if (remainingDiscretionaryBudget <= 0) {
    budgetHealthStatus = 'exhausted';
  } else if (budgetUtilizationPercentage >= 90 || (daysUntilPayday > 3 && dailyDiscretionaryAllowance < currentDailyBurnRate * 0.4)) {
    budgetHealthStatus = 'critical';
  } else if (budgetUtilizationPercentage >= 75 || dailyDiscretionaryAllowance < currentDailyBurnRate * 0.7) {
    budgetHealthStatus = 'caution';
  } else if (budgetUtilizationPercentage < 50 && daysElapsed >= 15) {
    budgetHealthStatus = 'surplus';
  }

  return {
    monthlySalary: Math.round(monthlySalary),
    fixedObligations: Math.round(fixedObligations),
    remainingMonthlyIncome: Math.round(remainingMonthlyIncome),
    plannedSavingsAllocation: Math.round(savingsTarget),
    otherPlannedExpenses: Math.round(otherPlannedExpenses),
    netPlannedDiscretionaryBudget: Math.round(netPlannedDiscretionaryBudget),

    totalDiscretionarySpent: Math.round(totalDiscretionarySpent * 100) / 100,
    totalRefunds: Math.round(totalRefunds * 100) / 100,
    netDiscretionarySpent: Math.round(netDiscretionarySpent * 100) / 100,
    remainingDiscretionaryBudget: Math.round(remainingDiscretionaryBudget * 100) / 100,

    daysInCurrentCycle: daysInCycle,
    daysElapsedInCycle: daysElapsed,
    daysUntilPayday,
    dailyDiscretionaryAllowance,
    currentDailyBurnRate,

    budgetUtilizationPercentage,
    isOverBudget,
    budgetHealthStatus,

    categoryBreakdown,
    topSpendingCategory,
    assumptions,
  };
}
