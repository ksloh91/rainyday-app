"use client";

import { useMemo } from "react";
import {
  TransactionDayList,
  type TransactionRow,
} from "@/components/transaction-day-list";
import { CategoryBudgetProgress } from "@/components/category-budget-progress";
import {
  buildBudgetStatuses,
  groupBudgetStatuses,
  type CategoryBudget,
} from "@/lib/budgets";
import { getCategoryLabel } from "@/lib/categories";
import { formatMoney, formatTodayHeader, isToday } from "@/lib/format-date";

type HomeViewProps = {
  rows: TransactionRow[];
  budgets?: CategoryBudget[];
  error?: string | null;
  onEditTransaction?: (transaction: TransactionRow) => void;
};

export function HomeView({
  rows,
  budgets = [],
  error,
  onEditTransaction,
}: HomeViewProps) {
  const todayLabel = formatTodayHeader();

  const { todaySpent, todayIncome } = useMemo(() => {
    const todayRows = rows.filter((r) => isToday(r.occurredAt));
    const spent = todayRows
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    const income = todayRows
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    return { todaySpent: spent, todayIncome: income };
  }, [rows]);

  const budgetGroups = useMemo(() => {
    const statuses = buildBudgetStatuses(budgets, rows, getCategoryLabel);
    return groupBudgetStatuses(statuses);
  }, [budgets, rows]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-emerald-600 px-5 py-5 text-white shadow-md shadow-emerald-600/20">
        <p className="text-sm font-medium text-emerald-100">{todayLabel}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {formatMoney(-todaySpent, { signed: true })}
        </p>
        {todayIncome > 0 ? (
          <p className="mt-2 text-sm text-emerald-100">
            Income {formatMoney(todayIncome, { signed: true })}
          </p>
        ) : (
          <p className="mt-2 text-sm text-emerald-100">Spent today</p>
        )}
      </section>

      <CategoryBudgetProgress groups={budgetGroups} />

      <section>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Transactions
          </h2>
          {onEditTransaction ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tap to edit
            </p>
          ) : null}
        </div>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <div className="mt-3">
          <TransactionDayList rows={rows} onEdit={onEditTransaction} />
        </div>
      </section>
    </div>
  );
}
