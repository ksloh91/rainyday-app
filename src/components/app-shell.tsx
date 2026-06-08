"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAppBackNavigation,
  type AppBackLayer,
} from "@/hooks/use-app-back-navigation";
import { signInWithGoogle, signOutUser } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useCategoryBudgets } from "@/hooks/use-category-budgets";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { BottomSheet } from "@/components/bottom-sheet";
import { HomeView } from "@/components/home-view";
import {
  InsightsView,
  type SelectedMerchant,
} from "@/components/insights-view";
import { MoreView } from "@/components/more-view";
import { RecurringRuleForm } from "@/components/recurring-rule-form";
import { TransactionForm } from "@/components/transaction-form";
import { formatWeekRange } from "@/lib/format-date";
import { collectFieldSuggestions } from "@/lib/transaction-suggestions";
import { useRecurringRules } from "@/hooks/use-recurring-rules";
import { useReminderSettings } from "@/hooks/use-reminder-settings";
import {
  useExpenseReminders,
  useReminderAlerts,
  type ReminderAlert,
} from "@/hooks/use-expense-reminders";
import { ReminderPopup } from "@/components/reminder-popup";
import type { RecurringRule } from "@/lib/recurring";
import type { Transaction } from "@/lib/transactions";

type SheetKind = "transaction" | "recurring" | null;

