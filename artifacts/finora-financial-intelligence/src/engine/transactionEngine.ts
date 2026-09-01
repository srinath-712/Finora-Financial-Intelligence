import type { Account, Transaction } from "./types";

export function currentMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Computes the live balance of an account by applying all transactions (debits, credits, transfers) */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.baseBalance;

  for (const t of transactions) {
    if (t.account === account.id) {
      if (t.type === "credit") {
        balance += t.amount;
      } else if (t.type === "debit" || t.type === "transfer") {
        balance -= t.amount;
      }
    } else if (t.type === "transfer" && t.toAccount === account.id) {
      balance += t.amount;
    }
  }

  return balance;
}

/** Returns all accounts with their live calculated balances */
export function calculateAccountsWithBalances(accounts: Account[], transactions: Transaction[]) {
  return accounts.map((a) => ({
    ...a,
    balance: calculateAccountBalance(a, transactions),
  }));
}

/** Total Net Worth = sum of all account balances (including negative credit card balances) */
export function calculateNetWorth(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, a) => sum + calculateAccountBalance(a, transactions), 0);
}

/** Available Cash = sum of bank + cash account balances only */
export function calculateAvailableCash(accounts: Account[], transactions: Transaction[]): number {
  const cashTypes = ["bank", "cash"];
  return accounts
    .filter((a) => cashTypes.includes(a.type))
    .reduce((sum, a) => sum + calculateAccountBalance(a, transactions), 0);
}

/** Returns transactions for a given month (YYYY-MM). Excludes transfers when filtering income/expenses. */
export function getMonthlyTransactions(transactions: Transaction[], monthISO?: string): Transaction[] {
  const month = monthISO ?? currentMonthISO();
  return transactions.filter((t) => t.date.startsWith(month));
}

/** Total monthly income (credits only, excluding transfers) */
export function calculateMonthlyIncome(transactions: Transaction[], monthISO?: string): number {
  return getMonthlyTransactions(transactions, monthISO)
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Total monthly expenses (debits only, excluding transfers) */
export function calculateMonthlyExpenses(transactions: Transaction[], monthISO?: string): number {
  return getMonthlyTransactions(transactions, monthISO)
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Net savings for the month = Income - Expenses */
export function calculateMonthlySaved(transactions: Transaction[], monthISO?: string): number {
  return calculateMonthlyIncome(transactions, monthISO) - calculateMonthlyExpenses(transactions, monthISO);
}

/** Savings rate = (Net Savings / Income) * 100 */
export function calculateSavingsRate(transactions: Transaction[], monthISO?: string): number {
  const income = calculateMonthlyIncome(transactions, monthISO);
  if (income <= 0) return 0;
  return (calculateMonthlySaved(transactions, monthISO) / income) * 100;
}

/** Category spending breakdown for debits in a given month */
export function calculateCategorySpending(transactions: Transaction[], monthISO?: string): Record<string, number> {
  const txs = getMonthlyTransactions(transactions, monthISO).filter((t) => t.type === "debit");
  return txs.reduce(
    (acc, t) => ({ ...acc, [t.category]: (acc[t.category] ?? 0) + t.amount }),
    {} as Record<string, number>
  );
}

/** Last N months cashflow chart data */
export function calculateMonthlyChartData(transactions: Transaction[], months = 6) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    result.push({
      month: label,
      income: calculateMonthlyIncome(transactions, iso),
      out: calculateMonthlyExpenses(transactions, iso),
    });
  }
  return result;
}
