import { describe, it, expect } from 'vitest';
import { parseTransactionsCSV, sanitizeString, normalizeDate } from '@/lib/engine/csvParser';

describe('PaisaPilot CSV Parser & Sanitization Security', () => {
  it('sanitizes potential script injection payloads', () => {
    const malicious = '<script>alert("hack")</script>Swiggy';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('normalizes various standard date formats', () => {
    expect(normalizeDate('2026-10-15')).toBe('2026-10-15');
    expect(normalizeDate('15/10/2026')).toBe('2026-10-15');
    expect(normalizeDate('15-10-2026')).toBe('2026-10-15');
  });

  it('successfully parses valid standard CSV with debits and refunds', () => {
    const csv = `Date,Merchant,Amount,Category,Type
2026-10-05,Swiggy,450,food,Debit
2026-10-06,Blinkit,320,groceries,Debit
2026-10-07,Swiggy Desk,450,food,Refund`;

    const result = parseTransactionsCSV(csv);
    expect(result.success).toBe(true);
    expect(result.importedCount).toBe(3);
    expect(result.transactions[0].merchant).toBe('Swiggy');
    expect(result.transactions[0].amount).toBe(450);
    expect(result.transactions[0].isRefund).toBe(false);

    // Refund row
    expect(result.transactions[2].isRefund).toBe(true);
  });

  it('rejects empty or header-only CSV with actionable diagnostic', () => {
    const emptyResult = parseTransactionsCSV('');
    expect(emptyResult.success).toBe(false);
    expect(emptyResult.errors.length).toBeGreaterThan(0);

    const headerOnly = 'Date,Merchant,Category';
    const headerResult = parseTransactionsCSV(headerOnly);
    expect(headerResult.success).toBe(false);
  });

  it('rejects CSV missing required Amount column', () => {
    const badCsv = `Date,Merchant,Notes
2026-10-05,Swiggy,Lunch`;
    const result = parseTransactionsCSV(badCsv);
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('Missing required columns');
  });

  it('skips malformed numeric rows while importing valid rows', () => {
    const mixedCsv = `Date,Merchant,Amount
2026-10-05,Swiggy,450
2026-10-06,Uber,NOT_A_NUMBER
2026-10-07,Blinkit,210`;

    const result = parseTransactionsCSV(mixedCsv);
    expect(result.success).toBe(true);
    expect(result.importedCount).toBe(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('amount');
  });
});
