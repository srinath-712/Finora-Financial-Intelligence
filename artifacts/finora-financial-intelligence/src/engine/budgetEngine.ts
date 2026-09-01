import type { BudgetDefinition, BudgetWithPace, Transaction } from "./types";
import { currentMonthISO } from "./transactionEngine";

export function analyzeBudgetPace(
  budget: BudgetDefinition,
  transactions: Transaction[],
  monthISO?: string
): BudgetWithPace {
  const month = monthISO ?? currentMonthISO();
  const now = new Date();

  // Determine current day and total days in target month
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, m, 0).getDate();
  const isCurrentMonth = month === currentMonthISO();
  const currentDay = isCurrentMonth ? Math.max(1, Math.min(now.getDate(), daysInMonth)) : daysInMonth;
  const timeElapsedPct = (currentDay / daysInMonth) * 100;

  // Spent in this category (debits only)
  const spent = transactions
    .filter((t) => t.date.startsWith(month) && t.type === "debit" && t.category === budget.category)
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = Math.max(0, budget.limit - spent);
  const utilizationPct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  const overspent = spent > budget.limit;

  // Projected spend at end of month based on daily velocity
  const dailyVelocity = spent / currentDay;
  const projectedMonthEndSpend = Math.round(dailyVelocity * daysInMonth);

  // Pace diff = % of budget used - % of month passed
  const paceDiffPct = utilizationPct - timeElapsedPct;
  const pacePct = Math.round(paceDiffPct);

  // Risk assessment
  let overspendingRisk: "low" | "medium" | "high" = "low";
  if (overspent || utilizationPct > 90 || paceDiffPct > 20) {
    overspendingRisk = "high";
  } else if (utilizationPct > 70 || paceDiffPct > 10) {
    overspendingRisk = "medium";
  }

  // Generate dynamic insight message
  let paceInsight = "Pace is optimal.";
  if (overspent) {
    paceInsight = `Exceeded limit by ₹${(spent - budget.limit).toLocaleString("en-IN")}.`;
  } else if (paceDiffPct > 5) {
    paceInsight = `You're spending ${Math.round(paceDiffPct)}% faster than your monthly pace.`;
  } else if (paceDiffPct < -10) {
    paceInsight = `Spending ${Math.abs(Math.round(paceDiffPct))}% under monthly pace — great control!`;
  }

  return {
    ...budget,
    spent,
    remaining,
    utilizationPct: Math.round(utilizationPct),
    overspent,
    pacePct,
    projectedMonthEndSpend,
    overspendingRisk,
    paceInsight,
  };
}

export function analyzeAllBudgets(
  budgets: BudgetDefinition[],
  transactions: Transaction[],
  monthISO?: string
): BudgetWithPace[] {
  return budgets.map((b) => analyzeBudgetPace(b, transactions, monthISO));
}

export function calculateTotalBudgetLimit(budgets: BudgetDefinition[]): number {
  return budgets.reduce((sum, b) => sum + b.limit, 0);
}

export function calculateTotalBudgetSpent(budgets: BudgetDefinition[], transactions: Transaction[], monthISO?: string): number {
  const analyzed = analyzeAllBudgets(budgets, transactions, monthISO);
  return analyzed.reduce((sum, b) => sum + b.spent, 0);
}
