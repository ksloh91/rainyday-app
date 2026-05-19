"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { CategoryId } from "@/lib/categories";
import {
  parseCategoryBudgetDoc,
  type CategoryBudget,
  type CategoryBudgetLimits,
} from "@/lib/budgets";
import { getFirebaseDb } from "@/lib/firebase";

export function useCategoryBudgets(userId: string) {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<CategoryId | null>(null);

  useEffect(() => {
    if (!userId) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const col = collection(
      getFirebaseDb(),
      "users",
      userId,
      "categoryBudgets",
    );

    const unsub = onSnapshot(
      col,
      (snap) => {
        const parsed = snap.docs
          .map((d) => parseCategoryBudgetDoc(d.id, d.data()))
          .filter((b): b is CategoryBudget => b !== null);
        setBudgets(parsed);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  const setCategoryBudget = useCallback(
    async (categoryId: CategoryId, limits: CategoryBudgetLimits) => {
      if (!userId) return;

      setSavingId(categoryId);
      setError(null);
      try {
        const ref = doc(
          getFirebaseDb(),
          "users",
          userId,
          "categoryBudgets",
          categoryId,
        );

        const daily =
          limits.daily !== undefined && limits.daily !== null
            ? limits.daily
            : undefined;
        const weekly =
          limits.weekly !== undefined && limits.weekly !== null
            ? limits.weekly
            : undefined;
        const monthly =
          limits.monthly !== undefined && limits.monthly !== null
            ? limits.monthly
            : undefined;

        const hasDaily = daily !== undefined && daily > 0;
        const hasWeekly = weekly !== undefined && weekly > 0;
        const hasMonthly = monthly !== undefined && monthly > 0;

        if (!hasDaily && !hasWeekly && !hasMonthly) {
          await deleteDoc(ref);
          return;
        }

        const payload: Record<string, unknown> = {
          currency: "MYR",
          updatedAt: serverTimestamp(),
        };
        if (hasDaily) payload.dailyLimit = daily;
        if (hasWeekly) payload.weeklyLimit = weekly;
        if (hasMonthly) payload.monthlyLimit = monthly;

        await setDoc(ref, payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save budget.");
        throw err;
      } finally {
        setSavingId(null);
      }
    },
    [userId],
  );

  return {
    budgets,
    error,
    loading,
    savingId,
    setCategoryBudget,
  };
}
