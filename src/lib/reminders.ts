export type ReminderSlotId = "lunch" | "evening" | "morning";

export type ReminderSlot = {
  id: ReminderSlotId;
  hour: number;
  minute: number;
  enabled: boolean;
};

export type ReminderSettings = {
  enabled: boolean;
  slots: ReminderSlot[];
};

export const REMINDER_NOTIFICATION_IDS = [1001, 1002, 1003] as const;

export const TEST_REMINDER_NOTIFICATION_ID = 1999;

/** High-importance channel so Android shows heads-up banners. */
export const REMINDER_CHANNEL_ID = "expense-reminders-high";

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  slots: [
    { id: "lunch", hour: 12, minute: 30, enabled: true },
    { id: "evening", hour: 20, minute: 30, enabled: true },
    { id: "morning", hour: 9, minute: 0, enabled: false },
  ],
};

const SLOT_LABELS: Record<ReminderSlotId, string> = {
  lunch: "Lunch",
  evening: "Evening",
  morning: "Morning",
};

const SLOT_MESSAGES: Record<
  ReminderSlotId,
  { title: string; body: string }
> = {
  lunch: {
    title: "Lunch spend?",
    body: "Tap to log it while it's fresh.",
  },
  evening: {
    title: "End-of-day check-in",
    body: "Log today's expenses in seconds.",
  },
  morning: {
    title: "Morning coffee?",
    body: "Quick log to start the day.",
  },
};

export function reminderSlotLabel(id: ReminderSlotId): string {
  return SLOT_LABELS[id];
}

export function reminderSlotMessage(id: ReminderSlotId): {
  title: string;
  body: string;
} {
  return SLOT_MESSAGES[id];
}

export function formatReminderTime(hour: number, minute: number): string {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
}

export function parseReminderTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hour = Number.parseInt(match[1] ?? "", 10);
  const minute = Number.parseInt(match[2] ?? "", 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

function isReminderSlotId(value: unknown): value is ReminderSlotId {
  return value === "lunch" || value === "evening" || value === "morning";
}

function parseSlot(raw: unknown, fallback: ReminderSlot): ReminderSlot {
  if (!raw || typeof raw !== "object") return fallback;

  const data = raw as Record<string, unknown>;
  const id = isReminderSlotId(data.id) ? data.id : fallback.id;
  const hour =
    typeof data.hour === "number" && data.hour >= 0 && data.hour <= 23
      ? data.hour
      : fallback.hour;
  const minute =
    typeof data.minute === "number" && data.minute >= 0 && data.minute <= 59
      ? data.minute
      : fallback.minute;
  const enabled =
    typeof data.enabled === "boolean" ? data.enabled : fallback.enabled;

  return { id, hour, minute, enabled };
}

export function parseReminderSettings(data: unknown): ReminderSettings {
  if (!data || typeof data !== "object") {
    return { ...DEFAULT_REMINDER_SETTINGS, slots: [...DEFAULT_REMINDER_SETTINGS.slots] };
  }

  const record = data as Record<string, unknown>;
  const enabled = record.enabled === true;
  const rawSlots = Array.isArray(record.slots) ? record.slots : [];

  const slots = DEFAULT_REMINDER_SETTINGS.slots.map((fallback, index) =>
    parseSlot(rawSlots[index], fallback),
  );

  return { enabled, slots };
}

export const IN_APP_NUDGE_HOUR = 17;

export function shouldShowInAppLogNudge(hasLoggedToday: boolean): boolean {
  if (hasLoggedToday) return false;
  if (typeof window === "undefined") return false;

  const now = new Date();
  if (now.getHours() < IN_APP_NUDGE_HOUR) return false;

  const key = `log-nudge-dismissed-${now.toISOString().slice(0, 10)}`;
  return window.localStorage.getItem(key) !== "1";
}

export function dismissInAppLogNudge(): void {
  if (typeof window === "undefined") return;
  const key = `log-nudge-dismissed-${new Date().toISOString().slice(0, 10)}`;
  window.localStorage.setItem(key, "1");
}
