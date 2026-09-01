import type { AppState } from "./context";
import {
  answerCanIBuy, auditSavingsGoalDeficit, getDeployableSurplus,
  getHighestRiskHolding, simulateMarketShock,
} from "../integration/unifiedAITools";
import { AIFinanceTools } from "../engine/aiTools";

export interface AIInsight {
  label: string;
  value: string;
  sub?: string;
}

export interface AIAction {
  label: string;
  path: string;
}

export interface AIResponse {
  text: string;
  intent: string;
  insights?: AIInsight[];
  actions?: AIAction[];
}

const money = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

function detectIntent(message: string): string {
  const q = message.toLowerCase();
  if (q.includes("can i buy") || q.includes("afford") || q.includes("buy")) return "can_i_buy";
  if (q.includes("highest risk") || q.includes("contributes most") || q.includes("risky holding")) return "highest_risk";
  if (q.includes("how much can i invest") || q.includes("deploy") || q.includes("invest this month")) return "deployable_surplus";
  if (q.includes("falls") || q.includes("crash") || q.includes("nifty") || q.includes("drop")) return "market_shock";
  if (q.includes("why am i not reaching") || q.includes("savings goal") || q.includes("deficit")) return "savings_audit";
  if (q.includes("portfolio") || q.includes("invest") || q.includes("holding")) return "portfolio";
  if (q.includes("spend") || q.includes("budget")) return "spending";
  return "general";
}

export function getAIResponse(message: string, state: AppState): AIResponse {
  const intent = detectIntent(message);

  switch (intent) {
    case "can_i_buy": {
      const amtMatch = message.match(/[₹]?\s*([\d,]+)/);
      const amount = amtMatch ? parseInt(amtMatch[1].replace(/,/g, ""), 10) : 25000;
      const symbolMatch = message.match(/reliance|tcs|infy|hdfcbank|icicibank|tata|titan|sbin|bhartiartl|lt/i);
      const symbol = symbolMatch ? symbolMatch[0].toUpperCase() : "RELIANCE";

      const decision = answerCanIBuy(symbol, amount, state);
      return {
        intent,
        text: decision.personalizedAdvice,
        insights: [
          { label: "Personal Stance", value: decision.personalStance.replace("_", " ") },
          { label: "QuantAgents Score", value: `${decision.quantAgentsScore}/10` },
          { label: "Available Cash", value: money(decision.affordability.availableCash) },
          { label: "Post-Purchase Cash", value: money(decision.affordability.remainingCash), sub: decision.affordability.leavesEmergencyBufferIntact ? "Emergency buffer safe" : "Buffer compromised" },
        ],
        actions: [{ label: "View stock analysis", path: "/stock-analysis" }, { label: "View accounts", path: "/accounts" }],
      };
    }

    case "highest_risk": {
      const riskInfo = getHighestRiskHolding(state);
      if (!riskInfo) {
        return { intent, text: "You currently have no equity holdings." };
      }
      return {
        intent,
        text: riskInfo.explanation,
        insights: [
          { label: "Highest Risk Symbol", value: riskInfo.topHolding.symbol },
          { label: "Portfolio Weight", value: `${riskInfo.weightPct}%` },
          { label: "Sector Exposure", value: `${riskInfo.sector} (${riskInfo.sectorWeightPct}%)` },
        ],
        actions: [{ label: "View risk room", path: "/risk" }, { label: "View portfolio", path: "/portfolio" }],
      };
    }

    case "deployable_surplus": {
      const surplus = getDeployableSurplus(state);
      return {
        intent,
        text: surplus.advice,
        insights: [
          { label: "Available Cash", value: money(surplus.availableCash) },
          { label: "3M Emergency Buffer", value: money(surplus.emergencyBuffer) },
          { label: "30D Bills", value: money(surplus.upcomingRecurring) },
          { label: "Safe to Invest", value: money(surplus.deployableSurplus) },
        ],
        actions: [{ label: "View goals", path: "/goals" }, { label: "View accounts", path: "/accounts" }],
      };
    }

    case "market_shock": {
      const shockMatch = message.match(/(\d+)\s*%/);
      const dropPct = shockMatch ? parseInt(shockMatch[1], 10) : 20;
      const shock = simulateMarketShock(dropPct, state);

      return {
        intent,
        text: shock.explanation,
        insights: [
          { label: "NIFTY Shock", value: `-${shock.niftyDropPct}%` },
          { label: "Estimated Loss", value: `-${money(shock.estimatedLossAmount)}` },
          { label: "Simulated Value", value: money(shock.newValue) },
        ],
        actions: [{ label: "Open scenario simulator", path: "/simulator" }],
      };
    }

    case "savings_audit": {
      const audit = auditSavingsGoalDeficit(state);
      return {
        intent,
        text: audit.explanation,
        insights: [
          { label: "Savings Rate", value: `${audit.savingsRate}%` },
          { label: "Target Rate", value: `${audit.targetSavingsRate}%` },
          { label: "Overspent Total", value: money(audit.overspendTotal) },
        ],
        actions: [{ label: "View budgets", path: "/budgets" }, { label: "View reports", path: "/reports" }],
      };
    }

    case "portfolio": {
      const port = AIFinanceTools.getPortfolio(state);
      return {
        intent,
        text: `Your portfolio is currently valued at ${money(port.totalValue)} with a total return of ${pct(port.totalPnLPct)}. Portfolio beta is ${port.risk.beta.toFixed(2)} with ${port.risk.concentrationRisk} concentration risk.`,
        insights: [
          { label: "Portfolio Value", value: money(port.totalValue) },
          { label: "Total Return", value: pct(port.totalPnLPct) },
          { label: "Portfolio Beta", value: `${port.risk.beta}` },
        ],
        actions: [{ label: "View portfolio", path: "/portfolio" }],
      };
    }

    case "spending": {
      const spendingInfo = AIFinanceTools.getSpendingInsights(state);
      return {
        intent,
        text: `This month's expenses total ${money(spendingInfo.totalSpent)}. ${spendingInfo.overspentCategories.length > 0 ? `${spendingInfo.overspentCategories.map((b) => b.name).join(", ")} exceeded budget.` : "All budgets are within limits."}`,
        insights: [
          { label: "Total Spent", value: money(spendingInfo.totalSpent) },
        ],
        actions: [{ label: "View budgets", path: "/budgets" }],
      };
    }

    default: {
      return {
        intent: "general",
        text: "I unify your personal finances with real-time market intelligence. Try asking me: 'Can I buy ₹25,000 of Reliance?', 'Which holding contributes most to my portfolio risk?', 'How much can I invest this month?', or 'What happens to my portfolio if NIFTY falls 20%?'",
        actions: [{ label: "View overview", path: "/overview" }],
      };
    }
  }
}
