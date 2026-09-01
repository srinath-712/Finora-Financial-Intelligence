import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
  SEED_USER, SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_BUDGETS,
  SEED_GOALS, SEED_HOLDINGS, SEED_WATCHLIST, SEED_RECURRING, SEED_MARKET,
} from "./data";
import type {
  User, Account, Transaction, BudgetDefinition,
  Goal, Holding, WatchlistItem, RecurringItem, MarketSnapshot,
} from "../engine/types";
import { reducer, type AppAction } from "./reducer";
import { saveState, loadState } from "./persistence";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface AIMessage {
  from: "ai" | "user";
  text: string;
}

export interface AppState {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: BudgetDefinition[];
  goals: Goal[];
  holdings: Holding[];
  watchlist: WatchlistItem[];
  recurring: RecurringItem[];
  market: MarketSnapshot;
  aiMessages: AIMessage[];
  categoryFilter: string;
}

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: AppState = {
  user: SEED_USER,
  accounts: SEED_ACCOUNTS,
  transactions: SEED_TRANSACTIONS,
  budgets: SEED_BUDGETS,
  goals: SEED_GOALS,
  holdings: SEED_HOLDINGS,
  watchlist: SEED_WATCHLIST,
  recurring: SEED_RECURRING,
  market: SEED_MARKET,
  aiMessages: [
    {
      from: "ai",
      text: "Hi Aarav. I have your full financial picture and today's NSE tape ready. Ask me anything — portfolio, spending, goals, or a what-if.",
    },
  ],
  categoryFilter: "All",
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatchRaw] = useReducer(reducer, defaultState, (initial) => {
    const saved = loadState();
    return saved ?? initial;
  });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Wrap dispatch to keep type
  const dispatch = useCallback(
    (action: AppAction) => dispatchRaw(action),
    []
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}
