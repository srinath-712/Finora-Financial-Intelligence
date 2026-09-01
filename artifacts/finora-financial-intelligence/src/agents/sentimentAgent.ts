import type { AgentOutput, AnalysisContext } from "./types";

export function evaluateSentiment(ctx: AnalysisContext): AgentOutput {
  const { stockDetail } = ctx;
  const score = stockDetail.sentiment;

  let stance: "Bullish" | "Neutral" | "Bearish" = "Neutral";
  if (score >= 7.0) stance = "Bullish";
  else if (score <= 5.0) stance = "Bearish";

  const confidencePct = Math.round(60 + score * 3);

  const reasoning = stance === "Bullish"
    ? `Institutional sentiment is constructive (${score}/10). Earnings commentary and analyst coverage tone remain positive.`
    : `Market sentiment is balanced (${score}/10). Retail interest is steady without euphoria.`;

  return {
    agentName: "Sentiment",
    score: parseFloat(score.toFixed(1)),
    stance,
    confidencePct,
    reasoning,
    keyMetrics: {
      "Sentiment Score": `${score}/10`,
      "Analyst Consensus": stockDetail.analystView,
      "News Tone": score >= 7 ? "Positive" : "Neutral",
    },
  };
}
