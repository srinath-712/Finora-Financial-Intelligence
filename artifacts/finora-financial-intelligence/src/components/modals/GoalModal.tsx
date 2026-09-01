import { useState } from "react";
import { Modal, Button, FormField, inputCls } from "../primitives";
import { useStore } from "../../store/context";
import type { Goal } from "../../store/data";
import { futureMonths } from "../../store/data";

const COLORS = ["#167b73", "#ed9d3d", "#5278c5", "#ca6471", "#8d75b9", "#55a889"];

// ─── Add / Edit Goal ──────────────────────────────────────────────────────────

export function GoalModal({
  goal,
  onClose,
}: {
  goal?: Goal;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const isEdit = !!goal;

  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(String(goal?.target ?? ""));
  const [current, setCurrent] = useState(String(goal?.current ?? "0"));
  const [monthly, setMonthly] = useState(String(goal?.monthlyContribution ?? ""));
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? futureMonths(12));
  const [color, setColor] = useState(goal?.color ?? COLORS[0]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Goal = {
      id: goal?.id ?? `g${Date.now()}`,
      name: name.trim(),
      target: Number(target) || 0,
      current: Number(current) || 0,
      monthlyContribution: Number(monthly) || 0,
      targetDate,
      color,
      icon: goal?.icon ?? "target",
    };
    if (isEdit) {
      dispatch({ type: "EDIT_GOAL", payload });
    } else {
      dispatch({ type: "ADD_GOAL", payload });
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit goal" : "Add goal"} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <FormField label="Goal name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency fund"
            className={inputCls}
            data-testid="input-goal-name"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Target amount (₹)">
            <input
              required
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-goal-target"
            />
          </FormField>
          <FormField label="Amount saved so far (₹)">
            <input
              type="number"
              min="0"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-goal-current"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Monthly contribution (₹)">
            <input
              type="number"
              min="0"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-goal-monthly"
            />
          </FormField>
          <FormField label="Target date">
            <input
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="e.g. Dec 2026"
              className={inputCls}
              data-testid="input-goal-date"
            />
          </FormField>
        </div>

        <div>
          <p className="text-xs font-bold text-[#686f6c]">Colour</p>
          <div className="mt-2 flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full transition"
                style={{ background: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-goal">
            {isEdit ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Contribute to Goal ────────────────────────────────────────────────────────

export function ContributeModal({
  goal,
  onClose,
}: {
  goal: Goal;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const [amount, setAmount] = useState(String(goal.monthlyContribution));
  const remaining = goal.target - goal.current;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: "CONTRIBUTE_TO_GOAL",
      payload: { id: goal.id, amount: Math.min(Number(amount) || 0, remaining) },
    });
    onClose();
  };

  return (
    <Modal title={`Contribute to ${goal.name}`} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-4">
        <div className="rounded-xl bg-[#f1eee6] p-4">
          <p className="text-xs text-[#888b85]">Remaining to goal</p>
          <b className="font-display text-xl">₹{remaining.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</b>
        </div>

        <FormField label="Amount to add (₹)">
          <input
            required
            type="number"
            min="1"
            max={remaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls}
            data-testid="input-contribute-amount"
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-contribution">Add contribution</Button>
        </div>
      </form>
    </Modal>
  );
}
