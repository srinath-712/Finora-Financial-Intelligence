# Finora — Multi-Agent Autonomous Financial Intelligence System for Retail Investors

> **Finora** is an AI-native multi-agent personal financial operating system built specifically for retail investors in the Indian financial market (NSE/BSE). 
> 
> It bridges the infrastructure gap between raw financial data (price feeds, FII/DII disclosures, sector breadth, corporate fundamentals) and personalized, explainable, and safe investment decision-making.

---

## 📋 Problem Statement & Compliance Matrix

In modern retail finance, information is abundant—NSE price feeds, corporate filings, FII disclosures, and technical charts are publicly accessible. However, **89% of retail derivative participants in India lose money (SEBI 2024)** because retail investors lack the multi-perspective research infrastructure deployed by institutional hedge funds.

Finora solves this by running 5 parallel specialized AI analyst agents that synthesize market intelligence with the user's **actual personal financial context** (cash, emergency buffer, 30-day recurring bills, budget pace, goal progress, and portfolio concentration) in under 60 seconds.

### Minimum Requirements Verification Matrix

| Requirement | Implementation Status | Core Module |
| :--- | :---: | :--- |
| **Multi-Dimensional Signal Classification** | ✅ **Implemented** | Evaluates market data across 5 dimensions: Fundamentals, Technical Quant, Market Tape, Sentiment, and Risk with confidence levels and cited reasoning. | `src/agents/` |
| **RAG & Grounded Financial Disclosures** | ✅ **Implemented** | Agent outputs cite grounded financial disclosures, earnings transcripts, fair value calculations, and stock detail reads with transparent attribution. | `src/agents/fundamentalAgent.ts`, `src/store/data.ts` |
| **Parallel Multi-Agent Architecture** | ✅ **Implemented** | 5 independent agents (*Fundamental, Quant, Market, Sentiment, Risk*) with structured `AgentOutput` contracts consumed by a master synthesis engine. | `src/agents/decisionEngine.ts` |
| **User Profiling & Personalization** | ✅ **Implemented** | User portfolio concentration & risk profile modify agent outputs. Identical market inputs produce different recommendations depending on user portfolio state. | `src/integration/affordabilityEngine.ts`, `src/agents/riskAgent.ts` |
| **Live Multi-View Interface** | ✅ **Implemented** | Live interactive screens rendering market signals, agent reasoning traces, sector heatmaps, portfolio state, and AI copilot interactions across 16 routes. | `src/pages/` |
| **Performance & Risk Metrics Logging** | ✅ **Implemented** | Tracks portfolio concentration (HHI index), weighted beta, Value-at-Risk, savings rate, health score (0–100), and agent confidence percentages. | `src/engine/investmentEngine.ts`, `src/engine/financialEngine.ts` |
| **End-to-End Reasoning Chain** | ✅ **Implemented** | Complete trace from raw market inputs -> 5 agent reasoning passes -> portfolio impact simulation -> synthesized recommendation with cited logic. | `src/agents/index.ts`, `src/integration/unifiedDecisionEngine.ts` |
| **Graceful Degraded-Data & Conflict Handling** | ✅ **Implemented** | When agents produce conflicting signals (e.g. Fundamental Bullish vs Quant Bearish), the engine computes a weighted consensus with explicit risk warnings. | `src/agents/decisionEngine.ts` |

---

## 🤖 Multi-Agent Architecture (`src/agents/`)

Finora deploys a committee of 5 specialized analyst agents executing independent reasoning tasks:

```text
                        ┌────────────────────────────────────────┐
                        │          Market & Stock Inputs         │
                        └───────────────────┬────────────────────┘
                                            │
        ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
        ▼                   ▼               ▼               ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌─────────┐   ┌───────────┐   ┌───────────────────┐
│  Fundamental  │   │  Quant (Tech) │   │ Market  │   │ Sentiment │   │   Risk Analyst    │
│    Analyst    │   │    Analyst    │   │ Analyst │   │  Analyst  │   │ (User Portfolio)  │
└───────┬───────┘   └───────┬───────┘   └───┬─────┘   └─────┬─────┘   └─────────┬─────────┘
        │                   │               │               │                   │
        └───────────────────┼───────────────┼───────────────┼───────────────────┘
                            ▼               ▼               ▼
                        ┌────────────────────────────────────────┐
                        │   Portfolio-Aware Decision Synthesis   │
                        │       (Stance, Score, Penalty, VAR)    │
                        └───────────────────┬────────────────────┘
                                            │
                                            ▼
                        ┌────────────────────────────────────────┐
                        │     Personalized Advice (UI & Copilot) │
                        └────────────────────────────────────────┘
```

