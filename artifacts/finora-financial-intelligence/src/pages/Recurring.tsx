import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../store/context";
import { Card, SectionTitle, Button, Badge, money } from "../components/primitives";
import { formatDisplayDate } from "../store/data";

export function Recurring() {
  const { state, dispatch } = useStore();

  const annualTotal = state.recurring.reduce((s, r) => s + r.annualEquivalent, 0);
  const unused = state.recurring.filter((r) => r.status === "unused");
  const unusedAnnual = unused.reduce((s, r) => s + r.annualEquivalent, 0);

  return (
    <>
      <SectionTitle
        eyebrow="Money / recurring"
        title="Subscriptions & recurring"
        sub={`₹${(annualTotal / 1000).toFixed(0)}k in annual commitments. Keep what earns its place.`}
        action={
          <Button primary onClick={() => {}} testId="button-add-recurring">
            <Plus size={15} /> Add recurring
          </Button>
        }
      />

      {/* Summary banner */}
      <Card className="mb-5 grid gap-4 bg-[#fff0cf] p-5 md:grid-cols-3">
        <div>
          <p className="text-xs text-[#856b3e]">Annual total</p>
          <b className="font-display text-2xl text-[#7d5a22]">{money(annualTotal)}</b>
        </div>
        <div>
          <p className="text-xs text-[#856b3e]">Increasing</p>
          <b className="font-display text-2xl text-[#a86b19]">2</b>
          <p className="text-xs text-[#856b3e]">prices changed recently</p>
        </div>
        <div>
          <p className="text-xs text-[#856b3e]">Unused</p>
          <b className="font-display text-2xl text-[#bd514d]">{money(unusedAnnual)}</b>
          <p className="text-xs text-[#856b3e]">potential annual save</p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_.8fr_.8fr_1fr_auto] gap-3 bg-[#f4f0e7] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#888b85]">
          <span>Service</span>
          <span>Category</span>
          <span>Cost</span>
          <span>Next</span>
          <span>Annual</span>
          <span />
        </div>
        {state.recurring.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_1fr_.8fr_.8fr_1fr_auto] items-center gap-3 border-b border-[#eee8dc] px-5 py-4 last:border-0"
          >
            <b className="text-sm">{r.name}</b>
            <span className="text-xs text-[#747773]">{r.category}</span>
            <span className="font-data text-xs">{money(r.amount)}/mo</span>
            <span className="text-xs text-[#747773]">{formatDisplayDate(r.nextDate)}</span>
            <span className="font-data text-xs">{money(r.annualEquivalent)} / yr</span>
            <div className="flex items-center gap-2">
              {r.status === "unused"
                ? <Badge tone="warning">Unused</Badge>
                : <Badge tone="positive">Active</Badge>}
              <button
                onClick={() => dispatch({ type: "DELETE_RECURRING", payload: { id: r.id } })}
                className="rounded-lg p-1 text-[#7c817a] hover:bg-[#f8dedc] hover:text-[#a83d39]"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
