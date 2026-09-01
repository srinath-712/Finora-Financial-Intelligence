import { useState } from "react";
import { Activity, BarChart3, BrainCircuit, FileText, ShieldCheck, Sparkles, Target } from "lucide-react";
import { useStore } from "../store/context";
import { analyzeStockWithQuantAgents } from "../agents";
import { Card, SectionTitle, Button, Badge, MiniBars } from "../components/primitives";

const AGENT_CONFIGS = [
  { n: "Fundamental", icon: FileText,    c: "#167b73" },
  { n: "Quant",       icon: BarChart3,   c: "#5278c5" },
  { n: "Market",      icon: Activity,    c: "#ed9d3d" },
  { n: "Sentiment",   icon: Sparkles,    c: "#8d75b9" },
  { n: "Risk",        icon: ShieldCheck, c: "#ca6471" },
];

export function Agents() {
  const { state } = useStore();
  const [tab, setTab] = useState("Combined");
  const [selectedStock, setSelectedStock] = useState(state.holdings[0]?.symbol ?? "RELIANCE");

  // Run the QuantAgents decision engine for the selected stock
  const decision = analyzeStockWithQuantAgents(selectedStock, state);

  const activeAgentOutput = decision.agentOutputs.find((a) => a.agentName === tab);
  const activeConfig = AGENT_CONFIGS.find((c) => c.n === tab);

  return (
    <>
      <SectionTitle
        eyebrow="QuantAgents-NSE / live room"
        title="Five lenses. One clearer decision."
        sub={`Committee analysis for ${decision.symbol} (${decision.companyName}).`}
        action={
          <div className="flex items-center gap-2">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="rounded-xl border border-[#3b475d] bg-[#20293c] px-3 py-1.5 text-xs font-bold text-[#f4d65e] outline-none"
              data-testid="select-agent-stock"
            >
              {state.holdings.map((h) => (
                <option key={h.id} value={h.symbol}>{h.symbol}</option>
              ))}
            </select>
            <Badge tone="positive">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[#167b73]" />Live Engine
            </Badge>
          </div>
        }
      />

      <Card className="overflow-hidden" style={{ backgroundColor: "#20293c", color: "#ffffff" }}>
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            {["Combined", ...AGENT_CONFIGS.map((a) => a.n)].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                data-testid={`button-agent-tab-${x.toLowerCase()}`}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition-all ${tab === x ? "bg-[#f4d65e] text-[#1a2233] shadow-sm" : "bg-[#2d3950] text-[#e2e8f0] hover:bg-[#38465e]"}`}
              >
                {x}
              </button>
            ))}
          </div>

          {tab === "Combined" ? (
            <div className="mt-8 grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
              <div>
                <p className="font-data text-[11px] font-bold uppercase tracking-[.18em] text-[#f4d65e]">Synthesized Stance</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold text-[#ffffff]">
                  {decision.stance}<span className="text-[#f4d65e]">.</span>
                </h2>
                <div className="mt-5 flex items-end gap-3">
                  <b className="font-data text-5xl font-bold text-[#f4d65e]">{decision.consensusScore}</b>
                  <span className="pb-1 text-sm font-medium text-[#d1d7e0]">consensus / 10 · {decision.confidencePct}% confidence</span>
                </div>
              </div>
              <div>
                <p className="max-w-xl text-lg font-medium leading-relaxed text-[#ffffff]">
                  {decision.supportingFactors[0]}
                </p>
                {decision.portfolioPenaltyApplied && decision.penaltyReasoning && (
                  <p className="mt-3 rounded-xl border border-[#a86b19]/40 bg-[#a86b19]/25 p-3.5 text-xs font-semibold text-[#f4d65e]">
                    ⚠️ <b>Portfolio Risk Adjustment:</b> {decision.penaltyReasoning}
                  </p>
                )}
                <div className="mt-6 flex gap-3">
                  <Button primary testId="button-add-watchlist">
                    <Target size={15} /> Add to watchlist
                  </Button>
                  <Button className="border-[#56647b] bg-[#2d3950] text-white hover:bg-[#38465e]" testId="button-size-position">
                    Size a position
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-[.3fr_1fr]">
              <div className="flex items-center gap-4">
                {activeAgentOutput && activeConfig && (
                  <>
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: activeConfig.c + "35", color: activeConfig.c }}
                    >
                      <activeConfig.icon size={28} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#d1d7e0]">{activeAgentOutput.agentName} agent</p>
                      <b className="font-data text-3xl font-bold text-[#f4d65e]">{activeAgentOutput.score}</b>
                      <span className="ml-2 text-xs font-bold text-[#e2e8f0]">({activeAgentOutput.stance})</span>
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="text-lg font-medium leading-relaxed text-[#ffffff]">{activeAgentOutput?.reasoning}</p>
                {activeAgentOutput && (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-[#3b475d] pt-3 text-xs text-[#d1d7e0]">
                    {Object.entries(activeAgentOutput.keyMetrics).map(([k, v]) => (
                      <span key={k}><b className="text-[#ffffff]">{k}:</b> {v}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Score bar */}
        <div className="grid grid-cols-2 divide-x divide-[#3b475d] border-t border-[#3b475d] bg-[#171f2d] md:grid-cols-5">
          {AGENT_CONFIGS.map((cfg) => {
            const output = decision.agentOutputs.find((a) => a.agentName === cfg.n);
            const sc = output?.score ?? 5;
            return (
              <div key={cfg.n} className="p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d1d7e0]">
                  <span className="h-2 w-2 rounded-full" style={{ background: cfg.c }} />
                  {cfg.n}
                </div>
                <b className="mt-2 block font-data text-xl font-bold text-[#ffffff]">{sc}</b>
                <MiniBars values={[4, 5, 5, 6, Math.round(sc - 1), sc]} color={cfg.c} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="font-data text-[10px] font-bold uppercase tracking-widest text-[#167b73]">Supporting thesis</p>
          <h3 className="mt-2 font-display text-lg font-bold text-[#20293c]">Primary catalyst</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#3b4550]">{decision.supportingFactors[0]}</p>
        </Card>
        <Card className="p-5">
          <p className="font-data text-[10px] font-bold uppercase tracking-widest text-[#d97706]">Key risks</p>
          <h3 className="mt-2 font-display text-lg font-bold text-[#20293c]">Watch-outs</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#3b4550]">{decision.risks[0]}</p>
        </Card>
        <Card className="p-5">
          <p className="font-data text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">Invalidation condition</p>
          <h3 className="mt-2 font-display text-lg font-bold text-[#20293c]">Exit trigger</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#3b4550]">{decision.invalidationConditions[0]}</p>
        </Card>
      </div>
    </>
  );
}
