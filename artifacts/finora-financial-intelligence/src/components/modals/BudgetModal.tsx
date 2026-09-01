import { useState } from "react";
import { Modal, Button, FormField, inputCls, selectCls } from "../primitives";
import { useStore } from "../../store/context";
import type { BudgetDefinition, TransactionCategory } from "../../store/data";

const CATEGORIES: TransactionCategory[] = [
  "Groceries", "Transport", "Dining", "Subscriptions",
  "Investments", "Shopping", "Housing", "Health", "Utilities", "Entertainment", "Personal", "Other",
];

const COLORS = ["#167b73", "#ed9d3d", "#5278c5", "#ca6471", "#8d75b9", "#55a889"];

export function BudgetModal({
  budget,
  onClose,
}: {
  budget?: BudgetDefinition;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const isEdit = !!budget;

  const [name, setName] = useState(budget?.name ?? "");
  const [category, setCategory] = useState<TransactionCategory>(budget?.category ?? "Shopping");
  const [limit, setLimit] = useState(String(budget?.limit ?? ""));
  const [color, setColor] = useState(budget?.color ?? COLORS[0]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: BudgetDefinition = {
      id: budget?.id ?? `b${Date.now()}`,
      name: name.trim(),
      category,
      limit: Number(limit) || 0,
      color,
    };
    if (isEdit) {
      dispatch({ type: "EDIT_BUDGET", payload });
    } else {
      dispatch({ type: "ADD_BUDGET", payload });
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit budget" : "New budget"} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <FormField label="Budget name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dining out"
            className={inputCls}
            data-testid="input-budget-name"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className={selectCls}
              data-testid="select-budget-category"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Monthly limit (₹)">
            <input
              required
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-budget-limit"
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
                style={{
                  background: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-budget">
            {isEdit ? "Save changes" : "Create budget"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
