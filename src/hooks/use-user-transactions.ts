"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { parseTransactionDoc, type Transaction } from "@/lib/transactions";

export function useUserTransactions(userId: string, limitCount = 100) {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const txCol = collection(getFirebaseDb(), "users", userId, "transactions");
    const q = query(txCol, orderBy("createdAt", "desc"), limit(limitCount));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(
          snap.docs
            .map((d) => parseTransactionDoc(d.id, d.data()))
            .filter((r): r is Transaction => r !== null),
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [userId, limitCount]);

  return { rows, error, loading };
}
