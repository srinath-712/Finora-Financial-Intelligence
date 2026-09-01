import { useStore } from "../store/context";
import { Pencil } from "lucide-react";
import { Card, SectionTitle, Button, money } from "../components/primitives";
import {
  getNetWorth, getPortfolioValue, getMonthlySaved, getSavingsRate, getFinancialHealthScore,
} from "../store/selectors";

export function Profile() {
  const { state } = useStore();
  const netWorth = getNetWorth(state);
  const portfolioValue = getPortfolioValue(state);
  const saved = getMonthlySaved(state);
  const savingsRate = getSavingsRate(state);
  const healthScore = getFinancialHealthScore(state);
  const { user } = state;

  return (
    <>
      <SectionTitle
        eyebrow="Understand / identity"
        title="Your financial profile"
        sub="The habits behind your dashboard."
        action={<Button testId="button-edit-profile"><Pencil size={15} /> Edit profile</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        {/* Identity card */}
        <Card className="bg-[#20293c] p-6 text-[#f7f2e6]">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ed9d3d] font-display text-xl font-bold text-[#20293c]">
              {user.initials}
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">{user.name}</h2>
              <p className="text-sm text-[#aeb8c5]">{user.role} · {user.city}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-[#3b475d] pt-5">
            <p className="font-data text-[10px] uppercase tracking-widest text-[#f4d65e]">Money health</p>
            <div className="mt-3 flex items-end gap-3">
              <b className="font-display text-5xl text-[#f4d65e]">{healthScore}</b>
              <span className="pb-1 text-sm text-[#aeb8c5]">/ 100</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#bdc6d0]">
              {healthScore >= 80
                ? "Consistent saving and thoughtful investing. Your next unlock is a bigger cash buffer."
                : healthScore >= 60
                ? "Good momentum. Focus on reducing budget overruns to move to the next tier."
                : "Room to grow. Start by building an emergency fund and staying within budgets."}
            </p>
          </div>
        </Card>

        {/* Profile grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { l: "Saving behaviour",  v: "The Builder",          d: "You save before you spend.",            c: "#167b73" },
            { l: "Investment style",  v: "Quality growth",        d: "Patient, but not passive.",              c: "#5278c5" },
            { l: "Risk tolerance",    v: user.riskTolerance,      d: "Can handle a 15% drawdown.",             c: "#ed9d3d" },
            { l: "Primary goal",      v: user.primaryGoal,        d: "Work optional by 45.",                   c: "#ca6471" },
            { l: "Monthly savings",   v: money(saved),            d: `${savingsRate.toFixed(1)}% of take-home.`, c: "#8d75b9" },
            { l: "Portfolio shape",   v: `${state.holdings.length} holdings`, d: `${[...new Set(state.holdings.map(h => h.sector))].length} sectors · low churn.`, c: "#55a889" },
          ].map((x) => (
            <Card key={x.l} className="p-5">
              <span className="h-2 w-8 rounded-full" style={{ background: x.c }} />
              <p className="mt-4 text-xs uppercase tracking-wider text-[#888b85]">{x.l}</p>
              <b className="mt-1 block font-display text-xl">{x.v}</b>
              <p className="mt-1 text-xs text-[#747773]">{x.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
