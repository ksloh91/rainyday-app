"use client";

import { useState } from "react";
import { signInWithGoogle, signOutUser } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { BottomSheet } from "@/components/bottom-sheet";
import { HomeView } from "@/components/home-view";
import { MoreView } from "@/components/more-view";
import { TransactionForm } from "@/components/transaction-form";
import { CalendarIcon } from "@/components/icons";
import { formatTodayHeader } from "@/lib/format-date";
import type { Transaction } from "@/lib/transactions";

export function AppShell() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAddSheet() {
    setEditingTransaction(null);
    setSheetOpen(true);
  }

  function openEditSheet(transaction: Transaction) {
    setEditingTransaction(transaction);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTransaction(null);
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
      closeSheet();
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

  const sheetTitle = editingTransaction
    ? "Edit transaction"
    : "Add transaction";

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header
        className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {tab === "home" ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Today
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <CalendarIcon size={14} className="shrink-0 opacity-70" />
              {formatTodayHeader()}
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
            userId={user.uid}
            onEditTransaction={openEditSheet}
          />
        ) : (
          <MoreView
            email={user.email}
            onSignOut={handleSignOut}
            busy={busy}
          />
        )}
      </main>

      <BottomNav
        activeTab={tab}
        onTabChange={setTab}
        onAdd={openAddSheet}
      />

      <BottomSheet
        open={sheetOpen}
        title={sheetTitle}
        onClose={closeSheet}
      >
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          userId={user.uid}
          transaction={editingTransaction}
          onSuccess={closeSheet}
        />
      </BottomSheet>
    </div>
  );
}