### 1. Fundamental Analyst (`fundamentalAgent.ts`)
- **Focus**: Corporate health, valuation, and balance sheet strength.
- **Evaluates**: P/E, P/B, ROE, Debt-to-Equity ratio, and Price-to-Fair Value discount/premium.
- **Output**: Score (0–10), stance (*Bullish/Neutral/Bearish*), confidence %, and valuation reasoning.

### 2. Quant Analyst (`quantAgent.ts`)
- **Focus**: Technical momentum, trend health, and volume profile.
- **Evaluates**: 14-period RSI, 50-day SMA, 200-day EMA, price momentum change %, and trading volume.
- **Output**: Technical score (0–10), trend stance, confidence %, and indicator breakdown.

### 3. Market Analyst (`marketAgent.ts`)
- **Focus**: Broad market tape and macroeconomic regime.
- **Evaluates**: NIFTY 50 / BANK NIFTY indices, market breadth ratio (advances/declines), and FII/DII net institutional flows.
- **Output**: Market environment score (0–10), liquidity stance, confidence %, and flow reasoning.

### 4. Sentiment Analyst (`sentimentAgent.ts`)
- **Focus**: Public news flow tone and market perception.
- **Evaluates**: Corporate news sentiment, analyst consensus views (Buy/Hold/Sell), and retail vs institutional sentiment.
- **Output**: Sentiment score (0–10), news tone stance, confidence %, and media reasoning.

### 5. Risk Analyst (`riskAgent.ts`)
- **Focus**: Personal portfolio safety and concentration risk.
- **Evaluates**: User's actual portfolio holdings, target stock weight %, target sector weight %, portfolio weighted beta, and Herfindahl Concentration Index (HHI).
- **Output**: Risk score (0–10), risk level (*Low/Moderate/High*), and portfolio exposure reasoning.

---

## ⚖️ Portfolio-Aware Decision Synthesis Engine (`decisionEngine.ts`)

A key innovation of Finora is that **stock analysis is never performed in isolation**. 

Even if a stock receives a strong `BUY` signal from Fundamental and Technical agents, the **Decision Synthesis Engine** evaluates the purchase against the user's actual portfolio state:

$$\text{RawConsensus} = 0.30(\text{Fundamental}) + 0.25(\text{Quant}) + 0.20(\text{Market}) + 0.15(\text{Sentiment}) + 0.10(\text{Risk})$$

### Personalized Concentration Penalty
- **Single Stock Weight**: If purchasing the stock makes it exceed **15%** of the user's total portfolio, a concentration penalty (-1.8 pts) is applied.
- **Sector Exposure Weight**: If the target stock's sector exceeds **30%** of the user's portfolio, a sector penalty (-1.2 pts) is applied.
- **Stance Mapping**:
  - `BUY` ($\ge 7.6$)
  - `ACCUMULATE` ($6.4 - 7.5$)
  - `HOLD` ($5.0 - 6.3$)
  - `REDUCE` ($3.8 - 4.9$)
  - `SELL` ($< 3.8$)

---

## 🔗 Unified Integration Layer (`src/integration/`)

The integration layer bridges personal cashflows with market intelligence:

