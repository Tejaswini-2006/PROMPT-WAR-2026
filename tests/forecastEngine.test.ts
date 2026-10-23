import { describe, it, expect } from 'vitest';
import { calculateBudget } from '@/lib/engine/budgetEngine';
import { calculateForecast } from '@/lib/engine/forecastEngine';
import { FinancialProfile, Transaction } from '@/types/finance';

describe('PaisaPilot Forecast Engine', () => {
  const profile: FinancialProfile = {
    monthlySalary: 60000,
    salaryDay: 1,
    nextPayday: '2026-11-01',
    fixedObligations: 20000,
    savingsTarget: 10000,
    otherPlannedExpenses: 0,
    existingMtdSpending: 0,
  };
  // Planned discretionary: 30,000

  it('projects early budget exhaustion date when burn rate is excessive', () => {
    // 20 days elapsed, 10 days until payday
    // Spent 26,000 in 20 days -> Burn rate = 1,300/day
    // Remaining budget = 4,000
    // Runway = 4,000 / 1,300 = ~3 days!
    // Will run out ~7 days before payday!
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-10-10',
        amount: 26000,
        merchant: 'Shopping & Dining',
        category: 'shopping',
        paymentMode: 'card',
        isRefund: false,
        createdAt: '',
      },
    ];

    const refDate = new Date('2026-10-22T00:00:00Z');
    const budget = calculateBudget(profile, transactions, refDate);
    const forecast = calculateForecast(budget, refDate);

    expect(forecast.isExhaustionLikely).toBe(true);
    expect(forecast.budgetExhaustionDate).not.toBeNull();
    expect(forecast.daysOfRunwayRemaining).toBeLessThan(budget.daysUntilPayday);
    expect(forecast.projectedDeficitOrSurplus).toBeLessThan(0); // Projected deficit
  });

  it('projects comfortable surplus when burn rate is disciplined', () => {
    // Spent 5,000 in 20 days -> Burn rate = 250/day
    // Remaining budget = 25,000
    // Remaining 10 days at 250/day = 2,500 additional spend
    // Projected end balance = 25,000 - 2,500 = +22,500 surplus!
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-10-05',
        amount: 5000,
        merchant: 'Groceries',
        category: 'groceries',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '',
      },
    ];

    const refDate = new Date('2026-10-22T00:00:00Z');
    const budget = calculateBudget(profile, transactions, refDate);
    const forecast = calculateForecast(budget, refDate);

    expect(forecast.isExhaustionLikely).toBe(false);
    expect(forecast.budgetExhaustionDate).toBeNull();
    expect(forecast.projectedDeficitOrSurplus).toBeGreaterThan(0);
  });
});
