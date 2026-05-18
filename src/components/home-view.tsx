"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import {
  TransactionDayList,
  type TransactionRow,
} from "@/components/transaction-day-list";
import { getFirebaseDb } from "@/lib/firebase";
import { formatMoney, formatTodayHeader, isToday } from "@/lib/format-date";

function toDate(value: unknown): Date | null {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  return null;
}

export function HomeView({ userId }: { userId: string }) {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const todayLabel = formatTodayHeader();

  useEffect(() => {
    const txCol = collection(
      getFirebaseDb(),
      "users",
      userId,
      "transactions",
    );
    const q = query(txCol, orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              merchant: String(data.merchant ?? ""),
              amount: Number(data.amount ?? 0),
              type: String(data.type ?? "expense"),
              category: String(data.category ?? ""),
              paymentMethod: String(data.paymentMethod ?? ""),
              occurredAt: toDate(data.occurredAt ?? data.createdAt),
            };
          }),
        );
      },
      (err) => setError(err.message),
    );
    return () => unsub();
  }, [userId]);

  const { todaySpent, todayIncome } = useMemo(() => {
    const todayRows = rows.filter(
      (r) => r.occurredAt && isToday(r.occurredAt),
    );
    const spent = todayRows
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    const income = todayRows
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    return { todaySpent: spent, todayIncome: income };
  }, [rows]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-emerald-600 px-5 py-5 text-white shadow-md shadow-emerald-600/20">
        <p className="text-sm font-medium text-emerald-100">{todayLabel}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {formatMoney(-todaySpent, { signed: true })}
        </p>
        {todayIncome > 0 ? (
          <p className="mt-2 text-sm text-emerald-100">
            Income {formatMoney(todayIncome, { signed: true })}
          </p>
        ) : (
          <p className="mt-2 text-sm text-emerald-100">Spent today</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Transactions
        </h2>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <div className="mt-3">
          <TransactionDayList rows={rows} />
        </div>
      </section>
    </div>
  );
}
