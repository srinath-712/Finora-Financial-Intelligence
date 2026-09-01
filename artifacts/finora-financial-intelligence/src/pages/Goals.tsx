import { useState } from "react";
import { Goal as GoalIcon, MoreHorizontal, Plus } from "lucide-react";
import { useStore } from "../store/context";
import { getGoalProgress } from "../store/selectors";
import { Card, SectionTitle, Button, Badge, money } from "../components/primitives";
import { GoalModal, ContributeModal } from "../components/modals/GoalModal";
import type { Goal } from "../engine/types";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip,
} from "recharts";

export function Goals() {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const totalCurrent = state.goals.reduce((s, g) => s + g.current, 0);
  const monthlyTotal = state.goals.reduce((s, g) => s + g.monthlyContribution, 0);

  // Build a simple 6-point projection chart
  const projectionData = Array.from({ length: 7 }, (_, i) => ({
    x: i === 0 ? "Now" : `${i * 5}m`,
    y: parseFloat(((totalCurrent + monthlyTotal * i * 5) / 100000).toFixed(1)),
  }));

  return (
    <>
      <SectionTitle
        eyebrow="Money / direction"
        title="Goals"
        sub="A little clarity makes future-you easier to reach."
        action={
          <Button primary onClick={() => setAdding(true)} testId="button-add-goal">
            <Plus size={15} /> Add goal
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {state.goals.map((g, i) => {
          const pct = getGoalProgress(g);
          const remaining = g.target - g.current;
          return (
            <Card key={g.id} className="p-5 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ color: g.color, background: `${g.color}19` }}
                  >
                    <GoalIcon size={19} />
                  </span>
                  <div>
                    <b className="block">{g.name}</b>
                    <span className="text-xs text-[#888b85]">Target by {g.targetDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={pct > 60 ? "positive" : "yellow"}>{pct}% complete</Badge>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === g.id ? null : g.id)}>
                      <MoreHorizontal size={17} className="text-[#91948d]" />
                    </button>
                    {menuOpen === g.id && (
                      <div className="absolute right-0 top-6 z-10 w-36 rounded-xl border border-[#e3ddcf] bg-[#fbfaf5] py-1 shadow-lg">
                        <button
                          onClick={() => { setContributing(g); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs hover:bg-[#f1eee6]"
                        >
                          Add contribution
                        </button>
                        <button
                          onClick={() => { setEditing(g); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs hover:bg-[#f1eee6]"
                        >
                          Edit goal
                        </button>
                        <button
                          onClick={() => { dispatch({ type: "DELETE_GOAL", payload: { id: g.id } }); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs text-[#a83d39] hover:bg-[#f8dedc]"
                        >
                          Delete goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <b className="font-display text-2xl">{money(g.current)}</b>
                <span className="text-xs text-[#888b85]">of {money(g.target)}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#ebe7dc]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: g.color }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-[#747773]">
                  Monthly <b className="text-[#263043]">{money(g.monthlyContribution)}</b>
                </span>
                <button
                  onClick={() => setContributing(g)}
                  className="font-bold text-[#167b73] hover:underline"
                  data-testid={`button-contribute-${i}`}
                >
                  {pct >= 100 ? "Completed! 🎉" : pct > 50 ? "On track →" : "Add funds →"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Projection */}
      <Card className="mt-5 p-5 md:p-6">
        <SectionTitle
          eyebrow="Projection"
          title="Your goals have momentum"
          sub={`At current contribution rates, you reach ₹${((totalCurrent + monthlyTotal * 30) / 100000).toFixed(1)}L in 30 months.`}
        />
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <Area type="monotone" dataKey="y" stroke="#167b73" fill="#dcefe6" strokeWidth={2.5} />
              <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888b85" }} />
              <YAxis hide />
              <ChartTooltip formatter={(v) => [`₹${v}L`, "projected"]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Modals */}
      {adding && <GoalModal onClose={() => setAdding(false)} />}
      {editing && <GoalModal goal={editing} onClose={() => setEditing(null)} />}
      {contributing && <ContributeModal goal={contributing} onClose={() => setContributing(null)} />}
    </>
  );
}
