import type { Account, BudgetDefinition, Goal, Holding, MarketSnapshot, RecurringItem, Transaction, User } from "../engine/types";
import type { DecisionResult } from "../agents/types";

export interface UnifiedFinancialContext {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: BudgetDefinition[];
  goals: Goal[];
  recurring: RecurringItem[];
  holdings: Holding[];
  market: MarketSnapshot;

  // Derived financial metrics
  netWorth: number;
  availableCash: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySaved: number;
  savingsRate: number;
  upcoming30DaysRecurringCost: number;
  emergencyBufferRequirement: number;

  // Derived investment metrics
  portfolioValue: number;
  portfolioCost: number;
  portfolioPnL: number;
  portfolioPnLPct: number;
  portfolioBeta: number;
  sectorAllocations: Array<{ name: string; value: number; color: string }>;
}

export interface AffordabilityResult {
  stockSymbol: string;
  purchaseAmount: number;
  affordable: boolean;
  availableCash: number;
  remainingCash: number;
  upcomingRecurringCommitments: number;
  emergencyBufferRequired: number;
  emergencyBufferLeft: number;
  leavesEmergencyBufferIntact: boolean;
  goalImpacts: Array<{ goalName: string; monthlyContribution: number; impacted: boolean }>;
  explanation: string;
}

export interface PortfolioImpactResult {
  stockSymbol: string;
  purchaseAmount: number;
  currentPortfolioValue: number;
  newPortfolioValue: number;
  currentSectorWeightPct: number;
  newSectorWeightPct: number;
  sectorWeightChangePct: number;
  currentConcentrationHHI: number;
  newConcentrationHHI: number;
  currentBeta: number;
  newBeta: number;
  betaChange: number;
  riskLevelBefore: "low" | "moderate" | "high";
  riskLevelAfter: "low" | "moderate" | "high";
  explanation: string;
}

export interface UnifiedInvestmentDecision {
  stockSymbol: string;
  purchaseAmount: number;
  quantAgentsStance: string;          // BUY, ACCUMULATE, HOLD, REDUCE, SELL from market intelligence
  personalStance: "RECOMMENDED" | "SUITABLE_WITH_CAUTION" | "NOT_RECOMMENDED" | "UNAFFORDABLE";
  quantAgentsScore: number;          // 0-10 market score
  affordability: AffordabilityResult;
  portfolioImpact: PortfolioImpactResult;
  quantAgentsDecision: DecisionResult;
  personalizedAdvice: string;
  keyDivergenceReason?: string;       // Explains e.g. "Technically BUY, but UNAFFORDABLE for your cash buffer."
}