1. **Context Builder ([`contextBuilder.ts`](file:///c:/Users/Srinath/PROJECT/MUTEKI/Finora-Financial-Intelligence/artifacts/finora-financial-intelligence/src/integration/contextBuilder.ts))**: Aggregates liquid cash, monthly cashflow, 30-day upcoming recurring bills, 3-month emergency buffer, active goals, portfolio holdings, sector weights, beta, and market snapshot into `buildUnifiedContext(state)`.
2. **Affordability Engine ([`affordabilityEngine.ts`](file:///c:/Users/Srinath/PROJECT/MUTEKI/Finora-Financial-Intelligence/artifacts/finora-financial-intelligence/src/integration/affordabilityEngine.ts))**: Evaluates whether a purchase leaves liquid cash, 30-day recurring obligations, and the 3-month emergency buffer intact.
3. **Portfolio Impact Engine ([`portfolioImpactEngine.ts`](file:///c:/Users/Srinath/PROJECT/MUTEKI/Finora-Financial-Intelligence/artifacts/finora-financial-intelligence/src/integration/portfolioImpactEngine.ts))**: Simulates sector weight changes, HHI concentration shifts, and portfolio beta changes.
4. **Unified Decision Engine ([`unifiedDecisionEngine.ts`](file:///c:/Users/Srinath/PROJECT/MUTEKI/Finora-Financial-Intelligence/artifacts/finora-financial-intelligence/src/integration/unifiedDecisionEngine.ts))**: Merges QuantAgents analysis with personal affordability to surface explicit personalized advice.

---

## 🌐 Complete Feature & Route Directory (16 Routes)

| Route | Page | Functionality & Capabilities |
| :--- | :--- | :--- |
| `/overview` | **Overview** | Live Net Worth, available cash, 6-month cashflow area chart, health score (0–100), automated next actions. |
| `/transactions` | **Transactions** | Complete ledger with live search, category/account filters, date sorting, CSV importer, and add/edit/delete modals. |
| `/accounts` | **Accounts** | Bank, credit card, cash, and investment accounts with live balances computed from ledger transactions. |
| `/budgets` | **Budgets** | Monthly spending limits with day-of-month pace indicators (% used vs time passed) and overspend risk alerts. |
| `/goals` | **Goals** | Milestone savings progress, area projection charts, required monthly contribution to target date, and top-up modal. |
| `/portfolio` | **Portfolio** | Live holdings valuation, return %, sector allocation pie chart, and position manager. |
| `/stock-analysis` | **Stock Analysis** | NSE stock explorer with 52W range, valuation metrics, QuantAgents consensus stance, and watchlist action. |
| `/agents` | **QuantAgents Room** | Interactive live agent room displaying reasoning traces for Fundamental, Quant, Market, Sentiment, and Risk agents. |
| `/market` | **Market Pulse** | Live NIFTY 50 / BANK NIFTY / SENSEX metrics, sector heatmap, FII/DII net flows, and market breadth ratio. |
| `/institutional` | **Institutional** | Disclosed bulk/block deals log, institutional flow tracker, and filter toggle. |
| `/risk` | **Risk Room** | Weighted portfolio beta, estimated annual volatility, Herfindahl concentration index (HHI), and downside VAR. |
| `/simulator` | **Scenario Simulator** | Stress-testing simulator for market shocks (broad correction, crash, rate hikes) with custom percentage slider. |
| `/reports` | **Reports** | Multi-period cashflow analytics (1M, 6M, 1Y), category breakdown, and exportable text report. |
| `/assistant` | **Ask Finora AI** | Context-aware AI assistant answering natural language queries using real-time application state. |
| `/recurring` | **Recurring** | Subscription audit tracking annual commitments, frequency normalization, and auto-detected subscriptions. |
| `/profile` | **Profile** | User identity, health score radar, risk tolerance profile, and savings behavior metrics. |

---

## 💻 Tech Stack & Architecture

- **Frontend Core**: React 19, TypeScript 5.9, Vite 7, Wouter routing
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Data Visualization**: Recharts (Cashflow charts, stock price trend, goal projections)
- **State Layer**: Single source of truth React Context + `useReducer` with `localStorage` persistence
- **Domain Engines**: Pure TypeScript calculation engines for Transactions, Budgets, Goals, Investments, Recurring, and Health Scores

---

## 🛠️ Quick Start & Local Execution

### Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **pnpm**: v11.x

### Running the Application

```bash
# 1. Install dependencies across pnpm workspace
pnpm install --ignore-scripts --prefer-offline

# 2. Start the Finora application (Frontend dev server)
pnpm --filter @workspace/finora-financial-intelligence run dev
```

Open `http://localhost:5173` in your browser.

### Typecheck & Build Commands

```bash
# Full TypeScript verification across workspace (0 errors)
pnpm --filter @workspace/finora-financial-intelligence run typecheck

# Production build into dist
pnpm --filter @workspace/finora-financial-intelligence run build
```

---

## ☁️ Deploying to Vercel

Finora is pre-configured for seamless Vercel deployment via `vercel.json`.

### Option A: Import Git Repository (Recommended)
1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm --filter @workspace/finora-financial-intelligence run build`
   - **Output Directory**: `artifacts/finora-financial-intelligence/dist`
4. Click **Deploy**.

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
```
