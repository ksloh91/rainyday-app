"use client";

import { useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryBudgetProgress } from "@/components/category-budget-progress";
import { MerchantTransactionsView } from "@/components/merchant-transactions-view";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui-card";
import {
  buildBudgetStatuses,
  groupBudgetStatuses,
  type CategoryBudget,
} from "@/lib/budgets";
import { getCategoryLabel } from "@/lib/categories";
import { computeInsights, formatChangePercent } from "@/lib/insights";
import {
  formatMoney,
  formatMonthLabel,
  formatWeekRange,
} from "@/lib/format-date";
import type { Transaction } from "@/lib/transactions";

export type SelectedMerchant = {
  key: string;
  label: string;
};

type InsightsViewProps = {
  rows: Transaction[];
  budgets?: CategoryBudget[];
  selectedMerchant: SelectedMerchant | null;
  onOpenMerchant: (merchant: SelectedMerchant) => void;
  onCloseMerchant: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
};

export function InsightsView({
  rows,
  budgets = [],
  selectedMerchant,
  onOpenMerchant,
  onCloseMerchant,
  onEditTransaction,
}: InsightsViewProps) {
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

  if (selectedMerchant) {
    return (
      <MerchantTransactionsView
        merchantKey={selectedMerchant.key}
        merchantLabel={selectedMerchant.label}
        rows={rows}
        onBack={onCloseMerchant}
        onEditTransaction={onEditTransaction}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 px-5 py-5 text-white shadow-lg dark:from-zinc-900 dark:to-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          This week
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">{formatWeekRange()}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
          {formatMoney(-insights.weekSpent, { signed: true })}
        </p>
        <p className="mt-1 text-sm text-zinc-400">spent</p>
        {insights.weekIncome > 0 ? (
          <p className="mt-2 text-sm font-medium text-emerald-300">
            +{formatMoney(insights.weekIncome, { signed: false })} income
          </p>
        ) : null}
        <p className={`mt-2 text-sm font-medium ${weekChangeClass}`}>
          {formatChangePercent(insights.weekSpentChange)}
        </p>
        {insights.lastWeekSpent > 0 ? (
          <p className="mt-0.5 text-xs text-zinc-500">
            Last week {formatMoney(insights.lastWeekSpent)}
          </p>
        ) : null}
      </section>

      <AppCard>
        <AppCardHeader title="This month" subtitle={formatMonthLabel()} />
        <AppCardBody className="!py-3">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatMoney(insights.monthSpent)}
              </p>
              <p className="text-xs text-zinc-500">spent</p>
            </div>
            {insights.monthIncome > 0 ? (
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatMoney(insights.monthIncome, { signed: true })}
                </p>
                <p className="text-xs text-zinc-500">income</p>
              </div>
            ) : null}
          </div>
        </AppCardBody>
      </AppCard>

      {(insights.overBudgetCount > 0 || insights.nearBudgetCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {insights.overBudgetCount > 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
              {insights.overBudgetCount} over budget
            </span>
          ) : null}
          {insights.nearBudgetCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {insights.nearBudgetCount} near limit
            </span>
          ) : null}
        </div>
      )}

      {insights.topCategories.length > 0 ? (
        <AppCard>
          <AppCardHeader
            title="Top categories"
            subtitle="This week’s spending"
          />
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {insights.topCategories.map((row) => (
              <li
                key={row.categoryId}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <CategoryIcon categoryId={row.categoryId} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.label}
                    </p>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatMoney(row.amount)}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, row.share)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {Math.round(row.share)}% of week
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AppCard>
      ) : (
        <AppCard>
          <AppCardBody className="py-10 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No expenses this week yet.
            </p>
          </AppCardBody>
        </AppCard>
      )}

      {insights.topMerchants.length > 0 ? (
        <AppCard>
          <AppCardHeader
            title="Top merchants"
            subtitle="By merchant name this month"
          />
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {insights.topMerchants.map((row) => (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMerchant({ key: row.key, label: row.label })
                  }
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-zinc-50 dark:active:bg-zinc-800/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {row.label.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {row.label}
                      </p>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatMoney(row.amount)}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-700 transition-all duration-700 ease-out dark:bg-zinc-300"
                        style={{ width: `${Math.min(100, row.share)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {Math.round(row.share)}% of month
                      {row.count > 1 ? ` · ${row.count} visits` : null}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-zinc-400 dark:text-zinc-500"
                    aria-hidden
                  >
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </AppCard>
      ) : null}

      <CategoryBudgetProgress groups={budgetGroups} />
    </div>
  );
}
