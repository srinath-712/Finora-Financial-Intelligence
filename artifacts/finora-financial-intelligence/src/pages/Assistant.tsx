import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useStore } from "../store/context";
import { getAIResponse } from "../store/aiService";
import type { AIResponse } from "../store/aiService";
import { Card, SectionTitle, Button, Badge, money } from "../components/primitives";
import {
  getPortfolioValue, getPortfolioPnLPct, getMonthlySaved, getGoalProgress,
  getAvailableCash,
} from "../store/selectors";
import { useLocation } from "wouter";

const SUGGESTIONS = [
  "How is my portfolio doing?",
  "Where am I overspending?",
  "Can I afford ₹20,000?",
  "What if I increase my SIP by ₹5,000?",
];

export function Assistant() {
  const { state, dispatch } = useStore();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");

  const portfolioValue = getPortfolioValue(state);
  const portfolioReturn = getPortfolioPnLPct(state);
  const saved = getMonthlySaved(state);
  const cash = getAvailableCash(state);

  const ask = (q: string) => {
    if (!q.trim()) return;
    dispatch({ type: "ADD_AI_MESSAGE", payload: { from: "user", text: q } });
    const response: AIResponse = getAIResponse(q, state);
    const fullText = response.insights?.length
      ? `${response.text}\n\n${response.insights.map((i) => `• ${i.label}: ${i.value}${i.sub ? ` (${i.sub})` : ""}`).join("\n")}`
      : response.text;
    dispatch({ type: "ADD_AI_MESSAGE", payload: { from: "ai", text: fullText } });
    setInput("");
  };

  return (
    <>
      <SectionTitle
        eyebrow="Understand / your copilot"
        title="Ask Finora"
        sub="Plain language for complicated money."
        action={<Badge tone="yellow"><Sparkles size={12} className="mr-1" /> Context aware</Badge>}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_.36fr]">
        {/* Chat card */}
        <Card className="flex min-h-[560px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#eee8dc] p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#20293c] text-[#f4d65e]">
              <Sparkles size={17} />
            </span>
            <div>
              <b className="block text-sm">Finora assistant</b>
              <span className="flex items-center gap-1 text-[11px] text-[#167b73]">
                <i className="h-1.5 w-1.5 rounded-full bg-[#167b73]" />Ready with your context
              </span>
            </div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
            {state.aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
                <div
                  className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-sm bg-[#167b73] text-white" : "rounded-bl-sm bg-[#f0ece3] text-[#3b4550]"}`}
                  data-testid={`message-${i}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#eee8dc] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  data-testid={`button-suggestion-${i}`}
                  className="rounded-full border border-[#ddd6c8] px-3 py-1.5 text-[11px] font-semibold hover:border-[#167b73] hover:text-[#167b73]"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder="Ask about your money..."
                data-testid="input-assistant"
                className="h-11 flex-1 rounded-xl border border-[#ddd6c8] bg-[#f8f6ef] px-3 text-sm outline-none focus:border-[#167b73]"
              />
              <Button primary onClick={() => ask(input)} testId="button-send-assistant">
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Context sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <p className="font-data text-[10px] uppercase tracking-widest text-[#167b73]">Context cards</p>
            <div className="mt-4 space-y-3">
              {[
                { l: "Available cash",   v: money(cash),             p: "after planned outflows"    },
                { l: "Portfolio return", v: `${portfolioReturn >= 0 ? "+" : ""}${portfolioReturn.toFixed(1)}%`, p: "since first investment" },
                { l: "Monthly saved",    v: money(saved),            p: "this month"                },
              ].map((x) => (
                <div key={x.l} className="rounded-xl bg-[#f1eee6] p-3">
                  <p className="text-[11px] text-[#747773]">{x.l}</p>
                  <b className="mt-1 block font-display text-lg">{x.v}</b>
                  <small className="text-[11px] text-[#888b85]">{x.p}</small>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#e7f1eb] p-5">
            <div className="flex items-center gap-2 text-[#167b73]">
              <Sparkles size={16} />
              <b className="text-sm">Try a what-if</b>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#567267]">
              "What happens if I increase my SIP by ₹5,000?"
            </p>
            <button
              onClick={() => ask("What happens if I increase my SIP by ₹5,000?")}
              className="mt-3 text-xs font-bold text-[#167b73]"
              data-testid="button-what-if"
            >
              Run projection →
            </button>
          </Card>

          <Card className="p-5">
            <p className="font-data text-[10px] uppercase tracking-widest text-[#167b73]">Goal overview</p>
            <div className="mt-3 space-y-3">
              {state.goals.map((g) => {
                const pct = getGoalProgress(g);
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="truncate">{g.name}</span>
                      <b>{pct}%</b>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#eee8dc]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
