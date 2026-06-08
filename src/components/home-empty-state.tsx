"use client";

import { SvgIcon } from "@/components/icons/svg-icon";

type HomeEmptyStateProps = {
  /** No transactions at all vs none today only */
  variant: "no-transactions" | "quiet-today";
};

function WalletIllustration() {
  return (
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
      <SvgIcon size={32}>
        <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
        <path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
        <circle cx="17" cy="13" r="1.25" fill="currentColor" stroke="none" />
      </SvgIcon>
    </span>
  );
}

function CalendarIllustration() {
  return (
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <SvgIcon size={32}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M9 14h2M13 14h2" />
      </SvgIcon>
    </span>
  );
}

export function HomeEmptyState({ variant }: HomeEmptyStateProps) {
  const isFresh = variant === "no-transactions";

  return (
    <div className="home-empty-state rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
      {isFresh ? <WalletIllustration /> : <CalendarIllustration />}
      <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {isFresh ? "Your wallet is ready" : "Nothing logged today"}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {isFresh
          ? "Tap Add to record your first transaction."
          : "Older activity appears below — or tap Add for today."}
      </p>
    </div>
  );
}
