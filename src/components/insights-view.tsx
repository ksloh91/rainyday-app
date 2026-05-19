"use client";

import { useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryBudgetProgress } from "@/components/category-budget-progress";
import {
  buildBudgetStatuses,
  groupBudgetStatuses,
  type CategoryBudget,
} from "@/lib/budgets";
import { getCategoryLabel } from "@/lib/categories";
import {
  computeInsights,
  formatChangePercent,
} from "@/lib/insights";
import { formatMoney, formatMonthLabel, formatWeekRange } from "@/lib/format-date";
import type { Transaction } from "@/lib/transactions";

type InsightsViewProps = {
  rows: Transaction[];
  budgets?: CategoryBudget[];
};

export function InsightsView({ rows, budgets = [] }: InsightsViewProps) {
  const budgetStatuses = useMemo(
    () => buildBudgetStatuses(budgets, rows, getCategoryLabel),
    [budgets, rows],
  );
  const budgetGroups = useMemo(
    () => groupBudgetStatuses(budgetStatuses),
    [budgetStatuses],
  );
  const insights = useMemo(
    () => computeInsights(rows, budgetStatuses),
    [rows, budgetStatuses],
  );

  const weekChangeClass =
    insights.weekSpentChange !== null && insights.weekSpentChange > 0
      ? "text-amber-200"
      : "text-emerald-100";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-zinc-900 px-5 py-5 text-white dark:bg-zinc-800">
        <p className="text-sm font-medium text-zinc-400">This week</p>
        <p className="text-xs text-zinc-500">{formatWeekRange()}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
          {formatMoney(-insights.weekSpent, { signed: true })}
        </p>
        <p className="mt-1 text-sm text-zinc-400">spent</p>
        {insights.weekIncome > 0 ? (
          <p className="mt-2 text-sm text-emerald-300">
            Income {formatMoney(insights.weekIncome, { signed: true })}
          </p>
        ) : null}
        <p className={`mt-2 text-sm ${weekChangeClass}`}>
          {formatChangePercent(insights.weekSpentChange)}
        </p>
        {insights.lastWeekSpent > 0 ? (
          <p className="mt-0.5 text-xs text-zinc-500">
            Last week {formatMoney(insights.lastWeekSpent)}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          This month
        </p>
        <p className="text-xs text-zinc-400">{formatMonthLabel()}</p>
        <div className="mt-3 flex justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoney(insights.monthSpent)}
            </p>
            <p className="text-xs text-zinc-500">spent</p>
          </div>
          {insights.monthIncome > 0 ? (
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatMoney(insights.monthIncome, { signed: true })}
              </p>
              <p className="text-xs text-zinc-500">income</p>
            </div>
          ) : null}
        </div>
      </section>

      {(insights.overBudgetCount > 0 || insights.nearBudgetCount > 0) && (
        <section className="flex gap-2">
          {insights.overBudgetCount > 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              {insights.overBudgetCount} over budget
            </span>
          ) : null}
          {insights.nearBudgetCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {insights.nearBudgetCount} near limit
            </span>
          ) : null}
        </section>
      )}

      {insights.topCategories.length > 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Top categories this week
            </h2>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {insights.topCategories.map((row) => (
              <li
                key={row.categoryId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <CategoryIcon categoryId={row.categoryId} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.label}
                    </p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatMoney(row.amount)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, row.share)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {Math.round(row.share)}% of weekly spending
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No expenses this week yet.
          </p>
        </section>
      )}

      <CategoryBudgetProgress groups={budgetGroups} />
    </div>
  );
}
