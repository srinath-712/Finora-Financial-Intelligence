import type { DetectedSubscription, RecurringItem, Transaction } from "./types";

/** Normalizes a recurring item to calculate monthly & annual equivalent costs */
export function analyzeRecurringItem(item: RecurringItem): RecurringItem {
  let monthlyEquivalent = item.amount;
  let annualEquivalent = item.amount * 12;

  if (item.frequency === "yearly") {
    monthlyEquivalent = Math.round(item.amount / 12);
    annualEquivalent = item.amount;
  } else if (item.frequency === "weekly") {
    monthlyEquivalent = Math.round(item.amount * 4.33);
    annualEquivalent = Math.round(item.amount * 52);
  }

  return {
    ...item,
    monthlyEquivalent,
    annualEquivalent,
  };
}

export function analyzeAllRecurring(items: RecurringItem[]): RecurringItem[] {
  return items.map((i) => analyzeRecurringItem(i));
}

/** Detects potential unrecorded subscriptions from debit transaction history */
export function detectSubscriptionsFromTransactions(
  transactions: Transaction[],
  existingRecurring: RecurringItem[]
): DetectedSubscription[] {
  const existingMerchants = new Set(existingRecurring.map((r) => r.name.toLowerCase()));
  const debits = transactions.filter((t) => t.type === "debit");

  const merchantGroups: Record<string, Transaction[]> = {};
  for (const t of debits) {
    const key = t.merchant.trim().toLowerCase();
    if (!existingMerchants.has(key)) {
      if (!merchantGroups[key]) merchantGroups[key] = [];
      merchantGroups[key].push(t);
    }
  }

  const detected: DetectedSubscription[] = [];

  for (const [key, txs] of Object.entries(merchantGroups)) {
    if (txs.length >= 2) {
      // Check if amounts are identical or very close
      const amounts = txs.map((t) => t.amount);
      const avgAmt = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
      const isConsistentAmount = amounts.every((a) => Math.abs(a - avgAmt) / avgAmt < 0.15);

      if (isConsistentAmount) {
        const sorted = [...txs].sort((a, b) => (a.date > b.date ? -1 : 1));
        detected.push({
          merchant: txs[0].merchant,
          category: txs[0].category,
          averageAmount: avgAmt,
          frequency: "monthly",
          transactionCount: txs.length,
          lastDate: sorted[0].date,
        });
      }
    }
  }

  return detected;
}
