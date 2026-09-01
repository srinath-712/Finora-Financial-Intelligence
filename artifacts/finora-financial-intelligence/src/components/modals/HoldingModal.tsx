import { useState } from "react";
import { Modal, Button, FormField, inputCls } from "../primitives";
import { useStore } from "../../store/context";
import type { Holding } from "../../store/data";
import { STOCK_DETAILS } from "../../store/data";

const SECTORS = ["IT", "Financials", "Energy", "Consumer", "Telecom", "Industrials", "Auto", "Healthcare", "FMCG", "Others"];

export function HoldingModal({
  holding,
  onClose,
}: {
  holding?: Holding;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const isEdit = !!holding;

  const [symbol, setSymbol] = useState(holding?.symbol ?? "");
  const [name, setName] = useState(holding?.name ?? "");
  const [shares, setShares] = useState(String(holding?.shares ?? ""));
  const [avgPrice, setAvgPrice] = useState(String(holding?.avgPrice ?? ""));
  const [currentPrice, setCurrentPrice] = useState(String(holding?.currentPrice ?? ""));
  const [sector, setSector] = useState(holding?.sector ?? "IT");

  // Auto-fill from known stocks when symbol changes
  const handleSymbol = (s: string) => {
    const upper = s.toUpperCase();
    setSymbol(upper);
    const known = STOCK_DETAILS[upper];
    if (known) {
      setCurrentPrice(String(known.week52High));
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Holding = {
      id: holding?.id ?? `h${Date.now()}`,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      shares: Number(shares) || 0,
      avgPrice: Number(avgPrice) || 0,
      currentPrice: Number(currentPrice) || 0,
      sector,
    };
    if (isEdit) {
      dispatch({ type: "EDIT_HOLDING", payload });
    } else {
      dispatch({ type: "ADD_HOLDING", payload });
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit holding" : "Add holding"} onClose={onClose}>
      <form onSubmit={save} className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Symbol (NSE)">
            <input
              required
              value={symbol}
              onChange={(e) => handleSymbol(e.target.value)}
              placeholder="e.g. RELIANCE"
              className={inputCls}
              data-testid="input-holding-symbol"
            />
          </FormField>
          <FormField label="Company name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reliance Industries"
              className={inputCls}
              data-testid="input-holding-name"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Shares">
            <input
              required
              type="number"
              min="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-holding-shares"
            />
          </FormField>
          <FormField label="Avg price (₹)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-holding-avgprice"
            />
          </FormField>
          <FormField label="Current price (₹)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="0"
              className={inputCls}
              data-testid="input-holding-price"
            />
          </FormField>
        </div>

        <FormField label="Sector">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputCls}
          >
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </FormField>

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary testId="button-save-holding">
            {isEdit ? "Save changes" : "Add holding"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
