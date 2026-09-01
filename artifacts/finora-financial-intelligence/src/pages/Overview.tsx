import { Sparkles, IndianRupee, Wallet, TrendingUp, ShieldCheck, ShoppingBag, ChevronRight, Target, Flame, BrainCircuit } from "lucide-react";
import { useStore } from "../store/context";
import {
  getNetWorth, getAvailableCash, getPortfolioValue, getMonthlyChartData,
  getMonthlyIncome, getMonthlyExpenses, getMonthlySaved, getSavingsRate,
  getFinancialHealthScore, getGoalsOnTrack, getBudgetsWithSpend,
} from "../store/selectors";
import { Card, Metric, SectionTitle, CashflowChart, compact, money } from "../components/primitives";
import { formatDisplayDate } from "../store/data";

export function Overview({ go }: { go: (p: string) => void }) {
  const { state } = useStore();

  const netWorth = getNetWorth(state);
  const available = getAvailableCash(state);
  const portfolioValue = getPortfolioValue(state);
  const healthScore = getFinancialHealthScore(state);
  const chartData = getMonthlyChartData(state, 6);
  const income = getMonthlyIncome(state);
  const expenses = getMonthlyExpenses(state);
  const saved = getMonthlySaved(state);
  const savingsRate = getSavingsRate(state);
  const goalsOnTrack = getGoalsOnTrack(state);
  const budgets = getBudgetsWithSpend(state);
  const nearLimit = budgets.filter((b) => b.pct > 75 && !b.overspent);
  const overBudget = budgets.filter((b) => b.overspent);
  const recentTx = [...state.transactions]
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(1, 5);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const highestAlertBudget = nearLimit[0] ?? overBudget[0];

  return (
    <>
      <div className="animate-rise flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[.2em] text-[#167b73]">
            {dateStr} · Bengaluru
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em] md:text-[42px]">
            {greeting}, Aarav<span className="text-[#ed9d3d]">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#747773]">
            Your money is moving with intention. Here is the one-minute read on where you stand.
          </p>
        </div>
        <button
          onClick={() => go("/assistant")}
          data-testid="button-ask-finora"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167b73] px-3.5 py-2 text-sm font-semibold text-[#fbfaf5] transition-all hover:bg-[#126b64] active:scale-[.98]"
        >
          <Sparkles size={15} /> Ask Finora
        </button>
      </div>

      {/* Metrics */}
      <div className="mt-7 grid gap-4 animate-rise-2 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Net worth"
          value={compact(netWorth)}
          detail={`+${money(saved)} this month`}
          trend={saved > 0 ? "up" : "down"}
          icon={IndianRupee}
          accent="#167b73"
          onClick={() => go("/accounts")}
        />
        <Metric
          label="Available to spend"
          value={money(available)}
          detail="after bills & investments"
          trend={available > 0 ? "up" : "down"}
          icon={Wallet}
          accent="#ed9d3d"
        />
        <Metric
          label="Investments"
          value={compact(portfolioValue)}
          detail="across your portfolio"
          trend="up"
          icon={TrendingUp}
          accent="#5278c5"
          onClick={() => go("/portfolio")}
        />
        <Metric
          label="Money health"
          value={`${healthScore} / 100`}
          detail={healthScore > 75 ? "strong, with one watch-out" : "room to improve"}
          trend={healthScore >= 60 ? "up" : "down"}
          icon={ShieldCheck}
          accent="#ca6471"
          onClick={() => go("/risk")}
        />
      </div>

      {/* Chart + insight cards */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
        <Card className="animate-rise-2 p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[.16em] text-[#167b73]">Cashflow rhythm</p>
              <h2 className="mt-1 font-display text-xl font-bold">
                {income > expenses ? "Income outpaced spending" : "Spending outpaced income"}
              </h2>
              <p className="mt-1 text-xs text-[#747773]">
                Last 6 months · your savings rate is{" "}
                <b className="text-[#167b73]">{savingsRate.toFixed(1)}%</b>
              </p>
            </div>
            <div className="flex gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#167b73]" />Income</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ed9d3d]" />Outflow</span>
            </div>
          </div>
          <div className="mt-4"><CashflowChart data={chartData} height={240} /></div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eee8dc] pt-3 text-xs">
            <span className="text-[#747773]">This month's savings</span>
            <b className="font-data text-[#167b73]">
              {money(saved)}{" "}
              <span className="font-sans font-normal text-[#747773]">
                · {savingsRate.toFixed(1)}% savings rate
              </span>
            </b>
          </div>
        </Card>

        <div className="space-y-5">
          {/* Finora insight */}
          <Card className="animate-rise-3 overflow-hidden bg-[#20293c] p-5 text-[#f7f2e6]">
            <div className="flex items-center gap-2 text-[#f4d65e]">
              <Sparkles size={16} />
              <span className="font-data text-[10px] uppercase tracking-[.16em]">Finora noticed</span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold leading-tight">
              Your investment engine is doing the heavy lifting.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#b9c2cc]">
              {money(saved)} of this month's wealth gain came from disciplined saving and your portfolio. Keep compounding.
            </p>
            <button
              onClick={() => go("/portfolio")}
              className="mt-5 text-xs font-bold text-[#f4d65e]"
              data-testid="button-insight-portfolio"
            >
              View portfolio pulse →
            </button>
          </Card>

          {/* This month */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">This month</h2>
              <button onClick={() => go("/reports")} className="text-xs font-bold text-[#167b73]" data-testid="button-view-report">
                Full report
              </button>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <div
                className="relative h-24 w-24 rounded-full"
                style={{ background: `conic-gradient(#167b73 0 ${healthScore}%, #eee5d5 ${healthScore}% 100%)` }}
              >
                <div className="absolute inset-2 flex items-center justify-center rounded-full bg-[#fbfaf5] font-display text-xl font-bold">
                  {healthScore}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <p><span className="font-bold text-[#167b73]">{money(saved)}</span> saved</p>
                <p><span className="font-bold text-[#ed9d3d]">{money(expenses)}</span> spent</p>
                <p className="text-[#747773]">{goalsOnTrack} of {state.goals.length} goals on track</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions + Recent Transactions */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <SectionTitle eyebrow="Next best actions" title="Keep the good streak" sub="Small moves, compounding quietly." />
          <div className="space-y-3">
            {[
              {
                icon: Target,
                title: "Top up your emergency fund",
                copy: `${money(Math.max(0, 300000 - (state.goals.find((g) => g.name.toLowerCase().includes("emergency"))?.current ?? 0)))} more gets you to full cover.`,
                path: "/goals",
                tone: "yellow",
              },
              highestAlertBudget
                ? {
                    icon: Flame,
                    title: `${highestAlertBudget.name} is ${highestAlertBudget.pct}% through its limit`,
                    copy: `You have ${money(highestAlertBudget.remaining)} left this month.`,
                    path: "/budgets",
                    tone: "warning",
                  }
                : {
                    icon: Flame,
                    title: "All budgets are on track",
                    copy: "Great discipline this month.",
                    path: "/budgets",
                    tone: "positive",
                  },
              { icon: BrainCircuit, title: "A new market read is ready", copy: "QuantAgents updated its portfolio thesis.", path: "/agents", tone: "positive" },
            ].map((x, i) => (
              <button
                key={x.title}
                onClick={() => go(x.path)}
                data-testid={`button-action-${i}`}
                className="flex w-full items-center gap-3 rounded-xl border border-[#ebe5d9] p-3 text-left transition hover:bg-[#f3efe6]"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${x.tone === "yellow" ? "bg-[#fff0b4] text-[#7c6a1e]" : x.tone === "warning" ? "bg-[#fff0cf] text-[#a86b19]" : "bg-[#dcefe6] text-[#16725f]"}`}>
                  <x.icon size={17} />
                </span>
                <span className="flex-1">
                  <b className="block text-sm">{x.title}</b>
                  <small className="text-xs text-[#747773]">{x.copy}</small>
                </span>
                <ChevronRight size={16} className="text-[#9b9e98]" />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <SectionTitle eyebrow="Recent movement" title="Latest transactions" />
            <button onClick={() => go("/transactions")} className="text-xs font-bold text-[#167b73]" data-testid="button-view-transactions">See all</button>
          </div>
          <div className="-mt-1 divide-y divide-[#eee8dc]">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eeeae0]">
                  <ShoppingBag size={15} className="text-[#6c756f]" />
                </span>
                <span className="flex-1">
                  <b className="block text-sm">{tx.merchant}</b>
                  <small className="text-[11px] text-[#888b85]">{tx.category} · {formatDisplayDate(tx.date)}</small>
                </span>
                <span className={`font-data text-xs font-bold ${tx.type === "credit" ? "text-[#167b73]" : "text-[#263043]"}`}>
                  {tx.type === "credit" ? "+" : "-"}{money(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
