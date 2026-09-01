import type { AgentOutput, AnalysisContext } from "./types";

export function evaluateMarket(ctx: AnalysisContext): AgentOutput {
  const { market } = ctx;
  const { nifty50, bankNifty, fiiFLow, diiFlow, advances, declines } = market;

  const breadthRatio = advances / Math.max(1, declines);
  const isNetBuying = fiiFLow > 0 || diiFlow > 0;

  let score = 6.5;
  if (nifty50.change > 0) score += 0.8;
  if (breadthRatio > 1.2) score += 1.0;
  if (fiiFLow > 0) score += 0.7;

  score = Math.min(10, Math.max(1, score));

  let stance: "Bullish" | "Neutral" | "Bearish" = "Neutral";
  if (score >= 7.0) stance = "Bullish";
  else if (score <= 5.0) stance = "Bearish";

  const confidencePct = Math.round(65 + score * 2.5);

  const reasoning = `NIFTY 50 is at ${nifty50.value.toLocaleString("en-IN")} (${nifty50.change >= 0 ? "+" : ""}${nifty50.change}%). FII net flow: +₹${Math.round(fiiFLow / 100)}Cr. Market breadth ratio: ${breadthRatio.toFixed(2)}.`;

  return {
    agentName: "Market",
    score: parseFloat(score.toFixed(1)),
    stance,
    confidencePct,
    reasoning,
    keyMetrics: {
      "NIFTY 50": `${nifty50.value.toLocaleString("en-IN")} (${nifty50.change}%)`,
      "BANK NIFTY": `${bankNifty.value.toLocaleString("en-IN")} (${bankNifty.change}%)`,
      "Breadth Ratio": breadthRatio.toFixed(2),
      "FII Flow": `+₹${Math.round(fiiFLow / 100)}Cr`,
      "DII Flow": `+₹${Math.round(diiFlow / 100)}Cr`,
    },
  };
}
