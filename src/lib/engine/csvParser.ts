/**
 * PaisaPilot AI - Secure CSV Transaction Parser
 * 
 * Implements strict parsing and security guards:
 * - File size limit (2MB)
 * - Row count limit (2500 rows)
 * - Column count limit (20 columns)
 * - String sanitization (escapes HTML, strips control characters)
 * - Validates date format, numeric bounds, category whitelists
 * - NEVER evaluates or executes uploaded content
 */

import {
  Transaction,
  TransactionCategory,
  PaymentMode,
  CSVImportResult,
  CSVParsingError,
} from '@/types/finance';
import { ALL_CATEGORIES } from './budgetEngine';

export const CSV_LIMITS = {
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  MAX_ROW_COUNT: 2500,
  MAX_COLUMN_COUNT: 20,
  MAX_FIELD_LENGTH: 250,
};

/**
 * Sanitizes untrusted user strings against script injection and control characters.
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .slice(0, CSV_LIMITS.MAX_FIELD_LENGTH)
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip control chars
    .trim();
}

/**
 * Parses a standard CSV line taking into account quotes and commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalizes input date to ISO YYYY-MM-DD format.
 * Supports DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Try ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : clean;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = clean.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const iso = `${year}-${month}-${day}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : iso;
    }
  }

  // Fallback Date parser
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Categorizes a merchant or category string into supported categories.
 */
export function inferOrNormalizeCategory(rawCategory: string, merchant: string): TransactionCategory {
  const combined = `${rawCategory || ''} ${merchant || ''}`.toLowerCase();

  if (ALL_CATEGORIES.includes(rawCategory?.toLowerCase() as TransactionCategory)) {
    return rawCategory.toLowerCase() as TransactionCategory;
  }

  if (combined.includes('swiggy') || combined.includes('zomato') || combined.includes('food') || combined.includes('cafe') || combined.includes('mcdonald') || combined.includes('starbucks') || combined.includes('kfc') || combined.includes('restaurant')) {
    return 'food';
  }
  if (combined.includes('blinkit') || combined.includes('zepto') || combined.includes('instamart') || combined.includes('grocery') || combined.includes('bigbasket') || combined.includes('dmart') || combined.includes('nature basket')) {
    return 'groceries';
  }
  if (combined.includes('amazon') || combined.includes('flipkart') || combined.includes('myntra') || combined.includes('nykaa') || combined.includes('zara') || combined.includes('shopping') || combined.includes('h&m')) {
    return 'shopping';
  }
  if (combined.includes('uber') || combined.includes('ola') || combined.includes('rapido') || combined.includes('metro') || combined.includes('fuel') || combined.includes('petrol') || combined.includes('transit')) {
    return 'transport';
  }
  if (combined.includes('netflix') || combined.includes('spotify') || combined.includes('prime') || combined.includes('hotstar') || combined.includes('youtube') || combined.includes('subscription')) {
    return 'subscriptions';
  }
  if (combined.includes('electricity') || combined.includes('wifi') || combined.includes('airtel') || combined.includes('jio') || combined.includes('broadband') || combined.includes('bescom') || combined.includes('bill')) {
    return 'bills';
  }

  return 'other';
}

/**
 * Parses and strictly validates a CSV string of transactions.
 */
