"use client";

import { useEffect, useState } from "react";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui-card";
import {
  DEFAULT_REMINDER_SETTINGS,
  formatReminderTime,
  parseReminderTime,
  reminderSlotLabel,
  type ReminderSettings,
  type ReminderSlot,
} from "@/lib/reminders";
import {
  ensureReminderSetup,
  getNextReminderSummary,
  getPendingReminderCount,
  getReminderSetupStatus,
  scheduleDelayedTestReminderNotification,
  scheduleTestReminderNotification,
  syncExpenseReminders,
} from "@/lib/schedule-reminders";
import { Capacitor } from "@capacitor/core";

type RemindersSettingsProps = {
  settings: ReminderSettings;
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  onSave: (settings: ReminderSettings) => Promise<void>;
};

export function RemindersSettings({
  settings,
  loading,
  saving,
  error,
  onSave,
}: RemindersSettingsProps) {
  const [draft, setDraft] = useState(settings);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [nextReminder, setNextReminder] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testingSchedule, setTestingSchedule] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (!isNative) return;

    void (async () => {
      const status = await getReminderSetupStatus();
      if (!status.ok && status.message) {
        setStatusHint(status.message);
      } else {
        setStatusHint(null);
      }
      setPendingCount(await getPendingReminderCount(draft));
      setNextReminder(await getNextReminderSummary(draft));
    })();
  }, [draft, settings, isNative]);

  function updateSlot(index: number, patch: Partial<ReminderSlot>) {
    setDraft((prev) => ({
      ...prev,
      slots: prev.slots.map((slot, i) =>
        i === index ? { ...slot, ...patch } : slot,
      ),
    }));
  }

  async function persist(next: ReminderSettings) {
    setPermissionHint(null);
    if (next.enabled) {
      const setup = await ensureReminderSetup();
      if (!setup.ok) {
        setPermissionHint(
          setup.message ??
            "Allow notifications in system settings to get daily reminders.",
        );
        const disabled = { ...next, enabled: false };
        setDraft(disabled);
        await onSave(disabled);
        return;
      }
    }
    await onSave(next);
    await syncExpenseReminders(next);
    setPendingCount(await getPendingReminderCount(next));
    setNextReminder(await getNextReminderSummary(next));
  }

  async function sendTestNotification() {
    setTesting(true);
    setPermissionHint(null);
    try {
      const result = await scheduleTestReminderNotification();
      if (!result.ok) {
        setPermissionHint(result.message ?? "Could not schedule test.");
        return;
      }
      setStatusHint("Pop-up should appear now. Banner also in notification shade.");
      setPendingCount(await getPendingReminderCount(draft));
      setNextReminder(await getNextReminderSummary(draft));
    } finally {
      setTesting(false);
    }
  }

  async function sendScheduledTest() {
    setTestingSchedule(true);
    setPermissionHint(null);
    try {
      const result = await scheduleDelayedTestReminderNotification(60);
      if (!result.ok) {
        setPermissionHint(result.message ?? "Could not schedule test.");
        return;
      }
      setStatusHint(
        "Scheduled test in 1 minute. Press Home and wait — pop-up or banner should appear.",
      );
      setPendingCount(await getPendingReminderCount(draft));
    } finally {
      setTestingSchedule(false);
    }
  }

  async function toggleEnabled() {
    const next = { ...draft, enabled: !draft.enabled };
    setDraft(next);
    await persist(next);
  }

  async function toggleSlot(index: number) {
    const next = {
      ...draft,
      slots: draft.slots.map((slot, i) =>
        i === index ? { ...slot, enabled: !slot.enabled } : slot,
      ),
    };
    setDraft(next);
    if (draft.enabled) {
      await persist(next);
    }
  }

  async function saveSlotTime(index: number, value: string) {
    const parsed = parseReminderTime(value);
    if (!parsed) return;

    const next = {
      ...draft,
      slots: draft.slots.map((slot, i) =>
        i === index ? { ...slot, ...parsed } : slot,
      ),
    };
    setDraft(next);
    if (draft.enabled) {
      await persist(next);
    }
  }

  async function resetDefaults() {
    const next = {
      ...DEFAULT_REMINDER_SETTINGS,
      enabled: draft.enabled,
    };
    setDraft(next);
    await persist(next);
  }

  if (loading) {
    return (
      <AppCard>
        <AppCardHeader
          title="Expense reminders"
          subtitle="Loading…"
        />
      </AppCard>
    );
  }

  return (
    <AppCard>
      <AppCardHeader
        title="Expense reminders"
        subtitle="Pop-up reminders at your chosen times — in-app and as a banner."
        action={
          <button
            type="button"
            role="switch"
            aria-checked={draft.enabled}
            disabled={saving}
            onClick={() => void toggleEnabled()}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
              draft.enabled
                ? "bg-emerald-500"
                : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                draft.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        }
      />
      <AppCardBody className="space-y-4 !py-3">
        {draft.slots.map((slot, index) => (
          <div
            key={slot.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={slot.enabled}
              disabled={!draft.enabled || saving}
              onClick={() => void toggleSlot(index)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition disabled:opacity-40 ${
                slot.enabled && draft.enabled
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
              }`}
            >
              {slot.enabled && draft.enabled ? (
                <span className="text-[10px] font-bold">✓</span>
              ) : null}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {reminderSlotLabel(slot.id)}
              </p>
            </div>
            <input
              type="time"
              value={formatReminderTime(slot.hour, slot.minute)}
              disabled={!draft.enabled || saving}
              onChange={(e) => void saveSlotTime(index, e.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm text-zinc-900 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        ))}

        <button
          type="button"
          disabled={saving}
          onClick={() => void resetDefaults()}
          className="text-xs font-medium text-zinc-500 transition active:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:active:text-zinc-300"
        >
          Reset to default times
        </button>

        {isNative ? (
          <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {draft.enabled
                ? pendingCount === null
                  ? "Checking scheduled reminders…"
                  : `${pendingCount} alarm${pendingCount === 1 ? "" : "s"} set${
                      nextReminder ? ` · next ${nextReminder}` : ""
                    }`
                : "Turn reminders on, then send a test."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={testing || saving}
                onClick={() => void sendTestNotification()}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {testing ? "Sending…" : "Pop-up test now"}
              </button>
              <button
                type="button"
                disabled={testingSchedule || saving}
                onClick={() => void sendScheduledTest()}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 active:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              >
                {testingSchedule ? "Scheduling…" : "Schedule test in 1 min"}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Scheduled reminders open the app with a pop-up, even from the home
              screen. Allow full-screen notifications if Android asks.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Reminders work in the installed Android app, not in the browser.
          </p>
        )}

        {statusHint ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusHint}</p>
        ) : null}
        {permissionHint ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {permissionHint}
          </p>
        ) : null}
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </AppCardBody>
    </AppCard>
  );
}
