"use client";

import { useMemo } from "react";
import { AppCard, AppCardBody } from "@/components/ui-card";
import {
  TransactionDayList,
  type TransactionRow,
} from "@/components/transaction-day-list";
import { transactionsForMerchant } from "@/lib/insights";
import { formatMoney, formatMonthLabel } from "@/lib/format-date";

type MerchantTransactionsViewProps = {
  merchantKey: string;
  merchantLabel: string;
  rows: TransactionRow[];
  onBack: () => void;
  onEditTransaction?: (transaction: TransactionRow) => void;
};

export function MerchantTransactionsView({
  merchantKey,
  merchantLabel,
  rows,
  onBack,
  onEditTransaction,
}: MerchantTransactionsViewProps) {
  const merchantRows = useMemo(
    () => transactionsForMerchant(rows, merchantKey),
    [rows, merchantKey],
  );
  const totalSpent = useMemo(
    () => merchantRows.reduce((sum, tx) => sum + tx.amount, 0),
    [merchantRows],
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 active:opacity-70 dark:text-emerald-400"
      >
        <span aria-hidden>←</span>
        Back to Insights
      </button>

      <AppCard>
        <AppCardBody className="!py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {merchantLabel.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {merchantLabel}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {formatMonthLabel()} · {merchantRows.length}{" "}
                {merchantRows.length === 1 ? "transaction" : "transactions"}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatMoney(totalSpent)}
              </p>
            </div>
          </div>
        </AppCardBody>
      </AppCard>

      {merchantRows.length > 0 ? (
        <TransactionDayList rows={merchantRows} onEdit={onEditTransaction} />
      ) : (
        <AppCard>
          <AppCardBody className="py-10 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No transactions this month.
            </p>
          </AppCardBody>
        </AppCard>
      )}
    </div>
  );
}
