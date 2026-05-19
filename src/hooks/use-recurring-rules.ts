"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { materializeDueRecurringRules } from "@/lib/materialize-recurring";
import {
  firestoreRulePayload,
  isDue,
  parseRecurringRuleDoc,
  startOfDay,
  type RecurringRule,
  type RecurringRuleInput,
} from "@/lib/recurring";
import { getFirebaseDb } from "@/lib/firebase";

export function useRecurringRules(userId: string) {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [materializing, setMaterializing] = useState(false);
  const materializeLock = useRef(false);

  useEffect(() => {
    if (!userId) {
      setRules([]);
      setLoading(false);
      return;
    }

    const col = collection(getFirebaseDb(), "users", userId, "recurringRules");
    const q = query(col, orderBy("nextDueAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const parsed = snap.docs
          .map((d) => parseRecurringRuleDoc(d.id, d.data()))
          .filter((r): r is RecurringRule => r !== null);
        setRules(parsed);
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

  useEffect(() => {
    if (!userId || loading || materializeLock.current) return;
    const hasDue = rules.some((r) => isDue(r));
    if (!hasDue) return;

    materializeLock.current = true;
    setMaterializing(true);
    materializeDueRecurringRules(userId, rules)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not post recurring.");
      })
      .finally(() => {
        materializeLock.current = false;
        setMaterializing(false);
      });
  }, [userId, loading, rules]);

  const saveRule = useCallback(
    async (input: RecurringRuleInput, existingId?: string) => {
      if (!userId) return;

      const nextDueAt = startOfDay(input.nextDueAt ?? input.startDate);
      const payload = {
        ...firestoreRulePayload(input),
        startDate: Timestamp.fromDate(startOfDay(input.startDate)),
        nextDueAt: Timestamp.fromDate(nextDueAt),
        endDate: input.endDate ? Timestamp.fromDate(startOfDay(input.endDate)) : null,
        updatedAt: serverTimestamp(),
      };

      if (existingId) {
        await updateDoc(
          doc(getFirebaseDb(), "users", userId, "recurringRules", existingId),
          payload,
        );
        return existingId;
      }

      const ref = await addDoc(
        collection(getFirebaseDb(), "users", userId, "recurringRules"),
        {
          ...payload,
          createdAt: serverTimestamp(),
        },
      );
      return ref.id;
    },
    [userId],
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      if (!userId) return;
      await deleteDoc(
        doc(getFirebaseDb(), "users", userId, "recurringRules", ruleId),
      );
    },
    [userId],
  );

  const setRuleActive = useCallback(
    async (ruleId: string, active: boolean) => {
      if (!userId) return;
      await updateDoc(
        doc(getFirebaseDb(), "users", userId, "recurringRules", ruleId),
        { active, updatedAt: serverTimestamp() },
      );
    },
    [userId],
  );

  return {
    rules,
    error,
    loading,
    materializing,
    saveRule,
    deleteRule,
    setRuleActive,
  };
}
