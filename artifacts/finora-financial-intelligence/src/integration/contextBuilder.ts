import type { AppState } from "../store/context";
import type { UnifiedFinancialContext } from "./types";
import { calculateAvailableCash, calculateMonthlyExpenses, calculateMonthlyIncome, calculateMonthlySaved, calculateNetWorth, calculateSavingsRate } from "../engine/transactionEngine";
import { analyzeAllRecurring } from "../engine/recurringEngine";
import { calculatePortfolioBeta, calculatePortfolioCost, calculatePortfolioPnL, calculatePortfolioPnLPct, calculatePortfolioValue, calculateSectorAllocation } from "../engine/investmentEngine";

export function buildUnifiedContext(state: AppState): UnifiedFinancialContext {
  const netWorth = calculateNetWorth(state.accounts, state.transactions);
  const availableCash = calculateAvailableCash(state.accounts, state.transactions);
  const monthlyIncome = calculateMonthlyIncome(state.transactions);
  const monthlyExpenses = calculateMonthlyExpenses(state.transactions);
  const monthlySaved = calculateMonthlySaved(state.transactions);
  const savingsRate = calculateSavingsRate(state.transactions);

  // Analyze active recurring obligations for next 30 days
  const analyzedRecurring = analyzeAllRecurring(state.recurring);
  const activeRecurring = analyzedRecurring.filter((r) => r.status === "active");
  const upcoming30DaysRecurringCost = activeRecurring.reduce((sum, r) => sum + r.monthlyEquivalent, 0);

  // 3-month emergency buffer requirement based on monthly expenses
  const emergencyBufferRequirement = monthlyExpenses * 3;

  // Investment analytics
  const portfolioValue = calculatePortfolioValue(state.holdings);
  const portfolioCost = calculatePortfolioCost(state.holdings);
  const portfolioPnL = calculatePortfolioPnL(state.holdings);
  const portfolioPnLPct = calculatePortfolioPnLPct(state.holdings);
  const portfolioBeta = calculatePortfolioBeta(state.holdings);
  const sectorAllocations = calculateSectorAllocation(state.holdings);

  return {
    user: state.user,
    accounts: state.accounts,
    transactions: state.transactions,
    budgets: state.budgets,
    goals: state.goals,
    recurring: state.recurring,
    holdings: state.holdings,
    market: state.market,

    netWorth,
    availableCash,
    monthlyIncome,
    monthlyExpenses,
    monthlySaved,
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    upcoming30DaysRecurringCost,
    emergencyBufferRequirement,

    portfolioValue,
    portfolioCost,
    portfolioPnL,
    portfolioPnLPct: parseFloat(portfolioPnLPct.toFixed(1)),
    portfolioBeta: parseFloat(portfolioBeta.toFixed(2)),
    sectorAllocations,
  };
}
