import type { CategoryId } from "@/lib/categories";
import { categoriesForType } from "@/lib/categories";
import { isThisMonth, isThisWeek, isToday } from "@/lib/format-date";
import type { Transaction } from "@/lib/transactions";

export type BudgetPeriod = "daily" | "weekly" | "monthly";

export type CategoryBudget = {
  categoryId: CategoryId;
  currency: string;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
};

export type ActiveBudget = {
  categoryId: CategoryId;
  period: BudgetPeriod;
  limit: number;
  currency: string;
};

export type CategoryBudgetStatus = ActiveBudget & {
  label: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  periodTitle: string;
  remainingLabel: string;
};

export type BudgetStatusGroup = {
  period: BudgetPeriod;
  title: string;
  statuses: CategoryBudgetStatus[];
};

const expenseCategoryIds = new Set(
  categoriesForType("expense").map((c) => c.id),
);

const PERIOD_ORDER: BudgetPeriod[] = ["daily", "weekly", "monthly"];

const PERIOD_TITLES: Record<BudgetPeriod, string> = {
  daily: "Today",
  weekly: "This week",
  monthly: "This month",
};

const REMAINING_LABELS: Record<BudgetPeriod, string> = {
  daily: "left today",
  weekly: "left this week",
  monthly: "left this month",
};

export function isExpenseCategoryId(id: string): id is CategoryId {
  return expenseCategoryIds.has(id as CategoryId);
}

function positiveLimit(value: unknown): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export function parseCategoryBudgetDoc(
  categoryId: string,
  data: Record<string, unknown>,
): CategoryBudget | null {
  if (!isExpenseCategoryId(categoryId)) return null;

  const dailyLimit = positiveLimit(data.dailyLimit);
  const weeklyLimit = positiveLimit(data.weeklyLimit);
  const monthlyLimit = positiveLimit(data.monthlyLimit);

  if (!dailyLimit && !weeklyLimit && !monthlyLimit) return null;

  return {
    categoryId,
    currency: String(data.currency ?? "MYR"),
    dailyLimit,
    weeklyLimit,
    monthlyLimit,
  };
}

export function flattenActiveBudgets(budget: CategoryBudget): ActiveBudget[] {
  const items: ActiveBudget[] = [];
  if (budget.dailyLimit) {
    items.push({
      categoryId: budget.categoryId,
      period: "daily",
      limit: budget.dailyLimit,
      currency: budget.currency,
    });
  }
  if (budget.weeklyLimit) {
    items.push({
      categoryId: budget.categoryId,
      period: "weekly",
      limit: budget.weeklyLimit,
      currency: budget.currency,
    });
  }
  if (budget.monthlyLimit) {
    items.push({
      categoryId: budget.categoryId,
      period: "monthly",
      limit: budget.monthlyLimit,
      currency: budget.currency,
    });
  }
  return items;
}

function matchesPeriod(date: Date, period: BudgetPeriod, now = new Date()) {
  if (period === "daily") return isToday(date);
  if (period === "weekly") return isThisWeek(date, now);
  return isThisMonth(date, now);
}

export function spentByCategoryForPeriod(
  transactions: Transaction[],
  period: BudgetPeriod,
  now = new Date(),
): Map<CategoryId, number> {
  const totals = new Map<CategoryId, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense" || !matchesPeriod(tx.occurredAt, period, now)) {
      continue;
    }
    if (!isExpenseCategoryId(tx.category)) continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
  }

  return totals;
}

export function buildBudgetStatuses(
  budgets: CategoryBudget[],
  transactions: Transaction[],
  getLabel: (id: CategoryId) => string,
  now = new Date(),
): CategoryBudgetStatus[] {
  const spentByPeriod = {
    daily: spentByCategoryForPeriod(transactions, "daily", now),
    weekly: spentByCategoryForPeriod(transactions, "weekly", now),
    monthly: spentByCategoryForPeriod(transactions, "monthly", now),
  } as const;

  const statuses: CategoryBudgetStatus[] = [];

  for (const budget of budgets) {
    for (const active of flattenActiveBudgets(budget)) {
      const spent = spentByPeriod[active.period].get(active.categoryId) ?? 0;
      const remaining = Math.max(0, active.limit - spent);
      const percentUsed =
        active.limit > 0
          ? Math.min(150, (spent / active.limit) * 100)
          : 0;

      statuses.push({
        ...active,
        label: getLabel(active.categoryId),
        spent,
        remaining,
        percentUsed,
        periodTitle: PERIOD_TITLES[active.period],
        remainingLabel: REMAINING_LABELS[active.period],
      });
    }
  }

  return statuses.sort((a, b) => b.percentUsed - a.percentUsed);
}

export function groupBudgetStatuses(
  statuses: CategoryBudgetStatus[],
): BudgetStatusGroup[] {
  const groups: BudgetStatusGroup[] = [];

  for (const period of PERIOD_ORDER) {
    const items = statuses.filter((s) => s.period === period);
    if (items.length === 0) continue;
    groups.push({
      period,
      title: PERIOD_TITLES[period],
      statuses: items,
    });
  }

  return groups;
}

export type CategoryBudgetLimits = {
  daily?: number | null;
  weekly?: number | null;
  monthly?: number | null;
};
