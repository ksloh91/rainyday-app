"use client";

import { CategoryIcon } from "@/components/category-icon";
import { formatMoney } from "@/lib/format-date";
import type { BudgetStatusGroup } from "@/lib/budgets";

type CategoryBudgetProgressProps = {
  groups: BudgetStatusGroup[];
};

function barColor(percentUsed: number) {
  if (percentUsed >= 100) return "bg-red-500";
  if (percentUsed >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function CategoryBudgetProgress({ groups }: CategoryBudgetProgressProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.period} className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {group.title} budgets
          </h2>
          <ul className="space-y-2">
            {group.statuses.map((status) => {
              const over = status.spent > status.limit;
              const width = Math.min(100, status.percentUsed);

              return (
                <li
                  key={`${status.period}-${status.categoryId}`}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryId={status.categoryId} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {status.label}
                        </p>
                        <p
                          className={`shrink-0 text-xs font-semibold tabular-nums ${
                            over
                              ? "text-red-600 dark:text-red-400"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {formatMoney(status.spent)} / {formatMoney(status.limit)}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all ${barColor(status.percentUsed)}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {over
                          ? `${formatMoney(status.spent - status.limit)} over budget`
                          : `${formatMoney(status.remaining)} ${status.remainingLabel}`}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
