import type { Timestamp } from "firebase/firestore";
import type { CategoryId } from "@/lib/categories";
import type { PaymentMethodId } from "@/lib/payment-methods";
import type { TransactionType } from "@/lib/categories";

export type Transaction = {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  paymentMethod: PaymentMethodId;
  currency: string;
  occurredAt: Date;
};

export function firestoreDate(value: unknown): Date | null {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  return null;
}

export function parseTransactionDoc(
  id: string,
  data: Record<string, unknown>,
): Transaction | null {
  const occurredAt = firestoreDate(data.occurredAt ?? data.createdAt);
  if (!occurredAt) return null;

  const type = data.type === "income" ? "income" : "expense";
  const amount = Number(data.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    id,
    description: String(data.description ?? ""),
    merchant: String(data.merchant ?? ""),
    amount,
    type,
    category: String(data.category ?? "") as CategoryId,
    paymentMethod: String(data.paymentMethod ?? "cash") as PaymentMethodId,
    currency: String(data.currency ?? "MYR"),
    occurredAt,
  };
}

export function transactionDisplayTitle(tx: Transaction): string {
  const description = tx.description.trim();
  if (description) return description;
  const merchant = tx.merchant.trim();
  return merchant || "—";
}

export function transactionDisplaySubtitle(tx: Transaction): string | null {
  const description = tx.description.trim();
  const merchant = tx.merchant.trim();
  if (description && merchant) return merchant;
  return null;
}

export function merchantDisplayName(tx: Transaction): string | null {
  const merchant = tx.merchant.trim();
  return merchant || null;
}

export function merchantGroupKey(tx: Transaction): string | null {
  const merchant = tx.merchant.trim();
  return merchant ? merchant.toLowerCase() : null;
}

export function merchantMatchesKey(tx: Transaction, key: string): boolean {
  return merchantGroupKey(tx) === key;
}

export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
