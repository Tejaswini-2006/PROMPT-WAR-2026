/**
 * PaisaPilot AI - Server-Side Copilot & Financial Engine API Route
 * 
 * Secure, rate-resistant, hardened server endpoint:
 * - Keeps GEMINI_API_KEY exclusively on the server
 * - Validates input bounds and structures
 * - Executes deterministic budgeting & forecasting
 * - Runs Financial Decision Replay engine
 * - Calls Gemini with fallback resilience
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBudget } from '@/lib/engine/budgetEngine';
import { calculateForecast } from '@/lib/engine/forecastEngine';
import { generateDecisionReplay } from '@/lib/engine/decisionReplay';
import { getFinancialCopilotInsight } from '@/lib/ai/geminiClient';
import { FinancialProfile, Transaction } from '@/types/finance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { profile, transactions } = body as {
      profile?: Partial<FinancialProfile>;
      transactions?: Transaction[];
    };

    if (!profile || typeof profile !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing financial profile object.' },
        { status: 400 }
      );
    }

    // Sanitize Profile
    const safeProfile: FinancialProfile = {
      monthlySalary: Math.max(0, Math.min(100000000, Number(profile.monthlySalary) || 0)),
      salaryDay: Math.max(1, Math.min(31, Number(profile.salaryDay) || 1)),
      nextPayday: typeof profile.nextPayday === 'string' ? profile.nextPayday : new Date().toISOString().split('T')[0],
      fixedObligations: Math.max(0, Math.min(100000000, Number(profile.fixedObligations) || 0)),
      savingsTarget: Math.max(0, Math.min(100000000, Number(profile.savingsTarget) || 0)),
      otherPlannedExpenses: Math.max(0, Math.min(100000000, Number(profile.otherPlannedExpenses) || 0)),
      existingMtdSpending: Math.max(0, Math.min(100000000, Number(profile.existingMtdSpending) || 0)),
    };

    // Sanitize Transactions (Limit to 5000 max for memory guard)
    const rawTxList = Array.isArray(transactions) ? transactions.slice(0, 5000) : [];
    const safeTransactions: Transaction[] = rawTxList.map((tx, idx) => ({
      id: typeof tx.id === 'string' ? tx.id : `tx-${idx}`,
      date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().split('T')[0],
      amount: Math.max(0, Math.min(10000000, Number(tx.amount) || 0)),
      merchant: typeof tx.merchant === 'string' ? tx.merchant.slice(0, 150) : 'Unknown Merchant',
      category: tx.category || 'other',
      paymentMode: tx.paymentMode || 'upi',
      notes: typeof tx.notes === 'string' ? tx.notes.slice(0, 200) : undefined,
      isRefund: Boolean(tx.isRefund),
      isDuplicateCandidate: Boolean(tx.isDuplicateCandidate),
      duplicateReason: typeof tx.duplicateReason === 'string' ? tx.duplicateReason : undefined,
      createdAt: typeof tx.createdAt === 'string' ? tx.createdAt : new Date().toISOString(),
    }));

    // 1. Deterministic Financial Math
    const budget = calculateBudget(safeProfile, safeTransactions);

    // 2. Deterministic Forecast
    const forecast = calculateForecast(budget);

    // 3. Financial Decision Replay
    const decisionReplay = generateDecisionReplay(budget, forecast);

    // 4. AI Copilot Reasoning (Gemini with deterministic fallback)
    const aiInsight = await getFinancialCopilotInsight(budget, forecast);

    return NextResponse.json({
      success: true,
      data: {
        budget,
        forecast,
        decisionReplay,
        aiInsight,
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/copilot] Server error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred during financial calculation.',
      },
      { status: 500 }
    );
  }
}
