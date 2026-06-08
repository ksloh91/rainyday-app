"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { AppCard, AppCardHeader } from "@/components/ui-card";
import {
  categoriesForType,
  getCategoryLabel,
  type CategoryId,
} from "@/lib/categories";
import type { BudgetPeriod, CategoryBudget, CategoryBudgetLimits } from "@/lib/budgets";

type BudgetsSettingsProps = {
  budgets: CategoryBudget[];
  savingId: CategoryId | null;
  error?: string | null;
  loading?: boolean;
  onSave: (categoryId: CategoryId, limits: CategoryBudgetLimits) => Promise<void>;
};

const PERIODS: { key: BudgetPeriod; label: string; short: string }[] = [
  { key: "daily", label: "Daily", short: "Day" },
  { key: "weekly", label: "Weekly", short: "Week" },
  { key: "monthly", label: "Monthly", short: "Month" },
];

function draftKey(categoryId: string, period: BudgetPeriod) {
  return `${categoryId}:${period}`;
}

export function BudgetsSettings({
  budgets,
  savingId,
  error,
  loading,
  onSave,
}: BudgetsSettingsProps) {
  const expenseCategories = useMemo(() => categoriesForType("expense"), []);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const cat of expenseCategories) {
      const budget = budgets.find((b) => b.categoryId === cat.id);
      for (const { key } of PERIODS) {
        const limit =
          key === "daily"
            ? budget?.dailyLimit
            : key === "weekly"
              ? budget?.weeklyLimit
              : budget?.monthlyLimit;
        next[draftKey(cat.id, key)] =
          limit !== undefined ? String(limit) : "";
      }
    }
    setDrafts(next);
  }, [budgets, expenseCategories]);

  function parseLimit(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number.parseFloat(trimmed);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  async function saveCategory(categoryId: CategoryId) {
    const limits: CategoryBudgetLimits = {
      daily: parseLimit(drafts[draftKey(categoryId, "daily")] ?? ""),
      weekly: parseLimit(drafts[draftKey(categoryId, "weekly")] ?? ""),
      monthly: parseLimit(drafts[draftKey(categoryId, "monthly")] ?? ""),
    };
    await onSave(categoryId, limits);
  }

  return (
    <AppCard>
      <AppCardHeader
        title="Category budgets"
        subtitle="Daily, weekly, and monthly limits on Home."
      />
      <div className="grid grid-cols-[1fr_repeat(3,3.25rem)] gap-2 px-4 pb-2 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        <span className="text-left">Category</span>
        {PERIODS.map((p) => (
          <span key={p.key}>{p.short}</span>
        ))}
      </div>

      {loading ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading budgets…</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {expenseCategories.map((cat) => {
            const isSaving = savingId === cat.id;
            return (
              <li key={cat.id} className="px-4 py-3">
                <div className="grid grid-cols-[1fr_repeat(3,3.25rem)] items-center gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CategoryIcon categoryId={cat.id} />
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {getCategoryLabel(cat.id)}
                    </p>
                  </div>
                  {PERIODS.map(({ key }) => (
                    <input
                      key={key}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      placeholder="—"
                      value={drafts[draftKey(cat.id, key)] ?? ""}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [draftKey(cat.id, key)]: e.target.value,
                        }))
                      }
                      onBlur={() => saveCategory(cat.id)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-1 py-1.5 text-center text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
                      aria-label={`${key} budget for ${getCategoryLabel(cat.id)}`}
                    />
                  ))}
                </div>
                {isSaving ? (
                  <p className="mt-1 text-right text-xs text-zinc-400">Saving…</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p className="border-t border-zinc-100 px-4 py-2 text-sm text-red-600 dark:border-zinc-800 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </AppCard>
  );
}
