/**
 * VISUAL FREEZE: These are the exact visual primitives from the original App.tsx.
 * Do NOT modify colors, typography, spacing, border-radius, shadows, or any styling.
 * Only add functionality. Smallest possible change rule applies.
 */
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({
  children, className = "", onClick, testId, style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  testId?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      style={style}
      className={`rounded-[18px] border border-[#e3ddcf] bg-[#fbfaf5] shadow-[0_5px_16px_rgba(27,38,62,.045)] ${onClick ? "cursor-pointer transition-transform hover:-translate-y-0.5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

export function Button({
  children, primary = false, onClick, className = "", testId, type = "button", disabled = false,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  className?: string;
  testId?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#167b73]/30 disabled:opacity-50 ${primary ? "bg-[#167b73] text-[#fbfaf5] hover:bg-[#126b64]" : "border border-[#ddd6c8] bg-[#f8f6ef] text-[#263043] hover:bg-[#eeeae0]"} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export function Badge({
  children, tone = "neutral",
}: {
  children: ReactNode;
  tone?: "positive" | "negative" | "warning" | "neutral" | "yellow";
}) {
  const colors = {
    positive: "bg-[#dcefe6] text-[#16725f]",
    negative: "bg-[#f8dedc] text-[#a83d39]",
    warning: "bg-[#fff0cf] text-[#a86b19]",
    neutral: "bg-[#e9e6dd] text-[#58606a]",
    yellow: "bg-[#fff1a9] text-[#5d531c]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold tracking-wide ${colors[tone]}`}>
      {children}
    </span>
  );
}

// ─── Metric ──────────────────────────────────────────────────────────────────

export function Metric({
  label, value, detail, trend, icon: Icon, accent = "#167b73", onClick,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down";
  icon: React.FC<{ size?: number }>;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <Card onClick={onClick} className="p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}17`, color: accent }}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold ${trend === "up" ? "text-[#16816d]" : "text-[#bd514d]"}`}>
            {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend === "up" ? "On track" : "Watch"}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[.12em] text-[#747773]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight text-[#263043]">{value}</p>
      <p className="mt-1 text-xs text-[#747773]">{detail}</p>
    </Card>
  );
}

// ─── MiniBars ────────────────────────────────────────────────────────────────

export function MiniBars({ values, color = "#167b73" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === values.length - 1 ? color : `${color}55`,
          }}
        />
      ))}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────

export function SectionTitle({
  eyebrow, title, sub, action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-data text-[10px] uppercase tracking-[.18em] text-[#167b73]">{eyebrow}</p>
        )}
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-.03em] text-[#263043] md:text-[34px]">
          {title}
        </h1>
        {sub && <p className="mt-1 text-sm text-[#747773]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── CashflowChart ───────────────────────────────────────────────────────────

export function CashflowChart({
  data, height = 240,
}: {
  data: { month: string; income: number; out: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 5, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="areaTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#167b73" stopOpacity=".26" />
            <stop offset="100%" stopColor="#167b73" stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e9e4d9" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8a8b84" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#8a8b84" }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <ChartTooltip contentStyle={{ border: "1px solid #e2dbce", borderRadius: 10, fontSize: 12 }} />
        <Area type="monotone" dataKey="income" stroke="#167b73" strokeWidth={2.5} fill="url(#areaTeal)" />
        <Area type="monotone" dataKey="out" stroke="#ed9d3d" strokeWidth={2} fill="none" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  title, children, onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#20293c]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-t-3xl border border-[#ddd6c8] bg-[#fbfaf5] p-5 shadow-[0_20px_60px_rgba(27,38,62,.2)] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#eeeae0]" data-testid="button-close-modal">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ─── FormField ───────────────────────────────────────────────────────────────

export function FormField({
  label, children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-bold text-[#686f6c]">
      {label}
      {children}
    </label>
  );
}

export const inputCls =
  "mt-1 h-10 w-full rounded-xl border border-[#ddd6c8] bg-[#f8f6ef] px-3 text-sm outline-none focus:border-[#167b73]";
export const selectCls =
  "mt-1 h-10 w-full rounded-xl border border-[#ddd6c8] bg-[#f8f6ef] px-3 text-sm outline-none focus:border-[#167b73]";

// ─── Money formatters ─────────────────────────────────────────────────────────

export const money = (n: number) =>
  `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const compact = (n: number) =>
  Math.abs(n) >= 100000
    ? `₹${(Math.abs(n) / 100000).toFixed(2)}L`
    : money(n);
