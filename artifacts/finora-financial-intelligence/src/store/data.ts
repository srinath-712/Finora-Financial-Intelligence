export type {
  User, Account, Transaction, TransactionType, TransactionCategory,
  BudgetDefinition, Goal, RecurringItem, RecurringFrequency,
  Holding, WatchlistItem, MarketSnapshot,
} from "../engine/types";

import type {
  User, Account, Transaction, BudgetDefinition,
  Goal, Holding, WatchlistItem, RecurringItem, MarketSnapshot,
} from "../engine/types";

export interface StockDetail {
  symbol: string;
  fairValue: number;
  week52Low: number;
  week52High: number;
  analystView: "Buy" | "Accumulate" | "Hold" | "Reduce" | "Sell";
  fundamentals: number;
  momentum: number;
  sentiment: number;
  riskScore: "Low" | "Moderate" | "High";
  volume: number;
  pe: number;
  pb: number;
  roe: number;
  debtEquity: number;
  marketCap: string;
  aiRead: string;
  chartPrices: number[];
}

// ─── Dynamic date helpers ──────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export function monthsAgo(n: number, day = 1): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  return d.toISOString().split("T")[0];
}

export function futureMonths(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
}

export function currentMonthYear(): string {
  const d = new Date();
  return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
}

export function currentMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────

export const SEED_USER: User = {
  name: "Aarav Mehta",
  initials: "AM",
  role: "Product designer",
  city: "Bengaluru",
  plan: "Pro",
  avatar: "#ed9d3d",
  savingsTargetPct: 30,
  riskTolerance: "Moderate",
  primaryGoal: "Financial freedom",
};

export const SEED_ACCOUNTS: Account[] = [
  { id: "hdfc-salary",   name: "HDFC Salary Account", type: "bank",       baseBalance: 184260, color: "#167b73", institution: "HDFC Bank"  },
  { id: "icici-savings", name: "ICICI Savings",        type: "bank",       baseBalance: 94680,  color: "#ed9d3d", institution: "ICICI Bank" },
  { id: "hdfc-cc",       name: "HDFC Millennia",       type: "credit",     baseBalance: -23840, color: "#ca6471", institution: "HDFC Bank", lastFour: "4291" },
  { id: "cash",          name: "Cash wallet",          type: "cash",       baseBalance: 8200,   color: "#5278c5", institution: "Cash"      },
  { id: "groww",         name: "Groww Investments",    type: "investment", baseBalance: 656109, color: "#8d75b9", institution: "Groww"     },
];

