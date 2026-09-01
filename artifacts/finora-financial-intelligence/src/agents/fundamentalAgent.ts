import type { AgentOutput, AnalysisContext } from "./types";

export function evaluateFundamentals(ctx: AnalysisContext): AgentOutput {
  const { stockDetail } = ctx;
  const { pe, pb, roe, debtEquity, fairValue, fundamentals } = stockDetail;

  let score = fundamentals;
  let stance: "Bullish" | "Neutral" | "Bearish" = "Neutral";
  const confidencePct = Math.round(75 + (fundamentals - 5) * 4);

  // Evaluate valuation vs fair value
  const currentPrice = stockDetail.chartPrices[stockDetail.chartPrices.length - 1] ?? fairValue;
  const valuationGapPct = ((fairValue - currentPrice) / currentPrice) * 100;

  if (score >= 7.5 || valuationGapPct >= 10) {
    stance = "Bullish";
  } else if (score <= 5.0 || valuationGapPct <= -15) {
    stance = "Bearish";
  }

  const reasoning = valuationGapPct > 0
    ? `ROE of ${roe}% with low D/E of ${debtEquity}. Stock trades at a ${valuationGapPct.toFixed(1)}% discount to fair value (₹${fairValue}).`
    : `P/E of ${pe} and P/B of ${pb}. Trading near or above fair value (₹${fairValue}). ROE remains healthy at ${roe}%.`;

  return {
    agentName: "Fundamental",
    score: parseFloat(score.toFixed(1)),
    stance,
    confidencePct,
    reasoning,
    keyMetrics: {
      "P/E": pe,
      "P/B": pb,
      "ROE %": `${roe}%`,
      "D/E": debtEquity,
      "Fair Value": `₹${fairValue}`,
    },
  };
}
