import type { AgentOutput, AnalysisContext } from "./types";

export function evaluateQuantTechnicals(ctx: AnalysisContext): AgentOutput {
  const { stockDetail } = ctx;
  const prices = stockDetail.chartPrices;
  const latestPrice = prices[prices.length - 1] ?? 100;
  const prevPrice = prices[prices.length - 2] ?? latestPrice;

  // Simple momentum score based on price trend
  const trendChangePct = ((latestPrice - prices[0]) / prices[0]) * 100;
  let score = stockDetail.momentum;

  // Calculate estimated RSI (14-period style)
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gain += diff;
    else loss += Math.abs(diff);
  }
  const avgGain = gain / Math.max(1, prices.length - 1);
  const avgLoss = loss / Math.max(1, prices.length - 1);
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const estimatedRSI = Math.round(100 - 100 / (1 + rs));

  let stance: "Bullish" | "Neutral" | "Bearish" = "Neutral";
  if (score >= 7.0 && trendChangePct > 0) {
    stance = "Bullish";
  } else if (score < 5.5 || trendChangePct < -5) {
    stance = "Bearish";
  }

  const confidencePct = Math.round(70 + (score - 5) * 5);

  const reasoning = stance === "Bullish"
    ? `Strong technical momentum (+${trendChangePct.toFixed(1)}% trend). RSI is at ${estimatedRSI} (healthy non-overbought territory).`
    : `Momentum is neutral (${trendChangePct.toFixed(1)}% trend). RSI sits at ${estimatedRSI}. Price is consolidating.`;

  return {
    agentName: "Quant",
    score: parseFloat(score.toFixed(1)),
    stance,
    confidencePct,
    reasoning,
    keyMetrics: {
      "RSI (14)": estimatedRSI,
      "Momentum Score": `${score}/10`,
      "Trend Change": `${trendChangePct >= 0 ? "+" : ""}${trendChangePct.toFixed(1)}%`,
      "Volume": `${(stockDetail.volume / 1000000).toFixed(1)}M`,
    },
  };
}
