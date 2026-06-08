import { getCategoryLabel, type CategoryId } from "@/lib/categories";
import { isExpenseCategoryId } from "@/lib/budgets";
import {
  formatMoney,
  isLastWeek,
  isThisMonth,
  isThisWeek,
} from "@/lib/format-date";
import type { CategoryBudgetStatus } from "@/lib/budgets";
import {
  merchantDisplayName,
  merchantGroupKey,
  type Transaction,
} from "@/lib/transactions";

export type CategorySpendRow = {
  categoryId: CategoryId;
  label: string;
  amount: number;
  share: number;
};

export type MerchantSpendRow = {
  key: string;
  label: string;
  amount: number;
  share: number;
  count: number;
};

export type InsightsSummary = {
  weekSpent: number;
  weekIncome: number;
  weekNet: number;
  lastWeekSpent: number;
  weekSpentChange: number | null;
  monthSpent: number;
  monthIncome: number;
  topCategories: CategorySpendRow[];
  topMerchants: MerchantSpendRow[];
  overBudgetCount: number;
  nearBudgetCount: number;
};

function sumInRange(
  transactions: Transaction[],
  type: Transaction["type"],
  filter: (date: Date) => boolean,
) {
  return transactions
    .filter((t) => t.type === type && filter(t.occurredAt))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function computeInsights(
  transactions: Transaction[],
  budgetStatuses: CategoryBudgetStatus[] = [],
): InsightsSummary {
  const weekSpent = sumInRange(transactions, "expense", (d) => isThisWeek(d));
  const weekIncome = sumInRange(transactions, "income", (d) => isThisWeek(d));
  const lastWeekSpent = sumInRange(transactions, "expense", (d) => isLastWeek(d));
  const monthSpent = sumInRange(transactions, "expense", (d) => isThisMonth(d));
  const monthIncome = sumInRange(transactions, "income", (d) => isThisMonth(d));

  const weekSpentChange =
    lastWeekSpent > 0
      ? ((weekSpent - lastWeekSpent) / lastWeekSpent) * 100
      : null;

  const categoryTotals = new Map<CategoryId, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense" || !isThisWeek(tx.occurredAt)) continue;
    if (!isExpenseCategoryId(tx.category)) continue;
    categoryTotals.set(
      tx.category,
      (categoryTotals.get(tx.category) ?? 0) + tx.amount,
    );
  }

  const topCategories = [...categoryTotals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      label: getCategoryLabel(categoryId),
      amount,
      share: weekSpent > 0 ? (amount / weekSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const merchantTotals = new Map<
    string,
    { label: string; amount: number; count: number }
  >();
  for (const tx of transactions) {
    if (tx.type !== "expense" || !isThisMonth(tx.occurredAt)) continue;
    const key = merchantGroupKey(tx);
    const label = merchantDisplayName(tx);
    if (!key || !label) continue;
    const existing = merchantTotals.get(key);
    if (existing) {
      existing.amount += tx.amount;
      existing.count += 1;
    } else {
      merchantTotals.set(key, { label, amount: tx.amount, count: 1 });
    }
  }

  const topMerchants = [...merchantTotals.entries()]
    .map(([key, row]) => ({
      key,
      label: row.label,
      amount: row.amount,
      count: row.count,
      share: monthSpent > 0 ? (row.amount / monthSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const overBudgetCount = budgetStatuses.filter((s) => s.spent > s.limit).length;
  const nearBudgetCount = budgetStatuses.filter(
    (s) => s.percentUsed >= 80 && s.spent <= s.limit,
  ).length;

  return {
    weekSpent,
    weekIncome,
    weekNet: weekIncome - weekSpent,
    lastWeekSpent,
    weekSpentChange,
    monthSpent,
    monthIncome,
    topCategories,
    topMerchants,
    overBudgetCount,
    nearBudgetCount,
  };
}

export function formatChangePercent(change: number | null) {
  if (change === null) return "No spend last week";
  const rounded = Math.round(change);
  if (rounded === 0) return "Same as last week";
  const dir = rounded > 0 ? "up" : "down";
  return `${Math.abs(rounded)}% ${dir} vs last week`;
}

export function formatChangeMoney(current: number, previous: number) {
  const diff = current - previous;
  if (previous === 0) return null;
  return `${diff >= 0 ? "+" : "−"}${formatMoney(Math.abs(diff))} vs last week`;
}

export function transactionsForMerchant(
  transactions: Transaction[],
  merchantKey: string,
): Transaction[] {
  return transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        isThisMonth(tx.occurredAt) &&
        merchantGroupKey(tx) === merchantKey,
    )
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}
