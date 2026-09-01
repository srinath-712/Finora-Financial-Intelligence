import type { AppState } from "../store/context";
import type { DecisionResult } from "./types";
import { STOCK_DETAILS } from "../store/data";
import { synthesizeDecision } from "./decisionEngine";

export * from "./types";
export * from "./fundamentalAgent";
export * from "./quantAgent";
export * from "./marketAgent";
export * from "./sentimentAgent";
export * from "./riskAgent";
export * from "./decisionEngine";

export function analyzeStockWithQuantAgents(symbol: string, state: AppState): DecisionResult {
  const s = symbol.toUpperCase().trim();
  const stockDetail = STOCK_DETAILS[s] ?? STOCK_DETAILS[state.holdings[0]?.symbol ?? "RELIANCE"];

  const ctx = {
    symbol: s,
    stockDetail,
    holdings: state.holdings,
    market: state.market,
  };

  return synthesizeDecision(ctx);
}
