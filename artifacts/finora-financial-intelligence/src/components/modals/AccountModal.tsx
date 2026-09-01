import { useState } from "react";
import { Modal, Button, FormField, inputCls, selectCls } from "../primitives";
import { useStore } from "../../store/context";
import type { Account } from "../../store/data";

const ACCOUNT_TYPES = ["bank", "credit", "cash", "investment"] as const;
const COLORS = ["#167b73", "#ed9d3d", "#ca6471", "#5278c5", "#8d75b9", "#55a889"];

export function AccountModal({
  account,
  onClose,
}: {
  account?: Account;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const isEdit = !!account;

  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<typeof ACCOUNT_TYPES[number]>(account?.type ?? "bank");
  const [balance, setBalance] = useState(String(account?.baseBalance ?? ""));
  const [institution, setInstitution] = useState(account?.institution ?? "");
  const [color, setColor] = useState(account?.color ?? COLORS[0]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Account = {
      id: account?.id ?? `acc${Date.now()}`,
      name: name.trim(),
      type,
      baseBalance: Number(balance) || 0,
      color,
      institution: institution.trim(),
    };
    if (isEdit) {
      dispatch({ type: "EDIT_ACCOUNT", payload });
    } else {
      dispatch({ type: "ADD_ACCOUNT", payload });
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit account" : "Add account"} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <FormField label="Account name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HDFC Savings"
            data-testid="input-account-name"
            className={inputCls}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof ACCOUNT_TYPES[number])}
              className={selectCls}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Current balance (₹)">
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              data-testid="input-account-balance"
              className={inputCls}
            />
          </FormField>
        </div>

        <FormField label="Institution">
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. HDFC Bank"
            className={inputCls}
          />
        </FormField>

        <div>
          <p className="text-xs font-bold text-[#686f6c]">Colour</p>
          <div className="mt-2 flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full ring-2 ring-offset-2 transition"
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
          <Button type="submit" primary testId="button-save-account">
            {isEdit ? "Save changes" : "Add account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
