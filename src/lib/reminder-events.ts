export type ReminderAlertPayload = {
  title: string;
  body: string;
};

export const REMINDER_ALERT_EVENT = "money-manager:reminder-alert";

export function dispatchReminderAlert(alert: ReminderAlertPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(REMINDER_ALERT_EVENT, { detail: alert }),
  );
}
