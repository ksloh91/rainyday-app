"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  categoriesForType,
  defaultCategoryForType,
  type CategoryId,
  type TransactionType,
} from "@/lib/categories";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payment-methods";

type TransactionFormProps = {
  userId: string;
  onSuccess?: () => void;
};

export function TransactionForm({ userId, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<CategoryId>(() =>
    defaultCategoryForType("expense"),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory((current) => {
      const options = categoriesForType(next);
      return options.some((c) => c.id === current)
        ? current
        : defaultCategoryForType(next);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (!merchant.trim()) {
      setError("Enter a merchant or label.");
      return;
    }
    setBusy(true);
    try {
      const txCol = collection(
        getFirebaseDb(),
        "users",
        userId,
        "transactions",
      );
      await addDoc(txCol, {
        amount: n,
        merchant: merchant.trim(),
        type,
        category,
        paymentMethod,
        currency: "MYR",
        occurredAt: Timestamp.now(),
        createdAt: serverTimestamp(),
      });
      setAmount("");
      setMerchant("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="space-y-4 px-4 py-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Amount (MYR)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-lg font-medium tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Merchant
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="e.g. Breakfast spot"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
              type === "expense"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
              type === "income"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            Income
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {categoriesForType(type).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Payment
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as PaymentMethodId)
            }
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>

      <div
        className="sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white active:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
