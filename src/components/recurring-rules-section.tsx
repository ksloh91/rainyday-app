"use client";

import { CategoryIcon } from "@/components/category-icon";
import { AppCard, AppCardHeader } from "@/components/ui-card";
import { formatMoney } from "@/lib/format-date";
import { getCategoryLabel } from "@/lib/categories";
import {
  getFrequencyLabel,
  ruleDisplaySubtitle,
  ruleDisplayTitle,
  type RecurringRule,
} from "@/lib/recurring";

type RecurringRulesSectionProps = {
  rules: RecurringRule[];
  loading?: boolean;
  materializing?: boolean;
  error?: string | null;
  onAdd: () => void;
  onEdit: (rule: RecurringRule) => void;
  onToggleActive: (rule: RecurringRule) => void;
  onDelete: (rule: RecurringRule) => void;
};

function formatNextDue(date: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function RecurringRulesSection({
  rules,
  loading,
  materializing,
  error,
  onAdd,
  onEdit,
  onToggleActive,
  onDelete,
}: RecurringRulesSectionProps) {
  return (
    <AppCard>
      <AppCardHeader
        title="Recurring"
        subtitle={
          materializing
            ? "Posting due items…"
            : "Auto-adds transactions when due."
        }
        action={
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-emerald-500"
          >
            Add
          </button>
        }
      />

      {loading ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">
          No recurring items yet. Add rent, salary, or subscriptions.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rules.map((rule) => {
            const title = ruleDisplayTitle(rule);
            const merchantLine = ruleDisplaySubtitle(rule);
            const metaParts = [
              getFrequencyLabel(rule.frequency),
              ...(merchantLine ? [getCategoryLabel(rule.category)] : []),
              `Next ${formatNextDue(rule.nextDueAt)}`,
            ];
            const signed =
              rule.type === "income"
                ? formatMoney(rule.amount, { signed: true })
                : formatMoney(-rule.amount, { signed: true });

            return (
              <li key={rule.id} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(rule)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <CategoryIcon categoryId={rule.category} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`truncate text-sm font-medium ${
                          rule.active
                            ? "text-zinc-900 dark:text-zinc-50"
                            : "text-zinc-400 line-through"
                        }`}
                      >
                        {title}
                      </p>
                      <p
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          rule.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-zinc-50"
                        }`}
                      >
                        {signed}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {merchantLine ?? getCategoryLabel(rule.category)}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {metaParts.join(" · ")}
                    </p>
                  </div>
                </button>
                <div className="mt-2 flex gap-2 pl-11">
                  <button
                    type="button"
                    onClick={() => onToggleActive(rule)}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    {rule.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(rule)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 dark:border-red-900 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
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
