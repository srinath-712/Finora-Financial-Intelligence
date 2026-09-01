import { useState } from "react";
import { ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { useStore } from "../store/context";
import { getPortfolioValue, getAvailableCash } from "../store/selectors";
import { Card, SectionTitle, Button, money } from "../components/primitives";

const SCENARIOS: Record<string, { label: string; shock: number; desc: string }> = {
  "Broad correction": { label: "Broad correction", shock: -4.8, desc: "Markets pull back broadly; your beta of 0.86 provides partial cushion." },
  "Market crash":     { label: "Market crash",     shock: -20.0, desc: "Severe drawdown. Your emergency fund covers 4+ months so you are not forced to sell." },
  "Rate increase":    { label: "Rate increase",    shock: -3.7, desc: "RBI hike pressures rate-sensitive names. Financials take the brunt." },
  "FII outflow":      { label: "FII outflow",      shock: -6.5, desc: "Foreign institutional selling hits mid-cap leaders hardest." },
  "Sector crash":     { label: "Sector crash",     shock: -8.0, desc: "If IT sector corrects 20%, your 22% IT exposure leads the loss." },
  "Bull rally":       { label: "Bull rally",       shock: +9.0, desc: "Risk-on environment. Your quality tilt means you participate fully." },
};

function monthRange(shock: number): string {
  if (shock > 0) return "—";
  const abs = Math.abs(shock);
  if (abs <= 5) return "3–6 months";
  if (abs <= 10) return "6–12 months";
  if (abs <= 15) return "12–18 months";
  return "18–30 months";
}

export function Simulator() {
  const { state } = useStore();
  const [scenario, setScenario] = useState("Broad correction");
  const [customShock, setCustomShock] = useState<number | null>(null);

  const portfolioValue = getPortfolioValue(state);
  const cash = getAvailableCash(state);
  const sc = SCENARIOS[scenario];
  const shock = customShock !== null ? customShock : sc.shock;
  const impact = (portfolioValue * shock) / 100;
  const newValue = portfolioValue + impact;

  return (
    <>
      <SectionTitle
        eyebrow="Markets / what-if"
        title="Scenario simulator"
        sub="A rehearsal for the moments that test conviction."
      />

      <div className="grid gap-5 lg:grid-cols-[.65fr_1.35fr]">
        {/* Scenario selector */}
        <Card className="p-5">
          <p className="font-data text-[10px] uppercase tracking-[.16em] text-[#167b73]">Choose a shock</p>
          <div className="mt-4 space-y-2">
            {Object.keys(SCENARIOS).map((x) => (
              <button
                key={x}
                onClick={() => { setScenario(x); setCustomShock(null); }}
                data-testid={`button-scenario-${x.toLowerCase().replaceAll(" ", "-")}`}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-bold ${scenario === x ? "border-[#167b73] bg-[#e7f1eb] text-[#167b73]" : "border-[#e5dfd2] hover:bg-[#f4f0e7]"}`}
              >
                {x}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          {/* Custom slider */}
          <div className="mt-5 border-t border-[#eee8dc] pt-4">
            <p className="mb-2 text-xs font-bold text-[#686f6c]">
              Custom shock: {customShock !== null ? `${customShock > 0 ? "+" : ""}${customShock}%` : "use preset"}
            </p>
            <input
              type="range"
              min="-30"
              max="30"
              step="0.5"
              value={customShock ?? shock}
              onChange={(e) => setCustomShock(Number(e.target.value))}
              className="w-full accent-[#167b73]"
              data-testid="slider-custom-shock"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#888b85]">
              <span>-30%</span>
              <span>0</span>
              <span>+30%</span>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="overflow-hidden">
          <div className="bg-[#20293c] p-6 text-[#f7f2e6] md:p-8">
            <p className="font-data text-[10px] uppercase tracking-[.18em] text-[#f4d65e]">
              If {scenario.toLowerCase()}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              {shock > 0 ? "Your patience pays." : "Your plan still holds."}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#bdc6d0]">
              {sc.desc} Based on your current {money(portfolioValue)} portfolio and {money(cash)} cash runway.
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#eee8dc] p-5 md:p-7">
            <div>
              <p className="text-xs text-[#888b85]">Estimated impact</p>
              <b className={`mt-1 block font-display text-xl ${impact >= 0 ? "text-[#167b73]" : "text-[#bd514d]"}`}>
                {impact >= 0 ? "+" : ""}{money(impact)}
              </b>
            </div>
            <div className="pl-4">
              <p className="text-xs text-[#888b85]">Portfolio change</p>
              <b className="mt-1 block font-display text-xl">
                {shock >= 0 ? "+" : ""}{shock.toFixed(1)}%
              </b>
            </div>
            <div className="pl-4">
              <p className="text-xs text-[#888b85]">Recovery estimate</p>
              <b className="mt-1 block font-display text-xl">{monthRange(shock)}</b>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-[#eee8dc] border-t border-[#eee8dc] p-5 md:p-7">
            <div>
              <p className="text-xs text-[#888b85]">Portfolio before</p>
              <b className="mt-1 block font-display text-xl">{money(portfolioValue)}</b>
            </div>
            <div className="pl-4">
              <p className="text-xs text-[#888b85]">Portfolio after</p>
              <b className={`mt-1 block font-display text-xl ${newValue < portfolioValue ? "text-[#bd514d]" : "text-[#167b73]"}`}>
                {money(newValue)}
              </b>
            </div>
          </div>

          <div className="border-t border-[#eee8dc] p-5 md:p-7">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0cf] text-[#a86b19]">
                <Sparkles size={17} />
              </span>
              <p className="text-sm leading-relaxed text-[#626a69]">
                <b>Finora says:</b> Your emergency fund covers {(cash / Math.max(1, state.transactions.filter(t => t.type === "debit").slice(0, 10).reduce((s, t) => s + t.amount, 0) / 10)).toFixed(1)}+ months of expenses, so you are not forced to sell. Keep your SIPs running through volatility — that is where wealth is actually built.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
