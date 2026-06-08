"use client";

import { useEffect, useState } from "react";
import {
  dismissInAppLogNudge,
  shouldShowInAppLogNudge,
} from "@/lib/reminders";

type HomeLogNudgeProps = {
  hasLoggedToday: boolean;
  onAdd: () => void;
};

export function HomeLogNudge({ hasLoggedToday, onAdd }: HomeLogNudgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowInAppLogNudge(hasLoggedToday));
  }, [hasLoggedToday]);

  if (!visible) return null;

  function dismiss() {
    dismissInAppLogNudge();
    setVisible(false);
  }

  return (
    <div className="home-empty-state flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 8v4l3 2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
          Nothing logged today yet
        </p>
        <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-200/80">
          A quick log now keeps your day accurate.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-amber-700"
          >
            Log expense
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-800 active:bg-amber-100 dark:text-amber-200 dark:active:bg-amber-900/40"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
