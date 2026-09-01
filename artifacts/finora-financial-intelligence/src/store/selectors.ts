import type { AppState } from "./context";
import type { BudgetDefinition, Holding } from "../engine/types";
import {
  calculateAccountBalance, calculateAccountsWithBalances, calculateAvailableCash,
  calculateCategorySpending, calculateMonthlyChartData, calculateMonthlyExpenses,
  calculateMonthlyIncome, calculateMonthlySaved, calculateNetWorth, calculateSavingsRate,
  getMonthlyTransactions as engineGetMonthlyTransactions,
} from "../engine/transactionEngine";
import { analyzeAllBudgets, analyzeBudgetPace, calculateTotalBudgetLimit, calculateTotalBudgetSpent } from "../engine/budgetEngine";
import { analyzeAllGoals, countGoalsOnTrack } from "../engine/goalEngine";
import { analyzeAllHoldings, calculatePortfolioBeta, calculatePortfolioCost, calculatePortfolioPnL, calculatePortfolioPnLPct, calculatePortfolioValue, calculateSectorAllocation } from "../engine/investmentEngine";
import { calculateFinancialHealthScore } from "../engine/financialEngine";

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function getAccountBalance(state: AppState, accountId: string): number {
  const account = state.accounts.find((a) => a.id === accountId);
  if (!account) return 0;
  return calculateAccountBalance(account, state.transactions);
}

export function getAccountsWithBalances(state: AppState) {
  return calculateAccountsWithBalances(state.accounts, state.transactions);
}

export function getNetWorth(state: AppState): number {
  return calculateNetWorth(state.accounts, state.transactions);
}

export function getAvailableCash(state: AppState): number {
  return calculateAvailableCash(state.accounts, state.transactions);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function getMonthlyTransactions(state: AppState, monthISO?: string) {
  return engineGetMonthlyTransactions(state.transactions, monthISO);
}

export function getMonthlyIncome(state: AppState, monthISO?: string): number {
  return calculateMonthlyIncome(state.transactions, monthISO);
}

export function getMonthlyExpenses(state: AppState, monthISO?: string): number {
  return calculateMonthlyExpenses(state.transactions, monthISO);
}

export function getMonthlySaved(state: AppState, monthISO?: string): number {
  return calculateMonthlySaved(state.transactions, monthISO);
}

export function getSavingsRate(state: AppState, monthISO?: string): number {
  return calculateSavingsRate(state.transactions, monthISO);
}

export function getCategorySpending(state: AppState, monthISO?: string) {
  return calculateCategorySpending(state.transactions, monthISO);
}

export function getMonthlyChartData(state: AppState, months = 6) {
  return calculateMonthlyChartData(state.transactions, months);
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export function getBudgetSpent(state: AppState, budget: BudgetDefinition, monthISO?: string): number {
  return analyzeBudgetPace(budget, state.transactions, monthISO).spent;
}

export function getBudgetUtilization(state: AppState, budget: BudgetDefinition, monthISO?: string): number {
  return analyzeBudgetPace(budget, state.transactions, monthISO).utilizationPct;
}

export function getBudgetsWithSpend(state: AppState, monthISO?: string) {
  const analyzed = analyzeAllBudgets(state.budgets, state.transactions, monthISO);
  return analyzed.map((b) => ({
    ...b,
    pct: b.utilizationPct,
  }));
}

export function getTotalBudgetLimit(state: AppState): number {
  return calculateTotalBudgetLimit(state.budgets);
}

export function getTotalBudgetSpent(state: AppState, monthISO?: string): number {
  return calculateTotalBudgetSpent(state.budgets, state.transactions, monthISO);
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function getGoalProgress(goal: { current: number; target: number }): number {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function getGoalsOnTrack(state: AppState): number {
  return countGoalsOnTrack(state.goals);
}

export function getAnalyzedGoals(state: AppState) {
  return analyzeAllGoals(state.goals);
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export function getPortfolioValue(state: AppState): number {
  return calculatePortfolioValue(state.holdings);
}

export function getPortfolioCost(state: AppState): number {
  return calculatePortfolioCost(state.holdings);
}

export function getPortfolioPnL(state: AppState): number {
  return calculatePortfolioPnL(state.holdings);
}

export function getPortfolioPnLPct(state: AppState): number {
  return calculatePortfolioPnLPct(state.holdings);
}

export function getHoldingsWithMetrics(state: AppState) {
  const holdings = analyzeAllHoldings(state.holdings);
  return holdings.map((h) => ({
    ...h,
    pnlPct: h.pnlPct,
    weight: h.weightPct,
  }));
}

export function getSectorAllocation(state: AppState) {
  return calculateSectorAllocation(state.holdings);
}

export function getPortfolioBeta(state: AppState): number {
  return calculatePortfolioBeta(state.holdings);
}

// ─── Financial Health Score ────────────────────────────────────────────────────

export function getFinancialHealthScore(state: AppState): number {
  return calculateFinancialHealthScore(state.transactions, state.budgets, state.goals, state.holdings).score;
}
