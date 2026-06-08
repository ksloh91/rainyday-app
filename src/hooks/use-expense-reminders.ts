"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  ExpenseReminder,
  usesNativeAndroidReminders,
} from "@/lib/expense-reminder-native";
import { REMINDER_ALERT_EVENT, type ReminderAlertPayload } from "@/lib/reminder-events";
import { syncExpenseReminders } from "@/lib/schedule-reminders";
import type { ReminderSettings } from "@/lib/reminders";

export type ReminderAlert = ReminderAlertPayload;

function readAlert(
  notification: { title?: string; body?: string } | undefined,
  fallbackTitle: string,
  fallbackBody: string,
): ReminderAlert {
  return {
    title: notification?.title?.trim() || fallbackTitle,
    body: notification?.body?.trim() || fallbackBody,
  };
}

export function useExpenseReminders(settings: ReminderSettings, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    void syncExpenseReminders(settings);
  }, [settings, ready]);

  useEffect(() => {
    if (!ready || !usesNativeAndroidReminders()) return;
    void ExpenseReminder.consumePendingLaunch();
  }, [ready]);
}

export function useReminderAlerts(
  settings: ReminderSettings,
  ready: boolean,
  onAlert: (alert: ReminderAlert) => void,
) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ReminderAlert>).detail;
      if (detail?.title) onAlert(detail);
    };
    window.addEventListener(REMINDER_ALERT_EVENT, handler);
    return () => window.removeEventListener(REMINDER_ALERT_EVENT, handler);
  }, [onAlert]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !ready) return;

    let cancelled = false;
    const removeFns: Array<() => void> = [];

    if (usesNativeAndroidReminders()) {
      void ExpenseReminder.addListener("reminderLaunched", (data) => {
        onAlert(
          readAlert(
            data,
            "Time to log spending",
            "Tap below to add an expense.",
          ),
        );
      }).then((handle) => {
        if (cancelled) {
          void handle.remove();
          return;
        }
        removeFns.push(() => {
          void handle.remove();
        });
      });

      return () => {
        cancelled = true;
        removeFns.forEach((remove) => remove());
      };
    }

    const handleFired = (
      notification: { title?: string; body?: string } | undefined,
    ) => {
      onAlert(
        readAlert(
          notification,
          "Time to log spending",
          "Tap below to add an expense.",
        ),
      );
      if (settings.enabled) {
        void syncExpenseReminders(settings);
      }
    };

    void LocalNotifications.addListener("localNotificationReceived", (event) => {
      handleFired(event);
    }).then((handle) => {
      if (cancelled) {
        void handle.remove();
        return;
      }
      removeFns.push(() => {
        void handle.remove();
      });
    });

    void LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        handleFired(event.notification);
      },
    ).then((handle) => {
      if (cancelled) {
        void handle.remove();
        return;
      }
      removeFns.push(() => {
        void handle.remove();
      });
    });

    return () => {
      cancelled = true;
      removeFns.forEach((remove) => remove());
    };
  }, [settings, ready, onAlert]);
}
