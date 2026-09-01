// ─── Domain Types & Engine Interfaces ──────────────────────────────────────────

export type AccountType = "bank" | "credit" | "cash" | "investment";

export interface User {
  name: string;
  role: string;
  city: string;
  initials: string;
  plan?: string;
  avatar?: string;
  savingsTargetPct: number;
  riskTolerance: "Conservative" | "Moderate" | "Aggressive";
  primaryGoal: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  baseBalance: number;
  color: string;
  institution: string;
  lastFour?: string;
}

export type TransactionType = "debit" | "credit" | "transfer";

export type TransactionCategory =
  | "Income"
  | "Groceries"
  | "Transport"
  | "Dining"
  | "Subscriptions"
  | "Investments"
  | "Shopping"
  | "Housing"
  | "Health"
  | "Utilities"
  | "Entertainment"
  | "Personal"
  | "Other";

export interface Transaction {
  id: string;
  merchant: string;
  category: TransactionCategory;
  account: string;       // Source account ID
  toAccount?: string;    // Destination account ID (for transfers)
  date: string;          // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  notes?: string;
}

export interface BudgetDefinition {
  id: string;
  name: string;
  category: TransactionCategory;
  limit: number;
  color: string;
}

export interface BudgetWithPace extends BudgetDefinition {
  spent: number;
  remaining: number;
  utilizationPct: number;
  overspent: boolean;
  pacePct: number;                 // current day-of-month pace vs spending %
  projectedMonthEndSpend: number;  // projected spend by end of month based on pace
  overspendingRisk: "low" | "medium" | "high";
  paceInsight: string;             // e.g. "You're spending 18% faster than your monthly pace."
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  monthlyContribution: number;
  targetDate: string;  // e.g. "Dec 2026"
  color: string;
  icon?: string;
}

export interface GoalAnalysis extends Goal {
  progressPct: number;
  remainingAmount: number;
  requiredMonthlyContribution: number;
  projectedCompletionDate: string;
  sufficiencyStatus: "sufficient" | "behind" | "critical";
}

export type RecurringFrequency = "monthly" | "yearly" | "weekly";

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  frequency: RecurringFrequency;
  nextDate: string;
  status: "active" | "unused";
  annualTotal?: number;
  monthlyEquivalent: number;
  annualEquivalent: number;
}

export interface DetectedSubscription {
  merchant: string;
  category: TransactionCategory;
  averageAmount: number;
  frequency: RecurringFrequency;
  transactionCount: number;
  lastDate: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
}

export interface HoldingMetrics extends Holding {
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  weightPct: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changeAmt: number;
}

export interface MarketSnapshot {
  nifty50: { value: number; change: number };
  bankNifty: { value: number; change: number };
  sensex: { value: number; change: number };
  fiiFLow: number;
  diiFlow: number;
  advances: number;
  declines: number;
  unchanged: number;
}

export interface FinancialHealthMetrics {
  score: number;            // 0 - 100
  savingsRateScore: number;  // 0 - 30
  emergencyFundScore: number; // 0 - 20
  budgetAdherenceScore: number; // 0 - 20
  portfolioReturnScore: number; // 0 - 15
  goalsProgressScore: number; // 0 - 15
  summaryText: string;
}