export function parseTransactionsCSV(csvContent: string): CSVImportResult {
  const errors: CSVParsingError[] = [];
  const warnings: string[] = [];
  const transactions: Transaction[] = [];

  if (!csvContent || csvContent.trim().length === 0) {
    return {
      success: false,
      transactions: [],
      totalRowsProcessed: 0,
      importedCount: 0,
      duplicateCount: 0,
      errors: [{ row: 0, message: 'CSV file is empty.' }],
      warnings,
    };
  }

  // Check file size safety
  if (new Blob([csvContent]).size > CSV_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      transactions: [],
      totalRowsProcessed: 0,
      importedCount: 0,
      duplicateCount: 0,
      errors: [{ row: 0, message: `File size exceeds strict maximum of ${CSV_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.` }],
      warnings,
    };
  }

  const rawLines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (rawLines.length > CSV_LIMITS.MAX_ROW_COUNT + 1) {
    return {
      success: false,
      transactions: [],
      totalRowsProcessed: 0,
      importedCount: 0,
      duplicateCount: 0,
      errors: [{ row: 0, message: `Row count exceeds strict maximum of ${CSV_LIMITS.MAX_ROW_COUNT} rows.` }],
      warnings,
    };
  }

  // Parse header
  const header = parseCSVLine(rawLines[0]).map((h) => h.toLowerCase().trim());
  if (header.length > CSV_LIMITS.MAX_COLUMN_COUNT) {
    return {
      success: false,
      transactions: [],
      totalRowsProcessed: 0,
      importedCount: 0,
      duplicateCount: 0,
      errors: [{ row: 0, message: `Column count (${header.length}) exceeds safe limit of ${CSV_LIMITS.MAX_COLUMN_COUNT}.` }],
      warnings,
    };
  }

  // Match columns
  const dateIdx = header.findIndex((h) => h.includes('date') || h === 'tx_date');
  const amountIdx = header.findIndex((h) => h.includes('amount') || h.includes('inr') || h.includes('price'));
  const merchantIdx = header.findIndex((h) => h.includes('merchant') || h.includes('description') || h.includes('payee') || h.includes('narration'));
  const categoryIdx = header.findIndex((h) => h.includes('category') || h.includes('tag'));
  const typeIdx = header.findIndex((h) => h.includes('type') || h.includes('refund') || h.includes('cr/dr'));

  if (amountIdx === -1 || (merchantIdx === -1 && header.length < 2)) {
    return {
      success: false,
      transactions: [],
      totalRowsProcessed: 0,
      importedCount: 0,
      duplicateCount: 0,
      errors: [{ row: 1, message: 'Missing required columns. CSV must include at least "Amount" and "Merchant" or "Description".' }],
      warnings,
    };
  }

  let rowCount = 0;

  for (let i = 1; i < rawLines.length; i++) {
    rowCount++;
    const rowNum = i + 1;
    const cols = parseCSVLine(rawLines[i]);

    if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

    // Parse amount
    const rawAmountStr = cols[amountIdx]?.replace(/[₹$,\s]/g, '');
    const numAmount = parseFloat(rawAmountStr);

    if (isNaN(numAmount)) {
      errors.push({ row: rowNum, field: 'amount', message: `Invalid numeric amount "${cols[amountIdx]}".` });
      continue;
    }

    // Determine if refund
    let isRefund = numAmount < 0;
    let absAmount = Math.abs(numAmount);

    if (typeIdx !== -1 && cols[typeIdx]) {
      const typeVal = cols[typeIdx].toLowerCase();
      if (typeVal.includes('refund') || typeVal.includes('credit') || typeVal === 'cr') {
        isRefund = true;
      }
    }

    if (absAmount > 10000000) {
      errors.push({ row: rowNum, field: 'amount', message: 'Amount exceeds realistic individual transaction threshold of ₹1,00,00,000.' });
      continue;
    }

    // Parse date
    let dateStr = dateIdx !== -1 ? cols[dateIdx] : '';
    let normalizedDate = normalizeDate(dateStr);
    if (!normalizedDate) {
      // Use current date if missing or warn
      normalizedDate = new Date().toISOString().split('T')[0];
      if (dateStr) {
        warnings.push(`Row ${rowNum}: Could not parse date "${dateStr}", defaulted to current date.`);
      }
    }

    // Parse merchant
    const rawMerchant = merchantIdx !== -1 ? cols[merchantIdx] : 'Unknown Merchant';
    const merchant = sanitizeString(rawMerchant) || 'Unknown Merchant';

    // Parse category
    const rawCategory = categoryIdx !== -1 ? cols[categoryIdx] : '';
    const category = inferOrNormalizeCategory(rawCategory, merchant);

    // Create safe transaction
    transactions.push({
      id: `csv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: normalizedDate,
      amount: Math.round(absAmount * 100) / 100,
      merchant,
      category,
      paymentMode: 'upi', // Default common young salaried mode
      isRefund,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    success: transactions.length > 0,
    transactions,
    totalRowsProcessed: rowCount,
    importedCount: transactions.length,
    duplicateCount: 0,
    errors,
    warnings,
  };
}
