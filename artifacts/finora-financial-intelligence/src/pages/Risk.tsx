import { useState } from "react";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useStore } from "../store/context";
import {
  getPortfolioValue, getPortfolioBeta, getHoldingsWithMetrics, getSectorAllocation,
} from "../store/selectors";
import { Card, SectionTitle, Metric, Button, money, compact } from "../components/primitives";

export function Risk({ go }: { go: (p: string) => void }) {
  const { state } = useStore();
  const portfolioValue = getPortfolioValue(state);
  const beta = getPortfolioBeta(state);
  const holdings = getHoldingsWithMetrics(state);
  const sectors = getSectorAllocation(state);
  const topSector = sectors.reduce((a, b) => (b.value > a.value ? b : a), sectors[0] ?? { name: "—", value: 0 });
  const largest = holdings.reduce((a, b) => (b.value > a.value ? b : a), holdings[0]);
  const largestWeight = portfolioValue > 0 ? ((largest?.value ?? 0) / portfolioValue * 100) : 0;

  // Volatility — derived from beta (rough estimate)
  const volatility = (beta * 15.6).toFixed(1); // NIFTY ~15.6% annual vol

  const metrics = [
    { n: "Portfolio beta",    v: beta.toFixed(2), d: `Moves ${Math.round((1 - beta) * 100)}% less than NIFTY`, c: "#167b73" },
    { n: "Volatility",        v: `${volatility}%`, d: "Annual estimate based on beta",                           c: "#5278c5" },
    { n: "Largest position",  v: `${largestWeight.toFixed(1)}%`, d: `${largest?.symbol ?? "—"} · watch concentration`, c: "#ed9d3d" },
    { n: "Downside risk",     v: "Moderate",       d: "1-in-20 day worst case: -4.8%",                           c: "#ca6471" },
  ];

  return (
    <>
      <SectionTitle
        eyebrow="Markets / guardrails"
        title="Risk room"
        sub="Risk is not a warning label. It is useful context."
        action={
          <Button onClick={() => go("/simulator")} testId="button-run-scenario">
            <SlidersHorizontal size={15} /> Run a scenario
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Metric key={m.n} label={m.n} value={m.v} detail={m.d} icon={ShieldCheck} accent={m.c} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Risk profile */}
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Plain-language view" title="You are diversified, with a tilt." />
          <p className="text-sm leading-7 text-[#626a69]">
            Your portfolio has {holdings.length} names across {sectors.length} sectors, and a beta of {beta.toFixed(2)} — moving less than the market. 
            {topSector && ` ${topSector.name} makes up ${topSector.value}% of the portfolio — sensible, but enough to matter when that sector moves.`}
          </p>

          <div className="mt-6 space-y-4">
            {[
              { n: "Diversification",  v: Math.min(100, holdings.length * 10), c: "#167b73" },
              { n: "Sector balance",   v: Math.min(100, 100 - topSector.value), c: "#ed9d3d" },
              { n: "Downside cushion", v: Math.min(100, Math.round((1 - Math.max(0, beta - 0.5)) * 80)), c: "#5278c5" },
            ].map((x) => (
              <div key={x.n}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{x.n}</span>
                  <b>{x.v}/100</b>
                </div>
                <div className="h-2 rounded-full bg-[#ebe7dc]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${x.v}%`, background: x.c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Largest positions */}
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Concentration" title="Largest positions" />
          <div className="space-y-4">
            {holdings.slice(0, 5).map((h, i) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="font-data text-[10px] text-[#888b85]">0{i + 1}</span>
                <span className="flex-1">
                  <b className="block text-sm">{h.symbol}</b>
                  <small className="text-xs text-[#888b85]">{h.sector}</small>
                </span>
                <div className="w-32">
                  <div className="h-2 rounded-full bg-[#eee8dc]">
                    <div
                      className="h-full rounded-full bg-[#167b73] transition-all"
                      style={{ width: `${Math.min(100, portfolioValue > 0 ? (h.value / portfolioValue) * 100 * 5 : 0)}%` }}
                    />
                  </div>
                </div>
                <b className="w-10 text-right font-data text-xs">{h.weight.toFixed(1)}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
