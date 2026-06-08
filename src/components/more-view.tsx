"use client";

import { BudgetsSettings } from "@/components/budgets-settings";
import { RemindersSettings } from "@/components/reminders-settings";
import { RecurringRulesSection } from "@/components/recurring-rules-section";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui-card";
import type { CategoryId } from "@/lib/categories";
import type { CategoryBudget, CategoryBudgetLimits } from "@/lib/budgets";
import type { RecurringRule } from "@/lib/recurring";
import type { ReminderSettings } from "@/lib/reminders";

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
  reminderSettings: ReminderSettings;
  remindersLoading?: boolean;
  remindersSaving?: boolean;
  remindersError?: string | null;
  onSaveReminderSettings: (settings: ReminderSettings) => Promise<void>;
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
  reminderSettings,
  remindersLoading,
  remindersSaving,
  remindersError,
  onSaveReminderSettings,
  onSignOut,
  busy,
}: MoreViewProps) {
  return (
    <div className="space-y-4">
      <RemindersSettings
        settings={reminderSettings}
        loading={remindersLoading}
        saving={remindersSaving}
        error={remindersError}
        onSave={onSaveReminderSettings}
      />

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

      <AppCard>
        <AppCardHeader title="Account" />
        <AppCardBody className="!py-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {email ?? "Signed in"}
          </p>
        </AppCardBody>
      </AppCard>

      <AppCard>
        <button
          type="button"
          onClick={onSignOut}
          disabled={busy}
          className="w-full px-4 py-3.5 text-left text-sm font-semibold text-red-600 transition active:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:active:bg-red-950/30"
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </AppCard>
    </div>
  );
}
