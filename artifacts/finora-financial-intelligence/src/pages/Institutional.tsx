import { useState } from "react";
import { Activity, ArrowDownLeft, Filter, Landmark } from "lucide-react";
import { Card, SectionTitle, Metric, Badge, Button } from "../components/primitives";

const ACTIVITY = [
  ["Mirae Asset MF",         "ICICI Bank",           "Bought", "₹248Cr"],
  ["Government of Singapore","Bharti Airtel",         "Bought", "₹184Cr"],
  ["SBI Mutual Fund",        "Tata Motors",           "Sold",   "₹92Cr"],
  ["Norges Bank",            "Reliance Industries",   "Bought", "₹310Cr"],
  ["Promoter group",         "Titan Company",         "Sold",   "₹48Cr"],
];

export function Institutional() {
  const [filtered, setFiltered] = useState(false);
  const rows = ACTIVITY.filter((r) => !filtered || r[2] === "Bought");

  return (
    <>
      <SectionTitle
        eyebrow="Markets / flows"
        title="Institutional activity"
        sub="Follow the money that moves the market."
        action={
          <Button onClick={() => setFiltered(!filtered)}>
            <Filter size={15} /> {filtered ? "Buying only" : "All activity"}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="FII today"         value="+₹1,284Cr" detail="Positive for 2 sessions"  icon={ArrowDownLeft} accent="#167b73" />
        <Metric label="DII today"         value="+₹842Cr"   detail="Steady domestic buying"    icon={Landmark}      accent="#5278c5" />
        <Metric label="Bulk & block deals" value="₹3,280Cr"  detail="18 disclosed today"        icon={Activity}      accent="#ed9d3d" />
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-xl font-bold">Disclosed activity</h2>
          <Badge tone="neutral">{new Date().toLocaleDateString("en-IN")}</Badge>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-[#f4f0e7] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#888b85]">
          <span>Investor</span>
          <span>Company</span>
          <span>Action</span>
          <span className="text-right">Value</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-[#eee8dc] px-5 py-4 text-xs last:border-0">
            <span className="font-semibold">{r[0]}</span>
            <span>{r[1]}</span>
            <span className={r[2] === "Bought" ? "text-[#167b73]" : "text-[#bd514d]"}>{r[2]}</span>
            <b className="text-right font-data">{r[3]}</b>
          </div>
        ))}
      </Card>
    </>
  );
}
