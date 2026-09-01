import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Modal, Button, FormField, inputCls, selectCls } from "../primitives";
import { useStore } from "../../store/context";
import type { Transaction, TransactionCategory, TransactionType } from "../../engine/types";
import { today } from "../../store/data";

const CATEGORIES: TransactionCategory[] = [
  "Income", "Groceries", "Transport", "Dining", "Subscriptions",
  "Investments", "Shopping", "Housing", "Health", "Utilities",
  "Entertainment", "Personal", "Other",
];

// ─── Quick Add Modal ──────────────────────────────────────────────────────────

export function QuickModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Shopping");
  const [account, setAccount] = useState(state.accounts[0]?.id ?? "");
  const [toAccount, setToAccount] = useState(state.accounts[1]?.id ?? "");
  const [txType, setTxType] = useState<TransactionType>("debit");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: Transaction = {
      id: `t${Date.now()}`,
      merchant: merchant.trim() || (txType === "transfer" ? "Internal Transfer" : "New transaction"),
      category: txType === "transfer" ? "Other" : category,
      account,
      toAccount: txType === "transfer" ? toAccount : undefined,
      date: today(),
      amount: Math.abs(Number(amount)) || 0,
      type: txType,
    };
    dispatch({ type: "ADD_TRANSACTION", payload: tx });
    onClose();
  };

  return (
    <Modal title="Quick add transaction" onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <FormField label="Merchant / Description">
          <input
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={txType === "transfer" ? "e.g. Savings transfer" : "e.g. Third Wave Coffee"}
            data-testid="input-quick-merchant"
            className={inputCls}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Amount">
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₹ 0"
              data-testid="input-quick-amount"
              className={inputCls}
            />
          </FormField>
          <FormField label="Type">
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as TransactionType)}
              className={selectCls}
              data-testid="select-quick-type"
            >
              <option value="debit">Expense</option>
              <option value="credit">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </FormField>
        </div>

        {txType === "transfer" ? (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="From Account">
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className={selectCls}
                data-testid="select-quick-from-account"
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="To Account">
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className={selectCls}
                data-testid="select-quick-to-account"
              >
                {state.accounts.filter((a) => a.id !== account).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                data-testid="select-quick-category"
                className={selectCls}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Account">
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className={selectCls}
                data-testid="select-quick-account"
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-quick">Add transaction</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit / Full Transaction Modal ─────────────────────────────────────────────

export function TransactionModal({
  transaction,
  onClose,
}: {
  transaction?: Transaction;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const isEdit = !!transaction;

  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  const [amount, setAmount] = useState(String(transaction?.amount ?? ""));
  const [category, setCategory] = useState<TransactionCategory>(transaction?.category ?? "Shopping");
  const [account, setAccount] = useState(transaction?.account ?? state.accounts[0]?.id ?? "");
  const [toAccount, setToAccount] = useState(transaction?.toAccount ?? state.accounts[1]?.id ?? "");
  const [date, setDate] = useState(transaction?.date ?? today());
  const [txType, setTxType] = useState<TransactionType>(transaction?.type ?? "debit");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: Transaction = {
      id: transaction?.id ?? `t${Date.now()}`,
      merchant: merchant.trim() || (txType === "transfer" ? "Internal Transfer" : "Transaction"),
      category: txType === "transfer" ? "Other" : category,
      account,
      toAccount: txType === "transfer" ? toAccount : undefined,
      date,
      amount: Math.abs(Number(amount)) || 0,
      type: txType,
    };
    if (isEdit) {
      dispatch({ type: "EDIT_TRANSACTION", payload: tx });
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload: tx });
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <FormField label="Merchant / Description">
          <input
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Swiggy"
            data-testid="input-edit-merchant"
            className={inputCls}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Amount">
            <input
              required
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-edit-amount"
              className={inputCls}
            />
          </FormField>
          <FormField label="Type">
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as TransactionType)}
              className={selectCls}
            >
              <option value="debit">Expense</option>
              <option value="credit">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category">
            <select
              disabled={txType === "transfer"}
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              data-testid="input-edit-category"
              className={selectCls}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-edit-date"
              className={inputCls}
            />
          </FormField>
        </div>

        {txType === "transfer" ? (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="From Account">
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className={selectCls}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="To Account">
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className={selectCls}
              >
                {state.accounts.filter((a) => a.id !== account).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        ) : (
          <FormField label="Account">
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className={selectCls}
            >
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </FormField>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-transaction">
            {isEdit ? "Save changes" : "Add transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Import CSV Modal ─────────────────────────────────────────────────────────

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState("");
  return (
    <Modal title="Import transactions" onClose={onClose}>
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[#cfc8b9] bg-[#f6f2e9] p-8 text-center">
        <Upload className="mx-auto text-[#167b73]" size={27} />
        <p className="mt-3 text-sm font-bold">{file || "Drop a CSV here"}</p>
        <p className="mt-1 text-xs text-[#888b85]">HDFC, ICICI and most bank exports work.</p>
        <label className="mt-4 inline-flex cursor-pointer rounded-xl border border-[#ddd6c8] bg-[#fbfaf5] px-3 py-2 text-xs font-bold">
          Choose file
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
            className="hidden"
            data-testid="input-csv-file"
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button primary onClick={onClose} testId="button-confirm-import">
          <Upload size={15} /> {file ? `Import ${file}` : "Import 0 rows"}
        </Button>
      </div>
    </Modal>
  );
}
