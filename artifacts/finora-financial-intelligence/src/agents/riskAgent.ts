import type { AgentOutput, AnalysisContext } from "./types";
import { calculatePortfolioBeta, calculatePortfolioRiskIndicators, calculatePortfolioValue } from "../engine/investmentEngine";

export function evaluatePortfolioRisk(ctx: AnalysisContext): AgentOutput {
  const { symbol, stockDetail, holdings } = ctx;

  const totalValue = calculatePortfolioValue(holdings);
  const beta = calculatePortfolioBeta(holdings);
  const riskIndicators = calculatePortfolioRiskIndicators(holdings);

  // Check user's current holding in this target stock
  const existingHolding = holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase());
  const existingHoldingValue = existingHolding ? existingHolding.shares * existingHolding.currentPrice : 0;
  const existingWeightPct = totalValue > 0 ? (existingHoldingValue / totalValue) * 100 : 0;

  // Check sector weight in portfolio
  const sectorHoldings = holdings.filter((h) => h.sector.toLowerCase() === stockDetail.riskScore.toLowerCase() || h.sector === existingHolding?.sector);
  const sectorValue = sectorHoldings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const sectorWeightPct = totalValue > 0 ? (sectorValue / totalValue) * 100 : 0;

  // High risk score if sector weight is > 30% or single holding weight > 15%
  let score = 7.5; // Base safe score
  let stance: "Bullish" | "Neutral" | "Bearish" = "Bullish";

  if (existingWeightPct > 15 || sectorWeightPct > 30) {
    score = 4.5;
    stance = "Bearish";
  } else if (existingWeightPct > 10 || sectorWeightPct > 20) {
    score = 6.0;
    stance = "Neutral";
  }

  const confidencePct = 85;

  const reasoning = existingHolding
    ? `You already hold ${existingHolding.shares} shares of ${symbol} (${existingWeightPct.toFixed(1)}% of your portfolio). Sector exposure is ${sectorWeightPct.toFixed(1)}%.`
    : `New position for your portfolio. Current portfolio beta is ${beta.toFixed(2)} with ${holdings.length} total positions.`;

  return {
    agentName: "Risk",
    score: parseFloat(score.toFixed(1)),
    stance,
    confidencePct,
    reasoning,
    keyMetrics: {
      "Portfolio Beta": beta.toFixed(2),
      "Target Holding Weight": `${existingWeightPct.toFixed(1)}%`,
      "Target Sector Weight": `${sectorWeightPct.toFixed(1)}%`,
      "Concentration Risk": riskIndicators.concentrationRisk,
    },
  };
}
