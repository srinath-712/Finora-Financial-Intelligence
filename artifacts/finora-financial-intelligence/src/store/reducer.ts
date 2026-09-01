import type { AppState } from "./context";

// ─── Actions ──────────────────────────────────────────────────────────────────

import type {
  Transaction, Account, BudgetDefinition, Goal, Holding, WatchlistItem, RecurringItem,
} from "../engine/types";

export type AppAction =
  // Transactions
  | { type: "ADD_TRANSACTION";    payload: Transaction }
  | { type: "EDIT_TRANSACTION";   payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: { id: string } }
  // Accounts
  | { type: "ADD_ACCOUNT";    payload: Account }
  | { type: "EDIT_ACCOUNT";   payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: { id: string } }
  // Budgets
  | { type: "ADD_BUDGET";    payload: BudgetDefinition }
  | { type: "EDIT_BUDGET";   payload: BudgetDefinition }
  | { type: "DELETE_BUDGET"; payload: { id: string } }
  // Goals
  | { type: "ADD_GOAL";            payload: Goal }
  | { type: "EDIT_GOAL";           payload: Goal }
  | { type: "DELETE_GOAL";         payload: { id: string } }
  | { type: "CONTRIBUTE_TO_GOAL";  payload: { id: string; amount: number } }
  // Holdings
  | { type: "ADD_HOLDING";    payload: Holding }
  | { type: "EDIT_HOLDING";   payload: Holding }
  | { type: "REMOVE_HOLDING"; payload: { id: string } }
  // Watchlist
  | { type: "ADD_TO_WATCHLIST";      payload: WatchlistItem }
  | { type: "REMOVE_FROM_WATCHLIST"; payload: { id: string } }
  // Recurring
  | { type: "ADD_RECURRING";    payload: RecurringItem }
  | { type: "DELETE_RECURRING"; payload: { id: string } }
  // UI
  | { type: "SET_CATEGORY_FILTER"; payload: string }
  // AI messages
  | { type: "ADD_AI_MESSAGE"; payload: { from: "ai" | "user"; text: string } }
  | { type: "CLEAR_AI_MESSAGES" }
  // Hydrate from localStorage
  | { type: "HYDRATE"; payload: AppState };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ── Transactions ──────────────────────────────────────────────────────────
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload.id),
      };

    // ── Accounts ──────────────────────────────────────────────────────────────
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };

    case "EDIT_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "DELETE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload.id),
        // Also remove transactions tied to this account
        transactions: state.transactions.filter((t) => t.account !== action.payload.id),
      };

    // ── Budgets ───────────────────────────────────────────────────────────────
    case "ADD_BUDGET":
      return { ...state, budgets: [...state.budgets, action.payload] };

    case "EDIT_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };

    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload.id),
      };

    // ── Goals ─────────────────────────────────────────────────────────────────
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };

    case "EDIT_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };

    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload.id),
      };

    case "CONTRIBUTE_TO_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id
            ? { ...g, current: Math.min(g.current + action.payload.amount, g.target) }
            : g
        ),
      };

    // ── Holdings ──────────────────────────────────────────────────────────────
    case "ADD_HOLDING":
      return { ...state, holdings: [...state.holdings, action.payload] };

    case "EDIT_HOLDING":
      return {
        ...state,
        holdings: state.holdings.map((h) =>
          h.id === action.payload.id ? action.payload : h
        ),
      };

    case "REMOVE_HOLDING":
      return {
        ...state,
        holdings: state.holdings.filter((h) => h.id !== action.payload.id),
      };

    // ── Watchlist ─────────────────────────────────────────────────────────────
    case "ADD_TO_WATCHLIST":
      if (state.watchlist.some((w) => w.symbol === action.payload.symbol)) return state;
      return { ...state, watchlist: [...state.watchlist, action.payload] };

    case "REMOVE_FROM_WATCHLIST":
      return {
        ...state,
        watchlist: state.watchlist.filter((w) => w.id !== action.payload.id),
      };

    // ── Recurring ─────────────────────────────────────────────────────────────
    case "ADD_RECURRING":
      return { ...state, recurring: [...state.recurring, action.payload] };

    case "DELETE_RECURRING":
      return {
        ...state,
        recurring: state.recurring.filter((r) => r.id !== action.payload.id),
      };

    // ── UI ────────────────────────────────────────────────────────────────────
    case "SET_CATEGORY_FILTER":
      return { ...state, categoryFilter: action.payload };

    // ── AI Messages ───────────────────────────────────────────────────────────
    case "ADD_AI_MESSAGE":
      return {
        ...state,
        aiMessages: [...state.aiMessages, action.payload],
      };

    case "CLEAR_AI_MESSAGES":
      return { ...state, aiMessages: [] };

    // ── Hydrate ───────────────────────────────────────────────────────────────
    case "HYDRATE":
      return action.payload;

    default:
      return state;
  }
}