// 30 transactions spanning the last 12 months, dynamically dated
export const SEED_TRANSACTIONS: Transaction[] = [
  // Current month
  { id: "t1",  merchant: "Salary credit",        category: "Income",        account: "hdfc-salary",   date: daysAgo(1),   amount: 158000, type: "credit" },
  { id: "t2",  merchant: "Zepto",                category: "Groceries",     account: "hdfc-cc",       date: daysAgo(2),   amount: 846,    type: "debit"  },
  { id: "t3",  merchant: "Bengaluru Metro",       category: "Transport",     account: "icici-savings", date: daysAgo(2),   amount: 560,    type: "debit"  },
  { id: "t4",  merchant: "The Fat Chef",          category: "Dining",        account: "hdfc-cc",       date: daysAgo(3),   amount: 2380,   type: "debit"  },
  { id: "t5",  merchant: "Netflix",               category: "Subscriptions", account: "hdfc-cc",       date: daysAgo(4),   amount: 649,    type: "debit"  },
  { id: "t6",  merchant: "Groww SIP",             category: "Investments",   account: "icici-savings", date: daysAgo(4),   amount: 15000,  type: "debit"  },
  { id: "t7",  merchant: "Amazon India",          category: "Shopping",      account: "hdfc-cc",       date: daysAgo(5),   amount: 3299,   type: "debit"  },
  { id: "t8",  merchant: "Rent transfer",         category: "Housing",       account: "icici-savings", date: daysAgo(29),  amount: 32000,  type: "debit"  },
  { id: "t9",  merchant: "Swiggy",                category: "Dining",        account: "hdfc-cc",       date: daysAgo(6),   amount: 712,    type: "debit"  },
  { id: "t10", merchant: "Freelance retainer",    category: "Income",        account: "icici-savings", date: daysAgo(7),   amount: 18000,  type: "credit" },
  { id: "t11", merchant: "Blinkit",               category: "Groceries",     account: "hdfc-cc",       date: daysAgo(8),   amount: 1240,   type: "debit"  },
  { id: "t12", merchant: "Cult.fit membership",   category: "Health",        account: "hdfc-cc",       date: daysAgo(9),   amount: 1499,   type: "debit"  },
  { id: "t13", merchant: "Zomato",                category: "Dining",        account: "hdfc-cc",       date: daysAgo(10),  amount: 985,    type: "debit"  },
  { id: "t14", merchant: "Myntra",                category: "Shopping",      account: "hdfc-cc",       date: daysAgo(11),  amount: 2890,   type: "debit"  },
  { id: "t15", merchant: "Spotify",               category: "Subscriptions", account: "hdfc-cc",       date: daysAgo(12),  amount: 119,    type: "debit"  },
  // 1 month ago
  { id: "t16", merchant: "Salary credit",         category: "Income",        account: "hdfc-salary",   date: monthsAgo(1, 1),  amount: 158000, type: "credit" },
  { id: "t17", merchant: "Rent transfer",         category: "Housing",       account: "icici-savings", date: monthsAgo(1, 2),  amount: 32000,  type: "debit"  },
  { id: "t18", merchant: "Groww SIP",             category: "Investments",   account: "icici-savings", date: monthsAgo(1, 5),  amount: 15000,  type: "debit"  },
  { id: "t19", merchant: "Big Basket",            category: "Groceries",     account: "hdfc-cc",       date: monthsAgo(1, 8),  amount: 2140,   type: "debit"  },
  { id: "t20", merchant: "Truffles",              category: "Dining",        account: "hdfc-cc",       date: monthsAgo(1, 12), amount: 3240,   type: "debit"  },
  { id: "t21", merchant: "Rapido",                category: "Transport",     account: "icici-savings", date: monthsAgo(1, 15), amount: 480,    type: "debit"  },
  { id: "t22", merchant: "Freelance retainer",    category: "Income",        account: "icici-savings", date: monthsAgo(1, 18), amount: 18000,  type: "credit" },
  // 2 months ago
  { id: "t23", merchant: "Salary credit",         category: "Income",        account: "hdfc-salary",   date: monthsAgo(2, 1),  amount: 158000, type: "credit" },
  { id: "t24", merchant: "Rent transfer",         category: "Housing",       account: "icici-savings", date: monthsAgo(2, 2),  amount: 32000,  type: "debit"  },
  { id: "t25", merchant: "Apple iCloud",          category: "Subscriptions", account: "hdfc-cc",       date: monthsAgo(2, 5),  amount: 75,     type: "debit"  },
  { id: "t26", merchant: "Decathlon",             category: "Shopping",      account: "hdfc-cc",       date: monthsAgo(2, 10), amount: 4500,   type: "debit"  },
  // 3 months ago
  { id: "t27", merchant: "Salary credit",         category: "Income",        account: "hdfc-salary",   date: monthsAgo(3, 1),  amount: 152000, type: "credit" },
  { id: "t28", merchant: "Freelance bonus",       category: "Income",        account: "icici-savings", date: monthsAgo(3, 15), amount: 25000,  type: "credit" },
  { id: "t29", merchant: "Rent transfer",         category: "Housing",       account: "icici-savings", date: monthsAgo(3, 2),  amount: 32000,  type: "debit"  },
  { id: "t30", merchant: "MakeMyTrip",            category: "Other",         account: "hdfc-cc",       date: monthsAgo(3, 20), amount: 18500,  type: "debit"  },
];

