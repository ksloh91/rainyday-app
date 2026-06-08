"use client";

type ReminderPopupProps = {
  open: boolean;
  title: string;
  body: string;
  onLog: () => void;
  onDismiss: () => void;
};

export function ReminderPopup({
  open,
  title,
  body,
  onLog,
  onDismiss,
}: ReminderPopupProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-popup-title"
    >
      <button
        type="button"
        aria-label="Dismiss reminder"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onDismiss}
      />
      <div className="reminder-popup-enter relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pb-8 pt-8 text-center text-white">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
              aria-hidden
            >
              <path d="M12 8v4l3 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-100">
            Expense reminder
          </p>
          <h2
            id="reminder-popup-title"
            className="mt-1 text-xl font-bold leading-snug"
          >
            {title}
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {body}
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onLog}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white active:bg-emerald-700"
            >
              Log expense now
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl py-3 text-sm font-medium text-zinc-500 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