export function AppShell() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [selectedMerchant, setSelectedMerchant] =
    useState<SelectedMerchant | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringRule | null>(null);
  const [sheetKind, setSheetKind] = useState<SheetKind>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderAlert, setReminderAlert] = useState<ReminderAlert | null>(
    null,
  );

  const userId = user?.uid ?? "";
  const { rows: transactions, error: transactionsError } =
    useUserTransactions(userId, 200);
  const {
    budgets,
    error: budgetsError,
    loading: budgetsLoading,
    savingId: savingBudgetId,
    setCategoryBudget,
  } = useCategoryBudgets(userId);
  const {
    rules: recurringRules,
    error: recurringError,
    loading: recurringLoading,
    materializing: recurringMaterializing,
    saveRule,
    deleteRule,
    setRuleActive,
  } = useRecurringRules(userId);
  const descriptionSuggestions = useMemo(
    () => collectFieldSuggestions(transactions, "description"),
    [transactions],
  );
  const merchantSuggestions = useMemo(
    () => collectFieldSuggestions(transactions, "merchant"),
    [transactions],
  );
  const {
    settings: reminderSettings,
    loading: remindersLoading,
    saving: remindersSaving,
    error: remindersError,
    updateSettings: updateReminderSettings,
  } = useReminderSettings(userId);
  const closeSheetStateOnly = useCallback(() => {
    setSheetOpen(false);
    setEditingTransaction(null);
    setEditingRecurring(null);
    setSheetKind(null);
  }, []);

  const { pushLayer, dismissLayer, clearLayers } = useAppBackNavigation({
    onPopSheet: closeSheetStateOnly,
    onPopMerchant: () => setSelectedMerchant(null),
    onPopInsights: () => setTab("home"),
  });

  const openAddSheet = useCallback(() => {
    setEditingTransaction(null);
    setEditingRecurring(null);
    setSheetKind("transaction");
    setSheetOpen(true);
    pushLayer("sheet");
  }, [pushLayer]);

  const navigateToTab = useCallback(
    (newTab: Tab) => {
      if (newTab === "home") {
        const layers: AppBackLayer[] = [];
        if (selectedMerchant) layers.push("merchant");
        if (tab === "insights") layers.push("insights");
        if (layers.length > 0) {
          clearLayers(layers);
          setSelectedMerchant(null);
        }
      } else if (newTab === "insights" && tab !== "insights") {
        pushLayer("insights");
      }
      setTab(newTab);
    },
    [clearLayers, pushLayer, selectedMerchant, tab],
  );

  const openMerchant = useCallback(
    (merchant: SelectedMerchant) => {
      setSelectedMerchant(merchant);
      pushLayer("merchant");
    },
    [pushLayer],
  );

  const closeMerchant = useCallback(() => {
    if (!dismissLayer("merchant")) {
      setSelectedMerchant(null);
    }
  }, [dismissLayer]);

  const showReminderAlert = useCallback((alert: ReminderAlert) => {
    setReminderAlert(alert);
  }, []);

  useExpenseReminders(reminderSettings, ready && !!user);
  useReminderAlerts(reminderSettings, ready && !!user, showReminderAlert);

  function dismissReminderAlert() {
    setReminderAlert(null);
  }

  function logFromReminderAlert() {
    setReminderAlert(null);
    openAddSheet();
  }

  function openEditSheet(transaction: Transaction) {
    setEditingTransaction(transaction);
    setEditingRecurring(null);
    setSheetKind("transaction");
    setSheetOpen(true);
    pushLayer("sheet");
  }

  function openAddRecurring() {
    setEditingRecurring(null);
    setEditingTransaction(null);
    setSheetKind("recurring");
    setSheetOpen(true);
    pushLayer("sheet");
  }

  function openEditRecurring(rule: RecurringRule) {
    setEditingRecurring(rule);
    setEditingTransaction(null);
    setSheetKind("recurring");
    setSheetOpen(true);
    pushLayer("sheet");
  }

  function closeSheet() {
    if (sheetOpen && !dismissLayer("sheet")) {
      closeSheetStateOnly();
    }
  }

  async function handleDeleteRecurring(rule: RecurringRule) {
    if (!confirm(`Delete recurring "${rule.description || rule.merchant || "item"}"?`)) {
      return;
    }
    try {
      await deleteRule(rule.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    setBusy(true);
    try {
      await signOutUser();
      setTab("home");
      closeSheetStateOnly();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Money Manager
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track spending on the go.
          </p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="mt-8 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-sm font-medium text-zinc-900 shadow-sm active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {busy ? "Opening Google…" : "Sign in with Google"}
          </button>
          {error ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const sheetTitle =
    sheetKind === "recurring"
      ? editingRecurring
        ? "Edit recurring"
        : "Add recurring"
      : editingTransaction
        ? "Edit transaction"
        : "Add transaction";

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header
        className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {tab === "home" ? (
          <h1 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            Rainy Day Money Manager
          </h1>
        ) : tab === "insights" ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Insights
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {formatWeekRange()}
            </p>
          </>
        ) : (
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            More
          </h1>
        )}
      </header>

      <main
        className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-4"
        style={{
          paddingBottom:
            "calc(5.5rem + max(0.5rem, env(safe-area-inset-bottom)))",
        }}
      >
        {tab === "home" ? (
          <HomeView
            rows={transactions}
            budgets={budgets}
            error={transactionsError}
            onEditTransaction={openEditSheet}
            onOpenInsights={() => navigateToTab("insights")}
            onAddTransaction={openAddSheet}
          />
        ) : tab === "insights" ? (
          <InsightsView
            rows={transactions}
            budgets={budgets}
            selectedMerchant={selectedMerchant}
            onOpenMerchant={openMerchant}
            onCloseMerchant={closeMerchant}
            onEditTransaction={openEditSheet}
          />
        ) : (
          <MoreView
            email={user.email}
            budgets={budgets}
            budgetsLoading={budgetsLoading}
            budgetsError={budgetsError}
            savingBudgetId={savingBudgetId}
            onSetCategoryBudget={setCategoryBudget}
            recurringRules={recurringRules}
            recurringLoading={recurringLoading}
            recurringMaterializing={recurringMaterializing}
            recurringError={recurringError}
            onAddRecurring={openAddRecurring}
            onEditRecurring={openEditRecurring}
            onToggleRecurring={(rule) => setRuleActive(rule.id, !rule.active)}
            onDeleteRecurring={handleDeleteRecurring}
            reminderSettings={reminderSettings}
            remindersLoading={remindersLoading}
            remindersSaving={remindersSaving}
            remindersError={remindersError}
            onSaveReminderSettings={updateReminderSettings}
            onSignOut={handleSignOut}
            busy={busy}
          />
        )}
      </main>

      <BottomNav
        activeTab={tab}
        onTabChange={navigateToTab}
        onAdd={openAddSheet}
      />

      <ReminderPopup
        open={reminderAlert !== null}
        title={reminderAlert?.title ?? ""}
        body={reminderAlert?.body ?? ""}
        onLog={logFromReminderAlert}
        onDismiss={dismissReminderAlert}
      />

      <BottomSheet
        open={sheetOpen}
        title={sheetTitle}
        onClose={closeSheet}
      >
        {sheetKind === "recurring" ? (
          <RecurringRuleForm
            key={editingRecurring?.id ?? "new-recurring"}
            rule={editingRecurring}
            onSave={async (input, existingId) => {
              await saveRule(input, existingId);
            }}
            onSuccess={closeSheet}
          />
        ) : (
          <TransactionForm
            key={editingTransaction?.id ?? "new"}
            userId={user.uid}
            transaction={editingTransaction}
            descriptionSuggestions={descriptionSuggestions}
            merchantSuggestions={merchantSuggestions}
            onSuccess={closeSheet}
          />
        )}
      </BottomSheet>
    </div>
  );
}
