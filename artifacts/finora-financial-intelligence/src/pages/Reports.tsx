import { useStore } from "../store/context";
import {
  getMonthlyChartData, getMonthlyIncome, getMonthlyExpenses, getMonthlySaved,
  getSavingsRate, getBudgetsWithSpend, getGoalsOnTrack,
} from "../store/selectors";
import { Card, SectionTitle, Metric, CashflowChart, Button, money } from "../components/primitives";
import { ArrowDownLeft, ArrowUpRight, Download, IndianRupee, Target } from "lucide-react";
import { useState } from "react";

export function Reports() {
  const { state } = useStore();
  const [period, setPeriod] = useState("This month");

  const months = period === "This month" ? 1 : period === "6 months" ? 6 : 12;

  // For aggregate stats we look at the last N months
  let totalIncome = 0;
  let totalExpenses = 0;
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    totalIncome += getMonthlyIncome(state, iso);
    totalExpenses += getMonthlyExpenses(state, iso);
  }
  const totalSaved = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;
  const goalsOnTrack = getGoalsOnTrack(state);
  const chartData = getMonthlyChartData(state, Math.min(months, 6));
  const budgets = getBudgetsWithSpend(state);

  return (
    <>
      <SectionTitle
        eyebrow="Understand / patterns"
        title="Reports"
        sub="The story behind your numbers, not just the numbers."
        action={
          <div className="flex rounded-xl border border-[#ddd6c8] bg-[#fbfaf5] p-1">
            {["This month", "6 months", "1 year"].map((x) => (
              <button
                key={x}
                onClick={() => setPeriod(x)}
                data-testid={`button-period-${x.replaceAll(" ", "-")}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${period === x ? "bg-[#20293c] text-white" : "text-[#747773]"}`}
              >
                {x}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Income"       value={money(totalIncome)}   detail={`${period} · all sources`}   icon={ArrowDownLeft} accent="#167b73" />
        <Metric label="Expenses"     value={money(totalExpenses)} detail={`${period} · all categories`} icon={ArrowUpRight}  accent="#ed9d3d" />
        <Metric label="Saved"        value={money(totalSaved)}    detail={`${savingsRate.toFixed(1)}% savings rate`} icon={IndianRupee} accent="#5278c5" />
        <Metric label="Goal progress" value={`${Math.round((goalsOnTrack / Math.max(1, state.goals.length)) * 100)}%`} detail={`${goalsOnTrack} of ${state.goals.length} on plan`} icon={Target} accent="#ca6471" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5">
          <SectionTitle eyebrow={`${period} view`} title="Income vs expense" />
          <CashflowChart data={chartData} height={280} />
        </Card>

        <Card className="p-5">
          <SectionTitle eyebrow="Category analysis" title="Where spend went" />
          <div className="space-y-4">
            {budgets.slice(0, 5).map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{b.name}</span>
                  <b>{money(b.spent)}</b>
                </div>
                <div className="h-2 rounded-full bg-[#eee8dc]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, b.limit > 0 ? (b.spent / b.limit) * 100 : 0)}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              // Create a simple text export of the report
              const lines = [
                `Finora Report — ${period}`,
                `Income: ${money(totalIncome)}`,
                `Expenses: ${money(totalExpenses)}`,
                `Saved: ${money(totalSaved)}`,
                `Savings rate: ${savingsRate.toFixed(1)}%`,
                "",
                "Budget breakdown:",
                ...budgets.map((b) => `  ${b.name}: ${money(b.spent)} / ${money(b.limit)} (${b.pct}%)`),
              ].join("\n");
              const blob = new Blob([lines], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `finora-report-${period.replaceAll(" ", "-")}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            testId="button-export-report"
          >
            <Download size={15} /> Export this report
          </Button>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {/* Best period */}
        <Card className="p-5">
          <p className="text-xs text-[#888b85]">Best month</p>
          <b className="mt-2 block font-display text-2xl">
            {chartData.reduce((best, d) => (d.income - d.out > best.income - best.out ? d : best), chartData[0] ?? { month: "—", income: 0, out: 0 }).month}
          </b>
          <p className="mt-1 text-xs text-[#167b73]">
            {money(Math.max(...chartData.map((d) => d.income - d.out), 0))} saved
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#888b85]">Biggest win</p>
          <b className="mt-2 block font-display text-2xl">
            {budgets.reduce((best, b) => ((b.limit - b.spent) > (best.limit - best.spent) ? b : best), budgets[0] ?? { name: "—", limit: 0, spent: 0 }).name}
          </b>
          <p className="mt-1 text-xs text-[#167b73]">Most under-budget</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#888b85]">Savings rate</p>
          <b className="mt-2 block font-display text-2xl">{savingsRate.toFixed(1)}%</b>
          <p className="mt-1 text-xs text-[#167b73]">{period}</p>
        </Card>
      </div>
    </>
  );
}
