import type { Holding, MarketSnapshot } from "../engine/types";
import type { StockDetail } from "../store/data";

export type Stance = "BUY" | "ACCUMULATE" | "HOLD" | "REDUCE" | "SELL";

export interface AgentOutput {
  agentName: "Fundamental" | "Quant" | "Market" | "Sentiment" | "Risk";
  score: number;             // 0.0 to 10.0
  stance: "Bullish" | "Neutral" | "Bearish";
  confidencePct: number;    // 0 to 100
  reasoning: string;
  keyMetrics: Record<string, string | number>;
}

export interface AnalysisContext {
  symbol: string;
  stockDetail: StockDetail;
  holdings: Holding[];
  market: MarketSnapshot;
}

export interface DecisionResult {
  symbol: string;
  companyName: string;
  stance: Stance;
  consensusScore: number;     // 0.0 to 10.0
  confidencePct: number;      // 0 to 100
  agentOutputs: AgentOutput[];
  supportingFactors: string[];
  risks: string[];
  invalidationConditions: string[];
  portfolioPenaltyApplied: boolean;
  penaltyReasoning?: string;
}
