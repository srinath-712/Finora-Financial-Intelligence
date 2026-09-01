import type { Holding, HoldingMetrics } from "./types";

export function calculateHoldingMetrics(holding: Holding, totalPortfolioValue: number): HoldingMetrics {
  const value = holding.shares * holding.currentPrice;
  const cost = holding.shares * holding.avgPrice;
  const pnl = value - cost;
  const pnlPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
  const weightPct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;

  return {
    ...holding,
    value,
    cost,
    pnl,
    pnlPct,
    weightPct,
  };
}

export function calculatePortfolioValue(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
}

export function calculatePortfolioCost(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
}

export function calculatePortfolioPnL(holdings: Holding[]): number {
  return calculatePortfolioValue(holdings) - calculatePortfolioCost(holdings);
}

export function calculatePortfolioPnLPct(holdings: Holding[]): number {
  const cost = calculatePortfolioCost(holdings);
  if (cost === 0) return 0;
  return (calculatePortfolioPnL(holdings) / cost) * 100;
}

export function analyzeAllHoldings(holdings: Holding[]): HoldingMetrics[] {
  const total = calculatePortfolioValue(holdings);
  return holdings.map((h) => calculateHoldingMetrics(h, total));
}

export function calculateSectorAllocation(holdings: Holding[]) {
  const total = calculatePortfolioValue(holdings);
  const map: Record<string, number> = {};

  holdings.forEach((h) => {
    const val = h.shares * h.currentPrice;
    map[h.sector] = (map[h.sector] ?? 0) + val;
  });

  const colors: Record<string, string> = {
    Financials: "#167b73",
    IT: "#ed9d3d",
    Energy: "#5278c5",
    Telecom: "#ca6471",
    Consumer: "#8d75b9",
    Industrials: "#55a889",
    Auto: "#e8a272",
    Healthcare: "#6c8ebf",
    FMCG: "#a88e64",
    Others: "#9a8f7b",
  };

  return Object.entries(map).map(([name, value]) => ({
    name,
    value: total > 0 ? Math.round((value / total) * 100) : 0,
    color: colors[name] ?? "#9a8f7b",
  }));
}

export function calculatePortfolioBeta(holdings: Holding[]): number {
  const sectorBeta: Record<string, number> = {
    Financials: 1.0,
    IT: 0.85,
    Energy: 0.82,
    Telecom: 0.78,
    Consumer: 0.72,
    Industrials: 0.95,
    Auto: 1.15,
    Healthcare: 0.65,
    FMCG: 0.60,
    Others: 0.9,
  };

  const total = calculatePortfolioValue(holdings);
  if (total === 0) return 1.0;

  return holdings.reduce((sum, h) => {
    const weight = (h.shares * h.currentPrice) / total;
    const beta = sectorBeta[h.sector] ?? 0.9;
    return sum + weight * beta;
  }, 0);
}

/** Calculates portfolio concentration indicators (Top position weight & Herfindahl Index) */
export function calculatePortfolioRiskIndicators(holdings: Holding[]) {
  const metrics = analyzeAllHoldings(holdings);
  const beta = calculatePortfolioBeta(holdings);
  const estimatedVolatilityPct = parseFloat((beta * 15.6).toFixed(1)); // NIFTY ~15.6% vol

  const sorted = [...metrics].sort((a, b) => b.weightPct - a.weightPct);
  const top1WeightPct = sorted[0]?.weightPct ?? 0;
  const top3WeightPct = sorted.slice(0, 3).reduce((s, h) => s + h.weightPct, 0);

  // Herfindahl-Hirschman Index (HHI) for market concentration
  const hhi = metrics.reduce((sum, h) => sum + Math.pow(h.weightPct, 2), 0);

  let concentrationRisk: "low" | "moderate" | "high" = "low";
  if (top1WeightPct > 35 || hhi > 2500) concentrationRisk = "high";
  else if (top1WeightPct > 20 || hhi > 1500) concentrationRisk = "moderate";

  return {
    beta: parseFloat(beta.toFixed(2)),
    estimatedVolatilityPct,
    top1WeightPct: parseFloat(top1WeightPct.toFixed(1)),
    top3WeightPct: parseFloat(top3WeightPct.toFixed(1)),
    hhi: Math.round(hhi),
    concentrationRisk,
    largestPositionSymbol: sorted[0]?.symbol ?? "N/A",
  };
}
