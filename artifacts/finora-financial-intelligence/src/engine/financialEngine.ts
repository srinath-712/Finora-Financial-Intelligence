import type {
  Account, BudgetDefinition, FinancialHealthMetrics, Goal, Holding, Transaction,
} from "./types";

import {
  calculateAccountsWithBalances, calculateAvailableCash, calculateMonthlyExpenses,
  calculateMonthlyIncome, calculateMonthlySaved, calculateNetWorth, calculateSavingsRate,
} from "./transactionEngine";
import { analyzeAllBudgets, calculateTotalBudgetLimit, calculateTotalBudgetSpent } from "./budgetEngine";
import { countGoalsOnTrack } from "./goalEngine";
import { calculatePortfolioPnLPct, calculatePortfolioValue } from "./investmentEngine";

export function calculateFinancialHealthScore(
  transactions: Transaction[],
  budgets: BudgetDefinition[],
  goals: Goal[],
  holdings: Holding[]
): FinancialHealthMetrics {
  let score = 0;

  // 1. Savings rate (30 pts max)
  const sr = calculateSavingsRate(transactions);
  let savingsRateScore = 0;
  if (sr >= 40) savingsRateScore = 30;
  else if (sr >= 25) savingsRateScore = 20;
  else if (sr >= 10) savingsRateScore = 10;
  score += savingsRateScore;

  // 2. Emergency fund (20 pts max)
  const monthlyExpenses = calculateMonthlyExpenses(transactions);
  const emergencyGoal = goals.find((g) => g.name.toLowerCase().includes("emergency"));
  let emergencyFundScore = 0;
  if (emergencyGoal) {
    const monthsCovered = monthlyExpenses > 0 ? emergencyGoal.current / monthlyExpenses : 0;
    if (monthsCovered >= 6) emergencyFundScore = 20;
    else if (monthsCovered >= 3) emergencyFundScore = 12;
    else if (monthsCovered >= 1) emergencyFundScore = 5;
  }
  score += emergencyFundScore;

  // 3. Budget adherence (20 pts max)
  const analyzedBudgets = analyzeAllBudgets(budgets, transactions);
  const overBudgetCount = analyzedBudgets.filter((b) => b.overspent).length;
  let budgetAdherenceScore = 0;
  if (overBudgetCount === 0) budgetAdherenceScore = 20;
  else if (overBudgetCount === 1) budgetAdherenceScore = 12;
  else budgetAdherenceScore = 4;
  score += budgetAdherenceScore;

  // 4. Portfolio return (15 pts max)
  const pnlPct = calculatePortfolioPnLPct(holdings);
  let portfolioReturnScore = 0;
  if (pnlPct >= 15) portfolioReturnScore = 15;
  else if (pnlPct >= 8) portfolioReturnScore = 10;
  else if (pnlPct >= 0) portfolioReturnScore = 5;
  score += portfolioReturnScore;

  // 5. Goals on track (15 pts max)
  const onTrackCount = countGoalsOnTrack(goals);
  let goalsProgressScore = 0;
  if (onTrackCount >= goals.length) goalsProgressScore = 15;
  else if (onTrackCount >= Math.ceil(goals.length / 2)) goalsProgressScore = 10;
  else goalsProgressScore = 4;
  score += goalsProgressScore;

  const totalScore = Math.min(100, Math.max(0, score));

  let summaryText = "Your financial health is strong.";
  if (totalScore < 50) {
    summaryText = "Needs attention: focus on building cash reserves and curbing overspending.";
  } else if (totalScore < 75) {
    summaryText = "Solid foundation with opportunities to optimize budget limits and investments.";
  }

  return {
    score: totalScore,
    savingsRateScore,
    emergencyFundScore,
    budgetAdherenceScore,
    portfolioReturnScore,
    goalsProgressScore,
    summaryText,
  };
}

export function getFullFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  budgets: BudgetDefinition[],
  goals: Goal[],
  holdings: Holding[]
) {
  const netWorth = calculateNetWorth(accounts, transactions);
  const availableCash = calculateAvailableCash(accounts, transactions);
  const monthlyIncome = calculateMonthlyIncome(transactions);
  const monthlyExpenses = calculateMonthlyExpenses(transactions);
  const monthlySaved = calculateMonthlySaved(transactions);
  const savingsRate = calculateSavingsRate(transactions);
  const totalBudgetLimit = calculateTotalBudgetLimit(budgets);
  const totalBudgetSpent = calculateTotalBudgetSpent(budgets, transactions);
  const portfolioValue = calculatePortfolioValue(holdings);
  const portfolioReturnPct = calculatePortfolioPnLPct(holdings);
  const healthMetrics = calculateFinancialHealthScore(transactions, budgets, goals, holdings);

  return {
    netWorth,
    availableCash,
    monthlyIncome,
    monthlyExpenses,
    monthlySaved,
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    totalBudgetLimit,
    totalBudgetSpent,
    portfolioValue,
    portfolioReturnPct: parseFloat(portfolioReturnPct.toFixed(1)),
    healthScore: healthMetrics.score,
    healthSummary: healthMetrics.summaryText,
  };
}
