/**
 * VISUAL FREEZE: Shell layout exactly preserved from original App.tsx.
 * Sidebar, header, mobile nav — no styling changes.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity, BarChart3, Bell, BrainCircuit, BriefcaseBusiness,
  Database, FileText, Gauge, IndianRupee, Landmark, LayoutDashboard,
  ListFilter, Menu, Plus, RefreshCw, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Target, UserRound, Wallet, X,
} from "lucide-react";
import { Button } from "./primitives";

const navGroups = [
  {
    label: "Money",
    items: [
      { path: "/overview",      label: "Overview",      icon: LayoutDashboard },
      { path: "/transactions",  label: "Transactions",  icon: ListFilter       },
      { path: "/accounts",      label: "Accounts",      icon: Wallet           },
      { path: "/budgets",       label: "Budgets",       icon: Gauge            },
      { path: "/goals",         label: "Goals",         icon: Target           },
      { path: "/recurring",     label: "Recurring",     icon: RefreshCw        },
    ],
  },
  {
    label: "Markets",
    items: [
      { path: "/portfolio",      label: "Portfolio",       icon: BriefcaseBusiness },
      { path: "/stock-analysis", label: "Stock analysis",  icon: BarChart3         },
      { path: "/agents",         label: "QuantAgents-NSE", icon: BrainCircuit      },
      { path: "/market",         label: "Market pulse",    icon: Activity          },
      { path: "/institutional",  label: "Institutional",   icon: Landmark          },
      { path: "/risk",           label: "Risk room",       icon: ShieldCheck       },
      { path: "/simulator",      label: "Simulator",       icon: SlidersHorizontal },
    ],
  },
  {
    label: "Understand",
    items: [
      { path: "/reports",   label: "Reports",          icon: FileText  },
      { path: "/assistant", label: "Finora assistant", icon: Sparkles  },
      { path: "/profile",   label: "My profile",       icon: UserRound },
    ],
  },
];

interface ShellProps {
  children: ReactNode;
  onQuickAdd: () => void;
}

export function Shell({ children, onQuickAdd }: ShellProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);

  const searchRoute = search.toLowerCase().includes("stock") || search.toLowerCase().includes("reliance")
    ? "/stock-analysis"
    : search.toLowerCase().includes("budget")
    ? "/budgets"
    : search.toLowerCase().includes("transaction")
    ? "/transactions"
    : search.toLowerCase().includes("goal")
    ? "/goals"
    : search.toLowerCase().includes("portfolio")
    ? "/portfolio"
    : "/assistant";

  return (
    <div className="finora-shell noise flex text-[#263043]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col bg-[#20293c] px-3 py-5 text-[#f6f2e7] transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-7 flex items-center justify-between px-3">
          <Link href="/overview" data-testid="link-logo" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4d65e] text-[#20293c]">
              <IndianRupee size={20} strokeWidth={3} />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-.06em]">
              finora<span className="text-[#f4d65e]">.</span>
            </span>
          </Link>
          <button data-testid="button-close-sidebar" className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* QuantAgents banner */}
        <div className="mb-5 rounded-2xl bg-[#2a354c] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-[pulse-dot_2s_infinite] rounded-full bg-[#f4d65e]" />
            <span className="font-data text-[10px] uppercase tracking-widest text-[#d6dbd5]">QuantAgents-NSE</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#abb5c2]">Your market intelligence layer is online.</p>
          <Link href="/agents" className="mt-3 block text-xs font-bold text-[#f4d65e]" data-testid="link-quantagents">
            Open agent room →
          </Link>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 font-data text-[9px] uppercase tracking-[.18em] text-[#7f8a9d]">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    href={path}
                    data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${location === path ? "bg-[#f4d65e] font-bold text-[#20293c]" : "text-[#c6ccd5] hover:bg-[#2a354c] hover:text-white"}`}
                  >
                    <Icon size={16} strokeWidth={location === path ? 2.5 : 1.8} />
                    <span>{label}</span>
                    {label === "Finora assistant" && (
                      <span className="ml-auto rounded bg-[#3e8a80] px-1.5 text-[9px]">AI</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="mt-4 border-t border-[#364257] pt-4">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-[#2a354c]" data-testid="link-sidebar-profile">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ed9d3d] text-sm font-bold text-[#20293c]">AM</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Aarav Mehta</span>
              <span className="block truncate text-[11px] text-[#909bad]">Bengaluru · Pro plan</span>
            </span>
            <Settings2 size={15} className="ml-auto text-[#8390a4]" />
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#20293c]/45 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-[#e3ddcf] bg-[#f4f0e7]/90 px-4 backdrop-blur-lg md:px-8">
          <button
            className="rounded-lg p-2 hover:bg-[#e9e5db] md:hidden"
            onClick={() => setMobileOpen(true)}
            data-testid="button-open-sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative max-w-[430px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8b84]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) setLocation(searchRoute);
              }}
              placeholder="Search money, stocks, insights..."
              data-testid="input-global-search"
              className="h-10 w-full rounded-xl border border-[#e3ddcf] bg-[#fbfaf5] pl-9 pr-4 text-sm outline-none transition focus:border-[#167b73]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button onClick={onQuickAdd} testId="button-quick-add">
              <Plus size={16} />
              <span className="hidden sm:inline">Quick add</span>
            </Button>

            <button
              onClick={() => setNotice(!notice)}
              className="relative rounded-xl p-2.5 hover:bg-[#e9e5db]"
              data-testid="button-notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ca6471]" />
            </button>

            <Link href="/profile" data-testid="link-header-profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ed9d3d] text-xs font-bold">
              AM
            </Link>
          </div>

          {/* Notifications popover */}
          {notice && (
            <div className="absolute right-16 top-16 w-72 rounded-2xl border border-[#ddd6c8] bg-[#fbfaf5] p-4 shadow-[0_16px_40px_rgba(30,35,50,.14)]">
              <div className="flex justify-between">
                <b className="text-sm">Today in Finora</b>
                <button onClick={() => setNotice(false)}><X size={15} /></button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#646b70]">Your budgets and portfolio are synced to your latest transactions.</p>
              <div className="mt-3">
                <Link href="/budgets" className="text-xs font-bold text-[#167b73]">See budget insight →</Link>
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <div className="p-4 pb-24 md:p-8 md:pb-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-[#dcd5c7] bg-[#fbfaf5]/95 p-2 backdrop-blur md:hidden">
        <Link href="/overview"      className="p-2 text-[#167b73]" data-testid="mobile-nav-overview"><LayoutDashboard size={19} /></Link>
        <Link href="/transactions"  className="p-2 text-[#6e746f]" data-testid="mobile-nav-transactions"><ListFilter size={19} /></Link>
        <button onClick={onQuickAdd} className="flex h-10 w-10 -translate-y-4 items-center justify-center rounded-full bg-[#167b73] text-white shadow-lg" data-testid="mobile-quick-add">
          <Plus />
        </button>
        <Link href="/portfolio"  className="p-2 text-[#6e746f]" data-testid="mobile-nav-portfolio"><BriefcaseBusiness size={19} /></Link>
        <Link href="/assistant"  className="p-2 text-[#6e746f]" data-testid="mobile-nav-assistant"><Sparkles size={19} /></Link>
      </div>
    </div>
  );
}
