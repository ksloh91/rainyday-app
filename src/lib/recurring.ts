import type { Timestamp } from "firebase/firestore";
import type { CategoryId, TransactionType } from "@/lib/categories";
import type { PaymentMethodId } from "@/lib/payment-methods";
import { firestoreDate } from "@/lib/transactions";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type RecurringRule = {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  paymentMethod: PaymentMethodId;
  currency: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  nextDueAt: Date;
  endDate: Date | null;
  active: boolean;
};

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function getFrequencyLabel(frequency: RecurrenceFrequency) {
  return FREQUENCY_LABELS[frequency];
}

export function parseRecurringRuleDoc(
  id: string,
  data: Record<string, unknown>,
): RecurringRule | null {
  const amount = Number(data.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const startDate = firestoreDate(data.startDate);
  const nextDueAt = firestoreDate(data.nextDueAt ?? data.startDate);
  if (!startDate || !nextDueAt) return null;

  const frequency = data.frequency;
  if (
    frequency !== "daily" &&
    frequency !== "weekly" &&
    frequency !== "monthly" &&
    frequency !== "yearly"
  ) {
    return null;
  }

  const type = data.type === "income" ? "income" : "expense";

  return {
    id,
    description: String(data.description ?? ""),
    merchant: String(data.merchant ?? ""),
    amount,
    type,
    category: String(data.category ?? "") as CategoryId,
    paymentMethod: String(data.paymentMethod ?? "cash") as PaymentMethodId,
    currency: String(data.currency ?? "MYR"),
    frequency,
    startDate: startOfDay(startDate),
    nextDueAt: startOfDay(nextDueAt),
    endDate: firestoreDate(data.endDate),
    active: data.active !== false,
  };
}

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()) {
  const d = startOfDay(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function advanceNextDue(
  current: Date,
  frequency: RecurrenceFrequency,
  anchorStart: Date,
): Date {
  const d = startOfDay(current);

  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly": {
      const anchorDay = anchorStart.getDate();
      d.setMonth(d.getMonth() + 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(anchorDay, lastDay));
      break;
    }
    case "yearly": {
      d.setFullYear(d.getFullYear() + 1);
      const anchorDay = anchorStart.getDate();
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(anchorDay, lastDay));
      break;
    }
  }

  return d;
}

export function isDue(rule: RecurringRule, asOf = new Date()) {
  if (!rule.active) return false;
  if (rule.endDate && rule.nextDueAt > rule.endDate) return false;
  return rule.nextDueAt.getTime() <= endOfDay(asOf).getTime();
}

export function ruleDisplayTitle(rule: RecurringRule) {
  const description = rule.description.trim();
  if (description) return description;
  return rule.merchant.trim() || "Recurring";
}

/** Merchant on the second line when it is not already the title. */
export function ruleDisplaySubtitle(rule: RecurringRule): string | null {
  const merchant = rule.merchant.trim();
  if (!merchant) return null;
  if (merchant === ruleDisplayTitle(rule)) return null;
  return merchant;
}

export function toDateInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return startOfDay(new Date(y, m - 1, d));
}

export type RecurringRuleInput = Omit<
  RecurringRule,
  "id" | "nextDueAt"
> & {
  nextDueAt?: Date;
};

export function firestoreRulePayload(
  input: RecurringRuleInput,
): Record<string, unknown> {
  return {
    description: input.description.trim(),
    merchant: input.merchant.trim(),
    amount: input.amount,
    type: input.type,
    category: input.category,
    paymentMethod: input.paymentMethod,
    currency: input.currency,
    frequency: input.frequency,
    active: input.active,
  };
}
