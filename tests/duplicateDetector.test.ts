import { describe, it, expect } from 'vitest';
import { detectDuplicates, normalizeMerchant } from '@/lib/engine/duplicateDetector';
import { Transaction } from '@/types/finance';

describe('PaisaPilot Duplicate Detection Engine', () => {
  it('normalizes merchant prefixes and whitespace', () => {
    expect(normalizeMerchant('UPI/SWIGGY/12345')).toContain('swiggy');
    expect(normalizeMerchant('Paytm*Blinkit')).toContain('blinkit');
    expect(normalizeMerchant('  Zomato   India  ')).toBe('zomato india');
  });

  it('flags potential duplicate without automatically deleting legitimate transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-10-06',
        amount: 420,
        merchant: 'Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '2026-10-06T13:20:00Z',
      },
      {
        id: 'tx-2',
        date: '2026-10-06',
        amount: 420,
        merchant: 'UPI/Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '2026-10-06T13:22:00Z',
      },
    ];

    const result = detectDuplicates(transactions);

    // Both transactions MUST be preserved in output! (Never auto-deleted)
    expect(result).toHaveLength(2);
    // Both or the duplicate must be flagged with a helpful reason
    expect(result[0].isDuplicateCandidate || result[1].isDuplicateCandidate).toBe(true);
    const flagged = result.find((t) => t.isDuplicateCandidate);
    expect(flagged?.duplicateReason).toBeDefined();
    expect(flagged?.duplicateReason).toContain('420');
  });

  it('does NOT flag different amounts or different dates as duplicates', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-10-06',
        amount: 420,
        merchant: 'Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '',
      },
      {
        id: 'tx-2',
        date: '2026-10-15', // 9 days later
        amount: 420,
        merchant: 'Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '',
      },
      {
        id: 'tx-3',
        date: '2026-10-06',
        amount: 850, // Different amount
        merchant: 'Swiggy',
        category: 'food',
        paymentMode: 'upi',
        isRefund: false,
        createdAt: '',
      },
    ];

    const result = detectDuplicates(transactions);
    expect(result.every((t) => !t.isDuplicateCandidate)).toBe(true);
  });
});
