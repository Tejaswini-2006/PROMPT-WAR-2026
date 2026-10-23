import { describe, it, expect } from 'vitest';
import {
  calculateBudget,
  calculateDaysUntilPayday,
  calculateCategoryBreakdown,
} from '@/lib/engine/budgetEngine';
import { FinancialProfile, Transaction } from '@/types/finance';

describe('PaisaPilot Budget Engine', () => {
  const baseProfile: FinancialProfile = {
    monthlySalary: 75000,
    salaryDay: 1,
    nextPayday: '2026-11-01',
    fixedObligations: 25000,
    savingsTarget: 15000,
    otherPlannedExpenses: 5000,
    existingMtdSpending: 0,
  };

  it('correctly sequesters fixed expenses and savings before discretionary spending', () => {
    // 75000 - 25000 = 50000 remaining income
    // 50000 - 15000 (savings) - 5000 (other) = 30000 net discretionary budget
    const budget = calculateBudget(baseProfile, []);

    expect(budget.monthlySalary).toBe(75000);
    expect(budget.fixedObligations).toBe(25000);
    expect(budget.remainingMonthlyIncome).toBe(50000);
    expect(budget.plannedSavingsAllocation).toBe(15000);
    expect(budget.netPlannedDiscretionaryBudget).toBe(30000);
    expect(budget.remainingDiscretionaryBudget).toBe(30000);
  });

  it('calculates daily discretionary allowance strictly from remaining runway, NOT salary / 30', () => {
    // Reference date: 10 days before payday (e.g. 2026-10-22 with payday 2026-11-01)
    const refDate = new Date('2026-10-22T00:00:00Z');
    const budget = calculateBudget(baseProfile, [], refDate);

    // Days until payday = 10
    expect(budget.daysUntilPayday).toBe(10);
    // 30,000 / 10 = 3000 per day (not 75,000 / 30 = 2,500)
    expect(budget.dailyDiscretionaryAllowance).toBe(3000);
  });

  it('correctly handles refund transactions by deducting from spend and restoring allowance', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-10-05',
        amount: 2000,
        merchant: 'Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '2026-10-05',
      },
      {
        id: '2',
        date: '2026-10-06',
        amount: 500,
        merchant: 'Swiggy Refund',
        category: 'food',
        paymentMode: 'upi',
        isRefund: true,
        createdAt: '2026-10-06',
      },
    ];

    const budget = calculateBudget(baseProfile, transactions, new Date('2026-10-22T00:00:00Z'));

    expect(budget.totalDiscretionarySpent).toBe(2000);
    expect(budget.totalRefunds).toBe(500);
    expect(budget.netDiscretionarySpent).toBe(1500);
    expect(budget.remainingDiscretionaryBudget).toBe(30000 - 1500);
  });

  it('handles budget exhaustion and negative balances gracefully (clamped allowance)', () => {
    // User spent 35,000 against 30,000 budget
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-10-05',
        amount: 35000,
        merchant: 'Gadget Store',
        category: 'shopping',
        paymentMode: 'card',
        isRefund: false,
        createdAt: '2026-10-05',
      },
    ];

    const budget = calculateBudget(baseProfile, transactions, new Date('2026-10-22T00:00:00Z'));

    expect(budget.remainingDiscretionaryBudget).toBe(-5000);
    expect(budget.isOverBudget).toBe(true);
    expect(budget.dailyDiscretionaryAllowance).toBe(0); // Never negative daily allowance
    expect(budget.budgetHealthStatus).toBe('exhausted');
  });

  it('handles edge case: zero days remaining (payday today)', () => {
    const today = new Date('2026-11-01T00:00:00Z');
    const budget = calculateBudget(baseProfile, [], today);

    expect(budget.daysUntilPayday).toBe(0);
    // On payday, remaining allowance equals remaining balance
    expect(budget.dailyDiscretionaryAllowance).toBe(30000);
  });

  it('aggregates category spend accurately', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2026-10-02', amount: 400, merchant: 'Swiggy', category: 'food', paymentMode: 'upi', isRefund: false, createdAt: '' },
      { id: '2', date: '2026-10-03', amount: 600, merchant: 'Zomato', category: 'food', paymentMode: 'upi', isRefund: false, createdAt: '' },
      { id: '3', date: '2026-10-04', amount: 300, merchant: 'Blinkit', category: 'groceries', paymentMode: 'upi', isRefund: false, createdAt: '' },
    ];

    const breakdown = calculateCategoryBreakdown(transactions);
    expect(breakdown.food.amount).toBe(1000);
    expect(breakdown.food.transactionCount).toBe(2);
    expect(breakdown.food.averageTransactionAmount).toBe(500);
    expect(breakdown.groceries.amount).toBe(300);
  });
});
