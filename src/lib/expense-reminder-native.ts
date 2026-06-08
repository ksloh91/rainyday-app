import { Capacitor, registerPlugin } from "@capacitor/core";

export type NativeReminderSlot = {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
  at: number;
};

export interface ExpenseReminderPlugin {
  cancelAll(): Promise<void>;
  scheduleReminders(options: { reminders: NativeReminderSlot[] }): Promise<void>;
  showNow(options: { id: number; title: string; body: string }): Promise<void>;
  scheduleAt(options: {
    id: number;
    title: string;
    body: string;
    at: number;
    hour?: number;
    minute?: number;
  }): Promise<void>;
  consumePendingLaunch(): Promise<void>;
  addListener(
    eventName: "reminderLaunched",
    listenerFunc: (data: { title: string; body: string }) => void,
  ): Promise<{ remove: () => void }>;
}

export const ExpenseReminder = registerPlugin<ExpenseReminderPlugin>(
  "ExpenseReminder",
);

export function usesNativeAndroidReminders(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}
