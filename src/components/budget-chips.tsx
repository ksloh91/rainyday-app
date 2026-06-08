"use client";

import { CategoryIcon } from "@/components/category-icon";
import { ProgressRing } from "@/components/progress-ring";
import { formatMoney } from "@/lib/format-date";
import type { BudgetPeriod, BudgetStatusGroup } from "@/lib/budgets";

const PERIOD_SHORT: Record<BudgetStatusGroup["period"], string> = {
  daily: "Day",
  weekly: "Wk",
  monthly: "Mo",
};

function ringColor(percent: number) {
  if (percent >= 100) return "stroke-red-500";
  if (percent >= 80) return "stroke-amber-500";
  return "stroke-emerald-500";
}

type BudgetChipsProps = {
  groups: BudgetStatusGroup[];
  /** Only show these periods (default: all) */
  periods?: BudgetPeriod[];
};

export function BudgetChips({ groups, periods }: BudgetChipsProps) {
  const filtered = periods
    ? groups.filter((g) => periods.includes(g.period))
    : groups;

  const items = filtered.flatMap((g) =>
    g.statuses.map((status) => ({ ...status, groupPeriod: g.period })),
  );

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Budgets
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((status) => {
          const percent = Math.min(100, status.percentUsed);
          const over = status.spent > status.limit;

          return (
            <article
              key={`${status.period}-${status.categoryId}`}
              className="flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              title={`${status.label}: ${formatMoney(status.spent)} of ${formatMoney(status.limit)}`}
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <ProgressRing
                  percent={percent}
                  size={56}
                  stroke={5}
                  trackClassName="stroke-zinc-200 dark:stroke-zinc-700"
                  progressClassName={ringColor(status.percentUsed)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CategoryIcon categoryId={status.categoryId} size="sm" />
                </div>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-zinc-100 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {PERIOD_SHORT[status.groupPeriod]}
                </span>
              </div>
              <p className="w-full truncate text-center text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                {status.label}
              </p>
              <p
                className={`text-[10px] font-semibold tabular-nums ${
                  over
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {over
                  ? `+${formatMoney(status.spent - status.limit)}`
                  : formatMoney(status.remaining)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