export const SEED_BUDGETS: BudgetDefinition[] = [
  { id: "b1", name: "Housing",        category: "Housing",       limit: 35000, color: "#167b73" },
  { id: "b2", name: "Food & dining",  category: "Dining",        limit: 16000, color: "#ed9d3d" },
  { id: "b3", name: "Transport",      category: "Transport",     limit: 7000,  color: "#5278c5" },
  { id: "b4", name: "Shopping",       category: "Shopping",      limit: 10000, color: "#ca6471" },
  { id: "b5", name: "Subscriptions",  category: "Subscriptions", limit: 3500,  color: "#8d75b9" },
  { id: "b6", name: "Groceries",      category: "Groceries",     limit: 8000,  color: "#55a889" },
];

export const SEED_GOALS: Goal[] = [
  { id: "g1", name: "Emergency runway",   current: 182000,  target: 300000,  targetDate: futureMonths(4),  monthlyContribution: 18000, color: "#167b73", icon: "shield" },
  { id: "g2", name: "Hampi long weekend", current: 42000,   target: 60000,   targetDate: futureMonths(2),  monthlyContribution: 6000,  color: "#ed9d3d", icon: "map" },
  { id: "g3", name: "Home down payment",  current: 485000,  target: 1200000, targetDate: futureMonths(28), monthlyContribution: 24000, color: "#5278c5", icon: "home" },
  { id: "g4", name: "MacBook fund",       current: 68000,   target: 110000,  targetDate: futureMonths(3),  monthlyContribution: 7000,  color: "#ca6471", icon: "laptop" },
];

export const SEED_HOLDINGS: Holding[] = [
  { id: "h1",  symbol: "RELIANCE",    name: "Reliance Industries",       shares: 42, avgPrice: 2491.7, currentPrice: 2924.3, sector: "Energy"     },
  { id: "h2",  symbol: "HDFCBANK",    name: "HDFC Bank",                 shares: 64, avgPrice: 1732.8, currentPrice: 1682.1, sector: "Financials" },
  { id: "h3",  symbol: "TCS",         name: "Tata Consultancy Services", shares: 21, avgPrice: 2889.2, currentPrice: 3441.2, sector: "IT"         },
  { id: "h4",  symbol: "INFY",        name: "Infosys",                   shares: 38, avgPrice: 1374.0, currentPrice: 1543.8, sector: "IT"         },
  { id: "h5",  symbol: "ICICIBANK",   name: "ICICI Bank",                shares: 48, avgPrice: 1102.3, currentPrice: 1276.6, sector: "Financials" },
  { id: "h6",  symbol: "BHARTIARTL",  name: "Bharti Airtel",             shares: 35, avgPrice: 1384.0, currentPrice: 1698.4, sector: "Telecom"    },
  { id: "h7",  symbol: "LT",          name: "Larsen & Toubro",           shares: 14, avgPrice: 3077.9, currentPrice: 3621.0, sector: "Industrials"},
  { id: "h8",  symbol: "TATAMOTORS",  name: "Tata Motors",               shares: 56, avgPrice: 1046.4, currentPrice: 968.1,  sector: "Auto"       },
  { id: "h9",  symbol: "TITAN",       name: "Titan Company",             shares: 11, avgPrice: 3036.4, currentPrice: 3510.0, sector: "Consumer"   },
  { id: "h10", symbol: "SBIN",        name: "State Bank of India",       shares: 40, avgPrice: 680.0,  currentPrice: 761.5,  sector: "Financials" },
];

export const SEED_WATCHLIST: WatchlistItem[] = [
  { id: "w1", symbol: "BEL",      name: "Bharat Electronics",  price: 276.40,  change: 4.8,  changeAmt: 12.65 },
  { id: "w2", symbol: "TRENT",    name: "Trent",               price: 5815.00, change: 3.6,  changeAmt: 201.80 },
  { id: "w3", symbol: "ADANIENT", name: "Adani Enterprises",   price: 2434.20, change: -1.9, changeAmt: -47.10 },
  { id: "w4", symbol: "BAJFINANCE", name: "Bajaj Finance",     price: 7182.50, change: 1.2,  changeAmt: 85.30  },
];

