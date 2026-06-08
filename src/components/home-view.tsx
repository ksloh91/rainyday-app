"use client";

import { useMemo } from "react";
import { HomeEmptyState } from "@/components/home-empty-state";
import { HomeLogNudge } from "@/components/home-log-nudge";
import { HomeSummaryCard } from "@/components/home-summary-card";
import {
  TransactionDayList,
  type TransactionRow,
} from "@/components/transaction-day-list";
import { buildBudgetStatuses, type CategoryBudget } from "@/lib/budgets";
import { getCategoryLabel } from "@/lib/categories";
import { isToday } from "@/lib/format-date";
import { computeInsights } from "@/lib/insights";

type HomeViewProps = {
  rows: TransactionRow[];
  budgets?: CategoryBudget[];
  error?: string | null;
  onEditTransaction?: (transaction: TransactionRow) => void;
  onOpenInsights?: () => void;
  onAddTransaction?: () => void;
};

function combinedDailyBudgetPercent(
  statuses: ReturnType<typeof buildBudgetStatuses>,
): number | null {
  const daily = statuses.filter((s) => s.period === "daily");
  if (daily.length === 0) return null;

  const totalLimit = daily.reduce((sum, s) => sum + s.limit, 0);
  const totalSpent = daily.reduce((sum, s) => sum + s.spent, 0);
  if (totalLimit <= 0) return null;

  return Math.min(150, (totalSpent / totalLimit) * 100);
}

export function HomeView({
  rows,
  budgets = [],
  error,
  onEditTransaction,
  onOpenInsights,
  onAddTransaction,
}: HomeViewProps) {
  const todaySpent = useMemo(() => {
    return rows
      .filter((r) => isToday(r.occurredAt) && r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [rows]);

  const hasAnyTransactions = rows.length > 0;
  const hasTodayTransactions = useMemo(
    () => rows.some((r) => isToday(r.occurredAt)),
    [rows],
  );
  const hasTodayExpenses = useMemo(
    () =>
      rows.some((r) => isToday(r.occurredAt) && r.type === "expense"),
    [rows],
  );

  const { dailyBudgetPercent, dailyBudgets, weeklyBudgets, monthlyBudgets, weekSpent } =
    useMemo(() => {
      const statuses = buildBudgetStatuses(budgets, rows, getCategoryLabel);
      const insights = computeInsights(rows, statuses);
      return {
        dailyBudgetPercent: combinedDailyBudgetPercent(statuses),
        dailyBudgets: statuses.filter((s) => s.period === "daily"),
        weeklyBudgets: statuses.filter((s) => s.period === "weekly"),
        monthlyBudgets: statuses.filter((s) => s.period === "monthly"),
        weekSpent: insights.weekSpent,
      };
    }, [budgets, rows]);

  return (
    <div className="space-y-5">
      <HomeSummaryCard
        todaySpent={todaySpent}
        weekSpent={weekSpent}
        dailyBudgetPercent={dailyBudgetPercent}
        dailyBudgets={dailyBudgets}
        weeklyBudgets={weeklyBudgets}
        monthlyBudgets={monthlyBudgets}
        onOpenInsights={onOpenInsights}
      />

      <section className="space-y-4">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        {onAddTransaction ? (
          <HomeLogNudge
            hasLoggedToday={hasTodayExpenses}
            onAdd={onAddTransaction}
          />
        ) : null}

        {!hasAnyTransactions ? (
          <HomeEmptyState variant="no-transactions" />
        ) : (
          <>
            {!hasTodayTransactions ? (
              <HomeEmptyState variant="quiet-today" />
            ) : null}
            <TransactionDayList
              rows={rows}
              onEdit={onEditTransaction}
              variant="home"
            />
          </>
        )}
      </section>
    </div>
  );
}
