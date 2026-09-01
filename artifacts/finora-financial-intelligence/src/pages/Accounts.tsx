import { useState } from "react";
import { BriefcaseBusiness, CreditCard, Landmark, MoreHorizontal, Plus, Wallet } from "lucide-react";
import { useStore } from "../store/context";
import { getAccountsWithBalances, getNetWorth } from "../store/selectors";
import { Card, SectionTitle, Button, money } from "../components/primitives";
import { AccountModal } from "../components/modals/AccountModal";
import type { Account } from "../store/data";

const typeIcon = (type: Account["type"]) => {
  if (type === "credit") return CreditCard;
  if (type === "investment") return BriefcaseBusiness;
  if (type === "cash") return Wallet;
  return Landmark;
};

export function Accounts({ go }: { go: (p: string) => void }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const accounts = getAccountsWithBalances(state);
  const netWorth = getNetWorth(state);

  // Allocation slices for pie
  const nonNegative = accounts.filter((a) => a.balance > 0);
  const total = nonNegative.reduce((s, a) => s + a.balance, 0);
  let cumulative = 0;
  const slices = nonNegative.map((a) => {
    const pct = total > 0 ? (a.balance / total) * 100 : 0;
    const slice = { ...a, pct, start: cumulative };
    cumulative += pct;
    return slice;
  });

  const conicGradient = slices.length > 0
    ? `conic-gradient(${slices.map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`).join(", ")})`
    : "conic-gradient(#e9e4d8 0 100%)";

  return (
    <>
      <SectionTitle
        eyebrow="Money / foundations"
        title="Accounts"
        sub="Everything you own, owe, and invest."
        action={
          <Button primary onClick={() => setAdding(true)} testId="button-add-account">
            <Plus size={15} /> Add account
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a, i) => {
          const Icon = typeIcon(a.type);
          return (
            <Card key={a.id} className="p-5" testId={`card-account-${i}`}>
              <div className="flex items-start justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ color: a.color, background: `${a.color}18` }}
                >
                  <Icon size={19} />
                </span>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                    className="text-[#8e918b]"
                    data-testid={`button-account-menu-${i}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menuOpen === a.id && (
                    <div className="absolute right-0 top-6 z-10 w-36 rounded-xl border border-[#e3ddcf] bg-[#fbfaf5] py-1 shadow-lg">
                      <button
                        onClick={() => { setEditing(a); setMenuOpen(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-[#f1eee6]"
                      >
                        Edit account
                      </button>
                      <button
                        onClick={() => { dispatch({ type: "DELETE_ACCOUNT", payload: { id: a.id } }); setMenuOpen(null); }}
                        className="w-full px-4 py-2 text-left text-xs text-[#a83d39] hover:bg-[#f8dedc]"
                      >
                        Delete account
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-6 text-sm font-bold">{a.name}</p>
              <p className="mt-1 text-xs text-[#888b85]">{a.institution} · {a.type}</p>
              <p className={`mt-3 font-display text-2xl font-bold ${a.balance < 0 ? "text-[#bd514d]" : ""}`}>
                {money(Math.abs(a.balance))}{a.balance < 0 && <span className="ml-1 text-sm">owed</span>}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Net worth breakdown */}
      <Card className="mt-5 p-5 md:p-6">
        <SectionTitle
          eyebrow="Balance sheet"
          title="Net worth by layer"
          sub={`Your ${money(netWorth)} in one clear picture.`}
        />
        <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr]">
          <div className="flex items-center justify-center">
            <div className="relative h-52 w-52 rounded-full" style={{ background: conicGradient }}>
              <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-[#fbfaf5]">
                <b className="font-display text-2xl">{money(netWorth)}</b>
                <span className="text-xs text-[#888b85]">net worth</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            {slices.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <i className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-sm">{s.name}</span>
                <span className="font-data text-xs text-[#747773]">{s.pct.toFixed(0)}%</span>
                <b className="w-20 text-right text-sm">{money(s.balance)}</b>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Modals */}
      {adding && <AccountModal onClose={() => setAdding(false)} />}
      {editing && <AccountModal account={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
