import { useStore } from "../store/context";
import { Activity, ArrowDownLeft, Landmark, TrendingUp } from "lucide-react";
import { Card, SectionTitle, Metric, Badge } from "../components/primitives";

const HEAT_COLORS = ["#167b73","#258a78","#5baa83","#ed9d3d","#ca6471","#bd514d","#2e8b7f","#edb15e","#8cae82","#df8168","#5a9989","#cc6a61","#74a687","#e3aa65","#c37268","#3f927d","#9db681","#e39772"];
const SECTORS = ["BANK","IT","AUTO","FMCG","PHARMA","METAL"];

export function Market() {
  const { state } = useStore();
  const { nifty50, bankNifty, sensex, fiiFLow, diiFlow, advances, declines, unchanged } = state.market;

  return (
    <>
      <SectionTitle
        eyebrow="Markets / India"
        title="Market pulse"
        sub="NIFTY 50 is finding its footing after a noisy open."
        action={<Badge tone="positive">Live · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="NIFTY 50"   value={nifty50.value.toLocaleString("en-IN")}   detail={`${nifty50.change >= 0 ? "+" : ""}${nifty50.change}% today`}   trend={nifty50.change >= 0 ? "up" : "down"}   icon={TrendingUp} accent="#167b73" />
        <Metric label="BANK NIFTY" value={bankNifty.value.toLocaleString("en-IN")} detail={`${bankNifty.change >= 0 ? "+" : ""}${bankNifty.change}% today`} trend={bankNifty.change >= 0 ? "up" : "down"} icon={Landmark}   accent="#5278c5" />
        <Metric label="SENSEX"     value={sensex.value.toLocaleString("en-IN")}    detail={`${sensex.change >= 0 ? "+" : ""}${sensex.change}% today`}    trend={sensex.change >= 0 ? "up" : "down"}    icon={Activity}   accent="#ed9d3d" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        {/* Heatmap */}
        <Card className="p-5">
          <SectionTitle eyebrow="Broad market" title="Sector heatmap" sub="One glance at where the tape is warm." />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {HEAT_COLORS.map((c, i) => (
              <div key={i} className="flex h-16 flex-col justify-between rounded-lg p-2 text-white" style={{ background: c }}>
                <span className="font-data text-[9px]">{SECTORS[i % 6]}</span>
                <b className="text-xs">+{(0.3 + i * 0.17).toFixed(1)}%</b>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#eee8dc] pt-4 text-xs">
            <span className="text-[#747773]">Advances <b className="text-[#167b73]">{advances.toLocaleString()}</b></span>
            <span className="text-[#747773]">Declines <b className="text-[#bd514d]">{declines.toLocaleString()}</b></span>
            <span className="text-[#747773]">Unchanged <b>{unchanged}</b></span>
          </div>
        </Card>

        {/* Today's movers — from watchlist */}
        <Card className="p-5">
          <SectionTitle eyebrow="The board" title="Today's movers" />
          <div className="space-y-3">
            {state.watchlist.map((w) => (
              <div key={w.id} className="flex items-center gap-3 border-b border-[#eee8dc] pb-3 last:border-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eeeae0] font-data text-[9px] font-bold">
                  {w.symbol.slice(0, 2)}
                </span>
                <span className="flex-1">
                  <b className="block text-xs">{w.symbol}</b>
                  <small className="text-[10px] text-[#888b85]">{w.name}</small>
                </span>
                <span className="text-right">
                  <b className="block font-data text-xs">₹{w.price.toLocaleString("en-IN")}</b>
                  <small className={`font-data text-[10px] ${w.change >= 0 ? "text-[#167b73]" : "text-[#bd514d]"}`}>
                    {w.change >= 0 ? "+" : ""}{w.change}%
                  </small>
                </span>
              </div>
            ))}
            {state.watchlist.length === 0 && (
              <p className="py-6 text-center text-xs text-[#888b85]">Add stocks to your watchlist to see them here.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Flows */}
      <Card className="mt-5 p-5">
        <SectionTitle eyebrow="Flows & calendar" title="What is shaping the session" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#e7f1eb] p-4">
            <p className="text-xs text-[#567267]">FII net flow</p>
            <b className="mt-1 block font-display text-2xl text-[#167b73]">+₹{(fiiFLow / 100).toLocaleString("en-IN")}Cr</b>
            <small className="text-xs text-[#747773]">Second positive day</small>
          </div>
          <div className="rounded-xl bg-[#fff0cf] p-4">
            <p className="text-xs text-[#856b3e]">DII net flow</p>
            <b className="mt-1 block font-display text-2xl text-[#a86b19]">+₹{(diiFlow / 100).toLocaleString("en-IN")}Cr</b>
            <small className="text-xs text-[#747773]">Mutual funds absorbing dips</small>
          </div>
          <div className="rounded-xl bg-[#eeeaf7] p-4">
            <p className="text-xs text-[#6d6292]">Next event</p>
            <b className="mt-1 block font-display text-lg">RBI policy · next quarter</b>
            <small className="text-xs text-[#747773]">Consensus holds at 6.5%</small>
          </div>
        </div>
      </Card>
    </>
  );
}
