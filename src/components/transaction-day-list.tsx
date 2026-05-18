"use client";

import { useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { PaymentBadge } from "@/components/icons";
import { SvgIcon } from "@/components/icons/svg-icon";
import { getCategoryLabel } from "@/lib/categories";
import {
  dayKey,
  formatDayNumber,
  formatDayWeekday,
  formatMonthYear,
  formatMoney,
  formatTime,
} from "@/lib/format-date";
import { getPaymentMethodLabel } from "@/lib/payment-methods";
import type { Transaction } from "@/lib/transactions";

export type TransactionRow = Transaction;

type DayGroup = {
  date: Date;
  key: string;
  transactions: TransactionRow[];
  net: number;
};

function groupByDay(rows: TransactionRow[]): DayGroup[] {
  const map = new Map<string, TransactionRow[]>();

  for (const row of rows) {
    const key = dayKey(row.occurredAt);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }

  return [...map.entries()]
    .map(([key, transactions]) => {
      const date = transactions[0].occurredAt;
      const sorted = [...transactions].sort(
        (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
      );
      const net = sorted.reduce((sum, t) => {
        return sum + (t.type === "income" ? t.amount : -t.amount);
      }, 0);
      return { key, date, transactions: sorted, net };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function rowAmount(row: TransactionRow) {
  const signed = row.type === "income" ? row.amount : -row.amount;
  return formatMoney(signed, { signed: true });
}

type TransactionDayListProps = {
  rows: TransactionRow[];
  onEdit?: (transaction: TransactionRow) => void;
};

export function TransactionDayList({ rows, onEdit }: TransactionDayListProps) {
  const groups = useMemo(() => groupByDay(rows), [rows]);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <SvgIcon size={24}>
            <rect x="4" y="5" width="16" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
          </SvgIcon>
        </span>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          No transactions yet.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Tap Add below to log your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatDayNumber(group.date)}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatDayWeekday(group.date)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatMonthYear(group.date)}
                </p>
              </div>
            </div>
            <p
              className={`shrink-0 text-sm font-semibold tabular-nums ${
                group.net >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {formatMoney(group.net, { signed: true })}
            </p>
          </div>

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {group.transactions.map((row) => {
              const isIncome = row.type === "income";
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onEdit?.(row)}
                    disabled={!onEdit}
                    className="flex w-full items-center gap-3 py-3.5 text-left transition active:bg-zinc-100 disabled:cursor-default dark:active:bg-zinc-800/60"
                  >
                  <CategoryIcon categoryId={row.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.merchant}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {row.paymentMethod ? (
                        <PaymentBadge paymentId={row.paymentMethod} />
                      ) : null}
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {row.paymentMethod
                          ? getPaymentMethodLabel(row.paymentMethod)
                          : row.category
                            ? getCategoryLabel(row.category)
                            : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {rowAmount(row)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {formatTime(row.occurredAt)}
                    </p>
                  </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
