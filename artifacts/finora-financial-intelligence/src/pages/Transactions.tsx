import { useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, CircleHelp, Database,
  Edit3, Filter, Search, Trash2, Upload,
} from "lucide-react";
import { useStore } from "../store/context";
import { Card, SectionTitle, Button, money } from "../components/primitives";
import { TransactionModal, ImportModal } from "../components/modals/TransactionModal";
import type { Transaction, TransactionCategory } from "../engine/types";
import { formatDisplayDate } from "../store/data";

const ALL_CATEGORIES: (TransactionCategory | "All")[] = [
  "All", "Income", "Groceries", "Transport", "Dining",
  "Subscriptions", "Investments", "Shopping", "Housing",
  "Health", "Utilities", "Entertainment", "Personal", "Other",
];

type SortKey = "date" | "amount" | "merchant";

export function Transactions({ categoryFilter }: { categoryFilter?: string }) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(categoryFilter || "All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [sort, setSort] = useState<SortKey>("date");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);

  // Sync external categoryFilter prop
  const activeFilter = categoryFilter && categoryFilter !== filter ? categoryFilter : filter;

  const filtered = state.transactions
    .filter((t) => {
      const matchCat = activeFilter === "All" || t.category === activeFilter;
      const matchAcc = accountFilter === "All" || t.account === accountFilter;
      const q = query.toLowerCase();
      const matchQ = !q || `${t.merchant} ${t.category} ${t.account}`.toLowerCase().includes(q);
      return matchCat && matchAcc && matchQ;
    })
    .sort((a, b) => {
      if (sort === "date") return a.date > b.date ? -1 : 1;
      if (sort === "amount") return b.amount - a.amount;
      return a.merchant.localeCompare(b.merchant);
    });

  const accountName = (id: string) =>
    state.accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <>
      <SectionTitle
        eyebrow="Money / ledger"
        title="Transactions"
        sub={`${filtered.length} movements`}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setImporting(true)} testId="button-import-csv">
              <Upload size={15} />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[#e7e0d3] p-4 md:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94968f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchants, accounts, categories..."
              data-testid="input-transaction-search"
              className="h-10 w-full rounded-xl border border-[#ded7ca] bg-[#f8f6ef] pl-9 pr-3 text-sm outline-none focus:border-[#167b73]"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="select-transaction-category"
            className="h-10 rounded-xl border border-[#ded7ca] bg-[#f8f6ef] px-3 text-sm outline-none"
          >
            {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            data-testid="select-transaction-account"
            className="h-10 rounded-xl border border-[#ded7ca] bg-[#f8f6ef] px-3 text-sm outline-none"
          >
            <option value="All">All accounts</option>
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            data-testid="select-transaction-sort"
            className="h-10 rounded-xl border border-[#ded7ca] bg-[#f8f6ef] px-3 text-sm outline-none"
          >
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
            <option value="merchant">Sort: Merchant</option>
          </select>
        </div>

        {/* Table header */}
        <div className="hidden grid-cols-[1.6fr_1fr_1.2fr_1fr_30px] gap-3 bg-[#f4f0e7] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#878a83] md:grid">
          <span>Merchant</span>
          <span>Category</span>
          <span>Account</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {/* Rows */}
        <div>
          {filtered.map((tx) => (
            <div
              key={tx.id}
              data-testid={`row-transaction-${tx.id}`}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#eee8dc] px-4 py-3.5 last:border-0 md:grid-cols-[1.6fr_1fr_1.2fr_1fr_30px] md:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tx.type === "credit" ? "bg-[#dcefe6] text-[#167b73]" : "bg-[#eeeae0] text-[#6e746f]"}`}>
                  {tx.type === "credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <span className="min-w-0">
                  <b className="block truncate text-sm">{tx.merchant}</b>
                  <small className="text-[11px] text-[#8b8d87]">{formatDisplayDate(tx.date)}</small>
                </span>
              </div>
              <span className="hidden text-xs text-[#626a69] md:block">{tx.category}</span>
              <span className="hidden truncate text-xs text-[#626a69] md:block">{accountName(tx.account)}</span>
              <span className={`text-right font-data text-xs font-bold ${tx.type === "credit" ? "text-[#167b73]" : "text-[#263043]"}`}>
                {tx.type === "credit" ? "+" : "-"}{money(tx.amount)}
              </span>
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => setEditing(tx)}
                  className="rounded-lg p-1.5 text-[#7c817a] hover:bg-[#eeeae0] hover:text-[#167b73]"
                  data-testid={`button-edit-transaction-${tx.id}`}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: "DELETE_TRANSACTION", payload: { id: tx.id } })}
                  className="rounded-lg p-1.5 text-[#7c817a] hover:bg-[#f8dedc] hover:text-[#a83d39]"
                  data-testid={`button-delete-transaction-${tx.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Database className="mx-auto text-[#b5b1a6]" />
            <p className="mt-3 text-sm font-bold">No movements match that filter</p>
            <p className="mt-1 text-xs text-[#888b85]">Try a different merchant or category.</p>
          </div>
        )}
      </Card>

      <p className="mt-3 flex items-center gap-2 text-xs text-[#8a8b84]">
        <CircleHelp size={13} /> Imported data stays in this browser for the prototype.
      </p>

      {/* Modals */}
      {editing && (
        <TransactionModal transaction={editing} onClose={() => setEditing(null)} />
      )}
      {adding && (
        <TransactionModal onClose={() => setAdding(false)} />
      )}
      {importing && (
        <ImportModal onClose={() => setImporting(false)} />
      )}
    </>
  );
}