export const SEED_RECURRING: RecurringItem[] = [
  { id: "r1", name: "Netflix",     category: "Entertainment", amount: 649,  frequency: "monthly", nextDate: daysAgo(-10), annualTotal: 7788,  monthlyEquivalent: 649,  annualEquivalent: 7788,  status: "active"  },
  { id: "r2", name: "Spotify",     category: "Entertainment", amount: 119,  frequency: "monthly", nextDate: daysAgo(-18), annualTotal: 1428,  monthlyEquivalent: 119,  annualEquivalent: 1428,  status: "active"  },
  { id: "r3", name: "Cult.fit",    category: "Health",        amount: 1499, frequency: "monthly", nextDate: daysAgo(-20), annualTotal: 17988, monthlyEquivalent: 1499, annualEquivalent: 17988, status: "unused"  },
  { id: "r4", name: "Google One",  category: "Utilities",     amount: 130,  frequency: "monthly", nextDate: daysAgo(-3),  annualTotal: 1560,  monthlyEquivalent: 130,  annualEquivalent: 1560,  status: "active"  },
  { id: "r5", name: "Hotstar",     category: "Entertainment", amount: 299,  frequency: "monthly", nextDate: daysAgo(-22), annualTotal: 3588,  monthlyEquivalent: 299,  annualEquivalent: 3588,  status: "unused"  },
];

export const SEED_MARKET: MarketSnapshot = {
  nifty50:    { value: 23519.60, change: 0.74 },
  bankNifty:  { value: 50184.20, change: 0.42 },
  sensex:     { value: 77578.38, change: 0.69 },
  fiiFLow:    128400,  // in crores *100 for display
  diiFlow:    84200,
  advances:   1248,
  declines:   804,
  unchanged:  76,
};

