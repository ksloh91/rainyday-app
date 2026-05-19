"use client";

type Tab = "home" | "insights" | "more";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAdd: () => void;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function InsightsIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
      />
    </svg>
  );
}

export function BottomNav({ activeTab, onTabChange, onAdd }: BottomNavProps) {
  const tabClass = (active: boolean) =>
    active
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-zinc-500 dark:text-zinc-400";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-end justify-around px-1 pb-1">
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 py-1 ${tabClass(activeTab === "home")}`}
        >
          <HomeIcon active={activeTab === "home"} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("insights")}
          className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 py-1 ${tabClass(activeTab === "insights")}`}
        >
          <InsightsIcon active={activeTab === "insights"} />
          <span className="text-[10px] font-medium">Insights</span>
        </button>

        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add transaction"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-white transition active:scale-95 dark:ring-zinc-950"
          >
            <svg
              aria-hidden
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          <span className="mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Add
          </span>
        </div>

        <button
          type="button"
          onClick={() => onTabChange("more")}
          className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 py-1 ${tabClass(activeTab === "more")}`}
        >
          <MoreIcon active={activeTab === "more"} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}

export type { Tab };
