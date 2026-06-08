"use client";

import { CategoryIcon } from "@/components/category-icon";
import { SvgIcon } from "@/components/icons/svg-icon";
import { ProgressRing } from "@/components/progress-ring";
import { useCountUp } from "@/hooks/use-count-up";
import { formatMoney } from "@/lib/format-date";
import type { CategoryBudgetStatus } from "@/lib/budgets";

type HomeSummaryCardProps = {
  todaySpent: number;
  weekSpent: number;
  dailyBudgetPercent?: number | null;
  dailyBudgets: CategoryBudgetStatus[];
  weeklyBudgets: CategoryBudgetStatus[];
  monthlyBudgets: CategoryBudgetStatus[];
  onOpenInsights?: () => void;
};

function mainRingProgressClass(percent: number) {
  if (percent >= 100) return "stroke-red-300";
  if (percent >= 80) return "stroke-amber-200";
  return "stroke-white";
}

function miniRingProgressClass(percent: number) {
  if (percent >= 100) return "stroke-red-300";
  if (percent >= 80) return "stroke-amber-200";
  return "stroke-white";
}

function HeroBudgetColumn({
  title,
  items,
}: {
  title: string;
  items: CategoryBudgetStatus[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/90">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((status) => {
          const percent = Math.min(100, status.percentUsed);
          const over = status.spent > status.limit;

          return (
            <li
              key={`${status.period}-${status.categoryId}`}
              className="flex items-center gap-2"
              title={`${status.label}: ${formatMoney(status.spent)} of ${formatMoney(status.limit)}`}
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <ProgressRing
                  percent={percent}
                  size={36}
                  stroke={3.5}
                  trackClassName="stroke-white/25"
                  progressClassName={miniRingProgressClass(status.percentUsed)}
                  animateOnMount
                />
                <div className="absolute inset-0 flex items-center justify-center scale-75">
                  <CategoryIcon categoryId={status.categoryId} size="sm" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {status.label}
                </p>
                <p
                  className={`text-[10px] font-semibold tabular-nums ${
                    over ? "text-red-200" : "text-emerald-100"
                  }`}
                >
                  {over
                    ? `+${formatMoney(status.spent - status.limit)}`
                    : `${formatMoney(status.remaining)} left`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HeroSpendCell({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 px-3 py-2.5 text-center sm:px-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100/80">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums text-white">
        {formatMoney(amount, { signed: false })}
      </p>
    </div>
  );
}

export function HomeSummaryCard({
  todaySpent,
  weekSpent,
  dailyBudgetPercent,
  dailyBudgets,
  weeklyBudgets,
  monthlyBudgets,
  onOpenInsights,
}: HomeSummaryCardProps) {
  const animatedSpent = useCountUp(todaySpent);
  const ringPercent = dailyBudgetPercent ?? 0;
  const hasSideBudgets =
    dailyBudgets.length > 0 ||
    weeklyBudgets.length > 0 ||
    monthlyBudgets.length > 0;

  const footer = (
    <div className="border-t border-white/20">
      <div className="flex divide-x divide-white/20">
        <HeroSpendCell label="Today" amount={todaySpent} />
        <HeroSpendCell label="This week" amount={weekSpent} />
      </div>
      {onOpenInsights ? (
        <button
          type="button"
          onClick={onOpenInsights}
          className="flex w-full items-center justify-center gap-1 border-t border-white/15 py-2.5 text-xs font-medium text-emerald-100 transition active:bg-white/10"
        >
          <span>View insights</span>
          <SvgIcon size={14} className="opacity-80">
            <path d="M9 6l4 4-4 4" />
          </SvgIcon>
        </button>
      ) : null}
    </div>
  );

  return (
    <section className="home-hero-card overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/25 dark:from-emerald-700 dark:to-emerald-900">
      <div
        className={`flex gap-4 px-4 pt-4 ${hasSideBudgets ? "items-start pb-3" : "flex-col items-center pb-2"}`}
      >
        <div className={`shrink-0 ${hasSideBudgets ? "" : ""}`}>
          <ProgressRing
            percent={ringPercent}
            size={hasSideBudgets ? 100 : 112}
            stroke={9}
            progressClassName={mainRingProgressClass(ringPercent)}
            animateOnMount
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-100">
              Spent
            </p>
            <p
              className={`font-bold tabular-nums leading-tight ${
                hasSideBudgets ? "text-lg" : "text-xl"
              }`}
            >
              {formatMoney(-animatedSpent, { signed: true })}
            </p>
          </ProgressRing>
        </div>

        {hasSideBudgets ? (
          <div className="max-h-[200px] min-w-0 flex-1 space-y-3 overflow-y-auto border-l border-white/20 pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HeroBudgetColumn title="Today" items={dailyBudgets} />
            <HeroBudgetColumn title="This week" items={weeklyBudgets} />
            <HeroBudgetColumn title="This month" items={monthlyBudgets} />
          </div>
        ) : null}
      </div>
      {footer}
    </section>
  );
}
