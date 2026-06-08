"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  DEFAULT_REMINDER_SETTINGS,
  parseReminderSettings,
  type ReminderSettings,
} from "@/lib/reminders";

export function useReminderSettings(userId: string) {
  const [settings, setSettings] = useState<ReminderSettings>(
    DEFAULT_REMINDER_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_REMINDER_SETTINGS);
      setLoading(false);
      return;
    }

    const ref = doc(getFirebaseDb(), "users", userId, "settings", "reminders");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setSettings(
          snap.exists()
            ? parseReminderSettings(snap.data())
            : DEFAULT_REMINDER_SETTINGS,
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
  }, [userId]);

  const updateSettings = useCallback(
    async (next: ReminderSettings) => {
      if (!userId) return;

      setSaving(true);
      setError(null);
      try {
        const ref = doc(getFirebaseDb(), "users", userId, "settings", "reminders");
        await setDoc(
          ref,
          {
            enabled: next.enabled,
            slots: next.slots,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save reminders.");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [userId],
  );

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
  };
}
