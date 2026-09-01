import type { AppState } from "../store/context";
import { calculateAccountsWithBalances, calculateAvailableCash, calculateMonthlyExpenses, calculateMonthlyIncome, calculateMonthlySaved, calculateNetWorth } from "./transactionEngine";
import { analyzeAllBudgets } from "./budgetEngine";
import { analyzeAllGoals } from "./goalEngine";
import { analyzeAllHoldings, calculatePortfolioPnL, calculatePortfolioPnLPct, calculatePortfolioRiskIndicators, calculatePortfolioValue, calculateSectorAllocation } from "./investmentEngine";
import { calculateFinancialHealthScore, getFullFinancialSummary } from "./financialEngine";
import { analyzeAllRecurring, detectSubscriptionsFromTransactions } from "./recurringEngine";

export function getAccounts(state: AppState) {
  return calculateAccountsWithBalances(state.accounts, state.transactions);
}

export function getTransactions(
  state: AppState,
  filters?: { category?: string; account?: string; type?: string; monthISO?: string }
) {
  return state.transactions.filter((t) => {
    if (filters?.category && filters.category !== "All" && t.category !== filters.category) return false;
    if (filters?.account && filters.account !== "All" && t.account !== filters.account) return false;
    if (filters?.type && t.type !== filters.type) return false;
    if (filters?.monthISO && !t.date.startsWith(filters.monthISO)) return false;
    return true;
  });
}

export function searchTransactions(state: AppState, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return state.transactions;
  return state.transactions.filter((t) =>
    `${t.merchant} ${t.category} ${t.account}`.toLowerCase().includes(q)
  );
}

export function getBudgets(state: AppState) {
  return analyzeAllBudgets(state.budgets, state.transactions);
}

export function getGoals(state: AppState) {
  return analyzeAllGoals(state.goals);
}

export function getHoldings(state: AppState) {
  return analyzeAllHoldings(state.holdings);
}

export function getPortfolio(state: AppState) {
  const holdings = analyzeAllHoldings(state.holdings);
  const totalValue = calculatePortfolioValue(state.holdings);
  const totalPnL = calculatePortfolioPnL(state.holdings);
  const totalPnLPct = calculatePortfolioPnLPct(state.holdings);
  const sectors = calculateSectorAllocation(state.holdings);
  const risk = calculatePortfolioRiskIndicators(state.holdings);

  return {
    totalValue,
    totalPnL,
    totalPnLPct: parseFloat(totalPnLPct.toFixed(1)),
    holdings,
    sectors,
    risk,
  };
}

export function getFinancialSummary(state: AppState) {
  return getFullFinancialSummary(
    state.accounts,
    state.transactions,
    state.budgets,
    state.goals,
    state.holdings
  );
}

export function calculateAffordability(
  state: AppState,
  amount: number,
  itemCategory?: string
) {
  const availableCash = calculateAvailableCash(state.accounts, state.transactions);
  const monthlySaved = calculateMonthlySaved(state.transactions);
  const monthlyExpenses = calculateMonthlyExpenses(state.transactions);
  const emergencyFundBuffer = monthlyExpenses * 3; // 3 months expense buffer

  const affordableFromCash = availableCash >= amount;
  const remainingCash = availableCash - amount;
  const leavesBuffer = remainingCash >= emergencyFundBuffer;

  let advice = "";
  if (affordableFromCash && leavesBuffer) {
    advice = `Yes, ₹${amount.toLocaleString("en-IN")} is completely affordable. You'll still maintain a healthy cash buffer of ₹${remainingCash.toLocaleString("en-IN")}.`;
  } else if (affordableFromCash) {
    advice = `₹${amount.toLocaleString("en-IN")} can be covered by your liquid cash (leaving ₹${remainingCash.toLocaleString("en-IN")}), but it will dip below your 3-month emergency buffer (₹${emergencyFundBuffer.toLocaleString("en-IN")}).`;
  } else {
    advice = `₹${amount.toLocaleString("en-IN")} exceeds your available liquid cash (₹${availableCash.toLocaleString("en-IN")}) by ₹${(amount - availableCash).toLocaleString("en-IN")}.`;
  }

  return {
    requestedAmount: amount,
    itemCategory: itemCategory ?? "General",
    availableCash,
    monthlySurplus: monthlySaved,
    affordableFromCash,
    remainingCash,
    leavesBuffer,
    advice,
  };
}

export function calculatePortfolioRisk(state: AppState) {
  return calculatePortfolioRiskIndicators(state.holdings);
}

export function getSpendingInsights(state: AppState) {
  const budgets = analyzeAllBudgets(state.budgets, state.transactions);
  const overspent = budgets.filter((b) => b.overspent);
  const nearLimit = budgets.filter((b) => !b.overspent && b.utilizationPct > 80);
  const fastPaced = budgets.filter((b) => !b.overspent && b.pacePct > 10);
  const totalSpent = calculateMonthlyExpenses(state.transactions);
  const detectedSubscriptions = detectSubscriptionsFromTransactions(state.transactions, state.recurring);

  return {
    totalSpent,
    overspentCategories: overspent.map((b) => ({ name: b.name, spent: b.spent, limit: b.limit })),
    nearLimitCategories: nearLimit.map((b) => ({ name: b.name, spent: b.spent, limit: b.limit, utilizationPct: b.utilizationPct })),
    fastPacedCategories: fastPaced.map((b) => ({ name: b.name, paceInsight: b.paceInsight })),
    detectedSubscriptions,
  };
}

export function getInvestmentSummary(state: AppState) {
  return getPortfolio(state);
}

/** Master Tool Registry dictionary for AI Agent function calling */
export const AIFinanceTools = {
  getAccounts,
  getTransactions,
  searchTransactions,
  getBudgets,
  getGoals,
  getHoldings,
  getPortfolio,
  getFinancialSummary,
  calculateAffordability,
  calculatePortfolioRisk,
  getSpendingInsights,
  getInvestmentSummary,
};
