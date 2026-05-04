"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payment-methods";

type TxType = "expense" | "income";

export function TransactionForm({ userId }: { userId: string }) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [recent, setRecent] = useState<
    { id: string; merchant: string; amount: number; type: string }[]
  >([]);

  useEffect(() => {
    const txCol = collection(
      getFirebaseDb(),
      "users",
      userId,
      "transactions",
    );
    const q = query(txCol, orderBy("createdAt", "desc"), limit(5));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRecent(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              merchant: String(data.merchant ?? ""),
              amount: Number(data.amount ?? 0),
              type: String(data.type ?? "expense"),
            };
          }),
        );
      },
      (err) => setError(err.message),
    );
    return () => unsub();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedHint(null);
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
        paymentMethod,
        currency: "MYR",
        occurredAt: Timestamp.now(),
        createdAt: serverTimestamp(),
      });
      setAmount("");
      setMerchant("");
      setSavedHint("Saved to Firestore.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 w-full space-y-4 text-left">
      <h2 className="text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Add transaction
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Amount (MYR)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Merchant
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="e.g. Breakfast spot"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TxType)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Payment
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethodId)
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save transaction"}
        </button>
      </form>
      {savedHint ? (
        <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
          {savedHint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {recent.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Recent (last 5)
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex justify-between gap-2 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
              >
                <span className="truncate text-zinc-800 dark:text-zinc-200">
                  {r.merchant}
                </span>
                <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-50">
                  {r.type === "income" ? "+" : "−"}
                  {r.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
