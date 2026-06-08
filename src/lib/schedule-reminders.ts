import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  ExpenseReminder,
  usesNativeAndroidReminders,
} from "@/lib/expense-reminder-native";
import { dispatchReminderAlert } from "@/lib/reminder-events";
import {
  REMINDER_NOTIFICATION_IDS,
  TEST_REMINDER_NOTIFICATION_ID,
  reminderSlotMessage,
  type ReminderSettings,
} from "@/lib/reminders";

export type ReminderSetupStatus = {
  ok: boolean;
  message?: string;
  native: boolean;
};

/** Next local-time occurrence for hour:minute (today or tomorrow). */
export function nextTriggerForSlot(hour: number, minute: number): Date {
  const now = new Date();
  const trigger = new Date(now);
  trigger.setSeconds(0, 0);
  trigger.setMilliseconds(0);
  trigger.setHours(hour, minute, 0, 0);
  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

export async function getReminderSetupStatus(): Promise<ReminderSetupStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      native: false,
      message: "Install the Android app to use reminders.",
    };
  }

  const display = await LocalNotifications.checkPermissions();
  if (display.display !== "granted") {
    return {
      ok: false,
      native: true,
      message: "Notifications are off. Turn reminders on to allow them.",
    };
  }

  const exact = await LocalNotifications.checkExactNotificationSetting();
  if (exact.exact_alarm !== "granted") {
    return {
      ok: false,
      native: true,
      message:
        'Enable "Alarms & reminders" for this app in Android settings.',
    };
  }

  return { ok: true, native: true };
}

export async function requestReminderPermissions(): Promise<boolean> {
  const status = await ensureReminderSetup();
  return status.ok;
}

export async function ensureReminderSetup(): Promise<ReminderSetupStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      native: false,
      message: "Install the Android app to use reminders.",
    };
  }

  const current = await LocalNotifications.checkPermissions();
  if (current.display !== "granted") {
    const result = await LocalNotifications.requestPermissions();
    if (result.display !== "granted") {
      return {
        ok: false,
        native: true,
        message: "Notification permission was denied.",
      };
    }
  }

  const exact = await LocalNotifications.checkExactNotificationSetting();
  if (exact.exact_alarm !== "granted") {
    await LocalNotifications.changeExactNotificationSetting();
    const recheck = await LocalNotifications.checkExactNotificationSetting();
    if (recheck.exact_alarm !== "granted") {
      return {
        ok: false,
        native: true,
        message:
          'Turn on "Alarms & reminders" for Rainy Day Money Manager, then try again.',
      };
    }
  }

  return { ok: true, native: true };
}

function buildNativeReminders(settings: ReminderSettings) {
  return settings.slots
    .map((slot, index) => ({
      slot,
      notificationId: REMINDER_NOTIFICATION_IDS[index],
    }))
    .filter(
      (entry): entry is typeof entry & { notificationId: number } =>
        entry.slot.enabled && entry.notificationId !== undefined,
    )
    .map(({ slot, notificationId }) => {
      const message = reminderSlotMessage(slot.id);
      const at = nextTriggerForSlot(slot.hour, slot.minute);
      return {
        id: notificationId,
        title: message.title,
        body: message.body,
        hour: slot.hour,
        minute: slot.minute,
        at: at.getTime(),
      };
    });
}

export async function syncExpenseReminders(
  settings: ReminderSettings,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  if (!settings.enabled) {
    if (usesNativeAndroidReminders()) {
      await ExpenseReminder.cancelAll();
    }
    return;
  }

  const setup = await getReminderSetupStatus();
  if (!setup.ok) return;

  const reminders = buildNativeReminders(settings);
  if (reminders.length === 0) {
    if (usesNativeAndroidReminders()) {
      await ExpenseReminder.cancelAll();
    }
    return;
  }

  if (usesNativeAndroidReminders()) {
    await ExpenseReminder.scheduleReminders({ reminders });
    return;
  }

  await LocalNotifications.cancel({
    notifications: REMINDER_NOTIFICATION_IDS.map((id) => ({ id })),
  });

  await LocalNotifications.schedule({
    notifications: reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      body: reminder.body,
      schedule: {
        at: new Date(reminder.at),
        allowWhileIdle: true,
      },
      extra: { action: "add-transaction" },
    })),
  });
}

export async function scheduleTestReminderNotification(): Promise<ReminderSetupStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      native: false,
      message: "Test notifications only work in the installed app.",
    };
  }

  const setup = await ensureReminderSetup();
  if (!setup.ok) return setup;

  const title = "Test reminder";
  const body = "If you see this, reminders are working.";

  try {
    if (usesNativeAndroidReminders()) {
      await ExpenseReminder.showNow({
        id: TEST_REMINDER_NOTIFICATION_ID,
        title,
        body,
      });
    } else {
      await LocalNotifications.schedule({
        notifications: [{ id: TEST_REMINDER_NOTIFICATION_ID, title, body }],
      });
      dispatchReminderAlert({ title, body });
    }

    return { ok: true, native: true };
  } catch (error) {
    return {
      ok: false,
      native: true,
      message:
        error instanceof Error ? error.message : "Could not show test notification.",
    };
  }
}

export async function scheduleDelayedTestReminderNotification(
  delaySeconds = 60,
): Promise<ReminderSetupStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      ok: false,
      native: false,
      message: "Test notifications only work in the installed app.",
    };
  }

  const setup = await ensureReminderSetup();
  if (!setup.ok) return setup;

  const title = "Scheduled test";
  const body = `This was scheduled ${delaySeconds} seconds ahead.`;

  try {
    const at = Date.now() + delaySeconds * 1000;

    if (usesNativeAndroidReminders()) {
      await ExpenseReminder.scheduleAt({
        id: TEST_REMINDER_NOTIFICATION_ID,
        title,
        body,
        at,
        hour: -1,
        minute: -1,
      });
    } else {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_REMINDER_NOTIFICATION_ID,
            title,
            body,
            schedule: { at: new Date(at), allowWhileIdle: true },
          },
        ],
      });
    }

    return { ok: true, native: true };
  } catch (error) {
    return {
      ok: false,
      native: true,
      message:
        error instanceof Error
          ? error.message
          : "Could not schedule test notification.",
    };
  }
}

export async function getPendingReminderCount(
  settings?: ReminderSettings,
): Promise<number | null> {
  if (!Capacitor.isNativePlatform()) return null;

  if (settings) {
    if (!settings.enabled) return 0;
    return settings.slots.filter((slot) => slot.enabled).length;
  }

  const pending = await LocalNotifications.getPending();
  return pending.notifications.length;
}

export async function getNextReminderSummary(
  settings: ReminderSettings,
): Promise<string | null> {
  if (!Capacitor.isNativePlatform() || !settings.enabled) return null;

  const enabled = settings.slots.filter((slot) => slot.enabled);
  if (enabled.length === 0) return null;

  const next = enabled
    .map((slot) => nextTriggerForSlot(slot.hour, slot.minute))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (!next) return null;

  return next.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
