import type { AppState } from "../store/context";
import type { AffordabilityResult } from "./types";
import { buildUnifiedContext } from "./contextBuilder";

export function calculateAffordability(
  stockSymbol: string,
  purchaseAmount: number,
  state: AppState
): AffordabilityResult {
  const ctx = buildUnifiedContext(state);
  const symbol = stockSymbol.toUpperCase().trim();

  const affordable = ctx.availableCash >= purchaseAmount;
  const remainingCash = ctx.availableCash - purchaseAmount;

  // Deduct upcoming 30 days recurring bills from remaining cash
  const cashAfterBills = remainingCash - ctx.upcoming30DaysRecurringCost;
  const emergencyBufferRequired = ctx.emergencyBufferRequirement;
  const emergencyBufferLeft = cashAfterBills;
  const leavesEmergencyBufferIntact = emergencyBufferLeft >= emergencyBufferRequired;

  // Evaluate impact on active goal contributions
  const goalImpacts = ctx.goals.map((g) => ({
    goalName: g.name,
    monthlyContribution: g.monthlyContribution,
    impacted: cashAfterBills < g.monthlyContribution * 2,
  }));

  let explanation = "";
  if (!affordable) {
    explanation = `₹${purchaseAmount.toLocaleString("en-IN")} exceeds your available liquid cash (₹${ctx.availableCash.toLocaleString("en-IN")}) by ₹${(purchaseAmount - ctx.availableCash).toLocaleString("en-IN")}.`;
  } else if (!leavesEmergencyBufferIntact) {
    explanation = `While you have ₹${ctx.availableCash.toLocaleString("en-IN")} cash, buying ₹${purchaseAmount.toLocaleString("en-IN")} of ${symbol} reduces your buffer to ₹${Math.max(0, emergencyBufferLeft).toLocaleString("en-IN")}, which falls below your 3-month emergency fund requirement (₹${emergencyBufferRequired.toLocaleString("en-IN")}).`;
  } else {
    explanation = `₹${purchaseAmount.toLocaleString("en-IN")} is completely affordable. You will retain ₹${remainingCash.toLocaleString("en-IN")} in cash, leaving your 3-month emergency fund (₹${emergencyBufferRequired.toLocaleString("en-IN")}) and upcoming bills (₹${ctx.upcoming30DaysRecurringCost.toLocaleString("en-IN")}) fully covered.`;
  }

  return {
    stockSymbol: symbol,
    purchaseAmount,
    affordable,
    availableCash: ctx.availableCash,
    remainingCash,
    upcomingRecurringCommitments: ctx.upcoming30DaysRecurringCost,
    emergencyBufferRequired,
    emergencyBufferLeft,
    leavesEmergencyBufferIntact,
    goalImpacts,
    explanation,
  };
}