export const STOCK_DETAILS: Record<string, StockDetail> = {
  RELIANCE: {
    symbol: "RELIANCE", fairValue: 3180, week52Low: 2218, week52High: 3022,
    analystView: "Accumulate", fundamentals: 8.2, momentum: 7.4, sentiment: 6.8,
    riskScore: "Moderate", volume: 8423000,
    pe: 22.4, pb: 2.1, roe: 10.8, debtEquity: 0.38, marketCap: "19.8L Cr",
    aiRead: "Reliance's retail and digital businesses are doing the quiet work. The near-term trigger is Jio's tariff reset; the risk is capex discipline.",
    chartPrices: [2730, 2810, 2770, 2890, 2830, 2910, 2860, 2924],
  },
  HDFCBANK: {
    symbol: "HDFCBANK", fairValue: 1820, week52Low: 1468, week52High: 1890,
    analystView: "Hold", fundamentals: 7.8, momentum: 5.2, sentiment: 5.9,
    riskScore: "Low", volume: 12100000,
    pe: 19.1, pb: 2.4, roe: 16.2, debtEquity: 0.82, marketCap: "12.7L Cr",
    aiRead: "HDFC Bank is consolidating post-merger. NIMs are under pressure but credit growth remains steady. Patience is the position here.",
    chartPrices: [1820, 1790, 1810, 1760, 1720, 1700, 1690, 1682],
  },
  TCS: {
    symbol: "TCS", fairValue: 3650, week52Low: 2926, week52High: 3582,
    analystView: "Buy", fundamentals: 9.0, momentum: 7.8, sentiment: 7.4,
    riskScore: "Low", volume: 4200000,
    pe: 26.8, pb: 11.2, roe: 47.8, debtEquity: 0.02, marketCap: "12.5L Cr",
    aiRead: "TCS's order book is a leading indicator that demand is recovering. Margins remain industry-best. A disciplined compounder.",
    chartPrices: [2930, 3060, 3140, 3210, 3180, 3290, 3380, 3441],
  },
  INFY: {
    symbol: "INFY", fairValue: 1680, week52Low: 1280, week52High: 1620,
    analystView: "Accumulate", fundamentals: 8.4, momentum: 7.1, sentiment: 6.9,
    riskScore: "Low", volume: 7800000,
    pe: 23.4, pb: 7.8, roe: 31.6, debtEquity: 0.04, marketCap: "6.4L Cr",
    aiRead: "Infosys is winning back deal momentum. The guidance upgrade signals management confidence. Reasonable valuation for a quality name.",
    chartPrices: [1280, 1340, 1390, 1420, 1460, 1510, 1530, 1544],
  },
  ICICIBANK: {
    symbol: "ICICIBANK", fairValue: 1380, week52Low: 1008, week52High: 1328,
    analystView: "Buy", fundamentals: 8.8, momentum: 7.9, sentiment: 7.6,
    riskScore: "Low", volume: 14600000,
    pe: 17.8, pb: 2.9, roe: 18.4, debtEquity: 0.74, marketCap: "8.9L Cr",
    aiRead: "ICICI Bank is firing on all cylinders: credit growth, margins, and asset quality all trending right. Best-in-class private bank.",
    chartPrices: [1050, 1090, 1120, 1168, 1190, 1230, 1260, 1277],
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL", fairValue: 1820, week52Low: 1284, week52High: 1768,
    analystView: "Buy", fundamentals: 8.0, momentum: 8.2, sentiment: 7.8,
    riskScore: "Moderate", volume: 6900000,
    pe: 48.2, pb: 6.4, roe: 13.8, debtEquity: 1.82, marketCap: "10.1L Cr",
    aiRead: "Airtel's ARPU expansion story is intact. Africa optionality adds asymmetric upside. High debt is the watch — but cash flow is covering it.",
    chartPrices: [1320, 1380, 1420, 1500, 1560, 1620, 1670, 1698],
  },
  LT: {
    symbol: "LT", fairValue: 3900, week52Low: 3042, week52High: 3874,
    analystView: "Accumulate", fundamentals: 8.6, momentum: 7.2, sentiment: 7.0,
    riskScore: "Low", volume: 3400000,
    pe: 28.4, pb: 4.2, roe: 15.6, debtEquity: 0.28, marketCap: "5.0L Cr",
    aiRead: "L&T's order inflow is beating expectations. Capex cycle in India is a tailwind. Infrastructure play for the medium term.",
    chartPrices: [3080, 3160, 3240, 3360, 3420, 3520, 3580, 3621],
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS", fairValue: 1020, week52Low: 806, week52High: 1178,
    analystView: "Hold", fundamentals: 6.4, momentum: 5.0, sentiment: 5.4,
    riskScore: "High", volume: 18200000,
    pe: 8.2, pb: 2.1, roe: 24.8, debtEquity: 0.94, marketCap: "3.6L Cr",
    aiRead: "JLR headwinds are real. China EV competition is intensifying. Domestic CV business remains a bright spot. Patience required.",
    chartPrices: [1120, 1080, 1040, 1010, 990, 975, 960, 968],
  },
  TITAN: {
    symbol: "TITAN", fairValue: 3720, week52Low: 3024, week52High: 3680,
    analystView: "Accumulate", fundamentals: 8.4, momentum: 7.6, sentiment: 7.2,
    riskScore: "Low", volume: 2600000,
    pe: 62.4, pb: 14.8, roe: 23.8, debtEquity: 0.04, marketCap: "3.9L Cr",
    aiRead: "Titan is a premium consumer play. Weddings + aspirational demand are structural. Valuation demands patience; quality justifies the premium.",
    chartPrices: [3060, 3120, 3240, 3360, 3420, 3460, 3490, 3510],
  },
  SBIN: {
    symbol: "SBIN", fairValue: 820, week52Low: 624, week52High: 912,
    analystView: "Accumulate", fundamentals: 7.2, momentum: 6.8, sentiment: 6.6,
    riskScore: "Moderate", volume: 28400000,
    pe: 8.4, pb: 1.2, roe: 14.6, debtEquity: 0.68, marketCap: "6.8L Cr",
    aiRead: "SBI is trading at a discount to peers despite improving asset quality. Government ownership is a double edge — stability and policy risk.",
    chartPrices: [660, 690, 718, 734, 742, 752, 758, 762],
  },
};
