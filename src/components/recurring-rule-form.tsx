"use client";

import { useEffect, useState } from "react";
import { IconOptionGrid } from "@/components/icon-option-grid";
import { ExpenseTypeIcon, IncomeTypeIcon } from "@/components/icons";
import {
  categoriesForType,
  defaultCategoryForType,
  type CategoryId,
  type TransactionType,
} from "@/lib/categories";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payment-methods";
import {
  fromDateInputValue,
  getFrequencyLabel,
  toDateInputValue,
  type RecurrenceFrequency,
  type RecurringRule,
  startOfDay,
  type RecurringRuleInput,
} from "@/lib/recurring";

const FREQUENCIES: RecurrenceFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

type RecurringRuleFormProps = {
  rule?: RecurringRule | null;
  onSave: (input: RecurringRuleInput, existingId?: string) => Promise<void>;
  onSuccess?: () => void;
};

function isCategoryId(id: string, type: TransactionType): id is CategoryId {
  return categoriesForType(type).some((c) => c.id === id);
}

function isPaymentMethodId(id: string): id is PaymentMethodId {
  return PAYMENT_METHODS.some((m) => m.id === id);
}

export function RecurringRuleForm({
  rule,
  onSave,
  onSuccess,
}: RecurringRuleFormProps) {
  const isEdit = Boolean(rule);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<CategoryId>(() =>
    defaultCategoryForType("expense"),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cash");
  const [frequency, setFrequency] =
    useState<RecurrenceFrequency>("monthly");
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setAmount(String(rule.amount));
      setDescription(rule.description);
      setMerchant(rule.merchant);
      setType(rule.type);
      setCategory(
        isCategoryId(rule.category, rule.type)
          ? rule.category
          : defaultCategoryForType(rule.type),
      );
      setPaymentMethod(
        isPaymentMethodId(rule.paymentMethod) ? rule.paymentMethod : "cash",
      );
      setFrequency(rule.frequency);
      setStartDate(toDateInputValue(rule.startDate));
      setEndDate(rule.endDate ? toDateInputValue(rule.endDate) : "");
      setActive(rule.active);
    } else {
      setAmount("");
      setDescription("");
      setMerchant("");
      setType("expense");
      setCategory(defaultCategoryForType("expense"));
      setPaymentMethod("cash");
      setFrequency("monthly");
      setStartDate(toDateInputValue(new Date()));
      setEndDate("");
      setActive(true);
    }
    setError(null);
  }, [rule]);

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory((current) => {
      const options = categoriesForType(next);
      return options.some((c) => c.id === current)
        ? current
        : defaultCategoryForType(next);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (!description.trim() && !merchant.trim()) {
      setError("Enter a description or merchant.");
      return;
    }

    const start = fromDateInputValue(startDate);
    if (!start) {
      setError("Enter a valid start date.");
      return;
    }

    const end = endDate.trim() ? fromDateInputValue(endDate) : null;
    if (endDate.trim() && !end) {
      setError("Enter a valid end date.");
      return;
    }
    if (end && end < start) {
      setError("End date must be on or after start date.");
      return;
    }

    const input: RecurringRuleInput = {
      description: description.trim(),
      merchant: merchant.trim(),
      amount: n,
      type,
      category,
      paymentMethod,
      currency: rule?.currency ?? "MYR",
      frequency,
      startDate: start,
      endDate: end,
      active,
      nextDueAt: isEdit ? rule!.nextDueAt : startOfDay(start),
    };

    setBusy(true);
    try {
      await onSave(input, rule?.id);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Due transactions are added to your list automatically when you open
          the app.
        </p>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Amount (MYR)
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
              RM
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus={!isEdit}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3.5 pr-4 pl-12 text-lg font-medium tabular-nums dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            What is it?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="e.g. Rent, Netflix, Salary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Merchant <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="e.g. Landlord, Employer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Repeats
          </label>
          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as RecurrenceFrequency)
            }
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {getFrequencyLabel(f)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Starts
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Ends <span className="font-normal text-zinc-400">(opt.)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Type
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                type === "expense"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <ExpenseTypeIcon size={18} />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                type === "income"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <IncomeTypeIcon size={18} />
              Income
            </button>
          </div>
        </div>
        <IconOptionGrid
          label="Category"
          options={categoriesForType(type)}
          value={category}
          onChange={(id) => setCategory(id as CategoryId)}
          variant="category"
          columns={4}
        />
        <IconOptionGrid
          label="Payment"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onChange={(id) => setPaymentMethod(id as PaymentMethodId)}
          variant="payment"
          columns={4}
        />
        {isEdit ? (
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Active (posts when due)
          </label>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
      <div
        className="sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white active:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
