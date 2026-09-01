import { useState } from "react";
import { Activity, BriefcaseBusiness, MoreHorizontal, Plus, TrendingUp, Wallet } from "lucide-react";
import { useStore } from "../store/context";
import {
  getPortfolioValue, getPortfolioPnL, getPortfolioPnLPct,
  getHoldingsWithMetrics, getSectorAllocation,
} from "../store/selectors";
import { Card, SectionTitle, Metric, Button, Badge, money, compact } from "../components/primitives";
import { HoldingModal } from "../components/modals/HoldingModal";
import type { Holding } from "../store/data";
import { Cell, Pie, PieChart, Tooltip as ChartTooltip } from "recharts";

export function Portfolio({ go }: { go: (p: string) => void }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Holding | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const holdings = getHoldingsWithMetrics(state);
  const total = getPortfolioValue(state);
  const pnl = getPortfolioPnL(state);
  const pnlPct = getPortfolioPnLPct(state);
  const sectors = getSectorAllocation(state);

  // Mock today's move — sum of small daily deltas
  const todayMove = holdings.reduce((s, h) => s + h.shares * (h.currentPrice * 0.0105), 0);
  const todayMovePct = total > 0 ? (todayMove / total) * 100 : 0;

  return (
    <>
      <SectionTitle
        eyebrow="Markets / ownership"
        title="Portfolio"
        sub={`${money(total)} invested across ${holdings.length} positions.`}
        action={
          <Button primary onClick={() => setAdding(true)} testId="button-add-holding">
            <Plus size={15} /> Add holding
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Portfolio value"   value={compact(total)}    detail={`${pnl >= 0 ? "▲" : "▼"} ${money(Math.abs(pnl))} total return`} trend={pnl >= 0 ? "up" : "down"} icon={BriefcaseBusiness} accent="#167b73" />
        <Metric label="Today's move"      value={`${todayMove >= 0 ? "+" : ""}${money(todayMove)}`} detail={`${todayMovePct >= 0 ? "+" : ""}${todayMovePct.toFixed(2)}% today`} trend={todayMove >= 0 ? "up" : "down"} icon={TrendingUp} accent="#ed9d3d" />
        <Metric label="Portfolio return"  value={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`} detail="Since first investment"           trend={pnlPct >= 0 ? "up" : "down"} icon={Activity} accent="#5278c5" />
        <Metric label="Cash available"    value="₹24,800"          detail="Ready to deploy"                 icon={Wallet} accent="#ca6471" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        {/* Sector allocation */}
        <Card className="p-5">
          <SectionTitle eyebrow="Allocation" title="Where your money sits" />
          <div className="flex items-center justify-center">
            <PieChart width={210} height={210}>
              <Pie data={sectors} dataKey="value" innerRadius={64} outerRadius={92} paddingAngle={3}>
                {sectors.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <ChartTooltip formatter={(v) => [`${v}%`, "weight"]} />
            </PieChart>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {sectors.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="flex-1">{s.name}</span>
                <b>{s.value}%</b>
              </div>
            ))}
          </div>
        </Card>

        {/* Holdings table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[.16em] text-[#167b73]">Holdings</p>
              <h2 className="mt-1 font-display text-xl font-bold">Your positions</h2>
            </div>
            <Badge tone="positive">Market open</Badge>
          </div>
          <div className="grid grid-cols-[1.5fr_.7fr_.7fr_.7fr_28px] gap-2 border-y border-[#eee8dc] bg-[#f4f0e7] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#888b85]">
            <span>Company</span>
            <span className="text-right">Weight</span>
            <span className="text-right">P&L</span>
            <span className="text-right">Value</span>
            <span />
          </div>
          {holdings.map((h) => (
            <div
              key={h.id}
              className="grid grid-cols-[1.5fr_.7fr_.7fr_.7fr_28px] items-center gap-2 border-b border-[#eee8dc] px-5 py-3 last:border-0 hover:bg-[#f6f3eb]"
            >
              <button
                onClick={() => go("/stock-analysis")}
                data-testid={`button-holding-${h.symbol}`}
                className="flex min-w-0 items-center gap-2.5 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e7eee9] font-data text-[9px] font-bold text-[#167b73]">
                  {h.symbol.slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <b className="block truncate text-xs">{h.symbol}</b>
                  <small className="block truncate text-[10px] text-[#888b85]">{h.name}</small>
                </span>
              </button>
              <span className="text-right font-data text-[11px]">{h.weight.toFixed(1)}%</span>
              <span className={`text-right font-data text-[11px] ${h.pnl >= 0 ? "text-[#167b73]" : "text-[#bd514d]"}`}>
                {h.pnl >= 0 ? "+" : ""}{money(h.pnl)}
              </span>
              <span className="text-right font-data text-[11px]">{compact(h.value)}</span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === h.id ? null : h.id)}
                  className="text-[#8e918b]"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen === h.id && (
                  <div className="absolute right-0 top-5 z-10 w-32 rounded-xl border border-[#e3ddcf] bg-[#fbfaf5] py-1 shadow-lg">
                    <button
                      onClick={() => { setEditing(h); setMenuOpen(null); }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-[#f1eee6]"
                    >
                      Edit holding
                    </button>
                    <button
                      onClick={() => { dispatch({ type: "REMOVE_HOLDING", payload: { id: h.id } }); setMenuOpen(null); }}
                      className="w-full px-3 py-2 text-left text-xs text-[#a83d39] hover:bg-[#f8dedc]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Modals */}
      {adding && <HoldingModal onClose={() => setAdding(false)} />}
      {editing && <HoldingModal holding={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
