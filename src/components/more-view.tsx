"use client";

import { BudgetsSettings } from "@/components/budgets-settings";
import { RecurringRulesSection } from "@/components/recurring-rules-section";
import type { CategoryId } from "@/lib/categories";
import type { CategoryBudget, CategoryBudgetLimits } from "@/lib/budgets";
import type { RecurringRule } from "@/lib/recurring";

type MoreViewProps = {
  email: string | null;
  budgets: CategoryBudget[];
  budgetsLoading?: boolean;
  budgetsError?: string | null;
  savingBudgetId: CategoryId | null;
  onSetCategoryBudget: (
    categoryId: CategoryId,
    limits: CategoryBudgetLimits,
  ) => Promise<void>;
  recurringRules: RecurringRule[];
  recurringLoading?: boolean;
  recurringMaterializing?: boolean;
  recurringError?: string | null;
  onAddRecurring: () => void;
  onEditRecurring: (rule: RecurringRule) => void;
  onToggleRecurring: (rule: RecurringRule) => void;
  onDeleteRecurring: (rule: RecurringRule) => void;
  onSignOut: () => void;
  busy: boolean;
};

export function MoreView({
  email,
  budgets,
  budgetsLoading,
  budgetsError,
  savingBudgetId,
  onSetCategoryBudget,
  recurringRules,
  recurringLoading,
  recurringMaterializing,
  recurringError,
  onAddRecurring,
  onEditRecurring,
  onToggleRecurring,
  onDeleteRecurring,
  onSignOut,
  busy,
}: MoreViewProps) {
  return (
    <div className="space-y-4">
      <RecurringRulesSection
        rules={recurringRules}
        loading={recurringLoading}
        materializing={recurringMaterializing}
        error={recurringError}
        onAdd={onAddRecurring}
        onEdit={onEditRecurring}
        onToggleActive={onToggleRecurring}
        onDelete={onDeleteRecurring}
      />

      <BudgetsSettings
        budgets={budgets}
        loading={budgetsLoading}
        error={budgetsError}
        savingId={savingBudgetId}
        onSave={onSetCategoryBudget}
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Account
        </p>
        <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {email ?? "Signed in"}
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onSignOut}
          disabled={busy}
          className="w-full px-4 py-3.5 text-left text-sm font-medium text-red-600 disabled:opacity-50 dark:text-red-400"
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </section>
    </div>
  );
}
