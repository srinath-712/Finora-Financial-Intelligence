import type { AppState } from "../store/context";
import { buildUnifiedContext } from "./contextBuilder";
import { calculateAffordability } from "./affordabilityEngine";
import { calculatePortfolioImpact } from "./portfolioImpactEngine";
import { calculateUnifiedInvestmentDecision } from "./unifiedDecisionEngine";
import { calculatePortfolioBeta, calculatePortfolioRiskIndicators, calculatePortfolioValue } from "../engine/investmentEngine";
import { analyzeAllBudgets } from "../engine/budgetEngine";

const money = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function answerCanIBuy(stockSymbol: string, amount: number, state: AppState) {
  return calculateUnifiedInvestmentDecision(stockSymbol, amount, state);
}

export function getHighestRiskHolding(state: AppState) {
  const ctx = buildUnifiedContext(state);
  const holdings = ctx.holdings;
  if (holdings.length === 0) return null;

  const total = ctx.portfolioValue;
  const sorted = [...holdings].map((h) => {
    const val = h.shares * h.currentPrice;
    const weight = total > 0 ? (val / total) * 100 : 0;
    return { ...h, val, weight };
  }).sort((a, b) => b.weight - a.weight);

  const top = sorted[0];
  const sectorAlloc = ctx.sectorAllocations.find((s) => s.name === top.sector);

  return {
    topHolding: top,
    weightPct: parseFloat(top.weight.toFixed(1)),
    sector: top.sector,
    sectorWeightPct: sectorAlloc?.value ?? 0,
    explanation: `${top.symbol} (${top.name}) is your highest risk contribution, representing ${top.weight.toFixed(1)}% of your portfolio (${money(top.val)}). Its sector (${top.sector}) makes up ${sectorAlloc?.value ?? 0}% of total investments.`,
  };
}

export function getDeployableSurplus(state: AppState) {
  const ctx = buildUnifiedContext(state);
  const buffer = ctx.emergencyBufferRequirement;
  const recurring = ctx.upcoming30DaysRecurringCost;

  const safeCash = Math.max(0, ctx.availableCash - buffer - recurring);

  return {
    availableCash: ctx.availableCash,
    emergencyBuffer: buffer,
    upcomingRecurring: recurring,
    deployableSurplus: safeCash,
    monthlySurplus: ctx.monthlySaved,
    advice: safeCash > 0
      ? `You can safely invest up to ${money(safeCash)} this month while keeping your 3-month emergency buffer (${money(buffer)}) and upcoming bills (${money(recurring)}) 100% protected.`
      : `Your liquid cash (${money(ctx.availableCash)}) is fully allocated to your 3-month emergency buffer (${money(buffer)}) and upcoming bills (${money(recurring)}). Focus on accumulating cash before adding new capital.`,
  };
}

export function simulateMarketShock(niftyDropPct: number, state: AppState) {
  const ctx = buildUnifiedContext(state);
  const beta = ctx.portfolioBeta;
  const dropRatio = Math.abs(niftyDropPct) / 100;
  const estimatedPortfolioDropPct = parseFloat((dropRatio * beta * 100).toFixed(1));
  const estimatedLossAmount = Math.round((ctx.portfolioValue * estimatedPortfolioDropPct) / 100);
  const newValue = Math.max(0, ctx.portfolioValue - estimatedLossAmount);

  return {
    niftyDropPct: Math.abs(niftyDropPct),
    portfolioBeta: beta,
    estimatedPortfolioDropPct,
    estimatedLossAmount,
    currentPortfolioValue: ctx.portfolioValue,
    newValue,
    explanation: `If NIFTY falls ${Math.abs(niftyDropPct)}%, your portfolio (beta ${beta.toFixed(2)}) is estimated to adjust by -${estimatedPortfolioDropPct}%, equivalent to an estimated drawdown of -${money(estimatedLossAmount)} (portfolio value: ${money(newValue)}). Your liquid cash of ${money(ctx.availableCash)} covers ${ctx.monthlyExpenses > 0 ? (ctx.availableCash / ctx.monthlyExpenses).toFixed(1) : 0} months of expenses so you are not forced to liquidate positions.`,
  };
}

export function auditSavingsGoalDeficit(state: AppState) {
  const ctx = buildUnifiedContext(state);
  const budgets = analyzeAllBudgets(state.budgets, state.transactions);
  const overspent = budgets.filter((b) => b.overspent);
  const overspendTotal = overspent.reduce((s, b) => s + (b.spent - b.limit), 0);

  return {
    monthlyIncome: ctx.monthlyIncome,
    monthlyExpenses: ctx.monthlyExpenses,
    monthlySaved: ctx.monthlySaved,
    savingsRate: ctx.savingsRate,
    targetSavingsRate: ctx.user.savingsTargetPct,
    overspentCategories: overspent.map((b) => ({ name: b.name, overspend: b.spent - b.limit })),
    overspendTotal,
    explanation: `Your current savings rate is ${ctx.savingsRate}% vs your target of ${ctx.user.savingsTargetPct}%. ${overspent.length > 0 ? `Budget overruns in ${overspent.map((b) => b.name).join(", ")} total -${money(overspendTotal)} this month.` : "Your monthly expenses are taking up a large portion of cashflow."}`,
  };
}
