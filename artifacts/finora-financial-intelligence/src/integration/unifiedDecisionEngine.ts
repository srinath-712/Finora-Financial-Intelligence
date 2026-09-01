import type { AppState } from "../store/context";
import type { UnifiedInvestmentDecision } from "./types";
import { calculateAffordability } from "./affordabilityEngine";
import { calculatePortfolioImpact } from "./portfolioImpactEngine";
import { analyzeStockWithQuantAgents } from "../agents";

export function calculateUnifiedInvestmentDecision(
  stockSymbol: string,
  purchaseAmount: number,
  state: AppState
): UnifiedInvestmentDecision {
  const symbol = stockSymbol.toUpperCase().trim();

  // 1. QuantAgents Market & Stock Intelligence
  const quantAgentsDecision = analyzeStockWithQuantAgents(symbol, state);

  // 2. Personal Affordability Analysis
  const affordability = calculateAffordability(symbol, purchaseAmount, state);

  // 3. Portfolio Impact Analysis
  const portfolioImpact = calculatePortfolioImpact(symbol, purchaseAmount, state);

  // Synthesize Personal Stance
  let personalStance: "RECOMMENDED" | "SUITABLE_WITH_CAUTION" | "NOT_RECOMMENDED" | "UNAFFORDABLE" = "RECOMMENDED";
  let keyDivergenceReason: string | undefined = undefined;

  if (!affordability.affordable) {
    personalStance = "UNAFFORDABLE";
    keyDivergenceReason = `QuantAgents rate this stock ${quantAgentsDecision.stance} (${quantAgentsDecision.consensusScore}/10), but it is UNAFFORDABLE with your current liquid cash.`;
  } else if (!affordability.leavesEmergencyBufferIntact) {
    personalStance = "NOT_RECOMMENDED";
    keyDivergenceReason = `QuantAgents rate this stock ${quantAgentsDecision.stance} (${quantAgentsDecision.consensusScore}/10), but purchasing ₹${purchaseAmount.toLocaleString("en-IN")} reduces your cash reserves below your 3-month emergency fund buffer.`;
  } else if (portfolioImpact.newSectorWeightPct > 30 || quantAgentsDecision.portfolioPenaltyApplied) {
    personalStance = "SUITABLE_WITH_CAUTION";
    keyDivergenceReason = `QuantAgents rate this stock ${quantAgentsDecision.stance}, but purchasing it increases your sector concentration to ${portfolioImpact.newSectorWeightPct.toFixed(1)}%.`;
  } else if (quantAgentsDecision.stance === "SELL" || quantAgentsDecision.stance === "REDUCE") {
    personalStance = "NOT_RECOMMENDED";
    keyDivergenceReason = `While affordable from cash, QuantAgents recommend ${quantAgentsDecision.stance} due to weak technical and fundamental indicators.`;
  }

  // Generate personalized advice
  let personalizedAdvice = "";
  if (personalStance === "RECOMMENDED") {
    personalizedAdvice = `₹${purchaseAmount.toLocaleString("en-IN")} of ${symbol} is fully affordable and aligns with your portfolio shape. QuantAgents assign a consensus score of ${quantAgentsDecision.consensusScore}/10 (${quantAgentsDecision.stance}).`;
  } else if (personalStance === "SUITABLE_WITH_CAUTION") {
    personalizedAdvice = `${affordability.explanation} ${portfolioImpact.explanation}`;
  } else {
    personalizedAdvice = keyDivergenceReason ?? affordability.explanation;
  }

  return {
    stockSymbol: symbol,
    purchaseAmount,
    quantAgentsStance: quantAgentsDecision.stance,
    personalStance,
    quantAgentsScore: quantAgentsDecision.consensusScore,
    affordability,
    portfolioImpact,
    quantAgentsDecision,
    personalizedAdvice,
    keyDivergenceReason,
  };
}
