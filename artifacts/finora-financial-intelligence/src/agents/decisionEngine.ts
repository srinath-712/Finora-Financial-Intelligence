import type { AnalysisContext, DecisionResult, Stance } from "./types";
import { evaluateFundamentals } from "./fundamentalAgent";
import { evaluateQuantTechnicals } from "./quantAgent";
import { evaluateMarket } from "./marketAgent";
import { evaluateSentiment } from "./sentimentAgent";
import { evaluatePortfolioRisk } from "./riskAgent";
import { calculatePortfolioValue } from "../engine/investmentEngine";

export function synthesizeDecision(ctx: AnalysisContext): DecisionResult {
  const { symbol, stockDetail, holdings } = ctx;

  const fundamental = evaluateFundamentals(ctx);
  const quant = evaluateQuantTechnicals(ctx);
  const market = evaluateMarket(ctx);
  const sentiment = evaluateSentiment(ctx);
  const risk = evaluatePortfolioRisk(ctx);

  const agentOutputs = [fundamental, quant, market, sentiment, risk];

  // Weighted score calculation
  const weights = {
    Fundamental: 0.30,
    Quant: 0.25,
    Market: 0.20,
    Sentiment: 0.15,
    Risk: 0.10,
  };

  let rawConsensus =
    fundamental.score * weights.Fundamental +
    quant.score * weights.Quant +
    market.score * weights.Market +
    sentiment.score * weights.Sentiment +
    risk.score * weights.Risk;

  // ─── PORTFOLIO CONCENTRATION PENALTY ───────────────────────────────────────
  const totalValue = calculatePortfolioValue(holdings);
  const existingHolding = holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase());
  const holdingWeightPct = existingHolding && totalValue > 0
    ? ((existingHolding.shares * existingHolding.currentPrice) / totalValue) * 100
    : 0;

  const sectorHoldings = holdings.filter((h) => existingHolding ? h.sector === existingHolding.sector : false);
  const sectorWeightPct = totalValue > 0
    ? (sectorHoldings.reduce((s, h) => s + h.shares * h.currentPrice, 0) / totalValue) * 100
    : 0;

  let portfolioPenaltyApplied = false;
  let penaltyReasoning = "";

  if (holdingWeightPct > 15) {
    portfolioPenaltyApplied = true;
    const penalty = 1.8;
    rawConsensus -= penalty;
    penaltyReasoning = `Position already represents ${holdingWeightPct.toFixed(1)}% of your portfolio. High single-stock concentration penalty (-${penalty} pts) applied.`;
  } else if (sectorWeightPct > 30) {
    portfolioPenaltyApplied = true;
    const penalty = 1.2;
    rawConsensus -= penalty;
    penaltyReasoning = `Your exposure to ${existingHolding?.sector ?? "this sector"} is high (${sectorWeightPct.toFixed(1)}%). Sector concentration penalty (-${penalty} pts) applied.`;
  }

  const consensusScore = parseFloat(Math.min(10, Math.max(1, rawConsensus)).toFixed(1));

  // Determine Stance based on synthesized consensus score
  let stance: Stance = "HOLD";
  if (consensusScore >= 7.6) stance = "BUY";
  else if (consensusScore >= 6.4) stance = "ACCUMULATE";
  else if (consensusScore >= 5.0) stance = "HOLD";
  else if (consensusScore >= 3.8) stance = "REDUCE";
  else stance = "SELL";

  const avgConfidence = Math.round(
    agentOutputs.reduce((sum, a) => sum + a.confidencePct, 0) / agentOutputs.length
  );

  // Supporting factors
  const supportingFactors: string[] = [];
  if (fundamental.score >= 7.0) supportingFactors.push(fundamental.reasoning);
  if (quant.score >= 7.0) supportingFactors.push(quant.reasoning);
  if (market.score >= 6.5) supportingFactors.push(market.reasoning);
  if (supportingFactors.length === 0) supportingFactors.push("Company retains steady operating fundamentals.");

  // Risks
  const risks: string[] = [];
  if (portfolioPenaltyApplied && penaltyReasoning) risks.push(penaltyReasoning);
  if (stockDetail.riskScore === "High") risks.push("High fundamental volatility and sensitivity to market cycles.");
  if (stockDetail.debtEquity > 0.8) risks.push(`Elevated debt-to-equity ratio of ${stockDetail.debtEquity}.`);
  if (risks.length === 0) risks.push("Broad market equity volatility.");

  // Invalidation conditions
  const invalidationConditions: string[] = [
    `Earnings drop over two consecutive quarters.`,
    `Break below key technical support at ₹${Math.round(stockDetail.week52Low * 1.05)}.`,
    `Sector concentration exceeding 35% of total portfolio.`,
  ];

  return {
    symbol,
    companyName: stockDetail.symbol,
    stance,
    consensusScore,
    confidencePct: avgConfidence,
    agentOutputs,
    supportingFactors,
    risks,
    invalidationConditions,
    portfolioPenaltyApplied,
    penaltyReasoning,
  };
}
