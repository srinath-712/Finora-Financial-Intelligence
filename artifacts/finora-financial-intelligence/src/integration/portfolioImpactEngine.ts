import type { AppState } from "../store/context";
import type { PortfolioImpactResult } from "./types";
import { STOCK_DETAILS } from "../store/data";
import { buildUnifiedContext } from "./contextBuilder";
import { calculatePortfolioBeta, calculatePortfolioRiskIndicators } from "../engine/investmentEngine";

export function calculatePortfolioImpact(
  stockSymbol: string,
  purchaseAmount: number,
  state: AppState
): PortfolioImpactResult {
  const ctx = buildUnifiedContext(state);
  const symbol = stockSymbol.toUpperCase().trim();
  const detail = STOCK_DETAILS[symbol] ?? STOCK_DETAILS["RELIANCE"];

  const currentPortfolioValue = ctx.portfolioValue;
  const newPortfolioValue = currentPortfolioValue + purchaseAmount;

  // Determine sector of target stock
  const existingTargetHolding = ctx.holdings.find((h) => h.symbol.toUpperCase() === symbol);
  const sector = existingTargetHolding?.sector ?? detail?.riskScore ?? "Others";

  // Current sector weight
  const currentSectorVal = ctx.holdings
    .filter((h) => h.sector.toLowerCase() === sector.toLowerCase())
    .reduce((s, h) => s + h.shares * h.currentPrice, 0);

  const currentSectorWeightPct = currentPortfolioValue > 0 ? (currentSectorVal / currentPortfolioValue) * 100 : 0;
  const newSectorVal = currentSectorVal + purchaseAmount;
  const newSectorWeightPct = newPortfolioValue > 0 ? (newSectorVal / newPortfolioValue) * 100 : 0;
  const sectorWeightChangePct = newSectorWeightPct - currentSectorWeightPct;

  // Simulated holdings with new purchase
  const price = existingTargetHolding?.currentPrice ?? detail?.fairValue ?? 1000;
  const addedShares = Math.max(1, Math.round(purchaseAmount / price));

  const simulatedHoldings = [...ctx.holdings];
  const idx = simulatedHoldings.findIndex((h) => h.symbol.toUpperCase() === symbol);
  if (idx !== -1) {
    simulatedHoldings[idx] = {
      ...simulatedHoldings[idx],
      shares: simulatedHoldings[idx].shares + addedShares,
    };
  } else {
    simulatedHoldings.push({
      id: `sim_${Date.now()}`,
      symbol,
      name: detail?.symbol ?? symbol,
      shares: addedShares,
      avgPrice: price,
      currentPrice: price,
      sector,
    });
  }

  const currentRisk = calculatePortfolioRiskIndicators(ctx.holdings);
  const newRisk = calculatePortfolioRiskIndicators(simulatedHoldings);

  const currentBeta = calculatePortfolioBeta(ctx.holdings);
  const newBeta = calculatePortfolioBeta(simulatedHoldings);
  const betaChange = newBeta - currentBeta;

  let explanation = "";
  if (newSectorWeightPct > 30) {
    explanation = `Purchasing ₹${purchaseAmount.toLocaleString("en-IN")} of ${symbol} increases your ${sector} sector concentration to ${newSectorWeightPct.toFixed(1)}% (above the 30% threshold).`;
  } else {
    explanation = `Purchasing ₹${purchaseAmount.toLocaleString("en-IN")} of ${symbol} increases ${sector} exposure by +${sectorWeightChangePct.toFixed(1)}% to ${newSectorWeightPct.toFixed(1)}%. Beta shifts slightly from ${currentBeta.toFixed(2)} to ${newBeta.toFixed(2)}.`;
  }

  return {
    stockSymbol: symbol,
    purchaseAmount,
    currentPortfolioValue,
    newPortfolioValue,
    currentSectorWeightPct: parseFloat(currentSectorWeightPct.toFixed(1)),
    newSectorWeightPct: parseFloat(newSectorWeightPct.toFixed(1)),
    sectorWeightChangePct: parseFloat(sectorWeightChangePct.toFixed(1)),
    currentConcentrationHHI: currentRisk.hhi,
    newConcentrationHHI: newRisk.hhi,
    currentBeta: parseFloat(currentBeta.toFixed(2)),
    newBeta: parseFloat(newBeta.toFixed(2)),
    betaChange: parseFloat(betaChange.toFixed(2)),
    riskLevelBefore: currentRisk.concentrationRisk,
    riskLevelAfter: newRisk.concentrationRisk,
    explanation,
  };
}
