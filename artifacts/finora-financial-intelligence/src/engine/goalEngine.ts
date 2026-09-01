import type { Goal, GoalAnalysis } from "./types";

/** Parses targetDate string like "Dec 2026" or "2026-12" into months from now */
function getMonthsUntilTarget(targetDateStr: string): number {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth();

  const parts = targetDateStr.trim().split(" ");
  if (parts.length === 2) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mIdx = monthNames.findIndex((m) => m.toLowerCase() === parts[0].toLowerCase());
    if (mIdx !== -1) targetMonth = mIdx;
    const yr = parseInt(parts[1], 10);
    if (!isNaN(yr)) targetYear = yr;
  }

  const monthsDiff = (targetYear - now.getFullYear()) * 12 + (targetMonth - now.getMonth());
  return Math.max(1, monthsDiff);
}

export function analyzeGoal(goal: Goal): GoalAnalysis {
  const progressPct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
  const remainingAmount = Math.max(0, goal.target - goal.current);

  const monthsLeft = getMonthsUntilTarget(goal.targetDate);
  const requiredMonthlyContribution = Math.round(remainingAmount / monthsLeft);

  // Projected months to reach goal at current monthly contribution rate
  const monthsToComplete = goal.monthlyContribution > 0
    ? Math.ceil(remainingAmount / goal.monthlyContribution)
    : 999;

  const now = new Date();
  const projDate = new Date(now.getFullYear(), now.getMonth() + monthsToComplete, 1);
  const projectedCompletionDate = `${projDate.toLocaleString("default", { month: "short" })} ${projDate.getFullYear()}`;

  // Sufficiency check
  let sufficiencyStatus: "sufficient" | "behind" | "critical" = "sufficient";
  if (progressPct >= 100) {
    sufficiencyStatus = "sufficient";
  } else if (goal.monthlyContribution <= 0) {
    sufficiencyStatus = "critical";
  } else if (goal.monthlyContribution < requiredMonthlyContribution * 0.8) {
    sufficiencyStatus = "behind";
  }

  return {
    ...goal,
    progressPct,
    remainingAmount,
    requiredMonthlyContribution,
    projectedCompletionDate,
    sufficiencyStatus,
  };
}

export function analyzeAllGoals(goals: Goal[]): GoalAnalysis[] {
  return goals.map((g) => analyzeGoal(g));
}

export function countGoalsOnTrack(goals: Goal[]): number {
  return analyzeAllGoals(goals).filter((g) => g.progressPct >= 50 || g.sufficiencyStatus === "sufficient").length;
}
