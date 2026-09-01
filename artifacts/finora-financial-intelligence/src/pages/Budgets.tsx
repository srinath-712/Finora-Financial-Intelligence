import { useState } from "react";
import { Flame, MoreHorizontal, Plus } from "lucide-react";
import { useStore } from "../store/context";
import {
  getBudgetsWithSpend, getTotalBudgetLimit, getTotalBudgetSpent, getMonthlyExpenses,
} from "../store/selectors";
import { Card, SectionTitle, Button, Badge, money, compact } from "../components/primitives";
import { BudgetModal } from "../components/modals/BudgetModal";
import type { BudgetDefinition } from "../store/data";
import { currentMonthYear } from "../store/data";

export function Budgets({ go, setCategory }: { go: (p: string) => void; setCategory: (c: string) => void }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BudgetDefinition | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const budgets = getBudgetsWithSpend(state);
  const totalLimit = getTotalBudgetLimit(state);
  const totalSpent = getTotalBudgetSpent(state);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remaining = Math.max(0, totalLimit - totalSpent);
  const overBudget = budgets.filter((b) => b.overspent);
  const nearLimit = budgets.filter((b) => !b.overspent && b.pct > 80);

  return (
    <>
      <SectionTitle
        eyebrow="Money / guardrails"
        title="Budgets"
        sub={`${currentMonthYear()} is moving at a thoughtful pace.`}
        action={
          <Button primary onClick={() => setAdding(true)} testId="button-new-budget">
            <Plus size={15} /> New budget
          </Button>
        }
      />

      {/* Summary banner */}
      <Card className="mb-5 overflow-hidden bg-[#20293c] p-5 text-[#f7f2e6] md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[.16em] text-[#f4d65e]">{currentMonthYear()}</p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              {money(totalSpent)}{" "}
              <span className="font-sans text-sm font-normal text-[#aeb8c5]">of {money(totalLimit)} spent</span>
            </h2>
            <p className="mt-2 text-sm text-[#aeb8c5]">
              You are {totalPct}% through your monthly budget envelope.
            </p>
          </div>
          <div className="text-left md:text-right">
            <b className="font-data text-2xl text-[#f4d65e]">{money(remaining)}</b>
            <p className="text-xs text-[#aeb8c5]">remaining runway</p>
          </div>
        </div>
        <div className="mt-6 h-2 rounded-full bg-[#3b475d]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, totalPct)}%`, background: totalPct > 90 ? "#ca6471" : "#f4d65e" }}
          />
        </div>
      </Card>

      {/* Budget cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((b, i) => (
          <Card
            key={b.id}
            onClick={() => {
              setCategory(b.category);
              go("/transactions");
            }}
            className="p-5"
            testId={`card-budget-${i}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: b.color }} />
                <b className="text-sm">{b.name}</b>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === b.id ? null : b.id);
                  }}
                  data-testid={`button-budget-menu-${i}`}
                >
                  <MoreHorizontal size={17} className="text-[#91948d]" />
                </button>
                {menuOpen === b.id && (
                  <div className="absolute right-0 top-6 z-10 w-36 rounded-xl border border-[#e3ddcf] bg-[#fbfaf5] py-1 shadow-lg">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(b); setMenuOpen(null); }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-[#f1eee6]"
                    >
                      Edit budget
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_BUDGET", payload: { id: b.id } }); setMenuOpen(null); }}
                      className="w-full px-4 py-2 text-left text-xs text-[#a83d39] hover:bg-[#f8dedc]"
                    >
                      Delete budget
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className="font-display text-xl font-bold">{money(b.spent)}</p>
              <p className="text-xs text-[#888b85]">of {money(b.limit)}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#ebe7dc]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, b.pct)}%`, background: b.overspent ? "#bd514d" : b.color }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className={b.overspent ? "font-bold text-[#bd514d]" : b.pct > 80 ? "font-bold text-[#a86b19]" : "text-[#747773]"}>
                {b.pct}% used {b.overspent && "⚠️"}
              </span>
              <span className="text-[#747773]">{money(b.remaining)} left</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert banner */}
      {(overBudget.length > 0 || nearLimit.length > 0) && (
        <Card className="mt-5 p-5">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0cf] text-[#a86b19]">
              <Flame size={17} />
            </span>
            <div>
              <b className="text-sm">
                {overBudget.length > 0
                  ? `${overBudget.map((b) => b.name).join(", ")} exceeded the limit`
                  : `${nearLimit.map((b) => b.name).join(", ")} is approaching the limit`}
              </b>
              <p className="mt-1 text-xs leading-relaxed text-[#747773]">
                {overBudget.length > 0
                  ? "Consider reducing spend in the overspent categories or adjusting the budget limit."
                  : "A small slowdown now keeps the month on track."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      {adding && <BudgetModal onClose={() => setAdding(false)} />}
      {editing && <BudgetModal budget={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
