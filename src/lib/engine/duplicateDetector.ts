/**
 * PaisaPilot AI - Transaction Duplicate Detection Engine
 * 
 * Accurately flags potential duplicate charges (common in flaky UPI networks)
 * WITHOUT automatically deleting legitimate recurring or twin purchases.
 */

import { Transaction } from '@/types/finance';

export interface DuplicateDetectionOptions {
  windowHours?: number; // Time window to consider identical purchases duplicates (default 24h)
  amountTolerance?: number; // Acceptable amount discrepancy (default 0.01 INR)
}

/**
 * Normalizes merchant name for fuzzy comparison.
 * Strips common prefixes like "UPI/", "PAYTM*", "RAZORPAY*", trailing IDs.
 */
export function normalizeMerchant(merchant: string): string {
  if (!merchant) return '';
  return merchant
    .toLowerCase()
    .replace(/^(upi\/|paytm\*|razorpay\*|pos\s+|in\*)/i, '')
    .replace(/[\s\-_]+/g, ' ')
    .trim();
}

/**
 * Scans a list of transactions and flags candidate duplicates.
 * Returns a new array with updated duplicate flags and human-readable reasons.
 */
export function detectDuplicates(
  transactions: Transaction[],
  options: DuplicateDetectionOptions = {}
): Transaction[] {
  const windowHours = options.windowHours ?? 24;
  const tolerance = options.amountTolerance ?? 0.01;

  return transactions.map((tx, index) => {
    // Check against all previous transactions in list
    let isDuplicate = false;
    let duplicateReason: string | undefined;

    const txDate = new Date(tx.date).getTime();
    const txNormMerchant = normalizeMerchant(tx.merchant);

    for (let j = 0; j < transactions.length; j++) {
      if (index === j) continue;
      const other = transactions[j];

      // Must be same debit/credit type
      if (tx.isRefund !== other.isRefund) continue;

      // Check amount matching
      const amountDiff = Math.abs(tx.amount - other.amount);
      if (amountDiff > tolerance) continue;

      // Check merchant matching
      const otherNormMerchant = normalizeMerchant(other.merchant);
      const isMerchantMatch =
        txNormMerchant === otherNormMerchant ||
        (txNormMerchant.length > 3 && otherNormMerchant.includes(txNormMerchant)) ||
        (otherNormMerchant.length > 3 && txNormMerchant.includes(otherNormMerchant));

      if (!isMerchantMatch) continue;

      // Check date proximity
      const otherDate = new Date(other.date).getTime();
      if (!isNaN(txDate) && !isNaN(otherDate)) {
        const diffHours = Math.abs(txDate - otherDate) / (1000 * 60 * 60);
        if (diffHours <= windowHours) {
          isDuplicate = true;
          duplicateReason = `Possible duplicate of ₹${other.amount} at "${other.merchant}" on ${other.date}`;
          break;
        }
      }
    }

    return {
      ...tx,
      isDuplicateCandidate: isDuplicate,
      duplicateReason,
    };
  });
}
