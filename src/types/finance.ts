/**
 * PaisaPilot AI - Core Financial Types and Data Structures
 * Deterministic Financial Modeling for Salaried Indian Millennials & Gen-Z
 */

export type TransactionCategory =
  | 'food'
  | 'groceries'
  | 'shopping'
  | 'transport'
  | 'subscriptions'
  | 'bills'
  | 'other';

export type PaymentMode = 'upi' | 'card' | 'netbanking' | 'cash';

export interface FinancialProfile {
  monthlySalary: number; // Take-home salary after taxes (in INR)
  salaryDay: number; // Day of month salary is credited (1-31)
  nextPayday: string; // ISO date string (YYYY-MM-DD)
  fixedObligations: number; // Rent, EMIs, maintenance, fixed loan/family commitments
  savingsTarget: number; // Dedicated savings allocation (in INR)
  otherPlannedExpenses: number; // Non-recurring planned commitments for current month
  existingMtdSpending: number; // Spending incurred this month prior to tracking in app
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number; // Positive number. If isRefund is true, represents refund credit.
  merchant: string;
  category: TransactionCategory;
  paymentMode: PaymentMode;
  notes?: string;
  isRefund: boolean;
  isDuplicateCandidate?: boolean;
  duplicateReason?: string;
  createdAt: string;
}

export interface CategoryBreakdownItem {
  category: TransactionCategory;
  label: string;
  amount: number;
  percentageOfSpend: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export interface BudgetCalculationResult {
  // Foundational Income Split
  monthlySalary: number;
  fixedObligations: number;
  remainingMonthlyIncome: number; // Salary - Fixed Obligations
  plannedSavingsAllocation: number; // Target savings set aside
  otherPlannedExpenses: number; // Planned commitments
  netPlannedDiscretionaryBudget: number; // Remaining Monthly Income - Savings - Other Planned Expenses

  // Spend Tracking
  totalDiscretionarySpent: number; // Total outgoing purchases (excluding refunds)
  totalRefunds: number; // Total money credited back
  netDiscretionarySpent: number; // (totalDiscretionarySpent - totalRefunds) + existingMtdSpending
  remainingDiscretionaryBudget: number; // netPlannedDiscretionaryBudget - netDiscretionarySpent

  // Runway & Payday Metrics
  daysInCurrentCycle: number;
  daysElapsedInCycle: number;
  daysUntilPayday: number;
  dailyDiscretionaryAllowance: number; // Remaining budget / days until payday (safe clamped)
  currentDailyBurnRate: number; // netDiscretionarySpent / daysElapsed (safe clamped)

  // Status & Health
  budgetUtilizationPercentage: number; // (netDiscretionarySpent / netPlannedDiscretionaryBudget) * 100
  isOverBudget: boolean;
  budgetHealthStatus: 'surplus' | 'on_track' | 'caution' | 'critical' | 'exhausted';

  // Category Aggregates
  categoryBreakdown: Record<TransactionCategory, CategoryBreakdownItem>;
  topSpendingCategory: TransactionCategory | null;

  // Audit Assumptions
  assumptions: string[];
}

export interface SpendingForecast {
  projectedPeriodSpending: number; // Deterministic projection of end-of-cycle spend
  projectedDeficitOrSurplus: number; // Positive = Surplus, Negative = Deficit
  projectedEndBalance: number; // Expected cash remaining on next payday
  budgetExhaustionDate: string | null; // Date (YYYY-MM-DD) when remaining budget hits 0, or null if runway is sufficient
  daysOfRunwayRemaining: number; // Estimated days before budget is depleted
  isExhaustionLikely: boolean;
  confidenceScore: number; // 0 to 1 based on days of data available
  calculationMethod: string;
  warningMessage?: string;
}

export interface CorrectiveActionScenario {
  id: string;
  title: string;
  category: TransactionCategory | 'all';
  description: string;
  dailyReduction: number; // Daily spending reduction in INR
  durationDays: number; // Number of days to apply the reduction
  projectedTotalSavings: number; // dailyReduction * durationDays
  newProjectedEndBalance: number; // Projected balance after adopting scenario
  newDailyAllowance: number; // Recalculated daily allowance
  evidenceAndAssumptions: string;
  actionType: 'reduce_delivery' | 'cook_at_home' | 'pause_quick_commerce' | 'cancel_subs' | 'custom';
}

export interface FinancialDecisionReplay {
  periodTitle: string;
  whatHappenedSummary: string;
  topOverspendingCategories: {
    category: TransactionCategory;
    spent: number;
    sharePercent: number;
    insight: string;
  }[];
  whatMayHappenProjection: string;
  exhaustionWarning: string | null;
  correctiveActions: CorrectiveActionScenario[];
  replayGeneratedAt: string;
}

export interface AIReasoningInsight {
  headline: string;
  healthAssessment: 'healthy' | 'caution' | 'critical';
  spendingAnalysis: string;
  topTriggers: string[];
  projectedExhaustionNotice: string | null;
  recommendedActionPlan: {
    title: string;
    impactInINR: number;
    actionableStep: string;
    targetCategory: TransactionCategory | 'all';
  }[];
  uncertaintyAndLimitations: string;
  provider: 'gemini' | 'deterministic_fallback';
  modelUsed?: string;
  timestamp: string;
}

export interface CSVParsingError {
  row: number;
  field?: string;
  message: string;
}

export interface CSVImportResult {
  success: boolean;
  transactions: Transaction[];
  totalRowsProcessed: number;
  importedCount: number;
  duplicateCount: number;
  errors: CSVParsingError[];
  warnings: string[];
}
