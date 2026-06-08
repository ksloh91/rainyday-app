"use client";

import { useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_META, PaymentBadge } from "@/components/icons";
import { SvgIcon } from "@/components/icons/svg-icon";
import { getCategoryLabel } from "@/lib/categories";
import {
  dayKey,
  formatDayNumber,
  formatDayWeekday,
  formatMonthYear,
  formatMoney,
  formatTime,
  isToday,
} from "@/lib/format-date";
import {
  transactionDisplaySubtitle,
  transactionDisplayTitle,
  type Transaction,
} from "@/lib/transactions";

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

const CATEGORY_ACCENT: Record<string, string> = {};
for (const id of Object.keys(CATEGORY_META)) {
  CATEGORY_ACCENT[id] = CATEGORY_META[id].bg.replace("bg-", "border-l-");
}

function homeRowAccentClass(row: TransactionRow) {
  if (row.type === "income") return "border-l-emerald-500";
  return CATEGORY_ACCENT[row.category] ?? "border-l-zinc-400";
}

type TransactionDayListProps = {
  rows: TransactionRow[];
  onEdit?: (transaction: TransactionRow) => void;
  /** Visual-first layout for Home */
  variant?: "default" | "home";
};

export function TransactionDayList({
  rows,
  onEdit,
  variant = "default",
}: TransactionDayListProps) {
  const isHome = variant === "home";
  const groups = useMemo(() => groupByDay(rows), [rows]);

  if (groups.length === 0) {
    if (isHome) return null;

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
    <div className={isHome ? "space-y-4" : "space-y-6"}>
      {groups.map((group) => {
        const homeTodayHeader = isHome && isToday(group.date);

        return (
          <section key={group.key}>
            <div
              className={
                isHome
                  ? "mb-2 flex items-center justify-between gap-3 rounded-lg bg-zinc-100/80 px-3 py-2 dark:bg-zinc-800/50"
                  : "flex items-center justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800"
              }
            >
              {homeTodayHeader ? (
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Today
                </p>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-bold tabular-nums text-zinc-900 dark:text-zinc-50 ${
                      isHome ? "text-xl" : "text-3xl"
                    }`}
                  >
                    {formatDayNumber(group.date)}
                  </span>
                  <div>
                    <p
                      className={`font-semibold text-zinc-900 dark:text-zinc-50 ${
                        isHome ? "text-xs" : "text-sm"
                      }`}
                    >
                      {formatDayWeekday(group.date)}
                    </p>
                    {!isHome ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatMonthYear(group.date)}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
              <p
                className={`shrink-0 font-semibold tabular-nums ${
                  isHome ? "text-xs" : "text-sm"
                } ${
                  group.net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {formatMoney(group.net, { signed: true })}
              </p>
            </div>

            <ul
              className={
                isHome
                  ? "space-y-2"
                  : "divide-y divide-zinc-100 dark:divide-zinc-800/80"
              }
            >
              {group.transactions.map((row) => {
                const isIncome = row.type === "income";
                const place = transactionDisplaySubtitle(row);
                const accent = isHome ? homeRowAccentClass(row) : "";

                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => onEdit?.(row)}
                      disabled={!onEdit}
                      className={`flex w-full items-center text-left transition disabled:cursor-default ${
                        isHome
                          ? `home-tx-card gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-3 shadow-sm active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 border-l-4 ${accent}`
                          : "gap-3 py-3.5 active:bg-zinc-100 dark:active:bg-zinc-800/60"
                      }`}
                    >
                      <CategoryIcon
                        categoryId={row.category}
                        size={isHome ? "xl" : "md"}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-medium text-zinc-900 dark:text-zinc-50 ${
                            isHome ? "text-base" : "text-sm"
                          }`}
                        >
                          {transactionDisplayTitle(row)}
                        </p>
                        {isHome ? (
                          place || row.paymentMethod ? (
                            <div className="mt-1 flex items-center gap-1.5">
                              {row.paymentMethod ? (
                                <PaymentBadge
                                  paymentId={row.paymentMethod}
                                  size="md"
                                />
                              ) : null}
                              {place ? (
                                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                  {place}
                                </p>
                              ) : null}
                            </div>
                          ) : null
                        ) : (
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {row.paymentMethod ? (
                              <PaymentBadge paymentId={row.paymentMethod} />
                            ) : null}
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {place ??
                                (row.category
                                  ? getCategoryLabel(row.category)
                                  : "—")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`font-semibold tabular-nums ${
                            isHome ? "text-base" : "text-sm"
                          } ${
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
        );
      })}
    </div>
  );
}
