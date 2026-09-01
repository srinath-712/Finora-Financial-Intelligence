import { useState } from "react";
import { BrainCircuit, Plus } from "lucide-react";
import { useStore } from "../store/context";
import { getHoldingsWithMetrics } from "../store/selectors";
import { STOCK_DETAILS } from "../store/data";
import { analyzeStockWithQuantAgents } from "../agents";
import { Card, SectionTitle, Button, Badge, money } from "../components/primitives";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip,
} from "recharts";

const MONTHS = ["Apr", "Jun", "Aug", "Oct", "Dec", "Feb", "Mar", "Now"];

export function StockAnalysis({ go }: { go: (p: string) => void }) {
  const { state, dispatch } = useStore();
  const holdings = getHoldingsWithMetrics(state);
  const [selectedSymbol, setSelectedSymbol] = useState(holdings[0]?.symbol ?? "RELIANCE");

  const h = holdings.find((x) => x.symbol === selectedSymbol) ?? holdings[0];
  const detail = STOCK_DETAILS[selectedSymbol] ?? STOCK_DETAILS[holdings[0]?.symbol ?? "RELIANCE"];

  // Execute QuantAgents engine for selected stock
  const decision = analyzeStockWithQuantAgents(selectedSymbol, state);

  const chartData = detail?.chartPrices?.map((v, i) => ({ x: MONTHS[i] ?? `P${i}`, v })) ?? [];
  const inWatchlist = state.watchlist.some((w) => w.symbol === selectedSymbol);

  const addToWatchlist = () => {
    if (!inWatchlist && h) {
      dispatch({
        type: "ADD_TO_WATCHLIST",
        payload: {
          id: `w${Date.now()}`,
          symbol: h.symbol,
          name: h.name,
          price: h.currentPrice,
          change: h.pnlPct,
          changeAmt: h.pnl,
        },
      });
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Markets / explainable lens"
        title="Stock analysis"
        sub="A calm read before you make a loud decision."
        action={
          <Button onClick={() => go("/agents")} testId="button-open-agents">
            <BrainCircuit size={15} /> Agent view
          </Button>
        }
      />

      {/* Symbol selector */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {holdings.map((x) => (
          <button
            key={x.symbol}
            onClick={() => setSelectedSymbol(x.symbol)}
            data-testid={`button-select-stock-${x.symbol}`}
            className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold ${selectedSymbol === x.symbol ? "border-[#167b73] bg-[#167b73] text-white" : "border-[#ddd6c8] bg-[#fbfaf5]"}`}
          >
            {x.symbol}
          </button>
        ))}
        {/* Watchlist symbols not in holdings */}
        {state.watchlist
          .filter((w) => !holdings.some((h) => h.symbol === w.symbol))
          .map((w) => (
            <button
              key={w.symbol}
              onClick={() => setSelectedSymbol(w.symbol)}
              data-testid={`button-select-stock-${w.symbol}`}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold ${selectedSymbol === w.symbol ? "border-[#167b73] bg-[#167b73] text-white" : "border-[#ddd6c8] bg-[#fbfaf5]"}`}
            >
              {w.symbol}
            </button>
          ))}
      </div>

      {h && detail && (
        <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          {/* Main chart card */}
          <Card className="p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#e7eee9] px-2 py-1 font-data text-xs font-bold text-[#167b73]">NSE</span>
                  <span className="text-xs text-[#888b85]">Large cap · {h.sector}</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold">{h.name}</h2>
                <p className="mt-1 font-data text-sm text-[#747773]">
                  {h.symbol} · ₹{h.currentPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <b className={`font-display text-2xl ${h.pnlPct >= 0 ? "text-[#167b73]" : "text-[#bd514d]"}`}>
                  {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                </b>
                <p className="text-xs text-[#888b85]">your P&L %</p>
              </div>
            </div>

            <div className="mt-7 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#167b73" stopOpacity=".2" />
                      <stop offset="1" stopColor="#167b73" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eee8dc" vertical={false} />
                  <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888b85" }} />
                  <YAxis domain={["dataMin - 100", "dataMax + 100"]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888b85" }} />
                  <Area dataKey="v" stroke="#167b73" fill="url(#stockFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#eee8dc] pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#888b85]">Fair value</p>
                <b>₹{detail.fairValue.toLocaleString("en-IN")}</b>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#888b85]">52W range</p>
                <b>₹{detail.week52Low.toLocaleString("en-IN")}–{detail.week52High.toLocaleString("en-IN")}</b>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#888b85]">QuantAgents stance</p>
                <Badge tone={decision.stance === "BUY" || decision.stance === "ACCUMULATE" ? "positive" : decision.stance === "SELL" || decision.stance === "REDUCE" ? "negative" : "neutral"}>
                  {decision.stance} ({decision.consensusScore}/10)
                </Badge>
              </div>
            </div>

            {/* Fundamentals */}
            <div className="mt-4 grid grid-cols-4 gap-3 border-t border-[#eee8dc] pt-4 text-xs">
              <div><p className="text-[#888b85]">P/E</p><b>{detail.pe}</b></div>
              <div><p className="text-[#888b85]">P/B</p><b>{detail.pb}</b></div>
              <div><p className="text-[#888b85]">ROE</p><b>{detail.roe}%</b></div>
              <div><p className="text-[#888b85]">D/E</p><b>{detail.debtEquity}</b></div>
            </div>
          </Card>

          {/* QuantAgents synthesis card */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#20293c] text-[#f4d65e]">
                <BrainCircuit size={16} />
              </span>
              <p className="font-data text-[10px] font-bold uppercase tracking-[.16em] text-[#167b73]">QuantAgents Consensus</p>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-[#20293c]">
              Synthesized Stance: {decision.stance}
            </h3>
            <p className="mt-3 text-sm font-normal leading-relaxed text-[#3b4550]">
              {decision.supportingFactors[0] ?? detail.aiRead}
            </p>
            {decision.portfolioPenaltyApplied && decision.penaltyReasoning && (
              <div className="mt-3 rounded-xl border border-[#a86b19]/30 bg-[#fff0cf] p-3 text-xs font-semibold text-[#855310]">
                ⚠️ <b>Portfolio Risk Alert:</b> {decision.penaltyReasoning}
              </div>
            )}
            <div className="mt-5 space-y-3">
              {decision.agentOutputs.map((a) => (
                <div key={a.agentName} className="flex items-center justify-between border-b border-[#eee8dc] pb-2 text-sm">
                  <span className="font-medium text-[#3b4550]">{a.agentName} Analyst</span>
                  <Badge tone={a.stance === "Bullish" ? "positive" : a.stance === "Bearish" ? "negative" : "neutral"}>
                    {a.score}/10 · {a.stance}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <Button primary className="w-full" onClick={() => go("/agents")} testId="button-explain-stock">
                <BrainCircuit size={15} /> Explain in Agent Room
              </Button>
              <Button
                className="w-full"
                onClick={addToWatchlist}
                disabled={inWatchlist}
                testId="button-add-watchlist-stock"
              >
                {inWatchlist ? "In watchlist ✓" : "+ Add to watchlist"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
