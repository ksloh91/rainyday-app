"use client";

import { useEffect, useState } from "react";
import { AutocompleteInput } from "@/components/autocomplete-input";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { IconOptionGrid } from "@/components/icon-option-grid";
import { ExpenseTypeIcon, IncomeTypeIcon } from "@/components/icons";
import { getFirebaseDb } from "@/lib/firebase";
import {
  categoriesForType,
  defaultCategoryForType,
  type CategoryId,
  type TransactionType,
} from "@/lib/categories";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payment-methods";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type Transaction,
} from "@/lib/transactions";

type TransactionFormProps = {
  userId: string;
  transaction?: Transaction | null;
  descriptionSuggestions?: string[];
  merchantSuggestions?: string[];
  onSuccess?: () => void;
};

function isCategoryId(id: string, type: TransactionType): id is CategoryId {
  return categoriesForType(type).some((c) => c.id === id);
}

function isPaymentMethodId(id: string): id is PaymentMethodId {
  return PAYMENT_METHODS.some((m) => m.id === id);
}

export function TransactionForm({
  userId,
  transaction,
  descriptionSuggestions = [],
  merchantSuggestions = [],
  onSuccess,
}: TransactionFormProps) {
  const isEdit = Boolean(transaction);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<CategoryId>(() =>
    defaultCategoryForType("expense"),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cash");
  const [occurredAtLocal, setOccurredAtLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setMerchant(transaction.merchant);
      setType(transaction.type);
      setCategory(
        isCategoryId(transaction.category, transaction.type)
          ? transaction.category
          : defaultCategoryForType(transaction.type),
      );
      setPaymentMethod(
        isPaymentMethodId(transaction.paymentMethod)
          ? transaction.paymentMethod
          : "cash",
      );
      setOccurredAtLocal(toDatetimeLocalValue(transaction.occurredAt));
    } else {
      setAmount("");
      setDescription("");
      setMerchant("");
      setType("expense");
      setCategory(defaultCategoryForType("expense"));
      setPaymentMethod("cash");
      setOccurredAtLocal(toDatetimeLocalValue(new Date()));
    }
    setError(null);
  }, [transaction]);

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
    if (!description.trim() && !merchant.trim()) {
      setError("Enter what this was for (e.g. lunch) or a merchant.");
      return;
    }

    const occurredAt = isEdit
      ? fromDatetimeLocalValue(occurredAtLocal)
      : new Date();
    if (!occurredAt) {
      setError("Enter a valid date and time.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        amount: n,
        description: description.trim(),
        merchant: merchant.trim(),
        type,
        category,
        paymentMethod,
        currency: transaction?.currency ?? "MYR",
        occurredAt: Timestamp.fromDate(occurredAt),
      };

      if (isEdit && transaction) {
        const ref = doc(
          getFirebaseDb(),
          "users",
          userId,
          "transactions",
          transaction.id,
        );
        await updateDoc(ref, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        const txCol = collection(
          getFirebaseDb(),
          "users",
          userId,
          "transactions",
        );
        await addDoc(txCol, {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setAmount("");
        setDescription("");
        setMerchant("");
      }
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
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
              RM
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus={!isEdit}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3.5 pr-4 pl-12 text-lg font-medium tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="0.00"
            />
          </div>
        </div>
        <AutocompleteInput
          label="What was it?"
          value={description}
          onChange={setDescription}
          suggestions={descriptionSuggestions}
          placeholder="e.g. lunch, snacks, dinner"
        />
        <AutocompleteInput
          label={
            <>
              Merchant{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
            </>
          }
          value={merchant}
          onChange={setMerchant}
          suggestions={merchantSuggestions}
          placeholder="e.g. McDonald's, 7-Eleven"
        />
        {isEdit ? (
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Date & time
            </label>
            <input
              type="datetime-local"
              value={occurredAtLocal}
              onChange={(e) => setOccurredAtLocal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        ) : null}
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Type
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                type === "expense"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <ExpenseTypeIcon size={18} />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                type === "income"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <IncomeTypeIcon size={18} />
              Income
            </button>
          </div>
        </div>
        <IconOptionGrid
          label="Category"
          options={categoriesForType(type)}
          value={category}
          onChange={(id) => setCategory(id as CategoryId)}
          variant="category"
          columns={4}
        />
        <IconOptionGrid
          label="Payment"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onChange={(id) => setPaymentMethod(id as PaymentMethodId)}
          variant="payment"
          columns={4}
        />
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
          {busy ? "Saving…" : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
